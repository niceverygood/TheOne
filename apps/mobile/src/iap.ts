/**
 * IAP 래퍼 — 네이티브에서는 react-native-iap, 웹/시뮬레이터에서는 mock.
 *
 * v1.0은 iOS 우선. Android는 stub(향후 동일 API로 확장).
 * 사용 흐름:
 *   await iap.init();
 *   const purchase = await iap.buy('kr.theone.app.c180');
 *   await fetch('/api/payment/iap/verify', { body: { userId, platform: 'ios', productId, receipt: purchase.receipt }});
 *   await iap.finish(purchase);  // 서버 적립 성공 후 트랜잭션 마감
 */

import { Platform } from 'react-native';

export interface IapPurchase {
  productId: string;
  /** iOS: base64 receipt, Android: purchaseToken */
  receipt: string;
  /** 라이브러리 내부 핸들 (finish 호출 시 필요) */
  raw: unknown;
}

export interface IapApi {
  init: () => Promise<void>;
  buy: (productId: string) => Promise<IapPurchase>;
  finish: (purchase: IapPurchase) => Promise<void>;
  available: boolean;
}

/** 웹/노드/시뮬레이터용 mock — UI 흐름 확인용. 항상 성공. */
const mockIap: IapApi = {
  available: false,
  async init() {},
  async buy(productId) {
    return {
      productId,
      receipt: `mock-receipt-${productId}-${Date.now()}`,
      raw: null,
    };
  },
  async finish() {},
};

let cached: IapApi | null = null;

/**
 * 네이티브에서 react-native-iap 동적 로드.
 * 라이브러리 미설치(예: EAS 빌드 전) 또는 웹 환경이면 mockIap.
 */
export function getIap(): IapApi {
  if (cached) return cached;
  if (Platform.OS === 'web') return (cached = mockIap);

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNIap = require('react-native-iap') as typeof import('react-native-iap');
    const api: IapApi = {
      available: true,
      async init() {
        await RNIap.initConnection();
      },
      async buy(productId) {
        await RNIap.getProducts({ skus: [productId] });
        const purchase = await RNIap.requestPurchase({ sku: productId });
        const p = Array.isArray(purchase) ? purchase[0] : purchase;
        if (!p) throw new Error('purchase_empty');
        return {
          productId: p.productId ?? productId,
          receipt: p.transactionReceipt ?? '',
          raw: p,
        };
      },
      async finish(purchase) {
        const p = purchase.raw as Parameters<typeof RNIap.finishTransaction>[0]['purchase'];
        await RNIap.finishTransaction({ purchase: p, isConsumable: true });
      },
    };
    return (cached = api);
  } catch {
    return (cached = mockIap);
  }
}
