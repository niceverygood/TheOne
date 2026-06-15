/**
 * 등록 순번(seq) → 공유용 초대코드.
 * 예: seq 142 → "THE-0001-3M" 형태 (사람이 읽고 받아쓰기 쉬운 대문자/숫자, 혼동 문자 제거).
 */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 0,1,I,O 제외

export function referralCodeFromSeq(seq: number): string {
  let n = seq;
  let tail = '';
  do {
    tail = ALPHABET[n % ALPHABET.length] + tail;
    n = Math.floor(n / ALPHABET.length);
  } while (n > 0);
  return `THE-${String(seq).padStart(4, '0')}-${tail.padStart(2, ALPHABET[0])}`;
}

/**
 * 추천 코드 → 등록 순번(seq). 형식·체크섬(tail) 검증 후 seq 반환, 아니면 null.
 * (referralCodeFromSeq 로 재생성해 동일해야 통과 → 오타·위조 코드 차단)
 */
export function referralSeqFromCode(code: string): number | null {
  const norm = code.trim().toUpperCase();
  const m = norm.match(/^THE-(\d+)-[2-9A-Z]+$/);
  if (!m) return null;
  const seq = parseInt(m[1]!, 10);
  if (!Number.isFinite(seq) || seq <= 0) return null;
  if (referralCodeFromSeq(seq) !== norm) return null;
  return seq;
}

/**
 * 회원 추천 보상 (MVP) — 크레딧·1단계·품질 이벤트 기반.
 * - 심사 통과(피추천인 active): 고정 크레딧
 * - 첫 결제: 결제 크레딧의 정률
 * - 클로백: N일 내 탈퇴/정지(심사보상)·환불(결제보상) 시 회수
 */
export const REFERRAL_REWARD = {
  /** 피추천인 가입 심사 통과 시 추천인에게 지급 */
  signupApprovedCredits: 30,
  /** 피추천인(신규) 가입 심사 통과 시 본인에게 지급 — 양방향 보상(파운딩 추천 루프). */
  welcomeCredits: 30,
  /** 피추천인 첫 결제 시 추천인에게 = 결제 크레딧 × 비율 */
  firstPurchaseRate: 0.1,
  /** 보상 회수(클로백) 유효기간(일) */
  clawbackDays: 7,
} as const;

export type ReferralRewardType = 'signup_approved' | 'first_purchase';
