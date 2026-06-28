/**
 * 큐레이션 매칭 (Phase 5) — packages/shared 룰을 DB에 적용.
 * 가치관 60문항 일치도(단일 최대 가중치) + 광역시도 ±인접 + 나이 ±5 + 인증 뱃지로
 * 오늘의 1명 선택 후 CurationLog에 점수·케미를 스냅샷.
 */
import { prisma } from './index';
import {
  ageFromBirth,
  isEligible,
  scoreCandidate,
  surveyAlignment,
  surveyBreakdown,
  toAdjacencyKey,
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

  // 발신자가 정지/강퇴/탈퇴 상태면 발송 불가(활동 회원만 신청 가능).
  const sender = await prisma.user.findUnique({
    where: { id: fromId },
    select: { status: true, gender: true },
  });
  if (!sender || sender.status !== 'active') throw new Error('sender_inactive');

  // 수신자 유효성(M2) — body 의 toId 를 신뢰하지 않는다. 실재·활동·이성 회원만 대상.
  // (비활성·탈퇴·동성·존재안함 회원에게 편지가 꽂히는 것을 차단)
  const recipient = await prisma.user.findUnique({
    where: { id: toId },
    select: { status: true, gender: true },
  });
  if (!recipient || recipient.status !== 'active') throw new Error('recipient_unavailable');
  if (recipient.gender === sender.gender) throw new Error('recipient_unavailable');

  // 차단 관계(양방향)면 발송 불가
  const blocked = await listBlockedIds(fromId);
  if (blocked.includes(toId)) throw new Error('blocked');

  // 같은 상대에게 이미 대기중 신청서가 있으면 중복 발송 차단(빠른 경로).
  // 동시성 보증은 부분 unique 인덱스(matches_from_to_pending_uniq) — 레이스 시 P2002.
  const dup = await prisma.match.findFirst({
    where: { fromId, toId, status: 'pending' },
    select: { id: true },
  });
  if (dup) throw new Error('already_sent');

  try {
    return await prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: { fromId, toId, letter, isSuper, status: 'pending' },
      });
      const spend = await spendForLetter(fromId, isSuper, match.id, tx);
      return { matchId: match.id, spent: spend.spent, free: spend.free };
    });
  } catch (e) {
    // 동시 중복발송(부분 unique 충돌) → 멱등하게 already_sent 로 변환(트랜잭션 롤백 → 크레딧 미차감).
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      throw new Error('already_sent');
    }
    throw e;
  }
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
      // 만료된 인증 뱃지는 매칭 점수에서 제외(유효기간 1년).
      badges: { where: { expiresAt: { gt: new Date() } }, select: { type: true } },
    },
  });
  if (!u || !u.birth) return null;
  return {
    id: u.id,
    // 저장값(영문 슬러그)을 인접그래프 키(한글 시도)로 정규화 — 안 하면 지역필터/가산이 죽는다.
    region: toAdjacencyKey(u.profile?.region) || '서울',
    age: ageFromBirth(u.birth),
    badges: u.badges.map((b) => b.type),
    survey: u.profile?.surveyAnswers ?? [],
  };
}

/** 하루 큐레이션 수 — env CURATION_PER_DAY(기본 1, 1~5). 풀 부족 시 자동 축소(안전). */
const CURATION_PER_DAY = Math.max(1, Math.min(5, Number(process.env.CURATION_PER_DAY) || 1));

/** 후보 1명을 화면용(profile·badges 포함)으로 로드 + 케미 3축 계산. */
async function hydrateCandidate(candidateId: string, viewerSurvey: number[]) {
  const candidate = await prisma.user.findUnique({
    where: { id: candidateId },
    include: { profile: true, badges: true },
  });
  const breakdown = surveyBreakdown(viewerSurvey, candidate?.profile?.surveyAnswers ?? []);
  return { candidate, breakdown };
}

