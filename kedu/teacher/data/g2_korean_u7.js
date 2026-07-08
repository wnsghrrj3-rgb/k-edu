/* ============================================================================
   2학년 1학기 국어 7단원 「마음을 담아서 말해요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u7_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (나) 216~245 / 15차시.
   - 성취기준 [2국01-04]·[2국01-02]·[2국01-05]. 역량 공동체·대인 관계(갈등과 조정).
   ★ 저작권: 창작 제재(「메기야, 고마워」 홍은순·「지우와 머리핀」·동시「왜 지각했냐면요」 박희순·고운 말 동요) 절대 미게재.
      자체 「주운 필통」·「민지의 줄넘기」는 자체 창작이라 게재 OK. 고운 말·발표 자세·역할놀이 상황은 보편 개념 자체 구성.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 고운 말이 필요한 까닭 ---------------- */
  window.LESSONS["u7_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 1,
      "title": "단원 도입 — 고운 말을 만나요",
      "std": "[2국01-02] · [2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 고운 말·거친 말 느낌 비교 → 고운 말이 필요한 까닭 → 고운 말 고르기 → 답답했던 경험 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 담아서 말해요",
          "subtitle": "7단원 · 1/15차시 · 단원 도입"
        },
        "suggested_extras": [
          "q_open",
          "t_goal"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "고운 말과 거친 말의 느낌을 비교해요",
            "고운 말이 필요한 까닭을 생각해요",
            "이 단원에서 배울 것을 살펴봐요"
          ]
        },
        "suggested_extras": [
          "t_goal"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "같은 마음, 다른 말 💬",
          "visual": "💬",
          "question": "친구가 도와줬을 때 \"고마워!\"와 \"됐거든.\"<br>두 말을 들으면 마음이 어떻게 다를까요?",
          "img": "assets/photo/korean/g2u7_intro.jpg"
        },
        "suggested_extras": [
          "q_feel",
          "r_life"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "고운 말은 마음을 전해요",
          "content": "같은 상황도 **고운 말**로 하면 마음이 따뜻하게 전해지고, **거친 말**로 하면 사이가 멀어져요. 고운 말은 듣는 사람의 **마음을 헤아리는 말**이에요.",
          "symbol_meanings": [
            {
              "symbol": "\"고마워\"",
              "meaning": "마음이 따뜻해져요"
            },
            {
              "symbol": "\"미안해\"",
              "meaning": "사이가 풀려요"
            },
            {
              "symbol": "\"괜찮아?\"",
              "meaning": "걱정하는 마음이 전해져요"
            },
            {
              "symbol": "거친 말",
              "meaning": "마음이 상하고 멀어져요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_habit"
        ],
        "tnote": {
          "ask": [
            "같은 상황도 말에 따라 마음이 어떻게 달라질까?"
          ],
          "watch": "고운 말·거친 말 감각 열기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "어떤 말이 고운 말일까요? 🤔",
          "sub": "상황을 보고 고운 말을 함께 골라 봐요. 카드를 누르면 고운 말이 나와요!",
          "cards": [
            {
              "clue": "친구가 내 책을 들어 줬어요.",
              "emoji": "📚",
              "name": "\"고마워!\""
            },
            {
              "clue": "실수로 친구 발을 밟았어요.",
              "emoji": "👟",
              "name": "\"미안해, 괜찮아?\""
            },
            {
              "clue": "친구가 넘어졌어요.",
              "emoji": "🤕",
              "name": "\"많이 아파? 괜찮아?\""
            }
          ],
          "outro": "고운 말 한마디가 마음을 따뜻하게 해요. 우리도 고운 말을 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick",
          "g_word"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "답답했던 경험을 나눠요",
          "question": "말 때문에 속상하거나 기뻤던 적이 있나요?",
          "items": [
            "거친 말을 들어 속상했던 적이 있나요?",
            "고운 말을 들어 기분이 좋았던 적은요?",
            "어떻게 말하면 마음이 잘 전해질까요?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "e_goal"
        ]
      },
      {
        "id": "s100",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "고운 말과 거친 말 느낌 비교하기",
          "levels": {
            "읽기": {
              "q": "'고마워, 네 덕분이야!'를 밝은 목소리로 또박또박 읽어 볼까요?",
              "a": "고마워, 네 덕분이야!"
            },
            "쓰기": {
              "q": "고운 말을 들었을 때 드는 마음을 한 낱말로 써 볼까요?",
              "a": "따뜻함(기쁨)"
            },
            "말하기": {
              "q": "오늘 들은 고운 말을 하나 떠올려 짝에게 말해 봐요.",
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
        "id": "s101",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "고운 말·거친 말 느낌 나누기 짝 놀이",
          "type": "pair",
          "goal": "고운 말과 거친 말의 느낌을 비교해요",
          "body": "짝이 같은 상황을 고운 말과 거친 말로 각각 말해 주면, 어느 쪽이 마음이 따뜻한지 이야기하고 번갈아 해요.",
          "materials": [],
          "minutes": 5
        },
        "suggested_extras": []
      },
      {
        "id": "s102",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "마음을 따뜻하게 전하는 말은?",
              "a": "고운 말"
            },
            {
              "q": "고운 말이 필요한 까닭은?",
              "a": "듣는 사람 마음이 따뜻해져요"
            },
            {
              "q": "거친 말을 들으면?",
              "a": "마음이 상하고 사이가 멀어져요"
            }
          ],
          "self": [
            "고운 말과 거친 말의 느낌을 알아요",
            "조금 어색해요",
            "아직 어려워요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "고운 말과 거친 말의 느낌이 다름을 알았어요",
            "고운 말이 마음을 전한다는 것을 알았어요",
            "고운 말을 쓰는 단원을 배울 거예요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "경험을 떠올리며 이야기를 들어요",
          "body": "다음 시간에는 이야기를 들으며 인물의 마음을 생각하고, 비슷한 내 경험을 떠올려 볼 거예요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_open",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 들은 말",
        "content": "\"오늘 아침 들은 말 중 기분 좋았던 말이 있나요?\" 고운 말에 대한 관심을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "단원의 큰 그림",
        "content": "이 단원은 '마음을 담아 고운 말로 말하기'가 핵심이에요. 도입에선 고운 말의 필요를 느끼게 하세요.",
        "fit_slides": [
          "objective",
          "cover"
        ]
      },
      {
        "id": "q_feel",
        "type": "fun_question",
        "icon": "💬",
        "title": "마음의 차이",
        "content": "\"두 말을 들었을 때 마음이 어떻게 달랐나요?\" 말의 힘을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_life",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 속 말",
        "content": "교실에서 자주 주고받는 말들을 떠올려 고운 말·거친 말을 구분해 보게 하세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 헤아리기",
        "content": "고운 말의 핵심은 '듣는 사람의 마음을 헤아리는 것'임을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_habit",
        "type": "misconception",
        "icon": "❓",
        "title": "습관처럼 나오는 말",
        "content": "거친 말이 습관이 된 경우가 있어요. 혼내기보다 고운 말로 바꿔 말해 보게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 고운 말?",
        "content": "\"이럴 때 또 어떤 고운 말을 할 수 있을까요?\" 고운 말 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_word",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 고운 말 짝짓기",
        "description": "상황과 어울리는 고운 말을 짝지어 보세요.",
        "hint": "듣는 사람 마음을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "📚 도와줌"
            },
            "b": {
              "text": "고마워!"
            }
          },
          {
            "a": {
              "text": "👟 실수"
            },
            "b": {
              "text": "미안해"
            }
          },
          {
            "a": {
              "text": "🤕 넘어짐"
            },
            "b": {
              "text": "괜찮아?"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present",
        "type": "tip",
        "icon": "🗣",
        "title": "경험은 짧게",
        "content": "속상했던·기뻤던 경험은 한 문장으로 짧게 말하게 해 여러 학생이 참여하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_goal",
        "type": "extension",
        "icon": "⬆",
        "title": "고운 말 다짐",
        "content": "\"오늘 하루 어떤 고운 말을 써 볼까요?\" 실천 다짐으로 이어요.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"고운 말은 무엇을 전할까요?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "이야기 예고",
        "content": "\"다음엔 이야기 속 인물의 마음을 생각해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 2,
      "title": "고운 말이 필요한 상황을 알아요",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 여러 상황 살피기 → 상황에 맞는 고운 말 → 상황별 말 고르기 → 고운 말로 바꿔 말하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "고운 말이 필요한 상황을 알아요",
          "subtitle": "7단원 · 2/15차시 · 준비"
        },
        "suggested_extras": [
          "q_when",
          "t_situ"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "고운 말이 필요한 여러 상황을 살펴요",
            "상황에 알맞은 고운 말을 알아봐요",
            "거친 말을 고운 말로 바꿔 말해요"
          ]
        },
        "suggested_extras": [
          "t_situ"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "이럴 땐 뭐라고 말할까요? 🤔",
          "visual": "🙆",
          "question": "친구가 무거운 책을 들고 낑낑대요.<br>나는 어떤 말을 해 주면 좋을까요?",
          "img": "assets/photo/korean/g2u7_need.jpg"
        },
        "suggested_extras": [
          "q_help",
          "r_class"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "마음을 따뜻하게 전하는 말은?",
              "a": "고운 말"
            },
            {
              "q": "거친 말을 들으면?",
              "a": "마음이 상하고 사이가 멀어져요"
            }
          ],
          "from": "u7_l01"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "상황에 맞는 고운 말",
          "content": "고운 말은 **상황**에 따라 달라져요. 고마울 때·미안할 때·축하할 때·위로할 때, 그 마음에 **알맞은 말**을 골라 하면 마음이 잘 전해져요.",
          "symbol_meanings": [
            {
              "symbol": "도움 받음",
              "meaning": "\"고마워\""
            },
            {
              "symbol": "실수함",
              "meaning": "\"미안해\""
            },
            {
              "symbol": "좋은 일",
              "meaning": "\"축하해\""
            },
            {
              "symbol": "힘들어함",
              "meaning": "\"괜찮아? 힘내\""
            }
          ]
        },
        "suggested_extras": [
          "t_match",
          "x_tone"
        ],
        "tnote": {
          "ask": [
            "상황마다 어울리는 고운 말은 어떻게 다를까?"
          ],
          "watch": "상황별 고운 말",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 상황엔 어떤 말? 💬",
          "sub": "상황에 알맞은 고운 말을 함께 골라 봐요. 카드를 누르면 고운 말이 나와요!",
          "cards": [
            {
              "clue": "친구가 무거운 책을 들어 줬어요.",
              "emoji": "📚",
              "name": "\"고마워, 덕분에 가벼워졌어!\""
            },
            {
              "clue": "줄을 서다 친구를 살짝 밀쳤어요.",
              "emoji": "😯",
              "name": "\"미안해, 안 다쳤어?\""
            },
            {
              "clue": "친구가 상을 받았어요.",
              "emoji": "🏆",
              "name": "\"축하해! 정말 잘했어!\""
            }
          ],
          "outro": "마음에 꼭 맞는 말을 고르면 마음이 더 잘 전해져요. 우리도 연습해 봐요! 😊"
        },
        "suggested_extras": [
          "q_choose",
          "g_situ"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "고운 말로 바꿔 말해요",
          "question": "거친 말을 고운 말로 바꿔 볼까요?",
          "items": [
            "\"비켜!\"는 어떻게 고치면 좋을까요?",
            "\"몰라!\"는 어떻게 바꿀 수 있을까요?",
            "고운 말로 바꾸니 마음이 어떤가요?"
          ]
        },
        "suggested_extras": [
          "t_change",
          "e_change"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "상황에 맞는 고운 말 고르기",
          "levels": {
            "읽기": {
              "q": "친구가 넘어졌을 때 '많이 아파? 괜찮아?'를 걱정하는 목소리로 읽어 볼까요?",
              "a": "많이 아파? 괜찮아?"
            },
            "쓰기": {
              "q": "친구가 도와줬을 때 할 수 있는 고운 말을 한 문장 써 볼까요?",
              "a": "여러 답 (예: 도와줘서 고마워)",
              "open": true
            },
            "말하기": {
              "q": "고운 말이 꼭 필요한 상황을 하나 떠올려 짝에게 말해 봐요.",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "상황 카드 고운 말 짝 활동",
          "type": "pair",
          "goal": "상황에 맞는 고운 말을 골라요",
          "body": "짝이 상황(도와줌·실수·넘어짐)을 말하면 어울리는 고운 말을 골라 말하고, 번갈아 해요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "실수로 친구를 밟았을 때 할 말은?",
              "a": "미안해, 괜찮아?"
            },
            {
              "q": "도움을 받았을 때 할 말은?",
              "a": "고마워"
            },
            {
              "q": "고운 말은 무엇에 맞게 골라요?",
              "a": "상황(상대의 마음)"
            }
          ],
          "self": [
            "상황에 맞는 고운 말을 골라요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "고운 말이 필요한 여러 상황을 알았어요",
            "상황에 알맞은 고운 말을 골랐어요",
            "거친 말을 고운 말로 바꿔 봤어요"
          ]
        },
        "suggested_extras": [
          "q_reflect2"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "경험을 떠올리며 이야기를 들어요",
          "body": "다음 시간에는 이야기를 들으며 인물의 마음을 생각하고, 비슷한 내 경험을 떠올려 볼 거예요!"
        },
        "suggested_extras": [
          "e_story"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_when",
        "type": "fun_question",
        "icon": "💡",
        "title": "고운 말이 필요할 때",
        "content": "\"오늘 고운 말이 필요했던 순간이 있었나요?\" 상황을 떠올리게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_situ",
        "type": "tip",
        "icon": "🧩",
        "title": "상황과 말 잇기",
        "content": "상황마다 어울리는 말이 다름을 다양한 장면으로 보여 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_help",
        "type": "fun_question",
        "icon": "🙆",
        "title": "어떤 말?",
        "content": "\"여러분이라면 어떤 말을 해 줄까요?\" 다양한 고운 말을 받아 보세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_class",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 상황",
        "content": "무거운 책·넘어짐·물 튐 등 교실에서 자주 보는 상황과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "card_quiz"
        ]
      },
      {
        "id": "t_match",
        "type": "tip",
        "icon": "🧩",
        "title": "마음에 맞게",
        "content": "같은 고운 말이라도 상황의 마음에 꼭 맞을 때 더 잘 전해짐을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_tone",
        "type": "misconception",
        "icon": "❓",
        "title": "말투도 중요해요",
        "content": "고운 말도 퉁명스러운 말투면 마음이 안 전해져요. 표정·말투도 함께 살피게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_choose",
        "type": "fun_question",
        "icon": "💡",
        "title": "나라면",
        "content": "\"나라면 이 상황에 어떤 말을 할까요?\" 자기 말을 골라 보게 해요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_situ",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 고운 말 짝짓기",
        "description": "상황과 알맞은 고운 말을 짝지어 보세요.",
        "hint": "그 마음에 맞는 말을 골라요.",
        "pairs": [
          {
            "a": {
              "text": "📚 도움"
            },
            "b": {
              "text": "고마워"
            }
          },
          {
            "a": {
              "text": "😯 실수"
            },
            "b": {
              "text": "미안해"
            }
          },
          {
            "a": {
              "text": "🏆 좋은 일"
            },
            "b": {
              "text": "축하해"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_change",
        "type": "tip",
        "icon": "🗣",
        "title": "바꿔 말하기",
        "content": "거친 말을 무조건 막기보다 \"이렇게 말하면 어떨까?\" 고운 말로 바꿔 말하게 안내하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_change",
        "type": "extension",
        "icon": "⬆",
        "title": "고운 말 사전",
        "content": "\"우리 반 고운 말 사전을 만들면 어떤 말을 넣을까요?\" 고운 말을 모아 보게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect2",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"고운 말은 무엇에 따라 달라지죠?\" 상황을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_story",
        "type": "extension",
        "icon": "⬆",
        "title": "이야기 예고",
        "content": "\"다음엔 이야기 속 인물의 마음을 생각해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 3,
      "title": "경험을 떠올리며 이야기를 들어요 ①",
      "std": "[2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 이야기 듣는 약속 → 자체 「주운 필통」 → 인물 마음 짚기 → 비슷한 경험 떠올리기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "경험을 떠올리며 이야기를 들어요",
          "subtitle": "7단원 · 3/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_lost",
          "t_listen"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "이야기를 집중해 들어요",
            "인물의 마음을 생각해요",
            "비슷한 내 경험을 떠올려요"
          ]
        },
        "suggested_extras": [
          "t_listen"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "운동장에서 필통을 주웠어요 ✏️",
          "visual": "✏️",
          "question": "민수가 운동장에서 주인 없는 필통을 주웠어요.<br>민수는 어떻게 하면 좋을까요?",
          "img": "assets/photo/korean/g2u7_listen1.jpg"
        },
        "suggested_extras": [
          "q_find",
          "r_lost"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "도움을 받았을 때 할 말은?",
              "a": "고마워"
            },
            {
              "q": "고운 말은 무엇에 맞게 골라요?",
              "a": "상황(상대의 마음)"
            }
          ],
          "from": "u7_l02"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "「주운 필통」 이야기",
          "content": "민수는 주운 필통의 **주인을 찾아 주기로** 했어요. 잃어버린 친구를 찾아 \"이거 네 필통이지?\" 하고 건네자, 친구는 **환하게** 웃으며 \"고마워!\" 했지요.",
          "symbol_meanings": [
            {
              "symbol": "필통을 주움",
              "meaning": "어떻게 할지 고민해요"
            },
            {
              "symbol": "주인을 찾아 줌",
              "meaning": "마음을 헤아린 행동"
            },
            {
              "symbol": "\"이거 네 거지?\"",
              "meaning": "고운 말로 건네요"
            },
            {
              "symbol": "\"고마워!\"",
              "meaning": "친구는 고마운 마음"
            }
          ]
        },
        "suggested_extras": [
          "t_heart",
          "b_book"
        ],
        "tnote": {
          "ask": [
            "내 경험을 떠올리면 이야기가 어떻게 달리 들릴까?"
          ],
          "watch": "경험 떠올리며 듣기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 장면, 어떤 마음일까요? 💭",
          "sub": "「주운 필통」 장면 속 마음을 함께 짚어 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "필통을 주운 민수가 주변을 둘러봐요.",
              "emoji": "👀",
              "name": "주인이 누굴까 살피는 마음"
            },
            {
              "clue": "잃어버린 친구가 필통을 찾고 있어요.",
              "emoji": "😟",
              "name": "걱정되고 속상한 마음"
            },
            {
              "clue": "필통을 돌려받은 친구가 웃어요.",
              "emoji": "😄",
              "name": "고맙고 기쁜 마음"
            }
          ],
          "outro": "고운 말과 따뜻한 행동이 마음을 전했어요. 나라면 어떻게 했을까요? 😊"
        },
        "suggested_extras": [
          "q_why3",
          "g_mood"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "비슷한 경험을 나눠요",
          "question": "나도 비슷한 적이 있었나요?",
          "items": [
            "물건을 잃어버렸다 찾은 적이 있나요?",
            "누군가를 도와주거나 도움받은 적은요?",
            "그때 어떤 마음이 들었나요?"
          ]
        },
        "suggested_extras": [
          "t_relate",
          "e_exp"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "경험을 떠올리며 이야기 듣기 ① — 비슷한 내 경험",
          "levels": {
            "읽기": {
              "q": "'나도 그런 적이 있어.'라고 공감하며 읽어 볼까요?",
              "a": "나도 그런 적이 있어"
            },
            "쓰기": {
              "q": "이야기 속 일과 비슷했던 내 경험을 한 문장으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "이야기를 들으며 떠오른 내 경험을 짝에게 말해 봐요.",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "비슷한 경험 나누기 짝 활동",
          "type": "pair",
          "goal": "이야기를 들으며 비슷한 경험을 떠올려요",
          "body": "짝과 이야기 속 일과 비슷했던 자기 경험을 한 가지씩 번갈아 말하며 나눠요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "이야기를 잘 들으려면 무엇을 떠올려요?",
              "a": "비슷한 내 경험"
            },
            {
              "q": "경험을 떠올리면?",
              "a": "이야기가 더 잘 이해돼요"
            },
            {
              "q": "'나도 그런 적 있어'는 무엇을 나타내나요?",
              "a": "공감(비슷한 경험)"
            }
          ],
          "self": [
            "경험을 떠올리며 이야기를 들어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "이야기를 집중해 들었어요",
            "인물의 마음을 생각했어요",
            "비슷한 내 경험을 떠올렸어요"
          ]
        },
        "suggested_extras": [
          "q_reflect3"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "들은 내용을 나눠요",
          "body": "다음 시간에는 이야기에서 인물이 한 고운 말을 찾고, 들은 내용을 친구들과 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_share3"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_lost",
        "type": "fun_question",
        "icon": "💡",
        "title": "잃어버린 물건",
        "content": "\"물건을 잃어버려 속상했던 적이 있나요?\" 이야기와 경험을 이어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_listen",
        "type": "tip",
        "icon": "🧩",
        "title": "듣기 약속",
        "content": "이야기를 듣기 전, 바른 자세로 집중해 듣는 약속을 정해 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_find",
        "type": "fun_question",
        "icon": "✏️",
        "title": "어떻게 할까",
        "content": "\"여러분이 민수라면 어떻게 했을까요?\" 인물에 몰입하게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_lost",
        "type": "real_world",
        "icon": "🌍",
        "title": "분실물 경험",
        "content": "교실 분실물 함·잃어버린 물건 찾기 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_heart",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 헤아린 행동",
        "content": "주인을 찾아 준 것은 친구의 마음을 헤아린 고운 행동임을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "b_book",
        "type": "book",
        "icon": "📖",
        "title": "마음을 나누는 이야기",
        "content": "고운 말·따뜻한 마음이 담긴 그림책을 함께 읽으면 좋아요.",
        "source": "그림책(시중 다수 — 임의 선택)",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_why3",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 그 마음?",
        "content": "\"왜 그런 마음이 들었을까요?\" 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mood",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 마음 짝짓기",
        "description": "이야기 장면과 인물의 마음을 짝지어 보세요.",
        "hint": "그 상황의 마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "👀 주움"
            },
            "b": {
              "text": "살피는 마음"
            }
          },
          {
            "a": {
              "text": "😟 잃어버림"
            },
            "b": {
              "text": "속상한 마음"
            }
          },
          {
            "a": {
              "text": "😄 돌려받음"
            },
            "b": {
              "text": "고마운 마음"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_relate",
        "type": "tip",
        "icon": "🗣",
        "title": "경험과 잇기",
        "content": "이야기 속 마음을 자신의 비슷한 경험과 이어 말하게 하면 공감이 깊어져요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_exp",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 더 깊이",
        "content": "\"도움을 준 사람은 어떤 마음이었을까요?\" 다른 인물 마음도 상상해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect3",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"인물의 마음을 무엇으로 생각했죠?\" 말·행동을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_share3",
        "type": "extension",
        "icon": "⬆",
        "title": "나누기 예고",
        "content": "\"다음엔 들은 내용을 친구들과 나눠요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 4,
      "title": "경험을 떠올리며 이야기를 들어요 ②",
      "std": "[2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 들은 내용 간추리기 → 인물의 고운 말 찾기 → 고운 말 골라 보기 → 들은 내용·느낌 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "경험을 떠올리며 이야기를 들어요",
          "subtitle": "7단원 · 4/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall4",
          "t_share4"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "들은 이야기의 내용을 간추려요",
            "인물이 한 고운 말을 찾아요",
            "들은 내용과 느낌을 나눠요"
          ]
        },
        "suggested_extras": [
          "t_share4"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "이야기에 어떤 말이 나왔나요? 💬",
          "visual": "💬",
          "question": "「주운 필통」에서 인물들이 주고받은 말을 떠올려 봐요.<br>어떤 고운 말이 나왔나요?",
          "img": "assets/photo/korean/g2u7_listen2.jpg"
        },
        "suggested_extras": [
          "q_word4",
          "r_recall"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "이야기를 잘 들으려면 무엇을 떠올려요?",
              "a": "비슷한 내 경험"
            },
            {
              "q": "경험을 떠올리면?",
              "a": "이야기가 더 잘 이해돼요"
            }
          ],
          "from": "u7_l03"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "이야기 속 고운 말 찾기",
          "content": "이야기를 들을 땐 **누가·무엇을 했는지** 떠올리고, 인물이 한 **고운 말**에 귀 기울여요. 고운 말이 인물의 마음을 어떻게 전했는지 살펴봐요.",
          "symbol_meanings": [
            {
              "symbol": "\"이거 네 거지?\"",
              "meaning": "마음을 헤아린 말"
            },
            {
              "symbol": "\"고마워!\"",
              "meaning": "고마운 마음을 전한 말"
            },
            {
              "symbol": "누가·무엇을",
              "meaning": "이야기 내용 간추리기"
            },
            {
              "symbol": "고운 말의 힘",
              "meaning": "마음을 따뜻하게 해요"
            }
          ]
        },
        "suggested_extras": [
          "t_summary4",
          "x_only"
        ],
        "tnote": {
          "ask": [
            "인물이 왜 그런 마음이 들었을지 어떻게 알 수 있을까?"
          ],
          "watch": "인물 마음 짐작",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이건 고운 말일까요? 🤔",
          "sub": "이야기 속 말을 보고 고운 말인지 함께 살펴봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"이거 네 필통이지? 여기 있어.\"",
              "emoji": "✏️",
              "name": "고운 말 — 마음을 헤아렸어요"
            },
            {
              "clue": "\"고마워, 한참 찾았는데!\"",
              "emoji": "😄",
              "name": "고운 말 — 고마움을 전했어요"
            },
            {
              "clue": "\"네 거 아니야? 됐거든.\"",
              "emoji": "😠",
              "name": "거친 말 — 마음이 상해요"
            }
          ],
          "outro": "고운 말은 마음을 따뜻하게, 거친 말은 마음을 상하게 해요. 차이가 느껴지나요? 😊"
        },
        "suggested_extras": [
          "q_diff",
          "g_word4"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "들은 내용과 느낌을 나눠요",
          "question": "이야기를 듣고 무엇을 느꼈나요?",
          "items": [
            "이야기에서 누가 무엇을 했나요?",
            "가장 기억에 남는 고운 말은요?",
            "이야기를 듣고 어떤 마음이 들었나요?"
          ]
        },
        "suggested_extras": [
          "t_present4",
          "e_feel4"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "경험을 떠올리며 이야기 듣기 ② — 인물의 마음 짐작",
          "levels": {
            "읽기": {
              "q": "'친구가 내 편을 들어 줘서 정말 고마웠어.'를 인물의 마음을 담아 읽어 볼까요?",
              "a": "고마운 마음이 담긴 말"
            },
            "쓰기": {
              "q": "이야기 속 인물의 마음을 나타내는 낱말을 하나 써 볼까요?",
              "a": "여러 답 (예: 고마움·속상함)",
              "open": true
            },
            "말하기": {
              "q": "인물의 마음을 어떻게 짐작했는지 까닭과 함께 짝에게 말해 봐요.",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "인물 마음 짐작 짝 활동",
          "type": "pair",
          "goal": "이야기 속 인물의 마음을 짐작해요",
          "body": "짝이 인물의 말이나 행동을 말하면 그때 인물의 마음이 어땠을지 짐작해 말하고, 번갈아 해요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "인물의 마음은 무엇을 보고 짐작하나요?",
              "a": "인물의 말과 행동"
            },
            {
              "q": "내 경험을 떠올리면?",
              "a": "인물 마음을 더 잘 짐작해요"
            },
            {
              "q": "마음을 짐작하며 들으면?",
              "a": "이야기가 더 실감 나요"
            }
          ],
          "self": [
            "인물의 마음을 짐작하며 들어요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "들은 이야기의 내용을 간추렸어요",
            "인물이 한 고운 말을 찾았어요",
            "들은 내용과 느낌을 나눴어요"
          ]
        },
        "suggested_extras": [
          "q_reflect4"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "바른 자세로 발표해요",
          "body": "다음 시간에는 내 경험을 바른 자세로 또박또박 발표하는 방법을 배워 볼 거예요!"
        },
        "suggested_extras": [
          "e_present4"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall4",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 이야기",
        "content": "\"지난 시간 「주운 필통」에서 무슨 일이 있었죠?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_share4",
        "type": "tip",
        "icon": "🧩",
        "title": "내용 간추리기",
        "content": "누가·무엇을 했는지 차례로 떠올려 이야기 내용을 간추리게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_word4",
        "type": "fun_question",
        "icon": "💬",
        "title": "기억나는 말",
        "content": "\"이야기에서 기억나는 말이 있나요?\" 고운 말을 떠올리게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_recall",
        "type": "real_world",
        "icon": "🌍",
        "title": "들은 이야기 나누기",
        "content": "집·텔레비전에서 들은 이야기를 떠올려 듣기 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_summary4",
        "type": "tip",
        "icon": "🧩",
        "title": "고운 말에 귀 기울이기",
        "content": "인물이 한 말 가운데 고운 말을 찾아보며 말의 힘을 느끼게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_only",
        "type": "misconception",
        "icon": "❓",
        "title": "내용만 아니라 마음도",
        "content": "줄거리만 말하지 않게, 인물의 마음과 고운 말까지 함께 살피게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_diff",
        "type": "fun_question",
        "icon": "💡",
        "title": "무엇이 다를까",
        "content": "\"고운 말과 거친 말은 무엇이 다를까요?\" 차이를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_word4",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "말 ↔ 느낌 짝짓기",
        "description": "말과 그 말을 들었을 때 마음을 짝지어 보세요.",
        "hint": "들으면 마음이 어떤지 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "✏️ \"여기 있어\""
            },
            "b": {
              "text": "따뜻한 마음"
            }
          },
          {
            "a": {
              "text": "😄 \"고마워\""
            },
            "b": {
              "text": "기쁜 마음"
            }
          },
          {
            "a": {
              "text": "😠 \"됐거든\""
            },
            "b": {
              "text": "상한 마음"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present4",
        "type": "tip",
        "icon": "🗣",
        "title": "느낌과 까닭",
        "content": "느낀 점을 말할 때 \"왜냐하면…\"으로 까닭을 함께 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_feel4",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 상상",
        "content": "\"필통을 돌려준 뒤 두 친구는 어떻게 됐을까요?\" 뒷이야기를 상상해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect4",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"이야기에서 어떤 고운 말을 찾았죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_present4",
        "type": "extension",
        "icon": "⬆",
        "title": "발표 예고",
        "content": "\"다음엔 내 경험을 바른 자세로 발표해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 5,
      "title": "바른 자세로 발표해요 ①",
      "std": "[2국01-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 발표 자세 비교 → 바른 발표 자세 → 바른 자세 고르기 → 내 경험 발표 연습 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "바른 자세로 발표해요",
          "subtitle": "7단원 · 5/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_present5",
          "t_posture"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "바른 발표 자세를 알아봐요",
            "또박또박 말하는 법을 연습해요",
            "내 경험을 바른 자세로 발표해요"
          ]
        },
        "suggested_extras": [
          "t_posture"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "어떤 발표가 잘 들릴까요? 🎤",
          "visual": "🎤",
          "question": "한 친구는 고개를 숙이고 작게, 한 친구는 앞을 보고 또박또박 말해요.<br>어느 쪽이 잘 들릴까요?",
          "img": "assets/photo/korean/g2u7_present1.jpg"
        },
        "suggested_extras": [
          "q_which",
          "r_present5"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "인물의 마음은 무엇을 보고 짐작하나요?",
              "a": "인물의 말과 행동"
            },
            {
              "q": "마음을 짐작하며 들으면?",
              "a": "이야기가 더 실감 나요"
            }
          ],
          "from": "u7_l04"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "바른 발표 자세",
          "content": "발표할 땐 **허리를 펴고** 앞을 보며, **또박또박** 알맞은 크기의 목소리로 말해요. 듣는 친구가 잘 알아들을 수 있게 천천히 말하는 것이 중요해요!",
          "symbol_meanings": [
            {
              "symbol": "허리 펴기",
              "meaning": "바르게 서거나 앉아요"
            },
            {
              "symbol": "앞 보기",
              "meaning": "듣는 사람을 바라봐요"
            },
            {
              "symbol": "또박또박",
              "meaning": "천천히 분명하게"
            },
            {
              "symbol": "알맞은 목소리",
              "meaning": "너무 작지도 크지도 않게"
            }
          ]
        },
        "suggested_extras": [
          "t_voice",
          "x_fast"
        ],
        "tnote": {
          "ask": [
            "어떻게 발표하면 내 말이 잘 전해질까?"
          ],
          "watch": "바른 발표 자세",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 발표 자세는? ✅",
          "sub": "발표할 때 바른 모습을 함께 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "몸은 어떻게 하면 좋을까요?",
              "emoji": "🧍",
              "name": "허리를 펴고 앞을 봐요"
            },
            {
              "clue": "목소리는 어떻게?",
              "emoji": "🔊",
              "name": "또박또박 알맞은 크기로"
            },
            {
              "clue": "말하는 빠르기는?",
              "emoji": "🐢",
              "name": "듣는 사람이 알아듣게 천천히"
            }
          ],
          "outro": "바른 자세로 또박또박 말하면 마음이 잘 전해져요. 내 경험을 발표해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good5",
          "g_posture"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "내 경험을 발표해요 🎤",
          "sub": "버튼을 누르면 발표할 친구를 뽑아요. 고운 말을 주고받았던 경험을 바른 자세로 발표해요!",
          "count": 24,
          "hint": "“저는 ◯◯에게 고운 말을 했습니다” 처럼 바른 자세로 또박또박 말해 봐요",
          "end_msg": "모두의 경험이 멋져요. 우리 반은 고운 말을 잘 쓰는 반이에요! 👏"
        },
        "suggested_extras": [
          "t_present5b",
          "e_exp5"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "바른 자세로 발표하기 ① — 발표하는 자세",
          "levels": {
            "읽기": {
              "q": "'허리를 펴고, 또렷한 목소리로 말해요.'를 바른 자세로 읽어 볼까요?",
              "a": "발표 자세 문장"
            },
            "쓰기": {
              "q": "바르게 발표하는 방법을 한 가지 써 볼까요?",
              "a": "여러 답 (예: 또렷한 목소리로)",
              "open": true
            },
            "말하기": {
              "q": "친구들을 보며 인사말로 발표를 시작해 볼까요?",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "바른 발표 자세 짝 점검 활동",
          "type": "pair",
          "goal": "바른 자세로 발표해요",
          "body": "짝 앞에서 한 문장을 발표하고, 짝은 허리·목소리·눈맞춤을 살펴 좋았던 점을 말해 줘요. 번갈아 해요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "발표할 때 몸은 어떻게 하나요?",
              "a": "허리를 펴고 바르게"
            },
            {
              "q": "목소리는 어떻게?",
              "a": "또렷하고 알맞은 크기로"
            },
            {
              "q": "누구를 보며 말하나요?",
              "a": "듣는 친구들"
            }
          ],
          "self": [
            "바른 자세로 발표해요",
            "조금 어색해요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "바른 발표 자세를 알았어요",
            "또박또박 말하는 법을 연습했어요",
            "내 경험을 바른 자세로 발표했어요"
          ]
        },
        "suggested_extras": [
          "q_reflect5"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "바른 자세로 발표하고 들어요",
          "body": "다음 시간에는 친구들 앞에서 발표하고, 바른 자세로 집중해 듣는 연습을 해 볼 거예요!"
        },
        "suggested_extras": [
          "e_listen5"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_present5",
        "type": "fun_question",
        "icon": "💡",
        "title": "발표 떨림",
        "content": "\"발표할 때 떨렸던 적 있나요? 어떻게 하면 편할까요?\" 발표 부담을 덜어 줘요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_posture",
        "type": "tip",
        "icon": "🧩",
        "title": "자세와 목소리",
        "content": "바른 자세와 또박또박한 목소리를 함께 익히게 하세요. 시범을 보여 주면 효과적이에요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_which",
        "type": "fun_question",
        "icon": "🎤",
        "title": "어느 쪽?",
        "content": "\"왜 그쪽이 더 잘 들릴까요?\" 바른 자세의 까닭을 짚어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_present5",
        "type": "real_world",
        "icon": "🌍",
        "title": "발표 경험",
        "content": "수업 시간·학예회에서 발표한 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_voice",
        "type": "tip",
        "icon": "🧩",
        "title": "알맞은 크기",
        "content": "교실 뒤까지 들리되 소리치지 않는 알맞은 크기를 함께 연습해 보세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_fast",
        "type": "misconception",
        "icon": "❓",
        "title": "빠르게 ≠ 잘",
        "content": "빨리 말하면 잘하는 게 아니에요. 천천히 또박또박이 더 잘 전해짐을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good5",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 자세는?",
        "content": "\"바른 발표 자세에는 무엇이 있죠?\" 허리·앞 보기·목소리를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_posture",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "항목 ↔ 바른 모습 짝짓기",
        "description": "발표 항목과 바른 모습을 짝지어 보세요.",
        "hint": "잘 들리는 발표를 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🧍 몸"
            },
            "b": {
              "text": "허리 펴고 앞 보기"
            }
          },
          {
            "a": {
              "text": "🔊 목소리"
            },
            "b": {
              "text": "또박또박 알맞게"
            }
          },
          {
            "a": {
              "text": "🐢 빠르기"
            },
            "b": {
              "text": "천천히"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present5b",
        "type": "tip",
        "icon": "🗣",
        "title": "격려하기",
        "content": "발표하는 학생을 격려하고, 듣는 학생은 바른 자세로 보게 안내하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_exp5",
        "type": "extension",
        "icon": "⬆",
        "title": "경험 더하기",
        "content": "\"그때 어떤 고운 말을 주고받았나요?\" 발표 내용을 풍부하게 해요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect5",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"바르게 발표하려면 어떻게 해야 하죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_listen5",
        "type": "extension",
        "icon": "⬆",
        "title": "듣기 예고",
        "content": "\"다음엔 발표하고 바른 자세로 들어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 6,
      "title": "바른 자세로 발표해요 ②",
      "std": "[2국01-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 바른 듣기 자세 → 발표·듣기 약속 → 바른 모습 고르기 → 발표하고 들으며 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "바른 자세로 발표해요",
          "subtitle": "7단원 · 6/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_listen6",
          "t_both"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "바른 듣기 자세를 알아봐요",
            "발표하고 듣는 약속을 정해요",
            "발표하고 친구 발표를 잘 들어요"
          ]
        },
        "suggested_extras": [
          "t_both"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "발표할 땐 듣는 친구도 중요해요 👂",
          "visual": "👂",
          "question": "친구가 발표할 때 나는 어떻게 들으면 좋을까요?<br>잘 듣는 모습은 어떤 모습일까요?",
          "img": "assets/photo/korean/g2u7_present2.jpg"
        },
        "suggested_extras": [
          "q_how6",
          "r_listen6"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "발표할 때 몸은 어떻게 하나요?",
              "a": "허리를 펴고 바르게"
            },
            {
              "q": "누구를 보며 말하나요?",
              "a": "듣는 친구들"
            }
          ],
          "from": "u7_l05"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "바른 듣기 자세",
          "content": "발표를 들을 땐 **말하는 사람을 바라보고**, 끝까지 **집중해** 들어요. 중간에 끼어들지 않고, 다 들은 뒤 **궁금한 점**이나 **좋았던 점**을 말해 줘요.",
          "symbol_meanings": [
            {
              "symbol": "바라보기",
              "meaning": "말하는 사람을 봐요"
            },
            {
              "symbol": "집중하기",
              "meaning": "끝까지 귀 기울여요"
            },
            {
              "symbol": "기다리기",
              "meaning": "끼어들지 않아요"
            },
            {
              "symbol": "반응하기",
              "meaning": "좋은 점을 말해 줘요"
            }
          ]
        },
        "suggested_extras": [
          "t_listen",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "잘 듣는 친구가 있으면 발표가 어떻게 달라질까?"
          ],
          "watch": "바른 듣기 자세",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 모습은 무엇일까요? ✅",
          "sub": "발표·듣기 상황의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "발표하는 친구의 바른 모습은?",
              "emoji": "🎤",
              "name": "허리 펴고 또박또박 말해요"
            },
            {
              "clue": "듣는 친구의 바른 모습은?",
              "emoji": "👂",
              "name": "바라보며 집중해 들어요"
            },
            {
              "clue": "발표가 끝난 뒤에는?",
              "emoji": "👏",
              "name": "좋았던 점을 말해 줘요"
            }
          ],
          "outro": "발표와 듣기는 함께 자라요. 서로 마음을 주고받으며 발표해 봐요! 😊"
        },
        "suggested_extras": [
          "q_good6",
          "g_listen"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "발표하고 잘 들어요 🎤",
          "sub": "버튼을 눌러 발표할 친구를 뽑아요. 발표하는 친구는 바른 자세로, 듣는 친구는 집중해 들어요!",
          "count": 24,
          "hint": "“저는 ◯◯한 경험이 있습니다” 처럼 또박또박 말해 봐요",
          "end_msg": "모두 바른 자세로 발표하고 잘 들었어요. 정말 멋져요! 👏"
        },
        "suggested_extras": [
          "t_present6",
          "e_good6"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "바른 자세로 발표하기 ② — 듣는 자세",
          "levels": {
            "읽기": {
              "q": "'말하는 친구를 보며 끝까지 들어요.'를 또박또박 읽어 볼까요?",
              "a": "듣는 자세 문장"
            },
            "쓰기": {
              "q": "발표를 들을 때 지켜야 할 것을 한 가지 써 볼까요?",
              "a": "여러 답 (예: 끝까지 듣기)",
              "open": true
            },
            "말하기": {
              "q": "친구 발표를 듣고 '~점이 좋았어.'로 칭찬을 말해 봐요.",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "발표·듣기 역할 짝 활동",
          "type": "pair",
          "goal": "바른 자세로 발표하고 들어요",
          "body": "짝과 발표자·듣는이 역할을 나눠 한 문장씩 발표하고, 끝까지 듣고 칭찬 한마디를 건네요. 역할을 바꿔요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "발표를 들을 때는 누구를 보나요?",
              "a": "말하는 친구"
            },
            {
              "q": "언제까지 들어요?",
              "a": "끝까지"
            },
            {
              "q": "다 듣고 나서?",
              "a": "칭찬이나 궁금한 점을 말해요"
            }
          ],
          "self": [
            "바른 자세로 발표하고 들어요",
            "조금 어색해요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "바른 듣기 자세를 알았어요",
            "발표하고 듣는 약속을 지켰어요",
            "서로 발표하고 잘 들었어요"
          ]
        },
        "suggested_extras": [
          "q_reflect6"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "마음 생각하며 고운 말로 대화해요",
          "body": "다음 시간에는 상대의 마음을 생각하며 고운 말로 대화하는 역할놀이를 해 볼 거예요!"
        },
        "suggested_extras": [
          "e_role6"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_listen6",
        "type": "fun_question",
        "icon": "💡",
        "title": "잘 듣기",
        "content": "\"내가 발표할 때 친구들이 어떻게 들어 주면 좋을까요?\" 듣기의 중요성을 느끼게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_both",
        "type": "tip",
        "icon": "🧩",
        "title": "발표·듣기 함께",
        "content": "발표만큼 듣기도 중요한 활동임을 안내하고 듣기 약속을 함께 정하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how6",
        "type": "fun_question",
        "icon": "👂",
        "title": "어떻게 들을까",
        "content": "\"잘 듣는 모습은 어떤 모습일까요?\" 듣기 태도를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_listen6",
        "type": "real_world",
        "icon": "🌍",
        "title": "듣기 경험",
        "content": "선생님 말씀·친구 발표를 들었던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_listen",
        "type": "tip",
        "icon": "🧩",
        "title": "끝까지 듣기",
        "content": "중간에 끼어들지 않고 끝까지 듣는 약속을 강조하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_cut",
        "type": "misconception",
        "icon": "❓",
        "title": "끼어들기 주의",
        "content": "발표 중 끼어들면 발표하는 친구가 속상해요. 다 듣고 말하기로 약속하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good6",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"바른 듣기 자세에는 무엇이 있죠?\" 바라보기·집중을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_listen",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "발표·듣기 상황과 바른 모습을 짝지어 보세요.",
        "hint": "서로 마음을 주고받는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🎤 발표"
            },
            "b": {
              "text": "또박또박"
            }
          },
          {
            "a": {
              "text": "👂 듣기"
            },
            "b": {
              "text": "바라보며 집중"
            }
          },
          {
            "a": {
              "text": "👏 끝난 뒤"
            },
            "b": {
              "text": "좋은 점 말하기"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present6",
        "type": "tip",
        "icon": "🗣",
        "title": "골고루 참여",
        "content": "여러 학생이 발표하고, 듣는 학생도 바른 자세로 보도록 안내하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_good6",
        "type": "extension",
        "icon": "⬆",
        "title": "칭찬하기",
        "content": "\"방금 발표에서 좋았던 점은?\" 친구 발표의 좋은 점을 찾게 해요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect6",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"잘 듣는다는 건 무엇일까요?\" 듣기 태도를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_role6",
        "type": "extension",
        "icon": "⬆",
        "title": "역할놀이 예고",
        "content": "\"다음엔 고운 말로 대화하는 역할놀이를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 7,
      "title": "마음을 생각하며 고운 말로 대화해요 ①",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 상대 마음 생각하기 → 고운 말 대화 방법 → 상황별 고운 말 고르기 → 역할놀이 연습 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 생각하며 고운 말로 대화해요",
          "subtitle": "7단원 · 7/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_role",
          "t_mind"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "상대의 마음을 생각하며 말해요",
            "상황에 맞는 고운 말을 골라요",
            "역할놀이로 고운 말 대화를 연습해요"
          ]
        },
        "suggested_extras": [
          "t_mind"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "친구가 물을 쏟았어요 💧",
          "visual": "💧",
          "question": "내 책상에 친구가 실수로 물을 쏟았어요.<br>화내지 않고 어떻게 말하면 좋을까요?",
          "img": "assets/photo/korean/g2u7_talk1.jpg"
        },
        "suggested_extras": [
          "q_spill",
          "r_role"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "발표를 들을 때는 누구를 보나요?",
              "a": "말하는 친구"
            },
            {
              "q": "언제까지 들어요?",
              "a": "끝까지"
            }
          ],
          "from": "u7_l06"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "마음을 생각하며 말하기",
          "content": "대화할 땐 **상대의 마음**을 먼저 생각해요. 실수한 친구도 **미안한 마음**일 거예요. 그 마음을 헤아려 \"괜찮아\"라고 하면 사이가 **상하지 않아요**.",
          "symbol_meanings": [
            {
              "symbol": "상대 마음 보기",
              "meaning": "친구는 어떤 마음일까?"
            },
            {
              "symbol": "화 가라앉히기",
              "meaning": "바로 화내지 않아요"
            },
            {
              "symbol": "고운 말 고르기",
              "meaning": "\"괜찮아\" \"같이 닦자\""
            },
            {
              "symbol": "사이 지키기",
              "meaning": "마음이 상하지 않아요"
            }
          ]
        },
        "suggested_extras": [
          "t_empathy",
          "x_blame"
        ],
        "tnote": {
          "ask": [
            "상대의 마음을 알면 어떤 말이 하고 싶어질까?"
          ],
          "watch": "마음 헤아려 대화",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이럴 땐 어떻게 말할까요? 💬",
          "sub": "상대 마음을 생각한 고운 말을 골라 봐요. 카드를 누르면 고운 말이 나와요!",
          "cards": [
            {
              "clue": "친구가 실수로 물을 쏟았을 때",
              "emoji": "💧",
              "name": "\"괜찮아, 같이 닦자.\""
            },
            {
              "clue": "친구가 내 발을 밟았을 때",
              "emoji": "👟",
              "name": "\"괜찮아? 일부러 그런 거 아니지.\""
            },
            {
              "clue": "친구가 약속에 늦었을 때",
              "emoji": "⏰",
              "name": "\"무슨 일 있었어? 걱정했어.\""
            }
          ],
          "outro": "상대의 마음을 생각하면 고운 말이 절로 나와요. 역할놀이로 연습해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_choose7",
          "g_role"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "역할놀이를 연습해요",
          "question": "짝과 함께 고운 말 대화를 연습해 볼까요?",
          "items": [
            "누가 어떤 역할을 맡을까요?",
            "상대의 마음을 생각하며 어떤 말을 할까요?",
            "고운 말로 대화하니 마음이 어떤가요?"
          ]
        },
        "suggested_extras": [
          "t_play7",
          "e_situ7"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "마음을 생각하며 고운 말로 대화하기 ① — 상대 마음 생각",
          "levels": {
            "읽기": {
              "q": "'네가 속상했겠구나.'를 상대 마음을 헤아리며 읽어 볼까요?",
              "a": "마음을 헤아리는 말"
            },
            "쓰기": {
              "q": "속상해하는 친구에게 할 수 있는 고운 말을 한 문장 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "고운 말을 하기 전에 무엇을 먼저 생각해야 하는지 짝에게 말해 봐요.",
              "a": "상대의 마음"
            }
          }
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "마음 헤아려 말하기 짝 활동",
          "type": "pair",
          "goal": "상대의 마음을 생각하며 고운 말을 해요",
          "body": "짝이 오늘 있었던 일을 말하면, 그 마음을 헤아려 어울리는 고운 말을 건네고 번갈아 해요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "고운 말을 하기 전에 먼저 생각할 것은?",
              "a": "상대의 마음"
            },
            {
              "q": "속상한 친구에게 할 말은?",
              "a": "네가 속상했겠구나"
            },
            {
              "q": "마음을 생각해 말하면?",
              "a": "고운 말이 잘 전해져요"
            }
          ],
          "self": [
            "상대 마음을 생각하며 대화해요",
            "조금 어색해요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "상대의 마음을 생각하며 말했어요",
            "상황에 맞는 고운 말을 골랐어요",
            "역할놀이로 고운 말 대화를 연습했어요"
          ]
        },
        "suggested_extras": [
          "q_reflect7"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "역할놀이로 고운 말을 주고받아요",
          "body": "다음 시간에는 여러 상황으로 역할놀이를 하며 고운 말을 주고받아 볼 거예요!"
        },
        "suggested_extras": [
          "e_role7"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_role",
        "type": "fun_question",
        "icon": "💡",
        "title": "역할놀이 경험",
        "content": "\"역할놀이를 해 본 적 있나요? 어떤 역할이 재미있었나요?\" 흥미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_mind",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 먼저",
        "content": "고운 말의 출발은 '상대의 마음을 생각하는 것'임을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_spill",
        "type": "fun_question",
        "icon": "💧",
        "title": "어떻게 말할까",
        "content": "\"화내고 싶을 때 어떻게 하면 좋을까요?\" 마음을 가라앉히는 법을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_role",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 다툼",
        "content": "교실에서 자주 생기는 작은 다툼 상황과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "card_quiz"
        ]
      },
      {
        "id": "t_empathy",
        "type": "tip",
        "icon": "🧩",
        "title": "상대 마음 헤아리기",
        "content": "실수한 친구도 미안한 마음일 거라는 점을 짚으면 공감이 자라요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_blame",
        "type": "misconception",
        "icon": "❓",
        "title": "탓하기보다",
        "content": "바로 탓하면 다툼이 커져요. 마음을 먼저 헤아리는 말을 연습하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_choose7",
        "type": "fun_question",
        "icon": "💡",
        "title": "나라면",
        "content": "\"나라면 이 상황에 어떤 고운 말을 할까요?\" 자기 말을 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_role",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 고운 말 짝짓기",
        "description": "상황과 마음을 생각한 고운 말을 짝지어 보세요.",
        "hint": "상대 마음을 헤아려요.",
        "pairs": [
          {
            "a": {
              "text": "💧 물 쏟음"
            },
            "b": {
              "text": "같이 닦자"
            }
          },
          {
            "a": {
              "text": "👟 발 밟음"
            },
            "b": {
              "text": "괜찮아?"
            }
          },
          {
            "a": {
              "text": "⏰ 늦음"
            },
            "b": {
              "text": "걱정했어"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_play7",
        "type": "tip",
        "icon": "🗣",
        "title": "역할 정하기",
        "content": "짝과 역할을 정하고 상황을 골라 짧게 연습하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_situ7",
        "type": "extension",
        "icon": "⬆",
        "title": "새 상황 만들기",
        "content": "\"우리만의 고운 말 상황을 만들어 볼까요?\" 역할놀이를 확장해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect7",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"고운 말의 출발은 무엇이죠?\" 상대 마음을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_role7",
        "type": "extension",
        "icon": "⬆",
        "title": "역할놀이 예고",
        "content": "\"다음엔 여러 상황으로 역할놀이를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 8,
      "title": "마음을 생각하며 고운 말로 대화해요 ②",
      "std": "[2국01-02] · [2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 역할놀이 약속 → 여러 상황 역할놀이 → 잘된 대화 짚기 → 역할놀이 발표·나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 생각하며 고운 말로 대화해요",
          "subtitle": "7단원 · 8/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_ready8",
          "t_play8"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "여러 상황으로 역할놀이를 해요",
            "고운 말로 마음을 주고받아요",
            "역할놀이를 발표하고 나눠요"
          ]
        },
        "suggested_extras": [
          "t_play8"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "상황을 골라 역할놀이를 해요 🎭",
          "visual": "🎭",
          "question": "고운 말이 필요한 상황을 골라 친구와 역할놀이를 해요.<br>어떤 상황을 해 보고 싶나요?",
          "img": "assets/photo/korean/g2u7_talk2.jpg"
        },
        "suggested_extras": [
          "q_pick8",
          "r_play8"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "고운 말을 하기 전에 먼저 생각할 것은?",
              "a": "상대의 마음"
            },
            {
              "q": "마음을 생각해 말하면?",
              "a": "고운 말이 잘 전해져요"
            }
          ],
          "from": "u7_l07"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "역할놀이 약속",
          "content": "역할놀이는 **상황을 정하고 → 역할을 나누고 → 고운 말로 대화하기** 순서로 해요. 상대의 마음을 생각하며 진짜처럼 말과 표정을 살려 보세요!",
          "symbol_meanings": [
            {
              "symbol": "① 상황 정하기",
              "meaning": "어떤 일이 있었나요?"
            },
            {
              "symbol": "② 역할 나누기",
              "meaning": "누가 무엇을 맡을까요?"
            },
            {
              "symbol": "③ 고운 말 대화",
              "meaning": "마음을 생각하며 말해요"
            },
            {
              "symbol": "④ 표정·말투",
              "meaning": "진짜처럼 살려요"
            }
          ]
        },
        "suggested_extras": [
          "t_real8",
          "x_just"
        ],
        "tnote": {
          "ask": [
            "고운 말로 주고받으면 대화가 어떻게 이어질까?"
          ],
          "watch": "고운 말 대화 주고받기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 역할놀이, 잘된 대화일까요? 🤔",
          "sub": "역할놀이 속 대화를 보고 함께 살펴봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "(물 쏟음) \"괜찮아, 같이 닦자!\" \"고마워, 미안해.\"",
              "emoji": "💧",
              "name": "잘된 대화 — 마음을 헤아렸어요"
            },
            {
              "clue": "(부딪힘) \"괜찮아? 안 다쳤어?\" \"응, 괜찮아.\"",
              "emoji": "🤝",
              "name": "잘된 대화 — 서로 걱정했어요"
            },
            {
              "clue": "(실수) \"왜 그래! 저리 가!\" 하고 화냄",
              "emoji": "😠",
              "name": "아쉬운 대화 — 마음이 상해요"
            }
          ],
          "outro": "마음을 생각한 고운 말이 좋은 대화를 만들어요. 우리 차례로 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good8",
          "g_play8"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "역할놀이를 발표해요 🎭",
          "sub": "버튼을 눌러 발표할 모둠(친구)을 뽑아요. 고운 말로 대화하는 역할놀이를 보여 줘요!",
          "count": 12,
          "hint": "상대의 마음을 생각하며 고운 말과 표정을 살려 보여 줘요",
          "end_msg": "모두 고운 말로 멋진 역할놀이를 했어요! 우리 반이 따뜻해졌어요 👏"
        },
        "suggested_extras": [
          "t_present8",
          "e_share8"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "마음을 생각하며 고운 말로 대화하기 ② — 상황 대화 나누기",
          "levels": {
            "읽기": {
              "q": "'미안해, 다음엔 조심할게.' — '괜찮아, 그럴 수 있어.' 대화를 나누어 읽어 볼까요?",
              "a": "사과와 받아 주는 대화"
            },
            "쓰기": {
              "q": "줄넘기를 하다 부딪친 상황에서 나눌 고운 말 대화를 두 줄 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "짝과 상황을 정해 고운 말로 대화를 주고받아 볼까요?",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "상황 대화 짝 활동",
          "type": "pair",
          "goal": "상황에 맞게 고운 말로 대화해요",
          "body": "짝과 상황(부딪침·도움·양보)을 하나 정해 고운 말로 대화를 주고받고, 상황을 바꿔 다시 해요.",
          "materials": [],
          "minutes": 7
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "실수했을 때 먼저 할 말은?",
              "a": "미안해"
            },
            {
              "q": "사과를 받으면 할 수 있는 말은?",
              "a": "괜찮아, 그럴 수 있어"
            },
            {
              "q": "고운 말로 대화하면?",
              "a": "사이가 좋아져요"
            }
          ],
          "self": [
            "상황에 맞게 고운 말로 대화해요",
            "조금 어색해요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "여러 상황으로 역할놀이를 했어요",
            "고운 말로 마음을 주고받았어요",
            "역할놀이를 발표하고 나눴어요"
          ]
        },
        "suggested_extras": [
          "q_reflect8"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "고운 말로 마음을 나눠요",
          "body": "다음 시간에는 이야기를 들으며 도움을 주고받고 고마운 마음을 전하는 법을 배워 볼 거예요!"
        },
        "suggested_extras": [
          "e_heart8"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_ready8",
        "type": "fun_question",
        "icon": "💡",
        "title": "하고 싶은 역할",
        "content": "\"어떤 역할을 맡아 보고 싶나요?\" 역할놀이 흥미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_play8",
        "type": "tip",
        "icon": "🧩",
        "title": "진짜처럼",
        "content": "역할놀이는 표정·말투를 살려 진짜처럼 해 보게 하면 더 재미있어요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_pick8",
        "type": "fun_question",
        "icon": "🎭",
        "title": "어떤 상황?",
        "content": "\"어떤 상황으로 역할놀이를 해 보고 싶나요?\" 상황을 골라요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_play8",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 반 상황",
        "content": "우리 반에서 실제로 있었던 상황을 역할놀이로 만들어 보게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_real8",
        "type": "tip",
        "icon": "🧩",
        "title": "순서대로",
        "content": "상황 정하기→역할 나누기→대화하기 순서로 차근차근 진행하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_just",
        "type": "misconception",
        "icon": "❓",
        "title": "장난 아니에요",
        "content": "역할놀이가 지나친 장난이 되지 않게, 마음을 담아 진지하게 하도록 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good8",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 잘됐을까",
        "content": "\"이 대화가 왜 좋은 대화일까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_play8",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 고운 말 짝짓기",
        "description": "역할놀이 상황과 고운 말을 짝지어 보세요.",
        "hint": "상대 마음을 헤아려요.",
        "pairs": [
          {
            "a": {
              "text": "💧 물 쏟음"
            },
            "b": {
              "text": "같이 닦자"
            }
          },
          {
            "a": {
              "text": "🤝 부딪힘"
            },
            "b": {
              "text": "안 다쳤어?"
            }
          },
          {
            "a": {
              "text": "🎁 도움받음"
            },
            "b": {
              "text": "고마워"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present8",
        "type": "tip",
        "icon": "🗣",
        "title": "격려와 칭찬",
        "content": "발표 모둠을 격려하고, 보는 친구는 좋았던 점을 찾게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_share8",
        "type": "extension",
        "icon": "⬆",
        "title": "좋은 점 찾기",
        "content": "\"방금 역할놀이에서 어떤 고운 말이 좋았나요?\" 구체적으로 칭찬하게 해요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect8",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"좋은 대화를 만드는 건 무엇이죠?\" 마음·고운 말을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_heart8",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 나누기 예고",
        "content": "\"다음엔 고마운 마음을 전하는 법을 배워요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 9,
      "title": "고운 말로 마음을 나눠요 ①",
      "std": "[2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 도움 주고받은 경험 → 자체 「민지의 줄넘기」 → 인물 마음 짚기 → 고마운 마음 떠올리기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "고운 말로 마음을 나눠요",
          "subtitle": "7단원 · 9/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_help9",
          "t_story9"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "이야기를 들으며 인물의 마음을 생각해요",
            "도움을 주고받는 마음을 느껴요",
            "고마운 마음을 어떻게 전할지 떠올려요"
          ]
        },
        "suggested_extras": [
          "t_story9"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "민지가 줄넘기를 못 해 속상해요 🪢",
          "visual": "😔",
          "question": "민지는 줄넘기가 자꾸 걸려 속상했어요.<br>이때 친구가 어떻게 해 주면 좋을까요?",
          "img": "assets/photo/korean/g2u7_share1.jpg"
        },
        "suggested_extras": [
          "q_minji",
          "r_help9"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "실수했을 때 먼저 할 말은?",
              "a": "미안해"
            },
            {
              "q": "고운 말로 대화하면?",
              "a": "사이가 좋아져요"
            }
          ],
          "from": "u7_l08"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "「민지의 줄넘기」 이야기",
          "content": "줄넘기가 걸려 속상한 민지에게 친구가 **\"천천히 같이 해 보자\"** 하며 도와줬어요. 함께 연습한 끝에 민지가 성공하자, 민지는 **\"고마워, 네 덕분이야!\"** 하며 활짝 웃었지요.",
          "symbol_meanings": [
            {
              "symbol": "자꾸 걸림",
              "meaning": "속상하고 풀 죽은 마음"
            },
            {
              "symbol": "\"같이 해 보자\"",
              "meaning": "도와주는 고운 말"
            },
            {
              "symbol": "함께 연습",
              "meaning": "마음을 나누는 행동"
            },
            {
              "symbol": "\"고마워!\"",
              "meaning": "고마운 마음을 전해요"
            }
          ]
        },
        "suggested_extras": [
          "t_share9",
          "b_book9"
        ],
        "tnote": {
          "ask": [
            "마음을 담은 말과 그냥 하는 말은 무엇이 다를까?"
          ],
          "watch": "고마움·미안함 전하기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 장면, 어떤 마음일까요? 💭",
          "sub": "「민지의 줄넘기」 장면 속 마음을 함께 짚어 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "민지가 줄넘기에 자꾸 걸려요.",
              "emoji": "😔",
              "name": "속상하고 풀 죽은 마음"
            },
            {
              "clue": "친구가 \"같이 해 보자\" 하며 다가와요.",
              "emoji": "🤗",
              "name": "돕고 싶은 따뜻한 마음"
            },
            {
              "clue": "민지가 성공하고 \"고마워!\" 해요.",
              "emoji": "😄",
              "name": "기쁘고 고마운 마음"
            }
          ],
          "outro": "고운 말과 도움이 마음을 나눴어요. 나라면 어떤 고운 말을 해 줄까요? 😊"
        },
        "suggested_extras": [
          "q_why9",
          "g_minji"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "비슷한 경험을 나눠요",
          "question": "도움을 주고받은 적이 있나요?",
          "items": [
            "친구를 도와주거나 도움받은 적이 있나요?",
            "그때 어떤 고운 말을 주고받았나요?",
            "어떤 마음이 들었나요?"
          ]
        },
        "suggested_extras": [
          "t_relate9",
          "e_exp9"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "고운 말로 마음 나누기 ① — 고마움·미안함 전하기",
          "levels": {
            "읽기": {
              "q": "'도와줘서 정말 고마워.'를 마음을 담아 읽어 볼까요?",
              "a": "고마움을 전하는 말"
            },
            "쓰기": {
              "q": "고마운 마음이나 미안한 마음을 전하는 짧은 쪽지를 한 줄 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "오늘 고마웠던 친구에게 전하고 싶은 말을 짝에게 말해 봐요.",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "고마움·미안함 쪽지 짝 활동",
          "type": "pair",
          "goal": "고마움과 미안함을 고운 말로 전해요",
          "body": "짝에게 전하고 싶은 고마움이나 미안함을 한 줄 쪽지로 써서 건네고, 서로 읽어 줘요.",
          "materials": [
            "쪽지 종이"
          ],
          "minutes": 7
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "도움을 받았을 때 전하는 마음은?",
              "a": "고마움"
            },
            {
              "q": "잘못했을 때 전하는 마음은?",
              "a": "미안함"
            },
            {
              "q": "마음을 담아 말하면?",
              "a": "진심이 잘 전해져요"
            }
          ],
          "self": [
            "고마움·미안함을 고운 말로 전해요",
            "조금 어색해요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "이야기 속 인물의 마음을 생각했어요",
            "도움을 주고받는 따뜻한 마음을 느꼈어요",
            "고마운 마음을 떠올렸어요"
          ]
        },
        "suggested_extras": [
          "q_reflect9"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "고마운 마음을 전해요",
          "body": "다음 시간에는 고운 말로 고마운 마음을 직접 전하고 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_thank9"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_help9",
        "type": "fun_question",
        "icon": "💡",
        "title": "도움의 기억",
        "content": "\"친구가 도와줘서 고마웠던 적이 있나요?\" 이야기와 경험을 이어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_story9",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 따라가기",
        "content": "이야기 속 민지의 마음이 어떻게 바뀌는지 따라가게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_minji",
        "type": "fun_question",
        "icon": "🪢",
        "title": "어떻게 도울까",
        "content": "\"여러분이 친구라면 어떻게 도와줄까요?\" 인물에 몰입하게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_help9",
        "type": "real_world",
        "icon": "🌍",
        "title": "함께 연습한 일",
        "content": "줄넘기·달리기 등 친구와 함께 연습한 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_share9",
        "type": "tip",
        "icon": "🧩",
        "title": "고운 말+행동",
        "content": "고운 말과 따뜻한 행동이 함께할 때 마음이 더 잘 나뉨을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "b_book9",
        "type": "book",
        "icon": "📖",
        "title": "마음을 나누는 이야기",
        "content": "도움·우정이 담긴 그림책을 함께 읽으면 좋아요.",
        "source": "그림책(시중 다수 — 임의 선택)",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_why9",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 그 마음?",
        "content": "\"왜 그런 마음이 들었을까요?\" 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_minji",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 마음 짝짓기",
        "description": "이야기 장면과 인물의 마음을 짝지어 보세요.",
        "hint": "그 상황의 마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "😔 자꾸 걸림"
            },
            "b": {
              "text": "속상한 마음"
            }
          },
          {
            "a": {
              "text": "🤗 같이 해 보자"
            },
            "b": {
              "text": "돕고 싶은 마음"
            }
          },
          {
            "a": {
              "text": "😄 성공"
            },
            "b": {
              "text": "고마운 마음"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_relate9",
        "type": "tip",
        "icon": "🗣",
        "title": "경험과 잇기",
        "content": "도움을 주고받은 경험과 그때 고운 말을 떠올려 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_exp9",
        "type": "extension",
        "icon": "⬆",
        "title": "도운 사람 마음",
        "content": "\"도와준 친구는 어떤 마음이었을까요?\" 다른 인물 마음도 상상해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect9",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"고운 말과 도움은 무엇을 나누죠?\" 마음을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_thank9",
        "type": "extension",
        "icon": "⬆",
        "title": "고마움 예고",
        "content": "\"다음엔 고마운 마음을 직접 전해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l10"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 10,
      "title": "고운 말로 마음을 나눠요 ②",
      "std": "[2국01-02] · [2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 고마운 마음 떠올리기 → 마음 전하는 고운 말 → 상황별 고운 말 고르기 → 고마운 마음 전하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "고운 말로 마음을 나눠요",
          "subtitle": "7단원 · 10/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_thank10",
          "t_express10"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "고마운 사람을 떠올려요",
            "마음을 전하는 고운 말을 알아봐요",
            "고운 말로 고마운 마음을 전해요"
          ]
        },
        "suggested_extras": [
          "t_express10"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "고마운 사람이 있나요? 💗",
          "visual": "💗",
          "question": "나를 도와주거나 챙겨 준 고마운 사람이 있나요?<br>그 마음을 어떻게 전하면 좋을까요?",
          "img": "assets/photo/korean/g2u7_share2.jpg"
        },
        "suggested_extras": [
          "q_who10",
          "r_thank10"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "도움을 받았을 때 전하는 마음은?",
              "a": "고마움"
            },
            {
              "q": "마음을 담아 말하면?",
              "a": "진심이 잘 전해져요"
            }
          ],
          "from": "u7_l09"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "마음을 전하는 고운 말",
          "content": "고마운 마음은 **말로 전할 때** 더 잘 전해져요. \"고마워\"에 **무엇이 고마웠는지** 까닭을 더하면 마음이 **더 깊이** 전해져요!",
          "symbol_meanings": [
            {
              "symbol": "\"고마워\"",
              "meaning": "고마운 마음을 전해요"
            },
            {
              "symbol": "\"~해 줘서\"",
              "meaning": "무엇이 고마운지 더해요"
            },
            {
              "symbol": "표정·눈맞춤",
              "meaning": "마음을 담아 바라봐요"
            },
            {
              "symbol": "마음이 깊이",
              "meaning": "까닭을 더하면 더 잘 전해져요"
            }
          ]
        },
        "suggested_extras": [
          "t_reason10",
          "x_short10"
        ],
        "tnote": {
          "ask": [
            "어떤 말을 들으면 다시 힘이 날까?"
          ],
          "watch": "위로·격려하기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "마음을 더 잘 전하는 말은? 💬",
          "sub": "고마운 마음을 전하는 말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "무거운 짐을 들어 준 친구에게",
              "emoji": "📦",
              "name": "\"무거웠는데 들어 줘서 고마워!\""
            },
            {
              "clue": "넘어졌을 때 일으켜 준 친구에게",
              "emoji": "🤕",
              "name": "\"일으켜 줘서 정말 고마워.\""
            },
            {
              "clue": "준비물을 빌려준 친구에게",
              "emoji": "✂️",
              "name": "\"빌려줘서 고마워, 다음엔 내가 빌려줄게!\""
            }
          ],
          "outro": "\"왜 고마운지\"를 더하면 마음이 더 깊이 전해져요. 고마운 사람에게 전해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_choose10",
          "g_thank10"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "고마운 마음을 전해요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 고마운 사람과 그 까닭을 고운 말로 전해 봐요!",
          "count": 24,
          "hint": "“저는 ◯◯에게 ~해 줘서 고맙습니다” 처럼 까닭을 담아 말해 봐요",
          "end_msg": "모두 고마운 마음을 멋지게 전했어요. 마음이 따뜻해졌어요! 👏"
        },
        "suggested_extras": [
          "t_present10",
          "e_more10"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "고운 말로 마음 나누기 ② — 위로와 격려하기",
          "levels": {
            "읽기": {
              "q": "'힘내, 넌 할 수 있어!'를 응원하는 목소리로 읽어 볼까요?",
              "a": "격려하는 말"
            },
            "쓰기": {
              "q": "속상해하거나 실수한 친구에게 건넬 위로·격려의 말을 한 문장 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "위로와 격려를 받으면 마음이 어떻게 되는지 짝에게 말해 봐요.",
              "a": "힘이 나고 고마워요"
            }
          }
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "위로·격려 건네기 짝 활동",
          "type": "pair",
          "goal": "위로와 격려를 고운 말로 건네요",
          "body": "짝이 속상했던 일을 말하면 위로나 격려의 고운 말을 건네고, 번갈아 해요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "속상한 친구에게 건네는 말은?",
              "a": "위로하는 고운 말"
            },
            {
              "q": "어려워하는 친구에게는?",
              "a": "격려하는 말(힘내)"
            },
            {
              "q": "위로·격려를 받으면?",
              "a": "힘이 나요"
            }
          ],
          "self": [
            "위로와 격려를 고운 말로 건네요",
            "조금 어색해요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 배운 것",
          "points": [
            "고마운 사람을 떠올렸어요",
            "까닭을 더해 고운 말로 전했어요",
            "고운 말로 마음을 나눴어요"
          ]
        },
        "suggested_extras": [
          "q_reflect10"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "고운 말 놀이를 해요",
          "body": "다음 시간에는 고운 말 놀이를 하며 배운 고운 말을 즐겁게 연습해 볼 거예요!"
        },
        "suggested_extras": [
          "e_game10"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_thank10",
        "type": "fun_question",
        "icon": "💡",
        "title": "고마운 마음",
        "content": "\"오늘 누군가에게 고마운 마음이 든 적 있나요?\" 마음을 떠올리게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_express10",
        "type": "tip",
        "icon": "🧩",
        "title": "말로 전하기",
        "content": "마음은 속에만 두지 말고 고운 말로 직접 전할 때 더 잘 전해짐을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_who10",
        "type": "fun_question",
        "icon": "💗",
        "title": "누구에게?",
        "content": "\"가장 고마운 사람은 누구인가요?\" 대상을 떠올리게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_thank10",
        "type": "real_world",
        "icon": "🌍",
        "title": "고마운 순간",
        "content": "가족·친구·선생님께 고마웠던 순간과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_reason10",
        "type": "tip",
        "icon": "🧩",
        "title": "까닭 더하기",
        "content": "\"고마워\"에 \"~해 줘서\"를 더하면 마음이 더 깊이 전해짐을 연습하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_short10",
        "type": "misconception",
        "icon": "❓",
        "title": "건성 인사 주의",
        "content": "건성으로 \"고마워\"만 하기보다 까닭과 마음을 담게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_choose10",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 말?",
        "content": "\"나는 어떤 말로 고마움을 전할까요?\" 자기 말을 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_thank10",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 고마운 말 짝짓기",
        "description": "상황과 까닭을 담은 고마운 말을 짝지어 보세요.",
        "hint": "무엇이 고마운지 담아요.",
        "pairs": [
          {
            "a": {
              "text": "📦 짐 들어 줌"
            },
            "b": {
              "text": "들어 줘서 고마워"
            }
          },
          {
            "a": {
              "text": "🤕 일으켜 줌"
            },
            "b": {
              "text": "일으켜 줘서 고마워"
            }
          },
          {
            "a": {
              "text": "✂️ 빌려줌"
            },
            "b": {
              "text": "빌려줘서 고마워"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present10",
        "type": "tip",
        "icon": "🗣",
        "title": "마음 담아",
        "content": "고마운 사람과 까닭을 담아 또박또박 말하게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_more10",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 더 전하기",
        "content": "\"고마운 마음을 글이나 그림으로도 전할 수 있을까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect10",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"고마운 마음을 더 잘 전하려면?\" 까닭 더하기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_game10",
        "type": "extension",
        "icon": "⬆",
        "title": "놀이 예고",
        "content": "\"다음엔 고운 말 놀이를 해요!\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l11"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 11,
      "title": "고운 말 놀이를 해요 ①",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 놀이 방법 알기 → 고운 말 카드 만들기 → 상황에 맞는 고운 말 놀이 → 짝 놀이 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "고운 말 놀이를 해요",
          "subtitle": "7단원 · 11/15차시 · 실천"
        },
        "suggested_extras": [
          "q_game11",
          "t_play11"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "고운 말 놀이 방법을 알아봐요",
            "상황 카드에 맞는 고운 말을 말해요",
            "짝과 고운 말 놀이를 해요"
          ]
        },
        "suggested_extras": [
          "t_play11"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "고운 말로 놀아 볼까요? 🎲",
          "visual": "🎲",
          "question": "상황 카드를 뽑아 어울리는 고운 말을 말하는 놀이예요.<br>어떻게 하면 재미있을까요?",
          "img": "assets/photo/korean/g2u7_play1.jpg"
        },
        "suggested_extras": [
          "q_how11",
          "r_play11"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "속상한 친구에게 건네는 말은?",
              "a": "위로하는 고운 말"
            },
            {
              "q": "위로·격려를 받으면?",
              "a": "힘이 나요"
            }
          ],
          "from": "u7_l10"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "고운 말 놀이 방법",
          "content": "고운 말 놀이는 **상황 카드 뽑기 → 어울리는 고운 말 말하기 → 잘하면 다음 차례**로 이어져요. 빠르게 말하기보다 **상대의 마음에 맞는** 고운 말을 찾는 것이 중요해요!",
          "symbol_meanings": [
            {
              "symbol": "① 카드 뽑기",
              "meaning": "상황 카드를 골라요"
            },
            {
              "symbol": "② 고운 말 말하기",
              "meaning": "어울리는 고운 말을 해요"
            },
            {
              "symbol": "③ 까닭 더하기",
              "meaning": "마음을 담으면 더 좋아요"
            },
            {
              "symbol": "④ 다음 차례",
              "meaning": "번갈아 가며 놀아요"
            }
          ]
        },
        "suggested_extras": [
          "t_rule11",
          "x_speed"
        ],
        "tnote": {
          "ask": [
            "놀이로 하면 고운 말이 왜 더 잘 떠오를까?"
          ],
          "watch": "고운 말 이어 말하기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 상황 카드엔 어떤 고운 말? 🎴",
          "sub": "상황 카드를 보고 어울리는 고운 말을 함께 말해 봐요. 카드를 누르면 예가 나와요!",
          "cards": [
            {
              "clue": "\"친구가 도와줬어요\" 카드",
              "emoji": "🤝",
              "name": "\"고마워, 덕분에 쉬웠어!\""
            },
            {
              "clue": "\"친구가 아파 보여요\" 카드",
              "emoji": "🤒",
              "name": "\"괜찮아? 많이 아파?\""
            },
            {
              "clue": "\"친구가 상을 받았어요\" 카드",
              "emoji": "🏅",
              "name": "\"축하해! 정말 멋지다!\""
            }
          ],
          "outro": "상황에 꼭 맞는 고운 말을 찾았어요. 이제 짝과 놀이해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick11",
          "g_play11"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "짝과 고운 말 놀이를 해요",
          "question": "짝과 번갈아 고운 말 놀이를 해 볼까요?",
          "items": [
            "누가 먼저 카드를 뽑을까요?",
            "상황에 어울리는 고운 말을 말해 보세요",
            "짝의 고운 말 중 좋았던 것은 무엇인가요?"
          ]
        },
        "suggested_extras": [
          "t_pair11",
          "e_card11"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "고운 말 놀이하기 ① — 고운 말 이어 말하기",
          "levels": {
            "읽기": {
              "q": "'고마워' → '미안해' → '괜찮아'처럼 고운 말을 이어 읽어 볼까요?",
              "a": "고운 말 잇기"
            },
            "쓰기": {
              "q": "내가 아는 고운 말을 세 가지 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "짝과 고운 말을 하나씩 번갈아 이어 말해 볼까요?",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "고운 말 이어 말하기 짝 놀이",
          "type": "pair",
          "goal": "고운 말을 즐겁게 떠올려요",
          "body": "짝과 번갈아 고운 말을 하나씩 이어 말하고, 막히지 않고 오래 잇기에 도전해요.",
          "materials": [],
          "minutes": 6
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "고운 말 놀이로 무엇을 익히나요?",
              "a": "여러 고운 말"
            },
            {
              "q": "고운 말을 많이 알면?",
              "a": "상황에 맞게 골라 써요"
            },
            {
              "q": "놀이로 배우면?",
              "a": "즐겁게 익혀요"
            }
          ],
          "self": [
            "고운 말을 즐겁게 떠올려요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 한 일",
          "points": [
            "고운 말 놀이 방법을 알았어요",
            "상황에 맞는 고운 말을 말했어요",
            "짝과 즐겁게 고운 말 놀이를 했어요"
          ]
        },
        "suggested_extras": [
          "q_reflect11"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "모둠 고운 말 놀이를 해요",
          "body": "다음 시간에는 모둠이 함께 고운 말 놀이를 하며 배운 고운 말을 실천해 볼 거예요!"
        },
        "suggested_extras": [
          "e_group11"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_game11",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋아하는 놀이",
        "content": "\"카드 놀이를 해 본 적 있나요?\" 놀이 흥미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_play11",
        "type": "tip",
        "icon": "🧩",
        "title": "즐겁게 실천",
        "content": "고운 말 놀이는 배운 고운 말을 즐겁게 실천하는 활동임을 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how11",
        "type": "fun_question",
        "icon": "🎲",
        "title": "재미있게",
        "content": "\"어떻게 하면 더 재미있을까요?\" 놀이 방법을 함께 정해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_play11",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 놀이",
        "content": "교실에서 해 본 카드·역할 놀이 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_rule11",
        "type": "tip",
        "icon": "🧩",
        "title": "마음에 맞게",
        "content": "빠르게 말하기 경쟁이 아니라 상황의 마음에 맞는 고운 말을 찾게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_speed",
        "type": "misconception",
        "icon": "❓",
        "title": "빠르기보다 마음",
        "content": "빨리 말하는 놀이가 아니에요. 마음에 맞는 고운 말을 찾는 데 집중하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick11",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 말?",
        "content": "\"이 상황에 또 어떤 고운 말이 어울릴까요?\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_play11",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 고운 말 짝짓기",
        "description": "상황 카드와 고운 말을 짝지어 보세요.",
        "hint": "그 마음에 맞는 말을 골라요.",
        "pairs": [
          {
            "a": {
              "text": "🤝 도움"
            },
            "b": {
              "text": "고마워"
            }
          },
          {
            "a": {
              "text": "🤒 아픔"
            },
            "b": {
              "text": "괜찮아?"
            }
          },
          {
            "a": {
              "text": "🏅 상"
            },
            "b": {
              "text": "축하해"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_pair11",
        "type": "tip",
        "icon": "🗣",
        "title": "번갈아 가며",
        "content": "짝과 번갈아 카드를 뽑고 고운 말을 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_card11",
        "type": "extension",
        "icon": "⬆",
        "title": "새 카드 만들기",
        "content": "\"우리만의 상황 카드를 만들어 볼까요?\" 놀이를 확장해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect11",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"고운 말 놀이에서 무엇을 했죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_group11",
        "type": "extension",
        "icon": "⬆",
        "title": "모둠 놀이 예고",
        "content": "\"다음엔 모둠이 함께 놀이해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l12"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 12,
      "title": "고운 말 놀이를 해요 ②",
      "std": "[2국01-02] · [2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 모둠 놀이 약속 → 모둠 고운 말 놀이 → 잘된 고운 말 짚기 → 소감 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "고운 말 놀이를 해요",
          "subtitle": "7단원 · 12/15차시 · 실천"
        },
        "suggested_extras": [
          "q_group12",
          "t_group12"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "모둠 놀이 약속을 정해요",
            "모둠이 함께 고운 말 놀이를 해요",
            "놀이 소감을 나눠요"
          ]
        },
        "suggested_extras": [
          "t_group12"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "모둠이 함께 놀아요 🙌",
          "visual": "🙌",
          "question": "이번엔 모둠이 함께 고운 말 놀이를 해요.<br>모두 즐겁게 하려면 어떤 약속이 필요할까요?",
          "img": "assets/photo/korean/g2u7_play2.jpg"
        },
        "suggested_extras": [
          "q_rule12",
          "r_group12"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "고운 말을 많이 알면?",
              "a": "상황에 맞게 골라 써요"
            },
            {
              "q": "놀이로 배우면?",
              "a": "즐겁게 익혀요"
            }
          ],
          "from": "u7_l11"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "모둠 놀이 약속",
          "content": "모둠 놀이는 **차례를 지키고**, 친구가 말할 때 **끝까지 듣고**, 좋은 고운 말에 **박수**를 쳐 줘요. 모두가 즐겁게 참여하는 것이 가장 중요해요!",
          "symbol_meanings": [
            {
              "symbol": "차례 지키기",
              "meaning": "순서대로 해요"
            },
            {
              "symbol": "끝까지 듣기",
              "meaning": "친구 말을 들어요"
            },
            {
              "symbol": "박수·칭찬",
              "meaning": "좋은 말에 반응해요"
            },
            {
              "symbol": "모두 참여",
              "meaning": "함께 즐겨요"
            }
          ]
        },
        "suggested_extras": [
          "t_fair12",
          "x_win"
        ],
        "tnote": {
          "ask": [
            "역할이 되어 말해 보면 무엇이 좋을까?"
          ],
          "watch": "고운 말 역할놀이",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "모둠 놀이, 바른 모습은? ✅",
          "sub": "모둠 놀이의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "내 차례가 아닐 때는?",
              "emoji": "🙋",
              "name": "친구 말을 끝까지 들어요"
            },
            {
              "clue": "친구가 좋은 고운 말을 했을 때는?",
              "emoji": "👏",
              "name": "박수로 칭찬해 줘요"
            },
            {
              "clue": "놀이에서 가장 중요한 것은?",
              "emoji": "😊",
              "name": "모두 즐겁게 참여하기"
            }
          ],
          "outro": "서로 배려하면 놀이가 더 즐거워요. 모둠이 함께 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good12",
          "g_group12"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "모둠 놀이 소감을 나눠요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 모둠 고운 말 놀이를 하며 좋았던 점을 나눠요!",
          "count": 24,
          "hint": "“◯◯가 ~라고 말한 게 가장 좋았어요” 처럼 구체적으로 말해 봐요",
          "end_msg": "모두 고운 말로 즐겁게 놀았어요. 우리 반이 더 따뜻해졌어요! 👏"
        },
        "suggested_extras": [
          "t_present12",
          "e_share12"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "고운 말 놀이하기 ② — 역할놀이",
          "levels": {
            "읽기": {
              "q": "'같이 놀아도 될까?' — '그럼, 좋아!' 대화를 역할을 나눠 읽어 볼까요?",
              "a": "역할 대화"
            },
            "쓰기": {
              "q": "역할놀이에서 쓸 고운 말 대사를 한 줄 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "짝과 역할을 정해 고운 말로 짧은 역할놀이를 해 볼까요?",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "고운 말 역할놀이 짝 활동",
          "type": "pair",
          "goal": "역할놀이로 고운 말을 써 봐요",
          "body": "짝과 상황(놀이에 끼기·물건 빌리기)을 정해 고운 말 대사로 역할놀이를 하고, 역할을 바꿔요.",
          "materials": [],
          "minutes": 7
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "역할놀이에서 무엇을 써요?",
              "a": "상황에 맞는 고운 말"
            },
            {
              "q": "함께 놀자고 할 때는?",
              "a": "같이 놀아도 될까?"
            },
            {
              "q": "고운 말 역할놀이를 하면?",
              "a": "고운 말이 몸에 익어요"
            }
          ],
          "self": [
            "역할놀이로 고운 말을 써요",
            "조금 어색해요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 한 일",
          "points": [
            "모둠 놀이 약속을 지켰어요",
            "모둠이 함께 고운 말 놀이를 했어요",
            "놀이 소감을 나눴어요"
          ]
        },
        "suggested_extras": [
          "q_reflect12"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "단원을 마무리해요",
          "body": "다음 시간에는 배운 것을 스스로 돌아보고, '~것 같다' 표현을 익히며 단원을 마무리할 거예요!"
        },
        "suggested_extras": [
          "e_wrap12"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_group12",
        "type": "fun_question",
        "icon": "💡",
        "title": "모둠 놀이",
        "content": "\"모둠이 함께한 놀이 중 재미있었던 게 있나요?\" 흥미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_group12",
        "type": "tip",
        "icon": "🧩",
        "title": "모두 참여",
        "content": "한 사람도 빠짐없이 참여하도록 역할과 차례를 정해 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_rule12",
        "type": "fun_question",
        "icon": "🙌",
        "title": "어떤 약속?",
        "content": "\"모두 즐거우려면 어떤 약속이 필요할까요?\" 약속을 함께 정해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_group12",
        "type": "real_world",
        "icon": "🌍",
        "title": "모둠 활동",
        "content": "모둠으로 함께한 활동 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_fair12",
        "type": "tip",
        "icon": "🧩",
        "title": "차례와 배려",
        "content": "차례를 지키고 친구 말을 끝까지 듣는 배려를 강조하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_win",
        "type": "misconception",
        "icon": "❓",
        "title": "이기기보다 즐기기",
        "content": "승부보다 모두 즐겁게 참여하는 데 초점을 두게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good12",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"모둠 놀이의 바른 모습은 무엇이죠?\" 차례·듣기·박수를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_group12",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "모둠 놀이 상황과 바른 모습을 짝지어 보세요.",
        "hint": "서로 배려하는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🙋 내 차례 아님"
            },
            "b": {
              "text": "끝까지 듣기"
            }
          },
          {
            "a": {
              "text": "👏 좋은 말"
            },
            "b": {
              "text": "박수 치기"
            }
          },
          {
            "a": {
              "text": "😊 놀이"
            },
            "b": {
              "text": "모두 즐기기"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present12",
        "type": "tip",
        "icon": "🗣",
        "title": "구체적 소감",
        "content": "\"재밌었다\"보다 어떤 고운 말이 좋았는지 구체적으로 말하게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_share12",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 고운 말",
        "content": "\"오늘 들은 고운 말 중 우리 반 으뜸 고운 말을 뽑아 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect12",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"모둠 놀이에서 무엇을 했죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_wrap12",
        "type": "extension",
        "icon": "⬆",
        "title": "마무리 예고",
        "content": "\"다음엔 단원을 마무리해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l13"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 13,
      "title": "배운 내용을 정리해요",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 고운 말·발표 자세 정리 → 정리 퀴즈 → 실천 다짐 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "배운 내용을 정리해요",
          "subtitle": "7단원 · 13/15차시 · 마무리"
        },
        "suggested_extras": [
          "q_back13",
          "t_wrap13"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "단원에서 배운 것을 돌아봐요",
            "고운 말과 바른 발표 자세를 정리해요",
            "고운 말 실천을 다짐해요"
          ]
        },
        "suggested_extras": [
          "t_wrap13"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "7단원에서 무엇을 배웠나요? 🎀",
          "visual": "💬",
          "question": "고운 말도 쓰고, 바른 자세로 발표하고, 역할놀이도 했어요.<br>가장 기억에 남는 것은 무엇인가요?",
          "img": "assets/photo/korean/g2u7_wrap1.jpg"
        },
        "suggested_extras": [
          "q_memory13",
          "r_back13"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "역할놀이에서 무엇을 써요?",
              "a": "상황에 맞는 고운 말"
            },
            {
              "q": "고운 말 역할놀이를 하면?",
              "a": "고운 말이 몸에 익어요"
            }
          ],
          "from": "u7_l12"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "고운 말·발표 자세 정리",
          "content": "이 단원에서 **고운 말로 마음을 전하는 법**과 **바른 자세로 발표하고 듣는 법**을 배웠어요. 상대의 마음을 생각하며 고운 말을 쓰면 모두가 행복해져요!",
          "symbol_meanings": [
            {
              "symbol": "고운 말",
              "meaning": "마음을 헤아린 말"
            },
            {
              "symbol": "상황에 맞게",
              "meaning": "고마울 때·미안할 때…"
            },
            {
              "symbol": "바른 발표",
              "meaning": "허리 펴고 또박또박"
            },
            {
              "symbol": "바른 듣기",
              "meaning": "바라보며 집중"
            }
          ]
        },
        "suggested_extras": [
          "t_method13",
          "x_forget"
        ],
        "tnote": {
          "ask": [
            "이 단원에서 무엇을 새로 알게 되었나?"
          ],
          "watch": "단원 정리·실천 다짐",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "배운 것을 확인해요 ✅",
          "sub": "이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 도와줬을 때 할 고운 말은?",
              "emoji": "🤝",
              "name": "\"고마워, ~해 줘서!\""
            },
            {
              "clue": "바른 발표 자세는?",
              "emoji": "🎤",
              "name": "허리 펴고 또박또박 앞을 보며"
            },
            {
              "clue": "친구 발표를 들을 때는?",
              "emoji": "👂",
              "name": "바라보며 끝까지 집중해요"
            }
          ],
          "outro": "배운 것을 잘 기억하고 있어요. 생활 속에서 고운 말을 실천해 봐요! 😊"
        },
        "suggested_extras": [
          "q_check13",
          "g_wrap13"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "고운 말 실천을 다짐해요",
          "question": "앞으로 어떤 고운 말을 실천하고 싶나요?",
          "items": [
            "가장 자주 쓰고 싶은 고운 말은?",
            "누구에게 고운 말을 전하고 싶나요?",
            "어떻게 실천할 수 있을까요?"
          ]
        },
        "suggested_extras": [
          "t_pledge",
          "e_pick13"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "배운 내용 정리하기",
          "levels": {
            "읽기": {
              "q": "'상대의 마음을 생각하며 고운 말을 써요.'를 또박또박 읽어 볼까요?",
              "a": "단원 정리 문장"
            },
            "쓰기": {
              "q": "이 단원에서 배운 것을 한 가지 골라 써 볼까요?",
              "a": "여러 답 (예: 고운 말·발표 자세)",
              "open": true
            },
            "말하기": {
              "q": "앞으로 실천하고 싶은 고운 말을 짝에게 말해 봐요.",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "배운 것 나누기 짝 활동",
          "type": "pair",
          "goal": "배운 내용을 함께 정리해요",
          "body": "짝과 이 단원에서 배운 것을 한 가지씩 번갈아 말하며 정리하고, 실천 다짐을 나눠요.",
          "materials": [],
          "minutes": 5
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "고운 말을 쓸 때 무엇을 생각하나요?",
              "a": "상대의 마음"
            },
            {
              "q": "바르게 발표하려면?",
              "a": "허리를 펴고 또렷한 목소리로"
            },
            {
              "q": "고운 말을 쓰면?",
              "a": "모두의 마음이 따뜻해져요"
            }
          ],
          "self": [
            "배운 내용을 정리했어요",
            "조금 헷갈려요",
            "다시 살펴보고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 한 일",
          "points": [
            "배운 것을 돌아봤어요",
            "고운 말과 발표 자세를 정리했어요",
            "고운 말 실천을 다짐했어요"
          ]
        },
        "suggested_extras": [
          "q_reflect13"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "기초를 다지고 마무리해요",
          "body": "다음 시간에는 '~것 같다' 표현을 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"
        },
        "suggested_extras": [
          "e_basic13"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_back13",
        "type": "fun_question",
        "icon": "💡",
        "title": "돌아보기",
        "content": "\"이 단원에서 새로 알게 된 고운 말이 있나요?\" 배움을 떠올려요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_wrap13",
        "type": "tip",
        "icon": "🧩",
        "title": "실천으로",
        "content": "정리에 그치지 말고 생활 속 고운 말 실천으로 이어지게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_memory13",
        "type": "fun_question",
        "icon": "💬",
        "title": "기억에 남는 활동",
        "content": "\"고운 말·발표·역할놀이 중 무엇이 가장 좋았나요?\" 단원 경험을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_back13",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 고운 말",
        "content": "집·학교에서 고운 말을 쓴 경험을 떠올리게 해요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_method13",
        "type": "tip",
        "icon": "🧩",
        "title": "두 갈래 정리",
        "content": "고운 말과 바른 발표·듣기 자세를 함께 정리하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_forget",
        "type": "misconception",
        "icon": "❓",
        "title": "말투도 함께",
        "content": "고운 말도 표정·말투가 퉁명스러우면 안 통해요. 함께 살피게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_check13",
        "type": "fun_question",
        "icon": "💡",
        "title": "무엇을 배웠지?",
        "content": "\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_wrap13",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "항목 ↔ 내용 짝짓기",
        "description": "배운 항목과 내용을 짝지어 보세요.",
        "hint": "단원에서 배운 것을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🤝 고운 말"
            },
            "b": {
              "text": "마음 헤아린 말"
            }
          },
          {
            "a": {
              "text": "🎤 발표"
            },
            "b": {
              "text": "허리 펴고 또박또박"
            }
          },
          {
            "a": {
              "text": "👂 듣기"
            },
            "b": {
              "text": "바라보며 집중"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_pledge",
        "type": "tip",
        "icon": "🗣",
        "title": "실천 다짐",
        "content": "막연한 다짐보다 \"누구에게·어떤 말을\" 구체적으로 다짐하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_pick13",
        "type": "extension",
        "icon": "⬆",
        "title": "고운 말 한 주",
        "content": "\"이번 주에 실천할 고운 말 한 가지를 정해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect13",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"무엇을 정리했죠?\" 고운 말·발표 자세를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_basic13",
        "type": "extension",
        "icon": "⬆",
        "title": "기초 다지기 예고",
        "content": "\"다음엔 '~것 같다' 표현과 글씨 쓰기를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l14"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 14,
      "title": "마무리하기 ① — 스스로 확인",
      "std": "[2국01-02] · [2국01-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 고운 말·발표 자세 확인 → 확인 퀴즈 → 스스로 확인 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ① — 스스로 확인",
          "subtitle": "7단원 · 14/15차시 · 마무리"
        },
        "suggested_extras": [
          "q_self14",
          "t_check14"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "배운 것을 스스로 돌아봐요",
            "고운 말·발표 자세를 확인해요",
            "얼마나 할 수 있는지 점검해요"
          ]
        },
        "suggested_extras": [
          "t_check14"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "나는 이만큼 할 수 있어요! 🌟",
          "visual": "🌟",
          "question": "이 단원에서 배운 것을 떠올려 봐요.<br>나는 무엇을 잘할 수 있게 되었나요?",
          "img": "assets/photo/korean/g2u7_wrap2.jpg"
        },
        "suggested_extras": [
          "q_grow",
          "r_self14"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "고운 말을 쓸 때 무엇을 생각하나요?",
              "a": "상대의 마음"
            },
            {
              "q": "고운 말을 쓰면?",
              "a": "모두의 마음이 따뜻해져요"
            }
          ],
          "from": "u7_l13"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "고운 말·발표 점검",
          "content": "상황에 맞는 **고운 말**을 쓸 수 있나요? **바른 자세**로 발표하고 들을 수 있나요? 스스로 돌아보며 잘한 점과 더 노력할 점을 찾아봐요.",
          "symbol_meanings": [
            {
              "symbol": "고운 말 쓰기",
              "meaning": "상황에 맞게 말해요"
            },
            {
              "symbol": "마음 전하기",
              "meaning": "까닭을 담아 전해요"
            },
            {
              "symbol": "바른 발표",
              "meaning": "또박또박 발표해요"
            },
            {
              "symbol": "바른 듣기",
              "meaning": "집중해 들어요"
            }
          ]
        },
        "suggested_extras": [
          "t_method14",
          "x_compare"
        ],
        "tnote": {
          "ask": [
            "무엇을 잘하게 되었고 무엇을 더 해 볼까?"
          ],
          "watch": "단원 자기 점검",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 것을 골라요 ✅",
          "sub": "고운 말·발표·듣기의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 도와줬을 때 바른 말은?",
              "emoji": "🤝",
              "name": "\"고마워, ~해 줘서!\""
            },
            {
              "clue": "발표할 때 바른 자세는?",
              "emoji": "🎤",
              "name": "허리 펴고 또박또박"
            },
            {
              "clue": "이렇게 하면 아쉬워요!",
              "emoji": "⚠️",
              "name": "고개 숙이고 작게 우물우물 말해요"
            }
          ],
          "outro": "잘하고 있는지 스스로 확인해 봐요. 더 노력할 점도 찾아보면 좋아요! 😊"
        },
        "suggested_extras": [
          "q_check14",
          "g_check14"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "스스로 확인해요",
          "question": "나는 이만큼 할 수 있나요?",
          "items": [
            "상황에 맞는 고운 말을 쓸 수 있나요?",
            "바른 자세로 발표하고 들을 수 있나요?",
            "더 노력하고 싶은 점은 무엇인가요?"
          ]
        },
        "suggested_extras": [
          "t_self14",
          "e_pick14"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "스스로 확인하기",
          "levels": {
            "읽기": {
              "q": "'나는 상황에 맞는 고운 말을 쓸 수 있어요.'를 읽으며 스스로 돌아볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "내가 가장 잘하게 된 것을 한 가지 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "더 노력하고 싶은 점을 짝에게 말해 봐요.",
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
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "잘한 점·노력할 점 나누기 짝 활동",
          "type": "pair",
          "goal": "배운 것을 스스로 확인해요",
          "body": "짝과 이 단원에서 잘하게 된 점과 더 노력할 점을 한 가지씩 번갈아 말하며 확인해요.",
          "materials": [],
          "minutes": 5
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "상황에 맞는 고운 말을 쓸 수 있나요?",
              "a": "스스로 점검해요"
            },
            {
              "q": "바른 자세로 발표·듣기를 하나요?",
              "a": "스스로 점검해요"
            },
            {
              "q": "더 노력할 점은?",
              "a": "스스로 찾아 다짐해요"
            }
          ],
          "self": [
            "배운 것을 스스로 확인했어요",
            "조금 헷갈려요",
            "다시 살펴보고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "오늘 한 일",
          "points": [
            "배운 것을 스스로 돌아봤어요",
            "고운 말·발표 자세를 확인했어요",
            "잘한 점·더 노력할 점을 찾았어요"
          ]
        },
        "suggested_extras": [
          "q_reflect14"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "다음 시간 예고",
          "preview": "기초를 다지고 마무리해요",
          "body": "다음 시간에는 '~것 같다' 표현을 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"
        },
        "suggested_extras": [
          "e_basic14"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_self14",
        "type": "fun_question",
        "icon": "💡",
        "title": "돌아보기",
        "content": "\"이 단원에서 가장 잘하게 된 것은 무엇인가요?\" 성장을 떠올려요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_check14",
        "type": "tip",
        "icon": "🧩",
        "title": "자기 돌아보기",
        "content": "비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_grow",
        "type": "fun_question",
        "icon": "🌟",
        "title": "나의 성장",
        "content": "\"단원 전과 후, 무엇이 달라졌나요?\" 성장을 짚어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_self14",
        "type": "real_world",
        "icon": "🌍",
        "title": "실천 돌아보기",
        "content": "생활 속에서 고운 말을 쓴 경험을 떠올리게 해요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_method14",
        "type": "tip",
        "icon": "🧩",
        "title": "두 갈래 점검",
        "content": "고운 말 쓰기와 바른 발표·듣기 두 갈래로 점검하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_compare",
        "type": "misconception",
        "icon": "❓",
        "title": "비교는 금물",
        "content": "친구와 비교하지 않고 자신의 성장에 초점을 두게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_check14",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 것은?",
        "content": "\"바른 고운 말·발표 모습은 무엇이죠?\" 배움을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_check14",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "항목 ↔ 바른 모습 짝짓기",
        "description": "항목과 바른 모습을 짝지어 보세요.",
        "hint": "단원에서 배운 것을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🤝 고운 말"
            },
            "b": {
              "text": "까닭 담아 말하기"
            }
          },
          {
            "a": {
              "text": "🎤 발표"
            },
            "b": {
              "text": "또박또박"
            }
          },
          {
            "a": {
              "text": "👂 듣기"
            },
            "b": {
              "text": "집중해 듣기"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_self14",
        "type": "tip",
        "icon": "🗣",
        "title": "솔직한 확인",
        "content": "잘한 점·더 노력할 점을 솔직하게 확인하게 하되 자기 돌아보기로 이끄세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_pick14",
        "type": "extension",
        "icon": "⬆",
        "title": "다음 다짐",
        "content": "\"더 노력하고 싶은 한 가지를 정해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect14",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"무엇을 점검했죠?\" 고운 말·발표 자세를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_basic14",
        "type": "extension",
        "icon": "⬆",
        "title": "기초 다지기 예고",
        "content": "\"다음엔 '~것 같다' 표현과 글씨 쓰기를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u7_l15"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 7,
      "n": 15,
      "title": "마무리하기 ② — 기초 다지기",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — '~것 같다' 표현 알기 → 짐작하는 말 쓰기 → 바른 표현 고르기 → 글씨 쓰기·단원 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ② — 기초 다지기",
          "subtitle": "7단원 · 15/15차시 · 마무리"
        },
        "suggested_extras": [
          "q_guess15",
          "t_like"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "'~것 같다' 표현을 알아봐요",
            "짐작하는 마음을 부드럽게 말해요",
            "배운 낱말을 바르게 써요"
          ]
        },
        "suggested_extras": [
          "t_like"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "\"비가 올 것 같아\" 🌧️",
          "visual": "🌧️",
          "question": "하늘이 어두워요. \"비가 와!\"와 \"비가 올 것 같아.\"<br>두 말은 어떻게 다를까요?",
          "img": "assets/photo/korean/g2u7_basic.jpg"
        },
        "suggested_extras": [
          "q_diff15",
          "r_guess"
        ]
      },
      {
        "id": "s100",
        "stage": "도입",
        "block": "review",
        "data": {
          "title": "지난 시간에 배운 것",
          "items": [
            {
              "q": "상황에 맞는 고운 말을 쓸 수 있나요?",
              "a": "스스로 점검해요"
            },
            {
              "q": "더 노력할 점은?",
              "a": "스스로 찾아 다짐해요"
            }
          ],
          "from": "u7_l14"
        },
        "suggested_extras": [
          "e_prev_review"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "'~것 같다'로 부드럽게",
          "content": "확실하지 않을 때나 내 **짐작**을 말할 땐 **'~것 같다'**를 써요. \"네가 속상한 것 같아\"처럼 말하면 단정 짓지 않고 상대의 마음을 **부드럽게** 헤아릴 수 있어요.",
          "symbol_meanings": [
            {
              "symbol": "\"비가 올 것 같아\"",
              "meaning": "확실하지 않은 짐작"
            },
            {
              "symbol": "\"속상한 것 같아\"",
              "meaning": "상대 마음 부드럽게 헤아림"
            },
            {
              "symbol": "\"맛있을 것 같아\"",
              "meaning": "내 생각을 조심스럽게"
            },
            {
              "symbol": "부드러운 말",
              "meaning": "단정 짓지 않아요"
            }
          ]
        },
        "suggested_extras": [
          "t_soft",
          "x_sure"
        ],
        "tnote": {
          "ask": [
            "확실하지 않을 때 어떻게 말하면 좋을까?"
          ],
          "watch": "~것 같다·바른 글씨 다지기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "'~것 같다'로 말해 봐요 💬",
          "sub": "짐작하는 마음을 '~것 같다'로 바꿔 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구 표정이 안 좋아요. 어떻게 말할까요?",
              "emoji": "😟",
              "name": "\"무슨 일 있는 것 같아. 괜찮아?\""
            },
            {
              "clue": "하늘이 어두워요.",
              "emoji": "☁️",
              "name": "\"비가 올 것 같아.\""
            },
            {
              "clue": "친구가 만든 음식을 보고",
              "emoji": "🍪",
              "name": "\"정말 맛있을 것 같아!\""
            }
          ],
          "outro": "'~것 같다'를 쓰면 부드럽게 짐작을 말할 수 있어요. 이제 글씨도 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_use15",
          "g_like"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "글씨를 바르게 써요 ✍️",
          "content": "단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **고운 말 · 발표 · 미안해**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "고운 말",
              "meaning": "또박또박 칸에 맞춰"
            },
            {
              "symbol": "발표",
              "meaning": "바른 자세로"
            },
            {
              "symbol": "미안해",
              "meaning": "천천히 정성껏"
            }
          ]
        },
        "suggested_extras": [
          "t_write15",
          "e_more15"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "기초 다지기 — '~것 같다'로 부드럽게 말하기",
          "levels": {
            "읽기": {
              "q": "'네가 속상한 것 같아.'를 상대 마음을 헤아리듯 읽어 볼까요?",
              "a": "~것 같다 문장"
            },
            "쓰기": {
              "q": "내 짐작을 '~것 같다'를 넣어 한 문장 써 볼까요?",
              "a": "여러 답 (예: 비가 올 것 같다)",
              "open": true
            },
            "말하기": {
              "q": "'~것 같다'로 말하면 무엇이 좋은지 짝에게 말해 봐요.",
              "a": "단정 짓지 않고 부드럽게 전해요"
            }
          }
        },
        "suggested_extras": [
          "q_apply"
        ]
      },
      {
        "id": "s102",
        "stage": "활동",
        "block": "offline_activity",
        "data": {
          "tag": "👋 짝 활동",
          "title": "'~것 같다' 말놀이 짝 활동",
          "type": "pair",
          "goal": "'~것 같다'로 부드럽게 말해요",
          "body": "짝이 상황을 말하면 '~것 같다'를 넣어 짐작하는 말을 만들고, 번갈아 해요.",
          "materials": [],
          "minutes": 5
        },
        "suggested_extras": []
      },
      {
        "id": "s103",
        "stage": "정리",
        "block": "exit_ticket",
        "data": {
          "title": "오늘 확인해요",
          "items": [
            {
              "q": "짐작하는 마음을 부드럽게 말할 때 쓰는 표현은?",
              "a": "~것 같다"
            },
            {
              "q": "'~것 같다'로 말하면?",
              "a": "단정 짓지 않아 부드러워요"
            },
            {
              "q": "고운 말·발표 같은 낱말을 쓸 때는?",
              "a": "또박또박 바르게 써요"
            }
          ],
          "self": [
            "'~것 같다'로 부드럽게 말해요",
            "조금 헷갈려요",
            "다시 배우고 싶어요"
          ]
        },
        "suggested_extras": [
          "q_reflect"
        ]
      },
      {
        "id": "s07",
        "stage": "정리",
        "block": "summary",
        "data": {
          "title": "7단원에서 배운 것",
          "points": [
            "상황에 맞는 고운 말을 배웠어요",
            "바른 자세로 발표하고 들었어요",
            "'~것 같다'로 부드럽게 말하고 글씨를 썼어요"
          ]
        },
        "suggested_extras": [
          "q_reflect15"
        ]
      },
      {
        "id": "s08",
        "stage": "정리",
        "block": "next_lesson",
        "data": {
          "title": "단원을 모두 마쳤어요",
          "preview": "마음을 담은 고운 말로!",
          "body": "7단원을 모두 마쳤어요. 앞으로도 상대의 마음을 생각하며 고운 말을 써 봐요. 정말 수고했어요!"
        },
        "suggested_extras": [
          "e_end"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_guess15",
        "type": "fun_question",
        "icon": "💡",
        "title": "짐작하는 말",
        "content": "\"확실하지 않을 때 어떻게 말하나요?\" '~것 같다'에 관심을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_like",
        "type": "tip",
        "icon": "🧩",
        "title": "부드러운 표현",
        "content": "'~것 같다'는 단정 짓지 않고 부드럽게 짐작·생각을 말하는 표현임을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_diff15",
        "type": "fun_question",
        "icon": "🌧️",
        "title": "무엇이 다를까",
        "content": "\"'비가 와'와 '비가 올 것 같아'는 어떻게 다를까요?\" 차이를 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_guess",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 짐작",
        "content": "날씨·친구 기분을 짐작해 말한 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_soft",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 헤아리기",
        "content": "'~것 같다'로 상대의 마음을 단정 짓지 않고 부드럽게 헤아리게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_sure",
        "type": "misconception",
        "icon": "❓",
        "title": "단정 짓지 않기",
        "content": "\"너 화났지!\"처럼 단정 짓기보다 \"화난 것 같아\"로 부드럽게 말하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_use15",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떻게?",
        "content": "\"'~것 같다'로 또 어떤 말을 할 수 있을까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_like",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 짐작하는 말 짝짓기",
        "description": "상황과 '~것 같다' 표현을 짝지어 보세요.",
        "hint": "부드럽게 짐작해요.",
        "pairs": [
          {
            "a": {
              "text": "😟 안 좋은 표정"
            },
            "b": {
              "text": "속상한 것 같아"
            }
          },
          {
            "a": {
              "text": "☁️ 어두운 하늘"
            },
            "b": {
              "text": "비가 올 것 같아"
            }
          },
          {
            "a": {
              "text": "🍪 맛있는 음식"
            },
            "b": {
              "text": "맛있을 것 같아"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_write15",
        "type": "tip",
        "icon": "✍️",
        "title": "바른 글씨",
        "content": "네모 칸의 자형을 살펴 또박또박 쓰게 하고, 어려워하면 천천히 따라 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_more15",
        "type": "extension",
        "icon": "⬆",
        "title": "문장으로",
        "content": "\"배운 고운 말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect15",
        "type": "fun_question",
        "icon": "💡",
        "title": "단원 마무리",
        "content": "\"7단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_end",
        "type": "extension",
        "icon": "⬆",
        "title": "고운 말 실천",
        "content": "\"오늘 집에 가서 가족에게 어떤 고운 말을 해 볼까요?\" 실천으로 이어요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

})();
