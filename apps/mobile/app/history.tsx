import { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { CurationHistoryEntry } from '@theone/shared';
import { C } from '../src/theme';
import { Hairline, Screen, Txt } from '../src/ui';
import { useSignup } from '../src/store';
import { fetchCurationHistory } from '../src/signup-api';
import { previewPortraits } from '../src/preview-assets';

const LETTER_STATUS_KR: Record<string, string> = {
  pending: '신청서 보냄 · 답변 대기',
  accepted: '매칭 성사',
  declined: '정중히 거절됨',
  expired: '기간 만료',
};

/** 소개된 날짜 — "8월 12일 (수)". 오늘/어제는 말로 표기. */
function sentAtLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const days = Math.floor((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  const week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${week})`;
}
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * 지난 카드 — 그동안 소개됐던 분들을 다시 본다.
 *
 * 새 후보를 만들지 않고 이력만 되짚는다(무한 스와이프 금지). 사진은 지금의 공개 단계만큼만,
 * 카드를 누르면 기존 프로필 상세로 이동해 신청서까지 이어진다.
 */
export default function History() {
  const router = useRouter();
  const sessionToken = useSignup((s) => s.sessionToken);
  const isBlocked = useSignup((s) => s.isBlocked);
  const [items, setItems] = useState<CurationHistoryEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async (next?: string | null) => {
    const r = await fetchCurationHistory(next);
    if (!r.ok) {
      setFailed(true);
      setLoading(false);
      return;
    }
    setItems((prev) => (next ? [...prev, ...r.items] : r.items));
    setCursor(r.nextCursor);
    setDone(!r.nextCursor);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!sessionToken) {
      setLoading(false);
      return;
    }
    void load(null);
  }, [sessionToken, load]);

  // 차단한 회원은 이력에서도 감춘다(큐레이션·매칭과 같은 규칙).
  const visible = items.filter((it) => !isBlocked(it.candidate.id));

  return (
    <Screen scroll={false}>
      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 22 }}>
          Past Cards
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 4 }}>
          지난 카드
        </Txt>
        <Txt size={12.5} color={C.gray} style={{ marginTop: 8, lineHeight: 20 }}>
          그동안 소개해 드린 분들입니다. 지나간 인연도 다시 볼 수 있습니다.
        </Txt>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(it) => it.logId}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!done && cursor && !loading) void load(cursor);
        }}
        ListEmptyComponent={
          <Txt
            size={12.5}
            color={C.gray}
            style={{ textAlign: 'center', paddingVertical: 40, lineHeight: 20 }}
          >
            {loading
              ? '불러오는 중…'
              : failed
                ? '지난 카드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
                : '아직 지난 카드가 없습니다.\n오늘 소개해 드린 분부터 이곳에 쌓입니다.'}
          </Txt>
        }
        renderItem={({ item }) => {
          const photo = item.candidate.photos?.[0];
          const title = item.candidate.jobDetail ?? item.candidate.jobCategory;
          const sub = [item.candidate.age ? `${item.candidate.age}` : null, item.candidate.region]
            .filter(Boolean)
            .join(' · ');
          const status = item.letter ? LETTER_STATUS_KR[item.letter.status] : null;
          return (
            <Pressable onPress={() => router.push(`/profile?id=${item.candidate.id}`)}>
              <View style={{ flexDirection: 'row', paddingVertical: 16, alignItems: 'center' }}>
                <Image
                  source={photo ? { uri: photo } : previewPortraits.jiyoon}
                  resizeMode="cover"
                  style={{ width: 64, height: 84, backgroundColor: C.hairLight }}
                />
                <View style={{ flex: 1, paddingLeft: 16 }}>
                  <Txt variant="mono" size={10} color={C.graySoft}>
                    {sentAtLabel(item.sentAt)}
                  </Txt>
                  <Txt size={15} weight="500" color={C.ink2} style={{ marginTop: 4 }}>
                    {title}
                  </Txt>
                  {sub ? (
                    <Txt size={12.5} color={C.gray} style={{ marginTop: 2 }}>
                      {sub}
                    </Txt>
                  ) : null}
                  <Txt
                    size={11.5}
                    color={item.letter ? C.champagne : C.graySoft}
                    style={{ marginTop: 6 }}
                  >
                    {status ??
                      (item.myRating ? `내 첫인상 ${item.myRating}점` : '아직 평가하지 않음')}
                  </Txt>
                </View>
                <Txt variant="mono" size={14} color={C.graySoft}>
                  ›
                </Txt>
              </View>
              <Hairline />
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
