/* ============================================================
   1학년 1학기 국어 — 3단원 「낱말과 친해져요」 (케이티처)
   양산 영역 — LESSONS["u3_l{NN}"] 누적 / 다른 단원·과목 .js = read-only
   g1_korean.html이 자동 로드 후 LESSONS 에 누적.
   ------------------------------------------------------------
   ★ 케이티처 = 교사 주도 수업 도구. 로깅 없음(수업 진행용).
   ★ 트랙 = 한글 해득. 1단원 [자음+모음] 결합, 2단원 [+받침] 읽기에 이어
     3단원은 ① 받침 있는 글자 직접 쓰기(소단원1, 쓰기) +
     ② 된소리 자음자 ㄲㄸㅃㅆㅉ 읽기(소단원2, 문법·읽기)로 확장.
     소단원 1·2 모두 문자(한글) 트랙 — 2단원과 달리 듣말 트랙 없음.
   ★ 저작권: 교과서·지도서 본문·그림·삽화 미게재. 작품 「다리」·「구름 놀이」는
     본문·작가·제목 미게재, 받침 낱말·활동 의도만 차용(read_aloud 책 비특정).
     예시 낱말(수박·청포도·연필·꿀·빵·쌀·딸기 등)은 보편/교과 어휘 자체 구성.
   ------------------------------------------------------------
   차시 구성(13차시):
   l01 단원 도입(받침 빠진 글자) — 준비
   l02 글자의 짜임으로 받침 글자 만들기 · l03 받침 있는 낱말 완성 — 소단원1(쓰기)
   l04 받침을 넣어 낱말 만들기 · l05 받침 글자 바르게 고쳐 쓰기 — 소단원1(쓰기)
   l06 여러 가지 자음자 모양 알기 · l07 자음자 소리의 차이 알기 — 소단원2(문법)
   l08 이야기 읽고 내용 알기 · l09 자신 있게 낱말 읽기 — 소단원2(읽기)
   l10 주제 낱말 찾기 놀이 · l11 낱자가 바뀌면 뜻이 바뀌어요 — 실천
   l12 단원 정리 · l13 기초 다지기와 자기 평가 — 마무리
   ============================================================ */

