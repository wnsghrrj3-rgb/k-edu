-- =============================================
-- setup_worksheet_bank.sql  (E1 — 케이학습지 문항 원장 + 쪽지 조립)
-- 작성: 2026-08-31
-- 명세: handoff/kedu/평가모듈_설계_v1.md §11 E1 · kedu/케이학습지_문항수행_설계_v1.md
-- 본질: 문항은 파일이 아니라 원장의 행이다. 교사는 원장에서 골라 쪽지를 조립하고,
--       배포는 새 우주를 만들지 않고 기존 「우리 반에 열기」(class_openings)를 그대로 쓴다.
--         content_key = 'quiz:<quiz_sets.id>'
--       풀이 기록도 새 표를 만들지 않고 기존 scores 에 열만 늘린다 →
--       케이학습리포트(setup_report_v1.sql)의 뷰가 손대지 않고 그대로 읽는다.
-- 의존: setup_tables.sql(teachers, class_codes) · setup_diagnosis_v2.sql(scores, student_profiles)
--       setup_class_openings.sql(class_openings, open_for_class, cw_my_teacher_id, kedu_teacher_approved)
-- 멱등 — 재실행 안전. 달러 인용 $fn$/$do$.
-- =============================================


-- =============================================
-- [1] concepts — 개념 트리
--   code 는 사람이 읽는 정본 코드(예 'M1-1-C1'). 학습지 JSON·수행 과제 카드와 같은 코드.
--   케이학습리포트 §5 concept 단위 판정이 기다리던 자리.
-- =============================================
CREATE TABLE IF NOT EXISTS concepts (
  code              text PRIMARY KEY,
  subject           text NOT NULL,
  grade             int  NOT NULL,
  semester          int,
  unit_code         text NOT NULL,           -- 'u1'
  lesson_no         int,                     -- 몇 차시에서 다루는 개념인지
  name              text NOT NULL,
  achievement_codes text[] NOT NULL DEFAULT '{}',
  ord               int NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_concepts_unit ON concepts(subject, grade, unit_code, ord);

COMMENT ON TABLE concepts IS
  '개념 트리. 문항·수행과제·리포트가 같은 code 를 본다(케이학습지 설계 §G).';


-- =============================================
-- [2] misconceptions — 오개념 사전
--   오답 선택지 하나하나가 이 코드를 달고 있어야 한다(검수 게이트 W1).
-- =============================================
CREATE TABLE IF NOT EXISTS misconceptions (
  code         text PRIMARY KEY,             -- 'M01'
  subject      text NOT NULL,
  grade        int,
  unit_code    text,
  concept_codes text[] NOT NULL DEFAULT '{}',
  title        text NOT NULL,                -- 오개념 한 줄
  teacher_hint text NOT NULL DEFAULT '',     -- 교사가 바로 쓸 처방 한 줄
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_misconceptions_unit ON misconceptions(subject, grade, unit_code);


-- =============================================
-- [3] question_bank — 문항 원장
--   payload 는 학습지 JSON 의 문항 객체 그대로(무손실). play.html 은 파일에서 읽든
--   원장에서 읽든 같은 객체를 받는다 — 렌더러 수정 없음.
--   나머지 열은 전부 payload 에서 뽑아낸 '검색·필터용 사본'이다.
-- =============================================
CREATE TABLE IF NOT EXISTS question_bank (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qcode               text UNIQUE NOT NULL,           -- 'g1_math_u1_L01_basic#1'
  subject             text NOT NULL,
  grade               int  NOT NULL,
  semester            int,
  unit_code           text NOT NULL,
  lesson_code         text,                           -- 'L01' (단원 종합은 NULL)
  source_set          text,                           -- 최초로 태어난 세트
  source_kind         text,                           -- lesson_basic | lesson_challenge | unit_review
  concept_code        text REFERENCES concepts(code) ON DELETE SET NULL,
  difficulty          int  NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
  qkind               text NOT NULL,                  -- mc|sa|ox|error|blank|data|match|essay
  grading             text NOT NULL DEFAULT 'auto',   -- auto | teacher
  stem                text NOT NULL DEFAULT '',       -- 검색용 사본
  misconception_codes text[] NOT NULL DEFAULT '{}',   -- 오답 선택지가 단 코드들
  has_variant         boolean NOT NULL DEFAULT false, -- variant_rule 유무
  payload             jsonb NOT NULL,                 -- 문항 정본 (무손실)
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qbank_pick
  ON question_bank(subject, grade, unit_code, difficulty) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_qbank_concept ON question_bank(concept_code) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_qbank_lesson  ON question_bank(subject, grade, unit_code, lesson_code);
CREATE INDEX IF NOT EXISTS idx_qbank_mis     ON question_bank USING gin (misconception_codes);

COMMENT ON COLUMN question_bank.payload IS
  '학습지 JSON 문항 객체 그대로. 다른 열은 이 안에서 뽑은 필터용 사본 — 원본은 항상 이쪽.';


-- =============================================
-- [4] quiz_sets / quiz_set_items — 조립된 쪽지
--   kind: quiz(쪽지) | unit_test(단원평가, E2) | custom
--   교사가 만든 세트. 배포는 class_openings 로 나간다(여기엔 배포 열이 없다).
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_sets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id   uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title        text NOT NULL DEFAULT '쪽지',
  kind         text NOT NULL DEFAULT 'quiz',
  subject      text NOT NULL,
  grade        int  NOT NULL,
  unit_code    text,
  show_result  text NOT NULL DEFAULT 'immediate',   -- immediate | after_close (설계 §12 미결 — 쪽지 기본은 즉시)
  is_archived  boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_sets_teacher ON quiz_sets(teacher_id, created_at DESC);

CREATE TABLE IF NOT EXISTS quiz_set_items (
  set_id      uuid NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
  ord         int  NOT NULL,
  question_id uuid NOT NULL REFERENCES question_bank(id) ON DELETE RESTRICT,
  PRIMARY KEY (set_id, ord)
);
CREATE INDEX IF NOT EXISTS idx_quiz_items_q ON quiz_set_items(question_id);


-- =============================================
-- [5] scores 확장 — 오개념 분포의 재료
--   새 attempts 표를 만들지 않는다. 리포트 뷰가 이미 scores 를 읽고 있고,
--   쪽지 한 문항도 결국 '학생이 문항 하나에 답한 사실'이라 같은 표다.
--   misconception_code = 학생이 고른 오답 선택지가 달고 있던 코드(정답이면 NULL).
-- =============================================
DO $do$ BEGIN
  ALTER TABLE scores ADD COLUMN IF NOT EXISTS quiz_set_id       uuid REFERENCES quiz_sets(id) ON DELETE SET NULL;
  ALTER TABLE scores ADD COLUMN IF NOT EXISTS question_bank_id  uuid REFERENCES question_bank(id) ON DELETE SET NULL;
  ALTER TABLE scores ADD COLUMN IF NOT EXISTS concept_code      text;
  ALTER TABLE scores ADD COLUMN IF NOT EXISTS misconception_code text;
END $do$;
CREATE INDEX IF NOT EXISTS idx_scores_quiz    ON scores(quiz_set_id) WHERE quiz_set_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scores_concept ON scores(student_id, concept_code) WHERE concept_code IS NOT NULL;


-- =============================================
-- [6] RLS
-- =============================================
ALTER TABLE concepts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE misconceptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_set_items  ENABLE ROW LEVEL SECURITY;

-- 개념·오개념 사전: 로그인한 사람은 읽기(교사 화면·리포트가 이름을 붙이는 데 필요).
DROP POLICY IF EXISTS p_concepts_read ON concepts;
CREATE POLICY p_concepts_read ON concepts
  FOR SELECT TO authenticated USING (is_active);

DROP POLICY IF EXISTS p_misconceptions_read ON misconceptions;
CREATE POLICY p_misconceptions_read ON misconceptions
  FOR SELECT TO authenticated USING (true);

-- 문항 원장 직접 읽기는 '승인 교사'만. 학생은 절대 원장을 직접 읽지 않는다
-- (정답이 payload 안에 있으므로) — 학생은 아래 get_quiz_set() RPC 로만 받는다.
DROP POLICY IF EXISTS p_qbank_teacher_read ON question_bank;
CREATE POLICY p_qbank_teacher_read ON question_bank
  FOR SELECT TO authenticated
  USING (is_active AND kedu_teacher_approved());

-- 원장 쓰기는 어드민만(양산은 SQL 시드로 들어온다).
DROP POLICY IF EXISTS p_qbank_admin_write ON question_bank;
CREATE POLICY p_qbank_admin_write ON question_bank
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin));

DROP POLICY IF EXISTS p_concepts_admin_write ON concepts;
CREATE POLICY p_concepts_admin_write ON concepts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin));

