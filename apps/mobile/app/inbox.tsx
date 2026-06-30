import { useEffect, useState } from 'react';
import { ImageSourcePropType, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Btn, Portrait, Screen, Txt, VerifiedDots } from '../src/ui';
import { previewPortraits } from '../src/preview-assets';
import { useSignup } from '../src/store';
import { fetchReceivedMatches, respondToMatch } from '../src/signup-api';
import { showAlert } from '../src/brand-alert';

interface Letter {
  id: string;
  senderId: string;
  name: string;
  meta: string;
  marks: number;
  image: ImageSourcePropType;
  sup?: boolean;
  preview: string;
  time: string;
}
const SEED: Letter[] = [
  {
    id: '1',
    senderId: 'demo-letter-minjun',
    name: '김민준',
    meta: '32 · 변호사 · 서초',
    marks: 4,
    image: previewPortraits.minjun,
    sup: true,
    time: '2시간 전',
    preview:
      '갤러리를 천천히 도는 걸 좋아한다는 문장에서 멈췄어요. 저도 주말이면 종종 미술관에 가는데, 좋아하는 작가가 겹칠지 궁금합니다…',
  },
  {
    id: '2',
    senderId: 'demo-letter-dohyun',
    name: '이도현',
    meta: '35 · 정형외과 전문의 · 압구정',
    marks: 4,
    image: previewPortraits.dohyun,
    time: '어제',
    preview:
      '서핑을 하신다는 게 인상적이었어요. 저도 양양을 자주 가는데, 다음 시즌엔 같이 파도를 기다릴 수 있으면 좋겠다는 생각을 했습니다…',
  },
  {
    id: '3',
    senderId: 'demo-letter-woosung',
    name: '정우성',
    meta: '38 · 자산운용사 대표 · 한남',
    marks: 3,
    image: previewPortraits.minjun,
    time: '2일 전',
    preview:
      '짧지만 진심을 담아 적습니다. 서로의 일을 존중할 수 있는 분을 오래 찾았어요. 한 번 차분히 대화 나눠보고 싶습니다…',
  },
];

export default function Inbox() {
  const router = useRouter();
  const userId = useSignup((s) => s.userId);
  const blocked = useSignup((s) => s.blocked);
  const [letters, setLetters] = useState<Letter[]>(SEED);
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  // 로그인 회원이면 실제 받은 신청서로 교체(없으면 프리뷰 유지 — 앱 심사/콜드스타트)
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    fetchReceivedMatches(userId).then((ms) => {
      if (!alive || ms.length === 0) return;
      setLive(true);
      setLetters(
        ms.map((m) => ({
          id: m.matchId,
          senderId: m.matchId,
          name: m.from.jobDetail ?? m.from.jobCategory,
          meta: [m.from.age ? `${m.from.age}` : null, m.from.region].filter(Boolean).join(' · '),
          marks: Math.max(0, Math.min(4, m.from.badgeCount)),
          image: m.from.photos?.[0] ? { uri: m.from.photos[0] } : previewPortraits.minjun,
          sup: m.isSuper,
          time: '',
          preview: m.letter ?? '만남 신청이 도착했습니다.',
        })),
      );
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  // 차단한 발신자는 받은 신청서에서도 제외 (App Store 1.2 차단 일관성)
  const visibleLetters = letters.filter((l) => !blocked.includes(l.senderId));

  async function decline(id: string) {
    if (live && userId) {
      setBusy(id);
      await respondToMatch(id, userId, 'decline');
      setBusy(null);
    }
    setLetters((l) => l.filter((x) => x.id !== id));
  }

  // 거절은 되돌릴 수 없으므로 2차 확인(QA: 오작동 방지).
  function confirmDecline(id: string, name: string) {
    showAlert('정말 거절하시겠어요?', `${name} 님의 신청을 거절하면 되돌릴 수 없습니다.`, [
      { text: '취소', style: 'cancel' },
      { text: '정중히 거절', style: 'destructive', onPress: () => decline(id) },
    ]);
  }

  async function accept(id: string) {
    if (live && userId) {
      setBusy(id);
      const r = await respondToMatch(id, userId, 'accept');
      setBusy(null);
      if (r.ok) {
        setLetters((l) => l.filter((x) => x.id !== id));
        const q = [r.conversationId ? `cid=${r.conversationId}` : null, `mid=${id}`]
          .filter(Boolean)
          .join('&');
        router.push(`/chat?${q}`);
        return;
      }
    }
    router.push('/chat');
  }

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        {/* 뒤로가기 — 이전 화면(없으면 큐레이션 홈)으로 (QA: 상단 back 부재) */}
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/curation'))}
          hitSlop={10}
          style={{ marginBottom: 10 }}
        >
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginBottom: 6 }}>
            The Inbox
          </Txt>
          {/* 메뉴 진입점 — 프로필 설정·크레딧 충전 */}
          <Pressable
            onPress={() => router.push('/menu')}
            hitSlop={10}
            style={{
              borderWidth: 1,
              borderColor: C.hairLight,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Txt variant="mono" size={10} color={C.gray}>
              ☰ MENU
            </Txt>
          </Pressable>
        </View>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2}>
          받은 신청서
        </Txt>
        <Txt size={13} color={C.gray} style={{ marginTop: 8, lineHeight: 21 }}>
          정성이 담긴 글이 먼저 도착합니다. 천천히 읽고, 정중하게 답해 주세요.
        </Txt>

        <View style={{ marginTop: 20 }}>
          {visibleLetters.length === 0 ? (
            <View
              style={{
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: C.hairLight,
                borderRadius: RADIUS,
              }}
            >
              <Txt size={13} color={C.gray}>
                모든 신청서를 확인했습니다.
              </Txt>
            </View>
          ) : (
            visibleLetters.map((l) => (
              <View
                key={l.id}
                style={{
                  borderWidth: 1,
                  borderColor: C.hairLight,
                  padding: 18,
                  borderRadius: RADIUS,
                  marginBottom: 14,
                  backgroundColor: '#fff',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 46, height: 46 }}>
                      <Portrait fill source={l.image} />
                    </View>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Txt size={14.5} weight="500" color={C.ink2}>
                          {l.name}
                        </Txt>
                        {l.sup ? (
                          <Txt
                            variant="mono"
                            size={8.5}
                            color={C.champagne}
                            style={{
                              borderWidth: 1,
                              borderColor: C.champagne,
                              paddingHorizontal: 4,
                              paddingVertical: 1,
                            }}
                          >
                            SUPER
                          </Txt>
                        ) : null}
                      </View>
                      <Txt size={11.5} color={C.gray} style={{ marginTop: 1 }}>
                        {l.meta}
                      </Txt>
                    </View>
                  </View>
                  <VerifiedDots marks={l.marks} size={5} />
                </View>
                <Txt
                  size={13}
                  color={C.ink2}
                  style={{ lineHeight: 22, marginTop: 14, fontStyle: 'italic' }}
                >
                  “{l.preview}”
                </Txt>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 14,
                  }}
                >
                  <Txt variant="mono" size={9.5} color={C.gray}>
                    {l.time}
                  </Txt>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Btn
                      label="정중히 거절"
                      variant="outline"
                      labelColor={C.terra}
                      style={{ paddingVertical: 8, paddingHorizontal: 14, borderColor: C.terra }}
                      onPress={() => confirmDecline(l.id, l.name)}
                    />
                    <Btn
                      label={busy === l.id ? '처리 중…' : '수락하고 채팅'}
                      variant="solid"
                      style={{ paddingVertical: 8, paddingHorizontal: 14 }}
                      onPress={() => accept(l.id)}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </Screen>
  );
}
