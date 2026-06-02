import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { startKcbVerification } from '@/lib/kcb-identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ returnMsg: z.string().max(300).optional() });

/**
 * POST /api/identity/kcb/start
 * body: { returnMsg? }
 *
 * KCB 휴대폰 본인확인 거래를 시작한다(identity-kcb Java 서비스 경유).
 * 응답의 popupUrl 을 클라이언트가 WebView(앱)/팝업(웹)으로 열어 사용자가 인증한다.
 * 인증 완료 후 클라이언트는 txSeqNo 로 /api/identity/kcb/result 를 호출한다.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: 'invalid' }, { status: 400 });
  }

  const r = await startKcbVerification(parsed.data.returnMsg);
  if (!r.ok) {
    return NextResponse.json(
      { ok: false, reason: r.reason ?? 'start_failed', rsltCd: r.rsltCd },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, txSeqNo: r.txSeqNo, popupUrl: r.popupUrl });
}
