import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { C } from '../src/theme';
import { Hairline, Screen, Txt } from '../src/ui';
import { useSignup } from '../src/store';
import { fetchCreditBalance } from '../src/signup-api';

type Row = { label: string; href: Href; hint?: string };

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: '매칭',
    rows: [
      { label: '오늘의 큐레이션', href: '/curation' },
      { label: '매칭함', href: '/inbox' },
      { label: '케미 리포트', href: '/chemistry' },
    ],
  },
  {
    title: '인증',
    rows: [
      { label: '인증 허브', href: '/verify' },
      { label: '학력 인증', href: '/verify/education' },
      { label: '재산 인증', href: '/verify/family-wealth' },
      { label: '소득 인증', href: '/verify/income' },
      { label: '직업 인증', href: '/verify/job' },
      { label: '부동산 인증', href: '/verify/realestate' },
    ],
  },
  {
    title: '설정',
    rows: [
      { label: '프라이버시 · 휴식', href: '/privacy' },
      { label: '계정 영구 삭제', href: '/delete-account' },
    ],
  },
];

/**
 * 마이페이지 — 로그인한 모든 회원이 동일하게 보는 계정 홈.
 *
 * 관리자 계정도 일반 회원과 화면 구성이 완전히 같다. 유일한 차이는 이 화면 맨 아래의
 * '운영' 섹션으로, 서버가 세션 → User.isAdmin 을 확인해 내려준 권한이 있을 때만 렌더한다
 * (표시만 숨기는 게 아니라 관리자 API 자체가 서버에서 거부된다).
 */
export default function MyPage() {
  const router = useRouter();
  const isAdmin = useSignup((s) => s.isAdmin);
  const name = useSignup((s) => s.name);
  const jobCategory = useSignup((s) => s.jobCategory);
  const residenceRegion = useSignup((s) => s.residenceRegion);
  const sessionToken = useSignup((s) => s.sessionToken);
  const reset = useSignup((s) => s.reset);
  const [balance, setBalance] = useState<number | null>(null);
  // 개발/QA용 전체 화면 목록 — 버전 표기 롱프레스로만 열린다(일반 사용자에게 노출 안 함).
  const [devOpen, setDevOpen] = useState(false);

  const loadBalance = useCallback(async () => {
    if (!sessionToken) return;
    const r = await fetchCreditBalance();
    if (r.ok) setBalance(r.balance);
  }, [sessionToken]);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);
  useFocusEffect(
    useCallback(() => {
      loadBalance();
    }, [loadBalance]),
  );

  function onLogout() {
    reset();
    router.replace('/login');
  }

  const subtitle = [jobCategory, residenceRegion].filter(Boolean).join(' · ');

  return (
    <Screen>
      <View style={{ padding: 24 }}>
        <Pressable onPress={() => router.back()}>
          <Txt variant="mono" size={18} color={C.ink2}>
            ←
          </Txt>
        </Pressable>

        <Txt variant="serifEn" size={15} color={C.champagne} style={{ marginTop: 22 }}>
          My Page
        </Txt>
        <Txt variant="serifKr" size={27} weight="700" color={C.ink2} style={{ marginTop: 4 }}>
          마이페이지
        </Txt>
        {name ? (
          <Txt size={13} color={C.gray} style={{ marginTop: 8 }}>
            {name}
            {subtitle ? ` · ${subtitle}` : ''}
          </Txt>
        ) : null}

        {/* 크레딧 — 잔액 + 충전 진입 */}
        <Pressable onPress={() => router.push('/credits')} style={{ marginTop: 24 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: C.hairLight,
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Txt variant="eyebrow" color={C.gray}>
                크레딧
              </Txt>
              <Txt variant="mono" size={22} weight="600" color={C.ink2} style={{ marginTop: 6 }}>
                {balance === null ? '—' : balance.toLocaleString('ko-KR')}
              </Txt>
            </View>
            <Txt variant="mono" size={11} color={C.champagne}>
              충전 →
            </Txt>
          </View>
        </Pressable>

        <View style={{ marginTop: 28 }}>
          <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
            내 정보
          </Txt>
          <NavRow label="내 프로필" onPress={() => router.push('/profile')} />
          <NavRow label="내 추천 코드" onPress={() => router.push('/referral')} />
        </View>

        {SECTIONS.map((s) => (
          <View key={s.title} style={{ marginTop: 28 }}>
            <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
              {s.title}
            </Txt>
            {s.rows.map((r) => (
              <NavRow key={r.label} label={r.label} onPress={() => router.push(r.href)} />
            ))}
          </View>
        ))}

        {/* 운영 — 관리자 권한 계정에만 보인다. 일반 계정에는 섹션 자체가 없다. */}
        {isAdmin ? (
          <View style={{ marginTop: 28 }}>
            <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
              운영
            </Txt>
            <NavRow label="가입 심사" onPress={() => router.push('/admin?tab=members')} />
            <NavRow label="신고 처리" onPress={() => router.push('/admin?tab=reports')} />
          </View>
        ) : null}

        <View style={{ marginTop: 28 }}>
          <Txt variant="eyebrow" style={{ marginBottom: 8 }}>
            계정
          </Txt>
          <NavRow label="로그아웃" onPress={onLogout} />
        </View>

        <Pressable onLongPress={() => setDevOpen(true)} delayLongPress={1200}>
          <Txt variant="mono" size={10} color={C.graySoft} style={{ marginTop: 32 }}>
            THE ONE · 주식회사 바틀
          </Txt>
        </Pressable>
        {devOpen ? (
          <View style={{ marginTop: 12 }}>
            <NavRow label="전체 화면 둘러보기 (QA)" onPress={() => router.push('/menu')} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function NavRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
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
  );
}
