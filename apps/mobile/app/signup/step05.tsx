import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Txt } from '../../src/ui';
import { FEMALE_JOBS, MALE_JOBS, type Job } from '../../src/jobs';
import { useSignup } from '../../src/store';

export default function Step05() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  // 성별은 step01 본인인증(KCB)에서 확정된 값을 사용한다 — 사용자가 임의로 바꿀 수 없다.
  const gender = useSignup((s) => s.gender);
  const [picked, setPicked] = useState<string | null>(useSignup.getState().jobCategory ?? null);
  const [school, setSchool] = useState(useSignup.getState().school ?? '');
  const jobs = gender === 'male' ? MALE_JOBS : FEMALE_JOBS;
  const selected = jobs.find((j) => j.id === picked);

  return (
    <AppShell
      step={5}
      total={8}
      eyebrow="Occupation & School"
      title="직업 · 학교"
      subtitle="가입 심사 위원회가 서류를 검토해 직업 뱃지를 부여합니다. 학교는 가입 후 학력 인증으로 확정됩니다."
      footer={
        <FormFooter
          next="다음 — 취미"
          disabled={!picked}
          onNext={() => {
            set({ jobCategory: picked!, school: school.trim() || undefined });
            router.push('/signup/step06');
          }}
        />
      }
    >
      {/* 성별 — 본인인증으로 확정(읽기 전용) */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: C.hairLight,
          borderRadius: RADIUS,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 20,
        }}
      >
        <Txt size={12.5} color={C.gray}>
          회원 구분
        </Txt>
        <Txt size={13} weight="600" color={C.ink2}>
          {gender === 'male' ? '남성 회원' : '여성 회원'} · 본인인증 확정
        </Txt>
      </View>

      {/* 직업 2열 그리드 */}
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

      {/* 학교 입력 */}
      <View style={{ marginTop: 24 }}>
        <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
          학교 (선택)
        </Txt>
        <TextInput
          value={school}
          onChangeText={setSchool}
          placeholder="예: 서울대학교 · 연세대학교"
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
        {selected ? (
          <Txt size={11} color={C.gray} style={{ marginTop: 10, lineHeight: 17 }}>
            {selected.kr} · 가입 후 재직증명서/자격증으로 직업 뱃지를 받을 수 있습니다.
          </Txt>
        ) : null}
      </View>
    </AppShell>
  );
}
