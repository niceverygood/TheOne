import { NextRequest, NextResponse } from 'next/server';
import { saveUserPushToken } from '@theone/db';
import { authUserId } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/push/register  body: { token: string | null }
 * 카드 도착 알림(12·15·20시)을 받을 Expo 푸시 토큰을 회원에 저장한다.
 * token 이 비면 해제(기기 알림 거부·로그아웃).
 */
export async function POST(req: NextRequest) {
  const userId = authUserId(req);
  if (!userId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === 'string' ? body.token.trim() : null;
  if (token && !/^Expo(nent)?PushToken\[.+\]$/.test(token)) {
    return NextResponse.json({ ok: false, reason: 'invalid_token' }, { status: 400 });
  }

  try {
    await saveUserPushToken(userId, token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[push/register] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
