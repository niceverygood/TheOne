import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { C } from '../../src/theme';
import { Txt } from '../../src/ui';

/**
 * 하단 탭 — 로그인 후 상시 노출되는 5개 진입점.
 *
 * 큐레이션 한 화면에서만 밀고 들어가던 구조를 상용 매칭앱처럼 탭으로 바꿨다.
 * 다만 외관은 더원 그대로다: 아이보리 바탕 · 상단 hairline · 그림자 없음 ·
 * 활성 표시는 잉크블랙 텍스트와 샴페인 점 하나(아이콘 셋을 새로 들이지 않는다).
 */
const TABS: { name: string; label: string; mark: string }[] = [
  { name: 'curation', label: '오늘', mark: '◆' },
  { name: 'browse', label: '둘러보기', mark: '⌗' },
  { name: 'inbox', label: '매칭함', mark: '✉' },
  { name: 'history', label: '지난 카드', mark: '◷' },
  { name: 'my', label: '마이', mark: '○' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: C.ivory,
          borderTopWidth: 1,
          borderTopColor: C.hairLight,
          // 그림자 없음 — 구분은 hairline 으로만 (CLAUDE.md §2)
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 8,
        },
        tabBarItemStyle: { paddingVertical: 2 },
        sceneStyle: { backgroundColor: C.ivory },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.label,
            tabBarIcon: ({ focused }) => (
              <Txt variant="mono" size={13} color={focused ? C.ink2 : C.graySoft}>
                {t.mark}
              </Txt>
            ),
            tabBarLabel: ({ focused }) => (
              <View style={{ alignItems: 'center', marginTop: 2 }}>
                <Txt size={10.5} weight={focused ? '500' : '400'} color={focused ? C.ink2 : C.gray}>
                  {t.label}
                </Txt>
                <View
                  style={{
                    width: 3,
                    height: 3,
                    marginTop: 3,
                    backgroundColor: focused ? C.champagne : 'transparent',
                  }}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
