/* ============================================================================
   2학년 1학기 수학 — 2단원 「여러 가지 도형」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u2_l{NN}"] (zero-pad). 교사주도 흐름(~12슬).
   - 학생 본 차시(grade2 .../2단원_여러가지도형/재수정_v1/*.html)의 검증된 개념·정답 계승.
   - 도형 단원 → 채점 문항(basic/real_world)은 변·꼭짓점·조각·쌓기나무 개수 등 number로 환원.
   - 성취기준 [2수03-02](쌓기나무)·[03](찾기·만들기)·[04](직관·그리기)·[05](공통점). 9차시(본 차시 01~09 대응).
   - 부품 흐름: cover/review/motivate/concept×2/misconception/basic_problem×3/real_world/summary/next_lesson + self_assessment(08차 평가).
   - g2_math.html이 window.LESSONS 객체에 누적. (g2_korean/u1/u3 패턴 — window.LESSONS+IIFE 양 레포 공통)
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  window.LESSONS["u2_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 1,
      "title": "여러 가지 도형을 찾아볼까요 (단원 도입)",
      "std": "[2수03-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 교실 속 세모·네모·동그라미 찾기 → 모양 분류 → 단원 예고 (1학년 언어) · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 도형을\n찾아볼까요",
          "subtitle": "2단원 · 1/9차시 · 단원 도입"
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
          "content": "우리는 1학년에서 **세모·네모·동그라미** 모양을 만났어요.\n이번 단원에서는 이 모양들을 더 자세히 알아봐요."
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
          "scene_title": "어떤 모양이 숨어 있을까요? 🔍",
          "visual": "🔍",
          "question": "곰이와 펭이가 교실을 둘러봐요. 시계, 창문, 표지판 …<br>우리 주변에는 어떤 모양들이 숨어 있을까요?",
          "img": "assets/photo/math/shapes_around.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "우리 교실 어디에 어떤 모양이 숨어 있을까?"
          ],
          "watch": "“둥글면 다 동그라미” 오개념 — 길쭉한 건 따로 봄",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "세모 · 네모 · 동그라미",
          "content": "뾰족한 곳이 3개인 **세모(△)**, 4개인 **네모(□)**, 둥근 **동그라미(○)**가 있어요.",
          "items": [
            {
              "emoji": "🔺",
              "count": 1,
              "label": "세모"
            },
            {
              "emoji": "🟦",
              "count": 1,
              "label": "네모"
            },
            {
              "emoji": "⚫",
              "count": 1,
              "label": "동그라미"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "세모·네모·동그라미는 무엇이 다를까?"
          ],
          "watch": "뾰족한 곳(꼭짓점) 개수로 구분하게 유도",
          "min": 2
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "생활 속에 모양이 있어요",
          "content": "표지판은 세모, 창문은 네모, 시계는 동그라미예요. **물건마다 모양**이 숨어 있어요."
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
          "wrong": "\"둥글면 다 동그라미예요\" — 길쭉한 모양도 동그라미라고 함",
          "right": "동그라미는 **어느 쪽에서 봐도 똑같이 둥근** 모양이에요. 길쭉하면 동그라미가 아니에요.",
          "hint": "공처럼 완전히 둥근 것과 달걀처럼 길쭉한 것을 비교해 보세요."
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
          "title": "교실에서 모양 찾기",
          "type": "pair",
          "goal": "세모·네모·동그라미를 실물에서 구분",
          "steps": [
            "짝과 교실을 둘러보기",
            "세모 · 네모 · 동그라미 물건을 하나씩 찾기",
            "“이건 왜 네모야?” 서로 설명하기"
          ],
          "materials": [
            "모양 찾기 기록장"
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
          "question": "교실 그림에서 세모(△)는 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 표지판·삼각자·옷걸이 → 세모 3개."
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
          "question": "칠판·문·창문은 모두 네모예요. 네모는 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 칠판·문·창문 → 네모 3개."
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
          "question": "시계·접시는 동그라미예요. 동그라미는 몇 개일까요?",
          "input": "count_input",
          "answer": 2,
          "note": "풀이: 시계·접시 → 동그라미 2개."
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
          "title": "곰이 공방 정리하기",
          "levels": {
            "기본": {
              "q": "뾰족한 곳이 세 군데인 모양의 이름은?",
              "a": "세모(삼각형)",
              "steps": [
                "꼭짓점 3개 세기"
              ]
            },
            "도전": {
              "q": "창문·문·칠판은 모두 어떤 모양일까요?",
              "a": "네모(사각형)",
              "steps": [
                "곧은 변 4개 확인"
              ]
            },
            "심화": {
              "q": "한 물건에서 세모·네모·동그라미를 모두 찾아 말해 봐요.",
              "a": "여러 답 (예: 시계=동그라미+숫자칸 네모 …)",
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
          "title": "교실 꾸미기 이야기",
          "scenario": {
            "icon": "🏫",
            "body": "곰이가 교실 게시판에 세모 모양 깃발을 4개 붙였어요."
          },
          "question": "게시판에 붙은 세모는 모두 몇 개일까요?",
          "answer": 4
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
              "q": "뾰족한 곳 3개인 모양은?",
              "a": "세모(삼각형)"
            },
            {
              "q": "곧은 변 4개인 모양은?",
              "a": "네모(사각형)"
            },
            {
              "q": "어느 쪽도 뾰족하지 않고 둥근 모양은?",
              "a": "동그라미(원)"
            }
          ],
          "self": [
            "세 가지 모양을 구분할 수 있어요",
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
            "우리 주변에는 **세모·네모·동그라미**가 가득해요.",
            "물건마다 숨은 모양을 찾을 수 있어요.",
            "이번 단원에서 도형을 자세히 알아봐요!"
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
          "preview": "삼각형을 알아보고 찾아볼까요",
          "body": "다음 시간에는 세모, 곧 **삼각형**의 변과 꼭짓점을 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 2,
      "title": "삼각형을 알아보고 찾아볼까요",
      "std": "[2수03-03], [2수03-04], [2수03-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 곧은 선 3개 → 변·꼭짓점 → 모양 달라도 삼각형 → 삼각형 아닌 경우 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "삼각형을\n알아보고 찾아볼까요",
          "subtitle": "2단원 · 2/9차시"
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
          "content": "지난 시간에 **세모** 모양을 찾았어요.\n오늘은 세모, 곧 **삼각형**을 자세히 알아봐요.",
          "items": [
            {
              "q": "뾰족한 곳 3개인 모양의 이름은?",
              "a": "세모(삼각형)"
            },
            {
              "q": "둥근 모양의 이름은?",
              "a": "동그라미(원)"
            }
          ],
          "from": "u2_l01"
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
          "scene_title": "어떤 모양이 보이나요? 🔺",
          "visual": "🔺",
          "question": "펭이가 삼각김밥, 옷걸이, 교통 표지판을 보여 줘요.<br>이 모양들의 공통점은 무엇일까요?",
          "img": "assets/photo/math/triangle_signs.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "길에서 본 삼각형 표지판은 무엇이 있었지?"
          ],
          "watch": "실생활 삼각형 연결",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "곧은 선 3개로 둘러싸인 도형",
          "content": "**곧은 선 3개**로 둘러싸인 도형이 **삼각형**이에요. 빈틈없이 닫혀 있어야 해요.",
          "items": [
            {
              "emoji": "📏",
              "count": 3,
              "label": "곧은 선 3개"
            },
            {
              "emoji": "🔺",
              "count": 1,
              "label": "삼각형"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "왜 한 군데라도 열리면 삼각형이 아닐까?"
          ],
          "watch": "“둘러싸인”의 뜻 강조 — 끊긴 모양과 구분",
          "min": 2
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "변과 꼭짓점",
          "content": "삼각형을 둘러싼 곧은 선을 **변**, 변과 변이 만나는 뾰족한 곳을 **꼭짓점**이라 해요. 삼각형은 **변 3개·꼭짓점 3개**예요."
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
          "wrong": "\"한 군데가 열려 있어도 삼각형이에요\" — 끊긴 모양을 삼각형이라 함",
          "right": "삼각형은 **빈틈없이 닫혀** 있어야 해요. 한 군데라도 열려 있으면 삼각형이 아니에요.",
          "hint": "곧은 선 3개가 서로 끝끼리 닿아 닫혔는지 확인하세요."
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
          "title": "막대로 삼각형 만들기",
          "type": "pair",
          "goal": "곧은 선 3개로 삼각형이 됨을 손으로",
          "steps": [
            "막대(또는 연필) 3개를 짝과 모으기",
            "끝끼리 맞대어 삼각형 만들기",
            "변 3개·꼭짓점 3개를 함께 세기"
          ],
          "materials": [
            "막대 또는 연필 3개"
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
          "question": "삼각형의 변은 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 삼각형의 변은 3개."
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
          "question": "삼각형의 꼭짓점은 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 삼각형의 꼭짓점은 3개."
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
          "question": "그림에서 삼각형을 모두 찾으면 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 곧은 선 3개로 닫힌 도형 → 삼각형 4개."
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
          "title": "펭이의 삼각형 조각",
          "levels": {
            "기본": {
              "q": "삼각형의 변은 모두 몇 개일까요?",
              "a": "3개",
              "steps": [
                "곧은 선 세기"
              ]
            },
            "도전": {
              "q": "삼각형의 꼭짓점은 모두 몇 개일까요?",
              "a": "3개",
              "steps": [
                "뾰족한 곳 세기"
              ]
            },
            "심화": {
              "q": "우리 주변에서 삼각형을 세 가지 찾아 말해 봐요.",
              "a": "여러 답 (예: 표지판·삼각김밥·옷걸이 …)",
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
          "title": "표지판 이야기",
          "scenario": {
            "icon": "🚧",
            "body": "곰이가 길에서 삼각형 표지판 5개를 보았어요."
          },
          "question": "삼각형 표지판은 모두 몇 개일까요?",
          "answer": 5
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
              "q": "삼각형의 변은 몇 개?",
              "a": "3개"
            },
            {
              "q": "삼각형의 꼭짓점은 몇 개?",
              "a": "3개"
            },
            {
              "q": "한 곳이 열려 있으면 삼각형일까요?",
              "a": "아니요(둘러싸여야 함)"
            }
          ],
          "self": [
            "삼각형을 설명할 수 있어요",
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
            "**곧은 선 3개**로 둘러싸인 닫힌 도형이 삼각형이에요.",
            "삼각형은 **변 3개·꼭짓점 3개**예요.",
            "모양이 달라도 조건만 맞으면 삼각형이에요!"
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
          "preview": "사각형을 알아보고 찾아볼까요",
          "body": "다음 시간에는 곧은 선 4개로 된 **사각형**을 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 3,
      "title": "사각형을 알아보고 찾아볼까요",
      "std": "[2수03-03], [2수03-04], [2수03-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 곧은 선 4개 → 변·꼭짓점 4개 → 삼각형과 비교 → 분류 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "사각형을\n알아보고 찾아볼까요",
          "subtitle": "2단원 · 3/9차시"
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
          "content": "지난 시간에 **삼각형**(변 3·꼭짓점 3)을 배웠어요.\n오늘은 곧은 선이 하나 더 많은 **사각형**을 알아봐요.",
          "items": [
            {
              "q": "삼각형의 변은 몇 개?",
              "a": "3개"
            },
            {
              "q": "삼각형의 꼭짓점은 몇 개?",
              "a": "3개"
            }
          ],
          "from": "u2_l02"
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
          "scene_title": "어떤 모양이 보이나요? 🟦",
          "visual": "🟦",
          "question": "곰이가 책, 창문, 칠판을 가리켜요.<br>이 모양들은 곧은 선이 몇 개로 둘러싸여 있을까요?",
          "img": "assets/photo/math/window_squares.jpg"
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
          "title": "곧은 선 4개로 둘러싸인 도형",
          "content": "**곧은 선 4개**로 빈틈없이 둘러싸인 도형이 **사각형**이에요.",
          "items": [
            {
              "emoji": "📏",
              "count": 4,
              "label": "곧은 선 4개"
            },
            {
              "emoji": "🟦",
              "count": 1,
              "label": "사각형"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "삼각형과 사각형은 무엇이 다를까?"
          ],
          "watch": "변·꼭짓점 개수 차이(3↔4)로 구분",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "사각형은 변 4개·꼭짓점 4개",
          "content": "사각형은 **변 4개·꼭짓점 4개**예요. 삼각형보다 변과 꼭짓점이 **1개씩 더 많아요**."
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
          "wrong": "\"네모반듯한 것만 사각형이에요\" — 기울거나 길쭉하면 사각형이 아니라고 함",
          "right": "곧은 선 4개로 닫혀 있으면 **모양이 달라도 모두 사각형**이에요.",
          "hint": "변과 꼭짓점이 각각 4개인지 세어 보세요."
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
          "question": "사각형의 변은 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 사각형의 변은 4개."
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
          "question": "사각형의 꼭짓점은 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 사각형의 꼭짓점은 4개."
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
          "question": "사각형은 삼각형보다 변이 몇 개 더 많을까요?",
          "input": "count_input",
          "answer": 1,
          "note": "풀이: 4-3=1. 사각형이 변 1개 더 많아요."
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
          "title": "곰이의 네모 창문",
          "levels": {
            "기본": {
              "q": "사각형의 변은 모두 몇 개일까요?",
              "a": "4개",
              "steps": [
                "곧은 선 세기"
              ]
            },
            "도전": {
              "q": "사각형은 삼각형보다 변이 몇 개 더 많을까요?",
              "a": "1개",
              "steps": [
                "4-3"
              ]
            },
            "심화": {
              "q": "기울거나 길쭉해도 사각형인 까닭을 말해 봐요.",
              "a": "여러 답 (곧은 변 4개·꼭짓점 4개면 사각형)",
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
          "title": "창문 이야기",
          "scenario": {
            "icon": "🪟",
            "body": "펭이의 집에 사각형 창문이 6개 있어요."
          },
          "question": "사각형 창문은 모두 몇 개일까요?",
          "answer": 6
        },
        "suggested_extras": [
          "q_apply"
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
              "q": "사각형의 변은 몇 개?",
              "a": "4개"
            },
            {
              "q": "사각형의 꼭짓점은 몇 개?",
              "a": "4개"
            },
            {
              "q": "네모반듯한 것만 사각형일까요?",
              "a": "아니요(변 4개면 사각형)"
            }
          ],
          "self": [
            "사각형을 설명할 수 있어요",
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
            "**곧은 선 4개**로 둘러싸인 닫힌 도형이 사각형이에요.",
            "사각형은 **변 4개·꼭짓점 4개**예요.",
            "삼각형보다 변·꼭짓점이 1개씩 더 많아요!"
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
          "preview": "원을 알아보고 찾아볼까요",
          "body": "다음 시간에는 곧은 선이 없는 **원**을 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 4,
      "title": "원을 알아보고 찾아볼까요",
      "std": "[2수03-03], [2수03-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 어디서 봐도 둥근 도형 → 곧은 선·꼭짓점 0 → 원과 길쭉한 모양 구별 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "원을\n알아보고 찾아볼까요",
          "subtitle": "2단원 · 4/9차시"
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
          "content": "지난 시간까지 **삼각형·사각형**(곧은 선·꼭짓점이 있는 도형)을 배웠어요.\n오늘은 곧은 선이 **없는** 도형, **원**을 알아봐요.",
          "items": [
            {
              "q": "사각형의 변은 몇 개?",
              "a": "4개"
            },
            {
              "q": "사각형의 꼭짓점은 몇 개?",
              "a": "4개"
            }
          ],
          "from": "u2_l03"
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
          "scene_title": "어떤 모양이 보이나요? ⚫",
          "visual": "⚫",
          "question": "곰이가 동전, 시계, 접시를 보여 줘요.<br>이 모양들은 삼각형·사각형과 무엇이 다를까요?",
          "img": "assets/photo/math/circle_buttons.jpg"
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
          "title": "어느 곳에서 봐도 둥근 도형",
          "content": "**어느 쪽에서 봐도 똑같이 둥근** 도형이 **원**이에요. 동전·시계·바퀴가 원이에요.",
          "items": [
            {
              "emoji": "⚫",
              "count": 1,
              "label": "원"
            },
            {
              "emoji": "🪙",
              "count": 1,
              "label": "동전"
            },
            {
              "emoji": "🕐",
              "count": 1,
              "label": "시계"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "원은 삼각형·사각형과 무엇이 가장 다를까?"
          ],
          "watch": "곧은 선·꼭짓점이 “없다”는 점을 또렷이",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "원에는 곧은 선이 없어요",
          "content": "원에는 **곧은 선이 0개, 꼭짓점도 0개**예요. 모두 둥근 곡선으로 이어져 있어요. 크기가 달라도 모두 원이에요."
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
          "wrong": "\"길쭉한 모양도 원이에요\" — 달걀 모양을 원이라 함",
          "right": "원은 어느 쪽에서 봐도 똑같이 둥글어야 해요. **한쪽으로 길쭉하면 원이 아니에요**.",
          "hint": "동그란 원과 길쭉한 달걀 모양을 나란히 두고 비교하세요."
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
          "question": "원에는 곧은 선이 몇 개 있을까요?",
          "input": "count_input",
          "answer": 0,
          "note": "풀이: 원에는 곧은 선이 없어요 → 0개."
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
          "question": "원에는 꼭짓점이 몇 개 있을까요?",
          "input": "count_input",
          "answer": 0,
          "note": "풀이: 원에는 꼭짓점이 없어요 → 0개."
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
          "question": "그림에서 원을 모두 찾으면 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 어느 쪽에서 봐도 둥근 도형 → 원 3개."
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
          "title": "펭이의 동그란 단추",
          "levels": {
            "기본": {
              "q": "원에는 곧은 선이 몇 개 있을까요?",
              "a": "0개(없어요)",
              "steps": [
                "곧은 변 찾기"
              ]
            },
            "도전": {
              "q": "원에는 꼭짓점이 몇 개 있을까요?",
              "a": "0개(없어요)",
              "steps": [
                "뾰족한 곳 찾기"
              ]
            },
            "심화": {
              "q": "달걀 모양이 원이 아닌 까닭을 말해 봐요.",
              "a": "여러 답 (어느 쪽에서 봐도 똑같이 둥글지 않음)",
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
          "title": "단추 이야기",
          "scenario": {
            "icon": "🔵",
            "body": "펭이가 옷에 원 모양 단추 5개를 달았어요."
          },
          "question": "원 모양 단추는 모두 몇 개일까요?",
          "answer": 5
        },
        "suggested_extras": [
          "q_apply"
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
              "q": "원에는 곧은 선이 몇 개?",
              "a": "0개"
            },
            {
              "q": "원에는 꼭짓점이 몇 개?",
              "a": "0개"
            },
            {
              "q": "길쭉한 모양도 원일까요?",
              "a": "아니요"
            }
          ],
          "self": [
            "원을 설명할 수 있어요",
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
            "**어느 쪽에서 봐도 둥근** 도형이 원이에요.",
            "원에는 **곧은 선과 꼭짓점이 없어요(0개)**.",
            "크기가 달라도 모두 원이에요!"
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
          "preview": "칠교판으로 모양을 만들어 볼까요",
          "body": "다음 시간에는 7조각 **칠교판**으로 여러 모양을 만들어요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 5,
      "title": "칠교판으로 모양을 만들어 볼까요",
      "std": "[2수03-03], [2수03-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 칠교 7조각(삼각형5·사각형2) → 조각 모아 도형 만들기 → 작품 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "칠교판으로\n모양을 만들어 볼까요",
          "subtitle": "2단원 · 5/9차시"
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
          "content": "지난 시간까지 **삼각형·사각형·원**을 배웠어요.\n오늘은 도형 조각으로 새 모양을 만드는 **칠교판**을 알아봐요.",
          "items": [
            {
              "q": "원에는 곧은 선이 몇 개?",
              "a": "0개"
            },
            {
              "q": "사각형의 변은 몇 개?",
              "a": "4개"
            }
          ],
          "from": "u2_l04"
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
          "scene_title": "어떤 모양들이 보이나요? 🧩",
          "visual": "🧩",
          "question": "곰이가 일곱 조각으로 된 퍼즐을 펼쳐요.<br>이 조각들로 무엇을 만들 수 있을까요?",
          "img": "assets/photo/math/tangram_pieces.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "칠교 7조각으로 무엇을 만들어 볼까?"
          ],
          "watch": "“조각은 다 삼각형” 오개념 — 사각형 조각 2개 짚기",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "칠교판은 7조각이에요",
          "content": "칠교판은 모두 **7조각**이에요. **삼각형 5조각, 사각형 2조각**으로 이루어져 있어요.",
          "items": [
            {
              "emoji": "🔺",
              "count": 5,
              "label": "삼각형 5조각"
            },
            {
              "emoji": "🟦",
              "count": 2,
              "label": "사각형 2조각"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "조각을 어떻게 붙이면 큰 모양이 될까?"
          ],
          "watch": "조각 모으기 = 새 도형 만들기로 연결",
          "min": 2
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "조각을 모아 도형을 만들어요",
          "content": "작은 **삼각형 조각 2개**를 모으면 더 큰 삼각형이나 사각형을 만들 수 있어요. 조각을 붙여 여러 모양을 만들어요."
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
          "wrong": "\"칠교판 조각은 모두 삼각형이에요\" — 사각형 조각을 빠뜨림",
          "right": "칠교판에는 **삼각형 5조각과 사각형 2조각**이 있어요. 사각형도 들어 있어요.",
          "hint": "조각을 삼각형과 사각형으로 나누어 세어 보세요."
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
          "title": "칠교로 곰이 집 만들기",
          "type": "group",
          "goal": "7조각을 모아 새 모양을 만들기",
          "steps": [
            "칠교 7조각을 모둠이 펼치기",
            "조각을 맞대어 집·배 모양 만들기",
            "어떤 조각을 몇 개 썼는지 말하기"
          ],
          "materials": [
            "칠교판 세트"
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
          "question": "칠교판은 모두 몇 조각일까요?",
          "input": "count_input",
          "answer": 7,
          "note": "풀이: 칠교판은 7조각."
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
          "question": "칠교판에서 삼각형 조각은 몇 개일까요?",
          "input": "count_input",
          "answer": 5,
          "note": "풀이: 삼각형 조각 5개."
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
          "question": "칠교판에서 사각형 조각은 몇 개일까요?",
          "input": "count_input",
          "answer": 2,
          "note": "풀이: 7-5=2. 사각형 조각 2개."
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
          "title": "칠교 조각 세기",
          "levels": {
            "기본": {
              "q": "칠교판은 모두 몇 조각일까요?",
              "a": "7조각",
              "steps": [
                "조각 세기"
              ]
            },
            "도전": {
              "q": "칠교판의 삼각형 5개와 사각형 2개를 합하면 몇 조각일까요?",
              "a": "7조각",
              "steps": [
                "5+2"
              ]
            },
            "심화": {
              "q": "칠교 조각으로 만들 수 있는 모양을 여러 가지 말해 봐요.",
              "a": "여러 답 (집·배·사람·고양이 …)",
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
          "title": "집 만들기 이야기",
          "scenario": {
            "icon": "🏠",
            "body": "펭이가 칠교 조각으로 집을 만들었어요. 삼각형 3조각과 사각형 1조각을 썼어요."
          },
          "question": "집을 만드는 데 쓴 조각은 모두 몇 개일까요?",
          "answer": 4
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
              "q": "칠교판은 몇 조각?",
              "a": "7조각"
            },
            {
              "q": "칠교판의 삼각형 조각은 몇 개?",
              "a": "5개"
            },
            {
              "q": "칠교판의 사각형 조각은 몇 개?",
              "a": "2개"
            }
          ],
          "self": [
            "칠교로 모양을 만들 수 있어요",
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
            "칠교판은 **7조각**(삼각형 5·사각형 2)이에요.",
            "조각을 모아 더 큰 삼각형·사각형을 만들 수 있어요.",
            "여러 조각으로 다양한 모양을 만들어요!"
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
          "preview": "쌓은 모양을 알아볼까요",
          "body": "다음 시간에는 평면을 넘어 **쌓기나무**로 입체 모양을 만들어요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 6,
      "title": "쌓은 모양을 알아볼까요",
      "std": "[2수03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 평면→입체 · 쌓기나무 면 맞대기 · 개수·위치·방향으로 설명 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "쌓은 모양을\n알아볼까요",
          "subtitle": "2단원 · 6/9차시 · 입체 첫 등장"
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
          "content": "지난 시간까지 평면 도형(삼각형·사각형·원·칠교)을 배웠어요.\n오늘은 평면을 넘어 **쌓기나무**로 입체 모양을 만들어요.",
          "items": [
            {
              "q": "칠교판은 몇 조각?",
              "a": "7조각"
            },
            {
              "q": "삼각형의 꼭짓점은 몇 개?",
              "a": "3개"
            }
          ],
          "from": "u2_l05"
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
          "scene_title": "평면에서 입체로! 🧱",
          "visual": "🧱",
          "question": "곰이가 쌓기나무를 차곡차곡 쌓아요.<br>쌓은 모양은 어떻게 셈하고 설명할 수 있을까요?",
          "img": "assets/photo/math/stacking_blocks.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "블록으로 무엇을 쌓아 봤니?"
          ],
          "watch": "개수·위치·방향으로 설명하도록",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "면과 면을 맞대어 반듯하게",
          "content": "쌓기나무는 **면과 면을 맞대어 반듯하게** 쌓아요. 그래야 모양이 흔들리지 않아요.",
          "items": [
            {
              "emoji": "🧱",
              "count": 3,
              "label": "아래층 3개"
            },
            {
              "emoji": "🧱",
              "count": 1,
              "label": "위 1개"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "안 보이는 나무는 어떻게 알 수 있을까?"
          ],
          "watch": "가려진 나무 빠뜨리는 오개념 교정",
          "min": 2
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "개수·위치·방향으로 설명해요",
          "content": "쌓은 모양은 **쌓기나무 개수**, 어디에 있는지(**위치**), 어느 쪽인지(**방향**)으로 설명해요. 예: '아래 3개, 그 위 오른쪽에 1개'."
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
          "wrong": "\"보이는 면만 세면 돼요\" — 뒤에 가려진 쌓기나무를 빠뜨림",
          "right": "가려져서 안 보여도 **받치고 있는 쌓기나무까지 모두** 세어야 해요.",
          "hint": "맨 위 나무를 받치는 아래 나무가 있는지 확인하세요."
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
          "title": "쌓기나무 개수 세기",
          "type": "pair",
          "goal": "가려진 나무까지 빠짐없이 세기",
          "steps": [
            "짝이 쌓은 모양을 관찰하기",
            "아래층부터 위층까지 층별로 세기",
            "뒤에 가려진 나무가 있는지 확인하기"
          ],
          "materials": [
            "쌓기나무"
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
          "question": "아래층에 4개, 그 위에 2개를 쌓으면 쌓기나무는 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 6,
          "note": "풀이: 4+2=6개."
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
          "question": "쌓기나무 3개를 옆으로 나란히 쌓으면 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 한 줄로 3개."
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
          "question": "아래층 4개 위에 1개를 올리면 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 5,
          "note": "풀이: 4+1=5개."
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
          "title": "곰이의 블록 탑",
          "levels": {
            "기본": {
              "q": "아래층 4개, 그 위에 2개를 쌓으면 모두 몇 개일까요?",
              "a": "6개",
              "steps": [
                "4+2"
              ]
            },
            "도전": {
              "q": "아래층 4개, 그 위에 1개를 쌓으면 모두 몇 개일까요?",
              "a": "5개",
              "steps": [
                "4+1"
              ]
            },
            "심화": {
              "q": "뒤에 가려진 나무가 있을 때 어떻게 세면 좋을지 말해 봐요.",
              "a": "여러 답 (층별로·앞뒤 확인하며 세기)",
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
          "title": "블록 이야기",
          "scenario": {
            "icon": "🧱",
            "body": "펭이가 아래층에 5개, 그 위에 1개를 쌓았어요."
          },
          "question": "쌓기나무는 모두 몇 개일까요?",
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
              "q": "아래 4개 위에 2개면 모두?",
              "a": "6개"
            },
            {
              "q": "나무 3개를 나란히 놓으면?",
              "a": "3개"
            },
            {
              "q": "보이는 면만 세면 될까요?",
              "a": "아니요(가려진 것도 셈)"
            }
          ],
          "self": [
            "쌓기나무 개수를 셀 수 있어요",
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
            "쌓기나무는 **면과 면을 맞대어 반듯하게** 쌓아요.",
            "가려진 나무까지 모두 세어야 해요.",
            "개수·위치·방향으로 쌓은 모양을 설명해요!"
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
          "preview": "여러 가지 모양으로 쌓아 볼까요",
          "body": "다음 시간에는 같은 개수로 **여러 가지 모양**을 만들어요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 7,
      "title": "여러 가지 모양으로 쌓아 볼까요",
      "std": "[2수03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 같은 개수 여러 모양 · 층 개념 · 같은 점/다른 점 · 건물 만들기 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 모양으로\n쌓아 볼까요",
          "subtitle": "2단원 · 7/9차시"
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
          "content": "지난 시간에 쌓기나무의 **개수·위치·방향**을 배웠어요.\n오늘은 같은 개수로 **여러 가지 모양**을 만들어요.",
          "items": [
            {
              "q": "아래 4개 위에 2개면 모두?",
              "a": "6개"
            },
            {
              "q": "보이는 면만 세면 될까요?",
              "a": "아니요"
            }
          ],
          "from": "u2_l06"
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
          "scene_title": "같은 개수, 다른 모양! 🏗️",
          "visual": "🏗️",
          "question": "곰이와 펭이가 쌓기나무 4개씩 가지고 서로 다른 모양을 만들었어요.<br>개수가 같아도 모양이 다를 수 있을까요?",
          "img": "assets/photo/math/block_shapes.jpg"
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
          "title": "쌓기나무 4개로 여러 모양",
          "content": "쌓기나무 **4개**로도 한 줄, ㄴ자, 2층 등 **여러 가지 모양**을 만들 수 있어요. 개수가 같아도 쌓는 방법이 달라요.",
          "items": [
            {
              "emoji": "🧱",
              "count": 3,
              "label": "1층 3개"
            },
            {
              "emoji": "🧱",
              "count": 1,
              "label": "2층 1개"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "모양은 달라도 왜 개수는 같을까?"
          ],
          "watch": "“모양 다르면 개수도 다르다” 오개념 교정 — 세어 확인",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "층으로 설명해요",
          "content": "쌓기나무를 위로 쌓으면 **1층·2층**이 생겨요. 아래가 1층, 그 위가 2층이에요. 층으로도 모양을 설명할 수 있어요."
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
          "wrong": "\"모양이 다르면 개수도 달라요\" — 모양만 보고 개수가 다르다고 함",
          "right": "모양이 달라도 **쌓기나무 개수는 같을 수 있어요**. 개수는 직접 세어 봐야 알아요.",
          "hint": "두 모양의 쌓기나무를 하나씩 세어 비교하세요."
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
          "title": "나무 4개로 여러 모양 쌓기",
          "type": "pair",
          "goal": "같은 4개로 다른 모양 만들기",
          "steps": [
            "쌓기나무 4개를 짝과 나눠 갖기",
            "한 줄·ㄱ자·2층 등 서로 다르게 쌓기",
            "모양은 달라도 개수는 4개로 같음을 확인"
          ],
          "materials": [
            "쌓기나무 4개"
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
          "question": "1층에 3개, 2층에 1개를 쌓으면 쌓기나무는 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 3+1=4개."
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
          "question": "쌓기나무 4개를 한 줄로 늘어놓으면 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 한 줄 4개. 모양은 달라도 개수는 4개로 같아요."
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
          "question": "1층에 4개, 2층에 1개로 건물을 지으면 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 5,
          "note": "풀이: 4+1=5개."
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
          "title": "펭이의 건물 짓기",
          "levels": {
            "기본": {
              "q": "1층에 3개, 2층에 1개를 쌓으면 모두 몇 개일까요?",
              "a": "4개",
              "steps": [
                "3+1"
              ]
            },
            "도전": {
              "q": "1층에 4개, 2층에 1개로 지으면 모두 몇 개일까요?",
              "a": "5개",
              "steps": [
                "4+1"
              ]
            },
            "심화": {
              "q": "나무 4개로 만들 수 있는 서로 다른 모양을 말해 봐요.",
              "a": "여러 답 (한 줄·ㄱ자·2층 …)",
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
          "title": "건물 이야기",
          "scenario": {
            "icon": "🏢",
            "body": "펭이가 1층에 4개, 2층에 2개로 건물을 지었어요."
          },
          "question": "건물에 쓴 쌓기나무는 모두 몇 개일까요?",
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
              "q": "1층 3개 2층 1개면 모두?",
              "a": "4개"
            },
            {
              "q": "나무 4개를 한 줄로 놓으면?",
              "a": "4개"
            },
            {
              "q": "모양이 다르면 개수도 달라질까요?",
              "a": "아니요(개수는 그대로)"
            }
          ],
          "self": [
            "여러 모양을 쌓고 설명할 수 있어요",
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
            "같은 개수로도 **여러 가지 모양**을 만들 수 있어요.",
            "위로 쌓으면 **1층·2층**이 생겨요.",
            "모양이 달라도 개수는 같을 수 있어요!"
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
          "body": "다음 시간에는 단원에서 배운 도형을 모두 **확인**해요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 8,
      "title": "수학이랑 확인해요",
      "std": "[2수03-02], [2수03-03], [2수03-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 단원 평가(삼각형·사각형·원·칠교·쌓기나무) · 자기 평가 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n확인해요",
          "subtitle": "2단원 · 8/9차시 · 단원 평가"
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
          "content": "이 단원에서 **삼각형·사각형·원·칠교판·쌓기나무**를 배웠어요.\n오늘은 모두 확인해 봐요.",
          "items": [
            {
              "q": "1층 3개 2층 1개면 모두?",
              "a": "4개"
            },
            {
              "q": "나무 4개를 한 줄로 놓으면?",
              "a": "4개"
            }
          ],
          "from": "u2_l07"
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
          "scene_title": "얼마나 알게 됐나요? ✅",
          "visual": "✅",
          "question": "곰이와 펭이가 단원을 마무리해요.<br>배운 도형을 하나씩 점검해 볼까요?",
          "img": "assets/photo/math/shape_review.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "이번 단원에서 가장 기억에 남는 도형은?"
          ],
          "watch": "자기 점검(self_assessment)과 연결",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "단원에서 배운 것",
          "content": "① **삼각형**(변·꼭짓점 3) ② **사각형**(변·꼭짓점 4) ③ **원**(곧은 선·꼭짓점 0) ④ **칠교판**(7조각) ⑤ **쌓기나무**(개수·층). 차례로 확인해요."
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "삼각형·사각형·원을 한 문장으로 어떻게 구분할까?"
          ],
          "watch": "변·꼭짓점 개수로 정리",
          "min": 2
        }
      },
      {
        "id": "s100",
        "stage": "전개",
        "block": "offline_activity",
        "data": {
          "title": "짝과 도형 퀴즈",
          "type": "pair",
          "goal": "배운 도형을 서로 묻고 답하기",
          "steps": [
            "짝에게 도형 문제 하나 내기(예: “삼각형 변은?”)",
            "짝이 답하면 맞는지 확인",
            "역할을 바꿔 한 번 더"
          ],
          "materials": [
            "도형 그림 카드"
          ],
          "minutes": 3
        },
        "suggested_extras": [
          "r_class"
        ]
      },
      {
        "id": "s05",
        "stage": "기본문제",
        "block": "basic_problem",
        "data": {
          "title": "확인 ① 삼각형",
          "question": "삼각형의 꼭짓점은 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 삼각형의 꼭짓점은 3개."
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
          "title": "확인 ② 사각형",
          "question": "사각형의 변은 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 사각형의 변은 4개."
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
          "title": "확인 ③ 원",
          "question": "원에는 곧은 선이 몇 개 있을까요?",
          "input": "count_input",
          "answer": 0,
          "note": "풀이: 원에는 곧은 선이 없어요 → 0개."
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
          "title": "확인 ④ 쌓기나무",
          "question": "아래층 3개, 그 위에 1개를 쌓으면 쌓기나무는 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 3+1=4개."
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
          "title": "모양 공방 총정리",
          "levels": {
            "기본": {
              "q": "삼각형의 꼭짓점과 사각형의 변은 각각 몇 개일까요?",
              "a": "삼각형 꼭짓점 3개 · 사각형 변 4개",
              "steps": [
                "각각 세기"
              ]
            },
            "도전": {
              "q": "원의 곧은 선 개수와 칠교판 조각 수를 말해 봐요.",
              "a": "원 곧은 선 0개 · 칠교 7조각",
              "steps": [
                "특징 떠올리기"
              ]
            },
            "심화": {
              "q": "오늘 배운 도형 중 하나를 골라 친구에게 설명하는 말을 만들어 봐요.",
              "a": "여러 답 (도형 이름·변·꼭짓점 포함)",
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
          "title": "칠교 이야기",
          "scenario": {
            "icon": "🧩",
            "body": "곰이가 칠교판 7조각을 모두 꺼냈어요."
          },
          "question": "칠교판의 조각은 모두 몇 개일까요?",
          "answer": 7
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
            "삼각형·사각형·원을 구별할 수 있어요",
            "변과 꼭짓점의 수를 셀 수 있어요",
            "칠교 조각으로 모양을 만들 수 있어요",
            "쌓은 모양의 쌓기나무 개수를 셀 수 있어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
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
              "q": "삼각형의 꼭짓점은 몇 개?",
              "a": "3개"
            },
            {
              "q": "사각형의 변은 몇 개?",
              "a": "4개"
            },
            {
              "q": "원에는 곧은 선이 몇 개?",
              "a": "0개"
            }
          ],
          "self": [
            "배운 도형을 확인했어요",
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
            "단원에서 배운 도형을 모두 확인했어요.",
            "틀린 부분은 다시 한 번 살펴보면 돼요. 잘했어요! 👏"
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
          "body": "다음 시간에는 배운 도형으로 직접 **게시판을 꾸며요**!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

  window.LESSONS["u2_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "수학",
      "unit": 2,
      "n": 9,
      "title": "수학이랑 만들어요",
      "std": "[2수03-03], [2수03-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 — 도형으로 게시판 꾸미기 → 모양 모아 새 모양 → 발표·비교 · 40분 표준 증보(7요소)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "수학이랑\n만들어요",
          "subtitle": "2단원 · 9/9차시 · 단원 마무리"
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
          "content": "이 단원에서 배운 **삼각형·사각형·원**을 떠올려요.\n오늘은 도형으로 게시판을 꾸며 봐요.",
          "items": [
            {
              "q": "삼각형의 꼭짓점은 몇 개?",
              "a": "3개"
            },
            {
              "q": "칠교판은 몇 조각?",
              "a": "7조각"
            }
          ],
          "from": "u2_l08"
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
          "scene_title": "도형으로 게시판을 꾸며 봐요 🎨",
          "visual": "🎨",
          "question": "곰이와 펭이가 도형 색종이로 게시판을 꾸며요.<br>어떤 모양으로 무엇을 만들 수 있을까요?",
          "img": "assets/photo/math/shape_craft.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ],
        "tnote": {
          "ask": [
            "어떤 작품을 만들어 볼까?"
          ],
          "watch": "작품 속에서 배운 도형을 찾게 연결",
          "min": 3
        }
      },
      {
        "id": "s04",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "도형을 모아 새 모양을 만들어요",
          "content": "**삼각형 2개**를 모으면 사각형이 되고, 여러 도형을 모으면 집·나무·꽃을 만들 수 있어요.",
          "items": [
            {
              "emoji": "🔺",
              "count": 2,
              "label": "삼각형 2개"
            },
            {
              "emoji": "🟦",
              "count": 1,
              "label": "→ 사각형"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "색종이를 자를 때 무엇을 확인해야 삼각형이 될까?"
          ],
          "watch": "곧은 선·꼭짓점 수 확인 — 오개념 교정",
          "min": 2
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
          "title": "도형으로 무엇이든 만들어요",
          "content": "세모로 지붕, 네모로 벽, 동그라미로 창문 … 배운 도형을 합쳐 멋진 작품을 만들 수 있어요."
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
          "wrong": "\"색종이를 아무렇게나 자르면 삼각형이에요\" — 곧은 선·꼭짓점 수를 확인 안 함",
          "right": "삼각형은 **곧은 선 3개·꼭짓점 3개**여야 해요. 자른 뒤 변과 꼭짓점을 세어 확인해요.",
          "hint": "만든 모양의 변과 꼭짓점 수를 세어 어떤 도형인지 확인하세요."
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
          "title": "도형으로 작품 만들기",
          "type": "group",
          "goal": "여러 도형을 모아 하나의 작품 완성",
          "steps": [
            "만들 작품을 모둠이 정하기(집·로봇·동물 …)",
            "색종이를 세모·네모·동그라미로 오리기",
            "조각을 붙여 작품을 완성하고 쓴 도형을 말하기"
          ],
          "materials": [
            "색종이",
            "가위",
            "풀"
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
          "question": "게시판에 세모 깃발을 3개 붙였어요. 세모는 모두 몇 개일까요?",
          "input": "count_input",
          "answer": 3,
          "note": "풀이: 세모 3개."
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
          "question": "삼각형 2개를 모아 만든 사각형의 변은 몇 개일까요?",
          "input": "count_input",
          "answer": 4,
          "note": "풀이: 사각형의 변은 4개."
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
          "question": "동그라미 모양 단추를 5개 붙이면 동그라미는 몇 개일까요?",
          "input": "count_input",
          "answer": 5,
          "note": "풀이: 동그라미 5개."
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
          "title": "곰이·펭이의 모양 공방 완성작",
          "levels": {
            "기본": {
              "q": "게시판에 세모 깃발 3개를 붙이면 세모는 모두 몇 개일까요?",
              "a": "3개",
              "steps": [
                "깃발 세기"
              ]
            },
            "도전": {
              "q": "세모 2개와 네모 2개로 집을 만들면 도형은 모두 몇 개일까요?",
              "a": "4개",
              "steps": [
                "2+2"
              ]
            },
            "심화": {
              "q": "내가 만든 작품에 어떤 도형을 몇 개 썼는지 설명해 봐요.",
              "a": "여러 답 (도형 이름·개수 포함)",
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
          "title": "작품 이야기",
          "scenario": {
            "icon": "🖼️",
            "body": "펭이가 도형 작품에 삼각형 3개와 사각형 2개를 붙였어요."
          },
          "question": "작품에 쓴 도형은 모두 몇 개일까요?",
          "answer": 5
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
              "q": "세모 깃발 3개면 세모는 모두?",
              "a": "3개"
            },
            {
              "q": "세모 2개와 네모 2개면 도형은 모두?",
              "a": "4개"
            },
            {
              "q": "색종이를 아무렇게나 잘라도 삼각형일까요?",
              "a": "아니요(곧은 변 3개여야 함)"
            }
          ],
          "self": [
            "도형으로 작품을 만들 수 있어요",
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
            "배운 도형을 모아 **새 모양·작품**을 만들 수 있어요.",
            "삼각형 2개를 모으면 사각형이 돼요.",
            "2단원을 모두 마쳤어요. 정말 잘했어요! 🎉"
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
          "preview": "3단원 덧셈과 뺄셈",
          "body": "다음 단원에서는 더 큰 수의 **덧셈과 뺄셈**을 배워요."
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ]
  };

})();
