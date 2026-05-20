import { createHash } from 'node:crypto';
import { headers, cookies } from 'next/headers';
import type { Utm } from '@theone/shared';

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

const UTM_COOKIE = 'theone_utm';

/** middleware가 저장한 utm 쿠키(JSON) 파싱 */
export function getUtmFromCookie(): Utm {
  const raw = cookies().get(UTM_COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Utm;
    return {
      utmSource: parsed.utmSource,
      utmMedium: parsed.utmMedium,
      utmCampaign: parsed.utmCampaign,
      utmTerm: parsed.utmTerm,
      utmContent: parsed.utmContent,
    };
  } catch {
    return {};
  }
}

export { UTM_COOKIE };
