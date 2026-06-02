package kr.theone.identity.kcb;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;

import static kr.theone.identity.kcb.OkCertClient.text;

/**
 * RESULT(IDS_HS_POPUP_RESULT) 응답에서 추출한 검증 신원.
 *
 * <p><b>주의:</b> ci/di 는 민감 식별정보다. 이 서비스는 신뢰 백엔드(apps/web)에게만
 * 서버-투-서버(Bearer 인증)로 전달하고, 최종 사용자(앱/브라우저)에게는 절대 노출하지 않는다.
 * apps/web 가 ci 를 pepper 해시(User.ciHash)로만 저장한다(privacy-design §2-4).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VerifiedIdentity(
        String txSeqNo,
        String name,
        String birthday,   // YYYYMMDD
        String sexCd,      // M | F
        String ntvFrnrCd,  // L(내국인) | F(외국인)
        String telComCd,   // 01:SKT 02:KT 03:LGU+ 04~06:알뜰폰
        String telNo,      // 01012345678
        String ci,         // 88byte (민감)
        String di,         // 64byte (민감)
        String returnMsg
) {
    /** RESULT 응답 JSON(B000) → VerifiedIdentity */
    public static VerifiedIdentity from(JsonNode res) {
        return new VerifiedIdentity(
                text(res, "TX_SEQ_NO"),
                text(res, "RSLT_NAME"),
                text(res, "RSLT_BIRTHDAY"),
                text(res, "RSLT_SEX_CD"),
                text(res, "RSLT_NTV_FRNR_CD"),
                text(res, "TEL_COM_CD"),
                text(res, "TEL_NO"),
                text(res, "CI"),
                text(res, "DI"),
                text(res, "RETURN_MSG")
        );
    }
}
