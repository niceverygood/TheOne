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

/** 만남 신청 수락 시 대화 개설 */
export async function openConversation(matchId: string) {
  return prisma.conversation.upsert({
    where: { matchId },
    create: { matchId },
    update: {},
  });
}
