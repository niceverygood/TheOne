import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '이용약관 (초안)',
  description: 'THE ONE 서비스 이용약관. 현재 변호사 검토 중인 초안 버전입니다.',
  robots: { index: false, follow: false },
};

const VERSION = 'v0.1 (초안)';
const UPDATED = '2026-06-01';

// 초안 본문 — 변호사 검토(v1.0) 후 본문 동기 갱신. docs/legal-checklist.md 정책 반영.
const SECTIONS: Array<{ no: string; title: string; body: React.ReactNode }> = [
  {
    no: '1',
    title: '목적',
    body: (
      <p>
        본 약관은 주식회사 바틀(이하 &ldquo;회사&rdquo;)이 제공하는 인증 기반 매칭 서비스 THE
        ONE(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항,
        이용조건과 절차 등 기본적인 사항을 규정함을 목적으로 합니다.
      </p>
    ),
  },
  {
    no: '2',
    title: '용어의 정의',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>&ldquo;회원&rdquo;: 본 약관에 동의하고 가입 심사를 통과하여 서비스를 이용하는 자.</li>
        <li>
          &ldquo;가입 심사&rdquo;: 본인인증·프로필·기본 자격을 회사가 검토하여 입회 여부를 결정하는
          절차.
        </li>
        <li>
          &ldquo;인증 뱃지&rdquo;: 학력·재산·차량·부동산 등 회원이 제출한 서류를 회사가 검토하여
          부여하는 표시. 서류 원본은 매칭 상대에게 제공되지 않으며 뱃지만 노출됩니다.
        </li>
        <li>
          &ldquo;크레딧&rdquo;: 만남 신청 등 유료 기능 이용에 사용되는, 인앱결제로 충전하는 서비스
          내 재화.
        </li>
        <li>&ldquo;콘텐츠&rdquo;: 회원이 서비스에 게시·전송하는 사진·텍스트·메시지 등 일체.</li>
      </ul>
    ),
  },
  {
    no: '3',
    title: '약관의 효력 및 변경',
    body: (
      <p>
        본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관계 법령을 위배하지 않는
        범위에서 약관을 변경할 수 있으며, 변경 시 시행일 7일 전(회원에게 불리하거나 중대한 변경은
        30일 전)부터 공지합니다. 회원이 변경 약관에 동의하지 않을 경우 이용계약을 해지할 수
        있습니다.
      </p>
    ),
  },
  {
    no: '4',
    title: '이용계약의 체결 및 가입 심사',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>본 서비스는 만 19세 이상만 가입할 수 있으며, 본인인증으로 연령을 확인합니다.</li>
        <li>
          가입 신청 후 회사의 가입 심사를 통과한 경우에 한하여 이용계약이 성립합니다. 회사는 심사
          기준에 미달하거나 허위 정보가 확인된 신청을 승낙하지 않거나 사후에 취소할 수 있습니다.
        </li>
        <li>1인 1계정을 원칙으로 하며, 타인 명의·중복 가입을 금지합니다.</li>
      </ul>
    ),
  },
  {
    no: '5',
    title: '서비스의 제공 및 변경',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          회사는 가입 심사, 인증 뱃지 부여, 매일 큐레이션, 만남 신청·매칭, 대화 기능을 제공합니다.
        </li>
        <li>
          회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있으며, 변경 내용은
          사전 공지합니다. 다만 경미한 변경은 사후 공지할 수 있습니다.
        </li>
        <li>서비스는 연중무휴 제공을 원칙으로 하나, 점검·장애 시 일시 중단될 수 있습니다.</li>
      </ul>
    ),
  },
  {
    no: '6',
    title: '인증 뱃지',
    body: (
      <p>
        회원이 제출한 인증 서류는 암호화 보관되며 검토 완료 후 일정 기간 내 자동 파기됩니다. 인증
        뱃지의 유효기간은 1년이며 만료 전 갱신 안내가 제공됩니다. 회사는 제출 서류의 진위를
        검토하나, 위·변조 등 회원의 고의에 의한 허위 인증에 대해서는 회원이 책임을 부담하며 회사는
        뱃지 취소·이용 제한 등의 조치를 취할 수 있습니다.
      </p>
    ),
  },
  {
    no: '7',
    title: '크레딧 및 결제',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          유료 기능은 크레딧으로 이용하며, 크레딧은 Apple App Store / Google Play의 인앱결제(IAP)를
          통해 충전합니다.
        </li>
        <li>결제 금액·크레딧 수량·유효기간은 결제 화면에 표시된 내용을 따릅니다.</li>
        <li>
          미성년자의 결제는 법정대리인의 동의가 없는 경우 본인 또는 법정대리인이 취소할 수 있습니다.
        </li>
      </ul>
    ),
  },
  {
    no: '8',
    title: '청약철회 및 환불',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          인앱결제로 충전한 크레딧의 환불은 Apple / Google 각 마켓의 환불 정책 및 절차에 따릅니다.
        </li>
        <li>
          이미 사용한 크레딧 및 사용으로 효용이 발생한 디지털 콘텐츠는 「전자상거래 등에서의
          소비자보호에 관한 법률」이 정한 범위에서 청약철회가 제한될 수 있습니다.
        </li>
        <li>회사의 귀책으로 서비스를 이용하지 못한 경우 관계 법령에 따라 환불·보상합니다.</li>
      </ul>
    ),
  },
  {
    no: '9',
    title: '회원의 의무 및 금지행위',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>허위 정보 등록, 타인 사칭, 인증 서류 위·변조</li>
        <li>영리·홍보·종교·다단계 등 만남 외 목적의 접근 및 권유</li>
        <li>상대방의 동의 없는 외부 연락처 요구·금전 요구·사기·성적 괴롭힘</li>
        <li>욕설·혐오·폭력·음란물 등 타인의 권리를 침해하거나 불쾌감을 주는 콘텐츠 게시</li>
        <li>서비스의 정상 운영을 방해하는 행위, 자동화 도구·크롤링, 계정 양도·판매</li>
      </ul>
    ),
  },
  {
    no: '10',
    title: '회사의 의무',
    body: (
      <p>
        회사는 관계 법령과 본 약관을 준수하며, 안정적인 서비스 제공을 위해 노력합니다. 회원의
        개인정보는 「개인정보처리방침」에 따라 보호하며, 신고·고충에 대해 신속히 처리합니다.
      </p>
    ),
  },
  {
    no: '11',
    title: '콘텐츠의 관리·신고 및 제재',
    body: (
      <p>
        회사는 신고 또는 모니터링을 통해 금지행위·불법·유해 콘텐츠를 확인한 경우 게시 제한, 경고,
        일시정지, 영구 이용정지(강퇴) 등의 조치를 취할 수 있습니다. 중대한 위반(성범죄·사기·미성년자
        관련 등)은 사전 통지 없이 즉시 영구 정지될 수 있으며, 필요한 경우 수사기관에 통보합니다.
      </p>
    ),
  },
  {
    no: '12',
    title: '이용계약의 해지 및 계정 삭제',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          회원은 언제든지 앱 내 &lsquo;계정 영구 삭제&rsquo; 기능을 통해 이용계약을 해지할 수
          있습니다.
        </li>
        <li>
          해지 시 회원정보는 「개인정보처리방침」에 따라 처리되며, 일정 기간 보관 후 영구
          파기됩니다. 단 결제·거래 기록은 「전자상거래법」 등에 따라 5년간 별도 보관됩니다.
        </li>
        <li>
          회사는 회원이 본 약관을 위반한 경우 이용계약을 해지하거나 이용을 제한할 수 있습니다.
        </li>
      </ul>
    ),
  },
  {
    no: '13',
    title: '손해배상 및 면책',
    body: (
      <p>
        회사는 천재지변, 회원의 귀책, 제3자의 불법행위 등 회사의 책임 없는 사유로 발생한 손해에
        대해서는 책임을 지지 않습니다. 회사는 회원 상호 간 또는 회원과 제3자 간에 서비스를 매개로
        발생한 분쟁에 개입할 의무가 없으며 이로 인한 손해를 배상할 책임이 없습니다. 다만 회사의 고의
        또는 중대한 과실로 인한 손해는 관계 법령에 따라 배상합니다.
      </p>
    ),
  },
  {
    no: '14',
    title: '준거법 및 관할',
    body: (
      <p>
        본 약관은 대한민국 법령에 따라 규율·해석되며, 서비스 이용과 관련하여 회사와 회원 간 분쟁이
        발생한 경우 「민사소송법」상의 관할법원을 제1심 관할법원으로 합니다.
      </p>
    ),
  },
  {
    no: '15',
    title: '문의',
    body: (
      <p>
        본 약관 및 서비스 이용에 관한 문의는{' '}
        <a href="mailto:hello@the-one.kr" className="underline">
          hello@the-one.kr
        </a>
        로 연락해 주십시오.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ivory text-ink-2">
      <div className="mx-auto max-w-frame px-gutter py-16">
        {/* 초안 워터마크 배너 */}
        <aside className="mb-10 rounded-card border border-champagne bg-champagne-soft p-4 text-[12px] leading-[1.6] text-ink-2">
          <div className="font-mono uppercase tracking-widest text-champagne mb-1">
            DRAFT · v0.1
          </div>
          본 약관은 변호사 검토 진행 중인 초안입니다. 시행 시점에 v1.0으로 갱신 공지되며, 그
          이전까지 본 초안과 실제 서비스 운영 사이에 차이가 있을 수 있습니다. 의견은{' '}
          <a href="mailto:hello@the-one.kr" className="underline">
            hello@the-one.kr
          </a>
          로 보내 주십시오.
        </aside>

        <header className="mb-12">
          <div className="font-mono text-[11px] uppercase tracking-widest text-champagne mb-3">
            Terms of Service · THE ONE
          </div>
          <h1 className="font-serif-kr text-[34px] font-bold tracking-kr leading-[1.2]">
            서비스 이용약관
          </h1>
          <div className="mt-4 font-mono text-[11px] text-gray flex gap-6">
            <span>{VERSION}</span>
            <span>최종 개정 {UPDATED}</span>
          </div>
          <p className="mt-6 text-[14px] leading-[1.7] text-ink-2">
            본 약관은 주식회사 바틀(사업자등록번호 376-87-01076, 이하 &ldquo;회사&rdquo;)이 제공하는
            THE ONE 서비스의 이용조건과 절차, 회사와 회원의 권리·의무를 규정합니다.
          </p>
        </header>

        <hr className="border-hair-light mb-10" />

        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.no}>
              <h2 className="font-serif-kr text-[18px] font-bold tracking-kr mb-3">
                <span className="font-mono text-[12px] text-champagne mr-3">{s.no}</span>
                {s.title}
              </h2>
              <div className="text-[14px] leading-[1.75] text-ink-2">{s.body}</div>
            </section>
          ))}
        </div>

        <hr className="border-hair-light my-12" />

        <footer className="font-mono text-[11px] text-gray space-y-3">
          <p>* 본 초안의 일부 조항(환불 세부 절차·관할 등)은 운영진·변호사 검토 후 확정됩니다.</p>
          <p>
            <Link href="/legal/privacy" className="underline">
              개인정보처리방침
            </Link>
            {'   ·   '}
            <Link href="/" className="underline">
              ← THE ONE 홈으로
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
