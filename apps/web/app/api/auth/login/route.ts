import { NextRequest, NextResponse } from 'next/server';
import { findUserByCiHash, syncAdminFlagByPhone } from '@theone/db';
import { openIdentity } from '@/lib/identity-token';
import { issueSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login
 * body: { idToken }  (KCB/PortOne 본인인증 결과의 봉인 토큰 — 가입 때와 동일)
 *
 * 로그인은 비밀번호 없이 휴대폰 본인인증으로 일원화한다. 인증으로 받은 idToken 을
 * 서버가 열어 ciHash 를 복원하고, 그 해시로 기존 회원을 찾는다.
 *  - 토큰 무효/만료 → 401
 *  - 해당 ciHash 회원 없음·탈퇴 → 404 not_member (가입 심사 신청 유도)
 *  - 정지(suspended) → 403
 * 성공 시 세션 토큰을 발급해 이후 보호 API 를 호출자 본인으로 인증한다(IDOR 차단).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { idToken?: string } | null;
  if (!body?.idToken) {
    return NextResponse.json({ ok: false, reason: 'missing_token' }, { status: 400 });
  }

  const sealed = openIdentity(body.idToken);
  if (!sealed?.ciHash) {
    return NextResponse.json({ ok: false, reason: 'invalid_token' }, { status: 401 });
  }

  try {
    const user = await findUserByCiHash(sealed.ciHash);
    if (!user || user.status === 'withdrawn') {
      return NextResponse.json({ ok: false, reason: 'not_member' }, { status: 404 });
    }
    if (user.status === 'suspended') {
      return NextResponse.json({ ok: false, reason: 'suspended' }, { status: 403 });
    }
    // 운영자 지정 번호(ADMIN_PHONES)면 로그인 시점에 isAdmin 을 맞춘다.
    const isAdmin = await syncAdminFlagByPhone(user.id, user.phone, user.isAdmin);
    const token = issueSession(user.id);
    return NextResponse.json({
      ok: true,
      userId: user.id,
      status: user.status,
      gender: user.gender,
      isAdmin,
      token,
    });
  } catch (e) {
    console.error('[auth/login] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
