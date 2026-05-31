import { Image, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../src/theme';
import { Btn, Screen, Txt, VerifiedDots } from '../src/ui';
import { previewPortraits } from '../src/preview-assets';

const CHEMI: [string, number][] = [
  ['결혼관', 92],
  ['라이프스타일', 78],
  ['갈등 해결', 85],
];

export default function Curation() {
  const router = useRouter();
  return (
    <Screen dark>
      {/* 풀블리드 인물 */}
      <View style={{ height: 520, position: 'relative' }}>
        <Image
          source={previewPortraits.jiyoon}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 150,
            backgroundColor: 'rgba(250,247,242,0.22)',
          }}
        />

        <View
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Txt variant="mono" size={10} color="rgba(15,16,20,0.6)">
              TODAY · No. 047
            </Txt>
            <Txt variant="serifEn" size={15} color="rgba(15,16,20,0.7)" style={{ marginTop: 2 }}>
              Curated for you
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt variant="mono" size={9} color="rgba(15,16,20,0.5)">
              NEXT IN
            </Txt>
            <Txt variant="mono" size={22} weight="600" color={C.ink2}>
              23:47
            </Txt>
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            backgroundColor: 'rgba(15,16,20,0.55)',
          }}
        >
          <VerifiedDots marks={4} dark />
          <Txt variant="serifKr" size={32} weight="700" color={C.ivory} style={{ marginTop: 10 }}>
            김지윤
          </Txt>
          <Txt size={14} color="rgba(250,247,242,0.78)" style={{ marginTop: 4 }}>
            32 · 변호사 · 서초
          </Txt>
        </View>
      </View>

      {/* 본문 */}
      <View style={{ padding: 24 }}>
        <Txt variant="serifEn" size={17} color={C.champagne} style={{ lineHeight: 26 }}>
          “주말엔 한남동 작은 갤러리들을 천천히 도는 걸 좋아해요.”
        </Txt>

        <View style={{ marginTop: 28 }}>
          <Txt variant="eyebrow" color={C.graySoft} style={{ marginBottom: 14 }}>
            Chemistry · 케미 3축
          </Txt>
          {CHEMI.map(([k, v]) => (
            <View key={k} style={{ marginBottom: 14 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
              >
                <Txt size={12.5} color="rgba(250,247,242,0.85)">
                  {k}
                </Txt>
                <Txt variant="mono" size={11} color={C.champagne}>
                  {v}%
                </Txt>
              </View>
              <View style={{ height: 2, backgroundColor: C.inkSoft }}>
                <View style={{ width: `${v}%`, height: '100%', backgroundColor: C.champagne }} />
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 32, gap: 10 }}>
          <Btn label="프로필 더 알아보기" variant="champ" onPress={() => router.push('/profile')} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn
              label="Pass · 오늘은 넘기기"
              variant="outline"
              labelColor={C.graySoft}
              style={{ flex: 1, borderColor: C.inkSoft }}
            />
            <Btn
              label="Super Like"
              variant="outline"
              labelColor={C.champagne}
              style={{ flex: 1, borderColor: C.champagne }}
            />
          </View>
        </View>
        <Txt size={11} color={C.gray} style={{ textAlign: 'center', marginTop: 16 }}>
          오늘의 큐레이션은 자정 이후 갱신됩니다.
        </Txt>
      </View>
    </Screen>
  );
}
