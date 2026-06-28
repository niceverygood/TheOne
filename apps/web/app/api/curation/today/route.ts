import { NextRequest, NextResponse } from 'next/server';
import { getTodayCurations } from '@theone/db';
import { ageFromBirth, chemistryAxes, type IntroSections } from '@theone/shared';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * 오늘의 큐레이션 1명 조회 — 모바일 도시에가 케미(가치관 일치도)를 노출하는 데 사용.
 * 이름 등 직접식별정보는 반환하지 않는다(privacy-design §2-4). 뱃지·케미만 노출.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = authUserId(req);
  if (!userId) {
    return NextResponse.json(
      { ok: false, reason: 'unauthorized', message: '인증이 필요합니다.' },
      { status: 401 },
    );
  }

  try {
    const list = await getTodayCurations(userId);

    // 각 후보를 화면용으로 변환(직접식별정보 제외 — 뱃지·케미만).
    const items = list
      .filter((r) => r.candidate)
      .map((r) => {
        const c = r.candidate!;
        const intro = (c.profile?.introSections ?? null) as Partial<IntroSections> | null;
        return {
          candidate: {
            region: c.profile?.region ?? null,
            age: c.birth ? ageFromBirth(c.birth) : null,
            jobCategory: c.jobCategory,
            jobDetail: c.profile?.jobDetail?.trim() ? c.profile.jobDetail.trim() : null,
            photos: c.profile?.photos ?? [],
            badgeCount: c.badges?.length ?? 0,
            quote: intro?.about?.trim() ? intro.about.trim() : null,
          },
          chemistry: r.breakdown
            ? { overall: r.breakdown.overall, axes: chemistryAxes(r.breakdown) }
            : null,
        };
      });

    // 후보 없음
    if (items.length === 0) {
      return NextResponse.json({ ok: true, candidate: null, chemistry: null, items: [] });
    }
    // 하위호환: candidate/chemistry = 첫 후보. 신규 클라는 items[] 로 N명 수신.
    return NextResponse.json({
      ok: true,
      candidate: items[0]!.candidate,
      chemistry: items[0]!.chemistry,
      items,
    });
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'server', message: '큐레이션을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
