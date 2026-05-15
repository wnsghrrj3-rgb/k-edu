/* ============================================================
   1학년 1학기 수학 — 1단원 「9까지의 수」 (12차시)
   양산 자리 — LESSONS["u1_l{NN}"] 누적
   ------------------------------------------------------------
   진입 채팅: 정리·케이티처 채팅 자리
   다른 단원 .js (g1_math_u2.js ~ u6.js) = read-only
   학년·과목 통합 파일 g1_math.html이 자동 로드 후
   window.LESSONS 객체에 누적시킴.
   ------------------------------------------------------------
   2026-05-15 cycle 16 — 8 차시 자리 양산 (라이브 자리 18슬 인덱스 자리)
   옛 LESSONS["u1_l8"] 34슬 자리 = archive/2026-05-15_u1_옛34슬_LESSONS_l8.js
============================================================ */

LESSONS["u1_l2~3"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "2~3",
    title: "1, 2, 3, 4, 5를 알아볼까요",
    std: "[2수01-01]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l02_03.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"흥미 유발 — 학용품·장난감 그림에서 \"무엇을 셀까?\" (가위·연필·공·강아지 인형) / …", desc:"흥미 유발 — 학용품·장난감 그림에서 \"무엇을 셀까?\" (가위·연필·공·강아지 인형) / 수 세기 동기 유발"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표 안내 — \"오늘은 1부터 5까지의 수를 배우고 써 봐요\"", desc:"학습 목표 안내 — \"오늘은 1부터 5까지의 수를 배우고 써 봐요\""}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기 — 입학 전 수 세기 경험 (몇 살이에요? 손가락 몇 개?)", desc:"전시 학습 상기 — 입학 전 수 세기 경험 (몇 살이에요? 손가락 몇 개?)"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"개념 도입 1·2 — 가위 1개·지우개 2개 + 동그라미 색칠 일대일대응 + \"1=하나·일…", desc:"개념 도입 1·2 — 가위 1개·지우개 2개 + 동그라미 색칠 일대일대응 + \"1=하나·일, 2=둘·이\" 읽기"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"개념 도입 3·4 — 연필 3개·공책 4개 + 동그라미 색칠 + \"3=셋·삼, 4=넷·사\"…", desc:"개념 도입 3·4 — 연필 3개·공책 4개 + 동그라미 색칠 + \"3=셋·삼, 4=넷·사\" 읽기"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"개념 도입 5 + 추상화 — 공깃돌 5개·자동차 5대 일대일대응 + \"5=다섯·오\" 읽기 …", desc:"개념 도입 5 + 추상화 — 공깃돌 5개·자동차 5대 일대일대응 + \"5=다섯·오\" 읽기 + **추상화 강조: \"종류 달라도 둘 다 5개\"**"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"trace", data:{title:"필순 학습 — 1·2·3·4·5 점선 따라쓰기 (`trace_number` 부품, 5개 숫…", desc:"필순 학습 — 1·2·3·4·5 점선 따라쓰기 (`trace_number` 부품, 5개 숫자 한 슬에)"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"토끼 몇 마리? (정답 4) — `count_input` 답 직접 입력", desc:"토끼 몇 마리? (정답 4) — `count_input` 답 직접 입력"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"비행기 몇 대? (정답 2) — `count_input`", desc:"비행기 몇 대? (정답 2) — `count_input`"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"우주선 몇 대? (정답 5) — `count_input` + 우리말·한자어 둘 다 읽기 (…", desc:"우주선 몇 대? (정답 5) — `count_input` + 우리말·한자어 둘 다 읽기 (TTS 또는 텍스트)"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"match", data:{title:"짝짓기 — 사물 그림 ↔ 숫자 카드 5쌍 매칭 (터치 매칭)", desc:"짝짓기 — 사물 그림 ↔ 숫자 카드 5쌍 매칭 (터치 매칭)"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"수 카드 보고 그 수만큼 — 수 카드 3 보여줌 → 4지선다 그림 중 3개인 것 고르기", desc:"수 카드 보고 그 수만큼 — 수 카드 3 보여줌 → 4지선다 그림 중 3개인 것 고르기"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"multi", data:{title:"추상화 검증 — \"둘 다 4개인 것을 모두 골라요\" 다중 선택 (사과 4·바나나 4·꽃 3…", desc:"추상화 검증 — \"둘 다 4개인 것을 모두 골라요\" 다중 선택 (사과 4·바나나 4·꽃 3·별 5)"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"우리말·한자어 매핑 — 숫자 3 → \"셋\"·\"삼\" 짝짓기 (터치 매칭)", desc:"우리말·한자어 매핑 — 숫자 3 → \"셋\"·\"삼\" 짝짓기 (터치 매칭)"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"빠진 수 찾기 — 1·2·3·▢·5 → 답 직접 입력 (4)", desc:"빠진 수 찾기 — 1·2·3·▢·5 → 답 직접 입력 (4)"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"핵심 개념 요약 — 1·2·3·4·5 한 화면 + 우리말·한자어 두 가지 읽기 표", desc:"핵심 개념 요약 — 1·2·3·4·5 한 화면 + 우리말·한자어 두 가지 읽기 표"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 별 평정 (수 세기·수 쓰기·두 가지 읽기 …", desc:"자기 평가 — `self_assessment` 별 평정 (수 세기·수 쓰기·두 가지 읽기 세 자리)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고 — \"다음 차시는 6, 7, 8, 9를 배워요\"", desc:"다음 차시 예고 — \"다음 차시는 6, 7, 8, 9를 배워요\""}, suggested_extras:[]},
  ],
  extras: []
};

