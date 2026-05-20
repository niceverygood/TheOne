import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Phase 0 Expo Router 루트 (스켈레톤).
 * Phase 4에서 docs/reference 의 24개 화면을 RN 컴포넌트로 이식 (디자인 1px 불변).
 * 이식 우선순위: 가입 플로우 → 인증 허브 → 큐레이션/프로필/신청서 → 매칭함/채팅 → 크레딧/리포트 → 프라이버시.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
