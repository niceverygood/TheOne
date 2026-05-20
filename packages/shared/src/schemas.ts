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

/** UTM 파라미터 (미들웨어가 쿠키로 캡처 → 폼 제출 시 동봉) */
export const utmSchema = z.object({
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  utmTerm: z.string().max(120).optional(),
  utmContent: z.string().max(120).optional(),
});
export type Utm = z.infer<typeof utmSchema>;

/**
 * Phase 1 — 웨이팅리스트 사전등록 (사용자 입력).
 * `website`는 허니팟: 채워져 있으면 봇으로 간주하고 silent reject.
 */
export const waitlistInputSchema = z.object({
  email: z.string().trim().toLowerCase().email('올바른 이메일을 입력해 주세요.'),
  gender: genderSchema,
  jobCategory: z.string().min(1, '직업 카테고리를 선택해 주세요.'),
  referralCode: z
    .string()
    .trim()
    .max(32)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  agreeTerms: z.coerce.boolean().refine((v) => v === true, {
    message: '약관에 동의해 주세요.',
  }),
  /** 허니팟 — 빈 값이어야 정상 */
  website: z.string().max(0).optional().or(z.literal('')),
  /** Cloudflare Turnstile 토큰 */
  turnstileToken: z.string().optional(),
});
export type WaitlistInput = z.infer<typeof waitlistInputSchema>;

/** DB insert 직전 페이로드 (입력 + 서버 캡처 메타) */
export const waitlistRecordSchema = waitlistInputSchema
  .pick({ email: true, gender: true, jobCategory: true, referralCode: true })
  .merge(utmSchema)
  .extend({
    userAgent: z.string().optional(),
    ipHash: z.string().optional(),
  });
export type WaitlistRecord = z.infer<typeof waitlistRecordSchema>;

/** 폼 제출 결과 (서버 액션 반환) */
export type WaitlistSubmitResult =
  | { ok: true; seq: number; referralCode: string }
  | {
      ok: false;
      reason: 'validation' | 'duplicate' | 'turnstile' | 'rate_limit' | 'server';
      message: string;
      fieldErrors?: Record<string, string>;
    };

/** PostHog 이벤트 이름 (오타 방지용 상수) */
export const ANALYTICS_EVENTS = {
  formView: 'waitlist_form_view',
  submitAttempt: 'waitlist_form_submit_attempt',
  submitSuccess: 'waitlist_form_submit_success',
  submitFail: 'waitlist_form_submit_fail',
} as const;