LESSONS["u1_l4~5"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "4~5",
    title: "6, 7, 8, 9를 알아볼까요",
    std: "[2수01-01]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l04_05.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"흥미 유발 — 20~21쪽 풍경에서 \"무엇을 셀까?\" (해바라기·풍선·물고기) / 수가 5…", desc:"흥미 유발 — 20~21쪽 풍경에서 \"무엇을 셀까?\" (해바라기·풍선·물고기) / 수가 5를 넘어가는 자리 동기 유발"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표 안내 — \"오늘은 6, 7, 8, 9를 배우고 십 배열판으로 그려 봐요\"", desc:"학습 목표 안내 — \"오늘은 6, 7, 8, 9를 배우고 십 배열판으로 그려 봐요\""}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기 — 1~5 복습 (지난 시간 1·2·3·4·5 + 우리말·한자어 자리)", desc:"전시 학습 상기 — 1~5 복습 (지난 시간 1·2·3·4·5 + 우리말·한자어 자리)"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"개념 도입 6·7 — 사물 6·7개 + `ten_frame` 도입 (6=5+1, 7=5+2…", desc:"개념 도입 6·7 — 사물 6·7개 + `ten_frame` 도입 (6=5+1, 7=5+2 시각화) + \"여섯·육, 일곱·칠\" 읽기"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"개념 도입 8·9 — 사물 8·9개 + `ten_frame` (8=5+3, 9=5+4) +…", desc:"개념 도입 8·9 — 사물 8·9개 + `ten_frame` (8=5+3, 9=5+4) + \"여덟·팔, 아홉·구\" 읽기"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"연결 모형 도입 — 1~9 막대 9개 계단 (`linking_cube`) + 1·2·3 ·…", desc:"연결 모형 도입 — 1~9 막대 9개 계단 (`linking_cube`) + 1·2·3 ··· 9 순서대로 시각"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"trace", data:{title:"필순 학습 — 6·7·8·9 점선 따라쓰기 (`trace_number`, 4개 숫자 한 슬…", desc:"필순 학습 — 6·7·8·9 점선 따라쓰기 (`trace_number`, 4개 숫자 한 슬에)"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"`ten_frame` 6칸 채움 → 몇 칸? (정답 6) — `count_input`", desc:"`ten_frame` 6칸 채움 → 몇 칸? (정답 6) — `count_input`"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"`ten_frame` 9칸 채움 → 몇 칸? (정답 9) — `count_input`", desc:"`ten_frame` 9칸 채움 → 몇 칸? (정답 9) — `count_input`"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"사물 7개 보고 몇 개? — `count_input` + 우리말·한자어 둘 다 읽기", desc:"사물 7개 보고 몇 개? — `count_input` + 우리말·한자어 둘 다 읽기"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"match", data:{title:"짝짓기 — `ten_frame` 표시 ↔ 숫자 카드 (6·7·8·9 4쌍 매칭)", desc:"짝짓기 — `ten_frame` 표시 ↔ 숫자 카드 (6·7·8·9 4쌍 매칭)"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"수만큼 `ten_frame` 채우기 — 숫자 8 → 학생이 ten_frame 8칸 클릭 (…", desc:"수만큼 `ten_frame` 채우기 — 숫자 8 → 학생이 ten_frame 8칸 클릭 (`mode=\"interactive\"`)"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"multi", data:{title:"추상화 검증 — 사과 7·바나나 7·꽃 6·별 9 → \"둘 다 7개\" 다중 선택", desc:"추상화 검증 — 사과 7·바나나 7·꽃 6·별 9 → \"둘 다 7개\" 다중 선택"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"우리말·한자어 매핑 — 숫자 8 → \"여덟\"·\"팔\" 짝짓기 (터치 매칭)", desc:"우리말·한자어 매핑 — 숫자 8 → \"여덟\"·\"팔\" 짝짓기 (터치 매칭)"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"연결 모형 — `linking_cube` 막대 7칸 → 몇 칸? (정답 7) — `coun…", desc:"연결 모형 — `linking_cube` 막대 7칸 → 몇 칸? (정답 7) — `count_input`"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"핵심 개념 요약 — 1~9 한 화면 + `ten_frame` 1~9 표시 + 우리말·한자어…", desc:"핵심 개념 요약 — 1~9 한 화면 + `ten_frame` 1~9 표시 + 우리말·한자어 표"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 별 평정 (수 세기·십 배열판 이해·두 가지…", desc:"자기 평가 — `self_assessment` 별 평정 (수 세기·십 배열판 이해·두 가지 읽기 세 자리)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고 — \"다음 차시는 순서를 배워요 (몇째)\"", desc:"다음 차시 예고 — \"다음 차시는 순서를 배워요 (몇째)\""}, suggested_extras:[]},
  ],
  extras: []
};

LESSONS["u1_l6"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "6",
    title: "순서를 알아볼까요",
    std: "[2수01-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l06.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"흥미 유발 — 복도에 줄 선 9명 친구들 (휠체어 친구 포함) / \"이 친구들은 어떻게 순…", desc:"흥미 유발 — 복도에 줄 선 9명 친구들 (휠체어 친구 포함) / \"이 친구들은 어떻게 순서를 말할까?\""}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표 안내 — \"오늘은 순서를 나타내는 말과 수를 배워요\"", desc:"학습 목표 안내 — \"오늘은 순서를 나타내는 말과 수를 배워요\""}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기 — 04-05차 1~9 수 복습 (`ten_frame` 1~9 한 화면 띠…", desc:"전시 학습 상기 — 04-05차 1~9 수 복습 (`ten_frame` 1~9 한 화면 띠)"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"개념 도입 1 — 순서수 매핑: 첫째·둘째·셋째···아홉째 ↔ 1·2·3···9 (9명 줄…", desc:"개념 도입 1 — 순서수 매핑: 첫째·둘째·셋째···아홉째 ↔ 1·2·3···9 (9명 줄 + 카드)"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"개념 도입 2 — '몇째' ≠ '몇 개' 시각 대조 (사탕 둘째 vs 사탕 2개)", desc:"개념 도입 2 — '몇째' ≠ '몇 개' 시각 대조 (사탕 둘째 vs 사탕 2개)"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"개념 도입 3 — 기준 명시: 같은 친구를 \"왼쪽에서 셋째\" vs \"오른쪽에서 일곱째\"로 …", desc:"개념 도입 3 — 기준 명시: 같은 친구를 \"왼쪽에서 셋째\" vs \"오른쪽에서 일곱째\"로 두 자리 표현"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"개념 정리 — 순서수 표 (첫째~아홉째 ↔ 1~9) + 기준 두 자리 (←/→) 정리", desc:"개념 정리 — 순서수 표 (첫째~아홉째 ↔ 1~9) + 기준 두 자리 (←/→) 정리"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"9명 줄 → \"왼쪽에서 셋째는 누구?\" — `position_picker direction…", desc:"9명 줄 → \"왼쪽에서 셋째는 누구?\" — `position_picker direction=\"left\" target=3`"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"위치 표시 → \"이 친구는 왼쪽에서 몇째?\" — `count_input inputType=…", desc:"위치 표시 → \"이 친구는 왼쪽에서 몇째?\" — `count_input inputType=\"pad\"`"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"match", data:{title:"순서수 매칭 — 첫째↔1, 둘째↔2 ··· 9쌍 — `ordinal_match` (3·6·…", desc:"순서수 매칭 — 첫째↔1, 둘째↔2 ··· 9쌍 — `ordinal_match` (3·6·9 등 일부 출제)"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"9명 줄 → \"오른쪽에서 다섯째는 누구?\" (기준 바뀜) — `position_picker…", desc:"9명 줄 → \"오른쪽에서 다섯째는 누구?\" (기준 바뀜) — `position_picker direction=\"right\" target=5`"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"두 기준 동시 — \"왼쪽에서 셋째이자 오른쪽에서 일곱째인 친구는?\" — `position_…", desc:"두 기준 동시 — \"왼쪽에서 셋째이자 오른쪽에서 일곱째인 친구는?\" — `position_picker direction=\"both\"`"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"multi", data:{title:"호명 다중 선택 — \"둘째·다섯째·여덟째 셋을 모두 골라봐\" (다중 선택, 정답 3개)", desc:"호명 다중 선택 — \"둘째·다섯째·여덟째 셋을 모두 골라봐\" (다중 선택, 정답 3개)"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"multi", data:{title:"'몇째 vs 몇 개' 구분 — \"사탕 셋째를 골라\"·\"사탕 3개를 골라\" 두 자리 정답 다…", desc:"'몇째 vs 몇 개' 구분 — \"사탕 셋째를 골라\"·\"사탕 3개를 골라\" 두 자리 정답 다중 선택"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"벽 작품 자리 — \"내 작품은 왼쪽에서 4째예요. 오른쪽에서 몇째일까?\" (9칸 총수 → …", desc:"벽 작품 자리 — \"내 작품은 왼쪽에서 4째예요. 오른쪽에서 몇째일까?\" (9칸 총수 → 6째) — `count_input inputType=\"pad\"`"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"핵심 정리 — 1~9 + 첫째~아홉째 + 두 기준(←/→) 표 한 화면", desc:"핵심 정리 — 1~9 + 첫째~아홉째 + 두 기준(←/→) 표 한 화면"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 별 평정 (순서수 매핑·기준 인식·몇째와 몇…", desc:"자기 평가 — `self_assessment` 별 평정 (순서수 매핑·기준 인식·몇째와 몇 개 구분 세 자리)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고 — \"다음 차시는 수의 순서 — 1·2·3···9 그리고 거꾸로 9·8··…", desc:"다음 차시 예고 — \"다음 차시는 수의 순서 — 1·2·3···9 그리고 거꾸로 9·8···1\""}, suggested_extras:[]},
  ],
  extras: []
};

LESSONS["u1_l7"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "7",
    title: "수의 순서를 알아볼까요",
    std: "[2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l07.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"흥미 유발 — 1~9 숫자판 (서로 다른 색 동그라미) / \"이 수를 어떤 순서로 말할 수…", desc:"흥미 유발 — 1~9 숫자판 (서로 다른 색 동그라미) / \"이 수를 어떤 순서로 말할 수 있을까?\""}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표 안내 — \"오늘은 수를 1·2···9 순서대로, 그리고 거꾸로 9·8···1 세…", desc:"학습 목표 안내 — \"오늘은 수를 1·2···9 순서대로, 그리고 거꾸로 9·8···1 세 봐요\""}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기 — 06차 첫째~아홉째 짧은 회상 (1~9 + 첫째~아홉째 한 화면 표)", desc:"전시 학습 상기 — 06차 첫째~아홉째 짧은 회상 (1~9 + 첫째~아홉째 한 화면 표)"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"개념 도입 1 — 순방향: 1·2·3···9 카드 한 줄 + 화살표 → / 한 칸씩 강조", desc:"개념 도입 1 — 순방향: 1·2·3···9 카드 한 줄 + 화살표 → / 한 칸씩 강조"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"개념 도입 2 — 역방향: 9·8·7···1 카드 한 줄 + 화살표 ← / 한 칸씩 강조", desc:"개념 도입 2 — 역방향: 9·8·7···1 카드 한 줄 + 화살표 ← / 한 칸씩 강조"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"개념 도입 3 — 중간 시작: \"4부터 8까지\" 순방향 / \"7부터 2까지\" 역방향 두 자…", desc:"개념 도입 3 — 중간 시작: \"4부터 8까지\" 순방향 / \"7부터 2까지\" 역방향 두 자리 시각"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"개념 정리 — \"9 다음? / 1 이전?\" 빈칸 자리 (단원 후반·다음 단원 호기심 자리)", desc:"개념 정리 — \"9 다음? / 1 이전?\" 빈칸 자리 (단원 후반·다음 단원 호기심 자리)"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"빈칸 순방향 — \"1 _ 3 _ 5 6 _ 8 _\" — `count_input` 4자리 (…", desc:"빈칸 순방향 — \"1 _ 3 _ 5 6 _ 8 _\" — `count_input` 4자리 (한 슬 안 4개 입력)"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"빈칸 역방향 — \"9 _ 7 _ 5 _ 3 _ 1\" — `count_input` 4자리", desc:"빈칸 역방향 — \"9 _ 7 _ 5 _ 3 _ 1\" — `count_input` 4자리"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"흩어진 1~9 카드 → 순서 배열 — `sequence_arrange direction=\"…", desc:"흩어진 1~9 카드 → 순서 배열 — `sequence_arrange direction=\"asc\" range=[1,9]`"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"길 따라가기 1→9 — `number_path direction=\"asc\" range=[1…", desc:"길 따라가기 1→9 — `number_path direction=\"asc\" range=[1,9]` (클릭 점프)"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"중간 시작 순방향 — \"4부터 8까지 배열\" — `sequence_arrange direc…", desc:"중간 시작 순방향 — \"4부터 8까지 배열\" — `sequence_arrange direction=\"asc\" range=[4,8]`"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"중간 시작 역방향 — \"7부터 2까지 배열\" — `sequence_arrange direc…", desc:"중간 시작 역방향 — \"7부터 2까지 배열\" — `sequence_arrange direction=\"desc\" range=[7,2]`"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"다음 수·이전 수 — \"5의 다음 수는?·5의 이전 수는?\" — `count_input` …", desc:"다음 수·이전 수 — \"5의 다음 수는?·5의 이전 수는?\" — `count_input` 2자리 한 슬"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"거꾸로 길 따라가기 — `number_path direction=\"desc\" range=[…", desc:"거꾸로 길 따라가기 — `number_path direction=\"desc\" range=[9,1]`"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"핵심 정리 — 1~9 순방향·역방향 화살표 + \"9 다음=?\"·\"1 이전=?\" 빈칸 자리 …", desc:"핵심 정리 — 1~9 순방향·역방향 화살표 + \"9 다음=?\"·\"1 이전=?\" 빈칸 자리 (호기심)"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 별 평정 (순방향·역방향·중간 시작 세 자리…", desc:"자기 평가 — `self_assessment` 별 평정 (순방향·역방향·중간 시작 세 자리)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고 — \"다음 차시는 1만큼 더 큰 수와 작은 수\"", desc:"다음 차시 예고 — \"다음 차시는 1만큼 더 큰 수와 작은 수\""}, suggested_extras:[]},
  ],
  extras: []
};

