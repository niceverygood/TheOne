/**
 * 회원 추천 보상 엔진 (MVP) — 크레딧·1단계·품질 이벤트.
 * 보상은 피추천인×타입 1회(멱등, ReferralReward @@unique). 셀프추천 차단.
 * 클로백: 환불(첫결제 보상)·탈퇴/정지(심사 보상, N일 내) 시 회수.
 */
import { prisma } from './index';
import { referralCodeFromSeq, referralSeqFromCode, REFERRAL_REWARD } from '@theone/shared';
import type { Prisma, ReferralRewardType } from '@prisma/client';

/** 추천 코드 → 추천인 userId. 형식/체크섬 검증 후 seq 로 회원 조회. */
export async function resolveReferrer(code?: string | null): Promise<string | null> {
  if (!code) return null;
  const seq = referralSeqFromCode(code);
  if (seq == null) return null;
  const user = await prisma.user.findUnique({ where: { seq }, select: { id: true } });
  return user?.id ?? null;
}

/** 회원의 공유용 추천 코드 (seq 파생). */
export function referralCodeForSeq(seq: number): string {
  return referralCodeFromSeq(seq);
}

/**
 * 보상 지급 (내부) — referee 의 추천인에게 크레딧 적립 + 원장 기록. 멱등.
 * @returns 지급 크레딧(0 = 추천인 없음/이미 지급/셀프)
 */
async function grant(
  refereeId: string,
  type: ReferralRewardType,
  credits: number,
  refId: string | undefined,
  tx: Prisma.TransactionClient,
): Promise<number> {
  if (credits <= 0) return 0;
  const referee = await tx.user.findUnique({
    where: { id: refereeId },
    select: { referredById: true },
  });
  const referrerId = referee?.referredById;
  if (!referrerId || referrerId === refereeId) return 0;

  try {
    await tx.referralReward.create({
      data: { referrerId, refereeId, type, credits, refId: refId ?? null },
    });
  } catch (e) {
    // @@unique([refereeId, type]) 위반 = 이미 지급 → 멱등 skip
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') return 0;
    throw e;
  }

  await tx.credit.upsert({
    where: { userId: referrerId },
    create: { userId: referrerId, balance: credits },
    update: { balance: { increment: credits } },
  });
  await tx.creditTransaction.create({
    data: { userId: referrerId, delta: credits, reason: 'referral_reward', refId: refereeId },
  });
  return credits;
}

/** 피추천인 가입 심사 통과 시 추천인 보상 (고정 크레딧). */
export async function grantSignupApprovedReward(
  refereeId: string,
  tx: Prisma.TransactionClient = prisma,
): Promise<number> {
  return grant(refereeId, 'signup_approved', REFERRAL_REWARD.signupApprovedCredits, undefined, tx);
}

/** 피추천인 첫 결제 시 추천인 보상 (결제 크레딧 × 비율). */
export async function grantFirstPurchaseReward(
  refereeId: string,
  orderId: string,
  orderCredits: number,
  tx: Prisma.TransactionClient = prisma,
): Promise<number> {
  const credits = Math.floor(orderCredits * REFERRAL_REWARD.firstPurchaseRate);
  return grant(refereeId, 'first_purchase', credits, orderId, tx);
}

/**
 * 보상 회수(클로백) — granted 상태 보상을 회수하고 추천인 잔액 차감.
 * @param within7days true 면 심사 보상은 지급 후 N일 이내일 때만 회수(환불은 항상).
 */
export async function clawbackReward(args: {
  refereeId: string;
  type: ReferralRewardType;
  honorWindow?: boolean;
  /** 지정 시 보상의 refId 와 일치할 때만 회수(환불 주문 매칭용). */
  expectRefId?: string;
  tx?: Prisma.TransactionClient;
}): Promise<number> {
  const tx = args.tx ?? prisma;
  const reward = await tx.referralReward.findUnique({
    where: { refereeId_type: { refereeId: args.refereeId, type: args.type } },
  });
  if (!reward || reward.status !== 'granted') return 0;
  if (args.expectRefId && reward.refId !== args.expectRefId) return 0;

  if (args.honorWindow) {
    const days = (Date.now() - reward.createdAt.getTime()) / 86400000;
    if (days > REFERRAL_REWARD.clawbackDays) return 0; // 유효기간 경과 → 유지
  }

  await tx.referralReward.update({
    where: { id: reward.id },
    data: { status: 'clawed_back', clawedBackAt: new Date() },
  });
  await tx.credit.update({
    where: { userId: reward.referrerId },
    data: { balance: { decrement: reward.credits } },
  });
  await tx.creditTransaction.create({
    data: {
      userId: reward.referrerId,
      delta: -reward.credits,
      reason: 'referral_clawback',
      refId: args.refereeId,
    },
  });
  return reward.credits;
}

/** 추천 현황(본인 화면용) — 코드 + 집계 + 적립 크레딧. */
export async function getReferralSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { seq: true },
  });
  if (!user) return null;

  const [referredCount, approvedCount, rewards] = await Promise.all([
    prisma.user.count({ where: { referredById: userId } }),
    prisma.user.count({ where: { referredById: userId, status: 'active' } }),
    prisma.referralReward.findMany({
      where: { referrerId: userId, status: 'granted' },
      select: { credits: true },
    }),
  ]);
  const earnedCredits = rewards.reduce((s, r) => s + r.credits, 0);

  return {
    code: referralCodeFromSeq(user.seq),
    referredCount, // 내 코드로 가입한 수
    approvedCount, // 그중 심사 통과(active)
    earnedCredits, // 받은 추천 보상 크레딧(유효)
  };
}
