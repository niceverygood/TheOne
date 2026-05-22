import 'server-only';

/**
 * Slack 운영 알림 (ops-runbook.md). SLACK_WEBHOOK_URL 미설정 시 no-op.
 * 결제 실패·신고 누적·인증 SLA 임박 등에 사용.
 */
export async function notifySlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch {
    /* 알림 실패는 비즈니스 로직을 막지 않는다 */
  }
}
