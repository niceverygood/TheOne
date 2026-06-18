import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/generate-face — text→image 로 "새 인물" 1명의 베이스 얼굴을 생성한다.
 *
 * 용도: 더미/시드 계정용 한국인 인물 사진을 만든다(스튜디오는 편집 전용이라 새 인물 생성 불가).
 * 게이트: 공개 남용·비용 방어를 위해 AI_GEN_TOKEN 이 설정된 경우에만 동작하고,
 *   요청 헤더 x-gen-token 이 일치해야 한다. 토큰 미설정 시 라우트는 비활성(503).
 *   시드 작업이 끝나면 AI_GEN_TOKEN 을 지워 라우트를 죽인다.
 * 저장 안 함: 결과 b64 를 즉시 반환만 한다(privacy-design §보유).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const OPENAI_MODEL = 'gpt-image-2';
const OPENAI_GEN_URL = 'https://api.openai.com/v1/images/generations';
const QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? 'high';

export async function POST(req: NextRequest) {
  const gate = process.env.AI_GEN_TOKEN;
  if (!gate) {
    return NextResponse.json({ ok: false, reason: 'disabled' }, { status: 503 });
  }
  if (req.headers.get('x-gen-token') !== gate) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { prompt?: unknown } | null;
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  const res = await fetch(OPENAI_GEN_URL, {
    method: 'POST',
    headers: { authorization: `Bearer ${openaiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      prompt,
      size: '1024x1536', // 앱 사진 슬롯과 동일한 3:4 세로
      quality: QUALITY,
      output_format: 'jpeg',
      n: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[generate-face] ${res.status}: ${text.slice(0, 400)}`);
    return NextResponse.json({ ok: false, reason: 'generation_failed' }, { status: 502 });
  }
  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ ok: false, reason: 'generation_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, b64, mime: 'image/jpeg' });
}
