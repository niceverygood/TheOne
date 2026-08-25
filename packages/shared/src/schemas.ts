/**
 * 공유 Zod 스키마 — 앱/어드민/모바일에서 동일 검증.
 * Phase 1 웨이팅리스트부터 사용하며, Phase 3 이후 도메인 스키마가 확장된다.
 */
import { z } from 'zod';
import { SURVEY_QUESTION_COUNT, SURVEY_SCALE_MIN, SURVEY_SCALE_MAX } from './survey';

// Gender 타입의 단일 출처는 job-categories.ts. 여기서는 zod 스키마만 제공.
export const genderSchema = z.enum(['male', 'female']);

/** 가치관 설문 60문항 응답 (Likert 1~5). 매칭 케미 분석의 입력. */
export const surveyAnswersSchema = z
  .array(z.number().int().min(SURVEY_SCALE_MIN).max(SURVEY_SCALE_MAX))
  .length(
    SURVEY_QUESTION_COUNT,
    `가치관 설문은 ${SURVEY_QUESTION_COUNT}문항 모두 응답해야 합니다.`,
  );

export const verificationTypeSchema = z.enum([
  'education',
  'wealth',
  'vehicle',
  'realestate',
  'income',
  'job',
  'family_wealth',
  'reputation',
]);
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
 * AI 자기소개 섹션 — 키:문자열. 가입 마지막 단계에서 생성·편집한 최종본을 그대로 보관한다.
 * 키는 profile-template / AI 프롬프트와 동일(about/idealType/lifestyle/datingStyle/weekend).
 */
export const introSectionsSchema = z.object({
  about: z.string().max(600).default(''),
  idealType: z.string().max(600).default(''),
  lifestyle: z.string().max(600).default(''),
  datingStyle: z.string().max(600).default(''),
  weekend: z.string().max(600).default(''),
});
export type IntroSections = z.infer<typeof introSectionsSchema>;

/** 자기소개 섹션 메타(라벨·순서·플레이스홀더) — 모바일 편집 화면이 사용. */
export const INTRO_SECTIONS = [
  { key: 'about', label: '나는 이런 사람', en: 'About Me' },
  { key: 'idealType', label: '내가 찾는 사람', en: 'Ideal Type' },
  { key: 'lifestyle', label: '나의 라이프스타일', en: 'Lifestyle' },
  { key: 'datingStyle', label: '연애·관계관', en: 'Dating Style' },
  { key: 'weekend', label: '주말엔 보통', en: 'Weekends' },
] as const satisfies readonly { key: keyof IntroSections; label: string; en: string }[];

/**
 * 모바일 가입 제출 페이로드.
 * 본인인증(KCB)으로 확정된 신원(성별·생년월일·휴대폰) + 직업/학교/지역/취미/라이프스타일 + 자기소개.
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
  /** 제출한 사진 장수 — 최소 2장(실제 S3 업로드는 별도 단계) */
  photoCount: z.coerce.number().int().min(2, '사진을 2장 이상 등록해 주세요.').max(10).optional(),
  // ── 프로필 상세(가입 설문) ─────────────────────────────
  height: z.coerce.number().int().min(120).max(220).optional(),
  residenceRegion: z.string().max(40).optional(),
  activityRegion: z.string().max(40).optional(),
  school: z.string().trim().max(80).optional(),
  hobbies: z.array(z.string().max(40)).max(20).optional(),
  drinkingFrequency: z.string().max(40).optional(),
  drinkingAmount: z.string().max(40).optional(),
  smoking: z.string().max(40).optional(),
  bodyType: z.string().max(40).optional(),
  /** AI 생성 + 사용자 편집한 자기소개 섹션 */
  introSections: introSectionsSchema.partial().optional(),
  /** 가치관 설문 60문항 응답(Likert 1~5) — 매칭 케미 분석 입력 */
  surveyAnswers: surveyAnswersSchema.optional(),
  /**
   * 본인인증 봉인 토큰 (선택). KCB 결과 응답이 내려준 불투명 토큰을 그대로 전달하면
   * 서버가 열어 ciHash 를 User 에 저장한다(중복/차단 회원 조회용). 클라이언트는 내용을 못 봄.
   */
  idToken: z.string().max(1024).optional(),
});
export type SignupInput = z.infer<typeof signupInputSchema>;

