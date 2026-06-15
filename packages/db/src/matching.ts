/**
 * 큐레이션 매칭 (Phase 5) — packages/shared 룰을 DB에 적용.
 * 가치관 60문항 일치도(단일 최대 가중치) + 광역시도 ±인접 + 나이 ±5 + 인증 뱃지로
 * 오늘의 1명 선택 후 CurationLog에 점수·케미를 스냅샷.
 */
import { prisma } from './index';
import {
  ageFromBirth,
  pickTodayCuration,
  scoreCandidate,
  surveyAlignment,
  surveyBreakdown,
  type Candidate,
  type VerificationType,
} from '@theone/shared';
import { spendForLetter } from './economy';
import { listBlockedIds } from './safety';

/** 만남 신청서 최소 분량 (모바일 UI 정책과 일치). */
const LETTER_MIN_LEN = 80;

/**
 * 만남 신청서 발송 — 검증 → 크레딧 차감(여성 무료) → Match(pending) 생성, 원자적.
 * 차감 실패(잔액 부족)면 트랜잭션 롤백으로 Match 도 생성되지 않는다.
 */
export async function sendLetter(args: {
  fromId: string;
  toId: string;
  letter: string;
  isSuper?: boolean;
}): Promise<{ matchId: string; spent: number; free: boolean }> {
  const { fromId, toId, isSuper = false } = args;
  const letter = (args.letter ?? '').trim();
  if (fromId === toId) throw new Error('cannot_letter_self');
  if (letter.length < LETTER_MIN_LEN) throw new Error('letter_too_short');

  // 차단 관계(양방향)면 발송 불가
  const blocked = await listBlockedIds(fromId);
  if (blocked.includes(toId)) throw new Error('blocked');

  // 같은 상대에게 이미 대기중 신청서가 있으면 중복 발송 차단
  const dup = await prisma.match.findFirst({
    where: { fromId, toId, status: 'pending' },
    select: { id: true },
  });
  if (dup) throw new Error('already_sent');

  return prisma.$transaction(async (tx) => {
    const match = await tx.match.create({
      data: { fromId, toId, letter, isSuper, status: 'pending' },
    });
    const spend = await spendForLetter(fromId, isSuper, match.id, tx);
    return { matchId: match.id, spent: spend.spent, free: spend.free };
  });
}

interface UserForMatch {
  id: string;
  region: string;
  age: number;
  badges: VerificationType[];
  survey: number[];
}

async function loadUserForMatch(userId: string): Promise<UserForMatch | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: { select: { region: true, surveyAnswers: true } },
      badges: { select: { type: true } },
    },
  });
  if (!u || !u.birth) return null;
  return {
    id: u.id,
    region: u.profile?.region ?? '서울',
    age: ageFromBirth(u.birth),
    badges: u.badges.map((b) => b.type),
    survey: u.profile?.surveyAnswers ?? [],
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
    // 케미 분해는 발송 시 score/chemistry 와 함께 결정되지만, 화면 노출용 3축은
    // 뷰어·상대 설문으로 다시 계산한다(설문 변경이 드물어 비용 무시 가능).
    const viewerSurvey =
      (
        await prisma.profile.findUnique({
          where: { userId },
          select: { surveyAnswers: true },
        })
      )?.surveyAnswers ?? [];
    const breakdown = surveyBreakdown(viewerSurvey, cand?.profile?.surveyAnswers ?? []);
    return { log: existing, candidate: cand, breakdown };
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
    include: {
      profile: { select: { region: true, surveyAnswers: true } },
      badges: { select: { type: true } },
    },
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
        survey: p.profile?.surveyAnswers ?? [],
      } as Candidate,
    }));

  const viewerCand: Candidate = {
    region: viewer.region,
    age: viewer.age,
    badges: viewer.badges,
    survey: viewer.survey,
  };
  const best = pickTodayCuration(
    viewerCand,
    candidates.map((c) => c.cand),
  );
  if (!best) return null;

  const chosen = candidates.find((c) => c.cand === best)!;
  const score = scoreCandidate(viewerCand, best);
  const chemistry = surveyAlignment(viewerCand.survey, best.survey);
  const breakdown = surveyBreakdown(viewerCand.survey, best.survey);

  const log = await prisma.curationLog.create({
    data: { userId, candidateId: chosen.raw.id, action: 'sent', score, chemistry },
  });
  // 기존 분기와 동일한 full include 로 반환해 candidate 모양을 통일한다.
  const candidate = await prisma.user.findUnique({
    where: { id: chosen.raw.id },
    include: { profile: true, badges: true },
  });
  return { log, candidate, breakdown };
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
