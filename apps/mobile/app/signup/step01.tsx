import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell, FormFooter } from '../../src/app-shell';
import { C, RADIUS } from '../../src/theme';
import { Field, LoadingOverlay, Txt } from '../../src/ui';
import { KcbWebView } from '../../src/kcb-webview';
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

// 본인인증 결과 표시용 포맷터 ─────────────────────────────
function koreanAge(birth?: string): number | undefined {
  if (!birth) return undefined;
  const s = birth.replace(/\D/g, ''); // YYYYMMDD
  if (s.length < 8) return undefined;
  const y = +s.slice(0, 4);
  const m = +s.slice(4, 6);
  const d = +s.slice(6, 8);
  const t = new Date();
  let age = t.getFullYear() - y;
  // 생일이 안 지났으면 한 살 빼기 → 만 나이
  if (t.getMonth() + 1 < m || (t.getMonth() + 1 === m && t.getDate() < d)) age -= 1;
  return age >= 0 && age < 130 ? age : undefined;
}

function formatPhone(p?: string): string | undefined {
  if (!p) return undefined;
  const d = p.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
}

function genderKr(g?: string): string {
  return g === 'female' ? '여성' : g === 'male' ? '남성' : '—';
}

export default function Step01() {
  const router = useRouter();
  const set = useSignup((s) => s.set);
  // 본인인증으로 확정된 신원(표시용) — finishKcb/onVerify 가 store 에 저장한 값
  const gender = useSignup((s) => s.gender);
  const birth = useSignup((s) => s.birth);
  const phone = useSignup((s) => s.phone);
  const [carrier, setCarrier] = useState(0);
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);
  // KCB WebView 상태
  const [popupUrl, setPopupUrl] = useState<string | null>(null);
  const [starting, setStarting] = useState(false); // 본인인증 시작 네트워크 대기(즉시 인디케이터)
  const txRef = useRef<string | null>(null);
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
    if (starting) return; // 연타 방지 — 팝업이 두 번 뜨지 않게
    setErr(null);
    setStarting(true); // 탭 즉시 브랜드 인디케이터 — 인증창이 뜰 때까지의 대기 체감 제거
    try {
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
    } finally {
      setStarting(false);
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
    return <KcbWebView url={popupUrl} onDone={() => void finishKcb()} />;
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

          {/* 본인인증으로 확정된 신원 — 성별·휴대폰·나이(만) */}
          {verified ? (
            <View
              style={{
                marginTop: 16,
                borderWidth: 1,
                borderColor: C.hairLight,
                borderRadius: RADIUS,
              }}
            >
              {(
                [
                  ['성별', genderKr(gender)],
                  ['휴대폰', formatPhone(phone) ?? '—'],
                  ['나이', koreanAge(birth) != null ? `만 ${koreanAge(birth)}세` : '—'],
                ] as [string, string][]
              ).map(([label, value], i) => (
                <View
                  key={label}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 13,
                    paddingHorizontal: 14,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: C.hairLight,
                  }}
                >
                  <Txt size={12.5} color={C.gray}>
                    {label}
                  </Txt>
                  <Txt size={13.5} weight="600" color={C.ink2}>
                    {value}
                  </Txt>
                </View>
              ))}
            </View>
          ) : null}
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

      {/* 인증창이 뜨기 전 네트워크 대기 동안 즉시 표시 */}
      <LoadingOverlay visible={starting} label="본인인증을 준비하고 있어요" />
    </AppShell>
  );
}
