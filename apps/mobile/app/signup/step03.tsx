import { useState } from 'react';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { ChoiceRow, Field } from '../../src/ui';
import { useSignup } from '../../src/store';

export default function Step03() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [degree, setDegree] = useState<'학사' | '석사' | '박사'>('석사');

  return (
    <AppShell
      step={3}
      eyebrow="Education"
      title="학력"
      subtitle="최종 학력을 입력하고 졸업증명서를 첨부해 주세요. 검증 후 학력 뱃지가 부여됩니다."
      footer={
        <FormFooter
          next="다음 — 사진"
          onNext={() => {
            set({ degree });
            router.push('/signup/step04');
          }}
        />
      }
    >
      <Field eyebrow="학교" label="최종 학력" value="서울대학교" />
      <Field eyebrow="전공" label="학과 / 계열" value="법학과" />
      {(['학사', '석사', '박사'] as const).map((d) => (
        <ChoiceRow key={d} label={d} selected={degree === d} onPress={() => setDegree(d)} />
      ))}
    </AppShell>
  );
}
