/* ============================================================
   1학년 1학기 국어 — 7단원 「알맞은 낱말을 찾아요」 (케이티처)
   양산 영역 — LESSONS["u7_l{NN}"] 누적 / 다른 단원·과목 .js = read-only
   ------------------------------------------------------------
   ★ 케이티처 = 교사 주도 수업 도구. 로깅 없음(수업 진행용).
   ★ 트랙 = 문법(쌍받침 ㄲ·ㅆ) + 쓰기(알맞은 낱말로 문장 완성·문장 표현).
     준비(l01·l02)=낱말만으로는 안 통해요→문장으로,
     소단원1(l03~l05)=쌍받침 + 그림 보고 낱말 찾기·문장 완성,
     소단원2(l06~l10)=문장으로 말하기(무엇은 무엇이다/누가 무엇을 하다)·이야기 문장,
     실천(l11·l12)=낱말 카드 놀이, 마무리(l13·l14).
   ★ 문형(주어·목적어·서술어)은 구조 용어 없이 '누가·무엇을·어찌하다'
     빈칸 채우기로 경험적으로만 다룸 (1학년 수준).
   ★ 저작권: 그림책(사자-곰 요리 모티프·도서관 고양이 등) 본문·삽화·작가·
     제목·인물명 미게재. 활동 의도만 차용, 예시·이야기 장면 전부 자체 구성.
     쌍받침 낱말(낚시·갔다·닦다·깎다·묶다)·문장은 보편/교과 어휘.
   ------------------------------------------------------------
   차시 구성(14차시):
   l01 낱말만으로는 안 통해요 · l02 문장으로 표현해요 — 준비
   l03 쌍받침 ㄲ·ㅆ 읽고 쓰기 — 문법
   l04 그림 보고 알맞은 낱말 찾기 · l05 낱말 넣어 문장 완성 — 쓰기
   l06 문장으로 말하기① 무엇은 무엇이다 · l07 문장으로 말하기② 누가 무엇을 하다
   l08 문장으로 말하기③ 종합 · l09 이야기 보고 문장 만들기① · l10 이야기 보고 문장 만들기②
   l11 낱말 카드 놀이① · l12 낱말 카드 놀이② — 실천
   l13 배운 내용 정리 · l14 기초 다지기와 자기 돌아보기 — 마무리
   ============================================================ */

