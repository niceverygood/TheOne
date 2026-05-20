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
```

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
```

## 로드맵

Phase 0 (셋업) ✅ → 1 (LP+웨이팅리스트, 검증 게이트) → 2 (인증 SOP/개인정보) → 3 (DB+심사콘솔) → 4 (모바일) → 5 (결제+매칭+채팅) → 6 (출시). 상세는 `CLAUDE.md` §7.

## 라이선스

Proprietary © 주식회사 바틀. All rights reserved.
