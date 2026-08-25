import { NextRequest, NextResponse } from 'next/server';
import { browseMembers } from '@theone/db';
import { ageFromBirth, type IntroSections } from '@theone/shared';
import { authUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/members/browse?cursor=<ISO>&limit=20&region=서울&minAge=28&maxAge=42&verifiedOnly=1
 * 회원 둘러보기 — 큐레이션과 별개로 직접 찾아 만남을 신청하는 경로.
 * 이름 등 직접식별정보는 반환하지 않는다(privacy-design §2-4). 대표 사진 1장만 내려준다.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const userId = authUserId(req);
  if (!userId) {
    return NextResponse.json(
      { ok: false, reason: 'unauthorized', message: '인증이 필요합니다.' },
      { status: 401 },
    );
  }

  const q = new URL(req.url).searchParams;
  const rawCursor = q.get('cursor');
  const cursor = rawCursor ? new Date(rawCursor) : null;
  if (cursor && Number.isNaN(cursor.getTime())) {
    return NextResponse.json(
      { ok: false, reason: 'validation', message: '커서가 올바르지 않습니다.' },
      { status: 400 },
    );
  }
  const num = (v: string | null) => {
    const n = Number(v);
    return v != null && Number.isFinite(n) ? n : null;
  };

  try {
    const { items, nextCursor } = await browseMembers(userId, {
      cursor,
      limit: num(q.get('limit')) ?? 20,
      filters: {
        region: q.get('region'),
        minAge: num(q.get('minAge')),
        maxAge: num(q.get('maxAge')),
        verifiedOnly: q.get('verifiedOnly') === '1',
      },
    });

    return NextResponse.json({
      ok: true,
      nextCursor: nextCursor ? nextCursor.toISOString() : null,
      items: items.map(({ user: u, alreadyRequested }) => {
        const intro = (u.profile?.introSections ?? null) as Partial<IntroSections> | null;
        return {
          id: u.id,
          age: u.birth ? ageFromBirth(u.birth) : null,
          region: u.profile?.region ?? null,
          jobCategory: u.jobCategory,
          jobDetail: u.profile?.jobDetail?.trim() ? u.profile.jobDetail.trim() : null,
          // 목록에서는 대표 사진 1장만 — 단계별 공개 규칙은 프로필 상세가 담당한다.
          photo: u.profile?.photos?.[0] ?? null,
          badges: u.badges.map((b) => b.type),
          quote: intro?.about?.trim() ? intro.about.trim() : null,
          alreadyRequested,
        };
      }),
    });
  } catch (e) {
    console.error('[members/browse] failed', e);
    return NextResponse.json(
      { ok: false, reason: 'server', message: '회원 목록을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
