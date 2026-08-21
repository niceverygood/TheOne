import { NextRequest, NextResponse } from 'next/server';
import { getCurationHistory } from '@theone/db';
import { ageFromBirth, chemistryAxes, type IntroSections } from '@theone/shared';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/curation/history?cursor=<ISO>&limit=20&includeToday=1
 * 지난 카드 — 이미 소개됐던 후보 이력(최신순). 새 후보를 만들지 않는다.
 * 이름 등 직접식별정보는 반환하지 않고, 사진은 현재 공개 단계만큼만 내려준다.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = authUserId(req);
  if (!userId) {
    return NextResponse.json(
      { ok: false, reason: 'unauthorized', message: '인증이 필요합니다.' },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const rawCursor = url.searchParams.get('cursor');
  const cursor = rawCursor ? new Date(rawCursor) : null;
  if (cursor && Number.isNaN(cursor.getTime())) {
    return NextResponse.json(
      { ok: false, reason: 'validation', message: '커서가 올바르지 않습니다.' },
      { status: 400 },
    );
  }
  const limit = Number(url.searchParams.get('limit')) || 20;
  const includeToday = url.searchParams.get('includeToday') === '1';

  try {
    const { items, nextCursor } = await getCurationHistory(userId, { cursor, limit, includeToday });
    return NextResponse.json({
      ok: true,
      nextCursor: nextCursor ? nextCursor.toISOString() : null,
      items: items.map((it) => {
        const intro = (it.candidate.profile?.introSections ??
          null) as Partial<IntroSections> | null;
        return {
          logId: it.logId,
          sentAt: it.sentAt.toISOString(),
          myRating: it.myRating,
          letter: it.letter,
          reveal: {
            count: it.photos.length,
            total: it.photosTotal,
            liked: it.reveal.liked,
            mutual: it.reveal.mutual,
            matched: it.reveal.matched,
          },
          candidate: {
            id: it.candidate.id,
            region: it.candidate.profile?.region ?? null,
            age: it.candidate.birth ? ageFromBirth(it.candidate.birth) : null,
            jobCategory: it.candidate.jobCategory,
            jobDetail: it.candidate.profile?.jobDetail?.trim()
              ? it.candidate.profile.jobDetail.trim()
              : null,
            photos: it.photos,
            photosTotal: it.photosTotal,
            badgeCount: it.candidate.badges?.length ?? 0,
            quote: intro?.about?.trim() ? intro.about.trim() : null,
          },
          chemistry: it.breakdown
            ? { overall: it.breakdown.overall, axes: chemistryAxes(it.breakdown) }
            : null,
        };
      }),
    });
  } catch (e) {
    console.error('[curation/history] failed', e);
    return NextResponse.json(
      { ok: false, reason: 'server', message: '지난 카드를 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
