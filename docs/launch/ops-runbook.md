# 운영 인프라 런북 (Ops Runbook)

> **버전** v0.1 · **작성일** 2026-05-22 · **운영주체** 주식회사 바틀

## 1. 관측 / 알림
| 도구 | 용도 | 연결 |
|---|---|---|
| **Sentry** | 에러 추적 | `apps/web/instrumentation.ts` 가드 → Phase 1.5 SDK 설치, `NEXT_PUBLIC_SENTRY_DSN` |
| **PostHog** | 분석·퍼널 | `apps/web/components/analytics-provider.tsx`, `NEXT_PUBLIC_POSTHOG_KEY`. 이벤트: `waitlist_form_*` |
| **Slack** | 운영 알림 | `apps/web/lib/slack.ts` (`SLACK_WEBHOOK_URL`). 결제 실패·신고 누적·인증 SLA 임박 알림 |
| **Status page** | 장애 공지 | statuspage.io 또는 `/api/health` 기반 자체 (외부 모니터가 health 폴링) |

- 헬스체크: `GET /api/health` → DB 연결·시각 반환. 외부 업타임 모니터(UptimeRobot 등) 1분 폴링.

## 2. 출시 후 4주 KPI 정의
| KPI | 정의 | 측정 |
|---|---|---|
| **D1 리텐션** | 가입 익일 재방문 비율 | PostHog/세션 + `getLaunchKpis` |
| **D7 리텐션** | 가입 7일째 재방문 비율 | 동상 |
| **인증 완주율** | 가입자 중 인증 1종 이상 승인 비율 | `VerificationBadge` / `User(active)` |
| **첫 매칭까지 시간** | 가입~첫 Match(accepted) 중앙값 | `Match.createdAt - User.createdAt` |
| **ARPU** | 결제액 합 / 활동 회원 | `Order(paid).amountWon` 합 / active |
| 보조 | 큐레이션 액션율, 신청서 발송수, 신고율 | `CurationLog`, `CreditTransaction`, `ReportLog` |

- 대시보드: `apps/admin /kpi` (실시간 카드). 상세 분석은 PostHog.

## 3. 장애 대응 (요약)
1. 인지(알림/health 실패) → 2. 영향 범위 → 3. 롤백/핫픽스 → 4. 상태 공지 → 5. 포스트모템.
- 개인정보 유출 의심 시: `privacy-design.md §2-7`(72h 신고) 즉시 가동.

## 4. 배포 파이프라인
- web/admin: Vercel(icn1). main 머지 → 자동 배포. 크론 `/api/cron/curation`(자정 KST).
- DB: Supabase. 마이그레이션 `prisma migrate deploy`(배포 훅 또는 수동).
- 모바일: EAS Build → 스토어 제출(Phase 4 마무리 후).

## 5. 내부 정비 (출시 IR과 병행)
- [ ] 정관 정비(상호·본점 현행화) — 등기 작업
- [ ] 감사 1인 선임 또는 정관 개정
- [ ] 통신판매업 신고(바틀 명의) — `legal-checklist.md §4-1`

> **결정 필요**: Status page 자체구축 vs statuspage.io, Sentry 도입 시점(출시 전 권장).
