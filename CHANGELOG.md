# CHANGELOG

각 Phase 종료 시 결과 요약을 기록한다.

## LP SEO 보강 (apps/web)

랜딩 검색 노출 강화. 정책(초안 약관·내부 데이터)은 색인에서 확실히 제외.

- **루트 메타(layout.tsx)**: 제목 템플릿 `%s · THE ONE`, canonical, `robots` 디렉티브(googleBot max-image-preview large 등), `applicationName`·`publisher`/`creator`(주식회사 바틀)·`category`·`formatDetection`, 키워드 확장. 하위 페이지 제목은 템플릿 중복 제거(`· THE ONE` 제거).
- **구조화 데이터(JSON-LD)**: `components/seo/json-ld.tsx` — Organization(parent: 주식회사 바틀)·WebSite·**FAQPage**(리치결과). FAQ는 `components/landing/faq-data.ts` 단일 출처로 분리(화면·JSON-LD 동기).
- **robots.ts**: `/verify`(내부 인증 현황 실데이터)·`/legal/terms`·`/legal/privacy`(변호사 검토 전 초안) 색인 제외.
- **sitemap.ts**: `/legal/child-safety`(Google Play 정책상 공개) 추가. 초안 약관/처리방침은 제외.
- **/verify**: `robots: noindex` 메타 추가.

**검증**: web `tsc` — 신규/변경 파일 에러 0(기존 JSX 타입 에러 32건은 base 이슈, 무관).

## Phase 5-d — 가치관 매칭 (더원의 킥) ◐

큐레이션의 차별점을 **말이 아니라 엔진**으로. 인증·신청제는 골드스푼과 겹치므로, 킥을 **"검증은 입장권, 매칭은 가치관"** 으로 재정의하고 코드에 박았다. 기존 매칭은 지역·나이·인증 뱃지로만 정렬해 도시에 UI("케미 87%")와 엔진이 따로 놀았다.

- **packages/shared/survey.ts(신규)**: 60문항(결혼관·라이프·관계·갈등 각 15) Likert 1~5 → 케미 일치도. `surveyAlignment`(문항당 `1-|a-b|/4` 평균, 0~100), `surveyBreakdown`(카테고리별), `isCompleteSurvey`. 한쪽 미완료면 `null`(중립 → 가산 없음).
- **packages/shared/matching.ts**: `WEIGHTS.valuesAlignment = 100` — **단일 최대 가중치**. `Candidate.survey?` 추가, `scoreCandidate`가 양쪽 설문 완료 시 가치관을 가산. 인증 많아도 가치관 어긋나면 후순위.
- **packages/shared/schemas.ts**: `surveyAnswersSchema`(60문항·1~5) + `signupInputSchema.surveyAnswers` 옵션.
- **packages/db**: `Profile.surveyAnswers Int[]`(기본 `[]`), `CurationLog.chemistry Int?`(0~100 스냅샷). 마이그레이션 `20260613000000_curation_values_chemistry`. `matching.ts`가 설문을 후보에 싣고 케미를 로그에 기록, `signup.ts`가 설문 저장.
- **apps/web `/api/signup`·apps/mobile signup-api**: `surveyAnswers` 전달 경로 연결.
- **케미 노출**: `chemistryAxes`(도시에 3축 — 결혼관·라이프·갈등), `getTodayCuration` 이 `breakdown` 동반 반환, `GET /api/curation/today`(케미 종합+3축+뱃지·메타, 이름 미포함), 모바일 `curation` 화면이 실데이터로 렌더(API 미설정 시 목업 폴백)·종합 % 표기.

**검증**: shared `vitest` 30/30(가치관 일치도·카테고리 분해·"인증 많은 후보 < 가치관 일치 후보"·도시에 3축) OK · shared/db/mobile `tsc` OK · web 신규 라우트 `tsc` 클린. (이메일·legal·landing의 JSX `tsc` 에러는 base 기존 이슈, 무관.)
**잔여(사용자)**: ① 마이그레이션 SQL 실행 ② 모바일 step05 설문 UI가 실제 60문항 응답을 수집·제출하도록 연결(현재는 목업) ③ 도시에 상대 이름/사진은 직접식별정보 정책상 미저장 — 표시 정책 결정 필요.

## Phase 5-c — 회원 추천 보상 (MVP) ◐

