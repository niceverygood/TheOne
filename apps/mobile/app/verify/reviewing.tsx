import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../src/theme';
import { Btn, Screen, Txt } from '../../src/ui';

const TL: [string, string, 'done' | 'active' | 'wait'][] = [
  ['서류 접수', '05.18', 'done'],
  ['관리자 검토 중', '진행 중', 'active'],
  ['뱃지 부여', '대기', 'wait'],
];

/** Screen 24 · 인증 심사중 — 펄스 타임라인 */
export default function Reviewing() {
  const router = useRouter();
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 70, alignItems: 'center' }}>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 14 }}>
          Under Review
        </Txt>

        <View style={{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              position: 'absolute',
              width: 90,
              height: 90,
              borderRadius: 45,
              borderWidth: 1,
              borderColor: C.champagne,
              opacity: 0.35,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 58,
              height: 58,
              borderRadius: 29,
              borderWidth: 1,
              borderColor: C.champagne,
              opacity: 0.6,
            }}
          />
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.champagne }} />
        </View>

        <Txt
          variant="serifKr"
          size={23}
          weight="700"
          color={C.ink2}
          style={{ marginTop: 36, textAlign: 'center', lineHeight: 32 }}
        >
          재산 인증을{'\n'}검토하고 있습니다
        </Txt>
        <Txt variant="mono" size={11} color={C.gray} style={{ marginTop: 14 }}>
          Ticket №V-2026-0518
        </Txt>
        <Txt size={13} color={C.gray} style={{ marginTop: 8 }}>
          평균 5일 소요 · 완료 시 알림을 보내드립니다
        </Txt>

        <View style={{ marginTop: 44, alignSelf: 'stretch' }}>
          {TL.map(([t, d, st], i) => (
            <View
              key={t}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingBottom: i < 2 ? 22 : 0,
              }}
            >
              <View
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 6,
                  backgroundColor:
                    st === 'done' ? C.sage : st === 'active' ? C.champagne : 'transparent',
                  borderWidth: st === 'wait' ? 1 : 0,
                  borderColor: C.hairLight,
                }}
              />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt size={13.5} color={st === 'wait' ? C.gray : C.ink2}>
                  {t}
                </Txt>
                <Txt variant="mono" size={10.5} color={st === 'active' ? C.champagne : C.gray}>
                  {d}
                </Txt>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={{ paddingHorizontal: 32, paddingBottom: 32 }}>
        <Btn label="허브로 돌아가기" variant="outline" onPress={() => router.replace('/verify')} />
      </View>
    </Screen>
  );
}
