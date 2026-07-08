/* ============================================================================
   2학년 1학기 국어 2단원 「말의 재미가 솔솔」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u2_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 42~71 / 15차시.
   - 단원 목표: 말의 재미를 찾고 생각·느낌 나누기. 역량 공동체·대인관계(협동·협업).
   - 성취기준 [2국05-01](말놀이·말의 재미)·[2국02-05](즐겨 읽기)·[2국03-02](생각·느낌 문장 표현).
   ★ 저작권: 지도서 제재(「가랑비와 이슬비」·「사과는 빨개」·「어디까지 왔니」·「캬하, 시원하다!」·「내 친구 몬덕이」) 전부 미게재.
      말놀이 유형(꼬리따기·다섯 글자·주고받기·말 덧붙이기·끝말잇기)·비 이름 어휘·예시는 보편 자료 자체 구성.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 말놀이로 여는 말의 재미 ---------------- */
  window.LESSONS["u2_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 1,
      "title": "단원 도입 — 말의 재미가 솔솔",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 말로 노는 재미 → 첫 글자 같은 낱말 놀이 → 비로 시작하는 낱말 모으기 → 말놀이 떠올리기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "말의 재미가 솔솔",
          "subtitle": "2단원 · 1/15차시 · 단원 도입"
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
            "말로 노는 재미를 느껴 봐요",
            "첫 글자가 같은 낱말을 떠올려요",
            "'비'로 시작하는 낱말을 모아 봐요"
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
          "scene_title": "낱말로 놀 수 있어요 🎲",
          "visual": "🗣️",
          "question": "낱말을 가지고도 재미있게 놀 수 있어요.<br>'비'로 시작하는 낱말, 무엇이 떠오르나요?",
          "img": "assets/photo/korean/g2u2_word_play.jpg"
        },
        "suggested_extras": [
          "q_word",
          "r_play"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "말로 노는 재미",
          "content": "같은 **첫 글자**로 시작하는 낱말을 모으거나, 낱말을 **이어 가며** 놀 수 있어요. 규칙 안에서 낱말을 떠올리는 것이 바로 **말놀이의 재미**예요!",
          "symbol_meanings": [
            {
              "symbol": "비행기 ✈️",
              "meaning": "'비'로 시작해요"
            },
            {
              "symbol": "비누 🧼",
              "meaning": "'비'로 시작해요"
            },
            {
              "symbol": "비빔밥 🍚",
              "meaning": "'비'로 시작해요"
            },
            {
              "symbol": "또 무엇?",
              "meaning": "더 떠올려 봐요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_real"
        ],
        "tnote": {
          "ask": [
            "낱말로 어떻게 놀 수 있을까?"
          ],
          "watch": "말놀이에 대한 흥미 열기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "'비'로 시작하는 낱말은? 🤔",
          "sub": "'비'로 시작하는 낱말을 함께 찾아봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "하늘을 나는 탈것은?",
              "emoji": "✈️",
              "name": "비행기"
            },
            {
              "clue": "손을 씻을 때 쓰는 것은?",
              "emoji": "🧼",
              "name": "비누"
            },
            {
              "clue": "여러 재료를 섞어 먹는 밥은?",
              "emoji": "🍚",
              "name": "비빔밥"
            }
          ],
          "outro": "같은 글자로 시작하는 낱말이 이렇게 많아요. 말놀이가 재미있죠? 😊"
        },
        "suggested_extras": [
          "q_more",
          "g_first"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "말놀이를 떠올려요",
          "question": "알고 있는 말놀이가 있나요?",
          "items": [
            "끝말잇기를 해 본 적 있나요?",
            "어떤 말놀이가 재미있었나요?",
            "말놀이를 하면 무엇이 좋을까요?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "e_game"
        ]
      },
      {
        "id": "s100",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "첫 글자가 같은 낱말 놀이",
          "levels": {
            "읽기": {
              "q": "'비'로 시작하는 낱말 '비누·비행기'를 소리 내어 읽어 볼까요?",
              "a": "비누·비행기"
            },
            "쓰기": {
              "q": "'가'로 시작하는 낱말을 하나 떠올려 써 볼까요?",
              "a": "여러 답 (예: 가방·가위)",
              "open": true
            },
            "말하기": {
              "q": "내가 좋아하는 낱말을 하나 말하고 왜 좋은지 이야기해 봐요.",
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
          "title": "첫 글자 낱말 모으기 짝 놀이",
          "type": "pair",
          "goal": "같은 글자로 시작하는 낱말을 모아요",
          "body": "짝과 한 글자를 정해, 그 글자로 시작하는 낱말을 번갈아 말하며 모아요.",
          "materials": [
            "낱말 공책"
          ],
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
              "q": "낱말로 무엇을 할 수 있나요?",
              "a": "재미있게 놀 수 있어요"
            },
            {
              "q": "'비'로 시작하는 낱말은?",
              "a": "여러 개 (예: 비누)"
            },
            {
              "q": "말놀이를 하면 어떤 기분인가요?",
              "a": "즐거워요"
            }
          ],
          "self": [
            "말놀이가 재미있어요",
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
            "낱말로 노는 재미를 느꼈어요",
            "'비'로 시작하는 낱말을 모았어요",
            "여러 말놀이를 떠올렸어요"
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
          "preview": "재미있는 말놀이를 해요",
          "body": "다음 시간에는 다섯 글자 말놀이, 꼬리따기 같은 재미있는 말놀이를 직접 해 볼 거예요!"
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
        "title": "좋아하는 말",
        "content": "\"소리 내어 말하면 재미있는 낱말이 있나요?\" 말의 재미를 열어요.",
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
        "content": "이 단원은 '말놀이로 말의 재미 느끼기 + 책 읽고 느낌 나누기'예요. 도입에선 즐기는 분위기를 만들어 주세요.",
        "fit_slides": [
          "objective",
          "cover"
        ]
      },
      {
        "id": "q_word",
        "type": "fun_question",
        "icon": "🗣️",
        "title": "비로 시작",
        "content": "\"'비'로 시작하는 낱말을 빨리 떠올려 볼까요?\" 말놀이를 가볍게 시작해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_play",
        "type": "real_world",
        "icon": "🌍",
        "title": "놀이 경험",
        "content": "차 안·쉬는 시간에 끝말잇기를 해 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "규칙 안에서",
        "content": "말놀이는 규칙 안에서 낱말을 떠올리는 재미임을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_real",
        "type": "misconception",
        "icon": "❓",
        "title": "틀려도 괜찮아",
        "content": "낱말이 바로 안 떠올라도 괜찮아요. 즐기는 데 초점을 두게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_more",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 있을까",
        "content": "\"'비'로 시작하는 낱말이 또 있을까요?\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_first",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 뜻 짝짓기",
        "description": "'비'로 시작하는 낱말과 뜻을 짝지어 보세요.",
        "hint": "무엇인지 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "✈️ 비행기"
            },
            "b": {
              "text": "하늘 탈것"
            }
          },
          {
            "a": {
              "text": "🧼 비누"
            },
            "b": {
              "text": "씻는 것"
            }
          },
          {
            "a": {
              "text": "🍚 비빔밥"
            },
            "b": {
              "text": "섞은 밥"
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
        "title": "가볍게",
        "content": "아는 말놀이를 자유롭게 말하게 해 분위기를 살리세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_game",
        "type": "extension",
        "icon": "⬆",
        "title": "새 말놀이",
        "content": "\"우리만의 말놀이를 만들 수 있을까요?\" 상상을 열어요.",
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
        "content": "\"말놀이는 무엇이 재미있을까요?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "말놀이 예고",
        "content": "\"다음엔 다섯 글자·꼬리따기 말놀이를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 2,
      "title": "비의 이름으로 말놀이를 해요",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 비의 여러 이름 → 이름과 특징 잇기 → 비 이름↔특징 맞히기 → 비 이름 말놀이 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "비의 이름으로 말놀이를 해요",
          "subtitle": "2단원 · 2/15차시 · 준비"
        },
        "suggested_extras": [
          "q_rain",
          "t_name"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "비의 여러 이름을 알아봐요",
            "이름과 특징을 관련지어요",
            "비 이름으로 말놀이를 해요"
          ]
        },
        "suggested_extras": [
          "t_name"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "비에도 여러 이름이 있어요 🌧️",
          "visual": "🌧️",
          "question": "가늘게 내리는 비, 반갑게 내리는 비…<br>비에 여러 이름이 있다는 걸 알고 있었나요?",
          "img": "assets/photo/korean/g2u2_rain_names.jpg"
        },
        "suggested_extras": [
          "q_kind",
          "r_rain"
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
              "q": "낱말로 무엇을 할 수 있나요?",
              "a": "재미있게 놀 수 있어요"
            },
            {
              "q": "'비'로 시작하는 낱말은?",
              "a": "여러 개"
            }
          ],
          "from": "u2_l01"
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
          "title": "비의 여러 이름",
          "content": "비는 내리는 **모습**에 따라 이름이 달라요. 가늘게 내리면 **이슬비**, 더 가늘면 **가랑비**, 곡식에 좋게 내리면 **단비**, 갑자기 쏟아지면 **소나기**라고 해요!",
          "symbol_meanings": [
            {
              "symbol": "이슬비",
              "meaning": "아주 가늘게 내리는 비"
            },
            {
              "symbol": "가랑비",
              "meaning": "가늘게 내리는 비"
            },
            {
              "symbol": "단비",
              "meaning": "꼭 필요할 때 내리는 비"
            },
            {
              "symbol": "소나기",
              "meaning": "갑자기 쏟아지는 비"
            }
          ]
        },
        "suggested_extras": [
          "t_word2",
          "x_hard"
        ],
        "tnote": {
          "ask": [
            "비에 왜 여러 이름이 있을까?"
          ],
          "watch": "어휘의 다양함 느끼기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 비의 이름은? 🌧️",
          "sub": "비의 모습을 보고 이름을 맞혀 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "아주 가늘게 소리 없이 내려요.",
              "emoji": "🌫️",
              "name": "이슬비"
            },
            {
              "clue": "곡식이 잘 자라게 알맞게 내려요.",
              "emoji": "🌱",
              "name": "단비"
            },
            {
              "clue": "갑자기 굵게 쏟아지다 그쳐요.",
              "emoji": "⛈️",
              "name": "소나기"
            }
          ],
          "outro": "같은 비도 모습에 따라 이름이 달라요. 우리말이 참 재미있죠? 😊"
        },
        "suggested_extras": [
          "q_more2",
          "g_rain"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "비 이름으로 말놀이를 해요",
          "question": "비 이름으로 짧은 말을 만들어 볼까요?",
          "items": [
            "가장 마음에 드는 비 이름은?",
            "그 비가 내리면 무엇을 하고 싶나요?",
            "비 이름으로 짧은 말을 만들어 볼까요?"
          ]
        },
        "suggested_extras": [
          "t_present2",
          "e_more2"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "비의 여러 이름 놀이",
          "levels": {
            "읽기": {
              "q": "가늘게 내리는 비를 뜻하는 낱말 '가랑비'를 읽어 볼까요?",
              "a": "가랑비"
            },
            "쓰기": {
              "q": "내가 아는 비의 이름을 하나 써 볼까요?",
              "a": "여러 답 (예: 소나기·이슬비)",
              "open": true
            },
            "말하기": {
              "q": "비가 내릴 때 느낌을 낱말로 표현해 봐요.",
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
          "title": "비 이름 잇기 짝 활동",
          "type": "pair",
          "goal": "비의 여러 이름을 함께 떠올려요",
          "body": "짝과 번갈아 비의 이름을 하나씩 말하고, 어떤 비인지 설명해 줘요.",
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
              "q": "비에는 이름이 몇 가지인가요?",
              "a": "여러 가지"
            },
            {
              "q": "가늘게 내리는 비는?",
              "a": "가랑비 등"
            },
            {
              "q": "이름을 알면 무엇이 좋나요?",
              "a": "더 자세히 말할 수 있어요"
            }
          ],
          "self": [
            "비의 여러 이름을 알아요",
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
            "비의 여러 이름을 알았어요",
            "이름과 특징을 관련지었어요",
            "비 이름으로 말놀이를 했어요"
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
          "preview": "재미있는 말놀이를 해요",
          "body": "다음 시간에는 다섯 글자 말놀이와 꼬리따기 말놀이를 직접 해 볼 거예요!"
        },
        "suggested_extras": [
          "e_play2"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_rain",
        "type": "fun_question",
        "icon": "💡",
        "title": "비 오는 날",
        "content": "\"비 오는 날 가장 좋아하는 것은 무엇인가요?\" 비와 친해지게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_name",
        "type": "tip",
        "icon": "🧩",
        "title": "우리말의 재미",
        "content": "같은 대상도 모습에 따라 이름이 다른 우리말의 재미를 느끼게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_kind",
        "type": "fun_question",
        "icon": "🌧️",
        "title": "비의 이름",
        "content": "\"비의 이름을 몇 개나 알고 있나요?\" 어휘를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_rain",
        "type": "real_world",
        "icon": "🌍",
        "title": "날씨 이어 보기",
        "content": "오늘 날씨·계절의 비와 이어 비 이름을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_word2",
        "type": "tip",
        "icon": "🧩",
        "title": "모습과 이름",
        "content": "비 이름이 내리는 모습과 관련됨을 짚어 어휘를 이해하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_hard",
        "type": "misconception",
        "icon": "❓",
        "title": "외우기보다 느끼기",
        "content": "이름을 무조건 외우기보다 모습과 연결해 느끼게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_more2",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 비?",
        "content": "\"또 어떤 비 이름이 있을까요? (장대비·이슬비)\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_rain",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "비 이름 ↔ 특징 짝짓기",
        "description": "비 이름과 특징을 짝지어 보세요.",
        "hint": "내리는 모습을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🌫️ 이슬비"
            },
            "b": {
              "text": "아주 가늘게"
            }
          },
          {
            "a": {
              "text": "🌱 단비"
            },
            "b": {
              "text": "알맞게 내려요"
            }
          },
          {
            "a": {
              "text": "⛈️ 소나기"
            },
            "b": {
              "text": "갑자기 쏟아져요"
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
        "title": "짧게 만들기",
        "content": "비 이름으로 짧은 말·문장을 자유롭게 만들게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more2",
        "type": "extension",
        "icon": "⬆",
        "title": "다른 낱말도",
        "content": "\"눈·바람에도 여러 이름이 있을까요?\" 어휘를 확장해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect2",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"비 이름은 무엇에 따라 다르죠?\" 모습을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_play2",
        "type": "extension",
        "icon": "⬆",
        "title": "말놀이 예고",
        "content": "\"다음엔 다섯 글자·꼬리따기 말놀이를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 3,
      "title": "재미있는 말놀이를 해요 ①",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 다섯 글자 말놀이 → 꼬리따기 규칙 → 꼬리따기 잇기 → 짝과 말놀이 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "재미있는 말놀이를 해요",
          "subtitle": "2단원 · 3/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_play3",
          "t_rule3"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "다섯 글자 말놀이를 해요",
            "꼬리따기 말놀이 규칙을 알아봐요",
            "짝과 말놀이를 해요"
          ]
        },
        "suggested_extras": [
          "t_rule3"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "딱 다섯 글자로 말해요! ✋",
          "visual": "🖐️",
          "question": "\"안녕하세요\"는 다섯 글자예요.<br>다섯 글자로 된 말을 또 떠올릴 수 있나요?",
          "img": "assets/photo/korean/g2u2_tail_game.jpg"
        },
        "suggested_extras": [
          "q_five",
          "r_play3"
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
              "q": "비에는 이름이 몇 가지?",
              "a": "여러 가지"
            },
            {
              "q": "이름을 알면 무엇이 좋나요?",
              "a": "더 자세히 말할 수 있어요"
            }
          ],
          "from": "u2_l02"
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
          "title": "꼬리따기 말놀이",
          "content": "꼬리따기는 앞말의 **끝을 받아** 잇는 놀이예요. \"원숭이 **엉덩이**는 빨개 → **빨가**면 사과\"처럼 끝말을 이어 가요. 규칙을 지키며 이어 가는 것이 재미예요!",
          "symbol_meanings": [
            {
              "symbol": "원숭이 엉덩이는",
              "meaning": "빨개"
            },
            {
              "symbol": "빨가면",
              "meaning": "사과"
            },
            {
              "symbol": "사과는",
              "meaning": "맛있어"
            },
            {
              "symbol": "이어 가기",
              "meaning": "끝말을 받아 이어요"
            }
          ]
        },
        "suggested_extras": [
          "t_tail",
          "x_break"
        ],
        "tnote": {
          "ask": [
            "말놀이에는 어떤 규칙이 있을까?"
          ],
          "watch": "규칙 있는 말놀이 익히기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "꼬리따기로 이어 봐요 🔗",
          "sub": "앞말에 이어지는 말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"높은 것은 하늘 → 하늘은 ( )\"",
              "emoji": "💙",
              "name": "파래!"
            },
            {
              "clue": "\"파란 것은 바다 → 바다는 ( )\"",
              "emoji": "🌊",
              "name": "넓어!"
            },
            {
              "clue": "\"넓은 것은 운동장 → 운동장은 ( )\"",
              "emoji": "🏃",
              "name": "신나!"
            }
          ],
          "outro": "끝말을 받아 이어 가니 이야기가 절로 만들어져요. 짝과 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_next3",
          "g_tail"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "짝과 말놀이를 해요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 꼬리따기나 다섯 글자 말놀이를 짝과 해 봐요!",
          "count": 24,
          "hint": "앞 친구 말의 끝을 받아 이어 보거나, 다섯 글자 말을 만들어 봐요",
          "end_msg": "모두 즐겁게 말놀이를 했어요. 말의 재미가 솔솔! 👏"
        },
        "suggested_extras": [
          "t_present3",
          "e_play3"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "꼬리따기·다섯 글자 말놀이",
          "levels": {
            "읽기": {
              "q": "다섯 글자 말 '안녕하세요'를 또박또박 읽어 볼까요?",
              "a": "안녕하세요"
            },
            "쓰기": {
              "q": "다섯 글자로 된 말을 하나 만들어 써 볼까요?",
              "a": "여러 답 (예: 반갑습니다)",
              "open": true
            },
            "말하기": {
              "q": "꼬리따기로 '원숭이 엉덩이는…'처럼 이어 말해 봐요.",
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
          "title": "꼬리따기 잇기 짝 놀이",
          "type": "pair",
          "goal": "규칙대로 말을 이어요",
          "body": "짝과 꼬리따기 규칙으로 앞말의 끝을 받아 번갈아 이어 말해요.",
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
              "q": "다섯 글자 말놀이는 몇 글자로?",
              "a": "다섯 글자"
            },
            {
              "q": "꼬리따기는 무엇을 이어요?",
              "a": "앞말의 끝"
            },
            {
              "q": "말놀이에는 무엇이 있나요?",
              "a": "규칙"
            }
          ],
          "self": [
            "말놀이 규칙을 지킬 수 있어요",
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
            "다섯 글자 말놀이를 했어요",
            "꼬리따기 규칙을 알았어요",
            "짝과 즐겁게 말놀이를 했어요"
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
          "preview": "여러 말놀이를 더 해요",
          "body": "다음 시간에는 주고받는 말놀이, 말 덧붙이기 같은 또 다른 말놀이를 해 볼 거예요!"
        },
        "suggested_extras": [
          "e_play3b"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_play3",
        "type": "fun_question",
        "icon": "💡",
        "title": "아는 말놀이",
        "content": "\"꼬리따기를 해 본 적 있나요?\" 말놀이 흥미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_rule3",
        "type": "tip",
        "icon": "🧩",
        "title": "규칙 익히기",
        "content": "말놀이마다 규칙이 있음을 짚고, 규칙 안에서 즐기게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_five",
        "type": "fun_question",
        "icon": "🖐️",
        "title": "다섯 글자",
        "content": "\"다섯 글자로 된 말을 빨리 떠올려 볼까요?\" 말놀이를 가볍게 시작해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_play3",
        "type": "real_world",
        "icon": "🌍",
        "title": "노래 말놀이",
        "content": "꼬리따기 노래를 흥얼거려 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_tail",
        "type": "tip",
        "icon": "🧩",
        "title": "끝말 받기",
        "content": "앞말의 끝을 받아 잇는 규칙을 함께 연습하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_break",
        "type": "misconception",
        "icon": "❓",
        "title": "막혀도 괜찮아",
        "content": "이어 갈 말이 막혀도 괜찮아요. 함께 도와 가며 즐기게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_next3",
        "type": "fun_question",
        "icon": "💡",
        "title": "다음 말은?",
        "content": "\"이 다음에 어떤 말을 이으면 좋을까요?\" 함께 떠올려요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_tail",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "앞말 ↔ 이은 말 짝짓기",
        "description": "앞말과 이어지는 말을 짝지어 보세요.",
        "hint": "끝말을 받아요.",
        "pairs": [
          {
            "a": {
              "text": "하늘은"
            },
            "b": {
              "text": "파래"
            }
          },
          {
            "a": {
              "text": "바다는"
            },
            "b": {
              "text": "넓어"
            }
          },
          {
            "a": {
              "text": "운동장은"
            },
            "b": {
              "text": "신나"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present3",
        "type": "tip",
        "icon": "🗣",
        "title": "함께 이어 가기",
        "content": "막히면 친구가 도와 이어 가게 해 협력의 재미를 느끼게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_play3",
        "type": "extension",
        "icon": "⬆",
        "title": "주제 정하기",
        "content": "\"동물·음식으로 꼬리따기를 해 볼까요?\" 주제를 정해 놀아요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect3",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"꼬리따기는 어떻게 이어 가죠?\" 규칙을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_play3b",
        "type": "extension",
        "icon": "⬆",
        "title": "말놀이 예고",
        "content": "\"다음엔 주고받는 말놀이를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 4,
      "title": "재미있는 말놀이를 해요 ②",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 주고받는 말놀이 → 말 덧붙이기 규칙 → 묻고 답하기 잇기 → 모둠 말놀이 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "재미있는 말놀이를 해요",
          "subtitle": "2단원 · 4/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall4",
          "t_add4"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "주고받는 말놀이를 해요",
            "말 덧붙이기 말놀이를 알아봐요",
            "모둠이 함께 말놀이를 해요"
          ]
        },
        "suggested_extras": [
          "t_add4"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "묻고 답하며 놀아요 💬",
          "visual": "🗨️",
          "question": "\"무엇이 무엇이 똑같을까?\" 하고 물으면<br>\"○○하고 ○○이 똑같지\" 하고 답해요. 어떤 말놀이일까요?",
          "img": "assets/photo/korean/g2u2_call_response.jpg"
        },
        "suggested_extras": [
          "q_ask4",
          "r_play4"
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
              "q": "다섯 글자 말놀이는 몇 글자?",
              "a": "다섯 글자"
            },
            {
              "q": "꼬리따기는 무엇을 이어요?",
              "a": "앞말의 끝"
            }
          ],
          "from": "u2_l03"
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
          "title": "주고받기·말 덧붙이기",
          "content": "**주고받는 말놀이**는 한 사람이 묻고 다른 사람이 답해요. **말 덧붙이기**는 앞사람 말에 한 가지씩 **더해** 가는 놀이예요. \"시장에 가면 사과도 있고, 바나나도 있고…\"처럼요!",
          "symbol_meanings": [
            {
              "symbol": "묻기",
              "meaning": "\"무엇이 똑같을까?\""
            },
            {
              "symbol": "답하기",
              "meaning": "\"○○하고 ○○이 똑같지\""
            },
            {
              "symbol": "덧붙이기",
              "meaning": "앞말에 하나씩 더해요"
            },
            {
              "symbol": "기억하기",
              "meaning": "앞말을 모두 기억해요"
            }
          ]
        },
        "suggested_extras": [
          "t_add4b",
          "x_miss"
        ],
        "tnote": {
          "ask": [
            "주고받는 말놀이는 왜 재미있을까?"
          ],
          "watch": "문답·누적형 말놀이",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "주고받는 말, 알맞은 답은? 💬",
          "sub": "묻는 말에 알맞은 답을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"무엇이 무엇이 똑같을까?\"",
              "emoji": "👀",
              "name": "\"눈하고 눈하고 똑같지\""
            },
            {
              "clue": "\"시장에 가면 무엇이 있을까?\"",
              "emoji": "🍎",
              "name": "\"사과도 있고, 바나나도 있고…\""
            },
            {
              "clue": "\"여름에는 무엇이 있을까?\"",
              "emoji": "🍉",
              "name": "\"수박도 있고, 매미도 있고…\""
            }
          ],
          "outro": "묻고 답하고, 하나씩 더해 가니 점점 재미있어져요. 모둠이 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_more4",
          "g_ask4"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "모둠이 말 덧붙이기를 해요 🎤",
          "sub": "버튼을 눌러 시작할 친구를 뽑아요. \"시장에 가면 ~도 있고\"로 모둠이 이어 가 봐요!",
          "count": 24,
          "hint": "앞 친구가 말한 것을 모두 말한 뒤, 새 낱말을 하나 더해 봐요",
          "end_msg": "앞말을 모두 기억하며 멋지게 이어 갔어요! 👏"
        },
        "suggested_extras": [
          "t_present4",
          "e_play4"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "주고받기·말 덧붙이기",
          "levels": {
            "읽기": {
              "q": "'무엇이 무엇이 똑같을까?'라는 물음에 어떻게 답할까요?",
              "a": "'○○하고 ○○이 똑같지'처럼 답해요"
            },
            "쓰기": {
              "q": "'시장에 가면 ○○도 있고'처럼 덧붙일 말을 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "짝과 묻고 답하며 주고받는 말놀이를 해 봐요.",
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
          "title": "말 덧붙이기 짝 놀이",
          "type": "pair",
          "goal": "앞말에 덧붙여 이어요",
          "body": "짝과 '시장에 가면…'처럼 앞사람 말을 그대로 말한 뒤 하나씩 덧붙여요.",
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
              "q": "주고받는 말놀이는 어떻게 하나요?",
              "a": "묻고 답해요"
            },
            {
              "q": "말 덧붙이기는 무엇을 하나요?",
              "a": "앞말에 이어 덧붙여요"
            },
            {
              "q": "함께 하면 무엇이 좋나요?",
              "a": "더 재미있어요"
            }
          ],
          "self": [
            "주고받기·덧붙이기를 할 수 있어요",
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
            "주고받는 말놀이를 했어요",
            "말 덧붙이기 규칙을 알았어요",
            "모둠이 함께 말놀이를 했어요"
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
          "preview": "말놀이 규칙을 정리해요",
          "body": "다음 시간에는 여러 말놀이의 규칙과 좋은 점을 정리해 볼 거예요!"
        },
        "suggested_extras": [
          "e_rule4"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall4",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 놀이",
        "content": "\"지난 시간에 한 꼬리따기, 재미있었나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_add4",
        "type": "tip",
        "icon": "🧩",
        "title": "기억의 재미",
        "content": "말 덧붙이기는 앞말을 기억하는 재미가 있음을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_ask4",
        "type": "fun_question",
        "icon": "🗨️",
        "title": "묻고 답하기",
        "content": "\"무엇이 똑같을까? 하고 물으면 뭐라고 답할까요?\" 주고받기를 열어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_play4",
        "type": "real_world",
        "icon": "🌍",
        "title": "노래 말놀이",
        "content": "\"무엇이 무엇이\" 노래를 불러 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_add4b",
        "type": "tip",
        "icon": "🧩",
        "title": "하나씩 더하기",
        "content": "앞말을 모두 말한 뒤 새 낱말을 하나 더하는 규칙을 익히게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_miss",
        "type": "misconception",
        "icon": "❓",
        "title": "빠뜨려도 괜찮아",
        "content": "앞말을 빠뜨려도 친구가 도와주게 해 즐겁게 이어 가게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_more4",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 무엇이?",
        "content": "\"또 무엇을 더할 수 있을까요?\" 함께 떠올려요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_ask4",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "묻기 ↔ 답하기 짝짓기",
        "description": "묻는 말과 답하는 말을 짝지어 보세요.",
        "hint": "어울리는 답을 골라요.",
        "pairs": [
          {
            "a": {
              "text": "무엇이 똑같을까?"
            },
            "b": {
              "text": "눈하고 눈하고"
            }
          },
          {
            "a": {
              "text": "시장에 가면?"
            },
            "b": {
              "text": "사과도 있고"
            }
          },
          {
            "a": {
              "text": "여름에는?"
            },
            "b": {
              "text": "수박도 있고"
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
        "title": "차례 지켜",
        "content": "말차례를 지켜 한 사람씩 이어 가게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_play4",
        "type": "extension",
        "icon": "⬆",
        "title": "주제 바꾸기",
        "content": "\"바다에 가면·소풍 가면으로 바꿔 볼까요?\" 주제를 바꿔 놀아요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect4",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"말 덧붙이기는 무엇을 기억해야 하죠?\" 규칙을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_rule4",
        "type": "extension",
        "icon": "⬆",
        "title": "규칙 정리 예고",
        "content": "\"다음엔 말놀이 규칙과 좋은 점을 정리해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 5,
      "title": "재미있는 말놀이를 해요 ③",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 말놀이 좋은 점 → 규칙 지키기 → 규칙 지킨 것 고르기 → 좋아하는 말놀이 소개 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "재미있는 말놀이를 해요",
          "subtitle": "2단원 · 5/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_good5",
          "t_rule5"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "말놀이의 좋은 점을 알아봐요",
            "말놀이 규칙을 정리해요",
            "좋아하는 말놀이를 소개해요"
          ]
        },
        "suggested_extras": [
          "t_rule5"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "말놀이는 왜 재미있을까? 😄",
          "visual": "🎉",
          "question": "여러 말놀이를 해 봤어요.<br>말놀이를 하면 무엇이 좋을까요?",
          "img": "assets/photo/korean/g2u2_why_fun.jpg"
        },
        "suggested_extras": [
          "q_why5",
          "r_play5"
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
              "q": "주고받는 말놀이는?",
              "a": "묻고 답해요"
            },
            {
              "q": "말 덧붙이기는?",
              "a": "앞말에 이어 덧붙여요"
            }
          ],
          "from": "u2_l04"
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
          "title": "말놀이의 좋은 점·규칙",
          "content": "말놀이를 하면 **낱말을 많이 알게** 되고, 친구와 함께해서 **즐거워요**. 말놀이마다 **규칙**이 있어요. 규칙을 지키고 친구 차례를 기다리면 모두 즐겁게 놀 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "낱말 익히기",
              "meaning": "새 낱말을 많이 알아요"
            },
            {
              "symbol": "함께하기",
              "meaning": "친구와 즐거워요"
            },
            {
              "symbol": "규칙 지키기",
              "meaning": "놀이가 잘 돼요"
            },
            {
              "symbol": "차례 기다리기",
              "meaning": "모두 참여해요"
            }
          ]
        },
        "suggested_extras": [
          "t_good5",
          "x_win5"
        ],
        "tnote": {
          "ask": [
            "말놀이를 즐겁게 하려면 무엇이 필요할까?"
          ],
          "watch": "규칙·태도 정리",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "규칙을 지킨 모습은? ✅",
          "sub": "말놀이에서 규칙을 지킨 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "꼬리따기를 할 때는?",
              "emoji": "🔗",
              "name": "앞말의 끝을 받아 이어요"
            },
            {
              "clue": "내 차례가 아닐 때는?",
              "emoji": "🙋",
              "name": "친구 차례를 기다려요"
            },
            {
              "clue": "친구가 막혔을 때는?",
              "emoji": "🤝",
              "name": "비웃지 않고 도와줘요"
            }
          ],
          "outro": "규칙을 지키고 서로 도우면 말놀이가 더 즐거워요. 좋아하는 말놀이를 소개해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good5b",
          "g_rule5"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "좋아하는 말놀이를 소개해요",
          "question": "가장 좋아하는 말놀이는 무엇인가요?",
          "items": [
            "어떤 말놀이가 가장 재미있었나요?",
            "왜 그 말놀이가 좋은가요?",
            "그 말놀이의 규칙은 무엇인가요?"
          ]
        },
        "suggested_extras": [
          "t_present5",
          "e_play5"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "말놀이 좋은 점과 규칙",
          "levels": {
            "읽기": {
              "q": "'차례를 지켜 말놀이를 합니다.'는 바른 모습인가요?",
              "a": "네, 바른 모습"
            },
            "쓰기": {
              "q": "말놀이를 할 때 지킬 규칙 한 가지를 써 볼까요?",
              "a": "여러 답 (예: 순서를 지켜요)",
              "open": true
            },
            "말하기": {
              "q": "내가 좋아하는 말놀이를 하나 소개해 봐요.",
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
          "title": "좋아하는 말놀이 소개 짝 활동",
          "type": "pair",
          "goal": "말놀이를 소개해요",
          "body": "짝에게 좋아하는 말놀이와 그 재미를 소개하고, 서로 한 판씩 해 봐요.",
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
              "q": "말놀이를 하면 무엇이 좋나요?",
              "a": "재미있고 낱말도 알아요"
            },
            {
              "q": "말놀이에 필요한 것은?",
              "a": "규칙"
            },
            {
              "q": "규칙을 지키면?",
              "a": "모두 즐거워요"
            }
          ],
          "self": [
            "말놀이의 좋은 점을 알아요",
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
            "말놀이의 좋은 점을 알았어요",
            "말놀이 규칙을 정리했어요",
            "좋아하는 말놀이를 소개했어요"
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
          "preview": "낱말로 이야기를 만들어요",
          "body": "다음 시간에는 주변에서 여러 낱말을 찾아 짧은 이야기를 만들어 볼 거예요!"
        },
        "suggested_extras": [
          "e_story5"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_good5",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 재미있던",
        "content": "\"지금까지 한 말놀이 중 무엇이 가장 재미있었나요?\" 경험을 떠올려요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_rule5",
        "type": "tip",
        "icon": "🧩",
        "title": "규칙과 즐거움",
        "content": "규칙을 지킬 때 놀이가 더 즐거워짐을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_why5",
        "type": "fun_question",
        "icon": "🎉",
        "title": "왜 재미있을까",
        "content": "\"말놀이를 하면 무엇이 좋을까요?\" 좋은 점을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_play5",
        "type": "real_world",
        "icon": "🌍",
        "title": "놀이의 즐거움",
        "content": "친구와 놀이하며 즐거웠던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_good5",
        "type": "tip",
        "icon": "🧩",
        "title": "배움과 즐거움",
        "content": "말놀이가 낱말 익히기와 즐거움을 함께 줌을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_win5",
        "type": "misconception",
        "icon": "❓",
        "title": "이기기보다 즐기기",
        "content": "승부보다 함께 즐기는 데 초점을 두게 하세요. 막힌 친구를 비웃지 않게 약속해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good5b",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"규칙을 지킨 모습은 무엇이죠?\" 규칙·기다리기를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_rule5",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "말놀이 상황과 바른 모습을 짝지어 보세요.",
        "hint": "함께 즐기는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🔗 꼬리따기"
            },
            "b": {
              "text": "끝말 받기"
            }
          },
          {
            "a": {
              "text": "🙋 내 차례 아님"
            },
            "b": {
              "text": "기다리기"
            }
          },
          {
            "a": {
              "text": "🤝 막힌 친구"
            },
            "b": {
              "text": "도와주기"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present5",
        "type": "tip",
        "icon": "🗣",
        "title": "까닭과 함께",
        "content": "좋아하는 말놀이를 까닭과 함께 소개하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_play5",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 말놀이",
        "content": "\"우리 반이 가장 좋아하는 말놀이를 뽑아 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect5",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"말놀이의 좋은 점은 무엇이죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_story5",
        "type": "extension",
        "icon": "⬆",
        "title": "이야기 만들기 예고",
        "content": "\"다음엔 낱말로 이야기를 만들어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 6,
      "title": "낱말을 찾아 이야기를 만들어요 ①",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 주변 낱말 찾기 → 낱말로 문장 만들기 → 어울리는 문장 고르기 → 문장 만들어 말하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "낱말을 찾아 이야기를 만들어요",
          "subtitle": "2단원 · 6/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_find6",
          "t_make6"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "주변에서 여러 낱말을 찾아요",
            "낱말로 문장을 만들어요",
            "만든 문장을 친구와 나눠요"
          ]
        },
        "suggested_extras": [
          "t_make6"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "교실에 낱말이 가득해요 🔍",
          "visual": "🔎",
          "question": "우리 교실을 둘러보면 어떤 낱말이 보이나요?<br>그 낱말로 문장을 만들 수 있을까요?",
          "img": "assets/photo/korean/g2u2_find_words.jpg"
        },
        "suggested_extras": [
          "q_word6",
          "r_find6"
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
              "q": "말놀이를 하면 무엇이 좋나요?",
              "a": "재미있고 낱말도 알아요"
            },
            {
              "q": "말놀이에 필요한 것은?",
              "a": "규칙"
            }
          ],
          "from": "u2_l05"
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
          "title": "낱말로 문장 만들기",
          "content": "주변에서 찾은 낱말에 **'무엇이 어찌하다'**를 더하면 문장이 돼요. \"칠판\"에 \"칠판이 깨끗하다\"처럼요. 낱말을 여러 개 이으면 **짧은 이야기**도 만들 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "낱말 찾기",
              "meaning": "칠판·창문·연필…"
            },
            {
              "symbol": "문장 만들기",
              "meaning": "\"칠판이 깨끗하다\""
            },
            {
              "symbol": "이어 가기",
              "meaning": "문장을 이어 이야기로"
            },
            {
              "symbol": "자유롭게",
              "meaning": "마음껏 상상해요"
            }
          ]
        },
        "suggested_extras": [
          "t_make6b",
          "x_word6"
        ],
        "tnote": {
          "ask": [
            "주변에서 어떤 낱말을 찾을 수 있을까?"
          ],
          "watch": "낱말→문장 확장",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "낱말로 만든 문장은? ✍️",
          "sub": "낱말로 만든 알맞은 문장을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"창문\"으로 문장을 만들면?",
              "emoji": "🪟",
              "name": "\"창문으로 햇빛이 들어와요.\""
            },
            {
              "clue": "\"연필\"로 문장을 만들면?",
              "emoji": "✏️",
              "name": "\"연필로 글씨를 써요.\""
            },
            {
              "clue": "\"친구\"로 문장을 만들면?",
              "emoji": "👫",
              "name": "\"친구와 함께 놀아요.\""
            }
          ],
          "outro": "낱말에 생각을 더하면 문장이 돼요. 나만의 문장을 만들어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_make6c",
          "g_make6"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "문장을 만들어 나눠요",
          "question": "주변 낱말로 문장을 만들어 볼까요?",
          "items": [
            "어떤 낱말을 찾았나요?",
            "그 낱말로 어떤 문장을 만들었나요?",
            "문장을 이어 짧은 이야기를 만들 수 있나요?"
          ]
        },
        "suggested_extras": [
          "t_present6",
          "e_story6"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "낱말을 찾아 문장 만들기",
          "levels": {
            "읽기": {
              "q": "'창문'이라는 낱말이 든 문장을 읽어 볼까요?",
              "a": "예: 창문을 열었습니다"
            },
            "쓰기": {
              "q": "교실에서 찾은 낱말로 짧은 문장을 만들어 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "내가 만든 문장을 짝에게 말해 봐요.",
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
          "title": "낱말 찾아 문장 짝 활동",
          "type": "pair",
          "goal": "주변 낱말로 문장을 만들어요",
          "body": "짝과 교실을 둘러보며 낱말을 하나씩 찾아, 그 낱말로 문장을 만들어 말해요.",
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
              "q": "문장은 무엇으로 만드나요?",
              "a": "낱말"
            },
            {
              "q": "낱말은 어디에서 찾을까요?",
              "a": "주변 곳곳"
            },
            {
              "q": "문장을 만들면 무엇이 좋나요?",
              "a": "생각을 전할 수 있어요"
            }
          ],
          "self": [
            "낱말로 문장을 만들 수 있어요",
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
            "주변에서 낱말을 찾았어요",
            "낱말로 문장을 만들었어요",
            "문장을 친구와 나눴어요"
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
          "preview": "줄줄이 이야기를 만들어요",
          "body": "다음 시간에는 모둠이 문장을 이어 줄줄이 이야기를 만들어 볼 거예요!"
        },
        "suggested_extras": [
          "e_story6b"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_find6",
        "type": "fun_question",
        "icon": "💡",
        "title": "보이는 낱말",
        "content": "\"지금 눈에 보이는 낱말을 하나 말해 볼까요?\" 낱말 찾기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_make6",
        "type": "tip",
        "icon": "🧩",
        "title": "낱말→문장",
        "content": "낱말에 '무엇이 어찌하다'를 더해 문장으로 만들게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_word6",
        "type": "fun_question",
        "icon": "🔎",
        "title": "교실 낱말",
        "content": "\"교실에서 가장 많이 보이는 낱말은?\" 낱말을 찾게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_find6",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 둘레",
        "content": "집·운동장 등 주변에서 낱말을 찾아본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_make6b",
        "type": "tip",
        "icon": "🧩",
        "title": "이어 이야기로",
        "content": "문장을 여러 개 이으면 짧은 이야기가 됨을 보여 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_word6",
        "type": "misconception",
        "icon": "❓",
        "title": "낱말만으론 부족",
        "content": "낱말만 나열하지 말고 문장으로 만들게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_make6c",
        "type": "fun_question",
        "icon": "💡",
        "title": "나만의 문장",
        "content": "\"이 낱말로 또 어떤 문장을 만들 수 있을까요?\" 문장을 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_make6",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 문장 짝짓기",
        "description": "낱말과 어울리는 문장을 짝지어 보세요.",
        "hint": "낱말이 들어간 문장을 찾아요.",
        "pairs": [
          {
            "a": {
              "text": "🪟 창문"
            },
            "b": {
              "text": "햇빛이 들어와요"
            }
          },
          {
            "a": {
              "text": "✏️ 연필"
            },
            "b": {
              "text": "글씨를 써요"
            }
          },
          {
            "a": {
              "text": "👫 친구"
            },
            "b": {
              "text": "함께 놀아요"
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
        "title": "자유롭게",
        "content": "문법을 따지기보다 자유롭게 문장을 만들게 해 표현을 즐기게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_story6",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 보기",
        "content": "\"두 문장을 이으면 어떤 이야기가 될까요?\" 이야기로 확장해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect6",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"낱말로 무엇을 만들었죠?\" 문장 만들기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_story6b",
        "type": "extension",
        "icon": "⬆",
        "title": "줄줄이 예고",
        "content": "\"다음엔 모둠이 이야기를 이어 만들어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 7,
      "title": "낱말을 찾아 이야기를 만들어요 ②",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 줄줄이 이야기 → 이어 만드는 방법 → 어울리는 이음 고르기 → 모둠 줄줄이 이야기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "낱말을 찾아 이야기를 만들어요",
          "subtitle": "2단원 · 7/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall7",
          "t_relay7"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "줄줄이 이야기 만드는 법을 알아봐요",
            "친구 문장에 이어 만들어요",
            "모둠이 함께 이야기를 완성해요"
          ]
        },
        "suggested_extras": [
          "t_relay7"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "한 문장씩 이어 이야기를! 🔗",
          "visual": "📖",
          "question": "한 사람이 한 문장씩 이어 가면 긴 이야기가 만들어져요.<br>어떻게 이으면 자연스러울까요?",
          "img": "assets/photo/korean/g2u2_chain_story.jpg"
        },
        "suggested_extras": [
          "q_relay7",
          "r_relay7"
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
              "q": "문장은 무엇으로 만드나요?",
              "a": "낱말"
            },
            {
              "q": "문장을 만들면 무엇이 좋나요?",
              "a": "생각을 전할 수 있어요"
            }
          ],
          "from": "u2_l06"
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
          "title": "줄줄이 이야기 만들기",
          "content": "줄줄이 이야기는 앞사람 문장에 **자연스럽게 이어** 한 문장씩 더해요. 앞 내용을 **잘 듣고**, 흐름에 맞게 이으면 모두 함께 만든 **재미있는 이야기**가 완성돼요!",
          "symbol_meanings": [
            {
              "symbol": "앞 문장 듣기",
              "meaning": "잘 들어요"
            },
            {
              "symbol": "자연스럽게",
              "meaning": "흐름에 맞게 이어요"
            },
            {
              "symbol": "한 문장씩",
              "meaning": "차례대로 더해요"
            },
            {
              "symbol": "함께 완성",
              "meaning": "모두의 이야기"
            }
          ]
        },
        "suggested_extras": [
          "t_relay7b",
          "x_jump7"
        ],
        "tnote": {
          "ask": [
            "문장을 자연스럽게 이으려면?"
          ],
          "watch": "문장 이어 쓰기·협동",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "자연스럽게 이은 문장은? ✅",
          "sub": "앞 문장에 자연스럽게 이어지는 문장을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"토끼가 숲으로 갔어요.\" 다음은?",
              "emoji": "🐰",
              "name": "\"그곳에서 다람쥐를 만났어요.\""
            },
            {
              "clue": "\"다람쥐와 친구가 됐어요.\" 다음은?",
              "emoji": "🐿️",
              "name": "\"둘은 함께 도토리를 주웠어요.\""
            },
            {
              "clue": "이렇게 이으면 어색해요!",
              "emoji": "🙅",
              "name": "갑자기 \"비행기가 날아갔어요.\""
            }
          ],
          "outro": "앞 내용을 잘 듣고 자연스럽게 이으면 멋진 이야기가 돼요. 모둠이 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_next7",
          "g_relay7"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "모둠 줄줄이 이야기 🎤",
          "sub": "버튼을 눌러 시작할 친구를 뽑아요. 한 문장씩 이어 모둠 이야기를 만들어 봐요!",
          "count": 24,
          "hint": "앞 친구 문장을 듣고, 자연스럽게 이어지는 한 문장을 더해 봐요",
          "end_msg": "모두 함께 멋진 이야기를 완성했어요! 👏"
        },
        "suggested_extras": [
          "t_present7",
          "e_relay7"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "줄줄이 이어 이야기 만들기",
          "levels": {
            "읽기": {
              "q": "'그래서·그리고' 같은 이음말은 문장을 어떻게 잇나요?",
              "a": "자연스럽게 이어요"
            },
            "쓰기": {
              "q": "앞 문장에 이어질 한 문장을 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "짝과 한 문장씩 이어 짧은 이야기를 만들어 봐요.",
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
          "title": "줄줄이 이야기 짝 놀이",
          "type": "pair",
          "goal": "한 문장씩 이어 이야기를 만들어요",
          "body": "짝과 번갈아 한 문장씩 이어 짧은 이야기를 완성하고 읽어 줘요.",
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
              "q": "줄줄이 이야기는 어떻게 만드나요?",
              "a": "한 문장씩 이어요"
            },
            {
              "q": "문장을 이을 때 쓰는 말은?",
              "a": "이음말"
            },
            {
              "q": "이어 만들면 무엇이 되나요?",
              "a": "긴 이야기"
            }
          ],
          "self": [
            "이어서 이야기를 만들 수 있어요",
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
            "줄줄이 이야기 만드는 법을 알았어요",
            "친구 문장에 자연스럽게 이었어요",
            "모둠이 함께 이야기를 완성했어요"
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
          "preview": "글을 읽고 느낌을 나눠요",
          "body": "다음 시간에는 글을 읽고 재미있는 부분을 찾아 생각·느낌을 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_read7"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall7",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 문장",
        "content": "\"지난 시간에 만든 문장이 기억나나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_relay7",
        "type": "tip",
        "icon": "🧩",
        "title": "협력의 재미",
        "content": "줄줄이 이야기는 함께 만드는 협력의 재미가 있음을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_relay7",
        "type": "fun_question",
        "icon": "📖",
        "title": "이어 만들기",
        "content": "\"앞 문장에 어떻게 이으면 자연스러울까요?\" 이음을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_relay7",
        "type": "real_world",
        "icon": "🌍",
        "title": "이야기 잇기",
        "content": "가족과 번갈아 이야기를 이어 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_relay7b",
        "type": "tip",
        "icon": "🧩",
        "title": "잘 듣고 잇기",
        "content": "앞 내용을 잘 들어야 자연스럽게 이을 수 있음을 강조하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_jump7",
        "type": "misconception",
        "icon": "❓",
        "title": "갑자기 바꾸지 않기",
        "content": "흐름과 동떨어진 내용으로 갑자기 바꾸지 않게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_next7",
        "type": "fun_question",
        "icon": "💡",
        "title": "다음 문장은?",
        "content": "\"이 다음엔 어떤 일이 일어날까요?\" 상상을 이어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_relay7",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "앞 문장 ↔ 이은 문장 짝짓기",
        "description": "앞 문장과 자연스럽게 이어지는 문장을 짝지어 보세요.",
        "hint": "흐름에 맞는 문장을 골라요.",
        "pairs": [
          {
            "a": {
              "text": "🐰 숲으로 갔어요"
            },
            "b": {
              "text": "다람쥐를 만났어요"
            }
          },
          {
            "a": {
              "text": "🐿️ 친구가 됐어요"
            },
            "b": {
              "text": "도토리를 주웠어요"
            }
          },
          {
            "a": {
              "text": "🌰 도토리를 모았어요"
            },
            "b": {
              "text": "집으로 돌아갔어요"
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
        "title": "차례 지켜",
        "content": "말차례를 지켜 한 문장씩 이어 가게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_relay7",
        "type": "extension",
        "icon": "⬆",
        "title": "제목 짓기",
        "content": "\"완성한 이야기에 제목을 붙여 볼까요?\" 이야기를 마무리해요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect7",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"줄줄이 이야기는 어떻게 잇죠?\" 잘 듣고 잇기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read7",
        "type": "extension",
        "icon": "⬆",
        "title": "글 읽기 예고",
        "content": "\"다음엔 글을 읽고 느낌을 나눠요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 8,
      "title": "글을 읽고 생각·느낌을 표현해요 ①",
      "std": "[2국02-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 즐겨 읽기 → 재미있는 부분 찾기 → 재미있는 문장 고르기 → 생각·느낌 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글을 읽고 생각·느낌을 표현해요",
          "subtitle": "2단원 · 8/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_read8",
          "t_enjoy8"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "글을 즐겁게 읽어요",
            "재미있는 부분을 찾아요",
            "생각·느낌을 표현해요"
          ]
        },
        "suggested_extras": [
          "t_enjoy8"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "글에서 재미있는 부분 찾기 😄",
          "visual": "📖",
          "question": "글을 읽다 보면 \"이 부분 재미있다!\" 싶은 곳이 있어요.<br>어떤 부분이 재미있을까요?",
          "img": "assets/photo/korean/g2u2_enjoy_read.jpg"
        },
        "suggested_extras": [
          "q_fun8",
          "r_read8"
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
              "q": "줄줄이 이야기는 어떻게?",
              "a": "한 문장씩 이어요"
            },
            {
              "q": "이어 만들면 무엇이 되나요?",
              "a": "긴 이야기"
            }
          ],
          "from": "u2_l07"
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
          "title": "재미있는 부분 찾기",
          "content": "글을 읽을 땐 **재미있는 문장**이나 **장면**을 찾아봐요. 웃긴 말, 신기한 일, 마음에 드는 표현 등 사람마다 재미있는 부분이 **달라요**. 그래서 더 재미있어요!",
          "symbol_meanings": [
            {
              "symbol": "웃긴 말",
              "meaning": "피식 웃게 되는 표현"
            },
            {
              "symbol": "신기한 일",
              "meaning": "놀라운 장면"
            },
            {
              "symbol": "마음에 드는 표현",
              "meaning": "예쁜 말·재미난 말"
            },
            {
              "symbol": "사람마다 다름",
              "meaning": "내 느낌이 소중해요"
            }
          ]
        },
        "suggested_extras": [
          "t_fun8",
          "x_same8"
        ],
        "tnote": {
          "ask": [
            "어떤 부분이 왜 재미있었을까?"
          ],
          "watch": "감상의 근거 말하기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "왜 재미있을까요? 🤔",
          "sub": "문장이 재미있는 까닭을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"펄쩍펄쩍 깡충깡충\" 같은 말이 재미있는 까닭은?",
              "emoji": "🐰",
              "name": "흉내 내는 말이 생생해서"
            },
            {
              "clue": "\"하늘에서 사탕이 내렸어요\"가 재미있는 까닭은?",
              "emoji": "🍬",
              "name": "신기한 일이 일어나서"
            },
            {
              "clue": "\"꼬불꼬불 미끄럼틀\"이 재미있는 까닭은?",
              "emoji": "🎢",
              "name": "모습이 눈에 보이는 듯해서"
            }
          ],
          "outro": "재미있는 까닭은 사람마다 달라요. 내가 찾은 재미를 나눠 볼까요? 😊"
        },
        "suggested_extras": [
          "q_why8",
          "g_fun8"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "생각·느낌을 나눠요",
          "question": "글에서 어떤 부분이 재미있었나요?",
          "items": [
            "가장 재미있는 문장은 무엇인가요?",
            "왜 그 부분이 재미있나요?",
            "읽고 어떤 느낌이 들었나요?"
          ]
        },
        "suggested_extras": [
          "t_present8",
          "e_read8b"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "글에서 재미있는 부분 찾기",
          "levels": {
            "읽기": {
              "q": "짧은 글을 읽고 재미있는 부분을 찾아볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "재미있는 부분을 한 문장으로 옮겨 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "왜 그 부분이 재미있는지 짝에게 말해 봐요.",
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
          "title": "재미있는 부분 나누기 짝 활동",
          "type": "pair",
          "goal": "재미있는 부분을 서로 나눠요",
          "body": "같은 글을 떠올려 짝과 각자 재미있는 부분을 말하고, 다른 점을 찾아봐요.",
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
              "q": "글을 읽으며 무엇을 찾나요?",
              "a": "재미있는 부분"
            },
            {
              "q": "재미있는 부분은 사람마다?",
              "a": "다를 수 있어요"
            },
            {
              "q": "느낌을 나누면 무엇이 좋나요?",
              "a": "더 재미있어요"
            }
          ],
          "self": [
            "재미있는 부분을 찾을 수 있어요",
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
            "글을 즐겁게 읽었어요",
            "재미있는 부분을 찾았어요",
            "생각·느낌을 표현했어요"
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
          "preview": "생각그물로 느낌을 정리해요",
          "body": "다음 시간에는 생각그물로 글에 대한 생각·느낌을 정리해 볼 거예요!"
        },
        "suggested_extras": [
          "e_web8"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_read8",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋아하는 책",
        "content": "\"가장 재미있게 읽은 책이 있나요?\" 읽기 흥미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_enjoy8",
        "type": "tip",
        "icon": "🧩",
        "title": "즐겨 읽기",
        "content": "이 단원은 '즐겨 읽는 태도'가 목표예요. 분석보다 즐김에 초점을 두세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_fun8",
        "type": "fun_question",
        "icon": "📖",
        "title": "재미있는 부분",
        "content": "\"글에서 어떤 부분이 재미있나요?\" 재미를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_read8",
        "type": "real_world",
        "icon": "🌍",
        "title": "읽은 경험",
        "content": "재미있게 읽은 책 이야기를 친구와 나눈 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_fun8",
        "type": "tip",
        "icon": "🧩",
        "title": "다양한 재미",
        "content": "재미있는 부분이 사람마다 다름을 존중하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_same8",
        "type": "misconception",
        "icon": "❓",
        "title": "정답은 없어요",
        "content": "재미있는 부분에 정답은 없어요. 다양한 느낌을 인정하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_why8",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 재미있을까",
        "content": "\"왜 그 부분이 재미있을까요?\" 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_fun8",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "표현 ↔ 재미 까닭 짝짓기",
        "description": "표현과 재미있는 까닭을 짝지어 보세요.",
        "hint": "왜 재미있는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🐰 깡충깡충"
            },
            "b": {
              "text": "생생한 흉내말"
            }
          },
          {
            "a": {
              "text": "🍬 사탕이 내려요"
            },
            "b": {
              "text": "신기한 일"
            }
          },
          {
            "a": {
              "text": "🎢 꼬불꼬불"
            },
            "b": {
              "text": "눈에 보이는 듯"
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
        "content": "재미있는 부분을 까닭과 함께 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_read8b",
        "type": "extension",
        "icon": "⬆",
        "title": "내 표현 찾기",
        "content": "\"나만의 재미있는 표현을 만들어 볼까요?\" 표현을 확장해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect8",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"글에서 무엇을 찾았죠?\" 재미있는 부분을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_web8",
        "type": "extension",
        "icon": "⬆",
        "title": "생각그물 예고",
        "content": "\"다음엔 생각그물로 느낌을 정리해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 9,
      "title": "글을 읽고 생각·느낌을 표현해요 ②",
      "std": "[2국02-05] · [2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 생각그물이란 → 생각그물 만드는 법 → 알맞은 가지 고르기 → 생각그물로 느낌 표현 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글을 읽고 생각·느낌을 표현해요",
          "subtitle": "2단원 · 9/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_web9",
          "t_web9"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "생각그물이 무엇인지 알아봐요",
            "글에 대한 생각을 생각그물로 모아요",
            "생각그물로 느낌을 표현해요"
          ]
        },
        "suggested_extras": [
          "t_web9"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "생각을 그물처럼 펼쳐요 🕸️",
          "visual": "🧠",
          "question": "가운데에 글 제목을 쓰고, 떠오르는 생각을 가지처럼 이어 봐요.<br>어떤 생각이 떠오를까요?",
          "img": "assets/photo/korean/g2u2_mindmap.jpg"
        },
        "suggested_extras": [
          "q_idea9",
          "r_web9"
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
              "q": "글을 읽으며 무엇을 찾나요?",
              "a": "재미있는 부분"
            },
            {
              "q": "재미있는 부분은 사람마다?",
              "a": "다를 수 있어요"
            }
          ],
          "from": "u2_l08"
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
          "title": "생각그물 만들기",
          "content": "생각그물은 **가운데**에 중심 낱말을 쓰고, 떠오르는 생각을 **가지로 이어** 가는 방법이에요. 재미있던 점·느낀 점·궁금한 점을 가지로 펼치면 생각이 **한눈에** 보여요!",
          "symbol_meanings": [
            {
              "symbol": "가운데",
              "meaning": "글 제목·중심 낱말"
            },
            {
              "symbol": "재미있던 점",
              "meaning": "한 가지 가지로"
            },
            {
              "symbol": "느낀 점",
              "meaning": "또 한 가지 가지로"
            },
            {
              "symbol": "궁금한 점",
              "meaning": "가지를 더 펼쳐요"
            }
          ]
        },
        "suggested_extras": [
          "t_web9b",
          "x_web9"
        ],
        "tnote": {
          "ask": [
            "이 글을 읽고 어떤 생각이 떠올랐을까?"
          ],
          "watch": "생각그물로 감상 조직",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이건 어떤 가지일까요? 🕸️",
          "sub": "생각그물의 가지를 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"토끼가 깡충 뛰는 장면이 재미있었다\"",
              "emoji": "😄",
              "name": "재미있던 점 가지"
            },
            {
              "clue": "\"토끼가 외로워서 슬펐다\"",
              "emoji": "💧",
              "name": "느낀 점 가지"
            },
            {
              "clue": "\"토끼는 왜 혼자 살았을까?\"",
              "emoji": "❓",
              "name": "궁금한 점 가지"
            }
          ],
          "outro": "생각을 가지로 펼치니 한눈에 보여요. 나만의 생각그물을 만들어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_branch9",
          "g_web9"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "생각그물로 느낌을 표현해요",
          "question": "글에 대한 생각을 생각그물로 펼쳐 볼까요?",
          "items": [
            "가운데에 무엇을 쓸까요?",
            "재미있던 점·느낀 점은 무엇인가요?",
            "궁금한 점도 있나요?"
          ]
        },
        "suggested_extras": [
          "t_present9",
          "e_web9b"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "생각그물로 느낌 표현하기",
          "levels": {
            "읽기": {
              "q": "생각그물 가운데에는 무엇을 쓰나요?",
              "a": "글의 제목이나 중심 낱말"
            },
            "쓰기": {
              "q": "떠오르는 생각을 가지처럼 두 개 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "내가 만든 생각그물을 짝에게 설명해 봐요.",
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
          "title": "생각그물 함께 채우기 짝 활동",
          "type": "pair",
          "goal": "생각을 가지로 펼쳐요",
          "body": "짝과 한 낱말을 정해, 떠오르는 생각을 번갈아 가지로 이어 그려요.",
          "materials": [
            "종이",
            "색연필"
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
              "q": "생각그물은 무엇을 하나요?",
              "a": "생각을 펼쳐요"
            },
            {
              "q": "가운데에는 무엇을?",
              "a": "중심 낱말"
            },
            {
              "q": "가지에는 무엇을?",
              "a": "떠오른 생각"
            }
          ],
          "self": [
            "생각그물로 느낌을 표현할 수 있어요",
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
            "생각그물이 무엇인지 알았어요",
            "생각을 가지로 펼쳤어요",
            "생각그물로 느낌을 표현했어요"
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
          "preview": "좋아하는 문장을 소개해요",
          "body": "다음 시간에는 책에서 좋아하는 문장을 찾아 책갈피를 만들고 소개해 볼 거예요!"
        },
        "suggested_extras": [
          "e_book9"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_web9",
        "type": "fun_question",
        "icon": "💡",
        "title": "생각 펼치기",
        "content": "\"한 낱말에서 떠오르는 생각을 여러 개 말해 볼까요?\" 생각그물을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_web9",
        "type": "tip",
        "icon": "🧩",
        "title": "생각 정리 도구",
        "content": "생각그물은 흩어진 생각을 한눈에 모으는 도구임을 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_idea9",
        "type": "fun_question",
        "icon": "🧠",
        "title": "떠오르는 생각",
        "content": "\"제목을 보면 어떤 생각이 떠오르나요?\" 생각을 펼쳐요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_web9",
        "type": "real_world",
        "icon": "🌍",
        "title": "마인드맵",
        "content": "마인드맵·생각 지도를 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_web9b",
        "type": "tip",
        "icon": "🧩",
        "title": "가지로 나누기",
        "content": "재미있던 점·느낀 점·궁금한 점으로 가지를 나누면 정리가 쉬워요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_web9",
        "type": "misconception",
        "icon": "❓",
        "title": "많이보다 솔직히",
        "content": "가지를 많이 만들기보다 솔직한 생각을 담게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_branch9",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 가지?",
        "content": "\"이 생각은 어떤 가지에 들어갈까요?\" 가지를 나눠요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_web9",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "생각 ↔ 가지 짝짓기",
        "description": "생각과 어울리는 가지를 짝지어 보세요.",
        "hint": "어떤 종류의 생각인지 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "😄 재미있었다"
            },
            "b": {
              "text": "재미있던 점"
            }
          },
          {
            "a": {
              "text": "💧 슬펐다"
            },
            "b": {
              "text": "느낀 점"
            }
          },
          {
            "a": {
              "text": "❓ 왜 그럴까?"
            },
            "b": {
              "text": "궁금한 점"
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
        "title": "펼쳐 말하기",
        "content": "생각그물을 보며 자기 생각을 펼쳐 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_web9b",
        "type": "extension",
        "icon": "⬆",
        "title": "가지 더하기",
        "content": "\"가지를 하나 더 펼친다면 무엇을 쓸까요?\" 생각을 확장해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect9",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"생각그물은 어떻게 만들죠?\" 가운데·가지를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_book9",
        "type": "extension",
        "icon": "⬆",
        "title": "책갈피 예고",
        "content": "\"다음엔 좋아하는 문장으로 책갈피를 만들어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l10"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 10,
      "title": "좋아하는 문장을 소개해요 ①",
      "std": "[2국02-05] · [2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 좋아하는 문장 찾기 → 책갈피 만들기 → 소개에 담을 것 고르기 → 책갈피 만들기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "좋아하는 문장을 소개해요",
          "subtitle": "2단원 · 10/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_pick10",
          "t_mark10"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "책에서 좋아하는 문장을 찾아요",
            "책갈피를 만들어요",
            "소개할 내용을 정해요"
          ]
        },
        "suggested_extras": [
          "t_mark10"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "마음에 쏙 든 문장 💗",
          "visual": "📑",
          "question": "책을 읽다 마음에 쏙 드는 문장을 만난 적 있나요?<br>그 문장을 책갈피에 담으면 어떨까요?",
          "img": "assets/photo/korean/g2u2_bookmark.jpg"
        },
        "suggested_extras": [
          "q_fav10",
          "r_mark10"
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
              "q": "생각그물은 무엇을 하나요?",
              "a": "생각을 펼쳐요"
            },
            {
              "q": "가지에는 무엇을?",
              "a": "떠오른 생각"
            }
          ],
          "from": "u2_l09"
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
          "title": "좋아하는 문장과 책갈피",
          "content": "좋아하는 문장은 **마음에 남는 문장**이에요. 그 문장을 책갈피에 **또박또박 옮겨 쓰고**, **왜 좋은지** 까닭을 더하면 멋진 책갈피가 돼요. 그림을 더해도 좋아요!",
          "symbol_meanings": [
            {
              "symbol": "문장 고르기",
              "meaning": "마음에 드는 문장"
            },
            {
              "symbol": "옮겨 쓰기",
              "meaning": "또박또박 써요"
            },
            {
              "symbol": "까닭 더하기",
              "meaning": "왜 좋은지"
            },
            {
              "symbol": "꾸미기",
              "meaning": "그림으로 예쁘게"
            }
          ]
        },
        "suggested_extras": [
          "t_mark10b",
          "x_long10"
        ],
        "tnote": {
          "ask": [
            "마음에 든 문장은 어떤 것이었을까?"
          ],
          "watch": "문장 감상·선택",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "책갈피에 담을 내용은? ✅",
          "sub": "책갈피에 담을 내용을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "책갈피의 가장 중요한 내용은?",
              "emoji": "💗",
              "name": "좋아하는 문장"
            },
            {
              "clue": "문장과 함께 담으면 좋은 것은?",
              "emoji": "❓",
              "name": "왜 좋은지 까닭"
            },
            {
              "clue": "책갈피를 예쁘게 하려면?",
              "emoji": "🎨",
              "name": "어울리는 그림"
            }
          ],
          "outro": "좋아하는 문장에 까닭과 그림을 더하면 멋진 책갈피가 돼요. 만들어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick10b",
          "g_mark10"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "책갈피를 만들어요",
          "question": "어떤 문장으로 책갈피를 만들까요?",
          "items": [
            "어떤 문장이 마음에 들었나요?",
            "왜 그 문장이 좋은가요?",
            "어떤 그림을 더하고 싶나요?"
          ]
        },
        "suggested_extras": [
          "t_present10",
          "e_mark10"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "좋아하는 문장과 책갈피",
          "levels": {
            "읽기": {
              "q": "마음에 드는 문장을 골라 소리 내어 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "좋아하는 문장을 책갈피에 옮겨 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "그 문장이 왜 좋은지 짝에게 말해 봐요.",
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
          "title": "책갈피 만들기 짝 활동",
          "type": "pair",
          "goal": "좋아하는 문장을 담아요",
          "body": "짝과 각자 좋아하는 문장으로 책갈피를 만들고, 서로 보여 줘요.",
          "materials": [
            "종이",
            "색연필"
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
              "q": "책갈피에 무엇을 담나요?",
              "a": "좋아하는 문장"
            },
            {
              "q": "문장을 고를 때 기준은?",
              "a": "마음에 드는 것"
            },
            {
              "q": "왜 소개할까요?",
              "a": "함께 나누려고"
            }
          ],
          "self": [
            "좋아하는 문장을 책갈피에 담을 수 있어요",
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
            "좋아하는 문장을 찾았어요",
            "책갈피를 만들었어요",
            "소개할 내용을 정했어요"
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
          "preview": "책갈피를 소개하고 나눠요",
          "body": "다음 시간에는 만든 책갈피로 좋아하는 문장을 친구들에게 소개해 볼 거예요!"
        },
        "suggested_extras": [
          "e_share10"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_pick10",
        "type": "fun_question",
        "icon": "💡",
        "title": "마음에 든 문장",
        "content": "\"책에서 마음에 쏙 든 문장이 있었나요?\" 문장 찾기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_mark10",
        "type": "tip",
        "icon": "🧩",
        "title": "문장과 까닭",
        "content": "좋아하는 문장에 까닭을 더하게 하면 감상이 깊어져요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_fav10",
        "type": "fun_question",
        "icon": "📑",
        "title": "왜 좋을까",
        "content": "\"그 문장이 왜 마음에 들었나요?\" 까닭을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_mark10",
        "type": "real_world",
        "icon": "🌍",
        "title": "책갈피 경험",
        "content": "책갈피를 써 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_mark10b",
        "type": "tip",
        "icon": "🧩",
        "title": "또박또박 옮기기",
        "content": "문장을 또박또박 옮겨 쓰며 바른 글씨도 연습하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_long10",
        "type": "misconception",
        "icon": "❓",
        "title": "짧아도 좋아",
        "content": "긴 문장을 고를 필요 없어요. 짧아도 마음에 드는 문장이면 충분해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick10b",
        "type": "fun_question",
        "icon": "💡",
        "title": "나라면",
        "content": "\"나라면 어떤 문장을 고를까요?\" 자기 문장을 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mark10",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "내용 ↔ 책갈피 요소 짝짓기",
        "description": "내용과 책갈피 요소를 짝지어 보세요.",
        "hint": "책갈피에 무엇을 담는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "💗 문장"
            },
            "b": {
              "text": "좋아하는 문장"
            }
          },
          {
            "a": {
              "text": "❓ 까닭"
            },
            "b": {
              "text": "왜 좋은지"
            }
          },
          {
            "a": {
              "text": "🎨 그림"
            },
            "b": {
              "text": "어울리는 그림"
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
        "title": "까닭 담기",
        "content": "문장과 함께 왜 좋은지 까닭을 정하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_mark10",
        "type": "extension",
        "icon": "⬆",
        "title": "꾸미기",
        "content": "\"책갈피를 어떻게 꾸미고 싶나요?\" 표현을 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect10",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"책갈피에 무엇을 담았죠?\" 문장·까닭을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_share10",
        "type": "extension",
        "icon": "⬆",
        "title": "소개 예고",
        "content": "\"다음엔 책갈피로 문장을 소개해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l11"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 11,
      "title": "좋아하는 문장을 소개해요 ②",
      "std": "[2국02-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 소개 방법 → 발표·듣기 약속 → 바른 소개 모습 고르기 → 문장 소개·나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "좋아하는 문장을 소개해요",
          "subtitle": "2단원 · 11/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_ready11",
          "t_share11"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "좋아하는 문장을 소개하는 법을 알아봐요",
            "바른 자세로 소개하고 들어요",
            "친구의 문장 소개를 나눠요"
          ]
        },
        "suggested_extras": [
          "t_share11"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "내가 고른 문장을 들려줘요 🎤",
          "visual": "📢",
          "question": "만든 책갈피로 좋아하는 문장을 소개해요.<br>어떻게 소개하면 친구가 그 문장을 좋아하게 될까요?",
          "img": "assets/photo/korean/g2u2_share_sentence.jpg"
        },
        "suggested_extras": [
          "q_how11",
          "r_share11"
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
              "q": "책갈피에 무엇을 담나요?",
              "a": "좋아하는 문장"
            },
            {
              "q": "왜 소개할까요?",
              "a": "함께 나누려고"
            }
          ],
          "from": "u2_l10"
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
          "title": "문장 소개하기",
          "content": "소개할 땐 **좋아하는 문장**을 또박또박 읽고, **왜 좋은지** 까닭을 말해요. 들을 땐 친구의 문장에 \"나도 좋다\" 하고 **반응**해 주면 소개가 더 즐거워져요!",
          "symbol_meanings": [
            {
              "symbol": "문장 읽기",
              "meaning": "또박또박 들려줘요"
            },
            {
              "symbol": "까닭 말하기",
              "meaning": "왜 좋은지"
            },
            {
              "symbol": "바른 듣기",
              "meaning": "친구 소개를 잘 들어요"
            },
            {
              "symbol": "반응하기",
              "meaning": "\"나도 좋다\" 맞장구"
            }
          ]
        },
        "suggested_extras": [
          "t_share11b",
          "x_just11"
        ],
        "tnote": {
          "ask": [
            "친구가 그 문장을 좋아하게 하려면 어떻게 소개할까?"
          ],
          "watch": "소개·경청 태도",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 소개 모습은? ✅",
          "sub": "문장 소개의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "문장을 소개할 때는?",
              "emoji": "🎤",
              "name": "또박또박 읽고 까닭을 말해요"
            },
            {
              "clue": "친구 소개를 들을 때는?",
              "emoji": "👂",
              "name": "바른 자세로 끝까지 들어요"
            },
            {
              "clue": "친구 문장이 좋을 때는?",
              "emoji": "😊",
              "name": "\"나도 좋다\" 반응해 줘요"
            }
          ],
          "outro": "소개하고 반응하면 서로의 좋은 문장을 함께 즐길 수 있어요. 소개해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good11",
          "g_share11"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "좋아하는 문장을 소개해요 🎤",
          "sub": "버튼을 눌러 발표할 친구를 뽑아요. 책갈피의 문장을 또박또박 소개해 봐요!",
          "count": 24,
          "hint": "“제가 좋아하는 문장은 ~입니다. 왜냐하면…” 처럼 까닭과 함께 소개해요",
          "end_msg": "모두 좋아하는 문장을 멋지게 소개했어요. 함께 말의 재미를 느꼈어요! 👏"
        },
        "suggested_extras": [
          "t_present11",
          "e_share11b"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "좋아하는 문장 소개하기",
          "levels": {
            "읽기": {
              "q": "소개할 때 목소리는 어떻게 하면 좋을까요?",
              "a": "또렷하고 알맞은 크기로"
            },
            "쓰기": {
              "q": "'제가 좋아하는 문장은 ○○입니다.'로 소개말을 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "만든 책갈피로 좋아하는 문장을 소개해 봐요.",
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
          "title": "문장 소개 나누기 짝 활동",
          "type": "pair",
          "goal": "문장을 소개하고 들어요",
          "body": "짝에게 좋아하는 문장을 소개하고, 짝의 소개를 끝까지 듣고 반응해 줘요.",
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
              "q": "소개할 때 자세는?",
              "a": "바르게 서서 또렷하게"
            },
            {
              "q": "들을 때는 어떻게?",
              "a": "끝까지 잘 들어요"
            },
            {
              "q": "소개 뒤에는?",
              "a": "좋았던 점을 말해 줘요"
            }
          ],
          "self": [
            "좋아하는 문장을 소개할 수 있어요",
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
            "좋아하는 문장을 소개했어요",
            "바른 자세로 소개하고 들었어요",
            "친구의 문장 소개를 나눴어요"
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
          "preview": "낱말 말놀이를 해요",
          "body": "다음 시간에는 낱말을 활용해 이름 짓기 같은 재미있는 말놀이를 실천해 볼 거예요!"
        },
        "suggested_extras": [
          "e_play11"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_ready11",
        "type": "fun_question",
        "icon": "💡",
        "title": "소개 마음",
        "content": "\"내가 고른 문장을 소개하는 마음은 어떤가요?\" 발표를 편하게 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_share11",
        "type": "tip",
        "icon": "🧩",
        "title": "함께 즐기기",
        "content": "서로의 좋은 문장을 나누며 함께 즐기는 데 초점을 두세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how11",
        "type": "fun_question",
        "icon": "📢",
        "title": "잘 들리게",
        "content": "\"문장을 어떻게 읽으면 더 좋게 들릴까요?\" 소개 태도를 짚어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_share11",
        "type": "real_world",
        "icon": "🌍",
        "title": "추천 경험",
        "content": "친구에게 좋은 책·문장을 추천한 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_share11b",
        "type": "tip",
        "icon": "🧩",
        "title": "까닭과 반응",
        "content": "까닭을 담아 소개하고, 들을 때 반응하게 하면 소개가 즐거워져요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_just11",
        "type": "misconception",
        "icon": "❓",
        "title": "\"그냥\" 대신",
        "content": "\"그냥 좋아\"보다 어떤 점이 좋은지 한마디 더하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good11",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"문장 소개의 바른 모습은 무엇이죠?\" 읽기·까닭·반응을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_share11",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "소개 상황과 바른 모습을 짝지어 보세요.",
        "hint": "함께 즐기는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🎤 소개"
            },
            "b": {
              "text": "또박또박·까닭"
            }
          },
          {
            "a": {
              "text": "👂 듣기"
            },
            "b": {
              "text": "끝까지 듣기"
            }
          },
          {
            "a": {
              "text": "😊 좋을 때"
            },
            "b": {
              "text": "나도 좋다"
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
        "content": "소개하는 친구를 격려하고, 듣는 친구는 좋은 점을 찾게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_share11b",
        "type": "extension",
        "icon": "⬆",
        "title": "문장 모으기",
        "content": "\"우리 반이 좋아하는 문장을 모아 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect11",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"문장을 어떻게 소개했죠?\" 까닭·반응을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_play11",
        "type": "extension",
        "icon": "⬆",
        "title": "말놀이 예고",
        "content": "\"다음엔 이름 짓기 말놀이를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l12"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 12,
      "title": "낱말로 말놀이를 해요 ① (실천)",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 이름 짓기 놀이 → 재미있게 짓는 법 → 어울리는 이름 고르기 → 이름 지어 말하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "낱말로 말놀이를 해요",
          "subtitle": "2단원 · 12/15차시 · 실천"
        },
        "suggested_extras": [
          "q_name12",
          "t_name12"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "낱말로 이름 짓기 놀이를 해요",
            "재미있는 이름을 짓는 법을 알아봐요",
            "나만의 이름을 지어 말해요"
          ]
        },
        "suggested_extras": [
          "t_name12"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "우리 식당 이름은? 🍜",
          "visual": "🏪",
          "question": "맛있는 음식을 파는 식당을 연다면<br>어떤 재미있는 이름을 지어 줄까요?",
          "img": "assets/photo/korean/g2u2_naming.jpg"
        },
        "suggested_extras": [
          "q_shop12",
          "r_name12"
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
              "q": "소개할 때 자세는?",
              "a": "바르게 서서 또렷하게"
            },
            {
              "q": "들을 때는 어떻게?",
              "a": "끝까지 잘 들어요"
            }
          ],
          "from": "u2_l11"
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
          "title": "재미있게 이름 짓기",
          "content": "이름은 **낱말을 이어** 재미있게 지을 수 있어요. 음식 이름에 느낌을 더해 \"**호로록 국수집**\", 흉내말을 넣어 \"**보글보글 찌개집**\"처럼요. 부르면 **재미있고 기억에 남는** 이름이 좋아요!",
          "symbol_meanings": [
            {
              "symbol": "흉내말 넣기",
              "meaning": "호로록·보글보글"
            },
            {
              "symbol": "느낌 더하기",
              "meaning": "맛·모습을 살려요"
            },
            {
              "symbol": "낱말 잇기",
              "meaning": "두 낱말을 이어요"
            },
            {
              "symbol": "기억에 남게",
              "meaning": "부르기 재미있게"
            }
          ]
        },
        "suggested_extras": [
          "t_name12b",
          "x_name12"
        ],
        "tnote": {
          "ask": [
            "어떤 이름이 재미있고 잘 어울릴까?"
          ],
          "watch": "말의 재미로 창작",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "재미있는 이름은? 🏪",
          "sub": "가게에 어울리는 재미있는 이름을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "국수를 파는 식당 이름은?",
              "emoji": "🍜",
              "name": "\"호로록 국수집\""
            },
            {
              "clue": "빵을 파는 가게 이름은?",
              "emoji": "🥐",
              "name": "\"폭신폭신 빵집\""
            },
            {
              "clue": "과일을 파는 가게 이름은?",
              "emoji": "🍓",
              "name": "\"새콤달콤 과일가게\""
            }
          ],
          "outro": "흉내말과 느낌을 넣으니 이름이 재미있어졌어요. 나만의 이름을 지어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_name12c",
          "g_name12"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "나만의 이름을 지어요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 가게·물건에 재미있는 이름을 지어 말해 봐요!",
          "count": 24,
          "hint": "흉내말이나 느낌을 넣어 “○○○ ○○집” 처럼 지어 봐요",
          "end_msg": "모두 재미있는 이름을 멋지게 지었어요. 말의 재미가 솔솔! 👏"
        },
        "suggested_extras": [
          "t_present12",
          "e_name12"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "재미있게 이름 짓기 놀이",
          "levels": {
            "읽기": {
              "q": "'방긋방긋 김밥집'처럼 지은 이름을 읽어 볼까요?",
              "a": "방긋방긋 김밥집"
            },
            "쓰기": {
              "q": "가게 하나를 골라 재미있는 이름을 지어 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "내가 지은 이름과 그 까닭을 말해 봐요.",
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
          "title": "이름 짓기 짝 놀이",
          "type": "pair",
          "goal": "재미있는 이름을 지어요",
          "body": "짝과 같은 가게에 각자 이름을 지어 주고, 서로 왜 그렇게 지었는지 이야기해요.",
          "materials": [
            "메모지"
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
              "q": "이름을 지을 때 무엇을 넣으면 재미있나요?",
              "a": "소리나 뜻의 재미"
            },
            {
              "q": "이름은 무엇을 알려 주나요?",
              "a": "무엇을 하는 곳인지"
            },
            {
              "q": "까닭을 말하면 좋은 점은?",
              "a": "생각을 나눌 수 있어요"
            }
          ],
          "self": [
            "재미있게 이름을 지을 수 있어요",
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
            "낱말로 이름 짓기 놀이를 했어요",
            "재미있게 짓는 법을 알았어요",
            "나만의 이름을 지어 말했어요"
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
          "preview": "말놀이를 더 즐겨요",
          "body": "다음 시간에는 모둠이 함께 여러 말놀이를 즐기며 실천해 볼 거예요!"
        },
        "suggested_extras": [
          "e_play12"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_name12",
        "type": "fun_question",
        "icon": "💡",
        "title": "이름 짓기",
        "content": "\"내 물건에 이름을 지어 준 적이 있나요?\" 이름 짓기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_name12",
        "type": "tip",
        "icon": "🧩",
        "title": "낱말 활용",
        "content": "앞서 배운 흉내말·낱말을 활용해 이름을 짓게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_shop12",
        "type": "fun_question",
        "icon": "🏪",
        "title": "우리 가게",
        "content": "\"어떤 가게를 열고 싶나요?\" 상상을 열어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_name12",
        "type": "real_world",
        "icon": "🌍",
        "title": "가게 간판",
        "content": "동네에서 본 재미있는 가게 이름과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_name12b",
        "type": "tip",
        "icon": "🧩",
        "title": "흉내말 넣기",
        "content": "흉내말·느낌을 넣으면 이름이 생생해짐을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_name12",
        "type": "misconception",
        "icon": "❓",
        "title": "뜻이 통하게",
        "content": "너무 어렵거나 뜻이 안 통하지 않게, 재미와 함께 알아듣기 쉽게 짓게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_name12c",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 이름?",
        "content": "\"이 가게에 또 어떤 이름이 어울릴까요?\" 이름을 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_name12",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "가게 ↔ 이름 짝짓기",
        "description": "가게와 재미있는 이름을 짝지어 보세요.",
        "hint": "흉내말·느낌을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🍜 국수집"
            },
            "b": {
              "text": "호로록"
            }
          },
          {
            "a": {
              "text": "🥐 빵집"
            },
            "b": {
              "text": "폭신폭신"
            }
          },
          {
            "a": {
              "text": "🍓 과일가게"
            },
            "b": {
              "text": "새콤달콤"
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
        "title": "까닭과 함께",
        "content": "지은 이름을 까닭과 함께 말하게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_name12",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 가게",
        "content": "\"우리 반 가게 거리를 만든다면?\" 상상을 넓혀요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect12",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"재미있는 이름은 어떻게 짓죠?\" 흉내말·느낌을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_play12",
        "type": "extension",
        "icon": "⬆",
        "title": "말놀이 예고",
        "content": "\"다음엔 모둠 말놀이를 즐겨요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l13"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 13,
      "title": "낱말로 말놀이를 해요 ② (실천)",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 모둠 말놀이 약속 → 여러 말놀이 즐기기 → 바른 모습 고르기 → 모둠 말놀이 한마당 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "낱말로 말놀이를 해요",
          "subtitle": "2단원 · 13/15차시 · 실천"
        },
        "suggested_extras": [
          "q_group13",
          "t_group13"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "모둠 말놀이 약속을 정해요",
            "여러 말놀이를 즐겨요",
            "모둠 말놀이 한마당을 열어요"
          ]
        },
        "suggested_extras": [
          "t_group13"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "모둠 말놀이 한마당! 🎪",
          "visual": "🙌",
          "question": "배운 말놀이를 모둠이 함께 즐겨요.<br>모두 재미있게 하려면 어떤 약속이 필요할까요?",
          "img": "assets/photo/korean/g2u2_group_play.jpg"
        },
        "suggested_extras": [
          "q_rule13",
          "r_group13"
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
              "q": "이름은 무엇을 알려 주나요?",
              "a": "무엇을 하는 곳인지"
            },
            {
              "q": "까닭을 말하면 좋은 점은?",
              "a": "생각을 나눌 수 있어요"
            }
          ],
          "from": "u2_l12"
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
          "title": "모둠 말놀이 약속",
          "content": "모둠 말놀이는 **차례를 지키고**, 친구가 말할 때 **잘 듣고**, 막힌 친구를 **도와줘요**. 이기는 것보다 **함께 즐기는 것**이 가장 중요해요!",
          "symbol_meanings": [
            {
              "symbol": "차례 지키기",
              "meaning": "순서대로 해요"
            },
            {
              "symbol": "잘 듣기",
              "meaning": "친구 말을 들어요"
            },
            {
              "symbol": "도와주기",
              "meaning": "막히면 함께"
            },
            {
              "symbol": "함께 즐기기",
              "meaning": "이기기보다 즐겁게"
            }
          ]
        },
        "suggested_extras": [
          "t_fair13",
          "x_win13"
        ],
        "tnote": {
          "ask": [
            "모두 재미있게 놀려면 어떤 약속이 필요할까?"
          ],
          "watch": "협동·규칙 준수 종합",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "모둠 말놀이, 바른 모습은? ✅",
          "sub": "모둠 말놀이의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "내 차례가 아닐 때는?",
              "emoji": "🙋",
              "name": "친구를 응원하며 기다려요"
            },
            {
              "clue": "친구가 막혔을 때는?",
              "emoji": "🤝",
              "name": "힌트를 주며 도와줘요"
            },
            {
              "clue": "가장 중요한 것은?",
              "emoji": "😊",
              "name": "이기기보다 함께 즐기기"
            }
          ],
          "outro": "서로 도우며 즐기면 말놀이가 더 신나요. 모둠이 한마당을 열어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good13",
          "g_group13"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "모둠 말놀이 한마당 🎤",
          "sub": "버튼을 눌러 시작할 모둠(친구)을 뽑아요. 좋아하는 말놀이를 모둠이 함께 즐겨 봐요!",
          "count": 12,
          "hint": "꼬리따기·말 덧붙이기 등 좋아하는 말놀이를 골라 즐겨 봐요",
          "end_msg": "모두 함께 말놀이를 즐겼어요. 우리 반에 말의 재미가 가득! 👏"
        },
        "suggested_extras": [
          "t_present13",
          "e_group13"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "모둠 말놀이 한마당",
          "levels": {
            "읽기": {
              "q": "'차례를 지켜 함께 놀이합니다.'는 바른 약속인가요?",
              "a": "네, 바른 약속"
            },
            "쓰기": {
              "q": "모둠 말놀이에서 지킬 약속 한 가지를 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "모둠에서 하고 싶은 말놀이를 하나 제안해 봐요.",
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
          "title": "모둠 말놀이 한마당 짝·모둠 활동",
          "type": "pair",
          "goal": "함께 말놀이를 즐겨요",
          "body": "짝·모둠이 배운 말놀이 중 하나를 골라 약속을 지키며 한 판 즐겨요.",
          "materials": [],
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
              "q": "함께 놀 때 필요한 것은?",
              "a": "약속과 차례"
            },
            {
              "q": "모두 즐거우려면?",
              "a": "규칙을 지켜요"
            },
            {
              "q": "가장 재미있던 말놀이는?",
              "a": "여러 답"
            }
          ],
          "self": [
            "모둠 말놀이를 즐길 수 있어요",
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
            "모둠 말놀이 약속을 지켰어요",
            "여러 말놀이를 즐겼어요",
            "모둠 말놀이 한마당을 열었어요"
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
        "id": "q_group13",
        "type": "fun_question",
        "icon": "💡",
        "title": "함께한 놀이",
        "content": "\"모둠이 함께한 놀이 중 즐거웠던 게 있나요?\" 흥미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_group13",
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
        "id": "q_rule13",
        "type": "fun_question",
        "icon": "🙌",
        "title": "어떤 약속?",
        "content": "\"모두 즐거우려면 어떤 약속이 필요할까요?\" 약속을 정해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_group13",
        "type": "real_world",
        "icon": "🌍",
        "title": "모둠 놀이",
        "content": "모둠으로 함께한 놀이 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_fair13",
        "type": "tip",
        "icon": "🧩",
        "title": "도우며 즐기기",
        "content": "막힌 친구를 도우며 함께 즐기는 분위기를 만드세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_win13",
        "type": "misconception",
        "icon": "❓",
        "title": "이기기보다 즐기기",
        "content": "승부에 집착하지 않고 함께 즐기는 데 초점을 두게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good13",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"모둠 말놀이의 바른 모습은 무엇이죠?\" 차례·도움을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_group13",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "모둠 말놀이 상황과 바른 모습을 짝지어 보세요.",
        "hint": "함께 즐기는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🙋 내 차례 아님"
            },
            "b": {
              "text": "응원하며 기다리기"
            }
          },
          {
            "a": {
              "text": "🤝 막힌 친구"
            },
            "b": {
              "text": "도와주기"
            }
          },
          {
            "a": {
              "text": "😊 놀이"
            },
            "b": {
              "text": "함께 즐기기"
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
        "title": "즐겁게",
        "content": "규칙을 가볍게 정하고 모둠이 즐겁게 놀이하게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_group13",
        "type": "extension",
        "icon": "⬆",
        "title": "으뜸 말놀이",
        "content": "\"오늘 가장 재미있던 말놀이를 뽑아 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect13",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"모둠 말놀이에서 무엇을 했죠?\" 배움을 짚어요.",
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

  window.LESSONS["u2_l14"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 14,
      "title": "마무리하기 ① — 스스로 확인",
      "std": "[2국05-01] · [2국02-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 말놀이·감상 정리 → 확인 퀴즈 → 스스로 확인 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ① — 스스로 확인",
          "subtitle": "2단원 · 14/15차시 · 마무리"
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
            "말놀이·감상하는 법을 정리해요",
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
          "scene_title": "2단원에서 무엇을 배웠나요? 🎀",
          "visual": "🎉",
          "question": "말놀이도 하고, 이야기도 만들고, 좋아하는 문장도 소개했어요.<br>가장 기억에 남는 것은 무엇인가요?",
          "img": "assets/photo/korean/g2u2_review.jpg"
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
              "q": "함께 놀 때 필요한 것은?",
              "a": "약속과 차례"
            },
            {
              "q": "모두 즐거우려면?",
              "a": "규칙을 지켜요"
            }
          ],
          "from": "u2_l13"
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
          "title": "말놀이·감상 정리",
          "content": "이 단원에서 **말놀이로 말의 재미**를 느끼고, **글을 읽고 생각·느낌을 나누는 법**을 배웠어요. 규칙을 지켜 함께 놀고, 재미있는 부분을 까닭과 함께 나누면 더 즐거워요!",
          "symbol_meanings": [
            {
              "symbol": "말놀이",
              "meaning": "꼬리따기·말 덧붙이기 등"
            },
            {
              "symbol": "규칙 지키기",
              "meaning": "함께 즐겨요"
            },
            {
              "symbol": "재미있는 부분",
              "meaning": "글에서 찾아요"
            },
            {
              "symbol": "까닭 더하기",
              "meaning": "왜 좋은지 나눠요"
            }
          ]
        },
        "suggested_extras": [
          "t_method14",
          "x_forget14"
        ],
        "tnote": {
          "ask": [
            "이 단원에서 가장 재미있던 것은 무엇일까?"
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
              "clue": "꼬리따기 말놀이는?",
              "emoji": "🔗",
              "name": "앞말의 끝을 받아 이어요"
            },
            {
              "clue": "글을 읽을 때는?",
              "emoji": "📖",
              "name": "재미있는 부분을 찾아요"
            },
            {
              "clue": "문장을 소개할 때는?",
              "emoji": "💗",
              "name": "왜 좋은지 까닭을 말해요"
            }
          ],
          "outro": "배운 것을 잘 기억하고 있어요. 말놀이와 책 읽기를 계속 즐겨 봐요! 😊"
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
            "규칙을 지켜 말놀이를 할 수 있나요?",
            "글에서 재미있는 부분을 찾을 수 있나요?",
            "좋아하는 문장을 까닭과 함께 소개할 수 있나요?"
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
              "q": "'말놀이에는 규칙이 있습니다.'가 바른 문장인지 읽고 판단해 볼까요?",
              "a": "네, 바른 문장"
            },
            "쓰기": {
              "q": "이 단원에서 배운 것 한 가지를 문장으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "가장 기억에 남는 말놀이를 짝에게 말해 봐요.",
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
          "title": "배운 말놀이 나누기 짝 활동",
          "type": "pair",
          "goal": "단원을 함께 정리해요",
          "body": "짝과 번갈아 이 단원에서 배운 말놀이를 하나씩 말하며 정리해요.",
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
              "q": "말놀이에 필요한 것은?",
              "a": "규칙"
            },
            {
              "q": "글에서 무엇을 찾았나요?",
              "a": "재미있는 부분"
            },
            {
              "q": "좋아하는 문장은 어떻게 했나요?",
              "a": "책갈피로 소개했어요"
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
            "말놀이·감상하는 법을 정리했어요",
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
          "body": "다음 시간에는 끝말잇기로 낱말을 정리하고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"
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
        "title": "즐기는 태도",
        "content": "방법 정리에 그치지 말고 말놀이·읽기를 즐기는 태도를 기르게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_memory14",
        "type": "fun_question",
        "icon": "🎉",
        "title": "기억에 남는 활동",
        "content": "\"말놀이·이야기·문장 소개 중 무엇이 가장 즐거웠나요?\" 단원 경험을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_back14",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 말놀이",
        "content": "집·놀이터에서 말놀이를 한 경험을 떠올리게 해요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_method14",
        "type": "tip",
        "icon": "🧩",
        "title": "두 갈래 정리",
        "content": "말놀이와 글 감상을 함께 정리하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_forget14",
        "type": "misconception",
        "icon": "❓",
        "title": "즐김이 핵심",
        "content": "규칙 외우기보다 즐기는 마음이 핵심임을 다시 짚어 주세요.",
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
              "text": "🔗 꼬리따기"
            },
            "b": {
              "text": "끝말 받기"
            }
          },
          {
            "a": {
              "text": "📖 글 읽기"
            },
            "b": {
              "text": "재미있는 부분"
            }
          },
          {
            "a": {
              "text": "💗 문장 소개"
            },
            "b": {
              "text": "까닭 더하기"
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
        "content": "\"더 즐기고 싶은 말놀이를 정해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect14",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"무엇을 정리했죠?\" 말놀이·감상을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_basic14",
        "type": "extension",
        "icon": "⬆",
        "title": "기초 다지기 예고",
        "content": "\"다음엔 끝말잇기와 글씨 쓰기를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u2_l15"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 2,
      "n": 15,
      "title": "마무리하기 ② — 기초 다지기",
      "std": "[2국05-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 끝말잇기 정리 → 이어지는 낱말 → 끝말잇기 잇기 → 글씨 쓰기·단원 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ② — 기초 다지기",
          "subtitle": "2단원 · 15/15차시 · 마무리"
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
            "끝말잇기로 낱말을 정리해요",
            "이어지는 낱말을 찾아요",
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
          "scene_title": "끝말을 이어 볼까요? 🔗",
          "visual": "🔤",
          "question": "\"사과 → 과자 → 자전거…\"<br>끝 글자로 이어 가는 끝말잇기, 어디까지 이을 수 있을까요?",
          "img": "assets/photo/korean/g2u2_lastword.jpg"
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
              "q": "말놀이에 필요한 것은?",
              "a": "규칙"
            },
            {
              "q": "좋아하는 문장은 어떻게 했나요?",
              "a": "책갈피로 소개했어요"
            }
          ],
          "from": "u2_l14"
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
          "title": "끝말잇기로 정리해요",
          "content": "끝말잇기는 앞 낱말의 **끝 글자**로 시작하는 낱말을 이어 가요. \"사과 → 과일 → 일기…\"처럼요. 단원에서 배운 낱말로 끝말잇기를 하면 **재미있게 복습**할 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "사과",
              "meaning": "끝 글자 '과'"
            },
            {
              "symbol": "과일",
              "meaning": "'과'로 시작·끝 글자 '일'"
            },
            {
              "symbol": "일기",
              "meaning": "'일'로 시작"
            },
            {
              "symbol": "이어 가기",
              "meaning": "끝 글자를 받아요"
            }
          ]
        },
        "suggested_extras": [
          "t_last2",
          "x_last"
        ],
        "tnote": {
          "ask": [
            "끝말잇기를 오래 이으려면?"
          ],
          "watch": "끝말잇기·바른 글씨 마무리",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "끝말을 이어 봐요 🔗",
          "sub": "앞 낱말의 끝 글자로 시작하는 낱말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"바다 → ( )\"",
              "emoji": "🍬",
              "name": "다람쥐 (또는 '다'로 시작하는 낱말)"
            },
            {
              "clue": "\"구름 → ( )\"",
              "emoji": "🎵",
              "name": "름… 어렵죠? '음악'처럼 비슷한 소리로!"
            },
            {
              "clue": "\"나무 → ( )\"",
              "emoji": "🚪",
              "name": "무지개 (또는 '무'로 시작하는 낱말)"
            }
          ],
          "outro": "끝 글자를 받아 이으니 낱말이 줄줄이 이어져요. 이제 글씨도 써 볼까요? 😊"
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
          "content": "단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **말놀이 · 이야기 · 문장**을 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "말놀이",
              "meaning": "또박또박 칸에 맞춰"
            },
            {
              "symbol": "이야기",
              "meaning": "바른 자세로"
            },
            {
              "symbol": "문장",
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
          "title": "끝말잇기로 정리하기",
          "levels": {
            "읽기": {
              "q": "'사과 → 과자 → 자전거'를 이어 읽어 볼까요?",
              "a": "사과·과자·자전거"
            },
            "쓰기": {
              "q": "'나비'로 시작해 끝말잇기 한 낱말을 이어 써 볼까요?",
              "a": "여러 답 (예: 나비 → 비누)",
              "open": true
            },
            "말하기": {
              "q": "짝과 끝말잇기를 세 번 이어 봐요.",
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
          "title": "끝말잇기 짝 놀이",
          "type": "pair",
          "goal": "끝 글자로 낱말을 이어요",
          "body": "짝과 끝말잇기 규칙으로 앞 낱말의 끝 글자를 받아 번갈아 이어요.",
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
              "q": "끝말잇기는 무엇을 이어요?",
              "a": "앞 낱말의 끝 글자"
            },
            {
              "q": "'과자' 다음에 올 수 있는 낱말은?",
              "a": "'자'로 시작하는 낱말"
            },
            {
              "q": "낱말을 바르게 쓰려면?",
              "a": "또박또박 써요"
            }
          ],
          "self": [
            "끝말잇기로 낱말을 이을 수 있어요",
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
          "title": "2단원에서 배운 것",
          "points": [
            "말놀이로 말의 재미를 느꼈어요",
            "글을 읽고 생각·느낌을 나눴어요",
            "끝말잇기로 복습하고 글씨를 썼어요"
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
          "preview": "말의 재미가 솔솔!",
          "body": "2단원을 모두 마쳤어요. 앞으로도 말놀이를 즐기고 책을 재미있게 읽어 봐요. 정말 수고했어요!"
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
        "title": "끝말잇기",
        "content": "\"끝말잇기를 어디까지 이어 본 적 있나요?\" 말놀이를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_last",
        "type": "tip",
        "icon": "🧩",
        "title": "재미있게 복습",
        "content": "끝말잇기로 단원 낱말을 재미있게 복습하게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_last2",
        "type": "fun_question",
        "icon": "🔤",
        "title": "어디까지?",
        "content": "\"끝말잇기를 길게 이으려면 어떻게 할까요?\" 전략을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_last",
        "type": "real_world",
        "icon": "🌍",
        "title": "끝말잇기 경험",
        "content": "가족·친구와 끝말잇기를 한 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_last2",
        "type": "tip",
        "icon": "🧩",
        "title": "끝 글자 받기",
        "content": "끝 글자로 시작하는 낱말을 떠올리는 규칙을 익히게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_last",
        "type": "misconception",
        "icon": "❓",
        "title": "막혀도 괜찮아",
        "content": "이을 낱말이 막혀도 괜찮아요. 함께 도와 가며 즐기게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_last3",
        "type": "fun_question",
        "icon": "💡",
        "title": "다음 낱말은?",
        "content": "\"이 다음에 어떤 낱말을 이을까요?\" 함께 떠올려요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_last",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "앞 낱말 ↔ 이은 낱말 짝짓기",
        "description": "앞 낱말과 끝말로 이은 낱말을 짝지어 보세요.",
        "hint": "끝 글자를 받아요.",
        "pairs": [
          {
            "a": {
              "text": "사과"
            },
            "b": {
              "text": "과일"
            }
          },
          {
            "a": {
              "text": "과일"
            },
            "b": {
              "text": "일기"
            }
          },
          {
            "a": {
              "text": "나무"
            },
            "b": {
              "text": "무지개"
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
        "content": "\"배운 낱말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect15",
        "type": "fun_question",
        "icon": "💡",
        "title": "단원 마무리",
        "content": "\"2단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_end",
        "type": "extension",
        "icon": "⬆",
        "title": "즐기는 독자",
        "content": "\"방학에 읽고 싶은 책이 있나요?\" 즐겨 읽는 마음을 이어 가요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

})();
