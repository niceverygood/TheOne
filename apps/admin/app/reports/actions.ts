'use server';

import { revalidatePath } from 'next/cache';
import { moderateUser, resolveReports } from '@theone/db';
import { getCurrentOperator, getClientIp, canReview } from '@/lib/operator';
import { recordAccess } from '@theone/db';

export type ModResult = { ok: true } | { ok: false; message: string };

export async function moderateAction(
  userId: string,
  action: 'suspend' | 'ban' | 'reinstate',
): Promise<ModResult> {
  const op = await getCurrentOperator();
  if (!canReview(op)) return { ok: false, message: 'reviewer 이상 권한이 필요합니다.' };
  try {
    await moderateUser({ userId, action });
    await resolveReports(userId);
    await recordAccess({
      operatorId: op!.id,
      action: action === 'ban' ? 'purge' : 'view_meta',
      targetUserId: userId,
      ip: getClientIp(),
    });
    revalidatePath('/reports');
    return { ok: true };
  } catch (e) {
    console.error('[moderate] failed', e);
    return { ok: false, message: '처리에 실패했습니다.' };
  }
}
