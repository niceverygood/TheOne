import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchKcbResult } from '@/lib/kcb-identity';
import { sealIdentity } from '@/lib/identity-token';

export const runtime = 'nodejs'; // node:crypto(CI 해시) 사용
export const dynamic = 'force-dynamic';

const schema = z.object({
  txSeqNo: z.string().min(1).max(40).optional(),
  // Apple App Review 전용 우회 코드(서버 env 로만 검증). 일반 사용자 흐름엔 없음.
  reviewCode: z.string().min(1).max(128).optional(),
});

/**
 * Apple App Review 우회(연령/본인인증).
 * - 해외 리뷰어는 한국 KCB 휴대폰 본인확인을 완료할 수 없다.
 * - 비밀 코드는 앱 바이너리에 넣지 않고 서버 env(IOS_REVIEW_BYPASS_CODE)로만 검증한다.
 *   → 앱을 디컴파일해도 코드가 없고, 승인 후 env 1개만 삭제하면 우회가 즉시 비활성화된다.
 * - 일치 시 고정된 "심사 데모" 성인 신원만 반환(실제 KCB 미호출).
 */
function reviewBypassIdentity(reviewCode: string | undefined) {
  const expected = process.env.IOS_REVIEW_BYPASS_CODE;
  if (!expected || !reviewCode || reviewCode !== expected) return null;
  return {
    name: '심사 데모',
    birth: '1990-01-01',
    gender: 'male' as const,
    phone: '01000000000',
    carrier: 'SKT',
    isForeigner: false,
    isAdult: true,
    mock: true,
    review: true,
  };
}

/**
 * POST /api/identity/kcb/result
 * body: { txSeqNo } | { reviewCode }
 *
 * KCB 인증 완료 후 클라이언트가 받은 txSeqNo 로 서버가 결과를 재조회·확정한다.
 * - 미인증/조회불가 → 422
 * - 만 19세 미만 → 403 (trust-safety §3-4)
 * - 원본 CI/DI·ciHash 는 응답에 절대 포함하지 않는다(서버 내부 저장용).
 * - reviewCode 가 서버 env 와 일치하면 KCB 미호출, 고정 데모 성인 신원 반환(Apple 심사용).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  // Apple App Review 우회: 서버 env 와 코드가 일치할 때만(설정 안 됐으면 항상 무시).
  const bypass = reviewBypassIdentity(parsed.data.reviewCode);
  if (bypass) {
    // 데모 신원도 봉인 토큰을 동봉해 가입 연동(ciHash 저장)을 동일 경로로 검증 가능하게 한다.
    const idToken = sealIdentity({ ciHash: 'review-demo-ci', phone: bypass.phone });
    return NextResponse.json({ ok: true, ...bypass, idToken });
  }

  if (!parsed.data.txSeqNo) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  const result = await fetchKcbResult(parsed.data.txSeqNo);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: 'not_verified', status: result.status },
      { status: 422 },
    );
  }
  if (!result.isAdult) {
    return NextResponse.json({ ok: false, reason: 'underage' }, { status: 403 });
  }

  // TODO(가입연동): result.ciHash 로 차단회원/중복가입 조회 (User.ciHash @unique).
  //   if (dup?.status === 'banned') return 403 banned;
  //   if (dup) return 409 already_registered;
  //   가입 확정 시 User.create({ phone, gender, birth, ciHash }) 에 저장.

  // 클라이언트에는 안전한 정보만 반환 (CI/DI·해시 제외).
  // ciHash 는 평문 대신 봉인 토큰(idToken)으로만 전달 — 가입 제출 시 서버가 열어 저장한다.
  return NextResponse.json({
    ok: true,
    name: result.name,
    birth: result.birth,
    gender: result.gender,
    phone: result.phone,
    carrier: result.carrier,
    isForeigner: result.isForeigner,
    isAdult: result.isAdult,
    mock: result.mock,
    idToken: result.ciHash
      ? sealIdentity({ ciHash: result.ciHash, phone: result.phone })
      : undefined,
  });
}
