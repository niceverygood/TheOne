import { NextRequest, NextResponse } from 'next/server';
import { getTodayCuration } from '@theone/db';
import {
  ageFromBirth,
  chemistryAxes,
  type CurationTodayResult,
  type IntroSections,
} from '@theone/shared';

export const dynamic = 'force-dynamic';

/**
 * 오늘의 큐레이션 1명 조회 — 모바일 도시에가 케미(가치관 일치도)를 노출하는 데 사용.
 * 이름 등 직접식별정보는 반환하지 않는다(privacy-design §2-4). 뱃지·케미만 노출.
 */
export async function GET(req: NextRequest): Promise<NextResponse<CurationTodayResult>> {
  const userId = req.nextUrl.searchParams.get('userId')?.trim();
  if (!userId) {
    return NextResponse.json(
      { ok: false, reason: 'validation', message: '회원 식별자가 필요합니다.' },
      { status: 400 },
    );
  }

  try {
    const res = await getTodayCuration(userId);
    // 후보 없음(오늘 큐레이션 미발송/적합자 없음)
    if (!res?.candidate) {
      return NextResponse.json({ ok: true, candidate: null, chemistry: null });
    }

    const c = res.candidate;
    const intro = (c.profile?.introSections ?? null) as Partial<IntroSections> | null;
    const candidate = {
      region: c.profile?.region ?? null,
      age: c.birth ? ageFromBirth(c.birth) : null,
      jobCategory: c.jobCategory,
      jobDetail: c.profile?.jobDetail?.trim() ? c.profile.jobDetail.trim() : null,
      photos: c.profile?.photos ?? [],
      badgeCount: c.badges?.length ?? 0,
      quote: intro?.about?.trim() ? intro.about.trim() : null,
    };
    const chemistry = res.breakdown
      ? { overall: res.breakdown.overall, axes: chemistryAxes(res.breakdown) }
      : null;

    return NextResponse.json({ ok: true, candidate, chemistry });
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'server', message: '큐레이션을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
