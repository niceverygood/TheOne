import { NextRequest, NextResponse } from 'next/server';
import { prisma, upsertSeedMember, SEED_PERSONAS } from '@theone/db';

/**
 * POST /api/admin/seed-member — 시드 더미 회원 1명을 프로덕션 DB 에 업로드.
 *   본문: { id: 'm1'|'f1'..., photos: string[] (data URI) }
 *   게이트: AI_GEN_TOKEN 설정 + 헤더 x-gen-token 일치. seed_* 계정만 생성한다.
 *   사진(data URI)은 요청 본문으로 받는다(서버엔 파일이 없으므로). 사진당 ~270KB →
 *   회원당 1건씩 호출(함수 본문 한도 회피).
 *
 * GET — 현재 seed_* 회원 수/목록(검증용, 동일 게이트).
 *
 * 시딩 작업이 끝나면 AI_GEN_TOKEN 을 지워 라우트를 죽인다.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function gateOk(req: NextRequest): boolean {
  const gate = process.env.AI_GEN_TOKEN;
  return !!gate && req.headers.get('x-gen-token') === gate;
}

export async function POST(req: NextRequest) {
  if (!process.env.AI_GEN_TOKEN) {
    return NextResponse.json({ ok: false, reason: 'disabled' }, { status: 503 });
  }
  if (!gateOk(req)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { id?: unknown; photos?: unknown } | null;
  const id = typeof body?.id === 'string' ? body.id : '';
  const photos = Array.isArray(body?.photos)
    ? body.photos.filter((p): p is string => typeof p === 'string')
    : [];
  if (!id || !SEED_PERSONAS.some((p) => p.id === id)) {
    return NextResponse.json({ ok: false, reason: 'invalid_id' }, { status: 400 });
  }
  try {
    const result = await upsertSeedMember(id, photos);
    return NextResponse.json({ ok: true, member: result });
  } catch (e) {
    console.error('[seed-member] failed', e);
    return NextResponse.json({ ok: false, reason: 'failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!gateOk(req)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }
  const rows = await prisma.user.findMany({
    where: { email: { startsWith: 'seed_' } },
    select: {
      email: true,
      gender: true,
      profile: { select: { jobDetail: true, photos: true } },
      _count: { select: { badges: true } },
    },
    orderBy: { email: 'asc' },
  });
  return NextResponse.json({
    ok: true,
    count: rows.length,
    members: rows.map((r) => ({
      email: r.email,
      gender: r.gender,
      jobDetail: r.profile?.jobDetail ?? null,
      photos: r.profile?.photos?.length ?? 0,
      badges: r._count.badges,
    })),
  });
}
