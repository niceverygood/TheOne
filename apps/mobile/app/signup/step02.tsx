import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Txt } from '../../src/ui';
import { FEMALE_JOBS, MALE_JOBS, type Job } from '../../src/jobs';
import { useSignup } from '../../src/store';

export default function Step02() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [picked, setPicked] = useState<string | null>(null);
  const jobs = gender === 'male' ? MALE_JOBS : FEMALE_JOBS;
  const selected = jobs.find((j) => j.id === picked);

  return (
    <AppShell
      step={2}
      eyebrow="Occupation"
      title="직업"
      subtitle="가입 심사 위원회가 서류를 검토해 직업 뱃지를 부여합니다. 카테고리마다 필요한 서류가 다릅니다."
      footer={
        <FormFooter
          next="다음 — 사진"
          disabled={!picked}
          onNext={() => {
            set({ jobCategory: picked! });
            router.push('/signup/step03');
          }}
        />
      }
    >
      {/* 성별 토글 */}
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: C.hairLight,
          borderRadius: RADIUS,
          marginBottom: 20,
        }}
      >
        {(['male', 'female'] as const).map((g) => (
          <Pressable
            key={g}
            onPress={() => {
              setGender(g);
              setPicked(null);
            }}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: gender === g ? C.ink2 : 'transparent',
            }}
          >
            <Txt size={12.5} color={gender === g ? C.ivory : C.gray}>
              {g === 'male' ? '남성 회원' : '여성 회원'}
            </Txt>
          </Pressable>
        ))}
      </View>

      {/* 2열 그리드 */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {jobs.map((j: Job) => {
          const on = picked === j.id;
          return (
            <Pressable
              key={`${gender}-${j.id}`}
              onPress={() => setPicked(j.id)}
              style={{
                width: '48%',
                minHeight: 88,
                padding: 12,
                borderWidth: 1,
                borderColor: on ? C.ink2 : C.hairLight,
                backgroundColor: on ? C.ink2 : 'transparent',
                borderRadius: RADIUS,
              }}
            >
              <Txt
                variant="serifEn"
                size={11}
                color={on ? C.champagne : C.gray}
                style={{ marginBottom: 6 }}
              >
                {j.en}
              </Txt>
              <Txt size={14.5} weight="600" color={on ? C.ivory : C.ink2}>
                {j.kr}
              </Txt>
              <Txt
                size={10.5}
                color={on ? 'rgba(250,247,242,0.6)' : C.gray}
                style={{ marginTop: 4 }}
              >
                {j.detail}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      {/* 검증 기준 메타 스트립 */}
      {selected ? (
        <View
          style={{
            marginTop: 16,
            borderLeftWidth: 2,
            borderLeftColor: C.champagne,
            backgroundColor: C.ivory2,
            padding: 14,
          }}
        >
          <Txt variant="eyebrow" style={{ marginBottom: 6 }}>
            검증 기준 · {selected.kr}
          </Txt>
          <Txt size={12.5} color={C.ink2}>
            필수 재직증명서 + 자격/면허 ·{' '}
            <Txt size={12.5} color={C.gray}>
              선택 명함
            </Txt>
          </Txt>
        </View>
      ) : null}
    </AppShell>
  );
}