/* ===== l01 준비 — 낱말만으로는 안 통해요 ===== */
LESSONS["u7_l01"] = {
  meta: {grade:1, subject:"국어", unit:7, n:1, title:"낱말만으로는 안 통해요", std:"[2국03-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 낱말 하나만 외치는 요리사 → 낱말만으로는 뜻이 모자람 → 무슨 뜻일까 카드 → 답답했던 경험 나누기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말만으로는 안 통해요", subtitle:"7단원 · 1/14차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낱말 하나만 말하면 어떤 일이 생기는지 봐요","뜻이 잘 안 통하는 까닭을 생각해요","이 단원에서 배울 것을 살펴봐요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"요리하던 곰이 외쳤어요 🍳", visual:"🍳", question:"요리하던 곰이 “당근!” 하고 외쳤어요.<br>당근을 달라는 걸까요, 당근을 씻으라는 걸까요?"}, suggested_extras:["q_carrot","r_life"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"낱말 하나로는 모자라요", content:"낱말 하나만 말하면 **무엇을 어떻게 하라는 건지** 알 수 없어요. 듣는 사람이 헷갈리지 않으려면 더 자세한 말이 필요해요!", symbol_meanings:[{symbol:"“당근!”", meaning:"달라는 건지, 씻으라는 건지 몰라요"},{symbol:"“물!”", meaning:"마실 물? 끄는 물? 알 수 없어요"},{symbol:"“공!”", meaning:"던질까요, 잡을까요?"},{symbol:"듣는 사람", meaning:"낱말만 들으면 헷갈려요"}]}, suggested_extras:["t_concept","x_oneword"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 낱말, 무슨 뜻일까요? 🤔", sub:"낱말 하나만 들었을 때 어떤 뜻일 수 있는지 함께 생각해요. 카드를 누르면 여러 뜻이 나와요!", cards:[{clue:"요리하던 곰이 “당근!”<br>무슨 뜻일 수 있을까요?", emoji:"🥕", name:"줘? 씻어? 잘라? 몰라요!"},{clue:"운동장에서 친구가 “공!”<br>무슨 뜻일 수 있을까요?", emoji:"⚽", name:"던져? 잡아? 비켜? 몰라요!"},{clue:"동생이 “물!”<br>무슨 뜻일 수 있을까요?", emoji:"💧", name:"주세요? 쏟았어요? 몰라요!"}], outro:"낱말 하나로는 뜻이 여러 갈래로 흩어져요. 어떻게 말해야 잘 통할까요? 다음 시간에 비밀이 풀려요! 😊"}, suggested_extras:["q_guess","g_oneword"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"답답했던 경험을 나눠요", question:"말이 잘 안 통해 답답했던 적이 있나요?", items:["낱말만 말해서 상대가 못 알아들은 적 있나요?","친구의 말을 못 알아들어 헷갈렸던 적은요?","어떻게 말하면 잘 통할까요?"]}, suggested_extras:["t_present","e_goal"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["낱말 하나만으로는 뜻이 잘 안 통해요","듣는 사람이 헷갈릴 수 있음을 알았어요","더 자세히 말하는 법을 배울 거예요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"문장으로 표현하면 잘 통해요", body:"다음 시간에는 “당근을 주세요”처럼 문장으로 말하면 뜻이 얼마나 잘 통하는지 알아볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"낱말 하나 놀이", content:"“선생님이 ‘책!’ 하고만 외치면 무엇을 해야 할까요?” 낱말 하나의 모호함을 놀이로 느끼게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 ‘알맞은 낱말을 골라 문장 완성하기’가 핵심이에요. 도입에선 문장의 필요만 느끼게 해도 충분해요.", fit_slides:["objective","cover"]},
    {id:"q_carrot", type:"fun_question", icon:"🥕", title:"곰의 마음 맞히기", content:"“곰은 정말 무슨 말을 하고 싶었을까요?” 여러 답을 받아 보며 헷갈림을 실감하게 해요.", fit_slides:["motivate"]},
    {id:"r_life", type:"real_world", icon:"🌍", title:"우리 교실에서도", content:"“풀!”, “가위!”처럼 교실에서 낱말만 외치는 장면이 많아요. 익숙한 상황과 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"헷갈림을 충분히", content:"이 차시는 답을 주는 시간이 아니라 헷갈림을 충분히 느끼는 시간이에요. 해결은 다음 차시로 아껴 두세요.", fit_slides:["concept","card_quiz"]},
    {id:"x_oneword", type:"misconception", icon:"❓", title:"낱말이 틀린 게 아니에요", content:"낱말 자체가 나쁜 게 아니라 ‘하나만으로는 모자라다’는 거예요. 낱말의 소중함은 지켜 주며 안내해 주세요.", fit_slides:["concept"]},
    {id:"q_guess", type:"fun_question", icon:"💡", title:"몇 가지 뜻일까", content:"“‘물!’은 몇 가지 뜻으로 들릴 수 있을까요?” 뜻이 흩어지는 개수를 세어 보게 해요.", fit_slides:["card_quiz"]},
    {id:"g_oneword", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 헷갈림 짝짓기", description:"낱말 하나와 생길 수 있는 헷갈림을 짝지어 보세요.", hint:"듣는 사람의 마음이 되어 봐요.", pairs:[{a:{text:"🥕 당근!"},b:{text:"줘? 씻어?"}},{a:{text:"⚽ 공!"},b:{text:"던져? 잡아?"}},{a:{text:"💧 물!"},b:{text:"주세요? 쏟았어요?"}},{a:{text:"📚 책!"},b:{text:"읽어? 덮어?"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"경험은 짧게", content:"답답했던 경험은 한 문장으로 짧게 말하게 하세요. 여러 아이가 골고루 참여할 수 있어요.", fit_slides:["question"]},
    {id:"e_goal", type:"extension", icon:"⬆", title:"해결책 미리 상상", content:"“곰이 어떻게 말했으면 잘 통했을까요?” 답을 살짝 상상하게 하고 다음 차시에서 확인하게 해요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"“낱말 하나만 말하면 어떤 일이 생겼죠?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"문장의 힘 예고", content:"“‘당근을 주세요’ — 이렇게 말하면 어떨까요?” 다음 시간의 답을 한 문장만 맛보게 해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l02 준비 — 문장으로 표현하면 잘 통해요 ===== */
LESSONS["u7_l02"] = {
  meta: {grade:1, subject:"국어", unit:7, n:2, title:"문장으로 표현하면 잘 통해요", std:"[2국03-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 곰의 말 고치기 → 문장으로 말하면 통하는 까닭 → 낱말을 문장으로 카드 → 단원 다짐 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"문장으로 표현하면 잘 통해요", subtitle:"7단원 · 2/14차시 · 단원 도입"}, suggested_extras:["q_open","t_bridge"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낱말을 문장으로 바꿔 말해 봐요","문장으로 말하면 잘 통하는 까닭을 알아요","이 단원에서 배울 것을 다짐해요"]}, suggested_extras:["t_bridge"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"곰이 다시 말했어요 🐻", visual:"🐻", question:"이번에 곰이 “당근을 씻어 줘”라고 말했어요.<br>지난번 “당근!”과 무엇이 달라졌나요?"}, suggested_extras:["q_again","r_order"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"문장은 뜻을 또렷하게 해요", content:"**누가·무엇을·어떻게**가 들어간 문장으로 말하면 듣는 사람이 헷갈리지 않아요. 이 단원에서 알맞은 낱말로 문장을 완성하는 법을 배워요!", symbol_meanings:[{symbol:"당근! → 당근을 씻어 줘", meaning:"무엇을 어떻게 할지 또렷해요"},{symbol:"물! → 물을 주세요", meaning:"부탁하는 뜻이 분명해요"},{symbol:"공! → 공을 던져 줘", meaning:"해야 할 일이 보여요"},{symbol:"이 단원의 목표", meaning:"문장에 어울리는 낱말 넣기"}]}, suggested_extras:["t_concept","x_long"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낱말을 문장으로 바꿔요 ✨", sub:"낱말 하나를 뜻이 통하는 문장으로 바꿔요. 카드를 누르면 문장이 나와요. 다 같이 읽어 봐요!", cards:[{clue:"“가위!”를 문장으로 바꾸면?<br>친구에게 빌릴 때", emoji:"✂️", name:"가위를 빌려줘"},{clue:"“우유!”를 문장으로 바꾸면?<br>마시고 싶을 때", emoji:"🥛", name:"우유를 마시고 싶어요"},{clue:"“문!”을 문장으로 바꾸면?<br>추울 때", emoji:"🚪", name:"문을 닫아 주세요"},{clue:"“신발!”을 문장으로 바꾸면?<br>나갈 준비를 할 때", emoji:"👟", name:"신발을 신어요"}], outro:"낱말이 문장이 되니 뜻이 또렷해졌어요! 문장의 힘, 느껴지죠? 😊"}, suggested_extras:["q_change","g_fix"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"단원 다짐 발표하기 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 이 단원에서 무엇을 열심히 할지 다짐을 문장으로 말해요!", count:24, hint:"“저는 알맞은 낱말을 잘 찾겠습니다” 처럼 문장으로 다짐해요", end_msg:"다짐도 멋진 문장으로! 이 단원을 함께 잘 배워 봐요 👏"}, suggested_extras:["t_present","e_goal"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["낱말을 문장으로 바꿔 말했어요","문장으로 말하면 뜻이 또렷해져요","단원 학습을 스스로 다짐했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"쌍받침 ㄲ·ㅆ를 만나요", body:"다음 시간에는 ‘낚시’의 ㄲ, ‘갔다’의 ㅆ처럼 받침 자리에 온 쌍둥이 자음자를 만날 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"문장 인사로 시작", content:"“오늘은 인사도 문장으로! ‘선생님, 안녕하세요’처럼요.” 문장 말하기 분위기로 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_bridge", type:"tip", icon:"🧩", title:"어제와 잇기", content:"지난 차시의 헷갈림을 먼저 떠올리고 오늘의 해결(문장)을 보여 주세요. 대비가 클수록 배움이 깊어요.", fit_slides:["objective","concept"]},
    {id:"q_again", type:"fun_question", icon:"🐻", title:"무엇이 더해졌나", content:"“‘당근!’과 ‘당근을 씻어 줘’ — 어떤 말이 더해졌나요?(을·씻어 줘)” 더해진 말을 찾게 해요.", fit_slides:["motivate"]},
    {id:"r_order", type:"real_world", icon:"🌍", title:"가게에서 주문하기", content:"가게에서 “주스!”보다 “주스 하나 주세요”가 잘 통하죠. 생활 속 문장의 힘과 이어 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"전후 비교 판서", content:"칠판 왼쪽에 낱말, 오른쪽에 문장을 나란히 쓰고 화살표로 이어 주세요. 문장의 힘이 한눈에 보여요.", fit_slides:["concept","card_quiz"]},
    {id:"x_long", type:"misconception", icon:"❓", title:"길게 말하면 문장?", content:"무조건 길게 말하면 된다고 여기는 아이가 있어요. 길이가 아니라 ‘뜻이 통하는가’가 기준임을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_change", type:"fun_question", icon:"💡", title:"다른 문장도 가능", content:"“‘가위를 빌려줘’ 말고 다른 문장도 될까요?(가위 좀 줄래?)” 한 낱말에 여러 문장이 가능함을 느끼게 해요.", fit_slides:["card_quiz"]},
    {id:"g_fix", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 문장 짝짓기", description:"낱말과 뜻이 통하는 문장을 짝지어 보세요.", hint:"무엇을 어떻게 하는지 들어 있는지 살펴요.", pairs:[{a:{text:"✂️ 가위!"},b:{text:"가위를 빌려줘"}},{a:{text:"🥛 우유!"},b:{text:"우유를 마시고 싶어요"}},{a:{text:"🚪 문!"},b:{text:"문을 닫아 주세요"}},{a:{text:"👟 신발!"},b:{text:"신발을 신어요"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"다짐도 문장으로", content:"다짐 발표 자체가 문장 말하기 연습이에요. ‘저는 ~하겠습니다’ 틀을 칠판에 적어 주세요.", fit_slides:["present"]},
    {id:"e_goal", type:"extension", icon:"⬆", title:"다짐 적어 두기", content:"다짐 문장을 공책에 적어 두고 단원 끝에 다시 보게 하면 자람이 눈에 보여요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"문장의 힘", content:"“문장으로 말하면 무엇이 좋았죠?(뜻이 또렷해요)” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"쌍받침 예고", content:"칠판에 ‘낚시’를 쓰고 “받침 자리에 쌍둥이가 왔어요!” 다음 시간 호기심을 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l03 소단원1 — 쌍받침 ㄲ·ㅆ를 읽고 써요 ===== */
LESSONS["u7_l03"] = {
  meta: {grade:1, subject:"국어", unit:7, n:3, title:"쌍받침 ㄲ·ㅆ를 읽고 써요", std:"[2국04-03] · [2국03-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 받침 자리의 쌍둥이 → 쌍받침 ㄲ·ㅆ 낱말 → 쌍받침 낱말 카드 → 쌍받침 낱말 찾기 발문"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"쌍받침 ㄲ·ㅆ를 읽고 써요", subtitle:"7단원 · 3/14차시 · 그림에 알맞은 낱말 넣기"}, suggested_extras:["q_open","t_batchim"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["받침 자리에 온 쌍둥이 자음자를 만나요","쌍받침 ㄲ·ㅆ가 든 낱말을 읽어요","쌍받침 낱말을 바르게 따라 써요"]}, suggested_extras:["t_batchim"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"받침 자리에 쌍둥이가! 👯", visual:"🎣", question:"‘낚시’라는 글자를 자세히 보세요.<br>‘낚’의 받침 자리에 ㄱ이 몇 개 있나요?"}, suggested_extras:["q_twin","r_word"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"받침 자리의 ㄲ과 ㅆ", content:"3단원에서 만난 쌍둥이 자음자 ㄲ·ㅆ는 **받침 자리에도** 올 수 있어요. 모양은 둘이지만 받침 한 자리에 꼭 맞게 써요!", symbol_meanings:[{symbol:"낚시 (ㄲ 받침)", meaning:"‘낚’의 받침 자리에 ㄲ"},{symbol:"갔다 (ㅆ 받침)", meaning:"‘갔’의 받침 자리에 ㅆ"},{symbol:"묶다 (ㄲ 받침)", meaning:"‘묶’의 받침 자리에 ㄲ"},{symbol:"있다 (ㅆ 받침)", meaning:"‘있’의 받침 자리에 ㅆ"}]}, suggested_extras:["t_concept","x_one"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"쌍받침 낱말 맞히기 🎴", sub:"쌍받침 ㄲ·ㅆ가 들어간 낱말이에요. 어느 글자의 받침인지 함께 찾아봐요!", cards:[{clue:"물가에서 물고기를 잡아요<br>ㄲ 받침이 들어 있어요", emoji:"🎣", name:"낚시"},{clue:"어제 할머니 댁에 ◯◯<br>ㅆ 받침이 들어 있어요", emoji:"🚌", name:"갔다"},{clue:"신발 끈을 단단히 ◯◯<br>ㄲ 받침이 들어 있어요", emoji:"👟", name:"묶다"},{clue:"이를 깨끗이 ◯◯<br>ㄲ 받침이 들어 있어요", emoji:"🪥", name:"닦다"}], outro:"받침 자리의 쌍둥이 ㄲ·ㅆ! 모양은 둘이어도 받침 한 자리에 쏙 들어가요 😊"}, suggested_extras:["q_where","g_ssang"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"쌍받침 낱말을 더 찾아요", question:"ㄲ이나 ㅆ가 받침으로 들어간 낱말을 더 찾아 말해 봐요.", items:["‘깎다’에서 쌍받침은 어디에 있나요? (깎의 ㄲ)","‘먹었다’에서 ㅆ 받침을 찾아봐요 (었)","찾은 낱말의 쌍받침을 손가락으로 짚어요"]}, suggested_extras:["t_present","e_write"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["쌍받침 ㄲ·ㅆ가 받침 자리에 옴을 알았어요","낚시·갔다·묶다·닦다를 읽었어요","쌍받침 낱말을 바르게 따라 썼어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"그림에 알맞은 낱말을 찾아요", body:"다음 시간에는 그림을 보고 꼭 맞는 낱말을 찾아내는 낱말 탐정이 될 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"쌍둥이 자음자 복습", content:"“3단원에서 만난 쌍둥이 자음자, 기억나요?(ㄲㄸㅃㅆㅉ)” 아는 것에서 출발해 받침 자리로 넓혀요.", fit_slides:["cover","motivate"]},
    {id:"t_batchim", type:"tip", icon:"🧩", title:"첫소리와 받침 비교", content:"‘꿀(첫소리 ㄲ)’과 ‘낚(받침 ㄲ)’을 나란히 보여 주세요. 같은 ㄲ가 자리만 바뀐 것임이 보여요.", fit_slides:["objective","concept"]},
    {id:"q_twin", type:"fun_question", icon:"👯", title:"받침 세어 보기", content:"“‘낚’의 받침 자리에 ㄱ이 몇 개죠?(두 개가 붙어 하나처럼!)” 모양 관찰에서 출발해요.", fit_slides:["motivate"]},
    {id:"r_word", type:"real_world", icon:"🌍", title:"생활 속 쌍받침", content:"‘이를 닦다’, ‘신발 끈을 묶다’처럼 매일 하는 일에 쌍받침 낱말이 살아 있어요. 생활과 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"받침 칸 강조", content:"쌍받침을 쓸 때 받침 칸 하나에 ㄲ를 꼭 맞게 쓰도록 네모 칸을 그려 시범을 보여 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"x_one", type:"misconception", icon:"❓", title:"ㄱ 하나만 쓰기", content:"쌍받침을 ㄱ 하나로만 쓰는 아이가 있어요(낙시). 받침 자리에 ㄱ 두 개를 나란히 써야 함을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_where", type:"fun_question", icon:"💡", title:"받침 자리 짚기", content:"“‘갔다’에서 ㅆ는 어느 글자 받침이죠?(갔)” 카드마다 쌍받침 위치를 짚게 해요.", fit_slides:["card_quiz"]},
    {id:"g_ssang", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 쌍받침 짝짓기", description:"낱말과 그 낱말의 쌍받침을 짝지어 보세요.", hint:"받침 자리를 잘 살펴봐요.", pairs:[{a:{text:"🎣 낚시"},b:{text:"ㄲ 받침"}},{a:{text:"🚌 갔다"},b:{text:"ㅆ 받침"}},{a:{text:"👟 묶다"},b:{text:"ㄲ 받침"}},{a:{text:"🪥 닦다"},b:{text:"ㄲ 받침"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"읽고 쓰고 확인", content:"찾은 쌍받침 낱말은 소리 내어 읽고 허공에 손가락으로 써 보게 하세요. 눈·입·손이 함께 배워요.", fit_slides:["question","card_quiz"]},
    {id:"e_write", type:"extension", icon:"⬆", title:"따라 쓰기 한 줄", content:"낚시·갔다·닦다·깎다·묶다를 공책에 한 줄씩 따라 쓰게 하면 쌍받침 모양이 손에 익어요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 쌍받침", content:"“받침 자리에 온 쌍둥이 둘은 누구였죠?(ㄲ·ㅆ)” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"낱말 탐정 예고", content:"“내일은 그림만 보고 꼭 맞는 낱말을 찾아내는 탐정 놀이!” 다음 차시 기대를 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l04 소단원1 — 그림에 알맞은 낱말을 찾아요 ===== */
LESSONS["u7_l04"] = {
  meta: {grade:1, subject:"국어", unit:7, n:4, title:"그림에 알맞은 낱말을 찾아요", std:"[2국03-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 그림 속 빈자리 → 그림을 보고 낱말 고르는 법 → 알맞은 낱말 카드 → 까닭 말하기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"그림에 알맞은 낱말을 찾아요", subtitle:"7단원 · 4/14차시 · 그림에 알맞은 낱말 넣기"}, suggested_extras:["q_open","t_detect"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["그림을 자세히 살펴봐요","그림에 꼭 맞는 낱말을 골라요","고른 낱말로 또박또박 말해 봐요"]}, suggested_extras:["t_detect"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"그림이 말을 걸어요 🖼️", visual:"🖼️", question:"비 오는 날 아이가 노란 ◯◯을 쓰고 있어요.<br>빈자리에 들어갈 낱말은 무엇일까요?"}, suggested_extras:["q_blank","r_picture"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"그림을 보고 낱말을 골라요", content:"그림 속 **모양·색깔·하는 일**을 자세히 보면 꼭 맞는 낱말이 보여요. 비슷한 낱말과 헷갈리지 않게 끝까지 살펴요!", symbol_meanings:[{symbol:"① 자세히 보기", meaning:"무엇이 있는지, 무엇을 하는지 살펴요"},{symbol:"② 낱말 떠올리기", meaning:"그림에 어울리는 낱말을 떠올려요"},{symbol:"③ 맞춰 보기", meaning:"낱말을 넣어 그림과 맞는지 확인해요"},{symbol:"우산 ↔ 우유", meaning:"비슷해 보여도 그림을 보면 달라요"}]}, suggested_extras:["t_concept","x_similar"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"그림에 꼭 맞는 낱말 🎯", sub:"그림을 보고 알맞은 낱말을 골라요. 카드를 누르면 답이 나와요!", cards:[{clue:"비 오는 날 머리 위에 펼쳐요<br>‘우산 vs 우유’ 어느 쪽?", emoji:"☂️", name:"우산"},{clue:"포도밭에서 따요. 보라색 알맹이!<br>‘포도 vs 포기’ 어느 쪽?", emoji:"🍇", name:"포도"},{clue:"겨울에 손에 껴요<br>‘장갑 vs 장화’ 어느 쪽?", emoji:"🧤", name:"장갑"},{clue:"하늘을 날아요. 끈을 잡고!<br>‘연 vs 연필’ 어느 쪽?", emoji:"🪁", name:"연"}], outro:"그림을 자세히 보니 꼭 맞는 낱말이 보였어요! 낱말 탐정 합격이에요 😊"}, suggested_extras:["q_clue","g_pick"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"고른 까닭을 말해요", question:"왜 그 낱말을 골랐는지 까닭을 이야기해 봐요.", items:["‘우산’을 고른 까닭은? (비가 오고 머리 위에 펼쳐서)","‘장갑’과 ‘장화’는 어떻게 가려냈나요? (손 vs 발)","그림의 어느 부분이 가장 큰 힌트였나요?"]}, suggested_extras:["t_present","e_pair"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["그림을 자세히 보고 낱말을 골랐어요","비슷한 낱말을 끝까지 살펴 가려냈어요","고른 까닭을 말로 설명했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낱말을 넣어 문장을 완성해요", body:"다음 시간에는 찾은 낱말을 문장의 빈칸에 쏙 넣어 문장을 완성할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"그림 묘사 놀이", content:"“선생님이 보여 주는 그림을 한 낱말로 말해 봐요!” 그림→낱말 잇기를 가볍게 워밍업해요.", fit_slides:["cover","motivate"]},
    {id:"t_detect", type:"tip", icon:"🧩", title:"탐정의 세 단계", content:"보기→떠올리기→맞춰 보기 세 단계를 차시 내내 같은 말로 반복해 주세요. 절차가 습관이 돼요.", fit_slides:["objective","concept"]},
    {id:"q_blank", type:"fun_question", icon:"🖼️", title:"빈자리 채우기", content:"“노란 ◯◯ — 빈자리에 어떤 낱말이 들어가야 그림과 맞을까요?” 빈칸 채우기의 재미로 시작해요.", fit_slides:["motivate"]},
    {id:"r_picture", type:"real_world", icon:"🌍", title:"그림책 속 낱말", content:"그림책을 읽을 때도 그림이 낱말의 힌트가 돼요. 모르는 낱말은 그림을 보면 짐작할 수 있다고 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"비슷한 낱말 짝", content:"우산/우유, 장갑/장화처럼 첫 글자가 같은 짝으로 문제를 내면 ‘끝까지 보기’ 습관이 길러져요.", fit_slides:["concept","card_quiz"]},
    {id:"x_similar", type:"misconception", icon:"❓", title:"첫 글자만 보고 고르기", content:"첫 글자만 보고 낱말을 고르는 아이가 있어요. 끝 글자까지 그림과 맞춰 보게 해 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_clue", type:"fun_question", icon:"💡", title:"힌트 찾기", content:"“그림 속 어떤 힌트로 알았어요?(빗방울·보라색)” 단서를 말로 꺼내게 하면 관찰력이 자라요.", fit_slides:["card_quiz"]},
    {id:"g_pick", type:"game", game_kind:"memory_match", icon:"🎮", title:"그림 ↔ 낱말 짝짓기", description:"그림과 꼭 맞는 낱말을 짝지어 보세요.", hint:"모양·색깔·하는 일을 살펴봐요.", pairs:[{a:{text:"☂️ 비 오는 날"},b:{text:"우산"}},{a:{text:"🍇 보라 알맹이"},b:{text:"포도"}},{a:{text:"🧤 손에 껴요"},b:{text:"장갑"}},{a:{text:"🪁 하늘에 날려요"},b:{text:"연"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"까닭 문장 틀", content:"“그림에 ◯◯가 있어서 ◯◯를 골랐어요” 틀을 주면 까닭 말하기가 술술 나와요.", fit_slides:["question"]},
    {id:"e_pair", type:"extension", icon:"⬆", title:"헷갈림 문제 만들기", content:"익숙해진 아이에겐 비슷한 낱말 짝(모자/모기)을 직접 만들어 친구에게 내게 하면 한 단계 나아가요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"탐정의 비법", content:"“낱말 탐정의 세 단계가 뭐였죠?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"문장 완성 예고", content:"“찾은 낱말을 문장 속 빈칸에 넣으면 어떻게 될까요? 내일 확인해요!” 기대를 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l05 소단원1 — 낱말을 넣어 문장을 완성해요 ===== */
LESSONS["u7_l05"] = {
  meta: {grade:1, subject:"국어", unit:7, n:5, title:"낱말을 넣어 문장을 완성해요", std:"[2국03-01] · [2국03-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 빈칸 있는 문장 → 그림에 알맞은 낱말로 빈칸 채우기 → 문장 완성 퀴즈 → 완성한 문장 읽기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말을 넣어 문장을 완성해요", subtitle:"7단원 · 5/14차시 · 그림에 알맞은 낱말 넣기"}, suggested_extras:["q_open","t_step"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["빈칸이 있는 문장을 살펴봐요","그림에 알맞은 낱말을 골라 빈칸을 채워요","완성한 문장을 또박또박 읽어요"]}, suggested_extras:["t_step"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"문장에 구멍이 났어요 🕳️", visual:"🧩", question:"‘토끼가 ◯◯을 먹어요.’<br>그림 속 토끼는 무엇을 먹고 있을까요?"}, suggested_extras:["q_hole","r_pic"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"그림을 보고 알맞은 낱말을 넣어요", content:"빈칸 문장은 **그림을 먼저 보고** 어울리는 낱말을 골라 채워요. 다 채우면 문장을 소리 내어 읽으며 어울리는지 확인해요!", symbol_meanings:[{symbol:"토끼가 ◯◯을 먹어요", meaning:"그림을 보니 당근! → 당근을 먹어요"},{symbol:"아기가 ◯◯을 자요", meaning:"낮에 자니까 → 낮잠을 자요"},{symbol:"새가 ◯◯을 날아요", meaning:"높은 곳이니까 → 하늘을 날아요"},{symbol:"확인하기", meaning:"넣은 낱말이 그림과 어울리는지 읽어 봐요"}]}, suggested_extras:["t_concept","x_any"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"빈칸에 알맞은 낱말은? 🧩", sub:"그림을 떠올리며 빈칸에 들어갈 낱말을 골라요. 카드를 누르면 답이 나와요!", cards:[{clue:"토끼가 ◯◯을 먹어요<br>주황색 길쭉한 채소!", emoji:"🥕", name:"당근"},{clue:"물고기가 ◯◯에서 헤엄쳐요<br>물이 흐르는 곳!", emoji:"🏞️", name:"강"},{clue:"아이가 ◯◯을 읽어요<br>글과 그림이 가득!", emoji:"📚", name:"책"},{clue:"새가 ◯◯을 날아요<br>구름이 떠 있는 곳!", emoji:"☁️", name:"하늘"}], outro:"그림에 알맞은 낱말을 넣으니 문장이 완성됐어요. 읽어 보니 잘 어울리죠? 😊"}, suggested_extras:["q_why","g_blank"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"완성한 문장을 읽고 까닭을 말해요", question:"빈칸을 채운 문장을 또박또박 읽고, 왜 그 낱말을 골랐는지 말해 봐요.", items:["‘토끼가 당근을 먹어요’ — 왜 당근일까요?","다른 낱말을 넣으면 문장이 이상해질까요?","내가 만든 빈칸 문장을 친구에게 내 봐요"]}, suggested_extras:["t_present","e_make"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["그림을 보고 알맞은 낱말을 골랐어요","낱말을 넣어 문장을 완성했어요","완성한 문장을 읽으며 어울리는지 확인했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"‘무엇은 무엇이다’ 문장을 말해요", body:"다음 시간에는 ‘참외는 과일이다’처럼 무엇이 무엇인지 알려 주는 문장을 만들어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"빈칸 채우기 맛보기", content:"“‘저는 ◯◯을 좋아해요’ — 빈칸에 무엇을 넣고 싶나요?” 가볍게 빈칸 채우기로 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_step", type:"tip", icon:"🧩", title:"그림 → 낱말 → 읽기", content:"그림 보기 → 낱말 고르기 → 소리 내어 읽기, 세 단계를 매 문제 같은 순서로 반복하면 습관이 돼요.", fit_slides:["objective","concept"]},
    {id:"q_hole", type:"fun_question", icon:"🕳️", title:"구멍 난 문장", content:"“문장에 구멍이 나면 뜻이 새어 나가요! 무엇으로 막을까요?” 재미있게 빈칸의 역할을 짚어요.", fit_slides:["motivate"]},
    {id:"r_pic", type:"real_world", icon:"🌍", title:"그림이 단서", content:"빈칸 문장의 답은 늘 그림 속에 있어요. 그림을 꼼꼼히 보는 습관이 읽기·쓰기 모두에 도움이 돼요.", fit_slides:["motivate","card_quiz"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"넣고 나서 읽기", content:"낱말을 넣은 다음 문장 전체를 꼭 읽게 하세요. 읽어 봐야 어울리는지 스스로 확인할 수 있어요.", fit_slides:["concept","card_quiz"]},
    {id:"x_any", type:"misconception", icon:"❓", title:"아무 낱말이나 넣기", content:"빈칸에 아무 낱말이나 넣는 아이가 있어요. ‘그림과 어울리는가’를 판단 기준으로 또렷이 세워 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_why", type:"fun_question", icon:"💡", title:"바꿔 넣으면?", content:"“‘토끼가 하늘을 먹어요’라고 하면 어때요?” 일부러 엉뚱한 낱말을 넣어 보며 어울림을 느끼게 해요.", fit_slides:["card_quiz"]},
    {id:"g_blank", type:"game", game_kind:"memory_match", icon:"🎮", title:"빈칸 ↔ 낱말 짝짓기", description:"빈칸 문장과 들어갈 낱말을 짝지어 보세요.", hint:"그림을 떠올리며 어울리는 낱말을 찾아요.", pairs:[{a:{text:"토끼가 ◯◯을 먹어요"},b:{text:"🥕 당근"}},{a:{text:"물고기가 ◯◯에서 헤엄쳐요"},b:{text:"🏞️ 강"}},{a:{text:"아이가 ◯◯을 읽어요"},b:{text:"📚 책"}},{a:{text:"새가 ◯◯을 날아요"},b:{text:"☁️ 하늘"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"까닭은 그림으로", content:"까닭을 말할 때 “그림에 ◯◯이 있어서요”처럼 그림을 근거로 말하게 하면 판단이 또렷해져요.", fit_slides:["question","card_quiz"]},
    {id:"e_make", type:"extension", icon:"⬆", title:"내가 내는 빈칸 문제", content:"익숙해진 아이에겐 직접 빈칸 문장을 만들어 짝에게 내게 하면 출제자의 눈으로 한 단계 자라요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 채운 문장", content:"“오늘 완성한 문장 중 하나를 외워서 말해 볼까요?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"무엇은 무엇이다 예고", content:"“‘참외는 과일이다’ — 이런 문장은 무엇을 알려 줄까요?” 다음 시간 문형을 한 문장 맛보게 해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l06 소단원2 — ‘무엇은 무엇이다’ 문장을 말해요 ===== */
LESSONS["u7_l06"] = {
  meta: {grade:1, subject:"국어", unit:7, n:6, title:"‘무엇은 무엇이다’ 문장을 말해요", std:"[2국03-02] · [2국04-03]", duration_min:40,
    lesson_format:"교사주도 8슬 — 이것은 무엇? → 무엇은 무엇이다 틀 → 알맞은 말 채우기 퀴즈 → 그림 보고 문장 말하기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"‘무엇은 무엇이다’ 문장을 말해요", subtitle:"7단원 · 6/14차시 · 여러 가지 문장 말하기"}, suggested_extras:["q_open","t_frame"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["‘무엇은 무엇이다’ 문장을 살펴봐요","그림을 보고 알맞은 말을 채워요","‘무엇은 무엇이다’ 문장을 만들어 말해요"]}, suggested_extras:["t_frame"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이것은 무엇일까요? 🔍", visual:"🍈", question:"노랗고 줄무늬가 있는 이 과일!<br>한 문장으로 알려 주면 어떻게 말할까요?"}, suggested_extras:["q_what","r_intro"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"무엇은 무엇이다", content:"어떤 것이 무엇인지 알려 줄 때는 **‘무엇은 무엇이다’** 모양으로 말해요. 앞에는 알려 줄 것, 뒤에는 그것이 무엇인지가 와요!", symbol_meanings:[{symbol:"참외는 과일이다", meaning:"참외가 무엇인지 알려 줘요"},{symbol:"한복은 옷이다", meaning:"한복이 무엇인지 알려 줘요"},{symbol:"토끼는 동물이다", meaning:"토끼가 무엇인지 알려 줘요"},{symbol:"장미는 꽃이다", meaning:"장미가 무엇인지 알려 줘요"}]}, suggested_extras:["t_concept","x_grammar"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞은 말을 채워요 🧩", sub:"‘무엇은 무엇이다’ 문장의 빈칸을 채워요. 카드를 누르면 답이 나와요!", cards:[{clue:"참외는 ◯◯이다<br>달고 맛있게 먹는 것!", emoji:"🍈", name:"과일"},{clue:"토끼는 ◯◯이다<br>강아지·곰도 여기에 들어가요!", emoji:"🐰", name:"동물"},{clue:"◯◯는 꽃이다<br>빨갛고 가시가 있어요!", emoji:"🌹", name:"장미"},{clue:"한복은 ◯이다<br>몸에 입는 것!", emoji:"👘", name:"옷"}], outro:"앞과 뒤가 꼭 맞아야 ‘무엇은 무엇이다’ 문장이 완성돼요. 참 잘했어요! 😊"}, suggested_extras:["q_swap","g_isa"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"그림 보고 문장 말하기 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 교실 물건이나 좋아하는 것으로 ‘무엇은 무엇이다’ 문장을 말해요!", count:24, hint:"“연필은 학용품이다”, “기린은 동물이다” 처럼 말해 봐요", end_msg:"‘무엇은 무엇이다’ 문장이 교실에 가득해졌어요. 모두 멋져요! 👏"}, suggested_extras:["t_present","e_category"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["‘무엇은 무엇이다’ 문장 모양을 알았어요","그림을 보고 알맞은 말을 채웠어요","내 힘으로 ‘무엇은 무엇이다’ 문장을 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"‘누가 무엇을 하다’ 문장을 말해요", body:"다음 시간에는 ‘토끼가 당근을 먹는다’처럼 누가 무엇을 하는지 알려 주는 문장을 만들어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"수수께끼로 열기", content:"“노랗고 길쭉한 과일은? 바나나! 그럼 한 문장으로? 바나나는 과일이다!” 수수께끼에서 문장으로 이어요.", fit_slides:["cover","motivate"]},
    {id:"t_frame", type:"tip", icon:"🧩", title:"틀은 경험으로", content:"‘무엇은 무엇이다’는 문법 용어 없이 입에 붙이는 게 목표예요. 여러 번 소리 내어 말하게 해 주세요.", fit_slides:["objective","concept"]},
    {id:"q_what", type:"fun_question", icon:"🔍", title:"한 문장으로", content:"“참외를 모르는 친구에게 한 문장으로 알려 준다면?” 알려 주는 문장의 쓸모를 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_intro", type:"real_world", icon:"🌍", title:"소개할 때 쓰는 문장", content:"새 물건·새 친구를 소개할 때 ‘무엇은 무엇이다’ 문장을 써요. 생활 속 소개 장면과 이어 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"앞뒤 손가락 짚기", content:"문장을 읽으며 앞말(참외는)과 뒷말(과일이다)을 왼손·오른손으로 번갈아 짚으면 짜임이 몸에 익어요.", fit_slides:["concept","card_quiz"]},
    {id:"x_grammar", type:"misconception", icon:"❓", title:"용어를 가르치려 하기", content:"주어·서술어 같은 용어는 1학년 수준이 아니에요. ‘무엇은/무엇이다’ 말 틀로만 경험하게 해 주세요.", fit_slides:["concept"]},
    {id:"q_swap", type:"fun_question", icon:"💡", title:"뒤집으면 어떨까", content:"“‘과일은 참외이다’라고 하면 이상하죠?” 앞뒤 자리를 바꿔 보며 어울림을 느끼게 해요.", fit_slides:["card_quiz"]},
    {id:"g_isa", type:"game", game_kind:"memory_match", icon:"🎮", title:"무엇 ↔ 무엇이다 짝짓기", description:"앞말과 어울리는 뒷말을 짝지어 보세요.", hint:"‘◯◯은 ◯◯이다’로 읽으며 짝을 찾아요.", pairs:[{a:{text:"🍈 참외는"},b:{text:"과일이다"}},{a:{text:"🐰 토끼는"},b:{text:"동물이다"}},{a:{text:"🌹 장미는"},b:{text:"꽃이다"}},{a:{text:"👘 한복은"},b:{text:"옷이다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"틀에 끼워 말하기", content:"“◯◯은 ◯◯이다” 틀을 칠판에 크게 써 두면, 발표가 막힐 때 틀에 끼워 말할 수 있어요.", fit_slides:["present"]},
    {id:"e_category", type:"extension", icon:"⬆", title:"같은 무리 모으기", content:"익숙해진 아이에겐 ‘동물이다’로 끝나는 문장을 셋 이상 만들게 하면 무리 짓기 감각이 자라요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"내가 만든 문장", content:"“오늘 내가 만든 ‘무엇은 무엇이다’ 문장을 하나 말해 볼까요?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"움직임 문장 예고", content:"“‘토끼는 동물이다’는 알려 주는 문장. 그럼 토끼가 뭘 하는지는 어떻게 말할까요?” 다음 차시를 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l07 소단원2 — ‘누가 무엇을 하다’ 문장을 말해요 ===== */
LESSONS["u7_l07"] = {
  meta: {grade:1, subject:"국어", unit:7, n:7, title:"‘누가 무엇을 하다’ 문장을 말해요", std:"[2국03-02] · [2국04-03]", duration_min:40,
    lesson_format:"교사주도 8슬 — 누가 뭘 하고 있나 → 누가+무엇을+어찌하다 → 세 조각 문장 퀴즈 → 그림 보고 움직임 문장"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"‘누가 무엇을 하다’ 문장을 말해요", subtitle:"7단원 · 7/14차시 · 여러 가지 문장 말하기"}, suggested_extras:["q_open","t_three"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["‘누가 무엇을 하다’ 문장을 살펴봐요","누가·무엇을·어찌하다 세 조각을 채워요","그림을 보고 움직임 문장을 만들어 말해요"]}, suggested_extras:["t_three"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"누가 무엇을 하고 있나요? 👀", visual:"🐿️", question:"그림 속 다람쥐가 도토리를 들고 있어요.<br>이 장면을 한 문장으로 말하면?"}, suggested_extras:["q_scene","r_scene"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"누가 + 무엇을 + 어찌하다", content:"움직임을 알려 줄 때는 **누가, 무엇을, 어찌하다** 세 조각을 차례로 말해요. 세 조각이 다 있어야 뜻이 잘 통해요!", symbol_meanings:[{symbol:"다람쥐가 도토리를 먹는다", meaning:"누가=다람쥐 / 무엇을=도토리 / 어찌하다=먹는다"},{symbol:"아이가 공을 던진다", meaning:"누가=아이 / 무엇을=공 / 어찌하다=던진다"},{symbol:"엄마가 책을 읽는다", meaning:"누가=엄마 / 무엇을=책 / 어찌하다=읽는다"},{symbol:"세 조각", meaning:"하나라도 빠지면 뜻이 흐려져요"}]}, suggested_extras:["t_concept","x_drop"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"세 조각 문장을 완성해요 🧩", sub:"빠진 조각을 채워 ‘누가 무엇을 하다’ 문장을 완성해요. 카드를 누르면 답이 나와요!", cards:[{clue:"다람쥐가 ◯◯◯를 먹는다<br>참나무 아래 떨어진 열매!", emoji:"🐿️", name:"도토리"},{clue:"아이가 공을 ◯◯◯<br>팔을 휘둘러 멀리!", emoji:"⚽", name:"던진다"},{clue:"◯◯가 그림을 그린다<br>붓을 든 사람은 누구?", emoji:"🎨", name:"화가"},{clue:"강아지가 ◯◯를 흔든다<br>기분 좋을 때 살랑살랑!", emoji:"🐶", name:"꼬리"}], outro:"누가·무엇을·어찌하다 세 조각이 모이니 움직임이 또렷하게 보여요! 😊"}, suggested_extras:["q_piece","g_who"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"그림 속 움직임을 문장으로", question:"교실 친구들의 모습을 보고 ‘누가 무엇을 하다’ 문장을 만들어 봐요.", items:["짝꿍은 지금 무엇을 하고 있나요?","‘◯◯가 ◯◯을 ◯◯다’로 말해 봐요","세 조각이 다 들어 있는지 확인해 봐요"]}, suggested_extras:["t_present","e_act"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["‘누가 무엇을 하다’ 문장 모양을 알았어요","누가·무엇을·어찌하다 세 조각을 채웠어요","그림과 교실 장면을 문장으로 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"두 가지 문장을 가려 써요", body:"다음 시간에는 ‘무엇은 무엇이다’와 ‘누가 무엇을 하다’, 두 문장을 가려 쓰는 연습을 할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"몸으로 보여 주기", content:"“선생님이 하는 동작을 문장으로 말해 볼까요?(선생님이 책을 듭니다)” 동작을 보고 문장으로 옮기며 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_three", type:"tip", icon:"🧩", title:"세 조각 손가락", content:"누가·무엇을·어찌하다를 손가락 세 개로 꼽으며 말하게 하세요. 조각이 빠졌는지 스스로 검사할 수 있어요.", fit_slides:["objective","concept"]},
    {id:"q_scene", type:"fun_question", icon:"👀", title:"장면 말하기", content:"“다람쥐가 도토리를 먹는다 — 다음 장면엔 무슨 일이 일어날까요?” 장면을 문장으로 이어 가게 해요.", fit_slides:["motivate"]},
    {id:"r_scene", type:"real_world", icon:"🌍", title:"하루를 문장으로", content:"‘나는 아침에 밥을 먹었다’처럼 오늘 한 일도 모두 ‘누가 무엇을 하다’ 문장이에요. 하루와 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"조각마다 색 다르게", content:"칠판에 누가(파랑)·무엇을(초록)·어찌하다(주황)를 색을 달리해 쓰면 세 조각이 한눈에 구분돼요.", fit_slides:["concept","card_quiz"]},
    {id:"x_drop", type:"misconception", icon:"❓", title:"‘무엇을’을 빼먹기", content:"“다람쥐가 먹는다”처럼 가운데 조각을 빼는 아이가 있어요. “무엇을?” 하고 짧게 되물어 채우게 해 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_piece", type:"fun_question", icon:"💡", title:"어느 조각이 빠졌나", content:"“이 문장에서 빠진 조각은 누가·무엇을·어찌하다 중 무엇이죠?” 빈칸의 자리를 먼저 말하게 해요.", fit_slides:["card_quiz"]},
    {id:"g_who", type:"game", game_kind:"memory_match", icon:"🎮", title:"누가 ↔ 하는 일 짝짓기", description:"누가와 그가 하는 일을 짝지어 보세요.", hint:"‘◯◯가 ◯◯을 ◯◯다’로 읽으며 짝을 찾아요.", pairs:[{a:{text:"🐿️ 다람쥐가"},b:{text:"도토리를 먹는다"}},{a:{text:"⚽ 아이가"},b:{text:"공을 던진다"}},{a:{text:"🎨 화가가"},b:{text:"그림을 그린다"}},{a:{text:"🐶 강아지가"},b:{text:"꼬리를 흔든다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"교실이 그림책", content:"교실 장면을 문장으로 말하는 활동은 누구나 답할 수 있어요. 친구를 따뜻하게 묘사하도록 안내해 주세요.", fit_slides:["question"]},
    {id:"e_act", type:"extension", icon:"⬆", title:"몸짓 문장 놀이", content:"한 명이 동작을 하면 나머지가 ‘누가 무엇을 하다’ 문장으로 맞히는 몸짓 놀이로 확장할 수 있어요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"세 조각 외우기", content:"“움직임 문장의 세 조각은?(누가·무엇을·어찌하다)” 물으며 오늘의 틀을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"두 문장 비교 예고", content:"“‘토끼는 동물이다’와 ‘토끼가 당근을 먹는다’ — 무엇이 다를까요?” 다음 시간 비교를 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l08 소단원2 — 두 가지 문장을 가려 써요 ===== */
LESSONS["u7_l08"] = {
  meta: {grade:1, subject:"국어", unit:7, n:8, title:"두 가지 문장을 가려 써요", std:"[2국03-02] · [2국04-03]", duration_min:40,
    lesson_format:"교사주도 8슬 — 두 문장 비교 → 알려 주는 문장 vs 움직임 문장 → 어떤 문장일까 퀴즈 → 두 문장 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"두 가지 문장을 가려 써요", subtitle:"7단원 · 8/14차시 · 여러 가지 문장 말하기"}, suggested_extras:["q_open","t_both"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["두 가지 문장 모양을 나란히 비교해요","그림에 어울리는 문장 모양을 골라요","한 가지 그림으로 두 문장을 다 만들어요"]}, suggested_extras:["t_both"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"토끼로 두 문장을! 🐰", visual:"🐰", question:"‘토끼는 동물이다.’ ‘토끼가 당근을 먹는다.’<br>둘 다 토끼 문장인데, 무엇이 다를까요?"}, suggested_extras:["q_two","r_use"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"알려 주는 문장, 움직임 문장", content:"**‘무엇은 무엇이다’**는 그것이 무엇인지 알려 주고, **‘누가 무엇을 하다’**는 움직임을 알려 줘요. 말하고 싶은 것에 따라 골라 써요!", symbol_meanings:[{symbol:"토끼는 동물이다", meaning:"토끼가 무엇인지 알려 줘요"},{symbol:"토끼가 당근을 먹는다", meaning:"토끼의 움직임을 알려 줘요"},{symbol:"참외는 과일이다", meaning:"알려 주는 문장"},{symbol:"동생이 참외를 먹는다", meaning:"움직임 문장"}]}, suggested_extras:["t_concept","x_mix"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어떤 문장 모양일까요? 🔎", sub:"문장을 읽고 ‘무엇은 무엇이다’인지 ‘누가 무엇을 하다’인지 가려요. 카드를 누르면 답이 나와요!", cards:[{clue:"기린은 동물이다<br>어떤 문장 모양일까요?", emoji:"🦒", name:"무엇은 무엇이다"},{clue:"아빠가 빨래를 넌다<br>어떤 문장 모양일까요?", emoji:"🧺", name:"누가 무엇을 하다"},{clue:"피아노는 악기이다<br>어떤 문장 모양일까요?", emoji:"🎹", name:"무엇은 무엇이다"},{clue:"누나가 피아노를 친다<br>어떤 문장 모양일까요?", emoji:"🎵", name:"누가 무엇을 하다"}], outro:"알려 주고 싶으면 ‘무엇은 무엇이다’, 움직임을 말하고 싶으면 ‘누가 무엇을 하다’! 가려 쓸 수 있게 됐어요 😊"}, suggested_extras:["q_sort","g_two"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"한 가지로 두 문장 발표 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 좋아하는 것 하나를 골라 두 가지 문장을 모두 말해요!", count:24, hint:"“강아지는 동물이다. 강아지가 공을 문다.” 처럼 두 문장을 이어 말해 봐요", end_msg:"한 가지로 두 문장을 다 만들다니, 문장 만들기 명수가 됐어요! 👏"}, suggested_extras:["t_present","e_pairup"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["두 가지 문장 모양을 비교했어요","문장을 읽고 어떤 모양인지 가렸어요","한 가지로 두 문장을 모두 만들었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"이야기를 보고 문장을 만들어요", body:"다음 시간에는 책을 좋아하는 고양이 이야기를 듣고, 이야기 장면을 문장으로 만들어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"두 문장 듣고 비교", content:"“‘참새는 새다’와 ‘참새가 모이를 먹는다’ — 들리는 느낌이 어떻게 다른가요?” 귀로 먼저 비교하게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_both", type:"tip", icon:"🧩", title:"비교 차시의 핵심", content:"오늘은 새 틀을 배우는 게 아니라 두 틀을 가려 쓰는 시간이에요. 나란히 놓고 비교하는 장면을 많이 만들어 주세요.", fit_slides:["objective","concept"]},
    {id:"q_two", type:"fun_question", icon:"🐰", title:"같은 토끼, 다른 문장", content:"“두 문장 모두 토끼 이야기인데 알려 주는 게 달라요. 무엇이 다른가요?” 차이를 아이 입으로 말하게 해요.", fit_slides:["motivate"]},
    {id:"r_use", type:"real_world", icon:"🌍", title:"언제 어떤 문장?", content:"새 친구를 소개할 땐 ‘◯◯는 내 친구다’, 친구가 한 일을 말할 땐 ‘◯◯가 그림을 그렸다’. 쓰임을 생활과 이어요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"끝말에 귀 기울이기", content:"‘~이다’로 끝나면 알려 주는 문장, ‘~한다/~먹는다’처럼 움직임 말로 끝나면 움직임 문장이에요. 끝말을 단서로 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"x_mix", type:"misconception", icon:"❓", title:"두 틀을 섞어 쓰기", content:"“토끼는 당근을 이다”처럼 두 틀이 섞이는 아이가 있어요. 문장을 끝까지 소리 내어 읽으며 어색함을 느끼게 해 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_sort", type:"fun_question", icon:"💡", title:"바꿔 만들기", content:"“‘기린은 동물이다’를 움직임 문장으로 바꾸면?(기린이 나뭇잎을 먹는다)” 같은 대상을 두 틀로 오가게 해요.", fit_slides:["card_quiz"]},
    {id:"g_two", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 문장 모양", description:"문장과 그 문장의 모양을 짝지어 보세요.", hint:"끝말이 ‘~이다’인지 움직임 말인지 살펴봐요.", pairs:[{a:{text:"🦒 기린은 동물이다"},b:{text:"무엇은 무엇이다"}},{a:{text:"🧺 아빠가 빨래를 넌다"},b:{text:"누가 무엇을 하다"}},{a:{text:"🎹 피아노는 악기이다"},b:{text:"무엇은 무엇이다"}},{a:{text:"🎵 누나가 피아노를 친다"},b:{text:"누가 무엇을 하다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"두 문장 이어 말하기", content:"발표 틀 “◯◯는 ◯◯이다. ◯◯가 ◯◯을 ◯◯다.”를 칠판에 써 두면 두 문장을 자연스럽게 이어 말해요.", fit_slides:["present"]},
    {id:"e_pairup", type:"extension", icon:"⬆", title:"짝과 문장 주고받기", content:"짝이 ‘무엇은 무엇이다’를 말하면 내가 같은 대상으로 ‘누가 무엇을 하다’를 받아치는 주고받기 놀이로 확장해요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가려 쓰기 한 문장", content:"“움직임을 말하고 싶을 땐 어떤 문장 모양?(누가 무엇을 하다)” 물으며 가려 쓰기를 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"이야기 예고", content:"“책을 너무 좋아해서 책 속으로 풍덩 빠진 고양이가 있대요!” 다음 시간 이야기를 살짝 맛보게 해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l09 소단원2 — 이야기를 보고 문장을 만들어요 ① ===== */
LESSONS["u7_l09"] = {
  meta: {grade:1, subject:"국어", unit:7, n:9, title:"이야기를 보고 문장을 만들어요 ①", std:"[2국03-02] · [2국02-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 책 좋아하는 고양이 → 장면을 문장으로 만드는 법 → 이야기 읽어주기 → 장면 문장 만들기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"이야기를 보고 문장을 만들어요 ①", subtitle:"7단원 · 9/14차시 · 여러 가지 문장 말하기"}, suggested_extras:["q_open","t_listen"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이야기를 귀 기울여 들어요","이야기 장면에서 누가 무엇을 했는지 찾아요","장면을 ‘누가 무엇을 하다’ 문장으로 말해요"]}, suggested_extras:["t_listen"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"책을 사랑한 고양이 🐱", visual:"📚", question:"책 읽기를 너무너무 좋아하는 고양이가 있어요.<br>책에 푹 빠지면 무슨 일이 생길까요?"}, suggested_extras:["q_cat","r_book"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"장면을 문장으로 만들어요", content:"이야기를 들으며 **장면마다 누가 무엇을 했는지** 찾아요. 찾은 것을 세 조각 문장으로 말하면 이야기가 또렷해져요!", symbol_meanings:[{symbol:"① 장면 보기", meaning:"이 장면에 누가 나오나요?"},{symbol:"② 움직임 찾기", meaning:"무엇을 하고 있나요?"},{symbol:"③ 문장 만들기", meaning:"고양이가 책을 읽는다"},{symbol:"④ 읽어 확인", meaning:"만든 문장을 또박또박 읽어요"}]}, suggested_extras:["t_concept","x_long"]},
    {id:"s05", stage:"활동", block:"read_aloud", data:{title:"책 속으로 떠난 고양이 이야기 📖", author:"책 좋아하는 고양이가 나오는 그림책", pages:[{img_hint:"고양이가 책을 펼쳐 읽는 장면", quote:"책 읽기를 좋아하는 고양이를 소개하는 장면이에요.\n고양이가 무엇을 하고 있는지 문장으로 말해 보게 하세요."},{img_hint:"고양이가 책 속 세상으로 들어가는 장면", quote:"고양이가 책 속 세상으로 풍덩 들어가는 장면이에요.\n어떤 세상이 펼쳐질지 짐작해 보세요."},{img_hint:"고양이가 상상 속 바다를 항해하는 장면", quote:"고양이가 상상의 배를 타고 바다를 건너요.\n‘고양이가 배를 탄다’처럼 장면을 문장으로 만들어요."},{img_hint:"고양이가 책을 안고 잠든 장면", quote:"여행을 마친 고양이가 책을 안고 잠드는 장면이에요.\n오늘 가장 기억에 남는 장면을 물어보세요."}], copyright:"수업용 진행 안내입니다. 그림책 본문은 학교 수업 목적 이용(저작권법 제25조) 범위에서 교사가 실물 책으로 보여 주세요."}, suggested_extras:["q_while","t_voice"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"장면을 문장으로 만들어요", question:"이야기 장면을 떠올리며 ‘누가 무엇을 하다’ 문장을 만들어 봐요.", items:["첫 장면에서 고양이는 무엇을 했나요? (고양이가 책을 읽는다)","바다 장면을 문장으로 말하면? (고양이가 배를 탄다)","가장 기억에 남는 장면을 문장으로 말해 봐요"]}, suggested_extras:["t_present","e_next"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["이야기를 귀 기울여 들었어요","장면에서 누가 무엇을 했는지 찾았어요","장면을 세 조각 문장으로 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"이야기 장면으로 문장을 더 만들어요", body:"다음 시간에는 여러 장면 그림을 보고 알맞은 문장을 척척 완성해 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"책에 빠진다는 말", content:"“‘책에 푹 빠졌다’는 말, 무슨 뜻일까요?” 표현의 뜻을 가볍게 나누며 이야기로 들어가요.", fit_slides:["cover","motivate"]},
    {id:"t_listen", type:"tip", icon:"🧩", title:"들으며 장면 세기", content:"이야기를 들으며 장면이 바뀔 때마다 손가락을 하나씩 꼽게 하세요. 장면 단위로 듣는 힘이 생겨요.", fit_slides:["objective","read_aloud"]},
    {id:"q_cat", type:"fun_question", icon:"🐱", title:"고양이 상상", content:"“책을 좋아하는 고양이는 어떤 책을 읽을까요?” 듣기 전에 상상을 펼치면 이야기에 빠져들어요.", fit_slides:["motivate"]},
    {id:"r_book", type:"real_world", icon:"🌍", title:"나도 책 속 여행", content:"“책을 읽다가 책 속에 들어가고 싶었던 적 있나요?” 아이의 독서 경험과 이야기를 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"장면마다 멈추기", content:"장을 넘길 때마다 잠깐 멈추고 “누가? 무엇을?” 두 가지만 짧게 물으면 문장 만들 준비가 돼요.", fit_slides:["concept","read_aloud"]},
    {id:"x_long", type:"misconception", icon:"❓", title:"줄거리를 다 말하려 하기", content:"이야기 전체를 한꺼번에 말하려는 아이가 있어요. 한 장면을 한 문장으로, 짧게 만드는 게 목표임을 짚어 주세요.", fit_slides:["concept","question"]},
    {id:"q_while", type:"fun_question", icon:"💡", title:"다음 장면 짐작", content:"“책 속에 들어간 고양이는 이제 무엇을 할까요?” 장면 사이마다 짐작을 물으면 끝까지 집중해요.", fit_slides:["read_aloud"]},
    {id:"t_voice", type:"tip", icon:"🗣", title:"장면마다 목소리", content:"바다 장면은 시원하게, 잠드는 장면은 잔잔하게 — 장면 분위기에 따라 목소리를 바꿔 읽어 주세요.", fit_slides:["read_aloud"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"세 조각 검사", content:"만든 문장에 누가·무엇을·어찌하다가 다 있는지 손가락 세 개로 검사하게 하세요. 지난 시간 배움이 이어져요.", fit_slides:["question"]},
    {id:"e_next", type:"extension", icon:"⬆", title:"뒷이야기 문장", content:"익숙해진 아이에겐 “잠에서 깬 고양이가 다음에 할 일”을 문장으로 상상하게 하면 창의력이 자라요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 한 문장", content:"“오늘 이야기로 만든 문장 중 하나를 말해 볼까요?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"그림 문장 예고", content:"“다음 시간엔 그림만 보고도 문장을 척척 만들 수 있는지 시험해 봐요!” 기대를 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l10 소단원2 — 이야기를 보고 문장을 만들어요 ② ===== */
LESSONS["u7_l10"] = {
  meta: {grade:1, subject:"국어", unit:7, n:10, title:"이야기를 보고 문장을 만들어요 ②", std:"[2국03-02] · [2국03-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 그림 네 장면 → 장면 문장 만들기 복습 → 장면 문장 완성 퀴즈 → 이어지는 이야기 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"이야기를 보고 문장을 만들어요 ②", subtitle:"7단원 · 10/14차시 · 여러 가지 문장 말하기"}, suggested_extras:["q_open","t_alone"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["그림 장면을 보고 문장을 완성해요","완성한 문장을 바르게 써 봐요","장면 문장을 이어 작은 이야기를 만들어요"]}, suggested_extras:["t_alone"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"그림이 들려주는 이야기 🖼️", visual:"🖼️", question:"숲속 친구들의 하루를 그린 네 장면이 있어요.<br>그림만 보고도 문장을 만들 수 있을까요?"}, suggested_extras:["q_four","r_order"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"그림만 보고 문장을 만들어요", content:"이제 이야기 없이 **그림만 보고** 문장을 만들어요. 누가 나오는지, 무엇을 하는지 찾으면 문장이 완성돼요!", symbol_meanings:[{symbol:"부엉이 장면", meaning:"부엉이가 집으로 날아간다"},{symbol:"여우 장면", meaning:"여우가 차를 마신다"},{symbol:"곰 장면", meaning:"곰이 재채기를 한다"},{symbol:"아버지 장면", meaning:"아버지께서 낚시를 하신다"}]}, suggested_extras:["t_concept","x_copy"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"장면 문장을 완성해요 🖼️", sub:"그림 장면의 빈칸 문장을 완성해요. 카드를 누르면 답이 나와요!", cards:[{clue:"부엉이가 집으로 ◯◯◯◯<br>날개를 펴고 하늘을!", emoji:"🦉", name:"날아간다"},{clue:"여우가 ◯를 마신다<br>김이 모락모락 나는 따뜻한 것!", emoji:"🦊", name:"차"},{clue:"곰이 ◯◯◯를 한다<br>에취! 코가 간질간질!", emoji:"🐻", name:"재채기"},{clue:"아버지께서 ◯◯를 하신다<br>받침 ㄲ! 물고기를 잡아요!", emoji:"🎣", name:"낚시"}], outro:"그림만 보고도 문장을 네 개나 완성했어요. 낚시의 받침 ㄲ까지 바르게 썼다면 최고예요! 😊"}, suggested_extras:["q_check","g_scenes"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"이어지는 이야기 발표 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 네 장면 중 하나를 골라 그다음에 일어날 일을 문장으로 말해요!", count:24, hint:"“여우가 차를 마신다. 그다음, 여우가 낮잠을 잔다!” 처럼 이어 봐요", end_msg:"그림 너머의 이야기까지 문장으로 만들었어요. 상상력이 반짝반짝! 👏"}, suggested_extras:["t_present","e_story"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["그림만 보고 문장을 완성했어요","낚시처럼 받침 있는 낱말을 바르게 썼어요","장면을 이어 작은 이야기를 만들었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낱말 카드로 문장 만들기 놀이를 해요", body:"다음 시간에는 낱말 카드를 모아 문장을 만드는 신나는 카드 놀이를 할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"그림 먼저 읽기", content:"“글자가 없어도 그림을 ‘읽을’ 수 있을까요?” 그림 읽기라는 말로 호기심을 끌어요.", fit_slides:["cover","motivate"]},
    {id:"t_alone", type:"tip", icon:"🧩", title:"혼자 힘으로", content:"지난 시간은 이야기를 듣고, 오늘은 그림만 보고 만들어요. 도움을 줄이며 혼자 힘으로 만드는 게 목표예요.", fit_slides:["objective","concept"]},
    {id:"q_four", type:"fun_question", icon:"🖼️", title:"어느 장면부터", content:"“네 장면 중 어떤 장면이 가장 마음에 드나요?” 좋아하는 장면부터 문장을 만들면 부담이 줄어요.", fit_slides:["motivate"]},
    {id:"r_order", type:"real_world", icon:"🌍", title:"만화책과 그림책", content:"만화책도 그림이 이야기를 들려줘요. 그림을 보고 문장을 만드는 힘은 책 읽기의 큰 밑거름이에요.", fit_slides:["motivate","card_quiz"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"높임말 짚어 주기", content:"‘아버지께서 낚시를 하신다’의 ‘께서·하신다’는 웃어른께 쓰는 말이에요. 가볍게 한 번 짚어 주면 좋아요.", fit_slides:["concept","card_quiz"]},
    {id:"x_copy", type:"misconception", icon:"❓", title:"친구 문장 따라 하기", content:"같은 그림이라도 문장은 다를 수 있어요. 친구와 달라도 그림과 어울리면 모두 정답임을 알려 주세요.", fit_slides:["concept","present"]},
    {id:"q_check", type:"fun_question", icon:"💡", title:"받침까지 확인", content:"“‘낚시’의 받침은 무엇이죠?(ㄲ)” 문장 속 받침 낱말을 짚으며 쓰기 정확성도 함께 챙겨요.", fit_slides:["card_quiz"]},
    {id:"g_scenes", type:"game", game_kind:"memory_match", icon:"🎮", title:"장면 ↔ 문장 짝짓기", description:"그림 장면과 어울리는 문장을 짝지어 보세요.", hint:"누가 나오는지 먼저 찾고 짝을 맞춰요.", pairs:[{a:{text:"🦉 부엉이"},b:{text:"집으로 날아간다"}},{a:{text:"🦊 여우"},b:{text:"차를 마신다"}},{a:{text:"🐻 곰"},b:{text:"재채기를 한다"}},{a:{text:"🎣 아버지"},b:{text:"낚시를 하신다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"그다음은 자유롭게", content:"이어지는 이야기는 정답이 없어요. 그림과 어울리기만 하면 어떤 상상이든 환영한다고 알려 주세요.", fit_slides:["present"]},
    {id:"e_story", type:"extension", icon:"⬆", title:"네 문장 이야기", content:"익숙해진 아이에겐 네 장면 문장을 차례로 이어 하나의 짧은 이야기로 읽게 하면 글의 흐름을 경험해요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 마음에 든 문장", content:"“오늘 만든 문장 중 가장 마음에 드는 것은?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"카드 놀이 예고", content:"“낱말 카드 세 장이면 문장이 뚝딱! 어떤 카드가 나올까요?” 다음 시간 놀이를 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l11 실천 — 낱말 카드로 문장을 만들어요 ① ===== */
LESSONS["u7_l11"] = {
  meta: {grade:1, subject:"국어", unit:7, n:11, title:"낱말 카드로 문장을 만들어요 ①", std:"[2국03-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 카드 세 장의 비밀 → 카드 놀이 방법 → 카드 조합 문장 퀴즈 → 내가 만든 문장 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말 카드로 문장을 만들어요 ①", subtitle:"7단원 · 11/14차시 · 배운 내용 실천"}, suggested_extras:["q_open","t_game"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낱말 카드 놀이 방법을 알아봐요","카드를 모아 문장을 만들어요","만든 문장을 또박또박 읽어요"]}, suggested_extras:["t_game"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"카드 세 장의 비밀 🎴", visual:"🎴", question:"‘다람쥐가’ ‘도토리를’ ‘먹는다’ — 카드 세 장!<br>차례로 놓으면 무엇이 될까요?"}, suggested_extras:["q_three","r_cardgame"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"낱말 카드 놀이 방법", content:"낱말 카드를 **누가 → 무엇을 → 어찌하다** 차례로 놓으면 문장이 돼요. 카드를 바꾸면 새 문장이 무궁무진 나와요!", symbol_meanings:[{symbol:"① 카드 고르기", meaning:"누가·무엇을·어찌하다 카드를 한 장씩"},{symbol:"② 차례로 놓기", meaning:"다람쥐가 + 도토리를 + 먹는다"},{symbol:"③ 읽어 보기", meaning:"문장이 자연스러운지 소리 내어 확인"},{symbol:"④ 카드 바꾸기", meaning:"한 장만 바꿔도 새 문장 완성!"}]}, suggested_extras:["t_concept","x_funny"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"카드를 모으면 무슨 문장? 🎴", sub:"카드 세 장을 차례로 놓으면 어떤 문장이 될까요? 카드를 누르면 답이 나와요!", cards:[{clue:"‘다람쥐가’ + ‘도토리를’ + ‘먹는다’<br>합치면?", emoji:"🐿️", name:"다람쥐가 도토리를 먹는다"},{clue:"‘동생이’ + ‘그림을’ + ‘그린다’<br>합치면?", emoji:"🖍️", name:"동생이 그림을 그린다"},{clue:"‘친구가’ + ‘공을’ + ‘찬다’<br>합치면?", emoji:"⚽", name:"친구가 공을 찬다"},{clue:"‘엄마가’ + ‘노래를’ + ‘부른다’<br>합치면?", emoji:"🎤", name:"엄마가 노래를 부른다"}], outro:"카드 세 장이 모여 멋진 문장이 됐어요. 카드를 바꾸면 또 새 문장! 😊"}, suggested_extras:["q_mix","g_cards"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"카드를 바꿔 새 문장을 만들어요", question:"카드 한 장만 바꿔서 새 문장을 만들어 봐요.", items:["‘다람쥐가’를 ‘토끼가’로 바꾸면? (토끼가 도토리를 먹는다)","‘먹는다’를 ‘숨긴다’로 바꾸면? (다람쥐가 도토리를 숨긴다)","내가 바꾼 새 문장을 발표해 봐요"]}, suggested_extras:["t_present","e_silly"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["낱말 카드 놀이 방법을 알았어요","카드를 차례로 놓아 문장을 만들었어요","카드를 바꿔 새 문장을 만들었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"카드 놀이 한마당을 열어요", body:"다음 시간에는 모둠 친구들과 카드를 섞고 나눠, 누가 더 재미있는 문장을 만드는지 한마당을 열 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"블록처럼 문장도", content:"“블록을 끼우면 성이 되듯, 낱말을 이으면 문장이 돼요!” 만들기 놀이에 비유하며 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_game", type:"tip", icon:"🧩", title:"놀이 규칙 먼저", content:"카드 놀이는 규칙이 또렷해야 즐거워요. 고르기→놓기→읽기→바꾸기 네 단계를 먼저 약속해 주세요.", fit_slides:["objective","concept"]},
    {id:"q_three", type:"fun_question", icon:"🎴", title:"순서를 바꾸면", content:"“‘도토리를 다람쥐가 먹는다’처럼 순서를 바꿔도 될까요?” 카드 순서를 바꿔 읽으며 자연스러움을 비교해요.", fit_slides:["motivate"]},
    {id:"r_cardgame", type:"real_world", icon:"🌍", title:"집에서도 카드 놀이", content:"종이를 잘라 낱말 카드를 만들면 집에서 가족과도 문장 만들기 놀이를 할 수 있어요. 알림장으로 안내해 보세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"카드 색 구분", content:"누가(파랑)·무엇을(초록)·어찌하다(주황)로 카드 색을 나누면 차례로 놓기가 한결 쉬워져요.", fit_slides:["concept","card_quiz"]},
    {id:"x_funny", type:"misconception", icon:"❓", title:"엉뚱한 문장은 실패?", content:"‘곰이 노래를 먹는다’ 같은 엉뚱한 문장이 나올 수 있어요. 틀렸다고 하기보다 함께 웃고 어울리는 카드로 고쳐 봐요.", fit_slides:["concept","question"]},
    {id:"q_mix", type:"fun_question", icon:"💡", title:"몇 가지 문장이 나올까", content:"“카드가 많아지면 문장을 몇 개나 만들 수 있을까요?” 조합의 무궁무진함을 느끼게 해요.", fit_slides:["card_quiz"]},
    {id:"g_cards", type:"game", game_kind:"memory_match", icon:"🎮", title:"누가 ↔ 어울리는 카드", description:"‘누가’ 카드와 어울리는 ‘무엇을+어찌하다’ 카드를 짝지어 보세요.", hint:"문장으로 읽어 보며 자연스러운 짝을 찾아요.", pairs:[{a:{text:"🐿️ 다람쥐가"},b:{text:"도토리를 먹는다"}},{a:{text:"🖍️ 동생이"},b:{text:"그림을 그린다"}},{a:{text:"⚽ 친구가"},b:{text:"공을 찬다"}},{a:{text:"🎤 엄마가"},b:{text:"노래를 부른다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"바꾼 카드 말하기", content:"발표할 때 “저는 ◯◯ 카드를 ◯◯로 바꿨어요”라고 먼저 말하게 하면 비교가 또렷해져요.", fit_slides:["question","card_quiz"]},
    {id:"e_silly", type:"extension", icon:"⬆", title:"가장 재미있는 문장", content:"익숙해진 아이에겐 ‘말이 되면서도 가장 웃긴 문장’ 만들기에 도전하게 하면 창의력이 폭발해요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"카드 놀이 한 줄 소감", content:"“카드로 문장을 만들어 보니 어땠나요?” 물으며 놀이의 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"한마당 준비", content:"“다음 시간 한마당에서 쓰고 싶은 낱말 카드를 미리 생각해 오세요!” 기대를 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l12 실천 — 낱말 카드로 문장을 만들어요 ② ===== */
LESSONS["u7_l12"] = {
  meta: {grade:1, subject:"국어", unit:7, n:12, title:"낱말 카드로 문장을 만들어요 ②", std:"[2국03-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 한마당 열기 → 모둠 카드 놀이 약속 → 모둠 놀이 진행 → 모둠 대표 문장 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말 카드로 문장을 만들어요 ②", subtitle:"7단원 · 12/14차시 · 배운 내용 실천"}, suggested_extras:["q_open","t_team"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["모둠 친구들과 카드 놀이 한마당을 열어요","카드를 나누고 섞어 여러 문장을 만들어요","모둠에서 가장 마음에 드는 문장을 뽑아요"]}, suggested_extras:["t_team"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"문장 만들기 한마당 🎪", visual:"🎪", question:"오늘은 우리 반 문장 한마당!<br>모둠 친구들과 카드를 모으면 어떤 문장이 태어날까요?"}, suggested_extras:["q_fair","r_together"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"모둠 카드 놀이 약속", content:"모둠 놀이는 **약속을 지켜야** 즐거워요. 카드를 골고루 나누고, 차례를 지키고, 친구의 문장을 끝까지 들어요!", symbol_meanings:[{symbol:"① 카드 나누기", meaning:"누가·무엇을·어찌하다 카드를 골고루"},{symbol:"② 차례 지키기", meaning:"한 사람씩 돌아가며 문장을 놓아요"},{symbol:"③ 함께 읽기", meaning:"완성된 문장은 모둠이 같이 읽어요"},{symbol:"④ 대표 문장 뽑기", meaning:"가장 마음에 드는 문장에 별표!"}]}, suggested_extras:["t_concept","x_fight"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"모둠 카드 놀이 한마당 🎴", question:"모둠별로 카드를 나누고 문장 만들기 놀이를 시작해요. 화면의 약속을 보며 진행해요!", items:["카드를 누가·무엇을·어찌하다로 나눠 펼쳐요","차례대로 한 문장씩 만들고 모둠이 함께 읽어요","말이 안 되는 문장은 카드를 바꿔 고쳐 봐요","모둠 대표 문장 하나를 골라 별표를 붙여요"]}, suggested_extras:["q_during","g_fair"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"모둠 대표 문장 발표 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 우리 모둠의 대표 문장과 그 문장을 고른 까닭을 말해요!", count:24, hint:"“우리 모둠 문장은 ‘아기가 풍선을 잡는다’예요. 그림이 그려져서 골랐어요” 처럼 말해요", end_msg:"모둠마다 보석 같은 문장이 나왔어요. 함께 만들어 더 빛났어요! 👏"}, suggested_extras:["t_present","e_wall"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["모둠 친구들과 약속을 지키며 놀이했어요","카드를 바꿔 가며 여러 문장을 만들었어요","모둠 대표 문장을 뽑아 발표했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"배운 내용을 정리해요", body:"다음 시간에는 쌍받침 낱말과 문장 만들기, 이 단원에서 배운 것을 차근차근 정리할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"한마당 목표 세우기", content:"“오늘 우리 모둠은 문장을 몇 개나 만들 수 있을까요?” 모둠별 목표를 세우면 놀이에 활기가 돌아요.", fit_slides:["cover","motivate"]},
    {id:"t_team", type:"tip", icon:"🧩", title:"모둠 구성 팁", content:"문장 만들기에 자신 있는 아이와 아직 어려운 아이를 섞어 모둠을 짜면 서로 배우며 놀이할 수 있어요.", fit_slides:["objective","concept"]},
    {id:"q_fair", type:"fun_question", icon:"🎪", title:"한마당의 설렘", content:"“한마당에서는 틀려도 괜찮아요. 가장 중요한 건 무엇일까요?(함께 즐기기!)” 놀이의 마음을 먼저 세워요.", fit_slides:["motivate"]},
    {id:"r_together", type:"real_world", icon:"🌍", title:"함께 만들면 더 큰 힘", content:"혼자보다 여럿이 모이면 생각지 못한 문장이 나와요. 협력의 즐거움을 놀이로 느끼게 해 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"약속판 붙이기", content:"네 가지 약속을 모둠 책상에 붙여 두면, 놀이 중에도 스스로 약속을 확인할 수 있어요.", fit_slides:["concept","question"]},
    {id:"x_fight", type:"misconception", icon:"❓", title:"카드 욕심내기", content:"좋은 카드를 서로 가지려 다툴 수 있어요. 카드는 모둠 모두의 것이고, 바꿔 쓸수록 문장이 늘어남을 짚어 주세요.", fit_slides:["concept","question"]},
    {id:"q_during", type:"fun_question", icon:"💡", title:"돌며 한 마디", content:"모둠을 돌며 “이 문장은 어떻게 만들었어요?” 물어 주세요. 과정을 말하게 하면 배움이 또렷해져요.", fit_slides:["question"]},
    {id:"g_fair", type:"game", game_kind:"memory_match", icon:"🎮", title:"한마당 보너스 짝짓기", description:"누가 카드와 어울리는 문장 짝을 맞춰 보세요.", hint:"문장으로 읽으며 자연스러운 짝을 찾아요.", pairs:[{a:{text:"👶 아기가"},b:{text:"풍선을 잡는다"}},{a:{text:"🐢 거북이가"},b:{text:"바다를 헤엄친다"}},{a:{text:"👵 할머니가"},b:{text:"옛이야기를 들려주신다"}},{a:{text:"🐝 꿀벌이"},b:{text:"꽃에 앉는다"}}], fit_slides:["question"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"까닭까지 한 세트", content:"대표 문장 발표는 ‘문장+고른 까닭’을 한 세트로 안내하세요. 문장을 보는 눈이 함께 자라요.", fit_slides:["present"]},
    {id:"e_wall", type:"extension", icon:"⬆", title:"문장 한마당 벽보", content:"모둠 대표 문장들을 교실 벽에 붙여 ‘우리 반 문장 한마당’ 벽보로 만들면 배움이 오래 남아요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"모둠 놀이 소감", content:"“모둠 친구와 함께 만들어 좋았던 점은?” 물으며 협력의 경험을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"정리 시간 예고", content:"“이 단원에서 배운 것을 두 가지로 말하면?(쌍받침·문장 만들기)” 다음 정리 차시를 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l13 마무리 — 배운 내용을 정리해요 ===== */
LESSONS["u7_l13"] = {
  meta: {grade:1, subject:"국어", unit:7, n:13, title:"배운 내용을 정리해요", std:"[2국04-03] · [2국03-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 단원 돌아보기 → 쌍받침·문장 두 갈래 정리 → 쌍받침 낱말 퀴즈 → 문장 만들기 정리 발문"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"배운 내용을 정리해요", subtitle:"7단원 · 13/14차시 · 단원 마무리"}, suggested_extras:["q_open","t_recap"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이 단원에서 배운 것을 돌아봐요","쌍받침 ㄲ·ㅆ 낱말을 다시 읽고 써요","두 가지 문장 모양으로 문장을 만들어요"]}, suggested_extras:["t_recap"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리가 걸어온 길 🗺️", visual:"🗺️", question:"“당근!” 하고 외치던 요리사 곰, 기억나나요?<br>이제 우리는 어떻게 말할 수 있게 됐을까요?"}, suggested_extras:["q_back","r_growth"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"두 갈래로 정리해요", content:"이 단원에서 우리는 **쌍받침 ㄲ·ㅆ 읽고 쓰기**와 **알맞은 낱말로 문장 만들기**를 배웠어요. 하나씩 다시 짚어 봐요!", symbol_meanings:[{symbol:"낚시 · 밖 (받침 ㄲ)", meaning:"같은 자음자 두 개가 받침이 돼요"},{symbol:"갔다 · 있다 (받침 ㅆ)", meaning:"ㅆ 받침도 자주 쓰여요"},{symbol:"참외는 과일이다", meaning:"무엇은 무엇이다 — 알려 주는 문장"},{symbol:"동생이 참외를 먹는다", meaning:"누가 무엇을 하다 — 움직임 문장"}]}, suggested_extras:["t_concept","x_both"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"쌍받침 낱말 정리 퀴즈 🏆", sub:"받침 ㄲ·ㅆ가 들어간 낱말을 맞혀요. 카드를 누르면 답이 나와요!", cards:[{clue:"받침 ㄲ이 들어가요<br>물가에서 물고기를 잡아요", emoji:"🎣", name:"낚시"},{clue:"받침 ㄲ이 들어가요<br>밥과 채소를 기름에 휘리릭!", emoji:"🍳", name:"볶음밥"},{clue:"받침 ㄲ이 들어가요<br>교실 안이 아니라 문 너머!", emoji:"🚪", name:"밖"},{clue:"받침 ㅆ이 들어가요<br>어제 학교에 ◯◯!", emoji:"🏫", name:"갔다"}], outro:"쌍받침 낱말을 모두 맞혔어요. 받침 ㄲ·ㅆ를 쓸 때는 같은 자음자를 두 번, 잊지 마요! 😊"}, suggested_extras:["q_twice","g_recap"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"문장 만들기로 마무리해요", question:"배운 두 가지 문장 모양으로 마지막 문장을 만들어 봐요.", items:["‘무엇은 무엇이다’ 문장을 하나 말해 봐요","‘누가 무엇을 하다’ 문장을 하나 말해 봐요","두 문장에 쌍받침 낱말을 넣을 수 있을까요?"]}, suggested_extras:["t_present","e_combo"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["쌍받침 ㄲ·ㅆ 낱말을 다시 읽고 썼어요","두 가지 문장 모양으로 문장을 만들었어요","단원에서 배운 두 갈래를 정리했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 스스로 돌아봐요", body:"다음 시간은 이 단원의 마지막! 낱말과 움직임 말을 짝짓고, 1학기 국어를 마무리하며 나를 돌아볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"첫 시간과 비교", content:"“낱말만 외치면 왜 안 통했죠?” 첫 차시 장면을 물으며 단원의 출발점을 떠올려요.", fit_slides:["cover","motivate"]},
    {id:"t_recap", type:"tip", icon:"🧩", title:"정리는 아이 입으로", content:"교사가 요약하기보다 “무엇을 배웠죠?” 묻고 아이가 말하게 하세요. 스스로 꺼낸 말이 오래 남아요.", fit_slides:["objective","concept"]},
    {id:"q_back", type:"fun_question", icon:"🗺️", title:"요리사 곰 돕기", content:"“이제 요리사 곰에게 어떻게 말하라고 알려 줄까요?(당근을 주세요!)” 도입 장면을 문장으로 해결해요.", fit_slides:["motivate"]},
    {id:"r_growth", type:"real_world", icon:"🌍", title:"자란 모습 보여 주기", content:"단원 첫 시간에 만든 문장과 오늘 문장을 나란히 보여 주면 아이 스스로 성장을 확인할 수 있어요.", fit_slides:["motivate","summary"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"두 갈래 칠판 나누기", content:"칠판을 반으로 나눠 왼쪽엔 쌍받침 낱말, 오른쪽엔 문장 모양을 정리하면 단원이 한눈에 들어와요.", fit_slides:["concept","card_quiz"]},
    {id:"x_both", type:"misconception", icon:"❓", title:"ㄲ를 ㄱ 하나로 쓰기", content:"‘낚시’를 ‘낙시’로 쓰는 아이가 있어요. 받침 자리에도 같은 자음자를 두 번 써야 함을 다시 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_twice", type:"fun_question", icon:"💡", title:"받침 자리 확인", content:"“‘낚시’에서 받침 ㄲ은 어느 글자에 있죠?(낚)” 낱말마다 쌍받침 자리를 짚으며 확인해요.", fit_slides:["card_quiz"]},
    {id:"g_recap", type:"game", game_kind:"memory_match", icon:"🎮", title:"쌍받침 낱말 짝짓기", description:"낱말과 그 낱말의 받침을 짝지어 보세요.", hint:"받침 자리의 자음자를 잘 살펴봐요.", pairs:[{a:{text:"🎣 낚시"},b:{text:"받침 ㄲ"}},{a:{text:"🍳 볶음밥"},b:{text:"받침 ㄲ"}},{a:{text:"🏫 갔다"},b:{text:"받침 ㅆ"}},{a:{text:"💧 있다"},b:{text:"받침 ㅆ"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"틀 두 개 나란히", content:"“◯◯은 ◯◯이다 / ◯◯가 ◯◯을 ◯◯다” 두 틀을 칠판에 나란히 써 두면 정리 발표가 수월해요.", fit_slides:["question"]},
    {id:"e_combo", type:"extension", icon:"⬆", title:"쌍받침+문장 도전", content:"‘아빠가 볶음밥을 만든다’처럼 쌍받침 낱말이 든 문장 만들기에 도전하게 하면 두 갈래가 하나로 이어져요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"두 갈래 말하기", content:"“이 단원의 두 갈래는?(쌍받침 읽고 쓰기·문장 만들기)” 물으며 정리를 마쳐요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"마지막 시간 예고", content:"“다음 시간은 1학기 국어의 마지막 시간! 어떤 마음으로 마무리하면 좋을까요?” 기대를 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l14 마무리 — 기초를 다지고 스스로 돌아봐요 ===== */
LESSONS["u7_l14"] = {
  meta: {grade:1, subject:"국어", unit:7, n:14, title:"기초를 다지고 스스로 돌아봐요", std:"[2국03-01] · [2국03-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 마지막 시간 → 낱말과 움직임 말 짝·글씨 쓰기 → 무엇을 어찌하다 퀴즈 → 1학기 돌아보기 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"기초를 다지고 스스로 돌아봐요", subtitle:"7단원 · 14/14차시 · 단원 마무리"}, suggested_extras:["q_open","t_base"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["물건과 어울리는 움직임 말을 짝지어요","기지개·복숭아·도서관을 바르게 따라 써요","1학기 국어에서 자란 나를 돌아봐요"]}, suggested_extras:["t_base"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"아침에 일어나면 기지개! 🌅", visual:"🌅", question:"아침에 일어나 기지개를 쭉 켜요.<br>장갑은 끼고, 신발은 신고… 물건마다 어울리는 말이 따로 있네요?"}, suggested_extras:["q_stretch","r_daily"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"물건마다 어울리는 움직임 말", content:"물건에는 **꼭 맞는 움직임 말**이 있어요. 장갑은 끼고, 신발은 신고, 모자는 쓰고, 리본은 묶어요. 알맞게 짝지어 말해요!", symbol_meanings:[{symbol:"장갑을 끼다", meaning:"손에 들어가는 것은 ‘끼다’"},{symbol:"신발을 신다", meaning:"발에 꿰는 것은 ‘신다’"},{symbol:"모자를 쓰다", meaning:"머리에 얹는 것은 ‘쓰다’"},{symbol:"리본을 묶다", meaning:"받침 ㄲ! 끈으로 매는 것은 ‘묶다’"}]}, suggested_extras:["t_concept","x_swap"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"무엇을 어찌하다 짝짓기 🧤", sub:"물건과 어울리는 움직임 말을 골라요. 카드를 누르면 답이 나와요!", cards:[{clue:"장갑을 ◯◯<br>추운 날 손에 쏙!", emoji:"🧤", name:"끼다"},{clue:"신발을 ◯◯<br>나갈 때 발에 쏙!", emoji:"👟", name:"신다"},{clue:"모자를 ◯◯<br>햇빛 가리게 머리에!", emoji:"🧢", name:"쓰다"},{clue:"리본을 ◯◯<br>받침 ㄲ! 예쁘게 매듭을!", emoji:"🎀", name:"묶다"}], outro:"물건마다 꼭 맞는 말을 찾았어요. 이제 옷도 입고, 양말도 신고, 알맞게 말할 수 있죠? 😊"}, suggested_extras:["q_more","g_wear"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"1학기 국어 돌아보기 발표 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 1학기 국어에서 잘하게 된 것 한 가지를 말해요. 친구와 비교하지 않아도 돼요!", count:24, hint:"“이제 문장으로 말할 수 있어요”, “받침을 안 빼먹고 써요” 처럼 말해 봐요", end_msg:"글자에서 시작해 문장까지 — 1학기 국어를 끝까지 해낸 우리 반, 정말 자랑스러워요! 🎉"}, suggested_extras:["t_present","e_self"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"7단원에서 배운 것", points:["쌍받침 ㄲ·ㅆ 낱말을 읽고 쓰게 됐어요","알맞은 낱말로 문장을 완성하게 됐어요","내 생각을 문장으로 표현하는 즐거움을 알았어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"1학기 국어를 마치며", preview:"글자에서 문장까지, 정말 멋지게 자랐어요!", body:"자음자·모음자에서 시작해 받침, 낱말, 그리고 문장까지! 1학기 국어 여행을 모두 마쳤어요. 2학기에는 더 길고 재미있는 글을 만나요. 방학 동안 그림책과 친하게 지내요! 🌻"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"마지막 시간의 마음", content:"“오늘은 1학기 국어의 마지막 시간이에요. 3월의 나와 지금의 나, 무엇이 달라졌나요?” 돌아보기의 문을 열어요.", fit_slides:["cover","motivate"]},
    {id:"t_base", type:"tip", icon:"🧩", title:"기초 다지기의 뜻", content:"기초 다지기는 시험이 아니라 배운 것을 단단히 하는 시간이에요. 편안한 분위기로 진행해 주세요.", fit_slides:["objective","card_quiz"]},
    {id:"q_stretch", type:"fun_question", icon:"🌅", title:"다 같이 기지개", content:"“다 같이 기지개를 쭉! ‘기지개를 켜다’라고 말해요.” 몸으로 한 번 하고 말로 옮기며 시작해요.", fit_slides:["motivate"]},
    {id:"r_daily", type:"real_world", icon:"🌍", title:"아침 준비도 문장으로", content:"‘양말을 신는다, 가방을 멘다’ — 아침 준비가 전부 ‘무엇을 어찌하다’예요. 등교 준비와 이어 주세요.", fit_slides:["motivate","card_quiz"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"글씨 쓰기 묶음", content:"기지개·복숭아·도서관은 따라 쓰기 좋은 묶음이에요. 한 글자씩 짜임을 말하며 또박또박 쓰게 해 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"x_swap", type:"misconception", icon:"❓", title:"끼다와 신다 바꿔 쓰기", content:"“장갑을 신다”처럼 움직임 말을 바꿔 쓰는 아이가 있어요. 틀렸다고 하기보다 바른 짝을 소리 내어 익히게 해요.", fit_slides:["concept","card_quiz"]},
    {id:"q_more", type:"fun_question", icon:"💡", title:"또 무엇을 어찌하다", content:"“‘안경’은 어떤 말과 어울릴까요?(쓰다·끼다)” 다른 물건으로도 짝을 넓혀 봐요.", fit_slides:["card_quiz"]},
    {id:"g_wear", type:"game", game_kind:"memory_match", icon:"🎮", title:"물건 ↔ 움직임 말", description:"물건과 어울리는 움직임 말을 짝지어 보세요.", hint:"몸 어디에 어떻게 하는지 떠올리며 짝을 찾아요.", pairs:[{a:{text:"🧤 장갑"},b:{text:"끼다"}},{a:{text:"👟 신발"},b:{text:"신다"}},{a:{text:"🧢 모자"},b:{text:"쓰다"}},{a:{text:"🎀 리본"},b:{text:"묶다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"비교 없는 돌아보기", content:"돌아보기 발표는 친구와 비교하지 않게 해 주세요. ‘3월의 나’와 ‘지금의 나’를 비교하는 게 핵심이에요.", fit_slides:["present"]},
    {id:"e_self", type:"extension", icon:"⬆", title:"세 가지 스스로 점검", content:"쌍받침 낱말을 읽고 쓴다 / 알맞은 낱말로 문장을 완성한다 / 내 생각을 문장으로 말한다 — 셋을 스스로 점검하게 해요.", fit_slides:["present","summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"문장의 즐거움", content:"“문장으로 말하니 무엇이 좋았나요?” 단원 학습 목표를 마음으로 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"방학 책 친구", content:"“방학 동안 그림책 한 권과 친해져 보세요. 2학기에 책 친구를 소개하는 시간을 가져요!” 따뜻하게 마무리해요.", fit_slides:["next_lesson"]}
  ]
};
