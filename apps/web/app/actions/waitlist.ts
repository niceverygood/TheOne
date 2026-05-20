'use server';

import {
  waitlistInputSchema,
  referralCodeFromSeq,
  type WaitlistSubmitResult,
} from '@theone/shared';
import { createWaitlistEntry, DuplicateEmailError } from '@theone/db';
import { rateLimit } from '@/lib/rate-limit';
import { verifyTurnstile } from '@/lib/turnstile';
import { getClientIp, getUserAgent, getUtmFromCookie, hashIp } from '@/lib/request-meta';
import { sendWaitlistConfirm } from '@/lib/mailer';

export async function submitWaitlist(formData: FormData): Promise<WaitlistSubmitResult> {
  const raw = {
    email: formData.get('email'),
    gender: formData.get('gender'),
    jobCategory: formData.get('jobCategory'),
    referralCode: formData.get('referralCode') ?? '',
    agreeTerms: formData.get('agreeTerms'),
    website: formData.get('website') ?? '', // 허니팟
    turnstileToken: formData.get('cf-turnstile-response') ?? undefined,
  };

  const parsed = waitlistInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      reason: 'validation',
      message: '입력 내용을 다시 확인해 주세요.',
      fieldErrors,
    };
  }

  const input = parsed.data;

  // 허니팟: 봇이 hidden 필드를 채우면 silent reject (성공/실패 단서를 주지 않음)
  if (input.website) {
    return { ok: false, reason: 'validation', message: '잠시 후 다시 시도해 주세요.' };
  }

  const ip = getClientIp();
  const ipHash = hashIp(ip);

  if (!rateLimit(`waitlist:${ipHash}`)) {
    return {
      ok: false,
      reason: 'rate_limit',
      message: '잠시 후 다시 시도해 주세요. (1분당 3회)',
    };
  }

  const turnstileOk = await verifyTurnstile(input.turnstileToken, ip);
  if (!turnstileOk) {
    return {
      ok: false,
      reason: 'turnstile',
      message: '봇 방지 확인에 실패했습니다. 새로고침 후 다시 시도해 주세요.',
    };
  }

  const utm = getUtmFromCookie();

  try {
    const entry = await createWaitlistEntry({
      email: input.email,
      gender: input.gender,
      jobCategory: input.jobCategory,
      referralCode: input.referralCode ?? null,
      utmSource: utm.utmSource ?? null,
      utmMedium: utm.utmMedium ?? null,
      utmCampaign: utm.utmCampaign ?? null,
      utmTerm: utm.utmTerm ?? null,
      utmContent: utm.utmContent ?? null,
      userAgent: getUserAgent(),
      ipHash,
    });

    const referralCode = referralCodeFromSeq(entry.seq);

    // 확인 메일 (키 없으면 no-op). 메일 실패가 등록 자체를 막지 않도록 격리.
    void sendWaitlistConfirm({ email: entry.email, seq: entry.seq, referralCode }).catch(() => {});

    return { ok: true, seq: entry.seq, referralCode };
  } catch (e) {
    if (e instanceof DuplicateEmailError) {
      return {
        ok: false,
        reason: 'duplicate',
        message: '이미 등록된 이메일이에요. 출시 알림을 받으실 수 있습니다.',
      };
    }
    console.error('[waitlist] insert failed', e);
    return {
      ok: false,
      reason: 'server',
      message: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
    };
  }
}
