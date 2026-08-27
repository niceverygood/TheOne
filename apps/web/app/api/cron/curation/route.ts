import { NextRequest, NextResponse } from 'next/server';
import { runCurationSlot, curationSlotHours } from '@theone/db';
import { sendExpoPush } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * 카드 발송 CRON — 하루 3회(기본 12:00·15:00·20:00 KST)에 호출된다.
 * 각 호출은 "지금까지 열린 슬롯 수"까지 카드를 채우므로, 한 번 실패해도 다음 호출이 메운다.
 * 이번 호출에서 새 카드를 받은 회원에게만 푸시를 보낸다(중복 실행해도 푸시가 겹치지 않는다).
 *
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

  const now = new Date();
  const result = await runCurationSlot(now);

  // 푸시는 부가 알림 — 실패해도 카드 배정은 이미 끝났으므로 흐름을 막지 않는다.
  let pushed = 0;
  for (const d of result.delivered) {
    if (!d.pushToken) continue;
    const ok = await sendExpoPush(d.pushToken, {
      // 슬롯마다 여러 장이 오므로 실제 배정된 장수를 그대로 말한다.
      title: d.added > 1 ? `새로운 카드 ${d.added}장이 도착했습니다` : '새로운 카드가 도착했습니다',
      body: '지금 확인해 보세요.',
      data: { screen: 'curation' },
    });
    if (ok) pushed++;
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    skipped: result.skipped,
    pushed,
    slots: curationSlotHours(),
    at: now.toISOString(),
  });
}