LESSONS["u1_l8"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "8",
    title: "1만큼 더 큰 수와 1만큼 더 작은 수를 알아볼까요",
    std: "[2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l08.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"흥미 유발 — 두 친구 딱지치기, 둘 다 3장 / \"한 장 넘어가면 어떻게 바뀔까?\"", desc:"흥미 유발 — 두 친구 딱지치기, 둘 다 3장 / \"한 장 넘어가면 어떻게 바뀔까?\""}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표 안내 — \"1만큼 더 큰 수, 1만큼 더 작은 수를 배워요\"", desc:"학습 목표 안내 — \"1만큼 더 큰 수, 1만큼 더 작은 수를 배워요\""}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기 — 07차 \"다음 수·이전 수\" (5의 다음=6, 5의 이전=4) 짧게 회…", desc:"전시 학습 상기 — 07차 \"다음 수·이전 수\" (5의 다음=6, 5의 이전=4) 짧게 회상"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"개념 도입 1 — 한 개 더 많아짐 = 1만큼 더 큰 수. `ten_frame` 3 → 4…", desc:"개념 도입 1 — 한 개 더 많아짐 = 1만큼 더 큰 수. `ten_frame` 3 → 4 자리 시각 (색칠 추가 애니메이션)"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"개념 도입 2 — 한 개 더 적어짐 = 1만큼 더 작은 수. `ten_frame` 3 → …", desc:"개념 도입 2 — 한 개 더 적어짐 = 1만큼 더 작은 수. `ten_frame` 3 → 2 자리 시각 (색칠 제거 애니메이션)"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"개념 도입 3 — `linking_cube` 1~9 계단 + ±1 화살표. 옆 자리 = ±…", desc:"개념 도입 3 — `linking_cube` 1~9 계단 + ±1 화살표. 옆 자리 = ±1 자리 시각"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"개념 정리 — 가역 사고: \"5는 6보다 1만큼 더 작은 수 ↔ 6은 5보다 1만큼 더 큰…", desc:"개념 정리 — 가역 사고: \"5는 6보다 1만큼 더 작은 수 ↔ 6은 5보다 1만큼 더 큰 수\" 양방향 화살표"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"`ten_frame` 4 → \"1만큼 더 큰 수는?\" — `count_input input…", desc:"`ten_frame` 4 → \"1만큼 더 큰 수는?\" — `count_input inputType=\"pad\"` (정답 5)"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"`ten_frame` 6 → \"1만큼 더 작은 수는?\" — `count_input inpu…", desc:"`ten_frame` 6 → \"1만큼 더 작은 수는?\" — `count_input inputType=\"pad\"` (정답 5)"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"`linking_cube` 막대 7 → \"옆 칸 막대는 몇 칸?\" — `count_inpu…", desc:"`linking_cube` 막대 7 → \"옆 칸 막대는 몇 칸?\" — `count_input` (정답 8)"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"match", data:{title:"짝짓기 — 수 카드 4·5·6·7 ↔ \"1만큼 더 큰 수\" 카드 5·6·7·8 — `mor…", desc:"짝짓기 — 수 카드 4·5·6·7 ↔ \"1만큼 더 큰 수\" 카드 5·6·7·8 — `more_less_one mode=\"matching\" direction=\"more\"`"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"`more_less_one mode=\"interactive\"` — 기준 5 → 학생이 ±1…", desc:"`more_less_one mode=\"interactive\"` — 기준 5 → 학생이 ±1 자리 클릭으로 표현 (한 개 추가 또는 한 개 제거)"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"양방향 추론 1 — \"6은 어떤 수보다 1만큼 더 큰 수?\" → 정답 5 — `count_…", desc:"양방향 추론 1 — \"6은 어떤 수보다 1만큼 더 큰 수?\" → 정답 5 — `count_input`"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"양방향 추론 2 — \"어떤 수보다 1만큼 더 작은 수가 7이면, 그 수는?\" → 정답 8 …", desc:"양방향 추론 2 — \"어떤 수보다 1만큼 더 작은 수가 7이면, 그 수는?\" → 정답 8 — `count_input`"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"수 알아맞히기 — 카드 자리 1·9 제외 7장 중 1장 숨김 + \"1만큼 더 큰 수가 6\"…", desc:"수 알아맞히기 — 카드 자리 1·9 제외 7장 중 1장 숨김 + \"1만큼 더 큰 수가 6\" 단서 → 정답 5 — `more_less_one mode=\"choice4\"`"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"핵심 정리 — `linking_cube` 1~9 막대 + ±1 화살표 + 양방향 표 한 화…", desc:"핵심 정리 — `linking_cube` 1~9 막대 + ±1 화살표 + 양방향 표 한 화면"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 별 평정 (±1 이해·시각 인식·가역 사고 …", desc:"자기 평가 — `self_assessment` 별 평정 (±1 이해·시각 인식·가역 사고 세 자리)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고 — \"다음 차시는 0 — 1 이전의 수\" (07차 슬7·16 호기심 자리 …", desc:"다음 차시 예고 — \"다음 차시는 0 — 1 이전의 수\" (07차 슬7·16 호기심 자리 회수 자리)"}, suggested_extras:[]},
  ],
  extras: []
};

