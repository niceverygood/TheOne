-- users.is_admin — 앱 내 관리자 콘솔(가입심사·신고처리) 접근 권한.
-- 스키마에는 있었으나 마이그레이션이 누락되어 신규 DB에서 로그인/시드가 실패했다.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- orders.provider 기본값을 스키마(IAP v1.0)와 일치시킨다. 기존 행은 건드리지 않는다.
ALTER TABLE "orders" ALTER COLUMN "provider" SET DEFAULT 'iap_apple';
