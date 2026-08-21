import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { NotoSerifKR_500Medium, NotoSerifKR_700Bold } from '@expo-google-fonts/noto-serif-kr';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { C } from '../src/theme';
import { initSentry, Sentry } from '../src/sentry';
import { ensureDailyCurationReminder, registerForPushToken } from '../src/notifications';
import { registerPushToken } from '../src/signup-api';
import { useSignup } from '../src/store';
import { BrandAlertHost } from '../src/brand-alert';

// Sentry 초기화 — DSN 없으면 no-op
initSentry();

// Splash 유지 → 폰트 로드 완료 시 해제 (iOS 26 호환: 폰트 누락으로 인한 초기 렌더 크래시 예방)
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayout() {
  const [loaded, error] = useFonts({
    // 키 = fontFamily 조회 이름. theme.ts F 와 일치해야 함.
    Pretendard: require('../assets/fonts/PretendardVariable.ttf'),
    'Noto Serif KR': NotoSerifKR_700Bold,
    'Noto Serif KR Medium': NotoSerifKR_500Medium,
    Inter: Inter_400Regular,
    'Inter Medium': Inter_500Medium,
    'Inter SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  // 카드 도착 로컬 알림(12·15·20시) — 실패는 조용히 무시(권한 거부/웹)
  useEffect(() => {
    void ensureDailyCurationReminder();
  }, []);

  // 로그인 상태면 서버 푸시 토큰 등록 — 카드가 열릴 때 서버가 직접 알린다.
  const sessionToken = useSignup((s) => s.sessionToken);
  useEffect(() => {
    if (!sessionToken) return;
    let alive = true;
    void (async () => {
      const token = await registerForPushToken().catch(() => null);
      if (alive && token) void registerPushToken(token);
    })();
    return () => {
      alive = false;
    };
  }, [sessionToken]);

  if (!loaded && !error) return null; // 폰트 준비 전 빈 화면(스플래시 유지)

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
      {/* 브랜드 알림 호스트 — 앱 전역 showAlert() 렌더 (안드 시스템 팝업 대체) */}
      <BrandAlertHost />
    </SafeAreaProvider>
  );
}

// Sentry로 에러 바운더리 + 네비게이션 트랜잭션 자동 래핑
export default process.env.EXPO_PUBLIC_SENTRY_DSN ? Sentry.wrap(RootLayout) : RootLayout;
