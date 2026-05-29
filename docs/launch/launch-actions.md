# 출시 액션 가이드 (Launch Actions)

> **버전** v0.1 · **작성일** 2026-05-28 · **운영주체** 주식회사 바틀
> `launch-checklist.md`의 항목 중 **사용자가 직접 외부 시스템에서 처리해야 하는 것**들만 묶은 작업 매뉴얼. 코드/문서는 별도 진행.

상태 기호: ☐ 미착수 / ◐ 진행 / ☑ 완료

---

## 1. Apple Developer / App Store Connect

> **전제(2026-05-28)**: 운영자가 기존 Apple Developer 계정 보유(다른 앱 출시 경험 있음). 신규 가입 절차 생략.

이 앱에서 추가로 해야 할 것들 (자세한 절차는 §3-1, §3-2, §3-7 참조):

- ☐ Bundle ID `kr.theone.app` 신규 등록 (Developer Portal Identifiers)
- ☐ App Store Connect에 새 앱 생성 (이름 THE ONE, 기본언어 한국어)
- ☐ **연령 등급 17+ (만 19세 상응)** — 데이팅 카테고리 필수
- ☐ **앱 카테고리**: Social Networking (1차) / Lifestyle (2차)
- ☐ **App Privacy** 설문 작성 — `docs/privacy-design.md` 수집 분류표와 정렬
- ☐ **계정 삭제 경로** 앱 내 명시 + 스토어 메타에도 안내 (Apple 필수)

## 2. IAP 상품 등록 (App Store Connect)

코드에 정의된 8종 productId를 그대로 등록 (`packages/shared/src/credits.ts`).

| productId | 가격(원) | 크레딧 | 비고 |
|---|---|---|---|
| `kr.theone.app.c80` | 12,000 | 80 | Apple 가격 티어 존재 ✓ |
| `kr.theone.app.c180` | 26,000 | 180 | **커스텀 가격 필요** (티어 없음) |
| `kr.theone.app.c320` | 44,000 | 320 | **커스텀 가격 필요** |
| `kr.theone.app.c480` | 62,000 | 480 | **커스텀 가격 필요** |
| `kr.theone.app.c720` | 89,000 | 720 | Apple 가격 티어 존재 ✓ |
| `kr.theone.app.c1000` | 119,000 | 1,000 | Apple 가격 티어 존재 ✓ |
| `kr.theone.app.c1600` | 179,000 | 1,600 | **커스텀 가격 필요** |
| `kr.theone.app.c2400` | 249,000 | 2,400 | **커스텀 가격 필요** |

- ☐ 8개 상품을 **Consumable** 타입으로 등록
- ☐ Korea 한정 커스텀 가격 설정 (위 표대로) — 다른 국가는 자동 환산 또는 미판매 처리
- ☐ 상품별 설명: "더원에서 사용할 수 있는 크레딧 N개" (현지화 ko-KR)
- ☐ **App Store Server API 키 생성** (Sandbox 테스트용 + 운영용) — `APPLE_IAP_SHARED_SECRET` 환경변수로 주입
- ☐ TestFlight 내부 테스터에 본인·QA 추가 → 실제 결제(샌드박스) 확인

## 3. Xcode 빌드 & 제출 (Apple Developer 계정만 사용)

> **방식 결정(2026-05-28)**: EAS 클라우드 빌드 대신 **Xcode archive → Distribute App 워크플로우** 채택. Expo 계정 불필요. 다른 앱 출시 경험과 동일.
> **prebuild 완료(2026-05-28)**: `apps/mobile/ios/THEONE.xcworkspace` 생성, CocoaPods(react-native-iap 포함) 설치 완료.

### 3-1. Bundle ID 등록 (Apple Developer Portal)

- ☐ https://developer.apple.com/account/resources/identifiers → `+` → App IDs → Type: App
- ☐ Bundle ID: **Explicit · `kr.theone.app`**
- ☐ Capabilities 체크: **In-App Purchase**, **Sign in with Apple**(선택)

