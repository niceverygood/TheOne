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

/** 인증 8종 라벨 */
export const VERIFICATION_LABELS: Record<
  VerificationType,
  { kr: string; en: string; avgDays: number }
> = {
  education: { kr: '학력', en: 'Education', avgDays: 1 },
  wealth: { kr: '재산', en: 'Wealth', avgDays: 1 },
  vehicle: { kr: '차량', en: 'Vehicle', avgDays: 1 },
  realestate: { kr: '부동산', en: 'Real Estate', avgDays: 1 },
  income: { kr: '소득', en: 'Income', avgDays: 1 },
  job: { kr: '직업', en: 'Occupation', avgDays: 1 },
  family_wealth: { kr: '집안 자산', en: 'Family Wealth', avgDays: 2 },
  reputation: { kr: '명성', en: 'Reputation', avgDays: 2 },
};

/** 가액 구간 (재산 / 부동산 / 소득 / 집안 자산) */
export const VALUE_TIERS: Partial<Record<VerificationType, string[]>> = {
  wealth: ['5억~10억', '10억~30억', '30억~50억', '50억 이상'],
  realestate: ['10억 미만', '10억~30억', '30억~50억', '50억 이상'],
  income: ['1억 미만', '1억~2억', '2억~3억', '3억 이상'],
  family_wealth: ['30억 미만', '30억~100억', '100억~300억', '300억 이상'],
};

/**
 * 인증 승인 시 지급하는 인앱화폐(크레딧) — 타입별 차등 (난이도/희소성 기반).
 * 운영자 승인 시점에만 지급되며, applicationId 기준 멱등(재승인 중복지급 없음).
 */
export const VERIFY_REWARD_CREDITS: Record<VerificationType, number> = {
  education: 30,
  vehicle: 30,
  job: 30,
  income: 50,
  wealth: 50,
  realestate: 50,
  family_wealth: 80,
  reputation: 80,
};

/** 카테고리별 필수/선택 서류 (verification-sop §1~8) */
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
  income: [
    { label: '소득금액증명원(홈택스, 발급 7일 이내)', required: true },
    { label: '근로소득 원천징수영수증', required: true },
    { label: '급여명세서(최근 3개월)', required: false },
  ],
  job: [
    { label: '재직증명서 또는 사업자등록증', required: true },
    { label: '명함 또는 사원증', required: true },
    { label: '직무 관련 자격·면허', required: false },
  ],
  family_wealth: [
    { label: '가족관계증명서', required: true },
    { label: '부모 명의 자산 증빙(등기부등본·잔고증명 등)', required: true },
    { label: '가업·법인 증빙', required: false },
  ],
  reputation: [
    { label: '언론 보도·기사 또는 공식 프로필', required: true },
    { label: '수상·임명장 또는 공식 직함 증빙', required: true },
    { label: '저서·특허·전시 등 활동 증빙', required: false },
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