/* ===== l01 단원 도입 — 받침을 빼면 뜻이 안 통해요 ===== */
LESSONS["u3_l01"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 1,
    "title": "배울 내용을 살펴봐요",
    "std": "[2국03-01] · [2국02-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 받침 빠진 쪽지 → 받침을 빼면 뜻이 달라짐 → 쪽지 고치기 → 단원 두 갈래 안내 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "배울 내용을 살펴봐요",
        "subtitle": "3단원 · 1/13차시 · 단원 도입"
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
          "이 단원에서 무엇을 배울지 살펴봐요",
          "받침을 빼고 쓰면 어떻게 되는지 알아봐요",
          "받침을 넣어 낱말을 바르게 고쳐 봐요"
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
        "scene_title": "이상한 쪽지가 왔어요 💌",
        "visual": "💌",
        "question": "아기 곰이 쪽지에 ‘수바를 좋아해’라고 썼어요.<br>‘수바’가 무슨 낱말일까요?",
        "img": "assets/photo/korean/word_intro.jpg"
      },
      "suggested_extras": [
        "q_note",
        "r_life"
      ]
    },
    {
      "id": "s04",
      "stage": "만나기",
      "block": "concept",
      "data": {
        "title": "받침을 빼면 뜻이 안 통해요",
        "content": "받침을 빼고 쓰면 무슨 낱말인지 알 수 없어요. 받침까지 **정확하게 써야** 내 마음이 친구에게 잘 전해져요!",
        "symbol_meanings": [
          {
            "symbol": "수바 → 수박",
            "meaning": "받침 ㄱ을 넣어야 여름 과일 수박!"
          },
          {
            "symbol": "처포도 → 청포도",
            "meaning": "받침 ㅇ을 넣어야 초록 포도!"
          },
          {
            "symbol": "바다 (받침 없음)",
            "meaning": "받침이 없어도 되는 낱말도 있어요"
          },
          {
            "symbol": "받침 글자 쓰기",
            "meaning": "이 단원에서 배울 첫 번째 갈래예요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_skip"
      ],
      "tnote": {
        "ask": [
          "받침을 빼고 쓰면 무엇이 불편할까?"
        ],
        "watch": "받침의 필요성 인식 열기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "쪽지 속 낱말 바르게 고치기 ✏️",
        "sub": "아기 곰이 받침을 빼고 쓴 낱말이에요. 받침을 넣어 바르게 고쳐요. 카드를 누르면 답이 나와요!",
        "cards": [
          {
            "clue": "‘수바’라고 썼어요<br>받침 ㄱ을 넣으면? 여름 과일!",
            "emoji": "🍉",
            "name": "수박"
          },
          {
            "clue": "‘처포도’라고 썼어요<br>받침 ㅇ을 넣으면? 초록 포도!",
            "emoji": "🍇",
            "name": "청포도"
          },
          {
            "clue": "‘여피’라고 썼어요<br>받침 ㄴ·ㄹ을 넣으면? 글씨를 써요!",
            "emoji": "✏️",
            "name": "연필"
          }
        ],
        "outro": "받침을 넣으니 무슨 낱말인지 또렷해졌죠? 받침까지 바르게 써야 해요! 😊"
      },
      "suggested_extras": [
        "q_fix",
        "g_pair"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "이 단원에서 배울 것을 말해요",
        "question": "이 단원에서는 두 가지를 배워요. 무엇이 궁금한지 이야기해 봐요.",
        "items": [
          "받침이 있는 글자를 직접 써 봐요",
          "ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 같은 여러 자음자 낱말을 읽어요",
          "받침을 빼고 써서 곤란했던 적이 있나요?"
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
        "title": "받침을 넣어야 뜻이 통해요",
        "levels": {
          "읽기": {
            "q": "받침을 바르게 넣은 낱말 '수박·청포도'를 읽어 볼까요?",
            "a": "수박·청포도"
          },
          "쓰기": {
            "q": "'수바'에 받침 ㄱ을 넣어 '수박'을 바르게 써 볼까요?",
            "a": "수박",
            "steps": [
              "바＋ㄱ＝박 → 수박"
            ]
          },
          "말하기": {
            "q": "받침을 빼고 쓰면 왜 불편한지 말해 봐요.",
            "a": "여러 답 (예: 무슨 낱말인지 몰라요)",
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
        "title": "받침 넣어 고치기 짝 놀이",
        "type": "pair",
        "goal": "받침을 빼고 쓴 낱말을 바르게 고쳐요",
        "body": "한 사람이 받침을 빼고 쓴 낱말을 말하면 짝이 받침을 넣어 바른 낱말로 고쳐 읽어요.",
        "materials": [
          "낱말 카드"
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
            "q": "받침을 빼고 쓰면 어떻게 될까요?",
            "a": "뜻이 안 통해요"
          },
          {
            "q": "'수바'에 받침 ㄱ을 넣으면?",
            "a": "수박"
          },
          {
            "q": "받침은 왜 바르게 써야 할까요?",
            "a": "내 마음이 잘 전해져요"
          }
        ],
        "self": [
          "받침의 중요함을 알아요",
          "조금 궁금해요",
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
          "받침을 빼고 쓰면 뜻이 잘 안 통해요",
          "받침을 넣어 낱말을 바르게 고쳤어요",
          "받침 글자 쓰기와 여러 낱말 읽기를 배울 거예요"
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
        "preview": "글자의 짜임을 생각하며 받침 글자를 만들어요",
        "body": "다음 시간에는 자음자·모음자 카드를 모아 ‘달·양·북’처럼 받침이 있는 글자를 직접 만들어 볼 거예요!"
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
      "title": "받침 빼고 말해 보기",
      "content": "“선생님이 ‘책’을 ‘채’라고 하면 어때요?” 받침을 뺀 말을 들려주며 이상한 점을 느끼게 해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_goal",
      "type": "tip",
      "icon": "🧩",
      "title": "두 갈래 미리 보기",
      "content": "이 단원은 ‘받침 글자 쓰기’와 ‘여러 자음자 낱말 읽기’ 두 갈래예요. 도입에서 가볍게 둘 다 짚어 주세요.",
      "fit_slides": [
        "objective",
        "cover"
      ]
    },
    {
      "id": "q_note",
      "type": "fun_question",
      "icon": "💌",
      "title": "무슨 낱말일까",
      "content": "“‘수바’가 뭘까요? 받침을 어디에 넣으면 좋을까요?” 물으며 받침 자리를 찾게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_life",
      "type": "real_world",
      "icon": "🌍",
      "title": "쪽지와 알림장",
      "content": "알림장·쪽지에서 받침을 빼고 쓰면 가족이 못 알아봐요. 정확히 쓰는 일이 마음을 전하는 길임을 이어 주세요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "비교로 보여 주기",
      "content": "‘수바 ↔ 수박’처럼 틀린 글자와 바른 글자를 나란히 칠판에 쓰면 받침의 역할이 한눈에 보여요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_skip",
      "type": "misconception",
      "icon": "❓",
      "title": "받침을 빼먹는 아이",
      "content": "소리 나는 대로 받침을 빼고 쓰는 아이가 많아요. 틀렸다고 꾸짖기보다 받침을 넣으면 뜻이 살아남을 보여 주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_fix",
      "type": "fun_question",
      "icon": "💡",
      "title": "받침 탐정",
      "content": "“빠진 받침을 찾는 받침 탐정이 되어 볼까요?” 놀이처럼 말하면 고치기 활동이 즐거워져요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_pair",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "틀린 글자 ↔ 바른 낱말",
      "description": "받침이 빠진 글자와 바르게 쓴 낱말을 짝지어 보세요.",
      "hint": "빠진 받침이 무엇인지 생각하며 짝을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "수바"
          },
          "b": {
            "text": "🍉 수박"
          }
        },
        {
          "a": {
            "text": "처포도"
          },
          "b": {
            "text": "🍇 청포도"
          }
        },
        {
          "a": {
            "text": "여피"
          },
          "b": {
            "text": "✏️ 연필"
          }
        },
        {
          "a": {
            "text": "채"
          },
          "b": {
            "text": "📚 책"
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
      "title": "경험 나누기",
      "content": "받침 때문에 곤란했던 경험은 짧게 한 문장으로 말하게 하면 모두가 참여할 수 있어요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_goal",
      "type": "extension",
      "icon": "⬆",
      "title": "나의 단원 목표",
      "content": "‘받침을 빼먹지 않고 쓰겠다’처럼 단원 목표를 한 문장으로 적어 두면 마무리 차시에서 다시 볼 수 있어요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘 고친 낱말",
      "content": "“오늘 받침을 넣어 고친 낱말이 무엇이었죠?(수박·청포도·연필)” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "자모 카드 준비",
      "content": "다음 시간에 쓸 자음자·모음자 카드를 미리 보여 주며 ‘이걸로 글자를 만든다’고 예고하면 기대가 생겨요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l02"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 2,
    "title": "글자의 짜임으로 받침 글자를 만들어요",
    "std": "[2국04-01] · [2국03-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 자모 카드 바구니 → 자음+모음+받침 짜임 → 자모 모아 글자 만들기 → 새 글자 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "글자의 짜임으로 받침 글자를 만들어요",
        "subtitle": "3단원 · 2/13차시 · 받침 글자 쓰기"
      },
      "suggested_extras": [
        "q_open",
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
          "글자의 짜임을 다시 떠올려요",
          "자음자·모음자를 모아 받침 글자를 만들어요",
          "만든 글자를 또박또박 소리 내어 읽어요"
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
        "scene_title": "자모 카드 바구니 🧺",
        "visual": "🧺",
        "question": "바구니에 ㄷ·ㅏ·ㄹ·ㅇ·ㅑ·ㅂ·ㅜ·ㄱ 카드가 들어 있어요.<br>이 카드를 모으면 어떤 글자를 만들 수 있을까요?",
        "img": "assets/photo/korean/word_structure.jpg"
      },
      "suggested_extras": [
        "q_basket",
        "r_card"
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
            "q": "받침을 빼고 쓰면?",
            "a": "뜻이 안 통해요"
          },
          {
            "q": "'수바'에 ㄱ을 넣으면?",
            "a": "수박"
          }
        ],
        "from": "u3_l01"
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
        "title": "자음자 + 모음자 + 받침",
        "content": "받침이 있는 글자는 **자음자 + 모음자** 아래에 **받침**을 더해 만들어요. 글자마다 받침이 오는 자리가 정해져 있어요!",
        "symbol_meanings": [
          {
            "symbol": "ㄷ + ㅏ + ㄹ = 달",
            "meaning": "옆으로 붙이고 아래에 받침 ㄹ"
          },
          {
            "symbol": "ㅇ + ㅑ + ㅇ = 양",
            "meaning": "옆으로 붙이고 아래에 받침 ㅇ"
          },
          {
            "symbol": "ㅂ + ㅜ + ㄱ = 북",
            "meaning": "위아래로 쌓고 아래에 받침 ㄱ"
          },
          {
            "symbol": "받침 자리",
            "meaning": "받침은 언제나 글자의 아래쪽!"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_place"
      ],
      "tnote": {
        "ask": [
          "받침은 글자의 어느 자리에 들어갈까?"
        ],
        "watch": "자음자＋모음자＋받침 짜임",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "chosung_quiz",
      "data": {
        "title": "자모를 모으면 무슨 글자? 🧩",
        "sub": "자음자·모음자·받침을 보고 무슨 글자가 될지 생각해요. [정답 보기]를 누르면 답이 나와요",
        "items": [
          {
            "chosung": "ㄷ ㅏ ㄹ",
            "answer": "달",
            "emoji": "🌙",
            "hint": "밤하늘에 떠 있어요! 받침은 ㄹ"
          },
          {
            "chosung": "ㅇ ㅑ ㅇ",
            "answer": "양",
            "emoji": "🐑",
            "hint": "털이 복슬복슬한 동물! 받침은 ㅇ"
          },
          {
            "chosung": "ㅂ ㅜ ㄱ",
            "answer": "북",
            "emoji": "🥁",
            "hint": "둥둥 두드리는 악기! 받침은 ㄱ"
          },
          {
            "chosung": "ㄴ ㅜ ㄴ",
            "answer": "눈",
            "emoji": "❄️",
            "hint": "겨울에 하얗게 내려요! 받침은 ㄴ"
          }
        ]
      },
      "suggested_extras": [
        "q_split",
        "g_make"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "자모 카드로 새 글자를 만들어요",
        "question": "바구니 속 카드로 또 어떤 받침 글자를 만들 수 있을까요?",
        "items": [
          "ㄱ·ㅏ·ㅇ을 모으면? (강)",
          "ㅂ·ㅏ·ㄹ을 모으면? (발)",
          "내가 만든 글자를 또박또박 읽어 봐요"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_make"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "짜임으로 받침 글자 만들기",
        "levels": {
          "읽기": {
            "q": "받침 글자 '달·양'을 짜임을 생각하며 읽어 볼까요?",
            "a": "달·양"
          },
          "쓰기": {
            "q": "'다' 아래에 ㄹ을 더해 '달'을 써 볼까요?",
            "a": "달",
            "steps": [
              "다＋ㄹ＝달"
            ]
          },
          "말하기": {
            "q": "받침이 오는 자리가 어디인지 말해 봐요.",
            "a": "자음자·모음자 아래",
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
        "title": "자모＋받침 모으기 짝 활동",
        "type": "pair",
        "goal": "자음자·모음자·받침을 모아 글자를 만들어요",
        "body": "짝과 자음자·모음자·받침 카드를 골라 아래위로 모아 받침 글자를 만들고 읽어요.",
        "materials": [
          "자모 카드",
          "받침 카드"
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
            "q": "다＋ㄹ은 무슨 글자일까요?",
            "a": "달"
          },
          {
            "q": "받침은 글자 어디에 올까요?",
            "a": "아래쪽"
          },
          {
            "q": "'양'의 받침은 무엇일까요?",
            "a": "ㅇ"
          }
        ],
        "self": [
          "짜임으로 받침 글자를 만들어요",
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
          "받침 글자는 자음자+모음자+받침으로 만들어요",
          "받침은 언제나 글자의 아래쪽에 와요",
          "달·양·북처럼 받침 글자를 직접 만들었어요"
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
        "preview": "받침이 있는 글자로 낱말을 완성해요",
        "body": "다음 시간에는 받침 글자를 넣어 ‘동물·축구공’처럼 긴 낱말을 완성해 볼 거예요!"
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
      "title": "짜임 떠올리기",
      "content": "“‘산’은 어떤 세 조각으로 나뉘죠?(ㅅ·ㅏ·ㄴ)” 2단원에서 배운 짜임을 가볍게 떠올리며 시작해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_order",
      "type": "tip",
      "icon": "🧩",
      "title": "만들기 → 읽기",
      "content": "글자를 만든 다음에는 꼭 소리 내어 읽게 하세요. 손으로 만들고 입으로 확인해야 글자-소리가 이어져요.",
      "fit_slides": [
        "objective",
        "chosung_quiz"
      ]
    },
    {
      "id": "q_basket",
      "type": "fun_question",
      "icon": "🧺",
      "title": "카드 고르기",
      "content": "“바구니에서 카드 세 장을 골라 글자를 만든다면 무엇을 고를래요?” 물으며 조합에 흥미를 끌어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_card",
      "type": "real_world",
      "icon": "🌍",
      "title": "실물 자모 카드",
      "content": "종이 자모 카드를 칠판에 붙였다 떼며 받침을 더하면 짜임이 눈에 보여 이해가 빨라져요.",
      "fit_slides": [
        "motivate",
        "chosung_quiz"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "두 가지 짜임",
      "content": "‘달’처럼 옆으로 붙는 글자와 ‘북’처럼 위아래로 쌓는 글자를 나란히 보여 주면 받침 자리가 또렷해져요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "x_place",
      "type": "misconception",
      "icon": "❓",
      "title": "받침을 옆에 쓰기",
      "content": "받침을 글자 옆에 쓰려는 아이가 있어요. 받침은 모음자 아래에 온다는 점을 글자 모양으로 짚어 주세요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "q_split",
      "type": "fun_question",
      "icon": "💡",
      "title": "거꾸로 나누기",
      "content": "“‘북’을 다시 세 조각으로 나누면?(ㅂ·ㅜ·ㄱ)” 만들기와 나누기를 오가면 짜임이 단단해져요.",
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "g_make",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "자모 ↔ 글자 짝짓기",
      "description": "자모 묶음과 완성된 글자를 짝지어 보세요.",
      "hint": "자음자·모음자·받침을 차례로 모아 읽어요.",
      "pairs": [
        {
          "a": {
            "text": "ㄷ·ㅏ·ㄹ"
          },
          "b": {
            "text": "🌙 달"
          }
        },
        {
          "a": {
            "text": "ㅇ·ㅑ·ㅇ"
          },
          "b": {
            "text": "🐑 양"
          }
        },
        {
          "a": {
            "text": "ㅂ·ㅜ·ㄱ"
          },
          "b": {
            "text": "🥁 북"
          }
        },
        {
          "a": {
            "text": "ㄴ·ㅜ·ㄴ"
          },
          "b": {
            "text": "❄️ 눈"
          }
        }
      ],
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "받침만 바꿔 보기",
      "content": "‘가’에 ㅇ·ㅁ·ㄴ을 차례로 더하면 강·감·간! 받침만 바꾸는 놀이로 발표를 이어 주세요.",
      "fit_slides": [
        "question",
        "chosung_quiz"
      ]
    },
    {
      "id": "e_make",
      "type": "extension",
      "icon": "⬆",
      "title": "내 이름 글자 짜임",
      "content": "익숙해진 아이에겐 자기 이름 글자를 자모로 나누고 받침이 있는 글자를 찾게 하면 한 단계 나아가요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘 만든 글자",
      "content": "“오늘 자모 카드로 만든 글자가 무엇이었죠?(달·양·북·눈)” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "긴 낱말 예고",
      "content": "“받침 글자가 두 개 들어간 낱말도 있을까요?” 물으며 다음 시간 낱말 완성하기를 예고해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l03"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 3,
    "title": "받침이 있는 글자로 낱말을 완성해요",
    "std": "[2국03-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 글자 빠진 낱말 → 낱말 속 받침 글자 → 받침 낱말 맞히기 → 내가 찾은 낱말 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "받침이 있는 글자로 낱말을 완성해요",
        "subtitle": "3단원 · 3/13차시 · 받침 글자 쓰기"
      },
      "suggested_extras": [
        "q_open",
        "t_word"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "받침 글자가 들어간 낱말을 살펴봐요",
          "받침 글자를 넣어 낱말을 완성해요",
          "완성한 낱말을 또박또박 읽고 써 봐요"
        ]
      },
      "suggested_extras": [
        "t_word"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "글자가 한 칸 비었어요 🕳️",
        "visual": "🧩",
        "question": "‘동◯’의 빈칸에 ‘물’을 넣으면 ‘동물’이 돼요.<br>받침 글자 하나가 낱말을 완성하네요!",
        "img": "assets/photo/korean/word_complete.jpg"
      },
      "suggested_extras": [
        "q_blank",
        "r_walk"
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
            "q": "다＋ㄹ은 무슨 글자?",
            "a": "달"
          },
          {
            "q": "받침은 글자 어디에?",
            "a": "아래쪽"
          }
        ],
        "from": "u3_l02"
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
        "title": "낱말 속 받침 글자",
        "content": "우리가 쓰는 낱말 속에는 받침 글자가 들어 있어요. 받침 글자를 **바르게 써야** 낱말이 완성돼요!",
        "symbol_meanings": [
          {
            "symbol": "동 + 물 = 동물",
            "meaning": "물에 받침 ㄹ이 있어요"
          },
          {
            "symbol": "축구 + 공 = 축구공",
            "meaning": "공에 받침 ㅇ이 있어요"
          },
          {
            "symbol": "고무 + 줄 = 고무줄",
            "meaning": "줄에 받침 ㄹ이 있어요"
          },
          {
            "symbol": "돌 + 다리 = 돌다리",
            "meaning": "돌에 받침 ㄹ이 있어요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_one"
      ],
      "tnote": {
        "ask": [
          "낱말 속 어느 글자에 받침이 숨어 있을까?"
        ],
        "watch": "낱말 속 받침 글자 찾기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "받침 낱말 맞히기 🎴",
        "sub": "받침 글자가 들어간 낱말이에요. 어떤 글자에 받침이 있는지 함께 살펴봐요!",
        "cards": [
          {
            "clue": "꼬리가 길고 도토리를 좋아해요<br>받침 ㅁ이 들어 있어요",
            "emoji": "🐿️",
            "name": "다람쥐"
          },
          {
            "clue": "개울을 건너게 돌을 놓았어요<br>받침 ㄹ이 들어 있어요",
            "emoji": "🪨",
            "name": "돌다리"
          },
          {
            "clue": "산에서 흐르는 작은 물길<br>받침 ㄹ이 들어 있어요",
            "emoji": "💧",
            "name": "개울"
          },
          {
            "clue": "발로 차며 노는 동그란 것<br>받침 ㄱ과 ㅇ이 들어 있어요",
            "emoji": "⚽",
            "name": "축구공"
          }
        ],
        "outro": "다람쥐·돌다리·개울·축구공! 받침 글자가 낱말 곳곳에 숨어 있죠? 😊"
      },
      "suggested_extras": [
        "q_where",
        "g_word"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "받침 낱말 발표하기 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 받침 글자가 들어간 낱말을 하나 말하고, 받침이 어느 글자에 있는지 알려 줘요!",
        "count": 24,
        "hint": "“‘건널목’의 ‘널’과 ‘목’에 받침이 있어요” 처럼 말해 봐요",
        "end_msg": "받침 낱말을 많이 찾았어요. 모두 멋져요! 👏"
      },
      "suggested_extras": [
        "t_present",
        "e_collect"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "받침 글자로 낱말 완성하기",
        "levels": {
          "읽기": {
            "q": "받침이 들어간 낱말 '동물·축구공'을 읽어 볼까요?",
            "a": "동물·축구공"
          },
          "쓰기": {
            "q": "'무' 아래에 ㄹ을 넣어 '물'을 써 볼까요?",
            "a": "물",
            "steps": [
              "무＋ㄹ＝물"
            ]
          },
          "말하기": {
            "q": "받침이 들어간 낱말을 하나 말해 봐요.",
            "a": "여러 답 (예: 동물, 다리)",
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
        "title": "받침 낱말 찾기 짝 놀이",
        "type": "pair",
        "goal": "낱말 속 받침 글자를 찾아요",
        "body": "짝과 낱말 카드를 보고 어떤 글자에 받침이 있는지 번갈아 손가락으로 짚어요.",
        "materials": [
          "낱말 카드"
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
            "q": "무＋ㄹ은 무슨 글자일까요?",
            "a": "물"
          },
          {
            "q": "'동물'에서 받침이 있는 글자는?",
            "a": "동·물"
          },
          {
            "q": "받침 글자를 바르게 써야 무엇이 완성될까요?",
            "a": "낱말"
          }
        ],
        "self": [
          "받침 낱말을 완성할 수 있어요",
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
          "낱말 속에 받침 글자가 들어 있음을 알았어요",
          "받침 글자를 넣어 낱말을 완성했어요",
          "다람쥐·돌다리처럼 받침 낱말을 읽고 썼어요"
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
        "preview": "받침을 넣어 낱말을 만들어요",
        "body": "다음 시간에는 ‘구르 → 구름’처럼 빠진 받침을 직접 넣어서 낱말을 만들어 볼 거예요!"
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
      "title": "받침 글자 세기",
      "content": "“‘건널목’에는 받침 글자가 몇 개일까요?(널·목, 두 개)” 물으며 낱말 속 받침에 눈을 돌리게 해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_word",
      "type": "tip",
      "icon": "🧩",
      "title": "글자에서 낱말로",
      "content": "이번 차시부터 글자 하나가 아니라 낱말 전체를 봐요. 받침 글자가 ‘어느 글자에’ 있는지 짚는 게 핵심이에요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_blank",
      "type": "fun_question",
      "icon": "🕳️",
      "title": "빈칸에 무엇이",
      "content": "“‘동◯’의 빈칸에 다른 글자를 넣으면 무엇이 될까요?(동산·동생)” 빈칸 채우기로 호기심을 끌어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_walk",
      "type": "real_world",
      "icon": "🌍",
      "title": "길에서 본 받침 낱말",
      "content": "등굣길 간판·표지판에도 받침 낱말이 가득해요. 건널목·문구점처럼 본 것을 떠올리게 해 주세요.",
      "fit_slides": [
        "motivate",
        "present"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "받침 글자에 동그라미",
      "content": "낱말을 칠판에 쓰고 받침이 있는 글자에 동그라미를 치게 하면 받침 위치가 한눈에 들어와요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_one",
      "type": "misconception",
      "icon": "❓",
      "title": "받침은 한 낱말에 하나?",
      "content": "받침이 한 낱말에 하나만 있다고 여기는 아이가 있어요. ‘건널목’처럼 여러 글자에 받침이 올 수 있음을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_where",
      "type": "fun_question",
      "icon": "💡",
      "title": "받침 어디 있나",
      "content": "“‘다람쥐’에서 받침이 있는 글자는 무엇이죠?(람)” 카드마다 받침 위치를 손가락으로 짚게 해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_word",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "낱말 ↔ 받침 글자",
      "description": "낱말과 받침이 들어 있는 글자를 짝지어 보세요.",
      "hint": "낱말을 소리 내어 읽으며 받침 글자를 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "🐿️ 다람쥐"
          },
          "b": {
            "text": "람"
          }
        },
        {
          "a": {
            "text": "🪨 돌다리"
          },
          "b": {
            "text": "돌"
          }
        },
        {
          "a": {
            "text": "💧 개울"
          },
          "b": {
            "text": "울"
          }
        },
        {
          "a": {
            "text": "⚽ 축구공"
          },
          "b": {
            "text": "공"
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
      "title": "낱말 + 받침 위치",
      "content": "발표는 ‘낱말 말하기 → 받침 글자 짚기’ 두 단계로 안내하면 모두 같은 틀로 말할 수 있어요.",
      "fit_slides": [
        "present",
        "card_quiz"
      ]
    },
    {
      "id": "e_collect",
      "type": "extension",
      "icon": "⬆",
      "title": "받침 낱말 수집",
      "content": "익숙해진 아이에겐 교실에서 받침 글자가 두 개 이상인 낱말을 찾아 적게 하면 한 단계 나아가요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "기억나는 낱말",
      "content": "“오늘 만난 받침 낱말 중 가장 기억나는 것은?” 물으며 배운 낱말을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "받침 넣기 예고",
      "content": "“‘구르’에 무엇을 넣으면 ‘구름’이 될까요?” 다음 시간 받침 넣기를 한 문제 미리 보여 줘요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l04"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 4,
    "title": "받침을 넣어 낱말을 만들어요",
    "std": "[2국03-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 받침 빠진 그림 낱말 → 받침을 넣으면 낱말 완성 → 받침 넣기 퀴즈 → 주변 받침 낱말 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "받침을 넣어 낱말을 만들어요",
        "subtitle": "3단원 · 4/13차시 · 받침 글자 쓰기"
      },
      "suggested_extras": [
        "q_open",
        "t_pic"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "그림을 보고 어떤 낱말인지 떠올려요",
          "빠진 받침을 찾아 낱말을 만들어요",
          "만든 낱말을 소리 내어 읽고 뜻을 확인해요"
        ]
      },
      "suggested_extras": [
        "t_pic"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "받침이 사라졌어요! ☁️",
        "visual": "☁️",
        "question": "하늘에 떠 있는 이것, ‘구르’라고 쓰면 이상해요.<br>무엇을 넣어야 ‘구름’이 될까요?",
        "img": "assets/photo/korean/word_batchim.jpg"
      },
      "suggested_extras": [
        "q_cloud",
        "r_pic"
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
            "q": "무＋ㄹ은 무슨 글자?",
            "a": "물"
          },
          {
            "q": "'동물'에서 받침 있는 글자는?",
            "a": "동·물"
          }
        ],
        "from": "u3_l03"
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
        "title": "받침을 넣으면 낱말이 완성돼요",
        "content": "그림을 보고 뜻을 떠올린 다음, **빠진 받침**을 넣으면 낱말이 완성돼요. 다 만들면 꼭 소리 내어 읽어 봐요!",
        "symbol_meanings": [
          {
            "symbol": "구르 + ㅁ = 구름",
            "meaning": "‘르’ 아래에 받침 ㅁ"
          },
          {
            "symbol": "채 + ㄱ = 책",
            "meaning": "‘채’ 아래에 받침 ㄱ"
          },
          {
            "symbol": "바라 + ㅁ = 바람",
            "meaning": "‘라’ 아래에 받침 ㅁ"
          },
          {
            "symbol": "무통 → 물통",
            "meaning": "‘무’에 받침 ㄹ을 넣어요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_sound"
      ],
      "tnote": {
        "ask": [
          "그림을 보면 어떤 받침이 빠졌는지 알 수 있을까?"
        ],
        "watch": "그림→소리→받침 추론",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "빠진 받침을 넣어요 🔧",
        "sub": "받침이 빠진 낱말이에요. 그림을 보고 빠진 받침을 찾아 낱말을 완성해요!",
        "cards": [
          {
            "clue": "‘구르’ + 받침 ㅁ<br>하늘에 둥둥 떠 있어요",
            "emoji": "☁️",
            "name": "구름"
          },
          {
            "clue": "‘채’ + 받침 ㄱ<br>글과 그림이 가득해요",
            "emoji": "📚",
            "name": "책"
          },
          {
            "clue": "‘무통’의 ‘무’ + 받침 ㄹ<br>물을 담아 가지고 다녀요",
            "emoji": "🧴",
            "name": "물통"
          },
          {
            "clue": "‘바라’ + 받침 ㅁ<br>나뭇잎을 흔들고 지나가요",
            "emoji": "🍃",
            "name": "바람"
          }
        ],
        "outro": "받침을 넣으니 낱말이 살아났어요! 그림 → 받침 → 소리 내어 읽기, 순서를 기억해요 😊"
      },
      "suggested_extras": [
        "q_step",
        "g_fill"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "우리 둘레의 받침 낱말을 찾아요",
        "question": "교실과 우리 둘레에서 받침이 들어간 낱말을 찾아 말해 봐요.",
        "items": [
          "교실에서 찾으면? (칠판·창문·책상)",
          "가방 속에서 찾으면? (연필·물통·색종이)",
          "찾은 낱말의 받침을 손가락으로 짚어 봐요"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_more"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "빠진 받침을 넣어 낱말 만들기",
        "levels": {
          "읽기": {
            "q": "완성한 낱말 '구름·책·바람'을 읽어 볼까요?",
            "a": "구름·책·바람"
          },
          "쓰기": {
            "q": "'채' 아래에 ㄱ을 넣어 '책'을 써 볼까요?",
            "a": "책",
            "steps": [
              "채＋ㄱ＝책"
            ]
          },
          "말하기": {
            "q": "그림을 보고 빠진 받침을 넣어 만든 낱말을 말해 봐요.",
            "a": "여러 답 (예: 르＋ㅁ＝름 → 구름)",
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
        "title": "빠진 받침 채우기 짝 놀이",
        "type": "pair",
        "goal": "그림을 보고 빠진 받침을 채워요",
        "body": "한 사람이 받침이 빠진 낱말과 그림을 보여 주면 짝이 알맞은 받침을 넣어 낱말을 완성해 읽어요.",
        "materials": [
          "그림 카드",
          "받침 카드"
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
            "q": "채＋ㄱ은 무슨 글자일까요?",
            "a": "책"
          },
          {
            "q": "'구르'에 ㅁ을 넣으면?",
            "a": "구름"
          },
          {
            "q": "낱말을 만든 뒤에는 어떻게 할까요?",
            "a": "소리 내어 읽어요"
          }
        ],
        "self": [
          "빠진 받침을 넣어 낱말을 만들어요",
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
          "그림을 보고 낱말의 뜻을 떠올렸어요",
          "빠진 받침을 넣어 낱말을 완성했어요",
          "구름·책·물통·바람을 또박또박 읽었어요"
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
        "preview": "받침이 있는 글자를 바르게 고쳐 써요",
        "body": "다음 시간에는 ‘우상’처럼 받침이 틀린 낱말을 찾아 ‘우산’으로 바르게 고쳐 쓸 거예요!"
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
      "title": "받침 넣기 맛보기",
      "content": "“‘소’에 ㅁ을 넣으면?(솜) ‘소’에 ㄴ을 넣으면?(손)” 한 글자 받침 넣기로 가볍게 시작해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_pic",
      "type": "tip",
      "icon": "🧩",
      "title": "그림이 먼저",
      "content": "그림으로 대상과 뜻을 먼저 파악한 다음 받침을 떠올리게 하세요. 뜻 → 글자 → 소리 순서가 핵심이에요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_cloud",
      "type": "fun_question",
      "icon": "☁️",
      "title": "구르? 구름!",
      "content": "“‘구르’라고 읽으면 어떤 느낌이에요?” 받침이 빠진 낱말을 소리 내어 읽으며 어색함을 느끼게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_pic",
      "type": "real_world",
      "icon": "🌍",
      "title": "그림 낱말 카드",
      "content": "그림 카드와 받침 빠진 낱말 카드를 함께 보여 주면, 뜻을 알아야 받침을 채울 수 있음을 자연스레 느껴요.",
      "fit_slides": [
        "motivate",
        "card_quiz"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "읽고 확인하기",
      "content": "받침을 넣어 만든 낱말은 꼭 소리 내어 읽고 뜻을 다시 확인하게 하세요. 쓰기와 읽기가 함께 자라요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_sound",
      "type": "misconception",
      "icon": "❓",
      "title": "소리 나는 대로 쓰기",
      "content": "‘물통’을 ‘무통’처럼 소리에 끌려 받침을 빼고 쓰는 아이가 있어요. 그림(뜻)을 먼저 떠올리게 도와주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_step",
      "type": "fun_question",
      "icon": "💡",
      "title": "어느 글자에 넣을까",
      "content": "“‘바라’에서 받침 ㅁ은 어느 글자 아래에 넣어야 할까요?(라)” 받침 들어갈 자리를 묻고 확인해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_fill",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "받침 ↔ 낱말 짝짓기",
      "description": "넣어야 할 받침과 완성된 낱말을 짝지어 보세요.",
      "hint": "빠진 받침이 무엇인지 생각하며 짝을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "구르 + ㅁ"
          },
          "b": {
            "text": "☁️ 구름"
          }
        },
        {
          "a": {
            "text": "채 + ㄱ"
          },
          "b": {
            "text": "📚 책"
          }
        },
        {
          "a": {
            "text": "바라 + ㅁ"
          },
          "b": {
            "text": "🍃 바람"
          }
        },
        {
          "a": {
            "text": "무 + ㄹ"
          },
          "b": {
            "text": "💧 물"
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
      "title": "짚으며 말하기",
      "content": "찾은 낱말은 받침 글자를 손가락으로 짚으며 말하게 하세요. ‘창문, 받침은 ㅇ과 ㄴ’처럼요.",
      "fit_slides": [
        "question",
        "card_quiz"
      ]
    },
    {
      "id": "e_more",
      "type": "extension",
      "icon": "⬆",
      "title": "받침 두 개 낱말",
      "content": "익숙해진 아이에겐 ‘색종이·건널목’처럼 받침이 여러 개인 낱말을 찾게 하면 한 단계 나아가요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘 채운 받침",
      "content": "“오늘 우리가 넣은 받침에는 무엇이 있었죠?(ㅁ·ㄱ·ㄹ)” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "틀린 낱말 찾기 예고",
      "content": "“‘우상 가게’라는 간판, 어딘가 이상하지 않아요?” 다음 시간 고쳐 쓰기를 한 문제 예고해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l05"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 5,
    "title": "받침이 있는 글자를 바르게 고쳐 써요",
    "std": "[2국03-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 이상한 간판 → 틀린 받침 찾아 고치기 → 고쳐 쓰기 퀴즈 → 바른 낱말 고르기 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "받침이 있는 글자를 바르게 고쳐 써요",
        "subtitle": "3단원 · 5/13차시 · 받침 글자 쓰기"
      },
      "suggested_extras": [
        "q_open",
        "t_check"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "틀리게 쓴 받침 낱말을 찾아봐요",
          "틀린 부분을 바르게 고쳐 써요",
          "바르게 쓴 낱말을 골라 읽어요"
        ]
      },
      "suggested_extras": [
        "t_check"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "이상한 간판을 봤어요 🏪",
        "visual": "🏪",
        "question": "가게 간판에 ‘우상’이라고 쓰여 있어요.<br>비 올 때 쓰는 그것… 무엇이 잘못됐을까요?",
        "img": "assets/photo/korean/word_fix.jpg"
      },
      "suggested_extras": [
        "q_sign",
        "r_sign"
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
            "q": "채＋ㄱ은 무슨 글자?",
            "a": "책"
          },
          {
            "q": "'구르'에 ㅁ을 넣으면?",
            "a": "구름"
          }
        ],
        "from": "u3_l04"
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
        "title": "틀린 받침을 찾아 바르게",
        "content": "받침을 잘못 쓰면 다른 낱말이 되거나 뜻이 안 통해요. **틀린 곳을 찾고 → 바른 받침으로 고치고 → 소리 내어 읽어** 확인해요!",
        "symbol_meanings": [
          {
            "symbol": "우상 → 우산",
            "meaning": "받침을 ㄴ으로 고쳐요 ☂️"
          },
          {
            "symbol": "잠화 → 장화",
            "meaning": "받침을 ㅇ으로 고쳐요 👢"
          },
          {
            "symbol": "화부 → 화분",
            "meaning": "받침 ㄴ을 넣어요 🪴"
          },
          {
            "symbol": "거우 → 거울",
            "meaning": "받침 ㄹ을 넣어요 🪞"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_posture"
      ],
      "tnote": {
        "ask": [
          "받침이 틀리면 왜 뜻이 안 통할까?"
        ],
        "watch": "틀린 곳 찾기→고치기→읽기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "틀린 낱말 바르게 고치기 🔍",
        "sub": "받침이 틀린 낱말이에요. 그림을 떠올리며 바르게 고쳐요. 카드를 누르면 바른 낱말이 나와요!",
        "cards": [
          {
            "clue": "‘잠화’라고 썼어요<br>비 올 때 신는 것은?",
            "emoji": "👢",
            "name": "장화"
          },
          {
            "clue": "‘우상’이라고 썼어요<br>비 올 때 쓰는 것은?",
            "emoji": "☂️",
            "name": "우산"
          },
          {
            "clue": "‘화부’라고 썼어요<br>꽃을 심어 기르는 것은?",
            "emoji": "🪴",
            "name": "화분"
          },
          {
            "clue": "‘거우’라고 썼어요<br>내 모습이 비치는 것은?",
            "emoji": "🪞",
            "name": "거울"
          }
        ],
        "outro": "틀린 받침을 바르게 고치니 뜻이 또렷해졌어요! 쓴 다음엔 꼭 읽어서 확인해요 😊"
      },
      "suggested_extras": [
        "q_diff",
        "g_fix"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "바르게 쓴 낱말을 골라요",
        "question": "두 낱말 중 바르게 쓴 것은 무엇일까요? 골라서 또박또박 읽어 봐요.",
        "items": [
          "‘연필’과 ‘여핀’ 중에서? (연필)",
          "‘장갑’과 ‘잔갑’ 중에서? (장갑)",
          "‘거울’과 ‘거우’ 중에서? (거울)"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_maze"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "틀린 받침을 바르게 고치기",
        "levels": {
          "읽기": {
            "q": "바르게 고친 낱말 '우산·장화'를 읽어 볼까요?",
            "a": "우산·장화"
          },
          "쓰기": {
            "q": "'우상'을 바른 받침으로 고쳐 '우산'을 써 볼까요?",
            "a": "우산",
            "steps": [
              "상→산(받침 ㅇ→ㄴ)"
            ]
          },
          "말하기": {
            "q": "받침을 잘못 쓰면 어떻게 되는지 말해 봐요.",
            "a": "여러 답 (예: 다른 낱말이 돼요)",
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
        "title": "틀린 받침 고치기 짝 놀이",
        "type": "pair",
        "goal": "틀린 받침을 찾아 바르게 고쳐요",
        "body": "한 사람이 받침이 틀린 낱말을 보여 주면 짝이 틀린 곳을 찾아 바른 받침으로 고쳐 읽어요.",
        "materials": [
          "낱말 카드"
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
            "q": "'우상'을 바르게 고치면?",
            "a": "우산"
          },
          {
            "q": "'잠화'를 바르게 고치면?",
            "a": "장화"
          },
          {
            "q": "고친 낱말은 어떻게 확인할까요?",
            "a": "소리 내어 읽어요"
          }
        ],
        "self": [
          "틀린 받침을 바르게 고쳐요",
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
          "받침이 틀리면 뜻이 안 통함을 알았어요",
          "틀린 받침을 찾아 바르게 고쳐 썼어요",
          "바르게 쓴 낱말을 골라 읽었어요"
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
        "preview": "여러 가지 자음자를 만나요",
        "body": "다음 시간에는 ㄲ·ㄸ·ㅃ·ㅆ·ㅉ처럼 쌍둥이 같은 새 자음자를 만날 거예요. 어떤 모양일지 기대해요!"
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
      "title": "무엇이 이상한가",
      "content": "“선생님이 ‘화부에 물을 줘요’라고 쓰면 이상하죠?” 틀린 문장을 들려주며 고치고 싶은 마음을 끌어요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_check",
      "type": "tip",
      "icon": "🧩",
      "title": "고치기 3단계",
      "content": "‘틀린 곳 찾기 → 바르게 고치기 → 읽어서 확인하기’ 3단계를 칠판에 붙여 두면 활동 내내 기준이 돼요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_sign",
      "type": "fun_question",
      "icon": "🏪",
      "title": "간판 탐정",
      "content": "“이 간판에서 틀린 받침을 찾아낼 수 있나요?” 탐정 놀이로 말하면 고치기가 즐거워져요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_sign",
      "type": "real_world",
      "icon": "🌍",
      "title": "생활 속 바른 표기",
      "content": "간판·알림장·문자에서 받침을 바르게 써야 모두가 알아봐요. 바르게 쓰기가 배려임을 이어 주세요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "그림과 함께 고치기",
      "content": "틀린 낱말만 보여 주지 말고 그림을 함께 보여 주세요. 뜻을 알아야 어떤 받침이 맞는지 찾을 수 있어요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_posture",
      "type": "misconception",
      "icon": "❓",
      "title": "자세도 글씨의 일부",
      "content": "받침만 신경 쓰다 연필 잡기·앉은 자세가 무너지기 쉬워요. 바른 자세가 바른 글씨의 첫걸음임을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "q_diff",
      "type": "fun_question",
      "icon": "💡",
      "title": "무엇이 달라졌나",
      "content": "“‘잠화’와 ‘장화’는 어디가 다르죠?(받침 ㅁ↔ㅇ)” 고치기 전후를 비교하며 받침에 집중하게 해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_fix",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "틀린 낱말 ↔ 바른 낱말",
      "description": "틀리게 쓴 낱말과 바르게 고친 낱말을 짝지어 보세요.",
      "hint": "받침이 어떻게 달라졌는지 살펴봐요.",
      "pairs": [
        {
          "a": {
            "text": "잠화"
          },
          "b": {
            "text": "👢 장화"
          }
        },
        {
          "a": {
            "text": "우상"
          },
          "b": {
            "text": "☂️ 우산"
          }
        },
        {
          "a": {
            "text": "화부"
          },
          "b": {
            "text": "🪴 화분"
          }
        },
        {
          "a": {
            "text": "거우"
          },
          "b": {
            "text": "🪞 거울"
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
      "title": "고른 까닭 말하기",
      "content": "바른 낱말을 고른 다음 “받침이 ◯이라서요”처럼 까닭을 말하게 하면 짜임 이해가 단단해져요.",
      "fit_slides": [
        "question",
        "card_quiz"
      ]
    },
    {
      "id": "e_maze",
      "type": "extension",
      "icon": "⬆",
      "title": "바른 낱말 길 찾기",
      "content": "바른 낱말만 밟고 지나가는 길 찾기 활동지를 만들면, 바른 표기 고르기를 놀이로 반복할 수 있어요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘 고친 받침",
      "content": "“오늘 어떤 받침을 고쳤죠?(ㅇ·ㄴ·ㄹ)” 물으며 고친 낱말 네 개를 함께 떠올려요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "쌍둥이 자음자 예고",
      "content": "칠판에 ㄱ을 두 개 나란히 쓰고 “이 둘이 붙으면 무엇이 될까요?” 물으며 다음 시간을 예고해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l06"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 6,
    "title": "여러 가지 자음자의 모양을 알아요",
    "std": "[2국04-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 쌍둥이 자음자 발견 → 같은 자음 두 개(ㄱ+ㄱ=ㄲ) → 된소리 낱말 맞히기 → 모양 찾기 발표 (지식 탐구) · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "여러 가지 자음자의 모양을 알아요",
        "subtitle": "3단원 · 6/13차시 · 여러 가지 낱말 읽기"
      },
      "suggested_extras": [
        "q_open",
        "t_explore"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "새로운 자음자 ㄲ·ㄸ·ㅃ·ㅆ·ㅉ를 만나요",
          "이 자음자들이 어떤 모양인지 살펴봐요",
          "이 자음자가 들어간 낱말을 찾아 읽어요"
        ]
      },
      "suggested_extras": [
        "t_explore"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "쌍둥이 자음자? 👯",
        "visual": "👯",
        "question": "‘꽃’이라는 글자를 자세히 보세요.<br>맨 위 자음자가 ㄱ 두 개를 닮지 않았나요?",
        "img": "assets/photo/korean/double_consonant.jpg"
      },
      "suggested_extras": [
        "q_twin",
        "r_find"
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
            "q": "'우상'을 고치면?",
            "a": "우산"
          },
          {
            "q": "'잠화'를 고치면?",
            "a": "장화"
          }
        ],
        "from": "u3_l05"
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
        "title": "같은 자음자 두 개가 나란히",
        "content": "ㄲ·ㄸ·ㅃ·ㅆ·ㅉ는 **같은 자음자 두 개**를 나란히 쓴 모양이에요. 그래서 쌍둥이 자음자처럼 보여요!",
        "symbol_meanings": [
          {
            "symbol": "ㄱ + ㄱ = ㄲ",
            "meaning": "꽃·까치의 첫 자음자"
          },
          {
            "symbol": "ㄷ + ㄷ = ㄸ",
            "meaning": "떡·딸기의 첫 자음자"
          },
          {
            "symbol": "ㅂ + ㅂ = ㅃ",
            "meaning": "빵·빨래의 첫 자음자"
          },
          {
            "symbol": "ㅅ + ㅅ = ㅆ / ㅈ + ㅈ = ㅉ",
            "meaning": "쌀·싹 / 짝·찌개의 첫 자음자"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_shape"
      ],
      "tnote": {
        "ask": [
          "ㄲ·ㄸ·ㅃ는 어떤 모양으로 만들어질까?"
        ],
        "watch": "ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 쌍자음 모양",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "새 자음자가 들어간 낱말 🎴",
        "sub": "ㄲ·ㄸ·ㅃ·ㅆ가 들어간 낱말이에요. 어떤 자음자가 들어 있는지 함께 살펴봐요!",
        "cards": [
          {
            "clue": "ㄲ이 들어가요<br>봄에 예쁘게 피어요",
            "emoji": "🌸",
            "name": "꽃"
          },
          {
            "clue": "ㄸ이 들어가요<br>쫄깃쫄깃 맛있는 간식",
            "emoji": "🍡",
            "name": "떡"
          },
          {
            "clue": "ㅃ이 들어가요<br>고소한 냄새가 나요",
            "emoji": "🍞",
            "name": "빵"
          },
          {
            "clue": "ㅆ이 들어가요<br>밥을 짓는 곡식이에요",
            "emoji": "🍚",
            "name": "쌀"
          }
        ],
        "outro": "꽃·떡·빵·쌀! 쌍둥이 자음자가 들어간 낱말이 우리 곁에 정말 많아요 😊"
      },
      "suggested_extras": [
        "q_first",
        "g_twin"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "쌍둥이 자음자 모양을 찾아요",
        "question": "교실과 책 속에서 ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 모양을 찾아 말해 봐요.",
        "items": [
          "급식 안내판에서 찾아볼까요? (찌개·떡볶이)",
          "친구 이름에서 찾아볼까요?",
          "찾은 자음자를 손가락으로 짚고 이름을 말해요"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_color"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "여러 가지 자음자의 모양 알기",
        "levels": {
          "읽기": {
            "q": "쌍둥이 자음자가 든 낱말 '꽃·떡'을 읽어 볼까요?",
            "a": "꽃·떡"
          },
          "쓰기": {
            "q": "같은 자음자 ㄱ 두 개로 만든 ㄲ을 써 볼까요?",
            "a": "ㄲ",
            "steps": [
              "ㄱ＋ㄱ＝ㄲ"
            ]
          },
          "말하기": {
            "q": "ㄲ·ㄸ·ㅃ이 든 낱말을 하나 말해 봐요.",
            "a": "여러 답 (예: 꽃, 떡, 빵)",
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
        "title": "쌍둥이 자음자 짝 맞추기",
        "type": "pair",
        "goal": "같은 자음자 두 개로 새 자음자를 만들어요",
        "body": "짝과 자음자 카드 두 장을 나란히 놓아 ㄲ·ㄸ·ㅃ·ㅆ·ㅉ를 만들고 그 소리가 든 낱말을 말해요.",
        "materials": [
          "자음자 카드"
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
            "q": "ㄱ 두 개를 나란히 쓰면 무엇이 될까요?",
            "a": "ㄲ"
          },
          {
            "q": "'떡'의 첫 자음자는 무엇일까요?",
            "a": "ㄸ"
          },
          {
            "q": "ㄲ·ㄸ·ㅃ는 어떤 모양일까요?",
            "a": "같은 자음자 두 개"
          }
        ],
        "self": [
          "쌍둥이 자음자의 모양을 알아요",
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
          "ㄲ·ㄸ·ㅃ·ㅆ·ㅉ는 같은 자음자 두 개 모양이에요",
          "꽃·떡·빵·쌀 같은 낱말에서 새 자음자를 찾았어요",
          "우리 둘레에서 쌍둥이 자음자를 찾아봤어요"
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
        "preview": "자음자 소리의 차이를 알아봐요",
        "body": "다음 시간에는 ‘굴과 꿀’, ‘방과 빵’처럼 자음자 하나로 소리와 뜻이 달라지는 비밀을 알아볼 거예요!"
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
      "title": "아는 자음자 세기",
      "content": "“우리가 아는 자음자를 말해 볼까요?(ㄱ~ㅎ)” 배운 자음자를 떠올린 뒤 ‘오늘은 새 친구가 온다’고 예고해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_explore",
      "type": "tip",
      "icon": "🧩",
      "title": "발견하게 하기",
      "content": "이 차시는 지식 탐구 흐름이에요. 교사가 먼저 알려 주기보다 ‘ㄱ 두 개를 닮았네?’를 아이가 발견하게 기다려 주세요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_twin",
      "type": "fun_question",
      "icon": "👯",
      "title": "닮은꼴 찾기",
      "content": "“ㄲ는 어떤 자음자 두 개를 닮았나요?” 모양 관찰에서 출발하면 새 자음자가 친숙해져요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_find",
      "type": "real_world",
      "icon": "🌍",
      "title": "급식판 속 자음자",
      "content": "급식 안내판의 떡볶이·찌개처럼 매일 보는 글자에서 새 자음자를 찾으면 학습이 생활과 이어져요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "겹쳐 쓰며 보여 주기",
      "content": "칠판에 ㄱ을 쓰고 옆에 ㄱ을 하나 더 붙여 ㄲ을 만들어 보세요. ‘두 개가 나란히’가 눈에 들어와요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_shape",
      "type": "misconception",
      "icon": "❓",
      "title": "ㅃ를 ㅂ 하나로 쓰기",
      "content": "쌍둥이 자음자를 한 개로만 쓰는 아이가 있어요. 같은 자음자를 ‘두 번’ 써야 함을 필순과 함께 짚어 주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_first",
      "type": "fun_question",
      "icon": "💡",
      "title": "첫 자음자는 무엇",
      "content": "“‘딸기’의 첫 자음자는 무엇이죠?(ㄸ)” 낱말마다 첫 자음자를 묻고 이름을 말하게 해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_twin",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "자음자 ↔ 낱말 짝짓기",
      "description": "쌍둥이 자음자와 그 자음자가 들어간 낱말을 짝지어 보세요.",
      "hint": "낱말의 첫 자음자 모양을 잘 살펴봐요.",
      "pairs": [
        {
          "a": {
            "text": "ㄲ"
          },
          "b": {
            "text": "🌸 꽃"
          }
        },
        {
          "a": {
            "text": "ㄸ"
          },
          "b": {
            "text": "🍡 떡"
          }
        },
        {
          "a": {
            "text": "ㅃ"
          },
          "b": {
            "text": "🍞 빵"
          }
        },
        {
          "a": {
            "text": "ㅆ"
          },
          "b": {
            "text": "🍚 쌀"
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
      "title": "짚고 이름 말하기",
      "content": "찾은 자음자는 손가락으로 짚으며 ‘쌍기역’처럼 이름을 함께 말하게 하면 모양과 이름이 같이 익어요.",
      "fit_slides": [
        "question",
        "card_quiz"
      ]
    },
    {
      "id": "e_color",
      "type": "extension",
      "icon": "⬆",
      "title": "자음자 색칠 활동",
      "content": "글자 카드에서 ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 부분만 색칠하게 하면 모양 확인이 한 번 더 일어나요. 모양을 본 뒤 색칠하도록 해요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "새로 만난 자음자",
      "content": "“오늘 만난 쌍둥이 자음자 다섯을 말해 볼까요?(ㄲㄸㅃㅆㅉ)” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "소리 비밀 예고",
      "content": "“‘굴’과 ‘꿀’, 글자도 소리도 닮았는데 뜻은 전혀 달라요. 왜일까요?” 다음 시간 호기심을 심어요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l07"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 7,
    "title": "자음자 소리의 차이를 알아요",
    "std": "[2국04-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 굴? 꿀? → 평음·경음 소리 대비 → 자모 모아 된소리 낱말 → 된소리 낱말 발표 (지식 탐구) · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "자음자 소리의 차이를 알아요",
        "subtitle": "3단원 · 7/13차시 · 여러 가지 낱말 읽기"
      },
      "suggested_extras": [
        "q_open",
        "t_sound"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "ㄱ과 ㄲ처럼 짝이 되는 자음자 소리를 비교해요",
          "소리의 차이를 느끼며 낱말을 읽어요",
          "알맞은 자음자를 골라 낱말을 완성해요"
        ]
      },
      "suggested_extras": [
        "t_sound"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "굴일까, 꿀일까? 🍯",
        "visual": "🍯",
        "question": "곰돌이가 달콤한 것을 먹고 있어요.<br>‘굴’이라고 읽으면 맞을까요, ‘꿀’이라고 읽어야 할까요?",
        "img": "assets/photo/korean/consonant_sound.jpg"
      },
      "suggested_extras": [
        "q_honey",
        "r_listen"
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
            "q": "ㄱ 두 개를 나란히 쓰면?",
            "a": "ㄲ"
          },
          {
            "q": "'떡'의 첫 자음자는?",
            "a": "ㄸ"
          }
        ],
        "from": "u3_l06"
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
        "title": "자음자 하나로 소리와 뜻이 달라져요",
        "content": "ㄲ·ㄸ·ㅃ·ㅆ·ㅉ는 ㄱ·ㄷ·ㅂ·ㅅ·ㅈ보다 **더 힘주어** 소리 내요. 자음자가 바뀌면 소리도 뜻도 달라져요!",
        "symbol_meanings": [
          {
            "symbol": "굴 ↔ 꿀",
            "meaning": "ㄲ은 ㄱ보다 힘주어 소리 내요"
          },
          {
            "symbol": "방 ↔ 빵",
            "meaning": "ㅃ은 ㅂ보다 힘주어 소리 내요"
          },
          {
            "symbol": "살 ↔ 쌀",
            "meaning": "ㅆ은 ㅅ보다 힘주어 소리 내요"
          },
          {
            "symbol": "자다 ↔ 짜다",
            "meaning": "ㅉ은 ㅈ보다 힘주어 소리 내요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_over"
      ],
      "tnote": {
        "ask": [
          "ㄱ과 ㄲ, 무엇이 다르게 들릴까?"
        ],
        "watch": "된소리 힘주기·소리·뜻 변화",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "chosung_quiz",
      "data": {
        "title": "자모를 모으면 무슨 낱말? 🧩",
        "sub": "쌍둥이 자음자가 들어간 글자예요. 자모를 모아 읽고 [정답 보기]로 확인해요!",
        "items": [
          {
            "chosung": "ㄲ ㅜ ㄹ",
            "answer": "꿀",
            "emoji": "🍯",
            "hint": "벌이 만든 달콤한 것! ㄱ보다 힘주어 읽어요"
          },
          {
            "chosung": "ㅃ ㅏ ㅇ",
            "answer": "빵",
            "emoji": "🍞",
            "hint": "고소하고 폭신한 간식! ㅂ보다 힘주어 읽어요"
          },
          {
            "chosung": "ㅆ ㅏ ㄹ",
            "answer": "쌀",
            "emoji": "🍚",
            "hint": "밥을 짓는 곡식! ㅅ보다 힘주어 읽어요"
          },
          {
            "chosung": "ㄸ ㅓ ㄱ",
            "answer": "떡",
            "emoji": "🍡",
            "hint": "쫄깃한 간식! ㄷ보다 힘주어 읽어요"
          }
        ]
      },
      "suggested_extras": [
        "q_pairread",
        "g_sound"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "쌍둥이 자음자 낱말 발표 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. ㄲ·ㄸ·ㅃ·ㅆ·ㅉ가 들어간 낱말을 하나 말해요!",
        "count": 24,
        "hint": "까치·딸기·빨래·씨앗·찌개… 또 무엇이 있을까요?",
        "end_msg": "쌍둥이 자음자 낱말을 많이 찾았어요. 모두 또박또박 잘 읽었어요! 👏"
      },
      "suggested_extras": [
        "t_present",
        "e_game"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "자음자 소리의 차이 알기",
        "levels": {
          "읽기": {
            "q": "'굴↔꿀', '방↔빵'을 힘의 차이를 느끼며 읽어 볼까요?",
            "a": "굴·꿀·방·빵"
          },
          "쓰기": {
            "q": "쌍둥이 자음자로 '꿀'을 써 볼까요?",
            "a": "꿀",
            "steps": [
              "ㄲ＋ㅜ＋ㄹ＝꿀"
            ]
          },
          "말하기": {
            "q": "ㄱ과 ㄲ의 소리가 어떻게 다른지 말해 봐요.",
            "a": "여러 답 (예: ㄲ이 더 힘주어 나요)",
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
        "title": "소리 짝 찾기 놀이",
        "type": "pair",
        "goal": "비슷하지만 다른 소리를 구별해요",
        "body": "짝과 '굴/꿀·방/빵·살/쌀' 카드를 짝지어 힘의 차이를 느끼며 번갈아 읽어요.",
        "materials": [
          "낱말 카드"
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
            "q": "ㄲ은 ㄱ보다 어떻게 소리 낼까요?",
            "a": "더 힘주어"
          },
          {
            "q": "'방'에서 ㅂ을 ㅃ으로 바꾸면?",
            "a": "빵"
          },
          {
            "q": "자음자가 바뀌면 무엇이 달라질까요?",
            "a": "소리와 뜻"
          }
        ],
        "self": [
          "자음자 소리의 차이를 알아요",
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
          "ㄲ·ㄸ·ㅃ·ㅆ·ㅉ는 짝 자음자보다 힘주어 소리 내요",
          "자음자가 바뀌면 소리도 뜻도 달라져요",
          "꿀·빵·쌀·떡을 자신 있게 읽었어요"
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
        "preview": "이야기를 읽고 내용을 알아봐요",
        "body": "다음 시간에는 구름이 여러 동물로 변하는 재미있는 이야기를 읽고, 무슨 일이 일어났는지 알아볼 거예요!"
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
      "title": "소리 듣고 맞히기",
      "content": "“선생님이 ‘살’ 또는 ‘쌀’ 중 하나를 읽을게요. 무엇일까요?” 듣기 퀴즈로 소리 차이에 귀를 열어요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_sound",
      "type": "tip",
      "icon": "🧩",
      "title": "몸으로 느끼는 소리",
      "content": "손을 입 앞에 대고 ‘방·빵’을 말해 보게 하세요. 입김과 힘의 차이를 몸으로 느끼면 기억에 남아요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_honey",
      "type": "fun_question",
      "icon": "🍯",
      "title": "굴과 꿀",
      "content": "“바다에서 나는 ‘굴’과 벌이 만든 ‘꿀’, 자음자 하나로 뜻이 갈리네요!” 두 낱말을 번갈아 읽게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_listen",
      "type": "real_world",
      "icon": "🌍",
      "title": "생활 속 낱말 짝",
      "content": "방↔빵, 굴↔꿀처럼 생활 속 낱말 짝을 들려주면 자음자 소리 차이가 실감 나요.",
      "fit_slides": [
        "motivate",
        "chosung_quiz"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "짝지어 번갈아 읽기",
      "content": "굴-꿀, 방-빵처럼 꼭 짝으로 번갈아 읽히세요. 혼자 읽을 때보다 차이가 훨씬 또렷하게 들려요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "x_over",
      "type": "misconception",
      "icon": "❓",
      "title": "가시를 까시로",
      "content": "예사소리를 된소리로 잘못 발음하는 아이가 있어요(가시→까시). 모든 낱말을 힘주어 읽는 건 아님을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "q_pairread",
      "type": "fun_question",
      "icon": "💡",
      "title": "짝 낱말로 바꾸면",
      "content": "“‘빵’에서 ㅃ을 ㅂ으로 바꾸면 무슨 낱말이죠?(방)” 자음자만 바꿔 읽으며 차이를 확인해요.",
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "g_sound",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "소리 짝 맞추기",
      "description": "짝이 되는 두 낱말을 짝지어 보세요.",
      "hint": "자음자 하나만 다른 낱말 짝을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "굴"
          },
          "b": {
            "text": "🍯 꿀"
          }
        },
        {
          "a": {
            "text": "방"
          },
          "b": {
            "text": "🍞 빵"
          }
        },
        {
          "a": {
            "text": "살"
          },
          "b": {
            "text": "🍚 쌀"
          }
        },
        {
          "a": {
            "text": "덕"
          },
          "b": {
            "text": "🍡 떡"
          }
        }
      ],
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "또박또박 한 번 더",
      "content": "발표한 낱말은 반 전체가 따라 읽게 하세요. 된소리를 입으로 반복해야 소리가 몸에 익어요.",
      "fit_slides": [
        "present",
        "chosung_quiz"
      ]
    },
    {
      "id": "e_game",
      "type": "extension",
      "icon": "⬆",
      "title": "가위바위보 낱말 놀이",
      "content": "짝과 가위바위보를 해서 이긴 사람이 ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 낱말을 말하는 말판 놀이로 확장할 수 있어요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "힘주어 읽는 자음자",
      "content": "“ㄱ보다 힘주어 읽는 자음자는?(ㄲ)” 짝 자음자를 차례로 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "이야기 예고",
      "content": "“하늘 구름이 토끼로 변한다면?” 다음 시간 이야기를 한 장면만 상상하게 하면 기대가 커져요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l08"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 8,
    "title": "이야기를 읽고 내용을 알아요",
    "std": "[2국02-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 구름 모양 상상 → 이야기 읽는 약속 → 구름 이야기 읽어주기 → 내용 확인 발문 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "이야기를 읽고 내용을 알아요",
        "subtitle": "3단원 · 8/13차시 · 여러 가지 낱말 읽기"
      },
      "suggested_extras": [
        "q_open",
        "t_guess"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "제목과 그림을 보고 내용을 짐작해요",
          "이야기를 듣고 무슨 일이 있었는지 알아봐요",
          "이야기 속 받침 낱말을 또박또박 읽어요"
        ]
      },
      "suggested_extras": [
        "t_guess"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "구름이 변신해요 ☁️",
        "visual": "☁️",
        "question": "하늘에 뭉게뭉게 구름이 떠 있어요.<br>저 구름, 무슨 모양으로 보이나요?",
        "img": "assets/photo/korean/read_story.jpg"
      },
      "suggested_extras": [
        "q_shape",
        "r_sky"
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
            "q": "ㄲ은 ㄱ보다 어떻게?",
            "a": "더 힘주어"
          },
          {
            "q": "'방'에서 ㅂ을 ㅃ으로 바꾸면?",
            "a": "빵"
          }
        ],
        "from": "u3_l07"
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
        "title": "이야기를 읽는 약속",
        "content": "이야기를 읽을 때는 **제목과 그림으로 짐작**하고, **또박또박** 읽으며, 읽은 다음 **무슨 일이 있었는지** 떠올려요!",
        "symbol_meanings": [
          {
            "symbol": "짐작하기",
            "meaning": "제목·그림을 보고 내용을 미리 그려 봐요"
          },
          {
            "symbol": "또박또박 읽기",
            "meaning": "받침 소리까지 정확하게 읽어요"
          },
          {
            "symbol": "내용 떠올리기",
            "meaning": "누가 나와서 무슨 일을 했는지 생각해요"
          },
          {
            "symbol": "흉내 내는 말",
            "meaning": "깡충깡충처럼 모양을 나타내는 말을 찾아요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_fast"
      ],
      "tnote": {
        "ask": [
          "제목과 그림을 보면 무슨 이야기일지 짐작이 되니?"
        ],
        "watch": "짐작하기·또박또박·내용 파악",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "read_aloud",
      "data": {
        "title": "구름이 변신하는 이야기 📖",
        "author": "구름과 동물이 나오는 그림책",
        "pages": [
          {
            "img_hint": "하늘에 뭉게구름이 떠 있는 장면",
            "quote": "하늘의 구름을 함께 올려다보는 장면이에요.\n구름이 무엇으로 변할지 아이들과 짐작해 보세요."
          },
          {
            "img_hint": "구름이 토끼 모양으로 변한 장면",
            "quote": "구름이 깡충깡충 뛰는 토끼로 변했어요.\n토끼가 어디로 가고 싶을지 물어보세요."
          },
          {
            "img_hint": "토끼 앞에 언덕이 생긴 장면",
            "quote": "주인공이 토끼에게 언덕을 만들어 주는 장면이에요.\n토끼의 기분이 어떨지 이야기 나눠요."
          },
          {
            "img_hint": "구름이 호랑이 모양으로 변한 장면",
            "quote": "이번에는 어슬렁어슬렁 호랑이가 나타났어요.\n주인공이 호랑이 꼬리를 잡는 장면을 실감 나게 읽어 주세요."
          }
        ],
        "copyright": "수업용 진행 안내입니다. 그림책 본문은 학교 수업 목적 이용(저작권법 제25조) 범위에서 교사가 실물 책으로 보여 주세요."
      },
      "suggested_extras": [
        "q_while",
        "t_voice"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "이야기 내용을 확인해요",
        "question": "이야기를 잘 들었나요? 무슨 일이 있었는지 말해 봐요.",
        "items": [
          "주인공이 토끼에게 만들어 준 것은? (언덕)",
          "주인공이 호랑이의 어디를 잡았나요? (꼬리)",
          "가장 재미있던 장면은 어디였나요?"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_retell"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "이야기를 읽고 내용 알기",
        "levels": {
          "읽기": {
            "q": "이야기를 받침 소리까지 또박또박 읽어 볼까요?",
            "a": "또박또박 읽기"
          },
          "쓰기": {
            "q": "이야기에 나온 낱말을 하나 골라 바르게 써 볼까요?",
            "a": "여러 답 (예: 구름)",
            "open": true
          },
          "말하기": {
            "q": "이야기에서 무슨 일이 있었는지 말해 봐요.",
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
        "title": "이야기 짐작하고 나누기 짝 활동",
        "type": "pair",
        "goal": "제목·그림으로 짐작하고 내용을 나눠요",
        "body": "짝과 제목·그림을 보고 무슨 이야기일지 짐작해 말한 뒤, 읽고 나서 서로 무슨 일이 있었는지 이야기해요.",
        "materials": [
          "그림책·이야기 자료"
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
            "q": "이야기를 읽기 전에 무엇으로 짐작할까요?",
            "a": "제목·그림"
          },
          {
            "q": "이야기는 어떻게 읽을까요?",
            "a": "또박또박"
          },
          {
            "q": "읽은 다음에는 무엇을 떠올릴까요?",
            "a": "무슨 일이 있었는지"
          }
        ],
        "self": [
          "이야기를 읽고 내용을 알아요",
          "조금 헷갈려요",
          "다시 읽고 싶어요"
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
          "제목과 그림으로 내용을 짐작했어요",
          "이야기를 듣고 무슨 일이 있었는지 알았어요",
          "언덕·꼬리 같은 받침 낱말을 읽었어요"
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
        "preview": "이야기 속 낱말을 자신 있게 읽어요",
        "body": "다음 시간에는 깡충깡충·폴짝폴짝처럼 이야기 속 흉내 내는 말을 자신 있게 읽어 볼 거예요!"
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
      "title": "낱말 말하기 놀이",
      "content": "“‘학교’ 하면 떠오르는 받침 낱말은?(칠판·운동장)” 가볍게 낱말 놀이로 시작하면 읽기 차시가 부드러워져요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_guess",
      "type": "tip",
      "icon": "🧩",
      "title": "짐작이 먼저",
      "content": "읽기 전에 제목·표지 그림으로 내용을 짐작하게 하세요. 짐작과 실제를 비교하는 재미가 읽기 동기가 돼요.",
      "fit_slides": [
        "objective",
        "read_aloud"
      ]
    },
    {
      "id": "q_shape",
      "type": "fun_question",
      "icon": "☁️",
      "title": "구름 상상 놀이",
      "content": "“구름이 동물로 변한다면 무슨 동물이면 좋겠어요?” 상상을 먼저 펼치면 이야기에 푹 빠져들어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_sky",
      "type": "real_world",
      "icon": "🌍",
      "title": "진짜 하늘 보기",
      "content": "쉬는 시간에 창밖 구름을 보며 모양 찾기를 해 보세요. 이야기와 실제 경험이 이어져요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "세 가지 약속 손가락",
      "content": "짐작하기·또박또박·떠올리기를 손가락 세 개로 약속처럼 외우게 하면 읽기 전 루틴이 생겨요.",
      "fit_slides": [
        "concept",
        "read_aloud"
      ]
    },
    {
      "id": "x_fast",
      "type": "misconception",
      "icon": "❓",
      "title": "빨리 읽기가 잘 읽기?",
      "content": "빨리 읽어야 잘 읽는다고 여기는 아이가 있어요. 받침 소리까지 정확하게 읽는 게 먼저임을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "read_aloud"
      ]
    },
    {
      "id": "q_while",
      "type": "fun_question",
      "icon": "💡",
      "title": "다음 장면 맞히기",
      "content": "장을 넘기기 전에 “다음엔 구름이 무엇으로 변할까요?” 물으면 끝까지 귀 기울여 들어요.",
      "fit_slides": [
        "read_aloud"
      ]
    },
    {
      "id": "t_voice",
      "type": "tip",
      "icon": "🗣",
      "title": "흉내 내는 말 실감 나게",
      "content": "깡충깡충·어슬렁어슬렁은 몸짓과 목소리로 실감 나게 읽어 주세요. 낱말의 느낌이 살아나요.",
      "fit_slides": [
        "read_aloud"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "답과 까닭 함께",
      "content": "내용 확인은 답만 말하고 끝내지 말고 “이야기 어디에서 알았어요?”를 함께 물어 주세요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_retell",
      "type": "extension",
      "icon": "⬆",
      "title": "한 장면 다시 말하기",
      "content": "익숙해진 아이에겐 가장 좋아하는 장면을 두세 문장으로 다시 말하게 하면 줄거리 이해가 단단해져요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘의 이야기",
      "content": "“구름은 무엇무엇으로 변했죠?(토끼·호랑이)” 물으며 이야기 내용을 한 번 더 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "흉내 내는 말 예고",
      "content": "“토끼는 깡충깡충! 호랑이는 어떻게 걸을까요?” 흉내 내는 말을 하나 맛보게 하며 다음 시간을 예고해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l09"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 9,
    "title": "자신 있게 낱말을 읽어요",
    "std": "[2국02-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 토끼는 어떻게 뛰나 → 흉내 내는 말 속 된소리 → 흉내 내는 말 맞히기 → 동물+움직임 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "자신 있게 낱말을 읽어요",
        "subtitle": "3단원 · 9/13차시 · 여러 가지 낱말 읽기"
      },
      "suggested_extras": [
        "q_open",
        "t_confident"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "이야기 속 흉내 내는 말을 찾아봐요",
          "쌍둥이 자음자가 든 낱말을 자신 있게 읽어요",
          "좋아하는 동물의 움직임을 말로 나타내요"
        ]
      },
      "suggested_extras": [
        "t_confident"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "토끼는 어떻게 뛸까요? 🐰",
        "visual": "🐰",
        "question": "지난 시간 이야기 속 토끼를 떠올려요.<br>토끼가 뛰는 모양을 말로 나타내면 어떻게 될까요?",
        "img": "assets/photo/korean/mimetic_words.jpg"
      },
      "suggested_extras": [
        "q_hop",
        "r_move"
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
            "q": "이야기 읽기 전 무엇으로 짐작?",
            "a": "제목·그림"
          },
          {
            "q": "이야기는 어떻게 읽을까요?",
            "a": "또박또박"
          }
        ],
        "from": "u3_l08"
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
        "title": "흉내 내는 말 속 쌍둥이 자음자",
        "content": "움직임이나 모양을 나타내는 **흉내 내는 말**에는 쌍둥이 자음자가 자주 들어가요. 또박또박 자신 있게 읽어 봐요!",
        "symbol_meanings": [
          {
            "symbol": "깡충깡충 (ㄲ)",
            "meaning": "토끼가 뛰는 모양"
          },
          {
            "symbol": "폴짝폴짝 (ㅉ)",
            "meaning": "개구리가 뛰는 모양"
          },
          {
            "symbol": "뒤뚱뒤뚱 (ㄸ)",
            "meaning": "오리가 걷는 모양"
          },
          {
            "symbol": "쌩쌩 (ㅆ)",
            "meaning": "바람이 빠르게 부는 모양"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_shy"
      ],
      "tnote": {
        "ask": [
          "흉내 내는 말을 읽으면 어떤 모양이 떠오르니?"
        ],
        "watch": "흉내말·된소리 자신 있게 읽기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "흉내 내는 말 맞히기 🎭",
        "sub": "어떤 모양을 나타내는 말일까요? 카드를 누르면 답이 나와요. 다 같이 몸으로도 흉내 내 봐요!",
        "cards": [
          {
            "clue": "토끼가 뛰는 모양<br>ㄲ이 들어가요",
            "emoji": "🐰",
            "name": "깡충깡충"
          },
          {
            "clue": "개구리가 뛰는 모양<br>ㅉ이 들어가요",
            "emoji": "🐸",
            "name": "폴짝폴짝"
          },
          {
            "clue": "오리가 걷는 모양<br>ㄸ이 들어가요",
            "emoji": "🦆",
            "name": "뒤뚱뒤뚱"
          },
          {
            "clue": "호랑이가 천천히 걷는 모양<br>받침 ㄹ·ㅇ이 들어가요",
            "emoji": "🐯",
            "name": "어슬렁어슬렁"
          }
        ],
        "outro": "흉내 내는 말을 읽으니 동물이 움직이는 모습이 눈앞에 그려지죠? 😊"
      },
      "suggested_extras": [
        "q_act",
        "g_mimic"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "동물 움직임 발표하기 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 좋아하는 동물과 그 동물이 움직이는 모양을 흉내 내는 말로 말해요!",
        "count": 24,
        "hint": "“저는 오리를 좋아해요. 오리는 뒤뚱뒤뚱 걸어요” 처럼 말해 봐요",
        "end_msg": "흉내 내는 말 덕분에 발표가 더 생생했어요. 모두 자신 있게 잘 읽었어요! 👏"
      },
      "suggested_extras": [
        "t_present",
        "e_mine"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "흉내 내는 말 자신 있게 읽기",
        "levels": {
          "읽기": {
            "q": "흉내 내는 말 '깡충깡충·폴짝폴짝'을 자신 있게 읽어 볼까요?",
            "a": "깡충깡충·폴짝폴짝"
          },
          "쓰기": {
            "q": "토끼가 뛰는 모양 '깡충깡충'을 써 볼까요?",
            "a": "깡충깡충",
            "open": false
          },
          "말하기": {
            "q": "흉내 내는 말을 하나 말하고 몸으로 흉내 내 봐요.",
            "a": "여러 답 (예: 뒤뚱뒤뚱)",
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
        "title": "흉내 내는 말 몸짓 놀이",
        "type": "pair",
        "goal": "흉내 내는 말을 읽고 몸으로 표현해요",
        "body": "한 사람이 흉내 내는 말을 읽으면 짝이 그 모양을 몸으로 흉내 내요. 역할을 바꿔 해요.",
        "materials": [
          "흉내말 카드"
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
            "q": "토끼가 뛰는 모양은 어떤 말일까요?",
            "a": "깡충깡충"
          },
          {
            "q": "흉내 내는 말에는 어떤 자음자가 자주 들까요?",
            "a": "쌍둥이 자음자"
          },
          {
            "q": "흉내 내는 말은 어떻게 읽을까요?",
            "a": "자신 있게 또박또박"
          }
        ],
        "self": [
          "흉내 내는 말을 자신 있게 읽어요",
          "조금 헷갈려요",
          "다시 읽고 싶어요"
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
          "흉내 내는 말에 쌍둥이 자음자가 자주 들어가요",
          "깡충깡충·폴짝폴짝을 자신 있게 읽었어요",
          "좋아하는 동물의 움직임을 말로 나타냈어요"
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
        "preview": "주제를 정해 받침 낱말을 찾아요",
        "body": "다음 시간에는 ‘교실 물건’처럼 주제를 정하고, 주제에 맞는 받침 낱말 찾기 놀이를 할 거예요!"
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
      "title": "몸으로 먼저",
      "content": "“토끼처럼 뛰어 볼 사람?” 몸으로 흉내 낸 다음 그 모양을 말로 나타내면 낱말이 살아나요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_confident",
      "type": "tip",
      "icon": "🧩",
      "title": "자신 있게의 뜻",
      "content": "‘자신 있게 읽기’는 크게가 아니라 틀릴까 봐 머뭇거리지 않고 또박또박 읽는 거예요. 틀려도 괜찮은 분위기를 만들어 주세요.",
      "fit_slides": [
        "objective",
        "present"
      ]
    },
    {
      "id": "q_hop",
      "type": "fun_question",
      "icon": "🐰",
      "title": "뛰는 모양 말하기",
      "content": "“토끼가 뛰는 모양은 깡충깡충! 그럼 참새는?(폴짝폴짝)” 동물을 바꿔 가며 흉내 내는 말을 끌어내요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_move",
      "type": "real_world",
      "icon": "🌍",
      "title": "몸과 말 잇기",
      "content": "흉내 내는 말은 몸 움직임과 함께 익히면 오래 남아요. 자리에서 살짝 움직여 보게 해 주세요.",
      "fit_slides": [
        "motivate",
        "card_quiz"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "두 번 반복되는 말",
      "content": "깡충깡충처럼 같은 말이 두 번 반복되는 점을 짚어 주세요. 리듬을 살려 읽으면 훨씬 재미있어요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_shy",
      "type": "misconception",
      "icon": "❓",
      "title": "작게 웅얼거리며 읽기",
      "content": "틀릴까 봐 작게 읽는 아이가 있어요. 정답 확인보다 소리 내는 경험 자체를 칭찬해 주세요.",
      "fit_slides": [
        "concept",
        "present"
      ]
    },
    {
      "id": "q_act",
      "type": "fun_question",
      "icon": "💡",
      "title": "말하고 움직이고",
      "content": "“‘뒤뚱뒤뚱’ 하면서 오리처럼 걸어 볼까요?” 낱말을 읽으며 몸으로 표현하면 뜻이 몸에 새겨져요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_mimic",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "동물 ↔ 흉내 내는 말",
      "description": "동물과 그 움직임을 나타내는 말을 짝지어 보세요.",
      "hint": "동물이 움직이는 모습을 떠올리며 짝을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "🐰 토끼"
          },
          "b": {
            "text": "깡충깡충"
          }
        },
        {
          "a": {
            "text": "🐸 개구리"
          },
          "b": {
            "text": "폴짝폴짝"
          }
        },
        {
          "a": {
            "text": "🦆 오리"
          },
          "b": {
            "text": "뒤뚱뒤뚱"
          }
        },
        {
          "a": {
            "text": "🚴 자전거"
          },
          "b": {
            "text": "쌩쌩"
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
      "title": "문장 틀 주기",
      "content": "“저는 ◯◯를 좋아해요. ◯◯는 ◯◯◯◯ 움직여요” 문장 틀을 주면 누구나 막힘없이 발표할 수 있어요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_mine",
      "type": "extension",
      "icon": "⬆",
      "title": "나만의 흉내 내는 말",
      "content": "익숙해진 아이에겐 동물 말고 비·바람·자동차의 움직임도 흉내 내는 말로 나타내게 하면 한 단계 나아가요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "기억나는 흉내 내는 말",
      "content": "“오늘 읽은 흉내 내는 말 중 가장 마음에 드는 것은?” 물으며 배운 낱말을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "주제 미리 생각하기",
      "content": "“교실 물건 중 받침이 들어간 낱말이 떠오르나요?” 다음 시간 놀이 주제를 살짝 맛보게 해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l10"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 10,
    "title": "주제를 정해 받침 낱말을 찾아요",
    "std": "[2국03-01] · [2국02-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 교실 하면 떠오르는 낱말 → 낱말 찾기 놀이 방법 → 교실 물건 초성 퀴즈 → 주제별 낱말 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "주제를 정해 받침 낱말을 찾아요",
        "subtitle": "3단원 · 10/13차시 · 배운 내용 실천"
      },
      "suggested_extras": [
        "q_open",
        "t_play"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "우리 반이 할 낱말 찾기 놀이를 알아봐요",
          "주제를 정해 받침 낱말을 찾아 써요",
          "친구가 찾은 낱말을 함께 읽어요"
        ]
      },
      "suggested_extras": [
        "t_play"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "‘교실’ 하면 무엇이 떠오르나요? 🏫",
        "visual": "🏫",
        "question": "교실을 한 바퀴 둘러봐요.<br>받침이 들어간 물건 이름이 몇 개나 보이나요?",
        "img": "assets/photo/korean/word_hunt.jpg"
      },
      "suggested_extras": [
        "q_look",
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
            "q": "토끼가 뛰는 모양은?",
            "a": "깡충깡충"
          },
          {
            "q": "흉내 내는 말에 자주 드는 자음자는?",
            "a": "쌍둥이 자음자"
          }
        ],
        "from": "u3_l09"
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
        "title": "낱말 찾기 놀이 방법",
        "content": "오늘은 우리가 배운 받침 낱말로 놀이를 해요. **주제를 정하고 → 낱말을 쓰고 → 함께 확인**하는 순서예요!",
        "symbol_meanings": [
          {
            "symbol": "① 주제 정하기",
            "meaning": "과일·학용품·교실 물건처럼 주제를 골라요"
          },
          {
            "symbol": "② 받침 낱말 쓰기",
            "meaning": "주제에 맞는 받침 낱말을 종이에 써요"
          },
          {
            "symbol": "③ 붙이고 확인하기",
            "meaning": "칠판에 붙이고 친구의 낱말을 함께 읽어요"
          },
          {
            "symbol": "④ 주제 바꾸기",
            "meaning": "새 주제로 바꿔 다시 놀이해요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_count"
      ],
      "tnote": {
        "ask": [
          "우리 둘레에서 어떤 주제의 받침 낱말을 찾을 수 있을까?"
        ],
        "watch": "주제 정하기→쓰기→확인 놀이",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "chosung_quiz",
      "data": {
        "title": "교실 물건 초성 퀴즈 🏫",
        "sub": "주제는 ‘교실에 있는 물건’! 초성을 보고 받침 낱말을 맞혀요. [정답 보기]로 확인해요",
        "items": [
          {
            "chosung": "ㄱ ㅊ",
            "answer": "공책",
            "emoji": "📓",
            "hint": "글씨를 쓰는 얇은 것! 받침 ㅇ·ㄱ"
          },
          {
            "chosung": "ㅇ ㅍ",
            "answer": "연필",
            "emoji": "✏️",
            "hint": "글씨를 쓰는 도구! 받침 ㄴ·ㄹ"
          },
          {
            "chosung": "ㅊ ㅍ",
            "answer": "칠판",
            "emoji": "🖍️",
            "hint": "선생님이 글씨를 쓰는 곳! 받침 ㄹ·ㄴ"
          },
          {
            "chosung": "ㅊ ㅅ",
            "answer": "책상",
            "emoji": "🪑",
            "hint": "공부할 때 앞에 있는 것! 받침 ㄱ·ㅇ"
          }
        ]
      },
      "suggested_extras": [
        "q_theme",
        "g_class"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "주제별 받침 낱말 발표 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 주제(과일·학용품·집에 있는 물건)를 하나 골라 받침 낱말을 말해요!",
        "count": 24,
        "hint": "“과일 주제! 수박이요. 받침은 ㄱ이에요” 처럼 말해 봐요",
        "end_msg": "주제마다 받침 낱말이 가득했어요. 친구의 낱말도 함께 읽어서 더 좋았어요! 👏"
      },
      "suggested_extras": [
        "t_present",
        "e_swap"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "주제를 정해 받침 낱말 찾기",
        "levels": {
          "읽기": {
            "q": "교실 물건 낱말 '공책·연필'을 읽어 볼까요?",
            "a": "공책·연필"
          },
          "쓰기": {
            "q": "주제 '교실 물건'에 맞는 받침 낱말을 하나 써 볼까요?",
            "a": "여러 답 (예: 공책)",
            "open": true
          },
          "말하기": {
            "q": "내가 정한 주제의 받침 낱말을 말해 봐요.",
            "a": "여러 답 (예: 과일-수박)",
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
        "title": "주제 낱말 모으기 짝 놀이",
        "type": "pair",
        "goal": "주제를 정해 받침 낱말을 함께 모아요",
        "body": "짝과 주제(과일·학용품 등)를 정하고 그 주제에 맞는 받침 낱말을 번갈아 말하며 모아요.",
        "materials": [
          "종이",
          "연필"
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
            "q": "낱말 찾기 놀이의 첫 순서는 무엇일까요?",
            "a": "주제 정하기"
          },
          {
            "q": "'공책'에서 받침이 있는 글자는?",
            "a": "공·책"
          },
          {
            "q": "모은 낱말은 어떻게 할까요?",
            "a": "함께 확인해요"
          }
        ],
        "self": [
          "주제를 정해 받침 낱말을 찾아요",
          "조금 헷갈려요",
          "다시 해 보고 싶어요"
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
          "주제를 정해 받침 낱말을 찾았어요",
          "찾은 낱말을 쓰고 함께 읽었어요",
          "친구가 찾은 낱말을 존중하며 들었어요"
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
        "preview": "낱자가 바뀌면 뜻이 바뀌어요",
        "body": "다음 시간에는 ‘곰’이 ‘봄’으로 변하는 마법처럼, 낱자 하나로 뜻이 달라지는 낱말을 찾아볼 거예요!"
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
      "title": "몇 개나 찾을까",
      "content": "“오늘 우리 반이 받침 낱말을 모두 몇 개 찾을 수 있을까요?” 함께 목표를 정하면 놀이 열기가 올라가요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_play",
      "type": "tip",
      "icon": "🧩",
      "title": "실천 차시의 마음",
      "content": "오늘은 새것을 배우기보다 배운 것을 써먹는 시간이에요. 정답보다 참여와 나눔을 칭찬해 주세요.",
      "fit_slides": [
        "objective",
        "present"
      ]
    },
    {
      "id": "q_look",
      "type": "fun_question",
      "icon": "🏫",
      "title": "교실 한 바퀴",
      "content": "“자리에서 눈으로만 교실을 한 바퀴 돌아봐요. 받침 낱말이 보이나요?” 관찰로 놀이를 열어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_class",
      "type": "real_world",
      "icon": "🌍",
      "title": "우리 반 낱말 지도",
      "content": "찾은 낱말을 물건 위치에 붙이면 ‘우리 반 낱말 지도’가 돼요. 교실 환경판으로 이어 갈 수 있어요.",
      "fit_slides": [
        "motivate",
        "present"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "주제는 아이들이",
      "content": "주제를 교사가 다 정하지 말고 아이들이 고르게 해 주세요. 관심 있는 주제일수록 낱말이 쏟아져요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "x_count",
      "type": "misconception",
      "icon": "❓",
      "title": "많이 쓴 사람이 이긴다?",
      "content": "낱말 수로 겨루는 놀이가 아니에요. 떠올리는 낱말 수는 아이마다 달라요. 적게 써도 충분함을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "present"
      ]
    },
    {
      "id": "q_theme",
      "type": "fun_question",
      "icon": "💡",
      "title": "받침 위치 확인",
      "content": "“‘공책’의 받침은 어디에 있죠?(공의 ㅇ, 책의 ㄱ)” 맞힌 낱말마다 받침을 짚으며 한 번 더 확인해요.",
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "g_class",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "물건 ↔ 받침 짝짓기",
      "description": "교실 물건과 그 낱말의 받침을 짝지어 보세요.",
      "hint": "낱말을 소리 내어 읽으며 받침을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "📓 공책"
          },
          "b": {
            "text": "ㅇ·ㄱ"
          }
        },
        {
          "a": {
            "text": "✏️ 연필"
          },
          "b": {
            "text": "ㄴ·ㄹ"
          }
        },
        {
          "a": {
            "text": "🖍️ 칠판"
          },
          "b": {
            "text": "ㄹ·ㄴ"
          }
        },
        {
          "a": {
            "text": "🪑 책상"
          },
          "b": {
            "text": "ㄱ·ㅇ"
          }
        }
      ],
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "존중하며 듣기",
      "content": "친구가 발표한 낱말은 다 같이 한 번 따라 읽어 주세요. 듣고 따라 읽는 것이 존중의 표현이에요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_swap",
      "type": "extension",
      "icon": "⬆",
      "title": "주제 바꿔 한 번 더",
      "content": "시간이 남으면 주제를 ‘좋아하는 음식’으로 바꿔 한 판 더! 주제를 바꿀수록 낱말 곳간이 커져요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "가장 기억나는 낱말",
      "content": "“오늘 친구가 찾은 낱말 중 기억에 남는 것은?” 물으며 서로의 낱말을 한 번 더 떠올려요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "변신 낱말 예고",
      "content": "칠판에 ‘곰’을 쓰고 ㄱ을 ㅂ으로 바꿔 보세요. “어? 봄이 됐네!” 다음 시간 호기심을 심어요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l11"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 11,
    "title": "낱자가 바뀌면 뜻이 바뀌어요",
    "std": "[2국04-01] · [2국02-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 곰이 봄으로 → 자음자·모음자·받침 바뀜 관찰 → 변신 낱말 맞히기 → 새 변신 낱말 만들기 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "낱자가 바뀌면 뜻이 바뀌어요",
        "subtitle": "3단원 · 11/13차시 · 배운 내용 실천"
      },
      "suggested_extras": [
        "q_open",
        "t_observe"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "낱자 하나가 바뀐 낱말 짝을 살펴봐요",
          "무엇이 바뀌어 뜻이 달라졌는지 찾아요",
          "낱자를 바꿔 새 낱말을 만들어 읽어요"
        ]
      },
      "suggested_extras": [
        "t_observe"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "곰이 봄이 됐어요! 🐻🌷",
        "visual": "🪄",
        "question": "‘곰’에서 ㄱ을 ㅂ으로 바꾸면 ‘봄’이 돼요.<br>낱자 하나가 마법처럼 뜻을 바꿨네요?",
        "img": "assets/photo/korean/word_change.jpg"
      },
      "suggested_extras": [
        "q_magic",
        "r_pairword"
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
            "q": "낱말 찾기의 첫 순서는?",
            "a": "주제 정하기"
          },
          {
            "q": "'공책'에서 받침 있는 글자는?",
            "a": "공·책"
          }
        ],
        "from": "u3_l10"
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
        "title": "무엇이 바뀌었을까요?",
        "content": "자음자·모음자·받침 중 **낱자 하나만 바뀌어도** 전혀 다른 낱말이 돼요. 무엇이 바뀌었는지 찾아봐요!",
        "symbol_meanings": [
          {
            "symbol": "곰 ↔ 봄",
            "meaning": "자음자가 바뀌었어요 (ㄱ↔ㅂ)"
          },
          {
            "symbol": "숲 ↔ 숨",
            "meaning": "받침이 바뀌었어요 (ㅍ↔ㅁ)"
          },
          {
            "symbol": "강 ↔ 공",
            "meaning": "모음자가 바뀌었어요 (ㅏ↔ㅗ)"
          },
          {
            "symbol": "말 ↔ 물",
            "meaning": "모음자가 바뀌었어요 (ㅏ↔ㅜ)"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_same"
      ],
      "tnote": {
        "ask": [
          "낱자 하나만 바꿔도 낱말이 얼마나 달라질까?"
        ],
        "watch": "자음자·모음자·받침 교체→뜻 변화",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "변신 낱말 맞히기 🪄",
        "sub": "낱자 하나를 바꾸면 무슨 낱말이 될까요? 카드를 누르면 답이 나와요!",
        "cards": [
          {
            "clue": "‘곰’에서 ㄱ을 ㅂ으로!<br>꽃이 피는 따뜻한 계절",
            "emoji": "🌷",
            "name": "봄"
          },
          {
            "clue": "‘강’에서 ㅏ를 ㅗ로!<br>동그랗고 잘 굴러가요",
            "emoji": "⚽",
            "name": "공"
          },
          {
            "clue": "‘말’에서 ㅏ를 ㅜ로!<br>목마를 때 마셔요",
            "emoji": "💧",
            "name": "물"
          },
          {
            "clue": "‘숲’에서 받침 ㅍ을 ㅁ으로!<br>코로 들이쉬고 내쉬어요",
            "emoji": "😮‍💨",
            "name": "숨"
          }
        ],
        "outro": "자음자·모음자·받침, 무엇이 바뀌어도 뜻이 달라져요. 낱자 하나하나가 소중하죠? 😊"
      },
      "suggested_extras": [
        "q_what",
        "g_change"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "나도 변신 낱말을 만들어요",
        "question": "낱자 하나를 바꿔 새 낱말을 만들고 두 낱말을 모두 읽어 봐요.",
        "items": [
          "‘밥’의 받침을 ㅇ으로 바꾸면? (방)",
          "‘채’의 모음자를 ㅗ로 바꾸면? (초)",
          "내가 만든 변신 낱말 짝을 발표해 봐요"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_chain"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "낱자가 바뀌면 뜻도 바뀌기",
        "levels": {
          "읽기": {
            "q": "'곰↔봄', '강↔공'을 읽으며 무엇이 바뀌었는지 살펴볼까요?",
            "a": "곰·봄·강·공"
          },
          "쓰기": {
            "q": "'곰'에서 ㄱ을 ㅂ으로 바꿔 '봄'을 써 볼까요?",
            "a": "봄",
            "steps": [
              "곰→봄(자음자 ㄱ→ㅂ)"
            ]
          },
          "말하기": {
            "q": "낱자 하나를 바꿔 새 낱말을 만들어 말해 봐요.",
            "a": "여러 답 (예: 말→물)",
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
        "title": "변신 낱말 짝 놀이",
        "type": "pair",
        "goal": "낱자 하나를 바꿔 새 낱말을 만들어요",
        "body": "한 사람이 낱말을 말하면 짝이 자음자·모음자·받침 중 하나를 바꿔 새 낱말을 만들어 읽어요.",
        "materials": [
          "낱말 카드"
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
            "q": "'곰'에서 ㄱ을 ㅂ으로 바꾸면?",
            "a": "봄"
          },
          {
            "q": "'강'에서 ㅏ를 ㅗ로 바꾸면?",
            "a": "공"
          },
          {
            "q": "낱자 하나가 바뀌면 무엇이 바뀔까요?",
            "a": "뜻"
          }
        ],
        "self": [
          "낱자를 바꿔 새 낱말을 만들어요",
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
          "낱자 하나가 바뀌면 뜻이 달라져요",
          "자음자·모음자·받침 중 무엇이 바뀌었는지 찾았어요",
          "낱자를 바꿔 새 낱말을 만들어 읽었어요"
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
        "preview": "배운 내용을 정리해요",
        "body": "다음 시간에는 받침 낱말 완성하기와 흉내 내는 말 잇기로, 이 단원에서 배운 것을 정리할 거예요!"
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
      "title": "틀린 그림 찾기처럼",
      "content": "“‘곰’과 ‘봄’, 어디가 다른지 틀린 그림 찾기처럼 찾아볼까요?” 두 글자를 나란히 비교하게 해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_observe",
      "type": "tip",
      "icon": "🧩",
      "title": "관찰 → 적용",
      "content": "먼저 낱말 짝을 관찰해 규칙을 찾고, 그다음 직접 바꿔 보게 하세요. 발견의 순서가 이해를 깊게 해요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_magic",
      "type": "fun_question",
      "icon": "🪄",
      "title": "낱자 마법사",
      "content": "“낱자 하나를 바꾸는 마법사가 되어 볼까요?” 놀이 이름을 붙이면 활동이 신나져요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_pairword",
      "type": "real_world",
      "icon": "🌍",
      "title": "닮은 낱말 조심",
      "content": "‘말과 물’처럼 닮은 낱말을 잘못 읽으면 뜻이 달라져요. 정확히 읽기가 왜 중요한지 생활과 이어 주세요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "바뀐 곳에 동그라미",
      "content": "낱말 짝을 칠판에 나란히 쓰고 바뀐 낱자에 동그라미를 치면 무엇이 바뀌었는지 한눈에 보여요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_same",
      "type": "misconception",
      "icon": "❓",
      "title": "비슷하면 같은 낱말?",
      "content": "모양이 비슷하면 같은 낱말이라 여기는 아이가 있어요. 낱자 하나 차이로 뜻이 전혀 달라짐을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_what",
      "type": "fun_question",
      "icon": "💡",
      "title": "무엇이 바뀌었나",
      "content": "“‘강’이 ‘공’이 될 때 바뀐 것은 자음자, 모음자, 받침 중 무엇이죠?(모음자)” 셋 중 하나로 답하게 해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_change",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "변신 낱말 짝 맞추기",
      "description": "낱자 하나로 변신하는 낱말 짝을 맞춰 보세요.",
      "hint": "자음자·모음자·받침 중 무엇이 바뀌는지 살펴봐요.",
      "pairs": [
        {
          "a": {
            "text": "🐻 곰"
          },
          "b": {
            "text": "🌷 봄"
          }
        },
        {
          "a": {
            "text": "🌳 숲"
          },
          "b": {
            "text": "😮‍💨 숨"
          }
        },
        {
          "a": {
            "text": "🏞️ 강"
          },
          "b": {
            "text": "⚽ 공"
          }
        },
        {
          "a": {
            "text": "🐴 말"
          },
          "b": {
            "text": "💧 물"
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
      "title": "두 낱말 다 읽기",
      "content": "변신 낱말을 발표할 때는 바꾸기 전 낱말과 바꾼 낱말을 둘 다 읽게 하세요. 비교가 살아 있어야 해요.",
      "fit_slides": [
        "question",
        "card_quiz"
      ]
    },
    {
      "id": "e_chain",
      "type": "extension",
      "icon": "⬆",
      "title": "변신 이어 가기",
      "content": "익숙해진 아이에겐 ‘말→물→불→붓’처럼 변신을 이어 가게 하면 낱자 감각이 한 단계 자라요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘의 변신 낱말",
      "content": "“오늘 만난 변신 낱말 짝을 하나 말해 볼까요?” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "정리 준비",
      "content": "“이 단원에서 배운 것을 두 가지로 말하면?(받침 글자 쓰기·여러 낱말 읽기)” 정리 차시를 예고해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l12"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 12,
    "title": "배운 내용을 정리해요",
    "std": "[2국04-01] · [2국03-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 두 갈래 정리 → 받침 골라 낱말 완성 → 자음자와 흉내 내는 말 잇기 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "배운 내용을 정리해요",
        "subtitle": "3단원 · 12/13차시 · 단원 마무리"
      },
      "suggested_extras": [
        "q_open",
        "t_recap"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "이 단원에서 배운 것을 돌아봐요",
          "받침을 골라 넣어 낱말을 완성해요",
          "자음자와 흉내 내는 말을 짝지어요"
        ]
      },
      "suggested_extras": [
        "t_recap"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "우리가 걸어온 길 🚶",
        "visual": "🗺️",
        "question": "받침 빠진 쪽지에서 시작해 여기까지 왔어요.<br>이 단원에서 배운 것을 떠올려 볼까요?",
        "img": "assets/photo/korean/word_review.jpg"
      },
      "suggested_extras": [
        "q_back",
        "r_growth"
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
            "q": "'곰'에서 ㄱ을 ㅂ으로 바꾸면?",
            "a": "봄"
          },
          {
            "q": "낱자 하나가 바뀌면?",
            "a": "뜻이 바뀌어요"
          }
        ],
        "from": "u3_l11"
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
        "title": "두 갈래로 정리해요",
        "content": "이 단원에서 우리는 **받침 있는 글자 쓰기**와 **여러 가지 낱말 읽기**를 배웠어요. 받침을 골라 낱말을 완성하며 정리해요!",
        "symbol_meanings": [
          {
            "symbol": "수바 + ㄱ = 수박",
            "meaning": "받침 ㄱ을 골라 넣어요"
          },
          {
            "symbol": "차 + ㅇ → 창문",
            "meaning": "받침 ㅇ을 골라 넣어요"
          },
          {
            "symbol": "연피 + ㄹ = 연필",
            "meaning": "받침 ㄹ을 골라 넣어요"
          },
          {
            "symbol": "저 + ㅂ → 접시",
            "meaning": "받침 ㅂ을 골라 넣어요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_forget"
      ],
      "tnote": {
        "ask": [
          "이 단원에서 무엇을 할 수 있게 되었니?"
        ],
        "watch": "받침 쓰기·낱말 읽기 종합 정리",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "받침을 골라 낱말 완성! 🧺",
        "sub": "보기 ㄱ·ㄹ·ㅂ·ㅇ에서 알맞은 받침을 골라 낱말을 완성해요. 카드를 누르면 답이 나와요!",
        "cards": [
          {
            "clue": "받침 ㄱ을 넣어요<br>달콤한 여름 과일",
            "emoji": "🍉",
            "name": "수박"
          },
          {
            "clue": "받침 ㅇ을 넣어요<br>교실에서 밖이 보이는 곳",
            "emoji": "🪟",
            "name": "창문"
          },
          {
            "clue": "받침 ㄹ을 넣어요<br>글씨를 쓰는 도구",
            "emoji": "✏️",
            "name": "연필"
          },
          {
            "clue": "받침 ㅂ을 넣어요<br>음식을 담는 것",
            "emoji": "🍽️",
            "name": "접시"
          }
        ],
        "outro": "보기에서 받침을 골라 낱말 네 개를 모두 완성했어요. 받침 글자 쓰기, 이제 자신 있죠? 😊"
      },
      "suggested_extras": [
        "q_which",
        "g_recap"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "자음자와 흉내 내는 말을 이어요",
        "question": "쌍둥이 자음자와 그 자음자가 들어간 흉내 내는 말을 짝지어 말해 봐요.",
        "items": [
          "ㄲ과 짝이 되는 말은? (깡충깡충)",
          "ㄸ과 짝이 되는 말은? (뒤뚱뒤뚱)",
          "ㅆ은 쌩쌩, 그럼 ㅉ은? (쨍쨍)"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_link"
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
            "q": "받침을 골라 완성한 낱말 '수박·창문'을 읽어 볼까요?",
            "a": "수박·창문"
          },
          "쓰기": {
            "q": "'차'에 받침 ㅇ을 넣어 '창'을 써 볼까요?",
            "a": "창",
            "steps": [
              "차＋ㅇ＝창"
            ]
          },
          "말하기": {
            "q": "이 단원에서 배운 것을 한 가지 말해 봐요.",
            "a": "여러 답 (예: 받침 넣어 낱말 완성)",
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
        "title": "받침 골라 낱말 완성 짝 놀이",
        "type": "pair",
        "goal": "알맞은 받침을 골라 낱말을 완성해요",
        "body": "짝과 보기 받침(ㄱ·ㄹ·ㅂ·ㅇ) 중 알맞은 것을 골라 낱말을 완성하고 서로 읽어 줘요.",
        "materials": [
          "낱말 카드",
          "받침 카드"
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
            "q": "'수바'에 받침 ㄱ을 넣으면?",
            "a": "수박"
          },
          {
            "q": "차＋ㅇ은 무슨 글자일까요?",
            "a": "창"
          },
          {
            "q": "이 단원에서 배운 두 가지는?",
            "a": "받침 쓰기와 낱말 읽기"
          }
        ],
        "self": [
          "배운 내용을 정리했어요",
          "조금 헷갈려요",
          "다시 정리하고 싶어요"
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
          "받침을 골라 넣어 낱말을 완성했어요",
          "자음자와 흉내 내는 말을 짝지었어요",
          "단원에서 배운 두 갈래를 정리했어요"
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
        "preview": "기초를 다지고 스스로 돌아봐요",
        "body": "다음 시간은 이 단원의 마지막! 글자를 골라 낱말을 만들고, 내가 얼마나 자랐는지 스스로 돌아볼 거예요!"
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
      "title": "첫 시간 떠올리기",
      "content": "“첫 시간에 아기 곰이 받침을 빼고 쓴 낱말, 기억나요?(수바)” 도입 장면으로 단원을 돌아보기 시작해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_recap",
      "type": "tip",
      "icon": "🧩",
      "title": "정리는 아이 입으로",
      "content": "교사가 요약해 주기보다 “무엇을 배웠죠?” 묻고 아이 입으로 말하게 하세요. 스스로 정리해야 남아요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_back",
      "type": "fun_question",
      "icon": "🗺️",
      "title": "기억에 남는 활동",
      "content": "“이 단원에서 가장 재미있던 활동은 무엇이었나요?” 배움의 길을 함께 되짚어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_growth",
      "type": "real_world",
      "icon": "🌍",
      "title": "처음과 지금",
      "content": "단원 처음에 쓴 낱말과 지금 쓴 낱말을 비교해 보여 주면 아이 스스로 자란 것을 눈으로 확인해요.",
      "fit_slides": [
        "motivate",
        "summary"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "보기를 먼저 읽기",
      "content": "받침 고르기 전에 보기 ㄱ·ㄹ·ㅂ·ㅇ을 다 같이 소리 내어 읽어 두세요. 고를 때 훨씬 수월해요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_forget",
      "type": "misconception",
      "icon": "❓",
      "title": "아무 받침이나 넣기",
      "content": "받침을 아무거나 골라 넣는 아이가 있어요. 낱말을 소리 내어 읽으며 맞는 받침인지 확인하게 해 주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_which",
      "type": "fun_question",
      "icon": "💡",
      "title": "남은 받침은",
      "content": "“네 낱말을 완성하고 나면 보기의 받침이 다 쓰였나요?” 보기와 답을 맞대어 확인하게 해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_recap",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "받침 ↔ 낱말 정리 짝짓기",
      "description": "보기의 받침과 그 받침이 들어가는 낱말을 짝지어 보세요.",
      "hint": "낱말을 읽으며 어떤 받침이 필요한지 생각해요.",
      "pairs": [
        {
          "a": {
            "text": "ㄱ"
          },
          "b": {
            "text": "🍉 수박"
          }
        },
        {
          "a": {
            "text": "ㅇ"
          },
          "b": {
            "text": "🪟 창문"
          }
        },
        {
          "a": {
            "text": "ㄹ"
          },
          "b": {
            "text": "✏️ 연필"
          }
        },
        {
          "a": {
            "text": "ㅂ"
          },
          "b": {
            "text": "🍽️ 접시"
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
      "title": "자음자 먼저 읽기",
      "content": "잇기 전에 ㄲ·ㄸ·ㅆ·ㅉ를 먼저 읽고, 흉내 내는 말을 읽으며 같은 자음자를 찾게 하면 잇기가 정확해져요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_link",
      "type": "extension",
      "icon": "⬆",
      "title": "새 짝 만들기",
      "content": "익숙해진 아이에겐 ㄲ·ㄸ·ㅃ·ㅆ·ㅉ가 들어간 다른 흉내 내는 말(쑥쑥·빵빵)을 찾아 새 짝을 만들게 해요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "두 갈래 말하기",
      "content": "“이 단원의 두 갈래를 말해 볼까요?(받침 글자 쓰기·여러 낱말 읽기)” 물으며 정리를 마쳐요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "마지막 시간 예고",
      "content": "“다음 시간엔 글자 상자에서 글자를 골라 낱말을 만들 거예요. 어떤 낱말이 나올까요?” 기대를 심어요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u3_l13"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 3,
    "n": 13,
    "title": "기초를 다지고 스스로 돌아봐요",
    "std": "[2국03-01] · [2국02-01]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 글자 상자 → 글자 골라 낱말 만들기·글씨 바르게 → 초성 퀴즈 → 자기 돌아보기 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "기초를 다지고 스스로 돌아봐요",
        "subtitle": "3단원 · 13/13차시 · 단원 마무리"
      },
      "suggested_extras": [
        "q_open",
        "t_base"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "글자를 골라 낱말을 만들어요",
          "받침 낱말을 바르게 따라 써요",
          "이 단원에서 자란 나를 스스로 돌아봐요"
        ]
      },
      "suggested_extras": [
        "t_base"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "글자 상자를 열어요 📦",
        "visual": "📦",
        "question": "상자 안에 색·종·이·하·늘·여·름 글자가 들어 있어요.<br>글자를 골라 어떤 낱말을 만들 수 있을까요?",
        "img": "assets/photo/korean/word_finish.jpg"
      },
      "suggested_extras": [
        "q_box",
        "r_write"
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
            "q": "'수바'에 받침 ㄱ을 넣으면?",
            "a": "수박"
          },
          {
            "q": "차＋ㅇ은 무슨 글자?",
            "a": "창"
          }
        ],
        "from": "u3_l12"
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
        "title": "글자를 모아 낱말을, 글씨는 바르게",
        "content": "상자 속 글자를 골라 모으면 낱말이 돼요. 만든 낱말은 **글자의 짜임을 생각하며 바르게** 써야 해요!",
        "symbol_meanings": [
          {
            "symbol": "색 + 종 + 이 = 색종이",
            "meaning": "세 글자를 골라 모았어요"
          },
          {
            "symbol": "하 + 늘 = 하늘",
            "meaning": "받침 ㄹ이 있는 낱말이에요"
          },
          {
            "symbol": "여 + 름 = 여름",
            "meaning": "받침 ㅁ이 있는 낱말이에요"
          },
          {
            "symbol": "바르게 쓰기",
            "meaning": "농구공·언덕·빨래를 또박또박 따라 써요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_rush"
      ],
      "tnote": {
        "ask": [
          "글자를 모으면 어떤 낱말을 만들 수 있을까?"
        ],
        "watch": "글자 모으기·바른 글씨 종합 성찰",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "chosung_quiz",
      "data": {
        "title": "마지막 초성 퀴즈 🏆",
        "sub": "이 단원에서 배운 낱말로 마지막 퀴즈! 초성을 보고 낱말을 맞혀요. [정답 보기]로 확인해요",
        "items": [
          {
            "chosung": "ㅅ ㅈ ㅇ",
            "answer": "색종이",
            "emoji": "🎨",
            "hint": "접고 오리며 노는 알록달록한 것! 받침 ㄱ·ㅇ"
          },
          {
            "chosung": "ㅎ ㄴ",
            "answer": "하늘",
            "emoji": "☁️",
            "hint": "구름이 떠 있는 곳! 받침 ㄹ"
          },
          {
            "chosung": "ㄴ ㄱ ㄱ",
            "answer": "농구공",
            "emoji": "🏀",
            "hint": "골대에 던지는 공! 받침 ㅇ·ㅇ"
          },
          {
            "chosung": "ㄸ ㄱ",
            "answer": "딸기",
            "emoji": "🍓",
            "hint": "ㄸ이 들어간 빨간 과일!"
          }
        ]
      },
      "suggested_extras": [
        "q_common",
        "g_final"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "나를 돌아보며 발표해요 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 이 단원에서 잘하게 된 것 한 가지를 말해요. 친구와 비교하지 않아도 돼요!",
        "count": 24,
        "hint": "“받침을 빼먹지 않고 쓰게 됐어요” 처럼 말해 봐요",
        "end_msg": "모두 자기만의 속도로 자랐어요. 3단원을 끝까지 해낸 우리 반, 정말 멋져요! 🎉"
      },
      "suggested_extras": [
        "t_present",
        "e_self"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "기초 다지고 스스로 돌아보기",
        "levels": {
          "읽기": {
            "q": "글자를 모아 만든 낱말 '색종이·하늘'을 읽어 볼까요?",
            "a": "색종이·하늘"
          },
          "쓰기": {
            "q": "'하'와 '늘'을 모아 '하늘'을 바르게 써 볼까요?",
            "a": "하늘",
            "steps": [
              "느＋ㄹ＝늘 → 하늘"
            ]
          },
          "말하기": {
            "q": "이 단원에서 가장 잘하게 된 것을 말해 봐요.",
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
        "title": "글자 모아 낱말 만들기 짝 대결",
        "type": "pair",
        "goal": "상자 속 글자를 모아 낱말을 많이 만들어요",
        "body": "짝과 글자 카드를 골라 모아 낱말을 만들고 또박또박 읽어요. 더 많이 만든 사람을 서로 칭찬해요.",
        "materials": [
          "글자 카드"
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
            "q": "'색'·'종'·'이'를 모으면?",
            "a": "색종이"
          },
          {
            "q": "만든 낱말은 어떻게 써야 할까요?",
            "a": "짜임을 생각하며 바르게"
          },
          {
            "q": "이 단원에서 무엇이 즐거웠나요?",
            "a": "여러 답"
          }
        ],
        "self": [
          "글자를 모아 낱말을 바르게 써요",
          "조금 헷갈려요",
          "다시 해 보고 싶어요"
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
        "title": "3단원에서 배운 것",
        "points": [
          "받침이 있는 글자를 바르게 쓰게 됐어요",
          "ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 낱말을 자신 있게 읽게 됐어요",
          "낱말을 읽고 쓰는 즐거움을 알게 됐어요"
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
        "title": "다음 단원 예고",
        "preview": "4단원 — 여러 가지 낱말을 익혀요",
        "body": "다음 단원에서는 몸·가족·학교·이웃처럼 여러 주제의 낱말을 만나요. 낱말 친구가 더 많아질 거예요!"
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
      "title": "마지막 시간의 마음",
      "content": "“오늘은 3단원 마지막 시간이에요. 처음보다 잘하게 된 게 있나요?” 물으며 돌아보기의 문을 열어요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_base",
      "type": "tip",
      "icon": "🧩",
      "title": "기초 다지기의 뜻",
      "content": "기초 다지기는 시험이 아니라 배운 것을 한 번 더 단단히 하는 시간이에요. 편안한 분위기로 진행해 주세요.",
      "fit_slides": [
        "objective",
        "chosung_quiz"
      ]
    },
    {
      "id": "q_box",
      "type": "fun_question",
      "icon": "📦",
      "title": "몇 개나 만들까",
      "content": "“상자 속 글자로 낱말을 몇 개나 만들 수 있을까요?(색종이·하늘·여름·색…)” 조합의 재미를 끌어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_write",
      "type": "real_world",
      "icon": "🌍",
      "title": "바른 글씨의 힘",
      "content": "바르게 쓴 글씨는 누가 봐도 읽기 쉬워요. 내 글씨를 받는 사람을 생각하며 쓰는 마음을 이어 주세요.",
      "fit_slides": [
        "motivate",
        "present"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "따라 쓰기 묶음",
      "content": "농구공·언덕·빨래는 받침과 쌍둥이 자음자가 골고루 든 묶음이에요. 짜임을 말하며 따라 쓰게 해 주세요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "x_rush",
      "type": "misconception",
      "icon": "❓",
      "title": "빨리 쓰면 끝?",
      "content": "빨리 쓰는 게 잘 쓰는 거라 여기는 아이가 있어요. 한 글자씩 짜임을 생각하며 쓰는 게 먼저임을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "q_common",
      "type": "fun_question",
      "icon": "💡",
      "title": "공통 자음자 찾기",
      "content": "“찐빵·짜장면·팔찌에 똑같이 들어 있는 자음자는?(ㅉ)” 보너스 문제로 된소리 감각을 한 번 더 깨워요.",
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "g_final",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "단원 총정리 짝짓기",
      "description": "이 단원에서 배운 낱말과 들어 있는 자음자·받침을 짝지어 보세요.",
      "hint": "낱말을 또박또박 읽으며 짝을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "🍓 딸기"
          },
          "b": {
            "text": "ㄸ"
          }
        },
        {
          "a": {
            "text": "🏀 농구공"
          },
          "b": {
            "text": "받침 ㅇ"
          }
        },
        {
          "a": {
            "text": "☁️ 하늘"
          },
          "b": {
            "text": "받침 ㄹ"
          }
        },
        {
          "a": {
            "text": "🎨 색종이"
          },
          "b": {
            "text": "받침 ㄱ"
          }
        }
      ],
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "비교 없는 돌아보기",
      "content": "돌아보기 발표는 친구와 비교하지 않게 해 주세요. ‘처음의 나’와 ‘지금의 나’를 비교하는 게 핵심이에요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_self",
      "type": "extension",
      "icon": "⬆",
      "title": "세 가지 스스로 점검",
      "content": "받침 글자를 쓴다 / 받침 글자를 읽는다 / 여러 자음자 낱말을 읽는다 — 세 가지를 스스로 점검하게 해요.",
      "fit_slides": [
        "present",
        "summary"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "즐거움 한 마디",
      "content": "“낱말을 읽고 쓰는 게 즐거웠던 순간은 언제였나요?” 단원 학습 목표를 마음으로 마무리해요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "4단원 잇기",
      "content": "“우리 몸에도 받침 낱말이 있을까요?(손·발·눈)” 다음 단원 주제 낱말을 한 발 먼저 맛보게 해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

