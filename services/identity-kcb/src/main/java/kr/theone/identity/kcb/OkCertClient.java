package kr.theone.identity.kcb;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kcb.module.v3.OkCert;
import kr.theone.identity.config.KcbProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.InputStream;

/**
 * KCB OkCert3 모듈 호출 래퍼 (휴대폰 본인확인 팝업).
 *
 * <p>모듈 API: {@code String OkCert.callOkCert(target, cpCd, svcName, license, paramsJson)}.
 * 요청/응답은 JSON String. 여기서는 Jackson 으로 직렬화/파싱한다(모듈 내부 shaded json 미사용).
 *
 * <ul>
 *   <li>START  : svcName = IDS_HS_POPUP_START  → MDL_TKN, TX_SEQ_NO 수신</li>
 *   <li>RESULT : svcName = IDS_HS_POPUP_RESULT → 신원(이름·생년월일·성별·CI·DI·휴대폰) 수신</li>
 * </ul>
 *
 * 정상 응답코드는 {@code RSLT_CD == "B000"}.
 */
@Component
public class OkCertClient {

    private static final Logger log = LoggerFactory.getLogger(OkCertClient.class);

    public static final String SVC_START = "IDS_HS_POPUP_START";
    public static final String SVC_RESULT = "IDS_HS_POPUP_RESULT";
    public static final String OK = "B000";

    private final KcbProperties props;
    private final ObjectMapper om = new ObjectMapper();
    private final OkCert okcert = new OkCert();

    public OkCertClient(KcbProperties props) {
        this.props = props;
    }

    /**
     * 팝업 거래 시작. 성공 시 MDL_TKN(인증창 호출 토큰) + TX_SEQ_NO(민원조회용, 보관 필수)를 받는다.
     *
     * @param returnMsg RESULT 단계에서 그대로 되돌려받을 임의 데이터(선택, 최대 300bytes)
     */
    public JsonNode start(String returnMsg) throws Exception {
        ObjectNode req = om.createObjectNode();
        req.put("RETURN_URL", props.returnUrl());
        req.put("SITE_NAME", props.getSiteName());
        req.put("SITE_URL", props.getSiteUrl());
        req.put("RQST_CAUS_CD", props.getRqstCausCd());
        if (returnMsg != null && !returnMsg.isBlank()) {
            req.put("RETURN_MSG", returnMsg);
        }
        return call(SVC_START, req);
    }

    /** 인증 완료 후 결과 수신. 거래요청 시 받은 MDL_TKN 으로 신원을 조회한다. */
    public JsonNode result(String mdlTkn) throws Exception {
        ObjectNode req = om.createObjectNode();
        req.put("MDL_TKN", mdlTkn);
        return call(SVC_RESULT, req);
    }

    private JsonNode call(String svcName, ObjectNode reqJson) throws Exception {
        String reqStr = om.writeValueAsString(reqJson);
        String license = props.getLicensePath();

        // OkCert3 모듈은 단일 인스턴스에 호출별 상태(AES 키/IV 등)를 보관해 thread-safe 하지 않다.
        // 동시 요청이 같은 okcert 인스턴스를 건드리면 복호화 상태가 깨져 간헐적으로
        // "AES decrypt Error - BadPadding(CODE:46)" 이 발생한다 → callOkCert 호출을 직렬화한다.
        // (본인인증 거래량은 낮아 직렬화 비용보다 정확성/신뢰성이 우선)
        String resultStr;
        synchronized (okcert) {
            // Executable jar 환경에서 path 기반 로드가 실패할 수 있어, 미캐시 시 InputStream 오버로드 사용(샘플 권장 패턴).
            if (okcert.containsLicense(license)) {
                resultStr = okcert.callOkCert(props.getTarget(), props.getCpCd(), svcName, license, reqStr);
            } else {
                try (InputStream is = new FileInputStream(license)) {
                    resultStr = okcert.callOkCert(props.getTarget(), props.getCpCd(), svcName, license, reqStr, is);
                }
            }
        }

        JsonNode res = om.readTree(resultStr);
        String rsltCd = text(res, "RSLT_CD");
        // 민원/장애 추적 키(TX_SEQ_NO)는 결과코드와 무관하게 로그에 남긴다(개인정보 아님).
        log.info("OkCert {} → RSLT_CD={} TX_SEQ_NO={}", svcName, rsltCd, text(res, "TX_SEQ_NO"));
        return res;
    }

    public static boolean isOk(JsonNode node) {
        return node != null && OK.equals(text(node, "RSLT_CD"));
    }

    public static String text(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return v == null || v.isNull() ? "" : v.asText();
    }
}
