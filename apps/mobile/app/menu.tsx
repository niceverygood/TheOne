import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { C } from '../src/theme';
import { Hairline, Screen, Txt } from '../src/ui';

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
      ['지난 카드', '/history'],
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
      ['재산 인증', '/verify/family-wealth'],
      ['소득 인증', '/verify/income'],
      ['직업 인증', '/verify/job'],
      ['부동산 인증', '/verify/realestate'],
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
