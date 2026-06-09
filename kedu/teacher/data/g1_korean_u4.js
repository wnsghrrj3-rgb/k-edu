/* ============================================================
   1학년 1학기 국어 — 4단원 「여러 가지 낱말을 익혀요」 (케이티처)
   양산 영역 — LESSONS["u4_l{NN}"] 누적 / 다른 단원·과목 .js = read-only
   g1_korean.html이 자동 로드 후 LESSONS 에 누적.
   ------------------------------------------------------------
   ★ 케이티처 = 교사 주도 수업 도구. 로깅 없음(수업 진행용).
   ★ 기준점 = golden_samples/g1_korean_u4_l05_공개수업_GOLDEN.html
     골든샘플 5스테이지(동기유발→읽어주기→초성퀴즈→발표→마무리)를
     케이티처 B 구조 블록으로 재현 + 저작권 안전선 재구성.
   ★ 저작권: 그림책 본문·인물명·삽화·작가 미게재. read_aloud = 책 비특정
     + 교사 진행 안내(본문 아님) + placeholder. 음식 낱말은 보편/교과 어휘.
   ------------------------------------------------------------
   진척:
   - l05 「좋아하는 음식을 말해요」 ✅ (첫 타자 · 골든샘플 시스템 재현)
============================================================ */

  LESSONS["u4_l05"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 5,
    title: "좋아하는 음식을 말해요",
    std: "[2국05-01] · [2국02-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 동기유발(음식카드) → 그림책 읽어주기 → 초성퀴즈 → 좋아하는 음식 발표 → 마무리"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"좋아하는 음식을 말해요", subtitle:"4단원 · 5/14차시 · 듣기·말하기"}, suggested_extras:["v_intro", "q_open"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["음식이 나오는 그림책을 함께 들어요", "이야기 속 음식 낱말을 알아맞혀요", "내가 좋아하는 음식을 친구들에게 말해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"열기", block:"card_quiz", data:{
      title:"오늘은 맛있는 시간! 🍴",
      sub:"카드를 눌러서 어떤 음식인지 맞혀 봐요!",
      cards:[
        {clue:"동글동글 구멍 뚫린<br>달콤한 빵!", emoji:"🍩", name:"도넛"},
        {clue:"동그란 빵 사이에<br>고기가 쏘옥!", emoji:"🍔", name:"햄버거"},
        {clue:"차갑고 달콤한<br>여름의 친구!", emoji:"🍦", name:"아이스크림"}
      ],
      outro:"여러분도 좋아하는 음식이 많죠? 😋 오늘은 책 속 친구들이 좋아하는 음식을 만나러 가 봐요! 📖"
    }, suggested_extras:["q_around", "x_clue"]},
    {id:"s04", stage:"만나기", block:"read_aloud", data:{
      title:"그림책을 함께 들어요 📖",
      author:"교사가 준비한 음식 그림책을 읽어 주세요",
      pages:[
        {img_hint:"그림책 표지", quote:"표지를 보여 주며 “무슨 이야기일까요?”\n아이들이 보이는 음식을 자유롭게 말하게 해요."},
        {img_hint:"동물·가족이 음식을 먹는 장면", quote:"등장하는 친구마다 좋아하는 음식이 달라요.\n“이 친구는 무엇을 좋아하나요?” 물어봐요."},
        {img_hint:"여러 음식이 나오는 장면", quote:"길쭉한 채소, 빨갛고 매운 음식, 기다란 면…\n어떤 음식이 나오는지 함께 짚어 봐요."},
        {img_hint:"이야기 마무리 장면", quote:"“여러분은 어떤 음식이 가장 맛있나요?”\n뒤 활동(발표)으로 자연스럽게 이어 줘요."}
      ],
      copyright:"📖 교재·그림책 본문과 삽화는 화면에 담지 않았습니다. 교사가 수업 시간에 직접 책을 읽어 주거나 교재 사진을 보여 주세요. (저작권법 제25조 학교 수업 목적 이용)"
    }, suggested_extras:["t_read", "b_book", "q_connect"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{
      title:"이야기에 나온 음식, 초성으로 맞혀 봐요!",
      sub:"가운데 큰 글자를 보고 무슨 음식일지 생각해요. [정답 보기]를 누르면 답이 나와요",
      items:[
        {chosung:"ㅇ ㅇ", answer:"오이", emoji:"🥒", hint:"길쭉하고 초록색인 채소예요!"},
        {chosung:"ㄱ ㅊ", answer:"김치", emoji:"🥬", hint:"빨갛고 매콤한, 밥이랑 먹는 음식!"},
        {chosung:"ㄱ ㅅ", answer:"국수", emoji:"🍜", hint:"길~다란 면을 후루룩 먹어요!"},
        {chosung:"ㅍ ㅈ", answer:"피자", emoji:"🍕", hint:"동그랗고 치즈가 쭉 늘어나요!"},
        {chosung:"ㅅ ㅍ ㄱ ㅌ", answer:"스파게티", emoji:"🍝", hint:"기다란 면을 돌돌 말아 먹어요!"}
      ]
    }, suggested_extras:["g_match", "x_chosung", "e_word"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"좋아하는 음식 발표하기 🎤",
      sub:"버튼을 누르면 발표할 친구를 뽑아요. 자신이 좋아하는 음식을 친구들에게 소개해요!",
      count:24,
      hint:"“저는 ○○을(를) 좋아해요. 왜냐하면 ~” 처럼 까닭도 말해 봐요",
      end_msg:"우리 반 친구들이 좋아하는 음식을 모두 들어봤어요. 정말 잘했어요! 👏"
    }, suggested_extras:["t_present", "q_why", "r_home"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["음식이 나오는 그림책을 함께 들었어요", "이야기 속 음식 낱말을 초성으로 알아맞혔어요", "내가 좋아하는 음식을 친구들에게 말했어요"]}, suggested_extras:["q_reflect", "r_market"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"오늘 배운 낱말로 재미있는 놀이를 해요", body:"낱말 카드로 짝을 맞추거나 이어 말하기 놀이를 해 봐요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"v_intro", type:"video", icon:"🎥", title:"음식 이름 노래·영상", url:"https://www.youtube.com/results?search_query=%EC%9C%A0%EC%95%84+%EC%9D%8C%EC%8B%9D+%EC%9D%B4%EB%A6%84+%EB%85%B8%EB%9E%98", description:"여러 음식 이름을 노래로 만나며 흥미를 여는 영상. 수업 시작 전 분위기 띄우기용.", source:"유튜브 검색 (교사 사전 확인 권장)", fit_slides:["card_quiz", "cover"]},
    {id:"q_open", type:"fun_question", icon:"💡", title:"아침에 뭐 먹고 왔나요?", content:"“오늘 아침에 무엇을 먹고 왔어요?” 한두 명에게 물어보며 음식 이야기로 자연스럽게 문을 열어요.", fit_slides:["cover", "card_quiz"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"목표는 ‘말하기’에 둔다", content:"이 차시 핵심은 듣고 읽기보다 ‘자기 경험을 또렷이 말하기’예요. 앞 활동은 발표를 위한 준비라는 걸 교사가 의식하면 시간 배분이 잡혀요.", fit_slides:["objective"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"카드 힌트로 상상하기", content:"카드를 뒤집기 전에 “구멍이 뚫렸대요. 뭘까요?”처럼 힌트만으로 먼저 떠올리게 하면 집중이 살아나요.", fit_slides:["card_quiz"]},
    {id:"x_clue", type:"misconception", icon:"❓", title:"정답을 너무 빨리 공개 X", content:"카드는 아이들이 충분히 말한 뒤 뒤집어요. 바로 공개하면 ‘맞히는 재미’와 말할 기회가 사라져요.", fit_slides:["card_quiz"]},
    {id:"t_read", type:"tip", icon:"🧩", title:"읽어주기는 천천히, 발문과 함께", content:"한 장면마다 멈춰 “무슨 음식일까요?”, “너라면 어떨까?” 발문을 끼우면 듣기가 살아 있는 활동이 돼요.", fit_slides:["read_aloud"]},
    {id:"b_book", type:"book", icon:"📖", title:"음식이 나오는 그림책 고르기", content:"여러 인물이 저마다 좋아하는 음식을 말하는 그림책이면 이 차시에 잘 맞아요. 도서관 그림책 코너에서 음식·식사 주제로 찾아보세요.", source:"학교·지역 도서관 그림책 코너", fit_slides:["read_aloud"]},
    {id:"q_connect", type:"fun_question", icon:"💡", title:"나와 연결 짓기", content:"“책 속 친구는 이걸 좋아하네요. 그럼 여러분은요?” 책과 자기 경험을 잇는 발문으로 발표를 준비시켜요.", fit_slides:["read_aloud", "present"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"음식과 첫소리 짝짓기", description:"음식 그림과 첫소리(초성)를 짝지어 보세요.", hint:"낱말의 첫 글자 소리를 생각해요.", pairs:[{a:{text:"🥒 오이"}, b:{text:"ㅇ"}}, {a:{text:"🥬 김치"}, b:{text:"ㄱ"}}, {a:{text:"🍕 피자"}, b:{text:"ㅍ"}}, {a:{text:"🍜 국수"}, b:{text:"ㄱ"}}], fit_slides:["chosung_quiz"]},
    {id:"x_chosung", type:"misconception", icon:"❓", title:"초성을 글자 수와 헷갈리기", content:"‘ㅅ ㅍ ㄱ ㅌ’처럼 초성이 많으면 글자도 많다는 뜻이에요. 초성 칸 수 = 글자 수라는 걸 짚어 주세요.", fit_slides:["chosung_quiz"]},
    {id:"e_word", type:"extension", icon:"⬆", title:"우리 반 음식 초성 퀴즈 만들기", content:"아이들이 좋아하는 음식으로 초성 문제를 직접 만들어 서로 내보게 하면 낱말 감각이 자라요.", fit_slides:["chosung_quiz", "next_lesson"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"발표는 한 문장부터", content:"“저는 ○○을 좋아해요” 한 문장이면 충분해요. 잘하는 아이에게는 까닭(왜냐하면)을 한 마디 더 붙이게 해요.", fit_slides:["present"]},
    {id:"q_why", type:"fun_question", icon:"💡", title:"왜 좋아할까?", content:"“그 음식은 왜 좋아요?”라고 한 번 더 물어 주면 단순 나열이 아니라 자기 생각을 말하는 연습이 돼요.", fit_slides:["present"]},
    {id:"r_home", type:"real_world", icon:"🌍", title:"우리 집 식탁 이야기", content:"가족이 자주 먹는 음식, 내가 제일 좋아하는 반찬 등 집과 이어지는 발표 거리를 미리 떠올리게 해요.", fit_slides:["present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 기억에 남은 친구 음식", content:"“오늘 친구가 말한 음식 중에 먹어 보고 싶은 게 있었나요?” 들은 내용을 되짚으며 듣기 태도를 칭찬해요.", fit_slides:["summary"]},
    {id:"r_market", type:"real_world", icon:"🌍", title:"시장·마트에서 음식 낱말", content:"시장이나 마트에서 본 음식 이름을 떠올리면 오늘 배운 낱말이 생활과 이어져요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"낱말 카드 미리 만들기", content:"오늘 나온 음식 낱말로 카드를 만들어 두면 다음 차시 낱말 놀이에 바로 쓸 수 있어요.", fit_slides:["next_lesson"]}
  ]
};
  LESSONS["u4_l06"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 6,
    title: "꾸며 주는 말",
    std: "[2국02-01] · [2국05-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 동기유발(어떤 토끼?) → 꾸며 주는 말 개념 → 꾸민 말 카드 퀴즈 → 꾸며 말하기 발표 → 마무리"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"꾸며 주는 말을 알아봐요", subtitle:"4단원 · 6/14차시 · 문법(어휘)"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낱말을 더 자세히 해 주는 ‘꾸며 주는 말’을 알아요", "낱말에 꾸며 주는 말을 붙여 봐요", "꾸며서 친구들에게 말해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{
      scene_title:"어떤 토끼일까요? 🐰",
      visual:"🐰",
      question:"똑같은 토끼인데, 더 자세히 말하려면 어떻게 할까요?<br>(큰 토끼? 하얀 토끼? 깡충깡충 뛰는 토끼?)"
    }, suggested_extras:["q_around", "x_clue"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"꾸며 주는 말이란?",
      content:"낱말 앞에 붙어서, **모양·색·크기·맛**을 더 자세히 알려 주는 말이에요.<br>‘사과’보다 ‘**빨간** 사과’가 머릿속에 더 또렷하게 그려지죠!",
      symbol_meanings:[
        {symbol:"빨간", meaning:"색을 꾸며요"},
        {symbol:"큰", meaning:"크기를 꾸며요"},
        {symbol:"달콤한", meaning:"맛을 꾸며요"},
        {symbol:"폭신한", meaning:"느낌을 꾸며요"}
      ]
    }, suggested_extras:["t_concept", "x_order"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"어떤 낱말일까요?",
      sub:"그림을 보고 꾸며 주는 말을 넣어 말해 봐요! 카드를 누르면 답이 나와요",
      cards:[
        {clue:"🍎<br>어떤 <b>색</b>일까?", emoji:"🍎", name:"빨간 사과"},
        {clue:"🐘<br>어떤 <b>크기</b>일까?", emoji:"🐘", name:"큰 코끼리"},
        {clue:"🍬<br>어떤 <b>맛</b>일까?", emoji:"🍬", name:"달콤한 사탕"}
      ],
      outro:"꾸며 주는 말을 붙이니 훨씬 생생하죠? 😊 이번엔 여러분 차례예요!"
    }, suggested_extras:["g_match", "e_word"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"꾸며서 말해 볼까요? 🎤",
      sub:"좋아하는 것에 꾸며 주는 말을 붙여 친구들에게 소개해요!",
      count:24,
      hint:"“저는 **○○한 ○○**을(를) 좋아해요” 처럼 꾸며 주는 말을 넣어 말해요",
      end_msg:"꾸며 주는 말을 넣으니 이야기가 훨씬 재미있어졌어요! 👏"
    }, suggested_extras:["t_present", "r_home", "q_why"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["꾸며 주는 말은 낱말을 더 자세히 해 줘요", "색·크기·맛·느낌을 꾸며 줄 수 있어요", "꾸며 주는 말을 넣어 또렷하게 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"학교에서 만나는 여러 낱말을 알아봐요", body:"교실·운동장·복도에서 볼 수 있는 낱말을 모아 봐요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"가방 속 물건 자랑하기", content:"“여러분 가방에 뭐가 있어요?” 한 명에게 물은 뒤 “어떤 색이에요? 어떤 모양이에요?”로 이어 꾸며 주는 말로 자연스럽게 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"‘자세히 말하기’가 목표", content:"꾸며 주는 말의 문법 용어(형용사 등)는 1학년엔 필요 없어요. ‘낱말을 더 자세하게 해 주는 말’이라는 느낌만 잡으면 충분해요.", fit_slides:["objective", "concept"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"교실 물건 꾸며 말하기", content:"칠판·창문·책상 등 교실 물건을 가리키며 “어떤 ○○일까요?”로 색·크기·모양을 말하게 하면 개념 도입이 쉬워요.", fit_slides:["motivate"]},
    {id:"x_clue", type:"misconception", icon:"❓", title:"꾸미는 말 = 칭찬 아님", content:"‘예쁜·멋진’ 같은 좋은 말만 꾸며 주는 말이라고 오해하기 쉬워요. ‘작은·네모난·매운’처럼 사실을 자세히 하는 말도 모두 꾸며 주는 말이에요.", fit_slides:["concept", "card_quiz"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"같은 낱말, 다른 꾸밈", content:"‘사과’ 하나로 빨간 사과·큰 사과·달콤한 사과를 만들어 보이면, 꾸며 주는 말이 ‘바꿔 끼우는 말’이라는 걸 직관적으로 알아요.", fit_slides:["concept"]},
    {id:"x_order", type:"misconception", icon:"❓", title:"꾸미는 말은 앞에", content:"‘사과 빨간’처럼 뒤에 붙이는 실수가 나와요. 꾸며 주는 말은 꾸밈 받는 낱말 **앞**에 온다는 걸 짚어 주세요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"꾸미는 말 ↔ 어울리는 낱말", description:"꾸며 주는 말과 잘 어울리는 낱말을 짝지어 보세요.", hint:"색·크기·맛을 떠올려요.", pairs:[{a:{text:"달콤한"}, b:{text:"🍬 사탕"}}, {a:{text:"빨간"}, b:{text:"🍎 사과"}}, {a:{text:"큰"}, b:{text:"🐘 코끼리"}}, {a:{text:"폭신한"}, b:{text:"🧸 곰인형"}}], fit_slides:["card_quiz"]},
    {id:"e_word", type:"extension", icon:"⬆", title:"꾸미는 말 바꿔 끼우기", content:"한 낱말(예: 공)에 꾸미는 말을 계속 바꿔 보게 해요. 동그란 공·작은 공·통통 튀는 공… 많이 나올수록 어휘가 자라요.", fit_slides:["card_quiz", "next_lesson"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"한 낱말이라도 칭찬", content:"꾸며 주는 말 하나만 붙여도 성공이에요. 잘하는 아이에게는 두 개(‘크고 노란 바나나’)에 도전하게 해요.", fit_slides:["present"]},
    {id:"r_home", type:"real_world", icon:"🌍", title:"집에서 꾸며 말하기", content:"집 물건(이불·컵·인형)에 꾸미는 말을 붙여 가족에게 말해 보게 하면 생활과 이어져요.", fit_slides:["present"]},
    {id:"q_why", type:"fun_question", icon:"💡", title:"왜 그렇게 꾸몄어?", content:"“왜 ‘폭신한’이라고 했어요?”라고 물으면 감각·경험을 떠올려 말하는 연습이 돼요.", fit_slides:["present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 들은 꾸미는 말", content:"“친구가 쓴 꾸미는 말 중에 기억에 남는 게 있나요?” 들은 내용을 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"학교 낱말 미리 떠올리기", content:"다음 시간 ‘학교 낱말’을 위해, 교실에서 본 물건 이름을 하나씩 떠올려 두게 하면 도입이 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};
  LESSONS["u4_l03"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 3,
    title: "나와 몸을 나타내는 낱말",
    std: "[2국02-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 몸 가리키기 → 몸 낱말·하는 일 → 몸 카드 퀴즈 → 몸으로 말하기 → 마무리"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"나와 몸을 나타내는 낱말", subtitle:"4단원 · 3/14차시 · 문법(어휘)"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["내 몸을 나타내는 낱말을 알아요", "몸과 하는 일을 이어 봐요", "몸 낱말을 넣어 말해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"내 몸을 얼마나 알까? 🧒", visual:"🧒", question:"눈은 무엇을 할까요? 손은요?<br>내 몸의 이름을 함께 알아봐요!"}, suggested_extras:["q_around"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"몸을 나타내는 낱말",
      content:"우리 몸에는 저마다 이름과 **하는 일**이 있어요. 낱말과 하는 일을 함께 알면 더 잘 기억나요!",
      symbol_meanings:[
        {symbol:"눈 👁", meaning:"보아요"},
        {symbol:"귀 👂", meaning:"들어요"},
        {symbol:"코 👃", meaning:"냄새 맡아요"},
        {symbol:"손 ✋", meaning:"잡아요"},
        {symbol:"발 🦶", meaning:"걸어요"}
      ]
    }, suggested_extras:["t_concept", "x_body"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"무엇으로 할까요?",
      sub:"그림을 보고 어떤 몸의 이름인지 맞혀 봐요!",
      cards:[
        {clue:"👁<br>무엇으로 <b>볼까?</b>", emoji:"👁", name:"눈"},
        {clue:"👂<br>무엇으로 <b>들을까?</b>", emoji:"👂", name:"귀"},
        {clue:"✋<br>무엇으로 <b>잡을까?</b>", emoji:"✋", name:"손"}
      ],
      outro:"몸의 이름과 하는 일을 잘 알았어요! 이제 몸 낱말을 넣어 말해 볼까요?"
    }, suggested_extras:["g_match", "e_word"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"몸 낱말로 말해 볼까요? 🎤",
      sub:"내 몸으로 할 수 있는 일을 친구들에게 말해요!",
      count:24,
      hint:"“나는 **○○**으로 **○○**해요” 처럼 말해요 (예: 나는 발로 달려요)",
      end_msg:"우리 몸으로 할 수 있는 일이 정말 많네요! 👏"
    }, suggested_extras:["t_present", "r_home"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["내 몸을 나타내는 낱말을 알았어요", "몸과 하는 일을 이어 봤어요", "몸 낱말을 넣어 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"우리 집에 함께 사는 사람을 부르는 말을 알아봐요", body:"할머니·아버지·동생처럼 가족을 부르는 낱말을 만나요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"몸으로 가위바위보", content:"손·발을 움직이는 간단한 동작으로 시작해 “지금 무엇을 썼나요?”로 몸 낱말에 자연스럽게 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"낱말 + 하는 일을 묶기", content:"몸 이름만 외우기보다 ‘눈-보다’처럼 하는 일과 묶어 익히면 오래 기억하고 말하기로도 잘 이어져요.", fit_slides:["objective", "concept"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"선생님을 따라 짚어요", content:"“눈 짚어 보세요, 귀 짚어 보세요” 따라 짚기로 시작하면 모든 아이가 참여하며 몸 낱말을 확인해요.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"오감으로 넓히기", content:"눈-보다, 귀-듣다, 코-맡다, 혀-맛보다, 손-만지다. 오감을 몸과 묶으면 다음 감각 표현 학습으로 이어져요.", fit_slides:["concept"]},
    {id:"x_body", type:"misconception", icon:"❓", title:"‘몸’은 손·발만 아님", content:"몸 낱말을 팔다리로만 떠올리기 쉬워요. 눈·코·입·귀처럼 얼굴 부분도 모두 몸을 나타내는 낱말이에요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"몸 ↔ 하는 일 짝짓기", description:"몸의 이름과 하는 일을 짝지어 보세요.", hint:"그 부분으로 무엇을 하나요?", pairs:[{a:{text:"👁 눈"}, b:{text:"보다"}}, {a:{text:"👂 귀"}, b:{text:"듣다"}}, {a:{text:"✋ 손"}, b:{text:"잡다"}}, {a:{text:"🦶 발"}, b:{text:"걷다"}}], fit_slides:["card_quiz"]},
    {id:"e_word", type:"extension", icon:"⬆", title:"더 많은 몸 낱말", content:"머리·어깨·무릎·팔꿈치처럼 더 많은 몸 낱말을 노래나 동작으로 넓혀 보면 어휘가 풍성해져요.", fit_slides:["card_quiz", "next_lesson"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"동작과 함께 말하기", content:"말하면서 그 동작을 직접 해 보게 하면(발로 달리는 시늉) 낱말과 의미가 몸으로 붙어요.", fit_slides:["present"]},
    {id:"r_home", type:"real_world", icon:"🌍", title:"집에서 몸으로 돕기", content:"손으로 수저 놓기, 발로 심부름 가기 등 집에서 몸으로 하는 일을 떠올려 말하면 생활과 이어져요.", fit_slides:["present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 새로 안 몸 낱말", content:"“오늘 새로 알게 된 몸 낱말이 있나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"우리 집 사람 떠올리기", content:"다음 시간 ‘가족을 부르는 말’을 위해, 집에 함께 사는 사람을 한 명 떠올려 두게 하면 도입이 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};

  LESSONS["u4_l04"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 4,
    title: "가족을 나타내는 낱말",
    std: "[2국02-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 우리 집 사람 → 부르는 말 → 호칭 카드 → 소개하기 → 마무리 (다양한 가족 형태 존중)"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"가족을 나타내는 낱말", subtitle:"4단원 · 4/14차시 · 문법(어휘)"}, suggested_extras:["t_care", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["우리 집 사람을 부르는 낱말을 알아요", "여러 가지 가족 부르는 말을 익혀요", "우리 집 사람을 소개해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 집에는 누가 함께 살까요?", visual:"🏠", question:"집집마다 함께 사는 사람이 달라요.<br>사람마다 부르는 말도 다르답니다!"}, suggested_extras:["t_care", "q_around"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"가족을 부르는 말",
      content:"우리 집에 함께 사는 사람을 부르는 여러 가지 낱말이 있어요. 집마다 함께 사는 사람은 **다 달라요** — 누구든 소중한 우리 집 사람이에요.",
      symbol_meanings:[
        {symbol:"할머니·할아버지", meaning:"부모님의 부모님"},
        {symbol:"아버지·어머니", meaning:"나를 돌봐 주는 분"},
        {symbol:"형·오빠·누나·언니", meaning:"나보다 먼저 태어난 사람"},
        {symbol:"동생", meaning:"나보다 나중에 태어난 사람"}
      ]
    }, suggested_extras:["t_care", "x_family"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"뭐라고 부를까요?",
      sub:"설명을 보고 어떻게 부르는지 맞혀 봐요!",
      cards:[
        {clue:"엄마, 아빠를<br>낳아 주신 분", emoji:"👵", name:"할머니 · 할아버지"},
        {clue:"나보다 먼저 태어난<br>여자 형제", emoji:"👧", name:"누나 · 언니"},
        {clue:"나보다 나중에<br>태어난 동생", emoji:"👶", name:"동생"}
      ],
      outro:"부르는 말이 여러 가지죠? 이제 우리 집 사람을 소개해 볼까요?"
    }, suggested_extras:["g_match", "x_family"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"우리 집 사람을 소개해요 🎤",
      sub:"함께 사는 사람 중 한 명을, 부르는 말을 넣어 소개해요 (말하고 싶은 사람만 해도 좋아요)",
      count:24,
      hint:"“우리 집에는 **○○**이(가) 있어요” 처럼 부르는 말을 넣어 소개해요",
      end_msg:"집집마다 다른 소중한 사람들을 만났어요. 모두 잘했어요! 👏"
    }, suggested_extras:["t_present", "t_care", "r_home"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["우리 집 사람을 부르는 낱말을 알았어요", "여러 가지 부르는 말을 익혔어요", "우리 집 사람을 소개했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"그림책을 보며 좋아하는 음식을 말해요", body:"이야기 속 친구들이 좋아하는 음식을 만나고, 내가 좋아하는 음식도 말해 봐요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"t_care", type:"tip", icon:"💛", title:"다양한 가족 존중", content:"한부모·조손·다문화 등 가족 형태는 다양해요. ‘엄마·아빠가 다 있어야 한다’는 전제 없이 “함께 사는 소중한 사람”으로 열어 두고, 특정 구성을 묻거나 강요하지 마세요.", fit_slides:["cover", "motivate", "concept", "present"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"호칭은 ‘부르는 말’로", content:"가족 관계도(촌수)를 가르치는 차시가 아니에요. 함께 사는 사람을 ‘부르는 말(낱말)’을 익히는 데 초점을 둬요.", fit_slides:["objective", "concept"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"부르는 말 떠올리기", content:"“집에서 누군가를 부를 때 뭐라고 하나요?” 가볍게 물어 아이가 쓰는 호칭을 자연스럽게 꺼내게 해요.", fit_slides:["motivate"]},
    {id:"x_family", type:"misconception", icon:"❓", title:"가족 수·구성은 다 달라", content:"가족은 꼭 몇 명, 누구누구여야 한다는 정답이 없어요. 아이마다 다른 답을 모두 인정해 주세요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"부르는 말 ↔ 설명 짝짓기", description:"부르는 말과 설명을 짝지어 보세요.", hint:"누구를 부르는 말일까요?", pairs:[{a:{text:"할머니"}, b:{text:"엄마·아빠의 어머니"}}, {a:{text:"동생"}, b:{text:"나보다 나중에 태어남"}}, {a:{text:"누나·언니"}, b:{text:"먼저 태어난 여자 형제"}}, {a:{text:"형·오빠"}, b:{text:"먼저 태어난 남자 형제"}}], fit_slides:["card_quiz"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"소개는 자유롭게", content:"발표는 원하는 아이만. 말하기 어려워하면 “좋아하는 사람 한 명”처럼 부담을 낮춰 주거나 넘어가 주세요.", fit_slides:["present"]},
    {id:"r_home", type:"real_world", icon:"🌍", title:"집에서 불러 보기", content:"집에 가서 함께 사는 사람을 부르는 말로 인사해 보게 하면 배운 낱말이 생활로 이어져요.", fit_slides:["present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"새로 안 부르는 말", content:"“오늘 새로 알게 된 부르는 말이 있나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"좋아하는 음식 떠올리기", content:"다음 시간 ‘좋아하는 음식 말하기’를 위해, 가장 좋아하는 음식을 하나 떠올려 두게 하면 도입이 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};
  LESSONS["u4_l07"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 7,
    title: "학교에서 보는 낱말",
    std: "[2국02-01] · [2국06-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 학교 둘러보기 → 학교 낱말·장소 → 장소 카드 퀴즈 → 학교에서 본 것 말하기 → 마무리"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"학교에서 보는 낱말", subtitle:"4단원 · 7/14차시 · 문법(어휘)·매체"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["학교에서 보는 낱말을 알아요", "어디에서 무엇을 하는지 이어 봐요", "학교에서 본 것을 말해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 학교를 둘러봐요 🏫", visual:"🏫", question:"교실 말고 또 어디가 있을까요?<br>운동장, 복도, 급식실… 무엇을 볼 수 있나요?"}, suggested_extras:["q_around"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"학교에서 보는 낱말",
      content:"학교에는 여러 **장소**가 있고, 저마다 **하는 일**이 달라요. 장소와 하는 일을 함께 알아봐요!",
      symbol_meanings:[
        {symbol:"교실 📚", meaning:"공부하는 곳"},
        {symbol:"운동장 ⚽", meaning:"뛰어노는 곳"},
        {symbol:"급식실 🍚", meaning:"밥 먹는 곳"},
        {symbol:"도서관 📖", meaning:"책 읽는 곳"}
      ]
    }, suggested_extras:["t_concept", "x_place"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"어디일까요?",
      sub:"하는 일을 보고 학교 어디인지 맞혀 봐요!",
      cards:[
        {clue:"공부하고<br>수업하는 곳", emoji:"📚", name:"교실"},
        {clue:"뛰어놀고<br>운동하는 곳", emoji:"⚽", name:"운동장"},
        {clue:"맛있는 밥을<br>먹는 곳", emoji:"🍚", name:"급식실"}
      ],
      outro:"학교 곳곳의 이름을 잘 알았어요! 여러분이 가 본 곳도 말해 볼까요?"
    }, suggested_extras:["g_match", "e_word"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"학교에서 본 것을 말해요 🎤",
      sub:"학교에서 좋아하는 곳, 자주 가는 곳을 친구들에게 말해요!",
      count:24,
      hint:"“나는 **○○**에서 **○○**해요” 처럼 장소와 하는 일을 넣어 말해요",
      end_msg:"우리 학교 곳곳을 잘 알게 됐어요! 👏"
    }, suggested_extras:["t_present", "r_school"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["학교에서 보는 낱말을 알았어요", "장소와 하는 일을 이어 봤어요", "학교에서 본 것을 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"우리 동네에서 보는 낱말을 알아봐요", body:"가게·병원·우체국처럼 동네에서 만나는 낱말을 모아 봐요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"오늘 아침 지나온 곳", content:"“교실까지 오면서 어디를 지나왔나요?” 복도·계단·신발장을 떠올리며 학교 낱말로 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"장소 + 하는 일", content:"장소 이름만이 아니라 ‘거기서 무엇을 하나’를 함께 익히면 다음 발표(○○에서 ○○해요)로 잘 이어져요.", fit_slides:["objective", "concept"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"창밖으로 보이는 곳", content:"교실 창밖이나 문밖으로 보이는 학교 장소를 가리키며 이름을 말하게 하면 실제와 이어져요.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"우리 학교 맞춤", content:"학교마다 장소가 달라요. 우리 학교에 있는 곳(강당·텃밭 등)으로 바꿔 들면 더 와닿아요.", fit_slides:["concept"]},
    {id:"x_place", type:"misconception", icon:"❓", title:"장소도 ‘낱말’", content:"낱말을 사물(연필·가방)로만 생각하기 쉬워요. 교실·운동장 같은 장소 이름도 모두 낱말이에요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"장소 ↔ 하는 일", description:"학교 장소와 하는 일을 짝지어요.", hint:"거기서 무엇을 하나요?", pairs:[{a:{text:"📚 교실"}, b:{text:"공부해요"}}, {a:{text:"⚽ 운동장"}, b:{text:"뛰어놀아요"}}, {a:{text:"🍚 급식실"}, b:{text:"밥 먹어요"}}, {a:{text:"📖 도서관"}, b:{text:"책 읽어요"}}], fit_slides:["card_quiz"]},
    {id:"e_word", type:"extension", icon:"⬆", title:"학교 낱말 더 모으기", content:"보건실·과학실·음악실처럼 더 많은 학교 낱말을 모아 보면 어휘가 넓어져요.", fit_slides:["card_quiz", "next_lesson"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"좋아하는 곳부터", content:"“학교에서 제일 좋아하는 곳”을 먼저 말하게 하면 부담 없이 발표가 시작돼요.", fit_slides:["present"]},
    {id:"r_school", type:"real_world", icon:"🌍", title:"학교 지도 그리기", content:"오늘 배운 장소로 우리 학교 간단 지도를 그려 보면 낱말이 공간 감각과 이어져요.", fit_slides:["present", "summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"새로 안 학교 낱말", content:"“오늘 새로 알게 된 학교 낱말이 있나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"동네 장소 떠올리기", content:"다음 시간 ‘동네 낱말’을 위해, 집 근처에서 본 가게·건물을 하나 떠올려 두게 해요.", fit_slides:["next_lesson"]}
  ]
};

  LESSONS["u4_l08"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 8,
    title: "이웃·동네에서 보는 낱말",
    std: "[2국02-01] · [2국06-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 우리 동네 → 동네 낱말·장소 → 장소 카드 → 학교/동네 나누기(주제 분류) → 마무리"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"이웃·동네에서 보는 낱말", subtitle:"4단원 · 8/14차시 · 문법(어휘)·매체"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["우리 동네에서 보는 낱말을 알아요", "어떤 곳인지 이어 봐요", "학교 낱말과 동네 낱말을 나눠 봐요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 동네에는 무엇이 있을까? 🏘", visual:"🏘", question:"집을 나서면 무엇이 보이나요?<br>가게, 병원, 공원… 우리 동네를 떠올려 봐요!"}, suggested_extras:["q_around"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"동네에서 보는 낱말",
      content:"우리 동네에도 여러 **장소**가 있어요. 어떤 일을 하는 곳인지 알면 낱말이 더 잘 기억나요!",
      symbol_meanings:[
        {symbol:"가게 🏪", meaning:"물건 사는 곳"},
        {symbol:"병원 🏥", meaning:"아플 때 가는 곳"},
        {symbol:"우체국 📮", meaning:"편지 부치는 곳"},
        {symbol:"공원 🌳", meaning:"쉬고 노는 곳"}
      ]
    }, suggested_extras:["t_concept", "x_place"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"어디일까요?",
      sub:"하는 일을 보고 동네 어디인지 맞혀 봐요!",
      cards:[
        {clue:"아프거나 다쳤을 때<br>가는 곳", emoji:"🏥", name:"병원"},
        {clue:"편지나 택배를<br>부치는 곳", emoji:"📮", name:"우체국"},
        {clue:"책을 빌리고<br>읽는 곳", emoji:"📖", name:"도서관"}
      ],
      outro:"동네 곳곳의 이름을 알았어요! 그럼 학교 낱말과 동네 낱말을 나눠 볼까요?"
    }, suggested_extras:["g_match", "e_word"]},
    {id:"s06", stage:"활동", block:"question", data:{
      title:"학교일까, 동네일까?",
      question:"다음 낱말은 어디에서 볼 수 있을까요? 함께 ‘학교’와 ‘우리 동네’로 나눠 봐요!",
      items:["교실 — 어디에서 볼까요?", "병원 — 어디에서 볼까요?", "운동장 — 어디에서 볼까요?", "우체국 — 어디에서 볼까요?", "급식실 — 어디에서 볼까요?", "공원 — 어디에서 볼까요?"]
    }, suggested_extras:["t_sort", "x_sort"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["동네에서 보는 낱말을 알았어요", "어떤 일을 하는 곳인지 이어 봤어요", "학교 낱말과 동네 낱말을 나눠 봤어요"]}, suggested_extras:["q_reflect", "r_home"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"이야기를 들으며 길에서 만나는 낱말을 알아봐요", body:"학교 가는 길에 보고 듣고 만난 것을 이야기로 만나요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"집 앞에 뭐가 있나요?", content:"“집에서 나오면 제일 먼저 뭐가 보여요?” 가볍게 물어 동네 낱말로 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"분류가 오늘의 핵심", content:"이 차시 핵심은 ‘학교 낱말 / 동네 낱말 나누기’예요. 낱말을 두 묶음으로 가르는 활동에 시간을 넉넉히 두세요.", fit_slides:["objective", "question"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"가 본 동네 장소", content:"“주말에 동네 어디 가 봤어요?” 실제 경험을 끌어내면 낱말이 살아나요.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"우리 동네 맞춤", content:"동네마다 있는 곳이 달라요. 우리 동네에 있는 곳(시장·놀이터 등)으로 바꿔 들면 더 와닿아요.", fit_slides:["concept"]},
    {id:"x_place", type:"misconception", icon:"❓", title:"동네 = 우리 집만 아님", content:"동네를 ‘우리 집’으로만 좁히기 쉬워요. 집 둘레의 가게·길·공원 모두가 동네예요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"동네 장소 ↔ 하는 일", description:"동네 장소와 하는 일을 짝지어요.", hint:"거기서 무엇을 하나요?", pairs:[{a:{text:"🏥 병원"}, b:{text:"진료받아요"}}, {a:{text:"📮 우체국"}, b:{text:"편지 부쳐요"}}, {a:{text:"🏪 가게"}, b:{text:"물건 사요"}}, {a:{text:"🌳 공원"}, b:{text:"쉬며 놀아요"}}], fit_slides:["card_quiz"]},
    {id:"e_word", type:"extension", icon:"⬆", title:"동네 낱말 더 모으기", content:"소방서·경찰서·은행·시장처럼 더 많은 동네 낱말을 모아 보면 어휘가 넓어져요.", fit_slides:["card_quiz"]},
    {id:"t_sort", type:"tip", icon:"🧩", title:"나누는 까닭 묻기", content:"“왜 그렇게 나눴어요?”를 물으면 단순 분류를 넘어 ‘어디에 있는가’ 기준을 스스로 말하게 돼요.", fit_slides:["question"]},
    {id:"x_sort", type:"misconception", icon:"❓", title:"둘 다 있는 낱말", content:"도서관처럼 학교에도 동네에도 있는 낱말이 나와요. ‘둘 다 맞아요’를 인정하면 분류가 더 풍부해져요.", fit_slides:["question"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 나눈 낱말", content:"“오늘 나눠 본 낱말 중 기억에 남는 게 있나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"r_home", type:"real_world", icon:"🌍", title:"집 가는 길 살펴보기", content:"집에 가는 길에 동네 장소 간판을 읽어 보게 하면 낱말이 생활·매체와 이어져요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"길에서 본 것 떠올리기", content:"다음 시간 ‘길에서 만나는 낱말’을 위해, 학교 오는 길에 본 것을 하나 떠올려 두게 해요.", fit_slides:["next_lesson"]}
  ]
};
