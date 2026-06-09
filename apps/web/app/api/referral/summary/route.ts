import { NextRequest, NextResponse } from 'next/server';
import { getReferralSummary } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/referral/summary?userId=...
 * 본인의 추천 코드 + 현황(가입수·심사통과수·받은 보상 크레딧).
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ ok: false, reason: 'missing_userId' }, { status: 400 });
  try {
    const summary = await getReferralSummary(userId);
    if (!summary) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    console.error('[referral/summary] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
