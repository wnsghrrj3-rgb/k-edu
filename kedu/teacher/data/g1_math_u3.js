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
   ------------------------------------------------------------
   2026-06-15 라이브 동기화 — l01·l02·l03 밀도 표준 v1 재제작분 반영.
   ★키 0패딩 교정(u3_l1→u3_l01): 엔진 lessonKey가 padStart(2,'0')라
     옛 비패딩 키는 진입 불가였음. l01~l03·l11~l13만 매칭(진입 가능),
     l4·l5·l6~7·l8·l9~10은 비패딩 옛 껍데기 = 다음 재제작 대기.
============================================================ */

/* u3_l01 — 자연과 함께해요 (단원 도입) · 밀도 표준 v1 */
LESSONS["u3_l01"] = {
  meta: { grade:1, subject:"수학", unit:3, n:1, title:"자연과 함께해요 (단원 도입)", std:"[2수01-05]", duration_min:40 },
  slides: [
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"덧셈과 뺄셈\n자연과 함께해요", emoji:"🌱" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"우리가 할 수 있는 것",
        content:"우리는 1부터 9까지 수를 **세고**, 순서를 알고, 크기를 비교할 수 있어요.\n이번 단원에서는 수를 **합치고 덜어내는** 방법을 배워요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"학교 텃밭에 갔어요",
        kids:[ {face:"👧", label:"민지\n방울토마토 4개"}, {face:"👦", label:"준서\n방울토마토 3개"} ],
        question:"두 사람이 딴 토마토를 한 바구니에 담으면 모두 몇 개일까요? 세지 않고도 알 수 있는 방법이 있을까요?" } },
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"이번 단원에서 배울 것 ①",
        content:"**모으기** — 두 묶음을 하나로!",
        items:[ {emoji:"🍅", count:4, label:"4개"}, {emoji:"🍅", count:3, label:"3개"}, {emoji:"🍅", count:7, label:"모으면 7개"} ] } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"이번 단원에서 배울 것 ②",
        content:"**가르기** — 한 묶음을 둘로!",
        items:[ {emoji:"🌰", count:6, label:"도토리 6개를"}, {emoji:"🌰", count:4, label:"다람쥐에게 4개"}, {emoji:"🌰", count:2, label:"내가 2개"} ] } },
    { id:"s06", stage:"전개", block:"concept", data:{
        title:"이번 단원에서 배울 것 ③",
        content:"모으기와 가르기를 **식**으로 쓰는 방법도 배워요.",
        examples:[ {label:"4 + 3 = 7"}, {label:"6 − 4 = 2"} ],
        note:"+, −, = 기호의 뜻을 차근차근 알아갈 거예요." } },
    { id:"s07", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"수를 **합쳐야 하는 때**와 **덜어내야 하는 때**는 언제일까요? 오늘 아침부터 지금까지 있었던 일에서 찾아봐요." } },
    { id:"s08", stage:"전개", block:"visual_demo", data:{
        title:"자연에서 찾은 모으기",
        items:[ {emoji:"🐦", count:2, label:"나무 위 참새 2마리"}, {emoji:"🐦", count:5, label:"날아온 참새 5마리"}, {emoji:"🐦", count:7, label:"모두 7마리"} ],
        sub_text:"자연 속에는 수가 합쳐지고 줄어드는 일이 가득해요." } },
    { id:"s09", stage:"전개", block:"misconception", data:{
        title:"이런 생각을 조심해요",
        label:"자주 하는 실수",
        wrong:"\"합치면 무조건 9가 넘어요!\" — 수가 커지기만 한다고 생각",
        right:"이번 단원은 **합쳐서 9까지** 수만 다뤄요. 4와 3을 모으면 7 — 9를 넘지 않아요.",
        hint:"덜어내는 뺄셈은 오히려 수가 작아져요." } },
    { id:"s10", stage:"기본문제", block:"basic_problem", data:{
        title:"준비 운동 ① — 세어 봐요",
        items:[ {emoji:"🐞", count:5, label:"무당벌레"} ],
        question:"풀잎 위 무당벌레는 몇 마리일까요?",
        input:"count_input", answer:5,
        note:"풀이: 하나씩 짚으며 세요 — 1,2,3,4,5." } },
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"준비 운동 ② — 미리 맛보기",
        items:[ {emoji:"🌼", count:3, label:"노란 꽃"}, {emoji:"🌸", count:2, label:"분홍 꽃"} ],
        question:"꽃은 모두 몇 송이일까요?",
        input:"count_input", answer:5,
        note:"풀이: 3에서 이어 세기 — 4, 5. 이것이 곧 배울 '모으기'예요!" } },
    { id:"s12", stage:"기본문제", block:"multi", data:{
        title:"합치는 상황을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"두 바구니의 귤을 한 상자에 담기", correct:true},
          {label:"풍선 8개 중 2개가 날아가기"},
          {label:"내 구슬과 친구 구슬을 한 통에 모으기", correct:true},
          {label:"사탕 5개 중 3개를 먹기"} ],
        note:"풀이: 담기·모으기는 합치는 상황, 날아가기·먹기는 줄어드는 상황이에요." } },
    { id:"s13", stage:"응용문제", block:"offline_activity", data:{
        title:"교실 속 모으기·가르기 찾기", tag:"모둠 활동", icon:"🔍",
        body:"모둠별로 교실을 둘러봐요. '합쳐지는 것'과 '나눠지는 것'을 하나씩 찾아 칠판에 붙임쪽지로 붙여요.",
        materials:"붙임쪽지, 연필 · 10분" } },
    { id:"s14", stage:"응용문제", block:"real_world", data:{
        title:"텃밭 이야기 만들기",
        scenario:{ icon:"🥕", body:"민지는 당근을 2개 뽑았고, 준서는 4개를 뽑았어요." },
        question:"이 그림으로 '모으기 이야기'를 말해 볼까요? \"당근이 모두 ___개\"",
        answer:6 } },
    { id:"s15", stage:"정리", block:"summary", data:{
        title:"이번 단원 한눈에",
        points:[ "모으기 — 두 묶음을 하나로 (4와 3 → 7)",
                 "가르기 — 한 묶음을 둘로 (6 → 4와 2)",
                 "덧셈식 +, 뺄셈식 −, 그리고 = 기호를 배운다." ] } },
    { id:"s16", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"🍎", count:2, label:"빨강"}, {emoji:"🍏", count:2, label:"초록"} ],
        question:"사과는 모두 몇 개?", input:"count_input", answer:4,
        note:"2에서 이어 세기 — 3, 4. 다음 시간엔 이걸 '모으기'로 배워요!" } },
    { id:"s17", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔", preview:"두 묶음을 하나로 합치는 **모으기**, 그리고 거꾸로 나누는 **가르기**를 본격적으로 배워요.", emoji:"🧺" } }
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

/* u3_l02 — 모으기와 가르기 (1) · 밀도 표준 v1 */
LESSONS["u3_l02"] = {
  meta: { grade:1, subject:"수학", unit:3, n:2, title:"모으기와 가르기 (1)", std:"[2수01-04]", duration_min:40 },
  slides: [
    // ── 도입 ──
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"모으기\n두 수를 한꺼번에", emoji:"🧺" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"우리는 1부터 9까지 수를 세었어요.\n오늘은 **두 묶음을 하나로 모으면 몇 개가 되는지** 알아봐요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"밭에서 토마토를 땄어요",
        kids:[ {face:"🧺", label:"빨강 바구니\n토마토 3개"}, {face:"🧺", label:"노랑 바구니\n토마토 2개"} ],
        question:"두 바구니를 한 상자에 담으면 토마토는 모두 몇 개가 될까요?" } },
    // ── 전개: 개념을 단계로 ──
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"먼저 하나씩 세어 봐요",
        content:"빨강 바구니부터 세요. 🍅🍅🍅 → **3개**\n노랑 바구니도 세요. 🍅🍅 → **2개**",
        items:[ {emoji:"🍅", count:3, label:"빨강 3개"}, {emoji:"🍅", count:2, label:"노랑 2개"} ] } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"이제 한 상자에 모아요",
        content:"두 바구니를 한 상자에 부으면, 토마토가 한 곳에 모여요.\n모은 것을 다시 세어 봐요.",
        items:[ {emoji:"🍅", count:5, label:"모으면 5개"} ],
        note:"👉 3과 2를 모으면 5. 이것을 **3과 2를 모으기**라고 해요." } },
    { id:"s06", stage:"전개", block:"visual_demo", data:{
        title:"십 배열판으로 보면",
        items:[ {ten_frame:3, num:3, label:"빨강"}, {ten_frame:2, num:2, label:"노랑"}, {ten_frame:5, num:5, label:"모으기"} ],
        sub_text:"왼쪽 두 칸을 합치면 오른쪽처럼 5칸이 채워져요." } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"모을 때 한쪽 묶음만 세고 끝낸다 (3개만 보고 \"3!\")",
        right:"두 묶음을 **모두** 센 다음 합친 수를 말한다 (3과 2 → 5)",
        hint:"모으기는 '두 개를 하나로'예요. 한쪽만 세면 안 돼요." } },

    // ── 전개+: 발문·터치 교구 ──
    { id:"s08b", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"모으기를 하면 수가 **커질까요, 작아질까요?** 왜 그럴까요?" } },
    { id:"s08c", stage:"전개", block:"interactive_ten_frame", data:{
        title:"👆 직접 채워 봐요 — 3과 4 모으기",
        start_count:3,
        prompt:"지금 3칸이 채워져 있어요. 4개를 더 눌러 채우면 모두 몇 칸이 될까요?" } },
    // ── 기본문제: 정답·풀이·reveal ──
    { id:"s09", stage:"기본문제", block:"basic_problem", data:{
        title:"사과를 모아 봐요",
        items:[ {emoji:"🍎", count:2, label:"왼쪽"}, {emoji:"🍎", count:3, label:"오른쪽"} ],
        question:"왼쪽 2개와 오른쪽 3개를 모으면 모두 몇 개일까요?",
        input:"count_input", answer:5,
        note:"풀이: 2를 먼저, 이어서 3을 더 세요 → 3,4,5. 답은 5." } },
    { id:"s10", stage:"기본문제", block:"basic_problem", data:{
        title:"십 배열판으로 모으기",
        items:[ {ten_frame:4, num:4, label:"파랑"}, {ten_frame:3, num:3, label:"초록"} ],
        question:"4와 3을 모으면 몇일까요?",
        input:"count_input", answer:7,
        note:"풀이: 4칸에서 이어 세기 → 5,6,7. 답은 7." } },
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"빈칸을 채워요",
        scenario:{ icon:"🐤", body:"병아리 6마리가 마당에 있어요. 한 마리가 더 왔어요." },
        question:"이제 병아리는 모두 몇 마리?",
        input:"count_input", answer:7,
        note:"6에서 한 번 더 세면 7. '1 더 모으기'예요." } },

    { id:"s11b", stage:"기본문제", block:"multi", data:{
        title:"모아서 5가 되는 것을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"2와 3", correct:true},
          {label:"1과 3"},
          {label:"4와 1", correct:true},
          {label:"2와 2"} ],
        note:"풀이: 2와 3 → 5 ✓ / 1과 3 → 4 ✗ / 4와 1 → 5 ✓ / 2와 2 → 4 ✗" } },
    { id:"s11c", stage:"기본문제", block:"match", data:{
        title:"모으기 짝을 찾아 이어요",
        type:"touch_match",
        pairs:[
          {left:{label:"3과 2"}, right:{num:5}},
          {left:{label:"1과 5"}, right:{num:6}},
          {left:{label:"4와 3"}, right:{num:7}} ] } },
    // ── 응용 ──
    { id:"s12", stage:"응용문제", block:"offline_activity", data:{
        title:"손가락 모으기 놀이", tag:"짝 활동", icon:"🙌",
        body:"둘이 짝을 지어요. 한 사람이 손가락 몇 개, 다른 사람이 몇 개를 펴면, 둘을 모아 모두 몇인지 빠르게 말해요.",
        materials:"준비물 없음 · 5분" } },

    { id:"s12b", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 모으기",
        scenario:{ icon:"🚌", body:"버스에 5명이 타고 있어요. 정류장에서 2명이 더 탔어요. 버스에는 모두 몇 명이 있을까요?" },
        question:"식으로 말해 볼까요? \"5와 2를 모으면 ___\"",
        answer:7 } },
    { id:"s12c", stage:"응용문제", block:"compare", data:{
        title:"어느 쪽이 더 많이 모았나요?",
        items:[
          {emoji:"🍓", count:6, label:"민지: 4와 2 모으기"},
          {emoji:"🍓", count:7, label:"준서: 3과 4 모으기"} ] } },

    { id:"s12d", stage:"전개", block:"concept", data:{
        title:"거꾸로! 가르기",
        content:"모으기를 거꾸로 하면 **가르기**예요.\n토마토 5개를 두 바구니에 나눠 담아 봐요.",
        items:[ {emoji:"🍅", count:5, label:"5개를"}, {emoji:"🍅", count:3, label:"3개와"}, {emoji:"🍅", count:2, label:"2개로!"} ],
        note:"👉 5는 3과 2로 가르기 할 수 있어요." } },
    { id:"s12e", stage:"기본문제", block:"basic_problem", data:{
        title:"가르기 해 봐요",
        items:[ {emoji:"🍪", count:6, label:"과자 6개"} ],
        question:"과자 6개를 내가 4개 가지면, 동생은 몇 개를 가질까요?",
        input:"count_input", answer:2,
        note:"풀이: 6은 4와 2로 가르기. 동생은 2개." } },
    { id:"s13", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"모아서 6이 되는 두 수는 무엇무엇이 있을까요? (예: 1과 5, 2와 4 …) 짝을 모두 찾아보세요." } },
    // ── 정리 ──
    { id:"s14", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[ "두 묶음을 하나로 합치는 것을 **모으기**라고 한다.",
                 "모을 때는 양쪽을 모두 세고 이어 센다.",
                 "모으기를 거꾸로 하면 가르기 — 5는 3과 2로 가를 수 있다." ] } },
    { id:"s15", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"⭐", count:3, label:"별"}, {emoji:"⭐", count:4, label:"별"} ],
        question:"3과 4를 모으면?", input:"count_input", answer:7,
        note:"맞혔다면 모으기를 잘 이해한 거예요!" } },
    { id:"s16", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔", preview:"모으기와 반대! 한 묶음을 둘로 나누는 **가르기**를 배워요.", emoji:"✂️" } }
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

/* u3_l03 — 모으기와 가르기 (2) · 밀도 표준 v1
   초점: 한 수를 여러 가지 방법으로 가르기 (수 분해 유창성) */
LESSONS["u3_l03"] = {
  meta: { grade:1, subject:"수학", unit:3, n:3, title:"모으기와 가르기 (2)", std:"[2수01-04]", duration_min:40 },
  slides: [
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"모으기와 가르기 (2)\n여러 가지 방법으로!", emoji:"✂️" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔",
        content:"두 묶음을 하나로 **모으고**, 한 묶음을 둘로 **가르는** 것을 배웠어요.\n오늘은 한 수를 **여러 가지 방법**으로 가를 수 있다는 비밀을 알아봐요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"사탕 5개를 나눠요",
        kids:[ {face:"👧", label:"민지"}, {face:"👦", label:"준서"} ],
        question:"사탕 5개를 민지와 준서가 나눠 가지려 해요. 나누는 방법이 **한 가지뿐**일까요?" } },
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"5 가르기 — 방법 ①",
        items:[ {emoji:"🍬", count:5, label:"5개를"}, {emoji:"🍬", count:1, label:"1개와"}, {emoji:"🍬", count:4, label:"4개로"} ],
        note:"민지가 1개, 준서가 4개. 5는 1과 4로 가를 수 있어요." } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"5 가르기 — 방법 ②, ③",
        items:[ {emoji:"🍬", count:2, label:"2와 3"}, {emoji:"🍬", count:3, label:"3과 2"}, {emoji:"🍬", count:4, label:"4와 1"} ],
        content:"2와 3, 3과 2, 4와 1… 같은 5라도 **가르는 방법이 여러 가지**예요!",
        note:"👉 순서를 바꿔도 모으면 다시 5가 돼요." } },
    { id:"s06", stage:"전개", block:"visual_demo", data:{
        title:"십 배열판으로 5 가르기 한눈에",
        items:[ {ten_frame:1, num:1, label:"1과 4"}, {ten_frame:2, num:2, label:"2와 3"}, {ten_frame:3, num:3, label:"3과 2"}, {ten_frame:4, num:4, label:"4와 1"} ],
        sub_text:"채워진 칸과 빈 칸(5칸 기준)을 함께 보면 가르기 짝이 보여요." } },
    { id:"s07", stage:"전개", block:"interactive_ten_frame", data:{
        title:"👆 직접 갈라 봐요 — 6 가르기",
        start_count:6,
        prompt:"6칸이 채워져 있어요. 친구에게 2개를 주면(2칸을 비우면) 나에게 몇 개가 남을까요? 직접 눌러 확인해요." } },
    { id:"s08", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"가르기 짝에서 **한쪽 수가 커지면 다른 쪽 수는** 어떻게 될까요? 왜 그럴까요?" } },
    { id:"s09", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"\"3과 2\"와 \"2와 3\"은 완전히 같은 거라서 하나만 쓰면 된다",
        right:"모으면 둘 다 5지만, **누가 몇 개 갖는지**는 달라요. 민지 3·준서 2와 민지 2·준서 3은 다른 나눔이에요.",
        hint:"수학으로는 짝꿍이지만, 상황으로는 서로 달라요." } },
    { id:"s10", stage:"기본문제", block:"basic_problem", data:{
        title:"7 가르기",
        items:[ {emoji:"🌰", count:7, label:"도토리 7개"} ],
        question:"도토리 7개 중 다람쥐가 3개를 가져가면, 몇 개가 남을까요?",
        input:"count_input", answer:4,
        note:"풀이: 7은 3과 4로 가르기. 4개가 남아요." } },
    { id:"s11", stage:"기본문제", block:"match", data:{
        title:"가르기 짝을 이어요 — 6 가르기",
        type:"touch_match",
        pairs:[
          {left:{label:"6은 1과"}, right:{num:5}},
          {left:{label:"6은 2와"}, right:{num:4}},
          {left:{label:"6은 3과"}, right:{num:3}} ] } },
    { id:"s12", stage:"기본문제", block:"multi", data:{
        title:"8 가르기가 맞는 것을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"3과 5", correct:true},
          {label:"4와 5"},
          {label:"6과 2", correct:true},
          {label:"7과 2"} ],
        note:"풀이: 3과 5 → 8 ✓ / 4와 5 → 9 ✗ / 6과 2 → 8 ✓ / 7과 2 → 9 ✗" } },
    { id:"s13", stage:"기본문제", block:"basic_problem", data:{
        title:"빈칸 가르기",
        scenario:{ icon:"🥚", body:"달걀 9개를 두 접시에 나눠 담아요. 한 접시에 5개를 담았어요." },
        question:"다른 접시에는 몇 개를 담아야 할까요?",
        input:"count_input", answer:4,
        note:"풀이: 9는 5와 4로 가르기. 답은 4." } },
    { id:"s14", stage:"응용문제", block:"offline_activity", data:{
        title:"가르기 손가락 대결", tag:"짝 활동", icon:"🙌",
        body:"짝과 마주 봐요. 선생님이 수를 외치면(예: \"7!\") 둘이 동시에 손가락을 펴서, 둘의 손가락을 모아 그 수가 되면 성공! 몇 번 만에 맞출 수 있나요?",
        materials:"준비물 없음 · 7분" } },
    { id:"s15", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 가르기",
        scenario:{ icon:"🚌", body:"체험학습 버스 자리가 한 줄에 4칸이에요. 우리 모둠 4명 중 2명이 앉았어요." },
        question:"남은 자리에 앉을 수 있는 사람은 몇 명일까요?",
        answer:2 } },
    { id:"s16", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"9를 가르는 방법을 **모두** 찾아 써 보세요. (1과 8부터 시작!) 몇 가지가 나올까요? 그 개수에서 규칙을 발견할 수 있나요?" } },
    { id:"s17", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[ "한 수는 **여러 가지 방법**으로 가를 수 있다 (5는 1과4, 2와3, 3과2, 4와1).",
                 "한쪽이 1 커지면 다른 쪽은 1 작아진다.",
                 "가르기 짝은 모으면 다시 원래 수가 된다." ] } },
    { id:"s18", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"⭐", count:8, label:"별 8개"} ],
        question:"8을 6과 몇으로 가를 수 있을까요?", input:"count_input", answer:2,
        note:"8은 6과 2로 가르기. 맞혔다면 오늘 완벽!" } },
    { id:"s19", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔", preview:"모으기·가르기 상황으로 **수학 이야기**를 직접 만들어 봐요. 그림을 보고 말로 풀어내는 시간!", emoji:"📖" } }
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

/* u3_l04 — 이야기를 만들어 볼까요 · 밀도 표준 v1 */
LESSONS["u3_l04"] = {
  meta: { grade:1, subject:"수학", unit:3, n:4, title:"이야기를 만들어 볼까요", std:"[2수01-04], [2수01-05]", duration_min:40 },
  slides: [
    // ── 도입 ──
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"이야기 만들기\n그림 속 수학 이야기", emoji:"📖" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"두 묶음을 하나로 **모으기**, 한 묶음을 둘로 **가르기**를 했어요.\n오늘은 그림을 보고 **수학 이야기**를 만들어 봐요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"연못에 오리가 있어요",
        kids:[ {face:"🦆", label:"연못에\n오리 4마리"}, {face:"🦆", label:"뒤뚱뒤뚱\n2마리가 더!"} ],
        question:"무슨 일이 일어났는지 이야기로 말해 볼까요? 오리는 모두 몇 마리가 될까요?" } },
    // ── 전개: 이야기 짜임 → 더하는/빼는 이야기 구분 ──
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"이야기에는 세 가지가 들어가요",
        content:"① 무엇이 있었나  ② 무슨 일이 생겼나  ③ 그래서 어떻게 되었나\n연못에 오리 4마리가 있었어요(①). 2마리가 더 왔어요(②). 그래서 모두 6마리(③).",
        items:[ {emoji:"🦆", count:4, label:"있던 오리"}, {emoji:"🦆", count:2, label:"더 온 오리"}, {emoji:"🦆", count:6, label:"모두 6마리"} ] } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"더하는 이야기 — 수가 늘어나요",
        content:"**더 오다 · 모으다 · 모두** 같은 말이 나오면 수가 **늘어나요**.\n사과 3개에 2개를 더 담으면 모두 5개.",
        items:[ {emoji:"🍎", count:3, label:"3개"}, {emoji:"🍎", count:2, label:"더 담기"}, {emoji:"🍎", count:5, label:"모두 5개"} ],
        note:"👉 '더, 모두, 모으면'이 나오면 → 더하는 이야기" } },
    { id:"s06", stage:"전개", block:"concept", data:{
        title:"빼는 이야기 — 수가 줄어들어요",
        content:"**가다 · 먹다 · 남다** 같은 말이 나오면 수가 **줄어들어요**.\n빵 5개에서 2개를 먹으면 3개가 남아요.",
        items:[ {emoji:"🍞", count:5, label:"5개"}, {emoji:"🍞", count:2, label:"먹은 것"}, {emoji:"🍞", count:3, label:"남은 3개"} ],
        note:"👉 '가다, 먹다, 남다'가 나오면 → 빼는 이야기" } },
    { id:"s07", stage:"전개", block:"visual_demo", data:{
        title:"더하는 이야기를 십 배열판으로",
        items:[ {ten_frame:4, num:4, label:"있던 오리"}, {ten_frame:2, num:2, label:"더 온 오리"}, {ten_frame:6, num:6, label:"모두"} ],
        sub_text:"4칸에 2칸을 더 채우면 6칸. 말로 만든 이야기가 그림으로도 보여요." } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"'2마리가 더 왔다'인데 빼는 이야기로 만든다 (4에서 2를 빼서 2라고 말함)",
        right:"'더 왔다'는 **늘어나는** 말 → 더하는 이야기 (4와 2를 모아 6)",
        hint:"이야기 속 말이 '늘어나는 말'인지 '줄어드는 말'인지 먼저 찾아요." } },
    { id:"s09", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"사과 6개가 있는 그림 하나로 **더하는 이야기**와 **빼는 이야기**를 둘 다 만들 수 있을까요?" } },
    { id:"s10", stage:"전개", block:"interactive_ten_frame", data:{
        title:"👆 더하는 이야기를 채워 봐요 — 3마리에 4마리가 더",
        start_count:3,
        prompt:"지금 3칸이 채워져 있어요. 병아리 4마리가 더 왔어요. 4개를 더 눌러 모두 몇 마리인지 채워 볼까요?" } },
    // ── 기본문제 ──
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"더하는 이야기를 만들어 풀어요",
        items:[ {emoji:"🐤", count:5, label:"마당 병아리"}, {emoji:"🐤", count:3, label:"더 온 병아리"} ],
        question:"마당에 병아리 5마리가 있었어요. 3마리가 더 왔어요. 모두 몇 마리?",
        input:"count_input", answer:8,
        note:"풀이: '더 왔다'는 더하는 이야기. 5에서 이어 세기 → 6,7,8. 답은 8." } },
    { id:"s12", stage:"기본문제", block:"basic_problem", data:{
        title:"빼는 이야기를 만들어 풀어요",
        scenario:{ icon:"🍪", body:"접시에 쿠키가 7개 있었어요. 동생이 2개를 먹었어요." },
        question:"접시에 남은 쿠키는 몇 개?",
        input:"count_input", answer:5,
        note:"풀이: '먹었다'는 빼는 이야기. 7에서 2개를 덜어내면 5. 답은 5." } },
    { id:"s13", stage:"기본문제", block:"multi", data:{
        title:"더하는 이야기를 모두 골라요",
        expectedCount:2,
        options:[
          {label:"새 3마리가 있는데 2마리가 더 날아왔어요", correct:true},
          {label:"사탕 6개 중 4개를 먹었어요"},
          {label:"빨강 풍선 4개와 파랑 풍선 3개를 모았어요", correct:true},
          {label:"버스에서 5명이 내렸어요"}
        ],
        note:"풀이: '더 날아왔다'·'모았다' → 더하는 이야기 ✓ / '먹었다'·'내렸다' → 빼는 이야기 ✗" } },
    { id:"s14", stage:"기본문제", block:"match", data:{
        title:"이야기와 알맞은 수를 이어요",
        type:"touch_match",
        pairs:[
          { left:{label:"4와 2를 모으면"}, right:{num:6} },
          { left:{label:"7에서 3을 먹으면"}, right:{num:4} },
          { left:{label:"5와 4를 모으면"}, right:{num:9} }
        ] } },
    // ── 응용문제 ──
    { id:"s15", stage:"응용문제", block:"offline_activity", data:{
        title:"그림 카드로 이야기 만들기 놀이",
        tag:"짝 활동", icon:"🃏",
        body:"짝과 그림 카드 한 장을 골라요. 한 사람은 '더하는 이야기', 다른 사람은 '빼는 이야기'를 만들어 말해요. 누가 더 재미있는 이야기를 만들까요?",
        materials:"그림 카드(또는 교실 물건) · 7분" } },
    { id:"s16", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 이야기",
        scenario:{ icon:"🚌", body:"버스에 6명이 타고 있었어요. 정류장에서 2명이 더 탔어요." },
        question:"이야기로 만들어 말해 볼까요? \"6과 2를 모으면 ___\" 버스에는 모두 몇 명?",
        answer:8 } },
    { id:"s17", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"사과 5개 그림 하나로 **더하는 이야기**와 **빼는 이야기**를 각각 하나씩 만들어 친구에게 들려주세요. (예: '3개에 2개를 더 담아 5개' / '5개에서 2개를 먹어 3개')" } },
    // ── 정리 ──
    { id:"s18", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[
          "그림을 보고 **수학 이야기**를 만들 수 있다.",
          "'더 오다·모으다·모두'가 나오면 **더하는 이야기** (예: 4와 2 → 6).",
          "'가다·먹다·남다'가 나오면 **빼는 이야기** (예: 5에서 2 → 3)."
        ] } },
    { id:"s19", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        scenario:{ icon:"🐟", body:"어항에 물고기 4마리가 있었어요. 3마리가 더 들어왔어요." },
        question:"더하는 이야기일까요, 빼는 이야기일까요? 물고기는 모두 몇 마리?",
        input:"count_input", answer:7,
        note:"'더 들어왔다'는 더하는 이야기. 4와 3을 모아 7. 답은 7." } },
    { id:"s20", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔",
        preview:"이야기를 **식**으로 써 봐요. **+** 와 **=** 기호를 처음 만나요! '4와 2를 모으면 6'을 '4 + 2 = 6'으로.",
        emoji:"➕" } }
  ],
  extras: [
    { id:"v_l04_story", type:"video", icon:"🎥", title:"덧셈·뺄셈 이야기 만들기 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88+%EC%9D%B4%EC%95%BC%EA%B8%B0+%EB%A7%8C%EB%93%A4%EA%B8%B0",
      description:"그림 상황을 보고 수학 이야기를 만드는 과정을 보여 주는 영상. 도입에 활용.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","review"] },
    { id:"q_l04_morning", type:"fun_question", icon:"💡", title:"오늘 아침 이야기",
      content:"오늘 아침에 있었던 일로 더하는 이야기를 하나 만들어 볼까요? (예: 식탁에 컵 2개가 있었는데 1개를 더 놓아 모두 3개.)",
      fit_slides:["motivate","concept"] },
    { id:"a_l04_finger", type:"other_activity", icon:"🙌", title:"손가락으로 이야기 만들기",
      content:"손가락을 펴며 '있었던 수'와 '더 온 수(또는 간 수)'를 보여 주고, 짝이 모두/남은 수를 말하게 해요.",
      fit_slides:["concept","interactive_ten_frame"] },
    { id:"t_l04_words", type:"tip", icon:"🧩", title:"늘어나는 말·줄어드는 말",
      content:"칠판 두 칸에 '늘어나는 말(더·모두·모으다)'과 '줄어드는 말(가다·먹다·남다)'을 미리 적어 두면, 학생이 이야기 종류를 스스로 분류하기 쉬워요.",
      fit_slides:["concept","misconception"] },
    { id:"x_l04_partonly", type:"misconception", icon:"❓", title:"오개념 — 그림의 일부만 보기",
      content:"그림에서 한쪽 묶음만 보고 이야기를 끝내는 학생이 있어요. '있던 것'과 '달라진 것'을 모두 짚어 주세요.",
      fit_slides:["misconception","basic_problem"] },
    { id:"r_l04_classroom", type:"real_world", icon:"🌍", title:"교실 속 이야기",
      content:"줄을 선 친구가 몇 명인데 몇 명이 더 왔는지, 사물함에서 책을 몇 권 꺼냈는지 — 교실에서 일어나는 일을 이야기로 만들어 봐요.",
      fit_slides:["real_world","offline_activity"] },
    { id:"g_l04_sort", type:"game", game_kind:"memory_match", icon:"🎮", title:"이야기 분류 짝짓기",
      description:"이야기 문장과 '더하기/빼기' 종류를 짝지어 보세요.", hint:"늘어나는 말인지 줄어드는 말인지 찾아요.",
      pairs:[ {a:{text:"2마리가 더 왔어요"}, b:{text:"더하기"}}, {a:{text:"3개를 먹었어요"}, b:{text:"빼기"}}, {a:{text:"두 바구니를 모았어요"}, b:{text:"더하기"}}, {a:{text:"4명이 내렸어요"}, b:{text:"빼기"}} ],
      fit_slides:["multi","game"] },
    { id:"q_l04_friend", type:"fun_question", icon:"💡", title:"친구 이야기를 식으로",
      content:"친구가 만든 더하는 이야기를 듣고, '몇과 몇을 모으면 몇'인지 말로 바꿔 말해 줄 수 있나요?",
      fit_slides:["summary","real_world"] },
    { id:"b_l04_book", type:"book", icon:"📖", title:"수 이야기 그림책",
      content:"수가 늘어나고 줄어드는 장면이 담긴 그림책으로 이야기 만들기를 이어 가 보세요.",
      source:"도서관에서 '수·더하기' 주제로 확인", fit_slides:["summary","motivate"] },
    { id:"t_l04_support", type:"tip", icon:"🧩", title:"이야기가 어려운 학생에게",
      content:"이야기 만들기를 어려워하면 '있었어요 → 어떻게 됐어요' 두 칸 틀을 주고 빈칸만 채우게 하면 시작이 쉬워져요.",
      fit_slides:["basic_problem","self_assessment"] },
    { id:"e_l04_three", type:"extension", icon:"⬆", title:"확장 — 세 수 이야기",
      content:"'2개 있었는데 1개가 오고, 또 2개가 왔어요'처럼 수가 세 번 나오는 이야기도 만들어 볼 수 있어요.",
      fit_slides:["advanced_problem","next_lesson"] },
    { id:"e_l04_symbol", type:"extension", icon:"⬆", title:"확장 — 식으로 가는 다리",
      content:"다음 시간에 배울 +·= 기호를 살짝 보여 주며 '모으면'을 '+'로 바꿔 쓸 수 있다고 예고하면 연결이 자연스러워요.",
      fit_slides:["next_lesson","summary"] }
  ]
};

