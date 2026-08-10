-- 큐레이션 첫인상 별점(1~5). 3점 이상 = 호감(liked).
-- 단계별 사진 공개(기본 1장 → 내 별점 3+ 2장 → 상호 3+ 3장 → 매칭 성사 전체)의 판정 근거.
ALTER TABLE "curation_logs" ADD COLUMN "rating" INTEGER;
