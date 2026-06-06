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
  // 성별은 step01 본인인증(KCB)에서 확정된 값을 사용한다 — 사용자가 임의로 바꿀 수 없다
  // (남11/여13 직업 카테고리는 검증된 성별에 따라 결정). 미인증 진입 시 store 기본값(male).
  const gender = useSignup((s) => s.gender);
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
      {/* 성별 — 본인인증으로 확정(읽기 전용). 임의 변경 불가 */}
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
