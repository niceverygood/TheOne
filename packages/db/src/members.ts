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

/** 회원 관리 목록 — 전체 회원(상태·성별 필터). 썸네일은 첫 사진만 포함. */
export async function listManagedMembers(opts?: {
  status?: 'pending' | 'active' | 'suspended' | 'withdrawn';
  gender?: 'male' | 'female';
  take?: number;
}) {
  const rows = await prisma.user.findMany({
    where: {
      ...(opts?.status ? { status: opts.status } : {}),
      ...(opts?.gender ? { gender: opts.gender } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: opts?.take ?? 300,
    select: {
      id: true,
      seq: true,
      gender: true,
      jobCategory: true,
      status: true,
      birth: true,
      email: true,
      createdAt: true,
      profile: {
        select: { region: true, jobDetail: true, photos: true, height: true },
      },
      badges: { select: { type: true } },
      _count: { select: { badges: true } },
    },
  });
  // 목록 페이로드 절감 — 사진은 첫 장만 남긴다.
  return rows.map((r) => ({
    ...r,
    profile: r.profile ? { ...r.profile, photos: r.profile.photos.slice(0, 1) } : null,
  }));
}

/** 회원 상세 — 프로필 전체 + 모든 사진 + 뱃지 + 크레딧. */
export async function getManagedMember(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      seq: true,
      gender: true,
      jobCategory: true,
      status: true,
      birth: true,
      email: true,
      phone: true,
      createdAt: true,
      profile: true,
      badges: { select: { type: true, expiresAt: true } },
      credit: { select: { balance: true } },
    },
  });
}

/** 회원 상태 변경(활성/정지/탈퇴/대기). 운영자 콘솔용. */
export async function setMemberStatus(
  userId: string,
  status: 'pending' | 'active' | 'suspended' | 'withdrawn',
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      status,
      ...(status === 'withdrawn' ? { withdrawnAt: new Date() } : {}),
    },
  });
}

/** 회원 영구 삭제 — 프로필·뱃지 등 연관 데이터 cascade. (더미/시드 정리용) */
export async function deleteMember(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } });
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
