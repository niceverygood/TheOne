import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import { showAlert } from '../src/brand-alert';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { matchReasons } from '@theone/shared';
import { C } from '../src/theme';
import { Btn, Screen, StarRating, Txt, VerifiedDots } from '../src/ui';
import { previewPortraits } from '../src/preview-assets';
import { useSignup } from '../src/store';
import { fetchTodayCuration, rateCuration } from '../src/signup-api';
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

/** 프리뷰(서버 미연동) 전체 사진 수 — 대표 1장 + 갤러리 1장. */
const PREVIEW_TOTAL = 2;

const HERO_H = 520;

export default function Curation() {
  const router = useRouter();
  const { width: winW } = useWindowDimensions();
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
  // 프리뷰(서버 미연동)용 로컬 별점 — 실후보는 items[idx].myRating 이 진실.
  const [previewRating, setPreviewRating] = useState<number | null>(null);
  const [rateBusy, setRateBusy] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const isBlocked = blocked.includes(CURATION_SUBJECT.id);
  const hasNext = idx + 1 < items.length;
  const entry: CurationEntry | undefined = items[idx];

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

  const titleText = candidate ? (candidate.jobDetail ?? candidate.jobCategory) : '김지윤';
  const subText = candidate
    ? [candidate.age ? `${candidate.age}` : null, candidate.region].filter(Boolean).join(' · ')
    : '32 · 변호사 · 서초';
  const quoteText = candidate?.quote
    ? `“${candidate.quote}”`
    : '“주말엔 한남동 작은 갤러리들을 천천히 도는 걸 좋아해요.”';
  const dots = candidate ? Math.max(1, Math.min(4, candidate.badgeCount)) : 4;

  // ---- 별점·사진 공개 상태 ----
  const myRating = candidate ? (entry?.myRating ?? null) : previewRating;
  const liked = candidate ? !!entry?.reveal?.liked : previewRating != null && previewRating >= 3;
  const mutual = candidate ? !!entry?.reveal?.mutual : false;
  const matched = candidate ? !!entry?.reveal?.matched : false;

  // 공개 사진 — 실후보는 서버가 공개 단계만큼 잘라서 준다. 프리뷰는 로컬 별점으로 1→2장.
  const photoSources: ImageSourcePropType[] = candidate
    ? candidate.photos?.length
      ? candidate.photos.map((p) => ({ uri: p }))
      : [previewPortraits.jiyoon]
    : liked
      ? [previewPortraits.jiyoon, previewPortraits.jiyoonGallery]
      : [previewPortraits.jiyoon];
  const photosTotal = candidate
    ? candidate.photos?.length
      ? (candidate.photosTotal ?? candidate.photos.length)
      : photoSources.length
    : PREVIEW_TOTAL;
  const lockedCount = Math.max(0, photosTotal - photoSources.length);

  const unlockHint = !liked
    ? '별점 3점 이상을 남기면 사진이 한 장 더 공개됩니다.'
    : !mutual
      ? '서로 호감(별점 3점 이상)이면 사진이 한 장 더 공개됩니다.'
      : '매칭이 성사되면 나머지 사진이 모두 공개됩니다.';

  const ratingCaption =
    myRating == null
      ? '3점 이상이면 호감이 전달되고, 상대의 사진이 한 장 더 공개됩니다.'
      : matched
        ? '매칭이 성사된 상대입니다. 모든 사진이 공개되어 있습니다.'
        : mutual
          ? '서로 호감을 확인했습니다 — 사진 3장 공개. 매칭이 성사되면 전체가 공개됩니다.'
          : liked
            ? '호감을 전달했습니다 — 사진 2장이 공개됐어요. 서로 호감이면 3장까지 공개됩니다.'
            : '평가가 기록되었습니다. 자정 이후 더 잘 맞는 분을 소개해 드릴게요.';

  // 잠긴 사진이 있으면 마지막에 잠금 안내 페이지를 붙인다.
  const heroPages: { key: string; source?: ImageSourcePropType }[] = [
    ...photoSources.map((s, i) => ({ key: `p${i}`, source: s })),
    ...(lockedCount > 0 ? [{ key: 'locked' }] : []),
  ];

  // 별점 제출 — 실후보는 서버 기록(재평가 허용), 프리뷰는 로컬 공개만.
  async function onRate(n: number) {
    if (rateBusy) return;
    if (!candidate || !entry?.logId) {
      setPreviewRating(n);
      return;
    }
    setRateBusy(true);
    const r = await rateCuration(entry.logId, n);
    setRateBusy(false);
    const next: CurationEntry = r.ok
      ? {
          ...entry,
          myRating: r.rating,
          reveal: {
            count: r.photos.length,
            total: r.photosTotal,
            liked: r.liked,
            mutual: r.mutual,
            matched: r.matched,
          },
          candidate: { ...entry.candidate, photos: r.photos, photosTotal: r.photosTotal },
        }
      : { ...entry, myRating: n }; // 네트워크 실패 — 별점만 로컬 표시(사진은 서버 응답 기준 유지)
    setItems((prev) => prev.map((it, i) => (i === idx ? next : it)));
    applyItem(next);
  }

  // 다음 후보로 이동(오늘 목록에 더 있을 때).
  function goNext() {
    const n = idx + 1;
    if (n < items.length) {
      setIdx(n);
      setPhotoIdx(0);
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
      {/* 풀블리드 인물 — 공개 사진 페이저(스와이프) + 잠금 안내 페이지 */}
      <View style={{ height: HERO_H, position: 'relative' }}>
        <FlatList
          key={`hero-${idx}`}
          data={heroPages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => p.key}
          onMomentumScrollEnd={(e) => setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / winW))}
          renderItem={({ item: p }) =>
            p.source ? (
              <Image source={p.source} resizeMode="cover" style={{ width: winW, height: HERO_H }} />
            ) : (
              <View
                style={{
                  width: winW,
                  height: HERO_H,
                  backgroundColor: C.ink2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 48,
                }}
              >
                <Txt variant="mono" size={10} color={C.graySoft}>
                  LOCKED · {lockedCount}장
                </Txt>
                <Txt
                  size={13}
                  color="rgba(250,247,242,0.78)"
                  style={{ marginTop: 12, textAlign: 'center', lineHeight: 21 }}
                >
                  {unlockHint}
                </Txt>
              </View>
            )
          }
        />
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
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            right: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View pointerEvents="none">
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
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            backgroundColor: 'rgba(15,16,20,0.55)',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <VerifiedDots marks={dots} dark />
            {photosTotal > 1 && (
              <Txt variant="mono" size={10} color="rgba(250,247,242,0.7)">
                {lockedCount > 0
                  ? `사진 ${photoSources.length}/${photosTotal} 공개`
                  : `사진 ${Math.min(photoIdx + 1, photosTotal)}/${photosTotal}`}
              </Txt>
            )}
          </View>
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

        {/* 첫인상 별점 — 3점 이상 = 호감 전달 + 사진 단계 공개 */}
        <View style={{ marginTop: 28 }}>
          <Txt variant="eyebrow" color={C.graySoft} style={{ marginBottom: 12 }}>
            First impression · 첫인상 별점
          </Txt>
          <StarRating value={myRating} onChange={onRate} emptyColor="rgba(250,247,242,0.3)" />
          <Txt size={12} color={C.gray} style={{ marginTop: 10, lineHeight: 19 }}>
            {ratingCaption}
          </Txt>
        </View>

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
          <Btn label="프로필 더 알아보기" variant="champ" onPress={() => router.push('/profile')} />
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
              onPress={() => router.push('/letter?mode=super')}
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
