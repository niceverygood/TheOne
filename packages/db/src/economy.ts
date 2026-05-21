/**
 * 크레딧/결제 (Phase 5). PortOne 결제는 apps/web API가 호출.
 * 환불 가능액 산정은 packages/shared(refundableAmount)를 사용.
 */
import { prisma } from './index';
import { getPackage, refundableAmount, LETTER_COST } from '@theone/shared';

export class InsufficientCreditError extends Error {
  constructor() {
    super('INSUFFICIENT_CREDIT');
    this.name = 'InsufficientCreditError';
  }
}

/** 충전 주문 생성 (pending) */
export async function createOrder(userId: string, packageId: string) {
  const pkg = getPackage(packageId);
  if (!pkg) throw new Error('UNKNOWN_PACKAGE');
  return prisma.order.create({
    data: {
      userId,
      packageId,
      amountWon: pkg.won,
      credits: pkg.credits + pkg.bonus,
      baseCredits: pkg.credits,
      status: 'pending',
    },
  });
}

/** 결제 성공 처리 — 주문 paid + 크레딧 적립 + 트랜잭션 (멱등). */
export async function markOrderPaid(orderId: string, paymentId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (order.status === 'paid') return order; // 멱등

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid', paymentId, paidAt: new Date() },
    }),
    prisma.credit.upsert({
      where: { userId: order.userId },
      create: { userId: order.userId, balance: order.credits },
      update: { balance: { increment: order.credits } },
    }),
    prisma.creditTransaction.create({
      data: { userId: order.userId, delta: order.credits, reason: 'charge', refId: orderId },
    }),
  ]);
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
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: won >= order.amountWon ? 'refunded' : 'partial_refunded', refundedWon: won },
    }),
    prisma.credit.update({
      where: { userId: order.userId },
      data: { balance: { decrement: refundCredits } },
    }),
    prisma.creditTransaction.create({
      data: { userId: order.userId, delta: -refundCredits, reason: 'refund', refId: orderId },
    }),
  ]);
  return { refundedWon: won, order };
}

/** 신청서 발송 시 크레딧 차감 (일반 20C / 슈퍼 50C) */
export async function spendForLetter(userId: string, isSuper: boolean, refId?: string) {
  const cost = isSuper ? LETTER_COST.super : LETTER_COST.normal;
  const credit = await prisma.credit.findUnique({ where: { userId } });
  if (!credit || credit.balance < cost) throw new InsufficientCreditError();
  await prisma.$transaction([
    prisma.credit.update({ where: { userId }, data: { balance: { decrement: cost } } }),
    prisma.creditTransaction.create({
      data: { userId, delta: -cost, reason: isSuper ? 'super_letter' : 'letter', refId },
    }),
  ]);
  return { spent: cost };
}
