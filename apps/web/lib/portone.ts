import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * PortOne v2 결제 검증 (Phase 5).
 * PORTONE_API_SECRET 미설정 시 mock(항상 결제 성공으로 간주). 정기결제 CID는 카카오페이 CT97630018.
 */
const PORTONE_API = 'https://api.portone.io';

/**
 * PortOne v2 웹훅 서명 검증 (Standard Webhooks 규격).
 * 서명 대상 = `${webhook-id}.${webhook-timestamp}.${rawBody}` 의 HMAC-SHA256(base64).
 * secret 은 `whsec_` 접두 후 base64. 헤더: webhook-id / webhook-timestamp / webhook-signature(`v1,<sig>` 공백구분 다중).
 *
 * 반환:
 *  - 'ok'            서명 유효
 *  - 'invalid'       서명 불일치/헤더 누락/타임스탬프 초과
 *  - 'not_configured' PORTONE_WEBHOOK_SECRET 미설정(호출측이 환경에 따라 허용/차단 결정)
 */
export function verifyPortoneWebhook(
  rawBody: string,
  headers: { id?: string | null; timestamp?: string | null; signature?: string | null },
): 'ok' | 'invalid' | 'not_configured' {
  const raw = process.env.PORTONE_WEBHOOK_SECRET;
  if (!raw) return 'not_configured';
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return 'invalid';

  // 재전송 공격 방지 — 타임스탬프 5분 윈도우
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 5 * 60) return 'invalid';

  const key = Buffer.from(raw.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest('base64');

  // 헤더는 "v1,<sig> v2,<sig> ..." 형태일 수 있어 각 토큰의 서명부만 상수시간 비교
  for (const part of signature.split(' ')) {
    const sig = part.includes(',') ? part.split(',')[1]! : part;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return 'ok';
  }
  return 'invalid';
}

export interface PaymentVerifyResult {
  ok: boolean;
  status: string;
  amount?: number;
  mock: boolean;
}

/** 결제 단건 조회로 금액·상태 검증 */
export async function verifyPayment(
  paymentId: string,
  expectedAmount: number,
): Promise<PaymentVerifyResult> {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) {
    // mock: 키 없으면 검증 통과(개발/데모)
    return { ok: true, status: 'PAID', amount: expectedAmount, mock: true };
  }
  try {
    const res = await fetch(`${PORTONE_API}/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${secret}` },
    });
    if (!res.ok) return { ok: false, status: `http_${res.status}`, mock: false };
    const data = (await res.json()) as { status: string; amount?: { total?: number } };
    const amount = data.amount?.total;
    const ok = data.status === 'PAID' && amount === expectedAmount;
    return { ok, status: data.status, amount, mock: false };
  } catch {
    return { ok: false, status: 'error', mock: false };
  }
}

/** 환불 요청 (PortOne cancel). mock 시 항상 성공. */
export async function cancelPayment(
  paymentId: string,
  amountWon: number,
): Promise<{ ok: boolean; mock: boolean }> {
  const secret = process.env.PORTONE_API_SECRET;
  if (!secret) return { ok: true, mock: true };
  try {
    const res = await fetch(`${PORTONE_API}/payments/${encodeURIComponent(paymentId)}/cancel`, {
      method: 'POST',
      headers: { Authorization: `PortOne ${secret}`, 'content-type': 'application/json' },
      body: JSON.stringify({ amount: amountWon, reason: '사용자 환불 요청' }),
    });
    return { ok: res.ok, mock: false };
  } catch {
    return { ok: false, mock: false };
  }
}
