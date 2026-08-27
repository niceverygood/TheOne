import { NextRequest, NextResponse } from 'next/server';
import {
  curationCardsPerSlot,
  curationNextSlotAt,
  curationQuotaNow,
  curationSlotHours,
  getCurationReveal,
  getTodayCurations,
  slicePhotosForReveal,
} from '@theone/db';
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
    // 사진은 공개 단계(기본 1장 → 별점 3+ 2장 → 상호 3장 → 매칭 전체)만큼만 내려준다.
    const items = await Promise.all(
      list
        .filter((r) => r.candidate)
        .map(async (r) => {
          const c = r.candidate!;
          const intro = (c.profile?.introSections ?? null) as Partial<IntroSections> | null;
          const allPhotos = c.profile?.photos ?? [];
          const reveal = await getCurationReveal(userId, c.id);
          const photos = slicePhotosForReveal(allPhotos, reveal.count);
          return {
            logId: r.log.id,
            myRating: reveal.myRating,
            reveal: {
              count: photos.length,
              total: allPhotos.length,
              liked: reveal.liked,
              mutual: reveal.mutual,
              matched: reveal.matched,
            },
            candidate: {
              id: c.id,
              region: c.profile?.region ?? null,
              age: c.birth ? ageFromBirth(c.birth) : null,
              jobCategory: c.jobCategory,
              jobDetail: c.profile?.jobDetail?.trim() ? c.profile.jobDetail.trim() : null,
              photos,
              photosTotal: allPhotos.length,
              badgeCount: c.badges?.length ?? 0,
              quote: intro?.about?.trim() ? intro.about.trim() : null,
            },
            chemistry: r.breakdown
              ? { overall: r.breakdown.overall, axes: chemistryAxes(r.breakdown) }
              : null,
          };
        }),
    );

    // 카드는 정해진 시각(12·15·20시 KST)에 한 장씩 열린다 — 다음 도착 시각을 함께 내려준다.
    const slots = {
      hours: curationSlotHours(),
      perSlot: curationCardsPerSlot(),
      released: curationQuotaNow(),
      nextAt: curationNextSlotAt().toISOString(),
    };

    // 아직 열린 카드 없음(첫 슬롯 전) 또는 후보 없음
    if (items.length === 0) {
      return NextResponse.json({ ok: true, candidate: null, chemistry: null, items: [], slots });
    }
    // 하위호환: candidate/chemistry = 첫 후보. 신규 클라는 items[] 로 N명 수신.
    return NextResponse.json({
      ok: true,
      candidate: items[0]!.candidate,
      chemistry: items[0]!.chemistry,
      items,
      slots,
    });
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'server', message: '큐레이션을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
