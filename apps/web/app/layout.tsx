import type { Metadata } from 'next';
import './globals.css';
import { notoSerifKr, inter, pretendard } from './fonts';
import { AnalyticsProvider } from '@/components/analytics-provider';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-one.kr';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'THE ONE · 통과율 23%의 인증 매칭',
  description:
    '학력·재산·차량·부동산 4종 인증을 통과한 사람만. 인생에 한 번뿐인 매칭, THE ONE 사전등록.',
  keywords: ['소개팅', '결혼', '인증 매칭', '전문직 소개팅', 'THE ONE', '더원'],
  openGraph: {
    title: 'THE ONE · APPLICATION ONLY',
    description: '검증된 사람만 만나는 인증 기반 매칭. 가입 통과율 23%.',
    url: SITE_URL,
    siteName: 'THE ONE',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE ONE · APPLICATION ONLY',
    description: '검증된 사람만 만나는 인증 기반 매칭. 가입 통과율 23%.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} ${inter.variable} ${pretendard.variable}`}>
      <body className="font-sans-kr tracking-kr antialiased">
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
