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
      "lesson_format": "교사주도 — 곰이·펭이 기후 동기 → 모으기=덧셈·덜어내기=뺄셈 → 1학년 수준 복습 → 단원 예고 · 40분 표준 증보(7요소)"
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
          "question": "북극의 곰이와 남극의 펭이가 얼음이 녹고 바다에 쓰레기가 늘어 힘들어해요.<br>우리가 수학으로 도울 수 있을까요?",
          "img": "assets/photo/math/fish_basket.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "모으는 건 덧셈일까 뺄셈일까?",
            "덜어내면 어느 쪽일까?"
          ],
          "watch": "상황을 식으로 옮기게 — 모으기＝＋, 덜기＝－",
          "min": 3
        }
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "모으기·덜어내기 몸으로",
          "type": "pair",
          "goal": "모으면 덧셈, 덜면 뺄셈임을 손으로",
          "steps": [
            "짝과 바둑돌을 나눠 갖기",
            "두 손을 모아 합치기(＝덧셈)",
            "한 줌 덜어내기(＝뺄셈)"
          ],
          "materials": [
            "바둑돌"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
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
        ],
        "tnote": {
          "ask": [
            "13에 5를 더하면 왜 18일까?"
          ],
          "watch": "이어 세기(13→14…18)로 확인",
          "min": 2
        }
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "물고기 세기",
          "levels": {
            "기본": {
              "q": "물고기 12마리에 6마리를 더 잡으면 몇 마리일까요?",
              "a": "18마리",
              "steps": [
                "12+6"
              ]
            },
            "도전": {
              "q": "물고기 25마리 중 8마리를 놓아주면 몇 마리 남을까요?",
              "a": "17마리",
              "steps": [
                "25-8"
              ]
            },
            "심화": {
              "q": "물고기 20마리를 두 통에 나눠 담는 방법을 여러 가지로 말해 봐요.",
              "a": "여러 답 (예: 10+10, 12+8 …)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "13+5는?",
              "a": "18"
            },
            {
              "q": "16-4는?",
              "a": "12"
            },
            {
              "q": "24+13은?",
              "a": "37"
            }
          ],
          "self": [
            "모으기·덜기를 식으로 쓸 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — (두 자리)+(한 자리) 받아올림. 가르기·이어 세기·십 만들기 여러 전략 · 40분 표준 증보(7요소)"
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
          "content": "쉬운 덧셈(받아올림 없음)을 했어요.\n오늘은 **일의 자리가 10이 넘는** 덧셈을 여러 가지 방법으로 해 봐요.",
          "items": [
            {
              "q": "13+5는?",
              "a": "18"
            },
            {
              "q": "24+13은?",
              "a": "37"
            }
          ],
          "from": "u3_l01"
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
          "question": "곰이가 사탕 17개에 6개를 더 받았어요. 일의 자리 7+6은 10을 넘어요!<br>어떻게 계산하면 좋을까요?",
          "img": "assets/photo/math/marbles.jpg"
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
        ],
        "tnote": {
          "ask": [
            "10을 먼저 만들면 왜 더 쉬울까?"
          ],
          "watch": "가르기로 10 채우기 — 몇을 더 줘야 10이 될까",
          "min": 2
        }
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
        ],
        "tnote": {
          "ask": [
            "7+6을 1713처럼 이어 붙이면 왜 안 될까?"
          ],
          "watch": "자리값 — 일의 자리끼리만 더함",
          "min": 2
        }
      },
      {
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "10 만들어 더하기",
          "type": "pair",
          "goal": "가르기로 10을 먼저 만들기",
          "steps": [
            "구슬 18개와 5개를 놓기",
            "5를 2와 3으로 가르기",
            "18+2=20, 20+3=23 확인"
          ],
          "materials": [
            "구슬"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "구슬 더하기",
          "levels": {
            "기본": {
              "q": "17 + 6 은 얼마일까요?",
              "a": "23",
              "steps": [
                "17+3=20",
                "20+3"
              ]
            },
            "도전": {
              "q": "28 + 7 은 얼마일까요?",
              "a": "35",
              "steps": [
                "28+2=30",
                "30+5"
              ]
            },
            "심화": {
              "q": "□ + 7 = 32 가 되는 □를 찾고, 어떻게 생각했는지 말해 봐요.",
              "a": "25 (32-7)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "18+5는?",
              "a": "23"
            },
            {
              "q": "25+7은?",
              "a": "32"
            },
            {
              "q": "38+5는?",
              "a": "43"
            }
          ],
          "self": [
            "받아올림 있는 덧셈을 할 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — (두 자리)+(두 자리) 받아올림. 자리별 더하기·십 단위 묶기",
      "theme": {
        "name": "곰이와 펭이의 도토리",
        "cast": [
          "곰이",
          "펭이"
        ],
        "place": "숲",
        "open": "곰이와 펭이가 겨울을 나려고 도토리를 모아요. 두 친구가 모은 도토리를 합치려면 두 자리 수끼리 더해야 해요.",
        "close": "두 자리 수끼리도 자리별로 더하고 받아올림하면, 곰이와 펭이의 도토리를 모두 셀 수 있어요."
      }
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
        "id": "s02b",
        "stage": "열기",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것 🔁",
          "from": "u3_l02",
          "items": [
            {
              "q": "18 + 5 = ?",
              "a": "23"
            },
            {
              "q": "25 + 7 = ?",
              "a": "32"
            },
            {
              "q": "일의 자리가 10을 넘으면 어떻게 하나요?",
              "a": "십의 자리로 1을 받아올림해요"
            }
          ]
        },
        "tnote": {
          "ask": [
            "18 더하기 5를 머릿속으로 어떻게 계산했나요?",
            "받아올림이 뭐였는지 짝에게 한 문장으로 말해 볼까요?"
          ],
          "watch": "받아올림한 1을 빠뜨리는 학생 있는지 미리 살피기",
          "min": 3
        },
        "suggested_extras": [
          "q_open",
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
          "img": "assets/photo/math/g2_math_u3_l03_acorns.jpg",
          "question": "곰이가 도토리 28개, 펭이가 19개를 모았어요. 모두 몇 개일까요?<br>두 자리 수끼리 더해 봐요!"
        },
        "tnote": {
          "ask": [
            "곰이와 펭이의 도토리를 어떻게 하면 한 번에 셀 수 있을까요?",
            "28과 19를 그냥 세면 어떤 점이 힘들까요?"
          ],
          "watch": "낱개로 하나씩 세려는 학생 → 자리별로 묶는 쪽으로 유도",
          "min": 2
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
          "img": "assets/photo/math/g2_math_u3_l03_placevalue.jpg",
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
        "tnote": {
          "ask": [
            "왜 십은 십끼리, 일은 일끼리 더할까요?",
            "8+9는 왜 그냥 두지 않고 30에 더할까요?"
          ],
          "watch": "8+9=17에서 17을 그대로 답에 붙여 '3017'처럼 쓰는 오류 주의",
          "min": 4
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
        "tnote": {
          "ask": [
            "받아올림한 1을 어디에 적어 두면 잊지 않을까요?",
            "이 실수를 한 친구에게 뭐라고 말해 주면 좋을까요?"
          ],
          "watch": "십의 자리 계산에서 +1을 습관적으로 빠뜨리는 학생 지목해 확인",
          "min": 3
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
        "id": "s09d",
        "stage": "응용문제",
        "block": "leveled_problem",
        "data": {
          "title": "곰이와 펭이의 도토리 합치기 🌰",
          "levels": {
            "기본": {
              "q": "곰이가 34개, 펭이가 28개를 모았어요. 모두 몇 개일까요?",
              "a": "62개",
              "steps": [
                "일: 4+8=12 (2쓰고 1올림)",
                "십: 3+2+1=6",
                "→ 62"
              ]
            },
            "도전": {
              "q": "곰이가 47개, 펭이가 39개를 모았어요. 모두 몇 개일까요?",
              "a": "86개",
              "steps": [
                "일: 7+9=16",
                "십: 4+3+1=8",
                "→ 86"
              ]
            },
            "심화": {
              "q": "곰이와 펭이의 도토리를 합쳐서 딱 60개가 되게 하려면, 각자 몇 개씩 모았을 수 있을까요?",
              "a": "여러 답 (예: 28+32, 41+19, 15+45 …)",
              "open": true
            }
          },
          "note": "기본=오늘 배운 자리별 받아올림 / 도전=수치 확장 / 심화=거꾸로 생각하기(정답 여러 개)."
        },
        "tnote": {
          "ask": [
            "기본을 푼 친구는 도전에서 무엇이 달라졌나요?",
            "심화에서 답을 하나 찾았다면, 또 다른 답도 있을까요?"
          ],
          "watch": "심화는 정답 1개를 강요하지 말 것 — 서로 다른 답을 칠판에 여러 개 모으기",
          "min": 6
        },
        "suggested_extras": [
          "q_apply",
          "t_problem"
        ]
      },
      {
        "id": "s09e",
        "stage": "응용문제",
        "block": "leveled_problem",
        "data": {
          "title": "문구점 계산대 🛒",
          "levels": {
            "기본": {
              "q": "지우개 45원과 연필 17원을 샀어요. 모두 얼마일까요?",
              "a": "62원",
              "steps": [
                "45+17",
                "→ 62원"
              ]
            },
            "도전": {
              "q": "공책 38원과 색연필 26원을 샀어요. 모두 얼마일까요?",
              "a": "64원",
              "steps": [
                "38+26",
                "→ 64원"
              ]
            },
            "심화": {
              "q": "70원짜리와 다른 물건을 사서 값을 만들려고 해요. 받아올림이 생기는 두 물건 값을 정해 볼까요?",
              "a": "여러 답 (예: 48+26, 35+27 …)",
              "open": true
            }
          }
        },
        "tnote": {
          "ask": [
            "돈으로 바꿔 생각하니 계산이 더 쉬운가요, 어려운가요?",
            "'받아올림이 생기게'라는 조건은 무슨 뜻일까요?"
          ],
          "watch": "심화의 조건(받아올림 생기게)을 놓치고 아무 값이나 고르는 학생 확인",
          "min": 5
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s09f",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "짝과 도토리 합치기 놀이 🤝",
          "type": "pair",
          "goal": "두 자리 수 받아올림 덧셈을 손으로 직접 만들어 보기",
          "steps": [
            "짝과 가위바위보를 해요",
            "각자 색종이에 두 자리 수를 하나씩 적어요 (일의 자리 합이 10을 넘게!)",
            "두 수를 더해 답을 적고, 짝과 답을 맞춰 봐요",
            "받아올림이 어디서 생겼는지 손가락으로 짚어 설명해요"
          ],
          "materials": [
            "색종이",
            "연필"
          ],
          "minutes": 4
        },
        "tnote": {
          "ask": [
            "짝의 계산에서 받아올림이 생긴 자리는 어디였나요?",
            "두 수를 어떻게 정하면 꼭 받아올림이 생길까요?"
          ],
          "watch": "일의 자리 합이 10을 안 넘는 수만 적는 짝 → 조건 다시 안내",
          "min": 4
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s10b",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인 퀴즈 🎫",
          "items": [
            {
              "q": "28 + 19 = ?",
              "a": "47"
            },
            {
              "q": "45 + 17 = ?",
              "a": "62"
            },
            {
              "q": "일의 자리 합이 10을 넘으면?",
              "a": "십의 자리로 1을 받아올림"
            }
          ],
          "self": [
            "오늘 내용을 설명할 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
          ]
        },
        "tnote": {
          "ask": [
            "세 문제 중 가장 자신 있는 건 무엇인가요?",
            "신호등에서 노랑·빨강을 든 친구는 어느 부분이 헷갈렸나요?"
          ],
          "watch": "빨강을 든 학생 수 체크 → 다음 차시 도입에서 보충할지 판단",
          "min": 3
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
            "(두 자리)+(두 자리)도 **자리별로** 더해요.",
            "일의 자리에서 10이 넘으면 십의 자리로 받아올림!",
            "28+19=47."
          ]
        },
        "tnote": {
          "ask": [
            "곰이와 펭이의 도토리를 이제 한 번에 셀 수 있게 됐나요?",
            "오늘 배운 걸 집에서 어디에 써 볼 수 있을까요?"
          ],
          "watch": "받아올림 개념을 자기 말로 설명하지 못하는 학생 마지막 확인",
          "min": 2
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
      "lesson_format": "교사주도 — 세로셈 형식화. 받아올림 세로셈 + 합이 100을 넘는 덧셈 · 40분 표준 증보(7요소)"
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
          "content": "여러 가지 방법으로 28+19=47을 구했어요.\n오늘은 **세로셈**으로 자리를 맞춰 깔끔하게 계산해요.",
          "items": [
            {
              "q": "25+7은?",
              "a": "32"
            },
            {
              "q": "38+5는?",
              "a": "43"
            }
          ],
          "from": "u3_l03"
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
          "question": "수가 커지면 가로로 쓰기 불편해요.<br>자리를 위아래로 맞춰 쓰면 어떤 점이 좋을까요?",
          "img": "assets/photo/math/books_stack.jpg"
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
        ],
        "tnote": {
          "ask": [
            "자리를 안 맞추고 쓰면 무엇이 잘못될까?"
          ],
          "watch": "일·십 세로 정렬 확인",
          "min": 2
        }
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
        ],
        "tnote": {
          "ask": [
            "합이 100을 넘으면 백의 자리는 어디서 올까?"
          ],
          "watch": "십의 자리 합이 10 넘으면 백으로 올림",
          "min": 2
        }
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "세로셈 자리 맞추기",
          "type": "pair",
          "goal": "십은 십끼리, 일은 일끼리",
          "steps": [
            "58과 46 수 카드를 놓기",
            "일의 자리끼리 세로로 맞추기",
            "십의 자리끼리 맞춰 더하기"
          ],
          "materials": [
            "수 카드"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "책 세기",
          "levels": {
            "기본": {
              "q": "47 + 38 은 얼마일까요?",
              "a": "85",
              "steps": [
                "7+8=15",
                "40+30+10"
              ]
            },
            "도전": {
              "q": "66 + 57 은 얼마일까요?",
              "a": "123",
              "steps": [
                "6+7=13",
                "60+50+10"
              ]
            },
            "심화": {
              "q": "더해서 100이 넘는 두 자리 수 짝을 여러 개 말해 봐요.",
              "a": "여러 답 (예: 58+46, 70+35 …)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "58+46은?",
              "a": "104"
            },
            {
              "q": "75+74는?",
              "a": "149"
            },
            {
              "q": "68+59는?",
              "a": "127"
            }
          ],
          "self": [
            "세로셈으로 두 자리 수를 더할 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 골든(40분 표준 7요소 시연) — 받아내림 여러 방법 + 수준별·활동·출구·발문",
      "golden": true
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
          "content": "받아올림 덧셈을 세로셈으로 했어요.\n오늘은 **받아내림**이 있는 뺄셈을 여러 방법으로 해 봐요.",
          "items": [
            {
              "q": "27 + 5 = ?",
              "a": "32"
            },
            {
              "q": "받아올림은 어느 자리로 올려요?",
              "a": "십의 자리로 1"
            }
          ],
          "from": "u3_l04"
        },
        "suggested_extras": [
          "t_concept"
        ],
        "tnote": {
          "ask": [
            "어제 받아올림에서 1을 어디로 올렸지?",
            "올림과 내림은 반대말일까?"
          ],
          "watch": "받아올림·받아내림 혼동. 방향(위로/아래로)을 손으로 짚어 확인",
          "min": 3
        }
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "사탕을 나눠 줬어요 🍭",
          "visual": "🍭",
          "question": "곰이가 사탕 23개 중 5개를 친구에게 줬어요. 일의 자리 3에서 5를 뺄 수 없어요!<br>어떻게 할까요?",
          "img": "assets/photo/math/candy_share.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "3에서 5를 빼려니 왜 막힐까?",
            "없으면 어디서 빌려올 수 있을까?"
          ],
          "watch": "“못 빼요”에서 멈추지 않게 — 빌려오기(받아내림)로 자연스럽게 유도",
          "min": 4
        }
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
        ],
        "tnote": {
          "ask": [
            "23을 20과 3으로 나누면 왜 편할까?"
          ],
          "watch": "가르기가 목적이 아니라 “빼기 쉬운 모양 만들기”가 목적",
          "min": 2
        }
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
        ],
        "tnote": {
          "ask": [
            "5-3=2로 거꾸로 빼면 답이 왜 이상해질까?"
          ],
          "watch": "가장 흔한 오류 — 큰 수에서 작은 수만 빼려는 습관. 십 배열로 반증",
          "min": 3
        }
      },
      {
        "id": "s06b",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "짝과 받아내림 만들기",
          "type": "pair",
          "goal": "십을 “풀어” 빼는 과정을 손으로",
          "steps": [
            "10개 묶음 카드 1장 + 낱개 3장을 짝과 놓기",
            "“3에서 5 못 빼!” → 묶음 하나를 낱개 10개로 풀기",
            "이제 13에서 5 빼서 8, 십은 1 남아 18 확인"
          ],
          "materials": [
            "십 묶음 카드",
            "낱개 카드"
          ],
          "minutes": 4
        },
        "tnote": {
          "ask": [
            "묶음을 풀었더니 낱개가 몇 개가 됐지?"
          ],
          "watch": "“푼다=10을 낱개로 바꾼다”를 말로 표현하게. 조작만 하고 말 안 하는 학생 주의",
          "min": 4
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s09b",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "사탕 가게 받아내림",
          "levels": {
            "기본": {
              "q": "25 - 6 = ?",
              "a": "19",
              "steps": [
                "25-5=20",
                "20-1=19"
              ]
            },
            "도전": {
              "q": "곰이가 사탕 34개 중 8개를 나눠 줬어요. 남은 사탕은?",
              "a": "26개",
              "steps": [
                "34-4=30",
                "30-4=26"
              ]
            },
            "심화": {
              "q": "사탕 42개를 두 친구에게 나눠 줬더니 27개가 남았어요. 몇 개를 줬을까요? 나눠 주는 방법을 여러 가지로 말해 봐요.",
              "a": "15개 (예: 7개+8개, 5개+10개 …)",
              "open": true
            }
          },
          "note": "기본→도전→심화로 갈수록 “상황 속 받아내림”으로 넓혀요."
        },
        "tnote": {
          "ask": [
            "심화 문제는 답이 하나뿐일까?",
            "다르게 나눠도 15개가 되는 방법은?"
          ],
          "watch": "심화는 정답 수렴이 목적 아님 — 여러 조합을 발표시키기",
          "min": 5
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s10b",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "23 - 5 = ?",
              "a": "18"
            },
            {
              "q": "일의 자리에서 못 빼면 어떻게 해요?",
              "a": "십의 자리에서 10을 빌려와요(받아내림)"
            },
            {
              "q": "41 - 6 = ?",
              "a": "35"
            }
          ],
          "self": [
            "받아내림을 설명할 수 있어요",
            "조금 헷갈려요",
            "다시 한 번 배우고 싶어요"
          ]
        },
        "tnote": {
          "ask": [],
          "watch": "신호등은 손들기용 — 🔴 든 학생 수만 눈으로 세고 다음 차시 도입에서 보충",
          "min": 3
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
            "일의 자리에서 뺄 수 없으면 **받아내림**을 해요.",
            "먼저 10을 만들거나, 십을 풀어 빼면 쉬워요.",
            "23-5=18."
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ],
        "tnote": {
          "ask": [
            "오늘 두 가지 방법 중 어떤 게 더 편했어?"
          ],
          "watch": "방법 우열이 아니라 “문제에 따라 골라 쓴다”로 정리",
          "min": 2
        }
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
      "lesson_format": "교사주도 — (두 자리)-(두 자리) 받아내림. 자리별 빼기·십 풀기 · 40분 표준 증보(7요소)"
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
          "content": "(두 자리)-(한 자리) 받아내림을 했어요.\n오늘은 **(두 자리)-(두 자리)** 뺄셈을 해 봐요.",
          "items": [
            {
              "q": "25-8은?",
              "a": "17"
            },
            {
              "q": "32-15는?",
              "a": "17"
            }
          ],
          "from": "u3_l05"
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
          "question": "곰이가 연필 50자루 중 27자루를 나눠 줬어요. 일의 자리 0에서 7을 뺄 수 없어요!<br>어떻게 할까요?",
          "img": "assets/photo/math/ttakji.jpg"
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
        ],
        "tnote": {
          "ask": [
            "십에서 10을 빌리면 십의 자리는 어떻게 될까?"
          ],
          "watch": "빌린 뒤 십의 자리 1 줄이기 잊지 않기",
          "min": 3
        }
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
        ],
        "tnote": {
          "ask": [
            "빌려 놓고 십의 자리를 안 줄이면 무엇이 잘못될까?"
          ],
          "watch": "받아내림 표시로 확인",
          "min": 2
        }
      },
      {
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "딱지 덜어내기",
          "type": "group",
          "goal": "십에서 10을 빌려 빼기",
          "steps": [
            "딱지 42장을 놓기",
            "일의 자리 2에서 9를 못 빼면 십에서 10 빌리기",
            "12-9=3, 남은 십 2개 → 23 확인"
          ],
          "materials": [
            "딱지"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "딱지 빼기",
          "levels": {
            "기본": {
              "q": "51 - 24 는 얼마일까요?",
              "a": "27",
              "steps": [
                "십에서 빌리기",
                "11-4=7"
              ]
            },
            "도전": {
              "q": "83 - 46 은 얼마일까요?",
              "a": "37",
              "steps": [
                "십에서 빌리기",
                "13-6=7"
              ]
            },
            "심화": {
              "q": "□ - 19 = 23 이 되는 □를 찾고, 방법을 말해 봐요.",
              "a": "42 (23+19)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "42-19는?",
              "a": "23"
            },
            {
              "q": "45-28은?",
              "a": "17"
            },
            {
              "q": "63-27은?",
              "a": "36"
            }
          ],
          "self": [
            "받아내림 있는 뺄셈을 할 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — 받아내림 세로셈 형식화. (두 자리)-(두 자리) · 40분 표준 증보(7요소)"
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
          "content": "여러 방법으로 50-27=23을 구했어요.\n오늘은 **세로셈**으로 받아내림 뺄셈을 정리해요.",
          "items": [
            {
              "q": "42-19는?",
              "a": "23"
            },
            {
              "q": "63-27은?",
              "a": "36"
            }
          ],
          "from": "u3_l06"
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
          "question": "곰이가 사탕 54개 중 26개를 먹었어요.<br>세로셈으로 자리를 맞춰 빼면 어떤 점이 좋을까요?",
          "img": "assets/photo/math/colored_paper.jpg"
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
        ],
        "tnote": {
          "ask": [
            "일의 자리 3에서 4를 못 빼면 어떻게 할까?"
          ],
          "watch": "거꾸로 빼지 않게 — 십에서 빌리기",
          "min": 3
        }
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
        ],
        "tnote": {
          "ask": [
            "뺄셈이 맞는지 어떻게 확인할까?"
          ],
          "watch": "답＋빼는 수＝처음 수",
          "min": 2
        }
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "뺄셈을 덧셈으로 확인",
          "type": "pair",
          "goal": "뺀 값을 다시 더해 맞나 확인",
          "steps": [
            "65-18=47 세로셈으로 풀기",
            "답 47에 18을 더하기",
            "47+18=65면 맞음 확인"
          ],
          "materials": [
            "색종이 수 카드"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "색종이 빼기",
          "levels": {
            "기본": {
              "q": "52 - 7 은 얼마일까요?",
              "a": "45",
              "steps": [
                "십에서 빌리기",
                "12-7=5"
              ]
            },
            "도전": {
              "q": "74 - 29 는 얼마일까요?",
              "a": "45",
              "steps": [
                "십에서 빌리기",
                "14-9=5"
              ]
            },
            "심화": {
              "q": "답이 45가 되는 (두 자리 수)-(두 자리 수)를 여러 개 말해 봐요.",
              "a": "여러 답 (예: 74-29, 63-18 …)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "23-4는?",
              "a": "19"
            },
            {
              "q": "65-18은?",
              "a": "47"
            },
            {
              "q": "81-37은?",
              "a": "44"
            }
          ],
          "self": [
            "세로셈으로 뺄 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — 세 수의 계산. 앞에서부터 순서대로(①②), 중간값 · 40분 표준 증보(7요소)"
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
          "content": "두 수의 덧셈·뺄셈을 했어요.\n오늘은 **세 수**를 한꺼번에 계산해요.",
          "items": [
            {
              "q": "65-18은?",
              "a": "47"
            },
            {
              "q": "81-37은?",
              "a": "44"
            }
          ],
          "from": "u3_l07"
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
          "question": "곰 15마리 → 19마리가 더 오고 → 21마리가 떠났어요.<br>지금 몇 마리? 세 수를 어떻게 계산할까요?",
          "img": "assets/photo/math/acorns.jpg"
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
        ],
        "tnote": {
          "ask": [
            "세 수는 어느 쪽부터 계산할까?"
          ],
          "watch": "앞에서부터 차례대로 ①②",
          "min": 3
        }
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
        ],
        "tnote": {
          "ask": [
            "뒤부터 계산하면 왜 답이 달라질까?"
          ],
          "watch": "앞에서부터 순서 지키기",
          "min": 2
        }
      },
      {
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "세 수 앞에서부터",
          "type": "group",
          "goal": "앞 두 수 먼저, 그다음 셋째",
          "steps": [
            "도토리로 24+17 먼저 모으기(41)",
            "거기서 19를 덜어내기",
            "남은 22 확인"
          ],
          "materials": [
            "도토리 모형"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "도토리 계산",
          "levels": {
            "기본": {
              "q": "30 + 15 - 20 을 차례대로 구해요.",
              "a": "25",
              "steps": [
                "30+15=45",
                "45-20"
              ]
            },
            "도전": {
              "q": "52 - 18 + 26 을 차례대로 구해요.",
              "a": "60",
              "steps": [
                "52-18=34",
                "34+26"
              ]
            },
            "심화": {
              "q": "세 수 45, 27, 19로 답이 53이 되는 식을 만들어 봐요.",
              "a": "45+27-19=53",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "24+17-19는?",
              "a": "22"
            },
            {
              "q": "28+25-36은?",
              "a": "17"
            },
            {
              "q": "42-15+27은?",
              "a": "54"
            }
          ],
          "self": [
            "세 수를 차례대로 계산할 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — 부분-부분-전체. 덧셈식↔뺄셈식 관계(역연산) · 40분 표준 증보(7요소)"
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
          "content": "세 수의 계산을 했어요.\n오늘은 덧셈식과 뺄셈식의 **관계**를 알아봐요.",
          "items": [
            {
              "q": "24+17-19는?",
              "a": "22"
            },
            {
              "q": "42-15+27은?",
              "a": "54"
            }
          ],
          "from": "u3_l08"
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
          "question": "물 안에 7마리, 물 밖에 3마리 있어요. 모두 10마리!<br>이 상황을 덧셈식과 뺄셈식으로 나타낼 수 있을까요?",
          "img": "assets/photo/math/apples.jpg"
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
        ],
        "tnote": {
          "ask": [
            "전체와 부분은 어떻게 다를까?"
          ],
          "watch": "전체 하나에 부분 둘",
          "min": 2
        }
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
        ],
        "tnote": {
          "ask": [
            "덧셈식 하나에서 뺄셈식이 왜 둘이 나올까?"
          ],
          "watch": "전체-부분＝다른 부분",
          "min": 3
        }
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "전체와 부분 가족",
          "type": "pair",
          "goal": "덧셈식 하나로 뺄셈식 둘 만들기",
          "steps": [
            "사과 부분 8·부분 5를 놓기",
            "모으면 전체 13 (8+5=13)",
            "전체에서 한 부분 덜기 (13-8=5, 13-5=8)"
          ],
          "materials": [
            "사과 모형"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "사과 식 가족",
          "levels": {
            "기본": {
              "q": "부분 6과 부분 7을 모으면 전체는?",
              "a": "13",
              "steps": [
                "6+7"
              ]
            },
            "도전": {
              "q": "9 + □ = 16 이면 16 - 9 는?",
              "a": "7",
              "steps": [
                "16-9"
              ]
            },
            "심화": {
              "q": "전체 14로 만들 수 있는 덧셈식·뺄셈식을 여러 개 말해 봐요.",
              "a": "여러 답 (예: 6+8=14, 14-8=6 …)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "부분 8과 5를 모으면?",
              "a": "13"
            },
            {
              "q": "전체 15, 한 부분 9면 다른 부분은?",
              "a": "6"
            },
            {
              "q": "7+8=15면 15-8은?",
              "a": "7"
            }
          ],
          "self": [
            "덧셈식과 뺄셈식의 관계를 알아요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — 모르는 수 □·등호 균형. 관계로 □ 구하기 · 40분 표준 증보(7요소)"
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
          "content": "덧셈과 뺄셈의 관계를 배웠어요.\n오늘은 모르는 수를 **□**로 나타내고 값을 구해요.",
          "items": [
            {
              "q": "부분 8과 5를 모으면?",
              "a": "13"
            },
            {
              "q": "7+8=15면 15-8은?",
              "a": "7"
            }
          ],
          "from": "u3_l09"
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
          "question": "곰이가 물고기 5마리를 잡고 더 잡아 모두 9마리가 됐어요.<br>더 잡은 수를 □로 하면? 5+□=9!",
          "img": "assets/photo/math/candies.jpg"
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
        ],
        "tnote": {
          "ask": [
            "모르는 수를 무엇으로 나타낼까?"
          ],
          "watch": "□＝모르는 수, 거꾸로 계산으로 찾기",
          "min": 3
        }
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
        ],
        "tnote": {
          "ask": [
            "12-□=9에서 왜 12+9가 아닐까?"
          ],
          "watch": "□ 위치에 따라 더하기/빼기가 달라짐",
          "min": 3
        }
      },
      {
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "□ 저울 맞추기",
          "type": "pair",
          "goal": "양쪽을 같게 만드는 □ 찾기",
          "steps": [
            "왼쪽에 5개, 오른쪽에 9개 놓기",
            "왼쪽에 몇 개 더 놓아야 같아질까 세기",
            "5+4=9 → □=4 확인"
          ],
          "materials": [
            "바둑돌",
            "간이 저울판"
          ],
          "minutes": 4
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "□ 찾기",
          "levels": {
            "기본": {
              "q": "6 + □ = 14 에서 □는?",
              "a": "8",
              "steps": [
                "14-6"
              ]
            },
            "도전": {
              "q": "□ - 9 = 16 에서 □는?",
              "a": "25",
              "steps": [
                "16+9"
              ]
            },
            "심화": {
              "q": "□가 7이 되는 식을 덧셈으로 하나, 뺄셈으로 하나 만들어 봐요.",
              "a": "여러 답 (예: 3+□=10, □-5=2)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "5+□=9에서 □는?",
              "a": "4"
            },
            {
              "q": "13-□=8에서 □는?",
              "a": "5"
            },
            {
              "q": "□-7=8에서 □는?",
              "a": "15"
            }
          ],
          "self": [
            "□의 값을 구할 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — 단원 평가. 받아올림/내림·세 수·관계·□값 총정리 + 스스로 점검 · 40분 표준 증보(7요소)"
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
          "content": "받아올림·받아내림 세로셈, 세 수의 계산, 덧셈뺄셈 관계, □의 값.\n오늘은 모두 모아 **확인**해요!",
          "items": [
            {
              "q": "5+□=9에서 □는?",
              "a": "4"
            },
            {
              "q": "□-7=8에서 □는?",
              "a": "15"
            }
          ],
          "from": "u3_l10"
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
          "question": "곰이와 펭이가 그동안 배운 것을 점검해요.<br>한 문제씩 풀며 내가 잘 아는지 확인해 볼까요?",
          "img": "assets/photo/math/recycle.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "이번 단원에서 가장 자신 있는 건 무엇일까?"
          ],
          "watch": "네 영역(덧셈·뺄셈·세 수·□) 스스로 점검",
          "min": 2
        }
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "단원 도전 문제",
          "levels": {
            "기본": {
              "q": "54 + 38 은 얼마일까요?",
              "a": "92",
              "steps": [
                "4+8=12",
                "50+30+10"
              ]
            },
            "도전": {
              "q": "72 - 45 + 18 을 차례대로 구해요.",
              "a": "45",
              "steps": [
                "72-45=27",
                "27+18"
              ]
            },
            "심화": {
              "q": "답이 40이 되는, 덧셈·뺄셈이 섞인 세 수 식을 만들어 봐요.",
              "a": "여러 답 (예: 25+30-15=40)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "47+28은?",
              "a": "75"
            },
            {
              "q": "63-27은?",
              "a": "36"
            },
            {
              "q": "□+8=15에서 □는?",
              "a": "7"
            }
          ],
          "self": [
            "단원 내용을 스스로 점검했어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
      "lesson_format": "교사주도 — 아웃트로. 연결 모형 작품 → 쓴 모형 수로 덧셈·뺄셈, 나·친구 비교. 환경 · 40분 표준 증보(7요소)"
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
          "content": "덧셈과 뺄셈을 여러 방법으로 배웠어요.\n오늘은 배운 것으로 직접 **만들고** 수를 세어 봐요.",
          "items": [
            {
              "q": "47+28은?",
              "a": "75"
            },
            {
              "q": "28+35-19는?",
              "a": "44"
            }
          ],
          "from": "u3_l11"
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
          "question": "곰이와 펭이가 색 큐브로 북극곰과 펭귄을 만들었어요.<br>쓴 큐브 수로 덧셈·뺄셈을 해 볼까요?",
          "img": "assets/photo/math/recycle_craft.jpg"
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
        ],
        "tnote": {
          "ask": [
            "모두 몇 개인지 구할 때는 무엇을 쓸까?"
          ],
          "watch": "모으기＝덧셈",
          "min": 2
        }
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
        ],
        "tnote": {
          "ask": [
            "몇 개 더 많은지 구할 때 왜 더하면 안 될까?"
          ],
          "watch": "차이＝뺄셈",
          "min": 2
        }
      },
      {
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "재활용품 작품 세기",
          "type": "group",
          "goal": "모으기(덧셈)·차이(뺄셈)를 작품으로",
          "steps": [
            "모둠이 모은 병뚜껑 세기",
            "두 모둠 것을 모으기(덧셈)",
            "더 많은 쪽이 몇 개 더인지 빼기(뺄셈)"
          ],
          "materials": [
            "병뚜껑"
          ],
          "minutes": 4
        },
        "suggested_extras": [
          "r_class"
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
          "title": "작품 재료 계산",
          "levels": {
            "기본": {
              "q": "빨강 26개와 파랑 18개이면 모두 몇 개?",
              "a": "44",
              "steps": [
                "26+18"
              ]
            },
            "도전": {
              "q": "곰이 52개, 펭이 35개이면 곰이가 몇 개 더 썼을까요?",
              "a": "17",
              "steps": [
                "52-35"
              ]
            },
            "심화": {
              "q": "모두 80개가 되도록 두 사람이 나눠 쓰는 방법을 여러 가지로 말해 봐요.",
              "a": "여러 답 (예: 40+40, 55+25 …)",
              "open": true
            }
          }
        },
        "suggested_extras": [
          "q_apply"
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "23+19는?",
              "a": "42"
            },
            {
              "q": "45-28은?",
              "a": "17"
            },
            {
              "q": "38+47은?",
              "a": "85"
            }
          ],
          "self": [
            "모으기와 차이를 구분해 쓸 수 있어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
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
