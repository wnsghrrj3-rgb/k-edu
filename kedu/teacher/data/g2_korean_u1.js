/* ============================================================================
   2학년 1학기 국어 1단원 「만나서 반가워요!」 케이티처(교사주도) 차시 데이터
   - 키: window.LESSONS["u1_l{NN}"] (zero-pad). 8슬 표준흐름.
   - 지도서: 미래엔 『국어』 2-1 (가) 6~41 / 14차시.
   - 단원 목표: 말차례를 지키며 대화하고 자신을 소개하기. 역량 의사소통(경청과 존중).
   - 성취기준 [2국01-02](말차례 대화)·[2국01-04](바른 자세 발표·경청)·[2국03-02](소개하는 글).
   ★ 저작권: 지도서 제재(「용기를 내, 비닐장갑!」·소단원1 제재 글·소개 글 예문) 전부 미게재.
      소개 항목·인사·대화문은 보편 어휘 자체 구성.
   ============================================================================ */
(function () {
  if (!window.LESSONS) window.LESSONS = {};

  /* ---------------- 1차시: 단원 도입 — 잘 듣고 말하기 ---------------- */
  window.LESSONS["u1_l01"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 1,
      "title": "단원 도입 — 만나서 반가워요",
      "std": "[2국01-02] · [2국01-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 새 학년 만남 → 잘 듣고 말하기란 → 바른 듣기 태도 고르기 → 친구에게 인사 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "만나서 반가워요!",
          "subtitle": "1단원 · 1/14차시 · 단원 도입"
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
            "잘 듣고 말하는 것이 무엇인지 알아봐요",
            "바른 듣기 태도를 알아봐요",
            "친구와 반갑게 인사를 나눠요"
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
          "scene_title": "새 친구들과 만났어요 👋",
          "visual": "🙋",
          "question": "새 학년이 되어 새 친구들을 만났어요.<br>친구와 잘 지내려면 어떻게 말하고 들어야 할까요?",
          "img": "assets/photo/korean/g2_meet_greet.jpg"
        },
        "suggested_extras": [
          "q_friend",
          "r_class"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "잘 듣고 잘 말하기",
          "content": "친구와 대화할 땐 다른 사람이 말할 때 **끼어들지 않고 잘 듣고**, 내 차례에 말해요. 이렇게 서로를 **존중하며** 말하고 들으면 마음이 잘 통해요!",
          "symbol_meanings": [
            {
              "symbol": "바라보기",
              "meaning": "말하는 사람을 봐요"
            },
            {
              "symbol": "끝까지 듣기",
              "meaning": "끼어들지 않아요"
            },
            {
              "symbol": "내 차례에",
              "meaning": "순서를 지켜 말해요"
            },
            {
              "symbol": "존중하기",
              "meaning": "서로를 아껴요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_cut"
        ],
        "tnote": {
          "ask": [
            "새 친구와 친해지려면 무엇부터 하면 좋을까?"
          ],
          "watch": "경청·인사 태도 열기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 듣기 태도는? ✅",
          "sub": "친구가 말할 때 바른 모습을 함께 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 말할 때 눈은?",
              "emoji": "👀",
              "name": "말하는 친구를 바라봐요"
            },
            {
              "clue": "하고 싶은 말이 생기면?",
              "emoji": "🤚",
              "name": "끝까지 듣고 내 차례에 말해요"
            },
            {
              "clue": "친구 말이 끝나면?",
              "emoji": "👂",
              "name": "잘 들었다는 표시로 고개를 끄덕여요"
            }
          ],
          "outro": "잘 듣는 것이 좋은 대화의 시작이에요. 친구와 인사부터 나눠 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good",
          "g_listen"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "친구와 인사를 나눠요 🎤",
          "sub": "버튼을 눌러 친구를 뽑아요. 옆 친구에게 반갑게 인사하고 이름을 말해 봐요!",
          "count": 24,
          "hint": "“안녕? 만나서 반가워. 내 이름은 ◯◯◯이야” 처럼 인사해 봐요",
          "end_msg": "모두 반갑게 인사했어요. 한 해 동안 사이좋게 지내요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "e_intro"
        ]
      },
      {
        "id": "s100",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "반갑게 인사 나누기",
          "levels": {
            "읽기": {
              "q": "'만나서 반가워'를 밝은 목소리로 읽어 볼까요?",
              "a": "만나서 반가워",
              "open": true
            },
            "쓰기": {
              "q": "내 이름을 또박또박 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "옆 친구에게 이름을 넣어 반갑게 인사해 봐요.",
              "a": "여러 답 (예: 안녕? 나는 ◯◯이야)",
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
          "title": "이름 인사 짝 놀이",
          "type": "pair",
          "goal": "마주 보고 인사하며 친해져요",
          "body": "짝과 마주 보고 번갈아 인사하고 이름을 말해요. 서로 이름을 기억했는지 확인해요.",
          "materials": [
            "이름표"
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
              "q": "친구가 말할 때는 어떻게 하나요?",
              "a": "끝까지 잘 들어요"
            },
            {
              "q": "인사할 때 마음은?",
              "a": "반갑고 고운 마음"
            },
            {
              "q": "내 차례에 어떻게 말하나요?",
              "a": "순서를 지켜 말해요"
            }
          ],
          "self": [
            "친구와 반갑게 인사했어요",
            "조금 쑥스러웠어요",
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
            "잘 듣고 말하는 것이 무엇인지 알았어요",
            "바른 듣기 태도를 알았어요",
            "친구와 반갑게 인사를 나눴어요"
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
          "preview": "소개하는 글을 살펴봐요",
          "body": "다음 시간에는 자신을 소개하는 글이 어떤 것인지 살펴보고, 무엇을 담는지 알아볼 거예요!"
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
        "title": "새 학년 마음",
        "content": "\"새 학년이 되어 어떤 마음이 드나요?\" 설렘을 나누며 단원을 열어요.",
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
        "content": "이 단원은 '말차례 지켜 대화하기 + 자신 소개하기'가 핵심이에요. 도입에선 소통의 마음을 열어 주세요.",
        "fit_slides": [
          "objective",
          "cover"
        ]
      },
      {
        "id": "q_friend",
        "type": "fun_question",
        "icon": "👋",
        "title": "친구 사귀기",
        "content": "\"새 친구와 친해지려면 무엇부터 하면 좋을까요?\" 소통의 시작을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_class",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 교실",
        "content": "우리 반에서 친구와 이야기 나누는 상황과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "present"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "경청과 존중",
        "content": "이 단원 역량의 핵심은 '경청과 존중'이에요. 잘 듣는 태도를 거듭 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_cut",
        "type": "misconception",
        "icon": "❓",
        "title": "끼어들기 주의",
        "content": "하고 싶은 말이 있어도 친구 말이 끝날 때까지 기다리는 약속을 정해 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_good",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 태도는?",
        "content": "\"바른 듣기 태도에는 무엇이 있죠?\" 바라보기·기다리기를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_listen",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 태도 짝짓기",
        "description": "듣기 상황과 바른 태도를 짝지어 보세요.",
        "hint": "잘 듣는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "👀 눈"
            },
            "b": {
              "text": "바라보기"
            }
          },
          {
            "a": {
              "text": "🤚 하고 싶은 말"
            },
            "b": {
              "text": "끝까지 듣기"
            }
          },
          {
            "a": {
              "text": "👂 들은 뒤"
            },
            "b": {
              "text": "고개 끄덕이기"
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
        "title": "가볍게 인사",
        "content": "부담 없이 옆 친구와 짧게 인사하게 해 발표의 첫걸음을 편하게 만드세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_intro",
        "type": "extension",
        "icon": "⬆",
        "title": "한마디 더",
        "content": "\"이름에 좋아하는 것 한 가지를 더해 인사해 볼까요?\" 소개를 살짝 확장해요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"잘 듣는다는 건 무엇일까요?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "소개 글 예고",
        "content": "\"다음엔 자신을 소개하는 글을 살펴봐요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l02"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 2,
      "title": "소개하는 글을 살펴봐요",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 소개하는 글이란 → 소개 글에 담을 내용 → 들어갈 내용 고르기 → 소개하고 싶은 것 떠올리기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "소개하는 글을 살펴봐요",
          "subtitle": "1단원 · 2/14차시 · 준비"
        },
        "suggested_extras": [
          "q_intro2",
          "t_intro2"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "소개하는 글이 무엇인지 알아봐요",
            "소개 글에 담을 내용을 알아봐요",
            "나를 소개할 내용을 떠올려요"
          ]
        },
        "suggested_extras": [
          "t_intro2"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "나를 알려 주는 글 ✍️",
          "visual": "📝",
          "question": "친구들에게 나를 알려 주고 싶어요.<br>나에 대해 무엇을 말해 주면 좋을까요?",
          "img": "assets/photo/korean/g2_intro_writing.jpg"
        },
        "suggested_extras": [
          "q_what2",
          "r_intro2"
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
              "q": "친구가 말할 때는?",
              "a": "끝까지 잘 들어요"
            },
            {
              "q": "내 차례에 어떻게?",
              "a": "순서를 지켜 말해요"
            }
          ],
          "from": "u1_l01"
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
          "title": "소개하는 글에 담는 것",
          "content": "소개하는 글에는 읽는 사람이 **궁금해할 내용**을 담아요. 이름·좋아하는 것·잘하는 것·꿈 같은 것을 **문장으로** 써서 나를 알려 줘요.",
          "symbol_meanings": [
            {
              "symbol": "이름",
              "meaning": "\"제 이름은 ○○○입니다\""
            },
            {
              "symbol": "좋아하는 것",
              "meaning": "\"제가 좋아하는 것은 ~입니다\""
            },
            {
              "symbol": "잘하는 것",
              "meaning": "\"저는 ~을 잘합니다\""
            },
            {
              "symbol": "꿈",
              "meaning": "\"제 꿈은 ~입니다\""
            }
          ]
        },
        "suggested_extras": [
          "t_what",
          "x_too"
        ],
        "tnote": {
          "ask": [
            "나를 소개한다면 무엇부터 말하고 싶어?"
          ],
          "watch": "소개 항목 떠올리기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "소개 글에 들어갈 내용은? 🤔",
          "sub": "나를 소개하는 글에 어울리는 내용을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "나를 알려 주는 가장 기본은?",
              "emoji": "🙋",
              "name": "이름 — \"제 이름은 ○○○입니다\""
            },
            {
              "clue": "내가 좋아하는 것을 말한다면?",
              "emoji": "⚽",
              "name": "좋아하는 것 — \"저는 축구를 좋아합니다\""
            },
            {
              "clue": "이런 건 소개 글에 어울리지 않아요!",
              "emoji": "🙅",
              "name": "친구를 흉보는 말"
            }
          ],
          "outro": "읽는 사람이 궁금해할 내용을 담으면 좋은 소개 글이 돼요. 나는 무엇을 소개할까요? 😊"
        },
        "suggested_extras": [
          "q_pick2",
          "g_intro2"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "소개할 내용을 떠올려요",
          "question": "나는 무엇을 소개하고 싶나요?",
          "items": [
            "내 이름을 어떻게 소개할까요?",
            "내가 좋아하는 것은 무엇인가요?",
            "내가 잘하는 것이나 꿈은요?"
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
          "title": "소개 글에 담을 내용 찾기",
          "levels": {
            "읽기": {
              "q": "'저는 그림 그리기를 좋아합니다.'는 나의 무엇을 알려 주나요?",
              "a": "좋아하는 것"
            },
            "쓰기": {
              "q": "나를 알려 주는 내용 한 가지를 써 볼까요?",
              "a": "여러 답 (예: 이름·좋아하는 것)",
              "open": true
            },
            "말하기": {
              "q": "친구들에게 알려 주고 싶은 나의 점을 하나 말해 봐요.",
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
          "title": "소개 항목 모으기 짝 활동",
          "type": "pair",
          "goal": "소개에 담을 내용을 함께 떠올려요",
          "body": "짝과 번갈아 '이름·좋아하는 것·잘하는 것'처럼 소개에 담을 항목을 하나씩 말해요.",
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
              "q": "소개하는 글은 무엇을 알려 주나요?",
              "a": "나에 대한 것"
            },
            {
              "q": "소개에 담을 수 있는 것은?",
              "a": "이름·좋아하는 것 등"
            },
            {
              "q": "소개 글을 읽으면 좋은 점은?",
              "a": "그 사람을 알 수 있어요"
            }
          ],
          "self": [
            "소개 글에 담을 내용을 알아요",
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
            "소개하는 글이 무엇인지 알았어요",
            "소개 글에 담을 내용을 알았어요",
            "나를 소개할 내용을 떠올렸어요"
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
          "preview": "말차례를 알아봐요",
          "body": "다음 시간에는 대화할 때 지켜야 할 '말차례'가 무엇인지, 왜 지켜야 하는지 배워 볼 거예요!"
        },
        "suggested_extras": [
          "e_turn2"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_intro2",
        "type": "fun_question",
        "icon": "💡",
        "title": "나 알리기",
        "content": "\"친구들에게 가장 알려 주고 싶은 내 모습은?\" 소개 동기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_intro2",
        "type": "tip",
        "icon": "🧩",
        "title": "독자 고려",
        "content": "읽는 사람이 궁금해할 내용을 고르는 것이 소개 글의 핵심임을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_what2",
        "type": "fun_question",
        "icon": "📝",
        "title": "무엇을 말할까",
        "content": "\"나에 대해 무엇을 말하면 친구가 나를 잘 알게 될까요?\" 소개 내용을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_intro2",
        "type": "real_world",
        "icon": "🌍",
        "title": "자기소개 경험",
        "content": "새 학기 자기소개 시간 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_what",
        "type": "tip",
        "icon": "🧩",
        "title": "문장으로",
        "content": "낱말만 나열하지 말고 \"저는 ~입니다\" 같은 문장으로 쓰게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_too",
        "type": "misconception",
        "icon": "❓",
        "title": "고를 줄 알기",
        "content": "모든 것을 다 쓰기보다 친구가 궁금해할 내용을 골라 쓰게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_pick2",
        "type": "fun_question",
        "icon": "💡",
        "title": "나라면",
        "content": "\"나라면 어떤 내용을 가장 먼저 소개할까요?\" 자기 소개 내용을 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_intro2",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "소개 항목 ↔ 예시 짝짓기",
        "description": "소개 항목과 예시 문장을 짝지어 보세요.",
        "hint": "무엇을 알려 주는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🙋 이름"
            },
            "b": {
              "text": "제 이름은 ○○○입니다"
            }
          },
          {
            "a": {
              "text": "⚽ 좋아하는 것"
            },
            "b": {
              "text": "축구를 좋아합니다"
            }
          },
          {
            "a": {
              "text": "⭐ 잘하는 것"
            },
            "b": {
              "text": "달리기를 잘합니다"
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
        "title": "한 가지씩",
        "content": "소개할 내용을 한 가지씩 떠올려 말하게 해 부담을 줄이세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more2",
        "type": "extension",
        "icon": "⬆",
        "title": "까닭 더하기",
        "content": "\"왜 그것을 좋아하나요?\" 까닭을 더하면 소개가 풍부해져요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect2",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"소개 글에는 무엇을 담죠?\" 이름·좋아하는 것을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_turn2",
        "type": "extension",
        "icon": "⬆",
        "title": "말차례 예고",
        "content": "\"다음엔 대화의 약속, 말차례를 배워요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l03"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 3,
      "title": "말차례를 알아봐요 ①",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 말차례란 → 말차례 지키는 방법 → 지킨/어긴 장면 고르기 → 짝과 말차례 대화 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "말차례를 알아봐요",
          "subtitle": "1단원 · 3/14차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_turn3",
          "t_turn3"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "말차례가 무엇인지 알아봐요",
            "말차례를 지키는 방법을 알아봐요",
            "짝과 말차례를 지켜 대화해요"
          ]
        },
        "suggested_extras": [
          "t_turn3"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "모두 한꺼번에 말하면? 🗣️",
          "visual": "😵",
          "question": "여럿이 한꺼번에 말하면 무슨 말인지 알아들을 수 없어요.<br>어떻게 하면 서로의 말을 잘 들을 수 있을까요?",
          "img": "assets/photo/korean/g2_turn_taking1.jpg"
        },
        "suggested_extras": [
          "q_all",
          "r_talk3"
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
              "q": "소개하는 글은 무엇을 알려 주나요?",
              "a": "나에 대한 것"
            },
            {
              "q": "소개에 담을 수 있는 것은?",
              "a": "이름·좋아하는 것 등"
            }
          ],
          "from": "u1_l02"
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
          "title": "말차례를 지켜요",
          "content": "대화할 땐 **한 사람씩 차례대로** 말해요. 다른 사람이 말할 땐 **잘 듣고**, 말이 끝나면 내 차례에 말해요. 이것을 **말차례를 지킨다**고 해요.",
          "symbol_meanings": [
            {
              "symbol": "한 사람씩",
              "meaning": "동시에 말하지 않아요"
            },
            {
              "symbol": "차례대로",
              "meaning": "순서를 지켜요"
            },
            {
              "symbol": "들을 땐 잘",
              "meaning": "끼어들지 않아요"
            },
            {
              "symbol": "내 차례에",
              "meaning": "말이 끝나면 말해요"
            }
          ]
        },
        "suggested_extras": [
          "t_rule3",
          "x_cut3"
        ],
        "tnote": {
          "ask": [
            "모두 한꺼번에 말하면 어떤 점이 불편할까?"
          ],
          "watch": "말차례 개념·필요 이해",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "말차례를 지킨 모습은? ✅",
          "sub": "대화 장면을 보고 말차례를 지켰는지 함께 살펴봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 말하는 중에 끼어들었어요.",
              "emoji": "🙅",
              "name": "말차례를 어겼어요"
            },
            {
              "clue": "친구 말이 끝난 뒤 손을 들고 말했어요.",
              "emoji": "🙋",
              "name": "말차례를 잘 지켰어요"
            },
            {
              "clue": "여러 명이 동시에 소리쳤어요.",
              "emoji": "😵",
              "name": "말차례를 어겼어요"
            }
          ],
          "outro": "한 사람씩 차례대로 말하면 모두의 이야기를 잘 들을 수 있어요. 짝과 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_which3",
          "g_turn3"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "짝과 말차례를 지켜 대화해요",
          "question": "짝과 번갈아 가며 이야기를 나눠 볼까요?",
          "items": [
            "누가 먼저 말할지 정했나요?",
            "친구가 말할 때 잘 들었나요?",
            "내 차례에 또박또박 말했나요?"
          ]
        },
        "suggested_extras": [
          "t_pair3",
          "e_talk3"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "말차례 지켜 대화하기",
          "levels": {
            "읽기": {
              "q": "'친구가 말할 때 끝까지 듣습니다.'를 읽고 왜 그런지 생각해 볼까요?",
              "a": "서로의 말을 잘 알아듣기 위해서"
            },
            "쓰기": {
              "q": "말차례를 지키는 방법 한 가지를 써 볼까요?",
              "a": "여러 답 (예: 손을 들고 기다려요)",
              "open": true
            },
            "말하기": {
              "q": "짝과 한 가지 주제로 말차례를 지켜 한 번씩 말해 봐요.",
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
          "title": "말차례 대화 짝 놀이",
          "type": "pair",
          "goal": "순서를 지켜 대화해요",
          "body": "'말하기 막대'를 든 사람만 말하고, 짝은 끝까지 들은 뒤 막대를 넘겨받아 말해요.",
          "materials": [
            "막대(연필)"
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
              "q": "말차례란 무엇인가요?",
              "a": "말하는 순서"
            },
            {
              "q": "여럿이 한꺼번에 말하면?",
              "a": "알아듣기 어려워요"
            },
            {
              "q": "말차례를 지키려면?",
              "a": "기다렸다 내 차례에 말해요"
            }
          ],
          "self": [
            "말차례를 지켜 대화할 수 있어요",
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
            "말차례가 무엇인지 알았어요",
            "말차례 지키는 방법을 알았어요",
            "짝과 말차례를 지켜 대화했어요"
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
          "preview": "글을 읽고 이야기를 나눠요",
          "body": "다음 시간에는 글을 읽고 말차례를 지키며 친구들과 생각을 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_read3"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_turn3",
        "type": "fun_question",
        "icon": "💡",
        "title": "한꺼번에 말하면",
        "content": "\"모두가 한꺼번에 말하면 어떻게 될까요?\" 말차례의 필요를 느끼게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_turn3",
        "type": "tip",
        "icon": "🧩",
        "title": "말차례 핵심",
        "content": "말차례는 '한 사람씩 차례대로, 들을 땐 잘 듣기'임을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_all",
        "type": "fun_question",
        "icon": "😵",
        "title": "왜 안 들릴까",
        "content": "\"왜 한꺼번에 말하면 안 들릴까요?\" 까닭을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_talk3",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 대화",
        "content": "수업 중 발표·모둠 대화 상황과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_rule3",
        "type": "tip",
        "icon": "🧩",
        "title": "듣기와 함께",
        "content": "말차례는 '말하기 순서'만이 아니라 '잘 듣기'를 포함함을 강조하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_cut3",
        "type": "misconception",
        "icon": "❓",
        "title": "끼어들기 주의",
        "content": "하고 싶은 말이 있어도 친구 말이 끝날 때까지 기다리게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_which3",
        "type": "fun_question",
        "icon": "💡",
        "title": "왜 어겼을까",
        "content": "\"이 장면은 왜 말차례를 어긴 걸까요?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_turn3",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "행동 ↔ 판단 짝짓기",
        "description": "대화 행동과 말차례 판단을 짝지어 보세요.",
        "hint": "차례를 지켰는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🙋 손 들고 말함"
            },
            "b": {
              "text": "잘 지킴"
            }
          },
          {
            "a": {
              "text": "🙅 끼어듦"
            },
            "b": {
              "text": "어김"
            }
          },
          {
            "a": {
              "text": "😵 동시에 말함"
            },
            "b": {
              "text": "어김"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_pair3",
        "type": "tip",
        "icon": "🗣",
        "title": "순서 정하기",
        "content": "짝과 누가 먼저 말할지 정하고 번갈아 대화하게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_talk3",
        "type": "extension",
        "icon": "⬆",
        "title": "주제 정하기",
        "content": "\"좋아하는 음식으로 말차례 대화를 해 볼까요?\" 가벼운 주제로 연습해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect3",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"말차례를 지킨다는 건 무엇이죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read3",
        "type": "extension",
        "icon": "⬆",
        "title": "이야기 나누기 예고",
        "content": "\"다음엔 글을 읽고 말차례를 지켜 이야기를 나눠요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l04"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 4,
      "title": "말차례를 알아봐요 ②",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 바른 대화 약속 → 대화에서 지킬 점 → 알맞은 대화 모으기 → 말차례 지켜 대화 연습 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "말차례를 알아봐요",
          "subtitle": "1단원 · 4/14차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall4",
          "t_promise4"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "바른 대화 약속을 정해요",
            "대화할 때 지킬 점을 알아봐요",
            "말차례를 지켜 대화를 연습해요"
          ]
        },
        "suggested_extras": [
          "t_promise4"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "대화에는 약속이 있어요 🤝",
          "visual": "🤝",
          "question": "친구와 즐겁게 대화하려면 어떤 약속이 필요할까요?<br>지난 시간에 배운 말차례를 떠올려 봐요.",
          "img": "assets/photo/korean/g2_turn_taking2.jpg"
        },
        "suggested_extras": [
          "q_promise",
          "r_talk4"
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
              "q": "말차례란?",
              "a": "말하는 순서"
            },
            {
              "q": "말차례를 지키려면?",
              "a": "내 차례에 말해요"
            }
          ],
          "from": "u1_l03"
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
          "title": "바른 대화 약속",
          "content": "대화할 땐 **차례를 지키고**, 친구를 **바라보며 듣고**, **고운 말**로 말해요. 친구 말에 \"맞아\" \"그렇구나\" 하고 **반응**해 주면 대화가 더 즐거워져요!",
          "symbol_meanings": [
            {
              "symbol": "차례 지키기",
              "meaning": "한 사람씩 말해요"
            },
            {
              "symbol": "바라보기",
              "meaning": "말하는 친구를 봐요"
            },
            {
              "symbol": "고운 말",
              "meaning": "바르고 고운 말로"
            },
            {
              "symbol": "반응하기",
              "meaning": "맞장구쳐 줘요"
            }
          ]
        },
        "suggested_extras": [
          "t_promise4b",
          "x_ignore"
        ],
        "tnote": {
          "ask": [
            "친구와 즐겁게 대화하려면 어떤 약속이 필요할까?"
          ],
          "watch": "대화 약속 내면화",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 대화 모습은? ✅",
          "sub": "대화에서 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구가 말할 때는?",
              "emoji": "👀",
              "name": "바라보며 잘 들어요"
            },
            {
              "clue": "친구 이야기에 반응할 때는?",
              "emoji": "😊",
              "name": "\"맞아, 그렇구나\" 하고 맞장구쳐요"
            },
            {
              "clue": "말할 때는?",
              "emoji": "💬",
              "name": "바르고 고운 말로 또박또박"
            }
          ],
          "outro": "약속을 지키면 대화가 더 즐거워져요. 친구와 연습해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good4",
          "g_talk4"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "말차례를 지켜 대화해요 🎤",
          "sub": "버튼을 눌러 짝(친구)을 뽑아요. 좋아하는 것을 주제로 말차례를 지켜 대화해 봐요!",
          "count": 12,
          "hint": "한 사람씩 차례대로, 친구 말에 맞장구치며 대화해 봐요",
          "end_msg": "모두 말차례를 지켜 즐겁게 대화했어요! 👏"
        },
        "suggested_extras": [
          "t_present4",
          "e_talk4"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "바른 대화 약속 지키기",
          "levels": {
            "읽기": {
              "q": "'말하는 사람을 바라보며 듣습니다.'는 바른 대화일까요?",
              "a": "네, 바른 대화"
            },
            "쓰기": {
              "q": "우리 반 대화 약속 한 가지를 써 볼까요?",
              "a": "여러 답 (예: 고운 말을 써요)",
              "open": true
            },
            "말하기": {
              "q": "짝과 대화 약속을 지키며 좋아하는 것을 한 가지씩 말해 봐요.",
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
          "title": "대화 약속 만들기 짝 활동",
          "type": "pair",
          "goal": "함께 지킬 약속을 정해요",
          "body": "짝과 함께 대화할 때 지킬 약속 두 가지를 정해 메모지에 써요.",
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
              "q": "대화에는 무엇이 필요한가요?",
              "a": "약속"
            },
            {
              "q": "들을 때 바른 자세는?",
              "a": "말하는 사람을 바라봐요"
            },
            {
              "q": "약속을 지키면 대화가 어떻게 되나요?",
              "a": "즐겁고 잘 통해요"
            }
          ],
          "self": [
            "대화 약속을 지킬 수 있어요",
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
            "바른 대화 약속을 정했어요",
            "대화할 때 지킬 점을 알았어요",
            "말차례를 지켜 대화를 연습했어요"
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
          "preview": "글을 읽고 이야기를 나눠요",
          "body": "다음 시간에는 글을 읽고 말차례를 지키며 친구들과 생각을 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_read4"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall4",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 약속",
        "content": "\"지난 시간에 배운 말차례, 기억나나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_promise4",
        "type": "tip",
        "icon": "🧩",
        "title": "우리 반 약속",
        "content": "학생들과 함께 '우리 반 대화 약속'을 정해 게시하면 실천에 도움이 돼요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_promise",
        "type": "fun_question",
        "icon": "🤝",
        "title": "어떤 약속?",
        "content": "\"즐거운 대화를 위해 어떤 약속이 필요할까요?\" 약속을 함께 정해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_talk4",
        "type": "real_world",
        "icon": "🌍",
        "title": "모둠 대화",
        "content": "모둠 활동에서 의견을 나누는 상황과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_promise4b",
        "type": "tip",
        "icon": "🧩",
        "title": "반응의 힘",
        "content": "맞장구·끄덕임 같은 반응이 대화를 즐겁게 함을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_ignore",
        "type": "misconception",
        "icon": "❓",
        "title": "딴짓 주의",
        "content": "친구가 말할 때 딴짓하면 속상해요. 바라보며 듣는 약속을 지키게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good4",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"바른 대화 모습에는 무엇이 있죠?\" 듣기·반응·고운 말을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_talk4",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "대화 상황과 바른 모습을 짝지어 보세요.",
        "hint": "즐거운 대화를 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "👀 들을 때"
            },
            "b": {
              "text": "바라보기"
            }
          },
          {
            "a": {
              "text": "😊 반응할 때"
            },
            "b": {
              "text": "맞장구치기"
            }
          },
          {
            "a": {
              "text": "💬 말할 때"
            },
            "b": {
              "text": "고운 말로"
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
        "title": "가벼운 주제",
        "content": "좋아하는 음식·놀이 등 가벼운 주제로 부담 없이 대화하게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_talk4",
        "type": "extension",
        "icon": "⬆",
        "title": "맞장구 연습",
        "content": "\"친구 말에 어떤 맞장구를 칠 수 있을까요?\" 반응 표현을 모아 봐요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect4",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"즐거운 대화의 약속은 무엇이죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_read4",
        "type": "extension",
        "icon": "⬆",
        "title": "이야기 나누기 예고",
        "content": "\"다음엔 글을 읽고 이야기를 나눠요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l05"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 5,
      "title": "글을 읽고 이야기를 나눠요 ①",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 글 읽고 생각 떠올리기 → 생각 나누는 방법 → 알맞은 의견 나누기 모으기 → 말차례 지켜 이야기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글을 읽고 이야기를 나눠요",
          "subtitle": "1단원 · 5/14차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_read5",
          "t_share5"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "글을 읽고 생각을 떠올려요",
            "말차례를 지켜 생각을 나눠요",
            "친구 생각을 잘 들어요"
          ]
        },
        "suggested_extras": [
          "t_share5"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "같은 글, 다른 생각 💭",
          "visual": "📖",
          "question": "같은 글을 읽어도 친구마다 생각이 달라요.<br>서로의 생각을 어떻게 나누면 좋을까요?",
          "img": "assets/photo/korean/g2_share_ideas1.jpg"
        },
        "suggested_extras": [
          "q_diff5",
          "r_read5"
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
              "q": "대화에는 무엇이 필요한가요?",
              "a": "약속"
            },
            {
              "q": "들을 때 바른 자세는?",
              "a": "말하는 사람을 바라봐요"
            }
          ],
          "from": "u1_l04"
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
          "title": "생각을 나누는 방법",
          "content": "글을 읽고 생각을 나눌 땐 **내 생각**을 까닭과 함께 말하고, **친구 생각**을 끝까지 들어요. 생각이 달라도 \"그렇게 생각할 수도 있구나\" 하고 **존중**해요.",
          "symbol_meanings": [
            {
              "symbol": "내 생각 말하기",
              "meaning": "까닭과 함께"
            },
            {
              "symbol": "말차례 지키기",
              "meaning": "한 사람씩"
            },
            {
              "symbol": "끝까지 듣기",
              "meaning": "친구 생각을 들어요"
            },
            {
              "symbol": "존중하기",
              "meaning": "다른 생각도 인정해요"
            }
          ]
        },
        "suggested_extras": [
          "t_share5b",
          "x_right"
        ],
        "tnote": {
          "ask": [
            "같은 글인데 왜 생각이 다를까?"
          ],
          "watch": "생각의 다양성 존중",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "생각을 잘 나누는 모습은? ✅",
          "sub": "이야기 나누기에서 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "내 생각을 말할 때는?",
              "emoji": "💬",
              "name": "까닭과 함께 또박또박 말해요"
            },
            {
              "clue": "친구 생각이 나와 다를 때는?",
              "emoji": "🤝",
              "name": "\"그렇게 생각할 수도 있구나\" 존중해요"
            },
            {
              "clue": "친구가 말할 때는?",
              "emoji": "👂",
              "name": "말차례를 지켜 끝까지 들어요"
            }
          ],
          "outro": "생각이 달라도 존중하면 더 멋진 이야기 나누기가 돼요. 함께 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good5",
          "g_share5"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "말차례를 지켜 이야기를 나눠요",
          "question": "글을 읽고 생각을 나눠 볼까요?",
          "items": [
            "글을 읽고 어떤 생각이 들었나요?",
            "왜 그렇게 생각했나요?",
            "친구 생각 중 새롭게 알게 된 것은?"
          ]
        },
        "suggested_extras": [
          "t_present5",
          "e_share5b"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "글 읽고 생각 나누기",
          "levels": {
            "읽기": {
              "q": "짧은 글을 읽고 어떤 생각이 드는지 떠올려 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "글을 읽고 든 내 생각을 한 문장으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "짝에게 내 생각을 말하고, 짝의 생각도 들어 봐요.",
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
          "title": "생각 나누기 짝 활동",
          "type": "pair",
          "goal": "서로 다른 생각을 존중해요",
          "body": "같은 이야기를 떠올려 짝과 생각을 한 번씩 나누고, 서로 다른 점을 찾아요.",
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
              "q": "같은 글을 읽어도 생각은?",
              "a": "친구마다 달라요"
            },
            {
              "q": "생각을 나눌 때는?",
              "a": "서로 존중하며 들어요"
            },
            {
              "q": "내 생각을 말할 때는?",
              "a": "까닭과 함께 말해요"
            }
          ],
          "self": [
            "생각을 나눌 수 있어요",
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
            "글을 읽고 생각을 떠올렸어요",
            "말차례를 지켜 생각을 나눴어요",
            "다른 생각을 존중하며 들었어요"
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
          "preview": "말차례를 지키며 더 깊이 나눠요",
          "body": "다음 시간에는 글을 읽고 친구들과 더 깊이 생각을 나누는 연습을 해 볼 거예요!"
        },
        "suggested_extras": [
          "e_share5c"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_read5",
        "type": "fun_question",
        "icon": "💡",
        "title": "글 속 생각",
        "content": "\"글을 읽고 어떤 생각이 떠올랐나요?\" 생각 나누기를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_share5",
        "type": "tip",
        "icon": "🧩",
        "title": "까닭과 함께",
        "content": "생각을 말할 때 까닭을 함께 말하게 하면 이야기 나누기가 깊어져요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_diff5",
        "type": "fun_question",
        "icon": "💭",
        "title": "다른 생각",
        "content": "\"왜 같은 글인데 생각이 다를까요?\" 생각의 다양성을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_read5",
        "type": "real_world",
        "icon": "🌍",
        "title": "독서 모임",
        "content": "같은 책을 읽고 이야기 나눈 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_share5b",
        "type": "tip",
        "icon": "🧩",
        "title": "존중하기",
        "content": "생각이 달라도 틀린 게 아니라 다른 것임을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_right",
        "type": "misconception",
        "icon": "❓",
        "title": "정답 강요 금지",
        "content": "하나의 정답을 강요하지 말고 까닭이 타당한 다양한 생각을 인정하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good5",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"생각을 잘 나누는 모습은 무엇이죠?\" 까닭·존중·듣기를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_share5",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "이야기 나누기 상황과 바른 모습을 짝지어 보세요.",
        "hint": "서로 존중하는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "💬 내 생각"
            },
            "b": {
              "text": "까닭과 함께"
            }
          },
          {
            "a": {
              "text": "🤝 다른 생각"
            },
            "b": {
              "text": "존중하기"
            }
          },
          {
            "a": {
              "text": "👂 들을 때"
            },
            "b": {
              "text": "끝까지 듣기"
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
        "title": "까닭 묻기",
        "content": "\"왜 그렇게 생각했어?\" 까닭을 묻는 습관을 들이게 하세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_share5b",
        "type": "extension",
        "icon": "⬆",
        "title": "생각 넓히기",
        "content": "\"친구 말을 듣고 생각이 바뀐 게 있나요?\" 생각의 변화를 나눠요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect5",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"생각을 나눌 때 무엇이 중요하죠?\" 존중·말차례를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_share5c",
        "type": "extension",
        "icon": "⬆",
        "title": "더 깊이 예고",
        "content": "\"다음엔 더 깊이 생각을 나눠요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l06"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 6,
      "title": "글을 읽고 이야기를 나눠요 ②",
      "std": "[2국01-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 깊이 나누기 준비 → 좋은 질문·반응 → 바른 나누기 모으기 → 모둠 이야기 나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글을 읽고 이야기를 나눠요",
          "subtitle": "1단원 · 6/14차시 · 소단원 1"
        },
        "suggested_extras": [
          "q_recall6",
          "t_deep6"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "좋은 질문으로 생각을 넓혀요",
            "친구 말에 알맞게 반응해요",
            "모둠이 말차례를 지켜 이야기를 나눠요"
          ]
        },
        "suggested_extras": [
          "t_deep6"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "더 깊이 이야기 나눠요 💬",
          "visual": "🗨️",
          "question": "친구에게 \"왜 그렇게 생각해?\" 하고 물으면 생각이 더 깊어져요.<br>어떤 질문을 하면 좋을까요?",
          "img": "assets/photo/korean/g2_share_ideas2.jpg"
        },
        "suggested_extras": [
          "q_ask6",
          "r_talk6"
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
              "q": "같은 글을 읽어도 생각은?",
              "a": "친구마다 달라요"
            },
            {
              "q": "생각을 나눌 때는?",
              "a": "서로 존중하며 들어요"
            }
          ],
          "from": "u1_l05"
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
          "title": "질문하고 반응하기",
          "content": "이야기를 나눌 땐 친구에게 **궁금한 점**을 묻고, 친구 말에 \"맞아\" \"그렇구나\" 하고 **반응**해요. 좋은 질문과 반응이 이야기를 더 **깊고 즐겁게** 만들어요!",
          "symbol_meanings": [
            {
              "symbol": "\"왜?\"",
              "meaning": "까닭을 물어요"
            },
            {
              "symbol": "\"어떻게?\"",
              "meaning": "자세히 물어요"
            },
            {
              "symbol": "\"맞아!\"",
              "meaning": "맞장구쳐요"
            },
            {
              "symbol": "\"그렇구나\"",
              "meaning": "공감해요"
            }
          ]
        },
        "suggested_extras": [
          "t_ask6",
          "x_quiet"
        ],
        "tnote": {
          "ask": [
            "어떤 질문을 하면 이야기가 더 깊어질까?"
          ],
          "watch": "질문·반응으로 대화 심화",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "좋은 질문·반응은? ✅",
          "sub": "이야기를 깊게 하는 질문과 반응을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "친구 생각이 궁금할 때는?",
              "emoji": "❓",
              "name": "\"왜 그렇게 생각했어?\""
            },
            {
              "clue": "친구 말에 공감할 때는?",
              "emoji": "😊",
              "name": "\"맞아, 나도 그래!\""
            },
            {
              "clue": "이런 반응은 아쉬워요!",
              "emoji": "🙅",
              "name": "\"몰라, 관심 없어\""
            }
          ],
          "outro": "좋은 질문과 따뜻한 반응이 이야기를 깊게 해요. 모둠이 함께 해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good6",
          "g_talk6"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "모둠 이야기 나누기 🎤",
          "sub": "버튼을 눌러 발표할 친구를 뽑아요. 모둠에서 나눈 생각 중 기억에 남는 것을 말해 봐요!",
          "count": 24,
          "hint": "“◯◯가 ~라고 말한 게 기억에 남아요” 처럼 말해 봐요",
          "end_msg": "모두 말차례를 지켜 깊이 있게 이야기를 나눴어요! 👏"
        },
        "suggested_extras": [
          "t_present6",
          "e_share6"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "질문하고 반응하기",
          "levels": {
            "읽기": {
              "q": "'왜 그렇게 생각했나요?'라는 질문은 어떤 도움이 될까요?",
              "a": "생각을 더 깊게 해요"
            },
            "쓰기": {
              "q": "친구 이야기를 듣고 궁금한 점을 질문으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "짝의 이야기를 듣고 '좋은 생각이야'처럼 반응해 봐요.",
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
          "title": "질문 주고받기 짝 놀이",
          "type": "pair",
          "goal": "질문으로 대화를 이어요",
          "body": "짝이 좋아하는 것을 말하면, 그에 대해 '왜?·어떻게?' 질문을 한 가지씩 주고받아요.",
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
              "q": "좋은 질문은 대화를 어떻게 하나요?",
              "a": "더 깊게 해요"
            },
            {
              "q": "친구 말에 어떻게 반응하나요?",
              "a": "고개를 끄덕이거나 대답해요"
            },
            {
              "q": "질문할 때 마음은?",
              "a": "궁금하고 존중하는 마음"
            }
          ],
          "self": [
            "질문하고 반응할 수 있어요",
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
            "좋은 질문으로 생각을 넓혔어요",
            "친구 말에 알맞게 반응했어요",
            "모둠이 말차례를 지켜 이야기를 나눴어요"
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
          "preview": "소개할 내용을 정리해요",
          "body": "다음 시간에는 친구들에게 나를 소개하기 위해 소개할 내용을 정리해 볼 거예요!"
        },
        "suggested_extras": [
          "e_intro6"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall6",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 나누기",
        "content": "\"지난 시간에 친구의 어떤 생각이 기억에 남나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_deep6",
        "type": "tip",
        "icon": "🧩",
        "title": "질문의 힘",
        "content": "\"왜?\" \"어떻게?\" 같은 질문이 생각을 넓힘을 짚어 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_ask6",
        "type": "fun_question",
        "icon": "❓",
        "title": "어떤 질문?",
        "content": "\"친구에게 무엇을 물어보면 좋을까요?\" 좋은 질문을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_talk6",
        "type": "real_world",
        "icon": "🌍",
        "title": "궁금증 나누기",
        "content": "궁금한 것을 서로 물으며 알게 된 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_ask6",
        "type": "tip",
        "icon": "🧩",
        "title": "반응 더하기",
        "content": "질문과 함께 맞장구·공감 반응을 더하면 대화가 따뜻해져요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_quiet",
        "type": "misconception",
        "icon": "❓",
        "title": "무관심 주의",
        "content": "\"몰라\" \"관심 없어\" 같은 반응은 친구를 속상하게 해요. 따뜻하게 반응하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good6",
        "type": "fun_question",
        "icon": "💡",
        "title": "좋은 질문은?",
        "content": "\"이야기를 깊게 하는 질문은 무엇이죠?\" 까닭 묻기를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_talk6",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 좋은 말 짝짓기",
        "description": "상황과 좋은 질문·반응을 짝지어 보세요.",
        "hint": "이야기를 깊게 하는 말을 골라요.",
        "pairs": [
          {
            "a": {
              "text": "❓ 궁금할 때"
            },
            "b": {
              "text": "왜 그렇게 생각했어?"
            }
          },
          {
            "a": {
              "text": "😊 공감할 때"
            },
            "b": {
              "text": "맞아, 나도!"
            }
          },
          {
            "a": {
              "text": "💗 들은 뒤"
            },
            "b": {
              "text": "그렇구나"
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
        "title": "모둠 나누기",
        "content": "모둠에서 골고루 말하도록 차례를 정해 주세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_share6",
        "type": "extension",
        "icon": "⬆",
        "title": "생각 모으기",
        "content": "\"모둠에서 가장 좋았던 생각을 하나 골라 볼까요?\" 생각을 모아요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect6",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"이야기를 깊게 하려면 무엇을 하죠?\" 질문·반응을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_intro6",
        "type": "extension",
        "icon": "⬆",
        "title": "소개 예고",
        "content": "\"다음엔 나를 소개할 내용을 정리해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l07"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 7,
      "title": "소개할 내용을 정리해요 ①",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 소개 항목 떠올리기 → 정리하는 방법 → 어울리는 소개 내용 모으기 → 내 소개 내용 정리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "소개할 내용을 정리해요",
          "subtitle": "1단원 · 7/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_intro7",
          "t_organize"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "나를 소개할 항목을 떠올려요",
            "어떤 내용을 담을지 정리해요",
            "소개할 내용을 골라 정리해요"
          ]
        },
        "suggested_extras": [
          "t_organize"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "나를 어떻게 소개할까? 🙋",
          "visual": "📋",
          "question": "친구들에게 나를 소개하려고 해요.<br>나에 대해 어떤 것부터 정리하면 좋을까요?",
          "img": "assets/photo/korean/g2_organize_intro1.jpg"
        },
        "suggested_extras": [
          "q_what7",
          "r_intro7"
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
              "q": "좋은 질문은 대화를 어떻게?",
              "a": "더 깊게 해요"
            },
            {
              "q": "친구 말에 어떻게 반응하나요?",
              "a": "고개를 끄덕이거나 대답해요"
            }
          ],
          "from": "u1_l06"
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
          "title": "소개 내용 정리하기",
          "content": "소개할 내용은 **항목별로** 정리하면 쉬워요. 이름·좋아하는 것·잘하는 것·꿈을 떠올리고, 친구가 **궁금해할 만한 것**을 골라요. 까닭을 더하면 더 좋아요!",
          "symbol_meanings": [
            {
              "symbol": "이름",
              "meaning": "나를 알려 주는 첫 항목"
            },
            {
              "symbol": "좋아하는 것",
              "meaning": "음식·놀이·과목 등"
            },
            {
              "symbol": "잘하는 것",
              "meaning": "내가 자신 있는 것"
            },
            {
              "symbol": "꿈",
              "meaning": "되고 싶은 것"
            }
          ]
        },
        "suggested_extras": [
          "t_pick7",
          "x_all7"
        ],
        "tnote": {
          "ask": [
            "나를 소개한다면 어떤 것부터 정리할까?"
          ],
          "watch": "소개 항목 선별·정리",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "소개에 어울리는 내용은? 🤔",
          "sub": "소개 내용으로 어울리는 것을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "내가 좋아하는 것을 소개한다면?",
              "emoji": "🎨",
              "name": "\"제가 좋아하는 것은 그림 그리기입니다\""
            },
            {
              "clue": "내가 잘하는 것을 소개한다면?",
              "emoji": "🏃",
              "name": "\"저는 달리기를 잘합니다\""
            },
            {
              "clue": "이런 건 소개에 어울리지 않아요!",
              "emoji": "🙅",
              "name": "다른 친구의 비밀"
            }
          ],
          "outro": "친구가 궁금해할 내용을 고르면 좋은 소개가 돼요. 내 소개 내용을 정리해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_pick7",
          "g_intro7"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "내 소개 내용을 정리해요",
          "question": "나는 무엇을 소개할지 정리해 볼까요?",
          "items": [
            "내 이름을 어떻게 소개할까요?",
            "좋아하는 것·잘하는 것은 무엇인가요?",
            "왜 그것을 골랐나요?"
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
          "title": "소개할 내용 정리하기",
          "levels": {
            "읽기": {
              "q": "'이름·좋아하는 것·잘하는 것' 중 소개에 넣을 것을 골라 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "나를 소개할 내용 두 가지를 골라 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "정리한 소개 내용을 짝에게 한 가지 말해 봐요.",
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
          "title": "소개 카드 채우기 짝 활동",
          "type": "pair",
          "goal": "소개 내용을 정리해요",
          "body": "짝과 서로에게 물으며 '이름·좋아하는 것·잘하는 것' 소개 카드를 채워 줘요.",
          "materials": [
            "소개 카드"
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
              "q": "소개하기 전에 먼저 할 일은?",
              "a": "내용을 정리해요"
            },
            {
              "q": "소개에 넣으면 좋은 것은?",
              "a": "이름·좋아하는 것 등"
            },
            {
              "q": "정리하면 무엇이 좋나요?",
              "a": "소개를 또렷하게 할 수 있어요"
            }
          ],
          "self": [
            "소개 내용을 정리할 수 있어요",
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
            "나를 소개할 항목을 떠올렸어요",
            "담을 내용을 항목별로 정리했어요",
            "친구가 궁금해할 내용을 골랐어요"
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
          "preview": "소개할 내용을 더 정리해요",
          "body": "다음 시간에는 정리한 내용에 까닭을 더해 소개할 내용을 완성해 볼 거예요!"
        },
        "suggested_extras": [
          "e_intro7"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_intro7",
        "type": "fun_question",
        "icon": "💡",
        "title": "나의 특별함",
        "content": "\"나만의 특별한 점이 있나요?\" 소개 내용을 떠올려요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_organize",
        "type": "tip",
        "icon": "🧩",
        "title": "항목별 정리",
        "content": "이름·좋아하는 것·잘하는 것·꿈처럼 항목별로 정리하면 쓰기가 쉬워져요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_what7",
        "type": "fun_question",
        "icon": "📋",
        "title": "무엇부터?",
        "content": "\"나를 소개할 때 무엇부터 말하면 좋을까요?\" 순서를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_intro7",
        "type": "real_world",
        "icon": "🌍",
        "title": "소개 카드",
        "content": "이름표·소개 카드를 써 본 경험과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_pick7",
        "type": "tip",
        "icon": "🧩",
        "title": "고르기",
        "content": "모든 것을 다 쓰기보다 친구가 궁금해할 내용을 고르게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_all7",
        "type": "misconception",
        "icon": "❓",
        "title": "남의 비밀 금지",
        "content": "소개 글에 다른 사람의 비밀을 쓰지 않도록 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_pick7",
        "type": "fun_question",
        "icon": "💡",
        "title": "나라면",
        "content": "\"나라면 무엇을 가장 먼저 소개할까요?\" 자기 내용을 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_intro7",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "항목 ↔ 예시 짝짓기",
        "description": "소개 항목과 예시를 짝지어 보세요.",
        "hint": "무엇을 알려 주는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🎨 좋아하는 것"
            },
            "b": {
              "text": "그림 그리기"
            }
          },
          {
            "a": {
              "text": "🏃 잘하는 것"
            },
            "b": {
              "text": "달리기"
            }
          },
          {
            "a": {
              "text": "🚀 꿈"
            },
            "b": {
              "text": "우주 비행사"
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
        "title": "한 가지씩",
        "content": "항목을 한 가지씩 떠올려 말하게 해 부담을 줄이세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more7",
        "type": "extension",
        "icon": "⬆",
        "title": "까닭 더하기",
        "content": "\"왜 그것을 좋아하나요?\" 까닭을 더하면 소개가 풍부해져요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect7",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"소개 내용은 어떻게 정리하죠?\" 항목별 정리를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_intro7",
        "type": "extension",
        "icon": "⬆",
        "title": "이어 정리 예고",
        "content": "\"다음엔 까닭을 더해 소개를 완성해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l08"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 8,
      "title": "소개할 내용을 정리해요 ②",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 까닭 더하기 → 소개 표현 익히기 → 바른 소개 문장 고르기 → 소개 표현 따라 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "소개할 내용을 정리해요",
          "subtitle": "1단원 · 8/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_recall8",
          "t_expr8"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "소개 내용에 까닭을 더해요",
            "소개하는 표현을 익혀요",
            "소개 문장을 따라 써요"
          ]
        },
        "suggested_extras": [
          "t_expr8"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "왜 좋아하는지 말해 줘요 💗",
          "visual": "💭",
          "question": "\"저는 축구를 좋아합니다\"에 까닭을 더하면?<br>\"친구들과 함께 뛰면 즐겁기 때문입니다\" — 어떤가요?",
          "img": "assets/photo/korean/g2_organize_intro2.jpg"
        },
        "suggested_extras": [
          "q_why8",
          "r_expr8"
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
              "q": "소개하기 전에 먼저 할 일은?",
              "a": "내용을 정리해요"
            },
            {
              "q": "소개에 넣으면 좋은 것은?",
              "a": "이름·좋아하는 것 등"
            }
          ],
          "from": "u1_l07"
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
          "title": "소개하는 표현",
          "content": "소개할 땐 \"**저는 ~입니다**\" \"**제가 좋아하는 것은 ~입니다**\" 같은 표현을 써요. 여기에 \"**왜냐하면 ~기 때문입니다**\"로 **까닭**을 더하면 소개가 훨씬 잘 전해져요!",
          "symbol_meanings": [
            {
              "symbol": "\"저는 ~입니다\"",
              "meaning": "나를 알리는 표현"
            },
            {
              "symbol": "\"좋아하는 것은~\"",
              "meaning": "좋아하는 것 소개"
            },
            {
              "symbol": "\"잘하는 것은~\"",
              "meaning": "잘하는 것 소개"
            },
            {
              "symbol": "\"왜냐하면~\"",
              "meaning": "까닭을 더해요"
            }
          ]
        },
        "suggested_extras": [
          "t_reason8",
          "x_short8"
        ],
        "tnote": {
          "ask": [
            "'좋아합니다'에 까닭을 더하면 무엇이 좋을까?"
          ],
          "watch": "까닭 넣은 소개 표현",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 소개 문장은? ✅",
          "sub": "소개하는 문장을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "이름을 소개하는 문장은?",
              "emoji": "🙋",
              "name": "\"제 이름은 ○○○입니다.\""
            },
            {
              "clue": "까닭을 더한 문장은?",
              "emoji": "💗",
              "name": "\"노래를 좋아합니다. 부르면 기분이 좋기 때문입니다.\""
            },
            {
              "clue": "이런 문장은 아쉬워요!",
              "emoji": "🙅",
              "name": "\"몰라. 그냥.\""
            }
          ],
          "outro": "까닭을 더한 소개 문장이 마음을 더 잘 전해요. 따라 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good8",
          "g_expr8"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "소개 표현을 따라 써요 ✍️",
          "content": "소개할 때 자주 쓰는 표현을 또박또박 따라 써 봐요. **\"저는 ○○○입니다\"** **\"제가 좋아하는 것은 ~입니다\"**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "저는 ○○○입니다",
              "meaning": "이름 소개 표현"
            },
            {
              "symbol": "좋아하는 것은~",
              "meaning": "좋아하는 것 표현"
            },
            {
              "symbol": "왜냐하면~",
              "meaning": "까닭 표현"
            }
          ]
        },
        "suggested_extras": [
          "t_trace8",
          "e_more8"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "까닭을 더해 소개하기",
          "levels": {
            "읽기": {
              "q": "'저는 책 읽기를 좋아합니다. 이야기가 재미있기 때문입니다.'에서 까닭은?",
              "a": "이야기가 재미있기 때문"
            },
            "쓰기": {
              "q": "내가 좋아하는 것과 그 까닭을 이어 한 문장으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "까닭을 더해 나를 소개하는 말을 한 가지 해 봐요.",
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
          "title": "까닭 더하기 짝 활동",
          "type": "pair",
          "goal": "소개에 까닭을 더해요",
          "body": "짝이 좋아하는 것을 말하면 '왜 좋아해?'라고 물어 까닭을 이끌어 내고 서로 소개 문장을 완성해요.",
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
              "q": "소개에 까닭을 더하면?",
              "a": "더 잘 이해돼요"
            },
            {
              "q": "'좋아합니다'에 무엇을 더하나요?",
              "a": "까닭"
            },
            {
              "q": "소개 표현은 어떤 말투로?",
              "a": "바르고 고운 말투"
            }
          ],
          "self": [
            "까닭을 더해 소개할 수 있어요",
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
            "소개 내용에 까닭을 더했어요",
            "소개하는 표현을 익혔어요",
            "소개 문장을 따라 썼어요"
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
          "preview": "자신을 소개하는 글을 써요",
          "body": "다음 시간에는 정리한 내용으로 자신을 소개하는 글을 직접 써 볼 거예요!"
        },
        "suggested_extras": [
          "e_write8"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_recall8",
        "type": "fun_question",
        "icon": "💡",
        "title": "지난 정리",
        "content": "\"지난 시간에 어떤 소개 내용을 정리했나요?\" 이어 가는 발문.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_expr8",
        "type": "tip",
        "icon": "🧩",
        "title": "표현 익히기",
        "content": "\"저는 ~입니다\" 같은 소개 표현을 반복 연습하게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_why8",
        "type": "fun_question",
        "icon": "💗",
        "title": "까닭의 힘",
        "content": "\"까닭을 더하니 소개가 어떻게 달라졌나요?\" 까닭의 힘을 느끼게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_expr8",
        "type": "real_world",
        "icon": "🌍",
        "title": "자기소개 영상",
        "content": "자기소개를 하는 여러 상황을 떠올리게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_reason8",
        "type": "tip",
        "icon": "🧩",
        "title": "까닭 더하기",
        "content": "\"왜냐하면 ~기 때문입니다\"로 까닭을 더하게 연습시키세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_short8",
        "type": "misconception",
        "icon": "❓",
        "title": "단답 주의",
        "content": "\"몰라\" \"그냥\"으로 끝내지 않게 까닭을 한마디라도 더하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good8",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 문장은?",
        "content": "\"좋은 소개 문장에는 무엇이 들어가죠?\" 까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_expr8",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "항목 ↔ 표현 짝짓기",
        "description": "소개 항목과 표현을 짝지어 보세요.",
        "hint": "어떻게 소개하는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🙋 이름"
            },
            "b": {
              "text": "저는 ○○○입니다"
            }
          },
          {
            "a": {
              "text": "💗 좋아하는 것"
            },
            "b": {
              "text": "좋아하는 것은~"
            }
          },
          {
            "a": {
              "text": "❓ 까닭"
            },
            "b": {
              "text": "왜냐하면~"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_trace8",
        "type": "tip",
        "icon": "✍️",
        "title": "또박또박",
        "content": "소개 표현을 또박또박 따라 쓰며 문장 구조를 익히게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "e_more8",
        "type": "extension",
        "icon": "⬆",
        "title": "내 문장 만들기",
        "content": "\"표현에 내 내용을 넣어 문장을 만들어 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect8",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"좋은 소개 문장은 무엇이 다르죠?\" 까닭 더하기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_write8",
        "type": "extension",
        "icon": "⬆",
        "title": "글쓰기 예고",
        "content": "\"다음엔 자신을 소개하는 글을 써요!\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l09"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 9,
      "title": "자신을 소개하는 글을 써요 ①",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 소개 글 짜임 → 글 쓰는 차례 → 짜임에 맞는 문장 모으기 → 소개 글 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "자신을 소개하는 글을 써요",
          "subtitle": "1단원 · 9/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_write9",
          "t_write9"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "소개 글의 짜임을 알아봐요",
            "정리한 내용으로 글을 써요",
            "문장으로 또박또박 써요"
          ]
        },
        "suggested_extras": [
          "t_write9"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "이제 글로 써 봐요 ✍️",
          "visual": "📝",
          "question": "정리한 내용을 글로 써 보려고 해요.<br>어떤 순서로 쓰면 좋을까요?",
          "img": "assets/photo/korean/g2_write_intro1.jpg"
        },
        "suggested_extras": [
          "q_order9",
          "r_write9"
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
              "q": "소개에 까닭을 더하면?",
              "a": "더 잘 이해돼요"
            },
            {
              "q": "소개 표현은 어떤 말투로?",
              "a": "바르고 고운 말투"
            }
          ],
          "from": "u1_l08"
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
          "title": "소개 글의 짜임",
          "content": "소개 글은 **인사 → 이름 → 좋아하는 것·잘하는 것 → 끝인사** 차례로 써요. 3~5문장 정도로 **한 문단**을 이루면 좋은 소개 글이 돼요!",
          "symbol_meanings": [
            {
              "symbol": "① 인사",
              "meaning": "\"안녕하세요?\""
            },
            {
              "symbol": "② 이름",
              "meaning": "\"제 이름은 ○○○입니다\""
            },
            {
              "symbol": "③ 좋아·잘하는 것",
              "meaning": "까닭과 함께"
            },
            {
              "symbol": "④ 끝인사",
              "meaning": "\"잘 부탁합니다\""
            }
          ]
        },
        "suggested_extras": [
          "t_form9",
          "x_order9"
        ],
        "tnote": {
          "ask": [
            "소개 글을 어떤 순서로 쓰면 좋을까?"
          ],
          "watch": "글 짜임 이해·쓰기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "소개 글에 어울리는 문장은? ✅",
          "sub": "소개 글 짜임에 맞는 문장을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "글을 시작할 때는?",
              "emoji": "👋",
              "name": "\"안녕하세요? 저를 소개하겠습니다.\""
            },
            {
              "clue": "가운데에 담을 내용은?",
              "emoji": "💗",
              "name": "\"제가 좋아하는 것은 책 읽기입니다.\""
            },
            {
              "clue": "글을 마칠 때는?",
              "emoji": "🤝",
              "name": "\"앞으로 잘 부탁합니다.\""
            }
          ],
          "outro": "짜임에 맞게 쓰면 읽는 사람이 잘 이해해요. 이제 직접 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good9",
          "g_form9"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "소개 글을 써요",
          "question": "정리한 내용으로 소개 글을 써 볼까요?",
          "items": [
            "어떤 인사로 시작할까요?",
            "이름과 좋아하는 것을 어떻게 쓸까요?",
            "어떤 끝인사로 마칠까요?"
          ]
        },
        "suggested_extras": [
          "t_present9",
          "e_write9b"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "소개 글 짜임에 맞게 쓰기",
          "levels": {
            "읽기": {
              "q": "소개 글은 '처음-가운데-끝' 중 무엇으로 시작하면 좋을까요?",
              "a": "처음(인사·이름)"
            },
            "쓰기": {
              "q": "'안녕하세요, 저는 ◯◯입니다.'로 소개 글 첫 문장을 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "내가 쓴 소개 글 첫 부분을 짝에게 읽어 줘요.",
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
          "title": "소개 글 함께 다듬기 짝 활동",
          "type": "pair",
          "goal": "짜임에 맞게 써요",
          "body": "짝과 소개 글을 바꿔 읽고 '처음-가운데-끝'이 있는지 확인해 줘요.",
          "materials": [
            "공책"
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
              "q": "소개 글은 어떤 순서로 쓰나요?",
              "a": "처음-가운데-끝"
            },
            {
              "q": "처음에는 무엇을 쓰나요?",
              "a": "인사와 이름"
            },
            {
              "q": "가운데에는 무엇을 쓰나요?",
              "a": "소개할 내용과 까닭"
            }
          ],
          "self": [
            "짜임에 맞게 소개 글을 쓸 수 있어요",
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
            "소개 글의 짜임을 알았어요",
            "짜임에 맞게 글을 썼어요",
            "문장으로 또박또박 썼어요"
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
          "preview": "소개 글을 다듬고 발표해요",
          "body": "다음 시간에는 쓴 소개 글을 다듬고 친구들 앞에서 발표해 볼 거예요!"
        },
        "suggested_extras": [
          "e_present9"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_write9",
        "type": "fun_question",
        "icon": "💡",
        "title": "글로 쓰기",
        "content": "\"말로 한 소개를 글로 쓰면 무엇이 좋을까요?\" 쓰기의 의미를 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_write9",
        "type": "tip",
        "icon": "🧩",
        "title": "짜임 따라",
        "content": "인사→이름→좋아하는 것→끝인사 짜임을 따라 쓰게 하면 쉬워요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_order9",
        "type": "fun_question",
        "icon": "📝",
        "title": "어떤 순서?",
        "content": "\"소개 글은 무엇부터 쓰면 좋을까요?\" 순서를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_write9",
        "type": "real_world",
        "icon": "🌍",
        "title": "편지 짜임",
        "content": "편지의 첫인사·끝인사처럼 소개 글에도 짜임이 있음을 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_form9",
        "type": "tip",
        "icon": "🧩",
        "title": "한 문단",
        "content": "3~5문장으로 한 문단을 이루게 안내하세요. 너무 길지 않아도 좋아요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_order9",
        "type": "misconception",
        "icon": "❓",
        "title": "뒤죽박죽 주의",
        "content": "내용을 뒤섞지 말고 짜임 차례대로 쓰게 안내하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good9",
        "type": "fun_question",
        "icon": "💡",
        "title": "어울리는 문장은?",
        "content": "\"이 자리에 어울리는 문장은 무엇이죠?\" 짜임을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_form9",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "짜임 ↔ 문장 짝짓기",
        "description": "소개 글 짜임과 문장을 짝지어 보세요.",
        "hint": "글의 순서를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "👋 시작"
            },
            "b": {
              "text": "안녕하세요?"
            }
          },
          {
            "a": {
              "text": "💗 가운데"
            },
            "b": {
              "text": "좋아하는 것은~"
            }
          },
          {
            "a": {
              "text": "🤝 끝"
            },
            "b": {
              "text": "잘 부탁합니다"
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
        "title": "천천히 쓰기",
        "content": "부담 없이 한 문장씩 천천히 쓰게 하고, 어려워하면 표현을 보여 주세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_write9b",
        "type": "extension",
        "icon": "⬆",
        "title": "까닭 더하기",
        "content": "\"좋아하는 것에 까닭을 더해 볼까요?\" 글을 풍부하게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect9",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"소개 글의 짜임은 무엇이죠?\" 인사·이름·끝인사를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_present9",
        "type": "extension",
        "icon": "⬆",
        "title": "발표 예고",
        "content": "\"다음엔 소개 글을 다듬고 발표해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l10"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 10,
      "title": "자신을 소개하는 글을 써요 ②",
      "std": "[2국03-02] · [2국01-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 글 다듬기 → 발표하는 방법 → 바른 발표 모습 고르기 → 소개 글 발표 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "자신을 소개하는 글을 써요",
          "subtitle": "1단원 · 10/14차시 · 소단원 2"
        },
        "suggested_extras": [
          "q_check10",
          "t_polish"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "쓴 소개 글을 다듬어요",
            "바른 자세로 발표하는 법을 알아봐요",
            "소개 글을 친구들 앞에서 발표해요"
          ]
        },
        "suggested_extras": [
          "t_polish"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "내 소개 글을 들려줘요 🎤",
          "visual": "📢",
          "question": "쓴 소개 글을 친구들 앞에서 발표해요.<br>어떻게 발표하면 친구들이 잘 들을 수 있을까요?",
          "img": "assets/photo/korean/g2_write_intro2.jpg"
        },
        "suggested_extras": [
          "q_how10",
          "r_present10"
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
              "q": "소개 글은 어떤 순서로?",
              "a": "처음-가운데-끝"
            },
            {
              "q": "처음에는 무엇을?",
              "a": "인사와 이름"
            }
          ],
          "from": "u1_l09"
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
          "title": "다듬고 발표하기",
          "content": "발표하기 전에 글을 **다시 읽으며** 어색한 곳을 고쳐요. 발표할 땐 **허리를 펴고** 앞을 보며 **또박또박** 읽어요. 듣는 친구는 **바른 자세로** 들어요!",
          "symbol_meanings": [
            {
              "symbol": "다시 읽기",
              "meaning": "어색한 곳 고치기"
            },
            {
              "symbol": "허리 펴기",
              "meaning": "바른 자세로"
            },
            {
              "symbol": "또박또박",
              "meaning": "천천히 분명하게"
            },
            {
              "symbol": "바른 듣기",
              "meaning": "친구 소개를 잘 들어요"
            }
          ]
        },
        "suggested_extras": [
          "t_polish10",
          "x_fast10"
        ],
        "tnote": {
          "ask": [
            "친구들이 잘 들으려면 어떻게 발표할까?"
          ],
          "watch": "다듬기·바른 발표",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 발표 모습은? ✅",
          "sub": "소개 글 발표의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "발표하기 전에는?",
              "emoji": "🔎",
              "name": "글을 다시 읽고 어색한 곳을 고쳐요"
            },
            {
              "clue": "발표할 때 자세는?",
              "emoji": "🧍",
              "name": "허리 펴고 앞을 보며 또박또박"
            },
            {
              "clue": "친구가 발표할 때는?",
              "emoji": "👂",
              "name": "바른 자세로 잘 들어요"
            }
          ],
          "outro": "다듬고 바른 자세로 발표하면 소개가 잘 전해져요. 발표해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good10",
          "g_present10"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "소개 글을 발표해요 🎤",
          "sub": "버튼을 눌러 발표할 친구를 뽑아요. 쓴 소개 글을 바른 자세로 또박또박 발표해 봐요!",
          "count": 24,
          "hint": "“안녕하세요? 제 이름은 ○○○입니다…” 허리 펴고 또박또박 읽어요",
          "end_msg": "모두 멋지게 자신을 소개했어요. 서로를 더 잘 알게 됐어요! 👏"
        },
        "suggested_extras": [
          "t_present10",
          "e_listen10"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "다듬고 바르게 발표하기",
          "levels": {
            "읽기": {
              "q": "발표할 때 목소리는 어떻게 하면 좋을까요?",
              "a": "또렷하고 알맞은 크기로"
            },
            "쓰기": {
              "q": "소개 글에서 고칠 곳 한 군데를 찾아 바르게 고쳐 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "바른 자세로 내 소개 글을 발표해 봐요.",
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
          "title": "발표 연습 짝 활동",
          "type": "pair",
          "goal": "바른 발표를 연습해요",
          "body": "짝 앞에서 소개 글을 발표하고, 짝은 좋았던 점 한 가지를 말해 줘요.",
          "materials": [
            "공책"
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
              "q": "발표 전에 글을 어떻게 하나요?",
              "a": "다듬어요"
            },
            {
              "q": "바른 발표 자세는?",
              "a": "허리를 펴고 또렷하게"
            },
            {
              "q": "들을 때는 어떻게?",
              "a": "끝까지 잘 들어요"
            }
          ],
          "self": [
            "소개 글을 다듬어 발표할 수 있어요",
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
            "쓴 소개 글을 다듬었어요",
            "바른 자세로 발표했어요",
            "친구 소개를 잘 들었어요"
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
          "preview": "주변 사람을 소개해요",
          "body": "다음 시간에는 가족이나 친구 등 주변 사람을 소개하는 활동을 해 볼 거예요!"
        },
        "suggested_extras": [
          "e_other10"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_check10",
        "type": "fun_question",
        "icon": "💡",
        "title": "다시 읽기",
        "content": "\"내가 쓴 글을 다시 읽으면 무엇이 보일까요?\" 다듬기의 필요를 느끼게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_polish",
        "type": "tip",
        "icon": "🧩",
        "title": "다듬기와 발표",
        "content": "발표 전 글을 다시 읽고 고치는 다듬기 단계를 빠뜨리지 않게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how10",
        "type": "fun_question",
        "icon": "📢",
        "title": "잘 들리게",
        "content": "\"뒷자리 친구도 들리려면 어떻게 발표할까요?\" 발표 태도를 짚어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_present10",
        "type": "real_world",
        "icon": "🌍",
        "title": "발표 무대",
        "content": "학예회·자기소개 발표 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_polish10",
        "type": "tip",
        "icon": "🧩",
        "title": "소리 내어 읽기",
        "content": "발표 전 소리 내어 읽으면 어색한 곳을 찾기 쉬워요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_fast10",
        "type": "misconception",
        "icon": "❓",
        "title": "빠르게 ≠ 잘",
        "content": "빨리 읽기보다 천천히 또박또박 읽는 것이 잘 전해짐을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good10",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"바른 발표 모습은 무엇이죠?\" 다듬기·자세를 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_present10",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "단계 ↔ 할 일 짝짓기",
        "description": "발표 단계와 할 일을 짝지어 보세요.",
        "hint": "발표 차례를 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "🔎 발표 전"
            },
            "b": {
              "text": "글 다듬기"
            }
          },
          {
            "a": {
              "text": "🧍 발표할 때"
            },
            "b": {
              "text": "허리 펴고 또박또박"
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
        "id": "t_present10",
        "type": "tip",
        "icon": "🗣",
        "title": "격려하기",
        "content": "발표하는 친구를 격려하고, 듣는 친구는 좋았던 점을 찾게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_listen10",
        "type": "extension",
        "icon": "⬆",
        "title": "친구 알기",
        "content": "\"친구 소개에서 새로 알게 된 점은?\" 서로를 알아 가게 해요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect10",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘의 발견",
        "content": "\"발표 전에 무엇을 해야 하죠?\" 다듬기를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_other10",
        "type": "extension",
        "icon": "⬆",
        "title": "주변 소개 예고",
        "content": "\"다음엔 주변 사람을 소개해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l11"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 11,
      "title": "주변 사람을 소개해요 ① (실천)",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 소개할 사람 떠올리기 → 소개 내용 정하기 → 어울리는 소개 모으기 → 소개 글 쓰기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "주변 사람을 소개해요",
          "subtitle": "1단원 · 11/14차시 · 실천"
        },
        "suggested_extras": [
          "q_who11",
          "t_other11"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "소개하고 싶은 사람을 떠올려요",
            "그 사람의 소개 내용을 정해요",
            "그 사람을 소개하는 글을 써요"
          ]
        },
        "suggested_extras": [
          "t_other11"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "내가 아끼는 사람을 알려요 💗",
          "visual": "👨‍👩‍👧",
          "question": "가족·친구 중 친구들에게 소개하고 싶은 사람이 있나요?<br>그 사람의 어떤 점을 알려 주고 싶나요?",
          "img": "assets/photo/korean/g2_intro_others1.jpg"
        },
        "suggested_extras": [
          "q_pick11",
          "r_other11"
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
              "q": "발표 전에 글을 어떻게?",
              "a": "다듬어요"
            },
            {
              "q": "바른 발표 자세는?",
              "a": "허리를 펴고 또렷하게"
            }
          ],
          "from": "u1_l10"
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
          "title": "주변 사람 소개하기",
          "content": "주변 사람을 소개할 땐 **누구인지**, 그 사람의 **좋은 점**이나 **고마운 점**, 그렇게 생각한 **까닭**을 담아요. 나를 소개할 때와 짜임은 비슷해요!",
          "symbol_meanings": [
            {
              "symbol": "누구",
              "meaning": "\"제 동생을 소개합니다\""
            },
            {
              "symbol": "좋은 점",
              "meaning": "\"마음이 따뜻합니다\""
            },
            {
              "symbol": "고마운 점",
              "meaning": "\"늘 도와줍니다\""
            },
            {
              "symbol": "까닭",
              "meaning": "\"왜냐하면 ~기 때문입니다\""
            }
          ]
        },
        "suggested_extras": [
          "t_other11b",
          "x_secret"
        ],
        "tnote": {
          "ask": [
            "소개하고 싶은 사람의 어떤 점을 알려 주고 싶어?"
          ],
          "watch": "대상·내용 선정",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "주변 사람 소개에 어울리는 내용은? ✅",
          "sub": "주변 사람 소개에 어울리는 내용을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "누구인지 알려 줄 때는?",
              "emoji": "👨‍👩‍👧",
              "name": "\"제가 소개할 사람은 제 짝꿍입니다.\""
            },
            {
              "clue": "좋은 점을 알려 줄 때는?",
              "emoji": "💗",
              "name": "\"친구를 잘 도와주는 따뜻한 친구입니다.\""
            },
            {
              "clue": "이런 건 소개하면 안 돼요!",
              "emoji": "🙅",
              "name": "그 사람이 부끄러워할 비밀"
            }
          ],
          "outro": "좋은 점을 까닭과 함께 담으면 멋진 소개가 돼요. 직접 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good11",
          "g_other11"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "소개 글을 써요",
          "question": "소개할 사람을 정해 글을 써 볼까요?",
          "items": [
            "누구를 소개하고 싶나요?",
            "그 사람의 어떤 점이 좋은가요?",
            "왜 그렇게 생각하나요?"
          ]
        },
        "suggested_extras": [
          "t_present11",
          "e_more11"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "주변 사람 소개할 내용 정하기",
          "levels": {
            "읽기": {
              "q": "'우리 이모는 요리를 잘합니다.'는 그 사람의 무엇을 알려 주나요?",
              "a": "잘하는 것"
            },
            "쓰기": {
              "q": "소개하고 싶은 사람의 좋은 점 한 가지를 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "소개하고 싶은 사람이 누구이고 왜인지 짝에게 말해 봐요.",
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
          "title": "누구를 소개할까 짝 활동",
          "type": "pair",
          "goal": "소개할 사람을 정해요",
          "body": "짝과 서로 소개하고 싶은 사람과 그 좋은 점을 한 가지씩 말해 주고 정해요.",
          "materials": [
            "소개 카드"
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
              "q": "주변 사람을 소개할 때 무엇을 알려 주나요?",
              "a": "그 사람의 좋은 점"
            },
            {
              "q": "소개할 사람으로 누가 있을까요?",
              "a": "가족·친구 등"
            },
            {
              "q": "소개 전에 할 일은?",
              "a": "알려 줄 내용을 정해요"
            }
          ],
          "self": [
            "소개할 사람과 내용을 정할 수 있어요",
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
            "소개할 사람을 떠올렸어요",
            "소개 내용을 정했어요",
            "주변 사람을 소개하는 글을 썼어요"
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
          "preview": "주변 사람을 소개하고 나눠요",
          "body": "다음 시간에는 쓴 글로 주변 사람을 친구들 앞에서 소개하고 나눠 볼 거예요!"
        },
        "suggested_extras": [
          "e_share11"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_who11",
        "type": "fun_question",
        "icon": "💡",
        "title": "아끼는 사람",
        "content": "\"가장 먼저 떠오르는 고마운 사람은 누구인가요?\" 소개 대상을 떠올려요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_other11",
        "type": "tip",
        "icon": "🧩",
        "title": "짜임은 비슷",
        "content": "나를 소개할 때와 짜임이 비슷하니 앞서 배운 것을 떠올리게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_pick11",
        "type": "fun_question",
        "icon": "👨‍👩‍👧",
        "title": "어떤 점을?",
        "content": "\"그 사람의 어떤 점을 알려 주고 싶나요?\" 소개 내용을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_other11",
        "type": "real_world",
        "icon": "🌍",
        "title": "가족·친구",
        "content": "가족·친구·이웃 등 주변 사람과 이어 주세요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_other11b",
        "type": "tip",
        "icon": "🧩",
        "title": "좋은 점 중심",
        "content": "좋은 점·고마운 점을 까닭과 함께 담게 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_secret",
        "type": "misconception",
        "icon": "❓",
        "title": "비밀 금지",
        "content": "그 사람이 부끄러워할 비밀은 소개하지 않도록 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_good11",
        "type": "fun_question",
        "icon": "💡",
        "title": "어울리는 내용은?",
        "content": "\"주변 사람 소개에 무엇을 담죠?\" 누구·좋은 점·까닭을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_other11",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "항목 ↔ 문장 짝짓기",
        "description": "소개 항목과 문장을 짝지어 보세요.",
        "hint": "무엇을 알려 주는지 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "👨‍👩‍👧 누구"
            },
            "b": {
              "text": "제 짝꿍입니다"
            }
          },
          {
            "a": {
              "text": "💗 좋은 점"
            },
            "b": {
              "text": "따뜻합니다"
            }
          },
          {
            "a": {
              "text": "❓ 까닭"
            },
            "b": {
              "text": "왜냐하면~"
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
        "title": "한 가지씩",
        "content": "소개 내용을 한 가지씩 떠올려 쓰게 해 부담을 줄이세요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_more11",
        "type": "extension",
        "icon": "⬆",
        "title": "고마움 더하기",
        "content": "\"그 사람에게 고마운 일을 떠올려 볼까요?\" 소개를 풍부하게 해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect11",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"주변 사람 소개에 무엇을 담았죠?\" 배움을 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_share11",
        "type": "extension",
        "icon": "⬆",
        "title": "소개 나누기 예고",
        "content": "\"다음엔 쓴 소개를 친구들에게 들려줘요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l12"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 12,
      "title": "주변 사람을 소개해요 ② (실천)",
      "std": "[2국03-02] · [2국01-04]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 발표·듣기 약속 → 발표하고 질문하기 → 바른 모습 모으기 → 소개 발표·나누기 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "주변 사람을 소개해요",
          "subtitle": "1단원 · 12/14차시 · 실천"
        },
        "suggested_extras": [
          "q_ready12",
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
            "바른 자세로 소개를 발표해요",
            "친구 소개를 잘 듣고 질문해요",
            "소개를 듣고 느낌을 나눠요"
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
          "scene_title": "내가 아끼는 사람을 소개해요 🎤",
          "visual": "📢",
          "question": "쓴 글로 주변 사람을 소개해요.<br>친구 소개를 듣고 무엇을 물어보면 좋을까요?",
          "img": "assets/photo/korean/g2_intro_others2.jpg"
        },
        "suggested_extras": [
          "q_how12",
          "r_present12"
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
              "q": "주변 사람을 소개할 때 무엇을?",
              "a": "그 사람의 좋은 점"
            },
            {
              "q": "소개 전에 할 일은?",
              "a": "알려 줄 내용을 정해요"
            }
          ],
          "from": "u1_l11"
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
          "title": "소개하고 질문하기",
          "content": "발표할 땐 **또박또박** 소개하고, 들을 땐 **바른 자세로** 들어요. 소개를 듣고 **궁금한 점**을 물으면 그 사람을 더 잘 알게 돼요. 말차례를 지켜 질문해요!",
          "symbol_meanings": [
            {
              "symbol": "또박또박 소개",
              "meaning": "바른 자세로 발표"
            },
            {
              "symbol": "바른 듣기",
              "meaning": "친구 소개를 잘 들어요"
            },
            {
              "symbol": "질문하기",
              "meaning": "궁금한 점을 물어요"
            },
            {
              "symbol": "말차례",
              "meaning": "차례를 지켜 질문해요"
            }
          ]
        },
        "suggested_extras": [
          "t_ask12",
          "x_cut12"
        ],
        "tnote": {
          "ask": [
            "친구 소개를 듣고 무엇을 물어보면 좋을까?"
          ],
          "watch": "소개 발표·경청·질문 종합",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "바른 소개·듣기 모습은? ✅",
          "sub": "소개 발표의 바른 모습을 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "소개를 발표할 때는?",
              "emoji": "🎤",
              "name": "또박또박 바른 자세로 소개해요"
            },
            {
              "clue": "친구 소개를 들을 때는?",
              "emoji": "👂",
              "name": "바른 자세로 끝까지 들어요"
            },
            {
              "clue": "궁금한 점이 있을 때는?",
              "emoji": "🙋",
              "name": "말차례를 지켜 질문해요"
            }
          ],
          "outro": "발표하고 질문하면 서로를 더 잘 알게 돼요. 발표해 볼까요? 😊"
        },
        "suggested_extras": [
          "q_good12",
          "g_present12"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "주변 사람을 소개해요 🎤",
          "sub": "버튼을 눌러 발표할 친구를 뽑아요. 쓴 글로 주변 사람을 바른 자세로 소개해 봐요!",
          "count": 24,
          "hint": "“제가 소개할 사람은 ○○입니다…” 또박또박 소개하고, 들은 친구는 질문해 봐요",
          "end_msg": "모두 아끼는 사람을 멋지게 소개했어요. 서로의 소중한 사람을 알게 됐어요! 👏"
        },
        "suggested_extras": [
          "t_present12",
          "e_ask12"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "소개하고 질문 나누기",
          "levels": {
            "읽기": {
              "q": "친구의 소개를 듣고 궁금한 점을 어떻게 물으면 좋을까요?",
              "a": "고운 말로 질문해요"
            },
            "쓰기": {
              "q": "친구 소개를 듣고 물어볼 질문 한 가지를 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "내가 정한 사람을 짝에게 소개하고, 짝의 질문에 답해 봐요.",
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
          "title": "소개 발표·질문 짝 활동",
          "type": "pair",
          "goal": "소개하고 질문을 나눠요",
          "body": "짝에게 주변 사람을 소개하고, 서로 한 가지씩 질문하고 답해요.",
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
              "q": "소개를 들은 뒤 무엇을 하나요?",
              "a": "궁금한 점을 질문해요"
            },
            {
              "q": "질문할 때 말투는?",
              "a": "고운 말"
            },
            {
              "q": "소개를 들을 때는?",
              "a": "끝까지 잘 들어요"
            }
          ],
          "self": [
            "소개하고 질문을 나눌 수 있어요",
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
            "바른 자세로 소개를 발표했어요",
            "친구 소개를 잘 듣고 질문했어요",
            "소개를 듣고 느낌을 나눴어요"
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
        "id": "q_ready12",
        "type": "fun_question",
        "icon": "💡",
        "title": "소개 마음",
        "content": "\"내가 아끼는 사람을 소개하는 마음은 어떤가요?\" 발표를 편하게 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_share12",
        "type": "tip",
        "icon": "🧩",
        "title": "질문 주고받기",
        "content": "소개 뒤 질문을 주고받으면 서로를 더 잘 알게 됨을 안내하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_how12",
        "type": "fun_question",
        "icon": "📢",
        "title": "무엇을 물을까",
        "content": "\"친구 소개를 듣고 무엇이 궁금한가요?\" 질문을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_present12",
        "type": "real_world",
        "icon": "🌍",
        "title": "소개 시간",
        "content": "누군가를 소개받았던 경험과 이어 주세요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_ask12",
        "type": "tip",
        "icon": "🧩",
        "title": "질문은 말차례 지켜",
        "content": "질문도 말차례를 지켜 한 사람씩 하게 안내하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_cut12",
        "type": "misconception",
        "icon": "❓",
        "title": "끼어들기 주의",
        "content": "소개 중 끼어들지 말고 끝난 뒤 질문하게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_good12",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 모습은?",
        "content": "\"소개·듣기의 바른 모습은 무엇이죠?\" 발표·듣기·질문을 짚어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_present12",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "상황 ↔ 바른 모습 짝짓기",
        "description": "소개 상황과 바른 모습을 짝지어 보세요.",
        "hint": "서로 존중하는 모습을 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🎤 소개"
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
              "text": "끝까지 듣기"
            }
          },
          {
            "a": {
              "text": "🙋 질문"
            },
            "b": {
              "text": "말차례 지켜"
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
        "title": "질문 이끌기",
        "content": "소개 뒤 한두 가지 질문을 받아 서로를 알아 가게 하세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_ask12",
        "type": "extension",
        "icon": "⬆",
        "title": "새로 안 점",
        "content": "\"소개를 듣고 새로 알게 된 점은?\" 나눔을 깊게 해요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect12",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"소개하고 무엇을 했죠?\" 발표·질문을 짚어요.",
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

  window.LESSONS["u1_l13"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 13,
      "title": "마무리하기 ① — 스스로 확인",
      "std": "[2국01-02] · [2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 말차례·소개 정리 → 확인 퀴즈 → 스스로 확인 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ① — 스스로 확인",
          "subtitle": "1단원 · 13/14차시 · 마무리"
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
            "말차례·소개하는 법을 정리해요",
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
          "scene_title": "1단원에서 무엇을 배웠나요? 🎀",
          "visual": "💬",
          "question": "말차례를 지켜 대화하고, 나와 주변 사람을 소개했어요.<br>가장 기억에 남는 것은 무엇인가요?",
          "img": "assets/photo/korean/g2_review1.jpg"
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
              "q": "소개를 들은 뒤 무엇을?",
              "a": "궁금한 점을 질문해요"
            },
            {
              "q": "소개를 들을 때는?",
              "a": "끝까지 잘 들어요"
            }
          ],
          "from": "u1_l12"
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
          "title": "말차례·소개 정리",
          "content": "이 단원에서 **말차례를 지켜 대화하는 법**과 **자신·주변 사람을 소개하는 법**을 배웠어요. 잘 듣고 차례를 지키며, 까닭을 담아 소개하면 마음이 잘 통해요!",
          "symbol_meanings": [
            {
              "symbol": "말차례",
              "meaning": "한 사람씩 차례대로"
            },
            {
              "symbol": "경청",
              "meaning": "끝까지 잘 듣기"
            },
            {
              "symbol": "소개 짜임",
              "meaning": "인사·이름·좋아하는 것·끝인사"
            },
            {
              "symbol": "까닭 더하기",
              "meaning": "왜 그런지 함께"
            }
          ]
        },
        "suggested_extras": [
          "t_method13",
          "x_forget13"
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
              "clue": "친구가 말할 때 바른 태도는?",
              "emoji": "👂",
              "name": "말차례를 지켜 끝까지 들어요"
            },
            {
              "clue": "소개 글에 담을 내용은?",
              "emoji": "🙋",
              "name": "이름·좋아하는 것·잘하는 것"
            },
            {
              "clue": "좋은 소개 문장은?",
              "emoji": "💗",
              "name": "까닭을 더해 말해요"
            }
          ],
          "outro": "배운 것을 잘 기억하고 있어요. 생활 속에서 실천해 봐요! 😊"
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
            "말차례를 지켜 대화할 수 있나요?",
            "자신을 소개하는 글을 쓸 수 있나요?",
            "더 노력하고 싶은 점은 무엇인가요?"
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
          "title": "단원을 돌아보며 확인하기",
          "levels": {
            "읽기": {
              "q": "'말차례를 지켜 대화합니다.'가 바른 문장인지 읽고 판단해 볼까요?",
              "a": "네, 바른 문장"
            },
            "쓰기": {
              "q": "이 단원에서 배운 것 한 가지를 문장으로 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "가장 기억에 남는 것을 짝에게 말해 봐요.",
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
          "body": "짝과 번갈아 이 단원에서 배운 것을 하나씩 말하며 정리해요.",
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
              "q": "대화할 때 지킬 것은?",
              "a": "말차례"
            },
            {
              "q": "소개 글에 담는 것은?",
              "a": "이름·좋아하는 것 등"
            },
            {
              "q": "들을 때 바른 자세는?",
              "a": "끝까지 잘 들어요"
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
            "말차례·소개하는 법을 정리했어요",
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
          "body": "다음 시간에는 바른 문장 쓰기를 연습하고 글씨를 바르게 쓰며 단원을 마무리할 거예요!"
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
        "title": "실천으로",
        "content": "정리에 그치지 말고 생활 속 말차례·소개 실천으로 이어지게 하세요.",
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
        "content": "\"대화·소개 중 무엇이 가장 좋았나요?\" 단원 경험을 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_back13",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 대화",
        "content": "집·학교에서 말차례를 지킨 경험을 떠올리게 해요.",
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
        "content": "말차례 대화와 소개하기를 함께 정리하게 하세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_forget13",
        "type": "misconception",
        "icon": "❓",
        "title": "듣기도 함께",
        "content": "말차례는 말하기뿐 아니라 잘 듣기를 포함함을 다시 짚어 주세요.",
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
              "text": "👂 말차례"
            },
            "b": {
              "text": "한 사람씩·잘 듣기"
            }
          },
          {
            "a": {
              "text": "🙋 소개"
            },
            "b": {
              "text": "이름·좋아하는 것"
            }
          },
          {
            "a": {
              "text": "💗 좋은 소개"
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
        "content": "\"더 노력하고 싶은 한 가지를 정해 볼까요?\" 실천을 이어요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect13",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 한 일",
        "content": "\"무엇을 정리했죠?\" 말차례·소개를 짚어요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_basic13",
        "type": "extension",
        "icon": "⬆",
        "title": "기초 다지기 예고",
        "content": "\"다음엔 바른 문장 쓰기와 글씨 쓰기를 해요.\" 다음 차시 예고.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  window.LESSONS["u1_l14"] =
  {
    "meta": {
      "grade": 2,
      "subject": "국어",
      "unit": 1,
      "n": 14,
      "title": "마무리하기 ② — 기초 다지기",
      "std": "[2국03-02]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 바른 문장 알기 → 문장 부호 살피기 → 바른 문장 고르기 → 글씨 쓰기·단원 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "마무리하기 ② — 기초 다지기",
          "subtitle": "1단원 · 14/14차시 · 마무리"
        },
        "suggested_extras": [
          "q_sentence",
          "t_sentence"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "바른 문장이 무엇인지 알아봐요",
            "문장 부호를 알맞게 써요",
            "배운 낱말을 바르게 써요"
          ]
        },
        "suggested_extras": [
          "t_sentence"
        ]
      },
      {
        "id": "s03",
        "stage": "만나기",
        "block": "motivate",
        "data": {
          "scene_title": "문장을 바르게 써요 ✍️",
          "visual": "📝",
          "question": "\"저는 책을 좋아합니다\"처럼 문장에는 끝맺는 약속이 있어요.<br>문장은 어떻게 끝맺을까요?",
          "img": "assets/photo/korean/g2_basics1.jpg"
        },
        "suggested_extras": [
          "q_mark",
          "r_sentence"
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
              "q": "대화할 때 지킬 것은?",
              "a": "말차례"
            },
            {
              "q": "소개 글에 담는 것은?",
              "a": "이름·좋아하는 것 등"
            }
          ],
          "from": "u1_l13"
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
          "title": "바른 문장과 문장 부호",
          "content": "문장은 **\"무엇이 + 어찌하다\"**로 이루어지고, 끝에 **문장 부호**를 붙여요. 알리는 문장엔 마침표(.), 묻는 문장엔 물음표(?), 느낌을 담으면 느낌표(!)를 써요!",
          "symbol_meanings": [
            {
              "symbol": "마침표 (.)",
              "meaning": "알리는 문장 끝에"
            },
            {
              "symbol": "물음표 (?)",
              "meaning": "묻는 문장 끝에"
            },
            {
              "symbol": "느낌표 (!)",
              "meaning": "느낌을 담은 문장에"
            },
            {
              "symbol": "띄어 쓰기",
              "meaning": "낱말마다 띄어 써요"
            }
          ]
        },
        "suggested_extras": [
          "t_mark",
          "x_nomark"
        ],
        "tnote": {
          "ask": [
            "문장은 어떻게 끝맺을까?"
          ],
          "watch": "문장 부호로 바른 문장 마무리",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "알맞은 문장 부호는? ✅",
          "sub": "문장에 알맞은 부호를 골라 봐요. 카드를 누르면 답이 나와요!",
          "cards": [
            {
              "clue": "\"제 이름은 ○○○입니다( )\"",
              "emoji": "📌",
              "name": "마침표 ( . ) — 알리는 문장"
            },
            {
              "clue": "\"네 이름은 무엇이니( )\"",
              "emoji": "❓",
              "name": "물음표 ( ? ) — 묻는 문장"
            },
            {
              "clue": "\"만나서 정말 반가워( )\"",
              "emoji": "❗",
              "name": "느낌표 ( ! ) — 느낌을 담은 문장"
            }
          ],
          "outro": "문장 부호를 알맞게 쓰면 뜻이 잘 전해져요. 이제 글씨도 써 볼까요? 😊"
        },
        "suggested_extras": [
          "q_use",
          "g_mark"
        ]
      },
      {
        "id": "s06",
        "stage": "활동",
        "block": "concept",
        "data": {
          "title": "글씨를 바르게 써요 ✍️",
          "content": "단원에서 배운 낱말을 **또박또박** 써 봐요. 네모 칸에 맞춰 **소개 · 말차례 · 친구**를 바르게 써 보세요!",
          "symbol_meanings": [
            {
              "symbol": "소개",
              "meaning": "또박또박 칸에 맞춰"
            },
            {
              "symbol": "말차례",
              "meaning": "바른 자세로"
            },
            {
              "symbol": "친구",
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
          "title": "바른 문장과 문장 부호",
          "levels": {
            "읽기": {
              "q": "'저는 책을 좋아합니다' 끝에는 어떤 부호가 어울릴까요?",
              "a": "마침표(.)"
            },
            "쓰기": {
              "q": "'너도 책을 좋아하니' 끝에 알맞은 부호를 넣어 써 볼까요?",
              "a": "물음표(?)"
            },
            "말하기": {
              "q": "느낌을 담은 짧은 문장을 만들어 말해 봐요.",
              "a": "여러 답 (예: 정말 재미있어!)",
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
          "title": "문장 부호 짝 놀이",
          "type": "pair",
          "goal": "문장에 알맞은 부호를 넣어요",
          "body": "짝이 문장을 말하면 다른 짝이 어울리는 부호(마침표·물음표·느낌표)를 말해 줘요.",
          "materials": [
            "부호 카드"
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
              "q": "알리는 문장 끝에는?",
              "a": "마침표(.)"
            },
            {
              "q": "묻는 문장 끝에는?",
              "a": "물음표(?)"
            },
            {
              "q": "느낌 문장 끝에는?",
              "a": "느낌표(!)"
            }
          ],
          "self": [
            "문장을 바르게 끝맺을 수 있어요",
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
          "title": "1단원에서 배운 것",
          "points": [
            "말차례를 지켜 대화했어요",
            "자신과 주변 사람을 소개했어요",
            "바른 문장과 글씨를 익혔어요"
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
          "preview": "잘 듣고 잘 말하기!",
          "body": "1단원을 모두 마쳤어요. 앞으로도 말차례를 지켜 대화하고, 까닭을 담아 소개해 봐요. 정말 수고했어요!"
        },
        "suggested_extras": [
          "e_end"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_sentence",
        "type": "fun_question",
        "icon": "💡",
        "title": "문장 끝",
        "content": "\"문장은 어떻게 끝맺을까요?\" 문장 부호에 관심을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_sentence",
        "type": "tip",
        "icon": "🧩",
        "title": "문장의 짜임",
        "content": "\"무엇이+어찌하다\" 짜임과 끝맺는 부호를 함께 익히게 하세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_mark",
        "type": "fun_question",
        "icon": "📝",
        "title": "어떤 부호?",
        "content": "\"묻는 문장 끝에는 어떤 부호를 쓸까요?\" 부호를 떠올려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_sentence",
        "type": "real_world",
        "icon": "🌍",
        "title": "책 속 문장",
        "content": "책에서 마침표·물음표·느낌표를 찾아보게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_mark",
        "type": "tip",
        "icon": "🧩",
        "title": "부호의 뜻",
        "content": "부호마다 문장의 성격(알림·물음·느낌)이 다름을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_nomark",
        "type": "misconception",
        "icon": "❓",
        "title": "부호 빠뜨리기",
        "content": "문장 끝에 부호를 빠뜨리지 않도록 살피게 하세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_use",
        "type": "fun_question",
        "icon": "💡",
        "title": "어떤 부호?",
        "content": "\"이 문장에는 어떤 부호가 어울릴까요?\" 부호를 골라요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_mark",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "문장 ↔ 부호 짝짓기",
        "description": "문장과 알맞은 부호를 짝지어 보세요.",
        "hint": "문장의 성격을 떠올려요.",
        "pairs": [
          {
            "a": {
              "text": "📌 알리는 문장"
            },
            "b": {
              "text": "마침표 (.)"
            }
          },
          {
            "a": {
              "text": "❓ 묻는 문장"
            },
            "b": {
              "text": "물음표 (?)"
            }
          },
          {
            "a": {
              "text": "❗ 느낌 문장"
            },
            "b": {
              "text": "느낌표 (!)"
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
        "title": "문장 만들기",
        "content": "\"배운 낱말로 짧은 문장을 만들어 부호까지 써 볼까요?\" 쓰기를 확장해요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect14",
        "type": "fun_question",
        "icon": "💡",
        "title": "단원 마무리",
        "content": "\"1단원에서 가장 좋았던 것을 한 가지 말해 볼까요?\" 단원을 갈무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_end",
        "type": "extension",
        "icon": "⬆",
        "title": "실천하기",
        "content": "\"오늘 집에 가서 가족과 말차례를 지켜 대화해 볼까요?\" 실천으로 이어요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

})();
