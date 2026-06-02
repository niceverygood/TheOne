# identity-kcb — KCB OkCert3 휴대폰 본인확인 중계 서비스

THE ONE 의 휴대폰 본인확인(이름·생년월일·성별·내외국인·CI·DI·통신사)을 처리하는 **상주 Java(Spring Boot) 마이크로서비스**.

> **왜 별도 서비스인가:** KCB OkCert3 모듈(`OkCert3-java1.5-2.3.5.jar`)은 회원사 서버(JVM)에서
> KCB Gateway(`safe.ok-name.co.kr`)와 직접 HTTPS(TLS 1.2+)로 통신해야 한다.
> Vercel 서버리스 · Next.js Node 런타임 · Expo RN 어디에서도 실행할 수 없어,
> 이 서비스만 KCB 와 통신하고 결과를 `apps/web`(Next.js)·`apps/mobile` 로 중계한다.

## 아키텍처

```
apps/mobile (RN)            apps/web (Next.js, Vercel)         services/identity-kcb (이 서비스, 상주 JVM)        KCB
─────────────              ─────────────────────────          ─────────────────────────────────────          ───
 startKcbIdentity() ─POST─► /api/identity/kcb/start ──Bearer─► POST /kcb/start ──────────[START]──────────────► Gateway
                                                               ◄── { txSeqNo, popupUrl }
 WebView(popupUrl) ───────────────────────────────────────────► GET /kcb/popup/{token} ─자동 submit─► 인증창(safe.ok-name.co.kr)
                                                                                                          │ 사용자 인증
 WebView 가 /kcb/done 감지 ◄───────────────────────────────────  POST /kcb/return(mdl_tkn) ──[RESULT]──────► Gateway
                                                               (신원 저장: txSeqNo→VerifiedIdentity, TTL 10분)
 fetchKcbIdentityResult(txSeqNo) ─POST─► /api/identity/kcb/result ─Bearer─► POST /kcb/result/{txSeqNo} (1회 consume)
                                         (CI→pepper 해시, 성인 확인)
```

- 원본 **CI/DI 는 신뢰 백엔드(apps/web)에게만** 서버-투-서버(Bearer)로 전달. 최종 사용자에게는 절대 노출하지 않는다.
- `apps/web` 가 CI 를 `IDENTITY_CI_PEPPER` 로 단방향 해시(`User.ciHash`)해 저장한다(privacy-design §2-4).
- 만 19세 미만은 `apps/web` 에서 차단(trust-safety §3-4).

## 사전 준비 (커밋 금지 자산)

KCB 가 발급한 두 파일을 직접 배치한다. **둘 다 `.gitignore` 로 커밋 차단됨.**

1. **모듈 JAR** → `libs/OkCert3-java1.5-2.3.5.jar` (빌드 시 필요)
2. **라이선스** → 운영 서버의 안전한 경로(예: `/etc/okcert3/V44210000000_IDS_01_PROD_AES_license.dat`)
   - `.dat` 는 **PROD 비밀**. 이미지에 굽지 말고 런타임에 시크릿/볼륨으로 마운트하고 `KCB_LICENSE_PATH` 로 경로 지정.

## 로컬 실행

```bash
cp .env.example .env          # 값 채우기 (KCB_LICENSE_PATH=로컬 .dat 절대경로, SHARED_SECRET=랜덤)
set -a && . ./.env && set +a
./mvnw spring-boot:run
# 또는
./mvnw package -DskipTests && java -jar target/identity-kcb.jar
```

확인:
```bash
curl localhost:8081/healthz
# {"ok":true,"service":"identity-kcb","target":"PROD","licenseConfigured":true}
```

## 사전 네트워크 점검 (공통가이드 §2.2.1)

배포 서버에서 KCB Gateway 로 아웃바운드가 열려 있어야 한다.
```bash
curl -v https://safe.ok-name.co.kr/gCEA/      # "Gateway" 출력 확인
```
- 서버 시간 오차 **±10분 초과 시 요청 거부** → 호스트 NTP 동기화 필수.
- JDK 8u261+ / 17 (TLS 1.2 기본).

## 엔드포인트

| 메서드 | 경로 | 인증 | 용도 |
|---|---|---|---|
| GET | `/healthz` | - | 헬스체크 |
| POST | `/kcb/start` | Bearer | 거래 시작 → `{txSeqNo, popupUrl}` |
| GET | `/kcb/popup/{token}` | - | 인증창 부트스트랩(자동 submit) |
| GET·POST | `/kcb/return` | - | KCB 리턴 URL(결과 수신·저장) |
| GET | `/kcb/done` | - | 완료 랜딩(WebView 감지 지점) |
| POST | `/kcb/result/{txSeqNo}` | Bearer | 신원 1회 조회(consume) |

> `Bearer` = `Authorization: Bearer ${SHARED_SECRET}`. 미설정 시 보호 엔드포인트는 **503(fail-closed)**.

## 배포 (Railway / Render / Fly / EC2 등 상주 호스트)

```bash
# 1) 빌드 컨텍스트에 모듈 JAR 배치 후
docker build -t theone-identity-kcb services/identity-kcb
# 2) 라이선스는 런타임 마운트 (이미지에 굽지 않음)
docker run -p 8081:8081 \
  -e KCB_CP_CD=V44210000000 -e KCB_TARGET=PROD \
  -e KCB_LICENSE_PATH=/secrets/okcert3.dat \
  -e SELF_BASE_URL=https://identity.theone.kr \
  -e SHARED_SECRET=... \
  -v /host/path/V44210000000_IDS_01_PROD_AES_license.dat:/secrets/okcert3.dat:ro \
  theone-identity-kcb
```

배포 후 `apps/web`(Vercel) 환경변수에 다음을 설정한다:
```
KCB_SERVICE_URL=https://identity.theone.kr
KCB_SHARED_SECRET=<위 SHARED_SECRET 와 동일>
```
그리고 `apps/mobile` 의 `EXPO_PUBLIC_API_BASE_URL` = apps/web 배포 주소.

## 미설정 시 동작(mock)

`apps/web` 에 `KCB_SERVICE_URL`/`KCB_SHARED_SECRET` 가 없으면 `/api/identity/kcb/*` 는
mock(성인 통과 더미 신원)으로 응답한다 — 데모/스토어 심사용. 이 Java 서비스 없이도 앱 흐름 확인 가능.
