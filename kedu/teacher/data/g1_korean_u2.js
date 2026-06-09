/* ============================================================
   1학년 1학기 국어 — 2단원 「받침이 있는 글자를 읽어요」 (케이티처)
   양산 영역 — LESSONS["u2_l{NN}"] 누적 / 다른 단원·과목 .js = read-only
   g1_korean.html이 자동 로드 후 LESSONS 에 누적.
   ------------------------------------------------------------
   ★ 케이티처 = 교사 주도 수업 도구. 로깅 없음(수업 진행용).
   ★ 트랙 = 한글 해득(받침 있는 글자). 1단원이 [자음+모음] 결합이었다면
     2단원은 [자음+모음+받침] 3요소 결합 → ③ "받침 더하기(결합)"가 심장.
     소단원1(l03~l07) = 한글 트랙. concept symbol_meanings로 받침 결합 표시,
     chosung_quiz/card_quiz/question으로 받침 짜임·소리 다룸.
   ★ 소단원2(l08~l11) = 듣기·말하기 트랙(발표 자세·집중 듣기). 결합 메커닉이
     아니라 자세 점검·자기소개 호명(present)·경청 활동으로 전환.
   ★ 저작권: 교과서·지도서 본문·그림·삽화 미게재. 학습 목표·결합 원리·활동
     의도만 차용. 예시 낱말(산·손·곰·집·강 등)은 보편/교과 어휘로 자체 구성.
   ------------------------------------------------------------
   차시 구성(13차시):
   l01 단원 도입(받침 인식) · l02 단원 다짐(두 갈래 예고)
   l03 받침 짜임 알기 · l04 받침 넣어 글자 만들기
   l05 여러 받침①(ㄱㅋㄴㄷㅅ) · l06 여러 받침②(ㅈㅊㅌㅎㄹ) · l07 여러 받침③(ㅁㅂㅍㅇ)+받침 골라 쓰기
   l08 바른 자세로 발표 · l09 자기소개하기 · l10 바른 자세로 듣기 · l11 이야기 집중해 듣기
   l12 받침 넣어 낱말 완성(실천) · l13 단원 마무리
   ============================================================ */

