# CLAUDE.md — THE ONE (더원)

> Claude Code 작업 시 이 파일을 먼저 읽는다. 제품 컨셉·디자인 원칙·금기·인프라가 모두 여기 있다.

## 0. 운영 주체

**주식회사 바틀**의 정식 신규 제품. 별도 법인 아님 — 바틀 명의로 통신판매업 신고·결제·약관을 처리한다.

## 1. 제품 컨셉

- **한 줄**: "인생에 한 번뿐인 매칭. 결혼정보회사가 디지털로 옮긴다면."
- **타겟**: 28~42세 전문직 · 고소득 미혼
- **핵심 차별점**: 가입 심사제(통과율 23%) + **4종 인증**(학력·재산·차량·부동산) + 무한 스와이프 금지(매일 1명 큐레이션) + 골드스푼식 만남 신청제
- **비즈니스 모델**: 가입 심사 + 크레딧 충전제 + 추가 인증제

### 인증 4종 (더원의 본질)
| 인증 | SLA | 방식 |
|---|---|---|
| 학력 | 24h | 정부24 학위증명서 PDF → 운영자 검토 → (추후 OCR) |
| 재산 | 24h | 트랙 A 잔고증명서 PDF / 트랙 B CODEF 자산조회 동의 |
| 차량 | 24h | 자동차등록증 + 본인명의 일치 |
| 부동산 | 24h | 인터넷등기소 등기부등본 + 본인 소유 확인 |

- 인증 유효기간 **1년**, 만료 30일 전 갱신 푸시.
- 서류는 **S3 + KMS 암호화**, 검토 완료 **30일 후 자동 파기**. 매칭 상대에게는 **뱃지만** 노출.
- 운영 절차의 진실의 원천: `docs/verification-sop.md` (Phase 2). 코드는 이 문서를 따른다.

## 2. 디자인 원칙

진실의 원천: **`docs/reference/theone-standalone.html`** (24개 화면 목업) + `packages/shared/src/tokens.ts`.

- **컬러**: 잉크블랙 `#0F1014` / 본문 `#1A1F2E` / 아이보리 `#FAF7F2` / 뮤트 샴페인 `#B8956A` / 검증 sage `#6B8E7F` / 거절 terra `#A85547`
- **타이포**: 헤드라인 **Noto Serif KR**, 영문 보조 **Playfair Display(italic)**, 본문 **Pretendard**, 영문 본문 Inter, 캡션 JetBrains Mono. 행간 1.55 / 한글 자간 -2% / 영문 -1%
- **레이아웃**: 모바일 375×812 기준, 좌우 패딩 24, 간격 8/16/24/40/64
- **형태**: 카드 radius **2**(날카롭게), **그림자 없음** — 구분은 **hairline border**(라이트 `#EDE8DE` / 다크 `#1F222B`)

## 3. 금기 (절대 금지)

- ❌ 골드 그라데이션 · 반짝임 · 별 · 하트 강조
- ❌ 화면에 "프리미엄" 단어 노출 (티 내지 말고 보여줄 것)
- ❌ 핑크 · 코랄 · 바이올렛 등 일반 데이팅앱 컬러
- ❌ 무한 스와이프 · 카드 덱 · 좋아요 카운터
- ❌ 외부 placeholder 이미지(Unsplash 등) / 가짜 AI 일러스트 — 반드시 자체 SVG placeholder
- ❌ 카드 radius 12 이상, 박스 그림자

## 4. 기술 스택 (모노레포)

`pnpm` workspace + `turborepo`.

```
apps/web      Next.js 14 App Router — 랜딩 + 웨이팅리스트 (Phase 1)
apps/admin    Next.js — 운영자 인증심사 콘솔 (Basic Auth → Phase 3 권한 분리)
apps/mobile   Expo SDK 51 + RN + Expo Router — 본 앱 (Phase 4)
packages/shared  Zod 스키마, 타입, 디자인 토큰, 직업 카테고리(남18/여18)
packages/db      Prisma + PostgreSQL 16
packages/auth    인증 검증 로직 (CODEF 등 보비 인프라 재사용)
```

명령:
```bash
pnpm install
pnpm dev          # 전체 turbo dev
pnpm --filter @theone/web dev
pnpm db:generate  # prisma generate
pnpm typecheck && pnpm lint
```

## 5. 활용 가능한 기존 인프라 (보비 BOBI 재사용 — 재작성 금지)

| 용도 | 인프라 | 비고 |
|---|---|---|
| 재산 인증(트랙 B) | **CODEF** 자산조회 | `packages/auth` 에서 보비 코드 이식 |
| 결제 | **PortOne v2** + KG이니시스 | Phase 5 |
| 정기결제 | **카카오페이 CID `CT97630018`** | 멤버십 v1.1 |
| 인증 결과 통지 | **카카오 알림톡** | 승인/반려 푸시 |

## 6. 관측 / 분석

