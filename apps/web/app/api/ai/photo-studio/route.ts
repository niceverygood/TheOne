import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { PHOTO_STUDIO_MAX_BYTES } from '@theone/shared';
import { rateLimit } from '@/lib/rate-limit';
import { generatePhotoStudio, photoStudioKeys } from '@/lib/photo-studio-gen';

// 공개 엔드포인트 비용 방어 — IP당 시간당 생성 횟수 상한(1회=장면 N장 모델 호출).
// 기본 6. 시드/더미 배치 작업 시 STUDIO_RATE_MAX env 로 일시 상향 가능(작업 후 원복).
const STUDIO_RATE_MAX = Number(process.env.STUDIO_RATE_MAX) || 6;
const STUDIO_RATE_WINDOW_MS = 60 * 60 * 1000;

function clientIpHash(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for') ?? '';
  const ip = xff.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 스타일 4종 병렬 생성 — OpenRouter 경유 실측 ~190초

/**
 * POST /api/ai/photo-studio  (동기 — 시드/더미 배치 스크립트용)
 * multipart/form-data: image(파일 1장, jpeg/png/webp, ≤4MB — 함수 페이로드 한도)
 *
 * 동일 인물 스타일 N종을 병렬 생성해 즉시 반환한다. 모바일 앱은 백그라운드 생성 +
 * 푸시를 위해 /start·/result(비동기)를 사용한다. 생성 코어는 lib/photo-studio-gen.
 * 원본·결과 모두 서버에 저장하지 않는다(생성 후 즉시 반환, privacy-design §보유).
 */
export async function POST(req: NextRequest) {
  if (!photoStudioKeys()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  if (!rateLimit(`aistudio:${clientIpHash(req)}`, STUDIO_RATE_MAX, STUDIO_RATE_WINDOW_MS)) {
    return NextResponse.json({ ok: false, reason: 'rate_limit' }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  const image = form?.get('image');
  if (!(image instanceof File)) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }
  if (image.size > PHOTO_STUDIO_MAX_BYTES) {
    return NextResponse.json({ ok: false, reason: 'too_large' }, { status: 413 });
  }
  if (!/^image\/(jpeg|jpg|png|webp)$/.test(image.type)) {
    return NextResponse.json({ ok: false, reason: 'unsupported_type' }, { status: 415 });
  }

  const stylesRaw = form?.get('styles');
  const selectedIds = typeof stylesRaw === 'string' ? stylesRaw.split(',') : null;

  const images = await generatePhotoStudio(image, selectedIds);
  if (images.length === 0) {
    return NextResponse.json({ ok: false, reason: 'generation_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, images });
}
