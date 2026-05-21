import { NextRequest, NextResponse } from 'next/server';
import { runDailyCuration } from '@theone/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * 매일 자정 큐레이션 발송 CRON (Vercel Cron 또는 외부 스케줄러).
 * CRON_SECRET 설정 시 Authorization: Bearer <secret> 필요.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }
  const result = await runDailyCuration();
  return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
}
