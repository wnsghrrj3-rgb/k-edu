/* ============================================================================
   2학년 1학기 국어 4단원 「분위기를 살려 읽어요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 112~143 / 15차시.
   - 단원 목표: 말과 글을 바르고 재미있게 사용하기. 역량 비판적·창의적 사고.
   - 성취기준 [2국04-02](소리≠표기·겹받침)·[2국05-01](낭송·말의 재미)·[2국02-02](알맞게 띄어 읽기).
   ★ 저작권: 지도서 제재(국어활동 「설문대 할망」·설명글 「쓰레기가 모여 있다고?」·수록 시·노래) 전부 미게재.
      겹받침 낱말은 표준 발음으로 자체 구성. 짧은 시(공놀이·달밤·빗방울)는 보편 소재로 전부 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 소리와 표기가 다른 말 ---------------- */
  window.LESSONS["u4_l01"] = {
    meta: {grade:2, subject:"국어", unit:4, n:1, title:"단원 도입 — 분위기를 살려 읽어요", std:"[2국04-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 쓰는 것과 읽는 소리가 다른 말 → 겹받침이란 → 바른 소리 고르기 → 겹받침 낱말 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽어요", subtitle:"4단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["쓰는 글자와 읽는 소리가 다른 말을 알아봐요","겹받침이 무엇인지 알아봐요","겹받침 낱말을 바르게 읽어 봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"쓸 때와 읽을 때가 달라요? 🤔", visual:"🐔", question:"\"닭\"이라고 쓰지만 읽을 때는 \"[닥]\"이라고 해요.<br>왜 쓰는 것과 읽는 소리가 다를까요?"}, suggested_extras:["q_sound","r_life"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침이 있는 말", content:"받침에 글자가 **두 개** 있는 것을 **겹받침**이라고 해요. \"닭\"은 'ㄺ', \"값\"은 'ㅄ' 받침이에요. 쓸 때는 **두 글자 모두** 쓰지만, 읽을 때는 **한 소리**로 읽어요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"'ㄺ'은 [ㄱ] 소리"},{symbol:"값 → [갑]", meaning:"'ㅄ'은 [ㅂ] 소리"},{symbol:"앉다 → [안따]", meaning:"'ㄵ'은 [ㄴ] 소리"},{symbol:"쓸 땐 두 글자", meaning:"받침을 모두 써요"}]}, suggested_extras:["t_concept","x_write"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽은 것은? 🔤", sub:"겹받침 낱말을 바르게 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"닭\"은 어떻게 읽을까요?", emoji:"🐔", name:"[닥] — 'ㄺ'은 [ㄱ] 소리"},{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑] — 'ㅄ'은 [ㅂ] 소리"},{clue:"\"흙\"은 어떻게 읽을까요?", emoji:"🟤", name:"[흑] — 'ㄺ'은 [ㄱ] 소리"}], outro:"쓸 때는 두 글자, 읽을 때는 한 소리예요. 겹받침 낱말을 더 찾아볼까요? 😊"}, suggested_extras:["q_more","g_sound"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 떠올려요", question:"겹받침이 있는 낱말을 떠올려 볼까요?", items:["받침이 두 글자인 낱말을 본 적 있나요?","'닭'처럼 겹받침이 있는 낱말은 또 무엇이 있을까요?","그 낱말은 어떻게 읽을까요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["쓰는 글자와 읽는 소리가 다를 수 있음을 알았어요","겹받침이 무엇인지 알았어요","겹받침 낱말을 바르게 읽어 봤어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽으면 좋은 점", body:"다음 시간에는 시를 분위기에 맞게 읽으면 무엇이 좋은지 알아볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"받침이 두 개", content:"\"받침에 글자가 두 개 있는 낱말을 본 적 있나요?\" 겹받침을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원은 '겹받침 바르게 읽고 쓰기 + 시 분위기 살려 낭송'이에요. 도입에선 소리≠표기를 흥미롭게 열어 주세요.", fit_slides:["objective","cover"]},
      {id:"q_sound", type:"fun_question", icon:"🐔", title:"왜 다를까", content:"\"왜 쓰는 것과 읽는 소리가 다를까요?\" 호기심을 열어요.", fit_slides:["motivate"]},
      {id:"r_life", type:"real_world", icon:"🌍", title:"생활 속 낱말", content:"닭·값·흙처럼 생활에서 자주 쓰는 겹받침 낱말과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"소리는 하나", content:"겹받침은 쓸 때 두 글자, 읽을 때 한 소리임을 또렷이 짚어 주세요.", fit_slides:["concept"]},
      {id:"x_write", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"읽을 때 한 소리라고 쓸 때 받침을 하나만 쓰지 않게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"q_more", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"겹받침이 있는 낱말이 또 있을까요? (흙·삶)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_sound", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 읽는 소리를 짝지어 보세요.", hint:"어떻게 읽는지 떠올려요.", pairs:[{a:{text:"🐔 닭"},b:{text:"[닥]"}},{a:{text:"💰 값"},b:{text:"[갑]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"가볍게", content:"겹받침 낱말을 자유롭게 떠올려 말하게 해 부담을 줄이세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"소리 내어 읽기", content:"\"떠올린 낱말을 소리 내어 읽어 볼까요?\" 발음을 연습해요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침은 쓸 때와 읽을 때 무엇이 다르죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시를 분위기에 맞게 읽으면 좋은 점을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 분위기를 살려 읽으면 좋은 점 (준비) ---------------- */
  window.LESSONS["u4_l02"] = {
    meta: {grade:2, subject:"국어", unit:4, n:2, title:"분위기를 살려 읽으면 좋은 점을 알아봐요", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 같은 글 다른 목소리 → 분위기란 → 분위기에 맞는 읽기 고르기 → 분위기 떠올리기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 살려 읽으면 좋은 점을 알아봐요", subtitle:"4단원 · 2/15차시 · 준비"}, suggested_extras:["q_mood","t_mood"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기가 무엇인지 알아봐요","분위기를 살려 읽으면 좋은 점을 알아봐요","글의 분위기를 떠올려요"]}, suggested_extras:["t_mood"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"같은 글, 다른 목소리 🎵", visual:"🎵", question:"신나는 시를 조용한 목소리로 읽으면 어떨까요?<br>분위기에 맞게 읽으면 무엇이 좋을까요?"}, suggested_extras:["q_voice","r_mood"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 살려 읽기", content:"**분위기**는 글에서 느껴지는 느낌이에요. 신나는·조용한·포근한 분위기가 있어요. 분위기에 맞게 **목소리·빠르기**를 조절해 읽으면 글의 **느낌이 잘 전해져요**!", symbol_meanings:[{symbol:"신나는 분위기", meaning:"밝고 빠르게"},{symbol:"조용한 분위기", meaning:"천천히 부드럽게"},{symbol:"포근한 분위기", meaning:"따뜻하고 다정하게"},{symbol:"분위기에 맞게", meaning:"느낌이 잘 전해져요"}]}, suggested_extras:["t_mood2","x_same"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 분위기엔 어떤 목소리? 🎵", sub:"분위기에 어울리는 읽기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 운동회 시를 읽는다면?", emoji:"🎉", name:"밝고 빠르게 읽어요"},{clue:"조용한 밤을 그린 시를 읽는다면?", emoji:"🌙", name:"천천히 부드럽게 읽어요"},{clue:"포근한 엄마 품을 그린 시를 읽는다면?", emoji:"🤗", name:"따뜻하고 다정하게 읽어요"}], outro:"분위기에 맞게 읽으니 느낌이 살아나요. 우리도 분위기를 느껴 볼까요? 😊"}, suggested_extras:["q_pick2","g_mood2"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 떠올려요", question:"여러 분위기를 떠올려 볼까요?", items:["신나는 노래를 들으면 어떤 마음인가요?","조용한 밤에는 어떤 느낌이 드나요?","분위기에 맞게 읽으면 무엇이 좋을까요?"]}, suggested_extras:["t_present2","e_mood2"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기가 무엇인지 알았어요","분위기를 살려 읽으면 좋은 점을 알았어요","여러 분위기를 떠올렸어요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 읽고 써요", body:"다음 시간에는 겹받침이 있는 낱말을 바르게 읽고 써 볼 거예요!"}, suggested_extras:["e_double2"]}
    ],
    extras: [
      {id:"q_mood", type:"fun_question", icon:"💡", title:"느낌의 차이", content:"\"신나는 노래와 조용한 노래는 느낌이 어떻게 다른가요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood", type:"tip", icon:"🧩", title:"분위기 느끼기", content:"분위기는 글에서 느껴지는 느낌임을 다양한 예로 느끼게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_voice", type:"fun_question", icon:"🎵", title:"목소리 바꾸기", content:"\"분위기에 따라 목소리를 어떻게 바꾸면 좋을까요?\" 낭송을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_mood", type:"real_world", icon:"🌍", title:"노래·이야기", content:"노래·이야기를 분위기에 맞게 들은 경험과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_mood2", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 맞게 목소리와 빠르기를 조절함을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_same", type:"misconception", icon:"❓", title:"한 가지로만 읽지 않기", content:"모든 글을 똑같은 목소리로 읽지 않게, 분위기에 맞게 바꾸게 하세요.", fit_slides:["concept"]},
      {id:"q_pick2", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"왜 그렇게 읽으면 좋을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_mood2", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽기 짝짓기", description:"분위기와 어울리는 읽기를 짝지어 보세요.", hint:"느낌에 맞는 목소리를 골라요.", pairs:[{a:{text:"🎉 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 조용한"},b:{text:"천천히 부드럽게"}},{a:{text:"🤗 포근한"},b:{text:"따뜻하게"}}], fit_slides:["card_quiz"]},
      {id:"t_present2", type:"tip", icon:"🗣", title:"느낌 나누기", content:"여러 분위기에서 드는 느낌을 자유롭게 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood2", type:"extension", icon:"⬆", title:"몸으로 표현", content:"\"분위기를 몸짓으로 표현해 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기를 살려 읽으면 무엇이 좋죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_double2", type:"extension", icon:"⬆", title:"겹받침 예고", content:"\"다음엔 겹받침 낱말을 읽고 써요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 겹받침 낱말 읽고 쓰기 ① (ㄺ) ---------------- */
  window.LESSONS["u4_l03"] = {
    meta: {grade:2, subject:"국어", unit:4, n:3, title:"겹받침이 있는 낱말을 읽고 써요 ①", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄺ 받침 → [ㄱ] 소리 → 바른 소리 고르기 → 겹받침 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침이 있는 낱말을 읽고 써요", subtitle:"4단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_double3","t_double3"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["'ㄺ' 받침의 소리를 알아봐요","겹받침 낱말을 바르게 읽어요","겹받침 낱말을 바르게 써요"]}, suggested_extras:["t_double3"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"'ㄺ'은 어떤 소리? 🐔", visual:"🐔", question:"\"닭\" \"흙\" \"읽다\"에는 'ㄺ' 받침이 있어요.<br>이 낱말들은 어떤 소리로 읽을까요?"}, suggested_extras:["q_rk3","r_double3"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"'ㄺ' 받침의 소리", content:"받침 **'ㄺ'**은 읽을 때 보통 **[ㄱ]** 소리가 나요. \"닭→[닥]\" \"흙→[흑]\" \"읽다→[익따]\"처럼요. 하지만 **쓸 때는** 'ㄺ' 두 글자를 모두 써야 해요!", symbol_meanings:[{symbol:"닭 → [닥]", meaning:"'ㄺ'→[ㄱ]"},{symbol:"흙 → [흑]", meaning:"'ㄺ'→[ㄱ]"},{symbol:"읽다 → [익따]", meaning:"'ㄺ'→[ㄱ]"},{symbol:"맑다 → [막따]", meaning:"'ㄺ'→[ㄱ]"}]}, suggested_extras:["t_rk3","x_rk3"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽은 것은? 🔤", sub:"'ㄺ' 받침 낱말을 바르게 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"읽다\"는 어떻게 읽을까요?", emoji:"📖", name:"[익따]"},{clue:"\"맑다\"는 어떻게 읽을까요?", emoji:"☀️", name:"[막따]"},{clue:"\"흙\"은 어떻게 읽을까요?", emoji:"🟤", name:"[흑]"}], outro:"'ㄺ'은 [ㄱ] 소리로 읽어요. 이제 바르게 써 볼까요? 😊"}, suggested_extras:["q_rk3b","g_rk3"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 바르게 써요 ✍️", content:"읽을 때는 [ㄱ] 소리지만 **쓸 때는 'ㄺ'** 두 글자를 모두 써요. 네모 칸에 맞춰 **닭 · 흙 · 읽다**를 또박또박 써 보세요!", symbol_meanings:[{symbol:"닭", meaning:"'ㄺ' 받침을 모두"},{symbol:"흙", meaning:"'ㄺ' 받침을 모두"},{symbol:"읽다", meaning:"'ㄺ' 받침을 모두"}]}, suggested_extras:["t_trace3","e_more3"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["'ㄺ' 받침은 [ㄱ] 소리임을 알았어요","겹받침 낱말을 바르게 읽었어요","겹받침 낱말을 바르게 썼어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"또 다른 겹받침을 읽고 써요", body:"다음 시간에는 'ㄵ' 'ㄼ' 같은 또 다른 겹받침 낱말을 읽고 써 볼 거예요!"}, suggested_extras:["e_double3"]}
    ],
    extras: [
      {id:"q_double3", type:"fun_question", icon:"💡", title:"겹받침 낱말", content:"\"'닭'처럼 받침이 두 글자인 낱말을 더 알고 있나요?\" 겹받침을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_double3", type:"tip", icon:"🧩", title:"소리와 표기", content:"읽는 소리와 쓰는 표기가 다름을 거듭 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_rk3", type:"fun_question", icon:"🐔", title:"어떤 소리?", content:"\"'ㄺ' 받침은 어떤 소리로 읽을까요?\" 소리를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_double3", type:"real_world", icon:"🌍", title:"자주 쓰는 말", content:"닭·흙처럼 일상에서 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_rk3", type:"tip", icon:"🧩", title:"[ㄱ] 소리", content:"'ㄺ' 받침이 [ㄱ]으로 소리 남을 여러 낱말로 익히게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_rk3", type:"misconception", icon:"❓", title:"받침 모두 쓰기", content:"읽을 때 [ㄱ]이라고 쓸 때 'ㄱ'만 쓰지 않게, 'ㄺ'을 모두 쓰게 하세요.", fit_slides:["concept"]},
      {id:"q_rk3b", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"'ㄺ' 받침 낱말이 또 있을까요? (밝다·낡다)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_rk3", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"'ㄺ' 받침 낱말과 소리를 짝지어 보세요.", hint:"[ㄱ] 소리를 떠올려요.", pairs:[{a:{text:"📖 읽다"},b:{text:"[익따]"}},{a:{text:"☀️ 맑다"},b:{text:"[막따]"}},{a:{text:"🟤 흙"},b:{text:"[흑]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace3", type:"tip", icon:"✍️", title:"받침 모두", content:"쓸 때 'ㄺ' 두 글자를 모두 쓰도록 또박또박 따라 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more3", type:"extension", icon:"⬆", title:"문장으로", content:"\"'닭'으로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"'ㄺ' 받침은 어떤 소리죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_double3", type:"extension", icon:"⬆", title:"다른 겹받침 예고", content:"\"다음엔 'ㄵ' 'ㄼ' 겹받침을 배워요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 4차시: 겹받침 낱말 읽고 쓰기 ② (ㄵ·ㄼ) ---------------- */
  window.LESSONS["u4_l04"] = {
    meta: {grade:2, subject:"국어", unit:4, n:4, title:"겹받침이 있는 낱말을 읽고 써요 ②", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — ㄵ→[ㄴ]·ㄼ→[ㄹ] → 바른 소리 → 바르게 쓴 낱말 고르기 → 겹받침 낱말 따라 쓰기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침이 있는 낱말을 읽고 써요", subtitle:"4단원 · 4/15차시 · 소단원 1"}, suggested_extras:["q_recall4","t_double4"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["'ㄵ' 'ㄼ' 받침의 소리를 알아봐요","겹받침 낱말을 바르게 읽어요","바르게 쓴 낱말을 찾아 써요"]}, suggested_extras:["t_double4"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"'앉다'는 어떻게 읽을까? 🪑", visual:"🪑", question:"\"앉다\"는 'ㄵ' 받침, \"넓다\"는 'ㄼ' 받침이에요.<br>이 낱말들은 어떤 소리로 읽을까요?"}, suggested_extras:["q_nj4","r_double4"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"'ㄵ'·'ㄼ' 받침의 소리", content:"받침 **'ㄵ'**은 **[ㄴ]**, **'ㄼ'**은 보통 **[ㄹ]** 소리가 나요. \"앉다→[안따]\" \"많다→[만타]\" \"넓다→[널따]\"처럼요. 쓸 때는 받침 **두 글자 모두** 써요!", symbol_meanings:[{symbol:"앉다 → [안따]", meaning:"'ㄵ'→[ㄴ]"},{symbol:"많다 → [만타]", meaning:"'ㄵ'→[ㄴ]"},{symbol:"넓다 → [널따]", meaning:"'ㄼ'→[ㄹ]"},{symbol:"여덟 → [여덜]", meaning:"'ㄼ'→[ㄹ]"}]}, suggested_extras:["t_nj4","x_nj4"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 쓴 낱말은? ✅", sub:"소리를 듣고 바르게 쓴 낱말을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"[안따]라고 소리 나는 낱말은?", emoji:"🪑", name:"앉다 ('ㄵ' 받침)"},{clue:"[널따]라고 소리 나는 낱말은?", emoji:"📏", name:"넓다 ('ㄼ' 받침)"},{clue:"[만타]라고 소리 나는 낱말은?", emoji:"➕", name:"많다 ('ㄵ' 받침)"}], outro:"소리는 하나지만 쓸 때는 받침을 모두 써요. 따라 써 볼까요? 😊"}, suggested_extras:["q_nj4b","g_nj4"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"겹받침 낱말을 바르게 써요 ✍️", content:"소리에 이끌려 받침을 빠뜨리지 않게, **두 글자 모두** 써요. 네모 칸에 맞춰 **앉다 · 많다 · 넓다**를 또박또박 써 보세요!", symbol_meanings:[{symbol:"앉다", meaning:"'ㄵ' 받침을 모두"},{symbol:"많다", meaning:"'ㄵ' 받침을 모두"},{symbol:"넓다", meaning:"'ㄼ' 받침을 모두"}]}, suggested_extras:["t_trace4","e_more4"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ] 소리임을 알았어요","겹받침 낱말을 바르게 읽었어요","바르게 쓴 낱말을 찾아 썼어요"]}, suggested_extras:["q_reflect4"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"겹받침 낱말을 정리해요", body:"다음 시간에는 여러 겹받침 낱말을 모아 읽고 쓰며 정리해 볼 거예요!"}, suggested_extras:["e_double4"]}
    ],
    extras: [
      {id:"q_recall4", type:"fun_question", icon:"💡", title:"지난 겹받침", content:"\"지난 시간에 배운 'ㄺ' 받침, 어떻게 읽었죠?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_double4", type:"tip", icon:"🧩", title:"받침마다 소리", content:"겹받침마다 나는 소리가 다름을 정리해 주세요.", fit_slides:["objective","concept"]},
      {id:"q_nj4", type:"fun_question", icon:"🪑", title:"어떤 소리?", content:"\"'앉다'는 어떤 소리로 읽을까요?\" 소리를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_double4", type:"real_world", icon:"🌍", title:"자주 쓰는 말", content:"앉다·많다·넓다처럼 자주 쓰는 낱말과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_nj4", type:"tip", icon:"🧩", title:"소리 구분", content:"'ㄵ'→[ㄴ], 'ㄼ'→[ㄹ] 소리를 낱말로 익히게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_nj4", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"소리만 듣고 받침을 하나만 쓰지 않게 안내하세요.", fit_slides:["concept"]},
      {id:"q_nj4b", type:"fun_question", icon:"💡", title:"또 어떤 낱말?", content:"\"'ㄵ' 'ㄼ' 받침 낱말이 또 있을까요? (얹다·짧다)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_nj4", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침 소리를 떠올려요.", pairs:[{a:{text:"🪑 앉다"},b:{text:"[안따]"}},{a:{text:"📏 넓다"},b:{text:"[널따]"}},{a:{text:"➕ 많다"},b:{text:"[만타]"}}], fit_slides:["card_quiz"]},
      {id:"t_trace4", type:"tip", icon:"✍️", title:"받침 모두", content:"쓸 때 겹받침 두 글자를 모두 쓰도록 또박또박 따라 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more4", type:"extension", icon:"⬆", title:"문장으로", content:"\"'앉다'로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect4", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"'ㄵ' 'ㄼ' 받침은 어떤 소리죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_double4", type:"extension", icon:"⬆", title:"정리 예고", content:"\"다음엔 겹받침 낱말을 모아 정리해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 5차시: 겹받침 낱말 읽고 쓰기 ③ (정리) ---------------- */
  window.LESSONS["u4_l05"] = {
    meta: {grade:2, subject:"국어", unit:4, n:5, title:"겹받침이 있는 낱말을 읽고 써요 ③", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 모으기 → 소리와 표기 정리 → 낱말↔소리 잇기 → 겹받침 낱말 소리 내어 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침이 있는 낱말을 읽고 써요", subtitle:"4단원 · 5/15차시 · 소단원 1"}, suggested_extras:["q_sum5","t_sum5"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["여러 겹받침 낱말을 모아 봐요","소리와 표기를 정리해요","겹받침 낱말을 소리 내어 읽어요"]}, suggested_extras:["t_sum5"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 모아 봐요 🗂️", visual:"🗂️", question:"지금까지 배운 겹받침 낱말이 많아요.<br>소리에 따라 모으면 어떻게 나눌 수 있을까요?"}, suggested_extras:["q_group5","r_sum5"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 소리 정리", content:"겹받침은 받침에 따라 소리가 정해져 있어요. **'ㄺ'→[ㄱ]**, **'ㄵ'→[ㄴ]**, **'ㄼ'→[ㄹ]**. 소리는 하나지만 **쓸 때는 두 글자 모두**! 이것만 기억하면 바르게 읽고 쓸 수 있어요.", symbol_meanings:[{symbol:"'ㄺ' → [ㄱ]", meaning:"닭·흙·읽다·맑다"},{symbol:"'ㄵ' → [ㄴ]", meaning:"앉다·많다"},{symbol:"'ㄼ' → [ㄹ]", meaning:"넓다·여덟·짧다"},{symbol:"쓸 땐 모두", meaning:"받침 두 글자"}]}, suggested_extras:["t_sum5b","x_sum5"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"낱말과 소리를 이어 봐요 🔗", sub:"겹받침 낱말의 바른 소리를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"몫\"은 어떻게 읽을까요?", emoji:"🍰", name:"[목] — 'ㄳ'→[ㄱ]"},{clue:"\"짧다\"는 어떻게 읽을까요?", emoji:"📐", name:"[짤따] — 'ㄼ'→[ㄹ]"},{clue:"\"여덟\"은 어떻게 읽을까요?", emoji:"8️⃣", name:"[여덜] — 'ㄼ'→[ㄹ]"}], outro:"겹받침 소리를 잘 정리했어요. 소리 내어 읽어 볼까요? 😊"}, suggested_extras:["q_sum5c","g_sum5"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"겹받침 낱말을 소리 내어 읽어요", question:"겹받침 낱말을 바르게 읽어 볼까요?", items:["'ㄺ' 받침 낱말을 읽어 볼까요?","'ㄵ' 'ㄼ' 받침 낱말도 읽어 볼까요?","읽을 때 어떤 점을 조심해야 하나요?"]}, suggested_extras:["t_present5","e_read5"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["여러 겹받침 낱말을 모았어요","소리와 표기를 정리했어요","겹받침 낱말을 소리 내어 읽었어요"]}, suggested_extras:["q_reflect5"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글에서 겹받침 낱말을 찾아요", body:"다음 시간에는 글을 읽으며 겹받침 낱말을 찾아 바르게 읽어 볼 거예요!"}, suggested_extras:["e_read5b"]}
    ],
    extras: [
      {id:"q_sum5", type:"fun_question", icon:"💡", title:"배운 겹받침", content:"\"지금까지 배운 겹받침을 떠올려 볼까요?\" 정리를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_sum5", type:"tip", icon:"🧩", title:"소리별 정리", content:"받침별 소리를 표로 정리하면 한눈에 보여요.", fit_slides:["objective","concept"]},
      {id:"q_group5", type:"fun_question", icon:"🗂️", title:"어떻게 나눌까", content:"\"소리에 따라 겹받침을 어떻게 나눌 수 있을까요?\" 분류를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_sum5", type:"real_world", icon:"🌍", title:"낱말 모으기", content:"교과서·책에서 겹받침 낱말을 찾아 모아 보게 해요.", fit_slides:["motivate"]},
      {id:"t_sum5b", type:"tip", icon:"🧩", title:"규칙 기억", content:"'ㄺ→ㄱ·ㄵ→ㄴ·ㄼ→ㄹ' 규칙을 거듭 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_sum5", type:"misconception", icon:"❓", title:"쓸 땐 모두", content:"소리가 하나라고 쓸 때 받침을 하나만 쓰지 않게 다시 강조하세요.", fit_slides:["concept"]},
      {id:"q_sum5c", type:"fun_question", icon:"💡", title:"무슨 소리?", content:"\"이 낱말은 어떤 소리로 읽을까요?\" 함께 읽어요.", fit_slides:["card_quiz"]},
      {id:"g_sum5", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침 규칙을 떠올려요.", pairs:[{a:{text:"🍰 몫"},b:{text:"[목]"}},{a:{text:"📐 짧다"},b:{text:"[짤따]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}}], fit_slides:["card_quiz"]},
      {id:"t_present5", type:"tip", icon:"🗣", title:"소리 내어", content:"겹받침 낱말을 소리 내어 읽으며 발음을 익히게 하세요.", fit_slides:["question"]},
      {id:"e_read5", type:"extension", icon:"⬆", title:"빠르게 읽기", content:"\"겹받침 낱말을 빠르게 읽어 볼까요?\" 발음을 연습해요.", fit_slides:["question"]},
      {id:"q_reflect5", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"겹받침 소리 규칙을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_read5b", type:"extension", icon:"⬆", title:"글 읽기 예고", content:"\"다음엔 글에서 겹받침 낱말을 찾아요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 6차시: 겹받침 낱말에 주의하며 글 읽기 ① ---------------- */
  window.LESSONS["u4_l06"] = {
    meta: {grade:2, subject:"국어", unit:4, n:6, title:"겹받침 낱말에 주의하며 글을 읽어요 ①", std:"[2국04-02] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 글 속 겹받침 → 바르게 읽기 → 글에서 겹받침 모두 찾기 → 한 줄씩 읽기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말에 주의하며 글을 읽어요", subtitle:"4단원 · 6/15차시 · 소단원 1"}, suggested_extras:["q_read6","t_read6"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["글 속 겹받침 낱말을 찾아요","겹받침 낱말을 바르게 읽어요","글을 알맞게 띄어 읽어요"]}, suggested_extras:["t_read6"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글 속에 숨은 겹받침 🔍", visual:"📖", question:"\"맑은 하늘 아래 닭이 흙을 밟고 걷는다.\"<br>이 문장에서 겹받침 낱말을 찾을 수 있나요?"}, suggested_extras:["q_find6","r_read6"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"글에서 겹받침 바르게 읽기", content:"글을 읽을 땐 겹받침 낱말을 **바른 소리**로 읽어요. \"맑은→[말근]\" \"닭이→[달기]\" \"밟고→[밥꼬]\"처럼요. 받침 뒤에 모음이 오면 받침 소리가 **이어져** 나기도 해요!", symbol_meanings:[{symbol:"맑은 → [말근]", meaning:"받침이 이어져요"},{symbol:"닭이 → [달기]", meaning:"받침이 이어져요"},{symbol:"읽어 → [일거]", meaning:"받침이 이어져요"},{symbol:"바르게 읽기", meaning:"뜻이 잘 통해요"}]}, suggested_extras:["t_read6b","x_read6"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"글 속 겹받침을 찾아요 🔍", sub:"문장 속 겹받침 낱말을 찾아봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 하늘이 넓다.\"에서 겹받침은?", emoji:"☀️", name:"맑은·넓다"},{clue:"\"닭이 흙을 밟는다.\"에서 겹받침은?", emoji:"🐔", name:"닭·흙·밟는다"},{clue:"\"책을 읽고 앉다.\"에서 겹받침은?", emoji:"📖", name:"읽고·앉다"}], outro:"글 속에 겹받침이 이렇게 많아요. 바르게 읽어 볼까요? 😊"}, suggested_extras:["q_find6b","g_read6"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"글을 바르게 읽어요", question:"겹받침 낱말에 주의하며 읽어 볼까요?", items:["어떤 겹받침 낱말을 찾았나요?","그 낱말을 바르게 읽어 볼까요?","읽을 때 어떤 점을 조심했나요?"]}, suggested_extras:["t_present6","e_read6"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["글 속 겹받침 낱말을 찾았어요","겹받침 낱말을 바르게 읽었어요","글을 알맞게 읽었어요"]}, suggested_extras:["q_reflect6"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"글을 더 읽고 내용을 알아요", body:"다음 시간에는 겹받침 낱말이 든 글을 더 읽으며 내용을 이해해 볼 거예요!"}, suggested_extras:["e_read6b"]}
    ],
    extras: [
      {id:"q_read6", type:"fun_question", icon:"💡", title:"글 속 겹받침", content:"\"글을 읽을 때 겹받침 낱말을 만난 적 있나요?\" 읽기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_read6", type:"tip", icon:"🧩", title:"바른 소리로", content:"글 속 겹받침을 바른 소리로 읽도록 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_find6", type:"fun_question", icon:"📖", title:"찾아보기", content:"\"이 문장에서 겹받침 낱말은 무엇일까요?\" 함께 찾아요.", fit_slides:["motivate"]},
      {id:"r_read6", type:"real_world", icon:"🌍", title:"책 읽기", content:"책을 소리 내어 읽을 때 겹받침을 만난 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read6b", type:"tip", icon:"🧩", title:"이어 나는 소리", content:"받침 뒤 모음이 오면 받침 소리가 이어져 남을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read6", type:"misconception", icon:"❓", title:"천천히 정확히", content:"빨리 읽다 겹받침을 틀리지 않게, 천천히 정확히 읽게 하세요.", fit_slides:["concept"]},
      {id:"q_find6b", type:"fun_question", icon:"💡", title:"몇 개일까", content:"\"이 문장에 겹받침 낱말이 몇 개일까요?\" 함께 세어요.", fit_slides:["card_quiz"]},
      {id:"g_read6", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"글 속 겹받침 낱말과 소리를 짝지어 보세요.", hint:"이어 나는 소리를 떠올려요.", pairs:[{a:{text:"☀️ 맑은"},b:{text:"[말근]"}},{a:{text:"🐔 닭이"},b:{text:"[달기]"}},{a:{text:"📖 읽어"},b:{text:"[일거]"}}], fit_slides:["card_quiz"]},
      {id:"t_present6", type:"tip", icon:"🗣", title:"또박또박", content:"찾은 겹받침 낱말을 또박또박 소리 내어 읽게 하세요.", fit_slides:["question"]},
      {id:"e_read6", type:"extension", icon:"⬆", title:"문장 읽기", content:"\"겹받침이 든 문장을 한 줄씩 읽어 볼까요?\" 읽기를 이어요.", fit_slides:["question"]},
      {id:"q_reflect6", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"글 속 겹받침을 어떻게 읽죠?\" 바른 소리를 짚어요.", fit_slides:["summary"]},
      {id:"e_read6b", type:"extension", icon:"⬆", title:"내용 읽기 예고", content:"\"다음엔 글을 더 읽고 내용을 알아봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 7차시: 겹받침 낱말에 주의하며 글 읽기 ② (내용 이해) ---------------- */
  window.LESSONS["u4_l07"] = {
    meta: {grade:2, subject:"국어", unit:4, n:7, title:"겹받침 낱말에 주의하며 글을 읽어요 ②", std:"[2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 알맞게 띄어 읽기 → 뜻 살려 읽기 → 알맞은 띄어 읽기 고르기 → 글 내용 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"겹받침 낱말에 주의하며 글을 읽어요", subtitle:"4단원 · 7/15차시 · 소단원 1"}, suggested_extras:["q_recall7","t_space7"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["뜻이 드러나게 알맞게 띄어 읽어요","겹받침 낱말을 바르게 읽으며 내용을 알아요","글 내용을 친구와 나눠요"]}, suggested_extras:["t_space7"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"어디서 띄어 읽을까? ✂️", visual:"📖", question:"\"아기가밥을먹는다\"를 어떻게 띄어 읽으면<br>뜻이 잘 드러날까요?"}, suggested_extras:["q_space7","r_space7"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"알맞게 띄어 읽기", content:"글은 **뜻이 잘 드러나게** 띄어 읽어요. 낱말과 낱말 사이, 문장이 끝나면 살짝 쉬어요. \"아기가 / 밥을 / 먹는다\"처럼 띄어 읽으면 뜻이 또렷해요. 겹받침은 **바른 소리**로!", symbol_meanings:[{symbol:"낱말 사이", meaning:"살짝 쉬어요"},{symbol:"문장 끝", meaning:"한 박자 쉬어요"},{symbol:"뜻 살려", meaning:"의미가 또렷하게"},{symbol:"겹받침 바르게", meaning:"정확한 소리로"}]}, suggested_extras:["t_space7b","x_space7"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"알맞게 띄어 읽은 것은? ✅", sub:"뜻이 잘 드러나게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"맑은 하늘이 넓다\"를 읽으면?", emoji:"☀️", name:"\"맑은 / 하늘이 / 넓다\""},{clue:"\"닭이 흙을 밟는다\"를 읽으면?", emoji:"🐔", name:"\"닭이 / 흙을 / 밟는다\""},{clue:"이렇게 읽으면 어색해요!", emoji:"🙅", name:"\"맑은하늘이넓다\" (다 붙여 읽기)"}], outro:"알맞게 띄어 읽으니 뜻이 또렷해요. 글 내용을 나눠 볼까요? 😊"}, suggested_extras:["q_space7b","g_space7"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"글 내용을 나눠요", question:"글을 읽고 내용을 이야기해 볼까요?", items:["글은 무엇에 대한 이야기인가요?","어떤 겹받침 낱말이 나왔나요?","알맞게 띄어 읽으니 어떤가요?"]}, suggested_extras:["t_present7","e_read7"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["뜻이 드러나게 알맞게 띄어 읽었어요","겹받침 낱말을 바르게 읽으며 내용을 알았어요","글 내용을 나눴어요"]}, suggested_extras:["q_reflect7"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시의 분위기를 살펴봐요", body:"다음 시간에는 시를 읽으며 어떤 분위기인지 살펴볼 거예요!"}, suggested_extras:["e_mood7"]}
    ],
    extras: [
      {id:"q_recall7", type:"fun_question", icon:"💡", title:"지난 읽기", content:"\"지난 시간에 어떤 겹받침 낱말을 읽었나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_space7", type:"tip", icon:"🧩", title:"띄어 읽기", content:"낱말 사이·문장 끝에서 알맞게 쉬어 읽게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_space7", type:"fun_question", icon:"📖", title:"어디서 쉴까", content:"\"어디서 띄어 읽으면 뜻이 잘 드러날까요?\" 띄어 읽기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_space7", type:"real_world", icon:"🌍", title:"읽어 주기", content:"누군가 책을 읽어 줄 때 듣기 좋았던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_space7b", type:"tip", icon:"🧩", title:"뜻 살려", content:"띄어 읽기가 뜻을 또렷하게 함을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_space7", type:"misconception", icon:"❓", title:"다 붙여 읽기 주의", content:"쉬지 않고 다 붙여 읽으면 뜻이 흐려져요. 알맞게 쉬게 하세요.", fit_slides:["concept"]},
      {id:"q_space7b", type:"fun_question", icon:"💡", title:"왜 또렷할까", content:"\"왜 띄어 읽으면 뜻이 또렷할까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_space7", type:"game", game_kind:"memory_match", icon:"🎮", title:"문장 ↔ 띄어 읽기 짝짓기", description:"문장과 알맞은 띄어 읽기를 짝지어 보세요.", hint:"뜻이 드러나게 쉬어요.", pairs:[{a:{text:"☀️ 맑은 하늘"},b:{text:"맑은 / 하늘이"}},{a:{text:"🐔 닭이 흙을"},b:{text:"닭이 / 흙을"}},{a:{text:"📖 책을 읽고"},b:{text:"책을 / 읽고"}}], fit_slides:["card_quiz"]},
      {id:"t_present7", type:"tip", icon:"🗣", title:"내용 나누기", content:"글 내용을 자기 말로 간추려 말하게 하세요.", fit_slides:["question"]},
      {id:"e_read7", type:"extension", icon:"⬆", title:"다시 읽기", content:"\"이번엔 더 또박또박 읽어 볼까요?\" 읽기를 다듬어요.", fit_slides:["question"]},
      {id:"q_reflect7", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"알맞게 띄어 읽으면 무엇이 좋죠?\" 뜻을 짚어요.", fit_slides:["summary"]},
      {id:"e_mood7", type:"extension", icon:"⬆", title:"분위기 예고", content:"\"다음엔 시의 분위기를 살펴봐요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 8차시: 시의 분위기 살펴보기 ① ---------------- */
  window.LESSONS["u4_l08"] = {
    meta: {grade:2, subject:"국어", unit:4, n:8, title:"시의 분위기를 살펴봐요 ①", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 시 속 분위기 → 말·장면으로 느끼기 → 분위기 고르기 → 분위기 말하기 (자체 동시 「공놀이」)"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 8/15차시 · 소단원 2"}, suggested_extras:["q_mood8","t_mood8"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시에서 느껴지는 분위기를 알아봐요","말과 장면으로 분위기를 느껴요","시의 분위기를 말해 봐요"]}, suggested_extras:["t_mood8"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"신나는 공놀이 ⚽", visual:"⚽", question:"\"통통 공이 / 콩콩 뛰어요 / 친구들과 / 깔깔 웃어요\"<br>이 시는 어떤 분위기인가요?"}, suggested_extras:["q_feel8","r_mood8"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"말과 장면으로 분위기 느끼기", content:"시의 분위기는 **쓰인 말**과 **장면**에서 느껴져요. \"통통·콩콩·깔깔\" 같은 밝은 말과 친구들이 노는 장면에서 **신나는 분위기**가 느껴지죠. 말과 장면을 보면 분위기를 알 수 있어요!", symbol_meanings:[{symbol:"밝은 말", meaning:"통통·콩콩·깔깔"},{symbol:"노는 장면", meaning:"친구들과 공놀이"},{symbol:"신나는 분위기", meaning:"즐겁고 활기차요"},{symbol:"말+장면", meaning:"분위기를 느껴요"}]}, suggested_extras:["t_mood8b","x_mood8"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시는 어떤 분위기? 🎵", sub:"시의 말과 장면을 보고 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"통통 콩콩 깔깔\" 공놀이 시는?", emoji:"⚽", name:"신나는 분위기"},{clue:"\"달님이 살며시 창가에 앉아요\" 시는?", emoji:"🌙", name:"조용하고 포근한 분위기"},{clue:"\"빗방울이 톡톡 창을 두드려요\" 시는?", emoji:"🌧️", name:"잔잔하고 정겨운 분위기"}], outro:"말과 장면을 보니 분위기가 느껴져요. 시의 분위기를 말해 볼까요? 😊"}, suggested_extras:["q_pick8","g_mood8"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"시의 분위기를 말해요", question:"시를 읽고 분위기를 느껴 볼까요?", items:["이 시는 어떤 분위기인가요?","어떤 말에서 그 분위기가 느껴지나요?","어떤 장면이 떠오르나요?"]}, suggested_extras:["t_present8","e_mood8"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시에서 느껴지는 분위기를 알았어요","말과 장면으로 분위기를 느꼈어요","시의 분위기를 말했어요"]}, suggested_extras:["q_reflect8"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"여러 시의 분위기를 느껴요", body:"다음 시간에는 여러 시를 읽으며 다양한 분위기를 느껴 볼 거예요!"}, suggested_extras:["e_mood8b"]}
    ],
    extras: [
      {id:"q_mood8", type:"fun_question", icon:"💡", title:"시의 느낌", content:"\"시를 읽으면 어떤 느낌이 드나요?\" 분위기를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_mood8", type:"tip", icon:"🧩", title:"말과 장면", content:"분위기를 쓰인 말과 떠오르는 장면에서 찾게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_feel8", type:"fun_question", icon:"⚽", title:"어떤 분위기", content:"\"이 시는 어떤 느낌인가요?\" 분위기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_mood8", type:"real_world", icon:"🌍", title:"공놀이 경험", content:"친구들과 공놀이한 즐거운 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_mood8b", type:"tip", icon:"🧩", title:"흉내말 단서", content:"통통·콩콩 같은 흉내말이 분위기 단서가 됨을 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_mood8", type:"misconception", icon:"❓", title:"정답은 하나 아니에요", content:"분위기 느낌은 사람마다 조금씩 다를 수 있음을 인정하세요.", fit_slides:["concept"]},
      {id:"q_pick8", type:"fun_question", icon:"💡", title:"왜 그럴까", content:"\"왜 그런 분위기가 느껴질까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_mood8", type:"game", game_kind:"memory_match", icon:"🎮", title:"장면 ↔ 분위기 짝짓기", description:"시의 장면과 분위기를 짝지어 보세요.", hint:"말과 장면을 떠올려요.", pairs:[{a:{text:"⚽ 공놀이"},b:{text:"신나는"}},{a:{text:"🌙 달밤"},b:{text:"포근한"}},{a:{text:"🌧️ 빗방울"},b:{text:"잔잔한"}}], fit_slides:["card_quiz"]},
      {id:"t_present8", type:"tip", icon:"🗣", title:"까닭과 함께", content:"분위기를 어떤 말·장면에서 느꼈는지 까닭과 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_mood8", type:"extension", icon:"⬆", title:"장면 그리기", content:"\"시의 장면을 그림으로 그려 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect8", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"시의 분위기는 무엇으로 느끼죠?\" 말·장면을 짚어요.", fit_slides:["summary"]},
      {id:"e_mood8b", type:"extension", icon:"⬆", title:"여러 시 예고", content:"\"다음엔 여러 시의 분위기를 느껴요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 9차시: 시의 분위기 살펴보기 ② ---------------- */
  window.LESSONS["u4_l09"] = {
    meta: {grade:2, subject:"국어", unit:4, n:9, title:"시의 분위기를 살펴봐요 ②", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기 만드는 말 → 밝은 말·고요한 말 → 밝은 말 모으기 → 분위기 표현하기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시의 분위기를 살펴봐요", subtitle:"4단원 · 9/15차시 · 소단원 2"}, suggested_extras:["q_recall9","t_word9"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기를 만드는 말을 알아봐요","밝은 말과 고요한 말을 구분해요","시의 분위기를 표현해요"]}, suggested_extras:["t_word9"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"말이 분위기를 만들어요 ✨", visual:"✨", question:"\"깔깔·신나게·반짝\"과 \"살며시·고요히·조용조용\"<br>두 묶음은 어떤 분위기를 만들까요?"}, suggested_extras:["q_word9","r_word9"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기를 만드는 말", content:"시에 쓰인 **말**이 분위기를 만들어요. \"깔깔·신나게·반짝\" 같은 **밝은 말**은 신나는 분위기를, \"살며시·고요히·조용조용\" 같은 **고요한 말**은 차분한 분위기를 만들어요!", symbol_meanings:[{symbol:"깔깔·신나게", meaning:"신나는 분위기"},{symbol:"반짝·통통", meaning:"밝은 분위기"},{symbol:"살며시·고요히", meaning:"조용한 분위기"},{symbol:"포근히·다정히", meaning:"포근한 분위기"}]}, suggested_extras:["t_word9b","x_word9"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 말은 어떤 분위기? ✨", sub:"말이 만드는 분위기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"깔깔 신나게 반짝\"은?", emoji:"🎉", name:"신나고 밝은 분위기"},{clue:"\"살며시 고요히 조용조용\"은?", emoji:"🌙", name:"조용하고 차분한 분위기"},{clue:"\"포근히 다정히 따뜻하게\"는?", emoji:"🤗", name:"포근하고 정다운 분위기"}], outro:"말이 분위기를 만들어요. 밝은 말을 더 모아 볼까요? 😊"}, suggested_extras:["q_word9c","g_word9"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"분위기를 표현해요", question:"분위기를 만드는 말을 떠올려 볼까요?", items:["신나는 분위기를 만드는 말은?","조용한 분위기를 만드는 말은?","그 말을 넣어 짧은 시구를 만들 수 있을까요?"]}, suggested_extras:["t_present9","e_word9"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기를 만드는 말을 알았어요","밝은 말과 고요한 말을 구분했어요","시의 분위기를 표현했어요"]}, suggested_extras:["q_reflect9"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"분위기를 살려 읽어요", body:"다음 시간에는 시의 분위기에 맞게 목소리를 조절하며 소리 내어 읽어 볼 거예요!"}, suggested_extras:["e_read9"]}
    ],
    extras: [
      {id:"q_recall9", type:"fun_question", icon:"💡", title:"지난 분위기", content:"\"지난 시간에 본 시는 어떤 분위기였나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_word9", type:"tip", icon:"🧩", title:"말의 힘", content:"쓰인 말이 분위기를 만든다는 점을 짚어 주세요.", fit_slides:["objective","concept"]},
      {id:"q_word9", type:"fun_question", icon:"✨", title:"어떤 분위기", content:"\"두 말 묶음은 어떤 분위기를 만들까요?\" 분위기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_word9", type:"real_world", icon:"🌍", title:"노래 가사", content:"신나는 노래·잔잔한 노래의 가사 느낌과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_word9b", type:"tip", icon:"🧩", title:"말 묶음", content:"밝은 말·고요한 말을 묶어 분위기와 연결하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_word9", type:"misconception", icon:"❓", title:"느낌은 다양", content:"같은 말도 사람마다 느낌이 조금 다를 수 있음을 인정하세요.", fit_slides:["concept"]},
      {id:"q_word9c", type:"fun_question", icon:"💡", title:"또 어떤 말?", content:"\"신나는 분위기 말을 더 떠올려 볼까요?\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_word9", type:"game", game_kind:"memory_match", icon:"🎮", title:"말 ↔ 분위기 짝짓기", description:"말과 만드는 분위기를 짝지어 보세요.", hint:"말의 느낌을 떠올려요.", pairs:[{a:{text:"🎉 깔깔·반짝"},b:{text:"신나는"}},{a:{text:"🌙 살며시"},b:{text:"조용한"}},{a:{text:"🤗 포근히"},b:{text:"포근한"}}], fit_slides:["card_quiz"]},
      {id:"t_present9", type:"tip", icon:"🗣", title:"말 떠올리기", content:"분위기별 말을 자유롭게 떠올려 모으게 하세요.", fit_slides:["question"]},
      {id:"e_word9", type:"extension", icon:"⬆", title:"시구 만들기", content:"\"그 말을 넣어 짧은 시구를 만들어 볼까요?\" 표현을 넓혀요.", fit_slides:["question"]},
      {id:"q_reflect9", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기는 무엇이 만들죠?\" 말을 짚어요.", fit_slides:["summary"]},
      {id:"e_read9", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 분위기를 살려 소리 내어 읽어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 10차시: 분위기 생각하며 소리 내어 읽기 ① ---------------- */
  window.LESSONS["u4_l10"] = {
    meta: {grade:2, subject:"국어", unit:4, n:10, title:"분위기를 생각하며 소리 내어 읽어요 ①", std:"[2국02-02] · [2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 분위기별 읽기 → 목소리·빠르기 조절 → 어울리는 읽기 고르기 → 분위기 살려 낭송"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 10/15차시 · 소단원 2"}, suggested_extras:["q_read10","t_read10"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["분위기에 맞게 목소리를 조절해요","빠르기를 조절하며 읽어요","분위기를 살려 시를 낭송해요"]}, suggested_extras:["t_read10"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"분위기에 목소리를 맞춰요 🎤", visual:"🎤", question:"신나는 시는 밝고 빠르게, 조용한 시는 천천히 부드럽게!<br>분위기에 맞게 어떻게 읽으면 좋을까요?"}, suggested_extras:["q_voice10","r_read10"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"분위기에 맞게 읽기", content:"시를 낭송할 땐 분위기에 맞게 **목소리**와 **빠르기**를 조절해요. 신나는 시는 **밝고 빠르게**, 조용한 시는 **천천히 부드럽게** 읽어요. 그러면 시의 느낌이 **생생하게** 전해져요!", symbol_meanings:[{symbol:"신나는 시", meaning:"밝고 빠르게"},{symbol:"조용한 시", meaning:"천천히 부드럽게"},{symbol:"포근한 시", meaning:"다정하고 따뜻하게"},{symbol:"띄어 읽기", meaning:"뜻 살려 알맞게"}]}, suggested_extras:["t_read10b","x_read10"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 시엔 어떤 읽기? 🎤", sub:"분위기에 어울리는 읽기를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"신나는 공놀이 시는?", emoji:"⚽", name:"밝고 빠르게, 힘차게 읽어요"},{clue:"조용한 달밤 시는?", emoji:"🌙", name:"천천히 부드럽게 읽어요"},{clue:"잔잔한 빗방울 시는?", emoji:"🌧️", name:"또박또박 정겹게 읽어요"}], outro:"분위기에 맞게 읽으니 시가 살아나요. 직접 낭송해 볼까요? 😊"}, suggested_extras:["q_pick10","g_read10"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"분위기를 살려 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 시의 분위기에 맞게 목소리를 조절해 낭송해 봐요!", count:24, hint:"신나는 시는 밝고 빠르게, 조용한 시는 천천히 부드럽게 읽어 봐요", end_msg:"모두 분위기를 멋지게 살려 낭송했어요! 👏"}, suggested_extras:["t_present10","e_read10"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["분위기에 맞게 목소리를 조절했어요","빠르기를 조절하며 읽었어요","분위기를 살려 낭송했어요"]}, suggested_extras:["q_reflect10"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낭송을 더 연습해요", body:"다음 시간에는 알맞게 띄어 읽으며 분위기를 살려 낭송을 더 연습해 볼 거예요!"}, suggested_extras:["e_read10b"]}
    ],
    extras: [
      {id:"q_read10", type:"fun_question", icon:"💡", title:"목소리 바꾸기", content:"\"분위기에 따라 목소리를 어떻게 바꿀까요?\" 낭송을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_read10", type:"tip", icon:"🧩", title:"목소리·빠르기", content:"분위기에 맞게 목소리·빠르기를 조절하게 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_voice10", type:"fun_question", icon:"🎤", title:"어떻게 읽을까", content:"\"이 시는 어떤 목소리로 읽으면 좋을까요?\" 낭송을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read10", type:"real_world", icon:"🌍", title:"노래 부르기", content:"노래를 분위기에 맞게 불러 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read10b", type:"tip", icon:"🧩", title:"느낌 살려", content:"목소리·빠르기·띄어 읽기로 느낌을 살리게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read10", type:"misconception", icon:"❓", title:"한 가지로만 읽지 않기", content:"모든 시를 같은 목소리로 읽지 않게 분위기에 맞추게 하세요.", fit_slides:["concept"]},
      {id:"q_pick10", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"왜 그렇게 읽으면 좋을까요?\" 까닭을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read10", type:"game", game_kind:"memory_match", icon:"🎮", title:"분위기 ↔ 읽기 짝짓기", description:"분위기와 어울리는 읽기를 짝지어 보세요.", hint:"느낌에 맞는 읽기를 골라요.", pairs:[{a:{text:"⚽ 신나는"},b:{text:"밝고 빠르게"}},{a:{text:"🌙 조용한"},b:{text:"천천히 부드럽게"}},{a:{text:"🌧️ 잔잔한"},b:{text:"또박또박 정겹게"}}], fit_slides:["card_quiz"]},
      {id:"t_present10", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고, 듣는 친구는 바른 자세로 듣게 하세요.", fit_slides:["present"]},
      {id:"e_read10", type:"extension", icon:"⬆", title:"몸짓 더하기", content:"\"낭송에 어울리는 몸짓을 더해 볼까요?\" 표현을 넓혀요.", fit_slides:["present"]},
      {id:"q_reflect10", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"분위기에 맞게 어떻게 읽죠?\" 목소리·빠르기를 짚어요.", fit_slides:["summary"]},
      {id:"e_read10b", type:"extension", icon:"⬆", title:"낭송 연습 예고", content:"\"다음엔 낭송을 더 연습해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 11차시: 분위기 생각하며 소리 내어 읽기 ② ---------------- */
  window.LESSONS["u4_l11"] = {
    meta: {grade:2, subject:"국어", unit:4, n:11, title:"분위기를 생각하며 소리 내어 읽어요 ②", std:"[2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 띄어 읽기 더하기 → 좋은 낭송 → 알맞은 낭송 모으기 → 짝과 낭송 연습"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"분위기를 생각하며 소리 내어 읽어요", subtitle:"4단원 · 11/15차시 · 소단원 2"}, suggested_extras:["q_recall11","t_read11"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["알맞게 띄어 읽으며 낭송해요","좋은 낭송이 무엇인지 알아봐요","짝과 낭송을 연습해요"]}, suggested_extras:["t_read11"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"더 멋진 낭송으로! 🎵", visual:"🎵", question:"분위기도 살리고 알맞게 띄어 읽으면<br>낭송이 어떻게 더 좋아질까요?"}, suggested_extras:["q_read11","r_read11"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"좋은 낭송", content:"좋은 낭송은 **분위기**에 맞는 목소리에 **알맞은 띄어 읽기**를 더해요. 행과 행 사이에서 살짝 쉬고, 뜻이 드러나게 읽어요. 듣는 사람이 시의 느낌을 **함께 느끼게** 하면 멋진 낭송이에요!", symbol_meanings:[{symbol:"분위기 살려", meaning:"목소리·빠르기"},{symbol:"알맞게 띄어", meaning:"행·낱말 사이 쉬기"},{symbol:"또박또박", meaning:"분명하게"},{symbol:"느낌 전하기", meaning:"함께 느끼게"}]}, suggested_extras:["t_read11b","x_read11"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 낭송은? ✅", sub:"좋은 낭송의 모습을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"낭송할 때 목소리는?", emoji:"🎤", name:"분위기에 맞게 조절해요"},{clue:"행과 행 사이는?", emoji:"⏸️", name:"살짝 쉬어 읽어요"},{clue:"이렇게 읽으면 아쉬워요!", emoji:"🙅", name:"분위기 없이 빠르게만 읽기"}], outro:"분위기와 띄어 읽기를 함께 살리면 멋진 낭송이 돼요. 짝과 연습해 볼까요? 😊"}, suggested_extras:["q_pick11","g_read11"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"짝과 낭송을 연습해요 🎤", sub:"버튼을 눌러 친구를 뽑아요. 분위기를 살려 알맞게 띄어 읽으며 낭송해 봐요!", count:24, hint:"분위기에 맞는 목소리로, 행 사이에서 살짝 쉬며 읽어 봐요", end_msg:"모두 멋지게 낭송했어요. 시의 느낌이 살아났어요! 👏"}, suggested_extras:["t_present11","e_read11"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["알맞게 띄어 읽으며 낭송했어요","좋은 낭송이 무엇인지 알았어요","짝과 낭송을 연습했어요"]}, suggested_extras:["q_reflect11"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시로 여는 우리 반을 만들어요", body:"다음 시간에는 좋아하는 시를 골라 낭송하며 '시로 여는 우리 반'을 만들어 볼 거예요!"}, suggested_extras:["e_class11"]}
    ],
    extras: [
      {id:"q_recall11", type:"fun_question", icon:"💡", title:"지난 낭송", content:"\"지난 시간 낭송에서 무엇을 조심했나요?\" 이어 가는 발문.", fit_slides:["cover","motivate"]},
      {id:"t_read11", type:"tip", icon:"🧩", title:"분위기+띄어 읽기", content:"분위기 살리기에 알맞은 띄어 읽기를 더하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_read11", type:"fun_question", icon:"🎵", title:"더 좋게", content:"\"낭송을 더 좋게 하려면 무엇을 더할까요?\" 낭송을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_read11", type:"real_world", icon:"🌍", title:"낭송 듣기", content:"시 낭송을 들었던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_read11b", type:"tip", icon:"🧩", title:"행 사이 쉬기", content:"행과 행 사이에서 살짝 쉬며 읽게 안내하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_read11", type:"misconception", icon:"❓", title:"빠르게만 읽지 않기", content:"분위기 없이 빠르게만 읽지 않게, 느낌을 살리게 하세요.", fit_slides:["concept"]},
      {id:"q_pick11", type:"fun_question", icon:"💡", title:"무엇이 좋을까", content:"\"좋은 낭송에는 무엇이 있죠?\" 분위기·띄어 읽기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_read11", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 좋은 낭송 짝짓기", description:"낭송 항목과 좋은 모습을 짝지어 보세요.", hint:"멋진 낭송을 생각해요.", pairs:[{a:{text:"🎤 목소리"},b:{text:"분위기에 맞게"}},{a:{text:"⏸️ 행 사이"},b:{text:"살짝 쉬기"}},{a:{text:"📖 띄어 읽기"},b:{text:"뜻 살려"}}], fit_slides:["card_quiz"]},
      {id:"t_present11", type:"tip", icon:"🗣", title:"서로 듣기", content:"짝과 번갈아 낭송하고 좋은 점을 말해 주게 하세요.", fit_slides:["present"]},
      {id:"e_read11", type:"extension", icon:"⬆", title:"좋은 점 찾기", content:"\"짝의 낭송에서 좋았던 점은?\" 칭찬하게 해요.", fit_slides:["present"]},
      {id:"q_reflect11", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"좋은 낭송은 무엇을 함께 살리죠?\" 분위기·띄어 읽기를 짚어요.", fit_slides:["summary"]},
      {id:"e_class11", type:"extension", icon:"⬆", title:"시로 여는 우리 반 예고", content:"\"다음엔 시로 여는 우리 반을 만들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 12차시: 시로 여는 우리 반 ① (실천) ---------------- */
  window.LESSONS["u4_l12"] = {
    meta: {grade:2, subject:"국어", unit:4, n:12, title:"시로 여는 우리 반을 만들어요 ① (실천)", std:"[2국05-01]", duration_min:40,
      lesson_format:"교사주도 8슬 — 좋아하는 시 고르기 → 낭송 준비 → 낭송 태도 모으기 → 시 골라 낭송 준비"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 12/15차시 · 실천"}, suggested_extras:["q_class12","t_class12"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["좋아하는 시를 골라요","낭송할 준비를 해요","낭송 태도를 알아봐요"]}, suggested_extras:["t_class12"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 반을 시로 열어요 📖", visual:"📖", question:"아침마다 친구가 좋아하는 시를 낭송해 주면 어떨까요?<br>나는 어떤 시를 들려주고 싶나요?"}, suggested_extras:["q_pick12","r_class12"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"낭송 준비하기", content:"낭송할 시를 고르면, **분위기**를 살펴보고 어떻게 읽을지 정해요. **목소리·빠르기**를 정하고 여러 번 **연습**해요. 좋아하는 까닭도 함께 말하면 더 좋은 낭송이 돼요!", symbol_meanings:[{symbol:"시 고르기", meaning:"좋아하는 시"},{symbol:"분위기 살피기", meaning:"어떤 느낌인가"},{symbol:"읽기 정하기", meaning:"목소리·빠르기"},{symbol:"연습하기", meaning:"여러 번 읽어요"}]}, suggested_extras:["t_class12b","x_class12"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바른 낭송 태도는? ✅", sub:"낭송할 때 바른 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"낭송하기 전에는?", emoji:"📖", name:"시의 분위기를 살펴 읽기를 정해요"},{clue:"낭송할 때는?", emoji:"🎤", name:"분위기에 맞게 또박또박 읽어요"},{clue:"낭송이 끝나면?", emoji:"💗", name:"좋아하는 까닭을 말해 줘요"}], outro:"준비하고 연습하면 멋진 낭송이 돼요. 시를 골라 준비해 볼까요? 😊"}, suggested_extras:["q_pick12b","g_class12"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"시를 골라 낭송을 준비해요", question:"낭송할 시를 골라 볼까요?", items:["어떤 시를 고르고 싶나요?","그 시는 어떤 분위기인가요?","어떤 목소리로 읽을까요?"]}, suggested_extras:["t_present12","e_class12"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["좋아하는 시를 골랐어요","낭송할 준비를 했어요","낭송 태도를 알았어요"]}, suggested_extras:["q_reflect12"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시를 낭송하고 들어요", body:"다음 시간에는 준비한 시를 친구들 앞에서 낭송하고 함께 들어 볼 거예요!"}, suggested_extras:["e_share12"]}
    ],
    extras: [
      {id:"q_class12", type:"fun_question", icon:"💡", title:"들려주고 싶은 시", content:"\"친구들에게 들려주고 싶은 시가 있나요?\" 실천을 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_class12", type:"tip", icon:"🧩", title:"준비와 연습", content:"낭송은 준비와 연습이 중요함을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_pick12", type:"fun_question", icon:"📖", title:"어떤 시?", content:"\"어떤 시를 낭송하고 싶나요?\" 시를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_class12", type:"real_world", icon:"🌍", title:"아침 시 읽기", content:"아침에 시·글을 읽어 본 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_class12b", type:"tip", icon:"🧩", title:"분위기부터", content:"고른 시의 분위기를 먼저 살펴 읽기를 정하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_class12", type:"misconception", icon:"❓", title:"연습 없이는 어려워요", content:"연습 없이 바로 낭송하기보다 여러 번 읽어 보게 하세요.", fit_slides:["concept"]},
      {id:"q_pick12b", type:"fun_question", icon:"💡", title:"바른 태도는?", content:"\"바른 낭송 태도는 무엇이죠?\" 준비·태도를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_class12", type:"game", game_kind:"memory_match", icon:"🎮", title:"낭송 차례 ↔ 할 일 짝짓기", description:"낭송 차례와 할 일을 짝지어 보세요.", hint:"낭송 준비를 떠올려요.", pairs:[{a:{text:"📖 낭송 전"},b:{text:"분위기 살피기"}},{a:{text:"🎤 낭송할 때"},b:{text:"또박또박 읽기"}},{a:{text:"💗 끝난 뒤"},b:{text:"까닭 말하기"}}], fit_slides:["card_quiz"]},
      {id:"t_present12", type:"tip", icon:"🗣", title:"까닭과 함께", content:"고른 시를 좋아하는 까닭과 함께 말하게 하세요.", fit_slides:["question"]},
      {id:"e_class12", type:"extension", icon:"⬆", title:"여러 번 읽기", content:"\"분위기를 살려 여러 번 읽어 볼까요?\" 연습을 이어요.", fit_slides:["question"]},
      {id:"q_reflect12", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송을 어떻게 준비하죠?\" 분위기·연습을 짚어요.", fit_slides:["summary"]},
      {id:"e_share12", type:"extension", icon:"⬆", title:"낭송 예고", content:"\"다음엔 시를 낭송하고 들어요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 13차시: 시로 여는 우리 반 ② (낭송·듣기) ---------------- */
  window.LESSONS["u4_l13"] = {
    meta: {grade:2, subject:"국어", unit:4, n:13, title:"시로 여는 우리 반을 만들어요 ② (실천)", std:"[2국05-01] · [2국02-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 낭송·듣기 약속 → 좋은 듣기 → 좋은 듣기 모으기 → 시 낭송·나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시로 여는 우리 반을 만들어요", subtitle:"4단원 · 13/15차시 · 실천"}, suggested_extras:["q_ready13","t_listen13"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["준비한 시를 낭송해요","친구의 낭송을 잘 들어요","낭송을 듣고 느낌을 나눠요"]}, suggested_extras:["t_listen13"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구의 시를 들어요 👂", visual:"👂", question:"친구가 고른 시는 어떤 분위기일까요?<br>친구의 낭송을 들을 때 어떻게 들으면 좋을까요?"}, suggested_extras:["q_listen13","r_listen13"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"잘 듣고 느낌 나누기", content:"친구의 낭송을 들을 땐 **조용히 집중해** 들어요. 시의 **분위기**가 어떻게 느껴지는지, 친구가 잘한 점은 무엇인지 살펴요. 듣고 나서 \"이 부분이 좋았어\" 하고 **느낌**을 나눠요!", symbol_meanings:[{symbol:"조용히 듣기", meaning:"집중해서"},{symbol:"분위기 느끼기", meaning:"어떤 느낌인가"},{symbol:"좋은 점 찾기", meaning:"친구가 잘한 점"},{symbol:"느낌 나누기", meaning:"좋았던 점 말하기"}]}, suggested_extras:["t_listen13b","x_listen13"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"좋은 듣기 태도는? ✅", sub:"낭송을 들을 때 좋은 태도를 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"친구가 낭송할 때는?", emoji:"🤫", name:"조용히 집중해 들어요"},{clue:"낭송을 들으며?", emoji:"🎵", name:"어떤 분위기인지 느껴요"},{clue:"낭송이 끝나면?", emoji:"👏", name:"좋았던 점을 말해 줘요"}], outro:"잘 듣고 느낌을 나누면 모두 즐거워요. 시를 낭송해 볼까요? 😊"}, suggested_extras:["q_good13","g_listen13"]},
      {id:"s06", stage:"발표", block:"present", data:{title:"시를 낭송해요 🎤", sub:"버튼을 눌러 낭송할 친구를 뽑아요. 준비한 시를 분위기에 맞게 낭송하고, 들은 친구는 좋은 점을 나눠요!", count:24, hint:"분위기를 살려 또박또박 낭송하고, 듣는 친구는 조용히 집중해 들어요", end_msg:"모두 멋진 시로 우리 반을 열었어요. 교실이 따뜻해졌어요! 👏"}, suggested_extras:["t_present13","e_share13"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["준비한 시를 낭송했어요","친구의 낭송을 잘 들었어요","낭송을 듣고 느낌을 나눴어요"]}, suggested_extras:["q_reflect13"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원을 마무리해요", body:"다음 시간에는 겹받침과 분위기 살려 읽기를 스스로 돌아보고 정리해 볼 거예요!"}, suggested_extras:["e_wrap13"]}
    ],
    extras: [
      {id:"q_ready13", type:"fun_question", icon:"💡", title:"낭송 마음", content:"\"내 시를 낭송하는 마음은 어떤가요?\" 낭송을 편하게 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_listen13", type:"tip", icon:"🧩", title:"듣기도 중요", content:"낭송만큼 잘 듣는 태도도 중요함을 안내하세요.", fit_slides:["objective","concept"]},
      {id:"q_listen13", type:"fun_question", icon:"👂", title:"어떻게 들을까", content:"\"친구 낭송을 어떻게 들으면 좋을까요?\" 듣기를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_listen13", type:"real_world", icon:"🌍", title:"공연 듣기", content:"공연·발표를 조용히 들었던 경험과 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_listen13b", type:"tip", icon:"🧩", title:"분위기 느끼며", content:"낭송을 들으며 분위기를 느끼고 좋은 점을 찾게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_listen13", type:"misconception", icon:"❓", title:"끼어들기 주의", content:"낭송 중 끼어들지 말고 끝까지 듣게 하세요.", fit_slides:["concept"]},
      {id:"q_good13", type:"fun_question", icon:"💡", title:"좋은 태도는?", content:"\"좋은 듣기 태도는 무엇이죠?\" 집중·느끼기를 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_listen13", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황 ↔ 좋은 태도 짝짓기", description:"듣기 상황과 좋은 태도를 짝지어 보세요.", hint:"집중해 듣는 모습을 생각해요.", pairs:[{a:{text:"🤫 낭송 중"},b:{text:"조용히 집중"}},{a:{text:"🎵 들으며"},b:{text:"분위기 느끼기"}},{a:{text:"👏 끝난 뒤"},b:{text:"좋은 점 말하기"}}], fit_slides:["card_quiz"]},
      {id:"t_present13", type:"tip", icon:"🗣", title:"격려하기", content:"낭송하는 친구를 격려하고 좋은 점을 구체적으로 말하게 하세요.", fit_slides:["present"]},
      {id:"e_share13", type:"extension", icon:"⬆", title:"우리 반 시집", content:"\"우리 반이 좋아하는 시를 모아 볼까요?\" 실천을 이어요.", fit_slides:["present"]},
      {id:"q_reflect13", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"낭송을 듣고 무엇을 했죠?\" 듣기·나누기를 짚어요.", fit_slides:["summary"]},
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
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"4단원에서 무엇을 배웠나요? 🎀", visual:"📖", question:"겹받침을 바르게 읽고 쓰고, 시를 분위기에 맞게 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?"}, suggested_extras:["q_memory14","r_back14"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침·분위기 정리", content:"이 단원에서 **겹받침을 바르게 읽고 쓰는 법**과 **시를 분위기에 맞게 읽는 법**을 배웠어요. 겹받침은 소리는 하나·쓸 땐 두 글자, 시는 분위기에 맞게 목소리를 조절해 읽어요!", symbol_meanings:[{symbol:"겹받침 소리", meaning:"ㄺ→ㄱ·ㄵ→ㄴ·ㄼ→ㄹ"},{symbol:"쓸 땐 모두", meaning:"받침 두 글자"},{symbol:"분위기 느끼기", meaning:"말·장면으로"},{symbol:"분위기 살려 읽기", meaning:"목소리·빠르기 조절"}]}, suggested_extras:["t_method14","x_forget14"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"배운 것을 확인해요 ✅", sub:"이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"값\"은 어떻게 읽을까요?", emoji:"💰", name:"[갑] — 'ㅄ'→[ㅂ]"},{clue:"\"닭\"을 쓸 때는?", emoji:"🐔", name:"'ㄺ' 받침을 모두 써요"},{clue:"신나는 시를 읽을 때는?", emoji:"🎉", name:"밝고 빠르게 읽어요"}], outro:"배운 것을 잘 기억하고 있어요. 바르게 읽고 분위기를 살려 읽어 봐요! 😊"}, suggested_extras:["q_check14","g_wrap14"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"스스로 확인해요", question:"나는 이만큼 할 수 있나요?", items:["겹받침 낱말을 바르게 읽고 쓸 수 있나요?","시의 분위기를 느낄 수 있나요?","분위기에 맞게 낭송할 수 있나요?"]}, suggested_extras:["t_self14","e_pick14"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 한 일", points:["배운 것을 돌아봤어요","겹받침·분위기 살려 읽기를 정리했어요","얼마나 할 수 있는지 확인했어요"]}, suggested_extras:["q_reflect14"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"기초를 다지고 마무리해요", body:"다음 시간에는 겹받침 낱말을 다시 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"}, suggested_extras:["e_basic14"]}
    ],
    extras: [
      {id:"q_back14", type:"fun_question", icon:"💡", title:"돌아보기", content:"\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.", fit_slides:["cover","motivate"]},
      {id:"t_wrap14", type:"tip", icon:"🧩", title:"두 갈래", content:"겹받침과 분위기 살려 읽기 두 갈래를 함께 정리하게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_memory14", type:"fun_question", icon:"📖", title:"기억에 남는 활동", content:"\"겹받침·시 낭송 중 무엇이 가장 좋았나요?\" 단원 경험을 떠올려요.", fit_slides:["motivate"]},
      {id:"r_back14", type:"real_world", icon:"🌍", title:"생활 속 읽기", content:"책을 읽으며 겹받침을 바르게 읽은 경험을 떠올리게 해요.", fit_slides:["motivate","question"]},
      {id:"t_method14", type:"tip", icon:"🧩", title:"규칙 정리", content:"겹받침 소리 규칙과 분위기 읽기를 함께 정리하게 하세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_forget14", type:"misconception", icon:"❓", title:"쓸 땐 모두", content:"겹받침은 소리가 하나라도 쓸 땐 두 글자임을 다시 짚어 주세요.", fit_slides:["concept"]},
      {id:"q_check14", type:"fun_question", icon:"💡", title:"무엇을 배웠지?", content:"\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.", fit_slides:["card_quiz"]},
      {id:"g_wrap14", type:"game", game_kind:"memory_match", icon:"🎮", title:"항목 ↔ 내용 짝짓기", description:"배운 항목과 내용을 짝지어 보세요.", hint:"단원에서 배운 것을 떠올려요.", pairs:[{a:{text:"🐔 겹받침 읽기"},b:{text:"소리는 하나"}},{a:{text:"✍️ 겹받침 쓰기"},b:{text:"받침 두 글자"}},{a:{text:"🎵 시 읽기"},b:{text:"분위기 살려"}}], fit_slides:["card_quiz"]},
      {id:"t_self14", type:"tip", icon:"🗣", title:"자기 돌아보기", content:"비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.", fit_slides:["question"]},
      {id:"e_pick14", type:"extension", icon:"⬆", title:"다음 다짐", content:"\"더 연습하고 싶은 것을 정해 볼까요?\" 실천을 이어요.", fit_slides:["question"]},
      {id:"q_reflect14", type:"fun_question", icon:"💡", title:"오늘 한 일", content:"\"무엇을 정리했죠?\" 겹받침·분위기를 짚어요.", fit_slides:["summary"]},
      {id:"e_basic14", type:"extension", icon:"⬆", title:"기초 다지기 예고", content:"\"다음엔 겹받침 낱말과 글씨 쓰기를 해요.\" 다음 차시 예고.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 15차시: 마무리하기 ② (기초 다지기·겹받침·글씨) ---------------- */
  window.LESSONS["u4_l15"] = {
    meta: {grade:2, subject:"국어", unit:4, n:15, title:"마무리하기 ② — 기초 다지기", std:"[2국04-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 겹받침 다시 보기 → 소리와 표기 → 바른 소리 고르기 → 글씨 쓰기·단원 마무리"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"마무리하기 ② — 기초 다지기", subtitle:"4단원 · 15/15차시 · 마무리"}, suggested_extras:["q_last","t_last"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["겹받침 낱말을 다시 익혀요","소리와 표기를 구분해요","배운 낱말을 바르게 써요"]}, suggested_extras:["t_last"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"겹받침을 다시 만나요 🔤", visual:"🔤", question:"\"여덟·몫·짧다\"… 겹받침 낱말이 또 있어요.<br>이 낱말들은 어떻게 읽고 쓸까요?"}, suggested_extras:["q_last2","r_last"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"겹받침 다시 정리", content:"겹받침은 **소리는 하나, 쓸 때는 두 글자**! \"여덟→[여덜]\" \"몫→[목]\" \"짧다→[짤따]\"처럼 읽되, 쓸 때는 받침을 모두 써요. 바르게 읽고 쓰면 뜻이 잘 통해요!", symbol_meanings:[{symbol:"여덟 → [여덜]", meaning:"'ㄼ'→[ㄹ]"},{symbol:"몫 → [목]", meaning:"'ㄳ'→[ㄱ]"},{symbol:"짧다 → [짤따]", meaning:"'ㄼ'→[ㄹ]"},{symbol:"쓸 땐 모두", meaning:"받침 두 글자"}]}, suggested_extras:["t_last2","x_last"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"바르게 읽은 것은? 🔤", sub:"겹받침 낱말을 바르게 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!", cards:[{clue:"\"몫\"은 어떻게 읽을까요?", emoji:"🍰", name:"[목]"},{clue:"\"여덟\"은 어떻게 읽을까요?", emoji:"8️⃣", name:"[여덜]"},{clue:"\"넓다\"는 어떻게 읽을까요?", emoji:"📏", name:"[널따]"}], outro:"겹받침을 잘 익혔어요. 이제 글씨도 써 볼까요? 😊"}, suggested_extras:["q_last3","g_last"]},
      {id:"s06", stage:"활동", block:"concept", data:{title:"글씨를 바르게 써요 ✍️", content:"단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **겹받침 · 닭 · 넓다**를 바르게 써 보세요!", symbol_meanings:[{symbol:"겹받침", meaning:"또박또박 칸에 맞춰"},{symbol:"닭", meaning:"'ㄺ' 받침을 모두"},{symbol:"넓다", meaning:"'ㄼ' 받침을 모두"}]}, suggested_extras:["t_write15","e_more15"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"4단원에서 배운 것", points:["겹받침을 바르게 읽고 썼어요","시를 분위기에 맞게 읽었어요","겹받침 낱말과 글씨를 익혔어요"]}, suggested_extras:["q_reflect15"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 모두 마쳤어요", preview:"바르고 재미있게!", body:"4단원을 모두 마쳤어요. 앞으로도 겹받침을 바르게 읽고 쓰고, 분위기를 살려 읽어 봐요. 정말 수고했어요!"}, suggested_extras:["e_end"]}
    ],
    extras: [
      {id:"q_last", type:"fun_question", icon:"💡", title:"겹받침 낱말", content:"\"겹받침이 있는 낱말을 더 떠올려 볼까요?\" 정리를 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_last", type:"tip", icon:"🧩", title:"규칙 다지기", content:"겹받침 소리 규칙을 다시 다지게 하세요.", fit_slides:["objective","concept"]},
      {id:"q_last2", type:"fun_question", icon:"🔤", title:"어떻게 읽을까", content:"\"이 겹받침 낱말은 어떻게 읽을까요?\" 소리를 떠올려요.", fit_slides:["motivate"]},
      {id:"r_last", type:"real_world", icon:"🌍", title:"책 속 겹받침", content:"책에서 겹받침 낱말을 찾아 읽어 보게 해요.", fit_slides:["motivate"]},
      {id:"t_last2", type:"tip", icon:"🧩", title:"소리는 하나", content:"소리는 하나·쓸 땐 두 글자를 다시 짚어 주세요.", fit_slides:["concept","card_quiz"]},
      {id:"x_last", type:"misconception", icon:"❓", title:"받침 빠뜨리기 주의", content:"읽는 소리에 이끌려 받침을 하나만 쓰지 않게 하세요.", fit_slides:["concept"]},
      {id:"q_last3", type:"fun_question", icon:"💡", title:"무슨 소리?", content:"\"이 낱말은 어떤 소리로 읽을까요?\" 함께 읽어요.", fit_slides:["card_quiz"]},
      {id:"g_last", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말 ↔ 소리 짝짓기", description:"겹받침 낱말과 소리를 짝지어 보세요.", hint:"받침 규칙을 떠올려요.", pairs:[{a:{text:"🍰 몫"},b:{text:"[목]"}},{a:{text:"8️⃣ 여덟"},b:{text:"[여덜]"}},{a:{text:"📏 넓다"},b:{text:"[널따]"}}], fit_slides:["card_quiz"]},
      {id:"t_write15", type:"tip", icon:"✍️", title:"바른 글씨", content:"네모 칸의 자형을 살펴 또박또박 쓰게 하고, 받침을 모두 쓰게 하세요.", fit_slides:["concept"]},
      {id:"e_more15", type:"extension", icon:"⬆", title:"문장으로", content:"\"겹받침 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.", fit_slides:["concept"]},
      {id:"q_reflect15", type:"fun_question", icon:"💡", title:"단원 마무리", content:"\"4단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.", fit_slides:["summary"]},
      {id:"e_end", type:"extension", icon:"⬆", title:"분위기 살려 읽기", content:"\"좋아하는 시를 분위기를 살려 읽어 볼까요?\" 낭송을 이어 가요.", fit_slides:["next_lesson"]}
    ]
  };


})();
