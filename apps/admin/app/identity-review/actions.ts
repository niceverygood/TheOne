'use server';

import { revalidatePath } from 'next/cache';
import { approveManualId, rejectManualId } from '@theone/db';
import { getCurrentOperator, getClientIp, canReview } from '@/lib/operator';

export type ReviewResult = { ok: true } | { ok: false; message: string };

export async function approveManualIdAction(requestId: string): Promise<ReviewResult> {
  const op = await getCurrentOperator();
  if (!canReview(op)) return { ok: false, message: 'reviewer 이상 권한이 필요합니다.' };
  try {
    await approveManualId({ requestId, operatorId: op!.id, ip: getClientIp() });
    revalidatePath('/identity-review');
    return { ok: true };
  } catch (e) {
    console.error('[manual-id approve] failed', e);
    return { ok: false, message: '승인 처리에 실패했습니다.' };
  }
}

export async function rejectManualIdAction(
  requestId: string,
  reason: string,
): Promise<ReviewResult> {
  const op = await getCurrentOperator();
  if (!canReview(op)) return { ok: false, message: 'reviewer 이상 권한이 필요합니다.' };
  if (!reason.trim()) return { ok: false, message: '반려 사유를 입력해 주세요.' };
  try {
    await rejectManualId({ requestId, operatorId: op!.id, reason, ip: getClientIp() });
    revalidatePath('/identity-review');
    return { ok: true };
  } catch (e) {
    console.error('[manual-id reject] failed', e);
    return { ok: false, message: '반려 처리에 실패했습니다.' };
  }
}
