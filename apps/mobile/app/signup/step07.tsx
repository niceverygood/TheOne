import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { DRINKING_FREQUENCY, SMOKING, BODY_TYPES } from '@theone/shared';
import { AppShell, FormFooter } from '../../src/app-shell';
import { OptionChips, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';

function Block({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 26 }}>
      <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
        {label}
      </Txt>
      <OptionChips options={options} value={value} onChange={(v) => onChange(v as string)} />
    </View>
  );
}

export default function Step07() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const gender = useSignup((s) => s.gender);
  const s = useSignup.getState();
  const [drinkingFrequency, setFreq] = useState<string | undefined>(s.drinkingFrequency);
  const [smoking, setSmoking] = useState<string | undefined>(s.smoking);
  const [bodyType, setBody] = useState<string | undefined>(s.bodyType);

  const complete = !!(drinkingFrequency && smoking && bodyType);

  return (
    <AppShell
      step={7}
      total={8}
      eyebrow="Lifestyle"
      title="라이프스타일"
      subtitle="음주·흡연 습관과 체형을 알려 주세요. 생활 패턴이 맞는 상대를 찾는 데 사용됩니다."
      footer={
        <FormFooter
          next="다음 — 자기소개"
          disabled={!complete}
          hint={!complete ? '모든 항목을 선택해 주세요.' : undefined}
          onNext={() => {
            set({ drinkingFrequency, smoking, bodyType });
            router.push('/signup/step08');
          }}
        />
      }
    >
      <Block
        label="음주 빈도"
        options={DRINKING_FREQUENCY}
        value={drinkingFrequency}
        onChange={setFreq}
      />
      <Block label="흡연" options={SMOKING} value={smoking} onChange={setSmoking} />
      <Block label="체형" options={BODY_TYPES[gender]} value={bodyType} onChange={setBody} />
    </AppShell>
  );
}
