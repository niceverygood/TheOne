import { Noto_Serif_KR, Inter } from 'next/font/google';
import localFont from 'next/font/local';

/** 헤드라인 — Noto Serif KR (자동 셀프호스팅) */
export const notoSerifKr = Noto_Serif_KR({
  weight: ['500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif-kr',
});

/** 영문 보조 — Inter */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-en',
});

/** 본문 — Pretendard Variable (셀프호스팅, Google Fonts 미제공) */
export const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-sans-kr',
});
