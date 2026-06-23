-- 연락처 오픈(번호오픈 MVP) — CreditReason 값 + contact_opens 테이블 추가
ALTER TYPE "CreditReason" ADD VALUE IF NOT EXISTS 'contact_open';

CREATE TABLE IF NOT EXISTS "contact_opens" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "from_agreed_at" TIMESTAMP(3),
    "to_agreed_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_opens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "contact_opens_match_id_key" ON "contact_opens"("match_id");
ALTER TABLE "contact_opens" ADD CONSTRAINT "contact_opens_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
