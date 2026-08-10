import { NextRequest, NextResponse } from 'next/server';
import { getApplication, recordAccess } from '@theone/db';
import { VERIFY_REWARD_CREDITS, REQUIRED_DOCS } from '@theone/shared';
import { requireMobileReviewer, reqIp } from '@/lib/mobile-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/mobile/verifications/[id] — 심사 상세(앱 내 관리자 화면).
 *
 * 서류 원본(S3)은 앱에서 렌더하지 않는다 — 워터마크·다운로드 차단이 걸린 웹 보안 뷰어에서만
 * 열람한다(verification-sop §5-1). 앱에는 제출 서류의 메타(라벨·형식·용량)만 내려주고,
 * 열람 사실은 AccessLog `view_meta` 로 남긴다(privacy-design §2-4).
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const op = await requireMobileReviewer(req);
  if (!op) return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });

  try {
    const app = await getApplication(params.id);
    if (!app) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });

    await recordAccess({
      operatorId: op.id,
      action: 'view_meta',
      applicationId: app.id,
      targetUserId: app.userId,
      ip: reqIp(req),
    });

    return NextResponse.json({
      ok: true,
      application: {
        id: app.id,
        type: app.type,
        status: app.status,
        valueTier: app.valueTier,
        gender: app.user.gender,
        jobCategory: app.user.jobCategory,
        submittedAt: app.submittedAt.toISOString(),
        slaDueAt: app.slaDueAt.toISOString(),
        reviewedAt: app.reviewedAt?.toISOString() ?? null,
        rejectReason: app.rejectReason,
        rewardCredits: VERIFY_REWARD_CREDITS[app.type],
        requiredDocs: REQUIRED_DOCS[app.type].filter((d) => d.required).map((d) => d.label),
        documents: app.documents.map((d) => ({
          id: d.id,
          label: d.label,
          mime: d.mime,
          size: d.size,
          uploadedAt: d.uploadedAt.toISOString(),
        })),
      },
    });
  } catch (e) {
    console.error('[admin/mobile/verifications/[id] GET] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
