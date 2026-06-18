'use server';

import { revalidatePath } from 'next/cache';
import { setMemberStatus, deleteMember } from '@theone/db';
import { getCurrentOperator, canReview } from '@/lib/operator';

export type ProfileResult = { ok: true } | { ok: false; message: string };

type Status = 'pending' | 'active' | 'suspended' | 'withdrawn';

export async function setStatusAction(userId: string, status: Status): Promise<ProfileResult> {
  const op = await getCurrentOperator();
  if (!canReview(op)) return { ok: false, message: 'reviewer 이상 권한이 필요합니다.' };
  try {
    await setMemberStatus(userId, status);
    revalidatePath('/profiles');
    revalidatePath(`/profiles/${userId}`);
    return { ok: true };
  } catch (e) {
    console.error('[setStatus] failed', e);
    return { ok: false, message: '상태 변경에 실패했습니다.' };
  }
}

export async function deleteMemberAction(userId: string): Promise<ProfileResult> {
  const op = await getCurrentOperator();
  if (!canReview(op)) return { ok: false, message: 'reviewer 이상 권한이 필요합니다.' };
  try {
    await deleteMember(userId);
    revalidatePath('/profiles');
    return { ok: true };
  } catch (e) {
    console.error('[deleteMember] failed', e);
    return { ok: false, message: '삭제에 실패했습니다.' };
  }
}
