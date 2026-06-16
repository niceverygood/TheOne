import { NextRequest, NextResponse } from 'next/server';
import { sendLetter, InsufficientCreditError } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KNOWN = [
  'cannot_letter_self',
  'letter_too_short',
  'blocked',
  'already_sent',
  'sender_inactive',
];

/**
 * POST /api/letter/send
 * body: { fromId, toId, letter, isSuper? }
 * 만남 신청서 발송. 크레딧 차감(여성 무료) + Match(pending) 생성을 원자적으로 처리.
 * 모바일 신청서 화면의 '신청서 보내기' 진입점.
 */
export async function POST(req: NextRequest) {
  let body: { fromId?: string; toId?: string; letter?: string; isSuper?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_json' }, { status: 400 });
  }

  const { fromId, toId, letter, isSuper } = body;
  if (!fromId || !toId || !letter) {
    return NextResponse.json({ ok: false, reason: 'missing' }, { status: 400 });
  }

  try {
    const result = await sendLetter({ fromId, toId, letter, isSuper: !!isSuper });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof InsufficientCreditError) {
      return NextResponse.json({ ok: false, reason: 'insufficient_credit' }, { status: 402 });
    }
    const msg = e instanceof Error ? e.message : 'server';
    if (KNOWN.includes(msg)) {
      return NextResponse.json({ ok: false, reason: msg }, { status: 400 });
    }
    console.error('[letter/send] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
