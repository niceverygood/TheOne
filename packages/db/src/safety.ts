/**
 * Trust & Safety (Phase 5) — 신고/차단/강퇴 (trust-safety.md §3-2).
 * 신고 누적 3회 시 자동 일시정지.
 */
import { prisma } from './index';
import type { ReportCategory } from '@prisma/client';

/** 자동 일시정지 임계값 — '서로 다른 신고자' 수 기준(1명의 반복 신고로는 트리거되지 않음). */
export const AUTO_SUSPEND_THRESHOLD = 3;

/**
 * 신고 접수 → 서로 다른 신고자 3명 이상이면 자동 일시정지.
 * 보복 무기화 방지: (1) 같은 신고자의 같은 대상 미처리 신고는 중복 생성하지 않고 갱신,
 * (2) 자동정지는 신고 '건수'가 아니라 '서로 다른 신고자 수'로만 판단.
 */
export async function createReport(args: {
  reporterId: string;
  reportedId: string;
  category: ReportCategory;
  detail?: string;
}) {
  if (args.reporterId === args.reportedId) throw new Error('cannot_report_self');

  // 같은 신고자가 같은 대상에 미처리 신고를 이미 했으면 중복 생성 금지(보복성 다중신고 차단).
  const existing = await prisma.reportLog.findFirst({
    where: { reporterId: args.reporterId, reportedId: args.reportedId, handledAt: null },
    select: { id: true },
  });
  const report = existing
    ? await prisma.reportLog.update({
        where: { id: existing.id },
        data: { category: args.category, detail: args.detail },
      })
    : await prisma.reportLog.create({ data: args });

  // 미처리 신고를 올린 '서로 다른 신고자' 수
  const distinct = await prisma.reportLog.findMany({
    where: { reportedId: args.reportedId, handledAt: null },
    distinct: ['reporterId'],
    select: { reporterId: true },
  });
  const reporterCount = distinct.length;

  let autoSuspended = false;
  if (reporterCount >= AUTO_SUSPEND_THRESHOLD) {
    const target = await prisma.user.findUnique({ where: { id: args.reportedId } });
    if (target && target.status === 'active') {
      await prisma.user.update({
        where: { id: args.reportedId },
        data: { status: 'suspended', suspendCount: { increment: 1 } },
      });
      autoSuspended = true;
    }
  }
  return { report, openCount: reporterCount, autoSuspended };
}

/** 사용자 간 차단 — 차단자는 피차단자를 큐레이션·매칭·채팅에서 더 이상 보지 않는다(중복은 무시). */
export async function blockUser(args: { blockerId: string; blockedId: string }) {
  if (args.blockerId === args.blockedId) throw new Error('cannot_block_self');
  return prisma.blockList.upsert({
    where: { blockerId_blockedId: { blockerId: args.blockerId, blockedId: args.blockedId } },
    update: {},
    create: args,
  });
}

/** 차단 해제 */
export async function unblockUser(args: { blockerId: string; blockedId: string }) {
  await prisma.blockList.deleteMany({
    where: { blockerId: args.blockerId, blockedId: args.blockedId },
  });
}

/** 내가 차단했거나 나를 차단한 상대의 id 집합 — 양방향으로 노출에서 제외한다. */
export async function listBlockedIds(userId: string): Promise<string[]> {
  const rows = await prisma.blockList.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const r of rows) ids.add(r.blockerId === userId ? r.blockedId : r.blockerId);
  return [...ids];
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
