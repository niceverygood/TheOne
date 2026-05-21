/**
 * Trust & Safety (Phase 5) — 신고/차단/강퇴 (trust-safety.md §3-2).
 * 신고 누적 3회 시 자동 일시정지.
 */
import { prisma } from './index';
import type { ReportCategory } from '@prisma/client';

export const AUTO_SUSPEND_THRESHOLD = 3;

/** 신고 접수 → 누적 3회면 자동 일시정지 */
export async function createReport(args: {
  reporterId: string;
  reportedId: string;
  category: ReportCategory;
  detail?: string;
}) {
  const report = await prisma.reportLog.create({ data: args });

  const openCount = await prisma.reportLog.count({
    where: { reportedId: args.reportedId, handledAt: null },
  });

  let autoSuspended = false;
  if (openCount >= AUTO_SUSPEND_THRESHOLD) {
    const target = await prisma.user.findUnique({ where: { id: args.reportedId } });
    if (target && target.status === 'active') {
      await prisma.user.update({
        where: { id: args.reportedId },
        data: { status: 'suspended', suspendCount: { increment: 1 } },
      });
      autoSuspended = true;
    }
  }
  return { report, openCount, autoSuspended };
}

/** 운영자 수동 정지/강퇴 */
export async function moderateUser(args: {
  userId: string;
  action: 'suspend' | 'ban' | 'reinstate';
}) {
  const status =
    args.action === 'ban' ? 'withdrawn' : args.action === 'suspend' ? 'suspended' : 'active';
  return prisma.user.update({
    where: { id: args.userId },
    data: {
      status,
      ...(args.action === 'suspend' ? { suspendCount: { increment: 1 } } : {}),
      ...(args.action === 'ban' ? { withdrawnAt: new Date() } : {}),
    },
  });
}

/** 신고 처리 완료 표시 */
export async function resolveReports(reportedId: string) {
  await prisma.reportLog.updateMany({
    where: { reportedId, handledAt: null },
    data: { handledAt: new Date() },
  });
}

/** 신고 큐 — 미처리 신고를 피신고자별로 묶어 누적순 정렬 */
export async function listReportQueue() {
  const grouped = await prisma.reportLog.groupBy({
    by: ['reportedId'],
    where: { handledAt: null },
    _count: { reportedId: true },
    orderBy: { _count: { reportedId: 'desc' } },
    take: 100,
  });
  const ids = grouped.map((g) => g.reportedId);
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, gender: true, jobCategory: true, status: true, suspendCount: true },
  });
  const recent = await prisma.reportLog.findMany({
    where: { reportedId: { in: ids }, handledAt: null },
    orderBy: { createdAt: 'desc' },
  });
  return grouped.map((g) => ({
    user: users.find((u) => u.id === g.reportedId)!,
    count: g._count.reportedId,
    reports: recent.filter((r) => r.reportedId === g.reportedId),
  }));
}
