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
