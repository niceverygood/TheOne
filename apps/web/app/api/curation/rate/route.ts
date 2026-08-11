import { NextRequest, NextResponse } from 'next/server';
import { rateCuration } from '@theone/db';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * POST /api/curation/rate — 오늘의 큐레이션 첫인상 별점(1~5).
 * body: { logId, rating }. 3점 이상 = 호감(liked).
 * 응답에 갱신된 사진 공개 단계(1→2→3→전체)와 공개 사진 목록을 돌려준다.
 */
export async function POST(req: NextRequest) {
  const userId = authUserId(req);
  if (!userId) return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    logId?: string;
    rating?: number;
  } | null;
  const logId = body?.logId;
  const rating = body?.rating;
  if (!logId || typeof rating !== 'number') {
    return NextResponse.json(
      { ok: false, reason: 'validation', message: 'logId와 rating(1~5)이 필요합니다.' },
      { status: 400 },
    );
  }
  try {
    const result = await rateCuration(logId, userId, rating);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const reason = (e as Error).message;
    if (reason === 'invalid_rating') {
      return NextResponse.json(
        { ok: false, reason: 'validation', message: '별점은 1~5점 사이여야 합니다.' },
        { status: 400 },
      );
    }
    if (reason === 'log_not_found') {
      return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });
    }
    if (reason === 'forbidden') {
      return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
    }
    return NextResponse.json(
      { ok: false, reason: 'server', message: '별점을 저장하지 못했습니다.' },
      { status: 500 },
    );
  }
}
