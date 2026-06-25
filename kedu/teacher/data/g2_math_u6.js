/* ============================================================================
   2학년 1학기 수학 — 6단원 「곱셈」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u6_l{NN}"] (zero-pad). 교사주도 흐름(~12슬).
   - 학생 본 차시(grade2 .../재수정_v1/g2_math_u6_*.html)의 검증된 식·정답 계승.
   - 성취기준 [2수01-10]. 9차시(본 차시 01~09 대응).
   - 부품 흐름: cover/review/motivate/concept/misconception/basic_problem/real_world/summary/next_lesson + self_assessment(08 평가차).
   - 곱셈구구 전 단계 — 곱은 동수누가/뛰어 세기로, 등호 답 강요 X.
   - g2_math.html이 window.LESSONS 객체에 누적. (window.LESSONS+IIFE 양 레포 공통)
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  window.LESSONS["u6_l01"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 1,
      "title": "곱셈을 만나 볼까요 (단원 도입)",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 곰이·펭이 텃밭 동기 → 묶어/뛰어 세기 직관 → 1학년 복습 → 단원 예고"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "곱셈을\n만나 볼까요",
          "subtitle": "6단원 · 1/9차시 · 단원 도입"
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
          "content": "우리는 **10개씩 묶어** 세고, 10·20·30처럼 **뛰어** 셀 수 있어요.\n이번 단원에서는 여러 가지 방법으로 묶어 세고, 마침내 **곱셈**까지 배워요."
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
          "scene_title": "학교 텃밭이 가득해요 🌱",
          "visual": "🐞",
          "question": "곰이와 펭이가 학교 텃밭을 둘러봐요. 토마토·상추·무당벌레가 정말 많아요!<br>이 많은 것을 어떻게 빠르게 셀 수 있을까요?"
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
          "title": "묶어 세면 빨라요",
          "content": "같은 수로 **묶어 세면** 많아도 빠르고 안 헷갈려요.",
          "items": [
            {
              "emoji": "⚽",
              "count": 5,
              "label": "5씩"
            },
            {
              "emoji": "⚽",
              "count": 20,
              "label": "4묶음이면 20개"
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
          "title": "뛰어 세기",
          "content": "묶은 수만큼 **뛰어 세면** 전체 수를 빠르게 알 수 있어요. 5, 10, 15, 20!"
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
          "wrong": "\"하나씩 세는 게 가장 정확하고 빨라요\" — 늘 하나씩 세려고 함",
          "right": "물건이 **많을 때**는 같은 수로 묶어 세는 것이 빠르고 안 헷갈려요.",
          "hint": "하나씩 세기는 수가 적을 때만 편해요."
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
          "title": "기본 ① 묶어 세기",
          "question": "공을 5씩 4묶음으로 묶으면 모두 몇 개?",
          "input": "count_input",
          "answer": 20,
          "note": "풀이: 5, 10, 15, 20 → 20개.",
          "items": [
            {
              "emoji": "⚽",
              "count": 5,
              "label": "5씩"
            },
            {
              "emoji": "📦",
              "count": 4,
              "label": "4묶음"
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
          "title": "기본 ② 다른 묶음",
          "question": "색연필을 3씩 6묶음으로 묶으면 모두 몇 자루?",
          "input": "count_input",
          "answer": 18,
          "note": "풀이: 3, 6, 9, 12, 15, 18 → 18자루."
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
          "title": "기본 ③ 뛰어 세기",
          "question": "5씩 뛰어 세면 5, 10, 15, ___ 까지 모두 몇 개?",
          "input": "count_input",
          "answer": 20,
          "note": "풀이: 5씩 4번 뛰면 20."
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
          "title": "텃밭 이야기",
          "scenario": {
            "icon": "🍅",
            "body": "텃밭에 토마토가 5개씩 3줄로 열렸어요."
          },
          "question": "묶어 세기로 말해 볼까요? \"토마토가 모두 ___개\"",
          "answer": 15
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
            "같은 수로 **묶어** 세면 많아도 빠르고 안 헷갈려요.",
            "묶은 수만큼 **뛰어** 세면 전체 수를 알 수 있어요.",
            "곰이·펭이와 학교 곳곳을 세며 단원을 시작해요. 🌱"
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
          "preview": "여러 가지 방법으로 세어 볼까요",
          "body": "다음 시간에는 하나씩·뛰어·묶어 세기를 **비교**하며 묶어 세기의 좋은 점을 알아봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l02"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 2,
      "title": "여러 가지 방법으로 세어 볼까요",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 하나씩/뛰어/묶어 세기 비교 → 묶어 세기 유용성"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 방법으로\n세어 볼까요",
          "subtitle": "6단원 · 2/9차시"
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
          "content": "지난 시간엔 묶어 세기와 뛰어 세기를 만났어요. 오늘은 **세 가지 방법**을 비교해 봐요."
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
          "scene_title": "딱지가 한가득! 🎴",
          "visual": "🎴",
          "question": "곰이가 딱지를 모았어요. 너무 많아 세기 어려워요.<br>어떻게 세면 가장 편할까요?"
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
          "title": "하나씩 세기",
          "content": "딱지를 하나, 둘, 셋… **하나씩** 세면 정확하지만 **오래 걸려요**.",
          "items": [
            {
              "emoji": "🔵",
              "count": 12,
              "label": "하나씩 12개"
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
          "title": "뛰어 세기와 묶어 세기",
          "content": "**3씩 뛰어** 세면 3, 6, 9, 12! **3씩 4묶음**으로 묶으면 한눈에 보여요."
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
          "wrong": "\"묶음의 크기는 아무렇게나 달라도 돼요\"",
          "right": "뛰어 세려면 **같은 수로** 묶어야 해요. 3씩 묶었으면 모두 3씩!",
          "hint": "들쭉날쭉 묶으면 뛰어 세기가 어려워요."
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
          "title": "기본 ① 묶어 세기",
          "question": "딱지를 3씩 4묶음으로 묶으면 모두 몇 장?",
          "input": "count_input",
          "answer": 12,
          "note": "풀이: 3, 6, 9, 12 → 12장."
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
          "title": "기본 ② 묶음의 수",
          "question": "구슬 15개를 5씩 묶으면 몇 묶음?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 5씩 묶으면 3묶음(5·10·15)."
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
          "title": "기본 ③ 뛰어 세기",
          "question": "4씩 뛰어 세면 4, 8, 12, 16, ___ 까지 모두 몇 개?",
          "input": "count_input",
          "answer": 20,
          "note": "풀이: 4씩 5번 → 20."
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
          "title": "단추 이야기",
          "scenario": {
            "icon": "🔘",
            "body": "단추를 6개씩 3묶음으로 정리했어요."
          },
          "question": "묶어 세어 볼까요? \"단추가 모두 ___개\"",
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
            "수는 **하나씩·뛰어·묶어** 세기로 셀 수 있어요.",
            "**같은 수로 묶어** 세면 많아도 빠르고 안 헷갈려요."
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
          "preview": "묶어 세어 볼까요",
          "body": "다음 시간에는 **몇씩 몇 묶음**으로 더 자세히 묶고, 같은 양을 여러 방법으로 묶어 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l03"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 3,
      "title": "묶어 세어 볼까요",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 몇씩 몇 묶음·같은 양 여러 묶음·뛰어 세기로 전체"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "묶어 세어\n볼까요",
          "subtitle": "6단원 · 3/9차시"
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
          "content": "묶어 세면 빠르다는 걸 배웠어요. 오늘은 **몇씩 몇 묶음**으로 더 자세히 묶어 봐요."
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
          "scene_title": "체육관의 공 🏐",
          "visual": "🏐",
          "question": "체육관에 공이 20개 있어요. 곰이는 5씩, 펭이는 4씩 묶었어요.<br>누구 말이 맞을까요?"
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
          "title": "몇씩 몇 묶음",
          "content": "공을 **5씩 4묶음**으로 묶으면 5, 10, 15, 20 = 20개!",
          "items": [
            {
              "emoji": "⚽",
              "count": 5,
              "label": "5씩"
            },
            {
              "emoji": "📦",
              "count": 4,
              "label": "4묶음"
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
          "title": "같은 양, 다른 묶음",
          "content": "같은 20개를 **4씩 5묶음**으로도 묶어요. 묶는 방법이 달라도 **모두 20개**!"
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
          "wrong": "\"묶는 수가 크면 묶음 수도 많아져요\"",
          "right": "묶는 수가 **클수록** 묶음 수는 오히려 **적어져요**(5씩 4묶음 vs 4씩 5묶음).",
          "hint": "같은 양에서 묶음 크기와 묶음 수는 반대로 움직여요."
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
          "title": "기본 ① 전체 수",
          "question": "5씩 4묶음이면 공은 모두 몇 개?",
          "input": "count_input",
          "answer": 20,
          "note": "풀이: 5, 10, 15, 20 → 20."
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
          "title": "기본 ② 묶음의 수",
          "question": "콩 주머니 18개를 6씩 묶으면 몇 묶음?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 6씩 묶으면 3묶음(6·12·18)."
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
          "title": "기본 ③ 다른 묶음",
          "question": "딸기를 6씩 4묶음으로 묶으면 모두 몇 개?",
          "input": "count_input",
          "answer": 24,
          "note": "풀이: 6, 12, 18, 24 → 24."
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
          "title": "달걀 이야기",
          "scenario": {
            "icon": "🥚",
            "body": "달걀을 5개씩 3줄로 놓았어요."
          },
          "question": "모두 몇 개일까요? \"달걀이 모두 ___개\"",
          "answer": 15
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
            "물건을 **몇씩 몇 묶음**으로 묶어 세요.",
            "같은 물건도 **여러 방법**으로 묶을 수 있어요.",
            "뛰어 세면 전체 수를 빠르게 알 수 있어요."
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
          "preview": "몇의 몇 배를 알아볼까요",
          "body": "다음 시간에는 똑같은 묶음을 **몇의 몇 배**로 나타내는 방법을 배워요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l04"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 4,
      "title": "몇의 몇 배를 알아볼까요",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 배의 개념·몇씩 몇 묶음↔몇의 몇 배·단위 바꾸면 배 변화"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "몇의 몇 배를\n알아볼까요",
          "subtitle": "6단원 · 4/9차시"
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
          "content": "몇씩 몇 묶음으로 묶어 셌어요. 오늘은 그것을 **몇의 몇 배**라고 부르는 법을 배워요."
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
          "scene_title": "쌓기나무 탑 🧱",
          "visual": "🧱",
          "question": "곰이가 2개짜리 탑을, 펭이가 그 **4배** 높이 탑을 쌓았어요.<br>펭이의 탑은 몇 개일까요?"
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
          "title": "몇의 몇 배",
          "content": "2씩 4묶음은 **2의 4배**예요. 한 묶음(2)을 기준으로 4번 반복!",
          "items": [
            {
              "emoji": "🟦",
              "count": 2,
              "label": "2씩(기준)"
            },
            {
              "emoji": "🟦",
              "count": 8,
              "label": "4배 = 8"
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
          "title": "단위를 바꾸면",
          "content": "같은 8개도 **4의 2배**, **8의 1배**로 볼 수 있어요. 기준(단위)을 바꾸면 배가 달라져요."
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
          "wrong": "\"배는 무조건 수가 커지는 거예요\"",
          "right": "**1배**는 그대로예요(8의 1배=8). 배는 **기준이 몇 번** 들어가는지를 말해요.",
          "hint": "2의 4배와 4의 2배는 기준이 다를 뿐 모두 8이에요."
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
          "title": "기본 ① 배 구하기",
          "question": "2씩 4묶음은 2의 몇 배인가요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 2가 4번 → 2의 4배."
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
          "title": "기본 ② 배 구하기",
          "question": "4씩 3묶음은 4의 몇 배인가요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 4가 3번 → 4의 3배."
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
          "question": "6의 4배는 모두 몇 개인가요?",
          "input": "count_input",
          "answer": 24,
          "note": "풀이: 6씩 4번 → 6, 12, 18, 24 = 24."
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
          "title": "빵 이야기",
          "scenario": {
            "icon": "🍞",
            "body": "빵집에 빵이 7개씩 들어간 봉지가 2봉지 있어요(7의 2배)."
          },
          "question": "모두 몇 개일까요? \"빵이 모두 ___개\"",
          "answer": 14
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
            "몇씩 몇 묶음은 **몇의 몇 배**와 같은 말이에요.",
            "기준(단위)을 바꾸면 배가 달라져요(8=2의4배=4의2배).",
            "1배는 그대로예요."
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
          "preview": "몇의 몇 배로 나타내 볼까요",
          "body": "다음 시간에는 길이나 양을 **몇의 몇 배**로 비교해 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l05"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 5,
      "title": "몇의 몇 배로 나타내 볼까요",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 길이·양을 몇의 몇 배로 비교(곱셈적 비교)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "몇의 몇 배로\n나타내 볼까요",
          "subtitle": "6단원 · 5/9차시"
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
          "content": "몇의 몇 배를 배웠어요. 오늘은 **길이와 양**을 몇의 몇 배로 비교해 봐요."
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
          "scene_title": "색 막대 비교 📏",
          "visual": "📏",
          "question": "곰이의 막대는 2칸, 펭이의 막대는 6칸이에요.<br>펭이의 막대는 곰이의 몇 배일까요?"
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
          "title": "길이의 배",
          "content": "2칸 막대의 **3배**는 6칸이에요. 짧은 막대가 **몇 번** 들어가는지 보면 돼요.",
          "items": [
            {
              "emoji": "🟥",
              "count": 2,
              "label": "2칸(기준)"
            },
            {
              "emoji": "🟥",
              "count": 6,
              "label": "3배 = 6칸"
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
          "title": "양의 배",
          "content": "구슬 4개의 **2배**는 8개! 적은 양을 기준으로 몇 번인지 세면 배를 알 수 있어요."
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
          "wrong": "\"긴 것이 항상 몇 배 더 길다고만 말하면 돼요\"",
          "right": "몇 배인지는 **기준이 몇 번** 들어가는지로 정확히 말해요(6칸은 2칸의 3배).",
          "hint": "\"더 길다\"가 아니라 \"3배 길다\"처럼 말해요."
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
          "title": "기본 ① 길이의 배",
          "question": "2칸 막대의 3배는 몇 칸인가요?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 2칸씩 3번 → 6칸."
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
          "title": "기본 ② 양의 배",
          "question": "구슬 5개의 2배는 몇 개인가요?",
          "input": "count_input",
          "answer": 10,
          "note": "풀이: 5씩 2번 → 10."
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
          "title": "기본 ③ 배 비교",
          "question": "8칸은 2칸의 몇 배인가요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 2칸이 4번 들어감 → 4배."
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
          "title": "리본 이야기",
          "scenario": {
            "icon": "🎀",
            "body": "짧은 리본은 3칸, 긴 리본은 그 4배예요."
          },
          "question": "긴 리본은 몇 칸일까요? \"긴 리본은 ___칸\"",
          "answer": 12
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
            "길이와 양도 **몇의 몇 배**로 비교할 수 있어요.",
            "기준이 **몇 번** 들어가는지 세면 배를 알 수 있어요."
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
          "preview": "곱셈을 알아볼까요",
          "body": "다음 시간에는 드디어 **곱셈 기호 ×**를 배워요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l06"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 6,
      "title": "곱셈을 알아볼까요",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 곱셈 기호(×) 도입·동수누가=곱셈·곱셈식 읽기"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "곱셈을\n알아볼까요",
          "subtitle": "6단원 · 6/9차시 · 단원 절정"
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
          "content": "몇의 몇 배를 배웠어요. 오늘은 그것을 **곱셈식(×)**으로 짧게 쓰는 법을 배워요."
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
          "scene_title": "컵이 줄줄이! 🥤",
          "visual": "🥤",
          "question": "급식실에 컵이 3개씩 6줄로 놓여 있어요.<br>3+3+3+3+3+3… 너무 길어요. 짧게 쓸 수 없을까요?"
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
          "title": "곱셈 기호 ×",
          "content": "3의 6배를 **3×6**이라고 써요. '**3 곱하기 6**'이라고 읽어요!",
          "items": [
            {
              "emoji": "🥤",
              "count": 3,
              "label": "3씩"
            },
            {
              "emoji": "📦",
              "count": 6,
              "label": "6묶음 = 3×6"
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
          "title": "동수누가는 곱셈",
          "content": "4를 5번 더하면 4+4+4+4+4=20. 이것을 **4×5=20**으로 짧게 써요. '4와 5의 곱은 20'!"
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
          "wrong": "\"3×6은 꼭 = 18처럼 답을 외워 써야 해요\"",
          "right": "아직 곱셈구구 전이에요. 곱은 **뛰어 세기·동수누가**로 구하면 돼요(3·6·9·12·15·18).",
          "hint": "곱셈식을 쓰는 것과 곱을 구하는 것은 차근차근 익혀요."
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
          "title": "기본 ① 곱셈",
          "question": "2×7은 얼마인가요? (2씩 7번)",
          "input": "count_input",
          "answer": 14,
          "note": "풀이: 2, 4, 6, 8, 10, 12, 14 → 14."
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
          "title": "기본 ② 동수누가→곱셈",
          "question": "5+5+5를 곱셈으로 구하면? (5×3)",
          "input": "count_input",
          "answer": 15,
          "note": "풀이: 5, 10, 15 → 15."
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
          "title": "기본 ③ 곱셈",
          "question": "6×4는 얼마인가요? (6씩 4번)",
          "input": "count_input",
          "answer": 24,
          "note": "풀이: 6, 12, 18, 24 → 24."
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
          "title": "딸기 이야기",
          "scenario": {
            "icon": "🍓",
            "body": "딸기를 한 접시에 7개씩 2접시에 담았어요(7×2)."
          },
          "question": "모두 몇 개일까요? \"딸기가 모두 ___개\"",
          "answer": 14
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
            "몇의 몇 배는 **곱셈식(×)**으로 써요(3의 6배=3×6).",
            "같은 수의 덧셈은 **곱셈**으로 짧게(4+4+4+4+4=4×5).",
            "'4 곱하기 5', '4와 5의 곱'이라고 읽어요."
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
          "preview": "곱셈식으로 나타내 볼까요",
          "body": "다음 시간에는 같은 물건을 **여러 곱셈식**으로 나타내 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l07"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 7,
      "title": "곱셈식으로 나타내 볼까요",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 같은 양 여러 곱셈식·교환법칙·실생활 곱셈"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "곱셈식으로\n나타내 볼까요",
          "subtitle": "6단원 · 7/9차시"
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
          "content": "곱셈식(×)을 배웠어요. 오늘은 한 물건을 **여러 곱셈식**으로 나타내 봐요."
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
          "scene_title": "꿈 자랑 발표회 🥁",
          "visual": "🥁",
          "question": "발표회에 소고가 24개 있어요. 곰이는 4씩, 펭이는 6씩 묶었어요.<br>둘 다 맞을까요?"
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
          "title": "여러 곱셈식",
          "content": "소고 24개를 **4×6**으로도, **6×4**로도 나타내요. 묶는 방법에 따라 곱셈식이 달라요!",
          "items": [
            {
              "emoji": "🥁",
              "count": 4,
              "label": "4씩 6묶음=4×6"
            },
            {
              "emoji": "🥁",
              "count": 6,
              "label": "6씩 4묶음=6×4"
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
          "title": "순서를 바꿔도",
          "content": "**4×6 = 6×4 = 24**! 곱하는 두 수의 순서를 바꿔도 곱은 같아요(24=3×8=8×3도 가능)."
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
          "wrong": "\"곱셈식은 한 가지로만 써야 해요\"",
          "right": "같은 물건도 **여러 곱셈식**으로 나타낼 수 있어요(24=4×6=6×4=3×8=8×3).",
          "hint": "어떻게 묶느냐에 따라 곱셈식이 달라져요."
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
          "title": "기본 ① 곱셈",
          "question": "4×6은 얼마인가요?",
          "input": "count_input",
          "answer": 24,
          "note": "풀이: 4, 8, 12, 16, 20, 24 → 24."
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
          "title": "기본 ② 실생활",
          "question": "자전거 5대의 바퀴는 모두 몇 개? (한 대에 2개, 2×5)",
          "input": "count_input",
          "answer": 10,
          "note": "풀이: 2, 4, 6, 8, 10 → 10."
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
          "title": "기본 ③ 실생활",
          "question": "사자 3마리의 다리는 모두 몇 개? (한 마리 4개, 4×3)",
          "input": "count_input",
          "answer": 12,
          "note": "풀이: 4, 8, 12 → 12."
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
          "title": "소고 이야기",
          "scenario": {
            "icon": "🥁",
            "body": "소고를 3개씩 8묶음으로 정리했어요(3×8)."
          },
          "question": "모두 몇 개일까요? \"소고가 모두 ___개\"",
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
            "같은 물건도 **묶는 방법**에 따라 여러 곱셈식으로 나타내요.",
            "순서를 바꿔도 곱은 같아요(4×6=6×4).",
            "생활 속 곱셈(다리·바퀴)도 곱셈식으로!"
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
          "body": "다음 시간에는 배운 곱셈을 **문제로 풀며 확인**해요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l08"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 8,
      "title": "수학이랑 확인해요 (단원 평가)",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 단원 총점검·오개념 진단·자기 점검"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n확인해요",
          "subtitle": "6단원 · 8/9차시 · 단원 평가"
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
          "title": "단원을 떠올리기",
          "content": "몇씩 몇 묶음 → 몇의 몇 배 → **곱셈식**까지 배웠어요. 문제로 확인해 봐요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s03",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "핵심 한눈에",
          "content": "6씩 3묶음 = 6의 3배 = **6×3 = 18**! 묶음·배·곱셈식은 모두 이어져요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s04",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ① 곱셈",
          "question": "6씩 3묶음, 6×3은 얼마인가요?",
          "input": "count_input",
          "answer": 18,
          "note": "풀이: 6, 12, 18 → 18."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s05",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ② 동수누가→곱셈",
          "question": "2+2+2+2+2+2를 곱셈으로 구하면? (2×6)",
          "input": "count_input",
          "answer": 12,
          "note": "풀이: 2가 6번 → 2, 4, 6, 8, 10, 12 = 12."
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
          "title": "확인 ③ 곱셈",
          "question": "5×7은 얼마인가요?",
          "input": "count_input",
          "answer": 35,
          "note": "풀이: 5씩 7번 → 5, 10, … 35."
        },
        "suggested_extras": [
          "q_good",
          "t_problem"
        ]
      },
      {
        "id": "s07",
        "stage": "전개",
        "block": "misconception",
        "data": {
          "title": "이런 답을 조심해요",
          "label": "자주 하는 실수",
          "wrong": "\"매일 3개씩 5일이면 5×3이라고 써도 같아요\"",
          "right": "상황을 보면 **3개씩 5일 = 3×5**예요. 곱은 같아도 **상황에 맞는 식**으로 써요.",
          "hint": "5×7과 7×5는 곱이 같지만(35), 상황 표현은 구분해요."
        },
        "suggested_extras": [
          "t_concept"
        ]
      },
      {
        "id": "s08",
        "stage": "응용문제",
        "block": "real_world",
        "data": {
          "title": "종이비행기 이야기",
          "scenario": {
            "icon": "✈️",
            "body": "곰이가 종이비행기를 매일 3개씩 5일 동안 만들었어요(3×5)."
          },
          "question": "모두 몇 개일까요? \"비행기가 모두 ___개\"",
          "answer": 15
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s09",
        "stage": "정리",
        "block": "self_assessment",
        "data": {
          "title": "스스로 점검해요",
          "items": [
            "물건의 수를 몇의 몇 배·곱셈식으로 나타낼 수 있어요",
            "곱셈식으로 물건의 수를 구할 수 있어요",
            "같은 물건을 여러 곱셈식으로 나타낼 수 있어요",
            "곱셈식의 좋은 점을 말할 수 있어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s10",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "단원에서 배운 곱셈을 모두 확인했어요.",
            "틀린 부분은 다시 한 번 연습하면 돼요. 잘했어요! 👏"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s11",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "수학이랑 만들어요",
          "body": "다음 시간에는 **곱셈 카드**를 만들며 단원을 마무리해요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u6_l09"] =
{
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 6,
      "n": 9,
      "title": "수학이랑 만들어요 (곱셈 카드)",
      "std": "[2수01-10]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 곱셈 카드·한 그림 여러 표현·생명 존중(아웃트로)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n만들어요",
          "subtitle": "6단원 · 9/9차시 · 곱셈 카드"
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
          "title": "단원을 떠올리기",
          "content": "곱셈을 모두 배웠어요. 오늘은 **곱셈 카드**를 만들며 단원을 마무리해요."
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
          "scene_title": "여름 텃밭 곤충 🐞",
          "visual": "🐞",
          "question": "여름 텃밭에 무당벌레·나비가 가득해요. 곰이와 펭이가 곤충으로 **곱셈 카드**를 만들어요.<br>작은 생명도 소중히 여기며 세어 봐요!"
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
          "title": "곱셈 카드 만들기",
          "content": "개미가 3마리씩 2줄! **3×2=6** 카드예요. '3 곱하기 2', '3과 2의 곱은 6'!",
          "items": [
            {
              "emoji": "🐜",
              "count": 3,
              "label": "3씩"
            },
            {
              "emoji": "📷",
              "count": 2,
              "label": "2줄 = 3×2"
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
          "title": "한 그림, 여러 표현",
          "content": "3×2는 **3+3**, **3씩 2묶음**, **3의 2배**로도 말할 수 있어요. 같은 그림, 여러 표현!"
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
          "wrong": "\"곱셈 카드는 한 가지 방법으로만 말해야 해요\"",
          "right": "한 그림을 **여러 곱셈 표현**으로 말할 수 있어요(3×2=3+3=3씩2묶음=3의2배).",
          "hint": "친구와 다른 표현을 찾아보면 더 재미있어요."
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
          "title": "기본 ① 곱셈 카드",
          "question": "개미 카드 3×2는 모두 몇 마리?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 3, 6 → 6."
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
          "title": "기본 ② 곱셈 카드",
          "question": "토마토 카드 5×2는 모두 몇 개?",
          "input": "count_input",
          "answer": 10,
          "note": "풀이: 5, 10 → 10."
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
          "title": "기본 ③ 곱셈 카드",
          "question": "나비 카드 4×3은 모두 몇 마리?",
          "input": "count_input",
          "answer": 12,
          "note": "풀이: 4, 8, 12 → 12."
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
          "title": "잠자리 이야기",
          "scenario": {
            "icon": "🦗",
            "body": "잠자리를 6마리씩 2줄로 그렸어요(6×2)."
          },
          "question": "모두 몇 마리일까요? \"잠자리가 모두 ___마리\"",
          "answer": 12
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
            "묶어 세기 → 몇의 몇 배 → **곱셈식**까지 모두 배웠어요!",
            "한 그림도 **여러 곱셈 표현**으로 나타낼 수 있어요.",
            "작은 생명을 소중히 여기는 마음도 잊지 말아요. 🐞"
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
          "title": "다음에는",
          "preview": "2학기 — 곱셈구구",
          "body": "2학기에는 **곱셈구구(2~9단)**를 배워요. 곱셈 단원을 모두 마쳤어요. 정말 잘했어요! 🎉"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

})();
