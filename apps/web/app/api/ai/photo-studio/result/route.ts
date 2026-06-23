import { NextRequest, NextResponse } from 'next/server';
import { consumePhotoStudioJob } from '@theone/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/photo-studio/result?jobId=
 * 비동기 생성 잡의 현재 상태. done 이면 결과 이미지(base64)를 돌려주고 서버에서 즉시 삭제한다.
 *  - pending: 아직 생성 중 → 잠시 후 다시 폴링
 *  - done:    images:[{style,b64,mime}]
 *  - failed/not_found: 재시도 안내
 */
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')?.trim();
  if (!jobId) return NextResponse.json({ ok: false, reason: 'missing_jobId' }, { status: 400 });
  try {
    const state = await consumePhotoStudioJob(jobId);
    if (state.status === 'pending') return NextResponse.json({ ok: true, status: 'pending' });
    if (state.status === 'done') {
      return NextResponse.json({ ok: true, status: 'done', images: state.images });
    }
    if (state.status === 'failed') {
      return NextResponse.json({ ok: true, status: 'failed', reason: state.error });
    }
    return NextResponse.json({ ok: true, status: 'not_found' });
  } catch (e) {
    console.error('[photo-studio/result] failed', e);
    return NextResponse.json({ ok: false, reason: 'server' }, { status: 500 });
  }
}
