/**
 * 채팅 v1 (Phase 5). 폴링 기반 MVP — 외부 연락처 자동 마스킹.
 * (실시간 Pusher/Ably 전환은 사용량 보고 v1.1)
 */
import { prisma } from './index';
import { maskExternalContact } from '@theone/shared';

/** 메시지 전송 — 매칭 성사(accepted) 전제. 외부 연락처 마스킹 후 저장. */
export async function sendMessage(args: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  const { text, masked } = maskExternalContact(args.body);
  return prisma.message.create({
    data: { conversationId: args.conversationId, senderId: args.senderId, body: text, masked },
  });
}

/** 폴링 조회 — sinceId 이후 메시지 */
export async function getMessages(conversationId: string, afterId?: string) {
  return prisma.message.findMany({
    where: { conversationId, ...(afterId ? { id: { gt: afterId } } : {}) },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
}

/**
 * 채팅 화면 진입 컨텍스트 — matchId 로 대화방·상대(partnerId)를 찾고,
 * 요청자가 이 매칭의 당사자(fromId/toId)인지 검증한다(IDOR 차단).
 * 매칭이 수락 상태 + 대화 개설 전이면 null(아직 채팅 불가).
 */
export async function getMatchContextForUser(matchId: string, actorId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { fromId: true, toId: true, status: true, conversation: { select: { id: true } } },
  });
  if (!match) return null;
  if (match.fromId !== actorId && match.toId !== actorId) return null;
  if (match.status !== 'accepted' || !match.conversation) return null;
  const partnerId = match.fromId === actorId ? match.toId : match.fromId;
  return { conversationId: match.conversation.id, partnerId };
}

/** 만남 신청 수락 시 대화 개설 */
export async function openConversation(matchId: string) {
  return prisma.conversation.upsert({
    where: { matchId },
    create: { matchId },
    update: {},
  });
}

/** 받은 만남 신청 목록 — 수신자(toId) 기준. 발신자 프로필(사진·직업·지역·뱃지) 포함. */
export async function listReceivedMatches(
  userId: string,
  status: 'pending' | 'accepted' | 'declined' = 'pending',
) {
  return prisma.match.findMany({
    where: { toId: userId, status },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      letter: true,
      isSuper: true,
      createdAt: true,
      conversation: { select: { id: true } },
      from: {
        select: {
          id: true,
          jobCategory: true,
          birth: true,
          profile: { select: { region: true, jobDetail: true, photos: true } },
          badges: { where: { expiresAt: { gt: new Date() } }, select: { type: true } },
        },
      },
    },
  });
}

/**
 * 받은 신청 응답 — 수락 시 status=accepted + 대화 개설(원자적), 거절 시 status=declined.
 * 수신자(toId) 본인만 응답 가능. 이미 처리된 신청은 거부.
 */
export async function respondToMatch(
  matchId: string,
  actorId: string,
  action: 'accept' | 'decline',
): Promise<{ status: 'accepted' | 'declined'; conversationId: string | null }> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { toId: true, status: true },
  });
  if (!match) throw new Error('match_not_found');
  if (match.toId !== actorId) throw new Error('forbidden'); // 수신자만 응답 가능
  if (match.status !== 'pending') throw new Error(`already_${match.status}`);

  if (action === 'decline') {
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'declined', endedAt: new Date() },
    });
    return { status: 'declined', conversationId: null };
  }

  const conv = await prisma.$transaction(async (tx) => {
    await tx.match.update({ where: { id: matchId }, data: { status: 'accepted' } });
    return tx.conversation.upsert({ where: { matchId }, create: { matchId }, update: {} });
  });
  return { status: 'accepted', conversationId: conv.id };
}
