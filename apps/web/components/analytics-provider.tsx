'use client';

import { useEffect } from 'react';

/**
 * PostHog / GA4 / Clarity 자리만 잡아둔 컴포넌트 (Phase 0).
 * DSN/키는 .env (NEXT_PUBLIC_*) 로 주입. 값이 비어 있으면 no-op.
 * 정식 계측 연결은 Phase 1 (LP 검증 게이트)에서.
 */
export function AnalyticsProvider() {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (posthogKey) {
      // TODO(Phase 1): posthog-js init
      // import('posthog-js').then(({ default: posthog }) => posthog.init(posthogKey, {...}))
    }
    // TODO(Phase 1): GA4 (NEXT_PUBLIC_GA4_ID), Microsoft Clarity (NEXT_PUBLIC_CLARITY_ID)
  }, []);

  return null;
}
