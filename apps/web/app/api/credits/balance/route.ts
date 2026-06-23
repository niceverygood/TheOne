import { NextRequest, NextResponse } from 'next/server';
import { getCreditBalance } from '@theone/db';
import { authUserId } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/credits/balance — 현재 크레딧 잔액 조회. 충전 화면이 표시·갱신에 사용.
 */
export async function GET(req: NextRequest) {
  const userId = authUserId(req);
  if (!userId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  try {
    const balance = await getCreditBalance(userId);
    return NextResponse.json({ ok: true, balance });
  } catch (e) {
    console.error('[credits/balance] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
