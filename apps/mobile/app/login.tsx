import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Btn, Screen, Txt } from '../src/ui';
import { useSignup } from '../src/store';

/**
 * 회원 로그인 — 심사 통과 회원 + App Review 데모 계정.
 *
 * 데모 계정(App Store Connect 심사 정보와 동일)으로 로그인하면 demonstration mode 가
 * 켜져 전 기능을 열람·검증할 수 있다(가이드라인 2.1(a) 대응). 일반 회원 로그인은
 * 본인인증 재확인 방식으로 별도 제공 예정.
 */
const DEMO_EMAIL = 'apple-review@theone.kr';
const DEMO_PASSWORD = 'Theone!2026Review';

export default function Login() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const e = email.trim().toLowerCase();
    if (e === DEMO_EMAIL && pw === DEMO_PASSWORD) {
      set({
        demoMode: true,
        userId: 'demo-review',
        verified: true,
        name: '데모 회원',
        gender: 'male',
      });
      router.replace('/curation');
      return;
    }
    setErr('계정 정보를 확인해 주세요. 심사 통과 회원은 가입 시 안내된 방법으로 로그인합니다.');
  }

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>

        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 28 }}>
          Member Sign In
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 6 }}>
          회원 로그인
        </Txt>
        <Txt size={13} color={C.gray} style={{ marginTop: 8, lineHeight: 21 }}>
          심사를 통과한 회원만 로그인할 수 있습니다.
        </Txt>

        <Txt variant="eyebrow" style={{ marginTop: 32, marginBottom: 8 }}>
          이메일
        </Txt>
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErr(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={C.graySoft}
          style={{
            borderWidth: 1,
            borderColor: C.hairLight,
            borderRadius: RADIUS,
            backgroundColor: '#fff',
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            color: C.ink2,
          }}
        />

        <Txt variant="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>
          비밀번호
        </Txt>
        <TextInput
          value={pw}
          onChangeText={(v) => {
            setPw(v);
            setErr(null);
          }}
          secureTextEntry
          autoCapitalize="none"
          placeholder="••••••••"
          placeholderTextColor={C.graySoft}
          style={{
            borderWidth: 1,
            borderColor: C.hairLight,
            borderRadius: RADIUS,
            backgroundColor: '#fff',
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            color: C.ink2,
          }}
        />

        {err ? (
          <Txt size={11.5} color={C.terra} style={{ marginTop: 12, lineHeight: 18 }}>
            {err}
          </Txt>
        ) : null}

        <Btn label="로그인" variant="solid" style={{ marginTop: 28 }} onPress={submit} />

        <Pressable
          onPress={() => router.push('/signup/intro')}
          style={{ alignItems: 'center', marginTop: 18 }}
        >
          <Txt variant="mono" size={11} color={C.gray}>
            아직 회원이 아니신가요? 가입 심사 신청 →
          </Txt>
        </Pressable>
      </View>
    </Screen>
  );
}
