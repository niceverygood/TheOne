import { NextRequest, NextResponse } from 'next/server';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const COOKIE = 'theone_utm';
const ONE_HOUR = 60 * 60;

/**
 * 유입 쿼리의 utm_* 를 1시간 쿠키로 저장 → 폼 제출 시 서버 액션이 읽어 함께 insert.
 * 이미 쿠키가 있으면 첫 유입을 우선(첫 터치 어트리뷰션).
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { searchParams } = req.nextUrl;

  const hasUtm = UTM_KEYS.some((k) => searchParams.has(k));
  if (hasUtm && !req.cookies.has(COOKIE)) {
    const utm: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = searchParams.get(k);
      if (v) {
        // utm_source → utmSource
        const camel = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
        utm[camel] = v.slice(0, 120);
      }
    }
    res.cookies.set(COOKIE, encodeURIComponent(JSON.stringify(utm)), {
      maxAge: ONE_HOUR,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|og.png|robots.txt|sitemap.xml).*)'],
};
