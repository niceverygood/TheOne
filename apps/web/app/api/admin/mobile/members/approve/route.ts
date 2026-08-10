import { NextRequest, NextResponse } from 'next/server';
import { approveMembership } from '@theone/db';
import { requireMobileAdmin } from '@/lib/mobile-admin';

export const dynamic = 'force-dynamic';

/** POST /api/admin/mobile/members/approve — body: { userId }. 가입 심사 승인(앱 내). */
export async function POST(req: NextRequest) {
  const adminId = await requireMobileAdmin(req);
  if (!adminId) return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { userId?: unknown } | null;
  const userId = typeof body?.userId === 'string' ? body.userId : null;
  if (!userId) return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });

  try {
    await approveMembership(userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/mobile/members/approve] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
