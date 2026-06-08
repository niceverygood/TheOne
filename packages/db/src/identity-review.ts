/**
 * 본인 명의 아님 — 운영자 수동 본인인증 큐 (privacy-design: 고유식별정보=신분증).
 * 신분증 사진은 S3 키만 보관(KMS 암호화). 모든 열람/처리는 AccessLog 를 남긴다.
 */
import { prisma } from './index';
import { DOCUMENT_PURGE_DAYS } from '@theone/shared';

function purgeFrom(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + DOCUMENT_PURGE_DAYS);
  return d;
}

/** 수동 본인인증 요청 생성(접수). */
export async function createManualIdentityRequest(args: {
  name: string;
  phone: string;
  idCardS3Key: string;
  note?: string;
}) {
  return prisma.manualIdentityRequest.create({
    data: {
      name: args.name,
      phone: args.phone,
      idCardS3Key: args.idCardS3Key,
      note: args.note ?? null,
    },
  });
}

/** 대기열 — 접수순(오래된 것 먼저). pending/처리완료 토글. */
export async function listManualIdReviewQueue(opts?: { includeResolved?: boolean; take?: number }) {
  return prisma.manualIdentityRequest.findMany({
    where: opts?.includeResolved ? {} : { status: 'pending' },
    orderBy: { createdAt: 'asc' },
    take: opts?.take ?? 200,
    include: { reviewer: { select: { id: true, name: true } } },
  });
}

export async function getManualIdRequest(id: string) {
  return prisma.manualIdentityRequest.findUnique({ where: { id } });
}

/** 승인 — 본인 확인 완료 + 30일 파기 예약 + AccessLog. */
export async function approveManualId(args: {
  requestId: string;
  operatorId: string;
  ip?: string;
}): Promise<void> {
  await prisma.$transaction([
    prisma.manualIdentityRequest.update({
      where: { id: args.requestId },
      data: {
        status: 'approved',
        reviewerId: args.operatorId,
        reviewedAt: new Date(),
        purgeAt: purgeFrom(),
      },
    }),
    prisma.accessLog.create({
      data: { operatorId: args.operatorId, action: 'approve', ip: args.ip },
    }),
  ]);
}

/** 반려 — 사유 기록 + 30일 파기 예약 + AccessLog. */
export async function rejectManualId(args: {
  requestId: string;
  operatorId: string;
  reason: string;
  ip?: string;
}): Promise<void> {
  await prisma.$transaction([
    prisma.manualIdentityRequest.update({
      where: { id: args.requestId },
      data: {
        status: 'rejected',
        reviewerId: args.operatorId,
        reviewedAt: new Date(),
        rejectReason: args.reason,
        purgeAt: purgeFrom(),
      },
    }),
    prisma.accessLog.create({
      data: { operatorId: args.operatorId, action: 'reject', ip: args.ip },
    }),
  ]);
}
