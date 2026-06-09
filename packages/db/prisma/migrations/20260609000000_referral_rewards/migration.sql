-- 회원 추천 보상 (MVP) — User 순번·추천인 연결 + ReferralReward 원장 + CreditReason 값

-- CreditReason 값 추가
ALTER TYPE "CreditReason" ADD VALUE IF NOT EXISTS 'referral_reward';
ALTER TYPE "CreditReason" ADD VALUE IF NOT EXISTS 'referral_clawback';

-- 신규 enum
DO $$ BEGIN
  CREATE TYPE "ReferralRewardType" AS ENUM ('signup_approved', 'first_purchase');
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE TYPE "ReferralRewardStatus" AS ENUM ('granted', 'clawed_back');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- users: seq(추천코드 파생) + referred_by_id(자기참조)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "seq" SERIAL;
DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_seq_key" UNIQUE ("seq");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referred_by_id" TEXT;
DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_id_fkey"
    FOREIGN KEY ("referred_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE INDEX IF NOT EXISTS "users_referred_by_id_idx" ON "users"("referred_by_id");

-- referral_rewards 원장
CREATE TABLE IF NOT EXISTS "referral_rewards" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referee_id" TEXT NOT NULL,
    "type" "ReferralRewardType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "status" "ReferralRewardStatus" NOT NULL DEFAULT 'granted',
    "ref_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clawed_back_at" TIMESTAMP(3),
    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "referral_rewards_referee_id_type_key"
  ON "referral_rewards"("referee_id", "type");
CREATE INDEX IF NOT EXISTS "referral_rewards_referrer_id_idx" ON "referral_rewards"("referrer_id");

DO $$ BEGIN
  ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referrer_id_fkey"
    FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_referee_id_fkey"
    FOREIGN KEY ("referee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
