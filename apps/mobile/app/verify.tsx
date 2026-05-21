import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../src/theme';
import { Hairline, Screen, Txt, VerifiedDots } from '../src/ui';

const ROWS: [string, string, 'verified' | 'pending' | 'none' | 'rejected', string][] = [
  ['Education', '학력', 'verified', '3'],
  ['Wealth', '재산', 'pending', '5'],
  ['Vehicle', '보유 차량', 'none', '2'],
  ['Real Estate', '부동산', 'rejected', '4'],
];

type Pill = { fg: string; bg: string; txt: string };
const NONE_PILL: Pill = { fg: C.gray, bg: 'transparent', txt: '미인증' };
const badge = (s: string): Pill => {
  const m: Record<string, Pill> = {
    verified: { fg: C.ivory, bg: C.sage, txt: '승인됨' },
    pending: { fg: C.champagne, bg: 'transparent', txt: '심사중' },
    none: NONE_PILL,
    rejected: { fg: C.terra, bg: 'transparent', txt: '반려' },
  };
  return m[s] ?? NONE_PILL;
};

export default function VerifyHub() {
  const router = useRouter();
  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 8 }}>
          Verifications
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 6 }}>
          추가 인증
        </Txt>
        <Txt size={13} color={C.gray} style={{ marginTop: 8, lineHeight: 21 }}>
          인증할수록 신뢰도가 올라갑니다. 관리자가 직접 검토하며, 매칭 상대에게는 뱃지만 노출됩니다.
        </Txt>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: C.ink2,
            borderRadius: 2,
            padding: 16,
            marginTop: 24,
          }}
        >
          <Txt size={12.5} color="rgba(250,247,242,0.7)">
            현재 검증 수준
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <VerifiedDots marks={2} dark />
            <Txt variant="mono" size={12} color={C.ivory}>
              2 / 4
            </Txt>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          {ROWS.map(([en, kr, st, days]) => {
            const b = badge(st);
            return (
              <View key={kr}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 20,
                  }}
                >
                  <View>
                    <Txt variant="serifEn" size={12} color={C.gray}>
                      {en}
                    </Txt>
                    <Txt size={16} weight="500" color={C.ink2} style={{ marginTop: 3 }}>
                      {kr}
                    </Txt>
                    <Txt size={11} color={C.gray} style={{ marginTop: 3 }}>
                      평균 {days}일 소요
                    </Txt>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      borderWidth: 1,
                      borderColor: b.fg,
                      backgroundColor: b.bg,
                      paddingHorizontal: 11,
                      paddingVertical: 5,
                      borderRadius: 2,
                    }}
                  >
                    <Txt variant="mono" size={10} color={b.fg}>
                      {b.txt}
                    </Txt>
                  </View>
                </View>
                <Hairline />
              </View>
            );
          })}
        </View>

        <Txt size={11} color={C.gray} style={{ marginTop: 24, lineHeight: 18 }}>
          업로드 즉시 암호화되어 관리자 외 접근이 불가하며, 검토 완료 후 30일 안에 자동 파기됩니다.
        </Txt>
        <Txt
          onPress={() => router.back()}
          variant="mono"
          size={11}
          color={C.champagne}
          style={{ marginTop: 16 }}
        >
          ← 돌아가기
        </Txt>
      </View>
    </Screen>
  );
}
