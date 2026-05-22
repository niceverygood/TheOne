# CHANGELOG

각 Phase 종료 시 결과 요약을 기록한다.

## Phase 6 — 출시 준비 ✅

스토어·법무·CS·콜드스타트·운영 인프라 산출물 + 검증 가능한 운영 코드.

**docs/launch 5종**
- `store-listing.md` — 앱스토어/플레이 등록 자료(설명·키워드·스크린샷 5·영상·**데이팅 카테고리 심사 체크리스트**, IAP vs 외부PG 결정필요).
- `cs-manual.md` — CS 운영 원칙 + **헬프센터 FAQ 30** + 응대 템플릿.
- `cold-start.md` — **상위 100명 동시 온보딩** 전략, 첫 큐레이션 풀 확보 체크, 부족 시 대응.
- `ops-runbook.md` — Sentry/PostHog/Slack/Status page, **출시 4주 KPI 정의**(D1/D7·인증완주율·첫매칭시간·ARPU), 장애 대응, 내부 정비(정관/감사).
- `launch-checklist.md` — D-14~D+28 통합 체크리스트(legal D-7 통합).

**코드**
- `packages/db/kpi.ts` `getLaunchKpis()` — 활동회원·인증완주율·첫매칭 중앙값·ARPU·매출·신청서·미처리신고.
- `apps/admin/kpi` 출시 KPI 대시보드.
- `apps/web/api/health` 헬스체크(DB 핑) + `lib/slack.ts` 운영 알림(키 없으면 no-op).

**검증**: db typecheck OK · web/admin `next build` OK(`/api/health`·`/kpi` 포함).

**미해결 / 출시 게이트**
- 약관·개인정보 **변호사 검토(v1.0)**, 본인인증(PASS/KCB)·PortOne 실계약, 결제 방식(IAP vs 외부PG) 확정, 첫 큐레이션 풀 충족 — 미충족 시 출시 연기.
- 모바일 잔여 화면(Phase 4 백로그) 완료 + EAS 빌드·스토어 제출.

---

## Phase 5 — 결제 + 매칭 v1 + 채팅 v1 + Trust & Safety ✅ (백엔드)

매칭 엔진·결제·채팅·신뢰안전을 백엔드 + 어드민 중심으로 구현. 도메인 로직은 단위테스트로 검증.

**packages/shared (순수 로직 + vitest 13 통과)**
- `matching.ts`: 광역시도 인접 그래프, 나이 ±5, 뱃지 겹침 점수, `pickTodayCuration`(가중치 룰베이스).
- `masking.ts`: 외부 연락처(휴대폰/카톡/인스타/텔레그램/라인/이메일) 자동 마스킹 + 전각·연결부 우회 대응.
- `credits.ts`: 충전 패키지(3/5/10만원), 신청서 비용(20/50C), `refundableAmount`(7일·미사용분 환불 정책 코드화).

**packages/db**
- 스키마 확장: `CurationLog`(발송·반응 로그, ML 데이터), `Order`(PortOne 충전) + enum, User.suspendCount. 마이그레이션 `20260522000000_phase5_matching_payment`.
- 연산: `getTodayCuration`/`runDailyCuration`(매칭+로그), `createOrder`/`markOrderPaid`(멱등)/`refundOrder`, `sendMessage`(마스킹)/`getMessages`(폴링), `createReport`(누적 3회 자동정지)/`moderateUser`/`listReportQueue`.

**apps/web**
- 결제 API: `/api/payment/create`·`/webhook`(금액 재검증+적립, 멱등)·`/refund`. PortOne v2 검증/취소(`lib/portone.ts`, 키 없으면 mock). 카카오 정기결제 CID 자리.
- `/api/cron/curation`(매일 자정 KST, `CRON_SECRET` 보호) + `vercel.json` crons.

**apps/admin**
- `/reports` Trust & Safety: 신고 누적순 큐, 카테고리별 사유, 일시정지/영구강퇴/복구(reviewer+ 게이트, AccessLog), 3건 임계 빨강 표시.

**검증**: shared vitest 13/13 · web/admin `next build` OK · 로컬 DB 재시드(신고 5건·결제 1건) · `/reports` 브라우저 렌더 확인.

**미해결 / 후속**
- 모바일 UI(채팅 폴링 화면·크레딧 충전·매칭함·신청서)는 Phase 4 백로그와 함께 연동.
- 실시간 채팅(Pusher/Ably)·ML 매칭(데이터 1만 건 후)·PortOne 실계약/웹훅 서명검증·사진검증 liveness(v1.1).
- 결제 실패/취소/부분환불 E2E 테스트 매트릭스(실 PortOne 연동 후).

---

## Phase 4 — 모바일 앱 (Expo) 착수 ✅ (진행 중)

`apps/mobile`을 Expo SDK 51 + React Native + Expo Router로 본격 구현 시작. 목업 24개 중 1순위(가입 플로우) + 톤세터를 이식하고 **Expo Web으로 브라우저 미리보기**까지 동작.

