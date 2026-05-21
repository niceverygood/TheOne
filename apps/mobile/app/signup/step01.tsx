import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Field, Txt } from '../../src/ui';
import { CARRIERS, requestCode, verifyCode } from '../../src/auth-mock';
import { useSignup } from '../../src/store';

export default function Step01() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [carrier, setCarrier] = useState(0);
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);

  async function onRequest() {
    await requestCode('010');
    setSent(true);
  }
  async function onVerify() {
    const res = await verifyCode('482000');
    if (res.ok && res.isAdult) {
      setVerified(true);
      set({
        verified: true,
        name: res.name,
        birth: res.birth,
        gender: res.gender,
        phone: '010-1234-5678',
      });
    }
  }

  return (
    <AppShell
      step={1}
      eyebrow="Identity"
      title="본인 인증"
      subtitle="실명 확인을 위해 휴대폰 본인 인증을 진행합니다. 정보는 매칭 상대에게 노출되지 않습니다."
      footer={
        <FormFooter
          next="다음 — 직업"
          disabled={!verified}
          onNext={() => router.push('/signup/step02')}
        />
      }
    >
      <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
        통신사
      </Txt>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
        {CARRIERS.map((c, i) => (
          <Pressable
            key={c}
            onPress={() => setCarrier(i)}
            style={{
              flex: 1,
              paddingVertical: 11,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: i === carrier ? C.ink2 : C.hairLight,
              backgroundColor: i === carrier ? C.ink2 : 'transparent',
              borderRadius: RADIUS,
            }}
          >
            <Txt size={12.5} color={i === carrier ? C.ivory : C.ink2}>
              {c}
            </Txt>
          </Pressable>
        ))}
      </View>

      <Field
        eyebrow="이름"
        label="실명"
        value={verified ? '김민준' : undefined}
        placeholder="본인인증 후 자동 입력"
        verified={verified}
      />
      <Field eyebrow="휴대폰" label="번호" value="010 - 1234 - 5678" />

      {!sent ? (
        <Pressable onPress={onRequest} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
          <Txt variant="mono" size={11} color={C.champagne}>
            인증번호 받기 →
          </Txt>
        </Pressable>
      ) : (
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: C.hairLight,
            paddingBottom: 10,
            marginBottom: 8,
          }}
        >
          <Txt variant="eyebrow" style={{ marginBottom: 6 }}>
            인증번호
          </Txt>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Txt variant="mono" size={18} color={C.ink2}>
              4 8 2 0 0 0
            </Txt>
            {verified ? (
              <Txt variant="mono" size={11} color={C.sage}>
                ✓ 인증 완료
              </Txt>
            ) : (
              <Pressable onPress={onVerify}>
                <Txt variant="mono" size={11} color={C.champagne}>
                  확인
                </Txt>
              </Pressable>
            )}
          </View>
        </View>
      )}
      <Txt size={11} color={C.gray} style={{ marginTop: 12 }}>
        만 19세 미만은 가입할 수 없습니다. (mock 본인인증 — 정식 PASS/KCB 연동 예정)
      </Txt>
    </AppShell>
  );
}
