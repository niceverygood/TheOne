import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../src/theme';
import { Btn, Screen, Txt } from '../../src/ui';

const TIMELINE: [string, string, 'done' | 'active' | 'wait'][] = [
  ['접수 완료', '05.22', 'done'],
  ['서류 검증', '진행 중', 'active'],
  ['심사 위원회', '대기', 'wait'],
  ['최종 승인', '대기', 'wait'],
];

export default function Complete() {
  const router = useRouter();
  return (
    <Screen dark scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 70, alignItems: 'center' }}>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 18 }}>
          Application Received
        </Txt>

        <View
          style={{
            width: 132,
            height: 132,
            borderRadius: 66,
            borderWidth: 1,
            borderColor: C.champagne,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Txt variant="mono" size={9} color={C.graySoft}>
            APPLICATION
          </Txt>
          <Txt variant="serifKr" size={17} weight="700" color={C.ivory} style={{ marginTop: 4 }}>
            №2026
          </Txt>
          <Txt variant="serifKr" size={17} weight="700" color={C.ivory}>
            04827
          </Txt>
        </View>

        <Txt
          variant="serifKr"
          size={24}
          weight="700"
          color={C.ivory}
          style={{ marginTop: 36, textAlign: 'center', lineHeight: 34 }}
        >
          신청서가{'\n'}접수되었습니다
        </Txt>
        <Txt
          size={13}
          color="rgba(250,247,242,0.7)"
          style={{ marginTop: 12, textAlign: 'center', lineHeight: 22 }}
        >
          심사는 평균 5일이 소요됩니다.{'\n'}결과는 휴대폰과 이메일로 안내드립니다.
        </Txt>

        <View style={{ marginTop: 40, alignSelf: 'stretch' }}>
          {TIMELINE.map(([t, d, stt], i) => (
            <View
              key={t}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingBottom: i < 3 ? 22 : 0,
              }}
            >
              <View
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 6,
                  backgroundColor:
                    stt === 'done' ? C.sage : stt === 'active' ? C.champagne : 'transparent',
                  borderWidth: stt === 'wait' ? 1 : 0,
                  borderColor: C.inkSoft,
                }}
              />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt size={13.5} color={stt === 'wait' ? C.gray : C.ivory}>
                  {t}
                </Txt>
                <Txt variant="mono" size={10.5} color={stt === 'active' ? C.champagne : C.gray}>
                  {d}
                </Txt>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 32, paddingBottom: 32 }}>
        <Btn label="홈으로" variant="champ" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
