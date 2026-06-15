/* ============================================================================
   1학년 수학 5단원 (50까지의 수) 차시 데이터
   - 키 형식: LESSONS["u5_l{NN}"]
   - 차시 누적 자리. kedu/curriculum/math/g1/unit5 의 차시별 draft.html 학생
     본 차시를 교사용 18슬 인덱스(5단계)로 가공하여 LESSONS 객체에 누적.
   - 형식 기준: g1_math_u3.js (진짜 완성본). meta={title,subtitle,std,duration}.
   - cycle A = 표준 18슬 인덱스(suggested_extras·extras는 cycle C에서 채움).
   ============================================================================ */

(function () {


  // ─────────── 2~3차시: 9 다음 수를 알아볼까요 (10 개념 + 10 가르기) ───────────
  // std [2수01-01][2수01-04]. 빙수 맥락. 80분 블록 차시 (2시간 통합). 학생 draft 18슬 1:1 매핑.
  // 활동 1·2·3 = 10 개념 (2차시) + 활동 4·5 = 10 가르기 (3차시). 0과 10·10과 0 가르기는 다루지 않음.
  LESSONS["u5_l02_03"] = {
    meta: {
      title: "1학년 수학 5단원 2~3차시",
      subtitle: "9 다음 수를 알아볼까요 (10 개념 + 가르기)",
      std: "[2수01-01] [2수01-04]",
      duration: 80
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"motivate",data:{scene_title:"건강한 여름, 빙수를 만들어요",kids:[{face:"🍧",label:"빙수"},{face:"🧊",label:"얼음 9개"},{face:"❓",label:"1개 더?"}],question:"얼음이 **9개** 있어요.\n1개를 더 넣으면\n모두 **몇 개**일까요?"},suggested_extras:["q_one_more_than_nine","r_bingsu_toppings"]},
  {id:"s02",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**9 다음 수 10** 을 배워요\n그리고 10을 **두 수로 가르기** 해 봐요\n(2~3차시 통합 — 80분 블록)"},suggested_extras:["m_eighty_min_pace","m_pause_per_step"]},
  {id:"s03",stage:"도입",block:"review",data:{title:"우리가 배운 것",content:"**9까지의 수** — 1단원에서 배웠어요\n9는 **8과 1**, **5와 4** 로도 가르기 했지요\n오늘은 그 **다음 수 10** 을 배워요!"},suggested_extras:["e_nine_split_review"]},
  // ===== 전개 (4) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"9에서 1만큼 더 큰 수는?",bidirect:["⬛⬛⬛⬛⬛⬛⬛⬛⬛⬜ (9칸 채움, 1칸 비움)","↓","1칸을 **더** 채우면","9보다 1만큼 더 큰 수 = **10**"]},suggested_extras:["m_one_to_one_count","r_fingers_ten","x_ten_after_one"]},
  {id:"s05",stage:"전개",block:"visual_demo",data:{title:"10을 두 가지 모양으로 봐요",ten_frame_solo:{count:10,is_anchor:true,label:"**연결 모형**으로 10개\n**십 배열판** 10칸\n모양은 달라도 **모두 10**"},sub_text:"구체물로 10의 개념을 단단히"},suggested_extras:["a_link_cube_split","m_ten_frame_value","a_ten_frame_paper"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"10을 두 가지로 읽어요",bidirect:["수 **10**","↓","우리말 → **열**","한자말 → **십**","친구마다 다르게 읽을 수 있어요"]},suggested_extras:["m_two_readings","v_ten_concept_song"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"10을 두 묶음으로 갈라 봐요",bidirect:["연결 모형 10개","↓","파랑 묶음 + 노랑 묶음","예: **10은 3과 7**","다른 수로도 가르기 해 볼까요?"]},suggested_extras:["m_concrete_first","a_bingo_chip_count","q_split_seven"]},
  // ===== 기본문제 (4) =====
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"🍓 산딸기는 모두 몇 개?",question:"빙수 위에 산딸기가\n한 줄에 5개씩 두 줄,\n**모두 몇 개**?\n\n(정답: 10)",answer:10,note:"5와 5로 10. 십 배열판 두 줄이 꽉 차요."},suggested_extras:["r_egg_carton"]},
  {id:"s08b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"10은 9 다음이니까 한 자리 수야",right:"10은 **두 자리** 수예요.\n10개씩 **묶음 1개**로 나타내요.",hint:"9 다음에 묶음이 하나 생겨요."},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"🥚 달걀 한 판은 몇 개?",question:"달걀 한 판에\n한 줄에 5개씩 두 줄.\n\n**5와 5로 10**\n(정답: 10)",answer:10,note:"5와 5를 모으면 10. 열 / 십."},suggested_extras:["m_skip_zero_ten"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"10의 두 가지 읽기를 짝지어요",question:"숫자 **10** 두 장과\n읽기 카드 **열 · 십**\n\n같은 것끼리 짝지어요.",answer:"10 ↔ 열 · 십",note:"같은 10끼리 짝. 10은 열 또는 십으로 읽어요."},suggested_extras:["m_two_readings"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"10을 3과 ?로 갈라 봐요",question:"파랑 묶음 **3개**,\n노랑 묶음은 ▢개?\n\n10 - 3 = 7\n(정답: 7)",answer:7,note:"10은 3과 7. 10−3=7."},suggested_extras:["m_partition_meaning"]},
  // ===== 응용문제 (4) =====
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"10을 두 수로 자유롭게 갈라요",question:"정답은 **9가지**:\n(1,9) (2,8) (3,7) (4,6) (5,5)\n(6,4) (7,3) (8,2) (9,1)\n\n* (0,10)·(10,0)은 인정만, 권장 X",answer:"9가지 — (1,9)(2,8)(3,7)(4,6)(5,5)(6,4)(7,3)(8,2)(9,1)",note:"0을 넣은 (0,10)·(10,0)은 인정만, 권장하지 않아요."},suggested_extras:["x_one_split_answer","x_zero_in_partition","a_color_ten"]},
  {id:"s13",stage:"응용문제",block:"card_arrange",data:{title:"합하면 10이 되는 짝 찾기 (4쌍)",steps:["1~9 카드 9장 중에서","합이 **10** 이 되는 두 수 짝짓기","1·9 / 2·8 / 3·7 / 4·6","**5는 짝 없음** (5+5는 같은 카드)","4쌍 완성"]},suggested_extras:["g_make_ten_card","q_who_makes_ten","m_five_and_five"]},
  {id:"s14",stage:"응용문제",block:"card_arrange",data:{title:"10 만들기 카드 놀이 (3쌍)",steps:["카드 6장 — 3·7 / 4·6 / 2·8","두 카드를 차례로 눌러요","합이 **10**이면 짝!","3쌍 모두 맞춰 봐요","교실 확장 — 꾸러미 12·13 활용"]},suggested_extras:["m_card_count_per_player","m_expected_responses","a_supplement_make_ten"]},
  {id:"s15",stage:"응용문제",block:"advanced_problem",data:{title:"개수가 10개인 것을 모두 골라요",question:"🪆 인형 10개 — 정답\n📚 책 10권 — 정답\n🍪 과자 9개 — 오답\n⭐ 별 8개 — 오답\n\n다중 정답: 두 가지 모두 선택",answers:["인형 10개","책 10권"],note:"10개인 것만. 과자 9개·별 8개는 10이 아니에요."},suggested_extras:["r_dolls_books","r_snack_box_ten","a_count_in_room"]},
  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"10은 두 수로 9가지로 갈라요",points:["10 = **9보다 1만큼 더 큰 수**","읽기 — **열** / **십** 두 가지","가르기 9가지 = 1·9, 2·8, 3·7, 4·6, 5·5","6·4, 7·3, 8·2, 9·1","0과 10, 10과 0은 권장 X"]},suggested_extras:["v_ten_split_song","b_ten_pebbles","e_make_ten_strategy"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검해 봐요",content:"9 다음 수가 **10**임을 알 수 있나요?\n**10을 두 가지로 읽을** 수 있나요?\n**10을 두 수로 가르기** 할 수 있나요?"},suggested_extras:["m_self_assess_kind"]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"10보다 큰 수 — **십몇(11~19)** 을 배워요\n10개씩 묶음 1개와 낱개 몇 개로 봐요",emoji:""},suggested_extras:["e_to_teens","x_ten_after_one"]}
    ],
    extras: [
      {
            "id": "v_ten_concept_song",
            "type": "video",
            "icon": "🎥",
            "title": "10 알아보기 동요",
            "url": "https://www.youtube.com/results?search_query=10+알아보기+동요+초등+1학년+수학",
            "description": "9 다음 수 10을 노래로 익히는 동요. 도입 분위기 형성에 좋아요.",
            "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
            "fit_slides": [
                  "motivate",
                  "concept"
            ]
      },
      {
            "id": "v_ten_split_song",
            "type": "video",
            "icon": "🎥",
            "title": "10 가르기 노래",
            "url": "https://www.youtube.com/results?search_query=10+가르기+노래+초등+수학",
            "description": "10을 두 수로 가르는 9가지 방법을 리듬으로 익히는 영상. 정리 단계 분위기 환기에 좋아요.",
            "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
            "fit_slides": [
                  "summary"
            ]
      },
      {
            "id": "r_egg_carton",
            "type": "real_world",
            "icon": "🌍",
            "title": "달걀 한 판 10개",
            "content": "달걀 한 판(소포장)은 보통 10개로 채워져 있어요. '한 판'이라는 묶음 단위 자체가 10임을 일상에서 자연스럽게 만나는 자리.",
            "fit_slides": [
                  "basic_problem",
                  "real_world"
            ]
      },
      {
            "id": "r_fingers_ten",
            "type": "real_world",
            "icon": "🌍",
            "title": "내 손가락 10개",
            "content": "양손 손가락은 10개. 학생이 가장 가까이 가진 10의 모델. 가르기 자리에서 '오른손 N개·왼손 M개로 10' 활동으로 자연스럽게 이어져요.",
            "fit_slides": [
                  "concept",
                  "visual_demo"
            ]
      },
      {
            "id": "r_dolls_books",
            "type": "real_world",
            "icon": "🌍",
            "title": "장식장의 인형·책",
            "content": "교실·집 장식장에서 인형 10개·책 10권 자리를 찾아보기. 지도서 활동 3의 예시와 동일한 일상 맥락.",
            "fit_slides": [
                  "advanced_problem"
            ]
      },
      {
            "id": "r_number_ten",
            "type": "real_world",
            "icon": "🌍",
            "title": "내 번호 10번",
            "content": "교실 출석 번호·체육복 등번호로 10번이 있어요. 10이 개수뿐 아니라 '순서'와 '이름'으로도 쓰임을 알려 주세요.",
            "fit_slides": [
                  "concept"
            ]
      },
      {
            "id": "r_snack_box_ten",
            "type": "real_world",
            "icon": "🌍",
            "title": "과자 한 상자 10개",
            "content": "과자·사탕 소포장은 10개 단위인 경우가 많아요. 학생이 마트에서 만나는 10의 예. 묶음 단위로서의 10 감각.",
            "fit_slides": [
                  "real_world",
                  "advanced_problem"
            ]
      },
      {
            "id": "r_bingsu_toppings",
            "type": "real_world",
            "icon": "🌍",
            "title": "빙수 토핑 10가지",
            "content": "단원 스토리 '건강한 여름' 자리. 빙수 위 토핑을 10가지로 정해 친구와 같은 수를 만들어 보기. 일상 음식으로 10 감각.",
            "fit_slides": [
                  "motivate",
                  "next_lesson"
            ]
      },
      {
            "id": "q_one_more_than_nine",
            "type": "fun_question",
            "icon": "💡",
            "title": "9에서 1만큼 더",
            "content": "\"9개 있는데 1개만 더 생기면 몇 개가 될까요?\" 손가락 9개 펴고 1개 더 펴 보기. 도입에서 가장 자연스러운 발문.",
            "fit_slides": [
                  "motivate"
            ]
      },
      {
            "id": "q_split_seven",
            "type": "fun_question",
            "icon": "💡",
            "title": "내가 만든 7",
            "content": "\"10을 가르면 한쪽이 3이고 다른 쪽은 몇일까요?\" 손가락 10개 중 한 손에 3, 다른 손에 7. 즉시 손으로 답이 나와요.",
            "fit_slides": [
                  "concept",
                  "basic_problem"
            ]
      },
      {
            "id": "q_who_makes_ten",
            "type": "fun_question",
            "icon": "💡",
            "title": "누구랑 친해야 10?",
            "content": "\"3은 누구랑 친해야 10이 될까?\" 짝꿍 찾기 발문. 카드 매칭 자리에 들어가면 학생 흥미가 살아나요.",
            "fit_slides": [
                  "card_arrange"
            ]
      },
      {
            "id": "q_finger_pair",
            "type": "fun_question",
            "icon": "💡",
            "title": "두 손가락 짝꿍",
            "content": "\"오른손 4개 펴면 왼손은 몇 개 펴야 10이 될까?\" 손가락으로 즉시 확인하는 가르기 발문. 시각·근감각 동시 자극.",
            "fit_slides": [
                  "card_arrange",
                  "advanced_problem"
            ]
      },
      {
            "id": "e_to_teens",
            "type": "extension",
            "icon": "⬆",
            "title": "다음은 십몇 — 04차 연결",
            "content": "10을 단단히 알면 다음 시간 십몇(11~19) 학습이 자연스럽게 이어져요. 04차 _PLAN의 자릿값 도입 자리 사전 노출.",
            "fit_slides": [
                  "next_lesson",
                  "summary"
            ]
      },
      {
            "id": "e_make_ten_strategy",
            "type": "extension",
            "icon": "⬆",
            "title": "10 만들기 전략",
            "content": "10 가르기는 단순한 분해가 아니라 덧셈·뺄셈 전 단계 핵심 전략. 1학년 2학기 '받아올림 있는 덧셈'에서 8+5 = 8+2+3 = 10+3 형태로 직접 쓰여요.",
            "fit_slides": [
                  "summary"
            ]
      },
      {
            "id": "e_nine_split_review",
            "type": "extension",
            "icon": "⬆",
            "title": "9 가르기 복습 연결",
            "content": "1단원에서 익힌 9 가르기(1·8, 2·7, 3·6, 4·5)를 떠올리며 10 가르기로 한 단계 확장. 전시 학습과 본 차시를 잇는 다리.",
            "fit_slides": [
                  "review"
            ]
      },
      {
            "id": "g_make_ten_card",
            "type": "game",
            "icon": "🎮",
            "title": "10 만들기 카드 놀이 — 꾸러미 12·13",
            "content": "지도서 활동 5 원본. 꾸러미 12·13 놀이판 + 수 카드를 펼치고 짝지어 10을 만들면 카드로 덮어요. 2~4명. 인원에 따라 카드 수 조정(2명 18장, 3명 27장, 4명 36장).",
            "source": "교사용 지도서 활동 5, 꾸러미 12·13",
            "fit_slides": [
                  "card_arrange"
            ]
      },
      {
            "id": "g_finger_ten_pair",
            "type": "game",
            "icon": "🎮",
            "title": "손가락 10 짝꿍 — 짝 활동",
            "content": "두 명이 마주 보고 한 명이 손가락 N개를 펴면 다른 한 명이 10이 되도록 펴기. 1분 안에 가장 많이 맞춘 짝 찾기. 책상 없이 즉시 가능.",
            "fit_slides": [
                  "card_arrange",
                  "real_world"
            ]
      },
      {
            "id": "m_one_to_one_count",
            "type": "tip",
            "icon": "🧩",
            "title": "일대일대응 — 중복·누락 주의",
            "content": "사물의 수를 셀 때 사물 하나에 수 이름 하나가 일대일대응. 중복·누락 없이 세도록 지도해 주세요. (지도서 활동 1 유의점)",
            "fit_slides": [
                  "concept",
                  "basic_problem"
            ]
      },
      {
            "id": "m_skip_zero_ten",
            "type": "tip",
            "icon": "🧩",
            "title": "(0,10)·(10,0)은 다루지 않음",
            "content": "지도서 활동 4 명시: 0과 10, 10과 0 가르기는 다루지 않아요. 학생이 입력하면 \"맞아요. 다만 두 수로 갈라 보아요\"로 안내. 오답 처리 X.",
            "fit_slides": [
                  "advanced_problem",
                  "summary"
            ]
      },
      {
            "id": "m_card_count_per_player",
            "type": "tip",
            "icon": "🧩",
            "title": "놀이 카드 수 — 인원에 맞게",
            "content": "10 만들기 놀이 카드 수는 인원에 따라 달라요. 2명 18장 / 3명 27장 / 4명 36장. (지도서 활동 5 유의점)",
            "fit_slides": [
                  "card_arrange"
            ]
      },
      {
            "id": "m_expected_responses",
            "type": "tip",
            "icon": "🧩",
            "title": "학생 예상 반응 4가지 대비",
            "content": "(가) 여러 방법으로 가르기 못함 → 바둑돌·수 구슬 (나) 가르기 못함 → 다시 모으기 후 세기 (다) 빠르게 찾는 학생 → 카드·인원 증가 (라) 잘하는 학생 → 1~9 수 카드 + 꾸러미 12 확장. (지도서 학생 예상 반응 4건)",
            "fit_slides": [
                  "card_arrange",
                  "advanced_problem"
            ]
      },
      {
            "id": "m_two_readings",
            "type": "tip",
            "icon": "🧩",
            "title": "두 가지 읽기 — 열·십",
            "content": "10은 우리말 '열', 한자말 '십'. 한쪽만 강조 말고 두 가지를 같이 노출해 주세요. 한자말 '열여덟' 같은 한글 표기는 지양(지도서).",
            "fit_slides": [
                  "concept",
                  "basic_problem"
            ]
      },
      {
            "id": "m_concrete_first",
            "type": "tip",
            "icon": "🧩",
            "title": "구체물 먼저, 추상 나중",
            "content": "10 개념은 구체물(연결 모형·바둑돌)로 먼저 만져 본 다음 숫자·표기로 옮겨 가요. 화면만 보고 넘어가지 않도록 책상에 실물 한 번씩.",
            "fit_slides": [
                  "concept",
                  "visual_demo"
            ]
      },
      {
            "id": "m_ten_frame_value",
            "type": "tip",
            "icon": "🧩",
            "title": "십 배열판이 단단한 이유",
            "content": "5+5 구조의 십 배열판은 학생이 10을 '눈 한 번에 보는' 도구. 한 줄 5개 인식이 자리 잡으면 6·7·8·9가 '5와 몇'으로 자연스럽게 보여요.",
            "fit_slides": [
                  "visual_demo"
            ]
      },
      {
            "id": "m_partition_meaning",
            "type": "tip",
            "icon": "🧩",
            "title": "가르기는 뺄셈의 다리",
            "content": "10 가르기는 10에서 N을 뺀 결과를 찾는 행위와 같아요. 학생이 '10 가르기 3 = 7'을 알면 '10 - 3 = 7'을 자연스럽게 만나요.",
            "fit_slides": [
                  "concept",
                  "advanced_problem"
            ]
      },
      {
            "id": "m_pause_per_step",
            "type": "tip",
            "icon": "🧩",
            "title": "한 단계마다 잠깐 멈추기",
            "content": "10 개념 → 10 읽기 → 가르기 도입 사이에 잠깐 정지하고 학생 호흡을 한 번 챙겨 주세요. 80분 블록 차시는 호흡 관리가 핵심.",
            "fit_slides": [
                  "concept",
                  "summary"
            ]
      },
      {
            "id": "m_self_assess_kind",
            "type": "tip",
            "icon": "🧩",
            "title": "자기 평가는 자기 약속",
            "content": "별 평정은 점수가 아니라 '내가 어디까지 왔는지' 자기 약속. 별 1개라도 부끄러운 게 아니라 다음 시간 출발점이라고 알려 주세요.",
            "fit_slides": [
                  "question"
            ]
      },
      {
            "id": "m_eighty_min_pace",
            "type": "tip",
            "icon": "🧩",
            "title": "80분 블록 호흡 — 40·40 분리",
            "content": "전반 40분 = 10 개념(슬1~10), 후반 40분 = 10 가르기(슬11~18). 중간에 화장실·물 휴식 5분 권장. 한 번에 통째로 진행하지 말아 주세요.",
            "fit_slides": [
                  "objective",
                  "summary"
            ]
      },
      {
            "id": "m_five_and_five",
            "type": "tip",
            "icon": "🧩",
            "title": "5와 5가 특별한 이유",
            "content": "10 가르기 9가지 중 (5,5)만 같은 수. 카드 매칭 놀이에서 '5는 짝이 없다'는 점이 학생에게 자연스러운 발견 자리. 의도적으로 짚어 주세요.",
            "fit_slides": [
                  "card_arrange",
                  "summary"
            ]
      },
      {
            "id": "b_ten_pebbles",
            "type": "book",
            "icon": "📖",
            "title": "『열 개의 작은 조약돌』",
            "content": "10이라는 수가 이야기 속에서 나뉘고 모이는 과정을 그림으로 보여 주는 그림책 분류. 학교 도서관·시립 도서관에서 비슷한 제목 검색.",
            "source": "여러 그림책 — 교사 선택",
            "fit_slides": [
                  "motivate",
                  "summary"
            ]
      },
      {
            "id": "b_count_to_ten",
            "type": "book",
            "icon": "📖",
            "title": "『1부터 10까지』 그림책",
            "content": "수 1부터 10까지를 그림으로 천천히 보여 주는 입문 그림책. 차시 시작 전 한 권 미리 읽어 두면 도입이 부드러워져요.",
            "source": "여러 그림책 — 교사 선택",
            "fit_slides": [
                  "motivate"
            ]
      },
      {
            "id": "x_one_split_answer",
            "type": "misconception",
            "icon": "❓",
            "title": "오개념: 가르기 답이 하나",
            "content": "10을 \"3과 7로만 가른다\"는 식의 단일 정답 오해. 사실 (1,9)~(9,1) 9가지 모두 정답. 여러 답 인정해 주세요.",
            "fit_slides": [
                  "advanced_problem",
                  "summary"
            ]
      },
      {
            "id": "x_order_matters_split",
            "type": "misconception",
            "icon": "❓",
            "title": "오개념: 3과 7 = 7과 3?",
            "content": "학생이 \"(3,7)과 (7,3)은 같다\"고 합칠 수 있어요. 1학년 자리에서는 \"순서가 다르면 다른 답으로 둘 다 적자\"로 두 가지 다 인정해 주세요.",
            "fit_slides": [
                  "advanced_problem"
            ]
      },
      {
            "id": "x_ten_after_one",
            "type": "misconception",
            "icon": "❓",
            "title": "오개념: 10은 한 자리 수",
            "content": "학생이 10을 '한 자리 수'로 오인할 수 있어요. 10은 두 자리 수의 시작점. 04차 십몇에서 '10개씩 묶음 1과 낱개 0'으로 다시 정리할 자리.",
            "fit_slides": [
                  "concept",
                  "next_lesson"
            ]
      },
      {
            "id": "x_zero_in_partition",
            "type": "misconception",
            "icon": "❓",
            "title": "오개념: 0도 한 수다",
            "content": "학생이 (0,10)·(10,0)을 답으로 적을 수 있어요. 틀린 건 아니지만 \"오늘은 두 수로 갈라 보기로 했으니 다른 두 수도 해 볼까?\"로 부드럽게 안내.",
            "fit_slides": [
                  "advanced_problem"
            ]
      },
      {
            "id": "a_link_cube_split",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 연결 모형 10개 가르기",
            "content": "책상 위에 연결 모형 10개. 두 묶음으로 분리 → 결과 적기 → 다시 모으기 → 다른 방법으로 분리. 한 명당 9가지 자리 찾기 미션.",
            "fit_slides": [
                  "concept",
                  "advanced_problem"
            ]
      },
      {
            "id": "a_bingo_chip_count",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 바둑돌 10개 세기",
            "content": "검은 바둑돌 10개를 책상 위에 흩어 놓고 일대일대응으로 세기. 그 다음 5개씩 묶어 다시 세기. 묶음의 편리함 자연 인식.",
            "fit_slides": [
                  "visual_demo"
            ]
      },
      {
            "id": "a_ten_frame_paper",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 종이 십 배열판 만들기",
            "content": "흰 종이에 2×5 칸 직접 그리고 색칠로 N을 표시. 10이 어떻게 채워지는지 손으로 만든 십 배열판으로 직접 체험. 가정 연계용으로도 좋아요.",
            "fit_slides": [
                  "visual_demo"
            ]
      },
      {
            "id": "a_blank_card_pair",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 빈 카드에 1~9 적기",
            "content": "학생이 직접 1~9 숫자 카드 9장을 손으로 적고, 짝이 되는 두 수를 골라 합 10 확인. 자기 손으로 만든 학습 도구가 오래 기억돼요.",
            "fit_slides": [
                  "card_arrange"
            ]
      },
      {
            "id": "a_pair_walk",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 짝꿍 산책",
            "content": "교실을 걸어 다니며 친구의 수 카드를 보고 합 10이 되는 짝을 찾는 활동. 신체 활동 + 수 가르기 결합. 1단원 짝 찾기 변형.",
            "fit_slides": [
                  "card_arrange",
                  "real_world"
            ]
      },
      {
            "id": "a_color_ten",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 10칸 두 색 칠하기",
            "content": "수학익힘 69쪽 6번 자리. 10칸을 빨강·파랑 두 색으로 칠하고 빈칸에 알맞은 수 적기. 자유 정답 9가지 인정.",
            "fit_slides": [
                  "advanced_problem"
            ]
      },
      {
            "id": "a_count_in_room",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 교실에서 10 찾기",
            "content": "\"교실에서 10개인 것을 찾아보자\" 미션. 책상 위 연필 10자루·서랍 속 사물·게시판 자석 10개 등. 발견한 친구가 발표.",
            "fit_slides": [
                  "real_world",
                  "advanced_problem"
            ]
      },
      {
            "id": "a_split_story",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 가르기 이야기 만들기",
            "content": "\"엄마가 사탕 10개를 주셨어. 동생과 나는 어떻게 나누면 좋을까?\" 가르기 결과로 이야기 한 문장 만들기. 수학 + 말하기.",
            "fit_slides": [
                  "advanced_problem"
            ]
      },
      {
            "id": "a_supplement_make_ten",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 보충 학습지 (꾸러미 1-1-5_02~03)",
            "content": "수 카드 1~9 + 꾸러미 12 활용 보충 학습지. 정규 활동 후 더 익히고 싶은 학생을 위한 자리. (지도서 학생 예상 반응 (라) 자리)",
            "source": "교사용 지도서 활동 5 보충, 꾸러미 1-1-5_02~03차시",
            "fit_slides": [
                  "card_arrange"
            ]
      },
      {
            "id": "a_count_skip_five",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 5씩 묶어 세기",
            "content": "10개 사물을 5개씩 두 묶음으로 묶어 세기. \"하나, 둘, ... 다섯! 여섯, 일곱, ... 열!\" 두 묶음 구조 체험. 이어 세기 사전 준비.",
            "fit_slides": [
                  "visual_demo"
            ]
      }
]
  };

  // ─────────── 4차시: 십몇을 알아볼까요 ───────────
  // std [2수01-01][2수01-03]. 빙수 맥락. 10 복습 → 십몇(11~19) 만들기·세 가지 표현.
  LESSONS["u5_l04"] = {
    meta: {
      title: "1학년 수학 5단원 4차시",
      subtitle: "십몇을 알아볼까요",
      std: "[2수01-01] [2수01-03]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 본 차시 시작\n십몇을 알아볼까요\n🍧 빙수로 알아봐요",emoji:""},suggested_extras:["v_teens_intro","q_my_lucky_teen"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"빙수에 과일을 올려요",kids:[{face:"🍧",label:"빙수"},{face:"🍓",label:"딸기"},{face:"🙂",label:"몇 개?"}],question:"빙수에 올린 과일이\n**모두 몇 개**일까요?\n10개와 몇 개로 나누어 세어 봐요."},suggested_extras:["e_place_value_intro"]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**십몇** — 11부터 19까지의 수\n10개씩 **묶음 1개**와 **낱개 몇 개**로 봐요\n그림 → 말 → 수로 나타내요"},suggested_extras:[]},
  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"10을 기억해요",bidirect:["⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫ (10개)","↓","10개씩 **묶음 1개**","낱개가 없으면 **10**"]},suggested_extras:["m_three_links","x_unit_confusion","r_apartment_floor"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"12를 만들어 봐요",bidirect:["묶음 1개 (10)","+","낱개 2개","↓","**10과 2로 12**"]},suggested_extras:["m_three_links","x_teen_as_two_digits"]},
  {id:"s05b",stage:"전개",block:"klab",data:{title:"직접 묶어서 12를 만들어 봐요",tool:"place_value",config:{max:19}},suggested_extras:["m_three_links","x_teen_as_two_digits"]},
  {id:"s06",stage:"전개",block:"visual_demo",data:{title:"12를 세 가지로 나타내요",ten_frame_solo:{count:12,is_anchor:true,label:"**그림**으로 12개\n**말**로 십이 / 열둘\n**수**로 12"},sub_text:"그림 → 말 → 수, 표현이 자라요"},suggested_extras:["m_array_recognition","a_link_cube_teens","m_choose_tool"]},
  {id:"s07",stage:"전개",block:"concept",data:{title:"낱개를 늘려 봐요",bidirect:["10과 3 → 13","10과 4 → 14","10과 5 → 15","낱개가 1씩 늘면 **수도 1씩 커져요**"]},suggested_extras:["m_one_to_one_count_teen","r_fruit_shop_count"]},
  {id:"s08",stage:"전개",block:"arrow_flow",data:{title:"묶어 세면 더 빨라요",steps:["하나씩 세기 — 느려요","10개씩 **묶음**으로 보기","묶음 1개와 낱개 몇 개","**십몇**을 한눈에"]},suggested_extras:["r_pencil_dozen","m_no_korean_writing"]},
  // ===== 기본문제 (3) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"🍑 살구는 몇 개일까요?",question:"10개씩 묶음 **1개**와\n낱개 **4개**가 있어요.\n\n살구는 모두 몇 개?",answer:14,note:"10과 4로 14. 십사 / 열넷."},suggested_extras:["a_supp_count","a_o_marks"]},
  {id:"s09b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"앞의 1은 그냥 1이야",right:"십몇의 앞 1은 **10개씩 묶음 1개**(=10)예요.\n그냥 1이 아니에요.",hint:"묶음 1개는 10."},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"🍐 복숭아는 몇 개일까요?",question:"10개씩 묶음 **1개**와\n낱개 **6개**가 있어요.\n\n복숭아는 모두 몇 개?",answer:16,note:"10과 6으로 16."},suggested_extras:["r_book_eighteen"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"🍉 수박을 묶음과 낱개로",question:"수박 **17개**를\n10개씩 묶음 ▢개와\n낱개 ▢개로 나타내요.",answer:"묶음 1개, 낱개 7개",note:"17은 10개씩 1묶음과 낱개 7."},suggested_extras:["m_unit_changes"]},
  // ===== 응용문제 (4) =====
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"낱개를 몇 개 놓아야 할까요?",question:"묶음 1개가 놓여 있어요.\n**15**를 만들려면\n낱개를 ▢개 더 놓아야 해요.",answer:5,note:"10에 5를 더 놓으면 15. 낱개 5개."},suggested_extras:["a_supp_two_to_one","m_concrete_repeat"]},
  {id:"s13",stage:"응용문제",block:"card_arrange",data:{title:"짝을 지어 봐요",steps:["그림 카드 — 묶음 1개와 낱개 8개","말 카드 — 십팔 / 열여덟","수 카드 — 18","세 카드를 **같은 수끼리** 짝지어요"]},suggested_extras:["g_teen_card_match"]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"빙수에 산딸기를 더 넣어 봐요",content:"지금 **13개**가 있어요.\n산딸기를 **1개 더** 넣으면?\n\n1만큼 더 큰 수는 ▢"},suggested_extras:["a_bingsu_dragdrop","m_free_count_first","a_classroom_count_teens"]},
  {id:"s15",stage:"응용문제",block:"advanced_problem",data:{title:"누가 더 많이 가지고 있을까요?",question:"친구 A — 묶음 1개와 낱개 6개\n친구 B — 묶음 1개와 낱개 3개\n\n누가 더 많을까요? 왜 그럴까요?",answer:"친구 A (16 > 13)",note:"묶음 수 같으면 낱개로 비교. A=16, B=13."},suggested_extras:["a_pair_compare","x_compare_by_digits","q_ten_plus_what"]},
  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"십몇을 정리해 봐요",points:["**십몇** — 10개씩 묶음 1개와 낱개 몇 개","11~19는 **십일~십구**, **열하나~열아홉**","그림·말·수 세 가지로 나타낼 수 있어요","낱개가 1 늘면 수도 1 커져요"]},suggested_extras:["b_count_to_twenty","e_place_value_intro"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"십몇을 묶음과 낱개로 말할 수 있나요?\n십몇을 두 가지 말로 읽을 수 있나요?\n1만큼 더 큰 수를 찾을 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**모으기와 가르기**로\n십몇을 두 수로 나눠 봐요!",emoji:""},suggested_extras:["e_to_tens"]}
    ],
    extras: [
      {
            "id": "v_teens_intro",
            "type": "video",
            "icon": "🎥",
            "title": "십몇 알아보기 영상",
            "url": "https://www.youtube.com/results?search_query=십몇+알아보기+초등+1학년+10개씩+묶음",
            "description": "10개씩 묶음과 낱개로 십몇을 만드는 과정을 보여 주는 영상. 도입에서 한 번 함께 보면 좋아요.",
            "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
            "fit_slides": [
                  "motivate",
                  "concept"
            ]
      },
      {
            "id": "r_apartment_floor",
            "type": "real_world",
            "icon": "🌍",
            "title": "아파트 12층·15층",
            "content": "아파트·건물 층수에 십몇이 자주 나와요. 12층·15층·18층 등. \"우리 집은 몇 층이야?\" 발문으로 시작하면 자연스러워요.",
            "fit_slides": [
                  "concept",
                  "real_world"
            ]
      },
      {
            "id": "r_age_thirteen",
            "type": "real_world",
            "icon": "🌍",
            "title": "형·누나는 13살",
            "content": "학생 가족의 형·누나·언니 나이가 11~19살. 나이로 십몇을 만나는 가장 가까운 자리. \"네 형은 몇 살이야?\" 발문.",
            "fit_slides": [
                  "concept",
                  "advanced_problem"
            ]
      },
      {
            "id": "r_fruit_shop_count",
            "type": "real_world",
            "icon": "🌍",
            "title": "과일 가게 세어 보기",
            "content": "지도서 활동 2 원본. 살구 17·복숭아 13·수박 16·참외 19. 10개씩 묶어 세는 것이 흩어진 채로 세는 것보다 훨씬 빠름을 일상 맥락으로 체험.",
            "fit_slides": [
                  "concept",
                  "visual_demo"
            ]
      },
      {
            "id": "r_book_eighteen",
            "type": "real_world",
            "icon": "🌍",
            "title": "책 18권",
            "content": "책꽂이에 책이 18권. 10권은 한 단에 채우고 8권은 옆 자리. 자연스럽게 '10권 묶음 + 낱권 8'로 보여요.",
            "fit_slides": [
                  "concept",
                  "basic_problem"
            ]
      },
      {
            "id": "r_pencil_dozen",
            "type": "real_world",
            "icon": "🌍",
            "title": "연필 한 다스 12자루",
            "content": "연필 한 다스는 12자루. 학생이 학용품에서 만나는 십몇. '한 다스 = 12'를 알면 자릿값이 일상으로 들어와요.",
            "fit_slides": [
                  "basic_problem",
                  "real_world"
            ]
      },
      {
            "id": "q_ten_plus_what",
            "type": "fun_question",
            "icon": "💡",
            "title": "10에 몇을 더하면?",
            "content": "\"10에 3을 더하면 몇이 될까?\" 손가락 양손 다 펴고 3개 더. 12·13·14... 손가락 + 친구 손가락으로 즉시 확인.",
            "fit_slides": [
                  "concept"
            ]
      },
      {
            "id": "q_my_lucky_teen",
            "type": "fun_question",
            "icon": "💡",
            "title": "내가 좋아하는 십몇",
            "content": "\"11~19 중에 가장 좋아하는 수는?\" 학생마다 다른 답이 나오고, 그 수가 '10과 몇'으로 어떻게 만들어지는지 짝과 이야기.",
            "fit_slides": [
                  "motivate",
                  "advanced_problem"
            ]
      },
      {
            "id": "e_to_tens",
            "type": "extension",
            "icon": "⬆",
            "title": "다음은 몇십 — 06차 연결",
            "content": "10개씩 묶음 1개 자리를 단단히 알면 '10개씩 묶음 2개·3개...' 자리(06차)가 자연스럽게 이어져요. 자릿값 4단계의 두 번째 자리.",
            "fit_slides": [
                  "next_lesson",
                  "summary"
            ]
      },
      {
            "id": "e_place_value_intro",
            "type": "extension",
            "icon": "⬆",
            "title": "자릿값 첫 만남 — 단원 핵심",
            "content": "이 차시가 1학년 자릿값 개념 도입의 시작. 10개씩 묶음·낱개 구조는 2학년 두 자리 수·세 자리 수 학습의 토대. 단원 중 가장 무게 있는 자리.",
            "fit_slides": [
                  "objective",
                  "summary"
            ]
      },
      {
            "id": "g_teen_card_match",
            "type": "game",
            "icon": "🎮",
            "title": "십몇 카드 짝짓기",
            "content": "숫자 카드 12·15·18 등과 그림 카드(10묶음 + 낱개 N) 짝지어 뒤집기. 메모리 게임 변형. 2~4명. 책상 한쪽에서 4~5분 정도면 끝.",
            "fit_slides": [
                  "card_arrange",
                  "question"
            ]
      },
      {
            "id": "m_one_to_one_count_teen",
            "type": "tip",
            "icon": "🧩",
            "title": "묶음으로 세면 빨라요",
            "content": "10개씩 묶어 세기는 흩어진 채로 세는 것보다 빠르고 정확. 학생이 \"왜 묶어요?\"라고 물으면 일부러 흩어 놓고 둘 다 세어 비교 보여 주세요.",
            "fit_slides": [
                  "concept",
                  "visual_demo"
            ]
      },
      {
            "id": "m_no_korean_writing",
            "type": "tip",
            "icon": "🧩",
            "title": "'열여덟' 한글 쓰기 지양",
            "content": "지도서 명시: 저학년 한글 학습 정도를 고려해 '열여덟·열아홉' 같은 한글 표기는 지양해 주세요. 학생 입력은 숫자(18, 19)만.",
            "fit_slides": [
                  "concept",
                  "basic_problem"
            ]
      },
      {
            "id": "m_three_links",
            "type": "tip",
            "icon": "🧩",
            "title": "모델·기호·용어 3중 연결",
            "content": "지도서 핵심: 12개 그림(모델) ↔ 숫자 12(기호) ↔ '십이/열둘'(용어). 한 슬에서 세 가지를 같이 보여 줘야 추상화가 단단해져요.",
            "fit_slides": [
                  "concept",
                  "visual_demo"
            ]
      },
      {
            "id": "m_array_recognition",
            "type": "tip",
            "icon": "🧩",
            "title": "직사각형 → 선형 → 흩어진",
            "content": "지도서 명시: 학생은 일반적으로 직사각형 배열 → 선형 배열 → 흩어진 배열 순으로 수를 인식해요. 십 배열판이 가장 단단한 이유.",
            "fit_slides": [
                  "visual_demo"
            ]
      },
      {
            "id": "m_choose_tool",
            "type": "tip",
            "icon": "🧩",
            "title": "10개씩 묶을 수 있는 교구로",
            "content": "수 세기 칩·연결 모형·십 배열판·산가지·바둑돌 모두 가능. 단, '10개씩 묶음으로 나타낼 수 있는' 교구만 골라 주세요. (지도서)",
            "fit_slides": [
                  "concept",
                  "visual_demo"
            ]
      },
      {
            "id": "m_unit_changes",
            "type": "tip",
            "icon": "🧩",
            "title": "단위는 바뀌어요 — 명·권·자루",
            "content": "수 세기 대상에 따라 단위와 읽는 표현이 바뀌어요. 사람 12명·책 12권·연필 12자루. 학생이 단위까지 자연스럽게 말하도록.",
            "fit_slides": [
                  "real_world"
            ]
      },
      {
            "id": "m_concrete_repeat",
            "type": "tip",
            "icon": "🧩",
            "title": "반복 말하기보다 다양한 표현",
            "content": "지도서 명시: 단순히 말하고 읽기 반복보다 다양한 구체물을 10개씩 묶음 + 낱개로 표현하고 수로 나타내는 활동이 수 감각 형성에 효과적.",
            "fit_slides": [
                  "concept",
                  "basic_problem"
            ]
      },
      {
            "id": "m_free_count_first",
            "type": "tip",
            "icon": "🧩",
            "title": "자유 표현 시간 충분히",
            "content": "활동 3 자리(슬14)에서 학생이 원하는 만큼 자유롭게 표현할 시간을 충분히 주세요. 3개·4개 등 다양한 예를 미리 보여 주면 안심해요.",
            "fit_slides": [
                  "advanced_problem"
            ]
      },
      {
            "id": "b_count_to_twenty",
            "type": "book",
            "icon": "📖",
            "title": "『1부터 20까지』 그림책",
            "content": "수 1부터 20까지 그림책. 십몇 구간에서 '10과 몇' 구조가 자연스럽게 드러나는 그림책을 학교 도서관에서 찾아보세요.",
            "source": "여러 그림책 — 교사 선택",
            "fit_slides": [
                  "motivate",
                  "summary"
            ]
      },
      {
            "id": "x_teen_as_two_digits",
            "type": "misconception",
            "icon": "❓",
            "title": "오개념: 12를 '1과 2'로 읽음",
            "content": "학생이 12를 \"일이\" 또는 \"하나둘\"로 읽을 수 있어요. 12는 '10과 2'이지 '1과 2'가 아니에요. 10개씩 묶음의 '1'이 곧 10임을 시각으로 다시.",
            "fit_slides": [
                  "concept",
                  "basic_problem"
            ]
      },
      {
            "id": "x_unit_confusion",
            "type": "misconception",
            "icon": "❓",
            "title": "오개념: '13은 1과 3'",
            "content": "학생이 13을 \"1과 3을 합친 수\"로 오해할 수 있어요. 13은 '10과 3'. 자릿값의 첫 만남에서 가장 흔한 오개념. 슬5의 시각화로 다시.",
            "fit_slides": [
                  "concept",
                  "advanced_problem"
            ]
      },
      {
            "id": "x_compare_by_digits",
            "type": "misconception",
            "icon": "❓",
            "title": "오개념: 자릿수 = 크기 아님",
            "content": "\"십몇은 다 같은 두 자리니까 비슷한 수\"라고 오인할 수 있어요. 14와 18은 같은 두 자리지만 18이 더 큼. 낱개 수가 크기를 결정.",
            "fit_slides": [
                  "compare",
                  "advanced_problem"
            ]
      },
      {
            "id": "a_bingsu_dragdrop",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 빙수에 과일 자유로 붙이기",
            "content": "지도서 활동 3 원본. 꾸러미 11 붙임딱지를 빙수 그릇에 자유로 붙이고, '내 과일은 모두 몇 개야?' 친구에게 이야기. 자율 + 표현.",
            "source": "교사용 지도서 활동 3, 꾸러미 11",
            "fit_slides": [
                  "advanced_problem",
                  "real_world"
            ]
      },
      {
            "id": "a_link_cube_teens",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 연결 모형 십몇 만들기",
            "content": "연결 모형 10개씩 막대 1개 + 낱개 N개로 11~19 만들기. 학생이 직접 손으로 만든 십몇이 가장 오래 기억돼요.",
            "fit_slides": [
                  "concept",
                  "visual_demo"
            ]
      },
      {
            "id": "a_supp_count",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 보충1 (연결 모형 세기)",
            "content": "수를 세어 쓰고 읽기 어려워하는 학생용 활동지. 1-1-5_04차시_보충1. 연결 모형의 수를 세고, 그만큼 다시 나타내는 자리.",
            "source": "교사용 지도서 학생 예상 반응",
            "fit_slides": [
                  "basic_problem"
            ]
      },
      {
            "id": "a_supp_two_to_one",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 보충2 (묶음·낱개 → 수)",
            "content": "10개씩 묶음과 낱개로 나타냈지만 하나의 수로 못 쓰는 학생용. 1-1-5_04차시_보충2. 묶음 1 + 낱개 7 → 17 자리로 옮기는 연습.",
            "source": "교사용 지도서 학생 예상 반응",
            "fit_slides": [
                  "basic_problem",
                  "advanced_problem"
            ]
      },
      {
            "id": "a_classroom_count_teens",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 교실에서 십몇 찾기",
            "content": "지도서 확장·가정 연계. \"교실에서 11~19개인 것을 찾아보자\" 미션. 책 13권·연필 16자루·블록 18개 등. 발견 → 발표 → 친구 검증.",
            "fit_slides": [
                  "real_world",
                  "advanced_problem"
            ]
      },
      {
            "id": "a_pair_compare",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — 짝과 수 비교하기",
            "content": "지도서 활동 4 변형. 활동 3에서 붙인 과일 수를 짝과 비교하기. ○ 표시 후 \"내 수가 ▢보다 (큽니다·작습니다·같습니다)\" 한 문장.",
            "fit_slides": [
                  "compare"
            ]
      },
      {
            "id": "a_o_marks",
            "type": "other_activity",
            "icon": "📚",
            "title": "다른 활동 — ○ 표시 일대일대응",
            "content": "잘 못 세는 학생을 위한 기본 자리. 일대일대응으로 ○를 그려가며 세기, 그 다음 10개씩 묶어 다시 세기. 가장 안전한 보완 자리.",
            "fit_slides": [
                  "basic_problem"
            ]
      }
]
  };

  // ─────────── 5차시: 모으기와 가르기를 해 볼까요 ───────────
  // std [2수01-04]. 조개껍데기 맥락. 십몇 범위의 모으기·가르기(여러 답).
  LESSONS["u5_l05"] = {
    meta: {
      title: "1학년 수학 5단원 5차시",
      subtitle: "모으기와 가르기를 해 볼까요",
      std: "[2수01-04]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 본 차시 시작\n모으기와 가르기를 해 볼까요\n🐚 조개껍데기로 알아봐요",emoji:""},suggested_extras:["v_count_on_gather","r_seashell_necklace","b_count_to_nineteen"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"조개껍데기로 목걸이를 만들어요",kids:[{face:"🐚",label:"한 묶음"},{face:"🐚",label:"또 한 묶음"},{face:"🙂",label:"모두?"}],question:"두 묶음의 조개를 **모으면**\n모두 몇 개가 될까요?"},suggested_extras:["r_seashell_necklace","q_my_teen_split"]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**모으기** — 두 묶음을 하나로 합치기\n**가르기** — 한 묶음을 둘로 나누기\n십몇에서도 같은 방법이에요"},suggested_extras:["m_many_splits_ok"]},
  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"두 묶음을 모아 봐요",bidirect:["🐚 8개","+","🐚 5개","↓","두 수를 **모으면 13**"]},suggested_extras:["m_one_to_one_count_teens","a_actual_seashell"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"큰 수부터 이어 세면 빨라요",bidirect:["8과 5를 모을 때","8에서 시작 → 9,10,11,12,13","**큰 수 8부터** 이어 세기","하나씩 다 세지 않아도 돼요"]},suggested_extras:["m_count_on_from_larger","x_count_again_from_start"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"한 묶음을 둘로 갈라 봐요",bidirect:["🐚🐚 13개","↓","왼쪽 그릇 🐚 (몇 개)","오른쪽 그릇 🐚 (나머지)","한 수를 **둘로 나누면 가르기**"]},suggested_extras:["m_many_splits_ok","x_one_split_only"]},
  {id:"s07",stage:"전개",block:"compare",data:{title:"13을 갈라요 — 여러 방법이 있어요",items:[{ten_frame:1,num:1,caption:"3과 10"},{ten_frame:2,num:2,caption:"6과 7",is_anchor:true},{ten_frame:3,num:3,caption:"9와 4"}]},suggested_extras:["m_zero_pair_acceptable","m_two_digit_one_digit","a_linking_cube_teens"]},
  {id:"s08",stage:"전개",block:"visual_demo",data:{title:"수로 나타내기",ten_frame_solo:{count:13,is_anchor:true,label:"**8과 5를 모으면 13**\n**13은 8과 5로 가르기**"},sub_text:"모으기 ↔ 가르기는 서로 반대"},suggested_extras:["m_linear_arrangement","r_apple_pick"]},
  // ===== 기본문제 (3) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"모두 몇 개일까요?",question:"왼쪽 🐚 **9개**\n오른쪽 🐚 **6개**\n\n두 묶음을 모으면 ▢개",answer:15,note:"9와 6을 모으면 15. 9에서 6 더 세기."},suggested_extras:["m_count_on_from_larger","a_finger_split"]},
  {id:"s09b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"큰 수에서 작은 수로만 갈라야 해",right:"두 묶음의 **순서를 바꿔도** 같은 수예요.\n8과 6 = 6과 8.",hint:"모으기는 순서를 바꿔도 합이 같아요."},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"14를 갈라요 — 한 묶음은 8",question:"**14**를 두 묶음으로 갈라요.\n한 묶음이 **8**이면\n다른 묶음은 ▢",answer:6,note:"14는 8과 6. 14−8=6."},suggested_extras:["a_supp_workbook"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"16을 갈라요 — 한 묶음은 9",question:"**16**을 두 묶음으로 갈라요.\n한 묶음이 **9**이면\n다른 묶음은 ▢",answer:7,note:"16은 9와 7. 16−9=7."},suggested_extras:["m_count_back_subtraction"]},
  // ===== 응용문제 (4) =====
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"두 묶음을 자유롭게 모아 봐요",challenge:"🐚 묶음을 자유롭게 골라\n**두 묶음을 모아** 봐요.\n친구와 만든 수가 다를 수 있어요.",note:"열린 활동. 예 — 7과 8을 모으면 15. 친구와 고른 두 묶음이 달라 합도 달라요."},suggested_extras:["r_buttons_share","x_order_diff_pair","q_secret_pair"]},
  {id:"s13",stage:"응용문제",block:"card_arrange",data:{title:"15를 두 수로 갈라요 — 3가지 찾기",steps:["🐚 15개를 둘로 갈라요","7과 8 / 6과 9 / 10과 5 …","서로 다른 **3가지**를 찾아요","모두 모으면 다시 15"]},suggested_extras:["a_dot_card_play","a_supp_split","r_candy_share_teens"]},
  {id:"s14",stage:"응용문제",block:"real_world",data:{title:"조개 11개를 두 어항에 나눠 봐요",scenario:{icon:"🐚",body:"조개 **11개**를\n어항 두 개에 나눠 담아요.\n\n왼쪽 ▢개 + 오른쪽 ▢개 = 11\n답이 **여러 가지** 가능해요"}},suggested_extras:["g_aquarium_play","r_classroom_share","a_pair_share"]},
  {id:"s15",stage:"응용문제",block:"question",data:{title:"거꾸로 세어 봐요",content:"15에서 시작해\n14, 13, 12 … 거꾸로 세어 봐요.\n\n가르기를 할 때\n**거꾸로 세기**가 도움이 돼요."},suggested_extras:["m_count_back_subtraction","e_to_addition_subtraction"]},
  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["**모으기** — 두 묶음을 합치면 한 수","**가르기** — 한 수를 두 묶음으로 나누기","가르기는 **여러 가지 답**이 가능해요","큰 수부터 이어 세면 빠르게 모을 수 있어요"]},suggested_extras:["b_count_to_nineteen","e_to_addition_subtraction","m_supp_workbook"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"십몇을 두 수로 모을 수 있나요?\n한 수를 여러 방법으로 가를 수 있나요?\n큰 수부터 이어 세기를 해 봤나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**10개씩 묶어** 세어\n50까지의 수를 알아봐요!",emoji:""},suggested_extras:["e_two_digit_pair_intro","g_card_match_game"]}
    ],
    extras: [
      {
          "id": "v_count_on_gather",
          "type": "video",
          "icon": "🎥",
          "title": "이어 세기·모으기 영상",
          "url": "https://www.youtube.com/results?search_query=이어세기+모으기+초등+1학년",
          "description": "두 묶음을 모을 때 큰 수부터 이어 세는 방법을 보여 주는 영상. 도입 또는 활동 1 사이에 한 번 함께 보면 좋아요.",
          "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
          "fit_slides": [
              "cover",
              "motivate",
              "concept"
          ]
      },
      {
          "id": "r_seashell_necklace",
          "type": "real_world",
          "icon": "🌍",
          "title": "조개껍데기 목걸이",
          "content": "바닷가에서 모은 조개로 목걸이를 만드는 장면은 학생이 한 번쯤 만난 경험. 줄무늬 조개와 무늬 없는 조개를 따로 세어 보고 합치는 자연스러운 모으기 사례.",
          "fit_slides": [
              "cover",
              "motivate"
          ]
      },
      {
          "id": "r_buttons_share",
          "type": "real_world",
          "icon": "🌍",
          "title": "단추 모으기·나누기",
          "content": "바느질 통 안 단추를 두 묶음으로 갈라 보고 다시 모아 보는 활동. 자유롭게 가를 수 있어 다양한 답이 나오는 자리. 가정 연계로도 좋아요.",
          "fit_slides": [
              "advanced_problem",
              "real_world"
          ]
      },
      {
          "id": "r_apple_pick",
          "type": "real_world",
          "icon": "🌍",
          "title": "사과 따기 — 두 바구니",
          "content": "가을 사과 농장에서 두 바구니에 나누어 따 온 사과를 한곳에 모으는 장면. 8개와 5개를 합쳐 13개, 13개를 다시 둘로 나누는 일이 한 번에 보여요.",
          "fit_slides": [
              "visual_demo",
              "concept"
          ]
      },
      {
          "id": "r_classroom_share",
          "type": "real_world",
          "icon": "🌍",
          "title": "공깃돌 모둠 나누기",
          "content": "학교 쉬는 시간에 공깃돌 11개를 두 친구에게 나누어 주는 장면. 답이 여러 가지 가능한 자연스러운 가르기 자리. 어항 활동과 같은 구조.",
          "fit_slides": [
              "real_world",
              "advanced_problem"
          ]
      },
      {
          "id": "r_candy_share_teens",
          "type": "real_world",
          "icon": "🌍",
          "title": "사탕 13개 가족 나누기",
          "content": "사탕 13개를 가족이 함께 나누는 자리. (5·8) (6·7) (4·9) (10·3) — 가족 인원과 상황에 따라 답이 달라져요. 가정에서 직접 해 볼 수 있는 활동.",
          "fit_slides": [
              "compare",
              "card_arrange"
          ]
      },
      {
          "id": "q_my_teen_split",
          "type": "fun_question",
          "icon": "💡",
          "title": "내가 좋아하는 수 가르기",
          "content": "11~19 중 내가 좋아하는 수를 하나 골라 봐요. 그 수를 두 묶음으로 갈라 보면 어떤 짝이 나올까요? 친구와 다른 답이 나와도 다 정답.",
          "fit_slides": [
              "motivate",
              "objective"
          ]
      },
      {
          "id": "q_secret_pair",
          "type": "fun_question",
          "icon": "💡",
          "title": "비밀 짝꿍 찾기",
          "content": "16의 비밀 짝꿍은? (8과 8) (7과 9) (10과 6) (1과 15) … 16을 만드는 두 수 짝꿍을 최대한 많이 찾아 봐요. 짝꿍 사냥 놀이.",
          "fit_slides": [
              "real_world",
              "advanced_problem"
          ]
      },
      {
          "id": "e_to_addition_subtraction",
          "type": "extension",
          "icon": "⬆",
          "title": "덧셈·뺄셈으로 이어져요",
          "content": "이 차시의 모으기는 곧 덧셈(8+5=13), 가르기는 곧 뺄셈(13-8=5)의 기초. 거꾸로 세기 전략은 이후 받아내림이 있는 뺄셈에서 다시 만나요. 단원 간 연결.",
          "fit_slides": [
              "summary",
              "question"
          ]
      },
      {
          "id": "e_two_digit_pair_intro",
          "type": "extension",
          "icon": "⬆",
          "title": "두 자리+한 자리 가르기 미리 보기",
          "content": "13 = 10과 3. 십몇을 (10, 낱개)로 가르는 방식은 이후 받아올림 있는 (몇)+(몇)의 핵심 전략. 지도서는 이 방식도 정답으로 인정하라고 안내해요.",
          "fit_slides": [
              "next_lesson",
              "compare"
          ]
      },
      {
          "id": "g_card_match_game",
          "type": "game",
          "icon": "🎮",
          "title": "가르기 카드 찾기 놀이",
          "content": "지도서 '이런 활동도 해 봐요' 자리. 3명이 한 모둠. 11~18 안 한 수를 가르기 한 점 카드를 펼쳐 놓고, 카드 짝(예: 6점·7점=13)을 빠르게 찾기. 5번 반복 후 점수 비교.",
          "source": "교사용 지도서 5단원 5차시 — 이런 활동도 해 봐요",
          "fit_slides": [
              "next_lesson",
              "card_arrange"
          ]
      },
      {
          "id": "g_aquarium_play",
          "type": "game",
          "icon": "🎮",
          "title": "어항 꾸미기 게임화",
          "content": "조개 붙임딱지 11개를 어항 2개에 나누어 붙이는 활동을 모둠 대결로. 각자 다른 답을 만들고 모두 발표 → 가장 많은 친구가 만든 답·가장 독특한 답에 박수.",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "m_count_on_from_larger",
          "type": "tip",
          "icon": "🧩",
          "title": "큰 수부터 이어 세기",
          "content": "8과 5를 모을 때 8에서 시작하면 9·10·11·12·13 — 다섯 번만 세요. 작은 수부터 시작하면 여덟 번. 큰 수를 먼저 정하는 습관이 효율적 수 감각의 기초.",
          "fit_slides": [
              "concept",
              "basic_problem"
          ]
      },
      {
          "id": "m_one_to_one_count_teens",
          "type": "tip",
          "icon": "🧩",
          "title": "일대일대응 세기",
          "content": "십몇을 셀 때 수 이름과 구체물을 하나씩 짚으며 세고 마지막에 말한 수가 전체 개수임을 분명히. 1단원 한 자리 수 세기와 같은 원리, 범위만 19까지 확장.",
          "fit_slides": [
              "concept",
              "basic_problem"
          ]
      },
      {
          "id": "m_count_back_subtraction",
          "type": "tip",
          "icon": "🧩",
          "title": "거꾸로 세기 = 뺄셈 모델",
          "content": "가르기를 할 때 시작 수에서 한쪽 묶음만큼 거꾸로 세면 다른 묶음이 나와요. 이 거꾸로 세기 전략은 이후 학습에서 뺄셈의 모델로 다시 등장.",
          "fit_slides": [
              "basic_problem",
              "question"
          ]
      },
      {
          "id": "m_many_splits_ok",
          "type": "tip",
          "icon": "🧩",
          "title": "가르기 답은 여러 가지",
          "content": "한 수의 가르기는 답이 여러 개. 13 = (5·8) (6·7) (4·9) (3·10) (10·3) … 어떤 답을 말해도 합이 맞으면 다 정답. 학생이 자기 답을 자신 있게 발표하도록.",
          "fit_slides": [
              "objective",
              "concept",
              "advanced_problem"
          ]
      },
      {
          "id": "m_zero_pair_acceptable",
          "type": "tip",
          "icon": "🧩",
          "title": "(13, 0)·(0, 13)도 인정",
          "content": "지도서 명시: 0과 13, 13과 0으로 가르기 하는 것을 적극 다루지는 않지만 자연수와 0을 배운 이후이므로 학생이 (13, 0)·(0, 13)으로 답해도 맞는 것으로 인정.",
          "source": "교사용 지도서 5단원 5차시 — 활동 2 유의점",
          "fit_slides": [
              "compare",
              "advanced_problem"
          ]
      },
      {
          "id": "m_two_digit_one_digit",
          "type": "tip",
          "icon": "🧩",
          "title": "두 자리+한 자리 가르기 인정",
          "content": "13을 (10, 3)·(3, 10)으로 가르는 답도 정답. 이는 이후 받아올림이 있는 (몇)+(몇)의 기초 개념과 연결. 지도서 권장 자리.",
          "source": "교사용 지도서 5단원 5차시 — 활동 2 유의점",
          "fit_slides": [
              "compare",
              "card_arrange"
          ]
      },
      {
          "id": "m_supp_workbook",
          "type": "tip",
          "icon": "🧩",
          "title": "보충 활동지 활용",
          "content": "활동지 1-1-5_05차시_보충1 = 모으기 결과 수로 쓰기 / 보충2 = 제시 수만큼 가르기. 어려워하는 학생에게 개별 적용. 놀이판은 잘 하는 학생용.",
          "fit_slides": [
              "summary",
              "basic_problem"
          ]
      },
      {
          "id": "m_linear_arrangement",
          "type": "tip",
          "icon": "🧩",
          "title": "바둑돌 선형 배열",
          "content": "바둑돌을 흩어진 채로 두지 말고 한 줄로 늘어놓고 세기. 빠뜨림·중복을 크게 줄여 줘요. 학생이 모으기 결과 쓰기를 어려워할 때 효과적.",
          "source": "교사용 지도서 5단원 5차시 — 학생 예상 반응",
          "fit_slides": [
              "visual_demo",
              "concept"
          ]
      },
      {
          "id": "b_count_to_nineteen",
          "type": "book",
          "icon": "📖",
          "title": "『수가 자라요』·『1부터 20까지』",
          "content": "수 1~20 범위 그림책. 모으기·가르기를 직접 다루지는 않지만 십몇 범위에서 수가 어떻게 자라는지 보여 주는 그림책. 학교 도서관에서 찾아보세요.",
          "source": "여러 그림책 — 교사 선택",
          "fit_slides": [
              "cover",
              "summary"
          ]
      },
      {
          "id": "x_count_again_from_start",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 처음부터 다시 세기",
          "content": "학생이 모으기에서 두 묶음을 합친 뒤 1부터 다시 세는 경우. 한쪽 바둑돌을 다른 쪽으로 하나씩 옮기며 이어 세기를 시범 보여 주면 자연스럽게 전이.",
          "source": "교사용 지도서 5단원 5차시 — 학생 예상 반응",
          "fit_slides": [
              "concept",
              "basic_problem"
          ]
      },
      {
          "id": "x_one_split_only",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 가르기 답은 하나",
          "content": "가르기 답이 하나라고 오인하는 경우. 같은 수를 여러 방법으로 갈라 보는 경험을 충분히 제공. (5·8) (6·7) (4·9) 모두 맞다고 확인해 주세요.",
          "fit_slides": [
              "concept",
              "advanced_problem"
          ]
      },
      {
          "id": "x_order_diff_pair",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 순서 다르면 다른 답",
          "content": "(5·8)과 (8·5)를 다른 답으로 볼지 같은 답으로 볼지 1학년에는 둘 다 정답으로 인정. 짝의 순서는 만든 사람에 따라 자연스럽게 달라져요.",
          "fit_slides": [
              "advanced_problem",
              "compare"
          ]
      },
      {
          "id": "a_supp_workbook",
          "type": "other_activity",
          "icon": "📚",
          "title": "보충 1 — 부분 수만큼 바둑돌",
          "content": "각 부분 수만큼 바둑돌을 직접 놓고 모으기 결과를 수로 쓰는 활동지. 모으기 결과를 수로 표현하기 어려워하는 학생용. 활동지 1-1-5_05차시_보충1.",
          "source": "교사용 지도서 5단원 5차시 — 맞춤형 도움 자료",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_supp_split",
          "type": "other_activity",
          "icon": "📚",
          "title": "보충 2 — 제시 수만큼 가르기",
          "content": "제시된 수만큼 바둑돌을 놓고 두 묶음으로 가르는 활동지. 가르기 결과를 수로 나타내기 어려워하는 학생용. 활동지 1-1-5_05차시_보충2.",
          "source": "교사용 지도서 5단원 5차시 — 맞춤형 도움 자료",
          "fit_slides": [
              "card_arrange",
              "basic_problem"
          ]
      },
      {
          "id": "a_actual_seashell",
          "type": "other_activity",
          "icon": "📚",
          "title": "실물 조개·자갈 활동",
          "content": "교실 활동 자료. 조개껍데기·자갈·도토리 등 자연물을 두 묶음 모아 보고 한 묶음을 둘로 갈라 보기. 화면 활동 전후로 한 번 실물로 만져 보면 학생에게 깊이 남아요.",
          "fit_slides": [
              "concept",
              "motivate"
          ]
      },
      {
          "id": "a_finger_split",
          "type": "other_activity",
          "icon": "📚",
          "title": "손가락으로 모으기·가르기",
          "content": "학생 손가락 10개 + 친구 손가락 몇 개 = 십몇. 손가락은 1학년이 가장 친한 도구. 9+6을 자기 손·친구 손으로 직접 만들어 보기.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_linking_cube_teens",
          "type": "other_activity",
          "icon": "📚",
          "title": "연결 모형으로 가르기",
          "content": "연결 모형 13개를 한 줄로 연결한 다음 어디서 끊을지 학생이 직접 정하기. 끊는 자리에 따라 답이 달라지는 가르기 자리.",
          "fit_slides": [
              "compare"
          ]
      },
      {
          "id": "a_dot_card_play",
          "type": "other_activity",
          "icon": "📚",
          "title": "점 카드 가르기",
          "content": "지도서 '이런 활동도 해 봐요' 변형 — 점이 찍힌 카드(점 1~10)를 펼쳐 놓고 만들고 싶은 수를 짝지어 보기. 카드를 직접 만지며 답이 여러 개 나오는 경험.",
          "source": "교사용 지도서 5단원 5차시 — 이런 활동도 해 봐요",
          "fit_slides": [
              "card_arrange"
          ]
      },
      {
          "id": "a_pair_share",
          "type": "other_activity",
          "icon": "📚",
          "title": "짝 활동 — 답 비교",
          "content": "어항 활동을 짝과 함께. 11개를 두 어항에 어떻게 나누었는지 서로 보여 주고 답이 어떻게 다른지 발표. 다양한 답을 직접 확인하는 자리.",
          "fit_slides": [
              "real_world"
          ]
      }
    ]
  };

  // ─────────── 6차시: 10개씩 묶어 세어 볼까요 ───────────
  // std [2수01-01][2수01-03]. 바닷가 맥락. 몇십(20·30·40·50) 두 가지 읽기 + 비교 맛보기.
  LESSONS["u5_l06"] = {
    meta: {
      title: "1학년 수학 5단원 6차시",
      subtitle: "10개씩 묶어 세어 볼까요",
      std: "[2수01-01] [2수01-03]",
      duration: 40
    },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 본 차시 시작\n10개씩 묶어 세어 볼까요\n🏖️ 바닷가에서 알아봐요",emoji:""},suggested_extras:["v_count_by_tens","r_swimming_lane"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"바닷가에 사람이 많아요",kids:[{face:"🏖️",label:"바닷가"},{face:"👥",label:"사람들"},{face:"🙂",label:"몇 명?"}],question:"사람이 아주 많아요.\n하나씩 세면 너무 느려요.\n**더 빠른 방법**은 없을까요?"},suggested_extras:["m_grouping_motivation","q_my_school_count","r_classroom_chairs"]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**10개씩 묶어** 세기\n묶음 ▢개 → **몇십**\n20·30·40·50을 두 가지로 읽어요"},suggested_extras:["m_three_links_again","m_no_repeat_writing"]},
  // ===== 전개 (5) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"10개씩 묶음 2개는 얼마일까요?",bidirect:["10개씩 묶음 **2개**","↓","10, 20","낱개가 없으면 **20**"]},suggested_extras:["a_chip_twenty","x_ones_only"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"20을 두 가지로 읽어요",bidirect:["수 — 20","말 — **이십**","말 — **스물**","두 가지 모두 같은 수"]},suggested_extras:["m_two_readings_context","r_two_names_age"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"묶음을 더 늘려 봐요",bidirect:["묶음 3개 → 30 (삼십·서른)","묶음 4개 → 40 (사십·마흔)","묶음 5개 → 50 (오십·쉰)","묶음이 1개 늘면 **10씩 커져요**"]},suggested_extras:["m_thirty_inference","a_link_cube_thirty"]},
  {id:"s07",stage:"전개",block:"arrow_flow",data:{title:"10부터 50까지 한 줄에 봐요",steps:["10 → 20 → 30 → 40 → 50","묶음 1 → 2 → 3 → 4 → 5","**10씩** 뛰어 세기","수직선 위에서 자리를 찾아요"]},suggested_extras:["a_ten_frame_multi","g_tens_dice_play"]},
  {id:"s08",stage:"전개",block:"visual_demo",data:{title:"묶음이 곧 몇십이에요",ten_frame_solo:{count:40,is_anchor:true,label:"**묶음 4개 = 40**\n낱개 0개\n사십 / 마흔"},sub_text:"묶음 수를 보면 몇십을 바로 알 수 있어요"},suggested_extras:["m_zero_ones_confirm","e_place_value_position","a_count_classroom_things"]},
  // ===== 기본문제 (3) =====
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"튜브가 모두 몇 개일까요?",question:"10개씩 묶음 **2개**가 있어요.\n\n튜브는 모두 ▢개",answer:20,note:"10개씩 2묶음은 20. 이십 / 스물."},suggested_extras:["a_tube_count","r_egg_carton"]},
  {id:"s09b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"묶음 3개는 3이야",right:"10개씩 **묶음 3개는 30**.\n묶음 하나가 10이에요.",hint:"몇십은 묶음 수에 0을 붙여요."},suggested_extras:[]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"구명조끼가 모두 몇 개일까요?",question:"10개씩 묶음 **4개**가 있어요.\n\n구명조끼는 모두 ▢개",answer:40,note:"10개씩 4묶음은 40."},suggested_extras:["r_lifejacket_storage"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"30을 두 가지로 읽어요",question:"아이스크림 **묶음 3개**\n수로는 ▢\n말로는 ▢ / ▢",answer:"수로 30, 말로 삼십 / 서른",note:"10개씩 3묶음 = 30."},suggested_extras:["x_korean_writing_repeat"]},
  // ===== 응용문제 (4) =====
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"10개씩 묶음을 자유롭게 만들어 봐요",challenge:"구슬을 10개씩 묶어 봐요.\n묶음 ▢개를 만들면\n몇십이 될까요?",note:"열린 활동. 묶음 ▢개면 몇십. 예 — 5묶음이면 50."},suggested_extras:["m_choose_tool","q_thirty_things","g_make_fifty_game"]},
  {id:"s13",stage:"응용문제",block:"compare",data:{title:"50과 30, 어느 쪽이 더 클까요?",items:[{ten_frame:5,num:5,caption:"50 — 묶음 5개",is_anchor:true},{ten_frame:3,num:3,caption:"30 — 묶음 3개"}]},suggested_extras:["m_count_units_compare","a_compare_with_model"]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"카드를 골라 30과 비교해 봐요",content:"몇십 카드를 하나 골라요.\n내가 고른 수와 **30**을 비교해요.\n\n더 큰가요, 더 작은가요? 왜요?"},suggested_extras:["x_compare_without_reason","a_pair_count_classroom"]},
  {id:"s15",stage:"응용문제",block:"advanced_problem",data:{title:"50은 30보다 묶음이 몇 개 더 많을까요?",question:"50 — 묶음 5개\n30 — 묶음 3개\n\n50이 30보다 묶음 ▢개 더 많아요.\n그래서 50이 더 ▢요.",answer:"묶음 2개 더 많아요. 그래서 50이 더 커요.",note:"50=묶음5, 30=묶음3. 5−3=2."},suggested_extras:["m_count_units_compare"]},
  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것을 정리해요",points:["10개씩 **묶음 수**가 곧 몇십","20·30·40·50 — 이십~오십, 스물~쉰","묶음이 1개 늘면 **10씩** 커져요","묶음이 많을수록 더 큰 수"]},suggested_extras:["b_serra_book","e_to_next_lesson"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"묶음 수로 몇십을 말할 수 있나요?\n몇십을 두 가지 말로 읽을 수 있나요?\n묶음 수로 크기를 비교할 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"묶음과 낱개를 함께 써서\n**50까지의 수**를 세어 봐요!",emoji:""},suggested_extras:["e_to_next_lesson"]}
    ],
    extras: [
      {
          "id": "v_count_by_tens",
          "type": "video",
          "icon": "🎥",
          "title": "10씩 묶어 세기 영상",
          "url": "https://www.youtube.com/results?search_query=10씩+묶어세기+초등+1학년+몇십",
          "description": "10개씩 묶음으로 큰 수를 빠르게 세는 방법을 보여 주는 영상. 보트·줄 선 사람 같은 도입 상황과 연결해 한 번 보여 주면 좋아요.",
          "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
          "fit_slides": [
              "cover",
              "motivate"
          ]
      },
      {
          "id": "r_egg_carton",
          "type": "real_world",
          "icon": "🌍",
          "title": "계란판 10개씩",
          "content": "마트의 계란판은 10개씩 묶음의 가장 친근한 예. 30개·40개 계란을 살 때 묶음 3개·4개를 세는 자연스러운 자리.",
          "fit_slides": [
              "basic_problem",
              "concept"
          ]
      },
      {
          "id": "r_swimming_lane",
          "type": "real_world",
          "icon": "🌍",
          "title": "수영장 코스 사람들",
          "content": "수영장에는 한 코스에 사람이 줄 서 있거나 한 레인에 학생 10명씩 들어가는 경우가 많아요. 바닷가·물놀이 맥락의 자연스러운 묶어 세기.",
          "fit_slides": [
              "cover",
              "motivate"
          ]
      },
      {
          "id": "r_lifejacket_storage",
          "type": "real_world",
          "icon": "🌍",
          "title": "구명조끼 보관 묶음",
          "content": "여름철 보트장·수영장의 구명조끼는 10개씩 걸이에 묶어 보관해요. 보관함 묶음 4개 = 40개. 지도서 활동 3 맥락 그대로.",
          "fit_slides": [
              "basic_problem",
              "real_world"
          ]
      },
      {
          "id": "r_two_names_age",
          "type": "real_world",
          "icon": "🌍",
          "title": "나이 30살 — 두 가지 말",
          "content": "엄마 나이를 묻는 자리에서 '서른두 살'이라고 답하기도 '삼십이 살'이라고 답하기도 해요. 상황에 따라 한자말·우리말이 자연스럽게 바뀌는 일상 예.",
          "fit_slides": [
              "concept",
              "real_world"
          ]
      },
      {
          "id": "r_classroom_chairs",
          "type": "real_world",
          "icon": "🌍",
          "title": "교실 의자 묶어 보기",
          "content": "학교 강당이나 체육관 의자는 10개씩 한 줄로 배치되는 경우가 많아요. 줄 수를 세면 전체 의자 수가 빠르게 나와요 — 묶어 세기의 일상 사례.",
          "fit_slides": [
              "motivate",
              "real_world"
          ]
      },
      {
          "id": "q_my_school_count",
          "type": "fun_question",
          "icon": "💡",
          "title": "우리 학교 1학년 몇 명?",
          "content": "우리 학교 1학년은 모두 몇 명일까요? 한 반에 약 20명이라면 두 반은? 세 반은? 묶어 세기로 우리 학교 한 학년 수를 어림해 보기.",
          "fit_slides": [
              "motivate",
              "advanced_problem"
          ]
      },
      {
          "id": "q_thirty_things",
          "type": "fun_question",
          "icon": "💡",
          "title": "30개로 셀 수 있는 것",
          "content": "우리 동네에서 30개·40개·50개로 셀 수 있는 물건은 무엇이 있을까요? 가로수·창문·도서관 책 등 학생이 직접 찾아보면 즐거워요.",
          "fit_slides": [
              "advanced_problem",
              "compare"
          ]
      },
      {
          "id": "e_place_value_position",
          "type": "extension",
          "icon": "⬆",
          "title": "위치적 기수법 첫 자리",
          "content": "40에서 4는 묶음 자리, 0은 낱개 자리. 자리에 따라 같은 숫자가 다른 값을 갖는다는 위치적 기수법의 첫 자리. 1학년 마지막 단원에서 토대만 잡고 2학년에서 본격 학습.",
          "source": "교사용 지도서 5단원 6차시 — 활동 3 유의점",
          "fit_slides": [
              "visual_demo",
              "summary"
          ]
      },
      {
          "id": "e_to_next_lesson",
          "type": "extension",
          "icon": "⬆",
          "title": "다음 차시 — 50까지의 수",
          "content": "6차에서는 낱개 0인 몇십만. 7차에서는 묶음 + 낱개가 함께 있는 수 (23·45 등 50까지) 모두를 다뤄요. 묶음·낱개 두 자리가 처음으로 함께 등장.",
          "fit_slides": [
              "next_lesson",
              "summary"
          ]
      },
      {
          "id": "g_make_fifty_game",
          "type": "game",
          "icon": "🎮",
          "title": "몇십 만들기 놀이",
          "content": "지도서 '이런 활동도 해 봐요'. 2명이 주사위를 굴려 나온 수만큼 연결 모형 추가. 10개가 되면 '10!' 외치고 묶음. 50을 먼저 만든 사람이 승. 묶음 만들기 동기 부여.",
          "source": "교사용 지도서 5단원 6차시 — 이런 활동도 해 봐요",
          "fit_slides": [
              "advanced_problem",
              "next_lesson"
          ]
      },
      {
          "id": "g_tens_dice_play",
          "type": "game",
          "icon": "🎮",
          "title": "10씩 뛰어 세기 주사위",
          "content": "주사위를 굴려 나온 수만큼 10씩 뛰어 세기. 3이 나오면 '10·20·30!'. 빠르게 외치면 점수. 10씩 자라는 수를 입에 익히는 자리.",
          "fit_slides": [
              "arrow_flow"
          ]
      },
      {
          "id": "m_grouping_motivation",
          "type": "tip",
          "icon": "🧩",
          "title": "묶어 세기 — 필요성 먼저",
          "content": "도입에서 '20'을 정의하지 않고 흩어진 채로 사람·물건을 세어 빠뜨림·중복이 생긴 경험부터 만들어 주세요. 묶어 세기의 필요성을 학생 스스로 인식하는 자리.",
          "source": "교사용 지도서 5단원 6차시 — 도입 유의점",
          "fit_slides": [
              "motivate"
          ]
      },
      {
          "id": "m_three_links_again",
          "type": "tip",
          "icon": "🧩",
          "title": "모델 ↔ 기호 ↔ 용어 3중 연결",
          "content": "04차에서 시작한 그림·수·말 세 가지 연결을 본 차시에서도 이어 가요. 30이라는 수를 보면 머릿속에 연결 모형 3묶음과 '삼십·서른'이라는 말이 동시에 떠오르도록.",
          "source": "교사용 지도서 5단원 6차시 — 활동 3 유의점",
          "fit_slides": [
              "objective",
              "summary"
          ]
      },
      {
          "id": "m_no_repeat_writing",
          "type": "tip",
          "icon": "🧩",
          "title": "반복 쓰기 지양",
          "content": "'이십·스물', '삼십·서른' 같은 한글 표기는 한 번 읽고 의미를 잡으면 충분. 공책에 반복해서 쓰는 연습은 지도서가 명시적으로 지양하라고 안내. 의미 이해가 우선.",
          "source": "교사용 지도서 5단원 6차시 — 활동 1·3 유의점",
          "fit_slides": [
              "objective",
              "basic_problem"
          ]
      },
      {
          "id": "m_count_units_compare",
          "type": "tip",
          "icon": "🧩",
          "title": "묶음 단위로 비교",
          "content": "50과 30을 비교할 때 낱개 50개·30개를 일일이 세지 않고 묶음 5개와 3개를 비교. 묶음 단위 비교 전략은 두 자리 수 비교의 핵심 자리.",
          "source": "교사용 지도서 5단원 6차시 — 활동 4 유의점",
          "fit_slides": [
              "compare",
              "advanced_problem"
          ]
      },
      {
          "id": "m_two_readings_context",
          "type": "tip",
          "icon": "🧩",
          "title": "맥락 따라 두 가지 읽기",
          "content": "수를 '이십'으로 읽을지 '스물'로 읽을지는 상황에 따라 자연스럽게 결정. 20개·20층은 '이십', 20살·20명은 '스물'이 자연스러워요. 정답이 하나가 아닌 자리.",
          "source": "교사용 지도서 5단원 6차시 — 활동 1 유의점",
          "fit_slides": [
              "concept",
              "question"
          ]
      },
      {
          "id": "m_zero_ones_confirm",
          "type": "tip",
          "icon": "🧩",
          "title": "낱개 0개 확인",
          "content": "몇십을 쓸 때 묶음 수뿐 아니라 '낱개가 0개'임도 같이 확인. 40 = 묶음 4개 + 낱개 0개. 위치적 기수법의 첫 토대.",
          "source": "교사용 지도서 5단원 6차시 — 활동 3 유의점",
          "fit_slides": [
              "visual_demo"
          ]
      },
      {
          "id": "m_choose_tool",
          "type": "tip",
          "icon": "🧩",
          "title": "도구 선택 — 학생 자율",
          "content": "수 세기 칩·연결 모형·십 배열판 중 학생이 편한 도구를 골라 20을 표현하기. 도구가 달라도 묶음 2개라는 같은 구조가 보이는 자리. 표현 다양성을 인정.",
          "fit_slides": [
              "advanced_problem",
              "concept"
          ]
      },
      {
          "id": "m_thirty_inference",
          "type": "tip",
          "icon": "🧩",
          "title": "30 읽기 — 추론으로",
          "content": "30·40·50 읽기를 바로 알려 주지 말고 20(이십·스물)을 떠올려 학생이 직접 추론하게. '묶음 2개일 때 이십이면 묶음 3개일 때는?' 발문이 핵심.",
          "source": "교사용 지도서 5단원 6차시 — 활동 2 유의점",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "b_serra_book",
          "type": "book",
          "icon": "📖",
          "title": "『세라 선생님과 줄서 선생님』",
          "content": "박정선 그림책. 흩어진 그림을 묶어 세는 활동을 자연스럽게 보여 줘요. 도입 또는 정리 시간에 함께 읽으면 묶어 세기의 필요성이 한 번 더 와닿아요.",
          "source": "박정선 그림책 — 교사용 지도서 5단원 6차시 확장·가정 연계",
          "fit_slides": [
              "summary",
              "cover"
          ]
      },
      {
          "id": "x_ones_only",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 낱개 20개로만 봄",
          "content": "학생이 20을 '낱개 20개'로만 보고 묶음 2개로 보지 못하는 경우. 다른 도구(연결 모형·십 배열판)로도 같은 수를 묶음으로 표현해 묶음 단위 인식을 키워 주세요.",
          "source": "교사용 지도서 5단원 6차시 — 학생 예상 반응",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "x_korean_writing_repeat",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 한글 표기 반복 쓰기",
          "content": "'이십'·'스물'을 공책 가득 반복해서 쓰는 연습은 의미 학습에 큰 도움이 안 돼요. 지도서도 명시적으로 지양 권고. 의미와 맥락 안에서 한두 번 쓰면 충분.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "x_compare_without_reason",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 비교는 되나 까닭 못 댐",
          "content": "50이 30보다 크다는 것은 알지만 왜 그런지 설명을 못 하는 경우. 50에 30만큼 짚어 보고 남는 묶음 2개를 직접 보여 주면 까닭이 분명해져요.",
          "source": "교사용 지도서 5단원 6차시 — 학생 예상 반응",
          "fit_slides": [
              "question",
              "compare"
          ]
      },
      {
          "id": "a_count_classroom_things",
          "type": "other_activity",
          "icon": "📚",
          "title": "교실 물건 묶어 세기",
          "content": "색연필·블록·종이컵 등 교실의 물건을 10개씩 묶어 세어 보기. 묶음을 만들기 전과 후를 비교해 묶어 세기의 빠름을 직접 체험.",
          "source": "교사용 지도서 5단원 6차시 — 확장·가정 연계",
          "fit_slides": [
              "visual_demo",
              "summary"
          ]
      },
      {
          "id": "a_chip_twenty",
          "type": "other_activity",
          "icon": "📚",
          "title": "수 세기 칩으로 20 만들기",
          "content": "활동 1 선택 1. 칩을 10개씩 묶은 다음 올려 쌓지 않고 새 자리에 또 10개를 쌓기. 묶음 2개라는 구조가 시각적으로 분명해져요.",
          "source": "교사용 지도서 5단원 6차시 — 활동 1",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "a_link_cube_thirty",
          "type": "other_activity",
          "icon": "📚",
          "title": "연결 모형으로 30·40·50",
          "content": "활동 2. 연결 모형 10개 막대를 학생이 직접 3개·4개·5개로 늘려 보기. '묶음 1개 늘면 10씩 커져요'를 손으로 느껴 보는 자리.",
          "source": "교사용 지도서 5단원 6차시 — 활동 2",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "a_ten_frame_multi",
          "type": "other_activity",
          "icon": "📚",
          "title": "십 배열판 N개 — 몇십",
          "content": "십 배열판 1단원 검증 부품 재사용. 십 배열판 한 개에 10을 채우고 다음 십 배열판으로 넘어가서 또 채우기. 배열판 N개 = 몇십.",
          "source": "교사용 지도서 5단원 6차시 — 활동 1 선택 3",
          "fit_slides": [
              "arrow_flow",
              "concept"
          ]
      },
      {
          "id": "a_tube_count",
          "type": "other_activity",
          "icon": "📚",
          "title": "튜브 묶음 세어 보기",
          "content": "실제 튜브·구명조끼 사진을 보여 주고 10개씩 묶음을 학생이 직접 세어 보기. 지도서 활동 3 그대로의 맥락. 실물·사진 둘 다 좋아요.",
          "source": "교사용 지도서 5단원 6차시 — 활동 3",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_compare_with_model",
          "type": "other_activity",
          "icon": "📚",
          "title": "실물 모형으로 50과 30 비교",
          "content": "연결 모형으로 50과 30을 직접 만든 다음 나란히 놓고 비교하기. 묶음 2개 차이를 손으로 가리키며 확인. 까닭 설명이 어려운 학생에게 효과적.",
          "source": "교사용 지도서 5단원 6차시 — 학생 예상 반응",
          "fit_slides": [
              "compare",
              "advanced_problem"
          ]
      },
      {
          "id": "a_pair_count_classroom",
          "type": "other_activity",
          "icon": "📚",
          "title": "짝 활동 — 우리 둘이 함께",
          "content": "짝과 함께 교실 물건 한 종류를 골라 10개씩 묶어 세어 보기. 어떤 물건이 30개·40개 있는지 함께 찾고 발표.",
          "fit_slides": [
              "question",
              "real_world"
          ]
      }
    ]
  };

  // ─────────── 7차시: 50까지의 수를 세어 볼까요 ───────────
  // std [2수01-01]. 바닷가 맥락. 두 자리 수를 묶음·낱개로 나타내고 두 가지로 읽기.
  LESSONS["u5_l07"] = {
    meta: { title:"1학년 수학 5단원 7차시", subtitle:"50까지의 수를 세어 볼까요", std:"[2수01-01]", duration:40 },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 본 차시\n50까지의 수를 세어 볼까요\n🏖️ 묶음과 낱개로 세요",emoji:""},suggested_extras:["v_two_digit_intro","r_classroom_count"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"색칠한 칸을 세요",kids:[{face:"🟦",label:"묶음"},{face:"⬛",label:"낱개"},{face:"🙂",label:"몇 개?"}],question:"색칠한 칸이 **모두 몇 개**일까요?\n하나씩 말고 **묶음과 낱개**로 세어 봐요."},suggested_extras:["q_classroom_things","a_color_count"]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"50까지의 수를 **묶음과 낱개**로 세기\n두 가지 말로 읽기\n10개씩 묶음 ▢개 + 낱개 ▢개"},suggested_extras:["m_grouping_general"]},
  // ===== 전개 (4) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"23을 묶음과 낱개로",bidirect:["10개씩 묶음 **2개**","+","낱개 **3개**","↓","**23**"]},suggested_extras:["a_chip_twentythree","x_two_zero_three"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"23을 두 가지로 읽어요",bidirect:["수 — 23","말 — **이십삼**","말 — **스물셋**","두 가지 모두 같은 수"]},suggested_extras:["m_three_links_full","m_no_repeat_writing_v2"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"32는 묶음과 낱개로 어떻게?",bidirect:["묶음 **3개**","낱개 **2개**","↓","**32** (삼십이·서른둘)"]},suggested_extras:["a_link_thirtytwo","m_alt_partition_ok"]},
  {id:"s07",stage:"전개",block:"visual_demo",data:{title:"50은 낱개가 0",ten_frame_solo:{count:50,is_anchor:true,label:"**묶음 5개, 낱개 0개**\n50 (오십·쉰)"},sub_text:"낱개가 없으면 끝자리가 0"},suggested_extras:["m_ones_zero","a_ten_frame_45"]},
  // ===== 기본문제 (4) =====
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"파라솔이 몇 개일까요?",question:"10개씩 묶음 **2개**와\n낱개 **5개**가 있어요.\n\n파라솔은 모두 ▢개",answer:25,note:"20과 5로 25. 이십오 / 스물다섯."},suggested_extras:["r_locker_24","m_context_reading"]},
  {id:"s08b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"묶음 3·낱개 4는 7이야",right:"묶음은 10씩이라 30, 낱개 4를 더해 **34**.\n묶음과 낱개를 자리에 맞춰요.",hint:"묶음은 십의 자리, 낱개는 일의 자리."},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"게가 몇 마리일까요?",question:"10개씩 묶음 **3개**와\n낱개 **4개**가 있어요.\n\n게는 모두 ▢마리",answer:34,note:"30과 4로 34."},suggested_extras:["a_baduk_count"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"물고기가 몇 마리일까요?",question:"10개씩 묶음 **4개**와\n낱개 **1개**가 있어요.\n\n물고기는 모두 ▢마리",answer:41,note:"40과 1로 41."},suggested_extras:["r_book_page_35"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"36은 묶음과 낱개로 어떻게?",question:"**36**을 나타내요.\n10개씩 묶음 ▢개\n낱개 ▢개",answer:"묶음 3개, 낱개 6개",note:"36은 10개씩 3묶음과 낱개 6."},suggested_extras:["m_same_digit_22_33","a_supp_workbook"]},
  // ===== 응용문제 (4) =====
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"묶음과 낱개로 수를 만들어 봐요",challenge:"묶음과 낱개를 자유롭게 골라\n두 자리 수를 만들어 봐요.\n내가 만든 수를 읽어 봐요.",note:"열린 활동. 묶음과 낱개를 골라 두 자리 수를 만들어 읽어 봐요."},suggested_extras:["g_baduk_guess","q_my_age_birthday","m_baduk_limit"]},
  {id:"s13",stage:"응용문제",block:"card_arrange",data:{title:"숫자에 어울리는 말을 찾아 주세요",steps:["수 카드 — 41","말 카드 — 사십일","말 카드 — 마흔하나","같은 수끼리 짝지어요"]},suggested_extras:["x_repeat_writing_korean","r_pencil_48","g_card_pick_play"]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"하나를 골라 그 수를 적어 봐요",content:"그림 중 하나를 골라\n묶음과 낱개를 세어\n**그 수**를 적어 봐요."},suggested_extras:["a_life_finder","r_floor_24"]},
  {id:"s15",stage:"응용문제",block:"advanced_problem",data:{title:"두 자리 모두 어떤 수를 말할까요?",question:"**십의 자리**는 묶음 수\n**일의 자리**는 낱개 수\n\n묶음 4·낱개 7이면 어떤 수?",answer:47,note:"십의 자리는 묶음 수(4), 일의 자리는 낱개 수(7) → 47."},suggested_extras:["e_place_value_start","x_loose_no_grouping"]},
  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 내용",points:["50까지 수는 **묶음과 낱개**로 세요","묶음 수 = 십의 자리, 낱개 수 = 일의 자리","두 가지 말로 읽을 수 있어요","낱개가 없으면 끝자리가 0"]},suggested_extras:["b_fish_book","e_to_next_lesson"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"두 자리 수를 묶음과 낱개로 셀 수 있나요?\n두 가지 말로 읽을 수 있나요?\n묶음·낱개로 수를 만들 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**50까지 수의 순서**를\n알아봐요!",emoji:""},suggested_extras:["e_to_next_lesson"]}
    ],
    extras: [
      {
          "id": "v_two_digit_intro",
          "type": "video",
          "icon": "🎥",
          "title": "50까지의 수 영상",
          "url": "https://www.youtube.com/results?search_query=50까지+묶음+낱개+초등+1학년",
          "description": "두 자리 수를 묶음과 낱개로 표현하는 과정을 보여 주는 영상. 도입 다음에 한 번 보면 좋아요.",
          "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
          "fit_slides": [
              "cover",
              "motivate"
          ]
      },
      {
          "id": "r_locker_24",
          "type": "real_world",
          "icon": "🌍",
          "title": "사물함 24개",
          "content": "우리 반 사물함은 24개. 묶음 2개와 낱개 4개로 셀 수 있어요. 지도서 활동 5에 명시된 일상 예 그대로.",
          "source": "교사용 지도서 5단원 7차시 — 활동 5",
          "fit_slides": [
              "basic_problem",
              "real_world"
          ]
      },
      {
          "id": "r_pencil_48",
          "type": "real_world",
          "icon": "🌍",
          "title": "색연필 48자루",
          "content": "내 색연필 통에는 48자루가 들어가요. 묶음 4개와 낱개 8개. '마흔여덟 자루'가 더 자연스러운 일상 표현. 지도서 활동 5 예.",
          "source": "교사용 지도서 5단원 7차시 — 활동 5",
          "fit_slides": [
              "card_arrange",
              "real_world"
          ]
      },
      {
          "id": "r_book_page_35",
          "type": "real_world",
          "icon": "🌍",
          "title": "책 35쪽까지 읽었어",
          "content": "어제 책을 35쪽까지 읽었어요. 묶음 3개와 낱개 5개. 책 쪽수는 두 자리 수의 가장 친근한 자리 — 매일 만나는 수.",
          "source": "교사용 지도서 5단원 7차시 — 활동 5",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "r_floor_24",
          "type": "real_world",
          "icon": "🌍",
          "title": "24층 vs 24살",
          "content": "같은 24인데 '이십사 층'·'스물네 살'로 다르게 읽어요. 맥락에 따라 한자말·우리말이 자연스럽게 바뀌는 자리. 학생이 자기 가족 예로 직접 이야기해 봐요.",
          "source": "교사용 지도서 5단원 7차시 — 활동 4 유의점",
          "fit_slides": [
              "question",
              "concept"
          ]
      },
      {
          "id": "r_classroom_count",
          "type": "real_world",
          "icon": "🌍",
          "title": "교실 의자·책상 수",
          "content": "교실의 책상·의자·창문은 묶음과 낱개로 셀 수 있는 가장 가까운 자리. 학생이 직접 일어나서 세어 보면 묶음으로 묶는 습관이 자연스럽게 들어요.",
          "fit_slides": [
              "cover",
              "question"
          ]
      },
      {
          "id": "q_my_age_birthday",
          "type": "fun_question",
          "icon": "💡",
          "title": "가족 중 두 자리 나이?",
          "content": "우리 가족 중 두 자리 나이를 가진 사람은 누구일까요? 11·12·25·47 … 50까지 안에서 가족 나이를 찾아 봐요. 자기 나이부터 시작해도 좋아요.",
          "fit_slides": [
              "advanced_problem",
              "question"
          ]
      },
      {
          "id": "q_classroom_things",
          "type": "fun_question",
          "icon": "💡",
          "title": "두 자리로 셀 수 있는 것",
          "content": "우리 반에서 두 자리로 셀 수 있는 물건은 어떤 게 있을까요? 책·연필·블록 … 학생이 자기 주변을 둘러보고 직접 찾기. 발견의 자리.",
          "source": "교사용 지도서 5단원 7차시 — 활동 5",
          "fit_slides": [
              "motivate",
              "advanced_problem"
          ]
      },
      {
          "id": "e_place_value_start",
          "type": "extension",
          "icon": "⬆",
          "title": "십의 자리·일의 자리 시작",
          "content": "45에서 4는 십의 자리, 5는 일의 자리. 같은 숫자라도 자리에 따라 값이 달라지는 위치적 기수법의 본격 시작. 2학년 두 자리·세 자리 학습으로 이어져요.",
          "source": "교사용 지도서 5단원 7차시 — 활동 3 유의점",
          "fit_slides": [
              "advanced_problem",
              "summary"
          ]
      },
      {
          "id": "e_to_next_lesson",
          "type": "extension",
          "icon": "⬆",
          "title": "다음 차시 — 수의 순서",
          "content": "7차에서 두 자리 수를 만든 다음, 8차에서는 그 수들을 순서대로 늘어놓아 봐요. 1만큼 큰 수·1만큼 작은 수, 수 배열표 규칙이 등장.",
          "fit_slides": [
              "next_lesson",
              "summary"
          ]
      },
      {
          "id": "g_card_pick_play",
          "type": "game",
          "icon": "🎮",
          "title": "50까지 수 카드 짚기 놀이",
          "content": "지도서 '이런 활동도 해 봐요'. 3~4명이 한 모둠. 11~50 수 카드를 펼쳐 놓고, 한 명이 수를 부르면 다른 친구들이 그 카드를 빠르게 짚기. 먼저 짚은 학생이 카드 가져감.",
          "source": "교사용 지도서 5단원 7차시 — 이런 활동도 해 봐요",
          "fit_slides": [
              "card_arrange"
          ]
      },
      {
          "id": "g_baduk_guess",
          "type": "game",
          "icon": "🎮",
          "title": "바둑돌 개수 예상 놀이",
          "content": "활동 4 변형. 두 손에 바둑돌을 한가득 담고 짝과 서로 예상해 보기. 예상 후 묶음과 낱개로 세어 보고 답 확인. '몇 개일까?' 호기심 자극.",
          "source": "교사용 지도서 5단원 7차시 — 활동 4",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "m_grouping_general",
          "type": "tip",
          "icon": "🧩",
          "title": "묶어 세기 — 50까지 일반화",
          "content": "04차(십몇)와 06차(몇십)를 합친 자리. 11~50 모든 수가 '묶음 + 낱개' 구조. 묶어 세기가 더 이상 특별한 전략이 아니라 두 자리 수의 본질임을 학생이 느끼게.",
          "fit_slides": [
              "objective"
          ]
      },
      {
          "id": "m_three_links_full",
          "type": "tip",
          "icon": "🧩",
          "title": "모델 ↔ 기호 ↔ 용어 3중 연결 (완성)",
          "content": "04·06차에서 시작한 그림·수·말 세 가지 연결의 일반화 자리. 45를 보면 머릿속에 묶음 4개+낱개 5개 그림과 '사십오·마흔다섯'이라는 말이 함께 떠오르도록.",
          "source": "교사용 지도서 5단원 7차시 — 활동 3 유의점",
          "fit_slides": [
              "concept",
              "summary"
          ]
      },
      {
          "id": "m_no_repeat_writing_v2",
          "type": "tip",
          "icon": "🧩",
          "title": "반복 쓰기 지양 (재확인)",
          "content": "'이십삼·스물셋' 같은 한글 표기는 의미 이해가 중요. 공책 가득 반복해서 쓰는 연습은 지도서가 명시적으로 지양 권고. 06차에서 이어지는 안내.",
          "source": "교사용 지도서 5단원 7차시 — 활동 1 유의점",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "m_ones_zero",
          "type": "tip",
          "icon": "🧩",
          "title": "50의 낱개 = 0 확인",
          "content": "50을 묶음 5개로만 보지 말고 '낱개가 0개'임도 같이 확인하게 해 주세요. 위치적 기수법에서 0이 자리를 채우는 첫 자리. 06차에서 강조한 안내의 일반화.",
          "source": "교사용 지도서 5단원 7차시 — 활동 2 유의점",
          "fit_slides": [
              "visual_demo"
          ]
      },
      {
          "id": "m_alt_partition_ok",
          "type": "tip",
          "icon": "🧩",
          "title": "32 = 묶음 2 + 낱개 12도 수용",
          "content": "학생이 32를 묶음 2개와 낱개 12개로 표현해도 받아내림·자릿값 개념의 기초로 수용. 단 이 차시에서는 묶음 3+낱개 2 표현으로도 이어 갈 수 있도록 함께 지도.",
          "source": "교사용 지도서 5단원 7차시 — 활동 2 유의점",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "m_baduk_limit",
          "type": "tip",
          "icon": "🧩",
          "title": "바둑돌은 11~50개만",
          "content": "손에 담는 바둑돌은 11~50개 범위로 제한. 50을 넘는 수는 다음 학년에서 학습할 자리임을 학생에게 안내. 본 차시 범위 의식을 분명히.",
          "source": "교사용 지도서 5단원 7차시 — 활동 4 유의점",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "m_context_reading",
          "type": "tip",
          "icon": "🧩",
          "title": "맥락 따라 두 가지 읽기",
          "content": "45개·45번은 '사십오', 45살·마흔다섯 명은 '마흔다섯'이 자연스러워요. 정답이 하나가 아닌 자리. 학생이 자기 맥락에 맞게 골라 읽어도 모두 인정.",
          "source": "교사용 지도서 5단원 7차시 — 활동 4 유의점",
          "fit_slides": [
              "basic_problem",
              "concept"
          ]
      },
      {
          "id": "m_same_digit_22_33",
          "type": "tip",
          "icon": "🧩",
          "title": "같은 숫자 — 자리 짚기",
          "content": "22·33·44처럼 같은 숫자 두 개로 된 수는 학생이 헷갈리기 쉬워요. 십의 자리 2와 일의 자리 2가 다른 의미라는 점을 손가락으로 짚어 가며 확인.",
          "source": "교사용 지도서 5단원 7차시 — 이럴 땐 이렇게",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "b_fish_book",
          "type": "book",
          "icon": "📖",
          "title": "『감기 걸린 물고기』",
          "content": "박정섭 그림책. 다양한 색깔 물고기 수를 묶음과 낱개로 세어 보는 활동에 자연스럽게 연결. 책 자체는 따돌림 주제를 다루기에 학급 분위기 봐서 함께 읽기.",
          "source": "박정섭 그림책 — 교사용 지도서 5단원 7차시 확장·가정 연계",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "x_two_zero_three",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 23을 203으로",
          "content": "학생이 23을 '20과 3을 따로 써서 203'으로 잘못 표현하는 경우. 20 = 묶음 2와 낱개 0, 23은 그 낱개 자리에 3이 들어가는 것임을 짚어 주세요.",
          "source": "교사용 지도서 5단원 7차시 — 학생 예상 반응",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "x_repeat_writing_korean",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 한글 표기 반복 쓰기",
          "content": "'이십삼·스물셋'을 공책 가득 반복 쓰기는 의미 학습에 효과가 작아요. 지도서도 명시 지양. 의미와 맥락 안에서 한두 번 쓰면 충분.",
          "fit_slides": [
              "card_arrange"
          ]
      },
      {
          "id": "x_loose_no_grouping",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 묶지 않고 낱개로만",
          "content": "23을 묶음 없이 낱개 23개로만 표현하는 경우. 같은 수임은 맞지만, 50까지 수의 자릿값 학습이 본 차시 목표이므로 묶음 표현으로 이어 가도록 함께 지도.",
          "source": "교사용 지도서 5단원 7차시 — 학생 예상 반응",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "a_chip_twentythree",
          "type": "other_activity",
          "icon": "📚",
          "title": "수 세기 칩으로 23 만들기",
          "content": "활동 1 선택 1. 칩 10개를 한 묶음 쌓고 새 자리에 또 10개, 그다음 낱개 자리에 3개. 묶음 2개와 낱개 3개라는 구조가 눈에 분명히 들어와요.",
          "source": "교사용 지도서 5단원 7차시 — 활동 1",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "a_link_thirtytwo",
          "type": "other_activity",
          "icon": "📚",
          "title": "연결 모형으로 32",
          "content": "활동 1 선택 2. 연결 모형 10개 막대 3개와 낱개 2개로 32 만들기. 어디서 묶음이 끝나고 낱개가 시작되는지 손으로 만지며 확인.",
          "source": "교사용 지도서 5단원 7차시 — 활동 1",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "a_ten_frame_45",
          "type": "other_activity",
          "icon": "📚",
          "title": "십 배열판 45 표현",
          "content": "활동 1 선택 3. 십 배열판을 4개 모두 채우고 다섯 번째 판에 5칸만 채우기. 묶음 4 + 낱개 5라는 구조가 한눈에 보이는 표현.",
          "source": "교사용 지도서 5단원 7차시 — 활동 1",
          "fit_slides": [
              "visual_demo"
          ]
      },
      {
          "id": "a_supp_workbook",
          "type": "other_activity",
          "icon": "📚",
          "title": "보충 — 묶음·낱개 분해 활동지",
          "content": "36 같은 수를 묶음과 낱개로 분해하는 활동지. 표현이 어려운 학생용. 그림으로 먼저 시작해서 수로 옮겨 쓰는 단계 구성.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_baduk_count",
          "type": "other_activity",
          "icon": "📚",
          "title": "바둑돌 11~50 세기",
          "content": "활동 4. 짝과 함께 손에 바둑돌을 한가득 담고 묶음과 낱개로 세어 보기. 27·36 같은 수가 자연스럽게 나오는 자리. 실물 활동.",
          "source": "교사용 지도서 5단원 7차시 — 활동 4",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_life_finder",
          "type": "other_activity",
          "icon": "📚",
          "title": "생활 속 50까지의 수",
          "content": "활동 5. 우리 반 사물함 24개·내 색연필 48자루·책 35쪽 같은 문장을 학생이 직접 만들어 발표. 자기 일상에서 두 자리 수를 만나는 자리.",
          "source": "교사용 지도서 5단원 7차시 — 활동 5",
          "fit_slides": [
              "question",
              "real_world"
          ]
      },
      {
          "id": "a_color_count",
          "type": "other_activity",
          "icon": "📚",
          "title": "색칠 칸 묶어 세기",
          "content": "수학익힘 76~77쪽 자리. 흩어진 색칠 칸을 묶음과 낱개로 셀 수 있는 색깔별로 정리. 미술과 자연스럽게 연계.",
          "source": "교사용 지도서 5단원 7차시 — 수학익힘 76~77",
          "fit_slides": [
              "motivate"
          ]
      }
    ]
  };

  // ─────────── 8차시: 50까지 수의 순서를 알아볼까요 ───────────
  // std [2수01-03]. 1 큰 수·1 작은 수, 양옆 수, 수 배열표 규칙.
  LESSONS["u5_l08"] = {
    meta: { title:"1학년 수학 5단원 8차시", subtitle:"50까지 수의 순서를 알아볼까요", std:"[2수01-03]", duration:40 },
    slides: [
  // ===== 도입 (3) =====
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 본 차시\n50까지 수의 순서를 알아볼까요\n🔢 수의 자리를 찾아요",emoji:""},suggested_extras:["v_number_order_50","r_seat_number"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"자리를 찾아 봐요",kids:[{face:"2️⃣",label:"24"},{face:"❓",label:"25"},{face:"2️⃣",label:"26"}],question:"수에도 **순서**가 있어요.\n25는 어디에 들어갈까요?"},suggested_extras:["q_my_seat_num","r_apartment_num"]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"**1만큼 더 큰 수 · 1만큼 더 작은 수**\n어떤 수의 **양옆 수**\n수 배열표에서 **규칙** 찾기"},suggested_extras:["m_relation_first","m_many_relations"]},
  // ===== 전개 (4) =====
  {id:"s04",stage:"전개",block:"concept",data:{title:"12보다 1만큼 더 큰 수는?",bidirect:["12","→ 바로 다음 수","↓","**13**"]},suggested_extras:["a_grid_blank_fill"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"14보다 1만큼 더 작은 수는?",bidirect:["14","→ 바로 앞 수","↓","**13**"]},suggested_extras:["m_finger_track"]},
  {id:"s06",stage:"전개",block:"concept",data:{title:"25 양옆의 수는?",bidirect:["앞 수 **24**","25","뒤 수 **26**","양옆은 1만큼 작고·큰 수"]},suggested_extras:["m_after_before_practice","q_secret_number","a_chain_game_class"]},
  {id:"s07",stage:"전개",block:"arrow_flow",data:{title:"수 배열표에서 규칙을 찾아 봐요",steps:["오른쪽으로 → **1씩 커져요**","아래로 ↓ **10씩 커져요**","줄과 칸에 규칙이 있어요","규칙으로 빈칸을 채워요"]},suggested_extras:["m_grid_rule","e_skip_count","r_warmup_50"]},
  // ===== 기본문제 (4) =====
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"빈칸에 알맞은 수는?",question:"31, ▢, 33\n\n가운데 빈칸에 알맞은 수는?",answer:32,note:"1씩 커져요. 31 다음은 32."},suggested_extras:["x_no_pattern"]},
  {id:"s08b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"39 다음은 310이야",right:"39 다음은 **40**.\n9 다음엔 묶음이 하나 늘어 십의 자리가 커져요.",hint:"낱개 9 다음은 새 묶음."},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"빈칸에 알맞은 수는?",question:"▢, 48, 49\n\n앞 빈칸에 알맞은 수는?",answer:47,note:"48 바로 앞은 47."},suggested_extras:["a_supp_workbook_08"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"두 빈칸을 채워 봐요",question:"26, ▢, ▢, 29\n\n두 빈칸에 알맞은 수는?",answer:"27, 28",note:"1씩 커져요: 26,27,28,29."},suggested_extras:["a_count_30_to_38"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"위·아래 빈칸을 채워 봐요",question:"배열표에서 23의\n**위 칸**(13보다…)과\n**아래 칸**은 어떤 수?",answer:"위 칸 13, 아래 칸 33",note:"배열표에서 위는 10 작은 수, 아래는 10 큰 수."},suggested_extras:["a_home_grid","r_calendar_days"]},
  // ===== 응용문제 (4) =====
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"30부터 38까지 차례로 눌러 봐요",question:"30, 31, 32 …\n**순서대로** 38까지\n빠진 수 없이 눌러 봐요.",answer:"30,31,32,33,34,35,36,37,38",note:"빠진 수 없이 1씩 커지게."},suggested_extras:["x_skip_in_sequence","x_dont_see"]},
  {id:"s13",stage:"응용문제",block:"advanced_problem",data:{title:"46부터 50까지 차례로 눌러 봐요",question:"46, 47, 48 …\n**50까지** 순서대로\n눌러 봐요.",answer:"46,47,48,49,50",note:"1씩 커져 50까지."},suggested_extras:["a_count_46_to_50","m_wait_dont_fix","m_no_win_lose"]},
  {id:"s14",stage:"응용문제",block:"real_world",data:{title:"점을 이어 운동 친구를 만나 봐요",scenario:{icon:"🏃",body:"수를 **작은 수부터 큰 수로**\n순서대로 점을 이어요.\n그림 속 운동 친구가 나타나요!"}},suggested_extras:["g_dot_connect","r_jersey_back"]},
  {id:"s15",stage:"응용문제",block:"advanced_problem",data:{title:"회오리 빈칸을 채워 봐요",question:"수가 **나선**으로 놓여 있어요.\n순서 규칙을 찾아\n빈칸을 채워 봐요.",answer:"순서 규칙대로 1씩 커지게 빈칸을 채워요",note:"나선이어도 수는 차례대로 1씩 커져요."},suggested_extras:["a_advanced_workbook_08","m_supp_advanced_diff"]},
  // ===== 정리 (3) =====
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 것",points:["**1만큼 더 큰 수** = 바로 다음 수","**1만큼 더 작은 수** = 바로 앞 수","양옆 수는 1 작고·1 큰 수","배열표 — 오른쪽 1씩, 아래 10씩 커져요"]},suggested_extras:["b_count_book_50","e_to_compare","g_number_chain_play"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"1 큰 수·1 작은 수를 찾을 수 있나요?\n어떤 수의 양옆 수를 말할 수 있나요?\n배열표 규칙으로 빈칸을 채울 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**수의 크기**를\n비교해 봐요!",emoji:""},suggested_extras:["e_to_compare"]}
    ],
    extras: [
      {
          "id": "v_number_order_50",
          "type": "video",
          "icon": "🎥",
          "title": "50까지 수의 순서 영상",
          "url": "https://www.youtube.com/results?search_query=50까지+수의+순서+초등+1학년",
          "description": "1부터 50까지 수의 순서와 1만큼 큰 수·1만큼 작은 수를 보여 주는 영상. 도입 다음에 한 번 보면 좋아요.",
          "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
          "fit_slides": [
              "cover",
              "motivate"
          ]
      },
      {
          "id": "r_seat_number",
          "type": "real_world",
          "icon": "🌍",
          "title": "영화관·강당 좌석 번호",
          "content": "영화관·강당 좌석은 1부터 순서대로 번호가 매겨져 있어요. 13번 자리는 12번과 14번 사이. 도입 자리표 맥락 그대로의 일상 예.",
          "fit_slides": [
              "cover"
          ]
      },
      {
          "id": "r_apartment_num",
          "type": "real_world",
          "icon": "🌍",
          "title": "아파트 호수 순서",
          "content": "아파트 호수도 1~50까지 순서대로. 우리 집 호수가 25호라면 양옆은 24호·26호. 학생이 자기 집 호수로 직접 양옆 수 찾기.",
          "fit_slides": [
              "motivate"
          ]
      },
      {
          "id": "r_calendar_days",
          "type": "real_world",
          "icon": "🌍",
          "title": "달력 날짜 순서",
          "content": "달력은 1일부터 31일까지 순서대로. 어제·오늘·내일이 곧 1만큼 작은 수·기준 수·1만큼 큰 수. 가장 가까운 수 배열표.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "r_jersey_back",
          "type": "real_world",
          "icon": "🌍",
          "title": "운동 친구 등번호 순서",
          "content": "축구·농구 선수 등번호는 1부터 50까지 흩어져 있어요. 점잇기 활동에서 운동 친구가 나타나는 맥락과 직접 연결.",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "r_warmup_50",
          "type": "real_world",
          "icon": "🌍",
          "title": "50까지 세며 준비운동",
          "content": "단원 실천 활동 '순서대로 수를 세며 운동을 해요'. 체육 시간 준비운동에 50까지 함께 세기. 수의 순서를 입에 익히는 자연스러운 자리.",
          "source": "교사용 지도서 5단원 8차시 — 확장·가정 연계",
          "fit_slides": [
              "arrow_flow"
          ]
      },
      {
          "id": "q_my_seat_num",
          "type": "fun_question",
          "icon": "💡",
          "title": "내 자리 양옆 수는?",
          "content": "우리 반에서 내 번호는 몇 번? 내 번호의 1만큼 큰 수·1만큼 작은 수는? 짝꿍의 번호와도 비교해 봐요. 자기 번호가 출발점.",
          "fit_slides": [
              "motivate"
          ]
      },
      {
          "id": "q_secret_number",
          "type": "fun_question",
          "icon": "💡",
          "title": "비밀 수 알아맞히기",
          "content": "한 친구가 1~50 사이 비밀 수를 정해요. 다른 친구는 '그 수의 1 큰 수는 뭐야?'·'양옆 수는?'만 물어볼 수 있어요. 추리로 비밀 수 찾기.",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "e_skip_count",
          "type": "extension",
          "icon": "⬆",
          "title": "2씩·5씩·10씩 뛰어 세기",
          "content": "수 배열표에 익숙한 학생용. 2씩 색칠하면 짝수 줄, 5씩 색칠하면 일정한 자리, 10씩 색칠하면 같은 일의 자리. 패턴 발견 자리.",
          "source": "교사용 지도서 5단원 8차시 — 학생 예상 반응",
          "fit_slides": [
              "arrow_flow"
          ]
      },
      {
          "id": "e_to_compare",
          "type": "extension",
          "icon": "⬆",
          "title": "다음 차시 — 수의 크기 비교",
          "content": "8차에서 수의 순서를 익혔으면 9차에서는 두 수의 크기를 비교. 묶음 수가 큰 쪽이 더 큰 수, 같으면 낱개 수. 순서 학습이 비교 학습의 토대.",
          "fit_slides": [
              "next_lesson",
              "summary"
          ]
      },
      {
          "id": "g_number_chain_play",
          "type": "game",
          "icon": "🎮",
          "title": "수 이어 가기 놀이",
          "content": "지도서 '이런 활동도 해 봐요'. 한 사람이 1~3개 수를 말하면 다음 친구가 이어서 말하기. 50까지 이르면 끝. 승패 없는 협력 놀이.",
          "source": "교사용 지도서 5단원 8차시 — 활동 3",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "g_dot_connect",
          "type": "game",
          "icon": "🎮",
          "title": "점잇기 운동 친구",
          "content": "수학익힘 78쪽 자리. 1~25번까지 점을 순서대로 이으면 운동 친구 그림이 완성. 학생이 가장 좋아하는 활동 중 하나.",
          "source": "교사용 지도서 5단원 8차시 — 수학익힘 78",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "m_relation_first",
          "type": "tip",
          "icon": "🧩",
          "title": "수의 관계로 설명",
          "content": "빈칸에 알맞은 수를 쓸 때 학생이 '13이니까 13'이라고 답하지 않고 '12보다 1만큼 큰 수'·'14보다 1만큼 작은 수'처럼 관계로 설명하도록 안내.",
          "source": "교사용 지도서 5단원 8차시 — 활동 1 유의점",
          "fit_slides": [
              "objective"
          ]
      },
      {
          "id": "m_many_relations",
          "type": "tip",
          "icon": "🧩",
          "title": "한 수를 여러 관계로",
          "content": "13은 12보다 1만큼 큰 수, 14보다 1만큼 작은 수, 12와 14의 사이 수. 한 수를 여러 관계로 표현해 보면 수의 순서가 더 입체적으로 와닿아요.",
          "source": "교사용 지도서 5단원 8차시 — 활동 1 유의점",
          "fit_slides": [
              "objective"
          ]
      },
      {
          "id": "m_no_win_lose",
          "type": "tip",
          "icon": "🧩",
          "title": "이어 가기 놀이는 승패 없음",
          "content": "수 이어 가기 놀이는 모둠이 함께 50까지 가는 데 목적. 누가 빨리·정확히 했는지 가리지 않아요. 협력 분위기 안에서 수 순서 익히기.",
          "source": "교사용 지도서 5단원 8차시 — 활동 3 유의점",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "m_wait_dont_fix",
          "type": "tip",
          "icon": "🧩",
          "title": "실수해도 바로 지적 X",
          "content": "친구가 수를 틀리거나 빠뜨려도 바로 지적하지 말고 다음 차례까지 기다리기. 학생 스스로 알아차릴 시간을 충분히. 안전한 시도 분위기.",
          "source": "교사용 지도서 5단원 8차시 — 활동 3 유의점",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "m_finger_track",
          "type": "tip",
          "icon": "🧩",
          "title": "손가락으로 짚으며 세기",
          "content": "순서가 바뀌거나 누락되는 학생에게는 손가락으로 수를 하나씩 짚으며 읽도록 안내. 짝과 활동할 때는 듣는 친구가 손가락으로 짚어 주기.",
          "source": "교사용 지도서 5단원 8차시 — 활동 2 유의점",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "m_grid_rule",
          "type": "tip",
          "icon": "🧩",
          "title": "배열표 규칙 — 오른쪽 1·아래 10",
          "content": "수 배열표는 오른쪽으로 한 칸 = 1씩 커지고, 아래로 한 칸 = 10씩 커져요. 학생이 이 규칙을 발견하면 빈칸 채우기가 한결 쉬워져요.",
          "fit_slides": [
              "arrow_flow"
          ]
      },
      {
          "id": "m_after_before_practice",
          "type": "tip",
          "icon": "🧩",
          "title": "앞 수·뒤 수 짝 활동",
          "content": "한 친구가 수를 부르면 다른 친구가 그 수의 1 작은 수·1 큰 수를 말하기. 짧고 자주 반복하기 좋은 짝 활동. 수의 양옆 감각이 빠르게 자라요.",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "m_supp_advanced_diff",
          "type": "tip",
          "icon": "🧩",
          "title": "심화·보충 활동지 차별 적용",
          "content": "활동지 1-1-5_08차시_심화 = 추론하여 쓰기 / 활동지 1-1-5_08차시_보충 = 수의 관계 파악. 학생 수준에 맞춰 다른 활동지 배부. 차별화 자리.",
          "source": "교사용 지도서 5단원 8차시 — 맞춤형 도움 자료",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "b_count_book_50",
          "type": "book",
          "icon": "📖",
          "title": "점잇기·수 배열 그림책",
          "content": "50까지 수를 순서대로 잇는 점잇기 그림책. 학교 도서관에서 '숫자 점잇기'·'수 그림책' 키워드로 찾아보세요. 정리 자리에 함께 보면 좋아요.",
          "source": "여러 그림책 — 교사 선택",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "x_skip_in_sequence",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 순서 누락",
          "content": "30부터 셀 때 29 다음 30·31·32까지 가다가 33을 빠뜨리고 34로 가는 경우. 손가락으로 짚으며 세기 + 짝이 옆에서 확인해 주기.",
          "source": "교사용 지도서 5단원 8차시 — 학생 예상 반응",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "x_dont_see",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 안 보고 어려움",
          "content": "수 배열표를 보면 50까지 잘 세지만 보지 않고는 어려운 경우. 다음 수는 앞에서 말한 수보다 1만큼 큰 수임을 짚어 주면 점차 머릿속에 순서가 자리 잡아요.",
          "source": "교사용 지도서 5단원 8차시 — 학생 예상 반응",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "x_no_pattern",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 앞·뒤 연관성 못 봄",
          "content": "31·▢·33 같은 문제에서 앞 수와 뒤 수의 차이가 2임을 못 보는 경우. 일의 자리·십의 자리에 어떤 변화가 있는지 짚어 가며 연관성을 보여 주세요.",
          "source": "교사용 지도서 5단원 8차시 — 학생 예상 반응",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_grid_blank_fill",
          "type": "other_activity",
          "icon": "📚",
          "title": "수 배열표 빈칸 채우기",
          "content": "활동 1. 일부 빈칸이 있는 1~50 수 배열표를 학생이 채우기. 처음에는 앞·뒤 수만 보이는 빈칸, 점차 위·아래 수만 보이는 빈칸으로 단계 구성.",
          "source": "교사용 지도서 5단원 8차시 — 활동 1",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "a_count_30_to_38",
          "type": "other_activity",
          "icon": "📚",
          "title": "30~38 짝과 부르기",
          "content": "활동 2. 짝과 30·31·32 … 38까지 번갈아 한 수씩 부르기. 중간 구간을 따로 떼어 연습하면 50까지 전체보다 부담이 적어요.",
          "source": "교사용 지도서 5단원 8차시 — 활동 2",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_count_46_to_50",
          "type": "other_activity",
          "icon": "📚",
          "title": "46~50 짝과 부르기",
          "content": "활동 2. 끝 구간 46~50 연습. 단원에서 가장 큰 수까지 도달하는 자리. 학생이 '50'을 입으로 말할 때 단원 전체 감각이 완성.",
          "source": "교사용 지도서 5단원 8차시 — 활동 2",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "a_chain_game_class",
          "type": "other_activity",
          "icon": "📚",
          "title": "모둠 이어 가기 놀이",
          "content": "활동 3 확장. 4~5명 모둠이 둘러앉아 1부터 50까지 순서대로 한 사람당 1~3개씩 이어 말하기. 누가 50을 말하게 될지 긴장감 있는 자리.",
          "source": "교사용 지도서 5단원 8차시 — 활동 3",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "a_supp_workbook_08",
          "type": "other_activity",
          "icon": "📚",
          "title": "보충 — 수의 관계 활동지",
          "content": "활동지 1-1-5_08차시_보충. 1만큼 큰 수·1만큼 작은 수를 천천히 찾아가는 단계형 활동지. 순서대로 말하기 어려운 학생용.",
          "source": "교사용 지도서 5단원 8차시 — 맞춤형 도움 자료",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_advanced_workbook_08",
          "type": "other_activity",
          "icon": "📚",
          "title": "심화 — 수 순서 추론 활동지",
          "content": "활동지 1-1-5_08차시_심화. 회오리·뱀 모양으로 놓인 수의 빈칸을 추론하여 채우기. 50까지 잘 말하는 학생용.",
          "source": "교사용 지도서 5단원 8차시 — 맞춤형 도움 자료",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "a_home_grid",
          "type": "other_activity",
          "icon": "📚",
          "title": "가정 — 수 배열표 만들기",
          "content": "확장·가정 연계. 학생이 집에서 1~50 또는 1~100 수 배열표를 자기 손으로 한 번 만들어 보기. 만드는 과정 자체가 순서 학습.",
          "source": "교사용 지도서 5단원 8차시 — 확장·가정 연계",
          "fit_slides": [
              "basic_problem"
          ]
      }
    ]
  };

  // ─────────── 9차시: 수의 크기를 비교해 볼까요 ───────────
  // std [2수01-03]. 묶음 먼저 비교 → 같으면 낱개. 크다·작다, 가장 크다·작다.
  LESSONS["u5_l09"] = {
    meta: { title:"1학년 수학 5단원 9차시", subtitle:"수의 크기를 비교해 볼까요", std:"[2수01-03]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 본 차시\n수의 크기를 비교해 볼까요\n🃏 어느 수가 더 클까요",emoji:""},suggested_extras:["v_compare_numbers_50"]},
  {id:"s02",stage:"도입",block:"motivate",data:{scene_title:"카드 뒤집기 놀이",kids:[{face:"🃏",label:"내 카드"},{face:"🃏",label:"친구 카드"},{face:"🙂",label:"누가 큰가?"}],question:"카드를 뒤집어 두 수를 봐요.\n**어느 수가 더 클까요?**"},suggested_extras:["a_two_card_play","q_what_if_same"]},
  {id:"s03",stage:"도입",block:"objective",data:{title:"오늘 배울 것",content:"50까지 두 수의 **크기 비교**\n**묶음 수 먼저**, 같으면 낱개\n크다·작다, 가장 크다·작다"},suggested_extras:["m_groups_first","m_same_then_ones"]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"묶음의 수가 다를 때",bidirect:["32 — 묶음 3개","21 — 묶음 2개","묶음이 **많은 쪽**이 더 커요","→ 32 > 21"]},suggested_extras:["m_step_by_step_intro","x_count_total_only"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"묶음의 수가 같을 때",bidirect:["34 — 묶음 3, 낱개 4","37 — 묶음 3, 낱개 7","묶음 같으면 **낱개 많은 쪽**","→ 37 > 34"]},suggested_extras:["m_positional_concept"]},
  {id:"s06",stage:"전개",block:"arrow_flow",data:{title:"크기 비교하는 방법",steps:["① **묶음 수**를 먼저 비교","② 묶음이 같으면 **낱개 수** 비교","많은 쪽이 더 큰 수","적은 쪽이 더 작은 수"]},suggested_extras:["m_no_win_lose_compare","m_help_when_wrong"]},
  {id:"s07",stage:"전개",block:"compare",data:{title:"세 수를 비교해 봐요",items:[{ten_frame:2,num:2,caption:"28"},{ten_frame:4,num:4,caption:"41",is_anchor:true},{ten_frame:3,num:3,caption:"35"}]},suggested_extras:["a_three_number_sort","m_two_card_first","x_three_too_hard"]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"더 큰 수를 골라 봐요",question:"**26**과 **31**\n\n더 큰 수는 어느 것일까요?",answer:31,note:"십의 자리 비교: 3>2라 31이 더 커요."},suggested_extras:["q_who_taller_class","r_height_compare"]},
  {id:"s08b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"낱개(일의 자리)가 크면 더 큰 수야",right:"먼저 **십의 자리(묶음)**부터 비교해요.\n십의 자리가 같을 때만 일의 자리를 봐요.",hint:"묶음 수가 많은 쪽이 더 커요."},suggested_extras:[]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"더 큰 수를 골라 봐요",question:"**45**와 **42**\n\n더 큰 수는 어느 것일까요?",answer:45,note:"십의 자리 같으면(4=4) 일의 자리로: 5>2라 45가 더 커요."},suggested_extras:["a_card_only_compare","x_same_pick_winner"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"더 작은 수를 골라 봐요",question:"**38**과 **33**\n\n더 작은 수는 어느 것일까요?",answer:33,note:"십의 자리 같음(3=3), 일의 자리 3<8이라 33이 더 작아요."},suggested_extras:["a_supp_compare","r_book_pages"]},
  {id:"s11",stage:"기본문제",block:"real_world",data:{title:"큰 수 길을 따라가 봐요",scenario:{icon:"🛤️",body:"갈림길마다 **더 큰 수**를 따라가요.\n끝까지 가면 보물이 나와요!"}},suggested_extras:["a_workbook_compare_path","g_path_chooser","r_jersey_compare"]},
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"가장 큰 수를 골라 봐요",question:"**29 · 47 · 36**\n\n셋 중 **가장 큰 수**는?",answer:47,note:"십의 자리 비교: 4가 가장 커요 → 47."},suggested_extras:["a_workbook_largest","e_largest_4_5"]},
  {id:"s13",stage:"응용문제",block:"advanced_problem",data:{title:"가장 작은 수를 골라 봐요",question:"**42 · 24 · 40**\n\n셋 중 **가장 작은 수**는?",answer:24,note:"십의 자리: 2가 가장 작아요 → 24."},suggested_extras:["m_same_no_record","m_same_then_ones"]},
  {id:"s14",stage:"응용문제",block:"card_arrange",data:{title:"큰 수부터 줄을 세워 봐요",steps:["수 카드 — 35 · 19 · 48 · 27","**큰 수부터** 차례로","48 → 35 → 27 → 19","줄을 세워 봐요"]},suggested_extras:["g_card_battle","r_stair_steps"]},
  {id:"s15",stage:"응용문제",block:"card_arrange",data:{title:"작은 수부터 줄을 세워 봐요",steps:["같은 카드를 이번엔","**작은 수부터** 차례로","19 → 27 → 35 → 48","거꾸로 줄을 세워 봐요"]},suggested_extras:["a_advanced_compare","r_lego_compare"]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"오늘 배운 비교 방법",points:["**묶음 수 먼저** 비교","묶음 같으면 **낱개 수** 비교","많으면 크다, 적으면 작다","셋 이상도 같은 방법으로 줄 세워요"]},suggested_extras:["b_compare_book","e_position_value_compare"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 점검",content:"묶음 수로 크기를 비교할 수 있나요?\n묶음이 같을 때 낱개로 비교할 수 있나요?\n가장 큰 수·작은 수를 찾을 수 있나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"다음 시간에는",preview:"**수학이랑 확인해요**\n5단원에서 배운 것을 점검해 봐요!",emoji:""},suggested_extras:["e_position_value_compare"]}
    ],
    extras: [
      {
          "id": "v_compare_numbers_50",
          "type": "video",
          "icon": "🎥",
          "title": "50까지 두 수 크기 비교 영상",
          "url": "https://www.youtube.com/results?search_query=50까지+수의+크기+비교+초등+1학년",
          "description": "묶음과 낱개로 두 수의 크기를 비교하는 방법을 보여 주는 영상. 도입 자리 직후 한 번 보기 좋아요.",
          "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
          "fit_slides": [
              "cover"
          ]
      },
      {
          "id": "r_height_compare",
          "type": "real_world",
          "icon": "🌍",
          "title": "우리 반 친구들 키 비교",
          "content": "학생들 키를 cm 단위로 적어 보면 대개 110~135 사이. 묶음(십의 자리) 같으면 낱개로 비교. 묶음이 다르면 묶음 큰 쪽이 더 큰 키. 자기 키로 비교 자리.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "r_book_pages",
          "type": "real_world",
          "icon": "🌍",
          "title": "책 쪽수로 비교",
          "content": "읽고 있는 그림책의 쪽수가 38쪽·33쪽이라면 어느 책이 더 두꺼울까. 묶음 같으니 낱개로 38 > 33. 책 두께·쪽수가 일상 비교 자리.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "r_jersey_compare",
          "type": "real_world",
          "icon": "🌍",
          "title": "등번호 큰 수 따라가기",
          "content": "축구·야구 선수 등번호도 1~50 사이가 흔해요. 우리 팀 선수 두 명의 등번호 중 더 큰 수는 누구일까. 좋아하는 선수 등번호로 비교 자리.",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "r_stair_steps",
          "type": "real_world",
          "icon": "🌍",
          "title": "계단 칸 수 비교",
          "content": "우리 학교 1층에서 2층까지 계단 수 vs 2층에서 3층까지 계단 수를 세어 비교. 묶음과 낱개로 나누어 본 후 큰 쪽 결정. 일상에서 직접 세어 보는 자리.",
          "fit_slides": [
              "card_arrange"
          ]
      },
      {
          "id": "r_lego_compare",
          "type": "real_world",
          "icon": "🌍",
          "title": "레고 블럭 개수 비교",
          "content": "빨간 레고 32개·파란 레고 27개가 있다면 어느 색이 더 많을까. 10개씩 묶어 본 후 비교하면 빨리 알 수 있어요. 가정에서 직접 세고 비교하는 자리.",
          "fit_slides": [
              "card_arrange"
          ]
      },
      {
          "id": "q_who_taller_class",
          "type": "fun_question",
          "icon": "💡",
          "title": "우리 반에서 더 큰 수는?",
          "content": "내 번호와 짝꿍 번호 중 어느 쪽이 더 큰 수일까. 묶음 수가 다른가, 같은가. 우리 반 친구들 번호로 즉석 두 수 비교 게임 자리.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "q_what_if_same",
          "type": "fun_question",
          "icon": "💡",
          "title": "같은 수가 나오면 어떻게?",
          "content": "카드 뒤집기 놀이에서 두 사람이 같은 수(예: 23·23)가 나오면 누가 더 큰 수일까. 정답은 '같습니다'. 같은 수에서는 비교 자체가 불필요. 다시 뽑기 자리.",
          "fit_slides": [
              "motivate"
          ]
      },
      {
          "id": "e_largest_4_5",
          "type": "extension",
          "icon": "⬆",
          "title": "4개·5개 수에서 가장 큰 수",
          "content": "세 수를 잘 비교한 학생용. 4개·5개 수로 늘려 가장 큰 수·가장 작은 수 찾기. 처음에는 두 수씩 묶어 비교 후 결과끼리 다시 비교. 알고리즘 자리.",
          "source": "교사용 지도서 5단원 9차시 — 학생 예상 반응",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "e_position_value_compare",
          "type": "extension",
          "icon": "⬆",
          "title": "자릿값으로 한눈에 비교",
          "content": "수의 비교 = 자릿값 비교. 십의 자리가 큰 쪽이 더 큰 수, 같으면 일의 자리. 8차 자릿값 학습이 9차 비교의 토대. 두 자리 수 비교 자리 정리.",
          "fit_slides": [
              "summary",
              "next_lesson"
          ]
      },
      {
          "id": "g_card_battle",
          "type": "game",
          "icon": "🎮",
          "title": "카드 배틀 — 큰 수가 이긴다",
          "content": "꾸러미 13·14 카드 활용 자리. 두 사람이 동시에 한 장씩 뽑아 큰 수가 이김. 같은 수면 무승부. 짧고 자주 반복하면 비교 감각이 빠르게 자라요.",
          "source": "교사용 지도서 5단원 9차시 — 활동 1 변형",
          "fit_slides": [
              "card_arrange"
          ]
      },
      {
          "id": "g_path_chooser",
          "type": "game",
          "icon": "🎮",
          "title": "큰 수 길 따라가기 (수익 81쪽)",
          "content": "수학익힘 81쪽 자리. 갈림길마다 두 수가 적혀 있고 더 큰 수 길을 따라가야 도착. 비교를 잘못하면 다른 길로 나옴. 학생이 좋아하는 미로 자리.",
          "source": "교사용 지도서 5단원 9차시 — 수학익힘 81",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "m_groups_first",
          "type": "tip",
          "icon": "🧩",
          "title": "묶음 수를 먼저",
          "content": "두 수 비교의 첫 단계 = 묶음(십의 자리) 수 비교. 묶음 다르면 더 비교할 필요 없이 묶음 많은 쪽이 더 큰 수. 자릿값 사고의 출발 자리.",
          "source": "교사용 지도서 5단원 9차시 — 정리",
          "fit_slides": [
              "objective"
          ]
      },
      {
          "id": "m_same_then_ones",
          "type": "tip",
          "icon": "🧩",
          "title": "묶음 같으면 낱개로",
          "content": "34와 37처럼 묶음이 같을 때만 낱개를 비교. 묶음이 다른데 낱개부터 보면 잘못된 결론으로 가요. '묶음 → 낱개' 순서가 단단해야 자릿값이 잡혀요.",
          "source": "교사용 지도서 5단원 9차시 — 정리",
          "fit_slides": [
              "objective",
              "advanced_problem"
          ]
      },
      {
          "id": "m_no_win_lose_compare",
          "type": "tip",
          "icon": "🧩",
          "title": "놀이는 승패 X",
          "content": "카드 뒤집기·세 수 비교 놀이는 승패가 목적이 아니에요. 친구가 잘못 비교했어도 함께 도와 해결하는 분위기. 놀이의 결과보다 비교 과정의 설명이 핵심.",
          "source": "교사용 지도서 5단원 9차시 — 활동 1 유의점",
          "fit_slides": [
              "arrow_flow"
          ]
      },
      {
          "id": "m_help_when_wrong",
          "type": "tip",
          "icon": "🧩",
          "title": "친구 답이 틀려도 함께",
          "content": "짝이 비교를 틀리게 했을 때 바로 지적하지 말고 '왜 그렇게 생각했어?' 묻기. 학생끼리 설명하는 과정에서 자기 오류를 스스로 발견하기도 해요.",
          "source": "교사용 지도서 5단원 9차시 — 활동 1 유의점",
          "fit_slides": [
              "arrow_flow"
          ]
      },
      {
          "id": "m_step_by_step_intro",
          "type": "tip",
          "icon": "🧩",
          "title": "십 모형 카드만 먼저",
          "content": "학생 수준이 낮으면 처음에는 십 모형 카드(파란색)만 가지고 비교. 익숙해지면 낱개 모형 카드(초록색)를 추가. 단계 분리가 학생 부담을 줄여 줘요.",
          "source": "교사용 지도서 5단원 9차시 — 활동 1 유의점",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "m_positional_concept",
          "type": "tip",
          "icon": "🧩",
          "title": "위치적 기수법의 기본",
          "content": "두 자리 수 = 묶음 위치 + 낱개 위치. 같은 숫자라도 자리가 다르면 가치가 달라요. 9차 비교는 8차 자릿값과 함께 위치적 기수법의 기본을 자리잡게 해요.",
          "source": "교사용 지도서 5단원 9차시 — 활동 1 유의점",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "m_same_no_record",
          "type": "tip",
          "icon": "🧩",
          "title": "같은 수는 기록 X",
          "content": "카드에서 같은 수(예: 45·45)가 나오면 '45는 45와 같습니다.'라고 말하고 놀이판에는 기록하지 않아요. 같음 = 비교 불가. 다시 뽑기 자리.",
          "source": "교사용 지도서 5단원 9차시 — 활동 1 유의점",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "m_two_card_first",
          "type": "tip",
          "icon": "🧩",
          "title": "세 수 어려우면 두 장부터",
          "content": "세 수 비교 놀이가 어려운 학생은 먼저 두 장 카드로 연습. 두 수 비교가 단단해지면 한 장씩 더해 세 수로 확장. 천천히 늘리는 자리.",
          "source": "교사용 지도서 5단원 9차시 — 활동 2 유의점",
          "fit_slides": [
              "compare"
          ]
      },
      {
          "id": "b_compare_book",
          "type": "book",
          "icon": "📖",
          "title": "크기 비교 그림책",
          "content": "학교 도서관에서 '크기 비교'·'더 많고 더 적은'·'누가 더 클까' 같은 키워드로 그림책 찾기. 시각적으로 크기를 비교하는 책이 9차 마무리 자리에 잘 어울려요.",
          "source": "여러 그림책 — 교사 선택",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "x_count_total_only",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 모형 수만 보고 판단",
          "content": "묶음과 낱개를 구분 없이 모형이 많은 쪽을 더 큰 수로 답하는 경우. 십 모형 1개 = 낱개 10개임을 구체물로 확인하고, 묶음 수의 가치를 짚어 주세요.",
          "source": "교사용 지도서 5단원 9차시 — 학생 예상 반응",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "x_three_too_hard",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 세 수 동시 비교 어려움",
          "content": "세 수를 한꺼번에 비교하려다 막히는 경우. 두 수씩 묶어 비교한 후 결과끼리 다시 비교하면 풀려요. 두 수 비교의 반복으로 세 수 비교 자리.",
          "source": "교사용 지도서 5단원 9차시 — 학생 예상 반응",
          "fit_slides": [
              "compare"
          ]
      },
      {
          "id": "x_same_pick_winner",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 같은 수에 승자 정함",
          "content": "45·45처럼 같은 수가 나왔는데도 '내가 먼저 뽑았으니까 내가 크다' 같은 식으로 답하는 경우. 같음 = 비교 결과 없음을 짚고 다시 뽑기 자리로 안내.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_two_card_play",
          "type": "other_activity",
          "icon": "📚",
          "title": "'크다, 작다' 놀이 (활동 1)",
          "content": "활동 1. 꾸러미 13·14 카드(파란색 십 모형·초록색 낱개 모형)에서 한 장씩 뽑아 두 수 만들기. 짝과 크기 비교 후 놀이판 기록. 본 차시 핵심 활동 자리.",
          "source": "교사용 지도서 5단원 9차시 — 활동 1",
          "fit_slides": [
              "motivate"
          ]
      },
      {
          "id": "a_three_number_sort",
          "type": "other_activity",
          "icon": "📚",
          "title": "세 수 정렬 놀이 (활동 2)",
          "content": "활동 2. 종이 카드 3장에 1~50 사이 수를 적고 뒤집어 섞기. 한 장씩 가져와 자리 정하기. 더 큰 수는 오른쪽·작은 수는 왼쪽. 정렬 알고리즘의 첫 경험 자리.",
          "source": "교사용 지도서 5단원 9차시 — 활동 2",
          "fit_slides": [
              "compare"
          ]
      },
      {
          "id": "a_workbook_compare_path",
          "type": "other_activity",
          "icon": "📚",
          "title": "수익 80~81쪽 길 따라가기",
          "content": "수학익힘 80~81쪽. 두 수 비교하여 큰 수 길을 따라가면 도착점이 나옴. 잘못 비교하면 도착 못함. 길을 다시 점검하는 과정이 자기 점검 자리.",
          "source": "교사용 지도서 5단원 9차시 — 수학익힘 80·81",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "a_workbook_largest",
          "type": "other_activity",
          "icon": "📚",
          "title": "수익 81쪽 가장 큰 수",
          "content": "수학익힘 81쪽 아래. 세 수(38·40·19) 중 가장 큰 수 찾기. 두 수씩 비교 후 결과 비교로 풀이. 정답: 40. 세 수 비교의 표준 자리.",
          "source": "교사용 지도서 5단원 9차시 — 수학익힘 81",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "a_card_only_compare",
          "type": "other_activity",
          "icon": "📚",
          "title": "카드만으로 두 수 비교",
          "content": "구체물 → 수 카드 단계. 모형 없이 수가 적힌 카드만으로 두 수 비교. 구체 → 추상 전이 자리. 모형 없이도 묶음·낱개 사고로 비교할 수 있는지 점검.",
          "source": "교사용 지도서 5단원 9차시 — 학생 예상 반응",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_supp_compare",
          "type": "other_activity",
          "icon": "📚",
          "title": "보충 — 두 수 비교 활동지",
          "content": "활동지 1-1-5_09차시_보충. 묶음·낱개 모형 그림과 함께 두 수 비교를 천천히 안내. 구체물 단계가 필요한 학생용. 차별화 자리.",
          "source": "교사용 지도서 5단원 9차시 — 맞춤형 도움 자료",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_advanced_compare",
          "type": "other_activity",
          "icon": "📚",
          "title": "심화 — 세·네 수 정렬 활동지",
          "content": "활동지 1-1-5_09차시_심화. 4개·5개 수를 큰 순서·작은 순서로 정렬. 두 수 비교가 단단한 학생용. 알고리즘적 사고 확장 자리.",
          "source": "교사용 지도서 5단원 9차시 — 맞춤형 도움 자료",
          "fit_slides": [
              "card_arrange"
          ]
      }
    ]
  };

  // ─────────── 10차시: 수학이랑 확인해요 (단원 평가) ───────────
  // 특수 구조 — 평가. 5단계 흡수: 도입3·전개2·기본6·응용4·정리3.
  LESSONS["u5_l10"] = {
    meta: { title:"1학년 수학 5단원 10차시", subtitle:"수학이랑 확인해요 (단원 평가)", std:"[2수01-01] [2수01-03] [2수01-04]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 단원 평가\n수학이랑 확인해요\n✅ 배운 것을 점검해요",emoji:""},suggested_extras:["v_unit_review"]},
  {id:"s02",stage:"도입",block:"objective",data:{title:"오늘 점검할 것",content:"5단원에서 배운 것\n**50까지 세기 · 순서 · 크기 비교 · 모으기·가르기**\n문제를 풀고 스스로 점검해요"},suggested_extras:["m_recall_unit_intro","b_unit_review_book"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"준비됐어? 같이 시작해 보자!",kids:[{face:"💪",label:"준비"},{face:"✏️",label:"연필"},{face:"🙂",label:"출발!"}],question:"천천히, 차근차근 풀어 봐요.\n어려운 문제는 **묶음과 낱개**를 떠올려요."},suggested_extras:["q_my_strong_question","m_count_slowly"]},
  {id:"s04",stage:"전개",block:"summary",data:{title:"세기 방법 빠른 복습",points:["**묶음과 낱개**로 세기","묶음 수 = 십의 자리","낱개 수 = 일의 자리","두 가지 말로 읽기"]},suggested_extras:["m_tens_ones_again"]},
  {id:"s05",stage:"전개",block:"summary",data:{title:"순서·비교·가르기 빠른 복습",points:["**순서** — 1 큰 수·1 작은 수","**비교** — 묶음 먼저, 같으면 낱개","**모으기·가르기** — 여러 답 가능","천천히 떠올려 봐요"]},suggested_extras:["m_one_more_one_less","m_compare_groups_first"]},
  {id:"s06",stage:"기본문제",block:"basic_problem",data:{title:"평가 1 — 빨대 세고 읽기",question:"빨대를 세어 봐요.\n묶음 ▢개, 낱개 ▢개\n수로 ▢, 말로 읽어 봐요.",answer:"묶음 수는 십의 자리, 낱개 수는 일의 자리로 읽어요",note:"센 묶음·낱개를 수로 적고 두 가지로 읽어요."},suggested_extras:["a_workbook_82","x_109_for_19"]},
  {id:"s06b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"두 자리 수는 일의 자리만 보면 돼",right:"십의 자리부터 비교하고\n같을 때만 일의 자리를 봐요.",hint:"묶음 수 먼저, 그다음 낱개."},suggested_extras:[]},
  {id:"s07",stage:"기본문제",block:"basic_problem",data:{title:"평가 2 — 빨대 세고 읽기",question:"다른 그림의 빨대를 세어\n묶음과 낱개로 나타내고\n두 가지로 읽어 봐요.",answer:"묶음 ▢개·낱개 ▢개로 적고 두 가지로 읽어요",note:"그림마다 답이 달라요. 묶음·낱개로 정리하는지 보세요."},suggested_extras:["r_class_book_count"]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"평가 3 — 빈칸에 알맞은 수",question:"37, ▢, 39\n\n빈칸에 알맞은 수를 써 봐요.",answer:38,note:"37,38,39. 1씩 커져요."},suggested_extras:["x_grid_blank_wrong"]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"평가 4 — 빈칸에 알맞은 수",question:"▢, 45, 46, ▢\n\n빈칸 두 곳에 알맞은 수를 써 봐요.",answer:"44, 47",note:"44,45,46,47. 1씩 커져요."},suggested_extras:["a_supp_recount"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"평가 5 — 더 큰 수에 ○",question:"**34**와 **41**\n\n더 큰 수에 ○ 해 봐요.",answer:41,note:"십의 자리 4>3이라 41이 더 커요."},suggested_extras:["x_ones_only_compare","r_grocery_compare"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"평가 6 — 모아서 15 짝짓기",question:"모아서 **15**가 되는\n두 수를 짝지어 봐요.\n(여러 짝이 있을 수 있어요)",answers:["7과 8","6과 9"],note:"모아서 15면 정답 (7·8 / 6·9 / 5·10 …)."},suggested_extras:["x_make_15_wrong"]},
  {id:"s12",stage:"응용문제",block:"advanced_problem",data:{title:"평가 7 — 13을 두 가지로 갈라요",question:"**13**을 두 묶음으로\n**서로 다른 두 가지** 방법으로\n갈라 봐요.",answers:["6과 7","4와 9"],note:"서로 다른 두 가지면 정답."},suggested_extras:["x_partition_one_only"]},
  {id:"s13",stage:"응용문제",block:"basic_problem",data:{title:"평가 8 — 묶음과 낱개 세기",question:"그림을 보고\n묶음 ▢개, 낱개 ▢개\n모두 몇 개인지 써 봐요.",answer:"묶음 ▢개·낱개 ▢개로 세어 모두 몇 개인지 적어요",note:"그림마다 답이 달라요. 묶음·낱개·전체 수를 정리하는지 확인."},suggested_extras:["m_help_grade_self"]},
  {id:"s14",stage:"응용문제",block:"advanced_problem",data:{title:"평가 9 — 셋 중 가장 큰 수에 ○",question:"**28 · 46 · 33**\n\n가장 큰 수에 ○ 해 봐요.",answer:46,note:"십의 자리 4가 가장 커요 → 46."},suggested_extras:["m_compare_groups_first"]},
  {id:"s15",stage:"응용문제",block:"real_world",data:{title:"평가 10 — 건강한 여름 돌아보기",scenario:{icon:"☀️",body:"건강한 여름을 보내려고\n무엇을 했나요? 가장 많이 한 것은?\n방학에 더 실천하고 싶은 것은?"}},suggested_extras:["r_summer_health_check","q_summer_plan","a_summer_practice"]},
  {id:"s16",stage:"정리",block:"question",data:{title:"스스로 평가해요",content:"50까지 수를 셀 수 있나요?\n수의 순서와 크기를 비교할 수 있나요?\n모으기·가르기를 할 수 있나요?"},suggested_extras:["a_three_dim_self","m_help_grade_self"]},
  {id:"s17",stage:"정리",block:"summary",data:{title:"단원 점검을 마쳤어요",points:["맞힌 만큼 스스로 칭찬해 줘요","틀린 문제는 묶음·낱개로 다시 봐요","어려웠던 부분을 기억해 둬요","잘 해냈어요!"]},suggested_extras:["g_self_grade_stars","r_calendar_summer"]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"5단원이 거의 끝나요",preview:"마지막은 **수학이랑 만들어요**\n수로 숨은 그림을 만들어 봐요!",emoji:""},suggested_extras:["e_next_unit_hint","b_unit_review_book"]}
    ],
    extras: [
      {
          "id": "v_unit_review",
          "type": "video",
          "icon": "🎥",
          "title": "5단원 전체 복습 영상",
          "url": "https://www.youtube.com/results?search_query=초등+1학년+50까지의+수+단원+정리",
          "description": "5단원 1차에서 9차까지 핵심을 5분 안팎으로 요약한 영상. 평가 직전 한 번 보면 빠르게 떠올릴 수 있어요.",
          "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
          "fit_slides": [
              "cover"
          ]
      },
      {
          "id": "r_summer_health_check",
          "type": "real_world",
          "icon": "🌍",
          "title": "건강한 여름 점검표",
          "content": "단원 도입 자리에서 시작한 '건강한 여름' 실천 활동을 단원 끝에서 점검. 양치·세수·이른 잠 등 항목별로 몇 번 했는지 세고, 가장 많이 한 것 표시.",
          "source": "교사용 지도서 5단원 10차시 — 단원 실천 활동",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "r_grocery_compare",
          "type": "real_world",
          "icon": "🌍",
          "title": "마트에서 개수 비교",
          "content": "가족 장 보러 갈 때 사과 32개와 자두 41개 중 어느 쪽이 더 많은지 함께 비교. 묶음 다르면 묶음 큰 쪽이 더 많아요. 평가 직후 일상으로 확장.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "r_class_book_count",
          "type": "real_world",
          "icon": "🌍",
          "title": "우리 반 책 묶음·낱개",
          "content": "우리 반 학급 문고를 10권씩 묶어 보고 묶음 몇 개·낱개 몇 권인지 세어 보기. 학생이 직접 만지며 묶음과 낱개 개념을 다시 확인하는 자리.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "r_calendar_summer",
          "type": "real_world",
          "icon": "🌍",
          "title": "방학 달력에 50까지 표시",
          "content": "여름 방학이 50일이라면 달력에 1~50까지 숫자 표시. 매일 한 칸씩 색칠하며 며칠 남았는지 비교. 단원 학습이 방학 일상으로 이어지는 자리.",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "q_my_strong_question",
          "type": "fun_question",
          "icon": "💡",
          "title": "잘 푼 문제 vs 어려운 문제",
          "content": "평가 문항 중 가장 자신 있게 푼 문제는? 가장 어려웠던 문제는? 어려운 이유는 무엇이었을까. 자기 학습을 돌아보는 자기 평가 자리.",
          "fit_slides": [
              "motivate"
          ]
      },
      {
          "id": "q_summer_plan",
          "type": "fun_question",
          "icon": "💡",
          "title": "방학에 실천하고 싶은 것",
          "content": "여름 방학에는 무엇을 몇 번 실천하고 싶나요. 예: 책 읽기 30번·운동 25번·물 잘 마시기 50번. 50까지 수로 자기 계획 세우는 자리.",
          "source": "교사용 지도서 5단원 10차시 — 단원 실천 활동",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "e_next_unit_hint",
          "type": "extension",
          "icon": "⬆",
          "title": "6단원 미리보기",
          "content": "5단원에서 50까지의 수를 다루었어요. 6단원은 두 수 합하기·빼기로 이어져요. 5단원의 수 감각이 6단원 연산의 토대. 다음 자리로 가는 안내.",
          "fit_slides": [
              "next_lesson"
          ]
      },
      {
          "id": "g_self_grade_stars",
          "type": "game",
          "icon": "🎮",
          "title": "별점 자기 평가 놀이",
          "content": "문항마다 ⭐ 1~3개로 자기 점수. 별 1개 = 어렵, 별 2개 = 보통, 별 3개 = 쉬움. 학생이 부담 없이 자기 상태를 표시하는 자리.",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "m_count_slowly",
          "type": "tip",
          "icon": "🧩",
          "title": "차근차근 풀기",
          "content": "평가는 빠르게가 아니라 정확하게. 어려운 문제는 잠시 두고 쉬운 문제부터. 마지막에 다시 돌아와도 좋아요. 시간 관리보다 정확도가 우선.",
          "fit_slides": [
              "motivate"
          ]
      },
      {
          "id": "m_tens_ones_again",
          "type": "tip",
          "icon": "🧩",
          "title": "묶음·낱개로 다시",
          "content": "수를 세거나 비교할 때 막히면 묶음·낱개로 풀어 생각. 묶음 수가 십의 자리·낱개 수가 일의 자리. 5단원의 기본 도구를 항상 떠올리기.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 1",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "m_compare_groups_first",
          "type": "tip",
          "icon": "🧩",
          "title": "비교는 묶음 먼저",
          "content": "두 수 크기 비교는 묶음(십의 자리) 수가 먼저. 묶음 다르면 묶음 큰 쪽이 더 큰 수. 묶음 같을 때만 낱개 비교. 9차에서 단단해진 자리 복습.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 3",
          "fit_slides": [
              "summary",
              "advanced_problem"
          ]
      },
      {
          "id": "m_help_grade_self",
          "type": "tip",
          "icon": "🧩",
          "title": "도움 주며 자기 평가",
          "content": "자기 평가는 솔직하게. 모르는 항목에 ○ 표시해 두면 다음 시간에 어디를 더 봐야 할지 분명해져요. 평가 = 점수가 아니라 다음 학습의 출발.",
          "fit_slides": [
              "advanced_problem",
              "question"
          ]
      },
      {
          "id": "m_one_more_one_less",
          "type": "tip",
          "icon": "🧩",
          "title": "빈칸은 1 큰·1 작은 수로",
          "content": "수 배열표 빈칸 문제는 빈칸 옆의 수를 보고 1만큼 큰 수·1만큼 작은 수로 풀어요. 8차에서 익힌 양옆 수 사고가 그대로 평가에 적용.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 2",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "m_recall_unit_intro",
          "type": "tip",
          "icon": "🧩",
          "title": "단원 도입 회고",
          "content": "평가 시작 전 단원 도입 자리(1차)에서 본 '건강한 여름' 그림을 잠시 떠올리기. 그동안 무엇을 배웠는지 큰 그림 자리로 들어가기.",
          "source": "교사용 지도서 5단원 10차시 — 단원 실천 활동",
          "fit_slides": [
              "objective"
          ]
      },
      {
          "id": "b_unit_review_book",
          "type": "book",
          "icon": "📖",
          "title": "50까지 수 마무리 그림책",
          "content": "단원 마무리에 잘 어울리는 수 그림책. 1~50까지 수가 일상에서 어떻게 쓰이는지 보여 주는 그림책. 평가 후 함께 보면 단원 학습이 정리돼요.",
          "source": "여러 그림책 — 교사 선택",
          "fit_slides": [
              "objective",
              "next_lesson"
          ]
      },
      {
          "id": "x_109_for_19",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 19를 109로 씀",
          "content": "10과 9를 그대로 이어 109로 쓰는 경우. 10 = 묶음 1·낱개 0임을 다시 보여 주고, 10에 9를 더하면 묶음 1·낱개 9인 19로 쓰임을 짚어 주세요.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 1",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "x_grid_blank_wrong",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 배열표 빈칸 잘못",
          "content": "수 배열표 빈칸에 다른 수를 쓰는 경우. 빈칸보다 1만큼 큰 수·1만큼 작은 수가 옆 칸에 적혀 있어요. 양옆 수 관계를 다시 짚어 주세요.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 2",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "x_ones_only_compare",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 일의 자리만 보고 비교",
          "content": "34와 41 비교에서 일의 자리 4와 1만 보고 34를 더 크다 답하는 경우. 묶음 수(십의 자리)부터 봐야 한다고 다시 안내. 묶음 다르면 묶음 큰 쪽.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 3",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "x_make_15_wrong",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 15 안 되는 짝",
          "content": "모으기 15 짝을 찾을 때 14가 되는 짝(7·7)이나 16이 되는 짝(8·8)을 답하는 경우. 바둑돌로 두 수를 모아 세어 보며 정확히 15가 되는지 확인.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 4",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "x_partition_one_only",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 13을 한 가지로만",
          "content": "13 가르기에서 한 방법만 쓰고 다른 방법을 못 찾는 경우. 그림 두 칸으로 나누고 한쪽을 1·2·3 … 늘려 가며 다른 쪽이 12·11·10 … 줄어듦을 보여 주기.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 5",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "a_workbook_82",
          "type": "other_activity",
          "icon": "📚",
          "title": "수익 82쪽 자기 평가",
          "content": "수학익힘 82쪽. 3차원(지식·과정·가치) 자기 평가지. 학생이 단원 학습 자기 점검하는 자리. 평가 후 점검표가 다음 단원 학습 시작점이 돼요.",
          "source": "교사용 지도서 5단원 10차시 — 수학익힘 82",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_three_dim_self",
          "type": "other_activity",
          "icon": "📚",
          "title": "3차원 자기 평가",
          "content": "지식·이해 (수 세고 읽고 쓰기) / 과정·기능 (순서·크기 비교) / 가치·태도 (생활 속에서 수 찾기). 세 축으로 자신을 평가하는 자리.",
          "source": "교사용 지도서 5단원 10차시 — 자기 평가",
          "fit_slides": [
              "question"
          ]
      },
      {
          "id": "a_summer_practice",
          "type": "other_activity",
          "icon": "📚",
          "title": "단원 실천 활동 점검",
          "content": "단원 도입 자리에서 약속한 '건강한 여름' 활동을 단원 끝에서 점검. 했던 횟수 세기 + 방학 다짐. 단원 전체 스토리 마무리 자리.",
          "source": "교사용 지도서 5단원 10차시 — 단원 실천 활동",
          "fit_slides": [
              "real_world"
          ]
      },
      {
          "id": "a_supp_recount",
          "type": "other_activity",
          "icon": "📚",
          "title": "평가 도움 주기 활동지",
          "content": "평가 문항별 도움 주기 안내 활동지. 학생이 어떤 문항에서 막혔는지 보고 해당 도움 주기 자리로 안내. 차별화된 보충 자리.",
          "source": "교사용 지도서 5단원 10차시 — 도움 주기 자리",
          "fit_slides": [
              "basic_problem"
          ]
      }
    ]
  };

  // ─────────── 11차시: 수학이랑 만들어요 (창의 활동) ───────────
  // 특수 구조 — 창의. 수→색 숨은그림 + 큰/작은 순서 정렬.
  LESSONS["u5_l11"] = {
    meta: { title:"1학년 수학 5단원 11차시", subtitle:"수학이랑 만들어요 (창의 활동)", std:"[2수01-03]", duration:40 },
    slides: [
  {id:"s01",stage:"도입",block:"cover",data:{title:"5단원 창의 활동\n수학이랑 만들어요\n🎨 수로 그림을 만들어요",emoji:""},suggested_extras:["v_color_by_number"]},
  {id:"s02",stage:"도입",block:"objective",data:{title:"오늘 할 것",content:"수를 **색으로** 칠해 숨은 그림 찾기\n수를 **큰 순서·작은 순서**로 정렬하기\n배운 것을 놀이로 마무리해요"},suggested_extras:["m_color_promise","a_color_range_paint"]},
  {id:"s03",stage:"도입",block:"motivate",data:{scene_title:"숨겨진 수를 찾아봐요",kids:[{face:"🔢",label:"수"},{face:"🎨",label:"색"},{face:"🙂",label:"숨은 그림?"}],question:"칸마다 수가 적혀 있어요.\n규칙대로 색칠하면\n**숨은 그림**이 나타나요!"},suggested_extras:["q_hidden_picture","b_color_number_book"]},
  {id:"s04",stage:"전개",block:"concept",data:{title:"색의 약속을 정해요",bidirect:["20~29 → 노랑","30~39 → 파랑","40~49 → 빨강","수 범위마다 **색을 약속**해요"]},suggested_extras:["m_range_first","r_paint_by_number"]},
  {id:"s05",stage:"전개",block:"concept",data:{title:"예시를 같이 봐요 — 24",bidirect:["24는 20~29 범위","약속한 색 → **노랑**","칸을 노랑으로 칠해요","이렇게 하나씩 칠해 봐요"]},suggested_extras:["m_color_promise"]},
  {id:"s06",stage:"전개",block:"basic_problem",data:{title:"수를 눌러 색을 칠해 봐요",question:"각 칸의 수를 보고\n약속한 색으로 칠해 봐요.\n묶음 수로 범위를 빠르게 찾아요.",answer:"약속한 색으로 칠해요 — 묶음 수로 범위를 빠르게 찾아요",note:"범위별 색 약속을 지켜요."},suggested_extras:["g_paint_clicker","x_wrong_color_pick"]},
  {id:"s06b",stage:"전개",block:"misconception",data:{title:"조심해요",label:"오개념 주의",wrong:"색만 보고 아무렇게나 놓아도 돼",right:"같은 색(범위) 안에서도 **큰 수부터** 차례로 정렬해요.",hint:"색으로 범위, 그 안에서 다시 크기 비교."},suggested_extras:[]},
  {id:"s07",stage:"전개",block:"basic_problem",data:{title:"더 많은 수를 칠해 봐요",question:"남은 칸도 모두 칠해요.\n조금씩 **그림 모양**이\n보이기 시작해요.",answer:"규칙대로 남은 칸도 칠하면 숨은 그림이 드러나요",note:"빠뜨린 칸 없이 칠해요."},suggested_extras:["x_count_skip"]},
  {id:"s08",stage:"기본문제",block:"basic_problem",data:{title:"큰 순서대로 자리를 정해 봐요",question:"칠한 수들을\n**큰 순서대로** 자리에 놓아\n그림을 완성해요.",answer:"큰 수부터 차례로 — 십의 자리(묶음)부터 비교",note:"정렬은 큰 수부터 놓아요."},suggested_extras:["m_step_by_step_sort","m_pair_compare_extend"]},
  {id:"s09",stage:"기본문제",block:"basic_problem",data:{title:"그림 완성 1",question:"규칙대로 다 칠하면\n어떤 그림이 나올까요?\n친구와 비교해 봐요.",answer:"규칙대로 다 칠하면 숨은 그림 완성 (그림은 활동지마다 달라요)",note:"열린 활동. 결과 그림은 활동지에 따라 달라요."},suggested_extras:["q_hidden_picture"]},
  {id:"s10",stage:"기본문제",block:"basic_problem",data:{title:"그림 완성 2",question:"다른 숨은 그림도\n같은 방법으로 완성해 봐요.",answer:"같은 방법으로 색칠해 완성 (그림은 활동지마다 달라요)",note:"열린 활동."},suggested_extras:["e_more_ranges"]},
  {id:"s11",stage:"기본문제",block:"basic_problem",data:{title:"정렬 워밍업",question:"수 두 개 중\n더 큰 수를 먼저 골라\n정렬 연습을 해 봐요.",answer:"두 수 중 큰 수를 먼저 골라요",note:"십의 자리부터 비교."},suggested_extras:["m_personal_choice_first"]},
  {id:"s12",stage:"응용문제",block:"card_arrange",data:{title:"네 수를 큰 순서로",steps:["수 카드 — 38 · 21 · 45 · 30","**큰 순서대로** 놓아요","45 → 38 → 30 → 21","자리를 정해 봐요"]},suggested_extras:["a_four_number_sort","r_book_height_sort"]},
  {id:"s13",stage:"응용문제",block:"card_arrange",data:{title:"네 수를 작은 순서로",steps:["같은 카드를 이번엔","**작은 순서대로** 놓아요","21 → 30 → 38 → 45","거꾸로 자리를 정해요"]},suggested_extras:["x_partial_sort_only"]},
  {id:"s14",stage:"응용문제",block:"question",data:{title:"출발이 달라도 도착은 같아요",content:"큰 순서로 놓든 작은 순서로 놓든\n**수의 자리 관계**는 같아요.\n어느 쪽으로 세워도 규칙은 하나예요."},suggested_extras:["q_my_sort_rule"]},
  {id:"s15",stage:"응용문제",block:"advanced_problem",data:{title:"색을 보고 큰 순서로",question:"색칠한 수들을\n색(범위)을 단서로\n**큰 순서대로** 정렬해 봐요.",answer:"색(범위)을 단서로 큰 수부터 차례로 정렬해요",note:"범위가 큰 색부터 놓아요."},suggested_extras:["m_no_win_lose_play","r_lego_sort"]},
  {id:"s16",stage:"정리",block:"summary",data:{title:"5단원에서 배운 것",points:["50까지 수를 **묶음과 낱개**로 세기","수의 **순서**와 **크기 비교**","**모으기·가르기**","수를 색·순서로 놀이하며 익혔어요"]},suggested_extras:["a_unit_reflection","r_summer_close","b_color_number_book"]},
  {id:"s17",stage:"정리",block:"question",data:{title:"스스로 평가해 봐요",content:"수를 색 규칙대로 칠할 수 있나요?\n수를 큰 순서·작은 순서로 정렬할 수 있나요?\n5단원이 즐거웠나요?"},suggested_extras:[]},
  {id:"s18",stage:"정리",block:"next_lesson",data:{title:"5단원을 마쳐요",preview:"50까지의 수를 모두 배웠어요!\n잘 해냈어요. 다음 단원에서 만나요 👋",emoji:""},suggested_extras:["e_grade2_preview","g_bingo_bounce","a_bingo_play"]}
    ],
    extras: [
      {
          "id": "v_color_by_number",
          "type": "video",
          "icon": "🎥",
          "title": "수로 색칠하는 미술 영상",
          "url": "https://www.youtube.com/results?search_query=수로+색칠하기+컬러+바이+넘버+초등+1학년",
          "description": "칸마다 수가 적혀 있고 약속한 색으로 칠하면 숨은 그림이 나타나는 영상. 도입 자리에 한 번 보면 활동 흐름을 빠르게 이해해요.",
          "source": "유튜브 다수 공개 영상 — 교사 사전 확인 권장",
          "fit_slides": [
              "cover"
          ]
      },
      {
          "id": "r_paint_by_number",
          "type": "real_world",
          "icon": "🌍",
          "title": "컬러링북 — 수 보고 색칠",
          "content": "문구점에서 흔히 볼 수 있는 '컬러 바이 넘버' 컬러링북. 각 칸 수에 맞춰 색을 칠하면 그림 완성. 본 차시 활동 1과 그대로 닮은 일상 자리.",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "r_lego_sort",
          "type": "real_world",
          "icon": "🌍",
          "title": "레고 블럭 크기 정렬",
          "content": "레고 블럭을 작은 것부터 큰 것·큰 것부터 작은 것 순서로 줄을 세워 보기. 출발 순서가 달라도 도착 줄은 같음을 직접 손으로 확인하는 자리.",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "r_book_height_sort",
          "type": "real_world",
          "icon": "🌍",
          "title": "책꽂이 키 순서 정렬",
          "content": "책꽂이에 책을 키 순서대로 세우면 정돈됨이 느껴져요. 책을 한 권씩 꺼내 다시 자리 정하기. 정렬 알고리즘을 손으로 경험하는 자리.",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "r_summer_close",
          "type": "real_world",
          "icon": "🌍",
          "title": "건강한 여름 마무리",
          "content": "단원 도입에서 시작한 건강한 여름 실천 활동의 마지막 자리. 50까지 수가 단원 동안 어떤 활동과 함께 했는지 돌아보는 자리.",
          "source": "교사용 지도서 5단원 11차시 — 단원 실천 활동",
          "fit_slides": [
              "summary"
          ]
      },
      {
          "id": "q_hidden_picture",
          "type": "fun_question",
          "icon": "💡",
          "title": "숨겨진 그림은 뭘까?",
          "content": "칸을 색칠하기 전에 숨겨진 그림을 미리 예상해 보기. 수의 분포를 보고 어떤 모양이 나올지 추측. 예상 → 색칠 → 확인의 흐름 자리.",
          "source": "교사용 지도서 5단원 11차시 — 활동 1",
          "fit_slides": [
              "motivate",
              "basic_problem"
          ]
      },
      {
          "id": "q_my_sort_rule",
          "type": "fun_question",
          "icon": "💡",
          "title": "내가 만든 정렬 규칙",
          "content": "큰 순서·작은 순서 외에 다른 정렬 규칙을 만들어 볼 수 있을까. 예: 홀수 먼저·짝수 나중에. 정렬에 다양한 규칙이 있음을 깨닫는 자리.",
          "fit_slides": [
              "question"
          ]
      },
      {
          "id": "e_more_ranges",
          "type": "extension",
          "icon": "⬆",
          "title": "4·5개 색 범위로 확장",
          "content": "3개 색 범위(1~20·21~30·31~50)를 4개·5개로 늘리기. 예: 1~10·11~20·21~30·31~40·41~50 다섯 색. 범위가 좁아져 활동이 더 정교해져요.",
          "source": "교사용 지도서 5단원 11차시 — 학생 예상 반응",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "e_grade2_preview",
          "type": "extension",
          "icon": "⬆",
          "title": "다음 학년 — 100까지",
          "content": "1학년 1학기는 50까지. 2학기에는 100까지, 2학년에는 1000까지 확장돼요. 50까지 단단해진 수 감각이 다음 학년의 토대. 다음 자리로 가는 신호.",
          "fit_slides": [
              "next_lesson"
          ]
      },
      {
          "id": "g_bingo_bounce",
          "type": "game",
          "icon": "🎮",
          "title": "바둑돌 빙고 놀이",
          "content": "지도서 '이런 활동도 해 봐요'. 2명·바둑돌·빙고 놀이판·색연필 2색. 바둑돌 튕겨 도착한 칸의 수 말하기. 직선 4개 연결이면 승. 단원 통합 자리.",
          "source": "교사용 지도서 5단원 11차시 — 이런 활동도 해 봐요",
          "fit_slides": [
              "next_lesson"
          ]
      },
      {
          "id": "g_paint_clicker",
          "type": "game",
          "icon": "🎮",
          "title": "색칠 클릭 게임",
          "content": "칸 클릭 시 자동으로 약속된 색이 떠오르고, 학생이 그 색을 다시 한 번 누르면 칸이 칠해지는 메카닉. 묶음 수로 범위를 빠르게 알아맞히는 자리.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "m_range_first",
          "type": "tip",
          "icon": "🧩",
          "title": "묶음 수로 범위 빠르게",
          "content": "24는 묶음 2 → 21~30 범위. 묶음 수만 보고도 범위를 1초 안에 정할 수 있어요. 9차에서 익힌 묶음 비교의 직관이 그대로 적용.",
          "fit_slides": [
              "concept"
          ]
      },
      {
          "id": "m_color_promise",
          "type": "tip",
          "icon": "🧩",
          "title": "색의 약속 먼저",
          "content": "색칠 시작 전 어떤 범위에 어떤 색을 쓸지 약속 정하기. 약속이 명확해야 헷갈리지 않아요. 활동 전 약속이 활동의 절반.",
          "source": "교사용 지도서 5단원 11차시 — 활동 1",
          "fit_slides": [
              "objective",
              "concept"
          ]
      },
      {
          "id": "m_no_win_lose_play",
          "type": "tip",
          "icon": "🧩",
          "title": "창의 놀이는 승패 X",
          "content": "색칠·정렬 활동은 누가 빠른가가 아니에요. 결과의 그림이 친구마다 어떻게 다른지 비교가 더 재미있어요. 과정과 결과 모두 가치 있는 자리.",
          "source": "교사용 지도서 5단원 11차시 — 활동 1 유의점",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "m_step_by_step_sort",
          "type": "tip",
          "icon": "🧩",
          "title": "단계별 정렬 안내",
          "content": "4개 수 정렬은 한 번에 4자리를 정하는 게 아니라 한 단계씩. ① 첫 수 자리 → ② 다음 수 비교 후 자리 → ③ 또 다음 수 … 단계 분리가 어려움 줄여요.",
          "source": "교사용 지도서 5단원 11차시 — 활동 2 유의점",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "m_pair_compare_extend",
          "type": "tip",
          "icon": "🧩",
          "title": "두 수 비교를 네 수로",
          "content": "4개 수 정렬도 결국 두 수 비교의 반복. 두 수 비교가 익숙하면 네 수 정렬도 풀려요. 9차 두 수 비교 → 11차 네 수 정렬의 자연 확장.",
          "source": "교사용 지도서 5단원 11차시 — 활동 2 유의점",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "m_personal_choice_first",
          "type": "tip",
          "icon": "🧩",
          "title": "개인 활동으로 먼저",
          "content": "활동 2 ③단계는 개인 활동 자리. 수 카드를 직접 만들어 자기 자리에서 옮겨가며 진행. 짝·모둠 자리로 가기 전 자기 시도 자리.",
          "source": "교사용 지도서 5단원 11차시 — 활동 2 유의점",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "b_color_number_book",
          "type": "book",
          "icon": "📖",
          "title": "수와 색 그림책",
          "content": "수와 색을 함께 다루는 그림책. 1~50까지 수가 일상의 색과 어떻게 연결되는지 보여 주는 책. 본 차시 활동 1의 맥락과 잘 맞아요.",
          "source": "여러 그림책 — 교사 선택",
          "fit_slides": [
              "motivate",
              "summary"
          ]
      },
      {
          "id": "x_wrong_color_pick",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 범위 다른 색 선택",
          "content": "24가 1~20 범위에 속한다고 잘못 판단해 21~30 색이 아닌 1~20 색으로 칠하는 경우. 묶음 수를 다시 짚으며 24의 묶음이 2임을 보여 주세요.",
          "source": "교사용 지도서 5단원 11차시 — 학생 예상 반응",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "x_partial_sort_only",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 두 수만 비교하고 멈춤",
          "content": "4개 수 정렬에서 두 수만 비교하고 나머지를 정리하지 못하는 경우. 두 수 비교가 가능하니 단계를 끊지 말고 다음 비교로 이어 가도록 안내.",
          "source": "교사용 지도서 5단원 11차시 — 학생 예상 반응",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "x_count_skip",
          "type": "misconception",
          "icon": "❓",
          "title": "오개념: 색칠 칸 누락",
          "content": "색칠 활동에서 한두 칸을 빠뜨려 숨은 그림이 잘 나타나지 않는 경우. 한 줄씩 위에서 아래로 차례로 칠하면 누락이 줄어요. 순서대로 칠하기 안내.",
          "fit_slides": [
              "basic_problem"
          ]
      },
      {
          "id": "a_color_range_paint",
          "type": "other_activity",
          "icon": "📚",
          "title": "활동 1 — 수 범위 색칠",
          "content": "활동 1. 칸칸에 수가 적힌 그림판을 약속한 색으로 칠해 숨은 그림(50) 찾기. 1~20 빨강·21~30 파랑·31~50 초록. 단원 통합 시각 자료.",
          "source": "교사용 지도서 5단원 11차시 — 활동 1",
          "fit_slides": [
              "objective"
          ]
      },
      {
          "id": "a_four_number_sort",
          "type": "other_activity",
          "icon": "📚",
          "title": "활동 2 — 네 수 정렬",
          "content": "활동 2. 4개 수를 학생이 자유롭게 적고 화살표 따라 자리 정하기. 더 큰 수는 그대로·더 작은 수는 자리 바꿈. 내림차순 알고리즘 첫 경험.",
          "source": "교사용 지도서 5단원 11차시 — 활동 2",
          "fit_slides": [
              "advanced_problem"
          ]
      },
      {
          "id": "a_bingo_play",
          "type": "other_activity",
          "icon": "📚",
          "title": "바둑돌 빙고 활동",
          "content": "이런 활동도 해 봐요. 빙고 놀이판(1~41 가로)·바둑돌·색연필 2색. 바둑돌 튕겨 도착 수 말하기·맞으면 색칠. 직선 4개 연결 시 승. 단원 마무리 놀이.",
          "source": "교사용 지도서 5단원 11차시 — 이런 활동도 해 봐요",
          "fit_slides": [
              "next_lesson"
          ]
      },
      {
          "id": "a_unit_reflection",
          "type": "other_activity",
          "icon": "📚",
          "title": "5단원 학습 회고",
          "content": "단원에서 가장 재미있던 활동·가장 어려웠던 자리·다시 해 보고 싶은 활동을 학생이 말해 보기. 단원 학습을 자기 언어로 정리하는 자리.",
          "fit_slides": [
              "summary"
          ]
      }
    ]
  };

})();
