import 'server-only';
import { createHash } from 'node:crypto';
import type { Gender } from '@theone/shared';

/**
 * PortOne v2 본인인증(identity-verification) 결과 조회·검증.
 *
 * 흐름: 앱/웹이 PortOne SDK 로 본인인증을 완료하면 `identityVerificationId` 를 받는다.
 * 그 id 를 이 서버가 PortOne REST 로 재조회해 위변조 없이 신원을 확정한다.
 * (클라이언트가 보낸 값을 그대로 신뢰하지 않기 위함 — 반드시 서버 재검증.)
 *
 * PORTONE_API_SECRET 미설정 시 mock(성인 통과)으로 동작 — 데모/스토어 심사용.
 * 결제 lib(`portone.ts`)와 동일한 `PortOne ${secret}` 인증 헤더를 사용한다.
 */
const PORTONE_API = 'https://api.portone.io';

/** 미성년 차단 기준 (trust-safety §3-4) */
export const MIN_AGE = 19;

export interface IdentityVerifyResult {
  ok: boolean;
  status: string;
  /** 아래 신원 필드는 ok=true 일 때만 채워진다 */
  name?: string;
  birth?: string; // YYYY-MM-DD
  gender?: Gender;
  phone?: string;
  carrier?: string;
  isForeigner?: boolean;
  /** 만 19세 이상 여부 — 미성년 차단 */
  isAdult?: boolean;
  /**
   * CI 단방향 해시 (중복가입·차단회원 식별용). 원본 CI/DI 는 절대 저장하지 않는다.
   * User.ciHash(@unique) 와 매칭 — privacy-design §2-4.
   */
  ciHash?: string;
  mock: boolean;
}

/** 생년월일(YYYY-MM-DD)로 만 나이를 구해 19세 이상인지 판정 */
export function isAdultByBirth(birth: string, now = new Date()): boolean {
  const b = new Date(birth);
  if (Number.isNaN(b.getTime())) return false;
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age >= MIN_AGE;
}

/** CI → 단방향 해시. 서버 pepper 를 결합해 원본 복원·레인보우 공격을 방지한다. */
export function hashCi(ci: string): string {
  const pepper = process.env.IDENTITY_CI_PEPPER ?? '';
  return createHash('sha256').update(`${ci}:${pepper}`).digest('hex');
}

function mapGender(g?: string): Gender | undefined {
  if (g === 'MALE') return 'male';
  if (g === 'FEMALE') return 'female';
  return undefined;
}

interface PortOneVerifiedCustomer {
  name?: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: string; // MALE | FEMALE | OTHER
  phoneNumber?: string;
  operator?: string; // SKT | KT | LGU | ...
  isForeigner?: boolean;
  ci?: string;
  di?: string;
}

interface PortOneIdentityResponse {
  status: string; // READY | VERIFIED | FAILED
  verifiedCustomer?: PortOneVerifiedCustomer;
}

/** PortOne 본인인증 결과를 서버에서 재조회·검증 */
export async function verifyIdentity(
  identityVerificationId: string,
): Promise<IdentityVerifyResult> {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    // mock — auth-mock.ts 와 동일 인물/성인 통과 (키 없으면 데모로 동작)
    return {
      ok: true,
      status: 'VERIFIED',
      name: '김민준',
      birth: '1992-03-14',
      gender: 'male',
      phone: '01012345678',
      carrier: 'SKT',
      isForeigner: false,
      isAdult: true,
      ciHash: hashCi('mock-ci-0000'),
      mock: true,
    };
  }
  try {
    const res = await fetch(
      `${PORTONE_API}/identity-verifications/${encodeURIComponent(identityVerificationId)}`,
      { headers: { Authorization: `PortOne ${secret}` } },
    );
    if (!res.ok) return { ok: false, status: `http_${res.status}`, mock: false };
    const data = (await res.json()) as PortOneIdentityResponse;
    if (data.status !== 'VERIFIED' || !data.verifiedCustomer) {
      return { ok: false, status: data.status, mock: false };
    }
    const c = data.verifiedCustomer;
    const isAdult = c.birthDate ? isAdultByBirth(c.birthDate) : false;
    return {
      ok: true,
      status: data.status,
      name: c.name,
      birth: c.birthDate,
      gender: mapGender(c.gender),
      phone: c.phoneNumber,
      carrier: c.operator,
      isForeigner: c.isForeigner,
      isAdult,
      ciHash: c.ci ? hashCi(c.ci) : undefined,
      mock: false,
    };
  } catch {
    return { ok: false, status: 'error', mock: false };
  }
}
