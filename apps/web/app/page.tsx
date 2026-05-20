import { colors } from '@theone/shared';

/**
 * Phase 0 플레이스홀더 랜딩. 정식 LP(Hero / 인증4종 / 작동방식 / FAQ / 사전등록 폼)는
 * Phase 1 에서 구현. 톤은 docs/reference/theone-standalone.html 잉크블랙 미니멀 그대로.
 */
export default function HomePage() {
  return (
    <main
      style={{ background: colors.ink, color: colors.ivory }}
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <p className="font-sans-en text-[11px] uppercase tracking-[0.22em] text-gray-soft">
        Application Only
      </p>
      <h1 className="font-serif-kr mt-7 text-5xl font-bold leading-tight">THE ONE</h1>
      <p className="font-serif-en mt-3 text-lg italic text-gray-soft">The One, and only.</p>
      <p className="font-sans-kr mt-10 max-w-sm text-sm leading-relaxed text-ivory-3/70">
        학력 · 재산 · 차량 · 부동산. 4종 인증을 통과한 사람만.
      </p>
      <div className="mt-12 flex flex-col items-center gap-1">
        <span className="font-sans-en text-[10px] uppercase tracking-[0.14em] text-gray">
          가입 통과율
        </span>
        <span className="font-serif-kr text-4xl font-bold" style={{ color: colors.champagne }}>
          23%
        </span>
      </div>
      <p className="font-sans-kr mt-16 text-xs text-gray">
        Phase 1 — 랜딩 + 웨이팅리스트 준비 중 · 주식회사 바틀
      </p>
    </main>
  );
}
