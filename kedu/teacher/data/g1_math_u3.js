/* ============================================================
   1학년 1학기 수학 — 3단원 「덧셈과 뺄셈」 (11차시 + 단원 도입 포함)
   양산 — LESSONS["u3_l{NN}"] 누적
   ------------------------------------------------------------
   진입 채팅: 케이티처 단원 3 채팅
   다른 단원 .js (g1_math_u1.js·u2.js·u4~6.js) = read-only
   학년·과목 통합 파일 g1_math.html이 자동 로드 후
   window.LESSONS 객체에 누적시킴.
   ------------------------------------------------------------
   2026-05-20 cycle A — 11차시 18슬 인덱스 양산 (학생 HTML 자동 추출)
   차시: 01(자연과함께해요·단원도입)·02·03·04·05·06~07(병합)·08·09~10(병합)·11·12·13
   14차시 = 안 B 유지 (별도 결정 영역, 본 차시 미양산)
============================================================ */

LESSONS["u3_l1"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 1,
    title: "자연과 함께해요 (단원 도입)",
    std: "[2수01-05]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 밭 채소 모두 세기로 모으기 동기 유발",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_01_자연과함께해요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"밭에서 무엇을 보았나요?", desc:"1단계 · 도입"}, suggested_extras:["v_l1_count", "q_l1_field"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘 무엇을 배워요?", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"1단원에서 무엇을 배웠나요?", desc:"1단계 · 도입"}, suggested_extras:["v_l1_count"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 토마토만 세어 봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l1_group", "t_l1_oneone"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"오이와 참외도 따로따로 세요", desc:"2단계 · 전개"}, suggested_extras:["q_l1_group", "t_l1_oneone"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"이제 모두 합쳐 세어 봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l1_group", "t_l1_oneone"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"빠짐없이 세는 방법", desc:"2단계 · 전개"}, suggested_extras:["q_l1_group", "t_l1_oneone"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 내용", desc:"5단계 · 정리"}, suggested_extras:["t_l1_unit_intro", "b_l1_garden"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l1_next"]}
  ],
  extras: [
    {id:"v_l1_count", type:"video", icon:"🎥", title:"수 세기 노래로 준비 운동", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EC%88%98+%EC%84%B8%EA%B8%B0+%EB%85%B8%EB%9E%98", description:"밭 채소를 세기 전, 1부터 9까지 수 세기를 노래로 다시 떠올려요. 도입 흥미 유발.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l1_field", type:"fun_question", icon:"💡", title:"우리 집 밥상에서 채소 찾기", content:"어젯밤 밥상에 오른 채소를 떠올려 봐요. 토마토·오이·당근… 종류별로 몇 개였는지 세어 볼 수 있을까요?", fit_slides:["motivate", "real_world"]},
    {id:"q_l1_group", type:"fun_question", icon:"💡", title:"한꺼번에 세면 왜 빠를까요?", content:"채소를 하나씩 따로 셀 때와, 종류별로 모아 한꺼번에 셀 때 무엇이 더 빠를까요? 왜 그럴까요?", fit_slides:["concept", "motivate"]},
    {id:"t_l1_oneone", type:"tip", icon:"🧩", title:"빠짐없이 세는 일대일대응", content:"센 것에는 손가락이나 동그라미로 표시해요. 표시하며 세면 두 번 세거나 빠뜨리는 실수를 막을 수 있어요.", fit_slides:["concept"]},
    {id:"t_l1_unit_intro", type:"tip", icon:"🧩", title:"단원 도입은 점수보다 흥미", content:"단원 도입 차시는 정답을 맞히는 것보다, 모으기·세기에 흥미를 갖게 하는 것이 목표예요. 자유롭게 말하도록 기다려 주세요.", fit_slides:["motivate", "summary"]},
    {id:"r_l1_market", type:"real_world", icon:"🌍", title:"시장·마트의 채소 코너", content:"마트 채소 코너에서는 같은 채소를 한곳에 모아 두어요. 모아 두면 세기도 쉽고 고르기도 편하기 때문이에요.", fit_slides:["real_world", "concept"]},
    {id:"r_l1_lunch", type:"real_world", icon:"🌍", title:"급식 반찬 수 세기", content:"오늘 급식에 반찬이 몇 가지였나요? 종류별로 세어 보면 우리 생활 곳곳에 수 세기가 있다는 걸 알 수 있어요.", fit_slides:["real_world", "motivate"]},
    {id:"g_l1_veg_count", type:"game", game_kind:"memory_match", icon:"🎮", title:"채소와 수 짝짓기", description:"채소 그림과 그 개수를 나타내는 수를 짝지어 보세요.", hint:"채소를 하나씩 세어 보고 같은 수를 찾아요.", pairs:[{a:{emoji:"🍅🍅🍅", count:3}, b:{text:"3"}}, {a:{emoji:"🥒🥒", count:2}, b:{text:"2"}}, {a:{emoji:"🥕🥕🥕🥕", count:4}, b:{text:"4"}}, {a:{emoji:"🌽🌽🌽🌽🌽", count:5}, b:{text:"5"}}], fit_slides:["match", "game"]},
    {id:"b_l1_garden", type:"book", icon:"📖", title:"『텃밭에서 만난 수』 같은 자연 수 그림책", content:"밭·정원에서 채소와 열매를 세며 수를 익히는 그림책. 단원 도입 분위기와 잘 어울려요.", source:"도서관 그림책 코너에서 자연·수 주제로 확인", fit_slides:["motivate", "summary"]},
    {id:"x_l1_skip", type:"misconception", icon:"❓", title:"오개념 — 큰 것이 더 많다?", content:"큰 채소가 작은 채소보다 항상 많다고 생각하는 경우가 있어요. 크기와 개수는 다른 것임을 그림으로 비교해 보여 주세요.", fit_slides:["concept"]},
    {id:"e_l1_next", type:"extension", icon:"⬆", title:"다음 단원 미리 보기", content:"오늘 모아 센 경험은 다음 시간 모으기와 가르기로 이어져요. 모으면 더 많아지고, 가르면 둘로 나뉘어요.", fit_slides:["next_lesson"]},
    {id:"t_l1_talk", type:"tip", icon:"🧩", title:"아이 말 끝까지 듣기", content:"도입에서는 틀린 답이라도 끝까지 들어 주세요. 왜 그렇게 생각했는지 물으면 다음 개념으로 자연스럽게 이어집니다.", fit_slides:["motivate"]}
  ]
};

