/* ============================================================================
   2학년 1학기 국어 4단원 「분위기를 살려 읽어요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (나) 112~143 / 15차시.
   - 단원 목표: 말과 글을 바르고 재미있게 사용하기. 역량 비판적·창의적 사고.
   - 성취기준 [2국04-02](소리≠표기 바르게 읽고 쓰기)·[2국05-01](낭송·말의 재미)·[2국02-02](알맞게 띄어 읽기).
   ★ 저작권: 지도서 제재(「설문대 할망」·「쓰레기가 모여 있다고?」·수록 시·노래) 전부 미게재.
      겹받침 낱말은 표준 발음 자체 구성. 짧은 시는 보편 소재(공놀이·달밤·빗방울) 전부 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 소리와 글자가 다를 때 ---------------- */
  window.LESSONS["u4_l01"] = {
    meta: {grade:2, subject:"국어", unit:4, n:1, title:"단원 도입 — 분위기를 살려 읽어요", std:"[2국04-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 소리≠글자 만나기 → 겹받침이란 → 바른 소리 고르기 → 겹받침 낱말 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽어요", subtitle:"4단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["소리와 글자가 다를 수 있음을 알아봐요","겹받침이 무엇인지 알아봐요","겹받침 낱말을 바르게 읽어 봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"쓴 대로 읽지 않아요? 🤔", visual:"🐔", question:"'닭'은 글자는 '닭'인데 읽을 땐 [닥]이라고 해요.<br>왜 글자와 소리가 다를까요?"}, suggested_extras:["q_sound","r_word"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침과 소리", content:"받침에 글자가 **두 개** 있는 것을 **겹받침**이라고 해요. 겹받침은 **소리는 하나**로 나지만, **쓸 때는 두 글자를 모두** 살려요. '닭'은 [닥], '값'은 [갑]으로 읽어요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"ㄺ은 [ㄱ] 소리"},{symbol:"값 → [갑]", meaning:"ㅄ은 [ㅂ] 소리"},{symbol:"소리는 하나", meaning:"둘 중 한 소리만"},{symbol:"쓸 땐 둘 다", meaning:"받침 두 글자 모두"}]}, suggested_extras:["t_concept","x_write"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🔊", sub:"겹받침 낱말을 바르게 읽어 봐요. 카드를 누르면 소리가 나와요!", cards:[{clue:"'닭'은 어떻게 읽을까요?", emoji:"🐔", name:"[닥]"},{clue:"'값'은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"},{clue:"'흙'은 어떻게 읽을까요?", emoji:"🟤", name:"[흑]"}], outro:"글자는 두 개여도 소리는 하나예요. 겹받침 낱말을 더 떠올려 볼까요? 😊"}, suggested_extras:["q_more","g_sound"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 떠올려요", question:"받침이 두 글자인 낱말을 떠올려 볼까요?", items:["'닭·값·흙' 말고 또 어떤 낱말이 있을까요?","그 낱말은 어떻게 읽나요?","왜 글자와 소리가 다를까요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["소리와 글자가 다를 수 있음을 알았어요","겹받침이 무엇인지 알았어요","겹받침 낱말을 바르게 읽어 봤어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽으면 좋은 점", body:"다음 시간에는 시를 분위기에 맞게 읽으면 무엇이 좋은지 알아볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"신기한 낱말", content:"\"쓴 대로 읽지 않는 낱말을 본 적 있나요?\" 소리≠표기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '겹받침 바르게 읽고 쓰기 + 시 분위기 살려 읽기'예요. 두 결을 함께 안내하세요.", fit_slides:["objective","cover"]},
      {id:"q_sound", type:"fun_question", icon:"🐔", title:"왜 다를까", content:"\"왜 '닭'을 [닥]이라고 읽을까요?\" 호기심을 열어요.", fit_slides:["motivate"]},
      {id:"r_word", type:"real_world", icon:"🌍", title:"둘레의 겹받침", content:"교실·집에서 본 겹받침 낱말(닭·값·흙)과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"소리는 하나", content:"겹받침은 글자 둘이지만 소리는 하나임을 또렷이 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_write", type:"misconception", icon:"❓", title:"쓸 땐 둘 다", content:"소리가 하나라고 받침을 하나만 쓰지 않게, 쓸 땐 두 글자 모두 쓰게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"q_more", type:"fun_question", icon:"💡", title:"또 있을까", content:"\"겹받침 낱말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sound", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"어떻게 읽는지 떠올려요.", pairs:[{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"소리 내어", content:"겹받침 낱말을 소리 내어 읽어 보며 소리와 글자의 차이를 느끼게 하세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"더 찾기", content:"\"교실에서 겹받침 낱말을 찾아볼까요?\" 어휘를 넓혀요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 소리가 몇 개죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시를 분위기에 맞게 읽으면 좋은 점을 알아봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 분위기를 살려 읽으면 좋은 점 (준비) ---------------- */
  window.LESSONS["u4_l02"] = {
    meta: {grade:2, subject:"국어", unit:4, n:2, title:"분위기를 살려 읽으면 좋은 점", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 같은 글 다른 느낌 → 분위기란 → 분위기 고르기 → 분위기 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽으면 좋은 점", subtitle:"4단원 · 2/15차시 · 준비"}, suggested_extras:["q_mood","t_mood"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글의 분위기가 무엇인지 알아봐요","분위기를 살려 읽으면 좋은 점을 알아봐요","글에서 분위기를 느껴 봐요"]}, suggested_extras:["t_mood"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"같은 글, 다르게 읽으면? 🎭", visual:"🎭", question:"신나는 글을 느릿느릿 읽으면 어떨까요?<br>글에 어울리게 읽으면 무엇이 좋을까요?"}, suggested_extras:["q_read2","r_mood2"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글의 분위기", content:"분위기는 글에서 느껴지는 **느낌**이에요. 신나는·조용한·포근한 분위기처럼요. 분위기를 살려 읽으면 글의 **느낌이 잘 전해지고**, 읽는 것도 더 **재미있어요**!", symbol_meanings:[{symbol:"신나는 분위기", meaning:"밝고 빠르게"},{symbol:"조용한 분위기", meaning:"차분하고 작게"},{symbol:"포근한 분위기", meaning:"부드럽고 따뜻하게"},{symbol:"분위기 살리기", meaning:"느낌이 잘 전해져요"}]}, suggested_extras:["t_mood2","x_same"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 글은 어떤 분위기? 🎭", sub:"글에서 느껴지는 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"신난다! 친구들과 운동장을 달려요!\"", emoji:"🏃", name:"신나는 분위기"},{clue:"\"깜깜한 밤, 별이 조용히 빛나요.\"", emoji:"🌙", name:"조용한 분위기"},{clue:"\"엄마 품에 안겨 포근하게 잠들어요.\"", emoji:"🤗", name:"포근한 분위기"}], outro:"글마다 분위기가 달라요. 분위기를 느끼며 읽으면 더 재미있어요! 😊"}, suggested_extras:["q_pick2","g_mood2"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 떠올려요", question:"여러 분위기를 떠올려 볼까요?", items:["신나는 분위기의 글은 어떤 글일까요?","조용한 분위기의 글은요?","분위기에 맞게 읽으면 무엇이 좋을까요?"]}, suggested_extras:["t_present2","e_mood2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글의 분위기가 무엇인지 알았어요","분위기를 살려 읽으면 좋은 점을 알았어요","글에서 분위기를 느껴 봤어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 읽고 써요", body:"다음 시간에는 겹받침이 있는 낱말을 바르게 읽고 쓰는 법을 배워 볼 거예요!"}, suggested_extras:["e_double2"]}
    ],
    extras: [
      {id:"q_mood", type:"fun_question", icon:"💡", title:"느낌이 다른 글", content:"\"신나는 글과 조용한 글, 무엇이 다를까요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood", type:"tip", icon:"🧩", title:"분위기 = 느낌", content:"분위기는 글에서 느껴지는 느낌임을 쉽게 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_read2", type:"fun_question", icon:"🎭", title:"어울리게 읽기", content:"\"글에 어울리게 읽으면 무엇이 좋을까요?\" 까닭을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_mood2", type:"real_world", icon:"🌍", title:"노래의 분위기", content:"신나는 노래·잔잔한 노래의 느낌 차이와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mood2", type:"tip", icon:"🧩", title:"말·장면으로", content:"분위기는 글의 말과 장면에서 느낄 수 있음을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_same", type:"misconception", icon:"❓", title:"한 가지로 읽지 않기", content:"모든 글을 같은 목소리로 읽지 말고 분위기에 맞게 읽게 안내하세요.", fit_slides:["concept"]},
      {id:"q_pick2", type:"fun_question", icon:"💡", title:"왜 그 분위기?", content:"\"왜 그런 분위기로 느껴질까요?\" 까닭을 묻어요.", fit_slides:["card_quiz"]},
      {id:"g_mood2", type:"game", game_kind:"memory_match", icon:"🎮", title:"장면 ↔ 분위기 짝짓기", description:"장면과 분위기를 짝지어 보세요.", hint:"느낌을 떠올려요.", pairs:[{a:{text:"🏃 달리기"},b:{text:"신나는"}},{a:{text:"🌙 별이 빛남"},b:{text:"조용한"}},{a:{text:"🤗 품에 안김"},b:{text:"포근한"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"예 들어 말하기", content:"각 분위기의 글을 예로 들어 말하게 해 분위기를 또렷이 느끼게 하세요.", fit_slides:["question"]},
      {id:"e_mood2", type:"extension", icon:"⬆", title:"또 어떤 분위기?", content:"\"또 어떤 분위기가 있을까요? (무서운·즐거운)\" 분위기를 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살려 읽으면 무엇이 좋죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_double2", type:"extension", icon:"⬆", title:"겹받침 예고", content:"\"다음엔 겹받침 낱말을 읽고 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 겹받침 낱말 읽고 쓰기 ① (ㄺ) ---------------- */
  window.LESSONS["u4_l03"] = {
    meta: {grade:2, subject:"국어", unit:4, n:3, title:"겹받침 낱말을 읽고 써요 ①", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄺ 겹받침 → 소리와 표기 → 바른 소리 고르기 → 겹받침 낱말 써 보기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_rk","t_rk"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㄺ 겹받침 낱말을 읽어 봐요","소리와 글자가 다름을 다시 알아봐요","겹받침 낱말을 바르게 써 봐요"]}, suggested_extras:["t_rk"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"'읽다'를 읽어 봐요 📖", visual:"📖", question:"'읽다'는 글자는 '읽다'인데 [익따]라고 읽어요.<br>'ㄺ' 받침은 어떤 소리가 날까요?"}, suggested_extras:["q_read3","r_rk"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"ㄺ 겹받침", content:"받침 **ㄺ**은 보통 **[ㄱ]** 소리가 나요. '맑다'는 [막따], '읽다'는 [익따], '닭'은 [닥]으로 읽어요. 하지만 **쓸 때는 'ㄺ'** 두 글자를 모두 써요!", symbol_meanings:[{symbol:"맑다 → [막따]", meaning:"ㄺ은 [ㄱ] 소리"},{symbol:"읽다 → [익따]", meaning:"ㄺ은 [ㄱ] 소리"},{symbol:"닭 → [닥]", meaning:"ㄺ은 [ㄱ] 소리"},{symbol:"쓸 땐 ㄺ", meaning:"두 글자 모두 써요"}]}, suggested_extras:["t_rk2","x_rk"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🔊", sub:"ㄺ 겹받침 낱말을 바르게 읽어 봐요. 카드를 누르면 소리가 나와요!", cards:[{clue:"'맑다'는 어떻게 읽을까요?", emoji:"☀️", name:"[막따]"},{clue:"'읽다'는 어떻게 읽을까요?", emoji:"📖", name:"[익따]"},{clue:"'흙'은 어떻게 읽을까요?", emoji:"🟤", name:"[흑]"}], outro:"'ㄺ'은 [ㄱ] 소리가 나요. 이제 바르게 써 볼까요? 😊"}, suggested_extras:["q_pick3","g_rk"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침을 바르게 써요 ✍️", content:"소리가 [ㄱ]이라고 받침을 'ㄱ'만 쓰면 안 돼요. **'맑다·읽다·흙'**처럼 받침 **'ㄺ'**을 또박또박 모두 써요. 칸에 맞춰 바르게 써 보세요!", symbol_meanings:[{symbol:"맑다", meaning:"받침 ㄺ을 모두"},{symbol:"읽다", meaning:"받침 ㄺ을 모두"},{symbol:"흙", meaning:"받침 ㄺ을 모두"}]}, suggested_extras:["t_trace3","e_rk3"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㄺ 겹받침 낱말을 읽었어요","소리와 글자가 다름을 알았어요","겹받침 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 겹받침을 읽고 써요", body:"다음 시간에는 ㄵ·ㄼ 같은 여러 겹받침 낱말을 읽고 써 볼 거예요!"}, suggested_extras:["e_more3"]}
    ],
    extras: [
      {id:"q_rk", type:"fun_question", icon:"💡", title:"읽기 어려운 낱말", content:"\"읽기 헷갈리는 받침이 있었나요?\" 겹받침을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_rk", type:"tip", icon:"🧩", title:"ㄺ은 [ㄱ]", content:"ㄺ 받침이 보통 [ㄱ] 소리가 남을 또렷이 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_read3", type:"fun_question", icon:"📖", title:"어떤 소리?", content:"\"'읽다'를 소리 내어 읽으면 어떻게 들리나요?\" 소리를 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_rk", type:"real_world", icon:"🌍", title:"둘레의 ㄺ", content:"'맑은 하늘·읽는 책'처럼 생활 속 ㄺ 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_rk2", type:"tip", icon:"🧩", title:"소리≠표기 다시", content:"소리는 [ㄱ]이지만 쓸 땐 ㄺ을 모두 씀을 강조하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_rk", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"소리만 따라 'ㄱ'만 쓰지 않게, 받침 두 글자를 모두 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_pick3", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"ㄺ 받침 낱말이 또 있을까요? (밝다·굵다)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_rk", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"ㄺ 낱말과 소리를 짝지어 보세요.", hint:"[ㄱ] 소리를 떠올려요.", pairs:[{a:{text:"☀️ 맑다"},b:{text:"[막따]"}},{a:{text:"📖 읽다"},b:{text:"[익따]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace3", type:"tip", icon:"✍️", title:"받침 모두 쓰기", content:"겹받침 두 글자를 또박또박 모두 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"e_rk3", type:"extension", icon:"⬆", title:"문장으로", content:"\"'맑다'로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"ㄺ은 어떤 소리가 나죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_more3", type:"extension", icon:"⬆", title:"여러 겹받침 예고", content:"\"다음엔 ㄵ·ㄼ 겹받침을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 겹받침 낱말 읽고 쓰기 ② (ㄵ·ㄼ) ---------------- */
  window.LESSONS["u4_l04"] = {
    meta: {grade:2, subject:"국어", unit:4, n:4, title:"겹받침 낱말을 읽고 써요 ②", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄵ·ㄼ 겹받침 → 소리 살펴보기 → 바른 소리 고르기 → 겹받침 낱말 써 보기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_nj"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["ㄵ·ㄼ 겹받침 낱말을 읽어 봐요","겹받침마다 소리가 다름을 알아봐요","겹받침 낱말을 바르게 써 봐요"]}, suggested_extras:["t_nj"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"'앉다'를 읽어 봐요 🪑", visual:"🪑", question:"'앉다'는 [안따]로 읽어요.<br>'ㄵ' 받침은 어떤 소리가 날까요?"}, suggested_extras:["q_read4","r_nj"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"ㄵ·ㄼ 겹받침", content:"받침 **ㄵ**은 **[ㄴ]** 소리가 나요. '앉다'는 [안따], '많다'는 [만타]. 받침 **ㄼ**은 보통 **[ㄹ]** 소리가 나요. '넓다'는 [널따], '여덟'은 [여덜]. 쓸 때는 받침 두 글자를 모두 써요!", symbol_meanings:[{symbol:"앉다 → [안따]", meaning:"ㄵ은 [ㄴ] 소리"},{symbol:"많다 → [만타]", meaning:"ㄶ은 [ㄴ] 소리"},{symbol:"넓다 → [널따]", meaning:"ㄼ은 [ㄹ] 소리"},{symbol:"여덟 → [여덜]", meaning:"ㄼ은 [ㄹ] 소리"}]}, suggested_extras:["t_nj2","x_nj"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🔊", sub:"ㄵ·ㄼ 겹받침 낱말을 바르게 읽어 봐요. 카드를 누르면 소리가 나와요!", cards:[{clue:"'앉다'는 어떻게 읽을까요?", emoji:"🪑", name:"[안따]"},{clue:"'넓다'는 어떻게 읽을까요?", emoji:"📏", name:"[널따]"},{clue:"'여덟'은 어떻게 읽을까요?", emoji:"8️⃣", name:"[여덜]"}], outro:"겹받침마다 나는 소리가 달라요. 이제 바르게 써 볼까요? 😊"}, suggested_extras:["q_pick4","g_nj"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침을 바르게 써요 ✍️", content:"소리가 [ㄴ]·[ㄹ]이라고 받침을 하나만 쓰면 안 돼요. **'앉다·넓다·여덟'**처럼 받침을 **모두** 또박또박 써요. 칸에 맞춰 바르게 써 보세요!", symbol_meanings:[{symbol:"앉다", meaning:"받침 ㄵ을 모두"},{symbol:"넓다", meaning:"받침 ㄼ을 모두"},{symbol:"여덟", meaning:"받침 ㄼ을 모두"}]}, suggested_extras:["t_trace4","e_nj4"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["ㄵ·ㄼ 겹받침 낱말을 읽었어요","겹받침마다 소리가 다름을 알았어요","겹받침 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침을 정리해요", body:"다음 시간에는 여러 겹받침을 정리하고 낱말을 바르게 읽고 쓰는 연습을 할 거예요!"}, suggested_extras:["e_sum4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 겹받침", content:"\"지난 시간에 배운 ㄺ은 어떤 소리였죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_nj", type:"tip", icon:"🧩", title:"받침마다 소리", content:"ㄵ은 [ㄴ], ㄼ은 [ㄹ] 소리가 남을 또렷이 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_read4", type:"fun_question", icon:"🪑", title:"어떤 소리?", content:"\"'앉다'를 소리 내어 읽으면 어떻게 들리나요?\" 소리를 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_nj", type:"real_world", icon:"🌍", title:"둘레의 겹받침", content:"'앉다·넓다'처럼 생활에서 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_nj2", type:"tip", icon:"🧩", title:"소리 구분", content:"ㄺ[ㄱ]·ㄵ[ㄴ]·ㄼ[ㄹ]을 구분해 익히게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_nj", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"소리만 따라 받침을 하나만 쓰지 않게 하세요.", fit_slides:["concept"]},
      {id:"q_pick4", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"ㄵ·ㄼ 받침 낱말이 또 있을까요? (얹다·짧다)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_nj", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"ㄵ·ㄼ 낱말과 소리를 짝지어 보세요.", hint:"받침 소리를 떠올려요.", pairs:[{a:{text:"🪑 앉다"},b:{text:"[안따]"}},{a:{text:"📏 넓다"},b:{text:"[널따]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace4", type:"tip", icon:"✍️", title:"받침 모두 쓰기", content:"겹받침 두 글자를 또박또박 모두 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"e_nj4", type:"extension", icon:"⬆", title:"문장으로", content:"\"'넓다'로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"ㄵ·ㄼ은 어떤 소리가 나죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_sum4", type:"extension", icon:"⬆", title:"정리 예고", content:"\"다음엔 겹받침을 정리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 겹받침 낱말 읽고 쓰기 ③ (정리) ---------------- */
  window.LESSONS["u4_l05"] = {
    meta: {grade:2, subject:"국어", unit:4, n:5, title:"겹받침 낱말을 읽고 써요 ③", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 정리 → 소리≠표기 다시 → 바르게 쓴 낱말 고르기 → 겹받침 낱말 연습"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_sum5","t_sum5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["배운 겹받침을 정리해요","바르게 쓴 낱말을 찾아봐요","겹받침 낱말을 연습해요"]}, suggested_extras:["t_sum5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침 낱말 다시 보기 🔍", visual:"🔤", question:"닭·값·앉다·넓다… 모두 겹받침 낱말이에요.<br>읽을 때와 쓸 때, 무엇이 다를까요?"}, suggested_extras:["q_diff5","r_sum5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 정리", content:"겹받침은 **읽을 땐 한 소리**, **쓸 땐 두 글자 모두**예요. ㄺ은 [ㄱ], ㄵ은 [ㄴ], ㄼ은 [ㄹ] 소리가 나요. 헷갈릴 땐 **천천히 소리 내어** 읽고, 쓸 땐 **받침을 모두** 쓰면 돼요!", symbol_meanings:[{symbol:"ㄺ → [ㄱ]", meaning:"맑다·읽다·흙"},{symbol:"ㄵ → [ㄴ]", meaning:"앉다·얹다"},{symbol:"ㄼ → [ㄹ]", meaning:"넓다·여덟"},{symbol:"쓸 땐 모두", meaning:"받침 두 글자 다"}]}, suggested_extras:["t_sum5b","x_sum5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 쓴 낱말은? ✅", sub:"겹받침을 바르게 쓴 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"[막따]로 읽는 낱말을 바르게 쓰면?", emoji:"☀️", name:"\"맑다\" (받침 ㄺ)"},{clue:"[안따]로 읽는 낱말을 바르게 쓰면?", emoji:"🪑", name:"\"앉다\" (받침 ㄵ)"},{clue:"[널따]로 읽는 낱말을 바르게 쓰면?", emoji:"📏", name:"\"넓다\" (받침 ㄼ)"}], outro:"소리는 하나여도 쓸 땐 받침을 모두 써요. 잘 기억하고 있어요! 😊"}, suggested_extras:["q_pick5","g_sum5"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 연습해요 ✍️", content:"배운 겹받침 낱말을 또박또박 써 봐요. **'닭 · 값 · 앉다'**의 받침을 모두 살려 칸에 맞춰 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 ㄺ"},{symbol:"값", meaning:"받침 ㅄ"},{symbol:"앉다", meaning:"받침 ㄵ"}]}, suggested_extras:["t_trace5","e_sum5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["배운 겹받침을 정리했어요","바르게 쓴 낱말을 찾았어요","겹받침 낱말을 연습했어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침에 주의하며 글을 읽어요", body:"다음 시간에는 글 속에서 겹받침 낱말을 찾아 바르게 읽고 내용을 이해해 볼 거예요!"}, suggested_extras:["e_read5"]}
    ],
    extras: [
      {id:"q_sum5", type:"fun_question", icon:"💡", title:"기억나는 낱말", content:"\"지금까지 배운 겹받침 낱말이 기억나나요?\" 정리를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_sum5", type:"tip", icon:"🧩", title:"읽기·쓰기 함께", content:"읽을 땐 한 소리, 쓸 땐 두 글자 원리를 다시 묶어 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_diff5", type:"fun_question", icon:"🔤", title:"무엇이 다를까", content:"\"읽을 때와 쓸 때 무엇이 다를까요?\" 원리를 짚어요.", fit_slides:["motivate"]},
      {id:"r_sum5", type:"real_world", icon:"🌍", title:"받아쓰기", content:"받아쓰기에서 겹받침을 틀린 경험과 이어 바르게 쓰게 해요.", fit_slides:["motivate"]},
      {id:"t_sum5b", type:"tip", icon:"🧩", title:"천천히 소리 내어", content:"헷갈리면 천천히 소리 내어 읽어 보게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_sum5", type:"misconception", icon:"❓", title:"받침 하나만 주의", content:"소리만 따라 받침을 하나만 쓰지 않게 거듭 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_pick5", type:"fun_question", icon:"💡", title:"왜 바를까", content:"\"왜 이렇게 써야 바를까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_sum5", type:"game", game_kind:"memory_match", icon:"🎮", title:"받침 ↔ 소리 짝짓기", description:"겹받침과 소리를 짝지어 보세요.", hint:"받침마다 소리를 떠올려요.", pairs:[{a:{text:"ㄺ"},b:{text:"[ㄱ]"}},{a:{text:"ㄵ"},b:{text:"[ㄴ]"}},{a:{text:"ㄼ"},b:{text:"[ㄹ]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace5", type:"tip", icon:"✍️", title:"받침 모두 쓰기", content:"겹받침 두 글자를 또박또박 모두 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"e_sum5", type:"extension", icon:"⬆", title:"낱말 모으기", content:"\"배운 겹받침 낱말을 모아 볼까요?\" 어휘를 모아요.", fit_slides:["concept"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 읽을 때와 쓸 때 어떻게 다르죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_read5", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 글에서 겹받침을 찾아 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 겹받침에 주의하며 글 읽기 ① ---------------- */
  window.LESSONS["u4_l06"] = {
    meta: {grade:2, subject:"국어", unit:4, n:6, title:"겹받침에 주의하며 글을 읽어요 ①", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 글 속 겹받침 → 바르게 읽기 → 글에서 겹받침 모두 찾기 → 소리 내어 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침에 주의하며 글을 읽어요", subtitle:"4단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_read6","t_find6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글 속에서 겹받침 낱말을 찾아요","겹받침 낱말을 바르게 읽어요","글의 내용을 이해해요"]}, suggested_extras:["t_find6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글 속에 숨은 겹받침 🔍", visual:"📄", question:"\"맑은 하늘 아래 닭이 흙을 밟고 걸어요.\"<br>이 문장에 겹받침 낱말이 몇 개 있을까요?"}, suggested_extras:["q_count6","r_read6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침에 주의하며 읽기", content:"글을 읽을 땐 겹받침 낱말을 **바르게** 읽어야 뜻이 잘 통해요. '맑은'은 [말근], '밟고'는 [밥꼬]처럼요. 겹받침이 나오면 **천천히** 소리 내어 바르게 읽어요!", symbol_meanings:[{symbol:"맑은 → [말근]", meaning:"ㄺ + 모음"},{symbol:"닭이 → [달기]", meaning:"ㄺ + 모음"},{symbol:"흙을 → [흘글]", meaning:"ㄺ + 모음"},{symbol:"천천히 읽기", meaning:"바르게 소리 내어"}]}, suggested_extras:["t_read6b","x_flow6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 낱말, 바르게 읽으면? 🔊", sub:"글 속 겹받침 낱말을 바르게 읽어 봐요. 카드를 누르면 소리가 나와요!", cards:[{clue:"\"맑은 하늘\"의 '맑은'은?", emoji:"☀️", name:"[말근]"},{clue:"\"닭이 운다\"의 '닭이'는?", emoji:"🐔", name:"[달기]"},{clue:"\"흙을 밟다\"의 '흙을'은?", emoji:"🟤", name:"[흘글]"}], outro:"겹받침 뒤에 모음이 오면 받침이 넘어가 소리 나요. 글을 읽어 볼까요? 😊"}, suggested_extras:["q_pick6","g_read6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"소리 내어 읽어요", question:"겹받침 낱말이 든 문장을 바르게 읽어 볼까요?", items:["문장에서 겹받침 낱말을 찾았나요?","그 낱말을 어떻게 읽나요?","바르게 읽으니 뜻이 잘 통하나요?"]}, suggested_extras:["t_present6","e_read6"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글 속 겹받침 낱말을 찾았어요","겹받침 낱말을 바르게 읽었어요","글의 내용을 이해했어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글을 더 읽고 내용을 나눠요", body:"다음 시간에는 글을 더 읽으며 겹받침에 주의하고 내용을 나눠 볼 거예요!"}, suggested_extras:["e_read6b"]}
    ],
    extras: [
      {id:"q_read6", type:"fun_question", icon:"💡", title:"읽기 연습", content:"\"글을 읽다 받침에서 멈칫한 적 있나요?\" 겹받침 읽기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_find6", type:"tip", icon:"🧩", title:"찾으며 읽기", content:"글에서 겹받침 낱말을 찾으며 읽게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_count6", type:"fun_question", icon:"🔍", title:"몇 개일까", content:"\"이 문장에 겹받침 낱말이 몇 개일까요?\" 함께 찾아요.", fit_slides:["motivate"]},
      {id:"r_read6", type:"real_world", icon:"🌍", title:"소리 내어 읽기", content:"책을 소리 내어 읽은 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read6b", type:"tip", icon:"🧩", title:"모음 만나면", content:"겹받침 뒤에 모음이 오면 받침이 넘어가 소리 남을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_flow6", type:"misconception", icon:"❓", title:"빨리보다 바르게", content:"빨리 읽기보다 겹받침을 바르게 읽는 데 초점을 두게 하세요.", fit_slides:["concept"]},
      {id:"q_pick6", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"글에 또 어떤 겹받침 낱말이 있을까요?\" 함께 찾아요.", fit_slides:["card_quiz"]},
      {id:"g_read6", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"글 속 겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침이 넘어가는 소리를 떠올려요.", pairs:[{a:{text:"☀️ 맑은"},b:{text:"[말근]"}},{a:{text:"🐔 닭이"},b:{text:"[달기]"}},{a:{text:"🟤 흙을"},b:{text:"[흘글]"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"바르게 읽기", content:"겹받침 낱말을 천천히 바르게 소리 내어 읽게 하세요.", fit_slides:["question"]},
      {id:"e_read6", type:"extension", icon:"⬆", title:"문장 만들기", content:"\"겹받침 낱말로 문장을 만들어 읽어 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"글 속 겹받침을 어떻게 읽죠?\" 바르게 읽기를 짚어요.", fit_slides:["summary"]},
      {id:"e_read6b", type:"extension", icon:"⬆", title:"이어 읽기 예고", content:"\"다음엔 글을 더 읽고 내용을 나눠요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 겹받침에 주의하며 글 읽기 ② ---------------- */
  window.LESSONS["u4_l07"] = {
    meta: {grade:2, subject:"국어", unit:4, n:7, title:"겹받침에 주의하며 글을 읽어요 ②", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 알맞게 띄어 읽기 → 글 내용 이해 → 바른 읽기 모으기 → 글 읽고 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침에 주의하며 글을 읽어요", subtitle:"4단원 · 7/15차시 · 소단원 1"}, suggested_extras:["q_recall7","t_space7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["뜻이 드러나게 알맞게 띄어 읽어요","겹받침에 주의하며 읽어요","글의 내용을 나눠요"]}, suggested_extras:["t_space7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어디서 띄어 읽을까? ✂️", visual:"📖", question:"\"아기가 방울을 흔들어요\"를 한 번에 읽기보다<br>알맞게 띄어 읽으면 뜻이 더 잘 통해요!"}, suggested_extras:["q_space7","r_space7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"알맞게 띄어 읽기", content:"글을 읽을 땐 **뜻이 묶이는 곳**에서 살짝 쉬어 **띄어 읽어요**. 너무 잘게 끊거나 한 번에 몰아 읽지 않고, 알맞게 띄어 읽으면 **뜻이 또렷**해져요. 겹받침도 바르게 읽고요!", symbol_meanings:[{symbol:"뜻으로 묶기", meaning:"의미 단위로 쉬어요"},{symbol:"살짝 쉬기", meaning:"쉼표·마침표에서"},{symbol:"또렷하게", meaning:"뜻이 잘 통해요"},{symbol:"겹받침 바르게", meaning:"천천히 바르게"}]}, suggested_extras:["t_space7b","x_space7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞게 읽은 것은? ✅", sub:"알맞게 띄어 읽고 바르게 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 하늘에 / 흰 구름이 떠 있다\"", emoji:"☁️", name:"뜻으로 묶어 알맞게 띄어 읽음"},{clue:"\"맑은하늘에흰구름이떠있다\"", emoji:"🙅", name:"몰아 읽어 뜻이 안 통함"},{clue:"\"맑 / 은 / 하 / 늘\"", emoji:"🙅", name:"너무 잘게 끊어 어색함"}], outro:"뜻으로 묶어 알맞게 띄어 읽으면 뜻이 또렷해요. 함께 읽어 볼까요? 😊"}, suggested_extras:["q_pick7","g_space7"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"글을 읽고 나눠요", question:"알맞게 띄어 읽고 내용을 나눠 볼까요?", items:["어디에서 띄어 읽었나요?","겹받침 낱말을 바르게 읽었나요?","글은 무슨 내용이었나요?"]}, suggested_extras:["t_present7","e_read7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["뜻이 드러나게 알맞게 띄어 읽었어요","겹받침에 주의하며 읽었어요","글의 내용을 나눴어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시의 분위기를 살펴봐요", body:"다음 시간에는 시를 읽으며 어떤 분위기인지 살펴볼 거예요!"}, suggested_extras:["e_mood7"]}
    ],
    extras: [
      {id:"q_recall7", type:"fun_question", icon:"💡", title:"지난 읽기", content:"\"지난 시간에 겹받침을 바르게 읽었나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_space7", type:"tip", icon:"🧩", title:"의미 단위로", content:"뜻이 묶이는 의미 단위로 띄어 읽게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_space7", type:"fun_question", icon:"📖", title:"어디서 쉴까", content:"\"이 문장은 어디에서 쉬어 읽으면 좋을까요?\" 띄어 읽기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_space7", type:"real_world", icon:"🌍", title:"읽어 주기", content:"선생님·가족이 책을 읽어 줄 때의 쉼과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_space7b", type:"tip", icon:"🧩", title:"쉼표·마침표", content:"쉼표·마침표에서 자연스럽게 쉬어 읽게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_space7", type:"misconception", icon:"❓", title:"몰아·잘게 주의", content:"한 번에 몰아 읽거나 너무 잘게 끊지 않게 안내하세요.", fit_slides:["concept"]},
      {id:"q_pick7", type:"fun_question", icon:"💡", title:"왜 알맞을까", content:"\"왜 이렇게 읽는 게 알맞을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_space7", type:"game", game_kind:"memory_match", icon:"🎮", title:"읽기 ↔ 판단 짝짓기", description:"읽기 방법과 판단을 짝지어 보세요.", hint:"뜻이 통하는지 생각해요.", pairs:[{a:{text:"☁️ 뜻으로 묶음"},b:{text:"알맞음"}},{a:{text:"🙅 몰아 읽음"},b:{text:"뜻 안 통함"}},{a:{text:"🙅 잘게 끊음"},b:{text:"어색함"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"함께 읽기", content:"교사가 먼저 읽어 주고 따라 읽으며 띄어 읽기를 익히게 하세요.", fit_slides:["question"]},
      {id:"e_read7", type:"extension", icon:"⬆", title:"역할 읽기", content:"\"짝과 번갈아 한 문장씩 읽어 볼까요?\" 읽기를 즐겨요.", fit_slides:["question"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"알맞게 띄어 읽으면 무엇이 좋죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_mood7", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시의 분위기를 살펴봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 시의 분위기 살펴보기 ① ---------------- */
  window.LESSONS["u4_l08"] = {
    meta: {grade:2, subject:"국어", unit:4, n:8, title:"시의 분위기를 살펴봐요 ①", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 자체 동시 「공놀이」 → 말·장면으로 분위기 → 분위기 고르기 → 분위기 느낌 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_poem8","t_mood8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시를 읽고 분위기를 느껴요","어떤 말·장면이 분위기를 만드는지 알아봐요","시의 분위기를 나눠요"]}, suggested_extras:["t_mood8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이 시는 어떤 느낌? 🏐", visual:"🏐", question:"\"통통 공이 / 콩콩 뛰어요 / 친구들과 / 깔깔 웃어요\"<br>이 시를 읽으면 어떤 느낌이 드나요?"}, suggested_extras:["q_feel8","r_poem8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"말과 장면이 만드는 분위기", content:"시의 분위기는 **말**과 **장면**에서 느껴져요. '통통·콩콩·깔깔' 같은 밝은 말과 친구들과 노는 장면은 **신나는 분위기**를 만들어요. 시에 어떤 말이 쓰였는지 살펴봐요!", symbol_meanings:[{symbol:"통통·콩콩", meaning:"밝고 경쾌한 말"},{symbol:"깔깔 웃어요", meaning:"즐거운 장면"},{symbol:"신나는 분위기", meaning:"밝고 활기차요"},{symbol:"말 살펴보기", meaning:"분위기의 실마리"}]}, suggested_extras:["t_mood8b","x_mood8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기? 🎭", sub:"시의 말과 장면을 보고 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 공이 콩콩, 깔깔 웃어요\"", emoji:"🏐", name:"신나는 분위기"},{clue:"\"달님이 살며시 창가에 앉아요\"", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"빗방울 똑똑 / 창문을 두드려요\"", emoji:"🌧️", name:"차분한 분위기"}], outro:"말과 장면이 분위기를 만들어요. 시의 분위기를 나눠 볼까요? 😊"}, suggested_extras:["q_why8","g_mood8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"시의 분위기를 나눠요", question:"시를 읽고 분위기를 느껴 볼까요?", items:["이 시는 어떤 분위기인가요?","어떤 말이 그런 느낌을 주나요?","어떤 장면이 떠오르나요?"]}, suggested_extras:["t_present8","e_mood8"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시를 읽고 분위기를 느꼈어요","말·장면이 분위기를 만듦을 알았어요","시의 분위기를 나눴어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 시의 분위기를 느껴요", body:"다음 시간에는 여러 시를 읽으며 다양한 분위기를 느껴 볼 거예요!"}, suggested_extras:["e_mood8b"]}
    ],
    extras: [
      {id:"q_poem8", type:"fun_question", icon:"💡", title:"좋아하는 시", content:"\"마음에 드는 시나 노래가 있나요?\" 시를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood8", type:"tip", icon:"🧩", title:"말·장면으로", content:"분위기는 시의 말과 장면에서 느껴짐을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_feel8", type:"fun_question", icon:"🏐", title:"어떤 느낌", content:"\"이 시를 읽으면 어떤 느낌이 드나요?\" 분위기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_poem8", type:"real_world", icon:"🌍", title:"노래의 느낌", content:"신나는 노래·잔잔한 노래의 느낌 차이와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mood8b", type:"tip", icon:"🧩", title:"밝은 말", content:"통통·깔깔 같은 밝은 말이 신나는 분위기를 만듦을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_mood8", type:"misconception", icon:"❓", title:"느낌은 다양해요", content:"분위기 느낌은 사람마다 조금씩 다를 수 있음을 인정하세요.", fit_slides:["concept"]},
      {id:"q_why8", type:"fun_question", icon:"💡", title:"왜 그 느낌?", content:"\"왜 그런 분위기로 느껴질까요?\" 까닭을 묻어요.", fit_slides:["card_quiz"]},
      {id:"g_mood8", type:"game", game_kind:"memory_match", icon:"🎮", title:"시 ↔ 분위기 짝짓기", description:"시와 분위기를 짝지어 보세요.", hint:"말·장면을 떠올려요.", pairs:[{a:{text:"🏐 통통 콩콩"},b:{text:"신나는"}},{a:{text:"🌙 달님이 살며시"},b:{text:"포근한"}},{a:{text:"🌧️ 빗방울 똑똑"},b:{text:"차분한"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"느낌과 까닭", content:"분위기를 말할 때 어떤 말 때문에 그렇게 느꼈는지 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood8", type:"extension", icon:"⬆", title:"장면 그리기", content:"\"시를 읽고 떠오른 장면을 그려 볼까요?\" 감상을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기는 무엇에서 느껴지죠?\" 말·장면을 짚어요.", fit_slides:["summary"]},
      {id:"e_mood8b", type:"extension", icon:"⬆", title:"여러 시 예고", content:"\"다음엔 여러 시의 분위기를 느껴요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 시의 분위기 살펴보기 ② ---------------- */
  window.LESSONS["u4_l09"] = {
    meta: {grade:2, subject:"국어", unit:4, n:9, title:"시의 분위기를 살펴봐요 ②", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 여러 분위기 → 분위기 만드는 말 → 밝은·차분한 말 모으기 → 분위기 비교 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_recall9","t_var9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 분위기의 시를 느껴요","분위기를 만드는 말을 찾아요","시의 분위기를 비교해요"]}, suggested_extras:["t_var9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기를 만드는 말 🔤", visual:"🎨", question:"\"깔깔·신나게\"와 \"살며시·고요히\"<br>이 말들은 각각 어떤 분위기를 만들까요?"}, suggested_extras:["q_word9","r_var9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 만드는 말", content:"밝은 말(깔깔·신나게·통통)은 **신나는 분위기**를, 부드러운 말(살며시·고요히·살랑)은 **조용하고 포근한 분위기**를 만들어요. 시에 쓰인 말을 살피면 분위기를 알 수 있어요!", symbol_meanings:[{symbol:"깔깔·신나게", meaning:"신나는 분위기"},{symbol:"살며시·고요히", meaning:"조용한 분위기"},{symbol:"포근·살랑", meaning:"포근한 분위기"},{symbol:"말 살피기", meaning:"분위기의 실마리"}]}, suggested_extras:["t_var9b","x_var9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어떤 분위기의 말일까? 🔤", sub:"말이 만드는 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"깔깔·폴짝·신나게\"는?", emoji:"😄", name:"신나는 분위기"},{clue:"\"살며시·고요히·가만히\"는?", emoji:"🌙", name:"조용한 분위기"},{clue:"\"포근·따뜻·살랑\"은?", emoji:"🤗", name:"포근한 분위기"}], outro:"말마다 만드는 분위기가 달라요. 시의 분위기를 비교해 볼까요? 😊"}, suggested_extras:["q_pick9","g_var9"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"시의 분위기를 비교해요", question:"두 시의 분위기를 비교해 볼까요?", items:["두 시는 어떤 분위기인가요?","어떤 말이 분위기를 다르게 만드나요?","어느 분위기가 더 마음에 드나요?"]}, suggested_extras:["t_present9","e_var9"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["여러 분위기의 시를 느꼈어요","분위기를 만드는 말을 찾았어요","시의 분위기를 비교했어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽어요", body:"다음 시간에는 시의 분위기에 맞게 목소리와 빠르기를 조절해 읽어 볼 거예요!"}, suggested_extras:["e_read9"]}
    ],
    extras: [
      {id:"q_recall9", type:"fun_question", icon:"💡", title:"지난 시", content:"\"지난 시간 시는 어떤 분위기였나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_var9", type:"tip", icon:"🧩", title:"말과 분위기", content:"어떤 말이 어떤 분위기를 만드는지 짝지어 살피게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_word9", type:"fun_question", icon:"🎨", title:"말의 느낌", content:"\"이 말들은 어떤 느낌을 주나요?\" 말의 느낌을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_var9", type:"real_world", icon:"🌍", title:"느낌의 말", content:"기분을 나타내는 말(신난다·차분하다)과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_var9b", type:"tip", icon:"🧩", title:"말 모으기", content:"밝은 말·부드러운 말을 모아 분위기와 연결하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_var9", type:"misconception", icon:"❓", title:"정답은 아니에요", content:"분위기 느낌에 하나의 정답을 강요하지 말고 까닭을 존중하세요.", fit_slides:["concept"]},
      {id:"q_pick9", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"신나는 분위기를 만드는 말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_var9", type:"game", game_kind:"memory_match", icon:"🎮", title:"말 ↔ 분위기 짝짓기", description:"말과 분위기를 짝지어 보세요.", hint:"말의 느낌을 떠올려요.", pairs:[{a:{text:"😄 깔깔·신나게"},b:{text:"신나는"}},{a:{text:"🌙 살며시"},b:{text:"조용한"}},{a:{text:"🤗 포근·살랑"},b:{text:"포근한"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"비교해 말하기", content:"두 시의 분위기를 비교하며 까닭을 말하게 하세요.", fit_slides:["question"]},
      {id:"e_var9", type:"extension", icon:"⬆", title:"분위기 바꾸기", content:"\"밝은 말을 부드러운 말로 바꾸면 분위기가 어떻게 될까요?\" 표현을 비교해요.", fit_slides:["question"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 만드는 건 무엇이죠?\" 말을 짚어요.", fit_slides:["summary"]},
      {id:"e_read9", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 분위기를 살려 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 분위기 생각하며 소리 내어 읽기 ① ---------------- */
  window.LESSONS["u4_l10"] = {
    meta: {grade:2, subject:"국어", unit:4, n:10, title:"분위기를 생각하며 소리 내어 읽어요 ①", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기에 맞는 목소리 → 빠르기 조절 → 어울리는 읽기 고르기 → 분위기 살려 낭송"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_read10","t_voice10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기에 맞는 목소리를 알아봐요","빠르기를 조절해 읽어요","분위기를 살려 시를 낭송해요"]}, suggested_extras:["t_voice10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기에 맞게 읽어요 🎵", visual:"🎵", question:"신나는 시는 밝고 빠르게, 조용한 시는 차분하고 천천히.<br>분위기에 맞게 읽으면 어떨까요?"}, suggested_extras:["q_how10","r_read10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기에 맞는 목소리·빠르기", content:"분위기에 맞게 **목소리**와 **빠르기**를 조절해요. 신나는 시는 **밝고 빠르게**, 조용한 시는 **차분하고 천천히**, 포근한 시는 **부드럽게** 읽으면 분위기가 살아나요!", symbol_meanings:[{symbol:"신나는 시", meaning:"밝고 빠르게"},{symbol:"조용한 시", meaning:"차분하고 천천히"},{symbol:"포근한 시", meaning:"부드럽고 따뜻하게"},{symbol:"알맞게 띄어", meaning:"뜻이 드러나게"}]}, suggested_extras:["t_voice10b","x_voice10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어울리는 읽기는? 🎵", sub:"시 분위기에 어울리는 읽기 방법을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 시는 어떻게 읽을까요?", emoji:"😄", name:"밝고 빠르게"},{clue:"조용한 시는 어떻게 읽을까요?", emoji:"🌙", name:"차분하고 천천히"},{clue:"포근한 시는 어떻게 읽을까요?", emoji:"🤗", name:"부드럽고 따뜻하게"}], outro:"분위기에 맞게 읽으니 시가 살아나요. 직접 낭송해 볼까요? 😊"}, suggested_extras:["q_pick10","g_voice10"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"분위기를 살려 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 시의 분위기에 맞게 목소리와 빠르기를 조절해 읽어 봐요!", count:24, hint:"신나는 시는 밝고 빠르게, 조용한 시는 차분하고 천천히 읽어 봐요", end_msg:"모두 분위기를 살려 멋지게 낭송했어요! 👏"}, suggested_extras:["t_present10","e_read10"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기에 맞는 목소리를 알았어요","빠르기를 조절해 읽었어요","분위기를 살려 낭송했어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 더 읽어요", body:"다음 시간에는 여러 시를 분위기에 맞게 낭송하며 연습해 볼 거예요!"}, suggested_extras:["e_read10b"]}
    ],
    extras: [
      {id:"q_read10", type:"fun_question", icon:"💡", title:"낭송 경험", content:"\"시를 소리 내어 읽어 본 적 있나요?\" 낭송을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_voice10", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 맞게 목소리와 빠르기를 조절하는 것이 핵심임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_how10", type:"fun_question", icon:"🎵", title:"어떻게 읽을까", content:"\"신나는 시는 어떻게 읽으면 좋을까요?\" 읽기 방법을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read10", type:"real_world", icon:"🌍", title:"이야기 들려주기", content:"동화를 실감 나게 읽어 주는 목소리와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_voice10b", type:"tip", icon:"🧩", title:"분위기별 읽기", content:"신나는·조용한·포근한 분위기별 읽기를 함께 연습하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_voice10", type:"misconception", icon:"❓", title:"한 가지로 읽지 않기", content:"모든 시를 같은 목소리로 읽지 말고 분위기에 맞게 바꾸게 하세요.", fit_slides:["concept"]},
      {id:"q_pick10", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"왜 그렇게 읽으면 좋을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_voice10", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽는 방법 짝짓기", description:"분위기와 읽는 방법을 짝지어 보세요.", hint:"어울리는 목소리를 떠올려요.", pairs:[{a:{text:"😄 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 조용한"},b:{text:"차분하고 천천히"}},{a:{text:"🤗 포근한"},b:{text:"부드럽게"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 분위기가 느껴지는지 살피게 하세요.", fit_slides:["present"]},
      {id:"e_read10", type:"extension", icon:"⬆", title:"몸짓 더하기", content:"\"분위기에 맞게 표정이나 몸짓을 더해 볼까요?\" 낭송을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살리려면 무엇을 조절하죠?\" 목소리·빠르기를 짚어요.", fit_slides:["summary"]},
      {id:"e_read10b", type:"extension", icon:"⬆", title:"이어 낭송 예고", content:"\"다음엔 여러 시를 낭송해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 분위기 생각하며 소리 내어 읽기 ② ---------------- */
  window.LESSONS["u4_l11"] = {
    meta: {grade:2, subject:"국어", unit:4, n:11, title:"분위기를 생각하며 소리 내어 읽어요 ②", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 띄어 읽기와 분위기 → 좋은 낭송 → 알맞은 읽기 모으기 → 짝과 낭송 연습"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_recall11","t_read11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["알맞게 띄어 읽으며 분위기를 살려요","좋은 낭송이 무엇인지 알아봐요","짝과 낭송을 연습해요"]}, suggested_extras:["t_read11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"띄어 읽기로 분위기를! ✂️", visual:"🎶", question:"같은 시도 어디서 쉬어 읽느냐에 따라 느낌이 달라져요.<br>분위기를 살리려면 어떻게 띄어 읽을까요?"}, suggested_extras:["q_space11","r_read11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"좋은 낭송", content:"좋은 낭송은 **분위기에 맞는 목소리·빠르기**에 **알맞은 띄어 읽기**를 더해요. 조용한 시는 천천히 쉬어 가며, 신나는 시는 경쾌하게 읽어요. **뜻과 분위기**가 함께 살아나게 읽어요!", symbol_meanings:[{symbol:"목소리·빠르기", meaning:"분위기에 맞게"},{symbol:"알맞게 띄어", meaning:"뜻이 드러나게"},{symbol:"쉬어 가기", meaning:"조용한 시는 천천히"},{symbol:"경쾌하게", meaning:"신나는 시는 밝게"}]}, suggested_extras:["t_read11b","x_read11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 낭송은? ✅", sub:"분위기를 잘 살린 낭송을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"조용한 시를 낭송할 때는?", emoji:"🌙", name:"천천히 차분하게 쉬어 가며"},{clue:"신나는 시를 낭송할 때는?", emoji:"😄", name:"밝고 경쾌하게"},{clue:"이렇게 읽으면 아쉬워요!", emoji:"🙅", name:"분위기와 상관없이 빠르게만"}], outro:"분위기에 맞게 읽으니 시가 살아나요. 짝과 연습해 볼까요? 😊"}, suggested_extras:["q_pick11","g_read11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"짝과 낭송을 연습해요 🎤", sub:"버튼을 눌러 발표할 친구를 뽑아요. 좋아하는 시를 분위기에 맞게 낭송해 봐요!", count:24, hint:"분위기에 맞는 목소리·빠르기로, 알맞게 띄어 읽어 봐요", end_msg:"모두 분위기를 살려 멋지게 낭송했어요! 👏"}, suggested_extras:["t_present11","e_read11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["알맞게 띄어 읽으며 분위기를 살렸어요","좋은 낭송이 무엇인지 알았어요","짝과 낭송을 연습했어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시로 여는 우리 반을 만들어요", body:"다음 시간에는 좋아하는 시를 골라 낭송하며 시로 여는 우리 반을 만들어 볼 거예요!"}, suggested_extras:["e_class11"]}
    ],
    extras: [
      {id:"q_recall11", type:"fun_question", icon:"💡", title:"지난 낭송", content:"\"지난 시간 낭송, 어땠나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_read11", type:"tip", icon:"🧩", title:"띄어 읽기 더하기", content:"분위기에 맞는 목소리에 알맞은 띄어 읽기를 더하게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_space11", type:"fun_question", icon:"🎶", title:"어디서 쉴까", content:"\"분위기를 살리려면 어디서 쉬어 읽을까요?\" 띄어 읽기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read11", type:"real_world", icon:"🌍", title:"낭송 듣기", content:"시 낭송을 들어 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read11b", type:"tip", icon:"🧩", title:"뜻과 분위기", content:"뜻과 분위기가 함께 살아나게 읽게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read11", type:"misconception", icon:"❓", title:"빠르게만 주의", content:"분위기와 상관없이 빠르게만 읽지 않게 안내하세요.", fit_slides:["concept"]},
      {id:"q_pick11", type:"fun_question", icon:"💡", title:"왜 좋을까", content:"\"이 낭송이 왜 좋을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read11", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 낭송 짝짓기", description:"분위기와 낭송 방법을 짝지어 보세요.", hint:"어울리는 읽기를 떠올려요.", pairs:[{a:{text:"🌙 조용한"},b:{text:"천천히 쉬어"}},{a:{text:"😄 신나는"},b:{text:"밝고 경쾌하게"}},{a:{text:"🤗 포근한"},b:{text:"부드럽게"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"짝과 연습", content:"짝과 번갈아 낭송하고 분위기가 느껴지는지 말해 주게 하세요.", fit_slides:["present"]},
      {id:"e_read11", type:"extension", icon:"⬆", title:"함께 낭송", content:"\"여럿이 함께 낭송하면 어떨까요?\" 낭송을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"좋은 낭송은 무엇을 더하죠?\" 띄어 읽기를 짚어요.", fit_slides:["summary"]},
      {id:"e_class11", type:"extension", icon:"⬆", title:"우리 반 예고", content:"\"다음엔 시로 여는 우리 반을 만들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 시로 여는 우리 반 ① (실천) ---------------- */
  window.LESSONS["u4_l12"] = {
    meta: {grade:2, subject:"국어", unit:4, n:12, title:"시로 여는 우리 반을 만들어요 ① (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 좋아하는 시 고르기 → 낭송 준비 → 좋은 낭송 태도 모으기 → 낭송 연습"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 12/15차시 · 실천"}, suggested_extras:["q_class12","t_class12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["좋아하는 시를 골라요","분위기를 살려 낭송을 준비해요","낭송 태도를 알아봐요"]}, suggested_extras:["t_class12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 반을 시로 채워요 📜", visual:"📜", question:"아침마다 좋아하는 시를 한 편씩 낭송한다면<br>우리 반은 어떤 분위기가 될까요?"}, suggested_extras:["q_pick12","r_class12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송 준비하기", content:"낭송할 시를 고르면 **분위기**를 먼저 느껴 봐요. 그 분위기에 맞게 **목소리·빠르기**를 정하고, **알맞게 띄어 읽기**를 연습해요. 좋아하는 까닭도 함께 떠올리면 더 좋아요!", symbol_meanings:[{symbol:"시 고르기", meaning:"좋아하는 시로"},{symbol:"분위기 느끼기", meaning:"어떤 느낌인가"},{symbol:"목소리 정하기", meaning:"분위기에 맞게"},{symbol:"연습하기", meaning:"띄어 읽기까지"}]}, suggested_extras:["t_class12b","x_class12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 낭송 태도는? ✅", sub:"낭송할 때 바른 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"낭송할 때 자세는?", emoji:"🧍", name:"바르게 서서 또박또박"},{clue:"목소리는?", emoji:"🔊", name:"분위기에 맞는 목소리로"},{clue:"빠르기는?", emoji:"🐢", name:"분위기에 맞게 천천히 또는 경쾌하게"}], outro:"바른 태도로 분위기를 살려 낭송해요. 연습해 볼까요? 😊"}, suggested_extras:["q_good12","g_class12"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"낭송을 연습해요", question:"고른 시를 낭송 연습해 볼까요?", items:["어떤 시를 골랐나요?","그 시는 어떤 분위기인가요?","분위기에 맞게 어떻게 읽을까요?"]}, suggested_extras:["t_present12","e_class12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["좋아하는 시를 골랐어요","분위기를 살려 낭송을 준비했어요","낭송 태도를 알았어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낭송을 발표하고 들어요", body:"다음 시간에는 준비한 시를 친구들 앞에서 낭송하고 함께 들어 볼 거예요!"}, suggested_extras:["e_share12"]}
    ],
    extras: [
      {id:"q_class12", type:"fun_question", icon:"💡", title:"좋아하는 시", content:"\"낭송하고 싶은 시나 노래가 있나요?\" 실천을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_class12", type:"tip", icon:"🧩", title:"분위기 먼저", content:"낭송 전 시의 분위기를 먼저 느끼게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_pick12", type:"fun_question", icon:"📜", title:"어떤 시?", content:"\"어떤 시로 아침을 열고 싶나요?\" 시를 골라요.", fit_slides:["motivate"]},
      {id:"r_class12", type:"real_world", icon:"🌍", title:"아침 시 읽기", content:"아침 독서·시 읽기 시간과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_class12b", type:"tip", icon:"🧩", title:"순서대로 준비", content:"시 고르기→분위기 느끼기→목소리 정하기→연습 순서로 준비하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_class12", type:"misconception", icon:"❓", title:"외우기보다 느끼기", content:"무조건 외우기보다 분위기를 느끼며 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_good12", type:"fun_question", icon:"💡", title:"바른 태도는?", content:"\"좋은 낭송 태도에는 무엇이 있죠?\" 자세·목소리를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_class12", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 낭송 태도 짝짓기", description:"낭송 항목과 바른 태도를 짝지어 보세요.", hint:"분위기를 살리는 낭송을 생각해요.", pairs:[{a:{text:"🧍 자세"},b:{text:"바르게 서서"}},{a:{text:"🔊 목소리"},b:{text:"분위기에 맞게"}},{a:{text:"🐢 빠르기"},b:{text:"분위기에 맞게"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"까닭과 함께", content:"고른 시와 분위기, 좋아하는 까닭을 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_class12", type:"extension", icon:"⬆", title:"시화 만들기", content:"\"시에 어울리는 그림을 더해 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송을 어떻게 준비했죠?\" 분위기·목소리를 짚어요.", fit_slides:["summary"]},
      {id:"e_share12", type:"extension", icon:"⬆", title:"발표 예고", content:"\"다음엔 낭송을 발표하고 들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 시로 여는 우리 반 ② (낭송 발표) ---------------- */
  window.LESSONS["u4_l13"] = {
    meta: {grade:2, subject:"국어", unit:4, n:13, title:"시로 여는 우리 반을 만들어요 ② (실천)", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 발표·듣기 약속 → 낭송하고 듣기 → 좋은 듣기 태도 모으기 → 낭송 발표·나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 13/15차시 · 실천"}, suggested_extras:["q_ready13","t_share13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기를 살려 시를 낭송해요","친구 낭송을 잘 들어요","낭송을 듣고 느낌을 나눠요"]}, suggested_extras:["t_share13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구의 낭송을 들어요 👂", visual:"🎤", question:"친구가 고른 시는 어떤 분위기일까요?<br>낭송을 들을 때 어떻게 들으면 좋을까요?"}, suggested_extras:["q_listen13","r_share13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송하고 듣기", content:"낭송할 땐 **분위기를 살려** 또박또박 읽고, 들을 땐 **바른 자세로** 들으며 어떤 **분위기**인지 느껴요. 낭송이 끝나면 \"분위기가 잘 느껴졌어\" 하고 **좋은 점**을 말해 줘요!", symbol_meanings:[{symbol:"분위기 살려", meaning:"목소리·빠르기 조절"},{symbol:"바른 듣기", meaning:"집중해 들어요"},{symbol:"분위기 느끼기", meaning:"어떤 느낌인가"},{symbol:"좋은 점 말하기", meaning:"느낌을 칭찬해요"}]}, suggested_extras:["t_share13b","x_share13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 듣기 태도는? ✅", sub:"낭송을 들을 때 바른 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"친구가 낭송할 때는?", emoji:"👂", name:"바른 자세로 집중해 들어요"},{clue:"낭송을 들으며?", emoji:"🎭", name:"어떤 분위기인지 느껴요"},{clue:"낭송이 끝나면?", emoji:"👏", name:"좋았던 점을 말해 줘요"}], outro:"잘 듣고 좋은 점을 나누면 낭송이 더 즐거워요. 발표해 볼까요? 😊"}, suggested_extras:["q_good13","g_share13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"시를 낭송하고 나눠요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 준비한 시를 분위기에 맞게 낭송하고, 들은 친구는 좋은 점을 말해 줘요!", count:24, hint:"분위기에 맞는 목소리·빠르기로 낭송하고, 들은 친구는 분위기를 칭찬해 줘요", end_msg:"모두 분위기를 살려 멋지게 낭송했어요. 우리 반이 시로 가득해졌어요! 👏"}, suggested_extras:["t_present13","e_share13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["분위기를 살려 시를 낭송했어요","친구 낭송을 잘 들었어요","낭송을 듣고 느낌을 나눴어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 겹받침과 분위기를 종합해 단원을 마무리할 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_ready13", type:"fun_question", icon:"💡", title:"낭송 마음", content:"\"낭송을 앞두고 마음이 어떤가요?\" 발표를 편하게 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_share13", type:"tip", icon:"🧩", title:"낭송과 듣기", content:"낭송만큼 듣기도 중요한 활동임을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_listen13", type:"fun_question", icon:"👂", title:"어떻게 들을까", content:"\"낭송을 들을 때 무엇을 느끼면 좋을까요?\" 듣기 태도를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_share13", type:"real_world", icon:"🌍", title:"공연 듣기", content:"노래·낭송 공연을 들었던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_share13b", type:"tip", icon:"🧩", title:"분위기 느끼며 듣기", content:"낭송을 들으며 분위기를 느끼게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_share13", type:"misconception", icon:"❓", title:"끼어들기 주의", content:"낭송 중 끼어들지 말고 끝까지 듣게 하세요.", fit_slides:["concept"]},
      {id:"q_good13", type:"fun_question", icon:"💡", title:"바른 태도는?", content:"\"좋은 듣기 태도는 무엇이죠?\" 집중·느끼기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_share13", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 태도 짝짓기", description:"낭송 상황과 바른 태도를 짝지어 보세요.", hint:"잘 듣는 모습을 생각해요.", pairs:[{a:{text:"👂 들을 때"},b:{text:"집중해 듣기"}},{a:{text:"🎭 들으며"},b:{text:"분위기 느끼기"}},{a:{text:"👏 끝난 뒤"},b:{text:"좋은 점 말하기"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 분위기를 칭찬하게 하세요.", fit_slides:["present"]},
      {id:"e_share13", type:"extension", icon:"⬆", title:"시 모으기", content:"\"우리 반 시 모음을 만들어 볼까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송하고 무엇을 했죠?\" 듣기·나누기를 짚어요.", fit_slides:["summary"]},
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
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"4단원에서 무엇을 배웠나요? 🎀", visual:"📖", question:"겹받침도 바르게 읽고 쓰고, 시를 분위기에 맞게 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침·분위기 정리", content:"이 단원에서 **겹받침을 바르게 읽고 쓰는 법**과 **시를 분위기에 맞게 읽는 법**을 배웠어요. 겹받침은 소리는 하나·쓸 땐 두 글자, 시는 분위기에 맞게 목소리·빠르기를 조절해 읽어요!", symbol_meanings:[{symbol:"겹받침 소리", meaning:"ㄺ[ㄱ]·ㄵ[ㄴ]·ㄼ[ㄹ]"},{symbol:"쓸 땐 두 글자", meaning:"받침 모두"},{symbol:"분위기 느끼기", meaning:"말·장면으로"},{symbol:"분위기 살려 읽기", meaning:"목소리·빠르기 조절"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"'값'은 어떻게 읽고 쓸까요?", emoji:"💰", name:"[갑]으로 읽고 받침 ㅄ을 모두 써요"},{clue:"신나는 시는 어떻게 읽을까요?", emoji:"😄", name:"밝고 빠르게"},{clue:"분위기는 무엇에서 느낄까요?", emoji:"🎭", name:"시의 말과 장면"}], outro:"배운 것을 잘 기억하고 있어요. 바르게·재미있게 읽어 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["겹받침 낱말을 바르게 읽고 쓸 수 있나요?","시의 분위기를 느낄 수 있나요?","분위기를 살려 읽을 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","겹받침·분위기를 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 겹받침 낱말을 다지고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"두 결 정리", content:"겹받침(지식)과 분위기(감상) 두 결을 함께 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"📖", title:"기억에 남는 활동", content:"\"겹받침·시 낭송 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"바르게·재미있게", content:"생활 속에서 바르게 읽고 쓴 경험을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"겹받침·분위기", content:"겹받침 원리와 분위기 살려 읽기를 함께 정리하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"쓸 땐 두 글자", content:"겹받침은 소리가 하나여도 쓸 땐 두 글자임을 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"💰 겹받침"},b:{text:"소리 하나·쓸 땐 둘"}},{a:{text:"😄 신나는 시"},b:{text:"밝고 빠르게"}},{a:{text:"🎭 분위기"},b:{text:"말·장면"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"더 연습하고 싶은 것을 정해 볼까요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 겹받침·분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 겹받침 다지기와 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·글씨) ---------------- */
  window.LESSONS["u4_l15"] = {
    meta: {grade:2, subject:"국어", unit:4, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 다지기 → 바른 소리·표기 → 바른 낱말 고르기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"4단원 · 15/15차시 · 마무리"}, suggested_extras:["q_last","t_last"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["겹받침 낱말을 다시 다져요","바르게 읽고 쓰는 법을 확인해요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_last"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침 낱말 도전! 💪", visual:"🔤", question:"닭·값·앉다·넓다·맑다·여덟…<br>이 낱말들을 모두 바르게 읽고 쓸 수 있나요?"}, suggested_extras:["q_try","r_last"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 다지기", content:"겹받침 낱말은 **읽을 땐 한 소리, 쓸 땐 두 글자**예요. 헷갈리면 **천천히 소리 내어** 읽고, 쓸 땐 **받침을 모두** 또박또박 써요. 자주 쓰는 낱말은 익혀 두면 좋아요!", symbol_meanings:[{symbol:"닭·값·흙", meaning:"[닥]·[갑]·[흑]"},{symbol:"앉다·많다", meaning:"[안따]·[만타]"},{symbol:"넓다·여덟", meaning:"[널따]·[여덜]"},{symbol:"쓸 땐 모두", meaning:"받침 두 글자 다"}]}, suggested_extras:["t_last2","x_last"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 쓴 낱말은? ✅", sub:"겹받침을 바르게 쓴 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"[갑]으로 읽는 낱말은?", emoji:"💰", name:"\"값\" (받침 ㅄ)"},{clue:"[여덜]로 읽는 낱말은?", emoji:"8️⃣", name:"\"여덟\" (받침 ㄼ)"},{clue:"[만타]로 읽는 낱말은?", emoji:"➕", name:"\"많다\" (받침 ㄶ)"}], outro:"소리는 하나여도 쓸 땐 받침을 모두 써요. 잘 다졌어요! 😊"}, suggested_extras:["q_pick15","g_last"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **겹받침 · 분위기 · 여덟**을 받침까지 모두 살려 바르게 써 보세요!", symbol_meanings:[{symbol:"겹받침", meaning:"또박또박 칸에 맞춰"},{symbol:"분위기", meaning:"바른 자세로"},{symbol:"여덟", meaning:"받침 ㄼ까지 모두"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"4단원에서 배운 것", points:["겹받침을 바르게 읽고 썼어요","시를 분위기에 맞게 읽었어요","겹받침 낱말을 다지고 글씨를 썼어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"바르고 재미있게!", body:"4단원을 모두 마쳤어요. 앞으로도 겹받침을 바르게 쓰고 시를 분위기에 맞게 읽어 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_last", type:"fun_question", icon:"💡", title:"도전해 보기", content:"\"겹받침 낱말을 모두 바르게 쓸 수 있을까요?\" 다지기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_last", type:"tip", icon:"🧩", title:"다지기", content:"자주 쓰는 겹받침 낱말을 다시 익히게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_try", type:"fun_question", icon:"🔤", title:"읽어 보기", content:"\"이 낱말들을 소리 내어 읽어 볼까요?\" 함께 읽어요.", fit_slides:["motivate"]},
      {id:"r_last", type:"real_world", icon:"🌍", title:"받아쓰기", content:"받아쓰기에서 자주 나오는 겹받침 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_last2", type:"tip", icon:"🧩", title:"천천히 소리 내어", content:"헷갈리면 천천히 소리 내어 읽어 보게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_last", type:"misconception", icon:"❓", title:"받침 모두", content:"소리만 따라 받침을 하나만 쓰지 않게 거듭 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_pick15", type:"fun_question", icon:"💡", title:"왜 바를까", content:"\"왜 이렇게 써야 바를까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_last", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침 소리를 떠올려요.", pairs:[{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}},{a:{text:"➕ 많다"},b:{text:"[만타]"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"받침까지 바르게", content:"네모 칸에 받침 두 글자까지 또박또박 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"겹받침 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"4단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"바르게·재미있게", content:"\"오늘 읽은 시 한 편을 집에서도 낭송해 볼까요?\" 낭송을 이어 가요.", fit_slides:["next_lesson"]}
    ]
  };


})();
