import { WaitlistForm } from './waitlist-form';

export function WaitlistSection() {
  return (
    <section id="waitlist" className="scroll-mt-8 bg-ivory-2 px-6 py-20">
      <div className="mx-auto max-w-md">
        <p className="font-sans-en text-center text-[10px] uppercase tracking-[0.2em] text-gray">
          Join the waitlist
        </p>
        <h2 className="font-serif-kr mt-3 text-center text-2xl font-bold text-ink-2">
          가장 먼저 입회하세요
        </h2>
        <p className="font-sans-kr mt-3 text-center text-[13px] text-gray">
          사전등록자에게 출시 알림과 초대코드를 우선 드립니다.
        </p>
        <div className="mt-8">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
