const ITEMS = ['학력', '재산', '차량', '부동산'];

/** 인증 4종 한 줄 스트립 */
export function ProofStrip() {
  return (
    <section className="border-y border-hair-light bg-ivory-2">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 px-6 py-5 sm:gap-6">
        <span className="font-sans-en text-[10px] uppercase tracking-[0.18em] text-gray">
          Verified
        </span>
        {ITEMS.map((it) => (
          <span key={it} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            <span className="font-sans-kr text-sm text-ink-2">{it}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
