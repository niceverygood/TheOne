import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, markOrderPaid } from '@theone/db';
import { verifyPayment } from '@/lib/portone';

export const dynamic = 'force-dynamic';

const schema = z.object({ orderId: z.string().min(1), paymentId: z.string().min(1) });

/**
 * PortOne 결제 완료 웹훅/콜백. 서버에서 금액·상태를 재검증 후 크레딧 적립(멱등).
 * (운영 시 PORTONE_WEBHOOK_SECRET 서명 검증 추가)
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
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
