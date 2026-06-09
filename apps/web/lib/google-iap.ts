import 'server-only';
import crypto from 'crypto';

/**
 * Google Play 인앱결제(상품) 영수증 검증 — Android Publisher API v3.
 *
 * 서비스계정(JSON)으로 JWT grant → OAuth2 access token → purchases.products.get 으로
 * purchaseToken 을 검증한다. GOOGLE_PLAY_SERVICE_ACCOUNT_JSON 미설정 시 mock(개발 편의,
 * purchaseToken 만 transactionId 로 통과). google-auth-library 없이 Node crypto 로 RS256 서명.
 */

export interface GoogleVerifyResult {
  ok: boolean;
  transactionId?: string; // orderId (멱등 키)
  productId?: string;
  purchaseState?: number; // 0=구매완료 1=취소 2=대기
  mock: boolean;
  status?: number;
  reason?: string;
}

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const sa = JSON.parse(raw) as ServiceAccount;
    if (!sa.client_email || !sa.private_key) return null;
    // \n 이스케이프된 키 복원(환경변수에 한 줄로 넣는 경우 대응)
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    return sa;
  } catch {
    return null;
  }
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.token;

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claim}`;
  let signature: Buffer;
  try {
    signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key);
  } catch {
    return null;
  }
  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  }).catch(() => null);
  if (!res || !res.ok) return null;

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  cachedToken = { token: data.access_token, exp: now + (data.expires_in ?? 3600) };
  return cachedToken.token;
}

/**
 * 구매 토큰 검증. purchaseState=0(구매완료)만 성공으로 본다.
 * 소비(consume)·승인(acknowledge)은 클라이언트의 finishTransaction(isConsumable)이 처리한다.
 */
export async function verifyGooglePurchase(args: {
  packageName: string;
  productId: string;
  purchaseToken: string;
}): Promise<GoogleVerifyResult> {
  const sa = getServiceAccount();
  if (!sa) {
    return {
      ok: true,
      transactionId: `mock-g-${Date.now()}`,
      productId: args.productId,
      mock: true,
    };
  }

  const token = await getAccessToken(sa);
  if (!token) return { ok: false, mock: false, reason: 'auth_failed' };

  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${encodeURIComponent(args.packageName)}/purchases/products/` +
    `${encodeURIComponent(args.productId)}/tokens/${encodeURIComponent(args.purchaseToken)}`;

  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } }).catch(() => null);
  if (!res) return { ok: false, mock: false, reason: 'network' };
  if (!res.ok) {
    return {
      ok: false,
      mock: false,
      status: res.status,
      reason: res.status === 410 ? 'token_expired' : 'verify_failed',
    };
  }

  const data = (await res.json()) as { purchaseState?: number; orderId?: string };
  if (data.purchaseState !== 0) {
    return { ok: false, mock: false, purchaseState: data.purchaseState, reason: 'not_purchased' };
  }
  return {
    ok: true,
    transactionId: data.orderId ?? args.purchaseToken,
    productId: args.productId,
    purchaseState: 0,
    mock: false,
  };
}
