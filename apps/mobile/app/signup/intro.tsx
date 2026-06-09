import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C } from '../../src/theme';
import { Hairline, Txt } from '../../src/ui';

const STEPS = [
  ['01', '본인 인증', '휴대폰 · 약 2분'],
  ['02', '사진', '최소 2장 · 약 3분'],
  ['03', '키', '약 1분'],
  ['04', '지역', '사는·활동 지역 · 약 1분'],
  ['05', '직업 · 학교', '약 2분'],
  ['06', '취미', '다중 선택 · 약 1분'],
  ['07', '라이프스타일', '음주·흡연·체형 · 약 1분'],
  ['08', '자기소개', 'AI 초안 + 편집 · 약 3분'],
];
// 학력·직업 등 인증은 가입 후 '추가 인증' 단계로 이동 (docs/verification-sop.md §1 · CLAUDE.md §1).

export default function Intro() {
  const router = useRouter();
  return (
    <AppShell
      hideBack
      eyebrow="Application"
      title={<>가입 심사를{'\n'}시작합니다</>}
      subtitle="심사는 평균 5일이 소요됩니다. 8단계를 차분히 채워주세요. 진정성 있는 작성이 통과율을 높입니다."
      footer={
        <FormFooter
          onlyNext
          next="시작하기"
          hint="작성 중 언제든 저장하고 이어서 진행할 수 있습니다."
          onNext={() => router.push('/signup/step01')}
        />
      }
    >
      <View>
        {STEPS.map(([n, t, h], i) => (
          <View key={n}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 }}
            >
              <Txt variant="mono" size={13} color={C.champagne} style={{ width: 24 }}>
                {n}
              </Txt>
              <View style={{ flex: 1 }}>
                <Txt size={15} weight="500" color={C.ink2}>
                  {t}
                </Txt>
                <Txt size={11.5} color={C.gray} style={{ marginTop: 1 }}>
                  {h}
                </Txt>
              </View>
            </View>
            {i < STEPS.length - 1 ? <Hairline /> : null}
          </View>
        ))}
      </View>
    </AppShell>
  );
}
