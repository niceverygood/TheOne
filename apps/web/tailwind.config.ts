import type { Config } from 'tailwindcss';

/**
 * 색/폰트 값은 packages/shared/src/tokens.ts 가 진실의 원천.
 * 여기서는 Tailwind 유틸로 노출만 한다. 토큰 변경 시 양쪽 동기화.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0F1014', 2: '#1A1F2E', soft: '#1F222B' },
        ivory: { DEFAULT: '#FAF7F2', 2: '#F5F1EA', 3: '#EDE8DE' },
        champagne: { DEFAULT: '#B8956A', soft: 'rgba(184,149,106,0.16)' },
        gray: { DEFAULT: '#8B8378', soft: '#B5AFA4' },
        sage: '#6B8E7F',
        terra: '#A85547',
        hair: { light: '#EDE8DE', dark: '#1F222B' },
      },
      fontFamily: {
        'serif-kr': ['var(--font-serif-kr)', "'Noto Serif KR'", 'serif'],
        'sans-kr': [
          'var(--font-sans-kr)',
          "'Pretendard'",
          '-apple-system',
          'system-ui',
          'sans-serif',
        ],
        'sans-en': ['var(--font-sans-en)', "'Inter'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'SF Mono'", 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        kr: '-0.02em',
        en: '-0.01em',
      },
      maxWidth: {
        frame: '520px',
      },
      borderRadius: {
        card: '2px',
      },
      spacing: {
        gutter: '24px',
      },
    },
  },
  plugins: [],
};

export default config;
