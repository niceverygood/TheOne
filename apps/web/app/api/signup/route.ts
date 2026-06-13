import { NextRequest, NextResponse } from 'next/server';
import { signupInputSchema } from '@theone/shared';
import { createSignupUser, DuplicateUserError, resolveReferrer } from '@theone/db';
import { openIdentity } from '@/lib/identity-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/signup
 * body: SignupInput (gender, jobCategory, birth?, phone?, email?, referralCode?, ciHash?)
 *
 * 모바일 가입(step01~05) 제출 → User(+Profile) 생성(status=pending, 가입 심사 대기).
 * 휴대폰/이메일/CI 중복 시 409. 생성된 userId 는 이후 4종 인증 신청에 사용한다.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupInputSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === 'string' && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return NextResponse.json(
      { ok: false, reason: 'validation', message: '입력 내용을 다시 확인해 주세요.', fieldErrors },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // 봉인 토큰을 열어 ciHash 복원(서버 전용). 토큰의 phone 과 제출 phone 이 다르면
  // 토큰 혼선/위변조로 보고 무시한다(phone 미제출이면 그대로 사용).
  let ciHash: string | undefined;
  if (input.idToken) {
    const sealed = openIdentity(input.idToken);
    if (sealed && (!input.phone || !sealed.phone || sealed.phone === input.phone)) {
      ciHash = sealed.ciHash;
    }
  }

  // 추천 코드 → 추천인 userId (형식/체크섬 검증). 유효하지 않으면 무시.
  const referredById = await resolveReferrer(input.referralCode);

  try {
    const user = await createSignupUser({
      gender: input.gender,
      jobCategory: input.jobCategory,
      birth: input.birth,
      phone: input.phone,
      email: input.email,
      ciHash,
      referredById: referredById ?? undefined,
      // 가입 설문(Phase 4)
      height: input.height,
      residenceRegion: input.residenceRegion,
      activityRegion: input.activityRegion,
      school: input.school,
      hobbies: input.hobbies,
      drinkingFrequency: input.drinkingFrequency,
      drinkingAmount: input.drinkingAmount,
      smoking: input.smoking,
      bodyType: input.bodyType,
      surveyAnswers: input.surveyAnswers,
      introSections: input.introSections as Record<string, string> | undefined,
    });
    return NextResponse.json({ ok: true, userId: user.id, status: user.status });
  } catch (e) {
    if (e instanceof DuplicateUserError) {
      return NextResponse.json(
        { ok: false, reason: 'duplicate', message: '이미 가입된 휴대폰/본인인증 정보입니다.' },
        { status: 409 },
      );
    }
    console.error('[signup] insert failed', e);
    return NextResponse.json(
      {
        ok: false,
        reason: 'server',
        message: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 },
    );
  }
}
