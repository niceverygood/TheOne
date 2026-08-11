import { NextRequest, NextResponse } from 'next/server';
import { prisma, approveMembership } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function gateOk(req: NextRequest): boolean {
  const gate = process.env.QA_SEED_TOKEN;
  return !!gate && req.headers.get('x-gen-token') === gate;
}

/**
 * POST /api/admin/find-by-phone
 * body: { phoneContains, approve?: boolean, makeAdmin?: boolean }
 * 특정 실회원을 전화번호 뒷자리로 조회 → 필요 시 심사 승인 + 앱 내 관리자 권한(User.isAdmin) 부여.
 * 일회성 운영 작업용 — QA_SEED_TOKEN 지우면 비활성.
 */
export async function POST(req: NextRequest) {
  if (!gateOk(req)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as {
    phoneContains?: unknown;
    approve?: unknown;
    makeAdmin?: unknown;
  } | null;
  const phoneContains = typeof body?.phoneContains === 'string' ? body.phoneContains : null;
  if (!phoneContains || phoneContains.length < 6) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { phone: { contains: phoneContains } },
      select: {
        id: true,
        phone: true,
        status: true,
        gender: true,
        jobCategory: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        birth: true,
        profile: { select: { region: true, surveyAnswers: true } },
      },
    });
    if (!user) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });

    const statusBefore = user.status;
    const isAdminBefore = user.isAdmin;
    if (body?.approve && user.status !== 'active') {
      await approveMembership(user.id);
    }
    if (body?.makeAdmin && !user.isAdmin) {
      await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
    }

    // 큐레이션이 비는 이유 진단 — 후보 풀은 '활성·이성·생년 있음'이고,
    // 뷰어 쪽은 생년이 없으면 매칭 자체가 성립하지 않는다(matching.loadUserForMatch).
    const statusNow = body?.approve ? 'active' : user.status;
    const poolSize = await prisma.user.count({
      where: {
        status: 'active',
        gender: user.gender === 'male' ? 'female' : 'male',
        id: { not: user.id },
        birth: { not: null },
        email: { not: { startsWith: 'qa_' } },
      },
    });
    const blockers: string[] = [];
    if (statusNow !== 'active') blockers.push('가입 심사 미승인(status)');
    if (!user.birth) blockers.push('생년 없음 — 나이 필터가 성립하지 않아 후보 0명');
    if (!user.profile?.region) blockers.push('거주 지역 없음 — 기본값 서울로 간주됨');
    if (poolSize === 0) blockers.push('이성 활성 회원 풀 0명');

    return NextResponse.json({
      ok: true,
      user: {
        ...user,
        statusBefore,
        statusNow,
        isAdminBefore,
        isAdminNow: body?.makeAdmin ? true : user.isAdmin,
      },
      curation: {
        hasBirth: !!user.birth,
        region: user.profile?.region ?? null,
        surveyAnswered: user.profile?.surveyAnswers?.length ?? 0,
        oppositeGenderActivePool: poolSize,
        blockers,
      },
    });
  } catch (e) {
    console.error('[find-by-phone] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
