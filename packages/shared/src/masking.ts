/**
 * 외부 연락처 자동 마스킹 (trust-safety.md §3-3).
 * 매칭 성사 전 채팅에서 휴대폰/카톡/인스타/텔레그램/이메일을 마스킹한다.
 * 우회(자음 분리·전각·공백 삽입) 대응을 위해 정규화 후 재검사.
 */

const MASK = '●●●●';

/** 우회 대응: 전각 숫자→반각, 흔한 치환 제거(공백/점/하이픈은 패턴에서 처리) */
function normalizeForScan(s: string): string {
  return s.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0));
}

interface Rule {
  kind: string;
  re: RegExp;
}

/**
 * 키워드와 식별자 사이 연결부.
 * "카톡 id: minjun92" 뿐 아니라 실제로 훨씬 흔한 "카톡 아이디는 jiyoon99",
 * "인스타 아디 gallery_kim" 처럼 한글 조사가 끼어드는 형태까지 잡는다.
 * 조사 구간은 5자 이내로 제한해 "카톡보다 여기가 편해요" 같은 문장을 오탐하지 않는다.
 */
const GAP = '(?:\\s*[:：@]?\\s*(?:id|아이디|아디)?[가-힣]{0,3}\\s*[:：@]?\\s*)';
/**
 * 식별자 — 핸들처럼 보이는 것만 인정한다(숫자·_·. 포함 또는 6자 이상).
 * "카톡 안 써요 ok" 처럼 뒤에 짧은 영단어가 오는 경우를 마스킹하지 않기 위한 조건.
 */
const HANDLE = '(?:[A-Za-z][\\w._-]*[\\d._-][\\w._-]*|[A-Za-z][\\w._-]{5,})';
const ID = `${GAP}${HANDLE}`;

const RULES: Rule[] = [
  // 휴대폰: 010-1234-5678 / 010 1234 5678 / 01012345678
  { kind: 'phone', re: /01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/g },
  // 11자리 연속 숫자(번호 우회)
  { kind: 'digits', re: /\b\d{11}\b/g },
  // 이메일
  { kind: 'email', re: /[\w.+-]+@[\w-]+\.[\w.]+/g },
  // 카카오/오픈채팅 (키워드 + 식별자)
  {
    kind: 'kakao',
    re: new RegExp(`(?:카카오톡|카톡|오픈\\s?채팅|오카|kakao|katalk|open\\s?chat)${ID}`, 'gi'),
  },
  // 인스타
  { kind: 'insta', re: new RegExp(`(?:인스타그램|인스타|instagram|insta)${ID}`, 'gi') },
  // 텔레그램
  { kind: 'telegram', re: new RegExp(`(?:텔레그램|telegram)${ID}|t\\.me\\/[\\w._-]+`, 'gi') },
  // 라인/위챗
  { kind: 'line', re: new RegExp(`(?:라인|line|위챗|wechat)${ID}`, 'gi') },
];

export interface MaskResult {
  text: string;
  masked: boolean;
  kinds: string[];
}

export function maskExternalContact(input: string): MaskResult {
  const scan = normalizeForScan(input);
  let masked = false;
  const kinds = new Set<string>();
  let out = input;

  for (const rule of RULES) {
    if (rule.re.test(scan)) {
      kinds.add(rule.kind);
      masked = true;
    }
    rule.re.lastIndex = 0;
    // 매치 전체를 마스킹 (보수적 — 키워드+식별자 모두)
    out = out.replace(rule.re, MASK);
    rule.re.lastIndex = 0;
  }

  return { text: out, masked, kinds: [...kinds] };
}

export const MASK_NOTICE = '외부 연락처는 매칭 성사 후 자동 공유됩니다.';
