/* ============================================================
   1학년 1학기 수학 — 4단원 「비교하기」 (7차시 + 단원평가)
   양산 영역 — LESSONS["u4_l{NN}"] 누적 / 다른 단원 .js = read-only
   g1_math.html이 자동 로드 후 window.LESSONS 에 누적.
   ------------------------------------------------------------
   진척:
   - cycle A/B (인덱스): u4_01~07 ✅
   - cycle C (extras 풍부화): 전 7차시 ✅ (l01 도입·l02~05 측정·l06 평가·l07 만들기)
   - 4단원 케이티처 데이터 = 완료
============================================================ */


LESSONS["u4_l01"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 1,
    title: "비교하기를 시작해요",
    std: "[2수03-06]",
    duration_min: 40,
    lesson_format: "단원 도입 18슬 — 비교하기 4가지 미리보기 + 실천 다짐",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_01_단원도입.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"비교하기를 시작해요", desc:"1단계 · 도입"}, suggested_extras:["v_l1_intro", "q_l1_around", "b_l1_book"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘부터 배울 것", desc:"1단계 · 도입"}, suggested_extras:["t_l1_four"]},
    {id:"s03", stage:"도입", block:"review", data:{title:"4가지 비교 만나기", desc:"1단계 · 도입"}, suggested_extras:["q_l1_words"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"필통에 무엇을 넣을까요?", desc:"2단계 · 전개"}, suggested_extras:["t_l1_daily", "x_l1_one"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"책가방에 무엇을 넣을까요?", desc:"2단계 · 전개"}, suggested_extras:["g_l1_match"]},
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
    {id:"s16", stage:"정리", block:"summary", data:{title:"나의 다짐", desc:"5단계 · 정리"}, suggested_extras:["r_l1_home", "r_l1_market"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l1_plan"]}
  ],
  extras: [
    {id:"v_l1_intro", type:"video", icon:"🎥", title:"비교하기 4가지 미리보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EB%B9%84%EA%B5%90%ED%95%98%EA%B8%B0%20%EA%B8%B8%EC%9D%B4%20%EB%AC%B4%EA%B2%8C%20%EB%84%93%EC%9D%B4%20%EB%93%A4%EC%9D%B4", description:"길이·무게·넓이·들이 네 가지 비교를 한눈에 보여 주는 영상. 단원 첫 시간 흥미 유발용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "concept"]},
    {id:"q_l1_around", type:"fun_question", icon:"💡", title:"교실에서 비교할 것 찾기", content:"교실을 둘러보며 '더 긴 것, 더 무거운 것, 더 넓은 것, 더 많이 담기는 것'을 하나씩 찾아볼까요?", fit_slides:["motivate", "concept"]},
    {id:"q_l1_words", type:"fun_question", icon:"💡", title:"비교하는 말 모으기", content:"길다·짧다, 무겁다·가볍다, 넓다·좁다, 많다·적다 — 우리가 쓰는 비교 말을 함께 모아 봐요.", fit_slides:["concept"]},
    {id:"t_l1_four", type:"tip", icon:"🧩", title:"네 가지를 묶어 보여 주기", content:"길이·무게·넓이·들이를 따로가 아니라 '무엇을 견주는가'로 묶어 주면 아이가 단원 전체 그림을 잡아요.", fit_slides:["concept", "objective"]},
    {id:"t_l1_daily", type:"tip", icon:"🧩", title:"생활 장면으로 시작", content:"가방 싸기, 물 따르기처럼 익숙한 장면에서 비교가 쓰인다는 걸 먼저 보여 주면 동기가 살아나요.", fit_slides:["motivate"]},
    {id:"r_l1_home", type:"real_world", icon:"🌍", title:"집에서도 비교해요", content:"신발 정리, 물병 고르기, 이불 펴기 — 집안일 속에 네 가지 비교가 다 숨어 있어요.", fit_slides:["real_world", "motivate"]},
    {id:"r_l1_market", type:"real_world", icon:"🌍", title:"시장 속 비교", content:"과일 무게 달기, 큰 봉지 고르기처럼 시장에서도 비교를 늘 해요.", fit_slides:["real_world"]},
    {id:"g_l1_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"무엇을 비교할까 짝짓기", description:"상황과 어울리는 비교 종류를 짝지어 보세요.", hint:"무엇을 견주는지 생각해요.", pairs:[{a:{text:"연필 두 자루"}, b:{text:"길이"}}, {a:{text:"가방과 책"}, b:{text:"무게"}}, {a:{text:"방석 두 장"}, b:{text:"넓이"}}, {a:{text:"컵과 병"}, b:{text:"들이"}}], fit_slides:["concept", "game"]},
    {id:"b_l1_book", type:"book", icon:"📖", title:"『크다 작다 많다 적다』", content:"여러 비교 말을 그림으로 두루 만나 보는 그림책. 단원 도입에 어울려요.", source:"도서관 그림책 코너에서 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l1_one", type:"misconception", icon:"❓", title:"오개념 — 비교는 길이뿐?", content:"비교를 '길이 재기'로만 좁게 알기 쉬워요. 무게·넓이·들이도 모두 비교라는 걸 처음에 넓게 잡아 주세요.", fit_slides:["concept"]},
    {id:"e_l1_plan", type:"extension", icon:"⬆", title:"나의 비교 일기", content:"하루 동안 찾은 비교를 한 가지씩 적어 오게 하면 단원 내내 동기가 이어져요.", fit_slides:["next_lesson", "self_assessment"]}
  ]
};

LESSONS["u4_l02"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 2,
    title: "어느 것이 더 길까요",
    std: "[2수03-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 길이 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_02_어느것이더길까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"어느 우산을 가져가고 싶나요?", desc:"1단계 · 도입"}, suggested_extras:["v_l2_len", "q_l2_pencil", "b_l2_book"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 만난 4가지", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"눈으로 보아 알 수 있어요", desc:"2단계 · 전개"}, suggested_extras:["t_l2_align", "r_l2_height"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"끝을 맞추어 비교해요", desc:"2단계 · 전개"}, suggested_extras:["t_l2_align", "t_l2_hands"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'길다'와 '짧다'", desc:"2단계 · 전개"}, suggested_extras:["q_l2_arm"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"세 가지를 비교하면?", desc:"2단계 · 전개"}, suggested_extras:["x_l2_start", "g_l2_match"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["r_l2_train"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l2_string"]}
  ],
  extras: [
    {id:"v_l2_len", type:"video", icon:"🎥", title:"길이를 비교해요 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EA%B8%B8%EC%9D%B4%20%EB%B9%84%EA%B5%90%20%EA%B8%B8%EB%8B%A4%20%EC%A7%A7%EB%8B%A4", description:"여러 물건의 길이를 끝을 맞추어 비교하는 과정을 보여 주는 영상. 도입에서 흥미를 끌 때 활용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "concept"]},
    {id:"q_l2_pencil", type:"fun_question", icon:"💡", title:"연필과 지우개, 어느 게 더 길까?", content:"필통 속 연필과 지우개를 꺼내 끝을 나란히 맞춰 봐요. 어느 것이 더 길까요?", fit_slides:["motivate", "concept"]},
    {id:"q_l2_arm", type:"fun_question", icon:"💡", title:"내 팔과 친구 팔", content:"짝꿍과 팔을 나란히 대 보아요. 누구 팔이 더 길까요? 끝을 꼭 맞추어야 정확해요.", fit_slides:["concept"]},
    {id:"t_l2_align", type:"tip", icon:"🧩", title:"한쪽 끝을 꼭 맞추기", content:"길이를 비교할 때는 한쪽 끝을 같은 자리에서 출발시켜야 해요. 시작점이 어긋나면 길이를 잘못 볼 수 있어요.", fit_slides:["concept"]},
    {id:"t_l2_hands", type:"tip", icon:"🧩", title:"먼저 손으로, 다음에 눈으로", content:"끈이나 막대를 직접 대 보고 비교하게 한 뒤 눈대중으로 넘어가면 '끝 맞추기' 감각이 단단해져요.", fit_slides:["concept"]},
    {id:"r_l2_height", type:"real_world", icon:"🌍", title:"키 재기", content:"보건실에서 키를 잴 때도 발끝을 같은 바닥에 맞춰요. 길이 비교의 '끝 맞추기'와 똑같아요.", fit_slides:["real_world", "concept"]},
    {id:"r_l2_train", type:"real_world", icon:"🌍", title:"기차와 자동차", content:"기차는 칸이 여러 개라 자동차보다 훨씬 길어요. 생활 속에서 길고 짧은 것을 찾아보아요.", fit_slides:["real_world", "motivate"]},
    {id:"g_l2_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"길이 말 짝짓기", description:"물건과 어울리는 길이 표현을 짝지어 보세요.", hint:"긴 것과 짧은 것을 떠올려요.", pairs:[{a:{text:"기차"}, b:{text:"아주 길다"}}, {a:{text:"색연필"}, b:{text:"짧다"}}, {a:{text:"버스"}, b:{text:"길다"}}, {a:{text:"클립"}, b:{text:"아주 짧다"}}], fit_slides:["concept", "game"]},
    {id:"b_l2_book", type:"book", icon:"📖", title:"『긴 줄 짧은 줄』", content:"길고 짧은 것을 그림으로 견주어 보며 길이 감각을 키우는 그림책.", source:"도서관 그림책 코너에서 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l2_start", type:"misconception", icon:"❓", title:"오개념 — 끝만 보고 판단하기", content:"한쪽 끝이 더 튀어나왔다고 무조건 길다고 보면 안 돼요. 반대쪽 시작점이 맞는지 함께 확인해야 해요.", fit_slides:["concept"]},
    {id:"e_l2_string", type:"extension", icon:"⬆", title:"끈으로 옮겨 재기", content:"직접 댈 수 없는 물건은 끈을 대어 길이를 옮긴 뒤 비교해 봐요. 다음 단계의 간접 비교로 이어져요.", fit_slides:["next_lesson", "concept"]}
  ]
};

LESSONS["u4_l03"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 3,
    title: "어느 것이 더 무거울까요",
    std: "[2수03-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 무게 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_03_어느것이더무거울까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"어느 것을 들 수 있을까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l3_wt", "q_l3_hand", "b_l3_book"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간 끝나고", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"양손으로 들어 봐요", desc:"2단계 · 전개"}, suggested_extras:["t_l3_feel"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"양팔저울로 확인해요", desc:"2단계 · 전개"}, suggested_extras:["t_l3_scale", "r_l3_play"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'무겁다'와 '가볍다'", desc:"2단계 · 전개"}, suggested_extras:["q_l3_seesaw"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"크면 더 무거울까요?", desc:"2단계 · 전개"}, suggested_extras:["x_l3_big", "g_l3_match"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["r_l3_bag"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l3_unit"]}
  ],
  extras: [
    {id:"v_l3_wt", type:"video", icon:"🎥", title:"무게를 비교해요 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EB%AC%B4%EA%B2%8C%20%EB%B9%84%EA%B5%90%20%EB%AC%B4%EA%B2%81%EB%8B%A4%20%EA%B0%80%EB%B3%8D%EB%8B%A4%20%EC%96%91%ED%8C%94%EC%A0%80%EC%9A%B8", description:"양손과 양팔저울로 무게를 견주는 과정을 보여 주는 영상. 도입·전개에 활용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "concept"]},
    {id:"q_l3_hand", type:"fun_question", icon:"💡", title:"양손에 하나씩", content:"한 손엔 지우개, 다른 손엔 가위를 들어 봐요. 어느 쪽 손이 더 아래로 내려가나요?", fit_slides:["motivate", "concept"]},
    {id:"q_l3_seesaw", type:"fun_question", icon:"💡", title:"누가 타면 내려갈까?", content:"시소에 형과 동생이 타면 어느 쪽이 내려갈까요? 무거운 쪽이 내려가요.", fit_slides:["concept", "real_world"]},
    {id:"t_l3_scale", type:"tip", icon:"🧩", title:"양팔저울이 약속", content:"손 느낌은 사람마다 달라요. 양팔저울로 확인하면 누구나 같은 결과를 얻어요. '내려간 쪽이 무겁다'를 약속으로 정해 주세요.", fit_slides:["concept"]},
    {id:"t_l3_feel", type:"tip", icon:"🧩", title:"손으로 먼저 느끼기", content:"저울에 올리기 전 양손으로 들어 무게를 어림하게 하면 예상과 결과를 견주는 재미가 생겨요.", fit_slides:["concept"]},
    {id:"r_l3_bag", type:"real_world", icon:"🌍", title:"장바구니", content:"마트에서 산 물병은 무겁고 과자는 가벼워요. 장바구니를 들 때 무게를 몸으로 느껴요.", fit_slides:["real_world", "concept"]},
    {id:"r_l3_play", type:"real_world", icon:"🌍", title:"놀이터 시소", content:"시소는 무게 비교 도구예요. 무거운 친구 쪽이 내려가고 가벼운 친구 쪽이 올라가요.", fit_slides:["real_world", "concept"]},
    {id:"g_l3_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"무게 말 짝짓기", description:"물건과 어울리는 무게 표현을 짝지어 보세요.", hint:"무거운 것과 가벼운 것을 떠올려요.", pairs:[{a:{text:"코끼리"}, b:{text:"무겁다"}}, {a:{text:"깃털"}, b:{text:"가볍다"}}, {a:{text:"수박"}, b:{text:"무겁다"}}, {a:{text:"풍선"}, b:{text:"가볍다"}}], fit_slides:["concept", "game"]},
    {id:"b_l3_book", type:"book", icon:"📖", title:"『무거워, 가벼워』", content:"여러 동물과 물건의 무게를 견주어 보며 무게 말을 익히는 그림책.", source:"도서관 그림책 코너에서 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l3_big", type:"misconception", icon:"❓", title:"오개념 — 크면 무겁다?", content:"큰 풍선이 작은 돌보다 가벼울 수 있어요. 크기와 무게는 늘 같이 가지 않아요. 직접 저울로 확인해 주세요.", fit_slides:["concept"]},
    {id:"e_l3_unit", type:"extension", icon:"⬆", title:"똑같은 것 몇 개로 재기", content:"공깃돌 몇 개와 같은 무게인지 세어 보면 무게를 수로 나타낼 수 있어요. 다음 단계로 이어지는 생각이에요.", fit_slides:["next_lesson", "concept"]}
  ]
};

LESSONS["u4_l04"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 4,
    title: "어느 것이 더 넓을까요",
    std: "[2수03-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 넓이 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_04_어느것이더넓을까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"어느 돗자리에 앉고 싶나요?", desc:"1단계 · 도입"}, suggested_extras:["v_l4_area", "q_l4_book", "b_l4_book"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"길이·무게를 배웠으니", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"눈으로 보아 알 수 있어요", desc:"2단계 · 전개"}, suggested_extras:["t_l4_overlap"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"겹쳐 보기로 비교해요", desc:"2단계 · 전개"}, suggested_extras:["t_l4_overlap", "t_l4_corner"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'넓다'와 '좁다'", desc:"2단계 · 전개"}, suggested_extras:["q_l4_hand"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"세 가지를 비교하면?", desc:"2단계 · 전개"}, suggested_extras:["x_l4_long", "g_l4_match"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["r_l4_blanket", "r_l4_field"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l4_grid"]}
  ],
  extras: [
    {id:"v_l4_area", type:"video", icon:"🎥", title:"넓이를 비교해요 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EB%84%93%EC%9D%B4%20%EB%B9%84%EA%B5%90%20%EB%84%93%EB%8B%A4%20%EC%A2%81%EB%8B%A4%20%EA%B2%B9%EC%B3%90%EB%B3%B4%EA%B8%B0", description:"두 면을 겹쳐서 넓고 좁음을 견주는 과정을 보여 주는 영상. 도입·전개에 활용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "concept"]},
    {id:"q_l4_book", type:"fun_question", icon:"💡", title:"공책과 교과서, 어느 게 더 넓을까?", content:"공책 위에 교과서를 겹쳐 올려 봐요. 어느 것이 더 넓은 자리를 차지하나요?", fit_slides:["motivate", "concept"]},
    {id:"q_l4_hand", type:"fun_question", icon:"💡", title:"내 손과 친구 손", content:"손바닥을 맞대어 겹쳐 봐요. 누구 손이 더 넓은가요? 겹쳐 보면 한눈에 알 수 있어요.", fit_slides:["concept"]},
    {id:"t_l4_overlap", type:"tip", icon:"🧩", title:"겹쳐서 비교하기", content:"넓이는 한쪽을 다른 쪽 위에 겹쳐 보면 쉬워요. 남는 부분이 있는 쪽이 더 넓어요.", fit_slides:["concept"]},
    {id:"t_l4_corner", type:"tip", icon:"🧩", title:"모서리를 맞추기", content:"겹칠 때 한 귀퉁이를 딱 맞추면 남는 부분이 또렷하게 보여요. 길이의 '끝 맞추기'와 같은 원리예요.", fit_slides:["concept"]},
    {id:"r_l4_blanket", type:"real_world", icon:"🌍", title:"이불과 방석", content:"이불은 방석보다 훨씬 넓어 몸을 다 덮어요. 집 안에서 넓은 것과 좁은 것을 찾아보아요.", fit_slides:["real_world", "concept"]},
    {id:"r_l4_field", type:"real_world", icon:"🌍", title:"운동장과 교실", content:"운동장은 교실보다 넓어 여럿이 뛰어놀 수 있어요. 넓을수록 더 많은 자리가 생겨요.", fit_slides:["real_world", "motivate"]},
    {id:"g_l4_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"넓이 말 짝짓기", description:"장소·물건과 어울리는 넓이 표현을 짝지어 보세요.", hint:"넓은 것과 좁은 것을 떠올려요.", pairs:[{a:{text:"운동장"}, b:{text:"넓다"}}, {a:{text:"우표"}, b:{text:"좁다"}}, {a:{text:"이불"}, b:{text:"넓다"}}, {a:{text:"손수건"}, b:{text:"좁다"}}], fit_slides:["concept", "game"]},
    {id:"b_l4_book", type:"book", icon:"📖", title:"『넓은 들 좁은 길』", content:"넓고 좁은 곳을 그림으로 견주며 넓이 말을 익히는 그림책.", source:"도서관 그림책 코너에서 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l4_long", type:"misconception", icon:"❓", title:"오개념 — 길면 넓다?", content:"가늘고 긴 띠는 길지만 넓지 않을 수 있어요. 길이와 넓이는 달라요. 겹쳐서 차지하는 자리로 봐야 해요.", fit_slides:["concept"]},
    {id:"e_l4_grid", type:"extension", icon:"⬆", title:"칸으로 세어 보기", content:"똑같은 네모 칸이 몇 개 들어가는지 세면 넓이를 수로 나타낼 수 있어요. 다음 단계로 이어지는 생각이에요.", fit_slides:["next_lesson", "concept"]}
  ]
};

LESSONS["u4_l05"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 5,
    title: "어느 것에 더 많이 담을 수 있을까요",
    std: "[2수03-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 들이 비교",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_05_어느것에더많이담을수있을까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"운동회 날, 어느 물통을?", desc:"1단계 · 도입"}, suggested_extras:["v_l5_vol", "q_l5_cup", "b_l5_book"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"길이·무게·넓이를 배웠으니", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"눈으로 보아 알 수 있어요", desc:"2단계 · 전개"}, suggested_extras:["t_l5_fill"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"물을 옮겨 담아 보아요", desc:"2단계 · 전개"}, suggested_extras:["t_l5_same", "t_l5_fill"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"'많다'와 '적다'", desc:"2단계 · 전개"}, suggested_extras:["q_l5_pour"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"담을 수 있는 양? 담긴 양?", desc:"2단계 · 전개"}, suggested_extras:["x_l5_tall", "g_l5_match"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["r_l5_bath", "r_l5_bottle"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l5_count"]}
  ],
  extras: [
    {id:"v_l5_vol", type:"video", icon:"🎥", title:"들이를 비교해요 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EB%93%A4%EC%9D%B4%20%EB%B9%84%EA%B5%90%20%EB%8B%B4%EC%9D%84%20%EC%88%98%20%EC%9E%88%EB%8A%94%20%EC%96%91%20%EC%BB%B5%20%EB%AC%BC", description:"같은 물을 여러 그릇에 옮겨 담아 들이를 견주는 과정을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "concept"]},
    {id:"q_l5_cup", type:"fun_question", icon:"💡", title:"컵과 양동이, 어디에 더 담길까?", content:"컵과 양동이에 물을 가득 담으면 어디에 더 많이 담길까요?", fit_slides:["motivate", "concept"]},
    {id:"q_l5_pour", type:"fun_question", icon:"💡", title:"옮겨 담아 보면?", content:"한 그릇의 물을 다른 그릇에 옮겨 담아 봐요. 넘치면 옮긴 쪽이 더 적게 담기는 그릇이에요.", fit_slides:["concept"]},
    {id:"t_l5_same", type:"tip", icon:"🧩", title:"같은 컵으로 옮겨 담기", content:"똑같은 컵으로 몇 번 담기는지 세면 어느 그릇이 더 많이 담는지 정확히 알 수 있어요.", fit_slides:["concept"]},
    {id:"t_l5_fill", type:"tip", icon:"🧩", title:"가득 채워서 비교", content:"들이를 비교할 땐 그릇을 가득 채워야 공평해요. 덜 채우면 잘못 견주게 돼요.", fit_slides:["concept"]},
    {id:"r_l5_bath", type:"real_world", icon:"🌍", title:"욕조와 세숫대야", content:"욕조는 세숫대야보다 훨씬 많은 물을 담아요. 생활 속 그릇의 들이를 견주어 보아요.", fit_slides:["real_world", "concept"]},
    {id:"r_l5_bottle", type:"real_world", icon:"🌍", title:"물병과 우유갑", content:"물병과 우유갑 중 어디에 더 많이 담길까요? 마트에서 담는 양을 살펴보아요.", fit_slides:["real_world", "motivate"]},
    {id:"g_l5_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"들이 말 짝짓기", description:"그릇과 어울리는 들이 표현을 짝지어 보세요.", hint:"많이 담기는 것과 적게 담기는 것을 떠올려요.", pairs:[{a:{text:"양동이"}, b:{text:"많이 담겨요"}}, {a:{text:"숟가락"}, b:{text:"적게 담겨요"}}, {a:{text:"주전자"}, b:{text:"많이 담겨요"}}, {a:{text:"종이컵"}, b:{text:"적게 담겨요"}}], fit_slides:["concept", "game"]},
    {id:"b_l5_book", type:"book", icon:"📖", title:"『가득가득 비어비어』", content:"여러 그릇에 물을 담아 보며 들이를 견주는 그림책.", source:"도서관 그림책 코너에서 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l5_tall", type:"misconception", icon:"❓", title:"오개념 — 키 크면 많이 담긴다?", content:"길쭉한 컵이 넓적한 그릇보다 적게 담길 수 있어요. 높이만으로 들이를 판단하면 안 돼요. 옮겨 담아 확인해요.", fit_slides:["concept"]},
    {id:"e_l5_count", type:"extension", icon:"⬆", title:"컵 수로 나타내기", content:"같은 컵으로 몇 컵 담기는지 세면 들이를 수로 말할 수 있어요. 다음 단계로 이어지는 생각이에요.", fit_slides:["next_lesson", "concept"]}
  ]
};

LESSONS["u4_l06"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 6,
    title: "수학이랑 확인해요",
    std: "[2수03-06]",
    duration_min: 40,
    lesson_format: "단원 평가 18슬 — 문제 5 + 해설 + 자기평가",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_06_수학이랑확인해요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"objective", data:{title:"단원 평가를 시작해요", desc:"1단계 · 도입"}, suggested_extras:["v_l6_review"]},
    {id:"s02", stage:"기본문제", block:"basic_problem", data:{title:"연필보다 더 긴 선을 그어요", desc:"3단계 · 기본문제"}, suggested_extras:["q_l6_why"]},
    {id:"s03", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:["t_l6_wrong"]},
    {id:"s04", stage:"기본문제", block:"basic_problem", data:{title:"더 가벼운 것을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s05", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s06", stage:"기본문제", block:"basic_problem", data:{title:"담을 수 있는 양이 더 많은 것을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s07", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"빨간 방석보다 더 넓은 방석을 그려요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"정답이에요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"응용문제", block:"advanced_problem", data:{title:"알맞은 말 붙임딱지를 빈칸에 끌어다 놓아요", desc:"4단계 · 응용문제"}, suggested_extras:["x_l6_mix"]},
    {id:"s11", stage:"응용문제", block:"advanced_problem", data:{title:"첫 두 문장이에요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"남은 두 문장이에요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요 ①", desc:"5단계 · 정리"}, suggested_extras:["q_l6_pick"]},
    {id:"s14", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요 ②", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s15", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요 ③", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"평가 결과를 확인해요", desc:"5단계 · 정리"}, suggested_extras:["t_l6_method", "g_l6_match", "r_l6_use", "b_l6_book"]},
    {id:"s17", stage:"정리", block:"review", data:{title:"단원에서 실천한 활동은?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"단원을 마무리해요", desc:"5단계 · 정리"}, suggested_extras:["e_l6_make"]}
  ],
  extras: [
    {id:"v_l6_review", type:"video", icon:"🎥", title:"비교하기 총정리 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EB%B9%84%EA%B5%90%ED%95%98%EA%B8%B0%20%EB%8B%A8%EC%9B%90%20%EC%A0%95%EB%A6%AC%20%EA%B8%B8%EC%9D%B4%20%EB%AC%B4%EA%B2%8C%20%EB%84%93%EC%9D%B4%20%EB%93%A4%EC%9D%B4", description:"네 가지 비교를 빠르게 되짚는 정리 영상. 평가 전 복습에 활용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["objective", "summary"]},
    {id:"q_l6_pick", type:"fun_question", icon:"💡", title:"가장 자신 있는 비교는?", content:"길이·무게·넓이·들이 중 어떤 비교가 가장 쉬웠나요? 어려웠던 건 무엇인가요?", fit_slides:["self_assessment", "summary"]},
    {id:"q_l6_why", type:"fun_question", icon:"💡", title:"왜 그렇게 골랐어요?", content:"답을 고른 까닭을 친구에게 말로 설명해 봐요. 설명하면 더 단단해져요.", fit_slides:["basic_problem", "advanced_problem"]},
    {id:"t_l6_wrong", type:"tip", icon:"🧩", title:"오답은 보물", content:"틀린 문제는 어디서 헷갈렸는지 함께 짚어 주세요. 끝 맞추기·겹치기·옮겨 담기 중 무엇을 빠뜨렸는지 돌아보면 좋아요.", fit_slides:["basic_problem", "advanced_problem"]},
    {id:"t_l6_method", type:"tip", icon:"🧩", title:"방법으로 묶어 점검", content:"문제를 '직접 대보기·겹쳐보기·옮겨담기'로 묶어 보면 아이가 비교 방법을 정리하기 쉬워요.", fit_slides:["summary"]},
    {id:"r_l6_use", type:"real_world", icon:"🌍", title:"배운 걸 어디에 쓸까", content:"가방 무게 줄이기, 큰 그릇 고르기처럼 오늘 배운 비교를 생활에서 어디에 쓸지 이야기해 봐요.", fit_slides:["real_world", "summary"]},
    {id:"g_l6_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"비교 방법 짝짓기", description:"비교 종류와 알맞은 방법을 짝지어 보세요.", hint:"각 비교를 어떻게 했는지 떠올려요.", pairs:[{a:{text:"길이"}, b:{text:"끝을 맞춰 대보기"}}, {a:{text:"무게"}, b:{text:"양팔저울로"}}, {a:{text:"넓이"}, b:{text:"겹쳐 보기"}}, {a:{text:"들이"}, b:{text:"옮겨 담기"}}], fit_slides:["summary", "game"]},
    {id:"b_l6_book", type:"book", icon:"📖", title:"『비교 박사가 되었어요』", content:"여러 비교를 두루 복습하며 마무리하기 좋은 그림책.", source:"도서관 그림책 코너에서 확인", fit_slides:["summary", "self_assessment"]},
    {id:"x_l6_mix", type:"misconception", icon:"❓", title:"오개념 — 방법을 뒤섞기", content:"넓이를 길이처럼 끝만 맞춰 보거나, 들이를 높이로만 보는 실수가 잦아요. 비교마다 방법이 다름을 다시 짚어요.", fit_slides:["basic_problem", "summary"]},
    {id:"e_l6_make", type:"extension", icon:"⬆", title:"내가 문제 내기", content:"배운 비교로 친구에게 낼 문제를 직접 만들어 보면 이해가 한층 깊어져요.", fit_slides:["next_lesson", "advanced_problem"]}
  ]
};

LESSONS["u4_l07"] = {
  meta: {
    grade: 1, subject: "수학", unit: 4, n: 7,
    title: "수학이랑 만들어요",
    std: "[2수03-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 비교하기 종합 만들기 활동",
    live_url: "../../grade1/semester1/math/4단원_비교하기/재수정_v1/g1_math_u4_07_수학이랑만들어요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"점토로 만들어 봐요", desc:"1단계 · 도입"}, suggested_extras:["v_l7_make", "q_l7_what", "b_l7_book"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"비교하기 5가지를 만나요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"미리 만든 점토 작품들", desc:"2단계 · 전개"}, suggested_extras:["t_l7_simple", "x_l7_fair"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"긴 뱀과 사과 — 어느 것이 더 길까요?", desc:"2단계 · 전개"}, suggested_extras:["q_l7_team"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"사과와 동그란 공 — 어느 것이 더 무거울까요?", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"다음은 넓이와 들이예요", desc:"2단계 · 전개"}, suggested_extras:["g_l7_match"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:["t_l7_share"]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"단원에서 만난 5가지", desc:"5단계 · 정리"}, suggested_extras:["r_l7_class", "r_l7_home"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l7_book2"]}
  ],
  extras: [
    {id:"v_l7_make", type:"video", icon:"🎥", title:"비교 놀이 만들기 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1%201%ED%95%99%EB%85%84%20%EC%88%98%ED%95%99%20%EB%B9%84%EA%B5%90%ED%95%98%EA%B8%B0%20%EB%86%80%EC%9D%B4%20%EB%A7%8C%EB%93%A4%EA%B8%B0%20%ED%99%9C%EB%8F%99", description:"비교를 활용한 간단한 만들기·놀이 활동 예시 영상. 활동 안내에 활용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "concept"]},
    {id:"q_l7_what", type:"fun_question", icon:"💡", title:"무엇을 만들어 볼까?", content:"길이·무게·넓이·들이 중 무엇으로 놀이를 만들어 볼까요? 가장 재미있을 것 같은 걸 골라 봐요.", fit_slides:["motivate", "concept"]},
    {id:"q_l7_team", type:"fun_question", icon:"💡", title:"누구와 함께 할까?", content:"짝과 함께 비교 놀이를 만들면 더 즐거워요. 역할을 어떻게 나눌까요?", fit_slides:["concept", "advanced_problem"]},
    {id:"t_l7_simple", type:"tip", icon:"🧩", title:"작게 시작하기", content:"처음엔 두 가지만 견주는 단순한 활동으로 시작하면 누구나 성공 경험을 가져요.", fit_slides:["basic_problem", "concept"]},
    {id:"t_l7_share", type:"tip", icon:"🧩", title:"만든 걸 나누기", content:"각자 만든 비교 놀이를 친구와 바꿔 해 보면 활동이 두 배로 풍성해져요.", fit_slides:["advanced_problem", "summary"]},
    {id:"r_l7_home", type:"real_world", icon:"🌍", title:"집에서 만드는 비교 놀이", content:"집에 있는 물건으로 '더 무거운 것 찾기' 같은 놀이를 가족과 만들어 봐요.", fit_slides:["real_world", "next_lesson"]},
    {id:"r_l7_class", type:"real_world", icon:"🌍", title:"우리 반 비교 전시", content:"만든 활동을 교실 한쪽에 모아 두면 쉬는 시간에도 비교 놀이를 즐길 수 있어요.", fit_slides:["real_world", "summary"]},
    {id:"g_l7_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"활동과 준비물 짝짓기", description:"비교 놀이와 어울리는 준비물을 짝지어 보세요.", hint:"무엇으로 견줄지 생각해요.", pairs:[{a:{text:"길이 재기 놀이"}, b:{text:"끈·막대"}}, {a:{text:"무게 견주기"}, b:{text:"양팔저울"}}, {a:{text:"넓이 겹치기"}, b:{text:"색종이"}}, {a:{text:"들이 옮기기"}, b:{text:"컵·물"}}], fit_slides:["concept", "game"]},
    {id:"b_l7_book", type:"book", icon:"📖", title:"『만들며 배우는 비교』", content:"직접 만들고 견주며 비교를 익히는 활동 그림책.", source:"도서관 그림책 코너에서 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l7_fair", type:"misconception", icon:"❓", title:"오개념 — 공평하지 않은 비교", content:"한쪽만 가득 채우거나 시작점을 안 맞추면 놀이가 공평하지 않아요. 만들 때 '같은 조건'을 약속하게 해 주세요.", fit_slides:["basic_problem", "concept"]},
    {id:"e_l7_book2", type:"extension", icon:"⬆", title:"비교 책 만들기", content:"내가 찾은 비교를 그림과 말로 모아 작은 책으로 엮으면 단원 마무리 작품이 돼요.", fit_slides:["next_lesson", "summary"]}
  ]
};
