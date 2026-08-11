import { NextRequest, NextResponse } from 'next/server';
import { getCurationReveal, listReceivedMatches, slicePhotosForReveal } from '@theone/db';
import { ageFromBirth } from '@theone/shared';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/match/received — 받은 만남 신청 목록(대기중).
 * 식별정보(이름) 제외, 발신자 직업·나이·지역·사진·뱃지수만 노출.
 * 사진은 공개 단계(별점 상호작용 기준)만큼만 내려준다 — 수락 전엔 전체 비공개.
 */
export async function GET(req: NextRequest) {
  const userId = authUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }
  try {
    const rows = await listReceivedMatches(userId);
    const matches = await Promise.all(
      rows.map(async (m) => {
        const reveal = await getCurationReveal(userId, m.from.id);
        return {
          matchId: m.id,
          letter: m.letter ?? null,
          isSuper: m.isSuper,
          conversationId: m.conversation?.id ?? null,
          from: {
            jobCategory: m.from.jobCategory,
            jobDetail: m.from.profile?.jobDetail ?? null,
            age: m.from.birth ? ageFromBirth(m.from.birth) : null,
            region: m.from.profile?.region ?? null,
            photos: slicePhotosForReveal(m.from.profile?.photos ?? [], reveal.count),
            badgeCount: m.from.badges?.length ?? 0,
          },
        };
      }),
    );
    return NextResponse.json({ ok: true, matches });
  } catch {
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