/**
 * 오늘의 큐레이션 목록 — 하루 최대 CURATION_PER_DAY 명. 이미 오늘 만든 건 그대로 두고,
 * 모자라면 점수순으로 새 후보를 골라 CurationLog 에 스냅샷한다(본인·과거·차단·동성 제외).
 * 풀이 부족하면 만들 수 있는 만큼만 — 데드엔드 대신 자연 축소. 점수 동점은 입력 순서.
 */
export async function getTodayCurations(userId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const viewer = await loadUserForMatch(userId);
  const viewerSurvey = viewer?.survey ?? [];

  // 오늘 이미 만들어진 큐레이션부터 복원
  const todayLogs = await prisma.curationLog.findMany({
    where: { userId, sentAt: { gte: startOfToday } },
    orderBy: { sentAt: 'asc' },
  });
  const items: {
    log: (typeof todayLogs)[number];
    candidate: Awaited<ReturnType<typeof hydrateCandidate>>['candidate'];
    breakdown: ReturnType<typeof surveyBreakdown>;
  }[] = [];
  for (const log of todayLogs) {
    const { candidate, breakdown } = await hydrateCandidate(log.candidateId, viewerSurvey);
    items.push({ log, candidate, breakdown });
  }

  // 부족분을 점수순으로 채움
  if (viewer && items.length < CURATION_PER_DAY) {
    const seen = await prisma.curationLog.findMany({
      where: { userId },
      select: { candidateId: true },
    });
    const seenIds = new Set(seen.map((s) => s.candidateId));
    const self = await prisma.user.findUnique({ where: { id: userId }, select: { gender: true } });
    const oppGender = self?.gender === 'male' ? 'female' : 'male';
    // 차단 관계(양방향)는 후보 풀에서 제외.
    const blockedIds = await listBlockedIds(userId);

    const pool = await prisma.user.findMany({
      where: {
        status: 'active',
        gender: oppGender,
        id: { notIn: [userId, ...seenIds, ...blockedIds] },
        birth: { not: null },
      },
      include: {
        profile: { select: { region: true, surveyAnswers: true } },
        badges: { where: { expiresAt: { gt: new Date() } }, select: { type: true } },
      },
      take: 500,
    });

    const viewerCand: Candidate = {
      region: viewer.region,
      age: viewer.age,
      badges: viewer.badges,
      survey: viewer.survey,
    };
    const candidates = pool
      .filter((p) => p.birth)
      .map((p) => ({
        raw: p,
        cand: {
          region: toAdjacencyKey(p.profile?.region) || '서울',
          age: ageFromBirth(p.birth!),
          badges: p.badges.map((b) => b.type) as VerificationType[],
          survey: p.profile?.surveyAnswers ?? [],
        } as Candidate,
      }));

    // 적격(지역·나이) 우선, 적격자 없으면 콜드스타트 폴백으로 전체 — 둘 다 점수 내림차순.
    const eligible = candidates.filter((c) => isEligible(viewerCand, c.cand));
    const ranked = (eligible.length ? eligible : candidates)
      .map((c) => ({ c, s: scoreCandidate(viewerCand, c.cand) }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);

    for (const chosen of ranked.slice(0, CURATION_PER_DAY - items.length)) {
      const score = scoreCandidate(viewerCand, chosen.cand);
      const chemistry = surveyAlignment(viewerCand.survey, chosen.cand.survey);
      const log = await prisma.curationLog.create({
        data: { userId, candidateId: chosen.raw.id, action: 'sent', score, chemistry },
      });
      const { candidate, breakdown } = await hydrateCandidate(chosen.raw.id, viewerSurvey);
      items.push({ log, candidate, breakdown });
    }
  }

  return items;
}

/**
 * 오늘의 큐레이션 1명(히어로) — 하위호환. 목록의 첫 후보.
 * 활동 회원 중 이성 + 미발송(과거 제외) 대상에서 룰 점수 최고를 고른다.
 */
export async function getTodayCuration(userId: string) {
  const items = await getTodayCurations(userId);
  return items[0] ?? null;
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
    const items = await getTodayCurations(u.id);
    if (items.length) sent += items.length;
    else skipped++;
  }
  return { sent, skipped };
}
