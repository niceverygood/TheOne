import { NextRequest, NextResponse } from 'next/server';
import { listPendingMembers } from '@theone/db';
import { requireMobileAdmin } from '@/lib/mobile-admin';

export const dynamic = 'force-dynamic';

/** GET /api/admin/mobile/members — 가입 심사 대기 목록(앱 내 관리자 화면). */
export async function GET(req: NextRequest) {
  const adminId = await requireMobileAdmin(req);
  if (!adminId) return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });

  try {
    const members = await listPendingMembers();
    return NextResponse.json({
      ok: true,
      members: members.map((m) => ({
        id: m.id,
        gender: m.gender,
        jobCategory: m.jobCategory,
        createdAt: m.createdAt.toISOString(),
        referredBySeq: m.referredBy?.seq ?? null,
      })),
    });
  } catch (e) {
    console.error('[admin/mobile/members GET] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
