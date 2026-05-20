import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'THE ONE · 운영 콘솔',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          background: '#FAF7F2',
          color: '#1A1F2E',
          fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {children}
      </body>
    </html>
  );
}
