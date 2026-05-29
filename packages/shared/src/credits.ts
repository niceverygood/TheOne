/**
 * 크레딧 패키지 + 환불 정책 (legal-checklist §4-4).
 *
 * v1.0 결제는 Apple/Google IAP 단독. PortOne 외부 PG는 v1.1 이연(`Order.provider` 분기 유지).
 * IAP 환불은 Apple/Google 정책에 위임 — `refundableAmount`는 외부 PG(provider='portone') 주문에만 적용.
 */

export interface CreditPackage {
  id: string;
  won: number;
  credits: number; // 총 지급(보너스 포함)
  baseCredits: number; // 환불 단가 계산용(보너스 제외 — 외부 PG 전용)
  /** Apple App Store Connect에 등록할 product ID */
  appleProductId: string;
  /** Google Play Console에 등록할 product ID */
  googleProductId: string;
}

/**
 * 충전 패키지 — 8종 (docs/reference/theone-standalone.html 화면 16 기준).
 * Apple 가격 티어와 정확히 일치하지 않는 가액(26,000/44,000 등)은 출시 시 한국 커스텀 가격으로 등록.
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  pkg('c80', 12000, 80, 80),
  pkg('c180', 26000, 180, 167),
  pkg('c320', 44000, 320, 286),
  pkg('c480', 62000, 480, 414),
  pkg('c720', 89000, 720, 600),
  pkg('c1000', 119000, 1000, 806),
  pkg('c1600', 179000, 1600, 1231),
  pkg('c2400', 249000, 2400, 1778),
];

function pkg(id: string, won: number, credits: number, baseCredits: number): CreditPackage {
  const productId = `kr.theone.app.${id}`;
  return { id, won, credits, baseCredits, appleProductId: productId, googleProductId: productId };
}

export function getPackage(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

/** Apple/Google IAP productId → 내부 패키지 매핑 (영수증 검증 시 사용) */
export function getPackageByProductId(productId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(
    (p) => p.appleProductId === productId || p.googleProductId === productId,
  );
}

/** 신청서 비용 */
export const LETTER_COST = { normal: 20, super: 50 } as const;

/**
 * 환불 가능액 산정 (전자상거래법 7일 청약철회 + 디지털콘텐츠 일부사용 차감).
 * IAP(provider='iap_apple'|'iap_google') 주문은 스토어 정책으로 위임 — 이 함수는 외부 PG 전용.
 */
export function refundableAmount(args: {
  paidWon: number;
  baseCredits: number;
  remainingCredits: number;
  daysSinceCharge: number;
}): number {
  if (args.daysSinceCharge > 7) return 0;
  if (args.baseCredits <= 0) return 0;
  const unit = args.paidWon / args.baseCredits;
  const refundableCredits = Math.max(0, Math.min(args.remainingCredits, args.baseCredits));
  return Math.floor(unit * refundableCredits);
}
