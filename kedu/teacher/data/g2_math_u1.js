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
      "lesson_format": "교사주도 — 도서관 큰 수 동기 → 10묶음 10개=100 → 두 자리/세 자리 구별 → 단원 예고 · 40분 표준 증보(7요소)"
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
        "kids": [{"face":"🐻","label":"곰이 \"책이 너무 많아! 백 권은 넘겠다.\""},{"face":"🐧","label":"펭이 \"10권씩 묶어서 세어 볼까?\""}],
        "tnote": {"ask":["99보다 큰 수는 어떻게 부를까?","10씩 묶으면 세기 쉬울까?","99권보다 많으면 어떻게 셀까? 하나씩? 10씩?"],"watch":"“많다”에서 멈추지 않게 — 10씩 묶어 세기로 유도 · \"많다\"에서 멈추지 않게 — 10권씩 묶어 세기로","min":3},
          "scene_title": "도서관에 책이 가득해요 📚",
          "visual": "📚",
          "question": "곰이와 펭이가 도서관에 갔어요. 책이 99권보다 훨씬 많아요.<br>이렇게 큰 수는 어떻게 셀까요?",
          "img": "assets/photo/math/library_books.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "99보다 큰 수는 어떻게 부를까?",
            "10씩 묶으면 세기 쉬울까?"
          ],
          "watch": "“많다”에서 멈추지 않게 — 10씩 묶어 세기로 유도",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["십 모형이 9개면 90, 10개면? 무슨 일이 생겨?"],"watch":"십 10개 → 백 1개로 바뀌는 순간을 말로","min":4},
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
        "tnote": {"ask":["99는 몇 자리 수? 100은 몇 자리 수? 자리가 하나 늘었어!"],"watch":"자리 수를 손가락으로 세게","min":3},
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
        "tnote": {"ask":["\"99 다음은 910\"이라고 한 친구, 뭐가 잘못됐을까?"],"watch":"9와 1을 붙여 쓴 것 — 십 모형 10개를 채워 보이기","min":4},
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "십 모형으로 100 만들기",
          "type": "pair",
          "goal": "10이 10개면 100임을 손으로",
          "steps": [
            "십 모형 카드를 짝과 나눠 갖기",
            "10개를 한 줄로 모으기",
            "“10이 10개 = 100” 함께 외치기"
          ],
          "materials": [
            "십 모형 카드"
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
        ],
        "tnote": {
          "ask": [
            "10이 10개면 왜 100이 될까?"
          ],
          "watch": "십 모형을 눈으로 세어 확인",
          "min": 2
        }
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
        "tnote": {"ask":["30권에 13권 더 읽으면? 1학년 때 배운 대로 해 볼까?"],"watch":"30+13=43 — 받아올림 없는 복습","min":3},
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
        "tnote": {"ask":["60과 40을 모으면 왜 딱 100이 될까?"],"watch":"십 6개 + 십 4개 = 십 10개 = 100","min":4},
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["100권을 두 책장에 나눠 꽂는 방법, 몇 가지나 될까?"],"watch":"60+40·50+50·90+10 … 둘을 모으면 100","min":5},
          "title": "도서관 책 세기",
          "levels": {
            "기본": {
              "q": "10이 6개이면 얼마일까요?",
              "a": "60",
              "steps": [
                "10×6"
              ]
            },
            "도전": {
              "q": "책 70권에 30권을 더 모으면 몇 권일까요?",
              "a": "100권",
              "steps": [
                "70+30"
              ]
            },
            "심화": {
              "q": "100권을 두 책장에 나눠 꽂는 방법을 여러 가지로 말해 봐요.",
              "a": "여러 답 (예: 60+40, 50+50 …)",
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["오늘 확인 세 문제, 답이 다 같은 수야! 그 수는?"],"watch":"100 — 세 방향에서 같은 수","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "10이 10개이면 얼마?",
              "a": "100"
            },
            {
              "q": "60과 40을 모으면?",
              "a": "100"
            },
            {
              "q": "99 다음 수는?",
              "a": "100"
            }
          ],
          "self": [
            "100을 설명할 수 있어요",
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
      "lesson_format": "교사주도 — 10이 10개=100 → 100의 여러 표현 → 100 가르기·모으기 · 40분 표준 증보(7요소)"
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
          "content": "지난 시간에 99보다 1 큰 수가 **100**인 것을 배웠어요.\n오늘은 100을 더 자세히 알아봐요.",
          "items": [
            {
              "q": "10이 10개이면?",
              "a": "100"
            },
            {
              "q": "99 다음 수는?",
              "a": "100"
            }
          ],
          "from": "u1_l01"
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
        "kids": [{"face":"🐻","label":"곰이 \"연필을 10자루씩 10묶음 모았어!\""},{"face":"🐧","label":"펭이 \"10, 20, 30… 다 세면 얼마지?\""}],
        "tnote": {"ask":["10묶음이 10개면 얼마가 될까?","10자루씩 10묶음이면 몇 자루? 10씩 세어 볼까?"],"watch":"묶음과 낱개 구분 — 묶음 하나 = 10 · 10·20·30…100 — 열 번째에서 백","min":3},
          "scene_title": "연필이 한가득! ✏️",
          "visual": "✏️",
          "question": "곰이가 연필을 10자루씩 10묶음 가지고 있어요.<br>모두 몇 자루일까요?",
          "img": "assets/photo/math/pencils_bundle.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "10묶음이 10개면 얼마가 될까?"
          ],
          "watch": "묶음과 낱개 구분 — 묶음 하나 = 10",
          "min": 2
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["십 모형 10개를 백 모형 1개로 바꿔도 양이 같아? 왜?"],"watch":"모양은 달라도 개수는 100으로 같음","min":4},
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
        "tnote": {"ask":["100을 세 가지로 말해 볼까? \"90보다…\", \"99보다…\", \"10이…\""],"watch":"세 표현이 다 같은 100","min":4},
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
        "tnote": {"ask":["\"10이 10개니까 1010\"이라는 친구에게 뭐라고 말해 줄까?"],"watch":"묶음을 늘어놓지 않고 백의 자리가 새로 생김","min":4},
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "연필 100자루 묶기",
          "type": "group",
          "goal": "10자루 묶음 10개 = 100",
          "steps": [
            "10자루 묶음 카드를 모둠이 모으기",
            "10묶음을 한 자리에 놓기",
            "“100자루!” 확인"
          ],
          "materials": [
            "연필 묶음 카드"
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
        "tnote": {"ask":["100은 10이 몇 개인지 거꾸로 세어 볼까?","100은 10이 몇 개? 거꾸로 세어 볼까? 100, 90, 80…"],"watch":"“10이 10개”와 “100은 10이 10개”를 양방향으로 · 10씩 거꾸로 세어 10번","min":3},
          "title": "기본 ② ",
          "question": "100은 10이 몇 개일까요?",
          "input": "count_input",
          "answer": 10,
          "note": "풀이: 100은 10이 10개."
        },
        "suggested_extras": [
          "q_basic"
        ],
        "tnote": {
          "ask": [
            "100은 10이 몇 개인지 거꾸로 세어 볼까?"
          ],
          "watch": "“10이 10개”와 “100은 10이 10개”를 양방향으로",
          "min": 2
        }
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
        "tnote": {"ask":["60에서 100이 되려면 10이 몇 개 더 필요해?"],"watch":"10이 4개 = 40","min":4},
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["100자루를 10자루 묶음과 낱개로 나누면? 묶음 9개면 낱개는?"],"watch":"묶음 9 + 낱개 10 / 묶음 8 + 낱개 20 …","min":5},
          "title": "연필 세기",
          "levels": {
            "기본": {
              "q": "10이 8개이면 얼마일까요?",
              "a": "80",
              "steps": [
                "10×8"
              ]
            },
            "도전": {
              "q": "80자루에 몇 자루를 더 모으면 100이 될까요?",
              "a": "20자루",
              "steps": [
                "100-80"
              ]
            },
            "심화": {
              "q": "100자루를 10자루 묶음과 낱개로 나누는 방법을 여러 가지로 말해 봐요.",
              "a": "여러 답 (예: 묶음 9+낱개 10, 묶음 8+낱개 20 …)",
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["\"60과 얼마를 모으면 100?\" 십 모형으로 놓아 볼까?"],"watch":"40 — 손으로 채우기","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "10이 10개이면?",
              "a": "100"
            },
            {
              "q": "100은 10이 몇 개?",
              "a": "10개"
            },
            {
              "q": "60과 얼마를 모으면 100?",
              "a": "40"
            }
          ],
          "self": [
            "백을 설명할 수 있어요",
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
      "lesson_format": "교사주도 — 100이 몇 개=몇백 → 몇백 읽기·쓰기 → 100씩 뛰어 세기 · 40분 표준 증보(7요소)"
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
          "content": "지난 시간에 **100(백)**을 배웠어요.\n오늘은 200, 300, 400 … 같은 **몇백**을 알아봐요.",
          "items": [
            {
              "q": "10이 10개이면?",
              "a": "100"
            },
            {
              "q": "100은 10이 몇 개?",
              "a": "10개"
            }
          ],
          "from": "u1_l02"
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
        "kids": [{"face":"🐻","label":"곰이 \"책장 하나에 100권씩이래!\""},{"face":"🐧","label":"펭이 \"책장이 5개면… 100씩 뛰어 세자!\""}],
        "tnote": {"ask":["100이 5개면 어떻게 셀까?","100권씩 책장 5개면? 100씩 세어 볼까?"],"watch":"100단위로 뛰어 세기(100·200·300…) · 100·200·300·400·500 — 백 모형 5개","min":3},
          "scene_title": "책이 몇백 권! 📖",
          "visual": "📖",
          "question": "도서관 책장 하나에 책이 100권씩 꽂혀 있어요.<br>책장 5개에는 모두 몇 권일까요?",
          "img": "assets/photo/math/library_shelves.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "100이 5개면 어떻게 셀까?"
          ],
          "watch": "100단위로 뛰어 세기(100·200·300…)",
          "min": 2
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["백 모형이 4개면 얼마? 백의 자리에 무슨 숫자를 쓸까?"],"watch":"400 — 백의 자리 4","min":4},
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
        "tnote": {"ask":["200은 \"이백\", 500은? 700은? 무엇만 바뀌었어?"],"watch":"백의 자리 숫자만 바뀜","min":3},
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
        "tnote": {"ask":["\"100이 5개니까 105\"라고 쓴 친구, 5를 어디에 썼어?"],"watch":"일의 자리에 씀 — 백의 자리에 써야 500","min":4},
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
        ],
        "tnote": {
          "ask": [
            "500은 100이 몇 개인지 거꾸로 말해 볼까?"
          ],
          "watch": "몇백↔100의 개수 양방향",
          "min": 2
        }
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
        "tnote": {"ask":["600은 100이 몇 개? 백 모형으로 놓아 볼까?"],"watch":"6개","min":3},
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
        "tnote": {"ask":["100이 8개면? 읽어 볼까?"],"watch":"800 팔백","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["700권을 100권 책장에 나눠 꽂는 방법, 짝과 다르게 말해 볼까?"],"watch":"4+3·5+2·6+1 — 합이 7","min":5},
          "title": "책장 세기",
          "levels": {
            "기본": {
              "q": "100이 4개이면 얼마일까요?",
              "a": "400",
              "steps": [
                "100×4"
              ]
            },
            "도전": {
              "q": "책장 3개에 100권씩, 여기에 200권을 더하면 몇 권일까요?",
              "a": "500권",
              "steps": [
                "300+200"
              ]
            },
            "심화": {
              "q": "700권을 100권짜리 책장에 나눠 꽂는 방법을 여러 가지로 말해 봐요.",
              "a": "여러 답 (예: 4+3, 5+2 …)",
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
        "tnote": {"ask":["저금통 속 100원짜리가 5개면 얼마?"],"watch":"500원 — 몇백을 돈으로","min":4},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "백 모형 카드로 몇백 만들기",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "🟥",
          "goal": "백 모형 몇 개로 몇백을 만들고 읽어요.",
          "steps": [
            "짝과 백 모형 카드(100)를 10장씩 나눠 가져요.",
            "한 사람이 \"사백!\" 하고 부르면 짝이 카드 4장을 놓아요.",
            "놓은 카드를 100·200·300·400으로 세며 확인해요.",
            "역할을 바꿔 다섯 번 해요."
          ],
          "materials": [
            "백 모형 카드(짝당 10장)"
          ],
          "minutes": 4,
          "tnote": {
            "ask": [
              "700을 만들려면 카드가 몇 장?"
            ],
            "watch": "개수(7)와 값(700)을 구분해 말하게",
            "min": 4
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["600은 100이 몇 개인지 손가락으로 보여 줄래?"],"watch":"6","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "100이 5개이면?",
              "a": "500"
            },
            {
              "q": "600은 100이 몇 개?",
              "a": "6개"
            },
            {
              "q": "100이 8개이면?",
              "a": "800"
            }
          ],
          "self": [
            "몇백을 설명할 수 있어요",
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
      "lesson_format": "교사주도 — 백·십·일 모형 조립 → 세 자리 수 읽기·쓰기 → 없는 자리 0 · 40분 표준 증보(7요소)"
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
          "content": "지난 시간에 **몇백**을 배웠어요.\n오늘은 백·십·일을 모두 합친 **세 자리 수**를 만들어요.",
          "items": [
            {
              "q": "100이 5개이면?",
              "a": "500"
            },
            {
              "q": "600은 100이 몇 개?",
              "a": "6개"
            }
          ],
          "from": "u1_l03"
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
        "kids": [{"face":"🐻","label":"곰이 \"대출증이 백 묶음 2개, 십 묶음 5개, 낱장 4개!\""},{"face":"🐧","label":"펭이 \"이걸 한 수로 말할 수 있을까?\""}],
        "tnote": {"ask":["백·십·일 묶음을 어떻게 하나의 수로 읽을까?","백 2·십 5·일 4 묶음을 어떻게 하나의 수로 읽을까?"],"watch":"자리 순서(백→십→일) 유지 · 200과 50과 4 → 254","min":3},
          "scene_title": "대출증이 몇 장? 🎫",
          "visual": "🎫",
          "question": "도서관에 대출증이 백 묶음 2개, 십 묶음 5개, 낱장 4개 있어요.<br>모두 몇 장일까요?",
          "img": "assets/photo/math/library_cards.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "백·십·일 묶음을 어떻게 하나의 수로 읽을까?"
          ],
          "watch": "자리 순서(백→십→일) 유지",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["백 2개는 얼마? 십 5개는? 일 4개는? 다 합치면?"],"watch":"200+50+4=254","min":4},
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
        "tnote": {"ask":["백 5개·일 3개뿐이면 십의 자리에 뭘 써야 해?"],"watch":"0 — 503","min":4},
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
        "tnote": {"ask":["\"백 5개·일 3개니까 53\"이라고 쓴 친구, 어느 자리를 빼먹었을까?"],"watch":"십의 자리 — 0을 채워 503","min":4},
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "자리 카드로 세 자리 수 만들기",
          "type": "pair",
          "goal": "백·십·일 묶음으로 수 만들기",
          "steps": [
            "백·십·일 카드를 짝과 나누기",
            "백 3·십 4·일 7을 놓기",
            "“347!” 읽고 확인"
          ],
          "materials": [
            "백·십·일 자리 카드"
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
        "tnote": {"ask":["백 3·십 4·일 7이면? 읽어 볼까?"],"watch":"347 삼백사십칠","min":3},
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
        "tnote": {"ask":["503에서 십의 자리가 왜 0일까?","503에서 십의 자리 숫자는? 왜 0일까?"],"watch":"빈 자리 0의 의미 — 십 묶음이 없음 · 십 묶음이 하나도 없어서","min":4},
          "title": "기본 ③ ",
          "question": "503에서 십의 자리 숫자는 무엇일까요?",
          "input": "count_input",
          "answer": 0,
          "note": "풀이: 503은 백 5·십 0·일 3. 십의 자리는 0."
        },
        "suggested_extras": [
          "q_basic"
        ],
        "tnote": {
          "ask": [
            "503에서 십의 자리가 왜 0일까?"
          ],
          "watch": "빈 자리 0의 의미 — 십 묶음이 없음",
          "min": 2
        }
      },
      {
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["숫자 카드 3·4·7로 세 자리 수를 몇 개 만들 수 있을까? 가장 큰 수는?"],"watch":"6개 — 743이 가장 큼","min":5},
          "title": "대출증 세기",
          "levels": {
            "기본": {
              "q": "백 2개·십 5개·일 4개이면 얼마일까요?",
              "a": "254",
              "steps": [
                "200+50+4"
              ]
            },
            "도전": {
              "q": "백 6개·십 3개·일 5개이면 얼마일까요?",
              "a": "635",
              "steps": [
                "600+30+5"
              ]
            },
            "심화": {
              "q": "숫자 카드 3·4·7로 만들 수 있는 세 자리 수를 여러 개 말해 봐요.",
              "a": "여러 답 (347·374·437·473·734·743)",
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["503을 읽어 볼까? \"오백삼\"에서 십은 왜 안 읽어?"],"watch":"없는 자리는 읽지 않음","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "백 3·십 4·일 7이면?",
              "a": "347"
            },
            {
              "q": "503의 십의 자리 숫자는?",
              "a": "0"
            },
            {
              "q": "백 6·십 3·일 5면?",
              "a": "635"
            }
          ],
          "self": [
            "세 자리 수를 만들 수 있어요",
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
      "lesson_format": "교사주도 — 자릿값 → 같은 숫자 다른 값 → 자릿값 카드로 가르기 · 40분 표준 증보(7요소)"
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
          "content": "지난 시간에 **세 자리 수**를 읽고 썼어요.\n오늘은 각 숫자가 **어떤 값**을 나타내는지 알아봐요.",
          "items": [
            {
              "q": "백 3·십 4·일 7이면?",
              "a": "347"
            },
            {
              "q": "503의 십의 자리 숫자는?",
              "a": "0"
            }
          ],
          "from": "u1_l04"
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
        "kids": [{"face":"🐻","label":"곰이 \"323… 앞의 3과 뒤의 3은 같은 값일까?\""},{"face":"🐧","label":"펭이 \"자리가 다르니까 다를 것 같은데?\""}],
        "tnote": {"ask":["323의 두 3은 정말 같은 값일까?","323의 두 3은 정말 같은 값일까? 어떻게 확인할 수 있을까?"],"watch":"자리에 따라 값이 다름 — 앞 3=300, 뒤 3=3 · 백 모형 3개와 일 모형 3개를 놓아 비교","min":3},
          "scene_title": "두 3은 같은 값일까? 🤔",
          "visual": "🤔",
          "question": "곰이가 **323**을 보고 물어요. \"앞의 3과 뒤의 3은 같은 값일까?\"<br>여러분 생각은 어떤가요?",
          "img": "assets/photo/math/place_value.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "323의 두 3은 정말 같은 값일까?"
          ],
          "watch": "자리에 따라 값이 다름 — 앞 3=300, 뒤 3=3",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["앞의 3은 얼마를 나타내? 뒤의 3은?"],"watch":"300과 3","min":4},
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
        "tnote": {"ask":["323을 백·십·일 값으로 갈라 볼까? 300+? +?"],"watch":"300+20+3","min":4},
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
        "tnote": {"ask":["382의 8은 그냥 8일까? 어느 자리에 있어?"],"watch":"십의 자리 → 80","min":4},
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
        "tnote": {"ask":["705에서 십의 자리 0은 무슨 뜻일까?","382에서 8이 나타내는 값은? 705에서 십의 자리 0은 무슨 뜻일까?"],"watch":"0도 자리를 지키는 중요한 숫자 · 80 · 십 묶음이 없음","min":3},
          "title": "기본 ① ",
          "question": "382에서 8이 나타내는 값은 얼마일까요?",
          "input": "count_input",
          "answer": 80,
          "note": "풀이: 8은 십의 자리 → 80."
        },
        "suggested_extras": [
          "q_basic"
        ],
        "tnote": {
          "ask": [
            "705에서 십의 자리 0은 무슨 뜻일까?"
          ],
          "watch": "0도 자리를 지키는 중요한 숫자",
          "min": 2
        }
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
        "tnote": {"ask":["600+40+0을 한 수로 쓰면? 일의 자리는?"],"watch":"640 — 일의 자리 0","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["323의 앞 3과 뒤 3의 값의 차는? 300에서 3을 빼면?"],"watch":"297","min":5},
          "title": "같은 숫자, 다른 값",
          "levels": {
            "기본": {
              "q": "382에서 8이 나타내는 값은 얼마일까요?",
              "a": "80",
              "steps": [
                "십의 자리 8 = 80"
              ]
            },
            "도전": {
              "q": "323에서 앞의 3과 뒤의 3이 나타내는 값의 차는 얼마일까요?",
              "a": "297",
              "steps": [
                "300-3"
              ]
            },
            "심화": {
              "q": "숫자 5가 500을 나타내는 세 자리 수를 여러 개 말해 봐요.",
              "a": "여러 답 (예: 512·567·503 …)",
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
        "tnote": {"ask":["책 번호 십의 자리 4는 얼마를 나타내?"],"watch":"40","min":3},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "자릿값 카드 갈라 놓기",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "🃏",
          "goal": "세 자리 수를 백·십·일 값 카드로 갈라요.",
          "steps": [
            "숫자 카드 세 장을 뽑아 세 자리 수를 만들어요(예: 382).",
            "짝이 300·80·2 자릿값 카드를 골라 아래에 놓아요.",
            "\"300+80+2=382\" 함께 읽어요.",
            "역할을 바꿔요. 0이 들어간 수(예: 705)도 만들어 봐요."
          ],
          "materials": [
            "숫자 카드 0~9",
            "자릿값 카드(100~900·10~90·1~9)"
          ],
          "minutes": 5,
          "tnote": {
            "ask": [
              "705의 십의 자리 카드는 뭘 놓아요?"
            ],
            "watch": "0은 카드를 놓지 않음 — 십의 값 0",
            "min": 5
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["숫자 5가 500을 나타내려면 5를 어느 자리에 써야 해?"],"watch":"백의 자리","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "382에서 8의 값은?",
              "a": "80"
            },
            {
              "q": "600+40+0은?",
              "a": "640"
            },
            {
              "q": "705에서 십의 자리 값은?",
              "a": "0"
            }
          ],
          "self": [
            "자릿값을 설명할 수 있어요",
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
      "lesson_format": "교사주도 — 100씩·10씩·1씩 뛰어 세기 → 수 배열표 규칙 → 999 다음 1000 · 40분 표준 증보(7요소)"
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
          "content": "지난 시간에 **자릿값**을 배웠어요.\n오늘은 수를 일정하게 **뛰어 세는 방법**을 알아봐요.",
          "items": [
            {
              "q": "382에서 8의 값은?",
              "a": "80"
            },
            {
              "q": "600+40+0은?",
              "a": "640"
            }
          ],
          "from": "u1_l05"
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
        "kids": [{"face":"🐧","label":"펭이 \"100, 200, 300… 다음은?\""},{"face":"🐻","label":"곰이 \"백의 자리만 바뀌고 있네!\""}],
        "tnote": {"ask":["어느 자리 숫자가 바뀌고 있지?","100, 200, 300 다음은? 어느 자리 숫자가 바뀌고 있지?"],"watch":"뛰는 단위(100·10·1)에 따라 바뀌는 자리 확인 · 백의 자리 — 100씩 뛰기","min":3},
          "scene_title": "다음에 올 수는? ➡️",
          "visual": "➡️",
          "question": "펭이가 수를 외쳐요. \"100, 200, 300 … 다음은?\"<br>규칙을 찾으면 다음 수를 알 수 있어요.",
          "img": "assets/photo/math/skip_count.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "어느 자리 숫자가 바뀌고 있지?"
          ],
          "watch": "뛰는 단위(100·10·1)에 따라 바뀌는 자리 확인",
          "min": 2
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["612, 622, 632은 몇씩 뛴 거야? 어느 자리가 바뀌어?"],"watch":"10씩 — 십의 자리","min":4},
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
        "tnote": {"ask":["999에서 1 더 뛰면? 자리가 몇 개가 될까?"],"watch":"1000 — 네 자리","min":4},
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
        "tnote": {"ask":["\"999 다음은 9910\"이라는 친구, 왜 틀렸을까?"],"watch":"1을 붙인 것 — 일·십·백이 0이 되고 천이 생김","min":4},
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "몸으로 뛰어 세기",
          "type": "whole",
          "goal": "100씩·10씩 뛰는 규칙을 몸으로",
          "steps": [
            "한 걸음마다 100씩 외치며 걷기(100·200·300…)",
            "방향 바꿔 10씩 외치기",
            "멈춘 수에서 다음 수 맞히기"
          ],
          "materials": [
            "바닥 수 카드"
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
        "tnote": {"ask":["200, 300 다음 100씩 뛰면?"],"watch":"400","min":3},
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
        ],
        "tnote": {
          "ask": [
            "999 다음이 왜 1000일까?"
          ],
          "watch": "자리 올림 — 세 자리에서 네 자리로",
          "min": 3
        }
      },
      {
        "id": "s09",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
        "tnote": {"ask":["622에서 10씩 뛰면? 632, 642 … 백의 자리는 바뀌어?"],"watch":"632 — 백은 그대로","min":3},
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["400에 도착하는 뛰어 세기 방법을 두 가지 말해 볼까?"],"watch":"100씩 4번 · 200에서 100씩 2번 · 350에서 10씩 5번","min":5},
          "title": "뛰어 세기 규칙",
          "levels": {
            "기본": {
              "q": "100씩 뛰면 200-300 다음은?",
              "a": "400",
              "steps": [
                "300+100"
              ]
            },
            "도전": {
              "q": "622에서 10씩 두 번 뛰면 얼마일까요?",
              "a": "642",
              "steps": [
                "622+10+10"
              ]
            },
            "심화": {
              "q": "400에 도착하는 뛰어 세기 방법을 여러 가지로 말해 봐요.",
              "a": "여러 답 (예: 100씩 4번, 200에서 100씩 2번 …)",
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
        "tnote": {"ask":["저금통에 300원이 있어. 100원 더 넣으면?"],"watch":"400원","min":3},
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["999보다 1 큰 수를 쓰고 읽어 볼까?"],"watch":"1000 천","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "200-300 다음 100씩은?",
              "a": "400"
            },
            {
              "q": "999보다 1 큰 수는?",
              "a": "1000"
            },
            {
              "q": "622에서 10씩 뛰면?",
              "a": "632"
            }
          ],
          "self": [
            "뛰어 세기를 할 수 있어요",
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
      "lesson_format": "교사주도 — 백→십→일 자리 차례 비교 → >·< 기호 → 가장 큰/작은 수 · 40분 표준 증보(7요소)"
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
          "content": "지난 시간에 **뛰어 세기**를 배웠어요.\n오늘은 두 세 자리 수 중 **어느 것이 더 큰지** 비교해요.",
          "items": [
            {
              "q": "200-300 다음 100씩은?",
              "a": "400"
            },
            {
              "q": "999보다 1 큰 수는?",
              "a": "1000"
            }
          ],
          "from": "u1_l06"
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
        "kids": [{"face":"🐻","label":"곰이 \"내 수는 169!\""},{"face":"🐧","label":"펭이 \"내 수는 196! 누가 더 클까?\""}],
        "tnote": {"ask":["169와 196은 어느 자리부터 비교해야 할까?","169와 196, 어느 자리부터 비교해야 할까?"],"watch":"백→십→일 순서. 앞자리가 같을 때만 다음 자리로 · 백의 자리부터 — 같으면 십의 자리","min":3},
          "scene_title": "누가 더 큰 수일까? ⚖️",
          "visual": "⚖️",
          "question": "곰이는 **169**, 펭이는 **196**을 들고 있어요.<br>누구의 수가 더 클까요?",
          "img": "assets/photo/math/compare_numbers.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "169와 196은 어느 자리부터 비교해야 할까?"
          ],
          "watch": "백→십→일 순서. 앞자리가 같을 때만 다음 자리로",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["백이 같으면 다음엔 어디를 봐? 십도 같으면?"],"watch":"십 → 일 순서","min":4},
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
        "tnote": {"ask":["> 기호의 벌어진 입은 어느 쪽을 향해? 196 ○ 169에 뭘 쓸까?"],"watch":"큰 수 쪽 — 196 > 169","min":4},
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
        "tnote": {"ask":["\"9가 6보다 크니까 169가 더 커요\" — 어디를 먼저 봐서 틀렸을까?"],"watch":"일의 자리부터 봄 — 십의 자리 먼저","min":4},
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "누구 수가 더 클까",
          "type": "pair",
          "goal": "자리별로 비교하는 순서 익히기",
          "steps": [
            "짝과 세 자리 수 카드 한 장씩 뽑기",
            "백의 자리부터 차례로 비교",
            "더 큰 수를 든 사람이 설명하기"
          ],
          "materials": [
            "수 카드"
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
        "tnote": {"ask":["754와 745는 백의 자리가 같은데 어떻게 비교하지?","169와 168은 백도 십도 같아. 무엇으로 비교해?"],"watch":"같으면 다음 자리로 — 십의 자리 비교 · 일의 자리 9>8","min":3},
          "title": "기본 ① ",
          "question": "169와 168 중 더 큰 수는 무엇일까요?",
          "input": "count_input",
          "answer": 169,
          "note": "풀이: 백·십 같음 → 일의 자리 9>8 → 169."
        },
        "suggested_extras": [
          "q_basic"
        ],
        "tnote": {
          "ask": [
            "754와 745는 백의 자리가 같은데 어떻게 비교하지?"
          ],
          "watch": "같으면 다음 자리로 — 십의 자리 비교",
          "min": 2
        }
      },
      {
        "id": "s08",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
        "tnote": {"ask":["754와 745는 백의 자리가 같은데 어떻게 비교하지?"],"watch":"십의 자리 5>4 → 754","min":3},
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["백의 자리가 5이면서 561보다 큰 수를 말해 볼까? 몇 개나 있을까?"],"watch":"562~599 — 많음","min":5},
          "title": "수의 크기 비교",
          "levels": {
            "기본": {
              "q": "169와 168 중 더 큰 수는?",
              "a": "169",
              "steps": [
                "일의 자리 9>8"
              ]
            },
            "도전": {
              "q": "754와 745 중 더 큰 수는? 왜일까요?",
              "a": "754 (십의 자리 5>4)",
              "steps": [
                "백 같음→십 비교"
              ]
            },
            "심화": {
              "q": "백의 자리가 5인 수 중 561보다 큰 수를 여러 개 말해 봐요.",
              "a": "여러 답 (예: 562·570·599 …)",
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
        "tnote": {"ask":["두 친구가 읽은 책 수 중 더 많은 쪽은? 어떻게 알았어?"],"watch":"718 — 자리 비교로","min":4},
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["561과 516 중 큰 수는? 기호로 써 볼까?"],"watch":"561 > 516","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "169와 168 중 큰 수?",
              "a": "169"
            },
            {
              "q": "754와 745 중 큰 수?",
              "a": "754"
            },
            {
              "q": "561과 516 중 큰 수?",
              "a": "561"
            }
          ],
          "self": [
            "수의 크기를 비교할 수 있어요",
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
      "lesson_format": "교사주도 — 단원 평가(몇백·자릿값·뛰어 세기·크기 비교) · 자기 평가 · 40분 표준 증보(7요소)"
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
          "content": "이 단원에서 **세 자리 수**를 읽고 쓰고, **자릿값·뛰어 세기·크기 비교**를 배웠어요.\n오늘은 모두 확인해 봐요.",
          "items": [
            {
              "q": "100이 5개이면?",
              "a": "500"
            },
            {
              "q": "763과 736 중 큰 수?",
              "a": "763"
            }
          ],
          "from": "u1_l07"
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
        "img": "assets/photo/math/unit1_check.jpg",
        "kids": [{"face":"🐻","label":"곰이 \"이번 단원에서 뭘 배웠더라?\""},{"face":"🐧","label":"펭이 \"몇백, 자릿값, 뛰어 세기, 크기 비교! 하나씩 점검하자.\""}],
        "tnote": {"ask":["이번 단원에서 가장 자신 있는 건 뭘까?","이번 단원에서 가장 자신 있는 건 뭘까? 헷갈리는 건?"],"watch":"점검 차시 — 학생이 스스로 약한 부분 말하게 · 네 가지 중 하나씩 손 들기","min":3},
          "scene_title": "준비됐나요? ✅",
          "visual": "✅",
          "question": "곰이와 펭이가 단원을 마무리해요.<br>배운 것을 하나씩 점검해 볼까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "이번 단원에서 가장 자신 있는 건 뭘까?"
          ],
          "watch": "점검 차시 — 학생이 스스로 약한 부분 말하게",
          "min": 2
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["네 가지를 순서대로 말해 볼까? 몇백·자릿값·뛰어 세기·크기 비교"],"watch":"한 가지씩 예를 들어","min":3},
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
        "tnote": {"ask":["100이 5개면? 백 모형으로 놓으면 몇 개?"],"watch":"500","min":3},
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
        "tnote": {"ask":["백 4·십 5·일 3을 한 수로? 십의 자리는?"],"watch":"453 — 5","min":3},
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
        "tnote": {"ask":["245에서 10씩 뛰면? 어느 자리가 바뀌었어?"],"watch":"255 — 십의 자리","min":3},
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
        "tnote": {"ask":["763과 736은 백이 같아. 어디를 봐?"],"watch":"십의 자리 6>3 → 763","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["367에서 3·6·7이 나타내는 값을 각각 말해 볼까?"],"watch":"300·60·7","min":5},
          "title": "단원 종합",
          "levels": {
            "기본": {
              "q": "백 4·십 5·일 3이면 얼마일까요?",
              "a": "453",
              "steps": [
                "400+50+3"
              ]
            },
            "도전": {
              "q": "245에서 10씩 두 번 뛰면 얼마일까요?",
              "a": "265",
              "steps": [
                "245+10+10"
              ]
            },
            "심화": {
              "q": "367에서 각 자리 숫자가 나타내는 값을 모두 말해 봐요.",
              "a": "300, 60, 7",
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "짝과 답 맞춰 보기",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "✅",
          "goal": "확인 문제 답을 짝과 비교하고 이유를 말해요.",
          "steps": [
            "확인 ①~④ 답을 짝과 번갈아 말해요.",
            "답이 다르면 백·십·일 모형을 놓아 다시 세어 봐요.",
            "어느 쪽이 맞는지 이유를 말해요.",
            "틀린 문제는 ○ 표시해 두어요."
          ],
          "materials": [
            "확인 문제지",
            "백·십·일 모형 카드"
          ],
          "minutes": 5,
          "tnote": {
            "ask": [
              "답이 다르면 무엇으로 확인해요?"
            ],
            "watch": "\"누가 맞나\"보다 \"어떻게 풀었나\"",
            "min": 5
          }
        }
      },
      {
        "id": "s10",
        "stage": "정리",
        "block": "self_assessment",
        "data": {
        "tnote": {"ask":["점검표 네 칸 중 ○를 몇 개 했어? 아직인 것은 어느 문제로 연습할까?"],"watch":"자기 점검을 다음 연습으로","min":4},
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
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "100이 5개이면?",
              "a": "500"
            },
            {
              "q": "백 4·십 5·일 3이면?",
              "a": "453"
            },
            {
              "q": "763과 736 중 큰 수?",
              "a": "763"
            }
          ],
          "self": [
            "단원 내용을 설명할 수 있어요",
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
      "lesson_format": "교사주도 — 생활 속 세 자리 수 찾기 → 수로 이야기 만들기 → 발표·비교 · 40분 표준 증보(7요소)"
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
          "content": "이 단원에서 배운 **세 자리 수**를 떠올려요.\n오늘은 생활 속에서 큰 수를 찾아 이야기를 만들어요.",
          "items": [
            {
              "q": "백 4·십 5·일 3이면?",
              "a": "453"
            },
            {
              "q": "367에서 백의 자리 값은?",
              "a": "300"
            }
          ],
          "from": "u1_l08"
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
        "img": "assets/photo/math/unit1_make.jpg",
        "kids": [{"face":"🐻","label":"곰이 \"책 권수, 나무 수, 걸음 수… 세 자리 수가 곳곳에 있네!\""},{"face":"🐧","label":"펭이 \"우리도 교실에서 찾아보자!\""}],
        "tnote": {"ask":["우리 주변 어디에 세 자리 수가 있을까?"],"watch":"실생활 연결 — 쪽수·번호·개수 · 책 쪽수·교실 번호·키 …","min":3},
          "scene_title": "우리 주변엔 수가 가득해요 🌳",
          "visual": "🌳",
          "question": "곰이와 펭이가 둘러보니 책 권수, 나무 수, 걸음 수까지<br>세 자리 수가 곳곳에 있어요. 어떤 수를 찾았을까요?"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "우리 주변 어디에 세 자리 수가 있을까?"
          ],
          "watch": "실생활 연결 — 쪽수·번호·개수",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["245를 세 가지 방법으로 말해 볼까?"],"watch":"백2십4일5 · 200+40+5 · 이백사십오","min":4},
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
        "tnote": {"ask":["500+10+2는 어떤 수? 백·십·일 자리에 뭘 쓸까?"],"watch":"512","min":4},
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
        "tnote": {"ask":["\"245를 이십사오\"라고 읽은 친구, 무엇을 빼먹었을까?"],"watch":"백·십·일 자리 이름 — 이백사십오","min":4},
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
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "우리 주변 세 자리 수 찾기",
          "type": "group",
          "goal": "생활 속에서 세 자리 수 발견",
          "steps": [
            "교실·책에서 세 자리 수 찾기",
            "찾은 수를 백·십·일로 나눠 읽기",
            "모둠에서 가장 큰 수 뽑기"
          ],
          "materials": [
            "찾기 기록장"
          ],
          "minutes": 5
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
        "tnote": {"ask":["백 2·십 4·일 5면? 읽어 볼까?"],"watch":"245","min":3},
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
        "tnote": {"ask":["245에서 백의 자리 숫자는? 그 숫자가 나타내는 값은?"],"watch":"2 — 200","min":3},
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
        "id": "s101",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["숫자 2·4·5로 가장 큰 세 자리 수와 가장 작은 수를 만들어 볼까?"],"watch":"542 · 245 — 큰 숫자를 백의 자리에","min":5},
          "title": "수 만들기",
          "levels": {
            "기본": {
              "q": "백 2·십 4·일 5이면 얼마일까요?",
              "a": "245",
              "steps": [
                "200+40+5"
              ]
            },
            "도전": {
              "q": "500+10+2가 나타내는 수는?",
              "a": "512",
              "steps": [
                "500+10+2"
              ]
            },
            "심화": {
              "q": "숫자 2·4·5로 만들 수 있는 세 자리 수 중 가장 큰 수와 가장 작은 수는?",
              "a": "가장 큰 542, 가장 작은 245",
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
        "tnote": {"ask":["펭이 걸음 수는 몇 걸음? 어떻게 세었어?"],"watch":"180 — 100씩·10씩","min":4},
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
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["1단원에서 새로 할 수 있게 된 것을 한 가지 말해 볼래?"],"watch":"자기 평가","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "백 2·십 4·일 5면?",
              "a": "245"
            },
            {
              "q": "500+10+2는?",
              "a": "512"
            },
            {
              "q": "245에서 백의 자리 숫자는?",
              "a": "2"
            }
          ],
          "self": [
            "세 자리 수를 만들고 설명할 수 있어요",
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