// ============================================================
// AI 자기소개 생성 (Claude API + 템플릿 폴백)
// ============================================================

/** 자기소개 생성 입력 — 수집한 프로필 데이터(직접식별정보 제외). */
export const profileGenerateSchema = z.object({
  gender: genderSchema,
  jobCategory: z.string().min(1),
  /** 만 나이(생년월일 대신 나이만 전달 — PII 최소화) */
  age: z.coerce.number().int().min(19).max(99).optional(),
  height: z.coerce.number().int().min(120).max(220).optional(),
  residenceRegion: z.string().max(40).optional(),
  activityRegion: z.string().max(40).optional(),
  school: z.string().trim().max(80).optional(),
  hobbies: z.array(z.string().max(40)).max(20).optional(),
  drinkingFrequency: z.string().max(40).optional(),
  drinkingAmount: z.string().max(40).optional(),
  smoking: z.string().max(40).optional(),
  bodyType: z.string().max(40).optional(),
});
export type ProfileGenerateInput = z.infer<typeof profileGenerateSchema>;

export type ProfileGenerateResult =
  | { ok: true; sections: IntroSections; source: 'ai' | 'template' }
  | { ok: false; reason: 'validation' | 'server'; message: string };

// ============================================================
// 본인 명의 아님 — 운영자 수동 본인인증 요청
// ============================================================

/**
 * 휴대폰이 본인 명의가 아닌 경우의 수동 인증 요청.
 * 신분증 사진은 S3 키만 보관(KMS 암호화). 주민등록번호 뒷자리는 가린 사본을 권장.
 */
export const manualIdentitySchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해 주세요.').max(40),
  phone: z.string().trim().min(1, '연락처를 입력해 주세요.').max(20),
  /** 신분증 사진 S3 키 (평문 URL 금지) */
  idCardS3Key: z.string().min(1, '신분증 사진을 첨부해 주세요.').max(512),
  note: z.string().max(500).optional(),
});
export type ManualIdentityInput = z.infer<typeof manualIdentitySchema>;

export type ManualIdentitySubmitResult =
  | { ok: true; requestId: string }
  | { ok: false; reason: 'validation' | 'server'; message: string };

export type SignupSubmitResult =
  | { ok: true; userId: string; status: UserStatus; token: string }
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

// ============================================================
// Phase 5-d — 오늘의 큐레이션 (가치관 케미 노출)
// ============================================================

/** 큐레이션 상대 메타 — 직접식별정보(이름) 제외(privacy-design §2-4). 뱃지·케미만 노출. */
export interface CurationCandidateMeta {
  /** 내부 회원 id(cuid) — 프로필 상세·신청서 발송 대상 지정용. 직접식별정보 아님. */
  id: string;
  region: string | null;
  age: number | null;
  jobCategory: string;
  /** 직업 상세(예: 약사) — 식별정보 아님, 노출 허용 */
  jobDetail: string | null;
  /** 공개된 프로필 사진(data URI 또는 URL). 첫 장이 대표 — 공개 단계에 따라 잘려 온다. */
  photos: string[];
  /** 전체 사진 수(잠긴 장수 = photosTotal - photos.length). 구버전 응답엔 없을 수 있음. */
  photosTotal?: number;
  /** 인증 뱃지 수(verified dots) */
  badgeCount: number;
  /** 자기소개 한 줄(있으면) */
  quote: string | null;
}

/**
 * 사진 공개 단계 — 기본 1장 → 내 별점 3점 이상 2장 → 서로 3점 이상 3장 → 매칭 성사 전체.
 */
export interface CurationReveal {
  /** 현재 공개 사진 수 */
  count: number;
  /** 전체 사진 수 */
  total: number;
  /** 내가 별점 3점 이상(호감) */
  liked: boolean;
  /** 서로 별점 3점 이상 */
  mutual: boolean;
  /** 매칭 성사(만남 신청 수락) — 전체 공개 */
  matched: boolean;
}

