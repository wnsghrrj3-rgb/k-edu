/* ============================================================
   1학년 1학기 수학 — 4단원 「비교하기」 (7차시 + 단원평가)
   양산 자리 — LESSONS["u4_l{NN}"] 누적
   ------------------------------------------------------------
   진입 채팅: 케이티처 채팅 / 다른 단원 .js = read-only
   학년·과목 통합 파일 g1_math.html이 자동 로드 후
   window.LESSONS 객체에 누적시킴.
   ------------------------------------------------------------
   진척:
   - cycle A (본 차시 인덱스): u4_02·03·04·05·07 ✅
   - cycle B (단원 도입): u4_01 ✅
   - 단원 평가: u4_06 ✅ (평가 구조를 5단계로 흡수)
   - 대기: cycle C(extras 풍부화 차시당 10~15건 · suggested_extras 매핑 · _extra 5개)
============================================================ */


LESSONS["u4_l01"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 1,
    title: "비교하기를 시작해요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "단원 도입 18슬 — 비교하기 4가지 미리보기 + 실천 다짐",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_01_단원도입.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"비교하기를 시작해요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘부터 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"4가지 비교 만나기", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"필통에 무엇을 넣을까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"책가방에 무엇을 넣을까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"왜 그렇게 나누었을까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"비교의 의미", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"실천 활동 1 · 길이 비교", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"실천 활동 2 · 무게 비교", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"실천 활동 3 · 넓이 비교", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"실천 활동 4 · 들이 비교", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"어떤 활동을 해 볼까요?", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"가족과 함께 해 봐요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"친구들은 무엇을 골랐을까요?", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"실천해요 표", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"나의 다짐", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u4_l02"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 2,
    title: "어느 것이 더 길까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 길이 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_02_어느것이더길까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"어느 우산을 가져가고 싶나요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 만난 4가지", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"눈으로 보아 알 수 있어요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"끝을 맞추어 비교해요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'길다'와 '짧다'", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"세 가지를 비교하면?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u4_l03"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 3,
    title: "어느 것이 더 무거울까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 무게 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_03_어느것이더무거울까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"어느 것을 들 수 있을까요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간 끝나고", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"양손으로 들어 봐요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"양팔저울로 확인해요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'무겁다'와 '가볍다'", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"크면 더 무거울까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u4_l04"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 4,
    title: "어느 것이 더 넓을까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 넓이 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_04_어느것이더넓을까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"어느 돗자리에 앉고 싶나요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"길이·무게를 배웠으니", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"눈으로 보아 알 수 있어요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"겹쳐 보기로 비교해요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'넓다'와 '좁다'", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"세 가지를 비교하면?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u4_l05"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 5,
    title: "어느 것에 더 많이 담을 수 있을까요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 들이 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_05_어느것에더많이담을수있을까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"운동회 날, 어느 물통을?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"길이·무게·넓이를 배웠으니", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"눈으로 보아 알 수 있어요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"물을 옮겨 담아 보아요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'많다'와 '적다'", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"담을 수 있는 양? 담긴 양?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u4_l06"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 6,
    title: "수학이랑 확인해요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "단원 평가 18슬 — 문제 5 + 해설 + 자기평가",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_06_수학이랑확인해요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"objective", data:{title:"단원 평가를 시작해요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"기본문제", block:"basic_problem", data:{title:"연필보다 더 긴 선을 그어요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s03", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s04", stage:"기본문제", block:"basic_problem", data:{title:"더 가벼운 것을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s05", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s06", stage:"기본문제", block:"basic_problem", data:{title:"담을 수 있는 양이 더 많은 것을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s07", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"빨간 방석보다 더 넓은 방석을 그려요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"응용문제", block:"advanced_problem", data:{title:"알맞은 말 붙임딱지를 빈칸에 끌어다 놓아요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s11", stage:"응용문제", block:"advanced_problem", data:{title:"첫 두 문장이에요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"남은 두 문장이에요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요 ①", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s14", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요 ②", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s15", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요 ③", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"평가 결과를 확인해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"review", data:{title:"단원에서 실천한 활동은?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"단원을 마무리해요", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};

LESSONS["u4_l07"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 7,
    title: "수학이랑 만들어요",
    std: "[2수03-01]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 비교하기 종합 만들기 활동",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_07_수학이랑만들어요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"점토로 만들어 봐요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"비교하기 5가지를 만나요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"미리 만든 점토 작품들", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"긴 뱀과 사과 — 어느 것이 더 길까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"사과와 동그란 공 — 어느 것이 더 무거울까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"다음은 넓이와 들이예요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"단원에서 만난 5가지", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:[]}
  ],
  extras: []
};
