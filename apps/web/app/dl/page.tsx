import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** 마케팅 스마트링크 — 기기 감지 후 해당 스토어로. UTM 유지 + 인앱브라우저 탈출. */
const PLAY_BASE = 'https://play.google.com/store/apps/details?id=kr.theone.app';
const APPSTORE_URL = 'https://apps.apple.com/app/id6774067090';

export const metadata: Metadata = {
  title: 'THE ONE · 앱 다운로드',
  description: '인생에 한 번뿐인 매칭, THE ONE. 검증된 사람만의 만남.',
  robots: { index: false, follow: false },
};

type SP = Record<string, string | string[] | undefined>;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function str(v: string | string[] | undefined): string | null {
  return typeof v === 'string' && v ? v : null;
}

/** Google Play 설치 추적용 referrer 에 UTM 동봉 (Play Install Referrer 가 수집) */
function playUrl(sp: SP): string {
  const parts = UTM_KEYS.map((k) => [k, str(sp[k])] as const).filter(([, v]) => v);
  if (!parts.length) return PLAY_BASE;
  const referrer = parts.map(([k, v]) => `${k}=${v}`).join('&');
  return `${PLAY_BASE}&referrer=${encodeURIComponent(referrer)}`;
}

/** 들어온 쿼리스트링 그대로 보존 (외부브라우저 재진입 시 UTM 유지) */
function selfQuery(sp: SP): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    const s = str(v);
    if (s) u.set(k, s);
  }
  const q = u.toString();
  return q ? `?${q}` : '';
}

// 인앱 브라우저(스토어 전환이 막히는 환경) 감지
const INAPP = /KAKAOTALK|Instagram|FBAN|FBAV|FB_IAB|Line\/|NAVER|DaumApps|; wv\)/i;

export default function Download({ searchParams }: { searchParams: SP }) {
  const h = headers();
  const ua = h.get('user-agent') ?? '';
  const host = h.get('host') ?? 'the-one-web-virid.vercel.app';
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isKakao = /KAKAOTALK/i.test(ua);
  const selfUrl = `https://${host}/dl${selfQuery(searchParams)}`;
  const play = playUrl(searchParams);

  // 1) 인앱 브라우저 — 외부 브라우저로 탈출 유도 (스토어 전환 안정화)
  if (INAPP.test(ua)) {
    // 카카오톡은 openExternal 스킴으로 기본 브라우저에서 /dl 재실행 → 거기서 정상 리다이렉트
    const kakaoEscape = `kakaotalk://web/openExternal?url=${encodeURIComponent(selfUrl)}`;
    const escapeScript = isKakao
      ? `try{location.href=${JSON.stringify(kakaoEscape)};}catch(e){}`
      : '';
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 py-16 text-ink-2">
        {escapeScript ? <script dangerouslySetInnerHTML={{ __html: escapeScript }} /> : null}
        <p className="font-sans-en text-[11px] uppercase tracking-[0.2em] text-champagne">
          Application Only
        </p>
        <h1 className="font-serif-kr mt-3 text-center text-2xl font-bold">THE ONE 앱 받기</h1>
        <p className="font-sans-kr mt-3 text-center text-[13.5px] leading-relaxed text-gray">
          원활한 설치를 위해 <b>기본 브라우저(Chrome·Safari)</b>로 열어주세요.
          <br />
          {isKakao
            ? '자동 전환이 안 되면 우측 상단 ⋮ → "다른 브라우저로 열기".'
            : '우측 상단 ⋯(메뉴) → "다른 브라우저로 열기"를 눌러주세요.'}
        </p>
        <div className="mt-9 flex w-full max-w-[300px] flex-col gap-3">
          <a
            href={APPSTORE_URL}
            className="flex items-center justify-center border border-ink-2 bg-ink-2 px-5 py-4 text-[14px] text-ivory transition-opacity hover:opacity-85"
          >
            App Store · 아이폰
          </a>
          <a
            href={play}
            className="flex items-center justify-center border border-hair-light px-5 py-4 text-[14px] text-ink-2 transition-colors hover:border-gray-soft"
          >
            Google Play · 안드로이드
          </a>
        </div>
      </main>
    );
  }

  // 2) 일반 모바일 — 즉시 스토어 (UTM 은 Play referrer 로 전달)
  if (isAndroid) redirect(play);
  if (isIOS) redirect(APPSTORE_URL);

  // 3) 데스크톱/기타(PC) — 웹 랜딩으로 (UTM 보존)
  redirect(`/${selfQuery(searchParams)}`);
}
