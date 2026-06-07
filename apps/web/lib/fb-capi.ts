import 'server-only';
import { createHash } from 'node:crypto';

/**
 * Facebook Conversions API (서버 전송).
 *  - Pixel(JS)과 동일한 event_id로 Lead 전환을 서버에서도 전송 → 중복 제거(dedup)되며 유실 보강.
 *  - 이메일은 SHA-256 해시로만 전송(원문 미전송). fbc/fbp/ip/ua는 매칭 품질 향상.
 *  - 키(FB_PIXEL_ID + FB_CAPI_ACCESS_TOKEN)가 없으면 no-op.
 *
 * ⚠️ 개인정보: 해시 이메일이 Facebook으로 전송됨 → 개인정보처리방침에 '제3자 제공(해시 식별자)' 반영 필요.
 */

const PIXEL_ID = process.env.FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.FB_CAPI_ACCESS_TOKEN;
const GRAPH_VERSION = process.env.FB_GRAPH_VERSION ?? 'v19.0';
const TEST_EVENT_CODE = process.env.FB_CAPI_TEST_EVENT_CODE;

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** 이메일 정규화(소문자/trim) 후 해시 — Facebook 매칭 규약. */
function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

export interface LeadEventInput {
  /** Pixel과 공유하는 dedup 키 */
  eventId: string;
  email?: string;
  fbc?: string;
  fbp?: string;
  ip?: string;
  userAgent?: string;
  /** 이벤트 발생 URL(랜딩) */
  sourceUrl?: string;
}

/** Lead 전환을 CAPI로 전송. 실패/미설정은 조용히 무시(throw 안 함). */
export async function sendLeadEvent(input: LeadEventInput): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  try {
    const userData: Record<string, unknown> = {};
    if (input.email) userData.em = [hashEmail(input.email)];
    if (input.fbc) userData.fbc = input.fbc;
    if (input.fbp) userData.fbp = input.fbp;
    if (input.ip) userData.client_ip_address = input.ip;
    if (input.userAgent) userData.client_user_agent = input.userAgent;

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId,
          action_source: 'website',
          ...(input.sourceUrl ? { event_source_url: input.sourceUrl } : {}),
          user_data: userData,
        },
      ],
      ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    };

    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
      ACCESS_TOKEN,
    )}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[fb-capi] Lead send failed', res.status, text.slice(0, 500));
    }
  } catch (err) {
    console.error('[fb-capi] Lead send error', err);
  }
}
