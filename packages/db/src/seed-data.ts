/**
 * 시드 더미 회원 데이터/로직 — 로컬 스크립트(scripts/seed-dummy-profiles.ts)와
 * 프로덕션 시드 라우트(/api/admin/seed-member)가 공용으로 쓴다(드리프트 방지).
 *
 * 사진은 여기서 보관하지 않는다 — 호출부가 data URI 배열을 넘긴다
 * (로컬은 marketing/dummy-accounts 파일, 프로덕션은 요청 본문).
 */
import { prisma } from './index';
import type { VerificationType } from '@theone/shared';

const SEED_YEAR = 2026;

export type SeedPersona = {
  id: string;
  gender: 'male' | 'female';
  age: number;
  job: string;
  region: string;
  height: number;
  bio: string;
  jobDetail: string;
  school: string;
  hobbies: string[];
  drinkingFrequency: string;
  drinkingAmount: string;
  smoking: string;
  bodyType: string;
  about: string;
  idealType: string;
  badges: VerificationType[];
};

export const SEED_PERSONAS: SeedPersona[] = [
  {
    id: 'm1',
    gender: 'male',
    age: 30,
    job: 'medical',
    region: '서울',
    height: 178,
    bio: '병원 일이 바빠도 제 일상은 단정하게 지키려 합니다. 주말엔 러닝과 전시 관람.',
    jobDetail: '내과 전공의',
    school: '의과대학',
    hobbies: ['러닝', '전시관람', '카페투어'],
    drinkingFrequency: '가끔',
    drinkingAmount: '한두잔',
    smoking: '비흡연',
    bodyType: '보통',
    about: '바쁘지만 사람에게 들이는 정성은 아낀 적이 없습니다.',
    idealType: '자기 일에 단단한 분, 대화가 편한 분.',
    badges: ['education', 'wealth', 'vehicle'],
  },
  {
    id: 'm2',
    gender: 'male',
    age: 31,
    job: 'finance',
    region: '서울',
    height: 181,
    bio: '숫자를 다루지만 결국 사람과 신뢰로 일합니다. 여행과 골프로 환기해요.',
    jobDetail: '외국계 금융 컨설팅',
    school: '경영대학',
    hobbies: ['골프', '여행', '독서'],
    drinkingFrequency: '주1회',
    drinkingAmount: '적당히',
    smoking: '비흡연',
    bodyType: '슬림',
    about: '계획적인 편이지만 좋은 사람 앞에선 여유를 둘 줄 압니다.',
    idealType: '서로의 시간을 존중할 수 있는 분.',
    badges: ['education', 'wealth', 'vehicle'],
  },
  {
    id: 'f1',
    gender: 'female',
    age: 25,
    job: 'medical',
    region: '서울',
    height: 164,
    bio: '약국에서 하루 종일 웃다 보면, 진심으로 편안한 사람이 좋아져요.',
    jobDetail: '약사',
    school: '약학대학',
    hobbies: ['필라테스', '베이킹', '카페투어'],
    drinkingFrequency: '가끔',
    drinkingAmount: '한두잔',
    smoking: '비흡연',
    bodyType: '슬림',
    about: '따뜻하고 차분한 일상을 좋아합니다.',
    idealType: '예의 있고 유머가 있는 분.',
    badges: ['education', 'wealth'],
  },
  {
    id: 'f2',
    gender: 'female',
    age: 26,
    job: 'corporate',
    region: '서울',
    height: 167,
    bio: '카메라 앞에선 또렷하게, 일상에선 솔직하게. 새로운 곳 다니는 걸 좋아해요.',
    jobDetail: '방송 아나운서',
    school: '신문방송학과',
    hobbies: ['여행', '테니스', '맛집탐방'],
    drinkingFrequency: '주1회',
    drinkingAmount: '적당히',
    smoking: '비흡연',
    bodyType: '슬림',
    about: '밝지만 진지한 대화도 좋아합니다.',
    idealType: '함께 있을 때 편안하고 솔직한 분.',
    badges: ['education', 'wealth'],
  },
  {
    id: 'f3',
    gender: 'female',
    age: 24,
    job: 'corporate',
    region: '서울',
    height: 165,
    bio: '브랜드와 화면을 만드는 일을 해요. 감각 있는 것과 솔직한 사람을 좋아합니다.',
    jobDetail: '프로덕트 디자이너',
    school: '디자인대학',
    hobbies: ['전시', '드로잉', '러닝'],
    drinkingFrequency: '가끔',
    drinkingAmount: '한두잔',
    smoking: '비흡연',
    bodyType: '슬림',
    about: '취향이 분명하지만 사람에겐 열려 있습니다.',
    idealType: '자기 세계가 있고 대화가 즐거운 분.',
    badges: ['education', 'wealth'],
  },
  {
    id: 'f4',
    gender: 'female',
    age: 27,
    job: 'legal',
    region: '서울',
    height: 166,
    bio: '꼼꼼한 직업 특성처럼 관계도 천천히, 깊게 쌓는 편이에요.',
    jobDetail: '변호사 (주니어)',
    school: '법학전문대학원',
    hobbies: ['독서', '미술관', '요가'],
    drinkingFrequency: '거의안함',
    drinkingAmount: '거의못마심',
    smoking: '비흡연',
    bodyType: '보통',
    about: '조용한 시간을 소중히 여기는 사람입니다.',
    idealType: '대화가 통하고 배려 깊은 분.',
    badges: ['education', 'wealth', 'realestate'],
  },
  {
    id: 'f5',
    gender: 'female',
    age: 28,
    job: 'corporate',
    region: '서울',
    height: 166,
    bio: '설레는 걸 여전히 좋아해요. 좋은 사람과의 저녁 한 끼가 가장 큰 위로예요.',
    jobDetail: '마케터',
    school: '경영대학',
    hobbies: ['와인', '여행', '클래식'],
    drinkingFrequency: '주1회',
    drinkingAmount: '적당히',
    smoking: '비흡연',
    bodyType: '보통',
    about: '단단하면서도 다정한 일상을 지향합니다.',
    idealType: '서로를 다정하게 존중할 수 있는 분.',
    badges: ['education', 'wealth', 'vehicle'],
  },
];

