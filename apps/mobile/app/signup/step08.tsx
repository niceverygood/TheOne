import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { showAlert } from '../../src/brand-alert';
import { useRouter } from 'expo-router';
import { INTRO_SECTIONS, type IntroSections } from '@theone/shared';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Txt } from '../../src/ui';
import { useSignup } from '../../src/store';
import { generateProfileIntro, submitSignup } from '../../src/signup-api';

function ageFromBirth(birth?: string): number | undefined {
  if (!birth) return undefined;
  const y = Number(birth.slice(0, 4));
  if (!y) return undefined;
  return new Date().getFullYear() - y;
}

export default function Step08() {
  const router = useRouter();
  const signup = useSignup();
  const set = signup.set;
  const [sections, setSections] = useState<IntroSections>(
    (signup.introSections as IntroSections) ?? {},
  );
  const [referral, setReferral] = useState(signup.referralCode ?? '');
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [source, setSource] = useState<'ai' | 'template' | null>(null);

  const generate = async () => {
    setGenerating(true);
    const res = await generateProfileIntro({
      gender: signup.gender,
      jobCategory: signup.jobCategory ?? '',
      age: ageFromBirth(signup.birth),
      height: signup.height,
      residenceRegion: signup.residenceRegion,
      activityRegion: signup.activityRegion,
      school: signup.school,
      hobbies: signup.hobbies,
      drinkingFrequency: signup.drinkingFrequency,
      drinkingAmount: signup.drinkingAmount,
      smoking: signup.smoking,
      bodyType: signup.bodyType,
    });
    setGenerating(false);
    if (res.ok) {
      setSections(res.sections);
      setSource(res.source);
    } else {
      showAlert('생성에 실패했어요', res.message);
    }
  };

  // 진입 시 1회 자동 생성 (기존 편집본 없을 때만)
  useEffect(() => {
    if (!signup.introSections) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    if (submitting) return;
    if (!signup.jobCategory) {
      showAlert('직업을 선택해 주세요', '이전 단계에서 직업 카테고리를 먼저 선택해 주세요.');
      return;
    }
    setSubmitting(true);
    set({ introSections: sections, referralCode: referral.trim() || undefined });
    const res = await submitSignup({
      gender: signup.gender,
      jobCategory: signup.jobCategory,
      birth: signup.birth,
      phone: signup.phone,
      referralCode: referral.trim() || undefined,
      photoCount: signup.photoCount,
      height: signup.height,
      residenceRegion: signup.residenceRegion,
      activityRegion: signup.activityRegion,
      school: signup.school,
      hobbies: signup.hobbies,
      drinkingFrequency: signup.drinkingFrequency,
      drinkingAmount: signup.drinkingAmount,
      smoking: signup.smoking,
      bodyType: signup.bodyType,
      introSections: sections,
      idToken: signup.idToken,
    });
    setSubmitting(false);
    if (res.ok) {
      set({ userId: res.userId });
      router.replace('/signup/complete');
      return;
    }
    showAlert(
      res.reason === 'duplicate' ? '이미 가입된 정보예요' : '제출에 실패했어요',
      res.message,
    );
  };

  return (
    <AppShell
      step={8}
      total={8}
      eyebrow="Introduction"
      title="자기소개"
      subtitle="입력하신 정보로 자기소개 초안을 만들었습니다. 자유롭게 다듬어 주세요. 매칭 상대가 읽는 글입니다."
      footer={
        <FormFooter
          next={submitting ? '제출 중…' : '가입 신청서 제출'}
          disabled={submitting || generating}
          onNext={onSubmit}
        />
      }
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <Txt variant="mono" size={10} color={C.gray}>
          {source === 'ai'
            ? 'AI 초안 · 편집 가능'
            : source === 'template'
              ? '기본 초안 · 편집 가능'
              : ''}
        </Txt>
        <Pressable onPress={generate} disabled={generating}>
          <Txt variant="mono" size={11} color={C.champagne}>
            {generating ? '생성 중…' : '↻ 다시 생성'}
          </Txt>
        </Pressable>
      </View>

      {generating && !sections.about ? (
        <View style={{ paddingVertical: 48, alignItems: 'center' }}>
          <ActivityIndicator color={C.champagne} />
          <Txt size={12} color={C.gray} style={{ marginTop: 12 }}>
            자기소개를 작성하고 있어요…
          </Txt>
        </View>
      ) : (
        INTRO_SECTIONS.map((s) => (
          <View key={s.key} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <Txt variant="serifKr" size={15} weight="700" color={C.ink2}>
                {s.label}
              </Txt>
              <Txt variant="serifEn" size={11} color={C.champagne}>
                {s.en}
              </Txt>
            </View>
            <TextInput
              value={sections[s.key] ?? ''}
              onChangeText={(t) => setSections((prev) => ({ ...prev, [s.key]: t }))}
              placeholder="내용을 입력해 주세요"
              placeholderTextColor={C.graySoft}
              multiline
              style={{
                borderWidth: 1,
                borderColor: C.hairLight,
                borderRadius: RADIUS,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: C.ink2,
                fontSize: 14,
                lineHeight: 21,
                minHeight: 76,
                textAlignVertical: 'top',
              }}
            />
          </View>
        ))
      )}

      {/* 추천인(선택) */}
      <View
        style={{ marginTop: 8, borderTopWidth: 1, borderTopColor: C.hairLight, paddingTop: 20 }}
      >
        <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
          추천인 코드 (선택)
        </Txt>
        <TextInput
          value={referral}
          onChangeText={setReferral}
          placeholder="회원의 추천을 받으셨다면 입력"
          placeholderTextColor={C.graySoft}
          autoCapitalize="characters"
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
        <Txt size={11} color={C.gray} style={{ marginTop: 8 }}>
          입력 시 가입 심사 우선순위가 올라갑니다.
        </Txt>
      </View>
    </AppShell>
  );
}
