import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { REGIONS } from '@theone/shared';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C } from '../../src/theme';
import { OptionChips, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';

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
      subtitle="주로 생활하는 지역과 활동(만남)이 편한 지역을 알려 주세요. 매칭 가능 범위를 정하는 데 사용됩니다."
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
      <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
        사는 지역
      </Txt>
      <OptionChips
        options={REGIONS}
        value={residence}
        onChange={(v) => setResidence(v as string)}
      />

      <View style={{ height: 28 }} />

      <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
        활동 지역
      </Txt>
      <OptionChips options={REGIONS} value={activity} onChange={(v) => setActivity(v as string)} />
    </AppShell>
  );
}