/** 페르소나별 가치관 60문항(1~5) — 시드값으로 결정적 생성(매칭 입력용). */
export function surveyFor(seed: number): number[] {
  return Array.from({ length: 60 }, (_, i) => ((seed * 7 + i * 3) % 5) + 1);
}

export const seedEmail = (id: string) => `seed_${id}@theone.app`;

/**
 * 시드 회원 1명 생성(기존 동일 email 삭제 후) — 사진은 data URI 배열로 받는다.
 * @returns 생성된 회원 요약
 */
export async function upsertSeedMember(
  id: string,
  photos: string[],
): Promise<{ id: string; email: string; jobDetail: string; gender: string; photos: number }> {
  const idx = SEED_PERSONAS.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`UNKNOWN_SEED_ID:${id}`);
  const p = SEED_PERSONAS[idx]!;
  const email = seedEmail(p.id);

  await prisma.user.deleteMany({ where: { email } });
  const user = await prisma.user.create({
    data: {
      email,
      gender: p.gender,
      jobCategory: p.job,
      birth: new Date(Date.UTC(SEED_YEAR - p.age, 2, 15)),
      status: 'active',
      profile: {
        create: {
          region: p.region,
          residenceRegion: p.region,
          activityRegion: p.region,
          jobDetail: p.jobDetail,
          school: p.school,
          height: p.height,
          bio: p.bio,
          hobbies: p.hobbies,
          drinkingFrequency: p.drinkingFrequency,
          drinkingAmount: p.drinkingAmount,
          smoking: p.smoking,
          bodyType: p.bodyType,
          surveyAnswers: surveyFor(idx + 1),
          introSections: { about: p.about, idealType: p.idealType },
          photos,
        },
      },
      badges: {
        create: p.badges.map((t) => ({
          type: t,
          expiresAt: new Date(Date.UTC(SEED_YEAR + 1, 2, 15)),
        })),
      },
    },
  });
  return { id: user.id, email, jobDetail: p.jobDetail, gender: p.gender, photos: photos.length };
}