### 3-2. App Store Connect에 새 앱 생성

- ☐ https://appstoreconnect.apple.com → My Apps → `+` → New App
- ☐ Platform: iOS · Name: **THE ONE** · Primary Language: Korean · Bundle ID: `kr.theone.app` · SKU: `theone-ios-v1`
- ☐ "Apple ID"(숫자 ID) 메모 — 나중에 archive Distribute 시 사용

### 3-3. Xcode에서 워크스페이스 열기

```bash
cd apps/mobile
open ios/THEONE.xcworkspace
```

> ⚠️ `.xcodeproj`이 아닌 **`.xcworkspace`**를 열어야 CocoaPods 의존성이 함께 로드됨.

### 3-4. 서명 설정 (Signing & Capabilities)

Xcode에서 THEONE 타깃 선택 → "Signing & Capabilities":

- ☐ **Team**: 본인의 Apple Developer 팀 선택
- ☐ **Automatically manage signing** 체크
- ☐ Bundle Identifier `kr.theone.app` 확인 (자동으로 prebuild에서 채워져 있음)
- ☐ 좌측 `+` → **In-App Purchase** capability 추가 (react-native-iap 작동에 필수)
- ☐ Provisioning Profile이 자동으로 생성됨 (Apple Developer에 §3-1 완료돼 있어야 함)

### 3-5. Archive

- ☐ Xcode 상단 디바이스 선택을 **"Any iOS Device (arm64)"** 로 변경 (시뮬레이터 선택돼있으면 archive 메뉴 비활성)
- ☐ Menu: **Product → Archive**
- ☐ 빌드 5~10분. 끝나면 Organizer 창이 자동으로 뜸.

### 3-6. Distribute App → App Store Connect

Organizer 창에서 방금 만든 archive 선택:

- ☐ **Distribute App** 클릭 → **App Store Connect** → **Upload**
- ☐ 자동 서명 옵션 그대로 → **Upload** 완료
- ☐ App Store Connect → TestFlight 탭에서 처리 완료(10~30분) 대기

### 3-7. IAP 8개 상품 등록 (App Store Connect)

`packages/shared/src/credits.ts`의 productId 그대로 등록 (§2 표 참조).

- ☐ App Store Connect → THE ONE → In-App Purchases → `+` → **Consumable**
- ☐ 위 8개 productId 각각 등록, Korea 커스텀 가격 입력 (표 4건은 티어 없음 — 커스텀)
- ☐ 각 상품 한국어 설명: "더원 크레딧 N개"
- ☐ 영수증 검증용 **App Store Shared Secret** 발급 → 환경변수 `APPLE_IAP_SHARED_SECRET`로 운영 서버에 주입

### 3-8. TestFlight 테스트 (출시 전 필수 검증)

- ☐ TestFlight → 내부 테스터에 본인·QA 추가
- ☐ 본인 기기에서 TestFlight 앱으로 설치
- ☐ Sandbox Apple ID로 IAP 결제 → `/api/payment/iap/verify`가 적립까지 도는지 확인
- ☐ 인증 4종 업로드·매칭·채팅·신고까지 한 사이클 돌리기

### 3-9. 심사 제출

- ☐ App Store Connect → THE ONE → "App Store" 탭 → 새 버전(1.0)
- ☐ 스크린샷 5장(§4), 앱 설명, 키워드, 카테고리(소셜 네트워킹), 연령 17+
- ☐ App Review Information에 **데모 계정 ID/PW** 입력 (필수 — 데이팅 앱은 검토자가 회원가입 못 함)
- ☐ "Submit for Review" → 평균 1~3일 심사
- ☐ 통과 시 **"Manually release this version"** 선택해 출시 시점 직접 통제(콜드스타트 D-day 맞춤)

### 3-10. 다음 빌드부터

