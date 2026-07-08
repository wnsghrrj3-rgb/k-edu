/* ============================================================================
   2학년 1학기 국어 8단원 「다양한 작품을 감상해요」 케이티처(교사주도) 차시 데이터
   - 키 형식: window.LESSONS["u8_l{NN}"] (zero-pad)
   - 8슬 표준흐름: cover·objective / motivate·concept / 활동(card_quiz 등)·발표(question 등) / summary·next_lesson
   - 지도서: 미래엔 『국어』 2-1 (나) 246~279쪽 / 15차시.
   - 성취기준 [2국05-02]·[2국05-03]·[2국06-01]·[2국01-05]. 역량 문화 향유(작품의 이해와 표현).
   ★ 저작권: 창작 시·동화(신호·우산 사용법·다툰 날·편지=개구리와 두꺼비·누가 더 섭섭했을까·재강이 구출 작전) 미게재.
      자체 동시 「마주 보면」은 자체 창작이라 게재 가능. 전래(흥부와 놀부·콩쥐팥쥐·별주부전·해와 달이 된 오누이·의좋은 형제)는 공유 줄거리 활용.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 ---------------- */
  window.LESSONS["u8_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 1,
      "title": "단원 도입 — 다양한 작품을 만나요",
      "std": "[2국05-02] · [2국01-05]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 시·이야기·인형극 감상 경험 떠올리기 → 작품의 종류 → 작품 종류 맞히기 → 감상 경험 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "다양한 작품을 감상해요",
          "subtitle": "8단원 · 1/15차시 · 단원 도입"
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
            "시·이야기·인형극이 무엇인지 살펴봐요",
            "작품을 감상해 본 경험을 떠올려요",
            "이 단원에서 배울 것을 알아봐요"
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
          "scene_title": "선생님이 책을 읽어 주셔요 📖",
          "visual": "🎭",
          "question": "시를 낭송하거나, 이야기를 듣거나, 인형극을 본 적이 있나요?<br>그때 어떤 마음이 들었나요?",
          "img": "assets/photo/korean/g2u8_intro.jpg"
        },
        "suggested_extras": [
          "q_exp",
          "r_life"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "이런 작품들이 있어요",
          "content": "이 단원에서는 **시**, **이야기**, **인형극** 같은 여러 작품을 감상해요. 작품을 즐기고 느낀 점을 친구들과 나누는 것이 가장 중요해요!",
          "symbol_meanings": [
            {
              "symbol": "시 🗣️",
              "meaning": "소리 내어 낭송하며 즐겨요"
            },
            {
              "symbol": "이야기 📖",
              "meaning": "인물의 마음을 상상하며 읽어요"
            },
            {
              "symbol": "인형극 🎭",
              "meaning": "인형의 말·행동을 보며 즐겨요"
            },
            {
              "symbol": "감상 💗",
              "meaning": "느낀 점을 친구와 나눠요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "b_book"
        ],
        "tnote": {
          "ask": [
            "작품을 읽으면 마음속에 무엇이 떠오를까?"
          ],
          "watch": "작품·감상 감각 열기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이건 어떤 작품일까요? 🤔",
          "sub": "설명을 보고 시·이야기·인형극 가운데 무엇인지 함께 맞혀 봐요. 카드를 누르면 정답이 나와요!",
          "cards": [
            {
              "clue": "소리 내어 낭송하면 리듬과 분위기가 느껴져요.<br>짧은 글에 마음이 담겨 있어요.",
              "emoji": "🗣️",
              "name": "시!"
            },
            {
              "clue": "인물이 나오고, 일이 차례대로 일어나요.<br>읽으며 인물의 마음을 상상해요.",
              "emoji": "📖",
              "name": "이야기!"
            },
            {
              "clue": "인형이 나와 말과 행동으로 보여 줘요.<br>그림자·막대·손가락 인형도 있어요.",
              "emoji": "🎭",
              "name": "인형극!"
            }
          ],
          "outro": "시·이야기·인형극을 이 단원에서 모두 만나 볼 거예요. 즐길 준비됐나요? 😊"
        },
        "suggested_extras": [
          "q_kind",
          "g_kind"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "감상 경험을 나눠요",
          "question": "기억에 남는 작품이 있나요?",
          "items": [
            "가장 재미있게 읽은 이야기책은 무엇인가요?",
            "본 적 있는 인형극이 있나요?",
            "그 작품의 어떤 점이 좋았나요?"
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
          "title": "다양한 작품 만나기 — 감상이란",
          "levels": {
            "읽기": {
              "q": "'작품을 읽고 마음속에 떠오른 느낌을 감상이라고 해요.'를 또박또박 읽어 볼까요?",
              "a": "감상 뜻 문장"
            },
            "쓰기": {
              "q": "내가 좋아하는 작품(시·이야기·인형극) 한 가지를 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "그 작품이 왜 좋은지 짝에게 말해 봐요.",
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
          "title": "좋아하는 작품 소개 짝 놀이",
          "type": "pair",
          "goal": "다양한 작품에 관심을 가져요",
          "body": "짝에게 내가 좋아하는 시나 이야기를 한 가지 소개하고, 어떤 점이 좋은지 말한 뒤 번갈아 해요.",
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
              "q": "작품을 읽고 떠오른 느낌을 무엇이라 하나요?",
              "a": "감상"
            },
            {
              "q": "작품에는 어떤 것이 있나요?",
              "a": "시·이야기·인형극 등"
            },
            {
              "q": "작품을 감상하면?",
              "a": "마음이 풍부해져요"
            }
          ],
          "self": [
            "다양한 작품과 감상을 알아요",
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
            "시·이야기·인형극이 있다는 것을 알았어요",
            "작품을 감상한 경험을 떠올렸어요",
            "느낀 점을 나누는 것이 중요함을 알았어요"
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
          "preview": "작품 속 인물의 마음을 상상해요",
          "body": "다음 시간에는 잘 아는 옛이야기의 한 장면을 떠올리며, 그 속 인물의 마음을 상상해 볼 거예요!"
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
        "title": "작품 떠올리기",
        "content": "\"가장 좋아하는 이야기책 제목을 한 가지 말해 볼까요?\" 작품과의 친밀감을 여는 발문이에요.",
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
        "content": "이 단원의 목표는 '친구들과 작품 감상의 즐거움 나누기'예요. 도입에선 작품을 즐기는 분위기를 만드는 데 집중하세요.",
        "fit_slides": [
          "objective",
          "cover"
        ]
      },
      {
        "id": "q_exp",
        "type": "fun_question",
        "icon": "🎭",
        "title": "인형극 경험",
        "content": "\"어디에서 인형극을 본 적이 있나요?\" 충치 예방·안전 교육 인형극 등 익숙한 경험을 끌어내요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_life",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 작품",
        "content": "도서관·교실 책꽂이·텔레비전 등 일상에서 작품을 만나는 곳과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "엄밀한 구분보다 즐김",
        "content": "시·이야기·인형극을 이론적으로 엄밀히 구분하기보다 '즐겁게 감상하는 것'에 중점을 두라고 지도서가 안내해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "b_book",
        "type": "book",
        "icon": "📖",
        "title": "그림책 한 권",
        "content": "학급에 있는 그림책 한 권을 들어 보이며 \"이건 어떤 작품일까요?\" 물어 작품 종류를 자연스럽게 익히게 해요.",
        "source": "학급 비치 도서(임의)",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_kind",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 작품?",
        "content": "\"노래도 작품일까요? 만화는요?\" 작품의 범위를 넓혀 생각하게 하는 발문이에요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_kind",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "작품 ↔ 특징 짝짓기",
        "description": "작품 종류와 그 특징을 짝지어 보세요.",
        "hint": "어떻게 즐기는 작품인지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🗣️ 시"
            },
            "b": {
              "text": "낭송하며 즐겨요"
            }
          },
          {
            "a": {
              "text": "📖 이야기"
            },
            "b": {
              "text": "마음 상상하며 읽어요"
            }
          },
          {
            "a": {
              "text": "🎭 인형극"
            },
            "b": {
              "text": "인형의 말·행동을 봐요"
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
        "content": "감상 경험은 한두 문장으로 짧게 말하게 해 여러 학생이 골고루 참여하도록 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more",
        "type": "extension",
        "icon": "⬆",
        "title": "작품 찾아오기",
        "content": "\"다음 시간까지 좋아하는 이야기책을 한 권 떠올려 와요.\" 작품 감상의 동기를 이어 줘요.",
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
        "content": "\"오늘 어떤 작품들을 알게 됐나요?\" 물으며 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "옛이야기 떠올리기",
        "content": "\"흥부와 놀부에서 가장 기억에 남는 장면은?\" 다음 차시(인물 마음 상상)를 살짝 예고해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 2,
      "title": "작품 속 인물의 마음을 상상해요",
      "std": "[2국05-02] · [2국05-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 옛이야기 장면 떠올리기 → 마음 상상하는 방법 → 장면 속 마음 맞히기 → 상상한 마음 발표 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "작품 속 인물의 마음을 상상해요",
          "subtitle": "8단원 · 2/15차시 · 준비"
        },
        "suggested_extras": [
          "q_scene",
          "t_focus"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "옛이야기의 한 장면을 떠올려요",
            "장면 속 인물의 마음을 상상해요",
            "왜 그런 마음일지 까닭을 말해요"
          ]
        },
        "suggested_extras": [
          "t_focus"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "흥부 앞에 큰 박이 갈라졌어요 🪕",
          "visual": "😲",
          "question": "흥부가 박에서 보물이 쏟아져 나왔어요.<br>이때 흥부는 어떤 마음이었을까요?",
          "img": "assets/photo/korean/g2u8_char.jpg"
        },
        "suggested_extras": [
          "q_heung",
          "r_tale"
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
              "q": "작품을 읽고 떠오른 느낌을 무엇이라 하나요?",
              "a": "감상"
            },
            {
              "q": "작품을 감상하면?",
              "a": "마음이 풍부해져요"
            }
          ],
          "from": "u8_l01"
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
          "title": "마음을 상상하는 방법",
          "content": "인물의 마음은 글에 **직접 나오지 않을 때가 많아요**. 그럴 땐 인물이 처한 **상황**과 인물의 **말·행동**을 살펴 마음을 상상해요.",
          "symbol_meanings": [
            {
              "symbol": "상황 보기",
              "meaning": "인물이 어떤 일을 겪었나요?"
            },
            {
              "symbol": "행동 보기",
              "meaning": "무엇을 했나요? (웃다·울다)"
            },
            {
              "symbol": "말 보기",
              "meaning": "어떤 말을 했나요?"
            },
            {
              "symbol": "마음 상상",
              "meaning": "비슷한 내 경험과 견줘 봐요"
            }
          ]
        },
        "suggested_extras": [
          "t_imagine",
          "x_force"
        ],
        "tnote": {
          "ask": [
            "인물이 되어 본다면 어떤 마음이 들까?"
          ],
          "watch": "인물 마음 상상",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 장면, 어떤 마음일까요? 💭",
          "sub": "잘 아는 옛이야기 장면이에요. 인물의 마음을 함께 상상해 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "흥부가 박에서 보물이 쏟아지는 것을 봤어요.",
              "emoji": "😄",
              "name": "기쁘고 놀란 마음"
            },
            {
              "clue": "콩쥐가 깨진 독을 두꺼비가 막아 줘서 물을 채웠어요.",
              "emoji": "🙏",
              "name": "고마운 마음"
            },
            {
              "clue": "갑자기 호랑이가 나타나 할머니 앞을 막았어요.",
              "emoji": "😨",
              "name": "놀라고 무서운 마음"
            }
          ],
          "outro": "같은 장면도 사람마다 다르게 느낄 수 있어요. 왜 그렇게 생각했는지 말해 보면 더 좋아요! 😊"
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
          "title": "상상한 마음을 발표해요",
          "question": "내가 그 인물이라면 어떤 마음이었을까요?",
          "items": [
            "어떤 장면을 골랐나요?",
            "그 인물은 어떤 마음이었을까요?",
            "왜 그렇게 생각했나요?"
          ]
        },
        "suggested_extras": [
          "t_reason",
          "e_mine"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "작품 속 인물의 마음 상상하기",
          "levels": {
            "읽기": {
              "q": "'혼자 남은 아이는 마음이 어땠을까요?'를 인물 마음을 떠올리며 읽어 볼까요?",
              "a": "마음을 묻는 문장"
            },
            "쓰기": {
              "q": "작품 속 인물의 마음을 나타내는 낱말을 하나 써 볼까요?",
              "a": "여러 답 (예: 외로움·설렘)",
              "open": true
            },
            "말하기": {
              "q": "그 마음을 어떻게 짐작했는지 까닭과 함께 짝에게 말해 봐요.",
              "a": "인물의 말·행동·상황에서"
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
          "title": "인물 마음 상상 짝 활동",
          "type": "pair",
          "goal": "작품 속 인물의 마음을 상상해요",
          "body": "짝이 인물의 상황을 말하면 그때 마음이 어땠을지 상상해 말하고, 번갈아 해요.",
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
              "q": "인물의 마음은 무엇을 보고 상상하나요?",
              "a": "인물의 말·행동·상황"
            },
            {
              "q": "마음을 상상하며 읽으면?",
              "a": "작품이 더 실감 나요"
            },
            {
              "q": "같은 작품도 사람마다?",
              "a": "느낌이 다를 수 있어요"
            }
          ],
          "self": [
            "인물의 마음을 상상하며 읽어요",
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
            "인물의 마음은 상황·말·행동으로 상상해요",
            "같은 장면도 다르게 느낄 수 있어요",
            "왜 그런지 까닭을 말하면 좋아요"
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
          "preview": "시를 낭송하고 느낌을 나눠요",
          "body": "다음 시간에는 시를 소리 내어 낭송하고, 시 속 인물의 마음을 짐작하며 느낌을 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_poem"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_scene",
        "type": "fun_question",
        "icon": "💡",
        "title": "기억의 장면",
        "content": "\"옛이야기에서 가장 기억에 남는 장면 하나를 떠올려 볼까요?\" 마음 상상의 재료를 끌어내요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_focus",
        "type": "tip",
        "icon": "🧩",
        "title": "학습의 초점",
        "content": "인물 상상이 기계적이지 않게, 말·행동을 통해 자연스럽게 마음을 짐작하도록 이끄세요(지도서 유의점).",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_heung",
        "type": "fun_question",
        "icon": "🪕",
        "title": "흥부의 마음",
        "content": "\"여러분이 흥부라면 그 순간 무슨 말을 했을까요?\" 인물에 몰입하게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_tale",
        "type": "real_world",
        "icon": "🌍",
        "title": "아는 옛이야기",
        "content": "콩쥐팥쥐·별주부전·해와 달이 된 오누이 등 학생들이 아는 옛이야기를 자유롭게 떠올리게 하세요.",
        "fit_slides": [
          "motivate",
          "card_quiz"
        ]
      },
      {
        "id": "t_imagine",
        "type": "tip",
        "icon": "🧩",
        "title": "비슷한 경험과 견주기",
        "content": "마음을 짐작하기 어려워하는 학생에겐 \"너라면 어땠을까?\" 비슷한 경험을 떠올리게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_force",
        "type": "misconception",
        "icon": "❓",
        "title": "정답은 하나가 아니에요",
        "content": "인물의 마음에 '하나의 정답'을 강요하지 마세요. 까닭이 타당하면 다양한 상상을 인정해 줍니다.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_why",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 그렇게?",
        "content": "\"왜 그런 마음이라고 생각했나요?\" 까닭을 묻는 습관을 들여요.",
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
        "description": "옛이야기 장면과 인물의 마음을 짝지어 보세요.",
        "hint": "그 상황에서 어떤 마음일지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🪕 보물이 쏟아짐"
            },
            "b": {
              "text": "기쁜 마음"
            }
          },
          {
            "a": {
              "text": "🐸 두꺼비가 도와줌"
            },
            "b": {
              "text": "고마운 마음"
            }
          },
          {
            "a": {
              "text": "🐯 호랑이가 나타남"
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
        "id": "t_reason",
        "type": "tip",
        "icon": "🗣",
        "title": "까닭을 함께",
        "content": "마음만 말하지 않고 \"왜냐하면…\"으로 까닭을 함께 말하게 하면 감상이 깊어져요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_mine",
        "type": "extension",
        "icon": "⬆",
        "title": "내 경험 잇기",
        "content": "\"나도 비슷한 마음이 들었던 적 있나요?\" 작품을 자신의 삶과 이어 보게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect2",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"인물의 마음은 무엇을 보고 상상했죠?\" 상황·말·행동을 짚으며 정리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_poem",
        "type": "extension",
        "icon": "⬆",
        "title": "시 맛보기",
        "content": "\"시 속에도 인물의 마음이 숨어 있어요.\" 다음 차시를 예고해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 3,
      "title": "시를 낭송하고 느낌을 나눠요 ①",
      "std": "[2국05-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 표정·몸짓 경험 → 자체 동시 「마주 보면」 → 행동에서 마음 짐작 → 낭송하고 느낌 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "시를 낭송하고 느낌을 나눠요",
          "subtitle": "8단원 · 3/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_gesture",
          "t_recite"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "시를 소리 내어 낭송해요",
            "행동에서 인물의 마음을 짐작해요",
            "시에 대한 느낌을 친구와 나눠요"
          ]
        },
        "suggested_extras": [
          "t_recite"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "친구가 손을 흔들어요 👋",
          "visual": "😄",
          "question": "친구가 활짝 웃으며 손을 흔들면,<br>여러분은 어떤 표정·몸짓으로 답하고 싶나요?",
          "img": "assets/photo/korean/g2u8_poem1.jpg"
        },
        "suggested_extras": [
          "q_sign",
          "r_gesture"
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
              "q": "인물의 마음은 무엇을 보고 상상하나요?",
              "a": "인물의 말·행동·상황"
            },
            {
              "q": "마음을 상상하며 읽으면?",
              "a": "작품이 더 실감 나요"
            }
          ],
          "from": "u8_l02"
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
          "title": "시 「마주 보면」을 읽어요",
          "content": "행동에 마음이 담겨 있어요. '반갑다'는 말이 없어도 **웃고 손을 흔드는 행동**에서 반가운 마음이 느껴져요.",
          "symbol_meanings": [
            {
              "symbol": "내가 손을 흔들면",
              "meaning": "너도 손을 흔들고"
            },
            {
              "symbol": "내가 빙긋 웃으면",
              "meaning": "너도 빙긋"
            },
            {
              "symbol": "마주 보는 우리 둘",
              "meaning": "마음이 통했네"
            },
            {
              "symbol": "숨은 마음",
              "meaning": "반가운 마음 💕"
            }
          ]
        },
        "suggested_extras": [
          "t_action",
          "b_picpoem"
        ],
        "tnote": {
          "ask": [
            "시를 어떻게 읽으면 더 아름답게 들릴까?"
          ],
          "watch": "시 낭송·리듬",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "흉내 내는 말, 무슨 뜻일까요? ✨",
          "sub": "시에 나온 흉내 내는 말이에요. 어떤 모양인지 함께 맞혀 봐요. 카드를 누르면 뜻이 나와요!",
          "cards": [
            {
              "clue": "\"빙긋\" 웃었어요.<br>어떻게 웃는 모양일까요?",
              "emoji": "🙂",
              "name": "소리 없이 살짝 웃는 모양"
            },
            {
              "clue": "고개를 \"까딱\" 했어요.<br>어떤 모양일까요?",
              "emoji": "🙇",
              "name": "고개를 가볍게 움직이는 모양"
            },
            {
              "clue": "\"폴짝폴짝\" 뛰었어요.<br>어떤 모양일까요?",
              "emoji": "🐰",
              "name": "가볍게 자꾸 뛰어오르는 모양"
            }
          ],
          "outro": "흉내 내는 말을 살리면 시가 더 생생해져요. 몸짓을 더해 낭송해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_mimic",
          "g_mimic"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "낭송하고 느낌을 나눠요",
          "question": "여러 방법으로 시를 낭송해 봐요.",
          "items": [
            "짝과 한 줄씩 주고받으며 낭송해 볼까요?",
            "몸짓을 더해 낭송하면 어떤 느낌인가요?",
            "시를 읽고 어떤 마음이 떠올랐나요?"
          ]
        },
        "suggested_extras": [
          "t_recite2",
          "e_signal"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "시를 낭송하고 느낌 나누기 ① — 시 낭송하기",
          "levels": {
            "읽기": {
              "q": "'하늘하늘 나비가 춤을 춰요.'를 리듬을 살려 낭송해 볼까요?",
              "a": "리듬을 살린 낭송"
            },
            "쓰기": {
              "q": "시에서 흉내 내는 말(하늘하늘 등)을 하나 찾아 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "시를 낭송할 때 어떻게 읽으면 좋은지 짝에게 말해 봐요.",
              "a": "리듬·느낌을 살려"
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
          "title": "시 주고받아 낭송하기 짝 활동",
          "type": "pair",
          "goal": "리듬을 살려 시를 낭송해요",
          "body": "짝과 짧은 시를 한 줄씩 번갈아 낭송하고, 리듬이 잘 느껴지는지 이야기해요.",
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
              "q": "시를 읽는 것을 무엇이라 하나요?",
              "a": "낭송"
            },
            {
              "q": "시를 낭송할 때 살리는 것은?",
              "a": "리듬과 느낌"
            },
            {
              "q": "흉내 내는 말이 있으면?",
              "a": "장면이 생생해져요"
            }
          ],
          "self": [
            "리듬을 살려 시를 낭송해요",
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
            "행동에서 인물의 마음을 짐작했어요",
            "흉내 내는 말의 뜻을 알았어요",
            "여러 방법으로 낭송하며 느낌을 나눴어요"
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
          "preview": "이야기를 읽고 느낌을 표현해요",
          "body": "다음 시간에는 이야기를 읽으며 인물의 마음을 상상하고, 생각이나 느낌을 표현해 볼 거예요!"
        },
        "suggested_extras": [
          "e_story"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_gesture",
        "type": "fun_question",
        "icon": "💡",
        "title": "몸짓 인사",
        "content": "\"말 없이 몸짓만으로 '반가워'를 표현해 볼까요?\" 시의 정서를 몸으로 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_recite",
        "type": "tip",
        "icon": "🧩",
        "title": "낭송은 감상 활동",
        "content": "낭송을 잘하기 위한 것이 아니라, 시에 대한 생각·느낌을 표현하는 감상 활동임을 잊지 마세요(지도서 유의점).",
        "fit_slides": [
          "objective",
          "question"
        ]
      },
      {
        "id": "q_sign",
        "type": "fun_question",
        "icon": "👋",
        "title": "우리만의 신호",
        "content": "\"친구와 둘만 아는 몸짓 신호가 있나요?\" 시의 세계를 자신의 경험과 이어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_gesture",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 몸짓",
        "content": "손 흔들기·하이파이브·엄지척 등 일상의 몸짓 인사와 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_action",
        "type": "tip",
        "icon": "🧩",
        "title": "행동→마음",
        "content": "시에 '반갑다'가 직접 없어도 웃고 손 흔드는 행동으로 마음을 짐작할 수 있음을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "b_picpoem",
        "type": "book",
        "icon": "📖",
        "title": "시 그림책",
        "content": "한 면에 한 연을 담은 시 그림책을 활용하면 다음 장을 상상하며 천천히 음미하게 됩니다.",
        "source": "시 그림책(시중 다수 — 임의 선택)",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_mimic",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 다른 흉내말",
        "content": "\"웃는 모양을 흉내 내는 다른 말도 있을까요? (방긋·생긋)\" 어휘를 넓혀요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mimic",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "흉내말 ↔ 뜻 짝짓기",
        "description": "흉내 내는 말과 그 뜻을 짝지어 보세요.",
        "hint": "어떤 모양인지 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "빙긋"
            },
            "b": {
              "text": "살짝 웃는 모양"
            }
          },
          {
            "a": {
              "text": "까딱"
            },
            "b": {
              "text": "고개를 움직이는 모양"
            }
          },
          {
            "a": {
              "text": "폴짝폴짝"
            },
            "b": {
              "text": "뛰어오르는 모양"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_recite2",
        "type": "tip",
        "icon": "🗣",
        "title": "다양한 낭송",
        "content": "주고받으며 낭송·몸짓 낭송·랩처럼 낭송 등 다양한 방법으로 낭송의 즐거움을 체험하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_signal",
        "type": "extension",
        "icon": "⬆",
        "title": "나만의 신호 시",
        "content": "\"누구와 어떤 신호를 주고받고 싶나요?\" 시를 자신의 이야기로 확장해요.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "q_reflect3",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"행동에서 무엇을 짐작했죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_story",
        "type": "extension",
        "icon": "⬆",
        "title": "이야기 예고",
        "content": "\"다음엔 이야기 속 인물의 마음을 상상해요.\" 다음 차시를 예고해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 4,
      "title": "시를 낭송하고 느낌을 나눠요 ②",
      "std": "[2국05-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 여러 방법으로 낭송 → 시 속 마음 짐작 → 신호 주고받고 싶은 사람 떠올리기 → 느낌 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "시를 낭송하고 느낌을 나눠요",
          "subtitle": "8단원 · 4/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall",
          "t_ways"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "여러 가지 방법으로 시를 낭송해요",
            "시 속 인물의 마음을 더 깊이 짐작해요",
            "나도 신호를 주고받고 싶은 사람을 떠올려요"
          ]
        },
        "suggested_extras": [
          "t_ways"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "이번엔 어떻게 읽어 볼까요? 🎶",
          "visual": "🎵",
          "question": "같은 시도 읽는 방법을 바꾸면 느낌이 달라져요.<br>어떻게 낭송하면 더 재미있을까요?",
          "img": "assets/photo/korean/g2u8_poem2.jpg"
        },
        "suggested_extras": [
          "q_how",
          "r_music"
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
              "q": "시를 읽는 것을 무엇이라 하나요?",
              "a": "낭송"
            },
            {
              "q": "시를 낭송할 때 살리는 것은?",
              "a": "리듬과 느낌"
            }
          ],
          "from": "u8_l03"
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
          "title": "여러 가지 낭송 방법",
          "content": "시는 **읽는 방법**에 따라 느낌이 달라져요. 짝과 주고받거나, 몸짓을 더하거나, 박자를 넣어 읽으면 시가 더 **생생하게** 살아나요!",
          "symbol_meanings": [
            {
              "symbol": "주고받기",
              "meaning": "짝과 한 줄씩 번갈아 읽어요"
            },
            {
              "symbol": "몸짓 낭송",
              "meaning": "손짓·표정을 더해 읽어요"
            },
            {
              "symbol": "박자 낭송",
              "meaning": "손뼉·발 구르며 읽어요"
            },
            {
              "symbol": "느낌",
              "meaning": "방법마다 다른 재미를 느껴요"
            }
          ]
        },
        "suggested_extras": [
          "t_free",
          "x_skill"
        ],
        "tnote": {
          "ask": [
            "같은 시인데 느낌이 다른 까닭은 무엇일까?"
          ],
          "watch": "시 느낌 나누기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "행동에 담긴 마음을 짚어요 💭",
          "sub": "시 「마주 보면」 속 행동에서 어떤 마음이 느껴지는지 함께 짚어 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "손을 흔들면 너도 손을 흔들어요.",
              "emoji": "👋",
              "name": "반가운 마음"
            },
            {
              "clue": "빙긋 웃으면 너도 빙긋 웃어요.",
              "emoji": "🙂",
              "name": "즐겁고 정다운 마음"
            },
            {
              "clue": "마주 보며 마음이 통했어요.",
              "emoji": "💕",
              "name": "가까워진 마음"
            }
          ],
          "outro": "행동 하나하나에 마음이 담겨 있어요. 그 마음을 살려 낭송해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_feel",
          "g_act2"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "신호를 주고받고 싶은 사람",
          "question": "나는 누구와 어떤 신호를 주고받고 싶나요?",
          "items": [
            "누구와 신호를 주고받고 싶나요? (친구·가족·반려동물)",
            "어떤 몸짓 신호를 만들고 싶나요?",
            "그 신호에 어떤 마음을 담고 싶나요?"
          ]
        },
        "suggested_extras": [
          "t_safe",
          "e_signal2"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "시를 낭송하고 느낌 나누기 ② — 느낌 나누기",
          "levels": {
            "읽기": {
              "q": "'이 시를 읽으니 봄나들이가 떠올라요.'를 느낌을 담아 읽어 볼까요?",
              "a": "느낌을 말하는 문장"
            },
            "쓰기": {
              "q": "시를 읽고 떠오른 장면이나 느낌을 한 문장 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "같은 시를 읽어도 느낌이 다른 까닭을 짝에게 말해 봐요.",
              "a": "경험·마음이 저마다 달라서"
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
          "title": "시 느낌 나누기 짝 활동",
          "type": "pair",
          "goal": "시를 읽고 느낌을 나눠요",
          "body": "짝과 같은 시를 읽고 떠오른 장면과 느낌을 서로 말하며, 어떤 점이 비슷하고 다른지 이야기해요.",
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
              "q": "시를 읽고 떠오르는 것은?",
              "a": "장면과 느낌"
            },
            {
              "q": "느낌을 나눌 때 함께 말하면 좋은 것은?",
              "a": "떠오른 장면·까닭"
            },
            {
              "q": "느낌이 서로 다른 것은?",
              "a": "자연스러운 일이에요"
            }
          ],
          "self": [
            "시를 읽고 느낌을 나눠요",
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
            "여러 방법으로 낭송하면 느낌이 달라져요",
            "행동에서 인물의 마음을 짚었어요",
            "나만의 신호로 마음을 전할 수 있어요"
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
          "preview": "이야기를 읽고 느낌을 표현해요",
          "body": "다음 시간에는 이야기를 읽으며 인물의 마음을 상상하고, 생각이나 느낌을 표현해 볼 거예요!"
        },
        "suggested_extras": [
          "e_story2"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 시간 떠올리기",
        "content": "\"지난 시간에 읽은 시에서 가장 마음에 든 부분은?\" 이어 가는 발문이에요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_ways",
        "type": "tip",
        "icon": "🧩",
        "title": "낭송의 즐거움",
        "content": "낭송을 잘하는 것이 목적이 아니라 다양한 방법으로 시를 즐기는 것이 핵심이에요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how",
        "type": "fun_question",
        "icon": "🎶",
        "title": "어떻게 읽을까",
        "content": "\"이 시를 노래처럼 읽으면 어떨까요?\" 창의적 낭송을 끌어내요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_music",
        "type": "real_world",
        "icon": "🌍",
        "title": "리듬이 있는 말",
        "content": "응원 구호·노래 가사처럼 리듬이 있는 말과 이어 시의 리듬감을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_free",
        "type": "tip",
        "icon": "🧩",
        "title": "허용적 분위기",
        "content": "랩처럼·음악과 함께·손뼉 치며 등 학생들이 자유롭게 낭송 방법을 정하게 하세요.",
        "fit_slides": [
          "concept",
          "question"
        ]
      },
      {
        "id": "x_skill",
        "type": "misconception",
        "icon": "❓",
        "title": "잘 읽기가 목표 아니에요",
        "content": "또박또박 잘 읽기보다 시의 느낌을 살려 즐기는 데 초점을 두세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_feel",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 마음일까",
        "content": "\"손을 마주 흔들 때 두 사람은 어떤 마음일까요?\" 행동→마음 연결을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_act2",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "행동 ↔ 마음 짝짓기",
        "description": "시 속 행동과 담긴 마음을 짝지어 보세요.",
        "hint": "행동을 할 때 마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "👋 손 흔들기"
            },
            "b": {
              "text": "반가운 마음"
            }
          },
          {
            "a": {
              "text": "🙂 빙긋 웃기"
            },
            "b": {
              "text": "정다운 마음"
            }
          },
          {
            "a": {
              "text": "💕 마주 보기"
            },
            "b": {
              "text": "가까워진 마음"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_safe",
        "type": "tip",
        "icon": "🗣",
        "title": "관계는 섬세하게",
        "content": "신호 주고받고 싶은 사람을 떠올릴 때 가족·교우 관계가 예민할 수 있으니 섬세하게 다뤄 주세요(지도서 유의점).",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_signal2",
        "type": "extension",
        "icon": "⬆",
        "title": "신호 넓히기",
        "content": "\"사람 말고 반려동물과도 신호를 주고받을 수 있을까요?\" 시의 세계를 넓혀요.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "q_reflect4",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"어떤 낭송 방법이 가장 재미있었나요?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_story2",
        "type": "extension",
        "icon": "⬆",
        "title": "이야기 예고",
        "content": "\"다음엔 이야기 속 인물의 마음을 상상해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 5,
      "title": "이야기를 읽고 느낌을 표현해요 ①",
      "std": "[2국05-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 기억에 남는 이야기 → 말·행동으로 마음 상상 → 자체 「두더지의 생일」 마음 짚기 → 비슷한 경험 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "이야기를 읽고 느낌을 표현해요",
          "subtitle": "8단원 · 5/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_story",
          "t_char"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "인물의 마음을 상상하며 이야기를 읽어요",
            "말과 행동에서 마음을 짐작해요",
            "이야기에 대한 생각·느낌을 떠올려요"
          ]
        },
        "suggested_extras": [
          "t_char"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "두더지가 혼자 시무룩해요 🐭",
          "visual": "😔",
          "question": "오늘은 두더지의 생일인데<br>\"아무도 내 생일을 모를 거야\" 하며 시무룩해요.<br>두더지는 어떤 마음일까요?",
          "img": "assets/photo/korean/g2u8_story1.jpg"
        },
        "suggested_extras": [
          "q_mole",
          "r_birthday"
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
              "q": "시를 읽고 떠오르는 것은?",
              "a": "장면과 느낌"
            },
            {
              "q": "느낌이 서로 다른 것은?",
              "a": "자연스러운 일이에요"
            }
          ],
          "from": "u8_l04"
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
          "title": "말·행동으로 마음을 상상해요",
          "content": "인물의 마음은 **말과 행동**에 드러나요. 「두더지의 생일」에서 두더지의 마음은 **시무룩함 → 깜짝 놀람 → 행복**으로 바뀌어요. 친구들이 몰래 잔치를 준비했거든요!",
          "symbol_meanings": [
            {
              "symbol": "혼자 시무룩",
              "meaning": "외롭고 쓸쓸한 마음"
            },
            {
              "symbol": "친구들 몰래 준비",
              "meaning": "기쁘게 해 주고 싶은 마음"
            },
            {
              "symbol": "\"생일 축하해!\"",
              "meaning": "두더지는 깜짝 놀라요"
            },
            {
              "symbol": "활짝 웃음",
              "meaning": "행복한 마음"
            }
          ]
        },
        "suggested_extras": [
          "t_change",
          "x_direct"
        ],
        "tnote": {
          "ask": [
            "이야기에서 무엇을 먼저 살펴보면 좋을까?"
          ],
          "watch": "인물·사건 찾기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 장면, 어떤 마음일까요? 💭",
          "sub": "「두더지의 생일」 장면 속 마음을 함께 짚어 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "두더지가 혼자 시무룩하게 앉아 있어요.",
              "emoji": "😔",
              "name": "외롭고 쓸쓸한 마음"
            },
            {
              "clue": "친구들이 몰래 생일잔치를 준비해요.",
              "emoji": "🎁",
              "name": "친구를 기쁘게 하고 싶은 마음"
            },
            {
              "clue": "문을 열자 친구들이 \"축하해!\" 외쳐요.",
              "emoji": "🥳",
              "name": "놀랍고 행복한 마음"
            }
          ],
          "outro": "같은 인물도 상황에 따라 마음이 바뀌어요. 말과 행동을 잘 살피면 마음이 보여요! 😊"
        },
        "suggested_extras": [
          "q_change",
          "g_mole"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "비슷한 경험을 나눠요",
          "question": "두더지와 비슷한 마음이 들었던 적 있나요?",
          "items": [
            "깜짝 선물이나 축하를 받아 본 적 있나요?",
            "그때 마음이 어땠나요?",
            "친구를 기쁘게 해 준 적이 있나요?"
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
          "title": "이야기를 읽고 느낌 표현하기 ① — 인물과 사건",
          "levels": {
            "읽기": {
              "q": "'착한 아우는 형에게 곡식을 나누어 주었어요.'를 또박또박 읽어 볼까요?",
              "a": "사건이 담긴 문장"
            },
            "쓰기": {
              "q": "이야기에서 일어난 일(사건)을 한 문장으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "이야기에서 누가(인물) 무엇을 했는지(사건) 짝에게 말해 봐요.",
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
          "title": "인물·사건 짚기 짝 활동",
          "type": "pair",
          "goal": "이야기의 인물과 사건을 찾아요",
          "body": "짝과 짧은 이야기를 읽고 누가 나오는지(인물), 무슨 일이 있었는지(사건)를 서로 짚어 말해요.",
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
              "q": "이야기에 나오는 사람이나 동물은?",
              "a": "인물"
            },
            {
              "q": "이야기에서 일어난 일은?",
              "a": "사건"
            },
            {
              "q": "인물과 사건을 알면?",
              "a": "이야기를 잘 이해해요"
            }
          ],
          "self": [
            "이야기의 인물과 사건을 찾아요",
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
            "말·행동에서 인물의 마음을 상상했어요",
            "인물의 마음이 바뀌는 것을 알았어요",
            "비슷한 내 경험을 떠올렸어요"
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
          "preview": "생각·느낌을 표현해요",
          "body": "다음 시간에는 이야기에서 기억에 남는 장면을 골라, 생각이나 느낌을 글이나 그림으로 표현해 볼 거예요!"
        },
        "suggested_extras": [
          "e_express"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_story",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋아하는 이야기",
        "content": "\"가장 좋아하는 이야기 속 인물은 누구인가요?\" 이야기와의 친밀감을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_char",
        "type": "tip",
        "icon": "🧩",
        "title": "인물에 초점",
        "content": "이 단원의 이야기 감상은 인물에 초점을 둬요. 인물의 말·행동을 중심으로 마음을 짚게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_mole",
        "type": "fun_question",
        "icon": "🐭",
        "title": "두더지의 마음",
        "content": "\"내가 두더지라면 그 순간 무슨 생각을 했을까요?\" 인물에 몰입하게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_birthday",
        "type": "real_world",
        "icon": "🌍",
        "title": "생일의 마음",
        "content": "내 생일을 기다리던 마음, 친구 생일을 축하한 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_change",
        "type": "tip",
        "icon": "🧩",
        "title": "마음의 변화",
        "content": "인물의 마음이 이야기 속에서 어떻게 바뀌는지 흐름을 따라가게 하면 감상이 깊어져요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_direct",
        "type": "misconception",
        "icon": "❓",
        "title": "마음은 숨어 있어요",
        "content": "'기쁘다·슬프다'가 직접 안 나와도 말·행동으로 짐작할 수 있음을 알려 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_change",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 바뀌었을까",
        "content": "\"두더지의 마음은 왜 바뀌었을까요?\" 마음 변화의 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mole",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 마음 짝짓기",
        "description": "두더지 이야기 장면과 마음을 짝지어 보세요.",
        "hint": "그 장면에서 두더지 마음을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "😔 혼자 앉음"
            },
            "b": {
              "text": "쓸쓸한 마음"
            }
          },
          {
            "a": {
              "text": "🎁 몰래 준비"
            },
            "b": {
              "text": "기쁘게 하고픈 마음"
            }
          },
          {
            "a": {
              "text": "🥳 축하받음"
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
        "content": "\"두더지의 친구라면 어떤 마음으로 잔치를 준비했을까요?\" 다른 인물 마음도 상상해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect5",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"인물의 마음은 무엇을 보고 짐작했죠?\" 말·행동을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_express",
        "type": "extension",
        "icon": "⬆",
        "title": "표현 예고",
        "content": "\"이 이야기에서 가장 기억에 남는 장면은?\" 다음 차시(표현)를 예고해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 6,
      "title": "이야기를 읽고 느낌을 표현해요 ②",
      "std": "[2국05-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 기억에 남는 장면 고르기 → 생각·느낌 표현 방법 → 표현 방법 고르기 → 발표하고 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "이야기를 읽고 느낌을 표현해요",
          "subtitle": "8단원 · 6/15차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_scene6",
          "t_express2"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "기억에 남는 장면을 골라요",
            "왜 기억에 남는지 까닭을 떠올려요",
            "생각·느낌을 글·그림·말로 표현해요"
          ]
        },
        "suggested_extras": [
          "t_express2"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "어떤 장면이 마음에 남았나요? 💗",
          "visual": "📖",
          "question": "「두더지의 생일」에서 가장 기억에 남는 장면은 무엇인가요?<br>왜 그 장면이 기억에 남나요?",
          "img": "assets/photo/korean/g2u8_story2.jpg"
        },
        "suggested_extras": [
          "q_pick",
          "r_share"
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
              "q": "이야기에 나오는 사람이나 동물은?",
              "a": "인물"
            },
            {
              "q": "이야기에서 일어난 일은?",
              "a": "사건"
            }
          ],
          "from": "u8_l05"
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
          "title": "생각·느낌을 표현하는 방법",
          "content": "감상은 **여러 가지 방법**으로 표현할 수 있어요. 기억에 남는 **장면**과 그 **까닭**, 그 장면에 대한 **내 생각**을 담으면 좋은 표현이 돼요!",
          "symbol_meanings": [
            {
              "symbol": "기억에 남는 장면",
              "meaning": "어떤 장면이었나요?"
            },
            {
              "symbol": "그 까닭",
              "meaning": "왜 기억에 남나요?"
            },
            {
              "symbol": "내 생각",
              "meaning": "그 장면을 보고 든 생각"
            },
            {
              "symbol": "표현 방법",
              "meaning": "글·그림·말 무엇이든 좋아요"
            }
          ]
        },
        "suggested_extras": [
          "t_why2",
          "x_short"
        ],
        "tnote": {
          "ask": [
            "어떤 장면이 왜 기억에 남았는지 어떻게 말할까?"
          ],
          "watch": "느낌 표현하기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이건 어떤 표현 방법일까요? ✍️",
          "sub": "감상을 표현하는 여러 방법이에요. 카드를 누르면 어떤 방법인지 나와요!",
          "cards": [
            {
              "clue": "기억에 남는 장면과 생각을 공책에 써요.",
              "emoji": "✍️",
              "name": "글로 표현하기"
            },
            {
              "clue": "장면을 떠올려 그림으로 그려요.",
              "emoji": "🎨",
              "name": "그림으로 표현하기"
            },
            {
              "clue": "친구에게 장면과 느낌을 말해요.",
              "emoji": "🗣️",
              "name": "말로 표현하기"
            }
          ],
          "outro": "글이 어려우면 그림이나 말로 표현해도 좋아요. 까닭을 담는 것이 가장 중요해요! 😊"
        },
        "suggested_extras": [
          "q_way2",
          "g_way"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "생각·느낌을 발표해요",
          "question": "고른 장면과 느낌을 친구들에게 발표해요.",
          "items": [
            "어떤 장면을 골랐나요?",
            "왜 그 장면이 기억에 남나요?",
            "그 장면을 보고 어떤 생각이 들었나요?"
          ]
        },
        "suggested_extras": [
          "t_present6",
          "e_friend"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "이야기를 읽고 느낌 표현하기 ② — 느낌 표현하기",
          "levels": {
            "읽기": {
              "q": "'아우가 참 착하다는 생각이 들었어요.'를 느낌을 담아 읽어 볼까요?",
              "a": "느낌을 표현한 문장"
            },
            "쓰기": {
              "q": "이야기를 읽고 든 느낌을 '~해서 ~한 느낌이 들었어요'로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "가장 기억에 남는 장면과 그 까닭을 짝에게 말해 봐요.",
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
          "title": "느낌 표현 나누기 짝 활동",
          "type": "pair",
          "goal": "이야기를 읽고 느낌을 표현해요",
          "body": "짝과 같은 이야기를 읽고 기억에 남는 장면과 느낌을 까닭과 함께 서로 말해요.",
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
              "q": "이야기를 읽고 표현하는 것은?",
              "a": "느낌(생각)"
            },
            {
              "q": "느낌을 말할 때 함께 밝히면 좋은 것은?",
              "a": "장면과 까닭"
            },
            {
              "q": "느낌을 표현하면?",
              "a": "감상이 더 깊어져요"
            }
          ],
          "self": [
            "이야기를 읽고 느낌을 표현해요",
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
            "기억에 남는 장면과 까닭을 떠올렸어요",
            "생각·느낌을 여러 방법으로 표현했어요",
            "친구의 감상을 들으며 견주어 봤어요"
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
          "preview": "인형극을 감상하고 인물의 마음을 짐작해요",
          "body": "다음 시간에는 인형극을 감상하며 인물의 말·행동·목소리로 마음을 짐작해 볼 거예요!"
        },
        "suggested_extras": [
          "e_puppet"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_scene6",
        "type": "fun_question",
        "icon": "💡",
        "title": "장면 떠올리기",
        "content": "\"눈을 감고 이야기에서 한 장면을 떠올려 볼까요?\" 표현의 재료를 끌어내요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_express2",
        "type": "tip",
        "icon": "🧩",
        "title": "부담 없이",
        "content": "긴 글을 강요하지 말고 그림·말로도 표현할 수 있게 해 쓰기 부담을 줄이세요(지도서 유의점).",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_pick",
        "type": "fun_question",
        "icon": "💗",
        "title": "마음에 남은 장면",
        "content": "\"왜 하필 그 장면이 마음에 남았을까요?\" 까닭을 떠올리게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_share",
        "type": "real_world",
        "icon": "🌍",
        "title": "감상 나누기",
        "content": "영화·만화를 보고 친구와 \"그 장면 좋았어\" 나눈 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_why2",
        "type": "tip",
        "icon": "🧩",
        "title": "까닭이 핵심",
        "content": "단순한 줄거리 요약이 아니라 '왜 그렇게 느꼈는지' 까닭을 담게 하는 것이 핵심이에요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_short",
        "type": "misconception",
        "icon": "❓",
        "title": "단답은 아쉬워요",
        "content": "\"재미있다\"로만 끝내지 않게, 어떤 점에서 그런지 한마디라도 까닭을 덧붙이게 하세요.",
        "fit_slides": [
          "concept",
          "question"
        ]
      },
      {
        "id": "q_way2",
        "type": "fun_question",
        "icon": "💡",
        "title": "나는 어떻게?",
        "content": "\"나는 어떤 방법으로 표현하고 싶나요?\" 표현 방법을 스스로 고르게 해요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_way",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "방법 ↔ 모습 짝짓기",
        "description": "표현 방법과 그 모습을 짝지어 보세요.",
        "hint": "무엇으로 표현하는지 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "✍️ 글"
            },
            "b": {
              "text": "공책에 써요"
            }
          },
          {
            "a": {
              "text": "🎨 그림"
            },
            "b": {
              "text": "장면을 그려요"
            }
          },
          {
            "a": {
              "text": "🗣️ 말"
            },
            "b": {
              "text": "친구에게 말해요"
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
        "title": "까닭과 함께",
        "content": "발표할 때 \"왜냐하면…\"으로 까닭을 함께 말하게 하고, 친구 발표의 좋은 점을 찾게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_friend",
        "type": "extension",
        "icon": "⬆",
        "title": "친구와 견주기",
        "content": "\"친구는 나와 다른 장면을 골랐나요? 왜 그럴까요?\" 다양한 감상을 인정하게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect6",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"좋은 감상 표현에는 무엇이 들어가야 하죠?\" 장면·까닭·생각을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_puppet",
        "type": "extension",
        "icon": "⬆",
        "title": "인형극 예고",
        "content": "\"다음엔 인형극 속 인물의 마음을 짐작해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 7,
      "title": "인형극을 감상하고 인물 마음을 짐작해요 ①",
      "std": "[2국05-02] · [2국06-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 인형극 종류 → 마음 짐작 방법(말·행동·목소리) → 전래 「해와 달이 된 오누이」 장면 마음 짚기 → 마음 발표 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인형극을 감상하고 인물 마음을 짐작해요",
          "subtitle": "8단원 · 7/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_seen",
          "t_puppet"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "인형극에는 어떤 종류가 있는지 알아봐요",
            "인물의 마음을 짐작하는 방법을 배워요",
            "인형극 장면 속 인물의 마음을 짐작해요"
          ]
        },
        "suggested_extras": [
          "t_puppet"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "빛으로 만든 그림자 인형극 🌑",
          "visual": "🎭",
          "question": "인형이 나와 말과 행동으로 이야기를 보여 주는 것이 인형극이에요.<br>어떤 인형극을 본 적이 있나요?",
          "img": "assets/photo/korean/g2u8_play1.jpg"
        },
        "suggested_extras": [
          "q_kind7",
          "r_puppet"
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
              "q": "이야기를 읽고 표현하는 것은?",
              "a": "느낌(생각)"
            },
            {
              "q": "느낌을 말할 때 함께 밝히면 좋은 것은?",
              "a": "장면과 까닭"
            }
          ],
          "from": "u8_l06"
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
          "title": "마음을 짐작하는 방법",
          "content": "인형극에서 인물의 마음은 **말·행동·목소리**에 드러나요. 무엇을 하는지, 어떤 말을 하는지, 목소리의 **크기와 빠르기**가 어떤지 잘 살피면 마음이 보여요!",
          "symbol_meanings": [
            {
              "symbol": "행동 보기",
              "meaning": "무엇을 하나요?"
            },
            {
              "symbol": "말 듣기",
              "meaning": "어떤 말을 하나요?"
            },
            {
              "symbol": "목소리",
              "meaning": "크기·빠르기는 어떤가요?"
            },
            {
              "symbol": "마음 짐작",
              "meaning": "세 가지를 모아 마음을 알아요"
            }
          ]
        },
        "suggested_extras": [
          "t_clue",
          "x_machine"
        ],
        "tnote": {
          "ask": [
            "인형극은 이야기책과 무엇이 다를까?"
          ],
          "watch": "인형극 특징 알기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 장면, 어떤 마음일까요? 💭",
          "sub": "전래 인형극 「해와 달이 된 오누이」 장면이에요. 말·행동으로 마음을 짚어 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "호랑이가 엄마 목소리를 흉내 내며 \"엄마가 왔단다\" 해요.",
              "emoji": "😼",
              "name": "오누이를 속이려는 마음"
            },
            {
              "clue": "오누이가 나무 위에서 두 손 모아 빌어요.",
              "emoji": "🙏",
              "name": "다급하고 간절한 마음"
            },
            {
              "clue": "하늘에서 동아줄이 내려오는 것을 봐요.",
              "emoji": "😄",
              "name": "기쁘고 안심한 마음"
            }
          ],
          "outro": "말과 행동을 잘 살피면 인물의 마음이 보여요. 목소리도 단서가 된답니다! 😊"
        },
        "suggested_extras": [
          "q_voice",
          "g_clue"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "짐작한 마음을 발표해요",
          "question": "기억에 남는 장면 속 인물의 마음은 어땠을까요?",
          "items": [
            "어떤 장면을 골랐나요?",
            "그 인물은 어떤 마음이었을까요?",
            "무엇을 보고 그렇게 짐작했나요?"
          ]
        },
        "suggested_extras": [
          "t_present7",
          "e_more7"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인형극 감상하고 마음 짐작하기 ① — 인형극 만나기",
          "levels": {
            "읽기": {
              "q": "'인형극은 인형으로 이야기를 보여 주는 극이에요.'를 또박또박 읽어 볼까요?",
              "a": "인형극 뜻 문장"
            },
            "쓰기": {
              "q": "인형극에서 인물의 마음은 무엇을 보고 알 수 있는지 써 볼까요?",
              "a": "목소리·움직임·표정"
            },
            "말하기": {
              "q": "인형극과 이야기책의 다른 점을 짝에게 말해 봐요.",
              "a": "인형극은 목소리·움직임으로 보여 줘요"
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
          "title": "인형극 상상 짝 활동",
          "type": "pair",
          "goal": "인형극의 특징을 알아요",
          "body": "짝과 좋아하는 이야기를 인형극으로 만든다면 인형이 어떻게 움직이고 말할지 상상해 이야기해요.",
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
              "q": "인형으로 이야기를 보여 주는 극은?",
              "a": "인형극"
            },
            {
              "q": "인형극에서 마음은 무엇으로 나타내나요?",
              "a": "목소리·움직임·표정"
            },
            {
              "q": "인형극을 보면?",
              "a": "이야기를 생생하게 느껴요"
            }
          ],
          "self": [
            "인형극의 특징을 알아요",
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
            "인형극에는 여러 종류가 있어요",
            "말·행동·목소리로 마음을 짐작해요",
            "장면 속 인물의 마음을 짚어 봤어요"
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
          "preview": "인형극을 감상하고 느낌을 표현해요",
          "body": "다음 시간에는 또 다른 인형극을 보고, 인물에게 편지를 쓰며 생각·느낌을 표현해 볼 거예요!"
        },
        "suggested_extras": [
          "e_express7"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_seen",
        "type": "fun_question",
        "icon": "💡",
        "title": "본 인형극",
        "content": "\"어디에서 인형극을 본 적이 있나요?\" 안전 교육·공연 등 경험을 끌어내요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_puppet",
        "type": "tip",
        "icon": "🧩",
        "title": "감상 전·중·후",
        "content": "인형극은 감상 전(예측)·중(질문 만들기)·후(삶과 잇기) 활동으로 감상을 심화하게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_kind7",
        "type": "fun_question",
        "icon": "🎭",
        "title": "인형극 종류",
        "content": "\"그림자·막대·손가락 인형극, 무엇이 떠오르나요?\" 다양한 인형극을 알게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_puppet",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 둘레 인형극",
        "content": "인형 탈·꼭두각시·텔레비전 인형 프로그램 등과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_clue",
        "type": "tip",
        "icon": "🧩",
        "title": "역동적인 장면",
        "content": "마음을 짐작하기 쉽도록 인물의 말·행동이 또렷한 장면을 골라 보여 주세요(지도서 유의점).",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_machine",
        "type": "misconception",
        "icon": "❓",
        "title": "기계적이지 않게",
        "content": "마음 짐작을 문제 풀듯 기계적으로 하지 않게, 말·행동을 통해 자연스럽게 느끼도록 이끄세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_voice",
        "type": "fun_question",
        "icon": "🔊",
        "title": "목소리의 비밀",
        "content": "\"무서운 마음일 때 목소리는 어떻게 변할까요?\" 목소리 단서를 느끼게 해요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_clue",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장면 ↔ 마음 짝짓기",
        "description": "인형극 장면과 인물의 마음을 짝지어 보세요.",
        "hint": "말·행동을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "😼 목소리 흉내"
            },
            "b": {
              "text": "속이려는 마음"
            }
          },
          {
            "a": {
              "text": "🙏 두 손 모아 빎"
            },
            "b": {
              "text": "간절한 마음"
            }
          },
          {
            "a": {
              "text": "😄 동아줄 봄"
            },
            "b": {
              "text": "안심한 마음"
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
        "title": "구체적인 장면",
        "content": "포괄적 감상보다 특정 장면에 대한 구체적인 마음을 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more7",
        "type": "extension",
        "icon": "⬆",
        "title": "인물 따라잡기",
        "content": "\"인물은 어떻게 어려움을 해결했나요?\" 인물의 변화를 따라가게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect7",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"마음을 짐작하는 세 가지 단서는?\" 말·행동·목소리를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_express7",
        "type": "extension",
        "icon": "⬆",
        "title": "표현 예고",
        "content": "\"다음엔 인형극을 보고 인물에게 편지를 써요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 8,
      "title": "인형극을 감상하고 인물 마음을 짐작해요 ②",
      "std": "[2국05-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 마음 단서 다시 보기 → 일이 일어난 차례 → 장면별 마음 짚기 → 인형극과 책 견주기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인형극을 감상하고 인물 마음을 짐작해요",
          "subtitle": "8단원 · 8/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_recall8",
          "t_order"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "일이 일어난 차례를 정리해요",
            "장면마다 인물의 마음을 짚어요",
            "인형극과 이야기책을 견주어 봐요"
          ]
        },
        "suggested_extras": [
          "t_order"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "이야기는 장소가 바뀌어요 🏡",
          "visual": "🗺️",
          "question": "「해와 달이 된 오누이」는 집 → 고개 → 집 → 나무 위로 장소가 바뀌어요.<br>각 장소에서 무슨 일이 있었을까요?",
          "img": "assets/photo/korean/g2u8_play2.jpg"
        },
        "suggested_extras": [
          "q_place",
          "r_order"
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
              "q": "인형으로 이야기를 보여 주는 극은?",
              "a": "인형극"
            },
            {
              "q": "인형극에서 마음은 무엇으로 나타내나요?",
              "a": "목소리·움직임·표정"
            }
          ],
          "from": "u8_l07"
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
          "title": "일이 일어난 차례",
          "content": "이야기는 **차례**대로 일어나요. 장소가 바뀔 때마다 무슨 일이 있었는지 정리하면 **줄거리**가 한눈에 보여요.",
          "symbol_meanings": [
            {
              "symbol": "집",
              "meaning": "엄마가 길을 떠나고 오누이만 남아요"
            },
            {
              "symbol": "고개",
              "meaning": "호랑이가 나타나요"
            },
            {
              "symbol": "집",
              "meaning": "호랑이가 엄마인 척 찾아와요"
            },
            {
              "symbol": "나무 위",
              "meaning": "오누이가 하늘로 올라가요"
            }
          ]
        },
        "suggested_extras": [
          "t_summary8",
          "x_jump"
        ],
        "tnote": {
          "ask": [
            "말이 없어도 마음을 어떻게 알 수 있을까?"
          ],
          "watch": "인형극 마음 짐작",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "장면 속 마음을 다시 짚어요 💭",
          "sub": "말·행동을 보고 인물의 마음을 짚어 봐요. 카드를 누르면 마음이 나와요!",
          "cards": [
            {
              "clue": "호랑이가 엄마 손이라며 손을 보여 달라 해요.",
              "emoji": "🐯",
              "name": "의심하고 살피는 마음"
            },
            {
              "clue": "오누이가 손에 기름을 발랐다며 둘러대요.",
              "emoji": "😬",
              "name": "겁나지만 꾀를 내는 마음"
            },
            {
              "clue": "썩은 동아줄을 잡은 호랑이가 떨어져요.",
              "emoji": "😮",
              "name": "보는 사람은 통쾌한 마음"
            }
          ],
          "outro": "장면마다 인물의 마음이 달라요. 말과 행동을 따라가면 마음이 보여요! 😊"
        },
        "suggested_extras": [
          "q_why8",
          "g_order"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "인형극과 책을 견주어요",
          "question": "같은 이야기를 인형극과 책으로 만나면 어떻게 다를까요?",
          "items": [
            "인형극과 책에서 비슷한 점은 무엇인가요?",
            "다른 점은 무엇인가요?",
            "어느 쪽이 더 마음에 들었나요? 왜요?"
          ]
        },
        "suggested_extras": [
          "t_compare",
          "e_book8"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인형극 감상하고 마음 짐작하기 ② — 인물 마음 짐작",
          "levels": {
            "읽기": {
              "q": "'인형이 고개를 푹 숙였어요. 마음이 어땠을까요?'를 읽으며 마음을 짐작해 볼까요?",
              "a": "마음을 짐작하는 문장"
            },
            "쓰기": {
              "q": "인형의 움직임이나 목소리를 보고 짐작한 마음을 한 낱말로 써 볼까요?",
              "a": "여러 답 (예: 슬픔·기쁨)",
              "open": true
            },
            "말하기": {
              "q": "그렇게 짐작한 까닭을 짝에게 말해 봐요.",
              "a": "움직임·목소리에서"
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
          "title": "움직임으로 마음 맞히기 짝 활동",
          "type": "pair",
          "goal": "인형극 속 인물의 마음을 짐작해요",
          "body": "짝이 인형처럼 몸짓·목소리로 마음을 나타내면 어떤 마음인지 맞히고, 번갈아 해요.",
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
              "q": "인형극에서 마음은 무엇으로 짐작하나요?",
              "a": "움직임·목소리·표정"
            },
            {
              "q": "고개를 숙인 인형의 마음은?",
              "a": "슬프거나 속상한 마음"
            },
            {
              "q": "마음을 짐작하며 보면?",
              "a": "인형극이 더 재미있어요"
            }
          ],
          "self": [
            "인형극 속 마음을 짐작해요",
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
            "일이 일어난 차례를 정리했어요",
            "장면마다 인물의 마음을 짚었어요",
            "인형극과 책을 견주어 봤어요"
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
          "preview": "인형극을 감상하고 느낌을 표현해요",
          "body": "다음 시간에는 「의좋은 형제」를 보고, 인물에게 편지를 쓰며 생각·느낌을 표현해 볼 거예요!"
        },
        "suggested_extras": [
          "e_letter"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall8",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 장면",
        "content": "\"지난 시간에 본 인형극에서 가장 기억에 남는 장면은?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_order",
        "type": "tip",
        "icon": "🧩",
        "title": "차례 정리",
        "content": "장소가 바뀌는 지점을 기준으로 일이 일어난 차례를 정리하게 하면 줄거리 파악이 쉬워요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_place",
        "type": "fun_question",
        "icon": "🗺️",
        "title": "장소 따라가기",
        "content": "\"이야기에서 장소가 몇 번 바뀌나요?\" 장면 전환을 짚게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_order",
        "type": "real_world",
        "icon": "🌍",
        "title": "하루의 차례",
        "content": "내 하루도 차례가 있듯 이야기에도 차례가 있음을 이어 주세요.",
        "fit_slides": [
          "motivate",
          "concept"
        ]
      },
      {
        "id": "t_summary8",
        "type": "tip",
        "icon": "🧩",
        "title": "한 문장씩",
        "content": "각 장소의 일을 한 문장으로 말하게 한 뒤 전체 줄거리를 이어 말하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_jump",
        "type": "misconception",
        "icon": "❓",
        "title": "차례를 건너뛰지 않게",
        "content": "가운데 일을 빠뜨리고 처음·끝만 말하는 경우가 있어요. 빠진 차례를 채우도록 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_why8",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 통쾌할까",
        "content": "\"호랑이가 떨어질 때 왜 통쾌했을까요?\" 마음의 까닭을 묻어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_order",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장소 ↔ 일 짝짓기",
        "description": "장소와 그곳에서 일어난 일을 짝지어 보세요.",
        "hint": "차례를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🏡 집"
            },
            "b": {
              "text": "오누이만 남음"
            }
          },
          {
            "a": {
              "text": "⛰️ 고개"
            },
            "b": {
              "text": "호랑이 나타남"
            }
          },
          {
            "a": {
              "text": "🌳 나무 위"
            },
            "b": {
              "text": "하늘로 올라감"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_compare",
        "type": "tip",
        "icon": "🗣",
        "title": "견주어 보기",
        "content": "같은 이야기를 인형극·책으로 견주며 느낌의 차이를 말하게 하면 감상이 깊어져요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_book8",
        "type": "book",
        "icon": "📖",
        "title": "옛이야기 책",
        "content": "「해와 달이 된 오누이」 그림책을 함께 보며 인형극과 견주어 보세요.",
        "source": "전래동화(여러 출판사 — 임의 선택)",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect8",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"이야기의 차례를 어떻게 정리했죠?\" 장소·일을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_letter",
        "type": "extension",
        "icon": "⬆",
        "title": "편지 예고",
        "content": "\"인물에게 하고 싶은 말이 있나요?\" 다음 차시(편지)를 예고해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 9,
      "title": "인형극을 감상하고 느낌을 표현해요 ①",
      "std": "[2국05-03] · [2국05-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 「의좋은 형제」 감상 → 일 일어난 차례 → 재미있는 장면 찾기 → 인상 깊은 장면 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인형극을 감상하고 느낌을 표현해요",
          "subtitle": "8단원 · 9/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_bros",
          "t_act9"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "「의좋은 형제」 인형극을 감상해요",
            "일이 일어난 차례를 정리해요",
            "재미있게 느껴지는 장면을 찾아요"
          ]
        },
        "suggested_extras": [
          "t_act9"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "형과 아우가 사이좋아요 🌾",
          "visual": "🌾",
          "question": "형과 아우가 서로를 아끼며 농사를 지어요.<br>두 형제는 어떤 사이일까요?",
          "img": "assets/photo/korean/g2u8_feel1.jpg"
        },
        "suggested_extras": [
          "q_bros2",
          "r_family"
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
              "q": "인형극에서 마음은 무엇으로 짐작하나요?",
              "a": "움직임·목소리·표정"
            },
            {
              "q": "마음을 짐작하며 보면?",
              "a": "인형극이 더 재미있어요"
            }
          ],
          "from": "u8_l08"
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
          "title": "「의좋은 형제」 이야기",
          "content": "형과 아우는 서로에게 **볏단이 더 필요할 거라** 생각해 밤마다 **몰래** 볏단을 옮겨요. 그래서 볏단이 줄지 않았지요. 마침내 서로의 마음을 알고 **얼싸안아요**.",
          "symbol_meanings": [
            {
              "symbol": "사이좋게 농사",
              "meaning": "형과 아우가 서로 아껴요"
            },
            {
              "symbol": "몰래 볏단 옮기기",
              "meaning": "상대를 위하는 마음"
            },
            {
              "symbol": "볏단이 그대로",
              "meaning": "어리둥절해요"
            },
            {
              "symbol": "마주쳐 얼싸안음",
              "meaning": "서로의 마음에 감동해요"
            }
          ]
        },
        "suggested_extras": [
          "t_order9",
          "b_bros"
        ],
        "tnote": {
          "ask": [
            "어떤 장면이 왜 마음에 남았을까?"
          ],
          "watch": "기억 장면·느낌",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "일이 일어난 차례를 맞혀요 🔢",
          "sub": "「의좋은 형제」에서 일이 일어난 차례를 함께 정리해요. 카드를 누르면 차례가 나와요!",
          "cards": [
            {
              "clue": "형제가 사이좋게 농사를 지어요.",
              "emoji": "🌾",
              "name": "처음 — 농사짓기"
            },
            {
              "clue": "서로 몰래 볏단을 옮겨요.",
              "emoji": "🌙",
              "name": "가운데 — 몰래 옮기기"
            },
            {
              "clue": "마주쳐 서로의 마음을 알고 얼싸안아요.",
              "emoji": "🤗",
              "name": "끝 — 마음을 알고 감동"
            }
          ],
          "outro": "차례를 정리하면 줄거리가 한눈에 보여요. 어떤 장면이 가장 재미있었나요? 😊"
        },
        "suggested_extras": [
          "q_funny",
          "g_bros"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "인상 깊은 장면을 나눠요",
          "question": "가장 기억에 남는 장면은 무엇인가요?",
          "items": [
            "어떤 장면이 가장 재미있거나 인상 깊었나요?",
            "왜 그 장면이 기억에 남나요?",
            "그 장면에서 인물은 어떤 마음이었을까요?"
          ]
        },
        "suggested_extras": [
          "t_present9",
          "e_mine9"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인형극 감상하고 느낌 표현하기 ① — 기억에 남는 장면",
          "levels": {
            "읽기": {
              "q": "'토끼가 꾀를 내는 장면이 가장 재미있었어요.'를 느낌을 담아 읽어 볼까요?",
              "a": "기억에 남는 장면 문장"
            },
            "쓰기": {
              "q": "인형극에서 기억에 남는 장면을 한 문장 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "그 장면이 왜 기억에 남는지 짝에게 말해 봐요.",
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
          "title": "기억 장면 나누기 짝 활동",
          "type": "pair",
          "goal": "인형극에서 기억에 남는 장면을 나눠요",
          "body": "짝과 인형극에서 가장 기억에 남는 장면을 하나씩 말하고, 그 까닭을 서로 이야기해요.",
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
              "q": "느낌을 표현할 때 먼저 떠올리는 것은?",
              "a": "기억에 남는 장면"
            },
            {
              "q": "장면과 함께 말하면 좋은 것은?",
              "a": "기억에 남는 까닭"
            },
            {
              "q": "장면을 떠올리면?",
              "a": "느낌을 잘 표현해요"
            }
          ],
          "self": [
            "기억에 남는 장면으로 느낌을 표현해요",
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
            "「의좋은 형제」를 감상했어요",
            "일이 일어난 차례를 정리했어요",
            "인상 깊은 장면을 찾아 나눴어요"
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
          "preview": "인물에게 편지를 써요",
          "body": "다음 시간에는 형과 아우에게 하고 싶은 말을 담아 편지를 쓰며 생각·느낌을 표현해 볼 거예요!"
        },
        "suggested_extras": [
          "e_letter9"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_bros",
        "type": "fun_question",
        "icon": "💡",
        "title": "형제·자매",
        "content": "\"형제나 자매와 서로 도운 적이 있나요?\" 이야기와 경험을 이어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_act9",
        "type": "tip",
        "icon": "🧩",
        "title": "적극적 감상",
        "content": "인형극을 보며 인물의 말·행동을 직접 찾아보게 해 적극적인 감상이 되게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_bros2",
        "type": "fun_question",
        "icon": "🌾",
        "title": "형제의 사이",
        "content": "\"두 형제는 서로를 어떻게 생각했을까요?\" 인물 관계를 짚어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_family",
        "type": "real_world",
        "icon": "🌍",
        "title": "서로 돕기",
        "content": "가족이 말없이 나를 챙겨 준 경험과 이어 형제의 마음을 느끼게 해요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_order9",
        "type": "tip",
        "icon": "🧩",
        "title": "차례 정리",
        "content": "사진·장면마다 번호를 붙이고 한 문장으로 설명한 뒤 줄거리를 이어 말하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "b_bros",
        "type": "book",
        "icon": "📖",
        "title": "옛이야기 책",
        "content": "「의좋은 형제」 그림책으로 인형극과 견주어 볼 수 있어요.",
        "source": "전래동화(여러 출판사 — 임의 선택)",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_funny",
        "type": "fun_question",
        "icon": "💡",
        "title": "재미의 까닭",
        "content": "\"어리둥절한 장면이 왜 재미있을까요?\" 재미가 '우스움'만이 아님을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_bros",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "차례 ↔ 일 짝짓기",
        "description": "이야기 차례와 일어난 일을 짝지어 보세요.",
        "hint": "먼저 일어난 일부터 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🌾 처음"
            },
            "b": {
              "text": "사이좋게 농사"
            }
          },
          {
            "a": {
              "text": "🌙 가운데"
            },
            "b": {
              "text": "몰래 볏단 옮기기"
            }
          },
          {
            "a": {
              "text": "🤗 끝"
            },
            "b": {
              "text": "마음 알고 감동"
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
        "title": "까닭과 함께",
        "content": "인상 깊은 장면을 말할 때 왜 그런지 까닭을 함께 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_mine9",
        "type": "extension",
        "icon": "⬆",
        "title": "나라면",
        "content": "\"내가 형이라면 어떻게 했을까요?\" 인물과 자신을 이어 보게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect9",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"이야기 차례를 어떻게 정리했죠?\" 처음·가운데·끝을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_letter9",
        "type": "extension",
        "icon": "⬆",
        "title": "편지 예고",
        "content": "\"형과 아우에게 어떤 말을 해 주고 싶나요?\" 다음 차시(편지)를 예고해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l10"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 10,
      "title": "인형극을 감상하고 느낌을 표현해요 ②",
      "std": "[2국05-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 인물에게 하고 싶은 말 → 편지에 담을 것 → 편지 쓰기 → 마음 담아 표현 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인형극을 감상하고 느낌을 표현해요",
          "subtitle": "8단원 · 10/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_say",
          "t_letter"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "인물에게 하고 싶은 말을 떠올려요",
            "편지에 담을 내용을 정해요",
            "인물에게 편지를 써요"
          ]
        },
        "suggested_extras": [
          "t_letter"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "형에게 편지를 쓴다면? ✉️",
          "visual": "💌",
          "question": "동생을 아끼는 형의 마음이 감동적이었어요.<br>형에게 어떤 말을 해 주고 싶나요?",
          "img": "assets/photo/korean/g2u8_feel2.jpg"
        },
        "suggested_extras": [
          "q_to",
          "r_letter"
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
              "q": "느낌을 표현할 때 먼저 떠올리는 것은?",
              "a": "기억에 남는 장면"
            },
            {
              "q": "장면과 함께 말하면 좋은 것은?",
              "a": "기억에 남는 까닭"
            }
          ],
          "from": "u8_l09"
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
          "title": "편지에 담을 것",
          "content": "인물에게 쓰는 편지에는 **인물에게 하고 싶은 말**과 **그렇게 생각한 까닭**을 담아요. 형식에 너무 얽매이지 말고 마음을 솔직하게 표현하면 돼요!",
          "symbol_meanings": [
            {
              "symbol": "받는 사람",
              "meaning": "누구에게 쓸까요? (형·아우)"
            },
            {
              "symbol": "하고 싶은 말",
              "meaning": "감동·칭찬·궁금한 점"
            },
            {
              "symbol": "그 까닭",
              "meaning": "왜 그렇게 생각했나요?"
            },
            {
              "symbol": "내 다짐",
              "meaning": "본받고 싶은 점도 좋아요"
            }
          ]
        },
        "suggested_extras": [
          "t_free10",
          "x_form"
        ],
        "tnote": {
          "ask": [
            "인물에게 말을 건다면 무엇을 말하고 싶을까?"
          ],
          "watch": "인물에게 말 걸기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이런 말을 담을 수 있어요 ✍️",
          "sub": "인물에게 쓰는 편지에 담을 수 있는 말이에요. 카드를 누르면 예가 나와요!",
          "cards": [
            {
              "clue": "형의 어떤 점이 감동적이었는지 말한다면?",
              "emoji": "💗",
              "name": "\"동생을 아끼는 마음이 감동적이었어요.\""
            },
            {
              "clue": "본받고 싶은 점을 말한다면?",
              "emoji": "🌟",
              "name": "\"저도 형처럼 동생을 아껴 줄게요.\""
            },
            {
              "clue": "성실한 아우에게 말한다면?",
              "emoji": "💪",
              "name": "\"열심히 배우는 모습이 멋졌어요.\""
            }
          ],
          "outro": "마음을 담아 솔직하게 쓰면 돼요. 짧아도 까닭이 있으면 좋은 편지예요! 😊"
        },
        "suggested_extras": [
          "q_pick10",
          "g_letter"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "편지를 써 봐요",
          "question": "누구에게 어떤 마음을 전하고 싶나요?",
          "items": [
            "형·아우 중 누구에게 쓸 건가요?",
            "어떤 말을 해 주고 싶나요?",
            "왜 그렇게 생각했나요?"
          ]
        },
        "suggested_extras": [
          "t_write",
          "e_other"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인형극 감상하고 느낌 표현하기 ② — 인물에게 말 걸기",
          "levels": {
            "읽기": {
              "q": "'토끼야, 정말 지혜롭구나!'처럼 인물에게 건네는 말을 읽어 볼까요?",
              "a": "인물에게 건네는 말"
            },
            "쓰기": {
              "q": "인형극 속 인물에게 하고 싶은 말을 한 문장 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "왜 그 인물에게 그런 말을 하고 싶은지 짝에게 말해 봐요.",
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
          "title": "인물에게 편지 한 줄 짝 활동",
          "type": "pair",
          "goal": "인물에게 말을 건네며 느낌을 표현해요",
          "body": "짝과 인형극 속 인물에게 하고 싶은 말을 한 줄씩 써서 읽어 주고, 서로 이야기해요.",
          "materials": [
            "쪽지 종이"
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
              "q": "느낌을 표현하는 또 다른 방법은?",
              "a": "인물에게 말 걸기"
            },
            {
              "q": "인물에게 말할 때 담는 것은?",
              "a": "내 생각과 마음"
            },
            {
              "q": "인물에게 말을 걸면?",
              "a": "작품과 더 가까워져요"
            }
          ],
          "self": [
            "인물에게 말을 걸며 느낌을 표현해요",
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
            "인물에게 하고 싶은 말을 떠올렸어요",
            "하고 싶은 말과 까닭을 담아 편지를 썼어요",
            "마음을 솔직하게 표현했어요"
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
          "preview": "쓴 편지를 발표하고 나눠요",
          "body": "다음 시간에는 쓴 편지를 친구들 앞에서 발표하고, 서로의 감상을 견주어 들어 볼 거예요!"
        },
        "suggested_extras": [
          "e_share10"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_say",
        "type": "fun_question",
        "icon": "💡",
        "title": "하고 싶은 말",
        "content": "\"인물을 직접 만난다면 무슨 말을 하고 싶나요?\" 편지의 마음을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_letter",
        "type": "tip",
        "icon": "🧩",
        "title": "형식보다 마음",
        "content": "인사·날짜·보낸 사람 등 편지 형식에 너무 얽매이지 않게 마음 표현에 집중하게 하세요(지도서 유의점).",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_to",
        "type": "fun_question",
        "icon": "✉️",
        "title": "누구에게?",
        "content": "\"형·아우 말고 다른 인물에게 써도 될까요?\" 자유로운 선택을 열어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_letter",
        "type": "real_world",
        "icon": "🌍",
        "title": "마음을 담은 쪽지",
        "content": "고마운 사람에게 쪽지·편지를 써 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_free10",
        "type": "tip",
        "icon": "🧩",
        "title": "부담 줄이기",
        "content": "분량을 강요하지 말고, 쓰기 어려워하면 말로 표현하게 해도 좋아요.",
        "fit_slides": [
          "concept",
          "question"
        ]
      },
      {
        "id": "x_form",
        "type": "misconception",
        "icon": "❓",
        "title": "줄거리 베끼기 아니에요",
        "content": "줄거리만 옮기지 않게, 인물에게 하고 싶은 말과 까닭을 담게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick10",
        "type": "fun_question",
        "icon": "💡",
        "title": "나는 어떤 말?",
        "content": "\"나는 어떤 말을 가장 하고 싶나요?\" 자기 마음을 고르게 해요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_letter",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "마음 ↔ 말 짝짓기",
        "description": "전하고 싶은 마음과 편지 속 말을 짝지어 보세요.",
        "hint": "어떤 마음을 담는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "💗 감동"
            },
            "b": {
              "text": "\"감동적이었어요\""
            }
          },
          {
            "a": {
              "text": "🌟 본받기"
            },
            "b": {
              "text": "\"본받고 싶어요\""
            }
          },
          {
            "a": {
              "text": "💪 칭찬"
            },
            "b": {
              "text": "\"멋졌어요\""
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_write",
        "type": "tip",
        "icon": "🗣",
        "title": "까닭 담기",
        "content": "\"왜냐하면…\"을 넣어 까닭이 드러나는 편지를 쓰게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_other",
        "type": "extension",
        "icon": "⬆",
        "title": "다른 인물에게",
        "content": "\"형의 부인이나 다른 인물에게 써도 좋아요.\" 자유롭게 확장하게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect10",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"좋은 편지에는 무엇이 들어가야 하죠?\" 하고 싶은 말·까닭을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_share10",
        "type": "extension",
        "icon": "⬆",
        "title": "발표 예고",
        "content": "\"다음엔 쓴 편지를 친구들에게 발표해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l11"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 11,
      "title": "인형극을 감상하고 느낌을 표현해요 ③",
      "std": "[2국05-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 발표 준비 → 듣기 약속 → 편지 발표 → 친구 감상과 견주어 듣기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인형극을 감상하고 느낌을 표현해요",
          "subtitle": "8단원 · 11/15차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_ready11",
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
            "쓴 편지를 발표할 준비를 해요",
            "바른 자세로 발표하고 들어요",
            "친구의 감상과 내 감상을 견주어 봐요"
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
          "scene_title": "내 편지를 발표해요 🎤",
          "visual": "🎤",
          "question": "내가 쓴 편지를 친구들 앞에서 발표해요.<br>어떻게 발표하면 친구들이 잘 들을 수 있을까요?",
          "img": "assets/photo/korean/g2u8_feel3.jpg"
        },
        "suggested_extras": [
          "q_how11",
          "r_present"
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
              "q": "느낌을 표현하는 또 다른 방법은?",
              "a": "인물에게 말 걸기"
            },
            {
              "q": "인물에게 말을 걸면?",
              "a": "작품과 더 가까워져요"
            }
          ],
          "from": "u8_l10"
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
          "title": "발표하고 듣는 약속",
          "content": "발표할 땐 **또박또박** 말하고 **왜 그렇게 생각했는지** 까닭을 함께 말해요. 들을 땐 친구 감상의 **좋은 점**을 찾고, 내 생각과 **비슷한 점·다른 점**을 견주며 들어요.",
          "symbol_meanings": [
            {
              "symbol": "또박또박",
              "meaning": "잘 들리게 말해요"
            },
            {
              "symbol": "까닭 말하기",
              "meaning": "왜 그렇게 생각했는지"
            },
            {
              "symbol": "좋은 점 찾기",
              "meaning": "친구 발표를 칭찬해요"
            },
            {
              "symbol": "견주어 듣기",
              "meaning": "비슷한 점·다른 점 찾기"
            }
          ]
        },
        "suggested_extras": [
          "t_compare11",
          "x_judge"
        ],
        "tnote": {
          "ask": [
            "느낌을 표현하는 방법에는 무엇이 있을까?"
          ],
          "watch": "그림·몸짓 표현",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "발표·듣기, 어떻게 할까요? 🎧",
          "sub": "바른 발표와 듣기 모습을 함께 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "발표할 때 알맞은 모습은?",
              "emoji": "🗣️",
              "name": "또박또박, 까닭을 함께 말해요"
            },
            {
              "clue": "친구 발표를 들을 때는?",
              "emoji": "👂",
              "name": "좋은 점을 찾으며 들어요"
            },
            {
              "clue": "칭찬할 때는?",
              "emoji": "👏",
              "name": "\"잘했다\"보다 어떤 점이 좋았는지 말해요"
            }
          ],
          "outro": "발표와 듣기는 함께 자라요. 친구의 다른 생각도 귀하게 들어 봐요! 😊"
        },
        "suggested_extras": [
          "q_good",
          "g_present"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "편지를 발표하고 나눠요",
          "question": "친구의 발표를 듣고 무엇을 새롭게 느꼈나요?",
          "items": [
            "내 편지에서 가장 전하고 싶은 말은?",
            "친구 발표에서 좋았던 점은?",
            "나와 비슷한 생각·다른 생각은 무엇인가요?"
          ]
        },
        "suggested_extras": [
          "t_praise",
          "e_change11"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인형극 감상하고 느낌 표현하기 ③ — 그림·몸짓으로",
          "levels": {
            "읽기": {
              "q": "'가장 신났던 장면을 그림으로 그려 볼까요?'를 또박또박 읽어 볼까요?",
              "a": "그림 표현 문장"
            },
            "쓰기": {
              "q": "느낌을 그림으로 나타낸다면 무엇을 그릴지 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "느낌을 몸짓으로 나타내면 무엇이 좋은지 말해 봐요.",
              "a": "느낌이 더 생생하게 전해져요"
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
          "title": "느낌 몸짓·그림 나누기 짝 활동",
          "type": "pair",
          "goal": "여러 방법으로 느낌을 표현해요",
          "body": "짝과 인형극의 한 장면을 몸짓이나 간단한 그림으로 나타내고, 무엇을 표현했는지 맞혀요.",
          "materials": [
            "종이"
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
              "q": "느낌은 말 말고 무엇으로 표현하나요?",
              "a": "그림·몸짓 등"
            },
            {
              "q": "여러 방법으로 표현하면?",
              "a": "느낌이 더 잘 전해져요"
            },
            {
              "q": "느낌 표현에 정해진 답이?",
              "a": "없어요, 저마다 달라요"
            }
          ],
          "self": [
            "여러 방법으로 느낌을 표현해요",
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
            "바른 자세로 편지를 발표했어요",
            "까닭을 들어 감상을 표현했어요",
            "친구 감상과 견주어 들었어요"
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
          "preview": "직접 인형극을 해요",
          "body": "다음 시간에는 막대 인형을 만들어 직접 인형극 놀이를 해 볼 거예요!"
        },
        "suggested_extras": [
          "e_play"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_ready11",
        "type": "fun_question",
        "icon": "💡",
        "title": "발표 마음",
        "content": "\"발표할 때 떨리나요? 어떻게 하면 편할까요?\" 발표 부담을 덜어 줘요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_listen",
        "type": "tip",
        "icon": "🧩",
        "title": "듣기도 활동",
        "content": "발표만큼 '잘 듣기'도 중요한 활동임을 안내하고, 친구 발표에서 좋은 점을 찾게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how11",
        "type": "fun_question",
        "icon": "🎤",
        "title": "잘 들리게",
        "content": "\"뒷자리 친구도 들리려면 어떻게 말해야 할까요?\" 발표 태도를 짚어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_present",
        "type": "real_world",
        "icon": "🌍",
        "title": "발표 경험",
        "content": "앞에서 발표해 본 경험과 그때 마음을 떠올리게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_compare11",
        "type": "tip",
        "icon": "🧩",
        "title": "견주어 듣기",
        "content": "친구 발표를 듣고 자신과 비슷한 점·다른 점을 견주며 듣게 하면 감상이 넓어져요.",
        "fit_slides": [
          "concept",
          "question"
        ]
      },
      {
        "id": "x_judge",
        "type": "misconception",
        "icon": "❓",
        "title": "막연한 칭찬 대신",
        "content": "\"잘했다\"보다 어떤 점이 좋았는지 구체적으로 말하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_good",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋은 점 찾기",
        "content": "\"친구 발표에서 어떤 점이 가장 좋았나요?\" 구체적 칭찬을 끌어내요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_present",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "발표·듣기 상황과 바른 모습을 짝지어 보세요.",
        "hint": "잘 통하는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🗣️ 발표"
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
              "text": "좋은 점 찾기"
            }
          },
          {
            "a": {
              "text": "👏 칭찬"
            },
            "b": {
              "text": "구체적으로"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_praise",
        "type": "tip",
        "icon": "🗣",
        "title": "달라진 생각",
        "content": "친구 발표를 듣고 달라진 생각을 말해 보게 하면 좋아요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_change11",
        "type": "extension",
        "icon": "⬆",
        "title": "생각 넓히기",
        "content": "\"친구 말을 듣고 새롭게 든 생각이 있나요?\" 감상을 확장해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect11",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"잘 듣는다는 건 무엇일까요?\" 듣기 태도를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_play",
        "type": "extension",
        "icon": "⬆",
        "title": "인형극 예고",
        "content": "\"다음엔 직접 인형을 만들어 인형극을 해요!\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l12"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 12,
      "title": "인형극 하기 ① (실천)",
      "std": "[2국05-03] · [2국06-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 막대 인형 만들기 → 차례 알기 → 준비물 → 보여 줄 장면·대사 정하기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인형극 하기 ①",
          "subtitle": "8단원 · 12/15차시 · 실천"
        },
        "suggested_extras": [
          "q_make",
          "t_simple"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "막대 인형을 만들어요",
            "모둠이 보여 줄 장면을 정해요",
            "인물의 마음이 드러나는 대사를 생각해요"
          ]
        },
        "suggested_extras": [
          "t_simple"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "인형을 직접 만들어요 🧸",
          "visual": "🪄",
          "question": "이제 우리가 직접 인형극을 해 볼 거예요.<br>어떤 인물로 어떤 장면을 보여 줄까요?",
          "img": "assets/photo/korean/g2u8_act1.jpg"
        },
        "suggested_extras": [
          "q_what",
          "r_play"
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
              "q": "느낌은 말 말고 무엇으로 표현하나요?",
              "a": "그림·몸짓 등"
            },
            {
              "q": "여러 방법으로 표현하면?",
              "a": "느낌이 더 잘 전해져요"
            }
          ],
          "from": "u8_l11"
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
          "title": "막대 인형 만드는 차례",
          "content": "막대 인형은 **간단하게** 만들어요. 인형 완성보다 **인형극 놀이**가 더 중요하니, 인물의 특징만 잘 드러나게 만들면 돼요!",
          "symbol_meanings": [
            {
              "symbol": "① 그리기",
              "meaning": "두꺼운 종이에 인물을 그려요"
            },
            {
              "symbol": "② 오리기",
              "meaning": "가위로 오려요"
            },
            {
              "symbol": "③ 막대 붙이기",
              "meaning": "뒤에 나무젓가락을 붙여요"
            },
            {
              "symbol": "④ 완성",
              "meaning": "막대 인형이 완성!"
            }
          ]
        },
        "suggested_extras": [
          "t_quick",
          "x_perfect"
        ],
        "tnote": {
          "ask": [
            "인형극을 하려면 무엇부터 정해야 할까?"
          ],
          "watch": "인형극 준비",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "무엇이 필요할까요? 🎨",
          "sub": "막대 인형을 만드는 데 필요한 것을 함께 확인해요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "인물을 그리고 받칠 것은?",
              "emoji": "📄",
              "name": "두꺼운 도화지"
            },
            {
              "clue": "인형 뒤에 붙여 손잡이가 될 것은?",
              "emoji": "🥢",
              "name": "나무젓가락"
            },
            {
              "clue": "오리고 붙일 때 필요한 것은?",
              "emoji": "✂️",
              "name": "가위·테이프"
            }
          ],
          "outro": "준비물을 챙겼다면 어떤 장면을 보여 줄지 모둠끼리 정해 봐요! 😊"
        },
        "suggested_extras": [
          "q_pick12",
          "g_make"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "보여 줄 장면을 정해요",
          "question": "우리 모둠은 어떤 장면을 보여 줄까요?",
          "items": [
            "어떤 이야기의 어떤 장면을 보여 줄까요?",
            "인물의 마음이 드러나는 대사는 무엇인가요?",
            "누가 어떤 인물을 맡을까요?"
          ]
        },
        "suggested_extras": [
          "t_scene12",
          "e_orig"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인형극 하기 ① — 준비하기",
          "levels": {
            "읽기": {
              "q": "'누가 어떤 인물을 맡을지 정해 볼까요?'를 또박또박 읽어 볼까요?",
              "a": "역할 정하기 문장"
            },
            "쓰기": {
              "q": "내가 맡고 싶은 인물과 할 대사를 한 줄 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "인형극을 준비할 때 정해야 할 것을 짝에게 말해 봐요.",
              "a": "역할·대사·움직임"
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
          "title": "역할·대사 정하기 짝 활동",
          "type": "pair",
          "goal": "인형극을 준비해요",
          "body": "짝과 짧은 이야기를 골라 역할을 나누고, 각자 맡은 인물의 대사를 한 줄씩 정해요.",
          "materials": [
            "막대 인형·종이"
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
              "q": "인형극을 하려면 먼저 무엇을 정하나요?",
              "a": "역할(맡을 인물)"
            },
            {
              "q": "인물이 할 말은?",
              "a": "대사"
            },
            {
              "q": "준비를 잘하면?",
              "a": "인형극이 즐거워져요"
            }
          ],
          "self": [
            "인형극을 준비해요",
            "조금 어려워요",
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
            "막대 인형 만드는 차례를 알았어요",
            "필요한 준비물을 확인했어요",
            "보여 줄 장면과 대사를 정했어요"
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
          "preview": "인형극을 발표해요",
          "body": "다음 시간에는 완성한 막대 인형으로 모둠별 인형극을 발표하고 감상을 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_show12"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_make",
        "type": "fun_question",
        "icon": "💡",
        "title": "만들고 싶은 인형",
        "content": "\"어떤 인물 인형을 만들고 싶나요?\" 만들기 동기를 끌어내요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_simple",
        "type": "tip",
        "icon": "🧩",
        "title": "놀이가 핵심",
        "content": "인형 만들기에 시간을 다 쓰지 않게, 간단히 만들고 인형극 놀이에 집중하게 하세요(지도서 유의점).",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_what",
        "type": "fun_question",
        "icon": "🪄",
        "title": "어떤 장면?",
        "content": "\"우리가 본 이야기 중 어떤 장면을 보여 주고 싶나요?\" 장면을 떠올리게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_play",
        "type": "real_world",
        "icon": "🌍",
        "title": "역할 놀이 경험",
        "content": "소꿉놀이·역할 놀이 경험과 이어 인형극을 친근하게 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_quick",
        "type": "tip",
        "icon": "🧩",
        "title": "특징만 간단히",
        "content": "인물의 특징만 드러나게 간단히 만들도록 안내하세요. 창의적으로 만들어도 좋아요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_perfect",
        "type": "misconception",
        "icon": "❓",
        "title": "완성도보다 마음",
        "content": "인형이 예쁘지 않아도 괜찮아요. 인물의 마음을 살리는 것이 더 중요해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_pick12",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 무엇이?",
        "content": "\"색칠할 것은 무엇이 필요할까요?\" 준비물을 함께 떠올려요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_make",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "차례 ↔ 할 일 짝짓기",
        "description": "인형 만들기 차례와 할 일을 짝지어 보세요.",
        "hint": "순서를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "✏️ 그리기"
            },
            "b": {
              "text": "인물 그리기"
            }
          },
          {
            "a": {
              "text": "✂️ 오리기"
            },
            "b": {
              "text": "가위로 오리기"
            }
          },
          {
            "a": {
              "text": "🥢 붙이기"
            },
            "b": {
              "text": "막대 붙이기"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_scene12",
        "type": "tip",
        "icon": "🗣",
        "title": "한 장면 집중",
        "content": "한 편을 다 만들기보다 마음이 잘 드러나는 한 장면에 집중하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_orig",
        "type": "extension",
        "icon": "⬆",
        "title": "새 이야기로",
        "content": "\"우리가 만든 새 이야기로 해도 좋아요.\" 창작 여지를 열어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect12",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"무엇을 준비했죠?\" 인형·장면·대사를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_show12",
        "type": "extension",
        "icon": "⬆",
        "title": "발표 예고",
        "content": "\"다음엔 우리 인형극을 보여 줘요!\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l13"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 13,
      "title": "인형극 하기 ② (실천)",
      "std": "[2국05-03]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 역할 나누기 → 발표·관람 약속 → 인형극 발표 → 감상 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "인형극 하기 ②",
          "subtitle": "8단원 · 13/15차시 · 실천"
        },
        "suggested_extras": [
          "q_ready13",
          "t_role"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "역할을 나누고 마지막 연습을 해요",
            "바른 자세로 발표하고 관람해요",
            "인형극을 보고 감상을 나눠요"
          ]
        },
        "suggested_extras": [
          "t_role"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "드디어 공연 날! 🎪",
          "visual": "🎭",
          "question": "우리가 만든 막대 인형으로 인형극을 발표해요.<br>어떻게 하면 인물의 마음이 잘 전해질까요?",
          "img": "assets/photo/korean/g2u8_act2.jpg"
        },
        "suggested_extras": [
          "q_how13",
          "r_stage"
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
              "q": "인형극을 하려면 먼저 무엇을 정하나요?",
              "a": "역할(맡을 인물)"
            },
            {
              "q": "인물이 할 말은?",
              "a": "대사"
            }
          ],
          "from": "u8_l12"
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
          "title": "발표하고 관람하는 약속",
          "content": "발표하는 친구는 **또박또박 천천히** 대사를 말하고 인물의 마음을 **목소리·움직임**으로 살려요. 보는 친구는 **바른 자세**로 집중해 보고, 끝나면 **좋았던 점**을 말해 줘요.",
          "symbol_meanings": [
            {
              "symbol": "또박또박",
              "meaning": "잘 들리게 천천히"
            },
            {
              "symbol": "마음 살리기",
              "meaning": "목소리·움직임으로"
            },
            {
              "symbol": "바른 관람",
              "meaning": "집중해서 봐요"
            },
            {
              "symbol": "좋은 점 말하기",
              "meaning": "끝나고 칭찬해요"
            }
          ]
        },
        "suggested_extras": [
          "t_show",
          "x_silly"
        ],
        "tnote": {
          "ask": [
            "직접 인형극을 해 보면 무엇이 좋을까?"
          ],
          "watch": "인형극 공연·감상",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "발표·관람, 어떻게 할까요? 🎬",
          "sub": "인형극 발표와 관람의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "발표하는 친구의 바른 모습은?",
              "emoji": "🎤",
              "name": "또박또박 천천히, 마음을 살려요"
            },
            {
              "clue": "관람하는 친구의 바른 모습은?",
              "emoji": "👀",
              "name": "바른 자세로 집중해 봐요"
            },
            {
              "clue": "공연이 끝나면?",
              "emoji": "👏",
              "name": "좋았던 점을 말해 줘요"
            }
          ],
          "outro": "발표하는 친구도, 보는 친구도 함께 만드는 인형극이에요. 즐겁게 해 봐요! 😊"
        },
        "suggested_extras": [
          "q_good13",
          "g_show"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "인형극을 보고 나눠요",
          "question": "친구들의 인형극을 보고 무엇을 느꼈나요?",
          "items": [
            "어떤 모둠의 어떤 장면이 기억에 남나요?",
            "그 장면에서 인물의 마음이 잘 느껴졌나요?",
            "우리 모둠 인형극에서 잘된 점은 무엇인가요?"
          ]
        },
        "suggested_extras": [
          "t_feel13",
          "e_again"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "인형극 하기 ② — 공연하고 감상하기",
          "levels": {
            "읽기": {
              "q": "인물의 마음을 살려 대사 '같이 가자, 친구야!'를 실감 나게 읽어 볼까요?",
              "a": "마음을 살린 대사"
            },
            "쓰기": {
              "q": "친구들의 인형극을 보고 좋았던 점을 한 문장 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "인형극을 하고 나서 느낀 점을 짝에게 말해 봐요.",
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
          "title": "인형극 공연·칭찬 짝 활동",
          "type": "pair",
          "goal": "인형극을 하고 감상해요",
          "body": "짝과 준비한 인형극을 짧게 공연하고, 서로의 공연에서 좋았던 점을 칭찬해요.",
          "materials": [
            "막대 인형"
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
              "q": "인형극을 할 때 대사는 어떻게?",
              "a": "인물의 마음을 살려서"
            },
            {
              "q": "친구 공연을 보면?",
              "a": "좋았던 점을 칭찬해요"
            },
            {
              "q": "직접 인형극을 하면?",
              "a": "작품을 더 깊이 느껴요"
            }
          ],
          "self": [
            "인형극을 하고 감상해요",
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
            "역할을 나눠 인형극을 발표했어요",
            "바른 자세로 보고 감상을 나눴어요",
            "인물의 마음을 몸으로 표현했어요"
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
          "e_wrap"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_ready13",
        "type": "fun_question",
        "icon": "💡",
        "title": "공연 마음",
        "content": "\"공연 전 마음이 어떤가요?\" 설렘을 나누며 시작해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_role",
        "type": "tip",
        "icon": "🧩",
        "title": "역할 나누기",
        "content": "인형 움직이기·대사 말하기·해설 등 역할을 골고루 나눠 모두 참여하게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how13",
        "type": "fun_question",
        "icon": "🎭",
        "title": "마음 전하기",
        "content": "\"무서운 인물은 목소리를 어떻게 낼까요?\" 표현 방법을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_stage",
        "type": "real_world",
        "icon": "🌍",
        "title": "무대 경험",
        "content": "학예회·발표회 무대 경험과 이어 발표를 편하게 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_show",
        "type": "tip",
        "icon": "🧩",
        "title": "한 장면 충실히",
        "content": "한 편을 완성하기보다 한 장면을 충실히 보여 주는 데 초점을 두게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_silly",
        "type": "misconception",
        "icon": "❓",
        "title": "지나친 장난 주의",
        "content": "발표 상황에서 지나치게 장난스럽지 않도록 약속을 정해 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good13",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋은 관람",
        "content": "\"좋은 관람은 어떤 모습일까요?\" 관람 태도를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_show",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "발표·관람 상황과 바른 모습을 짝지어 보세요.",
        "hint": "함께 만드는 인형극을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🎤 발표"
            },
            "b": {
              "text": "또박또박·마음 살리기"
            }
          },
          {
            "a": {
              "text": "👀 관람"
            },
            "b": {
              "text": "집중해 보기"
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
        "id": "t_feel13",
        "type": "tip",
        "icon": "🗣",
        "title": "구체적 감상",
        "content": "\"잘했다\"보다 어떤 장면이 왜 좋았는지 구체적으로 말하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_again",
        "type": "extension",
        "icon": "⬆",
        "title": "다시 한다면",
        "content": "\"다시 공연한다면 어떤 역할을 맡고 싶나요?\" 감상을 이어 가요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect13",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"인형극으로 무엇을 표현했죠?\" 인물의 마음을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_wrap",
        "type": "extension",
        "icon": "⬆",
        "title": "마무리 예고",
        "content": "\"다음엔 단원에서 배운 것을 정리해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l14"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 14,
      "title": "마무리하기 ① — 스스로 확인",
      "std": "[2국05-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 배운 것 돌아보기 → 감상·마음 짐작 방법 정리 → 방법 확인 퀴즈 → 스스로 확인 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ① — 스스로 확인",
          "subtitle": "8단원 · 14/15차시 · 마무리"
        },
        "suggested_extras": [
          "q_back",
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
            "감상·마음 짐작 방법을 정리해요",
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
          "scene_title": "8단원에서 무엇을 배웠나요? 🎀",
          "visual": "📚",
          "question": "시를 낭송하고, 이야기·인형극 속 인물의 마음을 짐작했어요.<br>가장 기억에 남는 활동은 무엇인가요?",
          "img": "assets/photo/korean/g2u8_wrap1.jpg"
        },
        "suggested_extras": [
          "q_memory",
          "r_back"
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
              "q": "인형극을 할 때 대사는 어떻게?",
              "a": "인물의 마음을 살려서"
            },
            {
              "q": "직접 인형극을 하면?",
              "a": "작품을 더 깊이 느껴요"
            }
          ],
          "from": "u8_l13"
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
          "title": "느낌 발표·마음 짐작 방법",
          "content": "느낀 점을 발표할 땐 기억에 남는 **장면**과 **까닭**, 비슷한 **내 경험**을 말해요. 인형극 속 마음은 인물의 **행동·말·목소리**를 살펴 짐작해요.",
          "symbol_meanings": [
            {
              "symbol": "기억에 남는 장면",
              "meaning": "어떤 장면이 마음에 남았나요?"
            },
            {
              "symbol": "그 까닭",
              "meaning": "왜 기억에 남나요?"
            },
            {
              "symbol": "내 경험",
              "meaning": "비슷한 경험이 있었나요?"
            },
            {
              "symbol": "행동·말·목소리",
              "meaning": "인물의 마음 짐작 단서"
            }
          ]
        },
        "suggested_extras": [
          "t_method",
          "x_long"
        ],
        "tnote": {
          "ask": [
            "이 단원에서 무엇을 새로 알게 되었나?"
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
          "title": "방법을 확인해요 ✅",
          "sub": "느낌 발표와 마음 짐작의 바른 방법을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "느낀 점을 발표하는 바른 방법은?",
              "emoji": "💭",
              "name": "기억에 남는 장면과 까닭을 말해요"
            },
            {
              "clue": "인형극 속 마음을 짐작하려면?",
              "emoji": "🔎",
              "name": "행동·말·목소리를 살펴요"
            },
            {
              "clue": "이렇게 발표하면 아쉬워요!",
              "emoji": "⚠️",
              "name": "줄거리만 길게 말하거나 \"그냥 재밌다\"만 말해요"
            }
          ],
          "outro": "장면·까닭·내 생각을 담으면 좋은 감상이에요. 스스로 잘하고 있는지 확인해 봐요! 😊"
        },
        "suggested_extras": [
          "q_check",
          "g_method"
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
            "시·이야기를 감상하고 느낌을 표현할 수 있나요?",
            "인형극을 보고 인물의 마음을 짐작할 수 있나요?",
            "작품을 즐기는 마음을 가졌나요?"
          ]
        },
        "suggested_extras": [
          "t_self",
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
              "q": "'나는 작품을 감상하고 느낌을 표현할 수 있어요.'를 읽으며 스스로 돌아볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "느낌을 표현하는 방법을 한 가지 써 볼까요?",
              "a": "말·글·그림·몸짓 중 하나"
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
              "q": "느낀 점을 발표할 때 말하는 것은?",
              "a": "장면·까닭·비슷한 내 경험"
            },
            {
              "q": "인형극 속 마음은 무엇으로 짐작하나요?",
              "a": "움직임·목소리·표정"
            },
            {
              "q": "느낌은 무엇으로 표현하나요?",
              "a": "말·글·그림·몸짓"
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
            "감상·마음 짐작 방법을 정리했어요",
            "스스로 얼마나 할 수 있는지 확인했어요"
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
          "body": "다음 시간에는 낱말을 자연스럽게 읽는 연습을 하고, 글씨를 바르게 쓰며 단원을 마무리할 거예요!"
        },
        "suggested_extras": [
          "e_basic"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_back",
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
        "content": "방법 정리에 그치지 말고 다양한 작품을 즐기는 태도를 기르도록 이끄세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_memory",
        "type": "fun_question",
        "icon": "📚",
        "title": "기억에 남는 활동",
        "content": "\"낭송·이야기·인형극 중 무엇이 가장 즐거웠나요?\" 단원 경험을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_back",
        "type": "real_world",
        "icon": "🌍",
        "title": "작품과 친해지기",
        "content": "단원 뒤에도 도서관·텔레비전에서 작품을 찾아보게 권해요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_method",
        "type": "tip",
        "icon": "🧩",
        "title": "방법 정리",
        "content": "감상 표현과 마음 짐작 방법을 함께 정리하며 자기 성찰적 질문을 던지게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_long",
        "type": "misconception",
        "icon": "❓",
        "title": "줄거리 나열 아니에요",
        "content": "감상은 줄거리 나열이 아니라 장면에 대한 생각·느낌임을 다시 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_check",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 방법은?",
        "content": "\"좋은 감상 발표에는 무엇이 들어가야 하죠?\" 장면·까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_method",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "활동 ↔ 방법 짝짓기",
        "description": "활동과 바른 방법을 짝지어 보세요.",
        "hint": "무엇을 살피는지 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "💭 감상 발표"
            },
            "b": {
              "text": "장면·까닭 말하기"
            }
          },
          {
            "a": {
              "text": "🔎 마음 짐작"
            },
            "b": {
              "text": "행동·말·목소리"
            }
          },
          {
            "a": {
              "text": "📖 작품 즐기기"
            },
            "b": {
              "text": "느낌 나누기"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_self",
        "type": "tip",
        "icon": "🗣",
        "title": "솔직한 확인",
        "content": "잘한 점·더 노력할 점을 솔직하게 확인하게 하되, 비교가 아닌 자기 돌아보기로 이끄세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_pick14",
        "type": "extension",
        "icon": "⬆",
        "title": "좋아하는 이야기",
        "content": "\"내가 좋아하는 이야기를 한 편 골라 친구에게 소개해 볼까요?\" 감상을 실천으로 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect14",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"오늘 무엇을 정리했죠?\" 감상·마음 짐작 방법을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_basic",
        "type": "extension",
        "icon": "⬆",
        "title": "기초 다지기 예고",
        "content": "\"다음엔 낱말을 자연스럽게 읽는 연습을 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u8_l15"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 8,
      "n": 15,
      "title": "마무리하기 ② — 기초 다지기",
      "std": "[2국04-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 연음(받침 넘어가 읽기) → 자연스럽게 읽기 → 바른 발음 확인 → 글씨 쓰기·단원 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ② — 기초 다지기",
          "subtitle": "8단원 · 15/15차시 · 마무리"
        },
        "suggested_extras": [
          "q_sound",
          "t_link"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "받침이 넘어가 읽히는 낱말을 알아봐요",
            "낱말을 자연스럽게 읽어요",
            "배운 낱말을 바르게 써요"
          ]
        },
        "suggested_extras": [
          "t_link"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "\"구름이\"를 읽어 볼까요? ☁️",
          "visual": "🗣️",
          "question": "\"구름이\"는 글자 그대로 읽을까요?<br>소리 내어 읽으면 어떻게 들리나요?",
          "img": "assets/photo/korean/g2u8_wrap2.jpg"
        },
        "suggested_extras": [
          "q_read",
          "r_sound"
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
              "q": "느낌은 무엇으로 표현하나요?",
              "a": "말·글·그림·몸짓"
            },
            {
              "q": "인형극 속 마음은 무엇으로 짐작하나요?",
              "a": "움직임·목소리·표정"
            }
          ],
          "from": "u8_l14"
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
          "title": "받침이 넘어가요",
          "content": "받침 뒤에 **'ㅇ'으로 시작하는 글자**가 오면, 받침이 뒤로 넘어가 소리 나요. 그래서 **\"구름이\"**는 **[구르미]**로 자연스럽게 읽혀요!",
          "symbol_meanings": [
            {
              "symbol": "구름이",
              "meaning": "[구르미]로 읽어요"
            },
            {
              "symbol": "꽃이",
              "meaning": "[꼬치]로 읽어요"
            },
            {
              "symbol": "책을",
              "meaning": "[채글]로 읽어요"
            },
            {
              "symbol": "까닭",
              "meaning": "받침이 뒤 'ㅇ' 자리로 넘어가요"
            }
          ]
        },
        "suggested_extras": [
          "t_read",
          "x_split"
        ],
        "tnote": {
          "ask": [
            "받침이 뒤로 넘어가 소리 나는 낱말에는 무엇이 있을까?"
          ],
          "watch": "연음·바른 글씨 다지기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "어떻게 읽을까요? 🗣️",
          "sub": "낱말을 자연스럽게 이어 읽어 봐요. 카드를 누르면 소리가 나와요!",
          "cards": [
            {
              "clue": "\"구름이\"는 어떻게 읽을까요?",
              "emoji": "☁️",
              "name": "[구르미]"
            },
            {
              "clue": "\"꽃이\"는 어떻게 읽을까요?",
              "emoji": "🌸",
              "name": "[꼬치]"
            },
            {
              "clue": "\"책을\"은 어떻게 읽을까요?",
              "emoji": "📖",
              "name": "[채글]"
            }
          ],
          "outro": "받침이 뒤로 넘어가 자연스럽게 이어 읽혀요. 큰 소리로 읽어 볼까요? 😊"
        },
        "suggested_extras": [
          "q_link2",
          "g_sound"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "글씨를 바르게 써요 ✍️",
          "content": "단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **인형극 · 감상 · 마음**을 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "인형극",
              "meaning": "또박또박 칸에 맞춰"
            },
            {
              "symbol": "감상",
              "meaning": "바른 자세로"
            },
            {
              "symbol": "마음",
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
          "title": "기초 다지기 — 받침이 넘어가는 소리",
          "levels": {
            "읽기": {
              "q": "'구름이'가 [구르미]로 소리 나는 것을 생각하며 읽어 볼까요?",
              "a": "구름이[구르미]"
            },
            "쓰기": {
              "q": "'꽃이'는 어떻게 소리 나는지 소리 나는 대로 써 볼까요?",
              "a": "[꼬치]"
            },
            "말하기": {
              "q": "받침이 왜 뒤로 넘어가 소리 나는지 짝에게 말해 봐요.",
              "a": "뒤에 'ㅇ'으로 시작하는 글자가 와서"
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
          "title": "넘어가는 소리 가려 읽기 짝 활동",
          "type": "pair",
          "goal": "받침이 넘어가는 낱말을 자연스럽게 읽어요",
          "body": "짝이 '구름이·꽃이·책이' 같은 낱말을 말하면 소리 나는 대로 읽어 보고, 번갈아 해요.",
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
              "q": "받침 뒤에 무엇이 오면 넘어가 소리 나나요?",
              "a": "'ㅇ'으로 시작하는 글자"
            },
            {
              "q": "'구름이'는 어떻게 소리 나나요?",
              "a": "[구르미]"
            },
            {
              "q": "배운 낱말을 쓸 때는?",
              "a": "또박또박 바르게 써요"
            }
          ],
          "self": [
            "받침이 넘어가는 낱말을 자연스럽게 읽어요",
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
          "title": "8단원에서 배운 것",
          "points": [
            "시를 낭송하고 느낌을 나눴어요",
            "이야기·인형극 속 마음을 짐작했어요",
            "낱말을 자연스럽게 읽고 바르게 썼어요"
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
          "preview": "다양한 작품을 즐겁게!",
          "body": "8단원을 모두 마쳤어요. 앞으로도 시·이야기·인형극을 즐기고 느낌을 친구들과 나눠 봐요. 정말 수고했어요!"
        },
        "suggested_extras": [
          "e_end"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_sound",
        "type": "fun_question",
        "icon": "💡",
        "title": "소리 내어",
        "content": "\"글자 그대로 읽을 때와 소리 내어 읽을 때가 다른 낱말이 있을까요?\" 호기심을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_link",
        "type": "tip",
        "icon": "🧩",
        "title": "연음 익히기",
        "content": "음성 언어는 이미 익숙하니, 헷갈리는 낱말을 소리 내어 읽으며 자연스럽게 익히게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_read",
        "type": "fun_question",
        "icon": "☁️",
        "title": "구르미?",
        "content": "\"왜 '구름이'가 [구르미]로 들릴까요?\" 받침이 넘어가는 현상을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_sound",
        "type": "real_world",
        "icon": "🌍",
        "title": "이름 읽기",
        "content": "친구 이름·물건 이름을 소리 내어 읽으며 연음을 자연스럽게 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_read",
        "type": "tip",
        "icon": "🧩",
        "title": "규칙보다 소리",
        "content": "어려운 규칙 용어 대신 \"받침이 뒤로 넘어가요\" 정도로 쉽게 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_split",
        "type": "misconception",
        "icon": "❓",
        "title": "끊어 읽지 않게",
        "content": "\"구름-이\"처럼 끊어 읽으면 어색해요. 자연스럽게 이어 읽도록 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_link2",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 어떤 낱말?",
        "content": "\"이어 읽는 다른 낱말도 찾아볼까요? (음악·악어)\" 어휘를 넓혀요.",
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
        "description": "낱말과 자연스럽게 읽은 소리를 짝지어 보세요.",
        "hint": "받침이 넘어가요.",
        "pairs": [
          {
            "a": {
              "text": "구름이"
            },
            "b": {
              "text": "[구르미]"
            }
          },
          {
            "a": {
              "text": "꽃이"
            },
            "b": {
              "text": "[꼬치]"
            }
          },
          {
            "a": {
              "text": "책을"
            },
            "b": {
              "text": "[채글]"
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
        "content": "네모 칸의 자형을 살펴 또박또박 쓰게 하고, 쓰기를 어려워하면 천천히 따라 쓰게 하세요.",
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
        "content": "\"8단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_end",
        "type": "extension",
        "icon": "⬆",
        "title": "즐기는 독자",
        "content": "\"방학에 읽고 싶은 이야기책이 있나요?\" 작품을 즐기는 마음을 이어 가요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

})();
