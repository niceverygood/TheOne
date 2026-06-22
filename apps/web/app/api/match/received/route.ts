import { NextRequest, NextResponse } from 'next/server';
import { listReceivedMatches } from '@theone/db';
import { ageFromBirth } from '@theone/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/match/received?userId= — 받은 만남 신청 목록(대기중).
 * 식별정보(이름) 제외, 발신자 직업·나이·지역·사진·뱃지수만 노출.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')?.trim();
  if (!userId) {
    return NextResponse.json({ ok: false, reason: 'validation' }, { status: 400 });
  }
  try {
    const rows = await listReceivedMatches(userId);
    const matches = rows.map((m) => ({
      matchId: m.id,
      letter: m.letter ?? null,
      isSuper: m.isSuper,
      conversationId: m.conversation?.id ?? null,
      from: {
        jobCategory: m.from.jobCategory,
        jobDetail: m.from.profile?.jobDetail ?? null,
        age: m.from.birth ? ageFromBirth(m.from.birth) : null,
        region: m.from.profile?.region ?? null,
        photos: m.from.profile?.photos ?? [],
        badgeCount: m.from.badges?.length ?? 0,
      },
    }));
    return NextResponse.json({ ok: true, matches });
  } catch {
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