LESSONS["u3_l2"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 2,
    title: "모으기와 가르기 (1)",
    std: "[2수01-04]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 두 수 모으기·한 수 가르기",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_02_모으기와가르기1.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"고구마는 모두 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l2_gather", "q_l2_snack"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 모으기와 가르기를 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"우리 생활에서도 모으기·가르기를 해요", desc:"1단계 · 도입"}, suggested_extras:["v_l2_gather"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"두 수를 모아 봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l2_snack", "q_l2_share"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"한 수를 둘로 갈라 봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l2_snack", "q_l2_share"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"7을 다양하게 갈라 봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l2_snack", "q_l2_share"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"모으기와 가르기는 함께해요", desc:"2단계 · 전개"}, suggested_extras:["q_l2_snack", "q_l2_share"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 내용", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l2_to9"]}
  ],
  extras: [
    {id:"v_l2_gather", type:"video", icon:"🎥", title:"모으기와 가르기 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%AA%A8%EC%9C%BC%EA%B8%B0+%EA%B0%80%EB%A5%B4%EA%B8%B0", description:"두 수를 모으고 한 수를 가르는 과정을 그림으로 보여 주는 영상. 개념 도입에 활용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l2_snack", type:"fun_question", icon:"💡", title:"간식을 모으면?", content:"사탕 3개와 2개를 한 봉지에 모으면 모두 몇 개일까요? 직접 손가락으로 모아 세어 봐요.", fit_slides:["motivate", "concept"]},
    {id:"q_l2_share", type:"fun_question", icon:"💡", title:"어떻게 갈라 줄까요?", content:"사탕 6개를 동생과 나누어 가지려고 해요. 어떻게 가르면 좋을까요? 가르는 방법은 여러 가지예요.", fit_slides:["concept", "real_world"]},
    {id:"t_l2_twoway", type:"tip", icon:"🧩", title:"모으기·가르기는 반대 과정", content:"모으기는 둘을 하나로, 가르기는 하나를 둘로 만들어요. 같은 그림을 양방향으로 보여 주면 관계가 한눈에 들어와요.", fit_slides:["concept"]},
    {id:"t_l2_manip", type:"tip", icon:"🧩", title:"구체물로 먼저, 수로 나중에", content:"공깃돌이나 블록으로 직접 모으고 가른 뒤 수로 적게 하면 개념이 더 단단해져요.", fit_slides:["concept"]},
    {id:"r_l2_table", type:"real_world", icon:"🌍", title:"식탁에서 수저 모으기", content:"식탁을 차릴 때 수저를 모으고, 먹고 나서 나누어 정리해요. 모으기·가르기는 집에서도 자주 일어나요.", fit_slides:["real_world", "concept"]},
    {id:"r_l2_team", type:"real_world", icon:"🌍", title:"편 나누기", content:"놀이할 때 친구들을 두 편으로 갈라요. 6명을 3명과 3명으로, 또는 4명과 2명으로. 이것도 가르기예요.", fit_slides:["real_world", "concept"]},
    {id:"g_l2_make5", type:"game", game_kind:"memory_match", icon:"🎮", title:"5 모으기 짝짓기", description:"모으면 5가 되는 두 수를 짝지어 보세요.", hint:"두 수를 더해 5가 되는 짝을 찾아요.", pairs:[{a:{text:"1과 4"}, b:{text:"5"}}, {a:{text:"2와 3"}, b:{text:"5"}}, {a:{text:"0과 5"}, b:{text:"5"}}, {a:{text:"3과 2"}, b:{text:"5"}}], fit_slides:["match", "game"]},
    {id:"g_l2_split6", type:"game", game_kind:"memory_match", icon:"🎮", title:"6 가르기 짝짓기", description:"6을 두 수로 가른 짝을 찾아보세요.", hint:"6을 둘로 가르는 여러 방법을 떠올려요.", pairs:[{a:{text:"6"}, b:{text:"1과 5"}}, {a:{text:"6"}, b:{text:"2와 4"}}, {a:{text:"6"}, b:{text:"3과 3"}}, {a:{text:"6"}, b:{text:"0과 6"}}], fit_slides:["match", "game"]},
    {id:"b_l2_apple", type:"book", icon:"📖", title:"『사과가 쿵!』", content:"열매가 하나씩 늘어나는 단순한 구조로 모으기 감각을 길러요.", source:"도서관 그림책 코너에서 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l2_oneway", type:"misconception", icon:"❓", title:"오개념 — 가르기는 답이 하나?", content:"6을 가르는 방법이 하나뿐이라고 생각하는 경우가 있어요. 1과 5, 2와 4, 3과 3처럼 여러 가지임을 보여 주세요.", fit_slides:["concept"]},
    {id:"e_l2_to9", type:"extension", icon:"⬆", title:"9까지 넓혀 보기", content:"오늘은 작은 수로 연습했어요. 다음 시간에는 9까지의 수로 모으기·가르기를 해 봐요.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u3_l3"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 3,
    title: "모으기와 가르기 (2)",
    std: "[2수01-04]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 모으기·가르기 숙달과 여러 가지 가르기",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_03_모으기와가르기2.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"닭은 모두 몇 마리일까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l3_link"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 9까지 모으기·가르기 해요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:["v_l3_link"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"연결 모형으로 닭을 나타내요", desc:"2단계 · 전개"}, suggested_extras:["q_l3_eight", "q_l3_nine"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"연결 모형으로 모아 봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l3_eight", "q_l3_nine"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"달걀 8개를 두 바구니로 갈라요", desc:"2단계 · 전개"}, suggested_extras:["q_l3_eight", "q_l3_nine"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"9는 여러 방법으로 가를 수 있어요", desc:"2단계 · 전개"}, suggested_extras:["q_l3_eight", "q_l3_nine"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 내용", desc:"5단계 · 정리"}, suggested_extras:["b_l3_count"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l3_story"]}
  ],
  extras: [
    {id:"v_l3_link", type:"video", icon:"🎥", title:"연결 모형으로 수 나타내기", url:"https://www.youtube.com/results?search_query=%EC%97%B0%EA%B2%B0%ED%81%90%EB%B8%8C+%EB%AA%A8%EC%9C%BC%EA%B8%B0+%EA%B0%80%EB%A5%B4%EA%B8%B0", description:"연결 모형(큐브)으로 수를 만들고 모으고 가르는 과정을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l3_eight", type:"fun_question", icon:"💡", title:"8을 어떻게 가를까요?", content:"달걀 8개를 두 바구니에 나누어 담으려고 해요. 몇 개와 몇 개로 가를 수 있을까요? 가능한 방법을 모두 말해 봐요.", fit_slides:["concept"]},
    {id:"q_l3_nine", type:"fun_question", icon:"💡", title:"9는 몇 가지로 가를까요?", content:"9를 두 수로 가르는 방법을 친구와 번갈아 말해 봐요. 누가 더 많이 찾을 수 있을까요?", fit_slides:["concept", "game"]},
    {id:"t_l3_pattern", type:"tip", icon:"🧩", title:"가르기 표로 규칙 보기", content:"9 가르기를 1과 8, 2와 7… 순서대로 적으면 한쪽이 1씩 줄고 다른 쪽이 1씩 느는 규칙이 보여요.", fit_slides:["concept"]},
    {id:"t_l3_zero", type:"tip", icon:"🧩", title:"0도 가르기에 들어가요", content:"9는 0과 9로도 가를 수 있어요. 한쪽이 0이면 다른 쪽이 전부라는 뜻이에요.", fit_slides:["concept"]},
    {id:"r_l3_egg", type:"real_world", icon:"🌍", title:"달걀판에서 가르기", content:"달걀 한 판을 두 칸으로 나누어 담아 보면 가르기를 손으로 익힐 수 있어요.", fit_slides:["real_world", "concept"]},
    {id:"r_l3_seat", type:"real_world", icon:"🌍", title:"의자 나누어 놓기", content:"교실 의자 9개를 두 모둠으로 나누어 놓을 때도 가르기를 써요. 4개와 5개, 3개와 6개처럼요.", fit_slides:["real_world", "concept"]},
    {id:"g_l3_split9", type:"game", game_kind:"memory_match", icon:"🎮", title:"9 가르기 짝짓기", description:"9를 두 수로 가른 짝을 모두 찾아보세요.", hint:"한쪽 수를 보고 나머지가 얼마인지 생각해요.", pairs:[{a:{text:"9는 1과"}, b:{text:"8"}}, {a:{text:"9는 2와"}, b:{text:"7"}}, {a:{text:"9는 4와"}, b:{text:"5"}}, {a:{text:"9는 3과"}, b:{text:"6"}}], fit_slides:["match", "game"]},
    {id:"g_l3_make8", type:"game", game_kind:"memory_match", icon:"🎮", title:"8 모으기 짝짓기", description:"모으면 8이 되는 두 수를 짝지어 보세요.", hint:"두 수를 더해 8이 되는 짝을 찾아요.", pairs:[{a:{text:"3과 5"}, b:{text:"8"}}, {a:{text:"2와 6"}, b:{text:"8"}}, {a:{text:"4와 4"}, b:{text:"8"}}, {a:{text:"1과 7"}, b:{text:"8"}}], fit_slides:["match", "game"]},
    {id:"b_l3_count", type:"book", icon:"📖", title:"수 가르기 그림책", content:"수를 여러 방법으로 나누는 이야기를 담은 그림책으로 가르기의 다양성을 느껴요.", source:"도서관에서 수·나눔 주제로 확인", fit_slides:["concept", "summary"]},
    {id:"x_l3_order", type:"misconception", icon:"❓", title:"오개념 — 3과 5는 5와 3과 다르다?", content:"모으기에서 3과 5, 5와 3은 합이 같아요. 순서를 바꿔도 모은 수는 같다는 것을 짚어 주세요.", fit_slides:["concept"]},
    {id:"e_l3_story", type:"extension", icon:"⬆", title:"다음은 이야기 만들기", content:"모으기·가르기를 그림 이야기로 만들면 덧셈·뺄셈으로 이어져요. 다음 시간에 해 봐요.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u3_l4"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 4,
    title: "이야기를 만들어 볼까요",
    std: "[2수01-04], [2수01-05]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 그림 상황으로 덧셈·뺄셈 이야기 만들기",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_04_이야기를만들어볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"농장에 무슨 이야기가 있을까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l4_story", "q_l4_bee"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 이야기를 만들어요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:["v_l4_story"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"꿀을 함께 모아 봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l4_bee", "q_l4_leave"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"나비가 더 날아와요", desc:"2단계 · 전개"}, suggested_extras:["q_l4_bee", "q_l4_leave"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"벌이 날아가요", desc:"2단계 · 전개"}, suggested_extras:["q_l4_bee", "q_l4_leave"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"꽃은 얼마나 더 많을까요?", desc:"2단계 · 전개"}, suggested_extras:["q_l4_bee", "q_l4_leave"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["b_l4_math_story", "q_l4_make"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l4_symbol"]}
  ],
  extras: [
    {id:"v_l4_story", type:"video", icon:"🎥", title:"수학 이야기 만들기 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88+%EC%9D%B4%EC%95%BC%EA%B8%B0+%EB%A7%8C%EB%93%A4%EA%B8%B0", description:"그림 상황을 보고 수 이야기를 만드는 과정을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l4_bee", type:"fun_question", icon:"💡", title:"나비가 더 날아오면?", content:"꽃에 나비 3마리가 앉아 있는데 2마리가 더 날아왔어요. 어떤 이야기를 만들 수 있을까요?", fit_slides:["motivate", "concept"]},
    {id:"q_l4_leave", type:"fun_question", icon:"💡", title:"벌이 날아가면?", content:"벌 5마리 중에서 2마리가 날아갔어요. 남은 벌 이야기를 만들어 봐요. 모으는 이야기일까요, 덜어 내는 이야기일까요?", fit_slides:["concept"]},
    {id:"t_l4_keyword", type:"tip", icon:"🧩", title:"이야기 속 낱말 찾기", content:"'모두·합하면'은 모으는 이야기, '남은·더 적은'은 덜어 내는 이야기예요. 낱말을 단서로 삼게 도와주세요.", fit_slides:["concept"]},
    {id:"t_l4_picture", type:"tip", icon:"🧩", title:"그림 먼저, 이야기 나중", content:"그림을 손으로 짚으며 무슨 일이 일어났는지 말하게 한 뒤 수로 옮기면 이야기 만들기가 쉬워져요.", fit_slides:["concept"]},
    {id:"r_l4_garden", type:"real_world", icon:"🌍", title:"우리 주변 이야기로 바꾸기", content:"교실·운동장에서 일어난 일도 수 이야기로 만들 수 있어요. 친구 2명이 오고 3명이 더 왔어요처럼요.", fit_slides:["real_world", "concept"]},
    {id:"r_l4_snackbox", type:"real_world", icon:"🌍", title:"간식 이야기", content:"간식 상자에 과자 4개가 있었는데 2개를 먹었어요. 남은 과자 이야기를 만들어 봐요.", fit_slides:["real_world", "concept"]},
    {id:"g_l4_match_story", type:"game", game_kind:"memory_match", icon:"🎮", title:"이야기와 상황 짝짓기", description:"이야기와 어울리는 상황을 짝지어 보세요.", hint:"이야기 속 낱말이 모으기인지 덜어 내기인지 살펴요.", pairs:[{a:{text:"모두 모이면"}, b:{text:"더하는 이야기"}}, {a:{text:"남은 것은"}, b:{text:"덜어 내는 이야기"}}, {a:{text:"더 날아오면"}, b:{text:"더하는 이야기"}}, {a:{text:"날아가면"}, b:{text:"덜어 내는 이야기"}}], fit_slides:["match", "game"]},
    {id:"b_l4_math_story", type:"book", icon:"📖", title:"『수학으로 이야기 짓기』 같은 수 이야기책", content:"일상 장면을 수 이야기로 바꾸어 보는 그림책으로 상상력을 길러요.", source:"도서관에서 수·이야기 주제로 확인", fit_slides:["motivate", "summary"]},
    {id:"x_l4_addonly", type:"misconception", icon:"❓", title:"오개념 — 이야기는 모두 더하기?", content:"두 무리가 보이면 무조건 더한다고 생각하는 경우가 있어요. 덜어 내는 이야기도 있음을 그림으로 구분해 주세요.", fit_slides:["concept"]},
    {id:"e_l4_symbol", type:"extension", icon:"⬆", title:"다음은 덧셈 기호", content:"이야기를 +와 = 기호로 짧게 적을 수 있어요. 다음 시간에 덧셈식을 배워요.", fit_slides:["next_lesson"]},
    {id:"q_l4_make", type:"fun_question", icon:"💡", title:"내 이야기 발표하기", content:"내가 만든 수 이야기를 친구 앞에서 말해 봐요. 친구의 이야기와 어떻게 다른지 비교해요.", fit_slides:["summary", "game"]}
  ]
};

LESSONS["u3_l5"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 5,
    title: "덧셈을 알아볼까요",
    std: "[2수01-05]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 덧셈식 쓰기·읽기 도입",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_05_덧셈을알아볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"벌은 모두 몇 마리일까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l5_plus", "b_l5_plus_book"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 덧셈을 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:["v_l5_plus"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"벌이 날아와요", desc:"2단계 · 전개"}, suggested_extras:["q_l5_read", "q_l5_two"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"`+`와 `=`를 알아봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l5_read", "q_l5_two"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"나비가 모여요", desc:"2단계 · 전개"}, suggested_extras:["q_l5_read", "q_l5_two"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"두 상황 모두 덧셈식이에요", desc:"2단계 · 전개"}, suggested_extras:["q_l5_read", "q_l5_two"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"`+`를 따라 써 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"`=`를 따라 써 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l5_practice"]}
  ],
  extras: [
    {id:"v_l5_plus", type:"video", icon:"🎥", title:"덧셈 기호 + = 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88+%EA%B8%B0%ED%98%B8+%EB%8D%94%ED%95%98%EA%B8%B0", description:"더하기(+)와 같다(=) 기호의 뜻과 읽는 법을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l5_read", type:"fun_question", icon:"💡", title:"3 + 2 = 5를 어떻게 읽을까요?", content:"'3 더하기 2는 5와 같습니다.' 소리 내어 읽어 봐요. 또 다른 읽기 방법도 있을까요?", fit_slides:["concept"]},
    {id:"q_l5_two", type:"fun_question", icon:"💡", title:"날아오기와 모이기, 둘 다 덧셈?", content:"나비가 더 날아오는 것과 두 무리가 모이는 것, 둘 다 덧셈식으로 쓸 수 있어요. 왜 그럴까요?", fit_slides:["concept"]},
    {id:"t_l5_symbol", type:"tip", icon:"🧩", title:"기호는 천천히 따라 쓰기", content:"+와 =는 줄을 또박또박 그어요. 허공에 한 번 써 본 뒤 종이에 쓰면 모양을 기억하기 쉬워요.", fit_slides:["trace", "concept"]},
    {id:"t_l5_equal", type:"tip", icon:"🧩", title:"= 는 '답'이 아니라 '같다'", content:"='를 '답이 나온다'로만 알면 나중에 어려워져요. 양쪽이 같다는 뜻으로 가르쳐 주세요.", fit_slides:["concept"]},
    {id:"r_l5_score", type:"real_world", icon:"🌍", title:"점수 더하기", content:"놀이에서 1점과 2점을 얻으면 모두 3점. 1 + 2 = 3을 생활 속에서 써 봐요.", fit_slides:["real_world", "concept"]},
    {id:"r_l5_family", type:"real_world", icon:"🌍", title:"가족 수 더하기", content:"우리 가족이 3명인데 할머니가 오시면 4명. 3 + 1 = 4처럼 덧셈식으로 적어 봐요.", fit_slides:["real_world", "concept"]},
    {id:"g_l5_eq_pic", type:"game", game_kind:"memory_match", icon:"🎮", title:"덧셈식과 그림 짝짓기", description:"덧셈식과 어울리는 그림을 짝지어 보세요.", hint:"식이 나타내는 상황을 그림에서 찾아요.", pairs:[{a:{text:"2 + 1 = 3"}, b:{emoji:"🐝🐝➕🐝", count:3}}, {a:{text:"3 + 2 = 5"}, b:{emoji:"🦋🦋🦋➕🦋🦋", count:5}}, {a:{text:"1 + 4 = 5"}, b:{emoji:"🐞➕🐞🐞🐞🐞", count:5}}, {a:{text:"2 + 2 = 4"}, b:{emoji:"🐝🐝➕🐝🐝", count:4}}], fit_slides:["match", "game"]},
    {id:"b_l5_plus_book", type:"book", icon:"📖", title:"덧셈을 다룬 수학 그림책", content:"더하면 많아지는 즐거움을 담은 그림책으로 덧셈에 친숙해져요.", source:"도서관에서 덧셈 주제로 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l5_equal_dir", type:"misconception", icon:"❓", title:"오개념 — 식은 왼쪽에서만 읽는다?", content:"2 + 3 = 5와 5 = 2 + 3은 같은 뜻이에요. =를 기준으로 양쪽이 같다는 점을 보여 주세요.", fit_slides:["concept"]},
    {id:"e_l5_practice", type:"extension", icon:"⬆", title:"다음은 여러 방법으로 더하기", content:"덧셈식을 배웠으니 다음 시간에는 모두 세기·이어 세기로 직접 더해 봐요.", fit_slides:["next_lesson"]},
    {id:"t_l5_voice", type:"tip", icon:"🧩", title:"식을 소리 내어 읽기", content:"식을 눈으로만 보지 말고 소리 내어 읽으면 +와 =의 뜻이 더 잘 자리잡아요.", fit_slides:["concept", "trace"]}
  ]
};

LESSONS["u3_l6~7"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: "6~7",
    title: "덧셈을 해 볼까요",
    std: "[2수01-06]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬 (6·7차시 블록) — 덧셈 계산 연습",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_06_07_덧셈을해볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"딸기는 모두 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l67_strategy"]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:["v_l67_strategy"]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:["v_l67_strategy"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"딸기를 모두 모으면", desc:"2단계 · 전개"}, suggested_extras:["q_l67_faster", "q_l67_swap"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"모두 세기", desc:"2단계 · 전개"}, suggested_extras:["q_l67_faster", "q_l67_swap"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"이어 세기", desc:"2단계 · 전개"}, suggested_extras:["q_l67_faster", "q_l67_swap"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"십 배열판으로 묶어 세기", desc:"2단계 · 전개"}, suggested_extras:["q_l67_faster", "q_l67_swap"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"방법을 골라 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"십 배열판으로 6 + 2를 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"자리를 바꿔도 합이 같을까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"달걀을 두 식으로 써 봐요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"공깃돌 놀이", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"규칙을 찾아 빈칸을 채워요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"합이 6인 식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["b_l67_add", "q_l67_make"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l67_sub"]}
  ],
  extras: [
    {id:"v_l67_strategy", type:"video", icon:"🎥", title:"여러 가지 덧셈 방법", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EC%9D%B4%EC%96%B4+%EC%84%B8%EA%B8%B0+%EB%AA%A8%EB%91%90+%EC%84%B8%EA%B8%B0", description:"모두 세기·이어 세기·십 배열판으로 더하는 여러 방법을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l67_faster", type:"fun_question", icon:"💡", title:"어떤 방법이 빠를까요?", content:"6 + 2를 모두 세기로 풀 때와 이어 세기로 풀 때, 어느 쪽이 더 빠른가요? 왜 그럴까요?", fit_slides:["concept"]},
    {id:"q_l67_swap", type:"fun_question", icon:"💡", title:"자리를 바꾸면?", content:"2 + 6과 6 + 2는 합이 같을까요? 큰 수부터 이어 세면 왜 더 편한지 이야기해 봐요.", fit_slides:["concept"]},
    {id:"t_l67_counton", type:"tip", icon:"🧩", title:"이어 세기 요령", content:"큰 수를 머릿속에 두고 작은 수만큼 이어서 세요. 6에서 7, 8 — 6 + 2 = 8.", fit_slides:["concept"]},
    {id:"t_l67_tenframe", type:"tip", icon:"🧩", title:"십 배열판으로 묶어 보기", content:"십 배열판에 두 수를 놓으면 합이 한눈에 보여요. 5를 기준으로 보면 더 빨라요.", fit_slides:["concept"]},
    {id:"r_l67_marble", type:"real_world", icon:"🌍", title:"공깃돌 놀이로 더하기", content:"공깃돌을 두 번 집어 모으면 덧셈이 돼요. 4개와 3개를 집으면 모두 7개.", fit_slides:["real_world", "game"]},
    {id:"r_l67_steps", type:"real_world", icon:"🌍", title:"계단 오르며 더하기", content:"계단을 3칸 오른 뒤 2칸 더 오르면 모두 5칸. 이어 세기를 몸으로 익혀요.", fit_slides:["real_world", "concept"]},
    {id:"g_l67_sum_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"덧셈식과 합 짝짓기", description:"덧셈식과 그 합을 짝지어 보세요.", hint:"이어 세기로 합을 구해 짝을 찾아요.", pairs:[{a:{text:"4 + 3"}, b:{text:"7"}}, {a:{text:"6 + 2"}, b:{text:"8"}}, {a:{text:"5 + 4"}, b:{text:"9"}}, {a:{text:"3 + 3"}, b:{text:"6"}}], fit_slides:["match", "game"]},
    {id:"g_l67_swap", type:"game", game_kind:"memory_match", icon:"🎮", title:"교환법칙 짝짓기", description:"합이 같은 두 덧셈식을 짝지어 보세요.", hint:"자리를 바꿔도 합이 같은 식을 찾아요.", pairs:[{a:{text:"2 + 6"}, b:{text:"6 + 2"}}, {a:{text:"1 + 5"}, b:{text:"5 + 1"}}, {a:{text:"3 + 4"}, b:{text:"4 + 3"}}, {a:{text:"2 + 7"}, b:{text:"7 + 2"}}], fit_slides:["match", "game"]},
    {id:"b_l67_add", type:"book", icon:"📖", title:"덧셈 연습 그림책", content:"여러 상황에서 더하는 이야기를 담아 덧셈을 즐겁게 연습해요.", source:"도서관에서 덧셈 주제로 확인", fit_slides:["concept", "summary"]},
    {id:"x_l67_recount", type:"misconception", icon:"❓", title:"오개념 — 더할 때 처음부터 다시 센다", content:"6 + 2를 1부터 다시 세는 경우가 많아요. 큰 수에서 이어 세면 빠르다는 것을 반복해 보여 주세요.", fit_slides:["concept"]},
    {id:"e_l67_sub", type:"extension", icon:"⬆", title:"다음은 뺄셈", content:"더하기를 익혔으니 이번엔 덜어 내기 — 뺄셈을 배워요.", fit_slides:["next_lesson"]},
    {id:"q_l67_make", type:"fun_question", icon:"💡", title:"합이 6인 식 만들기", content:"합이 6이 되는 덧셈식을 모두 찾아봐요. 0 + 6, 1 + 5, 2 + 4, 3 + 3.", fit_slides:["game", "summary"]}
  ]
};

LESSONS["u3_l8"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 8,
    title: "뺄셈을 알아볼까요",
    std: "[2수01-05]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 뺄셈식 쓰기·읽기 도입",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_08_뺄셈을알아볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"남은 딸기는 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l8_minus", "q_l8_left"]},
    {id:"s02", stage:"도입", block:"objective", data:{title:"오늘은 뺄셈을 배워요", desc:"1단계 · 도입"}, suggested_extras:[]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간을 떠올려요", desc:"1단계 · 도입"}, suggested_extras:["v_l8_minus"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"딸기를 따 가요", desc:"2단계 · 전개"}, suggested_extras:["q_l8_left", "q_l8_read"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"`-`를 알아봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l8_left", "q_l8_read"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"두 모양의 차이를 알아봐요", desc:"2단계 · 전개"}, suggested_extras:["q_l8_left", "q_l8_read"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"두 상황 모두 뺄셈식이에요", desc:"2단계 · 전개"}, suggested_extras:["q_l8_left", "q_l8_read"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"`-`를 따라 써 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l8_practice"]}
  ],
  extras: [
    {id:"v_l8_minus", type:"video", icon:"🎥", title:"뺄셈 기호 - 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%BA%84%EC%85%88+%EB%B9%BC%EA%B8%B0+%EA%B8%B0%ED%98%B8", description:"빼기(-) 기호의 뜻과 덜어 내는 상황을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l8_left", type:"fun_question", icon:"💡", title:"남은 것은 몇 개?", content:"딸기 5개 중에서 2개를 먹었어요. 남은 딸기는 몇 개일까요? 어떻게 알 수 있을까요?", fit_slides:["motivate", "concept"]},
    {id:"q_l8_read", type:"fun_question", icon:"💡", title:"5 - 2 = 3을 어떻게 읽을까요?", content:"'5 빼기 2는 3과 같습니다.' 소리 내어 읽어 봐요.", fit_slides:["concept"]},
    {id:"t_l8_takeaway", type:"tip", icon:"🧩", title:"덜어 내기를 손으로", content:"구체물에서 빼는 만큼 실제로 치워 보면 뺄셈의 뜻이 분명해져요.", fit_slides:["concept"]},
    {id:"t_l8_parallel", type:"tip", icon:"🧩", title:"덧셈과 나란히 보기", content:"5번에서 배운 덧셈식과 모양이 비슷해요. +가 -로 바뀌면 덜어 내기라는 점만 다르다는 것을 짚어 주세요.", fit_slides:["concept"]},
    {id:"r_l8_eat", type:"real_world", icon:"🌍", title:"먹어서 줄어드는 간식", content:"사탕 6개에서 3개를 먹으면 3개 남아요. 6 - 3 = 3을 생활 속에서 써 봐요.", fit_slides:["real_world", "concept"]},
    {id:"r_l8_leave", type:"real_world", icon:"🌍", title:"교실에서 나가면", content:"8명이 있는 모둠에서 2명이 나가면 6명 남아요. 8 - 2 = 6처럼 뺄셈식으로 적어요.", fit_slides:["real_world", "concept"]},
    {id:"g_l8_eq_pic", type:"game", game_kind:"memory_match", icon:"🎮", title:"뺄셈식과 그림 짝짓기", description:"뺄셈식과 어울리는 그림을 짝지어 보세요.", hint:"덜어 내고 남은 수를 그림에서 찾아요.", pairs:[{a:{text:"5 - 2 = 3"}, b:{emoji:"🍓🍓🍓", count:3}}, {a:{text:"6 - 4 = 2"}, b:{emoji:"🍓🍓", count:2}}, {a:{text:"4 - 1 = 3"}, b:{emoji:"🍓🍓🍓", count:3}}, {a:{text:"7 - 2 = 5"}, b:{emoji:"🍓🍓🍓🍓🍓", count:5}}], fit_slides:["match", "game"]},
    {id:"b_l8_minus", type:"book", icon:"📖", title:"뺄셈을 다룬 수학 그림책", content:"하나씩 줄어드는 이야기로 뺄셈에 친숙해져요.", source:"도서관에서 뺄셈 주제로 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l8_order", type:"misconception", icon:"❓", title:"오개념 — 뺄셈도 자리를 바꿔도 된다?", content:"뺄셈은 덧셈과 달라요. 5 - 2와 2 - 5는 같지 않아요. 큰 수에서 작은 수를 덜어 낸다는 점을 강조해 주세요.", fit_slides:["concept"]},
    {id:"e_l8_practice", type:"extension", icon:"⬆", title:"다음은 여러 방법으로 빼기", content:"뺄셈식을 배웠으니 다음 시간에는 여러 방법으로 직접 빼 봐요.", fit_slides:["next_lesson"]},
    {id:"t_l8_voice", type:"tip", icon:"🧩", title:"뺄셈식 소리 내어 읽기", content:"식을 소리 내어 읽으면 '빼기'와 '같다'의 뜻이 더 잘 익어요.", fit_slides:["concept", "trace"]}
  ]
};

LESSONS["u3_l9~10"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: "9~10",
    title: "뺄셈을 해 볼까요",
    std: "[2수01-06]",
    duration_min: 80,
    lesson_format: "본 차시 5단계 18슬 (9·10차시 블록) — 뺄셈 계산 연습",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_09_10_뺄셈을해볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"남은 오이는 몇 개일까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l910_strategy"]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:["v_l910_strategy"]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:["v_l910_strategy"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"오이 9개에서 3개를 빼면", desc:"2단계 · 전개"}, suggested_extras:["q_l910_how", "q_l910_check"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"모두 세기", desc:"2단계 · 전개"}, suggested_extras:["q_l910_how", "q_l910_check"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"거꾸로 세기", desc:"2단계 · 전개"}, suggested_extras:["q_l910_how", "q_l910_check"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"십 배열판으로 빼기", desc:"2단계 · 전개"}, suggested_extras:["q_l910_how", "q_l910_check"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"방법을 골라 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"십 배열판으로 7 - 2를 풀어 봐요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"어떤 상황의 뺄셈일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"두 가지 뺄셈식을 써 봐요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"의자 앉기 놀이", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"규칙을 찾아 빈칸을 채워요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"뽑기 기계로 뺄셈을 해 봐요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["b_l910_sub"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l910_zero"]}
  ],
  extras: [
    {id:"v_l910_strategy", type:"video", icon:"🎥", title:"여러 가지 뺄셈 방법", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%BA%84%EC%85%88+%EB%B0%A9%EB%B2%95+%EA%B1%B0%EA%BE%B8%EB%A1%9C+%EC%84%B8%EA%B8%B0", description:"덜어 내기·거꾸로 세기·십 배열판으로 빼는 여러 방법을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l910_how", type:"fun_question", icon:"💡", title:"어떻게 빼면 좋을까요?", content:"8 - 3을 풀 때, 하나씩 덜어 낼까요, 거꾸로 셀까요? 나에게 편한 방법을 골라 봐요.", fit_slides:["concept"]},
    {id:"q_l910_check", type:"fun_question", icon:"💡", title:"뺄셈을 덧셈으로 확인", content:"5 - 2 = 3이 맞는지 3 + 2 = 5로 확인할 수 있어요. 왜 그럴까요?", fit_slides:["concept"]},
    {id:"t_l910_countback", type:"tip", icon:"🧩", title:"거꾸로 세기 요령", content:"빼는 수만큼 거꾸로 세요. 8에서 7, 6, 5 — 8 - 3 = 5.", fit_slides:["concept"]},
    {id:"t_l910_tenframe", type:"tip", icon:"🧩", title:"십 배열판으로 덜어 내기", content:"십 배열판에서 빼는 만큼 가리면 남은 수가 한눈에 보여요.", fit_slides:["concept"]},
    {id:"r_l910_chair", type:"real_world", icon:"🌍", title:"의자 빼기 놀이", content:"의자 7개에서 2개를 치우면 5개 남아요. 거꾸로 세기를 몸으로 익혀요.", fit_slides:["real_world", "game"]},
    {id:"r_l910_money", type:"real_world", icon:"🌍", title:"용돈에서 쓰기", content:"용돈 9백 원에서 3백 원을 쓰면 6백 원 남아요. 9 - 3 = 6처럼 생활 속 뺄셈이에요.", fit_slides:["real_world", "concept"]},
    {id:"g_l910_diff_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"뺄셈식과 차 짝짓기", description:"뺄셈식과 그 차를 짝지어 보세요.", hint:"거꾸로 세기로 차를 구해 짝을 찾아요.", pairs:[{a:{text:"8 - 3"}, b:{text:"5"}}, {a:{text:"7 - 2"}, b:{text:"5"}}, {a:{text:"9 - 4"}, b:{text:"5"}}, {a:{text:"6 - 2"}, b:{text:"4"}}], fit_slides:["match", "game"]},
    {id:"g_l910_add_sub", type:"game", game_kind:"memory_match", icon:"🎮", title:"뺄셈과 확인 덧셈 짝짓기", description:"뺄셈식과 그것을 확인하는 덧셈식을 짝지어 보세요.", hint:"남은 수에 뺀 수를 더하면 처음 수가 돼요.", pairs:[{a:{text:"5 - 2 = 3"}, b:{text:"3 + 2 = 5"}}, {a:{text:"6 - 4 = 2"}, b:{text:"2 + 4 = 6"}}, {a:{text:"8 - 3 = 5"}, b:{text:"5 + 3 = 8"}}, {a:{text:"7 - 1 = 6"}, b:{text:"6 + 1 = 7"}}], fit_slides:["match", "game"]},
    {id:"b_l910_sub", type:"book", icon:"📖", title:"뺄셈 연습 그림책", content:"여러 상황에서 덜어 내는 이야기로 뺄셈을 즐겁게 연습해요.", source:"도서관에서 뺄셈 주제로 확인", fit_slides:["concept", "summary"]},
    {id:"x_l910_count_self", type:"misconception", icon:"❓", title:"오개념 — 빼는 수까지 함께 센다", content:"8 - 3에서 8, 7, 6을 세고 6이라 답하는 실수가 있어요. 8에서 한 칸 거꾸로가 7임을 천천히 짚어 주세요.", fit_slides:["concept"]},
    {id:"e_l910_zero", type:"extension", icon:"⬆", title:"다음은 0이 있는 계산", content:"수를 더하고 빼는 법을 익혔어요. 다음 시간에는 0을 더하거나 빼면 어떻게 되는지 알아봐요.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u3_l11"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 11,
    title: "0이 있는 덧셈과 뺄셈",
    std: "[2수01-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 0을 더하거나 빼는 계산",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_11_0이있는덧셈과뺄셈.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"콩이 몇 개씩 있을까요?", desc:"1단계 · 도입"}, suggested_extras:["v_l11_zero", "b_l11_zero"]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:["v_l11_zero", "b_l11_zero"]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:["v_l11_zero"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"0에 더하기", desc:"2단계 · 전개"}, suggested_extras:["q_l11_add0", "q_l11_sub0"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"0을 더하기", desc:"2단계 · 전개"}, suggested_extras:["q_l11_add0", "q_l11_sub0"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"0을 빼기", desc:"2단계 · 전개"}, suggested_extras:["q_l11_add0", "q_l11_sub0"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"모두 빼기", desc:"2단계 · 전개"}, suggested_extras:["q_l11_add0", "q_l11_sub0"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"어떤 자리의 식일까요?", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"수 카드로 덧셈식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"수 카드로 모두 빼기 식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"내가 식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"친구가 낸 문제", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l11_mix"]}
  ],
  extras: [
    {id:"v_l11_zero", type:"video", icon:"🎥", title:"0이 있는 계산 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+0+%EB%8D%94%ED%95%98%EA%B8%B0+%EB%B9%BC%EA%B8%B0", description:"0을 더하거나 빼면 수가 그대로인 까닭을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l11_add0", type:"fun_question", icon:"💡", title:"0을 더하면?", content:"접시에 사과 4개가 있는데 더 놓지 않았어요. 4 + 0은 몇일까요? 왜 그대로일까요?", fit_slides:["concept"]},
    {id:"q_l11_sub0", type:"fun_question", icon:"💡", title:"전부 빼면?", content:"사과 4개를 모두 먹으면 몇 개 남을까요? 4 - 4 = 0. 아무것도 없는 것을 0이라고 해요.", fit_slides:["concept"]},
    {id:"t_l11_meaning", type:"tip", icon:"🧩", title:"0은 '없음'을 나타내요", content:"0을 더하면 더한 것이 없으니 그대로, 0을 빼도 덜어 낸 것이 없으니 그대로예요.", fit_slides:["concept"]},
    {id:"t_l11_self", type:"tip", icon:"🧩", title:"수에서 자기를 빼면 0", content:"어떤 수에서 같은 수를 빼면 하나도 남지 않아 0이 돼요. 5 - 5 = 0.", fit_slides:["concept"]},
    {id:"r_l11_empty", type:"real_world", icon:"🌍", title:"빈 그릇 이야기", content:"과자가 다 떨어진 빈 그릇에는 0개가 있어요. 0은 생활 속에서 '하나도 없음'을 뜻해요.", fit_slides:["real_world", "concept"]},
    {id:"r_l11_score", type:"real_world", icon:"🌍", title:"0점도 점수", content:"놀이에서 한 번도 못 맞히면 0점. 0도 어엿한 수예요.", fit_slides:["real_world", "concept"]},
    {id:"g_l11_zero_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"0이 있는 식과 답 짝짓기", description:"0이 있는 식과 그 답을 짝지어 보세요.", hint:"0을 더하거나 빼면 수가 어떻게 되는지 생각해요.", pairs:[{a:{text:"3 + 0"}, b:{text:"3"}}, {a:{text:"0 + 5"}, b:{text:"5"}}, {a:{text:"4 - 0"}, b:{text:"4"}}, {a:{text:"6 - 6"}, b:{text:"0"}}], fit_slides:["match", "game"]},
    {id:"b_l11_zero", type:"book", icon:"📖", title:"0을 다룬 수학 그림책", content:"아무것도 없는 0의 뜻을 재미있게 풀어낸 그림책.", source:"도서관에서 0·수 주제로 확인", fit_slides:["motivate", "concept"]},
    {id:"x_l11_addchange", type:"misconception", icon:"❓", title:"오개념 — 0을 더하면 0이 된다?", content:"3 + 0을 0이라고 답하는 경우가 있어요. 0을 더하면 변화가 없어 그대로 3임을 그림으로 보여 주세요.", fit_slides:["concept"]},
    {id:"e_l11_mix", type:"extension", icon:"⬆", title:"다음은 종합 연습", content:"0이 있는 계산까지 익혔어요. 다음 시간에는 덧셈과 뺄셈을 섞어 연습해 봐요.", fit_slides:["next_lesson"]},
    {id:"t_l11_compare", type:"tip", icon:"🧩", title:"0 + 수 와 수 + 0 비교", content:"0 + 5와 5 + 0은 둘 다 5예요. 0은 어느 자리에 있어도 수를 바꾸지 않아요.", fit_slides:["concept"]}
  ]
};

LESSONS["u3_l12"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 12,
    title: "덧셈과 뺄셈을 해 볼까요",
    std: "[2수01-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 덧셈·뺄셈 종합 연습",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_12_덧셈과뺄셈을해볼까요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"오늘의 수를 골라요", desc:"1단계 · 도입"}, suggested_extras:["v_l12_mix"]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 배울 것", desc:"1단계 · 도입"}, suggested_extras:["v_l12_mix"]},
    {id:"s03", stage:"도입", block:"review", data:{title:"지난 시간에 배운 것", desc:"1단계 · 도입"}, suggested_extras:["v_l12_mix"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"5가 되는 덧셈식", desc:"2단계 · 전개"}, suggested_extras:["q_l12_which", "q_l12_make"]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"5에서 만드는 뺄셈식", desc:"2단계 · 전개"}, suggested_extras:["q_l12_which", "q_l12_make"]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"6이 되는 식 모으기", desc:"2단계 · 전개"}, suggested_extras:["q_l12_which", "q_l12_make"]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"7이 되는 식 모으기", desc:"2단계 · 전개"}, suggested_extras:["q_l12_which", "q_l12_make"]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 5인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 6인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 4인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"결괏값이 3인 식을 골라요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"오늘의 수로 덧셈식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"오늘의 수로 뺄셈식 만들기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"내가 식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"친구 식과 비교하기", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", desc:"5단계 · 정리"}, suggested_extras:["b_l12_mix"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"오늘 학습은 어땠나요?", desc:"5단계 · 정리"}, suggested_extras:[]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["e_l12_eval"]}
  ],
  extras: [
    {id:"v_l12_mix", type:"video", icon:"🎥", title:"덧셈·뺄셈 종합 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88+%EC%A2%85%ED%95%A9+%EC%97%B0%EC%8A%B5", description:"덧셈과 뺄셈을 가려 풀고 식을 만드는 종합 활동을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l12_which", type:"fun_question", icon:"💡", title:"더하기일까 빼기일까?", content:"'더 왔어요'와 '갔어요' 중 어떤 말이 나오면 빼기일까요? 이야기 속 낱말로 가려 봐요.", fit_slides:["concept"]},
    {id:"q_l12_make", type:"fun_question", icon:"💡", title:"수로 식 만들기", content:"수 7, 2와 기호 +, -로 만들 수 있는 식을 모두 떠올려 봐요. 7 + 2, 7 - 2.", fit_slides:["concept", "game"]},
    {id:"t_l12_keyword", type:"tip", icon:"🧩", title:"낱말로 연산 고르기", content:"'모두·합하면'은 덧셈, '남은·더 적은'은 뺄셈. 문제 속 낱말을 단서로 삼게 도와주세요.", fit_slides:["concept"]},
    {id:"t_l12_check", type:"tip", icon:"🧩", title:"답을 거꾸로 확인", content:"덧셈은 한 수를 빼서, 뺄셈은 더해서 확인할 수 있어요. 스스로 점검하는 습관을 길러 주세요.", fit_slides:["concept"]},
    {id:"r_l12_shop", type:"real_world", icon:"🌍", title:"가게 놀이", content:"물건을 사면 빼기(돈이 줄고), 더 담으면 더하기. 가게 놀이로 두 연산을 함께 써 봐요.", fit_slides:["real_world", "game"]},
    {id:"r_l12_bus", type:"real_world", icon:"🌍", title:"버스 타고 내리기", content:"버스에 타면 더하기, 내리면 빼기. 5명이 탄 버스에 2명이 더 타면 7명, 다음에 3명이 내리면 4명.", fit_slides:["real_world", "concept"]},
    {id:"g_l12_op_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황과 연산 짝짓기", description:"상황과 어울리는 연산을 짝지어 보세요.", hint:"상황의 낱말이 더하기인지 빼기인지 살펴요.", pairs:[{a:{text:"더 왔어요"}, b:{text:"덧셈"}}, {a:{text:"먹었어요"}, b:{text:"뺄셈"}}, {a:{text:"모두 모으면"}, b:{text:"덧셈"}}, {a:{text:"나갔어요"}, b:{text:"뺄셈"}}], fit_slides:["match", "game"]},
    {id:"g_l12_eq_ans", type:"game", game_kind:"memory_match", icon:"🎮", title:"식과 답 짝짓기", description:"덧셈·뺄셈식과 그 답을 짝지어 보세요.", hint:"식이 더하기인지 빼기인지 보고 계산해요.", pairs:[{a:{text:"4 + 3"}, b:{text:"7"}}, {a:{text:"8 - 5"}, b:{text:"3"}}, {a:{text:"2 + 6"}, b:{text:"8"}}, {a:{text:"9 - 4"}, b:{text:"5"}}], fit_slides:["match", "game"]},
    {id:"b_l12_mix", type:"book", icon:"📖", title:"덧셈·뺄셈 이야기책", content:"더하고 빼는 일이 번갈아 일어나는 이야기로 두 연산을 함께 익혀요.", source:"도서관에서 덧셈·뺄셈 주제로 확인", fit_slides:["concept", "summary"]},
    {id:"x_l12_alwaysadd", type:"misconception", icon:"❓", title:"오개념 — 수가 둘이면 무조건 더한다", content:"두 수가 보이면 늘 더하려는 경우가 있어요. 이야기 속 낱말을 먼저 읽고 연산을 고르도록 안내해 주세요.", fit_slides:["concept"]},
    {id:"e_l12_eval", type:"extension", icon:"⬆", title:"다음은 단원 평가", content:"덧셈과 뺄셈을 두루 익혔어요. 다음 시간에는 배운 것을 스스로 확인해 봐요.", fit_slides:["next_lesson"]}
  ]
};

