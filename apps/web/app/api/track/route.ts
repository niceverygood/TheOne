import { NextResponse } from 'next/server';
import { trackEventSchema } from '@theone/shared';
import { recordEvent } from '@/lib/track';

// 쿠키(getVisitorId 등)·Prisma 사용 → Node 런타임, 캐시 금지.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 클라이언트 퍼널 비콘 수신(상단 단계만: page_view/waitlist_view/waitlist_start).
 * 전환 단계(submit/success/duplicate/error)는 서버 액션에서만 기록(위변조 방지).
 * 항상 204 — 잘못된 페이로드도 조용히 무시(분석이 사용자 경험을 막지 않도록).
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => null);
    const parsed = trackEventSchema.safeParse(body);
    if (parsed.success) {
      await recordEvent(parsed.data.type, {
        path: parsed.data.path,
        meta: parsed.data.meta,
      });
    }
  } catch {
    // swallow — 비콘은 실패해도 무시
  }
  return new NextResponse(null, { status: 204 });
}
