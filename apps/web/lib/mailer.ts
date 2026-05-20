import 'server-only';
import { render } from '@react-email/render';
import { WaitlistConfirmEmail } from '@theone/shared/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://the-one.kr';

interface ConfirmArgs {
  email: string;
  seq: number;
  referralCode: string;
}

/**
 * 사전등록 확인 메일 발송. RESEND_API_KEY 미설정 시 콘솔 로그만 남기고 no-op.
 * 발송 실패는 호출부에서 등록 자체와 분리(격리)한다.
 */
export async function sendWaitlistConfirm({
  email,
  seq,
  referralCode,
}: ConfirmArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? 'THE ONE <noreply@the-one.kr>';

  const confirmUrl = `${SITE_URL}/api/confirm?code=${encodeURIComponent(referralCode)}`;
  const html = await render(WaitlistConfirmEmail({ seq, referralCode, confirmUrl }));

  if (!apiKey) {
    console.info('[mailer] RESEND_API_KEY 미설정 — 메일 발송 생략', { email, seq });
    return;
  }

  // 동적 import: 키 있을 때만 SDK 로드
  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: email,
    subject: `THE ONE 사전등록 접수 · #${seq}번째 신청자`,
    html,
  });
}
