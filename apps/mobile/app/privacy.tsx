import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Btn, Hairline, Screen, Txt } from '../src/ui';
import { Toggle } from '../src/forms';

const TOGGLES: [string, string, boolean][] = [
  ['프로필 비공개 휴식', '큐레이션에서 잠시 제외됩니다', false],
  ['직장 동료 차단', '같은 회사 도메인 회원을 숨깁니다', true],
  ['연락처 기반 차단', '주소록 지인을 매칭에서 제외', true],
  ['읽음 표시', '상대에게 메시지 읽음을 표시', false],
  ['접속 상태 표시', '마지막 접속 시간을 노출', false],
];

/** Screen 18 · 프라이버시 + 졸업 */
export default function Privacy() {
  const router = useRouter();
  const [vals, setVals] = useState(TOGGLES.map((t) => t[2]));

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>
        <Txt
          variant="serifEn"
          size={15}
          color={C.champagne}
          style={{ marginTop: 22, marginBottom: 6 }}
        >
          Privacy & Safety
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2}>
          프라이버시
        </Txt>

        <View style={{ marginTop: 24 }}>
          {TOGGLES.map(([t, h], i) => (
            <View key={t}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 16,
                }}
              >
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Txt size={14.5} weight="500" color={C.ink2}>
                    {t}
                  </Txt>
                  <Txt size={11.5} color={C.gray} style={{ marginTop: 2 }}>
                    {h}
                  </Txt>
                </View>
                <Toggle
                  value={vals[i]!}
                  onChange={(v) => setVals((arr) => arr.map((x, idx) => (idx === i ? v : x)))}
                />
              </View>
              <Hairline />
            </View>
          ))}
        </View>

        {/* 졸업 */}
        <View
          style={{
            borderWidth: 1,
            borderColor: C.hairLight,
            padding: 22,
            borderRadius: RADIUS,
            marginTop: 32,
            alignItems: 'center',
          }}
        >
          <Txt variant="serifEn" size={14} color={C.champagne} style={{ marginBottom: 8 }}>
            Graduation
          </Txt>
          <Txt variant="serifKr" size={20} weight="700" color={C.ink2}>
            졸업하기
          </Txt>
          <Txt
            size={12.5}
            color={C.gray}
            style={{ marginTop: 10, textAlign: 'center', lineHeight: 21 }}
          >
            좋은 인연을 만나 THE ONE을 떠나시나요?{'\n'}졸업하시면 프로필이 비공개 처리되고,{'\n'}
            축하의 의미로 마지막 케미 리포트를 드립니다.
          </Txt>
          <Btn
            label="졸업 신청하기"
            variant="outline"
            style={{ marginTop: 20, alignSelf: 'stretch' }}
            onPress={() => router.push('/chemistry')}
          />
        </View>
        <Txt size={11.5} color={C.gray} style={{ textAlign: 'center', marginTop: 20 }}>
          계정 영구 삭제
        </Txt>
      </View>
    </Screen>
  );
}
