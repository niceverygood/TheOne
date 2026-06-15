/**
 * 크레딧/결제 (Phase 5). PortOne 결제는 apps/web API가 호출.
 * 환불 가능액 산정은 packages/shared(refundableAmount)를 사용.
 */
import { prisma } from './index';
import {
  getPackage,
  refundableAmount,
  LETTER_COST,
  isLetterFreeFor,
  VERIFY_REWARD_CREDITS,
  type VerificationType,
} from '@theone/shared';
import type { Prisma } from '@prisma/client';
import { grantFirstPurchaseReward, clawbackReward } from './referral';

export class InsufficientCreditError extends Error {
  constructor() {
    super('INSUFFICIENT_CREDIT');
    this.name = 'InsufficientCreditError';
  }
}

/** 현재 크레딧 잔액 조회 (없으면 0). */
export async function getCreditBalance(userId: string): Promise<number> {
  const credit = await prisma.credit.findUnique({ where: { userId }, select: { balance: true } });
  return credit?.balance ?? 0;
}

/** 충전 주문 생성 (pending) */
export async function createOrder(userId: string, packageId: string, provider = 'portone') {
  const pkg = getPackage(packageId);
  if (!pkg) throw new Error('UNKNOWN_PACKAGE');
  return prisma.order.create({
    data: {
      userId,
      packageId,
      amountWon: pkg.won,
      credits: pkg.credits,
      baseCredits: pkg.baseCredits,
      provider,
      status: 'pending',
    },
  });
}

/** 결제 성공 처리 — 주문 paid + 크레딧 적립 + 트랜잭션 + (첫 결제면) 추천 보상 (멱등). */
export async function markOrderPaid(orderId: string, paymentId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (order.status === 'paid') return order; // 멱등

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'paid', paymentId, paidAt: new Date() },
    });
    await tx.credit.upsert({
      where: { userId: order.userId },
      create: { userId: order.userId, balance: order.credits },
      update: { balance: { increment: order.credits } },
    });
    await tx.creditTransaction.create({
      data: { userId: order.userId, delta: order.credits, reason: 'charge', refId: orderId },
    });
    // 첫 결제 추천 보상 — 피추천인×first_purchase 1회(멱등). 두 번째 결제부터는 no-op.
    await grantFirstPurchaseReward(order.userId, orderId, order.credits, tx);
  });
  return prisma.order.findUnique({ where: { id: orderId } });
}

/** 환불 — 정책(7일·미사용분)에 따라 금액 산정 후 주문/잔액 반영. */
export async function refundOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== 'paid') throw new Error('NOT_REFUNDABLE');
  const credit = await prisma.credit.findUnique({ where: { userId: order.userId } });
  const daysSince = (Date.now() - (order.paidAt ?? order.createdAt).getTime()) / 86400000;

  const won = refundableAmount({
    paidWon: order.amountWon,
    baseCredits: order.baseCredits,
    remainingCredits: credit?.balance ?? 0,
    daysSinceCharge: daysSince,
  });
  if (won <= 0) return { refundedWon: 0, order };

  // 환불 크레딧 = 환불 비율만큼 차감
  const refundCredits = Math.min(credit?.balance ?? 0, order.baseCredits);
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: won >= order.amountWon ? 'refunded' : 'partial_refunded', refundedWon: won },
    });
    await tx.credit.update({
      where: { userId: order.userId },
      data: { balance: { decrement: refundCredits } },
    });
    await tx.creditTransaction.create({
      data: { userId: order.userId, delta: -refundCredits, reason: 'refund', refId: orderId },
    });
    // 이 주문으로 나간 첫결제 추천 보상 회수
    await clawbackReward({
      refereeId: order.userId,
      type: 'first_purchase',
      expectRefId: orderId,
      tx,
    });
  });
  return { refundedWon: won, order };
}

/**
 * 추가 인증 승인 보상 — 타입별 차등 크레딧 적립(reason=verify_reward, refId=applicationId).
 * applicationId 기준 멱등: 같은 신청에 이미 보상이 나갔으면 0 반환(재승인 중복지급 방지).
 *
 * `tx` 를 받으면 호출자의 트랜잭션 안에서 실행한다(approveApplication 과 원자성 보장).
 */
export async function awardVerificationReward(
  userId: string,
  type: VerificationType,
  applicationId: string,
  tx: Prisma.TransactionClient = prisma,
): Promise<{ awarded: number }> {
  const amount = VERIFY_REWARD_CREDITS[type] ?? 0;
  if (amount <= 0) return { awarded: 0 };

  const already = await tx.creditTransaction.findFirst({
    where: { reason: 'verify_reward', refId: applicationId },
    select: { id: true },
  });
  if (already) return { awarded: 0 };

  await tx.credit.upsert({
    where: { userId },
    create: { userId, balance: amount },
    update: { balance: { increment: amount } },
  });
  await tx.creditTransaction.create({
    data: { userId, delta: amount, reason: 'verify_reward', refId: applicationId },
  });
  return { awarded: amount };
}

/**
 * 신청서 발송 시 크레딧 차감 (일반 20C / 슈퍼 50C).
 * 파운딩 정책: 여성은 무료 — 차감·잔액검사 없이 통과(콜드스타트 여성 풀 확보, credits.ts WOMEN_LETTER_FREE).
 */
export async function spendForLetter(
  userId: string,
  isSuper: boolean,
  refId?: string,
  tx?: Prisma.TransactionClient,
): Promise<{ spent: number; free: boolean }> {
  const db = tx ?? prisma;
  const user = await db.user.findUnique({ where: { id: userId }, select: { gender: true } });
  if (isLetterFreeFor(user?.gender)) {
    return { spent: 0, free: true }; // 무료 회원: 차감 없음(별도 원장 기록 불필요)
  }

  const cost = isSuper ? LETTER_COST.super : LETTER_COST.normal;
  const credit = await db.credit.findUnique({ where: { userId } });
  if (!credit || credit.balance < cost) throw new InsufficientCreditError();

  const apply = async (c: Prisma.TransactionClient) => {
    await c.credit.update({ where: { userId }, data: { balance: { decrement: cost } } });
    await c.creditTransaction.create({
      data: { userId, delta: -cost, reason: isSuper ? 'super_letter' : 'letter', refId },
    });
  };
  if (tx) await apply(tx);
  else await prisma.$transaction((c) => apply(c));
  return { spent: cost, free: false };
}
