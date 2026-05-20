import Link from 'next/link';

/** 진입 톤 — 잉크블랙 풀스크린, "통과율 23%". 골드/그라데이션 금지. */
export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center bg-ink px-6 text-center text-ivory">
      {/* 코너 틱 — 샴페인 1px */}
      <span className="pointer-events-none absolute left-7 top-10 h-5 w-5 border-l border-t border-champagne" />
      <span className="pointer-events-none absolute right-7 top-10 h-5 w-5 border-r border-t border-champagne" />
      <span className="pointer-events-none absolute bottom-10 left-7 h-5 w-5 border-b border-l border-champagne" />
      <span className="pointer-events-none absolute bottom-10 right-7 h-5 w-5 border-b border-r border-champagne" />

      <p className="font-sans-en text-[11px] uppercase tracking-[0.24em] text-gray-soft">
        Application Only
      </p>
      <h1 className="font-serif-kr mt-7 text-4xl font-bold leading-[1.18] sm:text-5xl">
        인생에 한 번뿐인 매칭
      </h1>
      <p className="font-sans-kr mt-6 max-w-frame text-[15px] leading-relaxed text-ivory-3/75">
        학력 · 재산 · 차량 · 부동산. 4종 인증을 통과한 사람만 입회합니다.
      </p>

      <div className="mt-12 flex flex-col items-center gap-1.5">
        <span className="font-sans-en text-[10px] uppercase tracking-[0.16em] text-gray">
          가입 통과율
        </span>
        <span className="font-serif-kr text-5xl font-bold text-champagne">23%</span>
      </div>

      <Link
        href="#waitlist"
        className="mt-14 inline-flex items-center justify-center border border-champagne px-9 py-4 text-sm text-champagne transition-opacity hover:opacity-80"
      >
        사전등록 신청하기
      </Link>
      <p className="font-sans-kr mt-4 text-xs text-gray">출시 알림 · 초대코드 우선 발급</p>
    </section>
  );
}
