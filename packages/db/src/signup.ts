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
  /** AI 생성 + 사용자 편집 자기소개 섹션 */
  introSections?: Record<string, string>;
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
