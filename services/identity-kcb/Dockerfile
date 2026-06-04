# ── build ────────────────────────────────────────────────────────────────
# OkCert3 모듈 JAR(libs/OkCert3-java1.5-2.3.5.jar)이 빌드 컨텍스트에 있어야 한다.
# (git 에 없으므로 CI/배포 호스트에서 빌드 직전 libs/ 에 배치할 것)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
COPY libs ./libs
# 의존성 캐시(소스 변경과 분리). okcert3 는 system 스코프라 go-offline 이 원격 해석을
# 시도하다 실패함 → 실패해도 무시하고 package 단계(systemPath 해석)로 진행한다.
RUN mvn -q -B dependency:go-offline 2>/dev/null || true
COPY src ./src
RUN mvn -q -B package -DskipTests

# ── runtime ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre
WORKDIR /app
# 라이선스(.dat)는 이미지에 굽지 않는다 — 런타임에 시크릿/볼륨으로 마운트하고
# KCB_LICENSE_PATH 로 경로를 지정한다(.dockerignore 에서 secret/, *.dat 제외).
COPY --from=build /app/target/identity-kcb.jar app.jar
EXPOSE 8081
ENV JAVA_OPTS=""
# 라이선스 기본 경로. 파일 볼륨 마운트가 어려운 호스트(Fly/Railway 등)에서는
# KCB_LICENSE_B64(=base64 of .dat) 시크릿 1개만 주면 시작 시 이 경로로 복원된다.
ENV KCB_LICENSE_PATH=/secrets/okcert3.dat
# KCB Gateway 는 서버 시간 오차 ±10분 초과 시 거부 — 호스트 NTP 동기화 필수.
ENTRYPOINT ["sh","-c","if [ -n \"$KCB_LICENSE_B64\" ] && [ ! -f \"$KCB_LICENSE_PATH\" ]; then mkdir -p \"$(dirname \"$KCB_LICENSE_PATH\")\" && printf '%s' \"$KCB_LICENSE_B64\" | base64 -d > \"$KCB_LICENSE_PATH\"; fi; java $JAVA_OPTS -jar app.jar"]
