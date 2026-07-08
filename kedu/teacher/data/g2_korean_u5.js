/* ============================================================================
   2학년 1학기 국어 5단원 「마음을 짐작해요」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u5_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (나) 152~183 / 14차시.
   - 단원 목표: 다른 사람 마음 짐작하며 의미 드러나게 띄어 읽기. 역량 의사소통(배려·공감).
   - 성취기준 [2국02-04](인물 마음 짐작·자신과 비교)·[2국02-02](알맞게 띄어 읽기)·[2국04-02](소리≠표기).
   ★ 저작권: 지도서 제재 전부 미게재. 특히 「밤 다섯 개」(권정생) 절대 인용 금지.
      「자전거 타기 성공!」·「강아지 돌보기」·예린이 편지·「세상에서 가장 힘이 센 말」·「여우와 두루미」 미게재.
      마음 나타내는 말·헷갈리기 쉬운 낱말은 표준어 자체 구성, 짧은 글은 보편 소재(줄넘기·전학·숲속 동물) 자체 창작.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 마음을 짐작해요 ---------------- */
  window.LESSONS["u5_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 1,
      "title": "단원 도입 — 마음을 짐작해요",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 표정·행동으로 마음 알기 → 마음 짐작이란 → 상황 속 마음 고르기 → 마음 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 짐작해요",
          "subtitle": "5단원 · 1/14차시 · 단원 도입"
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
            "표정·행동으로 마음을 알 수 있음을 느껴요",
            "마음을 짐작한다는 것을 알아봐요",
            "상황 속 마음을 짐작해 봐요"
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
          "scene_title": "표정만 봐도 알아요 😊",
          "visual": "😊",
          "question": "친구가 활짝 웃고 있어요. 친구는 어떤 마음일까요?<br>말하지 않아도 마음을 알 수 있을까요?",
          "img": "assets/photo/korean/g2u5_mind_intro.jpg"
        },
        "suggested_extras": [
          "q_face",
          "r_life"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "마음을 짐작하기",
          "content": "사람의 마음은 **말·행동·표정·상황**으로 짐작할 수 있어요. 웃으면 **기쁜** 마음, 고개를 숙이면 **속상한** 마음이지요. 마음을 헤아리면 친구를 더 잘 **이해하고 배려**할 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "웃는 표정",
              "meaning": "기쁘고 즐거운 마음"
            },
            {
              "symbol": "고개 숙임",
              "meaning": "속상하거나 부끄러운 마음"
            },
            {
              "symbol": "폴짝폴짝",
              "meaning": "신나는 마음"
            },
            {
              "symbol": "눈물",
              "meaning": "슬프거나 속상한 마음"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_sure"
        ],
        "tnote": {
          "ask": [
            "말하지 않아도 마음을 알 수 있을까?"
          ],
          "watch": "마음 짐작 감각 열기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이때 어떤 마음일까요? 💭",
          "sub": "상황을 보고 마음을 짐작해 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "상을 받고 두 손을 번쩍 들었어요.",
              "emoji": "🏆",
              "name": "기쁘고 뿌듯한 마음"
            },
            {
              "clue": "넘어져서 고개를 숙이고 있어요.",
              "emoji": "😔",
              "name": "아프고 속상한 마음"
            },
            {
              "clue": "친구가 다가오자 빙긋 웃어요.",
              "emoji": "😊",
              "name": "반갑고 좋은 마음"
            }
          ],
          "outro": "말·행동·표정으로 마음을 짐작할 수 있어요. 마음을 헤아려 볼까요? 😊"
        },
        "suggested_extras": [
          "q_why",
          "g_mood"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "마음을 나눠요",
          "question": "마음을 짐작해 본 적이 있나요?",
          "items": [
            "친구의 마음을 알아챈 적이 있나요?",
            "무엇을 보고 그 마음을 알았나요?",
            "마음을 알아주니 어땠나요?"
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
          "title": "마음을 짐작하며 느끼기",
          "levels": {
            "읽기": {
              "q": "'참 기뻐요'와 '많이 속상해요'를 마음을 담아 읽어 볼까요?",
              "a": "참 기뻐요 / 많이 속상해요"
            },
            "쓰기": {
              "q": "지금 내 마음을 나타내는 말을 하나 써 볼까요?",
              "a": "여러 답 (예: 즐겁다·설레다·심심하다)",
              "open": true
            },
            "말하기": {
              "q": "친구의 표정을 보고 어떤 마음일지 짝에게 말해 봐요.",
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
          "title": "표정 보고 마음 맞히기 짝 놀이",
          "type": "pair",
          "goal": "표정으로 마음을 짐작해요",
          "body": "짝이 표정을 지으면 어떤 마음인지 맞히고, 번갈아 해요.",
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
              "q": "마음은 무엇으로 짐작하나요?",
              "a": "말·행동·표정·상황"
            },
            {
              "q": "웃는 표정은 어떤 마음인가요?",
              "a": "기쁜 마음"
            },
            {
              "q": "마음을 헤아리면?",
              "a": "친구를 더 잘 이해·배려해요"
            }
          ],
          "self": [
            "마음을 짐작할 수 있어요",
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
            "표정·행동으로 마음을 알 수 있음을 느꼈어요",
            "마음을 짐작한다는 것을 알았어요",
            "상황 속 마음을 짐작했어요"
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
          "preview": "인물의 마음을 짐작해요",
          "body": "다음 시간에는 글 속 인물의 말과 행동으로 마음을 짐작해 볼 거예요!"
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
        "title": "표정 읽기",
        "content": "\"친구 표정만 보고 기분을 알아챈 적 있나요?\" 마음 짐작을 열어요.",
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
        "content": "이 단원은 '마음 짐작 + 헷갈리기 쉬운 낱말 + 자연스럽게 띄어 읽기'예요. 도입에선 마음 헤아리기를 열어 주세요.",
        "fit_slides": [
          "objective",
          "cover"
        ]
      },
      {
        "id": "q_face",
        "type": "fun_question",
        "icon": "😊",
        "title": "어떤 마음",
        "content": "\"웃는 친구는 어떤 마음일까요?\" 마음을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_life",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 교실",
        "content": "교실에서 친구의 표정·행동으로 마음을 알아챈 상황과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "말·행동·상황",
        "content": "마음은 말·행동·표정·상황으로 짐작함을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_sure",
        "type": "misconception",
        "icon": "❓",
        "title": "단정 짓지 않기",
        "content": "표정만으로 단정 짓지 말고 \"~인 것 같다\"처럼 짐작하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_why",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 그 마음?",
        "content": "\"무엇을 보고 그렇게 짐작했나요?\" 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mood",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 마음 짝짓기",
        "description": "상황과 마음을 짝지어 보세요.",
        "hint": "표정·행동을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🏆 상 받음"
            },
            "b": {
              "text": "뿌듯한 마음"
            }
          },
          {
            "a": {
              "text": "😔 넘어짐"
            },
            "b": {
              "text": "속상한 마음"
            }
          },
          {
            "a": {
              "text": "😊 친구 만남"
            },
            "b": {
              "text": "반가운 마음"
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
        "title": "경험과 잇기",
        "content": "마음을 알아챈 경험을 까닭과 함께 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 낱말",
        "content": "\"마음을 나타내는 말을 떠올려 볼까요? (기쁘다·속상하다)\" 어휘를 넓혀요.",
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
        "content": "\"마음은 무엇으로 짐작하죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "인물 마음 예고",
        "content": "\"다음엔 글 속 인물의 마음을 짐작해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 2,
      "title": "띄어 읽으면 뜻이 잘 드러나요",
      "std": "[2국02-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 붙여 읽으면 어려워요 → 띄어 읽기란 → 바른 띄어 읽기 고르기 → 띄어 읽어 보기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "띄어 읽으면 뜻이 잘 드러나요",
          "subtitle": "5단원 · 2/14차시 · 준비"
        },
        "suggested_extras": [
          "q_space",
          "t_space"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "붙여 읽으면 왜 어려운지 느껴요",
            "띄어 읽기가 무엇인지 알아봐요",
            "뜻이 드러나게 띄어 읽어요"
          ]
        },
        "suggested_extras": [
          "t_space"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "어디서 쉴까요? ✂️",
          "visual": "📖",
          "question": "\"아빠가방에들어가신다\"를 어떻게 읽느냐에 따라<br>뜻이 달라져요. 어떻게 읽어야 할까요?",
          "img": "assets/photo/korean/g2u5_spacing.jpg"
        },
        "suggested_extras": [
          "q_mean",
          "r_space"
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
              "q": "마음은 무엇으로 짐작하나요?",
              "a": "말·행동·표정·상황"
            },
            {
              "q": "웃는 표정은 어떤 마음인가요?",
              "a": "기쁜 마음"
            }
          ],
          "from": "u5_l01"
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
          "title": "뜻이 드러나게 띄어 읽기",
          "content": "문장을 읽을 때 **뜻이 통하는 덩어리**로 살짝 쉬어 읽어요. \"아빠가 / 방에 / 들어가신다\"처럼 쉬면 뜻이 잘 드러나요. **누가(무엇이)** 뒤와 **문장 사이**에서 쉬면 좋아요!",
          "symbol_meanings": [
            {
              "symbol": "누가 뒤에서",
              "meaning": "\"아빠가 /\""
            },
            {
              "symbol": "무엇을 뒤에서",
              "meaning": "\"밥을 /\""
            },
            {
              "symbol": "문장 사이에서",
              "meaning": "한 문장이 끝나면"
            },
            {
              "symbol": "덩어리로",
              "meaning": "뜻이 통하게"
            }
          ]
        },
        "suggested_extras": [
          "t_space2",
          "x_space"
        ],
        "tnote": {
          "ask": [
            "왜 띄어 읽어야 할까?"
          ],
          "watch": "띄어 읽기 필요성",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바르게 띄어 읽은 것은? ✅",
          "sub": "뜻이 잘 드러나게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"동생이 우유를 마신다\"를 띄어 읽으면?",
              "emoji": "🥛",
              "name": "\"동생이 / 우유를 / 마신다\""
            },
            {
              "clue": "\"하늘에 무지개가 떴다\"를 띄어 읽으면?",
              "emoji": "🌈",
              "name": "\"하늘에 / 무지개가 / 떴다\""
            },
            {
              "clue": "이렇게 읽으면 뜻을 알기 어려워요!",
              "emoji": "🙅",
              "name": "\"동생이우유를마신다\" (다 붙여 읽기)"
            }
          ],
          "outro": "덩어리로 띄어 읽으니 뜻이 잘 드러나요. 직접 읽어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_space2",
          "g_space"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "띄어 읽어 봐요",
          "question": "문장을 뜻이 드러나게 띄어 읽어 볼까요?",
          "items": [
            "어디서 쉬어 읽으면 좋을까요?",
            "누가·무엇을 뒤에서 쉬어 봤나요?",
            "띄어 읽으니 뜻이 잘 드러나나요?"
          ]
        },
        "suggested_extras": [
          "t_present2",
          "e_space2"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "뜻이 드러나게 띄어 읽기",
          "levels": {
            "읽기": {
              "q": "'아기다람쥐가나무에올라가요'를 알맞게 띄어 읽어 볼까요?",
              "a": "아기 다람쥐가 / 나무에 올라가요"
            },
            "쓰기": {
              "q": "위 문장을 낱말 사이를 띄어 바르게 옮겨 써 볼까요?",
              "a": "아기 다람쥐가 나무에 올라가요"
            },
            "말하기": {
              "q": "띄어 읽으면 무엇이 좋은지 짝에게 말해 봐요.",
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
          "title": "문장 띄어 읽기 짝 활동",
          "type": "pair",
          "goal": "뜻이 드러나게 띄어 읽어요",
          "body": "짝과 같은 문장을 띄어 읽고, 어디서 띄어 읽었는지 이야기해요.",
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
              "q": "왜 띄어 읽나요?",
              "a": "뜻이 잘 드러나요"
            },
            {
              "q": "어디에서 띄어 읽나요?",
              "a": "낱말·구절 사이"
            },
            {
              "q": "띄어 읽으면 듣는 사람은?",
              "a": "뜻을 잘 알아요"
            }
          ],
          "self": [
            "뜻이 드러나게 띄어 읽어요",
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
            "붙여 읽으면 어려운 까닭을 느꼈어요",
            "띄어 읽기가 무엇인지 알았어요",
            "뜻이 드러나게 띄어 읽었어요"
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
          "preview": "인물의 마음을 짐작해요",
          "body": "다음 시간에는 글 속 인물의 말과 행동으로 마음을 짐작해 볼 거예요!"
        },
        "suggested_extras": [
          "e_mind2"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_space",
        "type": "fun_question",
        "icon": "💡",
        "title": "쉬어 읽기",
        "content": "\"글을 읽을 때 어디서 쉬나요?\" 띄어 읽기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_space",
        "type": "tip",
        "icon": "🧩",
        "title": "덩어리로 쉬기",
        "content": "뜻이 통하는 덩어리로 살짝 쉬어 읽게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_mean",
        "type": "fun_question",
        "icon": "📖",
        "title": "뜻이 달라져요",
        "content": "\"어떻게 띄어 읽느냐에 따라 뜻이 어떻게 달라질까요?\" 띄어 읽기의 힘을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_space",
        "type": "real_world",
        "icon": "🌍",
        "title": "읽어 주기",
        "content": "책을 읽어 줄 때 자연스럽게 쉬는 부분과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_space2",
        "type": "tip",
        "icon": "🧩",
        "title": "누가 뒤·문장 사이",
        "content": "'누가(무엇이)' 뒤와 문장 사이에서 쉬면 좋음을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_space",
        "type": "misconception",
        "icon": "❓",
        "title": "다 끊거나 다 붙이기 주의",
        "content": "낱말마다 다 끊거나 다 붙이면 어색해요. 알맞게 쉬게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_space2",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 잘 들릴까",
        "content": "\"왜 띄어 읽으면 더 잘 들릴까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_space",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "문장 ↔ 띄어 읽기 짝짓기",
        "description": "문장과 알맞은 띄어 읽기를 짝지어 보세요.",
        "hint": "뜻이 드러나게 쉬어요.",
        "pairs": [
          {
            "a": {
              "text": "🥛 우유 마신다"
            },
            "b": {
              "text": "동생이 / 우유를 / 마신다"
            }
          },
          {
            "a": {
              "text": "🌈 무지개"
            },
            "b": {
              "text": "하늘에 / 무지개가 / 떴다"
            }
          },
          {
            "a": {
              "text": "🙅 다 붙임"
            },
            "b": {
              "text": "뜻 알기 어려움"
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
        "title": "소리 내어",
        "content": "문장을 소리 내어 띄어 읽으며 뜻이 드러나는지 느끼게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_space2",
        "type": "extension",
        "icon": "⬆",
        "title": "긴 문장도",
        "content": "\"더 긴 문장은 어디서 쉴까요?\" 띄어 읽기를 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect2",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"문장은 어디서 쉬어 읽죠?\" 누가 뒤·문장 사이를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_mind2",
        "type": "extension",
        "icon": "⬆",
        "title": "인물 마음 예고",
        "content": "\"다음엔 인물의 마음을 짐작해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 3,
      "title": "인물의 마음을 짐작해요 ①",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 자체 「줄넘기 성공」 → 말·행동으로 마음 → 마음 드러난 말 모으기 → 자신과 비교 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인물의 마음을 짐작해요",
          "subtitle": "5단원 · 3/14차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_story3",
          "t_mind3"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "인물의 말과 행동을 살펴봐요",
            "인물의 마음을 짐작해요",
            "인물과 내 마음을 비교해요"
          ]
        },
        "suggested_extras": [
          "t_mind3"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "드디어 성공했어요! 🤸",
          "visual": "🤸",
          "question": "줄넘기가 자꾸 걸리던 지호가 드디어 열 번을 넘었어요.<br>지호는 어떤 마음일까요?",
          "img": "assets/photo/korean/g2u5_infer1.jpg"
        },
        "suggested_extras": [
          "q_jiho",
          "r_mind3"
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
              "q": "왜 띄어 읽나요?",
              "a": "뜻이 잘 드러나요"
            },
            {
              "q": "어디에서 띄어 읽나요?",
              "a": "낱말·구절 사이"
            }
          ],
          "from": "u5_l02"
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
          "title": "말·행동으로 마음 짐작",
          "content": "인물의 마음은 **말과 행동**으로 짐작해요. 지호가 \"드디어 됐다!\" 하며 **두 손을 번쩍** 들었다면 **기쁘고 뿌듯한** 마음이에요. 마음이 드러난 말과 행동을 찾아봐요!",
          "symbol_meanings": [
            {
              "symbol": "\"드디어 됐다!\"",
              "meaning": "기쁨이 담긴 말"
            },
            {
              "symbol": "두 손 번쩍",
              "meaning": "뿌듯한 행동"
            },
            {
              "symbol": "활짝 웃음",
              "meaning": "즐거운 표정"
            },
            {
              "symbol": "마음 짐작",
              "meaning": "기쁘고 뿌듯한 마음"
            }
          ]
        },
        "suggested_extras": [
          "t_mind3b",
          "x_mind3"
        ],
        "tnote": {
          "ask": [
            "무엇을 보고 인물의 마음을 알 수 있을까?"
          ],
          "watch": "근거 들어 마음 짐작",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 말·행동은 어떤 마음? 💭",
          "sub": "인물의 말·행동에서 마음을 짐작해 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "\"드디어 됐다!\" 하며 두 손을 번쩍 들었어요.",
              "emoji": "🙌",
              "name": "기쁘고 뿌듯한 마음"
            },
            {
              "clue": "고개를 푹 숙이고 작게 \"미안해\" 했어요.",
              "emoji": "😔",
              "name": "미안하고 속상한 마음"
            },
            {
              "clue": "눈을 동그랗게 뜨고 \"와, 진짜?\" 했어요.",
              "emoji": "😲",
              "name": "놀랍고 신기한 마음"
            }
          ],
          "outro": "말과 행동을 보면 마음이 보여요. 내 마음과 비교해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_why3",
          "g_mind3"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "인물과 내 마음을 비교해요",
          "question": "인물과 비슷한 경험이 있나요?",
          "items": [
            "나도 무언가를 처음 성공한 적이 있나요?",
            "그때 내 마음은 어땠나요?",
            "인물의 마음과 비슷한가요?"
          ]
        },
        "suggested_extras": [
          "t_present3",
          "e_compare3"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인물의 마음을 짐작해요 ①",
          "levels": {
            "읽기": {
              "q": "'전학 온 친구가 혼자 앉아 창밖을 보았어요.' 이 친구의 마음을 짐작해 읽어 볼까요?",
              "a": "외롭고 낯선 마음"
            },
            "쓰기": {
              "q": "이 친구에게 어떤 말을 건네면 좋을지 한 문장 써 볼까요?",
              "a": "여러 답 (예: 같이 놀자)",
              "open": true
            },
            "말하기": {
              "q": "무엇을 보고 그 마음을 짐작했는지 말해 봐요.",
              "a": "혼자 앉음·창밖을 봄 등"
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
          "title": "상황 속 마음 짐작 짝 활동",
          "type": "pair",
          "goal": "까닭을 들어 마음을 짐작해요",
          "body": "짝이 상황을 말하면 인물의 마음을 짐작하고, 무엇을 보고 알았는지 이야기해요.",
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
              "q": "인물의 마음은 무엇으로 짐작하나요?",
              "a": "말·행동·상황"
            },
            {
              "q": "혼자 앉아 있으면 어떤 마음일까요?",
              "a": "외롭거나 낯선 마음"
            },
            {
              "q": "마음을 짐작할 때는?",
              "a": "까닭을 들어요"
            }
          ],
          "self": [
            "인물의 마음을 짐작할 수 있어요",
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
            "인물의 말과 행동을 살펴봤어요",
            "인물의 마음을 짐작했어요",
            "인물과 내 마음을 비교했어요"
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
          "preview": "마음을 더 깊이 짐작해요",
          "body": "다음 시간에는 인물의 마음을 더 깊이 짐작하며 비슷한 경험을 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_mind3"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_story3",
        "type": "fun_question",
        "icon": "💡",
        "title": "성공 경험",
        "content": "\"무언가를 처음 해냈을 때 기분이 어땠나요?\" 이야기와 경험을 이어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_mind3",
        "type": "tip",
        "icon": "🧩",
        "title": "말·행동 찾기",
        "content": "마음이 드러난 말과 행동을 찾아 짐작하게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_jiho",
        "type": "fun_question",
        "icon": "🤸",
        "title": "어떤 마음",
        "content": "\"여러분이 지호라면 어떤 마음일까요?\" 인물에 몰입하게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_mind3",
        "type": "real_world",
        "icon": "🌍",
        "title": "내 성공",
        "content": "줄넘기·자전거 등 처음 성공한 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_mind3b",
        "type": "tip",
        "icon": "🧩",
        "title": "까닭과 함께",
        "content": "\"어떤 말·행동에서 그 마음을 알았는지\" 까닭을 짚게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_mind3",
        "type": "misconception",
        "icon": "❓",
        "title": "단정 짓지 않기",
        "content": "하나의 마음으로 단정 짓기보다 \"~인 것 같다\"처럼 짐작하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_why3",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 그 마음?",
        "content": "\"무엇을 보고 그렇게 짐작했나요?\" 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mind3",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "말·행동 ↔ 마음 짝짓기",
        "description": "말·행동과 마음을 짝지어 보세요.",
        "hint": "그 행동의 마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🙌 두 손 번쩍"
            },
            "b": {
              "text": "뿌듯한 마음"
            }
          },
          {
            "a": {
              "text": "😔 고개 숙임"
            },
            "b": {
              "text": "미안한 마음"
            }
          },
          {
            "a": {
              "text": "😲 눈 동그랗게"
            },
            "b": {
              "text": "놀란 마음"
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
        "title": "비교하며",
        "content": "인물의 마음과 자신의 경험을 비교해 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_compare3",
        "type": "extension",
        "icon": "⬆",
        "title": "다른 마음도",
        "content": "\"그 옆 친구는 어떤 마음이었을까요?\" 다른 인물 마음도 상상해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect3",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"인물의 마음을 무엇으로 짐작하죠?\" 말·행동을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_mind3",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 보기 예고",
        "content": "\"다음엔 마음을 더 깊이 짐작해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 4,
      "title": "인물의 마음을 짐작해요 ②",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 상황으로 마음 → 마음을 나타내는 말 → 상황↔마음 잇기 → 마음 말로 표현 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인물의 마음을 짐작해요",
          "subtitle": "5단원 · 4/14차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall4",
          "t_word4"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "상황으로도 마음을 짐작해요",
            "마음을 나타내는 말을 알아봐요",
            "마음을 말로 표현해요"
          ]
        },
        "suggested_extras": [
          "t_word4"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "상황을 보면 마음이 보여요 🌧️",
          "visual": "🌧️",
          "question": "소풍 가는 날 아침에 비가 내려요.<br>소풍을 기다리던 친구는 어떤 마음일까요?",
          "img": "assets/photo/korean/g2u5_infer2.jpg"
        },
        "suggested_extras": [
          "q_situ4",
          "r_word4"
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
              "q": "인물의 마음은 무엇으로 짐작하나요?",
              "a": "말·행동·상황"
            },
            {
              "q": "마음을 짐작할 때는?",
              "a": "까닭을 들어요"
            }
          ],
          "from": "u5_l03"
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
          "title": "상황과 마음을 나타내는 말",
          "content": "마음은 **상황**으로도 짐작할 수 있어요. 기다리던 소풍이 비로 미뤄지면 **아쉽고 속상한** 마음이지요. 마음을 나타내는 말에는 **기쁘다·속상하다·설레다·뿌듯하다·서운하다** 등이 있어요!",
          "symbol_meanings": [
            {
              "symbol": "설레다",
              "meaning": "기대되고 두근거려요"
            },
            {
              "symbol": "속상하다",
              "meaning": "마음이 상하고 안타까워요"
            },
            {
              "symbol": "서운하다",
              "meaning": "아쉽고 섭섭해요"
            },
            {
              "symbol": "뿌듯하다",
              "meaning": "흐뭇하고 자랑스러워요"
            }
          ]
        },
        "suggested_extras": [
          "t_word4b",
          "x_word4"
        ],
        "tnote": {
          "ask": [
            "나라면 어떤 마음이었을까?"
          ],
          "watch": "자신과 견주어 짐작",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 상황의 마음을 나타내는 말은? 💭",
          "sub": "상황에 어울리는 마음을 나타내는 말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "내일 현장 체험을 가요.",
              "emoji": "🚌",
              "name": "설레는 마음"
            },
            {
              "clue": "아끼던 물건을 잃어버렸어요.",
              "emoji": "😢",
              "name": "속상한 마음"
            },
            {
              "clue": "친구가 내 부탁을 들어주지 않았어요.",
              "emoji": "😞",
              "name": "서운한 마음"
            }
          ],
          "outro": "상황과 마음을 나타내는 말을 알면 마음을 잘 표현할 수 있어요! 😊"
        },
        "suggested_extras": [
          "q_word4c",
          "g_word4"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "마음을 말로 표현해요",
          "question": "내 마음을 마음을 나타내는 말로 표현해 볼까요?",
          "items": [
            "요즘 어떤 마음이 들었나요?",
            "그 마음을 어떤 말로 나타낼 수 있나요?",
            "왜 그런 마음이 들었나요?"
          ]
        },
        "suggested_extras": [
          "t_present4",
          "e_word4"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인물의 마음을 짐작해요 ②",
          "levels": {
            "읽기": {
              "q": "'줄넘기를 백 번 넘고 두 팔을 번쩍 들었어요.' 인물의 마음을 짐작해 읽어 볼까요?",
              "a": "기쁘고 뿌듯한 마음"
            },
            "쓰기": {
              "q": "내가 무언가를 해냈을 때의 마음을 나타내는 말을 써 볼까요?",
              "a": "여러 답 (예: 뿌듯하다·자랑스럽다)",
              "open": true
            },
            "말하기": {
              "q": "그 마음을 짐작한 까닭을 짝에게 말해 봐요.",
              "a": "두 팔을 번쩍 듦 등"
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
          "title": "나라면 어떤 마음일까 짝 활동",
          "type": "pair",
          "goal": "자신과 견주어 마음을 짐작해요",
          "body": "짝이 말한 상황에서 '나라면 어떤 마음일까'를 견주어 이야기해요.",
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
              "q": "해냈을 때는 어떤 마음일까요?",
              "a": "기쁘고 뿌듯한 마음"
            },
            {
              "q": "마음을 짐작할 때 자신과?",
              "a": "견주어 봐요"
            },
            {
              "q": "인물의 마음을 알면?",
              "a": "글이 더 잘 이해돼요"
            }
          ],
          "self": [
            "마음을 자신과 견주어 짐작해요",
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
            "상황으로도 마음을 짐작했어요",
            "마음을 나타내는 말을 알았어요",
            "마음을 말로 표현했어요"
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
          "preview": "마음 변화를 살피며 읽어요",
          "body": "다음 시간에는 시간 흐름에 따라 인물의 마음이 어떻게 변하는지 살피며 글을 읽어 볼 거예요!"
        },
        "suggested_extras": [
          "e_change4"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall4",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 마음",
        "content": "\"지난 시간에 짐작한 인물의 마음, 기억나나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_word4",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 낱말",
        "content": "마음을 나타내는 말을 풍부하게 익히면 마음을 잘 표현할 수 있어요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_situ4",
        "type": "fun_question",
        "icon": "🌧️",
        "title": "어떤 마음",
        "content": "\"소풍이 미뤄지면 어떤 마음일까요?\" 상황 속 마음을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_word4",
        "type": "real_world",
        "icon": "🌍",
        "title": "내 경험",
        "content": "기다리던 일이 미뤄져 아쉬웠던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_word4b",
        "type": "tip",
        "icon": "🧩",
        "title": "여러 마음 말",
        "content": "설레다·속상하다·서운하다 등 다양한 마음 말을 익히게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_word4",
        "type": "misconception",
        "icon": "❓",
        "title": "좋다·싫다만 아니라",
        "content": "\"좋다·싫다\"에 그치지 말고 구체적인 마음 말을 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_word4c",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 말?",
        "content": "\"이 마음을 또 어떤 말로 나타낼 수 있을까요?\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_word4",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 마음 말 짝짓기",
        "description": "상황과 마음을 나타내는 말을 짝지어 보세요.",
        "hint": "그 상황의 마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🚌 체험 학습"
            },
            "b": {
              "text": "설레다"
            }
          },
          {
            "a": {
              "text": "😢 잃어버림"
            },
            "b": {
              "text": "속상하다"
            }
          },
          {
            "a": {
              "text": "😞 부탁 거절"
            },
            "b": {
              "text": "서운하다"
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
        "title": "까닭과 함께",
        "content": "마음을 나타내는 말에 까닭을 더해 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_word4",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 말 모으기",
        "content": "\"우리 반 마음 말 사전을 만들면 어떤 말을 넣을까요?\" 어휘를 모아요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect4",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"마음은 무엇으로도 짐작하죠?\" 상황을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_change4",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 변화 예고",
        "content": "\"다음엔 마음 변화를 살피며 읽어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 5,
      "title": "마음을 짐작하며 글을 읽어요 ①",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 자체 「전학 온 친구」 → 시간 흐름 마음 변화 → 장면↔마음 잇기 → 마음 변화 말하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 짐작하며 글을 읽어요",
          "subtitle": "5단원 · 5/14차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_new5",
          "t_change5"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "글 속 인물의 마음을 짐작해요",
            "시간에 따라 마음이 변함을 알아봐요",
            "마음 변화를 말해 봐요"
          ]
        },
        "suggested_extras": [
          "t_change5"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "전학 온 첫날 🏫",
          "visual": "🏫",
          "question": "새 학교로 전학 온 다은이는 처음엔 낯설고 떨렸어요.<br>시간이 지나면 마음이 어떻게 변할까요?",
          "img": "assets/photo/korean/g2u5_read1.jpg"
        },
        "suggested_extras": [
          "q_daeun",
          "r_change5"
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
              "q": "해냈을 때는 어떤 마음일까요?",
              "a": "기쁘고 뿌듯한 마음"
            },
            {
              "q": "마음을 짐작할 때 자신과?",
              "a": "견주어 봐요"
            }
          ],
          "from": "u5_l04"
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
          "title": "시간에 따라 변하는 마음",
          "content": "인물의 마음은 **시간이 지나며 변해요**. 전학 온 다은이는 처음엔 **낯설고 떨리는** 마음이었지만, 친구가 다가와 함께 놀자 **반갑고 즐거운** 마음으로 변했어요. 장면마다 마음을 짐작해 봐요!",
          "symbol_meanings": [
            {
              "symbol": "처음",
              "meaning": "낯설고 떨리는 마음"
            },
            {
              "symbol": "친구가 다가옴",
              "meaning": "고맙고 반가운 마음"
            },
            {
              "symbol": "함께 놂",
              "meaning": "즐겁고 편안한 마음"
            },
            {
              "symbol": "마음 변화",
              "meaning": "시간에 따라 달라져요"
            }
          ]
        },
        "suggested_extras": [
          "t_change5b",
          "x_change5"
        ],
        "tnote": {
          "ask": [
            "마음을 알면 어떻게 읽게 될까?"
          ],
          "watch": "마음 담아 읽기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 장면의 마음은? 💭",
          "sub": "「전학 온 친구」 장면 속 마음을 짐작해 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "교실 문 앞에서 머뭇거리는 다은이",
              "emoji": "😟",
              "name": "낯설고 떨리는 마음"
            },
            {
              "clue": "\"같이 놀자!\" 하며 손 내미는 친구를 본 다은이",
              "emoji": "🤝",
              "name": "고맙고 반가운 마음"
            },
            {
              "clue": "친구들과 함께 웃으며 노는 다은이",
              "emoji": "😄",
              "name": "즐겁고 편안한 마음"
            }
          ],
          "outro": "시간이 지나며 마음이 변했어요. 마음 변화를 따라가 볼까요? 😊"
        },
        "suggested_extras": [
          "q_why5",
          "g_change5"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "마음 변화를 말해요",
          "question": "다은이의 마음이 어떻게 변했나요?",
          "items": [
            "처음 다은이의 마음은 어땠나요?",
            "무엇 때문에 마음이 변했나요?",
            "나도 비슷한 경험이 있나요?"
          ]
        },
        "suggested_extras": [
          "t_present5",
          "e_change5"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "마음을 짐작하며 글을 읽어요 ①",
          "levels": {
            "읽기": {
              "q": "'비가 와서 소풍이 미뤄졌어요.' 인물의 마음을 짐작해 알맞은 목소리로 읽어 볼까요?",
              "a": "아쉽고 속상한 마음"
            },
            "쓰기": {
              "q": "이 장면에 어울리는 마음을 나타내는 말을 써 볼까요?",
              "a": "여러 답 (예: 아쉽다·서운하다)",
              "open": true
            },
            "말하기": {
              "q": "마음을 짐작하며 읽으면 무엇이 좋은지 말해 봐요.",
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
          "title": "마음 담아 읽기 짝 활동",
          "type": "pair",
          "goal": "마음을 짐작해 목소리를 바꿔요",
          "body": "짝과 같은 문장을 인물의 마음에 맞는 목소리로 읽고, 어떻게 다른지 이야기해요.",
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
              "q": "소풍이 미뤄지면 어떤 마음일까요?",
              "a": "아쉽고 속상한 마음"
            },
            {
              "q": "마음을 짐작하며 읽으면?",
              "a": "실감 나게 읽어요"
            },
            {
              "q": "마음에 맞는 목소리를?",
              "a": "골라 읽어요"
            }
          ],
          "self": [
            "마음을 짐작하며 읽을 수 있어요",
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
            "글 속 인물의 마음을 짐작했어요",
            "시간에 따라 마음이 변함을 알았어요",
            "마음 변화를 말했어요"
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
          "preview": "마음을 짐작하며 더 읽어요",
          "body": "다음 시간에는 글을 더 읽으며 인물의 마음을 짐작하고 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_read5"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_new5",
        "type": "fun_question",
        "icon": "💡",
        "title": "새로운 시작",
        "content": "\"새 반·새 학교에서 처음 느낌이 어땠나요?\" 이야기와 경험을 이어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_change5",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 변화 따라가기",
        "content": "시간 흐름에 따라 마음이 어떻게 변하는지 따라가게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_daeun",
        "type": "fun_question",
        "icon": "🏫",
        "title": "어떻게 변할까",
        "content": "\"다은이의 마음은 어떻게 변할까요?\" 변화를 예상해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_change5",
        "type": "real_world",
        "icon": "🌍",
        "title": "낯선 첫날",
        "content": "전학·새 학기의 낯설던 첫날 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_change5b",
        "type": "tip",
        "icon": "🧩",
        "title": "장면마다",
        "content": "장면마다 마음을 짚으며 변화를 따라가게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_change5",
        "type": "misconception",
        "icon": "❓",
        "title": "마음은 변해요",
        "content": "마음이 처음부터 끝까지 같다고 보지 말고 변화를 살피게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_why5",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 변했을까",
        "content": "\"무엇 때문에 마음이 변했을까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_change5",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 마음 짝짓기",
        "description": "장면과 마음을 짝지어 보세요.",
        "hint": "시간 흐름을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "😟 문 앞"
            },
            "b": {
              "text": "떨리는 마음"
            }
          },
          {
            "a": {
              "text": "🤝 손 내밂"
            },
            "b": {
              "text": "반가운 마음"
            }
          },
          {
            "a": {
              "text": "😄 함께 놂"
            },
            "b": {
              "text": "즐거운 마음"
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
        "title": "변화 따라 말하기",
        "content": "처음→중간→끝 마음 변화를 차례로 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_change5",
        "type": "extension",
        "icon": "⬆",
        "title": "내가 다은이라면",
        "content": "\"내가 다은이라면 어떻게 했을까요?\" 인물에 몰입해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect5",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"마음은 무엇에 따라 변하죠?\" 시간 흐름을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read5",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 읽기 예고",
        "content": "\"다음엔 마음을 짐작하며 더 읽어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 6,
      "title": "마음을 짐작하며 글을 읽어요 ②",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 자체 「숲속 친구」 → 마음 짐작하며 읽기 → 마음 드러난 부분 모으기 → 마음 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 짐작하며 글을 읽어요",
          "subtitle": "5단원 · 6/14차시 · 소단원 1"
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
            "글을 읽으며 인물의 마음을 짐작해요",
            "마음이 드러난 부분을 찾아요",
            "인물의 마음을 나눠요"
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
          "scene_title": "숲속 친구들 이야기 🦊",
          "visual": "🦊",
          "question": "혼자 놀던 아기 여우에게 토끼가 \"같이 놀래?\" 하고 다가왔어요.<br>아기 여우의 마음은 어떻게 변할까요?",
          "img": "assets/photo/korean/g2u5_read2.jpg"
        },
        "suggested_extras": [
          "q_fox6",
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
              "q": "소풍이 미뤄지면 어떤 마음일까요?",
              "a": "아쉽고 속상한 마음"
            },
            {
              "q": "마음을 짐작하며 읽으면?",
              "a": "실감 나게 읽어요"
            }
          ],
          "from": "u5_l05"
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
          "title": "마음을 짐작하며 읽기",
          "content": "글을 읽을 땐 인물의 **말·행동·상황**을 살피며 마음을 짐작해요. 혼자였던 아기 여우는 **외로운** 마음이었지만, 친구가 다가오자 **반갑고 설레는** 마음으로 변했어요. 마음이 드러난 부분을 찾아봐요!",
          "symbol_meanings": [
            {
              "symbol": "혼자 놀던 여우",
              "meaning": "외롭고 쓸쓸한 마음"
            },
            {
              "symbol": "\"같이 놀래?\"",
              "meaning": "친구의 다정한 마음"
            },
            {
              "symbol": "눈이 반짝",
              "meaning": "반갑고 설레는 마음"
            },
            {
              "symbol": "함께 뛰놂",
              "meaning": "즐겁고 행복한 마음"
            }
          ]
        },
        "suggested_extras": [
          "t_read6b",
          "x_read6"
        ],
        "tnote": {
          "ask": [
            "내 경험과 이으면 마음이 더 잘 보일까?"
          ],
          "watch": "경험 이어 마음 읽기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "마음이 드러난 부분은? 💭",
          "sub": "인물의 마음이 드러난 부분을 골라 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "\"아무도 없네…\" 하며 혼자 앉아 있는 여우",
              "emoji": "🍂",
              "name": "외롭고 쓸쓸한 마음"
            },
            {
              "clue": "\"정말? 나랑?\" 하며 눈이 반짝인 여우",
              "emoji": "✨",
              "name": "반갑고 설레는 마음"
            },
            {
              "clue": "토끼와 손잡고 깡충깡충 뛰는 여우",
              "emoji": "🐰",
              "name": "즐겁고 행복한 마음"
            }
          ],
          "outro": "말과 행동에서 마음이 보여요. 인물의 마음을 나눠 볼까요? 😊"
        },
        "suggested_extras": [
          "q_why6",
          "g_read6"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "인물의 마음을 나눠요",
          "question": "아기 여우의 마음을 짐작해 볼까요?",
          "items": [
            "처음 아기 여우의 마음은 어땠나요?",
            "어떤 부분에서 그 마음을 알았나요?",
            "나도 비슷한 마음이 든 적이 있나요?"
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
          "title": "마음을 짐작하며 글을 읽어요 ②",
          "levels": {
            "읽기": {
              "q": "'친구가 내 그림을 보고 활짝 웃었어요.' 인물의 마음을 짐작해 읽어 볼까요?",
              "a": "기쁘고 흐뭇한 마음"
            },
            "쓰기": {
              "q": "칭찬을 들었을 때의 마음을 나타내는 말을 써 볼까요?",
              "a": "여러 답 (예: 기쁘다·설레다)",
              "open": true
            },
            "말하기": {
              "q": "글 속 인물과 비슷한 경험이 있는지 짝에게 말해 봐요.",
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
          "title": "마음 이어 말하기 짝 활동",
          "type": "pair",
          "goal": "인물의 마음을 이어 표현해요",
          "body": "짝이 글의 한 장면을 읽으면, 그 인물의 마음을 짐작해 한 마디로 이어 말해요.",
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
              "q": "칭찬을 들으면 어떤 마음일까요?",
              "a": "기쁘고 흐뭇한 마음"
            },
            {
              "q": "마음을 짐작하며 읽으면 글이?",
              "a": "더 잘 이해돼요"
            },
            {
              "q": "비슷한 경험을 떠올리면?",
              "a": "마음을 더 잘 알아요"
            }
          ],
          "self": [
            "마음을 짐작하며 글을 읽어요",
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
            "글을 읽으며 마음을 짐작했어요",
            "마음이 드러난 부분을 찾았어요",
            "인물의 마음을 나눴어요"
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
          "preview": "헷갈리기 쉬운 낱말을 알아봐요",
          "body": "다음 시간에는 소리는 비슷하지만 뜻이 다른 헷갈리기 쉬운 낱말을 알아볼 거예요!"
        },
        "suggested_extras": [
          "e_word6"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall6",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 마음 변화",
        "content": "\"지난 시간 다은이의 마음은 어떻게 변했나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_read6",
        "type": "tip",
        "icon": "🧩",
        "title": "살피며 읽기",
        "content": "말·행동·상황을 살피며 마음을 짐작하게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_fox6",
        "type": "fun_question",
        "icon": "🦊",
        "title": "어떤 마음",
        "content": "\"혼자 놀던 여우는 어떤 마음일까요?\" 인물에 몰입하게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_read6",
        "type": "real_world",
        "icon": "🌍",
        "title": "외로움·반가움",
        "content": "혼자라 외롭다가 친구가 다가와 반가웠던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_read6b",
        "type": "tip",
        "icon": "🧩",
        "title": "드러난 부분 찾기",
        "content": "마음이 드러난 말·행동을 찾아 까닭과 함께 말하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_read6",
        "type": "misconception",
        "icon": "❓",
        "title": "짐작은 까닭과 함께",
        "content": "마음을 짐작할 땐 글 속 까닭(말·행동)을 들어 말하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_why6",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 그 마음?",
        "content": "\"무엇을 보고 그렇게 짐작했나요?\" 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_read6",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 마음 짝짓기",
        "description": "장면과 마음을 짝지어 보세요.",
        "hint": "말·행동을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🍂 혼자 앉음"
            },
            "b": {
              "text": "외로운 마음"
            }
          },
          {
            "a": {
              "text": "✨ 눈 반짝"
            },
            "b": {
              "text": "설레는 마음"
            }
          },
          {
            "a": {
              "text": "🐰 함께 뜀"
            },
            "b": {
              "text": "행복한 마음"
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
        "title": "비교하며",
        "content": "인물의 마음을 자신의 경험과 비교해 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_read6",
        "type": "extension",
        "icon": "⬆",
        "title": "뒷이야기",
        "content": "\"두 친구는 그 뒤 어떻게 됐을까요?\" 뒷이야기를 상상해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect6",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"마음을 무엇으로 짐작했죠?\" 말·행동·상황을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_word6",
        "type": "extension",
        "icon": "⬆",
        "title": "낱말 예고",
        "content": "\"다음엔 헷갈리기 쉬운 낱말을 배워요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 7,
      "title": "헷갈리기 쉬운 낱말에 주의해요 ①",
      "std": "[2국04-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 소리 비슷 뜻 다른 낱말 → 문맥으로 구분 → 알맞은 낱말 고르기 → 낱말 따라 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "헷갈리기 쉬운 낱말에 주의해요",
          "subtitle": "5단원 · 7/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_word7",
          "t_word7"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "소리는 비슷하지만 뜻이 다른 낱말을 알아봐요",
            "문장에 알맞은 낱말을 골라요",
            "바르게 따라 써요"
          ]
        },
        "suggested_extras": [
          "t_word7"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "소리는 같은데 뜻이 달라요 🤔",
          "visual": "🤔",
          "question": "\"걸음\"과 \"거름\"은 소리가 비슷해요.<br>그런데 뜻이 전혀 다르대요. 무엇이 다를까요?",
          "img": "assets/photo/korean/g2u5_word1.jpg"
        },
        "suggested_extras": [
          "q_pair7",
          "r_word7"
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
              "q": "칭찬을 들으면 어떤 마음일까요?",
              "a": "기쁘고 흐뭇한 마음"
            },
            {
              "q": "마음을 짐작하며 읽으면 글이?",
              "a": "더 잘 이해돼요"
            }
          ],
          "from": "u5_l06"
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
          "title": "헷갈리기 쉬운 낱말",
          "content": "소리는 비슷하지만 **뜻이 다른** 낱말이 있어요. \"**걸음**\"은 걷는 것, \"**거름**\"은 식물을 키우는 흙이에요. **문장의 뜻**을 보고 알맞은 낱말을 골라 써야 해요!",
          "symbol_meanings": [
            {
              "symbol": "걸음",
              "meaning": "발을 옮겨 걷는 것"
            },
            {
              "symbol": "거름",
              "meaning": "식물을 잘 자라게 하는 흙"
            },
            {
              "symbol": "마치다",
              "meaning": "일을 끝내다"
            },
            {
              "symbol": "맞히다",
              "meaning": "정답을 맞게 하다"
            }
          ]
        },
        "suggested_extras": [
          "t_word7b",
          "x_word7"
        ],
        "tnote": {
          "ask": [
            "비슷해 보여도 뜻이 다른 낱말이 있을까?"
          ],
          "watch": "헷갈리는 낱말 구별(가르치다/가리키다·다르다/틀리다)",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "문장에 알맞은 낱말은? ✅",
          "sub": "문장의 뜻에 맞는 낱말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"텃밭에 ( )을 주었다\"에 알맞은 말은?",
              "emoji": "🌱",
              "name": "거름 (식물 키우는 흙)"
            },
            {
              "clue": "\"한 ( )씩 천천히 걸었다\"에 알맞은 말은?",
              "emoji": "👣",
              "name": "걸음 (걷는 것)"
            },
            {
              "clue": "\"숙제를 ( ) 놀러 갔다\"에 알맞은 말은?",
              "emoji": "✅",
              "name": "마치고 (끝내고)"
            }
          ],
          "outro": "문장의 뜻을 보면 알맞은 낱말을 고를 수 있어요. 바르게 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_word7c",
          "g_word7"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "바르게 따라 써요 ✍️",
          "content": "헷갈리기 쉬운 낱말을 또박또박 따라 써 봐요. 뜻을 생각하며 **걸음 · 거름 · 마치다**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "걸음",
              "meaning": "걷는 것"
            },
            {
              "symbol": "거름",
              "meaning": "식물 키우는 흙"
            },
            {
              "symbol": "마치다",
              "meaning": "끝내다"
            }
          ]
        },
        "suggested_extras": [
          "t_trace7",
          "e_word7"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "헷갈리기 쉬운 낱말에 주의해요 ①",
          "levels": {
            "읽기": {
              "q": "'가르치다'와 '가리키다'를 소리 내어 읽어 볼까요? 뜻이 어떻게 다를까요?",
              "a": "가르치다=알려 줌 / 가리키다=손으로 짚어 보임"
            },
            "쓰기": {
              "q": "'선생님이 글자를 (   ).'에 알맞은 낱말을 써 볼까요?",
              "a": "가르치다 → 가르쳐요"
            },
            "말하기": {
              "q": "'다르다'와 '틀리다'의 뜻 차이를 짝에게 말해 봐요.",
              "a": "다르다=같지 않다 / 틀리다=맞지 않다"
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
          "title": "알맞은 낱말 고르기 짝 활동",
          "type": "pair",
          "goal": "헷갈리는 낱말을 바르게 골라요",
          "body": "짝이 문장을 말하면 알맞은 낱말(가르치다/가리키다 등)을 골라 넣어 읽어 줘요.",
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
              "q": "'가르치다'의 뜻은?",
              "a": "알려 주다"
            },
            {
              "q": "'가리키다'의 뜻은?",
              "a": "손으로 짚어 보이다"
            },
            {
              "q": "'다르다'와 '틀리다'는?",
              "a": "뜻이 서로 달라요"
            }
          ],
          "self": [
            "헷갈리는 낱말을 바르게 써요",
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
            "소리는 비슷하지만 뜻이 다른 낱말을 알았어요",
            "문장에 알맞은 낱말을 골랐어요",
            "바르게 따라 썼어요"
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
          "preview": "헷갈리기 쉬운 낱말을 더 익혀요",
          "body": "다음 시간에는 헷갈리기 쉬운 낱말을 더 익히고 바르게 쓰는 연습을 할 거예요!"
        },
        "suggested_extras": [
          "e_word7b"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_word7",
        "type": "fun_question",
        "icon": "💡",
        "title": "비슷한 소리",
        "content": "\"소리가 비슷해 헷갈린 낱말이 있나요?\" 호기심을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_word7",
        "type": "tip",
        "icon": "🧩",
        "title": "문맥으로 구분",
        "content": "소리만 듣지 말고 문장의 뜻으로 낱말을 고르게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_pair7",
        "type": "fun_question",
        "icon": "🤔",
        "title": "무엇이 다를까",
        "content": "\"'걸음'과 '거름'은 뜻이 어떻게 다를까요?\" 차이를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_word7",
        "type": "real_world",
        "icon": "🌍",
        "title": "틀리기 쉬운 말",
        "content": "받아쓰기에서 헷갈린 낱말과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_word7b",
        "type": "tip",
        "icon": "🧩",
        "title": "뜻과 함께",
        "content": "낱말을 뜻과 함께 익히면 헷갈리지 않음을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_word7",
        "type": "misconception",
        "icon": "❓",
        "title": "소리만으로 쓰기 주의",
        "content": "소리만 듣고 아무거나 쓰지 말고 뜻을 보고 고르게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_word7c",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 이 낱말?",
        "content": "\"왜 이 낱말이 알맞을까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_word7",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 뜻 짝짓기",
        "description": "헷갈리기 쉬운 낱말과 뜻을 짝지어 보세요.",
        "hint": "뜻을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "👣 걸음"
            },
            "b": {
              "text": "걷는 것"
            }
          },
          {
            "a": {
              "text": "🌱 거름"
            },
            "b": {
              "text": "식물 키우는 흙"
            }
          },
          {
            "a": {
              "text": "✅ 마치다"
            },
            "b": {
              "text": "끝내다"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_trace7",
        "type": "tip",
        "icon": "✍️",
        "title": "뜻 생각하며",
        "content": "뜻을 생각하며 또박또박 쓰게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_word7",
        "type": "extension",
        "icon": "⬆",
        "title": "문장 만들기",
        "content": "\"'걸음'으로 짧은 문장을 만들어 볼까요?\" 활용해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect7",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"알맞은 낱말은 무엇으로 고르죠?\" 문맥을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_word7b",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 익히기 예고",
        "content": "\"다음엔 헷갈리기 쉬운 낱말을 더 익혀요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 8,
      "title": "헷갈리기 쉬운 낱말에 주의해요 ②",
      "std": "[2국04-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 더 많은 낱말 → 바르게 쓴 문장 → 바르게 쓴 문장 모으기 → 낱말 넣어 문장 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "헷갈리기 쉬운 낱말에 주의해요",
          "subtitle": "5단원 · 8/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_recall8",
          "t_more8"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "더 많은 헷갈리기 쉬운 낱말을 알아봐요",
            "바르게 쓴 문장을 찾아요",
            "낱말을 넣어 문장을 써요"
          ]
        },
        "suggested_extras": [
          "t_more8"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "이것도 헷갈려요! 🔤",
          "visual": "🔤",
          "question": "\"다치다\"와 \"닫히다\", \"반듯이\"와 \"반드시\"…<br>소리가 비슷한 낱말이 또 있어요. 어떻게 구분할까요?",
          "img": "assets/photo/korean/g2u5_word2.jpg"
        },
        "suggested_extras": [
          "q_pair8",
          "r_more8"
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
              "q": "'가르치다'의 뜻은?",
              "a": "알려 주다"
            },
            {
              "q": "'다르다'와 '틀리다'는?",
              "a": "뜻이 서로 달라요"
            }
          ],
          "from": "u5_l07"
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
          "title": "더 많은 헷갈리기 쉬운 낱말",
          "content": "\"**다치다**\"는 몸을 상하는 것, \"**닫히다**\"는 문이 닫히는 것이에요. \"**반듯이**\"는 곧고 바르게, \"**반드시**\"는 꼭이라는 뜻이지요. 뜻을 알면 바르게 쓸 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "다치다",
              "meaning": "몸을 상하다"
            },
            {
              "symbol": "닫히다",
              "meaning": "문이 닫히다"
            },
            {
              "symbol": "반듯이",
              "meaning": "곧고 바르게"
            },
            {
              "symbol": "반드시",
              "meaning": "꼭"
            }
          ]
        },
        "suggested_extras": [
          "t_more8b",
          "x_more8"
        ],
        "tnote": {
          "ask": [
            "소리가 비슷하면 어떻게 구별할까?"
          ],
          "watch": "헷갈리는 낱말 구별(바라다/바래다·잊다/잃다)",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바르게 쓴 문장은? ✅",
          "sub": "낱말을 바르게 쓴 문장을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "넘어져 무릎을 상한 일은?",
              "emoji": "🩹",
              "name": "\"무릎을 다쳤다\""
            },
            {
              "clue": "바람에 문이 닫힌 일은?",
              "emoji": "🚪",
              "name": "\"문이 닫혔다\""
            },
            {
              "clue": "꼭 약속을 지키겠다는 다짐은?",
              "emoji": "🤙",
              "name": "\"반드시 지키겠다\""
            }
          ],
          "outro": "뜻을 알면 바르게 쓸 수 있어요. 낱말을 넣어 문장을 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_more8c",
          "g_more8"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "낱말을 넣어 문장을 써요",
          "question": "헷갈리기 쉬운 낱말로 문장을 만들어 볼까요?",
          "items": [
            "어떤 낱말을 골랐나요?",
            "그 낱말의 뜻은 무엇인가요?",
            "문장을 만들어 말해 볼까요?"
          ]
        },
        "suggested_extras": [
          "t_present8",
          "e_more8"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "헷갈리기 쉬운 낱말에 주의해요 ②",
          "levels": {
            "읽기": {
              "q": "'바라다'와 '바래다'를 읽어 볼까요? '소원을 바라다'가 바른 표현이에요.",
              "a": "바라다=원하다 / 바래다=색이 옅어지다"
            },
            "쓰기": {
              "q": "'꼭 이기기를 (   ).'에 알맞은 낱말을 써 볼까요?",
              "a": "바라다 → 바라요"
            },
            "말하기": {
              "q": "'잊다'와 '잃다'의 뜻 차이를 짝에게 말해 봐요.",
              "a": "잊다=기억 못 함 / 잃다=물건이 없어짐"
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
          "title": "바른 낱말로 문장 만들기 짝 활동",
          "type": "pair",
          "goal": "헷갈리는 낱말로 바른 문장을 만들어요",
          "body": "짝과 헷갈리는 낱말을 하나 골라 바른 뜻으로 문장을 만들어 읽어 줘요.",
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
              "q": "'바라다'의 뜻은?",
              "a": "원하다"
            },
            {
              "q": "'잊다'와 '잃다'는?",
              "a": "뜻이 서로 달라요"
            },
            {
              "q": "헷갈리는 낱말은?",
              "a": "뜻을 생각해 골라요"
            }
          ],
          "self": [
            "헷갈리는 낱말을 바르게 골라 써요",
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
            "더 많은 헷갈리기 쉬운 낱말을 알았어요",
            "바르게 쓴 문장을 찾았어요",
            "낱말을 넣어 문장을 썼어요"
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
          "preview": "자연스럽게 띄어 읽어요",
          "body": "다음 시간에는 글을 자연스럽게 띄어 읽는 법을 배워 볼 거예요!"
        },
        "suggested_extras": [
          "e_space8"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall8",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 낱말",
        "content": "\"지난 시간에 배운 헷갈리기 쉬운 낱말이 기억나나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_more8",
        "type": "tip",
        "icon": "🧩",
        "title": "뜻으로 구분",
        "content": "낱말마다 뜻을 분명히 익혀 구분하게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_pair8",
        "type": "fun_question",
        "icon": "🔤",
        "title": "어떻게 구분?",
        "content": "\"'다치다'와 '닫히다'는 어떻게 구분할까요?\" 차이를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_more8",
        "type": "real_world",
        "icon": "🌍",
        "title": "자주 틀리는 말",
        "content": "자주 헷갈리는 낱말과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_more8b",
        "type": "tip",
        "icon": "🧩",
        "title": "뜻과 예문",
        "content": "낱말의 뜻과 짧은 예문을 함께 익히면 헷갈리지 않아요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_more8",
        "type": "misconception",
        "icon": "❓",
        "title": "소리만으로 쓰기 주의",
        "content": "소리만으로 쓰지 말고 뜻을 보고 바르게 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_more8c",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 이 낱말?",
        "content": "\"왜 이 낱말이 바른 표기일까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_more8",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 뜻 짝짓기",
        "description": "헷갈리기 쉬운 낱말과 뜻을 짝지어 보세요.",
        "hint": "뜻을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🩹 다치다"
            },
            "b": {
              "text": "몸을 상하다"
            }
          },
          {
            "a": {
              "text": "🚪 닫히다"
            },
            "b": {
              "text": "문이 닫히다"
            }
          },
          {
            "a": {
              "text": "🤙 반드시"
            },
            "b": {
              "text": "꼭"
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
        "title": "뜻과 함께",
        "content": "낱말을 넣어 만든 문장을 뜻과 함께 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more8",
        "type": "extension",
        "icon": "⬆",
        "title": "낱말 모으기",
        "content": "\"헷갈리기 쉬운 낱말을 더 모아 볼까요?\" 어휘를 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect8",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"헷갈리기 쉬운 낱말은 무엇으로 구분하죠?\" 뜻을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_space8",
        "type": "extension",
        "icon": "⬆",
        "title": "띄어 읽기 예고",
        "content": "\"다음엔 자연스럽게 띄어 읽어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 9,
      "title": "자연스럽게 띄어 읽어요 ①",
      "std": "[2국02-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 의미 단위로 쉬기 → 자연스러운 읽기 → 더 자연스러운 읽기 고르기 → 띄어 읽어 보기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "자연스럽게 띄어 읽어요",
          "subtitle": "5단원 · 9/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_space9",
          "t_space9"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "의미 단위로 쉬어 읽어요",
            "자연스럽게 띄어 읽는 법을 알아봐요",
            "글을 자연스럽게 읽어요"
          ]
        },
        "suggested_extras": [
          "t_space9"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "자연스럽게 읽어요 🌊",
          "visual": "📖",
          "question": "낱말마다 뚝뚝 끊어 읽으면 어색해요.<br>어떻게 읽으면 물 흐르듯 자연스러울까요?",
          "img": "assets/photo/korean/g2u5_pause1.jpg"
        },
        "suggested_extras": [
          "q_flow9",
          "r_space9"
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
              "q": "'바라다'의 뜻은?",
              "a": "원하다"
            },
            {
              "q": "헷갈리는 낱말은?",
              "a": "뜻을 생각해 골라요"
            }
          ],
          "from": "u5_l08"
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
          "title": "의미 단위로 자연스럽게",
          "content": "자연스럽게 읽으려면 **의미가 통하는 덩어리**로 쉬어요. 너무 자주 끊으면 어색하고, 안 끊으면 숨차요. \"작은 새가 / 나뭇가지에 / 앉았다\"처럼 알맞게 쉬면 자연스러워요!",
          "symbol_meanings": [
            {
              "symbol": "의미 덩어리",
              "meaning": "뜻이 통하는 묶음"
            },
            {
              "symbol": "너무 자주 끊기",
              "meaning": "어색해요"
            },
            {
              "symbol": "안 끊기",
              "meaning": "숨차고 알기 어려워요"
            },
            {
              "symbol": "알맞게 쉬기",
              "meaning": "물 흐르듯 자연스럽게"
            }
          ]
        },
        "suggested_extras": [
          "t_space9b",
          "x_space9"
        ],
        "tnote": {
          "ask": [
            "어디에서 쉬어 읽어야 자연스러울까?"
          ],
          "watch": "의미 단위 띄어 읽기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "더 자연스러운 읽기는? ✅",
          "sub": "자연스럽게 띄어 읽은 것을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"작은 새가 나뭇가지에 앉았다\"를 읽으면?",
              "emoji": "🐦",
              "name": "\"작은 새가 / 나뭇가지에 / 앉았다\""
            },
            {
              "clue": "이렇게 읽으면 어색해요!",
              "emoji": "🙅",
              "name": "\"작은 / 새 / 가 / 나뭇 / 가지에\" (낱말마다 뚝뚝)"
            },
            {
              "clue": "\"비가 와서 우산을 썼다\"를 읽으면?",
              "emoji": "☂️",
              "name": "\"비가 와서 / 우산을 썼다\""
            }
          ],
          "outro": "의미 덩어리로 쉬니 자연스러워요. 직접 읽어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_space9b",
          "g_space9"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "자연스럽게 읽어 봐요",
          "question": "글을 자연스럽게 띄어 읽어 볼까요?",
          "items": [
            "어디서 쉬면 자연스러울까요?",
            "너무 자주 끊지 않았나요?",
            "물 흐르듯 읽혔나요?"
          ]
        },
        "suggested_extras": [
          "t_present9",
          "e_space9"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "자연스럽게 띄어 읽어요 ①",
          "levels": {
            "읽기": {
              "q": "'나는 오늘 도서관에서 책을 읽었다.'를 자연스럽게 띄어 읽어 볼까요?",
              "a": "나는 / 오늘 도서관에서 / 책을 읽었다"
            },
            "쓰기": {
              "q": "띄어 읽을 곳에 빗금(/)을 그어 표시해 볼까요?",
              "a": "주어·장소·서술 사이에 / 표시"
            },
            "말하기": {
              "q": "너무 잘게 띄어 읽으면 어떤지 짝에게 말해 봐요.",
              "a": "뜻이 끊겨 어색해요"
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
          "title": "빗금 긋고 읽기 짝 활동",
          "type": "pair",
          "goal": "알맞은 곳에서 띄어 읽어요",
          "body": "짝과 같은 문장에 빗금을 긋고, 자연스럽게 띄어 읽어 서로 확인해요.",
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
              "q": "자연스럽게 띄어 읽으려면?",
              "a": "뜻 묶음으로 나눠요"
            },
            {
              "q": "너무 잘게 띄어 읽으면?",
              "a": "뜻이 끊겨 어색해요"
            },
            {
              "q": "띄어 읽을 곳은?",
              "a": "빗금으로 표시해요"
            }
          ],
          "self": [
            "자연스럽게 띄어 읽어요",
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
            "의미 단위로 쉬어 읽었어요",
            "자연스럽게 띄어 읽는 법을 알았어요",
            "글을 자연스럽게 읽었어요"
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
          "preview": "자연스럽게 더 읽어요",
          "body": "다음 시간에는 마음을 짐작하며 자연스럽게 띄어 읽는 연습을 할 거예요!"
        },
        "suggested_extras": [
          "e_space9"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_space9",
        "type": "fun_question",
        "icon": "💡",
        "title": "끊어 읽기",
        "content": "\"낱말마다 끊어 읽으면 어떤 느낌일까요?\" 띄어 읽기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_space9",
        "type": "tip",
        "icon": "🧩",
        "title": "의미 덩어리",
        "content": "의미가 통하는 덩어리로 쉬어 자연스럽게 읽게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_flow9",
        "type": "fun_question",
        "icon": "📖",
        "title": "자연스럽게",
        "content": "\"어떻게 읽으면 물 흐르듯 자연스러울까요?\" 읽기를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_space9",
        "type": "real_world",
        "icon": "🌍",
        "title": "읽어 주기",
        "content": "동화를 자연스럽게 읽어 준 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_space9b",
        "type": "tip",
        "icon": "🧩",
        "title": "알맞게 쉬기",
        "content": "너무 자주도 안 끊지도 않게 알맞게 쉬는 균형을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_space9",
        "type": "misconception",
        "icon": "❓",
        "title": "낱말마다 끊기 주의",
        "content": "낱말마다 뚝뚝 끊으면 어색해요. 의미 덩어리로 쉬게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_space9b",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 자연스러울까",
        "content": "\"왜 그렇게 읽으면 자연스러울까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_space9",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "문장 ↔ 자연스러운 읽기 짝짓기",
        "description": "문장과 자연스러운 띄어 읽기를 짝지어 보세요.",
        "hint": "의미 덩어리로 쉬어요.",
        "pairs": [
          {
            "a": {
              "text": "🐦 새가 앉았다"
            },
            "b": {
              "text": "작은 새가 / 나뭇가지에 / 앉았다"
            }
          },
          {
            "a": {
              "text": "☂️ 우산"
            },
            "b": {
              "text": "비가 와서 / 우산을 썼다"
            }
          },
          {
            "a": {
              "text": "🙅 낱말마다"
            },
            "b": {
              "text": "어색함"
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
        "title": "소리 내어",
        "content": "소리 내어 읽으며 자연스러운지 스스로 느끼게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_space9",
        "type": "extension",
        "icon": "⬆",
        "title": "긴 글도",
        "content": "\"더 긴 글은 어디서 쉴까요?\" 띄어 읽기를 넓혀요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect9",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"자연스럽게 읽으려면 어떻게 쉬죠?\" 의미 덩어리를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_space9",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 읽기 예고",
        "content": "\"다음엔 자연스럽게 더 읽어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l10"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 10,
      "title": "자연스럽게 띄어 읽어요 ②",
      "std": "[2국02-02] · [2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 마음 살려 읽기 → 자연스러운 방법 → 자연스러운 방법 모으기 → 마음 담아 읽기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "자연스럽게 띄어 읽어요",
          "subtitle": "5단원 · 10/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_recall10",
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
            "마음을 살려 자연스럽게 읽어요",
            "읽기 방법을 정리해요",
            "마음을 담아 글을 읽어요"
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
          "scene_title": "마음을 담아 읽어요 💗",
          "visual": "🎙️",
          "question": "인물이 기쁠 땐 밝게, 슬플 땐 차분하게 읽으면<br>글이 더 살아나요. 어떻게 읽으면 좋을까요?",
          "img": "assets/photo/korean/g2u5_pause2.jpg"
        },
        "suggested_extras": [
          "q_mind10",
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
              "q": "자연스럽게 띄어 읽으려면?",
              "a": "뜻 묶음으로 나눠요"
            },
            {
              "q": "너무 잘게 띄어 읽으면?",
              "a": "뜻이 끊겨 어색해요"
            }
          ],
          "from": "u5_l09"
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
          "title": "마음을 살려 읽기",
          "content": "자연스럽게 띄어 읽으면서 인물의 **마음**도 살려 읽어요. 기쁜 장면은 **밝게**, 슬픈 장면은 **차분하게** 읽으면 글이 살아나요. 알맞게 쉬고 마음을 담으면 **듣는 사람도** 잘 느껴요!",
          "symbol_meanings": [
            {
              "symbol": "알맞게 쉬기",
              "meaning": "의미 덩어리로"
            },
            {
              "symbol": "기쁜 장면",
              "meaning": "밝고 가볍게"
            },
            {
              "symbol": "슬픈 장면",
              "meaning": "차분하고 느리게"
            },
            {
              "symbol": "마음 담기",
              "meaning": "인물 마음을 살려"
            }
          ]
        },
        "suggested_extras": [
          "t_read10b",
          "x_read10"
        ],
        "tnote": {
          "ask": [
            "띄어 읽기와 마음을 함께 살리면 어떨까?"
          ],
          "watch": "띄어 읽기+마음 함께",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "자연스럽게 읽는 방법은? ✅",
          "sub": "자연스럽고 마음을 살린 읽기 방법을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "문장을 읽을 때는?",
              "emoji": "📖",
              "name": "의미 덩어리로 알맞게 쉬어요"
            },
            {
              "clue": "기쁜 장면을 읽을 때는?",
              "emoji": "😄",
              "name": "밝고 가볍게 읽어요"
            },
            {
              "clue": "슬픈 장면을 읽을 때는?",
              "emoji": "😢",
              "name": "차분하고 느리게 읽어요"
            }
          ],
          "outro": "알맞게 쉬고 마음을 담으니 글이 살아나요. 마음을 담아 읽어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_read10c",
          "g_read10"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "마음을 담아 읽어요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 인물의 마음을 살려 자연스럽게 글을 읽어 봐요!",
          "count": 24,
          "hint": "의미 덩어리로 쉬고, 기쁜 장면은 밝게·슬픈 장면은 차분하게 읽어요",
          "end_msg": "모두 마음을 담아 자연스럽게 읽었어요. 글이 살아났어요! 👏"
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
          "title": "자연스럽게 띄어 읽어요 ②",
          "levels": {
            "읽기": {
              "q": "'작은 새가 높은 하늘을 훨훨 날아갔다.'를 마음을 담아 띄어 읽어 볼까요?",
              "a": "작은 새가 / 높은 하늘을 / 훨훨 날아갔다"
            },
            "쓰기": {
              "q": "이 문장에서 느껴지는 마음을 나타내는 말을 써 볼까요?",
              "a": "여러 답 (예: 자유롭다·시원하다)",
              "open": true
            },
            "말하기": {
              "q": "띄어 읽기와 마음을 함께 살려 읽은 소감을 말해 봐요.",
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
          "title": "마음 담아 띄어 읽기 짝 활동",
          "type": "pair",
          "goal": "띄어 읽기와 마음을 함께 살려요",
          "body": "짝과 같은 문장을 마음을 담아 띄어 읽고, 어떤 느낌인지 이야기해요.",
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
              "q": "띄어 읽기와 마음을 함께 살리면?",
              "a": "더 실감 나게 읽어요"
            },
            {
              "q": "의미 단위로 나누면?",
              "a": "뜻이 잘 드러나요"
            },
            {
              "q": "자연스러운 띄어 읽기는?",
              "a": "연습으로 나아져요"
            }
          ],
          "self": [
            "마음을 담아 자연스럽게 읽어요",
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
            "마음을 살려 자연스럽게 읽었어요",
            "읽기 방법을 정리했어요",
            "마음을 담아 글을 읽었어요"
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
          "preview": "마음을 나타내는 말을 모아요",
          "body": "다음 시간에는 마음을 나타내는 말로 마음 사전을 만들어 볼 거예요!"
        },
        "suggested_extras": [
          "e_dict10"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall10",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 읽기",
        "content": "\"지난 시간에 자연스럽게 읽는 법을 배웠죠?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_read10",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 살려",
        "content": "띄어 읽기에 인물의 마음까지 담아 읽게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_mind10",
        "type": "fun_question",
        "icon": "🎙️",
        "title": "어떻게 읽을까",
        "content": "\"기쁜 장면은 어떻게 읽으면 좋을까요?\" 읽기를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_read10",
        "type": "real_world",
        "icon": "🌍",
        "title": "실감 나게",
        "content": "동화를 실감 나게 읽어 준 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_read10b",
        "type": "tip",
        "icon": "🧩",
        "title": "쉬기+마음",
        "content": "알맞게 쉬는 것과 마음을 담는 것을 함께 익히게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_read10",
        "type": "misconception",
        "icon": "❓",
        "title": "밋밋하게 읽지 않기",
        "content": "마음 없이 밋밋하게 읽지 말고 장면에 맞게 살려 읽게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_read10c",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 그렇게?",
        "content": "\"왜 슬픈 장면은 차분히 읽을까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_read10",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 읽는 방법 짝짓기",
        "description": "장면과 읽는 방법을 짝지어 보세요.",
        "hint": "마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "📖 문장"
            },
            "b": {
              "text": "의미 덩어리로"
            }
          },
          {
            "a": {
              "text": "😄 기쁜 장면"
            },
            "b": {
              "text": "밝고 가볍게"
            }
          },
          {
            "a": {
              "text": "😢 슬픈 장면"
            },
            "b": {
              "text": "차분하게"
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
        "content": "실감 나게 읽는 친구를 격려하고, 듣는 친구는 마음을 느끼게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_read10",
        "type": "extension",
        "icon": "⬆",
        "title": "역할 나눠",
        "content": "\"인물별로 나눠 읽으면 어떨까요?\" 읽기를 넓혀요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect10",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"자연스럽게 읽으며 무엇을 담죠?\" 마음을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_dict10",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 사전 예고",
        "content": "\"다음엔 마음 사전을 만들어요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l11"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 11,
      "title": "마음을 나타내는 말을 써요 ① (실천)",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 마음 사전이란 → 상황별 마음 말 → 경험↔마음 잇기 → 마음 사전 만들기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 나타내는 말을 써요",
          "subtitle": "5단원 · 11/14차시 · 실천"
        },
        "suggested_extras": [
          "q_dict11",
          "t_dict11"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "마음을 나타내는 말을 모아요",
            "상황과 마음을 관련지어요",
            "나만의 마음 사전을 만들어요"
          ]
        },
        "suggested_extras": [
          "t_dict11"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "마음을 모아 사전을 만들어요 📖",
          "visual": "📖",
          "question": "기쁘다·속상하다·설레다·뿌듯하다…<br>마음을 나타내는 말을 모으면 무엇이 좋을까요?",
          "img": "assets/photo/korean/g2u5_express1.jpg"
        },
        "suggested_extras": [
          "q_why11",
          "r_dict11"
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
              "q": "띄어 읽기와 마음을 함께 살리면?",
              "a": "더 실감 나게 읽어요"
            },
            {
              "q": "의미 단위로 나누면?",
              "a": "뜻이 잘 드러나요"
            }
          ],
          "from": "u5_l10"
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
          "title": "마음 사전 만들기",
          "content": "마음 사전은 **마음을 나타내는 말**과 그 말을 쓰는 **상황**을 모은 거예요. \"뿌듯하다 - 줄넘기를 처음 성공했을 때\"처럼요. 마음 말을 많이 알면 내 마음을 더 잘 **표현**할 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "마음 말",
              "meaning": "기쁘다·설레다·서운하다"
            },
            {
              "symbol": "어울리는 상황",
              "meaning": "언제 그런 마음일까"
            },
            {
              "symbol": "내 경험",
              "meaning": "나는 언제 그랬나"
            },
            {
              "symbol": "표현하기",
              "meaning": "마음을 잘 나타내요"
            }
          ]
        },
        "suggested_extras": [
          "t_dict11b",
          "x_dict11"
        ],
        "tnote": {
          "ask": [
            "마음을 말로 전하면 무엇이 달라질까?"
          ],
          "watch": "마음 나타내는 말 쓰기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 상황의 마음 말은? 💭",
          "sub": "상황에 어울리는 마음 말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "오랫동안 기다린 일이 이루어졌어요.",
              "emoji": "🎉",
              "name": "기쁘다·뿌듯하다"
            },
            {
              "clue": "친구가 약속을 잊어버렸어요.",
              "emoji": "😞",
              "name": "서운하다"
            },
            {
              "clue": "내일 좋아하는 곳에 가요.",
              "emoji": "😆",
              "name": "설레다"
            }
          ],
          "outro": "상황마다 어울리는 마음 말이 있어요. 마음 사전을 만들어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_dict11c",
          "g_dict11"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "마음 사전을 만들어요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 마음 말 하나와 그 마음이 드는 상황을 말해 봐요!",
          "count": 24,
          "hint": "“저는 ◯◯할 때 ~한 마음이 들어요” 처럼 마음 말과 상황을 말해 봐요",
          "end_msg": "모두의 마음 말을 모으니 멋진 마음 사전이 됐어요! 👏"
        },
        "suggested_extras": [
          "t_present11",
          "e_dict11"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "마음을 나타내는 말을 써요 ① (실천)",
          "levels": {
            "읽기": {
              "q": "'고마워', '미안해', '축하해' — 마음을 나타내는 말을 마음을 담아 읽어 볼까요?",
              "a": "고마워 / 미안해 / 축하해"
            },
            "쓰기": {
              "q": "고마웠던 일을 떠올려 '고마워'가 들어간 짧은 문장을 써 볼까요?",
              "a": "여러 답 (예: 도와줘서 고마워)",
              "open": true
            },
            "말하기": {
              "q": "그 말을 들으면 어떤 마음이 드는지 짝에게 말해 봐요.",
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
          "title": "마음 전하는 말 주고받기 짝 활동",
          "type": "pair",
          "goal": "마음을 나타내는 말로 전해요",
          "body": "짝에게 고마운·미안한 마음을 나타내는 말로 한 마디 전하고, 번갈아 해요.",
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
              "q": "마음을 나타내는 말에는?",
              "a": "고마워·미안해·축하해 등"
            },
            {
              "q": "마음을 말로 전하면?",
              "a": "마음이 잘 전해져요"
            },
            {
              "q": "말을 들은 친구는?",
              "a": "따뜻한 마음이 들어요"
            }
          ],
          "self": [
            "마음을 나타내는 말을 써요",
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
            "마음을 나타내는 말을 모았어요",
            "상황과 마음을 관련지었어요",
            "나만의 마음 사전을 만들었어요"
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
          "preview": "마음 말을 더 써요",
          "body": "다음 시간에는 마음 말로 마음을 표현하고 친구와 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_dict11"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_dict11",
        "type": "fun_question",
        "icon": "💡",
        "title": "마음 말 모으기",
        "content": "\"마음을 나타내는 말을 몇 개나 알고 있나요?\" 마음 사전을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_dict11",
        "type": "tip",
        "icon": "🧩",
        "title": "말과 상황",
        "content": "마음 말과 그 말을 쓰는 상황을 함께 모으게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_why11",
        "type": "fun_question",
        "icon": "📖",
        "title": "왜 좋을까",
        "content": "\"마음 말을 많이 알면 무엇이 좋을까요?\" 까닭을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_dict11",
        "type": "real_world",
        "icon": "🌍",
        "title": "내 마음 표현",
        "content": "마음을 표현하기 어려웠던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_dict11b",
        "type": "tip",
        "icon": "🧩",
        "title": "경험과 함께",
        "content": "마음 말을 자신의 경험과 이어 적게 하면 사전이 풍부해져요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_dict11",
        "type": "misconception",
        "icon": "❓",
        "title": "좋다·싫다 넘어서",
        "content": "\"좋다·싫다\"에 그치지 말고 다양한 마음 말을 모으게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_dict11c",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 말?",
        "content": "\"이 상황에 또 어떤 마음 말이 어울릴까요?\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_dict11",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 마음 말 짝짓기",
        "description": "상황과 마음 말을 짝지어 보세요.",
        "hint": "그 상황의 마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🎉 이루어짐"
            },
            "b": {
              "text": "뿌듯하다"
            }
          },
          {
            "a": {
              "text": "😞 약속 잊음"
            },
            "b": {
              "text": "서운하다"
            }
          },
          {
            "a": {
              "text": "😆 내일 외출"
            },
            "b": {
              "text": "설레다"
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
        "title": "경험과 함께",
        "content": "마음 말과 자신의 경험을 함께 말하게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_dict11",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 사전",
        "content": "\"우리 반 마음 사전을 함께 만들면 어떨까요?\" 실천을 넓혀요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect11",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"마음 사전에 무엇을 모았죠?\" 마음 말·상황을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_dict11",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 가기 예고",
        "content": "\"다음엔 마음 말로 표현하고 나눠요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l12"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 12,
      "title": "마음을 나타내는 말을 써요 ② (실천)",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 마음 말로 표현 → 마음 전하기 → 마음 말 모으기 → 마음 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마음을 나타내는 말을 써요",
          "subtitle": "5단원 · 12/14차시 · 실천"
        },
        "suggested_extras": [
          "q_share12",
          "t_share12"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "마음 말로 내 마음을 표현해요",
            "상대의 마음을 헤아려요",
            "마음을 나누며 배려해요"
          ]
        },
        "suggested_extras": [
          "t_share12"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "마음을 말로 전해요 💬",
          "visual": "💬",
          "question": "\"기분 나빠\"보다 \"네 말에 서운했어\"라고 하면<br>마음이 더 잘 전해져요. 어떻게 표현하면 좋을까요?",
          "img": "assets/photo/korean/g2u5_express2.jpg"
        },
        "suggested_extras": [
          "q_express12",
          "r_share12"
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
              "q": "마음을 나타내는 말에는?",
              "a": "고마워·미안해·축하해 등"
            },
            {
              "q": "마음을 말로 전하면?",
              "a": "마음이 잘 전해져요"
            }
          ],
          "from": "u5_l11"
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
          "title": "마음 말로 표현하고 헤아리기",
          "content": "마음을 **마음 말**로 정확히 표현하면 상대가 잘 이해해요. \"서운했어\" \"고마웠어\"처럼요. 또 친구의 마음 말을 들으면 그 **마음을 헤아려** 배려할 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "\"서운했어\"",
              "meaning": "내 마음을 정확히"
            },
            {
              "symbol": "\"고마웠어\"",
              "meaning": "마음을 전해요"
            },
            {
              "symbol": "마음 헤아리기",
              "meaning": "친구 마음을 알아요"
            },
            {
              "symbol": "배려하기",
              "meaning": "마음을 살펴 줘요"
            }
          ]
        },
        "suggested_extras": [
          "t_share12b",
          "x_share12"
        ],
        "tnote": {
          "ask": [
            "글로 마음을 전하면 어떤 점이 좋을까?"
          ],
          "watch": "마음 담은 글 쓰기·전하기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "마음을 잘 전하는 말은? 💬",
          "sub": "마음을 잘 전하는 말을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 도와줬을 때",
              "emoji": "🤝",
              "name": "\"도와줘서 고마웠어\""
            },
            {
              "clue": "친구가 약속을 어겼을 때",
              "emoji": "😞",
              "name": "\"약속을 못 지켜서 서운했어\""
            },
            {
              "clue": "이렇게 말하면 마음이 잘 안 전해져요!",
              "emoji": "🙅",
              "name": "\"몰라, 됐어\""
            }
          ],
          "outro": "마음 말로 정확히 전하면 마음이 잘 통해요. 마음을 나눠 볼까요? 😊"
        },
        "suggested_extras": [
          "q_share12c",
          "g_share12"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "마음을 나눠요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 요즘 든 마음을 마음 말로 표현해 봐요!",
          "count": 24,
          "hint": "“저는 ◯◯해서 ~한 마음이 들었어요” 처럼 마음 말로 표현해요",
          "end_msg": "모두 마음을 잘 표현하고 헤아렸어요. 우리 반이 따뜻해졌어요! 👏"
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
          "title": "마음을 나타내는 말을 써요 ② (실천)",
          "levels": {
            "읽기": {
              "q": "'네 덕분에 즐거웠어. 정말 고마워!'를 마음을 담아 읽어 볼까요?",
              "a": "고마운 마음을 담아"
            },
            "쓰기": {
              "q": "친구에게 전하고 싶은 마음을 담아 짧은 쪽지를 써 볼까요?",
              "a": "여러 답 (마음을 나타내는 말 포함)",
              "open": true
            },
            "말하기": {
              "q": "쓴 쪽지를 마음을 담아 짝에게 읽어 줘 봐요.",
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
          "title": "마음 쪽지 주고받기 짝 활동",
          "type": "pair",
          "goal": "마음을 담은 쪽지를 나눠요",
          "body": "짝에게 마음을 담은 쪽지를 써서 전하고, 받은 마음을 이야기해요.",
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
              "q": "쪽지에 마음을 담으려면?",
              "a": "마음을 나타내는 말을 써요"
            },
            {
              "q": "마음을 담아 읽으면?",
              "a": "마음이 더 잘 전해져요"
            },
            {
              "q": "마음을 전하고 나면?",
              "a": "서로 가까워져요"
            }
          ],
          "self": [
            "마음을 담은 글을 써서 전해요",
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
            "마음 말로 내 마음을 표현했어요",
            "상대의 마음을 헤아렸어요",
            "마음을 나누며 배려했어요"
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
          "body": "다음 시간에는 단원에서 배운 것을 스스로 돌아보고 정리해 볼 거예요!"
        },
        "suggested_extras": [
          "e_wrap12"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_share12",
        "type": "fun_question",
        "icon": "💡",
        "title": "마음 전하기",
        "content": "\"마음을 말로 전하기 어려웠던 적 있나요?\" 표현을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_share12",
        "type": "tip",
        "icon": "🧩",
        "title": "정확한 마음 말",
        "content": "막연한 말보다 정확한 마음 말로 표현하게 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_express12",
        "type": "fun_question",
        "icon": "💬",
        "title": "어떻게 표현?",
        "content": "\"마음을 어떻게 말하면 잘 전해질까요?\" 표현을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_share12",
        "type": "real_world",
        "icon": "🌍",
        "title": "마음 전한 경험",
        "content": "마음을 솔직히 전해 사이가 좋아진 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_share12b",
        "type": "tip",
        "icon": "🧩",
        "title": "헤아리기",
        "content": "내 마음 표현과 함께 친구 마음 헤아리기도 익히게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_share12",
        "type": "misconception",
        "icon": "❓",
        "title": "막연한 말 주의",
        "content": "\"몰라·됐어\"보다 마음 말로 정확히 표현하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_share12c",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 더 잘 통할까",
        "content": "\"왜 마음 말로 하면 더 잘 전해질까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_share12",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 마음 말 짝짓기",
        "description": "상황과 마음을 전하는 말을 짝지어 보세요.",
        "hint": "마음을 정확히 전해요.",
        "pairs": [
          {
            "a": {
              "text": "🤝 도움받음"
            },
            "b": {
              "text": "고마웠어"
            }
          },
          {
            "a": {
              "text": "😞 약속 어김"
            },
            "b": {
              "text": "서운했어"
            }
          },
          {
            "a": {
              "text": "🎁 선물받음"
            },
            "b": {
              "text": "기뻤어"
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
        "title": "마음 말로",
        "content": "마음 말과 까닭을 담아 표현하게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_share12",
        "type": "extension",
        "icon": "⬆",
        "title": "고마운 마음",
        "content": "\"오늘 누군가에게 고마운 마음을 전해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect12",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"마음을 어떻게 전했죠?\" 마음 말을 짚어요.",
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

  window.LESSONS["u5_l13"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 13,
      "title": "마무리하기 ① — 스스로 확인",
      "std": "[2국02-04] · [2국02-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 마음 짐작·낱말·띄어 읽기 정리 → 확인 퀴즈 → 스스로 확인 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ① — 스스로 확인",
          "subtitle": "5단원 · 13/14차시 · 마무리"
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
            "마음 짐작·낱말·띄어 읽기를 정리해요",
            "배운 내용을 스스로 확인해요"
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
          "scene_title": "5단원에서 무엇을 배웠나요? 🎀",
          "visual": "💭",
          "question": "인물의 마음도 짐작하고, 헷갈리기 쉬운 낱말도 구분하고, 자연스럽게 띄어 읽었어요.<br>가장 기억에 남는 것은 무엇인가요?",
          "img": "assets/photo/korean/g2u5_wrap1.jpg"
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
              "q": "쪽지에 마음을 담으려면?",
              "a": "마음을 나타내는 말을 써요"
            },
            {
              "q": "마음을 담아 읽으면?",
              "a": "마음이 더 잘 전해져요"
            }
          ],
          "from": "u5_l12"
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
          "title": "마음·낱말·띄어 읽기 정리",
          "content": "이 단원에서 **인물의 마음을 짐작**하고, **헷갈리기 쉬운 낱말**을 구분하고, **자연스럽게 띄어 읽는 법**을 배웠어요. 마음은 말·행동·상황으로 짐작하고, 낱말은 뜻으로 구분하며, 글은 의미 덩어리로 쉬어 읽어요!",
          "symbol_meanings": [
            {
              "symbol": "마음 짐작",
              "meaning": "말·행동·상황으로"
            },
            {
              "symbol": "자신과 비교",
              "meaning": "내 마음과 견주어"
            },
            {
              "symbol": "낱말 구분",
              "meaning": "뜻으로 가르기"
            },
            {
              "symbol": "띄어 읽기",
              "meaning": "의미 덩어리로"
            }
          ]
        },
        "suggested_extras": [
          "t_method13",
          "x_forget13"
        ],
        "tnote": {
          "ask": [
            "무엇을 새로 알게 되었나?"
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
          "title": "배운 것을 확인해요 ✅",
          "sub": "이 단원에서 배운 것을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "인물의 마음은 무엇으로 짐작할까요?",
              "emoji": "💭",
              "name": "말·행동·상황으로"
            },
            {
              "clue": "\"한 ( )씩 걸었다\"에 알맞은 말은?",
              "emoji": "👣",
              "name": "걸음"
            },
            {
              "clue": "문장은 어떻게 띄어 읽을까요?",
              "emoji": "📖",
              "name": "의미 덩어리로 알맞게"
            }
          ],
          "outro": "배운 것을 잘 기억하고 있어요. 마음을 헤아리며 읽어 봐요! 😊"
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
          "title": "스스로 확인해요",
          "question": "나는 이만큼 할 수 있나요?",
          "items": [
            "인물의 마음을 짐작할 수 있나요?",
            "헷갈리기 쉬운 낱말을 구분할 수 있나요?",
            "자연스럽게 띄어 읽을 수 있나요?"
          ]
        },
        "suggested_extras": [
          "t_self13",
          "e_pick13"
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
              "q": "이 단원에서 배운 것을 떠올리며 마음을 담아 한 문장을 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "마음을 짐작하는 방법을 한 가지 써 볼까요?",
              "a": "말·행동·표정·상황을 살펴요"
            },
            "말하기": {
              "q": "내가 가장 잘하게 된 것을 짝에게 말해 봐요.",
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
          "goal": "배운 내용을 함께 확인해요",
          "body": "짝과 이 단원에서 배운 것을 한 가지씩 번갈아 말하며 확인해요.",
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
              "q": "마음은 무엇으로 짐작하나요?",
              "a": "말·행동·표정·상황"
            },
            {
              "q": "왜 띄어 읽나요?",
              "a": "뜻이 잘 드러나요"
            },
            {
              "q": "마음은 무엇으로 전하나요?",
              "a": "마음을 나타내는 말"
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
            "배운 것을 돌아봤어요",
            "마음·낱말·띄어 읽기를 정리했어요",
            "얼마나 할 수 있는지 확인했어요"
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
          "body": "다음 시간에는 맞장구치는 말을 익히고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"
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
        "content": "\"이 단원에서 새로 알게 된 것 하나를 말해 볼까요?\" 배움을 떠올려요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_wrap13",
        "type": "tip",
        "icon": "🧩",
        "title": "세 갈래 정리",
        "content": "마음 짐작·낱말 구분·띄어 읽기 세 갈래를 함께 정리하게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_memory13",
        "type": "fun_question",
        "icon": "💭",
        "title": "기억에 남는 활동",
        "content": "\"마음 짐작·낱말·띄어 읽기 중 무엇이 좋았나요?\" 단원 경험을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_back13",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 적용",
        "content": "친구 마음을 헤아린 경험을 떠올리게 해요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_method13",
        "type": "tip",
        "icon": "🧩",
        "title": "각각 정리",
        "content": "마음·낱말·띄어 읽기를 항목별로 정리하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_forget13",
        "type": "misconception",
        "icon": "❓",
        "title": "마음은 짐작",
        "content": "마음은 단정 짓지 말고 까닭과 함께 짐작함을 다시 짚어 주세요.",
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
              "text": "💭 마음 짐작"
            },
            "b": {
              "text": "말·행동·상황"
            }
          },
          {
            "a": {
              "text": "👣 낱말 구분"
            },
            "b": {
              "text": "뜻으로"
            }
          },
          {
            "a": {
              "text": "📖 띄어 읽기"
            },
            "b": {
              "text": "의미 덩어리"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_self13",
        "type": "tip",
        "icon": "🗣",
        "title": "자기 돌아보기",
        "content": "비교가 아닌 자기 성찰적 점검이 되도록 이끄세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_pick13",
        "type": "extension",
        "icon": "⬆",
        "title": "다음 다짐",
        "content": "\"더 연습하고 싶은 것을 정해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect13",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"무엇을 정리했죠?\" 마음·낱말·띄어 읽기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_basic13",
        "type": "extension",
        "icon": "⬆",
        "title": "기초 다지기 예고",
        "content": "\"다음엔 맞장구치는 말과 글씨 쓰기를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u5_l14"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 5,
      "n": 14,
      "title": "마무리하기 ② — 기초 다지기",
      "std": "[2국02-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 맞장구치는 말 → 마음 헤아린 반응 → 알맞은 맞장구 고르기 → 글씨 쓰기·단원 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ② — 기초 다지기",
          "subtitle": "5단원 · 14/14차시 · 마무리"
        },
        "suggested_extras": [
          "q_react",
          "t_react"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "맞장구치는 말을 알아봐요",
            "마음을 헤아린 반응을 골라요",
            "배운 낱말을 바르게 써요"
          ]
        },
        "suggested_extras": [
          "t_react"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "마음을 알아주는 한마디 💗",
          "visual": "💗",
          "question": "친구가 \"오늘 속상했어\" 하면<br>뭐라고 대꾸하면 친구 마음이 풀릴까요?",
          "img": "assets/photo/korean/g2u5_wrap2.jpg"
        },
        "suggested_extras": [
          "q_react2",
          "r_react"
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
              "q": "마음은 무엇으로 짐작하나요?",
              "a": "말·행동·표정·상황"
            },
            {
              "q": "왜 띄어 읽나요?",
              "a": "뜻이 잘 드러나요"
            }
          ],
          "from": "u5_l13"
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
          "title": "마음을 헤아린 맞장구",
          "content": "친구가 마음을 말하면 **마음을 헤아린 맞장구**를 쳐 줘요. \"속상했겠다\" \"정말 기쁘겠다\"처럼요. 마음을 알아주는 한마디가 친구를 **위로하고 기쁘게** 해요!",
          "symbol_meanings": [
            {
              "symbol": "\"속상했겠다\"",
              "meaning": "슬픔을 함께해요"
            },
            {
              "symbol": "\"정말 기쁘겠다\"",
              "meaning": "기쁨을 함께해요"
            },
            {
              "symbol": "\"많이 놀랐지?\"",
              "meaning": "마음을 알아줘요"
            },
            {
              "symbol": "맞장구의 힘",
              "meaning": "위로와 공감"
            }
          ]
        },
        "suggested_extras": [
          "t_react2",
          "x_react"
        ],
        "tnote": {
          "ask": [
            "긴 문장은 어떻게 나눠 읽을까?"
          ],
          "watch": "띄어 읽기 다지기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "알맞은 맞장구는? 💬",
          "sub": "마음을 헤아린 맞장구를 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 \"강아지가 아파\" 하면?",
              "emoji": "🐶",
              "name": "\"많이 걱정되겠다\""
            },
            {
              "clue": "친구가 \"상을 받았어!\" 하면?",
              "emoji": "🏆",
              "name": "\"우아, 정말 축하해!\""
            },
            {
              "clue": "친구가 \"넘어져서 아파\" 하면?",
              "emoji": "🩹",
              "name": "\"많이 아팠겠다, 괜찮아?\""
            }
          ],
          "outro": "마음을 알아주는 맞장구가 친구를 따뜻하게 해요. 이제 글씨도 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_react3",
          "g_react"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "글씨를 바르게 써요 ✍️",
          "content": "단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **마음 · 짐작 · 설레다**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "마음",
              "meaning": "또박또박 칸에 맞춰"
            },
            {
              "symbol": "짐작",
              "meaning": "바른 자세로"
            },
            {
              "symbol": "설레다",
              "meaning": "천천히 정성껏"
            }
          ]
        },
        "suggested_extras": [
          "t_write14",
          "e_more14"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "기초 다지기 — 알맞게 띄어 읽기",
          "levels": {
            "읽기": {
              "q": "'우리 반 친구들이 운동장에서 신나게 뛰어놀았다.'를 알맞게 띄어 읽어 볼까요?",
              "a": "우리 반 친구들이 / 운동장에서 / 신나게 뛰어놀았다"
            },
            "쓰기": {
              "q": "긴 문장에 빗금(/)을 그어 띄어 읽을 곳을 표시해 볼까요?",
              "a": "의미 단위 사이에 / 표시"
            },
            "말하기": {
              "q": "띄어 읽기를 잘하려면 무엇에 주의해야 하는지 말해 봐요.",
              "a": "뜻 묶음으로 나눠요"
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
          "title": "긴 문장 띄어 읽기 짝 활동",
          "type": "pair",
          "goal": "긴 문장도 자연스럽게 띄어 읽어요",
          "body": "짝과 긴 문장에 빗금을 긋고 번갈아 자연스럽게 띄어 읽어요.",
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
              "q": "긴 문장은 어떻게 읽나요?",
              "a": "뜻 묶음으로 나눠 읽어요"
            },
            {
              "q": "띄어 읽을 곳을 표시하려면?",
              "a": "빗금을 그어요"
            },
            {
              "q": "띄어 읽기를 잘하려면?",
              "a": "꾸준히 연습해요"
            }
          ],
          "self": [
            "긴 문장도 알맞게 띄어 읽어요",
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
          "title": "5단원에서 배운 것",
          "points": [
            "인물의 마음을 짐작했어요",
            "헷갈리기 쉬운 낱말을 구분했어요",
            "자연스럽게 띄어 읽고 마음을 나눴어요"
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
          "title": "단원을 모두 마쳤어요",
          "preview": "마음을 헤아리며!",
          "body": "5단원을 모두 마쳤어요. 앞으로도 친구의 마음을 헤아리고 자연스럽게 띄어 읽어 봐요. 정말 수고했어요!"
        },
        "suggested_extras": [
          "e_end"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_react",
        "type": "fun_question",
        "icon": "💡",
        "title": "위로의 말",
        "content": "\"속상한 친구에게 어떤 말을 해 주면 좋을까요?\" 맞장구를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_react",
        "type": "tip",
        "icon": "🧩",
        "title": "마음 헤아리기",
        "content": "맞장구는 친구 마음을 헤아리는 데서 나옴을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_react2",
        "type": "fun_question",
        "icon": "💗",
        "title": "어떤 한마디",
        "content": "\"친구 마음이 풀리려면 어떤 말을 해 줄까요?\" 맞장구를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_react",
        "type": "real_world",
        "icon": "🌍",
        "title": "위로받은 경험",
        "content": "누군가의 한마디에 위로받은 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_react2",
        "type": "tip",
        "icon": "🧩",
        "title": "공감 표현",
        "content": "\"~겠다\"로 마음을 함께하는 공감 표현을 익히게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_react",
        "type": "misconception",
        "icon": "❓",
        "title": "건성 대꾸 주의",
        "content": "건성으로 대꾸하지 말고 마음을 담아 맞장구치게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_react3",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 말?",
        "content": "\"이럴 때 또 어떤 맞장구가 좋을까요?\" 표현을 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_react",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "마음 ↔ 맞장구 짝짓기",
        "description": "친구의 마음과 알맞은 맞장구를 짝지어 보세요.",
        "hint": "마음을 헤아려요.",
        "pairs": [
          {
            "a": {
              "text": "🐶 강아지 아픔"
            },
            "b": {
              "text": "걱정되겠다"
            }
          },
          {
            "a": {
              "text": "🏆 상 받음"
            },
            "b": {
              "text": "축하해!"
            }
          },
          {
            "a": {
              "text": "🩹 다침"
            },
            "b": {
              "text": "많이 아팠겠다"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_write14",
        "type": "tip",
        "icon": "✍️",
        "title": "바른 글씨",
        "content": "네모 칸의 자형을 살펴 또박또박 쓰게 하고, 어려워하면 천천히 따라 쓰게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_more14",
        "type": "extension",
        "icon": "⬆",
        "title": "문장으로",
        "content": "\"마음 말로 짧은 문장을 만들어 써 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect14",
        "type": "fun_question",
        "icon": "💡",
        "title": "단원 마무리",
        "content": "\"5단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_end",
        "type": "extension",
        "icon": "⬆",
        "title": "마음 헤아리기",
        "content": "\"오늘 가족·친구의 마음을 헤아려 한마디 건네 볼까요?\" 실천으로 이어요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

})();
