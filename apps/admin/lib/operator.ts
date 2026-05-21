import 'server-only';
import { headers } from 'next/headers';
import { getOperatorByUsername, type Operator } from '@theone/db';
import { roleAtLeast, type OperatorRole } from '@theone/shared';

/**
 * 현재 운영자 식별 — Basic Auth 헤더의 username을 DB Operator로 해석.
 * 미들웨어(middleware.ts)가 Basic Auth 게이트를 통과시킨 뒤, 권한(role)은 여기서 결정한다.
 * 일치하는 Operator가 없으면 환경변수 admin 계정을 admin 권한으로 폴백.
 */
export async function getCurrentOperator(): Promise<Operator | null> {
  const auth = headers().get('authorization');
  let username = process.env.ADMIN_BASIC_AUTH_USER ?? 'admin';
  if (auth?.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
      username = decoded.split(':')[0] || username;
    } catch {
      /* keep default */
    }
  }
  return getOperatorByUsername(username);
}

export function getClientIp(): string | undefined {
  const fwd = headers().get('x-forwarded-for');
  return fwd ? fwd.split(',')[0]!.trim() : undefined;
}

/** 권한 검사 헬퍼. */
export function operatorRole(op: Operator | null): OperatorRole {
  return (op?.role as OperatorRole) ?? 'viewer';
}

export function canReview(op: Operator | null): boolean {
  return !!op?.active && roleAtLeast(operatorRole(op), 'reviewer');
}
