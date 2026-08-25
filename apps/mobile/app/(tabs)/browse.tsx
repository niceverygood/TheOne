import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { VERIFICATION_LABELS, type BrowseMember } from '@theone/shared';
import { C } from '../../src/theme';
import { Btn, Screen, Txt } from '../../src/ui';
import { useSignup } from '../../src/store';
import { fetchBrowseMembers } from '../../src/signup-api';
import { previewPortraits } from '../../src/preview-assets';

const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주'];
const AGE_BANDS: { label: string; min: number | null; max: number | null }[] = [
  { label: '전체', min: null, max: null },
  { label: '20대', min: 20, max: 29 },
  { label: '30대 초', min: 30, max: 34 },
  { label: '30대 후', min: 35, max: 39 },
  { label: '40대+', min: 40, max: null },
];

/** 필터 칩 — 선택 시 잉크블랙 채움, 비선택은 hairline 테두리(그림자 없음). */
function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderWidth: 1,
          borderColor: on ? C.ink2 : C.hairLight,
          backgroundColor: on ? C.ink2 : 'transparent',
          marginRight: 6,
        }}
      >
        <Txt size={12} color={on ? C.ivory : C.gray} weight={on ? '500' : '400'}>
          {label}
        </Txt>
      </View>
    </Pressable>
  );
}

/**
 * 둘러보기 — 큐레이션과 별개로 회원을 직접 찾아 만남을 신청하는 탭.
 *
 * 카드 덱·무한 스와이프가 아니라 2열 그리드 목록이다(CLAUDE.md §3 금기 유지).
 * 좋아요 카운터도 없다 — 카드에서 바로 가는 행동은 '신청하기' 하나뿐.
 */
export default function Browse() {
  const router = useRouter();
  const { width: winW } = useWindowDimensions();
  const sessionToken = useSignup((s) => s.sessionToken);
  const isBlocked = useSignup((s) => s.isBlocked);

  const [items, setItems] = useState<BrowseMember[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [region, setRegion] = useState('전체');
  const [band, setBand] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const load = useCallback(
    async (next: string | null, replace: boolean) => {
      if (replace) setLoading(true);
      const r = await fetchBrowseMembers({
        cursor: next,
        region: region === '전체' ? null : region,
        minAge: AGE_BANDS[band]?.min ?? null,
        maxAge: AGE_BANDS[band]?.max ?? null,
        verifiedOnly,
      });
      if (!r.ok) {
        setFailed(true);
        setLoading(false);
        return;
      }
      setFailed(false);
      setItems((prev) => (replace ? r.items : [...prev, ...r.items]));
      setCursor(r.nextCursor);
      setDone(!r.nextCursor);
      setLoading(false);
    },
    [region, band, verifiedOnly],
  );

  // 필터가 바뀌면 처음부터 다시 — 이전 목록이 섞이지 않게 replace 로 받는다.
  useEffect(() => {
    if (!sessionToken) {
      setLoading(false);
      return;
    }
    void load(null, true);
  }, [sessionToken, load]);

  const visible = items.filter((m) => !isBlocked(m.id));
  const cardW = (winW - 24 * 2 - 12) / 2;

  return (
    <Screen scroll={false}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <Txt variant="serifEn" size={14} color={C.champagne}>
          Browse
        </Txt>
        <Txt variant="serifKr" size={24} weight="700" color={C.ink2} style={{ marginTop: 2 }}>
          둘러보기
        </Txt>
      </View>

      {/* 필터 — 지역 / 나이대 / 인증 */}
      <View style={{ marginTop: 14 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          data={REGIONS}
          keyExtractor={(r) => r}
          renderItem={({ item }) => (
            <Chip label={item} on={region === item} onPress={() => setRegion(item)} />
          )}
        />
        <View style={{ height: 8 }} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          data={AGE_BANDS.map((b, i) => ({ ...b, i }))}
          keyExtractor={(b) => b.label}
          renderItem={({ item }) => (
            <Chip label={item.label} on={band === item.i} onPress={() => setBand(item.i)} />
          )}
          ListFooterComponent={
            <Chip
              label="인증 회원만"
              on={verifiedOnly}
              onPress={() => setVerifiedOnly((v) => !v)}
            />
          }
        />
      </View>

      <FlatList
        data={visible}
        keyExtractor={(m) => m.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingTop: 18, paddingBottom: 32, gap: 20 }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!done && cursor && !loading) void load(cursor, false);
        }}
        ListEmptyComponent={
          <Txt
            size={12.5}
            color={C.gray}
            style={{ textAlign: 'center', paddingVertical: 48, lineHeight: 20 }}
          >
            {loading
              ? '불러오는 중…'
              : failed
                ? '회원 목록을 불러오지 못했습니다.\n잠시 후 다시 시도해 주세요.'
                : '조건에 맞는 회원이 없습니다.\n필터를 넓혀 보세요.'}
          </Txt>
        }
        renderItem={({ item }) => {
          const title = item.jobDetail ?? item.jobCategory;
          const sub = [item.age ? `${item.age}` : null, item.region].filter(Boolean).join(' · ');
          return (
            <View style={{ width: cardW }}>
              <Pressable onPress={() => router.push(`/profile?id=${item.id}`)}>
                <Image
                  source={item.photo ? { uri: item.photo } : previewPortraits.jiyoon}
                  resizeMode="cover"
                  style={{ width: cardW, height: cardW * 1.3, backgroundColor: C.hairLight }}
                />
                <Txt size={14} weight="500" color={C.ink2} style={{ marginTop: 10 }}>
                  {title}
                </Txt>
                {sub ? (
                  <Txt size={12} color={C.gray} style={{ marginTop: 2 }}>
                    {sub}
                  </Txt>
                ) : null}
                {/* 인증 뱃지 — 더원의 본질이라 목록에서도 드러낸다 */}
                {item.badges.length ? (
                  <Txt variant="mono" size={10} color={C.sage} style={{ marginTop: 6 }}>
                    {item.badges
                      .slice(0, 3)
                      .map((b) => VERIFICATION_LABELS[b]?.kr ?? b)
                      .join(' · ')}
                    {item.badges.length > 3 ? ` +${item.badges.length - 3}` : ''}
                  </Txt>
                ) : (
                  <Txt variant="mono" size={10} color={C.graySoft} style={{ marginTop: 6 }}>
                    인증 없음
                  </Txt>
                )}
              </Pressable>
              <Btn
                label={item.alreadyRequested ? '신청함' : '만남 신청'}
                variant={item.alreadyRequested ? 'outline' : 'champ'}
                disabled={item.alreadyRequested}
                style={{ marginTop: 10 }}
                onPress={() => router.push(`/letter?to=${item.id}`)}
              />
            </View>
          );
        }}
      />
    </Screen>
  );
}
