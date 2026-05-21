import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../src/theme';
import { Btn, Screen, Txt } from '../src/ui';

/** Screen 01 · Splash + Application Gate */
export default function Splash() {
  const router = useRouter();
  const tick = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const base = { position: 'absolute' as const, width: 22, height: 22, borderColor: C.champagne };
    const w = 1;
    if (pos === 'tl') return { ...base, top: 44, left: 28, borderTopWidth: w, borderLeftWidth: w };
    if (pos === 'tr')
      return { ...base, top: 44, right: 28, borderTopWidth: w, borderRightWidth: w };
    if (pos === 'bl')
      return { ...base, bottom: 44, left: 28, borderBottomWidth: w, borderLeftWidth: w };
    return { ...base, bottom: 44, right: 28, borderBottomWidth: w, borderRightWidth: w };
  };

  return (
    <Screen dark scroll={false}>
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
      >
        <View style={tick('tl')} />
        <View style={tick('tr')} />
        <View style={tick('bl')} />
        <View style={tick('br')} />

        <Txt variant="eyebrow" color={C.champagne} style={{ marginBottom: 28 }}>
          Application Only
        </Txt>
        <Txt variant="serifKr" size={46} weight="700" color={C.ivory}>
          THE ONE
        </Txt>
        <Txt variant="serifEn" size={17} color={C.graySoft} style={{ marginTop: 10 }}>
          The One, and only.
        </Txt>
        <Txt
          size={13.5}
          color="rgba(250,247,242,0.7)"
          style={{ marginTop: 40, textAlign: 'center', lineHeight: 24 }}
        >
          인생에 한 번뿐인 매칭.{'\n'}검증된 결혼 의지를 가진 분들만{'\n'}심사를 거쳐 입회합니다.
        </Txt>

        <View style={{ marginTop: 48, alignItems: 'center', gap: 6 }}>
          <Txt variant="mono" size={10} color={C.gray}>
            가입 통과율
          </Txt>
          <Txt variant="serifKr" size={36} weight="700" color={C.champagne}>
            23%
          </Txt>
        </View>
      </View>

      <View style={{ paddingHorizontal: 40, paddingBottom: 24, gap: 10 }}>
        <Btn
          label="가입 심사 신청하기"
          variant="champ"
          onPress={() => router.push('/signup/intro')}
        />
        <Btn
          label="오늘의 큐레이션 미리보기"
          variant="outline"
          onPress={() => router.push('/curation')}
          style={{ borderColor: C.inkSoft }}
          labelColor={C.graySoft}
        />
      </View>
    </Screen>
  );
}