지인 추천 → **품질 이벤트(심사 통과·첫 결제)** 에 크레딧 보상. 1단계·셀프차단·클로백으로 어뷰징/다단계 리스크 최소화. (현금·외부 파트너스·"매칭 성공" 보상은 법적 검토 전제로 후속.)

- **규칙**: 피추천인 심사 통과 시 추천인 +30C / 첫 결제 시 결제 크레딧의 10%. 7일 내 탈퇴·환불 시 회수.
- **packages/shared/referral.ts**: `referralSeqFromCode`(체크섬 검증) + `REFERRAL_REWARD` 상수.
- **packages/db**: `User.seq`(코드 파생)·`referredById`(자기참조), `ReferralReward` 원장(`@@unique[referee,type]` 멱등) + enum, `CreditReason.referral_reward`/`referral_clawback`. 마이그레이션 `20260609000000_referral_rewards`.
  - `referral.ts`(grant/clawback/resolveReferrer/summary), `members.ts`(approveMembership→심사통과 보상), `economy.markOrderPaid`(첫결제 보상)·`refundOrder`(클로백) 훅, `signup` referredById.
- **apps/web**: `/api/signup` 추천코드→referredById, `/api/referral/summary`.
- **apps/admin**: `/members`(가입 심사 대기열·활성화→보상 지급, 추천인 표시) + 홈 네비.
- **apps/mobile**: `/referral`(내 코드·현황·공유·보상안내) + 메뉴 진입. (가입 step08의 추천코드 입력은 기존)

**검증**: shared/db/web/admin/mobile `tsc` OK · web/admin `lint` OK · shared `vitest`(추천코드 라운드트립·체크섬) OK.
**잔여(사용자)**: ① 마이그레이션 SQL Supabase 실행 ② "매칭 성공 보상"·현금 파트너스는 **변호사 검토(결혼중개업법·다단계·세무)** 후 확장.

## Phase 5-b — 인앱결제(IAP) 양 플랫폼 완성 ◐

iOS 단독이던 IAP를 **Android(Google Play)까지** 확장하고, 충전 화면을 실제 회원·잔액에 연결.

- **apps/web/lib/google-iap.ts(신규)**: 서비스계정 JWT(RS256, `crypto`)→OAuth2 토큰→`androidpublisher v3 purchases.products.get` 로 purchaseToken 검증(purchaseState=0). `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` 미설정 시 mock 폴백(Apple과 동일 패턴).
- **/api/payment/iap/verify**: android 501 stub 제거 → 플랫폼별 검증(`iap_apple`/`iap_google`) + transactionId(orderId) 멱등 적립.
- **/api/credits/balance(신규)** + `economy.getCreditBalance`: 잔액 조회.
- **apps/mobile**: `iap.ts` Android는 `purchaseToken` 전송. `credits.tsx` — `DEMO_USER_ID` 제거→가입 `userId` 사용, 플랫폼별 productId, 실제 잔액 표시·갱신.
- **.env.example**: `APPLE_IAP_SHARED_SECRET`·`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`·`GOOGLE_PLAY_PACKAGE_NAME`.

**검증**: db/web/mobile `tsc` OK · web `next lint` OK.
**잔여(운영)**: ① 두 키 설정(없으면 mock=영수증 무검증) ② Play Console에서 상품(`kr.theone.app.c*`) 등록 ③ Apple '앱 전용 공유 비밀'.

## Phase 4-b — 가입 플로우 재설계 + AI 자기소개 + 인증 8종/인앱화폐 보상 ◐

가입을 사용자 지정 순서(본인인증→사진→키→지역→직업·학교→취미→라이프스타일→자기소개)로 재구성하고, 수집 데이터로 **AI 자기소개**(Claude, 키 없으면 템플릿 폴백)를 생성·편집한 뒤 제출한다. 가입 후 추가 인증을 **8종**으로 확장하고, **운영자 승인 시 타입별 차등 크레딧**을 멱등 지급한다. 본인 명의가 아닌 경우 **신분증 수동 본인확인** 경로를 추가했다.

**결정**
- 음주 설문 = 음주빈도+주량+흡연 3항목 + 체형(성별 분기). · AI = `ANTHROPIC_API_KEY` 있으면 Claude(haiku-4-5)·없으면 규칙 템플릿(KCB mock 폴백 패턴). · 보상 = **승인 시** 차등(학력·차량·직업 30C / 소득·재산·부동산 50C / 집안자산·명성 80C), `applicationId` 멱등. · 인증 = 기존4 + 신규4(소득·직업·집안자산·명성)=8종.

