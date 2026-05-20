const STEPS = [
  {
    no: '01',
    kr: '신청',
    en: 'Apply',
    desc: '이메일과 직업 카테고리로 사전등록. 출시 시 가입 심사 안내를 먼저 받습니다.',
  },
  {
    no: '02',
    kr: '인증',
    en: 'Verify',
    desc: '학력·재산·차량·부동산 서류를 제출하면 운영자가 검토해 뱃지를 부여합니다.',
  },
  {
    no: '03',
    kr: '매칭',
    en: 'Match',
    desc: '무한 스와이프 없이 매일 한 명을 큐레이션. 진심을 담은 신청서로 연결됩니다.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-ivory px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <p className="font-sans-en text-[10px] uppercase tracking-[0.2em] text-gray">
          How it works
        </p>
        <h2 className="font-serif-kr mt-3 text-2xl font-bold text-ink-2">작동 방식</h2>
        <div className="mt-10 grid gap-px overflow-hidden border border-hair-light bg-hair-light sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.no} className="bg-ivory p-7">
              <span className="font-mono text-xs text-champagne">{s.no}</span>
              <h3 className="font-serif-kr mt-3 text-lg font-bold text-ink-2">{s.kr}</h3>
              <p className="font-sans-kr mt-3 text-[13px] leading-relaxed text-gray">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
