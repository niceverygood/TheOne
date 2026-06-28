/**
 * 매칭 엔진 v1 (룰베이스) — verification-sop/큐레이션 정책.
 * 큐레이션 풀 = 같은 광역시도 ± 인접 + 나이대 ±5세.
 * 정렬 = 가치관(60문항) 일치도가 단일 최대 가중치 — "검증은 입장권, 매칭은 가치관".
 * 인증 뱃지·지역·나이는 보조 가산. ML은 데이터 1만 건 이후, 그 전엔 사람이 WEIGHTS 조정.
 */
import type { VerificationType } from './schemas';
import { surveyAlignment } from './survey';

/** 광역시도 인접 그래프 (간소화) */
export const REGION_ADJACENCY: Record<string, string[]> = {
  서울: ['경기', '인천'],
  경기: ['서울', '인천', '강원', '충북', '충남', '세종'],
  인천: ['서울', '경기'],
  강원: ['경기', '충북', '경북'],
  충북: ['경기', '강원', '충남', '세종', '대전', '경북', '전북'],
  충남: ['경기', '충북', '세종', '대전', '전북'],
  세종: ['충북', '충남', '대전'],
  대전: ['충북', '충남', '세종'],
  전북: ['충남', '충북', '전남', '광주', '경남', '경북'],
  전남: ['전북', '광주', '경남'],
  광주: ['전남', '전북'],
  경북: ['강원', '충북', '전북', '경남', '대구'],
  경남: ['전북', '전남', '경북', '대구', '울산', '부산'],
  대구: ['경북', '경남'],
  울산: ['경남', '부산'],
  부산: ['경남', '울산'],
  제주: [],
};

export const AGE_WINDOW = 5;

export function regionEligible(a: string, b: string): boolean {
  if (a === b) return true;
  return (REGION_ADJACENCY[a] ?? []).includes(b);
}

export function ageFromBirth(birth: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function ageEligible(a: number, b: number, window = AGE_WINDOW): boolean {
  return Math.abs(a - b) <= window;
}

/** 인증 뱃지 겹침 수 */
export function badgeOverlap(a: VerificationType[], b: VerificationType[]): number {
  const setB = new Set(b);
  return a.filter((t) => setB.has(t)).length;
}

export interface Candidate {
  region: string;
  age: number;
  badges: VerificationType[];
  /** 가치관 설문 60문항 응답(Likert 1~5). 미완료면 생략 — 가치관 가산 없음(중립). */
  survey?: number[];
}

export const WEIGHTS = {
  // 가치관 일치도(0~1) * 100 — 단일 최대 가중치. 더원의 킥: 검증은 필터, 매칭은 가치관.
  valuesAlignment: 100,
  sameRegion: 30,
  adjacentRegion: 12,
  ageCloseness: 4, // (window - |diff|) * 4
  badgePerOverlap: 8,
  badgeCount: 3, // 상대 뱃지 총수 * 3 (검증도 높을수록 가산)
  // 뱃지 총 가산 상한 — 인증 종수(최대 8~12종)가 많아도 가치관(최대 100)을 추월하지
  // 못하게 막는다. "검증은 입장권, 매칭은 가치관" 철학 보장. (H1)
  badgeScoreCap: 40,
} as const;

/** 후보 적합 여부 (하드 필터) */
export function isEligible(viewer: Candidate, c: Candidate): boolean {
  return regionEligible(viewer.region, c.region) && ageEligible(viewer.age, c.age);
}

/** 후보 점수 (높을수록 우선 큐레이션). 하드 필터 통과 가정. 정수 반환. */
export function scoreCandidate(viewer: Candidate, c: Candidate): number {
  let s = 0;
  // 가치관 일치도 — 단일 최대 가중치. 양쪽 설문 완료 시에만 가산.
  const align = surveyAlignment(viewer.survey, c.survey);
  if (align !== null) s += Math.round((align / 100) * WEIGHTS.valuesAlignment);
  if (viewer.region === c.region) s += WEIGHTS.sameRegion;
  else if (regionEligible(viewer.region, c.region)) s += WEIGHTS.adjacentRegion;
  s += (AGE_WINDOW - Math.abs(viewer.age - c.age)) * WEIGHTS.ageCloseness;
  // 뱃지 가산은 상한(badgeScoreCap)을 둬 가치관(최대 100)을 절대 추월하지 못하게 한다(H1).
  const badgeScore =
    badgeOverlap(viewer.badges, c.badges) * WEIGHTS.badgePerOverlap +
    c.badges.length * WEIGHTS.badgeCount;
  s += Math.min(badgeScore, WEIGHTS.badgeScoreCap);
  return s;
}

/** 인증 타입 → 한국어 라벨 (사유 문장용) */
const BADGE_LABEL: Partial<Record<VerificationType, string>> = {
  education: '학력',
  wealth: '재산',
  vehicle: '차량',
  realestate: '부동산',
  job: '직업',
  income: '소득',
};

/**
 * 큐레이션 사유 — 점수 숫자 대신 문장형 근거(최대 3개).
 * 화면 정책: 점수·퍼센트 노출 금지(좋아요 카운터 금기), 근거는 검증 사실 기반.
 */
export function matchReasons(viewer: Candidate, c: Candidate, max = 3): string[] {
  const out: string[] = [];

  if (viewer.region === c.region) out.push('같은 생활권에 거주하고 있어요');
  else if (regionEligible(viewer.region, c.region)) out.push('생활권이 가까워 만남이 수월해요');

  const diff = Math.abs(viewer.age - c.age);
  if (diff <= 2) out.push('나이대가 비슷해 공감대가 깊어요');
  else if (diff <= AGE_WINDOW) out.push('서로 어울리는 나이대예요');

  const setB = new Set(c.badges);
  const shared = viewer.badges.filter((t) => setB.has(t));
  if (shared.length > 0) {
    const labels = shared
      .map((t) => BADGE_LABEL[t])
      .filter(Boolean)
      .slice(0, 2)
      .join('·');
    out.push(`${labels} 인증을 나란히 완료했어요`);
  } else if (c.badges.length >= 3) {
    out.push(`${c.badges.length}종 인증을 마친 검증된 회원이에요`);
  }

  return out.slice(0, max);
}

/** 후보군에서 오늘의 1명 선택(최고 점수). 동점은 입력 순서 유지. */
export function pickTodayCuration<T extends Candidate>(viewer: Candidate, pool: T[]): T | null {
  let best: T | null = null;
  let bestScore = -Infinity;
  for (const c of pool) {
    if (!isEligible(viewer, c)) continue;
    const sc = scoreCandidate(viewer, c);
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }
  return best;
}