/* u3_l05 — 덧셈을 알아볼까요 · 밀도 표준 v1 */
LESSONS["u3_l05"] = {
  meta: { grade:1, subject:"수학", unit:3, n:5, title:"덧셈을 알아볼까요", std:"[2수01-05]", duration_min:40 },
  slides: [
    // ── 도입 ──
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"덧셈을 알아봐요\n+ 와 = 기호", emoji:"➕" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"그림을 보고 **더하는 이야기**를 만들었어요. (예: 4와 2를 모으면 6)\n오늘은 그 이야기를 짧은 **식**으로 써 봐요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"꽃밭에 벌이 날아와요",
        kids:[ {face:"🐝", label:"꽃에 앉은\n벌 3마리"}, {face:"🐝", label:"붕붕\n2마리가 더!"} ],
        question:"벌은 모두 몇 마리일까요? 이걸 짧은 식으로 쓸 수 있을까요?" } },
    // ── 전개: + 도입 → = 도입 → 두 상황 모두 덧셈식 ──
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"'더하기'를 + 로 써요",
        content:"'더 오다 · 모으다'를 기호 하나로 줄여 써요. 바로 **+** (더하기)예요.\n벌 3마리에 2마리가 더 오면 → **3 + 2**",
        items:[ {emoji:"🐝", count:3, label:"3"}, {emoji:"🐝", count:2, label:"+ 2"} ],
        note:"👉 +는 '더하기'라고 읽어요. 3 + 2 는 '3 더하기 2'." } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"'모두'를 = 로 써요",
        content:"**=** 는 '**는/은**' 또는 '**같다**'라는 뜻이에요. 양쪽이 같다는 표시.\n3 + 2 의 답이 5이면 → **3 + 2 = 5**",
        items:[ {emoji:"🐝", count:5, label:"모두 5"} ],
        note:"👉 3 + 2 = 5 는 '3 더하기 2는 5와 같다'라고 읽어요." } },
    { id:"s06", stage:"전개", block:"arrow_flow", data:{
        title:"식이 만들어지는 순서",
        flow:[ {num:3, label:"있던 벌"}, {num:2, label:"날아온 벌"}, {num:5, label:"모두", type:"up"} ],
        sub:"3 + 2 = 5 — 있던 수, 더한 수, 그리고 모두의 수." } },
    { id:"s07", stage:"전개", block:"concept", data:{
        title:"모이는 상황도 덧셈식이에요",
        content:"나비 4마리와 3마리가 한 꽃밭에 모였어요. 모으는 상황도 **덧셈식**으로 써요.\n**4 + 3 = 7**",
        items:[ {emoji:"🦋", count:4, label:"4"}, {emoji:"🦋", count:3, label:"+ 3"}, {emoji:"🦋", count:7, label:"= 7"} ],
        note:"👉 '더 오는 상황'도 '모이는 상황'도 모두 덧셈식이에요." } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"= 를 '여기에 답이 나온다'는 화살표로만 여긴다 (왼쪽만 보고 오른쪽은 아무 수나 씀)",
        right:"= 는 **양쪽이 같다**는 뜻. 3 + 2 = 5 에서 왼쪽(3+2)과 오른쪽(5)의 크기가 같아요.",
        hint:"= 양쪽을 저울처럼 생각해요. 양쪽 무게가 같아야 해요." } },
    { id:"s09", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"3 + 2 와 2 + 3 은 답이 같을까요, 다를까요? 왜 그렇게 생각하나요?" } },
    { id:"s10", stage:"전개", block:"interactive_ten_frame", data:{
        title:"👆 십 배열판으로 3 + 2 채우기",
        start_count:3,
        prompt:"지금 3칸이 채워져 있어요. 2개를 더 눌러 채우면 3 + 2 = 몇이 될까요?" } },
    // ── 기본문제 ──
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"식으로 쓰고 답을 구해요",
        items:[ {emoji:"🍎", count:4, label:"4"}, {emoji:"🍎", count:2, label:"+ 2"} ],
        question:"사과 4개에 2개를 더하면?  식: 4 + 2 = ___",
        input:"count_input", answer:6,
        note:"풀이: 4에서 이어 세기 → 5,6. 4 + 2 = 6." } },
    { id:"s12", stage:"기본문제", block:"basic_problem", data:{
        title:"식을 읽고 답해요",
        scenario:{ icon:"🐥", body:"병아리 5마리가 있는데 3마리가 더 왔어요. 식으로 쓰면 5 + 3 = ?" },
        question:"5 + 3 = 몇일까요?",
        input:"count_input", answer:8,
        note:"풀이: 5에서 이어 세기 → 6,7,8. 5 + 3 = 8." } },
    { id:"s13", stage:"기본문제", block:"multi", data:{
        title:"바르게 쓴 덧셈식을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"2 + 3 = 5", correct:true},
          {label:"4 + 1 = 6"},
          {label:"6 + 0 = 6", correct:true},
          {label:"3 + 4 = 6"}
        ],
        note:"풀이: 2+3=5 ✓ / 4+1=5 (≠6) ✗ / 6+0=6 ✓ / 3+4=7 (≠6) ✗" } },
    { id:"s14", stage:"기본문제", block:"match", data:{
        title:"덧셈식과 답을 이어요",
        type:"touch_match",
        pairs:[
          { left:{label:"3 + 4"}, right:{num:7} },
          { left:{label:"6 + 2"}, right:{num:8} },
          { left:{label:"5 + 4"}, right:{num:9} }
        ] } },
    // ── 응용문제 ──
    { id:"s15", stage:"응용문제", block:"offline_activity", data:{
        title:"덧셈식 카드 놀이",
        tag:"짝 활동", icon:"🃏",
        body:"수 카드 두 장을 뽑아 사이에 + 를 넣어 식을 만들고 답을 말해요. 짝이 답이 맞는지 확인해 줘요.",
        materials:"수 카드(0~9) · 7분" } },
    { id:"s16", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 덧셈식",
        scenario:{ icon:"🚌", body:"버스에 4명이 타고 있었는데 정류장에서 3명이 더 탔어요." },
        question:"식으로 쓰면?  4 + 3 = ___  모두 몇 명?",
        answer:7 } },
    { id:"s17", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"답이 6이 되는 덧셈식을 여러 개 만들어 보세요. (예: 1 + 5, 2 + 4, 3 + 3 …) 몇 가지나 찾을 수 있나요?" } },
    // ── 정리 ──
    { id:"s18", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[
          "'더하기'는 **+**, '같다/는'은 **=** 로 쓴다.",
          "덧셈식은 '있던 수 + 더한 수 = 모두'로 쓴다 (예: 3 + 2 = 5).",
          "3 + 2 = 5 는 '3 더하기 2는 5와 같다'로 읽는다."
        ] } },
    { id:"s19", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"⭐", count:6, label:"6"}, {emoji:"⭐", count:2, label:"+ 2"} ],
        question:"6 + 2 = 몇일까요?",
        input:"count_input", answer:8,
        note:"6에서 이어 세기 → 7,8. 6 + 2 = 8. 맞혔다면 덧셈식을 잘 이해한 거예요!" } },
    { id:"s20", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔",
        preview:"덧셈을 **여러 가지 방법**으로 해 봐요. 이어 세기·십 배열판으로 더 빠르게! 그리고 3 + 2 = 2 + 3 처럼 순서를 바꿔도 답이 같다는 것도 알아봐요.",
        emoji:"🧮" } }
  ],
  extras: [
    { id:"v_l05_add", type:"video", icon:"🎥", title:"덧셈 기호 +·= 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88+%EA%B8%B0%ED%98%B8+%EB%B0%B0%EC%9A%B0%EA%B8%B0",
      description:"+ 와 = 기호의 뜻과 덧셈식 읽는 법을 보여 주는 영상. 개념 도입에 활용.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"] },
    { id:"q_l05_read", type:"fun_question", icon:"💡", title:"식을 소리 내어 읽기",
      content:"칠판에 3 + 2 = 5 를 적고 '3 더하기 2는 5와 같다'라고 다 함께 소리 내어 읽어 봐요. 다른 식도 읽어 볼까요?",
      fit_slides:["concept","summary"] },
    { id:"a_l05_finger", type:"other_activity", icon:"🙌", title:"손가락 덧셈식",
      content:"한 손으로 '있던 수', 다른 손으로 '더한 수'를 펴고, 모두 펴서 답을 세요. 식을 입으로 말하며 손을 펴게 하면 식과 동작이 연결돼요.",
      fit_slides:["concept","interactive_ten_frame"] },
    { id:"t_l05_equal", type:"tip", icon:"🧩", title:"= 는 저울이에요",
      content:"= 를 양팔 저울로 비유해 주세요. 왼쪽(3+2)과 오른쪽(5)의 무게가 같아 수평이 된다고 하면, '답 나오는 화살표' 오개념을 막을 수 있어요.",
      fit_slides:["misconception","concept"] },
    { id:"x_l05_anynum", type:"misconception", icon:"❓", title:"오개념 — = 뒤엔 아무 수나",
      content:"왼쪽 식만 보고 = 뒤에 아무 수나 적는 학생이 있어요. 양쪽 크기가 같은지 다시 세어 확인하게 하세요.",
      fit_slides:["misconception","multi"] },
    { id:"r_l05_classroom", type:"real_world", icon:"🌍", title:"교실 속 덧셈식",
      content:"우리 모둠 4명에 2명이 더 합쳐졌을 때, 책상 위 연필 3자루에 2자루를 더 놓았을 때 — 식으로 써 봐요.",
      fit_slides:["real_world","offline_activity"] },
    { id:"g_l05_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"식과 답 짝짓기",
      description:"덧셈식과 답을 짝지어 보세요.", hint:"이어 세기로 답을 구해요.",
      pairs:[ {a:{text:"2 + 2"}, b:{text:"4"}}, {a:{text:"3 + 4"}, b:{text:"7"}}, {a:{text:"5 + 1"}, b:{text:"6"}}, {a:{text:"4 + 4"}, b:{text:"8"}} ],
      fit_slides:["match","game"] },
    { id:"q_l05_order", type:"fun_question", icon:"💡", title:"순서를 바꾸면?",
      content:"2 + 3 과 3 + 2 의 답을 각각 구해 봐요. 답이 같나요? 왜 그럴까요? (다음 차시 연결)",
      fit_slides:["question","next_lesson"] },
    { id:"b_l05_book", type:"book", icon:"📖", title:"덧셈 그림책",
      content:"수가 늘어나고 합쳐지는 장면이 담긴 그림책으로 덧셈식을 더 친근하게 만나 보세요.",
      source:"도서관에서 '덧셈·더하기' 주제로 확인", fit_slides:["summary","motivate"] },
    { id:"t_l05_support", type:"tip", icon:"🧩", title:"식 쓰기가 어려운 학생에게",
      content:"'__ + __ = __' 빈칸 틀을 주고, 그림을 보며 칸을 채우게 하면 식 쓰기 부담이 줄어요.",
      fit_slides:["basic_problem","self_assessment"] },
    { id:"e_l05_zero", type:"extension", icon:"⬆", title:"확장 — 0을 더하면?",
      content:"3 + 0 은 얼마일까요? 0을 더하면 수가 그대로라는 것을 미리 살짝 다뤄 볼 수 있어요. (l11에서 본격적으로)",
      fit_slides:["advanced_problem","next_lesson"] },
    { id:"e_l05_three", type:"extension", icon:"⬆", title:"확장 — 세 수 더하기",
      content:"1 + 2 + 3 처럼 수가 세 개인 식도 만들어 볼 수 있어요. 앞에서부터 차례로 더하면 돼요.",
      fit_slides:["advanced_problem","summary"] }
  ]
};

