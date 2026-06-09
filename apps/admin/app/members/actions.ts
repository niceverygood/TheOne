'use server';

import { revalidatePath } from 'next/cache';
import { approveMembership } from '@theone/db';
import { getCurrentOperator, canReview } from '@/lib/operator';

export type MemberResult = { ok: true; rewardCredits?: number } | { ok: false; message: string };

export async function approveMemberAction(userId: string): Promise<MemberResult> {
  const op = await getCurrentOperator();
  if (!canReview(op)) return { ok: false, message: 'reviewer 이상 권한이 필요합니다.' };
  try {
    const { rewardCredits } = await approveMembership(userId);
    revalidatePath('/members');
    return { ok: true, rewardCredits };
  } catch (e) {
    console.error('[approveMember] failed', e);
    return { ok: false, message: '심사 처리에 실패했습니다.' };
  }
}
