import { NextRequest, NextResponse } from 'next/server';
import { moderateUser, resolveReports } from '@theone/db';
import { requireMobileAdmin } from '@/lib/mobile-admin';

export const dynamic = 'force-dynamic';

const ACTIONS = ['suspend', 'ban', 'reinstate'] as const;

/** POST /api/admin/mobile/reports/moderate — body: { userId, action }. 신고 처리(앱 내). */
export async function POST(req: NextRequest) {
  const adminId = await requireMobileAdmin(req);
  if (!adminId) return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => null)) as {
    userId?: unknown;
    action?: unknown;
  } | null;
  const userId = typeof body?.userId === 'string' ? body.userId : null;
  const action = ACTIONS.includes(body?.action as (typeof ACTIONS)[number])
    ? (body!.action as (typeof ACTIONS)[number])
    : null;
  if (!userId || !action) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  try {
    await moderateUser({ userId, action });
    await resolveReports(userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/mobile/reports/moderate] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
