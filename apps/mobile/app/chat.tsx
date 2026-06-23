import { useEffect, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MASK_NOTICE, maskExternalContact } from '@theone/shared';
import { C, RADIUS } from '../src/theme';
import { Txt, VerifiedDots, Portrait } from '../src/ui';
import { Bubble } from '../src/forms';
import { SafetySheet } from '../src/safety';
import { previewPortraits } from '../src/preview-assets';
import { useSignup } from '../src/store';
import { showAlert } from '../src/brand-alert';
import { fetchContactStatus, openContact, type ContactStatus } from '../src/signup-api';

/** 채팅 상대 — 데모 매칭(실서비스에선 매칭 레코드의 상대 회원 id). */
const PARTNER = { id: 'demo-match-jiyoon', name: '김지윤' };

interface Msg {
  id: string;
  me?: boolean;
  time: string;
  text: string;
}
const SEED: Msg[] = [
  {
    id: '1',
    me: true,
    time: '05.10 21:14',
    text: '안녕하세요 지윤 님, 신청서 읽어주셔서 감사해요. 좋아하시는 작가가 있으세요?',
  },
  {
    id: '2',
    time: '05.10 21:32',
    text: '민준 님 안녕하세요 :) 요즘은 박서보 화백 작품을 좋아해요. 단색화 보면 마음이 차분해지더라구요.',
  },
  {
    id: '3',
    me: true,
    time: '05.10 21:40',
    text: '오 저도 단색화 좋아합니다. 다음 주말에 국제갤러리 전시 같이 가실래요?',
  },
];
const SUGGEST = [
  '좋아요, 토요일 오후 어떠세요?',
  '전시 보고 근처에서 차 한잔도 좋겠어요',
  '혹시 선호하는 시간대가 있으세요?',
];

// 관계 진전 트래커 — 수락 → 대화 → 만남 약속 (P1-8)
const STAGES = ['신청 수락', '대화 중', '만남 약속'] as const;
const CURRENT_STAGE = 1; // 0-base: 대화 중

