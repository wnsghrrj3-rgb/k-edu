-- #42 재현: psql -d kedu_t -f seat_pin_base.sql -f seat_consent_extra.sql -f ../../sql/setup_seat_pin.sql -f ../../sql/setup_seat_pin_off.sql -f ../../sql/setup_seat_consent.sql -f seat_consent_scenarios.sql
\set ON_ERROR_STOP on
SELECT 'backfill' AS t, count(*) FILTER (WHERE consent) AS on_n, count(*) AS total FROM student_seats;
SET t.uid = '00000000-0000-0000-0000-00000000000a';
SELECT 'off2' AS t, set_seats_consent(ARRAY['30000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003']::uuid[], false);
SELECT 'cloud_profile' AS t, is_active, deactivation_reason FROM student_profiles WHERE id='40000000-0000-0000-0000-000000000003';
SET t.uid = '00000000-0000-0000-0000-000000000002';
SELECT 'sea_enter' AS t, claim_seat_v2('ABCD','바다')->>'status' AS status;           -- guest_seat
SELECT 'sea_no_profile' AS t, count(*) FROM student_profiles WHERE nickname='바다';    -- 0
SET t.uid = '00000000-0000-0000-0000-000000000003';
SELECT 'cloud_enter' AS t, claim_seat_v2('ABCD','구름')->>'status' AS status;         -- guest_seat
SET t.uid = '00000000-0000-0000-0000-000000000001';
SELECT 'sky_enter' AS t, claim_seat_v2('ABCD','하늘')->>'status' AS status;           -- created (PIN 없음)
SET t.uid = '00000000-0000-0000-0000-00000000000a';
SELECT 'on_cloud' AS t, set_seat_consent('30000000-0000-0000-0000-000000000003', true);
SELECT 'cloud_back' AS t, is_active, deactivation_reason FROM student_profiles WHERE id='40000000-0000-0000-0000-000000000003';
SET t.uid = '00000000-0000-0000-0000-000000000003';
SELECT 'cloud_enter2' AS t, claim_seat_v2('ABCD','구름')->>'status' AS status;        -- reclaim
SET t.uid = '00000000-0000-0000-0000-000000000004';
DO $$ BEGIN PERFORM set_seat_consent('30000000-0000-0000-0000-000000000001', false); RAISE EXCEPTION 'should fail'; EXCEPTION WHEN OTHERS THEN IF SQLERRM='should fail' THEN RAISE; END IF; RAISE NOTICE 'pending blocked ok'; END $$;
SELECT 'view' AS t, nickname, seat_consent FROM student_data_summary ORDER BY nickname;
