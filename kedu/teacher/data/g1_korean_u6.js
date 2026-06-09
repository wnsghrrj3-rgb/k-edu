/* ============================================================
   1학년 1학기 국어 — 6단원 「또박또박 읽어요」 (케이티처)
   양산 영역 — LESSONS["u6_l{NN}"] 누적 / 다른 단원·과목 .js = read-only
   ------------------------------------------------------------
   ★ 케이티처 = 교사 주도 수업 도구. 로깅 없음(수업 진행용).
   ★ 트랙 = 읽기(정확히·띄어 읽기) + 문법(문장 부호) + 문학(실감 읽기).
     소단원1(l02~l05)=문장을 또박또박 정확히 읽기,
     소단원2(l06~l09)=문장 부호(마침표·쉼표·물음표·느낌표)와 띄어 읽기(∨·≫),
     실천(l10·l11)=목소리 연극, 마무리(l12·l13).
   ★ 띄어 읽기 표기: 쉼표 뒤 ∨(조금 쉼) / 마침표·물음표·느낌표 뒤 ≫(조금 더 쉼).
   ★ 저작권: 그림책·옛이야기 본문·삽화·작가·고유 인물명 미게재. read_aloud는
     작품 비특정 + 교사 진행 안내만. 예시 문장 전부 보편어 자체 작성.
   ------------------------------------------------------------
   차시 구성(13차시):
   l01 단원 도입 · l02 여러 가지 문장 읽기① · l03 여러 가지 문장 읽기②
   l04 뜻 생각하며 읽기① · l05 뜻 생각하며 읽기②
   l06 문장 부호① 마침표·쉼표 · l07 문장 부호② 물음표·느낌표
   l08 부호에 맞게 띄어 읽기 · l09 그림책 자연스럽게 읽기
   l10 목소리 연극 준비 · l11 목소리 연극 발표
   l12 배운 내용 정리 · l13 기초 다지기와 자기 돌아보기
   ============================================================ */

