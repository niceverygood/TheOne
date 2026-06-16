import 'server-only';

/**
 * Apple App Store 영수증 검증 (Storekit 1 verifyReceipt — IAP v1.0 MVP).
 *
 * 운영 전환 시 App Store Server API v2(JWT 서명 + /lookup)로 마이그레이션. 본 파일은 sandbox→production
 * 폴백 패턴(가이드라인 §4)을 따른다. APPLE_IAP_SHARED_SECRET 미설정 시 mock(개발 편의, 모든 영수증을
 * 통과시키되 productId만 검증).
 */

const PROD = 'https://buy.itunes.apple.com/verifyReceipt';
const SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';

export interface AppleVerifyResult {
  ok: boolean;
  status: number; // Apple status 코드 (0=정상). mock일 땐 -1.
  productId?: string;
  transactionId?: string;
  originalTransactionId?: string;
  environment?: 'Production' | 'Sandbox';
  mock: boolean;
  reason?: string;
}

interface AppleResponse {
  status: number;
  environment?: 'Production' | 'Sandbox';
  receipt?: { in_app?: AppleInApp[] };
  latest_receipt_info?: AppleInApp[];
}

interface AppleInApp {
  product_id: string;
  transaction_id: string;
  original_transaction_id: string;
  purchase_date_ms: string;
}

async function postVerify(url: string, body: object): Promise<AppleResponse | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as AppleResponse;
  } catch {
    return null;
  }
}

/**
 * 영수증(base64) 검증.
 * - production 우선, status=21007이면 sandbox 폴백 (Apple 공식 가이드).
 * - 영수증 안의 in_app 중 expectedProductId와 일치하는 항목을 찾아 반환.
 */
export async function verifyAppleReceipt(args: {
  receiptData: string;
  expectedProductId: string;
}): Promise<AppleVerifyResult> {
  const secret = process.env.APPLE_IAP_SHARED_SECRET;
  if (!secret) {
    // 프로덕션에서 secret 미설정이면 mock 통과 금지 — 환경변수 누락이 무한 크레딧이 되지 않도록.
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, status: -1, mock: false, reason: 'not_configured' };
    }
    return {
      ok: true,
      status: -1,
      productId: args.expectedProductId,
      transactionId: `mock-${Date.now()}`,
      originalTransactionId: `mock-orig-${Date.now()}`,
      environment: 'Sandbox',
      mock: true,
    };
  }

  const body = {
    'receipt-data': args.receiptData,
    password: secret,
    'exclude-old-transactions': true,
  };

  let resp = await postVerify(PROD, body);
  if (resp?.status === 21007) resp = await postVerify(SANDBOX, body);
  if (!resp) return { ok: false, status: -2, mock: false, reason: 'network' };
  if (resp.status !== 0)
    return { ok: false, status: resp.status, mock: false, reason: 'apple_status' };

  const items = resp.latest_receipt_info ?? resp.receipt?.in_app ?? [];
  const match = items.find((i) => i.product_id === args.expectedProductId);
  if (!match) return { ok: false, status: resp.status, mock: false, reason: 'productId_mismatch' };

  return {
    ok: true,
    status: 0,
    productId: match.product_id,
    transactionId: match.transaction_id,
    originalTransactionId: match.original_transaction_id,
    environment: resp.environment,
    mock: false,
  };
}
