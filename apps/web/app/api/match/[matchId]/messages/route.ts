import { NextRequest, NextResponse } from 'next/server';
import { getMatchContextForUser, getMessages, sendMessage, hydrateCandidate } from '@theone/db';
import { authUserId } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LEN = 1000;

/**
 * GET /api/match/[matchId]/messages?after=<messageId>
 * 채팅 v1(폴링). 요청자는 이 매칭의 당사자여야 한다(IDOR 차단).
 * 상대(partner) 표시 정보도 함께 반환해 chat.tsx 가 별도 프로필 호출 없이 헤더를 그릴 수 있게 한다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } },
): Promise<NextResponse> {
  const actorId = authUserId(req);
  if (!actorId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  try {
    const ctx = await getMatchContextForUser(params.matchId, actorId);
    if (!ctx) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });

    const after = req.nextUrl.searchParams.get('after') ?? undefined;
    const [messages, { candidate }] = await Promise.all([
      getMessages(ctx.conversationId, after),
      hydrateCandidate(ctx.partnerId, []),
    ]);

    return NextResponse.json({
      ok: true,
      messages: messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
      partner: candidate
        ? {
            id: candidate.id,
            jobCategory: candidate.jobCategory,
            jobDetail: candidate.profile?.jobDetail?.trim() || null,
            region: candidate.profile?.region ?? null,
            photos: candidate.profile?.photos ?? [],
            badgeCount: candidate.badges?.length ?? 0,
          }
        : null,
    });
  } catch (e) {
    console.error('[match/:matchId/messages GET] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}

/** POST /api/match/[matchId]/messages — body: { text }. 외부 연락처는 서버에서 마스킹 후 저장. */
export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } },
): Promise<NextResponse> {
  const actorId = authUserId(req);
  if (!actorId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) return NextResponse.json({ ok: false, reason: 'empty' }, { status: 400 });
  if (text.length > MAX_LEN) {
    return NextResponse.json({ ok: false, reason: 'too_long' }, { status: 400 });
  }

  try {
    const ctx = await getMatchContextForUser(params.matchId, actorId);
    if (!ctx) return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });

    const message = await sendMessage({
      conversationId: ctx.conversationId,
      senderId: actorId,
      body: text,
    });
    return NextResponse.json({
      ok: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        text: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error('[match/:matchId/messages POST] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