/* ===== l01 단원 도입 — 배울 내용을 살펴봐요 ===== */
LESSONS["u6_l01"] = {
  meta: {grade:1, subject:"국어", unit:6, n:1, title:"배울 내용을 살펴봐요", std:"[2국02-01] · [2국02-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 잘못 읽은 한 글자 → 정확히·알맞게 띄어 읽기의 힘 → 뜻이 달라지는 읽기 카드 → 단원 두 갈래 안내"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"배울 내용을 살펴봐요", subtitle:"6단원 · 1/13차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이 단원에서 무엇을 배울지 살펴봐요","잘못 읽으면 뜻이 달라짐을 알아봐요","띄어 읽기에 따라 뜻이 달라짐을 알아봐요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"한 글자 때문에! 😲", visual:"😲", question:"‘버스를 타다’를 ‘버스를 가다’로 잘못 읽으면<br>뜻이 어떻게 될까요? 한 글자가 이렇게 중요해요!"}, suggested_extras:["q_oneletter","r_life"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"정확하게, 알맞게 띄어 읽어요", content:"문장은 **글자 하나하나 정확하게** 읽고, **알맞은 곳에서 쉬어 가며** 읽어야 뜻이 잘 통해요. 이 단원의 두 갈래예요!", symbol_meanings:[{symbol:"타다 ↔ 가다", meaning:"한 글자만 달라도 뜻이 달라져요"},{symbol:"오늘 밤, 나무를 심자", meaning:"밤(저녁)에 나무를 심는다는 뜻"},{symbol:"오늘 밤나무를 심자", meaning:"밤나무(나무 이름)를 심는다는 뜻"},{symbol:"띄어 읽기", meaning:"어디서 쉬느냐에 따라 뜻이 바뀌어요"}]}, suggested_extras:["t_concept","x_fast"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"제대로 읽으면 무슨 뜻? 🎴", sub:"읽기에 따라 뜻이 달라지는 문장이에요. 카드를 누르고 두 가지 읽기를 비교해 봐요!", cards:[{clue:"‘오늘 밤 나무를 심자’<br>‘밤’ 뒤에서 쉬어 읽으면?", emoji:"🌙", name:"저녁에 나무를 심자는 뜻"},{clue:"‘오늘 밤나무를 심자’<br>붙여 읽으면?", emoji:"🌰", name:"밤나무를 심자는 뜻"},{clue:"‘문을 닫다’를 ‘물을 닫다’로<br>읽으면 어떻게 될까요?", emoji:"🚪", name:"뜻이 통하지 않아요"}], outro:"정확하게, 알맞게 띄어 읽어야 뜻이 살아나요. 이 단원에서 또박또박 읽기 달인이 되어 봐요! 😊"}, suggested_extras:["q_try","g_pair"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"이 단원에서 배울 것을 말해요", question:"이 단원에서 무엇을 배우게 될지 이야기해 봐요.", items:["글자를 잘못 읽어 곤란했던 적이 있나요?","문장 끝의 점(.)이나 물음표(?)를 본 적 있나요?","또박또박 읽기를 잘하면 무엇이 좋을까요?"]}, suggested_extras:["t_present","e_goal"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["한 글자만 달라도 뜻이 달라짐을 알았어요","띄어 읽기에 따라 뜻이 바뀜을 알았어요","정확히 읽기와 띄어 읽기를 배울 거예요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 가지 문장을 읽어 봐요", body:"다음 시간에는 ‘토끼가 뛴다’처럼 여러 가지 문장을 만나 또박또박 소리 내어 읽어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"일부러 틀리게 읽기", content:"“선생님이 일부러 틀리게 읽을게요. 어디가 이상한지 찾아봐요!” 틀린 읽기 찾기로 흥미를 끌어요.", fit_slides:["cover","motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"두 갈래 미리 보기", content:"이 단원은 ‘정확히 읽기’와 ‘알맞게 띄어 읽기’ 두 갈래예요. 도입에선 호기심만 심어도 충분해요.", fit_slides:["objective","cover"]},
    {id:"q_oneletter", type:"fun_question", icon:"😲", title:"한 글자 바꾸기", content:"“‘문을 열다’에서 한 글자를 바꾸면 어떤 일이 생길까요?” 한 글자의 힘을 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_life", type:"real_world", icon:"🌍", title:"안내문 읽기", content:"버스 안내판·알림장을 잘못 읽으면 정말 곤란해져요. 정확히 읽기가 생활의 힘임을 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"두 문장 나란히", content:"‘밤 나무’와 ‘밤나무’ 문장을 칠판에 나란히 쓰고 쉬는 곳을 표시해 주세요. 차이가 한눈에 보여요.", fit_slides:["concept","card_quiz"]},
    {id:"x_fast", type:"misconception", icon:"❓", title:"빨리 읽기가 잘 읽기?", content:"빨리 읽어야 잘 읽는 거라 여기는 아이가 있어요. 정확하고 알맞게가 먼저임을 짚어 주세요.", fit_slides:["concept","question"]},
    {id:"q_try", type:"fun_question", icon:"💡", title:"둘 다 읽어 보기", content:"“두 가지 읽기를 직접 소리 내어 비교해 봐요.” 몸으로 읽어야 차이가 실감 나요.", fit_slides:["card_quiz"]},
    {id:"g_pair", type:"game", game_kind:"memory_match", icon:"🎮", title:"읽기 ↔ 뜻 짝짓기", description:"읽는 방법과 그때의 뜻을 짝지어 보세요.", hint:"어디서 쉬어 읽었는지 살펴봐요.", pairs:[{a:{text:"🌙 밤 ∨ 나무를 심자"},b:{text:"저녁에 심자"}},{a:{text:"🌰 밤나무를 심자"},b:{text:"밤나무를 심자"}},{a:{text:"🚌 버스를 타다"},b:{text:"올바른 문장"}},{a:{text:"❓ 버스를 가다"},b:{text:"이상한 문장"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"경험을 짧게", content:"잘못 읽은 경험은 한 문장으로 짧게 말하게 하세요. 여러 아이가 참여할 수 있어요.", fit_slides:["question"]},
    {id:"e_goal", type:"extension", icon:"⬆", title:"읽기 다짐", content:"‘끝까지 또박또박 읽기’처럼 단원 다짐을 정해 두면 마무리 차시에서 돌아볼 수 있어요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"“띄어 읽기로 뜻이 달라진 문장, 기억나요?(밤 나무/밤나무)” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"문장 예고", content:"칠판에 ‘토끼가 뛴다’를 쓰고 함께 읽어 보세요. 다음 시간 문장 읽기가 기다려져요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l02 소단원1 — 여러 가지 문장을 읽어요 ① ===== */
LESSONS["u6_l02"] = {
  meta: {grade:1, subject:"국어", unit:6, n:2, title:"여러 가지 문장을 읽어요 ①", std:"[2국02-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 그림과 문장 → 문장의 두 모양(무엇이 어찌하다/무엇이다) → 그림에 맞는 문장 카드 → 문장 만들어 읽기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"여러 가지 문장을 읽어요 ①", subtitle:"6단원 · 2/13차시 · 소리 내어 문장 읽기"}, suggested_extras:["q_open","t_sentence"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["문장이 어떤 모양인지 살펴봐요","그림에 어울리는 문장을 찾아요","문장을 또박또박 소리 내어 읽어요"]}, suggested_extras:["t_sentence"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"그림을 문장으로 말하면 🖼️", visual:"🐰", question:"토끼가 폴짝 뛰는 그림이 있어요.<br>이 그림을 한 문장으로 말하면 어떻게 될까요?"}, suggested_extras:["q_picture","r_talk"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"문장의 두 가지 모양", content:"문장에는 **‘무엇이 어찌하다’**(움직임)와 **‘무엇이 무엇이다’**(설명) 모양이 있어요. 끝까지 또박또박 읽어요!", symbol_meanings:[{symbol:"토끼가 뛴다", meaning:"무엇이 + 어찌하다 (움직임)"},{symbol:"새가 노래한다", meaning:"무엇이 + 어찌하다 (움직임)"},{symbol:"수박이 과일이다", meaning:"무엇이 + 무엇이다 (설명)"},{symbol:"곰이 동물이다", meaning:"무엇이 + 무엇이다 (설명)"}]}, suggested_extras:["t_concept","x_half"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"그림에 어울리는 문장 🎴", sub:"그림을 보고 어울리는 문장을 생각해요. 카드를 누르면 문장이 나와요. 다 같이 또박또박 읽어요!", cards:[{clue:"🐸 개구리가 폴짝!<br>한 문장으로 말하면?", emoji:"🐸", name:"개구리가 뛴다"},{clue:"🐟 물고기가 물속에서!<br>한 문장으로 말하면?", emoji:"🐟", name:"물고기가 헤엄친다"},{clue:"🌸 꽃은 무엇일까요?<br>설명하는 문장으로?", emoji:"🌸", name:"꽃이 식물이다"},{clue:"🐶 강아지가 꼬리를!<br>한 문장으로 말하면?", emoji:"🐶", name:"강아지가 꼬리를 흔든다"}], outro:"그림이 문장이 됐어요! 문장은 끝 글자까지 또박또박 읽어야 뜻이 완성돼요 😊"}, suggested_extras:["q_endread","g_match"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"문장을 만들어 읽어요", question:"‘무엇이 어찌하다’ 모양으로 문장을 만들어 또박또박 읽어 봐요.", items:["‘새가 ___’ 빈칸을 채우면? (난다·노래한다)","‘아기가 ___’ 빈칸을 채우면? (웃는다·잔다)","내가 만든 문장을 또박또박 읽어 봐요"]}, suggested_extras:["t_present","e_make"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["문장의 두 가지 모양을 알았어요","그림에 어울리는 문장을 찾았어요","문장을 끝까지 또박또박 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 가지 문장을 더 읽어 봐요", body:"다음 시간에는 ‘무엇을’이 들어간 더 긴 문장을 만나 정확하게 읽는 연습을 할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"낱말과 문장", content:"“‘토끼’는 낱말, ‘토끼가 뛴다’는 문장! 무엇이 다를까요?” 낱말에서 문장으로 넘어가는 문을 열어요.", fit_slides:["cover","motivate"]},
    {id:"t_sentence", type:"tip", icon:"🧩", title:"문장은 그림으로", content:"문장 모양을 설명으로 가르치기보다 그림과 짝지어 보여 주세요. 1학년에겐 장면이 곧 문법이에요.", fit_slides:["objective","concept"]},
    {id:"q_picture", type:"fun_question", icon:"🖼️", title:"그림 말하기", content:"“그림 속에서 누가, 무엇을 하고 있나요?” 누가→무엇을 하다 순서로 말하게 하면 문장이 자라요.", fit_slides:["motivate"]},
    {id:"r_talk", type:"real_world", icon:"🌍", title:"우리 말이 곧 문장", content:"“밥 먹었어”, “학교 간다”처럼 우리가 매일 하는 말이 모두 문장이에요. 말과 글을 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"손뼉으로 나누기", content:"‘토끼가 ∕ 뛴다’처럼 두 부분에서 손뼉을 치며 읽게 하면 문장의 짜임이 몸에 들어와요.", fit_slides:["concept","card_quiz"]},
    {id:"x_half", type:"misconception", icon:"❓", title:"끝을 흐리며 읽기", content:"문장 끝을 우물우물 흐리는 아이가 있어요. 끝 글자까지 또렷하게 읽어야 문장이 완성됨을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_endread", type:"fun_question", icon:"💡", title:"끝까지 크게", content:"“이번에는 문장 끝 글자만 특별히 크게 읽어 볼까요?” 끝소리 살려 읽기를 놀이처럼 해요.", fit_slides:["card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"그림 ↔ 문장 짝짓기", description:"그림과 어울리는 문장을 짝지어 보세요.", hint:"누가 무엇을 하는지 살펴봐요.", pairs:[{a:{text:"🐸 개구리"},b:{text:"개구리가 뛴다"}},{a:{text:"🐟 물고기"},b:{text:"물고기가 헤엄친다"}},{a:{text:"🐶 강아지"},b:{text:"꼬리를 흔든다"}},{a:{text:"🌸 꽃"},b:{text:"꽃이 식물이다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"만들고 바로 읽기", content:"만든 문장은 그 자리에서 또박또박 읽게 하세요. 만들기와 읽기가 한 묶음이어야 해요.", fit_slides:["question","card_quiz"]},
    {id:"e_make", type:"extension", icon:"⬆", title:"두 모양 다 만들기", content:"익숙해진 아이에겐 같은 동물로 움직임 문장과 설명 문장을 둘 다 만들게 하면 한 단계 나아가요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"두 가지 모양", content:"“문장의 두 가지 모양이 뭐였죠?(어찌하다·무엇이다)” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"긴 문장 예고", content:"“‘토끼가 당근을 먹는다’처럼 더 긴 문장도 읽을 수 있을까요?” 다음 시간을 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l03 소단원1 — 여러 가지 문장을 읽어요 ② ===== */
LESSONS["u6_l03"] = {
  meta: {grade:1, subject:"국어", unit:6, n:3, title:"여러 가지 문장을 읽어요 ②", std:"[2국02-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 무엇을이 들어간 문장 → 한 글자 차이 문장 비교 → 정확히 읽기 카드 → 문장 정확히 읽기 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"여러 가지 문장을 읽어요 ②", subtitle:"6단원 · 3/13차시 · 소리 내어 문장 읽기"}, suggested_extras:["q_open","t_long"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["‘무엇을’이 들어간 문장을 읽어요","한 글자 차이 문장을 비교해요","문장을 정확하게 소리 내어 읽어요"]}, suggested_extras:["t_long"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"문장이 길어졌어요 📏", visual:"🐰", question:"‘토끼가 먹는다’만으로는 궁금해요.<br>무엇을 먹는지 넣으면 어떤 문장이 될까요?"}, suggested_extras:["q_what","r_detail"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"‘무엇을’이 들어간 문장", content:"**‘누가 + 무엇을 + 어찌하다’** 모양 문장은 더 자세하게 알려 줘요. 길어진 문장도 한 글자씩 정확하게 읽어요!", symbol_meanings:[{symbol:"토끼가 당근을 먹는다", meaning:"무엇을(당근을)이 들어갔어요"},{symbol:"아빠가 책을 읽는다", meaning:"무엇을(책을)이 들어갔어요"},{symbol:"누나가 공을 던진다", meaning:"무엇을(공을)이 들어갔어요"},{symbol:"한 글자 조심!", meaning:"‘공을 던진다 ↔ 곰을 던진다’ 큰일 나요"}]}, suggested_extras:["t_concept","x_guess"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"한 글자 차이를 찾아라 🔎", sub:"비슷하지만 한 글자가 다른 문장이에요. 정확하게 읽고 바른 문장을 골라요!", cards:[{clue:"‘공을 던진다’ vs ‘곰을 던진다’<br>운동장에서 바른 문장은?", emoji:"⚽", name:"공을 던진다"},{clue:"‘문을 닫는다’ vs ‘물을 닫는다’<br>바른 문장은?", emoji:"🚪", name:"문을 닫는다"},{clue:"‘밥을 먹는다’ vs ‘발을 먹는다’<br>바른 문장은?", emoji:"🍚", name:"밥을 먹는다"},{clue:"‘손을 씻는다’ vs ‘솔을 씻는다’<br>밥 먹기 전 바른 문장은?", emoji:"🧼", name:"손을 씻는다"}], outro:"한 글자만 틀려도 문장이 이상해져요. 한 글자씩 정확하게 읽는 힘이 생겼어요! 😊"}, suggested_extras:["q_both","g_diff"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"문장 정확히 읽기 발표 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. ‘누가 무엇을 어찌하다’ 문장을 만들어 또박또박 읽어요!", count:24, hint:"“동생이 우유를 마신다” 처럼 세 부분이 다 들어가게 말해요", end_msg:"길어진 문장도 한 글자씩 정확하게! 모두 또박또박 잘 읽었어요 👏"}, suggested_extras:["t_present","e_three"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["‘무엇을’이 들어간 문장을 읽었어요","한 글자 차이로 뜻이 달라짐을 확인했어요","길어진 문장도 정확하게 읽었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"문장의 뜻을 생각하며 읽어요", body:"다음 시간에는 그림을 보고 어떤 문장이 어울리는지, 뜻을 생각하며 읽는 연습을 할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"궁금한 문장", content:"“‘동생이 먹는다’ — 무엇이 궁금한가요?(무엇을 먹는지!)” 빠진 부분을 찾으며 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_long", type:"tip", icon:"🧩", title:"세 부분 끊어 읽기", content:"긴 문장은 ‘누가 ∕ 무엇을 ∕ 어찌하다’ 세 부분으로 끊어 읽게 하면 부담이 줄어요.", fit_slides:["objective","concept"]},
    {id:"q_what", type:"fun_question", icon:"📏", title:"무엇을 넣을까", content:"“토끼가 무엇을 먹을까요? 당근? 풀?” 여러 답을 받으며 ‘무엇을’ 자리를 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_detail", type:"real_world", icon:"🌍", title:"자세히 말하는 힘", content:"“물 줘”보다 “물 한 컵을 줘”가 더 잘 통해요. ‘무엇을’이 들어가면 말이 정확해짐을 이어 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"색깔로 구분", content:"누가·무엇을·어찌하다를 세 가지 색 분필로 쓰면 문장의 세 부분이 눈에 들어와요.", fit_slides:["concept","card_quiz"]},
    {id:"x_guess", type:"misconception", icon:"❓", title:"짐작으로 읽기", content:"앞 글자만 보고 나머지를 짐작해 읽는 아이가 있어요(공→곰). 끝까지 눈으로 확인하며 읽게 해 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_both", type:"fun_question", icon:"💡", title:"틀린 문장도 읽기", content:"“‘곰을 던진다’도 읽어 볼까요? 왜 이상하죠?” 틀린 문장을 읽으며 웃다 보면 정확성이 각인돼요.", fit_slides:["card_quiz"]},
    {id:"g_diff", type:"game", game_kind:"memory_match", icon:"🎮", title:"바른 문장 짝짓기", description:"그림과 바른 문장을 짝지어 보세요.", hint:"한 글자까지 정확하게 살펴봐요.", pairs:[{a:{text:"⚽ 운동장"},b:{text:"공을 던진다"}},{a:{text:"🚪 교실"},b:{text:"문을 닫는다"}},{a:{text:"🍚 식탁"},b:{text:"밥을 먹는다"}},{a:{text:"🧼 세면대"},b:{text:"손을 씻는다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"세 부분 점검", content:"발표 문장에 누가·무엇을·어찌하다가 다 있는지 반 친구들이 함께 손가락 셋을 꼽으며 확인하게 하세요.", fit_slides:["present"]},
    {id:"e_three", type:"extension", icon:"⬆", title:"문장 늘리기 놀이", content:"익숙해진 아이에겐 ‘토끼가 뛴다 → 토끼가 풀밭에서 뛴다’처럼 문장을 점점 늘리게 하면 한 단계 나아가요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"한 글자의 힘", content:"“오늘 한 글자 차이로 달라진 문장 짝을 기억하나요?(공/곰)” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"뜻 생각 예고", content:"“다음엔 그림 보고 꼭 맞는 문장을 찾아요. 눈과 머리가 함께 일해야 해요!” 예고로 기대를 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l04 소단원1 — 문장의 뜻을 생각하며 읽어요 ① ===== */
LESSONS["u6_l04"] = {
  meta: {grade:1, subject:"국어", unit:6, n:4, title:"문장의 뜻을 생각하며 읽어요 ①", std:"[2국02-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 그림과 안 맞는 문장 → 뜻을 생각하며 읽는 법 → 그림에 알맞은 문장 고르기 → 까닭 말하기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"문장의 뜻을 생각하며 읽어요 ①", subtitle:"6단원 · 4/13차시 · 소리 내어 문장 읽기"}, suggested_extras:["q_open","t_mean"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["문장의 뜻을 생각하며 읽어요","그림에 알맞은 문장을 골라요","고른 까닭을 말해 봐요"]}, suggested_extras:["t_mean"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어딘가 이상해요 🤨", visual:"🤨", question:"고양이가 자는 그림인데 ‘고양이가 달린다’라고 쓰여 있어요.<br>그림과 문장이 맞나요?"}, suggested_extras:["q_wrong","r_check"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"뜻을 생각하며 읽기", content:"문장을 읽을 때는 소리만 내는 게 아니라 **머릿속에 장면을 그리며** 읽어요. 그래야 그림과 문장이 맞는지 알 수 있어요!", symbol_meanings:[{symbol:"① 또박또박 읽기", meaning:"한 글자씩 정확하게 소리 내요"},{symbol:"② 장면 그리기", meaning:"머릿속에 그림을 떠올려요"},{symbol:"③ 견주어 보기", meaning:"그림과 문장이 맞는지 확인해요"},{symbol:"고양이가 잔다 ↔ 달린다", meaning:"장면을 그리면 바로 알 수 있어요"}]}, suggested_extras:["t_concept","x_soundonly"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"그림에 알맞은 문장 고르기 🎯", sub:"그림을 보고 어울리는 문장을 골라요. 카드를 누르면 알맞은 문장이 나와요!", cards:[{clue:"😴 고양이가 쿨쿨 자는 그림<br>‘잔다 vs 달린다’ 어느 쪽?", emoji:"🐱", name:"고양이가 잔다"},{clue:"🌧️ 비가 내리는 그림<br>‘비가 온다 vs 눈이 온다’?", emoji:"🌧️", name:"비가 온다"},{clue:"📚 아이가 책을 보는 그림<br>‘책을 읽는다 vs 공을 찬다’?", emoji:"📖", name:"책을 읽는다"},{clue:"🦆 오리가 물에 떠 있는 그림<br>‘오리가 난다 vs 헤엄친다’?", emoji:"🦆", name:"오리가 헤엄친다"}], outro:"장면을 그리며 읽으니 알맞은 문장이 쏙쏙 보여요! 뜻을 생각하며 읽기, 성공! 😊"}, suggested_extras:["q_why","g_fit"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"고른 까닭을 말해요", question:"왜 그 문장을 골랐는지 까닭을 이야기해 봐요.", items:["고양이 그림에서 ‘달린다’는 왜 안 될까요?","그림의 어느 부분을 보고 알았나요?","문장을 읽을 때 머릿속에 무엇이 떠올랐나요?"]}, suggested_extras:["t_present","e_draw"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["뜻을 생각하며 문장을 읽었어요","그림에 알맞은 문장을 골랐어요","고른 까닭을 말로 설명했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"뜻을 생각하며 더 읽어 봐요", body:"다음 시간에는 잘못 읽으면 뜻이 어떻게 달라지는지, 문장을 비교하며 더 깊이 읽어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"이상한 문장 찾기", content:"“‘물고기가 하늘을 걷는다’ — 어디가 이상하죠?” 말이 안 되는 문장으로 웃으며 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_mean", type:"tip", icon:"🧩", title:"읽기 = 소리 + 뜻", content:"이 차시부터 읽기의 무게가 소리에서 뜻으로 옮겨 가요. ‘장면이 그려졌니?’를 자주 물어 주세요.", fit_slides:["objective","concept"]},
    {id:"q_wrong", type:"fun_question", icon:"🤨", title:"틀린 곳 손들기", content:"“그림과 문장이 안 맞으면 손을 번쩍!” 판정 놀이로 만들면 모두가 집중해요.", fit_slides:["motivate"]},
    {id:"r_check", type:"real_world", icon:"🌍", title:"그림책 읽을 때처럼", content:"그림책을 읽을 때도 그림과 글을 견주며 읽잖아요. 평소 책 읽기 습관과 이어 주세요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"눈 감고 그리기", content:"문장을 읽어 준 뒤 눈을 감고 장면을 그리게 해 보세요. ‘뜻을 생각하며 읽기’가 몸으로 익어요.", fit_slides:["concept","card_quiz"]},
    {id:"x_soundonly", type:"misconception", icon:"❓", title:"소리만 내는 읽기", content:"또박또박 소리는 내는데 뜻은 놓치는 아이가 있어요. 읽고 나서 ‘무슨 뜻이야?’를 꼭 물어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_why", type:"fun_question", icon:"💡", title:"증거 찾기", content:"“그림 어디를 보고 알았어요?” 그림 속 증거(감은 눈·빗방울)를 짚게 하면 견주어 읽기가 단단해져요.", fit_slides:["card_quiz"]},
    {id:"g_fit", type:"game", game_kind:"memory_match", icon:"🎮", title:"그림 ↔ 알맞은 문장", description:"그림과 알맞은 문장을 짝지어 보세요.", hint:"장면을 머릿속에 그리며 짝을 찾아요.", pairs:[{a:{text:"🐱 자는 고양이"},b:{text:"고양이가 잔다"}},{a:{text:"🌧️ 내리는 비"},b:{text:"비가 온다"}},{a:{text:"📖 책 보는 아이"},b:{text:"책을 읽는다"}},{a:{text:"🦆 물 위의 오리"},b:{text:"오리가 헤엄친다"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"까닭 문장 틀", content:"“그림에서 ◯◯를 봤기 때문이에요” 틀을 주면 까닭 말하기가 쉬워져요.", fit_slides:["question"]},
    {id:"e_draw", type:"extension", icon:"⬆", title:"문장 보고 그리기", content:"거꾸로 문장을 주고 그림을 그리게 하면, 뜻을 생각하며 읽는 힘이 한 단계 자라요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"세 단계 떠올리기", content:"“읽기 세 단계가 뭐였죠?(또박또박·장면 그리기·견주기)” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"비교 읽기 예고", content:"“‘눈이 온다’와 ‘비가 온다’, 한 낱말 차이로 장면이 확 바뀌죠? 내일 더 깊이 봐요!” 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l05 소단원1 — 문장의 뜻을 생각하며 읽어요 ② ===== */
LESSONS["u6_l05"] = {
  meta: {grade:1, subject:"국어", unit:6, n:5, title:"문장의 뜻을 생각하며 읽어요 ②", std:"[2국02-01]", duration_min:40,
    lesson_format:"교사주도 8슬 — 한 낱말로 바뀌는 장면 → 잘못 읽으면 뜻이 달라짐 → 뜻 비교 카드 → 문장 읽고 장면 말하기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"문장의 뜻을 생각하며 읽어요 ②", subtitle:"6단원 · 5/13차시 · 소리 내어 문장 읽기"}, suggested_extras:["q_open","t_deep"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["잘못 읽으면 뜻이 어떻게 달라지는지 봐요","비슷한 문장의 뜻을 비교해요","문장을 읽고 장면을 말로 설명해요"]}, suggested_extras:["t_deep"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"한 낱말이 바꾼 장면 🎬", visual:"🎬", question:"‘동생이 웃는다’와 ‘동생이 운다’.<br>한 글자 차이인데 장면이 어떻게 다른가요?"}, suggested_extras:["q_scene","r_news"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"잘못 읽으면 뜻이 달라져요", content:"문장을 **대충 읽으면 다른 장면**이 머릿속에 그려져요. 정확하게 읽고, 뜻이 맞는지 스스로 확인하는 습관을 길러요!", symbol_meanings:[{symbol:"웃는다 ↔ 운다", meaning:"기쁜 장면 ↔ 슬픈 장면"},{symbol:"눈이 온다 ↔ 비가 온다", meaning:"하얀 겨울 ↔ 젖은 우산"},{symbol:"문을 연다 ↔ 문을 닫는다", meaning:"반대 장면이 돼요"},{symbol:"스스로 확인", meaning:"읽고 나서 ‘맞게 읽었나?’ 점검해요"}]}, suggested_extras:["t_concept","x_skim"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어떤 장면일까요? 🎬", sub:"문장을 또박또박 읽고 어떤 장면인지 맞혀요. 카드를 누르면 장면이 나와요!", cards:[{clue:"‘아기가 웃는다’<br>어떤 장면이 그려지나요?", emoji:"😊", name:"기쁜 장면"},{clue:"‘눈이 온다’<br>어떤 계절 장면일까요?", emoji:"⛄", name:"하얀 겨울 장면"},{clue:"‘바람이 분다’<br>나뭇잎은 어떻게 될까요?", emoji:"🍃", name:"나뭇잎이 흔들리는 장면"},{clue:"‘아이가 문을 연다’<br>문은 어떻게 되나요?", emoji:"🚪", name:"문이 열리는 장면"}], outro:"문장마다 다른 장면이 그려졌죠? 뜻을 생각하며 읽으면 머릿속에 영화가 켜져요! 😊"}, suggested_extras:["q_movie","g_scene"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"문장 읽고 장면 말하기 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 칠판의 문장을 또박또박 읽고, 떠오른 장면을 말해요!", count:24, hint:"“‘강아지가 달린다’ — 강아지가 꼬리를 흔들며 신나게 뛰는 장면이 떠올라요” 처럼요", end_msg:"읽기와 상상이 함께 자랐어요. 모두 멋진 읽기 감독이에요! 🎬"}, suggested_extras:["t_present","e_swap2"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["잘못 읽으면 뜻이 달라짐을 확인했어요","비슷한 문장의 뜻을 비교했어요","문장을 읽고 장면을 설명했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"문장 부호 친구들을 만나요", body:"다음 시간에는 문장 끝에 콕 찍힌 점(.)과 문장 사이의 쉼표(,)를 만나 이름과 쓰임을 배워요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"장면 퀴즈", content:"“선생님이 문장을 읽으면 그 장면을 몸으로 표현해 봐요!” 몸 표현으로 뜻 읽기를 깨워요.", fit_slides:["cover","motivate"]},
    {id:"t_deep", type:"tip", icon:"🧩", title:"읽기 점검 습관", content:"이 차시의 핵심은 ‘맞게 읽었나?’ 스스로 점검하는 습관이에요. 자기 점검 발문을 자주 던져 주세요.", fit_slides:["objective","concept"]},
    {id:"q_scene", type:"fun_question", icon:"🎬", title:"두 장면 그리기", content:"“‘웃는다’ 장면과 ‘운다’ 장면을 양손으로 표현해 볼까요?” 대비를 몸으로 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_news", type:"real_world", icon:"🌍", title:"알림장 한 글자", content:"알림장의 ‘내일’을 ‘오늘’로 잘못 읽으면 준비물이 엉켜요. 정확한 읽기가 생활을 지켜 줘요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"반대 낱말 짝", content:"웃다↔울다, 열다↔닫다처럼 반대 낱말 짝으로 비교하면 뜻 차이가 가장 또렷하게 보여요.", fit_slides:["concept","card_quiz"]},
    {id:"x_skim", type:"misconception", icon:"❓", title:"대충 훑어 읽기", content:"아는 낱말이 나오면 뒤는 안 보고 넘기는 아이가 있어요. 끝까지 읽고 장면을 확인하게 해 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_movie", type:"fun_question", icon:"💡", title:"머릿속 영화관", content:"“지금 머릿속 화면에 무엇이 보이나요?” 카드마다 장면을 말로 꺼내게 해요.", fit_slides:["card_quiz"]},
    {id:"g_scene", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 장면 짝짓기", description:"문장과 그 문장의 장면을 짝지어 보세요.", hint:"문장을 읽고 떠오르는 모습을 찾아요.", pairs:[{a:{text:"아기가 웃는다"},b:{text:"😊 기쁜 장면"}},{a:{text:"눈이 온다"},b:{text:"⛄ 겨울 장면"}},{a:{text:"바람이 분다"},b:{text:"🍃 잎이 흔들려요"}},{a:{text:"문을 연다"},b:{text:"🚪 문이 열려요"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"읽기 → 장면 두 박자", content:"발표는 ‘문장 읽기 → 장면 말하기’ 두 박자로 진행하세요. 읽기와 이해가 한 무대에 서요.", fit_slides:["present"]},
    {id:"e_swap2", type:"extension", icon:"⬆", title:"낱말 바꿔 새 장면", content:"익숙해진 아이에겐 문장의 낱말 하나를 바꿔 새 장면을 만들게 하면(달린다→구른다) 한 단계 나아가요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"점검 한 마디", content:"“문장을 읽고 나서 무엇을 확인해야 했죠?(맞게 읽었나·뜻이 통하나)” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"부호 예고", content:"칠판 문장 끝에 점(.)을 크게 찍으며 “이 친구 이름이 뭘까요?” 답은 다음 시간으로!", fit_slides:["next_lesson"]}
  ]
};

/* ===== l06 소단원2 — 문장 부호를 알아요 ① 마침표와 쉼표 ===== */
LESSONS["u6_l06"] = {
  meta: {grade:1, subject:"국어", unit:6, n:6, title:"문장 부호를 알아요 ① 마침표와 쉼표", std:"[2국04-03]", duration_min:40,
    lesson_format:"교사주도 8슬 — 문장 속 작은 점 발견 → 마침표·쉼표 이름과 쓰임 → 부호 찾기 카드 → 부호 쓰임 발문"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"문장 부호를 알아요 ① 마침표와 쉼표", subtitle:"6단원 · 6/13차시 · 문장 부호에 알맞게 띄어 읽기"}, suggested_extras:["q_open","t_punct"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["문장 속 부호를 찾아봐요","마침표와 쉼표의 이름을 알아요","마침표와 쉼표의 쓰임을 알아요"]}, suggested_extras:["t_punct"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"문장 끝의 작은 점 🔍", visual:"🔍", question:"‘토끼가 뛴다.’ 문장 끝에 작은 점이 콕!<br>이 점은 이름이 있을까요? 무슨 일을 할까요?"}, suggested_extras:["q_dot","r_book"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"마침표와 쉼표", content:"글에는 글자 말고도 **문장 부호**가 있어요. 부호마다 이름과 하는 일이 달라요!", symbol_meanings:[{symbol:". 마침표", meaning:"설명하는 문장 끝에 써요 — 문장이 끝났다는 표시"},{symbol:", 쉼표", meaning:"부르는 말이나 여러 낱말을 늘어놓을 때 써요"},{symbol:"토끼가 뛴다.", meaning:"끝에 마침표 — 문장 끝!"},{symbol:"사과, 배, 감", meaning:"사이마다 쉼표 — 잠깐 쉬어요"}]}, suggested_extras:["t_concept","x_dotpos"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어떤 부호가 들어갈까요? 🎴", sub:"문장의 빈 곳에 어떤 부호가 들어갈지 맞혀요. 카드를 누르면 답이 나와요!", cards:[{clue:"‘강아지가 잔다◯’<br>설명하는 문장의 끝에는?", emoji:"⏺️", name:". 마침표"},{clue:"‘민지야◯ 이리 와’<br>부르는 말 뒤에는?", emoji:"📣", name:", 쉼표"},{clue:"‘사과◯ 배◯ 감을 샀다.’<br>낱말을 늘어놓을 때는?", emoji:"🍎", name:", 쉼표"},{clue:"‘나는 학교에 간다◯’<br>문장이 끝났어요!", emoji:"🏫", name:". 마침표"}], outro:"마침표는 문장의 끝, 쉼표는 부르는 말과 늘어놓기! 두 친구의 일이 또렷해졌어요 😊"}, suggested_extras:["q_name","g_punct1"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"부호의 쓰임을 말해요", question:"마침표와 쉼표에 대해 함께 이야기해 봐요.", items:["마침표는 어디에 쓰나요? (설명하는 문장 끝)","쉼표는 언제 쓰나요? (부르는 말 뒤·늘어놓을 때)","교과서에서 마침표와 쉼표를 찾아 짚어 봐요"]}, suggested_extras:["t_present","e_hunt"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["문장 부호에 이름이 있음을 알았어요","마침표는 설명하는 문장 끝에 써요","쉼표는 부르는 말 뒤와 늘어놓을 때 써요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"물음표와 느낌표를 만나요", body:"다음 시간에는 물어볼 때 쓰는 물음표(?)와 놀라움을 나타내는 느낌표(!)를 만날 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"점 찾기 놀이", content:"“교과서 한 쪽에서 작은 점(.)을 몇 개나 찾을 수 있나요?” 부호 찾기 놀이로 눈을 열어요.", fit_slides:["cover","motivate"]},
    {id:"t_punct", type:"tip", icon:"🧩", title:"부호도 글의 일부", content:"부호를 글자 옆 장식으로 여기기 쉬워요. 부호도 뜻을 전하는 글의 일부임을 강조해 주세요.", fit_slides:["objective","concept"]},
    {id:"q_dot", type:"fun_question", icon:"🔍", title:"점의 정체", content:"“이 점이 없으면 문장이 어떻게 될까요?” 부호가 없는 글을 상상하며 필요성을 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_book", type:"real_world", icon:"🌍", title:"모든 책 속에", content:"동화책·교과서·간판 어디에나 문장 부호가 있어요. 오늘부터 부호가 눈에 들어오기 시작할 거예요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"크게 써서 보여 주기", content:"마침표·쉼표를 칠판에 주먹만 하게 써 주세요. 작은 부호일수록 크게 보여 줘야 모양이 익어요.", fit_slides:["concept","card_quiz"]},
    {id:"x_dotpos", type:"misconception", icon:"❓", title:"마침표를 아무 데나", content:"문장 중간에 마침표를 찍는 아이가 있어요. 마침표는 문장이 ‘끝났을 때’만 찍는다는 점을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_name", type:"fun_question", icon:"💡", title:"이름 부르기", content:"“이 부호의 이름을 다 같이 불러 볼까요? 마·침·표!” 이름을 소리 내어 불러야 기억에 남아요.", fit_slides:["card_quiz"]},
    {id:"g_punct1", type:"game", game_kind:"memory_match", icon:"🎮", title:"부호 ↔ 쓰임 짝짓기", description:"문장 부호와 그 쓰임을 짝지어 보세요.", hint:"부호가 어디에 쓰이는지 떠올려요.", pairs:[{a:{text:". 마침표"},b:{text:"설명하는 문장 끝"}},{a:{text:", 쉼표"},b:{text:"부르는 말 뒤"}},{a:{text:"잔다."},b:{text:"⏺️ 문장 끝!"}},{a:{text:"사과, 배"},b:{text:"🍎 늘어놓기"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"손가락으로 짚기", content:"교과서에서 부호를 찾을 때는 손가락으로 콕 짚고 이름을 말하게 하세요. 눈·손·입이 함께 배워요.", fit_slides:["question"]},
    {id:"e_hunt", type:"extension", icon:"⬆", title:"부호 사냥꾼", content:"익숙해진 아이에겐 책 한 쪽에서 마침표·쉼표 개수를 세어 오게 하면 부호 감각이 자라요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"두 부호 정리", content:"“마침표와 쉼표, 각각 무슨 일을 했죠?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"새 부호 예고", content:"칠판에 ?와 !를 크게 그리고 “내일 이 친구들의 이름을 알려 줄게요!” 호기심을 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l07 소단원2 — 문장 부호를 알아요 ② 물음표와 느낌표 ===== */
LESSONS["u6_l07"] = {
  meta: {grade:1, subject:"국어", unit:6, n:7, title:"문장 부호를 알아요 ② 물음표와 느낌표", std:"[2국04-03]", duration_min:40,
    lesson_format:"교사주도 8슬 — 궁금할 때와 놀랐을 때 → 물음표·느낌표 쓰임 + 네 부호 종합 → 부호 고르기 카드 → 부호 문장 만들기 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"문장 부호를 알아요 ② 물음표와 느낌표", subtitle:"6단원 · 7/13차시 · 문장 부호에 알맞게 띄어 읽기"}, suggested_extras:["q_open","t_four"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["물음표와 느낌표의 이름과 쓰임을 알아요","네 가지 문장 부호를 모두 정리해요","알맞은 부호를 골라 문장을 읽어요"]}, suggested_extras:["t_four"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"궁금할 때, 놀랐을 때 ❓❗", visual:"❓", question:"‘몇 시야?’라고 물을 때와 ‘와, 무지개다!’ 하고<br>놀랄 때, 문장 끝이 어떻게 다를까요?"}, suggested_extras:["q_two","r_emoji"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"물음표와 느낌표, 그리고 네 친구", content:"**물음표(?)**는 물어보는 문장 끝에, **느낌표(!)**는 놀라움·기쁨 같은 느낌을 나타내는 문장 끝에 써요. 이제 부호 네 친구를 다 만났어요!", symbol_meanings:[{symbol:"? 물음표", meaning:"물어보는 문장 끝 — 지금 몇 시야?"},{symbol:"! 느낌표", meaning:"느낌을 나타내는 문장 끝 — 와, 예쁘다!"},{symbol:". 마침표 / , 쉼표", meaning:"설명하는 문장 끝 / 부르는 말·늘어놓기"},{symbol:"부호 네 친구", meaning:"마침표·쉼표·물음표·느낌표"}]}, suggested_extras:["t_concept","x_mixup"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어떤 부호로 끝날까요? 🎴", sub:"문장을 읽고 끝에 어떤 부호가 어울릴지 맞혀요. 카드를 누르면 답이 나와요!", cards:[{clue:"‘오늘 급식이 뭐야◯’<br>물어보는 문장이에요", emoji:"❓", name:"? 물음표"},{clue:"‘와, 눈이 온다◯’<br>신나서 외치는 문장이에요", emoji:"❗", name:"! 느낌표"},{clue:"‘나는 일곱 살이다◯’<br>설명하는 문장이에요", emoji:"⏺️", name:". 마침표"},{clue:"‘지우야◯ 같이 놀자’<br>친구를 부르는 말 뒤예요", emoji:"📣", name:", 쉼표"}], outro:"부호 네 친구를 모두 가려냈어요! 부호를 보면 문장의 마음이 보여요 😊"}, suggested_extras:["q_voice","g_punct2"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"부호 문장 만들기 발표 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 물음표나 느낌표로 끝나는 문장을 만들어 실감 나게 읽어요!", count:24, hint:"“선생님, 내일 소풍 가요?” “와, 정말 신난다!” 처럼 부호의 느낌을 살려서!", end_msg:"물음표는 궁금하게, 느낌표는 신나게! 부호의 마음을 잘 살려 읽었어요 👏"}, suggested_extras:["t_present","e_act"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["물음표는 물어보는 문장 끝에 써요","느낌표는 느낌을 나타내는 문장 끝에 써요","문장 부호 네 친구를 모두 알게 됐어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"부호에 맞게 띄어 읽어요", body:"다음 시간에는 부호 뒤에서 알맞게 쉬어 읽는 법을 배워요. 쉼표 뒤엔 조금, 마침표 뒤엔 조금 더!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"목소리 맞히기", content:"“선생님 목소리를 듣고 묻는 말인지 놀란 말인지 맞혀 봐요!” 억양으로 부호의 마음을 먼저 느껴요.", fit_slides:["cover","motivate"]},
    {id:"t_four", type:"tip", icon:"🧩", title:"네 부호 한눈에", content:"오늘은 새 부호 둘 + 지난 부호 둘을 묶어 정리하는 날이에요. 네 부호 표를 칠판 구석에 계속 둬 주세요.", fit_slides:["objective","concept"]},
    {id:"q_two", type:"fun_question", icon:"❓", title:"끝소리 비교", content:"“‘몇 시야?’와 ‘무지개다!’를 읽으면 목소리가 어떻게 달라지나요?” 끝 억양의 차이를 느끼게 해요.", fit_slides:["motivate"]},
    {id:"r_emoji", type:"real_world", icon:"🌍", title:"표정 같은 부호", content:"부호는 문장의 표정이에요. 물음표는 갸우뚱한 얼굴, 느낌표는 깜짝 놀란 얼굴과 이어 주면 쉬워요.", fit_slides:["motivate","concept"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"몸으로 부호 만들기", content:"물음표는 몸을 구부정하게, 느낌표는 차렷 자세로! 몸으로 부호 모양을 만들면 기억에 콕 박혀요... 대신 ‘몸 부호 놀이’라고 불러 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"x_mixup", type:"misconception", icon:"❓", title:"물음표·느낌표 헷갈림", content:"묻는 문장에 느낌표를 찍는 아이가 있어요. ‘대답이 필요하면 물음표’라는 기준을 알려 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_voice", type:"fun_question", icon:"💡", title:"부호 살려 읽기", content:"“이 문장을 부호의 마음을 살려 읽어 볼까요?” 카드마다 억양을 살려 다 같이 읽게 해요.", fit_slides:["card_quiz"]},
    {id:"g_punct2", type:"game", game_kind:"memory_match", icon:"🎮", title:"네 부호 총정리 짝짓기", description:"문장 부호와 쓰임을 짝지어 보세요.", hint:"문장의 마음(설명·부름·물음·느낌)을 생각해요.", pairs:[{a:{text:". 마침표"},b:{text:"설명하는 문장 끝"}},{a:{text:", 쉼표"},b:{text:"부르는 말 뒤"}},{a:{text:"? 물음표"},b:{text:"물어보는 문장 끝"}},{a:{text:"! 느낌표"},b:{text:"느낌을 나타낼 때"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"억양이 핵심", content:"부호 문장 발표는 억양이 핵심이에요. 물음표는 끝을 올리고 느낌표는 힘 있게 — 시범을 보여 주세요.", fit_slides:["present"]},
    {id:"e_act", type:"extension", icon:"⬆", title:"부호 바꿔 읽기", content:"같은 문장을 ‘눈이 온다. / 눈이 온다? / 눈이 온다!’로 바꿔 읽게 하면 부호의 힘이 확실히 느껴져요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"네 친구 이름", content:"“문장 부호 네 친구의 이름을 차례로 말해 볼까요?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"쉬어 읽기 예고", content:"“부호를 알았으니 이제 부호 앞에서 어떻게 쉴까요?” 띄어 읽기 차시를 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l08 소단원2 — 부호에 맞게 띄어 읽어요 ===== */
LESSONS["u6_l08"] = {
  meta: {grade:1, subject:"국어", unit:6, n:8, title:"부호에 맞게 띄어 읽어요", std:"[2국02-02] · [2국04-03]", duration_min:40,
    lesson_format:"교사주도 8슬 — 숨이 차는 읽기 → 쉼표 뒤 ∨ 조금, 마침표·물음표·느낌표 뒤 ≫ 조금 더 → 쉬는 곳 찾기 카드 → 띄어 읽기 발문"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"부호에 맞게 띄어 읽어요", subtitle:"6단원 · 8/13차시 · 문장 부호에 알맞게 띄어 읽기"}, suggested_extras:["q_open","t_breath"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["부호 뒤에서 쉬어 읽는 법을 배워요","∨ 표시와 ≫ 표시를 알아봐요","부호에 맞게 띄어 읽는 연습을 해요"]}, suggested_extras:["t_breath"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"숨도 안 쉬고 읽으면? 😮‍💨", visual:"😮‍💨", question:"글을 쉬지 않고 한숨에 다 읽으면 어떻게 될까요?<br>숨도 차고, 듣는 사람도 헷갈려요!"}, suggested_extras:["q_nonstop","r_sign"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"∨ 조금 쉬고, ≫ 조금 더 쉬고", content:"**쉼표(,) 뒤에서는 조금(∨)**, **마침표·물음표·느낌표 뒤에서는 조금 더(≫)** 쉬어 읽어요. 부호가 쉬는 곳을 알려 줘요!", symbol_meanings:[{symbol:", → ∨", meaning:"쉼표 뒤 — 조금 쉬어요"},{symbol:". ? ! → ≫", meaning:"마침표·물음표·느낌표 뒤 — 조금 더 쉬어요"},{symbol:"지우야,∨이리 와.≫", meaning:"쉼표 뒤 조금, 마침표 뒤 조금 더"},{symbol:"왜 쉴까?", meaning:"뜻이 잘 들리고 숨도 고를 수 있어요"}]}, suggested_extras:["t_concept","x_nopause"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어디서 얼마나 쉴까요? 🎴", sub:"문장을 보고 어디서 얼마나 쉬어 읽을지 맞혀요. 카드를 누르고 다 같이 띄어 읽어 봐요!", cards:[{clue:"‘민지야, 학교 가자.’<br>쉼표 뒤에서는 얼마나?", emoji:"🚶", name:"∨ 조금 쉬어요"},{clue:"‘비가 온다. 우산을 쓰자.’<br>마침표 뒤에서는 얼마나?", emoji:"☔", name:"≫ 조금 더 쉬어요"},{clue:"‘몇 시야? 벌써 아홉 시야!’<br>물음표 뒤에서는 얼마나?", emoji:"⏰", name:"≫ 조금 더 쉬어요"},{clue:"‘사과, 배, 감을 샀다.’<br>쉼표마다 어떻게 읽을까요?", emoji:"🍎", name:"∨ 조금씩 쉬며 읽어요"}], outro:"부호가 알려 주는 대로 쉬어 읽으니 문장이 훨씬 잘 들려요! 😊"}, suggested_extras:["q_clap","g_pause"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"띄어 읽기 약속을 말해요", question:"띄어 읽기에 대해 함께 정리해 봐요.", items:["쉼표 뒤에서는 어떻게 읽나요? (조금 쉬어요 ∨)","마침표·물음표·느낌표 뒤에서는요? (조금 더 쉬어요 ≫)","칠판의 문장을 ∨와 ≫에 맞게 다 같이 읽어 봐요"]}, suggested_extras:["t_present","e_mark"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["부호 뒤에서 쉬어 읽는 법을 배웠어요","쉼표 뒤 ∨ 조금, 마침표 뒤 ≫ 조금 더!","부호에 맞게 띄어 읽으니 뜻이 잘 들려요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"그림책을 자연스럽게 읽어요", body:"다음 시간에는 배운 띄어 읽기로 그림책 속 문장을 자연스럽게 읽어 볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"한숨 읽기 시범", content:"“선생님이 쉬지 않고 읽어 볼게요. 어떤가요?” 일부러 숨차게 읽어 띄어 읽기의 필요를 느끼게 해요.", fit_slides:["cover","motivate"]},
    {id:"t_breath", type:"tip", icon:"🧩", title:"숨과 뜻, 두 가지 이유", content:"띄어 읽기는 숨 고르기이자 뜻 전달이에요. ‘숨도 편하고 뜻도 잘 들린다’ 두 가지를 함께 짚어 주세요.", fit_slides:["objective","concept"]},
    {id:"q_nonstop", type:"fun_question", icon:"😮‍💨", title:"끝까지 한숨에?", content:"“숨 안 쉬고 어디까지 읽을 수 있을까요?” 재미로 시험해 보면 쉬어 읽기의 고마움을 알게 돼요.", fit_slides:["motivate"]},
    {id:"r_sign", type:"real_world", icon:"🌍", title:"신호등 같은 부호", content:"부호는 글 속 신호등이에요. 쉼표는 노란불(조금), 마침표는 빨간불(충분히)! 비유로 이어 주세요.", fit_slides:["motivate","concept"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"∨·≫ 직접 표시", content:"칠판 문장에 ∨와 ≫를 색분필로 직접 표시해 주세요. 쉬는 자리가 눈에 보이면 읽기가 달라져요.", fit_slides:["concept","card_quiz"]},
    {id:"x_nopause", type:"misconception", icon:"❓", title:"글자마다 뚝뚝 끊기", content:"띄어 읽기를 배우면 글자마다 끊어 읽는 아이가 있어요. ‘부호 있는 곳에서만’ 쉰다는 점을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_clap", type:"fun_question", icon:"💡", title:"손뼉으로 쉬기", content:"“∨에서는 손뼉 한 번, ≫에서는 두 번!” 손뼉 박자와 함께 읽으면 쉼의 길이가 몸에 익어요.", fit_slides:["card_quiz"]},
    {id:"g_pause", type:"game", game_kind:"memory_match", icon:"🎮", title:"부호 ↔ 쉼 짝짓기", description:"문장 부호와 쉬는 길이를 짝지어 보세요.", hint:"조금 쉬기와 조금 더 쉬기를 구분해요.", pairs:[{a:{text:", 쉼표"},b:{text:"∨ 조금 쉬기"}},{a:{text:". 마침표"},b:{text:"≫ 조금 더 쉬기"}},{a:{text:"? 물음표"},b:{text:"≫ 뒤에서 더 쉬기"}},{a:{text:"! 느낌표"},b:{text:"≫ 느낌 살려 쉬기"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"다 같이 읽기의 힘", content:"띄어 읽기는 반 전체가 한목소리로 읽을 때 가장 빨리 익어요. 합창 읽기를 두세 번 반복해 주세요.", fit_slides:["question","card_quiz"]},
    {id:"e_mark", type:"extension", icon:"⬆", title:"내가 표시하기", content:"익숙해진 아이에겐 새 문장에 ∨·≫를 직접 표시하고 읽게 하면 띄어 읽기가 자기 것이 돼요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"두 가지 쉼", content:"“∨와 ≫, 각각 어떤 부호 뒤에서 쓰죠?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"그림책 예고", content:"“내일은 진짜 그림책 문장으로 띄어 읽기 실력을 보여 줄 시간!” 기대를 모아요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l09 소단원2 — 그림책을 자연스럽게 읽어요 ===== */
LESSONS["u6_l09"] = {
  meta: {grade:1, subject:"국어", unit:6, n:9, title:"그림책을 자연스럽게 읽어요", std:"[2국02-02] · [2국05-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 그림책 표지 짐작 → 자연스럽게 읽는 약속 → 그림책 읽어주기 → 내용·느낌 나누기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"그림책을 자연스럽게 읽어요", subtitle:"6단원 · 9/13차시 · 문장 부호에 알맞게 띄어 읽기"}, suggested_extras:["q_open","t_natural"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["그림책 속 문장을 만나요","부호에 맞게 자연스럽게 띄어 읽어요","읽고 나서 느낌을 나눠요"]}, suggested_extras:["t_natural"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"그림책이 기다려요 📚", visual:"📚", question:"표지와 제목을 보면 어떤 이야기일지 짐작돼요.<br>오늘은 어떤 이야기를 만나게 될까요?"}, suggested_extras:["q_cover","r_library"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"자연스럽게 읽는 약속", content:"그림책을 읽을 때는 **또박또박 정확하게**, **부호에 맞게 쉬어 가며**, **장면을 그리며** 읽어요. 세 가지가 모이면 자연스러운 읽기!", symbol_meanings:[{symbol:"정확하게", meaning:"한 글자도 빠뜨리지 않고 읽어요"},{symbol:"부호에 맞게", meaning:"∨와 ≫를 지키며 쉬어 읽어요"},{symbol:"장면을 그리며", meaning:"머릿속에 그림을 떠올리며 읽어요"},{symbol:"느낌 살려", meaning:"물음표는 궁금하게, 느낌표는 신나게!"}]}, suggested_extras:["t_concept","x_robot"]},
    {id:"s05", stage:"활동", block:"read_aloud", data:{title:"그림책 함께 읽기 📖", author:"동물 친구들이 나오는 그림책", pages:[{img_hint:"이야기가 시작되는 표지와 첫 장면", quote:"표지의 제목과 그림을 함께 살펴보는 장면이에요.\n어떤 이야기일지 아이들과 짐작해 보세요."},{img_hint:"동물 친구가 말을 거는 장면", quote:"등장인물의 말에 물음표가 나와요.\n끝을 올려 궁금한 마음을 살려 읽어 주세요."},{img_hint:"신나는 일이 벌어지는 장면", quote:"느낌표가 있는 문장이 나오는 장면이에요.\n기쁨이 느껴지도록 힘 있게 읽고, 마침표 뒤에서는 충분히 쉬어 주세요."},{img_hint:"이야기가 마무리되는 장면", quote:"이야기의 끝 장면이에요.\n차분한 목소리로 읽고, 어떤 느낌이 드는지 아이들에게 물어보세요."}], copyright:"수업용 진행 안내입니다. 그림책 본문은 학교 수업 목적 이용(저작권법 제25조) 범위에서 교사가 실물 책으로 보여 주세요."}, suggested_extras:["q_while","t_voice"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"내용과 느낌을 나눠요", question:"그림책을 잘 들었나요? 함께 이야기 나눠요.", items:["이야기에 누가 나왔나요?","가장 기억에 남는 장면은 어디였나요?","물음표·느낌표 문장을 들었을 때 느낌이 어땠나요?"]}, suggested_extras:["t_present","e_line"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["그림책 문장을 부호에 맞게 들었어요","장면을 그리며 자연스럽게 읽었어요","읽고 나서 내용과 느낌을 나눴어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"목소리 연극을 준비해요", body:"다음 시간에는 옛이야기 속 인물이 되어 목소리를 만들어요. 우리 반 목소리 연극이 시작돼요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"좋아하는 그림책", content:"“좋아하는 그림책이 있나요?” 책 이야기로 마음을 열고 읽기 차시로 들어가요.", fit_slides:["cover","motivate"]},
    {id:"t_natural", type:"tip", icon:"🧩", title:"배운 것의 총출동", content:"이 차시는 정확히 읽기·부호·띄어 읽기가 모두 모이는 시간이에요. 새것보다 모으기에 집중해 주세요.", fit_slides:["objective","concept"]},
    {id:"q_cover", type:"fun_question", icon:"📚", title:"표지 탐정", content:"“표지에서 무엇이 보이나요? 어떤 이야기일까요?” 짐작하기로 읽기 동기를 끌어올려요.", fit_slides:["motivate"]},
    {id:"r_library", type:"real_world", icon:"🌍", title:"도서관과 잇기", content:"학교 도서관에서 그림책을 골라 오늘처럼 읽어 보게 하면, 읽기 수업이 독서 습관으로 이어져요.", fit_slides:["motivate","question"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"약속 세 손가락", content:"정확하게·부호에 맞게·장면 그리며 — 세 약속을 손가락으로 꼽으며 외우게 하면 읽기 전 루틴이 돼요.", fit_slides:["concept","read_aloud"]},
    {id:"x_robot", type:"misconception", icon:"❓", title:"로봇처럼 읽기", content:"띄어 읽기를 지키느라 딱딱하게 읽는 아이가 있어요. 쉼은 지키되 이야기의 느낌을 살리도록 도와주세요.", fit_slides:["concept","read_aloud"]},
    {id:"q_while", type:"fun_question", icon:"💡", title:"다음 장면 맞히기", content:"장을 넘기기 전 “다음엔 무슨 일이 일어날까요?” 물으면 끝까지 귀 기울여 들어요.", fit_slides:["read_aloud"]},
    {id:"t_voice", type:"tip", icon:"🗣", title:"부호 따라 목소리", content:"읽어 줄 때 물음표·느낌표 문장의 억양을 또렷하게 차이 내 주세요. 아이들이 그대로 배워요.", fit_slides:["read_aloud"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"느낌엔 정답 없음", content:"느낌 나누기에는 정답이 없어요. 어떤 느낌이든 “그렇게 느꼈구나” 하고 받아 주세요.", fit_slides:["question"]},
    {id:"e_line", type:"extension", icon:"⬆", title:"한 문장 따라 읽기", content:"기억에 남는 문장을 골라 부호에 맞게 따라 읽게 하면, 듣기에서 읽기로 한 걸음 나아가요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 읽기 약속", content:"“자연스럽게 읽는 세 약속, 기억나나요?” 물으며 배움을 짚어요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"연극 예고", content:"“호랑이 목소리는 어떨까요? 내일 우리가 직접 만들어 봐요!” 목소리 연극을 예고해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l10 실천 — 목소리 연극을 준비해요 ===== */
LESSONS["u6_l10"] = {
  meta: {grade:1, subject:"국어", unit:6, n:10, title:"목소리 연극을 준비해요", std:"[2국05-02] · [2국02-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 목소리만으로 연극을? → 인물 목소리 만들기 → 모둠별 연습 → 어떤 목소리로 읽을지 나누기"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"목소리 연극을 준비해요", subtitle:"6단원 · 10/13차시 · 배운 내용 실천"}, suggested_extras:["q_open","t_drama"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["목소리 연극이 무엇인지 알아봐요","인물에 어울리는 목소리를 만들어요","모둠별로 맡을 부분을 정해 연습해요"]}, suggested_extras:["t_drama"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"목소리만으로 연극을! 🎭", visual:"🎭", question:"옛이야기 속 호랑이가 말을 해요.<br>호랑이 목소리는 어떤 소리일까요? 한번 내 볼까요?"}, suggested_extras:["q_tiger","r_radio"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"목소리 연극 준비하기", content:"목소리 연극은 **몸짓 대신 목소리**로 인물을 표현해요. 인물의 크기·성격·마음을 생각해 목소리를 만들고, 부호에 맞게 실감 나게 읽어요!", symbol_meanings:[{symbol:"① 이야기 고르기", meaning:"호랑이가 나오는 옛이야기처럼 인물이 또렷한 이야기"},{symbol:"② 인물 목소리 만들기", meaning:"크고 굵게? 작고 떨리게? 인물에 맞게"},{symbol:"③ 역할 나누기", meaning:"모둠에서 맡을 인물과 부분을 정해요"},{symbol:"④ 부호 살려 연습", meaning:"?는 궁금하게, !는 힘차게, ≫에서 쉬며"}]}, suggested_extras:["t_concept","x_loud"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"인물 목소리를 만들어요 🎙️", question:"모둠별로 이야기 속 인물의 목소리를 만들어 연습해요.", items:["커다란 호랑이 목소리는? (크고 굵게, 천천히)","겁먹은 아이 목소리는? (작고 떨리게)","‘정말이야?’를 인물 목소리로 물음표를 살려 읽어 봐요"]}, suggested_extras:["q_how","g_voice"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"우리 모둠의 목소리를 나눠요", question:"모둠에서 만든 목소리를 살짝 보여 주고, 내일 발표 계획을 세워요.", items:["우리 모둠은 어떤 인물을 맡았나요?","그 인물 목소리의 비법은 무엇인가요?","내일 발표에서 가장 살리고 싶은 문장은?"]}, suggested_extras:["t_present","e_props"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["목소리로 인물을 표현하는 법을 배웠어요","인물에 어울리는 목소리를 만들었어요","모둠별로 역할을 나눠 연습했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"목소리 연극을 발표해요", body:"다음 시간은 드디어 공연 날! 연습한 목소리 연극을 친구들 앞에서 발표할 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"목소리 변신 놀이", content:"“아기 목소리, 할아버지 목소리로 ‘안녕’을 말해 볼까요?” 목소리 변신으로 가볍게 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_drama", type:"tip", icon:"🧩", title:"실천 차시의 마음", content:"연극은 평가가 아니라 배운 읽기를 신나게 써먹는 시간이에요. 잘함보다 참여를 칭찬해 주세요.", fit_slides:["objective","question"]},
    {id:"q_tiger", type:"fun_question", icon:"🎭", title:"호랑이 등장!", content:"“호랑이가 ‘떡 하나 주면 안 잡아먹지’ 하고 말한다면 어떤 목소리일까요?” 옛이야기 인물로 상상을 열어요.", fit_slides:["motivate"]},
    {id:"r_radio", type:"real_world", icon:"🌍", title:"라디오 동화처럼", content:"라디오나 오디오 동화는 목소리만으로 이야기를 전해요. 목소리의 힘을 실감 나게 이어 주세요.", fit_slides:["motivate","concept"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"인물 카드 만들기", content:"인물 이름과 성격을 적은 카드를 모둠에 주면, 목소리 만들기가 구체적으로 시작돼요.", fit_slides:["concept","question"]},
    {id:"x_loud", type:"misconception", icon:"❓", title:"크게만 하면 연극?", content:"목소리 연극을 소리 지르기로 여기는 아이가 있어요. 인물에 ‘어울리는’ 목소리가 핵심임을 짚어 주세요.", fit_slides:["concept","question"]},
    {id:"q_how", type:"fun_question", icon:"💡", title:"목소리 비법 나누기", content:"“그 목소리는 어떻게 만들었어요?” 비법(천천히·코맹맹이)을 말로 정리하게 하면 표현이 늘어요.", fit_slides:["question"]},
    {id:"g_voice", type:"game", game_kind:"memory_match", icon:"🎮", title:"인물 ↔ 목소리 짝짓기", description:"인물과 어울리는 목소리를 짝지어 보세요.", hint:"인물의 크기와 마음을 생각해요.", pairs:[{a:{text:"🐯 커다란 호랑이"},b:{text:"크고 굵은 목소리"}},{a:{text:"😨 겁먹은 아이"},b:{text:"작고 떨리는 목소리"}},{a:{text:"👵 다정한 할머니"},b:{text:"따뜻하고 느린 목소리"}},{a:{text:"🐰 빠른 토끼"},b:{text:"가볍고 빠른 목소리"}}], fit_slides:["question"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"계획은 구체적으로", content:"“가장 살리고 싶은 문장”을 정하게 하면 내일 발표에서 모둠마다 또렷한 목표가 생겨요.", fit_slides:["question"]},
    {id:"e_props", type:"extension", icon:"⬆", title:"효과음 한 스푼", content:"익숙해진 모둠에는 손뼉·책상 두드리기 같은 효과음을 한 가지 넣어 보게 하면 연극이 풍성해져요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"우리 모둠 자랑", content:"“우리 모둠 목소리의 자랑거리 하나를 말해 볼까요?” 내일을 향한 기대로 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"공연 전 약속", content:"“내일은 듣는 사람도 중요해요. 어떤 자세로 들어야 할까요?” 관객 약속을 미리 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l11 실천 — 목소리 연극을 발표해요 ===== */
LESSONS["u6_l11"] = {
  meta: {grade:1, subject:"국어", unit:6, n:11, title:"목소리 연극을 발표해요", std:"[2국05-02] · [2국02-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 공연 날 마음 → 무대와 관객 약속 → 모둠 차례 정하기 → 목소리 연극 공연과 박수"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"목소리 연극을 발표해요", subtitle:"6단원 · 11/13차시 · 배운 내용 실천"}, suggested_extras:["q_open","t_stage"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["모둠별로 목소리 연극을 발표해요","부호를 살려 실감 나게 읽어요","친구의 연극을 바른 자세로 감상해요"]}, suggested_extras:["t_stage"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"오늘은 공연 날! 🎬", visual:"🎬", question:"연습한 목소리 연극을 보여 줄 시간이에요.<br>두근두근, 어떤 마음인가요?"}, suggested_extras:["q_feeling","r_theater"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"무대 약속과 관객 약속", content:"멋진 공연에는 **무대 약속**과 **관객 약속**이 모두 필요해요. 발표하는 사람도, 듣는 사람도 주인공이에요!", symbol_meanings:[{symbol:"무대 약속 ①", meaning:"또박또박, 부호를 살려 읽어요"},{symbol:"무대 약속 ②", meaning:"인물 목소리를 끝까지 지켜요"},{symbol:"관객 약속 ①", meaning:"조용히 귀 기울여 들어요"},{symbol:"관객 약속 ②", meaning:"끝나면 따뜻한 박수를 보내요"}]}, suggested_extras:["t_concept","x_laugh"]},
    {id:"s05", stage:"활동", block:"question", data:{title:"공연 준비, 마지막 점검 🎙️", question:"공연 전 마지막으로 점검해요.", items:["우리 모둠의 차례와 맡은 부분을 확인해요","물음표·느낌표 문장을 한 번씩 연습해 봐요","목소리가 작아지지 않게 호흡을 가다듬어요"]}, suggested_extras:["q_check","g_ready"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"목소리 연극 무대 🎤", sub:"버튼을 누르면 발표할 모둠 차례의 친구를 뽑아요. 모둠과 함께 나와 목소리 연극을 발표해요!", count:24, hint:"시작 전에 “저희는 ◯◯ 이야기를 들려 드릴게요” 하고 인사해요", end_msg:"모든 모둠의 목소리 연극이 끝났어요. 배우도 관객도 모두 최고였어요! 🎭👏"}, suggested_extras:["t_present","e_review"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["목소리 연극을 실감 나게 발표했어요","부호를 살려 인물의 마음을 표현했어요","친구의 연극을 바른 자세로 감상했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"배운 내용을 정리해요", body:"다음 시간에는 문장 부호와 띄어 읽기를 차근차근 정리하며 단원을 마무리할 준비를 해요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"목 풀기 체조", content:"“아 에 이 오 우!” 다 같이 입과 목을 풀며 공연 날 분위기를 만들어요.", fit_slides:["cover","motivate"]},
    {id:"t_stage", type:"tip", icon:"🧩", title:"모두가 무대에", content:"한 모둠도 빠짐없이 무대에 서게 해 주세요. 분량이 짧아도 모두가 배우가 되는 게 이 차시의 핵심이에요.", fit_slides:["objective","present"]},
    {id:"q_feeling", type:"fun_question", icon:"🎬", title:"떨림도 멋진 것", content:"“떨리는 친구 손 들어 볼까요? 떨림은 열심히 준비했다는 증거예요!” 긴장을 따뜻하게 풀어 줘요.", fit_slides:["motivate"]},
    {id:"r_theater", type:"real_world", icon:"🌍", title:"진짜 공연장처럼", content:"공연장에서는 막이 오르면 조용해져요. 교실 불을 잠깐 줄이면 진짜 무대 같은 설렘이 생겨요.", fit_slides:["motivate","concept"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"약속은 공연 전에", content:"무대·관객 약속은 공연이 시작되기 전에 다 같이 소리 내어 읽어 두세요. 중간에 끊지 않아도 돼요.", fit_slides:["concept","question"]},
    {id:"x_laugh", type:"misconception", icon:"❓", title:"실수하면 망친 것?", content:"실수하면 연극을 망쳤다고 여기는 아이가 있어요. 실수해도 이어 가는 게 진짜 배우임을 짚어 주세요.", fit_slides:["concept","present"]},
    {id:"q_check", type:"fun_question", icon:"💡", title:"한 문장 리허설", content:"“각 모둠의 첫 문장만 살짝 들어 볼까요?” 짧은 리허설로 긴장을 풀고 시작해요.", fit_slides:["question"]},
    {id:"g_ready", type:"game", game_kind:"memory_match", icon:"🎮", title:"약속 ↔ 주인공 짝짓기", description:"공연 약속과 누가 지키는 약속인지 짝지어 보세요.", hint:"무대 약속과 관객 약속을 나눠 봐요.", pairs:[{a:{text:"부호 살려 읽기"},b:{text:"🎤 무대 약속"}},{a:{text:"인물 목소리 지키기"},b:{text:"🎭 무대 약속"}},{a:{text:"귀 기울여 듣기"},b:{text:"👂 관객 약속"}},{a:{text:"따뜻한 박수"},b:{text:"👏 관객 약속"}}], fit_slides:["question"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"칭찬 한 가지씩", content:"모둠 공연이 끝날 때마다 관객이 좋았던 점 한 가지를 말하게 하세요. 감상이 배움이 돼요.", fit_slides:["present"]},
    {id:"e_review", type:"extension", icon:"⬆", title:"다른 반 초청 공연", content:"잘된 연극은 옆 반이나 부모님께 들려주는 자리로 확장할 수 있어요. 진짜 관객이 생기면 읽기가 살아나요.", fit_slides:["present","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"최고의 순간", content:"“오늘 공연에서 가장 기억에 남는 목소리는?” 서로의 무대를 한 번 더 떠올리며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"정리 예고", content:"“신나게 놀았으니 이제 배운 것을 차곡차곡 정리할 시간이에요.” 마무리 흐름을 안내해요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l12 마무리 — 배운 내용을 정리해요 ===== */
LESSONS["u6_l12"] = {
  meta: {grade:1, subject:"국어", unit:6, n:12, title:"배운 내용을 정리해요", std:"[2국04-03] · [2국02-02]", duration_min:40,
    lesson_format:"교사주도 8슬 — 단원 돌아보기 → 부호·띄어 읽기 정리 → 부호 쓰임 정리 카드 → 띄어 읽기 정리 발문"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"배운 내용을 정리해요", subtitle:"6단원 · 12/13차시 · 단원 마무리"}, suggested_extras:["q_open","t_recap"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이 단원에서 배운 것을 돌아봐요","문장 부호 네 가지를 정리해요","부호에 맞는 띄어 읽기를 정리해요"]}, suggested_extras:["t_recap"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리가 걸어온 길 🗺️", visual:"🗺️", question:"한 글자 차이 문장에서 목소리 연극까지!<br>이 단원에서 배운 것들을 떠올려 볼까요?"}, suggested_extras:["q_back","r_growth"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"두 갈래로 정리해요", content:"이 단원에서 우리는 **문장을 정확하게 읽기**와 **부호에 맞게 띄어 읽기**를 배웠어요. 부호 네 친구와 함께 정리해요!", symbol_meanings:[{symbol:". 마침표 — 설명 끝", meaning:"뒤에서 ≫ 조금 더 쉬어요"},{symbol:", 쉼표 — 부름·늘어놓기", meaning:"뒤에서 ∨ 조금 쉬어요"},{symbol:"? 물음표 — 물어볼 때", meaning:"끝을 올려 읽고 ≫ 쉬어요"},{symbol:"! 느낌표 — 느낌 표현", meaning:"힘 있게 읽고 ≫ 쉬어요"}]}, suggested_extras:["t_concept","x_forget"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{title:"부호 쓰임 총정리 🎴", sub:"문장을 보고 알맞은 부호를 골라요. 이 단원 마지막 부호 점검이에요!", cards:[{clue:"‘무지개가 떴다◯’<br>설명하는 문장 끝에는?", emoji:"🌈", name:". 마침표"},{clue:"‘준비물이 뭐야◯’<br>물어보는 문장 끝에는?", emoji:"🎒", name:"? 물음표"},{clue:"‘와, 정말 맛있다◯’<br>느낌을 나타내는 문장 끝에는?", emoji:"😋", name:"! 느낌표"},{clue:"‘토끼◯ 거북이가 달린다’<br>낱말을 늘어놓을 때는?", emoji:"🐢", name:", 쉼표"}], outro:"부호 네 친구의 쓰임을 완벽하게 정리했어요! 이제 어떤 문장도 자신 있게 읽을 수 있어요 😊"}, suggested_extras:["q_mixed","g_recap"]},
    {id:"s06", stage:"발표", block:"question", data:{title:"띄어 읽기를 정리해요", question:"부호에 맞는 띄어 읽기를 마지막으로 정리해 봐요.", items:["쉼표 뒤에서는? (∨ 조금 쉬어요)","마침표·물음표·느낌표 뒤에서는? (≫ 조금 더 쉬어요)","‘지우야, 비가 온다! 우산 있어?’를 띄어 읽어 봐요"]}, suggested_extras:["t_present","e_full"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["문장 부호 네 가지의 쓰임을 정리했어요","∨와 ≫ 띄어 읽기를 정리했어요","단원의 두 갈래를 모두 돌아봤어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 스스로 돌아봐요", body:"다음 시간은 이 단원의 마지막! 부호 이름 퀴즈를 풀고 내가 얼마나 자랐는지 스스로 돌아볼 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"첫 시간 떠올리기", content:"“첫 시간의 ‘밤 나무와 밤나무’, 기억나요?” 도입 장면으로 단원 돌아보기를 시작해요.", fit_slides:["cover","motivate"]},
    {id:"t_recap", type:"tip", icon:"🧩", title:"정리는 아이 입으로", content:"교사가 요약하기보다 “무엇을 배웠죠?” 묻고 아이 입으로 말하게 하세요. 스스로 정리해야 남아요.", fit_slides:["objective","concept"]},
    {id:"q_back", type:"fun_question", icon:"🗺️", title:"기억에 남는 활동", content:"“이 단원에서 가장 재미있던 활동은?(목소리 연극·부호 찾기)” 배움의 길을 함께 되짚어요.", fit_slides:["motivate"]},
    {id:"r_growth", type:"real_world", icon:"🌍", title:"읽기의 변화", content:"단원 전과 후의 읽기를 비교해 보여 주세요. 부호를 알고 읽는 지금이 얼마나 자란 건지 느껴져요.", fit_slides:["motivate","summary"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"부호 표 완성하기", content:"부호·이름·쓰임·쉼 길이 네 칸 표를 아이들과 함께 채우면 단원 전체가 한 장에 정리돼요.", fit_slides:["concept","card_quiz"]},
    {id:"x_forget", type:"misconception", icon:"❓", title:"물음표·느낌표 자리", content:"정리 단계에서도 물음표와 느낌표를 바꿔 쓰는 경우가 있어요. ‘대답이 필요하면 물음표’를 한 번 더 짚어 주세요.", fit_slides:["concept","card_quiz"]},
    {id:"q_mixed", type:"fun_question", icon:"💡", title:"거꾸로 문제", content:"“이번엔 거꾸로! 느낌표가 들어가는 문장을 만들어 볼까요?” 부호에서 문장으로 방향을 바꿔 확인해요.", fit_slides:["card_quiz"]},
    {id:"g_recap", type:"game", game_kind:"memory_match", icon:"🎮", title:"부호 ↔ 문장 짝짓기", description:"문장 부호와 어울리는 문장을 짝지어 보세요.", hint:"문장의 마음을 생각하며 짝을 찾아요.", pairs:[{a:{text:". 마침표"},b:{text:"무지개가 떴다"}},{a:{text:"? 물음표"},b:{text:"준비물이 뭐야"}},{a:{text:"! 느낌표"},b:{text:"와, 맛있다"}},{a:{text:", 쉼표"},b:{text:"토끼, 거북"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"긴 문장 합창 읽기", content:"세 부호가 다 들어간 문장은 반 전체가 합창으로 띄어 읽게 하세요. 단원의 모든 배움이 한 문장에 모여요.", fit_slides:["question"]},
    {id:"e_full", type:"extension", icon:"⬆", title:"부호 넣어 쓰기", content:"익숙해진 아이에겐 부호 없는 짧은 글에 부호를 직접 넣게 하면 쓰임 이해가 완성돼요.", fit_slides:["question","next_lesson"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"두 갈래 한 줄 정리", content:"“이 단원의 두 갈래를 한 줄로 말해 볼까요?(정확히 읽기·띄어 읽기)” 정리를 아이 입으로 마쳐요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"마지막 시간 예고", content:"“다음 시간엔 부호 이름 초성 퀴즈가 기다려요!” 마지막 차시의 기대를 심어요.", fit_slides:["next_lesson"]}
  ]
};

/* ===== l13 마무리 — 기초를 다지고 스스로 돌아봐요 ===== */
LESSONS["u6_l13"] = {
  meta: {grade:1, subject:"국어", unit:6, n:13, title:"기초를 다지고 스스로 돌아봐요", std:"[2국02-01] · [2국04-03]", duration_min:40,
    lesson_format:"교사주도 8슬 — 마지막 시간 → 부호 쓰기와 돌아보기 안내 → 부호 이름 초성 퀴즈 → 비교 없는 자기 돌아보기 발표"},
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"기초를 다지고 스스로 돌아봐요", subtitle:"6단원 · 13/13차시 · 단원 마무리"}, suggested_extras:["q_open","t_base"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["문장 부호를 바르게 따라 써요","부호 이름으로 마지막 퀴즈를 풀어요","이 단원에서 자란 나를 스스로 돌아봐요"]}, suggested_extras:["t_base"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"단원의 마지막 시간이에요 🎁", visual:"🎁", question:"문장 읽기도, 부호도, 연극도 해냈어요.<br>이 단원을 시작할 때보다 무엇이 늘었을까요?"}, suggested_extras:["q_grow","r_write"]},
    {id:"s04", stage:"만나기", block:"concept", data:{title:"바르게 쓰고, 나를 돌아봐요", content:"문장 부호를 **자리에 맞게 바르게 쓰고**, 이 단원에서 내가 얼마나 자랐는지 **나 스스로** 돌아봐요!", symbol_meanings:[{symbol:"마침표·쉼표 쓰기", meaning:"칸의 아래쪽에 작게 써요"},{symbol:"물음표·느낌표 쓰기", meaning:"칸 가운데에 또렷하게 써요"},{symbol:"낱말 따라 읽기", meaning:"많다·넓다·짧다도 또박또박"},{symbol:"나 돌아보기", meaning:"친구와 비교하지 않고 나의 자람을 봐요"}]}, suggested_extras:["t_concept","x_rush"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{title:"부호 이름 초성 퀴즈 🏆", sub:"이 단원의 주인공, 문장 부호의 이름을 초성으로 맞혀요. [정답 보기]로 확인해요!", items:[{chosung:"ㅁ ㅊ ㅍ", answer:"마침표", emoji:"⏺️", hint:"설명하는 문장 끝의 작은 점!"},{chosung:"ㅅ ㅍ", answer:"쉼표", emoji:"📣", hint:"부르는 말 뒤에서 조금 쉬어요!"},{chosung:"ㅁ ㅇ ㅍ", answer:"물음표", emoji:"❓", hint:"물어보는 문장 끝의 구부러진 친구!"},{chosung:"ㄴ ㄲ ㅍ", answer:"느낌표", emoji:"❗", hint:"놀라움과 기쁨을 나타내요!"}]}, suggested_extras:["q_bonus","g_final"]},
    {id:"s06", stage:"발표", block:"present", data:{title:"나를 돌아보며 발표해요 🎤", sub:"버튼을 누르면 발표할 친구를 뽑아요. 이 단원에서 잘하게 된 것 한 가지를 말해요. 친구와 비교하지 않아도 돼요!", count:24, hint:"“물음표 문장을 끝을 올려 읽게 됐어요” 처럼 말해 봐요", end_msg:"모두 자기만의 속도로 자랐어요. 6단원을 끝까지 해낸 우리 반, 정말 멋져요! 🎉"}, suggested_extras:["t_present","e_self"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"6단원에서 배운 것", points:["문장을 또박또박 정확하게 읽게 됐어요","문장 부호 네 가지의 쓰임을 알게 됐어요","부호에 맞게 띄어 읽으며 실감 나게 읽게 됐어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 단원 예고", preview:"7단원 — 알맞은 낱말을 찾아요", body:"다음 단원에서는 문장에 꼭 맞는 낱말을 찾아 넣으며, 내 생각을 문장으로 말하는 법을 배울 거예요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"마지막 시간의 마음", content:"“오늘은 6단원 마지막 시간! 처음보다 잘하게 된 게 있나요?” 돌아보기의 문을 열어요.", fit_slides:["cover","motivate"]},
    {id:"t_base", type:"tip", icon:"🧩", title:"편안한 마무리", content:"기초 다지기는 시험이 아니라 배운 것을 단단히 하는 시간이에요. 편안한 분위기로 진행해 주세요.", fit_slides:["objective","chosung_quiz"]},
    {id:"q_grow", type:"fun_question", icon:"🎁", title:"자란 점 찾기", content:"“단원을 시작할 때의 나와 지금의 나, 무엇이 달라졌나요?” 자람을 스스로 발견하게 해요.", fit_slides:["motivate"]},
    {id:"r_write", type:"real_world", icon:"🌍", title:"부호와 함께 쓰는 글", content:"이제 일기나 쪽지를 쓸 때 부호를 넣을 수 있어요. 배운 부호가 진짜 글쓰기로 이어진다고 알려 주세요.", fit_slides:["motivate","present"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"부호 자리 칸 연습", content:"부호 쓰기는 네모 칸 안 어느 자리에 쓰는지가 핵심이에요. 칸을 그려 자리를 짚으며 따라 쓰게 하세요.", fit_slides:["concept","chosung_quiz"]},
    {id:"x_rush", type:"misconception", icon:"❓", title:"빨리 쓰면 끝?", content:"부호를 대충 흘려 쓰는 아이가 있어요. 작아도 자리에 맞게 또렷이 쓰는 게 먼저임을 짚어 주세요.", fit_slides:["concept","chosung_quiz"]},
    {id:"q_bonus", type:"fun_question", icon:"💡", title:"보너스 낱말 읽기", content:"“많다·넓다·짧다·여덟 — 이 낱말들도 또박또박 읽어 볼까요?” 기초 낱말 읽기를 보너스로 짚어요.", fit_slides:["chosung_quiz"]},
    {id:"g_final", type:"game", game_kind:"memory_match", icon:"🎮", title:"단원 총정리 짝짓기", description:"이 단원에서 배운 것끼리 짝지어 보세요.", hint:"부호의 모양과 이름, 쉼을 모두 떠올려요.", pairs:[{a:{text:"⏺️ ."},b:{text:"마침표"}},{a:{text:"❓ ?"},b:{text:"물음표"}},{a:{text:"❗ !"},b:{text:"느낌표"}},{a:{text:", 뒤에서"},b:{text:"∨ 조금 쉬기"}}], fit_slides:["chosung_quiz"]},
    {id:"t_present", type:"tip", icon:"🗣", title:"비교 없는 돌아보기", content:"돌아보기 발표는 친구와 비교하지 않게 해 주세요. ‘처음의 나’와 ‘지금의 나’를 비교하는 게 핵심이에요.", fit_slides:["present"]},
    {id:"e_self", type:"extension", icon:"⬆", title:"세 가지 스스로 점검", content:"문장을 정확히 읽는다 / 부호의 쓰임을 안다 / 부호에 맞게 띄어 읽는다 — 세 가지를 스스로 점검하게 해요.", fit_slides:["present","summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"단원의 한 장면", content:"“이 단원에서 가장 기억에 남는 한 장면은?(목소리 연극!)” 배움의 순간을 떠올리며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"7단원 잇기", content:"“‘토끼가 ◯◯를 먹는다’ — 빈칸에 꼭 맞는 낱말은? 다음 단원에서 낱말 찾기 명수가 돼요!” 예고해요.", fit_slides:["next_lesson"]}
  ]
};
