/* ============================================================================
   2학년 1학기 국어 3단원 「겪은 일을 나타내요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u3_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 72~111 / 15차시.
   - 단원 목표: 겪은 일을 문장·글로 표현하기. 역량 자기 성찰·계발(반성과 점검).
   - 성취기준 [2국03-02](생각·느낌 문장)·[2국03-04](겪은 일 글로 쓰기)·[2국04-03](문장·부호).
   ★ 저작권: 지도서 제재(「식물은 어떻게 자랄까?」·누리호 사진·소율이 일기·요리 일기·「이게 뭐예요?」) 전부 미게재.
      꾸며 주는 말 유형·식물 상식·일기 형식·예시 일기는 보편 교육 내용 자체 구성(보편 소재: 줄넘기·도서관·텃밭).
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 꾸며 주는 말의 힘 ---------------- */
  window.LESSONS["u3_l01"] = {
    meta: {grade:2, subject:"국어", unit:3, n:1, title:"단원 도입 — 겪은 일을 나타내요", std:"[2국03-02] · [2국04-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 같은 일 다른 표현 → 꾸며 주는 말이란 → 더 생생한 문장 고르기 → 꾸며 말 붙여 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겪은 일을 나타내요", subtitle:"3단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["같은 일도 다르게 표현됨을 느껴요","꾸며 주는 말이 무엇인지 알아봐요","더 생생한 문장을 찾아봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"같은 꽃, 다른 말 🌸", visual:"🌸", question:"\"꽃이 피었다\"와 \"예쁜 꽃이 활짝 피었다\"<br>어느 쪽이 더 생생하게 느껴지나요?"}, suggested_extras:["q_feel","r_life"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"꾸며 주는 말", content:"**꾸며 주는 말**은 다른 말을 더 **자세하고 생생하게** 해 주는 말이에요. \"꽃\"에 \"**예쁜**\", \"피었다\"에 \"**활짝**\"을 더하면 그림이 눈에 보이는 듯해요!", symbol_meanings:[{symbol:"예쁜 꽃", meaning:"'예쁜'이 꽃을 꾸며요"},{symbol:"활짝 피었다", meaning:"'활짝'이 피었다를 꾸며요"},{symbol:"넓은 들판", meaning:"'넓은'이 들판을 꾸며요"},{symbol:"힘차게 달린다", meaning:"'힘차게'가 달린다를 꾸며요"}]}, suggested_extras:["t_concept","x_many"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"더 생생한 문장은? 🤔", sub:"꾸며 주는 말을 넣어 더 생생한 문장을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"강아지가 뛴다 / 작은 강아지가 깡충깡충 뛴다", emoji:"🐶", name:"\"작은 강아지가 깡충깡충 뛴다\""},{clue:"바람이 분다 / 시원한 바람이 솔솔 분다", emoji:"🍃", name:"\"시원한 바람이 솔솔 분다\""},{clue:"비가 온다 / 굵은 비가 주룩주룩 온다", emoji:"🌧️", name:"\"굵은 비가 주룩주룩 온다\""}], outro:"꾸며 주는 말을 넣으니 그림이 눈에 보이는 듯해요. 우리도 넣어 볼까요? 😊"}, suggested_extras:["q_pick","g_word"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"꾸며 주는 말을 붙여 말해요", question:"본 것에 꾸며 주는 말을 붙여 말해 볼까요?", items:["교실에서 본 것에 꾸며 주는 말을 붙인다면?","'하늘'에 어떤 꾸며 주는 말을 붙일까요?","꾸며 주는 말을 넣으니 어떤가요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["같은 일도 다르게 표현됨을 느꼈어요","꾸며 주는 말이 무엇인지 알았어요","더 생생한 문장을 찾았어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"꾸며 주는 말을 넣어 문장을 써요", body:"다음 시간에는 그림에 어울리는 꾸며 주는 말을 넣어 문장을 직접 써 볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"생생한 말", content:"\"무엇을 보면 '예쁘다·멋지다'는 말이 떠오르나요?\" 꾸며 주는 말을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '꾸며 주는 말로 자세히 표현 + 겪은 일 일기 쓰기'예요. 도입에선 표현의 재미를 느끼게 하세요.", fit_slides:["objective","cover"]},
      {id:"q_feel", type:"fun_question", icon:"🌸", title:"무엇이 다를까", content:"\"두 문장을 들으면 느낌이 어떻게 다른가요?\" 표현의 힘을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_life", type:"real_world", icon:"🌍", title:"생활 속 표현", content:"맛·날씨·기분을 더 자세히 말한 경험과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"무엇을 꾸미나", content:"꾸며 주는 말이 어떤 말을 꾸미는지(대상) 함께 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_many", type:"misconception", icon:"❓", title:"많다고 좋은 건 아니에요", content:"꾸며 주는 말을 너무 많이 넣으면 어색해요. 어울리게 넣게 안내하세요.", fit_slides:["concept"]},
      {id:"q_pick", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"여기에 또 어떤 꾸며 주는 말을 넣을 수 있을까요?\" 표현을 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_word", type:"game", game_kind:"memory_match", icon:"🎮", title:"대상 ↔ 꾸며 주는 말 짝짓기", description:"대상과 어울리는 꾸며 주는 말을 짝지어 보세요.", hint:"무엇을 꾸미는지 생각해요.", pairs:[{a:{text:"🐶 강아지"},b:{text:"작은"}},{a:{text:"🍃 바람"},b:{text:"시원한"}},{a:{text:"🏃 달린다"},b:{text:"힘차게"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"가볍게", content:"본 것에 꾸며 주는 말을 자유롭게 붙여 말하게 해 표현을 즐기게 하세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"두 개 붙이기", content:"\"꾸며 주는 말을 두 개 붙이면 어떨까요?\" 표현을 확장해요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"꾸며 주는 말은 무엇을 해 주죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"문장 쓰기 예고", content:"\"다음엔 꾸며 주는 말로 문장을 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 일기란 무엇일까 (준비) ---------------- */
  window.LESSONS["u3_l02"] = {
    meta: {grade:2, subject:"국어", unit:3, n:2, title:"일기가 무엇인지 알아봐요", std:"[2국03-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 일기란 → 일기에 담는 것 → 일기 요소 잇기 → 오늘 겪은 일 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"일기가 무엇인지 알아봐요", subtitle:"3단원 · 2/15차시 · 준비"}, suggested_extras:["q_diary","t_diary"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["일기가 무엇인지 알아봐요","일기에 담는 내용을 알아봐요","오늘 겪은 일을 떠올려요"]}, suggested_extras:["t_diary"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"오늘 하루를 남겨요 📔", visual:"📔", question:"오늘 하루 있었던 일 중 기억에 남는 일이 있나요?<br>그 일을 글로 남기면 무엇이 좋을까요?"}, suggested_extras:["q_day","r_diary"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"일기에 담는 것", content:"일기는 **하루 동안 겪은 일**과 그때 든 **생각이나 느낌**을 적은 글이에요. **날짜·날씨·제목·겪은 일·생각이나 느낌**의 차례로 써요. 일기를 쓰면 하루를 **돌아볼 수** 있어요!", symbol_meanings:[{symbol:"날짜·날씨", meaning:"언제, 어떤 날씨였나"},{symbol:"제목", meaning:"일기 내용을 한마디로"},{symbol:"겪은 일", meaning:"무슨 일이 있었나"},{symbol:"생각이나 느낌", meaning:"그때 마음은 어땠나"}]}, suggested_extras:["t_form","x_event"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"일기 요소를 맞혀 봐요 📔", sub:"일기에 들어가는 내용을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"2024년 5월 3일 금요일, 맑음\"은?", emoji:"📅", name:"날짜와 날씨"},{clue:"\"신나는 줄넘기\"는?", emoji:"✏️", name:"제목"},{clue:"\"정말 뿌듯하고 기뻤다\"는?", emoji:"💗", name:"생각이나 느낌"}], outro:"일기에는 이런 내용이 차례로 들어가요. 오늘 일기로 쓸 일을 떠올려 볼까요? 😊"}, suggested_extras:["q_part","g_diary"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"오늘 겪은 일을 떠올려요", question:"오늘 어떤 일이 있었나요?", items:["오늘 가장 기억에 남는 일은?","그때 어떤 마음이 들었나요?","왜 그 일이 기억에 남나요?"]}, suggested_extras:["t_present2","e_event2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["일기가 무엇인지 알았어요","일기에 담는 내용을 알았어요","오늘 겪은 일을 떠올렸어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"꾸며 주는 말로 문장을 써요", body:"다음 시간에는 그림에 어울리는 꾸며 주는 말을 넣어 문장을 써 볼 거예요!"}, suggested_extras:["e_write2"]}
    ],
    extras: [
      {id:"q_diary", type:"fun_question", icon:"💡", title:"일기 경험", content:"\"일기나 그림일기를 써 본 적 있나요?\" 일기를 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_diary", type:"tip", icon:"🧩", title:"하루 돌아보기", content:"일기는 하루를 돌아보는 글임을 짚어 단원 역량(반성·점검)과 잇게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_day", type:"fun_question", icon:"📔", title:"기억에 남는 일", content:"\"오늘 가장 기억에 남는 일은 무엇인가요?\" 글감을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_diary", type:"real_world", icon:"🌍", title:"기록의 즐거움", content:"사진·그림으로 하루를 남긴 경험과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_form", type:"tip", icon:"🧩", title:"일기 차례", content:"날짜·날씨·제목·겪은 일·생각이나 느낌의 차례를 익히게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_event", type:"misconception", icon:"❓", title:"느낌도 함께", content:"겪은 일만 쓰지 말고 그때의 생각·느낌도 함께 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"q_part", type:"fun_question", icon:"💡", title:"어떤 요소?", content:"\"이 부분은 일기의 어디에 들어갈까요?\" 요소를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_diary", type:"game", game_kind:"memory_match", icon:"🎮", title:"내용 ↔ 일기 요소 짝짓기", description:"내용과 일기 요소를 짝지어 보세요.", hint:"일기 차례를 떠올려요.", pairs:[{a:{text:"📅 5월 3일 맑음"},b:{text:"날짜·날씨"}},{a:{text:"✏️ 신나는 줄넘기"},b:{text:"제목"}},{a:{text:"💗 뿌듯했다"},b:{text:"생각·느낌"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"한 가지씩", content:"오늘 겪은 일을 한 가지씩 떠올려 말하게 해 글감을 준비하게 하세요.", fit_slides:["question"]},
      {id:"e_event2", type:"extension", icon:"⬆", title:"마음 더하기", content:"\"그때 마음을 한 낱말로 말한다면?\" 느낌을 떠올려요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"일기에는 무엇을 담죠?\" 일기 요소를 짚어요.", fit_slides:["summary"]},
      {id:"e_write2", type:"extension", icon:"⬆", title:"문장 쓰기 예고", content:"\"다음엔 꾸며 주는 말로 문장을 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 꾸며 주는 말 넣어 문장 쓰기 ① ---------------- */
  window.LESSONS["u3_l03"] = {
    meta: {grade:2, subject:"국어", unit:3, n:3, title:"꾸며 주는 말을 넣어 문장을 써요 ①", std:"[2국04-03] · [2국03-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 그림에 어울리는 말 → 꾸미는 대상 찾기 → 대상↔꾸며 주는 말 잇기 → 문장 만들어 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"꾸며 주는 말을 넣어 문장을 써요", subtitle:"3단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_pic3","t_match3"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["그림에 어울리는 꾸며 주는 말을 골라요","꾸며 주는 말이 무엇을 꾸미는지 알아봐요","꾸며 주는 말을 넣어 문장을 만들어요"]}, suggested_extras:["t_match3"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"그림을 말로 표현해요 🖼️", visual:"🏞️", question:"넓은 들판에 노란 꽃이 활짝 피어 있어요.<br>이 그림을 꾸며 주는 말로 어떻게 표현할까요?"}, suggested_extras:["q_pic3b","r_pic3"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"무엇을 꾸미는지 살펴요", content:"꾸며 주는 말은 **꾸미는 대상** 바로 앞에 와요. \"**노란** 꽃\"에서 '노란'은 꽃을, \"**활짝** 피었다\"에서 '활짝'은 피었다를 꾸며요. 어울리는 말을 골라야 자연스러워요!", symbol_meanings:[{symbol:"노란 꽃", meaning:"'노란'→꽃을 꾸밈"},{symbol:"넓은 들판", meaning:"'넓은'→들판을 꾸밈"},{symbol:"활짝 피었다", meaning:"'활짝'→피었다를 꾸밈"},{symbol:"어울리게", meaning:"대상에 맞는 말 고르기"}]}, suggested_extras:["t_match3b","x_wrong3"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어울리는 꾸며 주는 말은? 🖼️", sub:"대상에 어울리는 꾸며 주는 말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"하늘을 꾸민다면?", emoji:"☁️", name:"\"파란 하늘\""},{clue:"강물이 흐르는 모습은?", emoji:"🌊", name:"\"맑은 물이 졸졸 흐른다\""},{clue:"새가 나는 모습은?", emoji:"🐦", name:"\"작은 새가 훨훨 난다\""}], outro:"대상에 어울리는 꾸며 주는 말을 고르니 그림이 살아나요. 문장을 만들어 볼까요? 😊"}, suggested_extras:["q_pick3","g_match3"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"문장을 만들어 말해요", question:"꾸며 주는 말을 넣어 문장을 만들어 볼까요?", items:["어떤 그림이나 대상을 골랐나요?","어떤 꾸며 주는 말을 넣었나요?","완성한 문장을 말해 볼까요?"]}, suggested_extras:["t_present3","e_make3"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["그림에 어울리는 꾸며 주는 말을 골랐어요","꾸미는 대상을 찾았어요","꾸며 주는 말을 넣어 문장을 만들었어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"꾸며 주는 말로 더 써요", body:"다음 시간에는 한 문장에 꾸며 주는 말을 여러 개 넣어 더 자세하게 써 볼 거예요!"}, suggested_extras:["e_write3"]}
    ],
    extras: [
      {id:"q_pic3", type:"fun_question", icon:"💡", title:"그림 보기", content:"\"이 그림에서 무엇이 보이나요?\" 표현할 대상을 찾게 해요.", fit_slides:["cover","motivate"]},
      {id:"t_match3", type:"tip", icon:"🧩", title:"대상 찾기", content:"꾸며 주는 말이 무엇을 꾸미는지(대상) 먼저 찾게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_pic3b", type:"fun_question", icon:"🏞️", title:"어떻게 표현?", content:"\"이 그림을 어떻게 말로 표현할까요?\" 표현을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_pic3", type:"real_world", icon:"🌍", title:"사진 설명", content:"사진을 친구에게 설명한 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_match3b", type:"tip", icon:"🧩", title:"바로 앞에", content:"꾸며 주는 말은 꾸미는 대상 바로 앞에 옴을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_wrong3", type:"misconception", icon:"❓", title:"어울리게", content:"대상과 어울리지 않는 말(예: '맛있는 하늘')은 어색해요. 어울리게 고르게 하세요.", fit_slides:["concept"]},
      {id:"q_pick3", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"여기에 또 어떤 꾸며 주는 말이 어울릴까요?\" 표현을 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_match3", type:"game", game_kind:"memory_match", icon:"🎮", title:"대상 ↔ 꾸며 주는 말 짝짓기", description:"대상과 어울리는 꾸며 주는 말을 짝지어 보세요.", hint:"대상에 맞는 말을 골라요.", pairs:[{a:{text:"☁️ 하늘"},b:{text:"파란"}},{a:{text:"🌊 물"},b:{text:"맑은·졸졸"}},{a:{text:"🐦 새"},b:{text:"작은·훨훨"}}], fit_slides:["card_quiz"]},
      {id:"t_present3", type:"tip", icon:"🗣", title:"자유롭게", content:"문법을 따지기보다 자유롭게 꾸며 문장을 만들게 하세요.", fit_slides:["question"]},
      {id:"e_make3", type:"extension", icon:"⬆", title:"두 개 넣기", content:"\"꾸며 주는 말을 두 개 넣어 볼까요?\" 표현을 확장해요.", fit_slides:["question"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"꾸며 주는 말은 어디에 오죠?\" 대상 앞을 짚어요.", fit_slides:["summary"]},
      {id:"e_write3", type:"extension", icon:"⬆", title:"이어 쓰기 예고", content:"\"다음엔 꾸며 주는 말을 여러 개 넣어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 꾸며 주는 말 넣어 문장 쓰기 ② ---------------- */
  window.LESSONS["u3_l04"] = {
    meta: {grade:2, subject:"국어", unit:3, n:4, title:"꾸며 주는 말을 넣어 문장을 써요 ②", std:"[2국04-03] · [2국03-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 한 문장에 여러 개 → 더 자세하게 → 꾸며 주는 말 모으기 → 사진 설명 문장 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"꾸며 주는 말을 넣어 문장을 써요", subtitle:"3단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_more4"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["한 문장에 꾸며 주는 말을 여러 개 넣어요","더 자세한 문장을 만들어요","사진을 보고 설명하는 문장을 써요"]}, suggested_extras:["t_more4"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"더 자세하게 표현해요 🔍", visual:"🐕", question:"\"강아지가 뛴다\"에 꾸며 주는 말을 여러 개 넣으면?<br>\"작고 귀여운 강아지가 신나게 깡충깡충 뛴다\"!"}, suggested_extras:["q_more4","r_more4"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"여러 개 넣어 자세하게", content:"한 문장에 꾸며 주는 말을 **여러 개** 넣으면 더 **자세하고 생생**해져요. 대상을 꾸미는 말(작은·귀여운)과 움직임을 꾸미는 말(신나게·깡충깡충)을 함께 넣을 수 있어요!", symbol_meanings:[{symbol:"작은·귀여운", meaning:"강아지를 꾸며요"},{symbol:"신나게", meaning:"뛴다를 꾸며요"},{symbol:"깡충깡충", meaning:"뛰는 모습을 꾸며요"},{symbol:"자세하게", meaning:"그림이 더 또렷해요"}]}, suggested_extras:["t_more4b","x_too4"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"문장에서 꾸며 주는 말을 찾아요 🔍", sub:"문장 속 꾸며 주는 말을 찾아봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"파란 하늘에 흰 구름이 둥실 떠 있다\"", emoji:"☁️", name:"파란·흰·둥실"},{clue:"\"빨간 사과가 주렁주렁 열렸다\"", emoji:"🍎", name:"빨간·주렁주렁"},{clue:"\"작은 새가 즐겁게 노래한다\"", emoji:"🐦", name:"작은·즐겁게"}], outro:"문장 속에 꾸며 주는 말이 이렇게 숨어 있어요. 사진을 보고 문장을 써 볼까요? 😊"}, suggested_extras:["q_find4","g_more4"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"사진 설명 문장을 써요", question:"사진을 보고 꾸며 주는 말을 넣어 설명해 볼까요?", items:["사진에 무엇이 보이나요?","어떤 꾸며 주는 말을 넣을까요?","완성한 설명 문장을 말해 볼까요?"]}, suggested_extras:["t_present4","e_make4"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["한 문장에 꾸며 주는 말을 여러 개 넣었어요","더 자세한 문장을 만들었어요","사진을 보고 설명 문장을 썼어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"꾸며 주는 말이 든 글을 읽어요", body:"다음 시간에는 식물이 자라는 글을 읽으며 꾸며 주는 말을 찾아볼 거예요!"}, suggested_extras:["e_read4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 문장", content:"\"지난 시간에 만든 꾸민 문장이 기억나나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_more4", type:"tip", icon:"🧩", title:"여러 개 넣기", content:"대상을 꾸미는 말과 움직임을 꾸미는 말을 함께 넣게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_more4", type:"fun_question", icon:"🐕", title:"더 자세히", content:"\"이 문장에 꾸며 주는 말을 더 넣으면 어떻게 될까요?\" 표현을 넓혀요.", fit_slides:["motivate"]},
      {id:"r_more4", type:"real_world", icon:"🌍", title:"자세히 말하기", content:"본 것을 친구에게 자세히 설명한 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_more4b", type:"tip", icon:"🧩", title:"두 종류", content:"대상을 꾸미는 말과 움직임을 꾸미는 말 두 종류가 있음을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_too4", type:"misconception", icon:"❓", title:"지나치면 어색", content:"꾸며 주는 말을 너무 많이 넣으면 어색해요. 어울리게 넣게 하세요.", fit_slides:["concept"]},
      {id:"q_find4", type:"fun_question", icon:"💡", title:"몇 개일까", content:"\"이 문장에 꾸며 주는 말이 몇 개 있을까요?\" 함께 찾아요.", fit_slides:["card_quiz"]},
      {id:"g_more4", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 꾸며 주는 말 짝짓기", description:"문장과 그 안의 꾸며 주는 말을 짝지어 보세요.", hint:"무엇을 꾸미는지 찾아요.", pairs:[{a:{text:"☁️ 하늘·구름"},b:{text:"파란·흰·둥실"}},{a:{text:"🍎 사과"},b:{text:"빨간·주렁주렁"}},{a:{text:"🐦 새"},b:{text:"작은·즐겁게"}}], fit_slides:["card_quiz"]},
      {id:"t_present4", type:"tip", icon:"🗣", title:"자유롭게", content:"사진·그림을 보고 자유롭게 설명 문장을 쓰게 하세요.", fit_slides:["question"]},
      {id:"e_make4", type:"extension", icon:"⬆", title:"더 길게", content:"\"두 문장으로 더 자세히 설명해 볼까요?\" 표현을 확장해요.", fit_slides:["question"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"꾸며 주는 말을 여러 개 넣으면 어떻게 되죠?\" 자세함을 짚어요.", fit_slides:["summary"]},
      {id:"e_read4", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 꾸며 주는 말이 든 글을 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 꾸며 주는 말이 든 글 읽기 ① (식물 성장) ---------------- */
  window.LESSONS["u3_l05"] = {
    meta: {grade:2, subject:"국어", unit:3, n:5, title:"꾸며 주는 말이 든 글을 읽어요 ①", std:"[2국03-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 식물이 자라는 모습 → 글 속 꾸며 주는 말 → 글에서 꾸며 주는 말 찾기 → 낱말 뜻 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"꾸며 주는 말이 든 글을 읽어요", subtitle:"3단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_plant5","t_read5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["식물이 자라는 모습을 살펴봐요","글 속 꾸며 주는 말을 찾아요","낱말의 뜻을 알아봐요"]}, suggested_extras:["t_read5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"씨앗이 자라요 🌱", visual:"🌱", question:"작은 씨앗이 새싹이 되고, 꽃이 피고, 열매를 맺어요.<br>이 모습을 꾸며 주는 말로 어떻게 표현할까요?"}, suggested_extras:["q_grow5","r_plant5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"식물이 자라는 모습", content:"식물이 자라는 글에는 꾸며 주는 말이 많아요. \"**조그만** 새싹이 **쑥쑥** 자란다\" \"**예쁜** 꽃이 **활짝** 핀다\"처럼요. 꾸며 주는 말 덕분에 자라는 모습이 **눈에 보이는 듯**해요!", symbol_meanings:[{symbol:"조그만 새싹", meaning:"갓 돋은 작은 싹"},{symbol:"쑥쑥 자란다", meaning:"빠르게 크는 모습"},{symbol:"활짝 핀다", meaning:"꽃이 크게 벌어진 모습"},{symbol:"주렁주렁 열린다", meaning:"열매가 많이 달린 모습"}]}, suggested_extras:["t_read5b","b_book5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 낱말의 뜻은? 🌿", sub:"식물 글에 나오는 꾸며 주는 말의 뜻을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"쑥쑥\"은 어떤 모습일까요?", emoji:"📈", name:"빠르게 자라는 모습"},{clue:"\"조롱조롱\"은 어떤 모습일까요?", emoji:"🍇", name:"작은 것이 많이 매달린 모습"},{clue:"\"활짝\"은 어떤 모습일까요?", emoji:"🌸", name:"크게 벌어진 모습"}], outro:"꾸며 주는 말의 뜻을 아니 글이 더 생생해요. 글에서 더 찾아볼까요? 😊"}, suggested_extras:["q_mean5","g_plant5"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"글에서 꾸며 주는 말을 찾아요", question:"식물이 자라는 글에서 꾸며 주는 말을 찾아볼까요?", items:["어떤 꾸며 주는 말을 찾았나요?","그 말은 무엇을 꾸미나요?","그 말 덕분에 어떤 느낌이 드나요?"]}, suggested_extras:["t_present5","e_find5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["식물이 자라는 모습을 살펴봤어요","글 속 꾸며 주는 말을 찾았어요","낱말의 뜻을 알았어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글을 더 읽고 표현해요", body:"다음 시간에는 글을 더 읽으며 꾸며 주는 말의 재미를 느끼고 표현해 볼 거예요!"}, suggested_extras:["e_read5"]}
    ],
    extras: [
      {id:"q_plant5", type:"fun_question", icon:"💡", title:"키운 식물", content:"\"식물을 키워 본 적 있나요?\" 식물 글을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_read5", type:"tip", icon:"🧩", title:"꾸며 주는 말 찾기", content:"글을 읽으며 꾸며 주는 말을 찾는 데 초점을 두게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_grow5", type:"fun_question", icon:"🌱", title:"자라는 모습", content:"\"씨앗이 자라는 모습을 본 적 있나요?\" 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_plant5", type:"real_world", icon:"🌍", title:"텃밭·화분", content:"교실 화분·텃밭 식물과 이어 자라는 모습을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_read5b", type:"tip", icon:"🧩", title:"생생함의 비밀", content:"꾸며 주는 말 덕분에 글이 생생해짐을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"b_book5", type:"book", icon:"📖", title:"식물 그림책", content:"식물이 자라는 과정을 담은 그림책을 함께 보면 좋아요.", source:"식물 관찰 그림책(시중 다수 — 임의 선택)", fit_slides:["concept"]},
      {id:"q_mean5", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"식물 글에 또 어떤 꾸며 주는 말이 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_plant5", type:"game", game_kind:"memory_match", icon:"🎮", title:"흉내말 ↔ 뜻 짝짓기", description:"꾸며 주는 말과 뜻을 짝지어 보세요.", hint:"어떤 모습인지 떠올려요.", pairs:[{a:{text:"📈 쑥쑥"},b:{text:"빠르게 자람"}},{a:{text:"🍇 조롱조롱"},b:{text:"많이 매달림"}},{a:{text:"🌸 활짝"},b:{text:"크게 벌어짐"}}], fit_slides:["card_quiz"]},
      {id:"t_present5", type:"tip", icon:"🗣", title:"찾아 말하기", content:"글에서 찾은 꾸며 주는 말과 그것이 꾸미는 대상을 말하게 하세요.", fit_slides:["question"]},
      {id:"e_find5", type:"extension", icon:"⬆", title:"바꿔 보기", content:"\"꾸며 주는 말을 다른 말로 바꾸면 어떻게 될까요?\" 표현을 비교해요.", fit_slides:["question"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"글에서 무엇을 찾았죠?\" 꾸며 주는 말을 짚어요.", fit_slides:["summary"]},
      {id:"e_read5", type:"extension", icon:"⬆", title:"이어 읽기 예고", content:"\"다음엔 글을 더 읽고 표현해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 꾸며 주는 말이 든 글 읽기 ② ---------------- */
  window.LESSONS["u3_l06"] = {
    meta: {grade:2, subject:"국어", unit:3, n:6, title:"꾸며 주는 말이 든 글을 읽어요 ②", std:"[2국03-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 꾸며 주는 말 바꿔 보기 → 표현의 재미 → 글에서 모두 찾기 → 본 것 꾸며 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"꾸며 주는 말이 든 글을 읽어요", subtitle:"3단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_recall6","t_change6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["꾸며 주는 말을 바꿔 봐요","표현의 재미를 느껴요","본 것을 꾸며 주는 말로 표현해요"]}, suggested_extras:["t_change6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"말을 바꾸면 느낌도 달라요 🔄", visual:"🎨", question:"\"천천히 걷는다\"를 \"느릿느릿 걷는다\"로 바꾸면?<br>느낌이 어떻게 달라지나요?"}, suggested_extras:["q_change6","r_change6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"꾸며 주는 말 바꿔 보기", content:"같은 움직임도 꾸며 주는 말을 **바꾸면** 느낌이 달라져요. \"빨리\"를 \"쌩쌩\"으로, \"천천히\"를 \"느릿느릿\"으로 바꾸면 더 **생생**해요. 어울리는 말을 고르는 것이 표현의 재미예요!", symbol_meanings:[{symbol:"빨리 → 쌩쌩", meaning:"더 빠른 느낌"},{symbol:"천천히 → 느릿느릿", meaning:"더 느린 느낌"},{symbol:"많이 → 잔뜩", meaning:"더 많은 느낌"},{symbol:"바꿔 보기", meaning:"표현의 재미"}]}, suggested_extras:["t_change6b","x_change6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"문장에서 꾸며 주는 말 모두 찾기 🔍", sub:"문장 속 꾸며 주는 말을 모두 찾아봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"커다란 나무가 바람에 살랑살랑 흔들린다\"", emoji:"🌳", name:"커다란·살랑살랑"},{clue:"\"노란 나비가 팔랑팔랑 날아간다\"", emoji:"🦋", name:"노란·팔랑팔랑"},{clue:"\"맑은 시냇물이 졸졸 흐른다\"", emoji:"💧", name:"맑은·졸졸"}], outro:"꾸며 주는 말을 찾으니 글이 더 생생하게 읽혀요. 본 것을 꾸며 말해 볼까요? 😊"}, suggested_extras:["q_find6","g_change6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"본 것을 꾸며 말해요", question:"오늘 본 것을 꾸며 주는 말로 표현해 볼까요?", items:["무엇을 보았나요?","어떤 꾸며 주는 말로 표현할까요?","꾸며 주는 말을 바꾸면 어떻게 달라지나요?"]}, suggested_extras:["t_present6","e_change6"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["꾸며 주는 말을 바꿔 봤어요","표현의 재미를 느꼈어요","본 것을 꾸며 주는 말로 표현했어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"일기 글감을 정해요", body:"다음 시간에는 겪은 일에서 일기로 쓸 글감을 정하는 법을 배워 볼 거예요!"}, suggested_extras:["e_diary6"]}
    ],
    extras: [
      {id:"q_recall6", type:"fun_question", icon:"💡", title:"지난 글", content:"\"지난 시간 식물 글에서 어떤 꾸며 주는 말을 찾았나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_change6", type:"tip", icon:"🧩", title:"바꿔 보기", content:"같은 대상에 다른 꾸며 주는 말을 넣어 보며 느낌의 차이를 느끼게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_change6", type:"fun_question", icon:"🎨", title:"느낌의 차이", content:"\"말을 바꾸니 느낌이 어떻게 달라졌나요?\" 표현의 힘을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_change6", type:"real_world", icon:"🌍", title:"흉내말 찾기", content:"생활 속 소리·모습을 흉내 내는 말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_change6b", type:"tip", icon:"🧩", title:"어울리게 고르기", content:"바꾼 말이 대상에 어울리는지 함께 살피게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_change6", type:"misconception", icon:"❓", title:"뜻이 안 맞으면", content:"느낌만 좇아 뜻이 안 맞는 말을 쓰지 않게 안내하세요.", fit_slides:["concept"]},
      {id:"q_find6", type:"fun_question", icon:"💡", title:"몇 개일까", content:"\"이 문장에 꾸며 주는 말이 몇 개일까요?\" 함께 찾아요.", fit_slides:["card_quiz"]},
      {id:"g_change6", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 꾸며 주는 말 짝짓기", description:"문장과 그 안의 꾸며 주는 말을 짝지어 보세요.", hint:"무엇을 꾸미는지 찾아요.", pairs:[{a:{text:"🌳 나무"},b:{text:"커다란·살랑살랑"}},{a:{text:"🦋 나비"},b:{text:"노란·팔랑팔랑"}},{a:{text:"💧 시냇물"},b:{text:"맑은·졸졸"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"바꿔 말하기", content:"같은 것을 다른 꾸며 주는 말로 바꿔 말하게 해 표현을 즐기게 하세요.", fit_slides:["question"]},
      {id:"e_change6", type:"extension", icon:"⬆", title:"낱말 모으기", content:"\"비슷한 흉내 내는 말을 모아 볼까요?\" 어휘를 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"꾸며 주는 말을 바꾸면 무엇이 달라지죠?\" 느낌을 짚어요.", fit_slides:["summary"]},
      {id:"e_diary6", type:"extension", icon:"⬆", title:"글감 예고", content:"\"다음엔 일기 글감을 정해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 일기 글감 정하기 ① ---------------- */
  window.LESSONS["u3_l07"] = {
    meta: {grade:2, subject:"국어", unit:3, n:7, title:"일기 글감을 정해요 ①", std:"[2국03-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 하루 살펴보기 → 인상 깊은 일 고르기 → 글감 모으기 → 내 글감 정해 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"일기 글감을 정해요", subtitle:"3단원 · 7/15차시 · 소단원 2"}, suggested_extras:["q_day7","t_topic7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["하루를 시간·장소로 살펴봐요","인상 깊은 일을 골라요","일기 글감을 정해요"]}, suggested_extras:["t_topic7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"하루 중 무엇을 쓸까? 🤔", visual:"📔", question:"하루에는 여러 일이 있어요.<br>그중 무엇을 일기로 쓰면 좋을까요?"}, suggested_extras:["q_pick7","r_day7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글감 정하는 방법", content:"일기 글감은 하루를 **시간**(아침·점심·저녁)이나 **장소**(집·학교·놀이터)로 살펴 떠올려요. 그중 **인상 깊은 일**, 마음이 크게 움직인 일을 고르면 좋은 글감이 돼요!", symbol_meanings:[{symbol:"시간으로", meaning:"아침·점심·저녁"},{symbol:"장소로", meaning:"집·학교·놀이터"},{symbol:"인상 깊은 일", meaning:"기억에 남는 일"},{symbol:"마음이 움직인 일", meaning:"기쁘거나 속상했던 일"}]}, suggested_extras:["t_topic7b","x_big7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 일기 글감은? 🤔", sub:"일기로 쓰기 좋은 글감을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"마음이 크게 움직인 일은?", emoji:"💗", name:"줄넘기를 처음 성공한 일 (인상 깊어요)"},{clue:"새로 알게 된 일은?", emoji:"🔎", name:"도서관에서 신기한 책을 찾은 일"},{clue:"이런 건 글감으로 아쉬워요!", emoji:"🙅", name:"\"그냥 아무 일도 없었다\""}], outro:"마음이 움직인 일을 고르면 쓸 거리가 많아요. 내 글감을 정해 볼까요? 😊"}, suggested_extras:["q_pick7b","g_topic7"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"내 글감을 정해 말해요", question:"오늘이나 어제 겪은 일에서 글감을 정해 볼까요?", items:["어떤 일을 골랐나요?","왜 그 일이 인상 깊었나요?","그때 어떤 마음이 들었나요?"]}, suggested_extras:["t_present7","e_topic7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["하루를 시간·장소로 살펴봤어요","인상 깊은 일을 골랐어요","일기 글감을 정했어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글감으로 제목을 정해요", body:"다음 시간에는 정한 글감으로 일기 제목을 정하고 쓸 내용을 떠올려 볼 거예요!"}, suggested_extras:["e_title7"]}
    ],
    extras: [
      {id:"q_day7", type:"fun_question", icon:"💡", title:"오늘 하루", content:"\"오늘 아침부터 지금까지 어떤 일이 있었나요?\" 하루를 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_topic7", type:"tip", icon:"🧩", title:"살펴 떠올리기", content:"시간·장소로 하루를 나눠 살피면 글감이 잘 떠오름을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_pick7", type:"fun_question", icon:"📔", title:"무엇을 쓸까", content:"\"여러 일 중 무엇을 일기로 쓰고 싶나요?\" 글감을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_day7", type:"real_world", icon:"🌍", title:"하루 돌아보기", content:"잠들기 전 하루를 떠올려 본 경험과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_topic7b", type:"tip", icon:"🧩", title:"마음이 움직인 일", content:"마음이 크게 움직인 일이 좋은 글감임을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_big7", type:"misconception", icon:"❓", title:"큰일이 아니어도", content:"특별한 큰일이 아니어도 마음에 남은 작은 일이면 좋은 글감이에요.", fit_slides:["concept"]},
      {id:"q_pick7b", type:"fun_question", icon:"💡", title:"왜 좋을까", content:"\"왜 그 일이 좋은 글감일까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_topic7", type:"game", game_kind:"memory_match", icon:"🎮", title:"일 ↔ 글감 여부 짝짓기", description:"일과 글감으로 좋은지를 짝지어 보세요.", hint:"마음이 움직였는지 생각해요.", pairs:[{a:{text:"💗 줄넘기 성공"},b:{text:"좋은 글감"}},{a:{text:"🔎 신기한 책"},b:{text:"좋은 글감"}},{a:{text:"🙅 아무 일 없음"},b:{text:"쓸 거리 적음"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"까닭과 함께", content:"고른 글감을 왜 인상 깊은지 까닭과 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_topic7", type:"extension", icon:"⬆", title:"여러 글감", content:"\"오늘 일 중 글감이 될 일을 두세 가지 떠올려 볼까요?\" 글감을 모아요.", fit_slides:["question"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"좋은 글감은 어떤 일이죠?\" 인상 깊은 일을 짚어요.", fit_slides:["summary"]},
      {id:"e_title7", type:"extension", icon:"⬆", title:"제목 예고", content:"\"다음엔 글감으로 제목을 정해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 일기 글감 정하기 ② (제목·내용) ---------------- */
  window.LESSONS["u3_l08"] = {
    meta: {grade:2, subject:"국어", unit:3, n:8, title:"일기 글감을 정해요 ②", std:"[2국03-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 제목 정하기 → 쓸 내용 떠올리기 → 알맞은 제목 고르기 → 제목·내용 정해 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"일기 글감을 정해요", subtitle:"3단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_title8","t_title8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글감에 어울리는 제목을 정해요","일기에 쓸 내용을 떠올려요","제목과 내용을 정해 말해요"]}, suggested_extras:["t_title8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"제목으로 한마디! ✏️", visual:"✏️", question:"줄넘기를 처음 성공한 일을 일기로 쓴다면<br>어떤 제목을 붙이면 좋을까요?"}, suggested_extras:["q_name8","r_title8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"제목 정하고 내용 떠올리기", content:"일기 **제목**은 겪은 일을 **한마디**로 나타내요. \"신나는 줄넘기\"처럼요. 그리고 **무슨 일이 있었는지**(겪은 일)와 **그때 마음**(생각·느낌)을 떠올리면 일기 쓸 준비가 끝나요!", symbol_meanings:[{symbol:"제목", meaning:"겪은 일을 한마디로"},{symbol:"언제·어디서", meaning:"일이 일어난 때·곳"},{symbol:"무슨 일", meaning:"겪은 일의 내용"},{symbol:"내 마음", meaning:"그때 생각·느낌"}]}, suggested_extras:["t_title8b","x_long8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어울리는 제목은? ✏️", sub:"겪은 일에 어울리는 제목을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"텃밭에 상추 씨앗을 심은 일은?", emoji:"🌱", name:"\"상추 씨앗을 심은 날\""},{clue:"도서관에서 재미있는 책을 찾은 일은?", emoji:"📚", name:"\"도서관에서 만난 보물\""},{clue:"친구와 화해한 일은?", emoji:"🤝", name:"\"다시 친해진 날\""}], outro:"제목이 겪은 일을 잘 나타내요. 내 일기 제목과 내용을 정해 볼까요? 😊"}, suggested_extras:["q_name8b","g_title8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"제목과 내용을 정해 말해요", question:"내 일기의 제목과 내용을 정해 볼까요?", items:["어떤 제목을 붙일까요?","어떤 일이 있었나요? (겪은 일)","그때 마음은 어땠나요? (생각·느낌)"]}, suggested_extras:["t_present8","e_plan8"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글감에 어울리는 제목을 정했어요","쓸 내용을 떠올렸어요","제목과 내용을 정했어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"일기를 써요", body:"다음 시간에는 정한 글감과 제목으로 겪은 일이 잘 드러나게 일기를 써 볼 거예요!"}, suggested_extras:["e_write8"]}
    ],
    extras: [
      {id:"q_title8", type:"fun_question", icon:"💡", title:"제목 짓기", content:"\"책 제목처럼 내 일에 제목을 붙인다면?\" 제목을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_title8", type:"tip", icon:"🧩", title:"한마디로", content:"제목은 겪은 일을 한마디로 나타냄을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_name8", type:"fun_question", icon:"✏️", title:"어떤 제목", content:"\"이 일에 어떤 제목이 어울릴까요?\" 제목을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_title8", type:"real_world", icon:"🌍", title:"제목의 힘", content:"책·만화 제목이 내용을 알려 주듯 일기 제목도 그렇다고 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_title8b", type:"tip", icon:"🧩", title:"내용 떠올리기", content:"제목과 함께 겪은 일·마음을 떠올려 쓸 준비를 하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_long8", type:"misconception", icon:"❓", title:"제목은 짧게", content:"제목을 너무 길게 쓰지 말고 한마디로 짧게 짓게 하세요.", fit_slides:["concept"]},
      {id:"q_name8b", type:"fun_question", icon:"💡", title:"또 어떤 제목?", content:"\"이 일에 또 어떤 제목이 어울릴까요?\" 제목을 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_title8", type:"game", game_kind:"memory_match", icon:"🎮", title:"일 ↔ 제목 짝짓기", description:"겪은 일과 어울리는 제목을 짝지어 보세요.", hint:"일을 한마디로 나타내요.", pairs:[{a:{text:"🌱 씨앗 심기"},b:{text:"상추 씨앗을 심은 날"}},{a:{text:"📚 책 찾기"},b:{text:"도서관 보물"}},{a:{text:"🤝 화해"},b:{text:"다시 친해진 날"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"세 가지 함께", content:"제목·겪은 일·마음 세 가지를 함께 말하게 해 쓸 준비를 돕습니다.", fit_slides:["question"]},
      {id:"e_plan8", type:"extension", icon:"⬆", title:"차례 떠올리기", content:"\"일이 일어난 차례를 떠올려 볼까요?\" 내용을 정리해요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"일기 제목은 어떻게 짓죠?\" 한마디로를 짚어요.", fit_slides:["summary"]},
      {id:"e_write8", type:"extension", icon:"⬆", title:"일기 쓰기 예고", content:"\"다음엔 일기를 직접 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 일기 쓰기 ① (계획·형식) ---------------- */
  window.LESSONS["u3_l09"] = {
    meta: {grade:2, subject:"국어", unit:3, n:9, title:"겪은 일이 드러나게 일기를 써요 ①", std:"[2국03-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 일기 형식 → 차례대로 쓰기 → 일기 요소 잇기 → 일기 쓰기 시작"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겪은 일이 드러나게 일기를 써요", subtitle:"3단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_write9","t_form9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["일기 형식을 다시 살펴봐요","차례대로 일기를 써요","꾸며 주는 말을 넣어 자세하게 써요"]}, suggested_extras:["t_form9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이제 일기를 써요 ✍️", visual:"📝", question:"정한 글감과 제목으로 일기를 써 보려고 해요.<br>무엇부터 쓰면 좋을까요?"}, suggested_extras:["q_order9","r_write9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"일기 쓰는 차례", content:"일기는 **날짜·날씨 → 제목 → 겪은 일 → 생각이나 느낌** 차례로 써요. 겪은 일은 **일어난 차례**대로 쓰고, **꾸며 주는 말**을 넣으면 더 자세하고 생생해져요!", symbol_meanings:[{symbol:"① 날짜·날씨", meaning:"맨 위에 써요"},{symbol:"② 제목", meaning:"한마디로"},{symbol:"③ 겪은 일", meaning:"차례대로 자세히"},{symbol:"④ 생각·느낌", meaning:"그때 마음을"}]}, suggested_extras:["t_form9b","x_order9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"일기 요소를 맞혀요 📔", sub:"일기의 각 부분을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"5월 7일 화요일, 맑음\"은 어디?", emoji:"📅", name:"맨 위 — 날짜와 날씨"},{clue:"\"오늘 텃밭에 상추를 심었다\"는?", emoji:"🌱", name:"겪은 일"},{clue:"\"잘 자랐으면 좋겠다\"는?", emoji:"💗", name:"생각이나 느낌"}], outro:"일기 차례를 알았어요. 꾸며 주는 말을 넣어 써 볼까요? 😊"}, suggested_extras:["q_part9","g_form9"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"일기를 쓰기 시작해요", question:"정한 글감으로 일기를 써 볼까요?", items:["날짜·날씨·제목을 썼나요?","겪은 일을 차례대로 쓰고 있나요?","꾸며 주는 말을 넣어 자세히 쓰고 있나요?"]}, suggested_extras:["t_present9","e_write9b"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["일기 형식을 다시 살펴봤어요","차례대로 일기를 쓰기 시작했어요","꾸며 주는 말을 넣어 자세히 썼어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"일기를 완성하고 점검해요", body:"다음 시간에는 일기를 완성하고 잘 썼는지 스스로 점검해 볼 거예요!"}, suggested_extras:["e_check9"]}
    ],
    extras: [
      {id:"q_write9", type:"fun_question", icon:"💡", title:"쓸 준비", content:"\"정한 글감이 잘 떠오르나요?\" 쓸 준비를 살펴요.", fit_slides:["cover","motivate"]},
      {id:"t_form9", type:"tip", icon:"🧩", title:"형식 따라", content:"날짜·날씨·제목·겪은 일·생각이나 느낌 차례를 따라 쓰게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_order9", type:"fun_question", icon:"📝", title:"무엇부터", content:"\"일기는 무엇부터 쓰면 좋을까요?\" 차례를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_write9", type:"real_world", icon:"🌍", title:"그림일기 경험", content:"1학년 그림일기 경험과 이어 형식을 떠올리게 해요.", fit_slides:["motivate"]},
      {id:"t_form9b", type:"tip", icon:"🧩", title:"차례대로", content:"겪은 일은 일어난 차례대로 쓰게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_order9", type:"misconception", icon:"❓", title:"느낌도 꼭", content:"겪은 일만 쓰지 말고 생각·느낌도 꼭 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_part9", type:"fun_question", icon:"💡", title:"어떤 부분?", content:"\"이건 일기의 어느 부분일까요?\" 요소를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_form9", type:"game", game_kind:"memory_match", icon:"🎮", title:"내용 ↔ 일기 요소 짝짓기", description:"내용과 일기 요소를 짝지어 보세요.", hint:"일기 차례를 떠올려요.", pairs:[{a:{text:"📅 5월 7일 맑음"},b:{text:"날짜·날씨"}},{a:{text:"🌱 상추를 심었다"},b:{text:"겪은 일"}},{a:{text:"💗 잘 자랐으면"},b:{text:"생각·느낌"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"천천히 쓰기", content:"한 부분씩 천천히 쓰게 하고, 어려워하면 형식을 다시 보여 주세요.", fit_slides:["question"]},
      {id:"e_write9b", type:"extension", icon:"⬆", title:"꾸며 넣기", content:"\"꾸며 주는 말을 한 군데 더 넣어 볼까요?\" 표현을 더해요.", fit_slides:["question"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"일기는 어떤 차례로 쓰죠?\" 형식을 짚어요.", fit_slides:["summary"]},
      {id:"e_check9", type:"extension", icon:"⬆", title:"점검 예고", content:"\"다음엔 일기를 완성하고 점검해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 일기 쓰기 ② (완성·꾸며 주는 말) ---------------- */
  window.LESSONS["u3_l10"] = {
    meta: {grade:2, subject:"국어", unit:3, n:10, title:"겪은 일이 드러나게 일기를 써요 ②", std:"[2국03-04] · [2국03-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 자세히 쓰기 → 마음 드러내기 → 잘 쓴 일기 고르기 → 일기 이어 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겪은 일이 드러나게 일기를 써요", subtitle:"3단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_recall10","t_detail10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["겪은 일을 자세히 써요","그때 마음을 드러내요","꾸며 주는 말로 생생하게 써요"]}, suggested_extras:["t_detail10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"마음이 드러나는 일기 💗", visual:"📝", question:"\"줄넘기를 했다\"보다 \"드디어 줄넘기를 열 번이나 넘어서 정말 뿌듯했다\"!<br>어느 쪽이 더 좋은 일기일까요?"}, suggested_extras:["q_detail10","r_detail10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"자세히, 마음을 담아", content:"좋은 일기는 겪은 일을 **자세히** 쓰고 그때 **마음**을 담아요. \"무엇을·어떻게·왜\"를 넣고, **꾸며 주는 말**로 생생하게 쓰면 읽는 사람도 그 일이 **눈에 보이는 듯**해요!", symbol_meanings:[{symbol:"무엇을", meaning:"무슨 일이 있었나"},{symbol:"어떻게", meaning:"자세한 모습"},{symbol:"왜", meaning:"그렇게 된 까닭"},{symbol:"마음 담기", meaning:"그때 생각·느낌"}]}, suggested_extras:["t_detail10b","x_short10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"더 좋은 일기 문장은? ✅", sub:"마음과 꾸며 주는 말이 담긴 문장을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"줄넘기를 한 일을 쓴다면?", emoji:"🤸", name:"\"드디어 열 번을 넘어서 정말 뿌듯했다\""},{clue:"비가 온 일을 쓴다면?", emoji:"🌧️", name:"\"굵은 비가 주룩주룩 내려 신기했다\""},{clue:"이런 문장은 아쉬워요!", emoji:"🙅", name:"\"그냥 놀았다. 끝.\""}], outro:"자세히 쓰고 마음을 담으니 일기가 살아나요. 이어서 써 볼까요? 😊"}, suggested_extras:["q_good10","g_detail10"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"일기를 이어 써요", question:"겪은 일을 더 자세히 써 볼까요?", items:["무엇을·어떻게·왜를 넣었나요?","그때 마음을 썼나요?","꾸며 주는 말로 생생하게 썼나요?"]}, suggested_extras:["t_present10","e_write10"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["겪은 일을 자세히 썼어요","그때 마음을 드러냈어요","꾸며 주는 말로 생생하게 썼어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"일기를 점검해요", body:"다음 시간에는 쓴 일기를 스스로 점검하고 친구와 나눠 볼 거예요!"}, suggested_extras:["e_check10"]}
    ],
    extras: [
      {id:"q_recall10", type:"fun_question", icon:"💡", title:"쓴 일기", content:"\"지난 시간에 어디까지 썼나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_detail10", type:"tip", icon:"🧩", title:"자세히·마음", content:"겪은 일을 자세히, 마음을 담아 쓰게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_detail10", type:"fun_question", icon:"📝", title:"무엇이 다를까", content:"\"두 문장 중 어느 쪽이 더 좋은 일기일까요?\" 자세함의 힘을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_detail10", type:"real_world", icon:"🌍", title:"생생한 이야기", content:"친구에게 일을 자세히 들려줘 재미있던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_detail10b", type:"tip", icon:"🧩", title:"무엇·어떻게·왜", content:"무엇을·어떻게·왜를 넣으면 일기가 자세해짐을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_short10", type:"misconception", icon:"❓", title:"\"끝\"은 아쉬워요", content:"\"그냥 놀았다\"처럼 짧게 끝내지 말고 자세히·마음을 담게 하세요.", fit_slides:["concept"]},
      {id:"q_good10", type:"fun_question", icon:"💡", title:"왜 좋을까", content:"\"이 문장이 왜 더 좋은 일기일까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_detail10", type:"game", game_kind:"memory_match", icon:"🎮", title:"일 ↔ 자세한 문장 짝짓기", description:"겪은 일과 자세히 쓴 문장을 짝지어 보세요.", hint:"마음·꾸며 주는 말을 떠올려요.", pairs:[{a:{text:"🤸 줄넘기"},b:{text:"열 번 넘어 뿌듯"}},{a:{text:"🌧️ 비"},b:{text:"주룩주룩 신기"}},{a:{text:"🌱 씨앗"},b:{text:"조심조심 심음"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"이어 쓰기", content:"앞서 쓴 일기에 자세함과 마음을 더해 이어 쓰게 하세요.", fit_slides:["question"]},
      {id:"e_write10", type:"extension", icon:"⬆", title:"한 문장 더", content:"\"그때 마음을 한 문장 더 써 볼까요?\" 마음을 더해요.", fit_slides:["question"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"좋은 일기는 무엇이 담겨야 하죠?\" 자세함·마음을 짚어요.", fit_slides:["summary"]},
      {id:"e_check10", type:"extension", icon:"⬆", title:"점검 예고", content:"\"다음엔 일기를 점검해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 일기 쓰기 ③ (점검·나누기) ---------------- */
  window.LESSONS["u3_l11"] = {
    meta: {grade:2, subject:"국어", unit:3, n:11, title:"겪은 일이 드러나게 일기를 써요 ③", std:"[2국03-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 일기 점검 → 점검할 점 → 점검 항목 모으기 → 일기 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겪은 일이 드러나게 일기를 써요", subtitle:"3단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_check11","t_check11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["쓴 일기를 스스로 점검해요","고칠 곳을 찾아 다듬어요","일기를 친구와 나눠요"]}, suggested_extras:["t_check11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"내 일기를 다시 읽어요 🔎", visual:"🔎", question:"일기를 다 썼으면 다시 읽어 봐요.<br>무엇을 살펴보면 좋을까요?"}, suggested_extras:["q_read11","r_check11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"일기를 점검해요", content:"일기를 다 쓰면 **날짜·제목**이 있는지, **겪은 일과 마음**이 잘 드러났는지, **문장 부호**를 알맞게 썼는지 살펴봐요. 다시 읽으며 고치면 더 좋은 일기가 돼요!", symbol_meanings:[{symbol:"날짜·제목", meaning:"빠뜨리지 않았나"},{symbol:"겪은 일", meaning:"자세히 썼나"},{symbol:"생각·느낌", meaning:"마음을 담았나"},{symbol:"문장 부호", meaning:"알맞게 썼나"}]}, suggested_extras:["t_check11b","x_check11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"일기를 점검할 때 살필 점은? ✅", sub:"일기를 점검할 때 살펴볼 점을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"가장 먼저 살필 것은?", emoji:"📅", name:"날짜·날씨·제목이 있나"},{clue:"가운데에서 살필 것은?", emoji:"📝", name:"겪은 일이 자세히 드러났나"},{clue:"마지막에 살필 것은?", emoji:"💗", name:"생각·느낌을 담았나"}], outro:"점검하며 고치면 일기가 더 좋아져요. 친구와 일기를 나눠 볼까요? 😊"}, suggested_extras:["q_point11","g_check11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"일기를 나눠요 🎤", sub:"버튼을 눌러 발표할 친구를 뽑아요. 쓴 일기를 소개하고 친구 일기의 좋은 점을 찾아봐요!", count:24, hint:"\u201c제 일기 제목은 ~입니다\u201d 처럼 소개하고, 들은 친구는 좋은 점을 말해 줘요", end_msg:"모두 멋진 일기를 썼어요. 하루를 돌아보는 좋은 습관이 생겼어요! 👏"}, suggested_extras:["t_present11","e_share11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["쓴 일기를 스스로 점검했어요","고칠 곳을 찾아 다듬었어요","일기를 친구와 나눴어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 가지 일기를 써요", body:"다음 시간에는 관찰 일기 같은 여러 가지 일기를 써 보며 실천해 볼 거예요!"}, suggested_extras:["e_obs11"]}
    ],
    extras: [
      {id:"q_check11", type:"fun_question", icon:"💡", title:"다시 읽기", content:"\"내 일기를 다시 읽으면 무엇이 보일까요?\" 점검을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_check11", type:"tip", icon:"🧩", title:"점검 습관", content:"다 쓴 글을 다시 읽고 점검하는 습관을 길러 주세요(단원 역량=반성·점검).", fit_slides:["objective","concept"]},
      {id:"q_read11", type:"fun_question", icon:"🔎", title:"무엇을 살필까", content:"\"일기에서 무엇을 살펴보면 좋을까요?\" 점검 항목을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_check11", type:"real_world", icon:"🌍", title:"다시 보기", content:"그림·만들기를 다시 보며 고친 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_check11b", type:"tip", icon:"🧩", title:"항목별 점검", content:"날짜·제목·겪은 일·마음·부호를 항목별로 점검하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_check11", type:"misconception", icon:"❓", title:"점검은 꼭", content:"다 썼다고 끝이 아니에요. 다시 읽고 고치는 점검을 빠뜨리지 않게 하세요.", fit_slides:["concept"]},
      {id:"q_point11", type:"fun_question", icon:"💡", title:"무엇을 살필까", content:"\"점검할 때 무엇을 살펴야 하죠?\" 항목을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_check11", type:"game", game_kind:"memory_match", icon:"🎮", title:"순서 ↔ 점검 항목 짝짓기", description:"점검 순서와 항목을 짝지어 보세요.", hint:"일기 차례를 떠올려요.", pairs:[{a:{text:"📅 먼저"},b:{text:"날짜·제목"}},{a:{text:"📝 가운데"},b:{text:"겪은 일 자세히"}},{a:{text:"💗 끝"},b:{text:"생각·느낌"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"좋은 점 찾기", content:"친구 일기를 들으며 좋은 점을 구체적으로 말하게 하세요.", fit_slides:["present"]},
      {id:"e_share11", type:"extension", icon:"⬆", title:"배울 점", content:"\"친구 일기에서 배우고 싶은 점이 있나요?\" 나눔을 깊게 해요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"일기를 어떻게 점검했죠?\" 항목별 점검을 짚어요.", fit_slides:["summary"]},
      {id:"e_obs11", type:"extension", icon:"⬆", title:"여러 일기 예고", content:"\"다음엔 관찰 일기를 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 여러 가지 일기 ① (관찰 일기 실천) ---------------- */
  window.LESSONS["u3_l12"] = {
    meta: {grade:2, subject:"국어", unit:3, n:12, title:"여러 가지 일기를 써요 ① (실천)", std:"[2국03-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 여러 일기 종류 → 관찰 일기란 → 관찰할 점 모으기 → 관찰 일기 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"여러 가지 일기를 써요", subtitle:"3단원 · 12/15차시 · 실천"}, suggested_extras:["q_kind12","t_obs12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 가지 일기를 알아봐요","관찰 일기 쓰는 법을 알아봐요","관찰 일기를 써요"]}, suggested_extras:["t_obs12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"자세히 살펴보고 써요 🔬", visual:"🌱", question:"화분의 식물을 며칠 동안 살펴보며 일기를 쓴다면<br>무엇을 관찰하면 좋을까요?"}, suggested_extras:["q_obs12","r_obs12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"관찰 일기 쓰기", content:"관찰 일기는 무언가를 **자세히 살펴보고** 쓰는 일기예요. 식물의 **크기·색깔·모양**이 어떻게 변하는지 살피고, **꾸며 주는 말**로 자세히 쓰면 좋아요. 그림을 더해도 좋아요!", symbol_meanings:[{symbol:"크기", meaning:"얼마나 자랐나"},{symbol:"색깔", meaning:"무슨 색인가"},{symbol:"모양", meaning:"어떻게 생겼나"},{symbol:"변화", meaning:"무엇이 달라졌나"}]}, suggested_extras:["t_obs12b","x_obs12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"관찰할 때 살필 점은? 🔬", sub:"관찰 일기에서 살펴볼 점을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"식물의 키를 살핀다면?", emoji:"📏", name:"\"어제보다 한 뼘 더 자랐다\""},{clue:"잎의 모습을 살핀다면?", emoji:"🍃", name:"\"잎이 넓고 반들반들하다\""},{clue:"색깔의 변화를 살핀다면?", emoji:"🎨", name:"\"초록 잎 끝이 노랗게 변했다\""}], outro:"자세히 살펴 꾸며 주는 말로 쓰니 관찰 일기가 생생해요. 직접 써 볼까요? 😊"}, suggested_extras:["q_point12","g_obs12"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"관찰 일기를 써요", question:"관찰한 것을 일기로 써 볼까요?", items:["무엇을 관찰했나요?","크기·색깔·모양은 어떤가요?","꾸며 주는 말로 자세히 썼나요?"]}, suggested_extras:["t_present12","e_obs12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["여러 가지 일기를 알았어요","관찰 일기 쓰는 법을 알았어요","관찰 일기를 썼어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"일기를 나누고 즐겨요", body:"다음 시간에는 쓴 여러 일기를 나누며 일기 쓰는 즐거움을 느껴 볼 거예요!"}, suggested_extras:["e_share12"]}
    ],
    extras: [
      {id:"q_kind12", type:"fun_question", icon:"💡", title:"일기 종류", content:"\"일기에도 여러 종류가 있을까요?\" 일기의 폭을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_obs12", type:"tip", icon:"🧩", title:"자세히 살피기", content:"관찰 일기는 자세히 살펴보는 것이 핵심임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_obs12", type:"fun_question", icon:"🌱", title:"무엇을 관찰?", content:"\"무엇을 며칠 동안 살펴보고 싶나요?\" 관찰 대상을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_obs12", type:"real_world", icon:"🌍", title:"키우기 경험", content:"식물·동물을 키우며 변화를 본 경험과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_obs12b", type:"tip", icon:"🧩", title:"변화 살피기", content:"크기·색깔·모양의 변화를 살펴 쓰게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_obs12", type:"misconception", icon:"❓", title:"느낀 점도", content:"본 것만 쓰지 말고 관찰하며 든 생각·느낌도 함께 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_point12", type:"fun_question", icon:"💡", title:"또 무엇을?", content:"\"또 무엇을 살펴볼 수 있을까요? (냄새·촉감)\" 관찰을 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_obs12", type:"game", game_kind:"memory_match", icon:"🎮", title:"살필 점 ↔ 표현 짝짓기", description:"관찰할 점과 표현을 짝지어 보세요.", hint:"무엇을 살피는지 생각해요.", pairs:[{a:{text:"📏 키"},b:{text:"한 뼘 자람"}},{a:{text:"🍃 잎"},b:{text:"넓고 반들반들"}},{a:{text:"🎨 색깔"},b:{text:"노랗게 변함"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"자세히 쓰기", content:"관찰한 것을 꾸며 주는 말로 자세히 쓰게 하세요.", fit_slides:["question"]},
      {id:"e_obs12", type:"extension", icon:"⬆", title:"그림 더하기", content:"\"관찰한 모습을 그림으로도 남겨 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"관찰 일기는 무엇을 살피죠?\" 크기·색깔·모양을 짚어요.", fit_slides:["summary"]},
      {id:"e_share12", type:"extension", icon:"⬆", title:"나누기 예고", content:"\"다음엔 쓴 일기를 나눠요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 여러 가지 일기 ② (나누기·즐기기) ---------------- */
  window.LESSONS["u3_l13"] = {
    meta: {grade:2, subject:"국어", unit:3, n:13, title:"여러 가지 일기를 써요 ② (실천)", std:"[2국03-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 일기 나누기 → 좋은 일기의 점 → 좋은 점 찾기 → 일기 발표·소감"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"여러 가지 일기를 써요", subtitle:"3단원 · 13/15차시 · 실천"}, suggested_extras:["q_share13","t_share13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["쓴 일기를 친구와 나눠요","친구 일기의 좋은 점을 찾아요","일기 쓰는 즐거움을 느껴요"]}, suggested_extras:["t_share13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구의 일기를 들어요 📖", visual:"📖", question:"친구는 어떤 일을 일기로 썼을까요?<br>친구 일기를 들으면 무엇이 좋을까요?"}, suggested_extras:["q_hear13","r_share13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"일기를 나누며 배워요", content:"친구 일기를 들으면 **새로운 일**도 알게 되고, **표현하는 법**도 배워요. \"이렇게 쓰니 생생하다\" \"이 마음이 잘 느껴진다\" 하고 **좋은 점**을 찾아 말해 주면 서로 자라요!", symbol_meanings:[{symbol:"새로운 일", meaning:"친구의 하루를 알아요"},{symbol:"표현 배우기", meaning:"좋은 표현을 배워요"},{symbol:"좋은 점 찾기", meaning:"생생함·마음을 칭찬"},{symbol:"함께 자라기", meaning:"서로 배워요"}]}, suggested_extras:["t_share13b","x_judge13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"일기의 좋은 점을 찾아요 ✅", sub:"일기에서 칭찬할 좋은 점을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"꾸며 주는 말을 잘 쓴 일기는?", emoji:"✨", name:"\"생생하게 잘 표현했어\""},{clue:"마음을 잘 담은 일기는?", emoji:"💗", name:"\"그때 마음이 잘 느껴져\""},{clue:"자세히 쓴 일기는?", emoji:"🔎", name:"\"무슨 일인지 또렷하게 알겠어\""}], outro:"좋은 점을 찾아 칭찬하면 서로 힘이 나요. 일기를 발표해 볼까요? 😊"}, suggested_extras:["q_good13","g_share13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"일기를 발표하고 나눠요 🎤", sub:"버튼을 눌러 발표할 친구를 뽑아요. 쓴 일기(겪은 일·관찰)를 소개하고 좋은 점을 나눠요!", count:24, hint:"제목과 가장 마음에 드는 부분을 소개하고, 들은 친구는 좋은 점을 말해 줘요", end_msg:"모두 일기를 멋지게 나눴어요. 일기 쓰기가 즐거워졌어요! 👏"}, suggested_extras:["t_present13","e_share13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["쓴 일기를 친구와 나눴어요","친구 일기의 좋은 점을 찾았어요","일기 쓰는 즐거움을 느꼈어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 단원에서 배운 것을 스스로 돌아보고 정리해 볼 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_share13", type:"fun_question", icon:"💡", title:"나누고 싶은 일기", content:"\"가장 마음에 드는 내 일기는 무엇인가요?\" 나눔을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_share13", type:"tip", icon:"🧩", title:"나누며 배우기", content:"친구 일기에서 표현·소재를 배우게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_hear13", type:"fun_question", icon:"📖", title:"친구의 하루", content:"\"친구는 어떤 일을 일기로 썼을까요?\" 궁금증을 열어요.", fit_slides:["motivate"]},
      {id:"r_share13", type:"real_world", icon:"🌍", title:"이야기 나누기", content:"친구와 하루 이야기를 나눈 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_share13b", type:"tip", icon:"🧩", title:"좋은 점 찾기", content:"표현·마음·자세함 등 구체적인 좋은 점을 찾게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_judge13", type:"misconception", icon:"❓", title:"흠보다 좋은 점", content:"잘못을 지적하기보다 좋은 점을 찾아 칭찬하게 하세요.", fit_slides:["concept"]},
      {id:"q_good13", type:"fun_question", icon:"💡", title:"어떤 점이 좋을까", content:"\"이 일기의 어떤 점이 좋을까요?\" 좋은 점을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_share13", type:"game", game_kind:"memory_match", icon:"🎮", title:"일기 ↔ 좋은 점 짝짓기", description:"일기 특징과 좋은 점을 짝지어 보세요.", hint:"무엇을 잘했는지 생각해요.", pairs:[{a:{text:"✨ 꾸며 주는 말"},b:{text:"생생한 표현"}},{a:{text:"💗 마음"},b:{text:"느낌이 잘 전해짐"}},{a:{text:"🔎 자세함"},b:{text:"또렷한 내용"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"구체적 칭찬", content:"\"잘했다\"보다 어떤 점이 좋은지 구체적으로 칭찬하게 하세요.", fit_slides:["present"]},
      {id:"e_share13", type:"extension", icon:"⬆", title:"일기 습관", content:"\"앞으로 일주일에 몇 번 일기를 쓸까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"일기를 나누며 무엇을 배웠죠?\" 표현·소재를 짚어요.", fit_slides:["summary"]},
      {id:"e_wrap13", type:"extension", icon:"⬆", title:"마무리 예고", content:"\"다음엔 단원을 마무리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 14차시: 마무리하기 ① (스스로 확인) ---------------- */
  window.LESSONS["u3_l14"] = {
    meta: {grade:2, subject:"국어", unit:3, n:14, title:"마무리하기 ① — 스스로 확인", std:"[2국03-04] · [2국04-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 단원 돌아보기 → 꾸며 주는 말·일기 정리 → 확인 퀴즈 → 스스로 확인"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ① — 스스로 확인", subtitle:"3단원 · 14/15차시 · 마무리"}, suggested_extras:["q_back14","t_wrap14"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["단원에서 배운 것을 돌아봐요","꾸며 주는 말·일기 쓰는 법을 정리해요","배운 내용을 스스로 확인해요"]}, suggested_extras:["t_wrap14"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"3단원에서 무엇을 배웠나요? 🎀", visual:"📔", question:"꾸며 주는 말로 자세히 표현하고, 겪은 일을 일기로 썼어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"꾸며 주는 말·일기 정리", content:"이 단원에서 **꾸며 주는 말로 자세히 표현**하고, **겪은 일을 일기로 쓰는 법**을 배웠어요. 글감을 정해 날짜·제목·겪은 일·생각이나 느낌을 차례로 쓰고, 다시 읽고 **점검**하면 좋은 일기가 돼요!", symbol_meanings:[{symbol:"꾸며 주는 말", meaning:"자세하고 생생하게"},{symbol:"글감 정하기", meaning:"인상 깊은 일"},{symbol:"일기 차례", meaning:"날짜·제목·겪은 일·느낌"},{symbol:"점검하기", meaning:"다시 읽고 고치기"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"문장을 생생하게 하려면?", emoji:"✨", name:"꾸며 주는 말을 넣어요"},{clue:"일기에 꼭 들어갈 것은?", emoji:"📔", name:"날짜·제목·겪은 일·생각이나 느낌"},{clue:"일기를 다 쓰면?", emoji:"🔎", name:"다시 읽고 점검해요"}], outro:"배운 것을 잘 기억하고 있어요. 앞으로도 일기를 써 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["꾸며 주는 말을 넣어 문장을 쓸 수 있나요?","겪은 일을 일기로 쓸 수 있나요?","일기를 스스로 점검할 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","꾸며 주는 말·일기 쓰는 법을 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 흉내 내는 말을 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"실천으로", content:"정리에 그치지 말고 꾸준한 일기 쓰기 실천으로 이어지게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"📔", title:"기억에 남는 활동", content:"\"꾸며 주는 말·일기 쓰기 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"꾸준한 일기", content:"꾸준히 일기를 쓰면 좋은 점을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"두 갈래 정리", content:"꾸며 주는 말 표현과 일기 쓰기를 함께 정리하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"점검도 함께", content:"일기는 쓴 뒤 점검까지가 한 과정임을 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"✨ 꾸며 주는 말"},b:{text:"자세하게"}},{a:{text:"📔 일기"},b:{text:"날짜·제목·겪은 일"}},{a:{text:"🔎 점검"},b:{text:"다시 읽고 고치기"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"앞으로 어떤 일을 일기로 쓰고 싶나요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 꾸며 주는 말·일기를 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 흉내 내는 말과 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·흉내 내는 말·글씨) ---------------- */
  window.LESSONS["u3_l15"] = {
    meta: {grade:2, subject:"국어", unit:3, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국04-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 흉내 내는 말 → 모습·소리 흉내 → 흉내말 잇기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"3단원 · 15/15차시 · 마무리"}, suggested_extras:["q_mimic","t_mimic"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["흉내 내는 말을 알아봐요","모습·소리를 흉내 내는 말을 찾아요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_mimic"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"소리와 모습을 말로! 🔊", visual:"🐸", question:"개구리가 \"개굴개굴\", 별이 \"반짝반짝\"…<br>이런 말을 들으면 어떤 느낌이 드나요?"}, suggested_extras:["q_mimic2","r_mimic"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"흉내 내는 말", content:"흉내 내는 말은 **소리**나 **모습**을 흉내 낸 말이에요. \"개굴개굴\"은 소리를, \"반짝반짝\"은 모습을 흉내 내요. 흉내 내는 말도 **꾸며 주는 말**처럼 글을 생생하게 해 줘요!", symbol_meanings:[{symbol:"개굴개굴", meaning:"소리 흉내 (개구리)"},{symbol:"반짝반짝", meaning:"모습 흉내 (별)"},{symbol:"폴짝폴짝", meaning:"모습 흉내 (뛰는 모습)"},{symbol:"졸졸", meaning:"소리 흉내 (물)"}]}, suggested_extras:["t_mimic2","x_mimic"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어울리는 흉내 내는 말은? 🔊", sub:"모습·소리에 어울리는 흉내 내는 말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"비가 내리는 소리는?", emoji:"🌧️", name:"\"주룩주룩\""},{clue:"강아지가 뛰는 모습은?", emoji:"🐶", name:"\"깡충깡충\""},{clue:"별이 빛나는 모습은?", emoji:"⭐", name:"\"반짝반짝\""}], outro:"흉내 내는 말을 쓰니 글이 더 생생해요. 이제 글씨도 써 볼까요? 😊"}, suggested_extras:["q_mimic3","g_mimic"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **일기 · 활짝 · 반짝반짝**을 바르게 써 보세요!", symbol_meanings:[{symbol:"일기", meaning:"또박또박 칸에 맞춰"},{symbol:"활짝", meaning:"바른 자세로"},{symbol:"반짝반짝", meaning:"천천히 정성껏"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"3단원에서 배운 것", points:["꾸며 주는 말로 자세히 표현했어요","겪은 일을 일기로 썼어요","흉내 내는 말을 알고 글씨를 썼어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"겪은 일을 생생하게!", body:"3단원을 모두 마쳤어요. 앞으로도 꾸며 주는 말로 자세히 쓰고 일기로 하루를 남겨 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_mimic", type:"fun_question", icon:"💡", title:"흉내 내는 말", content:"\"소리를 흉내 내는 말을 하나 말해 볼까요?\" 흉내말을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mimic", type:"tip", icon:"🧩", title:"소리·모습", content:"흉내 내는 말이 소리와 모습 두 가지를 흉내 냄을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_mimic2", type:"fun_question", icon:"🐸", title:"어떤 느낌", content:"\"흉내 내는 말을 들으면 어떤 느낌이 드나요?\" 생생함을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_mimic", type:"real_world", icon:"🌍", title:"생활 속 소리", content:"빗소리·동물 소리 등 생활 속 소리와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mimic2", type:"tip", icon:"🧩", title:"꾸며 주는 말처럼", content:"흉내 내는 말도 꾸며 주는 말처럼 글을 생생하게 함을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_mimic", type:"misconception", icon:"❓", title:"어울리게", content:"소리·모습에 어울리는 흉내말을 고르게 안내하세요.", fit_slides:["concept"]},
      {id:"q_mimic3", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"이 모습에 또 어떤 흉내 내는 말이 어울릴까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_mimic", type:"game", game_kind:"memory_match", icon:"🎮", title:"모습·소리 ↔ 흉내말 짝짓기", description:"모습·소리와 흉내 내는 말을 짝지어 보세요.", hint:"무엇을 흉내 내는지 생각해요.", pairs:[{a:{text:"🌧️ 비 소리"},b:{text:"주룩주룩"}},{a:{text:"🐶 뛰는 모습"},b:{text:"깡충깡충"}},{a:{text:"⭐ 빛나는 모습"},b:{text:"반짝반짝"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"바른 글씨", content:"네모 칸의 자형을 살펴 또박또박 쓰게 하고, 어려워하면 천천히 따라 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"흉내 내는 말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"3단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"일기 습관", content:"\"오늘 밤에 일기를 한 편 써 볼까요?\" 일기 쓰기를 이어 가요.", fit_slides:["next_lesson"]}
    ]
  };


})();
