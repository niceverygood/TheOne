import type { Metadata } from 'next';
import './globals.css';
import { AnalyticsProvider } from '@/components/analytics-provider';

export const metadata: Metadata = {
  title: 'THE ONE · 통과율 23%의 인증 매칭',
  description: '학력·재산·차량·부동산 4종 인증을 통과한 사람만. 인생에 한 번뿐인 매칭, THE ONE.',
  openGraph: {
    title: 'THE ONE',
    description: '검증된 사람만 만나는 인증 기반 매칭',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;700&family=Playfair+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-sans-kr">
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
