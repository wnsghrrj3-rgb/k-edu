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
      "lesson_format": "교사주도 — 곰이·펭이 정리 동기 → 같은 것끼리 모으기 직관 → 1학년 복습 → 단원 예고 · 40분 표준 증보(4요소)"
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
        "kids": [{"face":"🐻","label":"곰이 \"옷이랑 책이랑 장난감이 다 섞여서 내 공을 못 찾겠어!\""},{"face":"🐧","label":"펭이 \"같은 것끼리 모아 보면 어떨까?\""}],
        "tnote": {"ask":["곰이 방을 어떻게 정리하면 공을 바로 찾을 수 있을까?"],"watch":"\"같은 것끼리\"라는 말이 나올 때까지","min":3},
          "scene_title": "곰이 방이 어질러졌어요 🧸",
          "visual": "🐻",
          "question": "곰이 방에 옷·책·장난감이 마구 흩어져 있어요.<br>찾고 싶은 걸 못 찾아 곰이가 속상해요. 어떻게 정리하면 좋을까요?",
          "img": "assets/photo/math/sort_intro.jpg"
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
        "tnote": {"ask":["흩어진 물건을 어떻게 하면 깔끔해질까?","흩어진 물건을 어떻게 하면 깔끔해질까? 옷은 어디에, 책은 어디에?"],"watch":"같은 것끼리 모으는 직관 세우기 · 같은 것끼리","min":4},
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
        ],
        "tnote": {
          "ask": [
            "흩어진 물건을 어떻게 하면 깔끔해질까?"
          ],
          "watch": "같은 것끼리 모으는 직관 세우기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["정리하면 뭐가 좋아? 정리 안 하면 무슨 일이 생겨?"],"watch":"찾기 쉬움·깔끔","min":3},
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
        "tnote": {"ask":["아무 데나 빨리 넣으면 정리일까? 다음에 또 찾을 수 있어?"],"watch":"섞이면 못 찾음","min":4},
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
        "tnote": {"ask":["곰 인형은 몇 개? 어떻게 세었어?"],"watch":"3 — 하나씩","min":3},
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
        "tnote": {"ask":["학용품 중 연필만 모으면 몇 자루? 지우개는 왜 안 세었어?"],"watch":"4 — 연필끼리","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["내 책상 위 물건을 같은 것끼리 모으면 몇 묶음이 될까?"],"watch":"학용품·책·기타","min":5},
          "title": "같은 것끼리 모으기",
          "levels": {
            "기본": {
              "q": "흩어진 물건을 정리하려면 어떻게 하면 좋을까요?",
              "a": "같은 것끼리 모아요",
              "steps": [
                "같은 것 찾기 → 한곳에 모으기"
              ]
            },
            "도전": {
              "q": "연필·지우개·자를 정리한다면 무엇끼리 모을까요?",
              "a": "같은 종류끼리 (필기구·지우개 등)",
              "steps": [
                "쓰임이 같은 것끼리"
              ]
            },
            "심화": {
              "q": "내 책상 위 물건을 같은 것끼리 모아 말해 봐요.",
              "a": "여러 답",
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
        "tnote": {"ask":["정리한 책은 모두 몇 권? 책 말고 다른 것이 섞여 있진 않았어?"],"watch":"5","min":3},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "필통 정리 — 같은 것끼리",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "✏️",
          "goal": "필통 속 물건을 같은 것끼리 모아요.",
          "steps": [
            "짝과 필통을 책상 위에 쏟아요.",
            "같은 것끼리 모아 몇 묶음이 되는지 말해요(연필·지우개·색연필 …).",
            "짝의 묶음과 내 묶음이 같은지 비교해요.",
            "왜 그렇게 모았는지 한 문장으로 말해요."
          ],
          "materials": [
            "필통"
          ],
          "minutes": 4,
          "tnote": {
            "ask": [
              "연필과 색연필은 같은 묶음이에요?"
            ],
            "watch": "\"같은 것\"의 기준이 아이마다 다름 — 다음 차시 씨앗",
            "min": 4
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["정리의 첫걸음을 한 문장으로 말해 볼까?"],"watch":"같은 것끼리 모으기","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "정리의 첫걸음은?",
              "a": "같은 것끼리 모으기"
            },
            {
              "q": "물건을 모을 때 무엇을 볼까요?",
              "a": "같은 것(종류·색깔 등)"
            },
            {
              "q": "정리하면 무엇이 좋을까요?",
              "a": "찾기 쉬워요"
            }
          ],
          "self": [
            "같은 것끼리 모을 수 있어요",
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
      "lesson_format": "교사주도 — 분명한 기준 vs 사람마다 다른 기준 구별 · 40분 표준 증보(4요소)"
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
          "content": "흩어진 물건을 **같은 것끼리** 모으면 정리된다고 배웠어요.\n오늘은 **어떤 기준**으로 나눌지 생각해 봐요.",
          "items": [
            {
              "q": "정리의 첫걸음은?",
              "a": "같은 것끼리 모으기"
            },
            {
              "q": "물건을 모을 때 무엇을 볼까요?",
              "a": "같은 것"
            }
          ],
          "from": "u5_l01"
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
        "kids": [{"face":"🐻","label":"곰이 \"나는 윗옷·아래옷으로 나눴어!\""},{"face":"🐧","label":"펭이 \"나는 좋아하는 옷·아닌 옷으로 나눴는데… 친구는 다르게 나누겠네?\""}],
        "tnote": {"ask":["곰이 기준과 펭이 기준, 누가 나눠도 결과가 똑같은 건 어느 쪽일까?"],"watch":"윗옷·아래옷 — 좋아하는 건 사람마다 다름","min":3},
          "scene_title": "세미와 슬기가 다르게 나눴어요 👕",
          "visual": "🐧",
          "question": "같은 옷을 세미는 '윗옷·아래옷'으로, 슬기는 '좋아하는 옷·아닌 옷'으로 나눴어요.<br>누구의 기준이 누가 봐도 똑같을까요?",
          "img": "assets/photo/math/sort_criteria.jpg"
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
        "tnote": {"ask":["어떤 기준이 분명한 기준일까?","어떤 기준이 분명한 기준일까? 색깔로 나누면 누가 나눠도 같을까?"],"watch":"결과가 같아지는 기준 구별 · 색깔·모양·종류","min":4},
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
        ],
        "tnote": {
          "ask": [
            "어떤 기준이 분명한 기준일까?"
          ],
          "watch": "결과가 같아지는 기준 구별",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["\"맛있는 것\"으로 나누면 짝과 결과가 같을까? 왜 다를까?"],"watch":"사람마다 다름","min":4},
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
        "tnote": {"ask":["\"예쁜 옷\"으로 나눈 친구에게 어떤 기준을 권해 줄까?"],"watch":"색깔·긴팔 짧은팔","min":4},
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
        "tnote": {"ask":["윗옷은 몇 벌? 윗옷·아래옷은 분명한 기준이야?"],"watch":"3 — 분명함","min":3},
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
        "tnote": {"ask":["빨강 단추는 몇 개? 색깔은 분명한 기준이야?"],"watch":"4","min":3},
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
        "tnote": {"ask":["바퀴 수로 나누면 두발자전거는 몇 대? 바퀴 수는 왜 분명한 기준일까?"],"watch":"2 — 세면 누구나 같음","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["물건을 나눌 분명한 기준을 짝과 다르게 두 가지 말해 볼까?"],"watch":"색깔·모양·크기·쓰임","min":5},
          "title": "분명한 기준 찾기",
          "levels": {
            "기본": {
              "q": "색깔·모양·종류는 분명한 기준일까요?",
              "a": "네 (누가 나눠도 결과가 같아요)",
              "steps": [
                "결과가 늘 같음 → 분명한 기준"
              ]
            },
            "도전": {
              "q": "'예쁜 것'은 분명한 기준일까요?",
              "a": "아니요 (사람마다 달라요)",
              "steps": [
                "사람마다 달라짐 → 분명하지 않음"
              ]
            },
            "심화": {
              "q": "물건을 나눌 분명한 기준을 두 가지 말해 봐요.",
              "a": "여러 답 (예: 색깔, 모양)",
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
        "tnote": {"ask":["인형은 몇 개? 어떤 기준으로 나눴어?"],"watch":"4 — 종류","min":3},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "기준 카드 뽑기 — 분명할까 아닐까",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "🃏",
          "goal": "기준 카드를 보고 분명한 기준인지 가려요.",
          "steps": [
            "기준 카드(색깔·모양·예쁜 것·크기·맛있는 것·종류)를 뒤집어 놓아요.",
            "한 장 뽑아 짝에게 읽어 줘요.",
            "\"누가 나눠도 같아요?\"를 묻고 ○·✕로 답해요.",
            "✕인 카드는 왜 다른지 짝과 말해요."
          ],
          "materials": [
            "기준 카드 6장"
          ],
          "minutes": 4,
          "tnote": {
            "ask": [
              "\"크기\"는 분명한 기준이에요?"
            ],
            "watch": "크기는 재면 같음 — 분명",
            "min": 4
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["분명한 기준의 특징을 한 문장으로?"],"watch":"누가 나눠도 결과가 같다","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "분명한 기준의 예는?",
              "a": "색깔·모양·종류"
            },
            {
              "q": "'예쁜 것'은 기준이 될까요?",
              "a": "아니요"
            },
            {
              "q": "분명한 기준의 특징은?",
              "a": "누가 나눠도 결과가 같아요"
            }
          ],
          "self": [
            "분명한 기준을 고를 수 있어요",
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
      "lesson_format": "교사주도 — 주어진 기준 분류 + 기준 바뀌면 결과도 바뀜 · 40분 표준 증보(4요소)"
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
          "content": "누가 나눠도 같은 **분명한 기준**(색깔·모양·종류)을 배웠어요.\n오늘은 그 기준에 따라 직접 **나누어** 봐요.",
          "items": [
            {
              "q": "분명한 기준의 예는?",
              "a": "색깔·모양·종류"
            },
            {
              "q": "분명한 기준의 특징은?",
              "a": "누가 나눠도 결과가 같아요"
            }
          ],
          "from": "u5_l02"
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
        "kids": [{"face":"🐻","label":"곰이 \"단추가 색도 모양도 다 섞여 있어!\""},{"face":"🐧","label":"펭이 \"색깔로 나눌까, 모양으로 나눌까?\""}],
        "tnote": {"ask":["섞인 단추를 어떤 기준으로 나누면 깔끔할까? 기준이 하나뿐일까?"],"watch":"색깔·모양 둘 다 가능","min":3},
          "scene_title": "단추가 가득해요 🔘",
          "visual": "🐻",
          "question": "상자에 여러 색깔·모양 단추가 섞여 있어요.<br>어떤 기준으로 나누면 깔끔하게 정리될까요?",
          "img": "assets/photo/math/sort_bycolor.jpg"
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
        "tnote": {"ask":["기준을 바꾸면 나눔이 어떻게 달라질까?","색깔 기준이면 빨강 칸에 뭐가 들어가? 네모 빨강 단추는?"],"watch":"기준 → 분류 결과 연결 · 빨강이면 모양 상관없이","min":4},
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
        ],
        "tnote": {
          "ask": [
            "기준을 바꾸면 나눔이 어떻게 달라질까?"
          ],
          "watch": "기준 → 분류 결과 연결",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["기준을 바꾸면 나눔이 어떻게 달라질까? 같은 단추가 다른 칸에 갈 수 있어?"],"watch":"색깔→모양이면 칸이 달라짐","min":4},
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
        "tnote": {"ask":["분류는 기준 하나만 써야 해? 같은 단추를 두 가지로 나눠 볼까?"],"watch":"기준 정하기 나름","min":4},
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
        "tnote": {"ask":["빨강 칸 단추는 몇 개? 그중 네모는 몇 개?"],"watch":"5 — 기준이 색깔이면 모양은 안 봄","min":3},
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
        "tnote": {"ask":["모양 기준이면 네모 단추는 몇 개? 색깔은 섞여 있어?"],"watch":"3 — 섞임","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["연필 묶음을 색깔로 한 번, 길이로 한 번 나눠 볼까? 결과가 같아?"],"watch":"두 기준 두 결과","min":5},
          "title": "기준에 따라 분류하기",
          "levels": {
            "기본": {
              "q": "빨강·파랑 블록을 색깔 기준으로 나누면 어떻게 될까요?",
              "a": "빨강 칸·파랑 칸으로 나뉘어요",
              "steps": [
                "색깔 기준 → 같은 색끼리"
              ]
            },
            "도전": {
              "q": "모양 기준으로 나눈다면 무엇끼리 모을까요?",
              "a": "같은 모양끼리 (동그라미·네모 등)",
              "steps": [
                "모양 기준 → 같은 모양끼리"
              ]
            },
            "심화": {
              "q": "한 가지 물건 묶음을 두 가지 기준으로 각각 나눠 봐요.",
              "a": "여러 답",
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
        "tnote": {"ask":["노랑 색종이는 몇 장? 기준은 무엇이었어?"],"watch":"6 — 색깔","min":3},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "단추 두 번 나누기",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "🔴",
          "goal": "같은 단추를 색깔로 한 번, 모양으로 한 번 나눠요.",
          "steps": [
            "단추(또는 색 도형 카드) 10개를 짝과 펼쳐요.",
            "색깔 기준으로 나눠 칸마다 몇 개인지 말해요.",
            "다시 섞어 모양 기준으로 나눠요.",
            "두 결과가 어떻게 달라졌는지 말해요."
          ],
          "materials": [
            "단추 또는 색 도형 카드 10개(짝당)"
          ],
          "minutes": 5,
          "tnote": {
            "ask": [
              "빨강 네모 단추는 두 번 다 어느 칸에 갔어요?"
            ],
            "watch": "기준에 따라 칸이 바뀜",
            "min": 5
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["기준을 바꾸면 결과가 어떻게 돼?"],"watch":"달라진다","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "색깔 기준으로 나누면?",
              "a": "같은 색끼리 모여요"
            },
            {
              "q": "모양 기준으로 나누면?",
              "a": "같은 모양끼리 모여요"
            },
            {
              "q": "기준을 바꾸면 결과는?",
              "a": "달라져요"
            }
          ],
          "self": [
            "기준에 따라 분류할 수 있어요",
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
      "lesson_format": "교사주도 — 분류 + 수 세기(／ 표시로 빠짐없이) · 40분 표준 증보(4요소)"
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
          "content": "정한 **기준에 따라** 같은 것끼리 나누는 법을 배웠어요.\n오늘은 나눈 다음 **몇 개인지** 세어 봐요.",
          "items": [
            {
              "q": "색깔 기준으로 나누면?",
              "a": "같은 색끼리 모여요"
            },
            {
              "q": "기준을 바꾸면 결과는?",
              "a": "달라져요"
            }
          ],
          "from": "u5_l03"
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
        "kids": [{"face":"🐻","label":"곰이 \"과일을 종류대로 나눴어. 그런데 귤이 몇 개더라?\""},{"face":"🐧","label":"펭이 \"세다가 헷갈렸지? 하나 셀 때마다 표시를 해 보자!\""}],
        "tnote": {"ask":["나눈 과일이 몇 개인지 빠뜨리지 않고 세려면 어떻게 할까?"],"watch":"／ 표시","min":3},
          "scene_title": "나누기만 하면 끝일까요? 🍎",
          "visual": "🐧",
          "question": "과일을 종류대로 나눴어요. 그런데 어떤 과일이 몇 개인지 궁금해요.<br>어떻게 하면 빠뜨리지 않고 셀 수 있을까요?",
          "img": "assets/photo/math/sort_count.jpg"
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
        "tnote": {"ask":["셀 때 왜 표시를 하며 셀까?","칸마다 세어 볼까? 셀 때 왜 표시를 하며 셀까?"],"watch":"칸마다 세기·빠뜨림 방지 · 두 번 세거나 빠뜨리지 않으려고","min":4},
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
        ],
        "tnote": {
          "ask": [
            "셀 때 왜 표시를 하며 셀까?"
          ],
          "watch": "칸마다 세기·빠뜨림 방지",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["／ 표시를 안 하고 세면 어떤 일이 생길 수 있어?"],"watch":"두 번 셈·빠뜨림","min":3},
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
        "tnote": {"ask":["눈으로 대충 세면 왜 틀릴까? 몇 개부터 표시가 필요할까?"],"watch":"많을수록 헷갈림","min":4},
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
        "tnote": {"ask":["사과를 ／ 표시하며 세어 볼까? 몇 개?"],"watch":"4","min":3},
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
        "tnote": {"ask":["귤은 몇 개? 표시가 몇 개 그어졌어?"],"watch":"6","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["사과 4·귤 6·바나나 3, 모두 몇 개? 가장 많은 과일은?"],"watch":"13 — 귤","min":5},
          "title": "분류하고 세기",
          "levels": {
            "기본": {
              "q": "사과 4개, 귤 6개, 바나나 3개를 세면 과일은 모두 몇 개?",
              "a": "13개",
              "steps": [
                "4＋6＋3 = 13"
              ]
            },
            "도전": {
              "q": "가장 많은 과일은 무엇일까요?",
              "a": "귤 (6개)",
              "steps": [
                "4, 6, 3 중 가장 큰 수 → 6"
              ]
            },
            "심화": {
              "q": "셀 때 빠뜨리지 않는 나만의 방법을 말해 봐요.",
              "a": "여러 답 (예: ／ 표시)",
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
        "tnote": {"ask":["빨강 색연필은 몇 자루? 어떻게 세었어?"],"watch":"5 — ／ 표시","min":3},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "／ 표시하며 세기",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "📝",
          "goal": "분류한 물건을 ／ 표시하며 빠짐없이 세요.",
          "steps": [
            "색 블록(또는 색종이 조각) 한 줌을 색깔로 나눠요.",
            "한 사람이 색깔을 부르면 짝이 하나마다 ／ 표시를 그어요.",
            "표시 수와 실제 개수를 맞춰 봐요.",
            "역할을 바꿔요."
          ],
          "materials": [
            "색 블록 또는 색종이 조각",
            "기록 종이"
          ],
          "minutes": 5,
          "tnote": {
            "ask": [
              "표시가 실제보다 많으면 무슨 일이 있었을까요?"
            ],
            "watch": "두 번 셈",
            "min": 5
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["셀 때 하는 표시 이름은? 왜 해?"],"watch":"／ — 빠짐없이","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "사과 4·귤 6·바나나 3은 모두?",
              "a": "13개"
            },
            {
              "q": "셀 때 하는 표시는?",
              "a": "／ 표시"
            },
            {
              "q": "가장 많은 과일은?",
              "a": "귤"
            }
          ],
          "self": [
            "분류하고 셀 수 있어요",
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
      "lesson_format": "교사주도 — 표를 읽고 가장 많은/적은/전체 말하기 · 40분 표준 증보(4요소)"
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
          "content": "분류하고 **／ 표시**하며 세는 법을 배웠어요(사과 4·귤 6·바나나 3).\n오늘은 그 결과로 무엇을 알 수 있는지 말해 봐요.",
          "items": [
            {
              "q": "사과 4·귤 6·바나나 3은 모두?",
              "a": "13개"
            },
            {
              "q": "가장 많은 과일은?",
              "a": "귤"
            }
          ],
          "from": "u5_l04"
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
        "kids": [{"face":"🐻","label":"곰이 \"과일을 다 세었어! 사과 4, 귤 6, 바나나 3.\""},{"face":"🐧","label":"펭이 \"표로 만들면 어떤 과일이 가장 많은지 한눈에 보이겠다!\""}],
        "tnote": {"ask":["표를 보면 무엇을 알 수 있을까? 가장 많은 과일은?"],"watch":"가장 많은·적은·전체","min":3},
          "scene_title": "다 세었어요! 이제 뭘 알 수 있을까요? 📊",
          "visual": "🐻",
          "question": "과일을 다 세었어요. 어떤 과일이 가장 많은지, 가장 적은지, 모두 몇 개인지 궁금해요.<br>표를 보면 한눈에 알 수 있을까요?",
          "img": "assets/photo/math/sort_result.jpg"
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
        "tnote": {"ask":["분류 결과에서 무엇을 읽어낼 수 있을까?","분류 결과에서 무엇을 읽어낼 수 있을까? 가장 많은 것은 어느 칸을 보면 알아?"],"watch":"가장 많은/적은·차이 말하기 · 수가 가장 큰 칸","min":4},
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
        ],
        "tnote": {
          "ask": [
            "분류 결과에서 무엇을 읽어낼 수 있을까?"
          ],
          "watch": "가장 많은/적은·차이 말하기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["전체 수는 어떻게 구할까? 4+6+3은?"],"watch":"13","min":4},
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
        "tnote": {"ask":["종류가 3가지니까 전체도 3이라는 친구, 무엇을 헷갈렸을까?"],"watch":"칸 수 vs 개수","min":4},
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
        "tnote": {"ask":["가장 많은 과일은? 몇 개?"],"watch":"귤 6","min":3},
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
        "tnote": {"ask":["가장 적은 과일은? 몇 개?"],"watch":"바나나 3","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["가장 많은 것과 적은 것의 차이는? 결과를 한 문장으로 말해 볼까?"],"watch":"3 — 귤이 가장 많고 바나나가 가장 적음","min":5},
          "title": "분류 결과 말하기",
          "levels": {
            "기본": {
              "q": "사과 4·귤 6·바나나 3 중 가장 적은 것은?",
              "a": "바나나 (3개)",
              "steps": [
                "4, 6, 3 중 가장 작은 수 → 3"
              ]
            },
            "도전": {
              "q": "가장 많은 것과 가장 적은 것의 차이는 몇 개?",
              "a": "3개",
              "steps": [
                "6－3 = 3"
              ]
            },
            "심화": {
              "q": "분류 결과를 한 문장으로 말해 봐요.",
              "a": "여러 답 (예: 귤이 가장 많고 바나나가 가장 적어요)",
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
        "tnote": {"ask":["책은 모두 몇 권? 어떤 종류가 가장 많았어?"],"watch":"20","min":3},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "표 보고 한 문장 말하기",
          "tag": "짝 활동",
          "type": "pair",
          "icon": "📊",
          "goal": "분류 표를 보고 가장 많은·적은·전체를 말해요.",
          "steps": [
            "짝이 만든 분류 표(색깔별 개수)를 받아요.",
            "가장 많은 것·가장 적은 것을 찾아 말해요.",
            "전체를 더해 말해요.",
            "\"○○이 가장 많고 △△이 가장 적어요. 모두 □개예요.\" 한 문장으로 발표해요."
          ],
          "materials": [
            "짝의 분류 표"
          ],
          "minutes": 4,
          "tnote": {
            "ask": [
              "전체는 칸 수를 더해요, 종류 수를 더해요?"
            ],
            "watch": "칸의 수 합",
            "min": 4
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["6과 3의 차이는? 어떤 식으로 구했어?"],"watch":"3 — 6-3","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "가장 많은 것은 어느 칸?",
              "a": "수가 가장 큰 칸"
            },
            {
              "q": "가장 적은 것은 어느 칸?",
              "a": "수가 가장 작은 칸"
            },
            {
              "q": "6과 3의 차이는?",
              "a": "3"
            }
          ],
          "self": [
            "분류 결과를 말할 수 있어요",
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
      "lesson_format": "교사주도 — 단원 평가: 기준·분류·세기·결과 말하기 총점검 + 자기 평가 · 40분 표준 증보(4요소)"
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
          "content": "분명한 기준 → 기준 따라 **분류** → 분류하고 **세기** → **결과 말하기**까지 배웠어요.\n오늘은 모두 한 번에 확인해 봐요.",
          "items": [
            {
              "q": "가장 많은 것은 어느 칸?",
              "a": "수가 가장 큰 칸"
            },
            {
              "q": "6과 3의 차이는?",
              "a": "3"
            }
          ],
          "from": "u5_l05"
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
        "kids": [{"face":"🐻","label":"곰이 \"기준 정하기, 분류, 세기, 결과 말하기!\""},{"face":"🐧","label":"펭이 \"점검표를 만들었어. 차례대로 확인해 보자.\""}],
        "tnote": {"ask":["이번 단원에서 배운 순서를 말해 볼까? 가장 자신 있는 건?"],"watch":"기준→분류→세기→말하기","min":3},
          "scene_title": "분류하기, 한 번에 확인해요 ✅",
          "visual": "🐧",
          "question": "곰이와 펭이가 단원을 정리하며 점검표를 만들었어요.<br>배운 것을 차례대로 확인해 볼까요?",
          "img": "assets/photo/math/sort_check.jpg"
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
        "tnote": {"ask":["분류는 어떤 순서로 이루어질까?","분류는 어떤 순서로 이루어질까? 첫 단계는?"],"watch":"기준→분류→세기→비교 위계 되짚기 · 분명한 기준 정하기","min":4},
          "title": "분류 위계 되짚기",
          "content": "**분명한 기준** 정하기 → 기준 따라 **분류** → 칸마다 **세기** → 가장 많은/적은·**전체 말하기**. 이 순서를 기억해요."
        },
        "suggested_extras": [
          "t_concept"
        ],
        "tnote": {
          "ask": [
            "분류는 어떤 순서로 이루어질까?"
          ],
          "watch": "기준→분류→세기→비교 위계 되짚기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "misconception",
        "data": {
        "tnote": {"ask":["평가에서 자주 틀리는 자리 두 가지는? \"예쁜 것\"은 왜 안 될까?"],"watch":"마음 기준 · 칸 수≠전체","min":4},
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
        "tnote": {"ask":["사과 4·귤 6·바나나 3, 모두 몇 개? 종류는 몇 가지?"],"watch":"13 — 3가지","min":3},
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
        "tnote": {"ask":["가장 많은 것은 몇 개? 어느 칸을 봤어?"],"watch":"6","min":3},
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
        "tnote": {"ask":["가장 적은 것은 몇 개?"],"watch":"3","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["분류 순서를 짝에게 차례로 말해 볼까?"],"watch":"기준→분류→세기→비교·전체","min":5},
          "title": "분류 위계 확인",
          "levels": {
            "기본": {
              "q": "분류의 첫 단계는 무엇을 정하는 걸까요?",
              "a": "분명한 기준",
              "steps": [
                "기준 정하기가 먼저"
              ]
            },
            "도전": {
              "q": "기준 정하기 다음에 할 일은?",
              "a": "기준에 따라 분류하고 세기",
              "steps": [
                "기준 → 분류 → 세기"
              ]
            },
            "심화": {
              "q": "분류 순서를 차례로 말해 봐요.",
              "a": "기준 정하기 → 분류 → 세기 → 비교/전체 말하기",
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
        "tnote": {"ask":["장난감은 모두 몇 개? 칸의 수를 어떻게 더했어?"],"watch":"15","min":3},
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
            "기본 ①~③ 답을 짝과 번갈아 말해요.",
            "답이 다르면 과일 그림에 ／ 표시하며 다시 세어 봐요.",
            "어느 쪽이 맞는지 이유를 말해요.",
            "틀린 문제는 ○ 표시해 두어요."
          ],
          "materials": [
            "확인 문제지"
          ],
          "minutes": 4,
          "tnote": {
            "ask": [
              "답이 다르면 무엇으로 확인해요?"
            ],
            "watch": "\"누가 맞나\"보다 \"어떻게 세었나\"",
            "min": 4
          }
        }
      },
      {
        "id": "s10",
        "stage": "정리",
        "block": "self_assessment",
        "data": {
        "tnote": {"ask":["점검표 네 칸 중 ○를 몇 개 했어? 아직인 것은 어느 문제로 연습할까?"],"watch":"자기 점검 → 다음 연습","min":4},
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
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "분류 첫 단계는?",
              "a": "분명한 기준 정하기"
            },
            {
              "q": "분류 다음은?",
              "a": "세기"
            },
            {
              "q": "세기 다음은?",
              "a": "비교·전체 말하기"
            }
          ],
          "self": [
            "분류 순서를 알아요",
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
      "lesson_format": "교사주도 — 전통 색깔 조각보 만들기 → 색깔 분류·세기·결과(단원 마무리) · 40분 표준 증보(4요소)"
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
          "content": "기준 따라 **분류**하고 **세어** 결과를 말하는 법을 배웠어요.\n오늘은 직접 **만들면서** 분류해 봐요.",
          "items": [
            {
              "q": "분류 첫 단계는?",
              "a": "분명한 기준 정하기"
            },
            {
              "q": "분류 다음은?",
              "a": "세기"
            }
          ],
          "from": "u5_l06"
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
        "kids": [{"face":"🐻","label":"곰이 \"노랑·파랑·흰색·검정·빨강, 우리나라 전통 색으로 조각보를 만들자!\""},{"face":"🐧","label":"펭이 \"다 만들면 어떤 색을 가장 많이 썼는지 세어 보자.\""}],
        "tnote": {"ask":["조각보를 만든 뒤 무엇을 기준으로 나눠 세어 볼까?"],"watch":"색깔","min":3},
          "scene_title": "전통 색깔로 조각보를 만들어요 🧵",
          "visual": "🐻",
          "question": "우리나라 전통 색깔(노랑·파랑·흰색·검정·빨강)로 조각보를 만들어요.<br>다 만든 뒤 어떤 색을 가장 많이 썼는지 알아볼까요?",
          "img": "assets/photo/math/sort_quilt.jpg"
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
        "tnote": {"ask":["조각보를 무엇을 기준으로 나눌까?","조각보를 무엇을 기준으로 나눌까? 색깔 말고 다른 기준도 될까?"],"watch":"색깔 기준 분류·세기 종합 · 색깔 — 모양·크기도 가능","min":4},
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
        ],
        "tnote": {
          "ask": [
            "조각보를 무엇을 기준으로 나눌까?"
          ],
          "watch": "색깔 기준 분류·세기 종합",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "전개",
        "block": "concept",
        "data": {
        "tnote": {"ask":["빨강 6·노랑 3·파랑 4·흰색 2. 가장 많은 색은? 어떻게 알았어?"],"watch":"빨강 — 수로 비교","min":4},
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
        "tnote": {"ask":["색이 화려하다고 가장 많이 쓴 색일까? 무엇으로 정해야 해?"],"watch":"조각 수","min":4},
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
        "tnote": {"ask":["빨강 조각을 ／ 표시하며 세어 볼까? 몇 개?"],"watch":"6","min":3},
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
        "tnote": {"ask":["조각은 모두 몇 개? 어떤 식으로 구했어?"],"watch":"15 — 6+3+4+2","min":3},
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
        "id": "s100",
        "stage": "기본문제",
        "block": "leveled_problem",
        "data": {
        "tnote": {"ask":["내 조각보를 색깔로 분류해 가장 많은 색을 발표해 볼까?"],"watch":"기준·세기·결과 순서로","min":5},
          "title": "조각보 색깔 분류",
          "levels": {
            "기본": {
              "q": "조각보 빨강 6·노랑 3·파랑 4·흰색 2를 세면 조각은 모두 몇 개?",
              "a": "15개",
              "steps": [
                "6＋3＋4＋2 = 15"
              ]
            },
            "도전": {
              "q": "가장 많은 색은 무엇일까요?",
              "a": "빨강 (6개)",
              "steps": [
                "6, 3, 4, 2 중 가장 큰 수 → 6"
              ]
            },
            "심화": {
              "q": "내 조각보를 색깔로 분류해 가장 많은 색을 말해 봐요.",
              "a": "여러 답",
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
        "tnote": {"ask":["우리 반 조각보의 파랑 조각은 몇 개?"],"watch":"4","min":3},
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
        "id": "s10b",
        "stage": "응용문제",
        "block": "offline_activity",
        "data": {
          "title": "내 조각보 색깔 세기",
          "tag": "개인 활동",
          "type": "individual",
          "icon": "🧵",
          "goal": "내가 만든 조각보를 색깔로 분류해 세요.",
          "steps": [
            "만든 조각보의 조각을 색깔별로 손가락으로 짚어요.",
            "색깔마다 ／ 표시하며 세어 표에 적어요.",
            "가장 많은 색·가장 적은 색·전체를 적어요.",
            "짝에게 한 문장으로 말해요."
          ],
          "materials": [
            "내 조각보",
            "기록 표"
          ],
          "minutes": 5,
          "tnote": {
            "ask": [
              "가장 많은 색은 어떻게 정했어요?"
            ],
            "watch": "화려함이 아니라 수",
            "min": 5
          }
        }
      },
      {
        "id": "s101",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
        "tnote": {"ask":["5단원에서 새로 할 수 있게 된 것 한 가지만 말해 볼래?"],"watch":"자기 평가","min":3},
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "빨강 6·노랑 3·파랑 4·흰색 2는 모두?",
              "a": "15개"
            },
            {
              "q": "가장 많은 색은?",
              "a": "빨강"
            },
            {
              "q": "분류 기준은 무엇이었나요?",
              "a": "색깔"
            }
          ],
          "self": [
            "색깔로 분류하고 셀 수 있어요",
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
