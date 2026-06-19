/* ============================================================================
   2학년 1학기 국어 8단원 「다양한 작품을 감상해요」 케이티처(교사주도) 차시 데이터
   - 키 형식: window.LESSONS["u8_l{NN}"] (zero-pad)
   - 8슬 표준흐름: cover·objective / motivate·concept / 활동(card_quiz 등)·발표(question 등) / summary·next_lesson
   - 지도서: 미래엔 『국어』 2-1 (나) 246~279쪽 / 15차시.
   - 성취기준 [2국05-02]·[2국05-03]·[2국06-01]·[2국01-05]. 역량 문화 향유(작품의 이해와 표현).
   ★ 저작권: 창작 시·동화(신호·우산 사용법·다툰 날·편지=개구리와 두꺼비·누가 더 섭섭했을까·재강이 구출 작전) 미게재.
      자체 동시 「마주 보면」은 자체 창작이라 게재 가능. 전래(흥부와 놀부·콩쥐팥쥐·별주부전·해와 달이 된 오누이·의좋은 형제)는 공유 줄거리 활용.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 ---------------- */
  window.LESSONS["u8_l01"] = {
    meta: {grade:2, subject:"국어", unit:8, n:1, title:"단원 도입 — 다양한 작품을 만나요", std:"[2국05-02] · [2국01-05]", duration_min:40,
      lesson_format:"교사주도 8슬 — 시·이야기·인형극 감상 경험 떠올리기 → 작품의 종류 → 작품 종류 맞히기 → 감상 경험 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"다양한 작품을 감상해요", subtitle:"8단원 · 1/15차시 · 단원 도입"}, suggested_extras:["q_open","t_goal"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시·이야기·인형극이 무엇인지 살펴봐요","작품을 감상해 본 경험을 떠올려요","이 단원에서 배울 것을 알아봐요"]}, suggested_extras:["t_goal"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"선생님이 책을 읽어 주셔요 📖", visual:"🎭", question:"시를 낭송하거나, 이야기를 듣거나, 인형극을 본 적이 있나요?<br>그때 어떤 마음이 들었나요?"}, suggested_extras:["q_exp","r_life"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"이런 작품들이 있어요", content:"이 단원에서는 **시**, **이야기**, **인형극** 같은 여러 작품을 감상해요. 작품을 즐기고 느낀 점을 친구들과 나누는 것이 가장 중요해요!", symbol_meanings:[{symbol:"시 🗣️", meaning:"소리 내어 낭송하며 즐겨요"},{symbol:"이야기 📖", meaning:"인물의 마음을 상상하며 읽어요"},{symbol:"인형극 🎭", meaning:"인형의 말·행동을 보며 즐겨요"},{symbol:"감상 💗", meaning:"느낀 점을 친구와 나눠요"}]}, suggested_extras:["t_concept","b_book"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이건 어떤 작품일까요? 🤔", sub:"설명을 보고 시·이야기·인형극 가운데 무엇인지 함께 맞혀 봐요. 카드를 누르면 정답이 나와요!", cards:[{clue:"소리 내어 낭송하면 리듬과 분위기가 느껴져요.<br>짧은 글에 마음이 담겨 있어요.", emoji:"🗣️", name:"시!"},{clue:"인물이 나오고, 일이 차례대로 일어나요.<br>읽으며 인물의 마음을 상상해요.", emoji:"📖", name:"이야기!"},{clue:"인형이 나와 말과 행동으로 보여 줘요.<br>그림자·막대·손가락 인형도 있어요.", emoji:"🎭", name:"인형극!"}], outro:"시·이야기·인형극을 이 단원에서 모두 만나 볼 거예요. 즐길 준비됐나요? 😊"}, suggested_extras:["q_kind","g_kind"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"감상 경험을 나눠요", question:"기억에 남는 작품이 있나요?", items:["가장 재미있게 읽은 이야기책은 무엇인가요?","본 적 있는 인형극이 있나요?","그 작품의 어떤 점이 좋았나요?"]}, suggested_extras:["t_present","e_more"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["시·이야기·인형극이 있다는 것을 알았어요","작품을 감상한 경험을 떠올렸어요","느낀 점을 나누는 것이 중요함을 알았어요"]}, suggested_extras:["q_reflect"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"작품 속 인물의 마음을 상상해요", body:"다음 시간에는 잘 아는 옛이야기의 한 장면을 떠올리며, 그 속 인물의 마음을 상상해 볼 거예요!"}, suggested_extras:["e_plan"]}
    ],
    extras: [
      {id:"q_open", type:"fun_question", icon:"💡", title:"작품 떠올리기", content:"\"가장 좋아하는 이야기책 제목을 한 가지 말해 볼까요?\" 작품과의 친밀감을 여는 발문이에요.", fit_slides:["cover","motivate"]},
      {id:"t_goal", type:"tip", icon:"🧩", title:"단원의 큰 그림", content:"이 단원의 목표는 '친구들과 작품 감상의 즐거움 나누기'예요. 도입에선 작품을 즐기는 분위기를 만드는 데 집중하세요.", fit_slides:["objective","cover"]},
      {id:"q_exp", type:"fun_question", icon:"🎭", title:"인형극 경험", content:"\"어디에서 인형극을 본 적이 있나요?\" 충치 예방·안전 교육 인형극 등 익숙한 경험을 끌어내요.", fit_slides:["motivate"]},
      {id:"r_life", type:"real_world", icon:"🌍", title:"생활 속 작품", content:"도서관·교실 책꽂이·텔레비전 등 일상에서 작품을 만나는 곳과 이어 주세요.", fit_slides:["motivate","question"]},
      {id:"t_concept", type:"tip", icon:"🧩", title:"엄밀한 구분보다 즐김", content:"시·이야기·인형극을 이론적으로 엄밀히 구분하기보다 '즐겁게 감상하는 것'에 중점을 두라고 지도서가 안내해요.", fit_slides:["concept"]},
      {id:"b_book", type:"book", icon:"📖", title:"그림책 한 권", content:"학급에 있는 그림책 한 권을 들어 보이며 \"이건 어떤 작품일까요?\" 물어 작품 종류를 자연스럽게 익히게 해요.", source:"학급 비치 도서(임의)", fit_slides:["concept"]},
      {id:"q_kind", type:"fun_question", icon:"💡", title:"또 어떤 작품?", content:"\"노래도 작품일까요? 만화는요?\" 작품의 범위를 넓혀 생각하게 하는 발문이에요.", fit_slides:["card_quiz"]},
      {id:"g_kind", type:"game", game_kind:"memory_match", icon:"🎮", title:"작품 ↔ 특징 짝짓기", description:"작품 종류와 그 특징을 짝지어 보세요.", hint:"어떻게 즐기는 작품인지 생각해요.", pairs:[{a:{text:"🗣️ 시"},b:{text:"낭송하며 즐겨요"}},{a:{text:"📖 이야기"},b:{text:"마음 상상하며 읽어요"}},{a:{text:"🎭 인형극"},b:{text:"인형의 말·행동을 봐요"}}], fit_slides:["card_quiz"]},
      {id:"t_present", type:"tip", icon:"🗣", title:"경험은 짧게", content:"감상 경험은 한두 문장으로 짧게 말하게 해 여러 학생이 골고루 참여하도록 하세요.", fit_slides:["question"]},
      {id:"e_more", type:"extension", icon:"⬆", title:"작품 찾아오기", content:"\"다음 시간까지 좋아하는 이야기책을 한 권 떠올려 와요.\" 작품 감상의 동기를 이어 줘요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"오늘 어떤 작품들을 알게 됐나요?\" 물으며 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_plan", type:"extension", icon:"⬆", title:"옛이야기 떠올리기", content:"\"흥부와 놀부에서 가장 기억에 남는 장면은?\" 다음 차시(인물 마음 상상)를 살짝 예고해요.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 2차시: 작품 속 인물의 마음 상상 ---------------- */
  window.LESSONS["u8_l02"] = {
    meta: {grade:2, subject:"국어", unit:8, n:2, title:"작품 속 인물의 마음을 상상해요", std:"[2국05-02] · [2국05-03]", duration_min:40,
      lesson_format:"교사주도 8슬 — 옛이야기 장면 떠올리기 → 마음 상상하는 방법 → 장면 속 마음 맞히기 → 상상한 마음 발표"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"작품 속 인물의 마음을 상상해요", subtitle:"8단원 · 2/15차시 · 준비"}, suggested_extras:["q_scene","t_focus"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["옛이야기의 한 장면을 떠올려요","장면 속 인물의 마음을 상상해요","왜 그런 마음일지 까닭을 말해요"]}, suggested_extras:["t_focus"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"흥부 앞에 큰 박이 갈라졌어요 🪕", visual:"😲", question:"흥부가 박에서 보물이 쏟아져 나왔어요.<br>이때 흥부는 어떤 마음이었을까요?"}, suggested_extras:["q_heung","r_tale"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"마음을 상상하는 방법", content:"인물의 마음은 글에 **직접 나오지 않을 때가 많아요**. 그럴 땐 인물이 처한 **상황**과 인물의 **말·행동**을 살펴 마음을 상상해요.", symbol_meanings:[{symbol:"상황 보기", meaning:"인물이 어떤 일을 겪었나요?"},{symbol:"행동 보기", meaning:"무엇을 했나요? (웃다·울다)"},{symbol:"말 보기", meaning:"어떤 말을 했나요?"},{symbol:"마음 상상", meaning:"비슷한 내 경험과 견줘 봐요"}]}, suggested_extras:["t_imagine","x_force"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"이 장면, 어떤 마음일까요? 💭", sub:"잘 아는 옛이야기 장면이에요. 인물의 마음을 함께 상상해 봐요. 카드를 누르면 마음이 나와요!", cards:[{clue:"흥부가 박에서 보물이 쏟아지는 것을 봤어요.", emoji:"😄", name:"기쁘고 놀란 마음"},{clue:"콩쥐가 깨진 독을 두꺼비가 막아 줘서 물을 채웠어요.", emoji:"🙏", name:"고마운 마음"},{clue:"갑자기 호랑이가 나타나 할머니 앞을 막았어요.", emoji:"😨", name:"놀라고 무서운 마음"}], outro:"같은 장면도 사람마다 다르게 느낄 수 있어요. 왜 그렇게 생각했는지 말해 보면 더 좋아요! 😊"}, suggested_extras:["q_why","g_mood"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"상상한 마음을 발표해요", question:"내가 그 인물이라면 어떤 마음이었을까요?", items:["어떤 장면을 골랐나요?","그 인물은 어떤 마음이었을까요?","왜 그렇게 생각했나요?"]}, suggested_extras:["t_reason","e_mine"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["인물의 마음은 상황·말·행동으로 상상해요","같은 장면도 다르게 느낄 수 있어요","왜 그런지 까닭을 말하면 좋아요"]}, suggested_extras:["q_reflect2"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"시를 낭송하고 느낌을 나눠요", body:"다음 시간에는 시를 소리 내어 낭송하고, 시 속 인물의 마음을 짐작하며 느낌을 나눠 볼 거예요!"}, suggested_extras:["e_poem"]}
    ],
    extras: [
      {id:"q_scene", type:"fun_question", icon:"💡", title:"기억의 장면", content:"\"옛이야기에서 가장 기억에 남는 장면 하나를 떠올려 볼까요?\" 마음 상상의 재료를 끌어내요.", fit_slides:["cover","motivate"]},
      {id:"t_focus", type:"tip", icon:"🧩", title:"학습의 초점", content:"인물 상상이 기계적이지 않게, 말·행동을 통해 자연스럽게 마음을 짐작하도록 이끄세요(지도서 유의점).", fit_slides:["objective","concept"]},
      {id:"q_heung", type:"fun_question", icon:"🪕", title:"흥부의 마음", content:"\"여러분이 흥부라면 그 순간 무슨 말을 했을까요?\" 인물에 몰입하게 해요.", fit_slides:["motivate"]},
      {id:"r_tale", type:"real_world", icon:"🌍", title:"아는 옛이야기", content:"콩쥐팥쥐·별주부전·해와 달이 된 오누이 등 학생들이 아는 옛이야기를 자유롭게 떠올리게 하세요.", fit_slides:["motivate","card_quiz"]},
      {id:"t_imagine", type:"tip", icon:"🧩", title:"비슷한 경험과 견주기", content:"마음을 짐작하기 어려워하는 학생에겐 \"너라면 어땠을까?\" 비슷한 경험을 떠올리게 안내하세요.", fit_slides:["concept"]},
      {id:"x_force", type:"misconception", icon:"❓", title:"정답은 하나가 아니에요", content:"인물의 마음에 '하나의 정답'을 강요하지 마세요. 까닭이 타당하면 다양한 상상을 인정해 줍니다.", fit_slides:["concept","card_quiz"]},
      {id:"q_why", type:"fun_question", icon:"💡", title:"왜 그렇게?", content:"\"왜 그런 마음이라고 생각했나요?\" 까닭을 묻는 습관을 들여요.", fit_slides:["card_quiz"]},
      {id:"g_mood", type:"game", game_kind:"memory_match", icon:"🎮", title:"장면 ↔ 마음 짝짓기", description:"옛이야기 장면과 인물의 마음을 짝지어 보세요.", hint:"그 상황에서 어떤 마음일지 생각해요.", pairs:[{a:{text:"🪕 보물이 쏟아짐"},b:{text:"기쁜 마음"}},{a:{text:"🐸 두꺼비가 도와줌"},b:{text:"고마운 마음"}},{a:{text:"🐯 호랑이가 나타남"},b:{text:"놀란 마음"}}], fit_slides:["card_quiz"]},
      {id:"t_reason", type:"tip", icon:"🗣", title:"까닭을 함께", content:"마음만 말하지 않고 \"왜냐하면…\"으로 까닭을 함께 말하게 하면 감상이 깊어져요.", fit_slides:["question"]},
      {id:"e_mine", type:"extension", icon:"⬆", title:"내 경험 잇기", content:"\"나도 비슷한 마음이 들었던 적 있나요?\" 작품을 자신의 삶과 이어 보게 해요.", fit_slides:["question"]},
      {id:"q_reflect2", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"인물의 마음은 무엇을 보고 상상했죠?\" 상황·말·행동을 짚으며 정리해요.", fit_slides:["summary"]},
      {id:"e_poem", type:"extension", icon:"⬆", title:"시 맛보기", content:"\"시 속에도 인물의 마음이 숨어 있어요.\" 다음 차시를 예고해요.", fit_slides:["next_lesson"]}
    ]
  };

  /* ---------------- 3차시: 시를 낭송하고 느낌을 나눠요 ① ---------------- */
  window.LESSONS["u8_l03"] = {
    meta: {grade:2, subject:"국어", unit:8, n:3, title:"시를 낭송하고 느낌을 나눠요 ①", std:"[2국05-02]", duration_min:40,
      lesson_format:"교사주도 8슬 — 표정·몸짓 경험 → 자체 동시 「마주 보면」 → 행동에서 마음 짐작 → 낭송하고 느낌 나누기"},
    slides: [
      {id:"s01", stage:"열기", block:"cover", data:{title:"시를 낭송하고 느낌을 나눠요", subtitle:"8단원 · 3/15차시 · 소단원 1"}, suggested_extras:["q_gesture","t_recite"]},
      {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["시를 소리 내어 낭송해요","행동에서 인물의 마음을 짐작해요","시에 대한 느낌을 친구와 나눠요"]}, suggested_extras:["t_recite"]},
      {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"친구가 손을 흔들어요 👋", visual:"😄", question:"친구가 활짝 웃으며 손을 흔들면,<br>여러분은 어떤 표정·몸짓으로 답하고 싶나요?"}, suggested_extras:["q_sign","r_gesture"]},
      {id:"s04", stage:"만나기", block:"concept", data:{title:"시 「마주 보면」을 읽어요", content:"행동에 마음이 담겨 있어요. '반갑다'는 말이 없어도 **웃고 손을 흔드는 행동**에서 반가운 마음이 느껴져요.", symbol_meanings:[{symbol:"내가 손을 흔들면", meaning:"너도 손을 흔들고"},{symbol:"내가 빙긋 웃으면", meaning:"너도 빙긋"},{symbol:"마주 보는 우리 둘", meaning:"마음이 통했네"},{symbol:"숨은 마음", meaning:"반가운 마음 💕"}]}, suggested_extras:["t_action","b_picpoem"]},
      {id:"s05", stage:"활동", block:"card_quiz", data:{title:"흉내 내는 말, 무슨 뜻일까요? ✨", sub:"시에 나온 흉내 내는 말이에요. 어떤 모양인지 함께 맞혀 봐요. 카드를 누르면 뜻이 나와요!", cards:[{clue:"\"빙긋\" 웃었어요.<br>어떻게 웃는 모양일까요?", emoji:"🙂", name:"소리 없이 살짝 웃는 모양"},{clue:"고개를 \"까딱\" 했어요.<br>어떤 모양일까요?", emoji:"🙇", name:"고개를 가볍게 움직이는 모양"},{clue:"\"폴짝폴짝\" 뛰었어요.<br>어떤 모양일까요?", emoji:"🐰", name:"가볍게 자꾸 뛰어오르는 모양"}], outro:"흉내 내는 말을 살리면 시가 더 생생해져요. 몸짓을 더해 낭송해 볼까요? 😊"}, suggested_extras:["q_mimic","g_mimic"]},
      {id:"s06", stage:"발표", block:"question", data:{title:"낭송하고 느낌을 나눠요", question:"여러 방법으로 시를 낭송해 봐요.", items:["짝과 한 줄씩 주고받으며 낭송해 볼까요?","몸짓을 더해 낭송하면 어떤 느낌인가요?","시를 읽고 어떤 마음이 떠올랐나요?"]}, suggested_extras:["t_recite2","e_signal"]},
      {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["행동에서 인물의 마음을 짐작했어요","흉내 내는 말의 뜻을 알았어요","여러 방법으로 낭송하며 느낌을 나눴어요"]}, suggested_extras:["q_reflect3"]},
      {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"이야기를 읽고 느낌을 표현해요", body:"다음 시간에는 이야기를 읽으며 인물의 마음을 상상하고, 생각이나 느낌을 표현해 볼 거예요!"}, suggested_extras:["e_story"]}
    ],
    extras: [
      {id:"q_gesture", type:"fun_question", icon:"💡", title:"몸짓 인사", content:"\"말 없이 몸짓만으로 '반가워'를 표현해 볼까요?\" 시의 정서를 몸으로 열어요.", fit_slides:["cover","motivate"]},
      {id:"t_recite", type:"tip", icon:"🧩", title:"낭송은 감상 활동", content:"낭송을 잘하기 위한 것이 아니라, 시에 대한 생각·느낌을 표현하는 감상 활동임을 잊지 마세요(지도서 유의점).", fit_slides:["objective","question"]},
      {id:"q_sign", type:"fun_question", icon:"👋", title:"우리만의 신호", content:"\"친구와 둘만 아는 몸짓 신호가 있나요?\" 시의 세계를 자신의 경험과 이어요.", fit_slides:["motivate"]},
      {id:"r_gesture", type:"real_world", icon:"🌍", title:"생활 속 몸짓", content:"손 흔들기·하이파이브·엄지척 등 일상의 몸짓 인사와 이어 주세요.", fit_slides:["motivate"]},
      {id:"t_action", type:"tip", icon:"🧩", title:"행동→마음", content:"시에 '반갑다'가 직접 없어도 웃고 손 흔드는 행동으로 마음을 짐작할 수 있음을 짚어 주세요.", fit_slides:["concept"]},
      {id:"b_picpoem", type:"book", icon:"📖", title:"시 그림책", content:"한 면에 한 연을 담은 시 그림책을 활용하면 다음 장을 상상하며 천천히 음미하게 됩니다.", source:"시 그림책(시중 다수 — 임의 선택)", fit_slides:["concept"]},
      {id:"q_mimic", type:"fun_question", icon:"💡", title:"또 다른 흉내말", content:"\"웃는 모양을 흉내 내는 다른 말도 있을까요? (방긋·생긋)\" 어휘를 넓혀요.", fit_slides:["card_quiz"]},
      {id:"g_mimic", type:"game", game_kind:"memory_match", icon:"🎮", title:"흉내말 ↔ 뜻 짝짓기", description:"흉내 내는 말과 그 뜻을 짝지어 보세요.", hint:"어떤 모양인지 떠올려요.", pairs:[{a:{text:"빙긋"},b:{text:"살짝 웃는 모양"}},{a:{text:"까딱"},b:{text:"고개를 움직이는 모양"}},{a:{text:"폴짝폴짝"},b:{text:"뛰어오르는 모양"}}], fit_slides:["card_quiz"]},
      {id:"t_recite2", type:"tip", icon:"🗣", title:"다양한 낭송", content:"주고받으며 낭송·몸짓 낭송·랩처럼 낭송 등 다양한 방법으로 낭송의 즐거움을 체험하게 하세요.", fit_slides:["question"]},
      {id:"e_signal", type:"extension", icon:"⬆", title:"나만의 신호 시", content:"\"누구와 어떤 신호를 주고받고 싶나요?\" 시를 자신의 이야기로 확장해요.", fit_slides:["question","next_lesson"]},
      {id:"q_reflect3", type:"fun_question", icon:"💡", title:"오늘의 발견", content:"\"행동에서 무엇을 짐작했죠?\" 배움을 짚어요.", fit_slides:["summary"]},
      {id:"e_story", type:"extension", icon:"⬆", title:"이야기 예고", content:"\"다음엔 이야기 속 인물의 마음을 상상해요.\" 다음 차시를 예고해요.", fit_slides:["next_lesson"]}
    ]
  };

})();
