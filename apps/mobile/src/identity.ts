/**
 * 본인인증 — 프로덕션 진입점.
 *
 * 현재는 mock(auth-mock)을 위임한다. PortOne 본인인증 채널키 발급 +
 * `@portone/react-native-sdk` 설치(네이티브 → EAS 재빌드) 후 아래 "PORTONE 전환 가이드"
 * 대로 step01 을 교체한다. 그 전까지 step01 은 mock(482000)으로 동작 — 스토어 심사용.
 *
 * 서버 재검증(verifyWithBackend)은 지금도 동작한다: apps/web 의 /api/identity/verify 가
 * PORTONE_API_SECRET 미설정 시 mock 으로, 설정 시 실제 PortOne 결과로 응답한다.
 */
export { CARRIERS, requestCode, verifyCode } from './auth-mock';
export type { Carrier, IdentityResult } from './auth-mock';

/** mock | portone — EXPO_PUBLIC_IDENTITY_PROVIDER */
export const IDENTITY_PROVIDER = process.env.EXPO_PUBLIC_IDENTITY_PROVIDER ?? 'mock';

export interface BackendIdentity {
  ok: boolean;
  name?: string;
  birth?: string; // YYYY-MM-DD
  gender?: 'male' | 'female';
  phone?: string;
  carrier?: string;
  isForeigner?: boolean;
  isAdult?: boolean;
  reason?: string; // not_verified | underage | network | no_api_base | start_failed
}

/**
 * PortOne 본인인증 완료 후 받은 id 를 백엔드로 보내 위변조 없이 신원을 확정한다.
 * 클라이언트가 받은 신원 값을 직접 신뢰하지 않고 항상 서버 재검증을 거친다.
 */
export async function verifyWithBackend(identityVerificationId: string): Promise<BackendIdentity> {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!base) return { ok: false, reason: 'no_api_base' };
  try {
    const res = await fetch(`${base}/api/identity/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identityVerificationId }),
    });
    return (await res.json()) as BackendIdentity;
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/* ============================================================================
 * KCB OkCert3 휴대폰 본인확인 (선택된 방식 — services/identity-kcb Java 서비스 경유)
 * ----------------------------------------------------------------------------
 * 흐름:
 *   1) startKcbIdentity() → { txSeqNo, popupUrl }
 *   2) popupUrl 을 react-native-webview 로 연다.
 *   3) WebView 가 `${API_BASE}/kcb/done?...` 또는 identity-kcb 의 /kcb/done 으로
 *      이동하면(onNavigationStateChange) WebView 를 닫는다.
 *   4) fetchKcbIdentityResult(txSeqNo) 로 서버 재검증된 신원을 받는다.
 *
 * KCB 인증창은 휴대폰 WebView 에서 쿠키 허용이 필요하다(공통가이드).
 *   <WebView sharedCookiesEnabled thirdPartyCookiesEnabled
 *            source={{ uri: popupUrl }}
 *            onNavigationStateChange={(s) => {
 *              const m = s.url.match(/\/kcb\/done\?.*\btxSeqNo=([^&]+)/);
 *              if (m) { closeWebView(); onDone(decodeURIComponent(m[1])); }
 *            }} />
 * ========================================================================== */

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface KcbStart {
  ok: boolean;
  txSeqNo?: string;
  popupUrl?: string;
  reason?: string;
}

/** KCB 본인확인 거래 시작 → WebView 로 열 popupUrl 과 txSeqNo 수신 */
export async function startKcbIdentity(returnMsg?: string): Promise<KcbStart> {
  if (!API_BASE) return { ok: false, reason: 'no_api_base' };
  try {
    const res = await fetch(`${API_BASE}/api/identity/kcb/start`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ returnMsg: returnMsg ?? '' }),
    });
    return (await res.json()) as KcbStart;
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/** KCB 인증 완료 후 txSeqNo 로 서버 재검증된 신원을 확정한다(성인/통신사/이름 등). */
export async function fetchKcbIdentityResult(txSeqNo: string): Promise<BackendIdentity> {
  if (!API_BASE) return { ok: false, reason: 'no_api_base' };
  try {
    const res = await fetch(`${API_BASE}/api/identity/kcb/result`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ txSeqNo }),
    });
    return (await res.json()) as BackendIdentity;
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/* ============================================================================
 * PORTONE 전환 가이드 (대안 — 채널키 발급 + SDK 설치 후 활성화)
 * ----------------------------------------------------------------------------
 * 1) 의존성:  npx expo install @portone/react-native-sdk react-native-webview
 *             → 네이티브 모듈 포함이므로 EAS 재빌드 필요.
 *
 * 2) step01 화면을 아래 흐름으로 교체 (통신사/인증번호 UI 제거 → PortOne 창이 대체):
 *
 *   import { IdentityVerification } from '@portone/react-native-sdk';
 *   import * as Crypto from 'expo-crypto';
 *   import { verifyWithBackend } from '../../src/identity';
 *
 *   const idV = `identity-${Crypto.randomUUID()}`;
 *   <IdentityVerification
 *     request={{
 *       storeId: process.env.EXPO_PUBLIC_PORTONE_STORE_ID!,
 *       identityVerificationId: idV,
 *       channelKey: process.env.EXPO_PUBLIC_PORTONE_IDENTITY_CHANNEL_KEY!,
 *     }}
 *     onError={(e) => { ...실패 처리... }}
 *     onComplete={async (r) => {
 *       // r.identityVerificationId === idV. 반드시 서버 재검증:
 *       const v = await verifyWithBackend(r.identityVerificationId);
 *       if (v.ok && v.isAdult) {
 *         set({ verified: true, name: v.name, birth: v.birth, gender: v.gender, phone: v.phone });
 *       } else if (v.reason === 'underage') { ...만 19세 미만 차단 안내... }
 *     }}
 *   />
 *
 * 3) .env:  EXPO_PUBLIC_IDENTITY_PROVIDER=portone
 *           EXPO_PUBLIC_PORTONE_STORE_ID, EXPO_PUBLIC_PORTONE_IDENTITY_CHANNEL_KEY
 *           EXPO_PUBLIC_API_BASE_URL (apps/web 배포 주소)
 * ========================================================================== */