**packages/shared**: `profile-options.ts`(REGIONS/HOBBIES/DRINKING_*/SMOKING/BODY_TYPES/HEIGHT_RANGE) · `schemas.ts`(verificationType 8종, signupInput 프로필필드+photoCount≥2, introSections/INTRO_SECTIONS/profileGenerate/manualIdentity) · `verification.ts`(라벨·서류·가액 4종 추가 + `VERIFY_REWARD_CREDITS`). 테스트 18→ 추가(8종·보상·photoCount).

**packages/db**: `VerificationType`+4, `CreditReason.verify_reward`, `ManualIdReviewStatus`, `Profile` 설문 컬럼 11개, `ManualIdentityRequest` 모델. 마이그레이션 `20260608000000_phase4_signup_profile`. `economy.awardVerificationReward`(멱등) → `verification.approveApplication`(대화형 트랜잭션, `{rewardCredits}` 반환). `identity-review.ts`(큐·승인·반려).

**apps/web**: `lib/profile-intro.ts`(Claude+템플릿, `describeProfile`/`templateIntro`) + `POST /api/profile/generate` · `POST /api/identity/manual` · `/api/signup` 프로필필드 패스스루. `@anthropic-ai/sdk` 추가.

**apps/mobile**: store 확장 · `OptionChips`/`HeightPicker`(ui) · `signup-api`(generateProfileIntro/submitManualIdentity) · 가입 화면 재구성(step01~08 + manual-identity, intro 단계표) · `verify.tsx` 8종+보상표기 · 인증화면 4종(income/job/family-wealth/reputation) · reviewing 보상안내.

**apps/admin**: `/identity-review`(신분증 수동확인 큐·승인/반려, AccessLog) + 홈 네비. verifications 승인 패널에 `+NNC 지급` 표기(`approveAction` 보상 반환).

**docs/env**: `verification-sop.md`(4종 SOP + 보상표) · `privacy-design.md`(신분증=고유식별정보·AI 국외이전(Anthropic) 반영) · `.env.example`(ANTHROPIC_API_KEY/PROFILE_AI_MODEL).

**검증**: shared/db/web/admin/mobile `tsc --noEmit` OK · web/admin `next lint` OK · shared `vitest` OK · `prisma generate` OK.

**잔여(사용자 직접)**: ① 마이그레이션 SQL을 Supabase에 실행(채팅 블록) ② Vercel에 `ANTHROPIC_API_KEY`(선택) ③ 신분증/서류 **실제 S3 업로드**(현재 데모 키) ④ **개인정보처리방침에 신분증·AI 국외이전 반영**(변호사 검토) ⑤ 부모 자산(집안자산) 제3자 동의서 양식.

## Phase 1-b — 광고 퍼널 분석 (Facebook Ads · Pixel + CAPI + 내부 퍼널) ✅

페이스북 광고 유입→가입 전환을 **익명 방문자 단위**로 추적하고, 어드민에서 캠페인/소재별 퍼널을 관찰. 내부 퍼널은 키 없이 동작하고, Facebook Pixel/Conversions API는 키가 있을 때만 활성(no-op gating).

**설계**
- 퍼널 4단계: `page_view`(방문) → `waitlist_view`(폼 노출) → `waitlist_start`(폼 첫 상호작용) → `waitlist_success`(가입). 부가: `waitlist_submit`/`waitlist_duplicate`/`waitlist_error`.
- 익명 방문자 id(`theone_vid`, httpOnly 쿠키, 미들웨어 발급)로 방문~가입을 한 사람으로 연결. 고유 방문자(`COUNT(DISTINCT visitor_id)`) 기준 집계.
- first-touch 어트리뷰션(`theone_attr` 쿠키 30일): utm_* + fbclid + referrer + landing. 미들웨어가 캡처 → 폼 제출/이벤트에 동봉.
- **위변조 방지**: 상단 단계만 클라이언트 비콘(`/api/track`) 허용, 전환 단계는 서버 액션에서만 기록.

**packages/db**
- `AnalyticsEvent` 모델(append-only) + `FunnelEventType` enum. `Waitlist`에 `fbclid`·`visitorId` 추가. 마이그레이션 `20260603000000_funnel_analytics`.
- `src/analytics.ts` — `recordAnalyticsEvent` + 집계 3종(`getFunnelOverview`/`getFunnelByDimension`/`getFunnelDaily`, `$queryRaw` + `FILTER (WHERE type=...)`, 차원은 화이트리스트 컬럼 주입).

