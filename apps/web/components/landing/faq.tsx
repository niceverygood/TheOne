'use client';

import { useState } from 'react';

const FAQS: { q: string; a: string }[] = [
  {
    q: '가격대는 어떻게 되나요?',
    a: '가입 심사는 무료이며, 출시 시점 운영 정책에 따라 크레딧 충전·추가 인증 비용이 안내됩니다. 사전등록자에게는 우선 혜택을 드립니다.',
  },
  {
    q: '언제 출시되나요?',
    a: '사전등록 추이를 보며 일정을 확정합니다. 등록하시면 출시 알림을 가장 먼저 받습니다.',
  },
  {
    q: '인증은 어떻게 하나요?',
    a: '학력은 졸업·학위 증명서, 재산은 잔고증명서 또는 자산조회 동의, 차량은 자동차등록증, 부동산은 등기부등본을 제출합니다. 운영자가 직접 검토합니다.',
  },
  {
    q: '인증 유효기간이 있나요?',
    a: '각 인증은 1년간 유효하며, 만료 30일 전 갱신 안내를 드립니다.',
  },
  {
    q: '제출한 서류는 어떻게 보관되나요?',
    a: '업로드 즉시 암호화되어 관리자 외 접근이 불가하며, 검토 완료 후 자동 파기됩니다. 매칭 상대에게는 인증 뱃지만 노출됩니다.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '전자상거래법에 따른 청약철회 정책을 출시 약관에 명시합니다. 결제 전 환불 조건을 명확히 안내합니다.',
  },
  {
    q: '탈퇴하면 데이터는 어떻게 되나요?',
    a: '탈퇴 시 개인정보처리방침에 따라 처리됩니다. 분쟁 대비 최소 보관 항목을 제외하고 파기합니다.',
  },
  {
    q: '어떻게 운영되나요?',
    a: '주식회사 바틀이 운영합니다. 무한 스와이프 대신 매일 1명 큐레이션과 진심을 담은 만남 신청서 방식으로 연결합니다.',
  },
];

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