/** Screen 15 · 채팅 — 매칭 7일째 캡션 + AI 추천 + 외부 연락처 마스킹 */
export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [msgs, setMsgs] = useState(SEED);
  const [draft, setDraft] = useState('');
  const [safetyOpen, setSafetyOpen] = useState(false);
  const masked = maskExternalContact(draft).masked;

  function send(text?: string) {
    const raw = (text ?? draft).trim();
    if (!raw) return;
    const { text: safe } = maskExternalContact(raw);
    setMsgs((m) => [...m, { id: String(m.length + 1), me: true, time: '방금', text: safe }]);
    setDraft('');
  }

  // 번호오픈 — 실매칭(mid)일 때만 동작. 양측 동의 시 상대 번호 공개.
  const params = useLocalSearchParams<{ mid?: string }>();
  const matchId = typeof params.mid === 'string' ? params.mid : null;
  const userId = useSignup((s) => s.userId);
  const [contact, setContact] = useState<ContactStatus | null>(null);
  const [contactBusy, setContactBusy] = useState(false);

  useEffect(() => {
    if (!matchId || !userId) return;
    let alive = true;
    fetchContactStatus(matchId, userId).then((s) => {
      if (alive && s.ok) setContact(s);
    });
    return () => {
      alive = false;
    };
  }, [matchId, userId]);

  async function onOpenContact() {
    if (!matchId || !userId) return;
    const cost = contact?.cost ?? 0;
    const creditNote = cost ? `\n크레딧 ${cost}점이 차감됩니다.` : '\n여성 회원은 무료입니다.';
    const pipaNotice =
      '\n\n[개인정보 제3자 제공 동의]\n' +
      '제공 항목: 휴대폰 번호\n' +
      '제공 대상: 매칭 상대방\n' +
      '제공 목적: 상호 연락\n' +
      '보유기간: 매칭 종료 후 즉시 파기\n' +
      '거부 시 번호오픈 이용이 제한됩니다.';
    showAlert(
      '연락처 오픈 동의',
      `양측 모두 동의하면 서로의 번호가 공개됩니다.${creditNote}${pipaNotice}`,
      [
        { text: '거부', style: 'cancel' },
        {
          text: '동의하고 오픈',
          onPress: async () => {
            setContactBusy(true);
            const r = await openContact(matchId, userId);
            setContactBusy(false);
            if (r.ok) setContact(r);
            else if (r.reason === 'insufficient_credit')
              showAlert('크레딧이 부족합니다', '충전 후 다시 시도해 주세요.');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.ivory }} edges={['top']}>
      {/* 신고/차단 — trust-safety.md 신고 8종 매트릭스 (App Store 1.2) */}
      <SafetySheet
        visible={safetyOpen}
        reportedName={PARTNER.name}
        reportedId={PARTNER.id}
        onClose={() => setSafetyOpen(false)}
        onBlocked={() => router.back()}
      />
      {/* 헤더 */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: C.hairLight,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => router.back()}>
            <Txt variant="mono" size={18} color={C.ink2}>
              ←
            </Txt>
          </Pressable>
          <View style={{ width: 38, height: 38 }}>
            <Portrait fill source={previewPortraits.jiyoon} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Txt size={15} weight="500" color={C.ink2}>
                김지윤
              </Txt>
              <VerifiedDots marks={4} size={4} />
            </View>
            <Txt size={11} color={C.gray}>
              변호사 · 서초
            </Txt>
          </View>
          <Pressable onPress={() => setSafetyOpen(true)} hitSlop={10}>
            <Txt variant="mono" size={18} color={C.gray}>
              ⋯
            </Txt>
          </Pressable>
        </View>
      </View>

      {/* 번호오픈 바 — 실매칭일 때만. 양측 동의 시 번호 공개(번호오픈 MVP) */}
      {matchId && contact?.ok ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: contact.state === 'opened' ? '#F1F5F2' : '#FBF7F0',
            borderBottomWidth: 1,
            borderBottomColor: C.hairLight,
          }}
        >
          {contact.state === 'opened' ? (
            <Txt size={13} color={C.sage}>
              📞 연락처 공개됨 · {contact.otherPhone ?? '번호 없음'}
            </Txt>
          ) : contact.state === 'requested_by_me' ? (
            <Txt size={12.5} color={C.gray}>
              연락처 오픈 요청함 · 상대 동의 대기 중
            </Txt>
          ) : (
            <>
              <Txt size={12.5} color={C.ink2} style={{ flex: 1, marginRight: 12 }}>
                {contact.state === 'requested_by_them'
                  ? '상대가 연락처를 열고 싶어 해요'
                  : '대화가 잘 통한다면, 연락처를 열어보세요'}
              </Txt>
              <Pressable
                onPress={onOpenContact}
                disabled={contactBusy}
                style={{
                  borderWidth: 1,
                  borderColor: C.champagne,
                  backgroundColor: C.champagne,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: RADIUS,
                  opacity: contactBusy ? 0.5 : 1,
                }}
              >
                <Txt size={12.5} color="#fff" weight="500">
                  {contactBusy
                    ? '처리 중…'
                    : `연락처 오픈${contact.cost ? ` · ${contact.cost}크레딧` : ' · 무료'}`}
                </Txt>
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Txt variant="mono" size={10} color={C.champagne}>
            MATCHED · 05.10
          </Txt>
          <Txt size={11.5} color={C.gray} style={{ marginTop: 4 }}>
            두 분이 매칭된 지 7일째입니다
          </Txt>
          {/* 진전 단계 — 다음 단계 넛지 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
            {STAGES.map((s, i) => (
              <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: i <= CURRENT_STAGE ? C.sage : C.hairLight,
                  }}
                />
                <Txt
                  variant="mono"
                  size={9}
                  color={i === CURRENT_STAGE ? C.ink2 : i < CURRENT_STAGE ? C.sage : C.graySoft}
                >
                  {s}
                </Txt>
                {i < STAGES.length - 1 ? (
                  <View style={{ width: 14, height: 1, backgroundColor: C.hairLight }} />
                ) : null}
              </View>
            ))}
          </View>
          <Txt size={10.5} color={C.gray} style={{ marginTop: 8 }}>
            대화가 무르익었어요 — 이번 주말 만남을 제안해 보세요.
          </Txt>
        </View>
        {msgs.map((m) => (
          <Bubble key={m.id} me={m.me} time={m.time}>
            {m.text}
          </Bubble>
        ))}
      </ScrollView>

      {/* AI 추천 */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
          AI 추천 답장
        </Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SUGGEST.map((s, i) => (
              <Pressable
                key={i}
                onPress={() => send(s)}
                style={{
                  borderWidth: 1,
                  borderColor: C.champagne,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: RADIUS,
                }}
              >
                <Txt size={12} color={C.champagne}>
                  {s}
                </Txt>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 입력 */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopWidth: 1,
          borderTopColor: C.hairLight,
        }}
      >
        {masked ? (
          <Txt size={10.5} color={C.terra} style={{ marginBottom: 6 }}>
            {MASK_NOTICE}
          </Txt>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: C.hairLight,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: RADIUS,
            backgroundColor: '#fff',
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={C.graySoft}
            style={{ flex: 1, fontSize: 13.5, color: C.ink2 }}
            onSubmitEditing={() => send()}
          />
          <Pressable onPress={() => send()}>
            <Txt variant="mono" size={15} color={C.champagne}>
              ↑
            </Txt>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
