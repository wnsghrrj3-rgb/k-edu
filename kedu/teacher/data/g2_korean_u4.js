/* ============================================================================
   2학년 1학기 국어 4단원 「분위기를 살려 읽어요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (나) 112~143 / 15차시.
   - 단원 목표: 겹받침을 바르게 읽고 쓰기 + 작품을 분위기에 알맞게 읽기.
   - 성취기준 [2국04-02](소리·표기 다른 낱말 바르게 읽고 쓰기)·[2국05-01](분위기 살려 낭송)·[2국02-02](띄어 읽기·소리 내어 읽기).
   ★ 저작권: 지도서 제재(국어활동 「설문대 할망」·설명글 「쓰레기가 모여 있다고?」·본문 수록 시) 전부 미게재.
      겹받침 낱말(닭·값·흙·앉다·많다·읽다·짧다·넓다·맑다·여덟·몫)은 표준 발음 자체 구성, 짧은 시는 보편 소재(공놀이·달밤·빗방울) 전부 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 소리와 글자가 다를 때 ---------------- */
  window.LESSONS["u4_l01"] = {
    meta: {grade:2, subject:"국어", unit:4, n:1, title:"단원 도입 — 분위기를 살려 읽어요", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 쓴 글자≠소리 → 겹받침이란 → 바른 소리 고르기 → 겹받침 낱말 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽어요", subtitle:"4단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글자와 소리가 다를 수 있음을 알아봐요","겹받침이 무엇인지 알아봐요","겹받침 낱말의 바른 소리를 찾아봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"쓸 때와 읽을 때가 달라요 🤔", visual:"🐔", question:"\"닭\"은 글자에 받침이 두 개인데, 읽을 땐 [닥]이라고 해요.<br>왜 그럴까요?"}, suggested_extras:["q_sound","r_life"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침이란", content:"받침에 **서로 다른 두 자음**이 함께 오는 것을 **겹받침**이라고 해요. \"닭(ㄺ)\" \"값(ㅄ)\"처럼요. 쓸 땐 **두 글자**를 다 쓰지만, 읽을 땐 **하나의 소리**만 나요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"ㄺ은 [ㄱ] 소리"},{symbol:"값 → [갑]", meaning:"ㅄ은 [ㅂ] 소리"},{symbol:"앉다 → [안따]", meaning:"ㄵ은 [ㄴ] 소리"},{symbol:"쓸 땐 두 글자", meaning:"받침을 다 써요"}]}, suggested_extras:["t_concept","x_write"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🔊", sub:"겹받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"닭\"은 어떻게 읽을까요?", emoji:"🐔", name:"[닥]"},{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"},{clue:"\"흙\"은 어떻게 읽을까요?", emoji:"🟤", name:"[흑]"}], outro:"쓸 땐 두 글자, 읽을 땐 한 소리! 겹받침의 비밀이에요. 더 찾아볼까요? 😊"}, suggested_extras:["q_more","g_sound"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 떠올려요", question:"겹받침이 들어간 낱말을 떠올려 볼까요?", items:["받침이 두 글자인 낱말을 본 적 있나요?","'닭·값' 말고 또 어떤 낱말이 있을까요?","그 낱말은 어떻게 읽을까요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글자와 소리가 다를 수 있음을 알았어요","겹받침이 무엇인지 알았어요","겹받침 낱말의 바른 소리를 찾았어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽으면 좋은 점", body:"다음 시간에는 글이나 시를 분위기에 맞게 읽으면 무엇이 좋은지 알아볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"어려운 낱말", content:"\"읽기 어려웠던 낱말이 있나요?\" 겹받침을 자연스럽게 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '겹받침 바르게 읽고 쓰기 + 분위기 살려 읽기' 두 축이에요. 도입에선 겹받침을 가볍게 소개하세요.", fit_slides:["objective","cover"]},
      {id:"q_sound", type:"fun_question", icon:"🐔", title:"왜 다를까", content:"\"왜 쓸 때와 읽을 때가 다를까요?\" 호기심을 열어요.", fit_slides:["motivate"]},
      {id:"r_life", type:"real_world", icon:"🌍", title:"생활 속 낱말", content:"닭·값·흙처럼 자주 쓰는 겹받침 낱말과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"소리는 하나", content:"겹받침은 쓸 땐 두 글자, 읽을 땐 한 소리임을 또렷이 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_write", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"읽을 때 한 소리라고 쓸 때 받침을 빠뜨리지 않게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"q_more", type:"fun_question", icon:"💡", title:"또 있을까", content:"\"겹받침 낱말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sound", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 바른 소리를 짝지어 보세요.", hint:"읽을 때 소리를 떠올려요.", pairs:[{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"가볍게", content:"겹받침 낱말을 자유롭게 떠올려 말하게 해 부담을 줄이세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"받침 살펴보기", content:"\"이 낱말의 받침은 어떤 두 글자일까요?\" 겹받침을 살펴요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 쓸 때와 읽을 때가 어떻게 다르죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 분위기를 살려 읽으면 좋은 점을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 분위기를 살려 읽으면 좋은 점 (준비) ---------------- */
  window.LESSONS["u4_l02"] = {
    meta: {grade:2, subject:"국어", unit:4, n:2, title:"분위기를 살려 읽으면 좋은 점", std:"[2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 같은 글 다르게 읽기 → 분위기란 → 분위기에 맞는 읽기 고르기 → 분위기 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽으면 좋은 점", subtitle:"4단원 · 2/15차시 · 준비"}, suggested_extras:["q_mood2","t_mood2"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["같은 글도 다르게 읽힘을 느껴요","분위기가 무엇인지 알아봐요","분위기를 살려 읽으면 좋은 점을 알아봐요"]}, suggested_extras:["t_mood2"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"같은 글, 다른 목소리 🎭", visual:"🎭", question:"신나는 시를 큰 목소리로, 조용한 시를 작은 목소리로 읽으면?<br>느낌이 어떻게 달라질까요?"}, suggested_extras:["q_voice2","r_mood2"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기란", content:"**분위기**는 글이나 시에서 느껴지는 **느낌**이에요. 신나는·조용한·포근한 분위기가 있어요. 분위기에 맞게 **목소리·빠르기**를 조절해 읽으면 글의 느낌이 더 잘 **살아나요**!", symbol_meanings:[{symbol:"신나는 분위기", meaning:"밝고 빠르게"},{symbol:"조용한 분위기", meaning:"잔잔하고 천천히"},{symbol:"포근한 분위기", meaning:"부드럽고 따뜻하게"},{symbol:"분위기에 맞게", meaning:"목소리·빠르기 조절"}]}, suggested_extras:["t_mood2b","x_loud2"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 분위기엔 어떻게 읽을까? 🎭", sub:"분위기에 어울리는 읽기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 운동회 시는?", emoji:"🎉", name:"밝고 힘차게, 빠르게"},{clue:"잠드는 밤을 그린 시는?", emoji:"🌙", name:"잔잔하고 천천히, 작게"},{clue:"포근한 봄날 시는?", emoji:"🌸", name:"부드럽고 따뜻하게"}], outro:"분위기에 맞게 읽으니 느낌이 더 잘 살아나요. 분위기를 떠올려 볼까요? 😊"}, suggested_extras:["q_pick2","g_mood2"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 떠올려요", question:"어떤 분위기를 느껴 본 적 있나요?", items:["신났던 순간은 언제였나요?","조용하고 차분했던 때는요?","그때 목소리는 어땠나요?"]}, suggested_extras:["t_present2","e_mood2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["같은 글도 다르게 읽힘을 느꼈어요","분위기가 무엇인지 알았어요","분위기를 살려 읽으면 좋은 점을 알았어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 읽고 써요", body:"다음 시간에는 겹받침이 있는 낱말을 바르게 읽고 쓰는 법을 배워 볼 거예요!"}, suggested_extras:["e_double2"]}
    ],
    extras: [
      {id:"q_mood2", type:"fun_question", icon:"💡", title:"느낌 떠올리기", content:"\"기분이 좋을 때와 차분할 때 목소리가 어떻게 다른가요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood2", type:"tip", icon:"🧩", title:"분위기 감각", content:"분위기는 글에서 느껴지는 느낌임을 여러 예로 느끼게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_voice2", type:"fun_question", icon:"🎭", title:"목소리의 힘", content:"\"목소리를 바꾸면 느낌이 어떻게 달라질까요?\" 표현의 힘을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_mood2", type:"real_world", icon:"🌍", title:"이야기 들려주기", content:"동화를 실감 나게 들려주는 목소리와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mood2b", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 맞게 목소리 크기와 빠르기를 조절함을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_loud2", type:"misconception", icon:"❓", title:"무조건 크게 아님", content:"무조건 크게 읽는 게 아니라 분위기에 맞게 읽는 것임을 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_pick2", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"이 시는 왜 그렇게 읽으면 좋을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_mood2", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽는 법 짝짓기", description:"분위기와 어울리는 읽기를 짝지어 보세요.", hint:"느낌에 맞는 목소리를 떠올려요.", pairs:[{a:{text:"🎉 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 조용한"},b:{text:"잔잔하고 천천히"}},{a:{text:"🌸 포근한"},b:{text:"부드럽게"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"경험과 잇기", content:"분위기를 자신의 경험·목소리와 이어 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood2", type:"extension", icon:"⬆", title:"분위기 더 찾기", content:"\"또 어떤 분위기가 있을까요? (무서운·즐거운)\" 분위기를 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살려 읽으면 무엇이 좋죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_double2", type:"extension", icon:"⬆", title:"겹받침 예고", content:"\"다음엔 겹받침 낱말을 읽고 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 겹받침 낱말 읽고 쓰기 ① (ㄺ) ---------------- */
  window.LESSONS["u4_l03"] = {
    meta: {grade:2, subject:"국어", unit:4, n:3, title:"겹받침 낱말을 읽고 써요 ①", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄺ 받침 → 소리와 표기 → 바른 소리 고르기 → 겹받침 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_rk","t_rk"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㄺ 받침 낱말을 바르게 읽어요","소리와 글자가 다름을 알아봐요","겹받침 낱말을 바르게 써요"]}, suggested_extras:["t_rk"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"닭이 읽다 흙을 밟다 🐔", visual:"🐔", question:"\"닭·읽다·흙\"에는 모두 ㄺ 받침이 있어요.<br>이 낱말들은 어떻게 읽을까요?"}, suggested_extras:["q_rk2","r_rk"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"ㄺ 받침의 소리", content:"**ㄺ** 받침은 보통 **[ㄱ]** 소리로 읽어요. \"닭→[닥]\" \"읽다→[익따]\" \"흙→[흑]\"처럼요. 쓸 땐 **ㄹ과 ㄱ 두 글자**를 다 써야 해요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"ㄺ은 [ㄱ]"},{symbol:"읽다 → [익따]", meaning:"ㄺ은 [ㄱ]"},{symbol:"흙 → [흑]", meaning:"ㄺ은 [ㄱ]"},{symbol:"맑다 → [막따]", meaning:"ㄺ은 [ㄱ]"}]}, suggested_extras:["t_rk3","x_rk"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🔊", sub:"ㄺ 받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"읽다\"는 어떻게 읽을까요?", emoji:"📖", name:"[익따]"},{clue:"\"맑다\"는 어떻게 읽을까요?", emoji:"☀️", name:"[막따]"},{clue:"\"닭\"은 어떻게 읽을까요?", emoji:"🐔", name:"[닥]"}], outro:"ㄺ 받침은 [ㄱ] 소리! 쓸 땐 두 글자 다 써요. 따라 써 볼까요? 😊"}, suggested_extras:["q_rk4","g_rk"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 따라 써요 ✍️", content:"ㄺ 받침 낱말을 또박또박 따라 써 봐요. 받침에 **ㄹ과 ㄱ**을 모두 써야 해요. **닭 · 읽다 · 흙**을 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 ㄹ+ㄱ"},{symbol:"읽다", meaning:"받침 ㄹ+ㄱ"},{symbol:"흙", meaning:"받침 ㄹ+ㄱ"}]}, suggested_extras:["t_trace3","e_rk"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㄺ 받침 낱말을 바르게 읽었어요","소리와 글자가 다름을 알았어요","겹받침 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"또 다른 겹받침을 배워요", body:"다음 시간에는 ㄵ·ㄼ 같은 또 다른 겹받침 낱말을 읽고 써 볼 거예요!"}, suggested_extras:["e_double3"]}
    ],
    extras: [
      {id:"q_rk", type:"fun_question", icon:"💡", title:"받침 살펴보기", content:"\"'닭'의 받침은 어떤 글자로 되어 있나요?\" 겹받침을 살펴요.", fit_slides:["cover","motivate"]},
      {id:"t_rk", type:"tip", icon:"🧩", title:"소리는 하나", content:"ㄺ은 [ㄱ] 한 소리로 남을 반복해 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_rk2", type:"fun_question", icon:"🐔", title:"어떻게 읽을까", content:"\"이 낱말들을 소리 내어 읽어 볼까요?\" 직접 읽게 해요.", fit_slides:["motivate"]},
      {id:"r_rk", type:"real_world", icon:"🌍", title:"자주 쓰는 낱말", content:"닭·읽다·맑다처럼 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_rk3", type:"tip", icon:"🧩", title:"규칙 익히기", content:"ㄺ→[ㄱ] 규칙을 여러 낱말로 반복 연습하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_rk", type:"misconception", icon:"❓", title:"받침 다 쓰기", content:"[닥]으로 들린다고 '닥'으로 쓰지 않게, 받침을 다 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_rk4", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"ㄺ 받침 낱말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_rk", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"ㄺ 받침 낱말과 소리를 짝지어 보세요.", hint:"[ㄱ] 소리를 떠올려요.", pairs:[{a:{text:"📖 읽다"},b:{text:"[익따]"}},{a:{text:"☀️ 맑다"},b:{text:"[막따]"}},{a:{text:"🐔 닭"},b:{text:"[닥]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace3", type:"tip", icon:"✍️", title:"받침 다 쓰기", content:"따라 쓸 때 받침 ㄹ과 ㄱ을 모두 쓰는지 살피게 하세요.", fit_slides:["concept"]},
      {id:"e_rk", type:"extension", icon:"⬆", title:"문장에 넣기", content:"\"'맑다'로 짧은 문장을 만들어 볼까요?\" 활용을 넓혀요.", fit_slides:["concept"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"ㄺ 받침은 어떤 소리로 읽죠?\" [ㄱ]을 짚어요.", fit_slides:["summary"]},
      {id:"e_double3", type:"extension", icon:"⬆", title:"겹받침 예고", content:"\"다음엔 ㄵ·ㄼ 받침을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 겹받침 낱말 읽고 쓰기 ② (ㄵ·ㄼ) ---------------- */
  window.LESSONS["u4_l04"] = {
    meta: {grade:2, subject:"국어", unit:4, n:4, title:"겹받침 낱말을 읽고 써요 ②", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄵ·ㄼ 받침 → 소리 규칙 → 바른 소리 고르기 → 겹받침 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_nj"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㄵ·ㄼ 받침 낱말을 바르게 읽어요","겹받침마다 소리가 다름을 알아봐요","겹받침 낱말을 바르게 써요"]}, suggested_extras:["t_nj"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"앉다, 짧다, 넓다 🪑", visual:"🪑", question:"\"앉다(ㄵ)·짧다(ㄼ)·넓다(ㄼ)\"는 어떻게 읽을까요?<br>받침이 다르면 소리도 다를까요?"}, suggested_extras:["q_nj2","r_nj"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"ㄵ·ㄼ 받침의 소리", content:"**ㄵ** 받침은 **[ㄴ]** 소리로, **ㄼ** 받침은 보통 **[ㄹ]** 소리로 읽어요. \"앉다→[안따]\" \"많다→[만타]\" \"짧다→[짤따]\" \"넓다→[널따]\"처럼요!", symbol_meanings:[{symbol:"앉다 → [안따]", meaning:"ㄵ은 [ㄴ]"},{symbol:"많다 → [만타]", meaning:"ㄶ은 [ㄴ]"},{symbol:"짧다 → [짤따]", meaning:"ㄼ은 [ㄹ]"},{symbol:"넓다 → [널따]", meaning:"ㄼ은 [ㄹ]"}]}, suggested_extras:["t_nj3","x_nj"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🔊", sub:"ㄵ·ㄼ 받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"앉다\"는 어떻게 읽을까요?", emoji:"🪑", name:"[안따]"},{clue:"\"넓다\"는 어떻게 읽을까요?", emoji:"🛣️", name:"[널따]"},{clue:"\"많다\"는 어떻게 읽을까요?", emoji:"🔢", name:"[만타]"}], outro:"받침마다 소리가 달라요. 쓸 땐 두 글자 다 써요. 따라 써 볼까요? 😊"}, suggested_extras:["q_nj4","g_nj"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 따라 써요 ✍️", content:"ㄵ·ㄼ 받침 낱말을 또박또박 따라 써 봐요. 받침의 **두 글자**를 모두 써야 해요. **앉다 · 짧다 · 넓다**를 바르게 써 보세요!", symbol_meanings:[{symbol:"앉다", meaning:"받침 ㄴ+ㅈ"},{symbol:"짧다", meaning:"받침 ㄹ+ㅂ"},{symbol:"넓다", meaning:"받침 ㄹ+ㅂ"}]}, suggested_extras:["t_trace4","e_nj"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㄵ·ㄼ 받침 낱말을 바르게 읽었어요","겹받침마다 소리가 다름을 알았어요","겹받침 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침을 정리해요", body:"다음 시간에는 배운 겹받침을 모아 정리하고 다양한 낱말로 연습해 볼 거예요!"}, suggested_extras:["e_sum4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 받침", content:"\"지난 시간 ㄺ 받침은 어떤 소리였죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_nj", type:"tip", icon:"🧩", title:"받침마다 소리", content:"겹받침마다 대표 소리가 다름을 비교해 익히게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_nj2", type:"fun_question", icon:"🪑", title:"어떻게 읽을까", content:"\"이 낱말들을 소리 내어 읽어 볼까요?\" 직접 읽게 해요.", fit_slides:["motivate"]},
      {id:"r_nj", type:"real_world", icon:"🌍", title:"자주 쓰는 낱말", content:"앉다·넓다·많다처럼 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_nj3", type:"tip", icon:"🧩", title:"규칙 비교", content:"ㄵ→[ㄴ], ㄼ→[ㄹ]을 비교해 익히게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_nj", type:"misconception", icon:"❓", title:"받침 다 쓰기", content:"소리만 듣고 받침을 빠뜨리지 않게, 두 글자를 다 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_nj4", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"ㄵ·ㄼ 받침 낱말이 또 있을까요? (여덟)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_nj", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"ㄵ·ㄼ 받침 낱말과 소리를 짝지어 보세요.", hint:"받침의 소리를 떠올려요.", pairs:[{a:{text:"🪑 앉다"},b:{text:"[안따]"}},{a:{text:"🛣️ 넓다"},b:{text:"[널따]"}},{a:{text:"🔢 많다"},b:{text:"[만타]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace4", type:"tip", icon:"✍️", title:"받침 다 쓰기", content:"따라 쓸 때 받침 두 글자를 모두 쓰는지 살피게 하세요.", fit_slides:["concept"]},
      {id:"e_nj", type:"extension", icon:"⬆", title:"문장에 넣기", content:"\"'넓다'로 짧은 문장을 만들어 볼까요?\" 활용을 넓혀요.", fit_slides:["concept"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"ㄵ·ㄼ 받침은 어떤 소리로 읽죠?\" [ㄴ]·[ㄹ]을 짚어요.", fit_slides:["summary"]},
      {id:"e_sum4", type:"extension", icon:"⬆", title:"정리 예고", content:"\"다음엔 겹받침을 모아 정리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 겹받침 낱말 읽고 쓰기 ③ (정리) ---------------- */
  window.LESSONS["u4_l05"] = {
    meta: {grade:2, subject:"국어", unit:4, n:5, title:"겹받침 낱말을 읽고 써요 ③", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 모아 보기 → 소리 규칙 정리 → 낱말↔소리 잇기 → 겹받침 낱말 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_sum5","t_sum5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["배운 겹받침을 모아 정리해요","겹받침 소리 규칙을 익혀요","겹받침 낱말을 바르게 읽고 말해요"]}, suggested_extras:["t_sum5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 모아 봐요 📚", visual:"📚", question:"ㄺ·ㄵ·ㄼ… 여러 겹받침을 배웠어요.<br>각각 어떤 소리로 읽는지 기억나나요?"}, suggested_extras:["q_recall5","r_sum5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 소리 정리", content:"겹받침은 보통 **하나의 소리**로 읽어요. **ㄺ→[ㄱ]**(닭), **ㄵ→[ㄴ]**(앉다), **ㄼ→[ㄹ]**(넓다), **ㅄ→[ㅂ]**(값). 쓸 땐 받침 **두 글자**를 다 쓰는 것을 잊지 말아요!", symbol_meanings:[{symbol:"ㄺ → [ㄱ]", meaning:"닭·읽다·흙"},{symbol:"ㄵ → [ㄴ]", meaning:"앉다"},{symbol:"ㄼ → [ㄹ]", meaning:"넓다·짧다"},{symbol:"ㅄ → [ㅂ]", meaning:"값·없다"}]}, suggested_extras:["t_sum5b","x_sum5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낱말과 소리를 이어요 🔗", sub:"겹받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"},{clue:"\"여덟\"은 어떻게 읽을까요?", emoji:"8️⃣", name:"[여덜]"},{clue:"\"몫\"은 어떻게 읽을까요?", emoji:"🍰", name:"[목]"}], outro:"겹받침 소리를 잘 익혔어요. 겹받침 낱말로 말해 볼까요? 😊"}, suggested_extras:["q_pick5","g_sum5"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말로 말해요", question:"겹받침 낱말을 넣어 말해 볼까요?", items:["겹받침 낱말 하나를 골라 볼까요?","그 낱말은 어떻게 읽나요?","그 낱말로 짧은 문장을 만들어 볼까요?"]}, suggested_extras:["t_present5","e_sum5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["배운 겹받침을 모아 정리했어요","겹받침 소리 규칙을 익혔어요","겹받침 낱말을 바르게 읽고 말했어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글에서 겹받침을 찾아요", body:"다음 시간에는 글을 읽으며 겹받침 낱말을 찾아 바르게 읽어 볼 거예요!"}, suggested_extras:["e_read5"]}
    ],
    extras: [
      {id:"q_sum5", type:"fun_question", icon:"💡", title:"기억나는 받침", content:"\"지금까지 배운 겹받침 중 기억나는 것을 말해 볼까요?\" 정리를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_sum5", type:"tip", icon:"🧩", title:"규칙 모으기", content:"겹받침별 대표 소리를 한눈에 모아 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_recall5", type:"fun_question", icon:"📚", title:"어떤 소리?", content:"\"ㄺ·ㄵ·ㄼ은 각각 어떤 소리였죠?\" 규칙을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_sum5", type:"real_world", icon:"🌍", title:"낱말 찾기", content:"교실·책에서 겹받침 낱말을 찾아본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_sum5b", type:"tip", icon:"🧩", title:"읽기·쓰기 함께", content:"읽는 소리와 쓰는 글자를 함께 정리하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_sum5", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"한 소리로 읽힌다고 받침을 하나만 쓰지 않게 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_pick5", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"겹받침 낱말을 더 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sum5", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"대표 소리를 떠올려요.", pairs:[{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}},{a:{text:"🍰 몫"},b:{text:"[목]"}}], fit_slides:["card_quiz"]},
      {id:"t_present5", type:"tip", icon:"🗣", title:"문장으로", content:"겹받침 낱말을 넣어 짧은 문장을 만들어 말하게 하세요.", fit_slides:["question"]},
      {id:"e_sum5", type:"extension", icon:"⬆", title:"낱말 모으기", content:"\"우리 반 겹받침 낱말 사전을 만들어 볼까요?\" 활동을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 쓸 때와 읽을 때 어떻게 다르죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_read5", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 글에서 겹받침을 찾아요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 글에서 겹받침 찾기 ① ---------------- */
  window.LESSONS["u4_l06"] = {
    meta: {grade:2, subject:"국어", unit:4, n:6, title:"글에서 겹받침을 찾아 읽어요 ①", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 글 속 겹받침 → 찾으며 읽기 → 글에서 겹받침 모두 찾기 → 바르게 소리 내어 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"글에서 겹받침을 찾아 읽어요", subtitle:"4단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_find6","t_find6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글 속에서 겹받침 낱말을 찾아요","찾은 낱말을 바르게 읽어요","글을 또박또박 소리 내어 읽어요"]}, suggested_extras:["t_find6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글 속에 숨은 겹받침 🔍", visual:"📖", question:"\"맑은 하늘 아래 닭이 흙을 밟고 앉았다.\"<br>이 글에 겹받침 낱말이 몇 개나 숨어 있을까요?"}, suggested_extras:["q_hidden6","r_find6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글 속 겹받침 찾기", content:"글을 읽을 땐 겹받침 낱말을 **찾아 바르게 읽어요**. \"**맑은**[말근]\" \"**닭**[닥]\" \"**밟고**[밥꼬]\" \"**앉았다**[안잗따]\"처럼요. 찾아 읽으면 글을 더 **또박또박** 읽을 수 있어요!", symbol_meanings:[{symbol:"맑은 → [말근]", meaning:"ㄺ + 모음"},{symbol:"닭 → [닥]", meaning:"ㄺ은 [ㄱ]"},{symbol:"밟고 → [밥꼬]", meaning:"ㄼ은 [ㅂ](밟다)"},{symbol:"앉았다", meaning:"ㄵ받침 낱말"}]}, suggested_extras:["t_find6b","x_find6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"글 속 겹받침을 찾아요 🔍", sub:"문장 속 겹받침 낱말을 찾아봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"하늘이 맑다.\"에서 겹받침은?", emoji:"☀️", name:"맑다 [막따]"},{clue:"\"책을 읽다.\"에서 겹받침은?", emoji:"📖", name:"읽다 [익따]"},{clue:"\"값이 싸다.\"에서 겹받침은?", emoji:"💰", name:"값 [갑]"}], outro:"글 속 겹받침을 잘 찾았어요. 바르게 소리 내어 읽어 볼까요? 😊"}, suggested_extras:["q_more6","g_find6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"바르게 소리 내어 읽어요", question:"겹받침에 주의하며 글을 읽어 볼까요?", items:["글에서 겹받침 낱말을 찾았나요?","그 낱말을 바르게 읽었나요?","또박또박 소리 내어 읽어 볼까요?"]}, suggested_extras:["t_present6","e_read6"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글 속에서 겹받침 낱말을 찾았어요","찾은 낱말을 바르게 읽었어요","글을 또박또박 소리 내어 읽었어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"띄어 읽으며 글을 읽어요", body:"다음 시간에는 겹받침에 주의하며 알맞게 띄어 읽는 법을 배워 볼 거예요!"}, suggested_extras:["e_space6"]}
    ],
    extras: [
      {id:"q_find6", type:"fun_question", icon:"💡", title:"숨은 겹받침", content:"\"이 문장에 겹받침이 몇 개 있을까요?\" 찾기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_find6", type:"tip", icon:"🧩", title:"찾으며 읽기", content:"글을 읽으며 겹받침 낱말을 찾아 바르게 읽게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_hidden6", type:"fun_question", icon:"📖", title:"몇 개일까", content:"\"이 글에 겹받침 낱말이 몇 개 있을까요?\" 함께 찾아요.", fit_slides:["motivate"]},
      {id:"r_find6", type:"real_world", icon:"🌍", title:"책 속 낱말", content:"읽고 있는 책에서 겹받침 낱말을 찾아보게 해요.", fit_slides:["motivate"]},
      {id:"t_find6b", type:"tip", icon:"🧩", title:"바르게 읽기", content:"찾은 낱말을 바른 소리로 읽으며 확인하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_find6", type:"misconception", icon:"❓", title:"천천히 정확히", content:"빨리 찾기보다 정확히 찾아 바르게 읽는 데 초점을 두게 하세요.", fit_slides:["concept"]},
      {id:"q_more6", type:"fun_question", icon:"💡", title:"또 어디에?", content:"\"이 문장에 겹받침이 또 있을까요?\" 더 찾아요.", fit_slides:["card_quiz"]},
      {id:"g_find6", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"글 속 겹받침 낱말과 소리를 짝지어 보세요.", hint:"바른 소리를 떠올려요.", pairs:[{a:{text:"☀️ 맑다"},b:{text:"[막따]"}},{a:{text:"📖 읽다"},b:{text:"[익따]"}},{a:{text:"💰 값"},b:{text:"[갑]"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"또박또박", content:"겹받침에 주의하며 또박또박 소리 내어 읽게 하세요.", fit_slides:["question"]},
      {id:"e_read6", type:"extension", icon:"⬆", title:"바꿔 읽기", content:"\"친구와 번갈아 한 문장씩 읽어 볼까요?\" 읽기를 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"글에서 겹받침을 찾으면 무엇이 좋죠?\" 바르게 읽기를 짚어요.", fit_slides:["summary"]},
      {id:"e_space6", type:"extension", icon:"⬆", title:"띄어 읽기 예고", content:"\"다음엔 알맞게 띄어 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 글에서 겹받침 찾기 ② (띄어 읽기) ---------------- */
  window.LESSONS["u4_l07"] = {
    meta: {grade:2, subject:"국어", unit:4, n:7, title:"글에서 겹받침을 찾아 읽어요 ②", std:"[2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 띄어 읽기란 → 어디서 띄어 읽나 → 알맞은 띄어 읽기 고르기 → 띄어 읽으며 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"글에서 겹받침을 찾아 읽어요", subtitle:"4단원 · 7/15차시 · 소단원 1"}, suggested_extras:["q_recall7","t_space7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["알맞게 띄어 읽는 법을 알아봐요","겹받침에 주의하며 띄어 읽어요","글의 내용을 이해하며 읽어요"]}, suggested_extras:["t_space7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어디서 쉬어 읽을까? ⏸️", visual:"📑", question:"\"맑은하늘에닭이앉았다\"를 다 붙여 읽으면 답답해요.<br>어디서 쉬어 읽으면 좋을까요?"}, suggested_extras:["q_space7","r_space7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"알맞게 띄어 읽기", content:"글을 읽을 땐 **뜻이 묶이는 곳**에서 살짝 쉬어 읽어요. \"맑은 하늘에 / 닭이 앉았다\"처럼요. 알맞게 띄어 읽으면 **뜻이 잘 전해지고** 듣기에도 편해요!", symbol_meanings:[{symbol:"뜻 묶음", meaning:"의미가 묶이는 곳"},{symbol:"살짝 쉬기", meaning:"한 박자 쉬어요"},{symbol:"문장 부호에서", meaning:"쉼표·마침표에서 쉬어요"},{symbol:"뜻이 잘 전해져요", meaning:"내용 이해가 쉬워요"}]}, suggested_extras:["t_space7b","x_space7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞게 띄어 읽은 것은? ⏸️", sub:"알맞게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"작은 새가 / 즐겁게 노래한다\"", emoji:"🐦", name:"알맞게 띄어 읽었어요"},{clue:"\"작은새가즐겁게노래한다\"", emoji:"😵", name:"다 붙여 읽어 답답해요"},{clue:"\"작은 / 새가 즐 / 겁게\"", emoji:"🙅", name:"엉뚱한 곳에서 쉬어 어색해요"}], outro:"뜻이 묶이는 곳에서 쉬어 읽으니 잘 들려요. 띄어 읽어 볼까요? 😊"}, suggested_extras:["q_good7","g_space7"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"띄어 읽으며 읽어요", question:"겹받침에 주의하며 띄어 읽어 볼까요?", items:["어디서 쉬어 읽으면 좋을까요?","겹받침 낱말을 바르게 읽었나요?","뜻이 잘 전해지게 읽었나요?"]}, suggested_extras:["t_present7","e_read7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["알맞게 띄어 읽는 법을 알았어요","겹받침에 주의하며 띄어 읽었어요","뜻을 이해하며 읽었어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시의 분위기를 살펴봐요", body:"다음 시간에는 시를 읽으며 어떤 분위기인지 살펴볼 거예요!"}, suggested_extras:["e_mood7"]}
    ],
    extras: [
      {id:"q_recall7", type:"fun_question", icon:"💡", title:"붙여 읽기", content:"\"글자를 다 붙여 읽으면 어떤 느낌일까요?\" 띄어 읽기의 필요를 느끼게 해요.", fit_slides:["cover","motivate"]},
      {id:"t_space7", type:"tip", icon:"🧩", title:"뜻 묶음", content:"뜻이 묶이는 곳에서 쉬어 읽음을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_space7", type:"fun_question", icon:"📑", title:"어디서 쉴까", content:"\"이 문장은 어디서 쉬어 읽으면 좋을까요?\" 함께 찾아요.", fit_slides:["motivate"]},
      {id:"r_space7", type:"real_world", icon:"🌍", title:"읽어 주기", content:"동화를 읽어 줄 때 쉬어 읽던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_space7b", type:"tip", icon:"🧩", title:"부호에서 쉬기", content:"쉼표·마침표 같은 문장 부호에서 쉬어 읽음을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_space7", type:"misconception", icon:"❓", title:"엉뚱한 곳 주의", content:"낱말 가운데서 끊지 않게, 뜻 묶음에서 쉬게 하세요.", fit_slides:["concept"]},
      {id:"q_good7", type:"fun_question", icon:"💡", title:"왜 알맞을까", content:"\"이 띄어 읽기가 왜 알맞을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_space7", type:"game", game_kind:"memory_match", icon:"🎮", title:"읽기 ↔ 판단 짝짓기", description:"띄어 읽기와 판단을 짝지어 보세요.", hint:"뜻이 잘 전해지는지 생각해요.", pairs:[{a:{text:"🐦 뜻 묶음에서"},b:{text:"알맞음"}},{a:{text:"😵 다 붙여"},b:{text:"답답함"}},{a:{text:"🙅 낱말 가운데"},b:{text:"어색함"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"표시하며", content:"쉬어 읽을 곳에 살짝 표시하며 읽게 하면 도움이 돼요.", fit_slides:["question"]},
      {id:"e_read7", type:"extension", icon:"⬆", title:"바꿔 읽기", content:"\"띄어 읽기를 바꾸면 느낌이 달라질까요?\" 비교해 읽어요.", fit_slides:["question"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"띄어 읽으면 무엇이 좋죠?\" 뜻 전하기를 짚어요.", fit_slides:["summary"]},
      {id:"e_mood7", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시의 분위기를 살펴봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 시의 분위기 살펴보기 ① ---------------- */
  window.LESSONS["u4_l08"] = {
    meta: {grade:2, subject:"국어", unit:4, n:8, title:"시의 분위기를 살펴봐요 ①", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 자체 동시 「공놀이」 → 말·장면으로 분위기 → 분위기 고르기 → 분위기 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_poem8","t_poem8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시를 읽고 분위기를 느껴요","어떤 말·장면이 분위기를 만드는지 알아봐요","시의 분위기를 말로 표현해요"]}, suggested_extras:["t_poem8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"동시 「공놀이」 ⚽", visual:"⚽", question:"\"통통 공이 / 콩콩 뛰어요 / 친구들 웃음 / 깔깔 터져요\"<br>이 시는 어떤 분위기일까요?"}, suggested_extras:["q_feel8","r_poem8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"말과 장면이 분위기를 만들어요", content:"시의 분위기는 **쓰인 말**과 **그려지는 장면**에서 느껴져요. \"통통·콩콩·깔깔\" 같은 밝은 말과 친구들이 웃는 장면은 **신나는 분위기**를 만들어요!", symbol_meanings:[{symbol:"밝은 말", meaning:"통통·콩콩·깔깔"},{symbol:"즐거운 장면", meaning:"친구들이 웃어요"},{symbol:"신나는 분위기", meaning:"밝고 즐거운 느낌"},{symbol:"말·장면 살피기", meaning:"분위기를 찾아요"}]}, suggested_extras:["t_poem8b","x_poem8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기? 🎭", sub:"짧은 시의 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 공이 콩콩 / 깔깔 웃음 터져요\"", emoji:"⚽", name:"신나고 즐거운 분위기"},{clue:"\"달님이 살며시 / 창가에 앉아요\"", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"빗방울 또독또독 / 우산 위에 노래해요\"", emoji:"☔", name:"잔잔하고 정겨운 분위기"}], outro:"말과 장면을 살피니 분위기가 느껴져요. 분위기를 말해 볼까요? 😊"}, suggested_extras:["q_pick8","g_poem8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"시의 분위기를 말해요", question:"시를 읽고 느낀 분위기를 말해 볼까요?", items:["이 시는 어떤 분위기인가요?","어떤 말에서 그렇게 느꼈나요?","어떤 장면이 떠오르나요?"]}, suggested_extras:["t_present8","e_poem8"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시를 읽고 분위기를 느꼈어요","말·장면이 분위기를 만듦을 알았어요","시의 분위기를 말로 표현했어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 더 살펴봐요", body:"다음 시간에는 여러 시의 분위기를 비교하며 더 자세히 살펴볼 거예요!"}, suggested_extras:["e_poem8b"]}
    ],
    extras: [
      {id:"q_poem8", type:"fun_question", icon:"💡", title:"좋아하는 시", content:"\"기억에 남는 시나 노래가 있나요?\" 시를 가깝게 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_poem8", type:"tip", icon:"🧩", title:"분위기 찾기", content:"시의 말과 장면에서 분위기를 찾는 데 초점을 두게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_feel8", type:"fun_question", icon:"⚽", title:"어떤 느낌", content:"\"이 시를 읽으면 어떤 느낌이 드나요?\" 분위기를 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_poem8", type:"real_world", icon:"🌍", title:"놀이의 즐거움", content:"공놀이·친구와 논 즐거운 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_poem8b", type:"tip", icon:"🧩", title:"말·장면 살피기", content:"어떤 말과 장면이 분위기를 만드는지 함께 찾게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_poem8", type:"misconception", icon:"❓", title:"느낌은 다양", content:"분위기에 정답을 강요하지 말고 다양한 느낌을 인정하세요.", fit_slides:["concept"]},
      {id:"q_pick8", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"왜 그런 분위기로 느꼈나요?\" 까닭을 묻어요.", fit_slides:["card_quiz"]},
      {id:"g_poem8", type:"game", game_kind:"memory_match", icon:"🎮", title:"시 ↔ 분위기 짝짓기", description:"짧은 시와 분위기를 짝지어 보세요.", hint:"말과 장면을 떠올려요.", pairs:[{a:{text:"⚽ 통통 콩콩"},b:{text:"신나는"}},{a:{text:"🌙 달님 살며시"},b:{text:"포근한"}},{a:{text:"☔ 빗방울 또독"},b:{text:"잔잔한"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"까닭과 함께", content:"분위기를 느낀 까닭(말·장면)과 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_poem8", type:"extension", icon:"⬆", title:"장면 그리기", content:"\"이 시의 장면을 그림으로 그린다면?\" 상상을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기는 무엇에서 느껴지죠?\" 말·장면을 짚어요.", fit_slides:["summary"]},
      {id:"e_poem8b", type:"extension", icon:"⬆", title:"분위기 비교 예고", content:"\"다음엔 여러 시의 분위기를 비교해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 시의 분위기 살펴보기 ② (비교) ---------------- */
  window.LESSONS["u4_l09"] = {
    meta: {grade:2, subject:"국어", unit:4, n:9, title:"시의 분위기를 살펴봐요 ②", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기 비교 → 밝은 말·잔잔한 말 → 분위기 만드는 말 모으기 → 분위기 까닭 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_recall9","t_compare9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 시의 분위기를 비교해요","분위기를 만드는 말을 찾아요","분위기를 느낀 까닭을 말해요"]}, suggested_extras:["t_compare9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기가 다른 두 시 🎭", visual:"🎭", question:"신나는 시와 조용한 시를 나란히 읽으면<br>어떤 점이 다르게 느껴질까요?"}, suggested_extras:["q_diff9","r_compare9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 만드는 말", content:"**밝고 빠른 말**(통통·깔깔)은 신나는 분위기를, **잔잔한 말**(살며시·또독또독)은 조용한 분위기를 만들어요. 시에 쓰인 말을 살피면 분위기를 더 잘 **느낄 수** 있어요!", symbol_meanings:[{symbol:"밝은 말", meaning:"통통·콩콩·깔깔"},{symbol:"잔잔한 말", meaning:"살며시·또독또독"},{symbol:"빠른 느낌", meaning:"신나는 분위기"},{symbol:"느린 느낌", meaning:"조용한 분위기"}]}, suggested_extras:["t_compare9b","x_compare9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어떤 분위기를 만들까? 🎨", sub:"말이 만드는 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"깔깔·신나게·펄쩍\" 같은 말은?", emoji:"🎉", name:"신나고 밝은 분위기"},{clue:"\"살며시·조용히·고요한\" 같은 말은?", emoji:"🌙", name:"조용하고 차분한 분위기"},{clue:"\"포근한·따뜻한·살포시\" 같은 말은?", emoji:"🧸", name:"포근하고 따뜻한 분위기"}], outro:"말을 살피니 분위기가 또렷이 보여요. 까닭을 말해 볼까요? 😊"}, suggested_extras:["q_word9","g_compare9"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 느낀 까닭을 말해요", question:"시의 분위기를 까닭과 함께 말해 볼까요?", items:["이 시는 어떤 분위기인가요?","어떤 말에서 그렇게 느꼈나요?","두 시는 어떤 점이 다른가요?"]}, suggested_extras:["t_present9","e_compare9"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["여러 시의 분위기를 비교했어요","분위기를 만드는 말을 찾았어요","분위기를 느낀 까닭을 말했어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽어요", body:"다음 시간에는 시의 분위기를 생각하며 소리 내어 읽는 법을 배워 볼 거예요!"}, suggested_extras:["e_read9"]}
    ],
    extras: [
      {id:"q_recall9", type:"fun_question", icon:"💡", title:"지난 시", content:"\"지난 시간 「공놀이」는 어떤 분위기였죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_compare9", type:"tip", icon:"🧩", title:"비교하기", content:"분위기가 다른 시를 나란히 비교하면 차이가 또렷해져요.", fit_slides:["objective","concept"]},
      {id:"q_diff9", type:"fun_question", icon:"🎭", title:"무엇이 다를까", content:"\"두 시는 어떤 점이 다른가요?\" 차이를 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_compare9", type:"real_world", icon:"🌍", title:"노래 분위기", content:"신나는 노래·잔잔한 노래의 분위기와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_compare9b", type:"tip", icon:"🧩", title:"말 살피기", content:"분위기를 만드는 말을 찾아 모아 보게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_compare9", type:"misconception", icon:"❓", title:"느낌은 다양", content:"분위기 느낌은 사람마다 다를 수 있음을 인정하세요.", fit_slides:["concept"]},
      {id:"q_word9", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"이 분위기를 만드는 말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_compare9", type:"game", game_kind:"memory_match", icon:"🎮", title:"말 ↔ 분위기 짝짓기", description:"말과 그 말이 만드는 분위기를 짝지어 보세요.", hint:"말의 느낌을 떠올려요.", pairs:[{a:{text:"🎉 깔깔·펄쩍"},b:{text:"신나는"}},{a:{text:"🌙 살며시·고요"},b:{text:"조용한"}},{a:{text:"🧸 포근·따뜻"},b:{text:"포근한"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"까닭과 함께", content:"분위기를 느낀 까닭(말)을 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_compare9", type:"extension", icon:"⬆", title:"분위기 바꾸기", content:"\"말을 바꾸면 분위기가 달라질까요?\" 상상을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기는 어떤 말이 만들죠?\" 밝은 말·잔잔한 말을 짚어요.", fit_slides:["summary"]},
      {id:"e_read9", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 분위기를 살려 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 분위기 살려 소리 내어 읽기 ① ---------------- */
  window.LESSONS["u4_l10"] = {
    meta: {grade:2, subject:"국어", unit:4, n:10, title:"분위기를 살려 소리 내어 읽어요 ①", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기에 맞는 목소리 → 빠르기·크기 조절 → 어울리는 읽기 고르기 → 분위기 살려 낭송"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 소리 내어 읽어요", subtitle:"4단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_read10","t_read10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기에 맞는 목소리를 알아봐요","빠르기와 크기를 조절해요","분위기를 살려 시를 읽어요"]}, suggested_extras:["t_read10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기에 맞게 읽어요 🎤", visual:"🎤", question:"신나는 시를 졸린 목소리로 읽으면 어떨까요?<br>분위기에 맞는 목소리는 어떤 목소리일까요?"}, suggested_extras:["q_voice10","r_read10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기에 맞는 목소리", content:"분위기에 맞게 **목소리 크기**와 **빠르기**를 조절해요. 신나는 시는 **밝고 빠르게**, 조용한 시는 **잔잔하고 천천히**, 포근한 시는 **부드럽게** 읽어요. 그러면 시의 느낌이 잘 살아나요!", symbol_meanings:[{symbol:"신나는 시", meaning:"밝고 빠르게"},{symbol:"조용한 시", meaning:"잔잔하고 천천히"},{symbol:"포근한 시", meaning:"부드럽고 따뜻하게"},{symbol:"띄어 읽기", meaning:"알맞게 쉬며"}]}, suggested_extras:["t_read10b","x_read10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떻게 읽을까? 🎤", sub:"분위기에 어울리는 읽기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 공이 콩콩\" 신나는 시는?", emoji:"⚽", name:"밝고 힘차게, 빠르게"},{clue:"\"달님이 살며시\" 조용한 시는?", emoji:"🌙", name:"잔잔하고 천천히, 작게"},{clue:"\"포근한 봄바람\" 포근한 시는?", emoji:"🌸", name:"부드럽고 따뜻하게"}], outro:"분위기에 맞게 읽으니 시가 살아나요. 직접 낭송해 볼까요? 😊"}, suggested_extras:["q_pick10","g_read10"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"분위기를 살려 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 시의 분위기에 맞게 목소리를 살려 읽어 봐요!", count:24, hint:"신나는 시는 밝게, 조용한 시는 잔잔하게 — 분위기에 맞는 목소리로 읽어요", end_msg:"모두 분위기를 멋지게 살려 낭송했어요! 👏"}, suggested_extras:["t_present10","e_read10"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기에 맞는 목소리를 알았어요","빠르기와 크기를 조절했어요","분위기를 살려 시를 읽었어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 더 읽어요", body:"다음 시간에는 친구들 앞에서 분위기를 살려 시를 낭송하고 들어 볼 거예요!"}, suggested_extras:["e_read10b"]}
    ],
    extras: [
      {id:"q_read10", type:"fun_question", icon:"💡", title:"목소리 바꾸기", content:"\"같은 글을 다른 목소리로 읽어 본 적 있나요?\" 낭송을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_read10", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 맞게 목소리 크기·빠르기를 조절하게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_voice10", type:"fun_question", icon:"🎤", title:"어울리는 목소리", content:"\"이 시에 어울리는 목소리는 어떤 목소리일까요?\" 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read10", type:"real_world", icon:"🌍", title:"낭송 듣기", content:"시 낭송·동화 구연을 들어 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read10b", type:"tip", icon:"🧩", title:"띄어 읽기 함께", content:"분위기 살리기와 알맞은 띄어 읽기를 함께 하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read10", type:"misconception", icon:"❓", title:"분위기에 맞게", content:"무조건 크거나 빠르게가 아니라 분위기에 맞게 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_pick10", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"이 시를 왜 그렇게 읽으면 좋을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read10", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽는 법 짝짓기", description:"분위기와 읽는 법을 짝지어 보세요.", hint:"느낌에 맞는 목소리를 떠올려요.", pairs:[{a:{text:"⚽ 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 조용한"},b:{text:"잔잔하고 천천히"}},{a:{text:"🌸 포근한"},b:{text:"부드럽게"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 좋은 점을 찾게 하세요.", fit_slides:["present"]},
      {id:"e_read10", type:"extension", icon:"⬆", title:"몸짓 더하기", content:"\"낭송에 어울리는 몸짓을 더해 볼까요?\" 표현을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살리려면 무엇을 조절하죠?\" 목소리·빠르기를 짚어요.", fit_slides:["summary"]},
      {id:"e_read10b", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 친구들 앞에서 낭송해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 분위기 살려 소리 내어 읽기 ② (낭송·듣기) ---------------- */
  window.LESSONS["u4_l11"] = {
    meta: {grade:2, subject:"국어", unit:4, n:11, title:"분위기를 살려 소리 내어 읽어요 ②", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 낭송·듣기 약속 → 좋은 낭송·듣기 → 바른 모습 고르기 → 낭송하고 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 소리 내어 읽어요", subtitle:"4단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_ready11","t_share11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기를 살려 시를 낭송해요","친구 낭송을 바른 자세로 들어요","낭송의 좋은 점을 나눠요"]}, suggested_extras:["t_share11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구의 낭송을 들어요 👂", visual:"🎙️", question:"친구가 분위기를 살려 시를 낭송해요.<br>잘 들으려면 어떻게 들어야 할까요?"}, suggested_extras:["q_listen11","r_share11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송하고 잘 듣기", content:"낭송할 땐 시의 **분위기를 살려** 또박또박 읽어요. 들을 땐 **바른 자세로** 분위기를 느끼며 듣고, 낭송이 끝나면 \"분위기가 잘 살았다\" 하고 **좋은 점**을 말해 줘요!", symbol_meanings:[{symbol:"분위기 살려", meaning:"목소리·빠르기 조절"},{symbol:"또박또박", meaning:"바르게 읽어요"},{symbol:"바른 듣기", meaning:"분위기를 느끼며"},{symbol:"좋은 점 말하기", meaning:"느낌을 나눠요"}]}, suggested_extras:["t_share11b","x_share11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바른 낭송·듣기 모습은? ✅", sub:"낭송·듣기의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"낭송할 때는?", emoji:"🎤", name:"분위기를 살려 또박또박 읽어요"},{clue:"친구 낭송을 들을 때는?", emoji:"👂", name:"바른 자세로 분위기를 느끼며 들어요"},{clue:"낭송이 끝나면?", emoji:"👏", name:"좋았던 점을 말해 줘요"}], outro:"낭송하고 잘 들으면 시를 함께 즐길 수 있어요. 낭송해 볼까요? 😊"}, suggested_extras:["q_good11","g_share11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"분위기를 살려 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 좋아하는 시를 분위기에 맞게 낭송해 봐요!", count:24, hint:"시의 분위기를 생각하며 목소리를 살려 또박또박 낭송해요", end_msg:"모두 분위기를 살려 멋지게 낭송했어요. 시가 더 좋아졌어요! 👏"}, suggested_extras:["t_present11","e_share11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["분위기를 살려 시를 낭송했어요","친구 낭송을 바른 자세로 들었어요","낭송의 좋은 점을 나눴어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시로 여는 우리 반을 만들어요", body:"다음 시간에는 좋아하는 시를 모아 '시로 여는 우리 반'을 만들어 볼 거예요!"}, suggested_extras:["e_class11"]}
    ],
    extras: [
      {id:"q_ready11", type:"fun_question", icon:"💡", title:"낭송 마음", content:"\"시를 낭송하는 마음은 어떤가요?\" 낭송을 편하게 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_share11", type:"tip", icon:"🧩", title:"함께 즐기기", content:"낭송과 듣기로 시를 함께 즐기는 데 초점을 두세요.", fit_slides:["objective","concept"]},
      {id:"q_listen11", type:"fun_question", icon:"🎙️", title:"잘 듣기", content:"\"친구 낭송을 어떻게 들으면 좋을까요?\" 듣기 태도를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_share11", type:"real_world", icon:"🌍", title:"발표회", content:"낭송회·발표회를 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_share11b", type:"tip", icon:"🧩", title:"분위기 느끼며", content:"들을 때 분위기를 느끼며 듣게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_share11", type:"misconception", icon:"❓", title:"끼어들기 주의", content:"낭송 중 끼어들지 말고 끝난 뒤 좋은 점을 말하게 하세요.", fit_slides:["concept"]},
      {id:"q_good11", type:"fun_question", icon:"💡", title:"바른 모습은?", content:"\"낭송·듣기의 바른 모습은 무엇이죠?\" 살려 읽기·바른 듣기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_share11", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 모습 짝짓기", description:"낭송 상황과 바른 모습을 짝지어 보세요.", hint:"함께 즐기는 모습을 생각해요.", pairs:[{a:{text:"🎤 낭송"},b:{text:"분위기 살려"}},{a:{text:"👂 듣기"},b:{text:"바른 자세로"}},{a:{text:"👏 끝난 뒤"},b:{text:"좋은 점 말하기"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 분위기를 느끼게 하세요.", fit_slides:["present"]},
      {id:"e_share11", type:"extension", icon:"⬆", title:"좋은 점 찾기", content:"\"친구 낭송에서 어떤 점이 좋았나요?\" 구체적으로 칭찬하게 해요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송할 때 무엇을 살렸죠?\" 분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_class11", type:"extension", icon:"⬆", title:"우리 반 예고", content:"\"다음엔 시로 여는 우리 반을 만들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 시로 여는 우리 반 ① (실천) ---------------- */
  window.LESSONS["u4_l12"] = {
    meta: {grade:2, subject:"국어", unit:4, n:12, title:"시로 여는 우리 반을 만들어요 ① (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 시로 여는 우리 반 → 시 고르기 → 낭송 차례 정하기 → 좋아하는 시 낭송"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 12/15차시 · 실천"}, suggested_extras:["q_class12","t_class12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["'시로 여는 우리 반'을 알아봐요","낭송할 시를 골라요","좋아하는 시를 낭송해요"]}, suggested_extras:["t_class12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"하루를 시로 시작해요 🌅", visual:"📜", question:"아침마다 한 친구가 좋아하는 시를 낭송하며 하루를 열어요.<br>어떤 시를 들려주고 싶나요?"}, suggested_extras:["q_pick12","r_class12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"시로 여는 우리 반", content:"'시로 여는 우리 반'은 차례로 **좋아하는 시**를 낭송하며 하루를 여는 활동이에요. 분위기에 맞게 **살려 읽고**, 친구들은 **바른 자세로** 들어요. 매일 시 한 편으로 마음이 따뜻해져요!", symbol_meanings:[{symbol:"시 고르기", meaning:"좋아하는 시를"},{symbol:"분위기 살려", meaning:"느낌에 맞게 읽어요"},{symbol:"차례대로", meaning:"날마다 한 친구씩"},{symbol:"함께 듣기", meaning:"바른 자세로"}]}, suggested_extras:["t_class12b","x_class12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낭송할 때 바른 태도는? ✅", sub:"낭송 태도로 바른 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"낭송하기 전에는?", emoji:"📖", name:"시를 미리 읽고 분위기를 생각해요"},{clue:"낭송할 때는?", emoji:"🎤", name:"분위기를 살려 또박또박 읽어요"},{clue:"들을 때는?", emoji:"👂", name:"바른 자세로 끝까지 들어요"}], outro:"준비하고 분위기를 살려 낭송하면 멋져요. 좋아하는 시를 낭송해 볼까요? 😊"}, suggested_extras:["q_good12","g_class12"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"좋아하는 시를 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. '시로 여는 우리 반'으로 좋아하는 시를 낭송해 봐요!", count:24, hint:"고른 시의 분위기를 살려 또박또박 낭송하고, 친구들은 바른 자세로 들어요", end_msg:"우리 반이 시로 따뜻해졌어요. 멋진 낭송이었어요! 👏"}, suggested_extras:["t_present12","e_class12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["'시로 여는 우리 반'을 알았어요","낭송할 시를 골랐어요","좋아하는 시를 낭송했어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시를 나누고 즐겨요", body:"다음 시간에는 친구들의 시 낭송을 들으며 분위기를 함께 즐겨 볼 거예요!"}, suggested_extras:["e_share12"]}
    ],
    extras: [
      {id:"q_class12", type:"fun_question", icon:"💡", title:"하루 열기", content:"\"하루를 시로 시작하면 어떤 기분일까요?\" 활동을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_class12", type:"tip", icon:"🧩", title:"꾸준한 실천", content:"날마다 이어 가는 활동으로 안내해 실천을 돕습니다.", fit_slides:["objective","concept"]},
      {id:"q_pick12", type:"fun_question", icon:"📜", title:"어떤 시?", content:"\"어떤 시를 친구들에게 들려주고 싶나요?\" 시를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_class12", type:"real_world", icon:"🌍", title:"아침 활동", content:"아침 독서·노래 부르기 같은 활동과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_class12b", type:"tip", icon:"🧩", title:"분위기 살려", content:"고른 시의 분위기를 살려 낭송하게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_class12", type:"misconception", icon:"❓", title:"준비하고 낭송", content:"미리 읽어 보지 않고 낭송하면 어려워요. 준비하고 낭송하게 하세요.", fit_slides:["concept"]},
      {id:"q_good12", type:"fun_question", icon:"💡", title:"바른 태도는?", content:"\"낭송의 바른 태도는 무엇이죠?\" 준비·살려 읽기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_class12", type:"game", game_kind:"memory_match", icon:"🎮", title:"차례 ↔ 할 일 짝짓기", description:"낭송 차례와 할 일을 짝지어 보세요.", hint:"낭송 순서를 떠올려요.", pairs:[{a:{text:"📖 낭송 전"},b:{text:"미리 읽기"}},{a:{text:"🎤 낭송할 때"},b:{text:"분위기 살려"}},{a:{text:"👂 들을 때"},b:{text:"바른 자세"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 분위기를 느끼게 하세요.", fit_slides:["present"]},
      {id:"e_class12", type:"extension", icon:"⬆", title:"시 모음 만들기", content:"\"우리 반 시 모음을 만들어 볼까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"'시로 여는 우리 반'은 무엇을 하죠?\" 활동을 짚어요.", fit_slides:["summary"]},
      {id:"e_share12", type:"extension", icon:"⬆", title:"나누기 예고", content:"\"다음엔 시를 나누며 즐겨요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 시로 여는 우리 반 ② (나누기) ---------------- */
  window.LESSONS["u4_l13"] = {
    meta: {grade:2, subject:"국어", unit:4, n:13, title:"시로 여는 우리 반을 만들어요 ② (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 시 낭송 나누기 → 좋은 낭송의 점 → 좋은 점 찾기 → 낭송 발표·소감"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 13/15차시 · 실천"}, suggested_extras:["q_share13","t_share13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["친구의 시 낭송을 들어요","좋은 낭송의 점을 찾아요","낭송 소감을 나눠요"]}, suggested_extras:["t_share13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구의 시를 함께 즐겨요 🎶", visual:"🎶", question:"친구가 들려준 시 중 마음에 남는 시가 있었나요?<br>어떤 점이 좋았나요?"}, suggested_extras:["q_hear13","r_share13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송을 나누며 즐겨요", content:"친구 낭송을 들으며 **새로운 시**도 알게 되고, **분위기 살리는 법**도 배워요. \"목소리로 분위기가 잘 살았다\" \"천천히 읽어 포근했다\" 하고 **좋은 점**을 찾아 말해 주면 좋아요!", symbol_meanings:[{symbol:"새로운 시", meaning:"친구가 고른 시"},{symbol:"분위기 배우기", meaning:"살리는 법을 배워요"},{symbol:"좋은 점 찾기", meaning:"목소리·빠르기 칭찬"},{symbol:"함께 즐기기", meaning:"시를 나눠요"}]}, suggested_extras:["t_share13b","x_share13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낭송의 좋은 점을 찾아요 ✅", sub:"낭송에서 칭찬할 좋은 점을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"분위기를 잘 살린 낭송은?", emoji:"🎭", name:"\"분위기가 잘 느껴졌어\""},{clue:"또박또박 읽은 낭송은?", emoji:"🔊", name:"\"또렷하게 잘 들렸어\""},{clue:"알맞게 띄어 읽은 낭송은?", emoji:"⏸️", name:"\"뜻이 잘 전해졌어\""}], outro:"좋은 점을 찾아 칭찬하면 서로 힘이 나요. 낭송을 발표해 볼까요? 😊"}, suggested_extras:["q_good13","g_share13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"낭송을 발표하고 나눠요 🎤", sub:"버튼을 눌러 발표할 친구를 뽑아요. 시를 낭송하고 친구 낭송의 좋은 점을 나눠요!", count:24, hint:"분위기를 살려 낭송하고, 들은 친구는 좋았던 점을 말해 줘요", end_msg:"모두 시를 멋지게 나눴어요. 우리 반이 시로 가득해졌어요! 👏"}, suggested_extras:["t_present13","e_share13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["친구의 시 낭송을 들었어요","좋은 낭송의 점을 찾았어요","낭송 소감을 나눴어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 단원에서 배운 것을 스스로 돌아보고 정리해 볼 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_share13", type:"fun_question", icon:"💡", title:"마음에 남는 시", content:"\"친구가 들려준 시 중 마음에 남는 게 있나요?\" 나눔을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_share13", type:"tip", icon:"🧩", title:"나누며 배우기", content:"친구 낭송에서 분위기 살리는 법을 배우게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_hear13", type:"fun_question", icon:"🎶", title:"어떤 점이 좋을까", content:"\"친구 낭송의 어떤 점이 좋았나요?\" 좋은 점을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_share13", type:"real_world", icon:"🌍", title:"함께 듣기", content:"함께 노래·시를 들으며 즐긴 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_share13b", type:"tip", icon:"🧩", title:"좋은 점 찾기", content:"목소리·빠르기·띄어 읽기 등 구체적인 좋은 점을 찾게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_share13", type:"misconception", icon:"❓", title:"흠보다 좋은 점", content:"잘못을 지적하기보다 좋은 점을 찾아 칭찬하게 하세요.", fit_slides:["concept"]},
      {id:"q_good13", type:"fun_question", icon:"💡", title:"어떤 점이 좋을까", content:"\"이 낭송의 어떤 점이 좋을까요?\" 좋은 점을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_share13", type:"game", game_kind:"memory_match", icon:"🎮", title:"낭송 ↔ 좋은 점 짝짓기", description:"낭송 특징과 좋은 점을 짝지어 보세요.", hint:"무엇을 잘했는지 생각해요.", pairs:[{a:{text:"🎭 분위기"},b:{text:"잘 느껴짐"}},{a:{text:"🔊 또박또박"},b:{text:"또렷이 들림"}},{a:{text:"⏸️ 띄어 읽기"},b:{text:"뜻이 전해짐"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"구체적 칭찬", content:"\"잘했다\"보다 어떤 점이 좋은지 구체적으로 칭찬하게 하세요.", fit_slides:["present"]},
      {id:"e_share13", type:"extension", icon:"⬆", title:"시 모음", content:"\"우리 반 시 모음에 어떤 시를 넣을까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송을 나누며 무엇을 배웠죠?\" 분위기 살리기를 짚어요.", fit_slides:["summary"]},
      {id:"e_wrap13", type:"extension", icon:"⬆", title:"마무리 예고", content:"\"다음엔 단원을 마무리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 14차시: 마무리하기 ① (스스로 확인) ---------------- */
  window.LESSONS["u4_l14"] = {
    meta: {grade:2, subject:"국어", unit:4, n:14, title:"마무리하기 ① — 스스로 확인", std:"[2국04-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 단원 돌아보기 → 겹받침·분위기 정리 → 확인 퀴즈 → 스스로 확인"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ① — 스스로 확인", subtitle:"4단원 · 14/15차시 · 마무리"}, suggested_extras:["q_back14","t_wrap14"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["단원에서 배운 것을 돌아봐요","겹받침·분위기 살려 읽기를 정리해요","배운 내용을 스스로 확인해요"]}, suggested_extras:["t_wrap14"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"4단원에서 무엇을 배웠나요? 🎀", visual:"📜", question:"겹받침을 바르게 읽고 쓰고, 분위기를 살려 시를 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침·분위기 정리", content:"이 단원에서 **겹받침을 바르게 읽고 쓰는 법**과 **시의 분위기를 살려 읽는 법**을 배웠어요. 겹받침은 쓸 땐 두 글자·읽을 땐 한 소리, 시는 분위기에 맞게 목소리를 조절해 읽어요!", symbol_meanings:[{symbol:"겹받침 읽기", meaning:"한 소리로 (닭→[닥])"},{symbol:"겹받침 쓰기", meaning:"두 글자 다 써요"},{symbol:"분위기 느끼기", meaning:"말·장면으로"},{symbol:"분위기 살려 읽기", meaning:"목소리·빠르기 조절"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑] — 겹받침은 한 소리"},{clue:"\"닭\"을 쓸 때는?", emoji:"🐔", name:"받침 ㄹ·ㄱ 두 글자를 다 써요"},{clue:"신나는 시는 어떻게 읽을까요?", emoji:"🎉", name:"밝고 힘차게, 빠르게"}], outro:"배운 것을 잘 기억하고 있어요. 앞으로도 바르게 읽고 분위기를 살려 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["겹받침 낱말을 바르게 읽고 쓸 수 있나요?","시의 분위기를 느낄 수 있나요?","분위기를 살려 시를 읽을 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","겹받침·분위기 살려 읽기를 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 겹받침 낱말을 다시 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"실천으로", content:"정리에 그치지 말고 바르게 읽기·분위기 살려 읽기 실천으로 이어지게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"📜", title:"기억에 남는 활동", content:"\"겹받침·분위기 살려 읽기 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"바르게 읽기", content:"책을 바르게 소리 내어 읽은 경험을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"두 갈래 정리", content:"겹받침 읽기·쓰기와 분위기 살려 읽기를 함께 정리하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"받침 다 쓰기", content:"한 소리로 읽힌다고 받침을 하나만 쓰지 않게 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"🐔 겹받침 읽기"},b:{text:"한 소리"}},{a:{text:"✍️ 겹받침 쓰기"},b:{text:"두 글자"}},{a:{text:"🎭 분위기"},b:{text:"살려 읽기"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"더 연습하고 싶은 것을 정해 볼까요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 겹받침·분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 겹받침 낱말과 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·글씨) ---------------- */
  window.LESSONS["u4_l15"] = {
    meta: {grade:2, subject:"국어", unit:4, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 낱말 다시 → 바른 소리·표기 → 바르게 쓴 낱말 고르기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"4단원 · 15/15차시 · 마무리"}, suggested_extras:["q_last","t_last"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["겹받침 낱말을 다시 익혀요","바르게 쓴 낱말을 찾아요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_last"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"바르게 썼을까? 🔎", visual:"✍️", question:"\"닥\"과 \"닭\" 중 바르게 쓴 것은 무엇일까요?<br>소리는 같지만 쓸 때는 어떻게 써야 할까요?"}, suggested_extras:["q_last2","r_last"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"바른 소리·바른 표기", content:"겹받침 낱말은 소리만 듣고 쓰면 틀리기 쉬워요. \"닭\"은 [닥]으로 읽지만 받침에 **ㄹ과 ㄱ을 모두** 써야 해요. 읽는 소리와 쓰는 글자를 함께 기억하면 바르게 쓸 수 있어요!", symbol_meanings:[{symbol:"닭 (O)", meaning:"받침 ㄹ+ㄱ"},{symbol:"닥 (X)", meaning:"받침이 빠졌어요"},{symbol:"값 (O)", meaning:"받침 ㅂ+ㅅ"},{symbol:"앉다 (O)", meaning:"받침 ㄴ+ㅈ"}]}, suggested_extras:["t_last2","x_last"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 쓴 낱말은? ✅", sub:"바르게 쓴 겹받침 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"[닥]으로 읽는 낱말을 바르게 쓰면?", emoji:"🐔", name:"닭 (받침 ㄹ+ㄱ)"},{clue:"[갑]으로 읽는 낱말을 바르게 쓰면?", emoji:"💰", name:"값 (받침 ㅂ+ㅅ)"},{clue:"[안따]로 읽는 낱말을 바르게 쓰면?", emoji:"🪑", name:"앉다 (받침 ㄴ+ㅈ)"}], outro:"읽는 소리와 쓰는 글자를 함께 기억해요. 이제 글씨도 써 볼까요? 😊"}, suggested_extras:["q_last3","g_last"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"단원에서 배운 낱말을 **또박또박** 써 봐요. 받침의 **두 글자**를 모두 써야 해요. **닭 · 맑다 · 분위기**를 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 ㄹ+ㄱ"},{symbol:"맑다", meaning:"받침 ㄹ+ㄱ"},{symbol:"분위기", meaning:"또박또박 정성껏"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"4단원에서 배운 것", points:["겹받침을 바르게 읽고 썼어요","시의 분위기를 살려 읽었어요","겹받침 낱말과 글씨를 익혔어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"바르게 읽고 분위기를 살려!", body:"4단원을 모두 마쳤어요. 앞으로도 겹받침을 바르게 읽고 쓰며, 분위기를 살려 시를 읽어 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_last", type:"fun_question", icon:"💡", title:"바르게 쓰기", content:"\"소리만 듣고 쓰면 틀리기 쉬운 낱말이 있을까요?\" 표기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_last", type:"tip", icon:"🧩", title:"소리·표기 함께", content:"읽는 소리와 쓰는 글자를 함께 기억하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_last2", type:"fun_question", icon:"✍️", title:"어떻게 쓸까", content:"\"[닥]으로 읽는 낱말을 어떻게 써야 할까요?\" 표기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_last", type:"real_world", icon:"🌍", title:"맞춤법", content:"맞춤법이 헷갈렸던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_last2", type:"tip", icon:"🧩", title:"받침 다 쓰기", content:"읽는 소리와 달리 받침을 다 쓰는 것을 강조하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_last", type:"misconception", icon:"❓", title:"소리대로 X", content:"소리대로 받침을 하나만 쓰지 않게 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_last3", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"바르게 써야 할 겹받침 낱말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_last", type:"game", game_kind:"memory_match", icon:"🎮", title:"소리 ↔ 바른 표기 짝짓기", description:"읽는 소리와 바른 표기를 짝지어 보세요.", hint:"받침을 다 쓰는지 생각해요.", pairs:[{a:{text:"🐔 [닥]"},b:{text:"닭"}},{a:{text:"💰 [갑]"},b:{text:"값"}},{a:{text:"🪑 [안따]"},b:{text:"앉다"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"바른 글씨", content:"네모 칸의 자형을 살펴 또박또박 쓰게 하고, 받침을 다 쓰는지 살피게 하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"겹받침 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"4단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"분위기 살려 읽기", content:"\"오늘 읽을 책을 분위기를 살려 읽어 볼까요?\" 읽기를 이어 가요.", fit_slides:["next_lesson"]}
    ]
  };


})();
