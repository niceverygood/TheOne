import { NextRequest, NextResponse } from 'next/server';
import { getContactStatus } from '@theone/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/contact/status?matchId=&userId= — 연락처 오픈 상태(상대 번호는 공개 완료 시).
 */
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get('matchId')?.trim();
  const userId = req.nextUrl.searchParams.get('userId')?.trim();
  if (!matchId || !userId) {
    return NextResponse.json({ ok: false, reason: 'validation' }, { status: 400 });
  }
  try {
    const status = await getContactStatus(matchId, userId);
    return NextResponse.json({ ok: true, ...status });
  } catch (e) {
    const reason = (e as Error).message;
    const code = reason === 'forbidden' ? 403 : reason === 'match_not_found' ? 404 : 500;
    return NextResponse.json({ ok: false, reason }, { status: code });
  }
}
