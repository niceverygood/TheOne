import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchKcbResult } from '@/lib/kcb-identity';

export const runtime = 'nodejs'; // node:crypto(CI 해시) 사용
export const dynamic = 'force-dynamic';

const schema = z.object({ txSeqNo: z.string().min(1).max(40) });

/**
 * POST /api/identity/kcb/result
 * body: { txSeqNo }
 *
 * KCB 인증 완료 후 클라이언트가 받은 txSeqNo 로 서버가 결과를 재조회·확정한다.
 * - 미인증/조회불가 → 422
 * - 만 19세 미만 → 403 (trust-safety §3-4)
 * - 원본 CI/DI·ciHash 는 응답에 절대 포함하지 않는다(서버 내부 저장용).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
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

  // 클라이언트에는 안전한 정보만 반환 (CI/DI·해시 제외)
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
  });
}
