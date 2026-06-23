import { NextRequest, NextResponse } from 'next/server';
import { requestContactOpen, InsufficientCreditError } from '@theone/db';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

const KNOWN = ['match_not_found', 'forbidden', 'match_not_accepted'];

/**
 * POST /api/contact/open
 * body: { matchId, userId }
 * 연락처 오픈 동의(요청). 내 측 동의 기록 + (최초 시) 크레딧 차감.
 * 양측 동의 시 공개(state=opened, otherPhone 반환). 매칭 당사자만 가능.
 */
export async function POST(req: NextRequest) {
  const userId = authUserId(req);
  if (!userId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { matchId?: string } | null;
  if (!body?.matchId) {
    return NextResponse.json({ ok: false, reason: 'missing' }, { status: 400 });
  }
  try {
    const status = await requestContactOpen(body.matchId, userId);
    return NextResponse.json({ ok: true, ...status });
  } catch (e) {
    if (e instanceof InsufficientCreditError) {
      return NextResponse.json({ ok: false, reason: 'insufficient_credit' }, { status: 402 });
    }
    const reason = (e as Error).message;
    const status = reason === 'forbidden' ? 403 : KNOWN.includes(reason) ? 409 : 500;
    return NextResponse.json(
      { ok: false, reason: KNOWN.includes(reason) ? reason : 'server' },
      { status },
    );
  }
}
