/* ============================================================================
   3학년 1학기 수학 — 2단원 「평면도형」 케이티처(교사주도) 차시 데이터 (8차시)
   - 키: window.LESSONS["u2_l{NN}"] (zero-pad). g3_math.html이 자동 로드·누적.
   - 성취기준 [4수02-01]·[4수02-02]·[4수02-03]. 학생 본차시 01~08 전 차시 대응(1:1).
   ------------------------------------------------------------
   2026-08-20 신규 제작 (40분 표준 v2 · 7요소) — g3 수학 라인 두 번째 단원
   - 차시당 18슬(l01만 19슬) · extras 22
   - 7요소 전 차시: (1)review items(l01 제외·from=이전차시·직전 exit 계승) (2)img 폴백
     (3)서사(곰이·펭이 안전한 등굣길 도형 지도) (4)offline_activity(l08 마무리 제외 7차시)
     (5)leveled_problem(기본·도전·심화 3탭·심화 open) (6)exit_ticket(확인3+신호등3) (7)tnote 6슬 이상
   - 근거 고정 = 학생 본차시(grade3/semester1/math/2단원_평면도형/) 검증 사실 전수 계승.
     이 단원은 셈이 아니라 도형 단원이므로 산수 검산 대신 도형 사실 정합 검산을 쓴다.
     삼각형 변 3·꼭짓점 3 / 사각형 변 4·꼭짓점 4 / 각의 변 2 / 직각삼각형의 직각 1개 /
     직사각형 직각 4개 / 고양이 그림 = 정사각형 1·직각삼각형 2·직사각형 2·선분 4 (모두 9개).
   - 3학년 용어 가드: 이 단원은 평면도형만 다룬다.
     뒤 단원 소관(곱셈·나눗셈·분수·소수, 길이의 작은 단위)의 이름·기호는 학생 노출 자리에 쓰지 않는다.
     4학년 이상 용어(예각·둔각·평각·각의 크기 재기·수직·평행·다각형·합동·대칭·둘레·넓이 따위)도 쓰지 않는다.
   - 선행 용어 규약: 선분·반직선·직선은 l02, 각은 l03, 직각은 l04,
     직각삼각형은 l05, 직사각형·정사각형은 l06에서 도입.
     -> l02·l03 본문에 직각 선행 노출 금지 / l02~l04 본문에 직각삼각형 금지 /
        l02~l05 본문에 직사각형·정사각형 금지.
     주의 예외 둘: (1) l01은 단원 예고 차시라 네 걸음을 이름으로 모두 소개한다
                  (2) next_lesson 블록은 다음 차시 예고 자리다. (게이트 E가 이 둘을 제외하고 검사)
   - 케이랩 매핑 없음: 선분·각·직각은 자·삼각자·종이접기 실물이 화면 교구보다 우위
     (g2_math_klab.js 헤더의 정직 원칙 계승).
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ══════════════════ l01 — 평면도형을 만나 볼까요 (단원 도입) ══════════════════ */
  window.LESSONS["u2_l01"] = {
    meta: { grade:3, subject:"수학", unit:2, n:1, title:"평면도형을 만나 볼까요 (단원 도입)", std:"[4수02-01]", duration_min:40,
      lesson_format:"단원 도입 · 40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_01_평면도형을만나볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"평면도형을 만나 볼까요\n등굣길에 도형이 숨어 있어요", emoji:"🔺"}, suggested_extras:["v_l1_intro"]},
      {id:"s02", stage:"도입", block:"objective", data:{title:"이 단원에서 배울 것", content:"**곧은 선**의 여러 갈래를 알아봐요.\n**각**과 **직각**을 알아봐요.\n**직각삼각형**과 **직사각형·정사각형**을 알아봐요."}, suggested_extras:["t_l1_map"], tnote:{ask:["2학년 때 어떤 도형을 배웠나요?","도형의 이름을 아는 것과 성질을 아는 것은 무엇이 다를까요?"], watch:"도형을 그림으로만 기억하고 성질로는 말하지 못하는 아이", min:2}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 등굣길 지도를 펼쳤어요", kids:[{face:"🐻", label:"곰이\n\"표지판이 뾰족해!\""},{face:"🐧", label:"펭이\n\"횡단보도는 네모야\""}], question:"등굣길 지도에서 **삼각형**과 **사각형**을 찾아봐요. 어디에 숨어 있을까요?", img:"assets/photo/math/crosswalk.jpg"}, suggested_extras:["q_l1_find","r_l1_road","b_l1_shape"], tnote:{ask:["표지판은 어떤 모양인가요?","횡단보도의 흰 칸은 어떤 모양인가요?"], watch:"모양은 짚지만 이름을 붙이지 못하는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"2학년 때 이런 걸 배웠어요", content:"**곧은 선 3개**로 둘러싸인 도형은 **삼각형**.\n**곧은 선 4개**로 둘러싸인 도형은 **사각형**.", note:"👉 둘 다 **곧은 선**으로만 둘러싸여 있어요."}, suggested_extras:["q_l1_recall"], tnote:{ask:["삼각형과 사각형은 무엇이 다른가요?","둘의 같은 점은 무엇인가요?"], watch:"굽은 선이 섞인 그림도 삼각형이라 부르는 경우", min:3}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"변과 꼭짓점", content:"도형을 이루는 **곧은 선**을 **변**이라고 해요.\n두 변이 만나는 점을 **꼭짓점**이라고 해요.", items:[{emoji:"🔺", count:1, label:"**삼각형**\n변 3개 · 꼭짓점 3개"},{emoji:"🟦", count:1, label:"**사각형**\n변 4개 · 꼭짓점 4개"}], note:"👉 변의 수와 꼭짓점의 수는 서로 같아요."}, suggested_extras:["e_l1_count","t_l1_name"], tnote:{ask:["삼각형의 변은 몇 개인가요?","변과 꼭짓점의 수는 왜 같을까요?"], watch:"꼭짓점을 '뾰족한 곳'으로만 알고 점으로 짚지 못하는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"등굣길에서 도형을 찾아요", content:"**표지판**에서 삼각형, **횡단보도**에서 사각형, **옐로카펫**에서 삼각형을 찾을 수 있어요.", note:"👉 생활 속 물건에도 도형의 성질이 그대로 들어 있어요."}, suggested_extras:["r_l1_road","q_l1_find"], tnote:{ask:["학교 오는 길에서 또 어떤 도형을 보았나요?","왜 표지판을 삼각형으로 만들었을까요?"], watch:"둥근 표지판까지 삼각형이라 말하는 경우", min:3}},
      {id:"s07", stage:"전개", block:"concept", data:{title:"이 단원에서 배울 내용", content:"**선분·반직선·직선** → **각·직각** → **직각삼각형** → **직사각형·정사각형**", note:"👉 전에 배운 도형을 더 자세히 배우고, 새로운 도형도 만나요."}, suggested_extras:["t_l1_map","c_l1_prep"], tnote:{ask:["이름만 보고 어떤 도형일지 짐작해 볼까요?","가장 궁금한 이름은 무엇인가요?"], watch:"이름이 낯설어 미리 어렵다고 말하는 아이 — 짐작만으로 충분하다고 안심시킬 것", min:3}},
      {id:"s08", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"세 곳이 뾰족하기만 하면 **굽은 선**이 섞여 있어도 삼각형이라고 생각한다.", right:"삼각형은 **곧은 선 3개**로만 둘러싸인 도형이에요. 한 곳이라도 굽어 있으면 삼각형이 아니에요.", hint:"굽은 선이 하나 섞인 그림을 함께 보여 주고 손가락으로 선을 따라 짚게 하면 금방 가려냅니다."}, suggested_extras:["x_l1_curve","t_l1_name"], tnote:{ask:["이 그림은 왜 삼각형이 아닐까요?","선을 손가락으로 따라가 볼까요?"], watch:"뾰족한 곳의 수만 세고 선의 모양은 보지 않는 경우", min:4}},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"변을 세어요", scenario:{icon:"🔺", body:"곰이가 표지판에서 삼각형을 찾았어요."}, question:"삼각형의 변은 몇 개일까요?", input:"count_input", answer:3, note:"풀이: 삼각형은 곧은 선 3개로 둘러싸여 있어요 → 변은 **3개**"}, suggested_extras:["e_l1_count"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"꼭짓점을 세어요", scenario:{icon:"🔺", body:"같은 삼각형을 다시 봐요."}, question:"삼각형의 꼭짓점은 몇 개일까요?", input:"count_input", answer:3, note:"풀이: 두 변이 만나는 점이 꼭짓점 → 삼각형은 **3개**"}, suggested_extras:["e_l1_count"]},
      {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"사각형을 살펴요", scenario:{icon:"🟦", body:"펭이가 횡단보도의 흰 칸을 살펴봐요."}, question:"사각형의 꼭짓점은 몇 개일까요?", input:"count_input", answer:4, note:"풀이: 사각형은 변도 4개, 꼭짓점도 **4개**"}, suggested_extras:["q_l1_recall"]},
      {id:"s12", stage:"기본문제", block:"leveled_problem", data:{title:"도형을 말로 설명해요", levels:{"기본":{q:"삼각형의 변과 꼭짓점은 각각 몇 개인지 말해 봐요.", a:"변 3개, 꼭짓점 3개", steps:["둘러싼 곧은 선을 하나씩 짚으며 센다","두 변이 만나는 점을 하나씩 짚으며 센다","변 3개, 꼭짓점 3개"]},"도전":{q:"사각형의 변과 꼭짓점은 각각 몇 개인지 말해 봐요.", a:"변 4개, 꼭짓점 4개", steps:["곧은 선 4개를 짚어 센다","만나는 점 4개를 짚어 센다","변 4개, 꼭짓점 4개"]},"심화":{q:"교실에서 삼각형과 사각형을 하나씩 찾고, 변과 꼭짓점을 세어 짝에게 설명해 봐요.", a:"여러 답 (예: 창문 = 사각형, 변 4개 · 꼭짓점 4개)", open:true}}}, suggested_extras:["g_l1_hunt","q_l1_find"], tnote:{ask:["어디부터 세기 시작하면 헷갈리지 않을까요?","센 것을 표시하며 세면 무엇이 좋아질까요?"], watch:"같은 변을 두 번 세거나 한 변을 빠뜨리는 경우", min:5}},
      {id:"s13", stage:"응용문제", block:"offline_activity", data:{title:"교실 도형 찾기 지도 만들기", type:"group", goal:"교실·복도에서 삼각형과 사각형을 찾아 모둠 지도에 표시하고, 변과 꼭짓점의 수를 적기", steps:["모둠에서 교실·복도를 돌며 삼각형 두 개, 사각형 세 개를 찾는다","모둠 판에 자리를 간단히 그리고 찾은 도형을 표시한다","각 도형 옆에 변의 수와 꼭짓점의 수를 적는다","가장 찾기 어려웠던 도형을 모둠끼리 이야기한다"], materials:["모둠 판","네임펜"], minutes:7}, suggested_extras:["g_l1_hunt","r_l1_class"], tnote:{ask:["왜 그 물건을 그 도형이라고 정했나요?","둥근 것은 왜 넣지 않았나요?"], watch:"모서리가 둥근 물건을 사각형으로 넣는 모둠 — 곧은 선인지 함께 짚어 줄 것", min:7}},
      {id:"s14", stage:"응용문제", block:"real_world", data:{title:"길에는 도형이 가득해요", scenario:{icon:"🚸", body:"삼각형 표지판은 '조심하세요', 사각형 안내판은 '알려 드려요' — 모양이 뜻을 나르기도 해요."}, content:"길에서 도형을 알아보는 힘은 **안전**과도 이어져요. 모양만 보고도 무엇을 알리는 표지인지 짐작할 수 있으니까요."}, suggested_extras:["r_l1_road","b_l1_shape"]},
      {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 지도를 살펴요", context:"곰이가 등굣길 지도에 삼각형 2개와 사각형 3개를 그렸어요.", challenge:"곰이가 그린 도형들의 꼭짓점은 모두 몇 개일까요? 어떻게 세었는지도 말해 봐요.", note:"풀이: 삼각형 꼭짓점 3 + 3 = 6. 사각형 꼭짓점은 4 + 4 = 8, 8 + 4 = 12. 모두 6 + 12 = **18개**"}, suggested_extras:["e_l1_count","q_l1_more"], tnote:{ask:["도형을 하나씩 나누어 세면 무엇이 좋을까요?","한꺼번에 세면 왜 헷갈릴까요?"], watch:"삼각형과 사각형을 구분하지 않고 뭉뚱그려 세는 경우", min:4}},
      {id:"s16", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"곧은 선 3개로 둘러싸인 도형의 이름은?", a:"삼각형"},{q:"도형을 이루는 곧은 선을 무엇이라고 하나요?", a:"변"},{q:"두 변이 만나는 점을 무엇이라고 하나요?", a:"꼭짓점"}], self:["도형의 변과 꼭짓점을 셀 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**삼각형**은 곧은 선 3개, **사각형**은 곧은 선 4개로 둘러싸인 도형이다.","도형을 이루는 곧은 선은 **변**, 두 변이 만나는 점은 **꼭짓점**이다.","변의 수와 꼭짓점의 수는 서로 같다.","곰이와 펭이의 등굣길 도형 지도가 시작됐다."], arrows:["곧은 선","변과 꼭짓점","삼각형·사각형"]}, suggested_extras:["r_l1_class"]},
      {id:"s18", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 변과 꼭짓점이 무엇인지 알게 되었나요?","🔧 과정·기능 — 도형의 변과 꼭짓점을 셀 수 있나요?","💛 가치·태도 — 생활 속 도형을 찾아보고 싶어졌나요?"], prompts:["오늘 새로 알게 된 말은 무엇인가요?"]}, suggested_extras:["c_l1_prep"]},
      {id:"s19", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"곧은 선을 더 자세히 나눠 봐요. **선분·반직선·직선**이 어떻게 다른지 알아봐요.", emoji:"📏"}, suggested_extras:["c_l1_prep"]}
    ],
    extras: [
      {id:"v_l1_intro", type:"video", icon:"🎥", title:"평면도형 단원 미리보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%ED%8F%89%EB%A9%B4%EB%8F%84%ED%98%95", description:"단원 전체 흐름을 훑는 도입 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","objective"]},
      {id:"v_l1_side", type:"video", icon:"🎥", title:"변과 꼭짓점 알아보기", url:"https://www.youtube.com/results?search_query=%EB%B3%80%EA%B3%BC+%EA%BC%AD%EC%A7%93%EC%A0%90", description:"변과 꼭짓점을 짚어 가며 세는 짧은 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","basic_problem"]},
      {id:"q_l1_find", type:"fun_question", icon:"💡", title:"등굣길 도형 찾기", content:"학교에 오는 길에서 본 삼각형과 사각형을 떠올려 봐요. 어느 쪽이 더 많았나요?", fit_slides:["motivate","offline_activity"]},
      {id:"q_l1_recall", type:"fun_question", icon:"💡", title:"2학년 도형 떠올리기", content:"2학년 때 삼각형과 사각형을 어떻게 가려냈나요? 그때 쓴 방법이 지금도 통할까요?", fit_slides:["concept","basic_problem"]},
      {id:"q_l1_more", type:"fun_question", icon:"💡", title:"변이 더 많아지면", content:"곧은 선 5개로 둘러싸인 도형도 있을까요? 그 도형의 꼭짓점은 몇 개일까요?", fit_slides:["advanced_problem","summary"]},
      {id:"q_l1_why", type:"fun_question", icon:"💡", title:"왜 곧은 선이어야 할까", content:"굽은 선으로만 둘러싸인 도형에는 꼭짓점이 있을까요? 왜 그렇게 생각하나요?", fit_slides:["misconception","concept"]},
      {id:"q_l1_pair", type:"fun_question", icon:"💡", title:"짝에게 내는 문제", content:"교실 물건 하나를 골라 '변이 몇 개일까?'를 짝에게 물어봐요. 어떤 물건이 가장 어려웠나요?", fit_slides:["leveled_problem","offline_activity"]},
      {id:"t_l1_map", type:"tip", icon:"🧩", title:"단원 지도를 붙여 두기", content:"선 → 각·직각 → 직각삼각형 → 직사각형·정사각형. 칠판 한쪽에 붙여 두고 매 차시 짚으면 아이가 지금 어디쯤인지 압니다.", fit_slides:["objective","summary"]},
      {id:"t_l1_name", type:"tip", icon:"🧩", title:"손가락으로 선 따라가기", content:"도형을 셀 때 눈으로만 보게 하지 말고 손가락으로 변을 따라 짚게 하면 중복·누락이 크게 줄어듭니다.", fit_slides:["concept","misconception"]},
      {id:"t_l1_mark", type:"tip", icon:"🧩", title:"센 곳에 표시하기", content:"센 변에 작은 점을 찍게 하면 같은 변을 두 번 세는 실수를 막을 수 있습니다.", fit_slides:["basic_problem","leveled_problem"]},
      {id:"t_l1_safe", type:"tip", icon:"🧩", title:"교통안전과 묶어 말하기", content:"이 단원의 장면은 등굣길입니다. 도형 이야기 사이에 안전 규칙을 한 줄씩 곁들이면 자연스럽게 생활 지도가 됩니다.", fit_slides:["motivate","real_world"]},
      {id:"e_l1_count", type:"extension", icon:"⬆", title:"변과 꼭짓점 표 만들기", content:"삼각형·사각형·오각형의 변과 꼭짓점 수를 표로 적어 보면 두 수가 늘 같다는 규칙이 드러납니다.", fit_slides:["concept","advanced_problem"]},
      {id:"e_l1_fold", type:"extension", icon:"⬆", title:"종이 접어 도형 만들기", content:"색종이를 접고 잘라 삼각형과 사각형을 만들어 보면 변의 수가 손끝으로 느껴집니다.", fit_slides:["offline_activity","concept"]},
      {id:"g_l1_hunt", type:"game", icon:"🎮", title:"도형 찾기 술래", content:"교사가 '변 4개!'라고 외치면 그 조건에 맞는 물건을 먼저 찾아 짚는 놀이. 모둠 대항으로 하면 더 신납니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l1_card", type:"game", icon:"🎮", title:"도형 카드 맞히기", content:"도형 그림 카드를 뒤집어 놓고, 뽑은 카드의 변과 꼭짓점 수를 먼저 말한 사람이 카드를 가져갑니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l1_road", type:"real_world", icon:"🌍", title:"표지판 모양의 뜻", content:"삼각형 표지판은 조심할 곳, 사각형 안내판은 알려 주는 곳을 나타내는 경우가 많습니다. 모양이 정보를 나르는 셈입니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l1_class", type:"real_world", icon:"🌍", title:"교실 속 도형", content:"창문·칠판·책상·급식판 — 교실 물건 대부분이 사각형입니다. 왜 사각형이 많은지 이야기해 보면 재미있습니다.", fit_slides:["offline_activity","summary"]},
      {id:"r_l1_build", type:"real_world", icon:"🌍", title:"집을 짓는 도형", content:"지붕은 삼각형, 벽과 창은 사각형인 집이 많습니다. 모양마다 쓰임이 다르기 때문입니다.", fit_slides:["real_world","concept"]},
      {id:"b_l1_shape", type:"book", icon:"📖", title:"도형 그림책 찾아보기", content:"도서관에서 '모양'이나 '도형'이 제목에 든 그림책을 찾아 함께 봅니다. 그림 속 도형을 짚으며 읽으면 좋습니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l1_curve", type:"misconception", icon:"❓", title:"굽은 선이 섞이면", content:"뾰족한 곳이 세 곳이어도 굽은 선이 섞여 있으면 삼각형이 아닙니다. 선의 모양을 먼저 보게 하세요.", fit_slides:["misconception","concept"]},
      {id:"x_l1_corner", type:"misconception", icon:"❓", title:"꼭짓점은 점이다", content:"꼭짓점을 '뾰족한 부분'이라는 넓은 영역으로 여기는 아이가 많습니다. 점 하나로 콕 짚게 하세요.", fit_slides:["concept","basic_problem"]},
      {id:"c_l1_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"자와 삼각자를 챙겨 오게 합니다. 다음 시간부터 곧은 선을 직접 긋습니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l02 — 선의 종류 ══════════════════ */
  window.LESSONS["u2_l02"] = {
    meta: { grade:3, subject:"수학", unit:2, n:2, title:"선의 종류", std:"[4수02-01]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_02_선의종류.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"선의 종류\n곧은 선에도 이름이 있어요", emoji:"📏"}, suggested_extras:["v_l2_line"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"도형을 이루는 **곧은 선**은 **변**, 두 변이 만나는 점은 **꼭짓점**이라고 했어요.", items:[{q:"곧은 선 3개로 둘러싸인 도형의 이름은?", a:"삼각형"},{q:"도형을 이루는 곧은 선을 무엇이라고 하나요?", a:"변"},{q:"두 변이 만나는 점을 무엇이라고 하나요?", a:"꼭짓점"}], from:"u2_l01"}, suggested_extras:["q_l2_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 지도 위의 선을 살펴봐요", kids:[{face:"🐻", label:"곰이\n\"이 선은 곧아\""},{face:"🐧", label:"펭이\n\"이건 구불구불한데?\""}], question:"지도에는 **곧은 선**도 있고 **굽은 선**도 있어요. 오늘은 곧은 선을 자세히 나눠 봐요.", img:"assets/photo/math/straight_lines.jpg"}, suggested_extras:["q_l2_kind","t_l2_ruler"], tnote:{ask:["곧은 선과 굽은 선을 어떻게 가려낼까요?","자로 그을 수 있는 선은 어느 쪽인가요?"], watch:"살짝 휜 선을 곧은 선이라 말하는 경우 — 자를 대어 확인시킬 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"두 점을 곧게 이으면 선분", content:"두 점을 곧게 이은 선을 **선분**이라고 해요.\n점 ㄱ과 점 ㄴ을 이었으면 **선분 ㄱㄴ**이에요.", note:"👉 **선분 ㄱㄴ**과 **선분 ㄴㄱ**은 같은 선이에요."}, suggested_extras:["e_l2_draw","t_l2_ruler"], tnote:{ask:["선분의 끝은 몇 곳에서 정해져 있나요?","선분 ㄴㄱ이라고 불러도 될까요?"], watch:"두 점을 잇지 않고 아무 데서나 그은 선을 선분이라 부르는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"한쪽으로 끝없이 늘이면 반직선", content:"점 ㄱ에서 시작해 점 ㄴ을 지나 **한쪽으로 끝없이** 늘인 곧은 선을 **반직선 ㄱㄴ**이라고 해요.", note:"👉 **시작점을 먼저** 읽어요. 그래서 반직선 ㄱㄴ과 반직선 ㄴㄱ은 서로 다른 선이에요."}, suggested_extras:["x_l2_order","q_l2_start"], tnote:{ask:["시작점은 어느 점인가요?","이름을 거꾸로 읽으면 무엇이 달라질까요?"], watch:"시작점을 뒤에 읽어 이름을 뒤집는 경우 — 이 차시 최대 오답", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"양쪽으로 끝없이 늘이면 직선", content:"점 ㄱ과 점 ㄴ을 지나 **양쪽으로 끝없이** 늘인 곧은 선을 **직선 ㄱㄴ**이라고 해요.", note:"👉 **직선 ㄱㄴ**과 **직선 ㄴㄱ**은 같은 선이에요."}, suggested_extras:["e_l2_endless","q_l2_kind"], tnote:{ask:["직선은 어디에서 끝나나요?","공책에 그린 선은 정말 끝이 없나요?"], watch:"공책에 그린 짧은 선을 보고 '끝이 있다'고 말하는 경우 — 약속임을 짚어 줄 것", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**반직선 ㄱㄴ**과 **반직선 ㄴㄱ**을 같은 선이라고 생각한다.", right:"반직선은 **시작점**이 정해져 있어요. 시작점이 다르면 늘어나는 쪽도 반대라서 **서로 다른 선**이에요.", hint:"화살표를 그려 시작점에 동그라미를 치게 하면 두 이름의 차이가 눈에 들어옵니다."}, suggested_extras:["x_l2_order","t_l2_arrow"], tnote:{ask:["두 반직선은 어디가 다른가요?","시작점을 바꾸면 선이 어느 쪽으로 뻗나요?"], watch:"선분·직선의 규칙을 반직선에도 그대로 적용하는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"이 선의 이름은 ①", scenario:{icon:"📏", body:"점 ㄱ과 점 ㄴ을 곧게 이었어요. 양쪽 끝이 점에서 딱 멈춰 있어요."}, question:"이 선의 이름은 무엇일까요?", input:"count_input", answer:"선분 ㄱㄴ", note:"풀이: 두 점을 곧게 이었고 끝이 정해져 있으므로 **선분 ㄱㄴ**"}, suggested_extras:["q_l2_recall"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"이 선의 이름은 ②", scenario:{icon:"📏", body:"점 ㄱ에서 시작해 점 ㄴ쪽으로만 끝없이 뻗어 있어요."}, question:"이 선의 이름은 무엇일까요?", input:"count_input", answer:"반직선 ㄱㄴ", note:"풀이: 시작점이 ㄱ이고 한쪽으로만 끝없으므로 **반직선 ㄱㄴ**"}, suggested_extras:["q_l2_start"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"이 선의 이름은 ③", scenario:{icon:"📏", body:"점 ㄱ과 점 ㄴ을 지나 양쪽 모두 끝없이 뻗어 있어요."}, question:"이 선의 이름은 무엇일까요?", input:"count_input", answer:"직선 ㄱㄴ", note:"풀이: 양쪽으로 끝없이 늘였으므로 **직선 ㄱㄴ**"}, suggested_extras:["e_l2_endless"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"이름을 붙여 봐요", levels:{"기본":{q:"두 점 ㄱ과 ㄴ을 곧게 이은 선의 이름을 말해 봐요.", a:"선분 ㄱㄴ", steps:["두 점을 잇는 곧은 선인지 본다","끝이 두 점에서 멈추는지 본다","선분 ㄱㄴ (선분 ㄴㄱ이라고 해도 같다)"]},"도전":{q:"점 ㄴ에서 시작해 점 ㄱ을 지나 한쪽으로 끝없이 늘인 선의 이름은 무엇일까요?", a:"반직선 ㄴㄱ", steps:["시작점을 먼저 찾는다 → 점 ㄴ","지나는 점을 뒤에 읽는다 → 점 ㄱ","반직선 ㄴㄱ"]},"심화":{q:"자를 대고 선분·반직선·직선을 하나씩 그린 뒤, 짝에게 이름을 맞혀 보게 해요. 어떻게 그려야 헷갈리지 않을까요?", a:"여러 답 (예: 끝을 점으로 찍고 끝없는 쪽은 화살표로 그린다)", open:true}}}, suggested_extras:["e_l2_draw","g_l2_quiz"], tnote:{ask:["이름을 붙일 때 무엇부터 보아야 할까요?","시작점을 어떻게 나타내면 좋을까요?"], watch:"세 갈래 이름을 외우기만 하고 그림과 맞추지 못하는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"실과 자로 세 갈래 선 만들기", type:"pair", goal:"자로 선분을 긋고, 실을 늘여 반직선과 직선을 몸으로 나타내기", steps:["짝과 함께 자로 공책에 선분을 하나 긋고 양 끝에 점을 찍는다","실 한 가닥을 잡고 한 사람만 손을 놓아 한쪽으로 늘여 반직선을 나타낸다","두 사람이 모두 손을 놓아 양쪽으로 늘여 직선을 나타낸다","세 갈래가 어떻게 다른지 짝에게 말한다"], materials:["자","실","공책"], minutes:7}, suggested_extras:["t_l2_arrow","q_l2_kind"], tnote:{ask:["실을 한쪽만 놓으면 어느 선이 되나요?","공책 밖으로 나가는 선은 어떻게 그릴까요?"], watch:"실 활동만 즐기고 이름과 연결 짓지 못하는 짝 — 활동마다 이름을 소리 내어 말하게 할 것", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"길과 선", scenario:{icon:"🛣️", body:"도로의 흰 줄, 횡단보도의 칸, 철길 — 모두 곧게 그은 선이에요."}, content:"길을 그릴 때는 **곧은 선**이 많이 쓰여요. 곧게 그으면 짧고, 알아보기 쉽고, 지키기도 쉽기 때문이에요."}, suggested_extras:["r_l2_road","b_l2_map"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"펭이의 이름 붙이기", context:"펭이가 점 ㄱ에서 시작해 점 ㄴ을 지나 한쪽으로 끝없이 늘인 선을 그렸어요.", challenge:"펭이가 이 선을 '반직선 ㄴㄱ'이라고 불렀어요. 맞을까요? 왜 그렇게 생각하나요?", note:"풀이: 틀렸어요. 시작점이 점 ㄱ이므로 **반직선 ㄱㄴ**이라고 불러야 해요."}, suggested_extras:["x_l2_order"], tnote:{ask:["시작점은 어느 점인가요?","이름의 앞자리에는 무엇을 쓰나요?"], watch:"'둘 다 된다'고 얼버무리는 경우 — 시작점 하나로 판정하게 할 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"두 점을 곧게 이은 선의 이름은?", a:"선분"},{q:"한쪽으로만 끝없이 늘인 곧은 선의 이름은?", a:"반직선"},{q:"반직선 ㄱㄴ과 반직선 ㄴㄱ은 같은 선인가요?", a:"달라요 (시작점이 달라요)"}], self:["세 갈래 선을 가려낼 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**선분** = 두 점을 곧게 이은 선","**반직선** = 한쪽으로 끝없이 늘인 곧은 선 (**시작점을 먼저** 읽는다)","**직선** = 양쪽으로 끝없이 늘인 곧은 선","셋 다 **곧은 선**이고, 끝이 정해진 정도가 다르다"], arrows:["선분","반직선","직선"]}, suggested_extras:["r_l2_road"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 세 갈래 선의 뜻을 알게 되었나요?","🔧 과정·기능 — 그림을 보고 이름을 붙일 수 있나요?","💛 가치·태도 — 자를 바르게 쓰려고 애썼나요?"], prompts:["가장 헷갈렸던 이름은 무엇이었나요?"]}, suggested_extras:["c_l2_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"반직선 두 개가 한 점에서 만나면 어떤 도형이 될까요? **각**을 알아봐요.", emoji:"📐"}, suggested_extras:["c_l2_prep"]}
    ],
    extras: [
      {id:"v_l2_line", type:"video", icon:"🎥", title:"선분·반직선·직선 알아보기", url:"https://www.youtube.com/results?search_query=%EC%84%A0%EB%B6%84+%EB%B0%98%EC%A7%81%EC%84%A0+%EC%A7%81%EC%84%A0", description:"세 갈래 선을 그림으로 견주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","cover"]},
      {id:"v_l2_ruler", type:"video", icon:"🎥", title:"자로 곧은 선 긋기", url:"https://www.youtube.com/results?search_query=%EC%9E%90%EB%A1%9C+%EC%84%A0%EB%B6%84+%EA%B7%B8%EB%A6%AC%EA%B8%B0", description:"자를 누르고 긋는 손 모양을 보여 주는 짧은 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["offline_activity","concept"]},
      {id:"q_l2_recall", type:"fun_question", icon:"💡", title:"변도 곧은 선이었지요", content:"지난 시간에 배운 **변**도 곧은 선이었어요. 그럼 변은 오늘 배운 셋 중 무엇에 가까울까요?", fit_slides:["review","concept"]},
      {id:"q_l2_kind", type:"fun_question", icon:"💡", title:"굽은 선은 어디에", content:"우리 주변에서 굽은 선은 어디에 쓰일까요? 곧은 선이 더 좋은 곳은 어디일까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l2_start", type:"fun_question", icon:"💡", title:"시작점이 왜 중요할까", content:"이름을 거꾸로 읽으면 왜 다른 선이 될까요? 화살표를 떠올려 말해 봐요.", fit_slides:["concept","misconception"]},
      {id:"q_l2_far", type:"fun_question", icon:"💡", title:"끝없이 간다면", content:"직선을 계속 늘이면 교실 밖, 학교 밖, 그 너머까지 갈까요? '끝없이'는 어떤 약속일까요?", fit_slides:["concept","summary"]},
      {id:"q_l2_pair", type:"fun_question", icon:"💡", title:"짝 문제 만들기", content:"세 갈래 중 하나를 몰래 그려 짝에게 이름을 맞히게 해 봐요. 어떤 그림이 가장 어려웠나요?", fit_slides:["leveled_problem","offline_activity"]},
      {id:"t_l2_ruler", type:"tip", icon:"🧩", title:"자를 누르는 손", content:"자를 누르는 손가락을 넓게 펴게 하면 선이 휘지 않습니다. 곧은 선의 첫걸음은 손 모양입니다.", fit_slides:["motivate","concept"]},
      {id:"t_l2_arrow", type:"tip", icon:"🧩", title:"화살표 약속 정하기", content:"끝없는 쪽은 화살표, 멈추는 쪽은 점. 학급에서 이 약속을 정해 두면 그림만 보고도 이름을 말할 수 있습니다.", fit_slides:["misconception","offline_activity"]},
      {id:"t_l2_read", type:"tip", icon:"🧩", title:"소리 내어 읽히기", content:"'반직선 ㄱㄴ'을 손가락으로 시작점부터 짚으며 소리 내어 읽게 하면 순서가 몸에 뱁니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l2_board", type:"tip", icon:"🧩", title:"세 갈래를 나란히 붙이기", content:"세 그림을 나란히 붙여 두고 매번 같은 순서로 짚으면 아이가 갈래를 자리로 기억합니다.", fit_slides:["summary","review"]},
      {id:"e_l2_draw", type:"extension", icon:"⬆", title:"점 세 개로 여러 선 긋기", content:"점 세 개를 찍고 두 개씩 골라 선분을 그으면 몇 개가 나올까요? 세 개가 나옵니다.", fit_slides:["leveled_problem","concept"]},
      {id:"e_l2_endless", type:"extension", icon:"⬆", title:"끝없음을 몸으로", content:"운동장에서 줄을 서서 한쪽으로 계속 이어 서 보면 '한쪽으로 끝없이'가 무슨 뜻인지 느껴집니다.", fit_slides:["concept","offline_activity"]},
      {id:"g_l2_quiz", type:"game", icon:"🎮", title:"이름 맞히기 빠르게", content:"교사가 그림을 잠깐 보여 주면 모둠이 이름을 먼저 외치는 놀이. 시작점이 있는 그림에서 승부가 갈립니다.", fit_slides:["leveled_problem","basic_problem"]},
      {id:"g_l2_body", type:"game", icon:"🎮", title:"몸으로 만드는 선", content:"두 사람이 팔을 뻗어 선분, 한 사람만 팔을 뻗어 반직선, 둘 다 뻗어 직선을 나타내는 몸 놀이입니다.", fit_slides:["offline_activity","summary"]},
      {id:"r_l2_road", type:"real_world", icon:"🌍", title:"도로의 흰 줄", content:"차선과 횡단보도의 줄은 모두 곧게 긋습니다. 곧아야 멀리서도 한눈에 보이기 때문입니다.", fit_slides:["real_world","motivate"]},
      {id:"r_l2_light", type:"real_world", icon:"🌍", title:"빛도 곧게 간다", content:"손전등 불빛은 곧게 나아갑니다. 시작점이 있고 한쪽으로 뻗으니 반직선과 닮았습니다.", fit_slides:["concept","real_world"]},
      {id:"r_l2_rail", type:"real_world", icon:"🌍", title:"철길과 곧은 선", content:"철길은 되도록 곧게 놓습니다. 곧을수록 흔들림이 적고 빨리 갈 수 있기 때문입니다.", fit_slides:["real_world","summary"]},
      {id:"b_l2_map", type:"book", icon:"📖", title:"지도 그림책 보기", content:"지도가 나오는 그림책을 함께 보며 곧은 선과 굽은 선을 손가락으로 짚어 봅니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l2_order", type:"misconception", icon:"❓", title:"이름 순서 뒤집기", content:"반직선만 이름 순서가 뜻을 바꿉니다. 선분·직선은 뒤집어도 같다는 점까지 함께 짚어 주세요.", fit_slides:["misconception","advanced_problem"]},
      {id:"x_l2_short", type:"misconception", icon:"❓", title:"짧으면 선분이다?", content:"길이로 갈래를 정한다고 여기는 아이가 있습니다. 갈래를 가르는 것은 길이가 아니라 끝의 정해짐입니다.", fit_slides:["concept","basic_problem"]},
      {id:"c_l2_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"자와 색연필을 챙기게 합니다. 다음 시간에는 두 반직선으로 도형을 만듭니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l03 — 각을 알아볼까요 ══════════════════ */
  window.LESSONS["u2_l03"] = {
    meta: { grade:3, subject:"수학", unit:2, n:3, title:"각을 알아볼까요", std:"[4수02-02]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_03_각을알아볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"각을 알아볼까요\n뾰족한 모양에도 이름이 있어요", emoji:"📐"}, suggested_extras:["v_l3_angle"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"곧은 선을 **선분·반직선·직선** 세 갈래로 나누고, 반직선은 **시작점을 먼저** 읽는다고 했어요.", items:[{q:"두 점을 곧게 이은 선의 이름은?", a:"선분"},{q:"한쪽으로만 끝없이 늘인 곧은 선의 이름은?", a:"반직선"},{q:"반직선 ㄱㄴ과 반직선 ㄴㄱ은 같은 선인가요?", a:"달라요 (시작점이 달라요)"}], from:"u2_l02"}, suggested_extras:["q_l3_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 뾰족한 곳을 모았어요", kids:[{face:"🐻", label:"곰이\n\"표지판 끝이 뾰족해\""},{face:"🐧", label:"펭이\n\"책 모서리도 그래\""}], question:"뾰족한 모양들의 **같은 점**은 무엇일까요? 무엇이 어떻게 만나고 있나요?", img:"assets/photo/math/angle_corner.jpg"}, suggested_extras:["q_l3_sharp","t_l3_touch"], tnote:{ask:["뾰족한 곳에서는 무엇과 무엇이 만나나요?","만나는 곳은 점인가요, 선인가요?"], watch:"'뾰족하다'는 느낌만 말하고 선이 만난다는 점을 짚지 못하는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"한 점에서 그은 두 반직선 = 각", content:"한 점에서 그은 **두 반직선**으로 이루어진 도형을 **각**이라고 해요.\n이 도형은 **각 ㄱㄴㄷ**이에요.", note:"👉 반직선 두 개가 한 점에서 만나야 각이 돼요."}, suggested_extras:["e_l3_two","q_l3_recall"], tnote:{ask:["각을 이루는 것은 무엇 두 개인가요?","선분 두 개로도 각이라고 부를 수 있을까요?"], watch:"굽은 선이 만나는 곳도 각이라 부르는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"각의 꼭짓점과 변", content:"두 반직선이 만나는 점 **ㄴ**이 **각의 꼭짓점**이에요.\n두 반직선 **변 ㄴㄱ**과 **변 ㄴㄷ**이 **각의 변**이에요.", note:"👉 변은 늘 **2개**, 꼭짓점은 **1개**예요."}, suggested_extras:["t_l3_mark","e_l3_two"], tnote:{ask:["각의 꼭짓점은 어느 점인가요?","각의 변은 몇 개인가요?"], watch:"도형의 꼭짓점과 각의 꼭짓점을 헷갈리는 경우 — 각에서는 하나뿐임을 짚을 것", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"각을 읽는 방법", content:"각을 읽을 때는 **꼭짓점이 가운데** 오도록 읽어요.\n**각 ㄱㄴㄷ** = **각 ㄷㄴㄱ** (꼭짓점 ㄴ이 가운데로 같아요).", note:"👉 각 ㄱㄷㄴ처럼 꼭짓점이 가운데가 아니면 잘못 읽은 거예요."}, suggested_extras:["x_l3_read","t_l3_mark"], tnote:{ask:["가운데 자리에는 무엇을 읽나요?","각 ㄱㄷㄴ은 왜 안 될까요?"], watch:"세 글자를 아무 순서로나 읽는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**변이 길수록 큰 각**이라고 생각한다.", right:"변은 반직선이라 끝없이 늘어나요. 그래서 변의 길이가 달라도 **벌어진 정도**가 같으면 **같은 각**이에요.", hint:"같은 벌어짐으로 변만 길게 그린 그림 두 개를 겹쳐 보이면 곧 알아챕니다."}, suggested_extras:["x_l3_long","q_l3_same"], tnote:{ask:["두 그림에서 벌어진 정도는 어떤가요?","변을 더 길게 그리면 각이 달라질까요?"], watch:"그림의 크기만 보고 각을 견주는 경우 — 이 차시 최대 오답", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"꼭짓점을 찾아요", scenario:{icon:"📐", body:"곰이가 각 ㄱㄴㄷ을 그렸어요."}, question:"각 ㄱㄴㄷ의 꼭짓점은 어느 점일까요?", input:"count_input", answer:"점 ㄴ", note:"풀이: 두 반직선이 만나는 점이 꼭짓점 → 가운데로 읽은 **점 ㄴ**"}, suggested_extras:["t_l3_mark"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"바르게 읽어요", scenario:{icon:"📐", body:"꼭짓점이 ㄴ인 각이에요."}, question:"이 각을 바르게 읽은 것은 무엇일까요?", input:"count_input", answer:"각 ㄱㄴㄷ", note:"풀이: 꼭짓점 ㄴ이 가운데 오도록 → **각 ㄱㄴㄷ** (각 ㄷㄴㄱ도 같아요)"}, suggested_extras:["x_l3_read"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"변을 세어요", scenario:{icon:"📐", body:"각 ㄱㄴㄷ을 다시 봐요."}, question:"각의 변은 몇 개일까요?", input:"count_input", answer:2, note:"풀이: 변 ㄴㄱ, 변 ㄴㄷ → 모두 **2개**"}, suggested_extras:["e_l3_two"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"각을 읽고 견주어요", levels:{"기본":{q:"각 ㄱㄴㄷ에서 꼭짓점은 어느 점인지 말해 봐요.", a:"점 ㄴ", steps:["두 반직선이 만나는 곳을 찾는다","이름의 가운데 글자를 확인한다","점 ㄴ"]},"도전":{q:"각 ㄱㄴㄷ을 다르게 읽으면 무엇일까요?", a:"각 ㄷㄴㄱ", steps:["꼭짓점 ㄴ은 가운데 자리를 지킨다","양옆 두 글자만 자리를 바꾼다","각 ㄷㄴㄱ"]},"심화":{q:"벌어진 정도는 같고 변의 길이만 다른 각 두 개를 그려 짝에게 보여 주고, 같은 각인지 물어봐요.", a:"여러 답 (같은 각이에요 — 벌어진 정도가 같으니까요)", open:true}}}, suggested_extras:["q_l3_same","g_l3_fan"], tnote:{ask:["가운데 자리에 무엇이 오는지 다시 말해 볼까요?","같은 각인지 어떻게 확인할 수 있을까요?"], watch:"이름은 맞게 읽지만 그림에서 꼭짓점을 못 짚는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"부챗살로 각 만들기", type:"pair", goal:"막대 두 개를 한 점에서 만나게 놓아 여러 각을 만들고, 벌어진 정도를 견주기", steps:["짝과 함께 색연필 두 자루를 한 점에서 만나게 놓는다","한 자루만 천천히 돌려 벌어진 정도를 바꿔 본다","가장 조금 벌어진 각과 가장 많이 벌어진 각을 만들어 본다","길이가 다른 막대로 바꿔 놓고 각이 달라졌는지 이야기한다"], materials:["색연필 두 자루","길이가 다른 막대"], minutes:7}, suggested_extras:["g_l3_fan","x_l3_long"], tnote:{ask:["막대를 길게 바꾸면 각이 커지나요?","무엇이 달라져야 각이 달라지나요?"], watch:"막대를 겹쳐만 놓고 한 점에서 만나게 하지 않는 짝", min:7}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"생활 속에서 각을 찾아요", scenario:{icon:"✂️", body:"가위를 벌린 모양, 시곗바늘 두 개, 접은 부채 — 모두 한 점에서 두 갈래가 뻗어요."}, content:"두 갈래가 한 점에서 만나면 어디서나 **각**을 볼 수 있어요. 벌어진 정도가 달라지면 쓰임도 달라져요."}, suggested_extras:["r_l3_life","b_l3_book"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"펭이가 그린 각", context:"펭이가 각 ㄱㄴㄷ을 그린 뒤 '각 ㄱㄷㄴ'이라고 읽었어요.", challenge:"펭이의 읽기가 맞을까요? 틀렸다면 어떻게 고쳐야 할까요?", note:"풀이: 틀렸어요. 꼭짓점은 ㄴ이므로 가운데에 ㄴ이 와야 해요 → **각 ㄱㄴㄷ**(또는 각 ㄷㄴㄱ)"}, suggested_extras:["x_l3_read"], tnote:{ask:["꼭짓점은 어느 점인가요?","가운데 자리에 무엇이 와야 하나요?"], watch:"글자만 바꾸고 왜 그런지 설명하지 못하는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"각은 한 점에서 그은 무엇 두 개로 이루어지나요?", a:"반직선"},{q:"각 ㄱㄴㄷ의 꼭짓점은 어느 점인가요?", a:"점 ㄴ"},{q:"각 ㄱㄴㄷ을 다르게 읽으면 무엇인가요?", a:"각 ㄷㄴㄱ"}], self:["각을 찾고 바르게 읽을 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**각** = 한 점에서 그은 **두 반직선**으로 이루어진 도형","두 반직선이 만나는 점 = **각의 꼭짓점**, 두 반직선 = **각의 변**","각을 읽을 때는 **꼭짓점이 가운데**","변의 길이가 달라도 **벌어진 정도**가 같으면 같은 각"], arrows:["두 반직선","꼭짓점 가운데","벌어진 정도"]}, suggested_extras:["r_l3_life"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 각이 무엇인지 알게 되었나요?","🔧 과정·기능 — 각의 꼭짓점과 변을 짚을 수 있나요?","💛 가치·태도 — 주변에서 각을 찾아보고 싶어졌나요?"], prompts:["오늘 가장 헷갈렸던 것은 무엇인가요?"]}, suggested_extras:["c_l3_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"여러 각 가운데 유난히 **반듯한 각**이 있어요. 종이를 접어 그 각을 직접 만들어 봐요.", emoji:"📄"}, suggested_extras:["c_l3_prep"]}
    ],
    extras: [
      {id:"v_l3_angle", type:"video", icon:"🎥", title:"각 알아보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%EA%B0%81+%EA%BC%AD%EC%A7%93%EC%A0%90+%EB%B3%80", description:"각의 꼭짓점과 변을 짚어 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","cover"]},
      {id:"v_l3_read", type:"video", icon:"🎥", title:"각 읽는 순서", url:"https://www.youtube.com/results?search_query=%EA%B0%81+%EC%9D%BD%EB%8A%94+%EB%B0%A9%EB%B2%95+%EA%BC%AD%EC%A7%93%EC%A0%90", description:"꼭짓점을 가운데 두고 읽는 방법 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","basic_problem"]},
      {id:"q_l3_recall", type:"fun_question", icon:"💡", title:"반직선이 두 개라면", content:"지난 시간에 배운 반직선을 한 점에서 두 개 그으면 어떤 모양이 될까요?", fit_slides:["review","concept"]},
      {id:"q_l3_sharp", type:"fun_question", icon:"💡", title:"뾰족함의 정체", content:"뾰족하다는 느낌은 어디에서 올까요? 만나는 점과 벌어진 정도 중 무엇 때문일까요?", fit_slides:["motivate","concept"]},
      {id:"q_l3_same", type:"fun_question", icon:"💡", title:"같은 각 찾기", content:"멀리서 본 각과 가까이서 본 각은 다른 각일까요? 왜 그렇게 생각하나요?", fit_slides:["misconception","leveled_problem"]},
      {id:"q_l3_open", type:"fun_question", icon:"💡", title:"가장 많이 벌어지면", content:"두 변을 계속 벌리면 어떻게 될까요? 끝까지 벌리면 어떤 모양이 될까요?", fit_slides:["offline_activity","summary"]},
      {id:"q_l3_life", type:"fun_question", icon:"💡", title:"집에서 찾는 각", content:"집에서 두 갈래가 한 점에서 만나는 물건을 세 가지 찾아봐요. 무엇이 있었나요?", fit_slides:["real_world","offline_activity"]},
      {id:"t_l3_touch", type:"tip", icon:"🧩", title:"만나는 점을 먼저 찍기", content:"각을 그릴 때 꼭짓점을 먼저 찍고 두 반직선을 긋게 하면 '한 점에서 만난다'는 뜻이 몸에 뱁니다.", fit_slides:["motivate","concept"]},
      {id:"t_l3_mark", type:"tip", icon:"🧩", title:"가운데 글자에 동그라미", content:"각 이름의 가운데 글자에 동그라미를 치게 하면 읽기 실수가 크게 줄어듭니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l3_two", type:"tip", icon:"🧩", title:"변은 둘, 꼭짓점은 하나", content:"도형의 꼭짓점 수와 헷갈리기 쉬우니, 각에서는 늘 변 2개·꼭짓점 1개라고 못 박아 주세요.", fit_slides:["concept","summary"]},
      {id:"t_l3_pair", type:"tip", icon:"🧩", title:"짝과 견주게 하기", content:"각을 그린 뒤 짝의 그림과 겹쳐 보게 하면 벌어진 정도를 스스로 견줍니다.", fit_slides:["leveled_problem","offline_activity"]},
      {id:"e_l3_two", type:"extension", icon:"⬆", title:"삼각형 속 각 세기", content:"삼각형 안에는 각이 몇 개 있을까요? 꼭짓점마다 하나씩, 모두 3개입니다.", fit_slides:["concept","basic_problem"]},
      {id:"e_l3_clock", type:"extension", icon:"⬆", title:"시곗바늘로 만드는 각", content:"긴바늘과 짧은바늘이 만드는 벌어짐을 시간마다 살펴보면 각이 계속 달라지는 것을 볼 수 있습니다.", fit_slides:["real_world","offline_activity"]},
      {id:"g_l3_fan", type:"game", icon:"🎮", title:"부채 벌리기 대결", content:"교사가 '조금만 벌려!'라고 하면 모둠이 색연필 두 자루로 그 정도를 만들어 보이는 놀이입니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l3_hunt", type:"game", icon:"🎮", title:"교실 각 찾기", content:"교실에서 각을 먼저 다섯 개 찾아 짚는 모둠이 이깁니다. 찾을 때마다 꼭짓점을 손가락으로 콕 짚게 하세요.", fit_slides:["offline_activity","real_world"]},
      {id:"r_l3_life", type:"real_world", icon:"🌍", title:"가위와 각", content:"가위를 조금 벌리면 얇은 것이, 많이 벌리면 두꺼운 것이 잘립니다. 벌어진 정도가 쓰임을 바꿉니다.", fit_slides:["real_world","motivate"]},
      {id:"r_l3_sign", type:"real_world", icon:"🌍", title:"표지판의 뾰족한 곳", content:"삼각형 표지판의 세 뾰족한 곳이 모두 각입니다. 멀리서도 눈에 띄게 하려고 고른 모양입니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l3_ramp", type:"real_world", icon:"🌍", title:"미끄럼틀의 기울기", content:"미끄럼틀이 바닥과 만나는 곳도 각입니다. 벌어짐이 클수록 가파르고 빠릅니다.", fit_slides:["real_world","summary"]},
      {id:"b_l3_book", type:"book", icon:"📖", title:"모양 이야기 책", content:"도형이 주인공인 그림책을 함께 읽고 나오는 각을 손으로 짚어 봅니다.", fit_slides:["real_world","motivate"]},
      {id:"x_l3_long", type:"misconception", icon:"❓", title:"길면 큰 각이다?", content:"변의 길이는 각의 크기와 상관이 없습니다. 같은 벌어짐에 변만 길게 그린 그림을 꼭 함께 보여 주세요.", fit_slides:["misconception","offline_activity"]},
      {id:"x_l3_read", type:"misconception", icon:"❓", title:"아무 순서로 읽기", content:"각 이름은 가운데 자리가 꼭짓점입니다. 순서를 마음대로 바꾸면 다른 각을 가리키게 됩니다.", fit_slides:["concept","advanced_problem"]},
      {id:"c_l3_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"네모난 종이 두 장과 삼각자를 챙기게 합니다. 다음 시간에는 종이를 접어 봅니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l04 — 직각을 알아볼까요 ══════════════════ */
  window.LESSONS["u2_l04"] = {
    meta: { grade:3, subject:"수학", unit:2, n:4, title:"직각을 알아볼까요", std:"[4수02-02]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_04_직각을알아볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"직각을 알아볼까요\n반듯한 각에는 이름이 있어요", emoji:"📄"}, suggested_extras:["v_l4_right"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"**각**은 한 점에서 그은 두 반직선으로 이루어지고, 읽을 때는 **꼭짓점이 가운데** 온다고 했어요.", items:[{q:"각은 한 점에서 그은 무엇 두 개로 이루어지나요?", a:"반직선"},{q:"각 ㄱㄴㄷ의 꼭짓점은 어느 점인가요?", a:"점 ㄴ"},{q:"각 ㄱㄴㄷ을 다르게 읽으면 무엇인가요?", a:"각 ㄷㄴㄱ"}], from:"u2_l03"}, suggested_extras:["q_l4_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 종이를 접어 봤어요", kids:[{face:"🐻", label:"곰이\n\"반듯하게 두 번 접었어\""},{face:"🐧", label:"펭이\n\"내 것도 똑같은 모양!\""}], question:"누가 접어도 **똑같이 반듯한 각**이 생겼어요. 이 각을 무엇이라고 부를까요?", img:"assets/photo/math/right_angle_fold.jpg"}, suggested_extras:["q_l4_fold","t_l4_fold"], tnote:{ask:["두 사람의 각이 왜 똑같을까요?","반듯하다는 것은 어떤 뜻일까요?"], watch:"접은 자국이 어긋나 각이 반듯하지 않은 아이 — 모서리를 맞춰 접게 할 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"종이를 두 번 접으면 직각", content:"종이를 **반듯하게 두 번** 접었을 때 생기는 각을 **직각**이라고 해요.", note:"👉 직각은 **각**의 한 종류예요. 누가 접어도 언제나 같은 크기예요."}, suggested_extras:["e_l4_fold","t_l4_fold"], tnote:{ask:["몇 번 접었나요?","접는 순서를 말로 설명해 볼까요?"], watch:"한 번만 접고 직각이라 부르는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"직각은 ㄱ자로 표시해요", content:"직각을 나타낼 때는 꼭짓점 **ㄴ**에 작은 **ㄱ자 표시**를 해요.\n이 각은 **직각 ㄱㄴㄷ**이에요.", note:"👉 그림에 ㄱ자 표시가 있으면 '이 각은 직각이에요'라는 뜻이에요."}, suggested_extras:["t_l4_mark","q_l4_mark"], tnote:{ask:["ㄱ자 표시는 어디에 그리나요?","표시가 없으면 직각인지 어떻게 알 수 있을까요?"], watch:"표시를 변 한가운데에 그리는 경우 — 꼭짓점 자리임을 짚을 것", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"삼각자로 직각을 찾아요", content:"**삼각자**에는 직각이 있어요. 찾은 각에 삼각자의 직각 부분을 **맞대어 겹쳐** 보면 직각인지 알 수 있어요.", note:"👉 딱 맞으면 직각, 남거나 모자라면 직각이 아니에요."}, suggested_extras:["e_l4_check","r_l4_life"], tnote:{ask:["삼각자를 어떻게 대어 보아야 할까요?","꼭짓점을 어디에 맞춰야 하나요?"], watch:"삼각자를 대충 얹고 판단하는 경우 — 꼭짓점과 한 변을 먼저 맞추게 할 것", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**변이 길수록 직각이 커진다**고 생각한다.", right:"직각은 언제나 **같은 크기**예요. 변을 길게 그리든 짧게 그리든 벌어진 정도는 그대로예요.", hint:"짧은 변과 긴 변으로 그린 두 그림에 삼각자를 나란히 대어 보이면 곧 알아챕니다."}, suggested_extras:["x_l4_size","q_l4_same"], tnote:{ask:["두 그림에 삼각자를 대면 어떻게 되나요?","무엇이 같고 무엇이 다른가요?"], watch:"그림 크기로 각을 견주는 지난 차시 오답이 되풀이되는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"이 각의 이름은", scenario:{icon:"📄", body:"종이를 반듯하게 두 번 접어 생긴 각이에요."}, question:"이 각의 이름은 무엇일까요?", input:"count_input", answer:"직각", note:"풀이: 반듯하게 두 번 접어 생기는 각 → **직각**"}, suggested_extras:["e_l4_fold"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"몇 번 접었나요", scenario:{icon:"📄", body:"곰이가 직각을 만들려고 종이를 접었어요."}, question:"직각을 만들려면 반듯하게 몇 번 접어야 할까요?", input:"count_input", answer:2, note:"풀이: 반듯하게 **2번** 접으면 직각이 생겨요"}, suggested_extras:["t_l4_fold"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"무엇으로 확인할까요", scenario:{icon:"📐", body:"펭이가 창틀의 각이 직각인지 알아보려고 해요."}, question:"직각이 맞는지 확인할 때 쓰는 도구는 무엇일까요?", input:"count_input", answer:"삼각자", note:"풀이: **삼각자**의 직각 부분을 맞대어 겹쳐 봐요"}, suggested_extras:["e_l4_check"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"직각인지 가려내요", levels:{"기본":{q:"삼각자를 맞대어 보니 딱 맞았어요. 이 각은 직각일까요?", a:"직각이에요", steps:["꼭짓점을 맞춘다","한 변을 맞춘다","다른 변이 딱 겹치면 직각이에요"]},"도전":{q:"삼각자를 맞대어 보니 한쪽이 조금 남았어요. 이 각은 직각일까요?", a:"직각이 아니에요", steps:["꼭짓점과 한 변을 맞춘다","다른 변이 겹치는지 본다","남거나 모자라면 직각이 아니에요"]},"심화":{q:"교실에서 직각을 세 곳 찾아 삼각자로 확인하고, 직각이 아닌 곳도 한 곳 찾아봐요.", a:"여러 답 (예: 직각 = 창틀·책상 모서리·공책 / 직각이 아닌 곳 = 부챗살 벌어진 자리)", open:true}}}, suggested_extras:["g_l4_hunt","t_l4_mark"], tnote:{ask:["무엇부터 맞춰야 정확할까요?","남거나 모자라면 어떻게 판단하나요?"], watch:"'비슷하니까 직각'이라고 넘기는 경우 — 겹침으로 판정하게 할 것", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"내 직각 자 만들기", type:"pair", goal:"종이를 두 번 접어 나만의 직각 자를 만들고, 교실에서 직각을 찾아 확인하기", steps:["종이를 반듯하게 한 번 접고, 접은 선을 맞추어 한 번 더 접는다","생긴 뾰족한 곳이 직각인지 삼각자로 확인한다","내 직각 자를 들고 교실을 돌며 직각을 다섯 곳 찾는다","직각이 아니었던 곳도 한 곳 찾아 짝에게 말한다"], materials:["종이","삼각자"], minutes:8}, suggested_extras:["e_l4_fold","g_l4_hunt"], tnote:{ask:["접은 선을 맞추어 접었나요?","직각이 아닌 곳은 어디였나요?"], watch:"대충 접어 직각이 아닌 자를 만든 짝 — 접은 선을 겹쳐 다시 접게 할 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"생활 속에는 직각이 많아요", scenario:{icon:"🪟", body:"공책 모서리, 창문, 화면, 문 — 둘러보면 직각이 가득해요."}, content:"물건을 **반듯하게 세우고 쌓기** 좋아서 직각이 많이 쓰여요. 건물도 반듯해야 튼튼하게 서 있을 수 있어요."}, suggested_extras:["r_l4_life","b_l4_book"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 판단", context:"곰이가 변이 아주 긴 각과 아주 짧은 각을 그렸어요. 둘 다 삼각자를 대니 딱 맞았어요.", challenge:"두 각 가운데 어느 쪽이 더 큰 직각일까요? 왜 그렇게 생각하나요?", note:"풀이: 어느 쪽도 더 크지 않아요. 직각은 **언제나 같은 크기**라서 변의 길이는 상관없어요."}, suggested_extras:["x_l4_size"], tnote:{ask:["삼각자를 대면 두 각은 어떻게 되나요?","변의 길이는 각과 상관이 있을까요?"], watch:"'긴 쪽이 크다'는 답을 고집하는 경우 — 겹쳐 보이며 확인시킬 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"종이를 반듯하게 두 번 접으면 생기는 각의 이름은?", a:"직각"},{q:"직각은 어떤 표시로 나타내나요?", a:"작은 ㄱ자 표시"},{q:"직각인지 확인할 때 쓰는 도구는?", a:"삼각자"}], self:["직각을 찾고 확인할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**직각** = 종이를 반듯하게 **두 번** 접었을 때 생기는 각","직각은 꼭짓점에 작은 **ㄱ자**로 표시한다","**삼각자**를 맞대어 겹쳐 보면 직각인지 알 수 있다","직각은 **언제나 같은 크기**다"], arrows:["두 번 접기","ㄱ자 표시","삼각자로 확인"]}, suggested_extras:["r_l4_life"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 직각이 무엇인지 알게 되었나요?","🔧 과정·기능 — 삼각자로 직각을 확인할 수 있나요?","💛 가치·태도 — 주변에서 직각을 찾아보고 싶어졌나요?"], prompts:["직각을 가장 많이 찾은 곳은 어디였나요?"]}, suggested_extras:["c_l4_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"삼각형 가운데 한 각이 직각인 것이 있어요. **직각삼각형**을 알아봐요.", emoji:"🔺"}, suggested_extras:["c_l4_prep"]}
    ],
    extras: [
      {id:"v_l4_right", type:"video", icon:"🎥", title:"직각 알아보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%EC%A7%81%EA%B0%81", description:"종이접기로 직각을 만드는 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","motivate"]},
      {id:"v_l4_tool", type:"video", icon:"🎥", title:"삼각자 쓰는 법", url:"https://www.youtube.com/results?search_query=%EC%82%BC%EA%B0%81%EC%9E%90+%EC%82%AC%EC%9A%A9%EB%B2%95", description:"삼각자를 맞대어 확인하는 손 모양 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","offline_activity"]},
      {id:"q_l4_recall", type:"fun_question", icon:"💡", title:"여러 각 가운데", content:"지난 시간에 여러 각을 만들어 봤지요. 그 가운데 유난히 반듯해 보이던 각이 있었나요?", fit_slides:["review","motivate"]},
      {id:"q_l4_fold", type:"fun_question", icon:"💡", title:"왜 두 번일까", content:"한 번만 접으면 어떤 각이 생길까요? 두 번 접어야 하는 까닭은 무엇일까요?", fit_slides:["motivate","concept"]},
      {id:"q_l4_mark", type:"fun_question", icon:"💡", title:"표시가 없으면", content:"그림에 ㄱ자 표시가 없어도 직각일 수 있을까요? 어떻게 확인하면 좋을까요?", fit_slides:["concept","basic_problem"]},
      {id:"q_l4_same", type:"fun_question", icon:"💡", title:"모두 같은 직각", content:"우리 반 아이들이 각자 만든 직각을 겹쳐 보면 어떻게 될까요? 왜 그럴까요?", fit_slides:["misconception","offline_activity"]},
      {id:"q_l4_many", type:"fun_question", icon:"💡", title:"왜 이렇게 많을까", content:"교실 물건에 직각이 많은 까닭은 무엇일까요? 둥근 모서리보다 좋은 점이 있을까요?", fit_slides:["real_world","summary"]},
      {id:"t_l4_fold", type:"tip", icon:"🧩", title:"접은 선을 맞춰 접기", content:"두 번째로 접을 때 첫 접은 선을 정확히 겹치게 해야 반듯한 각이 나옵니다. 이 한 가지만 짚어 주면 성공률이 크게 오릅니다.", fit_slides:["motivate","concept"]},
      {id:"t_l4_mark", type:"tip", icon:"🧩", title:"표시는 꼭짓점 안쪽에", content:"ㄱ자 표시는 꼭짓점 안쪽 작은 네모 자리에 그립니다. 변 한가운데에 그리지 않도록 처음에 한 번 보여 주세요.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l4_align", type:"tip", icon:"🧩", title:"꼭짓점부터 맞추기", content:"삼각자를 댈 때는 꼭짓점 → 한 변 → 다른 변 순서로 맞추게 합니다. 순서가 정확도를 만듭니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l4_keep", type:"tip", icon:"🧩", title:"내 직각 자 보관하기", content:"접어 만든 직각 자를 필통에 넣어 두게 하면 다음 차시에도 그대로 씁니다.", fit_slides:["offline_activity","next_lesson"]},
      {id:"e_l4_fold", type:"extension", icon:"⬆", title:"세 번 접으면", content:"세 번 접으면 어떤 각이 생길까요? 직각보다 작아진다는 것을 눈으로 확인할 수 있습니다.", fit_slides:["concept","basic_problem"]},
      {id:"e_l4_check", type:"extension", icon:"⬆", title:"직각이 아닌 것 모으기", content:"직각이 아닌 각까지 함께 모아 견주게 하면 판정 기준이 또렷해집니다.", fit_slides:["leveled_problem","offline_activity"]},
      {id:"g_l4_hunt", type:"game", icon:"🎮", title:"직각 찾기 대결", content:"내 직각 자를 들고 교실을 돌며 직각을 먼저 다섯 곳 찾는 모둠이 이깁니다. 찾을 때마다 확인 도장을 찍게 하세요.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l4_ox", type:"game", icon:"🎮", title:"직각 맞다·아니다", content:"교사가 그림을 보여 주면 손으로 동그라미와 가위표를 만들어 답하는 빠른 놀이입니다.", fit_slides:["basic_problem","summary"]},
      {id:"r_l4_life", type:"real_world", icon:"🌍", title:"반듯해야 쌓인다", content:"상자와 책은 모서리가 직각이라 반듯하게 쌓입니다. 둥글면 미끄러져 무너집니다.", fit_slides:["real_world","concept"]},
      {id:"r_l4_build", type:"real_world", icon:"🌍", title:"건물의 직각", content:"벽과 바닥이 직각으로 만나야 건물이 기울지 않습니다. 짓는 사람들이 늘 확인하는 부분입니다.", fit_slides:["real_world","summary"]},
      {id:"r_l4_book", type:"real_world", icon:"🌍", title:"공책과 책상", content:"공책 모서리, 책상 모서리, 화면 모서리 — 하루에도 수십 번 직각을 만납니다.", fit_slides:["real_world","motivate"]},
      {id:"b_l4_book", type:"book", icon:"📖", title:"종이접기 책", content:"종이접기 책의 첫 장은 대개 반듯하게 접는 법입니다. 직각과 함께 읽으면 좋습니다.", fit_slides:["offline_activity","real_world"]},
      {id:"x_l4_size", type:"misconception", icon:"❓", title:"직각이 커질 수 있다?", content:"직각은 하나뿐인 크기입니다. 변의 길이나 그림의 크기로 커지지 않는다는 점을 겹쳐 보여 주세요.", fit_slides:["misconception","advanced_problem"]},
      {id:"x_l4_tilt", type:"misconception", icon:"❓", title:"기울면 직각이 아니다?", content:"종이를 돌려 놓아도 직각은 직각입니다. 삼각자를 함께 돌려 대어 확인시켜 주세요.", fit_slides:["concept","leveled_problem"]},
      {id:"c_l4_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"접어 만든 직각 자와 삼각자를 그대로 가져오게 합니다. 다음 시간에 삼각형을 가려냅니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l05 — 직각삼각형을 알아볼까요 ══════════════════ */
  window.LESSONS["u2_l05"] = {
    meta: { grade:3, subject:"수학", unit:2, n:5, title:"직각삼각형을 알아볼까요", std:"[4수02-03]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_05_직각삼각형을알아볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"직각삼각형을 알아볼까요\n삼각형을 직각으로 갈라 봐요", emoji:"🔺"}, suggested_extras:["v_l5_tri"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"**직각**은 종이를 반듯하게 두 번 접었을 때 생기는 각이고, **삼각자**로 확인한다고 했어요.", items:[{q:"종이를 반듯하게 두 번 접으면 생기는 각의 이름은?", a:"직각"},{q:"직각은 어떤 표시로 나타내나요?", a:"작은 ㄱ자 표시"},{q:"직각인지 확인할 때 쓰는 도구는?", a:"삼각자"}], from:"u2_l04"}, suggested_extras:["q_l5_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 삼각형을 늘어놓았어요", kids:[{face:"🐻", label:"곰이\n\"이건 반듯한 곳이 있어\""},{face:"🐧", label:"펭이\n\"이건 하나도 없는데?\""}], question:"삼각형을 **직각이 있는 것**과 **없는 것**으로 나눠 봐요. 어떤 기준으로 가를까요?", img:"assets/photo/math/right_triangle.jpg"}, suggested_extras:["q_l5_sort","t_l5_check"], tnote:{ask:["무엇을 기준으로 나눌까요?","직각이 있는지 어떻게 확인하나요?"], watch:"보기만 하고 삼각자로 확인하지 않는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"삼각형을 두 무리로 갈라요", content:"여러 삼각형을 **직각이 있는 것**과 **직각이 없는 것**으로 나눌 수 있어요.", note:"👉 나누는 기준은 오직 하나 — 직각이 있는가."}, suggested_extras:["e_l5_sort","q_l5_sort"], tnote:{ask:["기준이 하나일 때 무엇이 좋은가요?","기준이 여러 개면 어떻게 될까요?"], watch:"크기·색으로 나누려는 경우 — 기준을 다시 못 박을 것", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"한 각이 직각인 삼각형 = 직각삼각형", content:"**한 각이 직각**인 삼각형을 **직각삼각형**이라고 해요.\n직각이 있는 곳에 작은 **ㄱ자**를 표시해요.", note:"👉 직각삼각형에서 직각은 **1개**예요."}, suggested_extras:["t_l5_mark","e_l5_one"], tnote:{ask:["직각은 몇 개인가요?","직각이 두 개인 삼각형도 있을까요?"], watch:"'세 각이 다 직각'이라고 답하는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"방향이 달라도 직각삼각형", content:"직각이 **아래·옆·기울어진 곳** 어디에 있어도, 한 각이 직각이면 모두 **직각삼각형**이에요.", note:"👉 도형을 돌려 놓아도 성질은 그대로예요."}, suggested_extras:["x_l5_dir","g_l5_turn"], tnote:{ask:["종이를 돌리면 무엇이 달라지나요?","달라지지 않는 것은 무엇인가요?"], watch:"기울어진 그림을 직각삼각형이 아니라고 답하는 경우 — 이 차시 최대 오답", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"직각이 꼭 **아래쪽**에 있어야 직각삼각형이라고 생각한다.", right:"직각의 **방향**은 상관없어요. 어느 자리에 있든 한 각이 직각이면 직각삼각형이에요.", hint:"같은 그림을 90도씩 돌려 붙여 두고 삼각자로 매번 확인하게 하면 스스로 고칩니다."}, suggested_extras:["x_l5_dir","q_l5_turn"], tnote:{ask:["돌려 놓으면 각의 크기가 달라지나요?","무엇을 보고 판단해야 할까요?"], watch:"익숙한 그림만 직각삼각형이라 답하는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"이 삼각형의 이름은", scenario:{icon:"🔺", body:"삼각자를 대어 보니 한 각이 딱 맞았어요."}, question:"한 각이 직각인 이 삼각형의 이름은 무엇일까요?", input:"count_input", answer:"직각삼각형", note:"풀이: 한 각이 직각인 삼각형 → **직각삼각형**"}, suggested_extras:["e_l5_one"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"직각을 세어요", scenario:{icon:"📐", body:"직각삼각형을 자세히 살펴봐요."}, question:"직각삼각형에서 직각은 몇 개일까요?", input:"count_input", answer:1, note:"풀이: 세 각 가운데 직각은 **1개**뿐이에요"}, suggested_extras:["e_l5_one"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"변을 세어요", scenario:{icon:"🔺", body:"직각삼각형도 삼각형이에요."}, question:"직각삼각형의 변은 몇 개일까요?", input:"count_input", answer:3, note:"풀이: 삼각형이므로 변은 **3개**, 꼭짓점도 3개예요"}, suggested_extras:["q_l5_recall"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"직각삼각형을 가려내요", levels:{"기본":{q:"삼각자를 대어 보니 한 각이 딱 맞았어요. 이 삼각형은 직각삼각형일까요?", a:"직각삼각형이에요", steps:["세 각에 차례로 삼각자를 댄다","딱 맞는 각이 있는지 본다","하나라도 있으면 직각삼각형이에요"]},"도전":{q:"기울어져 있는 삼각형에서 한 각이 직각이었어요. 직각은 몇 개이고, 이 도형은 무엇일까요?", a:"직각은 1개예요 · 직각삼각형이에요", steps:["기울어짐과 상관없이 삼각자를 댄다","딱 맞는 각을 센다","직각 1개 → 직각삼각형"]},"심화":{q:"직각이 없는 삼각형과 있는 삼각형을 하나씩 그려 짝에게 가려내게 해 봐요. 짝이 헷갈린 까닭도 물어봐요.", a:"여러 답 (예: 직각이 위쪽에 있어 헷갈렸다고 함)", open:true}}}, suggested_extras:["g_l5_turn","t_l5_check"], tnote:{ask:["세 각을 모두 확인했나요?","한 각만 보고 판단하면 무엇이 위험할까요?"], watch:"첫 각만 대어 보고 아니라고 단정하는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"삼각형 나누기 판", type:"group", goal:"여러 삼각형 조각을 직각이 있는 것과 없는 것으로 나누어 모둠 판에 붙이기", steps:["모둠에서 종이 삼각형 여덟 조각을 나눠 갖는다","조각마다 삼각자를 대어 직각이 있는지 확인한다","모둠 판을 둘로 나누어 각각 붙인다","기울어진 조각을 어디에 붙였는지 서로 확인한다"], materials:["종이 삼각형 조각","삼각자","모둠 판","풀"], minutes:8}, suggested_extras:["e_l5_sort","x_l5_dir"], tnote:{ask:["기울어진 조각은 어디에 붙였나요?","확인은 눈으로 했나요, 삼각자로 했나요?"], watch:"눈대중으로만 나누는 모둠 — 조각마다 삼각자를 대게 할 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"생활 속 직각삼각형", scenario:{icon:"📐", body:"삼각자, 깃발, 피자 조각, 비행기 날개 — 한 각이 반듯한 삼각형이 자주 보여요."}, content:"한쪽이 반듯하면 **벽이나 바닥에 딱 붙여** 놓기 좋아요. 그래서 도구와 물건에 직각삼각형이 많이 쓰여요."}, suggested_extras:["r_l5_life","b_l5_book"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"펭이의 주장", context:"펭이가 기울어진 삼각형을 보고 '직각이 아래에 없으니 직각삼각형이 아니야'라고 했어요.", challenge:"펭이의 말이 맞을까요? 어떻게 확인해 주면 좋을까요?", note:"풀이: 틀렸어요. 삼각자를 대어 한 각이 딱 맞으면 방향과 상관없이 **직각삼각형**이에요."}, suggested_extras:["x_l5_dir"], tnote:{ask:["펭이에게 무엇을 보여 주면 좋을까요?","종이를 돌려 보면 어떻게 되나요?"], watch:"'그럴 수도 있다'고 얼버무리는 경우 — 삼각자 판정으로 결론 내게 할 것", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"한 각이 직각인 삼각형의 이름은?", a:"직각삼각형"},{q:"직각삼각형에서 직각은 몇 개인가요?", a:"1개"},{q:"기울어져 있어도 한 각이 직각이면 직각삼각형인가요?", a:"네, 직각삼각형이에요"}], self:["직각삼각형을 가려낼 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["삼각형은 **직각이 있는 것**과 **없는 것**으로 나눌 수 있다","**직각삼각형** = 한 각이 직각인 삼각형","직각삼각형에서 직각은 **1개**","**방향**이 달라도 한 각이 직각이면 직각삼각형이다"], arrows:["직각 확인","한 각이 직각","직각삼각형"]}, suggested_extras:["r_l5_life"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 직각삼각형의 뜻을 알게 되었나요?","🔧 과정·기능 — 삼각자로 직각삼각형을 가려낼 수 있나요?","💛 가치·태도 — 도형을 돌려 보며 살피려고 했나요?"], prompts:["가장 헷갈렸던 조각은 어떤 것이었나요?"]}, suggested_extras:["c_l5_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"이번엔 사각형이에요. 네 각이 모두 직각인 **직사각형**과, 네 변까지 같은 **정사각형**을 알아봐요.", emoji:"🟦"}, suggested_extras:["c_l5_prep"]}
    ],
    extras: [
      {id:"v_l5_tri", type:"video", icon:"🎥", title:"직각삼각형 알아보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%EC%A7%81%EA%B0%81%EC%82%BC%EA%B0%81%ED%98%95", description:"직각이 있는 삼각형을 가려내는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","cover"]},
      {id:"v_l5_sort", type:"video", icon:"🎥", title:"기준을 정해 나누기", url:"https://www.youtube.com/results?search_query=%EB%8F%84%ED%98%95+%EB%B6%84%EB%A5%98+%EA%B8%B0%EC%A4%80", description:"기준 하나로 도형을 가르는 방법 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","offline_activity"]},
      {id:"q_l5_recall", type:"fun_question", icon:"💡", title:"삼각형의 성질 떠올리기", content:"삼각형의 변과 꼭짓점은 몇 개였나요? 직각삼각형도 그대로일까요?", fit_slides:["review","basic_problem"]},
      {id:"q_l5_sort", type:"fun_question", icon:"💡", title:"어떤 기준으로 나눌까", content:"크기·색·모양 가운데 무엇으로 나누면 늘 같은 결과가 나올까요? 왜 그럴까요?", fit_slides:["motivate","concept"]},
      {id:"q_l5_turn", type:"fun_question", icon:"💡", title:"돌려도 그대로일까", content:"종이를 빙글 돌리면 각의 크기가 달라질까요? 무엇은 달라지고 무엇은 그대로일까요?", fit_slides:["misconception","concept"]},
      {id:"q_l5_two", type:"fun_question", icon:"💡", title:"직각이 두 개라면", content:"삼각형에 직각이 두 개 있을 수 있을까요? 종이로 만들어 보려 하면 어떻게 되나요?", fit_slides:["concept","advanced_problem"]},
      {id:"q_l5_use", type:"fun_question", icon:"💡", title:"왜 이 모양일까", content:"삼각자는 왜 한 각이 반듯할까요? 그 반듯함이 무엇에 쓰일까요?", fit_slides:["real_world","summary"]},
      {id:"t_l5_check", type:"tip", icon:"🧩", title:"세 각을 모두 확인하기", content:"한 각만 대어 보고 판단하면 놓칩니다. 세 각에 차례로 대어 보는 습관을 처음에 잡아 주세요.", fit_slides:["motivate","leveled_problem"]},
      {id:"t_l5_mark", type:"tip", icon:"🧩", title:"찾으면 바로 표시", content:"직각을 찾자마자 ㄱ자를 그리게 하면 나중에 다시 확인할 필요가 없습니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l5_turn", type:"tip", icon:"🧩", title:"조각을 돌려 보게 하기", content:"판정이 끝난 조각을 한 번씩 돌려 다시 보게 하면 방향에 대한 오해가 사라집니다.", fit_slides:["misconception","leveled_problem"]},
      {id:"t_l5_group", type:"tip", icon:"🧩", title:"모둠 판을 둘로만", content:"판을 둘로만 나누게 하면 기준이 하나라는 점이 눈으로 보입니다. 칸을 늘리지 않도록 하세요.", fit_slides:["offline_activity","concept"]},
      {id:"e_l5_sort", type:"extension", icon:"⬆", title:"기준 바꿔 다시 나누기", content:"직각이 아닌 다른 기준으로도 나눠 보게 하면 분류가 기준에 달려 있다는 점을 알게 됩니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l5_one", type:"extension", icon:"⬆", title:"직각이 하나뿐인 까닭", content:"종이 삼각형으로 직각을 두 개 만들려 해 보면 도형이 닫히지 않는 것을 손으로 확인할 수 있습니다.", fit_slides:["concept","basic_problem"]},
      {id:"g_l5_turn", type:"game", icon:"🎮", title:"돌려도 맞히기", content:"교사가 그림을 돌려 보여 주면 직각삼각형인지 손으로 답하는 놀이. 방향 오해를 빠르게 걷어냅니다.", fit_slides:["leveled_problem","misconception"]},
      {id:"g_l5_race", type:"game", icon:"🎮", title:"조각 나누기 대결", content:"삼각형 조각을 누가 먼저 정확히 나누는지 겨루는 모둠 놀이입니다. 빠르기보다 정확함에 점수를 주세요.", fit_slides:["offline_activity","summary"]},
      {id:"r_l5_life", type:"real_world", icon:"🌍", title:"벽에 붙는 모양", content:"한쪽이 반듯하면 벽이나 바닥에 딱 붙습니다. 선반 받침과 책꽂이 버팀대가 이 모양인 까닭입니다.", fit_slides:["real_world","concept"]},
      {id:"r_l5_flag", type:"real_world", icon:"🌍", title:"깃발과 돛", content:"바람을 받는 깃발과 배의 돛에도 한 각이 반듯한 삼각형이 자주 쓰입니다.", fit_slides:["real_world","motivate"]},
      {id:"r_l5_tool", type:"real_world", icon:"🌍", title:"삼각자라는 도구", content:"삼각자는 그 자체가 직각삼각형입니다. 도형을 재는 도구가 도형인 셈입니다.", fit_slides:["real_world","summary"]},
      {id:"b_l5_book", type:"book", icon:"📖", title:"도형 분류 그림책", content:"모양을 나누어 보는 그림책을 함께 읽으며 우리 기준과 견주어 봅니다.", fit_slides:["real_world","offline_activity"]},
      {id:"x_l5_dir", type:"misconception", icon:"❓", title:"직각은 아래에 있어야 한다?", content:"교과서 그림이 늘 같은 방향이라 생기는 오해입니다. 일부러 돌린 그림을 자주 보여 주세요.", fit_slides:["misconception","advanced_problem"]},
      {id:"x_l5_all", type:"misconception", icon:"❓", title:"세 각이 다 직각?", content:"'직각삼각형이니 다 직각'이라고 답하는 아이가 있습니다. 직각은 하나뿐임을 종이로 확인시켜 주세요.", fit_slides:["concept","basic_problem"]},
      {id:"c_l5_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"삼각자와 자를 챙기게 합니다. 다음 시간에는 변의 길이도 견주어 봅니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l06 — 직사각형과 정사각형 ══════════════════ */
  window.LESSONS["u2_l06"] = {
    meta: { grade:3, subject:"수학", unit:2, n:6, title:"직사각형과 정사각형", std:"[4수02-03]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_06_직사각형과정사각형.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"직사각형과 정사각형\n사각형을 직각으로 갈라 봐요", emoji:"🟦"}, suggested_extras:["v_l6_quad"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"한 각이 직각인 삼각형을 **직각삼각형**이라 하고, **방향**은 상관없다고 했어요.", items:[{q:"한 각이 직각인 삼각형의 이름은?", a:"직각삼각형"},{q:"직각삼각형에서 직각은 몇 개인가요?", a:"1개"},{q:"기울어져 있어도 한 각이 직각이면 직각삼각형인가요?", a:"네, 직각삼각형이에요"}], from:"u2_l05"}, suggested_extras:["q_l6_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 안내판을 살펴봐요", kids:[{face:"🐻", label:"곰이\n\"네 곳이 다 반듯해\""},{face:"🐧", label:"펭이\n\"이건 변까지 다 같은데?\""}], question:"사각형을 **직각의 개수**로 나눠 봐요. 네 각이 모두 직각인 사각형은 무엇이라고 부를까요?", img:"assets/photo/math/rectangle_window.jpg"}, suggested_extras:["q_l6_sort","t_l6_check"], tnote:{ask:["네 각을 모두 확인했나요?","한두 각만 보면 왜 위험할까요?"], watch:"두 각만 대어 보고 판단하는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"사각형을 직각으로 갈라요", content:"사각형을 **네 각이 모두 직각인 것**과 **그렇지 않은 것**으로 나눌 수 있어요.", note:"👉 삼각형 때처럼 기준은 직각이에요. 다만 이번엔 **네 각 모두**를 봐야 해요."}, suggested_extras:["e_l6_sort","q_l6_sort"], tnote:{ask:["삼각형 때와 무엇이 달라졌나요?","'모두'라는 말이 왜 중요할까요?"], watch:"'하나라도 직각이면 된다'고 여기는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"네 각이 모두 직각 = 직사각형", content:"**네 각이 모두 직각**인 사각형을 **직사각형**이라고 해요.", note:"👉 직사각형의 직각은 **4개**예요."}, suggested_extras:["t_l6_mark","e_l6_four"], tnote:{ask:["직사각형의 직각은 몇 개인가요?","변의 길이는 어떤가요?"], watch:"변의 길이까지 같아야 한다고 여기는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"네 각 직각 + 네 변 같음 = 정사각형", content:"네 각이 모두 직각이고 **네 변의 길이가 모두 같은** 사각형을 **정사각형**이라고 해요.", items:[{emoji:"🟦", count:1, label:"**직사각형**\n네 각이 모두 직각"},{emoji:"🟩", count:1, label:"**정사각형**\n네 각 직각 + 네 변 같음"}], note:"👉 정사각형은 조건이 하나 더 있는 셈이에요."}, suggested_extras:["e_l6_four","q_l6_diff"], tnote:{ask:["둘의 같은 점은 무엇인가요?","다른 점은 무엇인가요?"], watch:"두 이름을 뒤바꿔 쓰는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**직사각형은 모두 정사각형**이라고 생각한다.", right:"직사각형은 네 각만 직각이면 돼요. 네 변의 길이까지 같아야 정사각형이니, 길쭉한 직사각형은 정사각형이 아니에요.", hint:"길쭉한 직사각형과 정사각형을 나란히 놓고 변의 길이를 자로 재어 견주게 하세요."}, suggested_extras:["x_l6_all","q_l6_diff"], tnote:{ask:["이 길쭉한 도형의 네 변은 모두 같나요?","그럼 무엇이라고 불러야 할까요?"], watch:"'네모는 다 같다'고 뭉뚱그리는 경우 — 이 차시 최대 오답", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"이 사각형의 이름은 ①", scenario:{icon:"🟦", body:"네 각에 삼각자를 대니 모두 딱 맞았어요. 변의 길이는 모두 같지는 않아요."}, question:"이 사각형의 이름은 무엇일까요?", input:"count_input", answer:"직사각형", note:"풀이: 네 각이 모두 직각 → **직사각형** (변까지 같아야 정사각형)"}, suggested_extras:["e_l6_four"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"이 사각형의 이름은 ②", scenario:{icon:"🟩", body:"네 각이 모두 직각이고, 자로 재니 네 변의 길이도 모두 같았어요."}, question:"이 사각형의 이름은 무엇일까요?", input:"count_input", answer:"정사각형", note:"풀이: 네 각 직각 + 네 변 길이 같음 → **정사각형**"}, suggested_extras:["q_l6_diff"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"직각을 세어요", scenario:{icon:"📐", body:"직사각형을 자세히 살펴봐요."}, question:"직사각형에서 직각은 몇 개일까요?", input:"count_input", answer:4, note:"풀이: 네 각이 모두 직각이므로 **4개**"}, suggested_extras:["t_l6_check"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"이름을 가려 붙여요", levels:{"기본":{q:"네 각이 모두 직각이지만 변의 길이는 두 가지인 사각형의 이름은 무엇일까요?", a:"직사각형이에요", steps:["네 각에 삼각자를 대어 본다","모두 딱 맞으면 직사각형","변의 길이가 다르므로 정사각형은 아니에요"]},"도전":{q:"네 각이 모두 직각이고 네 변의 길이도 모두 같은 사각형의 이름은 무엇일까요?", a:"정사각형이에요", steps:["네 각을 삼각자로 확인한다","자로 네 변을 재어 견준다","모두 같으면 정사각형이에요"]},"심화":{q:"교실에서 직사각형 세 곳과 정사각형 한 곳을 찾아, 어떻게 가려냈는지 짝에게 설명해 봐요.", a:"여러 답 (예: 창문 = 직사각형, 붙임쪽지 = 정사각형)", open:true}}}, suggested_extras:["g_l6_hunt","t_l6_ruler"], tnote:{ask:["각을 먼저 볼까요, 변을 먼저 볼까요?","정사각형이라고 하려면 무엇을 더 확인해야 하나요?"], watch:"각 확인을 건너뛰고 변만 재는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"교실 사각형 재어 보기", type:"group", goal:"교실 물건의 네 각과 네 변을 확인해 직사각형과 정사각형으로 나누기", steps:["모둠에서 사각형 물건 다섯 개를 고른다","삼각자로 네 각이 모두 직각인지 확인한다","자로 네 변의 길이를 견주어 본다","직사각형과 정사각형으로 나누어 모둠 판에 적는다"], materials:["삼각자","자","모둠 판"], minutes:8}, suggested_extras:["t_l6_ruler","x_l6_all"], tnote:{ask:["정사각형은 몇 개 찾았나요?","왜 직사각형이 더 많을까요?"], watch:"길이를 눈대중으로만 견주는 모둠 — 자를 반드시 대게 할 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"왜 직사각형이 많을까요", scenario:{icon:"🚪", body:"문, 창문, 칠판, 책상, 안내판 — 둘러보면 대부분 직사각형이에요."}, content:"네 각이 반듯하면 **딱 맞게 이어 붙이고 쌓기** 좋아요. 그래서 만드는 물건에 직사각형이 많이 쓰여요."}, suggested_extras:["r_l6_life","b_l6_book"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 말", context:"곰이가 '정사각형은 직사각형이기도 해'라고 말했어요.", challenge:"곰이의 말이 맞을까요? 네 각과 네 변을 각각 따져서 말해 봐요.", note:"풀이: 맞아요. 정사각형도 **네 각이 모두 직각**이니 직사각형의 조건을 갖추었어요. 다만 직사각형이 모두 정사각형인 것은 아니에요."}, suggested_extras:["x_l6_all"], tnote:{ask:["정사각형의 네 각은 어떤가요?","반대로 말하면 왜 안 될까요?"], watch:"'같다'와 '포함된다'를 뒤섞는 경우 — 조건을 하나씩 따지게 할 것", min:5}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"네 각이 모두 직각인 사각형의 이름은?", a:"직사각형"},{q:"네 각이 모두 직각이고 네 변의 길이도 같은 사각형의 이름은?", a:"정사각형"},{q:"직사각형은 모두 정사각형인가요?", a:"아니에요"}], self:["두 사각형을 가려낼 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**직사각형** = 네 각이 모두 직각인 사각형 (직각 **4개**)","**정사각형** = 네 각이 모두 직각 + **네 변의 길이가 모두 같음**","기울어져 있어도 네 각이 직각이면 직사각형이다","직사각형이 모두 정사각형인 것은 아니다"], arrows:["네 각 확인","네 변 견주기","이름 붙이기"]}, suggested_extras:["r_l6_life"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 두 사각형의 조건을 알게 되었나요?","🔧 과정·기능 — 각과 변을 확인해 이름을 붙일 수 있나요?","💛 가치·태도 — 눈대중 대신 도구로 확인하려 했나요?"], prompts:["교실에서 정사각형은 왜 적었을까요?"]}, suggested_extras:["c_l6_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"배운 도형을 모아 **나만의 그림**을 그려 봐요. 어떤 도형으로 무엇을 그릴까요?", emoji:"🎨"}, suggested_extras:["c_l6_prep"]}
    ],
    extras: [
      {id:"v_l6_quad", type:"video", icon:"🎥", title:"직사각형과 정사각형", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%EC%A7%81%EC%82%AC%EA%B0%81%ED%98%95+%EC%A0%95%EC%82%AC%EA%B0%81%ED%98%95", description:"두 사각형의 조건을 견주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","cover"]},
      {id:"v_l6_ruler", type:"video", icon:"🎥", title:"자로 변 재기", url:"https://www.youtube.com/results?search_query=%EC%9E%90%EB%A1%9C+%EA%B8%B8%EC%9D%B4+%EC%9E%AC%EA%B8%B0+%EC%B4%88%EB%93%B1", description:"자를 바르게 대고 견주는 방법 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["offline_activity","leveled_problem"]},
      {id:"q_l6_recall", type:"fun_question", icon:"💡", title:"삼각형 때는 하나였는데", content:"직각삼각형은 직각이 하나면 됐어요. 사각형은 왜 네 각을 모두 봐야 할까요?", fit_slides:["review","concept"]},
      {id:"q_l6_sort", type:"fun_question", icon:"💡", title:"기준을 정해 봐요", content:"사각형을 나눌 때 각으로 나눌까요, 변으로 나눌까요? 두 가지를 다 쓰면 어떻게 될까요?", fit_slides:["motivate","concept"]},
      {id:"q_l6_diff", type:"fun_question", icon:"💡", title:"하나만 더 있으면", content:"직사각형에 조건을 하나 더 붙이면 정사각형이 돼요. 그 조건은 무엇이었나요?", fit_slides:["concept","leveled_problem"]},
      {id:"q_l6_find", type:"fun_question", icon:"💡", title:"정사각형은 어디에", content:"교실에서 정사각형은 왜 직사각형보다 적을까요? 어떤 물건이 정사각형이었나요?", fit_slides:["offline_activity","real_world"]},
      {id:"q_l6_tilt", type:"fun_question", icon:"💡", title:"기울여 놓으면", content:"직사각형을 비스듬히 돌려 놓으면 이름이 달라질까요? 왜 그렇게 생각하나요?", fit_slides:["concept","misconception"]},
      {id:"t_l6_check", type:"tip", icon:"🧩", title:"네 각을 차례로", content:"한 바퀴 돌며 네 각을 차례로 대어 보게 하면 빠뜨림이 없습니다. 순서를 정해 주세요.", fit_slides:["motivate","basic_problem"]},
      {id:"t_l6_mark", type:"tip", icon:"🧩", title:"확인한 각에 표시", content:"확인이 끝난 각마다 ㄱ자를 그리게 하면 네 개가 모두 채워졌는지 한눈에 보입니다.", fit_slides:["concept","leveled_problem"]},
      {id:"t_l6_ruler", type:"tip", icon:"🧩", title:"자는 끝을 맞춰서", content:"자의 첫 눈금을 변의 끝에 정확히 맞추게 하세요. 견주기의 정확도가 여기서 갈립니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"t_l6_two", type:"tip", icon:"🧩", title:"두 조건을 나눠 적기", content:"칠판에 '각 조건'과 '변 조건'을 나눠 적어 두면 두 이름을 헷갈리지 않습니다.", fit_slides:["concept","summary"]},
      {id:"e_l6_sort", type:"extension", icon:"⬆", title:"직각이 두 개뿐인 사각형", content:"직각이 두 개만 있는 사각형을 그려 보게 하면 '모두'라는 조건의 뜻이 또렷해집니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l6_four", type:"extension", icon:"⬆", title:"조건 표 만들기", content:"사각형·직사각형·정사각형의 조건을 표로 적어 보면 조건이 하나씩 늘어나는 것이 보입니다.", fit_slides:["concept","summary"]},
      {id:"g_l6_hunt", type:"game", icon:"🎮", title:"이름 붙이기 대결", content:"교사가 도형을 보여 주면 모둠이 이름을 먼저 말하는 놀이. 애매한 그림을 섞으면 더 재미있습니다.", fit_slides:["leveled_problem","basic_problem"]},
      {id:"g_l6_make", type:"game", icon:"🎮", title:"조건 듣고 만들기", content:"'네 각 직각!' '네 변 같음!'을 듣고 색종이를 잘라 만드는 놀이입니다.", fit_slides:["offline_activity","summary"]},
      {id:"r_l6_life", type:"real_world", icon:"🌍", title:"이어 붙이기 좋은 모양", content:"직사각형 타일과 벽돌은 틈 없이 이어 붙일 수 있습니다. 반듯한 각 덕분입니다.", fit_slides:["real_world","concept"]},
      {id:"r_l6_sign", type:"real_world", icon:"🌍", title:"안내판의 모양", content:"길가 안내판은 대개 직사각형입니다. 글씨를 줄 맞춰 넣기 좋기 때문입니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l6_note", type:"real_world", icon:"🌍", title:"붙임쪽지와 정사각형", content:"붙임쪽지처럼 네 변이 같은 물건도 있습니다. 어느 방향으로 붙여도 같아 편리합니다.", fit_slides:["real_world","offline_activity"]},
      {id:"b_l6_book", type:"book", icon:"📖", title:"건축 그림책", content:"집과 건물이 나오는 그림책을 보며 직사각형이 어디에 쓰였는지 짚어 봅니다.", fit_slides:["real_world","summary"]},
      {id:"x_l6_all", type:"misconception", icon:"❓", title:"네모는 다 같다?", content:"'네모'라는 한 낱말로 뭉뚱그리면 두 이름이 섞입니다. 조건을 하나씩 따져 부르게 하세요.", fit_slides:["misconception","advanced_problem"]},
      {id:"x_l6_tilt", type:"misconception", icon:"❓", title:"기울면 아니다?", content:"돌려 놓아도 네 각은 그대로 직각입니다. 삼각자를 함께 돌려 대어 확인시켜 주세요.", fit_slides:["concept","leveled_problem"]},
      {id:"c_l6_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"색연필과 자를 챙기게 합니다. 다음 시간에는 배운 도형으로 그림을 그립니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l07 — 평면도형으로 그림을 그려요 ══════════════════ */
  window.LESSONS["u2_l07"] = {
    meta: { grade:3, subject:"수학", unit:2, n:7, title:"평면도형으로 그림을 그려요", std:"[4수02-03]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_07_평면도형으로그림을그려요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"평면도형으로 그림을 그려요\n배운 도형을 모아 봐요", emoji:"🎨"}, suggested_extras:["v_l7_art"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"네 각이 모두 직각이면 **직사각형**, 네 변까지 같으면 **정사각형**이라고 했어요.", items:[{q:"네 각이 모두 직각인 사각형의 이름은?", a:"직사각형"},{q:"네 각이 모두 직각이고 네 변의 길이도 같은 사각형의 이름은?", a:"정사각형"},{q:"직사각형은 모두 정사각형인가요?", a:"아니에요"}], from:"u2_l06"}, suggested_extras:["q_l7_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 고양이를 그렸어요", kids:[{face:"🐻", label:"곰이\n\"얼굴은 네모로 했어\""},{face:"🐧", label:"펭이\n\"귀는 세모로 했지\""}], question:"이 고양이 그림에는 어떤 **평면도형**이 쓰였을까요? 하나씩 찾아봐요.", img:"assets/photo/math/shape_drawing.jpg"}, suggested_extras:["q_l7_find","t_l7_part"], tnote:{ask:["어느 부분부터 살펴볼까요?","도형의 이름을 정확히 말할 수 있나요?"], watch:"'네모·세모'로만 말하고 배운 이름을 쓰지 않는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"우리가 배운 평면도형", content:"**선분** · **직각삼각형** · **직사각형** · **정사각형**\n이 도형들을 모으면 **나만의 그림**을 그릴 수 있어요.", note:"👉 이름을 알고 나면 그림을 말로 설명할 수 있어요."}, suggested_extras:["t_l7_name","e_l7_list"], tnote:{ask:["이 단원에서 배운 도형을 모두 말해 볼까요?","이름을 아는 것이 그림 그리기에 왜 도움이 될까요?"], watch:"직각삼각형과 직사각형의 이름을 뒤바꿔 말하는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"각 부분은 무슨 도형일까요", content:"**얼굴** = 정사각형 · **귀** = 직각삼각형 · **눈** = 직사각형", note:"👉 부분마다 어울리는 도형이 달라요."}, suggested_extras:["q_l7_find","t_l7_part"], tnote:{ask:["왜 귀를 직각삼각형으로 그렸을까요?","눈을 정사각형으로 바꾸면 어떤 느낌일까요?"], watch:"부분과 도형을 짝지어 말하지 못하는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"수염은 선분으로 그렸어요", content:"고양이 **수염**은 곧은 **선분**으로 그렸어요.\n쓰인 도형을 세어 보면 **정사각형 1개 · 직각삼각형 2개 · 직사각형 2개 · 선분 4개**예요.", note:"👉 모두 합하면 도형이 9개 쓰였어요."}, suggested_extras:["e_l7_count","g_l7_count"], tnote:{ask:["수염은 왜 선분으로 그렸을까요?","도형은 모두 몇 개 쓰였나요?"], watch:"세다가 같은 것을 두 번 세는 경우 — 센 것에 표시하게 할 것", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"그림이니까 도형의 **이름**은 대충 불러도 된다고 생각한다. (직각삼각형을 그냥 '세모'라고 함)", right:"그림을 설명할 때도 배운 **이름을 정확히** 써야 해요. 그래야 듣는 사람이 똑같은 그림을 떠올릴 수 있어요.", hint:"짝에게 말로만 설명해 그리게 해 보면 정확한 이름이 왜 필요한지 스스로 느낍니다."}, suggested_extras:["x_l7_name","q_l7_tell"], tnote:{ask:["'세모'라고만 하면 짝이 무엇을 그릴까요?","정확한 이름을 쓰면 무엇이 달라지나요?"], watch:"설명을 귀찮아하며 손으로만 가리키는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"얼굴은 무슨 도형", scenario:{icon:"🐱", body:"고양이 그림을 다시 봐요."}, question:"고양이 얼굴은 무슨 도형으로 그렸을까요?", input:"count_input", answer:"정사각형", note:"풀이: 네 각이 모두 직각이고 네 변의 길이도 같아요 → **정사각형**"}, suggested_extras:["t_l7_part"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"귀를 세어요", scenario:{icon:"🐱", body:"고양이 귀를 살펴봐요."}, question:"그림에서 직각삼각형은 몇 개일까요?", input:"count_input", answer:2, note:"풀이: 귀 두 개가 직각삼각형 → **2개**"}, suggested_extras:["e_l7_count"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"수염을 세어요", scenario:{icon:"🐱", body:"고양이 수염을 살펴봐요."}, question:"그림에서 선분은 몇 개일까요?", input:"count_input", answer:4, note:"풀이: 수염 네 가닥이 선분 → **4개**"}, suggested_extras:["g_l7_count"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"그림을 말로 설명해요", levels:{"기본":{q:"고양이 귀는 무슨 도형을 몇 개 썼는지 말해 봐요.", a:"직각삼각형 2개", steps:["귀 부분을 손가락으로 짚는다","도형의 이름을 말한다","개수를 센다 → 직각삼각형 2개"]},"도전":{q:"고양이 수염은 무엇을 몇 개 썼는지 말해 봐요.", a:"선분 4개", steps:["수염을 하나씩 짚으며 센다","곧은 선이므로 선분이라 부른다","선분 4개"]},"심화":{q:"배운 도형으로 나만의 그림을 그리고, 어떤 도형을 몇 개 썼는지 짝에게 설명해 봐요.", a:"여러 답 (예: 집 = 직각삼각형 1개 + 직사각형 3개 + 선분 2개)", open:true}}}, suggested_extras:["q_l7_tell","g_l7_draw"], tnote:{ask:["설명할 때 무엇을 먼저 말하면 좋을까요?","개수까지 말하면 무엇이 좋아지나요?"], watch:"그리기에만 빠져 설명을 건너뛰는 경우", min:6}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"도형으로 그리는 나만의 그림", type:"pair", goal:"배운 도형만 써서 그림을 그리고, 쓴 도형과 개수를 적어 짝에게 설명하기", steps:["무엇을 그릴지 정한다 (집·강아지·로봇 등)","자를 대고 배운 도형만 써서 그린다","쓴 도형의 이름과 개수를 그림 아래에 적는다","짝에게 그림을 가리지 않고 말로만 설명해 본다"], materials:["자","색연필","도화지"], minutes:9}, suggested_extras:["g_l7_draw","x_l7_name"], tnote:{ask:["짝이 설명만 듣고 떠올릴 수 있었나요?","어떤 말이 가장 도움이 되었나요?"], watch:"둥근 모양을 섞어 그리는 짝 — 배운 도형만 쓰기로 다시 짚어 줄 것", min:9}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"도형으로 만든 그림들", scenario:{icon:"🖼️", body:"안내 그림, 표지판 그림, 놀이 지도 — 단순한 도형으로 그린 그림이 많아요."}, content:"도형만으로 그리면 **한눈에 알아보기 쉬워요**. 그래서 알림 그림이나 지도에 많이 쓰여요."}, suggested_extras:["r_l7_sign","b_l7_book"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 설명", context:"곰이가 자기 그림을 '세모 두 개랑 네모 세 개로 그렸어'라고 설명했어요.", challenge:"펭이가 그대로 그리기 어려웠대요. 곰이의 설명을 어떻게 고쳐 주면 좋을까요?", note:"풀이: 배운 이름을 정확히 써서 '**직각삼각형** 2개, **직사각형** 2개, **정사각형** 1개'처럼 말해 주면 돼요."}, suggested_extras:["x_l7_name"], tnote:{ask:["'네모'만으로는 왜 부족할까요?","무엇을 더 말해 주어야 할까요?"], watch:"이름은 고치지만 개수를 빠뜨리는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"고양이 얼굴은 무슨 도형으로 그렸나요?", a:"정사각형"},{q:"고양이 귀는 무슨 도형으로 그렸나요?", a:"직각삼각형"},{q:"고양이 수염은 무엇으로 그렸나요?", a:"선분"}], self:["도형으로 그림을 그리고 설명할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["배운 도형(**선분·직각삼각형·직사각형·정사각형**)을 모으면 그림이 된다","부분마다 어울리는 도형이 다르다","쓴 도형의 **이름과 개수**를 말하면 설명이 정확해진다","고양이 그림 = 정사각형 1 · 직각삼각형 2 · 직사각형 2 · 선분 4"], arrows:["도형 고르기","그리기","이름으로 설명하기"]}, suggested_extras:["r_l7_sign"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 배운 도형의 이름을 모두 말할 수 있나요?","🔧 과정·기능 — 그림에 쓰인 도형을 세어 설명할 수 있나요?","💛 가치·태도 — 짝의 설명을 끝까지 들으려 했나요?"], prompts:["내 그림에서 가장 마음에 드는 도형은 무엇인가요?"]}, suggested_extras:["c_l7_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"이 단원을 **스스로 마무리해요**. 배운 도형을 한 번에 되짚고, 나의 배움을 돌아봐요.", emoji:"🏁"}, suggested_extras:["c_l7_prep"]}
    ],
    extras: [
      {id:"v_l7_art", type:"video", icon:"🎥", title:"도형으로 그림 그리기", url:"https://www.youtube.com/results?search_query=%EB%8F%84%ED%98%95%EC%9C%BC%EB%A1%9C+%EA%B7%B8%EB%A6%BC+%EA%B7%B8%EB%A6%AC%EA%B8%B0", description:"단순한 도형을 모아 그림을 만드는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","motivate"]},
      {id:"v_l7_tell", type:"video", icon:"🎥", title:"말로 설명해 그리기", url:"https://www.youtube.com/results?search_query=%EC%84%A4%EB%AA%85%EB%93%A3%EA%B3%A0+%EA%B7%B8%EB%A6%AC%EA%B8%B0+%EB%86%80%EC%9D%B4", description:"설명만 듣고 그리는 놀이 장면 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["offline_activity","leveled_problem"]},
      {id:"q_l7_recall", type:"fun_question", icon:"💡", title:"이름 모아 보기", content:"이 단원에서 배운 도형의 이름을 손가락으로 꼽아 볼까요? 몇 개가 나오나요?", fit_slides:["review","concept"]},
      {id:"q_l7_find", type:"fun_question", icon:"💡", title:"어디에 어떤 도형", content:"고양이 말고 강아지를 그린다면 귀는 어떤 도형이 어울릴까요?", fit_slides:["motivate","concept"]},
      {id:"q_l7_tell", type:"fun_question", icon:"💡", title:"말로만 설명하기", content:"그림을 보여 주지 않고 말로만 설명하면 짝이 똑같이 그릴 수 있을까요? 무엇이 필요할까요?", fit_slides:["misconception","leveled_problem"]},
      {id:"q_l7_mix", type:"fun_question", icon:"💡", title:"둥근 모양을 쓰면", content:"둥근 모양을 섞으면 더 예쁠까요? 배운 도형만 쓰면 어떤 좋은 점이 있을까요?", fit_slides:["offline_activity","real_world"]},
      {id:"q_l7_most", type:"fun_question", icon:"💡", title:"가장 많이 쓴 도형", content:"내 그림에서 가장 많이 쓴 도형은 무엇인가요? 왜 그 도형을 많이 썼을까요?", fit_slides:["summary","self_assessment"]},
      {id:"t_l7_part", type:"tip", icon:"🧩", title:"부분부터 짚기", content:"그림 전체를 보게 하지 말고 얼굴·귀·눈처럼 부분을 하나씩 짚게 하면 도형이 잘 보입니다.", fit_slides:["motivate","concept"]},
      {id:"t_l7_name", type:"tip", icon:"🧩", title:"배운 이름으로 부르기", content:"'세모·네모'가 나오면 그때마다 배운 이름으로 바꿔 말하게 하세요. 한 차시면 습관이 됩니다.", fit_slides:["concept","misconception"]},
      {id:"t_l7_mark", type:"tip", icon:"🧩", title:"센 것에 점 찍기", content:"도형을 셀 때 센 것마다 작은 점을 찍게 하면 중복과 누락이 사라집니다.", fit_slides:["basic_problem","leveled_problem"]},
      {id:"t_l7_ruler", type:"tip", icon:"🧩", title:"자를 꼭 대게 하기", content:"손으로 그으면 곧은 선이 되지 않습니다. 그림 그리기 차시일수록 자를 쓰게 하세요.", fit_slides:["offline_activity","summary"]},
      {id:"e_l7_list", type:"extension", icon:"⬆", title:"도형 목록 만들기", content:"쓸 도형의 목록을 먼저 적고 그리게 하면 계획하는 힘이 함께 자랍니다.", fit_slides:["concept","offline_activity"]},
      {id:"e_l7_count", type:"extension", icon:"⬆", title:"도형 수 세어 표로", content:"그림마다 쓴 도형 수를 표로 적어 모으면 반 전체의 결과를 견주어 볼 수 있습니다.", fit_slides:["concept","basic_problem"]},
      {id:"g_l7_count", type:"game", icon:"🎮", title:"몇 개일까 맞히기", content:"교사가 그림을 잠깐 보여 주고 '직각삼각형 몇 개?'를 묻는 빠른 놀이입니다.", fit_slides:["basic_problem","summary"]},
      {id:"g_l7_draw", type:"game", icon:"🎮", title:"설명 듣고 그리기", content:"한 사람이 설명하고 짝이 그린 뒤 원본과 견주는 놀이. 정확한 이름을 쓴 짝이 잘 맞습니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"r_l7_sign", type:"real_world", icon:"🌍", title:"알림 그림은 단순하게", content:"화장실·비상구 표시는 단순한 도형으로 그립니다. 멀리서도 한눈에 알아보게 하기 위해서입니다.", fit_slides:["real_world","summary"]},
      {id:"r_l7_map", type:"real_world", icon:"🌍", title:"지도 속 도형", content:"학교 안내 지도의 건물은 대개 직사각형으로 그립니다. 자리를 알아보기 쉽기 때문입니다.", fit_slides:["real_world","motivate"]},
      {id:"r_l7_logo", type:"real_world", icon:"🌍", title:"단순한 그림의 힘", content:"안내판 그림은 도형 몇 개로 뜻을 나릅니다. 적게 쓸수록 더 잘 보입니다.", fit_slides:["real_world","concept"]},
      {id:"b_l7_book", type:"book", icon:"📖", title:"도형 그림책 다시 보기", content:"도형으로 그린 그림책을 다시 펼쳐 쓰인 도형을 세어 봅니다.", fit_slides:["real_world","offline_activity"]},
      {id:"x_l7_name", type:"misconception", icon:"❓", title:"대충 부르기", content:"그림 차시일수록 이름이 흐려집니다. 설명 자리에서 배운 이름을 쓰게 하는 것이 이 차시의 핵심입니다.", fit_slides:["misconception","advanced_problem"]},
      {id:"x_l7_count", type:"misconception", icon:"❓", title:"겹친 도형 빼먹기", content:"겹쳐 그린 도형을 빠뜨리기 쉽습니다. 가려진 부분도 한 개로 세어야 한다고 짚어 주세요.", fit_slides:["basic_problem","leveled_problem"]},
      {id:"c_l7_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"이 단원에서 만든 직각 자와 그림을 함께 가져오게 합니다. 마무리 차시에 씁니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l08 — 스스로 마무리해요 (단원 마무리·평가) ══════════════════ */
  window.LESSONS["u2_l08"] = {
    meta: { grade:3, subject:"수학", unit:2, n:8, title:"스스로 마무리해요", std:"[4수02-03]", duration_min:40,
      lesson_format:"단원 마무리·평가 · 40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 안전한 등굣길 도형 지도",
      live_url:"../../grade3/semester1/math/2단원_평면도형/g3_math_u2_08_스스로마무리해요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"스스로 마무리해요\n평면도형을 한 번에 되짚어요", emoji:"🏁"}, suggested_extras:["v_l8_review"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간엔 무엇을 했나요?", content:"배운 도형을 모아 **나만의 그림**을 그리고, 쓴 도형의 이름과 개수를 말해 설명했어요.", items:[{q:"고양이 얼굴은 무슨 도형으로 그렸나요?", a:"정사각형"},{q:"고양이 귀는 무슨 도형으로 그렸나요?", a:"직각삼각형"},{q:"고양이 수염은 무엇으로 그렸나요?", a:"선분"}], from:"u2_l07"}, suggested_extras:["q_l8_recall"]},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 등굣길 지도를 완성했어요", kids:[{face:"🐻", label:"곰이\n\"횡단보도는 직사각형!\""},{face:"🐧", label:"펭이\n\"옐로카펫은 직각삼각형!\""}], question:"단원을 처음 열었던 그 지도예요. 이제 도형의 **이름을 정확히** 붙일 수 있나요?", img:"assets/photo/math/shape_review.jpg"}, suggested_extras:["q_l8_grow","t_l8_map"], tnote:{ask:["첫 시간과 지금, 무엇이 달라졌나요?","이제 어떤 이름들을 쓸 수 있나요?"], watch:"이름을 떠올리지 못해 위축되는 아이 — 지도를 함께 짚으며 되살릴 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"선을 떠올려요", content:"**선분** = 두 점을 곧게 이은 선\n**반직선** = 한쪽으로 끝없는 곧은 선 (시작점을 먼저 읽어요)\n**직선** = 양쪽으로 끝없는 곧은 선", note:"👉 셋 다 곧은 선, 끝이 정해진 정도가 달라요."}, suggested_extras:["e_l8_table","q_l8_recall"], tnote:{ask:["셋의 같은 점은 무엇인가요?","반직선만 다른 점은 무엇이었나요?"], watch:"반직선의 시작점 규칙을 잊은 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"각과 직각을 떠올려요", content:"**각** = 한 점에서 그은 두 반직선으로 이루어진 도형 (읽을 때 꼭짓점이 가운데)\n**직각** = 종이를 반듯하게 두 번 접었을 때 생기는 각 (작은 ㄱ자로 표시)", note:"👉 그림에 ㄱ자 표시가 있으면 직각이에요."}, suggested_extras:["t_l8_mark","e_l8_table"], tnote:{ask:["각을 읽을 때 가운데에는 무엇이 오나요?","직각인지 어떻게 확인하나요?"], watch:"각과 직각을 같은 말로 쓰는 경우 — 직각은 각의 한 종류임을 짚을 것", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"세 도형을 떠올려요", content:"**직각삼각형** = 한 각이 직각인 삼각형 (직각 1개)\n**직사각형** = 네 각이 모두 직각인 사각형 (직각 4개)\n**정사각형** = 네 각이 모두 직각 + 네 변의 길이가 모두 같음", note:"👉 조건이 하나씩 늘어나는 차례로 기억하면 쉬워요."}, suggested_extras:["e_l8_table","q_l8_diff"], tnote:{ask:["세 도형을 조건으로 견주어 볼까요?","정사각형에만 있는 조건은 무엇인가요?"], watch:"이름은 알지만 조건을 말하지 못하는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**직사각형은 네 변의 길이가 모두 같다**고 생각한다.", right:"직사각형은 **네 각**만 모두 직각이면 돼요. **네 변**의 길이까지 모두 같은 것은 정사각형이에요.", hint:"길쭉한 직사각형을 칠판에 크게 그려 두고 마무리 내내 곁에 두면 헷갈림이 줄어듭니다."}, suggested_extras:["x_l8_quad","q_l8_diff"], tnote:{ask:["이 길쭉한 도형의 네 변은 모두 같나요?","그럼 이름은 무엇인가요?"], watch:"단원 마지막까지 남는 대표 오답 — 조건을 나눠 다시 짚을 것", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"선의 이름", scenario:{icon:"📏", body:"점 ㄱ과 점 ㄴ을 곧게 잇고 양 끝이 점에서 멈췄어요."}, question:"이 선의 이름은 무엇일까요?", input:"count_input", answer:"선분 ㄱㄴ", note:"풀이: 두 점을 곧게 이었고 끝이 정해져 있어요 → **선분 ㄱㄴ**"}, suggested_extras:["e_l8_table"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"ㄱ자 표시가 있는 각", scenario:{icon:"📐", body:"꼭짓점에 작은 ㄱ자가 그려져 있어요."}, question:"이 각의 이름은 무엇일까요?", input:"count_input", answer:"직각", note:"풀이: ㄱ자 표시는 직각을 나타내요 → **직각**"}, suggested_extras:["t_l8_mark"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"직각이 있는 삼각형", scenario:{icon:"🔺", body:"세 각 가운데 한 각에만 ㄱ자 표시가 있어요."}, question:"이 삼각형의 이름은 무엇일까요?", input:"count_input", answer:"직각삼각형", note:"풀이: 한 각이 직각인 삼각형 → **직각삼각형**"}, suggested_extras:["q_l8_diff"]},
      {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"네 변까지 같은 사각형", scenario:{icon:"🟩", body:"네 각이 모두 직각이고 네 변의 길이도 모두 같아요."}, question:"이 사각형의 이름은 무엇일까요?", input:"count_input", answer:"정사각형", note:"풀이: 네 각 직각 + 네 변 길이 같음 → **정사각형**"}, suggested_extras:["x_l8_quad"]},
      {id:"s12", stage:"기본문제", block:"leveled_problem", data:{title:"이름을 붙여 마무리해요", levels:{"기본":{q:"기울어져 있지만 한 각에 ㄱ자 표시가 있는 삼각형의 이름은 무엇일까요?", a:"직각삼각형이에요", steps:["기울어짐은 상관없다","한 각이 직각인지 본다","직각삼각형이에요"]},"도전":{q:"네 각이 모두 직각이고 자로 재니 네 변의 길이가 모두 같았어요. 이 도형의 이름은 무엇일까요?", a:"정사각형이에요", steps:["네 각을 확인한다 → 모두 직각","네 변을 자로 견준다 → 모두 같음","정사각형이에요"]},"심화":{q:"오늘 되짚은 도형 가운데 가장 헷갈렸던 둘을 골라, 무엇으로 가려내면 되는지 짝에게 설명해 봐요.", a:"여러 답 (예: 직사각형과 정사각형 — 네 변의 길이를 재어 가려낸다)", open:true}}}, suggested_extras:["g_l8_quiz","t_l8_two"], tnote:{ask:["무엇을 먼저 확인해야 할까요?","두 도형을 가르는 한 가지는 무엇인가요?"], watch:"이름만 외우고 판정 방법을 말하지 못하는 경우", min:6}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"등굣길에 남은 도형들", scenario:{icon:"🚸", body:"횡단보도는 직사각형, 옐로카펫은 직각삼각형, 안내판은 직사각형 — 지도가 도형으로 가득해요."}, content:"이제 길을 걸으며 도형의 **이름**을 붙일 수 있어요. 아는 만큼 더 많이 보이는 셈이에요."}, suggested_extras:["r_l8_road","b_l8_book"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"펭이가 틀린 곳 찾기", context:"펭이가 이렇게 정리했어요. ① 선분은 두 점을 곧게 이은 선 ② 직각삼각형에는 직각이 있다 ③ 정사각형은 네 변의 길이가 모두 같다 ④ 직사각형도 네 변의 길이가 모두 같다", challenge:"넷 가운데 잘못된 것은 무엇일까요? 왜 그런지 설명해 봐요.", note:"풀이: **④**가 잘못됐어요. 직사각형은 네 각만 모두 직각이면 되고, 네 변의 길이는 같지 않아도 돼요."}, suggested_extras:["x_l8_quad"], tnote:{ask:["넷을 하나씩 따져 볼까요?","④는 어떤 도형의 설명인가요?"], watch:"직관으로 하나만 찍고 까닭을 말하지 못하는 경우", min:5}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"양쪽으로 끝없이 늘인 곧은 선의 이름은?", a:"직선"},{q:"한 각이 직각인 삼각형의 이름은?", a:"직각삼각형"},{q:"네 각이 모두 직각이고 네 변의 길이도 같은 사각형의 이름은?", a:"정사각형"}], self:["평면도형의 이름을 가려 붙일 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"이 단원에서 배운 것", points:["**선** = 선분·반직선·직선 (반직선은 시작점을 먼저 읽는다)","**각·직각** = 두 반직선이 만나 각, ㄱ자 표시가 있으면 직각","**직각삼각형** = 한 각이 직각인 삼각형","**직사각형·정사각형** = 네 각이 모두 직각, 정사각형은 네 변까지 같다"], arrows:["선","각·직각","직각삼각형","직사각형·정사각형"]}, suggested_extras:["e_l8_table"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 돌아봐요", items:["📚 지식·이해 — 평면도형의 종류를 알게 됐나요?","🔧 과정·기능 — 직각과 도형을 가려낼 수 있나요?","💛 가치·태도 — 생활 속 도형에 관심이 생겼나요?"], prompts:["이 단원에서 가장 재미있었던 시간은 언제였나요?","더 알아보고 싶은 것이 생겼나요?"]}, suggested_extras:["c_l8_next"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 단원엔", preview:"평면도형을 마쳤어요. 다음 단원에서는 **똑같이 나누어 주는 셈**을 새로 만나요. 오늘까지 배운 도형은 길에서 계속 찾아봐요.", emoji:"🎉"}, suggested_extras:["c_l8_next"]}
    ],
    extras: [
      {id:"v_l8_review", type:"video", icon:"🎥", title:"평면도형 한눈에 정리", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%ED%8F%89%EB%A9%B4%EB%8F%84%ED%98%95+%EC%A0%95%EB%A6%AC", description:"단원 전체를 짧게 되짚는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","concept"]},
      {id:"v_l8_quiz", type:"video", icon:"🎥", title:"도형 이름 맞히기", url:"https://www.youtube.com/results?search_query=%EB%8F%84%ED%98%95+%EC%9D%B4%EB%A6%84+%ED%80%B4%EC%A6%88+%EC%B4%88%EB%93%B1", description:"그림을 보고 이름을 맞히는 문제 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["basic_problem","leveled_problem"]},
      {id:"q_l8_recall", type:"fun_question", icon:"💡", title:"가장 먼저 떠오르는 이름", content:"이 단원에서 배운 이름 가운데 가장 먼저 떠오르는 것은 무엇인가요? 왜 그럴까요?", fit_slides:["review","concept"]},
      {id:"q_l8_grow", type:"fun_question", icon:"💡", title:"첫 시간과 지금", content:"단원 첫 시간에는 지도를 어떻게 보았나요? 지금은 무엇이 더 보이나요?", fit_slides:["motivate","self_assessment"]},
      {id:"q_l8_diff", type:"fun_question", icon:"💡", title:"둘을 가르는 한 가지", content:"직사각형과 정사각형을 가르는 것은 딱 한 가지예요. 무엇이었나요?", fit_slides:["concept","misconception"]},
      {id:"q_l8_hard", type:"fun_question", icon:"💡", title:"가장 어려웠던 것", content:"이 단원에서 가장 어려웠던 것은 무엇인가요? 어떻게 해결했나요?", fit_slides:["self_assessment","summary"]},
      {id:"q_l8_next", type:"fun_question", icon:"💡", title:"더 알고 싶은 것", content:"도형에 대해 더 알고 싶은 것이 생겼나요? 어떤 것이 궁금한가요?", fit_slides:["self_assessment","next_lesson"]},
      {id:"t_l8_map", type:"tip", icon:"🧩", title:"첫 시간 지도 다시 꺼내기", content:"단원 첫 차시에 쓴 지도를 그대로 꺼내 보이면 배움의 변화가 아이 눈에 보입니다.", fit_slides:["motivate","self_assessment"]},
      {id:"t_l8_mark", type:"tip", icon:"🧩", title:"표시부터 확인하기", content:"마무리 문제에서는 ㄱ자 표시를 먼저 찾게 하세요. 판정이 훨씬 빨라집니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l8_two", type:"tip", icon:"🧩", title:"각 조건·변 조건 나누기", content:"판정 순서를 '각 먼저, 변 나중'으로 고정해 주면 마지막까지 남는 헷갈림이 정리됩니다.", fit_slides:["leveled_problem","misconception"]},
      {id:"t_l8_slow", type:"tip", icon:"🧩", title:"평가는 천천히", content:"마무리 차시는 속도보다 까닭 말하기가 중요합니다. 답을 맞힌 뒤에도 왜 그런지 한 번씩 묻게 하세요.", fit_slides:["basic_problem","advanced_problem"]},
      {id:"e_l8_table", type:"extension", icon:"⬆", title:"단원 정리표 만들기", content:"이름·조건·그림을 한 표에 정리해 붙여 두면 다음 학년까지 쓸 수 있는 자료가 됩니다.", fit_slides:["concept","summary"]},
      {id:"e_l8_find", type:"extension", icon:"⬆", title:"집에서 도형 찾기", content:"집에서 오늘 되짚은 도형을 하나씩 찾아 오게 하면 배움이 교실 밖으로 이어집니다.", fit_slides:["real_world","next_lesson"]},
      {id:"g_l8_quiz", type:"game", icon:"🎮", title:"이름 빨리 맞히기", content:"교사가 도형을 보여 주면 모둠이 이름을 먼저 말하는 마무리 놀이입니다. 까닭까지 말해야 점수를 줍니다.", fit_slides:["leveled_problem","basic_problem"]},
      {id:"g_l8_bingo", type:"game", icon:"🎮", title:"도형 빙고", content:"배운 도형 이름으로 빙고 판을 채우고, 교사가 설명하는 조건에 맞는 칸을 지웁니다.", fit_slides:["summary","concept"]},
      {id:"r_l8_road", type:"real_world", icon:"🌍", title:"길에서 이름 붙이기", content:"등굣길에서 본 것에 배운 이름을 붙여 보게 하면 단원의 장면이 생활로 이어집니다.", fit_slides:["real_world","motivate"]},
      {id:"r_l8_home", type:"real_world", icon:"🌍", title:"집 안의 도형", content:"창문·문·액자·붙임쪽지 — 집 안에도 오늘 되짚은 도형이 가득합니다.", fit_slides:["real_world","self_assessment"]},
      {id:"r_l8_safe", type:"real_world", icon:"🌍", title:"도형과 안전", content:"표지판의 모양만 보고도 무엇을 알리는지 짐작할 수 있습니다. 도형을 아는 것이 안전과 이어집니다.", fit_slides:["real_world","summary"]},
      {id:"b_l8_book", type:"book", icon:"📖", title:"도형 이야기 마무리 읽기", content:"단원을 마치며 도형이 나오는 그림책을 한 권 함께 읽고 아는 이름을 찾아봅니다.", fit_slides:["real_world","next_lesson"]},
      {id:"x_l8_quad", type:"misconception", icon:"❓", title:"직사각형과 정사각형 섞기", content:"단원 마지막까지 남는 대표 오답입니다. 길쭉한 직사각형 그림을 칠판 한쪽에 계속 두세요.", fit_slides:["misconception","advanced_problem"]},
      {id:"x_l8_angle", type:"misconception", icon:"❓", title:"각과 직각 섞기", content:"직각은 각의 한 종류입니다. '모든 각이 직각은 아니다'를 한 번 더 짚어 주세요.", fit_slides:["concept","basic_problem"]},
      {id:"c_l8_next", type:"other_activity", icon:"📚", title:"단원을 마치며", content:"이 단원에서 만든 직각 자와 그림을 모아 학급 게시판에 붙입니다. 다음 단원 전까지 두면 좋습니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

})();
