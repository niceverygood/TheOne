import { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { showAlert } from '../src/brand-alert';
import { useRouter } from 'expo-router';
import { matchReasons } from '@theone/shared';
import { C } from '../src/theme';
import { Btn, Screen, Txt, VerifiedDots } from '../src/ui';
import { previewPortraits } from '../src/preview-assets';
import { useSignup } from '../src/store';
import { fetchTodayCuration } from '../src/signup-api';

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
  const userId = useSignup((s) => s.userId);
  const blocked = useSignup((s) => s.blocked);
  const [axes, setAxes] = useState(FALLBACK_CHEMI);
  const [overall, setOverall] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const isBlocked = blocked.includes(CURATION_SUBJECT.id);

  // 오늘의 큐레이션 케미를 실데이터로 — 가치관 일치도가 더원의 킥.
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    fetchTodayCuration(userId).then((r) => {
      if (!alive || !r.ok || !r.chemistry) return;
      setAxes(r.chemistry.axes);
      setOverall(r.chemistry.overall);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  // Pass — 확인 후 오늘의 큐레이션을 접고 자정 갱신 안내 상태로 전환
  function onPass() {
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
            <Btn label="매칭함 보기" variant="outline" onPress={() => router.push('/inbox')} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen dark>
      {/* 풀블리드 인물 */}
      <View style={{ height: 520, position: 'relative' }}>
        <Image
          source={previewPortraits.jiyoon}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
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
          <VerifiedDots marks={4} dark />
          <Txt variant="serifKr" size={32} weight="700" color={C.ivory} style={{ marginTop: 10 }}>
            김지윤
          </Txt>
          <Txt size={14} color="rgba(250,247,242,0.78)" style={{ marginTop: 4 }}>
            32 · 변호사 · 서초
          </Txt>
        </View>
      </View>

      {/* 본문 */}
      <View style={{ padding: 24 }}>
        <Txt variant="serifEn" size={17} color={C.champagne} style={{ lineHeight: 26 }}>
          “주말엔 한남동 작은 갤러리들을 천천히 도는 걸 좋아해요.”
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
          <Btn label="프로필 더 알아보기" variant="champ" onPress={() => router.push('/profile')} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn
              label="Pass · 오늘은 넘기기"
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
          오늘의 큐레이션은 자정 이후 갱신됩니다.
        </Txt>
      </View>
    </Screen>
  );
}
