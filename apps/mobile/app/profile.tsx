import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { CurationCandidateMeta, CurationChemistry } from '@theone/shared';
import { C } from '../src/theme';
import { Btn, Hairline, Screen, Txt, VerifiedDots } from '../src/ui';
import { SafetySheet } from '../src/safety';
import { previewPortraits } from '../src/preview-assets';
import { fetchProfile } from '../src/signup-api';

/** 프리뷰 폴백 — id 없이 진입(가입 심사 전 미리보기 등) 시에만 사용. */
const FALLBACK_CANDIDATE: CurationCandidateMeta = {
  id: 'demo-match-jiyoon',
  region: '서초',
  age: 32,
  jobCategory: 'law',
  jobDetail: '변호사',
  photos: [],
  badgeCount: 4,
  quote:
    '10년 차 송무 변호사입니다. 평일엔 치열하게 일하지만 주말엔 한남동 작은 갤러리를 천천히 돌거나, 양양에서 서핑을 즐겨요. 대화가 잘 통하고 서로의 일을 존중할 수 있는 사람을 찾고 있습니다.',
};
const FALLBACK_CHEMI: CurationChemistry = {
  overall: 85,
  axes: [
    { kr: '결혼관', value: 92 },
    { kr: '라이프스타일', value: 78 },
    { kr: '갈등 해결', value: 85 },
  ],
};

/** 사진 캐러셀 — 옆으로 스와이프해 photos[] 전체를 넘겨본다(QA: 첫 장에서 고정되던 문제 수정). */
function PhotoCarousel({ photos }: { photos: string[] }) {
  const { width } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  if (photos.length === 0) {
    return (
      <Image source={previewPortraits.jiyoon} resizeMode="cover" style={{ width, height: 440 }} />
    );
  }
  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {photos.map((uri, i) => (
          <Image key={i} source={{ uri }} resizeMode="cover" style={{ width, height: 440 }} />
        ))}
      </ScrollView>
      {photos.length > 1 ? (
        <View
          style={{
            position: 'absolute',
            bottom: 14,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {photos.map((_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.45)',
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [candidate, setCandidate] = useState<CurationCandidateMeta>(FALLBACK_CANDIDATE);
  const [chemistry, setChemistry] = useState<CurationChemistry | null>(FALLBACK_CHEMI);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchProfile(id).then((r) => {
      if (!alive || !r.ok) return;
      setCandidate(r.candidate);
      setChemistry(r.chemistry);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const titleText = candidate.jobDetail ?? candidate.jobCategory;
  const subText = [candidate.age ? `${candidate.age}` : null, candidate.region]
    .filter(Boolean)
    .join(' · ');

  return (
    <Screen>
      <SafetySheet
        visible={safetyOpen}
        reportedName={titleText}
        reportedId={candidate.id}
        onClose={() => setSafetyOpen(false)}
        onBlocked={() => router.back()}
      />
      <View>
        <PhotoCarousel photos={candidate.photos} />
        {/* 신고/차단 진입 (App Store 1.2) */}
        <Pressable
          onPress={() => setSafetyOpen(true)}
          hitSlop={12}
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15,16,20,0.42)',
          }}
        >
          <Txt variant="mono" size={18} color={C.ivory}>
            ⋯
          </Txt>
        </Pressable>
      </View>
      <View style={{ padding: 24 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View>
            <Txt variant="serifKr" size={26} weight="700" color={C.ink2}>
              {titleText}
            </Txt>
            {subText ? (
              <Txt size={13.5} color={C.gray} style={{ marginTop: 2 }}>
                {subText}
              </Txt>
            ) : null}
          </View>
          <VerifiedDots marks={Math.max(1, Math.min(4, candidate.badgeCount))} />
        </View>

        <Txt size={10.5} color={C.gray} style={{ marginTop: 16, lineHeight: 16 }}>
          인증 서류는 운영진만 확인하며, 상대에게는 승인 뱃지만 공개됩니다.
        </Txt>

        {candidate.quote ? (
          <View style={{ marginTop: 32 }}>
            <Txt variant="eyebrow" style={{ marginBottom: 12 }}>
              About · 자기소개
            </Txt>
            <Txt size={14} color={C.ink2} style={{ lineHeight: 25 }}>
              {candidate.quote}
            </Txt>
          </View>
        ) : null}

        {chemistry ? (
          <View style={{ marginTop: 32 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}
            >
              <Txt variant="eyebrow">Chemistry · 케미 3축</Txt>
              <Txt variant="mono" size={11} color={C.champagne}>
                종합 {chemistry.overall}%
              </Txt>
            </View>
            {chemistry.axes.map(({ kr, value }) => (
              <View key={kr} style={{ marginBottom: 14 }}>
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
                >
                  <Txt size={12.5} color={C.ink2}>
                    {kr}
                  </Txt>
                  <Txt variant="mono" size={11} color={C.champagne}>
                    {value}%
                  </Txt>
                </View>
                <View style={{ height: 2, backgroundColor: C.ivory3 }}>
                  <View
                    style={{ width: `${value}%`, height: '100%', backgroundColor: C.champagne }}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <Hairline style={{ marginTop: 24 }} />
        <Btn
          label="만남 신청서 쓰기 · 20C"
          variant="solid"
          style={{ marginTop: 24 }}
          onPress={() => router.push(`/letter?to=${candidate.id}`)}
        />
      </View>
    </Screen>
  );
}
