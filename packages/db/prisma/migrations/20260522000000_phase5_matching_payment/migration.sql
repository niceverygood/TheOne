-- CreateEnum
CREATE TYPE "CurationAction" AS ENUM ('sent', 'viewed', 'passed', 'liked', 'superliked');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'refunded', 'partial_refunded');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "suspend_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "curation_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "action" "CurationAction" NOT NULL DEFAULT 'sent',
    "score" INTEGER,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewed_at" TIMESTAMP(3),

    CONSTRAINT "curation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "amount_won" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "base_credits" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'portone',
    "refunded_won" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curation_logs_user_id_sent_at_idx" ON "curation_logs"("user_id", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "curation_logs_user_id_candidate_id_sent_at_key" ON "curation_logs"("user_id", "candidate_id", "sent_at");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- AddForeignKey
ALTER TABLE "curation_logs" ADD CONSTRAINT "curation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curation_logs" ADD CONSTRAINT "curation_logs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

