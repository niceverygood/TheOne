import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { C } from '../src/theme';

/**
 * Phase 4 루트 레이아웃. 24개 목업 화면을 RN으로 이식 중.
 * 디자인 톤은 docs/reference/theone-standalone.html 과 1px도 달라지지 않게 유지.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.ivory },
          animation: 'slide_from_right',
        }}
      />
    </SafeAreaProvider>
  );
}
