import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Btn, Screen, Txt } from '../src/ui';
import { useSignup } from '../src/store';
import { KcbWebView } from '../src/kcb-webview';
import {
  IDENTITY_PROVIDER,
  startKcbIdentity,
  fetchKcbIdentityResult,
  verifyCode,
  type BackendIdentity,
} from '../src/identity';
import { loginWithIdToken, testLogin } from '../src/signup-api';

/**
 * 회원 로그인 — 비밀번호 없이 휴대폰 본인인증으로 일원화한다.
 *
 * 가입과 동일한 본인인증(KCB)을 거쳐 받은 봉인 토큰(idToken)을 서버로 보내면,
 * 서버가 ciHash 로 본인 계정을 찾아 세션을 발급한다. 가입 심사를 신청한 적 없는
 * 번호면 not_member → 가입 안내. (App Review 데모 계정은 하단 롱프레스로 진입.)
 */
const USE_KCB = IDENTITY_PROVIDER === 'kcb' && !!process.env.EXPO_PUBLIC_API_BASE_URL;
const DEMO_EMAIL = 'apple-review@theone.kr';
const DEMO_PASSWORD = 'Theone!2026Review';

export default function Login() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [popupUrl, setPopupUrl] = useState<string | null>(null);
  const txRef = useRef<string | null>(null);
  // App Review 데모 로그인(숨김) — 하단 안내문 롱프레스로 노출
  const [demoOpen, setDemoOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  // 본인인증 성공(idToken 확보) → 서버에서 회원 식별 → 세션 발급 → 진입
  async function finishLogin(v: BackendIdentity) {
    if (!v.ok || !v.idToken) {
      setErr('본인인증에 실패했습니다. 다시 시도해 주세요.');
      return;
    }
    const r = await loginWithIdToken(v.idToken);
    if (r.ok) {
      set({
        userId: r.userId,
        sessionToken: r.token,
        gender: r.gender,
        name: v.name,
        birth: v.birth,
        phone: v.phone,
        verified: true,
        demoMode: false,
        isAdmin: !!r.isAdmin,
      });
      router.replace('/curation');
      return;
    }
    if (r.reason === 'not_member') {
      setErr('가입 심사를 신청한 번호가 아니에요. 먼저 가입 심사를 신청해 주세요.');
    } else if (r.reason === 'suspended') {
      setErr('이용이 정지된 계정입니다. 고객센터로 문의해 주세요.');
    } else {
      setErr('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  // ── KCB 본인확인 시작 → 팝업 URL 수신 ──
  async function startKcb() {
    setErr(null);
    setBusy(true);
    const r = await startKcbIdentity('THE ONE 로그인 본인확인');
    setBusy(false);
    if (r.ok && r.popupUrl && r.txSeqNo) {
      txRef.current = r.txSeqNo;
      setPopupUrl(r.popupUrl);
    } else {
      setErr('본인인증을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  // ── KCB 인증 완료 → 서버 재검증 → 로그인 ──
  async function onKcbDone() {
    const tx = txRef.current;
    setPopupUrl(null);
    if (!tx) return;
    setBusy(true);
    const v = await fetchKcbIdentityResult(tx);
    await finishLogin(v);
    setBusy(false);
  }

  // ── mock 경로(개발/테스트 — 키 미설정 시) ──
  async function onMockLogin() {
    setErr(null);
    setBusy(true);
    const v = await verifyCode('482000');
    await finishLogin(v);
    setBusy(false);
  }

  // ── App Review 데모 계정(숨김) ──
  function onDemoLogin() {
    if (email.trim().toLowerCase() === DEMO_EMAIL && pw === DEMO_PASSWORD) {
      set({
        demoMode: true,
        userId: 'demo-review',
        verified: true,
        name: '데모 회원',
        gender: 'male',
        isAdmin: false,
      });
      router.replace('/curation');
      return;
    }
    setErr('데모 계정 정보를 확인해 주세요.');
  }

  // ── QA 검수용 남/여 테스트 계정(숨김) — 실제 백엔드 세션으로 로그인해 큐레이션·신청·채팅까지 전부 검수 가능 ──
  async function onQaTestLogin(gender: 'male' | 'female') {
    setErr(null);
    setBusy(true);
    const r = await testLogin(gender);
    setBusy(false);
    if (r.ok) {
      set({
        userId: r.userId,
        sessionToken: r.token,
        gender: r.gender,
        verified: true,
        demoMode: false,
        isAdmin: false,
        name: gender === 'male' ? 'QA 테스트(남)' : 'QA 테스트(여)',
      });
      router.replace('/curation');
      return;
    }
    setErr('QA 테스트 계정 로그인에 실패했습니다.');
  }

  // KCB 인증창(WebView) 실행 중이면 전체 화면
  if (popupUrl) {
    return <KcbWebView url={popupUrl} onDone={onKcbDone} />;
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
          가입 때 사용한 휴대폰으로 본인인증하면 바로 로그인됩니다. 별도의 비밀번호는 없습니다.
        </Txt>

        <Btn
          label={busy ? '진행 중…' : '휴대폰 본인인증으로 로그인'}
          variant="solid"
          style={{ marginTop: 36 }}
          onPress={USE_KCB ? startKcb : onMockLogin}
          disabled={busy}
        />

        {err ? (
          <Txt size={11.5} color={C.terra} style={{ marginTop: 14, lineHeight: 18 }}>
            {err}
          </Txt>
        ) : null}

        <Pressable
          onPress={() => router.push('/signup/intro')}
          style={{ alignItems: 'center', marginTop: 22 }}
        >
          <Txt variant="mono" size={11} color={C.gray}>
            아직 회원이 아니신가요? 가입 심사 신청 →
          </Txt>
        </Pressable>

        {/* App Review 데모 로그인 — 안내문 롱프레스로 노출(가이드라인 2.1(a)) */}
        <Pressable onLongPress={() => setDemoOpen(true)} delayLongPress={1200}>
          <Txt size={10.5} color={C.gray} style={{ marginTop: 28, lineHeight: 17 }}>
            만 19세 이상 실명 회원만 이용할 수 있으며, 본인인증으로 연령·실명이 확인됩니다.
          </Txt>
        </Pressable>

        {demoOpen ? (
          <View
            style={{
              marginTop: 16,
              borderTopWidth: 1,
              borderTopColor: C.hairLight,
              paddingTop: 14,
            }}
          >
            <Txt variant="mono" size={10} color={C.gray} style={{ marginBottom: 8 }}>
              App Review
            </Txt>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={C.graySoft}
              style={inputStyle}
            />
            <TextInput
              value={pw}
              onChangeText={setPw}
              secureTextEntry
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor={C.graySoft}
              style={[inputStyle, { marginTop: 10 }]}
            />
            <Btn
              label="데모 로그인"
              variant="outline"
              style={{ marginTop: 12 }}
              onPress={onDemoLogin}
            />

            {/* QA 검수용 테스트 계정 — 실백엔드 세션(신청·수락·채팅까지 전부 검수 가능) */}
            <Txt variant="mono" size={10} color={C.gray} style={{ marginTop: 20, marginBottom: 8 }}>
              QA Test Accounts
            </Txt>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn
                label="남성 테스트 로그인"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => onQaTestLogin('male')}
                disabled={busy}
              />
              <Btn
                label="여성 테스트 로그인"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => onQaTestLogin('female')}
                disabled={busy}
              />
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: C.hairLight,
  borderRadius: RADIUS,
  backgroundColor: '#fff',
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 14,
  color: C.ink2,
} as const;
