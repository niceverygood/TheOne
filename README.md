# THE ONE (더원)

> 인증 기반 매칭 서비스 · 주식회사 바틀

학력·재산·차량·부동산 4종 인증을 통과한 사람만. 가입 통과율 23%. 무한 스와이프 없이 매일 1명 큐레이션.

작업 컨텍스트는 [`CLAUDE.md`](./CLAUDE.md)를, 디자인 진실의 원천은 [`docs/reference/theone-standalone.html`](./docs/reference/theone-standalone.html)(24개 화면 목업)을 참조.

## 구조

```
apps/
  web      Next.js 14 — 랜딩 + 웨이팅리스트        (:3000)
  admin    Next.js   — 운영자 인증심사 콘솔         (:3001)
  mobile   Expo + RN — 본 앱 (스켈레톤)
packages/
  shared   디자인 토큰 · Zod 스키마 · 직업 카테고리
  db       Prisma + PostgreSQL
  auth     인증 검증 로직 (CODEF 등 보비 재사용)
docs/
  reference/   목업 HTML + 원본 프롬프트 (디자인 SoT)
  verification-sop.md      인증 4종 운영 표준 절차 (수집·검증·SLA·권한·반려)
  privacy-design.md        개인정보 설계 ★ (처분사례·수집표·파기·안전성조치·침해대응)
  privacy-policy-v0.1.md   개인정보처리방침 초안 (변호사 검토 전)
  trust-safety.md          신뢰·안전 (사진검증·신고/강퇴·마스킹·미성년차단)
  legal-checklist.md       출시 전 법무 체크리스트 (인허가·약관·법령·D-7)
```

> ⚠️ `docs/` 정책 문서(reference 제외)는 **변호사 검토(v1.0) 전 초안**입니다. 외부 노출·실제 처리방침 사용 금지.

## 시작하기

```bash
# 사전: Node 20+, pnpm 10+, PostgreSQL 16
pnpm install
cp .env.example .env        # 값 채우기
pnpm db:generate            # prisma client 생성

pnpm dev                    # 전체 (turbo)
pnpm --filter @theone/web dev    # 웹만
pnpm --filter @theone/admin dev  # 어드민만

pnpm typecheck && pnpm lint

# DB 연결 후 (Phase 3)
pnpm --filter @theone/db exec prisma migrate deploy   # 마이그레이션 적용
pnpm --filter @theone/db exec prisma db seed           # 시드(운영자3·유저50·신청20)
```

### 운영자 심사 콘솔 (apps/admin)
- `/verifications` 대기열(SLA 임박순) → `/verifications/[id]` 심사(워터마크 뷰어·승인/반려·AccessLog).
- 권한: Basic Auth username을 `Operator.role`(viewer/reviewer/admin)로 해석. 시드 계정 `viewer1`·`reviewer1`·`admin1`.

## 로드맵

Phase 0 (셋업) ✅ → 1 (LP+웨이팅리스트, 검증 게이트) ✅ → 2 (인증 SOP/개인정보) → 3 (DB+심사콘솔) → 4 (모바일) → 5 (결제+매칭+채팅) → 6 (출시). 상세는 `CLAUDE.md` §7.

---

## 부록 — Phase 1 외부 키 발급 절차

`.env` 의 빈 값들을 아래 절차로 채운다. 키가 없어도 빌드·로컬 구동은 되며, 해당 기능만 비활성(no-op)된다.

### 1. Supabase (Postgres)
1. <https://supabase.com> 프로젝트 생성 (Region: Northeast Asia / Seoul `icn1` 권장)
2. Settings → Database → Connection string
   - `DATABASE_URL`: **Transaction Pooler** (포트 6543, 끝에 `?pgbouncer=true&connection_limit=1`)
   - `DIRECT_URL`: **Direct connection** (포트 5432) — 마이그레이션용
3. 마이그레이션 적용:
   ```bash
   pnpm --filter @theone/db exec prisma migrate deploy
   ```

### 2. Resend (확인 메일)
1. <https://resend.com> 가입 → API Keys → 키 발급 → `RESEND_API_KEY`
2. Domains → 발신 도메인 추가 → 안내된 **DNS TXT/MX 레코드 등록** (반영 ~30분)
3. 인증 완료 후 `RESEND_FROM="THE ONE <noreply@도메인>"`

### 3. Cloudflare Turnstile (봇 차단)
1. Cloudflare 대시보드 → Turnstile → 위젯 추가 (도메인 등록)
2. **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, **Secret Key** → `TURNSTILE_SECRET_KEY`
3. 무료티어 월 100만 호출. 키 미설정 시 검증 자동 비활성(개발 편의).

### 4. PostHog (분석)
1. <https://posthog.com> 프로젝트 → Project API Key → `NEXT_PUBLIC_POSTHOG_KEY`
2. `NEXT_PUBLIC_POSTHOG_HOST` (기본 `https://us.i.posthog.com`)
3. 발화 이벤트: `waitlist_form_view` / `_submit_attempt` / `_submit_success` / `_submit_fail`(reason)

### 5. GA4 + Microsoft Clarity
- GA4: 측정 ID(`G-XXXX`) → `NEXT_PUBLIC_GA4_ID`
- Clarity: 프로젝트 ID → `NEXT_PUBLIC_CLARITY_ID`

### 6. Sentry (선택 · Phase 1.5)
현재는 `apps/web/instrumentation.ts` 가드만 존재. 활성화 시:
```bash
pnpm --filter @theone/web add @sentry/nextjs
```
이후 `sentry.client/server.config.ts` 추가 + `NEXT_PUBLIC_SENTRY_DSN` 설정.

### 7. 배포 (Vercel)
- web / admin 각각 별도 Vercel 프로젝트로 import. Root Directory를 `apps/web` / `apps/admin` 으로 지정 (`vercel.json` 포함).
- 환경변수는 각 프로젝트 Settings에 등록. admin은 `ADMIN_BASIC_AUTH_*` 필수.
- Region: `icn1`(서울).

## 라이선스

Proprietary © 주식회사 바틀. All rights reserved.
