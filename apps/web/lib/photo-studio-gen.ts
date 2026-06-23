import 'server-only';
import {
  PHOTO_STUDIO_IDENTITY_RULES,
  PHOTO_STUDIO_STYLES,
  resolvePhotoStudioStyles,
  type PhotoStudioImage,
} from '@theone/shared';

/**
 * AI 스튜디오 생성 코어 — 동기 라우트(/api/ai/photo-studio)와 비동기 워커
 * (/api/ai/photo-studio/start 의 waitUntil)가 공유한다. 모델 호출·프롬프트 규칙의
 * 진실의 원천은 여기 1곳. 동일 인물 보존 규칙은 @theone/shared 가 진실의 원천.
 */

// 모델은 GPT Image 2 고정 — 실사 인물 품질이 목적이라 다른 모델로 대체하지 않는다.
const OPENAI_MODEL = 'gpt-image-2';
const OPENROUTER_MODEL = 'openai/gpt-5.4-image-2'; // OpenRouter 의 GPT Image 2 노출명
const OPENAI_EDITS_URL = 'https://api.openai.com/v1/images/edits';
const OPENROUTER_CHAT_URL = 'https://openrouter.ai/api/v1/chat/completions';
const QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? 'high'; // 실사 품질 — 기본 high

type Style = (typeof PHOTO_STUDIO_STYLES)[number];

function stylePrompt(style: Style): string {
  return `${PHOTO_STUDIO_IDENTITY_RULES}\n\nScene & style: ${style.prompt}`;
}

/** OpenAI 직통 — images/edits (3:4 사이즈·품질 제어 가능, 1순위) */
async function generateViaOpenAI(
  key: string,
  image: File,
  style: Style,
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
  style: Style,
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

/** OPENAI_API_KEY(직통) → OPENROUTER_API_KEY(경유). 둘 다 없으면 null. */
export function photoStudioKeys(): { openaiKey?: string; openrouterKey?: string } | null {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openaiKey && !openrouterKey) return null;
  return { openaiKey, openrouterKey };
}

/**
 * 선택한 장면(styleIds)을 동일 인물로 병렬 생성한다. 키 미설정 시 throw('not_configured').
 * 일부 실패는 건너뛰고 성공분만 반환 — 호출자가 빈 배열을 실패로 처리한다.
 */
export async function generatePhotoStudio(
  image: File,
  styleIds: string[] | null,
): Promise<PhotoStudioImage[]> {
  const keys = photoStudioKeys();
  if (!keys) throw new Error('not_configured');
  const styles = resolvePhotoStudioStyles(styleIds);

  // OpenRouter 경로는 입력 이미지를 data URL 로 전달
  const dataUrl = keys.openaiKey
    ? null
    : `data:${image.type};base64,${Buffer.from(await image.arrayBuffer()).toString('base64')}`;

  const results = await Promise.all(
    styles.map(async (style) => {
      try {
        return keys.openaiKey
          ? await generateViaOpenAI(keys.openaiKey, image, style)
          : await generateViaOpenRouter(keys.openrouterKey!, dataUrl!, style);
      } catch (e) {
        console.error(`[photo-studio] ${style.id} failed:`, e);
        return null;
      }
    }),
  );
  return results.filter((r): r is PhotoStudioImage => r != null);
}
