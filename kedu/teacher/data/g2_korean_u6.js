/* ============================================================================
   2학년 1학기 국어 6단원 「자신의 생각을 표현해요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u6_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (나) 184~215 / 15차시.
   - 단원 목표: 글에서 중요한 내용을 찾고 자신의 생각 표현. 역량 디지털·미디어(매체를 통한 소통).
   - 성취기준 [2국02-03](중심 내용)·[2국02-04](인물 생각 짐작·비교)·[2국05-02](느낀·생각한 점)·[2국06-02](글·그림 표현).
   ★ 저작권: 지도서 제재 전부 미게재 — 광고 「공공장소에서의 예절」·「줄넘기의 좋은 점」·「나무뿌리는 무슨 일을 할까」·
      「나무 노래」·「수연이네 가족회의」·「누구를 보낼까요」(이형래, 절대 인용 금지)·「금덩이를 버린 형제」·
      「토끼와 거북」·「토끼의 재판」·「저마다 다른 동물의 생김새」 등. 토박이말은 표준어 지식 자체 구성.
      설명문·이야기·우화는 보편 소재(걷기·개미·우리 반 나들이·숲 대표 뽑기) 전부 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 매체 속 중요한 내용 ---------------- */
  window.LESSONS["u6_l01"] = {
    meta: {grade:2, subject:"국어", unit:6, n:1, title:"단원 도입 — 자신의 생각을 표현해요", std:"[2국02-03] · [2국06-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 매체로 정보 주고받기 → 중요한 내용이란 → 중요한 내용 고르기 → 매체 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"자신의 생각을 표현해요", subtitle:"6단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["매체로 정보를 주고받음을 알아봐요","중요한 내용이 무엇인지 알아봐요","중요한 내용을 찾아봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"안내판이 무엇을 알려 줄까? 🪧", visual:"🪧", question:"\"여기는 조용히 해 주세요\"라는 안내판을 봤어요.<br>이 안내판은 우리에게 무엇을 알려 줄까요?"}, suggested_extras:["q_media","r_media"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"매체와 중요한 내용", content:"글·안내판·광고처럼 정보를 전하는 것을 **매체**라고 해요. 매체에는 **꼭 알아야 할 내용**, 즉 **중요한 내용**이 담겨 있어요. 중요한 내용을 잘 찾으면 매체가 전하는 뜻을 알 수 있어요!", symbol_meanings:[{symbol:"글", meaning:"이야기·설명을 전해요"},{symbol:"안내판", meaning:"무엇을 하라고 알려요"},{symbol:"광고", meaning:"무엇을 알리고 권해요"},{symbol:"중요한 내용", meaning:"꼭 알아야 할 것"}]}, suggested_extras:["t_concept","x_all"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"중요한 내용은? 🪧", sub:"매체에서 중요한 내용을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"도서관에서는 조용히\" 안내판의 중요한 내용은?", emoji:"🤫", name:"도서관에서 조용히 해야 한다"},{clue:"\"손을 깨끗이 씻어요\" 안내문의 중요한 내용은?", emoji:"🧼", name:"손을 깨끗이 씻어야 한다"},{clue:"\"이쪽으로 나가세요\" 안내판의 중요한 내용은?", emoji:"🚪", name:"이쪽이 나가는 길이다"}], outro:"매체마다 꼭 알아야 할 중요한 내용이 있어요. 우리 둘레의 매체를 떠올려 볼까요? 😊"}, suggested_extras:["q_more","g_media"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"매체를 떠올려요", question:"우리 둘레에 어떤 매체가 있나요?", items:["학교에서 본 안내판이 있나요?","그 안내판은 무엇을 알려 주나요?","매체에서 중요한 내용은 무엇이었나요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["매체로 정보를 주고받음을 알았어요","중요한 내용이 무엇인지 알았어요","중요한 내용을 찾아봤어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"중요한 내용 찾는 방법", body:"다음 시간에는 글에서 중요한 내용을 찾는 방법을 배워 볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"본 안내판", content:"\"오늘 학교에서 본 안내판이 있나요?\" 매체를 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '중요한 내용 찾기 + 인물 생각 파악 + 자신의 생각 표현'이에요. 도입에선 매체로 소통함을 느끼게 하세요.", fit_slides:["objective","cover"]},
      {id:"q_media", type:"fun_question", icon:"🪧", title:"무엇을 알릴까", content:"\"이 안내판은 우리에게 무엇을 알려 줄까요?\" 중요한 내용을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_media", type:"real_world", icon:"🌍", title:"생활 속 매체", content:"길·가게·학교에서 본 안내판·광고와 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"중요한 내용", content:"매체마다 꼭 알아야 할 중요한 내용이 있음을 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_all", type:"misconception", icon:"❓", title:"다 중요한 건 아니에요", content:"모든 글자가 똑같이 중요한 건 아니에요. 꼭 알아야 할 것을 가려내게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"q_more", type:"fun_question", icon:"💡", title:"또 어떤 매체?", content:"\"또 어떤 매체가 있을까요? (포스터·표지판)\" 매체를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_media", type:"game", game_kind:"memory_match", icon:"🎮", title:"매체 ↔ 알리는 것 짝짓기", description:"매체와 알리는 내용을 짝지어 보세요.", hint:"무엇을 알리는지 생각해요.", pairs:[{a:{text:"🤫 도서관 안내"},b:{text:"조용히 하기"}},{a:{text:"🧼 손 씻기 안내"},b:{text:"깨끗이 씻기"}},{a:{text:"🚪 출구 표시"},b:{text:"나가는 길"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"가볍게", content:"둘레의 매체를 자유롭게 떠올려 말하게 하세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"매체 만들기", content:"\"우리 반에 필요한 안내판을 만든다면?\" 상상을 열어요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"매체에서 무엇을 찾았죠?\" 중요한 내용을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"찾는 방법 예고", content:"\"다음엔 중요한 내용 찾는 방법을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 자신의 생각을 표현하면 좋은 점 (준비) ---------------- */
  window.LESSONS["u6_l02"] = {
    meta: {grade:2, subject:"국어", unit:6, n:2, title:"자신의 생각을 표현하면 좋아요", std:"[2국05-02] · [2국06-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 생각 표현이란 → 까닭과 함께 → 좋은 표현 고르기 → 생각 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"자신의 생각을 표현하면 좋아요", subtitle:"6단원 · 2/15차시 · 준비"}, suggested_extras:["q_think2","t_think2"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["자신의 생각을 표현하는 것을 알아봐요","생각을 까닭과 함께 말함을 알아봐요","생각을 표현하면 좋은 점을 알아봐요"]}, suggested_extras:["t_think2"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"내 생각을 말해요 💬", visual:"💭", question:"\"나는 강아지가 좋아\"라고만 하는 것과<br>\"강아지는 다정해서 좋아\"라고 하는 것, 무엇이 다를까요?"}, suggested_extras:["q_why2","r_think2"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"생각을 까닭과 함께", content:"자신의 생각을 말할 땐 **\"무엇이 좋다/싫다\"**와 함께 **\"왜냐하면 ~기 때문이다\"**로 **까닭**을 밝혀요. 까닭을 더하면 내 생각이 잘 전해지고, 듣는 사람도 이해하기 쉬워요!", symbol_meanings:[{symbol:"내 생각", meaning:"좋다·싫다·찬성·반대"},{symbol:"까닭", meaning:"왜 그렇게 생각하나"},{symbol:"\"왜냐하면\"", meaning:"까닭을 잇는 말"},{symbol:"예의 바르게", meaning:"고운 말로 표현"}]}, suggested_extras:["t_think2b","x_just"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 생각 표현은? ✅", sub:"자신의 생각을 잘 표현한 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"까닭을 더한 표현은?", emoji:"💗", name:"\"나는 책 읽기가 좋아요. 새로운 것을 알게 되기 때문이에요.\""},{clue:"예의 바른 표현은?", emoji:"🤝", name:"\"제 생각은 조금 달라요. 이렇게 하면 어떨까요?\""},{clue:"이런 표현은 아쉬워요!", emoji:"🙅", name:"\"그냥 싫어. 이유는 없어.\""}], outro:"까닭을 더해 예의 바르게 말하면 생각이 잘 전해져요. 내 생각을 떠올려 볼까요? 😊"}, suggested_extras:["q_good2","g_think2"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"생각을 떠올려요", question:"내 생각을 까닭과 함께 말해 볼까요?", items:["내가 좋아하는 것은 무엇인가요?","왜 그것을 좋아하나요?","까닭을 더하니 어떤가요?"]}, suggested_extras:["t_present2","e_more2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["자신의 생각을 표현하는 것을 알았어요","생각을 까닭과 함께 말함을 알았어요","생각을 표현하면 좋은 점을 알았어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"중요한 내용 찾는 방법", body:"다음 시간에는 글에서 중요한 내용을 찾는 방법을 배워 볼 거예요!"}, suggested_extras:["e_find2"]}
    ],
    extras: [
      {id:"q_think2", type:"fun_question", icon:"💡", title:"내 생각", content:"\"내 생각을 친구에게 말해 본 적 있나요?\" 생각 표현을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_think2", type:"tip", icon:"🧩", title:"까닭이 핵심", content:"생각 표현의 핵심은 까닭을 밝히는 것임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_why2", type:"fun_question", icon:"💭", title:"무엇이 다를까", content:"\"까닭을 더하면 무엇이 달라지나요?\" 표현의 힘을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_think2", type:"real_world", icon:"🌍", title:"의견 나누기", content:"가족·친구와 의견을 나눈 경험과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_think2b", type:"tip", icon:"🧩", title:"예의 바르게", content:"생각이 달라도 예의 바르게 표현하게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_just", type:"misconception", icon:"❓", title:"\"그냥\" 대신", content:"\"그냥 싫어\"보다 까닭을 한마디라도 더하게 하세요.", fit_slides:["concept"]},
      {id:"q_good2", type:"fun_question", icon:"💡", title:"좋은 표현은?", content:"\"좋은 생각 표현에는 무엇이 들어가죠?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_think2", type:"game", game_kind:"memory_match", icon:"🎮", title:"표현 ↔ 특징 짝짓기", description:"표현과 그 특징을 짝지어 보세요.", hint:"좋은 표현을 생각해요.", pairs:[{a:{text:"💗 까닭 더함"},b:{text:"잘 전해져요"}},{a:{text:"🤝 예의 바름"},b:{text:"기분 좋게"}},{a:{text:"🙅 까닭 없음"},b:{text:"아쉬워요"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"까닭과 함께", content:"좋아하는 것을 까닭과 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_more2", type:"extension", icon:"⬆", title:"생각 넓히기", content:"\"같은 일에 다른 생각을 가진 친구도 있을까요?\" 다양성을 느끼게 해요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"생각을 표현할 때 무엇을 더하죠?\" 까닭을 짚어요.", fit_slides:["summary"]},
      {id:"e_find2", type:"extension", icon:"⬆", title:"찾는 방법 예고", content:"\"다음엔 중요한 내용 찾는 방법을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 중요한 내용 찾는 방법 ① ---------------- */
  window.LESSONS["u6_l03"] = {
    meta: {grade:2, subject:"국어", unit:6, n:3, title:"중요한 내용을 찾는 방법을 알아봐요 ①", std:"[2국02-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 제목 살피기 → 자주 나오는 낱말 → 중요한 낱말 모으기 → 중요한 내용 찾아 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"중요한 내용을 찾는 방법을 알아봐요", subtitle:"6단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_find3","t_find3"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["제목으로 중요한 내용을 짐작해요","자주 나오는 낱말을 찾아요","중요한 내용을 찾아 말해요"]}, suggested_extras:["t_find3"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"제목이 알려 줘요 📑", visual:"📑", question:"\"걷기의 좋은 점\"이라는 제목을 보면<br>이 글이 무엇에 대한 글인지 알 수 있나요?"}, suggested_extras:["q_title3","r_find3"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"제목과 자주 나오는 낱말", content:"중요한 내용을 찾으려면 먼저 **제목**을 살펴봐요. 제목은 글이 무엇에 대한 글인지 알려 줘요. 그리고 글에 **자주 나오는 낱말**을 찾으면, 그것이 글의 **중심 낱말**일 때가 많아요!", symbol_meanings:[{symbol:"제목 보기", meaning:"무엇에 대한 글인지"},{symbol:"자주 나오는 낱말", meaning:"중심 낱말일 때가 많아요"},{symbol:"걷기의 좋은 점", meaning:"제목 → 걷기에 대한 글"},{symbol:"중심 낱말", meaning:"글의 핵심 말"}]}, suggested_extras:["t_find3b","x_long3"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"중요한 낱말은? 📑", sub:"글에서 중요한 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"걷기의 좋은 점\" 글에서 자주 나올 낱말은?", emoji:"🚶", name:"걷기·건강·튼튼"},{clue:"\"개미의 생활\" 글에서 자주 나올 낱말은?", emoji:"🐜", name:"개미·일·줄"},{clue:"이건 중요한 낱말이 아니에요!", emoji:"🙅", name:"글에 한 번만 나온 낱말"}], outro:"제목과 자주 나오는 낱말로 중요한 내용을 찾을 수 있어요. 직접 찾아볼까요? 😊"}, suggested_extras:["q_word3","g_find3"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"중요한 내용을 찾아 말해요", question:"글에서 중요한 내용을 찾아 볼까요?", items:["제목으로 무엇에 대한 글인지 알았나요?","자주 나오는 낱말은 무엇인가요?","이 글에서 중요한 내용은 무엇인가요?"]}, suggested_extras:["t_present3","e_find3"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["제목으로 중요한 내용을 짐작했어요","자주 나오는 낱말을 찾았어요","중요한 내용을 찾아 말했어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"중심 문장을 찾아요", body:"다음 시간에는 글에서 가장 중요한 문장, 중심 문장을 찾는 법을 배워 볼 거예요!"}, suggested_extras:["e_center3"]}
    ],
    extras: [
      {id:"q_find3", type:"fun_question", icon:"💡", title:"제목의 힘", content:"\"제목만 보고 글 내용을 짐작해 본 적 있나요?\" 찾기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_find3", type:"tip", icon:"🧩", title:"제목·낱말", content:"제목과 자주 나오는 낱말이 중요한 내용을 찾는 실마리임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_title3", type:"fun_question", icon:"📑", title:"무엇에 대한 글", content:"\"제목을 보면 무엇에 대한 글인지 알 수 있나요?\" 제목을 살펴요.", fit_slides:["motivate"]},
      {id:"r_find3", type:"real_world", icon:"🌍", title:"책 제목", content:"책 제목을 보고 내용을 짐작한 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_find3b", type:"tip", icon:"🧩", title:"자주 나오는 낱말", content:"자주 나오는 낱말이 중심 낱말일 때가 많음을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_long3", type:"misconception", icon:"❓", title:"다 외우지 않기", content:"글 전체를 외우려 하지 말고 중요한 낱말·내용만 가려내게 하세요.", fit_slides:["concept"]},
      {id:"q_word3", type:"fun_question", icon:"💡", title:"어떤 낱말?", content:"\"이 글에서 자주 나올 낱말은 무엇일까요?\" 중심 낱말을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_find3", type:"game", game_kind:"memory_match", icon:"🎮", title:"제목 ↔ 중심 낱말 짝짓기", description:"제목과 중심 낱말을 짝지어 보세요.", hint:"무엇에 대한 글인지 생각해요.", pairs:[{a:{text:"🚶 걷기의 좋은 점"},b:{text:"걷기·건강"}},{a:{text:"🐜 개미의 생활"},b:{text:"개미·일"}},{a:{text:"🌳 나무의 쓰임"},b:{text:"나무·쓸모"}}], fit_slides:["card_quiz"]},
      {id:"t_present3", type:"tip", icon:"🗣", title:"실마리로 찾기", content:"제목·낱말을 실마리로 중요한 내용을 말하게 하세요.", fit_slides:["question"]},
      {id:"e_find3", type:"extension", icon:"⬆", title:"한 문장으로", content:"\"이 글을 한 문장으로 말하면?\" 요약을 연습해요.", fit_slides:["question"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"중요한 내용은 무엇으로 찾죠?\" 제목·낱말을 짚어요.", fit_slides:["summary"]},
      {id:"e_center3", type:"extension", icon:"⬆", title:"중심 문장 예고", content:"\"다음엔 중심 문장을 찾아요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 중요한 내용 찾는 방법 ② (중심 문장) ---------------- */
  window.LESSONS["u6_l04"] = {
    meta: {grade:2, subject:"국어", unit:6, n:4, title:"중요한 내용을 찾는 방법을 알아봐요 ②", std:"[2국02-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 중심 문장이란 → 중심 문장 찾기 → 좋은 점↔내용 잇기 → 중심 문장 찾아 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"중요한 내용을 찾는 방법을 알아봐요", subtitle:"6단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_center4"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["중심 문장이 무엇인지 알아봐요","중심 문장을 찾아요","중심 문장으로 중요한 내용을 정리해요"]}, suggested_extras:["t_center4"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"가장 중요한 문장은? ⭐", visual:"⭐", question:"여러 문장 중에서 글쓴이가 가장 하고 싶은 말이 담긴 문장!<br>그것을 무엇이라고 부를까요?"}, suggested_extras:["q_center4","r_center4"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"중심 문장 찾기", content:"한 문단에서 **가장 중요한 문장**을 **중심 문장**이라고 해요. 나머지 문장은 중심 문장을 **자세히 설명**해 줘요. \"걷기는 건강에 좋다\"가 중심 문장이면, 다른 문장은 그 까닭을 설명해요!", symbol_meanings:[{symbol:"중심 문장", meaning:"가장 중요한 문장"},{symbol:"뒷받침 문장", meaning:"중심 문장을 설명"},{symbol:"\"걷기는 건강에 좋다\"", meaning:"중심 문장 예"},{symbol:"한 문단에 하나", meaning:"중심 문장은 보통 하나"}]}, suggested_extras:["t_center4b","x_center4"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"중심 문장은? ⭐", sub:"문단에서 중심 문장을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"걷기 글의 중심 문장은?", emoji:"🚶", name:"\"걷기는 우리 몸을 튼튼하게 해 준다.\""},{clue:"개미 글의 중심 문장은?", emoji:"🐜", name:"\"개미는 함께 일하며 산다.\""},{clue:"이건 뒷받침 문장이에요!", emoji:"📎", name:"\"그래서 다리가 튼튼해진다.\" (설명)"}], outro:"중심 문장을 찾으면 중요한 내용을 한눈에 알 수 있어요. 직접 찾아볼까요? 😊"}, suggested_extras:["q_pick4","g_center4"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"중심 문장을 찾아 말해요", question:"글에서 중심 문장을 찾아 볼까요?", items:["가장 중요한 문장은 무엇인가요?","그 문장이 왜 중심 문장일까요?","중심 문장으로 중요한 내용을 말해 볼까요?"]}, suggested_extras:["t_present4","e_center4"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["중심 문장이 무엇인지 알았어요","중심 문장을 찾았어요","중심 문장으로 중요한 내용을 정리했어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"중요한 내용을 생각하며 글을 읽어요", body:"다음 시간에는 배운 방법으로 글을 읽으며 중요한 내용을 찾아볼 거예요!"}, suggested_extras:["e_read4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 방법", content:"\"지난 시간에 중요한 내용을 어떻게 찾았나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_center4", type:"tip", icon:"🧩", title:"중심 문장", content:"한 문단에 보통 중심 문장이 하나 있음을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_center4", type:"fun_question", icon:"⭐", title:"가장 중요한 문장", content:"\"여러 문장 중 가장 중요한 문장은 무엇일까요?\" 중심 문장을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_center4", type:"real_world", icon:"🌍", title:"요점 말하기", content:"이야기의 요점을 한 문장으로 말한 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_center4b", type:"tip", icon:"🧩", title:"뒷받침 문장", content:"중심 문장을 설명하는 뒷받침 문장과 구분하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_center4", type:"misconception", icon:"❓", title:"첫 문장이 다는 아니에요", content:"중심 문장이 늘 맨 앞에 있는 건 아니에요. 내용을 보고 찾게 하세요.", fit_slides:["concept"]},
      {id:"q_pick4", type:"fun_question", icon:"💡", title:"왜 중심일까", content:"\"이 문장이 왜 중심 문장일까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_center4", type:"game", game_kind:"memory_match", icon:"🎮", title:"글 ↔ 중심 문장 짝짓기", description:"글과 중심 문장을 짝지어 보세요.", hint:"가장 중요한 말을 찾아요.", pairs:[{a:{text:"🚶 걷기 글"},b:{text:"걷기는 몸을 튼튼하게"}},{a:{text:"🐜 개미 글"},b:{text:"개미는 함께 일한다"}},{a:{text:"🌳 나무 글"},b:{text:"나무는 쓸모가 많다"}}], fit_slides:["card_quiz"]},
      {id:"t_present4", type:"tip", icon:"🗣", title:"찾아 말하기", content:"중심 문장을 찾아 그것으로 중요한 내용을 말하게 하세요.", fit_slides:["question"]},
      {id:"e_center4", type:"extension", icon:"⬆", title:"내 말로", content:"\"중심 문장을 내 말로 바꿔 말해 볼까요?\" 요약을 연습해요.", fit_slides:["question"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"중심 문장은 무엇이죠?\" 가장 중요한 문장을 짚어요.", fit_slides:["summary"]},
      {id:"e_read4", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 방법을 써서 글을 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 중요한 내용 생각하며 글 읽기 ① ---------------- */
  window.LESSONS["u6_l05"] = {
    meta: {grade:2, subject:"국어", unit:6, n:5, title:"중요한 내용을 생각하며 글을 읽어요 ①", std:"[2국02-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 방법 적용해 읽기 → 제목·중심 문장 함께 → 하는 일 모으기 → 중요한 내용 정리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"중요한 내용을 생각하며 글을 읽어요", subtitle:"6단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_read5","t_read5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["배운 방법으로 글을 읽어요","제목·중심 문장으로 중요한 내용을 찾아요","중요한 내용을 정리해요"]}, suggested_extras:["t_read5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"방법을 써서 읽어요 🔍", visual:"📖", question:"제목 보기, 자주 나오는 낱말 찾기, 중심 문장 찾기…<br>배운 방법으로 글을 읽으면 무엇이 좋을까요?"}, suggested_extras:["q_how5","r_read5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"방법을 모아 읽기", content:"글을 읽을 땐 **제목**을 먼저 보고, **자주 나오는 낱말**과 **중심 문장**을 찾아요. 세 가지를 함께 쓰면 글의 **중요한 내용**을 잘 정리할 수 있어요. \"이 글은 무엇을 알려 주지?\" 생각하며 읽어요!", symbol_meanings:[{symbol:"① 제목 보기", meaning:"무엇에 대한 글"},{symbol:"② 자주 나오는 낱말", meaning:"중심 낱말"},{symbol:"③ 중심 문장", meaning:"가장 중요한 문장"},{symbol:"중요한 내용 정리", meaning:"세 가지를 모아서"}]}, suggested_extras:["t_read5b","x_read5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"제목에서 알 수 있는 것은? 🔍", sub:"제목으로 알 수 있는 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"개미가 하는 일\" 제목으로 알 수 있는 것은?", emoji:"🐜", name:"개미가 무엇을 하는지 알려 주는 글"},{clue:"\"비가 오는 까닭\" 제목으로 알 수 있는 것은?", emoji:"🌧️", name:"비가 왜 오는지 알려 주는 글"},{clue:"\"우리 반 나들이\" 제목으로 알 수 있는 것은?", emoji:"🚶", name:"우리 반이 나들이 간 이야기"}], outro:"제목만 봐도 글의 중요한 내용을 짐작할 수 있어요. 글을 읽고 정리해 볼까요? 😊"}, suggested_extras:["q_pick5","g_read5"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"중요한 내용을 정리해요", question:"방법을 써서 중요한 내용을 정리해 볼까요?", items:["제목으로 무엇을 알 수 있었나요?","자주 나오는 낱말은 무엇인가요?","이 글의 중요한 내용은 무엇인가요?"]}, suggested_extras:["t_present5","e_read5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["배운 방법으로 글을 읽었어요","제목·중심 문장으로 중요한 내용을 찾았어요","중요한 내용을 정리했어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글을 더 읽고 정리해요", body:"다음 시간에는 글을 더 읽으며 중요한 내용을 정리하는 연습을 해 볼 거예요!"}, suggested_extras:["e_read5b"]}
    ],
    extras: [
      {id:"q_read5", type:"fun_question", icon:"💡", title:"배운 방법", content:"\"중요한 내용을 찾는 방법, 무엇이 있었죠?\" 방법을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_read5", type:"tip", icon:"🧩", title:"세 방법 함께", content:"제목·자주 나오는 낱말·중심 문장 세 가지를 함께 쓰게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_how5", type:"fun_question", icon:"📖", title:"무엇이 좋을까", content:"\"방법을 쓰면 글 읽기가 어떻게 좋아질까요?\" 효과를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read5", type:"real_world", icon:"🌍", title:"설명 글 읽기", content:"설명 글을 읽고 요점을 정리한 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read5b", type:"tip", icon:"🧩", title:"질문하며 읽기", content:"\"이 글은 무엇을 알려 주지?\" 질문하며 읽게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read5", type:"misconception", icon:"❓", title:"빠짐없이 X", content:"모든 내용을 다 기억하려 말고 중요한 내용 중심으로 정리하게 하세요.", fit_slides:["concept"]},
      {id:"q_pick5", type:"fun_question", icon:"💡", title:"무엇을 알 수 있나", content:"\"제목으로 무엇을 알 수 있죠?\" 제목의 힘을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read5", type:"game", game_kind:"memory_match", icon:"🎮", title:"제목 ↔ 알 수 있는 것 짝짓기", description:"제목과 알 수 있는 것을 짝지어 보세요.", hint:"제목이 알려 주는 것을 생각해요.", pairs:[{a:{text:"🐜 개미가 하는 일"},b:{text:"개미의 일"}},{a:{text:"🌧️ 비가 오는 까닭"},b:{text:"비의 까닭"}},{a:{text:"🚶 우리 반 나들이"},b:{text:"나들이 이야기"}}], fit_slides:["card_quiz"]},
      {id:"t_present5", type:"tip", icon:"🗣", title:"방법대로 정리", content:"제목·낱말·중심 문장 순서로 중요한 내용을 정리해 말하게 하세요.", fit_slides:["question"]},
      {id:"e_read5", type:"extension", icon:"⬆", title:"한 문장 요약", content:"\"이 글을 한 문장으로 정리하면?\" 요약을 연습해요.", fit_slides:["question"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"중요한 내용은 어떤 방법으로 찾죠?\" 세 방법을 짚어요.", fit_slides:["summary"]},
      {id:"e_read5b", type:"extension", icon:"⬆", title:"이어 읽기 예고", content:"\"다음엔 글을 더 읽고 정리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 중요한 내용 생각하며 글 읽기 ② ---------------- */
  window.LESSONS["u6_l06"] = {
    meta: {grade:2, subject:"국어", unit:6, n:6, title:"중요한 내용을 생각하며 글을 읽어요 ②", std:"[2국02-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 문단별 정리 → 하는 일 찾기 → 문단↔하는 일 잇기 → 중요한 내용 정리해 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"중요한 내용을 생각하며 글을 읽어요", subtitle:"6단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_recall6","t_read6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["문단마다 중요한 내용을 찾아요","글 전체의 중요한 내용을 정리해요","정리한 내용을 친구와 나눠요"]}, suggested_extras:["t_read6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"문단마다 중요한 내용이! 📋", visual:"📋", question:"긴 글은 여러 문단으로 되어 있어요.<br>문단마다 중요한 내용을 찾으면 무엇이 좋을까요?"}, suggested_extras:["q_para6","r_read6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"문단별로 정리하기", content:"긴 글은 **문단마다** 중요한 내용을 찾아 정리해요. 각 문단의 **중심 문장**을 모으면 글 전체의 중요한 내용이 보여요. \"이 문단은 무엇을 알려 주지?\" 하나씩 살펴봐요!", symbol_meanings:[{symbol:"문단 1", meaning:"중요한 내용 ①"},{symbol:"문단 2", meaning:"중요한 내용 ②"},{symbol:"문단 3", meaning:"중요한 내용 ③"},{symbol:"모아서", meaning:"글 전체 중요한 내용"}]}, suggested_extras:["t_read6b","x_read6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 문단이 알려 주는 것은? 📋", sub:"문단이 알려 주는 중요한 내용을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"개미가 줄지어 다니는 내용의 문단은?", emoji:"🐜", name:"개미는 줄을 지어 다닌다"},{clue:"개미가 먹이를 나르는 내용의 문단은?", emoji:"🍪", name:"개미는 먹이를 함께 나른다"},{clue:"개미가 집을 짓는 내용의 문단은?", emoji:"🏠", name:"개미는 땅속에 집을 짓는다"}], outro:"문단마다 중요한 내용을 찾아 모으니 글 전체가 보여요. 정리해 볼까요? 😊"}, suggested_extras:["q_para6b","g_read6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"중요한 내용을 정리해 나눠요", question:"문단별로 중요한 내용을 정리해 볼까요?", items:["각 문단의 중요한 내용은 무엇인가요?","글 전체의 중요한 내용은 무엇인가요?","친구에게 정리한 내용을 말해 볼까요?"]}, suggested_extras:["t_present6","e_read6"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["문단마다 중요한 내용을 찾았어요","글 전체의 중요한 내용을 정리했어요","정리한 내용을 친구와 나눴어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"인물의 생각을 짐작해요", body:"다음 시간에는 글을 읽고 인물의 생각과 그 까닭을 짐작해 볼 거예요!"}, suggested_extras:["e_char6"]}
    ],
    extras: [
      {id:"q_recall6", type:"fun_question", icon:"💡", title:"지난 방법", content:"\"중요한 내용을 찾는 방법 세 가지를 떠올려 볼까요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_read6", type:"tip", icon:"🧩", title:"문단별로", content:"문단마다 중요한 내용을 찾아 모으는 방법을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_para6", type:"fun_question", icon:"📋", title:"왜 문단별로", content:"\"문단마다 정리하면 무엇이 좋을까요?\" 까닭을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read6", type:"real_world", icon:"🌍", title:"요약하기", content:"긴 글을 짧게 요약해 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read6b", type:"tip", icon:"🧩", title:"중심 문장 모으기", content:"각 문단의 중심 문장을 모으면 전체가 보임을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read6", type:"misconception", icon:"❓", title:"다 적지 않기", content:"문단의 모든 문장을 적지 말고 중요한 내용만 정리하게 하세요.", fit_slides:["concept"]},
      {id:"q_para6b", type:"fun_question", icon:"💡", title:"무엇을 알려 줄까", content:"\"이 문단은 무엇을 알려 주죠?\" 중요한 내용을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read6", type:"game", game_kind:"memory_match", icon:"🎮", title:"문단 ↔ 중요한 내용 짝짓기", description:"문단과 중요한 내용을 짝지어 보세요.", hint:"문단이 알려 주는 것을 생각해요.", pairs:[{a:{text:"🐜 줄지어"},b:{text:"줄을 지어 다님"}},{a:{text:"🍪 먹이"},b:{text:"함께 나름"}},{a:{text:"🏠 집"},b:{text:"땅속에 지음"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"모아 말하기", content:"문단별 내용을 모아 글 전체를 말하게 하세요.", fit_slides:["question"]},
      {id:"e_read6", type:"extension", icon:"⬆", title:"제목 붙이기", content:"\"이 글에 새 제목을 붙인다면?\" 요약을 연습해요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"긴 글은 어떻게 정리하죠?\" 문단별 정리를 짚어요.", fit_slides:["summary"]},
      {id:"e_char6", type:"extension", icon:"⬆", title:"인물 생각 예고", content:"\"다음엔 인물의 생각을 짐작해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 인물의 생각과 까닭 파악 ① ---------------- */
  window.LESSONS["u6_l07"] = {
    meta: {grade:2, subject:"국어", unit:6, n:7, title:"인물의 생각과 까닭을 알아봐요 ①", std:"[2국02-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 인물의 말 살피기 → 생각 짐작 → 인물 생각 고르기 → 인물 생각 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"인물의 생각과 까닭을 알아봐요", subtitle:"6단원 · 7/15차시 · 소단원 2"}, suggested_extras:["q_char7","t_char7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["인물의 말을 살펴봐요","인물의 생각을 짐작해요","인물의 생각을 말해 봐요"]}, suggested_extras:["t_char7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"숲 친구들의 회의 🦊", visual:"🦊", question:"숲 친구들이 대표를 뽑으려 모였어요.<br>여우는 \"발이 빠른 내가 좋아!\"라고 해요. 여우의 생각은 무엇일까요?"}, suggested_extras:["q_say7","r_char7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"인물의 말에서 생각 찾기", content:"이야기 속 인물의 **생각**은 인물이 한 **말**에서 찾을 수 있어요. \"발이 빠른 내가 좋아!\"라는 말에서 여우는 **'내가 대표가 되어야 한다'**고 생각함을 알 수 있어요. 말을 잘 살펴봐요!", symbol_meanings:[{symbol:"인물의 말", meaning:"\"발이 빠른 내가 좋아\""},{symbol:"인물의 생각", meaning:"'내가 대표가 되고 싶다'"},{symbol:"말 살피기", meaning:"생각을 짐작해요"},{symbol:"행동도 함께", meaning:"말과 행동으로 짐작"}]}, suggested_extras:["t_char7b","x_char7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"인물의 생각은? 🦊", sub:"인물의 말에서 생각을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"여우: \"발이 빠른 내가 좋아!\"", emoji:"🦊", name:"내가 대표가 되고 싶다"},{clue:"거북: \"천천히 꼼꼼한 내가 좋아!\"", emoji:"🐢", name:"꼼꼼한 내가 대표에 어울린다"},{clue:"토끼: \"귀가 밝은 내가 좋아!\"", emoji:"🐰", name:"잘 듣는 내가 대표가 되면 좋겠다"}], outro:"인물의 말을 살피니 생각을 알 수 있어요. 인물의 생각을 말해 볼까요? 😊"}, suggested_extras:["q_pick7","g_char7"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"인물의 생각을 말해요", question:"인물의 말에서 생각을 짐작해 볼까요?", items:["인물이 어떤 말을 했나요?","그 말에서 어떤 생각이 드러나나요?","인물은 무엇을 바라는 걸까요?"]}, suggested_extras:["t_present7","e_char7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["인물의 말을 살펴봤어요","인물의 생각을 짐작했어요","인물의 생각을 말했어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"인물의 생각에 담긴 까닭", body:"다음 시간에는 인물이 왜 그렇게 생각하는지 그 까닭을 찾아볼 거예요!"}, suggested_extras:["e_why7"]}
    ],
    extras: [
      {id:"q_char7", type:"fun_question", icon:"💡", title:"이야기 속 인물", content:"\"이야기에서 좋아하는 인물이 있나요?\" 인물을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_char7", type:"tip", icon:"🧩", title:"말에서 생각", content:"인물의 생각은 인물이 한 말에서 찾을 수 있음을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_say7", type:"fun_question", icon:"🦊", title:"무슨 생각일까", content:"\"이 말을 한 인물은 무슨 생각을 할까요?\" 생각을 짐작해요.", fit_slides:["motivate"]},
      {id:"r_char7", type:"real_world", icon:"🌍", title:"마음 짐작", content:"친구의 말에서 마음을 짐작한 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_char7b", type:"tip", icon:"🧩", title:"말과 행동", content:"말뿐 아니라 행동도 함께 보면 생각을 더 잘 짐작할 수 있어요.", fit_slides:["concept","card_quiz"]},
      {id:"x_char7", type:"misconception", icon:"❓", title:"근거 있게", content:"마음대로 짐작하지 말고 인물의 말·행동을 근거로 짐작하게 하세요.", fit_slides:["concept"]},
      {id:"q_pick7", type:"fun_question", icon:"💡", title:"어떤 생각?", content:"\"이 말에서 어떤 생각이 드러나죠?\" 생각을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_char7", type:"game", game_kind:"memory_match", icon:"🎮", title:"말 ↔ 생각 짝짓기", description:"인물의 말과 생각을 짝지어 보세요.", hint:"말에서 생각을 짐작해요.", pairs:[{a:{text:"🦊 발이 빠른 내가"},b:{text:"내가 대표 되고 싶다"}},{a:{text:"🐢 꼼꼼한 내가"},b:{text:"꼼꼼함이 어울린다"}},{a:{text:"🐰 귀 밝은 내가"},b:{text:"잘 들어서 좋다"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"근거와 함께", content:"인물의 말을 근거로 생각을 말하게 하세요.", fit_slides:["question"]},
      {id:"e_char7", type:"extension", icon:"⬆", title:"내가 인물이면", content:"\"내가 그 인물이면 무슨 생각을 할까요?\" 생각을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"인물의 생각은 어디서 찾죠?\" 말·행동을 짚어요.", fit_slides:["summary"]},
      {id:"e_why7", type:"extension", icon:"⬆", title:"까닭 예고", content:"\"다음엔 인물 생각의 까닭을 찾아요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 인물의 생각과 까닭 파악 ② (까닭) ---------------- */
  window.LESSONS["u6_l08"] = {
    meta: {grade:2, subject:"국어", unit:6, n:8, title:"인물의 생각과 까닭을 알아봐요 ②", std:"[2국02-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 생각의 까닭 → 까닭 드러난 말 → 까닭 드러난 말 모으기 → 생각과 까닭 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"인물의 생각과 까닭을 알아봐요", subtitle:"6단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_recall8","t_why8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["인물 생각의 까닭을 찾아요","까닭이 드러난 말을 살펴봐요","인물의 생각과 까닭을 말해요"]}, suggested_extras:["t_why8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"왜 그렇게 생각할까? 🤔", visual:"🦊", question:"여우는 \"발이 빠르니까 내가 좋아!\"라고 했어요.<br>여우가 그렇게 생각하는 까닭은 무엇일까요?"}, suggested_extras:["q_why8","r_why8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"생각의 까닭 찾기", content:"인물의 생각에는 **까닭**이 있어요. \"발이 **빠르니까** 내가 좋아\"에서 '빠르니까'가 까닭이에요. \"**~니까**\" \"**~기 때문에**\" 같은 말에서 까닭을 찾을 수 있어요!", symbol_meanings:[{symbol:"생각", meaning:"내가 대표가 좋다"},{symbol:"까닭", meaning:"발이 빠르니까"},{symbol:"\"~니까\"", meaning:"까닭을 잇는 말"},{symbol:"\"~기 때문에\"", meaning:"까닭을 잇는 말"}]}, suggested_extras:["t_why8b","x_why8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"까닭이 드러난 말은? 🤔", sub:"생각의 까닭이 드러난 말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"여우의 까닭은?", emoji:"🦊", name:"\"발이 빠르니까\""},{clue:"거북의 까닭은?", emoji:"🐢", name:"\"꼼꼼하게 살피기 때문에\""},{clue:"토끼의 까닭은?", emoji:"🐰", name:"\"귀가 밝아서 잘 듣기 때문에\""}], outro:"\"~니까\" \"~기 때문에\"에서 까닭을 찾을 수 있어요. 생각과 까닭을 말해 볼까요? 😊"}, suggested_extras:["q_pick8","g_why8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"생각과 까닭을 말해요", question:"인물의 생각과 까닭을 말해 볼까요?", items:["인물의 생각은 무엇인가요?","그렇게 생각하는 까닭은 무엇인가요?","까닭이 드러난 말은 무엇인가요?"]}, suggested_extras:["t_present8","e_why8"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["인물 생각의 까닭을 찾았어요","까닭이 드러난 말을 살펴봤어요","인물의 생각과 까닭을 말했어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"자신의 생각을 표현해요", body:"다음 시간에는 인물의 생각에 대한 자신의 생각을 까닭과 함께 표현해 볼 거예요!"}, suggested_extras:["e_my8"]}
    ],
    extras: [
      {id:"q_recall8", type:"fun_question", icon:"💡", title:"지난 생각", content:"\"지난 시간에 인물의 생각을 어떻게 찾았나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_why8", type:"tip", icon:"🧩", title:"까닭 잇는 말", content:"\"~니까\" \"~기 때문에\"가 까닭을 잇는 말임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_why8", type:"fun_question", icon:"🤔", title:"왜 그럴까", content:"\"인물이 그렇게 생각하는 까닭은 무엇일까요?\" 까닭을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_why8", type:"real_world", icon:"🌍", title:"까닭 묻기", content:"\"왜?\" 하고 까닭을 물어본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_why8b", type:"tip", icon:"🧩", title:"말에서 까닭", content:"까닭을 잇는 말을 단서로 까닭을 찾게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_why8", type:"misconception", icon:"❓", title:"까닭은 글에서", content:"까닭을 마음대로 짓지 말고 인물의 말에서 찾게 하세요.", fit_slides:["concept"]},
      {id:"q_pick8", type:"fun_question", icon:"💡", title:"어떤 까닭?", content:"\"이 말에서 까닭은 무엇이죠?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_why8", type:"game", game_kind:"memory_match", icon:"🎮", title:"인물 ↔ 까닭 짝짓기", description:"인물과 생각의 까닭을 짝지어 보세요.", hint:"\"~니까\"를 찾아요.", pairs:[{a:{text:"🦊 여우"},b:{text:"발이 빠르니까"}},{a:{text:"🐢 거북"},b:{text:"꼼꼼하니까"}},{a:{text:"🐰 토끼"},b:{text:"귀가 밝으니까"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"생각+까닭", content:"인물의 생각과 까닭을 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_why8", type:"extension", icon:"⬆", title:"누가 어울릴까", content:"\"까닭을 보면 누가 대표에 어울릴까요?\" 판단을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"까닭은 어떤 말에서 찾죠?\" \"~니까\"를 짚어요.", fit_slides:["summary"]},
      {id:"e_my8", type:"extension", icon:"⬆", title:"내 생각 예고", content:"\"다음엔 자신의 생각을 표현해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 자신의 생각 표현하기 ① ---------------- */
  window.LESSONS["u6_l09"] = {
    meta: {grade:2, subject:"국어", unit:6, n:9, title:"자신의 생각을 표현해요 ①", std:"[2국05-02] · [2국02-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 인물 생각에 내 생각 → 내 생각 정하기 → 표현에 필요한 것 모으기 → 내 생각 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"자신의 생각을 표현해요", subtitle:"6단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_my9","t_my9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["인물의 생각에 대한 내 생각을 정해요","생각을 까닭과 함께 표현해요","내 생각을 말해 봐요"]}, suggested_extras:["t_my9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"나는 누가 대표가 좋을까? 🤔", visual:"🗳️", question:"숲 친구들 중 나는 누가 대표가 되면 좋겠어요?<br>그리고 왜 그렇게 생각하나요?"}, suggested_extras:["q_pick9","r_my9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"내 생각을 까닭과 함께", content:"자신의 생각을 표현할 땐 **누구를/무엇을** 고를지 정하고, **왜 그런지 까닭**을 밝혀요. \"저는 토끼가 좋아요. **왜냐하면** 귀가 밝아 친구들 말을 잘 들을 수 있기 때문이에요.\"처럼요!", symbol_meanings:[{symbol:"내 생각 정하기", meaning:"누구를·무엇을"},{symbol:"까닭 밝히기", meaning:"왜 그렇게 생각하나"},{symbol:"\"왜냐하면\"", meaning:"까닭을 잇는 말"},{symbol:"예의 바르게", meaning:"고운 말로"}]}, suggested_extras:["t_my9b","x_my9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 생각 표현은? ✅", sub:"자신의 생각을 잘 표현한 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"까닭이 있는 표현은?", emoji:"💗", name:"\"저는 거북이 좋아요. 꼼꼼해서 일을 잘하기 때문이에요.\""},{clue:"예의 바른 표현은?", emoji:"🤝", name:"\"제 생각은 조금 달라요. 토끼는 어떨까요?\""},{clue:"이런 표현은 아쉬워요!", emoji:"🙅", name:"\"그냥 여우. 이유는 몰라.\""}], outro:"까닭을 더해 예의 바르게 말하면 좋은 표현이에요. 내 생각을 말해 볼까요? 😊"}, suggested_extras:["q_good9","g_my9"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"내 생각을 말해요 🎤", sub:"버튼을 눌러 말할 친구를 뽑아요. 누가 대표가 좋은지 까닭과 함께 말해 봐요!", count:24, hint:"\u201c저는 ○○가 좋아요. 왜냐하면 ~기 때문이에요\u201d 처럼 말해요", end_msg:"모두 자신의 생각을 까닭과 함께 잘 표현했어요! 👏"}, suggested_extras:["t_present9","e_my9"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["인물의 생각에 대한 내 생각을 정했어요","생각을 까닭과 함께 표현했어요","내 생각을 말했어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"생각을 글로 표현해요", body:"다음 시간에는 자신의 생각을 글과 그림으로 표현해 볼 거예요!"}, suggested_extras:["e_write9"]}
    ],
    extras: [
      {id:"q_my9", type:"fun_question", icon:"💡", title:"내 생각", content:"\"나는 누가 대표가 되면 좋겠나요?\" 내 생각을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_my9", type:"tip", icon:"🧩", title:"누구를+까닭", content:"누구를 고를지 정하고 까닭을 밝히는 것이 핵심임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_pick9", type:"fun_question", icon:"🗳️", title:"왜 그럴까", content:"\"왜 그 친구가 대표가 되면 좋을까요?\" 까닭을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_my9", type:"real_world", icon:"🌍", title:"우리 반 정하기", content:"우리 반에서 무언가를 정할 때 의견을 낸 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_my9b", type:"tip", icon:"🧩", title:"예의 바르게", content:"생각이 달라도 예의 바르게 표현하게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_my9", type:"misconception", icon:"❓", title:"까닭 없이 X", content:"까닭 없이 \"그냥\"이라고 하지 말고 까닭을 밝히게 하세요.", fit_slides:["concept"]},
      {id:"q_good9", type:"fun_question", icon:"💡", title:"좋은 표현은?", content:"\"좋은 생각 표현에는 무엇이 들어가죠?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_my9", type:"game", game_kind:"memory_match", icon:"🎮", title:"동물 ↔ 까닭 짝짓기", description:"동물과 어울리는 까닭을 짝지어 보세요.", hint:"무엇을 잘하는지 생각해요.", pairs:[{a:{text:"🦊 여우"},b:{text:"발이 빠름"}},{a:{text:"🐢 거북"},b:{text:"꼼꼼함"}},{a:{text:"🐰 토끼"},b:{text:"귀가 밝음"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"까닭과 함께", content:"\"왜냐하면\"으로 까닭을 꼭 더해 말하게 하세요.", fit_slides:["present"]},
      {id:"e_my9", type:"extension", icon:"⬆", title:"다른 생각도", content:"\"나와 다른 생각을 가진 친구도 있나요?\" 다양성을 인정해요.", fit_slides:["present"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"생각을 표현할 때 무엇을 더하죠?\" 까닭을 짚어요.", fit_slides:["summary"]},
      {id:"e_write9", type:"extension", icon:"⬆", title:"글로 표현 예고", content:"\"다음엔 생각을 글과 그림으로 표현해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 자신의 생각 표현하기 ② (글과 그림) ---------------- */
  window.LESSONS["u6_l10"] = {
    meta: {grade:2, subject:"국어", unit:6, n:10, title:"자신의 생각을 표현해요 ②", std:"[2국06-02] · [2국05-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 글과 그림으로 표현 → 표현에 담을 것 → 표현에 필요한 것 모으기 → 생각 글로 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"자신의 생각을 표현해요", subtitle:"6단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_recall10","t_write10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["생각을 글과 그림으로 표현해요","표현에 담을 것을 정해요","생각을 글로 써요"]}, suggested_extras:["t_write10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글과 그림으로 나타내요 🎨", visual:"🖍️", question:"내 생각을 글로만이 아니라 그림으로도 나타낼 수 있어요.<br>어떻게 표현하면 내 생각이 잘 전해질까요?"}, suggested_extras:["q_how10","r_write10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글과 그림으로 표현하기", content:"자신의 생각을 표현할 땐 **내 생각**과 **까닭**을 글로 쓰고, 어울리는 **그림**을 더하면 좋아요. 글에는 \"저는 ~라고 생각해요. 왜냐하면 ~\"를 담고, 그림으로 생각을 더 잘 전해요!", symbol_meanings:[{symbol:"내 생각", meaning:"글로 또렷하게"},{symbol:"까닭", meaning:"왜 그런지"},{symbol:"그림", meaning:"생각을 보여 줘요"},{symbol:"함께", meaning:"글+그림으로 표현"}]}, suggested_extras:["t_write10b","x_write10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"생각 표현에 필요한 것은? ✅", sub:"생각을 표현할 때 담을 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"가장 먼저 담을 것은?", emoji:"💭", name:"내 생각 (무엇을 고르는지)"},{clue:"꼭 함께 담을 것은?", emoji:"❓", name:"까닭 (왜 그렇게 생각하는지)"},{clue:"생각을 더 잘 전하려면?", emoji:"🎨", name:"어울리는 그림"}], outro:"내 생각·까닭·그림을 담으면 생각이 잘 전해져요. 글로 써 볼까요? 😊"}, suggested_extras:["q_pick10","g_write10"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"생각을 글로 써요", question:"내 생각을 글과 그림으로 표현해 볼까요?", items:["내 생각은 무엇인가요?","까닭을 함께 썼나요?","어떤 그림을 더하고 싶나요?"]}, suggested_extras:["t_present10","e_write10"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["생각을 글과 그림으로 표현했어요","표현에 담을 것을 정했어요","생각을 글로 썼어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"생각을 나눠요", body:"다음 시간에는 표현한 생각을 친구들과 나누고 서로의 생각을 들어 볼 거예요!"}, suggested_extras:["e_share10"]}
    ],
    extras: [
      {id:"q_recall10", type:"fun_question", icon:"💡", title:"지난 생각", content:"\"지난 시간에 어떤 생각을 말했나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_write10", type:"tip", icon:"🧩", title:"글과 그림", content:"생각을 글과 그림 두 가지로 표현하게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_how10", type:"fun_question", icon:"🖍️", title:"어떻게 나타낼까", content:"\"내 생각을 어떻게 나타내면 잘 전해질까요?\" 표현을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_write10", type:"real_world", icon:"🌍", title:"포스터·카드", content:"생각을 담은 포스터·카드를 만든 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_write10b", type:"tip", icon:"🧩", title:"생각+까닭+그림", content:"내 생각·까닭·그림 세 가지를 담게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_write10", type:"misconception", icon:"❓", title:"까닭 빠뜨리지 않기", content:"그림에만 신경 쓰지 말고 까닭도 꼭 글로 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_pick10", type:"fun_question", icon:"💡", title:"무엇을 담을까", content:"\"생각 표현에 무엇을 담죠?\" 생각·까닭·그림을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_write10", type:"game", game_kind:"memory_match", icon:"🎮", title:"요소 ↔ 역할 짝짓기", description:"표현 요소와 역할을 짝지어 보세요.", hint:"무엇을 전하는지 생각해요.", pairs:[{a:{text:"💭 내 생각"},b:{text:"무엇을 고르나"}},{a:{text:"❓ 까닭"},b:{text:"왜 그런가"}},{a:{text:"🎨 그림"},b:{text:"보여 주기"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"생각+까닭 쓰기", content:"\"저는 ~라고 생각해요. 왜냐하면 ~\" 틀로 쓰게 하세요.", fit_slides:["question"]},
      {id:"e_write10", type:"extension", icon:"⬆", title:"그림 더하기", content:"\"내 생각을 잘 보여 주는 그림을 더해 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"생각을 어떻게 표현했죠?\" 글·그림을 짚어요.", fit_slides:["summary"]},
      {id:"e_share10", type:"extension", icon:"⬆", title:"나누기 예고", content:"\"다음엔 생각을 친구와 나눠요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 자신의 생각 표현하기 ③ (나누기) ---------------- */
  window.LESSONS["u6_l11"] = {
    meta: {grade:2, subject:"국어", unit:6, n:11, title:"자신의 생각을 표현해요 ③", std:"[2국05-02] · [2국02-04]", duration_min:40,
      lesson_format:"교사주도 8슬 — 생각 나누기 → 다른 생각 존중 → 좋은 나누기 모으기 → 생각 나누고 비교하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"자신의 생각을 표현해요", subtitle:"6단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_share11","t_share11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["내 생각을 친구와 나눠요","나와 다른 생각을 존중해요","생각을 비교해 봐요"]}, suggested_extras:["t_share11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구는 어떻게 생각할까? 💬", visual:"🗨️", question:"나는 토끼가 좋다고 생각했는데<br>친구는 거북이 좋다고 해요. 왜 생각이 다를까요?"}, suggested_extras:["q_diff11","r_share11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"생각을 나누고 존중하기", content:"같은 일에도 사람마다 생각이 **다를 수** 있어요. 내 생각을 까닭과 함께 말하고, 친구 생각을 **끝까지 들어요**. 생각이 달라도 \"그렇게 생각할 수도 있구나\" 하고 **존중**해요!", symbol_meanings:[{symbol:"내 생각 말하기", meaning:"까닭과 함께"},{symbol:"친구 생각 듣기", meaning:"끝까지"},{symbol:"비교하기", meaning:"무엇이 같고 다른가"},{symbol:"존중하기", meaning:"다른 생각도 인정"}]}, suggested_extras:["t_share11b","x_share11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"생각을 잘 나누는 모습은? ✅", sub:"생각을 잘 나누는 모습을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"내 생각을 말할 때는?", emoji:"💬", name:"까닭과 함께 또박또박 말해요"},{clue:"친구 생각이 다를 때는?", emoji:"🤝", name:"\"그렇게 생각할 수도 있구나\" 존중해요"},{clue:"친구가 말할 때는?", emoji:"👂", name:"끝까지 잘 들어요"}], outro:"생각이 달라도 존중하며 나누면 더 멋진 이야기가 돼요. 함께 나눠 볼까요? 😊"}, suggested_extras:["q_good11","g_share11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"생각을 나누고 비교해요 🎤", sub:"버튼을 눌러 발표할 친구를 뽑아요. 내 생각을 까닭과 함께 말하고 친구 생각과 비교해 봐요!", count:24, hint:"\u201c저는 ~라고 생각해요. 왜냐하면 ~\u201d 말하고, 친구 생각도 들어 비교해요", end_msg:"모두 생각을 나누고 서로를 존중했어요. 멋진 생각 나눔이었어요! 👏"}, suggested_extras:["t_present11","e_share11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["내 생각을 친구와 나눴어요","나와 다른 생각을 존중했어요","생각을 비교해 봤어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"책 소개 상자를 만들어요", body:"다음 시간에는 좋아하는 책의 중요한 내용을 정리해 책 소개 상자를 만들어 볼 거예요!"}, suggested_extras:["e_box11"]}
    ],
    extras: [
      {id:"q_share11", type:"fun_question", icon:"💡", title:"나누고 싶은 생각", content:"\"친구에게 들려주고 싶은 내 생각이 있나요?\" 나눔을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_share11", type:"tip", icon:"🧩", title:"존중하며 나누기", content:"생각이 달라도 존중하며 나누는 데 초점을 두세요.", fit_slides:["objective","concept"]},
      {id:"q_diff11", type:"fun_question", icon:"🗨️", title:"왜 다를까", content:"\"왜 친구와 생각이 다를까요?\" 생각의 다양성을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_share11", type:"real_world", icon:"🌍", title:"의견 나누기", content:"우리 반에서 의견을 나눈 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_share11b", type:"tip", icon:"🧩", title:"비교하기", content:"내 생각과 친구 생각이 무엇이 같고 다른지 비교하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_share11", type:"misconception", icon:"❓", title:"틀린 게 아니라 다른 것", content:"다른 생각을 틀렸다고 하지 말고 존중하게 하세요.", fit_slides:["concept"]},
      {id:"q_good11", type:"fun_question", icon:"💡", title:"바른 모습은?", content:"\"생각을 잘 나누는 모습은 무엇이죠?\" 까닭·존중·듣기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_share11", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 모습 짝짓기", description:"나누기 상황과 바른 모습을 짝지어 보세요.", hint:"서로 존중하는 모습을 생각해요.", pairs:[{a:{text:"💬 내 생각"},b:{text:"까닭과 함께"}},{a:{text:"🤝 다른 생각"},b:{text:"존중하기"}},{a:{text:"👂 들을 때"},b:{text:"끝까지 듣기"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"비교해 말하기", content:"내 생각을 말한 뒤 친구 생각과 비교해 말하게 하세요.", fit_slides:["present"]},
      {id:"e_share11", type:"extension", icon:"⬆", title:"생각 바뀜", content:"\"친구 말을 듣고 생각이 바뀐 게 있나요?\" 생각의 변화를 나눠요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"생각을 나눌 때 무엇이 중요하죠?\" 존중을 짚어요.", fit_slides:["summary"]},
      {id:"e_box11", type:"extension", icon:"⬆", title:"책 소개 예고", content:"\"다음엔 책 소개 상자를 만들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 중요한 내용 정리 ① (책 소개 상자) ---------------- */
  window.LESSONS["u6_l12"] = {
    meta: {grade:2, subject:"국어", unit:6, n:12, title:"중요한 내용을 정리해요 ① (실천)", std:"[2국02-03] · [2국06-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 책 소개 상자란 → 담을 내용 정하기 → 담을 것 모으기 → 책 소개 상자 만들기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"중요한 내용을 정리해요", subtitle:"6단원 · 12/15차시 · 실천"}, suggested_extras:["q_box12","t_box12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["책 소개 상자가 무엇인지 알아봐요","책의 중요한 내용을 정리해요","책 소개 상자를 만들어요"]}, suggested_extras:["t_box12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"책을 상자에 담아 소개해요 📦", visual:"📦", question:"좋아하는 책을 상자 여러 면에 정리해 소개한다면<br>어떤 내용을 담으면 좋을까요?"}, suggested_extras:["q_what12","r_box12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"책 소개 상자 만들기", content:"책 소개 상자는 상자 **각 면**에 책의 정보를 담아 소개하는 거예요. **제목**, **중요한 내용**, **재미있는 부분**, **내 생각**을 면마다 적고 그림을 더하면 멋진 소개 상자가 돼요!", symbol_meanings:[{symbol:"제목 면", meaning:"책 제목·지은이"},{symbol:"중요한 내용 면", meaning:"무엇에 대한 책인지"},{symbol:"재미있는 부분 면", meaning:"기억에 남는 곳"},{symbol:"내 생각 면", meaning:"느낌·추천 까닭"}]}, suggested_extras:["t_box12b","x_box12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"책 소개 상자에 담을 것은? 📦", sub:"책 소개 상자에 담을 내용을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"가장 먼저 담을 것은?", emoji:"📕", name:"책 제목"},{clue:"꼭 담을 것은?", emoji:"⭐", name:"책의 중요한 내용"},{clue:"내 마음을 담는다면?", emoji:"💗", name:"읽고 든 생각·느낌"}], outro:"여러 면에 정리하면 책을 잘 소개할 수 있어요. 직접 만들어 볼까요? 😊"}, suggested_extras:["q_pick12","g_box12"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"책 소개 상자를 만들어요", question:"어떤 책으로 소개 상자를 만들까요?", items:["어떤 책을 소개하고 싶나요?","그 책의 중요한 내용은 무엇인가요?","각 면에 무엇을 담을까요?"]}, suggested_extras:["t_present12","e_box12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["책 소개 상자가 무엇인지 알았어요","책의 중요한 내용을 정리했어요","책 소개 상자를 만들었어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"책 소개 상자로 소개해요", body:"다음 시간에는 만든 책 소개 상자로 친구들에게 책을 소개해 볼 거예요!"}, suggested_extras:["e_share12"]}
    ],
    extras: [
      {id:"q_box12", type:"fun_question", icon:"💡", title:"좋아하는 책", content:"\"친구에게 소개하고 싶은 책이 있나요?\" 책을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_box12", type:"tip", icon:"🧩", title:"중요한 내용 정리", content:"책의 중요한 내용을 골라 면마다 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_what12", type:"fun_question", icon:"📦", title:"무엇을 담을까", content:"\"책 소개 상자에 무엇을 담으면 좋을까요?\" 내용을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_box12", type:"real_world", icon:"🌍", title:"책 추천", content:"친구에게 책을 추천한 경험과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_box12b", type:"tip", icon:"🧩", title:"면마다 다르게", content:"제목·중요한 내용·재미있는 부분·내 생각을 면마다 나눠 담게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_box12", type:"misconception", icon:"❓", title:"줄거리 다 적지 않기", content:"줄거리를 통째로 적지 말고 중요한 내용만 정리하게 하세요.", fit_slides:["concept"]},
      {id:"q_pick12", type:"fun_question", icon:"💡", title:"무엇을 담을까", content:"\"이 면에는 무엇을 담을까요?\" 내용을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_box12", type:"game", game_kind:"memory_match", icon:"🎮", title:"상자 면 ↔ 내용 짝짓기", description:"상자 면과 담을 내용을 짝지어 보세요.", hint:"면마다 무엇을 담는지 생각해요.", pairs:[{a:{text:"📕 제목 면"},b:{text:"책 제목"}},{a:{text:"⭐ 내용 면"},b:{text:"중요한 내용"}},{a:{text:"💗 생각 면"},b:{text:"내 느낌"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"한 면씩", content:"한 면씩 무엇을 담을지 정해 가며 만들게 하세요.", fit_slides:["question"]},
      {id:"e_box12", type:"extension", icon:"⬆", title:"그림 더하기", content:"\"각 면에 어울리는 그림을 더해 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"책 소개 상자에 무엇을 담죠?\" 제목·내용·생각을 짚어요.", fit_slides:["summary"]},
      {id:"e_share12", type:"extension", icon:"⬆", title:"소개 예고", content:"\"다음엔 책 소개 상자로 소개해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 중요한 내용 정리 ② (소개·나누기) ---------------- */
  window.LESSONS["u6_l13"] = {
    meta: {grade:2, subject:"국어", unit:6, n:13, title:"중요한 내용을 정리해요 ② (실천)", std:"[2국06-02] · [2국05-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 책 소개하기 → 소개·듣기 약속 → 좋은 소개 모으기 → 책 소개·나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"중요한 내용을 정리해요", subtitle:"6단원 · 13/15차시 · 실천"}, suggested_extras:["q_ready13","t_share13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["책 소개 상자로 책을 소개해요","친구 소개를 잘 들어요","읽고 싶은 책을 골라봐요"]}, suggested_extras:["t_share13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"내 책을 소개해요 📢", visual:"📢", question:"만든 책 소개 상자로 친구들에게 책을 소개해요.<br>어떻게 소개하면 친구가 그 책을 읽고 싶어질까요?"}, suggested_extras:["q_how13","r_share13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"책 소개하고 듣기", content:"책을 소개할 땐 **제목·중요한 내용**을 알려 주고, **왜 추천하는지** 까닭을 말해요. 들을 땐 친구 소개를 **잘 듣고** 궁금한 점을 물어봐요. 좋은 소개는 친구가 책을 읽고 싶게 만들어요!", symbol_meanings:[{symbol:"제목·내용", meaning:"무엇에 대한 책인지"},{symbol:"추천 까닭", meaning:"왜 좋은지"},{symbol:"바른 듣기", meaning:"친구 소개를 잘 들어요"},{symbol:"질문하기", meaning:"궁금한 점을 물어요"}]}, suggested_extras:["t_share13b","x_share13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 책 소개는? ✅", sub:"좋은 책 소개의 모습을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"책을 소개할 때는?", emoji:"📕", name:"제목·중요한 내용을 알려 줘요"},{clue:"추천할 때는?", emoji:"💗", name:"왜 좋은지 까닭을 말해요"},{clue:"친구가 소개할 때는?", emoji:"👂", name:"잘 듣고 궁금한 점을 물어요"}], outro:"중요한 내용과 까닭을 담아 소개하면 멋져요. 소개해 볼까요? 😊"}, suggested_extras:["q_good13","g_share13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"책을 소개해요 🎤", sub:"버튼을 눌러 소개할 친구를 뽑아요. 책 소개 상자로 책을 소개하고 친구 소개도 들어요!", count:24, hint:"\u201c제가 소개할 책은 ~입니다. 추천하는 까닭은…\u201d 처럼 소개해요", end_msg:"모두 멋지게 책을 소개했어요. 읽고 싶은 책이 많아졌어요! 👏"}, suggested_extras:["t_present13","e_share13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["책 소개 상자로 책을 소개했어요","친구 소개를 잘 들었어요","읽고 싶은 책을 골랐어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 단원에서 배운 것을 스스로 돌아보고 정리해 볼 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_ready13", type:"fun_question", icon:"💡", title:"소개 마음", content:"\"내 책을 소개하는 마음은 어떤가요?\" 발표를 편하게 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_share13", type:"tip", icon:"🧩", title:"추천 까닭", content:"책을 추천하는 까닭을 꼭 담게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_how13", type:"fun_question", icon:"📢", title:"읽고 싶게", content:"\"어떻게 소개하면 친구가 책을 읽고 싶어질까요?\" 소개를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_share13", type:"real_world", icon:"🌍", title:"책 추천 받기", content:"친구가 추천한 책을 읽어 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_share13b", type:"tip", icon:"🧩", title:"소개와 질문", content:"소개 뒤 궁금한 점을 묻고 답하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_share13", type:"misconception", icon:"❓", title:"줄거리만 X", content:"줄거리만 길게 말하지 말고 중요한 내용과 까닭을 담게 하세요.", fit_slides:["concept"]},
      {id:"q_good13", type:"fun_question", icon:"💡", title:"좋은 소개는?", content:"\"좋은 책 소개에는 무엇이 들어가죠?\" 내용·까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_share13", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 모습 짝짓기", description:"소개 상황과 바른 모습을 짝지어 보세요.", hint:"좋은 소개를 생각해요.", pairs:[{a:{text:"📕 소개"},b:{text:"제목·중요한 내용"}},{a:{text:"💗 추천"},b:{text:"까닭 말하기"}},{a:{text:"👂 듣기"},b:{text:"질문하기"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"까닭과 함께", content:"추천 까닭을 꼭 담아 소개하게 하세요.", fit_slides:["present"]},
      {id:"e_share13", type:"extension", icon:"⬆", title:"읽고 싶은 책", content:"\"친구 소개 중 읽고 싶어진 책이 있나요?\" 나눔을 이어요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"책을 어떻게 소개했죠?\" 내용·까닭을 짚어요.", fit_slides:["summary"]},
      {id:"e_wrap13", type:"extension", icon:"⬆", title:"마무리 예고", content:"\"다음엔 단원을 마무리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 14차시: 마무리하기 ① (스스로 확인) ---------------- */
  window.LESSONS["u6_l14"] = {
    meta: {grade:2, subject:"국어", unit:6, n:14, title:"마무리하기 ① — 스스로 확인", std:"[2국02-03] · [2국05-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 단원 돌아보기 → 중요한 내용·생각 표현 정리 → 확인 퀴즈 → 스스로 확인"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ① — 스스로 확인", subtitle:"6단원 · 14/15차시 · 마무리"}, suggested_extras:["q_back14","t_wrap14"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["단원에서 배운 것을 돌아봐요","중요한 내용·생각 표현을 정리해요","배운 내용을 스스로 확인해요"]}, suggested_extras:["t_wrap14"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"6단원에서 무엇을 배웠나요? 🎀", visual:"💭", question:"중요한 내용을 찾고, 인물 생각을 짐작하고, 자신의 생각을 표현했어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"중요한 내용·생각 표현 정리", content:"이 단원에서 **중요한 내용 찾기**(제목·낱말·중심 문장)와 **인물의 생각·까닭 파악**, 그리고 **자신의 생각을 까닭과 함께 표현**하는 법을 배웠어요. 매체로 정보를 찾고 생각을 나눠요!", symbol_meanings:[{symbol:"중요한 내용", meaning:"제목·낱말·중심 문장"},{symbol:"인물 생각", meaning:"말에서 짐작"},{symbol:"생각의 까닭", meaning:"\"~니까\"에서"},{symbol:"내 생각 표현", meaning:"까닭과 함께"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"중요한 내용을 찾으려면?", emoji:"🔍", name:"제목·자주 나오는 낱말·중심 문장을 봐요"},{clue:"인물의 생각은 어디서 찾나요?", emoji:"🦊", name:"인물의 말에서 짐작해요"},{clue:"내 생각을 말할 때는?", emoji:"💗", name:"까닭을 함께 밝혀요"}], outro:"배운 것을 잘 기억하고 있어요. 글을 읽고 생각을 표현해 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["글에서 중요한 내용을 찾을 수 있나요?","인물의 생각과 까닭을 알 수 있나요?","내 생각을 까닭과 함께 표현할 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","중요한 내용·생각 표현을 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 토박이말을 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"세 갈래 정리", content:"중요한 내용 찾기·인물 생각 파악·자신의 생각 표현을 함께 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"💭", title:"기억에 남는 활동", content:"\"중요한 내용 찾기·생각 표현·책 소개 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"생활 속 적용", content:"글을 읽고 중요한 내용을 정리한 경험을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"핵심 정리", content:"중요한 내용 찾기 방법과 생각 표현 틀을 다시 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"까닭은 꼭", content:"생각을 표현할 때 까닭을 꼭 밝힘을 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"🔍 중요한 내용"},b:{text:"제목·중심 문장"}},{a:{text:"🦊 인물 생각"},b:{text:"말에서 짐작"}},{a:{text:"💗 내 생각"},b:{text:"까닭과 함께"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"더 연습하고 싶은 한 가지를 정해 볼까요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 중요한 내용·생각 표현을 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 토박이말과 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·토박이말·글씨) ---------------- */
  window.LESSONS["u6_l15"] = {
    meta: {grade:2, subject:"국어", unit:6, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국02-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 토박이말 → 뜻 알기 → 토박이말↔뜻 잇기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"6단원 · 15/15차시 · 마무리"}, suggested_extras:["q_word","t_word"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["토박이말을 알아봐요","토박이말의 뜻을 알아봐요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_word"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"예쁜 우리말 🌼", visual:"🌼", question:"\"볼우물\"은 웃을 때 볼에 생기는 옴폭한 곳이에요.<br>이렇게 예쁜 우리말을 토박이말이라고 해요. 또 어떤 말이 있을까요?"}, suggested_extras:["q_word2","r_word"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"토박이말", content:"토박이말은 **예부터 써 온 우리말**이에요. \"볼우물\"(보조개), \"까치밥\"(새 먹으라 남긴 감), \"여우비\"(맑은 날 잠깐 오는 비), \"벗\"(친구)처럼요. 뜻을 알면 우리말이 더 정겹게 느껴져요!", symbol_meanings:[{symbol:"볼우물", meaning:"웃을 때 볼의 옴폭한 곳"},{symbol:"까치밥", meaning:"새 먹으라 남긴 열매"},{symbol:"여우비", meaning:"맑은 날 잠깐 오는 비"},{symbol:"벗", meaning:"가까운 친구"}]}, suggested_extras:["t_word2","x_word"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 토박이말의 뜻은? 🌼", sub:"토박이말의 뜻을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"여우비\"는?", emoji:"🌦️", name:"맑은 날 잠깐 내리는 비"},{clue:"\"까치밥\"은?", emoji:"🐦", name:"새 먹으라 남겨 둔 열매"},{clue:"\"벗\"은?", emoji:"🤝", name:"가까운 친구"}], outro:"토박이말의 뜻을 아니 우리말이 더 정겨워요. 이제 글씨도 써 볼까요? 😊"}, suggested_extras:["q_mean","g_word"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **생각 · 까닭 · 토박이말**을 바르게 써 보세요!", symbol_meanings:[{symbol:"생각", meaning:"또박또박 칸에 맞춰"},{symbol:"까닭", meaning:"바른 자세로"},{symbol:"토박이말", meaning:"천천히 정성껏"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"6단원에서 배운 것", points:["글에서 중요한 내용을 찾았어요","인물 생각과 자신의 생각을 표현했어요","토박이말을 알고 글씨를 썼어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"자신의 생각을 표현해요!", body:"6단원을 모두 마쳤어요. 앞으로도 중요한 내용을 찾고 자신의 생각을 까닭과 함께 표현해 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_word", type:"fun_question", icon:"💡", title:"예쁜 우리말", content:"\"마음에 드는 우리말이 있나요?\" 토박이말을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_word", type:"tip", icon:"🧩", title:"토박이말", content:"토박이말은 예부터 써 온 우리말임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_word2", type:"fun_question", icon:"🌼", title:"또 어떤 말?", content:"\"또 어떤 예쁜 우리말이 있을까요?\" 어휘를 넓혀요.", fit_slides:["motivate"]},
      {id:"r_word", type:"real_world", icon:"🌍", title:"우리말 찾기", content:"생활에서 쓰는 정겨운 우리말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_word2", type:"tip", icon:"🧩", title:"뜻 알기", content:"토박이말의 뜻을 알면 더 정겹게 느껴짐을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_word", type:"misconception", icon:"❓", title:"뜻과 함께", content:"낱말만 외우지 말고 뜻과 함께 익히게 하세요.", fit_slides:["concept"]},
      {id:"q_mean", type:"fun_question", icon:"💡", title:"무슨 뜻일까", content:"\"이 토박이말은 무슨 뜻일까요?\" 뜻을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_word", type:"game", game_kind:"memory_match", icon:"🎮", title:"토박이말 ↔ 뜻 짝짓기", description:"토박이말과 뜻을 짝지어 보세요.", hint:"무슨 뜻인지 떠올려요.", pairs:[{a:{text:"🌦️ 여우비"},b:{text:"맑은 날 잠깐 비"}},{a:{text:"🐦 까치밥"},b:{text:"새 먹으라 남긴 열매"}},{a:{text:"🤝 벗"},b:{text:"가까운 친구"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"바른 글씨", content:"네모 칸의 자형을 살펴 또박또박 쓰게 하고, 어려워하면 천천히 따라 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"토박이말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"6단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"생각 표현하기", content:"\"오늘 읽은 책에 대한 내 생각을 까닭과 함께 말해 볼까요?\" 실천으로 이어요.", fit_slides:["next_lesson"]}
    ]
  };


})();
