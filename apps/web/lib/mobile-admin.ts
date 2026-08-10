import 'server-only';
import { NextRequest } from 'next/server';
import { prisma } from '@theone/db';
import { authUserId } from './session';

/**
 * 앱 내 관리자 화면 접근 검증 — 세션 토큰 → userId → User.isAdmin 확인.
 * 웹 어드민 콘솔(Operator/Basic Auth)과는 별개 권한 체계.
 */
export async function requireMobileAdmin(req: NextRequest): Promise<string | null> {
  const userId = authUserId(req);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  return user?.isAdmin ? userId : null;
}
