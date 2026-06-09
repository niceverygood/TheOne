/**
 * 회원 심사(가입 승인) — pending → active. 운영자 콘솔이 호출.
 * 승인 시 추천인 보상(심사 통과)을 함께 지급한다.
 */
import { prisma } from './index';
import { grantSignupApprovedReward, clawbackReward } from './referral';

/** 가입 심사 대기열 (pending 회원) — 추천인 정보 포함. */
export async function listPendingMembers(take = 200) {
  return prisma.user.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take,
    select: {
      id: true,
      seq: true,
      gender: true,
      jobCategory: true,
      createdAt: true,
      referredById: true,
      referredBy: { select: { id: true, seq: true } },
    },
  });
}

/** 심사 통과(활성화) + 추천 보상 지급. 멱등(이미 active면 보상 시도만, 멱등). */
export async function approveMembership(userId: string): Promise<{ rewardCredits: number }> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { status: true } });
    if (!user) throw new Error('USER_NOT_FOUND');
    if (user.status !== 'active') {
      await tx.user.update({ where: { id: userId }, data: { status: 'active' } });
    }
    const rewardCredits = await grantSignupApprovedReward(userId, tx);
    return { rewardCredits };
  });
}

/** 심사 반려/탈퇴/정지 — 심사 보상 클로백(지급 후 N일 이내). */
export async function withdrawMember(
  userId: string,
  nextStatus: 'withdrawn' | 'suspended' = 'withdrawn',
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        status: nextStatus,
        ...(nextStatus === 'withdrawn' ? { withdrawnAt: new Date() } : {}),
      },
    });
    await clawbackReward({ refereeId: userId, type: 'signup_approved', honorWindow: true, tx });
  });
}
