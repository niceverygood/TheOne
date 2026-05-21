# CHANGELOG

각 Phase 종료 시 결과 요약을 기록한다.

## Phase 2 — 운영 SOP + 개인정보 설계 (v0.1 초안) ✅

코드 변경 없음. `docs/` 결정 문서 4종(+처리방침 초안) 작성. 변호사 검토 전 초안 — 외부 노출 금지.

**산출물**
- `docs/verification-sop.md` — 인증 4종(학력·재산·차량·부동산) 수집·검증·SLA(24h)·운영자 권한 3단계(viewer/reviewer/admin)·반려 문구 10종·갱신·AccessLog·워터마크. **결정 필요 13건**.
- `docs/privacy-design.md` ★ — 처분사례 조사(아만다/테크랩스 **2.24억 과징금**·목적외이용·경찰고발, 거짓광고 전자상거래법 제재, 유출 **72h 신고**), 수집 분류표, 보유/파기 + 자동 파기 cron 명세 + 백업 파기, 안전성 확보조치 8개 구현안, 제3자/위탁·국외이전, PIA 약식, 침해대응 절차. **결정 필요 7건(ⓐ~ⓖ)**.
- `docs/privacy-policy-v0.1.md` — 처리방침 법정 14항목 초안.
- `docs/trust-safety.md` — 사진검증(v1 운영자 + v1.1 liveness: 알체라/드림시큐리티/한국인식산업 조사), 신고 8종 강퇴 매트릭스, 외부연락처 마스킹 정규식 + 우회 대응, 미성년 차단(청소년유해매체 선례), 모더레이션 SOP. **결정 필요 4건**.
- `docs/legal-checklist.md` — 사업자 인허가, 약관 3종, 적용법령 8개, 결제·환불, 콘텐츠 책임, 분쟁, 외부검토·계약, **D-7 체크리스트 30개**. **결정 필요 2건(㉠㉡)**.
- README `docs/` 섹션, CLAUDE.md §7.5 운영 정책 링크 추가.

**조사 출처(web_search)**: 개인정보위 아만다 처분, 데이팅앱 거짓광고 제재, 유출 신고 기준, 국내 face liveness 솔루션, 청소년유해매체물 지정.

**미해결 / 게이트**
- 결정 필요 총 **26건**을 운영진(최종 결정자 한승수)이 확정해야 Phase 3 스키마/심사 콘솔 반영 가능. 핵심: 재산 최소기준(통과율 23% 직결), CODEF 신용정보법 추가동의, 탈퇴/대화 보유기간, 침해 통지 기한(72h 정정).
- `privacy-design.md`·`legal-checklist.md`·`privacy-policy-v0.1.md`는 **변호사 검토 후 v1.0 태깅 전 실제 사용 금지**. 검토 견적은 별도.

---

## Phase 1 — LP + 웨이팅리스트 ✅

**산출물**
- `apps/web` 랜딩: Hero(통과율 23%) · ProofStrip · HowItWorks(3-step) · Verification4 · WaitlistForm · FAQ(8) · Footer(바틀·376-87-01076). 잉크블랙 미니멀, 토큰 준수, 골드/하트/그라데이션·"프리미엄" 단어 없음.
- 폰트 셀프호스팅: Noto Serif KR·Inter(`next/font/google`) + Pretendard Variable(`next/font/local`, woff2 번들).
- **사전등록 폼 + Server Action**: Zod(`waitlistInputSchema`) 검증 → `@theone/db` insert → 성공 시 "#N번째 신청자" + 공유 초대코드(seq 기반). 이메일 중복 한국어 안내, 허니팟(`website`)·Cloudflare Turnstile·ip_hash rate limit(1분 3회).
- **UTM 캡처**: `apps/web/middleware.ts`가 utm_*를 1h 쿠키(첫터치)로 저장 → 제출 시 동봉.
- **메일링**: `@theone/shared/email` React Email 2종(waitlist-confirm, referral-thanks) + `apps/web/lib/mailer.ts`(Resend, 키 없으면 no-op). `/api/confirm` 라우트.
- **계측**: PostHog 4 이벤트 + 자동 pageview, GA4·Clarity 스니펫. (키 없으면 no-op)
- **SEO/OG**: metadata API, `opengraph-image.tsx`(next/og 동적, 잉크블랙), `robots.ts`(/admin·/api 차단), `sitemap.ts`.
- **DB**: `Waitlist` 보강(seq·utm_term·utm_content·user_agent·ip_hash·confirmed_at), 초기 마이그레이션 SQL(`20260520000000_phase1_waitlist`), `@theone/db` 데이터 액세스(create/stats/list + DuplicateEmailError).
- **apps/admin/waitlist**: 카드4(총·어제·성비·최다직군) + recharts 14일 추이 + 직군/UTM 필터 테이블 + CSV export(`/waitlist/export`, ip_hash·UA 제외, BOM). 기존 Basic Auth 미들웨어로 보호.
- 배포 자리: `apps/web|admin/vercel.json`(icn1). README에 Supabase·Resend·Turnstile·PostHog·GA4·Clarity·Sentry·Vercel 키 발급 절차 부록.

**검증**: `@theone/shared|db` typecheck OK · web/admin `next build` OK(모든 라우트·미들웨어·OG 생성). 

**결정 / 의도적 deferral**
- Sentry는 SDK 미설치, `instrumentation.ts` 가드 + README 활성화 절차만(ops 메모상 "추후 무방"). Phase 1.5.
- rate limit은 인메모리 LRU(서버리스 다중 인스턴스 한계) → Phase 2+ Upstash 교체.
- `/api/confirm`은 코드 형식만 검증 후 리다이렉트. seq↔이메일 매핑한 실제 confirmedAt 기록은 Phase 1.5.

**미해결 / 운영 필요**
- 외부 키 4종(Supabase·Resend·Turnstile·PostHog) 실제 발급·연결 필요(코드는 graceful degrade). Resend 발신 도메인 DNS 인증 ~30분.
- 실제 DB 연결 후 `prisma migrate deploy` 1회 실행 필요.
- Lighthouse(성능 90+/접근성 95+)·실제 메일 수신·Turnstile 차단·OG 카톡 표시는 키 연결 후 라이브 검증 항목.

**게이트**: 출시 2주 등록자 200 미만 또는 직군 70%+ 편향·메일 오픈율 30% 미만이면 컨셉 재고. Phase 2 진입 전 등록수·직군분포·유입채널 dump 확인.

---

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
