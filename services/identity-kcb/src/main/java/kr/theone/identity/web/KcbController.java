package kr.theone.identity.web;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import kr.theone.identity.config.KcbProperties;
import kr.theone.identity.kcb.OkCertClient;
import kr.theone.identity.kcb.SessionStore;
import kr.theone.identity.kcb.VerifiedIdentity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * KCB OkCert3 휴대폰 본인확인 팝업 흐름 엔드포인트.
 *
 * <pre>
 *  앱/웹 ─POST /kcb/start(Bearer)─▶ [START] → {txSeqNo, popupUrl}
 *  WebView/popup ─GET /kcb/popup/{token}─▶ KCB CommonSvl 로 자동 submit → 사용자 인증
 *  KCB ─POST /kcb/return(mdl_tkn)─▶ [RESULT] → 신원 저장 → /kcb/done 로 리다이렉트
 *  앱/웹 ─POST(서버) /kcb/result/{txSeqNo}(Bearer)─▶ 신원 1회 조회(consume)
 * </pre>
 */
@Controller
public class KcbController {

    private static final Logger log = LoggerFactory.getLogger(KcbController.class);
    private static final String TC_CERT_CHOICE = "kcb.oknm.online.safehscert.popup.cmd.P931_CertChoiceCmd";

    private final KcbProperties props;
    private final OkCertClient okcert;
    private final SessionStore store;

    public KcbController(KcbProperties props, OkCertClient okcert, SessionStore store) {
        this.props = props;
        this.okcert = okcert;
        this.store = store;
    }

    // ── 헬스체크 ────────────────────────────────────────────────────────────
    @GetMapping("/healthz")
    @ResponseBody
    public Map<String, Object> health() {
        return Map.of(
                "ok", true,
                "service", "identity-kcb",
                "target", props.getTarget(),
                "licenseConfigured", props.getLicensePath() != null && !props.getLicensePath().isBlank()
        );
    }

    // ── 1) 거래 시작 (신뢰 백엔드 전용, Bearer) ─────────────────────────────
    @PostMapping(value = "/kcb/start", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> start(
            HttpServletRequest http,
            @RequestBody(required = false) StartRequest body) {
        requireBearer(http);
        String returnMsg = body == null ? null : body.returnMsg();
        try {
            JsonNode res = okcert.start(returnMsg);
            if (!OkCertClient.isOk(res)) {
                String cd = OkCertClient.text(res, "RSLT_CD");
                String msg = OkCertClient.text(res, "RSLT_MSG");
                log.warn("START 실패 RSLT_CD={} {}", cd, msg);
                return ResponseEntity.unprocessableEntity().body(errBody(cd, msg));
            }
            String mdlTkn = OkCertClient.text(res, "MDL_TKN");
            String txSeqNo = OkCertClient.text(res, "TX_SEQ_NO");
            String token = store.createPopupToken(mdlTkn, txSeqNo);

            Map<String, Object> out = new LinkedHashMap<>();
            out.put("ok", true);
            out.put("txSeqNo", txSeqNo);
            out.put("popupUrl", props.popupBootstrapUrl(token));
            return ResponseEntity.ok(out);
        } catch (Exception e) {
            log.error("START 예외", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "kcb_start_failed");
        }
    }

    // ── 2) 인증 팝업 부트스트랩 (사용자 브라우저/WebView) ───────────────────
    //  KCB CommonSvl 로 자동 submit 하는 폼 페이지를 반환한다(phone_popup2 역할).
    @GetMapping("/kcb/popup/{token}")
    public String popup(@PathVariable String token, Model model) {
        SessionStore.PopupSession s = store.getPopup(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "expired_or_unknown_token"));
        model.addAttribute("popupUrl", props.getPopupUrl());
        model.addAttribute("tc", TC_CERT_CHOICE);
        model.addAttribute("cpCd", props.getCpCd());
        model.addAttribute("mdlTkn", s.mdlTkn());
        return "popup"; // templates/popup.html
    }

    // ── 3) 리턴 URL (KCB → 회원사) : 결과 수신 ─────────────────────────────
    //  KCB 인증창이 mdl_tkn 을 담아 RETURN_URL 로 호출한다(GET/POST 모두 대응).
    @RequestMapping(value = "/kcb/return", method = {RequestMethod.GET, RequestMethod.POST})
    public String returnUrl(@RequestParam(name = "mdl_tkn", required = false) String mdlTkn, Model model) {
        String status = "fail";
        String txSeqNo = "";
        if (mdlTkn != null && !mdlTkn.isBlank()) {
            try {
                JsonNode res = okcert.result(mdlTkn);
                txSeqNo = OkCertClient.text(res, "TX_SEQ_NO");
                if (OkCertClient.isOk(res)) {
                    VerifiedIdentity id = VerifiedIdentity.from(res);
                    store.putResult(txSeqNo, id);
                    status = "ok";
                } else {
                    log.warn("RESULT 비정상 RSLT_CD={} {}", OkCertClient.text(res, "RSLT_CD"),
                            OkCertClient.text(res, "RSLT_MSG"));
                }
            } catch (Exception e) {
                log.error("RESULT 예외", e);
            }
        }
        model.addAttribute("status", status);
        model.addAttribute("txSeqNo", txSeqNo);
        model.addAttribute("doneUrl", props.doneUrl(txSeqNo, status));
        return "return"; // templates/return.html
    }

    // ── 4) 완료 랜딩 (WebView 가 이 URL 을 감지 → 닫고 결과 조회) ───────────
    @GetMapping("/kcb/done")
    public String done(@RequestParam String txSeqNo, @RequestParam String status, Model model) {
        model.addAttribute("status", status);
        model.addAttribute("txSeqNo", txSeqNo);
        return "done"; // templates/done.html
    }

    // ── 5) 결과 조회 (신뢰 백엔드 전용, Bearer, 1회성) ─────────────────────
    @PostMapping(value = "/kcb/result/{txSeqNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<?> result(HttpServletRequest http, @PathVariable String txSeqNo) {
        requireBearer(http);
        Optional<VerifiedIdentity> id = store.consumeResult(txSeqNo);
        if (id.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("ok", false, "reason", "not_found_or_consumed"));
        }
        return ResponseEntity.ok(id.get());
    }

    // ── 공통 ────────────────────────────────────────────────────────────────
    private void requireBearer(HttpServletRequest http) {
        String secret = props.getSharedSecret();
        if (secret == null || secret.isBlank()) {
            // fail-closed: 보호 엔드포인트는 시크릿 미설정 시 거부(CI/DI 노출 방지)
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "shared_secret_not_configured");
        }
        String auth = http.getHeader("Authorization");
        if (auth == null || !auth.equals("Bearer " + secret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "unauthorized");
        }
    }

    private static Map<String, Object> errBody(String cd, String msg) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("ok", false);
        m.put("rsltCd", cd);
        m.put("rsltMsg", msg);
        return m;
    }

    public record StartRequest(String returnMsg) {}
}
