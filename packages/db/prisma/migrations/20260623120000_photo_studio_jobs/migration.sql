-- AI 스튜디오 비동기 잡 — 백그라운드 생성 + 완료 푸시 (임시 보관, 수령/1h TTL 파기)
-- 멱등: enum/테이블/인덱스 존재 시 건너뜀.

DO $$ BEGIN
  CREATE TYPE "PhotoStudioJobStatus" AS ENUM ('pending', 'done', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "photo_studio_jobs" (
  "id"         TEXT NOT NULL,
  "status"     "PhotoStudioJobStatus" NOT NULL DEFAULT 'pending',
  "styles"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "images"     JSONB,
  "error"      TEXT,
  "push_token" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "photo_studio_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "photo_studio_jobs_status_created_at_idx"
  ON "photo_studio_jobs" ("status", "created_at");
