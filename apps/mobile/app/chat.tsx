import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
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
import {
  fetchChatMessages,
  fetchContactStatus,
  openContact,
  sendChatMessage,
  type ChatMessage,
  type ChatPartner,
  type ContactStatus,
} from '../src/signup-api';

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const SUGGEST = [
  '좋아요, 토요일 오후 어떠세요?',
  '전시 보고 근처에서 차 한잔도 좋겠어요',
  '혹시 선호하는 시간대가 있으세요?',
];
const POLL_MS = 4000;

// 관계 진전 트래커 — 수락 → 대화 → 만남 약속 (P1-8)
const STAGES = ['신청 수락', '대화 중', '만남 약속'] as const;
const CURRENT_STAGE = 1; // 0-base: 대화 중

/** Screen 15 · 채팅 — 실시간(폴링) 메시지 + AI 추천 + 외부 연락처 마스킹 */
export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const masked = maskExternalContact(draft).masked;

  const params = useLocalSearchParams<{ mid?: string }>();
  const matchId = typeof params.mid === 'string' ? params.mid : null;
  const userId = useSignup((s) => s.userId);
  const [contact, setContact] = useState<ContactStatus | null>(null);
  const [contactBusy, setContactBusy] = useState(false);

  // 메시지 폴링 — matchId 없으면(프리뷰 진입) 목업 유지.
  useEffect(() => {
    if (!matchId) return;
    let alive = true;
    let lastId: string | undefined;
    async function poll() {
      const r = await fetchChatMessages(matchId!, lastId);
      if (!alive || !r.ok) return;
      if (r.partner) setPartner(r.partner);
      if (r.messages.length) {
        lastId = r.messages[r.messages.length - 1]!.id;
        setMsgs((m) => [...m, ...r.messages]);
      }
    }
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [matchId]);

  // 새 메시지가 오면 맨 아래로 스크롤 — 내가 보낸 메시지도 즉시 보이게 (QA: 스크롤 안 내려가던 문제 수정)
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs.length]);

  async function send(text?: string) {
    const raw = (text ?? draft).trim();
    if (!raw || sending) return;
    setDraft('');
    if (!matchId || !userId) {
      const { text: safe } = maskExternalContact(raw);
      setMsgs((m) => [
        ...m,
        {
          id: String(m.length + 1),
          senderId: 'me',
          text: safe,
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }
    setSending(true);
    const r = await sendChatMessage(matchId, raw);
    setSending(false);
    if (r.ok && r.message) {
      setMsgs((m) => [...m, r.message!]);
    } else {
      showAlert('메시지를 보내지 못했어요', '잠시 후 다시 시도해 주세요.');
      setDraft(raw);
    }
  }

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

  const titleText = partner?.jobDetail ?? partner?.jobCategory ?? '김지윤';
  const subText = partner ? [partner.region].filter(Boolean).join(' · ') : '변호사 · 서초';
  const headerPhoto = partner?.photos?.[0] ? { uri: partner.photos[0] } : previewPortraits.jiyoon;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.ivory }} edges={['top']}>
      {/* 신고/차단 — trust-safety.md 신고 8종 매트릭스 (App Store 1.2) */}
      <SafetySheet
        visible={safetyOpen}
        reportedName={titleText}
        reportedId={partner?.id ?? 'demo-match-jiyoon'}
        onClose={() => setSafetyOpen(false)}
        onBlocked={() => router.back()}
      />
      {/* 키보드 활성화 시 입력창이 키보드 위로 밀려 올라가도록 (QA: 입력 폼 가림 수정) */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
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
            {/* 사진·이름 탭 → 프로필 상세 (QA: 프로필 탭 인터랙션 부재) */}
            <Pressable
              onPress={() => router.push(partner?.id ? `/profile?id=${partner.id}` : '/profile')}
              hitSlop={6}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
            >
              <View style={{ width: 38, height: 38 }}>
                <Portrait fill source={headerPhoto} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Txt size={15} weight="500" color={C.ink2}>
                    {titleText}
                  </Txt>
                  <VerifiedDots
                    marks={Math.max(1, Math.min(4, partner?.badgeCount ?? 4))}
                    size={4}
                  />
                </View>
                <Txt size={11} color={C.gray}>
                  {subText}
                </Txt>
              </View>
            </Pressable>
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

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Txt variant="mono" size={10} color={C.champagne}>
              MATCHED
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
          </View>
          {msgs.length === 0 ? (
            <Txt size={12.5} color={C.gray} style={{ textAlign: 'center', marginTop: 20 }}>
              아직 메시지가 없어요. 먼저 인사를 건네보세요.
            </Txt>
          ) : (
            msgs.map((m) => (
              <Bubble
                key={m.id}
                me={m.senderId === userId || m.senderId === 'me'}
                time={formatMsgTime(m.createdAt)}
              >
                {m.text}
              </Bubble>
            ))
          )}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
