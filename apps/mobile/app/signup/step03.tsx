import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Portrait, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';
import { previewPortraits } from '../../src/preview-assets';

const GUIDE = [
  '최근 6개월 이내 촬영한 본인 사진',
  '얼굴이 정면으로 또렷하게 보일 것',
  '단체 사진·과도한 보정·선글라스 불가',
  '검증 위원이 본인 여부를 확인합니다',
];

export default function Step03() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [filled, setFilled] = useState<boolean[]>([true, true, false, false, false]);
  const count = filled.filter(Boolean).length;

  return (
    <AppShell
      step={3}
      total={5}
      eyebrow="Photographs"
      title="사진"
      subtitle="얼굴이 선명히 보이는 사진을 5장까지 등록할 수 있습니다. 첫 사진이 대표 이미지가 됩니다."
      footer={
        <FormFooter
          next="다음 — 설문"
          disabled={count === 0}
          onNext={() => {
            set({ photoCount: count });
            router.push('/signup/step04');
          }}
        />
      }
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {filled.map((f, i) => (
          <Pressable
            key={i}
            onPress={() => setFilled((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
            style={{ width: '31.5%', aspectRatio: 3 / 4 }}
          >
            {f ? (
              <View style={{ flex: 1 }}>
                <Portrait
                  fill
                  source={i === 0 ? previewPortraits.jiyoon : previewPortraits.jiyoonGallery}
                />
                {i === 0 ? (
                  <Txt
                    variant="mono"
                    size={8}
                    color={C.ivory}
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      backgroundColor: C.ink2,
                      paddingHorizontal: 5,
                      paddingVertical: 2,
                    }}
                  >
                    대표
                  </Txt>
                ) : null}
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: C.graySoft,
                  borderRadius: RADIUS,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt variant="mono" size={20} color={C.graySoft}>
                  +
                </Txt>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
          가이드라인
        </Txt>
        {GUIDE.map((g) => (
          <View
            key={g}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}
          >
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.champagne }} />
            <Txt size={12.5} color={C.ink2}>
              {g}
            </Txt>
          </View>
        ))}
      </View>
    </AppShell>
  );
}
