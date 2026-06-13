'use client';

import { useState } from 'react';
import { FAQS } from './faq-data';

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-ivory px-6 py-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-sans-en text-[10px] uppercase tracking-[0.2em] text-gray">FAQ</p>
        <h2 className="font-serif-kr mt-3 text-2xl font-bold text-ink-2">자주 묻는 질문</h2>
        <dl className="mt-8 border-t border-hair-light">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-hair-light">
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-sans-kr text-[15px] font-medium text-ink-2">{f.q}</span>
                    <span className="font-mono text-sm text-champagne" aria-hidden>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                </dt>
                {isOpen && (
                  <dd className="pb-5 pr-8">
                    <p className="font-sans-kr text-[13px] leading-relaxed text-gray">{f.a}</p>
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
