import { NextRequest, NextResponse } from 'next/server';
import { listReportQueue } from '@theone/db';
import { requireMobileAdmin } from '@/lib/mobile-admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/mobile/reports — 미처리 신고 큐(피신고자별 누적, 앱 내 관리자 화면). */
export async function GET(req: NextRequest) {
  const adminId = await requireMobileAdmin(req);
  if (!adminId) return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });

  try {
    const queue = await listReportQueue();
    return NextResponse.json({
      ok: true,
      queue: queue.map((q) => ({
        userId: q.user.id,
        gender: q.user.gender,
        jobCategory: q.user.jobCategory,
        status: q.user.status,
        suspendCount: q.user.suspendCount,
        count: q.count,
        categories: q.reports.map((r) => r.category),
      })),
    });
  } catch (e) {
    console.error('[admin/mobile/reports GET] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
