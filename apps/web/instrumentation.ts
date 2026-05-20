/**
 * Sentry 자리 (Phase 0 placeholder).
 * Phase 1에서 @sentry/nextjs 설치 후 아래 주석을 해제하고 sentry.*.config.ts 추가.
 * DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
 */
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  // TODO(Phase 1):
  // if (process.env.NEXT_RUNTIME === 'nodejs') await import('./sentry.server.config');
  // if (process.env.NEXT_RUNTIME === 'edge') await import('./sentry.edge.config');
}
