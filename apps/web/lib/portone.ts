import 'server-only';

/**
 * PortOne v2 결제 검증 (Phase 5).
 * PORTONE_API_SECRET 미설정 시 mock(항상 결제 성공으로 간주). 정기결제 CID는 카카오페이 CT97630018.
 */
const PORTONE_API = 'https://api.portone.io';

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
