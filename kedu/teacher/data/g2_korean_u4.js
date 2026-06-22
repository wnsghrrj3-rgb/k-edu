/* ============================================================================
   2학년 1학기 국어 4단원 「분위기를 살려 읽어요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 112~143 / 15차시.
   - 단원 목표: 말과 글을 바르고 재미있게 사용하기. 역량 비판적·창의적 사고(언어 사용 관찰).
   - 성취기준 [2국04-02](소리≠표기·바르게 읽고 쓰기)·[2국05-01](낭송·말의 재미)·[2국02-02](알맞게 띄어 읽기).
   ★ 저작권: 지도서 제재(「설문대 할망」·「쓰레기가 모여 있다고?」·수록 시) 전부 미게재.
      겹받침 낱말(닭·값·흙·앉다·많다·읽다·짧다·넓다·맑다·여덟·몫)은 표준 발음으로 자체 구성.
      짧은 시는 보편 소재(공놀이·달밤·빗방울)로 전부 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 소리와 표기가 다를 때 ---------------- */
  window.LESSONS["u4_l01"] = {
    meta: {grade:2, subject:"국어", unit:4, n:1, title:"단원 도입 — 분위기를 살려 읽어요", std:"[2국04-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 소리와 글자가 다른 낱말 → 겹받침이란 → 바른 소리 고르기 → 겹받침 낱말 찾기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽어요", subtitle:"4단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["소리와 글자가 다른 낱말을 알아봐요","겹받침이 무엇인지 알아봐요","겹받침 낱말을 바르게 읽어 봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"\"닭\"은 어떻게 읽을까? 🐔", visual:"🐔", question:"'닭'은 글자에 받침이 둘인데, 소리는 [닥]이에요.<br>글자와 소리가 왜 다를까요?"}, suggested_extras:["q_sound","r_life"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침과 소리", content:"받침에 글자가 **두 개** 들어간 것을 **겹받침**이라고 해요. 겹받침은 쓸 때는 **두 글자 모두** 쓰지만, 읽을 땐 **둘 중 한 소리**만 나요. \"닭[닥]\" \"값[갑]\"처럼요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"ㄺ은 [ㄱ] 소리"},{symbol:"값 → [갑]", meaning:"ㅄ은 [ㅂ] 소리"},{symbol:"쓸 때", meaning:"두 글자 모두 써요"},{symbol:"읽을 때", meaning:"한 소리만 나요"}]}, suggested_extras:["t_concept","x_write"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽은 것은? 🔊", sub:"겹받침 낱말을 바르게 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"'닭'은 어떻게 읽을까요?", emoji:"🐔", name:"[닥]"},{clue:"'값'은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"},{clue:"'흙'은 어떻게 읽을까요?", emoji:"🟤", name:"[흑]"}], outro:"겹받침은 소리가 하나예요. 글자와 소리가 다른 게 신기하죠? 😊"}, suggested_extras:["q_pick","g_sound"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 찾아요", question:"겹받침이 들어간 낱말을 떠올려 볼까요?", items:["받침에 글자가 두 개인 낱말을 아나요?","'닭·값·흙' 말고 또 어떤 낱말이 있을까요?","그 낱말은 어떻게 읽을까요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["소리와 글자가 다를 수 있음을 알았어요","겹받침이 무엇인지 알았어요","겹받침 낱말을 바르게 읽어 봤어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽으면 좋은 점", body:"다음 시간에는 시를 분위기에 맞게 읽으면 무엇이 좋은지 알아볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"신기한 낱말", content:"\"글자랑 소리가 다른 낱말을 본 적 있나요?\" 겹받침을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '겹받침 바르게 읽고 쓰기 + 시를 분위기에 맞게 읽기'예요. 도입에선 소리≠표기를 느끼게 하세요.", fit_slides:["objective","cover"]},
      {id:"q_sound", type:"fun_question", icon:"🐔", title:"왜 다를까", content:"\"왜 글자와 소리가 다를까요?\" 호기심을 열어요.", fit_slides:["motivate"]},
      {id:"r_life", type:"real_world", icon:"🌍", title:"둘레의 겹받침", content:"닭·흙·값 등 생활 속 겹받침 낱말과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"소리는 하나", content:"겹받침은 쓸 때 두 글자, 읽을 때 한 소리임을 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_write", type:"misconception", icon:"❓", title:"쓸 땐 두 글자", content:"소리가 하나라고 받침을 하나만 쓰면 안 돼요. 쓸 땐 두 글자 모두 씀을 강조하세요.", fit_slides:["concept"]},
      {id:"q_pick", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"겹받침 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sound", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"어떤 소리가 나는지 떠올려요.", pairs:[{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"함께 찾기", content:"겹받침 낱말을 함께 떠올리며 바른 소리를 말해 보게 하세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"더 찾기", content:"\"책에서 겹받침 낱말을 찾아볼까요?\" 어휘를 넓혀요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 어떻게 읽죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시를 분위기에 맞게 읽으면 좋은 점을 알아봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 분위기를 살려 읽으면 좋은 점 (준비) ---------------- */
  window.LESSONS["u4_l02"] = {
    meta: {grade:2, subject:"국어", unit:4, n:2, title:"분위기를 살려 읽으면 좋은 점", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 같은 시 다른 느낌 → 분위기란 → 분위기 느낌 고르기 → 좋아하는 시 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽으면 좋은 점", subtitle:"4단원 · 2/15차시 · 준비"}, suggested_extras:["q_mood2","t_mood2"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시의 분위기가 무엇인지 알아봐요","분위기를 살려 읽으면 좋은 점을 알아봐요","좋아하는 시를 떠올려요"]}, suggested_extras:["t_mood2"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"같은 시, 다른 느낌 🎭", visual:"🎵", question:"신나는 시를 작고 느리게 읽으면 어떨까요?<br>분위기에 맞게 읽으면 무엇이 달라질까요?"}, suggested_extras:["q_feel2","r_mood2"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 살려 읽기", content:"시마다 **분위기**가 있어요. 신나는 시, 조용한 시, 포근한 시처럼요. 분위기에 맞게 **목소리·빠르기**를 조절해 읽으면 시의 느낌이 더 잘 살아나고 **재미있게** 들려요!", symbol_meanings:[{symbol:"신나는 분위기", meaning:"밝고 빠르게"},{symbol:"조용한 분위기", meaning:"작고 천천히"},{symbol:"포근한 분위기", meaning:"부드럽고 따뜻하게"},{symbol:"분위기에 맞게", meaning:"느낌이 잘 살아요"}]}, suggested_extras:["t_mood2b","x_same2"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기일까요? 🎭", sub:"시의 느낌을 보고 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 공이 콩콩 뛰어요\"", emoji:"⚽", name:"신나는 분위기"},{clue:"\"달님이 살며시 창가에 앉아요\"", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"빗방울이 토독토독 떨어져요\"", emoji:"🌧️", name:"맑고 경쾌한 분위기"}], outro:"시마다 분위기가 달라요. 분위기에 맞게 읽으면 더 재미있어요! 😊"}, suggested_extras:["q_mood2c","g_mood2"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"좋아하는 시를 떠올려요", question:"좋아하거나 들어 본 시·노래가 있나요?", items:["기억에 남는 시나 노래가 있나요?","그 시는 어떤 분위기였나요?","왜 그 시가 좋았나요?"]}, suggested_extras:["t_present2","e_poem2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시의 분위기가 무엇인지 알았어요","분위기를 살려 읽으면 좋은 점을 알았어요","좋아하는 시를 떠올렸어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 읽고 써요", body:"다음 시간에는 겹받침이 있는 낱말을 바르게 읽고 쓰는 법을 배워 볼 거예요!"}, suggested_extras:["e_double2"]}
    ],
    extras: [
      {id:"q_mood2", type:"fun_question", icon:"💡", title:"시의 느낌", content:"\"시를 읽으면 어떤 느낌이 들 때가 있나요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood2", type:"tip", icon:"🧩", title:"분위기란", content:"분위기는 시에서 느껴지는 전체 느낌임을 쉽게 설명해 주세요.", fit_slides:["objective","concept"]},
      {id:"q_feel2", type:"fun_question", icon:"🎵", title:"안 어울리면", content:"\"분위기와 안 맞게 읽으면 어떨까요?\" 분위기의 중요성을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_mood2", type:"real_world", icon:"🌍", title:"노래 분위기", content:"신나는 노래·잔잔한 노래의 느낌 차이와 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_mood2b", type:"tip", icon:"🧩", title:"목소리 조절", content:"분위기에 따라 목소리·빠르기를 조절함을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_same2", type:"misconception", icon:"❓", title:"한 가지로만 X", content:"모든 시를 같은 목소리로 읽지 말고 분위기에 맞게 바꿔 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_mood2c", type:"fun_question", icon:"💡", title:"왜 그 분위기?", content:"\"왜 그런 분위기로 느껴질까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_mood2", type:"game", game_kind:"memory_match", icon:"🎮", title:"시 ↔ 분위기 짝짓기", description:"시 구절과 분위기를 짝지어 보세요.", hint:"느낌을 떠올려요.", pairs:[{a:{text:"⚽ 통통 공이"},b:{text:"신나는"}},{a:{text:"🌙 달님이 살며시"},b:{text:"포근한"}},{a:{text:"🌧️ 토독토독"},b:{text:"경쾌한"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"자유롭게", content:"좋아하는 시·노래를 자유롭게 떠올려 말하게 하세요.", fit_slides:["question"]},
      {id:"e_poem2", type:"extension", icon:"⬆", title:"분위기 말하기", content:"\"그 시의 분위기를 한 낱말로 말한다면?\" 분위기를 표현해요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살려 읽으면 무엇이 좋죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_double2", type:"extension", icon:"⬆", title:"겹받침 예고", content:"\"다음엔 겹받침 낱말을 읽고 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 겹받침 낱말 읽고 쓰기 ① (ㄺ) ---------------- */
  window.LESSONS["u4_l03"] = {
    meta: {grade:2, subject:"국어", unit:4, n:3, title:"겹받침 낱말을 읽고 써요 ① (ㄺ)", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄺ 받침 → 소리는 [ㄱ] → 바른 소리 고르기 → ㄺ 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요 (ㄺ)", subtitle:"4단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_rg","t_rg"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㄺ 받침이 있는 낱말을 알아봐요","ㄺ을 바르게 읽어 봐요","ㄺ 낱말을 바르게 써요"]}, suggested_extras:["t_rg"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"\"읽다\"는 어떻게 읽을까? 📖", visual:"📖", question:"'읽다'에는 ㄺ 받침이 있어요.<br>이 낱말은 어떤 소리로 읽을까요?"}, suggested_extras:["q_read","r_rg"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"ㄺ 받침의 소리", content:"ㄺ 받침은 보통 **[ㄱ]** 소리가 나요. \"읽다[익따]\" \"맑다[막따]\" \"닭[닥]\"처럼요. 쓸 때는 **ㄹ과 ㄱ 두 글자** 모두 쓰지만, 읽을 땐 [ㄱ] 소리로 읽어요!", symbol_meanings:[{symbol:"읽다 → [익따]", meaning:"ㄺ → [ㄱ]"},{symbol:"맑다 → [막따]", meaning:"ㄺ → [ㄱ]"},{symbol:"닭 → [닥]", meaning:"ㄺ → [ㄱ]"},{symbol:"흙 → [흑]", meaning:"ㄺ → [ㄱ]"}]}, suggested_extras:["t_rg2","x_rg"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽은 것은? 🔊", sub:"ㄺ 받침 낱말을 바르게 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"'맑다'는 어떻게 읽을까요?", emoji:"☀️", name:"[막따]"},{clue:"'읽다'는 어떻게 읽을까요?", emoji:"📖", name:"[익따]"},{clue:"'흙'은 어떻게 읽을까요?", emoji:"🟤", name:"[흑]"}], outro:"ㄺ은 [ㄱ] 소리예요. 이제 또박또박 써 볼까요? 😊"}, suggested_extras:["q_pick3","g_rg"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"ㄺ 낱말을 바르게 써요 ✍️", content:"ㄺ 받침 낱말을 **또박또박** 써 봐요. 소리는 [ㄱ]이지만 쓸 때는 **ㄹ과 ㄱ 모두** 써야 해요. **닭 · 흙 · 맑다**를 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"ㄹ+ㄱ 받침"},{symbol:"흙", meaning:"ㄹ+ㄱ 받침"},{symbol:"맑다", meaning:"ㄹ+ㄱ 받침"}]}, suggested_extras:["t_trace3","e_more3"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㄺ 받침이 있는 낱말을 알았어요","ㄺ을 [ㄱ]으로 바르게 읽었어요","ㄺ 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"다른 겹받침도 읽고 써요", body:"다음 시간에는 ㄵ·ㄼ 같은 다른 겹받침 낱말을 읽고 써 볼 거예요!"}, suggested_extras:["e_more3b"]}
    ],
    extras: [
      {id:"q_rg", type:"fun_question", icon:"💡", title:"ㄺ 낱말", content:"\"ㄹ과 ㄱ이 받침에 함께 있는 낱말을 본 적 있나요?\" ㄺ을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_rg", type:"tip", icon:"🧩", title:"소리는 하나", content:"ㄺ은 보통 [ㄱ] 소리임을 여러 낱말로 익히게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_read", type:"fun_question", icon:"📖", title:"어떻게 읽을까", content:"\"'읽다'를 소리 내어 읽어 볼까요?\" 바른 소리를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_rg", type:"real_world", icon:"🌍", title:"둘레의 ㄺ", content:"닭·흙처럼 자주 쓰는 ㄺ 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_rg2", type:"tip", icon:"🧩", title:"쓸 땐 두 글자", content:"소리는 [ㄱ]이지만 쓸 때는 ㄹ과 ㄱ 모두 씀을 강조하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_rg", type:"misconception", icon:"❓", title:"받침 빠뜨리기", content:"'닥'처럼 받침을 하나만 쓰지 않게, '닭'으로 두 글자 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_pick3", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"ㄺ 받침 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_rg", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"ㄺ 낱말과 소리를 짝지어 보세요.", hint:"[ㄱ] 소리를 떠올려요.", pairs:[{a:{text:"☀️ 맑다"},b:{text:"[막따]"}},{a:{text:"📖 읽다"},b:{text:"[익따]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace3", type:"tip", icon:"✍️", title:"또박또박", content:"받침 두 글자를 빠뜨리지 않게 또박또박 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more3", type:"extension", icon:"⬆", title:"문장으로", content:"\"'맑다'로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"ㄺ은 어떤 소리가 나죠?\" [ㄱ]을 짚어요.", fit_slides:["summary"]},
      {id:"e_more3b", type:"extension", icon:"⬆", title:"다른 겹받침 예고", content:"\"다음엔 ㄵ·ㄼ을 읽고 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 겹받침 낱말 읽고 쓰기 ② (ㄵ·ㄼ) ---------------- */
  window.LESSONS["u4_l04"] = {
    meta: {grade:2, subject:"국어", unit:4, n:4, title:"겹받침 낱말을 읽고 써요 ② (ㄵ·ㄼ)", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄵ·ㄼ 받침 → 각 소리 → 바르게 쓴 낱말 찾기 → 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요 (ㄵ·ㄼ)", subtitle:"4단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_nj4"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㄵ·ㄼ 받침이 있는 낱말을 알아봐요","각각 어떤 소리가 나는지 알아봐요","바르게 읽고 써요"]}, suggested_extras:["t_nj4"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"\"앉다\"는 어떻게 읽을까? 🪑", visual:"🪑", question:"'앉다'에는 ㄵ 받침이 있어요.<br>이 낱말은 [안따]로 읽어요. 신기하죠?"}, suggested_extras:["q_sit4","r_nj4"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"ㄵ·ㄼ 받침의 소리", content:"**ㄵ** 받침은 보통 **[ㄴ]** 소리가 나요. \"앉다[안따]\" \"많다[만타]\". **ㄼ** 받침은 보통 **[ㄹ]** 소리가 나요. \"넓다[널따]\" \"여덟[여덜]\". 쓸 때는 두 글자 모두 써요!", symbol_meanings:[{symbol:"앉다 → [안따]", meaning:"ㄵ → [ㄴ]"},{symbol:"많다 → [만타]", meaning:"ㄵ → [ㄴ]"},{symbol:"넓다 → [널따]", meaning:"ㄼ → [ㄹ]"},{symbol:"여덟 → [여덜]", meaning:"ㄼ → [ㄹ]"}]}, suggested_extras:["t_nj4b","x_nj4"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 쓴 낱말은? ✍️", sub:"겹받침을 바르게 쓴 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"[안따]로 소리 나는 낱말의 바른 표기는?", emoji:"🪑", name:"앉다 (ㄴ+ㅈ 받침)"},{clue:"[널따]로 소리 나는 낱말의 바른 표기는?", emoji:"📏", name:"넓다 (ㄹ+ㅂ 받침)"},{clue:"[여덜]로 소리 나는 낱말의 바른 표기는?", emoji:"8️⃣", name:"여덟 (ㄹ+ㅂ 받침)"}], outro:"소리와 글자가 달라도 바르게 쓸 수 있어요. 따라 써 볼까요? 😊"}, suggested_extras:["q_pick4","g_nj4"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"ㄵ·ㄼ 낱말을 바르게 써요 ✍️", content:"소리만 듣고 받침을 한 글자로 쓰면 안 돼요. **앉다 · 많다 · 넓다**를 받침 두 글자를 모두 살려 또박또박 써 보세요!", symbol_meanings:[{symbol:"앉다", meaning:"ㄴ+ㅈ 받침"},{symbol:"많다", meaning:"ㄴ+ㅎ 받침"},{symbol:"넓다", meaning:"ㄹ+ㅂ 받침"}]}, suggested_extras:["t_trace4","e_more4"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㄵ·ㄼ 받침 낱말을 알았어요","각각의 소리를 알았어요","바르게 읽고 썼어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 정리해요", body:"다음 시간에는 배운 겹받침 낱말을 정리하고 더 익혀 볼 거예요!"}, suggested_extras:["e_sort4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 ㄺ", content:"\"지난 시간 ㄺ은 어떤 소리였죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_nj4", type:"tip", icon:"🧩", title:"받침마다 소리", content:"겹받침마다 나는 소리가 다름을 짚어 주세요(ㄵ→ㄴ, ㄼ→ㄹ).", fit_slides:["objective","concept"]},
      {id:"q_sit4", type:"fun_question", icon:"🪑", title:"어떻게 읽을까", content:"\"'앉다'를 소리 내어 읽어 볼까요?\" 바른 소리를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_nj4", type:"real_world", icon:"🌍", title:"둘레의 겹받침", content:"앉다·많다·넓다처럼 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_nj4b", type:"tip", icon:"🧩", title:"두 가지 받침", content:"ㄵ은 [ㄴ], ㄼ은 [ㄹ] 소리임을 구분해 익히게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_nj4", type:"misconception", icon:"❓", title:"받침 빠뜨리기", content:"'안따'처럼 소리대로 쓰지 말고 '앉다'로 두 글자 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_pick4", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"ㄵ·ㄼ 받침 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_nj4", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"ㄵ·ㄼ 낱말과 소리를 짝지어 보세요.", hint:"ㄵ→ㄴ, ㄼ→ㄹ을 떠올려요.", pairs:[{a:{text:"🪑 앉다"},b:{text:"[안따]"}},{a:{text:"📏 넓다"},b:{text:"[널따]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace4", type:"tip", icon:"✍️", title:"또박또박", content:"받침 두 글자를 빠뜨리지 않게 또박또박 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more4", type:"extension", icon:"⬆", title:"문장으로", content:"\"'넓다'로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"ㄵ과 ㄼ은 각각 어떤 소리죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_sort4", type:"extension", icon:"⬆", title:"정리 예고", content:"\"다음엔 겹받침 낱말을 정리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 겹받침 낱말 읽고 쓰기 ③ (정리) ---------------- */
  window.LESSONS["u4_l05"] = {
    meta: {grade:2, subject:"국어", unit:4, n:5, title:"겹받침 낱말을 읽고 써요 ③ (정리)", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 모아 보기 → 받침별 소리 정리 → 낱말↔소리 잇기 → 겹받침 낱말 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요 (정리)", subtitle:"4단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_sort5","t_sort5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["배운 겹받침을 모아 봐요","받침마다 나는 소리를 정리해요","겹받침 낱말을 바르게 읽고 써요"]}, suggested_extras:["t_sort5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 한눈에! 👀", visual:"🔤", question:"ㄺ·ㄵ·ㄼ을 배웠어요.<br>각각 어떤 소리가 났는지 기억나나요?"}, suggested_extras:["q_recall5","r_sort5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 소리 정리", content:"지금까지 배운 겹받침을 정리하면, **ㄺ → [ㄱ]**(닭·맑다), **ㄵ → [ㄴ]**(앉다·많다), **ㄼ → [ㄹ]**(넓다·여덟)이에요. 소리는 하나, **쓸 때는 두 글자**! 이것만 기억하면 돼요.", symbol_meanings:[{symbol:"ㄺ → [ㄱ]", meaning:"닭·맑다·읽다"},{symbol:"ㄵ → [ㄴ]", meaning:"앉다·많다"},{symbol:"ㄼ → [ㄹ]", meaning:"넓다·여덟"},{symbol:"쓸 때 두 글자", meaning:"받침 모두 살려요"}]}, suggested_extras:["t_sort5b","x_sort5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낱말과 소리를 이어요 🔗", sub:"겹받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"'몫'은 어떻게 읽을까요?", emoji:"🍰", name:"[목]"},{clue:"'짧다'는 어떻게 읽을까요?", emoji:"📏", name:"[짤따]"},{clue:"'많다'는 어떻게 읽을까요?", emoji:"➕", name:"[만타]"}], outro:"겹받침 소리를 잘 알고 있어요. 이제 또박또박 써 볼까요? 😊"}, suggested_extras:["q_sort5c","g_sort5"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 바르게 써요 ✍️", content:"배운 겹받침 낱말을 모아 또박또박 써 봐요. **닭 · 앉다 · 넓다**처럼 받침 두 글자를 모두 살려 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"ㄹ+ㄱ 받침"},{symbol:"앉다", meaning:"ㄴ+ㅈ 받침"},{symbol:"넓다", meaning:"ㄹ+ㅂ 받침"}]}, suggested_extras:["t_trace5","e_more5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["배운 겹받침을 모아 봤어요","받침마다 나는 소리를 정리했어요","겹받침 낱말을 바르게 읽고 썼어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글에서 겹받침을 찾아요", body:"다음 시간에는 글을 읽으며 겹받침 낱말을 찾아 바르게 읽어 볼 거예요!"}, suggested_extras:["e_read5"]}
    ],
    extras: [
      {id:"q_sort5", type:"fun_question", icon:"💡", title:"기억나는 겹받침", content:"\"지금까지 배운 겹받침 중 기억나는 것을 말해 볼까요?\" 복습을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_sort5", type:"tip", icon:"🧩", title:"한눈에 정리", content:"ㄺ·ㄵ·ㄼ의 소리를 표처럼 한눈에 정리해 주면 좋아요.", fit_slides:["objective","concept"]},
      {id:"q_recall5", type:"fun_question", icon:"🔤", title:"어떤 소리였지", content:"\"ㄺ·ㄵ·ㄼ은 각각 어떤 소리였나요?\" 배움을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_sort5", type:"real_world", icon:"🌍", title:"낱말 모으기", content:"교실·책에서 겹받침 낱말을 찾아 모은 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_sort5b", type:"tip", icon:"🧩", title:"규칙 기억", content:"'소리는 하나, 쓸 때는 두 글자' 규칙을 거듭 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_sort5", type:"misconception", icon:"❓", title:"예외도 있어요", content:"겹받침엔 예외도 있으니, 자주 쓰는 낱말 중심으로 익히게 하세요.", fit_slides:["concept"]},
      {id:"q_sort5c", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"이 받침을 가진 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sort5", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침의 소리를 떠올려요.", pairs:[{a:{text:"🍰 몫"},b:{text:"[목]"}},{a:{text:"📏 짧다"},b:{text:"[짤따]"}},{a:{text:"➕ 많다"},b:{text:"[만타]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace5", type:"tip", icon:"✍️", title:"또박또박", content:"받침 두 글자를 모두 살려 또박또박 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more5", type:"extension", icon:"⬆", title:"낱말 카드", content:"\"겹받침 낱말 카드를 만들어 볼까요?\" 어휘를 정리해요.", fit_slides:["concept"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침의 규칙은 무엇이죠?\" 소리 하나·두 글자를 짚어요.", fit_slides:["summary"]},
      {id:"e_read5", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 글에서 겹받침을 찾아 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 글에서 겹받침 낱말 찾기 ① ---------------- */
  window.LESSONS["u4_l06"] = {
    meta: {grade:2, subject:"국어", unit:4, n:6, title:"글에서 겹받침 낱말을 찾아요 ①", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 글 속 겹받침 → 바르게 읽기 → 글에서 겹받침 모두 찾기 → 바르게 읽어 보기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"글에서 겹받침 낱말을 찾아요", subtitle:"4단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_find6","t_find6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글에서 겹받침 낱말을 찾아요","찾은 낱말을 바르게 읽어요","글의 내용을 이해해요"]}, suggested_extras:["t_find6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글 속에 숨은 겹받침 🔍", visual:"📄", question:"\"맑은 하늘 아래 닭이 흙을 밟고 걷는다.\"<br>이 문장에 겹받침 낱말이 몇 개 있을까요?"}, suggested_extras:["q_hide6","r_find6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글에서 겹받침 찾아 읽기", content:"글을 읽을 땐 겹받침 낱말을 **찾아 바르게** 읽어요. \"맑은[말근]\" \"닭이[달기]\" \"밟고[밥꼬]\"처럼 받침 뒤에 모음이 오면 소리가 달라지기도 해요. 천천히 살펴 읽으면 돼요!", symbol_meanings:[{symbol:"맑은 → [말근]", meaning:"뒤에 모음이 오면"},{symbol:"닭이 → [달기]", meaning:"받침이 넘어가요"},{symbol:"흙을 → [흘글]", meaning:"받침이 넘어가요"},{symbol:"천천히 읽기", meaning:"살펴서 바르게"}]}, suggested_extras:["t_find6b","x_find6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 낱말, 바르게 읽으면? 🔊", sub:"글 속 겹받침 낱말을 바르게 읽어 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 하늘\"의 '맑은'은?", emoji:"☀️", name:"[말근]"},{clue:"\"닭이 운다\"의 '닭이'는?", emoji:"🐔", name:"[달기]"},{clue:"\"흙을 밟다\"의 '흙을'은?", emoji:"🟤", name:"[흘글]"}], outro:"받침 뒤에 모음이 오면 소리가 넘어가요. 글에서 더 찾아볼까요? 😊"}, suggested_extras:["q_more6","g_find6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"글에서 겹받침을 찾아 읽어요", question:"짧은 글에서 겹받침 낱말을 찾아 읽어 볼까요?", items:["어떤 겹받침 낱말을 찾았나요?","그 낱말을 어떻게 읽나요?","글의 내용은 무엇인가요?"]}, suggested_extras:["t_present6","e_find6b"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글에서 겹받침 낱말을 찾았어요","찾은 낱말을 바르게 읽었어요","글의 내용을 이해했어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글을 알맞게 띄어 읽어요", body:"다음 시간에는 겹받침에 주의하며 글을 알맞게 띄어 읽어 볼 거예요!"}, suggested_extras:["e_space6"]}
    ],
    extras: [
      {id:"q_find6", type:"fun_question", icon:"💡", title:"숨은 겹받침", content:"\"글 속에서 겹받침 낱말을 찾아본 적 있나요?\" 찾기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_find6", type:"tip", icon:"🧩", title:"찾아 읽기", content:"글을 읽으며 겹받침 낱말을 찾아 바르게 읽는 데 초점을 두게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_hide6", type:"fun_question", icon:"📄", title:"몇 개일까", content:"\"이 문장에 겹받침 낱말이 몇 개 있을까요?\" 함께 찾아요.", fit_slides:["motivate"]},
      {id:"r_find6", type:"real_world", icon:"🌍", title:"책 속 겹받침", content:"읽던 책에서 겹받침 낱말을 찾아본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_find6b", type:"tip", icon:"🧩", title:"받침 넘어가기", content:"받침 뒤에 모음이 오면 소리가 넘어감을 천천히 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_find6", type:"misconception", icon:"❓", title:"천천히 살펴", content:"빨리 읽다 틀리지 않게, 겹받침 낱말은 천천히 살펴 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_more6", type:"fun_question", icon:"💡", title:"또 어디에?", content:"\"이 글에 또 어떤 겹받침이 있을까요?\" 함께 찾아요.", fit_slides:["card_quiz"]},
      {id:"g_find6", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"글 속 낱말과 바른 소리를 짝지어 보세요.", hint:"받침이 넘어가는지 살펴요.", pairs:[{a:{text:"☀️ 맑은"},b:{text:"[말근]"}},{a:{text:"🐔 닭이"},b:{text:"[달기]"}},{a:{text:"🟤 흙을"},b:{text:"[흘글]"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"천천히 읽기", content:"찾은 겹받침 낱말을 천천히 바르게 읽어 보게 하세요.", fit_slides:["question"]},
      {id:"e_find6b", type:"extension", icon:"⬆", title:"문장 만들기", content:"\"겹받침 낱말로 짧은 문장을 만들어 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"받침 뒤에 모음이 오면 어떻게 되죠?\" 소리 넘어가기를 짚어요.", fit_slides:["summary"]},
      {id:"e_space6", type:"extension", icon:"⬆", title:"띄어 읽기 예고", content:"\"다음엔 글을 알맞게 띄어 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 글에서 겹받침 낱말 찾기 ② (띄어 읽기) ---------------- */
  window.LESSONS["u4_l07"] = {
    meta: {grade:2, subject:"국어", unit:4, n:7, title:"글에서 겹받침 낱말을 찾아요 ②", std:"[2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 알맞게 띄어 읽기 → 띄어 읽는 곳 → 바른 띄어 읽기 고르기 → 겹받침 글 띄어 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"글에서 겹받침 낱말을 찾아요", subtitle:"4단원 · 7/15차시 · 소단원 1"}, suggested_extras:["q_space7","t_space7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["알맞게 띄어 읽는 법을 알아봐요","뜻이 잘 드러나게 띄어 읽어요","겹받침에 주의하며 글을 읽어요"]}, suggested_extras:["t_space7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어디서 쉬어 읽을까? ⏸️", visual:"📖", question:"\"아기가 방긋 웃는다\"를 한 번에 죽 읽는 것과<br>알맞게 쉬어 읽는 것, 어느 쪽이 잘 들릴까요?"}, suggested_extras:["q_pause7","r_space7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"알맞게 띄어 읽기", content:"글을 읽을 땐 **뜻이 잘 드러나게** 알맞은 곳에서 살짝 쉬어 읽어요. 쉼표(,)에서는 조금, **문장 끝**에서는 조금 더 쉬어요. 알맞게 띄어 읽으면 뜻이 **또렷하게** 전해져요!", symbol_meanings:[{symbol:"쉼표 (,)", meaning:"조금 쉬어요"},{symbol:"문장 끝 (.)", meaning:"조금 더 쉬어요"},{symbol:"뜻의 덩어리", meaning:"의미가 묶이는 곳에서"},{symbol:"또렷하게", meaning:"뜻이 잘 전해져요"}]}, suggested_extras:["t_space7b","x_space7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞게 띄어 읽은 것은? ✅", sub:"알맞게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 하늘에 / 흰 구름이 떠 있다\"", emoji:"☁️", name:"뜻의 덩어리로 알맞게 쉬었어요"},{clue:"\"닭이 / 흙을 밟고 / 걷는다\"", emoji:"🐔", name:"뜻이 드러나게 잘 쉬었어요"},{clue:"이렇게 읽으면 어색해요!", emoji:"🙅", name:"\"닭이흙을 / 밟고걷는다\" (덩어리가 어긋남)"}], outro:"뜻의 덩어리로 쉬어 읽으니 잘 들려요. 직접 띄어 읽어 볼까요? 😊"}, suggested_extras:["q_good7","g_space7"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"겹받침 글을 띄어 읽어요 🎤", sub:"버튼을 눌러 읽을 친구를 뽑아요. 겹받침에 주의하며 알맞게 띄어 읽어 봐요!", count:24, hint:"겹받침은 바르게, 뜻의 덩어리에서 살짝 쉬며 또박또박 읽어요", end_msg:"모두 겹받침을 바르게, 알맞게 띄어 읽었어요! 👏"}, suggested_extras:["t_present7","e_read7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["알맞게 띄어 읽는 법을 알았어요","뜻이 드러나게 띄어 읽었어요","겹받침에 주의하며 글을 읽었어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시의 분위기를 살펴봐요", body:"다음 시간에는 시의 말과 장면에서 분위기를 느껴 볼 거예요!"}, suggested_extras:["e_mood7"]}
    ],
    extras: [
      {id:"q_space7", type:"fun_question", icon:"💡", title:"쉬어 읽기", content:"\"글을 읽을 때 어디서 쉬면 좋을까요?\" 띄어 읽기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_space7", type:"tip", icon:"🧩", title:"뜻의 덩어리", content:"뜻이 묶이는 덩어리에서 쉬어 읽게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_pause7", type:"fun_question", icon:"📖", title:"어느 쪽이?", content:"\"한 번에 읽기와 쉬어 읽기, 어느 쪽이 잘 들리나요?\" 띄어 읽기의 힘을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_space7", type:"real_world", icon:"🌍", title:"읽어 주기", content:"책을 읽어 줄 때 쉬어 읽던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_space7b", type:"tip", icon:"🧩", title:"부호에서 쉬기", content:"쉼표·마침표에서 쉬는 정도가 다름을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_space7", type:"misconception", icon:"❓", title:"낱말 가운데 X", content:"낱말 가운데를 끊지 말고 뜻의 덩어리에서 쉬게 하세요.", fit_slides:["concept"]},
      {id:"q_good7", type:"fun_question", icon:"💡", title:"왜 어색할까", content:"\"이렇게 읽으면 왜 어색할까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_space7", type:"game", game_kind:"memory_match", icon:"🎮", title:"읽기 ↔ 판단 짝짓기", description:"띄어 읽기와 알맞은지 판단을 짝지어 보세요.", hint:"뜻이 드러나는지 생각해요.", pairs:[{a:{text:"☁️ 덩어리로 쉼"},b:{text:"알맞음"}},{a:{text:"🐔 뜻 드러나게"},b:{text:"알맞음"}},{a:{text:"🙅 붙여 읽음"},b:{text:"어색함"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"천천히 또박또박", content:"겹받침을 바르게, 알맞게 쉬며 또박또박 읽게 하세요.", fit_slides:["present"]},
      {id:"e_read7", type:"extension", icon:"⬆", title:"바꿔 읽기", content:"\"쉬는 곳을 바꾸면 느낌이 어떻게 달라질까요?\" 읽기를 탐구해요.", fit_slides:["present"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"알맞게 띄어 읽으면 무엇이 좋죠?\" 또렷함을 짚어요.", fit_slides:["summary"]},
      {id:"e_mood7", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시의 분위기를 살펴봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 시의 분위기 살펴보기 ① ---------------- */
  window.LESSONS["u4_l08"] = {
    meta: {grade:2, subject:"국어", unit:4, n:8, title:"시의 분위기를 살펴봐요 ①", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 시의 말·장면 → 분위기 느끼기 → 분위기 고르기 → 분위기 말해 보기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_mood8","t_mood8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시의 말과 장면을 살펴봐요","시의 분위기를 느껴요","분위기를 말로 표현해요"]}, suggested_extras:["t_mood8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"시를 읽으면 그림이 떠올라요 🖼️", visual:"🎨", question:"\"통통 공이 콩콩 뛰어요\"를 읽으면<br>어떤 장면과 느낌이 떠오르나요?"}, suggested_extras:["q_scene8","r_mood8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 느끼는 법", content:"시의 분위기는 **말**과 **장면**에서 느껴져요. \"통통·콩콩\" 같은 밝은 말은 **신나는** 분위기, \"살며시·조용히\" 같은 말은 **포근한** 분위기를 만들어요. 어떤 그림이 떠오르는지 살펴봐요!", symbol_meanings:[{symbol:"밝은 말", meaning:"통통·콩콩 → 신나는"},{symbol:"부드러운 말", meaning:"살며시 → 포근한"},{symbol:"떠오르는 장면", meaning:"분위기를 만들어요"},{symbol:"느낌 살피기", meaning:"어떤 마음이 드나"}]}, suggested_extras:["t_mood8b","x_mood8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기? 🎭", sub:"시의 말과 장면을 보고 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 공이 콩콩, 운동장이 들썩\"", emoji:"⚽", name:"신나고 활기찬 분위기"},{clue:"\"달님이 살며시, 아기가 새근새근\"", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"빗방울이 토독토독, 우산이 동동\"", emoji:"☔", name:"맑고 경쾌한 분위기"}], outro:"말과 장면에서 분위기가 느껴져요. 시의 분위기를 말해 볼까요? 😊"}, suggested_extras:["q_mood8c","g_mood8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 말해 봐요", question:"시를 읽고 분위기를 느껴 볼까요?", items:["시에서 어떤 말이 분위기를 만드나요?","어떤 장면이 떠오르나요?","분위기를 한 낱말로 말한다면?"]}, suggested_extras:["t_present8","e_mood8b"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시의 말과 장면을 살펴봤어요","시의 분위기를 느꼈어요","분위기를 말로 표현했어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 더 깊이 느껴요", body:"다음 시간에는 여러 시의 분위기를 비교하며 더 깊이 느껴 볼 거예요!"}, suggested_extras:["e_mood8c"]}
    ],
    extras: [
      {id:"q_mood8", type:"fun_question", icon:"💡", title:"떠오르는 그림", content:"\"시를 읽으면 어떤 그림이 떠오르나요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood8", type:"tip", icon:"🧩", title:"말과 장면", content:"분위기는 말과 떠오르는 장면에서 느껴짐을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_scene8", type:"fun_question", icon:"🎨", title:"어떤 느낌", content:"\"이 시를 읽으면 어떤 느낌이 드나요?\" 분위기를 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_mood8", type:"real_world", icon:"🌍", title:"장면 떠올리기", content:"노래를 들으며 장면을 떠올린 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mood8b", type:"tip", icon:"🧩", title:"밝은 말·부드러운 말", content:"밝은 말과 부드러운 말이 다른 분위기를 만듦을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_mood8", type:"misconception", icon:"❓", title:"정답은 없어요", content:"분위기 느낌에 하나의 정답은 없어요. 다양한 느낌을 인정하세요.", fit_slides:["concept"]},
      {id:"q_mood8c", type:"fun_question", icon:"💡", title:"왜 그 분위기?", content:"\"왜 그런 분위기로 느껴질까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_mood8", type:"game", game_kind:"memory_match", icon:"🎮", title:"장면 ↔ 분위기 짝짓기", description:"시의 장면과 분위기를 짝지어 보세요.", hint:"느낌을 떠올려요.", pairs:[{a:{text:"⚽ 공이 콩콩"},b:{text:"신나는"}},{a:{text:"🌙 달님 살며시"},b:{text:"포근한"}},{a:{text:"☔ 토독토독"},b:{text:"경쾌한"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"느낌 말하기", content:"분위기를 만든 말과 장면을 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood8b", type:"extension", icon:"⬆", title:"색으로 표현", content:"\"이 시의 분위기를 색으로 표현하면?\" 분위기를 다양하게 느껴요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기는 무엇에서 느껴지죠?\" 말·장면을 짚어요.", fit_slides:["summary"]},
      {id:"e_mood8c", type:"extension", icon:"⬆", title:"이어 느끼기 예고", content:"\"다음엔 여러 시의 분위기를 비교해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 시의 분위기 살펴보기 ② (비교) ---------------- */
  window.LESSONS["u4_l09"] = {
    meta: {grade:2, subject:"국어", unit:4, n:9, title:"시의 분위기를 살펴봐요 ②", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기 비교 → 분위기 만드는 말 → 밝은 말 모으기 → 분위기 골라 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_recall9","t_compare9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 시의 분위기를 비교해요","분위기를 만드는 말을 찾아요","어울리는 분위기를 골라요"]}, suggested_extras:["t_compare9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"시마다 분위기가 달라요 🎭", visual:"🎭", question:"신나는 시와 조용한 시는 무엇이 다를까요?<br>어떤 말이 분위기를 다르게 만들까요?"}, suggested_extras:["q_diff9","r_compare9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 만드는 말", content:"시의 분위기는 쓰인 **말**에 따라 달라져요. \"통통·들썩·신나게\" 같은 말은 **활기찬** 분위기를, \"살며시·고요히·포근히\" 같은 말은 **차분한** 분위기를 만들어요. 말을 살피면 분위기가 보여요!", symbol_meanings:[{symbol:"통통·들썩", meaning:"활기찬 분위기"},{symbol:"살며시·고요히", meaning:"차분한 분위기"},{symbol:"토독토독", meaning:"경쾌한 분위기"},{symbol:"말 살피기", meaning:"분위기를 찾는 열쇠"}]}, suggested_extras:["t_compare9b","x_compare9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 분위기의 말은? 🎭", sub:"분위기에 어울리는 말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 분위기를 만드는 말은?", emoji:"🎉", name:"통통·콩콩·들썩"},{clue:"포근한 분위기를 만드는 말은?", emoji:"🌙", name:"살며시·새근새근·포근히"},{clue:"경쾌한 분위기를 만드는 말은?", emoji:"💧", name:"토독토독·또르르"}], outro:"말을 살피니 분위기가 보여요. 어울리는 분위기를 골라 볼까요? 😊"}, suggested_extras:["q_word9","g_compare9"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 골라 말해요", question:"시의 분위기를 골라 말해 볼까요?", items:["이 시의 분위기는 무엇인가요?","어떤 말이 그 분위기를 만드나요?","두 시의 분위기는 어떻게 다른가요?"]}, suggested_extras:["t_present9","e_compare9b"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["여러 시의 분위기를 비교했어요","분위기를 만드는 말을 찾았어요","어울리는 분위기를 골랐어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽어요", body:"다음 시간에는 시의 분위기에 맞게 목소리와 빠르기를 조절해 읽어 볼 거예요!"}, suggested_extras:["e_read9"]}
    ],
    extras: [
      {id:"q_recall9", type:"fun_question", icon:"💡", title:"지난 분위기", content:"\"지난 시간에 느낀 시의 분위기가 기억나나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_compare9", type:"tip", icon:"🧩", title:"비교하기", content:"여러 시를 비교하면 분위기 차이가 또렷해짐을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_diff9", type:"fun_question", icon:"🎭", title:"무엇이 다를까", content:"\"신나는 시와 조용한 시는 무엇이 다를까요?\" 차이를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_compare9", type:"real_world", icon:"🌍", title:"노래 비교", content:"빠른 노래·느린 노래의 분위기 차이와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_compare9b", type:"tip", icon:"🧩", title:"말이 열쇠", content:"분위기를 만드는 것은 쓰인 말임을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_compare9", type:"misconception", icon:"❓", title:"느낌 존중", content:"분위기 느낌이 친구와 달라도 괜찮음을 인정하게 하세요.", fit_slides:["concept"]},
      {id:"q_word9", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"이 분위기를 만드는 말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_compare9", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 말 짝짓기", description:"분위기와 어울리는 말을 짝지어 보세요.", hint:"느낌을 만드는 말을 떠올려요.", pairs:[{a:{text:"🎉 신나는"},b:{text:"통통·콩콩"}},{a:{text:"🌙 포근한"},b:{text:"살며시"}},{a:{text:"💧 경쾌한"},b:{text:"토독토독"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"까닭과 함께", content:"분위기를 그렇게 느낀 까닭(말·장면)을 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_compare9b", type:"extension", icon:"⬆", title:"분위기 바꾸기", content:"\"말을 바꾸면 분위기가 어떻게 달라질까요?\" 표현을 탐구해요.", fit_slides:["question"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 만드는 건 무엇이죠?\" 말을 짚어요.", fit_slides:["summary"]},
      {id:"e_read9", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 분위기를 살려 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 분위기 생각하며 소리 내어 읽기 ① ---------------- */
  window.LESSONS["u4_l10"] = {
    meta: {grade:2, subject:"국어", unit:4, n:10, title:"분위기를 생각하며 소리 내어 읽어요 ①", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기에 맞는 목소리 → 빠르기 조절 → 어울리는 읽기 고르기 → 분위기 살려 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_read10","t_read10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기에 맞는 목소리를 알아봐요","빠르기를 조절해 읽어요","분위기를 살려 시를 읽어요"]}, suggested_extras:["t_read10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기에 맞게 읽어요 🎙️", visual:"🎙️", question:"신나는 시는 밝고 빠르게, 조용한 시는 작고 천천히!<br>분위기에 맞게 읽으면 어떤 느낌일까요?"}, suggested_extras:["q_voice10","r_read10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기에 맞는 읽기", content:"분위기에 맞게 **목소리**와 **빠르기**를 바꿔 읽어요. 신나는 시는 **밝고 빠르게**, 포근한 시는 **부드럽고 천천히**, 경쾌한 시는 **또박또박 가볍게**! 분위기를 살리면 시가 더 멋지게 들려요!", symbol_meanings:[{symbol:"신나는 시", meaning:"밝고 빠르게"},{symbol:"포근한 시", meaning:"부드럽고 천천히"},{symbol:"경쾌한 시", meaning:"또박또박 가볍게"},{symbol:"분위기 살리기", meaning:"느낌이 잘 전해져요"}]}, suggested_extras:["t_read10b","x_read10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시에 어울리는 읽기는? 🎙️", sub:"분위기에 맞는 읽기 방법을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 공이 콩콩 뛰어요\"는?", emoji:"⚽", name:"밝고 빠르게, 신나게"},{clue:"\"달님이 살며시 앉아요\"는?", emoji:"🌙", name:"부드럽고 천천히"},{clue:"\"빗방울이 토독토독\"은?", emoji:"💧", name:"또박또박 가볍게"}], outro:"분위기에 맞게 읽으니 시가 살아나요. 직접 읽어 볼까요? 😊"}, suggested_extras:["q_good10","g_read10"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"분위기를 살려 읽어요 🎤", sub:"버튼을 눌러 읽을 친구를 뽑아요. 시의 분위기에 맞게 목소리와 빠르기를 살려 읽어 봐요!", count:24, hint:"신나는 시는 밝고 빠르게, 포근한 시는 부드럽고 천천히 읽어요", end_msg:"모두 분위기를 멋지게 살려 읽었어요! 시가 더 생생해졌어요 👏"}, suggested_extras:["t_present10","e_read10b"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기에 맞는 목소리를 알았어요","빠르기를 조절해 읽었어요","분위기를 살려 시를 읽었어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 더 읽어요", body:"다음 시간에는 친구들 앞에서 분위기를 살려 시를 낭송해 볼 거예요!"}, suggested_extras:["e_recite10"]}
    ],
    extras: [
      {id:"q_read10", type:"fun_question", icon:"💡", title:"어떻게 읽을까", content:"\"신나는 시는 어떻게 읽으면 좋을까요?\" 읽기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_read10", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 따라 목소리·빠르기를 조절하게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_voice10", type:"fun_question", icon:"🎙️", title:"어떤 느낌", content:"\"분위기에 맞게 읽으면 어떤 느낌일까요?\" 낭송의 재미를 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_read10", type:"real_world", icon:"🌍", title:"동화 읽어 주기", content:"동화를 실감 나게 읽어 준 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read10b", type:"tip", icon:"🧩", title:"분위기마다 다르게", content:"분위기마다 읽는 법이 다름을 시범으로 보여 주면 좋아요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read10", type:"misconception", icon:"❓", title:"한 가지로만 X", content:"모든 시를 같은 목소리로 읽지 말고 분위기에 맞게 바꾸게 하세요.", fit_slides:["concept"]},
      {id:"q_good10", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"왜 그렇게 읽으면 좋을까요?\" 분위기와 잇게 해요.", fit_slides:["card_quiz"]},
      {id:"g_read10", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽기 짝짓기", description:"분위기와 어울리는 읽기를 짝지어 보세요.", hint:"느낌에 맞는 읽기를 골라요.", pairs:[{a:{text:"⚽ 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 포근한"},b:{text:"부드럽고 천천히"}},{a:{text:"💧 경쾌한"},b:{text:"또박또박 가볍게"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"실감 나게", content:"분위기를 살려 실감 나게 읽도록 격려하세요.", fit_slides:["present"]},
      {id:"e_read10b", type:"extension", icon:"⬆", title:"바꿔 읽기", content:"\"일부러 다른 분위기로 읽으면 어떨까요?\" 읽기를 탐구해요.", fit_slides:["present"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기에 맞게 읽으려면 무엇을 바꾸죠?\" 목소리·빠르기를 짚어요.", fit_slides:["summary"]},
      {id:"e_recite10", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 친구들 앞에서 낭송해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 분위기 생각하며 소리 내어 읽기 ② (낭송) ---------------- */
  window.LESSONS["u4_l11"] = {
    meta: {grade:2, subject:"국어", unit:4, n:11, title:"분위기를 생각하며 소리 내어 읽어요 ②", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 낭송이란 → 낭송 약속 → 좋은 낭송·듣기 모으기 → 시 낭송하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_recite11","t_recite11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낭송이 무엇인지 알아봐요","바른 낭송·듣기 태도를 알아봐요","분위기를 살려 시를 낭송해요"]}, suggested_extras:["t_recite11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"시를 멋지게 들려줘요 🎵", visual:"🎵", question:"분위기를 살려 시를 친구들에게 들려줘요.<br>어떻게 낭송하면 더 멋질까요?"}, suggested_extras:["q_how11","r_recite11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송과 듣기 약속", content:"낭송은 시를 **소리 내어 멋지게** 읽는 거예요. **분위기를 살려** 목소리·빠르기를 조절하고, 알맞게 띄어 읽어요. 들을 땐 **조용히 집중**해 듣고, 끝나면 **박수**로 응원해요!", symbol_meanings:[{symbol:"분위기 살리기", meaning:"목소리·빠르기 조절"},{symbol:"알맞게 띄어", meaning:"뜻이 드러나게"},{symbol:"바른 자세", meaning:"또박또박 들려줘요"},{symbol:"집중해 듣기", meaning:"조용히·박수로 응원"}]}, suggested_extras:["t_recite11b","x_recite11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바른 낭송·듣기 태도는? ✅", sub:"낭송과 듣기의 바른 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"낭송할 때는?", emoji:"🎤", name:"분위기를 살려 또박또박"},{clue:"친구가 낭송할 때는?", emoji:"👂", name:"조용히 집중해 들어요"},{clue:"낭송이 끝나면?", emoji:"👏", name:"박수로 응원해 줘요"}], outro:"서로 응원하며 낭송하면 더 즐거워요. 시를 낭송해 볼까요? 😊"}, suggested_extras:["q_good11","g_recite11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"시를 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 분위기를 살려 시를 멋지게 낭송해 봐요!", count:24, hint:"분위기에 맞게 목소리·빠르기를 살리고, 알맞게 띄어 또박또박 낭송해요", end_msg:"모두 분위기를 살려 멋지게 낭송했어요! 우리 반에 시가 가득해요 👏"}, suggested_extras:["t_present11","e_recite11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["낭송이 무엇인지 알았어요","바른 낭송·듣기 태도를 알았어요","분위기를 살려 시를 낭송했어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시로 여는 우리 반을 만들어요", body:"다음 시간에는 좋아하는 시를 골라 낭송하며 '시로 여는 우리 반'을 만들어 볼 거예요!"}, suggested_extras:["e_class11"]}
    ],
    extras: [
      {id:"q_recite11", type:"fun_question", icon:"💡", title:"멋진 낭송", content:"\"멋진 낭송을 들어 본 적 있나요?\" 낭송을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_recite11", type:"tip", icon:"🧩", title:"낭송과 듣기", content:"낭송만큼 바른 듣기도 중요함을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_how11", type:"fun_question", icon:"🎵", title:"어떻게 낭송?", content:"\"어떻게 낭송하면 더 멋질까요?\" 낭송 방법을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_recite11", type:"real_world", icon:"🌍", title:"낭송 무대", content:"시 낭송회·동시 발표 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_recite11b", type:"tip", icon:"🧩", title:"분위기 살리기", content:"분위기를 살려 목소리·빠르기를 조절해 낭송하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_recite11", type:"misconception", icon:"❓", title:"빠르게 X", content:"빨리 읽기보다 분위기를 살려 또박또박 낭송하게 하세요.", fit_slides:["concept"]},
      {id:"q_good11", type:"fun_question", icon:"💡", title:"바른 태도는?", content:"\"바른 낭송·듣기 태도는 무엇이죠?\" 분위기·집중을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_recite11", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 태도 짝짓기", description:"낭송 상황과 바른 태도를 짝지어 보세요.", hint:"서로 응원하는 모습을 생각해요.", pairs:[{a:{text:"🎤 낭송"},b:{text:"분위기 살려"}},{a:{text:"👂 듣기"},b:{text:"집중해 듣기"}},{a:{text:"👏 끝난 뒤"},b:{text:"박수로 응원"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 좋았던 점을 찾게 하세요.", fit_slides:["present"]},
      {id:"e_recite11", type:"extension", icon:"⬆", title:"좋은 점 찾기", content:"\"친구 낭송에서 좋았던 점은?\" 구체적으로 칭찬하게 해요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"낭송을 잘하려면 무엇을 살리죠?\" 분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_class11", type:"extension", icon:"⬆", title:"우리 반 예고", content:"\"다음엔 시로 여는 우리 반을 만들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 시로 여는 우리 반 ① (실천) ---------------- */
  window.LESSONS["u4_l12"] = {
    meta: {grade:2, subject:"국어", unit:4, n:12, title:"시로 여는 우리 반을 만들어요 ① (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 좋아하는 시 고르기 → 낭송 준비 → 낭송 차례 잇기 → 시 골라 연습하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 12/15차시 · 실천"}, suggested_extras:["q_class12","t_class12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["좋아하는 시를 골라요","낭송을 준비해요","분위기를 살려 연습해요"]}, suggested_extras:["t_class12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 반을 시로 채워요 🎵", visual:"📜", question:"좋아하는 시를 골라 낭송하며 하루를 열면 어떨까요?<br>어떤 시를 고르고 싶나요?"}, suggested_extras:["q_pick12","r_class12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송 준비하기", content:"먼저 **좋아하는 시**를 골라요. 시의 **분위기**를 살피고, 분위기에 맞게 **목소리·빠르기**를 정해 연습해요. 어려운 낱말(겹받침)은 **바르게** 읽도록 미리 살펴 두면 좋아요!", symbol_meanings:[{symbol:"① 시 고르기", meaning:"좋아하는 시로"},{symbol:"② 분위기 살피기", meaning:"어떤 느낌인가"},{symbol:"③ 읽기 정하기", meaning:"목소리·빠르기"},{symbol:"④ 연습하기", meaning:"바르게·실감 나게"}]}, suggested_extras:["t_class12b","x_class12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낭송 준비, 무엇부터? 📜", sub:"낭송 준비 차례를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"가장 먼저 할 일은?", emoji:"📜", name:"좋아하는 시 고르기"},{clue:"시를 고른 다음은?", emoji:"🎭", name:"시의 분위기 살피기"},{clue:"분위기를 살핀 다음은?", emoji:"🎙️", name:"목소리·빠르기 정해 연습하기"}], outro:"차례대로 준비하면 멋진 낭송을 할 수 있어요. 시를 골라 연습해 볼까요? 😊"}, suggested_extras:["q_step12","g_class12"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"시를 골라 연습해요", question:"낭송할 시를 골라 연습해 볼까요?", items:["어떤 시를 골랐나요?","그 시의 분위기는 무엇인가요?","어떻게 읽으면 분위기가 살까요?"]}, suggested_extras:["t_present12","e_class12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["좋아하는 시를 골랐어요","낭송을 준비했어요","분위기를 살려 연습했어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"우리 반 낭송회를 열어요", body:"다음 시간에는 준비한 시로 우리 반 낭송회를 열어 볼 거예요!"}, suggested_extras:["e_show12"]}
    ],
    extras: [
      {id:"q_class12", type:"fun_question", icon:"💡", title:"좋아하는 시", content:"\"좋아하거나 외우고 있는 시가 있나요?\" 시 고르기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_class12", type:"tip", icon:"🧩", title:"준비 차례", content:"시 고르기→분위기 살피기→읽기 정하기→연습 차례로 준비하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_pick12", type:"fun_question", icon:"📜", title:"어떤 시?", content:"\"어떤 시를 낭송하고 싶나요?\" 시를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_class12", type:"real_world", icon:"🌍", title:"아침 시 읽기", content:"아침마다 시를 읽는 활동과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_class12b", type:"tip", icon:"🧩", title:"겹받침 미리", content:"시 속 겹받침 낱말을 미리 바르게 읽도록 살피게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_class12", type:"misconception", icon:"❓", title:"외우기보다 살리기", content:"무조건 외우기보다 분위기를 살려 읽는 데 초점을 두게 하세요.", fit_slides:["concept"]},
      {id:"q_step12", type:"fun_question", icon:"💡", title:"다음은?", content:"\"이 다음엔 무엇을 준비할까요?\" 차례를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_class12", type:"game", game_kind:"memory_match", icon:"🎮", title:"차례 ↔ 할 일 짝짓기", description:"낭송 준비 차례와 할 일을 짝지어 보세요.", hint:"준비 순서를 떠올려요.", pairs:[{a:{text:"📜 먼저"},b:{text:"시 고르기"}},{a:{text:"🎭 다음"},b:{text:"분위기 살피기"}},{a:{text:"🎙️ 그 다음"},b:{text:"읽기 정해 연습"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"연습 돕기", content:"고른 시를 분위기에 맞게 연습하도록 도와주세요.", fit_slides:["question"]},
      {id:"e_class12", type:"extension", icon:"⬆", title:"몸짓 더하기", content:"\"낭송에 어울리는 몸짓을 더해 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송 준비는 무엇부터 하죠?\" 차례를 짚어요.", fit_slides:["summary"]},
      {id:"e_show12", type:"extension", icon:"⬆", title:"낭송회 예고", content:"\"다음엔 우리 반 낭송회를 열어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 시로 여는 우리 반 ② (낭송회) ---------------- */
  window.LESSONS["u4_l13"] = {
    meta: {grade:2, subject:"국어", unit:4, n:13, title:"시로 여는 우리 반을 만들어요 ② (실천)", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 낭송회 약속 → 발표·감상 → 좋은 점 찾기 → 낭송회·소감"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 13/15차시 · 실천"}, suggested_extras:["q_show13","t_show13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["우리 반 낭송회를 열어요","분위기를 살려 낭송해요","친구 낭송을 감상하고 나눠요"]}, suggested_extras:["t_show13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 반 낭송회! 🎉", visual:"🎉", question:"준비한 시로 낭송회를 열어요.<br>친구들의 다양한 시와 분위기를 만나 볼까요?"}, suggested_extras:["q_ready13","r_show13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송회를 즐겨요", content:"낭송회에서는 차례대로 **분위기를 살려** 낭송하고, 친구 낭송을 **집중해 감상**해요. \"이 시는 분위기가 잘 살았다\" \"목소리가 어울린다\" 하고 **좋은 점**을 찾아 말해 주면 서로 힘이 나요!", symbol_meanings:[{symbol:"차례대로", meaning:"순서를 지켜 낭송"},{symbol:"분위기 살려", meaning:"느낌을 담아"},{symbol:"집중 감상", meaning:"친구 낭송을 즐겨요"},{symbol:"좋은 점 찾기", meaning:"분위기·목소리 칭찬"}]}, suggested_extras:["t_show13b","x_show13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낭송회에서 좋은 점은? ✅", sub:"낭송에서 칭찬할 좋은 점을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"분위기를 잘 살린 낭송은?", emoji:"🎭", name:"\"분위기가 잘 느껴졌어\""},{clue:"목소리가 어울린 낭송은?", emoji:"🎙️", name:"\"목소리가 시와 잘 어울려\""},{clue:"또박또박 읽은 낭송은?", emoji:"✨", name:"\"잘 들리게 또박또박 읽었어\""}], outro:"좋은 점을 찾아 칭찬하면 모두 즐거워요. 낭송회를 열어 볼까요? 😊"}, suggested_extras:["q_good13","g_show13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"우리 반 낭송회 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 준비한 시를 분위기를 살려 낭송하고 좋은 점을 나눠요!", count:24, hint:"분위기를 살려 낭송하고, 들은 친구는 좋았던 점을 말해 줘요", end_msg:"모두 멋진 낭송회를 열었어요. 우리 반이 시로 가득해졌어요! 👏"}, suggested_extras:["t_present13","e_show13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["우리 반 낭송회를 열었어요","분위기를 살려 낭송했어요","친구 낭송을 감상하고 나눴어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 겹받침과 분위기를 스스로 돌아보며 단원을 마무리할 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_show13", type:"fun_question", icon:"💡", title:"낭송 마음", content:"\"낭송회를 앞둔 마음이 어떤가요?\" 낭송회를 편하게 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_show13", type:"tip", icon:"🧩", title:"즐기는 낭송회", content:"잘하고 못하고보다 함께 즐기는 데 초점을 두세요.", fit_slides:["objective","concept"]},
      {id:"q_ready13", type:"fun_question", icon:"🎉", title:"준비됐나요", content:"\"어떤 시를 들려줄 준비를 했나요?\" 흥미를 열어요.", fit_slides:["motivate"]},
      {id:"r_show13", type:"real_world", icon:"🌍", title:"발표회 경험", content:"학예회·발표회 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_show13b", type:"tip", icon:"🧩", title:"감상과 칭찬", content:"친구 낭송을 감상하며 좋은 점을 찾게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_show13", type:"misconception", icon:"❓", title:"흠보다 좋은 점", content:"실수를 지적하기보다 좋은 점을 찾아 칭찬하게 하세요.", fit_slides:["concept"]},
      {id:"q_good13", type:"fun_question", icon:"💡", title:"어떤 점이 좋을까", content:"\"이 낭송의 어떤 점이 좋을까요?\" 좋은 점을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_show13", type:"game", game_kind:"memory_match", icon:"🎮", title:"낭송 ↔ 좋은 점 짝짓기", description:"낭송 특징과 좋은 점을 짝지어 보세요.", hint:"무엇을 잘했는지 생각해요.", pairs:[{a:{text:"🎭 분위기"},b:{text:"느낌이 잘 살음"}},{a:{text:"🎙️ 목소리"},b:{text:"시와 어울림"}},{a:{text:"✨ 또박또박"},b:{text:"잘 들림"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"구체적 칭찬", content:"\"잘했다\"보다 어떤 점이 좋은지 구체적으로 칭찬하게 하세요.", fit_slides:["present"]},
      {id:"e_show13", type:"extension", icon:"⬆", title:"시 모으기", content:"\"우리 반이 좋아한 시를 모아 볼까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송회에서 무엇을 했죠?\" 낭송·감상을 짚어요.", fit_slides:["summary"]},
      {id:"e_wrap13", type:"extension", icon:"⬆", title:"마무리 예고", content:"\"다음엔 단원을 마무리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 14차시: 마무리하기 ① (스스로 확인) ---------------- */
  window.LESSONS["u4_l14"] = {
    meta: {grade:2, subject:"국어", unit:4, n:14, title:"마무리하기 ① — 스스로 확인", std:"[2국04-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 단원 돌아보기 → 겹받침·분위기 정리 → 확인 퀴즈 → 스스로 확인"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ① — 스스로 확인", subtitle:"4단원 · 14/15차시 · 마무리"}, suggested_extras:["q_back14","t_wrap14"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["단원에서 배운 것을 돌아봐요","겹받침·분위기를 정리해요","배운 내용을 스스로 확인해요"]}, suggested_extras:["t_wrap14"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"4단원에서 무엇을 배웠나요? 🎀", visual:"📖", question:"겹받침을 바르게 읽고 쓰고, 시를 분위기에 맞게 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침·분위기 정리", content:"이 단원에서 **겹받침을 바르게 읽고 쓰는 법**(소리는 하나·쓸 때는 두 글자)과 **시를 분위기에 맞게 읽는 법**을 배웠어요. 분위기에 맞게 목소리·빠르기를 살려 읽으면 시가 더 멋져요!", symbol_meanings:[{symbol:"ㄺ·ㄵ·ㄼ", meaning:"[ㄱ]·[ㄴ]·[ㄹ]"},{symbol:"쓸 때 두 글자", meaning:"받침 모두 살려요"},{symbol:"분위기", meaning:"신나는·포근한·경쾌한"},{symbol:"분위기 살려 읽기", meaning:"목소리·빠르기 조절"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"'값'은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"},{clue:"겹받침을 쓸 때는?", emoji:"✍️", name:"받침 두 글자를 모두 써요"},{clue:"신나는 시는 어떻게 읽을까요?", emoji:"⚽", name:"밝고 빠르게"}], outro:"배운 것을 잘 기억하고 있어요. 시를 분위기에 맞게 읽어 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["겹받침 낱말을 바르게 읽고 쓸 수 있나요?","시의 분위기를 느낄 수 있나요?","분위기를 살려 읽을 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","겹받침·분위기를 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 겹받침 낱말을 더 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"두 갈래 정리", content:"겹받침과 분위기 두 갈래로 나눠 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"📖", title:"기억에 남는 활동", content:"\"겹받침·시 낭송 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"생활 속 적용", content:"책을 읽을 때 겹받침을 바르게 읽은 경험을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"규칙·분위기", content:"겹받침 규칙과 분위기 살려 읽기를 함께 정리하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"쓸 땐 두 글자", content:"소리가 하나라고 받침을 하나만 쓰지 않게 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"✍️ 겹받침 쓰기"},b:{text:"두 글자 모두"}},{a:{text:"⚽ 신나는 시"},b:{text:"밝고 빠르게"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"더 익히고 싶은 겹받침 낱말이 있나요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 겹받침·분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 겹받침과 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·글씨) ---------------- */
  window.LESSONS["u4_l15"] = {
    meta: {grade:2, subject:"국어", unit:4, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 한 번 더 → 낱말↔소리 정리 → 바른 소리 고르기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"4단원 · 15/15차시 · 마무리"}, suggested_extras:["q_last","t_last"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["겹받침 낱말을 한 번 더 익혀요","소리와 글자의 차이를 정리해요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_last"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 한 번 더! 🔤", visual:"🔤", question:"닭·값·앉다·넓다…<br>이제 겹받침 낱말을 바르게 읽고 쓸 수 있나요?"}, suggested_extras:["q_last2","r_last"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 한 번 더 정리", content:"겹받침은 **소리는 하나, 쓸 때는 두 글자**! \"닭[닥]·값[갑]·앉다[안따]·넓다[널따]\"를 떠올려 봐요. 헷갈리면 **천천히 살펴** 읽고 쓰면 돼요. 자주 쓰면 익숙해져요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"ㄺ → [ㄱ]"},{symbol:"값 → [갑]", meaning:"ㅄ → [ㅂ]"},{symbol:"앉다 → [안따]", meaning:"ㄵ → [ㄴ]"},{symbol:"넓다 → [널따]", meaning:"ㄼ → [ㄹ]"}]}, suggested_extras:["t_last2","x_last"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바른 소리를 골라요 🔊", sub:"겹받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"'여덟'은 어떻게 읽을까요?", emoji:"8️⃣", name:"[여덜]"},{clue:"'많다'는 어떻게 읽을까요?", emoji:"➕", name:"[만타]"},{clue:"'짧다'는 어떻게 읽을까요?", emoji:"📏", name:"[짤따]"}], outro:"겹받침 소리를 잘 알고 있어요. 이제 글씨도 써 볼까요? 😊"}, suggested_extras:["q_last3","g_last"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **닭 · 앉다 · 분위기**를 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"ㄹ+ㄱ 받침 또박또박"},{symbol:"앉다", meaning:"ㄴ+ㅈ 받침 바르게"},{symbol:"분위기", meaning:"천천히 정성껏"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"4단원에서 배운 것", points:["겹받침을 바르게 읽고 썼어요","시를 분위기에 맞게 읽었어요","겹받침 낱말과 글씨를 익혔어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"바르고 재미있게!", body:"4단원을 모두 마쳤어요. 앞으로도 겹받침을 바르게 읽고, 시를 분위기에 맞게 읽어 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_last", type:"fun_question", icon:"💡", title:"겹받침 복습", content:"\"가장 기억에 남는 겹받침 낱말은 무엇인가요?\" 복습을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_last", type:"tip", icon:"🧩", title:"한 번 더", content:"자주 쓰는 겹받침 낱말을 한 번 더 익혀 자신감을 길러 주세요.", fit_slides:["objective","concept"]},
      {id:"q_last2", type:"fun_question", icon:"🔤", title:"읽고 쓸 수 있나", content:"\"겹받침 낱말을 바르게 읽고 쓸 수 있나요?\" 자신감을 살펴요.", fit_slides:["motivate"]},
      {id:"r_last", type:"real_world", icon:"🌍", title:"책에서 찾기", content:"읽는 책에서 겹받침 낱말을 찾아본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_last2", type:"tip", icon:"🧩", title:"천천히 살펴", content:"헷갈리면 천천히 살펴 읽고 쓰게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_last", type:"misconception", icon:"❓", title:"쓸 땐 두 글자", content:"소리가 하나라고 받침을 하나만 쓰지 않게 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_last3", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"이 받침을 가진 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_last", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침 소리를 떠올려요.", pairs:[{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}},{a:{text:"➕ 많다"},b:{text:"[만타]"}},{a:{text:"📏 짧다"},b:{text:"[짤따]"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"바른 글씨", content:"받침 두 글자를 살려 또박또박 쓰게 하고, 어려워하면 천천히 따라 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"겹받침 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"4단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"시 읽기", content:"\"오늘 집에서 좋아하는 시를 분위기를 살려 읽어 볼까요?\" 읽기를 이어 가요.", fit_slides:["next_lesson"]}
    ]
  };


})();
