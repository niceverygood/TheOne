import { useState } from 'react';
import { useRouter } from 'expo-router';
import { HEIGHT_RANGE } from '@theone/shared';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C } from '../../src/theme';
import { HeightPicker, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';

export default function Step03() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const saved = useSignup((s) => s.height);
  const [height, setHeight] = useState<number | undefined>(saved ?? 170);

  return (
    <AppShell
      step={3}
      total={8}
      eyebrow="Height"
      title="키"
      subtitle="매칭 시 참고 정보로 사용됩니다. 상대에게는 본인이 선택한 범위로만 노출됩니다."
      footer={
        <FormFooter
          next="다음 — 지역"
          disabled={!height}
          onNext={() => {
            set({ height });
            router.push('/signup/step04');
          }}
        />
      }
    >
      <HeightPicker
        value={height}
        onChange={setHeight}
        min={HEIGHT_RANGE.min}
        max={HEIGHT_RANGE.max}
      />
      <Txt size={11} color={C.gray} style={{ marginTop: 24, lineHeight: 18 }}>
        좌우로 밀어 키를 선택해 주세요. 정확한 정보는 신뢰도 있는 매칭으로 이어집니다.
      </Txt>
    </AppShell>
  );
}