/* ===== l01 단원 도입 — 받침이 있는 글자가 있어요 ===== */
LESSONS["u2_l01"] = {
  meta: {grade:1, subject:"국어", unit:2, n:1, title:"받침이 있는 글자가 있어요", std:"[2국04-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 풍선 자모 → 사자/상장 비교 → 받침 인식 → 받침 글자 찾기 → 단원 안내"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"받침이 있는 글자가 있어요", subtitle:"2단원 · 1/13차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이 단원에서 무엇을 배울지 살펴봐요","받침이 없는 글자와 있는 글자를 비교해요","우리 둘레에서 받침이 있는 글자를 찾아봐요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"풍선 속 자음자와 모음자 🎈", visual:"🎈", question:"풍선 속 자음자·모음자를 모으면 ‘사자’가 돼요.<br>그 아래에 자음자를 더하면 ‘상장’이 돼요. 무엇이 달라졌을까요?"}, suggested_extras:["q_balloon","r_around"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"글자 아래에 더해지는 ‘받침’", content:"받침이 없는 글자 **아래쪽**에 자음자를 더하면 받침이 있는 글자가 돼요. 글자 아래에 있는 그 자음자를 **받침**이라고 해요!", symbol_meanings:[{symbol:"사 → 상", meaning:"아래에 ㅇ 받침이 더해졌어요"},{symbol:"자 → 장", meaning:"아래에 ㅇ 받침이 더해졌어요"},{symbol:"사자 (받침 없음)", meaning:"글자 아래가 비어 있어요"},{symbol:"상장 (받침 있음)", meaning:"글자 아래에 받침이 있어요"}]}, suggested_extras:["t_concept","x_where"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"받침이 있는 글자 찾기", sub:"그림을 보고 낱말을 말해요. 글자 아래에 받침이 있는지 함께 살펴봐요!", cards:[{clue:"동그랗고 잘 굴러가요<br>‘ㄱ·ㅗ·ㅇ’이 모였어요", emoji:"⚽", name:"공"},{clue:"밤하늘에서 반짝반짝!<br>‘ㅂ·ㅕ·ㄹ’이 모였어요", emoji:"⭐", name:"별"},{clue:"드나들 때 열고 닫아요<br>‘ㅁ·ㅜ·ㄴ’이 모였어요", emoji:"🚪", name:"문"}], outro:"공·별·문 모두 글자 아래에 받침이 있죠? 받침이 있는 글자가 이렇게 많아요! 😊"}, suggested_extras:["q_compare","g_hasbatchim"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"받침이 있는 글자를 찾아 말해요", question:"교실이나 우리 둘레에서 받침이 있는 글자를 찾아볼까요?", items:["칠판·창문·시계… 받침이 있는 낱말을 찾아 말해 봐요","받침이 없는 글자도 같이 찾아 비교해 봐요","받침이 글자의 어디에 있는지 손가락으로 짚어 봐요"]}, suggested_extras:["t_present","e_collect"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["받침이 없는 글자와 있는 글자를 비교했어요","글자 아래에 있는 자음자를 ‘받침’이라고 해요","우리 둘레에 받침이 있는 글자가 많음을 알았어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"받침이 있는 글자의 짜임을 알아봐요", body:"다음 시간에는 받침이 있는 글자가 어떻게 만들어지는지, 그 짜임을 자세히 알아볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"내가 아는 받침 글자", content:"“이름에 받침이 있는 친구 있나요?” 가볍게 물으며 받침에 관심을 갖게 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"비교가 먼저", content:"받침 개념은 ‘없는 글자 ↔ 있는 글자’ 비교에서 가장 잘 드러나요. 사자/상장처럼 짝지어 보여 주세요.", fit_slides:["objective","concept"]},
    {id:"q_balloon", type:"fun_question", icon:"🎈", title:"풍선에서 글자 만들기", content:"“풍선 속 자음자·모음자로 어떤 글자를 만들 수 있을까요?” 물으며 자모 모으기로 흥미를 끌어요.", fit_slides:["motivate"]},
    {id:"r_around", type:"real_world", icon:"🌍", title:"교실 속 받침 글자", content:"칠판·창문·사물함·우산처럼 교실에서 흔히 보는 낱말로 받침을 찾으면 학습이 생활과 이어져요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"받침은 ‘아래쪽’", content:"받침은 늘 글자의 아래쪽에 와요. 손가락으로 글자 아래를 짚으며 ‘여기가 받침 자리’라고 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"x_where", type:"misconception", icon:"❓", title:"받침 자리를 헷갈리기", content:"받침을 글자 옆에 쓰려는 아이가 있어요. 받침은 모음자 아래에 온다는 점을 글자 모양으로 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_compare", type:"fun_question", icon:"💡", title:"받침을 빼면?", content:"“공에서 받침 ㅇ을 빼면 무슨 글자가 될까요?(고)” 받침이 빠지면 글자가 달라짐을 느끼게 해요.", fit_slides:["card_quiz"]},
    {id:"g_hasbatchim", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 받침 짝짓기", description:"낱말과 그 받침을 짝지어 보세요.", hint:"낱말을 소리 내어 읽고 글자 아래의 받침을 찾아요.", pairs:[{a:{text:"⚽ 공"},b:{text:"ㅇ"}},{a:{text:"⭐ 별"},b:{text:"ㄹ"}},{a:{text:"🚪 문"},b:{text:"ㄴ"}},{a:{text:"🏠 집"},b:{text:"ㅂ"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"손가락으로 짚기", content:"받침을 찾을 때 글자 아래를 손가락으로 짚게 하면 ‘받침 자리’가 몸에 익어요.", fit_slides:["question","card_quiz"]},
    {id:"e_collect", type:"extension", icon:"⬆", title:"받침 글자 모으기", content:"익숙해진 아이에겐 교실을 돌며 받침 글자를 5개 찾아 적어 오게 하면 한 단계 나아가요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"새로 알게 된 것", content:"“오늘 ‘받침’이라는 말을 처음 들어 본 사람?” 물으며 배운 낱말을 가볍게 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"받침 글자 예고", content:"다음 시간을 위해 ‘산·손·곰’처럼 받침이 있는 글자를 미리 떠올려 보게 하면 도입이 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l02 단원 다짐 — 받침 글자 읽기와 바른 자세를 다짐해요 ===== */
LESSONS["u2_l02"] = {
  meta: {grade:1, subject:"국어", unit:2, n:2, title:"단원에서 배울 것을 다짐해요", std:"[2국04-01] · [2국01-04]", duration_min:40,
    lesson_format:"교사주도 8슬 — 답답했던 때 → 두 갈래 목표 → 받침 글자/바른 자세 미리 보기 → 다짐 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"단원에서 배울 것을 다짐해요", subtitle:"2단원 · 2/13차시 · 단원 도입"}, suggested_extras:["q_open","t_two"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이 단원에서 배울 두 가지를 알아봐요","받침이 있는 글자 읽기를 미리 살펴봐요","바른 자세로 말하고 듣기를 미리 살펴봐요"]}, suggested_extras:["t_two"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이럴 때 답답했어요 😣", visual:"🤔", question:"글자를 못 읽어서 답답했던 적 있나요?<br>친구가 딴 곳을 보며 말해서 서운했던 적은요?"}, suggested_extras:["q_uneasy","r_life"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"이 단원에서 배울 두 가지", content:"이 단원에서는 두 가지를 배워요. 하나는 **받침이 있는 글자**를 정확하게 읽기, 다른 하나는 **바른 자세**로 말하고 듣기예요!", symbol_meanings:[{symbol:"받침 글자 읽기", meaning:"산·손·곰처럼 받침이 있는 글자를 읽어요"},{symbol:"바른 자세로 말하기", meaning:"듣는 사람을 보고 또박또박 발표해요"},{symbol:"바른 자세로 듣기", meaning:"말하는 사람을 보며 귀 기울여 들어요"}]}, suggested_extras:["t_concept","x_only"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"무엇이 더 궁금한가요?", question:"단원에서 배울 두 가지 중 어떤 것이 더 궁금한지 이야기해 봐요.", items:["받침이 있는 글자를 읽는 것이 궁금해요","바른 자세로 발표하는 것이 궁금해요","왜 바른 자세로 들어야 하는지 궁금해요"]}, suggested_extras:["q_curious","e_goal"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"단원 다짐 발표하기 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 이 단원에서 무엇을 열심히 할지 다짐을 말해요!", count:24, hint:"“저는 받침이 있는 글자를 또박또박 읽겠습니다” 처럼 말해 봐요", end_msg:"모두의 다짐이 멋져요. 이 단원을 함께 잘 배워 봐요! 👏"}, suggested_extras:["t_present","e_goal"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["이 단원에서 배울 두 가지를 알았어요","받침 글자 읽기와 바른 자세를 미리 살펴봤어요","단원 학습을 스스로 다짐했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"받침이 있는 글자의 짜임을 알아봐요", body:"다음 시간에는 ‘사’에 받침을 더하면 ‘산’이 되는 것처럼, 받침 글자의 짜임을 알아볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"답답했던 경험", content:"“말이 안 통해서 답답했던 적 있나요?” 가볍게 물으며 의사소통의 필요를 떠올리게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_two", type:"tip", icon:"🧩", title:"두 갈래를 분명히", content:"이 단원은 ‘받침 글자 읽기(문법·읽기)’와 ‘바른 자세(말하기·듣기)’ 두 갈래예요. 두 목표를 또렷이 안내해 주세요.", fit_slides:["objective","cover"]},
    {id:"q_uneasy", type:"fun_question", icon:"💡", title:"서운했던 순간", content:"“내가 말하는데 친구가 딴짓을 하면 기분이 어때요?” 물으며 바른 듣기 자세의 필요를 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_life", type:"real_world", icon:"🌍", title:"생활 속 글자와 말", content:"간판·안내문을 못 읽으면 불편하고, 발표를 잘하면 마음이 잘 전해져요. 생활과 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"호기심 유발이 목적", content:"도입은 정확한 내용 알기가 아니라 호기심 유발이 목적이에요. 가볍게 미리 보기만 해도 충분해요.", fit_slides:["concept","objective"]},
    {id:"x_only", type:"misconception", icon:"❓", title:"읽기만 배운다고 생각하기", content:"‘국어=글자 읽기’로만 여기는 아이가 있어요. 이 단원엔 말하기·듣기 자세도 함께 배운다고 짚어 주세요.", fit_slides:["concept"]},
    {id:"q_curious", type:"fun_question", icon:"💡", title:"가장 궁금한 것", content:"“두 가지 중 무엇이 가장 궁금해요?” 물으며 학습 동기를 끌어올려요.", fit_slides:["question"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"다짐은 짧게", content:"다짐은 한 문장이면 충분해요. ‘무엇을 열심히 하겠다’ 한 가지만 말하도록 도와주세요.", fit_slides:["present","question"]},
    {id:"e_goal", type:"extension", icon:"⬆", title:"나만의 목표 적기", content:"다짐을 한 문장으로 공책에 적어 두고, 단원 끝에 다시 보게 하면 성취가 눈에 보여요.", fit_slides:["question","present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 정한 다짐", content:"“오늘 내가 정한 다짐이 무엇이었죠?” 물으며 스스로 세운 목표를 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"받침 글자 미리 보기", content:"‘산·손·곰·집’을 칠판에 적고 받침을 손가락으로 짚어 보게 하면 다음 차시가 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l03 소단원1 기본 — 받침이 있는 글자의 짜임을 알아요 ===== */
LESSONS["u2_l03"] = {
  meta: {grade:1, subject:"국어", unit:2, n:3, title:"받침이 있는 글자의 짜임을 알아요", std:"[2국04-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 자음자 달라진 글자 → 받침 결합(사+ㄴ=산) → 짜임 분해 퀴즈 → 받침 만들기 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"받침이 있는 글자의 짜임을 알아요", subtitle:"2단원 · 3/13차시 · 받침 글자 읽기"}, suggested_extras:["q_open","t_order"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["받침이 있는 글자가 어떻게 만들어지는지 알아요","글자를 자음자·모음자·받침으로 나눠 봐요","받침이 있는 글자를 또박또박 읽어요"]}, suggested_extras:["t_order"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"무엇이 달라졌을까요? ✨", visual:"🔤", question:"‘차’ 아래에 ‘ㅇ’을 더하면 ‘창’이 돼요.<br>글자 아래에 무엇이 생겼을까요?"}, suggested_extras:["q_change","r_card"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"자음자 + 모음자 + 받침", content:"받침이 있는 글자는 **자음자 + 모음자**에 **받침(자음자)**이 더해져 만들어져요. 받침은 글자 **아래쪽**에 와요!", symbol_meanings:[{symbol:"사 + ㄴ = 산", meaning:"ㅅ·ㅏ 아래에 ㄴ 받침"},{symbol:"소 + ㄴ = 손", meaning:"ㅅ·ㅗ 아래에 ㄴ 받침"},{symbol:"차 + ㅇ = 창", meaning:"ㅊ·ㅏ 아래에 ㅇ 받침"},{symbol:"고 + ㅁ = 곰", meaning:"ㄱ·ㅗ 아래에 ㅁ 받침"}]}, suggested_extras:["t_concept","x_sound"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"자모를 모으면 무슨 글자? 🧩", sub:"자음자·모음자·받침을 보고 무슨 글자일지 생각해요. [정답 보기]를 누르면 답이 나와요", items:[{chosung:"ㅅ ㅏ ㄴ", answer:"산", emoji:"⛰️", hint:"높이 솟은 자연이에요! 받침은 ㄴ"},{chosung:"ㅅ ㅗ ㄴ", answer:"손", emoji:"✋", hint:"물건을 잡는 몸이에요! 받침은 ㄴ"},{chosung:"ㄱ ㅗ ㅁ", answer:"곰", emoji:"🐻", hint:"겨울잠 자는 동물이에요! 받침은 ㅁ"},{chosung:"ㅁ ㅜ ㄴ", answer:"문", emoji:"🚪", hint:"열고 닫는 거예요! 받침은 ㄴ"}]}, suggested_extras:["q_split","g_part"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"받침을 넣어 글자를 만들어요", question:"받침이 없는 글자에 받침을 더하면 무슨 글자가 될까요?", items:["‘가’에 ㅇ 받침을 더하면? (강)","‘무’에 ㄹ 받침을 더하면? (물)","‘바’에 ㅂ 받침을 더하면? (밥)"]}, suggested_extras:["t_present","e_make"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["받침은 글자 아래쪽에 오는 자음자예요","받침이 없는 글자에 받침을 더하면 새 글자가 돼요","산·손·곰처럼 받침 글자를 또박또박 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"받침을 넣어 글자를 만들어요", body:"다음 시간에는 ‘소’에 ㅁ을 넣어 ‘솜’을 만드는 것처럼, 받침을 직접 넣어 글자를 만들어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"받침을 빼면", content:"“산에서 받침 ㄴ을 빼면 무슨 글자?(사)” 받침이 글자를 바꾼다는 걸 가볍게 느끼게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_order", type:"tip", icon:"🧩", title:"읽기 → 나누기", content:"먼저 소리 내어 읽고 그다음 자모·받침으로 나눠야 글자-소리 대응이 살아나요. 순서를 지켜 주세요.", fit_slides:["objective","concept"]},
    {id:"q_change", type:"fun_question", icon:"💡", title:"차 → 창", content:"“차 아래에 ㅇ을 붙이면 어떻게 소리가 달라질까요?” 물으며 받침의 역할에 집중하게 해요.", fit_slides:["motivate"]},
    {id:"r_card", type:"real_world", icon:"🌍", title:"자음자·모음자 카드", content:"자모 카드를 칠판에 붙였다 떼며 받침을 더하면, 짜임이 눈에 보여 이해가 빨라져요.", fit_slides:["motivate","chosung_quiz"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"받침 자리 강조", content:"‘자음자-모음자-받침’ 순서로 칠판에 위에서 아래로 써 주면 받침이 아래에 온다는 점이 또렷해져요.", fit_slides:["concept","chosung_quiz"]},
    {id:"x_sound", type:"misconception", icon:"❓", title:"받침을 빼고 읽기", content:"‘산’을 ‘사’로 받침을 빼고 읽는 아이가 있어요. 받침 소리까지 또박또박 내도록 짚어 주세요.", fit_slides:["concept","chosung_quiz"]},
    {id:"q_split", type:"fun_question", icon:"💡", title:"세 조각으로", content:"“산은 어떤 세 조각으로 나뉘죠?(ㅅ·ㅏ·ㄴ)” 물으며 3요소 짜임을 짚어요.", fit_slides:["chosung_quiz"]},
    {id:"g_part", type:"game", game_kind:"memory_match", icon:"🎮", title:"글자 ↔ 받침 짝짓기", description:"낱말과 그 받침을 짝지어 보세요.", hint:"낱말을 읽고 글자 아래의 받침을 찾아요.", pairs:[{a:{text:"⛰️ 산"},b:{text:"ㄴ"}},{a:{text:"🐻 곰"},b:{text:"ㅁ"}},{a:{text:"✋ 손"},b:{text:"ㄴ"}},{a:{text:"🚗 창"},b:{text:"ㅇ"}}], fit_slides:["chosung_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"입으로 먼저", content:"받침을 넣어 만든 글자는 꼭 소리 내어 읽게 하세요. 손으로 만들고 입으로 확인하는 흐름이 좋아요.", fit_slides:["question","chosung_quiz"]},
    {id:"e_make", type:"extension", icon:"⬆", title:"받침 바꿔 만들기", content:"‘가’에 ㅇ→강, ㅁ→감, ㄴ→간처럼 받침만 바꿔 가며 새 글자를 만들게 하면 한 단계 나아가요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 받침", content:"“오늘 만난 받침에는 무엇이 있었죠?(ㄴ·ㅁ·ㅇ…)” 물으며 배운 받침을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"솜 만들기 예고", content:"‘소’에 ㅁ을 더하면 솜! 다음 시간 활동을 한 글자 미리 보여 주면 기대가 생겨요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l04 소단원1 기본 — 받침을 넣어 글자를 만들어요 ===== */
LESSONS["u2_l04"] = {
  meta: {grade:1, subject:"국어", unit:2, n:4, title:"받침을 넣어 글자를 만들어요", std:"[2국04-01] · [2국03-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 받침 없는 글자 → 받침 더하기(소→솜) → 만들기 퀴즈 → 내가 만든 글자 발표 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"받침을 넣어 글자를 만들어요", subtitle:"2단원 · 4/13차시 · 받침 글자 읽기"}, suggested_extras:["q_open","t_say"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["받침이 없는 글자에 받침을 넣어 봐요","받침을 넣어 새로운 글자를 만들어요","만든 글자를 또박또박 소리 내어 읽어요"]}, suggested_extras:["t_say"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"보기에서 받침을 골라요 🧰", visual:"🧩", question:"‘소’ 아래에 ㅁ을 넣으면 ‘솜’이 돼요.<br>다른 받침을 넣으면 또 무슨 글자가 될까요?"}, suggested_extras:["q_pick","r_board"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"받침을 더해 새 글자 만들기", content:"받침이 없는 글자 아래에 **알맞은 받침**을 더하면 새로운 글자가 돼요. 같은 글자라도 받침이 다르면 **다른 글자**가 돼요!", symbol_meanings:[{symbol:"소 + ㅁ = 솜", meaning:"이불 속 솜"},{symbol:"비 + ㅅ = 빗", meaning:"머리 빗는 빗"},{symbol:"무 + ㄹ = 물", meaning:"마시는 물"},{symbol:"바 + ㅂ = 밥", meaning:"먹는 밥"}]}, suggested_extras:["t_concept","x_change"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"받침을 넣으면 무슨 글자? 🧩", sub:"받침 없는 글자에 받침을 넣어 보세요. [정답 보기]를 누르면 답이 나와요", items:[{chosung:"소 + ㅁ", answer:"솜", emoji:"☁️", hint:"이불 속에 들어 있어요!"},{chosung:"비 + ㅅ", answer:"빗", emoji:"💇", hint:"머리를 빗을 때 써요!"},{chosung:"무 + ㄹ", answer:"물", emoji:"💧", hint:"목마를 때 마셔요!"},{chosung:"바 + ㅂ", answer:"밥", emoji:"🍚", hint:"끼니마다 먹어요!"}]}, suggested_extras:["q_which","g_addbatchim"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"내가 만든 받침 글자 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 받침을 넣어 만든 글자를 소리 내어 읽어 줘요!", count:24, hint:"“저는 ‘가’에 ㅇ을 넣어 ‘강’을 만들었어요” 처럼 말해 봐요", end_msg:"받침을 넣어 멋진 글자를 많이 만들었어요. 잘했어요! 👏"}, suggested_extras:["t_present","e_more"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["받침 없는 글자에 받침을 넣어 새 글자를 만들었어요","받침이 다르면 다른 글자가 됨을 알았어요","만든 글자를 또박또박 소리 내어 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 가지 받침을 읽어요 ①", body:"다음 시간에는 ㄱ·ㅋ·ㄴ·ㄷ·ㅅ 받침이 있는 낱말을 소리 내어 읽어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"솜 만들기", content:"“소에 받침 ㅁ을 넣으면 무슨 글자?(솜)” 한 글자 만들기로 가볍게 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_say", type:"tip", icon:"🧩", title:"만들고 읽기", content:"받침을 넣어 만든 글자는 반드시 소리 내어 읽게 하세요. 표기와 소리를 함께 익혀야 해요.", fit_slides:["objective","present"]},
    {id:"q_pick", type:"fun_question", icon:"💡", title:"어떤 받침?", content:"“소 아래에 ㄴ을 넣으면?(손) ㅂ을 넣으면?(솝… 없는 말)” 받침에 따라 글자가 달라짐을 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_board", type:"real_world", icon:"🌍", title:"자석 보드 활용", content:"자석형 받침 글자를 붙였다 떼며 만들면 손으로 조작하는 재미로 참여가 높아져요.", fit_slides:["motivate","chosung_quiz"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"같은 글자, 다른 받침", content:"‘가→강·감·간’처럼 같은 글자에 받침만 바꿔 보여 주면 받침의 힘이 한눈에 들어와요.", fit_slides:["concept","chosung_quiz"]},
    {id:"x_change", type:"misconception", icon:"❓", title:"아무 받침이나 된다고 생각하기", content:"‘솜’은 되지만 ‘솝’은 안 돼요. 뜻이 있는 낱말이 되는 받침을 골라야 함을 가볍게 짚어 주세요.", fit_slides:["concept","chosung_quiz"]},
    {id:"q_which", type:"fun_question", icon:"💡", title:"어떤 받침이 들어갈까", content:"“무에 어떤 받침을 넣어야 마실 것이 될까요?(ㄹ→물)” 그림 단서로 받침을 추리하게 해요.", fit_slides:["chosung_quiz"]},
    {id:"g_addbatchim", type:"game", game_kind:"memory_match", icon:"🎮", title:"글자 ↔ 만든 낱말 짝짓기", description:"받침을 넣어 만들어지는 낱말을 짝지어 보세요.", hint:"글자에 어떤 받침을 넣으면 그 낱말이 되는지 생각해요.", pairs:[{a:{text:"소 + ㅁ"},b:{text:"☁️ 솜"}},{a:{text:"비 + ㅅ"},b:{text:"💇 빗"}},{a:{text:"무 + ㄹ"},b:{text:"💧 물"}},{a:{text:"바 + ㅂ"},b:{text:"🍚 밥"}}], fit_slides:["chosung_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"한 글자면 충분", content:"발표는 만든 글자 하나를 또박또박 읽는 것으로 충분해요. 부담 없이 발표하게 도와주세요.", fit_slides:["present","chosung_quiz"]},
    {id:"e_more", type:"extension", icon:"⬆", title:"받침 사슬 잇기", content:"‘가→강→공→곰’처럼 받침이나 글자를 하나씩 바꿔 사슬을 잇게 하면 한 단계 나아가요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 어려운 받침", content:"“오늘 넣어 본 받침 중 가장 어려웠던 건?” 물으며 스스로 돌아보게 해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"받침 소리 예고", content:"다음 시간엔 받침마다 소리가 다름을 배워요. ‘부엌·낙타’를 살짝 읽어 주면 기대가 생겨요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l05 소단원1 통합 — 여러 가지 받침을 읽어요 ① (ㄱ·ㅋ·ㄴ·ㄷ·ㅅ) ===== */
LESSONS["u2_l05"] = {
  meta: {grade:1, subject:"국어", unit:2, n:5, title:"여러 가지 받침을 읽어요 ①", std:"[2국04-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 다섯 고개 → 받침별 소리 → ㄱㅋㄴㄷㅅ 낱말 읽기 퀴즈 → 따라 읽기 발표 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"여러 가지 받침을 읽어요 ①", subtitle:"2단원 · 5/13차시 · 받침 글자 읽기"}, suggested_extras:["q_open","t_listen"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["받침마다 소리가 다름을 알아요","ㄱ·ㅋ·ㄴ·ㄷ·ㅅ 받침이 있는 낱말을 읽어요","받침에 주의하며 또박또박 소리 내어 읽어요"]}, suggested_extras:["t_listen"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"다섯 고개 놀이 🐾", visual:"🦒", question:"땅에 살고, 다리가 넷, 목이 아주 길어요.<br>받침이 있는 이 동물은 무엇일까요?"}, suggested_extras:["q_guess","r_play"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"받침마다 소리가 있어요", content:"받침에는 여러 자음자를 쓸 수 있고, 받침마다 **끝소리**가 달라요. 받침에 주의하며 끝까지 또박또박 읽어요!", symbol_meanings:[{symbol:"ㄱ 받침 — 낙타", meaning:"‘낙’의 끝소리 ㄱ"},{symbol:"ㅋ 받침 — 부엌", meaning:"‘엌’은 ㄱ 소리로 끝나요"},{symbol:"ㄴ 받침 — 반지", meaning:"‘반’의 끝소리 ㄴ"},{symbol:"ㄷ·ㅅ 받침 — 빗", meaning:"‘빗’은 ㄷ 소리로 끝나요"}]}, suggested_extras:["t_seven","x_drop"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"받침 글자를 읽어요 🧩", sub:"받침에 주의하며 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요", items:[{chosung:"ㄴ ㅏ + ㄱ / ㅌ ㅏ", answer:"낙타", emoji:"🐫", hint:"등에 혹이 있어요! ‘낙’의 받침은 ㄱ"},{chosung:"ㅂ ㅏ + ㄴ / ㅈ ㅣ", answer:"반지", emoji:"💍", hint:"손가락에 끼워요! ‘반’의 받침은 ㄴ"},{chosung:"ㅅ ㅜ + ㄷ / ㄱ ㅏ + ㄹ / ㄹ ㅏ + ㄱ", answer:"숟가락", emoji:"🥄", hint:"밥 먹을 때 써요! ‘숟’의 받침은 ㄷ"},{chosung:"ㅂ ㅣ + ㅅ", answer:"빗", emoji:"💇", hint:"머리를 빗어요! 받침은 ㅅ"}]}, suggested_extras:["q_end","g_match5"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"받침에 주의하며 읽어요", question:"선생님을 따라 받침 소리에 주의하며 또박또박 읽어 볼까요?", items:["낙타·독수리 — ㄱ 받침을 끝까지 소리 내요","반지·화분 — ㄴ 받침을 끝까지 소리 내요","숟가락·빗 — ㄷ·ㅅ 받침에 주의해 읽어요"]}, suggested_extras:["t_present","e_find"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["받침마다 끝소리가 다름을 알았어요","ㄱ·ㅋ·ㄴ·ㄷ·ㅅ 받침 낱말을 읽었어요","받침에 주의하며 또박또박 소리 내어 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 가지 받침을 읽어요 ②", body:"다음 시간에는 ㅈ·ㅊ·ㅌ·ㅎ·ㄹ 받침이 있는 낱말을 읽어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"받침 동물 찾기", content:"“이름에 받침이 있는 동물 있을까요?(곰·뱀·양…)” 가볍게 물으며 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_listen", type:"tip", icon:"🧩", title:"교사 발음이 본보기", content:"표준 발음으로 또박또박 읽어 주고, 아이가 따라 읽게 하세요. 듣고-따라 읽기 순서가 핵심이에요.", fit_slides:["objective","question"]},
    {id:"q_guess", type:"fun_question", icon:"🦒", title:"다섯 고개", content:"“땅·다리 넷·긴 목… 무엇일까요?(기린)” 단서를 하나씩 주며 호기심을 끌어요.", fit_slides:["motivate"]},
    {id:"r_play", type:"real_world", icon:"🌍", title:"받침 낱말은 둘레에", content:"낙타·독수리·반지처럼 그림책이나 동물원에서 본 낱말로 받침을 익히면 생활과 이어져요.", fit_slides:["motivate","chosung_quiz"]},
    {id:"t_seven", type:"tip", icon:"🧩", title:"끝소리에 집중", content:"1학년은 음운 변동을 배우기 전이에요. 받침 ‘글자’를 알아보고 끝소리를 또박또박 내는 데 집중하세요.", fit_slides:["concept","chosung_quiz"]},
    {id:"x_drop", type:"misconception", icon:"❓", title:"받침을 흘려 읽기", content:"‘낙타’를 ‘나타’처럼 받침을 빼고 읽는 아이가 있어요. 받침 소리까지 끝까지 내도록 짚어 주세요.", fit_slides:["concept","question"]},
    {id:"q_end", type:"fun_question", icon:"💡", title:"끝소리 듣기", content:"“반지의 ‘반’은 무슨 소리로 끝나요?(ㄴ)” 끝소리에 귀를 기울이게 해요.", fit_slides:["chosung_quiz"]},
    {id:"g_match5", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 첫 글자 받침", description:"낱말과 첫 글자의 받침을 짝지어 보세요.", hint:"낱말을 읽고 첫 글자의 받침을 찾아요.", pairs:[{a:{text:"🐫 낙타"},b:{text:"ㄱ"}},{a:{text:"💍 반지"},b:{text:"ㄴ"}},{a:{text:"🥄 숟가락"},b:{text:"ㄷ"}},{a:{text:"💇 빗"},b:{text:"ㅅ"}}], fit_slides:["chosung_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"받침 손짓", content:"받침을 읽을 때 손으로 글자 아래를 ‘콕’ 짚게 하면 받침 소리를 빠뜨리지 않아요.", fit_slides:["question","chosung_quiz"]},
    {id:"e_find", type:"extension", icon:"⬆", title:"ㄱ 받침 낱말 모으기", content:"익숙한 아이에겐 ‘ㄱ 받침이 있는 낱말’을 교실에서 더 찾아보게 하면 한 단계 나아가요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 어려운 받침", content:"“오늘 읽은 받침 중 가장 어려웠던 건?” 물으며 스스로 돌아보게 해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"다음 받침 예고", content:"다음 시간엔 ㅈ·ㅊ·ㅌ·ㅎ·ㄹ 받침을 배워요. ‘꽃·물’을 살짝 읽어 주면 기대가 생겨요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l06 소단원1 통합 — 여러 가지 받침을 읽어요 ② (ㅈ·ㅊ·ㅌ·ㅎ·ㄹ) ===== */
LESSONS["u2_l06"] = {
  meta: {grade:1, subject:"국어", unit:2, n:6, title:"여러 가지 받침을 읽어요 ②", std:"[2국04-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 받침 소리 떠올리기 → ㅈㅊㅌㅎㄹ 소리 → 낱말 읽기 퀴즈 → 따라 읽기 발표 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"여러 가지 받침을 읽어요 ②", subtitle:"2단원 · 6/13차시 · 받침 글자 읽기"}, suggested_extras:["q_open","t_listen"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㅈ·ㅊ·ㅌ·ㅎ·ㄹ 받침이 있는 낱말을 읽어요","받침이 달라도 비슷한 소리가 나는 것을 느껴요","받침에 주의하며 또박또박 소리 내어 읽어요"]}, suggested_extras:["t_listen"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"받침 소리 떠올리기 🔊", visual:"🌸", question:"‘꽃’과 ‘꼬’는 무엇이 다를까요?<br>받침 ㅊ이 만드는 끝소리를 함께 들어봐요!"}, suggested_extras:["q_diff","r_compare"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"여러 받침의 끝소리", content:"ㅈ·ㅊ·ㅌ은 받침에서 비슷한 끝소리가 나고, ㄹ은 또렷한 ㄹ 소리가 나요. 받침 **글자**를 보며 끝까지 또박또박 읽어요!", symbol_meanings:[{symbol:"ㅈ 받침 — 낮", meaning:"‘낮잠’의 ‘낮’"},{symbol:"ㅊ 받침 — 꽃", meaning:"받침 ㅊ"},{symbol:"ㅌ 받침 — 솥", meaning:"받침 ㅌ"},{symbol:"ㄹ 받침 — 물·달", meaning:"또렷한 ㄹ 소리"}]}, suggested_extras:["t_careful","x_drop"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"받침 글자를 읽어요 🧩", sub:"받침에 주의하며 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요", items:[{chosung:"ㄴ ㅏ + ㅈ / ㅈ ㅏ + ㅁ", answer:"낮잠", emoji:"😴", hint:"낮에 자는 잠이에요! ‘낮’의 받침은 ㅈ"},{chosung:"ㄲ ㅗ + ㅊ", answer:"꽃", emoji:"🌸", hint:"봄에 피어요! 받침은 ㅊ"},{chosung:"ㅅ ㅗ + ㅌ", answer:"솥", emoji:"🍲", hint:"밥을 짓는 그릇이에요! 받침은 ㅌ"},{chosung:"ㅁ ㅜ + ㄹ", answer:"물", emoji:"💧", hint:"목마를 때 마셔요! 받침은 ㄹ"}]}, suggested_extras:["q_end","g_match6"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"받침에 주의하며 읽어요", question:"선생님을 따라 받침 소리에 주의하며 또박또박 읽어 볼까요?", items:["꽃·낮잠 — 받침 ㅊ·ㅈ을 끝까지 소리 내요","솥·팥 — 받침 ㅌ에 주의해 읽어요","물·달·발 — ㄹ 받침을 또렷이 소리 내요"]}, suggested_extras:["t_present","e_find"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㅈ·ㅊ·ㅌ·ㅎ·ㄹ 받침 낱말을 읽었어요","받침이 달라도 비슷한 끝소리가 남을 느꼈어요","받침에 주의하며 또박또박 소리 내어 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 가지 받침을 읽어요 ③", body:"다음 시간에는 ㅁ·ㅂ·ㅍ·ㅇ 받침을 읽고, 그림에 알맞은 받침도 골라 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"꽃 떠올리기", content:"“받침이 있는 봄 낱말 있을까요?(꽃·풀…)” 가볍게 물으며 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_listen", type:"tip", icon:"🧩", title:"듣고 따라 읽기", content:"표준 발음으로 또박또박 읽어 주고 따라 읽게 하세요. 받침 끝소리를 들려주는 게 중요해요.", fit_slides:["objective","question"]},
    {id:"q_diff", type:"fun_question", icon:"🌸", title:"꽃과 꼬", content:"“꽃에서 받침 ㅊ을 빼면?(꼬)” 받침이 글자와 소리를 바꾼다는 걸 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_compare", type:"real_world", icon:"🌍", title:"둘레의 받침 낱말", content:"솥·꽃·물처럼 집과 자연에서 흔히 보는 낱말로 받침을 익히면 생활과 이어져요.", fit_slides:["motivate","chosung_quiz"]},
    {id:"t_careful", type:"tip", icon:"🧩", title:"ㅎ 받침은 가볍게", content:"‘놓다·파랗다’의 ㅎ 받침은 음운 변동 전이라 어려워요. 1학년에선 ㄹ 받침처럼 또렷한 받침을 중심에 두세요.", fit_slides:["concept","question"]},
    {id:"x_drop", type:"misconception", icon:"❓", title:"받침을 흘려 읽기", content:"‘꽃’을 ‘꼬’처럼 받침을 빼고 읽는 아이가 있어요. 받침 소리까지 끝까지 내도록 짚어 주세요.", fit_slides:["concept","question"]},
    {id:"q_end", type:"fun_question", icon:"💡", title:"끝소리 듣기", content:"“물의 받침은 무슨 소리가 나요?(ㄹ)” 또렷한 끝소리에 귀 기울이게 해요.", fit_slides:["chosung_quiz"]},
    {id:"g_match6", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 받침 짝짓기", description:"낱말과 받침을 짝지어 보세요.", hint:"낱말을 읽고 받침을 찾아요.", pairs:[{a:{text:"🌸 꽃"},b:{text:"ㅊ"}},{a:{text:"🍲 솥"},b:{text:"ㅌ"}},{a:{text:"💧 물"},b:{text:"ㄹ"}},{a:{text:"😴 낮잠"},b:{text:"ㅈ"}}], fit_slides:["chosung_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"받침 손짓", content:"받침을 읽을 때 손으로 글자 아래를 짚게 하면 받침 소리를 빠뜨리지 않아요.", fit_slides:["question","chosung_quiz"]},
    {id:"e_find", type:"extension", icon:"⬆", title:"ㄹ 받침 낱말 모으기", content:"익숙한 아이에겐 ‘ㄹ 받침 낱말’을 더 찾아보게 하면 한 단계 나아가요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"또렷한 받침", content:"“오늘 가장 또렷이 들린 받침은?(ㄹ)” 물으며 스스로 돌아보게 해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"다음 받침 예고", content:"다음 시간엔 ㅁ·ㅂ·ㅍ·ㅇ 받침을 배워요. ‘곰·집·강’을 살짝 읽어 주면 기대가 생겨요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l07 소단원1 통합 — 여러 가지 받침을 읽어요 ③ (ㅁ·ㅂ·ㅍ·ㅇ) + 받침 골라 쓰기 ===== */
LESSONS["u2_l07"] = {
  meta: {grade:1, subject:"국어", unit:2, n:7, title:"여러 가지 받침을 읽어요 ③", std:"[2국04-01] · [2국03-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 받침 소리 → ㅁㅂㅍㅇ 낱말 읽기 → 그림에 알맞은 받침 고르기 퀴즈 → 발표 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"여러 가지 받침을 읽어요 ③", subtitle:"2단원 · 7/13차시 · 받침 글자 읽기"}, suggested_extras:["q_open","t_listen"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㅁ·ㅂ·ㅍ·ㅇ 받침이 있는 낱말을 읽어요","그림에 알맞은 받침을 골라 봐요","받침에 주의하며 또박또박 소리 내어 읽어요"]}, suggested_extras:["t_listen"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"받침이 다른 친구들 🔤", visual:"🐻", question:"‘고’에 ㅁ을 넣으면 곰, ‘지’에 ㅂ을 넣으면 집!<br>받침에 따라 무엇이 달라질까요?"}, suggested_extras:["q_pick","r_compare"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"ㅁ·ㅂ·ㅍ·ㅇ 받침", content:"ㅂ과 ㅍ은 받침에서 비슷한 끝소리가 나고, ㅁ과 ㅇ은 코로 울리는 소리예요. 받침 **글자**를 보며 끝까지 또박또박 읽어요!", symbol_meanings:[{symbol:"ㅁ 받침 — 곰", meaning:"입을 다물며 ㅁ 소리"},{symbol:"ㅂ 받침 — 집", meaning:"받침 ㅂ"},{symbol:"ㅍ 받침 — 무릎", meaning:"‘릎’은 ㅂ 소리로 끝나요"},{symbol:"ㅇ 받침 — 강", meaning:"코로 울리는 ㅇ 소리"}]}, suggested_extras:["t_careful","x_drop"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"그림에 알맞은 받침은? 🧩", sub:"그림을 보고 어떤 받침이 들어갈지 생각해요. [정답 보기]를 누르면 답이 나와요", items:[{chosung:"ㄱ ㅗ + ?", answer:"곰 (받침 ㅁ)", emoji:"🐻", hint:"겨울잠 자는 동물이에요! 받침은 ㅁ"},{chosung:"ㅈ ㅣ + ?", answer:"집 (받침 ㅂ)", emoji:"🏠", hint:"우리가 사는 곳이에요! 받침은 ㅂ"},{chosung:"ㄱ ㅏ + ?", answer:"강 (받침 ㅇ)", emoji:"🏞️", hint:"물이 흐르는 곳이에요! 받침은 ㅇ"},{chosung:"ㄲ ㅜ + ?", answer:"꿈 (받침 ㅁ)", emoji:"💭", hint:"잘 때 꾸는 거예요! 받침은 ㅁ"}]}, suggested_extras:["q_which","g_match7"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"내가 고른 받침 낱말 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 받침을 골라 만든 낱말을 소리 내어 읽어 줘요!", count:24, hint:"“저는 ‘지’에 ㅂ을 넣어 ‘집’을 만들었어요” 처럼 말해 봐요", end_msg:"알맞은 받침을 골라 낱말을 잘 만들었어요. 잘했어요! 👏"}, suggested_extras:["t_present","e_find"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㅁ·ㅂ·ㅍ·ㅇ 받침 낱말을 읽었어요","그림에 알맞은 받침을 골라 낱말을 완성했어요","받침에 주의하며 또박또박 소리 내어 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"바른 자세로 발표해요", body:"다음 시간부터는 글자뿐 아니라 ‘바른 자세로 말하고 듣기’를 배워요. 먼저 바른 발표 자세를 알아볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"코로 울리는 받침", content:"“곰·강을 말할 때 코가 울려요. 느껴 볼까요?” 가볍게 물으며 ㅁ·ㅇ 받침에 관심을 끌어요.", fit_slides:["cover","motivate"]},
    {id:"t_listen", type:"tip", icon:"🧩", title:"듣고 따라 읽기", content:"표준 발음으로 또박또박 읽어 주고 따라 읽게 하세요. 받침 끝소리를 들려주는 게 중요해요.", fit_slides:["objective","present"]},
    {id:"q_pick", type:"fun_question", icon:"🐻", title:"받침 바꾸기", content:"“고에 ㅁ을 넣으면?(곰) ㅇ을 넣으면?(공)” 받침에 따라 글자가 달라짐을 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_compare", type:"real_world", icon:"🌍", title:"둘레의 받침 낱말", content:"집·강·곰처럼 생활과 자연에서 흔히 보는 낱말로 받침을 익히면 학습이 이어져요.", fit_slides:["motivate","chosung_quiz"]},
    {id:"t_careful", type:"tip", icon:"🧩", title:"ㅂ·ㅍ은 닮은 소리", content:"무릎의 ㅍ 받침은 ㅂ 소리로 끝나요. 1학년에선 받침 ‘글자’를 알아보고 끝소리를 또박또박 내는 데 집중하세요.", fit_slides:["concept","chosung_quiz"]},
    {id:"x_drop", type:"misconception", icon:"❓", title:"받침을 흘려 읽기", content:"‘집’을 ‘지’처럼 받침을 빼고 읽는 아이가 있어요. 받침 소리까지 끝까지 내도록 짚어 주세요.", fit_slides:["concept","present"]},
    {id:"q_which", type:"fun_question", icon:"💡", title:"어떤 받침일까", content:"“곰이 되려면 ‘고’ 아래에 무슨 받침을 넣어야 할까요?(ㅁ)” 그림 단서로 받침을 추리하게 해요.", fit_slides:["chosung_quiz"]},
    {id:"g_match7", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 받침 짝짓기", description:"낱말과 받침을 짝지어 보세요.", hint:"낱말을 읽고 받침을 찾아요.", pairs:[{a:{text:"🐻 곰"},b:{text:"ㅁ"}},{a:{text:"🏠 집"},b:{text:"ㅂ"}},{a:{text:"🏞️ 강"},b:{text:"ㅇ"}},{a:{text:"💭 꿈"},b:{text:"ㅁ"}}], fit_slides:["chosung_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"고르고 읽기", content:"받침을 고른 뒤 꼭 소리 내어 읽게 하세요. 고르기와 읽기를 함께 해야 학습이 단단해져요.", fit_slides:["present","chosung_quiz"]},
    {id:"e_find", type:"extension", icon:"⬆", title:"받침 모아 쓰기", content:"익숙한 아이에겐 그림 없이 받침을 골라 낱말을 직접 써 보게 하면 한 단계 나아가요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"받침 정복", content:"“이제 여러 받침을 읽을 수 있죠? 가장 자신 있는 받침은?” 물으며 성취를 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"발표 자세 예고", content:"다음 시간엔 바른 발표 자세를 배워요. ‘듣는 사람을 보고 또박또박’ 한마디 미리 안내해 주세요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l08 소단원2 기본 — 바른 자세로 발표해요 ===== */
LESSONS["u2_l08"] = {
  meta: {grade:1, subject:"국어", unit:2, n:8, title:"바른 자세로 발표해요", std:"[2국01-04]", duration_min:40,
    lesson_format:"교사주도 8슬 — 발표 자세 비교 → 바른 발표 자세 5가지 → 바른 친구 찾기 → 자세 연습 발표 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"바른 자세로 발표해요", subtitle:"2단원 · 8/13차시 · 바른 자세로 말하고 듣기"}, suggested_extras:["q_open","t_speak"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["발표할 때의 바른 자세를 알아봐요","바른 자세로 발표하는 친구를 찾아봐요","바른 발표 자세를 직접 연습해요"]}, suggested_extras:["t_speak"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어떤 자세가 좋을까요? 🧍", visual:"🎤", question:"딴 곳을 보거나 삐딱하게 서서 발표하면<br>듣는 사람의 마음은 어떨까요?"}, suggested_extras:["q_feel","r_class"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"바른 발표 자세 다섯 가지", content:"발표할 때는 **듣는 사람**을 바라보고, 허리를 곧게 세우며, 손과 다리를 자연스럽게 하고, **알맞은 크기**의 목소리로 또박또박 말해요!", symbol_meanings:[{symbol:"👀 눈", meaning:"듣는 사람을 바라봐요"},{symbol:"🧍 허리", meaning:"곧게 세워요"},{symbol:"🙌 손·다리", meaning:"자연스럽게, 다리는 어깨너비로"},{symbol:"🗣 목소리", meaning:"알맞은 크기로 또박또박"}]}, suggested_extras:["t_concept","x_small"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"바른 자세로 발표하는 친구 찾기", question:"세 친구의 발표 모습을 떠올려 봐요. 누가 바른 자세일까요? 그 까닭도 말해 봐요.", items:["듣는 사람을 바라보는 친구는 누구일까요?","허리를 곧게 세우고 선 친구는 누구일까요?","왜 그 친구가 바른 자세라고 생각하나요?"]}, suggested_extras:["q_why","g_pose"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"바른 자세로 자기소개하기 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 바른 자세로 이름·좋아하는 것·잘하는 것을 말해요!", count:24, hint:"“제 이름은 ○○○입니다. 저는 ○○을(를) 좋아합니다” 처럼 말해 봐요", end_msg:"모두 바른 자세로 멋지게 발표했어요. 잘했어요! 👏"}, suggested_extras:["t_present","e_record"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["바른 발표 자세 다섯 가지를 알았어요","바른 자세로 발표하는 친구를 찾았어요","바른 자세로 자기소개를 연습했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"친구들 앞에서 자기소개를 해요", body:"다음 시간에는 자기소개할 내용을 정리하고, 친구들 앞에서 바른 자세로 발표해 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"발표했던 기억", content:"“여러 사람 앞에서 발표해 본 적 있나요? 기분이 어땠어요?” 가볍게 경험을 떠올리게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_speak", type:"tip", icon:"🧩", title:"보여 주고 따라 하기", content:"바른 자세는 말보다 시범이 빨라요. 교사가 직접 시범을 보이고 아이가 따라 하게 하세요.", fit_slides:["objective","concept"]},
    {id:"q_feel", type:"fun_question", icon:"💡", title:"무시당한 기분", content:"“내가 말하는데 친구가 딴 곳을 보면 어떤 기분이 들까요?” 물으며 바른 자세의 필요를 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_class", type:"real_world", icon:"🌍", title:"학기 초 친교 활동", content:"자기소개는 학기 초 친구 사귀기와도 이어져요. 발표 연습이 곧 친해지기가 됨을 알려 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"한 번에 하나씩", content:"다섯 가지를 한꺼번에 말고, 눈→허리→손·다리→목소리 순서로 하나씩 짚으며 익히게 하세요.", fit_slides:["concept","question"]},
    {id:"x_small", type:"misconception", icon:"❓", title:"너무 작은 목소리", content:"부끄러워 목소리가 기어드는 아이가 많아요. ‘뒷자리 친구에게도 들리게’라고 구체적으로 안내해 주세요.", fit_slides:["concept","present"]},
    {id:"q_why", type:"fun_question", icon:"💡", title:"왜 바를까", content:"“그 친구가 왜 바른 자세인지 까닭을 말해 볼까요?” 물으며 자세의 이유를 생각하게 해요.", fit_slides:["question"]},
    {id:"g_pose", type:"game", game_kind:"memory_match", icon:"🎮", title:"몸 ↔ 바른 자세 짝짓기", description:"몸의 부분과 바른 발표 자세를 짝지어 보세요.", hint:"발표할 때 그 부분을 어떻게 해야 하는지 생각해요.", pairs:[{a:{text:"👀 눈"},b:{text:"듣는 사람 보기"}},{a:{text:"🧍 허리"},b:{text:"곧게 세우기"}},{a:{text:"🦵 다리"},b:{text:"어깨너비로"}},{a:{text:"🗣 목소리"},b:{text:"또박또박"}}], fit_slides:["question","concept"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"칭찬으로 긴장 풀기", content:"발표 전 긴장한 아이에겐 칭찬과 격려를 먼저 건네세요. 자신감이 바른 자세를 만들어요.", fit_slides:["present","question"]},
    {id:"e_record", type:"extension", icon:"⬆", title:"자세 점검표 활용", content:"발표 뒤 ‘눈·허리·손·다리·목소리’ 다섯 가지를 스스로 표시해 보게 하면 자기 점검이 자라요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 잘한 자세", content:"“오늘 발표에서 내가 가장 잘한 자세는 무엇이었나요?” 물으며 스스로 칭찬하게 해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"자기소개 준비 예고", content:"다음 시간을 위해 ‘좋아하는 음식·잘하는 것’을 미리 한 가지씩 생각해 오게 하면 발표가 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l09 소단원2 기본 — 친구들 앞에서 자기소개를 해요 ===== */
LESSONS["u2_l09"] = {
  meta: {grade:1, subject:"국어", unit:2, n:9, title:"친구들 앞에서 자기소개를 해요", std:"[2국01-04]", duration_min:40,
    lesson_format:"교사주도 8슬 — 소개 내용 떠올리기 → 소개 내용 정리(이름·좋아하는 것·잘하는 것) → 발표 호명 → 자기 점검 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"친구들 앞에서 자기소개를 해요", subtitle:"2단원 · 9/13차시 · 바른 자세로 말하고 듣기"}, suggested_extras:["q_open","t_plan"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["자기소개할 내용을 정리해요","바른 자세로 친구들 앞에서 발표해요","내 발표 자세를 스스로 점검해요"]}, suggested_extras:["t_plan"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"나를 소개해요 😊", visual:"🙋", question:"친구들에게 나를 소개한다면<br>무엇을 말하고 싶나요?"}, suggested_extras:["q_about","r_friend"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"자기소개에 담을 내용", content:"자기소개에는 **이름**, **좋아하는 것**, **잘하는 것**을 담아요. 너무 길지 않게, 바른 자세로 또박또박 말하면 돼요!", symbol_meanings:[{symbol:"📛 이름", meaning:"내 이름을 또렷이"},{symbol:"💗 좋아하는 것", meaning:"음식·놀이·색깔 등"},{symbol:"⭐ 잘하는 것", meaning:"내가 자신 있는 것"},{symbol:"🧍 바른 자세", meaning:"듣는 사람을 보며 또박또박"}]}, suggested_extras:["t_concept","x_long"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"소개할 내용을 정리해요", question:"발표하기 전에 소개할 내용을 머릿속으로 정리해 봐요.", items:["내 이름은 무엇인가요?","내가 좋아하는 것은 무엇인가요?","내가 잘하는 것은 무엇인가요?"]}, suggested_extras:["q_pick","e_card"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"바른 자세로 자기소개 발표 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 바른 자세로 이름·좋아하는 것·잘하는 것을 말해요!", count:24, hint:"“제 이름은 ○○○입니다. 저는 ○○을(를) 좋아하고, ○○을(를) 잘합니다” 처럼 말해 봐요", end_msg:"서로의 소개를 들으며 더 친해졌어요. 모두 잘했어요! 👏"}, suggested_extras:["t_present","e_clap"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["자기소개할 내용을 정리했어요","바른 자세로 친구들 앞에서 발표했어요","내 발표 자세를 스스로 점검했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"바른 자세로 집중해 들어요", body:"다음 시간에는 다른 사람의 말을 바른 자세로 집중해 듣는 방법을 배워 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"소개하고 싶은 것", content:"“친구들이 나에 대해 무엇을 알면 좋을까요?” 가볍게 물으며 소개할 거리를 떠올리게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_plan", type:"tip", icon:"🧩", title:"쓰기 부담 줄이기", content:"아직 쓰기가 서툰 시기예요. 말로 먼저 정리하게 하고, 쓰기를 힘들어하면 교사와 묻고 답하며 도와주세요.", fit_slides:["objective","question"]},
    {id:"q_about", type:"fun_question", icon:"💡", title:"나의 첫 마디", content:"“소개할 때 가장 먼저 무슨 말을 할까요?(이름)” 물으며 소개의 시작을 떠올리게 해요.", fit_slides:["motivate"]},
    {id:"r_friend", type:"real_world", icon:"🌍", title:"친구 사귀기", content:"자기소개는 새 친구를 사귀는 첫걸음이에요. 발표가 곧 친해지기로 이어짐을 알려 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"세 가지면 충분", content:"이름·좋아하는 것·잘하는 것 세 가지면 충분해요. 욕심내지 말고 짧고 또렷하게 안내하세요.", fit_slides:["concept","question"]},
    {id:"x_long", type:"misconception", icon:"❓", title:"너무 길게 말하기", content:"하고 싶은 말을 다 담으려다 길어지는 아이가 있어요. ‘세 가지만’이라고 콕 짚어 주세요.", fit_slides:["concept","present"]},
    {id:"q_pick", type:"fun_question", icon:"💡", title:"좋아하는 것 고르기", content:"“좋아하는 게 많으면 하나만 골라 볼까요?” 물으며 핵심을 고르게 도와요.", fit_slides:["question"]},
    {id:"e_card", type:"extension", icon:"⬆", title:"소개 카드 만들기", content:"이름·좋아하는 것·잘하는 것을 그림이나 글자로 카드에 적어 보이며 소개하면 발표가 또렷해져요.", fit_slides:["question","next_lesson"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"끝까지 들어 주기", content:"친구가 소개할 때 끝까지 바라보며 들어 주도록 안내하세요. 발표와 듣기를 함께 익혀요.", fit_slides:["present","question"]},
    {id:"e_clap", type:"extension", icon:"⬆", title:"한마디 칭찬 주고받기", content:"발표가 끝나면 듣던 친구가 ‘잘했어!’ 한마디를 건네게 하면 따뜻한 분위기가 만들어져요.", fit_slides:["present","summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"새로 알게 된 친구", content:"“오늘 친구의 소개를 듣고 새로 알게 된 것이 있나요?” 물으며 경청을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"듣기 차례 예고", content:"다음 시간엔 ‘잘 듣는 법’을 배워요. ‘말하는 사람을 보며 귀 기울이기’ 한마디 미리 안내해 주세요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l10 소단원2 통합 — 바른 자세로 집중해 들어요 ===== */
LESSONS["u2_l10"] = {
  meta: {grade:1, subject:"국어", unit:2, n:10, title:"바른 자세로 집중해 들어요", std:"[2국01-04]", duration_min:40,
    lesson_format:"교사주도 8슬 — 듣기 경험 → 바른 듣기 자세 5가지 → 바른 친구 찾기 → 짧게 듣고 확인 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"바른 자세로 집중해 들어요", subtitle:"2단원 · 10/13차시 · 바른 자세로 말하고 듣기"}, suggested_extras:["q_open","t_listen"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["다른 사람의 말을 집중해 듣는 자세를 알아봐요","바르게 듣는 친구를 찾아봐요","바른 자세로 집중해 듣기를 연습해요"]}, suggested_extras:["t_listen"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"잘 들으면 좋아요 👂", visual:"🚂", question:"숫자를 하나부터 열까지 한 명씩 외쳐요.<br>두 사람이 동시에 외치면 실패! 집중해서 들어야겠죠?"}, suggested_extras:["q_train","r_listen"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"바른 듣기 자세 다섯 가지", content:"들을 때는 **말하는 사람**을 바라보고, 귀를 기울이며, 허리를 곧게 펴고, 손과 다리를 가지런히 해요. 그래야 잘 들려요!", symbol_meanings:[{symbol:"👀 눈", meaning:"말하는 사람을 바라봐요"},{symbol:"👂 귀", meaning:"귀를 기울여요"},{symbol:"🧍 허리", meaning:"등받이에 붙이고 곧게"},{symbol:"🙌 손·다리", meaning:"손은 책상 위, 다리는 가지런히"}]}, suggested_extras:["t_concept","x_play"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"바르게 듣는 친구 찾기", question:"여러 친구의 듣는 모습을 떠올려 봐요. 누가 바르게 듣고 있나요? 까닭도 말해 봐요.", items:["말하는 사람을 바라보는 친구는 누구일까요?","손과 다리를 가지런히 한 친구는 누구일까요?","왜 그 친구가 바르게 듣는다고 생각하나요?"]}, suggested_extras:["q_why","g_listen"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"짧게 듣고 말해 보기 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 선생님이 들려준 짧은 이야기에서 기억나는 것을 말해요!", count:24, hint:"“방금 이야기에서 ○○이(가) 나왔어요” 처럼 말해 봐요", end_msg:"집중해 들으니 내용이 쏙쏙 기억나죠? 잘했어요! 👏"}, suggested_extras:["t_present","e_check"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["바른 듣기 자세 다섯 가지를 알았어요","바르게 듣는 친구를 찾았어요","집중해 듣기를 연습했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"이야기를 집중해 들어요", body:"다음 시간에는 선생님과 친구가 들려주는 이야기를 바른 자세로 집중해 듣고 내용을 나눠 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"못 들어 본 적", content:"“딴 생각하다 중요한 말을 놓친 적 있나요?” 가볍게 물으며 집중해 듣기의 필요를 떠올리게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_listen", type:"tip", icon:"🧩", title:"시범으로 보여 주기", content:"바른 듣기 자세도 말보다 시범이 빨라요. 교사가 직접 바른 자세를 보여 주고 따라 하게 하세요.", fit_slides:["objective","concept"]},
    {id:"q_train", type:"fun_question", icon:"🚂", title:"숫자 기차 놀이", content:"“집중하지 않으면 어떻게 될까요?(동시에 외쳐 실패)” 놀이로 집중의 필요를 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_listen", type:"real_world", icon:"🌍", title:"경청은 평생 습관", content:"집중해 듣기는 수업뿐 아니라 친구·가족과의 대화에서도 평생 쓰는 힘임을 알려 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"눈·귀 먼저", content:"다섯 가지 중 ‘눈으로 보고 귀를 기울이기’가 가장 핵심이에요. 두 가지부터 또렷이 짚어 주세요.", fit_slides:["concept","question"]},
    {id:"x_play", type:"misconception", icon:"❓", title:"손장난하며 듣기", content:"듣는 척하며 손장난하는 아이가 있어요. 손은 책상 위에 가지런히 두도록 구체적으로 안내하세요.", fit_slides:["concept","question"]},
    {id:"q_why", type:"fun_question", icon:"💡", title:"왜 바를까", content:"“그 친구가 왜 바르게 듣는다고 생각해요?” 물으며 까닭을 말하게 해요.", fit_slides:["question"]},
    {id:"g_listen", type:"game", game_kind:"memory_match", icon:"🎮", title:"몸 ↔ 바른 듣기 자세", description:"몸의 부분과 바른 듣기 자세를 짝지어 보세요.", hint:"들을 때 그 부분을 어떻게 해야 하는지 생각해요.", pairs:[{a:{text:"👀 눈"},b:{text:"말하는 사람 보기"}},{a:{text:"👂 귀"},b:{text:"귀 기울이기"}},{a:{text:"🧍 허리"},b:{text:"곧게 펴기"}},{a:{text:"🙌 손"},b:{text:"책상 위 가지런히"}}], fit_slides:["question","concept"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"짧게 들려주기", content:"한두 문장만 들려주고 곧바로 확인하면, 집중해 듣기의 효과를 아이가 바로 느낄 수 있어요.", fit_slides:["present","question"]},
    {id:"e_check", type:"extension", icon:"⬆", title:"듣기 점검표 활용", content:"듣고 난 뒤 ‘눈·귀·허리·손·다리’ 다섯 가지를 스스로 표시하게 하면 자기 점검이 자라요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"잘 들은 비결", content:"“오늘 잘 들을 수 있었던 비결은 무엇이었나요?” 물으며 스스로 돌아보게 해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"이야기 듣기 예고", content:"다음 시간엔 이야기를 집중해 들어요. ‘무슨 일이 일어나는지 귀 기울여 보자’ 미리 안내해 주세요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l11 소단원2 통합 — 이야기를 집중해 들어요 ===== */
LESSONS["u2_l11"] = {
  meta: {grade:1, subject:"국어", unit:2, n:11, title:"이야기를 집중해 들어요", std:"[2국01-04]", duration_min:40,
    lesson_format:"교사주도 8슬 — 듣기 자세 떠올리기 → 이야기 집중해 듣기 → 내용 확인 질문 → 들은 내용 나누기 발표 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"이야기를 집중해 들어요", subtitle:"2단원 · 11/13차시 · 바른 자세로 말하고 듣기"}, suggested_extras:["q_open","t_pose"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["바른 자세로 이야기를 집중해 들어요","이야기의 내용을 파악하며 들어요","들은 내용을 친구들과 나눠요"]}, suggested_extras:["t_pose"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이야기가 시작돼요 📖", visual:"👂", question:"바른 자세를 갖추고,<br>이제 선생님이 들려주는 이야기에 귀를 기울여 볼까요?"}, suggested_extras:["q_ready","r_story"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"내용을 파악하며 듣기", content:"이야기를 들을 때는 **누가**, **무엇을 했는지** 생각하며 들어요. 바른 자세로 끝까지 귀를 기울이면 내용이 잘 기억나요!", symbol_meanings:[{symbol:"🙋 누가", meaning:"누가 나왔는지 들어요"},{symbol:"🎬 무엇을", meaning:"무슨 일이 있었는지 들어요"},{symbol:"🔚 끝까지", meaning:"이야기를 끝까지 들어요"},{symbol:"🧍 바른 자세", meaning:"말하는 사람을 보며 귀 기울여요"}]}, suggested_extras:["t_concept","x_skip"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"이야기 내용을 확인해요", question:"방금 들은 이야기를 떠올리며 함께 이야기 나눠 봐요.", items:["이야기에 누가 나왔나요?","무슨 일이 일어났나요?","가장 기억에 남는 장면은 무엇인가요?"]}, suggested_extras:["q_recall","e_retell"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"들은 내용을 나눠요 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 이야기에서 기억나는 것을 바른 자세로 말해요!", count:24, hint:"“이야기에서 ○○이(가) ○○을(를) 했어요” 처럼 말해 봐요", end_msg:"집중해 들었더니 이야기를 잘 기억하네요. 모두 잘했어요! 👏"}, suggested_extras:["t_present","e_friend"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["바른 자세로 이야기를 집중해 들었어요","누가·무엇을 했는지 생각하며 들었어요","들은 내용을 친구들과 나눴어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"받침을 넣어 낱말을 완성해요", body:"다음 시간에는 다시 글자 놀이로 돌아와, 받침이 빠진 낱말에 받침을 넣어 완성해 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"좋아하는 이야기", content:"“가장 좋아하는 이야기가 있나요?” 가볍게 물으며 듣기에 대한 기대를 만들어요.", fit_slides:["cover","motivate"]},
    {id:"t_pose", type:"tip", icon:"🧩", title:"듣기 전 자세부터", content:"이야기를 들려주기 전, 지난 시간에 배운 바른 듣기 자세를 함께 갖추고 시작하세요.", fit_slides:["objective","motivate"]},
    {id:"q_ready", type:"fun_question", icon:"👂", title:"준비됐나요", content:"“귀를 쫑긋 세웠나요? 이제 시작해요!” 짧은 신호로 집중 모드로 전환해요.", fit_slides:["motivate"]},
    {id:"r_story", type:"real_world", icon:"🌍", title:"이야기는 어디에나", content:"이야기 듣기는 가족·친구의 말, 동화, 뉴스까지 이어져요. 집중해 듣는 힘은 생활 곳곳에서 쓰여요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"누가·무엇을", content:"‘누가, 무엇을 했는지’ 두 가지만 잡고 들으면 1학년도 내용을 충분히 기억할 수 있어요.", fit_slides:["concept","question"]},
    {id:"x_skip", type:"misconception", icon:"❓", title:"중간에 딴생각", content:"이야기 중간에 집중이 흐트러지는 아이가 많아요. ‘끝까지’ 듣는 것을 미리 약속하고 시작하세요.", fit_slides:["concept","question"]},
    {id:"q_recall", type:"fun_question", icon:"💡", title:"기억나는 장면", content:"“가장 기억에 남는 장면은 무엇인가요?” 물으며 내용을 떠올리게 해요.", fit_slides:["question"]},
    {id:"e_retell", type:"extension", icon:"⬆", title:"이어 말하기", content:"한 아이가 이야기 한 부분을 말하면 다음 아이가 이어 말하게 하면 내용 파악이 깊어져요.", fit_slides:["question","present"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"틀려도 괜찮아", content:"기억이 조금 달라도 괜찮다고 안심시켜 주세요. 발표 자체가 집중해 들은 결과예요.", fit_slides:["present","question"]},
    {id:"e_friend", type:"extension", icon:"⬆", title:"친구 이야기 듣기", content:"교사 대신 친구가 짧은 이야기를 들려주고 서로 듣게 하면 말하기·듣기를 함께 익혀요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"집중의 힘", content:"“집중해 들으니 무엇이 좋았나요?” 물으며 경청의 좋은 점을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"받침 놀이 예고", content:"다음 시간엔 받침 넣기 놀이를 해요. ‘기리에 받침을 넣으면?(기린)’ 한 문제 미리 내 주면 기대가 생겨요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l12 실천 — 받침을 넣어 낱말을 완성해요 ===== */
LESSONS["u2_l12"] = {
  meta: {grade:1, subject:"국어", unit:2, n:12, title:"받침을 넣어 낱말을 완성해요", std:"[2국04-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 받침 빠진 낱말 → 빠진 받침 찾기 → 낱말 완성 퀴즈 → 내가 낸 문제 발표 → 정리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"받침을 넣어 낱말을 완성해요", subtitle:"2단원 · 12/13차시 · 배운 내용 실천"}, suggested_extras:["q_open","t_clue"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["받침이 빠진 낱말을 살펴봐요","빠진 받침을 넣어 낱말을 완성해요","완성한 낱말을 또박또박 소리 내어 읽어요"]}, suggested_extras:["t_clue"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"받침이 사라졌어요! 🔍", visual:"🦒", question:"‘기리’… 어딘가 이상하죠?<br>이 낱말에서 사라진 받침은 무엇일까요?"}, suggested_extras:["q_missing","r_quiz"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"빠진 받침을 찾아 넣기", content:"낱말 그림과 소리를 떠올리면 **빠진 받침**을 찾을 수 있어요. 받침을 넣어 낱말을 완성하고 또박또박 읽어요!", symbol_meanings:[{symbol:"기리 → 기린", meaning:"‘리’에 ㄴ 받침"},{symbol:"호라이 → 호랑이", meaning:"‘라’에 ㅇ 받침"},{symbol:"나타 → 낙타", meaning:"‘나’에 ㄱ 받침"},{symbol:"도수리 → 독수리", meaning:"‘도’에 ㄱ 받침"}]}, suggested_extras:["t_concept","x_anybatchim"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"빠진 받침을 넣어요 🧩", sub:"그림을 보고 빠진 받침을 생각해요. [정답 보기]를 누르면 답이 나와요", items:[{chosung:"기리 + ?", answer:"기린 (받침 ㄴ)", emoji:"🦒", hint:"목이 긴 동물이에요! ‘리’에 ㄴ"},{chosung:"호라이 + ?", answer:"호랑이 (받침 ㅇ)", emoji:"🐯", hint:"어흥 우는 동물이에요! ‘라’에 ㅇ"},{chosung:"나타 + ?", answer:"낙타 (받침 ㄱ)", emoji:"🐫", hint:"등에 혹이 있어요! ‘나’에 ㄱ"},{chosung:"도수리 + ?", answer:"독수리 (받침 ㄱ)", emoji:"🦅", hint:"하늘 높이 나는 새예요! ‘도’에 ㄱ"}]}, suggested_extras:["q_find","g_complete"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"내가 낸 받침 문제 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 받침이 빠진 낱말 문제를 친구들에게 내 봐요!", count:24, hint:"“이 낱말에서 받침이 빠졌어요. 무엇일까요?” 처럼 문제를 내 봐요", end_msg:"서로 문제를 내고 맞히며 받침을 더 잘 알게 됐어요. 잘했어요! 👏"}, suggested_extras:["t_present","e_make"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["받침이 빠진 낱말을 살펴봤어요","빠진 받침을 넣어 낱말을 완성했어요","완성한 낱말을 또박또박 소리 내어 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"받침 글자로 단원을 마무리해요", body:"다음 시간에는 미로 놀이와 낱말 만들기로 이 단원에서 배운 받침 글자를 신나게 마무리할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"이상한 낱말", content:"“‘기리’… 무언가 빠진 것 같죠? 무엇일까요?” 가볍게 물으며 받침 빠진 낱말로 흥미를 끌어요.", fit_slides:["cover","motivate"]},
    {id:"t_clue", type:"tip", icon:"🧩", title:"그림 단서 주기", content:"받침을 추리할 때 그림을 함께 보여 주세요. 그림+소리 단서가 있으면 1학년도 받침을 잘 찾아요.", fit_slides:["objective","chosung_quiz"]},
    {id:"q_missing", type:"fun_question", icon:"🦒", title:"무슨 받침이 빠졌을까", content:"“목이 긴 동물 ‘기리’… 무슨 받침을 넣어야 할까요?(ㄴ)” 물으며 추리하게 해요.", fit_slides:["motivate"]},
    {id:"r_quiz", type:"real_world", icon:"🌍", title:"친숙한 낱말로", content:"동물·음식·학용품처럼 아이에게 친숙한 낱말로 문제를 내면 흥미와 참여가 높아져요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"소리 내며 맞히기", content:"받침을 넣은 뒤 꼭 소리 내어 읽게 하세요. 완성하고 읽는 흐름이 받침 학습을 단단히 해요.", fit_slides:["concept","chosung_quiz"]},
    {id:"x_anybatchim", type:"misconception", icon:"❓", title:"아무 받침이나 넣기", content:"뜻을 생각하지 않고 아무 받침이나 넣는 아이가 있어요. 그림이 뜻하는 낱말이 되도록 짚어 주세요.", fit_slides:["concept","chosung_quiz"]},
    {id:"q_find", type:"fun_question", icon:"💡", title:"받침 찾기", content:"“낙타가 되려면 ‘나’에 무슨 받침?(ㄱ)” 그림을 보며 빠진 받침을 찾게 해요.", fit_slides:["chosung_quiz"]},
    {id:"g_complete", type:"game", game_kind:"memory_match", icon:"🎮", title:"받침 빠진 낱말 ↔ 받침", description:"받침이 빠진 낱말과 넣을 받침을 짝지어 보세요.", hint:"그림을 떠올리며 어떤 받침이 빠졌는지 생각해요.", pairs:[{a:{text:"🦒 기리"},b:{text:"ㄴ → 기린"}},{a:{text:"🐯 호라이"},b:{text:"ㅇ → 호랑이"}},{a:{text:"🐫 나타"},b:{text:"ㄱ → 낙타"}},{a:{text:"🦅 도수리"},b:{text:"ㄱ → 독수리"}}], fit_slides:["chosung_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"문제 내기 안내", content:"문제를 낼 땐 그림이나 짧은 설명을 함께 주도록 안내하세요. 친구가 받침을 추리할 단서가 돼요.", fit_slides:["present","chosung_quiz"]},
    {id:"e_make", type:"extension", icon:"⬆", title:"받침 문제 카드", content:"받침이 빠진 낱말을 카드로 만들어 모둠끼리 주고받으면 놀이가 더 풍성해져요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 어려운 문제", content:"“오늘 푼 문제 중 가장 어려웠던 건?” 물으며 스스로 돌아보게 해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"마무리 놀이 예고", content:"다음 시간엔 미로 놀이로 마무리해요. ‘받침을 넣어 길을 찾자’ 한마디 미리 안내해 주세요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l13 마무리 — 받침 글자로 단원을 마무리해요 ===== */
LESSONS["u2_l13"] = {
  meta: {grade:1, subject:"국어", unit:2, n:13, title:"받침 글자로 단원을 마무리해요", std:"[2국04-01] · [2국01-04]", duration_min:40,
    lesson_format:"교사주도 8슬 — 단원 돌아보기 → 받침 글자 짜임 정리 → 받침 넣어 낱말 만들기 퀴즈 → 잘된 점 나누기 → 마무리"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"받침 글자로 단원을 마무리해요", subtitle:"2단원 · 13/13차시 · 단원 마무리"}, suggested_extras:["q_open","t_review"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이 단원에서 배운 것을 돌아봐요","받침을 넣어 낱말을 만들고 읽어요","바른 자세로 말하고 듣기를 다시 다짐해요"]}, suggested_extras:["t_review"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"받침 미로를 빠져나가요 🧭", visual:"🗺️", question:"그림에 알맞은 받침을 넣어 글자를 만들면<br>미로를 빠져나가 보물을 찾을 수 있어요!"}, suggested_extras:["q_maze","r_game"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"이 단원에서 배운 것", content:"받침은 글자 **아래쪽**에 오는 자음자이고, 받침을 넣으면 새 글자가 돼요. 또 **바른 자세**로 말하고 듣는 법도 배웠어요!", symbol_meanings:[{symbol:"📚 받침 짜임", meaning:"자음자+모음자+받침"},{symbol:"🔤 여러 받침", meaning:"ㄱ·ㄴ·ㄷ·ㄹ·ㅁ·ㅂ·ㅇ…"},{symbol:"🗣 바른 발표", meaning:"듣는 사람을 보고 또박또박"},{symbol:"👂 바른 듣기", meaning:"말하는 사람을 보며 귀 기울여"}]}, suggested_extras:["t_concept","x_proud"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"받침을 넣어 낱말 만들기 🧩", sub:"보기의 받침을 넣어 그림에 어울리는 낱말을 만들어요. [정답 보기]를 누르면 답이 나와요", items:[{chosung:"다 + ㄹ", answer:"달", emoji:"🌙", hint:"밤하늘에 떠요! 받침은 ㄹ"},{chosung:"바 + ㄹ", answer:"발", emoji:"🦶", hint:"걸을 때 써요! 받침은 ㄹ"},{chosung:"고 + ㅇ", answer:"공", emoji:"⚽", hint:"발로 차며 놀아요! 받침은 ㅇ"},{chosung:"가 + ㅇ", answer:"강", emoji:"🏞️", hint:"물이 흐르는 곳이에요! 받침은 ㅇ"}]}, suggested_extras:["q_make","g_final"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"단원을 돌아봐요", question:"이 단원에서 잘하게 된 것과 더 노력할 것을 이야기해 봐요.", items:["받침 글자 중 이제 잘 읽는 것은 무엇인가요?","발표할 때 가장 잘 지킨 자세는 무엇인가요?","앞으로 더 노력하고 싶은 것은 무엇인가요?"]}, suggested_extras:["q_grow","e_keep"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["받침 글자의 짜임을 다시 정리했어요","받침을 넣어 낱말을 만들고 읽었어요","바른 자세로 말하고 듣기를 다시 다짐했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 단원 예고", preview:"낱말을 읽고 쓰는 즐거움을 알아요", body:"다음 단원에서는 받침까지 익힌 글자로 여러 낱말을 읽고 쓰는 즐거움을 느껴 볼 거예요!"}, suggested_extras:["e_next"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"가장 기억에 남는 것", content:"“이 단원에서 가장 기억에 남는 활동은 무엇이었나요?” 가볍게 물으며 돌아보기를 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_review", type:"tip", icon:"🧩", title:"두 갈래 함께 정리", content:"받침 글자 읽기와 바른 자세, 두 갈래를 모두 짚어 주세요. 단원의 두 목표를 함께 마무리해요.", fit_slides:["objective","concept"]},
    {id:"q_maze", type:"fun_question", icon:"🧭", title:"보물을 찾아라", content:"“받침을 알맞게 넣어야 길이 열려요. 어떤 받침을 넣을까요?” 미로로 흥미를 끌어요.", fit_slides:["motivate"]},
    {id:"r_game", type:"real_world", icon:"🌍", title:"놀이로 익히기", content:"미로·낱말 만들기 같은 놀이로 받침을 익히면 부담 없이 즐겁게 마무리할 수 있어요.", fit_slides:["motivate","chosung_quiz"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"성장 짚어 주기", content:"단원 처음엔 못 읽던 받침 글자를 이제 읽을 수 있음을 짚어 주면 성취감이 커져요.", fit_slides:["concept","question"]},
    {id:"x_proud", type:"misconception", icon:"❓", title:"다 안다고 넘기기", content:"‘다 안다’며 대충 넘기는 아이가 있어요. 헷갈리는 받침이 있는지 한 번 더 확인하게 해 주세요.", fit_slides:["concept","question"]},
    {id:"q_make", type:"fun_question", icon:"💡", title:"받침 넣기", content:"“다에 ㄹ을 넣으면?(달)” 그림 단서로 낱말을 완성하게 해요.", fit_slides:["chosung_quiz"]},
    {id:"g_final", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 받침 짝짓기", description:"낱말과 받침을 짝지어 보세요.", hint:"낱말을 읽고 받침을 찾아요.", pairs:[{a:{text:"🌙 달"},b:{text:"ㄹ"}},{a:{text:"⚽ 공"},b:{text:"ㅇ"}},{a:{text:"🦶 발"},b:{text:"ㄹ"}},{a:{text:"🏞️ 강"},b:{text:"ㅇ"}}], fit_slides:["chosung_quiz"]},
    {id:"q_grow", type:"fun_question", icon:"💡", title:"잘하게 된 것", content:"“이 단원을 지나며 새로 잘하게 된 것은 무엇인가요?” 물으며 성장을 짚어요.", fit_slides:["question"]},
    {id:"e_keep", type:"extension", icon:"⬆", title:"받침 글자 공책", content:"이 단원에서 만난 받침 글자를 ‘나만의 받침 공책’에 모으면 성취가 눈에 보여요.", fit_slides:["question","summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 뿌듯한 것", content:"“오늘 가장 뿌듯했던 건 무엇이었나요?” 물으며 따뜻하게 단원을 마무리해요.", fit_slides:["summary"]},
    {id:"e_next", type:"extension", icon:"⬆", title:"다음 단원 준비", content:"다음 단원을 위해, 받침이 있는 낱말을 둘레에서 찾아 소리 내어 읽어 보게 하면 도입이 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};
