/**
 * 크레딧 패키지 + 환불 정책 (legal-checklist §4-4).
 * 크레딧 1회 충전(3·5·10만원). 멤버십 구독은 v1.1.
 */

export interface CreditPackage {
  id: string;
  won: number;
  credits: number;
  bonus: number; // 보너스 크레딧
}

/** 충전 패키지 — 3 / 5 / 10만원 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'c30', won: 30000, credits: 150, bonus: 0 },
  { id: 'c50', won: 50000, credits: 260, bonus: 20 },
  { id: 'c100', won: 100000, credits: 540, bonus: 60 },
];

export function getPackage(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

/** 신청서 비용 */
export const LETTER_COST = { normal: 20, super: 50 } as const;

/**
 * 환불 가능액 산정 (전자상거래법 7일 청약철회 + 디지털콘텐츠 일부사용 차감).
 * - 충전 후 7일 초과: 환불 불가(0)
 * - 7일 이내 & 미사용분: 사용분 차감 후 잔여분 전액 환불
 * 단가 = 결제금액 / 충전 크레딧(보너스 제외).
 */
export function refundableAmount(args: {
  paidWon: number;
  baseCredits: number; // 보너스 제외 충전분
  remainingCredits: number; // 현재 잔액(미사용으로 간주할 상한)
  daysSinceCharge: number;
}): number {
  if (args.daysSinceCharge > 7) return 0;
  if (args.baseCredits <= 0) return 0;
  const unit = args.paidWon / args.baseCredits;
  const refundableCredits = Math.max(0, Math.min(args.remainingCredits, args.baseCredits));
  return Math.floor(unit * refundableCredits);
}
