-- 가치관 매칭(킥): 프로필에 60문항 설문 응답, 큐레이션 로그에 케미 일치도 스냅샷

-- Profile.surveyAnswers — Likert 1~5, 미응답 시 빈 배열
ALTER TABLE "profiles" ADD COLUMN "survey_answers" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];

-- CurationLog.chemistry — 0~100 케미 일치도(설문 미완료 시 NULL)
ALTER TABLE "curation_logs" ADD COLUMN "chemistry" INTEGER;
