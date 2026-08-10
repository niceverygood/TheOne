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

    return NextResponse.json({
      ok: true,
      user: {
        ...user,
        statusBefore,
        statusNow: body?.approve ? 'active' : user.status,
        isAdminBefore,
        isAdminNow: body?.makeAdmin ? true : user.isAdmin,
      },
    });
  } catch (e) {
    console.error('[find-by-phone] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
