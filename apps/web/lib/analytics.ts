'use client';

/**
 * 클라이언트 이벤트 캡처 — PostHog + GA4 양쪽으로 전달.
 * 초기화/키 부재 시 안전하게 no-op.
 */
import posthog from 'posthog-js';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function capture(event: string, props?: Record<string, unknown>): void {
  try {
    if (posthog.__loaded) posthog.capture(event, props);
  } catch {
    /* noop */
  }
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, props ?? {});
  }
}
