package kr.theone.identity.kcb;

import kr.theone.identity.config.KcbProperties;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 단기 인메모리 세션 저장소 (TTL = kcb.session-ttl-seconds, 기본 600초).
 *
 * <ul>
 *   <li>popup token → MDL_TKN/CP_CD/TX_SEQ_NO : 인증 팝업 부트스트랩 페이지에서 MDL_TKN 노출 최소화</li>
 *   <li>TX_SEQ_NO → VerifiedIdentity : RESULT 수신 후 신뢰 백엔드가 1회 조회(consume)</li>
 * </ul>
 *
 * <p>단일 인스턴스 가정. 다중 인스턴스로 확장 시 Redis 등 외부 저장소로 교체.
 * CI/DI 가 메모리에 잠시 머무르므로 TTL 을 짧게 유지하고 조회 즉시 폐기한다.
 */
@Component
public class SessionStore {

    private final long ttlMs;
    private final SecureRandom random = new SecureRandom();
    private final Base64.Encoder b64 = Base64.getUrlEncoder().withoutPadding();

    private final ConcurrentHashMap<String, PopupSession> popups = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ResultEntry> results = new ConcurrentHashMap<>();

    public SessionStore(KcbProperties props) {
        this.ttlMs = props.getSessionTtlSeconds() * 1000L;
    }

    public record PopupSession(String mdlTkn, String txSeqNo, long expiresAt) {}

    private record ResultEntry(VerifiedIdentity identity, long expiresAt) {}

    /** 인증 팝업 부트스트랩용 단기 토큰 발급. */
    public String createPopupToken(String mdlTkn, String txSeqNo) {
        purge();
        byte[] buf = new byte[24];
        random.nextBytes(buf);
        String token = b64.encodeToString(buf);
        popups.put(token, new PopupSession(mdlTkn, txSeqNo, now() + ttlMs));
        return token;
    }

    public Optional<PopupSession> getPopup(String token) {
        PopupSession s = popups.get(token);
        if (s == null) return Optional.empty();
        if (s.expiresAt() < now()) {
            popups.remove(token);
            return Optional.empty();
        }
        return Optional.of(s);
    }

    public void putResult(String txSeqNo, VerifiedIdentity identity) {
        purge();
        results.put(txSeqNo, new ResultEntry(identity, now() + ttlMs));
    }

    /** 1회성 조회: 신뢰 백엔드가 가져가면 즉시 폐기(CI/DI 잔존 최소화). */
    public Optional<VerifiedIdentity> consumeResult(String txSeqNo) {
        ResultEntry e = results.remove(txSeqNo);
        if (e == null || e.expiresAt() < now()) return Optional.empty();
        return Optional.of(e.identity());
    }

    private void purge() {
        long t = now();
        popups.values().removeIf(s -> s.expiresAt() < t);
        results.values().removeIf(e -> e.expiresAt() < t);
    }

    private static long now() {
        return System.currentTimeMillis();
    }
}
