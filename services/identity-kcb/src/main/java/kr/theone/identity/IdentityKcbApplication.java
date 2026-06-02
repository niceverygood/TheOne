package kr.theone.identity;

import kr.theone.identity.config.KcbProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * THE ONE 본인인증(KCB OkCert3 휴대폰 본인확인) 중계 서비스.
 *
 * <p>KCB OkCert3 모듈은 회원사 서버(상주 JVM)에서 직접 KCB Gateway 와
 * HTTPS(TLS 1.2+)로 통신해야 한다. 이 서비스가 그 역할을 전담하며,
 * 검증된 신원은 apps/web(Next.js)·apps/mobile 가 서버-투-서버로 조회한다.
 */
@SpringBootApplication
@EnableConfigurationProperties(KcbProperties.class)
public class IdentityKcbApplication {
    public static void main(String[] args) {
        SpringApplication.run(IdentityKcbApplication.class, args);
    }
}
