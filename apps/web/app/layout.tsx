import type { Metadata } from 'next';
import './globals.css';
import { notoSerifKr, inter, pretendard } from './fonts';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { PageTracker } from '@/components/analytics/page-tracker';

// the-one.kr 은 타사(더원금융서비스) 도메인 — 절대 사용 금지. 라이브 도메인을 기본값으로.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-one-web-virid.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'THE ONE · 통과율 23%의 인증 매칭',
    template: '%s · THE ONE',
  },
  description:
    '학력·재산·차량·부동산 4종 인증을 통과한 사람만. 인생에 한 번뿐인 매칭, THE ONE 사전등록.',
  keywords: [
    '소개팅',
    '결혼',
    '결혼정보회사',
    '인증 매칭',
    '전문직 소개팅',
    '미혼 매칭',
    '하이엔드 소개팅',
    'THE ONE',
    '더원',
  ],
  applicationName: 'THE ONE',
  authors: [{ name: '주식회사 바틀' }],
  creator: '주식회사 바틀',
  publisher: '주식회사 바틀',
  category: 'social',
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
