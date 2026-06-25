/* ============================================================================
   2학년 1학기 수학 — 5단원 「분류하기」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u5_l{NN}"] (zero-pad). 교사주도 흐름(~12슬).
   - 학생 본 차시(grade2 .../재수정_v1/g2_math_u5_*.html)의 검증된 수·정답 계승.
   - 성취기준 [2수04-01]. 7차시(본 차시 01~07 대응).
   - 부품 흐름: cover/review/motivate/concept×2/misconception/basic_problem×3/real_world/summary/next_lesson + self_assessment(06 평가차).
   - basic_problem answer = 학생 본 차시 검증 수 계승(과일 사과4·귤6·바나나3=13 / 조각보 빨강6·노랑3·파랑4·흰색2=15 / 도서 7·5·8=20).
   - 분류 단원 — 톤: 곰이·펭이·정리/분류 직관. '분류' 직관은 도입에서 '정리'로 접근.
   - g2_math.html이 window.LESSONS 객체에 누적. (window.LESSONS+IIFE 양 레포 공통)
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  window.LESSONS["u5_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 5,
      "n": 1,
      "title": "분류하기를 만나 볼까요 (단원 도입)",
      "std": "[2수04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 곰이·펭이 정리 동기 → 같은 것끼리 모으기 직관 → 1학년 복습 → 단원 예고"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분류하기를\n만나 볼까요",
          "subtitle": "5단원 · 1/7차시 · 단원 도입"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "1학년에서 배운 것",
          "content": "우리는 모양을 보고 **같은 것끼리** 모아 봤어요.\n이번 단원에서는 **기준**을 정해 나누고, **세어** 결과까지 말해 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "곰이 방이 어질러졌어요 🧸",
          "visual": "🐻",
          "question": "곰이 방에 옷·책·장난감이 마구 흩어져 있어요.<br>찾고 싶은 걸 못 찾아 곰이가 속상해요. 어떻게 정리하면 좋을까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "같은 것끼리 모아요",
          "content": "흩어진 물건도 **같은 것끼리** 모으면 깔끔하게 정리돼요.",
          "items": [
            {
              "emoji": "👕",
              "count": 1,
              "label": "옷은 옷끼리"
            },
            {
              "emoji": "📚",
              "count": 1,
              "label": "책은 책끼리"
            },
            {
              "emoji": "🧸",
              "count": 1,
              "label": "장난감은 장난감끼리"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "정리하면 좋아요",
          "content": "정리하면 어디 있는지 바로 알아 **찾기 쉽고**, 방도 **깔끔**해져요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"아무 데나 빨리 넣으면 정리예요\" — 빨리만 넣으려 함",
          "right": "**같은 것끼리** 모아 제자리에 넣어야 정리가 돼요.",
          "hint": "빨리 넣어도 섞여 있으면 또 못 찾아요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ① 곰 인형 세기",
          "question": "장난감 바구니에 곰 인형이 있어요. 모두 몇 개?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 하나, 둘, 셋 → 3개.",
          "items": [
            {
              "emoji": "🧸",
              "count": 3,
              "label": "곰 인형"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② 학용품 모으기",
          "question": "학용품을 모았더니 연필이 있어요. 모두 몇 자루?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 연필끼리 모아 세면 4자루."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ 책 모으기",
          "question": "책꽂이에 책을 모았어요. 모두 몇 권?",
          "input": "count_input",
          "answer": 5,
          "note": "풀이: 책끼리 모아 세면 5권."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "사물함 정리",
          "scenario": {
            "icon": "🎒",
            "body": "교실 사물함에 흩어진 책을 같은 칸에 모았어요."
          },
          "question": "정리한 책은 모두 몇 권일까요? \"책이 모두 ___권\"",
          "answer": 5
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "흩어진 물건은 **같은 것끼리** 모으면 정리돼요.",
            "정리하면 **찾기 쉽고** 깔끔해요.",
            "곰이·펭이와 분류하기를 시작해요. 🧸"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "분류는 어떻게 할까요",
          "body": "다음 시간에는 누가 나눠도 결과가 같은 **분명한 기준**을 배워요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u5_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 5,
      "n": 2,
      "title": "분류는 어떻게 할까요",
      "std": "[2수04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 분명한 기준 vs 사람마다 다른 기준 구별"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분류는\n어떻게 할까요",
          "subtitle": "5단원 · 2/7차시"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "지난 시간 떠올리기",
          "content": "흩어진 물건을 **같은 것끼리** 모으면 정리된다고 배웠어요.\n오늘은 **어떤 기준**으로 나눌지 생각해 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "세미와 슬기가 다르게 나눴어요 👕",
          "visual": "🐧",
          "question": "같은 옷을 세미는 '윗옷·아래옷'으로, 슬기는 '좋아하는 옷·아닌 옷'으로 나눴어요.<br>누구의 기준이 누가 봐도 똑같을까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "분명한 기준",
          "content": "**색깔·모양·종류**처럼 누가 나눠도 결과가 같은 것이 분명한 기준이에요.",
          "items": [
            {
              "emoji": "👕",
              "count": 1,
              "label": "윗옷"
            },
            {
              "emoji": "👖",
              "count": 1,
              "label": "아래옷"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "사람마다 다른 기준",
          "content": "'좋아하는·예쁜·맛있는'은 **사람마다 달라서** 결과가 달라져요. 분명한 기준이 아니에요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 기준을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"예쁜 옷과 안 예쁜 옷으로 나누기\" — 마음으로 나눔",
          "right": "예쁜 것은 **사람마다 달라요**. 색깔·모양처럼 누가 봐도 같은 기준으로 나눠요.",
          "hint": "마음·기분이 들어가면 분명하지 않아요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ① 윗옷 세기",
          "question": "옷을 윗옷·아래옷으로 나눴어요. 윗옷은 모두 몇 벌?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 윗옷끼리 세면 3벌.",
          "items": [
            {
              "emoji": "👕",
              "count": 3,
              "label": "윗옷"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② 색깔로 나누기",
          "question": "단추를 색깔로 나눴어요. 빨강 단추는 모두 몇 개?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 빨강끼리 세면 4개.",
          "items": [
            {
              "emoji": "🔴",
              "count": 4,
              "label": "빨강 단추"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ 바퀴 수로 나누기",
          "question": "탈것을 바퀴 수로 나눴어요. 두발자전거는 모두 몇 대?",
          "input": "count_input",
          "answer": 2,
          "note": "풀이: 바퀴 2개인 것끼리 세면 2대."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "장난감 정리",
          "scenario": {
            "icon": "🧸",
            "body": "장난감을 종류로 나눠 인형끼리 모았어요."
          },
          "question": "인형은 모두 몇 개일까요? \"인형이 모두 ___개\"",
          "answer": 4
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "**분명한 기준**은 누가 나눠도 결과가 같아요(색깔·모양·종류).",
            "**좋아하는·예쁜**은 사람마다 달라 분명하지 않아요.",
            "분명한 기준으로 나눠야 누가 해도 같아요."
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "기준에 따라 분류해 볼까요",
          "body": "다음 시간에는 정한 **기준에 따라** 직접 나누어 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u5_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 5,
      "n": 3,
      "title": "기준에 따라 분류해 볼까요",
      "std": "[2수04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 주어진 기준 분류 + 기준 바뀌면 결과도 바뀜"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "기준에 따라\n분류해 볼까요",
          "subtitle": "5단원 · 3/7차시"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "지난 시간 떠올리기",
          "content": "누가 나눠도 같은 **분명한 기준**(색깔·모양·종류)을 배웠어요.\n오늘은 그 기준에 따라 직접 **나누어** 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "단추가 가득해요 🔘",
          "visual": "🐻",
          "question": "상자에 여러 색깔·모양 단추가 섞여 있어요.<br>어떤 기준으로 나누면 깔끔하게 정리될까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "색깔 기준으로 나누기",
          "content": "**색깔**을 기준으로 정하면 빨강 칸·파랑 칸처럼 같은 색끼리 담겨요.",
          "items": [
            {
              "emoji": "🔴",
              "count": 1,
              "label": "빨강 칸"
            },
            {
              "emoji": "🔵",
              "count": 1,
              "label": "파랑 칸"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "기준을 바꾸면",
          "content": "같은 단추도 **모양**을 기준으로 하면 동그라미·네모로 다르게 나뉘어요. 기준이 바뀌면 결과도 바뀌어요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"분류는 한 가지 기준만 써야 해요\" — 기준 하나만 고집",
          "right": "같은 물건도 **색깔로도 모양으로도** 나눌 수 있어요. 기준을 정하기 나름이에요.",
          "hint": "기준이 다르면 묶음도 달라져요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ① 빨강 단추",
          "question": "단추를 색깔로 나눴어요. 빨강 칸의 단추는 모두 몇 개?",
          "input": "count_input",
          "answer": 5,
          "note": "풀이: 빨강끼리 세면 5개.",
          "items": [
            {
              "emoji": "🔴",
              "count": 5,
              "label": "빨강 단추"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② 네모 모양",
          "question": "단추를 모양으로 나눴어요. 네모 단추는 모두 몇 개?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 네모끼리 세면 3개.",
          "items": [
            {
              "emoji": "🟥",
              "count": 3,
              "label": "네모 단추"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ 동그라미 모양",
          "question": "동그라미 단추는 모두 몇 개?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 동그라미끼리 세면 4개."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "색종이 정리",
          "scenario": {
            "icon": "🟨",
            "body": "미술 시간에 색종이를 색깔로 나눴어요. 노랑 칸을 세어 봐요."
          },
          "question": "노랑 색종이는 모두 몇 장일까요? \"노랑이 모두 ___장\"",
          "answer": 6
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "정한 **기준에 따라** 같은 것끼리 칸에 담아요.",
            "**기준이 바뀌면** 나뉘는 결과도 바뀌어요.",
            "색깔로도 모양으로도 분류할 수 있어요."
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "분류하고 세어 볼까요",
          "body": "다음 시간에는 분류한 다음 **몇 개인지 세어** 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u5_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 5,
      "n": 4,
      "title": "분류하고 세어 볼까요",
      "std": "[2수04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 분류 + 수 세기(／ 표시로 빠짐없이)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분류하고\n세어 볼까요",
          "subtitle": "5단원 · 4/7차시"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "지난 시간 떠올리기",
          "content": "정한 **기준에 따라** 같은 것끼리 나누는 법을 배웠어요.\n오늘은 나눈 다음 **몇 개인지** 세어 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "나누기만 하면 끝일까요? 🍎",
          "visual": "🐧",
          "question": "과일을 종류대로 나눴어요. 그런데 어떤 과일이 몇 개인지 궁금해요.<br>어떻게 하면 빠뜨리지 않고 셀 수 있을까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "분류하고 세기",
          "content": "나눈 다음 **칸마다** 몇 개인지 세요. 셀 때 하나마다 **／ 표시**를 해요.",
          "items": [
            {
              "emoji": "🍎",
              "count": 4,
              "label": "사과 4"
            },
            {
              "emoji": "🍊",
              "count": 6,
              "label": "귤 6"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "／ 표시로 빠짐없이",
          "content": "하나 셀 때마다 ／ 표시를 하면 **두 번 세거나 빠뜨리지** 않아요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"눈으로 어림해서 대충 세요\" — 눈대중",
          "right": "하나씩 **／ 표시**하며 세야 정확해요.",
          "hint": "많을수록 표시하며 세는 게 안 헷갈려요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ① 사과 세기",
          "question": "과일을 종류로 나눴어요. 사과는 모두 몇 개?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: ／ 표시하며 세면 4개.",
          "items": [
            {
              "emoji": "🍎",
              "count": 4,
              "label": "사과"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② 귤 세기",
          "question": "귤은 모두 몇 개?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: ／ 표시하며 세면 6개.",
          "items": [
            {
              "emoji": "🍊",
              "count": 6,
              "label": "귤"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ 바나나 세기",
          "question": "바나나는 모두 몇 개?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: ／ 표시하며 세면 3개.",
          "items": [
            {
              "emoji": "🍌",
              "count": 3,
              "label": "바나나"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "색연필 정리",
          "scenario": {
            "icon": "🖍️",
            "body": "필통의 색연필을 색깔로 나눠 세었어요. 빨강을 세어 봐요."
          },
          "question": "빨강 색연필은 모두 몇 자루일까요? \"빨강이 모두 ___자루\"",
          "answer": 5
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "분류한 다음 **칸마다 세요**.",
            "셀 때 **／ 표시**를 하면 빠뜨리지 않아요.",
            "사과 4·귤 6·바나나 3처럼 종류별 수를 알 수 있어요."
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "분류한 결과를 말해 볼까요",
          "body": "다음 시간에는 센 결과로 **가장 많은 것·가장 적은 것·전체**를 말해 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u5_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 5,
      "n": 5,
      "title": "분류한 결과를 말해 볼까요",
      "std": "[2수04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 표를 읽고 가장 많은/적은/전체 말하기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분류한 결과를\n말해 볼까요",
          "subtitle": "5단원 · 5/7차시"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "지난 시간 떠올리기",
          "content": "분류하고 **／ 표시**하며 세는 법을 배웠어요(사과 4·귤 6·바나나 3).\n오늘은 그 결과로 무엇을 알 수 있는지 말해 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "다 세었어요! 이제 뭘 알 수 있을까요? 📊",
          "visual": "🐻",
          "question": "과일을 다 세었어요. 어떤 과일이 가장 많은지, 가장 적은지, 모두 몇 개인지 궁금해요.<br>표를 보면 한눈에 알 수 있을까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "가장 많은 것·가장 적은 것",
          "content": "수가 **가장 큰 칸**이 가장 많은 것, **가장 작은 칸**이 가장 적은 것이에요.",
          "items": [
            {
              "emoji": "🍊",
              "count": 6,
              "label": "귤 6 (가장 많음)"
            },
            {
              "emoji": "🍌",
              "count": 3,
              "label": "바나나 3 (가장 적음)"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "전체 수",
          "content": "각 칸의 수를 **모두 더하면** 전체 수예요. 4+6+3=13."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"종류가 3가지니까 전체도 3이에요\" — 칸 수와 전체 수 혼동",
          "right": "**칸의 수(종류 수)**와 **전체 개수**는 달라요. 전체는 각 칸을 모두 더해요.",
          "hint": "종류는 3가지, 전체는 4+6+3=13개."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ① 가장 많은 것",
          "question": "사과 4·귤 6·바나나 3. 가장 많은 과일은 몇 개?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 가장 큰 칸 = 귤 6개.",
          "items": [
            {
              "emoji": "🍊",
              "count": 6,
              "label": "귤"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② 가장 적은 것",
          "question": "가장 적은 과일은 몇 개?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 가장 작은 칸 = 바나나 3개."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ 전체 수",
          "question": "과일은 모두 몇 개?",
          "input": "count_input",
          "answer": 13,
          "note": "풀이: 4+6+3=13개."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "도서 분류",
          "scenario": {
            "icon": "📚",
            "body": "도서관 책을 종류로 나눴어요. 그림책 7·만화 5·동화 8권이에요."
          },
          "question": "책은 모두 몇 권일까요? \"책이 모두 ___권\"",
          "answer": 20
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "수가 **가장 큰 칸**=가장 많은 것, **가장 작은 칸**=가장 적은 것.",
            "각 칸을 **모두 더하면** 전체 수.",
            "종류 수와 전체 수를 헷갈리지 않아요."
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "수학이랑 확인해요",
          "body": "다음 시간에는 단원에서 배운 것을 **한 번에 확인**해 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u5_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 5,
      "n": 6,
      "title": "수학이랑 확인해요 (단원 평가)",
      "std": "[2수04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 단원 평가: 기준·분류·세기·결과 말하기 총점검 + 자기 평가"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n확인해요",
          "subtitle": "5단원 · 6/7차시 · 단원 평가"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "단원을 떠올려요",
          "content": "분명한 기준 → 기준 따라 **분류** → 분류하고 **세기** → **결과 말하기**까지 배웠어요.\n오늘은 모두 한 번에 확인해 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "분류하기, 한 번에 확인해요 ✅",
          "visual": "🐧",
          "question": "곰이와 펭이가 단원을 정리하며 점검표를 만들었어요.<br>배운 것을 차례대로 확인해 볼까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "분류 위계 되짚기",
          "content": "**분명한 기준** 정하기 → 기준 따라 **분류** → 칸마다 **세기** → 가장 많은/적은·**전체 말하기**. 이 순서를 기억해요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "자주 틀리는 자리",
          "label": "자주 하는 실수",
          "wrong": "\"예쁜 것으로 나누기\"·\"종류 수=전체 수\" — 평가에서 자주 틀림",
          "right": "기준은 **누가 봐도 같은 것**으로, 전체는 **각 칸을 모두 더해** 구해요.",
          "hint": "마음 기준 금지 · 칸 수와 전체 수 구별."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s06",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ① 분류하고 세기",
          "question": "과일을 종류로 나눴어요(사과 4·귤 6·바나나 3). 모두 몇 개?",
          "input": "count_input",
          "answer": 13,
          "note": "풀이: 4+6+3=13개.",
          "items": [
            {
              "emoji": "🍎",
              "count": 4,
              "label": "사과"
            },
            {
              "emoji": "🍊",
              "count": 6,
              "label": "귤"
            },
            {
              "emoji": "🍌",
              "count": 3,
              "label": "바나나"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② 가장 많은 것",
          "question": "위 과일에서 가장 많은 것은 몇 개?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 귤 6개가 가장 많음."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ 가장 적은 것",
          "question": "가장 적은 것은 몇 개?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 바나나 3개가 가장 적음."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s09",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "장난감 분류 결과",
          "scenario": {
            "icon": "🧸",
            "body": "장난감을 종류로 나눴어요. 인형 5·블록 4·자동차 6개예요."
          },
          "question": "장난감은 모두 몇 개일까요? \"장난감이 모두 ___개\"",
          "answer": 15
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s10",
        "stage": "정리",
        "block": "self_assessment",
        "data": {
          "title": "스스로 점검해요",
          "items": [
            "분명한 기준을 찾을 수 있어요",
            "기준에 따라 분류할 수 있어요",
            "분류하고 빠짐없이 셀 수 있어요",
            "가장 많은 것·적은 것·전체를 말할 수 있어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "단원에서 배운 분류하기를 모두 확인했어요.",
            "틀린 부분은 다시 한 번 연습하면 돼요. 잘했어요! 👏"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "수학이랑 만들어요",
          "body": "다음 시간에는 전통 색깔 **조각보**를 만들고 색깔로 분류해 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u5_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 5,
      "n": 7,
      "title": "수학이랑 만들어요 (조각보 분류)",
      "std": "[2수04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 전통 색깔 조각보 만들기 → 색깔 분류·세기·결과(단원 마무리)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n만들어요",
          "subtitle": "5단원 · 7/7차시 · 단원 마무리"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "단원을 떠올려요",
          "content": "기준 따라 **분류**하고 **세어** 결과를 말하는 법을 배웠어요.\n오늘은 직접 **만들면서** 분류해 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "전통 색깔로 조각보를 만들어요 🧵",
          "visual": "🐻",
          "question": "우리나라 전통 색깔(노랑·파랑·흰색·검정·빨강)로 조각보를 만들어요.<br>다 만든 뒤 어떤 색을 가장 많이 썼는지 알아볼까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "색깔로 분류하기",
          "content": "조각보에 쓴 조각을 **색깔 기준**으로 나눠요. 빨강 칸·노랑 칸·파랑 칸·흰색 칸.",
          "items": [
            {
              "emoji": "🟥",
              "count": 1,
              "label": "빨강 칸"
            },
            {
              "emoji": "🟦",
              "count": 1,
              "label": "파랑 칸"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "색깔별로 세기",
          "content": "칸마다 세면 빨강 6·노랑 3·파랑 4·흰색 2조각이에요. 가장 많은 색은 빨강이에요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"색이 화려한 게 가장 많이 쓴 색이에요\" — 느낌으로 판단",
          "right": "**수를 세어** 비교해야 해요. 빨강 6 > 파랑 4 > 노랑 3 > 흰색 2.",
          "hint": "화려함이 아니라 조각 수로 가장 많은 색을 정해요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ① 빨강 조각",
          "question": "조각보의 빨강 조각은 모두 몇 개?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 빨강끼리 세면 6개.",
          "items": [
            {
              "emoji": "🟥",
              "count": 6,
              "label": "빨강 조각"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② 전체 조각",
          "question": "빨강 6·노랑 3·파랑 4·흰색 2. 조각은 모두 몇 개?",
          "input": "count_input",
          "answer": 15,
          "note": "풀이: 6+3+4+2=15개."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ 가장 적은 색",
          "question": "가장 적게 쓴 색의 조각은 몇 개?",
          "input": "count_input",
          "answer": 2,
          "note": "풀이: 흰색 2개가 가장 적음."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "우리 반 조각보 전시",
          "scenario": {
            "icon": "🧵",
            "body": "모둠이 만든 조각보를 색깔로 나눠 세었어요. 파랑 칸을 세어 봐요."
          },
          "question": "파랑 조각은 모두 몇 개일까요? \"파랑이 모두 ___개\"",
          "answer": 4
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "전통 색깔로 조각보를 만들고 **색깔로 분류·세기**를 했어요.",
            "가장 많은 색·가장 적은 색·전체 조각 수까지 말할 수 있어요.",
            "분류하기 단원을 모두 마쳤어요! 🎉"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s12",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "곱셈을 만나 볼까요",
          "body": "분류하기를 마쳤어요. 다음 단원에서는 **곱셈**을 배워요. 묶어 세기로 만나 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

})();
