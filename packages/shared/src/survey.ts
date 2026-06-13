/**
 * 가치관 설문(60문항) — 더원의 킥: "검증은 입장권, 매칭은 가치관".
 *
 * 가입 step05에서 60문항(결혼관·라이프스타일·관계·갈등 각 15문항)을 Likert 1~5로 응답.
 * 두 사람의 응답이 얼마나 일치하는지를 케미 일치도(0~100)로 환산해 큐레이션 점수의
 * 단일 최대 가중치로 쓴다(`matching.ts` WEIGHTS.valuesAlignment).
 *
 * 진실의 원천: docs/reference/mockup/screens/signup/step05-survey.jsx
 *            docs/reference/prototypes/curation-drop.html ("케미 일치도 87%")
 */

/** 문항 수 (4 카테고리 × 15) */
export const SURVEY_QUESTION_COUNT = 60;

/** Likert 척도 양 끝값 (1 전혀 아니다 ~ 5 매우 그렇다) */
export const SURVEY_SCALE_MIN = 1;
export const SURVEY_SCALE_MAX = 5;

export type SurveyCategoryKey = 'marriage' | 'lifestyle' | 'relationship' | 'conflict';

/** 카테고리별 문항 구간 [start, end) — step05 설문 순서와 동일 */
export const SURVEY_CATEGORIES: ReadonlyArray<{
  key: SurveyCategoryKey;
  kr: string;
  start: number;
  end: number;
}> = [
  { key: 'marriage', kr: '결혼관', start: 0, end: 15 },
  { key: 'lifestyle', kr: '라이프스타일', start: 15, end: 30 },
  { key: 'relationship', kr: '관계', start: 30, end: 45 },
  { key: 'conflict', kr: '갈등', start: 45, end: 60 },
];

/** 응답 배열이 매칭에 쓸 수 있는 완전한 형태인지 (60문항, 1~5) */
export function isCompleteSurvey(
  answers: readonly number[] | null | undefined,
): answers is number[] {
  if (!answers || answers.length !== SURVEY_QUESTION_COUNT) return false;
  return answers.every(
    (n) => Number.isInteger(n) && n >= SURVEY_SCALE_MIN && n <= SURVEY_SCALE_MAX,
  );
}

/** 한 구간 [start,end)의 일치도(0~100). 문항당 유사도 = 1 - |a-b|/4 의 평균. */
function alignRange(
  a: readonly number[],
  b: readonly number[],
  start: number,
  end: number,
): number {
  const span = SURVEY_SCALE_MAX - SURVEY_SCALE_MIN; // 4
  let sum = 0;
  for (let i = start; i < end; i++) {
    // isCompleteSurvey 통과 후 호출 — 범위 내 인덱스는 항상 존재.
    sum += 1 - Math.abs((a[i] as number) - (b[i] as number)) / span;
  }
  return Math.round((sum / (end - start)) * 100);
}

/**
 * 두 응답의 전체 케미 일치도(0~100). 한쪽이라도 미완료면 null.
 * null = "가치관 데이터 없음" → 매칭 점수에 가산하지 않는다(중립).
 */
export function surveyAlignment(
  a: readonly number[] | null | undefined,
  b: readonly number[] | null | undefined,
): number | null {
  if (!isCompleteSurvey(a) || !isCompleteSurvey(b)) return null;
  return alignRange(a, b, 0, SURVEY_QUESTION_COUNT);
}

export interface SurveyBreakdown {
  overall: number;
  marriage: number;
  lifestyle: number;
  relationship: number;
  conflict: number;
}

/**
 * 큐레이션 도시에가 보여주는 케미 3축(결혼관·라이프스타일·갈등 해결).
 * 관계축은 종합(overall)에만 반영하고 화면에는 3축만 노출 — 목업 curation 화면과 동일.
 */
export const CHEMISTRY_DISPLAY_AXES: ReadonlyArray<{ key: SurveyCategoryKey; kr: string }> = [
  { key: 'marriage', kr: '결혼관' },
  { key: 'lifestyle', kr: '라이프스타일' },
  { key: 'conflict', kr: '갈등 해결' },
];

/** 케미 분해 → 도시에 3축 막대용 [{kr, value}]. */
export function chemistryAxes(b: SurveyBreakdown): { kr: string; value: number }[] {
  return CHEMISTRY_DISPLAY_AXES.map((a) => ({ kr: a.kr, value: b[a.key] }));
}

/**
 * 카테고리별 일치도 + 전체 — 큐레이션 도시에의 "결혼관 92 · 라이프 87 · 갈등 79" 표기용.
 * 한쪽이라도 미완료면 null.
 */
export function surveyBreakdown(
  a: readonly number[] | null | undefined,
  b: readonly number[] | null | undefined,
): SurveyBreakdown | null {
  if (!isCompleteSurvey(a) || !isCompleteSurvey(b)) return null;
  const out: Record<string, number> = { overall: alignRange(a, b, 0, SURVEY_QUESTION_COUNT) };
  for (const c of SURVEY_CATEGORIES) {
    out[c.key] = alignRange(a, b, c.start, c.end);
  }
  return out as unknown as SurveyBreakdown;
}
