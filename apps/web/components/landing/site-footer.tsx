export function SiteFooter() {
  return (
    <footer className="border-t border-hair-light bg-ivory-2 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-serif-kr text-lg font-bold text-ink-2">THE ONE</p>
        <p className="font-sans-kr mt-3 text-[12px] leading-relaxed text-gray">
          주식회사 바틀 · 사업자등록번호 376-87-01076
          <br />
          통신판매업 신고번호 출시 시점 등록 예정
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-sans-kr text-[12px] text-gray">
          <a href="/legal/privacy" className="underline-offset-4 hover:underline">
            개인정보처리방침
          </a>
          <a href="/legal/terms" className="underline-offset-4 hover:underline">
            이용약관
          </a>
          <a href="mailto:hello@the-one.kr" className="underline-offset-4 hover:underline">
            문의
          </a>
        </div>
        <p className="font-sans-kr mt-6 text-[11px] leading-relaxed text-gray-soft">
          * 본 페이지의 ‘통과율 23%’, ‘인증 4종’ 등은 서비스 준비 중 안내이며, 출시 시점 운영 정책에
          따라 변경될 수 있습니다.
        </p>
        <p className="font-sans-en mt-4 text-[10px] text-gray-soft">
          © {new Date().getFullYear()} BARTLE Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
