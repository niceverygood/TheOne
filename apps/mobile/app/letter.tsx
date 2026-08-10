import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { letterCost } from '@theone/shared';
import type { CurationCandidateMeta } from '@theone/shared';
import { C, RADIUS } from '../src/theme';
import { Btn, Hairline, Portrait, Screen, Txt } from '../src/ui';
import { ChoiceRow } from '../src/ui';
import { previewPortraits } from '../src/preview-assets';
import { fetchCreditBalance, fetchProfile, sendLetter } from '../src/signup-api';
import { showAlert } from '../src/brand-alert';

const MAX_LEN = 300;
const MIN_LEN = 80;

/** 작성 가이드 — 수락률을 높이는 3요소. 탭하면 문장 시작점을 본문에 추가한다. */
const GUIDES: { label: string; starter: string }[] = [
  { label: '프로필에서 끌린 점', starter: '프로필에서 ' },
  { label: '나의 가치관 한 줄', starter: '저는 관계에서 ' },
  { label: '구체적인 만남 제안', starter: '괜찮으시다면 ' },
];

const SEND_FAIL_MESSAGE: Record<string, string> = {
  cannot_letter_self: '본인에게는 신청서를 보낼 수 없어요.',
  letter_too_short: '80자 이상 작성해 주세요.',
  recipient_unavailable: '지금은 신청서를 보낼 수 없는 회원이에요.',
  blocked: '차단 관계에서는 신청서를 보낼 수 없어요.',
  already_sent: '이미 신청서를 보낸 상대예요. 응답을 기다려 주세요.',
  sender_inactive: '현재 계정 상태에서는 신청서를 보낼 수 없어요.',
};

