-- Phase 4 — 가입 플로우 재설계 + 인증 8종 + 인앱화폐 보상 + 수동 본인인증
-- (1) 인증 타입 4종 추가  (2) 크레딧 사유 verify_reward 추가  (3) 프로필 설문 컬럼
-- (4) ManualIdentityRequest 테이블

-- AlterEnum: VerificationType 4종 추가 (income/job/family_wealth/reputation)
ALTER TYPE "VerificationType" ADD VALUE IF NOT EXISTS 'income';
ALTER TYPE "VerificationType" ADD VALUE IF NOT EXISTS 'job';
ALTER TYPE "VerificationType" ADD VALUE IF NOT EXISTS 'family_wealth';
ALTER TYPE "VerificationType" ADD VALUE IF NOT EXISTS 'reputation';

-- AlterEnum: CreditReason verify_reward 추가
ALTER TYPE "CreditReason" ADD VALUE IF NOT EXISTS 'verify_reward';

-- CreateEnum: ManualIdReviewStatus
DO $$ BEGIN
  CREATE TYPE "ManualIdReviewStatus" AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- AlterTable: profiles 가입 설문 컬럼
ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "height" INTEGER,
  ADD COLUMN IF NOT EXISTS "residence_region" TEXT,
  ADD COLUMN IF NOT EXISTS "activity_region" TEXT,
  ADD COLUMN IF NOT EXISTS "school" TEXT,
  ADD COLUMN IF NOT EXISTS "hobbies" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "drinking_frequency" TEXT,
  ADD COLUMN IF NOT EXISTS "drinking_amount" TEXT,
  ADD COLUMN IF NOT EXISTS "smoking" TEXT,
  ADD COLUMN IF NOT EXISTS "body_type" TEXT,
  ADD COLUMN IF NOT EXISTS "intro_sections" JSONB;

-- CreateTable: manual_identity_requests
CREATE TABLE IF NOT EXISTS "manual_identity_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "id_card_s3_key" TEXT NOT NULL,
    "note" TEXT,
    "status" "ManualIdReviewStatus" NOT NULL DEFAULT 'pending',
    "reviewer_id" TEXT,
    "reject_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "purge_at" TIMESTAMP(3),

    CONSTRAINT "manual_identity_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "manual_identity_requests_status_created_at_idx" ON "manual_identity_requests"("status", "created_at");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "manual_identity_requests"
    ADD CONSTRAINT "manual_identity_requests_reviewer_id_fkey"
    FOREIGN KEY ("reviewer_id") REFERENCES "operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
