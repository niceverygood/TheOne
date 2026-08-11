/**
 * 가입(회원 생성) 데이터 액세스 — 모바일 가입 제출(web /api/signup)이 사용.
 * 본인인증(KCB)으로 확정된 신원 + 직업으로 User(+빈 Profile)를 생성한다.
 * 상태는 pending(가입 심사 대기)으로 시작한다.
 * 이름 등 직접식별정보는 스키마에 보관하지 않는다(privacy-design §2-4).
 */
import { prisma } from './index';
import type { Gender, Prisma, User } from '@prisma/client';

export class DuplicateUserError extends Error {
  constructor() {
    super('DUPLICATE_USER');
    this.name = 'DuplicateUserError';
  }
}

export interface CreateSignupArgs {
  gender: Gender;
  jobCategory: string;
  /** YYYY-MM-DD */
  birth?: string;
  phone?: string;
  email?: string;
  /** 본인인증 고유식별 해시(privacy-design §2-4) */
  ciHash?: string;
  /** 추천인 userId (추천코드 해석 결과) */
  referredById?: string;
  // ── 가입 설문(Phase 4) ─────────────────────────────
  height?: number;
  residenceRegion?: string;
  activityRegion?: string;
  school?: string;
  hobbies?: string[];
  drinkingFrequency?: string;
  drinkingAmount?: string;
  smoking?: string;
  bodyType?: string;
  /** 가치관 설문 60문항 응답(Likert 1~5) — 매칭 케미 분석 입력 */
  surveyAnswers?: number[];
  /** AI 생성 + 사용자 편집 자기소개 섹션 */
  introSections?: Record<string, string>;
}

/**
 * 본인인증 식별해시(ciHash)로 기존 회원 조회 — 로그인용.
 * 휴대폰 본인인증을 다시 거친 호출자가 본인 계정인지 식별한다(비밀번호 없음).
 * 이름 등 직접식별정보는 보관하지 않으므로 식별·상태·성별만 반환한다.
 */
export async function findUserByCiHash(ciHash: string) {
  if (!ciHash) return null;
  return prisma.user.findUnique({
    where: { ciHash },
    select: { id: true, status: true, gender: true, isAdmin: true, phone: true },
  });
}

/**
 * 운영자 지정 휴대폰(ADMIN_PHONES, 쉼표 구분)이면 User.isAdmin 을 켠다 — 로그인 시 1회 동기화.
 * 관리자 권한의 진실의 원천은 DB 컬럼이고, 이 함수는 운영자 계정을 수동 DB 작업 없이
 * 환경변수로 지정할 수 있게 해주는 배선일 뿐이다. 목록이 비어 있으면 아무 것도 하지 않는다.
 */
export async function syncAdminFlagByPhone(
  userId: string,
  phone: string | null,
  currentIsAdmin: boolean,
): Promise<boolean> {
  const digits = (v: string) => v.replace(/\D/g, '');
  const allow = (process.env.ADMIN_PHONES ?? '')
    .split(',')
    .map((v) => digits(v))
    .filter((v) => v.length >= 10);
  if (allow.length === 0 || !phone) return currentIsAdmin;
  const shouldBeAdmin = allow.includes(digits(phone));
  if (shouldBeAdmin === currentIsAdmin) return currentIsAdmin;
  await prisma.user.update({ where: { id: userId }, data: { isAdmin: shouldBeAdmin } });
  return shouldBeAdmin;
}

/** 가입 1건 생성(상태 pending). 휴대폰/이메일/CI 중복 시 DuplicateUserError. */
export async function createSignupUser(args: CreateSignupArgs): Promise<User> {
  try {
    return await prisma.user.create({
      data: {
        gender: args.gender,
        jobCategory: args.jobCategory,
        birth: args.birth ? new Date(args.birth) : null,
        phone: args.phone ?? null,
        email: args.email ?? null,
        ciHash: args.ciHash ?? null,
        referredById: args.referredById ?? null,
        // status 는 스키마 기본값 pending(가입 심사 대기)
        profile: {
          // 실제 사진은 S3 업로드 후 키를 보관한다(지금은 빈 배열).
          create: {
            photos: [],
            region: args.residenceRegion ?? null,
            height: args.height ?? null,
            residenceRegion: args.residenceRegion ?? null,
            activityRegion: args.activityRegion ?? null,
            school: args.school ?? null,
            hobbies: args.hobbies ?? [],
            drinkingFrequency: args.drinkingFrequency ?? null,
            drinkingAmount: args.drinkingAmount ?? null,
            smoking: args.smoking ?? null,
            bodyType: args.bodyType ?? null,
            surveyAnswers: args.surveyAnswers ?? [],
            introSections: (args.introSections ?? undefined) as Prisma.InputJsonValue | undefined,
          },
        },
      },
    });
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      throw new DuplicateUserError();
    }
    throw e;
  }
}
