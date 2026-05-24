import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Hairline, Txt } from '../../src/ui';

const BENEFITS = [
  ['심사 우선 검토', '평균 5일 → 3일 단축'],
  ['가입 크레딧 50C', '첫 신청서 무료 발송'],
  ['케미 리포트 무료', '첫 매칭 리포트 1회'],
];

export default function Step05() {
  const router = useRouter();
  const code = ['T', 'H', 'E', '•', '9', '2'];
  return (
    <AppShell
      step={5}
      total={5}
      eyebrow="Referral"
      title="추천인 코드"
      subtitle="회원의 추천을 받으셨다면 코드를 입력해 주세요. 선택 사항이며, 입력 시 심사 우선순위가 올라갑니다."
      footer={<FormFooter next="신청서 제출" onNext={() => router.replace('/signup/complete')} />}
    >
      <Txt variant="eyebrow" style={{ marginBottom: 10 }}>
        코드 입력
      </Txt>
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        {code.map((ch, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              maxWidth: 48,
              aspectRatio: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: ch === '•' ? 'transparent' : C.ink2,
              borderRadius: RADIUS,
            }}
          >
            <Txt variant="mono" size={20} color={ch === '•' ? C.graySoft : C.ink2}>
              {ch}
            </Txt>
          </View>
        ))}
      </View>
      <Txt variant="mono" size={10} color={C.sage} style={{ textAlign: 'center', marginTop: 10 }}>
        ✓ 유효한 코드 · 김지윤 회원
      </Txt>

      <Txt variant="eyebrow" style={{ marginTop: 28, marginBottom: 14 }}>
        추천 혜택 · 3
      </Txt>
      {BENEFITS.map(([t, h]) => (
        <View key={t}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.champagne }} />
            <View style={{ flex: 1 }}>
              <Txt size={14} weight="500" color={C.ink2}>
                {t}
              </Txt>
              <Txt size={11.5} color={C.gray} style={{ marginTop: 1 }}>
                {h}
              </Txt>
            </View>
          </View>
          <Hairline />
        </View>
      ))}
    </AppShell>
  );
}
