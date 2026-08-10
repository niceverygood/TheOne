import { NextRequest, NextResponse } from 'next/server';
import { approveApplication, rejectApplication, getApplication } from '@theone/db';
import { REJECT_REASONS, type RejectReasonCode } from '@theone/shared';
import { requireMobileReviewer, reqIp } from '@/lib/mobile-admin';

export const dynamic = 'force-dynamic';

const MAX_CUSTOM_REASON = 300;

/**
 * POST /api/admin/mobile/verifications/review — body: { applicationId, action, reasonCode?, reasonText? }
 *
 * 승인: 뱃지 부여(유효기간 1년) + 타입별 크레딧 보상(applicationId 멱등) + AccessLog.
 * 반려: 표준 문구 10종(verification-sop §5-2) 중 선택. `other` 만 자유 입력을 받는다 —
 * 회원에게 그대로 노출되는 문구라 서버에서 코드→문구를 확정한다.
 */
export async function POST(req: NextRequest) {
  const op = await requireMobileReviewer(req);
  if (!op) return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => null)) as {
    applicationId?: unknown;
    action?: unknown;
    reasonCode?: unknown;
    reasonText?: unknown;
  } | null;

  const applicationId = typeof body?.applicationId === 'string' ? body.applicationId : null;
  const action = body?.action === 'approve' || body?.action === 'reject' ? body.action : null;
  if (!applicationId || !action) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  // 반려 사유는 표준 문구에서 해석 — 임의 문자열을 그대로 회원에게 보내지 않는다.
  let reason = '';
  if (action === 'reject') {
    const preset = REJECT_REASONS.find((r) => r.code === (body?.reasonCode as RejectReasonCode));
    if (!preset) {
      return NextResponse.json({ ok: false, reason: 'invalid_reason' }, { status: 400 });
    }
    if (preset.code === 'other') {
      const text = typeof body?.reasonText === 'string' ? body.reasonText.trim() : '';
      if (!text) {
        return NextResponse.json({ ok: false, reason: 'reason_required' }, { status: 400 });
      }
      reason = text.slice(0, MAX_CUSTOM_REASON);
    } else {
      reason = `${preset.label} — ${preset.message}`;
    }
  }

  try {
    // 이미 처리된 신청을 다시 뒤집지 않는다(승인 후 반려 시 뱃지가 남는 것을 방지).
    const app = await getApplication(applicationId);
    if (!app) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });
    if (app.status !== 'submitted' && app.status !== 'reviewing') {
      return NextResponse.json({ ok: false, reason: 'already_reviewed' }, { status: 409 });
    }

    if (action === 'approve') {
      const { rewardCredits } = await approveApplication({
        applicationId,
        operatorId: op.id,
        ip: reqIp(req),
      });
      return NextResponse.json({ ok: true, rewardCredits });
    }

    await rejectApplication({ applicationId, operatorId: op.id, reason, ip: reqIp(req) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/mobile/verifications/review] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
