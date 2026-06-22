/* ============================================================================
   2학년 1학기 국어 4단원 「분위기를 살려 읽어요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 112~143 / 15차시.
   - 단원 목표: 말과 글을 바르고 재미있게 사용하기. 역량 비판적·창의적 사고.
   - 성취기준 [2국04-02](소리≠표기·겹받침)·[2국05-01](낭송·말의 재미)·[2국02-02](알맞게 띄어 읽기).
   ★ 저작권: 지도서 제재(「설문대 할망」·「쓰레기가 모여 있다고?」·수록 시·노래) 전부 미게재.
      겹받침 낱말은 표준 발음 자체 구성. 짧은 시는 보편 소재(공놀이·달밤·빗방울) 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 바르게·재미있게 ---------------- */
  window.LESSONS["u4_l01"] = {
    meta: {grade:2, subject:"국어", unit:4, n:1, title:"단원 도입 — 분위기를 살려 읽어요", std:"[2국04-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 소리와 표기가 다른 낱말 → 겹받침이란 → 바른 소리 고르기 → 겹받침 낱말 찾기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽어요", subtitle:"4단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["소리와 표기가 다른 낱말을 알아봐요","겹받침이 무엇인지 알아봐요","겹받침 낱말을 찾아봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"쓴 대로 안 읽혀요? 🤔", visual:"🐔", question:"\"닭\"을 소리 내어 읽으면 [닥]으로 들려요.<br>왜 쓴 글자와 다르게 읽힐까요?"}, suggested_extras:["q_sound","r_life"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침이 있어요", content:"받침에 글자가 **두 개** 있는 것을 **겹받침**이라고 해요. \"닭\"의 받침은 'ㄺ'이에요. 읽을 땐 **한 소리**만 나서 [닥]이 되지만, 쓸 땐 **두 글자를 모두** 살려요!", symbol_meanings:[{symbol:"닭", meaning:"받침 'ㄺ' → [닥]"},{symbol:"값", meaning:"받침 'ㅄ' → [갑]"},{symbol:"앉다", meaning:"받침 'ㄵ' → [안따]"},{symbol:"소리≠표기", meaning:"읽기는 하나, 쓰기는 둘"}]}, suggested_extras:["t_concept","x_write"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽으면? 🔊", sub:"겹받침 낱말을 바르게 읽어 봐요. 카드를 누르면 소리가 나와요!", cards:[{clue:"\"닭\"은 어떻게 읽을까요?", emoji:"🐔", name:"[닥]"},{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"},{clue:"\"흙\"은 어떻게 읽을까요?", emoji:"🟤", name:"[흑]"}], outro:"겹받침은 한 소리로 읽혀요. 그래도 쓸 때는 두 글자를 모두 써야 해요! 😊"}, suggested_extras:["q_more","g_sound"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 찾아요", question:"겹받침이 있는 낱말을 떠올려 볼까요?", items:["받침에 글자가 두 개 있는 낱말이 있나요?","그 낱말은 어떻게 읽히나요?","쓸 때와 읽을 때가 어떻게 다른가요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["소리와 표기가 다를 수 있음을 알았어요","겹받침이 무엇인지 알았어요","겹받침 낱말을 찾아봤어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽으면 좋은 점", body:"다음 시간에는 시를 분위기에 맞게 읽으면 무엇이 좋은지 알아볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"신기한 낱말", content:"\"쓴 글자와 다르게 읽히는 낱말을 본 적 있나요?\" 호기심을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '겹받침 바르게 읽고 쓰기 + 분위기 살려 읽기'예요. 도입에선 소리≠표기의 신기함을 느끼게 하세요.", fit_slides:["objective","cover"]},
      {id:"q_sound", type:"fun_question", icon:"🐔", title:"왜 다를까", content:"\"왜 '닭'이 [닥]으로 들릴까요?\" 까닭을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_life", type:"real_world", icon:"🌍", title:"내 둘레 낱말", content:"닭·값·흙처럼 생활에서 쓰는 겹받침 낱말과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"소리는 하나", content:"겹받침은 읽을 때 한 소리만 남을 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_write", type:"misconception", icon:"❓", title:"쓸 땐 두 글자", content:"[닥]으로 들린다고 '닥'으로 쓰면 안 돼요. 쓸 땐 'ㄺ'을 모두 쓰게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"q_more", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"겹받침이 있는 낱말이 또 있을까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sound", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"한 소리로 읽혀요.", pairs:[{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"소리 내어", content:"겹받침 낱말을 소리 내어 읽으며 차이를 느끼게 하세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"받침 찾기", content:"\"교실에서 겹받침 낱말을 찾아볼까요?\" 어휘를 넓혀요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 읽을 때와 쓸 때가 어떻게 다르죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 분위기를 살려 읽으면 좋은 점을 알아봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 분위기를 살려 읽으면 좋은 점 (준비) ---------------- */
  window.LESSONS["u4_l02"] = {
    meta: {grade:2, subject:"국어", unit:4, n:2, title:"분위기를 살려 읽으면 좋아요", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 같은 시 다른 분위기 → 분위기란 → 분위기 느끼기 → 분위기 떠올려 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽으면 좋아요", subtitle:"4단원 · 2/15차시 · 준비"}, suggested_extras:["q_mood","t_mood"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기가 무엇인지 알아봐요","분위기를 살려 읽으면 좋은 점을 알아봐요","시의 분위기를 느껴 봐요"]}, suggested_extras:["t_mood"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"같은 글, 다른 목소리 🎵", visual:"🎵", question:"신나는 시를 조용조용 읽으면 어떨까요?<br>분위기에 맞게 읽으면 무엇이 좋을까요?"}, suggested_extras:["q_feel2","r_mood2"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 살려 읽기", content:"**분위기**는 시에서 느껴지는 **느낌**이에요. 신나는·조용한·포근한 분위기가 있어요. 분위기에 맞게 **목소리와 빠르기**를 조절해 읽으면 시의 느낌이 더 잘 **전해져요**!", symbol_meanings:[{symbol:"신나는 분위기", meaning:"밝고 빠르게"},{symbol:"조용한 분위기", meaning:"낮고 천천히"},{symbol:"포근한 분위기", meaning:"부드럽고 따뜻하게"},{symbol:"분위기 살리기", meaning:"느낌이 잘 전해져요"}]}, suggested_extras:["t_mood2","x_same"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기? 🎵", sub:"시의 분위기를 함께 느껴 봐요. 카드를 누르면 분위기가 나와요!", cards:[{clue:"\"통통 공이 콩콩 뛰어요\"", emoji:"⚽", name:"신나는 분위기"},{clue:"\"달님이 살며시 창가에 앉아요\"", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"빗방울이 또르르 구슬처럼 굴러요\"", emoji:"💧", name:"맑고 경쾌한 분위기"}], outro:"시마다 분위기가 달라요. 분위기를 느끼면 더 재미있게 읽을 수 있어요! 😊"}, suggested_extras:["q_mood3","g_mood2"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 떠올려 말해요", question:"좋아하는 시나 노래의 분위기는 어떤가요?", items:["좋아하는 시·노래가 있나요?","그것은 어떤 분위기인가요?","왜 그렇게 느껴지나요?"]}, suggested_extras:["t_present2","e_mood2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기가 무엇인지 알았어요","분위기를 살려 읽으면 좋은 점을 알았어요","시의 분위기를 느껴 봤어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 읽고 써요", body:"다음 시간에는 겹받침이 있는 낱말을 바르게 읽고 쓰는 법을 배워 볼 거예요!"}, suggested_extras:["e_write2"]}
    ],
    extras: [
      {id:"q_mood", type:"fun_question", icon:"💡", title:"느낌의 차이", content:"\"같은 노래도 빠르게·느리게 부르면 느낌이 어떻게 다를까요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood", type:"tip", icon:"🧩", title:"분위기 느끼기", content:"분위기는 말·장면에서 느껴지는 느낌임을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_feel2", type:"fun_question", icon:"🎵", title:"안 맞으면?", content:"\"신나는 시를 조용히 읽으면 어떤 느낌일까요?\" 분위기의 힘을 느끼게 해요.", fit_slides:["motivate"]},
      {id:"r_mood2", type:"real_world", icon:"🌍", title:"음악의 분위기", content:"신나는·잔잔한 노래의 분위기와 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_mood2", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 맞게 목소리와 빠르기를 조절함을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_same", type:"misconception", icon:"❓", title:"같게 읽지 않기", content:"모든 시를 같은 목소리로 읽지 않게, 분위기에 맞게 바꿔 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_mood3", type:"fun_question", icon:"💡", title:"왜 그럴까", content:"\"왜 그런 분위기로 느껴질까요?\" 까닭을 떠올려요.", fit_slides:["card_quiz"]},
      {id:"g_mood2", type:"game", game_kind:"memory_match", icon:"🎮", title:"시 ↔ 분위기 짝짓기", description:"시와 분위기를 짝지어 보세요.", hint:"말·장면에서 느껴요.", pairs:[{a:{text:"⚽ 통통 공"},b:{text:"신나는"}},{a:{text:"🌙 달님"},b:{text:"포근한"}},{a:{text:"💧 빗방울"},b:{text:"경쾌한"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"느낌 말하기", content:"좋아하는 시·노래의 분위기를 까닭과 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood2", type:"extension", icon:"⬆", title:"분위기 낱말", content:"\"분위기를 나타내는 말을 모아 볼까요? (밝은·잔잔한)\" 어휘를 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살려 읽으면 무엇이 좋죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_write2", type:"extension", icon:"⬆", title:"겹받침 예고", content:"\"다음엔 겹받침 낱말을 읽고 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 겹받침 낱말 읽고 쓰기 ① (ㄺ) ---------------- */
  window.LESSONS["u4_l03"] = {
    meta: {grade:2, subject:"국어", unit:4, n:3, title:"겹받침 낱말을 읽고 써요 ①", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄺ 받침 → 한 소리로 읽기 → 바른 소리 고르기 → 겹받침 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_rk","t_rk"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["'ㄺ' 받침이 있는 낱말을 알아봐요","바르게 읽는 법을 알아봐요","바르게 따라 써요"]}, suggested_extras:["t_rk"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"닭·읽다·맑다 🐔", visual:"🐔", question:"\"닭\" \"읽다\" \"맑다\"는 모두 'ㄺ' 받침이 있어요.<br>이 낱말들은 어떻게 읽힐까요?"}, suggested_extras:["q_rk2","r_rk"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"'ㄺ'은 [ㄱ]으로", content:"'ㄺ' 받침은 보통 **[ㄱ] 소리**로 읽혀요. \"닭\"은 [닥], \"읽다\"는 [익따], \"맑다\"는 [막따]로 읽어요. 하지만 쓸 때는 **'ㄺ'을 모두** 살려 써야 해요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"'ㄺ'→[ㄱ]"},{symbol:"읽다 → [익따]", meaning:"'ㄺ'→[ㄱ]"},{symbol:"맑다 → [막따]", meaning:"'ㄺ'→[ㄱ]"},{symbol:"쓸 땐 'ㄺ'", meaning:"두 글자 모두"}]}, suggested_extras:["t_rk2","x_rk"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바른 소리는? 🔊", sub:"'ㄺ' 받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"닭\"의 바른 소리는?", emoji:"🐔", name:"[닥]"},{clue:"\"읽다\"의 바른 소리는?", emoji:"📖", name:"[익따]"},{clue:"\"맑다\"의 바른 소리는?", emoji:"☀️", name:"[막따]"}], outro:"'ㄺ'은 [ㄱ]으로 읽혀요. 이제 바르게 따라 써 볼까요? 😊"}, suggested_extras:["q_rk3","g_rk"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"바르게 따라 써요 ✍️", content:"'ㄺ' 받침 낱말을 또박또박 따라 써 봐요. 소리는 [ㄱ]이지만 **'ㄺ'을 모두** 살려 **닭 · 읽다 · 맑다**를 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 'ㄺ' 살려서"},{symbol:"읽다", meaning:"받침 'ㄺ' 살려서"},{symbol:"맑다", meaning:"받침 'ㄺ' 살려서"}]}, suggested_extras:["t_trace3","e_rk3"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["'ㄺ' 받침이 있는 낱말을 알았어요","[ㄱ]으로 읽는 법을 알았어요","'ㄺ'을 살려 바르게 따라 썼어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"다른 겹받침도 읽고 써요", body:"다음 시간에는 'ㄵ' 'ㄼ' 같은 다른 겹받침 낱말도 읽고 써 볼 거예요!"}, suggested_extras:["e_rk3"]}
    ],
    extras: [
      {id:"q_rk", type:"fun_question", icon:"💡", title:"닭 읽기", content:"\"'닭'을 소리 내어 읽어 볼까요?\" 겹받침을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_rk", type:"tip", icon:"🧩", title:"소리는 [ㄱ]", content:"'ㄺ'이 보통 [ㄱ]으로 읽힘을 여러 낱말로 보여 주세요.", fit_slides:["objective","concept"]},
      {id:"q_rk2", type:"fun_question", icon:"🐔", title:"공통점", content:"\"이 낱말들의 공통점은 무엇일까요?\" 받침을 찾게 해요.", fit_slides:["motivate"]},
      {id:"r_rk", type:"real_world", icon:"🌍", title:"생활 낱말", content:"닭·맑다처럼 자주 쓰는 'ㄺ' 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_rk2", type:"tip", icon:"🧩", title:"소리 내어 비교", content:"읽는 소리와 쓰는 글자를 비교하며 차이를 느끼게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_rk", type:"misconception", icon:"❓", title:"받침 빠뜨리기", content:"[익따]로 들린다고 '익다'로 쓰지 않게, 'ㄺ'을 살려 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_rk3", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"'ㄺ' 받침 낱말이 또 있을까요? (흙·칡)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_rk", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"'ㄺ' 낱말과 소리를 짝지어 보세요.", hint:"[ㄱ]으로 읽혀요.", pairs:[{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"📖 읽다"},b:{text:"[익따]"}},{a:{text:"☀️ 맑다"},b:{text:"[막따]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace3", type:"tip", icon:"✍️", title:"받침 살려 쓰기", content:"소리는 [ㄱ]이지만 'ㄺ'을 모두 살려 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"e_rk3", type:"extension", icon:"⬆", title:"문장 만들기", content:"\"'맑다'로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept","next_lesson"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"'ㄺ'은 어떤 소리로 읽히죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_rk3b", type:"extension", icon:"⬆", title:"다른 겹받침 예고", content:"\"다음엔 'ㄵ' 'ㄼ'도 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 겹받침 낱말 읽고 쓰기 ② (ㄵ·ㄼ) ---------------- */
  window.LESSONS["u4_l04"] = {
    meta: {grade:2, subject:"국어", unit:4, n:4, title:"겹받침 낱말을 읽고 써요 ②", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄵ·ㄼ 받침 → 한 소리로 읽기 → 바르게 쓴 낱말 찾기 → 겹받침 낱말 잇기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_more4"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["'ㄵ' 'ㄼ' 받침 낱말을 알아봐요","바르게 읽고 쓰는 법을 알아봐요","바르게 쓴 낱말을 찾아봐요"]}, suggested_extras:["t_more4"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"앉다·많다·넓다·짧다 🪑", visual:"🪑", question:"\"앉다\"는 [안따], \"넓다\"는 [널따]로 읽혀요.<br>겹받침마다 읽히는 소리가 다르네요!"}, suggested_extras:["q_more4b","r_more4"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ]", content:"'ㄵ' 받침은 **[ㄴ]**으로, 'ㄼ' 받침은 보통 **[ㄹ]**로 읽혀요. \"앉다\"는 [안따], \"넓다\"는 [널따], \"짧다\"는 [짤따]예요. 쓸 때는 받침을 **모두** 살려요!", symbol_meanings:[{symbol:"앉다 → [안따]", meaning:"'ㄵ'→[ㄴ]"},{symbol:"많다 → [만타]", meaning:"'ㄶ'→[ㄴ]"},{symbol:"넓다 → [널따]", meaning:"'ㄼ'→[ㄹ]"},{symbol:"짧다 → [짤따]", meaning:"'ㄼ'→[ㄹ]"}]}, suggested_extras:["t_more4b","x_more4"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 쓴 낱말은? ✅", sub:"겹받침을 바르게 쓴 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"[안따]로 읽히는 낱말의 바른 표기는?", emoji:"🪑", name:"\"앉다\" (받침 'ㄵ')"},{clue:"[널따]로 읽히는 낱말의 바른 표기는?", emoji:"📐", name:"\"넓다\" (받침 'ㄼ')"},{clue:"[만타]로 읽히는 낱말의 바른 표기는?", emoji:"➕", name:"\"많다\" (받침 'ㄶ')"}], outro:"소리만 듣고 쓰면 틀리기 쉬워요. 겹받침을 모두 살려 써야 해요! 😊"}, suggested_extras:["q_more4c","g_more4"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 읽고 써요", question:"겹받침 낱말을 바르게 읽고 써 볼까요?", items:["'앉다'를 소리 내어 읽어 볼까요?","쓸 때는 어떤 받침을 쓰나요?","겹받침 낱말로 짧은 문장을 만들 수 있나요?"]}, suggested_extras:["t_present4","e_more4"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["'ㄵ' 'ㄼ' 받침 낱말을 알았어요","바르게 읽는 법을 알았어요","겹받침을 살려 바르게 썼어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 더 익혀요", body:"다음 시간에는 여러 겹받침 낱말을 함께 정리하고 익혀 볼 거예요!"}, suggested_extras:["e_read4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 겹받침", content:"\"지난 시간에 배운 'ㄺ'은 어떤 소리였죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_more4", type:"tip", icon:"🧩", title:"받침마다 다르게", content:"겹받침마다 읽히는 소리가 다름을 정리해 주세요.", fit_slides:["objective","concept"]},
      {id:"q_more4b", type:"fun_question", icon:"🪑", title:"소리가 달라", content:"\"'ㄺ'과 'ㄵ'은 소리가 어떻게 다른가요?\" 차이를 짚어요.", fit_slides:["motivate"]},
      {id:"r_more4", type:"real_world", icon:"🌍", title:"생활 낱말", content:"앉다·많다·넓다처럼 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_more4b", type:"tip", icon:"🧩", title:"규칙 정리", content:"'ㄵ'→[ㄴ], 'ㄼ'→[ㄹ]을 쉽게 정리해 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_more4", type:"misconception", icon:"❓", title:"소리대로 쓰기 주의", content:"[안따]로 들린다고 '안따'로 쓰지 않게, 'ㄵ'을 살려 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_more4c", type:"fun_question", icon:"💡", title:"왜 헷갈릴까", content:"\"왜 겹받침 낱말은 쓸 때 헷갈릴까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_more4", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침마다 다른 소리를 떠올려요.", pairs:[{a:{text:"🪑 앉다"},b:{text:"[안따]"}},{a:{text:"📐 넓다"},b:{text:"[널따]"}},{a:{text:"➕ 많다"},b:{text:"[만타]"}}], fit_slides:["card_quiz"]},
      {id:"t_present4", type:"tip", icon:"🗣", title:"읽고 쓰기 함께", content:"소리 내어 읽고 받침을 살려 쓰는 것을 함께 연습하게 하세요.", fit_slides:["question"]},
      {id:"e_more4", type:"extension", icon:"⬆", title:"문장 만들기", content:"\"'넓다'로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.", fit_slides:["question"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"'ㄵ'과 'ㄼ'은 어떤 소리로 읽히죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_read4", type:"extension", icon:"⬆", title:"정리 예고", content:"\"다음엔 겹받침 낱말을 정리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 겹받침 낱말 읽고 쓰기 ③ (정리) ---------------- */
  window.LESSONS["u4_l05"] = {
    meta: {grade:2, subject:"국어", unit:4, n:5, title:"겹받침 낱말을 읽고 써요 ③", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 정리 → 헷갈리기 쉬운 낱말 → 낱말↔소리 잇기 → 겹받침 낱말 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말을 읽고 써요", subtitle:"4단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_sum5","t_sum5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 겹받침 낱말을 정리해요","헷갈리기 쉬운 낱말을 익혀요","겹받침 낱말을 바르게 써요"]}, suggested_extras:["t_sum5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침이 이렇게 많아요! 📚", visual:"📚", question:"닭·값·흙·앉다·많다·넓다·여덟·몫…<br>겹받침 낱말을 모아 보니 참 많네요. 잘 익혀 볼까요?"}, suggested_extras:["q_sum5b","r_sum5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 낱말 정리", content:"겹받침은 읽을 때 **한 소리**로 나지만, 쓸 때는 받침 **두 글자**를 모두 써요. \"여덟\"은 [여덜], \"몫\"은 [목], \"값\"은 [갑]이에요. 소리만 듣고 쓰면 틀리기 쉬우니 **잘 기억**해요!", symbol_meanings:[{symbol:"여덟 → [여덜]", meaning:"'ㄼ'→[ㄹ]"},{symbol:"몫 → [목]", meaning:"'ㄱㅅ'→[ㄱ]"},{symbol:"값 → [갑]", meaning:"'ㅄ'→[ㅂ]"},{symbol:"쓸 땐 모두", meaning:"받침 두 글자"}]}, suggested_extras:["t_sum5b","x_sum5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낱말과 소리를 이어요 🔗", sub:"겹받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"여덟\"은 어떻게 읽을까요?", emoji:"8️⃣", name:"[여덜]"},{clue:"\"몫\"은 어떻게 읽을까요?", emoji:"🍰", name:"[목]"},{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑]"}], outro:"겹받침 낱말을 잘 익혔어요. 이제 바르게 써 볼까요? 😊"}, suggested_extras:["q_sum5c","g_sum5"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 바르게 써요 ✍️", content:"소리는 한 소리지만 받침을 모두 살려 또박또박 써 봐요. **닭 · 값 · 여덟**을 받침을 빠뜨리지 않고 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 'ㄺ' 모두"},{symbol:"값", meaning:"받침 'ㅄ' 모두"},{symbol:"여덟", meaning:"받침 'ㄼ' 모두"}]}, suggested_extras:["t_trace5","e_sum5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["여러 겹받침 낱말을 정리했어요","헷갈리기 쉬운 낱말을 익혔어요","겹받침을 살려 바르게 썼어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글에서 겹받침 낱말을 찾아요", body:"다음 시간에는 글을 읽으며 겹받침 낱말을 찾아 바르게 읽어 볼 거예요!"}, suggested_extras:["e_read5"]}
    ],
    extras: [
      {id:"q_sum5", type:"fun_question", icon:"💡", title:"기억나는 겹받침", content:"\"지금까지 배운 겹받침 낱말을 하나 말해 볼까요?\" 정리를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_sum5", type:"tip", icon:"🧩", title:"모아 정리", content:"여러 겹받침 낱말을 모아 정리하면 기억에 도움이 돼요.", fit_slides:["objective","concept"]},
      {id:"q_sum5b", type:"fun_question", icon:"📚", title:"많기도 해요", content:"\"겹받침 낱말이 또 어떤 게 있을까요?\" 어휘를 모아요.", fit_slides:["motivate"]},
      {id:"r_sum5", type:"real_world", icon:"🌍", title:"책 속 겹받침", content:"책에서 겹받침 낱말을 찾아본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_sum5b", type:"tip", icon:"🧩", title:"소리≠표기", content:"소리와 표기가 다름을 거듭 짚어 헷갈림을 줄여 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_sum5", type:"misconception", icon:"❓", title:"소리대로 쓰기 주의", content:"[갑]으로 들린다고 '갑'으로 쓰지 않게, '값'으로 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_sum5c", type:"fun_question", icon:"💡", title:"어떤 소리?", content:"\"이 낱말은 어떤 소리로 읽힐까요?\" 함께 확인해요.", fit_slides:["card_quiz"]},
      {id:"g_sum5", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"한 소리로 읽혀요.", pairs:[{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}},{a:{text:"🍰 몫"},b:{text:"[목]"}},{a:{text:"💰 값"},b:{text:"[갑]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace5", type:"tip", icon:"✍️", title:"받침 모두", content:"받침을 빠뜨리지 않고 모두 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"e_sum5", type:"extension", icon:"⬆", title:"낱말 모으기", content:"\"우리 반 겹받침 낱말 사전을 만들면 어떤 낱말을 넣을까요?\" 어휘를 모아요.", fit_slides:["concept"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 쓸 때 어떻게 해야 하죠?\" 받침 살리기를 짚어요.", fit_slides:["summary"]},
      {id:"e_read5", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 글에서 겹받침 낱말을 찾아요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 글에서 겹받침 낱말 찾기 ① ---------------- */
  window.LESSONS["u4_l06"] = {
    meta: {grade:2, subject:"국어", unit:4, n:6, title:"글에서 겹받침 낱말을 찾아요 ①", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 글 속 겹받침 → 바르게 읽기 → 글에서 겹받침 모두 찾기 → 바르게 읽어 보기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"글에서 겹받침 낱말을 찾아요", subtitle:"4단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_find6","t_find6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글 속 겹받침 낱말을 찾아요","바르게 읽어요","낱말 뜻을 살피며 내용을 이해해요"]}, suggested_extras:["t_find6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글 속에 숨은 겹받침 🔍", visual:"📖", question:"\"맑은 하늘 아래 닭이 모이를 쪼아요.\"<br>이 문장에 겹받침 낱말이 몇 개 있을까요?"}, suggested_extras:["q_find6b","r_find6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글 속 겹받침 찾아 읽기", content:"글을 읽을 때 **겹받침 낱말**을 찾아 바르게 읽으면 내용을 더 잘 이해할 수 있어요. \"맑은\"은 [말근], \"닭\"은 [닥]으로 읽어요. 찾아서 소리 내어 읽어 봐요!", symbol_meanings:[{symbol:"맑은 → [말근]", meaning:"'ㄺ' 받침"},{symbol:"닭 → [닥]", meaning:"'ㄺ' 받침"},{symbol:"앉아 → [안자]", meaning:"'ㄵ' 받침"},{symbol:"찾아 읽기", meaning:"바르게 소리 내어"}]}, suggested_extras:["t_find6b","x_find6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"문장 속 겹받침 낱말은? 🔍", sub:"문장에서 겹받침 낱말을 찾아봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 물에 발을 담갔다\"에서 겹받침은?", emoji:"💧", name:"맑은"},{clue:"\"닭이 마당에 앉았다\"에서 겹받침은?", emoji:"🐔", name:"닭·앉았다"},{clue:"\"여덟 명이 넓은 운동장에 모였다\"에서 겹받침은?", emoji:"🏃", name:"여덟·넓은"}], outro:"글 속 겹받침을 찾아 바르게 읽으니 더 잘 읽혀요. 소리 내어 읽어 볼까요? 😊"}, suggested_extras:["q_find6c","g_find6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"바르게 읽어 봐요", question:"겹받침 낱말이 든 문장을 바르게 읽어 볼까요?", items:["문장에서 겹받침 낱말을 찾았나요?","어떻게 읽으면 바를까요?","소리 내어 읽어 볼까요?"]}, suggested_extras:["t_present6","e_find6"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글 속 겹받침 낱말을 찾았어요","바르게 읽었어요","낱말을 살피며 내용을 이해했어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글을 읽으며 더 익혀요", body:"다음 시간에는 글을 더 읽으며 겹받침 낱말을 바르게 읽고 내용을 이해해 볼 거예요!"}, suggested_extras:["e_read6"]}
    ],
    extras: [
      {id:"q_find6", type:"fun_question", icon:"💡", title:"숨은 겹받침", content:"\"이 문장에서 겹받침 낱말을 찾을 수 있나요?\" 찾기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_find6", type:"tip", icon:"🧩", title:"찾아 읽기", content:"글에서 겹받침을 찾아 바르게 읽으면 읽기가 정확해짐을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_find6b", type:"fun_question", icon:"📖", title:"몇 개일까", content:"\"이 문장에 겹받침 낱말이 몇 개일까요?\" 함께 찾아요.", fit_slides:["motivate"]},
      {id:"r_find6", type:"real_world", icon:"🌍", title:"책 속에서", content:"읽는 책에서 겹받침 낱말을 찾아본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_find6b", type:"tip", icon:"🧩", title:"소리 내어", content:"찾은 겹받침 낱말을 소리 내어 읽으며 확인하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_find6", type:"misconception", icon:"❓", title:"대충 읽기 주의", content:"겹받침을 빼먹거나 잘못 읽지 않게 또박또박 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_find6c", type:"fun_question", icon:"💡", title:"또 있을까", content:"\"이 문장에 겹받침 낱말이 또 있을까요?\" 함께 찾아요.", fit_slides:["card_quiz"]},
      {id:"g_find6", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"글 속 겹받침 낱말과 소리를 짝지어 보세요.", hint:"바른 소리를 떠올려요.", pairs:[{a:{text:"💧 맑은"},b:{text:"[말근]"}},{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"🪑 앉아"},b:{text:"[안자]"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"또박또박 읽기", content:"찾은 낱말을 넣어 문장을 또박또박 읽게 하세요.", fit_slides:["question"]},
      {id:"e_find6", type:"extension", icon:"⬆", title:"문장 만들기", content:"\"겹받침 낱말로 짧은 문장을 만들어 볼까요?\" 활용해요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"글에서 무엇을 찾아 읽었죠?\" 겹받침을 짚어요.", fit_slides:["summary"]},
      {id:"e_read6", type:"extension", icon:"⬆", title:"이어 읽기 예고", content:"\"다음엔 글을 더 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 글에서 겹받침 낱말 찾기 ② (내용 이해) ---------------- */
  window.LESSONS["u4_l07"] = {
    meta: {grade:2, subject:"국어", unit:4, n:7, title:"글에서 겹받침 낱말을 찾아요 ②", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 알맞게 띄어 읽기 → 뜻이 드러나게 → 바른 띄어 읽기 고르기 → 글 읽고 내용 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"글에서 겹받침 낱말을 찾아요", subtitle:"4단원 · 7/15차시 · 소단원 1"}, suggested_extras:["q_recall7","t_space7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["뜻이 드러나게 띄어 읽어요","겹받침 낱말을 바르게 읽어요","글의 내용을 이해해요"]}, suggested_extras:["t_space7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어디서 쉬어 읽을까? ✂️", visual:"📖", question:"\"아기가밥을먹는다\"처럼 붙여 읽으면 뜻을 알기 어려워요.<br>어디서 쉬어 읽으면 좋을까요?"}, suggested_extras:["q_space7","r_space7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"뜻이 드러나게 띄어 읽기", content:"문장은 **뜻이 드러나게** 알맞게 띄어 읽어요. \"아기가 / 밥을 / 먹는다\"처럼 낱말 덩어리마다 살짝 쉬면 뜻이 잘 전해져요. 겹받침 낱말도 **바르게** 읽으며 띄어 읽어요!", symbol_meanings:[{symbol:"아기가 /", meaning:"누가"},{symbol:"밥을 /", meaning:"무엇을"},{symbol:"먹는다", meaning:"어찌하다"},{symbol:"알맞게 쉬기", meaning:"뜻이 드러나게"}]}, suggested_extras:["t_space7b","x_space7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 띄어 읽은 것은? ✅", sub:"뜻이 잘 드러나게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 하늘에 새가 난다\"를 띄어 읽으면?", emoji:"🐦", name:"\"맑은 / 하늘에 / 새가 / 난다\""},{clue:"\"닭이 모이를 쪼아요\"를 띄어 읽으면?", emoji:"🐔", name:"\"닭이 / 모이를 / 쪼아요\""},{clue:"이렇게 읽으면 뜻을 알기 어려워요!", emoji:"🙅", name:"\"닭이모이를쪼아요\" (다 붙여 읽기)"}], outro:"알맞게 띄어 읽으니 뜻이 잘 드러나요. 글을 읽고 내용을 나눠 볼까요? 😊"}, suggested_extras:["q_space7b","g_space7"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"글을 읽고 내용을 나눠요", question:"겹받침 낱말이 든 글을 읽고 내용을 나눠 볼까요?", items:["글을 알맞게 띄어 읽었나요?","겹받침 낱말을 바르게 읽었나요?","글에서 무엇을 알게 됐나요?"]}, suggested_extras:["t_present7","e_read7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["뜻이 드러나게 띄어 읽었어요","겹받침 낱말을 바르게 읽었어요","글의 내용을 이해했어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시의 분위기를 살펴봐요", body:"다음 시간에는 시의 분위기를 말과 장면에서 느껴 볼 거예요!"}, suggested_extras:["e_mood7"]}
    ],
    extras: [
      {id:"q_recall7", type:"fun_question", icon:"💡", title:"지난 글", content:"\"지난 시간에 글에서 어떤 겹받침을 찾았나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_space7", type:"tip", icon:"🧩", title:"띄어 읽기", content:"뜻이 드러나게 낱말 덩어리마다 살짝 쉬어 읽게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_space7", type:"fun_question", icon:"✂️", title:"어디서 쉴까", content:"\"이 문장은 어디서 쉬어 읽으면 좋을까요?\" 띄어 읽기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_space7", type:"real_world", icon:"🌍", title:"읽어 주기", content:"책을 읽어 줄 때 자연스럽게 쉬는 부분과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_space7b", type:"tip", icon:"🧩", title:"덩어리마다", content:"누가/무엇을/어찌하다 덩어리마다 쉬면 뜻이 드러남을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_space7", type:"misconception", icon:"❓", title:"다 붙이거나 다 끊기 주의", content:"낱말마다 다 끊거나 다 붙이면 어색해요. 알맞게 쉬게 하세요.", fit_slides:["concept"]},
      {id:"q_space7b", type:"fun_question", icon:"💡", title:"왜 더 잘 읽힐까", content:"\"왜 띄어 읽으면 더 잘 들릴까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_space7", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 띄어 읽기 짝짓기", description:"문장과 알맞은 띄어 읽기를 짝지어 보세요.", hint:"뜻이 드러나게 쉬어요.", pairs:[{a:{text:"🐦 새가 난다"},b:{text:"맑은 / 하늘에 / 새가 / 난다"}},{a:{text:"🐔 닭이 쪼아요"},b:{text:"닭이 / 모이를 / 쪼아요"}},{a:{text:"🙅 다 붙임"},b:{text:"뜻 알기 어려움"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"띄어 읽으며", content:"겹받침을 바르게 읽으며 알맞게 띄어 읽게 하세요.", fit_slides:["question"]},
      {id:"e_read7", type:"extension", icon:"⬆", title:"내용 묻기", content:"\"글에서 무슨 일이 있었나요?\" 내용을 확인해요.", fit_slides:["question"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"문장은 어떻게 띄어 읽죠?\" 뜻이 드러나게를 짚어요.", fit_slides:["summary"]},
      {id:"e_mood7", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시의 분위기를 살펴봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 시의 분위기 살펴보기 ① ---------------- */
  window.LESSONS["u4_l08"] = {
    meta: {grade:2, subject:"국어", unit:4, n:8, title:"시의 분위기를 살펴봐요 ①", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기를 주는 말 → 말·장면으로 느끼기 → 분위기 고르기 → 분위기 말하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_mood8","t_mood8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시의 분위기를 말에서 느껴요","장면에서 분위기를 느껴요","시의 분위기를 말해 봐요"]}, suggested_extras:["t_mood8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"말이 분위기를 만들어요 🎈", visual:"🎈", question:"\"통통! 콩콩! 신나게!\" 같은 말이 든 시는<br>어떤 분위기로 느껴질까요?"}, suggested_extras:["q_word8","r_mood8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 느끼는 방법", content:"시의 분위기는 **말**과 **장면**에서 느껴져요. '통통·신나게' 같은 말은 **신나는** 분위기를, '살며시·고요히' 같은 말은 **조용한** 분위기를 만들어요. 어떤 장면이 떠오르는지도 살펴봐요!", symbol_meanings:[{symbol:"통통·신나게", meaning:"신나는 분위기"},{symbol:"살며시·고요히", meaning:"조용한 분위기"},{symbol:"포근히·따뜻이", meaning:"포근한 분위기"},{symbol:"떠오르는 장면", meaning:"분위기를 느껴요"}]}, suggested_extras:["t_mood8b","x_mood8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기? 🎵", sub:"시에서 분위기를 느껴 봐요. 카드를 누르면 분위기가 나와요!", cards:[{clue:"\"통통 공이 콩콩, 신나게 뛰어요\"", emoji:"⚽", name:"신나고 밝은 분위기"},{clue:"\"달님이 살며시 창가에 앉아요\"", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"엄마 품은 따뜻해, 포근한 이불 같아\"", emoji:"🤗", name:"따뜻하고 포근한 분위기"}], outro:"말과 장면에서 분위기가 느껴져요. 시의 분위기를 말해 볼까요? 😊"}, suggested_extras:["q_mood8b","g_mood8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"시의 분위기를 말해요", question:"시를 읽고 분위기를 느껴 볼까요?", items:["이 시는 어떤 분위기인가요?","어떤 말에서 그렇게 느꼈나요?","어떤 장면이 떠오르나요?"]}, suggested_extras:["t_present8","e_mood8"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시의 분위기를 말에서 느꼈어요","장면에서 분위기를 느꼈어요","시의 분위기를 말했어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 더 살펴봐요", body:"다음 시간에는 여러 시의 분위기를 견주어 살펴볼 거예요!"}, suggested_extras:["e_mood8b"]}
    ],
    extras: [
      {id:"q_mood8", type:"fun_question", icon:"💡", title:"느낌을 주는 말", content:"\"신난다는 느낌을 주는 말을 떠올려 볼까요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood8", type:"tip", icon:"🧩", title:"말과 장면", content:"분위기는 말과 떠오르는 장면에서 느껴짐을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_word8", type:"fun_question", icon:"🎈", title:"어떤 분위기", content:"\"이런 말이 든 시는 어떤 느낌일까요?\" 분위기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_mood8", type:"real_world", icon:"🌍", title:"노래 분위기", content:"신나는·잔잔한 노래의 분위기와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mood8b", type:"tip", icon:"🧩", title:"분위기 낱말", content:"신나는·조용한·포근한 같은 분위기 낱말을 함께 익히게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_mood8", type:"misconception", icon:"❓", title:"정답은 없어요", content:"분위기를 느끼는 데 정답을 강요하지 말고 다양한 느낌을 인정하세요.", fit_slides:["concept"]},
      {id:"q_mood8b", type:"fun_question", icon:"💡", title:"왜 그럴까", content:"\"왜 그런 분위기로 느껴질까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_mood8", type:"game", game_kind:"memory_match", icon:"🎮", title:"시 ↔ 분위기 짝짓기", description:"시와 분위기를 짝지어 보세요.", hint:"말과 장면을 떠올려요.", pairs:[{a:{text:"⚽ 통통 공"},b:{text:"신나는"}},{a:{text:"🌙 달님"},b:{text:"조용한"}},{a:{text:"🤗 엄마 품"},b:{text:"포근한"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"까닭과 함께", content:"분위기를 말할 때 어떤 말·장면에서 느꼈는지 까닭을 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood8", type:"extension", icon:"⬆", title:"분위기 바꾸기", content:"\"말을 바꾸면 분위기도 바뀔까요?\" 표현을 탐구해요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기는 무엇에서 느껴지죠?\" 말·장면을 짚어요.", fit_slides:["summary"]},
      {id:"e_mood8b", type:"extension", icon:"⬆", title:"이어 보기 예고", content:"\"다음엔 여러 시의 분위기를 견줘요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 시의 분위기 살펴보기 ② (견주기) ---------------- */
  window.LESSONS["u4_l09"] = {
    meta: {grade:2, subject:"국어", unit:4, n:9, title:"시의 분위기를 살펴봐요 ②", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기 견주기 → 밝은 말·차분한 말 → 밝은 말 모으기 → 장면↔분위기 잇기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_recall9","t_compare9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 시의 분위기를 견주어요","밝은 말과 차분한 말을 구분해요","장면과 분위기를 관련지어요"]}, suggested_extras:["t_compare9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기가 서로 달라요 🌗", visual:"🌗", question:"신나는 시와 조용한 시를 나란히 두면<br>어떤 말이 분위기를 다르게 만들까요?"}, suggested_extras:["q_compare9","r_compare9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"밝은 말·차분한 말", content:"분위기를 만드는 말은 **밝은 말**(신나게·통통·반짝)과 **차분한 말**(살며시·고요히·포근히)로 나눌 수 있어요. 같은 일도 어떤 말을 쓰느냐에 따라 분위기가 **달라져요**!", symbol_meanings:[{symbol:"신나게·통통", meaning:"밝은 분위기"},{symbol:"살며시·고요히", meaning:"차분한 분위기"},{symbol:"반짝·깡충", meaning:"밝고 경쾌하게"},{symbol:"포근히·잔잔히", meaning:"따뜻하고 차분하게"}]}, suggested_extras:["t_compare9b","x_compare9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 장면은 어떤 분위기? 🌗", sub:"장면에 어울리는 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"아이들이 운동장에서 공을 차는 장면", emoji:"⚽", name:"신나고 밝은 분위기"},{clue:"고요한 밤, 별이 반짝이는 장면", emoji:"🌌", name:"조용하고 신비로운 분위기"},{clue:"엄마가 아기를 재우는 장면", emoji:"👶", name:"포근하고 따뜻한 분위기"}], outro:"장면과 말이 분위기를 만들어요. 밝은 말을 모아 볼까요? 😊"}, suggested_extras:["q_compare9b","g_compare9"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 견주어 말해요", question:"두 시의 분위기를 견주어 볼까요?", items:["두 시의 분위기가 어떻게 다른가요?","어떤 말 때문에 다르게 느껴지나요?","어떤 분위기의 시가 더 좋은가요?"]}, suggested_extras:["t_present9","e_compare9"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["여러 시의 분위기를 견주었어요","밝은 말과 차분한 말을 구분했어요","장면과 분위기를 관련지었어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽어요", body:"다음 시간에는 시의 분위기에 맞게 목소리를 조절하며 소리 내어 읽어 볼 거예요!"}, suggested_extras:["e_read9"]}
    ],
    extras: [
      {id:"q_recall9", type:"fun_question", icon:"💡", title:"지난 분위기", content:"\"지난 시간에 본 시는 어떤 분위기였나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_compare9", type:"tip", icon:"🧩", title:"견주어 보기", content:"두 시를 나란히 두고 분위기 차이를 느끼게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_compare9", type:"fun_question", icon:"🌗", title:"무엇이 다를까", content:"\"두 시는 어떤 말 때문에 분위기가 다를까요?\" 차이를 짚어요.", fit_slides:["motivate"]},
      {id:"r_compare9", type:"real_world", icon:"🌍", title:"밝은·잔잔한", content:"밝은 노래와 잔잔한 노래의 차이와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_compare9b", type:"tip", icon:"🧩", title:"말의 갈래", content:"분위기를 만드는 말을 밝은 말·차분한 말로 나눠 정리해 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_compare9", type:"misconception", icon:"❓", title:"좋고 나쁨 아니에요", content:"밝은 분위기·차분한 분위기에 좋고 나쁨은 없어요. 각각의 느낌을 존중하게 하세요.", fit_slides:["concept"]},
      {id:"q_compare9b", type:"fun_question", icon:"💡", title:"왜 그럴까", content:"\"왜 그런 분위기로 느껴질까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_compare9", type:"game", game_kind:"memory_match", icon:"🎮", title:"장면 ↔ 분위기 짝짓기", description:"장면과 분위기를 짝지어 보세요.", hint:"장면의 느낌을 떠올려요.", pairs:[{a:{text:"⚽ 공차기"},b:{text:"신나는"}},{a:{text:"🌌 별밤"},b:{text:"조용한"}},{a:{text:"👶 재우기"},b:{text:"포근한"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"까닭과 함께", content:"분위기 차이를 어떤 말 때문인지 까닭과 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_compare9", type:"extension", icon:"⬆", title:"분위기 바꿔 보기", content:"\"밝은 말을 차분한 말로 바꾸면 분위기가 어떻게 될까요?\" 탐구해요.", fit_slides:["question"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 만드는 말에는 어떤 갈래가 있죠?\" 밝은·차분한을 짚어요.", fit_slides:["summary"]},
      {id:"e_read9", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 분위기를 살려 소리 내어 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 분위기 살려 읽기 ① ---------------- */
  window.LESSONS["u4_l10"] = {
    meta: {grade:2, subject:"국어", unit:4, n:10, title:"분위기를 생각하며 읽어요 ①", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기에 맞는 목소리 → 빠르기·크기 조절 → 어울리는 읽기 고르기 → 분위기 살려 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 읽어요", subtitle:"4단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_read10","t_read10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기에 맞는 목소리를 알아봐요","빠르기와 크기를 조절해요","분위기를 살려 소리 내어 읽어요"]}, suggested_extras:["t_read10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기에 맞게 읽어요 🎙️", visual:"🎙️", question:"신나는 시는 밝고 빠르게, 조용한 시는 낮고 천천히!<br>어떻게 읽으면 분위기가 살아날까요?"}, suggested_extras:["q_voice10","r_read10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기에 맞게 읽기", content:"분위기에 맞게 **목소리·빠르기·크기**를 조절해요. 신나는 시는 **밝고 빠르게**, 조용한 시는 **낮고 천천히**, 포근한 시는 **부드럽게** 읽으면 분위기가 잘 살아나요!", symbol_meanings:[{symbol:"신나는 시", meaning:"밝고 빠르게"},{symbol:"조용한 시", meaning:"낮고 천천히"},{symbol:"포근한 시", meaning:"부드럽고 따뜻하게"},{symbol:"알맞게 띄어", meaning:"뜻이 드러나게"}]}, suggested_extras:["t_read10b","x_read10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"어울리는 읽기는? 🎙️", sub:"시 분위기에 어울리는 읽기 방법을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 시는 어떻게 읽을까요?", emoji:"⚡", name:"밝고 빠르게, 힘차게"},{clue:"조용한 시는 어떻게 읽을까요?", emoji:"🌙", name:"낮고 천천히, 차분하게"},{clue:"포근한 시는 어떻게 읽을까요?", emoji:"🤗", name:"부드럽고 따뜻하게"}], outro:"분위기에 맞게 목소리를 바꾸니 시가 살아나요. 직접 읽어 볼까요? 😊"}, suggested_extras:["q_read10c","g_read10"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"분위기를 살려 읽어요 🎤", sub:"버튼을 눌러 친구를 뽑아요. 시를 분위기에 맞게 목소리를 조절하며 읽어 봐요!", count:24, hint:"신나는 시는 밝고 빠르게, 조용한 시는 낮고 천천히 읽어 봐요", end_msg:"모두 분위기를 살려 멋지게 읽었어요. 시가 살아났어요! 👏"}, suggested_extras:["t_present10","e_read10"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기에 맞는 목소리를 알았어요","빠르기와 크기를 조절했어요","분위기를 살려 읽었어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 더 읽어요", body:"다음 시간에는 좋아하는 시를 골라 분위기를 살려 낭송해 볼 거예요!"}, suggested_extras:["e_read10b"]}
    ],
    extras: [
      {id:"q_read10", type:"fun_question", icon:"💡", title:"목소리 바꾸기", content:"\"같은 시를 다르게 읽어 본 적 있나요?\" 낭송을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_read10", type:"tip", icon:"🧩", title:"목소리 조절", content:"분위기에 맞게 목소리·빠르기·크기를 조절하게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_voice10", type:"fun_question", icon:"🎙️", title:"어떻게 읽을까", content:"\"이 시는 어떻게 읽으면 분위기가 살까요?\" 읽기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read10", type:"real_world", icon:"🌍", title:"읽어 주기", content:"동화를 실감 나게 읽어 준 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read10b", type:"tip", icon:"🧩", title:"세 가지 조절", content:"목소리·빠르기·크기 세 가지를 분위기에 맞게 바꾸게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read10", type:"misconception", icon:"❓", title:"같게 읽지 않기", content:"분위기와 상관없이 늘 같은 목소리로 읽지 않게, 분위기에 맞게 바꾸게 하세요.", fit_slides:["concept"]},
      {id:"q_read10c", type:"fun_question", icon:"💡", title:"왜 어울릴까", content:"\"왜 그렇게 읽으면 어울릴까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read10", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽는 방법 짝짓기", description:"분위기와 읽는 방법을 짝지어 보세요.", hint:"분위기에 맞는 목소리를 떠올려요.", pairs:[{a:{text:"⚡ 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 조용한"},b:{text:"낮고 천천히"}},{a:{text:"🤗 포근한"},b:{text:"부드럽게"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"격려하기", content:"실감 나게 읽는 친구를 격려하고, 듣는 친구는 분위기를 느끼게 하세요.", fit_slides:["present"]},
      {id:"e_read10", type:"extension", icon:"⬆", title:"몸짓 더하기", content:"\"몸짓을 더해 읽으면 어떨까요?\" 낭송을 확장해요.", fit_slides:["present"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기에 맞게 무엇을 조절하죠?\" 목소리·빠르기를 짚어요.", fit_slides:["summary"]},
      {id:"e_read10b", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 좋아하는 시를 낭송해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 분위기 살려 읽기 ② (좋아하는 시 낭송) ---------------- */
  window.LESSONS["u4_l11"] = {
    meta: {grade:2, subject:"국어", unit:4, n:11, title:"분위기를 생각하며 읽어요 ②", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 좋아하는 시 고르기 → 낭송 준비 → 알맞은 낭송 모으기 → 시 낭송·나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 읽어요", subtitle:"4단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_pick11","t_recite11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["좋아하는 시를 골라요","분위기를 살려 낭송을 준비해요","시를 낭송하고 나눠요"]}, suggested_extras:["t_recite11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"내가 고른 시를 낭송해요 🎵", visual:"📜", question:"마음에 드는 시를 골라 낭송하려고 해요.<br>분위기를 살리려면 어떻게 준비할까요?"}, suggested_extras:["q_recite11","r_recite11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송 준비하기", content:"낭송하기 전에 시의 **분위기**를 살피고, 어디서 **세게·여리게**, 어디서 **빠르게·천천히** 읽을지 정해요. 알맞게 **띄어 읽기**도 표시해 두면 분위기를 잘 살릴 수 있어요!", symbol_meanings:[{symbol:"분위기 살피기", meaning:"어떤 느낌인가"},{symbol:"세게·여리게", meaning:"목소리 크기"},{symbol:"빠르게·천천히", meaning:"읽는 빠르기"},{symbol:"띄어 읽기", meaning:"쉬는 곳 표시"}]}, suggested_extras:["t_recite11b","x_recite11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞은 낭송 태도는? ✅", sub:"좋은 낭송과 듣기 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"낭송할 때는?", emoji:"🎤", name:"분위기에 맞게 목소리를 조절해요"},{clue:"낭송을 들을 때는?", emoji:"👂", name:"분위기를 느끼며 잘 들어요"},{clue:"낭송이 끝나면?", emoji:"👏", name:"좋았던 점을 말해 줘요"}], outro:"준비하고 분위기를 살려 낭송하면 시가 더 멋져요. 낭송해 볼까요? 😊"}, suggested_extras:["q_good11","g_recite11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"시를 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 고른 시를 분위기를 살려 낭송해 봐요!", count:24, hint:"분위기에 맞게 목소리·빠르기를 조절하며 또박또박 낭송해요", end_msg:"모두 분위기를 살려 멋지게 낭송했어요. 시가 마음에 닿았어요! 👏"}, suggested_extras:["t_present11","e_recite11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["좋아하는 시를 골랐어요","분위기를 살려 낭송을 준비했어요","시를 낭송하고 나눴어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시로 여는 우리 반을 만들어요", body:"다음 시간에는 좋아하는 시를 모아 시로 여는 우리 반을 만들어 볼 거예요!"}, suggested_extras:["e_class11"]}
    ],
    extras: [
      {id:"q_pick11", type:"fun_question", icon:"💡", title:"마음에 든 시", content:"\"마음에 쏙 드는 시가 있나요?\" 낭송을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_recite11", type:"tip", icon:"🧩", title:"준비가 핵심", content:"낭송 전 분위기·강약·빠르기를 정하는 준비가 중요함을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_recite11", type:"fun_question", icon:"📜", title:"어떻게 준비?", content:"\"낭송을 잘하려면 무엇을 준비할까요?\" 준비를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_recite11", type:"real_world", icon:"🌍", title:"낭송 경험", content:"시를 외워 발표한 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_recite11b", type:"tip", icon:"🧩", title:"표시해 두기", content:"강약·빠르기·쉬는 곳을 표시해 두면 낭송이 쉬워져요.", fit_slides:["concept","card_quiz"]},
      {id:"x_recite11", type:"misconception", icon:"❓", title:"외우기보다 분위기", content:"틀리지 않고 외우는 것보다 분위기를 살리는 데 초점을 두게 하세요.", fit_slides:["concept"]},
      {id:"q_good11", type:"fun_question", icon:"💡", title:"좋은 낭송은?", content:"\"좋은 낭송은 어떤 모습일까요?\" 낭송 태도를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_recite11", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 태도 짝짓기", description:"낭송·듣기 상황과 바른 태도를 짝지어 보세요.", hint:"분위기를 살리는 태도를 생각해요.", pairs:[{a:{text:"🎤 낭송"},b:{text:"분위기 살려"}},{a:{text:"👂 듣기"},b:{text:"느끼며 듣기"}},{a:{text:"👏 끝난 뒤"},b:{text:"좋은 점 말하기"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 분위기를 느끼게 하세요.", fit_slides:["present"]},
      {id:"e_recite11", type:"extension", icon:"⬆", title:"함께 낭송", content:"\"둘이 한 연씩 나눠 낭송하면 어떨까요?\" 낭송을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송을 어떻게 준비했죠?\" 분위기·강약을 짚어요.", fit_slides:["summary"]},
      {id:"e_class11", type:"extension", icon:"⬆", title:"우리 반 예고", content:"\"다음엔 시로 여는 우리 반을 만들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 시로 여는 우리 반 ① (실천) ---------------- */
  window.LESSONS["u4_l12"] = {
    meta: {grade:2, subject:"국어", unit:4, n:12, title:"시로 여는 우리 반을 만들어요 ① (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 시 모으기 → 낭송 차례 정하기 → 좋은 듣기 태도 모으기 → 시 낭송하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 12/15차시 · 실천"}, suggested_extras:["q_class12","t_class12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["좋아하는 시를 모아요","낭송 차례를 정해요","서로의 시 낭송을 들어요"]}, suggested_extras:["t_class12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"아침을 시로 열어요 🌅", visual:"🌅", question:"매일 아침 친구들이 시 한 편씩 낭송한다면<br>우리 반은 어떻게 달라질까요?"}, suggested_extras:["q_open12","r_class12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"시로 여는 우리 반", content:"좋아하는 시를 **모아** 차례대로 낭송하며 하루를 열어요. 낭송하는 친구는 **분위기를 살려** 읽고, 듣는 친구는 **분위기를 느끼며** 잘 들어요. 시로 마음이 **따뜻해져요**!", symbol_meanings:[{symbol:"시 모으기", meaning:"좋아하는 시를 골라요"},{symbol:"차례 정하기", meaning:"누가 언제 낭송할지"},{symbol:"분위기 살려", meaning:"낭송하는 친구"},{symbol:"느끼며 듣기", meaning:"듣는 친구"}]}, suggested_extras:["t_class12b","x_class12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 듣기 태도는? ✅", sub:"시 낭송을 들을 때 좋은 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"친구가 낭송할 때는?", emoji:"👂", name:"분위기를 느끼며 조용히 들어요"},{clue:"낭송이 끝나면?", emoji:"👏", name:"박수로 격려해 줘요"},{clue:"느낌을 말할 때는?", emoji:"💗", name:"어떤 분위기였는지 말해 줘요"}], outro:"서로 잘 들어 주면 낭송이 더 즐거워요. 시로 우리 반을 열어 볼까요? 😊"}, suggested_extras:["q_good12","g_class12"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"시로 우리 반을 열어요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 고른 시를 분위기를 살려 낭송하고 함께 들어요!", count:24, hint:"분위기를 살려 낭송하고, 듣는 친구는 느낌을 떠올리며 들어요", end_msg:"시로 우리 반이 따뜻해졌어요. 멋진 낭송이었어요! 👏"}, suggested_extras:["t_present12","e_class12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["좋아하는 시를 모았어요","낭송 차례를 정했어요","서로의 낭송을 들었어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시 낭송을 이어 가요", body:"다음 시간에는 더 많은 친구가 시를 낭송하며 분위기를 나눠 볼 거예요!"}, suggested_extras:["e_class12b"]}
    ],
    extras: [
      {id:"q_class12", type:"fun_question", icon:"💡", title:"아침 시간", content:"\"아침에 시 한 편을 들으면 기분이 어떨까요?\" 흥미를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_class12", type:"tip", icon:"🧩", title:"함께 즐기기", content:"시로 여는 우리 반은 함께 시를 즐기는 활동임을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_open12", type:"fun_question", icon:"🌅", title:"달라질까", content:"\"매일 시로 하루를 열면 우리 반은 어떻게 달라질까요?\" 상상해요.", fit_slides:["motivate"]},
      {id:"r_class12", type:"real_world", icon:"🌍", title:"아침 활동", content:"아침 독서·노래 등 아침 활동과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_class12b", type:"tip", icon:"🧩", title:"낭송과 듣기", content:"낭송하는 친구와 듣는 친구의 역할을 함께 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_class12", type:"misconception", icon:"❓", title:"잘하기보다 즐기기", content:"잘 낭송하는 것보다 함께 즐기는 데 초점을 두게 하세요.", fit_slides:["concept"]},
      {id:"q_good12", type:"fun_question", icon:"💡", title:"좋은 듣기는?", content:"\"좋은 듣기 태도는 무엇일까요?\" 듣기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_class12", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 바른 태도 짝짓기", description:"낭송 상황과 바른 태도를 짝지어 보세요.", hint:"함께 즐기는 태도를 생각해요.", pairs:[{a:{text:"👂 낭송 중"},b:{text:"조용히 듣기"}},{a:{text:"👏 끝난 뒤"},b:{text:"박수·격려"}},{a:{text:"💗 느낌"},b:{text:"분위기 말하기"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"골고루 참여", content:"여러 친구가 돌아가며 낭송하게 차례를 정해 주세요.", fit_slides:["present"]},
      {id:"e_class12", type:"extension", icon:"⬆", title:"시 게시판", content:"\"좋아하는 시를 모아 게시판을 만들면 어떨까요?\" 실천을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"시로 우리 반을 어떻게 열었죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_class12b", type:"extension", icon:"⬆", title:"이어 가기 예고", content:"\"다음엔 낭송을 이어 가요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 시로 여는 우리 반 ② (낭송 나누기) ---------------- */
  window.LESSONS["u4_l13"] = {
    meta: {grade:2, subject:"국어", unit:4, n:13, title:"시로 여는 우리 반을 만들어요 ② (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 낭송 이어 가기 → 분위기 느끼며 듣기 → 좋은 점 찾기 → 낭송하고 소감 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 13/15차시 · 실천"}, suggested_extras:["q_recall13","t_share13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기를 살려 낭송해요","친구 낭송의 분위기를 느껴요","낭송 소감을 나눠요"]}, suggested_extras:["t_share13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구마다 분위기가 달라요 🎭", visual:"🎭", question:"같은 시도 친구마다 다르게 낭송해요.<br>친구 낭송에서 어떤 분위기가 느껴지나요?"}, suggested_extras:["q_feel13","r_share13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 느끼며 나누기", content:"친구의 낭송을 들으며 **어떤 분위기**인지 느끼고, 낭송이 끝나면 **좋았던 점**을 말해 줘요. \"밝게 읽어서 신났어\" \"천천히 읽어서 차분했어\"처럼 **분위기**를 말해 주면 좋아요!", symbol_meanings:[{symbol:"분위기 느끼기", meaning:"어떤 느낌인가"},{symbol:"좋은 점 찾기", meaning:"잘한 점을 칭찬"},{symbol:"분위기 말하기", meaning:"신났다·차분했다"},{symbol:"함께 즐기기", meaning:"서로 격려"}]}, suggested_extras:["t_share13b","x_share13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낭송의 좋은 점을 찾아요 ✅", sub:"낭송에서 칭찬할 점을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"밝고 빠르게 읽은 낭송은?", emoji:"⚡", name:"\"신나는 분위기를 잘 살렸어\""},{clue:"천천히 부드럽게 읽은 낭송은?", emoji:"🌙", name:"\"차분한 분위기가 잘 느껴졌어\""},{clue:"또박또박 읽은 낭송은?", emoji:"👂", name:"\"잘 들려서 좋았어\""}], outro:"분위기를 느끼며 칭찬하니 낭송이 더 즐거워요. 낭송하고 나눠 볼까요? 😊"}, suggested_extras:["q_good13","g_share13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"낭송하고 소감을 나눠요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 분위기를 살려 낭송하고, 들은 친구는 분위기를 말해 줘요!", count:24, hint:"낭송 뒤 \u201c어떤 분위기였는지\u201d 느낌을 말해 줘요", end_msg:"시로 여는 우리 반이 완성됐어요. 모두 멋진 낭송가예요! 👏"}, suggested_extras:["t_present13","e_share13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["분위기를 살려 낭송했어요","친구 낭송의 분위기를 느꼈어요","낭송 소감을 나눴어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 단원에서 배운 것을 스스로 돌아보고 정리해 볼 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_recall13", type:"fun_question", icon:"💡", title:"기억에 남는 낭송", content:"\"지난 시간에 어떤 낭송이 기억에 남나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_share13", type:"tip", icon:"🧩", title:"분위기로 칭찬", content:"낭송을 들은 뒤 분위기를 짚어 칭찬하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_feel13", type:"fun_question", icon:"🎭", title:"분위기 느끼기", content:"\"친구 낭송에서 어떤 분위기가 느껴졌나요?\" 느낌을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_share13", type:"real_world", icon:"🌍", title:"공연 감상", content:"노래·낭송 공연을 보고 느낌을 나눈 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_share13b", type:"tip", icon:"🧩", title:"구체적 칭찬", content:"\"잘했다\"보다 어떤 분위기를 살렸는지 구체적으로 칭찬하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_share13", type:"misconception", icon:"❓", title:"흠보다 좋은 점", content:"잘못을 지적하기보다 좋았던 점을 찾아 말하게 하세요.", fit_slides:["concept"]},
      {id:"q_good13", type:"fun_question", icon:"💡", title:"어떤 점이 좋을까", content:"\"이 낭송의 어떤 점이 좋았나요?\" 좋은 점을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_share13", type:"game", game_kind:"memory_match", icon:"🎮", title:"낭송 ↔ 좋은 점 짝짓기", description:"낭송 특징과 좋은 점을 짝지어 보세요.", hint:"어떤 분위기를 살렸는지 생각해요.", pairs:[{a:{text:"⚡ 밝고 빠르게"},b:{text:"신나는 분위기"}},{a:{text:"🌙 천천히"},b:{text:"차분한 분위기"}},{a:{text:"👂 또박또박"},b:{text:"잘 들림"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"분위기 말하기", content:"낭송 뒤 어떤 분위기였는지 느낌을 말하게 하세요.", fit_slides:["present"]},
      {id:"e_share13", type:"extension", icon:"⬆", title:"시 모음집", content:"\"우리 반 시 모음집을 만들면 어떨까요?\" 실천을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송을 듣고 무엇을 나눴죠?\" 분위기 느낌을 짚어요.", fit_slides:["summary"]},
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
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"4단원에서 무엇을 배웠나요? 🎀", visual:"📚", question:"겹받침도 바르게 읽고 쓰고, 시도 분위기를 살려 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침·분위기 정리", content:"이 단원에서 **겹받침을 바르게 읽고 쓰는 법**과 **시를 분위기에 맞게 읽는 법**을 배웠어요. 겹받침은 한 소리로 읽되 쓸 땐 모두 살리고, 시는 분위기에 맞게 목소리를 조절해 읽어요!", symbol_meanings:[{symbol:"겹받침 읽기", meaning:"한 소리로"},{symbol:"겹받침 쓰기", meaning:"받침 모두 살려"},{symbol:"분위기 느끼기", meaning:"말·장면에서"},{symbol:"분위기 살려 읽기", meaning:"목소리 조절"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑] (쓸 땐 '값')"},{clue:"신나는 시는 어떻게 읽을까요?", emoji:"⚡", name:"밝고 빠르게"},{clue:"겹받침을 쓸 때는?", emoji:"✍️", name:"받침 두 글자를 모두 써요"}], outro:"배운 것을 잘 기억하고 있어요. 바르게 읽고 분위기를 살려 읽어 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["겹받침 낱말을 바르게 읽고 쓸 수 있나요?","시의 분위기를 느낄 수 있나요?","분위기를 살려 읽을 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","겹받침·분위기를 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 겹받침 낱말을 다시 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"두 결 정리", content:"겹받침(지식)과 분위기(감상) 두 결을 함께 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"📚", title:"기억에 남는 활동", content:"\"겹받침·낭송 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"생활 속 적용", content:"책을 읽을 때 겹받침을 바르게 읽은 경험을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"규칙·감상", content:"겹받침 규칙과 분위기 감상을 함께 정리하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"쓸 땐 모두", content:"겹받침은 소리는 하나지만 쓸 땐 모두 살림을 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"💰 겹받침 읽기"},b:{text:"한 소리로"}},{a:{text:"✍️ 겹받침 쓰기"},b:{text:"모두 살려"}},{a:{text:"⚡ 분위기"},b:{text:"목소리 조절"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"더 연습하고 싶은 것을 정해 볼까요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 겹받침·분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 겹받침 낱말과 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·글씨) ---------------- */
  window.LESSONS["u4_l15"] = {
    meta: {grade:2, subject:"국어", unit:4, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 낱말 다시 → 바른 소리 → 낱말↔소리 잇기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"4단원 · 15/15차시 · 마무리"}, suggested_extras:["q_last","t_last"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["겹받침 낱말을 다시 익혀요","바르게 읽어요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_last"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 한 번 더! 🔤", visual:"🔤", question:"닭·값·여덟·앉다·넓다…<br>겹받침 낱말을 바르게 읽고 쓸 수 있나요?"}, suggested_extras:["q_last2","r_last"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 낱말 다지기", content:"겹받침은 읽을 때 **한 소리**, 쓸 때는 **두 글자**! \"닭\"[닥], \"값\"[갑], \"여덟\"[여덜], \"앉다\"[안따], \"넓다\"[널따]를 다시 한번 익혀요. 헷갈리지 않게 잘 기억해요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"'ㄺ'"},{symbol:"값 → [갑]", meaning:"'ㅄ'"},{symbol:"앉다 → [안따]", meaning:"'ㄵ'"},{symbol:"넓다 → [널따]", meaning:"'ㄼ'"}]}, suggested_extras:["t_last2","x_last"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바른 소리는? 🔊", sub:"겹받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"값\"의 바른 소리는?", emoji:"💰", name:"[갑]"},{clue:"\"앉다\"의 바른 소리는?", emoji:"🪑", name:"[안따]"},{clue:"\"넓다\"의 바른 소리는?", emoji:"📐", name:"[널따]"}], outro:"겹받침을 잘 익혔어요. 이제 바르게 써 볼까요? 😊"}, suggested_extras:["q_last3","g_last"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"겹받침 낱말을 또박또박 따라 써 봐요. 받침을 빠뜨리지 않게 **닭 · 값 · 넓다**를 바르게 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"받침 'ㄺ' 모두"},{symbol:"값", meaning:"받침 'ㅄ' 모두"},{symbol:"넓다", meaning:"받침 'ㄼ' 모두"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"4단원에서 배운 것", points:["겹받침을 바르게 읽고 썼어요","시의 분위기를 느꼈어요","분위기를 살려 읽고 글씨를 썼어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"바르고 재미있게!", body:"4단원을 모두 마쳤어요. 앞으로도 낱말을 바르게 읽고 쓰며 시를 분위기 살려 읽어 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_last", type:"fun_question", icon:"💡", title:"기억나는 겹받침", content:"\"가장 기억에 남는 겹받침 낱말은?\" 마무리를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_last", type:"tip", icon:"🧩", title:"다시 다지기", content:"겹받침 낱말을 다시 읽고 쓰며 다지게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_last2", type:"fun_question", icon:"🔤", title:"읽고 쓰기", content:"\"이 낱말들을 바르게 읽고 쓸 수 있나요?\" 자신감을 확인해요.", fit_slides:["motivate"]},
      {id:"r_last", type:"real_world", icon:"🌍", title:"책 속 겹받침", content:"책에서 겹받침 낱말을 찾아 읽어 보게 해요.", fit_slides:["motivate"]},
      {id:"t_last2", type:"tip", icon:"🧩", title:"소리≠표기", content:"소리와 표기가 다름을 마지막으로 한 번 더 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_last", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"소리대로 쓰지 않게, 받침을 모두 살려 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_last3", type:"fun_question", icon:"💡", title:"어떤 소리?", content:"\"이 낱말은 어떤 소리로 읽힐까요?\" 함께 확인해요.", fit_slides:["card_quiz"]},
      {id:"g_last", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"한 소리로 읽혀요.", pairs:[{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"🪑 앉다"},b:{text:"[안따]"}},{a:{text:"📐 넓다"},b:{text:"[널따]"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"받침 모두", content:"받침을 빠뜨리지 않고 또박또박 쓰게 안내하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"겹받침 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"4단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"바르게 읽기", content:"\"오늘 읽는 책에서 겹받침 낱말을 찾아 바르게 읽어 볼까요?\" 실천으로 이어요.", fit_slides:["next_lesson"]}
    ]
  };


})();
