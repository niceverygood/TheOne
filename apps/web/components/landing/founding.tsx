import Link from 'next/link';

const BENEFITS = [
  { en: 'Founding badge', kr: '파운딩 멤버 뱃지 · 평생 우선 큐레이션' },
  { en: 'Women free', kr: '여성은 인증 · 이용 전액 무료' },
  { en: 'Two-way referral', kr: '초대하면 추천인 · 친구 모두 크레딧' },
];

/** 파운딩 코호트 — 강남권 선착순 50 입회 (콜드스타트 밀도 확보). */
export function Founding() {
  return (
    <section id="founding" className="scroll-mt-8 bg-ink px-6 py-20 text-ivory">
      <div className="mx-auto max-w-2xl">
        <p className="font-sans-en text-[10px] uppercase tracking-[0.2em] text-champagne">
          Founding Members · 선착순 50
        </p>
        <h2 className="font-serif-kr mt-3 text-3xl font-bold leading-snug">
          강남권 첫 50명을
          <br />
          먼저 입회시킵니다
        </h2>
        <p className="font-sans-kr mt-4 text-[14px] leading-relaxed text-ivory-3/70">
          강남3구 거주 · 30대 전문직 첫 코호트를 선착순 50명만 모십니다. 밀도가 차야 매일의
          큐레이션이 제대로 도는 만큼, 한 분 한 분 직접 심사해 입회시킵니다.
        </p>
        <ul className="mt-8 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b.en} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
              <span className="font-sans-kr text-[14px] text-ivory">{b.kr}</span>
            </li>
          ))}
        </ul>
        <Link
          href="#waitlist"
          className="font-sans-kr mt-10 inline-block border border-champagne px-7 py-4 text-[14px] text-champagne transition-opacity hover:opacity-80"
        >
          지금 입회 심사 신청 →
        </Link>
      </div>
    </section>
  );
}
