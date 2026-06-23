import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { PHOTO_STUDIO_MAX_BYTES, resolvePhotoStudioStyles } from '@theone/shared';
import {
  completePhotoStudioJob,
  createPhotoStudioJob,
  failPhotoStudioJob,
  getPhotoStudioPushToken,
} from '@theone/db';
import { rateLimit } from '@/lib/rate-limit';
import { generatePhotoStudio, photoStudioKeys } from '@/lib/photo-studio-gen';
import { sendExpoPush } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // waitUntil 워커가 4종 병렬 생성을 끝낼 시간(실측 ~190초)

const STUDIO_RATE_MAX = Number(process.env.STUDIO_RATE_MAX) || 6;
const STUDIO_RATE_WINDOW_MS = 60 * 60 * 1000;

function clientIpHash(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for') ?? '';
  const ip = xff.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 24);
}

/**
 * 응답 후(waitUntil) 백그라운드 생성 — 앱이 닫혀 있어도 서버가 끝까지 생성한다.
 * 완료/실패 시 결과를 잡에 저장하고 푸시를 보낸다(토큰 있으면).
 */
async function processJob(jobId: string, image: File, styleIds: string[]) {
  try {
    const images = await generatePhotoStudio(image, styleIds);
    if (images.length === 0) {
      await failPhotoStudioJob(jobId, 'generation_failed');
      await notify(jobId, false, 0);
      return;
    }
    await completePhotoStudioJob(jobId, images);
    await notify(jobId, true, images.length);
  } catch (e) {
    await failPhotoStudioJob(jobId, (e as Error).message);
    await notify(jobId, false, 0);
  }
}

async function notify(jobId: string, ok: boolean, count: number) {
  const token = await getPhotoStudioPushToken(jobId).catch(() => null);
  if (!token) return;
  await sendExpoPush(token, {
    title: ok ? 'AI 스튜디오 컷이 완성됐어요' : 'AI 스튜디오 생성 실패',
    body: ok
      ? `스튜디오 컷 ${count}장이 준비됐습니다. 앱에서 확인해 보세요.`
      : '생성에 실패했어요. 다른 사진으로 다시 시도해 주세요.',
    data: { type: 'photo_studio', jobId, ok },
  });
}

/**
 * POST /api/ai/photo-studio/start
 * multipart/form-data: image(≤4MB), styles="cafe,gallery,...", pushToken?(Expo)
 *
 * 잡을 만들어 jobId 를 즉시 반환하고, 생성은 waitUntil 로 응답 후 계속한다.
 * 클라이언트는 /api/ai/photo-studio/result?jobId= 로 폴링하거나 완료 푸시를 받는다.
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
  const styles = resolvePhotoStudioStyles(selectedIds).map((s) => s.id);

  const pushToken = (() => {
    const t = form?.get('pushToken');
    return typeof t === 'string' && t.trim() ? t.trim() : null;
  })();

  // 요청 바디는 응답 후 사라질 수 있으므로 바이트를 먼저 복사해 워커용 File 을 새로 만든다.
  const bytes = Buffer.from(await image.arrayBuffer());
  const workerImage = new File([bytes], 'photo.jpg', { type: image.type });

  const jobId = await createPhotoStudioJob(styles, pushToken);
  waitUntil(processJob(jobId, workerImage, styles));

  return NextResponse.json({ ok: true, jobId });
}
