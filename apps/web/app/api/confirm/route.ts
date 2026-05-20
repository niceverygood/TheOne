import { NextRequest, NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-one.kr';

/**
 * 확인 메일 링크 진입점. 코드 유효성만 확인하고 랜딩으로 리다이렉트.
 * (오픈/확인율 추적은 Phase 1.5에서 seq 매핑 후 confirmWaitlistEntry 연결 예정)
 */
export function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? '';
  const ok = /^THE-\d{4}-[A-Z0-9]+$/.test(code);
  return NextResponse.redirect(new URL(ok ? '/?confirmed=1' : '/', SITE_URL));
}
