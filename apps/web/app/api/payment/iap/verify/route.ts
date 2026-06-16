import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, markOrderPaid } from '@theone/db';
import { getPackageByProductId } from '@theone/shared';
import { verifyAppleReceipt } from '@/lib/apple-iap';
import { verifyGooglePurchase } from '@/lib/google-iap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GOOGLE_PACKAGE = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'kr.theone.app';

const schema = z.object({
  userId: z.string().min(1),
  platform: z.enum(['ios', 'android']),
  productId: z.string().min(1),
  /** iOS: base64 receipt(StoreKit), Android: purchaseToken (v1.0은 iOS 우선) */
  receipt: z.string().min(1),
});

/**
 * IAP 영수증 검증 → 주문 생성 → 크레딧 적립 (멱등).
 *
 * v1.0 흐름:
 *  1) 클라이언트(react-native-iap)가 결제 완료 후 receipt를 본 엔드포인트로 POST.
 *  2) productId로 패키지 식별.
 *  3) Apple/Google 영수증 검증 (transactionId 추출).
 *  4) transactionId가 기존 Order.paymentId에 이미 있으면 멱등 응답.
 *  5) 신규면 Order 생성 + markOrderPaid로 크레딧 적립.
 *
 * Android(Google Play) 검증은 v1.0 후속 — 현재는 stub.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const { userId, platform, productId, receipt } = parsed.data;

  const pkg = getPackageByProductId(productId);
  if (!pkg) return NextResponse.json({ error: 'unknown_product' }, { status: 400 });

  // 플랫폼별 영수증 검증 → transactionId(멱등 키) 추출
  const provider = platform === 'android' ? 'iap_google' : 'iap_apple';
  let transactionId: string | undefined;
  let mock = false;
  let environment: string | undefined;

  if (platform === 'android') {
    const v = await verifyGooglePurchase({
      packageName: GOOGLE_PACKAGE,
      productId,
      purchaseToken: receipt,
    });
    if (!v.ok || !v.transactionId) {
      return NextResponse.json(
        { ok: false, status: v.status, reason: v.reason ?? 'verify_failed' },
        { status: 402 },
      );
    }
    transactionId = v.transactionId;
    mock = v.mock;
  } else {
    const v = await verifyAppleReceipt({ receiptData: receipt, expectedProductId: productId });
    if (!v.ok || !v.transactionId) {
      return NextResponse.json(
        { ok: false, status: v.status, reason: v.reason ?? 'verify_failed' },
        { status: 402 },
      );
    }
    transactionId = v.transactionId;
    mock = v.mock;
    environment = v.environment;
  }

  // 프로덕션에서 mock 검증분은 절대 적립 금지(라이브러리 가드의 2차 방어선).
  if (mock && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  // 멱등 처리:
  //  - paymentId(transactionId)를 생성 시점에 박고 (provider, paymentId) unique 로 경쟁을 DB가 차단.
  //  - 이미 있으면(빠른 경로 or 동시요청 P2002) 기존 주문에 대해 markOrderPaid 를 멱등 재호출해
  //    적립이 한 번은 반드시 완료되게 한다(이전 시도가 적립 직전 죽어도 복구).
  const respondDuplicate = async (orderId: string) => {
    await markOrderPaid(orderId, transactionId!); // 멱등(status=paid면 no-op)
    const o = await prisma.order.findUnique({ where: { id: orderId } });
    return NextResponse.json({
      ok: true,
      orderId,
      credited: o?.credits ?? pkg.credits,
      duplicate: true,
      mock,
    });
  };

  const existing = await prisma.order.findFirst({
    where: { paymentId: transactionId, provider },
  });
  if (existing) return respondDuplicate(existing.id);

  let order;
  try {
    order = await prisma.order.create({
      data: {
        userId,
        packageId: pkg.id,
        amountWon: pkg.won,
        credits: pkg.credits,
        baseCredits: pkg.baseCredits,
        provider,
        paymentId: transactionId, // 멱등 키를 생성 시점에 고정
        status: 'pending',
      },
    });
  } catch (e) {
    // 동시요청이 같은 (provider, paymentId)로 먼저 만든 경우 → 기존 주문으로 멱등 응답
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      const dup = await prisma.order.findFirst({ where: { paymentId: transactionId, provider } });
      if (dup) return respondDuplicate(dup.id);
    }
    throw e;
  }
  await markOrderPaid(order.id, transactionId);

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    credited: pkg.credits,
    environment,
    mock,
  });
}
