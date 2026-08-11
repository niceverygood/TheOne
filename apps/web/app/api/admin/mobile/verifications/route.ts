import { NextRequest, NextResponse } from 'next/server';
import { listReviewQueue, getQueueStats } from '@theone/db';
import { requireMobileReviewer } from '@/lib/mobile-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/mobile/verifications — 인증 심사 대기열 + 현황(앱 내 관리자 화면).
 * SLA 임박순(마감 가까운 것 먼저)으로 정렬된 submitted/reviewing 신청만 반환한다.
 * 서류는 여기서 메타(라벨)만 — 실제 열람은 상세(GET [id])에서 AccessLog 와 함께.
 */
export async function GET(req: NextRequest) {
  const op = await requireMobileReviewer(req);
  if (!op) return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });

  try {
    const [stats, queue] = await Promise.all([getQueueStats(), listReviewQueue()]);
    return NextResponse.json({
      ok: true,
      stats,
      queue: queue.map((a) => ({
        id: a.id,
        type: a.type,
        status: a.status,
        valueTier: a.valueTier,
        gender: a.user.gender,
        jobCategory: a.user.jobCategory,
        submittedAt: a.submittedAt.toISOString(),
        slaDueAt: a.slaDueAt.toISOString(),
        docLabels: a.documents.map((d) => d.label),
      })),
    });
  } catch (e) {
    console.error('[admin/mobile/verifications GET] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
