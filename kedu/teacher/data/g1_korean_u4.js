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

  /* ── l01 단원 도입: 낱말을 알면 좋은 점 ───────────────────── */
  LESSONS["u4_l01"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 1,
    title: "낱말을 알면 좋은 점",
    std: "[2국05-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 이름이 궁금했던 경험 → 이름을 알면 통함 → 그림 이름 맞히기 → 낱말 알면 좋은 점 → 단원 예고"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말의 세계로 들어가요", subtitle:"4단원 · 1/14차시 · 단원 도입"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이름이 궁금했던 때를 떠올려요", "이름을 알면 무엇이 좋은지 느껴요", "이 단원에서 배울 것을 살펴봐요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이건 이름이 뭘까? 🌼", visual:"🌼", question:"처음 본 꽃이나 물건을 보고<br>“이름이 뭐지?” 궁금했던 적 있나요?"}, suggested_extras:["q_curious"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"이름을 알면 통해요",
      content:"새로운 것을 보면 이름이 궁금해요. 이름(낱말)을 알면 다른 사람에게 **말로 전할 수** 있어요!",
      symbol_meanings:[
        {symbol:"해바라기 🌻", meaning:"해를 닮은 노란 꽃"},
        {symbol:"나비 🦋", meaning:"꽃을 찾아 날아요"},
        {symbol:"버섯 🍄", meaning:"숲에서 자라요"},
        {symbol:"무지개 🌈", meaning:"비 온 뒤 하늘에 떠요"}
      ]
    }, suggested_extras:["t_concept", "x_name"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"이건 무슨 이름일까요?",
      sub:"그림을 보고 이름을 맞혀 봐요!",
      cards:[
        {clue:"🌻<br>해를 닮은 노란 꽃", emoji:"🌻", name:"해바라기"},
        {clue:"🦋<br>꽃을 찾아 날아요", emoji:"🦋", name:"나비"},
        {clue:"🌈<br>비 온 뒤 하늘에 떠요", emoji:"🌈", name:"무지개"}
      ],
      outro:"이름을 알면 친구에게 더 잘 말할 수 있어요!"
    }, suggested_extras:["g_match", "e_more"]},
    {id:"s06", stage:"발표", block:"question", data:{
      title:"낱말을 알면 무엇이 좋을까요?",
      question:"낱말을 많이 알면 어떤 점이 좋을지 함께 이야기해 봐요!",
      items:["내 생각을 더 잘 말할 수 있어요", "책을 읽을 때 내용을 더 잘 알 수 있어요", "안내판을 혼자서 읽을 수 있어요"]
    }, suggested_extras:["t_talk", "r_sign"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["이름이 궁금했던 때를 떠올렸어요", "이름을 알면 말로 전할 수 있어요", "낱말을 알면 좋은 점을 이야기했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낱말이 왜 필요한지 더 살펴봐요", body:"낱말을 몰라 답답했던 때를 떠올리며, 낱말의 쓸모를 느껴 봐요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"오늘 본 새로운 것", content:"“오늘 아침에 처음 보거나 이름이 궁금했던 게 있었나요?”로 가볍게 시작하면 자연스럽게 낱말 이야기로 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"정답보다 호기심", content:"도입 차시는 ‘정확히 알기’가 아니라 ‘낱말이 궁금해지게 하기’가 목적이에요. 틀려도 괜찮은 허용적 분위기를 만들어요.", fit_slides:["objective", "concept"]},
    {id:"q_curious", type:"fun_question", icon:"💡", title:"그거 뭐였더라?", content:"“이름을 몰라서 ‘그거 있잖아’라고만 한 적 있나요?” 공감 질문으로 모든 아이가 경험을 떠올리게 해요.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"이름 = 전하는 도구", content:"낱말을 외우는 대상이 아니라 ‘마음을 전하는 도구’로 짚어 주면 다음 차시(낱말의 쓸모)로 매끄럽게 이어져요.", fit_slides:["concept"]},
    {id:"x_name", type:"misconception", icon:"❓", title:"이름은 외우는 것?", content:"낱말을 ‘외워야 하는 숙제’로만 여기기 쉬워요. 낱말은 내 생각을 남에게 전하려고 쓰는 도구라는 걸 느끼게 해 주세요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"그림과 이름 짝짓기", description:"그림과 이름을 짝지어 보세요.", hint:"그림을 보고 이름을 떠올려요.", pairs:[{a:{text:"🌻 해바라기"}, b:{text:"노란 꽃"}}, {a:{text:"🦋 나비"}, b:{text:"날아요"}}, {a:{text:"🌈 무지개"}, b:{text:"비 온 뒤"}}, {a:{text:"🍄 버섯"}, b:{text:"숲"}}], fit_slides:["card_quiz"]},
    {id:"e_more", type:"extension", icon:"⬆", title:"더 많은 이름 찾기", content:"교실 안 물건의 이름을 함께 짚어 보면 ‘이름(낱말)을 안다’는 감각이 자라요.", fit_slides:["card_quiz", "next_lesson"]},
    {id:"t_talk", type:"tip", icon:"🧩", title:"경험으로 말하기", content:"“낱말을 알아서 도움이 됐던 일”을 한 가지씩 말하게 하면 추상적 이야기가 자기 경험으로 바뀌어요.", fit_slides:["question"]},
    {id:"r_sign", type:"real_world", icon:"🌍", title:"우리 주변 안내판", content:"교실·복도·길에서 본 안내판 글자를 떠올리면 ‘낱말을 알면 혼자 읽을 수 있다’가 생활과 이어져요.", fit_slides:["question", "summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 알게 된 점", content:"“낱말을 알면 왜 좋은지 한 가지 말해 볼까요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"답답했던 때 떠올리기", content:"다음 시간을 위해, 낱말을 몰라 곤란했던 경험을 하나 떠올려 두게 하면 도입이 매끄러워요.", fit_slides:["next_lesson"]}
  ]
};

  /* ── l02 낱말이 필요한 까닭 ───────────────────────────────── */
  LESSONS["u4_l02"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 2,
    title: "낱말이 필요한 까닭",
    std: "[2국05-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 답답했던 경험 → 낱말이 필요한 때 → 상황에 맞는 낱말 → 단원 두 주제 살펴보기"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말이 필요한 까닭", subtitle:"4단원 · 2/14차시 · 단원 도입"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낱말을 몰라 답답했던 때를 떠올려요", "낱말이 어떤 때 필요한지 알아요", "이 단원에서 배울 주제를 살펴봐요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이름을 몰라 답답했던 적? 🤔", visual:"🤔", question:"갖고 싶은 걸 이름을 몰라<br>“그거 있잖아…”라고만 한 적 있나요?"}, suggested_extras:["q_empathy"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"낱말이 필요한 때",
      content:"낱말을 알면 **정확하게 부탁하고, 묻고, 알려줄** 수 있어요. 낱말은 마음을 전하는 다리예요!",
      symbol_meanings:[
        {symbol:"가게에서 🛒", meaning:"무엇을 살지 말해요"},
        {symbol:"아플 때 🏥", meaning:"어디가 아픈지 말해요"},
        {symbol:"길에서 🧭", meaning:"어디로 갈지 물어요"},
        {symbol:"책에서 📖", meaning:"내용을 알아들어요"}
      ]
    }, suggested_extras:["t_concept", "x_need"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"이럴 때 어떤 낱말이 필요할까요?",
      sub:"상황을 보고 알맞은 낱말을 떠올려 봐요!",
      cards:[
        {clue:"🍞<br>빵집에서 사고 싶을 때", emoji:"🍞", name:"빵"},
        {clue:"💧<br>목이 마를 때 달라고 하려면", emoji:"💧", name:"물"},
        {clue:"🚌<br>타고 갈 것을 물으려면", emoji:"🚌", name:"버스"}
      ],
      outro:"정확한 낱말을 알면 내 마음을 잘 전할 수 있어요!"
    }, suggested_extras:["g_match", "e_more"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"이 단원에서 배울 낱말 🎒",
      sub:"앞으로 어떤 낱말을 배울지 함께 말해 봐요!",
      count:24,
      hint:"‘나와 가족’ 낱말과 ‘학교와 이웃’ 낱말을 배워요. 알고 싶은 낱말을 하나 말해 봐요!",
      end_msg:"우리가 배울 낱말이 정말 많아요! 함께 떠나 볼까요? 🚀"
    }, suggested_extras:["t_present", "r_daily"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["낱말을 몰라 답답했던 때를 떠올렸어요", "낱말이 필요한 여러 때를 알았어요", "이 단원에서 배울 두 주제를 살펴봤어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"내 몸을 나타내는 낱말을 알아봐요", body:"눈·귀·손·발처럼 내 몸의 이름과 하는 일을 만나요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"말 대신 손짓했던 일", content:"“말로 못 하고 손으로 가리키기만 한 적 있나요?” 가볍게 물으면 ‘낱말이 필요했던 순간’을 떠올려요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"단원 길잡이 차시", content:"이 차시는 앞으로 배울 두 주제(나와 가족 / 학교와 이웃)를 안내하는 길잡이예요. 기대감을 키우는 데 집중해요.", fit_slides:["objective", "present"]},
    {id:"q_empathy", type:"fun_question", icon:"💡", title:"그거그거 했던 경험", content:"“‘그거 주세요’라고만 해서 못 알아들으셨던 적 있나요?” 공감하며 웃어 주면 모두가 마음을 엽니다.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"생활 장면으로 들기", content:"가게·병원·길처럼 아이가 겪는 장면을 들어 주면 ‘낱말이 왜 필요한지’가 머리가 아니라 경험으로 와닿아요.", fit_slides:["concept"]},
    {id:"x_need", type:"misconception", icon:"❓", title:"낱말은 시험용?", content:"낱말을 시험에 나오니까 외우는 것으로 여기기 쉬워요. 매일 부탁하고 묻는 ‘생활 도구’임을 짚어 주세요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"상황과 낱말 짝짓기", description:"상황과 알맞은 낱말을 짝지어 보세요.", hint:"이럴 때 어떤 낱말이 필요할까요?", pairs:[{a:{text:"🍞 빵집"}, b:{text:"빵"}}, {a:{text:"💧 목마를 때"}, b:{text:"물"}}, {a:{text:"🚌 타고 갈 것"}, b:{text:"버스"}}, {a:{text:"🏥 아플 때"}, b:{text:"병원"}}], fit_slides:["card_quiz"]},
    {id:"e_more", type:"extension", icon:"⬆", title:"또 어떤 때 필요할까", content:"“낱말이 없으면 곤란한 또 다른 때”를 아이들이 찾아보게 하면 낱말의 쓸모를 스스로 발견해요.", fit_slides:["card_quiz", "next_lesson"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"기대를 말로", content:"“어떤 낱말을 알고 싶어요?”에 한 명씩 답하게 하면 단원 학습에 대한 주인 의식이 생겨요.", fit_slides:["present"]},
    {id:"r_daily", type:"real_world", icon:"🌍", title:"하루에 쓰는 낱말", content:"아침부터 학교에 오기까지 쓴 낱말을 떠올리면 낱말이 생활 곳곳에 있다는 걸 느껴요.", fit_slides:["present", "summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"낱말이 필요했던 때", content:"“오늘 떠올린 ‘낱말이 필요했던 때’를 한 가지 말해 볼까요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"내 몸 이름 떠올리기", content:"다음 시간 ‘몸을 나타내는 낱말’을 위해, 알고 있는 몸 이름을 하나 떠올려 두게 해요.", fit_slides:["next_lesson"]}
  ]
};

  /* ── l09 이야기로 낱말 만나기 (학교 가는 길) ──────────────── */
  LESSONS["u4_l09"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 9,
    title: "이야기로 낱말 만나기",
    std: "[2국05-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 학교 가는 길 떠올리기 → 이야기 읽어주기 → 길에서 본 것 맞히기 → 내 길 이야기 발표"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"이야기로 낱말을 만나요", subtitle:"4단원 · 9/14차시 · 읽기·매체"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["학교 가는 길에 본 것을 떠올려요", "이야기를 듣고 낱말을 찾아요", "길에서 만난 것을 이야기해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"학교 오는 길에 무엇을 봤나요? 🚸", visual:"🚸", question:"오늘 아침, 학교 오는 길에<br>무엇을 보고 누구를 만났나요?"}, suggested_extras:["q_around"]},
    {id:"s04", stage:"만나기", block:"read_aloud", data:{
      title:"이야기를 함께 들어요 📖",
      author:"교사가 준비한 ‘길’ 이야기 그림책을 읽어 주세요",
      pages:[
        {img_hint:"그림책 표지", quote:"표지를 보여 주며 “어디로 가는 길일까요?”\n아이들이 자유롭게 말하게 해요."},
        {img_hint:"길을 걷는 장면", quote:"주인공이 길을 걸어가요.\n“길에서 무엇을 만날까요?” 물어봐요."},
        {img_hint:"여러 가게·사람이 나오는 장면", quote:"꽃집, 가구점, 치과… 여러 곳을 지나가요.\n“무슨 가게가 보이나요?” 함께 짚어 봐요."},
        {img_hint:"이야기 마무리 장면", quote:"“여러분의 학교 가는 길에는 무엇이 있나요?”\n뒤 활동(발표)으로 자연스럽게 이어 줘요."}
      ],
      copyright:"📖 교재·그림책 본문과 삽화는 화면에 담지 않았습니다. 교사가 수업 시간에 직접 책을 읽어 주거나 교재 사진을 보여 주세요. (저작권법 제25조 학교 수업 목적 이용)"
    }, suggested_extras:["t_read", "b_book", "q_connect"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"길에서 본 것, 맞혀 봐요!",
      sub:"이야기에 나온 곳을 그림으로 맞혀 봐요!",
      cards:[
        {clue:"🌷<br>꽃을 파는 곳", emoji:"🌷", name:"꽃집"},
        {clue:"🦷<br>이를 치료하는 곳", emoji:"🦷", name:"치과"},
        {clue:"🚦<br>길 건널 때 색이 바뀌어요", emoji:"🚦", name:"신호등"}
      ],
      outro:"길에는 이렇게 많은 낱말이 숨어 있어요!"
    }, suggested_extras:["g_match", "x_listen", "e_creative"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"내 학교 가는 길 이야기 🎤",
      sub:"학교 오는 길에 본 것을 친구들에게 말해요!",
      count:24,
      hint:"“나는 학교 오는 길에 **○○**을 봤어요” 처럼 말해요 (예: 빵집을 봤어요)",
      end_msg:"저마다 다른 길 이야기가 가득하네요! 👏"
    }, suggested_extras:["t_present", "r_home"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["학교 가는 길에 본 것을 떠올렸어요", "이야기를 듣고 낱말을 찾았어요", "내 길 이야기를 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"길에서 본 낱말을 넣어 말해 봐요", body:"신호등·버스·꽃집 같은 낱말로 문장을 만들어요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"오늘 길에서 만난 것", content:"“오늘 학교 오면서 가장 먼저 본 게 뭐였어요?”로 시작하면 모든 아이가 자기 길을 떠올려요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"듣고 떠올리기", content:"이 차시는 ‘이야기를 듣고 낱말을 찾아 자기 경험으로 잇기’가 핵심이에요. 발표보다 듣기·떠올리기에 시간을 넉넉히 둬요.", fit_slides:["objective", "read_aloud"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"눈 감고 길 떠올리기", content:"눈을 감고 학교 오는 길을 머릿속으로 걸어 보게 한 뒤 “무엇이 보였나요?” 물으면 떠올리기가 깊어져요.", fit_slides:["motivate"]},
    {id:"t_read", type:"tip", icon:"🧩", title:"읽어주기는 천천히, 발문과 함께", content:"한 장면마다 멈춰 “무엇이 보이나요?”, “다음엔 뭐가 나올까요?” 발문을 끼우면 듣기가 살아 있는 활동이 돼요.", fit_slides:["read_aloud"]},
    {id:"b_book", type:"book", icon:"📖", title:"길·동네 주제 그림책 고르기", content:"주인공이 길을 걸으며 여러 장소·사람을 만나는 그림책이면 이 차시에 잘 맞아요. 도서관에서 ‘길·동네·산책’ 주제로 찾아보세요.", source:"학교·지역 도서관 그림책 코너", fit_slides:["read_aloud"]},
    {id:"q_connect", type:"fun_question", icon:"💡", title:"나와 연결 짓기", content:"“책 속 길에는 이게 있었네요. 그럼 여러분 길에는요?” 책과 자기 경험을 잇는 발문으로 발표를 준비시켜요.", fit_slides:["read_aloud", "present"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"장소와 하는 일 짝짓기", description:"길에서 보는 장소와 하는 일을 짝지어 보세요.", hint:"그곳에서 무엇을 하나요?", pairs:[{a:{text:"🌷 꽃집"}, b:{text:"꽃을 사요"}}, {a:{text:"🦷 치과"}, b:{text:"이를 고쳐요"}}, {a:{text:"🍞 빵집"}, b:{text:"빵을 사요"}}, {a:{text:"🚦 신호등"}, b:{text:"길을 건너요"}}], fit_slides:["card_quiz"]},
    {id:"x_listen", type:"misconception", icon:"❓", title:"듣기는 쉬는 시간?", content:"이야기를 들을 때 가만히 있는 걸 ‘쉬는 것’으로 여기기 쉬워요. 들으며 낱말을 찾는 것도 어엿한 공부임을 짚어 주세요.", fit_slides:["card_quiz", "read_aloud"]},
    {id:"e_creative", type:"extension", icon:"⬆", title:"내 길 상상해 그리기", content:"“내 학교 가는 길에 신기한 것이 나타난다면?” 상상해 말하거나 그리게 하면 정답이 없는 창의 활동이 돼요. 점수가 아니라 독창성을 칭찬해요.", fit_slides:["card_quiz", "present"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"한 가지만 또렷이", content:"길에서 본 것 ‘한 가지’만 또렷이 말하게 하면 모든 아이가 부담 없이 발표할 수 있어요.", fit_slides:["present"]},
    {id:"r_home", type:"real_world", icon:"🌍", title:"집 가는 길 살펴보기", content:"집에 가는 길에 본 가게·장소를 떠올려 말하면 오늘 배운 낱말이 생활과 매체로 이어져요.", fit_slides:["present", "summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 기억 남은 곳", content:"“오늘 이야기에서 가장 기억에 남은 곳이 있나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"길에서 본 것 한 가지", content:"다음 시간 ‘낱말을 넣어 말하기’를 위해, 오늘 길에서 본 것을 한 가지 기억해 두게 해요.", fit_slides:["next_lesson"]}
  ]
};

  /* ── l10 낱말을 넣어 말하기 ───────────────────────────────── */
  LESSONS["u4_l10"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 10,
    title: "낱말을 넣어 말하기",
    std: "[2국01-04]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 동네 떠올리기 → 낱말을 넣어 말하기 → 이웃 장소 맞히기 → 문장으로 말하기 발표"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말을 넣어 말해요", subtitle:"4단원 · 10/14차시 · 듣기·말하기"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["이웃에서 보는 낱말을 알아요", "낱말을 넣어 문장으로 말해요", "길에서 본 것을 문장으로 표현해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리 동네엔 무엇이 있을까? 🏘", visual:"🏘", question:"우리 동네 길에는<br>어떤 가게와 장소가 있나요?"}, suggested_extras:["q_around"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"낱말을 넣어 말하기",
      content:"낱말 하나만 말하기보다 **낱말을 넣어 문장으로** 말하면 내 생각이 더 잘 전해져요!",
      symbol_meanings:[
        {symbol:"신호등 🚦", meaning:"건널 때 봐요"},
        {symbol:"버스 🚌", meaning:"타고 가요"},
        {symbol:"빵집 🍞", meaning:"빵을 사요"},
        {symbol:"가게 🏪", meaning:"물건을 사요"}
      ]
    }, suggested_extras:["t_concept", "x_word"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"무엇을 하는 곳일까요?",
      sub:"그림을 보고 어떤 곳인지 맞혀 봐요!",
      cards:[
        {clue:"🪑<br>가구를 파는 곳", emoji:"🪑", name:"가구점"},
        {clue:"🥬<br>채소를 파는 곳", emoji:"🥬", name:"야채 가게"},
        {clue:"👮<br>우리를 지켜 주는 분이 있는 곳", emoji:"👮", name:"경찰서"}
      ],
      outro:"이제 이 낱말을 넣어 문장으로 말해 볼까요?"
    }, suggested_extras:["g_match", "e_more"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"낱말을 넣어 말해 봐요 🎤",
      sub:"배운 낱말을 넣어 한 문장으로 말해요!",
      count:24,
      hint:"“나는 길에서 **○○**을 봤어요” / “**○○**에서 **○○**을 해요” 처럼 말해요",
      end_msg:"낱말을 넣으니 말이 더 또렷해졌어요! 👏"
    }, suggested_extras:["t_present", "q_why"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["이웃에서 보는 낱말을 알았어요", "낱말을 넣어 문장으로 말했어요", "길에서 본 것을 표현했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낱말을 그림 글자로 재미있게 꾸며 봐요", body:"글자 모양에 물건 그림을 넣어 나만의 그림 글자를 만들어요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"집 앞에 뭐가 있나요?", content:"“집에서 나오면 제일 먼저 뭐가 보여요?” 가볍게 물어 동네 낱말로 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"낱말 → 문장", content:"이 차시 핵심은 ‘낱말을 문장 속에 넣어 말하기’예요. 낱말만 말한 아이에게 “그걸 넣어 한 문장으로 말해 볼까?”로 이어 주세요.", fit_slides:["objective", "concept"]},
    {id:"q_around", type:"fun_question", icon:"💡", title:"우리 동네 자랑", content:"“우리 동네에서 제일 자주 가는 곳은 어디예요?”로 물으면 동네 낱말이 자연스럽게 나와요.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"문장이 더 잘 통해요", content:"‘버스’보다 ‘버스를 타고 가요’가 더 잘 통한다는 걸 직접 비교해 들려주면 문장의 힘을 느껴요.", fit_slides:["concept"]},
    {id:"x_word", type:"misconception", icon:"❓", title:"낱말만 말해도 될까?", content:"낱말 한 개만 던지듯 말하는 것에 익숙한 아이가 많아요. 낱말을 넣어 문장으로 말하면 듣는 사람이 더 잘 안다는 걸 짚어요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"장소와 물건 짝짓기", description:"장소와 거기서 볼 수 있는 것을 짝지어 보세요.", hint:"그곳에서 무엇을 파나요?", pairs:[{a:{text:"🪑 가구점"}, b:{text:"가구"}}, {a:{text:"🥬 야채 가게"}, b:{text:"채소"}}, {a:{text:"🍞 빵집"}, b:{text:"빵"}}, {a:{text:"🌷 꽃집"}, b:{text:"꽃"}}], fit_slides:["card_quiz"]},
    {id:"e_more", type:"extension", icon:"⬆", title:"더 많은 동네 낱말", content:"우체국·도서관·소방서처럼 더 많은 동네 장소 낱말을 함께 모으면 어휘가 풍성해져요.", fit_slides:["card_quiz", "next_lesson"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"한 문장부터", content:"“나는 ○○을 봤어요” 한 문장이면 충분해요. 잘하는 아이에게는 “그래서 어땠어요?”를 한 마디 더 붙이게 해요.", fit_slides:["present"]},
    {id:"q_why", type:"fun_question", icon:"💡", title:"거기서 무엇을 했나요?", content:"“그 가게에서 무엇을 했어요?”라고 한 번 더 물으면 단순 나열이 자기 이야기로 자라요.", fit_slides:["present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"오늘 만든 문장", content:"“오늘 만든 문장 중에 기억에 남는 게 있나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"좋아하는 낱말 하나", content:"다음 시간 ‘그림 글자 만들기’를 위해, 그림으로 꾸미고 싶은 낱말을 하나 떠올려 두게 해요.", fit_slides:["next_lesson"]}
  ]
};

  /* ── l11 그림글자 만들기 ─────────────────────────────────── */
  LESSONS["u4_l11"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 11,
    title: "그림 글자 만들기",
    std: "[2국05-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 글자가 그림이 되면 → 그림 글자 개념 → 그림 글자 맞히기 → 내 그림 글자 소개"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"그림 글자를 만들어요", subtitle:"4단원 · 11/14차시 · 실천·매체"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["그림 글자가 무엇인지 알아요", "낱말을 그림 글자로 꾸며요", "내 그림 글자를 친구에게 소개해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"글자가 그림이 된다면? 🎨", visual:"🎨", question:"‘우산’의 ㅜ를 우산 모양으로 그리면<br>어떤 모습일까요?"}, suggested_extras:["q_imagine"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"그림 글자란?",
      content:"낱말의 **자음자·모음자에 물건 모습**을 넣어 그리는 거예요. 글자만 봐도 무슨 낱말인지 알 수 있어요!",
      symbol_meanings:[
        {symbol:"우산 ☂", meaning:"ㅜ를 우산 모양으로"},
        {symbol:"연필 ✏", meaning:"ㅣ를 연필 모양으로"},
        {symbol:"나무 🌳", meaning:"ㅁ을 나무 모양으로"},
        {symbol:"풍선 🎈", meaning:"ㅇ을 풍선 모양으로"}
      ]
    }, suggested_extras:["t_concept", "x_draw"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"무슨 그림 글자일까요?",
      sub:"물건 모습이 들어간 글자를 보고 낱말을 맞혀 봐요!",
      cards:[
        {clue:"☂<br>비 올 때 쓰는 것", emoji:"☂", name:"우산"},
        {clue:"✏<br>글씨를 쓰는 것", emoji:"✏", name:"연필"},
        {clue:"🎈<br>바람을 넣어 부는 것", emoji:"🎈", name:"풍선"}
      ],
      outro:"이제 내가 좋아하는 낱말로 그림 글자를 만들어 볼까요?"
    }, suggested_extras:["g_match", "e_more"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"내 그림 글자 소개하기 🎤",
      sub:"내가 만든 그림 글자를 친구들에게 소개해요!",
      count:24,
      hint:"“제 그림 글자는 **○○**이에요. **○** 자를 **○○** 모양으로 꾸몄어요” 처럼 말해요",
      end_msg:"저마다 멋진 그림 글자가 가득하네요! 🎨"
    }, suggested_extras:["t_present", "q_show"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["그림 글자가 무엇인지 알았어요", "낱말을 그림 글자로 꾸몄어요", "내 그림 글자를 소개했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낱말을 이어 말하는 놀이를 해 봐요", body:"“학교에 가면…” 친구들과 낱말을 이어 말하는 놀이를 즐겨요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"글자에 그림 숨기기", content:"“글자 안에 그림을 숨길 수 있을까요?”로 호기심을 자극하면 그림 글자 활동이 기대돼요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"낱말 표현이 핵심", content:"이 차시는 그림 솜씨가 아니라 ‘낱말을 그림으로 표현하기’가 목적이에요. 단순한 모양이어도 낱말이 드러나면 충분해요.", fit_slides:["objective", "concept"]},
    {id:"q_imagine", type:"fun_question", icon:"💡", title:"어떤 글자에 뭘 넣을까", content:"“내 이름 글자에 무엇을 넣으면 좋을까요?”로 물으면 그림 글자를 자기 것으로 떠올려요.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"한 글자에 한 그림", content:"낱말 전체를 다 꾸미려다 어려워하면, ‘한 글자에 한 그림’만 넣게 하면 누구나 성공해요.", fit_slides:["concept"]},
    {id:"x_draw", type:"misconception", icon:"❓", title:"그림을 잘 그려야?", content:"“그림을 못 그려서 못 해요”라고 망설이기 쉬워요. 동그라미·세모로도 낱말이 보이면 멋진 그림 글자라고 격려해요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"그림 글자와 낱말 짝짓기", description:"물건 그림과 낱말을 짝지어 보세요.", hint:"그림이 어떤 낱말의 글자가 될까요?", pairs:[{a:{text:"☂ 우산"}, b:{text:"ㅜ"}}, {a:{text:"✏ 연필"}, b:{text:"ㅣ"}}, {a:{text:"🎈 풍선"}, b:{text:"ㅇ"}}, {a:{text:"🌳 나무"}, b:{text:"ㅁ"}}], fit_slides:["card_quiz"]},
    {id:"e_more", type:"extension", icon:"⬆", title:"좋아하는 낱말로", content:"내가 좋아하는 책 제목이나 소중한 낱말로 그림 글자를 만들면 애정이 담겨 더 즐거워요.", fit_slides:["card_quiz", "present"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"어디를 어떻게 꾸몄나", content:"“어느 글자를 무슨 모양으로 꾸몄는지” 한 가지만 말하게 하면 발표가 또렷해져요.", fit_slides:["present"]},
    {id:"q_show", type:"fun_question", icon:"💡", title:"같은 낱말 다르게", content:"같은 낱말을 서로 다르게 꾸민 친구를 찾아 비교하면 표현이 다양함을 느껴요.", fit_slides:["present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 마음에 든 글자", content:"“오늘 만든 그림 글자 중 가장 마음에 드는 글자가 있나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"집 물건으로 그림 글자", content:"집에서 본 물건 이름으로 그림 글자를 하나 더 만들어 오면 다음 놀이에 쓸 낱말이 풍성해져요.", fit_slides:["next_lesson"]}
  ]
};

  /* ── l12 이어 말하기 놀이 ─────────────────────────────────── */
  LESSONS["u4_l12"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 12,
    title: "이어 말하기 놀이",
    std: "[2국01-04]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 학교에 가면 → 이어 말하기 규칙 → 주제 낱말 떠올리기 → 이어 말하기 발표"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"낱말을 이어 말해요", subtitle:"4단원 · 12/14차시 · 듣기·말하기"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["낱말 이어 말하기 놀이를 알아요", "앞 친구 말을 잘 듣고 이어요", "배운 낱말로 이어 말해요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"학교에 가면 무엇이 있을까? 🏫", visual:"🏫", question:"“학교에 가면 책상도 있고…”<br>다음엔 무엇을 이어 말할까요?"}, suggested_extras:["q_warm"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"이어 말하기 놀이",
      content:"앞 친구가 말한 낱말을 **잘 듣고 기억한 뒤, 새 낱말을 보태** 말해요. 잘 들을수록 더 잘 이을 수 있어요!",
      symbol_meanings:[
        {symbol:"듣기 👂", meaning:"앞 친구 말을 들어요"},
        {symbol:"기억 🧠", meaning:"나온 낱말을 떠올려요"},
        {symbol:"보태기 ➕", meaning:"새 낱말을 더해요"},
        {symbol:"말하기 🗣", meaning:"이어서 말해요"}
      ]
    }, suggested_extras:["t_concept", "x_repeat"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"어떤 낱말을 이을까요?",
      sub:"주제에 맞는 낱말을 떠올려 봐요!",
      cards:[
        {clue:"🏫<br>학교에 가면 보이는 것", emoji:"📚", name:"책상"},
        {clue:"🏘<br>동네에서 보이는 것", emoji:"🚦", name:"신호등"},
        {clue:"👨‍👩‍👧<br>우리 집에 있는 사람", emoji:"👵", name:"할머니"}
      ],
      outro:"이제 우리도 낱말을 이어 말해 볼까요?"
    }, suggested_extras:["g_theme", "e_more"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"“학교에 가면” 이어 말하기 🎤",
      sub:"앞 친구 낱말에 새 낱말을 보태 이어 말해요!",
      count:24,
      hint:"“학교에 가면 **○○**도 있고, **○○**도 있다” 처럼 이어 말해요",
      end_msg:"모두 잘 듣고 멋지게 이어 말했어요! 👏"
    }, suggested_extras:["t_present", "q_listen"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["이어 말하기 놀이를 알았어요", "앞 친구 말을 잘 들었어요", "배운 낱말로 이어 말했어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"단원에서 배운 낱말을 정리해 봐요", body:"숨은 낱말을 찾고 그림과 낱말을 이어요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"끝말잇기 해 봤나요?", content:"“끝말잇기 해 본 적 있어요?”로 시작하면 말놀이의 즐거움을 떠올리며 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"잘 듣기가 곧 놀이", content:"이 놀이의 핵심은 ‘잘 듣기’예요. 빨리 말하기 경쟁이 아니라 앞 친구 말을 기억하는 데 초점을 두세요.", fit_slides:["objective", "concept"]},
    {id:"q_warm", type:"fun_question", icon:"💡", title:"손뼉 박자 맞추기", content:"손뼉 박자(짝-짝)에 맞춰 시작하면 모든 아이가 리듬을 타며 즐겁게 참여해요.", fit_slides:["motivate"]},
    {id:"t_concept", type:"tip", icon:"🧩", title:"주제를 정해 두기", content:"‘학교/동네/가족’처럼 주제를 먼저 정하면 아이들이 낱말을 떠올리기 쉬워요.", fit_slides:["concept"]},
    {id:"x_repeat", type:"misconception", icon:"❓", title:"빨리 말해야 잘하는 것?", content:"빨리 말하려다 앞 낱말을 빠뜨리기 쉬워요. 천천히라도 앞 낱말을 다 이으면 더 잘하는 것임을 알려 주세요.", fit_slides:["concept", "present"]},
    {id:"g_theme", type:"game", game_kind:"memory_match", icon:"🎮", title:"주제와 낱말 짝짓기", description:"주제와 거기 어울리는 낱말을 짝지어 보세요.", hint:"이 낱말은 어디에 어울릴까요?", pairs:[{a:{text:"🏫 학교"}, b:{text:"책상"}}, {a:{text:"🏘 동네"}, b:{text:"신호등"}}, {a:{text:"👨‍👩‍👧 가족"}, b:{text:"할머니"}}, {a:{text:"🧒 몸"}, b:{text:"손"}}], fit_slides:["card_quiz"]},
    {id:"e_more", type:"extension", icon:"⬆", title:"다른 주제로 놀기", content:"“시장에 가면”, “바다에 가면”처럼 주제를 바꿔 놀면 더 많은 낱말을 떠올려요.", fit_slides:["card_quiz", "present"]},
    {id:"t_present", type:"tip", icon:"🧩", title:"앞 낱말 함께 외치기", content:"이어 말하기 전에 반 전체가 앞 낱말을 함께 외워 주면, 발표하는 아이의 부담이 줄어요.", fit_slides:["present"]},
    {id:"q_listen", type:"fun_question", icon:"💡", title:"잘 들은 친구 칭찬", content:"앞 낱말을 빠짐없이 이은 친구를 “귀가 밝은 친구”라고 칭찬하면 듣기 태도가 자라요.", fit_slides:["present"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"가장 길게 이은 낱말", content:"“우리 반이 몇 개까지 이었는지 기억나나요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"집에서 이어 말하기", content:"집에서 가족과 “냉장고에 가면” 이어 말하기를 해 보면 놀이가 생활로 이어져요.", fit_slides:["next_lesson"]}
  ]
};

  /* ── l13 단원 정리 ────────────────────────────────────────── */
  LESSONS["u4_l13"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 13,
    title: "단원 정리",
    std: "[2국02-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 배운 주제 돌아보기 → 주제별 낱말 → 초성으로 낱말 찾기 → 그림과 낱말 잇기"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"배운 낱말을 정리해요", subtitle:"4단원 · 13/14차시 · 단원 정리"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["단원에서 배운 낱말을 떠올려요", "숨은 낱말을 찾아요", "그림과 낱말을 이어요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"우리가 배운 낱말, 얼마나 기억날까? 🔍", visual:"🔍", question:"몸·가족·학교·이웃…<br>어떤 낱말을 배웠는지 떠올려 봐요!"}, suggested_extras:["q_recall"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"이 단원에서 배운 낱말",
      content:"네 가지 주제로 많은 낱말을 배웠어요. 함께 떠올려 봐요!",
      symbol_meanings:[
        {symbol:"나와 몸 🧒", meaning:"눈·귀·손·발"},
        {symbol:"가족 👨‍👩‍👧", meaning:"할머니·아버지·동생"},
        {symbol:"학교 🏫", meaning:"교실·운동장·급식실"},
        {symbol:"이웃 🏘", meaning:"가게·병원·우체국"}
      ]
    }, suggested_extras:["t_review", "x_recall"]},
    {id:"s05", stage:"활동", block:"chosung_quiz", data:{
      title:"숨은 낱말을 초성으로 찾아 봐요!",
      sub:"가운데 큰 글자를 보고 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요",
      items:[
        {chosung:"ㄱ ㅈ", answer:"가족", emoji:"👨‍👩‍👧", hint:"함께 사는 소중한 사람들!"},
        {chosung:"ㄱ ㅅ", answer:"교실", emoji:"🏫", hint:"우리가 공부하는 곳!"},
        {chosung:"ㄲ ㅈ", answer:"꽃집", emoji:"🌷", hint:"예쁜 꽃을 파는 곳!"},
        {chosung:"ㅅ ㅎ ㄷ", answer:"신호등", emoji:"🚦", hint:"길 건널 때 색이 바뀌어요!"},
        {chosung:"ㅅ ㅅ ㄴ", answer:"선생님", emoji:"🧑‍🏫", hint:"우리를 가르쳐 주시는 분!"}
      ]
    }, suggested_extras:["t_chosung", "e_game"]},
    {id:"s06", stage:"활동", block:"card_quiz", data:{
      title:"그림과 낱말을 이어 봐요",
      sub:"그림을 보고 알맞은 낱말을 맞혀 봐요!",
      cards:[
        {clue:"🚒<br>삐뽀삐뽀 불을 꺼요", emoji:"🚒", name:"소방차"},
        {clue:"🍜<br>후루룩 먹는 긴 면", emoji:"🍜", name:"국수"},
        {clue:"👫<br>도란도란 함께 노는 사이", emoji:"👫", name:"친구"}
      ],
      outro:"배운 낱말을 잘 기억하고 있네요! 👏"
    }, suggested_extras:["g_match", "q_proud"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["단원에서 배운 낱말을 떠올렸어요", "숨은 낱말을 찾았어요", "그림과 낱말을 이었어요"]}, suggested_extras:["q_reflect"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"다음 시간 예고", preview:"낱말을 바르게 읽고 쓰는 힘을 길러요", body:"학습에 자주 쓰는 낱말을 읽고 글씨를 바르게 써 봐요!"}, suggested_extras:["e_plan"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"기억에 남는 낱말", content:"“이 단원에서 가장 기억에 남는 낱말이 뭐예요?”로 시작하면 정리 분위기로 자연스럽게 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"즐겁게 되짚기", content:"정리 차시는 시험이 아니라 ‘즐겁게 떠올리기’예요. 못 맞혀도 함께 힌트를 보며 다시 떠올리게 해 주세요.", fit_slides:["objective", "chosung_quiz"]},
    {id:"q_recall", type:"fun_question", icon:"💡", title:"주제 손가락 꼽기", content:"몸·가족·학교·이웃, 네 주제를 손가락으로 하나씩 꼽으며 떠올리면 단원 전체가 한눈에 들어와요.", fit_slides:["motivate"]},
    {id:"t_review", type:"tip", icon:"🧩", title:"주제별로 돌아보기", content:"한 주제씩 “여기서 배운 낱말 누가 말해 볼까?”로 짚으면 흩어진 낱말이 묶음으로 정리돼요.", fit_slides:["concept"]},
    {id:"x_recall", type:"misconception", icon:"❓", title:"다 외워야 한다?", content:"모든 낱말을 완벽히 외워야 한다고 부담 가질 수 있어요. 떠올려 보고 다시 만나는 것만으로도 충분히 자란다고 안심시켜요.", fit_slides:["concept", "chosung_quiz"]},
    {id:"t_chosung", type:"tip", icon:"🧩", title:"초성은 천천히 함께", content:"초성을 보고 바로 못 맞히면 힌트를 먼저 읽어 주고, 반 전체가 함께 소리 내어 답하게 하면 부담이 줄어요.", fit_slides:["chosung_quiz"]},
    {id:"e_game", type:"extension", icon:"⬆", title:"낱말 빙고 놀이", content:"배운 낱말로 작은 빙고판을 만들어 놀면 정리가 신나는 놀이가 돼요.", fit_slides:["chosung_quiz", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"흉내말과 낱말 짝짓기", description:"흉내말과 어울리는 낱말을 짝지어 보세요.", hint:"이 소리는 무엇과 어울릴까요?", pairs:[{a:{text:"🚒 소방차"}, b:{text:"삐뽀삐뽀"}}, {a:{text:"🍜 국수"}, b:{text:"후루룩"}}, {a:{text:"✏ 연필"}, b:{text:"사각사각"}}, {a:{text:"👫 친구"}, b:{text:"도란도란"}}], fit_slides:["card_quiz"]},
    {id:"q_proud", type:"fun_question", icon:"💡", title:"가장 잘 아는 낱말", content:"“이제 자신 있게 읽을 수 있는 낱말이 있나요?”로 물으면 아이들이 자신의 성장을 느껴요.", fit_slides:["card_quiz", "summary"]},
    {id:"q_reflect", type:"fun_question", icon:"💡", title:"새로 안 낱말", content:"“이 단원에서 새로 알게 된 낱말을 한 가지 말해 볼까요?” 되짚으며 마무리해요.", fit_slides:["summary"]},
    {id:"e_plan", type:"extension", icon:"⬆", title:"자주 쓰는 낱말 떠올리기", content:"다음 시간 ‘기초 다지기’를 위해, 공부할 때 자주 보는 낱말(있다·없다·읽다 등)을 떠올려 두게 해요.", fit_slides:["next_lesson"]}
  ]
};

  /* ── l14 기초 다지기 ─────────────────────────────────────── */
  LESSONS["u4_l14"] = {
  meta: {
    grade: 1, subject: "국어", unit: 4, n: 14,
    title: "기초 다지기",
    std: "[2국04-01]",
    duration_min: 40,
    lesson_format: "교사주도 8슬 — 학습 도구어 만나기 → 뜻 알기 → 뜻 맞히기 → 바르게 읽고 쓰기 → 단원 마무리"
  },
  slides: [
    {id:"s01", stage:"열기", block:"cover", data:{title:"바르게 읽고 써요", subtitle:"4단원 · 14/14차시 · 기초 다지기"}, suggested_extras:["q_open", "t_goal"]},
    {id:"s02", stage:"열기", block:"objective", data:{title:"오늘 우리가 할 일", bullets:["학습에 자주 쓰는 낱말을 알아요", "낱말의 뜻을 이해해요", "낱말을 바르게 읽고 써요"]}, suggested_extras:["t_goal"]},
    {id:"s03", stage:"만나기", block:"motivate", data:{scene_title:"이 낱말, 무슨 뜻일까? 🧐", visual:"🧐", question:"‘있다’, ‘없다’, ‘읽다’, ‘차례’…<br>공부할 때 자주 쓰는 낱말이에요!"}, suggested_extras:["q_meet"]},
    {id:"s04", stage:"만나기", block:"concept", data:{
      title:"학습에 자주 쓰는 낱말",
      content:"공부할 때 자주 만나는 낱말이에요. 뜻을 알면 책과 문제를 더 잘 이해할 수 있어요!",
      symbol_meanings:[
        {symbol:"있다", meaning:"어떤 곳에 머물러요"},
        {symbol:"없다", meaning:"실제로 있지 않아요"},
        {symbol:"읽다", meaning:"글자를 보고 소리 내요"},
        {symbol:"차례", meaning:"순서대로 돌아오는 기회"}
      ]
    }, suggested_extras:["t_meaning", "x_tool"]},
    {id:"s05", stage:"활동", block:"card_quiz", data:{
      title:"무슨 뜻일까요?",
      sub:"낱말의 뜻을 보고 어떤 낱말인지 맞혀 봐요!",
      cards:[
        {clue:"📖<br>글자를 보고 소리 내어 말하기", emoji:"📖", name:"읽다"},
        {clue:"🔢<br>순서대로 돌아오는 기회", emoji:"🔢", name:"차례"},
        {clue:"✅<br>어떤 곳에 머물러 있음", emoji:"✅", name:"있다"}
      ],
      outro:"학습 낱말의 뜻을 잘 알았어요!"
    }, suggested_extras:["g_match", "e_more"]},
    {id:"s06", stage:"발표", block:"present", data:{
      title:"바르게 읽고 써 보기 🎤",
      sub:"낱말을 또박또박 읽고, 바르게 써 봐요!",
      count:24,
      hint:"‘나·동생·가족·학교·선생님·과일·공원’을 또박또박 읽고, 한 글자씩 바르게 써 봐요",
      end_msg:"한 단원을 멋지게 마쳤어요! 정말 잘했어요 👏"
    }, suggested_extras:["t_write", "r_book"]},
    {id:"s07", stage:"정리", block:"summary", data:{title:"오늘 배운 것", points:["학습에 자주 쓰는 낱말을 알았어요", "낱말의 뜻을 이해했어요", "낱말을 바르게 읽고 썼어요"]}, suggested_extras:["q_proud"]},
    {id:"s08", stage:"정리", block:"next_lesson", data:{title:"단원을 마치며", preview:"여러 가지 낱말로 더 넓은 세상을 만나요", body:"낱말을 많이 알수록 생각도, 이야기도 더 풍성해져요!"}, suggested_extras:["e_celebrate"]}
  ],
  extras: [
    {id:"q_open", type:"fun_question", icon:"💡", title:"책에서 본 낱말", content:"“책이나 문제에서 자주 본 낱말이 있나요?”로 시작하면 학습 도구어로 자연스럽게 들어가요.", fit_slides:["cover", "motivate"]},
    {id:"t_goal", type:"tip", icon:"🧩", title:"따라 읽기 중심", content:"학습 도구어는 글자 짜임 분석보다 ‘교사를 따라 또박또박 읽기’ 중심으로 다루면 부담 없이 익혀요.", fit_slides:["objective", "concept"]},
    {id:"q_meet", type:"fun_question", icon:"💡", title:"어디서 만났더라?", content:"“‘차례’라는 낱말, 어디서 들어봤어요?”처럼 경험과 이으면 뜻이 더 잘 와닿아요.", fit_slides:["motivate"]},
    {id:"t_meaning", type:"tip", icon:"🧩", title:"뜻은 예문으로", content:"“‘있다’는 ‘책상 위에 연필이 있다’처럼 써요”라고 예문으로 보여 주면 뜻이 또렷해져요.", fit_slides:["concept"]},
    {id:"x_tool", type:"misconception", icon:"❓", title:"쉬운 낱말이라 그냥 넘김?", content:"‘있다·없다’ 같은 낱말은 쉬워 보여 그냥 넘기기 쉬워요. 하지만 문제를 이해하는 데 꼭 필요한 낱말임을 짚어 주세요.", fit_slides:["concept", "card_quiz"]},
    {id:"g_match", type:"game", game_kind:"memory_match", icon:"🎮", title:"낱말과 뜻 짝짓기", description:"학습 낱말과 뜻을 짝지어 보세요.", hint:"이 낱말은 무슨 뜻일까요?", pairs:[{a:{text:"읽다"}, b:{text:"소리 내어 말하기"}}, {a:{text:"있다"}, b:{text:"머물러 있음"}}, {a:{text:"없다"}, b:{text:"있지 않음"}}, {a:{text:"차례"}, b:{text:"돌아오는 순서"}}], fit_slides:["card_quiz"]},
    {id:"e_more", type:"extension", icon:"⬆", title:"또 다른 학습 낱말", content:"‘찾다·고르다·잇다’처럼 수업에서 자주 듣는 낱말을 더 모으면 학습 어휘가 자라요.", fit_slides:["card_quiz", "present"]},
    {id:"t_write", type:"tip", icon:"🧩", title:"바르게 쓰는 자세", content:"또박또박 쓰기 전에 연필 잡는 법·바른 자세를 한 번 짚어 주면 글씨가 한결 단정해져요.", fit_slides:["present"]},
    {id:"r_book", type:"real_world", icon:"🌍", title:"교과서에서 찾기", content:"오늘 배운 낱말을 다른 교과서나 안내문에서 찾아보면 학습 낱말이 곳곳에 쓰임을 알아요.", fit_slides:["present", "summary"]},
    {id:"q_proud", type:"fun_question", icon:"💡", title:"단원을 돌아보며", content:"“이 단원을 지나며 새로 알게 된 낱말이 정말 많죠?” 성장을 짚어 주며 마무리해요.", fit_slides:["summary"]},
    {id:"e_celebrate", type:"extension", icon:"⬆", title:"낱말 모으기 이어가기", content:"앞으로도 새 낱말을 만날 때마다 ‘나만의 낱말 공책’에 모으면 낱말 세계가 계속 넓어져요.", fit_slides:["next_lesson"]}
  ]
};
