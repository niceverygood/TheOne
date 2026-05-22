import { NextResponse } from 'next/server';
import { prisma } from '@theone/db';

export const dynamic = 'force-dynamic';

/** 헬스체크 — 외부 업타임 모니터/Status page가 폴링 (ops-runbook.md §1). */
export async function GET() {
  const at = new Date().toISOString();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: 'up', at });
  } catch {
    return NextResponse.json({ ok: false, db: 'down', at }, { status: 503 });
  }
}
