-- IAP 멱등: 동일 (provider, payment_id) 2배 적립 차단.
-- payment_id NULL(미결제 pending)은 Postgres에서 서로 distinct 하므로 충돌하지 않음.
-- 기존 중복(provider, payment_id) 행이 있으면 이 인덱스 생성이 실패한다 = 실제 2배적립 존재 신호이므로
-- 배포 실패 시 해당 주문을 조사할 것(자동 dedupe 안 함 — 결제 데이터 무결성).
CREATE UNIQUE INDEX "orders_provider_payment_id_key" ON "orders"("provider", "payment_id");