DROP POLICY IF EXISTS p_mis_admin_write ON misconceptions;
CREATE POLICY p_mis_admin_write ON misconceptions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM teachers t WHERE t.user_id = auth.uid() AND t.is_admin));

-- 쪽지 세트: 만든 교사 것만. 쓰기는 승인 교사만(§D-5 개방 잠금과 같은 벽).
DROP POLICY IF EXISTS p_quiz_sets_owner ON quiz_sets;
CREATE POLICY p_quiz_sets_owner ON quiz_sets
  FOR ALL TO authenticated
  USING (teacher_id = cw_my_teacher_id())
  WITH CHECK (teacher_id = cw_my_teacher_id() AND kedu_teacher_approved());

DROP POLICY IF EXISTS p_quiz_items_owner ON quiz_set_items;
CREATE POLICY p_quiz_items_owner ON quiz_set_items
  FOR ALL TO authenticated
  USING (set_id IN (SELECT id FROM quiz_sets WHERE teacher_id = cw_my_teacher_id()))
  WITH CHECK (set_id IN (SELECT id FROM quiz_sets WHERE teacher_id = cw_my_teacher_id()));


-- =============================================
-- [7] get_quiz_set — 학생이 쪽지를 받는 유일한 문
--   학생 본인의 학급에 'quiz:<set_id>' 가 열려 있을 때만 문항을 준다.
--   열려 있지 않으면 빈 결과(세트의 존재 여부를 흘리지 않는다).
--   ※ 정답은 payload 안에 있고 클라이언트가 채점한다 — 자기주도 차시와 같은 모델.
--     서버 채점(정답 비공개)은 E2 단원평가에서 다룰 하드닝 지점으로 남긴다.
-- =============================================
CREATE OR REPLACE FUNCTION get_quiz_set(p_set_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  v_class uuid;
  v_set   quiz_sets%ROWTYPE;
  v_qs    jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;

  SELECT sp.class_code_id INTO v_class
    FROM student_profiles sp WHERE sp.user_id = auth.uid() LIMIT 1;

  SELECT * INTO v_set FROM quiz_sets WHERE id = p_set_id AND NOT is_archived;
  IF v_set.id IS NULL THEN RETURN NULL; END IF;

  -- 교사 본인은 미리보기 허용. 학생은 학급 개방 원장에 있어야 한다.
  IF v_set.teacher_id IS DISTINCT FROM cw_my_teacher_id() THEN
    IF v_class IS NULL THEN RETURN NULL; END IF;
    IF NOT EXISTS (
      SELECT 1 FROM class_openings o
       WHERE o.class_code_id = v_class
         AND o.content_key = 'quiz:' || p_set_id::text
    ) THEN
      RETURN NULL;
    END IF;
  END IF;

  SELECT jsonb_agg(
           q.payload
           || jsonb_build_object('qid', q.id, 'qcode', q.qcode,
                                 'concept', q.concept_code, 'seq', i.ord)
           ORDER BY i.ord)
    INTO v_qs
    FROM quiz_set_items i
    JOIN question_bank q ON q.id = i.question_id
   WHERE i.set_id = p_set_id AND q.is_active;

  RETURN jsonb_build_object(
    'set',      v_set.id,
    'title',    v_set.title,
    'kind',     v_set.kind,
    'grade',    v_set.grade,
    'subject',  v_set.subject,
    'unit',     v_set.unit_code,
    'show_result', v_set.show_result,
    'questions', COALESCE(v_qs, '[]'::jsonb)
  );
END $fn$;
GRANT EXECUTE ON FUNCTION get_quiz_set(uuid) TO authenticated;


-- =============================================
-- [8] quiz_misconception_dist — 오개념 분포 (E1의 마지막 조각)
--   교사가 쪽지 결과에서 보는 것: 몇 점이 아니라 '어디서 어떻게 틀렸나'.
--   security_invoker → scores RLS 그대로(교사=자기 학급).
-- =============================================
DROP VIEW IF EXISTS quiz_misconception_dist;
CREATE VIEW quiz_misconception_dist
WITH (security_invoker = true) AS
SELECT
  s.quiz_set_id,
  s.concept_code,
  s.misconception_code,
  m.title                                        AS misconception_title,
  m.teacher_hint,
  COUNT(*)::int                                  AS hits,
  COUNT(DISTINCT s.student_id)::int              AS students,
  MAX(s.earned_at)                               AS last_at
FROM scores s
LEFT JOIN misconceptions m ON m.code = s.misconception_code
WHERE s.quiz_set_id IS NOT NULL
  AND s.is_correct IS FALSE
GROUP BY s.quiz_set_id, s.concept_code, s.misconception_code, m.title, m.teacher_hint;

COMMENT ON VIEW quiz_misconception_dist IS
  '쪽지별 오개념 분포. 교사 결과 화면과 케이학습리포트의 약한 개념 신호가 같은 곳을 본다.';


-- =============================================
-- [9] quiz_item_stats — 문항별 정답률 (문항 품질 되먹임)
--   정답률이 지나치게 낮거나 100%인 문항은 원장에서 손봐야 할 문항이다.
-- =============================================
DROP VIEW IF EXISTS quiz_item_stats;
CREATE VIEW quiz_item_stats
WITH (security_invoker = true) AS
SELECT
  s.quiz_set_id,
  s.question_bank_id,
  COUNT(*)::int                                       AS n,
  COUNT(*) FILTER (WHERE s.is_correct)::int           AS n_correct,
  ROUND(COUNT(*) FILTER (WHERE s.is_correct) * 100.0
        / GREATEST(COUNT(*), 1))::int                 AS pct_correct
FROM scores s
WHERE s.quiz_set_id IS NOT NULL AND s.is_correct IS NOT NULL
GROUP BY s.quiz_set_id, s.question_bank_id;


-- =============================================
-- 실행 후 할 일
--   1) seed_worksheet_g1_math_u1.sql 실행 (개념 7 · 오개념 11 · 문항 240)
--   2) 교사 화면 /kedu/worksheet/build.html 에서 쪽지 조립 → 「우리 반에 열기」
--   3) 학생은 /kedu/worksheet/play.html?quiz=<set_id> 로 푼다
-- =============================================
