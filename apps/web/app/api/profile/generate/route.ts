import { NextRequest, NextResponse } from 'next/server';
import { profileGenerateSchema, type ProfileGenerateResult } from '@theone/shared';
import { generateIntro } from '@/lib/profile-intro';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/profile/generate
 * body: ProfileGenerateInput (gender, jobCategory, age?, height?, regions?, school?, hobbies?, drinking*, smoking?, bodyType?)
 *
 * 수집한 가입 설문 데이터로 AI 자기소개 5개 섹션을 생성한다.
 * ANTHROPIC_API_KEY 있으면 Claude, 없으면 규칙기반 템플릿(폴백). 응답은 사용자가 편집 가능.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ProfileGenerateResult>> {
  const body = await req.json().catch(() => null);
  const parsed = profileGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: 'validation', message: '입력 내용을 다시 확인해 주세요.' },
      { status: 400 },
    );
  }

  try {
    const { sections, source } = await generateIntro(parsed.data);
    return NextResponse.json({ ok: true, sections, source });
  } catch (e) {
    console.error('[profile/generate] failed', e);
    return NextResponse.json(
      {
        ok: false,
        reason: 'server',
        message: '자기소개 생성에 실패했어요. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 },
    );
  }
}
