import 'server-only';
import { NextRequest } from 'next/server';
import { prisma, ensureAppOperator, type Operator } from '@theone/db';
import { roleAtLeast, type OperatorRole } from '@theone/shared';
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

/**
 * 인증 심사용 접근 검증 — 앱 관리자 확인 + 대응 Operator 확보.
 *
 * 심사는 가입승인·신고처리와 달리 reviewerId·AccessLog.operatorId 를 남겨야 하므로
 * (verification-sop §5 / privacy-design §2-4) 앱 관리자에게도 Operator 계정을 붙인다.
 * reviewer 미만이거나 비활성화된 계정은 거부 — 웹 콘솔에서 권한 회수가 가능하다.
 */
export async function requireMobileReviewer(req: NextRequest): Promise<Operator | null> {
  const userId = authUserId(req);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true, seq: true },
  });
  if (!user?.isAdmin) return null;
  const op = await ensureAppOperator(userId, user.seq);
  return op.active && roleAtLeast(op.role as OperatorRole, 'reviewer') ? op : null;
}

/** AccessLog 용 호출자 IP (프록시 경유 시 첫 홉). */
export function reqIp(req: NextRequest): string | undefined {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? undefined;
}
