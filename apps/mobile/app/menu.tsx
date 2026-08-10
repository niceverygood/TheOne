import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { C, RADIUS } from '../src/theme';
import { Hairline, Screen, Txt } from '../src/ui';
import { useSignup } from '../src/store';

const GROUPS: { title: string; items: [string, Href][] }[] = [
  {
    title: '진입 / 가입',
    items: [
      ['Splash', '/'],
      ['가입 Intro', '/signup/intro'],
    ],
  },
  {
    title: '매칭',
    items: [
      ['오늘의 큐레이션', '/curation'],
      ['프로필 상세', '/profile'],
      ['만남 신청서', '/letter'],
      ['매칭함', '/inbox'],
      ['채팅', '/chat'],
    ],
  },
  {
    title: '경제',
    items: [
      ['크레딧 충전', '/credits'],
      ['내 추천 코드', '/referral'],
      ['케미 리포트', '/chemistry'],
    ],
  },
  {
    title: '추가 인증',
    items: [
      ['인증 허브', '/verify'],
      ['학력 인증', '/verify/education'],
      ['재산 인증', '/verify/wealth'],
      ['차량 인증', '/verify/vehicle'],
      ['부동산 인증', '/verify/realestate'],
      ['인증 심사중', '/verify/reviewing'],
    ],
  },
  {
    title: '안전 / 졸업',
    items: [
      ['프라이버시 + 졸업', '/privacy'],
      ['계정 영구 삭제', '/delete-account'],
    ],
  },
];

/** 데모 내비게이션 — 전체 화면 둘러보기 (실서비스에선 탭바/딥링크로 대체) */
export default function Menu() {
  const router = useRouter();
  const isAdmin = useSignup((s) => s.isAdmin);
  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>
        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 22 }}>
          All Screens
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 4 }}>
          전체 화면 둘러보기
        </Txt>

        {/* 관리자 계정만 노출 — 앱 내 가입 심사·신고 처리 */}
        {isAdmin ? (
          <View style={{ marginTop: 28 }}>
            <Txt variant="eyebrow" style={{ marginBottom: 8 }} color={C.champagne}>
              관리자
            </Txt>
            <Pressable onPress={() => router.push('/admin')}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 15,
                }}
              >
                <Txt size={15} color={C.ink2} weight="500">
                  관리자 콘솔 · 가입 심사 / 신고 처리
                </Txt>
                <Txt variant="mono" size={14} color={C.graySoft}>
                  ›
                </Txt>
              </View>
              <Hairline />
            </Pressable>
          </View>
        ) : null}

        {GROUPS.map((g) => (
          <View key={g.title} style={{ marginTop: 28 }}>
            <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
              {g.title}
            </Txt>
            {g.items.map(([label, href]) => (
              <Pressable key={label} onPress={() => router.push(href)}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 15,
                  }}
                >
                  <Txt size={15} color={C.ink2}>
                    {label}
                  </Txt>
                  <Txt variant="mono" size={14} color={C.graySoft}>
                    ›
                  </Txt>
                </View>
                <Hairline />
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </Screen>
  );
}