LESSONS["u1_l9"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "9",
    title: "0을 알아볼까요",
    std: "[2수01-01], [2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l09.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"흥미 유발 — 풀 받침대 풀 3개, 친구들이 하나씩 가져가는 장면 (SVG + 이모지 🧴)", desc:"흥미 유발 — 풀 받침대 풀 3개, 친구들이 하나씩 가져가는 장면 (SVG + 이모지 🧴)"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표 안내 — \"아무것도 없음을 수로 나타내요\"", desc:"학습 목표 안내 — \"아무것도 없음을 수로 나타내요\""}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기 — 08차 \"1보다 1만큼 더 작은 수는?\" 호기심 회수", desc:"전시 학습 상기 — 08차 \"1보다 1만큼 더 작은 수는?\" 호기심 회수"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"개념 도입 1 — `decrement_animation` 풀 3→2→1→0 (학생이 풀 하…", desc:"개념 도입 1 — `decrement_animation` 풀 3→2→1→0 (학생이 풀 하나씩 클릭 → 제거)"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"개념 도입 2 — \"아무것도 없음을 0이라고 쓰고 '영'이라고 읽어요\" 명시 (Jua 80…", desc:"개념 도입 2 — \"아무것도 없음을 0이라고 쓰고 '영'이라고 읽어요\" 명시 (Jua 800 큰 글자)"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"trace", data:{title:"개념 도입 3 — `trace_number digit={0}` 0 필순 따라쓰기", desc:"개념 도입 3 — `trace_number digit={0}` 0 필순 따라쓰기"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"개념 정리 — 0·1·2·3·4·5·6·7·8·9 한 줄 + \"0이 새 식구\" 표현", desc:"개념 정리 — 0·1·2·3·4·5·6·7·8·9 한 줄 + \"0이 새 식구\" 표현"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"가위 보관통 3개 → `decrement_animation` 3→2→1→0 + 마지막 단계…", desc:"가위 보관통 3개 → `decrement_animation` 3→2→1→0 + 마지막 단계 `count_input` (정답 0)"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"크레파스 보관함 0개 → 하나씩 추가(0→1→2→3), 시작 0 인식 + `count_in…", desc:"크레파스 보관함 0개 → 하나씩 추가(0→1→2→3), 시작 0 인식 + `count_input` (정답 0)"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"\"사과 한 개 남았는데 한 개 더 가져가면?\" → `count_input` (정답 0)", desc:"\"사과 한 개 남았는데 한 개 더 가져가면?\" → `count_input` (정답 0)"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"match", data:{title:"0 ↔ '영' 매칭 — 숫자 0 카드와 한글 '영' 카드 짝짓기 (터치 매칭)", desc:"0 ↔ '영' 매칭 — 숫자 0 카드와 한글 '영' 카드 짝짓기 (터치 매칭)"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"일상 상황 — \"주머니에 사탕 있었는데 다 먹었어요. 지금 몇 개?\" → `count_in…", desc:"일상 상황 — \"주머니에 사탕 있었는데 다 먹었어요. 지금 몇 개?\" → `count_input` (정답 0)"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"바둑돌 5개 → \"0개로 만들려면 몇 번 덜어내야?\" → `count_input` (정답 …", desc:"바둑돌 5개 → \"0개로 만들려면 몇 번 덜어내야?\" → `count_input` (정답 5)"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"0과 1 비교 — \"0과 1 중 더 작은 수는?\" 두 카드 클릭(4지선다 X) → 10차 …", desc:"0과 1 비교 — \"0과 1 중 더 작은 수는?\" 두 카드 클릭(4지선다 X) → 10차 크기 비교 예고"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"0이 어울리는 상황 고르기 — 3장면(빈 책장·결석 0명·빵 가득) 중 \"0개\" 상황 선택", desc:"0이 어울리는 상황 고르기 — 3장면(빈 책장·결석 0명·빵 가득) 중 \"0개\" 상황 선택"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"핵심 정리 — 0~9 한 줄 카드 + \"0 = 아무것도 없음\" 한 줄", desc:"핵심 정리 — 0~9 한 줄 카드 + \"0 = 아무것도 없음\" 한 줄"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 별 평정 (0 의미·0 쓰기·일상 0 사례)", desc:"자기 평가 — `self_assessment` 별 평정 (0 의미·0 쓰기·일상 0 사례)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고 — \"다음 차시는 수의 크기 비교 — 3과 5 중 어느 쪽이 더 클까?\"", desc:"다음 차시 예고 — \"다음 차시는 수의 크기 비교 — 3과 5 중 어느 쪽이 더 클까?\""}, suggested_extras:[]},
  ],
  extras: []
};

