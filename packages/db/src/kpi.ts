/**
 * 출시 KPI (Phase 6 · ops-runbook.md). 어드민 /kpi 대시보드가 사용.
 * D1/D7 리텐션은 세션 데이터 없이 근사 불가 → 가입 후 활동 전환으로 근사(정밀치는 PostHog).
 */
import { prisma } from './index';

export interface LaunchKpis {
  activeUsers: number;
  totalUsers: number;
  /** 인증 1종 이상 승인 비율(%) */
  verificationCompletionRate: number;
  /** 가입~첫 매칭(accepted) 중앙값 (시간) */
  timeToFirstMatchHours: number | null;
  /** 결제액 합(원) */
  revenueWon: number;
  /** ARPU(원) = 결제액 / 활동 회원 */
  arpu: number;
  matchesAccepted: number;
  lettersSent: number;
  openReports: number;
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export async function getLaunchKpis(): Promise<LaunchKpis> {
  const [totalUsers, activeUsers, verifiedUserGroups, paidAgg, matches, letters, openReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.verificationBadge.groupBy({ by: ['userId'] }),
      prisma.order.aggregate({ where: { status: 'paid' }, _sum: { amountWon: true } }),
      prisma.match.findMany({
        where: { status: 'accepted' },
        select: { createdAt: true, from: { select: { createdAt: true } } },
      }),
      prisma.creditTransaction.count({ where: { reason: { in: ['letter', 'super_letter'] } } }),
      prisma.reportLog.count({ where: { handledAt: null } }),
    ]);

  const verificationCompletionRate =
    activeUsers > 0 ? Math.round((verifiedUserGroups.length / activeUsers) * 100) : 0;

  const ttfm = matches
    .map((m) => (m.createdAt.getTime() - m.from.createdAt.getTime()) / 3_600_000)
    .filter((h) => h >= 0);
  const timeToFirstMatchHours = median(ttfm);

  const revenueWon = paidAgg._sum.amountWon ?? 0;
  const arpu = activeUsers > 0 ? Math.round(revenueWon / activeUsers) : 0;

  return {
    activeUsers,
    totalUsers,
    verificationCompletionRate,
    timeToFirstMatchHours: timeToFirstMatchHours == null ? null : Math.round(timeToFirstMatchHours),
    revenueWon,
    arpu,
    matchesAccepted: matches.length,
    lettersSent: letters,
    openReports,
  };
}
