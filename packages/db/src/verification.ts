/**
 * 인증 심사 데이터 액세스 — 심사 콘솔(admin)·제출(web) 공유.
 * 모든 서류 열람/처리는 AccessLog 기록을 동반한다 (privacy-design §2-4).
 */
import { prisma } from './index';
import { SLA_URGENT_HOURS } from '@theone/shared';
import { awardVerificationReward } from './economy';
import type {
  AccessAction,
  Operator,
  OperatorRole,
  Prisma,
  VerificationType,
} from '@prisma/client';

const SLA_HOURS = 24;
const BADGE_VALID_DAYS = 365;

export function slaDueFrom(submittedAt: Date = new Date()): Date {
  return new Date(submittedAt.getTime() + SLA_HOURS * 3600_000);
}

export function badgeExpiryFrom(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + BADGE_VALID_DAYS);
  return d;
}

// ---- 운영자 ----

export async function getOperatorByUsername(username: string): Promise<Operator | null> {
  return prisma.operator.findUnique({ where: { username } });
}

/** 운영자 등록/역할 변경 — Basic Auth 계정을 실제 심사 권한(Operator)에 연결한다. */
export async function upsertOperator(
  username: string,
  name: string,
  role: OperatorRole,
): Promise<Operator> {
  return prisma.operator.upsert({
    where: { username },
    create: { username, name, role, active: true },
    update: { name, role, active: true },
  });
}

/** 앱 내 관리자(User.isAdmin)용 운영자 계정 username 규칙 — 웹 Basic Auth 계정과 네임스페이스 분리. */
export function appOperatorUsername(userId: string): string {
  return `app:${userId}`;
}

/**
 * 앱 내 관리자를 심사 운영자(Operator)에 1:1 매핑한다.
 * 인증 심사는 reviewerId·AccessLog.operatorId 가 필수(FK)라, 앱에서 처리한 심사도
 * 동일한 감사 추적에 남기기 위해 계정을 한 번만 만들어 재사용한다.
 *
 * 이미 있으면 그대로 반환 — role/active 를 덮어쓰지 않는다. 따라서 웹 콘솔에서
 * `active=false` 로 내리거나 role 을 조정하면 앱 심사 권한도 즉시 회수된다.
 */
export async function ensureAppOperator(userId: string, seq: number): Promise<Operator> {
  const username = appOperatorUsername(userId);
  const existing = await prisma.operator.findUnique({ where: { username } });
  if (existing) return existing;
  return prisma.operator.create({
    data: { username, name: `앱 관리자 #${seq}`, role: 'reviewer', active: true },
  });
}

// ---- AccessLog ----

export async function recordAccess(input: {
  operatorId: string;
  action: AccessAction;
  targetUserId?: string;
  documentId?: string;
  applicationId?: string;
  ip?: string;
}): Promise<void> {
  await prisma.accessLog.create({ data: input });
}

// ---- 신청 ----

/** 심사 대기열 — SLA 임박순(가까운 마감 먼저). reviewing/submitted 만. */
export async function listReviewQueue(opts?: { type?: VerificationType; take?: number }) {
  return prisma.verificationApplication.findMany({
    where: {
      status: { in: ['submitted', 'reviewing'] },
      ...(opts?.type ? { type: opts.type } : {}),
    },
    orderBy: { slaDueAt: 'asc' },
    take: opts?.take ?? 200,
    include: {
      user: { select: { id: true, gender: true, jobCategory: true } },
      documents: { select: { id: true, label: true } },
    },
  });
}

export async function getApplication(id: string) {
  return prisma.verificationApplication.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, gender: true, jobCategory: true, birth: true } },
      documents: true,
      reviewer: { select: { id: true, name: true } },
    },
  });
}

export interface QueueStats {
  pending: number;
  /** SLA 마감 임박(6h 이내) 또는 초과 */
  urgent: number;
  approvedToday: number;
  rejectedToday: number;
}

