import type { Metadata } from 'next';
import Link from 'next/link';
import { AiPreview } from '@/components/landing/ai-preview';
import { SiteFooter } from '@/components/landing/site-footer';

export const metadata: Metadata = {
  title: '매칭 프로필 미리보기 — THE ONE',
  description:
    '사진 한 장으로 매칭 프로필을 미리 받아보세요. 같은 당신을, 스튜디오에서 다시 찍은 것처럼.',
  openGraph: {
    title: '매칭 프로필 미리보기 — THE ONE',
    description: '사진 한 장으로 매칭 프로필을 미리 받아보세요.',
  },
};

const POINTS = [
  { en: 'Same you', kr: '이목구비·골격을 바꾸지 않습니다. 동일 인물 그대로.' },
  { en: 'Studio quality', kr: '스튜디오에 갈 시간 없이, 촬영한 듯한 프로필 4종.' },
  { en: 'Verified later', kr: '입회 심사 때 운영자가 원본과 대조합니다.' },
];

/** AI 프로필 미리보기 — 사전등록 리드마그넷 (콜드스타트 유입). */
export default function PreviewPage() {
  return (
    <main>
      {/* 인트로 */}
      <section className="bg-ink px-6 pb-14 pt-20 text-center text-ivory">
        <Link
          href="/"
          className="font-sans-en text-[11px] uppercase tracking-[0.24em] text-gray-soft hover:text-ivory"
        >
          THE ONE
        </Link>
        <h1 className="font-serif-kr mt-7 text-3xl font-bold leading-[1.2] sm:text-4xl">
          사진 한 장으로
          <br />
          매칭 프로필 미리보기
        </h1>
        <p className="font-sans-kr mx-auto mt-6 max-w-frame text-[14px] leading-relaxed text-ivory-3/75">
          같은 당신을, 스튜디오에서 다시 찍은 것처럼. 보정도 변신도 아닌, 매칭에 쓸 수 있는 프로필
          사진을 만들어 드립니다.
        </p>
      </section>

      {/* 폼 */}
      <section className="bg-ivory-2 px-6 py-12">
        <div className="mx-auto max-w-md">
          <AiPreview />
        </div>
      </section>

      {/* 신뢰 포인트 */}
      <section className="bg-ivory px-6 py-14">
        <div className="mx-auto max-w-md space-y-6">
          {POINTS.map((p) => (
            <div key={p.en} className="border-l border-champagne pl-4">
              <p className="font-sans-en text-[10px] uppercase tracking-[0.16em] text-champagne">
                {p.en}
              </p>
              <p className="font-sans-kr mt-1 text-[14px] leading-relaxed text-ink-2">{p.kr}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
