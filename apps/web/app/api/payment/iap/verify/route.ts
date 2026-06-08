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

  // 멱등: 동일 transactionId의 주문이 이미 있으면 그대로 반환
  const existing = await prisma.order.findFirst({
    where: { paymentId: transactionId, provider },
  });
  if (existing) {
    return NextResponse.json({
      ok: true,
      orderId: existing.id,
      credited: existing.credits,
      duplicate: true,
      mock,
    });
  }

  // 신규 주문 + 적립
  const order = await prisma.order.create({
    data: {
      userId,
      packageId: pkg.id,
      amountWon: pkg.won,
      credits: pkg.credits,
      baseCredits: pkg.baseCredits,
      provider,
      status: 'pending',
    },
  });
  await markOrderPaid(order.id, transactionId);

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    credited: pkg.credits,
    environment,
    mock,
  });
}
