import { NextRequest, NextResponse } from 'next/server';
import { manualIdentitySchema, type ManualIdentitySubmitResult } from '@theone/shared';
import { createManualIdentityRequest } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/identity/manual
 * body: ManualIdentityInput (name, phone, idCardS3Key, note?)
 *
 * 휴대폰이 본인 명의가 아닌 경우의 수동 본인인증 요청 → 운영자 큐(admin /identity-review)로 유입.
 * 신분증 사진은 S3 키만 보관(평문 URL/주민번호 보관 금지). 검토 후 30일 자동 파기.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ManualIdentitySubmitResult>> {
  const body = await req.json().catch(() => null);
  const parsed = manualIdentitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: 'validation', message: '입력 내용을 다시 확인해 주세요.' },
      { status: 400 },
    );
  }

  try {
    const reqRow = await createManualIdentityRequest(parsed.data);
    return NextResponse.json({ ok: true, requestId: reqRow.id });
  } catch (e) {
    console.error('[identity/manual] insert failed', e);
    return NextResponse.json(
      { ok: false, reason: 'server', message: '접수에 실패했어요. 잠시 후 다시 시도해 주세요.' },
      { status: 500 },
    );
  }
}
