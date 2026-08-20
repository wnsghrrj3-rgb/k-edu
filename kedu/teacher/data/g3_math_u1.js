/* ============================================================================
   3학년 1학기 수학 — 1단원 「덧셈과 뺄셈」 케이티처(교사주도) 차시 데이터 (9차시)
   - 키: window.LESSONS["u1_l{NN}"] (zero-pad). g3_math.html이 자동 로드·누적.
   - 성취기준 [4수01-01]. 학생 본차시 01~09 전 차시 대응(1:1).
   ------------------------------------------------------------
   2026-08-20 신규 제작 (40분 표준 v2 · 7요소) — 케이티처 3학년 첫 대상
   - 차시당 18슬 · extras 20~24
   - 7요소 전 차시: ①review items(l01 제외·from=이전차시) ②img 폴백
     ③서사(곰이·펭이 온라인 마을 여행) ④offline_activity(l09 마무리·평가 제외 8차시)
     ⑤leveled_problem(기본·도전·심화 3탭·심화 open) ⑥exit_ticket(확인3+신호등3) ⑦tnote 6슬 이상
   - 근거 고정 = 학생 본차시(grade3/semester1/math/1단원_덧셈과뺄셈/) 검증 식 전수 계승.
     계산은 전부 산수 검산 대상(게이트 D가 eval로 재검산).
   - 3학년 용어 가드: 이 단원은 세 자리 수의 덧셈·뺄셈만 다룬다.
     아직 배우지 않은 갈래(뒤 단원 소관)의 이름·기호는 학생 노출 자리에 쓰지 않는다.
     어려운 말(법칙 이름·알고리즘 따위)도 쓰지 않고 일상 표현으로 푼다.
   - 선행 용어 규약: '받아올림'은 l03, '어림'은 l03, '받아내림'은 l06에서 도입.
     -> l02 본문에 '받아올림'·'어림' 선행 노출 금지 / l02~l05 본문에 '받아내림' 선행 노출 금지.
     주의 예외 둘: (1) l01은 단원 예고 차시라 세 걸음을 이름으로 모두 소개한다
                  (2) next_lesson 블록은 다음 차시 예고 자리다. (게이트 E가 이 둘을 제외하고 검사)
   - 케이랩 매핑 없음: 세 자리 수 세로셈은 공책·수 모형 실물이 화면 교구보다 우위
     (g2_math_klab.js 헤더의 정직 원칙 계승).
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ══════════════════ l01 — 덧셈과 뺄셈을 만나 볼까요 (단원 도입) ══════════════════ */
  window.LESSONS["u1_l01"] = {
    meta: { grade:3, subject:"수학", unit:1, n:1, title:"덧셈과 뺄셈을 만나 볼까요 (단원 도입)", std:"[4수01-01]", duration_min:40,
      lesson_format:"단원 도입 · 40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_01_덧셈과뺄셈을만나볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"덧셈과 뺄셈을 만나 볼까요\n수가 커져도 겁내지 않아요", emoji:"🧮"}, suggested_extras:["v_l1_intro"]},
      {id:"s02", stage:"도입", block:"objective", data:{title:"이 단원에서 배울 것", content:"**세 자리 수의 덧셈**을 해 봐요.\n**세 자리 수의 뺄셈**을 해 봐요.\n덧셈과 뺄셈으로 **생활 속 문제**를 풀어 봐요."}, suggested_extras:["t_l1_map"], tnote:{ask:["2학년 때는 몇 자리 수까지 더해 보았나요?","수가 커지면 무엇이 달라질까요?"], watch:"'수가 커져서 어렵다'며 미리 물러서는 아이", min:2}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 온라인 마을에 들어왔어요", kids:[{face:"🐻", label:"곰이\n\"동화책이 426권!\""},{face:"🐧", label:"펭이\n\"과학책은 342권이래\""}], question:"학교 도서관에 동화책이 **426권**, 과학책이 **342권** 있어요. 책은 모두 몇 권일까요?", img:"assets/photo/math/library_shelves.jpg"}, suggested_extras:["q_l1_big","t_l1_daily","b_l1_book"], tnote:{ask:["책이 모두 몇 권인지 알려면 더할까요, 뺄까요?","대강 몇 권쯤 될 것 같나요?"], watch:"수가 커지자 계산을 포기하고 답을 찍는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"2학년 때 이런 걸 배웠어요", content:"두 자리 수의 덧셈과 뺄셈을 배웠지요.\n**34 + 52**처럼 **같은 자리끼리** 더하고 뺐어요.", note:"👉 세 자리 수도 방법은 똑같아요. 자리가 하나 늘어날 뿐이에요."}, suggested_extras:["q_l1_recall"], tnote:{ask:["34 + 52는 어떻게 계산했나요?","일의 자리는 일의 자리끼리, 그다음은요?"], watch:"자리를 맞추지 않고 아무 수끼리나 더하는 경우", min:3}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"세 자리 수는 이렇게 생겼어요", content:"**245**는 백 모형 2개, 십 모형 4개, 일 모형 5개가 모인 수예요.", items:[{emoji:"🟪", count:2, label:"**백**의 자리\n2 → 200"},{emoji:"🟦", count:4, label:"**십**의 자리\n4 → 40"},{emoji:"🟩", count:5, label:"**일**의 자리\n5 → 5"}], note:"👉 245 = 200 + 40 + 5"}, suggested_extras:["e_l1_model","t_l1_place"], tnote:{ask:["245에서 4는 얼마를 나타내나요?","백의 자리 숫자는 무엇인가요?"], watch:"자리와 숫자를 섞어 말하는 경우(4를 '사'로만 읽음)", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"세 자리 수도 각 자리끼리 더해요", content:"**245 + 312**\n일의 자리 5 + 2 = 7, 십의 자리 4 + 1 = 5, 백의 자리 2 + 3 = 5.\n그래서 **245 + 312 = 557**.", note:"👉 일 → 십 → 백 차례로 더하면 돼요."}, suggested_extras:["e_l1_model"], tnote:{ask:["어느 자리부터 더하는 게 편할까요?","왜 일의 자리부터 할까요?"], watch:"백의 자리부터 더하다 자리를 잃는 경우", min:4}},
      {id:"s07", stage:"전개", block:"concept", data:{title:"뺄셈도 각 자리끼리 빼요", content:"**568 − 234**\n일의 자리 8 − 4 = 4, 십의 자리 6 − 3 = 3, 백의 자리 5 − 2 = 3.\n그래서 **568 − 234 = 334**.", note:"👉 덧셈과 똑같이 같은 자리끼리 셈해요."}, suggested_extras:["q_l1_recall"], tnote:{ask:["뺄셈도 어느 자리부터 할까요?","덧셈과 다른 점이 있나요?"], watch:"뺄 수 없는 자리를 만나면 순서를 바꿔 빼려는 조짐", min:3}},
      {id:"s08", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"수를 쓸 때 **끝만 맞추면 된다**고 생각한다. (245 아래에 31을 아무렇게나 씀)", right:"**같은 자리끼리 줄을 맞추어** 써야 해요. 일의 자리는 일의 자리 아래, 십의 자리는 십의 자리 아래.", hint:"공책 칸을 한 칸에 한 숫자씩 쓰게 하면 자리 어긋남이 크게 줄어듭니다."}, suggested_extras:["x_l1_align","t_l1_grid"], tnote:{ask:["이렇게 쓰면 어디가 잘못됐을까요?","줄을 맞추려면 무엇을 보고 써야 할까요?"], watch:"세로셈에서 자리를 어긋나게 쓰는 아이 — 이 단원 최대 오답 원인", min:4}},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"2학년 셈 되짚기 ①", scenario:{icon:"🧮", body:"곰이가 2학년 때 배운 셈을 다시 풀어 봐요."}, question:"34 + 52는 얼마일까요?", input:"count_input", answer:86, note:"풀이: 일의 자리 4 + 2 = 6, 십의 자리 3 + 5 = 8 → **86**"}, suggested_extras:["q_l1_recall"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"2학년 셈 되짚기 ②", scenario:{icon:"🧮", body:"이번엔 뺄셈이에요."}, question:"78 − 45는 얼마일까요?", input:"count_input", answer:33, note:"풀이: 일의 자리 8 − 5 = 3, 십의 자리 7 − 4 = 3 → **33**"}, suggested_extras:["q_l1_recall"]},
      {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"자리를 읽어요", scenario:{icon:"🔢", body:"245를 살펴봐요."}, question:"245에서 백의 자리 숫자는 얼마일까요?", input:"count_input", answer:2, note:"풀이: 245는 **2**백 **4**십 **5**. 백의 자리 숫자는 **2**(나타내는 값은 200)."}, suggested_extras:["t_l1_place"]},
      {id:"s12", stage:"기본문제", block:"leveled_problem", data:{title:"수를 키워 가며 셈해 봐요", levels:{"기본":{q:"47 + 38은 얼마일까요?", a:"85", steps:["일의 자리 7 + 8 = 15 → 5를 쓰고 1을 십의 자리로","십의 자리 4 + 3 = 7, 올라온 1을 더해 8","답 85"]},"도전":{q:"213 + 124는 얼마일까요?", a:"337", steps:["일 3 + 4 = 7","십 1 + 2 = 3","백 2 + 1 = 3 → 337"]},"심화":{q:"세 자리 수 두 개를 골라 더하는 문제를 만들고, 짝에게 내 봐요. 답도 함께 적어요.", a:"여러 답 (예: 321 + 154 = 475)", open:true}}}, suggested_extras:["q_l1_make","g_l1_card"], tnote:{ask:["일의 자리 합이 10을 넘으면 어떻게 할까요?","문제를 만들 때 무엇을 정해야 하나요?"], watch:"올라온 1을 잊고 십의 자리만 더하는 경우", min:5}},
      {id:"s13", stage:"응용문제", block:"offline_activity", data:{title:"교실에서 세 자리 수 찾기", type:"group", goal:"교실·학교에서 세 자리 수를 찾아 모으고, 두 수를 골라 더하거나 빼 보기", steps:["모둠에서 교실·복도·도서관의 세 자리 수를 다섯 개 찾는다 (쪽수·번호·개수)","모둠 판에 큰 글씨로 적는다","두 수를 골라 덧셈식과 뺄셈식을 하나씩 만든다","어느 쪽이 더 큰 수가 되는지 말해 본다"], materials:["모둠 판","네임펜"], minutes:7}, suggested_extras:["q_l1_big","t_l1_daily"], tnote:{ask:["왜 그 두 수를 골랐나요?","더한 값과 뺀 값 중 어느 쪽이 클까요?"], watch:"수만 적고 식을 만들지 못하는 모둠 — 두 수를 먼저 짚어 줄 것", min:7}},
      {id:"s14", stage:"응용문제", block:"real_world", data:{title:"어른들도 세 자리 수를 셈해요", scenario:{icon:"🏫", body:"학교 급식 인원, 도서관 대출 권수, 놀이공원 입장객 수 — 모두 세 자리 수예요."}, content:"수가 커질수록 **머릿속 계산은 어려워지고**, 자리를 맞추어 적어 셈하는 힘이 필요해져요. 이 단원이 그 힘을 길러 줘요."}, suggested_extras:["r_l1_school","r_l1_shop"]},
      {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"도서관 문제를 풀어요", context:"도서관에 책이 357권 있었어요.", challenge:"그중 124권을 빌려 갔어요. 남은 책은 몇 권일까요? 식을 세우고 답을 구해 봐요.", note:"풀이: 357 − 124 = **233권**. '있던 수에서 나간 수를 덜어 낸다'가 뺄셈이에요."}, suggested_extras:["q_l1_story"], tnote:{ask:["더하기일까요, 빼기일까요? 왜 그렇게 생각했나요?","식을 먼저 쓰면 무엇이 좋아질까요?"], watch:"문장을 읽고 무조건 더하는 경우", min:4}},
      {id:"s16", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"세 자리 수를 더할 때 무엇끼리 더하나요?", a:"같은 자리끼리"},{q:"245에서 백의 자리 숫자는?", a:"2 (나타내는 값 200)"},{q:"357 − 124는?", a:"233"}], self:["세 자리 수 셈을 해 보고 싶어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["세 자리 수는 **백·십·일**의 자리로 이루어져 있다.","덧셈도 뺄셈도 **같은 자리끼리** 셈한다.","세로셈은 **자리를 맞추어** 써야 한다.","곰이와 펭이의 온라인 마을 여행이 시작됐다."], arrows:["같은 자리끼리","자리 맞추어 쓰기","세 자리 수 셈"]}, suggested_extras:["r_l1_school"]},
      {id:"s18", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 세 자리 수가 어떻게 이루어졌는지 알게 되었나요?","🔧 과정·기능 — 같은 자리끼리 맞추어 셈할 수 있나요?","💛 가치·태도 — 큰 수도 해 볼 만하다고 느꼈나요?"], prompts:["오늘 가장 궁금해진 것은 무엇인가요?"]}, suggested_extras:["c_l1_prep"]},
      {id:"s19", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"곰이와 펭이가 만난 첫 문제 **426 + 342**를 직접 풀어 봐요. 수 모형으로 하나씩 짚어 가며 계산해요.", emoji:"➕"}, suggested_extras:["c_l1_prep"]}
    ],
    extras: [
      {id:"v_l1_intro", type:"video", icon:"🎥", title:"세 자리 수 덧셈·뺄셈 미리보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%EC%84%B8+%EC%9E%90%EB%A6%AC+%EC%88%98+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88", description:"단원 전체 흐름을 훑는 도입 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","objective"]},
      {id:"q_l1_big", type:"fun_question", icon:"💡", title:"큰 수는 언제 쓸까", content:"우리 학교 학생 수, 우리 반이 한 해에 읽은 책 수 — 두 자리로 적을 수 있을까요? 언제부터 세 자리가 필요할까요?", fit_slides:["motivate","offline_activity"]},
      {id:"q_l1_recall", type:"fun_question", icon:"💡", title:"2학년 셈 떠올리기", content:"두 자리 수를 더할 때 꼭 지켰던 약속은 무엇이었나요? 세 자리가 되면 그 약속이 달라질까요?", fit_slides:["review","concept","basic_problem"]},
      {id:"q_l1_make", type:"fun_question", icon:"💡", title:"내가 내는 문제", content:"세 자리 수 두 개를 골라 문제를 만들어 봐요. 답이 가장 큰 문제를 낸 사람은 누구일까요?", fit_slides:["leveled_problem","game"]},
      {id:"q_l1_story", type:"fun_question", icon:"💡", title:"더할까 뺄까", content:"'모두 몇', '남은 것은 몇', '더 많은 것은 몇' — 어떤 말이 나오면 더하고, 어떤 말이 나오면 뺄까요?", fit_slides:["advanced_problem","real_world"]},
      {id:"q_l1_zero", type:"fun_question", icon:"💡", title:"0이 있는 자리", content:"305처럼 가운데가 0인 수도 있어요. 이 수의 십의 자리는 무엇을 뜻할까요?", fit_slides:["concept","basic_problem"]},
      {id:"t_l1_map", type:"tip", icon:"🧩", title:"단원 지도를 먼저 붙여 두기", content:"덧셈 세 걸음 → 뺄셈 세 걸음 → 놀이로 쓰기 → 스스로 마무리. 칠판 한쪽에 붙여 두고 매 차시 짚으면 아이가 지금 어디쯤인지 압니다.", fit_slides:["objective","summary"]},
      {id:"t_l1_place", type:"tip", icon:"🧩", title:"숫자와 값을 나누어 말하기", content:"'백의 자리 숫자는 2, 나타내는 값은 200'처럼 두 가지를 늘 붙여 말해 주면 뒤 차시 받아올림 설명이 훨씬 수월해집니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l1_grid", type:"tip", icon:"🧩", title:"모눈 공책 한 칸에 한 숫자", content:"자리 어긋남은 이 단원 최다 오답 원인입니다. 모눈 공책이나 칸 그은 학습지를 단원 내내 쓰게 하세요.", fit_slides:["misconception","concept"]},
      {id:"t_l1_daily", type:"tip", icon:"🧩", title:"교실 속 수로 시작", content:"교과서 쪽수·사물함 번호·급식 인원처럼 눈앞의 수로 열면 '수학책 속 수'라는 거리감이 줄어듭니다.", fit_slides:["motivate","offline_activity"]},
      {id:"t_l1_fear", type:"tip", icon:"🧩", title:"'자리가 하나 늘었을 뿐'", content:"세 자리라 어렵다고 느끼는 아이에게는 두 자리 셈을 먼저 시키고 그 옆에 백의 자리만 붙여 보여 주세요.", fit_slides:["review","concept"]},
      {id:"r_l1_school", type:"real_world", icon:"🌍", title:"학교에서 만나는 세 자리 수", content:"급식 인원, 도서관 대출 권수, 운동회 참가자 수 — 학교 안에도 세 자리 수가 가득합니다.", fit_slides:["real_world","summary"]},
      {id:"r_l1_shop", type:"real_world", icon:"🌍", title:"가게의 계산대", content:"물건값을 더하고 거스름돈을 빼는 일은 어른들이 하루에도 몇 번씩 하는 세 자리 수 셈입니다.", fit_slides:["real_world"]},
      {id:"r_l1_online", type:"real_world", icon:"🌍", title:"온라인 마을의 수", content:"댓글 수·접속자 수·점수처럼 인터넷 속 숫자도 매일 더해지고 빠집니다.", fit_slides:["motivate","real_world"]},
      {id:"g_l1_card", type:"game", icon:"🎮", title:"숫자 카드 세 자리 만들기", content:"0~9 카드를 세 장 뽑아 세 자리 수를 만들고, 짝과 더하기 대결을 합니다. 큰 합을 만든 쪽이 이겨요.", fit_slides:["leveled_problem","game"]},
      {id:"g_l1_guess", type:"game", icon:"🎮", title:"자리 맞히기", content:"교사가 세 자리 수를 부르면 학생은 '백!' '십!' '일!' 중 교사가 가리킨 자리의 숫자를 외칩니다.", fit_slides:["concept","basic_problem"]},
      {id:"x_l1_align", type:"misconception", icon:"⚠️", title:"자리 어긋나게 쓰기", content:"245 아래에 31을 왼쪽 끝에 맞춰 쓰는 실수입니다. 칸이 그어진 종이 한 장이면 대부분 사라집니다.", fit_slides:["misconception","concept"]},
      {id:"x_l1_order", type:"misconception", icon:"⚠️", title:"백의 자리부터 셈하기", content:"일의 자리부터 하는 까닭은 뒤 차시에서 분명해집니다. 지금은 '차례를 지키면 헷갈리지 않는다'로 충분합니다.", fit_slides:["concept","misconception"]},
      {id:"e_l1_model", type:"example", icon:"📝", title:"수 모형 준비", content:"백판·십막대·일낱개 모형을 모둠당 한 벌씩. 단원 내내 쓰는 준비물이라 1차시에 배치해 두면 좋습니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l1_sheet", type:"example", icon:"📝", title:"세로셈 칸 학습지", content:"백·십·일 세 칸이 그어진 빈 학습지를 만들어 두면 이 단원 아홉 차시를 그대로 씁니다.", fit_slides:["misconception","leveled_problem"]},
      {id:"b_l1_book", type:"book", icon:"📚", title:"수를 다룬 그림책 찾기", content:"도서관에서 '큰 수·숫자'를 다룬 그림책을 골라 도입에 한 장면만 읽어 주면 동기가 살아납니다.", fit_slides:["motivate"]},
      {id:"c_l1_prep", type:"checklist", icon:"✅", title:"단원 준비물 점검", content:"수 모형 한 벌·모눈 공책·숫자 카드·모둠 판. 1차시에 안내해 두면 이후 차시가 끊기지 않습니다.", fit_slides:["objective","self_assessment","next_lesson"]}
    ]
  };

  /* ══════════════════ l02 — 덧셈을 해 볼까요 (1) ══════════════════ */
  window.LESSONS["u1_l02"] = {
    meta: { grade:3, subject:"수학", unit:1, n:2, title:"덧셈을 해 볼까요? (1)", std:"[4수01-01]", duration_min:40,
      lesson_format:"교사주도 — 각 자리끼리 그대로 더하는 세 자리 수 덧셈 · 40분 표준 v2(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_02_덧셈을_해_볼까요_1.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"덧셈을 해 볼까요? (1)\n각 자리끼리 더해요", emoji:"➕"}, suggested_extras:["v_l2_add"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"세 자리 수는 **백·십·일**의 자리로 이루어져 있고, 덧셈도 뺄셈도 **같은 자리끼리** 셈한다고 했어요.", items:[{q:"세 자리 수를 더할 때 무엇끼리 더하나요?", a:"같은 자리끼리"},{q:"245에서 백의 자리 숫자는?", a:"2 (나타내는 값 200)"},{q:"357 − 124는?", a:"233"}], from:"u1_l01"}, suggested_extras:["q_l2_same"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"접속한 아바타는 모두 몇 명일까요", kids:[{face:"🐻", label:"곰이\n\"오전에 426명!\""},{face:"🐧", label:"펭이\n\"오후엔 342명이래\""}], question:"온라인 마을에 오전에 **426명**, 오후에 **342명**이 접속했어요. 하루 동안 접속한 아바타는 모두 몇 명일까요?", img:"assets/photo/math/online_village.jpg"}, suggested_extras:["q_l2_story","t_l2_daily"], tnote:{ask:["'모두 몇 명'은 더하기일까요, 빼기일까요?","식을 먼저 세워 볼까요?"], watch:"수만 보고 바로 계산하려 해 식을 빠뜨리는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 식을 세우고 수 모형으로 놓아요", content:"오전 **426명**과 오후 **342명**을 더하면 돼요.\n식: **426 + 342**\n426은 백 4·십 2·일 6, 342는 백 3·십 4·일 2예요.", note:"👉 자리별로 모형을 나란히 놓으면 무엇끼리 더할지 한눈에 보여요."}, suggested_extras:["e_l2_model"], tnote:{ask:["426은 백이 몇 개인가요?","두 수를 어떻게 놓으면 더하기 쉬울까요?"], watch:"모형을 섞어 놓아 자리가 헝클어지는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"일의 자리끼리 더해요", content:"일 모형 **6개**와 **2개**를 더하면 **8개**예요.\n일의 자리: **6 + 2 = 8**", note:"👉 셈은 늘 **일의 자리부터** 시작해요."}, suggested_extras:["t_l2_order"], tnote:{ask:["왜 일의 자리부터 할까요?","일 모형은 모두 몇 개가 되었나요?"], watch:"백의 자리부터 하려는 아이 — 다음 차시를 위해 차례를 굳혀 둘 것", min:3}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"십의 자리, 백의 자리도 더해요", content:"십 모형 **2개 + 4개 = 6개**, 백 모형 **4개 + 3개 = 7개**.\n그래서 **426 + 342 = 768**.", items:[{emoji:"🟩", count:8, label:"**일**의 자리\n6 + 2 = 8"},{emoji:"🟦", count:6, label:"**십**의 자리\n2 + 4 = 6"},{emoji:"🟪", count:7, label:"**백**의 자리\n4 + 3 = 7"}], note:"👉 세로셈으로 쓰면 자리가 저절로 맞춰져요."}, suggested_extras:["e_l2_model","e_l2_sheet"], tnote:{ask:["세로로 쓰면 무엇이 편해지나요?","답 768을 자리별로 읽어 볼까요?"], watch:"가로식만 고집해 자리 어긋남이 반복되는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"세 자리 수와 두 자리 수를 더할 때 **앞쪽 끝을 맞추어** 쓴다. (426 + 31을 4와 3이 만나게 씀)", right:"**오른쪽 끝(일의 자리)을 맞추어** 써야 해요. 일은 일끼리, 십은 십끼리 만나야 해요.", hint:"426 + 31을 두 가지로 써 보이고 어느 쪽이 맞는지 고르게 하면 단번에 드러납니다."}, suggested_extras:["x_l2_align","t_l2_grid"], tnote:{ask:["둘 중 어느 쪽이 바르게 쓴 것일까요?","왜 그렇게 생각했나요?"], watch:"자릿수가 다른 두 수를 더할 때 특히 자주 어긋남", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"기본 덧셈 ①", scenario:{icon:"🧮", body:"자리별로 차근차근 더해 봐요."}, question:"125 + 352는 얼마일까요?", input:"count_input", answer:477, note:"풀이: 일 5 + 2 = 7, 십 2 + 5 = 7, 백 1 + 3 = 4 → **477**"}, suggested_extras:["e_l2_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"기본 덧셈 ②", scenario:{icon:"🧮", body:"이번에는 백의 자리가 커요."}, question:"581 + 315는 얼마일까요?", input:"count_input", answer:896, note:"풀이: 일 1 + 5 = 6, 십 8 + 1 = 9, 백 5 + 3 = 8 → **896**"}, suggested_extras:["e_l2_sheet"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"기본 덧셈 ③", scenario:{icon:"🧮", body:"0이 있는 자리도 겁내지 말아요."}, question:"636 + 103은 얼마일까요?", input:"count_input", answer:739, note:"풀이: 일 6 + 3 = 9, 십 3 + 0 = 3, 백 6 + 1 = 7 → **739**. 0을 더해도 그대로예요."}, suggested_extras:["q_l2_zero"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 풀어요", levels:{"기본":{q:"242 + 236은 얼마일까요?", a:"478", steps:["일 2 + 6 = 8","십 4 + 3 = 7","백 2 + 2 = 4 → 478"]},"도전":{q:"딸기를 채원이네는 184개, 건우네는 213개 땄어요. 두 모둠이 딴 딸기는 모두 몇 개일까요?", a:"397개", steps:["'모두'이므로 덧셈 → 184 + 213","일 4 + 3 = 7, 십 8 + 1 = 9, 백 1 + 2 = 3","답 397개"]},"심화":{q:"각 자리끼리 그대로 더해지는 세 자리 수 덧셈 문제를 만들어 짝에게 내 봐요. 어떤 조건을 지켜야 할까요?", a:"여러 답 (각 자리 합이 9를 넘지 않게 두 수를 고른다)", open:true}}}, suggested_extras:["q_l2_make","g_l2_race"], tnote:{ask:["'모두'라는 말이 나오면 어떤 셈일까요?","문제를 만들 때 무엇을 살펴야 할까요?"], watch:"심화에서 조건을 못 찾고 아무 수나 고르는 경우 — 한 자리씩 확인시킬 것", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"수 모형으로 짝과 더하기", type:"pair", goal:"수 모형을 자리별로 놓고 짝과 번갈아 세 자리 수 덧셈을 만들어 계산하기", steps:["짝과 각자 세 자리 수를 하나씩 만들어 모형으로 놓는다","자리별로 나란히 모아 개수를 센다","공책에 세로셈으로 옮겨 적는다","서로 답이 같은지 확인하고 다른 곳을 찾는다"], materials:["수 모형 한 벌","모눈 공책"], minutes:7}, suggested_extras:["e_l2_model","t_l2_grid"], tnote:{ask:["모형으로 센 값과 세로셈 값이 같나요?","다르다면 어디부터 다시 볼까요?"], watch:"모형만 세고 세로셈으로 옮기지 않는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"하루 접속자 수를 세는 일", scenario:{icon:"📱", body:"누리집을 운영하는 사람들은 오전·오후 접속자 수를 더해 하루 값을 냅니다."}, content:"오전과 오후를 따로 세어 두었다가 **더해서 하루 값**을 만드는 것, 오늘 배운 덧셈 그대로예요."}, suggested_extras:["r_l2_online","r_l2_market"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"고구마 문제를 풀어요", context:"곰이네 텃밭에서 지난달에 고구마를 672개 캤어요.", challenge:"이번 달에는 지난달보다 214개 더 캤어요. 이번 달에 캔 고구마는 몇 개일까요? 식을 세우고 답을 구해 봐요.", note:"풀이: '~보다 더'는 덧셈 → 672 + 214 = **886개**"}, suggested_extras:["q_l2_story"], tnote:{ask:["'~보다 더 캤다'는 더하기일까요?","무엇을 기준으로 더하는 걸까요?"], watch:"'더'라는 말만 보고 두 수를 아무렇게나 더하는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"세로셈에서 어느 쪽 끝을 맞추어 쓰나요?", a:"오른쪽 끝(일의 자리)"},{q:"426 + 342는?", a:"768"},{q:"636 + 103은?", a:"739"}], self:["각 자리끼리 더할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["세 자리 수 덧셈은 **일 → 십 → 백** 차례로 더한다.","세로셈은 **오른쪽 끝을 맞추어** 쓴다.","0을 더하면 그 자리는 그대로다.","곰이와 펭이는 하루 접속자가 **768명**임을 알아냈다."], arrows:["식 세우기","자리별 더하기","세로셈"]}, suggested_extras:["r_l2_online"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 각 자리끼리 더하는 까닭을 알게 되었나요?","🔧 과정·기능 — 세로셈으로 바르게 쓸 수 있나요?","💛 가치·태도 — 큰 수 셈이 재미있었나요?"], prompts:["오늘 셈에서 가장 조심해야 할 곳은 어디였나요?"]}, suggested_extras:["e_l2_sheet"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"한 자리의 합이 **10을 넘으면** 어떻게 할까요? 넘친 만큼을 윗자리로 올려 주는 **받아올림**을 배우고, 계산 전에 답을 가늠하는 **어림**도 함께 해 봐요.", emoji:"🔟"}, suggested_extras:["c_l2_prep"]}
    ],
    extras: [
      {id:"v_l2_add", type:"video", icon:"🎥", title:"수 모형으로 보는 세 자리 덧셈", url:"https://www.youtube.com/results?search_query=%EC%84%B8+%EC%9E%90%EB%A6%AC+%EC%88%98+%EB%8D%A7%EC%85%88+%EC%88%98+%EB%AA%A8%ED%98%95", description:"자리별로 모형을 모으는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"]},
      {id:"q_l2_same", type:"fun_question", icon:"💡", title:"왜 같은 자리끼리일까", content:"백 모형과 일 모형을 한데 세면 무슨 일이 생길까요? 왜 같은 자리끼리만 모아야 할까요?", fit_slides:["review","concept"]},
      {id:"q_l2_story", type:"fun_question", icon:"💡", title:"문장 속 힌트 찾기", content:"'모두', '합해서', '~보다 더' — 이런 말이 나오면 어떤 셈을 하게 될까요?", fit_slides:["motivate","advanced_problem"]},
      {id:"q_l2_zero", type:"fun_question", icon:"💡", title:"0이 있는 자리", content:"103처럼 가운데가 0인 수를 더하면 그 자리는 어떻게 될까요? 왜 그럴까요?", fit_slides:["basic_problem","concept"]},
      {id:"q_l2_make", type:"fun_question", icon:"💡", title:"조건이 있는 문제 만들기", content:"각 자리 합이 9를 넘지 않으려면 두 수를 어떻게 골라야 할까요?", fit_slides:["leveled_problem"]},
      {id:"q_l2_check", type:"fun_question", icon:"💡", title:"답을 확인하는 법", content:"계산이 맞는지 다시 확인하려면 어떻게 하면 좋을까요? 순서를 바꾸어 더해 보면 어떨까요?", fit_slides:["basic_problem","summary"]},
      {id:"t_l2_order", type:"tip", icon:"🧩", title:"일의 자리부터의 습관", content:"지금은 어느 자리부터 해도 답이 같지만, 다음 차시부터는 차례가 답을 가릅니다. 이번 차시에 습관을 굳혀 두세요.", fit_slides:["concept","misconception"]},
      {id:"t_l2_grid", type:"tip", icon:"🧩", title:"칸 있는 종이 계속 쓰기", content:"1차시에 만든 세로셈 칸 학습지를 이어서 씁니다. 자리 어긋남이 줄면 뒤 차시가 훨씬 수월해요.", fit_slides:["misconception","offline_activity"]},
      {id:"t_l2_daily", type:"tip", icon:"🧩", title:"온라인 마을이라는 무대", content:"접속자·댓글·점수처럼 아이들에게 익숙한 수를 무대로 쓰면 문장제 거부감이 줄어듭니다.", fit_slides:["motivate","real_world"]},
      {id:"t_l2_read", type:"tip", icon:"🧩", title:"답을 자리별로 읽기", content:"'칠백육십팔'이 아니라 '백이 7개, 십이 6개, 일이 8개'로 한 번 더 읽게 하면 자릿값이 굳어집니다.", fit_slides:["concept","summary"]},
      {id:"t_l2_pair", type:"tip", icon:"🧩", title:"짝과 답 맞추기", content:"답이 다를 때 서로 어디부터 다른지 찾게 하면 오답 고치기가 활동이 됩니다.", fit_slides:["offline_activity","basic_problem"]},
      {id:"r_l2_online", type:"real_world", icon:"🌍", title:"누리집 방문자 세기", content:"오전·오후 방문자를 따로 세어 두었다가 더해 하루 값을 냅니다.", fit_slides:["real_world","summary"]},
      {id:"r_l2_market", type:"real_world", icon:"🌍", title:"시장에서 물건 세기", content:"상자마다 개수를 적어 두었다가 모두 더해 하루 판 개수를 냅니다.", fit_slides:["real_world"]},
      {id:"r_l2_farm", type:"real_world", icon:"🌍", title:"텃밭 수확 기록", content:"달마다 캔 개수를 적어 두면 지난달과 이번 달을 견주고 더할 수 있습니다.", fit_slides:["advanced_problem","real_world"]},
      {id:"g_l2_race", type:"game", icon:"🎮", title:"자리별 이어달리기", content:"모둠에서 한 명은 일, 한 명은 십, 한 명은 백을 맡아 차례로 더해 답을 완성합니다.", fit_slides:["leveled_problem","game"]},
      {id:"g_l2_bingo", type:"game", icon:"🎮", title:"덧셈 빙고", content:"칸에 세 자리 수를 적어 두고 교사가 낸 덧셈의 답이 있으면 지웁니다.", fit_slides:["basic_problem","game"]},
      {id:"x_l2_align", type:"misconception", icon:"⚠️", title:"자릿수가 다를 때 어긋남", content:"426 + 31처럼 자릿수가 다르면 앞을 맞추는 실수가 늘어납니다. 빈자리에 0을 상상해 보게 하세요.", fit_slides:["misconception","basic_problem"]},
      {id:"x_l2_mix", type:"misconception", icon:"⚠️", title:"모형 섞어 세기", content:"백 모형과 십 모형을 한 무더기로 세면 값이 엉킵니다. 자리별 접시를 나눠 주면 예방됩니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l2_model", type:"example", icon:"📝", title:"자리별 접시 놓기", content:"백·십·일 세 접시를 두고 모형을 나누어 담게 하면 자리 개념이 눈에 보입니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l2_sheet", type:"example", icon:"📝", title:"세로셈 칸 학습지", content:"백·십·일 세 칸이 그어진 학습지. 이 단원 아홉 차시 내내 씁니다.", fit_slides:["basic_problem","concept","self_assessment"]},
      {id:"e_l2_story", type:"example", icon:"📝", title:"문장제 세 줄 틀", content:"'무엇을 / 어떤 말이 있었나 / 식' 세 줄로 적게 하면 문장제 실수가 줄어듭니다.", fit_slides:["advanced_problem"]},
      {id:"c_l2_prep", type:"checklist", icon:"✅", title:"다음 차시 준비", content:"수 모형·모눈 공책은 그대로. 다음 차시에는 십 모형을 백 모형으로 바꿔 볼 자리가 필요합니다.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l03 — 덧셈을 해 볼까요 (2) ══════════════════ */
  window.LESSONS["u1_l03"] = {
    meta: { grade:3, subject:"수학", unit:1, n:3, title:"덧셈을 해 볼까요? (2)", std:"[4수01-01]", duration_min:40,
      lesson_format:"교사주도 — 받아올림이 한 번 있는 덧셈 · 어림 도입 · 40분 표준 v2(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_03_덧셈을_해_볼까요_2.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"덧셈을 해 볼까요? (2)\n10이 넘으면 윗자리로", emoji:"🔟"}, suggested_extras:["v_l3_carry"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"세로셈은 **오른쪽 끝을 맞추어** 쓰고, **일 → 십 → 백** 차례로 더한다고 했어요.", items:[{q:"세로셈에서 어느 쪽 끝을 맞추어 쓰나요?", a:"오른쪽 끝(일의 자리)"},{q:"426 + 342는?", a:"768"},{q:"636 + 103은?", a:"739"}], from:"u1_l02"}, suggested_extras:["q_l3_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"좋아요와 최고예요, 모두 몇 개일까요", kids:[{face:"🐻", label:"곰이\n\"좋아요 234개!\""},{face:"🐧", label:"펭이\n\"최고예요는 158개야\""}], question:"온라인 마을 게시물에 **좋아요 234개**, **최고예요 158개**가 달렸어요. 반응은 모두 몇 개일까요?", img:"assets/photo/math/online_reaction.jpg"}, suggested_extras:["q_l3_story","t_l3_stage"], tnote:{ask:["일의 자리부터 더하면 4 + 8은 몇인가요?","한 자리에 10개가 넘게 생기면 어떻게 할까요?"], watch:"12를 그대로 한 자리에 써 버리는 경우 — 이 차시의 핵심 장면", min:4}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 어림해 볼까요", content:"**234**는 약 **230**, **158**은 약 **160**.\n그래서 합은 **약 390**쯤 될 거예요.\n**어림**은 계산하기 전에 **대강의 값**을 미리 가늠해 보는 거예요.", note:"👉 어림값이 있으면 답이 크게 어긋났을 때 바로 알아챌 수 있어요."}, suggested_extras:["t_l3_estimate","q_l3_est"], tnote:{ask:["234를 어느 수로 바꾸어 보면 셈이 쉬울까요?","어림값과 계산값이 똑같아야 할까요?"], watch:"어림값을 정답으로 여기고 계산을 건너뛰는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"일의 자리에서 받아올림!", content:"일 모형이 **4 + 8 = 12개**!\n10개를 묶어 **십 모형 1개**로 바꿔요.\n일의 자리엔 **2**가 남아요.", note:"👉 넘친 10을 윗자리로 올려 주는 것을 **받아올림**이라고 해요."}, suggested_extras:["e_l3_model","t_l3_ten"], tnote:{ask:["일 모형 12개를 어떻게 정리할까요?","십 모형으로 바뀐 1은 어디에 적어 둘까요?"], watch:"12에서 1을 올리고도 일의 자리에 12를 그대로 쓰는 경우", min:5}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"올라온 1을 잊지 마세요", content:"십의 자리: **3 + 5 = 8**, 올라온 **1**을 더해 **9**.\n백의 자리: **2 + 1 = 3**.\n그래서 **234 + 158 = 392**!\n어림은 **390**, 계산은 **392** — 비슷하니 잘 계산했어요.", note:"👉 올려 준 1은 작게 적어 두면 잊지 않아요."}, suggested_extras:["e_l3_sheet","x_l3_forget"], tnote:{ask:["올라온 1은 어느 자리에 더하나요?","어림 390과 계산 392를 견주면 어떤가요?"], watch:"올라온 1을 빠뜨려 382로 답하는 경우 — 최다 오답", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"일의 자리 합이 **12**면 그대로 **12**를 써 버린다. 또는 올려 준 **1을 빠뜨린다**.", right:"한 자리에는 숫자 **하나**만 써요. 10이 넘으면 **10을 윗자리로 올리고** 남은 것만 씁니다. 올린 1은 반드시 더해요.", hint:"올린 1을 세로셈 위에 작게 적는 습관을 들이면 빠뜨림이 크게 줄어듭니다."}, suggested_extras:["x_l3_forget","t_l3_mark"], tnote:{ask:["한 칸에 12를 쓸 수 있을까요?","올린 1을 어디에 적어 두면 좋을까요?"], watch:"머리로만 기억하려다 잊는 아이 — 적어 두게 할 것", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"받아올림 덧셈 ①", scenario:{icon:"🧮", body:"올린 1을 작게 적으며 풀어 봐요."}, question:"257 + 416은 얼마일까요?", input:"count_input", answer:673, note:"풀이: 일 7 + 6 = 13 → 3 쓰고 1 올림, 십 5 + 1 = 6에 1 더해 7, 백 2 + 4 = 6 → **673**"}, suggested_extras:["e_l3_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"받아올림 덧셈 ②", scenario:{icon:"🧮", body:"0이 있는 자리도 그대로 하면 돼요."}, question:"608 + 173은 얼마일까요?", input:"count_input", answer:781, note:"풀이: 일 8 + 3 = 11 → 1 쓰고 1 올림, 십 0 + 7 = 7에 1 더해 8, 백 6 + 1 = 7 → **781**"}, suggested_extras:["q_l3_zero"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"받아올림 덧셈 ③", scenario:{icon:"🧮", body:"이번엔 십의 자리에서 넘쳐요."}, question:"440 + 365는 얼마일까요?", input:"count_input", answer:805, note:"풀이: 일 0 + 5 = 5, 십 4 + 6 = 10 → 0 쓰고 1 올림, 백 4 + 3 = 7에 1 더해 8 → **805**"}, suggested_extras:["t_l3_mark"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 풀어요", levels:{"기본":{q:"327 + 215는 얼마일까요?", a:"542", steps:["일 7 + 5 = 12 → 2 쓰고 1 올림","십 2 + 1 = 3에 1 더해 4","백 3 + 2 = 5 → 542"]},"도전":{q:"도서관에 책이 245권 있었어요. 새 책 138권이 들어왔어요. 도서관의 책은 모두 몇 권일까요?", a:"383권", steps:["'모두'이므로 덧셈 → 245 + 138","일 5 + 8 = 13 → 3 쓰고 1 올림","십 4 + 3 = 7에 1 더해 8, 백 2 + 1 = 3 → 383권"]},"심화":{q:"412 + 285를 계산하기 전에 어림해 보고, 계산한 뒤 두 값을 견주어 말해 봐요.", a:"여러 답 (어림 약 700, 계산 697 — 비슷하다)", open:true}}}, suggested_extras:["q_l3_est","g_l3_race"], tnote:{ask:["어림값과 계산값이 얼마나 차이 나나요?","차이가 크다면 무엇을 다시 볼까요?"], watch:"어림을 대충 하고 넘어가는 경우 — 근처 몇백몇십으로 바꾸게 할 것", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"십 모형 열 개를 백 모형으로", type:"pair", goal:"수 모형으로 10개 묶어 윗자리로 바꾸는 장면을 손으로 겪기", steps:["짝과 세 자리 수 두 개를 만들어 모형으로 놓는다","자리별로 모아 센다","한 자리에 10개가 넘으면 열 개를 묶어 윗자리 모형 한 개로 바꾼다","바꾼 횟수를 세로셈 위에 작게 적는다"], materials:["수 모형 한 벌","모눈 공책"], minutes:7}, suggested_extras:["e_l3_model","t_l3_ten"], tnote:{ask:["열 개를 묶으면 무엇 한 개가 되나요?","몇 번 바꾸었나요?"], watch:"열 개를 묶지 않고 그대로 세는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"어림은 어른들도 써요", scenario:{icon:"🛒", body:"장을 볼 때 '2천 원쯤, 3천 원쯤 하니 5천 원쯤 되겠다'고 가늠하지요."}, content:"정확한 답을 내기 전에 **대강 얼마쯤인지** 알아 두면, 답이 엉뚱하게 나왔을 때 바로 알아챌 수 있어요."}, suggested_extras:["r_l3_shop","r_l3_time"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"수직선 위를 걸어요", context:"수직선 위 **234** 자리에 곰이가 서 있어요.", challenge:"여기서 **158만큼** 오른쪽으로 이동하면 어디에 도착할까요? 어림해 보고 계산해 봐요.", note:"풀이: 234 + 158 = **392**. 어림하면 약 390이므로 392는 알맞아요."}, suggested_extras:["q_l3_est"], tnote:{ask:["오른쪽으로 가면 수가 커질까요, 작아질까요?","어림값 근처에 도착했나요?"], watch:"수직선에서 방향과 셈을 연결하지 못하는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"한 자리 합이 10을 넘으면 어떻게 하나요?", a:"10을 윗자리로 올린다(받아올림)"},{q:"234 + 158은?", a:"392"},{q:"계산 전에 대강의 값을 가늠하는 것을?", a:"어림"}], self:["받아올림을 할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["한 자리에 **10이 넘으면** 윗자리로 1을 올린다.","올린 1은 **작게 적어 두고 꼭 더한다**.","계산 전에 **어림**하면 답을 점검할 수 있다.","곰이와 펭이의 게시물 반응은 모두 **392개**였다."], arrows:["어림","받아올림","계산","견주기"]}, suggested_extras:["r_l3_shop"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 받아올림이 왜 필요한지 알게 되었나요?","🔧 과정·기능 — 올린 1을 빠뜨리지 않고 더할 수 있나요?","💛 가치·태도 — 어림으로 답을 점검해 보고 싶은가요?"], prompts:["오늘 가장 조심해야 했던 곳은 어디인가요?"]}, suggested_extras:["e_l3_sheet"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"받아올림이 **여러 번** 있는 덧셈을 해 봐요. 합이 **네 자리 수**가 되기도 한대요!", emoji:"🔢"}, suggested_extras:["c_l3_prep"]}
    ],
    extras: [
      {id:"v_l3_carry", type:"video", icon:"🎥", title:"받아올림 장면 보기", url:"https://www.youtube.com/results?search_query=%EB%B0%9B%EC%95%84%EC%98%AC%EB%A6%BC+%EB%8D%A7%EC%85%88+%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84", description:"열 개를 묶어 윗자리로 바꾸는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"]},
      {id:"q_l3_recall", type:"fun_question", icon:"💡", title:"지난 시간과 무엇이 다를까", content:"지난 시간 문제와 오늘 문제를 견주어 보면 무엇이 달라졌나요?", fit_slides:["review","motivate"]},
      {id:"q_l3_story", type:"fun_question", icon:"💡", title:"반응은 왜 셀까", content:"게시물에 달린 반응을 세면 무엇을 알 수 있을까요? 우리 반 게시판에도 세어 볼까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l3_est", type:"fun_question", icon:"💡", title:"어림은 언제 편할까", content:"장을 볼 때, 시간을 잴 때 — 어림이 편한 자리를 찾아볼까요?", fit_slides:["concept","leveled_problem","advanced_problem"]},
      {id:"q_l3_zero", type:"fun_question", icon:"💡", title:"0이 있는 자리에 올림이 오면", content:"608처럼 십의 자리가 0인데 아래에서 1이 올라오면 그 자리는 얼마가 될까요?", fit_slides:["basic_problem","concept"]},
      {id:"q_l3_why", type:"fun_question", icon:"💡", title:"왜 하필 10일까", content:"왜 아홉 개까지는 그대로 두고 열 개가 되어야 윗자리로 갈까요?", fit_slides:["concept","misconception"]},
      {id:"t_l3_estimate", type:"tip", icon:"🧩", title:"어림은 가까운 몇백몇십으로", content:"234 → 230, 158 → 160처럼 십의 자리까지만 살려 바꾸게 하면 3학년이 다루기 좋습니다.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l3_ten", type:"tip", icon:"🧩", title:"열 개 묶음을 손으로", content:"모형 열 개를 실제로 묶어 바꾸는 동작을 한 번 겪으면 받아올림이 규칙이 아니라 사실이 됩니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l3_mark", type:"tip", icon:"🧩", title:"올린 1은 작게 위에", content:"세로셈 위에 작게 적게 하세요. 머리로만 기억하려는 아이에게 가장 잘 듣는 처방입니다.", fit_slides:["misconception","basic_problem"]},
      {id:"t_l3_stage", type:"tip", icon:"🧩", title:"핵심 장면 한 번 멈추기", content:"4 + 8 = 12가 나온 순간에 멈추고 '이제 어떻게 하지?'를 아이들에게 먼저 묻습니다.", fit_slides:["motivate","concept"]},
      {id:"t_l3_check", type:"tip", icon:"🧩", title:"어림으로 자기 점검", content:"답을 낸 뒤 어림값과 견주는 습관을 들이면 자릿수를 통째로 틀리는 실수가 사라집니다.", fit_slides:["summary","self_assessment"]},
      {id:"r_l3_shop", type:"real_world", icon:"🌍", title:"장바구니 어림", content:"물건을 담으며 '대강 얼마쯤'을 세어 두면 계산대에서 놀라지 않습니다.", fit_slides:["real_world","summary"]},
      {id:"r_l3_time", type:"real_world", icon:"🌍", title:"시간 어림", content:"'걸어서 20분쯤, 기다려서 10분쯤이니 30분쯤 걸리겠다' — 어림은 시간에도 씁니다.", fit_slides:["real_world"]},
      {id:"r_l3_like", type:"real_world", icon:"🌍", title:"누리집 반응 세기", content:"게시물 반응 수를 더해 하루 값을 내는 일은 온라인 마을에서 매일 일어납니다.", fit_slides:["motivate","real_world"]},
      {id:"g_l3_race", type:"game", icon:"🎮", title:"어림 먼저 대결", content:"교사가 식을 보여 주면 계산 전에 어림값을 먼저 외칩니다. 계산 뒤 가장 가까운 사람이 이겨요.", fit_slides:["leveled_problem","game"]},
      {id:"g_l3_hunt", type:"game", icon:"🎮", title:"올림 찾기", content:"칠판의 여러 식 중 받아올림이 필요한 식만 골라 손을 듭니다.", fit_slides:["basic_problem","game"]},
      {id:"x_l3_forget", type:"misconception", icon:"⚠️", title:"올린 1 빠뜨리기", content:"이 차시 최다 오답입니다. 234 + 158을 382로 답하면 바로 이 실수예요.", fit_slides:["misconception","concept","basic_problem"]},
      {id:"x_l3_two", type:"misconception", icon:"⚠️", title:"한 칸에 두 숫자 쓰기", content:"12를 한 칸에 써 버리는 실수. 칸이 그어진 종이를 쓰면 아이 스스로 이상함을 느낍니다.", fit_slides:["misconception","basic_problem"]},
      {id:"e_l3_model", type:"example", icon:"📝", title:"묶음 고무줄", content:"일 모형 열 개를 고무줄로 묶어 십 모형과 바꾸는 자리를 만들어 두면 활동이 매끄럽습니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l3_sheet", type:"example", icon:"📝", title:"올림 칸이 있는 학습지", content:"세로셈 위에 작은 올림 칸이 그어진 학습지를 쓰면 적는 습관이 저절로 붙습니다.", fit_slides:["basic_problem","self_assessment","concept"]},
      {id:"b_l3_book", type:"book", icon:"📚", title:"수 이야기 그림책", content:"수를 묶고 바꾸는 이야기를 담은 그림책을 도입에 한 장면 읽어 주면 좋습니다.", fit_slides:["motivate"]},
      {id:"c_l3_prep", type:"checklist", icon:"✅", title:"다음 차시 준비", content:"수 모형·모눈 공책 그대로. 다음 차시에는 백 모형을 천 자리로 바꿀 자리도 필요합니다.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l04 — 덧셈을 해 볼까요 (3) ══════════════════ */
  window.LESSONS["u1_l04"] = {
    meta: { grade:3, subject:"수학", unit:1, n:4, title:"덧셈을 해 볼까요? (3)", std:"[4수01-01]", duration_min:40,
      lesson_format:"교사주도 — 받아올림이 여러 번 있는 덧셈 · 네 자리 합 · 40분 표준 v2(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_04_덧셈을_해_볼까요_3.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"덧셈을 해 볼까요? (3)\n올림이 두 번 세 번", emoji:"🔢"}, suggested_extras:["v_l4_multi"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"한 자리에 **10이 넘으면** 윗자리로 1을 올리고, 올린 1은 **작게 적어 꼭 더한다**고 했어요.", items:[{q:"한 자리 합이 10을 넘으면 어떻게 하나요?", a:"10을 윗자리로 올린다(받아올림)"},{q:"234 + 158은?", a:"392"},{q:"계산 전에 대강의 값을 가늠하는 것을?", a:"어림"}], from:"u1_l03"}, suggested_extras:["q_l4_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"은비의 점수는 모두 몇 점일까요", kids:[{face:"🐻", label:"곰이\n\"347점을 얻었대\""},{face:"🐧", label:"펭이\n\"285점도 더 받았어\""}], question:"온라인 마을 활동에서 은비가 **347점**과 **285점**을 얻었어요. 은비의 점수는 모두 몇 점일까요?", img:"assets/photo/math/online_score.jpg"}, suggested_extras:["q_l4_story","t_l4_stage"], tnote:{ask:["일의 자리부터 하면 7 + 5는 몇인가요?","십의 자리에서도 10이 넘으면 어떻게 될까요?"], watch:"한 번 올리고 나서 두 번째 올림을 예상하지 못하는 경우", min:4}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 어림해 볼까요", content:"**347**은 약 **350**, **285**는 약 **280**.\n그래서 합은 **약 630**쯤 될 거예요.", note:"👉 올림이 많아도 어림으로 미리 가늠할 수 있어요."}, suggested_extras:["t_l4_estimate"], tnote:{ask:["347을 어느 수로 바꾸면 셈이 쉬울까요?","합이 몇백쯤 될 것 같나요?"], watch:"어림에서 백의 자리만 보고 300 + 200 = 500이라 답하는 경우", min:3}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"일의 자리에서 받아올림 ①", content:"일의 자리: **7 + 5 = 12**.\n10개를 십 모형 1개로 바꾸고, 일의 자리엔 **2**가 남아요.", note:"👉 여기까지는 지난 시간과 똑같아요."}, suggested_extras:["e_l4_model"], tnote:{ask:["일의 자리에 남는 숫자는 무엇인가요?","올린 1은 어디에 적을까요?"], watch:"올림을 적지 않고 넘어가는 경우", min:3}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"십의 자리에서 또 받아올림 ②", content:"십의 자리: **4 + 8 = 12**, 올라온 **1**을 더해 **13**.\n10개를 백 모형 1개로 바꾸고, 십의 자리엔 **3**이 남아요.\n백의 자리: **3 + 2 = 5**, 올라온 **1**을 더해 **6** → **632**!\n어림은 **630**, 계산은 **632** — 비슷하니 잘 계산했어요.", note:"👉 올림은 **한 번만 일어나는 게 아니에요**. 자리마다 살펴야 해요."}, suggested_extras:["e_l4_sheet","x_l4_second"], tnote:{ask:["십의 자리에서도 왜 올림이 생겼나요?","올린 표시를 몇 개 적었나요?"], watch:"두 번째 올림을 빠뜨려 532로 답하는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"받아올림은 **한 번만** 있다고 생각해 십의 자리에서 올라온 1을 백의 자리에 더하지 않는다.", right:"자리마다 10이 넘으면 **몇 번이든** 올려요. 백의 자리에서 올라가면 **네 자리 수**가 되기도 해요.", hint:"올림 표시를 자리마다 적게 하고, 답을 낸 뒤 표시 개수만큼 더했는지 되짚게 하세요."}, suggested_extras:["x_l4_second","t_l4_mark"], tnote:{ask:["올림 표시는 모두 몇 개인가요?","표시한 만큼 다 더했나요?"], watch:"두 번째·세 번째 올림 누락 — 이 차시 최다 오답", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"올림 여러 번 ①", scenario:{icon:"🧮", body:"올림 표시를 자리마다 적으며 풀어요."}, question:"158 + 365는 얼마일까요?", input:"count_input", answer:523, note:"풀이: 일 8 + 5 = 13 → 3 쓰고 1 올림, 십 5 + 6 = 11에 1 더해 12 → 2 쓰고 1 올림, 백 1 + 3 = 4에 1 더해 5 → **523**"}, suggested_extras:["e_l4_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"올림 여러 번 ②", scenario:{icon:"🧮", body:"백의 자리 합도 잘 살펴봐요."}, question:"216 + 495는 얼마일까요?", input:"count_input", answer:711, note:"풀이: 일 6 + 5 = 11 → 1 쓰고 1 올림, 십 1 + 9 = 10에 1 더해 11 → 1 쓰고 1 올림, 백 2 + 4 = 6에 1 더해 7 → **711**"}, suggested_extras:["t_l4_mark"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"합이 네 자리가 되어요", scenario:{icon:"🧮", body:"백의 자리에서도 넘치면 어떻게 될까요?"}, question:"823 + 679는 얼마일까요?", input:"count_input", answer:1502, note:"풀이: 일 3 + 9 = 12 → 2 쓰고 1 올림, 십 2 + 7 = 9에 1 더해 10 → 0 쓰고 1 올림, 백 8 + 6 = 14에 1 더해 15 → **1502**(네 자리 수)"}, suggested_extras:["q_l4_four","x_l4_four"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 풀어요", levels:{"기본":{q:"437 + 586은 얼마일까요?", a:"1023", steps:["일 7 + 6 = 13 → 3 쓰고 1 올림","십 3 + 8 = 11에 1 더해 12 → 2 쓰고 1 올림","백 4 + 5 = 9에 1 더해 10 → 1023"]},"도전":{q:"빵집에서 빵을 오전에 268개, 오후에 475개 팔았어요. 하루 동안 판 빵은 모두 몇 개일까요?", a:"743개", steps:["'모두'이므로 덧셈 → 268 + 475","일 8 + 5 = 13 → 3 쓰고 1 올림","십 6 + 7 = 13에 1 더해 14 → 4 쓰고 1 올림, 백 2 + 4 = 6에 1 더해 7 → 743개"]},"심화":{q:"506 + 288을 어림하면 약 얼마일까요? 어림한 뒤 계산해 견주어 말해 봐요.", a:"여러 답 (어림 약 800, 계산 794 — 비슷하다)", open:true}}}, suggested_extras:["q_l4_est","g_l4_race"], tnote:{ask:["어림값과 계산값의 차이는 얼마인가요?","차이가 크면 무엇을 다시 볼까요?"], watch:"네 자리 답이 나오면 잘못한 줄 알고 지우는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"틀린 곳 찾기 짝 활동", type:"pair", goal:"잘못 계산한 세로셈에서 어느 자리가 틀렸는지 찾아 고치기", steps:["교사가 나눠 준 세로셈 네 개를 살핀다","짝과 함께 올림 표시부터 확인한다","틀린 자리를 동그라미 치고 바르게 고쳐 쓴다","왜 틀렸는지 한 줄로 적는다"], materials:["오답 학습지","빨간 색연필"], minutes:7}, suggested_extras:["e_l4_wrong","t_l4_mark"], tnote:{ask:["어느 자리부터 확인하면 빠를까요?","왜 틀렸는지 말로 설명해 볼까요?"], watch:"답만 고치고 까닭을 못 말하는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"하루 판매량을 세는 일", scenario:{icon:"🥐", body:"가게에서는 오전·오후 판매량을 더해 하루 값을 냅니다."}, content:"수가 커지면 합이 **네 자리**가 되기도 해요. 자리가 하나 늘어난 것뿐, 방법은 똑같아요."}, suggested_extras:["r_l4_shop","r_l4_stadium"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"어디가 틀렸을까요", context:"펭이가 **539 + 265**를 계산하고 **794**라고 답했어요.", challenge:"어디에서 잘못했을까요? 바른 답을 구하고, 잘못한 곳을 말해 봐요.", note:"풀이: 일 9 + 5 = 14 → 4 쓰고 1 올림, 십 3 + 6 = 9에 1 더해 10 → 0 쓰고 1 올림, 백 5 + 2 = 7에 1 더해 8 → **804**. 펭이는 십의 자리에서 올라온 1을 백의 자리에 더하지 않았어요."}, suggested_extras:["x_l4_second"], tnote:{ask:["794와 804는 어느 자리가 다른가요?","무엇을 빠뜨린 걸까요?"], watch:"답만 고치고 원인을 못 짚는 경우 — 자리를 손가락으로 짚게 할 것", min:5}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"받아올림은 한 번만 있나요?", a:"아니요. 자리마다 몇 번이든 있을 수 있어요"},{q:"347 + 285는?", a:"632"},{q:"823 + 679는?", a:"1502"}], self:["올림이 여러 번 있어도 할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["올림은 **자리마다** 생길 수 있다.","올린 1은 자리마다 **표시하고 모두 더한다**.","백의 자리에서 올라가면 합이 **네 자리 수**가 된다.","어림으로 견주면 크게 틀린 답을 걸러낼 수 있다."], arrows:["어림","자리마다 올림","계산","견주기"]}, suggested_extras:["r_l4_shop"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 올림이 여러 번 생기는 까닭을 알게 되었나요?","🔧 과정·기능 — 올림 표시를 빠뜨리지 않고 더할 수 있나요?","💛 가치·태도 — 틀린 곳을 찾아 고치는 일이 재미있었나요?"], prompts:["오늘 내가 가장 자주 빠뜨린 곳은 어디였나요?"]}, suggested_extras:["e_l4_wrong"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"이제 **뺄셈**을 시작해요! 먼저 각 자리끼리 그대로 뺄 수 있는 뺄셈부터 해 봐요.", emoji:"➖"}, suggested_extras:["c_l4_prep"]}
    ],
    extras: [
      {id:"v_l4_multi", type:"video", icon:"🎥", title:"올림이 여러 번인 덧셈", url:"https://www.youtube.com/results?search_query=%EB%B0%9B%EC%95%84%EC%98%AC%EB%A6%BC+%EB%91%90+%EB%B2%88+%EB%8D%A7%EC%85%88+3%ED%95%99%EB%85%84", description:"올림이 두 번 이상 일어나는 계산 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"]},
      {id:"q_l4_recall", type:"fun_question", icon:"💡", title:"지난 시간과 무엇이 다를까", content:"지난 시간 문제와 오늘 문제는 무엇이 달라졌나요? 올림이 몇 번 생기나요?", fit_slides:["review","motivate"]},
      {id:"q_l4_story", type:"fun_question", icon:"💡", title:"점수를 모으는 재미", content:"우리 반에서 점수를 모은다면 무엇으로 모을까요? 두 번 얻은 점수를 어떻게 합칠까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l4_four", type:"fun_question", icon:"💡", title:"세 자리끼리 더했는데 네 자리", content:"세 자리 수 둘을 더했는데 왜 네 자리가 될까요? 가장 큰 세 자리 수 둘을 더하면 얼마쯤 될까요?", fit_slides:["basic_problem","concept"]},
      {id:"q_l4_est", type:"fun_question", icon:"💡", title:"어림이 크게 빗나갈 때", content:"어림값과 계산값이 백 넘게 차이 나면 무엇을 의심해 봐야 할까요?", fit_slides:["leveled_problem","summary"]},
      {id:"q_l4_find", type:"fun_question", icon:"💡", title:"틀린 곳 먼저 찾기", content:"친구의 계산을 볼 때 어느 자리부터 확인하면 빠를까요?", fit_slides:["advanced_problem","offline_activity"]},
      {id:"t_l4_estimate", type:"tip", icon:"🧩", title:"어림은 십의 자리까지", content:"백의 자리만 보고 어림하면 어긋남이 커집니다. 가까운 몇백몇십으로 바꾸게 하세요.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l4_mark", type:"tip", icon:"🧩", title:"올림 표시 개수 세기", content:"답을 낸 뒤 '표시 몇 개 했지? 다 더했나?'를 되짚게 하면 두 번째 올림 누락이 크게 줄어듭니다.", fit_slides:["misconception","basic_problem","offline_activity"]},
      {id:"t_l4_stage", type:"tip", icon:"🧩", title:"두 번째 올림에서 멈추기", content:"십의 자리에서 다시 10이 넘는 순간에 멈추고 아이들에게 먼저 묻습니다. 여기가 이 차시의 고비입니다.", fit_slides:["motivate","concept"]},
      {id:"t_l4_four", type:"tip", icon:"🧩", title:"네 자리 답을 겁내지 않게", content:"답이 네 자리로 나오면 틀린 줄 알고 지우는 아이가 있습니다. '자리가 하나 늘어난 것뿐'이라고 미리 말해 두세요.", fit_slides:["basic_problem","misconception"]},
      {id:"t_l4_pair", type:"tip", icon:"🧩", title:"오답을 교재로", content:"학생들이 실제로 낸 오답을 모아 다음 시간 학습지로 쓰면 참여도가 확 올라갑니다.", fit_slides:["offline_activity","advanced_problem"]},
      {id:"r_l4_shop", type:"real_world", icon:"🌍", title:"가게의 하루 판매량", content:"오전·오후 판매량을 더하다 보면 네 자리 수가 자주 나옵니다.", fit_slides:["real_world","summary"]},
      {id:"r_l4_stadium", type:"real_world", icon:"🌍", title:"경기장 관중 수", content:"구역별 관중 수를 더해 전체를 냅니다. 자리가 늘어도 방법은 같아요.", fit_slides:["real_world"]},
      {id:"r_l4_donate", type:"real_world", icon:"🌍", title:"모금함 세기", content:"학급별로 모은 수를 더해 학교 전체 값을 냅니다.", fit_slides:["real_world","offline_activity"]},
      {id:"g_l4_race", type:"game", icon:"🎮", title:"올림 몇 번일까", content:"교사가 식을 보여 주면 계산 전에 '올림 몇 번!'을 손가락으로 표시합니다. 계산 뒤 맞혀 봐요.", fit_slides:["leveled_problem","game"]},
      {id:"g_l4_big", type:"game", icon:"🎮", title:"가장 큰 합 만들기", content:"숫자 카드 여섯 장으로 세 자리 수 둘을 만들어 합이 가장 큰 쪽이 이깁니다.", fit_slides:["game","leveled_problem"]},
      {id:"x_l4_second", type:"misconception", icon:"⚠️", title:"두 번째 올림 누락", content:"이 차시 최다 오답입니다. 539 + 265를 794로 답하면 바로 이 실수예요.", fit_slides:["misconception","advanced_problem","concept"]},
      {id:"x_l4_four", type:"misconception", icon:"⚠️", title:"네 자리 답을 지우기", content:"1502 같은 답을 보고 '세 자리끼리 더했는데 네 자리일 리 없다'며 고치는 실수입니다.", fit_slides:["basic_problem","misconception"]},
      {id:"e_l4_model", type:"example", icon:"📝", title:"두 번 바꾸는 자리", content:"일→십, 십→백 두 번 바꾸는 자리를 책상 위에 따로 만들어 두면 동작이 분명해집니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l4_sheet", type:"example", icon:"📝", title:"올림 칸 두 개짜리 학습지", content:"올림 칸을 두 자리 모두 그어 둔 학습지를 쓰면 빠뜨림이 줄어듭니다.", fit_slides:["basic_problem","concept"]},
      {id:"e_l4_wrong", type:"example", icon:"📝", title:"오답 네 문제 학습지", content:"자리 어긋남·올림 누락·네 자리 지움 등 유형별로 한 문제씩 담아 나눠 주세요.", fit_slides:["offline_activity","self_assessment","advanced_problem"]},
      {id:"c_l4_prep", type:"checklist", icon:"✅", title:"다음 차시 준비", content:"수 모형은 이제 '덜어 내는' 자리로 씁니다. 모둠별로 충분한 개수가 있는지 확인해 두세요.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l05 — 뺄셈을 해 볼까요 (1) ══════════════════ */
  window.LESSONS["u1_l05"] = {
    meta: { grade:3, subject:"수학", unit:1, n:5, title:"뺄셈을 해 볼까요? (1)", std:"[4수01-01]", duration_min:40,
      lesson_format:"교사주도 — 각 자리끼리 그대로 빼는 세 자리 수 뺄셈 · 40분 표준 v2(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_05_뺄셈을_해_볼까요_1.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"뺄셈을 해 볼까요? (1)\n각 자리끼리 빼요", emoji:"➖"}, suggested_extras:["v_l5_sub"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"올림은 **자리마다** 생길 수 있고, 백의 자리에서 올라가면 합이 **네 자리 수**가 된다고 했어요.", items:[{q:"받아올림은 한 번만 있나요?", a:"아니요. 자리마다 몇 번이든 있을 수 있어요"},{q:"347 + 285는?", a:"632"},{q:"823 + 679는?", a:"1502"}], from:"u1_l04"}, suggested_extras:["q_l5_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"이름을 안 바꾼 아바타는 몇 명일까요", kids:[{face:"🐻", label:"곰이\n\"아바타가 327명!\""},{face:"🐧", label:"펭이\n\"214명이 이름을 바꿨대\""}], question:"온라인 마을의 아바타 **327명** 중 **214명**이 이름을 바꿨어요. 이름을 바꾸지 않은 아바타는 몇 명일까요?", img:"assets/photo/math/online_avatar.jpg"}, suggested_extras:["q_l5_story","t_l5_word"], tnote:{ask:["'바꾸지 않은'은 더하기일까요, 빼기일까요?","전체는 얼마이고, 덜어 낼 것은 얼마인가요?"], watch:"두 수를 보자마자 더하는 경우", min:4}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 식을 세우고 모형을 놓아요", content:"전체 **327명**에서 이름 바꾼 **214명**을 덜어 내요.\n식: **327 − 214**\n327을 백 3·십 2·일 7로 놓고, 여기에서 214만큼 덜어 낼 거예요.", note:"👉 뺄셈에서는 **큰 수(전체)를 위에** 씁니다."}, suggested_extras:["e_l5_model","x_l5_order"], tnote:{ask:["어느 수가 전체인가요?","전체를 위에 쓰는 까닭은 무엇일까요?"], watch:"작은 수를 위에 쓰고 순서를 바꿔 빼려는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"일의 자리부터 빼요", content:"일 모형 **7개**에서 **4개**를 덜어 내면 **3개**가 남아요.\n일의 자리: **7 − 4 = 3**", note:"👉 뺄셈도 **일의 자리부터** 시작해요."}, suggested_extras:["t_l5_order"], tnote:{ask:["일 모형은 몇 개가 남았나요?","왜 일의 자리부터 할까요?"], watch:"백의 자리부터 빼려는 아이 — 다음 차시를 위해 차례를 굳혀 둘 것", min:3}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"십의 자리, 백의 자리도 빼요", content:"십의 자리: **2 − 1 = 1**, 백의 자리: **3 − 2 = 1**.\n그래서 **327 − 214 = 113**!", items:[{emoji:"🟩", count:3, label:"**일**의 자리\n7 − 4 = 3"},{emoji:"🟦", count:1, label:"**십**의 자리\n2 − 1 = 1"},{emoji:"🟪", count:1, label:"**백**의 자리\n3 − 2 = 1"}], note:"👉 각 자리의 수끼리 빼면 돼요."}, suggested_extras:["e_l5_sheet"], tnote:{ask:["답 113을 자리별로 읽어 볼까요?","덧셈과 무엇이 같고 무엇이 다른가요?"], watch:"자리를 어긋나게 써서 답이 크게 벌어지는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"뺄셈도 덧셈처럼 **순서를 바꿔도 된다**고 생각한다. (327 − 214와 214 − 327이 같다고 여김)", right:"뺄셈은 **덜어 내는 셈**이라 순서를 바꿀 수 없어요. 있던 수(전체)에서 덜어 낼 수를 빼요.", hint:"사탕 7개에서 4개를 먹는 장면과 4개에서 7개를 먹는 장면을 견주어 보여 주세요."}, suggested_extras:["x_l5_order","t_l5_word"], tnote:{ask:["4개에서 7개를 먹을 수 있을까요?","그럼 어느 수를 위에 써야 할까요?"], watch:"'큰 수에서 작은 수를 빼면 된다'만 외우고 상황을 못 읽는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"기본 뺄셈 ①", scenario:{icon:"🧮", body:"자리별로 차근차근 빼 봐요."}, question:"493 − 341은 얼마일까요?", input:"count_input", answer:152, note:"풀이: 일 3 − 1 = 2, 십 9 − 4 = 5, 백 4 − 3 = 1 → **152**"}, suggested_extras:["e_l5_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"기본 뺄셈 ②", scenario:{icon:"🧮", body:"수가 커도 방법은 같아요."}, question:"957 − 723은 얼마일까요?", input:"count_input", answer:234, note:"풀이: 일 7 − 3 = 4, 십 5 − 2 = 3, 백 9 − 7 = 2 → **234**"}, suggested_extras:["e_l5_sheet"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"기본 뺄셈 ③", scenario:{icon:"🧮", body:"한 번 더 해 봐요."}, question:"579 − 263은 얼마일까요?", input:"count_input", answer:316, note:"풀이: 일 9 − 3 = 6, 십 7 − 6 = 1, 백 5 − 2 = 3 → **316**"}, suggested_extras:["t_l5_check"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 풀어요", levels:{"기본":{q:"688 − 475는 얼마일까요?", a:"213", steps:["일 8 − 5 = 3","십 8 − 7 = 1","백 6 − 4 = 2 → 213"]},"도전":{q:"줄넘기를 도윤이는 259회, 지유는 132회 했어요. 도윤이는 지유보다 몇 회 더 했을까요?", a:"127회", steps:["'몇 회 더'는 차이를 묻는 말 → 뺄셈","259 − 132","일 9 − 2 = 7, 십 5 − 3 = 2, 백 2 − 1 = 1 → 127회"]},"심화":{q:"각 자리끼리 그대로 빼지는 세 자리 수 뺄셈 문제를 만들어 짝에게 내 봐요. 어떤 조건을 지켜야 할까요?", a:"여러 답 (위의 각 자리 숫자가 아래보다 크거나 같도록 두 수를 고른다)", open:true}}}, suggested_extras:["q_l5_make","g_l5_race"], tnote:{ask:["'몇 회 더'는 어떤 셈일까요?","문제를 만들 때 무엇을 살펴야 할까요?"], watch:"심화에서 조건을 못 찾고 아무 수나 고르는 경우 — 한 자리씩 견주게 할 것", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"덜어 내며 세어 보기", type:"pair", goal:"수 모형으로 덜어 내는 장면을 겪고 세로셈으로 옮겨 적기", steps:["짝과 세 자리 수 하나를 정해 모형으로 놓는다","덜어 낼 수를 정해 자리별로 걷어 낸다","남은 모형을 자리별로 센다","공책에 세로셈으로 옮겨 적고 답이 같은지 확인한다"], materials:["수 모형 한 벌","모눈 공책"], minutes:7}, suggested_extras:["e_l5_model","t_l5_check"], tnote:{ask:["남은 모형은 자리별로 몇 개인가요?","세로셈 답과 같나요?"], watch:"덜어 낸 모형을 다시 섞어 세는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"남은 것을 세는 일", scenario:{icon:"📦", body:"창고에 있던 물건에서 나간 물건을 빼면 남은 개수가 나옵니다."}, content:"'있던 것 − 나간 것 = 남은 것'. 가게·도서관·급식실 모두 이 셈으로 하루를 마감해요."}, suggested_extras:["r_l5_store","r_l5_library"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"색종이 문제를 풀어요", context:"곰이네 반에 색종이가 **384장** 있었어요.", challenge:"그중 **153장**을 사용했어요. 남은 색종이는 몇 장일까요? 식을 세우고 답을 구해 봐요.", note:"풀이: 있던 수에서 쓴 수를 덜어 내요 → 384 − 153 = **231장**"}, suggested_extras:["q_l5_story"], tnote:{ask:["무엇이 전체이고 무엇을 덜어 내나요?","답이 384보다 작아야 할까요, 커야 할까요?"], watch:"답이 원래 수보다 커졌는데도 넘어가는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"뺄셈에서 위에 쓰는 수는?", a:"있던 수(전체)"},{q:"327 − 214는?", a:"113"},{q:"957 − 723은?", a:"234"}], self:["각 자리끼리 뺄 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["뺄셈도 **일 → 십 → 백** 차례로 뺀다.","**있던 수(전체)를 위에** 쓴다.","뺄셈은 **순서를 바꿀 수 없다**.","곰이와 펭이는 이름을 안 바꾼 아바타가 **113명**임을 알아냈다."], arrows:["식 세우기","자리별 빼기","세로셈"]}, suggested_extras:["r_l5_store"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 뺄셈이 덜어 내는 셈이라는 것을 알게 되었나요?","🔧 과정·기능 — 자리를 맞추어 바르게 뺄 수 있나요?","💛 가치·태도 — 답이 알맞은지 스스로 살펴보았나요?"], prompts:["오늘 셈에서 가장 조심해야 할 곳은 어디였나요?"]}, suggested_extras:["e_l5_sheet"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"윗자리 수가 아랫자리 수보다 **작아서 뺄 수 없을 때**는 어떻게 할까요? 윗자리에서 빌려 오는 **받아내림**을 배워요.", emoji:"🔻"}, suggested_extras:["c_l5_prep"]}
    ],
    extras: [
      {id:"v_l5_sub", type:"video", icon:"🎥", title:"수 모형으로 보는 세 자리 뺄셈", url:"https://www.youtube.com/results?search_query=%EC%84%B8+%EC%9E%90%EB%A6%AC+%EC%88%98+%EB%BA%84%EC%85%88+%EC%88%98+%EB%AA%A8%ED%98%95", description:"자리별로 덜어 내는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"]},
      {id:"q_l5_recall", type:"fun_question", icon:"💡", title:"덧셈과 뺄셈의 닮은 점", content:"덧셈에서 지켰던 약속 중 뺄셈에도 그대로 쓰이는 것은 무엇일까요?", fit_slides:["review","concept"]},
      {id:"q_l5_story", type:"fun_question", icon:"💡", title:"문장 속 뺄셈 신호", content:"'남은', '더 많은', '~하지 않은' — 이런 말이 나오면 어떤 셈을 하게 될까요?", fit_slides:["motivate","advanced_problem"]},
      {id:"q_l5_make", type:"fun_question", icon:"💡", title:"조건이 있는 문제 만들기", content:"각 자리에서 그대로 빼지려면 두 수를 어떻게 골라야 할까요?", fit_slides:["leveled_problem"]},
      {id:"q_l5_diff", type:"fun_question", icon:"💡", title:"'차이'라는 말", content:"두 수의 차이를 구한다는 말은 무슨 뜻일까요? 어느 쪽에서 어느 쪽을 뺄까요?", fit_slides:["leveled_problem","real_world"]},
      {id:"q_l5_size", type:"fun_question", icon:"💡", title:"답의 크기 가늠하기", content:"뺄셈의 답은 원래 수보다 커질 수 있을까요? 왜 그럴까요?", fit_slides:["advanced_problem","self_assessment"]},
      {id:"t_l5_order", type:"tip", icon:"🧩", title:"일의 자리부터의 습관", content:"지금은 어느 자리부터 해도 답이 같지만 다음 차시부터는 차례가 답을 가릅니다. 여기서 굳혀 두세요.", fit_slides:["concept","misconception"]},
      {id:"t_l5_word", type:"tip", icon:"🧩", title:"'덜어 낸다'는 말로 시작", content:"'뺀다'보다 '덜어 낸다'가 3학년에게 장면이 그려집니다. 모형을 실제로 걷어 내며 말해 주세요.", fit_slides:["concept","misconception","motivate"]},
      {id:"t_l5_check", type:"tip", icon:"🧩", title:"답이 원래 수보다 작은가", content:"뺄셈 답을 낸 뒤 '원래 수보다 작아졌나?'를 묻게 하면 큰 실수를 스스로 걸러냅니다.", fit_slides:["basic_problem","offline_activity"]},
      {id:"t_l5_grid", type:"tip", icon:"🧩", title:"칸 있는 종이 이어 쓰기", content:"덧셈에서 쓰던 세로셈 칸 학습지를 뺄셈에도 그대로 씁니다.", fit_slides:["basic_problem","concept"]},
      {id:"t_l5_pair", type:"tip", icon:"🧩", title:"모형과 세로셈 잇기", content:"모형으로만 끝내지 말고 반드시 공책에 옮겨 적게 하세요. 다음 차시 받아내림의 바탕이 됩니다.", fit_slides:["offline_activity","concept"]},
      {id:"r_l5_store", type:"real_world", icon:"🌍", title:"창고의 남은 개수", content:"있던 것에서 나간 것을 빼 남은 개수를 냅니다. 가게가 매일 하는 셈이에요.", fit_slides:["real_world","summary"]},
      {id:"r_l5_library", type:"real_world", icon:"🌍", title:"도서관의 남은 책", content:"전체 권수에서 빌려 간 권수를 빼면 서가에 남은 책 수가 나옵니다.", fit_slides:["real_world"]},
      {id:"r_l5_sports", type:"real_world", icon:"🌍", title:"기록 차이 견주기", content:"두 사람의 줄넘기 횟수 차이를 구하는 것도 뺄셈입니다.", fit_slides:["leveled_problem","real_world"]},
      {id:"g_l5_race", type:"game", icon:"🎮", title:"차이 맞히기", content:"교사가 두 수를 부르면 차이를 먼저 외치는 사람이 점수를 얻습니다.", fit_slides:["leveled_problem","game"]},
      {id:"g_l5_small", type:"game", icon:"🎮", title:"가장 작은 차 만들기", content:"숫자 카드로 세 자리 수 둘을 만들어 차가 가장 작은 쪽이 이깁니다.", fit_slides:["game","basic_problem"]},
      {id:"x_l5_order", type:"misconception", icon:"⚠️", title:"순서를 바꿔 빼기", content:"일의 자리에서 뺄 수 없을 때 위아래를 바꿔 빼는 실수의 씨앗입니다. 이번 차시에 순서를 못 박아 두세요.", fit_slides:["misconception","concept"]},
      {id:"x_l5_add", type:"misconception", icon:"⚠️", title:"문장만 보고 더하기", content:"두 수가 보이면 무조건 더하는 습관입니다. 문장에서 전체를 먼저 찾게 하세요.", fit_slides:["motivate","advanced_problem"]},
      {id:"e_l5_model", type:"example", icon:"📝", title:"덜어 내는 접시", content:"덜어 낸 모형을 담을 접시를 따로 두면 남은 것과 나간 것이 섞이지 않습니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l5_sheet", type:"example", icon:"📝", title:"뺄셈 세로셈 학습지", content:"덧셈에서 쓰던 칸 학습지를 뺄셈 칸으로 바꿔 나눠 주세요.", fit_slides:["basic_problem","concept","self_assessment"]},
      {id:"e_l5_story", type:"example", icon:"📝", title:"전체·부분 세 줄 틀", content:"'전체는 / 덜어 낼 것은 / 식은' 세 줄로 적게 하면 문장제 실수가 줄어듭니다.", fit_slides:["advanced_problem"]},
      {id:"c_l5_prep", type:"checklist", icon:"✅", title:"다음 차시 준비", content:"십 모형을 일 모형 열 개로 바꿀 자리가 필요합니다. 낱개 모형을 넉넉히 준비해 두세요.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l06 — 뺄셈을 해 볼까요 (2) ══════════════════ */
  window.LESSONS["u1_l06"] = {
    meta: { grade:3, subject:"수학", unit:1, n:6, title:"뺄셈을 해 볼까요? (2)", std:"[4수01-01]", duration_min:40,
      lesson_format:"교사주도 — 받아내림이 한 번 있는 뺄셈 · 어림 · 40분 표준 v2(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_06_뺄셈을_해_볼까요_2.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"뺄셈을 해 볼까요? (2)\n못 빼면 윗자리에서 빌려요", emoji:"🔻"}, suggested_extras:["v_l6_borrow"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"뺄셈은 **있던 수를 위에** 쓰고 **일 → 십 → 백** 차례로 빼며, **순서를 바꿀 수 없다**고 했어요.", items:[{q:"뺄셈에서 위에 쓰는 수는?", a:"있던 수(전체)"},{q:"327 − 214는?", a:"113"},{q:"957 − 723은?", a:"234"}], from:"u1_l05"}, suggested_extras:["q_l6_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"남은 댓글은 몇 개일까요", kids:[{face:"🐻", label:"곰이\n\"댓글이 453개였어\""},{face:"🐧", label:"펭이\n\"138개를 지웠대\""}], question:"온라인 마을 게시판의 댓글 **453개** 중에서 예절에 어긋난 댓글 **138개**를 지웠어요. 남은 댓글은 몇 개일까요?", img:"assets/photo/math/online_comment.jpg"}, suggested_extras:["q_l6_story","t_l6_stage"], tnote:{ask:["일의 자리부터 하면 3에서 8을 뺄 수 있나요?","뺄 수 없을 때는 어떻게 하면 좋을까요?"], watch:"뺄 수 없자 위아래를 바꿔 8 − 3 = 5로 답하는 경우 — 이 차시의 핵심 장면", min:4}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 어림해 볼까요", content:"**453**은 약 **450**, **138**은 약 **140**.\n그래서 차는 **약 310**쯤 될 거예요.", note:"👉 뺄셈도 어림으로 미리 가늠할 수 있어요."}, suggested_extras:["t_l6_estimate","q_l6_est"], tnote:{ask:["453을 어느 수로 바꾸면 셈이 쉬울까요?","차가 몇백쯤 될 것 같나요?"], watch:"어림에서 백의 자리만 보고 300이라 답하는 경우", min:3}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"일의 자리에서 받아내림!", content:"일의 자리: **3에서 8을 뺄 수 없어요**.\n**십 모형 1개**를 **일 모형 10개**로 바꿔요. 그러면 **13 − 8 = 5**.\n십의 자리는 **1 줄어 4**가 돼요.", note:"👉 윗자리에서 빌려 오는 것을 **받아내림**이라고 해요."}, suggested_extras:["e_l6_model","t_l6_ten"], tnote:{ask:["십 모형 1개는 일 모형 몇 개일까요?","빌려준 십의 자리는 어떻게 되나요?"], watch:"빌려 오기만 하고 십의 자리를 줄이지 않는 경우", min:5}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"줄어든 십의 자리를 잊지 마세요", content:"십의 자리: 줄어든 **4 − 3 = 1**, 백의 자리: **4 − 1 = 3**.\n그래서 **453 − 138 = 315**!\n어림은 **310**, 계산은 **315** — 비슷하니 잘 계산했어요.", note:"👉 빌려준 자리는 **1 줄여 작게 적어** 두면 잊지 않아요."}, suggested_extras:["e_l6_sheet","x_l6_forget"], tnote:{ask:["십의 자리는 왜 5가 아니라 4가 되었나요?","어림 310과 계산 315를 견주면 어떤가요?"], watch:"줄이지 않고 5 − 3 = 2로 계산해 325로 답하는 경우 — 최다 오답", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"뺄 수 없으면 **위아래를 바꿔 빼거나**, 빌려 오고도 **윗자리를 줄이지 않는다**.", right:"뺄 수 없으면 **윗자리에서 10을 빌려 와요**. 빌려준 자리는 반드시 **1 줄어요**.", hint:"십 모형 한 개를 실제로 낱개 열 개와 바꿔 보여 주면 '줄어드는 까닭'이 눈에 보입니다."}, suggested_extras:["x_l6_swap","x_l6_forget"], tnote:{ask:["3에서 8을 뺄 수 있나요? 그럼 어떻게 할까요?","빌려주고 나면 십의 자리에 몇 개가 남나요?"], watch:"바꿔 빼기와 줄이기 누락 두 가지가 함께 나타나는 아이", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"받아내림 뺄셈 ①", scenario:{icon:"🧮", body:"줄어든 자리를 작게 적으며 풀어요."}, question:"371 − 245는 얼마일까요?", input:"count_input", answer:126, note:"풀이: 일 1에서 5를 못 빼 십에서 빌림 → 11 − 5 = 6, 십 6 − 4 = 2, 백 3 − 2 = 1 → **126**"}, suggested_extras:["e_l6_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"받아내림 뺄셈 ②", scenario:{icon:"🧮", body:"일의 자리가 0일 때도 같아요."}, question:"850 − 431은 얼마일까요?", input:"count_input", answer:419, note:"풀이: 일 0에서 1을 못 빼 십에서 빌림 → 10 − 1 = 9, 십 4 − 3 = 1, 백 8 − 4 = 4 → **419**"}, suggested_extras:["q_l6_zero"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"받아내림 뺄셈 ③", scenario:{icon:"🧮", body:"한 번 더 해 봐요."}, question:"639 − 178은 얼마일까요?", input:"count_input", answer:461, note:"풀이: 일 9 − 8 = 1, 십 3에서 7을 못 빼 백에서 빌림 → 13 − 7 = 6, 백 5 − 1 = 4 → **461**"}, suggested_extras:["t_l6_tens"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 풀어요", levels:{"기본":{q:"582 − 147은 얼마일까요?", a:"435", steps:["일 2에서 7을 못 빼 십에서 빌림 → 12 − 7 = 5","십은 8에서 1 줄어 7, 7 − 4 = 3","백 5 − 1 = 4 → 435"]},"도전":{q:"사탕이 346개 있었어요. 친구들에게 128개를 나눠 주었어요. 남은 사탕은 몇 개일까요?", a:"218개", steps:["'남은'이므로 뺄셈 → 346 − 128","일 6에서 8을 못 빼 십에서 빌림 → 16 − 8 = 8","십은 4에서 1 줄어 3, 3 − 2 = 1, 백 3 − 1 = 2 → 218개"]},"심화":{q:"453 − 138을 어림해 보고 계산한 뒤, 두 값이 왜 조금 다른지 말해 봐요.", a:"여러 답 (어림 310, 계산 315 — 어림에서 수를 조금 바꿔 놓았기 때문)", open:true}}}, suggested_extras:["q_l6_est","g_l6_race"], tnote:{ask:["어림값과 계산값의 차이는 얼마인가요?","왜 차이가 생겼을까요?"], watch:"어림값과 다르면 계산이 틀렸다고 여기는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"십 모형을 낱개 열 개로", type:"pair", goal:"윗자리에서 빌려 오는 장면을 손으로 겪기", steps:["짝과 세 자리 수 하나를 모형으로 놓는다","일의 자리에서 뺄 수 없는 수를 덜어 내 본다","십 모형 한 개를 일 모형 열 개와 바꾼다","바꾼 뒤 남은 모형을 세고 세로셈으로 옮겨 적는다"], materials:["수 모형 한 벌","모눈 공책"], minutes:7}, suggested_extras:["e_l6_model","t_l6_ten"], tnote:{ask:["십 모형 하나가 낱개 몇 개가 되었나요?","십의 자리에는 몇 개가 남았나요?"], watch:"바꾸기만 하고 십의 자리를 그대로 두는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"거스름돈도 받아내림", scenario:{icon:"💰", body:"천 원을 내고 380원짜리를 사면 거스름돈을 계산해야 하지요."}, content:"작은 자리에서 뺄 수 없어 **큰 자리를 헐어 쓰는 일**은 돈을 셀 때도 늘 일어나요."}, suggested_extras:["r_l6_money","r_l6_stock"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"수직선 위를 되돌아가요", context:"수직선 위 **453** 자리에 펭이가 서 있어요.", challenge:"여기서 **138만큼** 왼쪽으로 가면 어디에 도착할까요? 어림해 보고 계산해 봐요.", note:"풀이: 453 − 138 = **315**. 어림하면 약 310이므로 315는 알맞아요."}, suggested_extras:["q_l6_est"], tnote:{ask:["왼쪽으로 가면 수가 커질까요, 작아질까요?","어림값 근처에 도착했나요?"], watch:"방향과 셈을 반대로 연결하는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"뺄 수 없을 때는 어떻게 하나요?", a:"윗자리에서 10을 빌려 온다(받아내림)"},{q:"빌려준 자리는 어떻게 되나요?", a:"1 줄어든다"},{q:"453 − 138은?", a:"315"}], self:["받아내림을 할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["뺄 수 없으면 **윗자리에서 10을 빌려 온다**.","빌려준 자리는 반드시 **1 줄어든다**.","위아래를 **바꿔 빼면 안 된다**.","곰이와 펭이의 게시판에 남은 댓글은 **315개**였다."], arrows:["어림","받아내림","줄이기","계산"]}, suggested_extras:["r_l6_money"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 받아내림이 왜 필요한지 알게 되었나요?","🔧 과정·기능 — 빌려준 자리를 줄이는 것을 잊지 않았나요?","💛 가치·태도 — 예절에 맞는 댓글에 대해 생각해 보았나요?"], prompts:["오늘 가장 조심해야 했던 곳은 어디인가요?"]}, suggested_extras:["e_l6_sheet"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"받아내림이 **여러 번** 있는 뺄셈을 해 봐요. **0이 있는 자리**에서 빌려 올 때는 어떻게 할까요?", emoji:"0️⃣"}, suggested_extras:["c_l6_prep"]}
    ],
    extras: [
      {id:"v_l6_borrow", type:"video", icon:"🎥", title:"받아내림 장면 보기", url:"https://www.youtube.com/results?search_query=%EB%B0%9B%EC%95%84%EB%82%B4%EB%A6%BC+%EB%BA%84%EC%85%88+%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84", description:"십 모형을 낱개 열 개로 바꾸는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"]},
      {id:"q_l6_recall", type:"fun_question", icon:"💡", title:"지난 시간과 무엇이 다를까", content:"지난 시간 뺄셈과 오늘 뺄셈은 무엇이 달라졌나요?", fit_slides:["review","motivate"]},
      {id:"q_l6_story", type:"fun_question", icon:"💡", title:"댓글 예절 생각하기", content:"어떤 댓글이 예절에 어긋날까요? 우리 반 게시판에는 어떤 약속이 필요할까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l6_est", type:"fun_question", icon:"💡", title:"어림과 계산의 차이", content:"어림값과 계산값이 조금 다른 것은 잘못일까요? 왜 차이가 생길까요?", fit_slides:["concept","leveled_problem","advanced_problem"]},
      {id:"q_l6_zero", type:"fun_question", icon:"💡", title:"일의 자리가 0일 때", content:"850처럼 일의 자리가 0인데 빼야 할 때는 어떻게 할까요?", fit_slides:["basic_problem","concept"]},
      {id:"q_l6_why", type:"fun_question", icon:"💡", title:"왜 10만 빌려올까", content:"윗자리에서 왜 하필 10을 빌려 올까요? 5나 20은 안 될까요?", fit_slides:["concept","misconception"]},
      {id:"t_l6_estimate", type:"tip", icon:"🧩", title:"뺄셈 어림도 십의 자리까지", content:"453 → 450, 138 → 140처럼 바꾸게 하면 3학년이 다루기 좋습니다.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l6_ten", type:"tip", icon:"🧩", title:"바꾸는 동작을 실제로", content:"십 모형 하나를 낱개 열 개와 바꾸는 동작을 한 번 겪으면 '줄어드는 까닭'이 사실이 됩니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l6_mark", type:"tip", icon:"🧩", title:"줄인 수를 작게 위에", content:"빌려준 자리 위에 줄어든 수를 작게 적게 하세요. 이 표시 하나가 오답을 크게 줄입니다.", fit_slides:["misconception","basic_problem"]},
      {id:"t_l6_tens", type:"tip", icon:"🧩", title:"십의 자리에서 빌릴 때", content:"일의 자리는 그대로인데 십의 자리에서 빌려야 하는 식도 꼭 섞어 주세요. 유형을 하나만 보면 규칙으로만 외웁니다.", fit_slides:["basic_problem","leveled_problem"]},
      {id:"t_l6_stage", type:"tip", icon:"🧩", title:"핵심 장면에서 멈추기", content:"'3에서 8을 뺄 수 없다'는 순간에 멈추고 아이들에게 먼저 물으세요. 여기가 이 차시의 문턱입니다.", fit_slides:["motivate","concept"]},
      {id:"r_l6_money", type:"real_world", icon:"🌍", title:"거스름돈 계산", content:"큰 돈을 헐어 작은 자리를 채우는 일은 거스름돈을 셀 때 늘 일어납니다.", fit_slides:["real_world","summary"]},
      {id:"r_l6_stock", type:"real_world", icon:"🌍", title:"남은 물건 세기", content:"가게에서 나간 물건을 빼며 남은 개수를 셀 때도 받아내림이 자주 나옵니다.", fit_slides:["real_world"]},
      {id:"r_l6_online", type:"real_world", icon:"🌍", title:"게시판 정리", content:"지운 글을 빼서 남은 글 수를 내는 일은 누리집 관리자가 매일 합니다.", fit_slides:["motivate","real_world"]},
      {id:"g_l6_race", type:"game", icon:"🎮", title:"빌려야 할까 말까", content:"교사가 식을 보여 주면 받아내림이 필요한지 손으로 ○✕를 표시합니다.", fit_slides:["basic_problem","game"]},
      {id:"g_l6_change", type:"game", icon:"🎮", title:"거스름돈 놀이", content:"모형 돈으로 물건을 사고 거스름돈을 세어 주는 놀이. 헐어 쓰는 장면이 자연스럽게 나옵니다.", fit_slides:["real_world","game"]},
      {id:"x_l6_swap", type:"misconception", icon:"⚠️", title:"위아래 바꿔 빼기", content:"3에서 8을 못 빼자 8 − 3 = 5로 답하는 실수. 5차시에서 못 박아 둔 순서를 다시 짚어 주세요.", fit_slides:["misconception","concept"]},
      {id:"x_l6_forget", type:"misconception", icon:"⚠️", title:"빌려주고 줄이지 않기", content:"이 차시 최다 오답입니다. 453 − 138을 325로 답하면 바로 이 실수예요.", fit_slides:["misconception","concept","basic_problem"]},
      {id:"e_l6_model", type:"example", icon:"📝", title:"바꾸는 자리 만들기", content:"책상 한쪽에 '바꾸는 자리'를 두고 십 모형 하나를 낱개 열 개와 맞바꾸게 하세요.", fit_slides:["concept","offline_activity"]},
      {id:"e_l6_sheet", type:"example", icon:"📝", title:"줄임 칸이 있는 학습지", content:"세로셈 위에 줄어든 수를 적는 작은 칸이 그어진 학습지를 씁니다.", fit_slides:["basic_problem","concept","self_assessment"]},
      {id:"e_l6_check", type:"example", icon:"📝", title:"덧셈으로 확인하기", content:"뺀 값에 뺀 수를 다시 더해 원래 수가 나오는지 확인하게 하면 스스로 점검이 됩니다.", fit_slides:["basic_problem","self_assessment"]},
      {id:"c_l6_prep", type:"checklist", icon:"✅", title:"다음 차시 준비", content:"0이 있는 자리에서 연달아 빌려 오는 장면이 나옵니다. 백 모형도 넉넉히 준비해 두세요.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l07 — 뺄셈을 해 볼까요 (3) ══════════════════ */
  window.LESSONS["u1_l07"] = {
    meta: { grade:3, subject:"수학", unit:1, n:7, title:"뺄셈을 해 볼까요? (3)", std:"[4수01-01]", duration_min:40,
      lesson_format:"교사주도 — 받아내림이 여러 번 있는 뺄셈 · 0이 있는 자리 · 40분 표준 v2(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_07_뺄셈을_해_볼까요_3.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"뺄셈을 해 볼까요? (3)\n두 번 빌려도 괜찮아요", emoji:"0️⃣"}, suggested_extras:["v_l7_multi"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"뺄 수 없으면 **윗자리에서 10을 빌려 오고**, 빌려준 자리는 **1 줄어든다**고 했어요.", items:[{q:"뺄 수 없을 때는 어떻게 하나요?", a:"윗자리에서 10을 빌려 온다(받아내림)"},{q:"빌려준 자리는 어떻게 되나요?", a:"1 줄어든다"},{q:"453 − 138은?", a:"315"}], from:"u1_l06"}, suggested_extras:["q_l7_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"O가 X보다 몇 명 더 많을까요", kids:[{face:"🐻", label:"곰이\n\"O를 621명이 골랐어\""},{face:"🐧", label:"펭이\n\"X는 147명이야\""}], question:"온라인 마을 퀴즈에서 **O를 621명**, **X를 147명**이 골랐어요. O를 고른 사람은 X보다 몇 명 더 많을까요?", img:"assets/photo/math/online_quiz.jpg"}, suggested_extras:["q_l7_story","t_l7_stage"], tnote:{ask:["'몇 명 더 많을까'는 어떤 셈일까요?","일의 자리에서 빌려 오고 나면 십의 자리는 어떻게 될까요?"], watch:"한 번 빌리고 나서 또 못 빼는 상황을 예상하지 못하는 경우", min:4}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"먼저 어림해 볼까요", content:"**621**은 약 **620**, **147**은 약 **150**.\n그래서 차는 **약 470**쯤 될 거예요.", note:"👉 빌려 오는 일이 많아도 어림으로 미리 가늠해요."}, suggested_extras:["t_l7_estimate"], tnote:{ask:["621을 어느 수로 바꾸면 셈이 쉬울까요?","차가 몇백쯤 될 것 같나요?"], watch:"어림에서 600 − 100 = 500으로 거칠게 잡는 경우", min:3}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"일의 자리에서 받아내림 ①", content:"일의 자리: **1에서 7을 뺄 수 없어요**.\n십 모형 1개를 일 모형 10개로 바꿔 **11 − 7 = 4**.\n십의 자리는 **2에서 1로** 줄어요.", note:"👉 여기까지는 지난 시간과 똑같아요."}, suggested_extras:["e_l7_model"], tnote:{ask:["일의 자리에 남는 수는 무엇인가요?","십의 자리는 이제 얼마인가요?"], watch:"줄어든 십의 자리를 적지 않고 넘어가는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"십의 자리에서 또 받아내림 ②", content:"십의 자리: **1에서 4를 뺄 수 없어요**.\n백 모형 1개를 십 모형 10개로 바꿔 **11 − 4 = 7**.\n백의 자리는 **6에서 5로** 줄고, **5 − 1 = 4** → **474**!\n어림은 **470**, 계산은 **474** — 비슷하니 잘 계산했어요.", note:"👉 빌려 오는 일은 **한 번만 일어나는 게 아니에요**."}, suggested_extras:["e_l7_sheet","x_l7_second"], tnote:{ask:["줄어든 자리는 모두 몇 곳인가요?","표시한 만큼 다 반영했나요?"], watch:"두 번째 빌림을 빠뜨려 484로 답하는 경우 — 최다 오답", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**0이 있는 자리**에서 빌려 올 때, 0에서는 빌릴 게 없다고 여겨 멈춘다. 또는 **줄어든 자리를 다시 줄이지 않는다**.", right:"0인 자리는 그 **윗자리에서 먼저 빌려** 10으로 만든 다음, 아랫자리에 다시 빌려줘요. 줄어든 자리는 그때마다 **1씩 줄여** 적어요.", hint:"703 − 485처럼 가운데가 0인 식을 모형으로 두 번 바꿔 보이면 연달아 빌리는 장면이 분명해집니다."}, suggested_extras:["x_l7_zero","t_l7_mark"], tnote:{ask:["0인 자리에서는 어디서 먼저 빌려 올까요?","백 모형 하나가 십 모형 몇 개가 되나요?"], watch:"0을 만나면 계산을 멈추는 아이 — 모형으로 두 번 바꿔 보일 것", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"받아내림 여러 번 ①", scenario:{icon:"🧮", body:"줄어든 자리를 표시하며 풀어요."}, question:"431 − 268은 얼마일까요?", input:"count_input", answer:163, note:"풀이: 일 1에서 8을 못 빼 빌림 → 11 − 8 = 3, 십은 3에서 2로 줄고 2에서 6을 못 빼 다시 빌림 → 12 − 6 = 6, 백은 4에서 3으로 줄어 3 − 2 = 1 → **163**"}, suggested_extras:["e_l7_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"받아내림 여러 번 ②", scenario:{icon:"🧮", body:"수가 커도 방법은 같아요."}, question:"812 − 197은 얼마일까요?", input:"count_input", answer:615, note:"풀이: 일 2에서 7을 못 빼 빌림 → 12 − 7 = 5, 십은 1에서 0으로 줄고 0에서 9를 못 빼 다시 빌림 → 10 − 9 = 1, 백은 8에서 7로 줄어 7 − 1 = 6 → **615**"}, suggested_extras:["t_l7_mark"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"0이 있는 자리", scenario:{icon:"🧮", body:"가운데가 0이면 어떻게 할까요?"}, question:"703 − 485는 얼마일까요?", input:"count_input", answer:218, note:"풀이: 십의 자리가 0이라 백에서 먼저 빌려 십을 10으로 만들고, 다시 일에 빌려줘요. 일 13 − 5 = 8, 십 9 − 8 = 1, 백 6 − 4 = 2 → **218**"}, suggested_extras:["x_l7_zero","q_l7_zero"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 풀어요", levels:{"기본":{q:"725 − 369는 얼마일까요?", a:"356", steps:["일 5에서 9를 못 빼 빌림 → 15 − 9 = 6","십은 2에서 1로 줄고 1에서 6을 못 빼 다시 빌림 → 11 − 6 = 5","백은 7에서 6으로 줄어 6 − 3 = 3 → 356"]},"도전":{q:"도서관에 책이 712권 있었어요. 그중 358권을 빌려 갔어요. 남은 책은 몇 권일까요?", a:"354권", steps:["'남은'이므로 뺄셈 → 712 − 358","일 2에서 8을 못 빼 빌림 → 12 − 8 = 4","십은 1에서 0으로 줄고 0에서 5를 못 빼 다시 빌림 → 10 − 5 = 5, 백은 7에서 6으로 줄어 6 − 3 = 3 → 354권"]},"심화":{q:"받아내림이 두 번 일어나는 세 자리 수 뺄셈 문제를 만들어 짝에게 내 봐요. 어떤 조건을 지켜야 할까요?", a:"여러 답 (일의 자리와 십의 자리 모두 위쪽 숫자가 아래쪽보다 작도록 고른다)", open:true}}}, suggested_extras:["q_l7_make","g_l7_race"], tnote:{ask:["빌린 횟수를 세어 볼까요?","문제를 만들 때 어느 자리를 살펴야 하나요?"], watch:"조건을 못 찾고 아무 수나 고르는 경우 — 자리별로 견주게 할 것", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"두 번 바꾸기 짝 활동", type:"pair", goal:"백 모형 → 십 모형 → 일 모형으로 연달아 바꾸는 장면을 손으로 겪기", steps:["짝과 가운데 자리가 0인 세 자리 수를 모형으로 놓는다","일의 자리에서 뺄 수 없음을 확인한다","백 모형 하나를 십 모형 열 개로, 다시 십 모형 하나를 일 모형 열 개로 바꾼다","남은 모형을 세고 세로셈으로 옮겨 적는다"], materials:["수 모형 한 벌","모눈 공책"], minutes:7}, suggested_extras:["e_l7_model","t_l7_zero"], tnote:{ask:["몇 번 바꾸었나요?","각 자리에 남은 개수는 얼마인가요?"], watch:"한 번만 바꾸고 멈추는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"차이를 재는 일", scenario:{icon:"📊", body:"투표 결과, 기록 견주기, 남은 자리 세기 — 모두 두 수의 차이를 구합니다."}, content:"어느 쪽이 **얼마나 더 많은지**를 알려면 큰 수에서 작은 수를 빼요. 이때 받아내림이 여러 번 나오기도 해요."}, suggested_extras:["r_l7_vote","r_l7_record"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"일의 자리가 0일 때", context:"곰이가 **340 − 256**을 계산하려 해요.", challenge:"일의 자리가 0이라 뺄 수 없어요. 어떻게 하면 될까요? 계산하고 방법을 말해 봐요.", note:"풀이: 십에서 빌려 10 − 6 = 4, 십은 4에서 3으로 줄고 3에서 5를 못 빼 백에서 빌려 13 − 5 = 8, 백은 3에서 2로 줄어 2 − 2 = 0 → **84**"}, suggested_extras:["x_l7_zero"], tnote:{ask:["답의 백의 자리는 왜 0이 되었나요?","답을 84로 써야 할까요, 084로 써야 할까요?"], watch:"백의 자리 0을 그대로 적어 084로 쓰는 경우", min:5}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"받아내림은 한 번만 있나요?", a:"아니요. 자리마다 몇 번이든 있을 수 있어요"},{q:"0인 자리에서는 어디서 먼저 빌려 오나요?", a:"그 윗자리"},{q:"621 − 147은?", a:"474"}], self:["여러 번 빌려 와도 할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["빌려 오는 일은 **자리마다** 생길 수 있다.","**0인 자리**는 윗자리에서 먼저 빌려 10으로 만든 뒤 다시 빌려준다.","줄어든 자리는 **그때마다 1씩 줄여** 적는다.","곰이와 펭이는 O가 X보다 **474명** 많음을 알아냈다."], arrows:["어림","연달아 빌리기","줄이기","계산"]}, suggested_extras:["r_l7_vote"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 0이 있는 자리에서 빌리는 방법을 알게 되었나요?","🔧 과정·기능 — 줄어든 자리를 빠뜨리지 않고 셈할 수 있나요?","💛 가치·태도 — 어려운 셈도 차근차근 해 보려 했나요?"], prompts:["오늘 내가 가장 자주 빠뜨린 곳은 어디였나요?"]}, suggested_extras:["e_l7_sheet"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"배운 덧셈과 뺄셈을 **비사치기 놀이**에 써 봐요. 점수를 모아 물건과 바꾸고, 남은 점수도 구해요!", emoji:"🤸"}, suggested_extras:["c_l7_prep"]}
    ],
    extras: [
      {id:"v_l7_multi", type:"video", icon:"🎥", title:"연달아 빌려 오는 뺄셈", url:"https://www.youtube.com/results?search_query=%EB%B0%9B%EC%95%84%EB%82%B4%EB%A6%BC+%EB%91%90+%EB%B2%88+%EB%BA%84%EC%85%88+3%ED%95%99%EB%85%84", description:"0이 있는 자리에서 연달아 빌리는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","misconception"]},
      {id:"q_l7_recall", type:"fun_question", icon:"💡", title:"지난 시간과 무엇이 다를까", content:"지난 시간 뺄셈과 오늘 뺄셈은 무엇이 달라졌나요? 빌리는 횟수를 세어 볼까요?", fit_slides:["review","motivate"]},
      {id:"q_l7_story", type:"fun_question", icon:"💡", title:"투표 결과 읽기", content:"O와 X 중 어느 쪽이 얼마나 더 많은지 알려면 무엇을 해야 할까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l7_zero", type:"fun_question", icon:"💡", title:"0에서는 못 빌릴까", content:"0인 자리에는 아무것도 없는데 어떻게 아랫자리에 빌려줄 수 있을까요?", fit_slides:["basic_problem","misconception","advanced_problem"]},
      {id:"q_l7_make", type:"fun_question", icon:"💡", title:"두 번 빌리는 문제 만들기", content:"빌리는 일이 꼭 두 번 생기게 하려면 두 수를 어떻게 골라야 할까요?", fit_slides:["leveled_problem"]},
      {id:"q_l7_head", type:"fun_question", icon:"💡", title:"답의 맨 앞이 0이면", content:"계산했더니 백의 자리가 0이 되었어요. 답을 어떻게 써야 할까요?", fit_slides:["advanced_problem","concept"]},
      {id:"t_l7_estimate", type:"tip", icon:"🧩", title:"어림은 십의 자리까지", content:"621 → 620, 147 → 150. 백의 자리만 보면 어긋남이 커져 점검 기능을 잃습니다.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l7_mark", type:"tip", icon:"🧩", title:"줄인 자리마다 표시", content:"줄어든 수를 자리마다 작게 적게 하고, 답을 낸 뒤 표시 개수를 되짚게 하세요.", fit_slides:["misconception","basic_problem"]},
      {id:"t_l7_zero", type:"tip", icon:"🧩", title:"0인 자리는 두 걸음", content:"'백에서 십으로, 십에서 일로' 두 걸음을 말로 붙여 주면 아이가 순서를 잃지 않습니다.", fit_slides:["misconception","offline_activity"]},
      {id:"t_l7_stage", type:"tip", icon:"🧩", title:"두 번째 빌림에서 멈추기", content:"십의 자리에서 다시 못 빼는 순간에 멈추고 아이들에게 먼저 묻습니다. 여기가 이 차시의 고비입니다.", fit_slides:["motivate","concept"]},
      {id:"t_l7_check", type:"tip", icon:"🧩", title:"덧셈으로 되돌려 확인", content:"뺀 값에 뺀 수를 더해 원래 수가 나오면 맞습니다. 어려운 식일수록 이 확인이 힘을 냅니다.", fit_slides:["basic_problem","self_assessment"]},
      {id:"r_l7_vote", type:"real_world", icon:"🌍", title:"투표 결과 견주기", content:"두 후보의 표 차이를 구하는 일은 큰 수 뺄셈 그대로입니다.", fit_slides:["real_world","summary"]},
      {id:"r_l7_record", type:"real_world", icon:"🌍", title:"기록 차이 재기", content:"작년 기록과 올해 기록의 차이를 구해 얼마나 늘었는지 봅니다.", fit_slides:["real_world"]},
      {id:"r_l7_seat", type:"real_world", icon:"🌍", title:"남은 자리 세기", content:"전체 좌석에서 팔린 좌석을 빼면 남은 자리가 나옵니다.", fit_slides:["real_world","advanced_problem"]},
      {id:"g_l7_race", type:"game", icon:"🎮", title:"빌림 몇 번일까", content:"교사가 식을 보여 주면 계산 전에 '빌림 몇 번!'을 손가락으로 표시합니다.", fit_slides:["leveled_problem","game"]},
      {id:"g_l7_zero", type:"game", icon:"🎮", title:"0 찾기 대결", content:"칠판의 여러 식 중 0이 있는 자리에서 빌려야 하는 식만 골라 손을 듭니다.", fit_slides:["basic_problem","game"]},
      {id:"x_l7_second", type:"misconception", icon:"⚠️", title:"두 번째 빌림 누락", content:"이 차시 최다 오답입니다. 621 − 147을 484로 답하면 바로 이 실수예요.", fit_slides:["misconception","concept","basic_problem"]},
      {id:"x_l7_zero", type:"misconception", icon:"⚠️", title:"0에서 멈추기", content:"0인 자리를 만나면 계산을 멈추거나 그대로 0을 내려 씁니다. 모형으로 두 번 바꿔 보이면 풀립니다.", fit_slides:["misconception","basic_problem","advanced_problem"]},
      {id:"e_l7_model", type:"example", icon:"📝", title:"두 번 바꾸는 자리", content:"백→십, 십→일 두 자리를 책상에 만들어 두면 연달아 바꾸는 동작이 분명해집니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l7_sheet", type:"example", icon:"📝", title:"줄임 칸 두 개짜리 학습지", content:"줄임 칸을 두 자리 모두 그어 둔 학습지를 쓰면 빠뜨림이 줄어듭니다.", fit_slides:["basic_problem","concept","self_assessment"]},
      {id:"e_l7_wrong", type:"example", icon:"📝", title:"0 자리 오답 모음", content:"0이 있는 자리에서 나온 오답을 모아 다음 시간 학습지로 쓰면 참여도가 올라갑니다.", fit_slides:["misconception","offline_activity"]},
      {id:"c_l7_prep", type:"checklist", icon:"✅", title:"다음 차시 준비", content:"비사치기에 쓸 납작한 물건(비석 대용)과 점수판을 준비해 두세요. 실내에서는 종이컵으로 대신할 수 있습니다.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l08 — 비사치기를 해 볼까요 ══════════════════ */
  window.LESSONS["u1_l08"] = {
    meta: { grade:3, subject:"수학", unit:1, n:8, title:"비사치기를 해 볼까요?", std:"[4수01-01]", duration_min:40,
      lesson_format:"교사주도 — 전통 놀이 속 덧셈·뺄셈 적용 · 40분 표준 v2(7요소)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_08_비사치기를해볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"비사치기를 해 볼까요?\n점수를 모아 바꿔요", emoji:"🤸"}, suggested_extras:["v_l8_play"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"빌려 오는 일은 **자리마다** 생길 수 있고, **0인 자리**는 윗자리에서 먼저 빌려 10으로 만든다고 했어요.", items:[{q:"받아내림은 한 번만 있나요?", a:"아니요. 자리마다 몇 번이든 있을 수 있어요"},{q:"0인 자리에서는 어디서 먼저 빌려 오나요?", a:"그 윗자리"},{q:"621 − 147은?", a:"474"}], from:"u1_l07"}, suggested_extras:["q_l8_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"비사치기로 점수를 모아요", kids:[{face:"🐻", label:"곰이\n\"어깨로 넘어뜨렸어!\""},{face:"🐧", label:"펭이\n\"난 이마로 성공!\""}], question:"비사치기는 **비석을 넘어뜨리는 전통 놀이**예요. 몸의 여러 부위로 넘어뜨려 점수를 얻고, 점수를 모아 원하는 물건과 바꿔 봐요!", img:"assets/photo/math/bisachigi.jpg"}, suggested_extras:["q_l8_tradition","b_l8_book","t_l8_safety"], tnote:{ask:["비사치기를 해 본 적 있나요?","점수를 모으려면 어떤 셈이 필요할까요?"], watch:"놀이에만 마음이 쏠려 셈을 건너뛰는 경우 — 점수판을 먼저 세울 것", min:4}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"점수표를 살펴봐요", content:"몸의 부위마다 점수가 달라요. 바꿀 수 있는 물건에도 값이 붙어 있어요.", items:[{emoji:"🦶", count:1, label:"발등 **234점**"},{emoji:"🫄", count:1, label:"배 **359점**"},{emoji:"✋", count:1, label:"손등 **318점**"},{emoji:"💪", count:1, label:"어깨 **465점**"},{emoji:"🧠", count:1, label:"이마 **387점**"}], note:"🎁 바꿀 물건 — 보드게임 **816점** · 축구공 **755점** · 필통 **627점** · 줄넘기 **543점**"}, suggested_extras:["e_l8_board","t_l8_table"], tnote:{ask:["가장 높은 점수를 주는 부위는 어디인가요?","가장 값이 큰 물건은 무엇인가요?"], watch:"점수표를 읽지 않고 짐작으로 답하는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"어깨와 이마로 점수를 모아요", content:"어깨 **465점**과 이마 **387점**을 얻었어요.\n두 점수를 더하면?\n식: **465 + 387**\n일 5 + 7 = 12 → 2 쓰고 1 올림, 십 6 + 8 = 14에 1 더해 15 → 5 쓰고 1 올림, 백 4 + 3 = 7에 1 더해 8.\n그래서 **465 + 387 = 852점**!", note:"👉 배운 덧셈을 그대로 쓰면 돼요."}, suggested_extras:["e_l8_sheet"], tnote:{ask:["올림은 몇 번 있었나요?","852점은 어느 물건과 바꿀 수 있을까요?"], watch:"두 번째 올림 누락이 다시 나타나는 경우", min:5}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"바꿀 수 있을까요? 남은 점수는?", content:"보드게임은 **816점**이에요. 내 점수 **852점**이 더 크니까 **바꿀 수 있어요**!\n바꾸고 남은 점수는 **852 − 816 = 36점**.", note:"👉 ① 점수를 **더해** 모으고 ② 물건값과 **견주고** ③ 남은 점수를 **뺀다** — 세 걸음이에요."}, suggested_extras:["t_l8_three","x_l8_compare"], tnote:{ask:["바꿀 수 있는지 어떻게 알았나요?","남은 점수를 구하려면 어떤 셈을 할까요?"], watch:"견주기 없이 무조건 바꿀 수 있다고 여기는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"모은 점수가 물건값보다 **작아도 바꿀 수 있다**고 생각한다. 또는 바꾼 뒤 남은 점수를 **더해** 버린다.", right:"모은 점수가 물건값보다 **크거나 같아야** 바꿀 수 있어요. 바꾸고 나면 물건값만큼 **빠지니까 뺄셈**이에요.", hint:"점수 카드를 실제로 걷어 가는 시늉을 하면 '빠진다'는 느낌이 분명해집니다."}, suggested_extras:["x_l8_compare","x_l8_add"], tnote:{ask:["746점으로 755점짜리를 바꿀 수 있을까요?","바꾸고 나면 점수가 늘까요, 줄까요?"], watch:"바꾼 뒤 점수가 늘었다고 답하는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"점수 모으기 ①", scenario:{icon:"🦶", body:"발등과 배로 비석을 넘어뜨렸어요."}, question:"발등 234점 + 배 359점은 모두 몇 점일까요?", input:"count_input", answer:593, note:"풀이: 일 4 + 9 = 13 → 3 쓰고 1 올림, 십 3 + 5 = 8에 1 더해 9, 백 2 + 3 = 5 → **593점**"}, suggested_extras:["e_l8_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"점수 모으기 ②", scenario:{icon:"✋", body:"손등과 어깨로 얻은 점수예요."}, question:"손등 318점 + 어깨 465점은 모두 몇 점일까요?", input:"count_input", answer:783, note:"풀이: 일 8 + 5 = 13 → 3 쓰고 1 올림, 십 1 + 6 = 7에 1 더해 8, 백 3 + 4 = 7 → **783점**"}, suggested_extras:["e_l8_sheet"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"바꾸고 남은 점수", scenario:{icon:"🎁", body:"783점으로 필통(627점)을 바꿨어요."}, question:"남은 점수는 몇 점일까요?", input:"count_input", answer:156, note:"풀이: 783 − 627. 일 3에서 7을 못 빼 빌림 → 13 − 7 = 6, 십은 8에서 7로 줄어 7 − 2 = 5, 백 7 − 6 = 1 → **156점**"}, suggested_extras:["t_l8_three"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 풀어요", levels:{"기본":{q:"이마 387점 + 손등 318점은 모두 몇 점일까요?", a:"705점", steps:["일 7 + 8 = 15 → 5 쓰고 1 올림","십 8 + 1 = 9에 1 더해 10 → 0 쓰고 1 올림","백 3 + 3 = 6에 1 더해 7 → 705점"]},"도전":{q:"배 359점과 이마 387점을 얻었어요. 이 점수로 축구공(755점)을 바꿀 수 있을까요?", a:"바꿀 수 없다 (746점)", steps:["359 + 387 = 746점","746과 755를 견준다","746이 755보다 작으므로 바꿀 수 없다"]},"심화":{q:"보드게임(816점)을 바꾸려면 어떤 두 부위로 성공해야 할까요? 점수표에서 골라 까닭과 함께 말해 봐요.", a:"여러 답 (예: 어깨 465 + 이마 387 = 852점 → 바꿀 수 있다)", open:true}}}, suggested_extras:["q_l8_plan","g_l8_shop"], tnote:{ask:["두 점수를 더한 값과 물건값 중 어느 쪽이 큰가요?","바꿀 수 없다면 무엇이 더 필요할까요?"], watch:"더하기만 하고 견주기를 빠뜨리는 경우", min:6}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"우리 반 비사치기 점수판", type:"group", goal:"모둠에서 실제로 놀이하고 점수를 모아 물건과 바꾸어 보기", steps:["모둠에서 부위별 점수를 정해 점수판에 적는다","한 사람이 두 번씩 던져 얻은 점수를 더한다","바꾸고 싶은 물건 카드와 점수를 견준다","바꿀 수 있으면 남은 점수를 빼서 적는다"], materials:["납작한 물건(비석 대용)","점수판","물건 카드"], minutes:8}, suggested_extras:["e_l8_board","t_l8_safety","g_l8_shop"], tnote:{ask:["점수를 더한 값이 맞는지 짝과 확인했나요?","남은 점수는 어떻게 구했나요?"], watch:"놀이에만 몰두해 점수판을 채우지 않는 모둠 — 기록 담당을 정해 줄 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"점수로 바꾸는 일은 어디에나", scenario:{icon:"🏆", body:"학급 칭찬 점수, 도서관 독서 점수, 알뜰 시장의 쿠폰."}, content:"모으고, 견주고, 쓰고 남은 것을 세는 세 걸음은 어른들의 살림에서도 똑같이 일어나요."}, suggested_extras:["r_l8_market","r_l8_class"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"어떤 물건을 고를까요", context:"곰이가 어깨와 이마로 성공해 **852점**을 모았어요.", challenge:"보드게임(816점)과 축구공(755점) 중 하나를 고른다면, 어느 쪽이 남는 점수가 더 많을까요? 두 경우를 모두 계산해 견주어 봐요.", note:"풀이: 보드게임을 고르면 852 − 816 = **36점** 남고, 축구공을 고르면 852 − 755 = **97점** 남아요. 축구공을 고를 때 남는 점수가 더 많아요."}, suggested_extras:["q_l8_plan"], tnote:{ask:["두 경우를 모두 계산해 보았나요?","남는 점수가 많은 쪽이 늘 좋은 선택일까요?"], watch:"한쪽만 계산하고 답하는 경우", min:6}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"어깨 465점 + 이마 387점은?", a:"852점"},{q:"852점으로 816점짜리를 바꿀 수 있나요?", a:"있다 (852가 더 크다)"},{q:"바꾸고 남은 점수는?", a:"36점"}], self:["점수를 모으고 바꿀 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["점수를 **더해** 모은다.","물건값과 **견주어** 바꿀 수 있는지 정한다.","바꾸고 남은 점수는 **빼서** 구한다.","전통 놀이 속에도 덧셈과 뺄셈이 살아 있다."], arrows:["더하기","견주기","빼기"]}, suggested_extras:["r_l8_class"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 더하기와 빼기를 언제 쓰는지 가릴 수 있나요?","🔧 과정·기능 — 점수를 모으고 남은 점수를 구할 수 있나요?","💛 가치·태도 — 전통 놀이를 즐겁게 해 보았나요?"], prompts:["오늘 놀이에서 가장 어려웠던 계산은 무엇이었나요?"]}, suggested_extras:["e_l8_board"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"단원을 **스스로 마무리**해요. 받아올림·받아내림·어림을 되짚고, 여러 문제를 풀며 내 힘을 확인해요.", emoji:"🏁"}, suggested_extras:["c_l8_prep"]}
    ],
    extras: [
      {id:"v_l8_play", type:"video", icon:"🎥", title:"비사치기 놀이 방법", url:"https://www.youtube.com/results?search_query=%EB%B9%84%EC%84%9D%EC%B9%98%EA%B8%B0+%EC%A0%84%ED%86%B5%EB%86%80%EC%9D%B4+%EB%B0%A9%EB%B2%95", description:"비사치기 놀이 방법과 부위별 던지기 장면.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","offline_activity"]},
      {id:"q_l8_recall", type:"fun_question", icon:"💡", title:"배운 셈 꺼내 쓰기", content:"오늘 놀이에는 지금까지 배운 것 중 무엇이 쓰일까요?", fit_slides:["review","motivate"]},
      {id:"q_l8_tradition", type:"fun_question", icon:"💡", title:"우리 전통 놀이", content:"비사치기 말고 또 어떤 전통 놀이를 알고 있나요? 그 놀이에도 점수를 매길 수 있을까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l8_plan", type:"fun_question", icon:"💡", title:"어떻게 모을까", content:"원하는 물건을 바꾸려면 어떤 부위를 노려야 할까요? 계획을 세워 볼까요?", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"q_l8_fair", type:"fun_question", icon:"💡", title:"점수는 공평할까", content:"부위마다 점수가 다른 까닭은 무엇일까요? 어려운 부위일수록 점수가 높아야 할까요?", fit_slides:["concept","offline_activity"]},
      {id:"q_l8_left", type:"fun_question", icon:"💡", title:"남은 점수로 또 바꾸기", content:"남은 점수로 또 다른 물건을 바꿀 수 있을까요? 어떻게 알 수 있을까요?", fit_slides:["advanced_problem","real_world"]},
      {id:"t_l8_table", type:"tip", icon:"🧩", title:"점수표를 크게 붙여 두기", content:"점수표와 물건값 표를 칠판에 크게 붙여 두면 계산 내내 아이들이 스스로 찾아봅니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l8_three", type:"tip", icon:"🧩", title:"세 걸음으로 말하기", content:"'더하고 → 견주고 → 뺀다'를 구호처럼 반복하면 문제 유형이 바뀌어도 흔들리지 않습니다.", fit_slides:["concept","basic_problem","summary"]},
      {id:"t_l8_safety", type:"tip", icon:"🧩", title:"안전하게 놀기", content:"실내에서는 종이컵이나 스펀지 블록을 비석 대신 씁니다. 던지는 거리와 방향을 먼저 정해 주세요.", fit_slides:["motivate","offline_activity"]},
      {id:"t_l8_record", type:"tip", icon:"🧩", title:"모둠에 기록 담당", content:"놀이에 몰두하면 계산이 뒷전이 됩니다. 모둠마다 기록 담당을 정해 점수판을 채우게 하세요.", fit_slides:["offline_activity"]},
      {id:"t_l8_mixed", type:"tip", icon:"🧩", title:"덧셈과 뺄셈을 섞어 내기", content:"한 문제 안에 모으기와 남기기가 함께 있어야 언제 무엇을 쓸지 판단하는 힘이 자랍니다.", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"r_l8_market", type:"real_world", icon:"🌍", title:"알뜰 시장의 쿠폰", content:"쿠폰을 모아 물건과 바꾸고 남은 쿠폰을 세는 일도 오늘의 세 걸음 그대로입니다.", fit_slides:["real_world","summary"]},
      {id:"r_l8_class", type:"real_world", icon:"🌍", title:"학급 칭찬 점수", content:"칭찬 점수를 모아 학급 보상과 바꾸는 활동에 오늘 셈을 그대로 쓸 수 있습니다.", fit_slides:["real_world","self_assessment"]},
      {id:"r_l8_game", type:"real_world", icon:"🌍", title:"놀이의 점수판", content:"운동회·놀이 대회의 점수판도 더하고 견주는 일로 굴러갑니다.", fit_slides:["real_world","offline_activity"]},
      {id:"g_l8_shop", type:"game", icon:"🎮", title:"점수 상점 놀이", content:"물건 카드를 책상에 늘어놓고 모은 점수로 사 오게 합니다. 남은 점수를 적어야 다음 차례가 옵니다.", fit_slides:["leveled_problem","offline_activity","game"]},
      {id:"g_l8_target", type:"game", icon:"🎮", title:"목표 점수 맞히기", content:"교사가 목표 점수를 부르면 두 부위를 골라 그 점수에 가장 가깝게 만드는 모둠이 이깁니다.", fit_slides:["game","advanced_problem"]},
      {id:"x_l8_compare", type:"misconception", icon:"⚠️", title:"견주기 건너뛰기", content:"모은 점수가 물건값보다 작아도 바꾸려 합니다. 견주는 단계를 반드시 소리 내어 말하게 하세요.", fit_slides:["misconception","concept","leveled_problem"]},
      {id:"x_l8_add", type:"misconception", icon:"⚠️", title:"바꾸고 나서 더하기", content:"바꾸면 점수가 빠지는데 더해 버리는 실수입니다. 카드를 걷어 가는 시늉이 잘 듣습니다.", fit_slides:["misconception","basic_problem"]},
      {id:"e_l8_board", type:"example", icon:"📝", title:"점수판 양식", content:"'얻은 점수 / 합 / 바꾼 물건 / 남은 점수' 네 칸짜리 점수판을 모둠 수만큼 준비하세요.", fit_slides:["concept","offline_activity","self_assessment"]},
      {id:"e_l8_sheet", type:"example", icon:"📝", title:"세로셈 칸 이어 쓰기", content:"앞 차시에서 쓰던 세로셈 학습지를 그대로 씁니다. 놀이 중에도 자리를 맞춰 적게 하세요.", fit_slides:["basic_problem","concept"]},
      {id:"b_l8_book", type:"book", icon:"📚", title:"전통 놀이 그림책", content:"도서관에서 전통 놀이를 다룬 책을 골라 도입에 한 장면 보여 주면 좋습니다.", fit_slides:["motivate"]},
      {id:"c_l8_prep", type:"checklist", icon:"✅", title:"다음 차시 준비", content:"단원 마무리 차시입니다. 이 단원에서 나온 오답을 모아 두면 그대로 복습 자료가 됩니다.", fit_slides:["next_lesson"]}
    ]
  };

  /* ══════════════════ l09 — 스스로 마무리해요 (단원 마무리·평가) ══════════════════ */
  window.LESSONS["u1_l09"] = {
    meta: { grade:3, subject:"수학", unit:1, n:9, title:"스스로 마무리해요", std:"[4수01-01]", duration_min:40,
      lesson_format:"단원 마무리·평가 — 되짚기 + 스스로 확인 · 40분 표준 v2(7요소, offline 제외)", theme:"곰이·펭이 온라인 마을 여행",
      live_url:"../../grade3/semester1/math/1단원_덧셈과뺄셈/g3_math_u1_09_스스로마무리해요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"스스로 마무리해요\n온라인 마을 여정을 마쳐요", emoji:"🏁"}, suggested_extras:["v_l9_review"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"비사치기 점수를 **더해** 모으고, 물건값과 **견주고**, 남은 점수를 **빼서** 구했어요.", items:[{q:"어깨 465점 + 이마 387점은?", a:"852점"},{q:"852점으로 816점짜리를 바꿀 수 있나요?", a:"있다 (852가 더 크다)"},{q:"바꾸고 남은 점수는?", a:"36점"}], from:"u1_l08"}, suggested_extras:["q_l9_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"핵심 질문을 다시 떠올려요", kids:[{face:"🐻", label:"곰이\n\"많이 배웠어!\""},{face:"🐧", label:"펭이\n\"이제 혼자 해 볼래\""}], question:"그동안 온라인 마을에서 덧셈과 뺄셈을 배웠어요. **\"세 자리 수의 덧셈과 뺄셈은 어떻게 할까?\"** — 이제 스스로 답해 볼까요?", img:"assets/photo/math/online_finish.jpg"}, suggested_extras:["q_l9_selfcheck","t_l9_tone"], tnote:{ask:["이 단원에서 가장 기억에 남는 것은 무엇인가요?","어느 부분이 아직 어렵나요?"], watch:"'다 안다'며 점검을 건너뛰려는 경우 — 한 문제로 확인시킬 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"받아올림을 떠올려요", content:"자리마다 **10이 넘으면 윗자리로 1**을 올려요.\n**542 + 279**\n일 2 + 9 = 11 → 1 쓰고 1 올림, 십 4 + 7 = 11에 1 더해 12 → 2 쓰고 1 올림, 백 5 + 2 = 7에 1 더해 8.\n그래서 **542 + 279 = 821**.", note:"👉 올린 1을 작게 적어 두는 습관, 아직 남아 있나요?"}, suggested_extras:["e_l9_sheet","t_l9_mark"], tnote:{ask:["올림은 몇 번 있었나요?","답을 어림으로 점검해 볼까요?"], watch:"두 번째 올림 누락이 아직 남아 있는 아이", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"받아내림을 떠올려요", content:"뺄 수 없으면 **윗자리에서 빌려**와요. 빌려준 자리는 **1 줄어요**.\n**843 − 418**\n일 3에서 8을 못 빼 빌림 → 13 − 8 = 5, 십은 4에서 3으로 줄어 3 − 1 = 2, 백 8 − 4 = 4.\n그래서 **843 − 418 = 425**.", note:"👉 줄인 수를 작게 적어 두면 잊지 않아요."}, suggested_extras:["e_l9_sheet","t_l9_mark"], tnote:{ask:["빌린 곳은 어디인가요?","십의 자리가 왜 3이 되었나요?"], watch:"줄이기 누락이 아직 남아 있는 아이", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"어림과 견주기를 떠올려요", content:"계산 전에 **가까운 몇백몇십**으로 바꿔 대강의 값을 가늠해요.\n계산한 값이 어림과 비슷하면 잘한 거예요.\n두 식의 결과를 견줄 때는 **각각 계산한 뒤** 어느 쪽이 큰지 봐요.", note:"👉 어림은 답을 대신하지 않아요. **점검하는 도구**예요."}, suggested_extras:["q_l9_est","x_l9_est"], tnote:{ask:["어림값을 답으로 써도 될까요?","두 식을 견주려면 무엇을 먼저 할까요?"], watch:"어림값을 정답으로 적는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"단원에서 가장 자주 나온 실수", wrong:"① 자리를 어긋나게 쓴다 ② 올린 1·줄인 1을 빠뜨린다 ③ 뺄 수 없을 때 **위아래를 바꿔** 뺀다 ④ **어림값을 답으로** 쓴다.", right:"자리를 맞춰 쓰고, 표시한 것은 반드시 반영하고, 뺄셈 순서는 지키고, 어림은 **점검에만** 씁니다.", hint:"네 가지를 칠판에 번호로 적어 두고, 문제를 풀 때마다 자기 실수가 몇 번인지 손가락으로 표시하게 해 보세요."}, suggested_extras:["x_l9_four","t_l9_selferr"], tnote:{ask:["나는 몇 번 실수를 가장 자주 하나요?","그 실수를 막으려면 무엇을 하면 될까요?"], watch:"자기 실수 유형을 모르는 아이 — 앞 차시 오답을 꺼내 함께 볼 것", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"스스로 확인 ①", scenario:{icon:"✏️", body:"자리를 맞추어 차근차근 풀어요."}, question:"473 + 214는 얼마일까요?", input:"count_input", answer:687, note:"풀이: 일 3 + 4 = 7, 십 7 + 1 = 8, 백 4 + 2 = 6 → **687**"}, suggested_extras:["e_l9_sheet"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"스스로 확인 ②", scenario:{icon:"✏️", body:"올림이 있는지 살펴봐요."}, question:"306 + 186은 얼마일까요?", input:"count_input", answer:492, note:"풀이: 일 6 + 6 = 12 → 2 쓰고 1 올림, 십 0 + 8 = 8에 1 더해 9, 백 3 + 1 = 4 → **492**"}, suggested_extras:["t_l9_mark"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"스스로 확인 ③", scenario:{icon:"✏️", body:"이번엔 뺄셈이에요."}, question:"645 − 340은 얼마일까요?", input:"count_input", answer:305, note:"풀이: 일 5 − 0 = 5, 십 4에서 4를 빼 0, 백 6 − 3 = 3 → **305**"}, suggested_extras:["e_l9_sheet"]},
      {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"스스로 확인 ④", scenario:{icon:"🚁", body:"드론이 971대 있었어요."}, question:"그중 685대가 날아갔어요. 남은 드론은 몇 대일까요?", input:"count_input", answer:286, note:"풀이: 971 − 685. 일 1에서 5를 못 빼 빌림 → 11 − 5 = 6, 십은 7에서 6으로 줄고 6에서 8을 못 빼 다시 빌림 → 16 − 8 = 8, 백은 9에서 8로 줄어 8 − 6 = 2 → **286대**"}, suggested_extras:["t_l9_mark"]},
      {id:"s12", stage:"기본문제", block:"leveled_problem", data:{title:"수준을 골라 마무리해요", levels:{"기본":{q:"843 − 418은 얼마일까요?", a:"425", steps:["일 3에서 8을 못 빼 빌림 → 13 − 8 = 5","십은 4에서 3으로 줄어 3 − 1 = 2","백 8 − 4 = 4 → 425"]},"도전":{q:"주차장 1층에 차가 542대, 2층에 279대 있어요. 차는 모두 몇 대일까요?", a:"821대", steps:["'모두'이므로 덧셈 → 542 + 279","일 2 + 9 = 11 → 1 쓰고 1 올림","십 4 + 7 = 11에 1 더해 12 → 2 쓰고 1 올림, 백 5 + 2 = 7에 1 더해 8 → 821대"]},"심화":{q:"이 단원에서 내가 가장 자주 한 실수를 하나 고르고, 그 실수가 나오는 문제를 스스로 만들어 풀어 봐요.", a:"여러 답 (예: 올림 누락 → 268 + 475 = 743)", open:true}}}, suggested_extras:["q_l9_selfcheck","g_l9_quiz"], tnote:{ask:["내가 고른 실수는 몇 번이었나요?","그 실수를 막으려면 무엇을 적어 두면 좋을까요?"], watch:"심화에서 실수를 고르지 못하는 아이 — 앞 차시 학습지를 꺼내 함께 볼 것", min:6}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"배운 셈은 계속 쓰여요", scenario:{icon:"🌏", body:"물건값 더하기, 거스름돈 세기, 기록 차이 재기, 남은 개수 세기."}, content:"세 자리 수의 덧셈과 뺄셈은 앞으로 배울 더 큰 수의 셈에서도 **그대로 쓰이는 바탕**이에요."}, suggested_extras:["r_l9_next","r_l9_life"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"두 식을 견주어요", context:"곰이가 낸 문제예요. **148 + 406**과 **704 − 139** 중 어느 쪽이 클까요?", challenge:"두 식을 각각 계산한 뒤 견주어, 사이에 들어갈 말을 정해 봐요. (더 크다 / 더 작다)", note:"풀이: 148 + 406 = **554**, 704 − 139 = **565**. 554는 565보다 **더 작다**."}, suggested_extras:["q_l9_est","x_l9_est"], tnote:{ask:["견주기 전에 무엇을 먼저 해야 하나요?","어림만으로도 정할 수 있었을까요?"], watch:"계산하지 않고 겉모습만 보고 정하는 경우", min:5}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"542 + 279는?", a:"821"},{q:"843 − 418은?", a:"425"},{q:"어림은 무엇에 쓰나요?", a:"계산한 답을 점검하는 데 쓴다"}], self:["단원 내용을 스스로 정리할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"이 단원에서 배운 것", points:["세 자리 수의 덧셈·뺄셈은 **같은 자리끼리** 셈한다.","10이 넘으면 **올리고**, 뺄 수 없으면 **빌려 온다**.","올리거나 빌린 자리는 **표시하고 꼭 반영한다**.","**어림**으로 답이 알맞은지 스스로 점검한다."], arrows:["자리 맞추기","받아올림","받아내림","어림으로 점검"]}, suggested_extras:["r_l9_next"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 세 자리 수의 덧셈과 뺄셈 방법을 설명할 수 있나요?","🔧 과정·기능 — 올림과 빌림을 빠뜨리지 않고 계산할 수 있나요?","💛 가치·태도 — 지난날의 나보다 나아진 점은 무엇인가요?"], prompts:["다음 단원에서 도전해 보고 싶은 것은 무엇인가요?"]}, suggested_extras:["t_l9_selferr"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 단원에는", preview:"이제 수에서 잠시 벗어나 **평면도형**을 만나요. 곧은 선과 굽은 선, 각과 직각을 살펴봐요!", emoji:"📐"}, suggested_extras:["c_l9_prep"]}
    ],
    extras: [
      {id:"v_l9_review", type:"video", icon:"🎥", title:"단원 되짚기 영상", url:"https://www.youtube.com/results?search_query=%EC%84%B8+%EC%9E%90%EB%A6%AC+%EC%88%98+%EB%8D%A7%EC%85%88+%EB%BA%84%EC%85%88+%EC%A0%95%EB%A6%AC", description:"단원 전체를 짧게 되짚는 정리 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["motivate","summary"]},
      {id:"q_l9_recall", type:"fun_question", icon:"💡", title:"놀이에서 배운 것", content:"지난 시간 놀이에서 쓴 세 걸음은 무엇이었나요?", fit_slides:["review","motivate"]},
      {id:"q_l9_selfcheck", type:"fun_question", icon:"💡", title:"내 실수 찾기", content:"이 단원에서 내가 가장 자주 한 실수는 무엇이었나요? 앞으로 무엇을 조심할까요?", fit_slides:["motivate","leveled_problem","self_assessment"]},
      {id:"q_l9_est", type:"fun_question", icon:"💡", title:"어림으로 정할 수 있을까", content:"두 식을 견줄 때 어림만으로 정할 수 있는 경우와 없는 경우는 어떻게 다를까요?", fit_slides:["concept","advanced_problem"]},
      {id:"q_l9_bigger", type:"fun_question", icon:"💡", title:"더 큰 수가 오면", content:"네 자리 수, 다섯 자리 수가 나오면 오늘 배운 방법을 그대로 쓸 수 있을까요?", fit_slides:["real_world","summary"]},
      {id:"q_l9_teach", type:"fun_question", icon:"💡", title:"동생에게 알려 주기", content:"받아올림을 아직 모르는 동생에게 어떻게 설명해 줄까요?", fit_slides:["concept","self_assessment"]},
      {id:"t_l9_tone", type:"tip", icon:"🧩", title:"견주지 않는 마무리", content:"'누가 더 잘했나'가 아니라 '지난날의 나보다 무엇이 나아졌나'로 물어 주세요. 마무리 차시의 말투가 다음 단원의 마음을 만듭니다.", fit_slides:["motivate","self_assessment"]},
      {id:"t_l9_mark", type:"tip", icon:"🧩", title:"표시 습관 마지막 점검", content:"올림·줄임 표시를 아직 안 하는 아이가 있다면 이번 차시에 꼭 붙여 주세요. 다음 단원에서도 계속 쓰입니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l9_selferr", type:"tip", icon:"🧩", title:"실수 번호 붙이기", content:"네 가지 실수에 번호를 붙여 두고 자기 오답이 몇 번인지 스스로 고르게 하면 점검이 활동이 됩니다.", fit_slides:["misconception","self_assessment"]},
      {id:"t_l9_mix", type:"tip", icon:"🧩", title:"덧셈·뺄셈 섞어 내기", content:"마무리 차시에는 유형을 섞어 내야 '언제 무엇을 쓰는지' 판단하는 힘이 드러납니다.", fit_slides:["basic_problem","leveled_problem"]},
      {id:"t_l9_slow", type:"tip", icon:"🧩", title:"느린 아이의 자리", content:"문제 수를 줄이고 자리 맞춰 쓰기 한 가지만 확인해도 됩니다. 다 풀지 못한 것이 못한 것은 아닙니다.", fit_slides:["basic_problem","self_assessment"]},
      {id:"r_l9_next", type:"real_world", icon:"🌍", title:"앞으로 쓰일 자리", content:"더 큰 수의 셈, 물건값 셈, 자료 견주기 — 오늘 배운 방법이 그대로 바탕이 됩니다.", fit_slides:["real_world","summary"]},
      {id:"r_l9_life", type:"real_world", icon:"🌍", title:"생활 속 세 자리 수", content:"쪽수·인원·거스름돈·기록. 하루에도 여러 번 만나는 수들입니다.", fit_slides:["real_world"]},
      {id:"r_l9_data", type:"real_world", icon:"🌍", title:"자료를 견주는 일", content:"두 값을 계산해 견주는 일은 표와 그래프를 읽을 때도 그대로 쓰입니다.", fit_slides:["advanced_problem","real_world"]},
      {id:"g_l9_quiz", type:"game", icon:"🎮", title:"단원 마무리 퀴즈", content:"모둠 대항으로 식을 하나씩 내고, 어림값을 먼저 말한 뒤 계산해 맞히는 놀이.", fit_slides:["leveled_problem","game"]},
      {id:"g_l9_error", type:"game", icon:"🎮", title:"틀린 곳 찾기 대결", content:"교사가 일부러 틀린 세로셈을 보여 주면 어느 자리가 틀렸는지 먼저 찾는 사람이 이깁니다.", fit_slides:["misconception","game"]},
      {id:"x_l9_four", type:"misconception", icon:"⚠️", title:"단원 4대 실수", content:"자리 어긋남 · 올림/줄임 누락 · 뺄셈 순서 바꾸기 · 어림값을 답으로 쓰기. 번호를 붙여 게시해 두세요.", fit_slides:["misconception","self_assessment"]},
      {id:"x_l9_est", type:"misconception", icon:"⚠️", title:"어림값을 답으로", content:"어림은 점검 도구입니다. 어림값을 그대로 답으로 적는 아이가 꼭 나옵니다.", fit_slides:["concept","advanced_problem","misconception"]},
      {id:"e_l9_sheet", type:"example", icon:"📝", title:"마무리 학습지", content:"덧셈 두 문제·뺄셈 두 문제·견주기 한 문제로 짧게 구성하면 40분 안에 점검이 끝납니다.", fit_slides:["basic_problem","concept"]},
      {id:"e_l9_error", type:"example", icon:"📝", title:"내 오답 노트 한 장", content:"이 단원에서 틀린 문제 한 개를 골라 '무엇을 빠뜨렸나'를 한 줄로 적게 하세요.", fit_slides:["self_assessment","misconception"]},
      {id:"e_l9_card", type:"example", icon:"📝", title:"자기 점검 카드", content:"'자리 맞췄나 / 표시했나 / 다 반영했나 / 어림과 비슷한가' 네 칸 카드를 책상에 붙여 둡니다.", fit_slides:["self_assessment","summary"]},
      {id:"c_l9_prep", type:"checklist", icon:"✅", title:"다음 단원 준비", content:"다음 단원은 평면도형입니다. 자·색연필·모눈종이를 미리 안내해 두세요.", fit_slides:["next_lesson"]}
    ]
  };

})();
