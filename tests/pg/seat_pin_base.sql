-- 로컬 PG 재현용 최소 스키마(Supabase 아님) — auth.uid() 는 GUC t.uid. 실행: psql -d kedu_t -f seat_pin_base.sql -f ../../sql/setup_seat_pin.sql -f seat_pin_scenarios.sql
DO $$ BEGIN CREATE ROLE anon NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$; DO $$ BEGIN CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA auth; CREATE SCHEMA extensions;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('t.uid', true),'')::uuid $$;
CREATE TABLE teachers(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid, approval text DEFAULT 'approved');
CREATE FUNCTION kedu_teacher_approved() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT EXISTS(SELECT 1 FROM teachers WHERE user_id=auth.uid() AND approval IN ('auto','approved')) $$;
CREATE TABLE class_codes(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE, grade int, consent_confirmed boolean DEFAULT true, is_active boolean DEFAULT true, teacher_id uuid REFERENCES teachers(id));
CREATE TABLE student_profiles(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, nickname text NOT NULL, class_code_id uuid REFERENCES class_codes(id), grade int, is_active boolean DEFAULT true, last_seen_at timestamptz DEFAULT now(), seat_no int);
CREATE TABLE student_seats(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), class_code_id uuid NOT NULL REFERENCES class_codes(id) ON DELETE CASCADE, nickname text NOT NULL, claim_code text NOT NULL UNIQUE, claimed_by uuid REFERENCES student_profiles(id), claimed_at timestamptz, created_by uuid, created_at timestamptz DEFAULT now(), seat_no int, UNIQUE(class_code_id,nickname));
CREATE FUNCTION claim_seat(p_class_code text, p_nickname text) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{"status":"v1"}'::jsonb $$;
GRANT EXECUTE ON FUNCTION claim_seat(text,text) TO authenticated;
-- 데이터
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-00000000000a','t@sen.go.kr'),('00000000-0000-0000-0000-000000000001',NULL),('00000000-0000-0000-0000-000000000002',NULL),('00000000-0000-0000-0000-000000000003',NULL),('00000000-0000-0000-0000-000000000004',NULL);
INSERT INTO teachers(id,user_id) VALUES ('10000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-00000000000a');
INSERT INTO teachers(id,user_id,approval) VALUES ('10000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000004','pending');
INSERT INTO class_codes(id,code,grade,teacher_id) VALUES ('20000000-0000-0000-0000-000000000000','ABCD',1,'10000000-0000-0000-0000-000000000000');
INSERT INTO class_codes(code,grade,consent_confirmed) VALUES ('NOCO',1,false);
INSERT INTO student_seats(id,class_code_id,nickname,claim_code,seat_no) VALUES
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000000','하늘','C00001',1),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000000','바다','C00002',2),
 ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000000','구름','C00003',3);
-- 옛 좌석: 구름은 uid3 기기에 이미 묶여 있고 PIN 없음
INSERT INTO student_profiles(id,user_id,nickname,class_code_id,grade) VALUES ('40000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','구름','20000000-0000-0000-0000-000000000000',1);
UPDATE student_seats SET claimed_by='40000000-0000-0000-0000-000000000003', claimed_at=now() WHERE id='30000000-0000-0000-0000-000000000003';
