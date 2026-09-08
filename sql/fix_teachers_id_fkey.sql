-- =============================================
-- fix_teachers_id_fkey.sql  (#52 — 2026-09-09)
-- 교사 가입이 「insert on table "teachers" violates foreign key constraint "teachers_id_fkey"」로 막힘.
-- 배경: 레포의 setup_tables.sql 은 teachers.id 를 gen_random_uuid() 대리키로, user_id 만 auth.users 를
--       참조하도록 적혀 있으나, 실제 DB 에는 teachers.id → auth.users(id) 외래키가 남아 있어
--       새 교사 행(id 가 무작위 uuid)이 전부 23503 으로 거절됐다. 준호 외 교사 가입이 한 번도 성공한 적이
--       없었던 원인. (fix_student_fk.sql #36 과 같은 「레포≠라이브」 유형)
-- 조치: teachers.id 위의 외래키를 (참조 대상이 무엇이든) 걷어낸다 — 레포엔 그런 제약이 없다.
--       09-09 두 번째 시도: id=auth uid 폴백으로도 같은 오류 → 참조 대상이 auth.users 가 아닐 수 있어 대상 불문으로.
--       user_id 외래키·PK·기존 행은 무접촉.
-- 멱등 — 재실행 안전. 화면은 이 파일 적용 전에도 id=auth uid 폴백으로 가입된다(auth/·teacher/).
-- =============================================
BEGIN;

DO $do$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT con.conname, rn.nspname, ref.relname
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_class ref ON ref.oid = con.confrelid
      JOIN pg_namespace rn ON rn.oid = ref.relnamespace
     WHERE rel.relname = 'teachers'
       AND con.contype = 'f'
       AND con.conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid = rel.oid AND attname = 'id')]
  LOOP
    EXECUTE format('ALTER TABLE teachers DROP CONSTRAINT IF EXISTS %I', c.conname);
    RAISE NOTICE 'dropped % (→ %.%)', c.conname, c.nspname, c.relname;
  END LOOP;
END $do$;

COMMIT;

-- 검산 (0행이면 정상):
--   SELECT conname FROM pg_constraint WHERE conrelid = 'teachers'::regclass AND contype = 'f'
--     AND conkey = ARRAY[(SELECT attnum FROM pg_attribute WHERE attrelid='teachers'::regclass AND attname='id')];
-- user_id 외래키는 남아 있어야 함 (1행):
--   SELECT conname FROM pg_constraint WHERE conrelid = 'teachers'::regclass AND contype = 'f';
