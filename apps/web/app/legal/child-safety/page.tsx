import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '아동 안전 표준 (Child Safety Standards) · THE ONE',
  description:
    'THE ONE의 아동 성적 학대 및 착취(CSAE) 방지 표준. 만 18세 이상 성인 전용 서비스로 아동 성착취·학대를 전면 금지하며 Google Play 아동 안전 표준 정책을 준수합니다.',
};

const UPDATED = '2026-06-04';

const SECTIONS: Array<{ no: string; title: string; body: React.ReactNode }> = [
  {
    no: '1',
    title: '성인 전용 서비스 · 미성년자 이용 금지',
    body: (
      <p>
        THE ONE은 <strong>만 18세 이상(대한민국 기준 만 19세 이상)</strong> 성인만 가입·이용할 수
        있는 매칭 서비스입니다. 모든 가입자는 휴대폰 본인인증(이름·생년월일·CI)으로 연령을 확인하며,
        미성년자의 가입은 시스템적으로 차단됩니다. 미성년자로 확인되거나 의심되는 계정은 즉시 이용이
        정지됩니다.
      </p>
    ),
  },
  {
    no: '2',
    title: '금지되는 콘텐츠 및 행위 (CSAE / CSAM)',
    body: (
      <>
        <p className="mb-2">
          회사는 아동 성적 학대 및 착취(CSAE, Child Sexual Abuse and Exploitation)와 아동 성적 학대
          자료(CSAM, Child Sexual Abuse Material)를 <strong>전면 금지</strong>합니다. 다음을
          포함하되 이에 한정되지 않습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>아동을 성적으로 묘사·암시하는 일체의 이미지·영상·텍스트(CSAM)의 게시·전송·요청</li>
          <li>아동 그루밍(성적 목적의 접근·유인) 및 아동 대상 성적 메시지</li>
          <li>아동 성매매·성착취의 알선·조장·홍보</li>
          <li>미성년자임을 알면서 또는 미성년자로 보이는 사용자와의 성적 상호작용 시도</li>
        </ul>
      </>
    ),
  },
  {
    no: '3',
    title: '인앱 신고 메커니즘',
    body: (
      <p>
        모든 이용자는 앱 내 <strong>신고 기능</strong>(프로필·대화·콘텐츠 신고)을 통해 아동 안전
        관련 우려를 손쉽게 신고할 수 있습니다. 이메일{' '}
        <a href="mailto:safety@the-one.kr" className="underline">
          safety@the-one.kr
        </a>{' '}
        로도 신고를 접수합니다. 신고는 우선순위로 검토되며, 신고자 정보는 보호됩니다.
      </p>
    ),
  },
  {
    no: '4',
    title: '신고·발견 시 조치',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>해당 콘텐츠 즉시 비공개·삭제 및 계정 영구 정지</li>
        <li>법령상 보존이 필요한 증거의 안전한 보전</li>
        <li>반복·중대 위반 계정의 재가입 차단</li>
        <li>피해자 보호를 위한 관련 정보의 비공개 처리</li>
      </ul>
    ),
  },
  {
    no: '5',
    title: '관계 당국 신고 및 협조',
    body: (
      <p>
        회사는 관련 법령에 따라 아동 성적 학대·착취 행위를 인지한 경우 이를 수사기관 및 아동보호
        관계 당국에 신고하고, 적법한 수사·요청에 성실히 협조합니다(대한민국:
        경찰청·방송통신심의위원회 등, 해외 이용자 관련: NCMEC 등 국제 기관 협조 포함).
      </p>
    ),
  },
  {
    no: '6',
    title: '준수 법규',
    body: (
      <p>
        「아동·청소년의 성보호에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등
        대한민국 관계 법령 및 서비스 제공 지역의 아동 안전 관련 법규를 준수합니다.
      </p>
    ),
  },
  {
    no: '7',
    title: '담당자 연락처',
    body: (
      <p>
        아동 안전 담당 연락처:{' '}
        <a href="mailto:safety@the-one.kr" className="underline">
          safety@the-one.kr
        </a>
        . 담당자는 본 서비스의 CSAM 방지 관행 및 규정 준수에 관해 설명할 수 있도록 지정·운영됩니다.
      </p>
    ),
  },
];

export default function ChildSafetyStandardsPage() {
  return (
    <main className="min-h-screen bg-ivory text-ink-2">
      <div className="mx-auto max-w-frame px-gutter py-16">
        <header className="mb-12">
          <div className="font-mono text-[11px] uppercase tracking-widest text-champagne mb-3">
            Child Safety Standards · THE ONE
          </div>
          <h1 className="font-serif-kr text-[34px] font-bold tracking-kr leading-[1.2]">
            아동 안전 표준
          </h1>
          <div className="mt-4 font-mono text-[11px] text-gray flex gap-6">
            <span>최종 개정 {UPDATED}</span>
          </div>
          <p className="mt-6 text-[14px] leading-[1.7] text-ink-2">
            주식회사 바틀(이하 &ldquo;회사&rdquo;)이 운영하는 THE ONE(이하 &ldquo;서비스&rdquo;)은
            만 18세 이상 성인 전용 매칭 서비스로서, 아동 성적 학대 및 착취(CSAE)를 절대 용인하지
            않으며 Google Play 아동 안전 표준 정책을 준수합니다.
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
          <p>본 표준은 Google Play 아동 안전 표준 정책 준수를 위해 외부에 공개 게시됩니다.</p>
          <p>
            <Link href="/" className="underline">
              ← THE ONE 홈으로
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
