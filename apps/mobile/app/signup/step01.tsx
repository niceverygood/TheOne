import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Field, Txt } from '../../src/ui';
import {
  CARRIERS,
  requestCode,
  verifyCode,
  IDENTITY_PROVIDER,
  startKcbIdentity,
  fetchKcbIdentityResult,
} from '../../src/identity';
import { useSignup } from '../../src/store';

// KCB OkCert3 휴대폰 본인확인 — provider=kcb + API_BASE_URL 설정 시 활성. 없으면 mock 폴백.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
const USE_KCB = IDENTITY_PROVIDER === 'kcb' && !!API_BASE;

export default function Step01() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  const [carrier, setCarrier] = useState(0);
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);
  // KCB WebView 상태
  const [popupUrl, setPopupUrl] = useState<string | null>(null);
  const txRef = useRef<string | null>(null);
  const doneRef = useRef(false); // onNavigationStateChange 다중 호출 가드

  // ── mock 경로(키 미설정 시) ───────────────────────────────
  async function onRequest() {
    await requestCode('010');
    setSent(true);
  }
  async function onVerify() {
    const res = await verifyCode('482000');
    if (res.ok && res.isAdult) {
      setVerified(true);
      setVerifiedName(res.name);
      set({
        verified: true,
        name: res.name,
        birth: res.birth,
        gender: res.gender,
        phone: '010-1234-5678',
      });
    }
  }

  // ── KCB 본인확인 시작 → 팝업 URL 수신 ───────────────────────
  async function startKcb() {
    setErr(null);
    doneRef.current = false;
    const r = await startKcbIdentity('THE ONE 본인확인');
    if (r.ok && r.popupUrl && r.txSeqNo) {
      txRef.current = r.txSeqNo;
      setPopupUrl(r.popupUrl);
    } else {
      setErr(
        r.reason === 'no_api_base'
          ? '서버 설정 오류입니다. 잠시 후 다시 시도해 주세요.'
          : '본인인증을 시작할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      );
    }
  }

  // ── KCB 인증 완료 → 서버 재검증(성인/실명) ─────────────────
  async function finishKcb() {
    const tx = txRef.current;
    setPopupUrl(null);
    if (!tx) return;
    const v = await fetchKcbIdentityResult(tx);
    if (v.ok && v.isAdult) {
      setVerified(true);
      setVerifiedName(v.name);
      set({ verified: true, name: v.name, birth: v.birth, gender: v.gender, phone: v.phone });
      setErr(null);
    } else if (v.reason === 'underage') {
      setErr('만 19세 미만은 가입할 수 없습니다.');
    } else {
      setErr('본인인증에 실패했습니다. 다시 시도해 주세요.');
    }
  }

  // KCB 인증창(WebView) 실행 중이면 전체 화면으로 표시
  if (USE_KCB && popupUrl) {
    return (
      <View style={{ flex: 1, backgroundColor: C.ivory }}>
        <WebView
          source={{ uri: popupUrl }}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          javaScriptEnabled
          domStorageEnabled
          onNavigationStateChange={(s) => {
            // identity-kcb 가 인증 완료 후 /kcb/done 으로 이동 → 가드 후 결과 조회
            if (!doneRef.current && /\/kcb\/done\b/.test(s.url)) {
              doneRef.current = true;
              void finishKcb();
            }
          }}
        />
      </View>
    );
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
      {USE_KCB ? (
        // ── KCB OkCert3 휴대폰 본인확인 경로 ──
        <>
          <Field
            eyebrow="이름"
            label="실명"
            value={verified ? verifiedName : undefined}
            placeholder="본인인증 후 자동 입력"
            verified={verified}
          />
          {!verified ? (
            <Pressable
              onPress={startKcb}
              style={{
                marginTop: 8,
                paddingVertical: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: C.ink2,
                backgroundColor: C.ink2,
                borderRadius: RADIUS,
              }}
            >
              <Txt size={13} color={C.ivory}>
                휴대폰 본인인증 시작
              </Txt>
            </Pressable>
          ) : (
            <Txt variant="mono" size={11} color={C.sage} style={{ marginTop: 12 }}>
              ✓ 본인인증 완료
            </Txt>
          )}
          {err ? (
            <Txt size={11} color={C.terra} style={{ marginTop: 12 }}>
              {err}
            </Txt>
          ) : null}
          <Txt size={11} color={C.gray} style={{ marginTop: 12 }}>
            만 19세 미만은 가입할 수 없습니다. KCB 휴대폰 본인확인으로 실명·연령이 검증됩니다.
          </Txt>
        </>
      ) : (
        // ── mock 경로(개발/테스트 — 키 미설정 시) ──
        <>
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
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
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
            만 19세 미만은 가입할 수 없습니다. (개발용 mock — 운영 빌드에서는 KCB 본인확인)
          </Txt>
        </>
      )}
    </AppShell>
  );
}
