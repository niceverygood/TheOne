import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { HOBBIES } from '@theone/shared';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { OptionChips, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';

export default function Step06() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [picked, setPicked] = useState<string[]>(useSignup.getState().hobbies ?? []);
  const [etc, setEtc] = useState(useSignup.getState().hobbyEtc ?? '');
  const showEtc = picked.includes('etc');

  return (
    <AppShell
      step={6}
      total={8}
      eyebrow="Interests"
      title="취미"
      subtitle="관심사가 비슷할수록 대화가 잘 통합니다. 해당하는 것을 모두 선택해 주세요."
      footer={
        <FormFooter
          next="다음 — 라이프스타일"
          disabled={picked.length === 0}
          hint={picked.length === 0 ? '하나 이상 선택해 주세요.' : undefined}
          onNext={() => {
            set({ hobbies: picked, hobbyEtc: showEtc ? etc.trim() || undefined : undefined });
            router.push('/signup/step07');
          }}
        />
      }
    >
      <OptionChips
        multi
        options={HOBBIES}
        value={picked}
        onChange={(v) => setPicked(v as string[])}
      />

      {showEtc ? (
        <View style={{ marginTop: 20 }}>
          <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
            기타 취미
          </Txt>
          <TextInput
            value={etc}
            onChangeText={setEtc}
            placeholder="직접 입력 (예: 도자기, 서핑)"
            placeholderTextColor={C.graySoft}
            style={{
              borderWidth: 1,
              borderColor: C.hairLight,
              borderRadius: RADIUS,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: C.ink2,
              fontSize: 15,
            }}
          />
        </View>
      ) : null}

      <Txt variant="mono" size={10} color={C.gray} style={{ marginTop: 24 }}>
        {picked.length}개 선택됨
      </Txt>
    </AppShell>
  );
}
