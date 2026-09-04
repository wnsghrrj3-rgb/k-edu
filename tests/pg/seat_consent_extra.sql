-- #41 재현용 보강: is_active 관련 열 + 뷰 의존 표 + student_data_summary 원형(#35)
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS deactivated_at timestamptz, ADD COLUMN IF NOT EXISTS deactivation_reason text, ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE class_codes ADD COLUMN IF NOT EXISTS label text;
CREATE TABLE scores(id serial, student_id uuid, lesson_id text, is_correct boolean, time_spent_sec int);
CREATE TABLE wrong_answers(id serial, student_id uuid, resolved_at timestamptz);
CREATE TABLE homework_completions(id serial, student_id uuid);