/* u3_l06_07 — 덧셈을 해 볼까요 (병합 차시) · 밀도 표준 v1 */
LESSONS["u3_l06_07"] = {
  meta: { grade:1, subject:"수학", unit:3, n:"6~7", title:"덧셈을 해 볼까요", std:"[2수01-06]", duration_min:80 },
  slides: [
    // ── 도입 ──
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"덧셈을 해 봐요\n여러 가지 방법", emoji:"🍓" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"덧셈식 **3 + 2 = 5** 와 + · = 기호를 배웠어요.\n오늘은 답을 구하는 **여러 가지 방법**을 익히고, 두 수의 **자리를 바꿔도** 되는지 알아봐요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"바구니에 딸기를 담아요",
        kids:[ {face:"🧺", label:"빨강 바구니\n딸기 4개"}, {face:"🧺", label:"노랑 바구니\n딸기 3개"} ],
        question:"딸기는 모두 몇 개일까요? 어떻게 세면 빠를까요?" } },
    // ── 전개: 세 가지 방법 + 교환법칙 ──
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"답을 구하는 여러 방법",
        content:"4 + 3 의 답은 **여러 방법**으로 구할 수 있어요.\n① 모두 세기  ② 이어 세기  ③ 십 배열판",
        items:[ {emoji:"🍓", count:4, label:"4"}, {emoji:"🍓", count:3, label:"+ 3"} ] } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"① 모두 세기",
        content:"처음부터 하나씩 다 세요. 🍓🍓🍓🍓 🍓🍓🍓 → 1,2,3,4,5,6,7.\n**4 + 3 = 7**",
        items:[ {emoji:"🍓", count:7, label:"모두 7"} ],
        note:"👉 가장 기본 방법. 빠뜨리지 않게 손으로 짚으며 세요." } },
    { id:"s06", stage:"전개", block:"concept", data:{
        title:"② 이어 세기",
        content:"앞의 수 4부터 이어서 세요. '4!' 하고 → 5,6,7.\n세 번만 더 세면 돼서 빨라요.",
        items:[ {emoji:"🍓", count:4, label:"4에서"}, {emoji:"🍓", count:3, label:"3개 더"} ],
        note:"👉 큰 수부터 이어 세면 더 빨라요." } },
    { id:"s07", stage:"전개", block:"visual_demo", data:{
        title:"③ 십 배열판으로",
        items:[ {ten_frame:4, num:4, label:"4"}, {ten_frame:3, num:3, label:"3"}, {ten_frame:7, num:7, label:"4+3"} ],
        sub_text:"4칸에 3칸을 더 채우면 7칸. 한눈에 보여요." } },
    { id:"s08", stage:"전개", block:"concept", data:{
        title:"자리를 바꿔도 합은 같아요",
        content:"4 + 3 과 3 + 4 를 각각 세어 봐요. 둘 다 **7**!\n더하는 두 수는 **자리를 바꿔도** 답이 같아요.",
        items:[ {emoji:"🍓", count:7, label:"4+3=7"}, {emoji:"🍓", count:7, label:"3+4=7"} ],
        note:"👉 그래서 큰 수부터 이어 세면 편해요 (3+4 → 4부터)." } },
    { id:"s09", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"이어 세기를 할 때 시작 수를 한 번 더 센다 (4 + 3을 4,5,6,7,8 — 4를 또 셈)",
        right:"시작 수는 세지 않고 **그 다음부터** 센다 (4 → 5,6,7). 더한 수만큼만 이어 센다.",
        hint:"이어 세기는 '4!' 하고 손가락 3개를 펴며 5,6,7." } },
    { id:"s10", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"6 + 1 은 어떤 방법이 가장 빠를까요? 그 이유는 무엇일까요?" } },
    { id:"s11", stage:"전개", block:"interactive_ten_frame", data:{
        title:"👆 십 배열판으로 5 + 3 채우기",
        start_count:5,
        prompt:"5칸이 채워져 있어요. 3개를 더 눌러 5 + 3 = 몇인지 채워 봐요." } },
    // ── 기본문제 ──
    { id:"s12", stage:"기본문제", block:"basic_problem", data:{
        title:"이어 세기로 풀어요",
        items:[ {emoji:"🍎", count:6, label:"6"}, {emoji:"🍎", count:2, label:"+ 2"} ],
        question:"6 + 2 = ?  큰 수 6부터 이어 세 봐요.",
        input:"count_input", answer:8,
        note:"풀이: 6 → 7,8. 6 + 2 = 8." } },
    { id:"s13", stage:"기본문제", block:"basic_problem", data:{
        title:"십 배열판으로 6 + 2",
        items:[ {ten_frame:6, num:6, label:"6"}, {ten_frame:2, num:2, label:"+2"} ],
        question:"6 + 2 는 모두 몇 칸이 될까요?",
        input:"count_input", answer:8,
        note:"6칸에서 2칸을 더 → 7,8. 답은 8." } },
    { id:"s14", stage:"기본문제", block:"basic_problem", data:{
        title:"자리를 바꿔 확인해요",
        scenario:{ icon:"🥚", body:"달걀을 2 + 5 로도, 5 + 2 로도 셀 수 있어요." },
        question:"2 + 5 와 5 + 2 의 답은? (둘 다 같은 수)",
        input:"count_input", answer:7,
        note:"2+5=7, 5+2=7. 자리를 바꿔도 7로 같아요." } },
    { id:"s15", stage:"기본문제", block:"multi", data:{
        title:"합이 8이 되는 식을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"5 + 3", correct:true},
          {label:"4 + 3"},
          {label:"6 + 2", correct:true},
          {label:"3 + 4"}
        ],
        note:"풀이: 5+3=8 ✓ / 4+3=7 ✗ / 6+2=8 ✓ / 3+4=7 ✗" } },
    { id:"s16", stage:"기본문제", block:"match", data:{
        title:"덧셈식과 답을 이어요",
        type:"touch_match",
        pairs:[
          { left:{label:"5 + 4"}, right:{num:9} },
          { left:{label:"6 + 1"}, right:{num:7} },
          { left:{label:"4 + 4"}, right:{num:8} }
        ] } },
    // ── 응용문제 ──
    { id:"s17", stage:"응용문제", block:"offline_activity", data:{
        title:"공깃돌 두 식 놀이",
        tag:"짝 활동", icon:"🪨",
        body:"공깃돌을 두 손에 나눠 쥐어요. 왼손 몇 개, 오른손 몇 개인지 보고 '몇 + 몇 = 몇'과 자리를 바꾼 식 두 개를 말해요.",
        materials:"공깃돌(또는 바둑돌) · 7분" } },
    { id:"s18", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 덧셈",
        scenario:{ icon:"🚌", body:"버스에 7명이 타고 있었는데 2명이 더 탔어요." },
        question:"7 + 2 = ___  모두 몇 명? 큰 수 7부터 이어 세 봐요.",
        answer:9 } },
    { id:"s19", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"합이 6이 되는 덧셈식을 자리를 바꾼 짝까지 모두 찾아보세요. (예: 1+5와 5+1, 2+4와 4+2 …)" } },
    // ── 정리 ──
    { id:"s20", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[
          "덧셈은 **모두 세기·이어 세기·십 배열판** 여러 방법으로 풀 수 있다.",
          "**큰 수부터 이어 세면** 더 빠르다 (예: 2+6 → 6,7,8).",
          "더하는 두 수는 **자리를 바꿔도 합이 같다** (4+3 = 3+4 = 7)."
        ] } },
    { id:"s21", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"⭐", count:3, label:"3"}, {emoji:"⭐", count:6, label:"+ 6"} ],
        question:"3 + 6 = ?  큰 수 6부터 이어 세 봐요.",
        input:"count_input", answer:9,
        note:"6 → 7,8,9. 3 + 6 = 9 (= 6 + 3)." } },
    { id:"s22", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔",
        preview:"이번엔 **뺄셈**! 덧셈의 반대인 빼기를 배워요. **-** 기호를 처음 만나요.",
        emoji:"➖" } }
  ],
  extras: [
    { id:"v_l67_add", type:"video", icon:"🎥", title:"여러 가지 덧셈 방법 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EC%9D%B4%EC%96%B4+%EC%84%B8%EA%B8%B0+%EB%8D%A7%EC%85%88",
      description:"모두 세기·이어 세기로 덧셈하는 과정을 보여 주는 영상.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"] },
    { id:"q_l67_fast", type:"fun_question", icon:"💡", title:"어느 게 더 빠를까?",
      content:"1 + 8 을 '1부터 이어 세기'와 '8부터 이어 세기'로 각각 해 봐요. 어느 쪽이 더 빠른가요?",
      fit_slides:["concept","question"] },
    { id:"a_l67_finger", type:"other_activity", icon:"🙌", title:"큰 수부터 이어 세기",
      content:"작은 수 + 큰 수 식을 보여 주고, 큰 수를 먼저 말한 뒤 작은 수만큼 손가락을 펴며 이어 세게 해요.",
      fit_slides:["concept","interactive_ten_frame"] },
    { id:"t_l67_start", type:"tip", icon:"🧩", title:"이어 세기 시작점",
      content:"이어 세기에서 '시작 수는 세지 않는다'를 강조하세요. '4!' 하고 그 다음부터 센다는 동작을 함께 연습하면 +1 오류가 줄어요.",
      fit_slides:["misconception","concept"] },
    { id:"x_l67_recount", type:"misconception", icon:"❓", title:"오개념 — 시작 수 다시 세기",
      content:"이어 세기에서 시작 수를 한 번 더 세어 답이 1 커지는 실수가 흔해요. 손가락 동작으로 바로잡아 주세요.",
      fit_slides:["misconception","basic_problem"] },
    { id:"r_l67_classroom", type:"real_world", icon:"🌍", title:"교실 속 덧셈",
      content:"우리 모둠 4명에 2명이 더 합쳐졌을 때, 연필 5자루에 3자루를 더 놓았을 때 — 빠른 방법으로 더해 봐요.",
      fit_slides:["real_world","offline_activity"] },
    { id:"g_l67_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"자리 바꾼 식 짝짓기",
      description:"답이 같은(자리만 바꾼) 식끼리 짝지어 보세요.", hint:"두 수의 자리만 다르고 합은 같아요.",
      pairs:[ {a:{text:"2 + 6"}, b:{text:"6 + 2"}}, {a:{text:"3 + 5"}, b:{text:"5 + 3"}}, {a:{text:"1 + 7"}, b:{text:"7 + 1"}}, {a:{text:"4 + 5"}, b:{text:"5 + 4"}} ],
      fit_slides:["multi","game"] },
    { id:"q_l67_check", type:"fun_question", icon:"💡", title:"합을 빠르게",
      content:"9 + 1, 8 + 2 처럼 합이 10이 되는 식을 빠르게 말해 봐요. 손가락 열 개로 확인할 수 있어요.",
      fit_slides:["summary","real_world"] },
    { id:"b_l67_book", type:"book", icon:"📖", title:"덧셈 그림책",
      content:"여러 가지로 수를 세고 더하는 장면이 담긴 그림책으로 덧셈을 이어 가 보세요.",
      source:"도서관에서 '덧셈·세기' 주제로 확인", fit_slides:["summary","motivate"] },
    { id:"t_l67_support", type:"tip", icon:"🧩", title:"이어 세기가 어려우면",
      content:"이어 세기를 어려워하면 십 배열판이나 구체물로 '모두 세기'부터 충분히 다진 뒤 이어 세기로 넘어가세요.",
      fit_slides:["basic_problem","self_assessment"] },
    { id:"e_l67_ten", type:"extension", icon:"⬆", title:"확장 — 10이 되는 짝",
      content:"합이 10이 되는 두 수(1·9, 2·8, 3·7 …)를 찾아보면 다음 학기 받아올림 학습에 도움이 돼요.",
      fit_slides:["advanced_problem","next_lesson"] },
    { id:"e_l67_three", type:"extension", icon:"⬆", title:"확장 — 세 수 더하기",
      content:"2 + 3 + 1 처럼 세 수를 더할 때, 앞에서부터 또는 합이 쉬운 짝부터 더하는 방법을 비교해 봐요.",
      fit_slides:["advanced_problem","summary"] }
  ]
};

