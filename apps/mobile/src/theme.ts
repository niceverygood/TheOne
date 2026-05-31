/**
 * THE ONE 모바일 디자인 토큰.
 * ⚠️ packages/shared/src/tokens.ts 와 1:1 동기화. (Metro 모노레포 transpile 회피 위해 로컬 미러)
 * 변경 시 양쪽 + docs/reference/theone-standalone.html 동기화.
 */
export const C = {
  ink: '#0F1014',
  ink2: '#1A1F2E',
  inkSoft: '#1F222B',
  ivory: '#FAF7F2',
  ivory2: '#F5F1EA',
  ivory3: '#EDE8DE',
  champagne: '#B8956A',
  champagneSoft: 'rgba(184,149,106,0.16)',
  gray: '#8B8378',
  graySoft: '#B5AFA4',
  sage: '#6B8E7F',
  terra: '#A85547',
  hairLight: '#EDE8DE',
  hairDark: '#1F222B',
} as const;

// 폰트 패밀리 이름은 expo-font(useFonts)와 web +html.tsx CSS의 family 이름과 일치해야 한다.
// 네이티브: app/_layout.tsx의 useFonts에서 동일 키로 등록 (PretendardVariable.ttf 등).
// 웹: app/+html.tsx가 Google Fonts·Pretendard CDN으로 동일 family를 로드.
export const F = {
  serifKr: 'Noto Serif KR',
  serifEn: 'Playfair Display',
  sansKr: 'Pretendard',
  sansEn: 'Inter',
  mono: 'JetBrains Mono',
} as const;

export const S = { s1: 8, s2: 16, s3: 24, s4: 40, s5: 64, gutter: 24 } as const;

/** 카드 radius 2 (날카롭게). 그림자 없음 — hairline border. */
export const RADIUS = 2;
