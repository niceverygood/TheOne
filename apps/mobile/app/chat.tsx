import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MASK_NOTICE, maskExternalContact } from '@theone/shared';
import { C, RADIUS } from '../src/theme';
import { Txt, VerifiedDots, Portrait } from '../src/ui';
import { Bubble } from '../src/forms';
import { previewPortraits } from '../src/preview-assets';

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

/** Screen 15 · 채팅 — 매칭 7일째 캡션 + AI 추천 + 외부 연락처 마스킹 */
export default function Chat() {
  const router = useRouter();
  const [msgs, setMsgs] = useState(SEED);
  const [draft, setDraft] = useState('');
  const masked = maskExternalContact(draft).masked;

  function send(text?: string) {
    const raw = (text ?? draft).trim();
    if (!raw) return;
    const { text: safe } = maskExternalContact(raw);
    setMsgs((m) => [...m, { id: String(m.length + 1), me: true, time: '방금', text: safe }]);
    setDraft('');
  }

  // 신고/차단 — trust-safety.md 신고 8종 매트릭스 진입점
  function openSafetyMenu() {
    Alert.alert('안전 도구', '문제가 있었나요? 운영진이 24시간 내 확인합니다.', [
      {
        text: '신고하기',
        style: 'destructive',
        onPress: () =>
          Alert.alert('신고 접수', '신고가 접수되었습니다. 검토 후 알림으로 결과를 알려드립니다.'),
      },
      {
        text: '차단하기',
        style: 'destructive',
        onPress: () =>
          Alert.alert('차단 완료', '상대에게 더 이상 노출되지 않으며, 대화가 종료됩니다.'),
      },
      { text: '닫기', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.ivory }} edges={['top', 'bottom']}>
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
          <Pressable onPress={openSafetyMenu} hitSlop={10}>
            <Txt variant="mono" size={18} color={C.gray}>
              ⋯
            </Txt>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Txt variant="mono" size={10} color={C.champagne}>
            MATCHED · 05.10
          </Txt>
          <Txt size={11.5} color={C.gray} style={{ marginTop: 4 }}>
            두 분이 매칭된 지 7일째입니다
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
          paddingBottom: 12,
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