LESSONS["u3_l13"] = {
  meta: {
    grade: 1, subject: "수학", unit: 3, n: 13,
    title: "수학이랑 확인해요",
    std: "[2수01-04], [2수01-05], [2수01-06]",
    duration_min: 40,
    lesson_format: "본 차시 5단계 18슬 — 단원 평가와 자기 평가",
    live_url: "../../grade1/semester1/math/3단원_덧셈과뺄셈/재수정_v1/g1_math_u3_13_수학이랑확인해요.html"
  },
  slides: [
    {id:"s01", stage:"도입", block:"motivate", data:{title:"단원을 마무리해요", desc:"1단계 · 도입"}, suggested_extras:["v_l13_review"]},
    {id:"s02", stage:"도입", block:"motivate", data:{title:"오늘 점검할 것", desc:"1단계 · 도입"}, suggested_extras:["v_l13_review"]},
    {id:"s03", stage:"도입", block:"motivate", data:{title:"단원에서 배운 것", desc:"1단계 · 도입"}, suggested_extras:["v_l13_review"]},
    {id:"s04", stage:"전개", block:"concept", data:{title:"모으기·가르기를 떠올려요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s05", stage:"전개", block:"concept", data:{title:"덧셈을 떠올려요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s06", stage:"전개", block:"concept", data:{title:"뺄셈을 떠올려요", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s07", stage:"전개", block:"concept", data:{title:"0의 자리와 다양한 식", desc:"2단계 · 전개"}, suggested_extras:[]},
    {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"덧셈식을 풀어요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"뺄셈식을 풀어요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"0이 있는 식을 풀어요", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"8을 가르기", desc:"3단계 · 기본문제"}, suggested_extras:[]},
    {id:"s12", stage:"응용문제", block:"advanced_problem", data:{title:"꽃은 모두 몇 송이일까요?", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s13", stage:"응용문제", block:"advanced_problem", data:{title:"개구리는 몇 마리 남았을까요?", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"농장에서 덧셈식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"농장에서 뺄셈식을 만들어요", desc:"4단계 · 응용문제"}, suggested_extras:[]},
    {id:"s16", stage:"정리", block:"summary", data:{title:"단원 점수와 결과", desc:"5단계 · 정리"}, suggested_extras:["q_l13_self", "q_l13_friend"]},
    {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", desc:"5단계 · 정리"}, suggested_extras:["q_l13_self", "t_l13_grade"]},
    {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 차시", desc:"5단계 · 정리"}, suggested_extras:["r_l13_next", "e_l13_make"]}
  ],
  extras: [
    {id:"v_l13_review", type:"video", icon:"🎥", title:"단원 정리 영상", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88+%EB%8B%A8%EC%9B%90+%EC%A0%95%EB%A6%AC", description:"모으기·가르기부터 0이 있는 계산까지 단원 전체를 짧게 정리하는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate", "review"]},
    {id:"q_l13_self", type:"fun_question", icon:"💡", title:"어떤 문제가 가장 쉬웠나요?", content:"평가를 풀면서 가장 자신 있었던 문제와 어려웠던 문제를 떠올려 봐요.", fit_slides:["self_assessment", "summary"]},
    {id:"q_l13_friend", type:"fun_question", icon:"💡", title:"친구에게 설명하기", content:"내가 푼 방법을 친구에게 말로 설명해 봐요. 설명하면 더 잘 이해돼요.", fit_slides:["summary", "game"]},
    {id:"t_l13_grade", type:"tip", icon:"🧩", title:"점수보다 과정", content:"평가는 등수를 매기는 것이 아니라, 무엇을 더 연습하면 좋을지 알아보는 거예요. 틀린 문제는 함께 다시 풀어 주세요.", fit_slides:["self_assessment"]},
    {id:"t_l13_help", type:"tip", icon:"🧩", title:"보충이 필요하면", content:"모으기·가르기가 흔들리면 구체물로, 이어 세기가 약하면 십 배열판으로 다시 짚어 주면 좋아요.", fit_slides:["self_assessment"]},
    {id:"r_l13_daily", type:"real_world", icon:"🌍", title:"오늘 하루 속 덧셈·뺄셈", content:"오늘 하루 동안 더하거나 뺀 일을 떠올려 봐요. 간식을 나눠 먹고, 친구가 더 오고… 수학은 생활 곳곳에 있어요.", fit_slides:["real_world", "summary"]},
    {id:"r_l13_next", type:"real_world", icon:"🌍", title:"2학기에 만날 수", content:"이번 단원의 덧셈·뺄셈은 더 큰 수의 계산으로 이어져요. 50까지의 수를 배우면 더 다양하게 더하고 뺄 수 있어요.", fit_slides:["real_world", "next_lesson"]},
    {id:"g_l13_eval_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"단원 종합 짝짓기", description:"식과 답을 짝지어 단원을 정리해 보세요.", hint:"모으기·덧셈·뺄셈·0을 두루 떠올려요.", pairs:[{a:{text:"3과 4를 모으면"}, b:{text:"7"}}, {a:{text:"5 + 2"}, b:{text:"7"}}, {a:{text:"8 - 3"}, b:{text:"5"}}, {a:{text:"6 - 0"}, b:{text:"6"}}], fit_slides:["match", "game"]},
    {id:"g_l13_term_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"수학 낱말 짝짓기", description:"수학 낱말과 뜻을 짝지어 보세요.", hint:"단원에서 배운 낱말을 떠올려요.", pairs:[{a:{text:"모으기"}, b:{text:"둘을 하나로"}}, {a:{text:"가르기"}, b:{text:"하나를 둘로"}}, {a:{text:"덧셈"}, b:{text:"더하기"}}, {a:{text:"뺄셈"}, b:{text:"빼기"}}], fit_slides:["match", "game"]},
    {id:"b_l13_wrap", type:"book", icon:"📖", title:"덧셈·뺄셈 마무리 그림책", content:"단원을 마무리하며 더하기·빼기를 즐겁게 되새기는 그림책.", source:"도서관에서 덧셈·뺄셈 주제로 확인", fit_slides:["summary", "self_assessment"]},
    {id:"x_l13_speed", type:"misconception", icon:"❓", title:"오개념 — 빨리 풀어야 잘하는 것", content:"빠르게 푸는 것보다 바르게 푸는 것이 먼저예요. 천천히 정확히 풀도록 격려해 주세요.", fit_slides:["self_assessment"]},
    {id:"e_l13_make", type:"extension", icon:"⬆", title:"다음은 만들기 활동", content:"배운 것을 모아 나만의 덧셈·뺄셈 작품으로 만들어 볼 수 있어요.", fit_slides:["next_lesson"]}
  ]
};
