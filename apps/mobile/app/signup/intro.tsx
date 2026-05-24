import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C } from '../../src/theme';
import { Hairline, Txt } from '../../src/ui';

const STEPS = [
  ['01', '본인 인증', '휴대폰 · 약 2분'],
  ['02', '직업', '서류 업로드 · 약 5분'],
  ['03', '사진', '5장 · 약 3분'],
  ['04', '60문항 설문', '가치관 진단 · 약 10분'],
  ['05', '추천인 코드', '선택 · 약 1분'],
];
// 학력은 가입 후 '추가 인증' 단계로 이동 (docs/verification-sop.md §1 · CLAUDE.md §1).

export default function Intro() {
  const router = useRouter();
  return (
    <AppShell
      hideBack
      eyebrow="Application"
      title={<>가입 심사를{'\n'}시작합니다</>}
      subtitle="심사는 평균 5일이 소요됩니다. 6단계를 차분히 채워주세요. 진정성 있는 작성이 통과율을 높입니다."
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
