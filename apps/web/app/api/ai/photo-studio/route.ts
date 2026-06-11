import { NextRequest, NextResponse } from 'next/server';
import {
  PHOTO_STUDIO_IDENTITY_RULES,
  PHOTO_STUDIO_MAX_BYTES,
  PHOTO_STUDIO_STYLES,
  type PhotoStudioImage,
} from '@theone/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 스타일 4종 병렬 생성 대기

const OPENAI_EDITS_URL = 'https://api.openai.com/v1/images/edits';
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2';
const QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? 'medium';

/**
 * POST /api/ai/photo-studio
 * multipart/form-data: image(파일 1장, jpeg/png/webp, ≤8MB)
 *
 * gpt-image-2 images/edits 로 동일 인물 스타일 4종을 병렬 생성한다.
 * 동일 인물 보존 규칙은 @theone/shared PHOTO_STUDIO_IDENTITY_RULES 가 진실의 원천.
 * 원본·결과 모두 서버에 저장하지 않는다(생성 후 즉시 반환, privacy-design §보유).
 */
export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
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

  const results = await Promise.all(
    PHOTO_STUDIO_STYLES.map(async (style) => {
      const fd = new FormData();
      fd.append('model', MODEL);
      fd.append('image', image, 'photo.jpg');
      fd.append('prompt', `${PHOTO_STUDIO_IDENTITY_RULES}\n\nScene & style: ${style.prompt}`);
      fd.append('size', '1024x1536'); // 앱 사진 슬롯과 동일한 3:4 세로
      fd.append('quality', QUALITY);
      fd.append('output_format', 'jpeg');
      fd.append('n', '1');

      try {
        const res = await fetch(OPENAI_EDITS_URL, {
          method: 'POST',
          headers: { authorization: `Bearer ${key}` },
          body: fd,
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error(`[photo-studio] ${style.id} ${res.status}: ${text.slice(0, 300)}`);
          return null;
        }
        const data = (await res.json()) as { data?: { b64_json?: string }[] };
        const b64 = data.data?.[0]?.b64_json;
        return b64 ? { style: style.id, b64 } : null;
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
