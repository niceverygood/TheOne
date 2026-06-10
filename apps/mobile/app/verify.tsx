import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
  VERIFY_REWARD_CREDITS,
  badgeExpiresAt,
  daysUntilExpiry,
  isBadgeExpiringSoon,
  type VerificationType,
} from '@theone/shared';
import { C } from '../src/theme';
import { Hairline, Screen, Txt } from '../src/ui';

// 갱신 안내 — 서버 연동 전 프리뷰: 학력 인증 승인 ~11개월 경과 가정
const EDU_EXPIRES = badgeExpiresAt(new Date(Date.now() - 344 * 24 * 60 * 60 * 1000));

type Row = {
  en: string;
  kr: string;
  type: VerificationType;
  state: 'verified' | 'pending' | 'none' | 'rejected';
  days: string;
  href: Href;
};

// 추가 인증 8종 (학력·재산·차량·부동산 + 소득·직업·집안자산·명성)
const ROWS: Row[] = [
  {
    en: 'Education',
    kr: '학력',
    type: 'education',
    state: 'verified',
    days: '1',
    href: '/verify/education',
  },
  { en: 'Income', kr: '소득', type: 'income', state: 'none', days: '1', href: '/verify/income' },
  { en: 'Occupation', kr: '직업', type: 'job', state: 'none', days: '1', href: '/verify/job' },
  { en: 'Wealth', kr: '재산', type: 'wealth', state: 'pending', days: '1', href: '/verify/wealth' },
  {
    en: 'Vehicle',
    kr: '보유 차량',
    type: 'vehicle',
    state: 'none',
    days: '1',
    href: '/verify/vehicle',
  },
  {
    en: 'Real Estate',
    kr: '부동산',
    type: 'realestate',
    state: 'rejected',
    days: '1',
    href: '/verify/realestate',
  },
  {
    en: 'Family Wealth',
    kr: '집안 자산',
    type: 'family_wealth',
    state: 'none',
    days: '2',
    href: '/verify/family-wealth',
  },
  {
    en: 'Reputation',
    kr: '명성',
    type: 'reputation',
    state: 'none',
    days: '2',
    href: '/verify/reputation',
  },
];

type Pill = { fg: string; bg: string; txt: string };
const NONE_PILL: Pill = { fg: C.gray, bg: 'transparent', txt: '미인증' };
const badge = (s: string): Pill => {
  const m: Record<string, Pill> = {
    verified: { fg: C.ivory, bg: C.sage, txt: '승인됨' },
    pending: { fg: C.champagne, bg: 'transparent', txt: '심사중' },
    none: NONE_PILL,
    rejected: { fg: C.terra, bg: 'transparent', txt: '반려' },
  };
  return m[s] ?? NONE_PILL;
};

export default function VerifyHub() {
  const router = useRouter();
  const verifiedCount = ROWS.filter((r) => r.state === 'verified').length;
  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 8 }}>
          Verifications
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 6 }}>
          추가 인증
        </Txt>
        <Txt size={13} color={C.gray} style={{ marginTop: 8, lineHeight: 21 }}>
          인증할수록 신뢰도가 올라가고, 승인될 때마다 크레딧을 드립니다. 관리자가 직접 검토하며 매칭
          상대에게는 뱃지만 노출됩니다.
        </Txt>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: C.ink2,
            borderRadius: 2,
            padding: 16,
            marginTop: 24,
          }}
        >
          <Txt size={12.5} color="rgba(250,247,242,0.7)">
            현재 검증 수준
          </Txt>
          <Txt variant="mono" size={12} color={C.ivory}>
            {verifiedCount} / {ROWS.length}
          </Txt>
        </View>

        {/* 만료 임박 갱신 배너 — RENEWAL_NOTICE_DAYS 이내 */}
        {isBadgeExpiringSoon(EDU_EXPIRES) ? (
          <Pressable
            onPress={() => router.push('/verify/education')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: C.champagne,
              borderRadius: 2,
              padding: 14,
              marginTop: 12,
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Txt variant="mono" size={9} color={C.champagne}>
                RENEWAL · D-{daysUntilExpiry(EDU_EXPIRES)}
              </Txt>
              <Txt size={12.5} color={C.ink2} style={{ marginTop: 4, lineHeight: 19 }}>
                학력 인증이 곧 만료됩니다. 갱신하면 뱃지가 끊김 없이 유지돼요.
              </Txt>
            </View>
            <Txt variant="mono" size={12} color={C.champagne}>
              갱신 →
            </Txt>
          </Pressable>
        ) : null}

        <View style={{ marginTop: 16 }}>
          {ROWS.map((r) => {
            const b = badge(r.state);
            const reward = VERIFY_REWARD_CREDITS[r.type];
            return (
              <View key={r.type}>
                <Pressable
                  onPress={() => router.push(r.href)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 20,
                  }}
                >
                  <View>
                    <Txt variant="serifEn" size={12} color={C.gray}>
                      {r.en}
                    </Txt>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}
                    >
                      <Txt size={16} weight="500" color={C.ink2}>
                        {r.kr}
                      </Txt>
                      <Txt
                        variant="mono"
                        size={9.5}
                        color={C.champagne}
                        style={{
                          borderWidth: 1,
                          borderColor: C.champagne,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        +{reward}C
                      </Txt>
                    </View>
                    <Txt size={11} color={C.gray} style={{ marginTop: 3 }}>
                      평균 {r.days}일 · 승인 시 {reward}크레딧 지급
                    </Txt>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      borderWidth: 1,
                      borderColor: b.fg,
                      backgroundColor: b.bg,
                      paddingHorizontal: 11,
                      paddingVertical: 5,
                      borderRadius: 2,
                    }}
                  >
                    <Txt variant="mono" size={10} color={b.fg}>
                      {b.txt}
                    </Txt>
                  </View>
                </Pressable>
                <Hairline />
              </View>
            );
          })}
        </View>

        <Txt size={11} color={C.gray} style={{ marginTop: 24, lineHeight: 18 }}>
          업로드 즉시 암호화되어 관리자 외 접근이 불가하며, 검토 완료 후 30일 안에 자동 파기됩니다.
        </Txt>
        <Txt
          onPress={() => router.back()}
          variant="mono"
          size={11}
          color={C.champagne}
          style={{ marginTop: 16 }}
        >
          ← 돌아가기
        </Txt>
      </View>
    </Screen>
  );
}
