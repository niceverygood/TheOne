import { useRef, useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';
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
  reviewBypassIdentity,
} from '../../src/identity';
import { useSignup } from '../../src/store';

// KCB OkCert3 휴대폰 본인확인 — provider=kcb + API_BASE_URL 설정 시 활성. 없으면 mock 폴백.
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
const USE_KCB = IDENTITY_PROVIDER === 'kcb' && !!API_BASE;

// 통신사 PASS 앱 유니버셜 링크 호스트(iOS). WebView 안에서 열지 말고 OS로 넘겨 PASS 앱을 띄운다.
// (KCB '앱연동가이드(휴대폰본인확인)' — SKT/KT/LGU)
const PASS_UNIVERSAL_HOSTS = ['www.sktpass.com', 'fido.kt.com', 'fido.uplus.co.kr'];

function hostOf(url: string): string {
  return (url.replace(/^https?:\/\//i, '').split('/')[0] ?? '').toLowerCase();
}

// 안드로이드 intent:// URI 를 커스텀 스킴 URL 로 변환해 실행한다.
// RN Linking 은 intent:// 를 그대로 못 여므로(스킴/패키지 파싱 안 됨) 직접 변환한다.
//  intent://host/path?q#Intent;scheme=xxx;package=pkg;end → xxx://host/path?q
//  intent:scheme://...#Intent;package=pkg;end            → scheme://...
function launchAndroidIntent(url: string) {
  const hashIdx = url.indexOf('#Intent;');
  const meta = hashIdx >= 0 ? url.slice(hashIdx) : '';
  const scheme = meta.match(/scheme=([^;]+)/)?.[1];
  const pkg = meta.match(/package=([^;]+)/)?.[1];
  let body = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  let target = '';
  if (body.startsWith('intent://')) {
    body = body.slice('intent://'.length);
    target = scheme ? `${scheme}://${body}` : '';
  } else if (body.startsWith('intent:')) {
    target = body.slice('intent:'.length); // 본문이 이미 scheme:// 형태
  } else {
    target = body;
  }
  const market = pkg ? `market://details?id=${pkg}` : undefined;
  if (target) {
    Linking.openURL(target).catch(() => {
      if (market) Linking.openURL(market).catch(() => {});
    });
  } else if (market) {
    Linking.openURL(market).catch(() => {});
  }
}

// 통신사 PASS 앱 실행: intent://(안드로이드)·앱스킴·유니버셜 링크를 OS로 넘긴다.
function openPassApp(url: string) {
  if (/^intent:/i.test(url)) {
    launchAndroidIntent(url);
    return;
  }
  Linking.openURL(url).catch(() => {});
}

// WebView 가 로드를 시도하기 전 호출 — KCB 페이지는 그대로 로드하고,
// 통신사 PASS 앱(intent://·커스텀 스킴·유니버셜 링크)만 외부로 보낸다.
// 이 처리가 없으면 내장 WebView 는 intent:// 를 무시해 PASS 앱이 안 열리고 푸시도 오지 않는다.
function shouldLoadInWebView(url: string): boolean {
  if (/^https?:\/\//i.test(url)) {
    if (PASS_UNIVERSAL_HOSTS.includes(hostOf(url))) {
      openPassApp(url);
      return false; // 통신사 유니버셜 링크 → 외부(PASS 앱)
    }
    return true; // 일반 KCB 인증 페이지는 WebView 안에서
  }
  // intent:// 또는 통신사 앱 커스텀 스킴(tauthlink/ktauth/upluscorporation 등)
  openPassApp(url);
  return false;
}

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
  // Apple App Review 우회(숨김): 하단 안내문 롱프레스로 노출 → 심사 노트의 코드 입력
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewCode, setReviewCode] = useState('');

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
      set({
        verified: true,
        name: v.name,
        birth: v.birth,
        gender: v.gender,
        phone: v.phone,
        idToken: v.idToken,
      });
      setErr(null);
    } else if (v.reason === 'underage') {
      setErr('만 19세 미만은 가입할 수 없습니다.');
    } else {
      setErr('본인인증에 실패했습니다. 다시 시도해 주세요.');
    }
  }

  // ── Apple App Review 우회 — 심사 노트의 코드 입력 → 서버 검증 후 데모 성인 신원 ──
  async function onReviewBypass() {
    setErr(null);
    const v = await reviewBypassIdentity(reviewCode.trim());
    if (v.ok && v.isAdult) {
      setVerified(true);
      setVerifiedName(v.name);
      set({
        verified: true,
        name: v.name,
        birth: v.birth,
        gender: v.gender,
        phone: v.phone,
        idToken: v.idToken,
      });
    } else {
      setErr('코드가 올바르지 않습니다.');
    }
  }

  // KCB 인증창(WebView) 실행 중이면 전체 화면으로 표시
  if (USE_KCB && popupUrl) {
    return (
      <View style={{ flex: 1, backgroundColor: C.ivory }}>
        <WebView
          source={{ uri: popupUrl }}
          // intent:// 등 비-http 스킴이 onShouldStartLoadWithRequest 로 들어오게 허용
          originWhitelist={['*']}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          javaScriptEnabled
          domStorageEnabled
          // KCB 페이지가 window.open 으로 PASS 를 띄우는 경우도 같은 핸들러로 처리
          setSupportMultipleWindows={false}
          // 통신사 PASS 앱(intent://·앱스킴·유니버셜 링크)을 OS 로 넘겨 실행
          onShouldStartLoadWithRequest={(req) => shouldLoadInWebView(req.url)}
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
      total={8}
      footer={
        <FormFooter
          next="다음 — 사진"
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
          <Pressable onLongPress={() => setReviewMode(true)} delayLongPress={1200}>
            <Txt size={11} color={C.gray} style={{ marginTop: 12 }}>
              만 19세 미만은 가입할 수 없습니다. KCB 휴대폰 본인확인으로 실명·연령이 검증됩니다.
            </Txt>
          </Pressable>
          {reviewMode && !verified ? (
            <View
              style={{
                marginTop: 16,
                borderTopWidth: 1,
                borderTopColor: C.hairLight,
                paddingTop: 12,
              }}
            >
              <Txt variant="mono" size={10} color={C.gray} style={{ marginBottom: 6 }}>
                App Review
              </Txt>
              <TextInput
                value={reviewCode}
                onChangeText={setReviewCode}
                placeholder="review code"
                placeholderTextColor={C.gray}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  borderWidth: 1,
                  borderColor: C.hairLight,
                  borderRadius: RADIUS,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: C.ink2,
                  fontSize: 13,
                }}
              />
              <Pressable
                onPress={onReviewBypass}
                style={{
                  marginTop: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: C.ink2,
                  borderRadius: RADIUS,
                }}
              >
                <Txt size={12} color={C.ink2}>
                  확인
                </Txt>
              </Pressable>
            </View>
          ) : null}
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

      {/* 본인 명의가 아닌 경우 — 운영자 수동 본인인증 경로 */}
      <View
        style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: C.hairLight, paddingTop: 16 }}
      >
        <Pressable onPress={() => router.push('/signup/manual-identity')}>
          <Txt size={12.5} color={C.ink2} weight="500">
            본인 명의 휴대폰이 아니신가요?
          </Txt>
          <Txt size={11} color={C.gray} style={{ marginTop: 4, lineHeight: 17 }}>
            가족 명의 등으로 본인인증이 어려우면, 신분증 사진으로 운영자가 직접 확인해 드립니다 →
          </Txt>
        </Pressable>
      </View>
    </AppShell>
  );
}
