import { useCallback, useEffect, useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import { useRouter } from 'expo-router';
import { REFERRAL_REWARD } from '@theone/shared';
import { C, RADIUS } from '../src/theme';
import { Hairline, Screen, Txt } from '../src/ui';
import { useSignup } from '../src/store';

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? (typeof window !== 'undefined' ? window.location.origin : '');

interface Summary {
  code: string;
  referredCount: number;
  approvedCount: number;
  earnedCredits: number;
}

export default function Referral() {
  const router = useRouter();
  const userId = useSignup((s) => s.userId);
  const [data, setData] = useState<Summary | null>(null);

  const load = useCallback(async () => {
    if (!userId || !API_BASE) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/referral/summary?userId=${encodeURIComponent(userId)}`,
      );
      const j = await res.json();
      if (j.ok)
        setData({
          code: j.code,
          referredCount: j.referredCount,
          approvedCount: j.approvedCount,
          earnedCredits: j.earnedCredits,
        });
    } catch {
      /* 표시 생략 */
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onShare = () => {
    if (!data) return;
    void Share.share({
      message: `더원(THE ONE)에 초대합니다. 가입 시 추천 코드 입력: ${data.code}`,
    });
  };

  const stats: [string, string][] = [
    ['내 코드로 가입', data ? `${data.referredCount}명` : '—'],
    ['심사 통과', data ? `${data.approvedCount}명` : '—'],
    ['받은 보상', data ? `${data.earnedCredits.toLocaleString('ko-KR')} C` : '—'],
  ];

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 22 }}>
          Referral
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 4 }}>
          내 추천 코드
        </Txt>
        <Txt size={13} color={C.gray} style={{ marginTop: 8, lineHeight: 21 }}>
          지인을 초대하고, 그분이 가입 심사를 통과하거나 첫 결제를 하면 크레딧을 받습니다.
        </Txt>

        {/* 코드 카드 */}
        <View
          style={{
            marginTop: 24,
            backgroundColor: C.ink2,
            borderRadius: RADIUS,
            padding: 22,
            alignItems: 'center',
          }}
        >
          <Txt variant="mono" size={10} color="rgba(250,247,242,0.6)">
            MY CODE
          </Txt>
          <Txt variant="mono" size={26} weight="600" color={C.ivory} style={{ marginTop: 8 }}>
            {data?.code ?? (userId ? '불러오는 중…' : '가입 후 발급')}
          </Txt>
          {data ? (
            <Pressable
              onPress={onShare}
              style={{
                marginTop: 18,
                paddingVertical: 11,
                paddingHorizontal: 28,
                borderWidth: 1,
                borderColor: C.champagne,
                borderRadius: RADIUS,
              }}
            >
              <Txt size={13} color={C.champagne}>
                코드 공유하기
              </Txt>
            </Pressable>
          ) : null}
        </View>

        {/* 현황 */}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {stats.map(([label, value], i) => (
            <View
              key={label}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 16,
                borderLeftWidth: i === 0 ? 0 : 1,
                borderLeftColor: C.hairLight,
              }}
            >
              <Txt variant="serifKr" size={18} weight="700" color={C.ink2}>
                {value}
              </Txt>
              <Txt size={11} color={C.gray} style={{ marginTop: 4 }}>
                {label}
              </Txt>
            </View>
          ))}
        </View>

        <Hairline style={{ marginTop: 8 }} />

        {/* 보상 안내 */}
        <Txt variant="eyebrow" style={{ marginTop: 24, marginBottom: 12 }}>
          보상 안내
        </Txt>
        {[
          ['친구가 가입 심사 통과', `${REFERRAL_REWARD.signupApprovedCredits}크레딧`],
          [
            '친구의 첫 결제',
            `결제 크레딧의 ${Math.round(REFERRAL_REWARD.firstPurchaseRate * 100)}%`,
          ],
        ].map(([t, v]) => (
          <View
            key={t}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 13,
            }}
          >
            <Txt size={13.5} color={C.ink2}>
              {t}
            </Txt>
            <Txt variant="mono" size={12} color={C.sage}>
              +{v}
            </Txt>
          </View>
        ))}
        <Txt size={11} color={C.gray} style={{ marginTop: 10, lineHeight: 17 }}>
          본인 추천·중복 가입은 보상에서 제외됩니다. 친구가 {REFERRAL_REWARD.clawbackDays}일 이내
          탈퇴하거나 환불하면 보상은 회수됩니다.
        </Txt>
      </View>
    </Screen>
  );
}
