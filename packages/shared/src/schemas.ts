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
 * 광고 어트리뷰션 — utm + Facebook 클릭(fbclid) + referrer + 최초 랜딩.
 * 미들웨어가 first-touch 쿠키로 캡처해 폼 제출/이벤트에 동봉한다.
 */
export const attributionSchema = utmSchema.extend({
  fbclid: z.string().max(255).optional(),
  referrer: z.string().max(500).optional(),
  landing: z.string().max(300).optional(),
});
export type Attribution = z.infer<typeof attributionSchema>;

/**
 * 클라이언트가 /api/track 으로 보낼 수 있는 퍼널 이벤트(상단 단계만).
 * 전환 단계(waitlist_submit/success/duplicate/error)는 서버 액션에서만 기록(위변조 방지).
 */
export const CLIENT_TRACK_EVENTS = ['page_view', 'waitlist_view', 'waitlist_start'] as const;
export type ClientTrackEvent = (typeof CLIENT_TRACK_EVENTS)[number];

export const trackEventSchema = z.object({
  type: z.enum(CLIENT_TRACK_EVENTS),
  path: z.string().max(300).optional(),
  meta: z.record(z.unknown()).optional(),
});
export type TrackEventInput = z.infer<typeof trackEventSchema>;

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
  | { ok: true; seq: number; referralCode: string; eventId?: string }
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

// ============================================================
// Phase 4 — 모바일 가입 제출 (가입 심사 신청)
// ============================================================

/**
 * 모바일 가입(step01~05) 제출 페이로드.
 * 본인인증(KCB)으로 확정된 신원(성별·생년월일·휴대폰) + 직업/추천인.
 * 이름 등 직접식별정보는 스키마에 보관하지 않는다(privacy-design §2-4).
 */
export const signupInputSchema = z.object({
  gender: genderSchema,
  jobCategory: z.string().min(1, '직업 카테고리를 선택해 주세요.'),
  /** 본인인증으로 확정된 생년월일 (YYYY-MM-DD) */
  birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '생년월일 형식이 올바르지 않습니다.')
    .optional(),
  /** 본인인증으로 확정된 휴대폰 (중복가입 차단 키) */
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  referralCode: z
    .string()
    .trim()
    .max(32)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  /** 제출한 사진 장수 (실제 S3 업로드는 별도 단계) */
  photoCount: z.coerce.number().int().min(0).max(10).optional(),
  /**
   * 본인인증 봉인 토큰 (선택). KCB 결과 응답이 내려준 불투명 토큰을 그대로 전달하면
   * 서버가 열어 ciHash 를 User 에 저장한다(중복/차단 회원 조회용). 클라이언트는 내용을 못 봄.
   */
  idToken: z.string().max(1024).optional(),
});
export type SignupInput = z.infer<typeof signupInputSchema>;

export type SignupSubmitResult =
  | { ok: true; userId: string; status: UserStatus }
  | {
      ok: false;
      reason: 'validation' | 'duplicate' | 'server';
      message: string;
      fieldErrors?: Record<string, string>;
    };

// ============================================================
// Phase 4 — 4종 인증 신청 제출 (학력·재산·차량·부동산)
// ============================================================

/** 인증 서류 1건 (S3 업로드 후 키·메타). 평문 URL 보관 금지. */
export const verificationDocumentSchema = z.object({
  s3Key: z.string().min(1).max(512),
  label: z.string().min(1).max(60),
  mime: z.string().max(100).default('application/pdf'),
  size: z.coerce.number().int().nonnegative().default(0),
  sha256: z.string().max(80).default(''),
});

export const verificationSubmitSchema = z.object({
  userId: z.string().min(1, '회원 식별자가 필요합니다.'),
  type: verificationTypeSchema,
  /** 재산/부동산 가액 구간 (예: "10억~30억") */
  valueTier: z.string().max(40).optional(),
  documents: z.array(verificationDocumentSchema).min(1, '서류를 1건 이상 첨부해 주세요.'),
});
export type VerificationSubmitInput = z.infer<typeof verificationSubmitSchema>;

export type VerificationSubmitResult =
  | { ok: true; applicationId: string; slaDueAt: string }
  | { ok: false; reason: 'validation' | 'not_found' | 'server'; message: string };
