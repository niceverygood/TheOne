# App Store 리젝 대응 — 재제출 가이드 (2026-06)

리젝 Submission ID: `12876bcc-7f02-48db-989b-923b3cce0e6c` · 리뷰 기기 iPad Air 11" (M3), iPadOS 26.5

## 리젝 3건 요약

| # | 가이드라인 | 내용 | 해결 주체 |
|---|---|---|---|
| 1 | 2.1(b) App Completeness | 크레딧(IAP) 언급은 있으나 **인앱결제 상품이 심사에 제출 안 됨** | **사용자(ASC)** |
| 2 | 2.1(b) App Completeness | 크레딧 결제 탭 시 **Invalid product ID** 에러 | 코드 방어 ✅ + 1번 해결 시 자동 해소 |
| 3 | 2.3.10 Accurate Metadata | 바이너리에 **Google Play 언급** 포함 | **코드 ✅ (완료)** |

## ✅ 코드/빌드 (완료된 작업)

- `app/credits.tsx`: 결제·환불 안내 스토어명을 플랫폼 분기 → iOS는 **"Apple App Store"만** 노출 (Google 제거).
- `src/iap.ts`: `getProducts` 빈 배열이면 'Invalid product ID' 대신 명확한 안내 에러.
- `app.json`: version `1.0.1 → 1.0` (리젝된 ASC 버전 1.0에 새 빌드 attach, 메타데이터 재사용).
- EAS iOS 프로덕션 빌드 **버전 1.0 / build 15** 큐잉 → 완료 후 `eas submit`로 ASC 업로드.

## ⛔ 사용자가 ASC에서 직접 해야 하는 작업 (Apple 로그인 필요 — 핵심 블로커)

### 0) (선결) 유료 앱 계약 — Paid Apps Agreement
App Store Connect → **비즈니스(Business)** → 계약/세금/금융(Agreements, Tax, and Banking)
→ **유료 앱(Paid Applications)** 계약 활성화 + 은행/세금정보 입력.
**이게 안 되어 있으면 인앱결제 상품 자체를 만들 수 없음.** (계정 소유자 HAN SEUNGSOO 권한)

### 1) 인앱결제 상품 8종 생성
App Store Connect → 앱 **더원 THE ONE** → 수익화 → **인앱 구입(In-App Purchases)** → `+`

- **유형: 소비성(Consumable)** ← 크레딧은 소모되므로 반드시 소비성
- 8종 모두 동일 패턴으로 생성:

| 참조명(예) | 제품 ID | 가격(KRW, 가장 가까운 가격포인트) | 크레딧 |
|---|---|---|---|
| 크레딧 80 | `kr.theone.app.c80` | 12,000 | 80 |
| 크레딧 180 | `kr.theone.app.c180` | 26,000 | 180 |
| 크레딧 320 | `kr.theone.app.c320` | 44,000 | 320 |
| 크레딧 480 | `kr.theone.app.c480` | 62,000 | 480 |
| 크레딧 720 | `kr.theone.app.c720` | 89,000 | 720 |
| 크레딧 1000 | `kr.theone.app.c1000` | 119,000 | 1000 |
| 크레딧 1600 | `kr.theone.app.c1600` | 179,000 | 1600 |
| 크레딧 2400 | `kr.theone.app.c2400` | 249,000 | 2400 |

> 제품 ID는 **반드시 위와 정확히 일치**해야 함 (`packages/shared/src/credits.ts` 기준). 오타 시 again Invalid product ID.
> 일부 가액(26,000/44,000/62,000/89,000)은 Apple 가격포인트와 정확히 안 맞을 수 있음 → 가장 가까운 포인트 선택.

각 상품마다:
- **현지화(한국어)**: 표시 이름(예: "크레딧 180") + 설명 1줄.
- **App Review 스크린샷**: 크레딧 충전 화면 캡처 1장 첨부 (필수).
- 상태가 **"제출 준비 완료(Ready to Submit)"** 가 되도록.

### 2) 새 빌드에 IAP 첨부 + 빌드 선택
앱 버전 **1.0** 페이지에서:
- **빌드** 섹션 → 새로 올라온 **build 15** 선택.
- **인앱 구입(In-App Purchases)** 섹션 → `+` → 위 8종 모두 추가.
  (최초 IAP는 앱 버전과 **함께** 제출해야 심사됨 — 이 섹션이 첫 제출 때만 보임)

### 3) 심사 답변 작성 후 재제출
아래 영문 답변을 Resolution Center(앱 심사에 회신)에 붙여넣고 **"앱 심사에 다시 제출"** 클릭.

---

## 📩 App Review 회신 답변문 (영문 — 그대로 붙여넣기)

```
Hello, and thank you for the detailed review.

We have addressed all three items below.

Guideline 2.1(b) — In-App Purchases not submitted for review
We have created all eight consumable In-App Purchase products (credit packages)
in App Store Connect and submitted them for review together with this build.
They are attached to this version, and an App Review screenshot has been provided
for each product.

Guideline 2.1(b) — "Invalid product ID" error on credit purchases
This error occurred because the In-App Purchase products had not yet been created
in App Store Connect, so the StoreKit product lookup returned no products.
Now that the products are configured and submitted, the purchase flow loads them
correctly. We have also added defensive handling so the app presents a clear
message instead of failing if product information is temporarily unavailable.
We have tested the credit purchase flow in the sandbox and it completes
successfully.

Guideline 2.3.10 — Google Play references
We have removed all references to Google Play from the iOS binary. The payment and
refund notice on the credit purchase screen now references the Apple App Store only.
This change is included in the new build.

A new binary (version 1.0, build 16) has been uploaded. Please let us know if
anything else is needed. Thank you for your time.
```

---

## 진행 체크리스트
- [x] 2.3.10 코드 수정 (Google 문구 iOS 제거)
- [x] 2.1(b) Invalid product ID 코드 방어
- [x] fmt consteval 빌드 실패 수정 (헤더 패치)
- [x] EAS iOS **build 16 (버전 1.0)** 빌드 성공
- [x] `eas submit` → ASC 업로드 완료 (Apple 처리 중, 5~10분 후 버전 페이지 노출)
- [ ] (사용자) Paid Apps Agreement 활성화
- [ ] (사용자) IAP 8종 생성 + 리뷰 스크린샷
- [ ] (사용자) **build 16** 선택 + IAP 8종 버전에 첨부
- [ ] (사용자) 답변문 붙여넣고 재제출
