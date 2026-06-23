import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, refundOrder } from '@theone/db';
import { cancelPayment } from '@/lib/portone';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

const schema = z.object({ orderId: z.string().min(1) });

/** 환불 — 정책(7일·미사용분, packages/shared) 산정 후 PortOne 취소 + 잔액/주문 반영 */
export async function POST(req: NextRequest) {
  const actorId = authUserId(req);
  if (!actorId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order || order.status !== 'paid') {
    return NextResponse.json({ error: 'not_refundable' }, { status: 409 });
  }
  if (order.userId !== actorId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  try {
    // 정책상 환불 가능액 먼저 계산(refundOrder 내부) → PortOne 취소
    const result = await refundOrder(order.id);
    if (result.refundedWon <= 0) {
      return NextResponse.json({ ok: false, reason: '환불 가능 기간(7일) 경과 또는 환불액 0' });
    }
    if (order.paymentId) await cancelPayment(order.paymentId, result.refundedWon);
    return NextResponse.json({ ok: true, refundedWon: result.refundedWon });
  } catch (e) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