**packages/shared**: `attributionSchema`/`Attribution`, `trackEventSchema`/`CLIENT_TRACK_EVENTS`, `WaitlistSubmitResult.eventId`.

**apps/web**
- `middleware.ts` — `theone_vid`(1년)·`theone_attr`(30일, 신호 있을 때만) 발급. `lib/request-meta.ts` — `getAttribution`/`getVisitorId`/`getFbCookies`.
- `lib/track.ts`(서버 `recordEvent`, fbc 파생) + `app/api/track/route.ts`(node, 204) + `lib/track-client.ts`(sendBeacon) + `components/analytics/page-tracker.tsx`(경로별 page_view).
- Facebook **Pixel**(`analytics-provider.tsx`, init+PageView) + **CAPI**(`lib/fb-capi.ts`, 서버 `Lead`, 해시 이메일+fbc/fbp/ip/ua). Pixel↔CAPI 동일 `eventId`로 dedup.
- `actions/waitlist.ts` — visitorId/fbclid 저장 + 퍼널 이벤트 기록 + 성공 시 CAPI Lead.

**apps/admin**: `/funnel` 대시보드(기간 7/14/30일, 전환 퍼널 막대, 일별 추이 차트, 캠페인/소스/소재/매체 차원 분해 테이블) + 홈 네비.

**.env.example**: `NEXT_PUBLIC_FB_PIXEL_ID`·`FB_PIXEL_ID`·`FB_CAPI_ACCESS_TOKEN`·`FB_GRAPH_VERSION`·`FB_CAPI_TEST_EVENT_CODE`.

**검증**: web/admin/shared/db `tsc --noEmit` OK · web/admin `next lint` OK · `prisma generate` OK.

**잔여(사용자 직접)**: ① 마이그레이션 SQL을 Supabase에 실행(아래 채팅 블록) ② Vercel에 FB 키 설정 ③ **개인정보처리방침에 'Facebook으로 해시 이메일 전송(CAPI)' 제3자 제공 반영**.

## Phase 6-c — 본인인증 KCB OkCert3 연동 (휴대폰 본인확인) ◐

KCB OkCert3 휴대폰 본인확인을 실제 연동. 모듈은 상주 JVM 필수(Vercel/Next/Expo 불가)라 **별도 Java 마이크로서비스**로 분리하고, Next.js·모바일은 서버-투-서버(Bearer)로 중계.

**결정**
- 본인확인 = **KCB OkCert3 직접 연동**(회원사코드 `V44210000000`, 서비스 IDS, 운영계 PROD). PortOne 통합인증 경로는 코드 보존(대안).
- KCB 모듈/라이선스(`*.dat`)는 **커밋 금지** — `services/identity-kcb/.gitignore`(`secret/`, `libs/*.jar`, `*.dat`)로 차단, 라이선스는 런타임 마운트.

**services/identity-kcb (신규 — Spring Boot 3.3.5 / Java 17)**
- `OkCertClient` — `OkCert.callOkCert()` 래핑. START(`IDS_HS_POPUP_START`)·RESULT(`IDS_HS_POPUP_RESULT`), 라이선스 InputStream 폴백(샘플 권장 패턴).
- `KcbController` — `POST /kcb/start`(Bearer)·`GET /kcb/popup/{token}`(인증창 자동 submit)·`GET·POST /kcb/return`(결과 수신·저장)·`GET /kcb/done`(WebView 감지 지점)·`POST /kcb/result/{txSeqNo}`(Bearer, 1회 consume)·`/healthz`.
- `SessionStore` — 인메모리 TTL(600초) 2종(popup token→MDL_TKN, txSeqNo→VerifiedIdentity). CI/DI 잔존 최소화(조회 즉시 폐기).
- Thymeleaf 템플릿 3종(popup/return/done). 보호 엔드포인트 시크릿 미설정 시 **503(fail-closed)**.
- 모듈 JAR은 `system` 스코프 + `includeSystemScope`로 fat jar(21MB)에 번들. `Dockerfile`(멀티스테이지)·`.dockerignore`(secret/·*.dat 제외)·Maven 래퍼·README·`.env.example`.

**apps/web**
- `lib/kcb-identity.ts` — `startKcbVerification()`·`fetchKcbResult()`. 통신사코드→표시명, YYYYMMDD→ISO, sexCd→gender, ntvFrnrCd→isForeigner 매핑. CI→`IDENTITY_CI_PEPPER` 해시(재사용), 미설정 시 mock.
- `POST /api/identity/kcb/start`·`POST /api/identity/kcb/result`(zod·성인 403·CI/DI 비노출). 기존 `/api/identity/verify`(PortOne) 보존.

