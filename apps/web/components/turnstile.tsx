'use client';

import Script from 'next/script';

/**
 * Cloudflare Turnstile 위젯. NEXT_PUBLIC_TURNSTILE_SITE_KEY 미설정 시 렌더하지 않음.
 * 토큰은 hidden input `cf-turnstile-response`로 폼에 자동 주입된다.
 */
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </>
  );
}
