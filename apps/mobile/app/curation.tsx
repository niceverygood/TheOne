import { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { showAlert } from '../src/brand-alert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { matchReasons } from '@theone/shared';
import { C } from '../src/theme';
import { Btn, Screen, Txt, VerifiedDots } from '../src/ui';
import { previewPortraits } from '../src/preview-assets';
import { useSignup } from '../src/store';
import { fetchTodayCuration } from '../src/signup-api';
import type { CurationCandidateMeta, CurationEntry } from '@theone/shared';

/** API 미설정/설문 미완료 시 보여줄 목업 케미 3축. */
const FALLBACK_CHEMI: { kr: string; value: number }[] = [
  { kr: '결혼관', value: 92 },
  { kr: '라이프스타일', value: 78 },
  { kr: '갈등 해결', value: 85 },
];

/** 오늘의 큐레이션 대상 — 채팅/프로필과 동일 데모 회원(차단 시 노출 제외). */
const CURATION_SUBJECT = { id: 'demo-match-jiyoon', name: '김지윤' };

// 큐레이션 사유 — 서버 연동 전까지 프리뷰 페어 기준(이번 회원/오늘의 상대)
const REASONS = matchReasons(
  { region: '서울', age: 34, badges: ['education', 'job', 'wealth'] },
  { region: '서울', age: 32, badges: ['education', 'job', 'wealth', 'realestate'] },
);

export default function Curation() {
  const router = useRouter();
  // 개발 전용 — ?u=<viewerId> 로 큐레이션을 실데이터로 미리보기(스크린샷/QA). 프로덕션 동작엔 영향 없음.
  const params = useLocalSearchParams<{ u?: string }>();
  const storeUserId = useSignup((s) => s.userId);
  const userId = (typeof __DEV__ !== 'undefined' && __DEV__ && params.u) || storeUserId;
  const blocked = useSignup((s) => s.blocked);
  const [axes, setAxes] = useState(FALLBACK_CHEMI);
  const [overall, setOverall] = useState<number | null>(null);
  const [candidate, setCandidate] = useState<CurationCandidateMeta | null>(null);
  // 하루 N명(CURATION_PER_DAY) 큐레이션 — 1명씩 보여주고 "더 보기"로 다음 후보로 이동.
  const [items, setItems] = useState<CurationEntry[]>([]);
  const [idx, setIdx] = useState(0);
  const [passed, setPassed] = useState(false);
  const isBlocked = blocked.includes(CURATION_SUBJECT.id);
  const hasNext = idx + 1 < items.length;

  // 현재 인덱스 후보를 화면 상태에 반영(케미 3축 포함).
  function applyItem(it: CurationEntry | undefined) {
    setCandidate(it?.candidate ?? null);
    if (it?.chemistry) {
      setAxes(it.chemistry.axes);
      setOverall(it.chemistry.overall);
    } else {
      setAxes(FALLBACK_CHEMI);
      setOverall(null);
    }
  }

  // 오늘의 큐레이션을 실데이터로 — 후보(사진·프로필) + 케미(가치관 일치도)가 더원의 킥.
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    fetchTodayCuration(userId).then((r) => {
      if (!alive || !r.ok) return;
      // 신버전은 items[], 구버전은 단일 candidate — 둘 다 목록으로 정규화.
      const list: CurationEntry[] =
        r.items && r.items.length
          ? r.items
          : r.candidate
            ? [{ candidate: r.candidate, chemistry: r.chemistry }]
            : [];
      setItems(list);
      setIdx(0);
      applyItem(list[0]);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  // 실후보가 있으면 그 사진·프로필을, 없으면 프리뷰(앱 심사/데이터 미연동)로 폴백.
  const heroPhoto = candidate?.photos?.[0];
  const heroSource = heroPhoto ? { uri: heroPhoto } : previewPortraits.jiyoon;
  const titleText = candidate ? (candidate.jobDetail ?? candidate.jobCategory) : '김지윤';
  const subText = candidate
    ? [candidate.age ? `${candidate.age}` : null, candidate.region].filter(Boolean).join(' · ')
    : '32 · 변호사 · 서초';
  const quoteText = candidate?.quote
    ? `“${candidate.quote}”`
    : '“주말엔 한남동 작은 갤러리들을 천천히 도는 걸 좋아해요.”';
  const dots = candidate ? Math.max(1, Math.min(4, candidate.badgeCount)) : 4;

  // 다음 후보로 이동(오늘 목록에 더 있을 때).
  function goNext() {
    const n = idx + 1;
    if (n < items.length) {
      setIdx(n);
      applyItem(items[n]);
    }
  }

  // Pass — 오늘 목록에 다음 후보가 있으면 그분으로, 마지막이면 자정 갱신 안내로 전환
  function onPass() {
    if (hasNext) {
      goNext();
      return;
    }
    showAlert('오늘은 넘길까요?', '넘긴 큐레이션은 다시 표시되지 않습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '넘기기', style: 'destructive', onPress: () => setPassed(true) },
    ]);
  }

  if (passed || isBlocked) {
    return (
      <Screen dark>
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <Txt variant="serifEn" size={15} color={C.champagne}>
            See you tomorrow
          </Txt>
          <Txt
            variant="serifKr"
            size={24}
            weight="700"
            color={C.ivory}
            style={{ marginTop: 12, lineHeight: 34 }}
          >
            {isBlocked ? (
              <>오늘의 큐레이션을{'\n'}숨겼습니다</>
            ) : (
              <>오늘의 큐레이션을{'\n'}넘겼습니다</>
            )}
          </Txt>
          <Txt size={13.5} color="rgba(250,247,242,0.72)" style={{ marginTop: 14, lineHeight: 22 }}>
            {isBlocked
              ? '차단한 회원은 더 이상 큐레이션·매칭에 노출되지 않습니다. 자정 이후 새로운 한 분을 소개해 드릴게요.'
              : '자정 이후, 더 잘 맞는 한 분을 다시 소개해 드릴게요. 무한히 고르게 하지 않는 것이 더원의 방식입니다.'}
          </Txt>
          <View style={{ marginTop: 32 }}>
            {/* 어두운 배경 대비 시인성 — 솔리드 샴페인으로(QA: 버튼 인지 어려움) */}
            <Btn label="매칭함 보기" variant="champ" onPress={() => router.push('/inbox')} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen dark>
      {/* 풀블리드 인물 */}
      <View style={{ height: 520, position: 'relative' }}>
        <Image source={heroSource} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 150,
            backgroundColor: 'rgba(250,247,242,0.22)',
          }}
        />

        <View
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Txt variant="mono" size={10} color="rgba(15,16,20,0.6)">
              TODAY · No. 047
            </Txt>
            <Txt variant="serifEn" size={15} color="rgba(15,16,20,0.7)" style={{ marginTop: 2 }}>
              Curated for you
            </Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {/* 메뉴 진입점 — 프로필 설정·크레딧 충전 (App Review: 로그인 후 접근 경로) */}
            <Pressable
              onPress={() => router.push('/menu')}
              hitSlop={10}
              style={{
                borderWidth: 1,
                borderColor: 'rgba(15,16,20,0.35)',
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginBottom: 8,
              }}
            >
              <Txt variant="mono" size={10} color={C.ink2}>
                ☰ MENU
              </Txt>
            </Pressable>
            <Txt variant="mono" size={9} color="rgba(15,16,20,0.5)">
              NEXT IN
            </Txt>
            <Txt variant="mono" size={22} weight="600" color={C.ink2}>
              23:47
            </Txt>
          </View>
        </View>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            backgroundColor: 'rgba(15,16,20,0.55)',
          }}
        >
          <VerifiedDots marks={dots} dark />
          <Txt variant="serifKr" size={32} weight="700" color={C.ivory} style={{ marginTop: 10 }}>
            {titleText}
          </Txt>
          <Txt size={14} color="rgba(250,247,242,0.78)" style={{ marginTop: 4 }}>
            {subText}
          </Txt>
        </View>
      </View>

      {/* 본문 */}
      <View style={{ padding: 24 }}>
        <Txt variant="serifEn" size={17} color={C.champagne} style={{ lineHeight: 26 }}>
          {quoteText}
        </Txt>

        {/* 추천 이유 — 문장형 근거(점수 비노출 정책) */}
        <View style={{ marginTop: 28 }}>
          <Txt variant="eyebrow" color={C.graySoft} style={{ marginBottom: 14 }}>
            Why this match · 추천 이유
          </Txt>
          {REASONS.map((r) => (
            <View
              key={r}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}
            >
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.sage }} />
              <Txt size={13} color="rgba(250,247,242,0.85)">
                {r}
              </Txt>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <Txt variant="eyebrow" color={C.graySoft}>
              Chemistry · 가치관 케미
            </Txt>
            {overall != null && (
              <Txt variant="mono" size={11} color={C.champagne}>
                종합 {overall}%
              </Txt>
            )}
          </View>
          {axes.map(({ kr, value }) => (
            <View key={kr} style={{ marginBottom: 14 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
              >
                <Txt size={12.5} color="rgba(250,247,242,0.85)">
                  {kr}
                </Txt>
                <Txt variant="mono" size={11} color={C.champagne}>
                  {value}%
                </Txt>
              </View>
              <View style={{ height: 2, backgroundColor: C.inkSoft }}>
                <View
                  style={{ width: `${value}%`, height: '100%', backgroundColor: C.champagne }}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 32, gap: 10 }}>
          <Btn
            label="프로필 더 알아보기"
            variant="champ"
            onPress={() => router.push(candidate?.id ? `/profile?id=${candidate.id}` : '/profile')}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn
              label={hasNext ? '다음 분 보기 →' : 'Pass · 오늘은 넘기기'}
              variant="outline"
              labelColor={C.graySoft}
              style={{ flex: 1, borderColor: C.inkSoft }}
              onPress={onPass}
            />
            <Btn
              label="Super Like"
              variant="outline"
              labelColor={C.champagne}
              style={{ flex: 1, borderColor: C.champagne }}
              onPress={() =>
                router.push(
                  candidate?.id ? `/letter?mode=super&to=${candidate.id}` : '/letter?mode=super',
                )
              }
            />
          </View>
        </View>
        <Txt size={11} color={C.gray} style={{ textAlign: 'center', marginTop: 16 }}>
          {items.length > 1
            ? `오늘의 추천 ${idx + 1} / ${items.length} · 자정 이후 갱신됩니다.`
            : '오늘의 큐레이션은 자정 이후 갱신됩니다.'}
        </Txt>
      </View>
    </Screen>
  );
}