- **Sentry**(에러) — `apps/web/instrumentation.ts` 자리만 잡힘, 키는 `NEXT_PUBLIC_SENTRY_DSN`
- **PostHog**(분석) — `apps/web/components/analytics-provider.tsx`, `NEXT_PUBLIC_POSTHOG_KEY`
- Phase 1 LP: GA4 + Microsoft Clarity 추가

## 7. 단계별 로드맵

| Phase | 내용 | 게이트 |
|---|---|---|
| 0 | 모노레포 셋업 + CLAUDE.md ✅ | — |
| 1 | LP + 웨이팅리스트 ✅ | **등록자 200명 미만이면 컨셉 재고** |
| 2 | 인증 SOP + 개인정보 설계 ✅ (docs, 변호사 검토 전 외부 비공개) | 1과 병행 |
| 3 | DB 스키마 + 인증 백엔드 + 심사 콘솔 ✅ | |
| 4 | 모바일 24개 화면 이식 ◐ (가입 플로우+큐레이션 이식, 잔여 백로그) | PR마다 목업/RN 스크린샷 대조 |
| 5 | 결제 + 매칭 v1(룰베이스) + 채팅 v1 ✅ (백엔드) | |
| 6 | 출시 준비 (스토어/법무/콜드스타트) ✅ (docs+KPI/health) | 변호사·계약·풀 미충족 시 출시 연기 |

전체 진행은 `CHANGELOG.md` 참조. Phase 4 모바일 잔여 화면 + 외부 계약(변호사·PASS/KCB·PortOne)이 출시 전 핵심 잔여 작업.

## 7.5 운영 정책 문서 (Phase 2 · v0.1 초안)

진실의 원천. 코드(인증·심사·파기·동의)는 이 문서들을 따른다. **변호사 검토(v1.0) 전 외부 노출 금지.**

- `docs/verification-sop.md` — 인증 4종 수집·검증·SLA(24h)·권한 3단계·반려 문구 10종
- `docs/privacy-design.md` ★ — 처분사례(아만다 2.24억 등)·수집 분류표·보유/파기·안전성 8조치·제3자/위탁·침해대응(72h)
- `docs/privacy-policy-v0.1.md` — 처리방침 초안(법정 14항목)
- `docs/trust-safety.md` — 사진검증(liveness)·신고 8종 강퇴 매트릭스·외부연락처 마스킹·미성년 차단
- `docs/legal-checklist.md` — 인허가·약관 3종·적용법령 8개·결제환불·D-7 체크리스트
- 미확정 정책은 각 문서의 **"결정 필요"** 항목 참조(최종 결정자 한승수).

## 8. 작업 규칙

- **각 Phase 종료 시 `CHANGELOG.md`에 결과 요약**을 남긴다.
- Phase 2 docs(약관·개인정보처리방침)는 변호사 검토 완료 시점에 `v1.0` 태깅, 그 전 외부 노출 금지.
- 디자인 변경 시 `tokens.ts` ↔ 목업 ↔ Tailwind 설정을 항상 동기화.
- 환경변수는 `.env.example`에 자리만, 실제 값은 절대 커밋 금지.
- **코드 작업(기능·수정) 완료 시 별도 확인 없이 자동으로 git commit + push까지 진행한다** (사용자 명시 지침, 영구). typecheck 통과 확인 후 커밋. 단 force-push·hooks 스킵 등 파괴적 git 작업은 여전히 금지 — 일반 커밋·푸시에만 적용.

### 8-1. 외부 콘솔 작업을 지시할 때는 링크를 같이 준다

사용자에게 **직접 실행/설정해 달라고 요청할 때**는 설명만 하지 말고 해당 화면 링크를 같이 준다.

**Supabase SQL(마이그레이션)** — 항상 SQL Editor 링크 + 복사 가능한 SQL 블록을 함께:

> **[Supabase SQL Editor 열기](https://supabase.com/dashboard/project/_/sql/new)** 에서 실행해 주세요.
> ```sql
> ALTER TABLE "..." ADD COLUMN "..." ...;
> ```
> (영향: 무엇이 되는지 / 안 돌리면 무엇이 깨지는지 한 줄)

- 프로젝트 ref를 알면 `https://supabase.com/dashboard/project/<project-ref>/sql/new`, 모르면 `_` (최근 프로젝트로 이동). 목록은 <https://supabase.com/dashboard/projects>.
- **배포 전 필수**인지(스키마가 코드보다 먼저 있어야 함) 아니면 **먼저 돌려도 무해**한지(nullable 컬럼 추가 등)를 함께 밝힌다.

다른 콘솔도 동일: [Vercel](https://vercel.com/dashboard) · [App Store Connect](https://appstoreconnect.apple.com) · [Apple Identifiers](https://developer.apple.com/account/resources/identifiers) · [Play Console](https://play.google.com/console) · GitHub Secrets(`https://github.com/<owner>/<repo>/settings/secrets/actions`).