export async function getQueueStats(): Promise<QueueStats> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const soon = new Date(now.getTime() + SLA_URGENT_HOURS * 3600_000);
  const [pending, urgent, approvedToday, rejectedToday] = await Promise.all([
    prisma.verificationApplication.count({ where: { status: { in: ['submitted', 'reviewing'] } } }),
    prisma.verificationApplication.count({
      where: { status: { in: ['submitted', 'reviewing'] }, slaDueAt: { lte: soon } },
    }),
    prisma.verificationApplication.count({
      where: { status: 'approved', reviewedAt: { gte: startOfToday } },
    }),
    prisma.verificationApplication.count({
      where: { status: 'rejected', reviewedAt: { gte: startOfToday } },
    }),
  ]);
  return { pending, urgent, approvedToday, rejectedToday };
}

/**
 * 승인 — 신청 상태 변경 + 뱃지 upsert + 인앱화폐 보상 지급 + AccessLog.
 * reviewer 이상만 호출(상위에서 검증). 보상은 applicationId 기준 멱등(재승인 중복지급 없음).
 * @returns 이번 승인으로 지급된 보상 크레딧(이미 지급됐거나 재승인이면 0)
 */
export async function approveApplication(args: {
  applicationId: string;
  operatorId: string;
  ip?: string;
}): Promise<{ rewardCredits: number }> {
  const app = await prisma.verificationApplication.findUnique({
    where: { id: args.applicationId },
  });
  if (!app) throw new Error('APPLICATION_NOT_FOUND');

  return prisma.$transaction(async (tx) => {
    await tx.verificationApplication.update({
      where: { id: app.id },
      data: {
        status: 'approved',
        reviewerId: args.operatorId,
        reviewedAt: new Date(),
        rejectReason: null,
      },
    });
    await tx.verificationBadge.upsert({
      where: { userId_type: { userId: app.userId, type: app.type } },
      create: {
        userId: app.userId,
        type: app.type,
        valueTier: app.valueTier,
        expiresAt: badgeExpiryFrom(),
      },
      update: { valueTier: app.valueTier, verifiedAt: new Date(), expiresAt: badgeExpiryFrom() },
    });
    await tx.accessLog.create({
      data: {
        operatorId: args.operatorId,
        action: 'approve',
        applicationId: app.id,
        targetUserId: app.userId,
        ip: args.ip,
      },
    });
    // 인앱화폐 보상 — 타입별 차등, applicationId 멱등.
    const { awarded } = await awardVerificationReward(app.userId, app.type, app.id, tx);
    return { rewardCredits: awarded };
  });
}

/** 반려 — 사유 기록 + AccessLog. */
export async function rejectApplication(args: {
  applicationId: string;
  operatorId: string;
  reason: string;
  ip?: string;
}): Promise<void> {
  const app = await prisma.verificationApplication.findUnique({
    where: { id: args.applicationId },
  });
  if (!app) throw new Error('APPLICATION_NOT_FOUND');

  await prisma.$transaction([
    prisma.verificationApplication.update({
      where: { id: app.id },
      data: {
        status: 'rejected',
        reviewerId: args.operatorId,
        reviewedAt: new Date(),
        rejectReason: args.reason,
      },
    }),
    prisma.accessLog.create({
      data: {
        operatorId: args.operatorId,
        action: 'reject',
        applicationId: app.id,
        targetUserId: app.userId,
        ip: args.ip,
      },
    }),
  ]);
}

/** 사용자 인증 현황 (web 상태추적용) */
export async function getUserVerifications(userId: string) {
  const [applications, badges] = await Promise.all([
    prisma.verificationApplication.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      include: { documents: { select: { id: true, label: true } } },
    }),
    prisma.verificationBadge.findMany({ where: { userId } }),
  ]);
  return { applications, badges };
}

/** 신청 생성 (web 제출) */
export async function createApplication(args: {
  userId: string;
  type: VerificationType;
  valueTier?: string;
  documents: { s3Key: string; label: string; mime: string; size: number; sha256: string }[];
}) {
  return prisma.verificationApplication.create({
    data: {
      userId: args.userId,
      type: args.type,
      valueTier: args.valueTier,
      slaDueAt: slaDueFrom(),
      documents: { create: args.documents },
    },
    include: { documents: true },
  });
}

export type { Operator, OperatorRole, Prisma };
