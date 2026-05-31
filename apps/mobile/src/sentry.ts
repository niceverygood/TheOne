import * as Sentry from '@sentry/react-native';

/**
 * Sentry — 네이티브 크래시·JS 에러 보고. EXPO_PUBLIC_SENTRY_DSN 미설정 시 no-op.
 * iOS Guideline 2.1(a) 거절 재발 방지를 위해 출시 빌드에서 항상 활성화 권장.
 */
const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    enableAutoSessionTracking: true,
    tracesSampleRate: 0.2,
    environment: (process.env.EXPO_PUBLIC_ENV ?? __DEV__) ? 'development' : 'production',
    // PII 최소 수집 (privacy-design §2-2)
    sendDefaultPii: false,
  });
}

export { Sentry };
