import { NextRequest, NextResponse } from 'next/server';
import { blockUser, unblockUser } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/safety/block
 * body: { blockerId, blockedId, unblock? }
 * 사용자 간 차단/해제. 차단 시 양방향으로 큐레이션·매칭·채팅 노출에서 제외된다.
 * 모바일 채팅·프로필 안전 메뉴의 '차단하기' 진입점.
 */
export async function POST(req: NextRequest) {
  let body: { blockerId?: string; blockedId?: string; unblock?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_json' }, { status: 400 });
  }

  const { blockerId, blockedId, unblock } = body;
  if (!blockerId || !blockedId) {
    return NextResponse.json({ ok: false, reason: 'missing_ids' }, { status: 400 });
  }

  try {
    if (unblock) {
      await unblockUser({ blockerId, blockedId });
    } else {
      await blockUser({ blockerId, blockedId });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[safety/block] failed', e);
    const reason = e instanceof Error && e.message === 'cannot_block_self' ? 'self' : 'server';
    return NextResponse.json({ ok: false, reason }, { status: reason === 'self' ? 400 : 500 });
  }
}
