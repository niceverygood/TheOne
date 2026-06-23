import { NextRequest, NextResponse } from 'next/server';
import { blockUser, unblockUser } from '@theone/db';
import { authUserId } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/safety/block
 * body: { blockedId, unblock? }
 * 사용자 간 차단/해제. 차단 시 양방향으로 큐레이션·매칭·채팅 노출에서 제외된다.
 */
export async function POST(req: NextRequest) {
  const blockerId = authUserId(req);
  if (!blockerId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  let body: { blockedId?: string; unblock?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_json' }, { status: 400 });
  }

  const { blockedId, unblock } = body;
  if (!blockedId) {
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
