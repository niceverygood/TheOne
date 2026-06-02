# ── build ────────────────────────────────────────────────────────────────
# OkCert3 모듈 JAR(libs/OkCert3-java1.5-2.3.5.jar)이 빌드 컨텍스트에 있어야 한다.
# (git 에 없으므로 CI/배포 호스트에서 빌드 직전 libs/ 에 배치할 것)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
COPY libs ./libs
# 의존성 캐시(소스 변경과 분리)
RUN mvn -q -B -o dependency:go-offline 2>/dev/null || mvn -q -B dependency:go-offline
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
# KCB Gateway 는 서버 시간 오차 ±10분 초과 시 거부 — 호스트 NTP 동기화 필수.
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
