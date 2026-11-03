-- 묶음 01~10 실행 뒤 한 번 — 단원별 문항 수(STATUS 표의 문항 수와 같으면 정상)
SELECT split_part(source_set,'_',1)||'_'||split_part(source_set,'_',2)||'_'||split_part(source_set,'_',3)||'_'||split_part(source_set,'_',4) AS 단원, count(*) AS 문항
FROM question_bank
WHERE source_set ~ '^g(3_2_(soc|sci)|5_|6_)'
GROUP BY 1 ORDER BY 1;
