'use client';
import type { ClientTrackEvent } from '@theone/shared';

/**
 * 클라이언트 → /api/track 퍼널 비콘.
 * sendBeacon 우선(언로드 중에도 전송 보장), 미지원 시 fetch keepalive 폴백.
 * 절대 throw하지 않음 — 분석 전송 실패가 UX를 막지 않도록 swallow.
 */
export function trackServer(type: ClientTrackEvent, meta?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({
      type,
      path: window.location.pathname,
      ...(meta ? { meta } : {}),
    });

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      const ok = navigator.sendBeacon('/api/track', blob);
      if (ok) return;
    }

    void fetch('/api/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // swallow
  }
}
