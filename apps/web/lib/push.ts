import 'server-only';

/**
 * Expo 푸시 전송 — Expo Push API(https://exp.host/--/api/v2/push/send).
 * 토큰은 모바일 expo-notifications 의 ExpoPushToken("ExponentPushToken[...]").
 * best-effort: 실패해도 호출자 흐름을 막지 않는다(푸시는 부가 알림, 결과는 폴링으로도 수신).
 *
 * iOS 는 EAS 에 등록된 APNs 키로 동작한다. Android 원격 푸시는 EAS 에 FCM 자격증명
 * (서비스 계정 JSON)이 설정돼 있어야 전달된다 — 미설정 시 조용히 실패(앱 복귀 시 폴링이 보완).
 */
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export interface ExpoPushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

function isExpoToken(token: string): boolean {
  return /^ExponentPushToken\[.+\]$/.test(token) || /^ExpoPushToken\[.+\]$/.test(token);
}

export async function sendExpoPush(token: string, msg: ExpoPushMessage): Promise<boolean> {
  if (!token || !isExpoToken(token)) return false;
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        to: token,
        title: msg.title,
        body: msg.body,
        data: msg.data ?? {},
        sound: 'default',
        priority: 'high',
        channelId: 'default',
      }),
    });
    if (!res.ok) {
      console.error('[push] expo send failed', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[push] expo send error', e);
    return false;
  }
}
