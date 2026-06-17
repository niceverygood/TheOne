import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** 마케팅 스마트링크 — 기기 감지 후 해당 스토어로 자동 이동. */
const PLAY_URL = 'https://play.google.com/store/apps/details?id=kr.theone.app';
const APPSTORE_URL = 'https://apps.apple.com/app/id6774067090';

export const metadata: Metadata = {
  title: 'THE ONE · 앱 다운로드',
  description: '인생에 한 번뿐인 매칭, THE ONE. 검증된 사람만의 만남.',
  robots: { index: false, follow: false }, // 리다이렉트 페이지 — 색인 제외
};

export default function Download() {
  const ua = headers().get('user-agent') ?? '';

  // 모바일은 즉시 해당 스토어로 (서버 리다이렉트 — 깜빡임 없음)
  if (/android/i.test(ua)) redirect(PLAY_URL);
  if (/iphone|ipad|ipod/i.test(ua)) redirect(APPSTORE_URL);

  // 데스크톱/기타 — 스토어 선택 화면
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 py-16 text-ink-2">
      <p className="font-sans-en text-[11px] uppercase tracking-[0.2em] text-champagne">
        Application Only
      </p>
      <h1 className="font-serif-kr mt-3 text-center text-2xl font-bold leading-snug">
        THE ONE 앱 받기
      </h1>
      <p className="font-sans-kr mt-3 text-center text-[13.5px] leading-relaxed text-gray">
        인생에 한 번뿐인 매칭.
        <br />
        아래에서 사용 중인 기기를 선택하세요.
      </p>

      <div className="mt-9 flex w-full max-w-[300px] flex-col gap-3">
        <a
          href={APPSTORE_URL}
          className="flex items-center justify-center border border-ink-2 bg-ink-2 px-5 py-4 text-[14px] text-ivory transition-opacity hover:opacity-85"
        >
          App Store · 아이폰
        </a>
        <a
          href={PLAY_URL}
          className="flex items-center justify-center border border-hair-light px-5 py-4 text-[14px] text-ink-2 transition-colors hover:border-gray-soft"
        >
          Google Play · 안드로이드
        </a>
      </div>

      <p className="font-sans-kr mt-8 text-center text-[11px] text-gray-soft">
        모바일에서 열면 사용 기기의 스토어로 자동 이동합니다.
      </p>
    </main>
  );
}
