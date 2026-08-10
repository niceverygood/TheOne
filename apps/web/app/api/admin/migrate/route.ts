import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function gateOk(req: NextRequest): boolean {
  const gate = process.env.QA_SEED_TOKEN;
  return !!gate && req.headers.get('x-gen-token') === gate;
}

/**
 * POST /api/admin/migrate — 스키마에 추가된 컬럼을 prod DB에 반영(멱등, IF NOT EXISTS).
 * Prisma migrate deploy 를 CI 없이 돌릴 수 없는 현재 배포 흐름의 임시 대체.
 * QA_SEED_TOKEN 지우면 비활성.
 */
export async function POST(req: NextRequest) {
  if (!gateOk(req)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;',
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[migrate] failed', e);
    return NextResponse.json({ ok: false, reason: String(e) }, { status: 500 });
  }
}