/* u3_l08 — 뺄셈을 알아볼까요 · 밀도 표준 v1 */
LESSONS["u3_l08"] = {
  meta: { grade:1, subject:"수학", unit:3, n:8, title:"뺄셈을 알아볼까요", std:"[2수01-05]", duration_min:40 },
  slides: [
    // ── 도입 ──
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"뺄셈을 알아봐요\n- 기호", emoji:"➖" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"덧셈 **+ · =** 와 여러 가지 더하는 방법을 배웠어요.\n오늘은 그 반대인 **뺄셈**, **-** 기호를 만나요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"접시의 딸기를 먹어요",
        kids:[ {face:"🍓", label:"접시에\n딸기 7개"}, {face:"😋", label:"냠냠\n2개 먹음"} ],
        question:"남은 딸기는 몇 개일까요? 이걸 짧은 식으로 쓸 수 있을까요?" } },
    // ── 전개: - 도입 → 뺄셈식 → 가르기와 연결 ──
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"'빼기'를 - 로 써요",
        content:"'덜다 · 먹다 · 남다'를 기호 하나로 줄여 써요. 바로 **-** (빼기)예요.\n딸기 7개에서 2개를 먹으면 → **7 - 2**",
        items:[ {emoji:"🍓", count:7, label:"7"}, {emoji:"🍓", count:2, label:"- 2"} ],
        note:"👉 -는 '빼기'라고 읽어요. 7 - 2 는 '7 빼기 2'." } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"남은 수를 = 로 써요",
        content:"7에서 2를 빼면 5가 남아요 → **7 - 2 = 5**\n'7 빼기 2는 5와 같다'라고 읽어요.",
        items:[ {emoji:"🍓", count:5, label:"남은 5"} ],
        note:"👉 = 는 덧셈과 똑같이 '양쪽이 같다'는 뜻." } },
    { id:"s06", stage:"전개", block:"arrow_flow", data:{
        title:"식이 만들어지는 순서",
        flow:[ {num:7, label:"있던 딸기"}, {num:2, label:"먹은 딸기"}, {num:5, label:"남은 딸기", type:"up"} ],
        sub:"7 - 2 = 5 — 있던 수, 덜어낸 수, 그리고 남은 수." } },
    { id:"s07", stage:"전개", block:"visual_demo", data:{
        title:"십 배열판으로 빼기",
        items:[ {ten_frame:7, num:7, label:"7"}, {ten_frame:5, num:5, label:"7 - 2"} ],
        sub_text:"7칸에서 2칸을 지우면 5칸이 남아요." } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"빼는 순서를 거꾸로 한다 (7 - 2 를 2 - 7 로 바꿔 쓴다)",
        right:"뺄셈은 **있던 수(큰 수)에서** 덜어낸 수를 뺀다. 7 - 2 와 2 - 7 은 달라요.",
        hint:"'있던 수'를 앞에, '덜어낸 수'를 뒤에 써요." } },
    { id:"s09", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"덧셈 3 + 2 = 5 를 보고 뺄셈식도 만들 수 있을까요? (5에서 2를 빼면 몇?)" } },
    { id:"s10", stage:"전개", block:"concept", data:{
        title:"가르기가 뺄셈이에요",
        content:"5는 3과 2로 **가르기** 할 수 있었죠. 5에서 2를 빼면 3 → **5 - 2 = 3**\n가르기를 식으로 쓰면 뺄셈이에요.",
        items:[ {emoji:"🍪", count:5, label:"5를"}, {emoji:"🍪", count:3, label:"3과"}, {emoji:"🍪", count:2, label:"2로"} ],
        note:"👉 모으기↔덧셈, 가르기↔뺄셈." } },
    // ── 기본문제 ──
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"빼고 남은 수를 구해요",
        items:[ {emoji:"🐤", count:6, label:"6"}, {emoji:"🐤", count:2, label:"- 2"} ],
        question:"병아리 6마리 중 2마리가 둥지로 갔어요.  6 - 2 = ___  남은 건 몇 마리?",
        input:"count_input", answer:4,
        note:"풀이: 6에서 거꾸로 2번 → 5,4. 6 - 2 = 4." } },
    { id:"s12", stage:"기본문제", block:"basic_problem", data:{
        title:"십 배열판으로 7 - 2",
        scenario:{ icon:"🍓", body:"딸기 7개에서 2개를 먹었어요." },
        question:"7 - 2 는 몇 칸이 남을까요?",
        input:"count_input", answer:5,
        note:"7칸에서 2칸을 지우면 5칸. 7 - 2 = 5." } },
    { id:"s13", stage:"기본문제", block:"multi", data:{
        title:"바르게 쓴 뺄셈식을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"8 - 3 = 5", correct:true},
          {label:"6 - 2 = 3"},
          {label:"9 - 4 = 5", correct:true},
          {label:"7 - 5 = 3"}
        ],
        note:"풀이: 8-3=5 ✓ / 6-2=4 (≠3) ✗ / 9-4=5 ✓ / 7-5=2 (≠3) ✗" } },
    { id:"s14", stage:"기본문제", block:"match", data:{
        title:"뺄셈식과 답을 이어요",
        type:"touch_match",
        pairs:[
          { left:{label:"7 - 3"}, right:{num:4} },
          { left:{label:"9 - 2"}, right:{num:7} },
          { left:{label:"6 - 1"}, right:{num:5} }
        ] } },
    // ── 응용문제 ──
    { id:"s15", stage:"응용문제", block:"offline_activity", data:{
        title:"사라진 물건 놀이",
        tag:"짝 활동", icon:"🫳",
        body:"물건 몇 개를 놓고, 짝이 눈을 감은 사이 몇 개를 숨겨요. 몇 개가 사라졌는지 '몇 - 몇 = 몇'으로 말해요.",
        materials:"작은 물건 여러 개 · 7분" } },
    { id:"s16", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 뺄셈",
        scenario:{ icon:"🚌", body:"버스에 8명이 타고 있었는데 정류장에서 3명이 내렸어요." },
        question:"식으로 쓰면?  8 - 3 = ___  남은 사람은 몇 명?",
        answer:5 } },
    { id:"s17", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"9 - ? = 6 의 빈칸에 들어갈 수는 무엇일까요? 그리고 답이 6이 되는 뺄셈식을 여러 개 만들어 보세요." } },
    // ── 정리 ──
    { id:"s18", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[
          "'빼기'는 **-**, 뺄셈식은 '있던 수 - 덜어낸 수 = 남은 수' (예: 7 - 2 = 5).",
          "뺄셈은 **있던 수에서** 덜어낸 수를 뺀다 (7 - 2 와 2 - 7 은 다르다).",
          "**가르기**를 식으로 쓰면 뺄셈이다 (5는 3과 2 → 5 - 2 = 3)."
        ] } },
    { id:"s19", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"⭐", count:8, label:"8"}, {emoji:"⭐", count:3, label:"- 3"} ],
        question:"8 - 3 = 몇일까요?",
        input:"count_input", answer:5,
        note:"8에서 거꾸로 3번 → 7,6,5. 8 - 3 = 5." } },
    { id:"s20", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔",
        preview:"뺄셈을 **여러 가지 방법**으로 해 봐요. 거꾸로 세기·십 배열판으로 더 빠르게! 덧셈으로 답을 확인하는 법도 배워요.",
        emoji:"🧮" } }
  ],
  extras: [
    { id:"v_l08_sub", type:"video", icon:"🎥", title:"뺄셈 기호 - 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%BA%84%EC%85%88+%EA%B8%B0%ED%98%B8+%EB%B0%B0%EC%9A%B0%EA%B8%B0",
      description:"- 기호의 뜻과 뺄셈식 읽는 법을 보여 주는 영상. 개념 도입에 활용.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"] },
    { id:"q_l08_read", type:"fun_question", icon:"💡", title:"뺄셈식 읽기",
      content:"칠판에 7 - 2 = 5 를 적고 '7 빼기 2는 5와 같다'라고 다 함께 읽어 봐요. 다른 식도 읽어 볼까요?",
      fit_slides:["concept","summary"] },
    { id:"a_l08_hide", type:"other_activity", icon:"🙌", title:"손가락 빼기",
      content:"손가락을 몇 개 펴 두고 몇 개를 접으며 '몇 - 몇 = 몇'을 말하게 해요. 식과 동작이 연결돼요.",
      fit_slides:["concept","basic_problem"] },
    { id:"t_l08_order", type:"tip", icon:"🧩", title:"빼는 순서 강조",
      content:"'있던 수'를 앞에 쓴다는 것을 강조하세요. 7 - 2 와 2 - 7 을 비교해 보이면 순서가 중요함을 알 수 있어요.",
      fit_slides:["misconception","concept"] },
    { id:"x_l08_reverse", type:"misconception", icon:"❓", title:"오개념 — 순서 뒤집기",
      content:"작은 수를 앞에 써서 거꾸로 빼려는 학생이 있어요. '있던 것'이 앞, '덜어낸 것'이 뒤임을 그림으로 짚어 주세요.",
      fit_slides:["misconception","multi"] },
    { id:"r_l08_classroom", type:"real_world", icon:"🌍", title:"교실 속 뺄셈",
      content:"줄 선 친구 중 몇 명이 자리로 돌아갈 때, 사물함 책 몇 권을 꺼낼 때 — 남은 수를 식으로 써 봐요.",
      fit_slides:["real_world","offline_activity"] },
    { id:"g_l08_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"뺄셈식과 답 짝짓기",
      description:"뺄셈식과 답을 짝지어 보세요.", hint:"거꾸로 세기로 답을 구해요.",
      pairs:[ {a:{text:"5 - 2"}, b:{text:"3"}}, {a:{text:"8 - 3"}, b:{text:"5"}}, {a:{text:"6 - 4"}, b:{text:"2"}}, {a:{text:"9 - 1"}, b:{text:"8"}} ],
      fit_slides:["match","game"] },
    { id:"q_l08_pair", type:"fun_question", icon:"💡", title:"덧셈과 짝꿍",
      content:"5 - 2 = 3 을 보고, 3 + 2 = 5 가 되는지 확인해 봐요. 덧셈과 뺄셈은 어떤 사이일까요? (다음 차시 연결)",
      fit_slides:["question","next_lesson"] },
    { id:"b_l08_book", type:"book", icon:"📖", title:"뺄셈 그림책",
      content:"수가 줄어들고 사라지는 장면이 담긴 그림책으로 뺄셈을 친근하게 만나 보세요.",
      source:"도서관에서 '뺄셈·빼기' 주제로 확인", fit_slides:["summary","motivate"] },
    { id:"t_l08_support", type:"tip", icon:"🧩", title:"식 쓰기가 어려운 학생에게",
      content:"'__ - __ = __' 빈칸 틀을 주고, 그림을 보며 칸을 채우게 하면 뺄셈식 쓰기가 쉬워져요.",
      fit_slides:["basic_problem","self_assessment"] },
    { id:"e_l08_zero", type:"extension", icon:"⬆", title:"확장 — 같은 수를 빼면?",
      content:"5 - 5 는 얼마일까요? 같은 수를 빼면 0이 된다는 것을 미리 살짝 다뤄 볼 수 있어요. (l11에서 본격적으로)",
      fit_slides:["advanced_problem","next_lesson"] },
    { id:"e_l08_family", type:"extension", icon:"⬆", title:"확장 — 식 가족",
      content:"3, 2, 5 세 수로 만들 수 있는 식(3+2=5, 2+3=5, 5-2=3, 5-3=2)을 모아 보면 덧셈·뺄셈 관계가 보여요.",
      fit_slides:["advanced_problem","summary"] }
  ]
};

