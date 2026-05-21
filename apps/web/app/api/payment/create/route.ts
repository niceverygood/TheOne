import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder } from '@theone/db';
import { CREDIT_PACKAGES } from '@theone/shared';

export const dynamic = 'force-dynamic';

const schema = z.object({ userId: z.string().min(1), packageId: z.string().min(1) });

/** 충전 주문 생성 → 클라이언트가 이 orderId로 PortOne 결제창 호출 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (!CREDIT_PACKAGES.some((p) => p.id === parsed.data.packageId)) {
    return NextResponse.json({ error: 'unknown_package' }, { status: 400 });
  }
  try {
    const order = await createOrder(parsed.data.userId, parsed.data.packageId);
    return NextResponse.json({
      orderId: order.id,
      amountWon: order.amountWon,
      credits: order.credits,
    });
  } catch (e) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ packages: CREDIT_PACKAGES });
}