LESSONS["u1_l10"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "10",
    title: "수의 크기를 비교해 볼까요",
    std: "[2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l10.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"흥미 유발 — 3모둠 고리 던지기 결과 카드(3·3·5), \"어느 모둠이 가장 많이 넣었을…", desc:"흥미 유발 — 3모둠 고리 던지기 결과 카드(3·3·5), \"어느 모둠이 가장 많이 넣었을까?\""}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"학습 목표 안내 — \"두 수의 크기를 비교해요\"", desc:"학습 목표 안내 — \"두 수의 크기를 비교해요\""}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"전시 학습 상기 — 09차 슬14 \"0과 1 중 더 작은 수는?\" 회수 (정답 0 카드)", desc:"전시 학습 상기 — 09차 슬14 \"0과 1 중 더 작은 수는?\" 회수 (정답 0 카드)"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"개념 도입 1 — 표현 구분: 양은 '많다/적다', 수는 '크다/작다'. 짝 한 줄 표시(…", desc:"개념 도입 1 — 표현 구분: 양은 '많다/적다', 수는 '크다/작다'. 짝 한 줄 표시(이모지 → 많다/적다 / 숫자 카드 → 크다/작다)"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"개념 도입 2 — 일대일대응 시각 (○○○ vs ○○○○○, 짝 그어진 SVG) → 남는 …", desc:"개념 도입 2 — 일대일대응 시각 (○○○ vs ○○○○○, 짝 그어진 SVG) → 남는 쪽이 '더 많다'. 줄잇기 메카닉 미사용 (정적 시각 자료만, 학생 인터랙션 X)"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"개념 도입 3 — **`ten_frame` 비교 모드 첫 등장** (6 vs 4 나란히, …", desc:"개념 도입 3 — **`ten_frame` 비교 모드 첫 등장** (6 vs 4 나란히, `mode=\"compare\" compareWith={4}`) → \"6은 4보다 크다 / 4는 6보다 작다\" 한 화면"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"개념 정리 — 양방향 표현 (08차 가역 사고 재사용): \"A는 B보다 크다 ↔ B는 A보…", desc:"개념 정리 — 양방향 표현 (08차 가역 사고 재사용): \"A는 B보다 크다 ↔ B는 A보다 작다\" 양방향 화살표"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"`ten_frame` 5 vs 3 → \"어느 쪽이 더 큰 수예요?\" — `compare_p…", desc:"`ten_frame` 5 vs 3 → \"어느 쪽이 더 큰 수예요?\" — `compare_picker target=\"larger\"` (왼쪽/오른쪽 클릭)"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"`ten_frame` 7 vs 8 → 한 칸 차이 인식 — `compare_picker t…", desc:"`ten_frame` 7 vs 8 → 한 칸 차이 인식 — `compare_picker target=\"smaller\"` (작은 쪽 클릭)"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"두 그룹 사과 vs 배 (5개 vs 7개 SVG) → 수 세어 입력 2자리(`count_i…", desc:"두 그룹 사과 vs 배 (5개 vs 7개 SVG) → 수 세어 입력 2자리(`count_input` 2자리) → 자동 비교 결과 표시"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"**카드 뒤집기 첫 등장** — `card_flip` 카드 2장(5·3), 학생이 양쪽 클…", desc:"**카드 뒤집기 첫 등장** — `card_flip` 카드 2장(5·3), 학생이 양쪽 클릭으로 뒤집고 큰 수 카드 클릭 → 가져감 표시"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"\"어떤 수가 6보다 작아요?\" → `count_input inputType=\"pad\"` (…", desc:"\"어떤 수가 6보다 작아요?\" → `count_input inputType=\"pad\"` (정답 0~5 중 한 개, 다중 정답)"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"\"5보다 크고 8보다 작은 수는?\" → `count_input` (정답 6 또는 7, 다중…", desc:"\"5보다 크고 8보다 작은 수는?\" → `count_input` (정답 6 또는 7, 다중 정답)"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"양방향 표현 — \"6은 4보다 ___ / 4는 6보다 ___\" 두 빈칸 선택(크다/작다 카…", desc:"양방향 표현 — \"6은 4보다 ___ / 4는 6보다 ___\" 두 빈칸 선택(크다/작다 카드 매칭)"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"`card_flip` 연속 3판 — 누가 더 많이 가져갈까? (카드 더미, 점수 누적)", desc:"`card_flip` 연속 3판 — 누가 더 많이 가져갈까? (카드 더미, 점수 누적)"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"핵심 정리 — `ten_frame` 비교 + 양방향 표현 + 0~9 한 줄 한 화면", desc:"핵심 정리 — `ten_frame` 비교 + 양방향 표현 + 0~9 한 줄 한 화면"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 별 평정 (일대일대응·ten_frame 비교…", desc:"자기 평가 — `self_assessment` 별 평정 (일대일대응·ten_frame 비교·양방향 표현)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시 예고 — \"다음 차시는 1단원 정리·평가\"", desc:"다음 차시 예고 — \"다음 차시는 1단원 정리·평가\""}, suggested_extras:[]},
  ],
  extras: []
};