/* u3_l09_10 — 뺄셈을 해 볼까요 (병합 차시) · 밀도 표준 v1 */
LESSONS["u3_l09_10"] = {
  meta: { grade:1, subject:"수학", unit:3, n:"9~10", title:"뺄셈을 해 볼까요", std:"[2수01-06]", duration_min:80 },
  slides: [
    // ── 도입 ──
    { id:"s01", stage:"도입", block:"cover", data:{
        title:"뺄셈을 해 봐요\n여러 가지 방법", emoji:"🥒" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"뺄셈식 **7 - 2 = 5** 와 - 기호를 배웠어요.\n오늘은 뺄셈의 답을 구하는 **여러 가지 방법**을 익히고, 덧셈으로 확인하는 법도 배워요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"밭에서 오이를 땄어요",
        kids:[ {face:"🥒", label:"바구니에\n오이 9개"}, {face:"🧺", label:"3개를\n나눠 줌"} ],
        question:"남은 오이는 몇 개일까요? 어떻게 빼면 빠를까요?" } },
    // ── 전개: 세 가지 방법 + 덧셈으로 확인 + 차이 ──
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"빼는 여러 방법",
        content:"9 - 3 의 답은 **여러 방법**으로 구할 수 있어요.\n① 모두 놓고 빼기  ② 거꾸로 세기  ③ 십 배열판",
        items:[ {emoji:"🥒", count:9, label:"9"}, {emoji:"🥒", count:3, label:"- 3"} ] } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"① 거꾸로 세기",
        content:"9부터 거꾸로 세요. '9!' 하고 → 8,7,6.\n세 번 거꾸로 세면 6이 남아요. **9 - 3 = 6**",
        items:[ {emoji:"🥒", count:6, label:"남은 6"} ],
        note:"👉 뺄 수만큼만(3번) 거꾸로 세요." } },
    { id:"s06", stage:"전개", block:"visual_demo", data:{
        title:"② 십 배열판으로",
        items:[ {ten_frame:9, num:9, label:"9"}, {ten_frame:6, num:6, label:"9 - 3"} ],
        sub_text:"9칸에서 3칸을 지우면 6칸이 남아요." } },
    { id:"s07", stage:"전개", block:"concept", data:{
        title:"③ 덧셈으로 확인해요",
        content:"9 - 3 = 6 이 맞는지 거꾸로 확인! **6 + 3 = 9** 가 되면 맞아요.\n덧셈과 뺄셈은 짝이에요.",
        items:[ {emoji:"🥒", count:6, label:"6"}, {emoji:"🥒", count:3, label:"+ 3"}, {emoji:"🥒", count:9, label:"= 9"} ],
        note:"👉 뺄셈의 답에 뺀 수를 더하면 처음 수가 돼요." } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"거꾸로 셀 때 시작 수를 한 번 더 센다 (9 - 3을 9,8,7,6,5 — 9를 또 셈)",
        right:"시작 수는 빼고 **그 다음부터** 거꾸로 센다 (9 → 8,7,6). 뺄 수만큼만.",
        hint:"'9!' 하고 손가락 3개를 접으며 8,7,6." } },
    { id:"s09", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"8 - 1 은 어떤 방법이 가장 빠를까요? 8 - 7 은요? 왜 다를까요?" } },
    { id:"s10", stage:"전개", block:"concept", data:{
        title:"두 수의 차이도 뺄셈이에요",
        content:"민지는 딸기 7개, 준서는 4개. **누가 몇 개 더 많을까요?**\n7 - 4 = 3 → 민지가 3개 더 많아요. 이런 '차이'도 뺄셈으로 구해요.",
        items:[ {emoji:"🍓", count:7, label:"민지 7"}, {emoji:"🍓", count:4, label:"준서 4"} ],
        note:"👉 '얼마나 더?' '얼마나 차이?'도 뺄셈." } },
    // ── 기본문제 ──
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"거꾸로 세기로 풀어요",
        items:[ {emoji:"🍎", count:8, label:"8"}, {emoji:"🍎", count:3, label:"- 3"} ],
        question:"8 - 3 = ?  8부터 거꾸로 세 봐요.",
        input:"count_input", answer:5,
        note:"풀이: 8 → 7,6,5. 8 - 3 = 5." } },
    { id:"s12", stage:"기본문제", block:"basic_problem", data:{
        title:"십 배열판으로 7 - 2",
        items:[ {ten_frame:7, num:7, label:"7"}, {ten_frame:5, num:5, label:"7 - 2"} ],
        question:"7 - 2 는 몇 칸이 남을까요?",
        input:"count_input", answer:5,
        note:"7칸에서 2칸을 지우면 5칸. 7 - 2 = 5." } },
    { id:"s13", stage:"기본문제", block:"basic_problem", data:{
        title:"덧셈으로 답을 확인해요",
        scenario:{ icon:"✅", body:"9 - 4 = 5 라고 구했어요. 맞는지 확인해 봐요." },
        question:"5 + 4 = 몇일까요? (처음 수 9가 나오면 정답!)",
        input:"count_input", answer:9,
        note:"5 + 4 = 9. 처음 수 9가 나왔으니 9 - 4 = 5 가 맞아요." } },
    { id:"s14", stage:"기본문제", block:"multi", data:{
        title:"바르게 쓴 뺄셈식을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"9 - 4 = 5", correct:true},
          {label:"8 - 2 = 5"},
          {label:"7 - 3 = 4", correct:true},
          {label:"6 - 2 = 3"}
        ],
        note:"풀이: 9-4=5 ✓ / 8-2=6 (≠5) ✗ / 7-3=4 ✓ / 6-2=4 (≠3) ✗" } },
    { id:"s15", stage:"기본문제", block:"match", data:{
        title:"뺄셈식과 답을 이어요",
        type:"touch_match",
        pairs:[
          { left:{label:"8 - 5"}, right:{num:3} },
          { left:{label:"9 - 2"}, right:{num:7} },
          { left:{label:"6 - 1"}, right:{num:5} }
        ] } },
    // ── 응용문제 ──
    { id:"s16", stage:"응용문제", block:"offline_activity", data:{
        title:"의자 앉기 뺄셈 놀이",
        tag:"모둠 활동", icon:"🪑",
        body:"의자 몇 개에 친구들이 앉아요. 한 명씩 일어날 때마다 '몇 - 몇 = 몇'으로 남은 사람 수를 말해요.",
        materials:"의자 · 10분" } },
    { id:"s17", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 뺄셈",
        scenario:{ icon:"🍪", body:"쿠키 8개가 있었는데 친구들과 5개를 먹었어요." },
        question:"식으로 쓰면?  8 - 5 = ___  남은 쿠키는 몇 개?",
        answer:3 } },
    { id:"s18", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"7 - ? = 4 처럼 빈칸이 있는 뺄셈을 풀어 보세요. 그리고 덧셈(4 + ? = 7)으로 답이 맞는지 확인해 보세요." } },
    // ── 정리 ──
    { id:"s19", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[
          "뺄셈은 **거꾸로 세기·십 배열판** 등 여러 방법으로 풀 수 있다.",
          "거꾸로 셀 때는 **시작 수 다음부터** 뺄 수만큼만 센다 (9 → 8,7,6).",
          "뺄셈의 답에 뺀 수를 **더하면** 처음 수가 된다 (9-3=6, 6+3=9)."
        ] } },
    { id:"s20", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"⭐", count:9, label:"9"}, {emoji:"⭐", count:5, label:"- 5"} ],
        question:"9 - 5 = 몇일까요?",
        input:"count_input", answer:4,
        note:"9 → 8,7,6,5,4 (5번). 9 - 5 = 4. 확인: 4 + 5 = 9 ✓." } },
    { id:"s21", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔",
        preview:"**0이 있는** 덧셈과 뺄셈을 배워요. 0을 더하거나 빼면 수가 어떻게 될까요?",
        emoji:"0️⃣" } }
  ],
  extras: [
    { id:"v_l910_sub", type:"video", icon:"🎥", title:"여러 가지 뺄셈 방법 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EA%B1%B0%EA%BE%B8%EB%A1%9C+%EC%84%B8%EA%B8%B0+%EB%BA%84%EC%85%88",
      description:"거꾸로 세기로 뺄셈하는 과정을 보여 주는 영상.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"] },
    { id:"q_l910_check", type:"fun_question", icon:"💡", title:"덧셈으로 확인",
      content:"8 - 3 = 5 라고 구했어요. 5 + 3 을 해서 8이 나오는지 확인해 봐요. 왜 이렇게 확인할 수 있을까요?",
      fit_slides:["concept","summary"] },
    { id:"a_l910_finger", type:"other_activity", icon:"🙌", title:"손가락 거꾸로 세기",
      content:"손가락을 모두 편 뒤 뺄 수만큼 접으며 거꾸로 세요. 남은 손가락이 답이에요.",
      fit_slides:["concept","basic_problem"] },
    { id:"t_l910_start", type:"tip", icon:"🧩", title:"거꾸로 세기 시작점",
      content:"거꾸로 세기도 '시작 수는 세지 않는다'를 강조하세요. '9!' 하고 그 다음부터 8,7,6 세는 동작을 함께 연습하면 -1 오류가 줄어요.",
      fit_slides:["misconception","concept"] },
    { id:"x_l910_recount", type:"misconception", icon:"❓", title:"오개념 — 시작 수 다시 세기",
      content:"거꾸로 셀 때 시작 수를 한 번 더 세어 답이 1 작아지는 실수가 흔해요. 손가락 동작으로 바로잡아 주세요.",
      fit_slides:["misconception","multi"] },
    { id:"r_l910_classroom", type:"real_world", icon:"🌍", title:"교실 속 뺄셈",
      content:"모둠 친구 중 몇 명이 자리를 옮길 때, 색연필 몇 자루를 빌려줄 때 — 남은 수를 빠른 방법으로 빼 봐요.",
      fit_slides:["real_world","offline_activity"] },
    { id:"g_l910_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"뺄셈 짝짓기",
      description:"뺄셈식과 답을 짝지어 보세요.", hint:"거꾸로 세기로 답을 구해요.",
      pairs:[ {a:{text:"9 - 4"}, b:{text:"5"}}, {a:{text:"8 - 6"}, b:{text:"2"}}, {a:{text:"7 - 3"}, b:{text:"4"}}, {a:{text:"6 - 0"}, b:{text:"6"}} ],
      fit_slides:["match","game"] },
    { id:"q_l910_diff", type:"fun_question", icon:"💡", title:"얼마나 더 많을까?",
      content:"빨강 블록 8개와 파랑 블록 5개가 있어요. 어느 색이 몇 개 더 많을까요? 차이를 뺄셈으로 구해 봐요.",
      fit_slides:["concept","real_world"] },
    { id:"b_l910_book", type:"book", icon:"📖", title:"뺄셈 그림책",
      content:"수가 줄어드는 장면이 담긴 그림책으로 여러 가지 뺄셈을 이어 가 보세요.",
      source:"도서관에서 '뺄셈·세기' 주제로 확인", fit_slides:["summary","motivate"] },
    { id:"t_l910_support", type:"tip", icon:"🧩", title:"거꾸로 세기가 어려우면",
      content:"거꾸로 세기를 어려워하면 십 배열판에서 칸을 하나씩 지우며 세게 하세요. 눈으로 보며 세면 쉬워져요.",
      fit_slides:["basic_problem","self_assessment"] },
    { id:"e_l910_family", type:"extension", icon:"⬆", title:"확장 — 식 가족",
      content:"6, 3, 9 세 수로 덧셈·뺄셈 식 네 개(6+3=9, 3+6=9, 9-3=6, 9-6=3)를 만들어 보면 관계가 보여요.",
      fit_slides:["advanced_problem","summary"] },
    { id:"e_l910_zero", type:"extension", icon:"⬆", title:"확장 — 0을 빼면?",
      content:"5 - 0 은 얼마일까요? 0을 빼면 수가 그대로라는 것을 미리 살짝 다뤄 보세요. (l11에서 본격적으로)",
      fit_slides:["advanced_problem","next_lesson"] }
  ]
};

