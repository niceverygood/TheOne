import { NextRequest, NextResponse } from 'next/server';
import { prisma, qaTestEmail } from '@theone/db';
import { issueSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/test-login
 * body: { gender: 'male'|'female', secret }
 *
 * QA 검수용 남/여 테스트 계정 로그인 — KCB 본인인증 없이 고정 시드 계정(qa_male/qa_female@theone.app)
 * 세션을 발급한다. QA_TEST_LOGIN_SECRET 미설정 시 라우트 자체가 비활성(운영 종료 시 env만 지우면 됨).
 * 실회원 큐레이션 풀에는 노출되지 않는다(matching.ts email qa_ 접두사 필터).
 */
export async function POST(req: NextRequest) {
  const secretEnv = process.env.QA_TEST_LOGIN_SECRET;
  if (!secretEnv) {
    return NextResponse.json({ ok: false, reason: 'disabled' }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { gender?: string; secret?: string } | null;
  if (body?.secret !== secretEnv) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }
  const gender = body?.gender === 'male' || body?.gender === 'female' ? body.gender : null;
  if (!gender) {
    return NextResponse.json({ ok: false, reason: 'invalid_gender' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: qaTestEmail(gender) } });
  if (!user) {
    return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });
  }

  const token = issueSession(user.id);
  return NextResponse.json({
    ok: true,
    userId: user.id,
    status: user.status,
    gender: user.gender,
    token,
  });
}
