-- =============================================
-- K-edu 콘텐츠 원장 등급(contents.tier) — 생태계설계_v2_공개준비 §B · §J-4
-- 작성: 2026-08-26
-- 본질: 브라우저 판정기(/kedu_tier.js CONTENT_TIERS)의 경로→tier 표를 DB 원장에 거울로 둔다.
--       판정은 지금 브라우저가 한다(1단계). 서버 강제(2단계)가 오면 이 컬럼이 진실이 된다.
--       두 표가 어긋나면 tests/test_kedu_gate.js 가 잡는다(SQL 의 prefix 를 JS 표와 대조).
-- 의존: setup_tables.sql(contents)
-- 멱등 — 재실행 안전.
-- =============================================

ALTER TABLE contents ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'open';

DO $do$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contents_tier_check') THEN
    ALTER TABLE contents ADD CONSTRAINT contents_tier_check
      CHECK (tier IN ('open','class','class_rec','home'));
  END IF;
END $do$;

COMMENT ON COLUMN contents.tier IS
  'open=누구나 · class=교사가 학급에 열어주면 · class_rec=열어주고 동의 학급만(기록) · home=학부모(L3). 경로 표 = /kedu_tier.js CONTENT_TIERS.';

-- 경로 → tier 백필 (CONTENT_TIERS 와 같은 접두, 같은 순서). is_premium 은 건드리지 않는다(추가 문제 원장 §H 몫).
UPDATE contents SET tier = CASE
  WHEN file_path LIKE '/classwork/%'        THEN 'class_rec'
  WHEN file_path LIKE '/morning/%'          THEN 'class_rec'
  WHEN file_path LIKE '/kbattle/%'          THEN 'class_rec'
  WHEN file_path LIKE '/live/%'             THEN 'class_rec'
  WHEN file_path LIKE '/kpark/%'            THEN 'class'
  WHEN file_path LIKE '/maker/%'            THEN 'class'
  WHEN file_path LIKE '/kmake/%'            THEN 'class'
  WHEN file_path LIKE '/maker-playground/%' THEN 'class'
  WHEN file_path LIKE '/draw/%'             THEN 'class'
  WHEN file_path LIKE '/kple/%'             THEN 'class'
  WHEN file_path LIKE '/kdetective/%'       THEN 'class'
  ELSE 'open'
END
WHERE tier IS DISTINCT FROM CASE
  WHEN file_path LIKE '/classwork/%'        THEN 'class_rec'
  WHEN file_path LIKE '/morning/%'          THEN 'class_rec'
  WHEN file_path LIKE '/kbattle/%'          THEN 'class_rec'
  WHEN file_path LIKE '/live/%'             THEN 'class_rec'
  WHEN file_path LIKE '/kpark/%'            THEN 'class'
  WHEN file_path LIKE '/maker/%'            THEN 'class'
  WHEN file_path LIKE '/kmake/%'            THEN 'class'
  WHEN file_path LIKE '/maker-playground/%' THEN 'class'
  WHEN file_path LIKE '/draw/%'             THEN 'class'
  WHEN file_path LIKE '/kple/%'             THEN 'class'
  WHEN file_path LIKE '/kdetective/%'       THEN 'class'
  ELSE 'open'
END;

CREATE INDEX IF NOT EXISTS idx_contents_tier ON contents(tier);

-- 검산
--   SELECT tier, count(*) FROM contents GROUP BY 1;   → 현재 원장은 /grade1·/english 뿐이라 open 400 (class 0)
