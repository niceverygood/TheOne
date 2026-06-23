/**
 * 알림 래퍼 — 네이티브에서는 expo-notifications, 웹/미설치 환경에서는 no-op.
 * (iap.ts 와 같은 동적 로드 패턴 — Expo Go·웹 프리뷰에서 깨지지 않게)
 *
 * P1-5 데일리 리듬: 매일 저녁 "오늘의 큐레이션" 로컬 알림 1발.
 * 무한스와이프 대신 습관 트리거로 DAU 를 만든다. 큐레이션은 자정 만료(희소성).
 */

import { Platform } from 'react-native';

const DAILY_ID = 'daily-curation';
export const DAILY_HOUR = 19; // 저녁 7시 — 퇴근 후 확인 시간대

/** EAS projectId — 원격 푸시 토큰 발급에 필요. app.json extra.eas.projectId. */
function easProjectId(): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default as typeof import('expo-constants').default;
    return (
      Constants?.expoConfig?.extra?.eas?.projectId ??
      // 빌드(클래식 manifest)에서는 easConfig 로 노출되기도 한다
      (Constants as unknown as { easConfig?: { projectId?: string } })?.easConfig?.projectId
    );
  } catch {
    return undefined;
  }
}

/**
 * 원격 푸시 토큰(ExpoPushToken) 등록 — 백그라운드 작업 완료 알림 수신용.
 * 권한 요청 + Android 'default' 채널 보장 후 토큰 문자열을 반환한다. 실패 시 null
 * (Expo Go·웹·권한거부·FCM 미설정 등) — 호출자는 토큰 없이도 폴링으로 결과를 받는다.
 */
export async function registerForPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  let N: typeof import('expo-notifications');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    N = require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return null;
  }

  try {
    const perm = await N.getPermissionsAsync();
    let granted = perm.granted;
    if (!granted && perm.canAskAgain) {
      granted = (await N.requestPermissionsAsync()).granted;
    }
    if (!granted) return null;

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('default', {
        name: '알림',
        importance: N.AndroidImportance.DEFAULT,
      }).catch(() => {});
    }

    const projectId = easProjectId();
    const res = await N.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return res.data ?? null;
  } catch {
    return null;
  }
}

export async function ensureDailyCurationReminder(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  let N: typeof import('expo-notifications');
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    N = require('expo-notifications') as typeof import('expo-notifications');
  } catch {
    return false; // 모듈 미설치 환경(웹 번들 등) — 조용히 스킵
  }

  try {
    const perm = await N.getPermissionsAsync();
    let granted = perm.granted;
    if (!granted && perm.canAskAgain) {
      granted = (await N.requestPermissionsAsync()).granted;
    }
    if (!granted) return false;

    // 중복 예약 방지 — 동일 ID 취소 후 재등록
    await N.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
    await N.scheduleNotificationAsync({
      identifier: DAILY_ID,
      content: {
        title: '오늘의 큐레이션이 도착했어요',
        body: '정성껏 고른 한 분 — 자정까지만 만나볼 수 있습니다.',
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: DAILY_HOUR,
        minute: 0,
      },
    });
    return true;
  } catch {
    return false; // 권한·플랫폼 예외는 기능 비활성으로 처리(앱 흐름에 영향 금지)
  }
}