/** 케미 일치도 — 종합 + 도시에 3축(결혼관·라이프스타일·갈등 해결). 설문 미완료면 null. */
export interface CurationChemistry {
  overall: number;
  axes: { kr: string; value: number }[];
}

/** 큐레이션 1건 — 후보 + 케미. 하루 N건(CURATION_PER_DAY)일 때 items[] 로 묶인다. */
export interface CurationEntry {
  /** 별점 제출용 CurationLog id. 구버전 응답엔 없을 수 있음. */
  logId?: string;
  /** 내가 남긴 첫인상 별점(1~5). 미평가면 null. */
  myRating?: number | null;
  /** 사진 공개 단계. 구버전 응답엔 없을 수 있음. */
  reveal?: CurationReveal;
  candidate: CurationCandidateMeta;
  chemistry: CurationChemistry | null;
}

/** 첫인상 별점 제출 결과 — 갱신된 공개 사진 목록을 함께 돌려준다. */
export type CurationRateResult =
  | {
      ok: true;
      rating: number;
      liked: boolean;
      mutual: boolean;
      matched: boolean;
      /** 새 공개 단계 기준 사진 목록 */
      photos: string[];
      photosTotal: number;
    }
  | {
      ok: false;
      reason: 'validation' | 'not_found' | 'forbidden' | 'unauthorized' | 'server';
      message?: string;
    };

/** 카드 발송 슬롯 상태 — 화면의 "다음 카드까지" 카운트다운에 쓴다. */
export interface CurationSlotState {
  /** 발송 시각(KST 기준 시). 기본 [12, 15, 20]. */
  hours: number[];
  /** 오늘 지금까지 열린 카드 수. */
  released: number;
  /** 다음 카드가 열리는 시각(ISO). */
  nextAt: string;
}

/** 둘러보기 목록의 회원 1명 — 직접식별정보 없이 카드에 필요한 것만. */
export interface BrowseMember {
  id: string;
  age: number | null;
  region: string | null;
  jobCategory: string;
  jobDetail: string | null;
  /** 대표 사진 1장(없으면 null). 단계별 공개는 프로필 상세가 담당. */
  photo: string | null;
  badges: VerificationType[];
  quote: string | null;
  /** 이미 대기중 신청서를 보낸 상대. */
  alreadyRequested: boolean;
}

export type BrowseMembersResult =
  | { ok: true; items: BrowseMember[]; nextCursor: string | null }
  | { ok: false; reason: 'unauthorized' | 'validation' | 'server'; message: string };

/** 지난 카드 1건 — 이미 소개됐던 후보 이력. */
export interface CurationHistoryEntry {
  logId: string;
  /** 소개된 시각(ISO). */
  sentAt: string;
  /** 내가 남긴 첫인상 별점(1~5). 평가 전이면 null. */
  myRating: number | null;
  /** 내가 이 분에게 보낸 만남 신청 상태. 보낸 적 없으면 null. */
  letter: { matchId: string; status: string } | null;
  reveal: CurationReveal;
  candidate: CurationCandidateMeta;
  chemistry: CurationChemistry | null;
}

export type CurationHistoryResult =
  | { ok: true; items: CurationHistoryEntry[]; nextCursor: string | null }
  | { ok: false; reason: 'unauthorized' | 'validation' | 'server'; message: string };

export type CurationTodayResult =
  | {
      ok: true;
      /** 하위호환: 첫 후보(items[0]). */
      candidate: CurationCandidateMeta | null;
      chemistry: CurationChemistry | null;
      /** 오늘 열린 카드 목록(슬롯 수만큼). 구버전 응답엔 없을 수 있음. */
      items?: CurationEntry[];
      /** 카드 발송 슬롯(12·15·20시 KST) 상태. 구버전 서버 응답엔 없을 수 있음. */
      slots?: CurationSlotState;
    }
  | { ok: false; reason: 'validation' | 'not_found' | 'server'; message: string };
