import { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { C, F, RADIUS, S } from './theme';

/* ---- 텍스트 ---- */
type TxtVariant = 'serifKr' | 'serifEn' | 'body' | 'eyebrow' | 'mono';
export function Txt({
  variant = 'body',
  color = C.ink2,
  size,
  weight,
  style,
  children,
  ...rest
}: TextProps & {
  variant?: TxtVariant;
  color?: string;
  size?: number;
  weight?: '400' | '500' | '600' | '700';
}) {
  const base: Record<TxtVariant, object> = {
    serifKr: { fontFamily: F.serifKr, letterSpacing: -0.4 },
    serifEn: { fontFamily: F.serifEn, fontStyle: 'italic' as const },
    body: { fontFamily: F.sansKr, letterSpacing: -0.3, lineHeight: 22 },
    eyebrow: {
      fontFamily: F.sansEn,
      fontSize: 10,
      letterSpacing: 2,
      textTransform: 'uppercase' as const,
      color: C.gray,
    },
    mono: { fontFamily: F.mono, fontSize: 11, letterSpacing: 0.5 },
  };
  return (
    <Text
      style={[
        base[variant],
        { color },
        size != null && { fontSize: size },
        weight != null && { fontWeight: weight },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/* ---- 버튼 ---- */
export function Btn({
  label,
  onPress,
  variant = 'solid',
  disabled,
  style,
  labelColor,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'solid' | 'outline' | 'champ' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  labelColor?: string;
}) {
  const v = {
    solid: { bg: C.ink2, bd: C.ink2, fg: C.ivory },
    outline: { bg: 'transparent', bd: C.ink2, fg: C.ink2 },
    champ: { bg: C.champagne, bd: C.champagne, fg: C.ivory },
    ghost: { bg: 'transparent', bd: 'transparent', fg: C.gray },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        st.btn,
        { backgroundColor: v.bg, borderColor: v.bd, opacity: disabled ? 0.35 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      <Txt color={labelColor ?? v.fg} size={14} weight="500">
        {label}
      </Txt>
    </Pressable>
  );
}

/* ---- 화면 셸 ---- */
export function Screen({
  dark,
  children,
  scroll = true,
}: {
  dark?: boolean;
  children: ReactNode;
  scroll?: boolean;
}) {
  const bg = dark ? C.ink : C.ivory;
  const inner = <View style={{ flex: 1, minHeight: '100%' as unknown as number }}>{children}</View>;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          style={{ backgroundColor: bg }}
          contentContainerStyle={{ minHeight: '100%' }}
          showsVerticalScrollIndicator={false}
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

/* ---- hairline ---- */
export function Hairline({ dark, style }: { dark?: boolean; style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: dark ? C.hairDark : C.hairLight }, style]} />;
}

/* ---- 검증 4점 ---- */
export function VerifiedDots({
  marks = 4,
  dark,
  size = 6,
}: {
  marks?: number;
  dark?: boolean;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            backgroundColor: i < marks ? C.sage : 'transparent',
            borderWidth: i < marks ? 0 : 1,
            borderColor: dark ? C.hairDark : C.hairLight,
          }}
        />
      ))}
    </View>
  );
}

/* ---- SVG 인물 placeholder ---- */
export function Portrait({
  height = 200,
  label,
  radius = RADIUS,
  fill,
  source,
  imageStyle,
}: {
  height?: number;
  label?: string;
  radius?: number;
  fill?: boolean;
  source?: ImageSourcePropType;
  imageStyle?: ImageStyle;
}) {
  return (
    <View
      style={
        fill
          ? { flex: 1, borderRadius: radius, overflow: 'hidden' }
          : { width: '100%', height, borderRadius: radius, overflow: 'hidden' }
      }
    >
      {source ? (
        <Image
          source={source}
          resizeMode="cover"
          style={[{ width: '100%', height: '100%' }, imageStyle]}
        />
      ) : (
        <Svg width="100%" height="100%" viewBox="0 0 100 130" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="pg" x1="0" y1="0" x2="0.4" y2="1">
              <Stop offset="0" stopColor="#E8E2D5" />
              <Stop offset="1" stopColor="#C8C1B1" />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="130" fill="url(#pg)" />
          <Circle cx="50" cy="52" r="20" fill="#A89F8E" opacity={0.6} />
          <Path d="M16 130 Q16 90 50 90 Q84 90 84 130 Z" fill="#A89F8E" opacity={0.6} />
        </Svg>
      )}
      {label ? (
        <Txt
          variant="mono"
          size={9}
          color="rgba(26,31,46,0.55)"
          style={{ position: 'absolute', top: 10, left: 10 }}
        >
          {label}
        </Txt>
      ) : null}
    </View>
  );
}

/* ---- 가입 Step 점 인디케이터 ---- */
export function StepDots({ step, total = 6 }: { step: number; total?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 3,
            width: i + 1 === step ? 22 : 8,
            backgroundColor: i + 1 <= step ? C.ink2 : C.ivory3,
          }}
        />
      ))}
    </View>
  );
}

/* ---- 입력 필드(표시용) ---- */
export function Field({
  label,
  value,
  placeholder,
  eyebrow,
  verified,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  eyebrow?: string;
  verified?: boolean;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      {eyebrow ? (
        <Txt variant="eyebrow" style={{ marginBottom: 6 }}>
          {eyebrow}
        </Txt>
      ) : null}
      <View style={{ borderBottomWidth: 1, borderBottomColor: C.hairLight, paddingBottom: 10 }}>
        <Txt variant="body" size={11} color={C.gray}>
          {label}
        </Txt>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <Txt
            variant="body"
            size={16}
            color={value ? C.ink2 : C.graySoft}
            weight={value ? '500' : '400'}
          >
            {value || placeholder}
          </Txt>
          {verified ? (
            <Txt variant="mono" size={9} color={C.sage}>
              ✓ 인증됨
            </Txt>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/* ---- 라디오/선택 행 ---- */
export function ChoiceRow({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint?: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: selected ? C.ink2 : C.hairLight,
        backgroundColor: selected ? C.ink2 : 'transparent',
        borderRadius: RADIUS,
        marginBottom: 8,
      }}
    >
      <View style={{ flex: 1 }}>
        <Txt size={14.5} weight="500" color={selected ? C.ivory : C.ink2}>
          {label}
        </Txt>
        {hint ? (
          <Txt
            size={11}
            color={selected ? 'rgba(250,247,242,0.6)' : C.gray}
            style={{ marginTop: 2 }}
          >
            {hint}
          </Txt>
        ) : null}
      </View>
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: selected ? C.ivory : C.graySoft,
          backgroundColor: selected ? C.champagne : 'transparent',
        }}
      />
    </Pressable>
  );
}

const st = StyleSheet.create({
  btn: {
    borderRadius: RADIUS,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
