import { NextRequest, NextResponse } from 'next/server';
import { createReport } from '@theone/db';
import type { ReportCategory } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORIES: ReportCategory[] = [
  'fraud',
  'harassment',
  'external_contact',
  'inappropriate_photo',
  'abuse',
  'impersonation',
  'no_show',
  'other',
];

/**
 * POST /api/safety/report
 * body: { reporterId, reportedId, category, detail? }
 * 신고 접수(trust-safety.md 신고 8종). 누적 3회 시 서버에서 자동 일시정지.
 * 모바일 채팅·프로필 안전 메뉴의 '신고하기' 진입점.
 */
export async function POST(req: NextRequest) {
  let body: {
    reporterId?: string;
    reportedId?: string;
    category?: string;
    detail?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_json' }, { status: 400 });
  }

  const { reporterId, reportedId, category, detail } = body;
  if (!reporterId || !reportedId) {
    return NextResponse.json({ ok: false, reason: 'missing_ids' }, { status: 400 });
  }
  if (!category || !CATEGORIES.includes(category as ReportCategory)) {
    return NextResponse.json({ ok: false, reason: 'bad_category' }, { status: 400 });
  }

  try {
    const result = await createReport({
      reporterId,
      reportedId,
      category: category as ReportCategory,
      detail: detail?.slice(0, 1000),
    });
    return NextResponse.json({
      ok: true,
      reportId: result.report.id,
      autoSuspended: result.autoSuspended,
    });
  } catch (e) {
    console.error('[safety/report] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
