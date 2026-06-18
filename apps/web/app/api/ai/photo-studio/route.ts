import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  PHOTO_STUDIO_IDENTITY_RULES,
  PHOTO_STUDIO_MAX_BYTES,
  PHOTO_STUDIO_STYLES,
  resolvePhotoStudioStyles,
  type PhotoStudioImage,
} from '@theone/shared';
import { rateLimit } from '@/lib/rate-limit';

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

// 모델은 GPT Image 2 고정 — 실사 인물 품질이 목적이라 다른 모델로 대체하지 않는다.
const OPENAI_MODEL = 'gpt-image-2';
const OPENROUTER_MODEL = 'openai/gpt-5.4-image-2'; // OpenRouter 의 GPT Image 2 노출명
const OPENAI_EDITS_URL = 'https://api.openai.com/v1/images/edits';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? 'high'; // 실사 품질 — 기본 high

function stylePrompt(style: (typeof PHOTO_STUDIO_STYLES)[number]): string {
  return `${PHOTO_STUDIO_IDENTITY_RULES}\n\nScene & style: ${style.prompt}`;
}

/** OpenAI 직통 — images/edits (3:4 사이즈·품질 제어 가능, 1순위) */
async function generateViaOpenAI(
  key: string,
  image: File,
  style: (typeof PHOTO_STUDIO_STYLES)[number],
): Promise<PhotoStudioImage | null> {
  const fd = new FormData();
  fd.append('model', OPENAI_MODEL);
  fd.append('image', image, 'photo.jpg');
  fd.append('prompt', stylePrompt(style));
  fd.append('size', '1024x1536'); // 앱 사진 슬롯과 동일한 3:4 세로
  fd.append('quality', QUALITY);
  fd.append('output_format', 'jpeg');
  fd.append('n', '1');

  const res = await fetch(OPENAI_EDITS_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[photo-studio:openai] ${style.id} ${res.status}: ${text.slice(0, 300)}`);
    return null;
  }
  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  return b64 ? { style: style.id, b64, mime: 'image/jpeg' } : null;
}

/** OpenRouter 경유 — chat completions + modalities (키만 있으면 동작, 2순위) */
async function generateViaOpenRouter(
  key: string,
  dataUrl: string,
  style: (typeof PHOTO_STUDIO_STYLES)[number],
): Promise<PhotoStudioImage | null> {
  const res = await fetch(OPENROUTER_CHAT_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      modalities: ['image', 'text'],
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: stylePrompt(style) },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[photo-studio:openrouter] ${style.id} ${res.status}: ${text.slice(0, 300)}`);
    return null;
  }
  const data = (await res.json()) as {
    choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
  };
  const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  const m = url?.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  return m ? { style: style.id, b64: m[2]!, mime: m[1]! } : null;
}

/**
 * POST /api/ai/photo-studio
 * multipart/form-data: image(파일 1장, jpeg/png/webp, ≤4MB — 함수 페이로드 한도)
 *
 * GPT Image 2 로 동일 인물 스타일 4종을 병렬 생성한다 (모델 고정).
 * 키 우선순위: OPENAI_API_KEY(직통) → OPENROUTER_API_KEY(경유). 둘 다 없으면 503.
 * 동일 인물 보존 규칙은 @theone/shared PHOTO_STUDIO_IDENTITY_RULES 가 진실의 원천.
 * 원본·결과 모두 서버에 저장하지 않는다(생성 후 즉시 반환, privacy-design §보유).
 */
export async function POST(req: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openaiKey && !openrouterKey) {
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

  // 생성할 장면 — styles="cafe,gallery,..." 로 선택(미선택/구버전 앱은 기본 2종).
  // 유효성·중복제거·상한(PHOTO_STUDIO_MAX_SELECT)은 resolvePhotoStudioStyles 가 처리.
  const stylesRaw = form?.get('styles');
  const selectedIds =
    typeof stylesRaw === 'string'
      ? stylesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : null;
  const styles = resolvePhotoStudioStyles(selectedIds);

  // OpenRouter 경로는 입력 이미지를 data URL 로 전달
  const dataUrl = openaiKey
    ? null
    : `data:${image.type};base64,${Buffer.from(await image.arrayBuffer()).toString('base64')}`;

  const results = await Promise.all(
    styles.map(async (style) => {
      try {
        return openaiKey
          ? await generateViaOpenAI(openaiKey, image, style)
          : await generateViaOpenRouter(openrouterKey!, dataUrl!, style);
      } catch (e) {
        console.error(`[photo-studio] ${style.id} failed:`, e);
        return null;
      }
    }),
  );

  const images = results.filter((r): r is PhotoStudioImage => r != null);
  if (images.length === 0) {
    return NextResponse.json({ ok: false, reason: 'generation_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, images });
}