**apps/mobile**
- `src/identity.ts` — `startKcbIdentity()`·`fetchKcbIdentityResult()` + WebView(`/kcb/done` 감지) 가이드. `BackendIdentity.isForeigner` 추가.

**.env.example**: `KCB_SERVICE_URL`·`KCB_SHARED_SECRET`(apps/web) + 서비스 자체 env 안내.

**검증**: web `tsc --noEmit` OK · mobile `tsc --noEmit` OK · `mvn package` OK(fat jar, OkCert3 번들) · 부팅 스모크(`/healthz` 200, 보호 엔드포인트 503 fail-closed) OK.

**잔여(사용자 직접)**: ① identity-kcb 를 상주 호스트(Railway/Render/Fly/EC2/보비)에 배포 + 라이선스 마운트 + KCB Gateway 아웃바운드/NTP 확인 ② apps/web(Vercel)에 `KCB_SERVICE_URL`/`KCB_SHARED_SECRET`/`IDENTITY_CI_PEPPER` 설정 ③ step01 을 KCB WebView 흐름으로 교체.

## Phase 6-b — App Store v1.0 출시 준비 ◐

App Store 최단경로 제출을 위해 결제를 **IAP 단독**으로 확정하고, 모바일 빌드 메타·결제 통합·외부작업 가이드를 정비.

**결정**
- 크레딧 결제 = Apple/Google IAP 단독(v1.0). PortOne 외부 PG는 `Order.provider` 분기로 코드 보존, v1.1 이연.
- 환불은 Apple/Google 정책 위임. `refundableAmount`는 외부 PG 주문 전용으로 명시.

**shared**
- `CREDIT_PACKAGES` 3종 → **8종 확장** (목업 화면 16 기준 80/180/320/480/720/1000/1600/2400C).
- `CreditPackage` 스키마: `bonus` 제거 → `baseCredits`·`appleProductId`·`googleProductId` 추가. productId 규칙 `kr.theone.app.{id}`.
- `getPackageByProductId()` 추가 — 영수증 검증 시 productId → 패키지 매핑.

**packages/db**
- `Order.provider` 기본값 `portone` → **`iap_apple`**.
- `createOrder(userId, packageId, provider?)` — provider 인자 추가.
- 시드: 데모 주문을 `c180`/`iap_apple`로 갱신.
- 도메인 테스트 13/13 통과 (vitest).

**apps/web**
- 신규 `POST /api/payment/iap/verify` — productId 매핑·Apple 영수증 검증(`lib/apple-iap.ts`, 키 없으면 mock)·transactionId 멱등·`markOrderPaid` 적립.
- Apple verifyReceipt(StoreKit 1) production→sandbox 자동 폴백. App Store Server API v2는 v1.1 마이그레이션 예정.

**apps/mobile**
- `app.json` 출시용 메타데이터 보강: version 1.0.0, iOS buildNumber/Android versionCode, 아이콘·스플래시 자리, iOS infoPlist 권한 4종(카메라/사진/사진추가/FaceID) + `ITSAppUsesNonExemptEncryption=false`, Android permissions 4종(BILLING 포함), `expo-font` 플러그인.
- `eas.json` 신규(development/preview/production 3 프로파일 + iOS submit 자리).
- `src/iap.ts` 래퍼 — 네이티브는 `react-native-iap` 동적 로드, 웹/시뮬레이터는 mock(UI 흐름 확인용).
- `app/credits.tsx`: 하드코딩 PACKS → `CREDIT_PACKAGES` 사용, IAP 결제 흐름(init→buy→verify→finish) 연결, 보너스 % 자동 계산.
- `package.json`: `@theone/shared` workspace, `react-native-iap` 추가.
- `assets/README.md`: 아이콘·스플래시 디자인 가이드(크기·금기 — CLAUDE.md §3 준수).

**docs/launch**
- `store-listing.md` §5: 결제 방식 결정 **완료** 표기(IAP 단독).
- `launch-actions.md` 신규 — 사용자 직접 작업 한 페이지: Apple Developer 가입·App Store Connect 앱 생성·IAP 상품 8종(한국 커스텀 가격 표시)·EAS 빌드/제출·스토어 콘텐츠·법무/계약·운영 인프라·콜드스타트·게이트.

