import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { REGIONS, REGION_SUBS } from '@theone/shared';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C } from '../../src/theme';
import { OptionChips, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';

/** 저장값(시도 또는 시도.세부)에서 시도 슬러그 추출 */
function sidoOf(v?: string): string | undefined {
  if (!v) return undefined;
  const dot = v.indexOf('.');
  return dot > 0 ? v.slice(0, dot) : v;
}

/** 시도 → (있으면) 세부 지역 2단계 선택 */
function RegionPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  const sido = sidoOf(value);
  const subs = sido ? REGION_SUBS[sido] : undefined;
  const subValue = value && value.includes('.') ? value : undefined;
  return (
    <View style={{ marginBottom: 28 }}>
      <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
        {label}
      </Txt>
      <OptionChips options={REGIONS} value={sido} onChange={(v) => onChange(v as string)} />
      {subs ? (
        <View style={{ marginTop: 14 }}>
          <Txt size={11} color={C.gray} style={{ marginBottom: 10 }}>
            세부 지역 (선택)
          </Txt>
          <OptionChips options={subs} value={subValue} onChange={(v) => onChange(v as string)} />
        </View>
      ) : null}
    </View>
  );
}

export default function Step04() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [residence, setResidence] = useState<string | undefined>(
    useSignup.getState().residenceRegion,
  );
  const [activity, setActivity] = useState<string | undefined>(useSignup.getState().activityRegion);

  return (
    <AppShell
      step={4}
      total={8}
      eyebrow="Region"
      title="지역"
      subtitle="주로 생활하는 지역과 활동(만남)이 편한 지역을 알려 주세요. 시·도를 고르면 세부 지역을 선택할 수 있습니다."
      footer={
        <FormFooter
          next="다음 — 직업·학교"
          disabled={!residence || !activity}
          onNext={() => {
            set({ residenceRegion: residence, activityRegion: activity });
            router.push('/signup/step05');
          }}
        />
      }
    >
      <RegionPicker label="사는 지역" value={residence} onChange={setResidence} />
      <RegionPicker label="활동 지역" value={activity} onChange={setActivity} />
    </AppShell>
  );
}
