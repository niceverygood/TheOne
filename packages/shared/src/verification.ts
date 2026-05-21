/**
 * 인증 운영 상수 — docs/verification-sop.md 의 코드화.
 * 심사 콘솔(admin)·제출(web)·DB가 공유한다.
 */
import type { VerificationType } from './schemas';

/** SLA: 제출 후 검토 완료까지 (영업 기준 24h). */
export const VERIFICATION_SLA_HOURS = 24;

/** 인증 유효기간 1년. */
export const BADGE_VALID_DAYS = 365;

/** 검토 완료 후 서류 자동 파기까지 (privacy-design §2-3). */
export const DOCUMENT_PURGE_DAYS = 30;

/** 운영자 권한 3단계 */
export const OPERATOR_ROLES = ['viewer', 'reviewer', 'admin'] as const;
export type OperatorRole = (typeof OPERATOR_ROLES)[number];

/** 권한 위계: admin ⊇ reviewer ⊇ viewer */
export function roleAtLeast(role: OperatorRole, required: OperatorRole): boolean {
  return OPERATOR_ROLES.indexOf(role) >= OPERATOR_ROLES.indexOf(required);
}

/** 인증 4종 라벨 */
export const VERIFICATION_LABELS: Record<
  VerificationType,
  { kr: string; en: string; avgDays: number }
> = {
  education: { kr: '학력', en: 'Education', avgDays: 1 },
  wealth: { kr: '재산', en: 'Wealth', avgDays: 1 },
  vehicle: { kr: '차량', en: 'Vehicle', avgDays: 1 },
  realestate: { kr: '부동산', en: 'Real Estate', avgDays: 1 },
};

/** 가액 구간 (재산 / 부동산) */
export const VALUE_TIERS: Partial<Record<VerificationType, string[]>> = {
  wealth: ['5억~10억', '10억~30억', '30억~50억', '50억 이상'],
  realestate: ['10억 미만', '10억~30억', '30억~50억', '50억 이상'],
};

/** 카테고리별 필수/선택 서류 (verification-sop §1~4) */
export const REQUIRED_DOCS: Record<VerificationType, { label: string; required: boolean }[]> = {
  education: [
    { label: '졸업증명서', required: true },
    { label: '학위증명서(석·박사 시)', required: true },
    { label: '전문 자격증', required: false },
  ],
  wealth: [
    { label: '잔고증명서(발급 7일 이내)', required: true },
    { label: '종합소득세 신고확인서', required: true },
    { label: '금융자산 명세', required: false },
  ],
  vehicle: [
    { label: '자동차등록증(본인 명의)', required: true },
    { label: '차량 사진(정면·측면)', required: true },
    { label: '차량가액 증빙', required: false },
  ],
  realestate: [
    { label: '등기부등본(발급 7일 이내)', required: true },
    { label: '공시지가 증빙', required: true },
    { label: '임대차 계약서', required: false },
  ],
};

/** 반려 사유 표준 문구 10종 (verification-sop §5-2) */
export const REJECT_REASONS = [
  {
    code: 'low_resolution',
    label: '해상도 부족',
    message: '글자 판독이 어렵습니다. 선명한 사진으로 재제출해 주세요.',
  },
  {
    code: 'issued_over_7days',
    label: '발급 7일 초과',
    message: '최근 7일 이내 발급분으로 재제출해 주세요.',
  },
  {
    code: 'name_mismatch',
    label: '본인 명의 불일치',
    message: '서류 명의가 본인인증 정보와 다릅니다.',
  },
  {
    code: 'forgery_suspected',
    label: '위조 의심',
    message: '편집·합성 흔적이 있어 원본 재제출이 필요합니다.',
  },
  {
    code: 'partially_hidden',
    label: '정보 일부 가려짐',
    message: '필수 기재란이 가려졌습니다. 전체가 보이게 재촬영해 주세요.',
  },
  { code: 'expired', label: '만료된 서류', message: '유효기간이 지난 문서입니다.' },
  {
    code: 'invalid_issuer',
    label: '발급처 부적격',
    message: '지정된 발급처(정부24/은행/등기소 등)에서 발급한 서류가 아닙니다.',
  },
  {
    code: 'identity_mismatch',
    label: '본인인증 정보와 상이',
    message: '성명·생년월일 등이 본인인증 정보와 일치하지 않습니다.',
  },
  {
    code: 'field_mismatch',
    label: '기재사항 불일치',
    message: '신청 입력값과 서류 내용이 다릅니다.',
  },
  { code: 'other', label: '기타', message: '' },
] as const;

export type RejectReasonCode = (typeof REJECT_REASONS)[number]['code'];