**검증**: 5개 패키지 typecheck OK · shared vitest 13/13 · web `next build` OK(`/api/payment/iap/verify` 포함) · prisma generate OK.

**미해결 / 출시 게이트**
- 약관/개인정보 변호사 검토(v1.0), PASS/KCB 본인인증 계약(현재 mock), Apple Developer 가입 및 IAP 상품 등록, 디자인 아이콘/스플래시 실파일, EAS 첫 빌드·TestFlight 샌드박스 결제 검증, 콜드스타트 100명 명단.

---

## iOS 거절 대응 (Guideline 2.1(a) — App Completeness)

App Store Connect에서 iPad Air 11"(M3) + iPhone 17 Pro Max · iPadOS/iOS 26.5 환경 **런치 시 크래시**로 v1.0 거절. 즉시 대응:

- **A · New Architecture 비활성화**: `apps/mobile/app.json` `newArchEnabled` true→false. SDK 51 신아키텍처는 baseline이라 SDK 호환 이슈에 가장 빈번한 원인.
- **C · 네이티브 폰트 번들**: `expo-font` `useFonts`로 Pretendard Variable(`assets/fonts/PretendardVariable.ttf` 6.7MB) + `@expo-google-fonts/noto-serif-kr`·`inter`. Splash 유지 → 폰트 로드 후 해제. iOS 26 첫 렌더 시 폰트 누락 크래시 예방.
- **D · Sentry 통합**: `@sentry/react-native` 5.24, `src/sentry.ts` DSN 가드 + `Sentry.wrap(RootLayout)`. 다음 거절을 사전에 잡기 위한 안전망. DSN 미설정 시 no-op.
- **E · `apps/mobile/eas.json`**: development/preview/production 프로필 + `autoIncrement` + dSYM 자동 업로드(EAS Build 기본). `submit` 프로필 ascAppId/teamId 자리.
- `app/_layout.tsx`: SplashScreen guard + 폰트 로드 + Sentry wrap. theme.ts F 필드를 expo-font 등록 family와 동일하게 정렬.
- `.env.example`에 `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_ENV` 추가.

**검증**: mobile `tsc` OK · Expo Web 번들 컴파일 OK(6.0MB, 폰트+Sentry 포함).

**재제출 시 메시지(권장)**: "iOS 26 호환을 위해 New Architecture 비활성화, 네이티브 폰트 번들, dSYM 첨부, Sentry로 사전 크래시 모니터링 적용했습니다. v1.0 build 2로 재제출합니다."

**미적용 (다음 단계)**
- B · Expo SDK 51 → 54+ 업그레이드 (RN 0.81+, expo-router 6.x). 큰 변경이라 별도 세션 권장. 이번 A/C/D/E로 통과 안 되면 즉시 진행.
- 실기기 iOS 26.5에서 첫 진입~Step02 라이브 스모크 테스트 필수.

---

## Phase 4-b — 모바일 잔여 화면 13종 완성 ✅

목업만 있던 화면을 모두 실제 RN 화면으로 이식 → **모바일 24개 화면 전부 동작**.

- 신규 프리미티브 `src/forms.tsx`: VBadge·DocUpload·ValueTier·SecurityNote·VerifyShell·Toggle·Bubble + 외부연락처 마스킹(`maskContact`, shared 미러).
- **매칭**: 만남 신청서(12, 글쓰기+크레딧+슈퍼), 매칭함(13, 수락/거절 인터랙션), 채팅(15, 폴링 UI + **실시간 마스킹** + AI 추천).
- **경제**: 크레딧 충전(16, 8패키지+24h부스트 선택), 케미 리포트(17, 상위 8% 3섹션).
- **인증 폼**: 학력(20)·재산(21, 가액구간)·차량(22, 사진 2장)·부동산(23, 가액구간)·심사중(24, 펄스) — 허브에서 라우팅.
- **안전**: 프라이버시+졸업(18, 토글 5종).
- 내비: `app/menu.tsx` 전체 화면 둘러보기 + 스플래시 링크. 라우팅 전부 연결.

**검증**: mobile `tsc` OK · Expo Web 번들 컴파일 OK(4.0MB) · 채팅 등 신규 화면 브라우저 렌더 확인.
**후속**: 네이티브 폰트(ttf)·실기기·API/세션 연동(현재 로컬 상태 데모)·정식 PASS/KCB·결제 IAP/PG.

---

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