- ☐ 코드 변경 후: `app.json`의 `ios.buildNumber`를 1→2→3 수동 증가 (Apple은 동일 버전+빌드번호 재업로드 거부)
- ☐ 의존성 추가 시: `pnpm install` 후 `cd ios && pod install` (또는 다시 `npx expo prebuild -p ios`)
- ☐ infoPlist 권한 등 `app.json` 수정했으면: `npx expo prebuild -p ios` 다시 실행

## 4. 스토어 콘텐츠 (디자인팀 작업)

`docs/launch/store-listing.md` 참조.

- ☐ 스크린샷 5장 (6.9" iPhone 15 Pro Max 기준 1290×2796, 잉크블랙 + Noto Serif 캡션, **골드·하트 금지**)
- ☐ 미리보기 영상 15~30초 (선택, 첫 인상에 강함)
- ☐ 앱 아이콘 1024×1024 (assets/README.md 가이드)
- ☐ 앱 설명·키워드 (이미 store-listing.md 초안 있음 — 변호사 검토 후 확정)
- ☐ 심사 검토자용 **데모 계정** 발급(인증 통과·잔액 있는 상태)

## 5. 법무 / 계약 (병행 — 출시 게이트)

- ☐ 약관 3종 + 개인정보처리방침 **변호사 검토 → v1.0 태깅** (`docs/privacy-policy-v0.1.md` 등)
- ☐ 변호사 검토 후 URL 게시 (예: theone.kr/legal/terms, /legal/privacy) → 앱 내 + 스토어 메타에 링크
- ☐ **본인인증사(PASS/KCB) 계약** — 현재 `apps/mobile/src/auth-mock.ts` 사용 중. 교체 시 만 19세 차단 로직 유지 확인
- ☐ **통신판매업 신고** (바틀 명의, 사업자번호 376-87-01076)
- ☐ CPO(개인정보보호책임자) 지정·공표

## 6. 운영 인프라

- ☐ Sentry 프로젝트 생성 → `NEXT_PUBLIC_SENTRY_DSN` 주입 (web/admin)
- ☐ PostHog 프로젝트 → `NEXT_PUBLIC_POSTHOG_KEY`
- ☐ Slack 운영 알림 채널 → `SLACK_WEBHOOK_URL` (운영 코드는 키 없으면 no-op)
- ☐ 외부 업타임 모니터(Better Stack/UptimeRobot)로 `/api/health` 폴링
- ☐ S3+KMS 버킷 + IAM 정책 (인증 서류용) — 30일 자동 파기 라이프사이클
- ☐ 어드민 MFA + IP 화이트리스트
- ☐ DB 백업 + Point-in-Time Recovery 활성화

## 7. 콜드스타트 (D-7~D-day)

`docs/launch/cold-start.md` 참조.

- ☐ 상위 100명 초대 명단 확정 (지인·LP 웨이팅리스트 상위)
- ☐ 1:1 온보딩 메시지 발송(인증 안내·만남 신청 가이드)
- ☐ 첫 큐레이션 풀 헬스체크 (`/kpi` 대시보드 — 후보 0명 비율 <10%, 성비 균형)
- ☐ D-day 00:00 첫 큐레이션 일괄 발송 모니터링

## 8. v1.0 결제 의사결정 — 확정 사항

- **IAP 단독**으로 출시. PortOne 외부 PG는 v1.1로 이연.
- Apple/Google 수수료 30% 감수 (Small Business Program 등록 시 15%).
- 환불은 Apple/Google 정책에 위임. 사용자가 환불받으면 App Store Server Notifications로 통보받는 시스템은 v1.1.
- 만약 v1.0 매출 인식·세금계산서 발행이 필요하면 Apple/Google에서 받는 정산 데이터 기준으로 처리.

---

## 게이트 (출시 연기 트리거)

다음 중 하나라도 미충족이면 **출시 연기**:
1. 약관/개인정보 변호사 미검토
2. 본인인증사(PASS/KCB) 미계약 → mock 그대로 못 나감
3. 첫 큐레이션 풀 미달 (활성 후보 부족)
4. IAP 영수증 검증 sandbox 실패 (서버 ↔ Apple 인증 못 함)
