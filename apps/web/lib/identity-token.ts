import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/**
 * 본인인증 봉인 토큰 — ciHash 를 클라이언트에 평문 노출하지 않고 안전하게 전달한다.
 *
 * KCB 결과(/api/identity/kcb/result)는 ciHash 를 응답에 직접 넣지 않는다(privacy-design §2-4).
 * 대신 서버가 ciHash 를 AES-256-GCM 으로 봉인한 토큰만 내려주고, 가입 제출(/api/signup) 시
 * 클라이언트가 그 토큰을 그대로 돌려주면 서버가 열어 User.ciHash 로 저장한다.
 * 토큰은 인증·만료가 포함된 불투명 값이라 클라이언트는 ciHash 를 알 수 없다.
 *
 * 키는 IDENTITY_CI_PEPPER 에서 파생(hashCi 와 동일 비밀 재사용). 미설정 시 빈 pepper(dev).
 */
const KEY = createHash('sha256')
  .update(`idtoken:${process.env.IDENTITY_CI_PEPPER ?? ''}`)
  .digest(); // 32 bytes
const TTL_MS = 60 * 60 * 1000; // 1시간 — 인증 직후 가입 제출까지의 유효시간

export interface SealedIdentity {
  ciHash: string;
  phone?: string;
}

/** ciHash(+phone)를 만료시각과 함께 봉인. base64url 토큰 반환. */
export function sealIdentity(payload: SealedIdentity): string {
  const iv = randomBytes(12);
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + TTL_MS }), 'utf8');
  const cipher = createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64url');
}

/** 봉인 토큰을 열어 ciHash(+phone)를 복원. 변조/만료/형식오류 시 null. */
export function openIdentity(token: string): SealedIdentity | null {
  try {
    const buf = Buffer.from(token, 'base64url');
    if (buf.length < 28) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    const obj = JSON.parse(dec) as SealedIdentity & { exp?: number };
    if (!obj.exp || obj.exp < Date.now() || !obj.ciHash) return null;
    return { ciHash: obj.ciHash, phone: obj.phone };
  } catch {
    return null;
  }
}
