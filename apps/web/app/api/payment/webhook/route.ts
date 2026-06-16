import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, markOrderPaid } from '@theone/db';
import { verifyPayment, verifyPortoneWebhook } from '@/lib/portone';

export const dynamic = 'force-dynamic';

const schema = z.object({ orderId: z.string().min(1), paymentId: z.string().min(1) });

/**
 * PortOne 결제 완료 웹훅/콜백. 서명 검증 → 서버에서 금액·상태 재검증 후 크레딧 적립(멱등).
 */
export async function POST(req: NextRequest) {
  // 원문(raw) 기준 서명 검증 — JSON 파싱 전에 본문을 그대로 읽는다.
  const raw = await req.text();
  const sig = verifyPortoneWebhook(raw, {
    id: req.headers.get('webhook-id'),
    timestamp: req.headers.get('webhook-timestamp'),
    signature: req.headers.get('webhook-signature'),
  });
  // secret 미설정 시: 프로덕션은 미서명 웹훅을 거부(임의 콜백 적립 차단), 개발은 통과.
  if (sig === 'invalid' || (sig === 'not_configured' && process.env.NODE_ENV === 'production')) {
    return NextResponse.json({ error: 'signature' }, { status: 401 });
  }

  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

  const v = await verifyPayment(parsed.data.paymentId, order.amountWon);
  if (!v.ok) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } });
    return NextResponse.json({ ok: false, status: v.status }, { status: 402 });
  }

  await markOrderPaid(order.id, parsed.data.paymentId);
  return NextResponse.json({ ok: true, credited: order.credits, mock: v.mock });
}
