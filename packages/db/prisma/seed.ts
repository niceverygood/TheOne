/**
 * 테스트 시드 — 운영자 3명(권한별), 더미 사용자 50명, 인증 신청 20건(승인10/반려5/대기5).
 * 실행: pnpm --filter @theone/db exec prisma db seed   (DATABASE_URL 필요)
 */
import { PrismaClient } from '@prisma/client';
import type { VerificationType } from '@prisma/client';

const prisma = new PrismaClient();

const SLA_HOURS = 24;
const slaDue = (from: Date) => new Date(from.getTime() + SLA_HOURS * 3600_000);
const badgeExpiry = (from: Date) => {
  const d = new Date(from);
  d.setDate(d.getDate() + 365);
  return d;
};

const MALE_JOBS = ['legal', 'medical', 'finance', 'tech', 'founder'];
const FEMALE_JOBS = ['professional', 'broadcast', 'arts', 'fashion', 'finance'];
const TYPES: VerificationType[] = ['education', 'wealth', 'vehicle', 'realestate'];
const TIERS: Partial<Record<VerificationType, string[]>> = {
  wealth: ['5억~10억', '10억~30억', '30억~50억', '50억 이상'],
  realestate: ['10억 미만', '10억~30억', '30억~50억', '50억 이상'],
};

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]!;
}

async function main() {
  console.log('seeding…');

  // 1) 운영자 3명
  await prisma.operator.createMany({
    data: [
      { username: 'viewer1', name: '뷰어', role: 'viewer' },
      { username: 'reviewer1', name: '심사자', role: 'reviewer' },
      { username: 'admin1', name: '관리자', role: 'admin' },
    ],
    skipDuplicates: true,
  });
  const reviewer = await prisma.operator.findUnique({ where: { username: 'reviewer1' } });

  // 2) 사용자 50명 + 프로필
  const users = [];
  for (let i = 0; i < 50; i++) {
    const gender = i % 2 === 0 ? 'male' : 'female';
    const jobCategory = gender === 'male' ? pick(MALE_JOBS, i) : pick(FEMALE_JOBS, i);
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        gender,
        jobCategory,
        status: 'active',
        birth: new Date(1988 + (i % 12), i % 12, 1 + (i % 27)),
        ciHash: `ci_${i}_${Math.random().toString(36).slice(2, 10)}`,
        profile: {
          create: {
            photos: [`seed/portrait_${i}.svg`],
            bio: '시드 더미 자기소개입니다.',
            jobDetail: '시드 직무',
            region: pick(['서초', '강남', '한남', '판교', '분당'], i),
          },
        },
        credit: { create: { balance: 100 + i } },
      },
    });
    users.push(user);
  }

  // 3) 인증 신청 20건: 승인10 / 반려5 / 대기5
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const user = pick(users, i);
    const type = pick(TYPES, i);
    const tier = TIERS[type] ? pick(TIERS[type]!, i) : null;
    const submittedAt = new Date(now.getTime() - (i + 1) * 3600_000);

    const status = i < 10 ? 'approved' : i < 15 ? 'rejected' : i < 18 ? 'submitted' : 'reviewing';

    const app = await prisma.verificationApplication.create({
      data: {
        userId: user.id,
        type,
        valueTier: tier,
        status,
        submittedAt,
        slaDueAt: slaDue(submittedAt),
        reviewerId: status === 'approved' || status === 'rejected' ? reviewer?.id : null,
        reviewedAt: status === 'approved' || status === 'rejected' ? new Date() : null,
        rejectReason:
          status === 'rejected'
            ? '발급 7일 초과 — 최근 7일 이내 발급분으로 재제출해 주세요.'
            : null,
        documents: {
          create: [
            {
              s3Key: `verification/${user.id}/${type}/doc1.pdf`,
              label: '대표 서류',
              mime: 'application/pdf',
              size: 500_000 + i * 1000,
              sha256: `seedhash${i}`,
            },
          ],
        },
      },
    });

    if (status === 'approved') {
      await prisma.verificationBadge.upsert({
        where: { userId_type: { userId: user.id, type } },
        create: { userId: user.id, type, valueTier: tier, expiresAt: badgeExpiry(now) },
        update: {},
      });
      await prisma.accessLog.create({
        data: {
          operatorId: reviewer!.id,
          action: 'approve',
          applicationId: app.id,
          targetUserId: user.id,
        },
      });
    }
    if (status === 'rejected') {
      await prisma.accessLog.create({
        data: {
          operatorId: reviewer!.id,
          action: 'reject',
          applicationId: app.id,
          targetUserId: user.id,
        },
      });
    }
  }

  console.log('seed done: 3 operators, 50 users, 20 applications');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
