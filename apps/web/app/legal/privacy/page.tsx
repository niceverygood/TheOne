import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개인정보처리방침 (초안) · THE ONE',
  description: 'THE ONE 개인정보처리방침. 현재 변호사 검토 중인 초안 버전입니다.',
  robots: { index: false, follow: false },
};

const VERSION = 'v0.1 (초안)';
const UPDATED = '2026-05-21';

// 초안 본문 — docs/privacy-policy-v0.1.md 미러. 변호사 검토(v1.0) 후 본문 동기 갱신.
const SECTIONS: Array<{ no: string; title: string; body: React.ReactNode }> = [
  {
    no: '1',
    title: '수집하는 개인정보 항목 및 방법',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          필수: 휴대폰번호, 이름, 생년월일, 성별, 이메일, CI/DI(본인인증), 직업 카테고리·직장명,
          학력, 거주지역, 프로필 사진
        </li>
        <li>선택: 자기소개</li>
        <li>추가 인증(별도 동의): 학력·재산·차량·부동산 인증 서류</li>
        <li>자동 수집: 접속 로그, IP(해시), 기기정보, 쿠키</li>
        <li>방법: 본인인증사 연계, 이용자 직접 입력, 서비스 이용 중 자동 생성</li>
      </ul>
    ),
  },
  {
    no: '2',
    title: '개인정보의 수집·이용 목적',
    body: (
      <p>
        회원 식별·가입 심사, 인증 뱃지 부여, 매칭 서비스 제공, 결제·정산, 고지·통지, 부정이용 방지,
        법령 의무 이행.
      </p>
    ),
  },
  {
    no: '3',
    title: '보유 및 이용 기간',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>회원정보: 탈퇴 후 30일 보관 후 파기</li>
        <li>인증 서류: 검토 완료 후 30일 자동 파기</li>
        <li>결제·거래 기록: 5년(전자상거래법)</li>
        <li>접속기록: 1년</li>
        <li>매칭·대화: 매칭 종료 후 6개월</li>
      </ul>
    ),
  },
  {
    no: '4',
    title: '개인정보의 파기 절차 및 방법',
    body: (
      <p>
        보유기간 경과·목적 달성 시 지체 없이 파기합니다. 전자파일은 복구 불가능한 방식으로 삭제,
        출력물은 분쇄·소각합니다. 자동 파기 배치는 일 1회 실행됩니다.
      </p>
    ),
  },
  {
    no: '5',
    title: '제3자 제공',
    body: (
      <p>
        법령 또는 정보주체의 동의가 있는 경우에 한합니다. 본인인증사(PASS/KCB), CODEF(재산 인증
        동의자에 한하며 신용정보 조회 별도 동의).
      </p>
    ),
  },
  {
    no: '6',
    title: '처리위탁 및 국외 이전',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>위탁: PortOne(결제), Resend(이메일), PostHog·Sentry(분석·오류), AWS(호스팅)</li>
        <li>국외 이전 고지: 이전받는 자 / 국가·일시·방법 / 항목 / 보유·이용 기간은 별표로 명시</li>
      </ul>
    ),
  },
  {
    no: '7',
    title: '정보주체의 권리·행사 방법',
    body: (
      <p>
        열람·정정·삭제·처리정지를 요구할 수 있습니다. 서비스 내 설정 또는 개인정보 보호책임자에게
        요청해 주십시오.
      </p>
    ),
  },
  {
    no: '8',
    title: '개인정보의 안전성 확보조치',
    body: (
      <p>
        내부관리계획, 접근권한 관리·접근통제(MFA·IP 화이트리스트), 암호화(전송 TLS1.3 · 저장 AES-256
        · KMS), 접속기록 1년 보관·점검, 보안프로그램, 물리적 통제.
      </p>
    ),
  },
  {
    no: '9',
    title: '만 14세(및 19세) 미만 처리',
    body: (
      <p>
        본 서비스는 만 19세 이상만 가입할 수 있습니다. 본인인증으로 연령을 확인하며 미성년자 가입을
        차단합니다.
      </p>
    ),
  },
  {
    no: '10',
    title: '쿠키 등 자동수집 장치',
    body: <p>서비스 개선·분석 목적으로 쿠키를 사용합니다. 브라우저 설정으로 거부할 수 있습니다.</p>,
  },
  {
    no: '11',
    title: '개인정보 보호책임자(CPO)',
    body: (
      <p>
        성명·직책 지정 중. 연락처:{' '}
        <a href="mailto:privacy@the-one.kr" className="underline">
          privacy@the-one.kr
        </a>
      </p>
    ),
  },
  {
    no: '12',
    title: '권익침해 구제 방법',
    body: (
      <p>
        개인정보분쟁조정위원회(1833-6972), 개인정보침해신고센터(118), 대검찰청·경찰청 사이버수사.
      </p>
    ),
  },
  {
    no: '13',
    title: '영상정보처리기기 운영',
    body: <p>해당 없음.</p>,
  },
  {
    no: '14',
    title: '처리방침의 변경',
    body: <p>변경 시 시행 7일 전 공지합니다(중대한 변경은 30일 전).</p>,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-ivory text-ink-2">
      <div className="mx-auto max-w-frame px-gutter py-16">
        {/* 초안 워터마크 배너 */}
        <aside className="mb-10 rounded-card border border-champagne bg-champagne-soft p-4 text-[12px] leading-[1.6] text-ink-2">
          <div className="font-mono uppercase tracking-widest text-champagne mb-1">
            DRAFT · v0.1
          </div>
          본 문서는 변호사 검토 진행 중인 초안입니다. 시행 시점에 v1.0으로 갱신 공지되며, 그
          이전까지 본 초안과 실제 서비스 운영 사이에 차이가 있을 수 있습니다. 의견은{' '}
          <a href="mailto:privacy@the-one.kr" className="underline">
            privacy@the-one.kr
          </a>
          로 보내 주십시오.
        </aside>

        <header className="mb-12">
          <div className="font-mono text-[11px] uppercase tracking-widest text-champagne mb-3">
            Privacy Policy · THE ONE
          </div>
          <h1 className="font-serif-kr text-[34px] font-bold tracking-kr leading-[1.2]">
            개인정보처리방침
          </h1>
          <div className="mt-4 font-mono text-[11px] text-gray flex gap-6">
            <span>{VERSION}</span>
            <span>최종 개정 {UPDATED}</span>
          </div>
          <p className="mt-6 text-[14px] leading-[1.7] text-ink-2">
            주식회사 바틀(이하 &ldquo;회사&rdquo;)은 THE ONE(이하 &ldquo;서비스&rdquo;) 이용자의
            개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관계 법령을 준수합니다. 본 방침은
            법정 필수 기재사항을 포함합니다.
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
          <p>
            * 본 초안의 일부 항목(보유기간 일부·CPO 지정 등)은 운영진·변호사 검토 후 확정됩니다.
          </p>
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