/* u3_l11 — 0이 있는 덧셈과 뺄셈 · 밀도 표준 v1 */
LESSONS["u3_l11"] = {
  meta: { grade:1, subject:"수학", unit:3, n:11, title:"0이 있는 덧셈과 뺄셈", std:"[2수01-06]", duration_min:40 },
  slides: [
    { id:"s01", stage:"도입", block:"cover", data:{ title:"0이 있는\n덧셈과 뺄셈", emoji:"0️⃣" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"여러 가지 방법으로 덧셈과 뺄셈을 했어요.\n오늘은 **0**이 들어간 식을 알아봐요. 0은 '아무것도 없음'이에요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"접시에 콩이 있어요",
        kids:[ {face:"🫛", label:"왼쪽 접시\n콩 4개"}, {face:"🍽️", label:"오른쪽 접시\n콩 0개(비었음)"} ],
        question:"두 접시의 콩을 모으면 모두 몇 개일까요?" } },
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"0은 '아무것도 없음'",
        content:"빈 접시에는 콩이 **0개** 있어요. 0은 하나도 없다는 뜻이에요.",
        items:[ {emoji:"🫛", count:4, label:"4개"}, {emoji:"🍽️", count:0, label:"0개(없음)"} ] } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"0을 더하면 그대로",
        content:"4개에 0개를 더해도 그대로 4개. **4 + 0 = 4**\n순서를 바꿔 **0 + 4 = 4** 도 마찬가지!",
        items:[ {emoji:"🫛", count:4, label:"4 + 0 = 4"} ],
        note:"👉 어떤 수에 0을 더하면 그 수 그대로." } },
    { id:"s06", stage:"전개", block:"concept", data:{
        title:"0을 빼도 그대로",
        content:"5개에서 0개를 빼도 그대로 5개. **5 - 0 = 5**\n아무것도 빼지 않았으니까요.",
        items:[ {emoji:"🍎", count:5, label:"5 - 0 = 5"} ],
        note:"👉 어떤 수에서 0을 빼면 그 수 그대로." } },
    { id:"s07", stage:"전개", block:"concept", data:{
        title:"모두 빼면 0",
        content:"3개에서 3개를 모두 빼면 하나도 안 남아요. **3 - 3 = 0**\n같은 수를 빼면 0이 돼요.",
        items:[ {emoji:"🍪", count:3, label:"3 - 3"}, {emoji:"🍽️", count:0, label:"= 0" } ],
        note:"👉 같은 수끼리 빼면 항상 0." } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"0을 더하거나 빼면 0이 된다고 생각한다 (4 + 0 = 0)",
        right:"0을 **더하거나 빼면** 수는 **그대로**. 4 + 0 = 4, 4 - 0 = 4. 단, 같은 수를 빼면 0 (4 - 4 = 0).",
        hint:"0은 '아무 변화 없음'. 단 '모두 빼기'는 0." } },
    { id:"s09", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"0 + 0 은 얼마일까요? 7 - 7 은요? 왜 그렇게 생각하나요?" } },
    { id:"s10", stage:"기본문제", block:"basic_problem", data:{
        title:"0을 더해 봐요",
        items:[ {emoji:"🐤", count:3, label:"3"}, {emoji:"🍽️", count:0, label:"+ 0"} ],
        question:"3 + 0 = 몇일까요?",
        input:"count_input", answer:3,
        note:"0을 더하면 그대로. 3 + 0 = 3." } },
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"0을 빼 봐요",
        scenario:{ icon:"🍓", body:"딸기 5개가 있는데 아무도 먹지 않았어요." },
        question:"5 - 0 = 몇일까요?",
        input:"count_input", answer:5,
        note:"0을 빼면 그대로. 5 - 0 = 5." } },
    { id:"s12", stage:"기본문제", block:"basic_problem", data:{
        title:"모두 빼 봐요",
        items:[ {emoji:"🍪", count:4, label:"4"}, {emoji:"🍪", count:4, label:"- 4"} ],
        question:"쿠키 4개를 모두 먹으면?  4 - 4 = ___",
        input:"count_input", answer:0,
        note:"같은 수를 빼면 0. 4 - 4 = 0 (하나도 안 남음)." } },
    { id:"s13", stage:"기본문제", block:"multi", data:{
        title:"답이 그대로(변하지 않는) 식을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"6 + 0", correct:true},
          {label:"6 - 6"},
          {label:"6 - 0", correct:true},
          {label:"0 + 0"}
        ],
        note:"풀이: 6+0=6 ✓(그대로) / 6-6=0 ✗ / 6-0=6 ✓(그대로) / 0+0=0 ✗" } },
    { id:"s14", stage:"응용문제", block:"offline_activity", data:{
        title:"빈손 더하기 놀이",
        tag:"짝 활동", icon:"✋",
        body:"한 사람이 손가락 몇 개를 펴고, 짝은 0개(주먹)를 내요. 모으면 몇? 0을 더해도 그대로임을 확인해요.",
        materials:"준비물 없음 · 5분" } },
    { id:"s15", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 0",
        scenario:{ icon:"🪙", body:"저금통에 동전 6개가 있는데 오늘은 한 개도 넣지 않았어요." },
        question:"6 + 0 = ___  저금통엔 몇 개?",
        answer:6 } },
    { id:"s16", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"답이 5가 되도록 0을 넣은 식을 만들어 보세요 (예: 5 + 0, 5 - 0, 0 + 5). 답이 0이 되는 식도 만들어 볼까요?" } },
    { id:"s17", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[
          "0을 **더하거나 빼면** 수는 **그대로** (4 + 0 = 4, 4 - 0 = 4).",
          "**같은 수를 빼면 0** (3 - 3 = 0).",
          "0은 '아무것도 없음'을 나타내는 수."
        ] } },
    { id:"s18", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        items:[ {emoji:"⭐", count:7, label:"7"}, {emoji:"⭐", count:0, label:"- 0"} ],
        question:"7 - 0 = 몇일까요?",
        input:"count_input", answer:7,
        note:"0을 빼면 그대로. 7 - 0 = 7." } },
    { id:"s19", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔",
        preview:"이 단원에서 배운 모으기·덧셈·뺄셈·0이 있는 식을 **모두 모아** 연습해 봐요.",
        emoji:"🧮" } }
  ],
  extras: [
    { id:"v_l11_zero", type:"video", icon:"🎥", title:"0이 있는 계산 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+0%EC%9D%B4+%EC%9E%88%EB%8A%94+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88",
      description:"0을 더하고 빼는 계산을 보여 주는 영상. 개념 도입에 활용.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"] },
    { id:"q_l11_empty", type:"fun_question", icon:"💡", title:"0은 어떤 수?",
      content:"교실에서 '0개'인 것을 찾아볼까요? (예: 빈 필통, 빈 의자) 0이 무슨 뜻인지 말로 설명해 봐요.",
      fit_slides:["concept","motivate"] },
    { id:"a_l11_fist", type:"other_activity", icon:"✊", title:"주먹은 0",
      content:"한 손은 수를 펴고 다른 손은 주먹(0)을 쥐어요. 모으면 그대로임을 손으로 확인해요.",
      fit_slides:["concept","basic_problem"] },
    { id:"t_l11_same", type:"tip", icon:"🧩", title:"0 더하기와 모두 빼기 구분",
      content:"'0을 더하거나 빼면 그대로'와 '같은 수를 빼면 0'을 헷갈리기 쉬워요. 두 경우를 나란히 칠판에 적어 비교해 주세요.",
      fit_slides:["misconception","concept"] },
    { id:"x_l11_zerores", type:"misconception", icon:"❓", title:"오개념 — 0이면 답도 0",
      content:"4 + 0 의 답을 0으로 쓰는 학생이 있어요. 구체물로 '아무것도 안 더했으니 그대로'를 보여 주세요.",
      fit_slides:["misconception","multi"] },
    { id:"r_l11_real", type:"real_world", icon:"🌍", title:"생활 속 0",
      content:"오늘 비 온 양이 0이면? 받은 칭찬 스티커가 0개면? 0이 들어간 상황을 식으로 말해 봐요.",
      fit_slides:["real_world","offline_activity"] },
    { id:"g_l11_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"0 식 짝짓기",
      description:"0이 있는 식과 답을 짝지어 보세요.", hint:"0을 더하거나 빼면 그대로, 같은 수를 빼면 0.",
      pairs:[ {a:{text:"5 + 0"}, b:{text:"5"}}, {a:{text:"5 - 5"}, b:{text:"0"}}, {a:{text:"0 + 3"}, b:{text:"3"}}, {a:{text:"7 - 0"}, b:{text:"7"}} ],
      fit_slides:["multi","game"] },
    { id:"q_l11_both", type:"fun_question", icon:"💡", title:"0 + 0 은?",
      content:"0에 0을 더하면 몇일까요? 아무것도 없는 데 아무것도 더하지 않았으니… 함께 생각해 봐요.",
      fit_slides:["question","summary"] },
    { id:"b_l11_book", type:"book", icon:"📖", title:"0에 관한 그림책",
      content:"수 0의 뜻을 재미있게 다룬 그림책으로 0을 더 친근하게 만나 보세요.",
      source:"도서관에서 '0·숫자' 주제로 확인", fit_slides:["summary","motivate"] },
    { id:"t_l11_support", type:"tip", icon:"🧩", title:"0이 어려운 학생에게",
      content:"빈 그릇과 채워진 그릇을 직접 보여 주며 '0은 비어 있음'을 손으로 느끼게 하면 이해가 빨라요.",
      fit_slides:["basic_problem","self_assessment"] },
    { id:"e_l11_pattern", type:"extension", icon:"⬆", title:"확장 — 0이 만드는 규칙",
      content:"3+0, 3-0, 4+0, 4-0 … 답을 적어 보면 '+0·-0은 그대로'라는 규칙이 한눈에 보여요.",
      fit_slides:["advanced_problem","summary"] },
    { id:"e_l11_family", type:"extension", icon:"⬆", title:"확장 — 같은 수 식 가족",
      content:"4와 0으로 만들 수 있는 식(4+0=4, 0+4=4, 4-0=4, 4-4=0)을 모아 보면 0의 성질이 보여요.",
      fit_slides:["advanced_problem","next_lesson"] }
  ]
};

