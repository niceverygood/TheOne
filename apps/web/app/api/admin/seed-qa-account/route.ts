import { NextRequest, NextResponse } from 'next/server';
import { upsertQaTestAccount } from '@theone/db';

/**
 * POST /api/admin/seed-qa-account — QA 검수용 남/여 테스트 계정을 프로덕션 DB 에 업로드.
 *   본문: { id: 'male'|'female', photos: string[] (data URI) }
 *   게이트: QA_SEED_TOKEN 설정 + 헤더 x-gen-token 일치(seed-member 라우트와 별개 전용 토큰).
 *
 * 시딩 작업이 끝나면 QA_SEED_TOKEN 을 지워 이 라우트를 죽인다.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function gateOk(req: NextRequest): boolean {
  const gate = process.env.QA_SEED_TOKEN;
  return !!gate && req.headers.get('x-gen-token') === gate;
}

export async function POST(req: NextRequest) {
  if (!process.env.QA_SEED_TOKEN) {
    return NextResponse.json({ ok: false, reason: 'disabled' }, { status: 503 });
  }
  if (!gateOk(req)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as { id?: unknown; photos?: unknown } | null;
  const id = body?.id === 'male' || body?.id === 'female' ? body.id : null;
  const photos = Array.isArray(body?.photos)
    ? body.photos.filter((p): p is string => typeof p === 'string')
    : [];
  if (!id) {
    return NextResponse.json({ ok: false, reason: 'invalid_id' }, { status: 400 });
  }
  try {
    const result = await upsertQaTestAccount(id, photos);
    return NextResponse.json({ ok: true, member: result });
  } catch (e) {
    console.error('[seed-qa-account] failed', e);
    return NextResponse.json({ ok: false, reason: 'failed' }, { status: 500 });
  }
}