**산출물**
- 디자인 시스템: `src/theme.ts`(tokens 미러), `src/ui.tsx` 프리미티브(Txt·Btn·Screen·Hairline·VerifiedDots·Portrait(SVG)·StepDots·Field·ChoiceRow), `src/app-shell.tsx`(AppShell·FormFooter).
- 상태/인증: `src/store.ts`(zustand 가입 스토어), `src/auth-mock.ts`(Mock 본인인증 — 만19세 차단, PASS/KCB 교체 예정), `src/jobs.ts`(남11/여13 미러).
- 화면(Expo Router file-based) **11종**: 진입 스플래시(통과율 23%) · 가입 Intro→Step01(본인인증)~Step06(추천인)→신청완료 · 큐레이션(03) · 프로필(04) · 인증 허브(19).
- 웹 미리보기: `app/+html.tsx`(폰트 CDN), `metro.config.js`(모노레포), 로컬 엔트리 `index.js`.

**환경 변경 (중요)**
- pnpm `node-linker`를 **isolated → hoisted**로 전환(`.npmrc`). Expo/Metro가 pnpm isolated에서 전이 의존성(react-refresh, expo-splash-screen 등)을 해석하지 못하는 문제 해결. **web/admin `next build`·shared/db typecheck 모두 hoisted에서 정상** 확인.
- mobile deps 추가: react-native-web·react-dom·@expo/metro-runtime·safe-area-context·screens·svg·zustand·expo-splash-screen·@react-navigation/native.

**검증**: mobile `tsc --noEmit` OK · Expo Web 번들 컴파일 OK(3.9MB) · 스플래시·가입 Step02(직업 그리드) 브라우저 렌더 확인 · web/admin 재빌드 OK.

**미해결 / 후속**
- 잔여 화면(만남 신청서12·매칭함13·채팅15·크레딧16·케미리포트17·프라이버시18·인증 4종 폼·심사중24) 이식 — 2~6순위.
- 네이티브 폰트(expo-font ttf)·실기기/시뮬레이터 실행·tRPC/TanStack Query API 연동·정식 PASS/KCB 본인인증.
- 디자인 1px 대조: PR마다 목업 HTML ↔ RN 스크린샷 병행 첨부 규칙(운영).

---

## Phase 3 — DB 스키마 + 인증 백엔드 + 심사 콘솔 ✅

Phase 2 SOP를 코드로 옮긴 단계. 무게중심은 스키마 + 운영자 심사 콘솔 + 시드.

**DB (`packages/db`)**
- 전체 도메인 스키마: `User`·`Profile`·`Operator`·`VerificationApplication`·`VerificationDocument`·`VerificationBadge`·`AccessLog`·`Match`·`Conversation`·`Message`·`Credit`·`CreditTransaction`·`ReportLog`·`BlockList` + enums(권한 3단계·인증상태·신고카테고리 등). Match/Message/Credit 등 매칭·경제 모델은 스키마만(로직 Phase 5).
- 마이그레이션 `20260521000000_phase3_domain`(diff 생성, 317줄). `prisma generate` OK.
- 데이터 액세스: 심사 대기열(SLA 임박순)·통계·승인(뱃지 upsert)·반려·사용자 현황·신청 생성. 승인/반려는 **트랜잭션 + AccessLog** 동반.
- 시드: 운영자 3명(viewer/reviewer/admin), 더미 사용자 50명+프로필, 인증 신청 20건(승인10/반려5/대기5). `prisma db seed`(tsx).

**shared**: `verification.ts` — SLA(24h)·유효기간(1년)·파기(30일) 상수, 권한 위계 헬퍼, 인증 4종 라벨·가액 구간·필수서류, **반려 사유 표준 10종**.

**apps/admin 심사 콘솔**
- 운영자 권한 resolve(Basic Auth username → Operator role, env admin 폴백), `canReview` 게이트.
- `/verifications` 대기열: 통계 카드(대기·SLA임박/초과·오늘 승인/반려), SLA 임박순 테이블(초과 빨강).
- `/verifications/[id]` 심사 상세: 메타 + **보안 문서 뷰어**(워터마크=운영자ID+시각, 다운로드·우클릭·드래그 차단), 승인/반려 패널(반려 10종 템플릿), viewer는 메타만.
- 모든 열람·승인·반려 시 **AccessLog 자동 기록**(reviewer=view_document/viewer=view_meta).

**apps/web**
- `lib/s3.ts`: 인증 서류 presigned PUT 발급(SSE-KMS) — 자격증명 없으면 graceful mock, 실제 코드는 TODO 블록.
- `/verify` 인증 허브: 시드 사용자 기준 4종 상태 뱃지(데모). 실제 제출은 회원 본인인증(Phase 4) 연결 후.

**검증**: shared/db typecheck OK · web/admin `next build` OK(/verifications, /verifications/[id], /verify 포함).

**미해결 / 의도적 deferral**
- **회원 로그인/세션 부재**(Phase 1은 웨이팅리스트만, 본인인증 PASS는 Phase 4) → web 인증 제출은 시드 기준 데모. 실 사용자 업로드 플로우는 Phase 4 본인인증 연결 후 활성화.
- 운영자 인증은 단일 Basic Auth 게이트 + username→role 해석. 정식 운영자 로그인/세션·MFA·IP 화이트리스트는 후속.
- S3/KMS presign은 자격증명 설정 + `@aws-sdk/*` 설치 후 TODO 활성화 필요. 자동 파기 cron(서류 30일)·OCR 자동검증은 백로그.
- 실제 DB 연결 후 `prisma migrate deploy` + `prisma db seed` 1회 실행 필요.

---

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
