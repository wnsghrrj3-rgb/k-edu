/* ============================================================================
   3학년 1학기 수학 — 3단원 「나눗셈」 케이티처(교사주도) 차시 데이터 (8차시)
   - 키: window.LESSONS["u3_l{NN}"] (zero-pad). g3_math.html이 자동 로드·누적.
   - 성취기준 [4수01-05]·[4수01-06]. 학생 본차시 01~08 전 차시 대응(1:1).
   ------------------------------------------------------------
   2026-08-20 신규 제작 (40분 표준 v2 · 7요소) — g3 수학 라인 세 번째 단원
   - 차시당 18슬(l01만 19슬) · extras 22
   - 7요소 전 차시: (1)review items(l01 제외·from=이전차시·직전 exit 계승) (2)img 폴백
     (3)서사(곰이·펭이 학급 나눔 장터) (4)offline_activity(l08 마무리 제외 7차시)
     (5)leveled_problem(기본·도전·심화 3탭·심화 open) (6)exit_ticket(확인3+신호등3) (7)tnote 6슬 이상
   - 근거 고정 = 학생 본차시(grade3/semester1/math/3단원_나눗셈/) 검증 값 전수 계승.
     나눗셈·곱셈 식은 게이트 D가 본문에서 긁어 전수 검산한다(나누어떨어지는 식만 쓴다).
     반복해 빼기 줄(12 - 3 - 3 - 3 - 3 = 0)도 이어진 식 전용 검사로 따로 검산한다.
   - 3학년 용어 가드: 이 단원은 나누어떨어지는 나눗셈만 다룬다.
     뒤 단원·뒤 학기 소관(분수, 소수, 나머지, 약수, 배수, 길이의 작은 단위)의 이름·기호는
     학생 노출 자리에 쓰지 않는다.
   - 어려운 용어 가드는 학생 노출 자리에만 건다(교사 몫인 tnote는 제외).
     등분제·포함제 같은 교사 용어는 tnote에서만 쓰고 슬라이드 본문에는 쓰지 않는다.
     -> 게이트 E가 tnote를 걷어낸 본문으로 검사한다.
   - 선행 용어 규약: 나눗셈 기호와 몫은 l04, 식 가족(곱셈과 나눗셈의 관계)은 l05에서 도입.
     -> l01~l03 본문에 나눗셈 기호·몫 선행 노출 금지 / l01~l04 본문에 식 가족 금지.
     주의 예외 = next_lesson 블록은 다음 차시 예고 자리다. (게이트 E가 이 자리를 제외하고 검사)
   - 케이랩 매핑 없음: 똑같이 나누기는 사탕·바둑돌·접시 실물을 손으로 옮기는 편이
     화면 교구보다 우위 (g2_math_klab.js 헤더의 정직 원칙 계승).
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ══════════════════ l01 — 나눗셈을 만나 볼까요 (단원 도입) ══════════════════ */
  window.LESSONS["u3_l01"] = {
    meta: { grade:3, subject:"수학", unit:3, n:1, title:"나눗셈을 만나 볼까요 (단원 도입)", std:"[4수01-05]", duration_min:40,
      lesson_format:"단원 도입 · 40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_01_나눗셈을만나볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"나눗셈을 만나 볼까요\n우리 반 나눔 장터가 열렸어요", emoji:"🍬"}, suggested_extras:["v_l1_intro"]},
      {id:"s02", stage:"도입", block:"objective", data:{title:"이 단원에서 배울 것", content:"똑같이 **공평하게** 나누는 상황을 찾아봐요.\n나누는 **여러 방법**을 알아봐요.\n**나눗셈**으로 배울 내용을 미리 봐요."}, suggested_extras:["t_l1_map"], tnote:{ask:["2학년 때 똑같이 묶어 세기를 어떻게 했나요?","나눈다는 말을 언제 써 보았나요?"], watch:"'나눈다'를 '조금씩 준다'로만 받아들이는 아이", min:2}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이와 펭이가 나눔 장터를 열었어요", kids:[{face:"🐻", label:"곰이\n\"사탕을 나눠 줄게!\""},{face:"🐧", label:"펭이\n\"공책도 나눠요\""}], question:"사탕과 공책을 친구들에게 나누어 주려고 해요. 어떻게 하면 **공평할까요**?", img:"assets/photo/math/share_market.jpg"}, suggested_extras:["q_l1_fair","r_l1_snack","b_l1_share"], tnote:{ask:["공평하다는 말은 무슨 뜻일까요?","어떻게 나누면 다들 기분이 좋을까요?"], watch:"내가 많이 받는 쪽을 공평하다고 말하는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"똑같이 나눈다는 것", content:"**똑같이 나눈다**는 건 **묶음마다 개수가 같아지는** 거예요.", note:"👉 2학년에서 배운 **똑같이 묶어 세기**를 거꾸로 하는 셈이에요."}, suggested_extras:["q_l1_recall"], tnote:{ask:["묶음마다 개수가 같다는 걸 어떻게 확인할까요?","2학년 때 묶어 세기와 무엇이 다른가요?"], watch:"묶음 수와 한 묶음 개수를 섞어 말하는 경우", min:3}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"어느 쪽이 공평할까", content:"묶음마다 **똑같이** → 공평해요.\n묶음마다 **들쭉날쭉** → 공평하지 않아요.", items:[{emoji:"🍬", count:3, label:"**똑같이**\n4개 · 4개 · 4개"},{emoji:"🍬", count:3, label:"**들쭉날쭉**\n2개 · 4개 · 6개"}], note:"👉 개수가 하나라도 다르면 똑같이 나눈 것이 아니에요."}, suggested_extras:["e_l1_check","t_l1_hand"], tnote:{ask:["두 그림의 다른 점은 무엇인가요?","들쭉날쭉한 쪽을 어떻게 고치면 될까요?"], watch:"전체 개수만 같으면 공평하다고 여기는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"생활 곳곳에 나누기가 있어요", content:"간식 나누기 · 팀 나누기 · 자리 나누기처럼 **똑같이 나누는 일**은 생활 곳곳에 있어요.", note:"👉 나눠 준다고 손해가 아니에요. 똑같이 나누면 모두가 함께 기분 좋아요."}, suggested_extras:["r_l1_snack","q_l1_where"], tnote:{ask:["오늘 학교에서 무엇을 나누었나요?","나눌 때 다툼이 생기는 까닭은 무엇일까요?"], watch:"나눔을 '내 것이 줄어드는 일'로만 보는 아이 — 함께 좋은 점을 짚어 줄 것", min:3}},
      {id:"s07", stage:"전개", block:"concept", data:{title:"앞으로 이렇게 배워요", content:"① **똑같이 나누기**(몇 개씩·몇 묶음) → ② **나눗셈식**으로 나타내기 → ③ **곱셈과의 관계** → ④ **곱셈구구**로 빠르게 구하기", note:"👉 손으로 나누던 일을 차츰 식 하나로 간단히 쓰게 돼요."}, suggested_extras:["t_l1_map","c_l1_prep"], tnote:{ask:["가장 궁금한 걸음은 어느 것인가요?","손으로 나누는 것과 식으로 쓰는 것은 무엇이 다를까요?"], watch:"식이라는 말에 미리 겁먹는 아이 — 오늘은 손으로만 해도 된다고 안심시킬 것", min:3}},
      {id:"s08", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"나누기만 하면 되니까 **대충 나눠 줘도** 나눈 것이라고 생각한다.", right:"똑같이 나누기는 **묶음마다 개수가 같아야** 해요. 한 묶음만 많으면 똑같이 나눈 것이 아니에요.", hint:"들쭉날쭉하게 놓은 접시를 보여 주고 \"내가 저 접시를 받으면 어떨까?\"를 물으면 금방 알아챕니다."}, suggested_extras:["x_l1_rough","t_l1_hand"], tnote:{ask:["이 나눔은 왜 공평하지 않을까요?","어느 접시에서 어느 접시로 옮기면 될까요?"], watch:"많이 든 묶음을 그대로 두고 다른 묶음만 채우려는 경우", min:4}},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"사탕을 똑같이 나눠요", scenario:{icon:"🍬", body:"곰이가 사탕 15개를 친구 5명에게 똑같이 나누어 주었어요."}, question:"한 명이 몇 개씩 가질까요?", input:"count_input", answer:3, note:"풀이: 한 명에게 하나씩 번갈아 놓으면 5명 모두 같아져요 → 한 명 **3개**"}, suggested_extras:["e_l1_check"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"공책을 똑같이 나눠요", scenario:{icon:"📒", body:"펭이가 공책 9권을 세 묶음에 똑같이 나누었어요."}, question:"한 묶음에 몇 권씩일까요?", input:"count_input", answer:3, note:"풀이: 세 묶음에 하나씩 번갈아 놓으면 → 한 묶음 **3권**"}, suggested_extras:["e_l1_check"]},
      {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"말로 설명해요", scenario:{icon:"🤔", body:"곰이가 \"똑같이 나눈다\"가 무슨 뜻이냐고 물었어요."}, question:"묶음마다 개수가 어떻다는 뜻일까요?", answer:"같다", note:"풀이: 똑같이 나누면 묶음마다 개수가 서로 **같다**"}, suggested_extras:["q_l1_recall"]},
      {id:"s12", stage:"기본문제", block:"leveled_problem", data:{title:"공평한 나눔 가려내기", levels:{"기본":{q:"사탕 12개를 세 명에게 4개씩 주었어요. 공평한가요?", a:"공평해요", steps:["세 명이 받은 개수를 적는다 → 4 · 4 · 4","세 수가 모두 같은지 본다","모두 같으니 공평해요"]},"도전":{q:"사탕 12개를 세 명에게 2개 · 4개 · 6개로 주었어요. 공평한가요? 공평하려면 몇 개씩이어야 할까요?", a:"공평하지 않아요 · 4개씩", steps:["받은 개수를 적는다 → 2 · 4 · 6","세 수가 다르니 공평하지 않다","많은 쪽에서 적은 쪽으로 옮겨 같게 만든다 → 4개씩"]},"심화":{q:"우리 반에서 똑같이 나누면 좋을 물건을 하나 골라, 몇 묶음으로 어떻게 나눌지 짝에게 설명해 봐요.", a:"여러 답 (예: 색연필 20자루를 모둠 4개에 5자루씩)", open:true}}}, suggested_extras:["g_l1_deal","q_l1_where"], tnote:{ask:["공평한지 아닌지 무엇을 보고 판단했나요?","공평하게 고치려면 어디서 어디로 옮길까요?"], watch:"전체 개수만 확인하고 묶음별 개수는 보지 않는 경우", min:5}},
      {id:"s13", stage:"응용문제", block:"offline_activity", data:{title:"모둠 나눔 장터 열기", type:"group", goal:"모둠이 가진 물건을 똑같이 나누어 보고, 나눈 방법을 말로 설명하기", steps:["모둠마다 바둑돌 24개와 종이 접시 4장을 받는다","접시에 하나씩 번갈아 놓아 똑같이 나눈다","접시마다 몇 개인지 세어 모둠 판에 적는다","접시를 6장으로 바꾸면 어떻게 되는지 다시 해 본다"], materials:["바둑돌","종이 접시","모둠 판"], minutes:8}, suggested_extras:["g_l1_deal","r_l1_class"], tnote:{ask:["하나씩 번갈아 놓으면 왜 같아질까요?","접시 수가 늘면 한 접시의 개수는 어떻게 될까요?"], watch:"한 접시에 몰아 담고 남은 것만 나누는 모둠", min:8}},
      {id:"s14", stage:"응용문제", block:"real_world", data:{title:"나누면 함께 즐거워요", scenario:{icon:"🎪", body:"장터에서 물건을 똑같이 나누면 줄을 선 사람 모두가 같은 양을 받아요."}, content:"똑같이 나누는 힘은 **함께 지내는 힘**이기도 해요. 급식 배식, 모둠 준비물, 놀이 편 가르기까지 모두 같은 생각으로 이어져요."}, suggested_extras:["r_l1_snack","b_l1_share"]},
      {id:"s15", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 장터 정리", context:"곰이가 사탕 20개를 친구 4명에게 똑같이 나누고, 공책 12권을 친구 3명에게 똑같이 나누었어요.", challenge:"한 명이 받은 사탕과 공책은 각각 몇 개일까요? 어떻게 나누었는지도 말해 봐요.", note:"풀이: 사탕은 4명에게 하나씩 번갈아 → 한 명 **5개**. 공책은 3명에게 하나씩 번갈아 → 한 명 **4권**"}, suggested_extras:["e_l1_two","q_l1_where"], tnote:{ask:["두 가지를 한꺼번에 나누면 왜 헷갈릴까요?","하나씩 차례로 정리하면 무엇이 좋아지나요?"], watch:"사탕과 공책의 답을 서로 바꿔 말하는 경우", min:4}},
      {id:"s16", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"묶음마다 개수가 같게 나누는 것을 무엇이라고 하나요?", a:"똑같이 나누기"},{q:"똑같이 나누면 무엇이 좋은가요?", a:"공평해요"},{q:"사탕 15개를 5명에게 똑같이 나누면 한 명이 몇 개인가요?", a:"3개"}], self:["똑같이 나누는 뜻을 알아요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s17", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**똑같이 나눈다**는 것은 묶음마다 개수가 같아지는 것이다.","똑같이 나누면 **공평**하다.","똑같이 나누는 일은 생활 곳곳에 있다.","곰이와 펭이의 나눔 장터가 문을 열었다."], arrows:["똑같이","공평","여러 방법"]}, suggested_extras:["r_l1_class"]},
      {id:"s18", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 똑같이 나눈다는 뜻을 알게 되었나요?","🔧 과정·기능 — 물건을 똑같이 나눌 수 있나요?","💛 가치·태도 — 함께 나누는 마음이 들었나요?"], prompts:["오늘 나눔에서 가장 기분 좋았던 순간은 언제인가요?"]}, suggested_extras:["c_l1_prep"]},
      {id:"s19", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"묶음 수만큼 똑같이 나누어 **한 묶음에 몇 개씩**인지 구해 봐요.", emoji:"🍬"}, suggested_extras:["c_l1_prep"]}
    ],
    extras: [
      {id:"v_l1_intro", type:"video", icon:"🎥", title:"나눗셈 단원 미리보기", url:"https://www.youtube.com/results?search_query=%EC%B4%88%EB%93%B1+3%ED%95%99%EB%85%84+%EB%82%98%EB%88%97%EC%85%88", description:"단원 전체 흐름을 훑는 도입 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","objective"]},
      {id:"v_l1_fair", type:"video", icon:"🎥", title:"똑같이 나누기 장면", url:"https://www.youtube.com/results?search_query=%EB%98%91%EA%B0%99%EC%9D%B4+%EB%82%98%EB%88%84%EA%B8%B0", description:"물건을 하나씩 번갈아 놓아 나누는 짧은 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","basic_problem"]},
      {id:"q_l1_fair", type:"fun_question", icon:"💡", title:"공평이란 무엇일까", content:"똑같이 주는 것이 늘 가장 좋은 방법일까요? 그렇게 생각한 까닭도 말해 봐요.", fit_slides:["motivate","real_world"]},
      {id:"q_l1_recall", type:"fun_question", icon:"💡", title:"묶어 세기 떠올리기", content:"2학년 때 6을 2씩 묶어 세었지요. 오늘 한 일과 어느 쪽이 거꾸로인가요?", fit_slides:["concept","basic_problem"]},
      {id:"q_l1_where", type:"fun_question", icon:"💡", title:"우리 반의 나눔", content:"교실에서 똑같이 나누어 쓰는 물건에는 무엇이 있나요? 어떻게 나누고 있나요?", fit_slides:["concept","leveled_problem"]},
      {id:"q_l1_left", type:"fun_question", icon:"💡", title:"남으면 어떻게 할까", content:"똑같이 나누다 하나가 남으면 어떻게 하면 좋을까요? 여러 가지 방법을 말해 봐요.", fit_slides:["misconception","advanced_problem"]},
      {id:"q_l1_pair", type:"fun_question", icon:"💡", title:"짝에게 내는 문제", content:"연필 몇 자루를 몇 명에게 나눌지 정해 짝에게 문제를 내 봐요.", fit_slides:["leveled_problem","offline_activity"]},
      {id:"t_l1_map", type:"tip", icon:"🧩", title:"단원 지도를 붙여 두기", content:"똑같이 나누기 → 나눗셈식 → 곱셈과의 관계 → 곱셈구구. 칠판 한쪽에 붙여 두고 매 차시 짚으면 아이가 지금 어디쯤인지 압니다.", fit_slides:["objective","summary"]},
      {id:"t_l1_hand", type:"tip", icon:"🧩", title:"손으로 먼저 나누게 하기", content:"첫 차시는 식을 서두르지 않습니다. 실물을 하나씩 번갈아 놓는 경험이 뒤 차시의 밑돌이 됩니다.", fit_slides:["concept","misconception"]},
      {id:"t_l1_count", type:"tip", icon:"🧩", title:"묶음별로 세어 적기", content:"나눈 뒤 묶음마다 개수를 적게 하면 '같은지 다른지'를 눈으로 확인하게 됩니다.", fit_slides:["basic_problem","offline_activity"]},
      {id:"t_l1_word", type:"tip", icon:"🧩", title:"'몇 개씩'과 '몇 묶음' 구분해 말하기", content:"두 물음이 다르다는 감각을 첫 차시부터 말로 심어 두면 l02·l03이 훨씬 수월합니다.", fit_slides:["concept","leveled_problem"]},
      {id:"e_l1_check", type:"extension", icon:"⬆", title:"나눈 결과 표로 적기", content:"묶음마다 개수를 표에 적어 보면 같은지 다른지가 한눈에 드러납니다.", fit_slides:["basic_problem","concept"]},
      {id:"e_l1_two", type:"extension", icon:"⬆", title:"두 가지를 한 번에 나누기", content:"사탕과 공책을 함께 나누어 보면 '무엇을 나누는지' 먼저 정해야 한다는 걸 알게 됩니다.", fit_slides:["advanced_problem","offline_activity"]},
      {id:"g_l1_deal", type:"game", icon:"🎮", title:"카드 나눠 주기 놀이", content:"카드 한 벌을 모둠원에게 하나씩 번갈아 나눠 줍니다. 다 나눈 뒤 각자 몇 장인지 세어 같은지 확인합니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l1_guess", type:"game", icon:"🎮", title:"몇 개씩 맞히기", content:"교사가 전체 개수와 묶음 수를 말하면 한 묶음의 개수를 먼저 외치는 놀이입니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l1_snack", type:"real_world", icon:"🌍", title:"급식 배식도 나눔", content:"급식은 모두에게 같은 양을 나눠 주는 일입니다. 배식판을 떠올리면 똑같이 나누기가 몸으로 이해됩니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l1_class", type:"real_world", icon:"🌍", title:"모둠 준비물 나누기", content:"색종이·풀·가위를 모둠 수만큼 나누는 일이 교실 속 나눗셈입니다.", fit_slides:["offline_activity","summary"]},
      {id:"r_l1_team", type:"real_world", icon:"🌍", title:"편 가르기도 나눔", content:"체육 시간 편 가르기도 사람 수를 똑같이 나누는 일입니다. 한쪽이 많으면 왜 곤란한지 이야기해 보세요.", fit_slides:["real_world","concept"]},
      {id:"b_l1_share", type:"book", icon:"📖", title:"나눔 그림책 찾아보기", content:"도서관에서 '나누기'나 '함께'가 제목에 든 그림책을 찾아 함께 읽어 봅니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l1_rough", type:"misconception", icon:"❓", title:"대충 나눠도 나눈 것?", content:"묶음마다 개수가 다르면 똑같이 나눈 것이 아닙니다. '같은 개수'를 판단 기준으로 못 박아 주세요.", fit_slides:["misconception","concept"]},
      {id:"x_l1_more", type:"misconception", icon:"❓", title:"많이 받는 쪽이 좋은 나눔?", content:"내가 많이 받는 것을 공평하다고 말하는 아이가 있습니다. 받는 쪽을 바꿔 생각하게 하면 스스로 고칩니다.", fit_slides:["misconception","real_world"]},
      {id:"c_l1_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"바둑돌이나 작은 블록 20개쯤을 모둠별로 준비합니다. 다음 시간에 직접 나눕니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l02 — 똑같이 나누어 볼까요 (몇 개씩) ══════════════════ */
  window.LESSONS["u3_l02"] = {
    meta: { grade:3, subject:"수학", unit:3, n:2, title:"똑같이 나누어 볼까요", std:"[4수01-05]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_02_똑같이나누어볼까요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"똑같이 나누어 볼까요\n한 묶음에 몇 개씩일까요", emoji:"🍬"}, suggested_extras:["v_l2_deal"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간 되짚기", from:"u3_l01", items:[{q:"묶음마다 개수가 같게 나누는 것을 무엇이라고 하나요?", a:"똑같이 나누기"},{q:"똑같이 나누면 무엇이 좋은가요?", a:"공평해요"},{q:"사탕 15개를 5명에게 똑같이 나누면 한 명이 몇 개인가요?", a:"3개"}]}, suggested_extras:["q_l2_recall"], tnote:{ask:["지난 시간 어떻게 나누었는지 손으로 보여 줄까요?","오늘은 무엇을 더 알아보면 좋을까요?"], watch:"'똑같이'를 '조금씩'으로 바꿔 말하는 경우", min:3}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"장터에 사탕 12개가 들어왔어요", kids:[{face:"🐻", label:"곰이\n\"친구 3명에게 줄게\""},{face:"🐧", label:"펭이\n\"몇 개씩 줘야 해?\""}], question:"사탕 **12개**를 친구 **3명**에게 똑같이 나누면 한 명이 몇 개씩 받을까요?", img:"assets/photo/math/candy_plates.jpg"}, suggested_extras:["q_l2_guess","r_l2_plate"], tnote:{ask:["먼저 몇 개씩 될지 어림해 볼까요?","어떻게 나누면 확실하게 같아질까요?"], watch:"12과 3을 보고 곧바로 3개씩이라 답하는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"접시 3개에 똑같이 나눠요", content:"사탕 12개를 접시 3개에 **하나씩 번갈아** 놓으면 한 접시에 **4개씩**이에요.", note:"👉 하나씩 번갈아 놓으면 모든 접시의 개수가 저절로 같아져요."}, suggested_extras:["e_l2_deal","t_l2_turn"], tnote:{ask:["왜 하나씩 번갈아 놓으면 같아질까요?","한 접시에 몰아 담으면 무엇이 곤란할까요?"], watch:"한 접시를 다 채운 뒤 다음 접시로 넘어가는 방식", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"또 다른 나눔", content:"공책 **8권**을 **2명**에게 똑같이 나누면 한 명이 **4권씩** 받아요.", note:"👉 물건이 달라져도 나누는 방법은 똑같아요."}, suggested_extras:["e_l2_more"], tnote:{ask:["사탕 나눌 때와 무엇이 같은가요?","권과 개처럼 단위가 달라져도 방법은 같을까요?"], watch:"단위가 바뀌면 방법도 달라진다고 여기는 경우", min:3}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"전체 · 묶음 수 · 한 묶음 개수", content:"**전체**를 **묶음 수**만큼 똑같이 나누면 → **한 묶음 개수**를 알 수 있어요.", items:[{emoji:"🍬", count:1, label:"12을 3묶음으로\n→ 한 묶음 **4개**"},{emoji:"📒", count:1, label:"8을 2묶음으로\n→ 한 묶음 **4권**"}], note:"👉 오늘 구한 것은 '한 묶음에 몇 개씩'이에요."}, suggested_extras:["t_l2_three","q_l2_which"], tnote:{ask:["세 가지 중에서 오늘 구한 것은 무엇인가요?","무엇을 알고 있고 무엇을 몰랐나요?"], watch:"묶음 수와 한 묶음 개수를 바꿔 말하는 경우 — 등분제 상황임을 교사가 짚어 둘 것", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"사탕 12개를 접시 3개에 나눌 때 **접시 수 3**을 그대로 답으로 삼아 한 접시에 **3개**라고 말한다.", right:"3은 **묶음 수**예요. 한 접시의 개수는 직접 나누어 보면 **4개**예요.", hint:"실제로 12개를 세 접시에 번갈아 놓게 하면 4개씩임을 손으로 확인합니다."}, suggested_extras:["x_l2_mix","t_l2_three"], tnote:{ask:["3은 무엇을 나타내는 수인가요?","한 접시의 개수는 어떻게 확인할 수 있나요?"], watch:"문제에 나온 수를 그대로 답으로 옮겨 적는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"접시에 나눠요", scenario:{icon:"🍬", body:"사탕 12개를 접시 3개에 똑같이 나눠요."}, question:"한 접시에 몇 개일까요?", input:"count_input", answer:4, note:"풀이: 하나씩 번갈아 놓으면 → 한 접시 **4개**"}, suggested_extras:["e_l2_deal"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"친구들에게 나눠요", scenario:{icon:"🔵", body:"구슬 12개를 친구 4명에게 똑같이 나눠요."}, question:"한 명이 몇 개일까요?", input:"count_input", answer:3, note:"풀이: 4명에게 하나씩 번갈아 → 한 명 **3개**"}, suggested_extras:["e_l2_more"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"쿠키를 나눠요", scenario:{icon:"🍪", body:"쿠키 10개를 접시 2개에 똑같이 나눠요."}, question:"한 접시에 몇 개일까요?", input:"count_input", answer:5, note:"풀이: 두 접시에 번갈아 놓으면 → 한 접시 **5개**"}, suggested_extras:["q_l2_guess"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"한 묶음의 개수를 구해요", levels:{"기본":{q:"색종이 16장을 4명에게 똑같이 나누면 한 명이 몇 장일까요?", a:"4장", steps:["4명에게 하나씩 번갈아 놓는다","모두 놓일 때까지 되풀이한다","한 명이 4장"]},"도전":{q:"딸기 24개를 접시 6개에 똑같이 나누면 한 접시에 몇 개일까요?", a:"4개", steps:["접시 6개에 하나씩 번갈아 놓는다","한 바퀴 돌 때마다 6개씩 줄어든다","네 바퀴 만에 다 놓인다 → 한 접시 4개"]},"심화":{q:"우리 모둠 사람 수만큼 나눌 수 있는 물건을 찾아, 한 명이 몇 개씩 갖게 되는지 구해 봐요.", a:"여러 답 (예: 색연필 20자루를 5명에게 → 한 명 4자루)", open:true}}}, suggested_extras:["g_l2_race","q_l2_which"], tnote:{ask:["한 바퀴 돌 때마다 몇 개가 줄어드나요?","다 놓일 때까지 몇 바퀴 돌았나요?"], watch:"한 바퀴만 돌고 답을 1개로 적는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"바둑돌 번갈아 놓기", type:"pair", goal:"짝과 바둑돌을 접시에 하나씩 번갈아 놓아 한 묶음의 개수를 직접 구하기", steps:["짝끼리 바둑돌 20개와 종이 접시 4장을 놓는다","한 사람이 하나씩 번갈아 놓고 짝은 바퀴 수를 센다","다 놓은 뒤 한 접시의 개수를 적는다","접시를 5장으로 바꾸어 한 번 더 해 본다"], materials:["바둑돌","종이 접시","기록장"], minutes:8}, suggested_extras:["g_l2_race","t_l2_turn"], tnote:{ask:["바퀴 수와 한 접시의 개수는 어떤 사이인가요?","접시가 늘면 한 접시의 개수는 어떻게 변하나요?"], watch:"세다가 놓친 바둑돌을 그냥 두는 경우 — 다시 세어 확인하게 할 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"자리를 똑같이 나눠요", scenario:{icon:"🪑", body:"의자 20개를 모둠 5개에 똑같이 놓으면 한 모둠에 4개씩이에요."}, content:"교실 자리 배치, 모둠 준비물, 배식판까지 — **한 묶음에 몇 개씩**을 구하는 일은 하루에도 여러 번 일어나요."}, suggested_extras:["r_l2_seat","r_l2_plate"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 접시 바꾸기", context:"곰이가 사탕 24개를 접시 4개에 똑같이 나누었다가, 접시를 6개로 바꾸어 다시 나누었어요.", challenge:"접시가 4개일 때와 6개일 때 한 접시의 개수는 각각 몇 개일까요? 접시가 늘면 개수는 어떻게 되나요?", note:"풀이: 4개일 때는 한 접시 **6개**, 6개일 때는 한 접시 **4개**. 접시가 늘면 한 접시의 개수는 **줄어든다**"}, suggested_extras:["e_l2_more","q_l2_which"], tnote:{ask:["접시가 늘었는데 개수는 왜 줄었을까요?","전체 개수는 그대로인가요?"], watch:"접시가 늘면 개수도 는다고 짐작하는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"전체를 묶음 수만큼 똑같이 나누면 무엇을 알 수 있나요?", a:"한 묶음의 개수"},{q:"사탕 12개를 접시 3개에 똑같이 나누면 한 접시에 몇 개인가요?", a:"4개"},{q:"똑같이 나누었을 때 각 묶음의 개수는 어떤가요?", a:"모두 같아요"}], self:["한 묶음의 개수를 구할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["전체를 **묶음 수**만큼 똑같이 나누면 **한 묶음 개수**를 알 수 있다.","**하나씩 번갈아** 놓으면 모든 묶음이 같아진다.","12을 3묶음으로 나누면 한 묶음 4개, 8을 2묶음으로 나누면 한 묶음 4권이다.","곰이와 펭이가 접시에 사탕을 골고루 놓았다."], arrows:["전체","묶음 수","한 묶음 개수"]}, suggested_extras:["r_l2_seat"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 한 묶음의 개수를 구하는 뜻을 알게 되었나요?","🔧 과정·기능 — 하나씩 번갈아 놓아 나눌 수 있나요?","💛 가치·태도 — 골고루 나누려는 마음이 들었나요?"], prompts:["오늘 나눈 것 중 가장 어려웠던 것은 무엇인가요?"]}, suggested_extras:["c_l2_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"이번엔 거꾸로예요. 한 묶음 개수씩 **묶어 덜어내어 몇 묶음**이 되는지 구해 봐요.", emoji:"📦"}, suggested_extras:["c_l2_prep"]}
    ],
    extras: [
      {id:"v_l2_deal", type:"video", icon:"🎥", title:"하나씩 번갈아 나누기", url:"https://www.youtube.com/results?search_query=%EB%98%91%EA%B0%99%EC%9D%B4+%EB%82%98%EB%88%84%EC%96%B4+%EB%B3%B4%EA%B8%B0", description:"접시에 하나씩 번갈아 놓는 장면을 보여 주는 짧은 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","concept"]},
      {id:"v_l2_share", type:"video", icon:"🎥", title:"똑같이 나누기 활동", url:"https://www.youtube.com/results?search_query=%EB%93%B1%EB%B6%84+%EB%82%98%EB%88%84%EA%B8%B0+%ED%99%9C%EB%8F%99", description:"교실에서 물건을 똑같이 나누는 활동 사례.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["offline_activity","real_world"]},
      {id:"q_l2_recall", type:"fun_question", icon:"💡", title:"지난 시간 떠올리기", content:"지난 시간에는 손으로 어떻게 나누었나요? 그때 무엇을 확인했나요?", fit_slides:["review","concept"]},
      {id:"q_l2_guess", type:"fun_question", icon:"💡", title:"먼저 어림해 보기", content:"나누기 전에 몇 개씩 될지 어림해 보고, 나눈 뒤 맞았는지 견주어 봐요.", fit_slides:["motivate","basic_problem"]},
      {id:"q_l2_which", type:"fun_question", icon:"💡", title:"무엇을 구했나요", content:"오늘 구한 것은 묶음 수인가요, 한 묶음의 개수인가요? 어떻게 알 수 있나요?", fit_slides:["concept","leveled_problem"]},
      {id:"q_l2_zero", type:"fun_question", icon:"💡", title:"딱 맞게 나눠질까", content:"11개를 3명에게 똑같이 나누면 어떻게 될까요? 무엇이 곤란한가요?", fit_slides:["misconception","advanced_problem"]},
      {id:"q_l2_fast", type:"fun_question", icon:"💡", title:"더 빠른 방법", content:"하나씩 놓지 않고도 한 묶음의 개수를 알 방법이 있을까요? 어떤 셈이 떠오르나요?", fit_slides:["advanced_problem","next_lesson"]},
      {id:"t_l2_turn", type:"tip", icon:"🧩", title:"번갈아 놓기를 소리 내어", content:"\"하나, 하나, 하나\" 하고 소리 내며 놓게 하면 한 접시에 몰아 담는 실수가 사라집니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l2_three", type:"tip", icon:"🧩", title:"세 자리를 칠판에 적어 두기", content:"전체 · 묶음 수 · 한 묶음 개수 세 칸을 칠판에 적고 아는 것부터 채우게 하면 무엇을 구하는지 흐려지지 않습니다.", fit_slides:["concept","misconception"]},
      {id:"t_l2_round", type:"tip", icon:"🧩", title:"바퀴 수 세게 하기", content:"한 바퀴에 묶음 수만큼 줄어든다는 감각이 뒤 차시의 곱셈구구로 이어집니다.", fit_slides:["leveled_problem","offline_activity"]},
      {id:"t_l2_unit", type:"tip", icon:"🧩", title:"단위를 붙여 답하게 하기", content:"'4'가 아니라 '한 접시에 4개'라고 말하게 하면 무엇을 구했는지 스스로 확인하게 됩니다.", fit_slides:["basic_problem","summary"]},
      {id:"e_l2_deal", type:"extension", icon:"⬆", title:"바퀴 수로 확인하기", content:"12개를 3접시에 놓으면 네 바퀴가 돕니다. 바퀴 수가 곧 한 접시의 개수라는 것을 발견하게 해 보세요.", fit_slides:["concept","basic_problem"]},
      {id:"e_l2_more", type:"extension", icon:"⬆", title:"묶음 수를 바꿔 보기", content:"같은 24개를 4묶음·6묶음·8묶음으로 나누어 표로 적으면 묶음 수와 개수의 관계가 드러납니다.", fit_slides:["advanced_problem","concept"]},
      {id:"g_l2_race", type:"game", icon:"🎮", title:"똑같이 나누기 대회", content:"모둠별로 같은 개수의 바둑돌을 받아 정해진 접시에 가장 정확히 나누는 놀이입니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l2_call", type:"game", icon:"🎮", title:"몇 개씩 외치기", content:"교사가 \"12를 4묶음!\"이라고 외치면 한 묶음의 개수를 먼저 말하는 놀이입니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l2_plate", type:"real_world", icon:"🌍", title:"배식판의 나눔", content:"배식은 인원수만큼 똑같이 나누는 일입니다. 남거나 모자라면 왜 곤란한지 이야기해 보세요.", fit_slides:["motivate","real_world"]},
      {id:"r_l2_seat", type:"real_world", icon:"🌍", title:"모둠 자리 만들기", content:"의자와 책상을 모둠 수만큼 나누는 일도 오늘 배운 나눔입니다.", fit_slides:["real_world","summary"]},
      {id:"r_l2_gift", type:"real_world", icon:"🌍", title:"선물 포장 나누기", content:"사탕을 봉지 몇 개에 똑같이 담는 일은 가게에서도 늘 일어납니다.", fit_slides:["real_world","offline_activity"]},
      {id:"b_l2_book", type:"book", icon:"📖", title:"수 그림책 함께 보기", content:"물건을 나누는 장면이 있는 그림책을 찾아 함께 읽고, 몇 개씩 나뉘었는지 세어 봅니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l2_mix", type:"misconception", icon:"❓", title:"묶음 수를 답으로 옮기기", content:"문제에 나온 묶음 수를 그대로 답으로 적는 실수가 잦습니다. 무엇을 묻는지 밑줄 긋게 하세요.", fit_slides:["misconception","basic_problem"]},
      {id:"x_l2_pile", type:"misconception", icon:"❓", title:"한 접시부터 몰아 담기", content:"한 접시를 다 채운 뒤 다음으로 넘어가면 마지막 접시가 모자랍니다. 번갈아 놓기를 다시 짚어 주세요.", fit_slides:["misconception","offline_activity"]},
      {id:"c_l2_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"작은 봉지나 지퍼백 여러 장을 준비합니다. 다음 시간엔 묶어 덜어냅니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l03 — 똑같이 묶어 덜어내요 (몇 묶음) ══════════════════ */
  window.LESSONS["u3_l03"] = {
    meta: { grade:3, subject:"수학", unit:3, n:3, title:"똑같이 묶어 덜어내요", std:"[4수01-05]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_03_똑같이묶어덜어내요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"똑같이 묶어 덜어내요\n몇 묶음이 될까요", emoji:"📦"}, suggested_extras:["v_l3_pack"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간 되짚기", from:"u3_l02", items:[{q:"전체를 묶음 수만큼 똑같이 나누면 무엇을 알 수 있나요?", a:"한 묶음의 개수"},{q:"사탕 12개를 접시 3개에 똑같이 나누면 한 접시에 몇 개인가요?", a:"4개"},{q:"똑같이 나누었을 때 각 묶음의 개수는 어떤가요?", a:"모두 같아요"}]}, suggested_extras:["q_l3_recall"], tnote:{ask:["지난 시간에는 무엇을 구했나요?","오늘은 무엇이 달라질까요?"], watch:"'몇 개씩'과 '몇 묶음'을 같은 물음으로 여기는 경우", min:3}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"장터에 스티커가 들어왔어요", kids:[{face:"🐻", label:"곰이\n\"한 명에게 6장씩!\""},{face:"🐧", label:"펭이\n\"몇 명에게 줄 수 있어?\""}], question:"스티커 **18장**을 한 명에게 **6장씩** 나누어 주면 **몇 명**에게 줄 수 있을까요?", img:"assets/photo/math/sticker_bundle.jpg"}, suggested_extras:["q_l3_guess","r_l3_pack"], tnote:{ask:["지난 시간 물음과 무엇이 다른가요?","여기서 6은 무엇을 나타내나요?"], watch:"6을 사람 수로 잘못 읽는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"3개씩 묶어 덜어내요", content:"사탕 **12개**를 **3개씩** 묶어 덜어내면 **4묶음**이 돼요.", note:"👉 한 묶음의 개수를 알고 있고, 묶음 수를 구하는 자리예요."}, suggested_extras:["e_l3_bundle","t_l3_take"], tnote:{ask:["3개씩 덜어낼 때마다 남는 개수는 어떻게 되나요?","언제 그만 덜어내나요?"], watch:"덜어낸 묶음 수가 아니라 남은 개수를 답으로 적는 경우 — 포함제 상황임을 짚어 둘 것", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"같은 수를 반복해 빼요", content:"12에서 3씩 덜어내 봐요.\n12 − 3 − 3 − 3 − 3 = 0\n3을 **4번** 뺐으니 **4묶음**이에요.", note:"👉 똑같이 묶어 덜어내는 것은 **같은 수를 반복해 빼는 것**과 같아요."}, suggested_extras:["e_l3_minus","q_l3_count"], tnote:{ask:["몇 번 뺐는지 어떻게 셌나요?","뺀 횟수와 묶음 수는 왜 같을까요?"], watch:"뺀 횟수를 세지 않고 마지막 수만 보는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"같은 12, 다른 물음", content:"같은 **12**라도 묻는 것이 달라요.\n**3묶음**으로 똑같이 나누면 → 한 묶음 **4개**.\n**3개씩** 묶어 덜어내면 → **4묶음**.", items:[{emoji:"🍬", count:1, label:"3묶음으로\n→ 한 묶음 4개"},{emoji:"📦", count:1, label:"3개씩 묶어\n→ 4묶음"}], note:"👉 무엇을 구하는지 먼저 살펴야 해요."}, suggested_extras:["t_l3_which","q_l3_pair"], tnote:{ask:["두 물음에서 3은 각각 무엇을 나타내나요?","문제에서 어느 낱말을 보고 알 수 있나요?"], watch:"두 상황을 같은 것으로 여기는 경우 — 등분제·포함제의 갈림길", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"구슬 20개를 5개씩 묶어 덜어낸 뒤 **묶음이 5개**라고 말한다.", right:"5는 **한 묶음의 개수**예요. 5씩 덜어내면 네 번 만에 0이 되니 묶음은 **4묶음**이에요.", hint:"실제로 5개씩 덜어내며 묶음을 책상에 늘어놓게 하면 눈으로 4묶음을 셉니다."}, suggested_extras:["x_l3_mix","t_l3_which"], tnote:{ask:["5는 무엇을 나타내는 수인가요?","묶음은 어떻게 세면 확실한가요?"], watch:"한 묶음 개수를 묶음 수로 바꿔 답하는 경우", min:4}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"묶어 덜어내요", scenario:{icon:"🍬", body:"사탕 18개를 6개씩 묶어 덜어내요."}, question:"몇 묶음일까요?", input:"count_input", answer:3, note:"풀이: 18에서 6씩 덜어내면 세 번 만에 0 → **3묶음**"}, suggested_extras:["e_l3_bundle"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"봉지에 담아요", scenario:{icon:"🔵", body:"구슬 12개를 한 봉지에 3개씩 담아요."}, question:"몇 봉지일까요?", input:"count_input", answer:4, note:"풀이: 12에서 3씩 덜어내면 네 번 만에 0 → **4봉지**"}, suggested_extras:["e_l3_minus"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"몇 번 뺐을까요", scenario:{icon:"➖", body:"10 − 2 − 2 − 2 − 2 − 2 = 0"}, question:"2를 몇 번 뺐을까요?", input:"count_input", answer:5, note:"풀이: 뺀 횟수를 세면 **5번** → 2개씩 5묶음"}, suggested_extras:["q_l3_count"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"묶음 수를 구해요", levels:{"기본":{q:"색종이 16장을 한 명에게 4장씩 주면 몇 명에게 줄 수 있을까요?", a:"4명", steps:["16에서 4씩 덜어낸다","16 − 4 − 4 − 4 − 4 = 0","네 번 덜어냈으니 4명"]},"도전":{q:"딸기 24개를 한 접시에 4개씩 담으면 몇 접시일까요?", a:"6접시", steps:["24에서 4씩 덜어낸다","4씩 여섯 번 덜어내면 0이 된다","6접시"]},"심화":{q:"교실 물건 하나를 골라 몇 개씩 묶어 덜어낼지 정하고, 몇 묶음이 되는지 구해 짝에게 설명해 봐요.", a:"여러 답 (예: 색연필 18자루를 3자루씩 → 6묶음)", open:true}}}, suggested_extras:["g_l3_pack","q_l3_pair"], tnote:{ask:["덜어내기를 몇 번 했는지 어디에 적어 두면 좋을까요?","0이 되지 않으면 어떻게 해야 할까요?"], watch:"덜어내다 중간에 횟수를 놓치는 경우 — 묶음을 실제로 늘어놓게 할 것", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"봉지에 담아 묶음 세기", type:"pair", goal:"짝과 물건을 정해진 개수씩 봉지에 담아 묶음 수를 직접 세기", steps:["짝끼리 바둑돌 20개와 작은 봉지 여러 장을 놓는다","한 봉지에 5개씩 담는다","봉지가 몇 개 생겼는지 세어 적는다","한 봉지에 4개씩으로 바꾸어 다시 담아 본다"], materials:["바둑돌","작은 봉지","기록장"], minutes:8}, suggested_extras:["g_l3_pack","t_l3_take"], tnote:{ask:["한 봉지의 개수를 줄이면 봉지 수는 어떻게 되나요?","전체 개수는 그대로인가요?"], watch:"마지막 봉지를 덜 채운 채로 한 묶음으로 세는 경우", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"가게에서도 묶어 담아요", scenario:{icon:"🏪", body:"달걀 30개를 한 판에 10개씩 담으면 세 판이 나와요."}, content:"**몇 묶음**을 구하는 일은 포장·정리·배달에서 늘 쓰여요. 상자를 몇 개 준비할지 미리 알 수 있으니까요."}, suggested_extras:["r_l3_pack","r_l3_shop"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"펭이의 봉지 세기", context:"펭이가 사탕 24개를 한 봉지에 3개씩 담았다가, 다시 한 봉지에 6개씩 담았어요.", challenge:"3개씩 담을 때와 6개씩 담을 때 봉지는 각각 몇 개일까요? 한 봉지에 많이 담으면 봉지 수는 어떻게 되나요?", note:"풀이: 3개씩이면 24에서 3씩 여덟 번 → **8봉지**. 6개씩이면 24에서 6씩 네 번 → **4봉지**. 한 봉지에 많이 담을수록 봉지 수는 **줄어든다**"}, suggested_extras:["e_l3_minus","q_l3_pair"], tnote:{ask:["한 봉지에 많이 담으면 왜 봉지가 줄어들까요?","전체 개수는 달라졌나요?"], watch:"많이 담으면 봉지도 는다고 짐작하는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"전체를 한 묶음 개수씩 똑같이 덜어내면 무엇을 알 수 있나요?", a:"묶음 수"},{q:"사탕 12개를 3개씩 묶어 덜어내면 몇 묶음인가요?", a:"4묶음"},{q:"묶어 덜어내는 것은 어떤 셈과 같은가요?", a:"같은 수를 반복해 빼기"}], self:["묶음 수를 구할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["전체를 **한 묶음 개수**씩 똑같이 덜어내면 **묶음 수**를 알 수 있다.","묶어 덜어내는 것은 **같은 수를 반복해 빼는 것**과 같다.","같은 12라도 무엇을 구하는지에 따라 답이 달라진다.","곰이와 펭이가 봉지를 차곡차곡 쌓았다."], arrows:["전체","한 묶음 개수","묶음 수"]}, suggested_extras:["r_l3_shop"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 묶음 수를 구하는 뜻을 알게 되었나요?","🔧 과정·기능 — 같은 수를 반복해 빼며 묶음을 셀 수 있나요?","💛 가치·태도 — 물건을 정리해 담아 보고 싶어졌나요?"], prompts:["오늘 물음과 지난 시간 물음의 다른 점은 무엇인가요?"]}, suggested_extras:["c_l3_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"그림 없이도 나눔을 적을 수 있어요. **나눗셈식**과 ÷ 기호를 만나 봐요.", emoji:"➗"}, suggested_extras:["c_l3_prep"]}
    ],
    extras: [
      {id:"v_l3_pack", type:"video", icon:"🎥", title:"묶어 담기 장면", url:"https://www.youtube.com/results?search_query=%EB%AC%B6%EC%96%B4+%EB%8D%9C%EC%96%B4%EB%82%B4%EA%B8%B0", description:"정해진 개수씩 묶어 담는 장면을 보여 주는 짧은 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","concept"]},
      {id:"v_l3_minus", type:"video", icon:"🎥", title:"반복해 빼기", url:"https://www.youtube.com/results?search_query=%EA%B0%99%EC%9D%80+%EC%88%98+%EB%B0%98%EB%B3%B5+%EB%B9%BC%EA%B8%B0", description:"같은 수를 되풀이해 빼는 과정을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","basic_problem"]},
      {id:"q_l3_recall", type:"fun_question", icon:"💡", title:"지난 시간과 견주기", content:"지난 시간엔 무엇을 알고 무엇을 구했나요? 오늘은 그 자리가 어떻게 바뀌었나요?", fit_slides:["review","concept"]},
      {id:"q_l3_guess", type:"fun_question", icon:"💡", title:"몇 명일지 어림하기", content:"18장을 6장씩 주면 몇 명쯤 될지 먼저 어림해 보고 확인해 봐요.", fit_slides:["motivate","basic_problem"]},
      {id:"q_l3_count", type:"fun_question", icon:"💡", title:"뺀 횟수 세기", content:"빼는 횟수를 손가락으로 셀까요, 종이에 표시할까요? 어느 쪽이 덜 헷갈리나요?", fit_slides:["concept","leveled_problem"]},
      {id:"q_l3_pair", type:"fun_question", icon:"💡", title:"두 물음 만들기", content:"수 20으로 '몇 개씩'과 '몇 묶음' 두 물음을 각각 만들어 짝에게 내 봐요.", fit_slides:["concept","advanced_problem"]},
      {id:"q_l3_left", type:"fun_question", icon:"💡", title:"딱 떨어지지 않으면", content:"13개를 4개씩 묶으면 어떻게 되나요? 남은 것은 어떻게 하면 좋을까요?", fit_slides:["misconception","advanced_problem"]},
      {id:"t_l3_take", type:"tip", icon:"🧩", title:"덜어낸 묶음을 늘어놓기", content:"덜어낸 묶음을 책상 위에 줄지어 놓게 하면 묶음 수를 눈으로 세게 됩니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l3_which", type:"tip", icon:"🧩", title:"물음에 밑줄 긋기", content:"'몇 개씩'인지 '몇 묶음'인지 문제에서 먼저 밑줄을 긋게 하면 두 상황이 섞이지 않습니다.", fit_slides:["concept","misconception"]},
      {id:"t_l3_mark", type:"tip", icon:"🧩", title:"뺀 횟수 표시하기", content:"덜어낼 때마다 종이에 작대기를 하나씩 그으면 횟수를 놓치지 않습니다.", fit_slides:["basic_problem","leveled_problem"]},
      {id:"t_l3_unit", type:"tip", icon:"🧩", title:"단위를 붙여 답하게 하기", content:"'4'가 아니라 '4묶음' 또는 '4명'이라고 답하게 하면 무엇을 구했는지 스스로 확인합니다.", fit_slides:["basic_problem","summary"]},
      {id:"e_l3_bundle", type:"extension", icon:"⬆", title:"묶음 수 표 만들기", content:"24를 2개씩·3개씩·4개씩·6개씩 묶어 묶음 수를 표로 적으면 규칙이 드러납니다.", fit_slides:["concept","advanced_problem"]},
      {id:"e_l3_minus", type:"extension", icon:"⬆", title:"빼기 줄로 적어 보기", content:"덜어내는 과정을 빼기 줄로 길게 적어 보면 반복해 빼기와 묶기가 같은 일임이 눈에 들어옵니다.", fit_slides:["concept","basic_problem"]},
      {id:"g_l3_pack", type:"game", icon:"🎮", title:"봉지 담기 대회", content:"모둠별로 같은 개수의 바둑돌을 정해진 개수씩 봉지에 담아 봉지 수를 먼저 맞히는 놀이입니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l3_call", type:"game", icon:"🎮", title:"몇 묶음 외치기", content:"교사가 \"18을 6개씩!\"이라고 외치면 묶음 수를 먼저 말하는 놀이입니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l3_pack", type:"real_world", icon:"🌍", title:"택배 상자 세기", content:"물건을 상자에 몇 개씩 담느냐에 따라 상자 수가 달라집니다. 가게에서 늘 하는 셈입니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l3_shop", type:"real_world", icon:"🌍", title:"달걀 한 판", content:"달걀은 한 판에 10개씩 담깁니다. 30개면 몇 판인지 곧바로 알 수 있습니다.", fit_slides:["real_world","summary"]},
      {id:"r_l3_team", type:"real_world", icon:"🌍", title:"모둠 만들기", content:"한 모둠에 4명씩 짜면 우리 반은 몇 모둠이 될까요? 이것도 묶어 덜어내기입니다.", fit_slides:["real_world","offline_activity"]},
      {id:"b_l3_book", type:"book", icon:"📖", title:"정리 이야기 그림책", content:"물건을 상자에 담아 정리하는 장면이 있는 그림책을 찾아 몇 묶음이 되는지 세어 봅니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l3_mix", type:"misconception", icon:"❓", title:"한 묶음 개수를 묶음 수로", content:"5개씩 덜어냈는데 '5묶음'이라 답하는 실수가 잦습니다. 묶음을 직접 늘어놓아 세게 하세요.", fit_slides:["misconception","basic_problem"]},
      {id:"x_l3_stop", type:"misconception", icon:"❓", title:"언제 그만 덜어낼까", content:"0이 될 때까지 덜어내야 하는데 중간에 멈추는 아이가 있습니다. 남은 수를 소리 내어 말하게 하세요.", fit_slides:["misconception","offline_activity"]},
      {id:"c_l3_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"공책과 연필을 준비합니다. 다음 시간부터 나눔을 식으로 적습니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l04 — 나눗셈식으로 나타내요 (÷ 기호·몫) ══════════════════ */
  window.LESSONS["u3_l04"] = {
    meta: { grade:3, subject:"수학", unit:3, n:4, title:"나눗셈식으로 나타내요", std:"[4수01-05]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_04_나눗셈식으로나타내요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"나눗셈식으로 나타내요\n÷ 기호를 만나요", emoji:"➗"}, suggested_extras:["v_l4_sign"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간 되짚기", from:"u3_l03", items:[{q:"전체를 한 묶음 개수씩 똑같이 덜어내면 무엇을 알 수 있나요?", a:"묶음 수"},{q:"사탕 12개를 3개씩 묶어 덜어내면 몇 묶음인가요?", a:"4묶음"},{q:"묶어 덜어내는 것은 어떤 셈과 같은가요?", a:"같은 수를 반복해 빼기"}]}, suggested_extras:["q_l4_recall"], tnote:{ask:["지금까지 나눈 방법을 두 가지로 말해 볼까요?","매번 그림을 그리면 무엇이 번거로울까요?"], watch:"두 방법을 하나로 뭉뚱그려 말하는 경우", min:3}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"곰이가 장부를 펼쳤어요", kids:[{face:"🐻", label:"곰이\n\"매번 그리기 힘들어\""},{face:"🐧", label:"펭이\n\"짧게 적을 수 없을까?\""}], question:"사탕 **12개**를 친구 **4명**에게 똑같이 나눈 일을 **간단한 식**으로 적을 수 없을까요?", img:"assets/photo/math/share_note.jpg"}, suggested_extras:["q_l4_why","r_l4_note"], tnote:{ask:["그림 대신 무엇으로 적으면 좋을까요?","덧셈·뺄셈 기호처럼 나누기에도 기호가 있을까요?"], watch:"식을 어렵게 여겨 미리 물러서는 아이", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"÷ 기호를 만나요", content:"사탕 12개를 4명에게 똑같이 나누면 **12 ÷ 4 = 3**.\n\"**12 나누기 4는 3**\"이라고 읽어요.", note:"👉 그림으로 나누던 일을 식 한 줄로 적을 수 있어요."}, suggested_extras:["e_l4_read","t_l4_say"], tnote:{ask:["식에서 12은 무엇을 나타내나요?","4는 무엇을 나타내나요?"], watch:"기호만 외우고 각 수가 무엇인지 말하지 못하는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"결과를 몫이라고 해요", content:"**12 ÷ 4 = 3**에서 **3**이 **몫**이에요.\n앞은 **전체**, 가운데는 **나누는 수**, 결과가 **몫**!", items:[{emoji:"🍬", count:1, label:"전체\n**12**"},{emoji:"👥", count:1, label:"나누는 수\n**4**"},{emoji:"✅", count:1, label:"몫\n**3**"}], note:"👉 몫은 한 명이 받은 개수예요."}, suggested_extras:["t_l4_three","q_l4_which"], tnote:{ask:["몫은 식의 어느 자리에 있나요?","몫이 무엇을 뜻하는지 말로 설명해 볼까요?"], watch:"몫을 나누는 수와 바꿔 말하는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"두 가지 나눔도 식으로", content:"**4묶음**으로 나누면 **12 ÷ 4 = 3** (한 묶음 3개).\n**3개씩** 덜어내면 **12 ÷ 3 = 4** (4묶음).", note:"👉 앞의 두 차시에서 손으로 하던 일이 각각 식 한 줄이 됐어요."}, suggested_extras:["e_l4_two","q_l4_which"], tnote:{ask:["두 식에서 뒤의 수는 각각 무엇을 나타내나요?","몫이 뜻하는 것도 각각 다른가요?"], watch:"두 식을 같은 뜻으로 읽는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**12 ÷ 4**와 **4 ÷ 12**가 같다고 생각한다.", right:"나눗셈은 **앞뒤 순서**가 중요해요. 앞에는 **전체**, 뒤에는 **나누는 수**를 써요. 두 식은 서로 달라요.", hint:"\"사탕 12개를 4명에게\"와 \"사탕 4개를 12명에게\"를 소리 내어 읽어 주면 다름을 곧바로 느낍니다."}, suggested_extras:["x_l4_order","t_l4_say"], tnote:{ask:["4 ÷ 12는 어떤 상황일까요?","말로 바꿔 읽으면 무엇이 달라지나요?"], watch:"덧셈처럼 순서를 바꿔도 된다고 여기는 경우", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"식으로 적어요", scenario:{icon:"🍬", body:"사탕 12개를 4명에게 똑같이 나눠요."}, question:"알맞은 나눗셈식을 적어 볼까요?", answer:"12 ÷ 4", note:"풀이: 앞에 전체 12, 뒤에 나누는 수 4 → **12 ÷ 4**"}, suggested_extras:["e_l4_read"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"몫을 구해요", scenario:{icon:"➗", body:"20 ÷ 5 를 살펴봐요."}, question:"몫은 얼마일까요?", input:"count_input", answer:4, note:"풀이: 20을 5묶음으로 똑같이 나누면 한 묶음 4개 → 20 ÷ 5 = 4"}, suggested_extras:["t_l4_three"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"몫은 어느 것", scenario:{icon:"🔍", body:"12 ÷ 4 = 3"}, question:"이 식에서 몫은 어느 수일까요?", answer:"3", note:"풀이: 나눗셈의 결과가 몫 → **3**"}, suggested_extras:["q_l4_which"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"상황을 식으로 옮겨요", levels:{"기본":{q:"구슬 18개를 6묶음에 똑같이 나눠요. 알맞은 식과 몫은?", a:"18 ÷ 6 = 3", steps:["전체 18을 앞에 쓴다","묶음 수 6을 뒤에 쓴다","한 묶음의 개수를 구하면 몫은 3"]},"도전":{q:"딸기 24개를 4개씩 묶어 덜어내요. 알맞은 식은?", a:"24 ÷ 4", steps:["전체 24를 앞에 쓴다","한 묶음 개수 4를 뒤에 쓴다","24 ÷ 4"]},"심화":{q:"우리 반에서 있었던 나눔을 하나 떠올려 나눗셈식으로 적고, 몫이 무엇을 뜻하는지 말해 봐요.", a:"여러 답 (예: 색연필 20자루를 5명에게 → 20 ÷ 5, 몫 4는 한 명이 받은 자루 수)", open:true}}}, suggested_extras:["g_l4_card","q_l4_make"], tnote:{ask:["어느 수를 앞에 써야 할까요?","몫이 무엇을 뜻하는지 단위를 붙여 말해 볼까요?"], watch:"전체와 나누는 수를 바꿔 적는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"나눔 카드로 식 만들기", type:"pair", goal:"짝과 상황 카드를 뽑아 알맞은 나눗셈식을 적고 서로 확인하기", steps:["상황 카드를 뒤집어 한 장 뽑는다","카드에 적힌 나눔을 나눗셈식으로 적는다","짝과 식을 바꾸어 앞뒤 순서가 맞는지 확인한다","틀린 식은 말로 바꿔 읽으며 함께 고친다"], materials:["상황 카드","공책","연필"], minutes:8}, suggested_extras:["g_l4_card","t_l4_say"], tnote:{ask:["말로 바꿔 읽으면 왜 틀린 곳이 보일까요?","앞뒤가 바뀐 식은 어떤 상황이 되나요?"], watch:"식만 적고 뜻은 확인하지 않는 짝", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"식은 짧게 남기는 기록", scenario:{icon:"🧾", body:"가게에서는 나눈 결과를 그림이 아니라 짧은 식으로 적어 둡니다."}, content:"식은 **다시 볼 때 빠르게 읽히는 기록**이에요. 그림은 그릴 때마다 달라지지만 식은 누가 봐도 같은 뜻으로 읽혀요."}, suggested_extras:["r_l4_note","r_l4_shop"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"펭이의 두 장부", context:"펭이가 사탕 24개를 장부에 두 줄로 적었어요. 한 줄은 24 ÷ 4, 다른 줄은 24 ÷ 6이에요.", challenge:"두 식의 몫은 각각 얼마이고, 각각 무엇을 뜻할까요?", note:"풀이: 24 ÷ 4 = 6 → 4묶음으로 나누면 한 묶음 6개. 24 ÷ 6 = 4 → 6묶음으로 나누면 한 묶음 4개"}, suggested_extras:["e_l4_two","q_l4_make"], tnote:{ask:["뒤의 수가 달라지면 몫은 어떻게 되나요?","두 몫이 서로 바뀐 것처럼 보이는 까닭은 무엇일까요?"], watch:"두 식의 뜻을 구분하지 않고 답만 적는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"12를 4로 나누는 것을 식으로 어떻게 쓰나요?", a:"12 ÷ 4"},{q:"12 ÷ 4 = 3에서 3을 무엇이라고 하나요?", a:"몫"},{q:"12 ÷ 4와 4 ÷ 12는 같은 식인가요?", a:"달라요"}], self:["나눗셈식을 적을 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["똑같이 나누기를 **÷ 식**으로 나타낸다.","**전체 ÷ 나누는 수 = 몫**이다.","÷는 **앞뒤 순서**가 중요하다.","곰이와 펭이의 장부가 짧아졌다."], arrows:["전체","나누는 수","몫"]}, suggested_extras:["r_l4_shop"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 몫이 무엇인지 알게 되었나요?","🔧 과정·기능 — 상황을 나눗셈식으로 적을 수 있나요?","💛 가치·태도 — 식으로 간단히 적는 편리함을 느꼈나요?"], prompts:["오늘 새로 만난 기호를 어떻게 읽나요?"]}, suggested_extras:["c_l4_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"곱셈과 나눗셈이 어떤 사이인지 알아봐요. 점 배열 하나로 네 가지 식을 읽어 봐요.", emoji:"✖️"}, suggested_extras:["c_l4_prep"]}
    ],
    extras: [
      {id:"v_l4_sign", type:"video", icon:"🎥", title:"나눗셈 기호 알아보기", url:"https://www.youtube.com/results?search_query=%EB%82%98%EB%88%97%EC%85%88+%EA%B8%B0%ED%98%B8", description:"나눗셈 기호와 읽는 법을 다루는 짧은 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","concept"]},
      {id:"v_l4_quot", type:"video", icon:"🎥", title:"몫이란 무엇일까", url:"https://www.youtube.com/results?search_query=%EB%82%98%EB%88%97%EC%85%88+%EB%AA%AB", description:"몫의 뜻을 그림과 함께 설명하는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","basic_problem"]},
      {id:"q_l4_recall", type:"fun_question", icon:"💡", title:"두 방법 떠올리기", content:"지금까지 나눈 두 가지 방법을 손짓으로 설명해 볼까요?", fit_slides:["review","concept"]},
      {id:"q_l4_why", type:"fun_question", icon:"💡", title:"왜 식이 필요할까", content:"그림으로 적을 때와 식으로 적을 때, 무엇이 더 편한가요? 그 까닭은 무엇인가요?", fit_slides:["motivate","real_world"]},
      {id:"q_l4_which", type:"fun_question", icon:"💡", title:"어느 수가 무엇일까", content:"식에 있는 세 수를 손가락으로 짚으며 이름을 붙여 봐요.", fit_slides:["concept","basic_problem"]},
      {id:"q_l4_make", type:"fun_question", icon:"💡", title:"식으로 이야기 만들기", content:"18 ÷ 3에 어울리는 이야기를 만들어 짝에게 들려줘 봐요.", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"q_l4_swap", type:"fun_question", icon:"💡", title:"순서를 바꾸면", content:"덧셈은 순서를 바꿔도 되는데 나눗셈은 왜 안 될까요?", fit_slides:["misconception","concept"]},
      {id:"t_l4_say", type:"tip", icon:"🧩", title:"식을 소리 내어 읽게 하기", content:"\"12 나누기 4는 3\"이라고 읽게 하면 앞뒤 순서가 몸에 붙습니다.", fit_slides:["concept","misconception"]},
      {id:"t_l4_three", type:"tip", icon:"🧩", title:"세 이름 붙여 두기", content:"전체 · 나누는 수 · 몫 세 이름을 칠판에 적고 매번 짚으면 자리 혼동이 줄어듭니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l4_story", type:"tip", icon:"🧩", title:"식을 말로 되돌리기", content:"적은 식을 다시 이야기로 바꿔 말하게 하면 잘못 적은 식이 스스로 드러납니다.", fit_slides:["leveled_problem","offline_activity"]},
      {id:"t_l4_unit", type:"tip", icon:"🧩", title:"몫에 단위 붙이기", content:"몫이 '개'인지 '묶음'인지 붙여 말하게 하면 두 상황이 섞이지 않습니다.", fit_slides:["basic_problem","summary"]},
      {id:"e_l4_read", type:"extension", icon:"⬆", title:"식 읽기 연습", content:"여러 나눗셈식을 소리 내어 읽고, 각 수의 이름을 말하는 짧은 연습을 해 봅니다.", fit_slides:["concept","basic_problem"]},
      {id:"e_l4_two", type:"extension", icon:"⬆", title:"한 상황에서 두 식", content:"같은 12개를 두 가지로 나누어 각각 식으로 적어 보면 뒤의 수가 무엇인지 또렷해집니다.", fit_slides:["concept","advanced_problem"]},
      {id:"g_l4_card", type:"game", icon:"🎮", title:"상황 카드 짝 맞히기", content:"상황 카드와 식 카드를 섞어 놓고 짝을 찾는 놀이입니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l4_quiz", type:"game", icon:"🎮", title:"몫 먼저 말하기", content:"교사가 식을 보여 주면 몫을 먼저 외치는 놀이입니다. 답을 말한 뒤 뜻도 붙여 말하게 합니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l4_note", type:"real_world", icon:"🌍", title:"장부와 기록", content:"가게 장부에는 나눈 결과가 짧은 식으로 남습니다. 다시 볼 때 빠르게 읽히기 때문입니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l4_shop", type:"real_world", icon:"🌍", title:"영수증 속 나눔", content:"여럿이 나누어 낸 값을 적을 때도 나눗셈식이 쓰입니다.", fit_slides:["real_world","summary"]},
      {id:"r_l4_recipe", type:"real_world", icon:"🌍", title:"조리법의 나눔", content:"네 사람 분 조리법을 두 사람 분으로 줄일 때도 나눗셈이 쓰입니다.", fit_slides:["real_world","advanced_problem"]},
      {id:"b_l4_book", type:"book", icon:"📖", title:"기호 이야기 책", content:"수학 기호가 어떻게 생겼는지 다룬 어린이 책을 찾아 함께 읽어 봅니다.", fit_slides:["motivate","concept"]},
      {id:"x_l4_order", type:"misconception", icon:"❓", title:"앞뒤를 바꿔 적기", content:"나누는 수를 앞에 적는 실수가 잦습니다. 말로 바꿔 읽게 하면 스스로 고칩니다.", fit_slides:["misconception","leveled_problem"]},
      {id:"x_l4_quot", type:"misconception", icon:"❓", title:"몫을 나누는 수로 착각", content:"몫이 결과라는 점을 놓치고 가운데 수를 몫이라 답하는 경우가 있습니다. 세 이름을 다시 짚어 주세요.", fit_slides:["misconception","basic_problem"]},
      {id:"c_l4_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"바둑돌 24개를 줄 맞춰 늘어놓을 수 있게 준비합니다. 다음 시간엔 배열을 만듭니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l05 — 곱셈과 나눗셈의 관계 (식 가족) ══════════════════ */
  window.LESSONS["u3_l05"] = {
    meta: { grade:3, subject:"수학", unit:3, n:5, title:"곱셈과 나눗셈의 관계", std:"[4수01-05]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_05_곱셈과나눗셈의관계.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"곱셈과 나눗셈의 관계\n한 배열, 네 식이 한 가족", emoji:"✖️"}, suggested_extras:["v_l5_array"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간 되짚기", from:"u3_l04", items:[{q:"12를 4로 나누는 것을 식으로 어떻게 쓰나요?", a:"12 ÷ 4"},{q:"12 ÷ 4 = 3에서 3을 무엇이라고 하나요?", a:"몫"},{q:"12 ÷ 4와 4 ÷ 12는 같은 식인가요?", a:"달라요"}]}, suggested_extras:["q_l5_recall"], tnote:{ask:["나눗셈식의 세 자리 이름을 말해 볼까요?","2학년 때 배운 곱셈구구도 떠올려 볼까요?"], watch:"곱셈과 나눗셈을 아주 다른 셈으로만 여기는 경우", min:3}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"장터 좌판에 사탕을 줄 맞춰 놓았어요", kids:[{face:"🐻", label:"곰이\n\"가로 3, 세로 4야\""},{face:"🐧", label:"펭이\n\"곱셈으로도 읽히는데?\""}], question:"사탕 **12개**를 가로 **3**, 세로 **4**로 늘어놓았어요. 이 그림을 **곱셈**으로도, **나눗셈**으로도 읽을 수 있을까요?", img:"assets/photo/math/dot_array.jpg"}, suggested_extras:["q_l5_read","r_l5_shelf"], tnote:{ask:["가로로 보면 어떻게 읽히나요?","세로로 보면 어떻게 달라지나요?"], watch:"가로와 세로를 섞어 세는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"배열을 곱셈으로 읽어요", content:"가로로 보면 3씩 4줄 → **3 × 4 = 12**.\n세로로 보면 4씩 3줄 → **4 × 3 = 12**.", note:"👉 같은 배열도 보는 방향에 따라 두 가지 곱셈식이 나와요."}, suggested_extras:["e_l5_dot","t_l5_line"], tnote:{ask:["두 곱셈식의 결과는 왜 같을까요?","줄을 어느 쪽으로 세었는지 말해 볼까요?"], watch:"방향을 바꾸면 개수도 달라진다고 여기는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"같은 배열을 나눗셈으로", content:"12를 3줄로 나누면 **12 ÷ 3 = 4**.\n12를 4개씩 나누면 **12 ÷ 4 = 3**.", note:"👉 곱셈으로 읽던 배열을 그대로 나눗셈으로도 읽을 수 있어요."}, suggested_extras:["e_l5_dot","q_l5_read"], tnote:{ask:["나눗셈으로 읽을 때 12는 어느 자리에 오나요?","몫은 그림의 어디를 가리키나요?"], watch:"몫이 배열의 무엇을 뜻하는지 짚지 못하는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"네 식이 한 가족", content:"**3 × 4 = 12** · **4 × 3 = 12** · **12 ÷ 3 = 4** · **12 ÷ 4 = 3**", items:[{emoji:"✖️", count:2, label:"곱셈 **2개**"},{emoji:"➗", count:2, label:"나눗셈 **2개**"}], note:"👉 3, 4, 12 **세 수**로 만든 네 식이 **한 가족**이에요. 곱셈과 나눗셈은 서로 **반대 관계**예요."}, suggested_extras:["t_l5_family","g_l5_family"], tnote:{ask:["가족을 이루는 세 수는 무엇인가요?","곱셈식을 알면 나눗셈식도 알 수 있는 까닭은 무엇일까요?"], watch:"세 수와 상관없는 식을 가족에 넣는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"가로 4, 세로 6인 배열(24)을 보고 **24 ÷ 8 = 3**도 한 가족이라고 말한다.", right:"가족은 그림에 실제로 쓰인 **세 수(4, 6, 24)**로만 만들어요. 8은 이 배열에 없는 수예요.", hint:"배열 그림 위에 세 수를 크게 적어 두고 \"이 세 수만!\"이라고 못 박아 주면 헷갈리지 않습니다."}, suggested_extras:["x_l5_family","t_l5_family"], tnote:{ask:["이 배열에 쓰인 수는 무엇 무엇인가요?","8은 어디에서 나온 수일까요?"], watch:"답이 맞기만 하면 가족이라고 여기는 경우", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"곱셈을 나눗셈으로", scenario:{icon:"✖️", body:"3 × 4 = 12"}, question:"이 식을 나눗셈식으로 바꿔 볼까요?", answer:"12 ÷ 3 = 4", note:"풀이: 12를 3줄로 나누면 한 줄에 4개 → **12 ÷ 3 = 4**"}, suggested_extras:["e_l5_dot"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"나눗셈을 곱셈으로", scenario:{icon:"➗", body:"12 ÷ 4 = 3"}, question:"이 식을 곱셈식으로 바꿔 볼까요?", answer:"4 × 3 = 12", note:"풀이: 4씩 3줄이면 12 → **4 × 3 = 12**"}, suggested_extras:["t_l5_family"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"배열로 몫 구하기", scenario:{icon:"🔵", body:"바둑돌 20개를 가로 4, 세로 5로 늘어놓았어요."}, question:"20 ÷ 4의 몫은 얼마일까요?", input:"count_input", answer:5, note:"풀이: 4씩 5줄이니 20 ÷ 4 = 5"}, suggested_extras:["e_l5_make"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"식 가족 만들기", levels:{"기본":{q:"2 × 5 = 10을 나눗셈식 두 개로 바꿔 봐요.", a:"10 ÷ 2 = 5 · 10 ÷ 5 = 2", steps:["세 수를 찾는다 → 2, 5, 10","전체 10을 앞에 쓴다","나누는 수를 바꿔 가며 두 식을 만든다"]},"도전":{q:"15 ÷ 3 = 5일 때 ☐ × 5 = 15의 ☐에 알맞은 수는 얼마일까요?", a:"3", steps:["세 수를 찾는다 → 3, 5, 15","곱셈으로 바꾸면 3 × 5 = 15","☐는 3"]},"심화":{q:"바둑돌을 줄 맞춰 늘어놓아 나만의 배열을 만들고, 네 식을 모두 적어 짝에게 설명해 봐요.", a:"여러 답 (예: 가로 4 · 세로 6 → 4 × 6 = 24, 6 × 4 = 24, 24 ÷ 4 = 6, 24 ÷ 6 = 4)", open:true}}}, suggested_extras:["g_l5_family","q_l5_make"], tnote:{ask:["가족을 만들 때 무엇부터 찾나요?","곱셈식 두 개는 왜 나오는 걸까요?"], watch:"나눗셈식을 하나만 적고 끝내는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"바둑돌 배열로 식 가족 만들기", type:"group", goal:"모둠이 바둑돌을 줄 맞춰 늘어놓고 한 배열에서 네 식을 뽑아내기", steps:["모둠에서 바둑돌 24개를 받는다","가로와 세로를 정해 줄 맞춰 늘어놓는다","그 배열에서 곱셈식 2개와 나눗셈식 2개를 적는다","줄 수를 바꾸어 다른 가족도 만들어 본다"], materials:["바둑돌","모둠 판","네임펜"], minutes:8}, suggested_extras:["g_l5_family","e_l5_make"], tnote:{ask:["줄 수를 바꾸면 어떤 가족이 새로 생기나요?","같은 24로 몇 가지 배열이 나오나요?"], watch:"줄을 삐뚤게 놓아 개수를 잘못 세는 모둠 — 자를 대고 맞추게 할 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"진열대에도 배열이 있어요", scenario:{icon:"🧃", body:"가게 진열대에 우유를 가로 5개, 세로 4줄로 놓으면 모두 20개예요."}, content:"줄 맞춰 놓으면 **한꺼번에 세기**도, **똑같이 나누기**도 쉬워요. 배열은 곱셈과 나눗셈을 한 그림에 담은 셈이에요."}, suggested_extras:["r_l5_shelf","r_l5_seat"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 좌판 다시 놓기", context:"곰이가 사탕 24개를 가로 4, 세로 6으로 늘어놓았어요.", challenge:"이 배열에서 만들 수 있는 네 식을 모두 적어 봐요. 몫은 각각 무엇을 뜻할까요?", note:"풀이: 4 × 6 = 24 · 6 × 4 = 24 · 24 ÷ 4 = 6 · 24 ÷ 6 = 4. 24 ÷ 4 = 6의 몫 6은 줄 수, 24 ÷ 6 = 4의 몫 4는 한 줄의 개수"}, suggested_extras:["e_l5_make","q_l5_make"], tnote:{ask:["두 나눗셈의 몫이 뜻하는 것은 왜 다를까요?","곱셈식은 왜 두 개뿐일까요?"], watch:"네 식 중 일부만 적고 끝내는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"3 × 4 = 12를 나눗셈식으로 바꾸면?", a:"12 ÷ 3 = 4"},{q:"한 배열에서 만들 수 있는 식은 모두 몇 개인가요?", a:"4개"},{q:"곱셈과 나눗셈은 서로 어떤 관계인가요?", a:"반대 관계"}], self:["식 가족을 만들 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["하나의 배열로 **곱셈 2개·나눗셈 2개**를 읽을 수 있다.","세 수로 만든 네 식이 **한 가족**이다.","곱셈과 나눗셈은 서로 **반대 관계**다.","곰이와 펭이의 좌판이 줄 맞춰 정리됐다."], arrows:["배열","곱셈 2개","나눗셈 2개"]}, suggested_extras:["r_l5_shelf"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 곱셈과 나눗셈이 어떤 사이인지 알게 되었나요?","🔧 과정·기능 — 한 배열에서 네 식을 뽑아낼 수 있나요?","💛 가치·태도 — 줄 맞춰 정리하는 재미를 느꼈나요?"], prompts:["오늘 만든 식 가족 중 가장 마음에 든 것은 무엇인가요?"]}, suggested_extras:["c_l5_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"이 관계를 써서 **곱셈구구**로 몫을 빠르게 구해 봐요. 그림 없이도 척척!", emoji:"✨"}, suggested_extras:["c_l5_prep"]}
    ],
    extras: [
      {id:"v_l5_array", type:"video", icon:"🎥", title:"점 배열로 보는 곱셈", url:"https://www.youtube.com/results?search_query=%EA%B3%B1%EC%85%88+%EB%B0%B0%EC%97%B4", description:"배열을 가로·세로로 읽는 장면을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","concept"]},
      {id:"v_l5_rel", type:"video", icon:"🎥", title:"곱셈과 나눗셈의 관계", url:"https://www.youtube.com/results?search_query=%EA%B3%B1%EC%85%88%EA%B3%BC+%EB%82%98%EB%88%97%EC%85%88%EC%9D%98+%EA%B4%80%EA%B3%84", description:"두 셈이 반대 관계임을 다루는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","summary"]},
      {id:"q_l5_recall", type:"fun_question", icon:"💡", title:"곱셈구구 떠올리기", content:"2학년 때 외운 곱셈구구 중 가장 잘 떠오르는 단은 무엇인가요?", fit_slides:["review","concept"]},
      {id:"q_l5_read", type:"fun_question", icon:"💡", title:"두 방향으로 읽기", content:"같은 배열을 가로로 읽을 때와 세로로 읽을 때, 무엇이 같고 무엇이 다른가요?", fit_slides:["motivate","concept"]},
      {id:"q_l5_make", type:"fun_question", icon:"💡", title:"가족 더 찾기", content:"수 36으로 만들 수 있는 배열은 몇 가지일까요? 하나씩 찾아봐요.", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"q_l5_why", type:"fun_question", icon:"💡", title:"왜 반대일까", content:"곱셈이 모으는 셈이라면 나눗셈은 어떤 셈일까요? 말로 설명해 봐요.", fit_slides:["concept","summary"]},
      {id:"q_l5_odd", type:"fun_question", icon:"💡", title:"줄이 안 맞는 수", content:"7개는 줄 맞춰 늘어놓기가 왜 어려울까요? 어떤 수가 배열을 만들기 쉬운가요?", fit_slides:["misconception","offline_activity"]},
      {id:"t_l5_line", type:"tip", icon:"🧩", title:"줄을 손으로 쓸어 세기", content:"가로줄과 세로줄을 손바닥으로 쓸며 세게 하면 방향을 섞지 않습니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l5_family", type:"tip", icon:"🧩", title:"세 수를 크게 적어 두기", content:"배열 옆에 세 수를 크게 적어 두면 가족에 남의 수가 끼어드는 실수가 사라집니다.", fit_slides:["concept","misconception"]},
      {id:"t_l5_four", type:"tip", icon:"🧩", title:"네 칸 틀 주기", content:"곱셈 두 칸·나눗셈 두 칸이 그려진 틀을 주면 하나만 적고 끝내는 일이 줄어듭니다.", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"t_l5_grid", type:"tip", icon:"🧩", title:"모눈 위에 놓게 하기", content:"모눈종이 위에 바둑돌을 놓으면 줄이 저절로 맞아 개수 세기가 정확해집니다.", fit_slides:["offline_activity","basic_problem"]},
      {id:"e_l5_dot", type:"extension", icon:"⬆", title:"배열 그림에 식 적기", content:"배열 그림 네 귀퉁이에 각각의 식을 적어 두면 한 그림에서 네 식이 나온다는 것이 한눈에 보입니다.", fit_slides:["concept","basic_problem"]},
      {id:"e_l5_make", type:"extension", icon:"⬆", title:"같은 수로 여러 배열", content:"24로 만들 수 있는 배열을 모두 찾아 각각의 가족을 적어 보면 규칙이 드러납니다.", fit_slides:["advanced_problem","offline_activity"]},
      {id:"g_l5_family", type:"game", icon:"🎮", title:"식 가족 찾기 놀이", content:"카드에 적힌 식들을 섞어 놓고 같은 세 수로 된 네 식을 모으는 놀이입니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l5_flip", type:"game", icon:"🎮", title:"뒤집어 말하기", content:"교사가 곱셈식을 말하면 나눗셈식으로, 나눗셈식을 말하면 곱셈식으로 바꿔 외치는 놀이입니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l5_shelf", type:"real_world", icon:"🌍", title:"진열대의 줄", content:"가게 진열대는 줄 맞춰 놓입니다. 세기도 나누기도 쉬워지기 때문입니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l5_seat", type:"real_world", icon:"🌍", title:"강당 의자 배열", content:"강당 의자도 줄과 열로 놓입니다. 몇 명이 앉을 수 있는지 곱셈으로 곧바로 알 수 있습니다.", fit_slides:["real_world","summary"]},
      {id:"r_l5_egg", type:"real_world", icon:"🌍", title:"달걀판의 배열", content:"달걀판은 가로 5, 세로 2처럼 배열로 짜여 있습니다. 한 판이 몇 개인지 세어 보세요.", fit_slides:["real_world","concept"]},
      {id:"b_l5_book", type:"book", icon:"📖", title:"곱셈 그림책", content:"물건이 줄 맞춰 늘어선 그림책을 찾아 배열을 세어 봅니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l5_family", type:"misconception", icon:"❓", title:"남의 수를 가족에 넣기", content:"답이 맞기만 하면 가족이라 여기는 실수가 잦습니다. 배열에 쓰인 세 수인지 먼저 확인하게 하세요.", fit_slides:["misconception","leveled_problem"]},
      {id:"x_l5_dir", type:"misconception", icon:"❓", title:"가로세로를 섞어 세기", content:"가로로 세다 세로로 넘어가면 개수가 틀립니다. 한 방향을 끝까지 세게 하세요.", fit_slides:["misconception","offline_activity"]},
      {id:"c_l5_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"곱셈구구표를 한 장씩 준비합니다. 다음 시간엔 구구로 몫을 찾습니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l06 — 곱셈구구로 몫을 구해요 ══════════════════ */
  window.LESSONS["u3_l06"] = {
    meta: { grade:3, subject:"수학", unit:3, n:6, title:"곱셈구구로 몫을 구해요", std:"[4수01-06]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_06_곱셈구구로몫을구해요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"곱셈구구로 몫을 구해요\n그림 없이도 빠르게", emoji:"✨"}, suggested_extras:["v_l6_gugu"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간 되짚기", from:"u3_l05", items:[{q:"3 × 4 = 12를 나눗셈식으로 바꾸면?", a:"12 ÷ 3 = 4"},{q:"한 배열에서 만들 수 있는 식은 모두 몇 개인가요?", a:"4개"},{q:"곱셈과 나눗셈은 서로 어떤 관계인가요?", a:"반대 관계"}]}, suggested_extras:["q_l6_recall"], tnote:{ask:["곱셈식을 알면 나눗셈식도 안다고 했지요. 왜 그럴까요?","오늘은 이 관계를 어디에 써 볼까요?"], watch:"관계는 말하지만 실제 계산에 쓰지 못하는 경우", min:3}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"장터에 손님이 몰렸어요", kids:[{face:"🐻", label:"곰이\n\"점을 다 세려니 느려\""},{face:"🐧", label:"펭이\n\"외운 구구를 쓰자!\""}], question:"큰 수를 나눌 때 점을 하나하나 세면 번거로워요. 외운 **곱셈구구**로 몫을 빠르게 구할 수 없을까요?", img:"assets/photo/math/gugu_table.jpg"}, suggested_extras:["q_l6_fast","r_l6_shop"], tnote:{ask:["하나씩 세는 방법의 좋은 점과 불편한 점은 무엇인가요?","더 빠른 길이 있을까요?"], watch:"빠른 방법만 좇고 뜻을 놓치는 아이 — 뜻은 앞 차시에서 다졌음을 짚어 줄 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"나눗셈을 곱셈식으로 바꿔요", content:"**12 ÷ 3**의 몫을 구하려면 **3 × ☐ = 12**가 되는 ☐를 찾아요.", note:"👉 몫을 모르는 자리에 ☐를 놓고 곱셈으로 바꾸는 것이 첫걸음이에요."}, suggested_extras:["e_l6_box","t_l6_box"], tnote:{ask:["☐는 식에서 무엇을 나타내나요?","왜 3을 앞에 쓸까요?"], watch:"☐를 아무 자리에나 놓는 경우", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"곱셈구구로 ☐를 찾아요", content:"3단 곱셈구구에서 **3 × 4 = 12**!\n그래서 **12 ÷ 3 = 4**예요.", note:"👉 나누는 수의 단을 떠올리면 몫이 곧바로 나와요."}, suggested_extras:["e_l6_row","g_l6_race"], tnote:{ask:["어느 단을 떠올려야 할까요?","그 단에서 12를 어떻게 찾았나요?"], watch:"전체 수의 단을 떠올려 헤매는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"곱셈으로 다시 확인해요", content:"몫을 구한 뒤 **나누는 수 × 몫 = 전체**인지 확인해요.\n**24 ÷ 4 = 6** → **4 × 6 = 24** ✓", note:"👉 확인까지 하면 실수를 스스로 잡아낼 수 있어요."}, suggested_extras:["t_l6_check","q_l6_check"], tnote:{ask:["확인할 때 어떤 두 수를 곱하나요?","확인이 맞지 않으면 어디를 다시 볼까요?"], watch:"확인 식에 전체 수를 곱해 넣는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**12 ÷ 3 = 4**가 맞는지 **4 × 12 = 48**로 확인하려 한다.", right:"확인은 **나누는 수 × 몫**이에요. **3 × 4 = 12**가 되어야 맞아요.", hint:"확인 식의 두 수는 '나누는 수'와 '몫'이라고 손가락으로 짚어 주면 자리 혼동이 사라집니다."}, suggested_extras:["x_l6_check","t_l6_check"], tnote:{ask:["확인 식에 들어갈 두 수는 어느 것인가요?","전체 수는 어디에 나와야 하나요?"], watch:"확인 결과가 전체와 달라도 그냥 넘어가는 경우", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"어떤 곱셈식이 필요할까", scenario:{icon:"➗", body:"12 ÷ 3 의 몫을 구하려고 해요."}, question:"알맞은 곱셈식은 무엇일까요?", answer:"3 × ☐ = 12", note:"풀이: 나누는 수 3을 앞에 두고 몫 자리를 ☐로 → **3 × ☐ = 12**"}, suggested_extras:["e_l6_box"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"구구로 몫 찾기", scenario:{icon:"✨", body:"6 × ☐ = 18을 떠올려 봐요."}, question:"18 ÷ 6 의 몫은 얼마일까요?", input:"count_input", answer:3, note:"풀이: 6단에서 6 × 3 = 18 → 18 ÷ 6 = 3"}, suggested_extras:["e_l6_row"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"조금 더 큰 수", scenario:{icon:"✨", body:"4 × ☐ = 24를 떠올려 봐요."}, question:"24 ÷ 4 의 몫은 얼마일까요?", input:"count_input", answer:6, note:"풀이: 4단에서 4 × 6 = 24 → 24 ÷ 4 = 6"}, suggested_extras:["q_l6_fast"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"구구로 몫 구하고 확인하기", levels:{"기본":{q:"20 ÷ 5의 몫을 곱셈구구로 구해 봐요.", a:"4", steps:["5 × ☐ = 20으로 바꾼다","5단에서 5 × 4 = 20을 찾는다","몫은 4"]},"도전":{q:"16 ÷ 4의 몫을 구하고, 곱셈으로 맞는지 확인해 봐요.", a:"4 · 확인 4 × 4 = 16", steps:["4 × ☐ = 16으로 바꾼다","4단에서 4 × 4 = 16을 찾는다","몫 4 · 나누는 수 × 몫으로 확인 → 4 × 4 = 16"]},"심화":{q:"곱셈구구표에서 몫이 6이 되는 나눗셈식을 여러 개 찾아 적고, 어떻게 찾았는지 설명해 봐요.", a:"여러 답 (예: 18 ÷ 3 = 6, 24 ÷ 4 = 6, 30 ÷ 5 = 6)", open:true}}}, suggested_extras:["g_l6_race","q_l6_check"], tnote:{ask:["어느 단부터 살펴보면 빠를까요?","확인까지 마친 뒤에 답을 적었나요?"], watch:"몫만 적고 확인을 건너뛰는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"곱셈구구표에서 몫 찾기", type:"pair", goal:"짝과 곱셈구구표를 짚어 가며 나눗셈의 몫을 빠르게 찾고 확인하기", steps:["짝끼리 곱셈구구표를 한 장씩 편다","한 사람이 나눗셈식을 말하면 다른 사람이 표에서 몫을 찾는다","찾은 몫을 나누는 수와 곱해 전체가 되는지 확인한다","역할을 바꾸어 다섯 문제씩 주고받는다"], materials:["곱셈구구표","기록장","연필"], minutes:8}, suggested_extras:["g_l6_race","t_l6_row"], tnote:{ask:["표에서 어느 줄을 먼저 보나요?","확인이 맞지 않을 때 어떻게 했나요?"], watch:"표를 눈으로만 훑어 엉뚱한 칸을 짚는 경우 — 손가락으로 줄을 따라가게 할 것", min:8}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"빠르게 셈하는 힘", scenario:{icon:"🏪", body:"가게에서는 손님을 기다리게 할 수 없어 몫을 머릿속으로 구합니다."}, content:"외워 둔 곱셈구구는 **머릿속 표**예요. 그림을 그리지 않고도 나눔을 곧바로 셈할 수 있게 해 줘요."}, suggested_extras:["r_l6_shop","r_l6_time"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"펭이의 빠른 셈", context:"펭이가 사탕 24개를 4명에게, 공책 18권을 6명에게 똑같이 나누려고 해요.", challenge:"두 나눔의 몫을 곱셈구구로 구하고, 곱셈으로 각각 확인해 봐요.", note:"풀이: 4 × 6 = 24 → 24 ÷ 4 = 6. 6 × 3 = 18 → 18 ÷ 6 = 3. 확인도 같은 곱셈식으로 마친다"}, suggested_extras:["e_l6_row","q_l6_check"], tnote:{ask:["두 나눔에서 떠올린 단은 각각 무엇인가요?","확인 식은 몇 개 필요할까요?"], watch:"한쪽만 확인하고 넘어가는 경우", min:4}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"12 ÷ 3의 몫을 구하려면 어떤 곱셈식을 떠올리나요?", a:"3 × ☐ = 12"},{q:"24 ÷ 4의 몫은 얼마인가요?", a:"6"},{q:"구한 몫이 맞는지 어떻게 확인하나요?", a:"나누는 수 × 몫 = 전체"}], self:["곱셈구구로 몫을 구할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["**나누는 수 × ☐ = 전체**가 되는 ☐가 몫이다.","외운 **곱셈구구**로 몫을 빠르게 구한다.","**나누는 수 × 몫 = 전체**로 다시 확인한다.","곰이와 펭이가 손님을 기다리게 하지 않았다."], arrows:["곱셈식으로","구구로 찾기","곱셈으로 확인"]}, suggested_extras:["r_l6_time"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 몫을 구하는 방법을 알게 되었나요?","🔧 과정·기능 — 곱셈구구로 몫을 찾고 확인할 수 있나요?","💛 가치·태도 — 스스로 확인하는 습관이 생겼나요?"], prompts:["오늘 가장 빨리 떠오른 단은 무엇인가요?"]}, suggested_extras:["c_l6_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"지금까지 배운 것을 모두 모아 **나눗셈으로 문제를 해결해** 봐요.", emoji:"🧩"}, suggested_extras:["c_l6_prep"]}
    ],
    extras: [
      {id:"v_l6_gugu", type:"video", icon:"🎥", title:"곱셈구구로 몫 구하기", url:"https://www.youtube.com/results?search_query=%EA%B3%B1%EC%85%88%EA%B5%AC%EA%B5%AC%EB%A1%9C+%EB%AA%AB+%EA%B5%AC%ED%95%98%EA%B8%B0", description:"나눗셈을 곱셈식으로 바꿔 몫을 찾는 과정을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","concept"]},
      {id:"v_l6_check", type:"video", icon:"🎥", title:"곱셈으로 확인하기", url:"https://www.youtube.com/results?search_query=%EB%82%98%EB%88%97%EC%85%88+%EA%B3%B1%EC%85%88%EC%9C%BC%EB%A1%9C+%ED%99%95%EC%9D%B8", description:"구한 몫을 곱셈으로 되짚어 확인하는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","misconception"]},
      {id:"q_l6_recall", type:"fun_question", icon:"💡", title:"관계 떠올리기", content:"지난 시간에 만든 식 가족 하나를 말해 보고, 오늘 어디에 쓰일지 짐작해 봐요.", fit_slides:["review","concept"]},
      {id:"q_l6_fast", type:"fun_question", icon:"💡", title:"어느 쪽이 빠를까", content:"점을 하나씩 세는 것과 구구를 떠올리는 것, 어느 쪽이 빠른가요? 늘 그럴까요?", fit_slides:["motivate","real_world"]},
      {id:"q_l6_check", type:"fun_question", icon:"💡", title:"확인이 필요한 까닭", content:"답을 구한 뒤 확인하는 습관은 왜 도움이 될까요?", fit_slides:["concept","leveled_problem"]},
      {id:"q_l6_which", type:"fun_question", icon:"💡", title:"어느 단일까", content:"35 ÷ 5의 몫을 구하려면 몇 단을 떠올려야 할까요? 왜 그런가요?", fit_slides:["basic_problem","leveled_problem"]},
      {id:"q_l6_none", type:"fun_question", icon:"💡", title:"구구에 없는 수", content:"13 ÷ 4처럼 구구에서 딱 맞는 칸이 없으면 어떻게 될까요?", fit_slides:["misconception","advanced_problem"]},
      {id:"t_l6_box", type:"tip", icon:"🧩", title:"☐를 크게 그리기", content:"몫 자리를 큰 네모로 그려 두면 어느 자리를 구하는지 흐려지지 않습니다.", fit_slides:["concept","basic_problem"]},
      {id:"t_l6_row", type:"tip", icon:"🧩", title:"나누는 수의 단부터", content:"전체 수가 아니라 나누는 수의 단을 먼저 떠올리게 하는 것이 요령입니다.", fit_slides:["concept","offline_activity"]},
      {id:"t_l6_check", type:"tip", icon:"🧩", title:"확인 식을 한 줄 더 쓰게", content:"몫 옆에 확인 식을 한 줄 더 적게 하면 실수를 스스로 잡습니다.", fit_slides:["concept","misconception"]},
      {id:"t_l6_speed", type:"tip", icon:"🧩", title:"속도보다 뜻 먼저", content:"빠르기를 겨루기 전에 몫이 무엇을 뜻하는지 한 번 말하게 하면 기계적 암기로 흐르지 않습니다.", fit_slides:["leveled_problem","summary"]},
      {id:"e_l6_box", type:"extension", icon:"⬆", title:"☐ 넣기 문제 만들기", content:"나눗셈식을 곱셈식으로 바꿔 ☐ 넣기 문제로 만들어 짝과 주고받습니다.", fit_slides:["concept","leveled_problem"]},
      {id:"e_l6_row", type:"extension", icon:"⬆", title:"구구표에서 나눗셈 찾기", content:"곱셈구구표의 한 칸을 고르면 나눗셈식 두 개가 따라 나옵니다. 표 위에서 직접 찾아봅니다.", fit_slides:["offline_activity","advanced_problem"]},
      {id:"g_l6_race", type:"game", icon:"🎮", title:"몫 빨리 찾기", content:"교사가 나눗셈식을 보여 주면 몫을 먼저 말하는 놀이입니다. 말한 뒤 확인 식도 붙이게 합니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l6_pair", type:"game", icon:"🎮", title:"짝 찾기 카드", content:"나눗셈 카드와 곱셈 카드를 섞어 놓고 짝이 되는 카드를 찾는 놀이입니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l6_shop", type:"real_world", icon:"🌍", title:"가게의 빠른 셈", content:"물건을 봉지에 나눠 담을 때 가게에서는 머릿속으로 몫을 구합니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l6_time", type:"real_world", icon:"🌍", title:"시간을 나눌 때", content:"40분을 네 활동으로 나누면 한 활동에 10분씩입니다. 수업 계획에도 나눗셈이 쓰입니다.", fit_slides:["real_world","summary"]},
      {id:"r_l6_team", type:"real_world", icon:"🌍", title:"모둠 짜기", content:"우리 반 인원을 모둠 인원으로 나누면 모둠 수가 나옵니다. 구구로 곧바로 구할 수 있습니다.", fit_slides:["real_world","advanced_problem"]},
      {id:"b_l6_book", type:"book", icon:"📖", title:"구구 이야기 책", content:"곱셈구구를 이야기로 풀어낸 어린이 책을 찾아 함께 읽어 봅니다.", fit_slides:["motivate","concept"]},
      {id:"x_l6_check", type:"misconception", icon:"❓", title:"확인 식에 전체를 곱하기", content:"확인할 때 전체 수를 곱해 넣는 실수가 잦습니다. '나누는 수 × 몫'을 소리 내어 말하게 하세요.", fit_slides:["misconception","leveled_problem"]},
      {id:"x_l6_row", type:"misconception", icon:"❓", title:"엉뚱한 단 떠올리기", content:"전체 수의 단을 떠올려 헤매는 경우가 있습니다. 나누는 수의 단임을 다시 짚어 주세요.", fit_slides:["misconception","basic_problem"]},
      {id:"c_l6_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"공책과 곱셈구구표를 그대로 가져옵니다. 다음 시간엔 문제 해결에 씁니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l07 — 나눗셈으로 해결해요 ══════════════════ */
  window.LESSONS["u3_l07"] = {
    meta: { grade:3, subject:"수학", unit:3, n:7, title:"나눗셈으로 해결해요", std:"[4수01-06]", duration_min:40,
      lesson_format:"40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_07_나눗셈으로해결해요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"나눗셈으로 해결해요\n배운 것을 모두 모아", emoji:"🧩"}, suggested_extras:["v_l7_solve"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간 되짚기", from:"u3_l06", items:[{q:"12 ÷ 3의 몫을 구하려면 어떤 곱셈식을 떠올리나요?", a:"3 × ☐ = 12"},{q:"24 ÷ 4의 몫은 얼마인가요?", a:"6"},{q:"구한 몫이 맞는지 어떻게 확인하나요?", a:"나누는 수 × 몫 = 전체"}]}, suggested_extras:["q_l7_recall"], tnote:{ask:["지금까지 배운 것을 순서대로 말해 볼까요?","오늘은 그 가운데 무엇을 쓰게 될까요?"], watch:"배운 것을 낱낱으로만 기억하고 이어 쓰지 못하는 경우", min:3}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"장터에 물건이 남았어요", kids:[{face:"🐻", label:"곰이\n\"남은 걸 나눠 주자\""},{face:"🐧", label:"펭이\n\"무엇부터 정하지?\""}], question:"남은 물건을 친구들에게 공평하게 나누어 주려면 **무엇을 먼저 살펴야** 할까요?", img:"assets/photo/math/market_end.jpg"}, suggested_extras:["q_l7_first","r_l7_market"], tnote:{ask:["문제에서 가장 먼저 찾을 것은 무엇인가요?","무엇을 구하는지 어디를 보면 알 수 있나요?"], watch:"수부터 찾아 곧바로 셈에 들어가는 경우", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"한 명에게 몇 개씩?", content:"사탕 12개를 **4명**에게 똑같이 나누면 → 한 명에게 몇 개?\n**12 ÷ 4 = 3**", note:"👉 묶음 수를 알고 한 묶음의 개수를 구하는 자리예요."}, suggested_extras:["e_l7_two","t_l7_mark"], tnote:{ask:["여기서 4는 무엇을 나타내나요?","몫 3은 무엇을 뜻하나요? 단위를 붙여 말해 볼까요?"], watch:"몫에 단위를 붙이지 않아 뜻이 흐려지는 경우 — 등분제 자리임을 짚어 둘 것", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"몇 묶음?", content:"사탕 12개를 **3개씩** 봉지에 담으면 → 몇 봉지?\n**12 ÷ 3 = 4**", note:"👉 한 묶음의 개수를 알고 묶음 수를 구하는 자리예요."}, suggested_extras:["e_l7_two","q_l7_first"], tnote:{ask:["여기서 3은 무엇을 나타내나요?","앞의 식과 무엇이 달라졌나요?"], watch:"두 식의 뒤 수를 같은 뜻으로 읽는 경우 — 포함제 자리임을 짚어 둘 것", min:5}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"같은 12, 여러 방법", content:"같은 12도 여러 방법으로 똑같이 나눌 수 있어요.\n**2 × 6 = 12** · **3 × 4 = 12** · **4 × 3 = 12** · **6 × 2 = 12**", note:"👉 나누는 수를 바꾸면 몫도 함께 바뀌어요."}, suggested_extras:["e_l7_many","g_l7_hunt"], tnote:{ask:["12를 나눌 수 있는 방법은 몇 가지인가요?","5명에게 똑같이 나누면 왜 곤란할까요?"], watch:"어떤 수로도 늘 나눠진다고 여기는 경우", min:4}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"사탕 12개를 **3개씩 묶는 것**을 한 명에게 3개씩 주는 것과 같다고 여겨 **묶음 수와 개수를 바꿔** 답한다.", right:"3개씩 묶으면 구하는 것은 **묶음 수(4묶음)**예요. 무엇을 구하는지 문제에서 먼저 찾아야 해요.", hint:"문제의 물음 부분에 밑줄을 긋게 하고 \"몇 개씩?\"인지 \"몇 묶음?\"인지 소리 내어 말하게 합니다."}, suggested_extras:["x_l7_mix","t_l7_mark"], tnote:{ask:["이 문제는 무엇을 묻고 있나요?","답에 붙일 단위는 무엇인가요?"], watch:"식은 맞게 세우고 답의 뜻은 바꿔 말하는 경우", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"식을 세워요", scenario:{icon:"📒", body:"공책 15권을 5명에게 똑같이 나눠요."}, question:"알맞은 나눗셈식을 적어 볼까요?", answer:"15 ÷ 5", note:"풀이: 전체 15, 나누는 수 5 → 15 ÷ 5 = 3 (한 명에게 3권)"}, suggested_extras:["e_l7_two"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"한 명에게 몇 개", scenario:{icon:"🔵", body:"구슬 20개를 5명에게 똑같이 나눠요."}, question:"한 명이 몇 개 가질까요?", input:"count_input", answer:4, note:"풀이: 5 × 4 = 20 → 20 ÷ 5 = 4"}, suggested_extras:["e_l7_many"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"몇 접시 필요할까", scenario:{icon:"🍓", body:"딸기 21개를 한 접시에 3개씩 담아요."}, question:"접시가 몇 개 필요할까요?", input:"count_input", answer:7, note:"풀이: 3 × 7 = 21 → 21 ÷ 3 = 7"}, suggested_extras:["q_l7_first"]},
      {id:"s11", stage:"기본문제", block:"leveled_problem", data:{title:"상황을 읽고 해결해요", levels:{"기본":{q:"색종이 16장을 4명에게 똑같이 나누면 한 명이 몇 장일까요?", a:"4장", steps:["무엇을 구하는지 찾는다 → 한 명이 몇 장","식을 세운다 → 16 ÷ 4","4 × 4 = 16이므로 몫은 4 → 4장"]},"도전":{q:"사탕 24개를 한 봉지에 4개씩 담으면 봉지는 몇 개 필요할까요?", a:"6봉지", steps:["무엇을 구하는지 찾는다 → 봉지 수","식을 세운다 → 24 ÷ 4","4 × 6 = 24이므로 몫은 6 → 6봉지"]},"심화":{q:"우리 반 인원으로 똑같이 나눌 수 있는 물건을 찾아 문제를 만들고, 식과 답을 함께 적어 봐요.", a:"여러 답 (예: 색연필 24자루를 6모둠에 → 24 ÷ 6 = 4, 한 모둠 4자루)", open:true}}}, suggested_extras:["g_l7_hunt","q_l7_make"], tnote:{ask:["식을 세우기 전에 무엇을 먼저 했나요?","답에 단위를 붙여 말해 볼까요?"], watch:"두 상황을 섞어 몫의 뜻을 바꿔 말하는 경우", min:5}},
      {id:"s12", stage:"응용문제", block:"offline_activity", data:{title:"우리 반 나눔 문제 만들기", type:"group", goal:"모둠이 교실 물건으로 나눗셈 문제를 만들고 서로 풀어 확인하기", steps:["모둠에서 교실 물건 하나와 개수를 정한다","'몇 개씩' 문제와 '몇 묶음' 문제를 하나씩 만든다","옆 모둠과 문제를 바꾸어 식과 답을 적는다","답에 단위를 붙였는지 서로 확인한다"], materials:["모둠 판","네임펜","교실 물건"], minutes:9}, suggested_extras:["g_l7_hunt","t_l7_unit"], tnote:{ask:["두 문제의 다른 점을 어떻게 드러냈나요?","옆 모둠 문제에서 무엇을 먼저 찾았나요?"], watch:"두 문제가 사실상 같은 물음이 된 모둠 — 뒤의 수가 무엇인지 다시 짚게 할 것", min:9}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"공평하게 나누는 힘", scenario:{icon:"🎪", body:"장터가 끝나고 남은 물건을 나눌 때도 같은 셈이 쓰입니다."}, content:"나눗셈은 **공평함을 셈으로 만드는 도구**예요. 무엇을 구하는지만 또렷하면 어떤 나눔도 식 한 줄로 풀려요."}, suggested_extras:["r_l7_market","r_l7_share"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"곰이의 마지막 나눔", context:"곰이에게 사탕 24개가 남았어요. 친구 6명에게 똑같이 나눌 수도 있고, 한 봉지에 6개씩 담을 수도 있어요.", challenge:"두 방법의 식과 몫을 각각 적고, 몫이 뜻하는 것이 어떻게 다른지 말해 봐요.", note:"풀이: 6명에게 나누면 24 ÷ 6 = 4 → 몫 4는 한 명이 받는 개수. 6개씩 담으면 24 ÷ 6 = 4 → 몫 4는 봉지 수. 식은 같아도 몫의 뜻이 다르다"}, suggested_extras:["e_l7_many","q_l7_make"], tnote:{ask:["식이 같은데 답의 뜻은 왜 다를까요?","단위를 붙이면 무엇이 또렷해지나요?"], watch:"식이 같으니 뜻도 같다고 결론짓는 경우 — 이 차시의 핵심 갈림길", min:5}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"공책 15권을 5명에게 똑같이 나누는 식은?", a:"15 ÷ 5"},{q:"딸기 21개를 한 접시에 3개씩 담으면 몇 접시인가요?", a:"7접시"},{q:"문제를 읽고 가장 먼저 살펴야 할 것은?", a:"무엇을 구하는지"}], self:["상황을 보고 식을 세울 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["문제를 읽고 **무엇을 구하는지** 먼저 찾는다.","'몇 개씩'인지 '몇 묶음'인지에 따라 **뒤의 수**가 달라진다.","몫은 **곱셈구구**로 구하고 곱셈으로 확인한다.","곰이와 펭이가 남은 물건까지 공평하게 나눴다."], arrows:["무엇을 구할까","식 세우기","몫 구하기"]}, suggested_extras:["r_l7_share"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 점검해요", items:["📚 지식·이해 — 두 가지 나눔을 가려낼 수 있나요?","🔧 과정·기능 — 상황을 식으로 세워 해결할 수 있나요?","💛 가치·태도 — 공평하게 나누려는 마음이 자랐나요?"], prompts:["오늘 만든 문제 중 가장 어려웠던 것은 무엇인가요?"]}, suggested_extras:["c_l7_prep"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 시간엔", preview:"단원을 마무리해요. 배운 것을 스스로 확인하고 되돌아봐요.", emoji:"🏁"}, suggested_extras:["c_l7_prep"]}
    ],
    extras: [
      {id:"v_l7_solve", type:"video", icon:"🎥", title:"나눗셈 문제 해결하기", url:"https://www.youtube.com/results?search_query=%EB%82%98%EB%88%97%EC%85%88+%EB%AC%B8%EC%A0%9C+%ED%95%B4%EA%B2%B0", description:"상황을 읽고 식을 세우는 과정을 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","concept"]},
      {id:"v_l7_two", type:"video", icon:"🎥", title:"두 가지 나눔 견주기", url:"https://www.youtube.com/results?search_query=%EB%98%91%EA%B0%99%EC%9D%B4+%EB%82%98%EB%88%84%EA%B8%B0+%EB%AC%B6%EC%96%B4+%EB%8D%9C%EC%96%B4%EB%82%B4%EA%B8%B0", description:"'몇 개씩'과 '몇 묶음'을 나란히 보여 주는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","misconception"]},
      {id:"q_l7_recall", type:"fun_question", icon:"💡", title:"배운 것 이어 말하기", content:"이 단원에서 배운 것을 순서대로 이어 말해 봐요. 어디가 가장 재미있었나요?", fit_slides:["review","summary"]},
      {id:"q_l7_first", type:"fun_question", icon:"💡", title:"무엇부터 볼까", content:"문제를 받으면 수부터 볼까요, 물음부터 볼까요? 어느 쪽이 덜 헷갈리나요?", fit_slides:["motivate","concept"]},
      {id:"q_l7_make", type:"fun_question", icon:"💡", title:"내가 만든 문제", content:"우리 집 물건으로 나눗셈 문제를 하나 만들어 봐요. 답도 미리 구해 두세요.", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"q_l7_not", type:"fun_question", icon:"💡", title:"나눠지지 않는 수", content:"12를 5명에게 똑같이 나누면 왜 곤란한가요? 어떻게 하면 좋을까요?", fit_slides:["concept","misconception"]},
      {id:"q_l7_fair", type:"fun_question", icon:"💡", title:"공평의 뜻 다시 보기", content:"단원을 지나며 '공평하다'는 말의 뜻이 더 또렷해졌나요? 어떻게 달라졌나요?", fit_slides:["real_world","summary"]},
      {id:"t_l7_mark", type:"tip", icon:"🧩", title:"물음에 밑줄 긋기", content:"'몇 개씩'인지 '몇 묶음'인지 밑줄을 긋게 하면 두 상황이 섞이지 않습니다.", fit_slides:["concept","misconception"]},
      {id:"t_l7_unit", type:"tip", icon:"🧩", title:"답에 단위 붙이기", content:"'4'가 아니라 '4봉지' 또는 '4장'이라고 쓰게 하면 몫의 뜻을 스스로 확인합니다.", fit_slides:["basic_problem","offline_activity"]},
      {id:"t_l7_draw", type:"tip", icon:"🧩", title:"막히면 그림으로", content:"식이 안 떠오르면 간단한 그림으로 되돌아가게 합니다. 그림과 식을 오가는 힘이 중요합니다.", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"t_l7_pair", type:"tip", icon:"🧩", title:"문제를 서로 바꿔 풀기", content:"직접 만든 문제를 바꿔 풀면 무엇을 묻는지 또렷이 쓰는 힘이 함께 자랍니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"e_l7_two", type:"extension", icon:"⬆", title:"한 상황 두 물음", content:"같은 수로 '몇 개씩'과 '몇 묶음' 두 문제를 만들어 나란히 적으면 차이가 또렷해집니다.", fit_slides:["concept","basic_problem"]},
      {id:"e_l7_many", type:"extension", icon:"⬆", title:"나누는 수 바꿔 보기", content:"24를 2·3·4·6·8로 나누어 몫을 표로 적으면 나누는 수와 몫의 관계가 드러납니다.", fit_slides:["concept","advanced_problem"]},
      {id:"g_l7_hunt", type:"game", icon:"🎮", title:"교실 나눔 찾기", content:"교실에서 똑같이 나눌 수 있는 물건을 찾아 식으로 적는 모둠 놀이입니다.", fit_slides:["offline_activity","leveled_problem"]},
      {id:"g_l7_quiz", type:"game", icon:"🎮", title:"무엇을 구할까 놀이", content:"교사가 문제를 읽으면 '몇 개씩'인지 '몇 묶음'인지 손짓으로 먼저 답하는 놀이입니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l7_market", type:"real_world", icon:"🌍", title:"장터의 마무리", content:"남은 물건을 나누는 일에도 같은 셈이 쓰입니다. 나눗셈은 하루의 마무리에도 쓰입니다.", fit_slides:["motivate","real_world"]},
      {id:"r_l7_share", type:"real_world", icon:"🌍", title:"함께 쓰는 물건", content:"학급 문고, 사물함, 청소 구역을 나누는 일도 모두 나눗셈으로 정해집니다.", fit_slides:["real_world","summary"]},
      {id:"r_l7_cook", type:"real_world", icon:"🌍", title:"음식 나누기", content:"피자 한 판을 여럿이 나눌 때 몇 조각씩 먹게 되는지도 나눗셈으로 정합니다.", fit_slides:["real_world","advanced_problem"]},
      {id:"b_l7_book", type:"book", icon:"📖", title:"나눔 이야기 책", content:"함께 나누는 이야기가 담긴 책을 찾아 읽고, 나눈 개수를 식으로 적어 봅니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l7_mix", type:"misconception", icon:"❓", title:"두 상황 섞기", content:"'3개씩 묶기'를 '3명에게 주기'로 바꿔 읽는 실수가 잦습니다. 뒤의 수가 무엇인지 확인하게 하세요.", fit_slides:["misconception","basic_problem"]},
      {id:"x_l7_unit", type:"misconception", icon:"❓", title:"단위 없는 답", content:"숫자만 적으면 무엇을 구했는지 흐려집니다. 단위를 붙여 답하는 습관을 잡아 주세요.", fit_slides:["misconception","offline_activity"]},
      {id:"c_l7_prep", type:"other_activity", icon:"📚", title:"다음 차시 준비물", content:"단원에서 푼 공책을 가져옵니다. 다음 시간엔 스스로 마무리합니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };

  /* ══════════════════ l08 — 스스로 마무리해요 (단원 마무리·평가) ══════════════════ */
  window.LESSONS["u3_l08"] = {
    meta: { grade:3, subject:"수학", unit:3, n:8, title:"스스로 마무리해요", std:"[4수01-06]", duration_min:40,
      lesson_format:"단원 마무리·평가 · 40분 표준 v2 신규 제작(7요소)", theme:"곰이·펭이 학급 나눔 장터",
      live_url:"../../grade3/semester1/math/3단원_나눗셈/g3_math_u3_08_스스로마무리해요.html" },
    slides: [
      {id:"s01", stage:"도입", block:"cover", data:{title:"스스로 마무리해요\n나눗셈 단원을 정리해요", emoji:"🏁"}, suggested_extras:["v_l8_wrap"]},
      {id:"s02", stage:"도입", block:"review", data:{title:"지난 시간 되짚기", from:"u3_l07", items:[{q:"공책 15권을 5명에게 똑같이 나누는 식은?", a:"15 ÷ 5"},{q:"딸기 21개를 한 접시에 3개씩 담으면 몇 접시인가요?", a:"7접시"},{q:"문제를 읽고 가장 먼저 살펴야 할 것은?", a:"무엇을 구하는지"}]}, suggested_extras:["q_l8_recall"], tnote:{ask:["단원에서 가장 또렷하게 남은 것은 무엇인가요?","아직 흐릿한 곳은 어디인가요?"], watch:"모르는 곳을 말하기 부끄러워하는 아이 — 물어보는 것이 배움이라고 짚어 줄 것", min:3}},
      {id:"s03", stage:"도입", block:"motivate", data:{scene_title:"장터를 접으며 되돌아봐요", kids:[{face:"🐻", label:"곰이\n\"많이 배웠어\""},{face:"🐧", label:"펭이\n\"스스로 확인해 보자\""}], question:"똑같이 나누기부터 곱셈구구로 몫 구하기까지 — 지금까지의 여정을 **스스로 확인**해 볼까요?", img:"assets/photo/math/market_wrap.jpg"}, suggested_extras:["q_l8_look","r_l8_life"], tnote:{ask:["단원을 지나며 무엇이 달라졌나요?","처음 차시와 지금을 견주면 어떤가요?"], watch:"점수로만 자신을 재는 아이 — 지난날의 나와 견주게 할 것", min:3}},
      {id:"s04", stage:"전개", block:"concept", data:{title:"두 가지 나눔", content:"묶음 수로 나눠 **한 묶음 개수**를 구하는 나눔.\n한 묶음 개수로 덜어 **묶음 수**를 구하는 나눔.", note:"👉 무엇을 알고 무엇을 구하는지가 두 나눔의 갈림길이에요."}, suggested_extras:["e_l8_map","t_l8_map"], tnote:{ask:["두 나눔을 손짓으로 구분해 볼까요?","문제에서 어느 낱말을 보고 가려내나요?"], watch:"두 나눔을 여전히 섞어 말하는 경우 — 등분제·포함제 갈림길을 다시 짚을 것", min:4}},
      {id:"s05", stage:"전개", block:"concept", data:{title:"나눗셈식과 몫", content:"**전체 ÷ 나누는 수 = 몫**.\n결과인 **몫**을 구하는 것이 나눗셈이에요.", note:"👉 앞뒤 순서를 바꾸면 다른 식이 돼요."}, suggested_extras:["t_l8_order","q_l8_which"], tnote:{ask:["식의 세 자리 이름을 말해 볼까요?","순서를 바꾸면 어떤 상황이 되나요?"], watch:"몫과 나누는 수를 바꿔 말하는 경우", min:4}},
      {id:"s06", stage:"전개", block:"concept", data:{title:"곱셈과 한 가족", content:"**3 × 6 = 18** · **6 × 3 = 18** · **18 ÷ 3 = 6** · **18 ÷ 6 = 3**", items:[{emoji:"✖️", count:2, label:"곱셈 2개"},{emoji:"➗", count:2, label:"나눗셈 2개"}], note:"👉 **나누는 수 × ☐ = 전체**가 되는 ☐가 몫이에요. 곱셈구구로 빠르게 구하고, 곱셈으로 확인해요."}, suggested_extras:["e_l8_family","g_l8_quiz"], tnote:{ask:["가족을 이루는 세 수는 무엇인가요?","확인 식은 어떻게 만들었나요?"], watch:"확인을 건너뛰고 답만 적는 경우", min:5}},
      {id:"s07", stage:"전개", block:"misconception", data:{title:"이런 생각을 조심해요", label:"자주 하는 생각", wrong:"**12 ÷ 4**와 **4 ÷ 12**가 같다고 말한다.", right:"나눗셈은 앞뒤 **순서**가 중요해요. 앞은 **전체**, 뒤는 **나누는 수**예요. 두 식은 서로 달라요.", hint:"단원 내내 가장 오래 남는 오개념입니다. 마무리 차시에서 말로 바꿔 읽으며 한 번 더 못 박아 주세요."}, suggested_extras:["x_l8_order","t_l8_order"], tnote:{ask:["4 ÷ 12는 어떤 상황일까요?","말로 바꿔 읽으면 무엇이 달라지나요?"], watch:"덧셈·곱셈처럼 순서를 바꿔도 된다고 여기는 경우", min:5}},
      {id:"s08", stage:"기본문제", block:"basic_problem", data:{title:"한 묶음에 몇 권", scenario:{icon:"📒", body:"공책 12권을 4묶음으로 똑같이 나눠요."}, question:"한 묶음에 몇 권일까요?", input:"count_input", answer:3, note:"풀이: 4 × 3 = 12 → 12 ÷ 4 = 3"}, suggested_extras:["e_l8_map"]},
      {id:"s09", stage:"기본문제", block:"basic_problem", data:{title:"몇 묶음일까", scenario:{icon:"🍬", body:"사탕 12개를 3개씩 묶어요."}, question:"몇 묶음일까요?", input:"count_input", answer:4, note:"풀이: 3 × 4 = 12 → 12 ÷ 3 = 4"}, suggested_extras:["e_l8_map"]},
      {id:"s10", stage:"기본문제", block:"basic_problem", data:{title:"몫을 구해요", scenario:{icon:"➗", body:"15 ÷ 3 을 살펴봐요."}, question:"몫은 얼마일까요?", input:"count_input", answer:5, note:"풀이: 3 × 5 = 15 → 15 ÷ 3 = 5"}, suggested_extras:["g_l8_quiz"]},
      {id:"s11", stage:"기본문제", block:"basic_problem", data:{title:"곱셈을 나눗셈으로", scenario:{icon:"✖️", body:"3 × 6 = 18"}, question:"이 식을 나눗셈식으로 바꿔 볼까요?", answer:"18 ÷ 3 = 6", note:"풀이: 세 수는 3, 6, 18 → 전체 18을 앞에 → **18 ÷ 3 = 6**"}, suggested_extras:["e_l8_family"]},
      {id:"s12", stage:"기본문제", block:"leveled_problem", data:{title:"단원 마무리 문제", levels:{"기본":{q:"24 ÷ 6의 몫을 곱셈구구로 구해 봐요.", a:"4", steps:["6 × ☐ = 24로 바꾼다","6단에서 6 × 4 = 24를 찾는다","몫은 4"]},"도전":{q:"가로 4, 세로 5인 배열(20)로 만든 식 가족 네 개를 모두 적어 봐요.", a:"4 × 5 = 20 · 5 × 4 = 20 · 20 ÷ 4 = 5 · 20 ÷ 5 = 4", steps:["세 수를 찾는다 → 4, 5, 20","곱셈식 두 개를 적는다","나눗셈식 두 개를 적는다"]},"심화":{q:"이 단원에서 배운 것으로 우리 반에서 풀 수 있는 나눔 문제를 하나 만들고, 식·답·확인까지 적어 봐요.", a:"여러 답 (예: 색종이 18장을 3모둠에 → 18 ÷ 3 = 6, 확인 3 × 6 = 18)", open:true}}}, suggested_extras:["g_l8_quiz","q_l8_make"], tnote:{ask:["어느 단을 떠올렸나요?","확인 식까지 적었나요?"], watch:"도전 문제에서 나눗셈식을 하나만 적는 경우", min:5}},
      {id:"s13", stage:"응용문제", block:"real_world", data:{title:"생활 속 나눔을 척척", scenario:{icon:"🏆", body:"간식·자리·모둠·청소 구역까지 — 하루에도 여러 번 나눔이 일어납니다."}, content:"이제 상황을 보고 **식 한 줄**로 나눔을 정할 수 있어요. 나눗셈은 생활을 공평하게 만드는 셈이에요."}, suggested_extras:["r_l8_life","r_l8_next"]},
      {id:"s14", stage:"응용문제", block:"advanced_problem", data:{title:"장터 결산", context:"곰이와 펭이에게 사탕 20개가 남았어요. 친구 4명에게 똑같이 나눌 수도 있고, 한 봉지에 5개씩 담을 수도 있어요.", challenge:"두 방법의 식과 몫을 각각 적고, 곱셈으로 확인해 봐요. 몫이 뜻하는 것도 말해 봐요.", note:"풀이: 4명에게 나누면 20 ÷ 4 = 5 → 한 명 5개 (확인 4 × 5 = 20). 5개씩 담으면 20 ÷ 5 = 4 → 4봉지 (확인 5 × 4 = 20)"}, suggested_extras:["e_l8_family","q_l8_make"], tnote:{ask:["두 몫이 뜻하는 것은 어떻게 다른가요?","확인 식은 각각 무엇이었나요?"], watch:"확인을 한쪽만 하고 넘어가는 경우", min:5}},
      {id:"s15", stage:"정리", block:"exit_ticket", data:{title:"오늘 확인해요", items:[{q:"전체 ÷ 나누는 수 = 무엇인가요?", a:"몫"},{q:"3 × 6 = 18과 한 가족인 나눗셈식은?", a:"18 ÷ 3 = 6"},{q:"몫은 무엇으로 빠르게 구하나요?", a:"곱셈구구"}], self:["단원 내용을 스스로 정리할 수 있어요","조금 헷갈려요","다시 배우고 싶어요"]}, suggested_extras:[]},
      {id:"s16", stage:"정리", block:"summary", data:{title:"나눗셈, 이만큼 배웠어요", points:["똑같이 나누기 → **나눗셈식·몫** → **곱셈과의 관계** → **곱셈구구로 몫**까지 배웠다.","무엇을 구하는지에 따라 뒤의 수와 몫의 뜻이 달라진다.","구한 몫은 **나누는 수 × 몫 = 전체**로 확인한다.","곰이와 펭이의 나눔 장터가 무사히 끝났다."], arrows:["똑같이 나누기","나눗셈식","곱셈구구로 몫"]}, suggested_extras:["r_l8_next"]},
      {id:"s17", stage:"정리", block:"self_assessment", data:{title:"스스로 돌아봐요", items:["📚 지식·이해 — 두 가지 나눔을 이해했나요?","🔧 과정·기능 — 곱셈구구로 몫을 구할 수 있나요?","💛 가치·태도 — 나눗셈에 관심이 생겼나요?"], prompts:["단원을 시작할 때의 나와 견주면 무엇이 달라졌나요?"]}, suggested_extras:["c_l8_next"]},
      {id:"s18", stage:"정리", block:"next_lesson", data:{title:"다음 단원엔", preview:"곱셈을 더 큰 수까지 넓혀 봐요. 나눗셈에서 쓰던 곱셈이 다시 든든하게 쓰여요.", emoji:"✖️"}, suggested_extras:["c_l8_next"]}
    ],
    extras: [
      {id:"v_l8_wrap", type:"video", icon:"🎥", title:"나눗셈 단원 정리", url:"https://www.youtube.com/results?search_query=%EB%82%98%EB%88%97%EC%85%88+%EB%8B%A8%EC%9B%90+%EC%A0%95%EB%A6%AC", description:"단원 전체를 훑어 정리하는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["cover","summary"]},
      {id:"v_l8_family", type:"video", icon:"🎥", title:"식 가족 다시 보기", url:"https://www.youtube.com/results?search_query=%EA%B3%B1%EC%85%88+%EB%82%98%EB%88%97%EC%85%88+%EC%8B%9D+%EA%B0%80%EC%A1%B1", description:"곱셈과 나눗셈의 관계를 되짚는 영상.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["concept","basic_problem"]},
      {id:"q_l8_recall", type:"fun_question", icon:"💡", title:"단원 이어 말하기", content:"이 단원에서 배운 네 걸음을 순서대로 말해 봐요.", fit_slides:["review","concept"]},
      {id:"q_l8_look", type:"fun_question", icon:"💡", title:"처음과 지금", content:"단원 첫 시간에 나눔을 어떻게 했나요? 지금은 무엇이 달라졌나요?", fit_slides:["motivate","self_assessment"]},
      {id:"q_l8_which", type:"fun_question", icon:"💡", title:"세 자리 이름 대기", content:"나눗셈식의 세 자리 이름을 손가락으로 짚으며 말해 봐요.", fit_slides:["concept","basic_problem"]},
      {id:"q_l8_make", type:"fun_question", icon:"💡", title:"마지막 문제 만들기", content:"이 단원을 다 배운 친구에게 낼 문제를 하나 만들어 봐요. 답도 함께 준비하세요.", fit_slides:["leveled_problem","advanced_problem"]},
      {id:"q_l8_next", type:"fun_question", icon:"💡", title:"다음이 궁금해요", content:"나눗셈 다음에는 어떤 셈을 배우게 될까요? 무엇이 이어질지 짐작해 봐요.", fit_slides:["next_lesson","summary"]},
      {id:"t_l8_map", type:"tip", icon:"🧩", title:"단원 지도를 다시 짚기", content:"첫 차시에 붙여 둔 단원 지도를 함께 짚으며 마무리하면 배움의 흐름이 정리됩니다.", fit_slides:["concept","summary"]},
      {id:"t_l8_order", type:"tip", icon:"🧩", title:"순서 오개념 마지막 점검", content:"앞뒤 순서 혼동은 단원 내내 가장 오래 남습니다. 마무리에서 한 번 더 소리 내어 읽게 하세요.", fit_slides:["misconception","concept"]},
      {id:"t_l8_self", type:"tip", icon:"🧩", title:"비교 없는 자기 점검", content:"다른 친구와 견주지 않고 지난날의 자신과 견주게 하면 마무리 차시가 편안해집니다.", fit_slides:["self_assessment","motivate"]},
      {id:"t_l8_slow", type:"tip", icon:"🧩", title:"헷갈리는 자리 표시하기", content:"틀린 문제에 별표를 하게 하고, 그 자리만 다시 짚어 주면 부담 없이 보완됩니다.", fit_slides:["leveled_problem","basic_problem"]},
      {id:"e_l8_map", type:"extension", icon:"⬆", title:"두 나눔 표로 정리", content:"'몇 개씩'과 '몇 묶음'을 두 칸 표로 적어 각각의 예를 채우면 단원이 한 장으로 정리됩니다.", fit_slides:["concept","basic_problem"]},
      {id:"e_l8_family", type:"extension", icon:"⬆", title:"내 식 가족 만들기", content:"자기가 좋아하는 수로 배열을 만들어 네 식을 적고 공책에 남깁니다.", fit_slides:["concept","advanced_problem"]},
      {id:"g_l8_quiz", type:"game", icon:"🎮", title:"단원 마무리 퀴즈", content:"모둠 대항으로 나눗셈 문제를 풀고, 확인 식까지 말한 모둠에 점수를 더 주는 놀이입니다.", fit_slides:["leveled_problem","basic_problem"]},
      {id:"g_l8_story", type:"game", icon:"🎮", title:"식으로 이야기 만들기", content:"교사가 식을 보여 주면 어울리는 이야기를 먼저 만들어 말하는 놀이입니다.", fit_slides:["leveled_problem","summary"]},
      {id:"r_l8_life", type:"real_world", icon:"🌍", title:"하루 속의 나눔", content:"급식·자리·청소 구역까지 하루에도 여러 번 나눔이 일어납니다. 오늘 몇 번이나 있었는지 세어 보세요.", fit_slides:["motivate","real_world"]},
      {id:"r_l8_next", type:"real_world", icon:"🌍", title:"곱셈으로 이어져요", content:"나눗셈에서 쓰던 곱셈은 다음 단원에서 더 큰 수로 넓어집니다.", fit_slides:["real_world","next_lesson"]},
      {id:"r_l8_home", type:"real_world", icon:"🌍", title:"집에서 해 보기", content:"집에서 간식이나 물건을 식구 수만큼 나누고 식으로 적어 보게 합니다.", fit_slides:["real_world","self_assessment"]},
      {id:"b_l8_book", type:"book", icon:"📖", title:"수학 이야기 책", content:"셈이 생활에 어떻게 쓰이는지 다룬 어린이 책을 찾아 읽어 봅니다.", fit_slides:["motivate","real_world"]},
      {id:"x_l8_order", type:"misconception", icon:"❓", title:"앞뒤 순서 혼동", content:"단원에서 가장 오래 남는 오개념입니다. 말로 바꿔 읽는 습관으로 마무리하세요.", fit_slides:["misconception","concept"]},
      {id:"x_l8_check", type:"misconception", icon:"❓", title:"확인을 건너뛰기", content:"몫만 적고 확인하지 않으면 실수를 놓칩니다. 확인 식 한 줄을 규칙으로 삼아 주세요.", fit_slides:["misconception","leveled_problem"]},
      {id:"c_l8_next", type:"other_activity", icon:"📚", title:"다음 단원 준비", content:"곱셈구구표를 공책 뒤에 붙여 둡니다. 다음 단원에서 이어 씁니다.", fit_slides:["next_lesson","self_assessment"]}
    ]
  };
})();
