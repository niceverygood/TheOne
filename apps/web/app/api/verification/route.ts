import { NextRequest, NextResponse } from 'next/server';
import { verificationSubmitSchema } from '@theone/shared';
import { createApplication, prisma } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/verification
 * body: VerificationSubmitInput (userId, type, valueTier?, documents[])
 *
 * 4종 인증(학력·재산·차량·부동산) 신청 → VerificationApplication 생성(status=submitted,
 * SLA 제출+24h) → 운영자 심사 대기열(admin /verifications)로 유입.
 * 서류는 S3 키만 보관(평문 URL 금지, privacy-design §2-4).
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = verificationSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: 'validation', message: '입력 내용을 다시 확인해 주세요.' },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // 회원 존재 확인 (잘못된 userId 로 고아 신청 생성 방지)
  const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true } });
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'not_found',
        message: '회원을 찾을 수 없습니다. 가입을 먼저 완료해 주세요.',
      },
      { status: 404 },
    );
  }

  try {
    const application = await createApplication({
      userId: input.userId,
      type: input.type,
      valueTier: input.valueTier,
      documents: input.documents,
    });
    return NextResponse.json({
      ok: true,
      applicationId: application.id,
      slaDueAt: application.slaDueAt.toISOString(),
    });
  } catch (e) {
    console.error('[verification] insert failed', e);
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
