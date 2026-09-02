-- =============================================================
-- 케이점검 — 코드·콘텐츠 자동 점검 장부 (2026-09-02, #37)
--   흐름: GitHub Actions(audit.yml) 가 매일 + push 때 audit/inspector.js 를 돌려
--         service_role 키로 여기 upsert → 관리 화면(/admin 「점검」) 에서 준호가
--         승인/무시 → audit-fix.yml 이 approved+fixable 만 고쳐 커밋 → applied.
--   표: admin_audit_runs(실행 1줄) · admin_audit_findings(항목, fingerprint 가 키)
--   원칙: 읽기·상태 변경은 관리자만(kedu_is_admin). 쓰기(upsert)는 service_role 만(RLS 우회).
--   재실행 안전. 의존: #23(kedu_is_admin).
-- =============================================================

CREATE TABLE IF NOT EXISTS admin_audit_runs (
  id            bigserial PRIMARY KEY,
  ran_at        timestamptz NOT NULL DEFAULT now(),
  commit        text,
  files_scanned int,
  duration_ms   int,
  total int DEFAULT 0, high int DEFAULT 0, mid int DEFAULT 0, low int DEFAULT 0,
  by_area       jsonb,
  rules         jsonb
);

CREATE TABLE IF NOT EXISTS admin_audit_findings (
  fingerprint    text PRIMARY KEY,                 -- 규칙+파일+문면 해시 (audit/inspector.js)
  run_id         bigint REFERENCES admin_audit_runs(id) ON DELETE SET NULL,
  first_seen     timestamptz NOT NULL DEFAULT now(),
  last_seen      timestamptz NOT NULL DEFAULT now(),
  rule           text NOT NULL,
  area           text NOT NULL,
  severity       text NOT NULL CHECK (severity IN ('high','mid','low')),
  file           text,
  line           int,
  msg            text NOT NULL,
  fix            jsonb,                            -- { type, ... } 자동 수정 지시 (없으면 사람 몫)
  fixable        boolean NOT NULL DEFAULT false,
  status         text NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','ignored','applied','resolved')),
  decided_at     timestamptz,
  applied_commit text,
  note           text
);
CREATE INDEX IF NOT EXISTS admin_audit_findings_status_idx ON admin_audit_findings(status, severity);

ALTER TABLE admin_audit_runs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_findings ENABLE ROW LEVEL SECURITY;

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_audit_runs' AND policyname='audit_runs_admin_read') THEN
    CREATE POLICY "audit_runs_admin_read" ON admin_audit_runs FOR SELECT USING (kedu_is_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_audit_findings' AND policyname='audit_findings_admin_read') THEN
    CREATE POLICY "audit_findings_admin_read" ON admin_audit_findings FOR SELECT USING (kedu_is_admin());
  END IF;
END $do$;

-- 승인/무시/되돌리기 — 관리자만. 상태는 이 세 가지만 화면에서 바꾼다(applied·resolved 는 워크플로 몫).
CREATE OR REPLACE FUNCTION admin_audit_decide(p_fingerprint text, p_status text, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION 'admin only'; END IF;
  IF p_status NOT IN ('open','approved','ignored') THEN RAISE EXCEPTION 'bad status'; END IF;
  UPDATE admin_audit_findings
     SET status = p_status, decided_at = now(), note = COALESCE(p_note, note)
   WHERE fingerprint = p_fingerprint;
END $fn$;
REVOKE ALL ON FUNCTION admin_audit_decide(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION admin_audit_decide(text, text, text) TO authenticated;

-- 여러 건 한 번에 (영역 전체 무시 등)
CREATE OR REPLACE FUNCTION admin_audit_decide_many(p_fingerprints text[], p_status text)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE n int;
BEGIN
  IF NOT kedu_is_admin() THEN RAISE EXCEPTION 'admin only'; END IF;
  IF p_status NOT IN ('open','approved','ignored') THEN RAISE EXCEPTION 'bad status'; END IF;
  UPDATE admin_audit_findings SET status = p_status, decided_at = now()
   WHERE fingerprint = ANY(p_fingerprints);
  GET DIAGNOSTICS n = ROW_COUNT; RETURN n;
END $fn$;
REVOKE ALL ON FUNCTION admin_audit_decide_many(text[], text) FROM public;
GRANT EXECUTE ON FUNCTION admin_audit_decide_many(text[], text) TO authenticated;

-- 검산:
--   SELECT count(*) FROM admin_audit_runs;                              → 0 (첫 워크플로 뒤 1)
--   SELECT status, count(*) FROM admin_audit_findings GROUP BY 1;       → 워크플로 뒤 open n
