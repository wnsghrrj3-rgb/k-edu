-- ============================================================
-- #56 setup_teacher_plans.sql — 케이티처 2세대 「우리 반 판」 서버 저장 (2026-09-23, 20차)
-- ------------------------------------------------------------
-- 판 = 교사가 ✎ 편집으로 고친 차시(순서·건너뛰기·추가 슬라이드·글·사진·메모·자료).
-- 종전엔 그 기기 브라우저에만 → 교실 전자칠판에서 고친 게 집 노트북에 없었다.
-- · 줄 = 교사 × 차시 하나. 본인만 읽고 쓴다. 쓰기는 승인 교사만(kedu_teacher_approved()).
-- · 학생 정보는 담지 않는다(명단·기록 없음 — 교사의 수업 자료만). 크기 상한 4MB(사진 포함).
-- · 이 SQL 전엔 무대가 조용히 「이 기기에만」으로 돈다(표 없으면 오류 없이 넘어감).
-- 검산(맨 아래) → 1행 · 정책 4.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.teacher_plans (
  teacher_id  uuid        NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  slug        text        NOT NULL,            -- 예: g1_math
  lesson_key  text        NOT NULL,            -- 예: u2_l02
  plan        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (teacher_id, slug, lesson_key),
  CONSTRAINT teacher_plans_size CHECK (octet_length(plan::text) < 4000000),
  CONSTRAINT teacher_plans_slug CHECK (slug ~ '^g[1-6]_[a-z]+$'),
  CONSTRAINT teacher_plans_key  CHECK (length(lesson_key) BETWEEN 1 AND 60)
);

COMMENT ON TABLE public.teacher_plans IS '케이티처 2세대 우리 반 판 — 교사×차시 편집본(본인만). #56';

ALTER TABLE public.teacher_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS teacher_plans_sel ON public.teacher_plans;
DROP POLICY IF EXISTS teacher_plans_ins ON public.teacher_plans;
DROP POLICY IF EXISTS teacher_plans_upd ON public.teacher_plans;
DROP POLICY IF EXISTS teacher_plans_del ON public.teacher_plans;

CREATE POLICY teacher_plans_sel ON public.teacher_plans FOR SELECT TO authenticated
  USING (teacher_id = auth.uid());
CREATE POLICY teacher_plans_ins ON public.teacher_plans FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND kedu_teacher_approved());
CREATE POLICY teacher_plans_upd ON public.teacher_plans FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid() AND kedu_teacher_approved());
CREATE POLICY teacher_plans_del ON public.teacher_plans FOR DELETE TO authenticated
  USING (teacher_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_plans TO authenticated;
REVOKE ALL ON public.teacher_plans FROM anon;

-- 검산
SELECT (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='teacher_plans') AS table_ok,
       (SELECT count(*) FROM pg_policies WHERE tablename='teacher_plans') AS policies;   -- 1 · 4
