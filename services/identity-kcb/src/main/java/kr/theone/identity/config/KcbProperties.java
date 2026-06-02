package kr.theone.identity.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * KCB OkCert3 + 서비스 설정. application.yml / 환경변수(KCB_*)로 주입.
 *
 * <p>운영 시 license 파일과 sharedSecret 는 환경변수/시크릿으로만 주입하고
 * 절대 소스/이미지에 굽지 않는다(공통가이드 §2.2.3).
 */
@ConfigurationProperties(prefix = "kcb")
public class KcbProperties {

    /** 회원사코드 12자리 (예: V44210000000). */
    private String cpCd;

    /** 운영계 "PROD" / 테스트계 "TEST". 휴대폰 본인확인 테스트계는 미운영이므로 보통 PROD. */
    private String target = "PROD";

    /** 라이선스 파일 절대경로 (파일명 포함). 예: /etc/okcert3/V44210000000_IDS_01_PROD_AES_license.dat */
    private String licensePath;

    /** KCB 인증 팝업 제출 URL. 운영계: https://safe.ok-name.co.kr/CommonSvl */
    private String popupUrl = "https://safe.ok-name.co.kr/CommonSvl";

    /** 요청 사이트명 (최대 24 bytes — LGU 제한). */
    private String siteName = "THE ONE";

    /** 사이트 URL (사용자 이력 표시용). */
    private String siteUrl = "https://theone.kr";

    /** 인증요청사유코드 기본값. 00:회원가입 01:성인인증 02:정보수정 03:비번찾기 04:상품구매 99:기타 */
    private String rqstCausCd = "00";

    /**
     * 이 서비스의 외부 접근 베이스 URL (스킴+호스트[:포트], 끝 슬래시 없이).
     * RETURN_URL·popup·done 링크 생성에 사용. 예: https://identity.theone.kr
     */
    private String selfBaseUrl = "http://localhost:8081";

    /**
     * 신뢰 백엔드(apps/web)만 결과를 조회하도록 보호하는 공유 시크릿.
     * /kcb/start, /kcb/result 는 Authorization: Bearer {sharedSecret} 필요.
     */
    private String sharedSecret;

    /** 팝업 토큰·결과 보관 TTL(초). KCB 서버 시간 허용오차(±10분)와 동일하게 600. */
    private long sessionTtlSeconds = 600;

    public String getCpCd() { return cpCd; }
    public void setCpCd(String cpCd) { this.cpCd = cpCd; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getLicensePath() { return licensePath; }
    public void setLicensePath(String licensePath) { this.licensePath = licensePath; }

    public String getPopupUrl() { return popupUrl; }
    public void setPopupUrl(String popupUrl) { this.popupUrl = popupUrl; }

    public String getSiteName() { return siteName; }
    public void setSiteName(String siteName) { this.siteName = siteName; }

    public String getSiteUrl() { return siteUrl; }
    public void setSiteUrl(String siteUrl) { this.siteUrl = siteUrl; }

    public String getRqstCausCd() { return rqstCausCd; }
    public void setRqstCausCd(String rqstCausCd) { this.rqstCausCd = rqstCausCd; }

    public String getSelfBaseUrl() { return selfBaseUrl; }
    public void setSelfBaseUrl(String selfBaseUrl) { this.selfBaseUrl = selfBaseUrl; }

    public String getSharedSecret() { return sharedSecret; }
    public void setSharedSecret(String sharedSecret) { this.sharedSecret = sharedSecret; }

    public long getSessionTtlSeconds() { return sessionTtlSeconds; }
    public void setSessionTtlSeconds(long sessionTtlSeconds) { this.sessionTtlSeconds = sessionTtlSeconds; }

    /** RETURN_URL = {selfBaseUrl}/kcb/return */
    public String returnUrl() {
        return trimSlash(selfBaseUrl) + "/kcb/return";
    }

    public String popupBootstrapUrl(String token) {
        return trimSlash(selfBaseUrl) + "/kcb/popup/" + token;
    }

    public String doneUrl(String txSeqNo, String status) {
        return trimSlash(selfBaseUrl) + "/kcb/done?txSeqNo=" + txSeqNo + "&status=" + status;
    }

    private static String trimSlash(String s) {
        if (s == null) return "";
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}
