/**
 * THE ONE · 디자인 토큰 (진실의 원천)
 * docs/reference/theone-standalone.html 의 CSS 변수에서 추출.
 *
 * 원칙: 절제된 럭셔리 — 골드/그라데이션/하트 금지. 잉크블랙 · 아이보리 · 뮤트 샴페인만.
 * 이 값들은 standalone 목업과 1:1로 일치해야 한다. 변경 시 목업도 함께 갱신할 것.
 */

export const colors = {
  /** 잉크 블랙 — 다크 배경 */
  ink: '#0F1014',
  /** 본문 잉크 — 라이트 위 주 텍스트 */
  ink2: '#1A1F2E',
  /** 다크 모드 hairline */
  inkSoft: '#1F222B',
  /** 아이보리 — 라이트 배경 */
  ivory: '#FAF7F2',
  /** 보조 표면 */
  ivory2: '#F5F1EA',
  /** 옅은 분리선 / placeholder */
  ivory3: '#EDE8DE',
  /** 뮤트 샴페인 — 액센트 */
  champagne: '#B8956A',
  champagneSoft: 'rgba(184, 149, 106, 0.16)',
  /** 보조 텍스트 */
  gray: '#8B8378',
  graySoft: '#B5AFA4',
  /** 검증 / 승인 */
  sage: '#6B8E7F',
  /** 거절 / 위험 */
  terra: '#A85547',
  hairLight: '#EDE8DE',
  hairDark: '#1F222B',
} as const;

export const fonts = {
  serifKr: "'Noto Serif KR', serif",
  serifEn: "'Playfair Display', serif",
  sansKr: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  sansEn: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', ui-monospace, monospace",
} as const;

/** 자간 — 한글 -2%, 영문 -1% / 행간 1.55 */
export const typography = {
  lineHeight: 1.55,
  letterSpacingKr: '-0.02em',
  letterSpacingEn: '-0.01em',
} as const;

/** 간격 스케일 8 / 16 / 24 / 40 / 64 */
export const spacing = {
  s1: 8,
  s2: 16,
  s3: 24,
  s4: 40,
  s5: 64,
  /** 좌우 기본 패딩 */
  gutter: 24,
} as const;

/** 카드 radius 2 (날카롭게). 그림자 없음 — 구분은 hairline border. */
export const radius = {
  card: 2,
  pill: 2,
} as const;

/** iPhone 14 Pro 기준 프레임 */
export const frame = {
  width: 375,
  height: 812,
} as const;

/** 검증 뱃지 상태 4종 */
export const badgeStates = ['none', 'pending', 'verified', 'rejected'] as const;
export type BadgeState = (typeof badgeStates)[number];

export const tokens = { colors, fonts, typography, spacing, radius, frame } as const;
export type Tokens = typeof tokens;
