/* ============================================================================
   2학년 1학기 수학 — 3단원 「덧셈과 뺄셈」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u3_l{NN}"] (zero-pad). 교사주도 흐름(~12슬).
   - 학생 본 차시(grade2 .../재수정_v1/g2_math_u3_*.html)의 검증된 식·정답 계승.
   - 성취기준 [2수01-05/06/07/08/09]. 12차시(본 차시 01~12 대응).
   - 부품 흐름: cover/review/motivate/concept/misconception/basic_problem/real_world/summary/next_lesson + self_assessment(11차).
   - g2_math.html이 window.LESSONS 객체에 누적. (g2_korean 패턴 — window.LESSONS+IIFE 양 레포 공통)
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  window.LESSONS["u3_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 1,
      "title": "덧셈과 뺄셈을 만나 볼까요 (단원 도입)",
      "std": "[2수01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 곰이·펭이 기후 동기 → 모으기=덧셈·덜어내기=뺄셈 → 1학년 수준 복습 → 단원 예고"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "덧셈과 뺄셈\n만나 볼까요",
          "subtitle": "3단원 · 1/12차시 · 단원 도입"
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
          "content": "우리는 작은 수의 **더하기**와 **빼기**를 할 수 있어요.\n이번 단원에서는 더 큰 수의 덧셈과 뺄셈을, 여러 가지 방법으로 배워요."
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
          "scene_title": "곰이와 펭이가 슬퍼요 🌏",
          "visual": "🐻‍❄️",
          "question": "북극의 곰이와 남극의 펭이가 얼음이 녹고 바다에 쓰레기가 늘어 힘들어해요.<br>우리가 수학으로 도울 수 있을까요?"
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
          "title": "모으면 덧셈",
          "content": "두 묶음을 **하나로 모으면 덧셈**이에요.",
          "items": [
            {
              "emoji": "🐟",
              "count": 13,
              "label": "13마리"
            },
            {
              "emoji": "🐟",
              "count": 5,
              "label": "5마리 더"
            },
            {
              "emoji": "🐟",
              "count": 18,
              "label": "모으면 18마리"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "덜어 내면 뺄셈",
          "content": "있던 것에서 **덜어 내면 뺄셈**이에요.",
          "items": [
            {
              "emoji": "🐧",
              "count": 16,
              "label": "16마리"
            },
            {
              "emoji": "🐧",
              "count": 4,
              "label": "4마리 떠남"
            },
            {
              "emoji": "🐧",
              "count": 12,
              "label": "남으면 12마리"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"덧셈은 무조건 받아올림을 해야 해요\" — 모든 덧셈이 어렵다고 생각",
          "right": "이번 1차시는 **받아올림·받아내림이 없는** 쉬운 식만 다뤄요. 13+5는 일의 자리끼리만 더하면 돼요.",
          "hint": "받아올림은 다음 차시(2차시)부터 천천히 배워요."
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
          "title": "기본 ① 모으기",
          "question": "곰이가 물고기 13마리에 5마리를 더 잡으면 모두 몇 마리?",
          "input": "count_input",
          "answer": 18,
          "note": "풀이: 일의 자리끼리 3+5=8, 십의 자리는 그대로 → 18.",
          "items": [
            {
              "emoji": "🐟",
              "count": 13,
              "label": "13"
            },
            {
              "emoji": "🐟",
              "count": 5,
              "label": "+5"
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
          "title": "기본 ② 덜어내기",
          "question": "펭귄 16마리 중 4마리가 떠나면 몇 마리 남을까요?",
          "input": "count_input",
          "answer": 12,
          "note": "풀이: 6-4=2, 십의 자리는 그대로 → 12."
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
          "title": "기본 ③ 두 자리 더하기",
          "question": "24 + 13 은 얼마일까요?",
          "input": "count_input",
          "answer": 37,
          "note": "풀이: 일은 일끼리 4+3=7, 십은 십끼리 20+10=30 → 37."
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
          "title": "물고기 이야기",
          "scenario": {
            "icon": "🐟",
            "body": "곰이가 물고기 12마리를 잡고, 5마리를 더 잡았어요."
          },
          "question": "모으기 이야기로 말해 볼까요? \"물고기가 모두 ___마리\"",
          "answer": 17
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
            "모으면 **덧셈**, 덜어 내면 **뺄셈**이에요.",
            "일의 자리는 일의 자리끼리, 십의 자리는 십의 자리끼리 계산해요.",
            "곰이·펭이를 도우며 단원을 시작해요. 🌏"
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
          "preview": "여러 가지 방법으로 덧셈을 해 볼까요 (1)",
          "body": "다음 시간에는 **받아올림이 있는 덧셈**을 여러 가지 방법으로 배워요. 17+6처럼요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 2,
      "title": "여러 가지 방법으로 덧셈을 해 볼까요 (1)",
      "std": "[2수01-06]",
      "duration_min": 40,
      "lesson_format": "교사주도 — (두 자리)+(한 자리) 받아올림. 가르기·이어 세기·십 만들기 여러 전략"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 방법으로\n덧셈을 해 볼까요 (1)",
          "subtitle": "3단원 · 2/12차시"
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
          "title": "지난 시간엔",
          "content": "쉬운 덧셈(받아올림 없음)을 했어요.\n오늘은 **일의 자리가 10이 넘는** 덧셈을 여러 가지 방법으로 해 봐요."
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
          "scene_title": "사탕을 모았어요 🍬",
          "visual": "🍬",
          "question": "곰이가 사탕 17개에 6개를 더 받았어요. 일의 자리 7+6은 10을 넘어요!<br>어떻게 계산하면 좋을까요?"
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
          "title": "방법 ① 10을 먼저 만들어요",
          "content": "**17+6** → 17에 3을 더해 20을 만들고, 남은 3을 더해요.",
          "items": [
            {
              "emoji": "🟦",
              "count": 17,
              "label": "17"
            },
            {
              "emoji": "➕",
              "count": 3,
              "label": "+3=20"
            },
            {
              "emoji": "➕",
              "count": 3,
              "label": "+3=23"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "방법 ② 6을 갈라서 더해요",
          "content": "6을 **3과 3**으로 갈라요. 17+3=20, 20+3=23!",
          "symbol_meanings": [
            {
              "symbol": "17+3",
              "meaning": "먼저 20을 만들어요"
            },
            {
              "symbol": "20+3",
              "meaning": "남은 3을 더해요"
            },
            {
              "symbol": "=23",
              "meaning": "답이 나와요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"7+6=13이니까 답은 1713이에요\" — 자리를 무시하고 이어 붙임",
          "right": "일의 자리 13에서 **10은 십의 자리로 올려요(받아올림)**. 17+6=23이에요.",
          "hint": "십 배열판으로 10을 채우면 받아올림이 눈에 보여요."
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
          "title": "기본 ① ",
          "question": "18 + 5 는 얼마일까요?",
          "input": "count_input",
          "answer": 23,
          "note": "풀이: 18에 2를 더해 20, 남은 3을 더해 23. (받아올림)",
          "items": [
            {
              "emoji": "🟦",
              "count": 18,
              "label": "18"
            },
            {
              "emoji": "➕",
              "count": 5,
              "label": "+5"
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
          "title": "기본 ② ",
          "question": "25 + 7 은 얼마일까요?",
          "input": "count_input",
          "answer": 32,
          "note": "풀이: 25+5=30, 30+2=32."
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
          "title": "기본 ③ ",
          "question": "38 + 5 는 얼마일까요?",
          "input": "count_input",
          "answer": 43,
          "note": "풀이: 38+2=40, 40+3=43."
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
          "title": "구슬 이야기",
          "scenario": {
            "icon": "🔵",
            "body": "펭이가 구슬 48개를 가지고 있었는데 7개를 더 받았어요."
          },
          "question": "모으면 모두 몇 개일까요?",
          "answer": 55
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
            "일의 자리가 10이 넘으면 **받아올림**을 해요.",
            "10을 먼저 만들거나, 뒤의 수를 갈라서 더하면 쉬워요.",
            "17+6=23!"
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
          "preview": "여러 가지 방법으로 덧셈을 해 볼까요 (2)",
          "body": "다음 시간에는 **(두 자리)+(두 자리)** 받아올림 덧셈을 배워요. 28+19처럼요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 3,
      "title": "여러 가지 방법으로 덧셈을 해 볼까요 (2)",
      "std": "[2수01-06]",
      "duration_min": 40,
      "lesson_format": "교사주도 — (두 자리)+(두 자리) 받아올림. 자리별 더하기·십 단위 묶기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 방법으로\n덧셈을 해 볼까요 (2)",
          "subtitle": "3단원 · 3/12차시"
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
          "title": "지난 시간엔",
          "content": "(두 자리)+(한 자리) 받아올림을 했어요.\n오늘은 **(두 자리)+(두 자리)** 덧셈을 해 봐요."
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
          "scene_title": "도토리를 모았어요 🌰",
          "visual": "🌰",
          "question": "곰이가 도토리 28개, 펭이가 19개를 모았어요. 모두 몇 개일까요?<br>두 자리 수끼리 더해 봐요!"
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
          "title": "자리별로 나눠 더해요",
          "content": "**28+19** → 십끼리 20+10=30, 일끼리 8+9=17, 합쳐서 30+17=47.",
          "items": [
            {
              "emoji": "🔟",
              "count": 30,
              "label": "20+10"
            },
            {
              "emoji": "1️⃣",
              "count": 17,
              "label": "8+9"
            },
            {
              "emoji": "🟰",
              "count": 47,
              "label": "47"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "일의 자리부터 차례로",
          "content": "일의 자리 8+9=17 → 7을 쓰고 1 받아올림. 십의 자리 2+1+1=4 → 47.",
          "symbol_meanings": [
            {
              "symbol": "일의 자리",
              "meaning": "8+9=17, 7쓰고 1올림"
            },
            {
              "symbol": "십의 자리",
              "meaning": "2+1+1=4"
            },
            {
              "symbol": "=47",
              "meaning": "답 47"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"받아올림한 1을 깜빡했어요\" — 십의 자리에 1을 더하지 않음",
          "right": "일의 자리에서 올린 **1을 십의 자리에 꼭 더해요**. 2+1+1=4!",
          "hint": "십의 자리 위에 작은 1을 적어 두면 잊지 않아요."
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
          "title": "기본 ① ",
          "question": "45 + 17 은 얼마일까요?",
          "input": "count_input",
          "answer": 62,
          "note": "풀이: 5+7=12(2쓰고 1올림), 4+1+1=6 → 62.",
          "items": [
            {
              "emoji": "🌰",
              "count": 45,
              "label": "45"
            },
            {
              "emoji": "🌰",
              "count": 17,
              "label": "+17"
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
          "title": "기본 ② ",
          "question": "24 + 18 은 얼마일까요?",
          "input": "count_input",
          "answer": 42,
          "note": "풀이: 4+8=12(2쓰고 1올림), 2+1+1=4 → 42."
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
          "title": "기본 ③ ",
          "question": "37 + 27 은 얼마일까요?",
          "input": "count_input",
          "answer": 64,
          "note": "풀이: 7+7=14(4쓰고 1올림), 3+2+1=6 → 64."
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
          "title": "색종이 이야기",
          "scenario": {
            "icon": "🟨",
            "body": "2학년 1반이 색종이 56개, 2반이 37개를 모았어요."
          },
          "question": "두 반의 색종이는 모두 몇 개일까요?",
          "answer": 93
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
            "(두 자리)+(두 자리)도 **자리별로** 더해요.",
            "일의 자리에서 10이 넘으면 십의 자리로 받아올림!",
            "28+19=47."
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
          "preview": "덧셈을 해 볼까요",
          "body": "다음 시간에는 세로셈으로 덧셈을 깔끔하게 정리하고, 더 큰 덧셈도 해 봐요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 4,
      "title": "덧셈을 해 볼까요",
      "std": "[2수01-06]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 세로셈 형식화. 받아올림 세로셈 + 합이 100을 넘는 덧셈"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "덧셈을\n해 볼까요",
          "subtitle": "3단원 · 4/12차시"
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
          "title": "지난 시간엔",
          "content": "여러 가지 방법으로 28+19=47을 구했어요.\n오늘은 **세로셈**으로 자리를 맞춰 깔끔하게 계산해요."
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
          "scene_title": "세로로 줄을 맞춰요 ✏️",
          "visual": "✏️",
          "question": "수가 커지면 가로로 쓰기 불편해요.<br>자리를 위아래로 맞춰 쓰면 어떤 점이 좋을까요?"
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
          "title": "세로셈 — 자리를 맞춰요",
          "content": "십의 자리는 십끼리, 일의 자리는 일끼리 위아래로 맞춰 써요. **일의 자리부터** 계산!",
          "symbol_meanings": [
            {
              "symbol": "자리 맞추기",
              "meaning": "십은 십끼리, 일은 일끼리"
            },
            {
              "symbol": "일부터",
              "meaning": "일의 자리부터 계산"
            },
            {
              "symbol": "받아올림",
              "meaning": "10이 넘으면 윗자리로"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "합이 100을 넘어요",
          "content": "**62+53** → 일 2+3=5, 십 6+5=11. 십의 자리 합이 10이 넘으면 **백의 자리로** 올려 115!",
          "items": [
            {
              "emoji": "💯",
              "count": 100,
              "label": "백 1"
            },
            {
              "emoji": "🔟",
              "count": 10,
              "label": "십 1"
            },
            {
              "emoji": "5️⃣",
              "count": 5,
              "label": "일 5"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"자리를 안 맞추고 그냥 끝에 맞춰 썼어요\"",
          "right": "십의 자리와 일의 자리를 **정확히 위아래로** 맞춰 써야 바르게 계산돼요.",
          "hint": "모눈종이나 칸을 그려 자리를 맞추면 좋아요."
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
          "title": "기본 ① 세로셈",
          "question": "58 + 46 을 세로셈으로 구해요.",
          "input": "count_input",
          "answer": 104,
          "note": "풀이: 8+6=14(4쓰고 1올림), 5+4+1=10 → 104.",
          "items": [
            {
              "emoji": "🟦",
              "count": 58,
              "label": "58"
            },
            {
              "emoji": "🟦",
              "count": 46,
              "label": "+46"
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
          "title": "기본 ② ",
          "question": "75 + 74 는 얼마일까요?",
          "input": "count_input",
          "answer": 149,
          "note": "풀이: 5+4=9, 7+7=14 → 149."
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
          "title": "기본 ③ ",
          "question": "68 + 59 는 얼마일까요?",
          "input": "count_input",
          "answer": 127,
          "note": "풀이: 8+9=17(7쓰고 1올림), 6+5+1=12 → 127."
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
          "title": "책 이야기",
          "scenario": {
            "icon": "📚",
            "body": "도서관에 그림책 65권, 동화책 58권이 있어요."
          },
          "question": "책은 모두 몇 권일까요?",
          "answer": 123
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
            "**세로셈**은 자리를 맞춰 일의 자리부터 계산해요.",
            "받아올림이 두 번 일어나면 **백의 자리**까지 생겨요.",
            "62+53=115."
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
          "preview": "여러 가지 방법으로 뺄셈을 해 볼까요 (1)",
          "body": "이제 **뺄셈**으로 넘어가요. 받아내림이 있는 뺄셈을 여러 방법으로 배워요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 5,
      "title": "여러 가지 방법으로 뺄셈을 해 볼까요 (1)",
      "std": "[2수01-06]",
      "duration_min": 40,
      "lesson_format": "교사주도 — (두 자리)-(한 자리) 받아내림. 10에서 빼기·이어 빼기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 방법으로\n뺄셈을 해 볼까요 (1)",
          "subtitle": "3단원 · 5/12차시"
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
          "title": "지난 시간엔",
          "content": "받아올림 덧셈을 세로셈으로 했어요.\n오늘은 **받아내림**이 있는 뺄셈을 여러 방법으로 해 봐요."
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
          "scene_title": "사탕을 나눠 줬어요 🍭",
          "visual": "🍭",
          "question": "곰이가 사탕 23개 중 5개를 친구에게 줬어요. 일의 자리 3에서 5를 뺄 수 없어요!<br>어떻게 할까요?"
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
          "title": "방법 ① 10에서 먼저 빼요",
          "content": "**23-5** → 23을 20과 3으로 보고, 5를 3과 2로 갈라요. 23-3=20, 20-2=18.",
          "items": [
            {
              "emoji": "🟦",
              "count": 23,
              "label": "23"
            },
            {
              "emoji": "➖",
              "count": 3,
              "label": "-3=20"
            },
            {
              "emoji": "➖",
              "count": 2,
              "label": "-2=18"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "방법 ② 십을 풀어 빼요",
          "content": "23의 십 하나를 풀어 일을 13으로 만들면 13-5=8, 십은 1 남아 18!",
          "symbol_meanings": [
            {
              "symbol": "23-3",
              "meaning": "먼저 20을 만들어요"
            },
            {
              "symbol": "20-2",
              "meaning": "남은 2를 빼요"
            },
            {
              "symbol": "=18",
              "meaning": "답 18"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"3에서 5를 못 빼니까 5-3=2로 거꾸로 뺐어요\"",
          "right": "작은 수에서 큰 수를 못 빼면 **윗자리에서 10을 빌려와요(받아내림)**. 13-5=8 → 18.",
          "hint": "십 배열판에서 십 하나를 풀어 보면 보여요."
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
          "title": "기본 ① ",
          "question": "32 - 7 은 얼마일까요?",
          "input": "count_input",
          "answer": 25,
          "note": "풀이: 32-2=30, 30-5=25. (받아내림)",
          "items": [
            {
              "emoji": "🍭",
              "count": 32,
              "label": "32"
            },
            {
              "emoji": "➖",
              "count": 7,
              "label": "-7"
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
          "title": "기본 ② ",
          "question": "41 - 6 은 얼마일까요?",
          "input": "count_input",
          "answer": 35,
          "note": "풀이: 41-1=40, 40-5=35."
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
          "title": "기본 ③ ",
          "question": "53 - 7 은 얼마일까요?",
          "input": "count_input",
          "answer": 46,
          "note": "풀이: 53-3=50, 50-4=46."
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
          "title": "색연필 이야기",
          "scenario": {
            "icon": "🖍️",
            "body": "펭이가 색연필 62자루 중 8자루를 동생에게 줬어요."
          },
          "question": "남은 색연필은 몇 자루일까요?",
          "answer": 54
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
            "일의 자리에서 뺄 수 없으면 **받아내림**을 해요.",
            "먼저 10을 만들거나, 십을 풀어 빼면 쉬워요.",
            "23-5=18."
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
          "preview": "여러 가지 방법으로 뺄셈을 해 볼까요 (2)",
          "body": "다음 시간에는 **(두 자리)-(두 자리)** 받아내림 뺄셈을 배워요. 50-27처럼요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 6,
      "title": "여러 가지 방법으로 뺄셈을 해 볼까요 (2)",
      "std": "[2수01-06]",
      "duration_min": 40,
      "lesson_format": "교사주도 — (두 자리)-(두 자리) 받아내림. 자리별 빼기·십 풀기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 방법으로\n뺄셈을 해 볼까요 (2)",
          "subtitle": "3단원 · 6/12차시"
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
          "title": "지난 시간엔",
          "content": "(두 자리)-(한 자리) 받아내림을 했어요.\n오늘은 **(두 자리)-(두 자리)** 뺄셈을 해 봐요."
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
          "scene_title": "연필을 나눴어요 ✏️",
          "visual": "✏️",
          "question": "곰이가 연필 50자루 중 27자루를 나눠 줬어요. 일의 자리 0에서 7을 뺄 수 없어요!<br>어떻게 할까요?"
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
          "title": "자리별로 빼요",
          "content": "**50-27** → 십을 풀어 일을 10으로. 10-7=3, 십은 4 남아 4-2=2 → 23.",
          "items": [
            {
              "emoji": "🔟",
              "count": 40,
              "label": "50→40+10"
            },
            {
              "emoji": "1️⃣",
              "count": 3,
              "label": "10-7"
            },
            {
              "emoji": "🟰",
              "count": 23,
              "label": "23"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "받아내림 세로셈",
          "content": "일의 자리부터: 0-7 못 빼니 십에서 빌려 10-7=3. 십은 4-2=2 → 23.",
          "symbol_meanings": [
            {
              "symbol": "받아내림",
              "meaning": "십에서 10을 빌려요"
            },
            {
              "symbol": "10-7=3",
              "meaning": "일의 자리"
            },
            {
              "symbol": "4-2=2",
              "meaning": "십의 자리"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"십에서 빌려 놓고 십의 자리는 그대로 뒀어요\"",
          "right": "빌려준 십의 자리는 **1 줄어들어요**. 5→4가 되어 4-2=2!",
          "hint": "빌린 자리 위에 줄 긋고 줄어든 수를 적어 두면 좋아요."
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
          "title": "기본 ① ",
          "question": "42 - 19 는 얼마일까요?",
          "input": "count_input",
          "answer": 23,
          "note": "풀이: 십 풀어 12-9=3, 3-1=2 → 23.",
          "items": [
            {
              "emoji": "✏️",
              "count": 42,
              "label": "42"
            },
            {
              "emoji": "➖",
              "count": 19,
              "label": "-19"
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
          "title": "기본 ② ",
          "question": "45 - 28 은 얼마일까요?",
          "input": "count_input",
          "answer": 17,
          "note": "풀이: 15-8=7, 3-2=1 → 17."
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
          "title": "기본 ③ ",
          "question": "63 - 27 은 얼마일까요?",
          "input": "count_input",
          "answer": 36,
          "note": "풀이: 13-7=6, 5-2=3 → 36."
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
          "title": "딱지 이야기",
          "scenario": {
            "icon": "🟫",
            "body": "곰이가 딱지 72장 중 37장을 잃었어요."
          },
          "question": "남은 딱지는 몇 장일까요?",
          "answer": 35
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
            "(두 자리)-(두 자리)는 **자리별로** 빼요.",
            "일의 자리가 작으면 십에서 빌려요(받아내림). 빌린 십은 1 줄어요.",
            "50-27=23."
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
          "preview": "뺄셈을 해 볼까요",
          "body": "다음 시간에는 세로셈으로 뺄셈을 깔끔하게 정리해요. 54-26처럼요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 7,
      "title": "뺄셈을 해 볼까요",
      "std": "[2수01-06]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 받아내림 세로셈 형식화. (두 자리)-(두 자리)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "뺄셈을\n해 볼까요",
          "subtitle": "3단원 · 7/12차시"
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
          "title": "지난 시간엔",
          "content": "여러 방법으로 50-27=23을 구했어요.\n오늘은 **세로셈**으로 받아내림 뺄셈을 정리해요."
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
          "scene_title": "세로로 빼 봐요 ✏️",
          "visual": "✏️",
          "question": "곰이가 사탕 54개 중 26개를 먹었어요.<br>세로셈으로 자리를 맞춰 빼면 어떤 점이 좋을까요?"
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
          "title": "받아내림 세로셈",
          "content": "**54-26** → 일의 자리 4-6 못 빼니 십에서 빌려 14-6=8. 십은 5→4, 4-2=2 → 28.",
          "symbol_meanings": [
            {
              "symbol": "자리 맞추기",
              "meaning": "십은 십끼리, 일은 일끼리"
            },
            {
              "symbol": "14-6=8",
              "meaning": "십에서 빌려 일의 자리"
            },
            {
              "symbol": "4-2=2",
              "meaning": "줄어든 십의 자리"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "덧셈으로 확인해요",
          "content": "28+26=54! 뺄셈의 답에 뺀 수를 더하면 원래 수가 돼요.",
          "items": [
            {
              "emoji": "✅",
              "count": 28,
              "label": "답 28"
            },
            {
              "emoji": "➕",
              "count": 26,
              "label": "+26"
            },
            {
              "emoji": "🟰",
              "count": 54,
              "label": "54"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"4-6을 그냥 6-4=2로 거꾸로 뺐어요\"",
          "right": "일의 자리에서 못 빼면 **십에서 빌려** 14-6=8로 계산해요.",
          "hint": "받아내림 후 십의 자리가 1 줄어드는 것도 잊지 마세요."
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
          "title": "기본 ① 세로셈",
          "question": "23 - 4 를 세로셈으로 구해요.",
          "input": "count_input",
          "answer": 19,
          "note": "풀이: 13-4=9, 십은 1 → 19.",
          "items": [
            {
              "emoji": "🍬",
              "count": 23,
              "label": "23"
            },
            {
              "emoji": "➖",
              "count": 4,
              "label": "-4"
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
          "title": "기본 ② ",
          "question": "65 - 18 은 얼마일까요?",
          "input": "count_input",
          "answer": 47,
          "note": "풀이: 15-8=7, 5-1=4 → 47."
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
          "title": "기본 ③ ",
          "question": "81 - 37 은 얼마일까요?",
          "input": "count_input",
          "answer": 44,
          "note": "풀이: 11-7=4, 7-3=4 → 44."
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
          "title": "색종이 이야기",
          "scenario": {
            "icon": "🟦",
            "body": "색종이 73장 중 49장을 사용했어요."
          },
          "question": "남은 색종이는 몇 장일까요?",
          "answer": 24
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
            "받아내림 **세로셈**은 일의 자리부터, 못 빼면 십에서 빌려요.",
            "답에 뺀 수를 더하면 원래 수 — **덧셈으로 확인**!",
            "54-26=28."
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
          "preview": "세 수의 계산을 해 볼까요",
          "body": "다음 시간에는 **세 수**를 한꺼번에, 앞에서부터 차례대로 계산해요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 8,
      "title": "세 수의 계산을 해 볼까요",
      "std": "[2수01-08]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 세 수의 계산. 앞에서부터 순서대로(①②), 중간값"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "세 수의 계산을\n해 볼까요",
          "subtitle": "3단원 · 8/12차시"
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
          "title": "지난 시간엔",
          "content": "두 수의 덧셈·뺄셈을 했어요.\n오늘은 **세 수**를 한꺼번에 계산해요."
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
          "scene_title": "북극곰 수가 바뀌어요 🐻‍❄️",
          "visual": "🐻‍❄️",
          "question": "곰 15마리 → 19마리가 더 오고 → 21마리가 떠났어요.<br>지금 몇 마리? 세 수를 어떻게 계산할까요?"
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
          "title": "앞에서부터 ① ②",
          "content": "**15+19-21** → ① 15+19=34, ② 34-21=13. 앞에서부터 차례대로!",
          "symbol_meanings": [
            {
              "symbol": "① 15+19",
              "meaning": "앞 두 수 먼저 = 34"
            },
            {
              "symbol": "중간값 34",
              "meaning": "적어 둬요"
            },
            {
              "symbol": "② 34-21",
              "meaning": "세 번째 수 = 13"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "덧셈·뺄셈이 섞여도",
          "content": "더하고 빼기, 빼고 더하기 — 무엇이든 **앞에서부터** 차례대로!",
          "items": [
            {
              "emoji": "➕",
              "count": 1,
              "label": "더하고"
            },
            {
              "emoji": "➖",
              "count": 1,
              "label": "빼고"
            },
            {
              "emoji": "🔁",
              "count": 1,
              "label": "차례대로"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"뒤의 19-21을 먼저 했어요\" — 뒤에서부터 계산",
          "right": "세 수는 반드시 **앞에서부터** 계산해요. 뒤를 먼저 하면 답이 달라져요!",
          "hint": "중간값(①의 답)을 적어 가며 ②를 풀면 헷갈리지 않아요."
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
          "title": "기본 ① ",
          "question": "24 + 17 - 19 를 차례대로 구해요.",
          "input": "count_input",
          "answer": 22,
          "note": "풀이: ① 24+17=41, ② 41-19=22."
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
          "title": "기본 ② ",
          "question": "28 + 25 - 36 을 구해요.",
          "input": "count_input",
          "answer": 17,
          "note": "풀이: ① 28+25=53, ② 53-36=17."
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
          "title": "기본 ③ ",
          "question": "42 - 15 + 27 을 구해요.",
          "input": "count_input",
          "answer": 54,
          "note": "풀이: ① 42-15=27, ② 27+27=54."
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
          "title": "도토리 이야기",
          "scenario": {
            "icon": "🌰",
            "body": "곰이가 도토리 45개를 모아 17개를 먹고, 24개를 더 주웠어요."
          },
          "question": "지금 도토리는 모두 몇 개일까요? (45-17+24)",
          "answer": 52
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
            "세 수는 **앞에서부터 순서대로**(①②) 계산해요.",
            "① 앞 두 수를 먼저, ② 그 답에 세 번째 수를.",
            "15+19-21=13."
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
          "preview": "덧셈과 뺄셈의 관계",
          "body": "다음 시간에는 덧셈식과 뺄셈식의 **관계**를 알아봐요. 7+3=10 → 10-7=3!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 9,
      "title": "덧셈과 뺄셈의 관계를 식으로 나타내 볼까요",
      "std": "[2수01-07]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 부분-부분-전체. 덧셈식↔뺄셈식 관계(역연산)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "덧셈과 뺄셈의\n관계를 알아봐요",
          "subtitle": "3단원 · 9/12차시"
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
          "title": "지난 시간엔",
          "content": "세 수의 계산을 했어요.\n오늘은 덧셈식과 뺄셈식의 **관계**를 알아봐요."
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
          "scene_title": "북극곰은 모두 몇 마리? 🐻‍❄️",
          "visual": "🐻‍❄️",
          "question": "물 안에 7마리, 물 밖에 3마리 있어요. 모두 10마리!<br>이 상황을 덧셈식과 뺄셈식으로 나타낼 수 있을까요?"
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
          "title": "전체와 부분",
          "content": "부분 7과 부분 3을 모으면 전체 10. **7+3=10**.",
          "items": [
            {
              "emoji": "🟦",
              "count": 10,
              "label": "전체 10"
            },
            {
              "emoji": "🟩",
              "count": 7,
              "label": "부분 7"
            },
            {
              "emoji": "🟨",
              "count": 3,
              "label": "부분 3"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "덧셈식 하나로 뺄셈식 둘",
          "content": "7+3=10 이면 **10-7=3**, **10-3=7**! 전체에서 한 부분을 빼면 다른 부분.",
          "symbol_meanings": [
            {
              "symbol": "7+3=10",
              "meaning": "모으기(덧셈)"
            },
            {
              "symbol": "10-7=3",
              "meaning": "한 부분 빼기"
            },
            {
              "symbol": "10-3=7",
              "meaning": "다른 부분 빼기"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"10-7은 답이 7이에요\" — 전체와 부분을 헷갈림",
          "right": "전체 10에서 부분 7을 빼면 **다른 부분 3**이 나와요. 10-7=3!",
          "hint": "막대그림으로 전체-부분을 그리면 관계가 보여요."
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
          "title": "기본 ① 전체 구하기",
          "question": "부분 8과 부분 5를 모으면 전체는?",
          "input": "count_input",
          "answer": 13,
          "note": "풀이: 두 부분을 더해요. 8+5=13.",
          "items": [
            {
              "emoji": "🟩",
              "count": 8,
              "label": "8"
            },
            {
              "emoji": "🟨",
              "count": 5,
              "label": "5"
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
          "title": "기본 ② 다른 부분",
          "question": "전체 15, 한 부분 9. 다른 부분은?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 전체에서 한 부분을 빼요. 15-9=6."
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
          "title": "기본 ③ ",
          "question": "7 + 8 = 15 이면 15 - 8 = ?",
          "input": "count_input",
          "answer": 7,
          "note": "풀이: 전체 15에서 부분 8을 빼면 다른 부분 7."
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
          "title": "사과 이야기",
          "scenario": {
            "icon": "🍎",
            "body": "곰이가 사과 9개를 가지고 있다가 몇 개 더 받아 모두 15개가 됐어요."
          },
          "question": "더 받은 사과는 몇 개일까요? (9+□=15)",
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
            "같은 세 수로 **덧셈식 2개·뺄셈식 2개**를 만들 수 있어요.",
            "전체에서 한 부분을 빼면 다른 부분이 나와요.",
            "7+3=10 → 10-7=3, 10-3=7."
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
          "preview": "□가 사용된 식",
          "body": "다음 시간에는 모르는 수를 **□**로 나타내고, □의 값을 구해요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l10"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 10,
      "title": "□가 사용된 식을 만들고 □의 값을 구해 볼까요",
      "std": "[2수01-09]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 모르는 수 □·등호 균형. 관계로 □ 구하기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "□가 사용된 식\n□의 값을 구해요",
          "subtitle": "3단원 · 10/12차시"
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
          "title": "지난 시간엔",
          "content": "덧셈과 뺄셈의 관계를 배웠어요.\n오늘은 모르는 수를 **□**로 나타내고 값을 구해요."
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
          "scene_title": "물고기를 몇 마리 더? 🐟",
          "visual": "🐟",
          "question": "곰이가 물고기 5마리를 잡고 더 잡아 모두 9마리가 됐어요.<br>더 잡은 수를 □로 하면? 5+□=9!"
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
          "title": "모르는 수를 □로",
          "content": "**5+□=9** → 전체 9, 부분 5. 다른 부분 □는 9-5=4!",
          "symbol_meanings": [
            {
              "symbol": "5+□=9",
              "meaning": "□는 모르는 수"
            },
            {
              "symbol": "9-5",
              "meaning": "전체에서 부분 빼기"
            },
            {
              "symbol": "□=4",
              "meaning": "답 4"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "등호는 저울처럼",
          "content": "= 는 **양쪽이 똑같다**는 뜻. 5+□와 9가 같아지려면 □=4.",
          "items": [
            {
              "emoji": "⚖️",
              "count": 1,
              "label": "왼쪽=오른쪽"
            },
            {
              "emoji": "5️⃣",
              "count": 1,
              "label": "5+4"
            },
            {
              "emoji": "9️⃣",
              "count": 1,
              "label": "=9"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"12-□=9에서 □=12+9=21\" — 무조건 더함",
          "right": "빼어지는 수가 아니라 **□가 빼는 수**예요. 12-□=9 → □=12-9=3!",
          "hint": "막대그림으로 전체·부분을 정하면 더할지 뺄지 보여요."
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
          "title": "기본 ① ",
          "question": "5 + □ = 9 에서 □는?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 전체 9에서 부분 5를 빼요. 9-5=4.",
          "items": [
            {
              "emoji": "🟦",
              "count": 9,
              "label": "전체 9"
            },
            {
              "emoji": "🟩",
              "count": 5,
              "label": "부분 5"
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
          "title": "기본 ② ",
          "question": "13 - □ = 8 에서 □는?",
          "input": "count_input",
          "answer": 5,
          "note": "풀이: 전체 13에서 남은 8을 빼요. 13-8=5."
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
          "title": "기본 ③ ",
          "question": "□ - 7 = 8 에서 □는?",
          "input": "count_input",
          "answer": 15,
          "note": "풀이: 남은 8과 빼낸 7을 모아요. 8+7=15."
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
          "title": "사탕 이야기",
          "scenario": {
            "icon": "🍬",
            "body": "곰이가 사탕 □개 중 6개를 주었더니 7개가 남았어요."
          },
          "question": "처음 사탕은 몇 개였을까요? (□-6=7)",
          "answer": 13
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
            "모르는 수는 **□**로 나타내요.",
            "= 는 양쪽이 같다는 뜻 — 덧셈·뺄셈 **관계**로 □를 구해요.",
            "5+□=9 → □=4."
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
          "body": "다음 시간에는 단원에서 배운 것을 **확인**해요. 그동안 배운 걸 모아서!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l11"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 11,
      "title": "수학이랑 확인해요 (단원 평가)",
      "std": "[2수01-06] · [2수01-07] · [2수01-08] · [2수01-09]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 단원 평가. 받아올림/내림·세 수·관계·□값 총정리 + 스스로 점검"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n확인해요",
          "subtitle": "3단원 · 11/12차시 · 단원 평가"
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
          "title": "이 단원에서 배운 것",
          "content": "받아올림·받아내림 세로셈, 세 수의 계산, 덧셈뺄셈 관계, □의 값.\n오늘은 모두 모아 **확인**해요!"
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
          "scene_title": "얼마나 익혔을까요? ✅",
          "visual": "✅",
          "question": "곰이와 펭이가 그동안 배운 것을 점검해요.<br>한 문제씩 풀며 내가 잘 아는지 확인해 볼까요?"
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
          "title": "네 가지를 점검해요",
          "content": "① 세로셈(받아올림·받아내림) ② 세 수 계산 ③ 덧셈뺄셈 관계 ④ □의 값.",
          "items": [
            {
              "emoji": "➕",
              "count": 1,
              "label": "받아올림"
            },
            {
              "emoji": "➖",
              "count": 1,
              "label": "받아내림"
            },
            {
              "emoji": "3️⃣",
              "count": 1,
              "label": "세 수"
            },
            {
              "emoji": "□",
              "count": 1,
              "label": "□값"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ① 받아올림",
          "question": "세로셈으로 47 + 28 을 구해요.",
          "input": "count_input",
          "answer": 75,
          "note": "풀이: 7+8=15(5쓰고 1올림), 4+2+1=7 → 75.",
          "items": [
            {
              "emoji": "🟦",
              "count": 47,
              "label": "47"
            },
            {
              "emoji": "🟦",
              "count": 28,
              "label": "+28"
            }
          ]
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s06",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ② 받아내림",
          "question": "63 - 27 은 얼마일까요?",
          "input": "count_input",
          "answer": 36,
          "note": "풀이: 13-7=6, 5-2=3 → 36."
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
          "title": "확인 ③ 세 수",
          "question": "28 + 35 - 19 를 차례대로 구해요.",
          "input": "count_input",
          "answer": 44,
          "note": "풀이: ① 28+35=63, ② 63-19=44."
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
          "title": "확인 ④ □값",
          "question": "□ + 8 = 15 에서 □는?",
          "input": "count_input",
          "answer": 7,
          "note": "풀이: 전체 15에서 부분 8을 빼요. 15-8=7."
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
          "title": "재활용 이야기",
          "scenario": {
            "icon": "♻️",
            "body": "곰이가 캔 56개를, 펭이가 38개를 모았어요."
          },
          "question": "곰이가 몇 개 더 모았을까요? (56-38)",
          "answer": 18
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
            "받아올림이 있는 덧셈을 세로셈으로 할 수 있어요",
            "받아내림이 있는 뺄셈을 할 수 있어요",
            "세 수의 계산을 앞에서부터 할 수 있어요",
            "덧셈뺄셈 관계로 □의 값을 구할 수 있어요"
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
            "단원에서 배운 네 가지를 모두 확인했어요.",
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
          "body": "다음 시간에는 배운 것으로 직접 **만들고** 친구와 비교해요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u3_l12"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 3,
      "n": 12,
      "title": "수학이랑 만들어요",
      "std": "[2수01-05] · [2수01-06]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 아웃트로. 연결 모형 작품 → 쓴 모형 수로 덧셈·뺄셈, 나·친구 비교. 환경"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n만들어요",
          "subtitle": "3단원 · 12/12차시"
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
          "title": "이 단원을 마치며",
          "content": "덧셈과 뺄셈을 여러 방법으로 배웠어요.\n오늘은 배운 것으로 직접 **만들고** 수를 세어 봐요."
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
          "scene_title": "멸종 위기 동물을 만들어요 🧊",
          "visual": "🧊",
          "question": "곰이와 펭이가 색 큐브로 북극곰과 펭귄을 만들었어요.<br>쓴 큐브 수로 덧셈·뺄셈을 해 볼까요?"
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
          "title": "부분으로 나눠 세요",
          "content": "큐브가 많으면 **색깔별(부분)로 나눠** 센 뒤 더해요. 빨강 25 + 파랑 17 = 42.",
          "items": [
            {
              "emoji": "🟥",
              "count": 25,
              "label": "빨강 25"
            },
            {
              "emoji": "🟦",
              "count": 17,
              "label": "파랑 17"
            },
            {
              "emoji": "🟰",
              "count": 42,
              "label": "모두 42"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "나와 친구를 비교해요",
          "content": "모두 = **덧셈**, 차이 = **뺄셈**. 곰이 42, 펭이 35 → 모두 77, 차이 7.",
          "symbol_meanings": [
            {
              "symbol": "모두",
              "meaning": "42+35=77 (덧셈)"
            },
            {
              "symbol": "차이",
              "meaning": "42-35=7 (뺄셈)"
            },
            {
              "symbol": "비교",
              "meaning": "누가 몇 개 더?"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ]
      },
      {
        "id": "s06",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 생각을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"몇 개 더 많은지 구할 때 두 수를 더했어요\"",
          "right": "'몇 개 더'는 **차이**예요 — 큰 수에서 작은 수를 **빼요**. 45-28=17!",
          "hint": "두 묶음을 나란히 놓고 짝지으면 차이가 보여요."
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
          "title": "기본 ① 큐브 세기",
          "question": "빨강 23개와 파랑 19개. 큐브는 모두 몇 개?",
          "input": "count_input",
          "answer": 42,
          "note": "풀이: 부분으로 나눠 더해요. 23+19=42.",
          "items": [
            {
              "emoji": "🟥",
              "count": 23,
              "label": "빨강 23"
            },
            {
              "emoji": "🟦",
              "count": 19,
              "label": "파랑 19"
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
          "title": "기본 ② 비교",
          "question": "곰이 45개, 펭이 28개. 곰이가 몇 개 더 썼을까요?",
          "input": "count_input",
          "answer": 17,
          "note": "풀이: 차이는 빼기. 45-28=17."
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
          "title": "기본 ③ 받아올림",
          "question": "큰 작품에 38개, 작은 작품에 47개. 모두?",
          "input": "count_input",
          "answer": 85,
          "note": "풀이: 8+7=15(5쓰고 1올림), 3+4+1=8 → 85."
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
          "title": "재활용품 이야기",
          "scenario": {
            "icon": "♻️",
            "body": "곰이가 재활용품 56개, 펭이가 38개를 모았어요."
          },
          "question": "곰이가 몇 개 더 모았을까요?",
          "answer": 18
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
            "연결 모형으로 만들고 쓴 수로 **덧셈·뺄셈**을 했어요.",
            "모두는 더하기, 차이는 빼기! 🌏 멸종 위기 동물을 기억해요.",
            "덧셈과 뺄셈 단원을 모두 마쳤어요. 잘했어요! 👏"
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
          "title": "다음 단원 예고",
          "preview": "곱셈을 알아볼까요",
          "body": "다음 단원에서는 같은 수를 여러 번 더하는 **곱셈**의 세계로 가요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

})();