LESSONS["u1_l11"] = {
  meta: {
    grade: 1, subject: "수학", unit: 1, n: "11",
    title: "수학이랑 확인해요 (단원 평가)",
    std: "[2수01-01], [2수01-03]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬",
    live_url: "../../grade1/semester1/math/1단원_9까지의수/g1_math_u1_l11.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"평가 안내 — \"1단원에서 배운 것을 확인해요\" 진입 슬 + 야채 농장 풍경(_SOURCE…", desc:"평가 안내 — \"1단원에서 배운 것을 확인해요\" 진입 슬 + 야채 농장 풍경(_SOURCE p.34)"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"단원 전체 회상 — 0~9 수·순서·±1·크기 비교 네 영역 한 화면 미니 카드", desc:"단원 전체 회상 — 0~9 수·순서·±1·크기 비교 네 영역 한 화면 미니 카드"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"motivate", data:{title:"자기 점검 — \"어느 부분이 자신 있나요?\" 별 평정 안내 (슬17 자기 평가 예고)", desc:"자기 점검 — \"어느 부분이 자신 있나요?\" 별 평정 안내 (슬17 자기 평가 예고)"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"trace", data:{title:"핵심 1 정리 — 수 세어 쓰기·읽기 (02-03·04-05차 종합) — `ten_fram…", desc:"핵심 1 정리 — 수 세어 쓰기·읽기 (02-03·04-05차 종합) — `ten_frame` 7개 + 숫자 카드"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"핵심 2 정리 — 수의 순서·기준 순서 (06·07차 종합) — 1~9 한 줄 + \"첫째~…", desc:"핵심 2 정리 — 수의 순서·기준 순서 (06·07차 종합) — 1~9 한 줄 + \"첫째~아홉째\""}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"핵심 3 정리 — ±1·0 (08·09차 종합) — `linking_cube` 0~9 계단…", desc:"핵심 3 정리 — ±1·0 (08·09차 종합) — `linking_cube` 0~9 계단 + ±1 화살표"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"compare", data:{title:"핵심 4 정리 — 두 수 크기 비교 (10차 종합) — `ten_frame mode=\"co…", desc:"핵심 4 정리 — 두 수 크기 비교 (10차 종합) — `ten_frame mode=\"compare\"` + 양방향 표현"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"match", data:{title:"**평가 1번** — 야채 4·9·7 수 세어 쓰기 (`count_input` 3자리) +…", desc:"**평가 1번** — 야채 4·9·7 수 세어 쓰기 (`count_input` 3자리) + 우리말·한자어 (\"넷·사\" 매칭)"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"**평가 2번** — 당근 3→2→1→0 (`decrement_animation` + 마지…", desc:"**평가 2번** — 당근 3→2→1→0 (`decrement_animation` + 마지막 단계 `count_input` 정답 0)"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"**평가 4번** — 1~9 빈칸 채우기 (`sequence_arrange directio…", desc:"**평가 4번** — 1~9 빈칸 채우기 (`sequence_arrange direction=\"asc\" range=[1,9]` 일부 출제)"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"**평가 5번** — 기준 순서 (왼쪽 여섯째 / 오른쪽 둘째, 책 9권 그림) — `po…", desc:"**평가 5번** — 기준 순서 (왼쪽 여섯째 / 오른쪽 둘째, 책 9권 그림) — `position_picker direction=\"both\" target={6/2}`"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"**평가 3번** — 3 vs 6 크기 비교 (`compare_picker target=\"…", desc:"**평가 3번** — 3 vs 6 크기 비교 (`compare_picker target=\"larger\"`) + 양방향 표현 (\"3은 6보다 작다 / 6은 3보다 크다\")"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"**평가 6번 일부** — 캔 5 → 유리병(캔보다 1 적음) — `more_less_on…", desc:"**평가 6번 일부** — 캔 5 → 유리병(캔보다 1 적음) — `more_less_one mode=\"choice4\" direction=\"less\" base={5}` (정답 4)"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"**평가 6번 일부** — 캔 5 → 페트병(캔보다 1 많음) — `more_less_on…", desc:"**평가 6번 일부** — 캔 5 → 페트병(캔보다 1 많음) — `more_less_one mode=\"choice4\" direction=\"more\" base={5}` (정답 6)"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"real_world", data:{title:"종합 — 분리배출 (캔 5·유리병 4·페트병 6 SVG, _SOURCE p.35) → 각 …", desc:"종합 — 분리배출 (캔 5·유리병 4·페트병 6 SVG, _SOURCE p.35) → 각 수 세어 입력 3자리 (`count_input` 3자리) + 실생활 연결"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"단원 학습 목표 7개 회수 — `_UNIT_STATUS.md` 단원 학습 목표 카드 (자기…", desc:"단원 학습 목표 7개 회수 — `_UNIT_STATUS.md` 단원 학습 목표 카드 (자기 정리)"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"자기 평가 — `self_assessment` 3차원 (지식·이해 / 과정·기능 / 가치·…", desc:"자기 평가 — `self_assessment` 3차원 (지식·이해 / 과정·기능 / 가치·태도, _SOURCE 자기 평가 3문항)"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 단원 예고 — \"다음 단원은 여러 가지 모양 — 동그라미·세모·네모를 찾아봐요\"", desc:"다음 단원 예고 — \"다음 단원은 여러 가지 모양 — 동그라미·세모·네모를 찾아봐요\""}, suggested_extras:[]},
  ],
  extras: []
};
