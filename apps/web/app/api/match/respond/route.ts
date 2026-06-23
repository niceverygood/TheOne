import { NextRequest, NextResponse } from 'next/server';
import { respondToMatch } from '@theone/db';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

const KNOWN = [
  'match_not_found',
  'forbidden',
  'already_accepted',
  'already_declined',
  'already_ended',
];

/**
 * POST /api/match/respond
 * body: { matchId, userId, action: 'accept' | 'decline' }
 * 받은 신청 수락(→대화 개설) / 거절. 수신자 본인만 가능(respondToMatch 내부 검증).
 */
export async function POST(req: NextRequest) {
  const userId = authUserId(req);
  if (!userId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    matchId?: string;
    action?: string;
  } | null;
  const matchId = body?.matchId;
  const action =
    body?.action === 'decline' ? 'decline' : body?.action === 'accept' ? 'accept' : null;
  if (!matchId || !action) {
    return NextResponse.json({ ok: false, reason: 'missing' }, { status: 400 });
  }
  try {
    const result = await respondToMatch(matchId, userId, action);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const reason = (e as Error).message;
    const status = reason === 'forbidden' ? 403 : KNOWN.includes(reason) ? 409 : 500;
    return NextResponse.json(
      { ok: false, reason: KNOWN.includes(reason) ? reason : 'server' },
      { status },
    );
  }
}
