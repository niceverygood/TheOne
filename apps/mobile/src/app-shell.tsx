import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, S } from './theme';
import { Btn, Hairline, Screen, StepDots, Txt } from './ui';

/** 가입 심사 공통 셸 — Step 점 + 영문 에디토리얼 + 본문 + 푸터 */
export function AppShell({
  step,
  total = 5,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  hideBack,
}: {
  step?: number;
  total?: number;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  hideBack?: boolean;
}) {
  const router = useRouter();
  return (
    <Screen scroll={false}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: S.gutter, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 28,
              }}
            >
              {hideBack ? (
                <View style={{ width: 18 }} />
              ) : (
                <Pressable onPress={() => router.back()}>
                  <Txt variant="mono" size={18} color={C.ink2}>
                    ←
                  </Txt>
                </Pressable>
              )}
              {step != null ? <StepDots step={step} total={total} /> : <View />}
              <Txt variant="mono" size={10} color={C.gray}>
                {step != null ? `0${step}/0${total}` : ''}
              </Txt>
            </View>
            {eyebrow ? (
              <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 8 }}>
                {eyebrow}
              </Txt>
            ) : null}
            <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ lineHeight: 36 }}>
              {title}
            </Txt>
            {subtitle ? (
              <Txt size={13.5} color={C.gray} style={{ marginTop: 10, lineHeight: 21 }}>
                {subtitle}
              </Txt>
            ) : null}
          </View>
          <View style={{ flex: 1, paddingHorizontal: S.gutter, paddingTop: 28 }}>{children}</View>
        </View>
        {footer ? (
          <View>
            <Hairline />
            <View style={{ padding: S.gutter }}>{footer}</View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

export function FormFooter({
  next = '다음',
  prev = '이전',
  onNext,
  onlyNext,
  disabled,
  hint,
}: {
  next?: string;
  prev?: string;
  onNext?: () => void;
  onlyNext?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  const router = useRouter();
  if (onlyNext) {
    return (
      <View>
        {hint ? (
          <Txt size={11.5} color={C.gray} style={{ textAlign: 'center', marginBottom: 14 }}>
            {hint}
          </Txt>
        ) : null}
        <Btn label={next} variant="solid" onPress={onNext} disabled={disabled} />
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Btn label={prev} variant="outline" onPress={() => router.back()} style={{ width: 96 }} />
      <Btn label={next} variant="solid" onPress={onNext} disabled={disabled} style={{ flex: 1 }} />
    </View>
  );
}
