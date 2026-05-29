/* ============================================================================
   1학년 수학 3단원 (덧셈과 뺄셈) 차시 데이터
   - 키 형식: window.LESSONS["u3_l{NN}"]
   - 차시 누적 자리. lessons/g1_math_u3_l*.json 가공하여 LESSONS 객체 누적.
   - 다양한 답 처리: 가르기 문제는 단일 정답 텍스트 X. 합 검증 분기 (학생 자율).
   ============================================================================ */

(function () {
  if (!window.LESSONS) window.LESSONS = {};

  // ─────────── 2차시: 모으기와 가르기를 해 볼까요 (1) ───────────
  // 단원 본 차시 첫 자리. 모으기·가르기 핵심 개념 도입 + 다양한 답 첫 노출.
  // gather_split 단원 핵심 부품. 고리 던지기 놀이는 시각 표만.
  window.LESSONS["u3_l02"] = {
    meta: {
      title: "1학년 수학 3단원 2차시",
      subtitle: "모으기와 가르기를 해 볼까요 (1)",
      std: "[2수01-04]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"3단원 본 차시 시작\n모으기와 가르기 (1)\n🍠 고구마로 알아봐요",emoji:""},suggested_extras:["v_gather_split_song","r_sweet_potato_field"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"고구마를 모아 봐요",kids:[{face:"👨‍🌾",label:"꼬마 농부"},{face:"🤖",label:"로봇"},{face:"🙂",label:"몇 개?"}],question:"꼬마 농부와 로봇이\n고구마를 들고 있어요.\n**모두 몇 개**일까요?"},suggested_extras:["q_count_together","r_harvest_season"]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**모으기** — 두 수를 하나로 합치기\n**가르기** — 한 수를 둘로 나누기\n두 가지는 **서로 연결**돼 있어요"},suggested_extras:["m_two_directions","x_not_one_answer"]},

  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"모으기란?",bidirect:["🍠🍠 (2개)","+","🍠🍠🍠🍠🍠 (5개)","↓","🍠🍠🍠🍠🍠🍠🍠 (7개)","두 수를 **합치면 모으기**"]},suggested_extras:["m_gather_meaning","r_candy_share"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"가르기란?",bidirect:["🍠🍠🍠🍠🍠🍠🍠 (7개)","↓","왼쪽 그릇 🍠🍠 (2개)","오른쪽 그릇 🍠🍠🍠🍠🍠 (5개)","한 수를 **둘로 나누면 가르기**"]},suggested_extras:["m_split_meaning","x_split_order"]},
  {id:"s06",stage:"전개",block:"compare",data:{title:"7을 여러 가지로 가르기",items:[{ten_frame:1,num:1,caption:"1과 6"},{ten_frame:2,num:2,caption:"2와 5"},{ten_frame:3,num:3,caption:"3과 4",is_anchor:true}]},suggested_extras:["m_many_ways","a_concrete_objects"]},
  {id:"s07",stage:"전개",block:"arrow_flow",data:{title:"모으기 ↔ 가르기 — 연결돼 있어요",steps:["2와 5를 **모으면** 7","↓ 같은 사이 ↑","7을 **가르면** 2와 5","서로 **반대 방향**의 움직임"]},suggested_extras:["m_connection","q_other_pairs"]},
  {id:"s08",stage:"전개",block:"visual_demo",data:{title:"수로 나타내기",ten_frame_solo:{count:7,is_anchor:true,label:"**2와 5를 모으면 7이 됩니다**\n**7은 2와 5로 가르기 할 수 있습니다**"},sub_text:"그림 → 말 → 수로 표현이 자라요"},suggested_extras:["m_verbal_first","r_real_examples"]},

  // ===== 기본 (3) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"빈칸을 채워 봐요 — 가르기",question:"**5**는 ▢과 **2**로 가르기\n\n▢에 들어갈 수는?"},suggested_extras:["m_count_back_help","a_use_fingers"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"빈칸을 채워 봐요 — 모으기",question:"**1**과 **4**를 모으면 ▢\n\n▢에 들어갈 수는?"},suggested_extras:["m_count_on_help","a_use_blocks"]},
  {id:"s11",stage:"기본문제",block:"card_arrange",data:{title:"6 가르기 — 카드 짝짓기",steps:["🍓 6개를 둘로 갈라요","1과 5 / 2와 4 / 3과 3","세 가지 모두 맞아요","카드를 짝지어 봐요"]},suggested_extras:["m_six_split_three","a_dot_count"]},

  // ===== 응용 (4) =====
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"점 6개를 둘로 갈라요",question:"⚫⚫⚫⚫⚫⚫\n\n점 6개를 **왼쪽**과 **오른쪽**으로\n나누어 봐요. 답이 **여러 가지** 가능해요."},suggested_extras:["x_multi_answer","a_dot_drag"]},
  {id:"s13",stage:"응용문제",block:"advanced_problem",data:{title:"5가 되는 것을 모두 골라요",question:"**5**가 되도록 가르기 한 것:\n① 0과 5  ② 1과 4  ③ 2와 3\n④ 3과 2  ⑤ 4와 1  ⑥ 2와 2\n\n**모두 골라요** — 답이 여러 개!"},suggested_extras:["m_multi_select","x_count_order_matters"]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"두 색으로 색칠 — 5칸",content:"⬜⬜⬜⬜⬜ 다섯 칸\n**두 색**으로 칠해 봐요.\n빨강 ▢칸 + 파랑 ▢칸 = 5칸\n\n친구와 답이 다를 수 있어요!"},suggested_extras:["a_color_split","r_workbook_problem"]},
  {id:"s15",stage:"응용문제",block:"real_world",data:{title:"고리 던지기 — 표 보기",scenario:{icon:"🎯",body:"**1회** — 걸린 1개 + 안 걸린 5개 = ▢\n**2회** — 걸린 2개 + 안 걸린 4개 = ▢\n**3회** — 걸린 3개 + 안 걸린 3개 = ▢\n\n모두 **6개**의 고리예요"}},suggested_extras:["g_ring_toss_play","a_class_play"]},

  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["**모으기** — 두 수를 합치면 한 수가 돼요","**가르기** — 한 수를 두 수로 나눌 수 있어요","가르기는 **여러 가지 답**이 가능해요","모으기와 가르기는 **서로 반대** 방향"]},suggested_extras:["b_split_gather_book","e_unit_overview"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"두 수를 모을 수 있나요?\n한 수를 두 수로 가를 수 있나요?\n가르기는 **여러 답**이 가능한 것을 알았나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**연결 모형**으로 9까지의 수를\n모으기·가르기 해 봐요!\n수가 커져도 같은 방법.",emoji:""},suggested_extras:["e_next_lesson_preview"]}
    ],
    extras: [
  {id:"v_gather_split_song",type:"video",icon:"🎥",title:"모으기·가르기 동요",url:"https://www.youtube.com/results?search_query=모으기+가르기+동요+초등+1학년",description:"수를 합치고 나누는 활동을 노래로 익히는 동요. 도입 분위기 형성에 좋아요.",source:"유튜브 다수 공개 영상 — 교사 선택",fit_slides:["cover","motivate"]},
  {id:"r_sweet_potato_field",type:"real_world",icon:"🌍",title:"고구마밭",content:"가을 고구마 캐기는 학생이 한 번쯤 경험하는 활동. 캔 고구마를 모으고 가족과 나누어 가져가는 모습이 자연스러운 모으기·가르기 사례.",fit_slides:["cover","motivate"]},
  {id:"q_count_together",type:"fun_question",icon:"💡",title:"함께 세어 봐요",content:"꼬마 농부 손에 2개, 로봇 손에 5개. 둘이 합치면 몇 개? 손가락으로 한 번 세어 봐요.",fit_slides:["motivate"]},
  {id:"r_harvest_season",type:"real_world",icon:"🌍",title:"수확의 계절",content:"가을이 되면 농부들은 곡식과 채소를 거두어요. 따로따로 자란 작물을 한곳에 모으는 일 — 자연스러운 모으기 사례.",fit_slides:["motivate"]},
  {id:"m_two_directions",type:"tip",icon:"🧩",title:"두 방향",content:"모으기와 가르기는 같은 일의 두 방향. 학생이 모으기를 익히면 가르기는 자연스럽게 따라와요. 한 번에 한 방향씩 차분히.",fit_slides:["objective","arrow_flow"]},
  {id:"x_not_one_answer",type:"misconception",icon:"❓",title:"오개념: 답이 하나",content:"학생이 가르기에서 '답이 하나'라고 오인하기 쉬워요. 7을 가르는 방법은 0·7 / 1·6 / 2·5 / 3·4 / 4·3 / 5·2 / 6·1 / 7·0 모두 가능. 여러 가지가 다 정답.",fit_slides:["objective","advanced_problem"]},
  {id:"m_gather_meaning",type:"tip",icon:"🧩",title:"모으기 = 합치기",content:"'모으기'라는 말이 어려우면 '합치기'·'한곳에 모으기'로 풀어서 설명. 학생 머릿속에 개념이 형성될 때까지 일상말 같이 써 주세요.",fit_slides:["concept"]},
  {id:"r_candy_share",type:"real_world",icon:"🌍",title:"사탕 합치기",content:"내가 사탕 3개, 친구가 사탕 2개를 가지고 있어요. 둘이 사탕을 한곳에 모으면 5개. 일상에서 자주 만나는 상황.",fit_slides:["concept"]},
  {id:"m_split_meaning",type:"tip",icon:"🧩",title:"가르기 = 나누기",content:"'가르기'라는 말도 어려우면 '나누기'로 풀어서. 단 '나누기 ÷' 연산과 헷갈리지 않게 1학년에선 '둘로 나누어 보기' 정도로.",fit_slides:["concept"]},
  {id:"x_split_order",type:"misconception",icon:"❓",title:"오개념: 순서가 다르면 다른 답?",content:"'2와 5'와 '5와 2'를 같은 답으로 볼지 다른 답으로 볼지는 학생이 헷갈리는 부분. 1학년에선 둘 다 인정해 주세요 — 다 맞아요.",fit_slides:["concept","advanced_problem"]},
  {id:"m_many_ways",type:"tip",icon:"🧩",title:"여러 답 인정",content:"한 수의 가르기는 답이 여러 개. 어떤 방법으로 갈라도 합이 맞으면 다 정답. 학생이 자기 답을 자신 있게 말할 수 있게 분위기 만들어 주세요.",fit_slides:["compare","advanced_problem"]},
  {id:"a_concrete_objects",type:"other_activity",icon:"📚",title:"다른 활동 — 구체물 사용",content:"바둑돌·쌓기나무·연결 모형을 책상 위에 놓고 직접 옮겨 가르기. 화면으로 보는 것보다 손으로 만지는 경험이 학생에게 깊이 남아요.",fit_slides:["compare","basic_problem"]},
  {id:"m_connection",type:"tip",icon:"🧩",title:"연결성 강조",content:"3과 4를 모으면 7 = 7을 3과 4로 가르기. 같은 관계를 두 방향으로 보는 것임을 반복 강조. 단원 전체 흐름의 토대.",fit_slides:["arrow_flow"]},
  {id:"q_other_pairs",type:"fun_question",icon:"💡",title:"다른 수도",content:"7 말고 다른 수도 마찬가지. 5는 어떤 두 수로 가를 수 있을까요? 0·5, 1·4, 2·3, 3·2, 4·1, 5·0 — 모두 5!",fit_slides:["arrow_flow"]},
  {id:"m_verbal_first",type:"tip",icon:"🧩",title:"말로 먼저",content:"수로 나타내기 전에 말로 충분히 표현해 보기. '2와 5를 모으면 7이 됩니다' 표현을 입으로 여러 번 말해 본 다음 식으로 넘어가요.",fit_slides:["visual_demo"]},
  {id:"r_real_examples",type:"real_world",icon:"🌍",title:"교실에서 찾기",content:"내 책상 위 연필 3자루 + 친구 책상 위 연필 2자루 = 5자루. 매일 만나는 상황이 모두 모으기·가르기.",fit_slides:["visual_demo"]},
  {id:"m_count_back_help",type:"tip",icon:"🧩",title:"가르기 도움",content:"'5는 ▢과 2'를 풀 때 학생이 어려워하면 손가락 5개 펴고 2개 접기. 남은 것 = 답. 직관적 방법.",fit_slides:["basic_problem"]},
  {id:"a_use_fingers",type:"other_activity",icon:"📚",title:"다른 활동 — 손가락 활용",content:"손가락은 1학년에 가장 친한 도구. 가르기·모으기에 손가락 적극 활용. 학생이 자기 손가락에 자신감 가져요.",fit_slides:["basic_problem"]},
  {id:"m_count_on_help",type:"tip",icon:"🧩",title:"모으기 도움",content:"'1과 4 모으면 ▢'는 1에서 시작해서 4 더 세기 (2·3·4·5). 이어 세기 방법. 06-07차에 정식 도입할 내용이지만 미리 자연스럽게 노출해도 좋아요.",fit_slides:["basic_problem"]},
  {id:"a_use_blocks",type:"other_activity",icon:"📚",title:"다른 활동 — 연결 모형",content:"연결 모형 1개 + 4개를 직접 연결해 5개 줄 만들기. 분리해 보고 다시 합쳐 보는 경험이 모으기·가르기 그 자체.",fit_slides:["basic_problem"]},
  {id:"m_six_split_three",type:"tip",icon:"🧩",title:"6 가르기 핵심 세 가지",content:"6 가르기는 (1·5) (2·4) (3·3) 세 가지가 핵심. 학생이 세 가지를 모두 발견하면 칭찬. 순서 바꾼 것 (5·1, 4·2)도 정답.",fit_slides:["card_arrange"]},
  {id:"a_dot_count",type:"other_activity",icon:"📚",title:"다른 활동 — 점 그리기",content:"공책에 점 6개를 그린 다음 가로선 한 개 그어 가르기. 선 위치에 따라 답이 달라지는 것을 학생이 직접 발견.",fit_slides:["card_arrange","advanced_problem"]},
  {id:"x_multi_answer",type:"misconception",icon:"❓",title:"여러 답 핵심",content:"이 차시의 가장 큰 메시지: 가르기는 답이 여러 개. 친구와 답이 달라도 둘 다 맞을 수 있어요. 1학년에 자연스럽게 익히기 좋은 개념.",fit_slides:["advanced_problem"]},
  {id:"a_dot_drag",type:"other_activity",icon:"📚",title:"다른 활동 — 점 드래그",content:"점을 학생이 디지털로 드래그해서 둘로 나누어 보는 활동. 종이 대신 화면에서도 가능한 방법.",fit_slides:["advanced_problem"]},
  {id:"m_multi_select",type:"tip",icon:"🧩",title:"다중 선택 안내",content:"여러 가지를 골라야 하는 문제는 학생이 처음엔 어색할 수 있어요. '맞는 것은 다 골라요'를 분명히 알려 주세요.",fit_slides:["advanced_problem"]},
  {id:"x_count_order_matters",type:"misconception",icon:"❓",title:"오개념: 순서가 다른 답",content:"학생이 '1과 4'와 '4와 1'을 다른 답으로 보고 한 개만 정답이라고 오인할 수 있어요. 1학년에선 둘 다 정답 — 순서 바꿈은 같은 모으기·가르기.",fit_slides:["advanced_problem"]},
  {id:"a_color_split",type:"other_activity",icon:"📚",title:"다른 활동 — 색칠",content:"수학익힘 활동. 5칸을 두 색으로 칠하면 자기만의 답. 친구 답을 둘러보고 자기 답과 비교하는 시간.",fit_slides:["question"]},
  {id:"r_workbook_problem",type:"real_world",icon:"🌍",title:"수학익힘",content:"수학익힘 32~33쪽. 색칠 + 빈칸 문제. 교실 수업에서 한 부분, 가정에서 한 부분 풀어보기 좋아요.",fit_slides:["question"]},
  {id:"g_ring_toss_play",type:"game",icon:"🎮",title:"고리 던지기",content:"실제 고리 던지기 도구로 교실에서 직접 활동. 고리 5~9개, 던지는 위치·고리 걸이 거리를 학년 수준에 맞추기. 안전 살펴 주세요.",fit_slides:["real_world"]},
  {id:"a_class_play",type:"other_activity",icon:"📚",title:"다른 활동 — 모둠 놀이",content:"4~5명 모둠으로 고리 던지기. 결과를 표에 적고 모으기 결과 직접 확인. 협력 활동.",fit_slides:["real_world"]},
  {id:"b_split_gather_book",type:"book",icon:"📖",title:"『숫자 가족』·『하나둘셋』",content:"수와 가르기·모으기를 그림으로 보여 주는 그림책. 1학년에 자연스러운 입문. 학교 도서관에서 찾아보세요.",source:"여러 그림책 — 교사 선택",fit_slides:["summary"]},
  {id:"e_unit_overview",type:"extension",icon:"⬆",title:"단원 전체 흐름",content:"3단원은 모으기·가르기에서 시작해서 덧셈·뺄셈으로 자연스럽게 이어져요. 오늘 수업이 단원 토대.",fit_slides:["summary"]},
  {id:"e_next_lesson_preview",type:"extension",icon:"⬆",title:"다음 시간 미리 보기",content:"03차에는 연결 모형으로 9까지의 수를 모으기·가르기. 수가 커져도 방법은 같아요 — 두 수를 합치고 한 수를 나누기.",fit_slides:["next_lesson"]}
    ]
  };

  // ─────────── 3차시: 모으기와 가르기를 해 볼까요 (2) ───────────
  // 02차 그림 도입 다음. 구체물(연결 모형) 심화 + 9까지 확장 + 0 포함 도입.
  // linking_cube 부품 첫 등장 (1단원 04-05차 재사용 패턴).
  // 친구 문제 주고받기 대체 = 자동 생성 문제. 카드 게임 변형 = 카드 시각만.
  window.LESSONS["u3_l03"] = {
  "meta": {
    "title": "모으기와 가르기를 해 볼까요 (2)",
    "subtitle": "연결 모형으로 9까지 모으기·가르기 해 봐요",
    "std": "[2수01-04]",
    "duration": "40분"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "도입",
      "block": "cover",
      "suggested_extras": [
        "b_split_gather_book",
        "e_unit_overview"
      ],
      "data": {
        "title": "모으기와 가르기를 해 볼까요 (2)",
        "subtitle": "연결 모형으로 9까지 모으기·가르기 해 봐요"
      }
    },
    {
      "id": "s02",
      "stage": "도입",
      "block": "motivate",
      "suggested_extras": [
        "q_curiosity_chicken",
        "r_farm_count"
      ],
      "data": {
        "scene_title": "닭은 모두 몇 마리일까요?",
        "question": "닭장 안에 4마리, 닭장 밖에 2마리가 있어요. 닭은 모두 몇 마리인지 어떻게 알 수 있을까요?",
        "visual": "🏚 🐔🐔🐔🐔 | 🐔🐔"
      }
    },
    {
      "id": "s03",
      "stage": "도입",
      "block": "objective",
      "suggested_extras": [],
      "data": {
        "title": "오늘 배울 점",
        "bullets": [
          "연결 모형으로 수를 모으기·가르기 할 수 있어요",
          "9까지의 수를 다양하게 모으기·가르기 할 수 있어요",
          "0과 어떤 수를 모으기·가르기 할 수 있어요"
        ]
      }
    },
    {
      "id": "s04",
      "stage": "전개",
      "block": "concept",
      "suggested_extras": [
        "t_cube_intro",
        "q_why_cube"
      ],
      "data": {
        "title": "닭 ↔ 연결 모형 일대일 대응",
        "visual": "🐔🐔🐔🐔🐔🐔\n🟦🟦🟦🟦🟦🟦",
        "content": "닭 한 마리에 연결 모형 한 개. 닭 6마리에 연결 모형 6개. 구체물로 바꿔서 더 자세히 살펴봐요."
      }
    },
    {
      "id": "s05",
      "stage": "전개",
      "block": "visual_demo",
      "suggested_extras": [
        "m_cube_part_whole"
      ],
      "data": {
        "title": "연결 모형 모으기",
        "body": "닭장 안 큐브 4개와 닭장 밖 큐브 2개를 모으면 모두 몇 개? 큐브를 합쳐 보아요.",
        "demo_type": "linking_cube_merge",
        "params": {
          "left": 4,
          "right": 2,
          "total": 6
        }
      }
    },
    {
      "id": "s06",
      "stage": "전개",
      "block": "compare",
      "suggested_extras": [
        "m_split_multi",
        "q_egg_split"
      ],
      "data": {
        "title": "연결 모형 가르기",
        "body": "달걀 4개를 두 자리에 가르기 해 봐요. 가르는 방법은 한 가지가 아니에요.",
        "demo_type": "gather_split",
        "params": {
          "total": 4,
          "examples": [
            [
              0,
              4
            ],
            [
              1,
              3
            ],
            [
              2,
              2
            ],
            [
              3,
              1
            ],
            [
              4,
              0
            ]
          ]
        }
      }
    },
    {
      "id": "s07",
      "stage": "전개",
      "block": "arrow_flow",
      "suggested_extras": [
        "g_nine_pairs",
        "t_pattern"
      ],
      "data": {
        "title": "9까지 양방향",
        "body": "9는 여러 방법으로 모으기·가르기 할 수 있어요. 4와 5, 3과 6, 2와 7 — 모두 9가 돼요.",
        "pairs": [
          {
            "left": "4와 5",
            "right": "9"
          },
          {
            "left": "3과 6",
            "right": "9"
          },
          {
            "left": "2와 7",
            "right": "9"
          }
        ],
        "labels": {
          "forward": "모으면",
          "backward": "가르면"
        }
      }
    },
    {
      "id": "s08",
      "stage": "전개",
      "block": "question",
      "suggested_extras": [
        "q_nine_other"
      ],
      "data": {
        "title": "생각해 봐요",
        "question": "9를 가르는 다른 방법이 또 있을까요? 친구에게 한 가지를 말해 보세요."
      }
    },
    {
      "id": "s09",
      "stage": "기본문제",
      "block": "basic_problem",
      "suggested_extras": [
        "m_blank_help",
        "t_count_back"
      ],
      "data": {
        "title": "가르기 빈칸",
        "question": "8은 ▢과 3으로 가르기",
        "answer": 5,
        "input": "number_pad",
        "range": [
          0,
          9
        ]
      }
    },
    {
      "id": "s10",
      "stage": "기본문제",
      "block": "basic_problem",
      "suggested_extras": [
        "t_count_on"
      ],
      "data": {
        "title": "모으기 빈칸",
        "question": "4와 5를 모으면 ▢",
        "answer": 9,
        "input": "number_pad",
        "range": [
          0,
          9
        ]
      }
    },
    {
      "id": "s11",
      "stage": "기본문제",
      "block": "card_arrange",
      "suggested_extras": [
        "g_card_match"
      ],
      "data": {
        "title": "두 수를 모으면 7",
        "body": "카드를 끌어다 짝을 지어요. 두 수를 모으면 7이 되는 짝.",
        "total": 7,
        "pairs": [
          [
            1,
            6
          ],
          [
            2,
            5
          ],
          [
            3,
            4
          ]
        ]
      }
    },
    {
      "id": "s12",
      "stage": "응용문제",
      "block": "basic_problem",
      "suggested_extras": [
        "m_multi_answer",
        "t_check_all"
      ],
      "data": {
        "title": "9 묶기",
        "question": "두 수를 모으면 9가 되는 묶음을 모두 골라요",
        "choices": [
          "1+8",
          "2+7",
          "3+6",
          "4+5",
          "1+7",
          "2+6",
          "5+5"
        ],
        "answer_indices": [
          0,
          1,
          2,
          3
        ],
        "selection": "multi"
      }
    },
    {
      "id": "s13",
      "stage": "응용문제",
      "block": "advanced_problem",
      "suggested_extras": [
        "t_subtraction_hint"
      ],
      "data": {
        "title": "빠진 수 찾기",
        "question": "▢와 5를 모으면 8",
        "answer": 3,
        "input": "number_pad",
        "range": [
          0,
          9
        ]
      }
    },
    {
      "id": "s14",
      "stage": "응용문제",
      "block": "advanced_problem",
      "suggested_extras": [
        "q_zero_meaning",
        "e_zero_preview"
      ],
      "data": {
        "title": "0 포함 모으기·가르기",
        "question": "0과 7을 모으면 ▢ / 7은 0과 ▢",
        "answers": [
          7,
          7
        ],
        "input": "number_pad",
        "range": [
          0,
          9
        ]
      }
    },
    {
      "id": "s15",
      "stage": "응용문제",
      "block": "real_world",
      "suggested_extras": [
        "g_make_what",
        "a_class_card_game"
      ],
      "data": {
        "title": "카드 게임 — 모아서 몇?",
        "body": "카드 3장(3·2·1)을 모두 모으기 한 결과는 몇일까요?",
        "cards": [
          3,
          2,
          1
        ],
        "answer": 6
      }
    },
    {
      "id": "s16",
      "stage": "정리",
      "block": "summary",
      "suggested_extras": [
        "b_split_gather_book",
        "e_next_lesson_preview"
      ],
      "data": {
        "title": "오늘 배운 점",
        "points": [
          "9까지의 수를 다양하게 모으기·가르기 할 수 있어요",
          "구체물로 직접 해 보면 더 잘 이해돼요",
          "한 수의 가르기는 여러 방법이 있어요",
          "0과 어떤 수를 모으면 그 수 그대로예요"
        ]
      }
    },
    {
      "id": "s17",
      "stage": "정리",
      "block": "question",
      "suggested_extras": [],
      "data": {
        "title": "자기 점검",
        "question": "오늘 배운 것을 스스로 점검해 봐요",
        "items": [
          "연결 모형으로 모으기와 가르기를 할 수 있나요?",
          "9까지의 수를 다양하게 모으기·가르기 할 수 있나요?",
          "0과 어떤 수를 모으기 할 수 있나요?"
        ]
      }
    },
    {
      "id": "s18",
      "stage": "정리",
      "block": "next_lesson",
      "suggested_extras": [
        "e_next_lesson_preview"
      ],
      "data": {
        "title": "다음 시간",
        "body": "다음 시간에는 모으기와 가르기로 덧셈·뺄셈 이야기를 만들어 봐요.",
        "preview": "04차 — 이야기를 만들어 볼까요"
      }
    }
  ],
  "extras": [
    {
      "id": "a_class_card_game",
      "type": "other_activity",
      "icon": "📚",
      "title": "모아서 몇 만들기 — 모둠 카드 게임",
      "content": "2~4명 모둠. 수 카드 9장을 뒤집어 놓고 한 장씩 뒤집어 모으기 결과가 정해진 수가 되면 종을 쳐요. 가장 많이 모은 사람이 이겨요. 종 대신 손뼉도 OK.",
      "fit_slides": [
        "real_world"
      ]
    },
    {
      "id": "q_curiosity_chicken",
      "type": "fun_question",
      "icon": "💡",
      "title": "닭장 발문",
      "content": "닭들은 왜 닭장에서 나왔을까요? 우리 학생들도 이렇게 둘로 나뉘어 본 적 있나요?",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "q_why_cube",
      "type": "fun_question",
      "icon": "💡",
      "title": "왜 연결 모형?",
      "content": "닭은 움직이지만 큐브는 가만히 있어요. 그래서 큐브로 바꾸면 세고 합치기가 쉬워요. 학생들에게 묻기 — '왜 큐브로 바꿔서 볼까요?'",
      "fit_slides": [
        "concept"
      ]
    },
    {
      "id": "q_egg_split",
      "type": "fun_question",
      "icon": "💡",
      "title": "달걀 가르기",
      "content": "달걀 4개를 두 둥지에 나눠 담아요. 어떤 둥지에 더 많이 두고 싶은가요? 정답은 한 가지가 아니에요.",
      "fit_slides": [
        "compare"
      ]
    },
    {
      "id": "q_nine_other",
      "type": "fun_question",
      "icon": "💡",
      "title": "9의 다른 방법",
      "content": "4·5 말고 9를 만드는 다른 방법은? 0과 9도 가능해요. 학생들이 새로 찾아낸 답에 함께 놀라기.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "q_zero_meaning",
      "type": "fun_question",
      "icon": "💡",
      "title": "0의 의미",
      "content": "0개는 아무것도 없는 거예요. 0개와 7개를 모으면 그냥 7개. 학생들에게 빈 손과 7개 든 손을 비교해 보여 주기.",
      "fit_slides": [
        "advanced_problem"
      ]
    },
    {
      "id": "e_unit_overview",
      "type": "extension",
      "icon": "⬆",
      "title": "단원 전체 흐름",
      "content": "3단원은 모으기·가르기에서 시작해서 덧셈·뺄셈으로 자연스럽게 이어져요. 오늘 수업은 9까지로 확장하는 토대.",
      "fit_slides": [
        "cover",
        "summary"
      ]
    },
    {
      "id": "e_zero_preview",
      "type": "extension",
      "icon": "⬆",
      "title": "11차 미리 보기",
      "content": "오늘 살짝 본 0과 어떤 수의 모으기는 11차에서 본격적으로 배울 0이 있는 덧셈·뺄셈으로 이어져요.",
      "fit_slides": [
        "advanced_problem",
        "next_lesson"
      ]
    },
    {
      "id": "e_next_lesson_preview",
      "type": "extension",
      "icon": "⬆",
      "title": "다음 시간 미리 보기",
      "content": "04차에는 모으기·가르기를 덧셈·뺄셈 이야기로 바꿔 봐요. 오늘 배운 내용이 다음 시간의 기초.",
      "fit_slides": [
        "next_lesson",
        "summary"
      ]
    },
    {
      "id": "g_nine_pairs",
      "type": "game",
      "icon": "🎮",
      "title": "9 만들기 짝꿍 찾기",
      "content": "교실에서 두 명씩 짝을 지어 각자 손가락으로 수를 보여 줘요. 합이 9가 되면 짝 성공. 손가락 1·8, 2·7, 3·6, 4·5 — 모두 9.",
      "fit_slides": [
        "arrow_flow"
      ]
    },
    {
      "id": "g_card_match",
      "type": "game",
      "icon": "🎮",
      "title": "카드 짝짓기 놀이",
      "content": "카드 두 장씩 짝지어 두 수를 모으면 7이 되도록. 1·6, 2·5, 3·4 세 쌍. 한 명이 카드를 섞고 다른 한 명이 짝짓기.",
      "fit_slides": [
        "card_arrange"
      ]
    },
    {
      "id": "g_make_what",
      "type": "game",
      "icon": "🎮",
      "title": "모아서 몇 만들기",
      "content": "지도서 '이런 활동도 해 봐요'에 안내된 놀이 — 9까지 수 카드 9장. 정해진 수를 만들면 종 치기. 4~5명 모둠으로 진행.",
      "fit_slides": [
        "real_world"
      ]
    },
    {
      "id": "r_farm_count",
      "type": "real_world",
      "icon": "🌍",
      "title": "농장에서 모으기",
      "content": "농장에서 채소를 따고 바구니에 모아요. 빨간 토마토 3개·노란 토마토 4개를 모으면 모두 7개. 모으기는 일상에 늘 있어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "t_cube_intro",
      "type": "tip",
      "icon": "🧩",
      "title": "연결 모형 처음 도입 시",
      "content": "1단원에서 본 큐브와 같은 부품. 처음에는 큐브를 손에 쥐고 직접 합치고 가르기 해 보게 한 다음 디지털 화면으로. 손 → 화면 순서.",
      "fit_slides": [
        "concept",
        "visual_demo"
      ]
    },
    {
      "id": "t_pattern",
      "type": "tip",
      "icon": "🧩",
      "title": "패턴 발견 도움",
      "content": "9의 가르기 — 4·5, 3·6, 2·7. 한쪽이 1씩 줄면 다른 쪽이 1씩 늘어요. 학생들이 스스로 발견하면 이해가 깊어져요.",
      "fit_slides": [
        "arrow_flow"
      ]
    },
    {
      "id": "t_count_on",
      "type": "tip",
      "icon": "🧩",
      "title": "이어 세기 안내",
      "content": "4와 5를 모으기 — 4부터 시작해서 5, 6, 7, 8, 9 — 이어 세기. 9까지 도달. 두 그룹을 처음부터 다시 세기보다 빨라요.",
      "fit_slides": [
        "basic_problem"
      ]
    },
    {
      "id": "t_count_back",
      "type": "tip",
      "icon": "🧩",
      "title": "거꾸로 세기 안내",
      "content": "8을 ▢과 3으로 가르기 — 8에서 3을 빼면 5. 8부터 거꾸로 7, 6, 5 — 세 번 거꾸로 세면 5. 이후 뺄셈 학습의 토대.",
      "fit_slides": [
        "basic_problem"
      ]
    },
    {
      "id": "t_check_all",
      "type": "tip",
      "icon": "🧩",
      "title": "다중 선택 확인",
      "content": "여러 답을 골라야 할 때 학생들이 하나만 고르고 멈추는 경우 많음. '다른 정답도 있을까?' 한 번 더 묻기.",
      "fit_slides": [
        "basic_problem"
      ]
    },
    {
      "id": "t_subtraction_hint",
      "type": "tip",
      "icon": "🧩",
      "title": "뺄셈 힌트 자제",
      "content": "'▢와 5를 모으면 8' — 학생이 8-5를 떠올리면 자연스럽지만, 강요는 X. 이 차시는 모으기·가르기 부분, 뺄셈 도입은 08차에서.",
      "fit_slides": [
        "advanced_problem"
      ]
    },
    {
      "id": "b_split_gather_book",
      "type": "book",
      "icon": "📖",
      "title": "『숫자 가족』·『하나둘셋』",
      "content": "수와 가르기·모으기를 그림으로 보여 주는 그림책. 1학년에 자연스러운 입문. 학교 도서관에서 찾아보세요.",
      "source": "여러 그림책 — 교사 선택",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "m_cube_part_whole",
      "type": "misconception",
      "icon": "❓",
      "title": "부분과 전체 혼동",
      "content": "학생들이 모은 큐브 6개를 보고도 '닭장 안 4·밖 2'를 잊고 6에만 집중. 모은 다음에도 어디서 왔는지 다시 묻기 — 부분-전체 관계.",
      "fit_slides": [
        "visual_demo"
      ]
    },
    {
      "id": "m_split_multi",
      "type": "misconception",
      "icon": "❓",
      "title": "가르기 한 가지 답 고정",
      "content": "학생들이 가르기를 한 가지로만 고정하는 경우. 정답이 여러 개 있다는 점 강조. '이렇게도 가르 수 있고, 저렇게도 가르 수 있어요.'",
      "fit_slides": [
        "compare"
      ]
    },
    {
      "id": "m_blank_help",
      "type": "misconception",
      "icon": "❓",
      "title": "빈칸 위치 혼동",
      "content": "'8은 ▢과 3' — 학생이 ▢ 자리를 8 자리로 착각. 빈칸이 결과인지 부분인지 시각으로 표시. 큐브 그림 동반.",
      "fit_slides": [
        "basic_problem"
      ]
    },
    {
      "id": "m_multi_answer",
      "type": "misconception",
      "icon": "❓",
      "title": "다중 정답 받아들이기",
      "content": "한 문제 = 한 정답 식에 익숙. 다양한 답 받아들이기 어색해할 수 있음. '모두 맞아요' 한 번 더 안내.",
      "fit_slides": [
        "basic_problem"
      ]
    }
  ]
};

  // ─────────── 5차시: 덧셈을 알아볼까요 ───────────
  // 단원 첫 형식 진입 차시. +·= 기호 도입 + 덧셈식 쓰기·읽기.
  // 02·03차(모으기·가르기 비형식) → 본 차시(덧셈식 도입) → 06-07차(다양한 전략) 가교.
  // 단원 새 부품 4종 첫 등장: addition_visual·merge_visual·trace_symbol·equation_read.
  // 08차 뺄셈 알아보기와 평행 구조 — 부품 재사용 자리.
  window.LESSONS["u3_l05"] = {
  "meta": {
    "title": "덧셈을 알아볼까요",
    "subtitle": "+·= 기호로 덧셈식을 쓰고 읽어요",
    "std": "[2수01-05]",
    "duration": "40분"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "도입",
      "block": "cover",
      "suggested_extras": [
        "v_addition_song",
        "r_daily_addition"
      ],
      "data": {
        "title": "덧셈을 알아볼까요",
        "subtitle": "+·= 기호로 덧셈식을 쓰고 읽어요"
      }
    },
    {
      "id": "s02",
      "stage": "도입",
      "block": "motivate",
      "suggested_extras": [
        "q_bee_observation",
        "r_garden_visit"
      ],
      "data": {
        "scene_title": "벌은 모두 몇 마리일까요?",
        "question": "꽃밭에 벌 3마리가 앉아 있어요. 그런데 벌 1마리가 더 날아와요. 벌은 모두 몇 마리일까요?",
        "visual": "🌸🌸🌸 🐝🐝🐝 ← 🐝"
      }
    },
    {
      "id": "s03",
      "stage": "도입",
      "block": "objective",
      "suggested_extras": [
        "e_unit_addition_flow"
      ],
      "data": {
        "title": "오늘 배울 점",
        "bullets": [
          "+·= 기호의 뜻을 알 수 있어요",
          "덧셈식을 쓸 수 있어요",
          "덧셈식을 두 가지 방법으로 읽을 수 있어요"
        ]
      }
    },
    {
      "id": "s04",
      "stage": "전개",
      "block": "visual_demo",
      "suggested_extras": [
        "t_addition_first",
        "m_count_again"
      ],
      "data": {
        "title": "첨가 — 더 들어와요",
        "body": "벌 3마리에 1마리가 더 날아오면 모두 4마리가 돼요. 들어오는 만큼 늘어나요.",
        "demo_type": "addition_visual",
        "params": {
          "left": 3,
          "incoming": 1,
          "total": 4,
          "emoji": "🐝",
          "mode": "add_on"
        }
      }
    },
    {
      "id": "s05",
      "stage": "전개",
      "block": "concept",
      "suggested_extras": [
        "q_symbol_meaning",
        "t_equal_balance"
      ],
      "data": {
        "title": "+와 =의 뜻",
        "equation": "3+1=4",
        "symbol_meanings": [
          {
            "symbol": "+",
            "meaning": "더하기"
          },
          {
            "symbol": "=",
            "meaning": "같다"
          }
        ],
        "content": "3 더하기 1은 4. 식으로 쓰면 3+1=4. +는 '더하기', =는 '양쪽 양이 같음'을 나타내요."
      }
    },
    {
      "id": "s06",
      "stage": "전개",
      "block": "visual_demo",
      "suggested_extras": [
        "q_butterfly_color",
        "r_school_yard"
      ],
      "data": {
        "title": "합병 — 모여요",
        "body": "노랑나비 2마리와 흰나비 3마리가 모이면 모두 나비 5마리. 식으로 쓰면 2+3=5.",
        "demo_type": "merge_visual",
        "params": {
          "left": 2,
          "right": 3,
          "total": 5,
          "left_label": "노랑나비",
          "right_label": "흰나비",
          "emoji": "🦋"
        }
      }
    },
    {
      "id": "s07",
      "stage": "전개",
      "block": "compare",
      "suggested_extras": [
        "m_two_situations_one_eq",
        "t_same_equation_idea"
      ],
      "data": {
        "title": "두 상황 모두 덧셈식",
        "body": "첨가(벌)와 합병(나비)은 다른 상황이에요. 그런데 둘 다 덧셈식으로 표현해요.",
        "left": {
          "situation": "첨가",
          "eq": "3+1=4",
          "emoji": "🐝"
        },
        "right": {
          "situation": "합병",
          "eq": "2+3=5",
          "emoji": "🦋"
        }
      }
    },
    {
      "id": "s08",
      "stage": "기본문제",
      "block": "basic_problem",
      "suggested_extras": [
        "t_count_on",
        "m_plus_direction"
      ],
      "data": {
        "title": "덧셈식 빈칸 (벌)",
        "question": "3+1=▢",
        "answer": 4,
        "input": "number_pad",
        "range": [
          0,
          9
        ],
        "visual": "🐝🐝🐝 + 🐝"
      }
    },
    {
      "id": "s09",
      "stage": "기본문제",
      "block": "basic_problem",
      "suggested_extras": [
        "t_count_on"
      ],
      "data": {
        "title": "덧셈식 빈칸 (나비)",
        "question": "2+3=▢",
        "answer": 5,
        "input": "number_pad",
        "range": [
          0,
          9
        ],
        "visual": "🦋🦋 + 🦋🦋🦋"
      }
    },
    {
      "id": "s10",
      "stage": "기본문제",
      "block": "trace_symbol",
      "suggested_extras": [
        "t_finger_trace",
        "a_air_writing"
      ],
      "data": {
        "title": "+ 따라쓰기",
        "body": "빨간 점에서 시작해서 +를 따라 그려요.",
        "symbol": "+",
        "svg_path": "plus",
        "start_dot": "red"
      }
    },
    {
      "id": "s11",
      "stage": "기본문제",
      "block": "trace_symbol",
      "suggested_extras": [
        "t_equal_two_lines"
      ],
      "data": {
        "title": "= 따라쓰기",
        "body": "= 기호는 두 선이 나란히 같은 길이. 양쪽 양이 같음을 나타내요.",
        "symbol": "=",
        "svg_path": "equals",
        "start_dot": "red"
      }
    },
    {
      "id": "s12",
      "stage": "응용문제",
      "block": "advanced_problem",
      "suggested_extras": [
        "r_apple_basket",
        "t_count_on"
      ],
      "data": {
        "title": "사과 모두 몇 개?",
        "question": "사과 4개와 사과 3개를 모두 합치면 ▢개",
        "equation": "4+3=▢",
        "answer": 7,
        "input": "number_pad",
        "range": [
          0,
          9
        ],
        "visual": "🍎🍎🍎🍎 + 🍎🍎🍎"
      }
    },
    {
      "id": "s13",
      "stage": "응용문제",
      "block": "basic_problem",
      "suggested_extras": [
        "m_minus_confuse",
        "t_check_total"
      ],
      "data": {
        "title": "필통 — 알맞은 식 고르기",
        "question": "필통 속 연필 3자루와 지우개 1개를 보고 알맞은 덧셈식을 골라요",
        "choices": [
          "3+1=4",
          "3+1=5",
          "1+3=3",
          "3-1=2"
        ],
        "answer_indices": [
          0
        ],
        "selection": "single",
        "visual": "필통 + ✏✏✏ + 🩹"
      }
    },
    {
      "id": "s14",
      "stage": "응용문제",
      "block": "card_arrange",
      "suggested_extras": [
        "t_two_readings",
        "q_pick_easy"
      ],
      "data": {
        "title": "덧셈식 두 가지로 읽기",
        "body": "6+2=8을 두 가지 방법으로 읽을 수 있어요. 알맞은 한국어 표현을 끌어다 짝지어요.",
        "total": 2,
        "pairs": [
          [
            "6+2=8",
            "6 더하기 2는 8과 같습니다"
          ],
          [
            "6+2=8",
            "6과 2의 합은 8입니다"
          ]
        ],
        "equation": "6+2=8",
        "readings": [
          "6 더하기 2는 8과 같습니다",
          "6과 2의 합은 8입니다"
        ]
      }
    },
    {
      "id": "s15",
      "stage": "응용문제",
      "block": "real_world",
      "suggested_extras": [
        "r_my_pencil_case",
        "a_class_objects"
      ],
      "data": {
        "title": "내 필통 — 5+2",
        "body": "필통에 연필 5자루와 지우개 2개가 있어요. 모두 합치면 몇 개일까요?",
        "equation": "5+2=▢",
        "answer": 7,
        "visual": "필통 + ✏×5 + 🩹×2"
      }
    },
    {
      "id": "s16",
      "stage": "정리",
      "block": "summary",
      "suggested_extras": [
        "b_addition_book",
        "e_next_lesson_addition"
      ],
      "data": {
        "title": "오늘 배운 점",
        "points": [
          "+는 더하기, =는 양쪽 양이 같음을 나타내요",
          "첨가(들어옴)도 합병(모이기)도 모두 덧셈식이에요",
          "X 더하기 Y는 Z와 같습니다",
          "X와 Y의 합은 Z입니다"
        ]
      }
    },
    {
      "id": "s17",
      "stage": "정리",
      "block": "question",
      "suggested_extras": [],
      "data": {
        "title": "자기 점검",
        "question": "오늘 배운 것을 스스로 점검해 봐요",
        "items": [
          "+와 =의 의미를 알 수 있나요?",
          "그림을 보고 덧셈식을 쓸 수 있나요?",
          "덧셈식을 두 가지 방법으로 읽을 수 있나요?"
        ]
      }
    },
    {
      "id": "s18",
      "stage": "정리",
      "block": "next_lesson",
      "suggested_extras": [
        "e_next_lesson_addition"
      ],
      "data": {
        "title": "다음 시간",
        "body": "다음 시간에는 손가락·연결 모형·십 배열판으로 덧셈을 다양하게 해 봐요.",
        "preview": "06-07차 — 덧셈을 해 볼까요"
      }
    }
  ],
  "extras": [
    {
      "id": "v_addition_song",
      "type": "video",
      "icon": "🎥",
      "title": "덧셈 노래 — 핑크퐁 + 노래",
      "content": "덧셈을 노래로 배우는 영상. 1+1=2부터 시작하는 단순 가사. 도입 자리에 짧게 3분 자리.",
      "url": "https://www.youtube.com/results?search_query=핑크퐁+덧셈+노래",
      "fit_slides": [
        "cover"
      ]
    },
    {
      "id": "a_air_writing",
      "type": "other_activity",
      "icon": "📚",
      "title": "허공 손가락 쓰기",
      "content": "지도서 제안 활동 — 학생들이 손가락으로 허공에 +·= 기호를 직접 써 보기. 짝과 마주 보고 손가락으로 같이 그리기. 디지털 따라쓰기 전후로 1분.",
      "fit_slides": [
        "trace_symbol"
      ]
    },
    {
      "id": "a_class_objects",
      "type": "other_activity",
      "icon": "📚",
      "title": "교실 물건으로 덧셈식 만들기",
      "content": "교실 안 물건(책·연필·지우개·딱지)으로 학생들이 직접 덧셈식 만들어 보기. '내 책상에 연필 3자루, 지우개 2개 → 3+2=5'. 짝과 공유.",
      "fit_slides": [
        "real_world"
      ]
    },
    {
      "id": "q_bee_observation",
      "type": "fun_question",
      "icon": "💡",
      "title": "꽃밭 발문",
      "content": "벌은 꽃밭에서 무엇을 할까요? 학생들의 자유 발화. 꿀 모으기·꽃 안 들어가기·집으로 가기 등. 그다음 '벌이 더 오면 모두 몇 마리?' 자연스레.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "q_symbol_meaning",
      "type": "fun_question",
      "icon": "💡",
      "title": "기호는 왜 필요?",
      "content": "'3 더하기 1은 4'를 글로 매번 쓰면 길어요. 그래서 +·= 기호를 만들었어요. 학생들에게 '왜 기호로 쓸까요?' 한 번 묻기.",
      "fit_slides": [
        "concept"
      ]
    },
    {
      "id": "q_butterfly_color",
      "type": "fun_question",
      "icon": "💡",
      "title": "나비 색 발문",
      "content": "노랑나비와 흰나비는 색이 달라요. 그런데 모이면 모두 나비예요. 색이 달라도 같이 셀 수 있을까요? — 분류 단원과 자연 연결.",
      "fit_slides": [
        "visual_demo"
      ]
    },
    {
      "id": "q_pick_easy",
      "type": "fun_question",
      "icon": "💡",
      "title": "어느 읽기가 더 쉬워요?",
      "content": "'6 더하기 2는 8과 같습니다' vs '6과 2의 합은 8입니다' — 학생에게 어느 표현이 더 자연스러운지 물어보기. 둘 다 정답이지만 학생 선호 자유.",
      "fit_slides": [
        "card_arrange"
      ]
    },
    {
      "id": "e_unit_addition_flow",
      "type": "extension",
      "icon": "⬆",
      "title": "단원 덧셈 흐름",
      "content": "오늘 차시 = 덧셈식 도입(기호). 06-07차 = 덧셈을 다양한 방법으로. 11차 = 0이 있는 덧셈. 12차 = 덧셈·뺄셈 정리. 단원 전체 흐름 안내.",
      "fit_slides": [
        "objective",
        "cover"
      ]
    },
    {
      "id": "e_next_lesson_addition",
      "type": "extension",
      "icon": "⬆",
      "title": "06-07차 미리 보기",
      "content": "오늘 익힌 덧셈식을 다음 차시에는 손가락·연결 모형·십 배열판·이어 세기로 직접 계산해 봐요. 형식 익혔으니 다양한 전략으로 확장.",
      "fit_slides": [
        "next_lesson",
        "summary"
      ]
    },
    {
      "id": "g_equation_card",
      "type": "game",
      "icon": "🎮",
      "title": "덧셈식 카드 만들기",
      "content": "3명 모둠. 0~9 수 카드와 +·= 카드를 섞어 놓고 한 명이 식을 만들면 다른 두 명이 식 읽기. 식이 맞으면 카드 가져가기.",
      "fit_slides": [
        "concept",
        "basic_problem"
      ]
    },
    {
      "id": "r_daily_addition",
      "type": "real_world",
      "icon": "🌍",
      "title": "일상 속 덧셈",
      "content": "학생이 일상에서 만나는 덧셈 — 사탕 받기·과일 모으기·친구가 오기·간식 받기. 덧셈은 늘 우리 곁에 있어요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "r_garden_visit",
      "type": "real_world",
      "icon": "🌍",
      "title": "꽃밭 방문",
      "content": "학교 화단·집 화분에 가서 벌·나비·꽃 직접 보기. 디지털 자료 전후로 실제 자연 관찰. 살아 있는 수학.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_school_yard",
      "type": "real_world",
      "icon": "🌍",
      "title": "운동장 모이기",
      "content": "운동장에서 친구들이 모이는 자리 = 합병 자체. 1반 5명 + 2반 3명 → 모두 8명. 학생들 직접 줄 서기로 체험.",
      "fit_slides": [
        "visual_demo"
      ]
    },
    {
      "id": "r_apple_basket",
      "type": "real_world",
      "icon": "🌍",
      "title": "사과 바구니",
      "content": "엄마가 사과 4개를 바구니에 담고 아빠가 3개를 더 담으면 모두 몇 개? 실생활 첨가 자리.",
      "fit_slides": [
        "advanced_problem"
      ]
    },
    {
      "id": "r_my_pencil_case",
      "type": "real_world",
      "icon": "🌍",
      "title": "내 필통 세어 보기",
      "content": "학생들이 자기 필통을 열어 연필·지우개 직접 세어 보고 덧셈식 만들기. '내 필통에는 ▢자루 + ▢개'. 짝과 비교는 X (단독 학습 환경).",
      "fit_slides": [
        "real_world"
      ]
    },
    {
      "id": "t_addition_first",
      "type": "tip",
      "icon": "🧩",
      "title": "덧셈 첫 도입",
      "content": "학생들에게 '덧셈'이라는 말 자체가 처음일 수 있음. '더하기'라는 친숙한 말로 먼저 시작하고 차차 '덧셈식'으로 옮겨가기.",
      "fit_slides": [
        "visual_demo",
        "concept"
      ]
    },
    {
      "id": "t_equal_balance",
      "type": "tip",
      "icon": "🧩",
      "title": "= 균형 강조",
      "content": "=는 '답이 나온다'가 아니라 '양쪽 양이 같음'. 시소·저울 비유 도움. '3+1과 4는 같아요' = 양쪽 균형.",
      "fit_slides": [
        "concept"
      ]
    },
    {
      "id": "t_same_equation_idea",
      "type": "tip",
      "icon": "🧩",
      "title": "같은 식 다른 상황",
      "content": "학생이 첨가·합병이 다른 상황인데 같은 식이라는 점에 혼란스러워할 수 있음. '식은 같지만 이야기는 달라요' 안내.",
      "fit_slides": [
        "compare"
      ]
    },
    {
      "id": "t_count_on",
      "type": "tip",
      "icon": "🧩",
      "title": "이어 세기 안내",
      "content": "3+1은 3 다음부터 이어 세기 — 4. 처음부터 다시 세기보다 빠름. 손가락 자리 자연스럽게.",
      "fit_slides": [
        "basic_problem",
        "advanced_problem"
      ]
    },
    {
      "id": "t_finger_trace",
      "type": "tip",
      "icon": "🧩",
      "title": "손가락 따라쓰기",
      "content": "디지털 화면 위에 손가락 자체로 따라 그리기. 빨간 점에서 시작 → 화살표 방향. 두 번째 시도부터는 손가락 떼지 않기.",
      "fit_slides": [
        "trace_symbol"
      ]
    },
    {
      "id": "t_equal_two_lines",
      "type": "tip",
      "icon": "🧩",
      "title": "= 두 줄 길이",
      "content": "=는 위아래 두 줄이 같은 길이여야 해요. 학생이 한쪽만 길게 그리면 '두 줄이 같은 길이여야 양쪽이 같다는 뜻이 돼요' 안내.",
      "fit_slides": [
        "trace_symbol"
      ]
    },
    {
      "id": "t_two_readings",
      "type": "tip",
      "icon": "🧩",
      "title": "두 가지 읽기 둘 다 인정",
      "content": "'6 더하기 2는 8과 같습니다'와 '6과 2의 합은 8입니다' 둘 다 정답. '3 더하기 1은 4입니다'(간단 형식)도 인정. 학생 자유 발화 권장.",
      "fit_slides": [
        "card_arrange"
      ]
    },
    {
      "id": "t_check_total",
      "type": "tip",
      "icon": "🧩",
      "title": "전체 수 다시 세기",
      "content": "답을 정한 후 그림 전체 수를 다시 한번 세서 식과 맞는지 확인하는 습관. 단순 실수 방지.",
      "fit_slides": [
        "advanced_problem",
        "basic_problem"
      ]
    },
    {
      "id": "b_addition_book",
      "type": "book",
      "icon": "📖",
      "title": "『1과 1은 2』 그림책",
      "content": "덧셈 도입에 어울리는 그림책. 1+1=2부터 시작해 모든 덧셈을 그림으로 보여 주는 책. 학교 도서관에서 찾기.",
      "source": "여러 그림책 — 교사 선택",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "m_count_again",
      "type": "misconception",
      "icon": "❓",
      "title": "처음부터 다시 세기",
      "content": "3+1을 보고 손가락 1·2·3·4를 처음부터 다시 세는 학생. 이어 세기(3 다음 4)로 자연스레 옮겨 가도록 안내.",
      "fit_slides": [
        "visual_demo"
      ]
    },
    {
      "id": "m_two_situations_one_eq",
      "type": "misconception",
      "icon": "❓",
      "title": "같은 식인데 다른 상황?",
      "content": "학생이 첨가와 합병을 보고 '왜 같은 식?'이라며 혼란. '이야기는 달라도 결과 수가 같으면 같은 식'. 천천히 설명.",
      "fit_slides": [
        "compare"
      ]
    },
    {
      "id": "m_plus_direction",
      "type": "misconception",
      "icon": "❓",
      "title": "+ 순서 혼동",
      "content": "3+1과 1+3 둘 다 답은 4이지만, 1학년에서는 그림 순서대로 쓰기를 권장. 교환 법칙은 06-07차 자리.",
      "fit_slides": [
        "basic_problem"
      ]
    },
    {
      "id": "m_minus_confuse",
      "type": "misconception",
      "icon": "❓",
      "title": "+·- 기호 혼동",
      "content": "4지선다에 -가 섞이면 학생이 +와 헷갈릴 수 있음. 두 기호 모양 비교 한 번 더. -는 한 줄, +는 두 줄 교차.",
      "fit_slides": [
        "basic_problem",
        "advanced_problem"
      ]
    }
  ]
};

  // ─────────── 8차시: 뺄셈을 알아볼까요 ───────────
  // 05차(덧셈을 알아볼까요)와 평행 구조 차시. - 기호 도입 + 뺄셈식 쓰기·읽기.
  // 부품 자리 평행 재사용: equation_read·trace_symbol·compare 모두 05차에서.
  // 단원 새 부품: subtraction_remove_visual·subtraction_compare_visual 두 종.
  // 09-10차(뺄셈을 다양하게)·11차(0이 있는 덧셈과 뺄셈) 가교 자리.
  window.LESSONS["u3_l08"] = {
  "meta": {
    "title": "뺄셈을 알아볼까요",
    "subtitle": "- 기호로 뺄셈식을 쓰고 읽어요",
    "std": "[2수01-05]",
    "duration": "40분"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "도입",
      "block": "cover",
      "suggested_extras": [
        "v_subtraction_song",
        "r_daily_subtraction"
      ],
      "data": {
        "title": "뺄셈을 알아볼까요",
        "subtitle": "- 기호로 뺄셈식을 쓰고 읽어요"
      }
    },
    {
      "id": "s02",
      "stage": "도입",
      "block": "motivate",
      "suggested_extras": [
        "q_strawberry_observation",
        "r_strawberry_field"
      ],
      "data": {
        "scene_title": "남은 딸기는 몇 개일까요?",
        "question": "딸기가 4개 있었어요. 그런데 1개를 따 갔어요. 남은 딸기는 몇 개일까요?",
        "visual": "🍓🍓🍓🍓 → ✋(1개 따 감)"
      }
    },
    {
      "id": "s03",
      "stage": "도입",
      "block": "objective",
      "suggested_extras": [
        "e_review_l05",
        "e_unit_subtraction_flow"
      ],
      "data": {
        "title": "오늘 배울 점",
        "bullets": [
          "-와 =의 뜻을 알 수 있어요",
          "뺄셈식을 쓸 수 있어요",
          "뺄셈식을 두 가지 방법으로 읽을 수 있어요"
        ]
      }
    },
    {
      "id": "s04",
      "stage": "전개",
      "block": "visual_demo",
      "suggested_extras": [
        "t_subtraction_first",
        "m_count_after"
      ],
      "data": {
        "title": "제거 — 빠져 나가요",
        "body": "딸기 4개 중 1개를 따 가면 남은 것은 3개. 빠져 나간 만큼 줄어요.",
        "demo_type": "subtraction_remove_visual",
        "params": {
          "initial": 4,
          "removed": 1,
          "remaining": 3,
          "emoji": "🍓",
          "mode": "take_away"
        }
      }
    },
    {
      "id": "s05",
      "stage": "전개",
      "block": "concept",
      "suggested_extras": [
        "q_minus_meaning",
        "t_equal_review"
      ],
      "data": {
        "title": "-와 =의 뜻",
        "equation": "4-1=3",
        "symbol_meanings": [
          {
            "symbol": "-",
            "meaning": "빼기"
          },
          {
            "symbol": "=",
            "meaning": "같다 (05차 복습)"
          }
        ],
        "content": "4 빼기 1은 3. 식으로 쓰면 4-1=3. -는 '빼기', =는 '양쪽 양이 같음' — 05차에서 배운 그대로예요."
      }
    },
    {
      "id": "s06",
      "stage": "전개",
      "block": "visual_demo",
      "suggested_extras": [
        "q_match_pair",
        "t_unmatched"
      ],
      "data": {
        "title": "비교 — 누가 얼마나 더 많아요?",
        "body": "동그라미 5개와 세모 3개를 일대일로 짝지으면 짝 없는 동그라미가 2개. 차는 2. 식으로 쓰면 5-3=2.",
        "demo_type": "subtraction_compare_visual",
        "params": {
          "left": 5,
          "right": 3,
          "diff": 2,
          "left_shape": "●",
          "right_shape": "▲"
        }
      }
    },
    {
      "id": "s07",
      "stage": "전개",
      "block": "compare",
      "suggested_extras": [
        "m_two_situations_one_eq",
        "t_same_subtraction"
      ],
      "data": {
        "title": "두 상황 모두 뺄셈식",
        "body": "제거(딸기)와 비교(모양)는 다른 상황이에요. 그런데 둘 다 뺄셈식으로 표현해요.",
        "left": {
          "situation": "제거",
          "eq": "4-1=3",
          "emoji": "🍓"
        },
        "right": {
          "situation": "비교",
          "eq": "5-3=2",
          "emoji": "●▲"
        }
      }
    },
    {
      "id": "s08",
      "stage": "기본문제",
      "block": "basic_problem",
      "suggested_extras": [
        "t_count_back",
        "m_minus_direction"
      ],
      "data": {
        "title": "뺄셈식 빈칸 (딸기)",
        "question": "4-1=▢",
        "answer": 3,
        "input": "number_pad",
        "range": [
          0,
          9
        ],
        "visual": "🍓🍓🍓🍓 → 🍓"
      }
    },
    {
      "id": "s09",
      "stage": "기본문제",
      "block": "basic_problem",
      "suggested_extras": [
        "t_count_back"
      ],
      "data": {
        "title": "뺄셈식 빈칸 (모양)",
        "question": "5-3=▢",
        "answer": 2,
        "input": "number_pad",
        "range": [
          0,
          9
        ],
        "visual": "●●●●● / ▲▲▲ 일대일"
      }
    },
    {
      "id": "s10",
      "stage": "기본문제",
      "block": "trace_symbol",
      "suggested_extras": [
        "t_finger_trace",
        "a_air_writing"
      ],
      "data": {
        "title": "- 따라쓰기",
        "body": "빨간 점에서 시작해서 -를 따라 그려요. 한 획이라서 가장 쉬워요.",
        "symbol": "-",
        "svg_path": "minus",
        "start_dot": "red"
      }
    },
    {
      "id": "s11",
      "stage": "기본문제",
      "block": "basic_problem",
      "suggested_extras": [
        "t_one_to_one"
      ],
      "data": {
        "title": "일대일 대응 (6-3)",
        "question": "6-3=▢",
        "answer": 3,
        "input": "number_pad",
        "range": [
          0,
          9
        ],
        "visual": "두 줄 비교"
      }
    },
    {
      "id": "s12",
      "stage": "응용문제",
      "block": "advanced_problem",
      "suggested_extras": [
        "r_balloon_party",
        "t_count_back"
      ],
      "data": {
        "title": "풍선이 터졌어요",
        "question": "풍선 7개 중 2개가 터졌어요. 남은 풍선은 ▢개",
        "equation": "7-2=▢",
        "answer": 5,
        "input": "number_pad",
        "range": [
          0,
          9
        ],
        "visual": "🎈🎈🎈🎈🎈🎈🎈 → 2개 터짐"
      }
    },
    {
      "id": "s13",
      "stage": "응용문제",
      "block": "basic_problem",
      "suggested_extras": [
        "m_plus_minus_confuse",
        "t_check_remaining"
      ],
      "data": {
        "title": "사과 — 알맞은 식 고르기",
        "question": "사과 6개 중 3개를 먹었어요. 알맞은 뺄셈식을 골라요",
        "choices": [
          "6-3=3",
          "6-3=2",
          "6+3=9",
          "3-6=?"
        ],
        "answer_indices": [
          0
        ],
        "selection": "single",
        "visual": "🍎🍎🍎🍎🍎🍎 → 3개 먹음"
      }
    },
    {
      "id": "s14",
      "stage": "응용문제",
      "block": "card_arrange",
      "suggested_extras": [
        "t_two_readings",
        "q_pick_easy"
      ],
      "data": {
        "title": "뺄셈식 두 가지로 읽기",
        "body": "6-3=3을 두 가지 방법으로 읽을 수 있어요. 알맞은 한국어 표현을 끌어다 짝지어요.",
        "total": 2,
        "pairs": [
          [
            "6-3=3",
            "6 빼기 3은 3과 같습니다"
          ],
          [
            "6-3=3",
            "6과 3의 차는 3입니다"
          ]
        ],
        "equation": "6-3=3",
        "readings": [
          "6 빼기 3은 3과 같습니다",
          "6과 3의 차는 3입니다"
        ]
      }
    },
    {
      "id": "s15",
      "stage": "응용문제",
      "block": "real_world",
      "suggested_extras": [
        "r_classroom_compare",
        "a_class_objects"
      ],
      "data": {
        "title": "어느 것이 얼마나 더?",
        "body": "동그라미 4개와 세모 2개. 동그라미가 얼마나 더 많을까요? 식으로 써 봐요.",
        "equation": "4-2=▢",
        "answer": 2,
        "visual": "●●●● / ▲▲"
      }
    },
    {
      "id": "s16",
      "stage": "정리",
      "block": "summary",
      "suggested_extras": [
        "b_subtraction_book",
        "e_next_lesson_subtraction"
      ],
      "data": {
        "title": "오늘 배운 점",
        "points": [
          "-는 빼기, =는 양쪽 양이 같음을 나타내요",
          "제거(빼냄)도 비교(차)도 모두 뺄셈식이에요",
          "X 빼기 Y는 Z와 같습니다",
          "X와 Y의 차는 Z입니다"
        ]
      }
    },
    {
      "id": "s17",
      "stage": "정리",
      "block": "question",
      "suggested_extras": [],
      "data": {
        "title": "자기 점검",
        "question": "오늘 배운 것을 스스로 점검해 봐요",
        "items": [
          "-와 =의 의미를 알 수 있나요?",
          "그림을 보고 뺄셈식을 쓸 수 있나요?",
          "뺄셈식을 두 가지 방법으로 읽을 수 있나요?"
        ]
      }
    },
    {
      "id": "s18",
      "stage": "정리",
      "block": "next_lesson",
      "suggested_extras": [
        "e_next_lesson_subtraction"
      ],
      "data": {
        "title": "다음 시간",
        "body": "다음 시간에는 손가락·연결 모형·십 배열판으로 뺄셈을 다양하게 해 봐요.",
        "preview": "09-10차 — 뺄셈을 해 볼까요"
      }
    }
  ],
  "extras": [
    {
      "id": "v_subtraction_song",
      "type": "video",
      "icon": "🎥",
      "title": "뺄셈 노래 — 핑크퐁",
      "content": "뺄셈을 노래로 배우는 영상. 5-1=4부터 시작하는 단순 가사. 도입 자리에 짧게.",
      "url": "https://www.youtube.com/results?search_query=핑크퐁+뺄셈+노래",
      "fit_slides": [
        "cover"
      ]
    },
    {
      "id": "a_air_writing",
      "type": "other_activity",
      "icon": "📚",
      "title": "허공 손가락 쓰기",
      "content": "지도서 제안 활동 — 학생들이 손가락으로 허공에 - 기호 직접 써 보기. 한 획이라 가장 쉬움. 디지털 따라쓰기 전후로 30초.",
      "fit_slides": [
        "trace_symbol"
      ]
    },
    {
      "id": "a_class_objects",
      "type": "other_activity",
      "icon": "📚",
      "title": "교실 물건 비교",
      "content": "교실 안 두 종류 물건(연필·지우개·딱지) 수를 세고 뺄셈식 만들기. '연필 8자루 - 지우개 5개 = 차 3'. 짝과 비교 자체 자리.",
      "fit_slides": [
        "real_world"
      ]
    },
    {
      "id": "q_strawberry_observation",
      "type": "fun_question",
      "icon": "💡",
      "title": "딸기 발문",
      "content": "딸기는 누가 따 갔을까요? 학생 자유 발화 — 친구·동생·새. 그다음 '몇 개가 남았을까요?' 자연스레.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "q_minus_meaning",
      "type": "fun_question",
      "icon": "💡",
      "title": "- 기호 발문",
      "content": "-는 +와 모양이 어떻게 달라요? +는 두 줄이 교차, -는 한 줄. 모양 차이가 뜻의 차이를 보여 줘요.",
      "fit_slides": [
        "concept"
      ]
    },
    {
      "id": "q_match_pair",
      "type": "fun_question",
      "icon": "💡",
      "title": "짝짓기 발문",
      "content": "동그라미와 세모를 짝지을 때 누가 짝이 없을까요? 짝 없는 자리가 차예요. 짝을 찾지 못한 친구를 위로해 주는 마음으로.",
      "fit_slides": [
        "visual_demo"
      ]
    },
    {
      "id": "q_pick_easy",
      "type": "fun_question",
      "icon": "💡",
      "title": "어느 읽기가 더 쉬워요?",
      "content": "'6 빼기 3은 3과 같습니다' vs '6과 3의 차는 3입니다' — 학생에게 어느 표현이 더 자연스러운지 물어보기. 둘 다 정답이지만 학생 선호 자유.",
      "fit_slides": [
        "card_arrange"
      ]
    },
    {
      "id": "e_review_l05",
      "type": "extension",
      "icon": "⬆",
      "title": "05차 복습 안내",
      "content": "오늘 차시는 05차 덧셈 알아보기와 평행. 05차에서 +·= 배웠다면 오늘은 -·= 자리. 식 형식도 거의 같음.",
      "fit_slides": [
        "objective"
      ]
    },
    {
      "id": "e_unit_subtraction_flow",
      "type": "extension",
      "icon": "⬆",
      "title": "단원 뺄셈 흐름",
      "content": "오늘 = 뺄셈식 도입(기호). 09-10차 = 뺄셈을 다양한 방법으로. 11차 = 0이 있는 뺄셈. 12차 = 덧셈·뺄셈 정리.",
      "fit_slides": [
        "objective",
        "cover"
      ]
    },
    {
      "id": "e_next_lesson_subtraction",
      "type": "extension",
      "icon": "⬆",
      "title": "09-10차 미리 보기",
      "content": "오늘 익힌 뺄셈식을 다음 차시에는 손가락·연결 모형·십 배열판·거꾸로 세기로 직접 계산해 봐요. 형식 익혔으니 다양한 전략으로 확장.",
      "fit_slides": [
        "next_lesson",
        "summary"
      ]
    },
    {
      "id": "g_subtraction_card",
      "type": "game",
      "icon": "🎮",
      "title": "뺄셈식 카드 만들기",
      "content": "3명 모둠. 0~9 수 카드와 -·= 카드를 섞어 놓고 한 명이 식을 만들면 다른 두 명이 식 읽기. 식이 맞으면 카드 가져가기. 05차 덧셈식 카드 자리와 같이 사용 가능.",
      "fit_slides": [
        "concept",
        "basic_problem"
      ]
    },
    {
      "id": "r_daily_subtraction",
      "type": "real_world",
      "icon": "🌍",
      "title": "일상 속 뺄셈",
      "content": "학생이 일상에서 만나는 뺄셈 — 간식 먹기·연필 부러뜨리기·풍선 터뜨리기·친구가 가기. 뺄셈도 늘 우리 곁에 있어요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "r_strawberry_field",
      "type": "real_world",
      "icon": "🌍",
      "title": "딸기 따기 체험",
      "content": "딸기 농장에 가서 직접 따 보기. 처음 100개 → 10개 따기 → 90개 남기. 큰 수도 뺄셈으로 표현 가능.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_balloon_party",
      "type": "real_world",
      "icon": "🌍",
      "title": "생일 파티 풍선",
      "content": "생일 파티에서 풍선 10개 → 친구들이 가져가기 → 남은 풍선 세기. 실제 자리에서 뺄셈 자연스럽게.",
      "fit_slides": [
        "advanced_problem"
      ]
    },
    {
      "id": "r_classroom_compare",
      "type": "real_world",
      "icon": "🌍",
      "title": "교실 비교 자리",
      "content": "교실 안 남자 학생 수와 여자 학생 수. 어느 쪽이 얼마나 더 많은가? 차 = 비교 자리. 매일 보는 자리에서 수학.",
      "fit_slides": [
        "real_world"
      ]
    },
    {
      "id": "t_subtraction_first",
      "type": "tip",
      "icon": "🧩",
      "title": "뺄셈 첫 도입",
      "content": "'뺄셈'이라는 말 자체가 처음일 수 있음. '빼기'라는 친숙한 말로 시작하고 차차 '뺄셈식'으로 옮겨가기. 05차 '덧셈' 도입과 같은 자리.",
      "fit_slides": [
        "visual_demo",
        "concept"
      ]
    },
    {
      "id": "t_equal_review",
      "type": "tip",
      "icon": "🧩",
      "title": "= 복습 강조",
      "content": "=는 05차에서 이미 배움. 오늘은 -만 새로움. '=는 양쪽이 같다는 뜻 — 기억나죠?' 한 번 더 확인.",
      "fit_slides": [
        "concept"
      ]
    },
    {
      "id": "t_same_subtraction",
      "type": "tip",
      "icon": "🧩",
      "title": "같은 식 다른 상황",
      "content": "제거·비교가 다른 상황인데 같은 뺄셈식이라는 점에 혼란스러워할 수 있음. '식은 같지만 이야기는 달라요'. 05차 자리와 평행.",
      "fit_slides": [
        "compare"
      ]
    },
    {
      "id": "t_count_back",
      "type": "tip",
      "icon": "🧩",
      "title": "거꾸로 세기 안내",
      "content": "4-1은 4부터 거꾸로 세기 — 3. 처음부터 세기보다 빠름. 손가락 자리 자연스럽게.",
      "fit_slides": [
        "basic_problem",
        "advanced_problem"
      ]
    },
    {
      "id": "t_one_to_one",
      "type": "tip",
      "icon": "🧩",
      "title": "일대일 대응 안내",
      "content": "비교 자리는 일대일 대응이 핵심. 위 줄과 아래 줄을 손가락으로 짚어 짝짓고 짝 없는 자리를 세기. 시각적으로 차를 보여 주기.",
      "fit_slides": [
        "visual_demo",
        "basic_problem"
      ]
    },
    {
      "id": "t_finger_trace",
      "type": "tip",
      "icon": "🧩",
      "title": "손가락 따라쓰기",
      "content": "디지털 화면 위에 손가락으로 따라 그리기. -는 한 획이라 가장 쉬움. 처음 따라쓰기 자리에 자신감 주기.",
      "fit_slides": [
        "trace_symbol"
      ]
    },
    {
      "id": "t_unmatched",
      "type": "tip",
      "icon": "🧩",
      "title": "짝 없는 자리 강조",
      "content": "비교 자리에서 학생이 두 그룹 수만 세고 끝낼 수 있음. 짝 없는 자리(차)에 동그라미·하이라이트 시각으로 강조 필요.",
      "fit_slides": [
        "visual_demo"
      ]
    },
    {
      "id": "t_two_readings",
      "type": "tip",
      "icon": "🧩",
      "title": "두 가지 읽기 둘 다 인정",
      "content": "'6 빼기 3은 3과 같습니다'와 '6과 3의 차는 3입니다' 둘 다 정답. '4 빼기 1은 3입니다'(간단 형식)도 인정. 학생 자유 발화 권장.",
      "fit_slides": [
        "card_arrange"
      ]
    },
    {
      "id": "t_check_remaining",
      "type": "tip",
      "icon": "🧩",
      "title": "남은 수 다시 세기",
      "content": "답을 정한 후 그림에 남은 자체 다시 세서 식과 맞는지 확인 습관. 단순 실수 방지.",
      "fit_slides": [
        "advanced_problem",
        "basic_problem"
      ]
    },
    {
      "id": "b_subtraction_book",
      "type": "book",
      "icon": "📖",
      "title": "『남은 것은 몇?』 그림책",
      "content": "뺄셈 도입에 어울리는 그림책. 일상 자리에서 빼기·남기 자리를 그림으로 보여 주는 책. 학교 도서관에서 찾기.",
      "source": "여러 그림책 — 교사 선택",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "m_count_after",
      "type": "misconception",
      "icon": "❓",
      "title": "빠져 나간 자리도 세기",
      "content": "4-1을 보고 사라진 1까지 세서 4라고 답하는 학생. '빠져 나간 것은 빼고 남은 것만 세기'. 시각으로 빠져 나간 자리 회색 처리.",
      "fit_slides": [
        "visual_demo"
      ]
    },
    {
      "id": "m_two_situations_one_eq",
      "type": "misconception",
      "icon": "❓",
      "title": "같은 식인데 다른 상황?",
      "content": "학생이 제거와 비교를 보고 '왜 같은 식?'이라며 혼란. '이야기는 달라도 결과 수가 같으면 같은 식'. 05차 자리와 평행한 오개념.",
      "fit_slides": [
        "compare"
      ]
    },
    {
      "id": "m_minus_direction",
      "type": "misconception",
      "icon": "❓",
      "title": "- 순서 바꿈 금지",
      "content": "4-1과 1-4는 다름. 1학년에서는 항상 큰 수 - 작은 수. 음수 자리는 도입 X. 학생이 작은 수에서 큰 수 빼려 하면 '큰 수에서 작은 수' 자리 안내.",
      "fit_slides": [
        "basic_problem"
      ]
    },
    {
      "id": "m_plus_minus_confuse",
      "type": "misconception",
      "icon": "❓",
      "title": "+·- 기호 혼동",
      "content": "4지선다에 +가 섞이면 학생이 -와 헷갈릴 수 있음. 두 기호 모양 비교 한 번 더. +는 두 줄 교차, -는 한 줄. 모양 차이가 뜻 차이.",
      "fit_slides": [
        "basic_problem",
        "advanced_problem"
      ]
    }
  ]
};
})();
