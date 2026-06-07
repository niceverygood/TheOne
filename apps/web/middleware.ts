import { NextRequest, NextResponse } from 'next/server';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
const ATTR_COOKIE = 'theone_attr';
const VID_COOKIE = 'theone_vid';
const ATTR_MAX_AGE = 30 * 24 * 60 * 60; // 30일 — 광고 어트리뷰션 윈도우
const VID_MAX_AGE = 365 * 24 * 60 * 60; // 1년 — 익명 방문자

/**
 * 광고 퍼널 어트리뷰션 캡처(미들웨어).
 *  1) 익명 방문자 id 쿠키(theone_vid)를 없으면 발급 — 방문→가입 이벤트를 한 사람으로 묶는 키.
 *  2) 유입 시 utm_* / fbclid / referrer / landing 을 first-touch 로 theone_attr 쿠키에 저장
 *     → 폼 제출(서버 액션)·이벤트 기록(/api/track)이 읽어 동봉. 이미 쿠키가 있으면 첫 유입 우선.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { searchParams, pathname } = req.nextUrl;

  // 1) 방문자 id 보장
  if (!req.cookies.has(VID_COOKIE)) {
    res.cookies.set(VID_COOKIE, crypto.randomUUID().replace(/-/g, ''), {
      maxAge: VID_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  // 2) first-touch 어트리뷰션 (없을 때만)
  if (!req.cookies.has(ATTR_COOKIE)) {
    const attr: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = searchParams.get(k);
      if (v) {
        const camel = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()); // utm_source → utmSource
        attr[camel] = v.slice(0, 120);
      }
    }
    const fbclid = searchParams.get('fbclid');
    if (fbclid) attr.fbclid = fbclid.slice(0, 255);

    const referrer = req.headers.get('referer');
    if (referrer) attr.referrer = referrer.slice(0, 500);
    attr.landing = pathname.slice(0, 300);

    // utm/fbclid/referrer 중 하나라도 있을 때만 저장(순수 직접유입은 landing만 — 분모는 page_view 이벤트가 담당)
    const hasSignal = Object.keys(attr).some((k) => k !== 'landing');
    if (hasSignal) {
      res.cookies.set(ATTR_COOKIE, encodeURIComponent(JSON.stringify(attr)), {
        maxAge: ATTR_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|og.png|robots.txt|sitemap.xml).*)'],
};
