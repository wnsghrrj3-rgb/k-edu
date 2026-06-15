/* ============================================================================
   1학년 수학 1단원 (9까지의 수) 차시 데이터
   - 키 형식: LESSONS["u{N}_l{NN}"]
   - 차시 데이터: { meta:{title,subtitle,std,duration}, slides:[...], extras:[...] }
   - 본 파일은 1단원 모든 차시를 누적함 (정리 채팅이 lessons/g1_math_u1_l*.json
     19개를 가공해 누적할 자리). 현재는 8차시(시범 이식분)만 들어 있음.
   ============================================================================ */

(function () {

  // ─────────── 1차시: 단원 도입 (학교가 즐거워요) ───────────
  // 안 B 단원 진입 자리. 본 차시 X. 점수·평가 X. 분위기·동기 유발 중심.
  LESSONS["u1_l01"] = {
    meta: {
      title: "1학년 수학 1단원 1차시",
      subtitle: "단원 도입 — 학교가 즐거워요",
      std: "[2수01-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"1단원 시작\n9까지의 수\n학교가 즐거워요",emoji:""},suggested_extras:["v_school_song","r_first_day"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"학교 가는 길에 무엇이 보일까요?",kids:[{face:"🙂",label:"우리 동네"},{face:"🙂",label:"학교 가는 길"}],question:"여러분이 학교에 올 때 본 것을 떠올려 봐요"},suggested_extras:["q_fun_morning","r_school_road","q_fun_pet"]},
  {id:"s03",stage:"도입",block:"question",data:{title:"수를 셀 수 있는 것을 찾아볼까요?",content:"학교 가는 길에 무엇이 몇 개 있었나요?\n친구는? 자동차는? 가로수는?"},suggested_extras:["m_count_anything","x_count_kinds"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"학교 가는 길을 꾸며 봐요",bidirect:["**들판** · **연못** · **길** · **학교**","↓","다람쥐 · 토끼 · 오리 · 나비 · 물고기 · 개구리 · 참새 · 벌 · 꽃","↓","원하는 자리에 두기"]},suggested_extras:["a_decorate_road","r_nature_walk"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"내가 꾸민 그림에서",ten_frame_solo:{count:0,is_anchor:true,label:"무엇을 세고 싶나요?"},sub_text:"동물 · 식물 · 사람 · 물건 — 어떤 것이라도 좋아요"},suggested_extras:["q_fun_count_things","x_kinds_vs_amount"]},
  {id:"s06",stage:"전개",block:"compare",data:{title:"비슷한 것끼리 모아 보면?",items:[{ten_frame:0,num:0,caption:"**동물**들끼리"},{ten_frame:0,num:0,caption:"기준",is_anchor:true},{ten_frame:0,num:0,caption:"**식물**들끼리"}]},suggested_extras:["m_grouping_tip"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"단원에서 함께할 약속",bidirect:["① **수를 세어** 준비물을 챙겨요","② **수를 찾아** 말해 봐요","③ **수와 함께** 놀아요"]},suggested_extras:["r_school_supply","a_promise_card"]},
  {id:"s08",stage:"전개",block:"motivate",data:{scene_title:"실천 약속 살펴보기",kids:[{face:"😊",label:"준비물 챙기기"},{face:"😊",label:"수 찾아 말하기"},{face:"😊",label:"수 놀이하기"}],question:"이 중에서 마음에 드는 약속 두세 가지를 골라요"},suggested_extras:["a_promise_select"]},

  // ===== 기본 (3) =====
  {id:"s09",stage:"기본문제",block:"advanced_problem",data:{title:"꾸민 그림에서 동물을 세어 볼까요?",challenge:"그림에서 동물을 한 가지 골라\n몇 마리가 있는지 말해 봐요.\n(아직 정확한 수 이름은 다음 시간에 배워요)",note:"열린 탐색이에요. 학생마다 꾸민 그림이 달라 답이 여러 가지. 정해진 수보다 하나씩 빠짐없이 세는지를 봐 주세요."},suggested_extras:["m_count_one_kind"]},
  {id:"s10",stage:"기본문제",block:"advanced_problem",data:{title:"식물도 세어 볼까요?",challenge:"꽃은 몇 송이?\n나무는 몇 그루?\n작은 풀은 몇 개?",note:"열린 탐색. 꽃·나무·풀 각각 종류별로 따로 세 보게 하세요. 답은 그림마다 달라요."},suggested_extras:["r_garden_count"]},
  {id:"s10b",stage:"전개",block:"misconception",data:{title:"조심해요 — 셀 때",label:"오개념 주의",wrong:"빠뜨리거나 두 번 세도 괜찮아",right:"하나씩 짚으며 **한 번씩만** 세야\n수가 정확해요.",hint:"세었던 것에 살짝 표시하면 빠뜨리지 않아요."},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"question",data:{title:"같은 그림이라도 친구는 다르게 볼 거예요",content:"옆 친구는 무엇을 세었는지 들어 봐요.\n나와 다르게 셀 수 있다는 것을 알아봐요."},suggested_extras:["x_different_view","a_pair_talk"]},

  // ===== 응용 (4) =====
  {id:"s12",stage:"응용문제",block:"real_world",data:{title:"우리 집에서 셀 수 있는 것",scenario:{icon:"🏠",body:"창문은 몇 개?\n신발은 몇 켤레?\n식탁 의자는 몇 개?\n집에서도 수를 셀 수 있어요."}},suggested_extras:["r_home_count","q_fun_house"]},
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"교실 안에서 셀 수 있는 것",scenario:{icon:"🏫",body:"책상은 몇 개?\n친구는 몇 명?\n칠판은 몇 개?\n선생님은 몇 분?"}},suggested_extras:["a_classroom_count"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"붙임딱지로 학교 가는 길 꾸미기",tag:"교실에서 함께 해요",icon:"🖍️",body:"교과서 부록 붙임딱지(꾸러미 3)를 떼어\n도입 장면 위에 자유롭게 붙여 봐요.\n붙인 다음 무엇을 세고 싶은지 말해 봐요.",materials:"교과서 p.12-13 · 붙임딱지 꾸러미 3"},suggested_extras:["a_sticker_activity"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"짝과 함께 수 찾기 놀이",steps:["짝과 마주 앉아요","한 명이 교실 안 물건 하나를 골라 말해요 (예: 의자)","다른 한 명이 그것이 몇 개 있는지 세어 답해요","역할 바꿔서 또 해 봐요"]},suggested_extras:["g_pair_count","g_classroom_hunt"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 한 일",points:["학교 가는 길을 **꾸며 봤어요**","무엇을 **셀 수 있는지** 찾아봤어요","단원에서 함께할 **약속**을 정했어요","수를 세는 건 우리 **생활 곳곳**에 있어요"]},suggested_extras:["b_school_book"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"학교 가는 길에 무엇을 셀 수 있는지 말할 수 있나요?\n단원 약속을 두 가지 이상 골랐나요?\n친구와 다르게 볼 수 있다는 것을 알았나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"1, 2, 3, 4, 5\n다섯까지의 수를 진짜로 세어 봐요!\n어떤 것을 셀까요?",emoji:""},suggested_extras:["e_count_to_5"]}
    ],
    extras: [
  {id:"v_school_song",type:"video",icon:"🎥",title:"학교 가는 길 노래",url:"https://www.youtube.com/results?search_query=학교+가는+길+동요",description:"입학 초 학교 가는 길 동요. 도입 분위기 만들기에 적합. 가사에 셀 수 있는 사물이 등장하면 자연스럽게 수 세기로 연결.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_first_day",type:"real_world",icon:"🌍",title:"입학 첫날 이야기",content:"오늘은 학교에 오는 둘째 주. 첫날은 떨렸지만 이제는 친구도 보이고 책상도 익숙해졌어요. 학교 가는 길에 무엇이 보이는지 떠올려 봐요.",fit_slides:["cover","motivate"]},
  {id:"q_fun_morning",type:"fun_question",icon:"💡",title:"아침에 본 것들",content:"오늘 아침 집에서 학교까지 오면서 본 것 중에 가장 기억나는 것 한 가지는 무엇인가요? 그것이 한 개였나요, 여러 개였나요?",fit_slides:["motivate"]},
  {id:"q_fun_pet",type:"fun_question",icon:"💡",title:"동네 강아지",content:"우리 동네에 강아지를 산책시키는 사람이 있어요. 강아지가 한 마리일 때도 있고 두 마리일 때도 있어요. 오늘은 몇 마리였을까요?",fit_slides:["motivate","real_world"]},
  {id:"r_school_road",type:"real_world",icon:"🌍",title:"학교 가는 길 풍경",content:"길에는 나무가 줄지어 서 있어요. 차도 지나가요. 횡단보도가 있고 신호등도 있어요. 셀 수 있는 것이 정말 많아요.",fit_slides:["motivate","question"]},
  {id:"m_count_anything",type:"tip",icon:"🧩",title:"세는 대상의 자유",content:"수 세기는 어떤 것이든 시작점이 될 수 있어요. 동물·식물·사물·사람·소리 횟수까지. 학생이 떠올리는 모든 셀 대상을 인정해 주세요.",fit_slides:["question","concept"]},
  {id:"x_count_kinds",type:"misconception",icon:"❓",title:"오개념: '수 세기 = 숫자 외우기'",content:"학생들이 1·2·3 숫자를 말로 외워도 실제 사물을 하나씩 짚으며 세는 건 다른 능력이에요. 1차시는 '셀 대상 인식' 단계 — 정확한 수 이름은 아직 강조하지 않아도 됩니다.",fit_slides:["question","basic_problem"]},
  {id:"a_decorate_road",type:"other_activity",icon:"📚",title:"다른 활동 — 디지털 꾸미기",content:"태블릿이 있다면 학생이 직접 학교 가는 길 그림에 동물·식물 이모지를 끌어다 놓는 활동 가능. 종이 붙임딱지와 같은 효과를 디지털로.",fit_slides:["concept"]},
  {id:"r_nature_walk",type:"real_world",icon:"🌍",title:"산책길에 만나는 것들",content:"학교 다녀오는 길에 부모님과 산책하며 셀 수 있는 것을 하나씩 말해 보세요. 가로수 · 자전거 · 강아지 · 구름. 매일 다른 수를 만나요.",fit_slides:["concept","real_world"]},
  {id:"q_fun_count_things",type:"fun_question",icon:"💡",title:"교실 천장에 있는 것",content:"교실 천장을 한번 올려다봐요. 등은 몇 개? 환기구는 몇 개? 평소에는 안 보던 것도 세어 보면 새로워져요.",fit_slides:["visual_demo","basic_problem"]},
  {id:"x_kinds_vs_amount",type:"misconception",icon:"❓",title:"오개념: '많다 = 큰 수'",content:"학생들이 '많다'와 '크다'를 혼동하는 시기예요. 1차시에서는 정확한 비교를 강요하지 말고 '많은가 적은가' 정도의 표현부터 시작하면 좋아요.",fit_slides:["visual_demo","compare"]},
  {id:"m_grouping_tip",type:"tip",icon:"🧩",title:"분류 활동의 의미",content:"같은 종류끼리 모으는 활동은 수 세기 이전의 핵심 기초. 1차시에서는 동물·식물·사람 등 큰 분류 정도면 충분합니다.",fit_slides:["compare","concept"]},
  {id:"r_school_supply",type:"real_world",icon:"🌍",title:"준비물 챙기기",content:"내일 학교 갈 때 챙겨야 할 것 — 알림장 · 필통 · 색연필. 모두 몇 개를 가지고 가나요? 수 세기는 매일 아침 우리 가방 안에서도 일어나요.",fit_slides:["concept","real_world"]},
  {id:"a_promise_card",type:"other_activity",icon:"📚",title:"다른 활동 — 다짐 카드",content:"단원 약속 세 가지를 큰 종이에 적어 교실 벽에 붙여 두기. 한 단원을 마칠 때마다 학생들이 자기가 지킨 약속에 스티커를 붙임.",fit_slides:["concept"]},
  {id:"a_promise_select",type:"other_activity",icon:"📚",title:"다른 활동 — 약속 선택 후 그림",content:"학생이 마음에 든 단원 약속 두세 가지를 직접 그림으로 그려 자기 수학 공책 첫 페이지에 붙임. 단원이 끝날 때 다시 보며 성장을 느낌.",fit_slides:["motivate","concept"]},
  {id:"m_count_one_kind",type:"tip",icon:"🧩",title:"한 종류부터",content:"여러 종류를 한꺼번에 세려면 어려워요. 학생이 한 가지 동물부터 세도록 안내하면 자연스럽게 1·2·3 수 세기로 연결됩니다.",fit_slides:["basic_problem"]},
  {id:"r_garden_count",type:"real_world",icon:"🌍",title:"화단의 꽃",content:"학교 화단에 핀 꽃을 세어 보세요. 노란 꽃 · 빨간 꽃 · 흰 꽃. 같은 색끼리 세어도 좋고 모두 합쳐 세어도 좋아요.",fit_slides:["basic_problem"]},
  {id:"x_different_view",type:"misconception",icon:"❓",title:"오개념: '내 답만 맞아'",content:"같은 그림을 보고 학생마다 다른 것을 세어도 모두 맞다는 것을 강조해 주세요. 1단원은 수 자체보다 '셀 수 있다'는 인식이 더 중요합니다.",fit_slides:["question","basic_problem"]},
  {id:"a_pair_talk",type:"other_activity",icon:"📚",title:"다른 활동 — 짝 이야기",content:"짝과 마주 앉아 자기가 센 것을 한 가지씩 말하기. 같은 그림에서 친구는 다른 것을 셌다는 것을 알게 됨. 듣기·말하기 통합.",fit_slides:["question"]},
  {id:"r_home_count",type:"real_world",icon:"🌍",title:"집에서 셀 수 있는 것",content:"집에 가서 부모님과 함께 다섯 가지를 세어 보세요. 그릇 · 신발 · 의자 · 창문 · 가족. 수첩에 적어 와서 친구들과 비교해도 재밌어요.",fit_slides:["real_world"]},
  {id:"q_fun_house",type:"fun_question",icon:"💡",title:"우리 집 손가락 만큼",content:"우리 집 손가락은 모두 몇 개일까요? 가족 한 명이 손가락 10개씩이니까 가족 수를 모르면 손가락도 모르겠죠? 가족을 먼저 세어 봐요.",fit_slides:["real_world"]},
  {id:"a_classroom_count",type:"other_activity",icon:"📚",title:"다른 활동 — 교실 둘러보기",content:"학생들이 교실을 한 바퀴 돌며 셀 수 있는 것 다섯 가지를 찾아 오기. 돌아와 칠판 앞에서 한 가지씩 발표.",fit_slides:["real_world"]},
  {id:"a_sticker_activity",type:"other_activity",icon:"📚",title:"붙임딱지 활동 안내",content:"교과서 부록 꾸러미 3(붙임딱지)을 미리 분리해 두면 시간 절약. 학생이 자유롭게 붙이고 다 붙인 다음에 무엇을 셀 수 있는지 발표.",fit_slides:["offline_activity"]},
  {id:"g_pair_count",type:"game",icon:"🎮",title:"짝과 수 찾기 놀이",content:"짝과 마주 앉아 한 명이 교실 안 물건 하나를 골라 말하면, 다른 한 명이 그 개수를 세어 답하기. 정확한 수 이름이 어려우면 손가락으로 표현 가능.",fit_slides:["game"]},
  {id:"g_classroom_hunt",type:"game",icon:"🎮",title:"교실 보물찾기",content:"교사가 '교실에 5개 있는 것은?'이라 묻고 학생들이 답을 찾아 손을 듦. 시계 · 칠판 모서리 등 의외의 답이 나옴.",fit_slides:["game"]},
  {id:"b_school_book",type:"book",icon:"📖",title:"『학교 가는 길』 그림책",content:"입학 초기에 읽기 좋은 그림책. 학교 가는 길의 풍경 · 친구 만남 · 새로운 환경을 따뜻하게 그림. 1차시 도입·정리 자리에 모두 활용 가능.",source:"여러 작가 버전 있음 — 학교 도서관 비치 확인",fit_slides:["cover","summary"]},
  {id:"e_count_to_5",type:"extension",icon:"⬆",title:"1~5까지 미리 보기",content:"다음 시간(2~3차시)에는 1부터 5까지의 수를 정확히 세는 방법을 배워요. 오늘은 '셀 수 있는 것'을 찾는 데까지만 가도 충분합니다.",fit_slides:["next_lesson","summary"]}
    ]
  };

  // ─────────── 2~3차시 (묶음): 1, 2, 3, 4, 5를 알아볼까요 ───────────
  // 80분 분량. 1~5 각 수 인식·세기·읽기(우리말+한자어)·쓰기(필순).
  // 일대일대응 원리. 종류 달라도 개수 같으면 같은 수.
  LESSONS["u1_l02_03"] = {
    meta: {
      title: "1학년 수학 1단원 2~3차시 (묶음)",
      subtitle: "1, 2, 3, 4, 5를 알아볼까요",
      std: "[2수01-01]",
      duration: 80
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"1, 2, 3, 4, 5를\n알아볼까요?\n다섯까지의 수",emoji:""},suggested_extras:["v_count_to_5_song","r_school_supply"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 한 일",content:"학교 가는 길을 꾸미고\n**셀 수 있는 것**을 찾아봤어요\n오늘은 그 수를\n**정확히** 말하고 써 봐요"},suggested_extras:["m_recall_l01"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"학용품과 장난감을 정리해요",kids:[{face:"🙂",label:"가위·지우개·연필"},{face:"🙂",label:"공·강아지·곰 인형"}],question:"가위는 몇 개? 지우개는 몇 개?\n친구는 무엇을 정리하고 있을까요?"},suggested_extras:["r_home_organize","q_fun_organize"]},

  // ===== 전개 (8) — 1~5 각 수 + 두 가지 읽기 + 필순 =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"수 이름은 두 가지",bidirect:["1 → **하나** (우리말) / **일** (한자어)","2 → **둘** / **이**","3 → **셋** / **삼**","4 → **넷** / **사**","5 → **다섯** / **오**"]},suggested_extras:["m_two_names_kor_han","x_one_only_name"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"1 — 하나 / 일",ten_frame_solo:{count:1,is_anchor:true,label:"가위 **1**개 — 하나·일"},sub_text:"같은 수, 두 가지로 읽어 봐요"},suggested_extras:["m_one_to_one","a_picture_one"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"2 — 둘 / 이",ten_frame_solo:{count:2,is_anchor:true,label:"지우개 **2**개 — 둘·이"},sub_text:"강아지도 2마리. 모두 같은 수 2."},suggested_extras:["a_picture_two"]},
  {id:"s07",stage:"전개",block:"visual_demo",data:{title:"3 — 셋 / 삼",ten_frame_solo:{count:3,is_anchor:true,label:"연필 **3**자루 — 셋·삼"},sub_text:"버스 3대도 같은 수 3."},suggested_extras:["a_picture_three"]},
  {id:"s08",stage:"전개",block:"visual_demo",data:{title:"4 — 넷 / 사",ten_frame_solo:{count:4,is_anchor:true,label:"공책 **4**권 — 넷·사"},sub_text:"곰 인형 4개도 같은 수 4."},suggested_extras:["a_picture_four"]},
  {id:"s09",stage:"전개",block:"visual_demo",data:{title:"5 — 다섯 / 오",ten_frame_solo:{count:5,is_anchor:true,label:"공깃돌 **5**개 — 다섯·오"},sub_text:"자동차 5대도 같은 수 5."},suggested_extras:["a_picture_five","x_kinds_diff_same_number"]},
  {id:"s10",stage:"전개",block:"concept",data:{title:"숫자 쓰는 방법 — 필순",bidirect:["**1** — 위에서 아래로 한 번","**2** — 위 곡선 → 아래 곧게","**3** — 두 곡선을 한 번에","**4** — 세로 → 가로 → 세로","**5** — 가로 → 곡선"]},suggested_extras:["m_stroke_order","a_finger_trace"]},
  {id:"s11",stage:"전개",block:"misconception",data:{title:"조심해요 — 자주 헷갈리는 것",label:"오개념 주의",wrong:"종류가 다르면 다른 수",right:"가위 3개와 버스 3대는\n**모두 3**이에요!\n수는 **개수**만 보면 돼요.",hint:"종류는 달라도 개수가 같으면 같은 수."},suggested_extras:["x_kinds_diff_same_number","m_count_abstract"]},

  // ===== 기본 (5) =====
  {id:"s12",stage:"기본문제",block:"basic_problem",data:{title:"토끼는 몇 마리?",ten_frame_anchor:4,question:"토끼 그림을 세어 보세요.\n수로는? 우리말로는? 한자어로는?",answer:4,note:"십 배열판 4칸을 하나씩 짚어 세요. 4 — 넷 / 사."},suggested_extras:["m_count_check","r_animals"]},
  {id:"s13",stage:"기본문제",block:"basic_problem",data:{title:"비행기는 몇 대?",ten_frame_anchor:2,question:"비행기를 세어 답을 써 봐요.\n읽을 때는 **둘** 또는 **이**.",answer:2,note:"2 — 둘 / 이."},suggested_extras:[]},
  {id:"s14",stage:"기본문제",block:"basic_problem",data:{title:"우주선은 몇 대?",ten_frame_anchor:5,question:"우주선을 세고 읽어 봐요.\n**다섯** 또는 **오**.",answer:5,note:"5칸이 다 찼어요. 5 — 다섯 / 오."},suggested_extras:[]},
  {id:"s15",stage:"기본문제",block:"interactive_ten_frame",data:{title:"앞에 나와서 채워봐요",start_count:0,question:"교사가 '3!'이라고 외치면\n앞에 나온 학생이 **3칸**을 채워요.\n수와 칸 수를 맞춰 봐요."},suggested_extras:[]},
  {id:"s16",stage:"연습",block:"question",data:{title:"필순 따라 쓰기",question:"공책에 1·2·3·4·5를 **다섯 번씩** 따라 써 봐요.\n점선부터 시작해서 빈칸까지."},suggested_extras:["a_trace_book","m_writing_hard"]},

  // ===== 응용 (5) =====
  {id:"s17",stage:"응용문제",block:"real_world",data:{title:"내 물건 세어 보기",scenario:{icon:"🎒",body:"가방에서 물건을 꺼내 봐요.\n필통 안 연필은 몇 자루?\n공책은 몇 권?\n지우개는 몇 개?\n각자 다섯까지의 수를 찾아봐요."}},suggested_extras:["a_my_stuff","r_pencil_case"]},
  {id:"s18",stage:"응용문제",block:"offline_activity",data:{title:"물건 들기 놀이",tag:"교실에서 함께 해요",icon:"✋",body:"교사가 수 카드를 들어 올려요.\n예: '4!'\n학생들은 자기 가방에서 **4개** 물건을 꺼내 책상 위에 놓아요.\n빠르고 정확하게!",materials:"1~5 수 카드 · 학생 가방"},suggested_extras:["g_show_count","m_no_panic"]},
  {id:"s19",stage:"응용문제",block:"offline_activity",data:{title:"손가락으로 표현하기",tag:"전체 활동",icon:"🖐️",body:"교사가 '셋!'이라고 외치면\n모두 손가락 **3개**를 들어요.\n한자어로 '오!'라고 외치면\n손가락 **5개**를 들어요.\n빠르게 바꿔 가며 진행.",materials:"손가락만 있으면 OK"},suggested_extras:["m_finger_speed"]},
  {id:"s20",stage:"응용문제",block:"game",data:{title:"수 카드 짝짓기 놀이",steps:["짝과 함께 1~5 수 카드 한 세트씩","카드를 뒤집어 놓고 한 장씩 뽑기","뽑은 카드의 수만큼 책상 위에 작은 물건(연필·지우개) 놓기","놓은 다음 우리말과 한자어로 모두 읽기","역할 바꿔서 또 해 봐요"]},suggested_extras:["g_pair_match"]},
  {id:"s21",stage:"응용문제",block:"advanced_problem",data:{title:"도전 — 같은 수 찾기",challenge:"교실을 한 바퀴 둘러봐요.\n**4**가 등장하는 자리를 **세 곳** 찾을 수 있나요?\n(예: 책상 다리 4개)"},suggested_extras:["x_find_anywhere"]},

  // ===== 정리 (3) =====
  {id:"s22",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["**1~5 수**를 세고 읽고 썼어요","수는 **두 가지로 읽어요** — 우리말과 한자어","**종류가 달라도** 개수가 같으면 같은 수","수는 **숫자**로 적어요"]},suggested_extras:["b_count_to_five"]},
  {id:"s23",stage:"정리",block:"basic_problem",data:{title:"마지막 확인",question:"손가락 **다섯 개**를 다 펴 보세요.\n수로는? 우리말로는? 한자어로는?",answer:5,note:"펼친 손가락은 5개. 다섯 / 오."},suggested_extras:[]},
  {id:"s24",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**6, 7, 8, 9**\n다섯보다 더 큰 수를 만나요!\n어디까지 셀 수 있을까요?",emoji:""},suggested_extras:["e_beyond_five"]}
    ],
    extras: [
  {id:"v_count_to_5_song",type:"video",icon:"🎥",title:"1~5 숫자송",url:"https://www.youtube.com/results?search_query=1+2+3+4+5+동요+숫자",description:"1부터 5까지 노래로 익히기. 도입 자리에 흥미 유발. 입학 초 학생이 즐겁게 따라 부를 수 있는 친숙한 동요.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_school_supply",type:"real_world",icon:"🌍",title:"학용품 챙기기",content:"매일 아침 가방에 학용품을 챙겨요. 연필·지우개·공책. 각각 몇 개씩 챙기는지 세어 보면 자연스럽게 수와 만나요.",fit_slides:["cover","real_world"]},
  {id:"m_recall_l01",type:"tip",icon:"🧩",title:"1차시 회상 짧게",content:"1차시 학교 가는 길 꾸미기를 짧게 회상. '셀 수 있는 것'을 찾는 단계에서 오늘 '정확히 세고 쓰는' 단계로 자연스럽게 진입.",fit_slides:["review"]},
  {id:"r_home_organize",type:"real_world",icon:"🌍",title:"집에서 정리하기",content:"학용품·장난감을 정리하는 일은 매일 일어나는 수 세기. 한 곳에 모으면서 자연스럽게 수를 익혀요.",fit_slides:["motivate"]},
  {id:"q_fun_organize",type:"fun_question",icon:"💡",title:"가방 정리 시간",content:"오늘 아침 가방에 무엇을 넣고 왔나요? 연필은 몇 자루? 공책은 몇 권? 잠시 떠올려 봐요.",fit_slides:["motivate"]},
  {id:"m_two_names_kor_han",type:"tip",icon:"🧩",title:"두 이름 같이 노출",content:"매 활동에서 '하나(일)·둘(이)·셋(삼)…'처럼 두 이름을 같이 들려주면 자연스럽게 익혀요. 한쪽만 강조 X.",fit_slides:["concept","visual_demo"]},
  {id:"x_one_only_name",type:"misconception",icon:"❓",title:"오개념: 수는 한 가지 이름",content:"학생이 '하나'만 알면 '일'을 같은 수라고 인식 못 함. 두 이름이 같은 수임을 칠판에 짝지어 적어 두기.",fit_slides:["concept"]},
  {id:"m_one_to_one",type:"tip",icon:"🧩",title:"일대일대응 — 점·짝짓기",content:"학생이 사물을 셀 때 손가락으로 하나씩 짚도록. 중복·누락 방지의 기초. 익숙해지면 손가락 없이도 가능.",fit_slides:["visual_demo","basic_problem"]},
  {id:"a_picture_one",type:"other_activity",icon:"📚",title:"다른 활동 — 1이 등장하는 것",content:"교실에서 1개만 있는 것을 찾아 봐요. 칠판·교탁·교사. 1이 만나는 자리를 떠올리며 익히기.",fit_slides:["visual_demo"]},
  {id:"a_picture_two",type:"other_activity",icon:"📚",title:"다른 활동 — 2가 등장하는 것",content:"신발·양말·눈·귀·손·발. 우리 몸에는 2가 정말 많아요. 짝꿍과 함께 찾아 봐요.",fit_slides:["visual_demo"]},
  {id:"a_picture_three",type:"other_activity",icon:"📚",title:"다른 활동 — 3이 등장하는 것",content:"신호등 색깔(빨강·노랑·초록)·삼각형의 꼭짓점·세 마리 곰. 3이 만나는 자리를 찾아 봐요.",fit_slides:["visual_demo"]},
  {id:"a_picture_four",type:"other_activity",icon:"📚",title:"다른 활동 — 4가 등장하는 것",content:"의자·책상 다리·자동차 바퀴·사각형의 꼭짓점. 4가 들어가는 자리를 찾아 봐요.",fit_slides:["visual_demo"]},
  {id:"a_picture_five",type:"other_activity",icon:"📚",title:"다른 활동 — 5가 등장하는 것",content:"손가락·발가락·올림픽 오륜기·별표 꼭짓점. 5는 우리 몸에서 가장 친한 수.",fit_slides:["visual_demo"]},
  {id:"x_kinds_diff_same_number",type:"misconception",icon:"❓",title:"오개념: 종류가 다르면 다른 수",content:"가장 흔한 오개념. 학생이 가위 3개와 사과 3개를 '다른 수'라고 인식할 수 있음. 수는 **개수**만 보면 됨을 시각·반복으로 강조.",fit_slides:["concept","misconception"]},
  {id:"m_stroke_order",type:"tip",icon:"🧩",title:"필순의 중요성",content:"1학년에서 익히는 필순은 평생 가요. 처음에 잘못 익히면 고치기 어려움. 큰 글씨·천천히·정확히.",fit_slides:["concept"]},
  {id:"a_finger_trace",type:"other_activity",icon:"📚",title:"다른 활동 — 손가락 허공 쓰기",content:"공책에 적기 전 손가락으로 허공에 1·2·3·4·5를 크게 써 봐요. 큰 동작으로 익혀 두면 작게 쓸 때도 정확.",fit_slides:["concept"]},
  {id:"m_count_abstract",type:"tip",icon:"🧩",title:"수 개념의 추상화",content:"3이라는 수가 사물·동물·소리·동작 어디든 통한다는 것은 큰 도약. 1학년 1단원의 핵심 목표.",fit_slides:["misconception","summary"]},
  {id:"m_count_check",type:"tip",icon:"🧩",title:"세기 방법 확인",content:"학생이 답을 적기 전에 '한 번 더 세어 봐요'라고 안내. 손가락으로 짚으며 한 번 더 세면 실수가 줄어요.",fit_slides:["basic_problem"]},
  {id:"r_animals",type:"real_world",icon:"🌍",title:"동물 세기",content:"동물원이나 그림책에서 동물을 셀 때 우리말 단위(마리)와 함께 수를 말해요. '토끼 셋' = '토끼 3마리'.",fit_slides:["basic_problem"]},
  {id:"a_trace_book",type:"other_activity",icon:"📚",title:"다른 활동 — 따라쓰기 공책",content:"교과서 따라쓰기 칸 외에도 자기 공책 한 페이지에 1~5를 자유롭게 써 봐요. 크게·작게·다양한 색으로.",fit_slides:["basic_problem"]},
  {id:"m_writing_hard",type:"tip",icon:"🧩",title:"수 쓰기 어려운 학생",content:"손이 약한 학생은 점선 따라쓰기로 충분. 못 쓴다고 답답해하지 않도록 안내. 시간 차이를 인정.",fit_slides:["basic_problem"]},
  {id:"a_my_stuff",type:"other_activity",icon:"📚",title:"다른 활동 — 책상 위 분류",content:"가방을 다 꺼내지 말고 한 가지(연필 또는 지우개)만 꺼내 책상에 두기. 책상이 어수선하지 않게.",fit_slides:["real_world"]},
  {id:"r_pencil_case",type:"real_world",icon:"🌍",title:"필통 안 친구들",content:"필통에는 연필·지우개·자가 들어 있어요. 각각 몇 개씩일까? 매일 다른 수일 수 있어요.",fit_slides:["real_world"]},
  {id:"g_show_count",type:"game",icon:"🎮",title:"물건 들기 놀이",content:"교사가 수를 보여 주면 학생이 그만큼 물건을 빠르게 꺼내는 놀이. 정확함이 우선, 속도는 그다음.",fit_slides:["offline_activity"]},
  {id:"m_no_panic",type:"tip",icon:"🧩",title:"실패해도 OK",content:"늦게 꺼낸 학생을 비교하지 않도록. 활동의 목적은 수를 빠르게가 아니라 정확하게 익히는 것.",fit_slides:["offline_activity"]},
  {id:"m_finger_speed",type:"tip",icon:"🧩",title:"손가락 표현 속도",content:"우리말과 한자어 표현을 빠르게 번갈아 외치면 학생이 두 이름을 자연스럽게 익혀요. 처음엔 천천히, 점차 빠르게.",fit_slides:["offline_activity"]},
  {id:"g_pair_match",type:"game",icon:"🎮",title:"짝과 짝짓기",content:"수 카드와 물건을 짝짓는 놀이. 사물의 종류가 달라도 개수가 같으면 같은 수임을 자연스럽게 익혀요.",fit_slides:["game"]},
  {id:"x_find_anywhere",type:"misconception",icon:"❓",title:"수는 어디든 있어요",content:"학생이 '교실에는 수가 없다'고 생각할 수 있음. 책상 다리·창문 가로·세로·전등 등 어디든 4가 등장. 발견의 즐거움.",fit_slides:["advanced_problem"]},
  {id:"b_count_to_five",type:"book",icon:"📖",title:"『하나 둘 셋 넷 다섯』 그림책",content:"1~5를 한 페이지씩 다루는 그림책. 동물·사물의 다양한 예로 같은 수를 보여 줌. 단원 정리 자리에 읽어 주면 좋음.",source:"여러 작가 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_beyond_five",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"4~5차시는 6·7·8·9. 5보다 한 칸 더 큰 수부터 만나요. 십 배열판에서는 5칸이 다 차고 한 칸 더 채우는 자리.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 4~5차시 (묶음): 6, 7, 8, 9를 알아볼까요 ───────────
  // 80분 분량. 6~9 각 수 인식·세기·읽기·쓰기.
  // 5 기준 수 인식 (6=5+1, 7=5+2, 8=5+3, 9=5+4). 십 배열판·연결 모형.
  // 꾸러미 4 (1~9 나만의 수 카드) 만들기 — 7·8·10차시 재사용.
  LESSONS["u1_l04_05"] = {
    meta: {
      title: "1학년 수학 1단원 4~5차시 (묶음)",
      subtitle: "6, 7, 8, 9를 알아볼까요",
      std: "[2수01-01]",
      duration: 80
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"6, 7, 8, 9를\n알아볼까요?\n다섯보다 큰 수",emoji:""},suggested_extras:["v_count_to_9_song","r_more_than_five"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"**1, 2, 3, 4, 5**\n수 이름 두 가지 (하나·일, 둘·이…)\n수는 **개수**만 보면 돼요\n오늘은 그 다음 수를 만나요"},suggested_extras:["m_recall_one_to_five","v_count_to_5_song"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"학교 가는 길 풍경",kids:[{face:"🐰",label:"토끼"},{face:"🐦",label:"참새"},{face:"🦋",label:"나비"},{face:"🐝",label:"벌"}],question:"풍경 속 동물들이 몇 마리씩 있을까요?\n5보다 많이 있는 동물은?"},suggested_extras:["r_nature_road","q_fun_animals"]},

  // ===== 전개 (8) — 6~9 각 수 + 5+N 구조 + 십 배열판 + 필순 =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"5보다 큰 수를 보는 법",bidirect:["**5칸**이 다 찬 다음","↓","**한 칸 더 = 6**","↓","**두 칸 더 = 7**","↓","**세 칸 더 = 8**","↓","**네 칸 더 = 9**"]},suggested_extras:["m_five_anchor","x_count_from_one"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"6 — 여섯 / 육",ten_frame_solo:{count:6,is_anchor:true,label:"토끼 **6**마리 — 여섯·육"},sub_text:"위 5칸 다 차고 아래 1칸. **5+1**"},suggested_extras:["m_five_plus_n","a_six_examples"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"7 — 일곱 / 칠",ten_frame_solo:{count:7,is_anchor:true,label:"참새 **7**마리 — 일곱·칠"},sub_text:"위 5칸 + 아래 2칸. **5+2**"},suggested_extras:["a_seven_examples"]},
  {id:"s07",stage:"전개",block:"visual_demo",data:{title:"8 — 여덟 / 팔",ten_frame_solo:{count:8,is_anchor:true,label:"나비 **8**마리 — 여덟·팔"},sub_text:"위 5칸 + 아래 3칸. **5+3**"},suggested_extras:["a_eight_examples"]},
  {id:"s08",stage:"전개",block:"visual_demo",data:{title:"9 — 아홉 / 구",ten_frame_solo:{count:9,is_anchor:true,label:"벌 **9**마리 — 아홉·구"},sub_text:"위 5칸 + 아래 4칸. **5+4**"},suggested_extras:["a_nine_examples"]},
  {id:"s09",stage:"전개",block:"compare",data:{title:"6·7·8·9 — 한눈에",items:[{ten_frame:6,num:6,caption:"**6** 여섯·육"},{ten_frame:7,num:7,caption:"**7** 일곱·칠"},{ten_frame:8,num:8,caption:"**8** 여덟·팔",is_anchor:true},{ten_frame:9,num:9,caption:"**9** 아홉·구"}]},suggested_extras:["m_two_names_kor_han_69","x_one_only_name_69"]},
  {id:"s10",stage:"전개",block:"concept",data:{title:"숫자 쓰는 방법 — 6·7·8·9",bidirect:["**6** — 위에서 곡선 → 동그라미","**7** — 가로 → 비스듬히 아래","**8** — 위 동그라미 → 아래 동그라미","**9** — 위 동그라미 → 곧게 아래"]},suggested_extras:["m_stroke_order_69","a_finger_trace_69"]},
  {id:"s11",stage:"전개",block:"misconception",data:{title:"조심해요 — 자주 헷갈리는 것",label:"오개념 주의",wrong:"매번 1부터 다시 세요",right:"**5칸이 다 찼다**는 것을 알면\n**6은 5보다 한 칸 더**라는 것을 바로 알 수 있어요.",hint:"5 기준으로 보면 셈이 빨라져요."},suggested_extras:["x_count_from_one","m_speed_with_five"]},

  // ===== 기본 (5) =====
  {id:"s12",stage:"기본문제",block:"basic_problem",data:{title:"당근은 몇 개?",ten_frame_anchor:7,question:"당근을 세어 답을 써 봐요.\n읽을 때는 **일곱** 또는 **칠**.",answer:7,note:"7 — 일곱 / 칠. 5칸+2."},suggested_extras:["m_count_check","r_vegetables"]},
  {id:"s13",stage:"기본문제",block:"basic_problem",data:{title:"딸기는 몇 개?",ten_frame_anchor:9,question:"딸기를 세어 보세요.\n9까지 세고 읽어 봐요.\n**아홉** 또는 **구**.",answer:9,note:"9 — 아홉 / 구. 5칸+4."},suggested_extras:[]},
  {id:"s14",stage:"기본문제",block:"basic_problem",data:{title:"토마토는 몇 개?",ten_frame_anchor:6,question:"토마토를 세고 적어 봐요.\n5칸이 다 차고 한 칸 더!",answer:6,note:"6 — 여섯 / 육. 5칸 차고 1 더(5+1)."},suggested_extras:["m_five_plus_n"]},
  {id:"s15",stage:"기본문제",block:"basic_problem",data:{title:"꽃은 몇 송이?",ten_frame_anchor:8,question:"꽃 8송이를 십 배열판에서 확인.\n**5+3**으로 보이나요?",answer:8,note:"8 — 여덟 / 팔. 5+3으로 보여요."},suggested_extras:[]},
  {id:"s16",stage:"연습",block:"question",data:{title:"필순 따라 쓰기",question:"공책에 6·7·8·9를 **다섯 번씩** 따라 써 봐요.\n점선부터 빈칸까지."},suggested_extras:["a_trace_book","m_writing_hard"]},

  // ===== 응용 (5) =====
  {id:"s17",stage:"응용문제",block:"offline_activity",data:{title:"연결 모형으로 수 표현",tag:"교실 활동",icon:"🧱",body:"교사가 수를 정해요 (예: 8)\n학생은 **연결 모형 8개**를 막대로 쌓아요.\n5개 쌓은 다음 색을 바꾸면\n**5+3** 구조가 한눈에 보여요.",materials:"연결 모형 또는 바둑돌 9개씩"},suggested_extras:["m_color_change_at_5","a_cube_alternatives"]},
  {id:"s18",stage:"응용문제",block:"offline_activity",data:{title:"손뼉 치기 놀이",tag:"청각 활동",icon:"👏",body:"교사가 손뼉을 **N번** 치면\n학생은 그 수만큼 카드를 들거나 손가락을 펴요.\n눈을 감고도 가능 — **소리만 듣고** 세기 연습.",materials:"수 카드 또는 손가락만"},suggested_extras:["m_listen_carefully","g_clap_count"]},
  {id:"s19",stage:"응용문제",block:"offline_activity",data:{title:"꾸러미 4 — 나만의 수 카드 1~9 만들기",tag:"중요한 활동",icon:"🎴",body:"두꺼운 종이를 잘라 카드 **9장**.\n한 장에 한 수 (1·2·3·4·5·6·7·8·9).\n크고 또렷하게.\n**다음 시간(7·8·10차시)에 다시 써요**\n— 잘 보관!",materials:"두꺼운 종이 · 사인펜 · 가위"},suggested_extras:["m_card_keep","a_decorate_card"]},
  {id:"s20",stage:"응용문제",block:"game",data:{title:"같은 수 찾기 놀이",steps:["수 카드 9장과 그림 카드 9장(1~9개 그림) 준비","모든 카드 뒤집어 놓기","한 사람이 두 장 뒤집기 — 같은 수면 가져가기, 다르면 다시 뒤집기","많이 모은 사람 승","꾸러미 4 수 카드 활용 가능"]},suggested_extras:["g_memory_match"]},
  {id:"s21",stage:"응용문제",block:"advanced_problem",data:{title:"도전 — 5+N 빨리 말하기",challenge:"교사가 '5+2!'를 외치면\n학생은 빠르게 **'7!'**.\n'5+4!' → **'9!'**\n5 기준으로 6~9를 빠르게 만들기."},suggested_extras:["m_speed_with_five"]},

  // ===== 정리 (3) =====
  {id:"s22",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["**6, 7, 8, 9**를 세고 읽고 썼어요","**5 기준**으로 보면 셈이 빨라져요","십 배열판으로 보면 **5+N** 구조","우리만의 **수 카드(꾸러미 4)** 를 만들었어요"]},suggested_extras:["b_count_to_nine"]},
  {id:"s23",stage:"정리",block:"basic_problem",data:{title:"마지막 확인",ten_frame_anchor:9,question:"손가락을 다 펴 보세요.\n수는? 우리말은? 한자어는?\n**5+4** 로도 말할 수 있나요?",answer:9,note:"9 — 아홉 / 구. 5+4."},suggested_extras:[]},
  {id:"s24",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**순서**를 알아봐요!\n첫째 · 둘째 · 셋째 · 넷째 …\n수가 또 다른 모습으로 변해요.",emoji:""},suggested_extras:["e_order_preview"]}
    ],
    extras: [
  {id:"v_count_to_9_song",type:"video",icon:"🎥",title:"1~9 숫자송",url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q",video_id:"Qxi-dPmsl-Q",description:"1부터 10까지 노래로 익히기. 6~9 구간도 자연스럽게 익혀요. 도입 자리에 흥미 유발.",source:"핑크퐁 (Pinkfong) — 유튜브 공개 영상",fit_slides:["cover","motivate"]},
  {id:"v_count_to_5_song",type:"video",icon:"🎥",title:"1~5 회상용 노래",url:"https://www.youtube.com/results?search_query=1+2+3+4+5+동요+숫자",description:"지난 시간 회상 자리에 활용. 짧게 1~5만 함께 외치고 본론으로.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["review"]},
  {id:"r_more_than_five",type:"real_world",icon:"🌍",title:"5보다 많은 것",content:"한 손에 손가락 5개. 두 손이면 더 많아져요. 형제·자매가 많은 집·우리 반 친구 수·교실 책상 수. 5를 넘어가는 수가 매일 등장.",fit_slides:["cover","real_world"]},
  {id:"m_recall_one_to_five",type:"tip",icon:"🧩",title:"1~5 회상 빠르게",content:"2~3차시 학습 내용을 1~2분 안에 회상. 손가락 5개를 다 같이 펴고 외친 다음 본론으로 진입.",fit_slides:["review"]},
  {id:"r_nature_road",type:"real_world",icon:"🌍",title:"학교 가는 길의 동물",content:"학교 가는 길에는 토끼·참새·나비·벌이 있어요. 동물마다 마릿수가 달라요. 길에서 만나는 수를 떠올려 봐요.",fit_slides:["motivate"]},
  {id:"q_fun_animals",type:"fun_question",icon:"💡",title:"어느 동물이 가장 많을까",content:"교과서 그림에서 어느 동물이 가장 많이 있어 보이나요? 한눈에 보고 추측해 봐요. 실제로 세 보면 확인.",fit_slides:["motivate"]},
  {id:"m_five_anchor",type:"tip",icon:"🧩",title:"5 기준의 힘",content:"십 배열판은 위 5칸·아래 5칸. 5칸이 다 차는 자리가 시각적 닻. 5를 기준으로 6·7·8·9를 한눈에. 이후 연산의 핵심 기반.",fit_slides:["concept","visual_demo"]},
  {id:"x_count_from_one",type:"misconception",icon:"❓",title:"오개념: 매번 1부터 세기",content:"학생이 8을 셀 때 매번 '1·2·3…8' 처음부터 셀 수 있음. 5칸이 다 찬 자리에서 '5에서 3 더'를 익히면 셈이 훨씬 빨라짐.",fit_slides:["concept","misconception"]},
  {id:"m_five_plus_n",type:"tip",icon:"🧩",title:"5+N 구조 명시",content:"6=5+1·7=5+2·8=5+3·9=5+4를 칠판에 짝지어 적어 두면 학생이 그림을 보면서 자연스럽게 익혀요.",fit_slides:["visual_demo","basic_problem"]},
  {id:"a_six_examples",type:"other_activity",icon:"📚",title:"다른 활동 — 6이 등장하는 것",content:"주사위 점·우리 가족 수·일주일 안 평일+토요일·우리 반 한 모둠. 6은 생각보다 자주 만나요.",fit_slides:["visual_demo"]},
  {id:"a_seven_examples",type:"other_activity",icon:"📚",title:"다른 활동 — 7이 등장하는 것",content:"무지개 색깔·일주일 요일·일곱 난쟁이·우리 반 책상 한 줄. 7도 매일 만나요.",fit_slides:["visual_demo"]},
  {id:"a_eight_examples",type:"other_activity",icon:"📚",title:"다른 활동 — 8이 등장하는 것",content:"문어 다리·거미 다리·8각형의 꼭짓점·피아노 한 옥타브 건반 수. 8이 들어가는 자리 찾기.",fit_slides:["visual_demo"]},
  {id:"a_nine_examples",type:"other_activity",icon:"📚",title:"다른 활동 — 9가 등장하는 것",content:"야구 한 팀 사람 수·9각형의 꼭짓점·9시 시각. 9를 잘 익혀 두면 다음 단원(10까지)으로 자연스럽게 이어져요.",fit_slides:["visual_demo"]},
  {id:"m_two_names_kor_han_69",type:"tip",icon:"🧩",title:"6~9 두 이름 같이",content:"여섯·일곱·여덟·아홉(우리말)과 육·칠·팔·구(한자어)를 항상 짝지어 들려주기. 한쪽만 노출 시 한 이름에 굳어짐.",fit_slides:["compare","concept"]},
  {id:"x_one_only_name_69",type:"misconception",icon:"❓",title:"오개념: 한 가지 이름만",content:"학생이 '여섯'만 알면 '육'을 같은 수라고 인식 못 함. 평가 자리에서 두 이름 모두 묻기.",fit_slides:["compare"]},
  {id:"m_stroke_order_69",type:"tip",icon:"🧩",title:"6·8·9 필순 주의",content:"6은 위에서 곡선 한 번 → 동그라미. 9는 위 동그라미 → 곧게 아래. 8은 두 동그라미를 잇는 8자 모양 한 번에. 처음에 잘 익혀 두면 평생 정확.",fit_slides:["concept"]},
  {id:"a_finger_trace_69",type:"other_activity",icon:"📚",title:"다른 활동 — 손가락 허공 쓰기",content:"공책에 적기 전 손가락으로 6·7·8·9를 큰 동작으로 허공에 써 봐요. 큰 동작으로 익혀 두면 작게도 정확.",fit_slides:["concept"]},
  {id:"m_speed_with_five",type:"tip",icon:"🧩",title:"5 기준 속도",content:"학생이 5+N을 빠르게 답할 수 있으면 6~9 세기·읽기·후속 ±1 학습 속도가 훨씬 빨라져요.",fit_slides:["misconception","advanced_problem"]},
  {id:"m_count_check",type:"tip",icon:"🧩",title:"세기 한 번 더",content:"답 적기 전 손가락으로 짚으며 한 번 더 세기. 6·7·8·9 자리에서 실수가 가장 많음.",fit_slides:["basic_problem"]},
  {id:"r_vegetables",type:"real_world",icon:"🌍",title:"채소·과일 세기",content:"마트나 시장에서 채소·과일을 사면 자연스럽게 수를 세요. 사과 5개·딸기 9개 등. 생활에서 만나는 수.",fit_slides:["basic_problem"]},
  {id:"a_trace_book",type:"other_activity",icon:"📚",title:"다른 활동 — 따라쓰기 공책",content:"교과서 따라쓰기 칸 외에 자기 공책에 자유롭게. 큰 글씨·작은 글씨·여러 색으로.",fit_slides:["basic_problem"]},
  {id:"m_writing_hard",type:"tip",icon:"🧩",title:"수 쓰기 어려운 학생",content:"손이 약한 학생은 점선 따라쓰기만으로 충분. 못 쓴다고 부담 주지 마세요. 시간 차이를 인정.",fit_slides:["basic_problem"]},
  {id:"m_color_change_at_5",type:"tip",icon:"🧩",title:"5에서 색 바꾸기",content:"연결 모형 5개를 한 색으로 쌓은 다음 6번째부터 다른 색으로. 5 기준 구조가 시각적으로 드러나 학생이 한눈에 이해.",fit_slides:["offline_activity"]},
  {id:"a_cube_alternatives",type:"other_activity",icon:"📚",title:"연결 모형 대체",content:"연결 모형이 없으면 바둑돌·빨대·종이공으로. 색이 다른 두 종류로 5+N 구조를 표현할 수 있는 것이면 OK.",fit_slides:["offline_activity"]},
  {id:"m_listen_carefully",type:"tip",icon:"🧩",title:"청각으로 세기",content:"눈으로 세기와 다른 능력. 손뼉 소리를 정확히 세려면 집중 필요. 청각 세기는 듣기 능력과 동시 발달.",fit_slides:["offline_activity"]},
  {id:"g_clap_count",type:"game",icon:"🎮",title:"손뼉 횟수 맞히기",content:"교사가 N번 손뼉을 친 후 '몇 번?'이라고 물으면 학생이 답. 점차 횟수를 늘려 9까지.",fit_slides:["offline_activity"]},
  {id:"m_card_keep",type:"tip",icon:"🧩",title:"꾸러미 4 보관 안내",content:"학생이 만든 수 카드 9장은 **7차시(수의 순서)·8차시(±1)·10차시(크기 비교)** 에서 다시 써요. 잃어버리지 않도록 봉투·지퍼백에 넣어 보관 안내.",fit_slides:["offline_activity"]},
  {id:"a_decorate_card",type:"other_activity",icon:"📚",title:"다른 활동 — 카드 꾸미기",content:"수를 적은 후 빈자리에 그 수와 관련된 그림을 그려도 좋아요. 자기만의 카드라 학생이 더 애착을 가짐.",fit_slides:["offline_activity"]},
  {id:"g_memory_match",type:"game",icon:"🎮",title:"수 카드 메모리 매치",content:"수 카드와 그림 카드를 짝짓는 메모리 게임. 같은 수 두 장을 뒤집어 맞히는 단순한 놀이로 수와 그림 매칭을 빠르게 익힘.",fit_slides:["game"]},
  {id:"b_count_to_nine",type:"book",icon:"📖",title:"『여섯 일곱 여덟 아홉』 그림책",content:"6~9를 한 페이지씩 다루는 그림책. 동물·사물의 다양한 예. 단원 정리 자리에 읽어 주면 자연스러운 마무리.",source:"여러 작가 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_order_preview",type:"extension",icon:"⬆",title:"6차시 미리 보기",content:"6차시는 순서(첫째·둘째…). 오늘까지 배운 1~9의 수가 '몇 번째'로도 쓰일 수 있다는 새 사실을 만나요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 6차시: 순서를 알아볼까요 ───────────
  // 순서수(첫째·둘째…) ↔ 집합수(1·2·3…) 구분. 기준에 따라 순서가 달라짐.
  LESSONS["u1_l06"] = {
    meta: {
      title: "1학년 수학 1단원 6차시",
      subtitle: "순서를 알아볼까요",
      std: "[2수01-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"순서를 알아볼까요?\n첫째 · 둘째 · 셋째 …",emoji:""},suggested_extras:["v_order_song","r_race_lineup"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"**1부터 9까지**의 수\n수의 이름 두 가지 (하나·일, 둘·이, 셋·삼…)\n**얼마나 많은가** 세기"},suggested_extras:["v_count_song_kor"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"달리기 시합을 해요",kids:[{face:"🏃",label:"하영"},{face:"🏃",label:"민서"},{face:"🏃",label:"지호"}],question:"누가 첫째로 들어왔을까요?\n둘째는? 셋째는?"},suggested_extras:["q_fun_race","r_relay"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"수 이름이 두 가지!",bidirect:["**얼마나 많은가**","1 · 2 · 3 · 4 · 5","↓","**몇 번째인가**","첫째 · 둘째 · 셋째 · 넷째 · 다섯째"]},suggested_extras:["x_count_vs_order","m_two_names"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"줄을 서 있어요",ten_frame_solo:{count:5,is_anchor:true,label:"5명이 줄을 서 있어요"},sub_text:"**왼쪽에서부터** 첫째·둘째·셋째·넷째·다섯째"},suggested_extras:["m_left_first"]},
  {id:"s06",stage:"전개",block:"compare",data:{title:"기준이 바뀌면?",items:[{ten_frame:5,num:0,caption:"**왼쪽에서**\n첫째 → 다섯째"},{ten_frame:0,num:0,caption:"기준",is_anchor:true},{ten_frame:5,num:0,caption:"**오른쪽에서**\n첫째 → 다섯째"}]},suggested_extras:["x_direction_matters","r_classroom_row"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"세 가지 표현",bidirect:["**왼쪽에서** 셋째","=","**오른쪽에서** 셋째 (5명 줄 기준)","=","**가운데**"]},suggested_extras:["m_position_tip"]},
  {id:"s08",stage:"전개",block:"misconception",data:{title:"조심해요 — 자주 헷갈리는 것",label:"오개념 주의",wrong:"앞에서 셋째 = 셋째 사람 한 명",right:"맞아요! 단, **앞에서 세 명**과 다른 말이에요.",hint:"'셋째' = 그 자리 한 사람 / '세 명' = 자리 세 개의 합"},suggested_extras:["x_third_vs_three"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"앞에서 둘째는 누구일까요?",ten_frame_anchor:5,question:"5명이 줄을 섰어요.\n**앞에서 둘째**에 있는 사람을 찾아 봐요.",answer:"앞에서 둘째 = 맨 앞에서 두 번째 사람",note:"순서수: 맨 앞=첫째, 그다음=둘째. 둘째는 차례를 나타내요."},suggested_extras:["q_fun_lineup"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"기준을 바꿔서",ten_frame_anchor:5,question:"같은 줄에서\n**뒤에서 둘째**는 누구인가요?\n(앞에서 둘째와 같은 사람일까요?)",answer:"다른 사람 — 뒤에서 둘째는 앞에서 넷째예요",note:"5명 줄에서 앞2째와 뒤2째는 서로 다른 사람. 기준이 바뀌면 가리키는 사람도 달라져요."},suggested_extras:[]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"순서 매기기",question:"4명이 달리기를 했어요.\n결승선에 들어온 순서를 보고\n**첫째 · 둘째 · 셋째 · 넷째**를 정해 봐요.",answer:"들어온 차례대로 첫째·둘째·셋째·넷째",note:"결승선 통과 순서대로 차례를 매겨요."},suggested_extras:["r_relay"]},
  {id:"s12",stage:"기본문제",block:"number_line_demo",data:{title:"수직선으로 확인",nl:{range:[1,5],anchor:3},caption:"왼쪽에서 셋째 = 3번째 자리"},suggested_extras:["m_number_line"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"엘리베이터 층수와 순서",scenario:{icon:"🏢",body:"우리 아파트는 5층.\n**1층부터 세면** 우리 집은 다섯째 층.\n**5층부터 거꾸로 세면** 우리 집은 첫째 층."}},suggested_extras:["r_elevator_order"]},
  {id:"s14",stage:"응용문제",block:"advanced_problem",data:{title:"기차의 칸",context:"기차가 6칸이에요. **앞에서 셋째 칸**과\n**뒤에서 넷째 칸**은 같은 칸일까요?",questions:["같다고 생각하면 왜?","다르다고 생각하면 왜?"],answers:["같은 칸 — 6칸에서 앞에서 셋째 = 뒤에서 넷째"],note:"앞3째=3번 칸. 뒤4째=뒤에서 6·5·4·3 → 3번 칸. 같은 칸."},suggested_extras:["x_third_vs_three"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"순서 호명 놀이",steps:["6~9명이 한 줄로 서기","교사가 '왼쪽에서 셋째!'라고 외침","해당 학생이 손을 듦","'오른쪽에서 둘째!' 등으로 기준을 바꿔 가며 진행","틀려도 다시 해 볼 수 있어요"]},suggested_extras:["g_order_call","g_who_is_it"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["수 이름은 **두 가지** — 셀 때와 순서를 말할 때","순서는 항상 **기준**이 있어요 (왼쪽·오른쪽·앞·뒤)","같은 자리도 **기준이 다르면** 다른 순서로 불러요","**'셋째'**와 **'세 명'**은 다른 말이에요"]},suggested_extras:["b_lineup_book"]},
  {id:"s17",stage:"정리",block:"basic_problem",data:{title:"마지막 확인",question:"5명이 줄을 서 있어요.\n**오른쪽에서 둘째**는 **왼쪽에서** 몇째인가요?",answer:"왼쪽에서 넷째",note:"5명 줄에서 오른쪽 2째 = 왼쪽 4째 (5−2+1=4)."},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**6, 7, 8, 9**\n다섯보다 더 큰 수를 만나요!\n어디까지 셀 수 있을까요?",emoji:""},suggested_extras:["e_beyond_5"]}
    ],
    extras: [
  {id:"v_order_song",type:"video",icon:"🎥",title:"순서수 노래 — 첫째 둘째 셋째",url:"https://www.youtube.com/results?search_query=첫째+둘째+셋째+동요",description:"순서수를 노래로 익히는 영상. 도입 자리에 흥미 유발용. 입학 초 친숙한 동요로 자연스럽게 진입.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate","review"]},
  {id:"v_count_song_kor",type:"video",icon:"🎥",title:"핑크퐁 1-10 숫자송",url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q",video_id:"Qxi-dPmsl-Q",description:"1부터 10까지 노래로 익히기. 전시 학습(1~5 수) 상기에 좋음.",source:"핑크퐁 (Pinkfong) — 유튜브 공개 영상",fit_slides:["review"]},
  {id:"r_race_lineup",type:"real_world",icon:"🌍",title:"운동회 결승선",content:"운동회에서 달리기를 하면 결승선에 들어오는 순서가 정해져요. 첫째로 들어온 친구·둘째로 들어온 친구. 순서는 우리 생활에서 자주 만나요.",fit_slides:["cover","motivate"]},
  {id:"q_fun_race",type:"fun_question",icon:"💡",title:"달팽이 시합",content:"달팽이 다섯 마리가 시합을 해요. 가장 먼저 결승선에 닿는 달팽이가 첫째. 가장 늦게 들어오는 달팽이는 다섯째. 누구를 응원할까요?",fit_slides:["motivate","game"]},
  {id:"r_relay",type:"real_world",icon:"🌍",title:"이어달리기",content:"이어달리기는 4명이 차례대로 달려요. 첫째 주자 · 둘째 주자 · 셋째 주자 · 넷째 주자. 순서가 바뀌면 시합 결과도 달라져요.",fit_slides:["motivate","basic_problem"]},
  {id:"x_count_vs_order",type:"misconception",icon:"❓",title:"오개념: 집합수와 순서수 혼동",content:"학생들이 '셋'과 '셋째'를 같은 뜻으로 사용하는 경우가 많아요. '셋' = 세 개의 합, '셋째' = 셋 번째 자리 하나. 의도적으로 두 표현을 구분해 사용해 주세요.",fit_slides:["concept","basic_problem"]},
  {id:"m_two_names",type:"tip",icon:"🧩",title:"두 가지 이름 함께 노출",content:"매 활동에서 '둘 마리(집합수) — 둘째 자리(순서수)' 식으로 두 표현을 같이 들려주면 자연스럽게 구분이 생겨요.",fit_slides:["concept"]},
  {id:"m_left_first",type:"tip",icon:"🧩",title:"왼쪽이 기본 기준",content:"한국어 글자가 왼쪽에서 오른쪽으로 읽히듯, 순서 세기도 왼쪽에서 시작이 자연스러워요. 단, 줄을 어디서 보느냐에 따라 기준이 바뀌는 것을 꼭 짚어 주세요.",fit_slides:["visual_demo","compare"]},
  {id:"x_direction_matters",type:"misconception",icon:"❓",title:"오개념: 순서는 항상 한 방향",content:"학생들이 '셋째'를 보면 항상 왼쪽에서 셋째라 생각하는 경향이 있어요. 기준을 바꾸면 같은 자리도 다른 순서가 됨을 시각으로 보여 주세요.",fit_slides:["compare"]},
  {id:"r_classroom_row",type:"real_world",icon:"🌍",title:"교실 줄 서기",content:"점심시간에 줄을 설 때 '앞에서 셋째' '뒤에서 둘째'를 말해 봐요. 매일 일어나는 순서 표현이에요.",fit_slides:["compare","real_world"]},
  {id:"m_position_tip",type:"tip",icon:"🧩",title:"가운데 = 양쪽 기준에서 같은 순서",content:"5명 줄에서 가운데(셋째)는 왼쪽에서도 셋째, 오른쪽에서도 셋째. 양쪽 기준이 만나는 자리. 학생들이 흥미로워하는 발견 자리.",fit_slides:["concept","compare"]},
  {id:"x_third_vs_three",type:"misconception",icon:"❓",title:"오개념: '셋째' = '세 명'",content:"가장 흔한 오개념. '앞에서 셋째'는 셋째 자리 한 사람, '앞에서 세 명'은 첫째·둘째·셋째 합쳐 세 사람. 한 차시에 여러 번 강조해 주세요.",fit_slides:["misconception","advanced_problem"]},
  {id:"q_fun_lineup",type:"fun_question",icon:"💡",title:"동물 줄 서기",content:"기린·코끼리·사자·원숭이·토끼가 키 순서대로 줄을 섰어요. 키가 큰 동물부터 둘째는 누구일까요?",fit_slides:["basic_problem"]},
  {id:"m_number_line",type:"tip",icon:"🧩",title:"수직선과 순서수",content:"수직선의 1·2·3·4·5는 집합수, 같은 위치를 '첫째·둘째·셋째·넷째·다섯째' 자리로도 부를 수 있어요. 한 수직선에 두 가지 라벨을 같이 그려 비교.",fit_slides:["basic_problem"]},
  {id:"r_elevator_order",type:"real_world",icon:"🌍",title:"엘리베이터 층수",content:"1층부터 5층까지 엘리베이터를 탔어요. 우리 집(5층)은 1층부터 세면 다섯째. 5층 시작이면 첫째. 기준에 따라 순서가 바뀜.",fit_slides:["real_world","compare"]},
  {id:"g_order_call",type:"game",icon:"🎮",title:"순서 호명 놀이",content:"6~9명을 한 줄로 세우고 교사가 '왼쪽에서 다섯째!' '오른쪽에서 둘째!'라고 외치면 해당 학생이 손을 듦. 빠르게 진행하면 긴장감 있는 놀이.",fit_slides:["game"]},
  {id:"g_who_is_it",type:"game",icon:"🎮",title:"누구일까요 놀이",content:"줄 선 학생 중 한 명을 마음에 정하고 다른 친구가 '앞에서 셋째인 친구?' 식으로 묻기. 짝꿍 게임으로도 가능.",fit_slides:["game"]},
  {id:"b_lineup_book",type:"book",icon:"📖",title:"『줄을 서요』 그림책",content:"줄 서는 상황을 담은 그림책. 동물·아이들이 차례로 줄을 서고 첫째·둘째 순서를 자연스럽게 다룸. 도입과 정리 자리 모두 활용 가능.",source:"여러 작가 버전 — 학교 도서관 비치 확인",fit_slides:["cover","summary"]},
  {id:"e_beyond_5",type:"extension",icon:"⬆",title:"5보다 큰 순서",content:"다음 차시에서는 6·7·8·9를 배워요. 그러면 '여섯째' '일곱째'도 만나요. 학생이 미리 흥미를 갖도록 안내.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 7차시: 수의 순서를 알아볼까요 ───────────
  // 1~9 순서대로 / 9~1 거꾸로 / 중간부터 양방향. 9 다음·1 이전 호기심(0·10 후속 연결).
  LESSONS["u1_l07"] = {
    meta: {
      title: "1학년 수학 1단원 7차시",
      subtitle: "수의 순서를 알아볼까요",
      std: "[2수01-03]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"수의 순서를\n알아볼까요?\n1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9",emoji:""},suggested_extras:["v_count_song_kor","r_calendar"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"순서수 (**첫째·둘째·셋째…**)\n같은 자리도 **기준이 다르면** 다른 순서로 불러요\n오늘은 **수의 줄**을 만들어 봐요"},suggested_extras:[]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"숫자 카드가 흩어졌어요",kids:[{face:"🤔",label:"3"},{face:"🤔",label:"7"},{face:"🤔",label:"1"},{face:"🤔",label:"5"}],question:"이 카드를 **작은 수부터** 차례로 놓으려면 어떻게 할까요?"},suggested_extras:["q_fun_cards","r_calendar_seq"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"수의 순서 — 1부터 9까지",bidirect:["1 → 2 → 3 → 4 → 5","↓","6 → 7 → 8 → 9","↓","**한 칸씩 커져요**"]},suggested_extras:["m_one_more_step","r_stairs"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"1부터 9까지 계단으로 보면",linking_cube_staircase:{range:[1,9]},caption:"한 칸씩 자라요. 옆 칸은 1만큼 차이!"},suggested_extras:["m_stair_metaphor","v_count_song_kor"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"거꾸로 세어 볼까요?",bidirect:["9 → 8 → 7 → 6 → 5","↓","4 → 3 → 2 → 1","↓","**한 칸씩 작아져요**"]},suggested_extras:["v_chickadees_song","r_countdown"]},
  {id:"s07",stage:"전개",block:"visual_demo",data:{title:"중간에서도 시작할 수 있어요",ten_frame_solo:{count:5,is_anchor:true,label:"5에서 시작해요"},sub_text:"5부터 위로 올라가면? **6 · 7 · 8 · 9**\n5부터 아래로 내려가면? **4 · 3 · 2 · 1**"},suggested_extras:["m_two_directions"]},
  {id:"s08",stage:"전개",block:"misconception",data:{title:"조심해요 — 자주 헷갈리는 것",label:"오개념 주의",wrong:"9 다음은? 1 이전은?",right:"오늘은 1~9까지만 다뤄요.\n**0과 10**은 다음 시간에 만나요!",hint:"수의 줄은 더 길어질 수 있어요. 호기심을 가져요."},suggested_extras:["x_what_after_9","e_zero_intro","e_above_9"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"interactive_number_line",data:{title:"앞에 나와서 점을 움직여 봐요",range:[1,9],start:3,question:"점을 누르거나 버튼으로 한 칸씩 옮겨 봐요"},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"빈칸을 채워 봐요",question:"**2 · 3 · ___ · 5 · 6**\n순서대로 빠진 수는 무엇일까요?",answer:4,note:"2,3,4,5,6 차례. 빠진 수는 4."},suggested_extras:["m_one_more_step"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"거꾸로도 채워 봐요",question:"**7 · 6 · 5 · ___ · 3**\n거꾸로 셀 때 빠진 수는 무엇일까요?",answer:4,note:"거꾸로 7,6,5,4,3. 빠진 수는 4."},suggested_extras:[]},
  {id:"s12",stage:"기본문제",block:"card_arrange",data:{title:"수 카드를 순서대로 놓아 봐요",instruction:"카드를 드래그해서 **작은 수부터 큰 수** 순서로 놓아 보세요",cards:[4,2,7,1,5],target:[1,2,4,5,7]},suggested_extras:[]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"달력에서 만나는 수의 순서",scenario:{icon:"📅",body:"달력은 1일부터 시작해요.\n오늘이 **5일**이면\n어제는 **4일**, 내일은 **6일**.\n매일 수가 한 칸씩 움직여요."}},suggested_extras:["r_calendar_seq","r_calendar"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"숫자판 길 따라가기",tag:"교실에서 함께 해요",icon:"👣",body:"바닥에 1~9 숫자판을 한 줄로 놓아요.\n학생이 한 칸씩 밟으며 수를 외쳐요.\n**1부터 9까지** 가 보고\n**9부터 1까지** 거꾸로도 가 봐요.",materials:"1~9 숫자판 1세트 · 바닥 자리"},suggested_extras:["a_pe_room","m_safety_walk"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"수 카드 순서 놀이",steps:["짝과 함께 1~9 수 카드(꾸러미 4) 꺼내기","카드를 뒤집어 섞기","한 명이 카드 5장을 골라 뽑기","뽑은 카드를 **작은 수부터 큰 수** 순서로 놓기","역할 바꿔서 또 해 봐요"]},suggested_extras:["g_order_speed","g_who_next"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["1부터 9까지 **순서대로** 셀 수 있어요","9부터 1까지 **거꾸로** 셀 수 있어요","**중간**에서도 시작할 수 있어요 (위로·아래로)","수의 줄은 더 길어질 수 있어요 — 다음 시간에 만나요"]},suggested_extras:["b_count_to_10"]},
  {id:"s17",stage:"정리",block:"basic_problem",data:{title:"마지막 확인",question:"**6 다음 수**는?\n**6 이전 수**는?\n둘 다 말할 수 있나요?",answer:"6 다음은 7, 6 이전은 5",note:"수의 순서에서 6 바로 뒤=7, 바로 앞=5."},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**1만큼 더 큰 수**와\n**1만큼 더 작은 수**를 만나요!\n오늘 배운 수의 줄과 어떻게 연결될까요?",emoji:""},suggested_extras:["e_pm1_preview"]}
    ],
    extras: [
  {id:"v_count_song_kor",type:"video",icon:"🎥",title:"핑크퐁 1-10 숫자송",url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q",video_id:"Qxi-dPmsl-Q",description:"1부터 10까지 순서대로 노래로 익히기. 도입과 전개 자리에 흥미 유발용. 1~9 순서 학습의 가장 친숙한 도구.",source:"핑크퐁 (Pinkfong) — 유튜브 공개 영상",fit_slides:["cover","visual_demo"]},
  {id:"v_chickadees_song",type:"video",icon:"🎥",title:"Five Little Chickadees",url:"https://www.youtube.com/results?search_query=five+little+chickadees+song",description:"5에서 1까지 한 마리씩 줄어드는 영어 동요. 거꾸로 세기 자리에 활용.",source:"영미권 전래 동요 (퍼블릭 도메인). 유튜브 다수 공개 영상 — 교사 선택",fit_slides:["concept"]},
  {id:"r_calendar",type:"real_world",icon:"🌍",title:"달력의 날짜 순서",content:"달력은 매일 1만큼씩 커지는 수의 순서. 1일 다음은 2일, 2일 다음은 3일. 자연스럽게 수의 줄을 익힐 수 있는 일상 도구.",fit_slides:["cover","real_world"]},
  {id:"r_calendar_seq",type:"real_world",icon:"🌍",title:"이번 주 날짜 세기",content:"이번 주 월요일이 며칠인지 보고 화·수·목·금까지 하루씩 더해 보세요. 수가 한 칸씩 커지는 것을 매일 경험할 수 있어요.",fit_slides:["motivate","real_world"]},
  {id:"q_fun_cards",type:"fun_question",icon:"💡",title:"카드가 흩어진 이유",content:"한 친구가 1~9 카드를 떨어뜨려 흩어졌어요. 작은 수부터 줄을 세워 주려면 어떤 카드를 가장 먼저 들어야 할까요? 어떤 카드는 마지막에?",fit_slides:["motivate"]},
  {id:"m_one_more_step",type:"tip",icon:"🧩",title:"한 칸씩 커지는 규칙",content:"수의 순서는 '한 칸씩 커진다'는 규칙. 이 규칙을 손가락·계단·발걸음 등 몸으로 표현하면 자연스럽게 익혀요.",fit_slides:["concept","basic_problem"]},
  {id:"r_stairs",type:"real_world",icon:"🌍",title:"계단을 오르고 내리기",content:"계단을 한 칸씩 올라가면 수도 한 칸씩 커져요. 한 칸씩 내려오면 수도 한 칸씩 작아져요. 계단은 수의 순서를 보여 주는 좋은 일상 도구.",fit_slides:["concept","visual_demo"]},
  {id:"m_stair_metaphor",type:"tip",icon:"🧩",title:"수의 계단 그리기",content:"공책에 1~9 수의 계단을 직접 그려 두면 한 칸씩 커지고 작아지는 규칙을 시각으로 익혀요. 이후 ±1·크기 비교 학습의 기반.",fit_slides:["visual_demo"]},
  {id:"r_countdown",type:"real_world",icon:"🌍",title:"카운트다운",content:"로켓이 발사할 때 5 · 4 · 3 · 2 · 1 · 발사! 신호등이 깜빡일 때 5 · 4 · 3 · 2 · 1. 거꾸로 세기는 생활 곳곳에서 만나요.",fit_slides:["concept"]},
  {id:"m_two_directions",type:"tip",icon:"🧩",title:"가운데부터 양방향",content:"중간 수(예: 5)부터 위로·아래로 모두 셀 수 있다는 것은 수의 순서 이해의 핵심. 한 방향만 외우지 않도록 양방향 연습을 균형있게.",fit_slides:["visual_demo"]},
  {id:"x_what_after_9",type:"misconception",icon:"❓",title:"오개념: '9 다음은 없다'",content:"학생이 '9 다음은 없어요'라고 답할 수 있음. 실제로는 10이 있고 그 뒤로도 계속됨. 1단원에서는 9까지만 다루지만 '더 큰 수가 있다'는 호기심은 살려 주세요.",fit_slides:["misconception","next_lesson"]},
  {id:"e_zero_intro",type:"extension",icon:"⬆",title:"1 이전 수는?",content:"1 이전 수는… 다음 차시(9차시)에서 만나요! 0이라는 새로운 수가 등장합니다.",fit_slides:["misconception","next_lesson"]},
  {id:"e_above_9",type:"extension",icon:"⬆",title:"9 이후 수는?",content:"9 이후 수는 10! 다음 단원(50까지의 수)에서 만나요. 두 자리 수의 세계.",fit_slides:["misconception","next_lesson"]},
  {id:"a_pe_room",type:"other_activity",icon:"📚",title:"다른 활동 — 강당에서 숫자판 길",content:"교실 바닥이 좁으면 강당이나 복도에서 1~9 숫자판을 길게 늘어놓고 학생이 직접 걷기. 큰 동작으로 익히면 기억에 잘 남아요.",fit_slides:["offline_activity"]},
  {id:"m_safety_walk",type:"tip",icon:"🧩",title:"안전 주의 — 경쟁 X",content:"숫자판 길 따라가기는 빨리 가는 시합이 아니에요. 한 발씩 정확하게 밟으며 수를 외치는 것이 목적. 부딪힘·미끄러짐 방지.",fit_slides:["offline_activity"]},
  {id:"g_order_speed",type:"game",icon:"🎮",title:"수 카드 순서 빨리 놓기",content:"짝과 동시에 카드 5장씩 받아 누가 먼저 작은 수부터 순서대로 놓는지 시합. 정확함이 우선, 그다음에 속도.",fit_slides:["game"]},
  {id:"g_who_next",type:"game",icon:"🎮",title:"누가 다음 수일까",content:"교사가 '5'를 말하면 학생들이 빠르게 '4 또는 6'을 답함. 다음·이전 수 빠르게 말하기 놀이.",fit_slides:["game"]},
  {id:"b_count_to_10",type:"book",icon:"📖",title:"『열까지 셀 줄 아는 아기염소』",content:"알프 프뢰위센. 아기 염소가 동물들을 만나며 1부터 10까지 세는 그림책. 한 마리씩 늘어나는 구조가 수의 순서와 정확히 일치.",source:"알프 프뢰위센 / 마루벌",fit_slides:["cover","summary"]},
  {id:"e_pm1_preview",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"수의 순서(1·2·3·…·9)를 알면, 어떤 수의 '1만큼 더 큰 수'와 '1만큼 더 작은 수'를 자연스럽게 말할 수 있어요. 8차시 ±1은 7차시 순서의 연장이에요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 8차시: 1만큼 더 큰 수와 1만큼 더 작은 수 ───────────
  LESSONS["u1_l08"] = {
    meta: {
      title: "1학년 수학 1단원 8차시",
      subtitle: "1만큼 더 큰 수와 1만큼 더 작은 수",
      std: "[2수01-03]",
      duration: 40
    },
    slides: [
  // ===== 도입 (5) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"1만큼 더 큰 수와\n1만큼 더 작은 수를\n알아볼까요?",emoji:""},suggested_extras:["v_count_song_kor"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"**1부터 9까지**의 수\n수의 순서 (1→2→3...→9)\n9부터 1까지 거꾸로 (9→8→7...→1)"},suggested_extras:["v_count_song_kor"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"딱지치기를 해요",kids:[{face:"🙂",label:"딱지 3장"},{face:"🙂",label:"딱지 3장"}],question:"누가 이기면 딱지 수가 어떻게 바뀔까요?"},suggested_extras:["q_fun_dinosaur","b_one_more"]},
  {id:"s04",stage:"도입",block:"concept",data:{title:"하나 더 많아지면? 하나 더 적어지면?",kids_after:[{face:"🙂",label:"4장",delta:"하나 많아졌어요",dir:"up"},{face:"🙂",label:"2장",delta:"하나 적어졌어요",dir:"down"}]},suggested_extras:["r_elevator","m_finger_tip"]},
  {id:"s05",stage:"도입",block:"question",data:{title:"우리 주변에서도 비슷한 일이 있을까요?",content:"사탕을 하나 더 받으면?\n친구에게 연필 하나 빌려주면?\n동생이 한 살 더 먹으면?"},suggested_extras:["r_age","r_calendar"]},

  // ===== 전개 (8) =====
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"딱지가 **3장** 있어요",ten_frame_solo:{count:3,is_anchor:true,label:"3 — 기준이 되는 수"}},suggested_extras:["m_number_line"]},
  {id:"s06b",stage:"전개",block:"interactive_ten_frame",data:{title:"앞에 나와서 직접 채워봐요",start_count:3,question:"3에서 **하나 더 채우면** 몇이 되나요?\n**하나 비우면** 몇이 되나요?"},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"visual_demo",data:{title:"하나 더 받으면?",ten_frame_solo:{count:4,is_anchor:false,label:"3보다 **하나 더 많아요**\n그래서 4"},sub_text:"빈 칸이 하나 채워졌어요"},suggested_extras:[]},
  {id:"s08",stage:"전개",block:"visual_demo",data:{title:"하나 잃으면?",ten_frame_solo:{count:2,is_anchor:false,label:"3보다 **하나 더 적어요**\n그래서 2"},sub_text:"채워진 칸이 하나 줄었어요"},suggested_extras:[]},
  {id:"s09",stage:"전개",block:"compare",data:{title:"한눈에 비교해 볼까요?",items:[{ten_frame:2,num:2,caption:"3보다 1만큼\n**더 작은 수**"},{ten_frame:3,num:3,caption:"기준",is_anchor:true},{ten_frame:4,num:4,caption:"3보다 1만큼\n**더 큰 수**"}]},suggested_extras:["x_zero_confusion","x_more_means_bigger"]},
  {id:"s10",stage:"전개",block:"arrow_flow",data:{title:"이렇게 외워봐요",flow:[{num:2,label:"**작은 수**",type:"normal"},{num:3,label:"**기준**",type:"anchor"},{num:4,label:"**큰 수**",type:"up"}],sub:"왼쪽으로 가면 더 작아요 · 오른쪽으로 가면 더 커요"},suggested_extras:["m_number_line"]},
  {id:"s11",stage:"전개",block:"visual_demo",data:{title:"1부터 9까지 계단을 만들어 봐요",linking_cube_staircase:{range:[1,9]},caption:"한 칸씩 자라요. 옆 칸은 1만큼 차이!"},suggested_extras:["m_number_line"]},
  {id:"s11b",stage:"전개",block:"interactive_cube_stairs",data:{title:"앞에 나와서 직접 쌓아봐요",start_count:5,question:"**5**에서 한 칸 쌓으면? 한 칸 빼면?"},suggested_extras:[]},
  {id:"s12",stage:"전개",block:"concept",data:{title:"같은 일을 두 가지 말로",bidirect:["**5**는 **6**보다 1만큼 더 **작은 수**","=","**6**은 **5**보다 1만큼 더 **큰 수**"]},suggested_extras:["x_more_means_bigger"]},
  {id:"s13",stage:"전개",block:"misconception",data:{title:"조심해요 — 자주 헷갈리는 것",label:"오개념 주의",wrong:"3에서 하나 적어지면... 0?",right:"아니에요! **2**예요. 하나만 줄어드는 거예요.",hint:"십 배열판으로 보면 한 칸만 줄어요."},suggested_extras:["x_zero_confusion"]},

  // ===== 기본 문제 (6) =====
  {id:"s14",stage:"기본문제",block:"basic_problem",data:{title:"7보다 1만큼 더 큰 수는?",ten_frame_anchor:7,question:"7보다 1만큼 더 큰 수는 무엇일까요?",answer:8,note:"7+1=8. 십 배열판 한 칸 더."},suggested_extras:["q_fun_pizza"]},
  {id:"s15",stage:"기본문제",block:"basic_problem",data:{title:"6보다 1만큼 더 작은 수는?",ten_frame_anchor:6,question:"6보다 1만큼 더 작은 수는 무엇일까요?",answer:5,note:"6−1=5. 한 칸 빼기."},suggested_extras:["m_finger_tip"]},
  {id:"s16",stage:"기본문제",block:"basic_problem",data:{title:"4보다 1만큼 더 큰 수는?",ten_frame_anchor:4,question:"4보다 1만큼 더 큰 수는?\n4보다 1만큼 더 작은 수는?",answer:"1만큼 더 큰 수 5, 1만큼 더 작은 수 3",note:"4+1=5, 4−1=3."},suggested_extras:[]},
  {id:"s17",stage:"기본문제",block:"basic_problem",data:{title:"양방향 연습 1",question:"**8**은 **9**보다 1만큼 더 ___ 수\n**8**은 **7**보다 1만큼 더 ___ 수",answer:"8은 9보다 1만큼 더 작은 수, 8은 7보다 1만큼 더 큰 수",note:"9−1=8(작은), 7+1=8(큰). 8은 7과 9 사이."},suggested_extras:[]},
  {id:"s18",stage:"기본문제",block:"basic_problem",data:{title:"양방향 연습 2",question:"**5**보다 1만큼 더 작은 수와\n**5**보다 1만큼 더 큰 수는?",answer:"작은 수 4, 큰 수 6",note:"5−1=4, 5+1=6."},suggested_extras:[]},
  {id:"s19",stage:"기본문제",block:"number_line_demo",data:{title:"수직선으로 확인해요",nl:{range:[1,9],anchor:5},caption:"5의 양옆은 4와 6"},suggested_extras:["m_number_line"]},
  {id:"s19b",stage:"기본문제",block:"interactive_number_line",data:{title:"앞에 나와서 점을 움직여 봐요",range:[1,9],start:5,question:"점을 누르거나 버튼으로 옆 칸으로 움직여 봐요"},suggested_extras:[]},

  // ===== 응용 문제 (8) =====
  {id:"s20",stage:"응용문제",block:"real_world",data:{title:"엘리베이터에서 만나는 ±1",scenario:{icon:"🏢",body:"지금 **5층**에 있어요.\n한 층 올라가면? **6층**\n한 층 내려가면? **4층**"}},suggested_extras:["r_elevator","r_calendar"]},
  {id:"s20b",stage:"응용문제",block:"card_arrange",data:{title:"수 카드 순서대로 놓기",instruction:"카드를 드래그해서 **작은 수부터 큰 수** 순서로 놓아 보세요",cards:[3,1,5,2,4],target:[1,2,3,4,5]},suggested_extras:[]},
  {id:"s21",stage:"응용문제",block:"real_world",data:{title:"달력 속의 ±1",scenario:{icon:"📅",body:"오늘이 **8일**이에요.\n어제는 **7일** (1만큼 더 작은 수)\n내일은 **9일** (1만큼 더 큰 수)"}},suggested_extras:["r_calendar"]},
  {id:"s22",stage:"응용문제",block:"real_world",data:{title:"나이로 만나는 ±1",scenario:{icon:"👨‍👩‍👧",body:"나는 **8살**.\n1살 더 많은 형은 **9살** (1만큼 더 큰 수)\n1살 더 어린 동생은 **7살** (1만큼 더 작은 수)"}},suggested_extras:["r_age"]},
  {id:"s23",stage:"응용문제",block:"advanced_problem",data:{title:"줄넘기 횟수",context:"어제는 오늘보다 하나 더 적게,\n내일은 오늘보다 하나 더 많이 넘기로 했어요.\n오늘 **8번** 넘었어요.",questions:["어제 넘은 횟수는?","내일 넘을 횟수는?"],answers:["어제 7번","내일 9번"],note:"오늘 8 기준. 어제=8−1=7, 내일=8+1=9."},suggested_extras:["r_age"]},
  {id:"s24",stage:"응용문제",block:"advanced_problem",data:{title:"한 단계 더 — 사탕 나누기",context:"형이 사탕을 **6개** 가지고 있어요.\n동생은 형보다 **1만큼 더 적게** 가지고 있어요.",questions:["동생은 사탕을 몇 개 가지고 있을까요?","둘이 합치면 모두 몇 개?"],answers:["동생 5개","둘이 합치면 11개"],note:"동생=6−1=5. 합=6+5=11. (합치기는 뒤 단원에서 더 배워요.)"},suggested_extras:[]},
  {id:"s25",stage:"응용문제",block:"offline_activity",data:{title:"손가락으로 표현하기",tag:"교실에서 함께 해요",icon:"✋",body:"선생님이 수를 외쳐요!\n그 수보다 **1만큼 더 큰 수**만큼 손가락을 들어요.\n다음엔 **1만큼 더 작은 수**만큼 들어 봐요.",materials:"손가락만 있으면 돼요"},suggested_extras:[]},
  {id:"s26",stage:"응용문제",block:"offline_activity",data:{title:"칠판 앞에 나와서 써봐요",tag:"교실에서 함께 해요",icon:"🖍️",body:"선생님이 수 카드를 보여줘요.\n학생이 칠판 앞에 나와서\n**1만큼 더 큰 수**와 **1만큼 더 작은 수**를 분필로 써요.",materials:"수 카드 1~9 · 분필"},suggested_extras:[]},
  {id:"s27",stage:"응용문제",block:"game",data:{title:"수 알아맞히기 놀이",steps:["짝과 함께 수 카드(1~9) 뒤집어 놓기","한 명이 카드 1장 골라 잡기 (1·9는 빼고)","다른 한 명이 질문: '○○보다 1만큼 더 큰 수인가요?'","맞히면 점수! 역할 바꿔서 또 하기"]},suggested_extras:["g_card_bingo","g_finger_game","a_dice_game"]},
  {id:"s28",stage:"응용문제",block:"game",data:{title:"손가락 ±1 놀이",steps:["짝과 마주 앉기","한 명이 손가락 N개 들기 (예: 4개)","다른 한 명: '1만큼 더 큰 수 = 5개' 빨리 들기","'1만큼 더 작은 수 = 3개' 도 해 보기","빨리 정확하게 드는 사람이 점수"]},suggested_extras:["g_finger_game"]},
  {id:"s29",stage:"응용문제",block:"advanced_problem",data:{title:"도전 — 두 가지로 말해보기",challenge:"**8**을 묻고 싶을 때,\n어떻게 질문할 수 있을까요?\n방법은 **두 가지!**"},suggested_extras:[]},

  // ===== 정리 (5) =====
  {id:"s30",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["어떤 수보다 **1만큼 더 큰 수**","어떤 수보다 **1만큼 더 작은 수**","같은 수도 **두 가지 방법**으로 말할 수 있어요","수직선·계단으로 보면 옆 칸이 ±1"]},suggested_extras:["b_number_book"]},
  {id:"s31",stage:"정리",block:"question",data:{title:"스스로 점검",content:"1만큼 더 큰 수를 말할 수 있나요?\n1만큼 더 작은 수를 말할 수 있나요?\n같은 수를 두 가지 방법으로 말할 수 있나요?"},suggested_extras:[]},
  {id:"s32",stage:"정리",block:"basic_problem",data:{title:"마지막 확인",ten_frame_anchor:5,question:"5보다 1만큼 더 큰 수와\n5보다 1만큼 더 작은 수를 말해 봐요.",answer:"큰 수 6, 작은 수 4",note:"5+1=6, 5−1=4."},suggested_extras:[]},
  {id:"s33",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"1보다 1만큼 더 작은 수는?\n새로운 수 **0** 이 나타나요.",emoji:""},suggested_extras:["e_zero_intro"]},
  {id:"s34",stage:"정리",block:"next_lesson",data:{title:"한 가지 더 궁금해요",preview:"9보다 1만큼 더 큰 수는?\n**10** 이라는 수가 곧 나와요!\n(다음 단원에서)",emoji:""},suggested_extras:["e_above_9"]}
    ],
    extras: [
  {id:"v_geni_pm1",type:"video",icon:"🎥",title:"지니와 함께하는 수학 — 1만큼 더 큰 수·작은 수",url:"https://www.youtube.com/watch?v=kfg8v8CRLRI",video_id:"kfg8v8CRLRI",description:"8차시 ±1 개념 직격 영상. 스마트올TV의 1학년 1학기 1단원 9까지의 수 학습 영상으로, 1만큼 더 큰 수와 1만큼 더 작은 수를 다룸. 수업 도입·개념 단계에 그대로 띄울 수 있음.",source:"스마트올TV (개인·학교 무료 사용 허용 — 출처·링크 표기 조건)",fit_slides:["motivate", "concept", "review"]},
  {id:"v_chickadees_song",type:"video",icon:"🎥",title:"Five Little Chickadees",url:"https://www.youtube.com/results?search_query=five+little+chickadees+song",description:"1만큼 적어지는 개념을 노래로 익히는 영어 동요. 챙기새 5마리가 하나씩 줄어듦.",source:"영미권 전래 동요 (퍼블릭 도메인). 유튜브에 다수 공개 영상 존재 — 교사 선택",fit_slides:["motivate", "concept"]},
  {id:"v_count_song_kor",type:"video",icon:"🎥",title:"핑크퐁 1-10 숫자송",url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q",video_id:"Qxi-dPmsl-Q",description:"1부터 10까지 노래로 익히기. 도입 자리에 흥미 유발용. 전시 학습(1~9 수 이름) 상기에도 좋음.",source:"핑크퐁 (Pinkfong) — 유튜브 공개 영상",fit_slides:["motivate", "review"]},
  {id:"q_fun_dinosaur",type:"fun_question",icon:"💡",title:"공룡이 5마리 있다면?",content:"공룡이 5마리 놀고 있어요. 1마리가 더 오면 몇 마리? 1마리가 가버리면 몇 마리?",fit_slides:["motivate", "basic_problem"]},
  {id:"q_fun_pizza",type:"fun_question",icon:"💡",title:"피자 조각 이야기",content:"피자가 7조각 있었는데 한 조각을 먹었어요. 몇 조각이 남았을까요? (7보다 1만큼 더 작은 수)",fit_slides:["basic_problem", "real_world"]},
  {id:"g_card_bingo",type:"game",icon:"🎮",title:"수 카드 빙고 (변형)",content:"3×3 빙고판. 교사가 '4보다 1만큼 더 큰 수'라고 외치면 학생은 5에 동그라미. ±1 표현 듣고 답하기 익히기.",fit_slides:["game", "advanced_problem"]},
  {id:"g_finger_game",type:"game",icon:"🎮",title:"손가락 ±1 놀이",content:"짝과 마주 앉아 한 명이 손가락 N개를 들면, 다른 한 명은 1만큼 더 큰 수·작은 수만큼 손가락을 듦. 빨리 정확히 드는 사람 승.",fit_slides:["game"]},
  {id:"r_elevator",type:"real_world",icon:"🌍",title:"엘리베이터 층수",content:"5층에서 1층 올라가면 6층, 1층 내려가면 4층. 엘리베이터 버튼이 ±1의 좋은 예.",fit_slides:["concept", "real_world"]},
  {id:"r_calendar",type:"real_world",icon:"🌍",title:"달력 날짜",content:"오늘이 8일이면 어제는 7일, 내일은 9일. 매일 ±1로 날짜가 바뀜.",fit_slides:["real_world"]},
  {id:"r_age",type:"real_world",icon:"🌍",title:"나이",content:"나는 8살. 1살 더 많은 형은 9살. 1살 더 어린 동생은 7살.",fit_slides:["real_world"]},
  {id:"e_zero_intro",type:"extension",icon:"⬆",title:"1보다 1만큼 더 작은 수는?",content:"1보다 1만큼 더 작은 수는… 다음 차시(9차시)에서 배워요! 0이라는 새로운 수가 등장합니다.",fit_slides:["next_lesson", "summary"]},
  {id:"e_above_9",type:"extension",icon:"⬆",title:"9보다 1만큼 더 큰 수는?",content:"9보다 1만큼 더 큰 수는 10! 다음 단원(50까지의 수)에서 만나요.",fit_slides:["next_lesson"]},
  {id:"b_number_book",type:"book",icon:"📖",title:"『숫자가 사라졌어요』 - 로렌 리디",content:"갑자기 숫자가 사라진 세상 이야기. 수의 필요성·이웃 수 개념을 자연스럽게 익힘.",source:"로렌 리디 (Loreen Leedy) / 비룡소 (한국어판)",fit_slides:["motivate", "summary"]},
  {id:"b_one_more",type:"book",icon:"📖",title:"『One More』 - 그림책",content:"동물이 하나씩 늘어나는 단순한 구조의 그림책. ±1 개념 시각화.",source:"영미권 그림책 (저자·출판사 다수 버전 — 교사가 도서관에서 확인 후 사용)",fit_slides:["motivate"]},
  {id:"m_finger_tip",type:"tip",icon:"🧩",title:"1만큼 더 작은 수 헷갈리면",content:"손가락 N개를 펴고 → 한 개 접으면 → 그게 1만큼 더 작은 수.",fit_slides:["concept", "basic_problem"]},
  {id:"m_number_line",type:"tip",icon:"🧩",title:"수직선 활용",content:"1~9 수직선 그려두면 ±1 = 한 칸 옆. 이후 덧셈·뺄셈 학습 기반.",fit_slides:["concept", "visual_demo"]},
  {id:"x_zero_confusion",type:"misconception",icon:"❓",title:"오개념: '하나 적어짐 = 없어짐'",content:"어떤 학생은 '3에서 1만큼 더 작은 수'를 '0' 또는 '없어요'라고 답함. 실제는 2. 십 배열판으로 한 칸만 줄어드는 것 시각화.",fit_slides:["concept", "compare"]},
  {id:"x_more_means_bigger",type:"misconception",icon:"❓",title:"오개념: '더 많다 = 더 크다'",content:"학생들이 양(많다/적다)과 수(크다/작다)를 혼동. 일관되게 '1만큼 더 큰 수' / '1만큼 더 작은 수' 표현 사용.",fit_slides:["concept"]},
  {id:"a_other_textbook_card",type:"other_activity",icon:"📚",title:"다른 활동 — '이웃 수 카드 만들기'",content:"수 카드 5에 대해 '1만큼 더 작은 수(4)'와 '1만큼 더 큰 수(6)' 양옆에 놓기. 1~9 모두 만들면 자동으로 1~9 순서가 됨.",fit_slides:["advanced_problem", "game"]},
  {id:"a_dice_game",type:"other_activity",icon:"📚",title:"다른 활동 — 주사위 ±1",content:"주사위 굴려 나온 수의 1만큼 더 큰 수·작은 수 말하기. 1·6 나오면 한쪽만 답 가능 → 자연스럽게 0·7 호기심 유발.",fit_slides:["game"]},
  {id:"r_candy",type:"real_world",icon:"🌍",title:"사탕 봉지",content:"사탕이 6개 있어요. 친구가 1개 더 주면 7개. 내가 1개 먹으면 5개. 사탕 개수가 1만큼씩 늘고 줄어요.",fit_slides:["real_world", "concept"]},
  {id:"r_traffic_light",type:"real_world",icon:"🌍",title:"신호등 카운트다운",content:"횡단보도 신호등이 5초 남았다고 깜빡여요. 1초 지나면 4초 남았어요. 또 1초 지나면 3초. 시간이 1만큼씩 줄어요.",fit_slides:["real_world"]},
  {id:"r_shoebox",type:"real_world",icon:"🌍",title:"신발장 번호",content:"내 신발장은 5번. 1만큼 더 큰 수가 적힌 6번 신발장에는 누구 신발이 있을까? 1만큼 더 작은 수인 4번에는?",fit_slides:["real_world", "basic_problem"]},
  {id:"r_bus_stop",type:"real_world",icon:"🌍",title:"버스 정류장 대기 인원",content:"버스를 기다리는 사람이 4명이었어요. 1명이 더 와서 5명이 됐어요. 그런데 1명이 그냥 가버리면 다시 4명. ±1이 매일 일어나는 곳.",fit_slides:["real_world"]},
  {id:"q_fun_zoo",type:"fun_question",icon:"💡",title:"동물원에 사자가 6마리",content:"동물원 우리에 사자 6마리가 있어요. 옆 동물원에서 1마리 더 오면 몇 마리? 1마리가 다른 곳으로 가면 몇 마리?",fit_slides:["motivate", "basic_problem"]},
  {id:"q_fun_pets",type:"fun_question",icon:"💡",title:"강아지 발자국 세기",content:"산책 가는 강아지 발자국이 3개 찍혔어요. 한 발 더 가면 4개. 한 발 더 가면 5개. 발자국이 1만큼씩 늘어나요.",fit_slides:["motivate", "concept"]},
  {id:"q_fun_classroom",type:"fun_question",icon:"💡",title:"교실 친구 수",content:"오늘 우리 반에 친구가 8명 왔어요. 한 명이 더 오면 9명. 한 명이 일찍 가면 7명. 1만큼이 우리 교실에서도 일어나요.",fit_slides:["real_world", "motivate"]},
  {id:"g_clap_count",type:"game",icon:"🎮",title:"손뼉 ±1 게임",content:"교사가 손뼉 5번을 친 다음 '1만큼 더 많이!'라고 외치면 학생은 6번. '1만큼 더 적게!'라고 외치면 4번. 박자 맞춰 빠르게.",fit_slides:["game", "advanced_problem"]},
  {id:"g_jumping",type:"game",icon:"🎮",title:"수 뛰어 만들기",content:"줄넘기 3번 뛴 친구에게 '1만큼 더 큰 수'를 외치면 4번까지 뛰기. '1만큼 더 작은 수'면 멈춰서 2번까지만 한 것으로. 체험으로 익히는 ±1.",fit_slides:["game"]},
  {id:"b_count_to_10",type:"book",icon:"📖",title:"『열까지 셀 줄 아는 아기염소』",content:"알프 프뢰위센. 아기 염소가 동물들을 만나며 1부터 10까지 세는 그림책. 한 마리씩 늘어나는 구조가 ±1 개념과 정확히 일치.",source:"알프 프뢰위센 / 마루벌",fit_slides:["motivate", "concept"]},
  {id:"m_ten_frame_tip",type:"tip",icon:"🧩",title:"십 배열판으로 ±1 보여주기",content:"십 배열판에 칸이 5개 채워져 있을 때 '1만큼 더 큰 수'는 한 칸을 더 채움 → 6. '1만큼 더 작은 수'는 한 칸을 비움 → 4. 시각·동작으로 동시에 이해.",fit_slides:["concept", "visual_demo"]},
  {id:"x_order_confusion",type:"misconception",icon:"❓",title:"오개념: '다음 수' 헷갈림",content:"'5 다음의 수'를 '5보다 1만큼 더 작은 수(4)'로 답하는 학생 있음. '다음'을 '뒤로 간다'로 오해. 수직선·계단으로 '커지는 방향'을 일관되게 보여주기.",fit_slides:["concept", "basic_problem"]}
    ]
  };

  // ─────────── 9차시: 0을 알아볼까요 ───────────
  // 8차시 ±1 연장. 1보다 1만큼 더 작은 수 = 0. 0 = 아무것도 없음. 0 표기·읽기·필순.
  LESSONS["u1_l09"] = {
    meta: {
      title: "1학년 수학 1단원 9차시",
      subtitle: "0을 알아볼까요",
      std: "[2수01-01] · [2수01-03]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"0을 알아볼까요?\n아무것도 없을 때\n새로운 수가 필요해요",emoji:""},suggested_extras:["v_zero_song","r_empty_box"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"**1만큼 더 큰 수**와\n**1만큼 더 작은 수**\n**3 → 2 → 1 → ?**\n1 다음에는 무엇이 올까요?"},suggested_extras:["x_after_one","m_recall_pm1"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"풀이 점점 줄어들어요",kids:[{face:"🙂",label:"풀 3개"},{face:"😐",label:"풀 2개"},{face:"😟",label:"풀 1개"}],question:"한 명이 더 풀을 가져가면\n받침대에는 몇 개가 남을까요?"},suggested_extras:["r_glue_class","q_fun_disappear"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"visual_demo",data:{title:"하나 더 가져가면…",ten_frame_solo:{count:0,is_anchor:true,label:"풀 받침대가 **비었어요**\n남은 풀은 몇 개?"},sub_text:"하나도 없는 것을 **0** 이라고 해요"},suggested_extras:["m_empty_meaning"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"새로운 수 — 0",bidirect:["**아무것도 없음**","↓","**0**","↓","읽을 때는 **영** 또는 **공**"]},suggested_extras:["x_zero_reading","m_two_readings"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"0은 1보다 1만큼 더 작은 수",bidirect:["3 → 2 → 1 → **0**","↓","한 칸씩 더 작아져요","↓","**1보다 1만큼 더 작은 수 = 0**"]},suggested_extras:["m_pm1_extends","x_zero_confusion"]},
  {id:"s07",stage:"전개",block:"visual_demo",data:{title:"0 쓰는 방법",ten_frame_solo:{count:0,is_anchor:true,label:"위에서 시작해서\n둥글게 한 바퀴 돌아 만나요"},sub_text:"손가락으로 허공에 따라 써 봐요"},suggested_extras:["m_zero_stroke","a_trace_zero"]},
  {id:"s08",stage:"전개",block:"misconception",data:{title:"조심해요 — 자주 헷갈리는 것",label:"오개념 주의",wrong:"아무것도 안 적기 = 0",right:"아니에요! 빈칸은 **'적지 않음'**\n**0**은 **'아무것도 없다'**는 것을 적은 거예요.",hint:"0은 분명한 한 글자. 빈칸이 아니에요."},suggested_extras:["x_blank_vs_zero","m_zero_is_number"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"가위가 몇 개?",ten_frame_anchor:0,question:"가위 보관통이 텅 비어 있어요.\n가위는 몇 개일까요?\n어떻게 적을까요?",answer:"0개 — 영이라고 읽고 0으로 적어요",note:"아무것도 없으면 0. 빈칸이 아니라 숫자 0으로 표기."},suggested_extras:["r_glue_class"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"점점 줄어드는 수",question:"**3 → 2 → 1 → ___**\n다음에 올 수는 무엇일까요?",answer:0,note:"한 칸씩 작아져요: 3,2,1,0. 1보다 1 작은 수=0."},suggested_extras:["m_pm1_extends"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"점점 늘어나는 수",question:"**0 → 1 → 2 → ___**\n다음에 올 수는 무엇일까요?",answer:3,note:"한 칸씩 커져요: 0,1,2,3."},suggested_extras:[]},
  {id:"s12",stage:"기본문제",block:"interactive_ten_frame",data:{title:"앞에 나와서 직접 비워봐요",start_count:3,question:"3에서 **하나씩 비워** 봐요.\n**3 → 2 → 1 → 0**\n0이 될 때까지 한 칸씩!"},suggested_extras:[]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"일상에서 만나는 0",scenario:{icon:"🌡️",body:"우유가 **3컵** 있어요. 모두 마시면 **0컵**.\n사탕이 **5개** 있어요. 모두 친구에게 주면 **0개**.\n**'없다'**를 수로 적은 것이 0이에요."}},suggested_extras:["r_empty_box","r_score_zero"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"하나 덜어 내기 놀이",tag:"교실에서 함께 해요",icon:"🥢",body:"모둠 가운데 그릇에 **바둑돌 3개**.\n순서대로 한 명씩 한 개씩 꺼내요.\n그릇이 비면 함께 외쳐요 — **'0개!'**\n바둑돌 수를 바꿔 가며 다시 해 봐요.",materials:"바둑돌 · 작은 접시"},suggested_extras:["a_remove_class","m_safety_zero"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"제로 만들기 놀이",steps:["짝과 함께 사탕 5개씩 가지기","가위바위보로 진 사람이 사탕 1개씩 짝에게 넘기기","사탕 0개가 되면 '제로!' 외치기","역할 바꿔서 또 해 봐요"]},suggested_extras:["g_finger_zero"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["**아무것도 없는 것** = **0**","0은 **1보다 1만큼 더 작은 수**","0은 **'영'**이라고 읽어요","빈칸과 0은 **달라요** — 0은 분명한 수"]},suggested_extras:["b_zero_book"]},
  {id:"s17",stage:"정리",block:"basic_problem",data:{title:"마지막 확인",ten_frame_anchor:1,question:"**1보다 1만큼 더 작은 수**는 무엇인가요?\n그것을 어떻게 적나요?",answer:"0 — 숫자 0으로 적어요",note:"1−1=0. 영으로 읽고 0으로 써요."},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"두 수의 **크기를 비교**해 봐요!\n**3**과 **5** 중에 어느 쪽이 더 클까요?",emoji:""},suggested_extras:["e_compare_preview"]}
    ],
    extras: [
  {id:"v_zero_song",type:"video",icon:"🎥",title:"0의 노래 / 숫자송",url:"https://www.youtube.com/results?search_query=숫자+0+동요+영",description:"0을 소개하는 동요·숫자송. 도입 자리에 흥미 유발. '아무것도 없음'을 시각·청각으로 익히기.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_empty_box",type:"real_world",icon:"🌍",title:"빈 상자",content:"과자 상자를 열었는데 아무것도 없어요. 상자 안에는 과자가 **0개**. 텅 빈 상태를 수로 적는 방법이 0이에요.",fit_slides:["cover","real_world"]},
  {id:"x_after_one",type:"misconception",icon:"❓",title:"오개념: 1 다음은 없다",content:"학생이 1에서 거꾸로 셀 때 '0'을 모르면 '없어요'라고 답할 수 있어요. 0은 '없음'을 적은 한 글자라는 것을 처음부터 분명히.",fit_slides:["review","misconception"]},
  {id:"m_recall_pm1",type:"tip",icon:"🧩",title:"전시 학습 빠르게",content:"도입 자리에서 ±1을 너무 길게 다루지 마세요. 한두 예시로 분위기만 환기. 본론은 0의 도입이에요.",fit_slides:["review"]},
  {id:"r_glue_class",type:"real_world",icon:"🌍",title:"교실 풀 받침대",content:"교실 풀 받침대에 풀이 처음엔 3개 있었어요. 한 명씩 가져가면 2개·1개. 마지막 친구가 가져가면 0개. 흔한 교실 상황으로 0을 만나요.",fit_slides:["motivate","basic_problem"]},
  {id:"q_fun_disappear",type:"fun_question",icon:"💡",title:"하나도 없으면?",content:"매일 사탕 한 개씩 먹어요. 3개로 시작해 하루씩 줄면 마지막 날 봉지에는? 0개. '하나도 없다'를 수로 어떻게 적을까요?",fit_slides:["motivate"]},
  {id:"m_empty_meaning",type:"tip",icon:"🧩",title:"십 배열판 비어 있을 때",content:"십 배열판이 모두 비어 있는 것을 학생에게 보여 주며 '몇 개?'라고 물어요. '없어요'라는 자연스러운 답을 0이라는 기호로 연결.",fit_slides:["visual_demo"]},
  {id:"x_zero_reading",type:"misconception",icon:"❓",title:"오개념: '0'을 '오'로 읽기",content:"숫자 0과 알파벳 O가 비슷해 학생이 '오'로 읽을 수 있어요. 한국어에서는 **영** 또는 **공**이 표준 읽기. 0의 다양한 일상 읽기를 가볍게 소개.",fit_slides:["concept"]},
  {id:"m_two_readings",type:"tip",icon:"🧩",title:"0의 두 가지 읽기",content:"전화번호·우편번호에서는 '공'으로 읽고, 점수·온도·물건 개수에서는 '영'으로 읽어요. 두 가지 모두 맞는 읽기.",fit_slides:["concept"]},
  {id:"m_pm1_extends",type:"tip",icon:"🧩",title:"±1의 자연스러운 연장",content:"8차시에서 배운 '1만큼 더 작은 수' 규칙이 1에서도 작동한다는 점을 강조. 새 개념이 아니라 **기존 규칙의 연장**.",fit_slides:["concept","basic_problem"]},
  {id:"x_zero_confusion",type:"misconception",icon:"❓",title:"오개념: 0은 그냥 없는 것",content:"학생이 0을 '수가 아닌 것' '없으니 안 적어도 되는 것'으로 여길 수 있음. 0은 **수의 줄에 들어가는 분명한 수**라는 점을 반복 강조.",fit_slides:["concept","misconception"]},
  {id:"m_zero_stroke",type:"tip",icon:"🧩",title:"0 필순",content:"위에서 시작해 왼쪽으로 → 아래로 → 오른쪽으로 → 다시 위로 한 바퀴. 한 번에 끝까지 잇는 동그라미. 학생이 손가락으로 허공에 먼저 따라 써 보면 좋아요.",fit_slides:["visual_demo"]},
  {id:"a_trace_zero",type:"other_activity",icon:"📚",title:"다른 활동 — 0 따라쓰기 6회",content:"교과서·익힘책에 0 따라쓰기 칸이 있어요. 6번 정도 반복하면 손에 익어요. 동그라미 모양이 찌그러지지 않도록 천천히.",fit_slides:["visual_demo"]},
  {id:"x_blank_vs_zero",type:"misconception",icon:"❓",title:"오개념: 빈칸 = 0",content:"가장 흔한 혼동. 빈칸은 **'적지 않음'**, 0은 **'없음을 적음'**. 평가 자리에서도 학생이 답을 모를 때 빈칸으로 두는 것과 0으로 답하는 것은 의미가 달라요.",fit_slides:["misconception"]},
  {id:"m_zero_is_number",type:"tip",icon:"🧩",title:"0도 수예요",content:"0이 수의 줄(0·1·2·3·…·9)에 들어가는 것을 칠판에 보여 주세요. 0은 '없음'이지만 수예요.",fit_slides:["misconception","summary"]},
  {id:"r_score_zero",type:"real_world",icon:"🌍",title:"점수 0점",content:"퀴즈 시합에서 한 문제도 못 맞히면 0점. 축구에서 한 골도 못 넣으면 0:0. 점수에서는 0이 자주 등장해요.",fit_slides:["real_world"]},
  {id:"a_remove_class",type:"other_activity",icon:"📚",title:"다른 활동 — 빈 그릇 만들기",content:"바둑돌 대신 사탕·구슬·종이공으로도 가능. 한 사람이 하나씩 가져가는 규칙으로 0이 될 때까지 차례대로 진행.",fit_slides:["offline_activity"]},
  {id:"m_safety_zero",type:"tip",icon:"🧩",title:"바둑돌 안전 주의",content:"바둑돌은 작은 물건. 입에 넣지 않도록 사전 안내. 모둠 활동에서 굴러떨어지지 않게 그릇을 가운데에 안정적으로.",fit_slides:["offline_activity"]},
  {id:"g_finger_zero",type:"game",icon:"🎮",title:"손가락 0 만들기",content:"교사가 수를 외치면 학생이 손가락으로 표현. '3!' → 손가락 3개. '0!' → **주먹**. 0을 동작으로 익히는 빠른 놀이.",fit_slides:["game"]},
  {id:"b_zero_book",type:"book",icon:"📖",title:"『0이 처음 나타났을 때』",content:"수의 역사에서 0이 등장한 이야기를 다룬 그림책. 0이 단순한 기호가 아니라 큰 발견이었다는 것을 알려 줌.",source:"여러 그림책 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_compare_preview",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"오늘까지 배운 0·1·2·…·9 중 두 수를 골라 어느 쪽이 더 큰지 비교해 봐요. 십 배열판으로 양쪽을 보면 한눈에 알 수 있어요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 10차시: 수의 크기를 비교해 볼까요 ───────────
  // 두 수 일대일대응 / 양(많다·적다) vs 수(크다·작다) 표현 구분 / 양방향 가역.
  LESSONS["u1_l10"] = {
    meta: {
      title: "1학년 수학 1단원 10차시",
      subtitle: "수의 크기를 비교해 볼까요",
      std: "[2수01-03]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"수의 크기를\n비교해 볼까요?\n어느 쪽이 더 클까요?",emoji:""},suggested_extras:["v_compare_song","r_team_score"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"지난 시간에 배운 것",content:"**0** 부터 **9** 까지의 수\n수의 **순서**·**±1**\n오늘은 두 수가 만나면\n**어느 쪽이 더 큰지** 알아봐요"},suggested_extras:["m_recall_zero_nine"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"고리 던지기 시합",kids:[{face:"😊",label:"모둠 1\n고리 3개"},{face:"😊",label:"모둠 2\n고리 3개"},{face:"🤩",label:"모둠 3\n고리 5개"}],question:"가장 많이 넣은 모둠은 어디일까요?\n어떻게 알 수 있을까요?"},suggested_extras:["r_pe_game","q_fun_winner"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"하나씩 짝을 지어 봐요",bidirect:["**모둠 1**: ● ● ●","↓","**모둠 3**: ● ● ● ● ●","↓","짝을 지으면 **모둠 3에 두 개가 남아요**","↓","**5는 3보다 더 커요**"]},suggested_extras:["m_one_to_one","x_more_vs_bigger"]},
  {id:"s05",stage:"전개",block:"compare",data:{title:"십 배열판으로 한눈에",items:[{ten_frame:6,num:6,caption:"**6은 4보다**\n**더 커요**"},{ten_frame:0,num:0,caption:"비교",is_anchor:true},{ten_frame:4,num:4,caption:"**4는 6보다**\n**더 작아요**"}]},suggested_extras:["m_ten_frame_compare"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"같은 일을 두 가지 말로",bidirect:["**6은 4보다 더 큰 수**","=","**4는 6보다 더 작은 수**","↓","어느 쪽 기준으로 말해도 맞아요"]},suggested_extras:["m_bidirection","x_only_one_way"]},
  {id:"s07",stage:"전개",block:"misconception",data:{title:"조심해요 — '많다'와 '크다'는 달라요",label:"오개념 주의",wrong:"사탕이 많다 = 사탕이 크다",right:"**물건**은 **많다·적다**\n**수**는 **크다·작다**\n쓰임이 달라요!",hint:"고리 5개는 '많다'. 수 5는 '크다'."},suggested_extras:["x_amount_vs_number","m_word_separation"]},
  {id:"s08",stage:"전개",block:"visual_demo",data:{title:"0도 비교할 수 있어요",ten_frame_solo:{count:0,is_anchor:true,label:"**0과 2**를 비교하면?"},sub_text:"0은 가장 작은 수. **2가 0보다 더 커요**"},suggested_extras:["m_zero_smallest"]},

  // ===== 기본 (4) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"어느 쪽이 더 클까요?",ten_frame_anchor:7,question:"**7**과 **3** 중에\n어느 쪽이 더 큰 수인가요?\n반대로도 말해 보세요.",answer:"7이 3보다 더 큽니다 (3은 7보다 더 작아요)",note:"칸이 더 많은 7이 더 큰 수. 반대로 3은 더 작은 수."},suggested_extras:["m_bidirection"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"빈칸 채우기",question:"**5**는 **8**보다 더 ___\n**8**은 **5**보다 더 ___\n(작은·큰 중에서 골라요)",answer:"5는 8보다 더 작은, 8은 5보다 더 큰",note:"칸 수 비교: 5<8. 5는 작은 쪽, 8은 큰 쪽."},suggested_extras:["m_word_separation"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"가장 큰 수·가장 작은 수",question:"**2 · 6 · 4 · 9 · 1** 중에서\n가장 **큰** 수는?\n가장 **작은** 수는?",answer:"가장 큰 수 9, 가장 작은 수 1",note:"칸 수를 견주면 9가 최다, 1이 최소."},suggested_extras:[]},
  {id:"s12",stage:"기본문제",block:"card_arrange",data:{title:"작은 수부터 큰 수로 줄 세우기",instruction:"카드를 드래그해서 **작은 수부터 큰 수** 순서로 놓아 보세요",cards:[6,2,8,4,0],target:[0,2,4,6,8]},suggested_extras:["e_order_compare"]},

  // ===== 응용 (3) =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"형제 나이 비교",scenario:{icon:"👦👧",body:"형은 **8살**, 동생은 **6살**.\n수로 보면 8이 6보다 더 **커요**.\n나이로 말하면 형이 동생보다 **많아요**.\n같은 사실, 두 가지 표현!"}},suggested_extras:["r_family_age","x_amount_vs_number"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"강당에서 색판 뒤집기",tag:"교실 또는 강당에서",icon:"🟥🟦",body:"빨강·파랑 색판을 바닥에 두 줄로 놓아요.\n빨강 6장, 파랑 4장.\n학생들이 한 사람씩 짝을 지어 들면\n빨강이 **두 개 남아요** — 빨강이 더 많아요!",materials:"색판 두 색 (각 9장씩)"},suggested_extras:["a_floor_compare","m_safety_compare"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"카드 뒤집기 놀이",steps:["짝과 함께 1~9 수 카드(꾸러미 4) 한 더미씩 가지기","동시에 한 장씩 뒤집어 보여 주기","더 **큰 수**를 낸 사람이 두 장 모두 가지기","같은 수면 자기 것만 가져가기","카드가 더 많은 사람이 승!"]},suggested_extras:["g_card_war","m_fair_play"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["두 수를 **하나씩 짝지어** 비교할 수 있어요","십 배열판으로 비교하면 **한눈**에 보여요","수는 **크다·작다** / 물건은 **많다·적다**","같은 일을 **두 가지 말**로 할 수 있어요"]},suggested_extras:["b_compare_book"]},
  {id:"s17",stage:"정리",block:"basic_problem",data:{title:"마지막 확인",question:"**4**와 **7**을 비교해 봐요.\n어느 쪽이 더 크나요?\n어느 쪽이 더 작나요?\n두 가지 모두 말할 수 있나요?",answer:"7이 더 크고, 4가 더 작아요",note:"4<7. 한 비교를 양방향으로 말하기."},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"같은 수끼리 **분류**해 봐요!\n흩어진 수 카드를 어떻게 정리할까요?",emoji:""},suggested_extras:["e_classify_preview"]}
    ],
    extras: [
  {id:"v_compare_song",type:"video",icon:"🎥",title:"크다 작다 노래",url:"https://www.youtube.com/results?search_query=크다+작다+동요+수+비교",description:"크기 비교를 노래로 익히는 동요. 도입 자리에 흥미 유발. 일상 사물과 수 비교를 자연스럽게 연결.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_team_score",type:"real_world",icon:"🌍",title:"운동 경기 점수",content:"축구·농구 경기에서 두 팀의 점수를 비교해요. 6:4 → 6이 4보다 더 큰 수 → 첫 팀이 이겼어요. 점수 비교는 매일 일어나요.",fit_slides:["cover","real_world"]},
  {id:"m_recall_zero_nine",type:"tip",icon:"🧩",title:"0~9 수의 줄 회상",content:"도입 자리에서 0부터 9까지를 한 번 함께 외친 다음 비교 학습에 진입. 0이 가장 작은 수임을 자연스럽게 인식시킬 수 있음.",fit_slides:["review"]},
  {id:"r_pe_game",type:"real_world",icon:"🌍",title:"체육 시간 모둠 시합",content:"고리 던지기·콩주머니 던지기 같은 모둠 시합은 자연스럽게 수 비교를 부르는 활동. 결과 정리할 때 학생들이 직접 비교해 보게 하세요.",fit_slides:["motivate"]},
  {id:"q_fun_winner",type:"fun_question",icon:"💡",title:"누가 더 잘했을까",content:"모둠 1은 고리 3개, 모둠 3은 5개. 어느 모둠이 더 잘했다고 말할 수 있을까요? 어떻게 알았어요? 짝꿍과 이야기해 봐요.",fit_slides:["motivate"]},
  {id:"m_one_to_one",type:"tip",icon:"🧩",title:"일대일대응이 비교의 기초",content:"두 묶음에서 하나씩 짝을 지어 남는 쪽이 있는지 보는 것은 모든 크기 비교의 기초. 큰 수의 비교·뺄셈으로도 자연스럽게 확장.",fit_slides:["concept","basic_problem"]},
  {id:"x_more_vs_bigger",type:"misconception",icon:"❓",title:"오개념: 모양이 크면 수도 크다",content:"학생이 '큰 사과 3개'와 '작은 사과 5개'를 비교할 때 큰 사과 쪽을 '더 큰 수'라고 답할 수 있어요. **물건 크기와 수의 크기는 다름**.",fit_slides:["concept","misconception"]},
  {id:"m_ten_frame_compare",type:"tip",icon:"🧩",title:"십 배열판 양쪽 두기",content:"십 배열판 두 개를 나란히 놓고 양쪽 채움을 동시에 보여 주면 비교가 한눈에. 학생이 직접 보면 '크다·작다'를 말할 단어가 생겨요.",fit_slides:["compare"]},
  {id:"m_bidirection",type:"tip",icon:"🧩",title:"양방향 표현 함께",content:"'6은 4보다 크다'만 말하지 말고 '4는 6보다 작다'도 함께 말해야 학생이 가역 표현을 자연스럽게 익혀요.",fit_slides:["concept","basic_problem"]},
  {id:"x_only_one_way",type:"misconception",icon:"❓",title:"오개념: 한쪽만 말하기",content:"많은 학생이 '큰 쪽'만 말하고 '작은 쪽'을 말하지 않음. 한 활동에서 두 표현을 모두 요구하는 것을 습관으로.",fit_slides:["concept"]},
  {id:"x_amount_vs_number",type:"misconception",icon:"❓",title:"오개념: '많다'와 '크다' 혼용",content:"가장 흔한 오개념. 사탕은 '많다·적다'(양 표현), 수는 '크다·작다'(수 표현). 처음부터 단어를 구분해 사용하면 후속 단원이 편해요.",fit_slides:["misconception","real_world"]},
  {id:"m_word_separation",type:"tip",icon:"🧩",title:"단어 구분 정착",content:"칠판에 '많다·적다 / 크다·작다' 두 줄을 적어 두고 매 비교 활동에서 어느 표현을 쓰는지 짚어 보세요. 한 달이면 자동으로 분리.",fit_slides:["misconception","basic_problem"]},
  {id:"m_zero_smallest",type:"tip",icon:"🧩",title:"0이 가장 작은 수",content:"0이 1보다도 작은 수임을 명시. '아무것도 없음 < 한 개'. 학생이 0의 위치를 수의 줄 맨 앞에 놓을 수 있어야 해요.",fit_slides:["visual_demo"]},
  {id:"r_family_age",type:"real_world",icon:"🌍",title:"가족 나이 비교",content:"형은 8살·동생은 6살. 수로는 8이 6보다 크고, 나이로는 형이 더 많음. 일상 표현(많다)과 수 표현(크다)을 같은 사실로 연결.",fit_slides:["real_world"]},
  {id:"a_floor_compare",type:"other_activity",icon:"📚",title:"다른 활동 — 책상 위 색판 비교",content:"강당이 어렵다면 책상 위에 작은 색종이 두 색으로 같은 활동 가능. 6장·4장을 짝지어 남는 색을 찾기.",fit_slides:["offline_activity"]},
  {id:"m_safety_compare",type:"tip",icon:"🧩",title:"색판 활동 안전",content:"학생이 색판을 던지지 않도록 안내. 한 사람씩 차례대로 들어 비교하기. 부딪힘 방지를 위해 짝 단위로 좁은 간격에서 진행.",fit_slides:["offline_activity"]},
  {id:"g_card_war",type:"game",icon:"🎮",title:"카드 뒤집기 놀이",content:"짝과 동시에 카드 한 장씩 뒤집어 큰 수가 두 장 모두 가져가기. 같은 수면 자기 것만. 단순하지만 학생들이 매우 즐기는 비교 놀이.",fit_slides:["game"]},
  {id:"m_fair_play",type:"tip",icon:"🧩",title:"같은 수일 때 규칙",content:"같은 수가 나왔을 때 '자기 것만 가져가기'로 정하면 다툼 없이 빠르게 진행. 이기는 것이 목적이 아니라 비교가 목적임을 짚어 주세요.",fit_slides:["game"]},
  {id:"b_compare_book",type:"book",icon:"📖",title:"『더 큰 쪽이 어디일까?』",content:"두 묶음을 일대일대응으로 짝지어 더 많은 쪽을 찾는 내용의 그림책. 1단원 마무리 자리에 읽어 주면 자연스러운 정리.",source:"여러 작가 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"e_order_compare",type:"extension",icon:"⬆",title:"비교는 줄 세우기",content:"두 수 비교를 여러 번 하면 자연스럽게 작은 수부터 큰 수로 줄 세울 수 있어요. 7차시 수의 순서 학습과 연결.",fit_slides:["basic_problem","summary"]},
  {id:"e_classify_preview",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"오늘은 두 수를 비교했어요. 다음 시간에는 흩어진 카드를 같은 수끼리 모으는 **분류**를 해 봐요.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 11차시: 수학이랑 확인해요 (단원 평가) ───────────
  // 평가 차시. 6문항 + 자기 평가 3문항. 1~10차시 누적 정리.
  // 5단계 18슬 골격 유지하되 '평가 흐름'으로 가공 (문항별 풀이 안내 + 자기 평가).
  LESSONS["u1_l11"] = {
    meta: {
      title: "1학년 수학 1단원 11차시",
      subtitle: "수학이랑 확인해요 (단원 평가)",
      std: "[2수01-01] · [2수01-03]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"수학이랑\n확인해요\n1단원 평가 시간",emoji:""},suggested_extras:["m_assessment_tone","r_eval_meaning"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"1단원에서 배운 것",content:"**1~9 수 세기·읽기·쓰기**\n**순서수** (첫째·둘째…)\n**수의 순서**\n**±1** / **0** / **크기 비교**\n오늘은 한 번 확인해 봐요"},suggested_extras:["m_recall_unit","v_count_song_kor"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"야채 농장에 와 봤어요",kids:[{face:"🐰",label:"토끼"},{face:"🐦",label:"새"}],question:"농장 친구들이 수를 세려고 해요\n우리도 함께 풀어 볼까요?"},suggested_extras:["r_farm","q_fun_farm"]},

  // ===== 전개 (5) — 평가 문항 풀이 가이드 =====
  {id:"s04",stage:"전개",block:"basic_problem",data:{title:"문항 1 — 세어 쓰기",question:"배추·당근·무를 세어 수로 적어 보세요.\n**배추 4 · 당근 9 · 무 7**\n([2수01-01] 수 세기·쓰기)",answer:"배추 4, 당근 9, 무 7",note:"하나씩 짚어 세고 수로 적기."},suggested_extras:["m_count_check","x_zero_confusion"]},
  {id:"s05",stage:"전개",block:"basic_problem",data:{title:"문항 2 — 0이 등장",question:"당근 바구니가 점점 비어 가요.\n**3 → 2 → 1 → ?**\n마지막 칸에 어떻게 적을까요?\n([2수01-01] 0 표기)",answer:"0 (숫자 0으로 적어요)",note:"1 다음은 0. 빈칸이 아니라 0으로 표기."},suggested_extras:["x_blank_vs_zero","m_zero_recall"]},
  {id:"s06",stage:"전개",block:"basic_problem",data:{title:"문항 3 — 두 수 비교",question:"**3과 6** 중에 어느 쪽이 더 큰 수인가요?\n반대로도 말해 봐요.\n([2수01-03] 크기 비교)",answer:"6이 더 큼 (3은 더 작음)",note:"3<6. 양방향으로 말하기."},suggested_extras:["m_compare_recall","x_amount_vs_number_recall"]},
  {id:"s07",stage:"전개",block:"basic_problem",data:{title:"문항 4 — 수의 순서",question:"빠진 수를 채워 봐요.\n**1 · 2 · ___ · 4 · 5 · ___ · 7 · 8 · 9**\n([2수01-03] 수의 순서)",answer:"첫 빈칸 3, 둘째 빈칸 6",note:"순서대로 1~9. 빠진 수는 3과 6."},suggested_extras:["m_order_recall"]},
  {id:"s08",stage:"전개",block:"basic_problem",data:{title:"문항 5 — 기준 넣은 순서",question:"9명이 한 줄로 섰어요.\n**왼쪽에서 여섯째**는?\n**오른쪽에서 둘째**는?\n([2수01-03] 순서수)",answer:"왼쪽에서 여섯째 = 왼쪽 6번째, 오른쪽에서 둘째 = 왼쪽에서 여덟째(9−2+1=8)",note:"기준 방향에 따라 사람이 달라요. 오른쪽 2째 = 왼쪽 8째."},suggested_extras:["x_third_vs_three_recall","m_direction_check"]},

  // ===== 기본 (4) — 문항 6 + 자기 평가 =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"문항 6 — ±1 (분리배출)",ten_frame_anchor:5,question:"분리배출함에 캔이 **5개** 모였어요.\n**1만큼 더 작은 수**는?\n**1만큼 더 큰 수**는?\n([2수01-03] ±1)",answer:"1만큼 더 작은 수 4, 1만큼 더 큰 수 6",note:"5−1=4, 5+1=6."},suggested_extras:["r_recycle","m_pm1_recall"]},
  {id:"s09b",stage:"전개",block:"misconception",data:{title:"조심해요 — 순서 문제",label:"오개념 주의",wrong:"기준(앞/뒤·왼/오)은 안 봐도 돼",right:"**기준이 바뀌면** 가리키는 사람도 **달라져요**.\n'왼쪽에서'·'오른쪽에서'를 꼭 확인!",hint:"순서 문제는 어느 쪽에서 세는지부터 봐요."},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"question",data:{title:"자기 평가 — 지식·이해",content:"**수를 셀 수 있나요?**\n★ · ★★ · ★★★\n별의 수로 스스로 평가해 봐요"},suggested_extras:["m_self_assess_tone"]},
  {id:"s11",stage:"기본문제",block:"question",data:{title:"자기 평가 — 과정·기능",content:"**어느 수가 더 큰지 말할 수 있나요?**\n★ · ★★ · ★★★\n부족하다고 느낀 부분도 솔직히 표시"},suggested_extras:["m_honest_check"]},
  {id:"s12",stage:"기본문제",block:"question",data:{title:"자기 평가 — 가치·태도",content:"**수를 즐겁게 공부했나요?**\n★ · ★★ · ★★★\n어떤 시간이 가장 즐거웠는지도 떠올려 봐요"},suggested_extras:["q_fun_favorite_time"]},

  // ===== 응용 (3) — 단원 실천 활동 정리 + 색칠표 =====
  {id:"s13",stage:"응용문제",block:"real_world",data:{title:"우리가 한 실천 활동",scenario:{icon:"📋",body:"단원 처음 약속 두세 가지를 골랐어요.\n**준비물 챙기기** · **수 찾아 말하기** · **수 놀이하기**\n그동안 얼마나 지켰는지 떠올려 봐요."}},suggested_extras:["r_promise_review","a_promise_color"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"단원 실천 활동 색칠 칸",tag:"교과서 부록 활용",icon:"🖍️",body:"수학익힘 **p.20** 단원 실천 활동 표를 꺼내요.\n지킨 약속에 **색칠 한 칸**씩 채워요.\n총 몇 칸을 채웠는지 세어 봐요.",materials:"수학익힘 p.20 · 색연필"},suggested_extras:["a_color_book"]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"종합 소감",content:"색칠 칸은 몇 개인가요?\n어떤 약속을 가장 잘 지켰나요?\n다음 단원에는 어떤 약속을 새로 정하고 싶나요?"},suggested_extras:["x_no_compare_friends","m_growth_focus"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 확인한 것",points:["**1~9 수**를 세고 쓸 수 있어요","**0**과 **수의 순서**를 알아요","**두 수를 비교**할 수 있어요","**±1**을 말할 수 있어요","단원 실천 약속을 **돌아봤어요**"]},suggested_extras:["b_unit_end"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 격려",content:"부족했던 부분이 있어도 괜찮아요.\n다음 시간에 한 번 더 만나니까요.\n**오늘 잘한 한 가지**를 떠올려 봐요."},suggested_extras:["m_encourage"]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**수 그림책**을 만들어요!\n생활 속에서 만난 수를\n그림과 글로 표현해 봐요.",emoji:""},suggested_extras:["e_picture_book_preview"]}
    ],
    extras: [
  {id:"m_assessment_tone",type:"tip",icon:"🧩",title:"평가 분위기",content:"학생이 긴장하지 않도록 '시험'이 아니라 '확인'·'복습'이라는 표현 사용. 평가 결과보다 학생의 노력·성장 과정을 더 칭찬해 주세요.",fit_slides:["cover"]},
  {id:"r_eval_meaning",type:"real_world",icon:"🌍",title:"평가가 필요한 이유",content:"평가는 잘했나 못했나가 아니라 '내가 무엇을 알고 있고 무엇을 더 배워야 하는지' 알기 위해 해요. 학생에게 부담을 줄이는 메시지로 시작.",fit_slides:["cover"]},
  {id:"m_recall_unit",type:"tip",icon:"🧩",title:"단원 회상 짧게",content:"단원 회상은 1~2분이면 충분. 학생이 직접 '무엇을 배웠지?' 떠올리도록 잠시 시간을 주는 것이 더 좋아요.",fit_slides:["review"]},
  {id:"v_count_song_kor",type:"video",icon:"🎥",title:"핑크퐁 1-10 숫자송",url:"https://www.youtube.com/watch?v=Qxi-dPmsl-Q",video_id:"Qxi-dPmsl-Q",description:"단원 회상 자리에 자연스럽게 1~9 익히기. 평가 부담 풀어 주는 친숙한 노래.",source:"핑크퐁 (Pinkfong) — 유튜브 공개 영상",fit_slides:["review"]},
  {id:"r_farm",type:"real_world",icon:"🌍",title:"동물 친구의 농장",content:"교과서 평가 자리는 야채 농장(배추·당근·무) 그림으로 시작해요. 토끼·새 등 친근한 동물이 등장해 평가 분위기를 부드럽게.",fit_slides:["motivate"]},
  {id:"q_fun_farm",type:"fun_question",icon:"💡",title:"농장에 또 누가 살까",content:"농장에는 야채 말고도 동물·풀·꽃이 있어요. 우리 마음속 농장에는 무엇이 있나요? 몇 개씩 살까요?",fit_slides:["motivate"]},
  {id:"m_count_check",type:"tip",icon:"🧩",title:"세기 방법 점검",content:"학생이 답을 적기 전에 '한 번 더 세어 봐요'라고 안내. 세기 실수는 평가에서 가장 흔한 오류.",fit_slides:["basic_problem"]},
  {id:"x_zero_confusion",type:"misconception",icon:"❓",title:"오개념: 빈 칸에 0 안 적기",content:"학생이 '하나도 없어요' 자리에 빈 칸을 두려고 함. 0을 분명히 적도록 한 번 더 짚어 주세요.",fit_slides:["basic_problem"]},
  {id:"x_blank_vs_zero",type:"misconception",icon:"❓",title:"오개념: 빈칸 = 0",content:"9차시에서 다룬 가장 흔한 혼동. 평가 자리에서 다시 한 번 확인.",fit_slides:["basic_problem"]},
  {id:"m_zero_recall",type:"tip",icon:"🧩",title:"0 복습",content:"평가 문항 2번을 풀기 전 9차시 학습 내용(0의 의미) 짧게 회상.",fit_slides:["basic_problem"]},
  {id:"m_compare_recall",type:"tip",icon:"🧩",title:"비교 두 가지 표현",content:"학생이 '6이 크다'만 답하면 '3은 6보다 어떻다고?'라고 후속 질문. 양방향 표현 습관 굳히기.",fit_slides:["basic_problem"]},
  {id:"x_amount_vs_number_recall",type:"misconception",icon:"❓",title:"많다·적다 vs 크다·작다",content:"평가 자리에서 학생이 '6은 3보다 많다'고 답할 수 있음. '수의 크기'는 '크다·작다'로 말하기.",fit_slides:["basic_problem"]},
  {id:"m_order_recall",type:"tip",icon:"🧩",title:"수의 순서 회상",content:"빠진 칸을 채우는 문제는 7차시 학습 내용. 학생이 1~9 한 번 외쳐 본 다음 답을 적게 해도 좋아요.",fit_slides:["basic_problem"]},
  {id:"x_third_vs_three_recall",type:"misconception",icon:"❓",title:"'여섯째' vs '여섯 명'",content:"6차시 학습 내용. 평가 자리에서 학생이 '여섯째' 자리에 6명을 다 표시할 수 있음. 한 사람을 가리키는 것임을 한 번 더.",fit_slides:["basic_problem"]},
  {id:"m_direction_check",type:"tip",icon:"🧩",title:"기준 방향 확인",content:"'왼쪽에서 여섯째'와 '오른쪽에서 둘째'가 같은 사람일 수 있음(7명 줄 기준). 학생이 직접 손가락으로 짚어 가며 세도록.",fit_slides:["basic_problem"]},
  {id:"r_recycle",type:"real_world",icon:"🌍",title:"분리배출",content:"학교·집에서 분리배출함에 캔·페트병이 모이는 모습. 매일 한 개씩 늘어나거나 한 개씩 빠지는 ±1의 자연 사례.",fit_slides:["basic_problem"]},
  {id:"m_pm1_recall",type:"tip",icon:"🧩",title:"±1 회상",content:"8차시 학습 내용. 십 배열판으로 한 칸 채우기·비우기 동작을 보여 주면 학생이 빠르게 회상.",fit_slides:["basic_problem"]},
  {id:"m_self_assess_tone",type:"tip",icon:"🧩",title:"자기 평가 분위기",content:"별이 적다고 부끄러워하지 않도록 안내. 솔직한 평가가 다음 학습의 출발점.",fit_slides:["question"]},
  {id:"m_honest_check",type:"tip",icon:"🧩",title:"솔직한 표시",content:"교사가 자기 평가를 보고 평가하지 않음을 분명히. 학생이 솔직하게 표시할 수 있는 분위기 만들기.",fit_slides:["question"]},
  {id:"q_fun_favorite_time",type:"fun_question",icon:"💡",title:"가장 좋았던 수업",content:"1단원에서 어떤 시간이 가장 좋았나요? 친구들과 놀이? 그림 꾸미기? 새로운 수 만나기? 두 가지만 골라 봐요.",fit_slides:["question"]},
  {id:"r_promise_review",type:"real_world",icon:"🌍",title:"단원 실천 약속 회상",content:"1차시에서 정한 단원 약속을 다시 칠판에 적어 두면 학생이 회상하기 쉬워요. 약속별로 손을 들어 보는 활동도 좋아요.",fit_slides:["real_world"]},
  {id:"a_promise_color",type:"other_activity",icon:"📚",title:"다른 활동 — 약속 카드 색칠",content:"색칠 칸 대신 약속 카드 세 장에 각각 별을 그려 자기 평가. 시각적으로 한눈에 보여 학생이 자기 성장 인식.",fit_slides:["real_world","offline_activity"]},
  {id:"a_color_book",type:"other_activity",icon:"📚",title:"다른 활동 — 색칠 칸 자유 디자인",content:"수학익힘 p.20 색칠 칸이 단순해 보이면 학생이 자유롭게 디자인하도록 허용. 색·모양 자유롭게.",fit_slides:["offline_activity"]},
  {id:"x_no_compare_friends",type:"misconception",icon:"❓",title:"오개념: 친구와 비교",content:"학생이 자기 색칠 칸을 친구와 비교하지 않도록 안내. 자기 자신의 어제와 오늘을 비교하는 자세 강조.",fit_slides:["question"]},
  {id:"m_growth_focus",type:"tip",icon:"🧩",title:"성장 초점",content:"색칠 칸이 적어도 1단원 동안 무엇을 배웠는지가 핵심. 색칠 칸은 동기 부여 도구지 평가 결과가 아님.",fit_slides:["question"]},
  {id:"b_unit_end",type:"book",icon:"📖",title:"『숫자야 안녕』 그림책",content:"1~9 수와 친해지는 그림책. 단원 끝나는 자리에 읽으면 자연스럽게 정리. 학교 도서관에서 1단원 관련 책으로 비치된 경우 많음.",source:"여러 작가 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"m_encourage",type:"tip",icon:"🧩",title:"격려 한마디",content:"평가 자리 정리에서 학생 한 명 한 명에게 짧은 격려를. '오늘 너의 ___가 좋았어' 한 줄이 다음 단원 동기가 됨.",fit_slides:["question"]},
  {id:"e_picture_book_preview",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"12차시는 단원 마무리 창작. 생활 속에서 만난 수를 그림과 글로 표현하는 자기 주도 활동. 평가 부담 없이 즐겁게.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 12차시: 수학이랑 만들어요 (수 그림책 만들기) ───────────
  // 단원 마무리 창작 차시. 1~11차시 누적, 평가 X.
  // 5단계 18슬 골격 유지하되 '창작 흐름'으로 가공.
  LESSONS["u1_l12"] = {
    meta: {
      title: "1학년 수학 1단원 12차시",
      subtitle: "수학이랑 만들어요 (수 그림책 만들기)",
      std: "[2수01-01]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"수학이랑\n만들어요\n나만의 수 그림책",emoji:""},suggested_extras:["v_picture_book_intro","r_book_world"]},
  {id:"s02",stage:"도입",block:"review",data:{title:"1단원에서 만난 수",content:"**0 · 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9**\n수를 세고 · 순서를 알고 · 비교했어요\n오늘은 수와 함께\n**그림책**을 만들어 봐요"},suggested_extras:["m_unit_recall"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"생활 속에서 만난 수",kids:[{face:"🎂",label:"생일 케이크\n초 7개"},{face:"🚌",label:"버스 번호\n3번"},{face:"📞",label:"전화번호\n0이 들어가요"}],question:"여러분이 어제 본 수는 무엇이었나요?\n어디서 봤어요?"},suggested_extras:["r_daily_numbers","q_fun_numbers_around","x_no_korean_only"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"수는 여러 가지 쓰임이 있어요",bidirect:["**얼마나 많은가** — 사과 3개","↓","**몇 번째인가** — 첫째 줄","↓","**이름** — 1번 친구·3반","↓","**잰 양** — 키 ___cm"]},suggested_extras:["m_four_uses","r_uses_examples"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"수 그림책 예시 — 1 페이지",ten_frame_solo:{count:1,is_anchor:true,label:"**1**\n하나 · 일\n혼자 사는 사자\n달은 한 개"},sub_text:"숫자 1을 크게 쓰고\n그 옆에 1과 관련된 그림과 글"},suggested_extras:["m_page_format"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"수 그림책 예시 — 3 페이지",ten_frame_solo:{count:3,is_anchor:true,label:"**3**\n셋 · 삼\n삼각형 · 신호등 색깔\n세 마리 곰"},sub_text:"3과 관련된 그림·글을 자유롭게"},suggested_extras:["b_three_bears"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"내 그림책에 담을 것",bidirect:["**숫자** 크게","↓","**그림** — 그 수만큼 또는 그 수와 관련된 사물","↓","**글** — 짧은 문장이나 단어 (선택)"]},suggested_extras:["m_free_format","x_no_perfection"]},
  {id:"s08",stage:"전개",block:"question",data:{title:"어떤 수를 고를까?",content:"0부터 9까지 모두 중에 **2~3개 수**를 골라 봐요.\n나에게 특별한 수도 좋아요.\n어렵게 느끼는 수를 골라도 좋아요."},suggested_extras:["q_fun_my_number","m_choose_two"]},

  // ===== 기본 (4) — 그림책 만들기 진행 =====
  {id:"s09",stage:"기본문제",block:"offline_activity",data:{title:"내 수 정하기 + 종이 받기",tag:"교실에서 함께 해요",icon:"📝",body:"각자 **2~3개 수**를 정하고\n그 수만큼 도화지를 받아요.\n수가 같은 친구와 모둠을 만들어도 좋아요.",materials:"도화지·색연필·사인펜·수 그림책 활동지"},suggested_extras:["m_group_or_alone"]},
  {id:"s10",stage:"기본문제",block:"offline_activity",data:{title:"숫자 쓰기 + 그림 그리기",tag:"개인 작업",icon:"🎨",body:"종이 가운데 또는 한쪽에 **숫자를 크게**.\n나머지 자리에 그 수와 관련된 **그림**.\n사물·동물·도형·사람 자유롭게.",materials:"색연필·사인펜"},suggested_extras:["m_big_number","a_around_number"]},
  {id:"s11",stage:"기본문제",block:"offline_activity",data:{title:"글 적기 (선택)",tag:"쓰고 싶은 친구만",icon:"✏️",body:"그림 옆에 짧은 문장·단어를 적어요.\n예: **'사자 3마리'** · **'우리 가족 4명'**\n글이 어려우면 그림만 그려도 좋아요.",materials:"연필"},suggested_extras:["x_no_korean_only","m_grade1_writing"]},
  {id:"s12",stage:"기본문제",block:"question",data:{title:"짝꿍에게 보여 주기",content:"옆 짝꿍에게 내 그림책을 한 페이지 보여 줘요.\n짝꿍은 칭찬할 곳 한 가지 말해 주기.\n역할 바꿔서 또 해 봐요."},suggested_extras:["m_peer_praise"]},

  // ===== 응용 (3) — 확장 활동 + 전시 =====
  {id:"s13",stage:"응용문제",block:"offline_activity",data:{title:"확장 — 연결 모형 자유 만들기",tag:"선택 활동",icon:"🧊",body:"연결 모형·바둑돌 **9개**를 받아\n자유롭게 모양을 만들어 봐요.\n9라는 같은 수로 다양한 모양이 나와요.\n친구에게 어떤 모양인지 소개해요.",materials:"연결 모형 또는 바둑돌 9개씩"},suggested_extras:["a_shape_variety"]},
  {id:"s14",stage:"응용문제",block:"offline_activity",data:{title:"확장 — 생활 속 수 사진전",tag:"태블릿 활용",icon:"📷",body:"태블릿으로 학교 안을 **5분** 동안 다녀\n수가 보이는 사진 **3장**을 찍어요.\n반에 돌아와 사진을 모아 사진전을 열어요.",materials:"태블릿 (모둠당 1대) · 게시판"},suggested_extras:["a_school_hunt","m_safety_tablet"]},
  {id:"s15",stage:"응용문제",block:"game",data:{title:"수 그림책 전시회",steps:["완성된 그림책을 교실 벽이나 책상 위에 진열","학생들이 자유롭게 돌아다니며 친구 그림책 보기","마음에 든 그림책 한 권 골라 작은 종이 스티커 붙이기","스티커가 많은 그림책 발표 (선택)","모두 박수로 마무리"]},suggested_extras:["g_gallery","m_no_compare"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"1단원을 마무리하며",points:["**0~9 수**와 친해졌어요","수는 **여러 가지 쓰임**이 있어요","수는 **우리 생활** 곳곳에 있어요","나만의 **그림책**을 만들었어요"]},suggested_extras:["b_my_first_book"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"오늘 만든 것을 보며",content:"어떤 수가 가장 마음에 들었나요?\n다음에 또 그림책을 만든다면\n어떤 수를 더 넣고 싶나요?"},suggested_extras:["q_fun_next_book"]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 단원에는",preview:"**여러 가지 모양**을 만나요!\n둥근 모양 · 네모 모양 · 세모 모양\n수에서 모양으로 가요!",emoji:""},suggested_extras:["e_unit2_preview"]}
    ],
    extras: [
  {id:"v_picture_book_intro",type:"video",icon:"🎥",title:"수 그림책 만들기 영상",url:"https://www.youtube.com/results?search_query=수+그림책+만들기+1학년",description:"학생들이 직접 그림책을 만드는 모습. 도입 자리에 흥미 유발. 친구들도 만들 수 있다는 동기.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_book_world",type:"real_world",icon:"🌍",title:"세상에 그림책이 많은 이유",content:"세상에는 그림책이 정말 많아요. 누가 만들었을까요? 사람들이 자기 이야기를 그림과 글로 담으려고 만들었어요. 오늘은 우리도 작가가 돼 봐요.",fit_slides:["cover"]},
  {id:"m_unit_recall",type:"tip",icon:"🧩",title:"단원 회상 자연스럽게",content:"1단원에서 배운 0~9를 학생이 함께 외치도록 하면 분위기 환기. 평가 부담 없이.",fit_slides:["review"]},
  {id:"r_daily_numbers",type:"real_world",icon:"🌍",title:"매일 만나는 수",content:"생일 케이크의 초 · 버스 번호 · 전화번호 · 시계의 시간 · 신발 사이즈 · 학교 학년·반. 수는 매일 매 순간 우리 곁에 있어요.",fit_slides:["motivate","concept"]},
  {id:"q_fun_numbers_around",type:"fun_question",icon:"💡",title:"교실 안 수 찾기",content:"지금 교실 안에서 보이는 수 세 가지를 빠르게 찾아 봐요. 시계 · 칠판의 날짜 · 책상 번호 · 교과서 페이지. 어느새 우리는 수 속에 살고 있어요.",fit_slides:["motivate"]},
  {id:"x_no_korean_only",type:"misconception",icon:"❓",title:"오개념: 글을 잘 써야 한다",content:"1학년 학생은 글쓰기가 아직 익숙하지 않을 수 있어요. 그림만으로도 충분히 표현 가능. 글에 의무를 부여하지 마세요.",fit_slides:["motivate","basic_problem"]},
  {id:"m_four_uses",type:"tip",icon:"🧩",title:"수의 4가지 쓰임",content:"집합수(개수)·순서수(차례)·이름수(번호)·측정수(잰 양). 학생에게 용어로 가르치지 말고 예시로만 보여 주기. 1학년에서는 인식 정도가 목표.",fit_slides:["concept"]},
  {id:"r_uses_examples",type:"real_world",icon:"🌍",title:"쓰임이 다른 4가지 예",content:"개수: 사과 3개. 차례: 첫째 줄. 번호: 1번 교실. 잰 양: 키 120cm. 같은 수라도 의미가 다를 수 있어요.",fit_slides:["concept"]},
  {id:"m_page_format",type:"tip",icon:"🧩",title:"한 페이지 구성 가이드",content:"한 페이지 = 숫자 1개 + 그림 1~3개 + 짧은 글(선택). 너무 많이 그리려고 하지 말고 핵심 한 가지만 표현하도록 안내.",fit_slides:["visual_demo"]},
  {id:"b_three_bears",type:"book",icon:"📖",title:"『골디락스와 곰 세 마리』",content:"수 3과 친해지기 좋은 그림책. 같은 수가 여러 곳에 등장(곰 3마리·의자 3개·죽 3그릇·침대 3개)해 수의 반복적 쓰임을 보여 줌.",source:"전래 동화 — 다수 출판사 한국어판 있음",fit_slides:["visual_demo"]},
  {id:"m_free_format",type:"tip",icon:"🧩",title:"형식 자유롭게",content:"가운데 정렬·왼쪽 정렬·세로·가로 모두 OK. 한 페이지에 한 수만 담으면 형식은 학생 자유. 창의성 살려 주기.",fit_slides:["concept"]},
  {id:"x_no_perfection",type:"misconception",icon:"❓",title:"오개념: 잘 그려야 한다",content:"학생이 그림을 잘 그려야 한다고 부담을 느낄 수 있음. 동그라미 하나·막대기 하나도 그림. 완성도가 아니라 표현이 목적.",fit_slides:["concept","basic_problem"]},
  {id:"q_fun_my_number",type:"fun_question",icon:"💡",title:"나에게 특별한 수",content:"내 나이 · 우리 가족 수 · 내 생일 날짜 · 내가 좋아하는 수. 나만의 특별한 수가 있어요. 그 수로 그림책 한 페이지를 만들어 봐요.",fit_slides:["question"]},
  {id:"m_choose_two",type:"tip",icon:"🧩",title:"2~3개로 제한",content:"한 학생이 0~9 모두 만들려고 하면 40분 안에 끝나지 않아요. 2~3개만 정하기. 더 만들고 싶으면 다음 시간에.",fit_slides:["question"]},
  {id:"m_group_or_alone",type:"tip",icon:"🧩",title:"개인·모둠 선택",content:"혼자 만들고 싶은 학생은 혼자, 모둠으로 만들고 싶은 학생은 같은 수 친구와 모둠. 강요 X.",fit_slides:["offline_activity"]},
  {id:"m_big_number",type:"tip",icon:"🧩",title:"숫자는 크게",content:"종이의 1/3 정도를 차지할 만큼 크게. 멀리서도 보이도록. 학생이 작게 쓰려고 하면 한 번 더 안내.",fit_slides:["offline_activity"]},
  {id:"a_around_number",type:"other_activity",icon:"📚",title:"다른 활동 — 숫자 안에 그림",content:"숫자 모양 자체 안에 그림을 그리는 변형. 예: 8 모양 안에 두 개의 작은 동그라미·얼굴. 창의성 살리기.",fit_slides:["offline_activity"]},
  {id:"m_grade1_writing",type:"tip",icon:"🧩",title:"1학년 글쓰기 수준",content:"1학년은 한글 익히는 중. 한 단어·짧은 구절이면 충분. 글이 어려운 학생은 교사가 받아 적어 줘도 됨.",fit_slides:["offline_activity"]},
  {id:"m_peer_praise",type:"tip",icon:"🧩",title:"짝꿍 칭찬",content:"비교가 아닌 칭찬. '잘했어'보다 '___가 예뻐'·'___가 재미있어' 같은 구체적 칭찬 모델링.",fit_slides:["question"]},
  {id:"a_shape_variety",type:"other_activity",icon:"📚",title:"다른 활동 — 9개 모양 다양화",content:"바둑돌 9개로 줄을 만들고 동그라미를 만들고 사람 모양을 만들어 보기. 같은 수도 다른 모양. 2단원 도형 학습의 연결.",fit_slides:["offline_activity"]},
  {id:"a_school_hunt",type:"other_activity",icon:"📚",title:"다른 활동 — 학교 안 수 사냥",content:"태블릿이 없으면 종이와 연필로. 학교 안을 돌아다니며 본 수를 적어 오기. 도서관 책장 번호 · 화장실 표지 · 운동장 라인.",fit_slides:["offline_activity"]},
  {id:"m_safety_tablet",type:"tip",icon:"🧩",title:"태블릿 활동 안전",content:"학교 밖 출입 금지. 정해진 시간(5분)·정해진 구역(우리 교실 층) 안에서만. 친구 얼굴 사진 안 찍기 약속.",fit_slides:["offline_activity"]},
  {id:"g_gallery",type:"game",icon:"🎮",title:"갤러리 워크",content:"미술관처럼 돌아다니며 친구 작품 감상. 모든 작품에 한 가지씩 좋은 점 찾기. 모두 다른 표현이라는 것 깨닫기.",fit_slides:["game"]},
  {id:"m_no_compare",type:"tip",icon:"🧩",title:"비교 X 인정 O",content:"스티커가 적게 붙은 작품도 모두 박수. 누가 더 잘했는지가 아니라 각자가 자기 표현을 했다는 점을 인정.",fit_slides:["game"]},
  {id:"b_my_first_book",type:"book",icon:"📖",title:"『나는 작가』 그림책",content:"어린이가 자기 책을 만드는 이야기. 그림책 만들기 활동 마무리에 읽어 주면 학생이 작가가 된 자부심 느낌.",source:"여러 작가 버전 — 학교 도서관 비치 확인",fit_slides:["summary"]},
  {id:"q_fun_next_book",type:"fun_question",icon:"💡",title:"다음 그림책 주제",content:"다음에 또 그림책을 만든다면 어떤 주제가 좋을까요? 우리 가족 · 우리 학교 · 좋아하는 동물 · 색깔 이야기. 마음껏 상상해 봐요.",fit_slides:["question"]},
  {id:"e_unit2_preview",type:"extension",icon:"⬆",title:"2단원 미리 보기",content:"2단원은 '여러 가지 모양'. 둥근 것·네모난 것·세모난 것을 찾고 분류해요. 1단원에서 만난 수가 도형의 변·꼭짓점 수로 다시 만나요.",fit_slides:["next_lesson"]}
    ]
  };
})();
