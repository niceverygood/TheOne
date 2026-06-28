-- 편지 중복발송 레이스 방어(M1): 같은 (from,to) 에 동시에 두 개의 pending 매치가
-- 생기지 못하게 부분 unique 인덱스. Prisma 스키마로는 표현 불가(부분 인덱스) → 수동.
-- 멱등: 이미 있으면 건너뜀. (기존 중복 pending 이 있으면 생성 실패 → 먼저 정리 필요)
CREATE UNIQUE INDEX IF NOT EXISTS "matches_from_to_pending_uniq"
  ON "matches" ("from_id", "to_id")
  WHERE "status" = 'pending';
