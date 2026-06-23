/**
 * 연락처 오픈(번호오픈 MVP) — 매칭 성사(accepted) 후 양측이 동의하면 서로 번호 공개.
 * 각 측 동의(agreedAt)가 PIPA 제3자 제공 동의 기록. 요청 측이 크레딧 차감(여성 무료).
 */
import { prisma } from './index';
import { contactOpenCost } from '@theone/shared';
import { spendForContact } from './economy';

export type ContactState = 'none' | 'requested_by_me' | 'requested_by_them' | 'opened';

export interface ContactStatus {
  state: ContactState;
  myAgreed: boolean;
  otherAgreed: boolean;
  /** 공개 완료 시 상대 전화번호 */
  otherPhone: string | null;
  /** 내가 동의 시 차감될(또는 차감된) 크레딧 */
  cost: number;
}

async function loadMatch(matchId: string) {
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    select: { fromId: true, toId: true, status: true },
  });
  if (!m) throw new Error('match_not_found');
  return m;
}

function sideOf(m: { fromId: string; toId: string }, actorId: string) {
  if (m.fromId === actorId) return 'from' as const;
  if (m.toId === actorId) return 'to' as const;
  throw new Error('forbidden');
}

async function buildStatus(matchId: string, actorId: string): Promise<ContactStatus> {
  const m = await loadMatch(matchId);
  const side = sideOf(m, actorId);
  const co = await prisma.contactOpen.findUnique({ where: { matchId } });
  const myAgreed = !!(side === 'from' ? co?.fromAgreedAt : co?.toAgreedAt);
  const otherAgreed = !!(side === 'from' ? co?.toAgreedAt : co?.fromAgreedAt);
  const opened = !!co?.openedAt;
  const actor = await prisma.user.findUnique({ where: { id: actorId }, select: { gender: true } });

  let otherPhone: string | null = null;
  if (opened) {
    const otherId = side === 'from' ? m.toId : m.fromId;
    const other = await prisma.user.findUnique({ where: { id: otherId }, select: { phone: true } });
    otherPhone = other?.phone ?? null;
  }
  const state: ContactState = opened
    ? 'opened'
    : myAgreed
      ? 'requested_by_me'
      : otherAgreed
        ? 'requested_by_them'
        : 'none';
  return { state, myAgreed, otherAgreed, otherPhone, cost: contactOpenCost(actor?.gender) };
}

/** 현재 연락처 오픈 상태(상대 번호는 공개 완료 시에만). */
export async function getContactStatus(matchId: string, actorId: string): Promise<ContactStatus> {
  return buildStatus(matchId, actorId);
}

/**
 * 연락처 오픈 동의(요청) — 내 측 동의 기록 + (최초 동의 시) 크레딧 차감.
 * 양측 동의가 차면 openedAt 설정 → 번호 공개. 매칭이 accepted 상태여야 함.
 */
export async function requestContactOpen(matchId: string, actorId: string): Promise<ContactStatus> {
  const m = await loadMatch(matchId);
  const side = sideOf(m, actorId);
  if (m.status !== 'accepted') throw new Error('match_not_accepted');

  await prisma.$transaction(async (tx) => {
    const existing = await tx.contactOpen.findUnique({ where: { matchId } });
    const alreadyAgreed = side === 'from' ? existing?.fromAgreedAt : existing?.toAgreedAt;
    if (existing?.openedAt) return; // 이미 공개됨 — 멱등

    // 최초 동의 시에만 차감(여성 무료). 재호출/상대 대기 중 재탭은 무료.
    if (!alreadyAgreed) await spendForContact(actorId, matchId, tx);

    const setMine = side === 'from' ? { fromAgreedAt: new Date() } : { toAgreedAt: new Date() };
    const co = await tx.contactOpen.upsert({
      where: { matchId },
      create: { matchId, ...setMine },
      update: setMine,
    });
    if (!co.openedAt && co.fromAgreedAt && co.toAgreedAt) {
      await tx.contactOpen.update({ where: { matchId }, data: { openedAt: new Date() } });
    }
  });

  return buildStatus(matchId, actorId);
}
