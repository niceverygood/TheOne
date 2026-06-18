/**
 * 매칭 추천 검증 — 테스트 뷰어(남, 서울, 31)를 만들고 getTodayCuration 이
 * 실제 시드 여성 회원(사진·직업·케미 포함)을 추천하는지 증명한다.
 * 실행: cd packages/db && pnpm exec tsx scripts/verify-curation.ts
 */
import { prisma } from '../src/index';
import { getTodayCuration } from '../src/matching';

const VIEWER_EMAIL = 'tester_m@theone.app';

async function ensureViewer() {
  await prisma.user.deleteMany({ where: { email: VIEWER_EMAIL } });
  const survey = Array.from({ length: 60 }, (_, i) => ((i * 2) % 5) + 1);
  return prisma.user.create({
    data: {
      email: VIEWER_EMAIL,
      gender: 'male',
      jobCategory: 'finance',
      birth: new Date('1995-03-15T00:00:00Z'), // 2026 기준 31세
      status: 'active',
      profile: {
        create: {
          region: '서울',
          residenceRegion: '서울',
          activityRegion: '서울',
          surveyAnswers: survey,
        },
      },
    },
  });
}

async function main() {
  const viewer = await ensureViewer();
  // 깨끗한 검증 — 이 뷰어의 기존 큐레이션 로그 제거(매번 새로 추천 받게)
  await prisma.curationLog.deleteMany({ where: { userId: viewer.id } });

  const res = await getTodayCuration(viewer.id);
  if (!res?.candidate) {
    console.log('✗ 추천 후보 없음 (적격자 0명)');
    await prisma.$disconnect();
    return;
  }
  const c = res.candidate as any;
  const seed = c.email?.startsWith('seed_');
  console.log('▶ 테스트 뷰어: 남 · 서울 · 31 · finance');
  console.log('── 오늘의 추천 ──');
  console.log('  대상:', seed ? c.email.replace('@theone.app', '') : '(시드 아님)');
  console.log('  성별:', c.gender, '| 직업:', c.profile?.jobDetail ?? c.jobCategory);
  console.log('  지역:', c.profile?.region, '| 사진 수:', c.profile?.photos?.length ?? 0);
  console.log('  뱃지:', (c.badges ?? []).map((b: any) => b.type).join(',') || '없음');
  if (res.breakdown) console.log('  케미 종합:', res.breakdown.overall + '%');
  console.log(
    '  사진[0] 형식:',
    (c.profile?.photos?.[0] ?? '').slice(0, 30) + (c.profile?.photos?.[0] ? '…' : '(없음)'),
  );
  console.log(
    seed && (c.profile?.photos?.length ?? 0) > 0
      ? '\n✔ 시드 회원이 사진과 함께 추천됨'
      : '\n✗ 기대와 다름',
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
