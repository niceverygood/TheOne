'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackServer } from '@/lib/track-client';

/**
 * 경로 변경 시 page_view 퍼널 비콘 전송(서버 집계용, PostHog와 별개).
 * 미들웨어가 심은 theone_vid 쿠키로 방문자를 묶어 가입 전환을 추적한다.
 */
export function PageTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackServer('page_view');
  }, [pathname]);
  return null;
}
