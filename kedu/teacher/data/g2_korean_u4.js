/* ============================================================================
   2학년 1학기 국어 4단원 「분위기를 살려 읽어요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 112~143 / 15차시.
   - 단원 목표: 말과 글을 바르고 재미있게 사용하기. 역량 비판적·창의적 사고.
   - 성취기준 [2국04-02](소리≠표기·바르게 읽고 쓰기)·[2국05-01](낭송·말의 재미)·[2국02-02](알맞게 띄어 읽기).
   ★ 저작권: 지도서 제재(「설문대 할망」·「쓰레기가 모여 있다고?」·수록 시) 전부 미게재.
      겹받침 낱말은 표준 발음 자체 구성, 짧은 시는 보편 소재(공놀이·달밤·빗방울) 전부 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 소리와 표기가 다른 낱말 ---------------- */
  window.LESSONS["u4_l01"] = {
    meta: {grade:2, subject:"국어", unit:4, n:1, title:"단원 도입 — 분위기를 살려 읽어요", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 소리≠표기 만나기 → 겹받침이란 → 바른 소리 고르기 → 겹받침 낱말 읽어 보기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽어요", subtitle:"4단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["소리와 표기가 다를 수 있음을 알아봐요","겹받침이 무엇인지 알아봐요","겹받침 낱말을 바르게 읽어 봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"\"닭\"은 어떻게 읽을까? 🐔", visual:"🐔", question:"\"닭\"이라고 쓰지만 읽을 때는 [닥]이라고 해요.<br>쓰는 것과 읽는 것이 다른 낱말, 또 있을까요?"}, suggested_extras:["q_sound","r_life"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침과 소리", content:"받침에 **글자가 두 개** 있는 것을 **겹받침**이라고 해요. 겹받침은 둘 중 **한 소리**로 읽어요. \"닭\"은 [닥], \"값\"은 [갑]처럼요. 하지만 **쓸 때는 두 글자를 모두** 써요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"'ㄺ'은 [ㄱ]으로"},{symbol:"값 → [갑]", meaning:"'ㅄ'은 [ㅂ]으로"},{symbol:"읽다 → [익따]", meaning:"'ㄺ'은 [ㄱ]으로"},{symbol:"쓸 때는", meaning:"받침 두 글자 모두"}]}, suggested_extras:["t_concept","x_write"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🐔", sub:"겹받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"닭\"은 어떻게 읽을까요?", emoji:"🐔", name:"[닥]"},{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"},{clue:"\"흙\"은 어떻게 읽을까요?", emoji:"🟫", name:"[흑]"}], outro:"쓸 때는 두 글자, 읽을 때는 한 소리! 신기하죠? 더 배워 볼까요? 😊"}, suggested_extras:["q_more","g_sound"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 읽어 봐요", question:"겹받침 낱말을 소리 내어 읽어 볼까요?", items:["\"닭\"을 소리 내어 읽어 볼까요?","쓸 때와 읽을 때가 어떻게 다른가요?","겹받침 낱말을 또 알고 있나요?"]}, suggested_extras:["t_present","e_read"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["소리와 표기가 다를 수 있음을 알았어요","겹받침이 무엇인지 알았어요","겹받침 낱말을 바르게 읽어 봤어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽으면 좋은 점", body:"다음 시간에는 글을 분위기에 맞게 읽으면 무엇이 좋은지 알아볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"신기한 낱말", content:"\"쓰는 것과 읽는 것이 다른 낱말을 본 적 있나요?\" 호기심을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '겹받침 바르게 읽고 쓰기 + 시 분위기 살려 읽기' 두 갈래예요. 도입에선 소리≠표기의 신기함을 느끼게 하세요.", fit_slides:["objective","cover"]},
      {id:"q_sound", type:"fun_question", icon:"🐔", title:"또 있을까", content:"\"읽는 소리가 다른 낱말이 또 있을까요?\" 겹받침을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_life", type:"real_world", icon:"🌍", title:"생활 속 낱말", content:"닭·흙·값 등 생활에서 자주 쓰는 겹받침 낱말과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"소리는 하나", content:"겹받침은 두 글자지만 소리는 하나로 남을 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_write", type:"misconception", icon:"❓", title:"쓸 때는 두 글자", content:"[닥]으로 읽는다고 '닥'으로 쓰면 안 돼요. 쓸 때는 '닭'으로 두 글자를 살리게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"q_more", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"겹받침이 든 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sound", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 읽는 소리를 짝지어 보세요.", hint:"한 소리로 읽어요.", pairs:[{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"🟫 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"소리 내어", content:"겹받침 낱말을 소리 내어 읽으며 소리와 표기 차이를 느끼게 하세요.", fit_slides:["question"]},
      {id:"e_read", type:"extension", icon:"⬆", title:"문장으로", content:"\"겹받침 낱말이 든 짧은 문장을 읽어 볼까요?\" 읽기를 확장해요.", fit_slides:["question"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 어떻게 읽고 쓰죠?\" 소리 하나·두 글자를 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 분위기를 살려 읽으면 좋은 점을 알아봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 분위기를 살려 읽으면 좋은 점 (준비) ---------------- */
  window.LESSONS["u4_l02"] = {
    meta: {grade:2, subject:"국어", unit:4, n:2, title:"분위기를 살려 읽으면 좋은 점을 알아봐요", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 같은 글 다르게 읽기 → 분위기란 → 어울리는 읽기 고르기 → 분위기 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽으면 좋은 점", subtitle:"4단원 · 2/15차시 · 준비"}, suggested_extras:["q_mood2","t_mood2"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["같은 글도 다르게 읽힘을 느껴요","분위기가 무엇인지 알아봐요","분위기를 살려 읽으면 좋은 점을 알아봐요"]}, suggested_extras:["t_mood2"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"신나게? 조용하게? 🎭", visual:"🎭", question:"\"비가 와요\"를 신나게 읽을 때와 조용하게 읽을 때<br>느낌이 어떻게 다를까요?"}, suggested_extras:["q_diff2","r_mood2"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 살려 읽기", content:"글에는 **분위기**가 있어요. 신나는 글, 조용한 글, 포근한 글처럼요. 분위기에 맞게 **목소리·빠르기**를 바꿔 읽으면 글의 느낌이 **더 잘 전해져요**!", symbol_meanings:[{symbol:"신나는 분위기", meaning:"밝고 빠르게"},{symbol:"조용한 분위기", meaning:"천천히 부드럽게"},{symbol:"포근한 분위기", meaning:"따뜻하고 느리게"},{symbol:"분위기 살리기", meaning:"느낌이 잘 전해져요"}]}, suggested_extras:["t_mood2b","x_same2"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 글엔 어떤 읽기가 어울릴까? 🎭", sub:"분위기에 어울리는 읽기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"신난다! 운동장으로 달려가자!\"", emoji:"🏃", name:"밝고 빠르게 읽어요"},{clue:"\"별이 조용히 반짝입니다.\"", emoji:"⭐", name:"천천히 부드럽게 읽어요"},{clue:"\"엄마 품은 참 포근해요.\"", emoji:"🤱", name:"따뜻하고 느리게 읽어요"}], outro:"분위기에 맞게 읽으니 느낌이 살아나요. 분위기를 떠올려 볼까요? 😊"}, suggested_extras:["q_pick2","g_mood2"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 떠올려요", question:"분위기를 살려 읽으면 무엇이 좋을까요?", items:["분위기에 맞게 읽으면 무엇이 좋나요?","어떤 글이 신나는 분위기일까요?","조용한 분위기의 글은 어떻게 읽을까요?"]}, suggested_extras:["t_present2","e_mood2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["같은 글도 다르게 읽힘을 느꼈어요","분위기가 무엇인지 알았어요","분위기를 살려 읽으면 좋은 점을 알았어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 읽고 써요", body:"다음 시간에는 겹받침이 있는 낱말을 바르게 읽고 쓰는 법을 배워 볼 거예요!"}, suggested_extras:["e_double2"]}
    ],
    extras: [
      {id:"q_mood2", type:"fun_question", icon:"💡", title:"읽기의 느낌", content:"\"같은 글을 다르게 읽어 본 적 있나요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood2", type:"tip", icon:"🧩", title:"분위기 느끼기", content:"분위기는 글의 느낌이에요. 교사가 두 가지로 읽어 시범을 보이면 효과적이에요.", fit_slides:["objective","concept"]},
      {id:"q_diff2", type:"fun_question", icon:"🎭", title:"무엇이 다를까", content:"\"두 가지로 읽으니 느낌이 어떻게 달랐나요?\" 차이를 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_mood2", type:"real_world", icon:"🌍", title:"이야기 들려주기", content:"동화를 분위기 있게 읽어 준 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mood2b", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 맞게 목소리와 빠르기를 바꾸는 것이 핵심임을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_same2", type:"misconception", icon:"❓", title:"한 가지로만 X", content:"모든 글을 똑같이 읽지 말고 분위기에 맞게 바꿔 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_pick2", type:"fun_question", icon:"💡", title:"왜 어울릴까", content:"\"왜 그렇게 읽는 것이 어울릴까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_mood2", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽는 법 짝짓기", description:"분위기와 읽는 방법을 짝지어 보세요.", hint:"느낌에 맞는 읽기를 골라요.", pairs:[{a:{text:"🏃 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"⭐ 조용한"},b:{text:"천천히 부드럽게"}},{a:{text:"🤱 포근한"},b:{text:"따뜻하고 느리게"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"느낌 말하기", content:"분위기를 살려 읽으면 좋은 점을 자유롭게 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood2", type:"extension", icon:"⬆", title:"읽어 보기", content:"\"한 문장을 두 가지 분위기로 읽어 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살려 읽으면 무엇이 좋죠?\" 느낌 전달을 짚어요.", fit_slides:["summary"]},
      {id:"e_double2", type:"extension", icon:"⬆", title:"겹받침 예고", content:"\"다음엔 겹받침 낱말을 읽고 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 겹받침 낱말 읽고 쓰기 ① (ㄺ) ---------------- */
  window.LESSONS["u4_l03"] = {
    meta: {grade:2, subject:"국어", unit:4, n:3, title:"겹받침 낱말을 읽고 써요 ① (ㄺ)", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄺ 받침 → [ㄱ]으로 읽기 → 바른 소리 고르기 → 겹받침 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_lk3","t_lk3"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["'ㄺ' 받침이 든 낱말을 알아봐요","'ㄺ'을 어떻게 읽는지 배워요","겹받침 낱말을 바르게 써요"]}, suggested_extras:["t_lk3"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"\"읽다\"를 읽어 봐요 📖", visual:"📖", question:"\"읽다\"는 어떻게 소리 날까요?<br>[일다]일까요, [익따]일까요?"}, suggested_extras:["q_read3","r_lk3"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"'ㄺ' 받침 읽기", content:"받침 **'ㄺ'**은 보통 **[ㄱ]** 소리로 읽어요. \"읽다\"는 [익따], \"맑다\"는 [막따], \"흙\"은 [흑]처럼요. 하지만 쓸 때는 **'ㄺ' 두 글자**를 모두 써요!", symbol_meanings:[{symbol:"읽다 → [익따]", meaning:"'ㄺ'을 [ㄱ]으로"},{symbol:"맑다 → [막따]", meaning:"'ㄺ'을 [ㄱ]으로"},{symbol:"흙 → [흑]", meaning:"'ㄺ'을 [ㄱ]으로"},{symbol:"닭 → [닥]", meaning:"'ㄺ'을 [ㄱ]으로"}]}, suggested_extras:["t_lk3b","x_lk3"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 📖", sub:"'ㄺ' 받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑다\"는 어떻게 읽을까요?", emoji:"☀️", name:"[막따]"},{clue:"\"읽다\"는 어떻게 읽을까요?", emoji:"📖", name:"[익따]"},{clue:"\"흙\"은 어떻게 읽을까요?", emoji:"🟫", name:"[흑]"}], outro:"'ㄺ'은 [ㄱ]으로 읽어요. 이제 바르게 써 볼까요? 😊"}, suggested_extras:["q_lk3c","g_lk3"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 따라 써요 ✍️", content:"'ㄺ' 받침 낱말을 또박또박 따라 써 봐요. 읽을 땐 [ㄱ] 소리지만, 쓸 땐 **'ㄺ' 두 글자**를 모두 살려 **닭 · 읽다 · 맑다**를 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 'ㄺ' 살려서"},{symbol:"읽다", meaning:"받침 'ㄺ' 살려서"},{symbol:"맑다", meaning:"받침 'ㄺ' 살려서"}]}, suggested_extras:["t_trace3","e_lk3"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["'ㄺ' 받침이 든 낱말을 알았어요","'ㄺ'을 [ㄱ]으로 읽음을 배웠어요","겹받침 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"다른 겹받침도 배워요", body:"다음 시간에는 'ㄵ'·'ㄼ' 같은 다른 겹받침 낱말도 읽고 써 볼 거예요!"}, suggested_extras:["e_lk3b"]}
    ],
    extras: [
      {id:"q_lk3", type:"fun_question", icon:"💡", title:"받침이 둘", content:"\"받침에 글자가 두 개인 낱말을 본 적 있나요?\" 겹받침을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_lk3", type:"tip", icon:"🧩", title:"ㄺ은 [ㄱ]", content:"'ㄺ' 받침은 [ㄱ]으로 읽음을 여러 낱말로 익히게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_read3", type:"fun_question", icon:"📖", title:"어떻게 읽을까", content:"\"'읽다'를 소리 내어 읽어 볼까요?\" 소리를 확인해요.", fit_slides:["motivate"]},
      {id:"r_lk3", type:"real_world", icon:"🌍", title:"자주 쓰는 낱말", content:"닭·흙·맑다 등 자주 쓰는 'ㄺ' 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_lk3b", type:"tip", icon:"🧩", title:"소리와 표기", content:"읽는 소리와 쓰는 표기가 다름을 거듭 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_lk3", type:"misconception", icon:"❓", title:"소리대로 쓰면 X", content:"[익따]로 읽는다고 '익따'로 쓰면 안 돼요. '읽다'로 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_lk3c", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"'ㄺ' 받침 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_lk3", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"'ㄺ' 낱말과 읽는 소리를 짝지어 보세요.", hint:"[ㄱ]으로 읽어요.", pairs:[{a:{text:"☀️ 맑다"},b:{text:"[막따]"}},{a:{text:"📖 읽다"},b:{text:"[익따]"}},{a:{text:"🟫 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace3", type:"tip", icon:"✍️", title:"두 글자 살려", content:"쓸 때 받침 두 글자를 모두 살려 또박또박 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_lk3", type:"extension", icon:"⬆", title:"문장으로", content:"\"'맑다'로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"'ㄺ'은 어떻게 읽죠?\" [ㄱ]을 짚어요.", fit_slides:["summary"]},
      {id:"e_lk3b", type:"extension", icon:"⬆", title:"다른 겹받침 예고", content:"\"다음엔 'ㄵ'·'ㄼ' 겹받침을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 겹받침 낱말 읽고 쓰기 ② (ㄵ·ㄼ) ---------------- */
  window.LESSONS["u4_l04"] = {
    meta: {grade:2, subject:"국어", unit:4, n:4, title:"겹받침 낱말을 읽고 써요 ② (ㄵ·ㄼ)", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄵ→[ㄴ]·ㄼ→[ㄹ] → 바르게 쓴 낱말 → 낱말↔소리 잇기 → 겹받침 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_nj4"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["'ㄵ'·'ㄼ' 받침 낱말을 알아봐요","어떻게 읽는지 배워요","바르게 읽고 써요"]}, suggested_extras:["t_nj4"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"\"앉다\"를 읽어 봐요 🪑", visual:"🪑", question:"\"앉다\"는 [안다]일까요, [안따]일까요?<br>겹받침 'ㄵ'은 어떻게 읽을까요?"}, suggested_extras:["q_sit4","r_nj4"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"'ㄵ'·'ㄼ' 받침 읽기", content:"받침 **'ㄵ'**은 **[ㄴ]**으로, **'ㄼ'**은 보통 **[ㄹ]**로 읽어요. \"앉다\"는 [안따], \"많다\"는 [만타], \"넓다\"는 [널따], \"여덟\"은 [여덜]처럼요. 쓸 때는 두 글자 모두!", symbol_meanings:[{symbol:"앉다 → [안따]", meaning:"'ㄵ'을 [ㄴ]으로"},{symbol:"많다 → [만타]", meaning:"'ㄶ'을 [ㄴ]으로"},{symbol:"넓다 → [널따]", meaning:"'ㄼ'을 [ㄹ]로"},{symbol:"여덟 → [여덜]", meaning:"'ㄼ'을 [ㄹ]로"}]}, suggested_extras:["t_nj4b","x_nj4"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🪑", sub:"'ㄵ'·'ㄼ' 받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"앉다\"는 어떻게 읽을까요?", emoji:"🪑", name:"[안따]"},{clue:"\"넓다\"는 어떻게 읽을까요?", emoji:"↔️", name:"[널따]"},{clue:"\"여덟\"은 어떻게 읽을까요?", emoji:"8️⃣", name:"[여덜]"}], outro:"'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ]로 읽어요. 바르게 써 볼까요? 😊"}, suggested_extras:["q_nj4c","g_nj4"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 따라 써요 ✍️", content:"'ㄵ'·'ㄼ' 받침 낱말을 또박또박 따라 써 봐요. 받침 **두 글자**를 모두 살려 **앉다 · 넓다 · 여덟**을 바르게 써 보세요!", symbol_meanings:[{symbol:"앉다", meaning:"받침 'ㄵ' 살려서"},{symbol:"넓다", meaning:"받침 'ㄼ' 살려서"},{symbol:"여덟", meaning:"받침 'ㄼ' 살려서"}]}, suggested_extras:["t_trace4","e_nj4"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["'ㄵ'·'ㄼ' 받침 낱말을 알았어요","'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ]로 읽음을 배웠어요","바르게 읽고 썼어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침을 정리해요", body:"다음 시간에는 지금까지 배운 겹받침을 정리하고 더 연습해 볼 거예요!"}, suggested_extras:["e_sum4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 겹받침", content:"\"지난 시간에 배운 'ㄺ'은 어떻게 읽었죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_nj4", type:"tip", icon:"🧩", title:"받침마다 소리", content:"겹받침마다 읽는 소리가 다름을 정리해 주세요('ㄵ'→[ㄴ], 'ㄼ'→[ㄹ]).", fit_slides:["objective","concept"]},
      {id:"q_sit4", type:"fun_question", icon:"🪑", title:"어떻게 읽을까", content:"\"'앉다'를 소리 내어 읽어 볼까요?\" 소리를 확인해요.", fit_slides:["motivate"]},
      {id:"r_nj4", type:"real_world", icon:"🌍", title:"자주 쓰는 낱말", content:"앉다·많다·넓다 등 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_nj4b", type:"tip", icon:"🧩", title:"소리와 표기", content:"읽는 소리와 쓰는 표기가 다름을 다시 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_nj4", type:"misconception", icon:"❓", title:"소리대로 쓰면 X", content:"[안따]로 읽는다고 '안따'로 쓰면 안 돼요. '앉다'로 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_nj4c", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"'ㄵ'·'ㄼ' 받침 낱말을 또 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_nj4", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"'ㄵ'·'ㄼ' 낱말과 읽는 소리를 짝지어 보세요.", hint:"받침 소리를 떠올려요.", pairs:[{a:{text:"🪑 앉다"},b:{text:"[안따]"}},{a:{text:"↔️ 넓다"},b:{text:"[널따]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace4", type:"tip", icon:"✍️", title:"두 글자 살려", content:"쓸 때 받침 두 글자를 모두 살려 또박또박 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_nj4", type:"extension", icon:"⬆", title:"문장으로", content:"\"'넓다'로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"'ㄵ'·'ㄼ'은 어떻게 읽죠?\" [ㄴ]·[ㄹ]을 짚어요.", fit_slides:["summary"]},
      {id:"e_sum4", type:"extension", icon:"⬆", title:"정리 예고", content:"\"다음엔 겹받침을 정리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 겹받침 낱말 읽고 쓰기 ③ (정리·연습) ---------------- */
  window.LESSONS["u4_l05"] = {
    meta: {grade:2, subject:"국어", unit:4, n:5, title:"겹받침 낱말을 읽고 써요 ③", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 정리 → 소리와 표기 → 바르게 쓴 낱말 모으기 → 겹받침 낱말 연습"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_sum5","t_sum5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["배운 겹받침을 정리해요","소리와 표기를 다시 살펴봐요","겹받침 낱말을 바르게 써요"]}, suggested_extras:["t_sum5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 모아 봐요 🧩", visual:"🧩", question:"지금까지 'ㄺ'·'ㄵ'·'ㄼ'을 배웠어요.<br>각각 어떤 소리로 읽었는지 기억나나요?"}, suggested_extras:["q_recall5","r_sum5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 소리 정리", content:"겹받침은 소리는 **하나**, 쓸 때는 **두 글자**예요. **'ㄺ'→[ㄱ]**(닭·맑다), **'ㄵ'→[ㄴ]**(앉다), **'ㄼ'→[ㄹ]**(넓다·여덟). 읽을 땐 한 소리, 쓸 땐 받침 그대로!", symbol_meanings:[{symbol:"'ㄺ' → [ㄱ]", meaning:"닭·읽다·맑다"},{symbol:"'ㄵ' → [ㄴ]", meaning:"앉다"},{symbol:"'ㄼ' → [ㄹ]", meaning:"넓다·여덟"},{symbol:"쓸 때는", meaning:"두 글자 모두 살려요"}]}, suggested_extras:["t_sum5b","x_sum5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 쓴 낱말은? ✅", sub:"겹받침을 바르게 쓴 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"[닥]으로 읽는 이 낱말, 바르게 쓰면?", emoji:"🐔", name:"\"닭\" (받침 'ㄺ')"},{clue:"[안따]로 읽는 이 낱말, 바르게 쓰면?", emoji:"🪑", name:"\"앉다\" (받침 'ㄵ')"},{clue:"[널따]로 읽는 이 낱말, 바르게 쓰면?", emoji:"↔️", name:"\"넓다\" (받침 'ㄼ')"}], outro:"읽는 소리에 속지 않고 받침을 살려 썼어요. 더 연습해 볼까요? 😊"}, suggested_extras:["q_pick5","g_sum5"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 연습해요", question:"겹받침 낱말을 읽고 써 볼까요?", items:["어떤 겹받침 낱말이 어려웠나요?","읽는 소리와 쓰는 모습이 어떻게 다른가요?","겹받침 낱말로 문장을 만들 수 있나요?"]}, suggested_extras:["t_present5","e_sum5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["배운 겹받침을 정리했어요","소리와 표기를 다시 살펴봤어요","겹받침 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글에서 겹받침을 찾아요", body:"다음 시간에는 글을 읽으며 겹받침 낱말을 찾아 바르게 읽어 볼 거예요!"}, suggested_extras:["e_glread5"]}
    ],
    extras: [
      {id:"q_sum5", type:"fun_question", icon:"💡", title:"기억나는 낱말", content:"\"지금까지 배운 겹받침 낱말 중 기억나는 것은?\" 복습을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_sum5", type:"tip", icon:"🧩", title:"한눈에 정리", content:"'ㄺ'→[ㄱ], 'ㄵ'→[ㄴ], 'ㄼ'→[ㄹ]을 한눈에 정리해 주세요.", fit_slides:["objective","concept"]},
      {id:"q_recall5", type:"fun_question", icon:"🧩", title:"어떤 소리?", content:"\"'ㄺ'은 어떤 소리로 읽었죠?\" 배운 것을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_sum5", type:"real_world", icon:"🌍", title:"낱말 찾기", content:"교실·책에서 겹받침 낱말을 찾아보게 해요.", fit_slides:["motivate"]},
      {id:"t_sum5b", type:"tip", icon:"🧩", title:"소리 하나·두 글자", content:"소리는 하나, 쓸 때는 두 글자라는 핵심을 다시 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_sum5", type:"misconception", icon:"❓", title:"받침 살리기", content:"읽는 소리대로 쓰지 말고 받침을 살려 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_pick5", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"이 낱말은 왜 이렇게 쓸까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_sum5", type:"game", game_kind:"memory_match", icon:"🎮", title:"받침 ↔ 소리 짝짓기", description:"겹받침과 읽는 소리를 짝지어 보세요.", hint:"받침 소리를 떠올려요.", pairs:[{a:{text:"닭 (ㄺ)"},b:{text:"[ㄱ]"}},{a:{text:"앉다 (ㄵ)"},b:{text:"[ㄴ]"}},{a:{text:"넓다 (ㄼ)"},b:{text:"[ㄹ]"}}], fit_slides:["card_quiz"]},
      {id:"t_present5", type:"tip", icon:"🗣", title:"읽고 쓰기", content:"겹받침 낱말을 읽고 쓰며 소리와 표기 차이를 확인하게 하세요.", fit_slides:["question"]},
      {id:"e_sum5", type:"extension", icon:"⬆", title:"문장 만들기", content:"\"겹받침 낱말로 문장을 만들어 볼까요?\" 쓰기를 확장해요.", fit_slides:["question"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 소리와 표기가 어떻게 다르죠?\" 핵심을 짚어요.", fit_slides:["summary"]},
      {id:"e_glread5", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 글에서 겹받침을 찾아요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 글에서 겹받침 찾기 ① ---------------- */
  window.LESSONS["u4_l06"] = {
    meta: {grade:2, subject:"국어", unit:4, n:6, title:"겹받침에 주의하며 글을 읽어요 ①", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 글 속 겹받침 → 바르게 읽기 → 글에서 겹받침 찾기 → 소리 내어 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침에 주의하며 글을 읽어요", subtitle:"4단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_gl6","t_gl6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글에서 겹받침 낱말을 찾아요","겹받침 낱말을 바르게 읽어요","글을 알맞게 띄어 읽어요"]}, suggested_extras:["t_gl6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글 속에 겹받침이 숨어 있어요 🔍", visual:"🔎", question:"\"맑은 하늘 아래에서 닭이 흙을 밟는다.\"<br>이 문장에 겹받침 낱말이 몇 개 있을까요?"}, suggested_extras:["q_find6","r_gl6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글 속 겹받침 바르게 읽기", content:"글을 읽을 땐 겹받침 낱말을 **바른 소리**로 읽어요. \"맑은\"은 [말근], \"밟는다\"는 [밤는다]처럼요. 겹받침에 주의해 읽으면 글을 **정확하게** 읽을 수 있어요!", symbol_meanings:[{symbol:"맑은 → [말근]", meaning:"받침소리 이어 읽기"},{symbol:"닭이 → [달기]", meaning:"받침소리 이어 읽기"},{symbol:"흙을 → [흘글]", meaning:"받침소리 이어 읽기"},{symbol:"바른 소리로", meaning:"정확하게 읽어요"}]}, suggested_extras:["t_gl6b","x_gl6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"글에서 겹받침을 찾아요 🔍", sub:"문장 속 겹받침 낱말을 찾아봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 하늘이 참 넓다.\"", emoji:"☀️", name:"맑은·넓다"},{clue:"\"닭이 흙 위를 걷는다.\"", emoji:"🐔", name:"닭·흙"},{clue:"\"동생이 의자에 앉다.\"", emoji:"🪑", name:"앉다"}], outro:"글 속에 겹받침이 이렇게 숨어 있어요. 바르게 읽어 볼까요? 😊"}, suggested_extras:["q_gl6c","g_gl6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"소리 내어 읽어요", question:"겹받침에 주의하며 글을 읽어 볼까요?", items:["문장에서 겹받침 낱말을 찾았나요?","그 낱말을 바른 소리로 읽었나요?","글을 알맞게 띄어 읽었나요?"]}, suggested_extras:["t_present6","e_gl6"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글에서 겹받침 낱말을 찾았어요","겹받침 낱말을 바르게 읽었어요","글을 알맞게 띄어 읽었어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"띄어 읽기를 배워요", body:"다음 시간에는 뜻이 잘 드러나게 알맞게 띄어 읽는 법을 배워 볼 거예요!"}, suggested_extras:["e_space6"]}
    ],
    extras: [
      {id:"q_gl6", type:"fun_question", icon:"💡", title:"숨은 겹받침", content:"\"글에서 겹받침 낱말을 찾을 수 있을까요?\" 찾기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_gl6", type:"tip", icon:"🧩", title:"주의하며 읽기", content:"겹받침 낱말에 주의해 바르게 읽는 데 초점을 두게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_find6", type:"fun_question", icon:"🔎", title:"몇 개일까", content:"\"이 문장에 겹받침 낱말이 몇 개일까요?\" 함께 찾아요.", fit_slides:["motivate"]},
      {id:"r_gl6", type:"real_world", icon:"🌍", title:"책 속 낱말", content:"읽고 있는 책에서 겹받침 낱말을 찾아보게 해요.", fit_slides:["motivate"]},
      {id:"t_gl6b", type:"tip", icon:"🧩", title:"이어 읽기", content:"받침 뒤에 모음이 오면 받침소리를 이어 읽음을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_gl6", type:"misconception", icon:"❓", title:"천천히 정확히", content:"빨리 읽기보다 겹받침을 정확히 읽는 데 집중하게 하세요.", fit_slides:["concept"]},
      {id:"q_gl6c", type:"fun_question", icon:"💡", title:"또 어디에?", content:"\"이 글에 겹받침 낱말이 또 있을까요?\" 함께 찾아요.", fit_slides:["card_quiz"]},
      {id:"g_gl6", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 겹받침 낱말 짝짓기", description:"문장과 그 안의 겹받침 낱말을 짝지어 보세요.", hint:"받침이 두 글자인 낱말을 찾아요.", pairs:[{a:{text:"☀️ 맑은 하늘"},b:{text:"맑은·넓다"}},{a:{text:"🐔 닭과 흙"},b:{text:"닭·흙"}},{a:{text:"🪑 의자"},b:{text:"앉다"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"또박또박 읽기", content:"겹받침에 주의해 또박또박 읽게 하세요.", fit_slides:["question"]},
      {id:"e_gl6", type:"extension", icon:"⬆", title:"바꿔 읽기", content:"\"친구와 한 문장씩 번갈아 읽어 볼까요?\" 읽기를 즐겨요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"글 속 겹받침을 어떻게 읽죠?\" 바른 소리를 짚어요.", fit_slides:["summary"]},
      {id:"e_space6", type:"extension", icon:"⬆", title:"띄어 읽기 예고", content:"\"다음엔 알맞게 띄어 읽기를 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 글에서 겹받침 찾기 ② (띄어 읽기) ---------------- */
  window.LESSONS["u4_l07"] = {
    meta: {grade:2, subject:"국어", unit:4, n:7, title:"겹받침에 주의하며 글을 읽어요 ②", std:"[2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 띄어 읽기란 → 뜻이 드러나게 → 알맞은 띄어 읽기 고르기 → 띄어 읽기 연습"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침에 주의하며 글을 읽어요", subtitle:"4단원 · 7/15차시 · 소단원 1"}, suggested_extras:["q_space7","t_space7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["알맞게 띄어 읽기를 알아봐요","뜻이 잘 드러나게 읽어요","겹받침에 주의하며 띄어 읽어요"]}, suggested_extras:["t_space7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어디서 쉬어 읽을까? ⏸️", visual:"⏸️", question:"\"아빠가방에들어가신다\"를 어떻게 띄어 읽을까요?<br>띄어 읽기에 따라 뜻이 달라져요!"}, suggested_extras:["q_mean7","r_space7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"알맞게 띄어 읽기", content:"글을 읽을 땐 **뜻 덩어리**로 알맞게 쉬어 읽어요. \"아빠가 / 방에 / 들어가신다\"처럼요. 쉼표(,)에서는 조금, 마침표(.)에서는 더 쉬어요. 알맞게 띄어 읽으면 **뜻이 잘 드러나요**!", symbol_meanings:[{symbol:"뜻 덩어리로", meaning:"낱말 묶음으로 쉬어요"},{symbol:"쉼표 (,)", meaning:"조금 쉬어요"},{symbol:"마침표 (.)", meaning:"좀 더 쉬어요"},{symbol:"뜻이 드러나게", meaning:"이해하기 쉬워요"}]}, suggested_extras:["t_space7b","x_space7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞게 띄어 읽은 것은? ✅", sub:"뜻이 잘 드러나게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"작은 새가 하늘을 날아간다\"", emoji:"🐦", name:"\"작은 새가 / 하늘을 / 날아간다\""},{clue:"\"닭이 마당에서 모이를 먹는다\"", emoji:"🐔", name:"\"닭이 / 마당에서 / 모이를 먹는다\""},{clue:"이렇게 읽으면 뜻이 헷갈려요!", emoji:"🙅", name:"\"작은새가하늘을날아간다\" (안 쉬고)"}], outro:"뜻 덩어리로 쉬어 읽으니 뜻이 잘 드러나요. 연습해 볼까요? 😊"}, suggested_extras:["q_space7c","g_space7"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"띄어 읽기를 연습해요", question:"겹받침에 주의하며 알맞게 띄어 읽어 볼까요?", items:["어디서 쉬어 읽으면 좋을까요?","겹받침 낱말을 바르게 읽었나요?","띄어 읽으니 뜻이 잘 드러나나요?"]}, suggested_extras:["t_present7","e_space7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["알맞게 띄어 읽기를 알았어요","뜻이 잘 드러나게 읽었어요","겹받침에 주의하며 띄어 읽었어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시의 분위기를 살펴봐요", body:"다음 시간에는 시를 읽으며 어떤 분위기인지 살펴볼 거예요!"}, suggested_extras:["e_poem7"]}
    ],
    extras: [
      {id:"q_space7", type:"fun_question", icon:"💡", title:"쉬어 읽기", content:"\"글을 읽을 때 어디서 쉬나요?\" 띄어 읽기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_space7", type:"tip", icon:"🧩", title:"뜻 덩어리", content:"낱말을 뜻 덩어리로 묶어 쉬어 읽게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_mean7", type:"fun_question", icon:"⏸️", title:"뜻이 달라져요", content:"\"띄어 읽기에 따라 뜻이 어떻게 달라질까요?\" 흥미를 열어요.", fit_slides:["motivate"]},
      {id:"r_space7", type:"real_world", icon:"🌍", title:"읽어 주기", content:"누군가 글을 또박또박 읽어 줘 이해하기 쉬웠던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_space7b", type:"tip", icon:"🧩", title:"부호에서 쉬기", content:"쉼표·마침표에서 쉬는 정도를 다르게 하게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_space7", type:"misconception", icon:"❓", title:"안 쉬면 헷갈려요", content:"쉬지 않고 읽으면 뜻이 헷갈려요. 뜻 덩어리로 쉬게 하세요.", fit_slides:["concept"]},
      {id:"q_space7c", type:"fun_question", icon:"💡", title:"어디서 쉴까", content:"\"이 문장은 어디서 쉬어 읽을까요?\" 함께 정해요.", fit_slides:["card_quiz"]},
      {id:"g_space7", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 띄어 읽기 짝짓기", description:"문장과 알맞은 띄어 읽기를 짝지어 보세요.", hint:"뜻 덩어리로 쉬어요.", pairs:[{a:{text:"🐦 작은 새"},b:{text:"작은 새가 / 하늘을"}},{a:{text:"🐔 닭"},b:{text:"닭이 / 마당에서"}},{a:{text:"⏸️ 쉼표"},b:{text:"조금 쉬기"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"천천히 읽기", content:"천천히 뜻 덩어리로 쉬며 읽게 하세요.", fit_slides:["question"]},
      {id:"e_space7", type:"extension", icon:"⬆", title:"바꿔 읽기", content:"\"띄어 읽기를 바꾸면 뜻이 어떻게 달라질까요?\" 비교해요.", fit_slides:["question"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"알맞게 띄어 읽으면 무엇이 좋죠?\" 뜻 전달을 짚어요.", fit_slides:["summary"]},
      {id:"e_poem7", type:"extension", icon:"⬆", title:"시 분위기 예고", content:"\"다음엔 시의 분위기를 살펴봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 시의 분위기 살펴보기 ① (자체 동시 「공놀이」) ---------------- */
  window.LESSONS["u4_l08"] = {
    meta: {grade:2, subject:"국어", unit:4, n:8, title:"시의 분위기를 살펴봐요 ①", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 자체 동시 「공놀이」 → 분위기 느끼기 → 분위기 고르기 → 분위기 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_poem8","t_poem8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시를 읽고 느낌을 떠올려요","시의 분위기를 살펴봐요","어떤 분위기인지 말해 봐요"]}, suggested_extras:["t_poem8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"통통 튀는 공처럼! 🏐", visual:"🏐", question:"\"통통 공이 / 콩콩 뛰어요 / 신나는 운동장 / 우리도 폴짝!\"<br>이 시는 어떤 느낌이 드나요?"}, suggested_extras:["q_feel8","r_poem8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"시의 분위기", content:"시에는 **분위기**가 있어요. 「공놀이」는 \"통통·콩콩·폴짝\" 같은 말과 운동장 장면 덕분에 **신나는** 분위기예요. 시에 쓰인 **말**과 **장면**을 보면 분위기를 알 수 있어요!", symbol_meanings:[{symbol:"통통·콩콩", meaning:"통통 튀는 느낌"},{symbol:"폴짝", meaning:"신나게 뛰는 모습"},{symbol:"운동장 장면", meaning:"활발한 분위기"},{symbol:"신나는 분위기", meaning:"밝고 즐거워요"}]}, suggested_extras:["t_poem8b","x_poem8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기? 🎭", sub:"시의 말과 장면을 보고 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 콩콩 폴짝!\" 공놀이 시는?", emoji:"🏐", name:"신나는 분위기"},{clue:"\"달님이 살며시 창가에 앉아요\"는?", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"빗방울이 또르르 잎을 타고\"는?", emoji:"💧", name:"맑고 잔잔한 분위기"}], outro:"말과 장면을 보면 분위기를 알 수 있어요. 분위기를 말해 볼까요? 😊"}, suggested_extras:["q_mood8","g_poem8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 말해요", question:"시의 분위기를 어떻게 느꼈나요?", items:["이 시는 어떤 분위기인가요?","어떤 말에서 그렇게 느꼈나요?","어떤 장면이 떠오르나요?"]}, suggested_extras:["t_present8","e_poem8"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시를 읽고 느낌을 떠올렸어요","시의 분위기를 살펴봤어요","어떤 분위기인지 말했어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 더 살펴봐요", body:"다음 시간에는 여러 시의 분위기를 더 살펴보고 비교해 볼 거예요!"}, suggested_extras:["e_poem8b"]}
    ],
    extras: [
      {id:"q_poem8", type:"fun_question", icon:"💡", title:"좋아하는 시", content:"\"시를 읽고 기분이 좋았던 적이 있나요?\" 시를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_poem8", type:"tip", icon:"🧩", title:"말과 장면", content:"분위기는 시의 말과 장면에서 느껴짐을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_feel8", type:"fun_question", icon:"🏐", title:"어떤 느낌", content:"\"이 시를 읽으니 어떤 느낌이 드나요?\" 분위기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_poem8", type:"real_world", icon:"🌍", title:"노래의 분위기", content:"신나는 노래·잔잔한 노래의 분위기와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_poem8b", type:"tip", icon:"🧩", title:"근거 찾기", content:"어떤 말·장면에서 분위기를 느꼈는지 근거를 찾게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_poem8", type:"misconception", icon:"❓", title:"느낌은 다양해요", content:"분위기를 느끼는 데 정답을 강요하지 말고 다양한 느낌을 인정하세요.", fit_slides:["concept"]},
      {id:"q_mood8", type:"fun_question", icon:"💡", title:"왜 그 분위기?", content:"\"어떤 말에서 그 분위기를 느꼈나요?\" 근거를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_poem8", type:"game", game_kind:"memory_match", icon:"🎮", title:"시 ↔ 분위기 짝짓기", description:"시와 분위기를 짝지어 보세요.", hint:"말과 장면을 떠올려요.", pairs:[{a:{text:"🏐 공놀이"},b:{text:"신나는"}},{a:{text:"🌙 달밤"},b:{text:"포근한"}},{a:{text:"💧 빗방울"},b:{text:"잔잔한"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"근거와 함께", content:"분위기를 말할 때 어떤 말·장면에서 느꼈는지 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_poem8", type:"extension", icon:"⬆", title:"장면 그리기", content:"\"시의 장면을 머릿속에 그려 볼까요?\" 상상을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"시의 분위기는 무엇으로 알 수 있죠?\" 말·장면을 짚어요.", fit_slides:["summary"]},
      {id:"e_poem8b", type:"extension", icon:"⬆", title:"이어 살펴보기 예고", content:"\"다음엔 여러 시의 분위기를 비교해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 시의 분위기 살펴보기 ② (비교) ---------------- */
  window.LESSONS["u4_l09"] = {
    meta: {grade:2, subject:"국어", unit:4, n:9, title:"시의 분위기를 살펴봐요 ②", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기 비교 → 분위기 만드는 말 → 밝은 말 모으기 → 장면↔분위기 잇기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_recall9","t_compare9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 시의 분위기를 비교해요","분위기를 만드는 말을 찾아요","장면과 분위기를 관련지어요"]}, suggested_extras:["t_compare9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"시마다 분위기가 달라요 🎨", visual:"🎨", question:"신나는 시, 조용한 시, 포근한 시…<br>무엇이 시의 분위기를 다르게 만들까요?"}, suggested_extras:["q_diff9","r_compare9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 만드는 것", content:"시의 분위기는 **쓰인 말**과 **그려지는 장면**이 만들어요. \"통통·신나는\" 같은 **밝은 말**은 신나는 분위기를, \"살며시·포근한\" 같은 **부드러운 말**은 조용한 분위기를 만들어요!", symbol_meanings:[{symbol:"밝은 말", meaning:"통통·신나는·반짝"},{symbol:"부드러운 말", meaning:"살며시·포근한·잔잔"},{symbol:"활발한 장면", meaning:"신나는 분위기"},{symbol:"고요한 장면", meaning:"조용한 분위기"}]}, suggested_extras:["t_compare9b","x_compare9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"밝은 분위기를 만드는 말은? ✨", sub:"분위기를 만드는 말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 분위기를 만드는 말은?", emoji:"🎉", name:"통통·폴짝·신나는"},{clue:"조용한 분위기를 만드는 말은?", emoji:"🌙", name:"살며시·고요한·잔잔한"},{clue:"포근한 분위기를 만드는 말은?", emoji:"🤱", name:"따뜻한·포근한·살포시"}], outro:"말에 따라 분위기가 달라져요. 장면과 분위기를 이어 볼까요? 😊"}, suggested_extras:["q_pick9","g_compare9"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"장면과 분위기를 관련지어요", question:"어떤 장면이 어떤 분위기를 만들까요?", items:["신나는 분위기의 장면은 어떤 모습인가요?","조용한 분위기의 장면은요?","내가 좋아하는 분위기는 무엇인가요?"]}, suggested_extras:["t_present9","e_compare9"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["여러 시의 분위기를 비교했어요","분위기를 만드는 말을 찾았어요","장면과 분위기를 관련지었어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽어요", body:"다음 시간에는 시의 분위기에 맞게 목소리를 조절하며 소리 내어 읽어 볼 거예요!"}, suggested_extras:["e_read9"]}
    ],
    extras: [
      {id:"q_recall9", type:"fun_question", icon:"💡", title:"지난 시", content:"\"지난 시간 「공놀이」는 어떤 분위기였죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_compare9", type:"tip", icon:"🧩", title:"비교하며 느끼기", content:"여러 분위기를 비교하면 차이가 또렷해짐을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_diff9", type:"fun_question", icon:"🎨", title:"무엇이 다를까", content:"\"무엇이 시의 분위기를 다르게 만들까요?\" 까닭을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_compare9", type:"real_world", icon:"🌍", title:"음악의 분위기", content:"빠른 음악·느린 음악의 분위기 차이와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_compare9b", type:"tip", icon:"🧩", title:"말이 분위기를", content:"쓰인 말이 분위기를 만든다는 점을 여러 예로 보여 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_compare9", type:"misconception", icon:"❓", title:"느낌은 다양해요", content:"한 시의 분위기를 하나로만 단정하지 말고 다양한 느낌을 인정하세요.", fit_slides:["concept"]},
      {id:"q_pick9", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"이 분위기를 만드는 말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_compare9", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 말 짝짓기", description:"분위기와 어울리는 말을 짝지어 보세요.", hint:"느낌을 만드는 말을 골라요.", pairs:[{a:{text:"🎉 신나는"},b:{text:"통통·폴짝"}},{a:{text:"🌙 조용한"},b:{text:"살며시·고요한"}},{a:{text:"🤱 포근한"},b:{text:"따뜻한·살포시"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"장면 떠올리기", content:"분위기와 어울리는 장면을 떠올려 말하게 하세요.", fit_slides:["question"]},
      {id:"e_compare9", type:"extension", icon:"⬆", title:"분위기 바꾸기", content:"\"같은 일을 다른 분위기로 표현하면 어떨까요?\" 상상을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 만드는 것은 무엇이죠?\" 말·장면을 짚어요.", fit_slides:["summary"]},
      {id:"e_read9", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 분위기를 살려 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 분위기 살려 읽기 ① ---------------- */
  window.LESSONS["u4_l10"] = {
    meta: {grade:2, subject:"국어", unit:4, n:10, title:"분위기를 생각하며 소리 내어 읽어요 ①", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기에 맞는 읽기 → 목소리·빠르기 → 어울리는 읽기 고르기 → 분위기 살려 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_read10","t_read10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기에 맞게 읽는 법을 알아봐요","목소리·빠르기를 조절해요","분위기를 살려 시를 읽어요"]}, suggested_extras:["t_read10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기에 맞게 읽어요 🎤", visual:"🎤", question:"신나는 시는 어떻게 읽을까요?<br>조용한 시는 또 어떻게 읽으면 좋을까요?"}, suggested_extras:["q_how10","r_read10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기에 맞는 읽기", content:"신나는 시는 **밝고 빠르게**, 조용한 시는 **천천히 부드럽게**, 포근한 시는 **따뜻하고 느리게** 읽어요. **목소리 크기·빠르기**를 분위기에 맞게 바꾸면 시의 느낌이 잘 살아나요!", symbol_meanings:[{symbol:"신나는 시", meaning:"밝고 빠르게"},{symbol:"조용한 시", meaning:"천천히 부드럽게"},{symbol:"포근한 시", meaning:"따뜻하고 느리게"},{symbol:"목소리·빠르기", meaning:"분위기에 맞게"}]}, suggested_extras:["t_read10b","x_read10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어울리는 읽기는? 🎤", sub:"시의 분위기에 어울리는 읽기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 「공놀이」 시는?", emoji:"🏐", name:"밝고 빠르게, 신나게"},{clue:"조용한 「달밤」 시는?", emoji:"🌙", name:"천천히 부드럽게"},{clue:"잔잔한 「빗방울」 시는?", emoji:"💧", name:"맑고 또박또박하게"}], outro:"분위기에 맞게 읽으니 시가 살아나요. 직접 읽어 볼까요? 😊"}, suggested_extras:["q_pick10","g_read10"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"분위기를 살려 읽어요 🎤", sub:"버튼을 눌러 읽을 친구를 뽑아요. 시의 분위기에 맞게 목소리를 조절하며 읽어 봐요!", count:24, hint:"신나면 밝고 빠르게, 조용하면 천천히 부드럽게 읽어 봐요", end_msg:"모두 분위기를 살려 멋지게 읽었어요. 시가 살아났어요! 👏"}, suggested_extras:["t_present10","e_read10"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기에 맞게 읽는 법을 알았어요","목소리·빠르기를 조절했어요","분위기를 살려 시를 읽었어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 더 읽어요", body:"다음 시간에는 좋아하는 시를 골라 분위기를 살려 낭송해 볼 거예요!"}, suggested_extras:["e_read10b"]}
    ],
    extras: [
      {id:"q_read10", type:"fun_question", icon:"💡", title:"읽는 방법", content:"\"신나는 글과 조용한 글을 같은 목소리로 읽을까요?\" 읽기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_read10", type:"tip", icon:"🧩", title:"목소리 조절", content:"분위기에 맞게 목소리·빠르기를 조절하는 데 초점을 두게 하세요. 시범이 효과적이에요.", fit_slides:["objective","concept"]},
      {id:"q_how10", type:"fun_question", icon:"🎤", title:"어떻게 읽을까", content:"\"이 시는 어떻게 읽으면 어울릴까요?\" 읽기 방법을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read10", type:"real_world", icon:"🌍", title:"동화 읽어 주기", content:"동화를 분위기 있게 읽어 준 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read10b", type:"tip", icon:"🧩", title:"분위기마다 다르게", content:"분위기마다 읽는 방법이 다름을 시범으로 보여 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read10", type:"misconception", icon:"❓", title:"똑같이 읽지 않기", content:"모든 시를 똑같이 읽지 말고 분위기에 맞게 바꿔 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_pick10", type:"fun_question", icon:"💡", title:"왜 어울릴까", content:"\"왜 그렇게 읽는 것이 어울릴까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read10", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽는 법 짝짓기", description:"분위기와 읽는 방법을 짝지어 보세요.", hint:"느낌에 맞는 읽기를 골라요.", pairs:[{a:{text:"🏐 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 조용한"},b:{text:"천천히 부드럽게"}},{a:{text:"💧 잔잔한"},b:{text:"맑고 또박또박"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"마음껏 읽기", content:"틀려도 괜찮으니 분위기를 살려 마음껏 읽게 격려하세요.", fit_slides:["present"]},
      {id:"e_read10", type:"extension", icon:"⬆", title:"몸짓 더하기", content:"\"분위기에 맞는 몸짓을 더해 볼까요?\" 표현을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살려 읽으려면 무엇을 조절하죠?\" 목소리·빠르기를 짚어요.", fit_slides:["summary"]},
      {id:"e_read10b", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 좋아하는 시를 낭송해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 분위기 살려 읽기 ② (낭송) ---------------- */
  window.LESSONS["u4_l11"] = {
    meta: {grade:2, subject:"국어", unit:4, n:11, title:"분위기를 생각하며 소리 내어 읽어요 ②", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 낭송이란 → 낭송 준비 → 알맞은 낭송 모으기 → 시 낭송하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_recite11","t_recite11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낭송이 무엇인지 알아봐요","낭송 준비를 해요","좋아하는 시를 분위기 살려 낭송해요"]}, suggested_extras:["t_recite11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"시를 노래하듯 읽어요 🎶", visual:"🎶", question:"시를 감정을 담아 소리 내어 읽는 것을 낭송이라고 해요.<br>낭송을 잘하려면 무엇을 준비할까요?"}, suggested_extras:["q_how11","r_recite11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송 준비하기", content:"낭송을 잘하려면 먼저 시의 **분위기**를 느끼고, 분위기에 맞게 **목소리·빠르기**를 정해요. 어디서 **쉬어 읽을지** 정하고, 마음을 담아 읽으면 멋진 낭송이 돼요!", symbol_meanings:[{symbol:"분위기 느끼기", meaning:"신나는·조용한…"},{symbol:"목소리 정하기", meaning:"밝게·부드럽게"},{symbol:"띄어 읽기", meaning:"어디서 쉴지"},{symbol:"마음 담기", meaning:"느낌을 살려"}]}, suggested_extras:["t_recite11b","x_recite11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞은 낭송은? ✅", sub:"분위기에 알맞은 낭송을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 시를 낭송할 때는?", emoji:"🎉", name:"밝고 신나는 목소리로"},{clue:"조용한 시를 낭송할 때는?", emoji:"🌙", name:"부드럽고 천천히"},{clue:"이렇게 낭송하면 아쉬워요!", emoji:"🙅", name:"분위기와 상관없이 한 가지로만"}], outro:"분위기를 느끼고 마음을 담으면 멋진 낭송이 돼요. 낭송해 볼까요? 😊"}, suggested_extras:["q_good11","g_recite11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"시를 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 좋아하는 시를 분위기에 맞게 마음을 담아 낭송해 봐요!", count:24, hint:"분위기를 느끼고, 목소리·빠르기를 맞춰 마음을 담아 낭송해요", end_msg:"모두 마음을 담아 멋지게 낭송했어요. 시가 살아났어요! 👏"}, suggested_extras:["t_present11","e_recite11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["낭송이 무엇인지 알았어요","낭송 준비를 했어요","좋아하는 시를 분위기 살려 낭송했어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시로 여는 우리 반", body:"다음 시간에는 좋아하는 시를 모아 '시로 여는 우리 반'을 만들어 볼 거예요!"}, suggested_extras:["e_class11"]}
    ],
    extras: [
      {id:"q_recite11", type:"fun_question", icon:"💡", title:"낭송 경험", content:"\"시를 소리 내어 읽어 본 적 있나요?\" 낭송을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_recite11", type:"tip", icon:"🧩", title:"낭송 준비", content:"분위기 느끼기→목소리 정하기→띄어 읽기 순서로 준비하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_how11", type:"fun_question", icon:"🎶", title:"무엇을 준비?", content:"\"낭송을 잘하려면 무엇을 준비할까요?\" 준비를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_recite11", type:"real_world", icon:"🌍", title:"시 낭송 듣기", content:"시 낭송을 들어 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_recite11b", type:"tip", icon:"🧩", title:"마음 담기", content:"분위기에 맞게 목소리를 정하고 마음을 담아 읽게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_recite11", type:"misconception", icon:"❓", title:"한 가지로만 X", content:"분위기와 상관없이 한 가지로만 읽지 않게 하세요.", fit_slides:["concept"]},
      {id:"q_good11", type:"fun_question", icon:"💡", title:"알맞은 낭송은?", content:"\"이 시에 알맞은 낭송은 무엇이죠?\" 분위기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_recite11", type:"game", game_kind:"memory_match", icon:"🎮", title:"시 ↔ 낭송 방법 짝짓기", description:"시 분위기와 낭송 방법을 짝지어 보세요.", hint:"느낌에 맞게 낭송해요.", pairs:[{a:{text:"🎉 신나는"},b:{text:"밝고 신나게"}},{a:{text:"🌙 조용한"},b:{text:"부드럽고 천천히"}},{a:{text:"💧 잔잔한"},b:{text:"맑고 또박또박"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 잘 듣게 하세요.", fit_slides:["present"]},
      {id:"e_recite11", type:"extension", icon:"⬆", title:"함께 낭송", content:"\"친구와 함께 한 편을 낭송해 볼까요?\" 함께 즐겨요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"낭송을 잘하려면 무엇을 준비하죠?\" 분위기·목소리를 짚어요.", fit_slides:["summary"]},
      {id:"e_class11", type:"extension", icon:"⬆", title:"우리 반 예고", content:"\"다음엔 시로 여는 우리 반을 만들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 시로 여는 우리 반 ① (실천) ---------------- */
  window.LESSONS["u4_l12"] = {
    meta: {grade:2, subject:"국어", unit:4, n:12, title:"시로 여는 우리 반을 만들어요 ① (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 좋아하는 시 고르기 → 낭송·듣기 약속 → 좋은 듣기 태도 모으기 → 시 낭송 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 12/15차시 · 실천"}, suggested_extras:["q_class12","t_class12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["좋아하는 시를 골라요","낭송하고 듣는 약속을 정해요","시를 낭송하고 나눠요"]}, suggested_extras:["t_class12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 반을 시로 채워요 🎀", visual:"🎀", question:"아침마다 좋아하는 시를 한 편씩 낭송하면<br>우리 반이 어떻게 달라질까요?"}, suggested_extras:["q_why12","r_class12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송하고 듣는 약속", content:"낭송할 땐 분위기를 살려 **마음을 담아** 읽고, 들을 땐 **바른 자세로** 잘 들어요. 친구 낭송에 \"좋았어\" 하고 **반응**해 주면 시로 여는 우리 반이 더 따뜻해져요!", symbol_meanings:[{symbol:"마음 담아 낭송", meaning:"분위기를 살려"},{symbol:"바른 듣기", meaning:"친구 낭송을 잘 들어요"},{symbol:"반응하기", meaning:"\"좋았어\" 박수"},{symbol:"함께 즐기기", meaning:"시로 따뜻한 우리 반"}]}, suggested_extras:["t_class12b","x_class12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 듣기 태도는? ✅", sub:"낭송을 들을 때 바른 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"친구가 낭송할 때는?", emoji:"👂", name:"바른 자세로 끝까지 들어요"},{clue:"낭송이 끝나면?", emoji:"👏", name:"박수로 응원해요"},{clue:"낭송 중에는?", emoji:"🤫", name:"조용히 집중해 들어요"}], outro:"잘 듣고 응원하면 낭송이 더 즐거워요. 시를 낭송해 볼까요? 😊"}, suggested_extras:["q_good12","g_class12"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"좋아하는 시를 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 좋아하는 시를 분위기 살려 낭송하고 함께 들어요!", count:24, hint:"고른 시의 분위기를 살려 마음을 담아 낭송해 봐요", end_msg:"모두 좋아하는 시를 멋지게 낭송했어요. 시로 여는 우리 반이 되었어요! 👏"}, suggested_extras:["t_present12","e_class12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["좋아하는 시를 골랐어요","낭송하고 듣는 약속을 지켰어요","시를 낭송하고 나눴어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시로 여는 우리 반을 이어가요", body:"다음 시간에는 더 많은 친구가 시를 낭송하며 시로 여는 우리 반을 이어갈 거예요!"}, suggested_extras:["e_class12b"]}
    ],
    extras: [
      {id:"q_class12", type:"fun_question", icon:"💡", title:"좋아하는 시", content:"\"낭송하고 싶은 시가 있나요?\" 시 고르기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_class12", type:"tip", icon:"🧩", title:"시로 여는 아침", content:"매일 아침 시 한 편으로 여는 우리 반 활동으로 이어 가게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_why12", type:"fun_question", icon:"🎀", title:"무엇이 달라질까", content:"\"시로 아침을 열면 우리 반이 어떻게 달라질까요?\" 상상을 열어요.", fit_slides:["motivate"]},
      {id:"r_class12", type:"real_world", icon:"🌍", title:"아침 활동", content:"아침마다 하는 우리 반 활동과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_class12b", type:"tip", icon:"🧩", title:"낭송과 듣기", content:"낭송하는 사람과 듣는 사람의 약속을 함께 정하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_class12", type:"misconception", icon:"❓", title:"잘 듣기", content:"낭송 중 떠들지 않고 잘 듣는 약속을 지키게 하세요.", fit_slides:["concept"]},
      {id:"q_good12", type:"fun_question", icon:"💡", title:"바른 태도는?", content:"\"낭송을 들을 때 바른 태도는 무엇이죠?\" 듣기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_class12", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 태도 짝짓기", description:"낭송 상황과 바른 태도를 짝지어 보세요.", hint:"잘 듣는 모습을 생각해요.", pairs:[{a:{text:"👂 낭송 중"},b:{text:"바른 자세로 듣기"}},{a:{text:"👏 끝난 뒤"},b:{text:"박수로 응원"}},{a:{text:"🤫 듣는 동안"},b:{text:"조용히 집중"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 응원하게 하세요.", fit_slides:["present"]},
      {id:"e_class12", type:"extension", icon:"⬆", title:"시 모으기", content:"\"우리 반 시 모음집을 만들면 어떨까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"좋은 듣기 태도는 무엇이죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_class12b", type:"extension", icon:"⬆", title:"이어가기 예고", content:"\"다음엔 시로 여는 우리 반을 이어가요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 시로 여는 우리 반 ② (이어가기) ---------------- */
  window.LESSONS["u4_l13"] = {
    meta: {grade:2, subject:"국어", unit:4, n:13, title:"시로 여는 우리 반을 만들어요 ② (실천)", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 낭송 차례 → 분위기 살린 낭송 → 잘된 낭송 짚기 → 낭송 발표·소감"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 13/15차시 · 실천"}, suggested_extras:["q_go13","t_go13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기를 살려 낭송해요","친구 낭송의 좋은 점을 찾아요","낭송 소감을 나눠요"]}, suggested_extras:["t_go13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"낭송이 더 멋져졌어요 ✨", visual:"✨", question:"여러 번 낭송하니 점점 멋져져요.<br>친구 낭송에서 어떤 점이 좋았나요?"}, suggested_extras:["q_good13","r_go13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송의 좋은 점 찾기", content:"친구 낭송을 들으며 **분위기를 잘 살렸는지**, **목소리가 어울렸는지**, **마음이 느껴졌는지** 살펴봐요. 좋은 점을 찾아 말해 주면 서로 자라고 낭송이 더 즐거워져요!", symbol_meanings:[{symbol:"분위기 살림", meaning:"느낌에 맞게 읽었나"},{symbol:"목소리", meaning:"분위기에 어울렸나"},{symbol:"마음", meaning:"느낌이 전해졌나"},{symbol:"좋은 점 찾기", meaning:"칭찬해 줘요"}]}, suggested_extras:["t_go13b","x_go13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낭송의 좋은 점은? ✅", sub:"낭송에서 칭찬할 좋은 점을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"분위기를 잘 살린 낭송은?", emoji:"🎭", name:"\"느낌이 잘 살았어\""},{clue:"목소리가 어울린 낭송은?", emoji:"🎵", name:"\"목소리가 시와 잘 맞았어\""},{clue:"마음이 느껴진 낭송은?", emoji:"💗", name:"\"마음이 잘 전해졌어\""}], outro:"좋은 점을 찾아 칭찬하면 모두 힘이 나요. 낭송을 발표해 볼까요? 😊"}, suggested_extras:["q_pick13","g_go13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"낭송하고 소감을 나눠요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 분위기를 살려 낭송하고, 들은 친구는 좋은 점을 말해 줘요!", count:24, hint:"분위기를 살려 낭송하고, 친구 낭송의 좋은 점을 구체적으로 말해 줘요", end_msg:"모두 멋지게 낭송하고 따뜻하게 나눴어요. 시로 여는 우리 반이 가득해요! 👏"}, suggested_extras:["t_present13","e_go13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["분위기를 살려 낭송했어요","친구 낭송의 좋은 점을 찾았어요","낭송 소감을 나눴어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 단원에서 배운 겹받침과 분위기를 스스로 돌아보고 정리해 볼 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_go13", type:"fun_question", icon:"💡", title:"멋진 낭송", content:"\"친구 낭송 중 기억에 남는 게 있나요?\" 나눔을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_go13", type:"tip", icon:"🧩", title:"좋은 점 찾기", content:"친구 낭송의 좋은 점을 구체적으로 찾게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_good13", type:"fun_question", icon:"✨", title:"무엇이 좋았나", content:"\"친구 낭송에서 어떤 점이 좋았나요?\" 좋은 점을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_go13", type:"real_world", icon:"🌍", title:"발표 응원", content:"친구 발표를 응원했던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_go13b", type:"tip", icon:"🧩", title:"세 가지 살피기", content:"분위기·목소리·마음 세 가지로 좋은 점을 살피게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_go13", type:"misconception", icon:"❓", title:"흠보다 좋은 점", content:"잘못을 지적하기보다 좋은 점을 찾아 칭찬하게 하세요.", fit_slides:["concept"]},
      {id:"q_pick13", type:"fun_question", icon:"💡", title:"어떤 점이 좋을까", content:"\"이 낭송의 어떤 점이 좋을까요?\" 좋은 점을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_go13", type:"game", game_kind:"memory_match", icon:"🎮", title:"낭송 ↔ 좋은 점 짝짓기", description:"낭송 특징과 좋은 점을 짝지어 보세요.", hint:"무엇을 잘했는지 생각해요.", pairs:[{a:{text:"🎭 분위기"},b:{text:"느낌이 살았어"}},{a:{text:"🎵 목소리"},b:{text:"시와 잘 맞았어"}},{a:{text:"💗 마음"},b:{text:"잘 전해졌어"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"구체적 칭찬", content:"\"좋았다\"보다 어떤 점이 좋은지 구체적으로 칭찬하게 하세요.", fit_slides:["present"]},
      {id:"e_go13", type:"extension", icon:"⬆", title:"시 습관", content:"\"앞으로 아침마다 시를 낭송해 볼까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송의 좋은 점을 무엇으로 살폈죠?\" 분위기·목소리·마음을 짚어요.", fit_slides:["summary"]},
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
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"4단원에서 무엇을 배웠나요? 🎀", visual:"📖", question:"겹받침을 바르게 읽고 쓰고, 시의 분위기를 살려 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침·분위기 정리", content:"이 단원에서 **겹받침을 바르게 읽고 쓰는 법**과 **시의 분위기를 살려 읽는 법**을 배웠어요. 겹받침은 소리는 하나·쓸 땐 두 글자, 시는 분위기에 맞게 목소리를 바꿔 읽어요!", symbol_meanings:[{symbol:"겹받침 읽기", meaning:"소리는 하나"},{symbol:"겹받침 쓰기", meaning:"두 글자 모두"},{symbol:"분위기 느끼기", meaning:"말·장면으로"},{symbol:"분위기 살려 읽기", meaning:"목소리·빠르기 조절"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑] (쓸 때는 '값')"},{clue:"신나는 시는 어떻게 읽을까요?", emoji:"🎉", name:"밝고 빠르게"},{clue:"겹받침은 쓸 때 어떻게?", emoji:"✍️", name:"받침 두 글자를 모두 써요"}], outro:"배운 것을 잘 기억하고 있어요. 바르게 읽고 분위기를 살려 읽어 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["겹받침 낱말을 바르게 읽고 쓸 수 있나요?","시의 분위기를 알 수 있나요?","분위기를 살려 시를 읽을 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","겹받침·분위기를 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 겹받침 낱말을 더 연습하고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"두 갈래", content:"겹받침과 분위기 살려 읽기 두 갈래를 함께 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"📖", title:"기억에 남는 활동", content:"\"겹받침·시 낭송 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"생활 속 적용", content:"생활에서 겹받침을 바르게 읽고 쓴 경험을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"핵심 정리", content:"겹받침은 소리 하나·두 글자, 시는 분위기 살려 읽기를 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"표기 살리기", content:"겹받침은 읽는 소리대로 쓰지 않음을 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"💰 겹받침 읽기"},b:{text:"소리는 하나"}},{a:{text:"✍️ 겹받침 쓰기"},b:{text:"두 글자 모두"}},{a:{text:"🎭 시"},b:{text:"분위기 살려"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"더 연습하고 싶은 것을 정해 볼까요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 겹받침·분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 겹받침 연습과 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·글씨) ---------------- */
  window.LESSONS["u4_l15"] = {
    meta: {grade:2, subject:"국어", unit:4, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 한 번 더 → 바른 소리 → 겹받침 낱말 찾기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"4단원 · 15/15차시 · 마무리"}, suggested_extras:["q_last","t_last"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["겹받침 낱말을 한 번 더 익혀요","바르게 읽고 쓰는 것을 다져요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_last"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 모아 봐요 🧩", visual:"🧩", question:"닭·값·흙·앉다·넓다·여덟…<br>겹받침 낱말을 얼마나 바르게 읽고 쓸 수 있나요?"}, suggested_extras:["q_last2","r_last"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 한 번 더 다지기", content:"겹받침은 **소리는 하나·쓸 땐 두 글자**! \"값\"은 [갑]·'값'으로, \"넓다\"는 [널따]·'넓다'로 써요. 읽는 소리에 속지 않고 받침을 살려 쓰는 것이 가장 중요해요!", symbol_meanings:[{symbol:"값 → [갑]", meaning:"쓸 때는 '값'"},{symbol:"닭 → [닥]", meaning:"쓸 때는 '닭'"},{symbol:"넓다 → [널따]", meaning:"쓸 때는 '넓다'"},{symbol:"여덟 → [여덜]", meaning:"쓸 때는 '여덟'"}]}, suggested_extras:["t_last2","x_last"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바른 소리를 골라요 ✅", sub:"겹받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"값\"의 바른 소리는?", emoji:"💰", name:"[갑]"},{clue:"\"여덟\"의 바른 소리는?", emoji:"8️⃣", name:"[여덜]"},{clue:"\"많다\"의 바른 소리는?", emoji:"➕", name:"[만타]"}], outro:"읽는 소리에 속지 않고 잘 골랐어요. 이제 글씨도 써 볼까요? 😊"}, suggested_extras:["q_last3","g_last"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **닭 · 넓다 · 분위기**를 받침을 살려 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 'ㄺ' 살려서"},{symbol:"넓다", meaning:"받침 'ㄼ' 살려서"},{symbol:"분위기", meaning:"또박또박 칸에 맞춰"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"4단원에서 배운 것", points:["겹받침을 바르게 읽고 썼어요","시의 분위기를 살려 읽었어요","겹받침 낱말을 다지고 글씨를 썼어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"바르고 재미있게!", body:"4단원을 모두 마쳤어요. 앞으로도 겹받침을 바르게 쓰고, 분위기를 살려 글을 읽어 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_last", type:"fun_question", icon:"💡", title:"겹받침 낱말", content:"\"가장 어려웠던 겹받침 낱말은 무엇인가요?\" 복습을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_last", type:"tip", icon:"🧩", title:"한 번 더 다지기", content:"겹받침 낱말을 읽고 쓰며 한 번 더 다지게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_last2", type:"fun_question", icon:"🧩", title:"얼마나 알까", content:"\"겹받침 낱말을 얼마나 바르게 쓸 수 있나요?\" 자신을 돌아봐요.", fit_slides:["motivate"]},
      {id:"r_last", type:"real_world", icon:"🌍", title:"낱말 찾기", content:"책·교실에서 겹받침 낱말을 찾아보게 해요.", fit_slides:["motivate"]},
      {id:"t_last2", type:"tip", icon:"🧩", title:"소리에 속지 않기", content:"읽는 소리에 속지 않고 받침을 살려 쓰게 다시 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_last", type:"misconception", icon:"❓", title:"받침 살리기", content:"[갑]으로 읽어도 '값'으로 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_last3", type:"fun_question", icon:"💡", title:"또 어떤 소리?", content:"\"이 낱말은 어떤 소리로 읽을까요?\" 함께 확인해요.", fit_slides:["card_quiz"]},
      {id:"g_last", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 바른 소리를 짝지어 보세요.", hint:"받침 소리를 떠올려요.", pairs:[{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}},{a:{text:"➕ 많다"},b:{text:"[만타]"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"받침 살려", content:"받침 두 글자를 모두 살려 또박또박 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"겹받침 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"4단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"바르게·재미있게", content:"\"오늘 배운 겹받침을 생활에서도 바르게 써 볼까요?\" 실천으로 이어요.", fit_slides:["next_lesson"]}
    ]
  };


})();
