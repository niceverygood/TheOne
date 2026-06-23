import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

/**
 * 세션 토큰(API 호출자 인증) — HMAC-SHA256 서명 토큰.
 *
 * 가입/로그인 시 서버가 userId 를 서명해 발급하고, 보호된 API 는 Authorization: Bearer
 * 헤더의 토큰을 검증해 호출자 userId 를 얻는다. 이로써 body 의 userId/fromId 를 신뢰하지
 * 않고(타인 사칭 IDOR 차단), 토큰 주인으로만 동작한다.
 *
 * 비밀은 IDENTITY_CI_PEPPER 재사용(프로덕션에 이미 설정됨). 별도 키 도입 불필요.
 */
const SECRET = `session:${process.env.IDENTITY_CI_PEPPER ?? ''}`;
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90일

function sign(input: string): string {
  return createHmac('sha256', SECRET).update(input).digest('base64url');
}

/** userId 를 만료시각과 함께 서명. `payload.sig` 토큰 반환. */
export function issueSession(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + TTL_MS })).toString(
    'base64url',
  );
  return `${payload}.${sign(payload)}`;
}

/** 토큰 검증 → userId. 서명 불일치/만료/형식오류 시 null. */
export function verifySession(token: string): string | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = sign(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const obj = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid?: string;
      exp?: number;
    };
    if (!obj.uid || !obj.exp || obj.exp < Date.now()) return null;
    return obj.uid;
  } catch {
    return null;
  }
}

/** 요청의 Authorization: Bearer 토큰을 검증해 호출자 userId 반환(없거나 무효면 null). */
export function authUserId(req: NextRequest): string | null {
  const h = req.headers.get('authorization') ?? '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? verifySession(m[1]!.trim()) : null;
}
