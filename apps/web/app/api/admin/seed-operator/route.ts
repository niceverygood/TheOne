import { NextRequest, NextResponse } from 'next/server';
import { upsertOperator } from '@theone/db';
import type { OperatorRole } from '@prisma/client';

/**
 * POST /api/admin/seed-operator — Basic Auth 계정을 실제 심사 권한(Operator)으로 등록.
 *   본문: { username, name, role: 'viewer'|'reviewer'|'admin' }
 *   게이트: QA_SEED_TOKEN 재사용 + 헤더 x-gen-token 일치.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLES: OperatorRole[] = ['viewer', 'reviewer', 'admin'];

function gateOk(req: NextRequest): boolean {
  const gate = process.env.QA_SEED_TOKEN;
  return !!gate && req.headers.get('x-gen-token') === gate;
}

export async function POST(req: NextRequest) {
  if (!gateOk(req)) {
    return NextResponse.json({ ok: false, reason: 'forbidden' }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as {
    username?: unknown;
    name?: unknown;
    role?: unknown;
  } | null;
  const username = typeof body?.username === 'string' ? body.username : null;
  const name = typeof body?.name === 'string' ? body.name : null;
  const role = ROLES.includes(body?.role as OperatorRole) ? (body!.role as OperatorRole) : null;
  if (!username || !name || !role) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }
  try {
    const op = await upsertOperator(username, name, role);
    return NextResponse.json({ ok: true, operator: op });
  } catch (e) {
    console.error('[seed-operator] failed', e);
    return NextResponse.json({ ok: false, reason: 'failed' }, { status: 500 });
  }
}
