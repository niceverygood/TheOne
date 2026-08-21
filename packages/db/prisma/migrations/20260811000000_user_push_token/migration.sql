-- 카드 도착(12·15·20시) 푸시 발송용 Expo 토큰.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "push_token" TEXT;
