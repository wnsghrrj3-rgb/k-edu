/* ============================================================================
   2학년 1학기 국어 4단원 「분위기를 살려 읽어요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u4_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 112~143 / 15차시.
   - 단원 목표: 말과 글을 바르고 재미있게 사용. 역량 비판적·창의적 사고.
   - 성취기준 [2국04-02](소리≠표기·바르게 읽고 쓰기)·[2국05-01](낭송·말의 재미)·[2국02-02](알맞게 띄어 읽기).
   ★ 저작권: 지도서 제재(「설문대 할망」·「쓰레기가 모여 있다고?」·수록 시) 전부 미게재.
      겹받침 낱말은 표준 발음 자체 구성. 짧은 시는 보편 소재(공놀이·달밤·빗방울) 전부 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 바르고 재미있게 ---------------- */
  window.LESSONS["u4_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 1,
      "title": "단원 도입 — 분위기를 살려 읽어요",
      "std": "[2국04-02] · [2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 소리와 글자가 다를 때 → 겹받침이란 → 바른 소리 고르기 → 겹받침 낱말 떠올리기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분위기를 살려 읽어요",
          "subtitle": "4단원 · 1/15차시 · 단원 도입"
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
            "소리와 글자가 다를 수 있음을 알아봐요",
            "겹받침이 무엇인지 알아봐요",
            "겹받침 낱말을 바르게 읽어 봐요"
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
          "scene_title": "쓸 때와 읽을 때가 달라요? 🤔",
          "visual": "🐔",
          "question": "\"닭\"이라고 쓰지만 읽을 때는 [닥]이라고 해요.<br>왜 쓰는 것과 읽는 것이 다를까요?",
          "img": "assets/photo/korean/g2u4_mood_intro.jpg"
        },
        "suggested_extras": [
          "q_sound",
          "r_word"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "겹받침이란",
          "content": "받침에 글자가 **두 개** 들어간 것을 **겹받침**이라고 해요. \"닭·값·흙\"처럼요. 쓸 때는 **두 글자를 모두** 쓰지만, 읽을 때는 **한 소리**로 읽어요. \"닭→[닥]\", \"값→[갑]\"!",
          "symbol_meanings": [
            {
              "symbol": "닭 → [닥]",
              "meaning": "ㄺ을 [ㄱ]으로"
            },
            {
              "symbol": "값 → [갑]",
              "meaning": "ㅄ을 [ㅂ]으로"
            },
            {
              "symbol": "흙 → [흑]",
              "meaning": "ㄺ을 [ㄱ]으로"
            },
            {
              "symbol": "두 글자 쓰기",
              "meaning": "읽을 땐 한 소리"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_write"
        ],
        "tnote": {
          "ask": [
            "같은 글도 분위기에 따라 어떻게 달라질까?"
          ],
          "watch": "분위기 감각 열기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바르게 읽으면? 🔤",
          "sub": "겹받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"닭\"은 어떻게 읽을까요?",
              "emoji": "🐔",
              "name": "[닥]"
            },
            {
              "clue": "\"값\"은 어떻게 읽을까요?",
              "emoji": "💰",
              "name": "[갑]"
            },
            {
              "clue": "\"흙\"은 어떻게 읽을까요?",
              "emoji": "🪴",
              "name": "[흑]"
            }
          ],
          "outro": "쓸 때는 두 글자, 읽을 때는 한 소리예요. 신기하죠? 😊"
        },
        "suggested_extras": [
          "q_more",
          "g_sound"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "겹받침 낱말을 떠올려요",
          "question": "겹받침이 들어간 낱말을 떠올려 볼까요?",
          "items": [
            "받침에 글자가 두 개인 낱말이 있나요?",
            "그 낱말은 어떻게 읽을까요?",
            "쓸 때와 읽을 때가 어떻게 다른가요?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "e_more"
        ]
      },
      {
        "id": "s100",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "분위기를 느끼며 읽기",
          "levels": {
            "읽기": {
              "q": "'즐거운 놀이터'와 '조용한 밤'을 분위기를 살려 읽어 볼까요?",
              "a": "즐거운 놀이터 / 조용한 밤"
            },
            "쓰기": {
              "q": "즐거운 분위기가 느껴지는 낱말을 하나 써 볼까요?",
              "a": "여러 답 (예: 신나다·활짝)",
              "open": true
            },
            "말하기": {
              "q": "기쁜 마음과 조용한 마음일 때 목소리가 어떻게 다른지 말해 봐요.",
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
          "title": "분위기 살려 말하기 짝 놀이",
          "type": "pair",
          "goal": "분위기에 맞게 목소리를 바꿔요",
          "body": "짝이 분위기(즐겁게·조용히)를 말하면, 같은 문장을 그 분위기로 읽어 주고 번갈아 해요.",
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
              "q": "글에도 분위기가 있나요?",
              "a": "네, 있어요"
            },
            {
              "q": "분위기를 살리려면 무엇을 바꾸나요?",
              "a": "목소리와 빠르기"
            },
            {
              "q": "분위기를 살려 읽으면?",
              "a": "더 실감 나요"
            }
          ],
          "self": [
            "분위기를 느끼며 읽을 수 있어요",
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
            "소리와 글자가 다를 수 있음을 알았어요",
            "겹받침이 무엇인지 알았어요",
            "겹받침 낱말을 바르게 읽었어요"
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
          "preview": "분위기를 살려 읽으면 좋은 점",
          "body": "다음 시간에는 시를 분위기에 맞게 읽으면 무엇이 좋은지 알아볼 거예요!"
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
        "title": "신기한 글자",
        "content": "\"쓰는 것과 읽는 것이 다른 낱말을 본 적 있나요?\" 호기심을 열어요.",
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
        "content": "이 단원은 '겹받침 바르게 읽고 쓰기 + 시를 분위기에 맞게 읽기'예요. 도입에선 소리≠표기의 신기함을 느끼게 하세요.",
        "fit_slides": [
          "objective",
          "cover"
        ]
      },
      {
        "id": "q_sound",
        "type": "fun_question",
        "icon": "🐔",
        "title": "왜 다를까",
        "content": "\"왜 쓰는 것과 읽는 것이 다를까요?\" 소리와 표기 차이를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_word",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 겹받침",
        "content": "닭·값·흙 등 자주 쓰는 겹받침 낱말과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "두 글자·한 소리",
        "content": "쓸 때는 두 글자, 읽을 때는 한 소리라는 핵심을 거듭 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_write",
        "type": "misconception",
        "icon": "❓",
        "title": "소리대로 쓰면 틀려요",
        "content": "[닥]으로 들린다고 '닥'으로 쓰면 틀려요. 쓸 때는 '닭'으로 두 글자를 살리게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_more",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 낱말?",
        "content": "\"겹받침이 든 낱말이 또 있을까요?\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_sound",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 소리 짝짓기",
        "description": "겹받침 낱말과 읽는 소리를 짝지어 보세요.",
        "hint": "어떻게 읽는지 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🐔 닭"
            },
            "b": {
              "text": "[닥]"
            }
          },
          {
            "a": {
              "text": "💰 값"
            },
            "b": {
              "text": "[갑]"
            }
          },
          {
            "a": {
              "text": "🪴 흙"
            },
            "b": {
              "text": "[흑]"
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
        "title": "소리 내어",
        "content": "겹받침 낱말을 소리 내어 읽으며 쓰기와 비교하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more",
        "type": "extension",
        "icon": "⬆",
        "title": "더 찾기",
        "content": "\"교실에서 겹받침 낱말을 찾아볼까요?\" 탐구를 넓혀요.",
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
        "content": "\"겹받침은 쓸 때와 읽을 때가 어떻게 다르죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "분위기 예고",
        "content": "\"다음엔 시 분위기를 알아봐요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 2,
      "title": "분위기를 살려 읽으면 좋아요",
      "std": "[2국05-01] · [2국02-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 분위기란 → 분위기를 살리면 좋은 점 → 분위기 고르기 → 분위기 떠올리기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분위기를 살려 읽으면 좋아요",
          "subtitle": "4단원 · 2/15차시 · 준비"
        },
        "suggested_extras": [
          "q_mood",
          "t_mood"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "분위기가 무엇인지 알아봐요",
            "분위기를 살려 읽으면 좋은 점을 알아봐요",
            "글에서 분위기를 느껴봐요"
          ]
        },
        "suggested_extras": [
          "t_mood"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "같은 글, 다른 목소리 🎭",
          "visual": "🎭",
          "question": "신나는 시는 밝고 빠르게, 조용한 시는 천천히 읽으면?<br>같은 글도 느낌이 달라져요!",
          "img": "assets/photo/korean/g2u4_why_mood.jpg"
        },
        "suggested_extras": [
          "q_voice",
          "r_mood"
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
              "q": "글에도 분위기가 있나요?",
              "a": "네, 있어요"
            },
            {
              "q": "분위기를 살리려면 무엇을 바꾸나요?",
              "a": "목소리와 빠르기"
            }
          ],
          "from": "u4_l01"
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
          "title": "분위기란",
          "content": "분위기는 글이 주는 **느낌**이에요. 신나는 분위기, 조용한 분위기, 포근한 분위기가 있어요. 분위기에 맞게 **목소리**를 조절해 읽으면 그 느낌이 더 잘 살아나요!",
          "symbol_meanings": [
            {
              "symbol": "신나는",
              "meaning": "밝고 빠르게"
            },
            {
              "symbol": "조용한",
              "meaning": "천천히 부드럽게"
            },
            {
              "symbol": "포근한",
              "meaning": "따뜻하고 다정하게"
            },
            {
              "symbol": "목소리 조절",
              "meaning": "분위기에 맞게"
            }
          ]
        },
        "suggested_extras": [
          "t_mood2",
          "x_same"
        ],
        "tnote": {
          "ask": [
            "분위기를 살리면 왜 좋을까?"
          ],
          "watch": "분위기 읽기의 효과",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 글의 분위기는? 🎭",
          "sub": "글의 느낌에 맞는 분위기를 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"신난다! 운동장으로 달려가자!\"",
              "emoji": "🏃",
              "name": "신나는 분위기"
            },
            {
              "clue": "\"밤하늘에 별이 조용히 빛난다\"",
              "emoji": "🌙",
              "name": "조용한 분위기"
            },
            {
              "clue": "\"엄마 품에 포근히 안겼다\"",
              "emoji": "🤗",
              "name": "포근한 분위기"
            }
          ],
          "outro": "글마다 분위기가 달라요. 분위기를 느끼며 읽어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick2",
          "g_mood"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "분위기를 떠올려요",
          "question": "여러 분위기를 떠올려 볼까요?",
          "items": [
            "신나는 분위기의 글은 어떤 글일까요?",
            "조용한 분위기의 글은 어떤 느낌일까요?",
            "분위기를 살려 읽으면 무엇이 좋을까요?"
          ]
        },
        "suggested_extras": [
          "t_present2",
          "e_mood2"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "분위기를 살려 읽으면 좋은 점",
          "levels": {
            "읽기": {
              "q": "'천천히 조용하게'와 '빠르고 신나게' 중 즐거운 장면에 맞는 것은?",
              "a": "빠르고 신나게"
            },
            "쓰기": {
              "q": "슬픈 분위기에 어울리는 읽기 방법을 한 가지 써 볼까요?",
              "a": "여러 답 (예: 천천히·낮은 목소리)",
              "open": true
            },
            "말하기": {
              "q": "분위기를 살려 읽으면 무엇이 좋은지 짝에게 말해 봐요.",
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
          "title": "분위기 바꿔 읽기 짝 활동",
          "type": "pair",
          "goal": "같은 문장을 다른 분위기로 읽어요",
          "body": "짝과 같은 문장을 즐겁게·조용히 번갈아 읽고, 어떻게 다른지 이야기해요.",
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
              "q": "즐거운 장면은 어떻게 읽나요?",
              "a": "빠르고 밝게"
            },
            {
              "q": "조용한 장면은?",
              "a": "천천히 낮게"
            },
            {
              "q": "분위기를 살리면 듣는 사람은?",
              "a": "장면이 잘 떠올라요"
            }
          ],
          "self": [
            "분위기 살려 읽는 까닭을 알아요",
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
            "분위기가 무엇인지 알았어요",
            "분위기를 살려 읽으면 좋은 점을 알았어요",
            "글에서 분위기를 느꼈어요"
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
          "preview": "겹받침 낱말을 읽고 써요",
          "body": "다음 시간에는 겹받침이 있는 낱말을 바르게 읽고 쓰는 법을 배워 볼 거예요!"
        },
        "suggested_extras": [
          "e_double2"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_mood",
        "type": "fun_question",
        "icon": "💡",
        "title": "느낌 있는 글",
        "content": "\"읽으면 신나거나 차분해지는 글이 있나요?\" 분위기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_mood",
        "type": "tip",
        "icon": "🧩",
        "title": "분위기=느낌",
        "content": "분위기는 글이 주는 느낌임을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_voice",
        "type": "fun_question",
        "icon": "🎭",
        "title": "목소리의 힘",
        "content": "\"같은 글도 목소리를 바꾸면 어떻게 달라질까요?\" 표현을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_mood",
        "type": "real_world",
        "icon": "🌍",
        "title": "이야기 들려주기",
        "content": "이야기를 실감 나게 들려준 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_mood2",
        "type": "tip",
        "icon": "🧩",
        "title": "목소리 조절",
        "content": "분위기에 맞게 빠르기·크기·부드러움을 조절하게 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_same",
        "type": "misconception",
        "icon": "❓",
        "title": "한 가지 목소리로?",
        "content": "모든 글을 같은 목소리로 읽으면 분위기가 안 살아요. 글에 맞게 바꾸게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick2",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 분위기?",
        "content": "\"이 글은 어떤 분위기일까요?\" 분위기를 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mood",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 분위기 짝짓기",
        "description": "장면과 분위기를 짝지어 보세요.",
        "hint": "글의 느낌을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🏃 달려가자"
            },
            "b": {
              "text": "신나는"
            }
          },
          {
            "a": {
              "text": "🌙 별이 빛나"
            },
            "b": {
              "text": "조용한"
            }
          },
          {
            "a": {
              "text": "🤗 포근히 안겨"
            },
            "b": {
              "text": "포근한"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present2",
        "type": "tip",
        "icon": "🗣",
        "title": "느낌 말하기",
        "content": "글을 읽고 어떤 느낌이 드는지 자유롭게 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_mood2",
        "type": "extension",
        "icon": "⬆",
        "title": "분위기 더 찾기",
        "content": "\"또 어떤 분위기가 있을까요? (무서운·즐거운)\" 분위기를 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect2",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"분위기를 살려 읽으면 무엇이 좋죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_double2",
        "type": "extension",
        "icon": "⬆",
        "title": "겹받침 예고",
        "content": "\"다음엔 겹받침 낱말을 읽고 써요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 3,
      "title": "겹받침 낱말을 읽고 써요 ① (ㄺ)",
      "std": "[2국04-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — ㄺ 받침 → 소리는 [ㄱ] → 바른 소리 고르기 → 겹받침 낱말 따라 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "겹받침 낱말을 읽고 써요",
          "subtitle": "4단원 · 3/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_lg3",
          "t_lg3"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "받침 'ㄺ'을 알아봐요",
            "'ㄺ'을 어떻게 읽는지 알아봐요",
            "'ㄺ' 낱말을 바르게 써요"
          ]
        },
        "suggested_extras": [
          "t_lg3"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "닭·흙·읽다 🐔",
          "visual": "🐔",
          "question": "\"닭\" \"흙\" \"읽다\"… 받침에 글자가 두 개 있어요.<br>이런 낱말은 어떻게 읽을까요?",
          "img": "assets/photo/korean/g2u4_double1.jpg"
        },
        "suggested_extras": [
          "q_read3",
          "r_lg3"
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
              "q": "즐거운 장면은 어떻게 읽나요?",
              "a": "빠르고 밝게"
            },
            {
              "q": "조용한 장면은?",
              "a": "천천히 낮게"
            }
          ],
          "from": "u4_l02"
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
          "title": "받침 'ㄺ'은 [ㄱ]으로",
          "content": "받침 **'ㄺ'**(ㄹ+ㄱ)은 읽을 때 **[ㄱ]** 소리가 나요. \"닭→[닥]\" \"흙→[흑]\" \"읽다→[익따]\"처럼요. 하지만 쓸 때는 **'ㄺ' 두 글자를 모두** 살려서 써요!",
          "symbol_meanings": [
            {
              "symbol": "닭 → [닥]",
              "meaning": "ㄺ을 [ㄱ]으로"
            },
            {
              "symbol": "흙 → [흑]",
              "meaning": "ㄺ을 [ㄱ]으로"
            },
            {
              "symbol": "읽다 → [익따]",
              "meaning": "ㄺ을 [ㄱ]으로"
            },
            {
              "symbol": "맑다 → [막따]",
              "meaning": "ㄺ을 [ㄱ]으로"
            }
          ]
        },
        "suggested_extras": [
          "t_lg3b",
          "x_lg3"
        ],
        "tnote": {
          "ask": [
            "왜 쓴 대로 소리 나지 않을까?"
          ],
          "watch": "소리≠표기 인식(ㄺ)",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바르게 읽으면? 🔤",
          "sub": "'ㄺ' 받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"닭\"은?",
              "emoji": "🐔",
              "name": "[닥]"
            },
            {
              "clue": "\"읽다\"는?",
              "emoji": "📖",
              "name": "[익따]"
            },
            {
              "clue": "\"맑다\"는?",
              "emoji": "☀️",
              "name": "[막따]"
            }
          ],
          "outro": "'ㄺ'은 [ㄱ]으로 읽어요. 이제 바르게 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_more3",
          "g_lg3"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "'ㄺ' 낱말을 따라 써요 ✍️",
          "content": "'ㄺ' 받침 낱말을 **또박또박** 따라 써 봐요. 읽을 때는 [ㄱ]이지만, 쓸 때는 **'ㄺ' 두 글자**를 모두 살려요. **닭 · 흙 · 읽다**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "닭",
              "meaning": "받침 ㄺ을 살려서"
            },
            {
              "symbol": "흙",
              "meaning": "받침 ㄺ을 살려서"
            },
            {
              "symbol": "읽다",
              "meaning": "받침 ㄺ을 살려서"
            }
          ]
        },
        "suggested_extras": [
          "t_trace3",
          "e_more3"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "겹받침 낱말 읽고 쓰기 ① (ㄺ)",
          "levels": {
            "읽기": {
              "q": "'닭'은 [닥], '흙'은 [흑]으로 소리 나요. 소리 내어 읽어 볼까요?",
              "a": "닭[닥] · 흙[흑]"
            },
            "쓰기": {
              "q": "'ㄺ' 받침이 든 낱말을 하나 바르게 써 볼까요?",
              "a": "여러 답 (예: 닭·흙·읽다)",
              "open": true
            },
            "말하기": {
              "q": "'닭'을 쓸 때와 읽을 때가 어떻게 다른지 말해 봐요.",
              "a": "쓸 때는 ㄺ, 읽을 때는 [ㄱ] 소리"
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
          "title": "ㄺ 겹받침 낱말 모으기 짝 활동",
          "type": "pair",
          "goal": "ㄺ 받침 낱말을 함께 찾아요",
          "body": "짝과 번갈아 ㄺ 받침이 든 낱말을 하나씩 말하고, 소리 내어 바르게 읽어 줘요.",
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
              "q": "'닭'은 어떻게 소리 나나요?",
              "a": "[닥]"
            },
            {
              "q": "겹받침은 받침이 몇 개?",
              "a": "두 개"
            },
            {
              "q": "겹받침은 쓸 때와 읽을 때가?",
              "a": "다를 수 있어요"
            }
          ],
          "self": [
            "ㄺ 겹받침을 읽고 쓸 수 있어요",
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
            "받침 'ㄺ'을 알았어요",
            "'ㄺ'은 [ㄱ]으로 읽음을 알았어요",
            "'ㄺ' 낱말을 바르게 썼어요"
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
          "preview": "겹받침 'ㄵ·ㄼ'을 배워요",
          "body": "다음 시간에는 받침 'ㄵ'과 'ㄼ'이 있는 낱말을 바르게 읽고 써 볼 거예요!"
        },
        "suggested_extras": [
          "e_next3"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_lg3",
        "type": "fun_question",
        "icon": "💡",
        "title": "받침 두 개",
        "content": "\"받침에 글자가 두 개인 낱말을 본 적 있나요?\" 겹받침을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_lg3",
        "type": "tip",
        "icon": "🧩",
        "title": "ㄺ=[ㄱ]",
        "content": "'ㄺ'은 [ㄱ]으로 읽고, 쓸 때는 두 글자를 살린다는 핵심을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_read3",
        "type": "fun_question",
        "icon": "🐔",
        "title": "어떻게 읽지",
        "content": "\"이런 낱말은 어떻게 읽을까요?\" 소리를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_lg3",
        "type": "real_world",
        "icon": "🌍",
        "title": "자주 쓰는 말",
        "content": "닭·흙처럼 생활에서 자주 쓰는 ㄺ 낱말과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_lg3b",
        "type": "tip",
        "icon": "🧩",
        "title": "소리 내어 읽기",
        "content": "소리 내어 읽으며 [ㄱ] 소리를 확인하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_lg3",
        "type": "misconception",
        "icon": "❓",
        "title": "소리대로 쓰면 틀려요",
        "content": "[닥]으로 들려도 '닭'으로 받침 두 글자를 살려 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_more3",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 낱말?",
        "content": "\"'ㄺ' 받침 낱말이 또 있을까요? (밝다·긁다)\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_lg3",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 소리 짝짓기",
        "description": "'ㄺ' 낱말과 읽는 소리를 짝지어 보세요.",
        "hint": "[ㄱ]으로 읽어요.",
        "pairs": [
          {
            "a": {
              "text": "🐔 닭"
            },
            "b": {
              "text": "[닥]"
            }
          },
          {
            "a": {
              "text": "📖 읽다"
            },
            "b": {
              "text": "[익따]"
            }
          },
          {
            "a": {
              "text": "☀️ 맑다"
            },
            "b": {
              "text": "[막따]"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_trace3",
        "type": "tip",
        "icon": "✍️",
        "title": "두 글자 살려",
        "content": "따라 쓸 때 받침 'ㄺ' 두 글자를 빠뜨리지 않게 살피게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_more3",
        "type": "extension",
        "icon": "⬆",
        "title": "문장으로",
        "content": "\"'ㄺ' 낱말로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect3",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"'ㄺ'은 어떻게 읽죠?\" [ㄱ]을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_next3",
        "type": "extension",
        "icon": "⬆",
        "title": "다음 겹받침 예고",
        "content": "\"다음엔 'ㄵ·ㄼ'을 배워요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 4,
      "title": "겹받침 낱말을 읽고 써요 ② (ㄵ·ㄼ)",
      "std": "[2국04-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — ㄵ→[ㄴ]·ㄼ→[ㄹ] → 바르게 읽기 → 바른 소리 고르기 → 낱말 따라 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "겹받침 낱말을 읽고 써요",
          "subtitle": "4단원 · 4/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall4",
          "t_nb4"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "받침 'ㄵ'과 'ㄼ'을 알아봐요",
            "어떻게 읽는지 알아봐요",
            "낱말을 바르게 써요"
          ]
        },
        "suggested_extras": [
          "t_nb4"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "앉다·많다·넓다·짧다 🪑",
          "visual": "🪑",
          "question": "\"앉다\"는 [안따], \"넓다\"는 [널따]로 읽어요.<br>받침 'ㄵ'과 'ㄼ'은 어떤 소리가 날까요?",
          "img": "assets/photo/korean/g2u4_double2.jpg"
        },
        "suggested_extras": [
          "q_read4",
          "r_nb4"
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
              "q": "'닭'은 어떻게 소리 나나요?",
              "a": "[닥]"
            },
            {
              "q": "겹받침은 받침이 몇 개?",
              "a": "두 개"
            }
          ],
          "from": "u4_l03"
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
          "title": "'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ]",
          "content": "받침 **'ㄵ'**(ㄴ+ㅈ)은 **[ㄴ]**으로, **'ㄼ'**(ㄹ+ㅂ)은 **[ㄹ]**로 읽어요. \"앉다→[안따]\" \"많다→[만타]\" \"넓다→[널따]\" \"짧다→[짤따]\". 쓸 때는 **두 글자 모두** 살려요!",
          "symbol_meanings": [
            {
              "symbol": "앉다 → [안따]",
              "meaning": "ㄵ을 [ㄴ]으로"
            },
            {
              "symbol": "많다 → [만타]",
              "meaning": "ㄵ을 [ㄴ]으로"
            },
            {
              "symbol": "넓다 → [널따]",
              "meaning": "ㄼ을 [ㄹ]로"
            },
            {
              "symbol": "짧다 → [짤따]",
              "meaning": "ㄼ을 [ㄹ]로"
            }
          ]
        },
        "suggested_extras": [
          "t_nb4b",
          "x_nb4"
        ],
        "tnote": {
          "ask": [
            "겹받침마다 소리가 어떻게 다를까?"
          ],
          "watch": "소리≠표기 인식(ㄵ·ㄼ)",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바르게 읽으면? 🔤",
          "sub": "'ㄵ·ㄼ' 받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"앉다\"는?",
              "emoji": "🪑",
              "name": "[안따]"
            },
            {
              "clue": "\"많다\"는?",
              "emoji": "➕",
              "name": "[만타]"
            },
            {
              "clue": "\"넓다\"는?",
              "emoji": "🟦",
              "name": "[널따]"
            }
          ],
          "outro": "'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ]로 읽어요. 이제 바르게 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_more4",
          "g_nb4"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "낱말을 따라 써요 ✍️",
          "content": "'ㄵ·ㄼ' 받침 낱말을 **또박또박** 따라 써 봐요. 읽는 소리와 달리, 쓸 때는 받침 **두 글자**를 모두 살려요. **앉다 · 많다 · 넓다**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "앉다",
              "meaning": "받침 ㄵ을 살려서"
            },
            {
              "symbol": "많다",
              "meaning": "받침 ㄵ을 살려서"
            },
            {
              "symbol": "넓다",
              "meaning": "받침 ㄼ을 살려서"
            }
          ]
        },
        "suggested_extras": [
          "t_trace4",
          "e_more4"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "겹받침 낱말 읽고 쓰기 ② (ㄵ·ㄼ)",
          "levels": {
            "읽기": {
              "q": "'앉다'는 [안따], '여덟'은 [여덜]로 소리 나요. 읽어 볼까요?",
              "a": "앉다[안따] · 여덟[여덜]"
            },
            "쓰기": {
              "q": "'ㄵ'이나 'ㄼ' 받침이 든 낱말을 하나 써 볼까요?",
              "a": "여러 답 (예: 앉다·넓다·여덟)",
              "open": true
            },
            "말하기": {
              "q": "'여덟'을 바르게 소리 내어 짝에게 말해 봐요.",
              "a": "[여덜]"
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
          "title": "ㄵ·ㄼ 겹받침 읽기 짝 활동",
          "type": "pair",
          "goal": "겹받침을 바르게 소리 내요",
          "body": "짝과 번갈아 ㄵ·ㄼ 받침 낱말을 말하고, 바른 소리로 읽어 서로 확인해 줘요.",
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
              "q": "'앉다'는 어떻게 소리 나나요?",
              "a": "[안따]"
            },
            {
              "q": "'여덟'은?",
              "a": "[여덜]"
            },
            {
              "q": "겹받침을 읽을 때는?",
              "a": "소리에 주의해요"
            }
          ],
          "self": [
            "ㄵ·ㄼ 겹받침을 읽고 쓸 수 있어요",
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
            "받침 'ㄵ·ㄼ'을 알았어요",
            "'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ]로 읽음을 알았어요",
            "낱말을 바르게 썼어요"
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
          "preview": "겹받침을 정리해요",
          "body": "다음 시간에는 지금까지 배운 겹받침을 정리하고 더 연습해 볼 거예요!"
        },
        "suggested_extras": [
          "e_next4"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall4",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 겹받침",
        "content": "\"지난 시간에 배운 'ㄺ'은 어떻게 읽었나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_nb4",
        "type": "tip",
        "icon": "🧩",
        "title": "ㄵ=[ㄴ]·ㄼ=[ㄹ]",
        "content": "'ㄵ'은 [ㄴ], 'ㄼ'은 [ㄹ]이라는 핵심을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_read4",
        "type": "fun_question",
        "icon": "🪑",
        "title": "어떤 소리",
        "content": "\"'ㄵ'과 'ㄼ'은 어떤 소리가 날까요?\" 소리를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_nb4",
        "type": "real_world",
        "icon": "🌍",
        "title": "자주 쓰는 말",
        "content": "앉다·넓다처럼 자주 쓰는 낱말과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_nb4b",
        "type": "tip",
        "icon": "🧩",
        "title": "소리 내어 읽기",
        "content": "소리 내어 읽으며 [ㄴ]·[ㄹ] 소리를 확인하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_nb4",
        "type": "misconception",
        "icon": "❓",
        "title": "소리대로 쓰면 틀려요",
        "content": "[안따]로 들려도 '앉다'로 받침 두 글자를 살려 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_more4",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 낱말?",
        "content": "\"'ㄵ·ㄼ' 낱말이 또 있을까요? (얹다·여덟)\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_nb4",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 소리 짝짓기",
        "description": "낱말과 읽는 소리를 짝지어 보세요.",
        "hint": "ㄵ은 [ㄴ], ㄼ은 [ㄹ]이에요.",
        "pairs": [
          {
            "a": {
              "text": "🪑 앉다"
            },
            "b": {
              "text": "[안따]"
            }
          },
          {
            "a": {
              "text": "➕ 많다"
            },
            "b": {
              "text": "[만타]"
            }
          },
          {
            "a": {
              "text": "🟦 넓다"
            },
            "b": {
              "text": "[널따]"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_trace4",
        "type": "tip",
        "icon": "✍️",
        "title": "두 글자 살려",
        "content": "따라 쓸 때 받침 두 글자를 빠뜨리지 않게 살피게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_more4",
        "type": "extension",
        "icon": "⬆",
        "title": "문장으로",
        "content": "\"'ㄵ·ㄼ' 낱말로 짧은 문장을 만들어 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect4",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"'ㄵ'과 'ㄼ'은 어떻게 읽죠?\" [ㄴ]·[ㄹ]을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_next4",
        "type": "extension",
        "icon": "⬆",
        "title": "정리 예고",
        "content": "\"다음엔 겹받침을 정리해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 5,
      "title": "겹받침 낱말을 읽고 써요 ③",
      "std": "[2국04-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 겹받침 정리 → 바르게 읽고 쓰기 → 바르게 쓴 낱말 고르기 → 겹받침 낱말 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "겹받침 낱말을 읽고 써요",
          "subtitle": "4단원 · 5/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_sum5",
          "t_sum5"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "배운 겹받침을 정리해요",
            "겹받침 낱말을 바르게 읽고 써요",
            "바르게 쓴 낱말을 골라봐요"
          ]
        },
        "suggested_extras": [
          "t_sum5"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "겹받침을 모아 봐요 🗂️",
          "visual": "🗂️",
          "question": "ㄺ은 [ㄱ], ㄵ은 [ㄴ], ㄼ은 [ㄹ]…<br>지금까지 배운 겹받침을 정리해 볼까요?",
          "img": "assets/photo/korean/g2u4_double3.jpg"
        },
        "suggested_extras": [
          "q_sum5b",
          "r_sum5"
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
              "q": "'앉다'는 어떻게 소리 나나요?",
              "a": "[안따]"
            },
            {
              "q": "겹받침을 읽을 때는?",
              "a": "소리에 주의해요"
            }
          ],
          "from": "u4_l04"
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
          "title": "겹받침 한눈에 보기",
          "content": "겹받침은 쓸 때 **두 글자**, 읽을 때 **한 소리**예요. **ㄺ→[ㄱ]**(닭·흙), **ㄵ→[ㄴ]**(앉다·많다), **ㄼ→[ㄹ]**(넓다·짧다). 쓸 때는 받침 두 글자를 꼭 살려요!",
          "symbol_meanings": [
            {
              "symbol": "ㄺ → [ㄱ]",
              "meaning": "닭·흙·읽다"
            },
            {
              "symbol": "ㄵ → [ㄴ]",
              "meaning": "앉다·많다"
            },
            {
              "symbol": "ㄼ → [ㄹ]",
              "meaning": "넓다·짧다"
            },
            {
              "symbol": "쓸 땐 두 글자",
              "meaning": "받침을 모두 살려요"
            }
          ]
        },
        "suggested_extras": [
          "t_sum5b",
          "x_sum5"
        ],
        "tnote": {
          "ask": [
            "겹받침을 바르게 쓰려면 무엇에 주의할까?"
          ],
          "watch": "겹받침 표기 정리",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바르게 쓴 낱말은? ✅",
          "sub": "바르게 쓴 겹받침 낱말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "[닥]으로 읽는 새는?",
              "emoji": "🐔",
              "name": "\"닭\" (○) — '닥'은 틀려요"
            },
            {
              "clue": "[안따]로 읽는 낱말은?",
              "emoji": "🪑",
              "name": "\"앉다\" (○) — '안따'는 틀려요"
            },
            {
              "clue": "[널따]로 읽는 낱말은?",
              "emoji": "🟦",
              "name": "\"넓다\" (○) — '널따'는 틀려요"
            }
          ],
          "outro": "읽는 소리와 달리 쓸 때는 받침 두 글자를 살려요. 직접 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick5",
          "g_sum5"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "겹받침 낱말을 써요 ✍️",
          "content": "배운 겹받침 낱말을 **또박또박** 써 봐요. 읽는 소리에 속지 말고 받침 **두 글자**를 살려요. **닭 · 앉다 · 넓다**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "닭",
              "meaning": "받침 ㄺ"
            },
            {
              "symbol": "앉다",
              "meaning": "받침 ㄵ"
            },
            {
              "symbol": "넓다",
              "meaning": "받침 ㄼ"
            }
          ]
        },
        "suggested_extras": [
          "t_trace5",
          "e_more5"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "겹받침 낱말 읽고 쓰기 ③",
          "levels": {
            "읽기": {
              "q": "'값'은 [갑], '없다'는 [업따]로 소리 나요. 읽어 볼까요?",
              "a": "값[갑] · 없다[업따]"
            },
            "쓰기": {
              "q": "지금까지 배운 겹받침 낱말 두 개를 써 볼까요?",
              "a": "여러 답 (예: 닭·앉다·값)",
              "open": true
            },
            "말하기": {
              "q": "겹받침 낱말이 든 짧은 문장을 만들어 바르게 읽어 봐요.",
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
          "title": "겹받침 문장 만들기 짝 활동",
          "type": "pair",
          "goal": "겹받침 낱말로 문장을 만들어요",
          "body": "짝과 겹받침 낱말을 하나 골라 문장을 만들고, 소리 내어 바르게 읽어 줘요.",
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
              "q": "'값'은 어떻게 소리 나나요?",
              "a": "[갑]"
            },
            {
              "q": "겹받침 낱말을 쓸 때는?",
              "a": "받침 두 개를 모두 써요"
            },
            {
              "q": "읽을 때는?",
              "a": "소리 나는 대로 읽어요"
            }
          ],
          "self": [
            "겹받침 낱말을 바르게 쓸 수 있어요",
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
            "배운 겹받침을 정리했어요",
            "겹받침 낱말을 바르게 읽고 썼어요",
            "바르게 쓴 낱말을 골랐어요"
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
          "preview": "겹받침에 주의하며 글을 읽어요",
          "body": "다음 시간에는 글을 읽으며 겹받침 낱말을 찾아 바르게 읽어 볼 거예요!"
        },
        "suggested_extras": [
          "e_read5"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_sum5",
        "type": "fun_question",
        "icon": "💡",
        "title": "배운 겹받침",
        "content": "\"지금까지 배운 겹받침을 말해 볼까요?\" 정리를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_sum5",
        "type": "tip",
        "icon": "🧩",
        "title": "한눈에 정리",
        "content": "ㄺ·ㄵ·ㄼ과 소리를 표로 정리해 한눈에 보이게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_sum5b",
        "type": "fun_question",
        "icon": "🗂️",
        "title": "규칙 찾기",
        "content": "\"겹받침을 읽는 데 어떤 규칙이 있을까요?\" 규칙을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_sum5",
        "type": "real_world",
        "icon": "🌍",
        "title": "책 속 겹받침",
        "content": "읽던 책에서 겹받침 낱말을 찾아본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_sum5b",
        "type": "tip",
        "icon": "🧩",
        "title": "소리≠표기",
        "content": "읽는 소리와 쓰는 글자가 다름을 거듭 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_sum5",
        "type": "misconception",
        "icon": "❓",
        "title": "소리대로 쓰지 않기",
        "content": "들리는 소리대로 쓰지 말고 받침 두 글자를 살려 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick5",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 것은?",
        "content": "\"바르게 쓴 낱말은 무엇이죠?\" 표기를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_sum5",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "겹받침 ↔ 소리 짝짓기",
        "description": "겹받침과 읽는 소리를 짝지어 보세요.",
        "hint": "규칙을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "ㄺ"
            },
            "b": {
              "text": "[ㄱ]"
            }
          },
          {
            "a": {
              "text": "ㄵ"
            },
            "b": {
              "text": "[ㄴ]"
            }
          },
          {
            "a": {
              "text": "ㄼ"
            },
            "b": {
              "text": "[ㄹ]"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_trace5",
        "type": "tip",
        "icon": "✍️",
        "title": "두 글자 살려",
        "content": "받침 두 글자를 빠뜨리지 않게 살피며 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_more5",
        "type": "extension",
        "icon": "⬆",
        "title": "낱말 모으기",
        "content": "\"같은 겹받침 낱말을 더 모아 볼까요?\" 어휘를 넓혀요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect5",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"겹받침은 쓸 때 어떻게 하죠?\" 두 글자 살리기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read5",
        "type": "extension",
        "icon": "⬆",
        "title": "글 읽기 예고",
        "content": "\"다음엔 글에서 겹받침을 찾아 읽어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 6,
      "title": "겹받침에 주의하며 글을 읽어요 ①",
      "std": "[2국04-02] · [2국02-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 글 속 겹받침 → 바르게 읽기 → 글에서 겹받침 모두 찾기 → 바르게 읽어 보기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "겹받침에 주의하며 글을 읽어요",
          "subtitle": "4단원 · 6/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall6",
          "t_read6"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "글 속 겹받침 낱말을 찾아요",
            "겹받침 낱말을 바르게 읽어요",
            "글을 알맞게 읽어요"
          ]
        },
        "suggested_extras": [
          "t_read6"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "글 속에 겹받침이 숨어 있어요 🔍",
          "visual": "📄",
          "question": "\"닭이 흙을 밟고 마당을 걷는다.\"<br>이 문장에 겹받침 낱말이 몇 개 있을까요?",
          "img": "assets/photo/korean/g2u4_read_care1.jpg"
        },
        "suggested_extras": [
          "q_find6",
          "r_read6"
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
              "q": "'값'은 어떻게 소리 나나요?",
              "a": "[갑]"
            },
            {
              "q": "겹받침 낱말을 쓸 때는?",
              "a": "받침 두 개를 모두 써요"
            }
          ],
          "from": "u4_l05"
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
          "title": "글 속 겹받침 바르게 읽기",
          "content": "글을 읽을 땐 겹받침 낱말을 **바른 소리**로 읽어요. \"닭이→[달기]\" \"흙을→[흘글]\"처럼 뒤에 말이 이어지면 소리가 또 달라지기도 해요. 천천히 **소리 내어** 읽으면 좋아요!",
          "symbol_meanings": [
            {
              "symbol": "닭 → [닥]",
              "meaning": "받침 ㄺ"
            },
            {
              "symbol": "밟다 → [밥따]",
              "meaning": "받침 ㄼ"
            },
            {
              "symbol": "걷다 → [걷따]",
              "meaning": "바르게 읽기"
            },
            {
              "symbol": "천천히",
              "meaning": "소리 내어 읽어요"
            }
          ]
        },
        "suggested_extras": [
          "t_read6b",
          "x_read6"
        ],
        "tnote": {
          "ask": [
            "글 속 겹받침을 놓치지 않으려면?"
          ],
          "watch": "겹받침 글 읽기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "글에서 겹받침을 찾아요 🔍",
          "sub": "문장 속 겹받침 낱말을 찾아봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"닭이 흙을 밟는다\"의 겹받침 낱말은?",
              "emoji": "🐔",
              "name": "닭·흙·밟다"
            },
            {
              "clue": "\"하늘이 맑고 별이 많다\"는?",
              "emoji": "⭐",
              "name": "맑다·많다"
            },
            {
              "clue": "\"책을 읽고 앉다\"는?",
              "emoji": "📖",
              "name": "읽다·앉다"
            }
          ],
          "outro": "글 속에 겹받침이 이렇게 숨어 있어요. 바르게 읽어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_more6",
          "g_read6"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "바르게 읽어 봐요",
          "question": "겹받침 낱말이 든 문장을 바르게 읽어 볼까요?",
          "items": [
            "문장에서 겹받침 낱말을 찾았나요?",
            "그 낱말을 바른 소리로 읽었나요?",
            "문장을 또박또박 읽어 볼까요?"
          ]
        },
        "suggested_extras": [
          "t_present6",
          "e_read6"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "겹받침에 주의하며 글 읽기 ①",
          "levels": {
            "읽기": {
              "q": "겹받침이 든 짧은 글을 소리에 주의하며 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "글에서 찾은 겹받침 낱말을 하나 옮겨 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "그 낱말이 어떻게 소리 나는지 짝에게 말해 봐요.",
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
          "title": "겹받침 찾아 읽기 짝 활동",
          "type": "pair",
          "goal": "글 속 겹받침을 바르게 읽어요",
          "body": "짝과 같은 글을 보고, 겹받침 낱말을 번갈아 찾아 바른 소리로 읽어 줘요.",
          "materials": [
            "읽을 글"
          ],
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
              "q": "글을 읽을 때 겹받침은?",
              "a": "소리에 주의해요"
            },
            {
              "q": "겹받침을 잘못 읽으면?",
              "a": "뜻이 헷갈릴 수 있어요"
            },
            {
              "q": "바르게 읽으면?",
              "a": "글이 잘 전해져요"
            }
          ],
          "self": [
            "겹받침에 주의하며 읽을 수 있어요",
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
            "글 속 겹받침 낱말을 찾았어요",
            "겹받침 낱말을 바르게 읽었어요",
            "글을 알맞게 읽었어요"
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
          "preview": "글을 읽고 내용을 이해해요",
          "body": "다음 시간에는 겹받침에 주의하며 글을 읽고 내용을 이해해 볼 거예요!"
        },
        "suggested_extras": [
          "e_read6b"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall6",
        "type": "fun_question",
        "icon": "💡",
        "title": "배운 겹받침",
        "content": "\"지금까지 배운 겹받침 소리를 떠올려 볼까요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_read6",
        "type": "tip",
        "icon": "🧩",
        "title": "찾아 읽기",
        "content": "글에서 겹받침 낱말을 찾아 바르게 읽는 데 초점을 두게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_find6",
        "type": "fun_question",
        "icon": "🔍",
        "title": "몇 개일까",
        "content": "\"이 문장에 겹받침 낱말이 몇 개 있을까요?\" 함께 찾아요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_read6",
        "type": "real_world",
        "icon": "🌍",
        "title": "책 읽기",
        "content": "책을 소리 내어 읽으며 겹받침을 만난 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_read6b",
        "type": "tip",
        "icon": "🧩",
        "title": "천천히 읽기",
        "content": "천천히 소리 내어 읽으며 바른 소리를 확인하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_read6",
        "type": "misconception",
        "icon": "❓",
        "title": "대충 넘기지 않기",
        "content": "겹받침을 대충 읽지 말고 바른 소리로 또박또박 읽게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_more6",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 찾아볼까",
        "content": "\"이 글에 겹받침 낱말이 또 있을까요?\" 함께 찾아요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_read6",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 소리 짝짓기",
        "description": "글 속 겹받침 낱말과 소리를 짝지어 보세요.",
        "hint": "바른 소리를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🐔 닭"
            },
            "b": {
              "text": "[닥]"
            }
          },
          {
            "a": {
              "text": "⭐ 많다"
            },
            "b": {
              "text": "[만타]"
            }
          },
          {
            "a": {
              "text": "📖 읽다"
            },
            "b": {
              "text": "[익따]"
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
        "title": "또박또박 읽기",
        "content": "문장을 또박또박 소리 내어 읽게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_read6",
        "type": "extension",
        "icon": "⬆",
        "title": "문장 만들기",
        "content": "\"겹받침 낱말로 짧은 문장을 만들어 읽어 볼까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect6",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"글 속 겹받침은 어떻게 읽죠?\" 바른 소리를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read6b",
        "type": "extension",
        "icon": "⬆",
        "title": "내용 이해 예고",
        "content": "\"다음엔 글을 읽고 내용을 이해해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 7,
      "title": "겹받침에 주의하며 글을 읽어요 ②",
      "std": "[2국02-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 띄어 읽기 → 뜻이 드러나게 → 알맞게 띄어 읽기 → 글 읽고 내용 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "겹받침에 주의하며 글을 읽어요",
          "subtitle": "4단원 · 7/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_space7",
          "t_space7"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "뜻이 드러나게 띄어 읽어요",
            "겹받침에 주의하며 글을 읽어요",
            "글의 내용을 이해해요"
          ]
        },
        "suggested_extras": [
          "t_space7"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "어디서 띄어 읽을까? ✂️",
          "visual": "📖",
          "question": "\"작은 새가 나무에 앉았다\"를 읽을 때<br>어디에서 잠깐 쉬며 읽으면 뜻이 잘 드러날까요?",
          "img": "assets/photo/korean/g2u4_read_care2.jpg"
        },
        "suggested_extras": [
          "q_space7b",
          "r_space7"
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
              "q": "글을 읽을 때 겹받침은?",
              "a": "소리에 주의해요"
            },
            {
              "q": "바르게 읽으면?",
              "a": "글이 잘 전해져요"
            }
          ],
          "from": "u4_l06"
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
          "title": "알맞게 띄어 읽기",
          "content": "글을 읽을 땐 **뜻이 드러나게** 알맞게 띄어 읽어요. \"누가/무엇을/어찌하다\" 사이에서 살짝 쉬면 뜻이 잘 전해져요. 겹받침 낱말도 **바른 소리**로 읽으며 천천히 읽어요!",
          "symbol_meanings": [
            {
              "symbol": "누가",
              "meaning": "작은 새가 /"
            },
            {
              "symbol": "어디서",
              "meaning": "나무에 /"
            },
            {
              "symbol": "어찌하다",
              "meaning": "앉았다"
            },
            {
              "symbol": "살짝 쉬기",
              "meaning": "뜻이 드러나게"
            }
          ]
        },
        "suggested_extras": [
          "t_space7b",
          "x_space7"
        ],
        "tnote": {
          "ask": [
            "같은 겹받침도 왜 소리가 달라질까?"
          ],
          "watch": "겹받침 소리 변화",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "알맞게 띄어 읽으면? ✅",
          "sub": "뜻이 잘 드러나게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"맑은 하늘에 별이 많다\"를 읽을 때는?",
              "emoji": "⭐",
              "name": "\"맑은 하늘에 / 별이 많다\""
            },
            {
              "clue": "\"닭이 흙을 밟는다\"를 읽을 때는?",
              "emoji": "🐔",
              "name": "\"닭이 / 흙을 / 밟는다\""
            },
            {
              "clue": "이렇게 읽으면 어색해요!",
              "emoji": "🙅",
              "name": "한 글자씩 뚝뚝 끊어 읽기"
            }
          ],
          "outro": "알맞게 띄어 읽으니 뜻이 잘 드러나요. 글을 읽고 내용을 나눠 볼까요? 😊"
        },
        "suggested_extras": [
          "q_space7c",
          "g_space7"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "글을 읽고 내용을 나눠요",
          "question": "글을 알맞게 읽고 내용을 이야기해 볼까요?",
          "items": [
            "글을 알맞게 띄어 읽었나요?",
            "겹받침 낱말을 바르게 읽었나요?",
            "글의 내용은 무엇인가요?"
          ]
        },
        "suggested_extras": [
          "t_present7",
          "e_space7"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "겹받침에 주의하며 글 읽기 ②",
          "levels": {
            "읽기": {
              "q": "'읽다'와 '읽고'를 바르게 소리 내어 읽어 볼까요?",
              "a": "읽다[익따] · 읽고[일꼬]"
            },
            "쓰기": {
              "q": "겹받침 낱말이 든 문장을 하나 만들어 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "내가 만든 문장을 짝에게 바른 소리로 읽어 봐요.",
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
          "title": "문장 바르게 읽기 짝 활동",
          "type": "pair",
          "goal": "겹받침 문장을 정확히 읽어요",
          "body": "짝과 서로 만든 문장을 바꿔 바른 소리로 읽고, 틀린 곳을 함께 고쳐 줘요.",
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
              "q": "'읽다'는 어떻게 소리 나나요?",
              "a": "[익따]"
            },
            {
              "q": "겹받침은 뒷말에 따라?",
              "a": "소리가 달라질 수 있어요"
            },
            {
              "q": "바르게 읽으려면?",
              "a": "천천히 소리 내어 봐요"
            }
          ],
          "self": [
            "겹받침 문장을 바르게 읽을 수 있어요",
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
            "뜻이 드러나게 띄어 읽었어요",
            "겹받침에 주의하며 읽었어요",
            "글의 내용을 이해했어요"
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
          "preview": "시의 분위기를 살펴봐요",
          "body": "다음 시간에는 시를 읽으며 어떤 분위기인지 살펴볼 거예요!"
        },
        "suggested_extras": [
          "e_mood7"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_space7",
        "type": "fun_question",
        "icon": "💡",
        "title": "띄어 읽기",
        "content": "\"글을 읽을 때 어디서 쉬어 본 적 있나요?\" 띄어 읽기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_space7",
        "type": "tip",
        "icon": "🧩",
        "title": "뜻이 드러나게",
        "content": "의미 단위로 띄어 읽으면 뜻이 잘 드러남을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_space7b",
        "type": "fun_question",
        "icon": "📖",
        "title": "어디서 쉴까",
        "content": "\"이 문장은 어디에서 쉬어 읽으면 좋을까요?\" 띄어 읽기를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_space7",
        "type": "real_world",
        "icon": "🌍",
        "title": "읽어 주기",
        "content": "누군가 책을 잘 읽어 줘 이해가 쉬웠던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_space7b",
        "type": "tip",
        "icon": "🧩",
        "title": "의미 단위로",
        "content": "'누가/무엇을/어찌하다' 단위로 살짝 쉬게 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_space7",
        "type": "misconception",
        "icon": "❓",
        "title": "한 글자씩 끊지 않기",
        "content": "한 글자씩 뚝뚝 끊어 읽으면 뜻이 안 드러나요. 의미 단위로 읽게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_space7c",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떻게 읽을까",
        "content": "\"이 문장을 어떻게 띄어 읽으면 좋을까요?\" 함께 읽어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_space7",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "문장 ↔ 띄어 읽기 짝짓기",
        "description": "문장과 알맞은 띄어 읽기를 짝지어 보세요.",
        "hint": "뜻이 드러나게 쉬어요.",
        "pairs": [
          {
            "a": {
              "text": "⭐ 맑은 하늘"
            },
            "b": {
              "text": "맑은 하늘에 / 별이"
            }
          },
          {
            "a": {
              "text": "🐔 닭이 흙을"
            },
            "b": {
              "text": "닭이 / 흙을 / 밟는다"
            }
          },
          {
            "a": {
              "text": "🌳 작은 새가"
            },
            "b": {
              "text": "작은 새가 / 앉았다"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present7",
        "type": "tip",
        "icon": "🗣",
        "title": "읽고 이야기",
        "content": "읽은 뒤 내용을 자기 말로 이야기하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_space7",
        "type": "extension",
        "icon": "⬆",
        "title": "바꿔 읽기",
        "content": "\"빠르게·천천히 읽으면 느낌이 어떻게 다를까요?\" 읽기를 비교해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect7",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"알맞게 띄어 읽으면 무엇이 좋죠?\" 뜻 드러남을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_mood7",
        "type": "extension",
        "icon": "⬆",
        "title": "분위기 예고",
        "content": "\"다음엔 시의 분위기를 살펴봐요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 8,
      "title": "시의 분위기를 살펴봐요 ①",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 시의 분위기 → 말·장면으로 느끼기 → 장면↔분위기 잇기 → 분위기 느껴 말하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "시의 분위기를 살펴봐요",
          "subtitle": "4단원 · 8/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_poem8",
          "t_poem8"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "시의 분위기를 느껴봐요",
            "말과 장면으로 분위기를 알아봐요",
            "시의 분위기를 말해 봐요"
          ]
        },
        "suggested_extras": [
          "t_poem8"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "시마다 느낌이 달라요 🎵",
          "visual": "🎵",
          "question": "\"통통 공이 콩콩 뛰어요\"와 \"달님이 살며시 창가에 앉아요\"<br>두 시의 느낌이 어떻게 다른가요?",
          "img": "assets/photo/korean/g2u4_poem_mood1.jpg"
        },
        "suggested_extras": [
          "q_feel8",
          "r_poem8"
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
              "q": "'읽다'는 어떻게 소리 나나요?",
              "a": "[익따]"
            },
            {
              "q": "바르게 읽으려면?",
              "a": "천천히 소리 내어 봐요"
            }
          ],
          "from": "u4_l07"
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
          "title": "말과 장면으로 분위기 느끼기",
          "content": "시의 분위기는 **쓰인 말**과 **떠오르는 장면**으로 느낄 수 있어요. \"통통·콩콩\" 같은 말은 **신나는** 분위기, \"살며시·고요히\" 같은 말은 **조용한** 분위기를 만들어요!",
          "symbol_meanings": [
            {
              "symbol": "통통·콩콩",
              "meaning": "신나는 분위기"
            },
            {
              "symbol": "살며시·고요히",
              "meaning": "조용한 분위기"
            },
            {
              "symbol": "포근히·따뜻이",
              "meaning": "포근한 분위기"
            },
            {
              "symbol": "떠오르는 장면",
              "meaning": "그림으로 느껴요"
            }
          ]
        },
        "suggested_extras": [
          "t_poem8b",
          "x_poem8"
        ],
        "tnote": {
          "ask": [
            "이 시는 어떤 분위기일까?"
          ],
          "watch": "시 분위기 감상",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 시의 분위기는? 🎵",
          "sub": "시에 쓰인 말로 분위기를 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"통통 공이 콩콩 뛰어요\"",
              "emoji": "⚽",
              "name": "신나는 분위기"
            },
            {
              "clue": "\"달님이 살며시 창가에 앉아요\"",
              "emoji": "🌙",
              "name": "조용한 분위기"
            },
            {
              "clue": "\"엄마 품에 포근히 안겨요\"",
              "emoji": "🤗",
              "name": "포근한 분위기"
            }
          ],
          "outro": "쓰인 말로 분위기를 알 수 있어요. 시의 분위기를 느껴 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick8",
          "g_poem8"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "분위기를 느껴 말해요",
          "question": "시를 읽고 분위기를 느껴 볼까요?",
          "items": [
            "이 시는 어떤 분위기인가요?",
            "어떤 말에서 그 느낌이 드나요?",
            "어떤 장면이 떠오르나요?"
          ]
        },
        "suggested_extras": [
          "t_present8",
          "e_poem8"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "시의 분위기를 살펴봐요 ①",
          "levels": {
            "읽기": {
              "q": "'달빛이 조용히 내린다'는 어떤 분위기일까요?",
              "a": "고요하고 차분한 분위기"
            },
            "쓰기": {
              "q": "즐거운 분위기의 짧은 시 한 줄을 만들어 써 볼까요?",
              "a": "여러 답 (예: 공이 통통 신나게 튄다)",
              "open": true
            },
            "말하기": {
              "q": "내가 지은 시 한 줄의 분위기를 짝에게 말해 봐요.",
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
          "title": "시 분위기 나누기 짝 활동",
          "type": "pair",
          "goal": "시의 분위기를 느껴요",
          "body": "짝과 짧은 시 한 줄을 각자 지어, 어떤 분위기인지 서로 말해 줘요.",
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
              "q": "시에도 분위기가 있나요?",
              "a": "네, 있어요"
            },
            {
              "q": "'달빛'은 어떤 분위기?",
              "a": "조용한 분위기"
            },
            {
              "q": "분위기는 무엇으로 느끼나요?",
              "a": "낱말과 장면"
            }
          ],
          "self": [
            "시의 분위기를 느낄 수 있어요",
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
            "시의 분위기를 느꼈어요",
            "말과 장면으로 분위기를 알았어요",
            "시의 분위기를 말했어요"
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
          "preview": "분위기를 더 살펴봐요",
          "body": "다음 시간에는 여러 시의 분위기를 더 살펴보고 비교해 볼 거예요!"
        },
        "suggested_extras": [
          "e_poem8b"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_poem8",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋아하는 시",
        "content": "\"기억에 남는 시나 노래가 있나요?\" 시를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_poem8",
        "type": "tip",
        "icon": "🧩",
        "title": "말과 장면",
        "content": "분위기는 쓰인 말과 떠오르는 장면으로 느낄 수 있음을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_feel8",
        "type": "fun_question",
        "icon": "🎵",
        "title": "느낌의 차이",
        "content": "\"두 시의 느낌이 어떻게 다른가요?\" 분위기를 비교해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_poem8",
        "type": "real_world",
        "icon": "🌍",
        "title": "노래의 분위기",
        "content": "신나는 노래·잔잔한 노래의 느낌 차이와 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_poem8b",
        "type": "tip",
        "icon": "🧩",
        "title": "말에서 느끼기",
        "content": "흉내 내는 말·꾸며 주는 말에서 분위기를 느끼게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_poem8",
        "type": "misconception",
        "icon": "❓",
        "title": "정답은 없어요",
        "content": "느끼는 분위기가 조금 달라도 괜찮아요. 까닭이 있으면 인정하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick8",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 분위기?",
        "content": "\"이 시는 어떤 분위기일까요?\" 분위기를 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_poem8",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "시 ↔ 분위기 짝짓기",
        "description": "시와 분위기를 짝지어 보세요.",
        "hint": "쓰인 말을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "⚽ 통통 콩콩"
            },
            "b": {
              "text": "신나는"
            }
          },
          {
            "a": {
              "text": "🌙 살며시"
            },
            "b": {
              "text": "조용한"
            }
          },
          {
            "a": {
              "text": "🤗 포근히"
            },
            "b": {
              "text": "포근한"
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
        "title": "까닭과 함께",
        "content": "분위기를 느낀 까닭(어떤 말·장면)을 함께 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_poem8",
        "type": "extension",
        "icon": "⬆",
        "title": "장면 그리기",
        "content": "\"이 시에서 떠오르는 장면을 그려 볼까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect8",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"분위기는 무엇으로 느끼죠?\" 말·장면을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_poem8b",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 보기 예고",
        "content": "\"다음엔 여러 시의 분위기를 비교해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 9,
      "title": "시의 분위기를 살펴봐요 ②",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 여러 분위기 비교 → 분위기를 만드는 말 → 밝은 말 모으기 → 분위기 비교해 말하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "시의 분위기를 살펴봐요",
          "subtitle": "4단원 · 9/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_recall9",
          "t_compare9"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "여러 시의 분위기를 비교해요",
            "분위기를 만드는 말을 찾아요",
            "분위기에 어울리는 말을 모아요"
          ]
        },
        "suggested_extras": [
          "t_compare9"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "말을 바꾸면 분위기도! 🔄",
          "visual": "🎨",
          "question": "같은 비도 \"주룩주룩 쏟아져요\"와 \"보슬보슬 내려요\"는<br>분위기가 어떻게 다를까요?",
          "img": "assets/photo/korean/g2u4_poem_mood2.jpg"
        },
        "suggested_extras": [
          "q_change9",
          "r_compare9"
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
              "q": "시에도 분위기가 있나요?",
              "a": "네, 있어요"
            },
            {
              "q": "분위기는 무엇으로 느끼나요?",
              "a": "낱말과 장면"
            }
          ],
          "from": "u4_l08"
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
          "title": "분위기를 만드는 말",
          "content": "같은 것도 **어떤 말**을 쓰느냐에 따라 분위기가 달라져요. \"주룩주룩\"은 **세찬** 느낌, \"보슬보슬\"은 **부드러운** 느낌이에요. 밝은 말은 신나는 분위기를, 조용한 말은 차분한 분위기를 만들어요!",
          "symbol_meanings": [
            {
              "symbol": "주룩주룩",
              "meaning": "세차고 활기찬"
            },
            {
              "symbol": "보슬보슬",
              "meaning": "부드럽고 조용한"
            },
            {
              "symbol": "반짝반짝",
              "meaning": "밝고 신나는"
            },
            {
              "symbol": "살랑살랑",
              "meaning": "부드럽고 포근한"
            }
          ]
        },
        "suggested_extras": [
          "t_compare9b",
          "x_compare9"
        ],
        "tnote": {
          "ask": [
            "흉내 내는 말은 시를 어떻게 바꿀까?"
          ],
          "watch": "흉내말과 시 분위기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 말의 분위기는? 🎨",
          "sub": "말의 느낌으로 분위기를 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"신나게 펄쩍펄쩍\"은?",
              "emoji": "🤸",
              "name": "신나는 분위기"
            },
            {
              "clue": "\"고요히 살며시\"는?",
              "emoji": "🌙",
              "name": "조용한 분위기"
            },
            {
              "clue": "\"포근히 살랑살랑\"은?",
              "emoji": "🍃",
              "name": "포근한 분위기"
            }
          ],
          "outro": "말에 따라 분위기가 달라져요. 밝은 말을 모아 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick9",
          "g_compare9"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "분위기를 비교해 말해요",
          "question": "두 시의 분위기를 비교해 볼까요?",
          "items": [
            "두 시의 분위기가 어떻게 다른가요?",
            "어떤 말에서 그 느낌이 드나요?",
            "어떤 분위기가 더 마음에 드나요?"
          ]
        },
        "suggested_extras": [
          "t_present9",
          "e_compare9"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "시의 분위기를 살펴봐요 ②",
          "levels": {
            "읽기": {
              "q": "'빗방울이 톡톡 떨어진다'는 어떤 소리를 흉내 내나요?",
              "a": "빗방울 소리 (톡톡)"
            },
            "쓰기": {
              "q": "흉내 내는 말을 넣어 시 한 줄을 지어 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "흉내 내는 말이 분위기를 어떻게 살리는지 말해 봐요.",
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
          "title": "흉내말 시 짝 활동",
          "type": "pair",
          "goal": "흉내 내는 말로 분위기를 살려요",
          "body": "짝과 흉내 내는 말을 하나씩 골라 시 한 줄을 지어, 분위기를 살려 읽어 줘요.",
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
              "q": "흉내 내는 말은 시에서?",
              "a": "분위기를 살려요"
            },
            {
              "q": "'톡톡'은 무엇을 흉내 내나요?",
              "a": "빗방울 소리"
            },
            {
              "q": "시를 읽을 때 흉내말은?",
              "a": "실감 나게 읽어요"
            }
          ],
          "self": [
            "흉내말로 분위기를 살릴 수 있어요",
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
            "여러 시의 분위기를 비교했어요",
            "분위기를 만드는 말을 찾았어요",
            "분위기에 어울리는 말을 모았어요"
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
          "preview": "분위기를 살려 읽어요",
          "body": "다음 시간에는 시의 분위기를 생각하며 소리 내어 읽어 볼 거예요!"
        },
        "suggested_extras": [
          "e_read9"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall9",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 분위기",
        "content": "\"지난 시간에 본 시는 어떤 분위기였나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_compare9",
        "type": "tip",
        "icon": "🧩",
        "title": "말이 분위기를",
        "content": "같은 대상도 말에 따라 분위기가 달라짐을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_change9",
        "type": "fun_question",
        "icon": "🎨",
        "title": "느낌의 차이",
        "content": "\"두 표현은 분위기가 어떻게 다를까요?\" 비교해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_compare9",
        "type": "real_world",
        "icon": "🌍",
        "title": "같은 날씨 다른 느낌",
        "content": "같은 비도 상황에 따라 느낌이 다른 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_compare9b",
        "type": "tip",
        "icon": "🧩",
        "title": "밝은 말·조용한 말",
        "content": "밝은 말과 조용한 말이 만드는 분위기를 구분하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_compare9",
        "type": "misconception",
        "icon": "❓",
        "title": "정답은 없어요",
        "content": "느끼는 분위기가 조금 달라도 까닭이 있으면 인정하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick9",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 분위기?",
        "content": "\"이 말은 어떤 분위기를 만들까요?\" 분위기를 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_compare9",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "말 ↔ 분위기 짝짓기",
        "description": "말과 분위기를 짝지어 보세요.",
        "hint": "느낌을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🤸 펄쩍펄쩍"
            },
            "b": {
              "text": "신나는"
            }
          },
          {
            "a": {
              "text": "🌙 살며시"
            },
            "b": {
              "text": "조용한"
            }
          },
          {
            "a": {
              "text": "🍃 살랑살랑"
            },
            "b": {
              "text": "포근한"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present9",
        "type": "tip",
        "icon": "🗣",
        "title": "비교해 말하기",
        "content": "두 시의 분위기를 까닭과 함께 비교해 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_compare9",
        "type": "extension",
        "icon": "⬆",
        "title": "말 바꾸기",
        "content": "\"이 말을 바꾸면 분위기가 어떻게 될까요?\" 표현을 실험해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect9",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"분위기는 무엇이 만들죠?\" 말을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read9",
        "type": "extension",
        "icon": "⬆",
        "title": "낭송 예고",
        "content": "\"다음엔 분위기를 살려 소리 내어 읽어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l10"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 10,
      "title": "분위기를 생각하며 소리 내어 읽어요 ①",
      "std": "[2국02-02] · [2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 분위기에 맞는 목소리 → 빠르기·크기 조절 → 어울리는 읽기 고르기 → 분위기 살려 읽기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분위기를 생각하며 소리 내어 읽어요",
          "subtitle": "4단원 · 10/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_read10",
          "t_read10"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "분위기에 맞는 목소리를 알아봐요",
            "빠르기와 크기를 조절해요",
            "분위기를 살려 시를 읽어요"
          ]
        },
        "suggested_extras": [
          "t_read10"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "분위기에 맞게 읽어요 🎤",
          "visual": "🎤",
          "question": "신나는 시는 밝고 빠르게, 조용한 시는 천천히 부드럽게!<br>같은 시도 어떻게 읽느냐에 따라 느낌이 달라져요.",
          "img": "assets/photo/korean/g2u4_recite1.jpg"
        },
        "suggested_extras": [
          "q_voice10",
          "r_read10"
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
              "q": "흉내 내는 말은 시에서?",
              "a": "분위기를 살려요"
            },
            {
              "q": "시를 읽을 때 흉내말은?",
              "a": "실감 나게 읽어요"
            }
          ],
          "from": "u4_l09"
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
          "title": "분위기에 맞는 목소리",
          "content": "분위기에 맞게 **목소리**를 조절해요. **신나는** 시는 밝고 빠르게, **조용한** 시는 천천히 부드럽게, **포근한** 시는 따뜻하게 읽어요. 알맞게 **띄어 읽기**도 잊지 않아요!",
          "symbol_meanings": [
            {
              "symbol": "신나는 시",
              "meaning": "밝고 빠르게"
            },
            {
              "symbol": "조용한 시",
              "meaning": "천천히 부드럽게"
            },
            {
              "symbol": "포근한 시",
              "meaning": "따뜻하고 다정하게"
            },
            {
              "symbol": "띄어 읽기",
              "meaning": "뜻이 드러나게"
            }
          ]
        },
        "suggested_extras": [
          "t_read10b",
          "x_read10"
        ],
        "tnote": {
          "ask": [
            "어디에서 쉬어 읽으면 좋을까?"
          ],
          "watch": "띄어 읽기·낭송",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "어울리는 읽기는? ✅",
          "sub": "분위기에 맞는 읽기 방법을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "신나는 시는 어떻게 읽을까요?",
              "emoji": "🏃",
              "name": "밝고 빠르게"
            },
            {
              "clue": "조용한 시는 어떻게 읽을까요?",
              "emoji": "🌙",
              "name": "천천히 부드럽게"
            },
            {
              "clue": "포근한 시는 어떻게 읽을까요?",
              "emoji": "🤗",
              "name": "따뜻하고 다정하게"
            }
          ],
          "outro": "분위기에 맞게 읽으니 시가 살아나요. 직접 읽어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick10",
          "g_read10"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "분위기를 살려 읽어요 🎤",
          "sub": "버튼을 눌러 읽을 친구를 뽑아요. 시의 분위기에 맞게 목소리를 조절해 읽어 봐요!",
          "count": 24,
          "hint": "신나는 시는 밝고 빠르게, 조용한 시는 천천히 부드럽게 읽어 봐요",
          "end_msg": "모두 분위기를 살려 멋지게 낭송했어요! 👏"
        },
        "suggested_extras": [
          "t_present10",
          "e_read10"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "분위기를 생각하며 소리 내어 읽어요 ①",
          "levels": {
            "읽기": {
              "q": "조용한 시를 낮고 느린 목소리로 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "시를 읽을 때 지킬 점 한 가지를 써 볼까요?",
              "a": "여러 답 (예: 알맞게 띄어 읽기)",
              "open": true
            },
            "말하기": {
              "q": "알맞게 띄어 읽으면 무엇이 좋은지 말해 봐요.",
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
          "title": "띄어 읽기 짝 활동",
          "type": "pair",
          "goal": "알맞게 띄어 읽어요",
          "body": "짝과 같은 시를 알맞게 띄어 읽고, 어디에서 쉬면 좋을지 함께 표시해요.",
          "materials": [
            "읽을 시"
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
              "q": "시는 어떻게 읽으면 좋나요?",
              "a": "분위기를 살려"
            },
            {
              "q": "알맞게 띄어 읽으면?",
              "a": "뜻이 잘 전해져요"
            },
            {
              "q": "조용한 시는?",
              "a": "낮고 느리게 읽어요"
            }
          ],
          "self": [
            "분위기를 살려 소리 내어 읽을 수 있어요",
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
            "분위기에 맞는 목소리를 알았어요",
            "빠르기와 크기를 조절했어요",
            "분위기를 살려 시를 읽었어요"
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
          "preview": "분위기를 살려 더 읽어요",
          "body": "다음 시간에는 여러 시를 분위기에 맞게 읽으며 낭송을 연습해 볼 거예요!"
        },
        "suggested_extras": [
          "e_read10b"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_read10",
        "type": "fun_question",
        "icon": "💡",
        "title": "읽는 목소리",
        "content": "\"같은 글도 목소리를 바꾸면 어떻게 달라질까요?\" 낭송을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_read10",
        "type": "tip",
        "icon": "🧩",
        "title": "목소리 조절",
        "content": "분위기에 맞게 빠르기·크기·부드러움을 조절하게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_voice10",
        "type": "fun_question",
        "icon": "🎤",
        "title": "어떻게 읽을까",
        "content": "\"이 시는 어떤 목소리로 읽으면 좋을까요?\" 읽기를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_read10",
        "type": "real_world",
        "icon": "🌍",
        "title": "실감 나는 읽기",
        "content": "동화를 실감 나게 읽어 준 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_read10b",
        "type": "tip",
        "icon": "🧩",
        "title": "띄어 읽기도",
        "content": "목소리 조절과 함께 알맞게 띄어 읽기도 잊지 않게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_read10",
        "type": "misconception",
        "icon": "❓",
        "title": "한 가지 목소리로?",
        "content": "모든 시를 같은 목소리로 읽으면 분위기가 안 살아요. 시에 맞게 바꾸게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick10",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떻게 읽지",
        "content": "\"이 분위기에는 어떤 읽기가 어울리죠?\" 읽기를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_read10",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "분위기 ↔ 읽는 방법 짝짓기",
        "description": "분위기와 읽는 방법을 짝지어 보세요.",
        "hint": "어울리는 목소리를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🏃 신나는"
            },
            "b": {
              "text": "밝고 빠르게"
            }
          },
          {
            "a": {
              "text": "🌙 조용한"
            },
            "b": {
              "text": "천천히 부드럽게"
            }
          },
          {
            "a": {
              "text": "🤗 포근한"
            },
            "b": {
              "text": "따뜻하게"
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
        "title": "격려하기",
        "content": "읽는 친구를 격려하고, 듣는 친구는 좋았던 점을 찾게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_read10",
        "type": "extension",
        "icon": "⬆",
        "title": "몸짓 더하기",
        "content": "\"분위기에 맞는 몸짓을 더해 읽어 볼까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect10",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"분위기에 맞게 읽으려면 무엇을 조절하죠?\" 목소리를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read10b",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 읽기 예고",
        "content": "\"다음엔 여러 시를 낭송해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l11"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 11,
      "title": "분위기를 생각하며 소리 내어 읽어요 ②",
      "std": "[2국02-02] · [2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 낭송 준비 → 좋은 낭송 → 알맞은 읽기 모으기 → 시 낭송하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "분위기를 생각하며 소리 내어 읽어요",
          "subtitle": "4단원 · 11/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_recall11",
          "t_recite11"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "좋은 낭송이 무엇인지 알아봐요",
            "분위기를 살려 시를 낭송해요",
            "친구 낭송을 잘 들어요"
          ]
        },
        "suggested_extras": [
          "t_recite11"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "시를 멋지게 낭송해요 🎙️",
          "visual": "🎙️",
          "question": "좋아하는 시를 친구들 앞에서 낭송한다면<br>어떻게 읽으면 분위기가 잘 전해질까요?",
          "img": "assets/photo/korean/g2u4_recite2.jpg"
        },
        "suggested_extras": [
          "q_how11",
          "r_recite11"
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
              "q": "시는 어떻게 읽으면 좋나요?",
              "a": "분위기를 살려"
            },
            {
              "q": "알맞게 띄어 읽으면?",
              "a": "뜻이 잘 전해져요"
            }
          ],
          "from": "u4_l10"
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
          "title": "좋은 낭송하기",
          "content": "좋은 낭송은 **분위기에 맞는 목소리**로 읽고, **알맞게 띄어** 읽으며, 너무 빠르지도 느리지도 않게 읽어요. 듣는 친구는 **바른 자세**로 분위기를 함께 느끼며 들어요!",
          "symbol_meanings": [
            {
              "symbol": "분위기 목소리",
              "meaning": "느낌에 맞게"
            },
            {
              "symbol": "알맞게 띄어",
              "meaning": "뜻이 드러나게"
            },
            {
              "symbol": "적당한 빠르기",
              "meaning": "또박또박"
            },
            {
              "symbol": "바른 듣기",
              "meaning": "분위기를 함께 느껴요"
            }
          ]
        },
        "suggested_extras": [
          "t_recite11b",
          "x_recite11"
        ],
        "tnote": {
          "ask": [
            "이 시에 어울리는 목소리는 무엇일까?"
          ],
          "watch": "분위기 낭송",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "좋은 낭송 모습은? ✅",
          "sub": "좋은 낭송의 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "신나는 시를 낭송할 때는?",
              "emoji": "🎵",
              "name": "밝고 빠르게, 즐겁게"
            },
            {
              "clue": "조용한 시를 낭송할 때는?",
              "emoji": "🌙",
              "name": "천천히 부드럽게"
            },
            {
              "clue": "친구가 낭송할 때는?",
              "emoji": "👂",
              "name": "바른 자세로 분위기를 느끼며 들어요"
            }
          ],
          "outro": "분위기를 살려 낭송하면 듣는 사람도 그 느낌을 느껴요. 낭송해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good11",
          "g_recite11"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "시를 낭송해요 🎙️",
          "sub": "버튼을 눌러 낭송할 친구를 뽑아요. 좋아하는 시를 분위기를 살려 낭송해 봐요!",
          "count": 24,
          "hint": "시의 분위기에 맞게 목소리를 조절하고, 알맞게 띄어 읽어 봐요",
          "end_msg": "모두 분위기를 살려 멋지게 낭송했어요. 시의 느낌이 가득! 👏"
        },
        "suggested_extras": [
          "t_present11",
          "e_recite11"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "분위기를 생각하며 소리 내어 읽어요 ②",
          "levels": {
            "읽기": {
              "q": "즐거운 시를 밝고 신나는 목소리로 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "내가 읽을 시에 어울리는 목소리를 한 낱말로 써 볼까요?",
              "a": "여러 답 (예: 밝게·조용히)",
              "open": true
            },
            "말하기": {
              "q": "분위기에 맞게 시를 짝에게 낭송해 봐요.",
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
          "title": "시 낭송 나누기 짝 활동",
          "type": "pair",
          "goal": "분위기를 살려 낭송해요",
          "body": "짝과 각자 고른 시를 분위기를 살려 낭송하고, 잘한 점을 서로 말해 줘요.",
          "materials": [
            "읽을 시"
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
              "q": "즐거운 시는 어떻게 읽나요?",
              "a": "밝고 신나게"
            },
            {
              "q": "낭송할 때 목소리는?",
              "a": "분위기에 맞게 바꿔요"
            },
            {
              "q": "분위기를 살려 낭송하면?",
              "a": "듣는 사람도 즐거워요"
            }
          ],
          "self": [
            "분위기를 살려 낭송할 수 있어요",
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
            "좋은 낭송이 무엇인지 알았어요",
            "분위기를 살려 시를 낭송했어요",
            "친구 낭송을 잘 들었어요"
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
          "preview": "시로 여는 우리 반을 만들어요",
          "body": "다음 시간에는 좋아하는 시를 모아 '시로 여는 우리 반'을 만들어 볼 거예요!"
        },
        "suggested_extras": [
          "e_class11"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall11",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 낭송",
        "content": "\"지난 시간에 어떻게 읽으면 좋았나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_recite11",
        "type": "tip",
        "icon": "🧩",
        "title": "좋은 낭송",
        "content": "분위기 목소리·띄어 읽기·적당한 빠르기가 좋은 낭송임을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how11",
        "type": "fun_question",
        "icon": "🎙️",
        "title": "어떻게 낭송?",
        "content": "\"분위기가 잘 전해지려면 어떻게 읽을까요?\" 낭송을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_recite11",
        "type": "real_world",
        "icon": "🌍",
        "title": "낭송 무대",
        "content": "시 낭송·발표를 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_recite11b",
        "type": "tip",
        "icon": "🧩",
        "title": "함께 느끼기",
        "content": "듣는 친구도 분위기를 함께 느끼며 듣게 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_recite11",
        "type": "misconception",
        "icon": "❓",
        "title": "빠르게 ≠ 잘",
        "content": "빨리 읽기보다 분위기에 맞게 알맞은 빠르기로 읽게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good11",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋은 낭송은?",
        "content": "\"좋은 낭송의 모습은 무엇이죠?\" 목소리·자세를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_recite11",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "분위기 ↔ 낭송 방법 짝짓기",
        "description": "분위기와 낭송 방법을 짝지어 보세요.",
        "hint": "어울리는 목소리를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🎵 신나는"
            },
            "b": {
              "text": "밝고 빠르게"
            }
          },
          {
            "a": {
              "text": "🌙 조용한"
            },
            "b": {
              "text": "천천히 부드럽게"
            }
          },
          {
            "a": {
              "text": "👂 들을 때"
            },
            "b": {
              "text": "바른 자세로"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present11",
        "type": "tip",
        "icon": "🗣",
        "title": "격려하기",
        "content": "낭송하는 친구를 격려하고, 듣는 친구는 분위기를 느끼게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_recite11",
        "type": "extension",
        "icon": "⬆",
        "title": "함께 낭송",
        "content": "\"모둠이 함께 한 편을 낭송해 볼까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect11",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"좋은 낭송은 어떻게 하죠?\" 분위기 목소리를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_class11",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 예고",
        "content": "\"다음엔 시로 여는 우리 반을 만들어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l12"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 12,
      "title": "시로 여는 우리 반을 만들어요 ① (실천)",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 좋아하는 시 고르기 → 낭송 준비 → 낭송 차례 잇기 → 시 낭송 연습 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "시로 여는 우리 반을 만들어요",
          "subtitle": "4단원 · 12/15차시 · 실천"
        },
        "suggested_extras": [
          "q_class12",
          "t_class12"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "좋아하는 시를 골라요",
            "낭송을 준비해요",
            "분위기를 살려 낭송을 연습해요"
          ]
        },
        "suggested_extras": [
          "t_class12"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "아침을 시로 열어요 🌅",
          "visual": "🌅",
          "question": "매일 아침 친구가 좋아하는 시를 한 편씩 낭송한다면<br>우리 반은 어떤 분위기가 될까요?",
          "img": "assets/photo/korean/g2u4_class_poem1.jpg"
        },
        "suggested_extras": [
          "q_pick12",
          "r_class12"
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
              "q": "즐거운 시는 어떻게 읽나요?",
              "a": "밝고 신나게"
            },
            {
              "q": "분위기를 살려 낭송하면?",
              "a": "듣는 사람도 즐거워요"
            }
          ],
          "from": "u4_l11"
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
          "title": "시로 여는 우리 반",
          "content": "좋아하는 시를 골라 분위기에 맞게 낭송하며 하루를 열어요. 시를 고를 땐 **마음에 드는 시**를 고르고, **왜 좋은지** 떠올려요. 낭송은 분위기를 살려 **또박또박** 읽어요!",
          "symbol_meanings": [
            {
              "symbol": "시 고르기",
              "meaning": "마음에 드는 시"
            },
            {
              "symbol": "까닭",
              "meaning": "왜 좋은지"
            },
            {
              "symbol": "분위기 살려",
              "meaning": "느낌에 맞게"
            },
            {
              "symbol": "또박또박",
              "meaning": "알맞은 빠르기로"
            }
          ]
        },
        "suggested_extras": [
          "t_class12b",
          "x_class12"
        ],
        "tnote": {
          "ask": [
            "우리 반의 어떤 모습을 시로 담을까?"
          ],
          "watch": "시 짓기 실천",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "낭송할 때 살필 점은? ✅",
          "sub": "시 낭송을 준비할 때 살펴볼 점을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "시를 고를 때는?",
              "emoji": "💗",
              "name": "마음에 드는 시를 골라요"
            },
            {
              "clue": "낭송하기 전에는?",
              "emoji": "🎵",
              "name": "시의 분위기를 살펴요"
            },
            {
              "clue": "낭송할 때는?",
              "emoji": "🎙️",
              "name": "분위기를 살려 또박또박 읽어요"
            }
          ],
          "outro": "마음에 드는 시를 분위기를 살려 낭송하면 멋져요. 연습해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_point12",
          "g_class12"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "낭송을 연습해요",
          "question": "좋아하는 시로 낭송을 준비해 볼까요?",
          "items": [
            "어떤 시를 골랐나요?",
            "왜 그 시가 좋은가요?",
            "시의 분위기에 맞게 읽고 있나요?"
          ]
        },
        "suggested_extras": [
          "t_present12",
          "e_class12"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "시로 여는 우리 반 ① (실천)",
          "levels": {
            "읽기": {
              "q": "친구가 지은 짧은 시를 분위기를 살려 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "우리 반을 소재로 짧은 시 한 줄을 지어 써 볼까요?",
              "a": "여러 답 (예: 우리 반은 웃음이 가득)",
              "open": true
            },
            "말하기": {
              "q": "내가 지은 시를 분위기를 살려 짝에게 들려줘요.",
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
          "title": "우리 반 시 짓기 짝 활동",
          "type": "pair",
          "goal": "함께 시를 지어요",
          "body": "짝과 우리 반을 소재로 한 줄씩 이어 시를 짓고, 분위기를 살려 함께 읽어요.",
          "materials": [
            "종이"
          ],
          "minutes": 8
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
              "q": "시는 무엇을 소재로 지을 수 있나요?",
              "a": "우리 주변 무엇이든"
            },
            {
              "q": "지은 시는 어떻게 하나요?",
              "a": "분위기를 살려 읽어요"
            },
            {
              "q": "함께 시를 지으면?",
              "a": "더 즐거워요"
            }
          ],
          "self": [
            "시를 지어 낭송할 수 있어요",
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
            "좋아하는 시를 골랐어요",
            "낭송을 준비했어요",
            "분위기를 살려 낭송을 연습했어요"
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
          "preview": "시를 낭송하고 나눠요",
          "body": "다음 시간에는 준비한 시를 친구들 앞에서 낭송하고 함께 즐겨 볼 거예요!"
        },
        "suggested_extras": [
          "e_share12"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_class12",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋아하는 시",
        "content": "\"마음에 드는 시나 노랫말이 있나요?\" 시를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_class12",
        "type": "tip",
        "icon": "🧩",
        "title": "마음에 드는 시",
        "content": "마음에 드는 시를 까닭과 함께 고르게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_pick12",
        "type": "fun_question",
        "icon": "🌅",
        "title": "어떤 분위기?",
        "content": "\"우리 반이 어떤 분위기였으면 하나요?\" 상상을 열어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_class12",
        "type": "real_world",
        "icon": "🌍",
        "title": "아침 활동",
        "content": "아침에 노래·시로 하루를 연 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_class12b",
        "type": "tip",
        "icon": "🧩",
        "title": "분위기 살펴 낭송",
        "content": "고른 시의 분위기를 먼저 살피고 낭송을 준비하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_class12",
        "type": "misconception",
        "icon": "❓",
        "title": "외우기보다 느끼기",
        "content": "무조건 외우기보다 분위기를 느끼며 낭송하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_point12",
        "type": "fun_question",
        "icon": "💡",
        "title": "무엇을 살필까",
        "content": "\"낭송을 준비할 때 무엇을 살피죠?\" 분위기·태도를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_class12",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "단계 ↔ 할 일 짝짓기",
        "description": "낭송 단계와 할 일을 짝지어 보세요.",
        "hint": "낭송 차례를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "💗 고르기"
            },
            "b": {
              "text": "마음에 드는 시"
            }
          },
          {
            "a": {
              "text": "🎵 준비"
            },
            "b": {
              "text": "분위기 살피기"
            }
          },
          {
            "a": {
              "text": "🎙️ 낭송"
            },
            "b": {
              "text": "분위기 살려"
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
        "title": "천천히 연습",
        "content": "부담 없이 천천히 낭송을 연습하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_class12",
        "type": "extension",
        "icon": "⬆",
        "title": "몸짓 더하기",
        "content": "\"분위기에 맞는 몸짓을 더해 볼까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect12",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"낭송 준비에 무엇이 필요하죠?\" 시 고르기·분위기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_share12",
        "type": "extension",
        "icon": "⬆",
        "title": "낭송 나누기 예고",
        "content": "\"다음엔 시를 낭송하고 나눠요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l13"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 13,
      "title": "시로 여는 우리 반을 만들어요 ② (실천)",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 낭송·듣기 약속 → 좋은 듣기 → 좋은 듣기 모으기 → 시 낭송·소감 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "시로 여는 우리 반을 만들어요",
          "subtitle": "4단원 · 13/15차시 · 실천"
        },
        "suggested_extras": [
          "q_ready13",
          "t_listen13"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "분위기를 살려 시를 낭송해요",
            "친구 낭송을 잘 들어요",
            "낭송을 듣고 느낌을 나눠요"
          ]
        },
        "suggested_extras": [
          "t_listen13"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "우리 반 시 낭송회 🎉",
          "visual": "🎉",
          "question": "친구들이 고른 시를 차례로 낭송해요.<br>친구 낭송을 들으면 무엇이 좋을까요?",
          "img": "assets/photo/korean/g2u4_class_poem2.jpg"
        },
        "suggested_extras": [
          "q_hear13",
          "r_listen13"
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
              "q": "시는 무엇을 소재로 지을 수 있나요?",
              "a": "우리 주변 무엇이든"
            },
            {
              "q": "함께 시를 지으면?",
              "a": "더 즐거워요"
            }
          ],
          "from": "u4_l12"
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
          "title": "낭송하고 잘 듣기",
          "content": "낭송할 땐 **분위기를 살려** 읽고, 들을 땐 **바른 자세로** 분위기를 함께 느끼며 들어요. 낭송을 듣고 \"이 부분이 좋았어\" 하고 **좋은 점**을 나누면 서로 즐거워요!",
          "symbol_meanings": [
            {
              "symbol": "분위기 살려",
              "meaning": "느낌에 맞게 낭송"
            },
            {
              "symbol": "바른 듣기",
              "meaning": "끝까지 잘 들어요"
            },
            {
              "symbol": "함께 느끼기",
              "meaning": "분위기를 같이"
            },
            {
              "symbol": "좋은 점 나누기",
              "meaning": "칭찬해 줘요"
            }
          ]
        },
        "suggested_extras": [
          "t_listen13b",
          "x_listen13"
        ],
        "tnote": {
          "ask": [
            "우리 반 시 모음을 어떻게 나눌까?"
          ],
          "watch": "시 모음 실천",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "좋은 듣기 태도는? ✅",
          "sub": "낭송을 들을 때 바른 태도를 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 낭송할 때는?",
              "emoji": "👂",
              "name": "바른 자세로 끝까지 들어요"
            },
            {
              "clue": "분위기를 느낄 때는?",
              "emoji": "🎵",
              "name": "시의 느낌을 함께 느껴요"
            },
            {
              "clue": "낭송이 끝나면?",
              "emoji": "👏",
              "name": "좋은 점을 찾아 박수쳐요"
            }
          ],
          "outro": "잘 듣고 좋은 점을 나누면 낭송회가 즐거워요. 함께 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good13",
          "g_listen13"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "시를 낭송하고 나눠요 🎙️",
          "sub": "버튼을 눌러 낭송할 친구를 뽑아요. 준비한 시를 분위기를 살려 낭송하고 소감을 나눠요!",
          "count": 24,
          "hint": "분위기를 살려 낭송하고, 들은 친구는 좋았던 점을 말해 줘요",
          "end_msg": "모두 멋지게 낭송했어요. 시로 여는 우리 반이 완성됐어요! 👏"
        },
        "suggested_extras": [
          "t_present13",
          "e_listen13"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "시로 여는 우리 반 ② (실천)",
          "levels": {
            "읽기": {
              "q": "친구들이 지은 시를 모아 분위기를 살려 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "가장 마음에 드는 친구의 시 한 줄을 옮겨 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "그 시가 왜 좋은지 짝에게 말해 봐요.",
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
          "title": "시 모음 만들기 짝 활동",
          "type": "pair",
          "goal": "우리 반 시를 모아요",
          "body": "짝과 각자 지은 시를 모아 시 모음을 만들고, 서로 분위기를 살려 낭송해 줘요.",
          "materials": [
            "종이",
            "색연필"
          ],
          "minutes": 8
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
              "q": "시 모음에는 무엇을 담나요?",
              "a": "친구들이 지은 시"
            },
            {
              "q": "시를 낭송할 때는?",
              "a": "분위기를 살려요"
            },
            {
              "q": "시로 여는 우리 반은?",
              "a": "함께 만들어요"
            }
          ],
          "self": [
            "시 모음을 만들고 낭송할 수 있어요",
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
            "분위기를 살려 시를 낭송했어요",
            "친구 낭송을 잘 들었어요",
            "낭송을 듣고 느낌을 나눴어요"
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
          "preview": "단원을 마무리해요",
          "body": "다음 시간에는 단원에서 배운 것을 스스로 돌아보고 정리해 볼 거예요!"
        },
        "suggested_extras": [
          "e_wrap13"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_ready13",
        "type": "fun_question",
        "icon": "💡",
        "title": "낭송 마음",
        "content": "\"시를 낭송하는 마음은 어떤가요?\" 발표를 편하게 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_listen13",
        "type": "tip",
        "icon": "🧩",
        "title": "듣기도 중요",
        "content": "낭송만큼 잘 듣는 태도도 중요함을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_hear13",
        "type": "fun_question",
        "icon": "🎉",
        "title": "친구의 시",
        "content": "\"친구는 어떤 시를 골랐을까요?\" 궁금증을 열어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_listen13",
        "type": "real_world",
        "icon": "🌍",
        "title": "발표 듣기",
        "content": "친구 발표를 잘 들어 좋았던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_listen13b",
        "type": "tip",
        "icon": "🧩",
        "title": "좋은 점 나누기",
        "content": "낭송 뒤 구체적인 좋은 점을 나누게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_listen13",
        "type": "misconception",
        "icon": "❓",
        "title": "딴짓 주의",
        "content": "친구가 낭송할 때 딴짓하지 말고 함께 느끼며 듣게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good13",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 듣기는?",
        "content": "\"좋은 듣기 태도는 무엇이죠?\" 자세·집중을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_listen13",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 태도 짝짓기",
        "description": "듣기 상황과 바른 태도를 짝지어 보세요.",
        "hint": "잘 듣는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "👂 낭송 중"
            },
            "b": {
              "text": "끝까지 듣기"
            }
          },
          {
            "a": {
              "text": "🎵 느낄 때"
            },
            "b": {
              "text": "함께 느끼기"
            }
          },
          {
            "a": {
              "text": "👏 끝난 뒤"
            },
            "b": {
              "text": "좋은 점 박수"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present13",
        "type": "tip",
        "icon": "🗣",
        "title": "따뜻한 소감",
        "content": "낭송 뒤 따뜻한 소감을 나누게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_listen13",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 시집",
        "content": "\"좋아하는 시를 모아 우리 반 시집을 만들어 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect13",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"낭송회에서 무엇을 했죠?\" 낭송·듣기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_wrap13",
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

  window.LESSONS["u4_l14"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 14,
      "title": "마무리하기 ① — 스스로 확인",
      "std": "[2국04-02] · [2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 겹받침·분위기 정리 → 확인 퀴즈 → 스스로 확인 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ① — 스스로 확인",
          "subtitle": "4단원 · 14/15차시 · 마무리"
        },
        "suggested_extras": [
          "q_back14",
          "t_wrap14"
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
            "겹받침·분위기를 정리해요",
            "배운 내용을 스스로 확인해요"
          ]
        },
        "suggested_extras": [
          "t_wrap14"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "4단원에서 무엇을 배웠나요? 🎀",
          "visual": "🎵",
          "question": "겹받침을 바르게 읽고 쓰고, 시를 분위기에 맞게 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?",
          "img": "assets/photo/korean/g2u4_review.jpg"
        },
        "suggested_extras": [
          "q_memory14",
          "r_back14"
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
              "q": "시 모음에는 무엇을 담나요?",
              "a": "친구들이 지은 시"
            },
            {
              "q": "시를 낭송할 때는?",
              "a": "분위기를 살려요"
            }
          ],
          "from": "u4_l13"
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
          "title": "겹받침·분위기 정리",
          "content": "이 단원에서 **겹받침**을 바르게 읽고 쓰는 법(ㄺ→[ㄱ]·ㄵ→[ㄴ]·ㄼ→[ㄹ])과 **시의 분위기**를 살려 읽는 법을 배웠어요. 쓸 땐 두 글자, 읽을 땐 분위기에 맞게!",
          "symbol_meanings": [
            {
              "symbol": "겹받침 읽기",
              "meaning": "한 소리로"
            },
            {
              "symbol": "겹받침 쓰기",
              "meaning": "두 글자 살려"
            },
            {
              "symbol": "분위기 느끼기",
              "meaning": "말·장면으로"
            },
            {
              "symbol": "분위기 살려 읽기",
              "meaning": "목소리 조절"
            }
          ]
        },
        "suggested_extras": [
          "t_method14",
          "x_forget14"
        ],
        "tnote": {
          "ask": [
            "이 단원에서 가장 도움이 된 것은 무엇일까?"
          ],
          "watch": "단원 자기점검",
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
              "clue": "\"값\"은 어떻게 읽을까요?",
              "emoji": "💰",
              "name": "[갑]"
            },
            {
              "clue": "\"앉다\"는 어떻게 쓸까요?",
              "emoji": "🪑",
              "name": "받침 'ㄵ' 두 글자를 살려서"
            },
            {
              "clue": "신나는 시는 어떻게 읽을까요?",
              "emoji": "🏃",
              "name": "밝고 빠르게"
            }
          ],
          "outro": "배운 것을 잘 기억하고 있어요. 바르고 재미있게 읽어 봐요! 😊"
        },
        "suggested_extras": [
          "q_check14",
          "g_wrap14"
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
            "겹받침 낱말을 바르게 읽고 쓸 수 있나요?",
            "시의 분위기를 느낄 수 있나요?",
            "분위기를 살려 읽을 수 있나요?"
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
          "title": "단원을 돌아보며 확인하기",
          "levels": {
            "읽기": {
              "q": "'겹받침은 소리에 주의하여 읽습니다'가 바른 문장인지 읽고 판단해 볼까요?",
              "a": "네, 바른 문장"
            },
            "쓰기": {
              "q": "이 단원에서 배운 것 한 가지를 문장으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "가장 기억에 남는 활동을 짝에게 말해 봐요.",
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
          "goal": "단원을 함께 정리해요",
          "body": "짝과 번갈아 이 단원에서 배운 것(겹받침·시 낭송)을 하나씩 말하며 정리해요.",
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
              "q": "겹받침은 어떻게 읽나요?",
              "a": "소리에 주의하여"
            },
            {
              "q": "시는 어떻게 읽나요?",
              "a": "분위기를 살려"
            },
            {
              "q": "'닭'은 어떻게 소리 나나요?",
              "a": "[닥]"
            }
          ],
          "self": [
            "배운 것을 스스로 확인할 수 있어요",
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
            "배운 것을 돌아봤어요",
            "겹받침·분위기를 정리했어요",
            "얼마나 할 수 있는지 확인했어요"
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
          "body": "다음 시간에는 겹받침을 한 번 더 다지고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"
        },
        "suggested_extras": [
          "e_basic14"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_back14",
        "type": "fun_question",
        "icon": "💡",
        "title": "돌아보기",
        "content": "\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_wrap14",
        "type": "tip",
        "icon": "🧩",
        "title": "두 결 정리",
        "content": "겹받침(지식)과 분위기(감상) 두 결을 함께 정리하게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_memory14",
        "type": "fun_question",
        "icon": "🎵",
        "title": "기억에 남는 활동",
        "content": "\"겹받침·시 낭송 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_back14",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 적용",
        "content": "책을 읽으며 겹받침을 바르게 읽은 경험을 떠올리게 해요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_method14",
        "type": "tip",
        "icon": "🧩",
        "title": "규칙 정리",
        "content": "ㄺ·ㄵ·ㄼ 소리를 표로 다시 정리하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_forget14",
        "type": "misconception",
        "icon": "❓",
        "title": "쓸 땐 두 글자",
        "content": "읽는 소리와 달리 쓸 땐 받침 두 글자를 살림을 다시 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_check14",
        "type": "fun_question",
        "icon": "💡",
        "title": "무엇을 배웠지?",
        "content": "\"이 단원에서 배운 것을 말해 볼까요?\" 배움을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_wrap14",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "항목 ↔ 내용 짝짓기",
        "description": "배운 항목과 내용을 짝지어 보세요.",
        "hint": "단원에서 배운 것을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🐔 겹받침 읽기"
            },
            "b": {
              "text": "한 소리로"
            }
          },
          {
            "a": {
              "text": "✍️ 겹받침 쓰기"
            },
            "b": {
              "text": "두 글자 살려"
            }
          },
          {
            "a": {
              "text": "🎵 분위기"
            },
            "b": {
              "text": "목소리 조절"
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
        "title": "자기 돌아보기",
        "content": "비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_pick14",
        "type": "extension",
        "icon": "⬆",
        "title": "다음 다짐",
        "content": "\"더 연습하고 싶은 한 가지를 정해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect14",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"무엇을 정리했죠?\" 겹받침·분위기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_basic14",
        "type": "extension",
        "icon": "⬆",
        "title": "기초 다지기 예고",
        "content": "\"다음엔 겹받침을 다지고 글씨를 써요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u4_l15"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 4,
      "n": 15,
      "title": "마무리하기 ② — 기초 다지기",
      "std": "[2국04-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 겹받침 다지기 → 바른 소리 → 겹받침 낱말 찾기 → 글씨 쓰기·단원 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ② — 기초 다지기",
          "subtitle": "4단원 · 15/15차시 · 마무리"
        },
        "suggested_extras": [
          "q_last",
          "t_last"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "겹받침을 한 번 더 다져요",
            "겹받침 낱말을 바르게 읽어요",
            "배운 낱말을 바르게 써요"
          ]
        },
        "suggested_extras": [
          "t_last"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "겹받침을 모두 모아 봐요 🗂️",
          "visual": "🔤",
          "question": "닭·값·흙·앉다·많다·넓다·짧다·여덟·몫…<br>겹받침 낱말을 바르게 읽을 수 있나요?",
          "img": "assets/photo/korean/g2u4_basic.jpg"
        },
        "suggested_extras": [
          "q_last2",
          "r_last"
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
              "q": "겹받침은 어떻게 읽나요?",
              "a": "소리에 주의하여"
            },
            {
              "q": "시는 어떻게 읽나요?",
              "a": "분위기를 살려"
            }
          ],
          "from": "u4_l14"
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
          "title": "겹받침 다지기",
          "content": "겹받침은 쓸 때 **두 글자**, 읽을 때 **한 소리**예요. **여덟→[여덜]**, **몫→[목]**처럼 새 낱말도 같은 규칙으로 읽어요. 쓸 때는 받침 두 글자를 꼭 살려요!",
          "symbol_meanings": [
            {
              "symbol": "여덟 → [여덜]",
              "meaning": "받침 ㄼ → [ㄹ]"
            },
            {
              "symbol": "몫 → [목]",
              "meaning": "받침 ㄳ → [ㄱ]"
            },
            {
              "symbol": "값 → [갑]",
              "meaning": "받침 ㅄ → [ㅂ]"
            },
            {
              "symbol": "쓸 땐 두 글자",
              "meaning": "받침을 살려요"
            }
          ]
        },
        "suggested_extras": [
          "t_last2",
          "x_last"
        ],
        "tnote": {
          "ask": [
            "어디에서 쉬어 읽어야 뜻이 잘 통할까?"
          ],
          "watch": "띄어 읽기·바른 마무리",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바르게 읽으면? 🔤",
          "sub": "겹받침 낱말을 어떻게 읽는지 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"여덟\"은?",
              "emoji": "8️⃣",
              "name": "[여덜]"
            },
            {
              "clue": "\"몫\"은?",
              "emoji": "🍰",
              "name": "[목]"
            },
            {
              "clue": "\"짧다\"는?",
              "emoji": "📏",
              "name": "[짤따]"
            }
          ],
          "outro": "겹받침을 바르게 읽을 수 있어요. 이제 글씨도 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_last3",
          "g_last"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "글씨를 바르게 써요 ✍️",
          "content": "단원에서 배운 낱말을 **또박또박** 써 봐요. 읽는 소리에 속지 말고 받침 두 글자를 살려요. **닭 · 넓다 · 여덟**을 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "닭",
              "meaning": "받침 ㄺ을 살려서"
            },
            {
              "symbol": "넓다",
              "meaning": "받침 ㄼ을 살려서"
            },
            {
              "symbol": "여덟",
              "meaning": "받침 ㄼ을 살려서"
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
          "title": "띄어 읽기로 마무리하기",
          "levels": {
            "읽기": {
              "q": "'나는 / 책을 읽었다'처럼 알맞게 띄어 읽어 볼까요?",
              "a": "나는 / 책을 읽었다"
            },
            "쓰기": {
              "q": "짧은 문장에 띄어 읽을 곳을 빗금(/)으로 표시해 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "띄어 읽기에 맞게 짝에게 문장을 읽어 봐요.",
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
          "title": "알맞게 띄어 읽기 짝 활동",
          "type": "pair",
          "goal": "알맞은 곳에서 쉬어 읽어요",
          "body": "짝과 같은 문장을 보고 어디에서 쉬면 좋을지 표시한 뒤, 번갈아 읽어 줘요.",
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
              "q": "문장은 어떻게 읽으면 뜻이 잘 전해지나요?",
              "a": "알맞게 띄어 읽어요"
            },
            {
              "q": "너무 붙여 읽으면?",
              "a": "뜻이 헷갈려요"
            },
            {
              "q": "띄어 읽기와 분위기를 함께 살리면?",
              "a": "더 잘 읽을 수 있어요"
            }
          ],
          "self": [
            "알맞게 띄어 읽을 수 있어요",
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
          "title": "4단원에서 배운 것",
          "points": [
            "겹받침을 바르게 읽고 썼어요",
            "시의 분위기를 살려 읽었어요",
            "겹받침을 다지고 글씨를 썼어요"
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
          "preview": "바르고 재미있게!",
          "body": "4단원을 모두 마쳤어요. 앞으로도 겹받침을 바르게 쓰고 시를 분위기에 맞게 읽어 봐요. 정말 수고했어요!"
        },
        "suggested_extras": [
          "e_end"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_last",
        "type": "fun_question",
        "icon": "💡",
        "title": "겹받침 자신감",
        "content": "\"이제 겹받침을 바르게 읽을 수 있나요?\" 다지기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_last",
        "type": "tip",
        "icon": "🧩",
        "title": "같은 규칙",
        "content": "새 낱말도 같은 규칙(소리≠표기)으로 읽고 씀을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_last2",
        "type": "fun_question",
        "icon": "🔤",
        "title": "바르게 읽기",
        "content": "\"이 겹받침 낱말을 바르게 읽어 볼까요?\" 함께 읽어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_last",
        "type": "real_world",
        "icon": "🌍",
        "title": "책 속 겹받침",
        "content": "책에서 겹받침 낱말을 찾아 읽어 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_last2",
        "type": "tip",
        "icon": "🧩",
        "title": "규칙 적용",
        "content": "배운 규칙을 새 낱말에도 적용해 보게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_last",
        "type": "misconception",
        "icon": "❓",
        "title": "소리대로 쓰지 않기",
        "content": "들리는 소리대로 쓰지 말고 받침 두 글자를 살려 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_last3",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떻게 읽지",
        "content": "\"이 낱말은 어떻게 읽죠?\" 바른 소리를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_last",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 소리 짝짓기",
        "description": "겹받침 낱말과 소리를 짝지어 보세요.",
        "hint": "규칙을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "8️⃣ 여덟"
            },
            "b": {
              "text": "[여덜]"
            }
          },
          {
            "a": {
              "text": "🍰 몫"
            },
            "b": {
              "text": "[목]"
            }
          },
          {
            "a": {
              "text": "📏 짧다"
            },
            "b": {
              "text": "[짤따]"
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
        "title": "두 글자 살려",
        "content": "네모 칸에 또박또박 쓰되 받침 두 글자를 빠뜨리지 않게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_more15",
        "type": "extension",
        "icon": "⬆",
        "title": "문장으로",
        "content": "\"겹받침 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect15",
        "type": "fun_question",
        "icon": "💡",
        "title": "단원 마무리",
        "content": "\"4단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_end",
        "type": "extension",
        "icon": "⬆",
        "title": "바르고 재미있게",
        "content": "\"오늘 읽은 시 중 하나를 집에서 가족에게 낭송해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

})();
