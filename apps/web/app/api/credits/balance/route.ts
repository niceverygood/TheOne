import { NextRequest, NextResponse } from 'next/server';
import { getCreditBalance } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/credits/balance?userId=...
 * 현재 크레딧 잔액 조회. 충전 화면이 표시·갱신에 사용.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ ok: false, reason: 'missing_userId' }, { status: 400 });
  try {
    const balance = await getCreditBalance(userId);
    return NextResponse.json({ ok: true, balance });
  } catch (e) {
    console.error('[credits/balance] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
