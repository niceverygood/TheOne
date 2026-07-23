import { NextRequest, NextResponse } from 'next/server';
import { getCandidateForViewer } from '@theone/db';
import { ageFromBirth, chemistryAxes, type IntroSections } from '@theone/shared';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/profile/[userId]
 * 큐레이션·인박스 밖(프로필 상세, 만남 신청서 작성)에서 특정 회원 1명을 조회한다.
 * 응답 형태는 /api/curation/today 의 candidate 와 동일(직접식별정보 제외).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
): Promise<NextResponse> {
  const viewerId = authUserId(req);
  if (!viewerId) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await getCandidateForViewer(params.userId, viewerId);
    if (!result?.candidate) {
      return NextResponse.json({ ok: false, reason: 'not_found' }, { status: 404 });
    }
    const c = result.candidate;
    const intro = (c.profile?.introSections ?? null) as Partial<IntroSections> | null;
    return NextResponse.json({
      ok: true,
      candidate: {
        id: c.id,
        region: c.profile?.region ?? null,
        age: c.birth ? ageFromBirth(c.birth) : null,
        jobCategory: c.jobCategory,
        jobDetail: c.profile?.jobDetail?.trim() ? c.profile.jobDetail.trim() : null,
        photos: c.profile?.photos ?? [],
        badgeCount: c.badges?.length ?? 0,
        quote: intro?.about?.trim() ? intro.about.trim() : null,
      },
      chemistry: result.breakdown
        ? { overall: result.breakdown.overall, axes: chemistryAxes(result.breakdown) }
        : null,
    });
  } catch (e) {
    console.error('[profile/:userId] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
