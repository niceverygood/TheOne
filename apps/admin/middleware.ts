import { NextRequest, NextResponse } from 'next/server';

/**
 * 어드민 콘솔 Basic Auth 게이트 (Phase 0).
 * 인증 서류를 다루는 콘솔이므로 Phase 3에서는 운영자 권한 분리(viewer/reviewer/admin)와
 * AccessLog 기록으로 강화한다. 지금은 단일 Basic Auth.
 */
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_BASIC_AUTH_USER;
  const pass = process.env.ADMIN_BASIC_AUTH_PASSWORD;

  // 자격증명 미설정(로컬 초기 셋업) 시 통과
  if (!user || !pass) return NextResponse.next();

  const header = req.headers.get('authorization');
  if (header) {
    const [scheme, encoded] = header.split(' ');
    if (scheme === 'Basic' && encoded) {
      const [u, p] = atob(encoded).split(':');
      if (u === user && p === pass) return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="THE ONE Admin"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
