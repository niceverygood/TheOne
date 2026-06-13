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
  s += badgeOverlap(viewer.badges, c.badges) * WEIGHTS.badgePerOverlap;
  s += c.badges.length * WEIGHTS.badgeCount;
  return s;
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
