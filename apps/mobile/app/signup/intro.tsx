import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Hairline, Txt } from '../../src/ui';
import { openLegal } from '../../src/safety';
import { useSignup } from '../../src/store';

const STEPS = [
  ['01', '본인 인증', '휴대폰 · 약 2분'],
  ['02', '사진', '최소 2장 · 약 3분'],
  ['03', '키', '약 1분'],
  ['04', '지역', '사는·활동 지역 · 약 1분'],
  ['05', '직업 · 학교', '약 2분'],
  ['06', '취미', '다중 선택 · 약 1분'],
  ['07', '라이프스타일', '음주·흡연·체형 · 약 1분'],
  ['08', '자기소개', 'AI 초안 + 편집 · 약 3분'],
];
// 학력·직업 등 인증은 가입 후 '추가 인증' 단계로 이동 (docs/verification-sop.md §1 · CLAUDE.md §1).

export default function Intro() {
  const router = useRouter();
  const acceptedTerms = useSignup((s) => s.acceptedTerms);
  const acceptTerms = useSignup((s) => s.acceptTerms);
  const [agreed, setAgreed] = useState(acceptedTerms);

  function start() {
    if (!agreed) return;
    acceptTerms();
    router.push('/signup/step01');
  }

  return (
    <AppShell
      hideBack
      eyebrow="Application"
      title={<>가입 심사를{'\n'}시작합니다</>}
      subtitle="심사는 평균 5일이 소요됩니다. 8단계를 차분히 채워주세요. 진정성 있는 작성이 통과율을 높입니다."
      footer={
        <FormFooter
          onlyNext
          next="시작하기"
          disabled={!agreed}
          hint="작성 중 언제든 저장하고 이어서 진행할 수 있습니다."
          onNext={start}
        />
      }
    >
      <View>
        {STEPS.map(([n, t, h], i) => (
          <View key={n}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 }}
            >
              <Txt variant="mono" size={13} color={C.champagne} style={{ width: 24 }}>
                {n}
              </Txt>
              <View style={{ flex: 1 }}>
                <Txt size={15} weight="500" color={C.ink2}>
                  {t}
                </Txt>
                <Txt size={11.5} color={C.gray} style={{ marginTop: 1 }}>
                  {h}
                </Txt>
              </View>
            </View>
            {i < STEPS.length - 1 ? <Hairline /> : null}
          </View>
        ))}
      </View>

      {/* 약관·커뮤니티 가이드라인 동의 (필수) — App Store 1.2 무관용 정책 고지 */}
      <Pressable
        onPress={() => setAgreed((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
          marginTop: 28,
          padding: 16,
          borderWidth: 1,
          borderColor: agreed ? C.sage : C.hairLight,
          borderRadius: RADIUS,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 1,
            marginTop: 1,
            borderColor: agreed ? C.sage : C.graySoft,
            backgroundColor: agreed ? C.sage : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {agreed ? (
            <Txt variant="mono" size={12} color={C.ivory}>
              ✓
            </Txt>
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <Txt size={13} color={C.ink2} style={{ lineHeight: 20 }}>
            (필수) 이용약관과 커뮤니티 가이드라인에 동의합니다.
          </Txt>
          <Txt size={11.5} color={C.gray} style={{ marginTop: 4, lineHeight: 18 }}>
            성희롱·사기·욕설·부적절한 사진 등 불쾌감을 주는 콘텐츠는 무관용 원칙으로 즉시 제재되며,
            신고 시 운영진이 24시간 내 조치합니다.
          </Txt>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
            <Pressable onPress={() => openLegal('terms')} hitSlop={8}>
              <Txt size={11.5} color={C.champagne} style={{ textDecorationLine: 'underline' }}>
                이용약관
              </Txt>
            </Pressable>
            <Pressable onPress={() => openLegal('privacy')} hitSlop={8}>
              <Txt size={11.5} color={C.champagne} style={{ textDecorationLine: 'underline' }}>
                개인정보처리방침
              </Txt>
            </Pressable>
            <Pressable onPress={() => openLegal('child-safety')} hitSlop={8}>
              <Txt size={11.5} color={C.champagne} style={{ textDecorationLine: 'underline' }}>
                커뮤니티 가이드라인
              </Txt>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </AppShell>
  );
}
