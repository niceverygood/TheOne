import { createHash } from 'node:crypto';
import { headers, cookies } from 'next/headers';
import type { Attribution, Utm } from '@theone/shared';

/** IP는 평문 저장하지 않고 솔트 해시. (rate limit 키 + 분석 메타) */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? 'theone-dev-salt';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export function getClientIp(): string {
  const h = headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? '0.0.0.0';
}

export function getUserAgent(): string {
  return headers().get('user-agent') ?? '';
}

/** 미들웨어가 심는 쿠키 이름 */
const ATTR_COOKIE = 'theone_attr'; // first-touch 어트리뷰션(utm + fbclid + referrer + landing)
const VID_COOKIE = 'theone_vid'; // 익명 방문자 id

/** middleware가 저장한 어트리뷰션 쿠키(JSON) 파싱 */
export function getAttribution(): Attribution {
  const raw = cookies().get(ATTR_COOKIE)?.value;
  if (!raw) return {};
  try {
    const p = JSON.parse(decodeURIComponent(raw)) as Attribution;
    return {
      utmSource: p.utmSource,
      utmMedium: p.utmMedium,
      utmCampaign: p.utmCampaign,
      utmTerm: p.utmTerm,
      utmContent: p.utmContent,
      fbclid: p.fbclid,
      referrer: p.referrer,
      landing: p.landing,
    };
  } catch {
    return {};
  }
}

/** 미들웨어가 심은 익명 방문자 id (퍼널 이벤트 연결 키) */
export function getVisitorId(): string | undefined {
  return cookies().get(VID_COOKIE)?.value;
}

/** Facebook Pixel(JS)이 심는 _fbp/_fbc 쿠키 — CAPI 매칭용 */
export function getFbCookies(): { fbc?: string; fbp?: string } {
  const c = cookies();
  return { fbc: c.get('_fbc')?.value, fbp: c.get('_fbp')?.value };
}

/** @deprecated getAttribution 사용. 하위호환 utm-only 뷰. */
export function getUtmFromCookie(): Utm {
  const a = getAttribution();
  return {
    utmSource: a.utmSource,
    utmMedium: a.utmMedium,
    utmCampaign: a.utmCampaign,
    utmTerm: a.utmTerm,
    utmContent: a.utmContent,
  };
}

export { ATTR_COOKIE, VID_COOKIE };
