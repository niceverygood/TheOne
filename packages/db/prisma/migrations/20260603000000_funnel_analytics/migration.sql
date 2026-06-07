-- CreateEnum
CREATE TYPE "FunnelEventType" AS ENUM ('page_view', 'waitlist_view', 'waitlist_start', 'waitlist_submit', 'waitlist_success', 'waitlist_duplicate', 'waitlist_error');

-- AlterTable
ALTER TABLE "waitlist" ADD COLUMN     "fbclid" TEXT,
ADD COLUMN     "visitor_id" TEXT;

-- CreateTable
CREATE TABLE "analytics_event" (
    "id" TEXT NOT NULL,
    "type" "FunnelEventType" NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "path" TEXT,
    "referrer" TEXT,
    "landing" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "fbclid" TEXT,
    "fbc" TEXT,
    "fbp" TEXT,
    "user_agent" TEXT,
    "ip_hash" TEXT,
    "country" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "waitlist_visitor_id_idx" ON "waitlist"("visitor_id");

-- CreateIndex
CREATE INDEX "analytics_event_created_at_idx" ON "analytics_event"("created_at");

-- CreateIndex
CREATE INDEX "analytics_event_type_created_at_idx" ON "analytics_event"("type", "created_at");

-- CreateIndex
CREATE INDEX "analytics_event_visitor_id_idx" ON "analytics_event"("visitor_id");

-- CreateIndex
CREATE INDEX "analytics_event_utm_campaign_idx" ON "analytics_event"("utm_campaign");

-- CreateIndex
CREATE INDEX "analytics_event_utm_source_idx" ON "analytics_event"("utm_source");
