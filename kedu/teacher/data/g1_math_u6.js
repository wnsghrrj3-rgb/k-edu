/* ============================================================================
   1학년 수학 6단원 (수학이랑 함께해요) 차시 데이터
   - 키 형식: window.LESSONS["u6_l{NN}"]
   - 프로젝트 기반 학습 단원(수학 보물 찾기 → 표현 → 전시회).
   - 학생용 self-directed 자료는 제작 X(야외 탐험·실물 표현·전시회 = 디지털
     단독 불가). 케이티처는 교사가 칠판/TV에 띄워 활동을 안내하는 진행 자료로
     성립 → offline_activity(🙋 교실 활동) 중심 + concept/game/summary 보조.
   - 소스: kedu/curriculum/math/g1/unit6 차시별 _SOURCE.md (지도서 분석).
   - 형식 기준: g1_math_u1.js u1_l12(만들기 차시) — 18슬 5단계 골격 변형.
   ============================================================================ */

(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ====================== u6_l01 — 두근두근 수학 보물 탐험 ====================== */
  window.LESSONS["u6_l01"] =
  {
    "meta": {
      "title": "1학년 수학 6단원 1차시",
      "subtitle": "두근두근 수학 보물 탐험 (준비해요·계획해요)",
      "std": "[2수01-01]",
      "duration": 40,
      "lesson_format": " · 40분 표준 증보(3요소·프로젝트)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "도입",
        "block": "cover",
        "data": {
          "title": "수학이랑 함께해요\n두근두근\n수학 보물 탐험",
          "emoji": "🔍"
        },
        "suggested_extras": [
          "v_treasure_intro",
          "r_math_around"
        ]
      },
      {
        "id": "s02",
        "stage": "도입",
        "block": "motivate",
        "data": {
          "scene_title": "토끼풀에서 보물을 찾았어요",
          "kids": [
            {
              "face": "🍀",
              "label": "토끼풀 잎이\n세 장이니까\n수 **3**!"
            },
            {
              "face": "😮",
              "label": "잎 모양이\n**8**을 닮았어!"
            },
            {
              "face": "🌼",
              "label": "민들레도\n수학 보물일까?"
            }
          ],
          "question": "수학 보물은 무엇이라고 생각하나요?\n만화 속 친구들은 무엇을 찾았나요?",
          "img": "assets/photo/math/treasure_explore.jpg"
        },
        "suggested_extras": [
          "q_what_is_treasure",
          "t_first_intuition"
        ]
      },
      {
        "id": "s03",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "1학기에 배운 수학",
          "content": "**1단원** 9까지의 수 · **2단원** 여러 가지 모양\n**3단원** 덧셈과 뺄셈 · **4단원** 비교하기\n**5단원** 50까지의 수\n\n이 모든 것이 우리 주변에 **숨어 있어요**"
        },
        "suggested_extras": [
          "t_recall_five_units"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "수학 보물이란?",
          "content": "우리 주변의 **자연과 물건**에서 찾은\n**수 · 모양 · 더하기 · 빼기 · 비교**예요.\n\n학교 화단, 놀이터, 운동장 어디에나\n수학 보물이 숨어 있어요."
        },
        "suggested_extras": [
          "r_nature_math",
          "b_math_in_nature"
        ],
        "tnote": {
          "ask": [
            "수학은 교실 밖 어디에 숨어 있을까?"
          ],
          "watch": "생활 속 수학(수·모양·규칙)을 보물로 연결",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "이런 보물을 찾을 수 있어요",
          "bidirect": [
            "**수** — 꽃잎 5장 · 등나무 열매 17개",
            "**모양** — 기둥(⬛) · 정글짐(▢) · 동그란 잎(⬤)",
            "**덧셈·뺄셈** — 개미 8 + 공벌레 2 = 10",
            "**비교** — 시소보다 철봉이 더 높다",
            "**마음** — 보물을 찾는 즐거운 표정"
          ]
        },
        "suggested_extras": [
          "t_value_treasure",
          "x_only_number"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "question",
        "data": {
          "title": "우리 학교 어디에 숨어 있을까?",
          "content": "교실 · 복도 · 운동장 · 화단 · 놀이터…\n어디에서 수학 보물을 찾을 수 있을까요?\n\n친구들과 이야기해 봐요."
        },
        "suggested_extras": [
          "q_where_to_look",
          "e_classroom_first"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "찾을 장소 정하기",
          "tag": "교실에서 함께 해요",
          "icon": "🗺️",
          "body": "각자(또는 모둠) **어디서** 보물을 찾을지 정해요.\n같은 장소를 고른 친구끼리 모둠을 만들어도 좋아요.\n탐험 장소를 **스스로** 고르면 더 신나요.",
          "materials": "학교 지도(있으면) · 메모지"
        },
        "suggested_extras": [
          "t_student_choice"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "어떻게 가지고 올까?",
          "tag": "교실에서 함께 해요",
          "icon": "🧺",
          "body": "찾은 보물을 교실로 가져오는 방법을 생각해요.\n· 작은 것은 **상자·종이 가방**에 담기\n· 가져올 수 없는 것은 **사진**으로 찍기\n· 메모지에 **기록**하기",
          "materials": "상자·종이 가방 · 메모지 · 태블릿(있으면)"
        },
        "suggested_extras": [
          "t_photo_option",
          "o_draw_instead"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "나가기 전 약속 🤝",
          "tag": "꼭 함께 확인해요",
          "icon": "⚠️",
          "body": "· 친구와 떨어지지 않고 **안전**하게\n· 살아 있는 것은 **소중히**, 관찰 후 **제자리에**\n· 정해진 **시간** 안에 돌아오기",
          "materials": "—"
        },
        "suggested_extras": [
          "t_safety_first",
          "x_take_living_thing"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "밖으로 나가 보물 찾기",
          "tag": "🙋 야외 탐험",
          "icon": "🚶",
          "body": "운동장 · 화단 · 놀이터를 둘러보며\n수학 보물을 찾아요.\n하나를 찾으면 **다른 종류**도 찾아봐요.\n(수를 찾았다면 모양도!)",
          "materials": "메모지 · 상자 · 태블릿"
        },
        "suggested_extras": [
          "q_found_what",
          "t_find_other_kind"
        ]
      },
      {
        "id": "s11",
        "stage": "응용문제",
        "block": "concept",
        "data": {
          "title": "눈에 안 보이는 보물도 있어요",
          "content": "**수와 모양**만 보물이 아니에요.\n· 보물을 찾을 때 **즐거운 내 마음**\n· 새로운 걸 보고 **궁금해하는 호기심**\n· 친구와 함께한 **표정**\n이것도 모두 수학 보물이에요."
        },
        "suggested_extras": [
          "t_attitude_treasure",
          "r_curiosity"
        ]
      },
      {
        "id": "s12",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "사진으로 담기",
          "tag": "🙋 교실 활동(선택)",
          "icon": "📷",
          "body": "가져올 수 없는 큰 보물(나무·정글짐·미끄럼틀)은\n태블릿으로 **사진**을 찍어요.\n나중에 전시회에서 보여 줄 수 있어요.",
          "materials": "태블릿 컴퓨터"
        },
        "suggested_extras": [
          "e_digital_literacy"
        ]
      },
      {
        "id": "s100",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 돌아봐요",
          "items": [
            {
              "q": "오늘 찾은 수학 보물을 하나 말해 봐요.",
              "a": "여러 답 (수·모양·규칙 등)"
            },
            {
              "q": "눈에 안 보이는 수학 보물도 있을까요?",
              "a": "있어요 (순서·규칙 등)"
            },
            {
              "q": "다음엔 어디서 더 찾아보고 싶나요?",
              "a": "여러 답"
            }
          ],
          "self": [
            "즐겁게 탐험했어요",
            "조금 아쉬워요",
            "더 찾아보고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s13",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 찾은 보물 나누기",
          "points": [
            "우리 주변에 **수학 보물**이 숨어 있어요",
            "**수 · 모양 · 식 · 비교**를 찾았어요",
            "보이지 않는 **마음**도 보물이에요",
            "안전하게, 생명을 **소중히** 하며 찾았어요"
          ]
        },
        "suggested_extras": [
          "q_best_treasure"
        ]
      },
      {
        "id": "s14",
        "stage": "정리",
        "block": "question",
        "data": {
          "title": "이 보물로 무엇을 할까?",
          "content": "찾은 보물을 친구들에게 **보여 주고** 싶어요.\n어떤 방법으로 보여 줄 수 있을까요?\n(그리기? 만들기? 몸으로?)"
        },
        "suggested_extras": [
          "q_how_to_show",
          "e_plan_next"
        ]
      },
      {
        "id": "s15",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간에는",
          "preview": "찾은 수학 보물을\n**여러 가지 방법**으로 나타내요!\n그려서 · 만들어서 · 몸으로 표현해요.",
          "emoji": "🎨"
        },
        "suggested_extras": [
          "e_l02_preview"
        ]
      }
    ],
    "extras": [
      {
        "id": "v_treasure_intro",
        "type": "video",
        "icon": "🎥",
        "title": "주변에서 수학 찾기 영상",
        "url": "https://www.youtube.com/results?search_query=일상+속+수학+1학년+모양과+수",
        "description": "생활 속에 숨은 수와 모양을 보여 주는 짧은 영상. 도입 동기 유발.",
        "source": "유튜브 공개 영상 — 교사 선택",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "r_math_around",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 교실 속 수학",
        "content": "출석 번호(수), 창문(네모), 시계(동그라미), 책상 줄 세기(덧셈). 교실 안에서 먼저 한두 개 함께 찾아 주면 야외 활동이 쉬워져요.",
        "fit_slides": [
          "cover",
          "concept"
        ]
      },
      {
        "id": "q_what_is_treasure",
        "type": "fun_question",
        "icon": "💡",
        "title": "보물은 꼭 반짝일까?",
        "content": "\"보물 하면 무엇이 떠오르나요? 그런데 오늘 찾을 보물은 반짝이지 않아요. 어떤 보물일까요?\" 호기심을 끌어내는 발문.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_first_intuition",
        "type": "tip",
        "icon": "🧩",
        "title": "첫 시간엔 수·모양 중심",
        "content": "수학 보물 개념이 넓지만(지식·과정·태도) 첫 시간엔 '수'와 '모양'에 초점을 맞춰 직관적으로 연결하게 하세요. 추상 범주는 활동하며 자연스럽게.",
        "fit_slides": [
          "motivate",
          "review"
        ]
      },
      {
        "id": "t_recall_five_units",
        "type": "tip",
        "icon": "🧩",
        "title": "5단원 한 줄씩 복습",
        "content": "각 단원을 한 문장으로만 짧게 떠올려 주세요. 길게 복습하면 본 활동(탐험) 시간이 줄어요.",
        "fit_slides": [
          "review"
        ]
      },
      {
        "id": "r_nature_math",
        "type": "real_world",
        "icon": "🌍",
        "title": "자연 속 수학 사례",
        "content": "꽃잎 수, 솔방울 나선, 나뭇잎 대칭, 거미줄 모양. 자연은 수학으로 가득해요. 한 가지만 미리 보여 주면 학생들이 '아!' 하고 눈이 열려요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "b_math_in_nature",
        "type": "book",
        "icon": "📖",
        "title": "그림책 《자연에서 찾은 모양과 수》",
        "content": "자연물 속 수와 모양을 다룬 그림책류. 도입에 한두 장면 읽어 주면 탐험 동기가 살아나요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "t_value_treasure",
        "type": "tip",
        "icon": "🧩",
        "title": "가치·태도 보물 먼저 예시",
        "content": "'즐거운 마음'도 보물이라는 건 1학년에게 어려워요. 교사가 \"보물을 찾을 때 기분이 어때요? 그 기분도 보물이에요\"라고 먼저 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_only_number",
        "type": "misconception",
        "icon": "❓",
        "title": "오개념: 수만 보물이다",
        "content": "수만 찾으려는 학생이 많아요. \"모양 보물도 있어요, 마음 보물도 있어요\"라고 종류를 넓혀 주세요. 다양한 답을 모두 허용하는 분위기가 중요.",
        "fit_slides": [
          "concept",
          "motivate"
        ]
      },
      {
        "id": "q_where_to_look",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 보물이 많을 곳은?",
        "content": "\"우리 학교에서 수학 보물이 가장 많이 숨어 있을 곳은 어디일까요?\" 추측하게 한 뒤 실제로 가서 확인하면 재미있어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_classroom_first",
        "type": "extension",
        "icon": "⬆",
        "title": "교실에서 연습 한 바퀴",
        "content": "야외에 나가기 전에 교실에서 보물 한두 개를 함께 찾아보면 활동 방법을 확실히 익힐 수 있어요.",
        "fit_slides": [
          "question",
          "offline_activity"
        ]
      },
      {
        "id": "t_student_choice",
        "type": "tip",
        "icon": "🧩",
        "title": "장소를 스스로 고르게",
        "content": "교사가 정해 주기보다 학생이 탐험 장소를 고르게 하면 주도성이 높아져요. 모둠 구성도 자율로.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "t_photo_option",
        "type": "tip",
        "icon": "🧩",
        "title": "사진은 선택지",
        "content": "스마트 기기가 부족하면 사진 대신 메모·그림으로 충분해요. 기기 유무에 활동이 좌우되지 않게 하세요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "o_draw_instead",
        "type": "other_activity",
        "icon": "📚",
        "title": "대안: 보물 그려 오기",
        "content": "가져올 수도, 찍을 수도 없을 때는 메모지에 간단히 그려 오게 하면 돼요. 모든 학생이 결과물을 가지게 됩니다.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "t_safety_first",
        "type": "tip",
        "icon": "🧩",
        "title": "안전 약속은 꼭",
        "content": "야외로 나가기 전 안전 교육을 반드시 실시하세요. 짝·모둠과 떨어지지 않기, 정해진 구역 벗어나지 않기를 분명히.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "x_take_living_thing",
        "type": "misconception",
        "icon": "❓",
        "title": "주의: 살아 있는 것 가져오기",
        "content": "곤충·식물을 함부로 가져오지 않도록 안내하세요. 관찰 후 제자리에 두며 생명의 소중함을 함께 이야기하면 좋은 인성 교육이 됩니다.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "q_found_what",
        "type": "fun_question",
        "icon": "💡",
        "title": "무엇을 찾았어?",
        "content": "탐험 중 \"무엇을 찾았어요? 왜 그게 수학 보물이에요?\"라고 물어 까닭을 말하게 하면 추론·의사소통 역량이 자라요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "t_find_other_kind",
        "type": "tip",
        "icon": "🧩",
        "title": "다른 종류도 찾도록",
        "content": "수를 잘 찾는 학생에게는 \"모양 보물도 찾아볼까?\"라고 권해 한 종류에 머무르지 않게 하세요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "t_attitude_treasure",
        "type": "tip",
        "icon": "🧩",
        "title": "표정·마음도 보물",
        "content": "활동 중 학생의 즐거운 표정을 짚어 주며 \"이 마음도 보물이야\"라고 연결해 주세요. 정의적 영역까지 자연스럽게 닿아요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "r_curiosity",
        "type": "real_world",
        "icon": "🌍",
        "title": "호기심이라는 보물",
        "content": "\"왜 그럴까?\" 하고 궁금해하는 마음이 수학을 잘하게 만드는 진짜 보물이라고 이야기해 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_digital_literacy",
        "type": "extension",
        "icon": "⬆",
        "title": "확장: 사진 정리하기",
        "content": "찍은 사진을 종류별(수·모양 등)로 모아 두면 다음 시간 표현·전시에 그대로 쓸 수 있어요. 디지털 리터러시 연습도 됩니다.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "q_best_treasure",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 마음에 든 보물은?",
        "content": "\"오늘 찾은 것 중 가장 마음에 드는 보물은 무엇이고, 왜인가요?\" 정리 단계에서 한 명씩 나누면 좋아요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "q_how_to_show",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떻게 보여 줄까?",
        "content": "\"이 보물을 친구들에게 어떻게 보여 주면 좋을까요?\" 다음 차시(표현)로 자연스럽게 이어 주는 발문.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "e_plan_next",
        "type": "extension",
        "icon": "⬆",
        "title": "확장: 표현 방법 미리 정하기",
        "content": "찾은 보물별로 어떻게 표현할지(그리기/만들기/몸으로) 미리 생각해 두면 2차시가 매끄러워요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_l02_preview",
        "type": "extension",
        "icon": "⬆",
        "title": "다음 차시 준비물 안내",
        "content": "다음 시간을 위해 색연필·점토·색종이 등을 미리 준비해 오라고 안내해 두세요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u6_l02"] =
  {
    "meta": {
      "title": "1학년 수학 6단원 2차시",
      "subtitle": "수학 보물을 여러 가지 방법으로 나타내요 (해 봐요)",
      "std": "[2수01-01]",
      "duration": 40,
      "lesson_format": " · 40분 표준 증보(3요소·프로젝트)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "도입",
        "block": "cover",
        "data": {
          "title": "수학 보물을\n여러 가지 방법으로\n나타내요",
          "emoji": "🎨"
        },
        "suggested_extras": [
          "v_express_intro",
          "t_pick_one_way"
        ]
      },
      {
        "id": "s02",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간 우리의 모습",
          "content": "지난 시간 우리는 학교 곳곳에서\n**수학 보물**을 찾았어요.\n\n(탐험 사진을 함께 보며)\n무엇을 찾았는지, 어떤 기분이었는지\n이야기해 봐요.",
          "items": [
            {
              "q": "지난 시간에 찾은 수학 보물은 무엇이었나요?",
              "a": "여러 답 (수·모양·규칙)"
            },
            {
              "q": "수학 보물은 눈에 보이는 것만 있나요?",
              "a": "아니요"
            }
          ],
          "from": "u6_l01"
        },
        "suggested_extras": [
          "o_show_photos",
          "q_how_did_you_feel"
        ]
      },
      {
        "id": "s03",
        "stage": "도입",
        "block": "motivate",
        "data": {
          "scene_title": "어떻게 보여 줄까?",
          "kids": [
            {
              "face": "✏️",
              "label": "**그려서**\n보여 줄래!"
            },
            {
              "face": "🧱",
              "label": "**만들어서**\n보여 줄래!"
            },
            {
              "face": "🙆",
              "label": "**몸으로**\n표현할래!"
            }
          ],
          "question": "찾은 보물을 친구들에게\n어떻게 보여 주고 싶나요?",
          "img": "assets/photo/math/treasure_express.jpg"
        },
        "suggested_extras": [
          "q_which_way",
          "t_respect_choice"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "표현하는 세 가지 방법",
          "bidirect": [
            "**그려서** — 색연필·사인펜·크레파스로 그리기",
            "**만들어서** — 점토·색종이·연결 모형으로 만들기",
            "**몸으로** — 친구와 움직임·동작으로 나타내기"
          ]
        },
        "suggested_extras": [
          "t_any_way_ok",
          "e_mix_ways"
        ],
        "tnote": {
          "ask": [
            "같은 보물도 여러 방법으로 나타낼 수 있을까?"
          ],
          "watch": "그림·몸(타블로)·만들기 등 다양한 표현 존중",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "game",
        "data": {
          "title": "보물 알아맞히기 놀이",
          "steps": [
            "\"나는 ○○에서 보물을 찾았어\"라고 힌트 주기",
            "친구들이 무슨 보물인지 까닭과 함께 맞히기",
            "예: \"개미 모양이 8을 닮았어!\"",
            "문제 낸 친구가 정답과 까닭 말하기",
            "맞힌 친구가 다음 문제 내기"
          ]
        },
        "suggested_extras": [
          "q_guess_game",
          "t_guide_reason"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "몸으로 표현하기 — 타블로",
          "content": "**타블로**는 몸으로 만드는 **정지 장면**이에요.\n\n· 표현할 보물을 정해요\n· \"하나, 둘, 셋, 찰칵!\" 하면 **멈춰요**\n· 친구들이 무엇인지 맞혀요\n· 정지 장면을 풀고 설명해요"
        },
        "suggested_extras": [
          "v_tableau",
          "t_tableau_tip"
        ]
      },
      {
        "id": "s07",
        "stage": "전개",
        "block": "question",
        "data": {
          "title": "나는 어떻게 표현할까?",
          "content": "내가 찾은 보물에는\n어떤 방법이 가장 잘 어울릴까요?\n\n그려서? 만들어서? 몸으로?\n하나를 골라 봐요."
        },
        "suggested_extras": [
          "q_my_choice"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "그려서 표현하기",
          "tag": "🙋 교실 활동",
          "icon": "✏️",
          "body": "색연필·사인펜·크레파스로\n찾은 수학 보물을 그려요.\n보물 옆에 **수나 모양**을 함께 써도 좋아요.",
          "materials": "도화지 · 색연필 · 사인펜 · 크레파스"
        },
        "suggested_extras": [
          "t_draw_with_label"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "만들어서 표현하기",
          "tag": "🙋 교실 활동",
          "icon": "🧱",
          "body": "점토 · 색종이 · 연결 모형으로\n보물을 입체로 만들어요.\n이면지·다 쓴 통도 재료가 돼요.",
          "materials": "점토 · 색종이 · 연결 모형 · 가위 · 풀 · 재활용 재료"
        },
        "suggested_extras": [
          "r_recycle",
          "o_clay_shape"
        ]
      },
      {
        "id": "s10",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "몸으로 표현하기",
          "tag": "🙋 교실 활동",
          "icon": "🙆",
          "body": "친구들과 함께 움직임을 만들어\n자연 속 보물을 몸으로 나타내요.\n타블로(정지 장면)로 만들어도 좋아요.",
          "materials": "—"
        },
        "suggested_extras": [
          "t_body_safe"
        ]
      },
      {
        "id": "s11",
        "stage": "응용문제",
        "block": "game",
        "data": {
          "title": "내 보물 소개하기",
          "steps": [
            "\"내가 찾은 보물은 ○○야\"라고 말하기",
            "친구가 \"어디서?\", \"왜?\"라고 묻기",
            "찾은 장소와 까닭을 소개하기",
            "소개 끝난 친구가 다음 친구를 지명",
            "지명받은 친구가 나와서 소개"
          ]
        },
        "suggested_extras": [
          "t_fair_turn",
          "x_skip_quiet"
        ]
      },
      {
        "id": "s12",
        "stage": "응용문제",
        "block": "concept",
        "data": {
          "title": "재료를 아껴 써요",
          "content": "이면지, 다 쓴 플라스틱 통도\n훌륭한 표현 재료예요.\n\n재료를 아껴 쓰며\n**환경을 사랑하는 마음**도 함께 길러요."
        },
        "suggested_extras": [
          "r_recycle_value"
        ]
      },
      {
        "id": "s100",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 돌아봐요",
          "items": [
            {
              "q": "수학 보물을 나타내는 방법을 하나 말해 봐요.",
              "a": "여러 답 (그림·몸·만들기)"
            },
            {
              "q": "몸으로 표현하는 방법을 무엇이라고 했나요?",
              "a": "타블로"
            },
            {
              "q": "재료를 아껴 쓰려면 어떻게 하면 좋을까요?",
              "a": "필요한 만큼만 써요"
            }
          ],
          "self": [
            "내 방법으로 표현했어요",
            "조금 아쉬워요",
            "다르게도 표현해 보고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s13",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 한 것",
          "points": [
            "찾은 보물을 **소개**했어요",
            "**그려서 · 만들어서 · 몸으로** 표현했어요",
            "친구의 보물을 **알아맞혔어요**",
            "재료를 **아껴** 쓰며 만들었어요"
          ]
        },
        "suggested_extras": [
          "q_compare_with_friend"
        ]
      },
      {
        "id": "s14",
        "stage": "정리",
        "block": "question",
        "data": {
          "title": "짝과 이야기해 봐요",
          "content": "· 내가 찾은 보물은 무엇인가요?\n· 어떤 방법으로 표현했나요?\n\n짝과 서로 보여 주며 이야기해요."
        },
        "suggested_extras": [
          "t_pair_share"
        ]
      },
      {
        "id": "s15",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간에는",
          "preview": "우리가 만든 보물로\n**수학 보물 전시회**를 열어요!\n친구들 작품도 함께 감상해요.",
          "emoji": "🖼️"
        },
        "suggested_extras": [
          "e_l03_preview"
        ]
      }
    ],
    "extras": [
      {
        "id": "v_express_intro",
        "type": "video",
        "icon": "🎥",
        "title": "여러 방법으로 표현하기 영상",
        "url": "https://www.youtube.com/results?search_query=점토+색종이+만들기+1학년+미술",
        "description": "그리기·만들기 등 다양한 표현 예시 영상. 도입에 방법을 보여 주는 자극 자료.",
        "source": "유튜브 공개 영상 — 교사 선택",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_pick_one_way",
        "type": "tip",
        "icon": "🧩",
        "title": "한 가지만 골라도 충분",
        "content": "세 방법을 다 할 필요는 없어요. 학생이 가장 끌리는 한 가지를 깊게 하도록 두면 결과물의 질이 좋아져요.",
        "fit_slides": [
          "cover",
          "concept"
        ]
      },
      {
        "id": "o_show_photos",
        "type": "other_activity",
        "icon": "📚",
        "title": "활동 사진 슬라이드",
        "content": "1차시 탐험 사진을 TV로 띄워 함께 보면 회상이 쉬워요. 사진이 없으면 학생들의 말로 떠올리게 해도 됩니다.",
        "fit_slides": [
          "review"
        ]
      },
      {
        "id": "q_how_did_you_feel",
        "type": "fun_question",
        "icon": "💡",
        "title": "그때 기분이 어땠어?",
        "content": "\"보물을 찾았을 때 기분이 어땠나요?\" 정의적 경험을 끌어내 표현 동기로 연결.",
        "fit_slides": [
          "review"
        ]
      },
      {
        "id": "q_which_way",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 방법이 좋아?",
        "content": "\"그리기, 만들기, 몸으로 표현하기 중 어떤 게 가장 재미있을 것 같아요?\" 선택의 즐거움을 살리는 발문.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_respect_choice",
        "type": "tip",
        "icon": "🧩",
        "title": "표현 방법은 자유롭게",
        "content": "정답이 정해진 활동이 아니에요. 학생이 고른 방법을 존중하고, 못한다는 평가보다 다양함을 칭찬하세요.",
        "fit_slides": [
          "motivate",
          "concept"
        ]
      },
      {
        "id": "t_any_way_ok",
        "type": "tip",
        "icon": "🧩",
        "title": "잘 그리고 못 그리고는 없다",
        "content": "표현의 완성도가 목표가 아니라 보물을 나타내려는 과정이 목표예요. 모든 표현을 허용적으로 받아 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_mix_ways",
        "type": "extension",
        "icon": "⬆",
        "title": "확장: 방법 섞기",
        "content": "그린 그림에 색종이를 붙이거나, 만든 작품을 몸으로 소개하는 식으로 방법을 섞으면 표현이 풍부해져요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_guess_game",
        "type": "fun_question",
        "icon": "💡",
        "title": "이건 무슨 보물일까?",
        "content": "교사가 먼저 \"개미 머리가 동그라미를 닮았어, 이건 무슨 보물?\" 하고 시범 문제를 내면 놀이가 빨리 시작돼요.",
        "fit_slides": [
          "game"
        ]
      },
      {
        "id": "t_guide_reason",
        "type": "tip",
        "icon": "🧩",
        "title": "까닭을 꼭 말하게",
        "content": "맞히기만 하지 말고 \"왜 그렇게 생각해?\"를 챙기면 추론·의사소통이 자라요.",
        "fit_slides": [
          "game"
        ]
      },
      {
        "id": "v_tableau",
        "type": "video",
        "icon": "🎥",
        "title": "타블로 기법 예시",
        "url": "https://www.youtube.com/results?search_query=타블로+기법+수업+정지동작",
        "description": "정지 동작으로 장면을 표현하는 타블로 수업 예시. 처음 해 보는 교사에게 도움.",
        "source": "유튜브 공개 영상 — 교사 선택",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "t_tableau_tip",
        "type": "tip",
        "icon": "🧩",
        "title": "타블로 신호 정하기",
        "content": "\"하나, 둘, 셋, 찰칵!\"처럼 멈추는 신호를 정해 두면 1학년도 질서 있게 표현할 수 있어요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_my_choice",
        "type": "fun_question",
        "icon": "💡",
        "title": "내 보물엔 무엇이 어울려?",
        "content": "\"동그란 보물은 그리기? 만들기? 어떤 게 더 잘 어울릴까?\" 보물 특성과 방법을 연결해 생각하게.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "t_draw_with_label",
        "type": "tip",
        "icon": "🧩",
        "title": "그림에 수·모양 함께",
        "content": "그림 옆에 찾은 수나 모양 이름을 함께 쓰게 하면 수학 학습과 더 단단히 연결돼요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "r_recycle",
        "type": "real_world",
        "icon": "🌍",
        "title": "재활용 재료로 만들기",
        "content": "우유갑, 휴지심, 병뚜껑도 좋은 만들기 재료예요. 생활 속 물건이 작품이 되는 경험을 줄 수 있어요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "o_clay_shape",
        "type": "other_activity",
        "icon": "📚",
        "title": "점토로 모양 보물",
        "content": "점토는 입체 모양(공·기둥·상자) 보물을 표현하기에 좋아요. 2단원에서 배운 모양과 연결해 보세요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "t_body_safe",
        "type": "tip",
        "icon": "🧩",
        "title": "몸 표현은 공간 확보",
        "content": "신체 표현 전에 책상을 정리해 안전한 공간을 만들어 주세요. 부딪힘 사고를 예방합니다.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "t_fair_turn",
        "type": "tip",
        "icon": "🧩",
        "title": "소외 없이 순서대로",
        "content": "지명이 무작위면 소외되는 학생이 생겨요. 교사가 순서를 정해 모두 발표 기회를 갖게 하세요.",
        "fit_slides": [
          "game"
        ]
      },
      {
        "id": "x_skip_quiet",
        "type": "misconception",
        "icon": "❓",
        "title": "주의: 조용한 학생 건너뛰기",
        "content": "발표를 꺼리는 학생도 짝 발표·작은 소리 발표 등으로 참여하게 해 주세요. 모두의 보물이 소중합니다.",
        "fit_slides": [
          "game"
        ]
      },
      {
        "id": "r_recycle_value",
        "type": "real_world",
        "icon": "🌍",
        "title": "아껴 쓰는 마음",
        "content": "재료를 아끼는 작은 습관이 환경을 지키는 큰 마음으로 자라요. 활동과 인성 교육을 자연스럽게 엮을 수 있어요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_compare_with_friend",
        "type": "fun_question",
        "icon": "💡",
        "title": "친구 보물과 비교",
        "content": "\"같은 보물을 친구는 어떻게 표현했나요? 나와 무엇이 다른가요?\" 비교하며 다양성을 느끼게.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "t_pair_share",
        "type": "tip",
        "icon": "🧩",
        "title": "짝 활동으로 모두 말하기",
        "content": "전체 발표는 시간이 부족해요. 짝과 서로 보여 주게 하면 모든 학생이 말할 기회를 가집니다.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_l03_preview",
        "type": "extension",
        "icon": "⬆",
        "title": "전시회 준비 예고",
        "content": "다음 시간 전시회를 위해 작품을 잘 보관해 두라고 안내하세요. 작품에 이름표를 붙여 두면 좋아요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u6_l03"] =
  {
    "meta": {
      "title": "1학년 수학 6단원 3차시",
      "subtitle": "수학 보물을 나누어요 (마무리해요)",
      "std": "[2수01-01]",
      "duration": 40,
      "lesson_format": " · 40분 표준 증보(3요소·프로젝트)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "도입",
        "block": "cover",
        "data": {
          "title": "수학 보물을\n나누어요\n수학 보물 전시회",
          "emoji": "🖼️"
        },
        "suggested_extras": [
          "v_exhibit_intro",
          "t_celebrate_mood"
        ]
      },
      {
        "id": "s02",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "우리가 표현한 보물",
          "content": "지난 시간 우리는 보물을\n**그려서 · 만들어서 · 몸으로** 표현했어요.\n\n어떤 보물을, 어떻게 표현했는지\n발표해 봐요.",
          "items": [
            {
              "q": "수학 보물을 나타내는 방법을 하나 말해 봐요.",
              "a": "여러 답 (그림·몸·만들기)"
            },
            {
              "q": "몸으로 표현하는 것을 무엇이라 했나요?",
              "a": "타블로"
            }
          ],
          "from": "u6_l02"
        },
        "suggested_extras": [
          "q_present_how",
          "t_detail_question"
        ]
      },
      {
        "id": "s03",
        "stage": "도입",
        "block": "motivate",
        "data": {
          "scene_title": "전시회를 열어요!",
          "kids": [
            {
              "face": "🖼️",
              "label": "내 작품을\n전시할래!"
            },
            {
              "face": "👀",
              "label": "친구 작품도\n보고 싶어!"
            },
            {
              "face": "👏",
              "label": "멋진 작품엔\n박수!"
            }
          ],
          "question": "우리 보물로 전시회를 열면\n어떤 점이 좋을까요?",
          "img": "assets/photo/math/treasure_exhibit.jpg"
        },
        "suggested_extras": [
          "q_why_exhibit"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "전시회를 여는 방법",
          "content": "· 교실에 **전시할 공간**을 정해요\n· 그림 · 만들기 · 디지털 등\n  **종류별로** 구역을 나눠요\n· 작품에 **이름표**를 붙여요\n· 설명할 사람과 관람할 사람을 정해요"
        },
        "suggested_extras": [
          "t_zone_by_type",
          "o_name_tag"
        ],
        "tnote": {
          "ask": [
            "내 보물을 친구에게 어떻게 소개하면 좋을까?"
          ],
          "watch": "전시·관람 예절과 표현 나눔 안내",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "전시 방법 ① 구역별 전시",
          "bidirect": [
            "전시할 **공간**을 정해요",
            "구역마다 전시할 **종류**를 정해요 (그림·만들기·디지털)",
            "한 모둠은 **설명**, 다른 모둠은 **관람**",
            "시간이 지나면 **역할을 바꿔요**"
          ]
        },
        "suggested_extras": [
          "t_zone_tip"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "전시 방법 ② 둘 가고 둘 남기",
          "bidirect": [
            "4명이 한 모둠을 만들어요",
            "**2명은 남아서** 설명하고",
            "**2명은 이동해서** 다른 모둠 작품 보기",
            "신호가 들리면 다음 모둠으로 이동",
            "한 바퀴 돌면 활동 끝!"
          ]
        },
        "suggested_extras": [
          "t_two_stay_tip"
        ]
      },
      {
        "id": "s07",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "디지털 액자 전시회",
          "content": "태블릿으로 찍은 사진·그림은\n**[갤러리]에서 슬라이드 쇼**로 틀면\n그대로 디지털 액자가 돼요.\n\n사진을 차례로 넘기며\n친구들과 함께 감상해요."
        },
        "suggested_extras": [
          "e_digital_frame",
          "t_device_optional"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "전시 구역 정하고 꾸미기",
          "tag": "🙋 교실 활동",
          "icon": "🏗️",
          "body": "작품 종류별로 전시 구역을 정하고\n교실을 전시회장처럼 꾸며요.\n작품 앞에 **이름표·설명 카드**를 놓아요.",
          "materials": "작품 · 이름표 종이 · 이젤/책상 · 색 테이프"
        },
        "suggested_extras": [
          "o_label_card"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "offline_activity",
        "data": {
          "title": "전시회 열기",
          "tag": "🙋 교실 활동",
          "icon": "🎉",
          "body": "정한 방법(구역별 / 둘 가고 둘 남기)대로\n전시회를 열어요.\n내 작품을 **소개**하고\n친구 작품을 **관람**해요.",
          "materials": "전시된 작품"
        },
        "suggested_extras": [
          "t_explain_then_view"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "감상하기",
          "tag": "🙋 교실 활동",
          "icon": "👀",
          "body": "친구의 작품을 천천히 둘러봐요.\n**비판이 아니라 감상**이에요.\n좋았던 점을 찾아 박수와 말로 표현해요.\n더 보고 싶은 작품은 한 번 더 봐요.",
          "materials": "—"
        },
        "suggested_extras": [
          "x_no_criticism",
          "q_favorite_work"
        ]
      },
      {
        "id": "s11",
        "stage": "응용문제",
        "block": "concept",
        "data": {
          "title": "수학은 아름다워요",
          "content": "꽃잎의 수, 잎의 모양, 자연의 비교…\n우리 주변의 수학은 **아름다워요**.\n\n자연을 **소중히** 여기고\n수학을 **즐기는 마음**을 느껴 봐요."
        },
        "suggested_extras": [
          "r_beauty_of_math",
          "b_nature_beauty"
        ]
      },
      {
        "id": "s100",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 돌아봐요",
          "items": [
            {
              "q": "전시회를 여는 방법을 하나 말해 봐요.",
              "a": "여러 답 (구역별·둘 가고 둘 남기 등)"
            },
            {
              "q": "친구 작품을 볼 때 지킬 예절은?",
              "a": "조심히 보고 칭찬해요"
            },
            {
              "q": "이번 프로젝트에서 가장 기억에 남는 것은?",
              "a": "여러 답"
            }
          ],
          "self": [
            "전시회에 즐겁게 참여했어요",
            "조금 아쉬워요",
            "또 열어 보고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "단원 전체를 되돌아보며",
          "points": [
            "주변에서 **수학 보물**을 찾았어요",
            "여러 방법으로 보물을 **표현**했어요",
            "**전시회**를 열고 친구 작품을 **감상**했어요",
            "수학이 우리 **생활 곳곳**에 있음을 알았어요"
          ]
        },
        "suggested_extras": [
          "t_wrap_whole_unit"
        ]
      },
      {
        "id": "s13",
        "stage": "정리",
        "block": "offline_activity",
        "data": {
          "title": "스스로 평가해요 ⭐",
          "tag": "🙋 자기 평가",
          "icon": "📋",
          "body": "별점(☆☆☆)으로 스스로 평가해요.\n· 배운 내용으로 활동했나요?\n· 생각을 다양하게 나타냈나요?\n· 친구들과 즐겁게 활동했나요?",
          "materials": "교과서 p.143 자기 평가표"
        },
        "suggested_extras": [
          "t_self_eval",
          "e_self_eval_track"
        ]
      },
      {
        "id": "s14",
        "stage": "정리",
        "block": "question",
        "data": {
          "title": "소감을 나눠요",
          "content": "· 수학 보물찾기를 하며 **알게 된 점**은?\n· 가장 **기억에 남는** 순간은?\n· 어떤 **느낌**이 들었나요?\n\n친구들과 자유롭게 이야기해요."
        },
        "suggested_extras": [
          "q_unit_feeling"
        ]
      },
      {
        "id": "s15",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "1학기를 마치며",
          "preview": "수 · 모양 · 덧셈뺄셈 · 비교 · 50까지의 수\n그리고 **수학 보물찾기**까지\n1학기를 멋지게 마쳤어요!\n2학기에 또 만나요 👋",
          "emoji": "🎓"
        },
        "suggested_extras": [
          "r_semester_done"
        ]
      }
    ],
    "extras": [
      {
        "id": "v_exhibit_intro",
        "type": "video",
        "icon": "🎥",
        "title": "어린이 전시회 영상",
        "url": "https://www.youtube.com/results?search_query=초등+작품+전시회+교실",
        "description": "교실에서 학생 작품 전시회를 여는 모습. 전시회 분위기를 미리 느끼게 하는 자료.",
        "source": "유튜브 공개 영상 — 교사 선택",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_celebrate_mood",
        "type": "tip",
        "icon": "🧩",
        "title": "축제 같은 분위기로",
        "content": "마지막 차시는 평가보다 축하의 자리예요. 모든 작품을 환영하는 따뜻한 분위기를 만들어 주세요.",
        "fit_slides": [
          "cover"
        ]
      },
      {
        "id": "q_present_how",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떻게 표현했어?",
        "content": "\"무엇을, 어떤 재료로, 어떻게 표현했나요?\"라고 구체적으로 물어 발표를 풍부하게.",
        "fit_slides": [
          "review"
        ]
      },
      {
        "id": "t_detail_question",
        "type": "tip",
        "icon": "🧩",
        "title": "추가 질문으로 구체화",
        "content": "재료만 말하는 학생에겐 \"어떤 보물을 나타낸 거예요?\"처럼 되물어 생각을 구체화하게 하세요.",
        "fit_slides": [
          "review"
        ]
      },
      {
        "id": "q_why_exhibit",
        "type": "fun_question",
        "icon": "💡",
        "title": "전시회는 왜 좋을까?",
        "content": "\"내 작품을 보여 주고 친구 작품도 보면 무엇이 좋을까요?\" 전시의 의미를 스스로 찾게.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_zone_by_type",
        "type": "tip",
        "icon": "🧩",
        "title": "종류별 구역이 깔끔",
        "content": "그림·만들기·디지털 등 종류별로 구역을 나누면 관람 동선이 자연스럽고 비교도 쉬워요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "o_name_tag",
        "type": "other_activity",
        "icon": "📚",
        "title": "이름표·설명 카드 만들기",
        "content": "작품마다 작은 이름표와 한 줄 설명 카드를 만들면 진짜 전시회 느낌이 나고 글쓰기 연습도 됩니다.",
        "fit_slides": [
          "concept",
          "offline_activity"
        ]
      },
      {
        "id": "t_zone_tip",
        "type": "tip",
        "icon": "🧩",
        "title": "설명·관람 역할 교대",
        "content": "한 모둠이 설명하는 동안 다른 모둠이 관람하고, 시간이 지나면 역할을 바꾸면 모두가 두 경험을 다 합니다.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "t_two_stay_tip",
        "type": "tip",
        "icon": "🧩",
        "title": "신호는 음악으로",
        "content": "'둘 가고 둘 남기'에서 이동 신호를 음악으로 주면 1학년도 즐겁고 질서 있게 움직여요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_digital_frame",
        "type": "extension",
        "icon": "⬆",
        "title": "확장: 슬라이드 쇼 만들기",
        "content": "갤러리 앱의 슬라이드 쇼 기능으로 사진을 자동 재생하면 디지털 액자가 돼요. 효과·무작위 설정도 해 볼 수 있어요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "t_device_optional",
        "type": "tip",
        "icon": "🧩",
        "title": "기기 없어도 OK",
        "content": "스마트 기기가 없으면 디지털 전시는 생략하고 그림·만들기 전시만으로 충분해요. 기기 유무에 활동이 좌우되지 않게.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "o_label_card",
        "type": "other_activity",
        "icon": "📚",
        "title": "전시 공간 함께 꾸미기",
        "content": "색 테이프로 구역을 나누고 작품을 배치하는 과정 자체를 학생들과 함께 하면 주인의식이 생겨요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "t_explain_then_view",
        "type": "tip",
        "icon": "🧩",
        "title": "설명은 한 문장으로",
        "content": "1학년이 길게 설명하긴 어려워요. \"이건 ○○에서 찾은 ○○ 보물이에요\" 한 문장이면 충분합니다.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "x_no_criticism",
        "type": "misconception",
        "icon": "❓",
        "title": "감상은 비판이 아니에요",
        "content": "\"이건 이상해\" 같은 비판이 나오지 않도록 미리 약속하세요. 좋았던 점을 찾아 말하는 감상의 분위기가 핵심입니다.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "q_favorite_work",
        "type": "fun_question",
        "icon": "💡",
        "title": "마음에 든 작품은?",
        "content": "\"가장 마음에 든 친구 작품은 무엇이고 왜인가요?\" 감상을 말로 표현하게 하는 발문.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "r_beauty_of_math",
        "type": "real_world",
        "icon": "🌍",
        "title": "자연 속 수학의 아름다움",
        "content": "눈 결정의 육각형, 해바라기 씨앗의 나선, 나비의 대칭. 자연이 보여 주는 수학의 아름다움을 한 장면 보여 주면 여운이 남아요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "b_nature_beauty",
        "type": "book",
        "icon": "📖",
        "title": "그림책 《자연이 그린 수학》류",
        "content": "자연 속 패턴·대칭·수를 다룬 그림책의 한 장면을 보여 주며 단원을 마무리하면 정서적 여운이 좋아요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "t_wrap_whole_unit",
        "type": "tip",
        "icon": "🧩",
        "title": "1학기 전체를 짚어 주기",
        "content": "정리에서 6단원만이 아니라 1~5단원 학습을 한 번에 떠올려 주면 '수학이 다 연결된다'는 큰 그림이 남아요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "t_self_eval",
        "type": "tip",
        "icon": "🧩",
        "title": "자기 평가는 격려로",
        "content": "별점은 등급이 아니라 스스로 돌아보는 활동이에요. 별이 적어도 괜찮다고, 노력한 점을 칭찬해 주세요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "e_self_eval_track",
        "type": "extension",
        "icon": "⬆",
        "title": "확장: 평가 기록 모으기",
        "content": "자기 평가표를 포트폴리오에 모아 두면 학기 성장 기록이 됩니다. 학부모 상담 자료로도 좋아요.",
        "fit_slides": [
          "offline_activity"
        ]
      },
      {
        "id": "q_unit_feeling",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 기억에 남는 순간",
        "content": "\"보물찾기부터 전시회까지, 가장 기억에 남는 순간은 언제였나요?\" 단원 경험을 정서로 마무리하는 발문.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "r_semester_done",
        "type": "real_world",
        "icon": "🌍",
        "title": "1학기 수학 여정",
        "content": "수에서 시작해 모양·셈·비교를 거쳐 보물찾기로 마친 1학기 여정을 한 줄로 짚어 주면 성취감이 커요.",
        "fit_slides": [
          "next_lesson",
          "summary"
        ]
      }
    ]
  };

})();