/* u3_l12 — 덧셈과 뺄셈을 해 볼까요 (종합 연습) · 밀도 표준 v1 */
LESSONS["u3_l12"] = {
  meta: { grade:1, subject:"수학", unit:3, n:12, title:"덧셈과 뺄셈을 해 볼까요", std:"[2수01-06]", duration_min:40 },
  slides: [
    { id:"s01", stage:"도입", block:"cover", data:{ title:"덧셈과 뺄셈을\n해 봐요", emoji:"🧮" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"지난 시간엔 무엇을 했나요?",
        content:"0이 있는 덧셈·뺄셈을 배웠어요.\n오늘은 단원에서 배운 것을 **모두 모아** 연습해요. 한 수를 만드는 여러 식을 찾아봐요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"오늘의 수를 골라요",
        kids:[ {face:"6️⃣", label:"오늘의 수\n6"} ],
        question:"6을 만드는 덧셈식과 뺄셈식을 몇 가지나 만들 수 있을까요?" } },
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"6이 되는 덧셈식",
        content:"두 수를 더해 6을 만들어 봐요.\n**1+5, 2+4, 3+3, 4+2, 5+1** 모두 6!",
        items:[ {emoji:"🍓", count:6, label:"모두 6" } ],
        note:"👉 한 수를 만드는 덧셈식은 여러 가지." } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"6이 되는 뺄셈식",
        content:"빼서 6을 만들어 봐요.\n**7-1, 8-2, 9-3** 모두 6!",
        items:[ {emoji:"🍎", count:6, label:"모두 6" } ],
        note:"👉 뺄셈으로도 같은 수를 여러 가지로 만들 수 있어요." } },
    { id:"s06", stage:"전개", block:"concept", data:{
        title:"덧셈인지 뺄셈인지 먼저 봐요",
        content:"식을 풀 땐 가운데 **+ 인지 - 인지** 먼저 확인해요.\n+ 면 모으고(늘어남), - 면 덜어내요(줄어듦)." } },
    { id:"s07", stage:"전개", block:"visual_demo", data:{
        title:"십 배열판으로 확인",
        items:[ {ten_frame:5, num:5, label:"2+3"}, {ten_frame:5, num:5, label:"7-2"} ],
        sub_text:"2+3 도 7-2 도 모두 5칸. 식이 달라도 답이 같을 수 있어요." } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"이런 실수를 조심해요",
        label:"자주 하는 실수",
        wrong:"+ 와 - 를 대충 보고 반대로 푼다 (5 - 2 를 더해서 7)",
        right:"식의 **가운데 기호**를 꼭 확인해요. + 면 더하고, - 면 빼요.",
        hint:"문제를 풀기 전에 기호에 동그라미를 치는 습관!" } },
    { id:"s09", stage:"전개", block:"question", data:{
        title:"같이 생각해 봐요",
        question:"답이 7이 되는 식은 덧셈과 뺄셈 중 어느 쪽이 더 많이 만들어질까요?" } },
    { id:"s10", stage:"기본문제", block:"basic_problem", data:{
        title:"덧셈식을 풀어요",
        items:[ {emoji:"🍓", count:4, label:"4"}, {emoji:"🍓", count:3, label:"+ 3"} ],
        question:"4 + 3 = ?",
        input:"count_input", answer:7,
        note:"4 → 5,6,7. 4 + 3 = 7." } },
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"뺄셈식을 풀어요",
        items:[ {emoji:"🍎", count:8, label:"8"}, {emoji:"🍎", count:5, label:"- 5"} ],
        question:"8 - 5 = ?",
        input:"count_input", answer:3,
        note:"8 → 7,6,5,4,3. 8 - 5 = 3." } },
    { id:"s12", stage:"기본문제", block:"multi", data:{
        title:"답이 6이 되는 식을 모두 골라요",
        expectedCount:2,
        options:[
          {label:"2 + 4", correct:true},
          {label:"3 + 4"},
          {label:"9 - 3", correct:true},
          {label:"8 - 1"}
        ],
        note:"풀이: 2+4=6 ✓ / 3+4=7 ✗ / 9-3=6 ✓ / 8-1=7 ✗" } },
    { id:"s13", stage:"기본문제", block:"match", data:{
        title:"식과 답을 이어요",
        type:"touch_match",
        pairs:[
          { left:{label:"3 + 5"}, right:{num:8} },
          { left:{label:"9 - 5"}, right:{num:4} },
          { left:{label:"6 + 1"}, right:{num:7} }
        ] } },
    { id:"s14", stage:"응용문제", block:"offline_activity", data:{
        title:"오늘의 수 만들기 놀이",
        tag:"모둠 활동", icon:"🎯",
        body:"교사가 '오늘의 수'를 정하면, 그 수가 되는 덧셈식·뺄셈식을 모둠에서 번갈아 말해요. 더 많이 만드는 모둠이 이겨요.",
        materials:"칠판 · 8분" } },
    { id:"s15", stage:"응용문제", block:"real_world", data:{
        title:"우리 생활 속 식",
        scenario:{ icon:"🍬", body:"사탕 5개가 있었는데 3개를 더 받고, 그중 2개를 먹었어요." },
        question:"지금 사탕은?  5 + 3 을 한 뒤 - 2.  몇 개?",
        answer:6 } },
    { id:"s16", stage:"응용문제", block:"advanced_problem", data:{
        title:"생각을 넓혀요",
        challenge:"'오늘의 수'를 8로 정했어요. 8이 되는 덧셈식과 뺄셈식을 각각 세 개 이상 만들어 보세요." } },
    { id:"s17", stage:"정리", block:"summary", data:{
        title:"오늘 배운 것",
        points:[
          "한 수를 만드는 식은 **여러 가지** (6 = 2+4 = 9-3 …).",
          "식을 풀 땐 **+·- 기호를 먼저** 확인한다.",
          "덧셈·뺄셈을 자유롭게 오가며 답을 구할 수 있다."
        ] } },
    { id:"s18", stage:"정리", block:"basic_problem", data:{
        title:"오늘 스스로 점검",
        scenario:{ icon:"🐢", body:"연못에 거북 4마리가 있었는데 3마리가 더 오고, 2마리가 물속으로 갔어요." },
        question:"4 + 3 - 2 = ?  지금 거북은 몇 마리?",
        input:"count_input", answer:5,
        note:"4 + 3 = 7, 7 - 2 = 5. 답은 5." } },
    { id:"s19", stage:"정리", block:"next_lesson", data:{
        title:"다음 시간엔",
        preview:"단원을 **마무리**하며 배운 것을 스스로 점검해 봐요.",
        emoji:"🏁" } }
  ],
  extras: [
    { id:"v_l12_mix", type:"video", icon:"🎥", title:"덧셈·뺄셈 종합 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88+%EC%97%B0%EC%8A%B5",
      description:"덧셈과 뺄셈을 섞어 연습하는 영상. 복습에 활용.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","concept"] },
    { id:"q_l12_many", type:"fun_question", icon:"💡", title:"몇 가지나?",
      content:"'오늘의 수'를 7로 정하면, 7이 되는 식을 몇 가지 만들 수 있을까요? 덧셈·뺄셈 모두 떠올려 봐요.",
      fit_slides:["concept","summary"] },
    { id:"a_l12_card", type:"other_activity", icon:"🃏", title:"수 카드 식 만들기",
      content:"수 카드 두세 장과 +·- 카드를 섞어 놓고, 목표 수가 되는 식을 만들게 해요.",
      fit_slides:["concept","offline_activity"] },
    { id:"t_l12_sign", type:"tip", icon:"🧩", title:"기호 먼저 보기",
      content:"문제를 풀기 전 가운데 기호에 동그라미를 치게 하면 +·- 혼동이 크게 줄어요.",
      fit_slides:["misconception","basic_problem"] },
    { id:"x_l12_flip", type:"misconception", icon:"❓", title:"오개념 — 기호 무시",
      content:"숫자만 보고 무조건 더하거나 빼는 학생이 있어요. 기호를 손으로 짚으며 읽게 하세요.",
      fit_slides:["misconception","multi"] },
    { id:"r_l12_real", type:"real_world", icon:"🌍", title:"생활 속 섞인 식",
      content:"간식을 받고(더하기) 나눠 주는(빼기) 상황처럼, 더하고 빼는 일이 섞인 하루를 식으로 말해 봐요.",
      fit_slides:["real_world","offline_activity"] },
    { id:"g_l12_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"같은 답 식 짝짓기",
      description:"답이 같은 덧셈식과 뺄셈식을 짝지어 보세요.", hint:"양쪽을 각각 풀어 답을 비교해요.",
      pairs:[ {a:{text:"2 + 3"}, b:{text:"7 - 2"}}, {a:{text:"4 + 2"}, b:{text:"9 - 3"}}, {a:{text:"3 + 4"}, b:{text:"8 - 1"}}, {a:{text:"1 + 3"}, b:{text:"6 - 2"}} ],
      fit_slides:["multi","game"] },
    { id:"q_l12_more", type:"fun_question", icon:"💡", title:"덧셈이 많을까 뺄셈이 많을까",
      content:"답이 3이 되는 식을 덧셈으로, 뺄셈으로 각각 찾아보고 개수를 비교해 봐요.",
      fit_slides:["question","summary"] },
    { id:"b_l12_book", type:"book", icon:"📖", title:"덧셈·뺄셈 그림책",
      content:"수를 더하고 빼는 다양한 장면이 담긴 그림책으로 연습을 이어 가 보세요.",
      source:"도서관에서 '덧셈·뺄셈' 주제로 확인", fit_slides:["summary","motivate"] },
    { id:"t_l12_support", type:"tip", icon:"🧩", title:"섞인 식이 어려우면",
      content:"4 + 3 - 2 처럼 섞인 식은 **앞에서부터 차례로** 풀라고 안내하세요. 한 단계씩 끊어 계산하면 쉬워요.",
      fit_slides:["basic_problem","self_assessment"] },
    { id:"e_l12_target", type:"extension", icon:"⬆", title:"확장 — 목표 수 도전",
      content:"세 수를 써서 목표 수를 만드는 식(예: 2 + 4 - 1 = 5)에 도전해 봐요.",
      fit_slides:["advanced_problem","summary"] },
    { id:"e_l12_review", type:"extension", icon:"⬆", title:"확장 — 단원 복습 지도",
      content:"모으기→덧셈→뺄셈→0 순서로 헷갈린 부분을 표시하며 다음 마무리 차시 준비를 도와주세요.",
      fit_slides:["next_lesson","summary"] }
  ]
};

