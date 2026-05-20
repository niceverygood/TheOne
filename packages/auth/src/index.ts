/**
 * 인증 검증 로직 (Phase 0: 인터페이스 + mock).
 *
 * 보비(BOBI) 인프라 재사용 포인트:
 *   - 재산 인증 트랙 B → CODEF 자산조회 (codef.ts 에서 보비 코드 이식, 재작성 금지)
 * 정식 구현은 Phase 3에서 docs/verification-sop.md 를 따라 채운다.
 */
import type { VerificationType } from '@theone/shared';

export interface VerificationResult {
  type: VerificationType;
  passed: boolean;
  /** 운영자 검토가 필요한 경우 사유 */
  needsManualReview: boolean;
  reason?: string;
  /** 검증 유효기간 (SOP: 1년) */
  expiresAt?: Date;
}

export interface VerificationProvider {
  readonly type: VerificationType;
  verify(input: unknown): Promise<VerificationResult>;
}

/** 1년 후 만료 시각 */
export function defaultExpiry(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

/**
 * Phase 0 mock — 모든 인증을 운영자 수동 검토 대기로 반환.
 * Phase 3에서 학력(정부24 PDF/OCR), 재산(CODEF), 차량(자동차등록증),
 * 부동산(인터넷등기소)별 Provider 로 교체.
 */
export function createMockProvider(type: VerificationType): VerificationProvider {
  return {
    type,
    async verify(): Promise<VerificationResult> {
      return {
        type,
        passed: false,
        needsManualReview: true,
        reason: 'mock: 운영자 수동 검토 대기 (Phase 3 자동검증 전)',
      };
    },
  };
}
