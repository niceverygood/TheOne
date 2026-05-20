/**
 * 공유 Zod 스키마 — 앱/어드민/모바일에서 동일 검증.
 * Phase 1 웨이팅리스트부터 사용하며, Phase 3 이후 도메인 스키마가 확장된다.
 */
import { z } from 'zod';

// Gender 타입의 단일 출처는 job-categories.ts. 여기서는 zod 스키마만 제공.
export const genderSchema = z.enum(['male', 'female']);

export const verificationTypeSchema = z.enum(['education', 'wealth', 'vehicle', 'realestate']);
export type VerificationType = z.infer<typeof verificationTypeSchema>;

export const verificationStatusSchema = z.enum(['submitted', 'reviewing', 'approved', 'rejected']);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export const userStatusSchema = z.enum(['pending', 'active', 'suspended', 'withdrawn']);
export type UserStatus = z.infer<typeof userStatusSchema>;

/** Phase 1 — 웨이팅리스트 사전등록 */
export const waitlistSignupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해 주세요.'),
  gender: genderSchema,
  jobCategory: z.string().min(1, '직업 카테고리를 선택해 주세요.'),
  referralCode: z.string().trim().max(32).optional().or(z.literal('')),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: '약관에 동의해 주세요.' }),
  }),
  // UTM (자동 수집)
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});
export type WaitlistSignup = z.infer<typeof waitlistSignupSchema>;