/* u3_l13 — 수학이랑 확인해요 (단원 마무리·평가) · 밀도 표준 v1 */
LESSONS["u3_l13"] = {
  meta: { grade:1, subject:"수학", unit:3, n:13, title:"수학이랑 확인해요", std:"[2수01-04], [2수01-05], [2수01-06]", duration_min:40 },
  slides: [
    { id:"s01", stage:"도입", block:"cover", data:{ title:"수학이랑 확인해요\n단원 마무리", emoji:"🏁" } },
    { id:"s02", stage:"도입", block:"review", data:{
        title:"이 단원에서 배운 것",
        content:"**모으기·가르기 → 덧셈(+) → 뺄셈(-) → 0이 있는 식**을 배웠어요.\n오늘은 모두 떠올리며 스스로 점검해 봐요." } },
    { id:"s03", stage:"도입", block:"motivate", data:{
        scene_title:"단원을 마무리해요",
        kids:[ {face:"🧮", label:"모으기·가르기"}, {face:"➕", label:"덧셈"}, {face:"➖", label:"뺄셈"} ],
        question:"무엇이 가장 자신 있나요? 어떤 것이 더 연습이 필요할까요?" } },
    { id:"s04", stage:"전개", block:"concept", data:{
        title:"① 모으기·가르기를 떠올려요",
        content:"두 수를 하나로 **모으기**, 한 수를 둘로 **가르기**.\n(예: 3과 2를 모으면 5, 5는 3과 2로 가르기)",
        items:[ {emoji:"🍅", count:3, label:"3"}, {emoji:"🍅", count:2, label:"2"}, {emoji:"🍅", count:5, label:"모으면 5"} ] } },
    { id:"s05", stage:"전개", block:"concept", data:{
        title:"② 덧셈을 떠올려요",
        content:"모으는 상황은 **덧셈(+)**. 3 + 2 = 5.\n큰 수부터 이어 세면 빠르고, 자리를 바꿔도 합은 같아요.",
        items:[ {emoji:"🐝", count:5, label:"3 + 2 = 5"} ],
        note:"👉 + 는 '더하기', = 는 '같다'." } },
    { id:"s06", stage:"전개", block:"concept", data:{
        title:"③ 뺄셈을 떠올려요",
        content:"덜어내는 상황은 **뺄셈(-)**. 5 - 2 = 3.\n거꾸로 세거나 십 배열판으로 풀고, 덧셈으로 확인할 수 있어요.",
        items:[ {emoji:"🍓", count:3, label:"5 - 2 = 3"} ],
        note:"👉 가르기를 식으로 쓰면 뺄셈." } },
    { id:"s07", stage:"전개", block:"concept", data:{
        title:"④ 0이 있는 식",
        content:"0을 **더하거나 빼면** 그대로 (4 + 0 = 4, 4 - 0 = 4).\n**같은 수를 빼면 0** (4 - 4 = 0).",
        items:[ {emoji:"🍎", count:4, label:"4 + 0 = 4"} ] } },
    { id:"s08", stage:"전개", block:"misconception", data:{
        title:"점검! 이런 실수 없었나요?",
        label:"단원 빈출 실수",
        wrong:"이어 세기 시작 수 다시 세기 · +/- 반대로 풀기 · 0 더하면 0이라 생각하기",
        right:"시작 수 다음부터 세기 · 기호 먼저 확인 · 0 더하기·빼기는 그대로(같은 수 빼기만 0)",
        hint:"문제마다 기호에 동그라미, 시작 수에 점 찍기!" } },
    { id:"s09", stage:"기본문제", block:"basic_problem", data:{
        title:"덧셈식을 풀어요",
        items:[ {emoji:"🦋", count:5, label:"5"}, {emoji:"🦋", count:3, label:"+ 3"} ],
        question:"5 + 3 = ?",
        input:"count_input", answer:8,
        note:"5 → 6,7,8. 5 + 3 = 8." } },
    { id:"s10", stage:"기본문제", block:"basic_problem", data:{
        title:"뺄셈식을 풀어요",
        items:[ {emoji:"🐤", count:9, label:"9"}, {emoji:"🐤", count:4, label:"- 4"} ],
        question:"9 - 4 = ?",
        input:"count_input", answer:5,
        note:"9 → 8,7,6,5. 9 - 4 = 5." } },
    { id:"s11", stage:"기본문제", block:"basic_problem", data:{
        title:"0이 있는 식을 풀어요",
        scenario:{ icon:"🍪", body:"쿠키 6개가 있는데 아무도 먹지 않았어요." },
        question:"6 - 0 = ?",
        input:"count_input", answer:6,
        note:"0을 빼면 그대로. 6 - 0 = 6." } },
    { id:"s12", stage:"기본문제", block:"basic_problem", data:{
        title:"8을 가르기 해요",
        items:[ {emoji:"⭐", count:8, label:"8개"} ],
        question:"별 8개 중 내가 5개를 가지면, 동생은 몇 개? (8은 5와 ?)",
        input:"count_input", answer:3,
        note:"8은 5와 3으로 가르기. 8 - 5 = 3." } },
    { id:"s13", stage:"응용문제", block:"real_world", data:{
        title:"꽃은 모두 몇 송이일까요?",
        scenario:{ icon:"🌷", body:"화단에 빨강 꽃 4송이와 노랑 꽃 3송이가 피었어요." },
        question:"꽃은 모두 몇 송이?  4 + 3 = ___",
        answer:7 } },
    { id:"s14", stage:"응용문제", block:"real_world", data:{
        title:"개구리는 몇 마리 남았을까요?",
        scenario:{ icon:"🐸", body:"연못에 개구리 8마리가 있었는데 3마리가 뛰어 나갔어요." },
        question:"남은 개구리는?  8 - 3 = ___",
        answer:5 } },
    { id:"s15", stage:"응용문제", block:"advanced_problem", data:{
        title:"농장에서 식을 만들어요",
        challenge:"농장 그림(소·닭·오리 등)을 떠올려, **덧셈식 하나와 뺄셈식 하나**를 직접 만들어 친구에게 내 보세요." } },
    { id:"s16", stage:"정리", block:"summary", data:{
        title:"단원에서 배운 것",
        points:[
          "**모으기·가르기**로 수를 다루고, 그것이 **덧셈·뺄셈**으로 이어진다.",
          "덧셈은 이어 세기, 뺄셈은 거꾸로 세기 — 십 배열판으로도 풀 수 있다.",
          "**0**을 더하거나 빼면 그대로, **같은 수를 빼면 0**."
        ] } },
    { id:"s17", stage:"정리", block:"self_assessment", data:{
        title:"스스로 점검해요",
        items:[
          "모으기·가르기를 할 수 있어요",
          "덧셈식을 쓰고 풀 수 있어요",
          "뺄셈식을 쓰고 풀 수 있어요",
          "0이 있는 식을 풀 수 있어요"
        ],
        prompts:[
          "가장 자신 있는 것에 별을 더 많이 칠해 봐요.",
          "더 연습하고 싶은 것은 무엇인가요?"
        ] } },
    { id:"s18", stage:"정리", block:"next_lesson", data:{
        title:"다음엔",
        preview:"2학기에는 **더 큰 수(50까지)**의 덧셈과 뺄셈을 배워요. 오늘 배운 것이 바탕이 돼요!",
        emoji:"🚀" } }
  ],
  extras: [
    { id:"v_l13_review", type:"video", icon:"🎥", title:"단원 복습 영상",
      url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+1%ED%95%99%EB%85%84+%EB%8D%A7%EC%85%88%EA%B3%BC+%EB%BA%84%EC%85%88+%EB%8B%A8%EC%9B%90+%EB%B3%B5%EC%8A%B5",
      description:"덧셈과 뺄셈 단원 전체를 정리하는 복습 영상.",
      source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["review","summary"] },
    { id:"q_l13_best", type:"fun_question", icon:"💡", title:"가장 쉬운 방법은?",
      content:"6 + 2 와 9 - 1 을 각자 좋아하는 방법으로 풀어 봐요. 친구와 방법이 같았나요?",
      fit_slides:["concept","self_assessment"] },
    { id:"a_l13_station", type:"other_activity", icon:"🎡", title:"코너 점검 놀이",
      content:"모으기·덧셈·뺄셈·0 네 코너를 돌며 한 문제씩 풀어요. 다 풀면 단원 도장을 받아요.",
      fit_slides:["basic_problem","summary"] },
    { id:"t_l13_check", type:"tip", icon:"🧩", title:"오답 함께 보기",
      content:"틀린 문제는 '왜 그렇게 생각했는지' 말로 설명하게 한 뒤 바로잡으면, 다음에 같은 실수를 덜 해요.",
      fit_slides:["misconception","self_assessment"] },
    { id:"x_l13_common", type:"misconception", icon:"❓", title:"오개념 — 단원 빈출 실수 모음",
      content:"시작 수 다시 세기, 기호 반대로 풀기, 0 처리 오류 — 세 가지를 한 장에 모아 마지막으로 점검해 주세요.",
      fit_slides:["misconception","review"] },
    { id:"r_l13_real", type:"real_world", icon:"🌍", title:"생활 속 덧셈·뺄셈",
      content:"하루 동안 더하고 뺀 일(간식 받기·나눠 주기 등)을 떠올려 식으로 적어 보면 단원이 생활과 이어져요.",
      fit_slides:["real_world","summary"] },
    { id:"g_l13_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"단원 식 짝짓기",
      description:"여러 가지 식과 답을 짝지어 단원을 정리해요.", hint:"덧셈·뺄셈·0 식을 골고루 풀어 봐요.",
      pairs:[ {a:{text:"4 + 4"}, b:{text:"8"}}, {a:{text:"7 - 3"}, b:{text:"4"}}, {a:{text:"5 + 0"}, b:{text:"5"}}, {a:{text:"6 - 6"}, b:{text:"0"}} ],
      fit_slides:["basic_problem","game"] },
    { id:"q_l13_proud", type:"fun_question", icon:"💡", title:"가장 뿌듯한 것",
      content:"이 단원에서 가장 잘하게 된 것은 무엇인가요? 짝에게 자랑해 봐요.",
      fit_slides:["self_assessment","summary"] },
    { id:"b_l13_book", type:"book", icon:"📖", title:"수 이야기 그림책",
      content:"더하고 빼는 이야기가 담긴 그림책으로 단원을 즐겁게 마무리해 보세요.",
      source:"도서관에서 '덧셈·뺄셈 이야기' 주제로 확인", fit_slides:["summary","next_lesson"] },
    { id:"t_l13_support", type:"tip", icon:"🧩", title:"느린 학생 배려",
      content:"점검은 점수보다 '어디까지 할 수 있는지' 확인이 목적이에요. 못 푼 문제는 함께 다시 풀며 격려해 주세요.",
      fit_slides:["self_assessment","basic_problem"] },
    { id:"e_l13_next", type:"extension", icon:"⬆", title:"확장 — 2학기 미리 보기",
      content:"10이 되는 짝(1·9, 2·8 …)을 찾아 두면 2학기 받아올림·받아내림 학습에 큰 도움이 돼요.",
      fit_slides:["next_lesson","summary"] },
    { id:"e_l13_make", type:"extension", icon:"⬆", title:"확장 — 나만의 문제 내기",
      content:"배운 것을 활용해 친구에게 낼 덧셈·뺄셈 문제를 만들어 보면 이해가 더 단단해져요.",
      fit_slides:["advanced_problem","next_lesson"] }
  ]
};
