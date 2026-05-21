/**
 * 큐레이션 매칭 (Phase 5) — packages/shared 룰을 DB에 적용.
 * 같은 광역시도 ±인접 + 나이 ±5 + 인증 뱃지 매치로 오늘의 1명 선택 후 CurationLog 기록.
 */
import { prisma } from './index';
import {
  ageFromBirth,
  pickTodayCuration,
  scoreCandidate,
  type Candidate,
  type VerificationType,
} from '@theone/shared';

interface UserForMatch {
  id: string;
  region: string;
  age: number;
  badges: VerificationType[];
}

async function loadUserForMatch(userId: string): Promise<UserForMatch | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: { select: { region: true } }, badges: { select: { type: true } } },
  });
  if (!u || !u.birth) return null;
  return {
    id: u.id,
    region: u.profile?.region ?? '서울',
    age: ageFromBirth(u.birth),
    badges: u.badges.map((b) => b.type),
  };
}

/**
 * 오늘의 큐레이션 후보 선정. 이미 오늘 발송됐으면 그 후보를 반환.
 * 활동 회원 중 이성 + 미발송(과거 제외) 대상에서 룰 점수 최고를 고른다.
 */
export async function getTodayCuration(userId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const existing = await prisma.curationLog.findFirst({
    where: { userId, sentAt: { gte: startOfToday } },
    orderBy: { sentAt: 'desc' },
  });
  if (existing) {
    const cand = await prisma.user.findUnique({
      where: { id: existing.candidateId },
      include: { profile: true, badges: true },
    });
    return { log: existing, candidate: cand };
  }

  const viewer = await loadUserForMatch(userId);
  if (!viewer) return null;

  // 과거 노출한 후보 제외
  const seen = await prisma.curationLog.findMany({
    where: { userId },
    select: { candidateId: true },
  });
  const seenIds = new Set(seen.map((s) => s.candidateId));

  const oppGender =
    (await prisma.user.findUnique({ where: { id: userId } }))?.gender === 'male'
      ? 'female'
      : 'male';

  const pool = await prisma.user.findMany({
    where: {
      status: 'active',
      gender: oppGender,
      id: { notIn: [userId, ...seenIds] },
      birth: { not: null },
    },
    include: { profile: { select: { region: true } }, badges: { select: { type: true } } },
    take: 500,
  });

  const candidates = pool
    .filter((p) => p.birth)
    .map((p) => ({
      raw: p,
      cand: {
        region: p.profile?.region ?? '서울',
        age: ageFromBirth(p.birth!),
        badges: p.badges.map((b) => b.type) as VerificationType[],
      } as Candidate,
    }));

  const viewerCand: Candidate = { region: viewer.region, age: viewer.age, badges: viewer.badges };
  const best = pickTodayCuration(
    viewerCand,
    candidates.map((c) => c.cand),
  );
  if (!best) return null;

  const chosen = candidates.find((c) => c.cand === best)!;
  const score = scoreCandidate(viewerCand, best);

  const log = await prisma.curationLog.create({
    data: { userId, candidateId: chosen.raw.id, action: 'sent', score },
  });
  return { log, candidate: chosen.raw };
}

/** 큐레이션 반응 기록 (viewed/passed/liked/superliked) */
export async function recordCurationAction(
  logId: string,
  action: 'viewed' | 'passed' | 'liked' | 'superliked',
) {
  return prisma.curationLog.update({
    where: { id: logId },
    data: { action, viewedAt: new Date() },
  });
}

/** CRON: 활동 회원 전원에게 오늘의 큐레이션 발송. 발송 건수 반환. */
export async function runDailyCuration(): Promise<{ sent: number; skipped: number }> {
  const users = await prisma.user.findMany({ where: { status: 'active' }, select: { id: true } });
  let sent = 0;
  let skipped = 0;
  for (const u of users) {
    const res = await getTodayCuration(u.id);
    if (res?.log) sent++;
    else skipped++;
  }
  return { sent, skipped };
}