/** Screen 12 · 만남 신청서 (Interest Letter) — 골드스푼식 진지한 글쓰기 + 크레딧 차감 */
export default function Letter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, to } = useLocalSearchParams<{ mode?: string; to?: string }>();
  const [body, setBody] = useState('');
  const [sup, setSup] = useState(mode === 'super'); // Super Like 진입 시 우선 신청서 기본 선택
  const [candidate, setCandidate] = useState<CurationCandidateMeta | null>(null);
  const [balance, setBalance] = useState(0);
  const [sending, setSending] = useState(false);
  const len = body.length;
  const enough = len >= MIN_LEN && len <= MAX_LEN;

  useEffect(() => {
    fetchCreditBalance().then((r) => {
      if (r.ok) setBalance(r.balance);
    });
    if (!to) return;
    let alive = true;
    fetchProfile(to).then((r) => {
      if (alive && r.ok) setCandidate(r.candidate);
    });
    return () => {
      alive = false;
    };
  }, [to]);

  const titleText = candidate?.jobDetail ?? candidate?.jobCategory ?? '김지윤';
  const subText = candidate
    ? [candidate.age ? `${candidate.age}` : null, candidate.region].filter(Boolean).join(' · ')
    : '32 · 변호사 · 서초';
  const heroSource = candidate?.photos?.[0]
    ? { uri: candidate.photos[0] }
    : previewPortraits.jiyoon;

  const cost = letterCost(sup ? 'super' : 'normal', { isFirstLetter: false });
  const short = balance < cost; // 잔액 부족 → 충전 유도

  function appendStarter(starter: string) {
    setBody((b) => (b.trim().length === 0 ? starter : `${b.trimEnd()}\n${starter}`));
  }

  async function onSend() {
    if (short) {
      router.push('/credits');
      return;
    }
    if (!to) {
      showAlert('상대를 찾을 수 없어요', '큐레이션 화면에서 다시 시도해 주세요.');
      return;
    }
    setSending(true);
    const r = await sendLetter(to, body.trim(), sup);
    setSending(false);
    if (r.ok) {
      router.replace('/inbox');
      return;
    }
    showAlert(
      '신청서를 보내지 못했어요',
      SEND_FAIL_MESSAGE[r.reason] ?? '잠시 후 다시 시도해 주세요.',
    );
  }

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1 }}>
        {/* 본문 스크롤 — 작은 화면·iPad 호환 모드에서도 모든 컨트롤 접근 가능(가이드라인 4) */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 22,
              }}
            >
              <Pressable onPress={() => router.back()}>
                <Txt variant="mono" size={18} color={C.ink2}>
                  ←
                </Txt>
              </Pressable>
              <Txt variant="mono" size={10} color={C.gray}>
                잔액 {balance} C
              </Txt>
            </View>
            <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 8 }}>
              An Interest Letter
            </Txt>
            <Txt variant="serifKr" size={24} weight="700" color={C.ink2} style={{ lineHeight: 33 }}>
              {titleText} 님께{'\n'}마음을 전합니다
            </Txt>
            <Txt size={13} color={C.gray} style={{ marginTop: 10, lineHeight: 21 }}>
              가벼운 호감 대신, 진심을 담은 글을 보냅니다. 정성이 담긴 글이 매칭함 상단에 먼저
              보여집니다.
            </Txt>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: C.hairLight,
              }}
            >
              <View style={{ width: 44, height: 44 }}>
                <Portrait fill source={heroSource} />
              </View>
              <View>
                <Txt size={14} weight="500" color={C.ink2}>
                  {titleText}
                </Txt>
                <Txt size={11.5} color={C.gray}>
                  {subText}
                </Txt>
              </View>
            </View>

            <Txt variant="eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>
              마음을 담아 · 최소 80자
            </Txt>
            {/* 작성 가이드 칩 — 수락률 높은 신청서의 3요소 */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {GUIDES.map((g) => (
                <Pressable
                  key={g.label}
                  onPress={() => appendStarter(g.starter)}
                  style={{
                    borderWidth: 1,
                    borderColor: C.hairLight,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: RADIUS,
                  }}
                >
                  <Txt variant="mono" size={10} color={C.gray}>
                    + {g.label}
                  </Txt>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={body}
              onChangeText={(v) => setBody(v.slice(0, MAX_LEN))}
              multiline
              maxLength={MAX_LEN}
              style={{
                borderWidth: 1,
                borderColor: C.hairLight,
                padding: 16,
                minHeight: 150,
                borderRadius: RADIUS,
                backgroundColor: '#fff',
                fontSize: 13.5,
                lineHeight: 22,
                color: C.ink2,
                textAlignVertical: 'top',
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Txt variant="mono" size={10} color={len >= MAX_LEN ? C.terra : C.gray}>
                {len} / {MAX_LEN}자
              </Txt>
              <Txt variant="mono" size={10} color={enough ? C.sage : C.terra}>
                {enough ? '✓ 충분한 분량' : '80자 이상'}
              </Txt>
            </View>

            <View style={{ marginTop: 20 }}>
              <Txt variant="eyebrow" style={{ marginBottom: 10 }}>
                전송 방식
              </Txt>
              <ChoiceRow
                label="일반 신청서"
                hint="매칭함에 순서대로 도착"
                selected={!sup}
                onPress={() => setSup(false)}
              />
              <ChoiceRow
                label="Super · 우선 신청서 · 50C"
                hint="매칭함 최상단 · 한정 노출"
                selected={sup}
                onPress={() => setSup(true)}
              />
            </View>
          </View>
        </ScrollView>

        <View>
          <Hairline />
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            {short ? (
              <Txt size={11} color={C.terra} style={{ marginBottom: 10, textAlign: 'center' }}>
                잔액이 {cost - balance}C 부족합니다. 충전 후 보낼 수 있어요.
              </Txt>
            ) : null}
            <Btn
              label={
                sending
                  ? '보내는 중…'
                  : short
                    ? '크레딧 충전하기'
                    : cost === 0
                      ? '신청서 보내기 · 무료'
                      : `신청서 보내기 · ${cost}C 차감`
              }
              variant="solid"
              disabled={(!enough && !short) || sending}
              onPress={onSend}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}
