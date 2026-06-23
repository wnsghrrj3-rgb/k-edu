/* ============================================================================
   2학년 1학기 수학 — 1단원 「세 자리 수」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u1_l{NN}"] (zero-pad). 교사주도 흐름(~12슬).
   - 학생 본 차시(grade2 .../재수정_v1/g2_math_u1_*.html)의 검증된 식·정답 계승.
   - 성취기준 [2수01-02](자릿값·읽고 쓰기)·[2수01-03](크기 비교). 9차시(본 차시 01~09 대응).
   - 부품 흐름: cover/review/motivate/concept/misconception/basic_problem/real_world/summary/next_lesson + self_assessment(08차 평가).
   - g2_math.html이 window.LESSONS 객체에 누적. (g2_korean/u3 패턴 — window.LESSONS+IIFE 양 레포 공통)
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  window.LESSONS["u1_l01"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 1,
      "title": "세 자리 수를 만나 볼까요 (단원 도입)",
      "std": "[2수01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 도서관 큰 수 동기 → 10묶음 10개=100 → 두 자리/세 자리 구별 → 단원 예고"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "세 자리 수를\n만나 볼까요",
          "subtitle": "1단원 · 1/9차시 · 단원 도입"
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
          "content": "우리는 **두 자리 수(10~99)**까지 읽고 쓸 수 있어요.\n이번 단원에서는 99보다 큰 수, **세 자리 수**를 배워요."
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
          "scene_title": "도서관에 책이 가득해요 📚",
          "visual": "📚",
          "question": "곰이와 펭이가 도서관에 갔어요. 책이 99권보다 훨씬 많아요.<br>이렇게 큰 수는 어떻게 셀까요?"
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
          "title": "10묶음이 10개면 100",
          "content": "십 모형 **10개를 모으면 100**이 돼요. 99보다 1 큰 수예요.",
          "items": [
            {
              "emoji": "🟫",
              "count": 10,
              "label": "십 모형 10개"
            },
            {
              "emoji": "🟥",
              "count": 1,
              "label": "백 모형 1개"
            },
            {
              "emoji": "💯",
              "count": 1,
              "label": "100"
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
          "title": "두 자리 수와 세 자리 수",
          "content": "**99까지는 두 자리 수**, **100부터는 세 자리 수**예요. 자리가 하나 더 늘어나요."
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
          "wrong": "\"99 다음은 910이에요\" — 9와 1을 그냥 이어 붙임",
          "right": "99 다음은 **100**이에요. 십 모형 10개가 백 모형 1개로 바뀌어요.",
          "hint": "십 모형을 한 개씩 늘려 가며 10개를 채워 보면 100이 보여요."
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
          "question": "십 모형 10개를 모으면 모두 얼마일까요?",
          "input": "count_input",
          "answer": 100,
          "note": "풀이: 10이 10개이면 100. 99보다 1 큰 수예요.",
          "items": [
            {
              "emoji": "🟫",
              "count": 10,
              "label": "십 모형 10개"
            }
          ]
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "책 30권을 읽고 13권을 더 읽으면 모두 몇 권일까요?",
          "input": "count_input",
          "answer": 43,
          "note": "풀이: 30+13=43. (1학년 수준 덧셈 복습)"
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "60과 40을 모으면 얼마일까요?",
          "input": "count_input",
          "answer": 100,
          "note": "풀이: 60+40=100. 두 수를 모아 100을 만들어요."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "도서관 이야기",
          "scenario": {
            "icon": "📚",
            "body": "곰이가 책 60권을, 펭이가 책 40권을 모았어요."
          },
          "question": "두 사람이 모은 책은 모두 몇 권일까요?",
          "answer": 100
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
            "99보다 1 큰 수가 **100**이에요.",
            "10이 10개이면 100, 100부터는 **세 자리 수**예요.",
            "이번 단원에서 큰 수를 읽고 쓰고 비교해요!"
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
          "preview": "백을 알아볼까요",
          "body": "다음 시간에는 **100(백)**이 무엇인지 자세히 알아봐요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u1_l02"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 2,
      "title": "백을 알아볼까요",
      "std": "[2수01-02], [2수01-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 10이 10개=100 → 100의 여러 표현 → 100 가르기·모으기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "백을\n알아볼까요",
          "subtitle": "1단원 · 2/9차시"
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
          "content": "지난 시간에 99보다 1 큰 수가 **100**인 것을 배웠어요.\n오늘은 100을 더 자세히 알아봐요."
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
          "scene_title": "연필이 한가득! ✏️",
          "visual": "✏️",
          "question": "곰이가 연필을 10자루씩 10묶음 가지고 있어요.<br>모두 몇 자루일까요?"
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
          "title": "10이 10개이면 100",
          "content": "**10이 10개**이면 100이에요. 100은 **백**이라고 읽어요.",
          "items": [
            {
              "emoji": "🟫",
              "count": 10,
              "label": "십 모형 10개"
            },
            {
              "emoji": "🟥",
              "count": 1,
              "label": "= 백 1개(100)"
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
          "title": "100은 여러 가지로 말해요",
          "content": "100은 **90보다 10 큰 수**, **99보다 1 큰 수**, **10이 10개**인 수예요. 모두 같은 100이에요."
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
          "wrong": "\"10이 10개니까 1010이에요\" — 묶음을 그대로 늘어놓음",
          "right": "10이 10개 모이면 새로운 한 자리, **백의 자리**가 생겨 **100**이 돼요.",
          "hint": "십 모형 10개를 백 모형 1개로 바꿔 보면 100이 보여요."
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
          "question": "10이 10개이면 얼마일까요?",
          "input": "count_input",
          "answer": 100,
          "note": "풀이: 10이 10개이면 100(백)."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "100은 10이 몇 개일까요?",
          "input": "count_input",
          "answer": 10,
          "note": "풀이: 100은 10이 10개."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "60과 얼마를 모으면 100이 될까요?",
          "input": "count_input",
          "answer": 40,
          "note": "풀이: 60+40=100."
        },
        "suggested_extras": [
          "q_basic"
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
            "body": "펭이가 사과 60개를 땄는데, 곰이가 40개를 더 주었어요."
          },
          "question": "사과는 모두 몇 개일까요?",
          "answer": 100
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
            "10이 10개이면 **100(백)**이에요.",
            "100은 90보다 10 큰 수, 99보다 1 큰 수예요.",
            "두 수를 모아 100을 만들 수 있어요!"
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
          "preview": "몇백을 알아볼까요",
          "body": "다음 시간에는 200, 300처럼 **몇백**을 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u1_l03"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 3,
      "title": "몇백을 알아볼까요",
      "std": "[2수01-02], [2수01-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 100이 몇 개=몇백 → 몇백 읽기·쓰기 → 100씩 뛰어 세기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "몇백을\n알아볼까요",
          "subtitle": "1단원 · 3/9차시"
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
          "content": "지난 시간에 **100(백)**을 배웠어요.\n오늘은 200, 300, 400 … 같은 **몇백**을 알아봐요."
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
          "scene_title": "책이 몇백 권! 📖",
          "visual": "📖",
          "question": "도서관 책장 하나에 책이 100권씩 꽂혀 있어요.<br>책장 5개에는 모두 몇 권일까요?"
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
          "title": "100이 몇 개이면 몇백",
          "content": "**100이 4개**이면 400, **100이 5개**이면 500이에요. 100이 몇 개인지로 몇백을 알 수 있어요.",
          "items": [
            {
              "emoji": "🟥",
              "count": 4,
              "label": "백 모형 4개"
            },
            {
              "emoji": "4️⃣",
              "count": 1,
              "label": "= 400(사백)"
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
          "title": "몇백 읽고 쓰기",
          "content": "200은 **이백**, 500은 **오백**, 700은 **칠백**이라고 읽어요. 백의 자리 숫자만 바뀌어요."
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
          "wrong": "\"100이 5개니까 105예요\" — 개수를 일의 자리에 적음",
          "right": "100이 5개이면 **500**이에요. 백의 자리에 5를 써요.",
          "hint": "백 모형을 한 개씩 늘리며 100-200-300으로 세어 보세요."
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
          "question": "100이 5개이면 얼마일까요?",
          "input": "count_input",
          "answer": 500,
          "note": "풀이: 100이 5개이면 500(오백)."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "600은 100이 몇 개일까요?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 600은 100이 6개."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "100이 8개이면 얼마일까요?",
          "input": "count_input",
          "answer": 800,
          "note": "풀이: 100이 8개이면 800(팔백)."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "동전 이야기",
          "scenario": {
            "icon": "🪙",
            "body": "곰이가 100원짜리 동전 5개를 저금통에 넣었어요."
          },
          "question": "저금통에 들어간 돈은 모두 얼마일까요?",
          "answer": 500
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
            "100이 몇 개이면 **몇백**이에요.",
            "200은 이백, 500은 오백처럼 읽어요.",
            "100씩 뛰어 세면 100-200-300 … 으로 늘어나요!"
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
          "preview": "세 자리 수를 알아볼까요",
          "body": "다음 시간에는 백·십·일을 합친 **세 자리 수**를 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u1_l04"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 4,
      "title": "세 자리 수를 알아볼까요",
      "std": "[2수01-02], [2수01-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 백·십·일 모형 조립 → 세 자리 수 읽기·쓰기 → 없는 자리 0"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "세 자리 수를\n알아볼까요",
          "subtitle": "1단원 · 4/9차시 · 단원 핵심"
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
          "content": "지난 시간에 **몇백**을 배웠어요.\n오늘은 백·십·일을 모두 합친 **세 자리 수**를 만들어요."
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
          "scene_title": "대출증이 몇 장? 🎫",
          "visual": "🎫",
          "question": "도서관에 대출증이 백 묶음 2개, 십 묶음 5개, 낱장 4개 있어요.<br>모두 몇 장일까요?"
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
          "title": "백 2개·십 5개·일 4개 = 254",
          "content": "**백 2개, 십 5개, 일 4개**를 합치면 **254**예요.",
          "items": [
            {
              "emoji": "🟥",
              "count": 2,
              "label": "백 2개(200)"
            },
            {
              "emoji": "🟦",
              "count": 5,
              "label": "십 5개(50)"
            },
            {
              "emoji": "🟨",
              "count": 4,
              "label": "일 4개(4)"
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
          "title": "254는 '이백오십사'",
          "content": "254는 **이백오십사**라고 읽어요. **없는 자리에는 0**을 써요. 백 5개·일 3개뿐이면 **503**이에요."
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
          "wrong": "\"백 5개·일 3개니까 53이에요\" — 십의 자리를 비워 둠",
          "right": "십의 자리가 없으면 **0을 채워 503**으로 써요. 자리를 비우면 안 돼요.",
          "hint": "백·십·일 칸을 그려 놓고 없는 자리에 0을 적어 보세요."
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
          "question": "백 3개·십 4개·일 7개이면 얼마일까요?",
          "input": "count_input",
          "answer": 347,
          "note": "풀이: 300+40+7=347."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "백 6개·십 3개·일 5개이면 얼마일까요?",
          "input": "count_input",
          "answer": 635,
          "note": "풀이: 600+30+5=635."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "503에서 십의 자리 숫자는 무엇일까요?",
          "input": "count_input",
          "answer": 0,
          "note": "풀이: 503은 백 5·십 0·일 3. 십의 자리는 0."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "대출증 이야기",
          "scenario": {
            "icon": "🎫",
            "body": "도서관에 대출증이 백 묶음 3개, 십 묶음 4개, 낱장 7장 있어요."
          },
          "question": "대출증은 모두 몇 장일까요?",
          "answer": 347
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
            "백·십·일을 합치면 **세 자리 수**가 돼요.",
            "254는 이백오십사로 읽어요.",
            "**없는 자리에는 0**을 꼭 써요!"
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
          "preview": "각 자리의 숫자는 얼마를 나타낼까요",
          "body": "다음 시간에는 같은 숫자라도 **자리에 따라 값이 다른 것**을 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u1_l05"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 5,
      "title": "각 자리의 숫자는 얼마를 나타낼까요",
      "std": "[2수01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 자릿값 → 같은 숫자 다른 값 → 자릿값 카드로 가르기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "각 자리의 숫자는\n얼마를 나타낼까요",
          "subtitle": "1단원 · 5/9차시"
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
          "content": "지난 시간에 **세 자리 수**를 읽고 썼어요.\n오늘은 각 숫자가 **어떤 값**을 나타내는지 알아봐요."
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
          "scene_title": "두 3은 같은 값일까? 🤔",
          "visual": "🤔",
          "question": "곰이가 **323**을 보고 물어요. \"앞의 3과 뒤의 3은 같은 값일까?\"<br>여러분 생각은 어떤가요?"
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
          "title": "같은 3, 다른 값",
          "content": "**323**에서 앞의 3은 **300**, 뒤의 3은 **3**을 나타내요. 같은 숫자라도 **자리에 따라 값이 달라요**."
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
          "title": "323 = 300 + 20 + 3",
          "content": "세 자리 수는 **백의 자리·십의 자리·일의 자리** 값으로 가를 수 있어요. 323 = 300+20+3.",
          "items": [
            {
              "emoji": "🟥",
              "count": 3,
              "label": "백의 자리 300"
            },
            {
              "emoji": "🟦",
              "count": 2,
              "label": "십의 자리 20"
            },
            {
              "emoji": "🟨",
              "count": 3,
              "label": "일의 자리 3"
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
          "wrong": "\"382의 8은 그냥 8이에요\" — 자리를 무시함",
          "right": "382의 8은 **십의 자리**라서 **80**을 나타내요. 자릿값으로 보면 80이에요.",
          "hint": "382 = 300+80+2로 갈라 보면 8의 값이 80인 걸 알 수 있어요."
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
          "question": "382에서 8이 나타내는 값은 얼마일까요?",
          "input": "count_input",
          "answer": 80,
          "note": "풀이: 8은 십의 자리 → 80."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "600+40+0이 나타내는 수는 얼마일까요?",
          "input": "count_input",
          "answer": 640,
          "note": "풀이: 600+40+0=640."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "705에서 십의 자리 숫자가 나타내는 값은 얼마일까요?",
          "input": "count_input",
          "answer": 0,
          "note": "풀이: 705는 백 7·십 0·일 5. 십의 자리 값은 0."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "책 번호 이야기",
          "scenario": {
            "icon": "🔢",
            "body": "도서 번호가 **640**번이에요."
          },
          "question": "이 번호에서 십의 자리 4가 나타내는 값은 얼마일까요?",
          "answer": 40
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
            "같은 숫자라도 **자리에 따라 값이 달라요**.",
            "세 자리 수는 백·십·일 값으로 가를 수 있어요.",
            "323 = 300+20+3!"
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
          "preview": "뛰어 세어 볼까요",
          "body": "다음 시간에는 100씩·10씩·1씩 **뛰어 세기**를 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u1_l06"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 6,
      "title": "뛰어 세어 볼까요",
      "std": "[2수01-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 100씩·10씩·1씩 뛰어 세기 → 수 배열표 규칙 → 999 다음 1000"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "뛰어\n세어 볼까요",
          "subtitle": "1단원 · 6/9차시"
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
          "content": "지난 시간에 **자릿값**을 배웠어요.\n오늘은 수를 일정하게 **뛰어 세는 방법**을 알아봐요."
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
          "scene_title": "다음에 올 수는? ➡️",
          "visual": "➡️",
          "question": "펭이가 수를 외쳐요. \"100, 200, 300 … 다음은?\"<br>규칙을 찾으면 다음 수를 알 수 있어요."
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
          "title": "100씩·10씩·1씩 뛰어 세기",
          "content": "**100씩** 뛰면 백의 자리가 1씩, **10씩** 뛰면 십의 자리가 1씩, **1씩** 뛰면 일의 자리가 1씩 커져요.",
          "items": [
            {
              "emoji": "⬆️",
              "count": 1,
              "label": "100씩: 200·300·400"
            },
            {
              "emoji": "🔼",
              "count": 1,
              "label": "10씩: 612·622·632"
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
          "title": "999 다음은 1000",
          "content": "999에서 1 더 뛰면 **1000(천)**이에요. 자리가 하나 더 늘어나 네 자리 수가 시작돼요."
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
          "wrong": "\"999 다음은 9910이에요\" — 9에 1을 붙임",
          "right": "999 다음은 **1000**이에요. 일·십·백이 모두 0이 되고 천의 자리에 1이 생겨요.",
          "hint": "수 배열표에서 999 칸 다음을 따라가 보면 1000이 나와요."
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
          "question": "100씩 뛰어 세면 200-300 다음은 얼마일까요?",
          "input": "count_input",
          "answer": 400,
          "note": "풀이: 100씩 → 400."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "999보다 1 큰 수는 얼마일까요?",
          "input": "count_input",
          "answer": 1000,
          "note": "풀이: 999 다음은 1000(천)."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "622에서 10씩 뛰면 다음 수는 얼마일까요?",
          "input": "count_input",
          "answer": 632,
          "note": "풀이: 622+10=632."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "저금 이야기",
          "scenario": {
            "icon": "🐷",
            "body": "곰이가 저금통에 100원씩 모아요. 지금까지 300원이에요."
          },
          "question": "한 번 더 100원을 넣으면 얼마가 될까요?",
          "answer": 400
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
            "100씩·10씩·1씩 일정하게 **뛰어 셀** 수 있어요.",
            "뛰는 자리의 숫자가 1씩 커져요.",
            "999 다음은 **1000(천)**이에요!"
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
          "preview": "수의 크기를 비교해 볼까요",
          "body": "다음 시간에는 두 세 자리 수의 **크기를 비교**해요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u1_l07"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 7,
      "title": "수의 크기를 비교해 볼까요",
      "std": "[2수01-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 백→십→일 자리 차례 비교 → >·< 기호 → 가장 큰/작은 수"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수의 크기를\n비교해 볼까요",
          "subtitle": "1단원 · 7/9차시"
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
          "content": "지난 시간에 **뛰어 세기**를 배웠어요.\n오늘은 두 세 자리 수 중 **어느 것이 더 큰지** 비교해요."
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
          "scene_title": "누가 더 큰 수일까? ⚖️",
          "visual": "⚖️",
          "question": "곰이는 **169**, 펭이는 **196**을 들고 있어요.<br>누구의 수가 더 클까요?"
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
          "title": "높은 자리부터 차례로 비교",
          "content": "**백의 자리부터** 비교해요. 백이 같으면 **십의 자리**, 십도 같으면 **일의 자리**를 비교해요."
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
          "title": "> 와 < 기호",
          "content": "큰 쪽으로 벌어진 입을 향하게 써요. **196 > 169**, **169 < 196**. 입이 큰 수를 향해요."
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
          "wrong": "\"169가 196보다 커요. 9가 6보다 크니까요\" — 일의 자리부터 봄",
          "right": "**높은 자리(십의 자리)**를 먼저 봐요. 169는 6, 196은 9 → **196이 더 커요**.",
          "hint": "백이 같으면 십의 자리를 먼저 비교하는 것을 기억하세요."
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
          "question": "169와 168 중 더 큰 수는 무엇일까요?",
          "input": "count_input",
          "answer": 169,
          "note": "풀이: 백·십 같음 → 일의 자리 9>8 → 169."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "754와 745 중 더 큰 수는 무엇일까요?",
          "input": "count_input",
          "answer": 754,
          "note": "풀이: 백 같음 → 십의 자리 5>4 → 754."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "561과 516 중 더 큰 수는 무엇일까요?",
          "input": "count_input",
          "answer": 561,
          "note": "풀이: 백 같음 → 십의 자리 6>1 → 561."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "독서왕 이야기",
          "scenario": {
            "icon": "🏆",
            "body": "곰이는 책을 716권, 펭이는 718권 읽었어요."
          },
          "question": "더 많이 읽은 친구의 권수는 몇 권일까요?",
          "answer": 718
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
            "**높은 자리부터** 차례로 비교해요.",
            "큰 쪽을 향해 **>·<** 기호를 써요.",
            "백→십→일 순서로 비교하면 정확해요!"
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
          "body": "다음 시간에는 단원에서 배운 것을 모두 **확인**해요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u1_l08"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 8,
      "title": "수학이랑 확인해요",
      "std": "[2수01-02], [2수01-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 단원 평가(몇백·자릿값·뛰어 세기·크기 비교) · 자기 평가"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n확인해요",
          "subtitle": "1단원 · 8/9차시 · 단원 평가"
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
          "content": "이 단원에서 **세 자리 수**를 읽고 쓰고, **자릿값·뛰어 세기·크기 비교**를 배웠어요.\n오늘은 모두 확인해 봐요."
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
          "scene_title": "준비됐나요? ✅",
          "visual": "✅",
          "question": "곰이와 펭이가 단원을 마무리해요.<br>배운 것을 하나씩 점검해 볼까요?"
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
          "title": "단원에서 배운 네 가지",
          "content": "① **몇백**(100이 몇 개) ② **자릿값**(같은 숫자 다른 값) ③ **뛰어 세기** ④ **크기 비교**. 차례로 확인해요."
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
          "title": "확인 ① 몇백",
          "question": "100이 5개이면 얼마일까요?",
          "input": "count_input",
          "answer": 500,
          "note": "풀이: 100이 5개이면 500."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s06",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ② 자릿값",
          "question": "백 4개·십 5개·일 3개이면 얼마일까요?",
          "input": "count_input",
          "answer": 453,
          "note": "풀이: 400+50+3=453."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s07",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ③ 뛰어 세기",
          "question": "245에서 10씩 뛰면 다음 수는 얼마일까요?",
          "input": "count_input",
          "answer": 255,
          "note": "풀이: 245+10=255."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ④ 크기 비교",
          "question": "763과 736 중 더 큰 수는 무엇일까요?",
          "input": "count_input",
          "answer": 763,
          "note": "풀이: 백 같음 → 십의 자리 6>3 → 763."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "도서 정리 이야기",
          "scenario": {
            "icon": "📚",
            "body": "곰이가 책을 367권 정리했어요."
          },
          "question": "이 수에서 백의 자리 숫자가 나타내는 값은 얼마일까요? (367)",
          "answer": 300
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
            "세 자리 수를 읽고 쓸 수 있어요",
            "각 자리의 숫자가 나타내는 값을 알 수 있어요",
            "100씩·10씩·1씩 뛰어 셀 수 있어요",
            "두 세 자리 수의 크기를 비교할 수 있어요"
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

  window.LESSONS["u1_l09"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 1,
      "n": 9,
      "title": "수학이랑 만들어요",
      "std": "[2수01-02], [2수01-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 생활 속 세 자리 수 찾기 → 수로 이야기 만들기 → 발표·비교"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n만들어요",
          "subtitle": "1단원 · 9/9차시 · 단원 마무리"
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
          "content": "이 단원에서 배운 **세 자리 수**를 떠올려요.\n오늘은 생활 속에서 큰 수를 찾아 이야기를 만들어요."
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
          "scene_title": "우리 주변엔 수가 가득해요 🌳",
          "visual": "🌳",
          "question": "곰이와 펭이가 둘러보니 책 권수, 나무 수, 걸음 수까지<br>세 자리 수가 곳곳에 있어요. 어떤 수를 찾았을까요?"
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
          "title": "수는 여러 가지를 나타내요",
          "content": "**245**는 백 2·십 4·일 5이면서, 200+40+5이고, 이백사십오로 읽어요. 한 수를 여러 방법으로 말할 수 있어요."
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
          "title": "자릿값으로 수를 만들어요",
          "content": "내가 정한 백·십·일 숫자로 세 자리 수를 만들 수 있어요. 500+10+2이면 **512**예요.",
          "items": [
            {
              "emoji": "🟥",
              "count": 5,
              "label": "백 5개"
            },
            {
              "emoji": "🟦",
              "count": 1,
              "label": "십 1개"
            },
            {
              "emoji": "🟨",
              "count": 2,
              "label": "일 2개 → 512"
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
          "wrong": "\"245를 이십사오라고 읽어요\" — 자리를 무시하고 숫자만 읽음",
          "right": "245는 **이백사십오**라고 읽어요. 백·십·일 자리를 살려서 읽어야 해요.",
          "hint": "백의 자리부터 '이백–사십–오'로 끊어 읽어 보세요."
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
          "question": "백 2개·십 4개·일 5개이면 얼마일까요?",
          "input": "count_input",
          "answer": 245,
          "note": "풀이: 200+40+5=245."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ② ",
          "question": "500+10+2가 나타내는 수는 얼마일까요?",
          "input": "count_input",
          "answer": 512,
          "note": "풀이: 500+10+2=512."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "기본 ③ ",
          "question": "245에서 백의 자리 숫자는 무엇일까요?",
          "input": "count_input",
          "answer": 2,
          "note": "풀이: 245의 백의 자리 숫자는 2."
        },
        "suggested_extras": [
          "q_basic"
        ]
      },
      {
        "id": "s10",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "걸음 수 이야기",
          "scenario": {
            "icon": "👣",
            "body": "펭이가 오늘 산책하며 백 1개·십 8개·일 0개만큼 걸었어요."
          },
          "question": "펭이는 모두 몇 걸음 걸었을까요?",
          "answer": 180
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
            "생활 곳곳에 **세 자리 수**가 있어요.",
            "한 수를 자릿값·읽기·식 등 여러 방법으로 말할 수 있어요.",
            "1단원을 모두 마쳤어요. 정말 잘했어요! 🎉"
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
          "preview": "2단원 여러 가지 도형",
          "body": "다음 단원에서는 삼각형·사각형·원 같은 **여러 가지 도형**을 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

})();
