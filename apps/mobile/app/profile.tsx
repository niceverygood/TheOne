import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../src/theme';
import { Btn, Hairline, Portrait, Screen, Txt, VerifiedDots } from '../src/ui';

const VERIF: [string, 'verified' | 'pending'][] = [
  ['직업', 'verified'],
  ['학력', 'verified'],
  ['재산', 'verified'],
  ['부동산', 'pending'],
];
const CHEMI: [string, number][] = [
  ['결혼관', 92],
  ['라이프스타일', 78],
  ['갈등 해결', 85],
];

export default function Profile() {
  const router = useRouter();
  return (
    <Screen>
      <Portrait height={400} label="PORTRAIT · 김지윤 · 1/4" radius={0} />
      <View style={{ padding: 24 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View>
            <Txt variant="serifKr" size={26} weight="700" color={C.ink2}>
              김지윤
            </Txt>
            <Txt size={13.5} color={C.gray} style={{ marginTop: 2 }}>
              32 · 변호사 · 서초
            </Txt>
          </View>
          <VerifiedDots marks={4} />
        </View>

        {/* 검증 4중 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
          {VERIF.map(([k, s]) => (
            <View
              key={k}
              style={{
                width: '48%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: C.hairLight,
                padding: 12,
                borderRadius: 2,
              }}
            >
              <Txt size={12} color={C.ink2}>
                {k}
              </Txt>
              <Txt variant="mono" size={9.5} color={s === 'verified' ? C.sage : C.champagne}>
                {s === 'verified' ? '✓ 승인' : '심사중'}
              </Txt>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 32 }}>
          <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
            About · 자기소개
          </Txt>
          <Txt size={14} color={C.ink2} style={{ lineHeight: 25 }}>
            10년 차 송무 변호사입니다. 평일엔 치열하게 일하지만 주말엔 한남동 작은 갤러리를 천천히
            돌거나, 양양에서 서핑을 즐겨요. 대화가 잘 통하고 서로의 일을 존중할 수 있는 사람을 찾고
            있습니다.
          </Txt>
        </View>

        <View style={{ marginTop: 32 }}>
          <Txt variant="eyebrow" style={{ marginBottom: 14 }}>
            Chemistry · 케미 3축
          </Txt>
          {CHEMI.map(([k, v]) => (
            <View key={k} style={{ marginBottom: 14 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
              >
                <Txt size={12.5} color={C.ink2}>
                  {k}
                </Txt>
                <Txt variant="mono" size={11} color={C.champagne}>
                  {v}%
                </Txt>
              </View>
              <View style={{ height: 2, backgroundColor: C.ivory3 }}>
                <View style={{ width: `${v}%`, height: '100%', backgroundColor: C.champagne }} />
              </View>
            </View>
          ))}
        </View>

        <Hairline style={{ marginTop: 24 }} />
        <Btn
          label="만남 신청서 쓰기 · 20C"
          variant="solid"
          style={{ marginTop: 24 }}
          onPress={() => router.push('/letter')}
        />
      </View>
    </Screen>
  );
}
