import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyIdentity } from '@/lib/portone-identity';

export const runtime = 'nodejs'; // node:crypto(해시) 사용
export const dynamic = 'force-dynamic';

const schema = z.object({ identityVerificationId: z.string().min(1) });

/**
 * POST /api/identity/verify
 * body: { identityVerificationId }
 *
 * PortOne 본인인증 완료 후 클라이언트가 받은 id 를 서버가 재검증한다.
 * - status VERIFIED 아니면 거절
 * - 만 19세 미만 차단 (trust-safety §3-4)
 * - 원본 CI/DI 및 ciHash 는 응답에 절대 포함하지 않는다(서버 내부 저장용)
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  const result = await verifyIdentity(parsed.data.identityVerificationId);
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
  //   예) const dup = await findUserByCiHash(result.ciHash);
  //       if (dup?.status === 'banned') return 403 banned;
  //       if (dup) return 409 already_registered;
  //   가입 확정 단계에서 User.create({ phone, gender, birth, ciHash }) 시 저장.

  // 클라이언트에는 안전한 정보만 반환 (CI/DI·해시 제외)
  return NextResponse.json({
    ok: true,
    name: result.name,
    birth: result.birth,
    gender: result.gender,
    phone: result.phone,
    carrier: result.carrier,
    isAdult: result.isAdult,
    mock: result.mock,
  });
}
