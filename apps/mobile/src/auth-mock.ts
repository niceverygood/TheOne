/**
 * 본인인증 Mock 모듈 (Phase 4).
 * 정식 PASS/KCB(나이스) 계약 후 동일 인터페이스로 교체한다.
 */
export interface IdentityResult {
  ok: boolean;
  name: string;
  birth: string; // YYYY-MM-DD
  gender: 'male' | 'female';
  carrier: string;
  /** 만 19세 이상 여부 (미성년 차단 — trust-safety §3-4) */
  isAdult: boolean;
}

export type Carrier = 'SKT' | 'KT' | 'LG U+' | '알뜰폰';
export const CARRIERS: Carrier[] = ['SKT', 'KT', 'LG U+', '알뜰폰'];

/** 인증번호 요청 (mock — 항상 482000 통과로 가정) */
export async function requestCode(_phone: string): Promise<{ sent: boolean }> {
  await delay(400);
  return { sent: true };
}

/** 인증번호 검증 → 신원 정보 반환 (mock) */
export async function verifyCode(code: string): Promise<IdentityResult> {
  await delay(500);
  const ok = code.length === 6;
  return {
    ok,
    name: '김민준',
    birth: '1992-03-14',
    gender: 'male',
    carrier: 'SKT',
    isAdult: true,
  };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
