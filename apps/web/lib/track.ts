import 'server-only';
import type { FunnelEventType } from '@theone/db';
import { recordAnalyticsEvent } from '@theone/db';
import {
  getAttribution,
  getVisitorId,
  getFbCookies,
  getUserAgent,
  getClientIp,
  hashIp,
} from './request-meta';

/**
 * fbclid → fbc 형식 파생 (Facebook CAPI 매칭용).
 * Pixel이 _fbc 쿠키를 못 심은 경우(JS 차단/직접 진입)에도 클릭ID로 복원.
 * 형식: fb.1.{timestamp}.{fbclid}
 */
export function deriveFbc(fbclid?: string): string | undefined {
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

/**
 * 퍼널 이벤트 1건을 서버에서 기록.
 *  - 방문자 id 쿠키가 없으면(미들웨어 매칭 제외 경로 등) skip — 익명 키가 없으면 집계 불가.
 *  - 어트리뷰션/fb 쿠키/UA/ipHash를 동봉.
 *  - 절대 throw하지 않음(분석 실패가 본 기능을 막지 않도록 swallow).
 */
export async function recordEvent(
  type: FunnelEventType,
  opts?: { path?: string; meta?: Record<string, unknown> },
): Promise<void> {
  try {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    const attr = getAttribution();
    const fb = getFbCookies();

    await recordAnalyticsEvent({
      type,
      visitorId,
      path: opts?.path ?? attr.landing ?? null,
      referrer: attr.referrer ?? null,
      landing: attr.landing ?? null,
      utmSource: attr.utmSource ?? null,
      utmMedium: attr.utmMedium ?? null,
      utmCampaign: attr.utmCampaign ?? null,
      utmTerm: attr.utmTerm ?? null,
      utmContent: attr.utmContent ?? null,
      fbclid: attr.fbclid ?? null,
      fbc: fb.fbc ?? deriveFbc(attr.fbclid) ?? null,
      fbp: fb.fbp ?? null,
      userAgent: getUserAgent() || null,
      ipHash: hashIp(getClientIp()),
      meta: opts?.meta ?? null,
    });
  } catch (err) {
    console.error('[track] recordEvent failed', err);
  }
}
