const CARDS = [
  { kr: '학력', en: 'Education', line: '졸업·학위 증명서를 받아 학력을 검증합니다.' },
  { kr: '재산', en: 'Wealth', line: '잔고증명서 또는 자산조회 동의로 가액 구간을 검증합니다.' },
  { kr: '차량', en: 'Vehicle', line: '본인 명의 자동차등록증으로 보유 차량을 검증합니다.' },
  { kr: '부동산', en: 'Real Estate', line: '등기부등본으로 본인 소유 부동산을 검증합니다.' },
];

export function VerificationFour() {
  return (
    <section className="bg-ink px-6 py-20 text-ivory">
      <div className="mx-auto max-w-3xl">
        <p className="font-sans-en text-[10px] uppercase tracking-[0.2em] text-gray-soft">
          Four Verifications
        </p>
        <h2 className="font-serif-kr mt-3 text-2xl font-bold">인증 4종</h2>
        <p className="font-sans-kr mt-3 text-[13px] text-ivory-3/60">
          서류는 암호화 보관되고 검토 완료 후 자동 파기됩니다. 상대에게는 뱃지만 보입니다.
        </p>
        <div className="mt-10 grid gap-px overflow-hidden border border-hair-dark bg-hair-dark sm:grid-cols-2">
          {CARDS.map((c) => (
            <div key={c.en} className="bg-ink p-7">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                <span className="font-sans-en text-[11px] uppercase tracking-[0.12em] text-champagne">
                  {c.en}
                </span>
              </div>
              <h3 className="font-serif-kr mt-3 text-xl font-bold">{c.kr}</h3>
              <p className="font-sans-kr mt-2 text-[13px] leading-relaxed text-ivory-3/70">
                {c.line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
