# CHANGELOG

각 Phase 종료 시 결과 요약을 기록한다.

## Phase 0 — 프로젝트 셋업 + CLAUDE.md ✅

- 평면 목업 repo를 **pnpm workspace + turborepo 모노레포**로 in-place 재구성.
- 기존 목업(standalone HTML, 멀티파일 mockup, 원본 프롬프트)을 `docs/reference/`로 이동 — 디자인 진실의 원천.
- **디자인 토큰 추출**: `theone-standalone.html`의 CSS 변수 → `packages/shared/src/tokens.ts` (컬러·폰트·간격·radius). 직업 카테고리(남11/여13)·Zod 스키마도 shared로.
- 워크스페이스 구성:
  - `apps/web` (Next.js 14, 잉크블랙 플레이스홀더 LP)
  - `apps/admin` (Next.js, Basic Auth 미들웨어 + 운영 콘솔 홈)
  - `apps/mobile` (Expo SDK 51 + Expo Router 스켈레톤)
  - `packages/shared` (tokens / job-categories / schemas)
  - `packages/db` (Prisma + PostgreSQL, Waitlist 모델 + 클라이언트 싱글톤)
  - `packages/auth` (인증 Provider 인터페이스 + mock, CODEF 재사용 자리)
- 루트 설정: `turbo.json`, `tsconfig.base.json`, `.npmrc`, Prettier, `.gitignore`.
- `.env.example` (DB·Supabase·Resend·S3/KMS·CODEF·PortOne·카카오·PASS·Sentry·PostHog·GA4·Clarity 자리).
- 관측 자리: Sentry(`instrumentation.ts`), PostHog(`analytics-provider.tsx`).
- 문서: `CLAUDE.md`(제품·디자인·금기·인프라·로드맵), `README.md`.
- husky + lint-staged (커밋 시 prettier/eslint).

**다음**: Phase 1 (LP + 웨이팅리스트). 등록자 200명 미만이면 컨셉 재고 — 코드 더 짜기 전 시장 검증.
