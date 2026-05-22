import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Btn, Screen, Txt } from '../src/ui';

const PACKS: [string, string, string?][] = [
  ['80', '12,000', undefined],
  ['180', '26,000', '8%'],
  ['320', '44,000', '12%'],
  ['480', '62,000', '16%'],
  ['720', '89,000', '20%'],
  ['1,000', '119,000', '24%'],
  ['1,600', '179,000', '30%'],
  ['2,400', '249,000', '35%'],
];

/** Screen 16 · 크레딧 충전 — 8패키지 + 24h 한정 부스트 */
export default function Credits() {
  const router = useRouter();
  const [sel, setSel] = useState<number | null>(3);

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Txt variant="mono" size={18} color={C.ink2}>
              ←
            </Txt>
          </Pressable>
        </View>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 6 }}>
          Credits
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2}>
          크레딧 충전
        </Txt>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            padding: 16,
            backgroundColor: C.ink2,
            borderRadius: RADIUS,
          }}
        >
          <Txt size={12.5} color="rgba(250,247,242,0.7)">
            현재 잔액
          </Txt>
          <Txt variant="mono" size={20} weight="600" color={C.ivory}>
            187 C
          </Txt>
        </View>
        <Txt variant="mono" size={10} color={C.gray} style={{ marginTop: 8 }}>
          지난 충전 · 04.21 · 99,000원 · 480 C
        </Txt>

        {/* 24h 부스트 */}
        <View
          style={{
            borderWidth: 1,
            borderColor: C.champagne,
            padding: 16,
            borderRadius: RADIUS,
            marginTop: 24,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Txt variant="serifEn" size={14} color={C.champagne}>
              24h Boost
            </Txt>
            <Txt variant="mono" size={11} color={C.terra}>
              11:42:08
            </Txt>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <View>
              <Txt variant="serifKr" size={19} weight="700" color={C.ink2}>
                480 C + 120 C
              </Txt>
              <Txt size={11.5} color={C.gray} style={{ marginTop: 2 }}>
                한정 보너스 25%
              </Txt>
            </View>
            <Btn
              label="99,000원"
              variant="champ"
              style={{ paddingVertical: 10, paddingHorizontal: 18 }}
            />
          </View>
        </View>

        {/* 8 패키지 */}
        <Txt variant="eyebrow" style={{ marginTop: 24, marginBottom: 14 }}>
          패키지 · 8
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PACKS.map(([c, won, bonus], i) => {
            const on = sel === i;
            return (
              <Pressable
                key={i}
                onPress={() => setSel(i)}
                style={{
                  width: '48%',
                  borderWidth: 1,
                  borderColor: on ? C.ink2 : C.hairLight,
                  backgroundColor: on ? C.ink2 : 'transparent',
                  padding: 16,
                  borderRadius: RADIUS,
                }}
              >
                {bonus ? (
                  <Txt
                    variant="mono"
                    size={8.5}
                    color={on ? C.champagne : C.sage}
                    style={{ position: 'absolute', top: 10, right: 10 }}
                  >
                    +{bonus}
                  </Txt>
                ) : null}
                <Txt variant="serifKr" size={22} weight="700" color={on ? C.ivory : C.ink2}>
                  {c}{' '}
                  <Txt size={12} color={C.gray}>
                    C
                  </Txt>
                </Txt>
                <Txt
                  variant="mono"
                  size={12}
                  color={on ? 'rgba(250,247,242,0.7)' : C.gray}
                  style={{ marginTop: 6 }}
                >
                  {won}원
                </Txt>
              </Pressable>
            );
          })}
        </View>
        <Txt size={11} color={C.gray} style={{ marginTop: 16, lineHeight: 18 }}>
          신청서 일반 20C · 슈퍼 50C. 크레딧은 환불되지 않으며 매칭 성사 여부와 무관합니다.
        </Txt>
        <Btn
          label="결제하기"
          variant="solid"
          style={{ marginTop: 20 }}
          disabled={sel == null}
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
