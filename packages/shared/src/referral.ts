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
