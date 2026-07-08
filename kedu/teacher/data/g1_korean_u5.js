/* ============================================================
   1학년 1학기 국어 — 5단원 「반갑게 인사해요」 (케이티처)
   양산 영역 — LESSONS["u5_l{NN}"] 누적 / 다른 단원·과목 .js = read-only
   g1_korean.html이 자동 로드 후 LESSONS 에 누적.
   ------------------------------------------------------------
   ★ 케이티처 = 교사 주도 수업 도구. 로깅 없음(수업 진행용).
   ★ 트랙 = 듣기·말하기(인사말) + 문학(동시 낭송) + 문법(연음) 통합.
     1~4단원 한글 해득·어휘 위에서 낱말을 사람 사이에서 주고받는 단원.
     소단원1(l02~l04)=상황·상대에 알맞은 인사말, 소단원2(l05~l08)=동시 낭송
     +연음(글자≠소리), 실천(l09·l10)=인사 놀이, 마무리(l11·l12).
   ★ 연음 = 받침이 뒤 글자 'ㅇ' 자리로 넘어가 소리 나는 현상에 한정
     (걸음[거름]·국어[구거]·악어[아거]·음악[으막]).
   ★ 저작권: 그림책·동시·노래 본문·삽화·작가·고유 인물명 일절 미게재.
     "여러 대상에게 잘 자요 인사" 구조 등 활동 의도만 차용, 예시는 보편어
     자체 구성. read_aloud는 작품 비특정 + 교사 진행 안내만.
   ------------------------------------------------------------
   차시 구성(12차시):
   l01 단원 도입 · l02 알맞은 인사말 알기(친구↔웃어른)
   l03 상황에 알맞은 인사말 · l04 역할놀이로 인사하기
   l05 동시 듣고 내용 알기 · l06 동시 따라 읽고 나만의 인사
   l07 글자와 소리가 다른 낱말 · l08 자연스럽게 이어 읽기
   l09 여러 상황의 인사말(실천) · l10 인사 놀이(실천)
   l11 배운 내용 정리 · l12 기초 다지기와 자기 평가
   ============================================================ */

/* ===== l01 단원 도입 — 배울 내용을 살펴봐요 ===== */
LESSONS["u5_l01"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 1,
    "title": "배울 내용을 살펴봐요",
    "std": "[2국01-05]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 아침 등굣길 인사 장면 → 인사가 주는 힘 → 기본 인사말 카드 → 인사 경험 나누기 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "배울 내용을 살펴봐요",
        "subtitle": "5단원 · 1/12차시 · 단원 도입"
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
          "인사를 하면 좋은 점을 이야기해요",
          "우리가 아는 인사말을 떠올려 봐요"
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
        "scene_title": "아침 등굣길에서 🌞",
        "visual": "🌞",
        "question": "아침에 학교 오는 길, 누구를 만났나요?<br>만난 사람에게 어떤 인사를 했나요?",
        "img": "assets/photo/korean/greeting_intro.jpg"
      },
      "suggested_extras": [
        "q_morning",
        "r_life"
      ]
    },
    {
      "id": "s04",
      "stage": "만나기",
      "block": "concept",
      "data": {
        "title": "인사는 마음을 여는 문",
        "content": "인사를 하면 서로 **기분이 좋아지고 마음이 가까워져요**. 이 단원에서는 알맞은 인사말, 인사가 담긴 시, 낱말을 바르게 읽는 법을 배워요!",
        "symbol_meanings": [
          {
            "symbol": "알맞은 인사말",
            "meaning": "누구에게·언제 어떤 인사를 할지 배워요"
          },
          {
            "symbol": "인사가 담긴 시",
            "meaning": "저녁 인사가 나오는 시를 따라 읽어요"
          },
          {
            "symbol": "바르게 읽기",
            "meaning": "글자와 소리가 다른 낱말을 읽어요"
          },
          {
            "symbol": "바른 자세와 표정",
            "meaning": "인사는 말과 마음을 함께 전해요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_word"
      ],
      "tnote": {
        "ask": [
          "오늘 아침 누구에게 인사했니?"
        ],
        "watch": "인사 경험으로 단원 열기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "우리가 아는 인사말 🎴",
        "sub": "이럴 때 어떤 인사를 할까요? 카드를 누르면 인사말이 나와요. 다 같이 큰 소리로 말해 봐요!",
        "cards": [
          {
            "clue": "아침에 친구를 만났어요<br>반갑게 손을 흔들며?",
            "emoji": "👋",
            "name": "안녕"
          },
          {
            "clue": "아침에 선생님을 만났어요<br>고개를 숙이며 공손하게?",
            "emoji": "🙇",
            "name": "안녕하세요"
          },
          {
            "clue": "집을 나서며 엄마 아빠께?",
            "emoji": "🏠",
            "name": "다녀오겠습니다"
          },
          {
            "clue": "맛있는 밥을 먹기 전에?",
            "emoji": "🍚",
            "name": "잘 먹겠습니다"
          }
        ],
        "outro": "우리는 벌써 인사말을 많이 알고 있네요! 이 단원에서 더 멋진 인사 친구가 되어 봐요 😊"
      },
      "suggested_extras": [
        "q_know",
        "g_greet"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "인사를 하면 좋은 점",
        "question": "인사를 주고받았을 때 기분이 어땠는지 이야기해 봐요.",
        "items": [
          "인사를 받았을 때 기분이 어땠나요?",
          "인사를 안 받아 주면 어떤 마음이 들까요?",
          "이 단원에서 배우고 싶은 인사말이 있나요?"
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
        "title": "우리가 아는 인사말을 떠올려요",
        "levels": {
          "읽기": {
            "q": "인사말 '안녕·고마워'를 또박또박 읽어 볼까요?",
            "a": "안녕·고마워"
          },
          "쓰기": {
            "q": "친구를 만나 반갑게 하는 인사 '안녕'을 따라 써 볼까요?",
            "a": "안녕"
          },
          "말하기": {
            "q": "인사를 하면 무엇이 좋은지 말해 봐요.",
            "a": "여러 답 (예: 서로 기분이 좋아지고 마음이 가까워져요)",
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
        "title": "인사말 주고받기 짝 놀이",
        "type": "pair",
        "goal": "상황을 듣고 알맞은 인사말을 해요",
        "body": "한 사람이 상황(친구를 만났을 때 등)을 말하면 짝이 알맞은 인사말로 답해요. 번갈아 가며 해요.",
        "materials": [
          "상황 그림 카드"
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
            "q": "인사를 하면 서로 무엇이 좋아지나요?",
            "a": "기분·마음"
          },
          {
            "q": "친구를 만나 반갑게 하는 인사는?",
            "a": "안녕"
          },
          {
            "q": "이 단원에서 배울 세 갈래는?",
            "a": "인사말·인사가 담긴 시·바르게 읽기"
          }
        ],
        "self": [
          "인사가 좋은 점을 알아요",
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
          "인사를 하면 마음이 가까워짐을 알았어요",
          "우리가 아는 인사말을 떠올려 말했어요",
          "이 단원에서 배울 세 가지를 살펴봤어요"
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
        "preview": "알맞은 인사말을 알아봐요",
        "body": "다음 시간에는 친구에게 하는 인사와 웃어른께 하는 인사가 어떻게 다른지 알아볼 거예요!"
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
      "title": "오늘 한 인사",
      "content": "“오늘 아침 교실에 들어오며 누구에게 인사했나요?” 가볍게 물으며 인사 경험으로 시작해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_goal",
      "type": "tip",
      "icon": "🧩",
      "title": "세 갈래 미리 보기",
      "content": "이 단원은 인사말·동시·바르게 읽기 세 갈래예요. 도입에선 호기심만 심어도 충분해요.",
      "fit_slides": [
        "objective",
        "cover"
      ]
    },
    {
      "id": "q_morning",
      "type": "fun_question",
      "icon": "🌞",
      "title": "등굣길 떠올리기",
      "content": "“교문 앞에서, 복도에서, 교실에서… 어디에서 누구를 만났죠?” 장소를 짚으며 인사 장면을 떠올리게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_life",
      "type": "real_world",
      "icon": "🌍",
      "title": "인사가 오가는 곳",
      "content": "가게·아파트 승강기·놀이터처럼 인사가 오가는 생활 장면을 이야기하면 배움이 삶과 이어져요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "몸으로 함께",
      "content": "인사말을 말할 때 손 흔들기·고개 숙이기 같은 몸짓을 함께하게 하세요. 말과 몸이 같이 배워져요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_word",
      "type": "misconception",
      "icon": "❓",
      "title": "인사는 말만?",
      "content": "인사를 말로만 여기는 아이가 있어요. 표정·자세·마음가짐이 함께여야 인사가 완성됨을 짚어 주세요.",
      "fit_slides": [
        "concept"
      ]
    },
    {
      "id": "q_know",
      "type": "fun_question",
      "icon": "💡",
      "title": "또 아는 인사말",
      "content": "“카드에 없는 인사말도 알고 있나요?(고맙습니다·미안해)” 아이들의 인사말 곳간을 열어 봐요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_greet",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "상황 ↔ 인사말 짝짓기",
      "description": "상황과 알맞은 인사말을 짝지어 보세요.",
      "hint": "누구에게, 언제 하는 인사인지 생각해요.",
      "pairs": [
        {
          "a": {
            "text": "👋 친구를 만나면"
          },
          "b": {
            "text": "안녕"
          }
        },
        {
          "a": {
            "text": "🙇 선생님을 만나면"
          },
          "b": {
            "text": "안녕하세요"
          }
        },
        {
          "a": {
            "text": "🏠 집을 나서며"
          },
          "b": {
            "text": "다녀오겠습니다"
          }
        },
        {
          "a": {
            "text": "🍚 밥 먹기 전에"
          },
          "b": {
            "text": "잘 먹겠습니다"
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
      "title": "기분 말로 표현",
      "content": "“기분이 좋았어요”에서 멈추지 말고 “마음이 따뜻해졌어요”처럼 여러 말로 표현하게 도와주세요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_goal",
      "type": "extension",
      "icon": "⬆",
      "title": "인사 다짐 한 줄",
      "content": "‘하루에 인사 다섯 번 하기’처럼 단원 다짐을 정해 두면 마무리 차시에서 돌아볼 수 있어요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘의 인사말",
      "content": "“오늘 함께 말해 본 인사말 네 가지를 기억하나요?” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "두 인사 비교 예고",
      "content": "“친구에게 ‘안녕하세요’라고 하면 어떨까요?” 살짝 묻고 답은 다음 시간으로 남겨 두세요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l02"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 2,
    "title": "알맞은 인사말을 알아요",
    "std": "[2국01-02]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 친구와 웃어른 → 상대에 따라 다른 인사말 → 인사말 고르기 카드 → 어른/친구 구분 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "알맞은 인사말을 알아요",
        "subtitle": "5단원 · 2/12차시 · 다정하게 인사하기"
      },
      "suggested_extras": [
        "q_open",
        "t_two"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "친구에게 하는 인사말을 알아봐요",
          "웃어른께 하는 인사말을 알아봐요",
          "상대에 알맞은 인사말을 골라 말해요"
        ]
      },
      "suggested_extras": [
        "t_two"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "누구에게 하는 인사일까요? 🤔",
        "visual": "🤔",
        "question": "같은 아침인데 친구에게는 ‘안녕’,<br>선생님께는 ‘안녕하세요’라고 해요. 왜 다를까요?",
        "img": "assets/photo/korean/greeting_who.jpg"
      },
      "suggested_extras": [
        "q_why",
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
            "q": "인사를 하면 서로 무엇이 좋아지나요?",
            "a": "기분·마음"
          },
          {
            "q": "친구를 만나 반갑게 하는 인사는?",
            "a": "안녕"
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
        "title": "상대에 따라 인사말이 달라요",
        "content": "**친구나 동생**에게는 짧고 다정하게, **웃어른**께는 공손한 말과 바른 자세로 인사해요. 상대를 생각하는 마음이 담겨 있어요!",
        "symbol_meanings": [
          {
            "symbol": "안녕 ↔ 안녕하세요",
            "meaning": "만났을 때 — 친구 ↔ 웃어른"
          },
          {
            "symbol": "잘 가 ↔ 안녕히 가세요",
            "meaning": "헤어질 때 — 친구 ↔ 웃어른"
          },
          {
            "symbol": "고마워 ↔ 고맙습니다",
            "meaning": "고마울 때 — 친구 ↔ 웃어른"
          },
          {
            "symbol": "바른 자세",
            "meaning": "웃어른께는 고개를 숙여 공손하게"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_same"
      ],
      "tnote": {
        "ask": [
          "이 인사는 누구에게 하는 걸까?"
        ],
        "watch": "상대↔인사말 연결",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "알맞은 인사말 고르기 🎴",
        "sub": "누구에게 하는 인사인지 생각하며 알맞은 인사말을 골라요. 카드를 누르면 답이 나와요!",
        "cards": [
          {
            "clue": "아침에 할머니를 만났어요<br>공손하게 뭐라고 할까요?",
            "emoji": "👵",
            "name": "안녕하세요"
          },
          {
            "clue": "학교 끝나고 친구와 헤어져요<br>손 흔들며 뭐라고 할까요?",
            "emoji": "👋",
            "name": "잘 가"
          },
          {
            "clue": "이웃 어른께서 길을 알려 주셨어요<br>뭐라고 할까요?",
            "emoji": "🙇",
            "name": "고맙습니다"
          },
          {
            "clue": "저녁에 잠자리에 들며 부모님께?",
            "emoji": "🌙",
            "name": "안녕히 주무세요"
          }
        ],
        "outro": "상대를 생각하며 인사말을 고르니 마음까지 잘 전해지겠죠? 😊"
      },
      "suggested_extras": [
        "q_pick",
        "g_pair"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "친구 인사? 웃어른 인사?",
        "question": "다음 인사말은 친구에게 하는 말일까요, 웃어른께 하는 말일까요?",
        "items": [
          "‘다녀오겠습니다’는? (웃어른)",
          "‘또 보자’는? (친구)",
          "‘안녕히 계세요’는? (웃어른)"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_polite"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "상대에 알맞은 인사말 고르기",
        "levels": {
          "읽기": {
            "q": "인사말 '안녕·안녕하세요'를 읽어 볼까요?",
            "a": "안녕·안녕하세요"
          },
          "쓰기": {
            "q": "웃어른을 만나 공손하게 하는 인사 '안녕하세요'를 써 볼까요?",
            "a": "안녕하세요"
          },
          "말하기": {
            "q": "친구에게 하는 인사와 웃어른께 하는 인사가 어떻게 다른지 말해 봐요.",
            "a": "여러 답 (예: 웃어른께는 높임말로 공손하게 해요)",
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
        "title": "상대 맞춰 인사하기 짝 놀이",
        "type": "pair",
        "goal": "상대에 알맞은 인사말을 골라요",
        "body": "한 사람이 상대(친구·선생님·할머니)를 말하면 짝이 알맞은 인사말로 인사해요. 역할을 바꿔 가며 해요.",
        "materials": [
          "인물 그림 카드"
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
            "q": "웃어른을 만나 공손하게 하는 인사는?",
            "a": "안녕하세요"
          },
          {
            "q": "친구를 만나 반갑게 하는 인사는?",
            "a": "안녕"
          },
          {
            "q": "인사말은 무엇에 따라 달라지나요?",
            "a": "상대(누구에게)"
          }
        ],
        "self": [
          "상대에 알맞은 인사말을 골라요",
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
          "상대에 따라 인사말이 달라짐을 알았어요",
          "친구와 웃어른께 하는 인사말을 구분했어요",
          "공손한 자세로 인사하는 법을 배웠어요"
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
        "preview": "상황에 알맞은 인사말을 배워요",
        "body": "다음 시간에는 고마울 때, 미안할 때, 축하할 때처럼 상황에 따라 달라지는 인사말을 배울 거예요!"
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
      "title": "두 인사 들어 보기",
      "content": "“선생님이 ‘안녕’과 ‘안녕하세요’를 차례로 말할게요. 느낌이 어떻게 다른가요?” 듣기 비교로 시작해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_two",
      "type": "tip",
      "icon": "🧩",
      "title": "짝으로 가르치기",
      "content": "인사말은 ‘안녕↔안녕하세요’처럼 친구용·웃어른용을 꼭 짝으로 제시하세요. 비교 속에서 차이가 보여요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_why",
      "type": "fun_question",
      "icon": "🤔",
      "title": "왜 다르게 말할까",
      "content": "“친구에게 ‘안녕히 가세요’라고 하면 어떨까요?” 거꾸로 써 보며 알맞음의 느낌을 깨닫게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_family",
      "type": "real_world",
      "icon": "🌍",
      "title": "집에서 하는 인사",
      "content": "다녀오겠습니다·다녀왔습니다·안녕히 주무세요처럼 집에서 매일 쓰는 인사를 떠올리게 하면 바로 실천으로 이어져요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "자세까지 한 묶음",
      "content": "웃어른 인사말을 연습할 때는 고개 숙이기까지 함께 하게 하세요. 말과 자세가 한 묶음이에요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_same",
      "type": "misconception",
      "icon": "❓",
      "title": "아무에게나 같은 인사",
      "content": "모든 사람에게 ‘안녕’만 쓰는 아이가 있어요. 틀렸다고 하기보다 상대의 마음을 생각해 보게 이끌어 주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_pick",
      "type": "fun_question",
      "icon": "💡",
      "title": "까닭 묻기",
      "content": "“왜 ‘안녕하세요’를 골랐나요?” 고른 까닭(웃어른이라서)을 말하게 하면 기준이 또렷해져요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_pair",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "친구 인사 ↔ 웃어른 인사",
      "description": "같은 상황의 친구 인사말과 웃어른 인사말을 짝지어 보세요.",
      "hint": "만났을 때·헤어질 때·고마울 때를 생각해요.",
      "pairs": [
        {
          "a": {
            "text": "안녕"
          },
          "b": {
            "text": "안녕하세요"
          }
        },
        {
          "a": {
            "text": "잘 가"
          },
          "b": {
            "text": "안녕히 가세요"
          }
        },
        {
          "a": {
            "text": "고마워"
          },
          "b": {
            "text": "고맙습니다"
          }
        },
        {
          "a": {
            "text": "잘 자"
          },
          "b": {
            "text": "안녕히 주무세요"
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
      "title": "답하고 따라 말하기",
      "content": "구분 발표 후엔 반 전체가 그 인사말을 알맞은 자세와 함께 한 번 따라 말하게 하세요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_polite",
      "type": "extension",
      "icon": "⬆",
      "title": "높임말 한 걸음",
      "content": "익숙해진 아이에겐 ‘밥 → 진지’처럼 웃어른께 쓰는 낱말이 따로 있음을 살짝 소개해도 좋아요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘의 짝 인사",
      "content": "“‘고마워’의 웃어른 인사말은?(고맙습니다)” 짝을 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "상황 인사 예고",
      "content": "“친구 발을 밟았을 때는 뭐라고 할까요?” 상황 인사말을 하나 맛보며 다음 시간을 예고해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l03"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 3,
    "title": "상황에 알맞은 인사말을 해요",
    "std": "[2국01-02]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 어떤 마음일까 → 마음을 전하는 인사말(고마움·미안함·축하) → 상황 인사말 카드 → 마음 담아 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "상황에 알맞은 인사말을 해요",
        "subtitle": "5단원 · 3/12차시 · 다정하게 인사하기"
      },
      "suggested_extras": [
        "q_open",
        "t_heart"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "여러 가지 상황을 살펴봐요",
          "상황에 알맞은 인사말을 골라요",
          "마음을 담아 인사말을 해 봐요"
        ]
      },
      "suggested_extras": [
        "t_heart"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "이럴 때 뭐라고 할까요? 💭",
        "visual": "💭",
        "question": "친구가 떨어뜨린 연필을 주워 줬더니<br>친구 얼굴이 환해졌어요. 친구는 뭐라고 말할까요?",
        "img": "assets/photo/korean/greeting_situation.jpg"
      },
      "suggested_extras": [
        "q_pencil",
        "r_today"
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
            "q": "웃어른을 만나 공손하게 하는 인사는?",
            "a": "안녕하세요"
          },
          {
            "q": "인사말은 무엇에 따라 달라지나요?",
            "a": "상대"
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
        "title": "마음을 전하는 인사말",
        "content": "고마울 때, 미안할 때, 축하할 때… **상황과 마음에 따라** 인사말이 달라져요. 마음을 담아 말해야 진짜 인사예요!",
        "symbol_meanings": [
          {
            "symbol": "고마울 때",
            "meaning": "고마워 · 고맙습니다"
          },
          {
            "symbol": "미안할 때",
            "meaning": "미안해 · 죄송합니다"
          },
          {
            "symbol": "축하할 때",
            "meaning": "축하해 · 축하합니다"
          },
          {
            "symbol": "반가울 때",
            "meaning": "반가워 · 만나서 반갑습니다"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_empty"
      ],
      "tnote": {
        "ask": [
          "이럴 때 어떤 마음을 전하면 좋을까?"
        ],
        "watch": "상황↔마음 인사말",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "상황에 알맞은 인사말 🎴",
        "sub": "어떤 상황인지 살펴보고 알맞은 인사말을 골라요. 카드를 누르면 답이 나와요!",
        "cards": [
          {
            "clue": "친구가 내 지우개를 주워 줬어요<br>뭐라고 말할까요?",
            "emoji": "😊",
            "name": "고마워"
          },
          {
            "clue": "실수로 친구 발을 밟았어요<br>뭐라고 말할까요?",
            "emoji": "😥",
            "name": "미안해"
          },
          {
            "clue": "친구가 달리기에서 일 등을 했어요<br>뭐라고 말할까요?",
            "emoji": "🎉",
            "name": "축하해"
          },
          {
            "clue": "몸이 아픈 친구가 걱정돼요<br>뭐라고 말할까요?",
            "emoji": "🤒",
            "name": "괜찮아?"
          }
        ],
        "outro": "상황을 보고 마음을 읽으니 알맞은 인사말이 떠오르죠? 마음을 담아 말해 봐요 😊"
      },
      "suggested_extras": [
        "q_face",
        "g_situ"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "마음 담아 인사말 발표 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 상황 하나를 고르고 마음을 담아 인사말을 해 봐요!",
        "count": 24,
        "hint": "“친구가 상을 받았을 때 — 축하해!” 처럼 상황과 인사말을 함께 말해요",
        "end_msg": "마음이 담긴 인사말이 교실을 가득 채웠어요. 모두 멋져요! 👏"
      },
      "suggested_extras": [
        "t_present",
        "e_tone"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "마음을 전하는 인사말 하기",
        "levels": {
          "읽기": {
            "q": "마음을 전하는 말 '고마워·미안해'를 읽어 볼까요?",
            "a": "고마워·미안해"
          },
          "쓰기": {
            "q": "도움을 받았을 때 하는 말 '고마워'를 써 볼까요?",
            "a": "고마워"
          },
          "말하기": {
            "q": "축하할 일이 있을 때 어떤 인사를 할지 말해 봐요.",
            "a": "여러 답 (예: 축하해)",
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
        "title": "마음 담아 인사하기 짝 놀이",
        "type": "pair",
        "goal": "상황에 맞는 인사말로 마음을 전해요",
        "body": "한 사람이 상황 카드(도와줬을 때·잘못했을 때·생일)를 보여 주면 짝이 마음을 담아 알맞은 인사를 해요.",
        "materials": [
          "상황 카드"
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
            "q": "도움을 받았을 때 하는 인사는?",
            "a": "고마워(고맙습니다)"
          },
          {
            "q": "잘못했을 때 하는 인사는?",
            "a": "미안해(미안합니다)"
          },
          {
            "q": "인사말은 무엇을 담아 전하나요?",
            "a": "마음"
          }
        ],
        "self": [
          "상황에 맞는 인사말을 해요",
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
          "상황에 따라 인사말이 달라짐을 알았어요",
          "고마움·미안함·축하의 인사말을 골랐어요",
          "마음을 담아 인사말을 해 봤어요"
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
        "preview": "역할놀이로 인사를 주고받아요",
        "body": "다음 시간에는 짝과 역할을 나눠 진짜처럼 인사를 주고받는 역할놀이를 할 거예요!"
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
      "title": "표정 보고 맞히기",
      "content": "“선생님 표정을 보세요. 어떤 인사말이 어울릴까요?” 기쁜 표정·미안한 표정을 지으며 마음 읽기로 시작해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_heart",
      "type": "tip",
      "icon": "🧩",
      "title": "상황 → 마음 → 말",
      "content": "상황을 보고 → 상대의 마음을 읽고 → 알맞은 말을 고르는 순서를 지켜 주세요. 마음 읽기가 가운데 있어요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_pencil",
      "type": "fun_question",
      "icon": "💭",
      "title": "받은 사람 마음",
      "content": "“연필을 주워 준 친구는 어떤 마음일까요? 받은 친구는요?” 양쪽 마음을 모두 짚어 보게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_today",
      "type": "real_world",
      "icon": "🌍",
      "title": "오늘 겪은 상황",
      "content": "오늘 하루 고마웠던 일·미안했던 일을 떠올리게 하면 인사말이 자기 일이 돼요.",
      "fit_slides": [
        "motivate",
        "present"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "표정과 함께",
      "content": "고마울 땐 웃는 얼굴로, 미안할 땐 진지한 얼굴로 — 인사말마다 어울리는 표정을 함께 연습하게 하세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_empty",
      "type": "misconception",
      "icon": "❓",
      "title": "말만 하면 끝?",
      "content": "마음 없이 건성으로 ‘미안해’ 하는 경우가 있어요. 상대 눈을 보고 진심을 담아야 전해짐을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "present"
      ]
    },
    {
      "id": "q_face",
      "type": "fun_question",
      "icon": "💡",
      "title": "이 표정엔 무슨 말",
      "content": "“😥 이 얼굴의 친구에게는 어떤 말이 필요할까요?” 이모지 표정을 보며 마음과 말을 잇게 해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_situ",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "상황 ↔ 인사말 짝짓기",
      "description": "상황과 그때 하는 인사말을 짝지어 보세요.",
      "hint": "상대의 마음이 어떨지 생각하며 짝을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "😊 도움을 받았을 때"
          },
          "b": {
            "text": "고마워"
          }
        },
        {
          "a": {
            "text": "😥 실수했을 때"
          },
          "b": {
            "text": "미안해"
          }
        },
        {
          "a": {
            "text": "🎉 좋은 일이 생겼을 때"
          },
          "b": {
            "text": "축하해"
          }
        },
        {
          "a": {
            "text": "🤒 친구가 아플 때"
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
      "title": "상황부터 말하기",
      "content": "발표 틀을 ‘상황 → 인사말’ 순서로 주세요. 듣는 친구들도 알맞은지 함께 판단할 수 있어요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_tone",
      "type": "extension",
      "icon": "⬆",
      "title": "목소리 바꿔 말하기",
      "content": "같은 ‘미안해’도 작게·진심으로·건성으로 말해 보게 하면, 말투가 마음을 전한다는 걸 느껴요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "세 가지 마음 인사",
      "content": "“고마울 때·미안할 때·축하할 때 인사말을 차례로 말해 볼까요?” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "역할놀이 예고",
      "content": "“내일은 우리가 배우처럼 역할을 맡아요!” 역할놀이를 예고하면 기대가 한껏 올라가요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l04"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 4,
    "title": "역할놀이로 인사를 주고받아요",
    "std": "[2국01-02] · [2국01-05]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 인사는 주고받는 것 → 역할놀이 방법 → 상황별 역할놀이 진행 → 짝 역할놀이 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "역할놀이로 인사를 주고받아요",
        "subtitle": "5단원 · 4/12차시 · 다정하게 인사하기"
      },
      "suggested_extras": [
        "q_open",
        "t_roleplay"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "역할놀이 방법을 알아봐요",
          "짝과 역할을 나눠 인사를 주고받아요",
          "바른 자세와 표정으로 인사해요"
        ]
      },
      "suggested_extras": [
        "t_roleplay"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "인사는 혼자 하는 게 아니에요 🤝",
        "visual": "🤝",
        "question": "“안녕!” 하고 인사했는데 아무 대답이 없다면?<br>인사는 주고받아야 완성돼요!",
        "img": "assets/photo/korean/greeting_roleplay.jpg"
      },
      "suggested_extras": [
        "q_noreply",
        "r_pingpong"
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
            "q": "도움을 받았을 때 하는 인사는?",
            "a": "고마워"
          },
          {
            "q": "인사말은 무엇을 담아 전하나요?",
            "a": "마음"
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
        "title": "역할놀이 하는 방법",
        "content": "역할놀이는 **상황을 정하고 → 역할을 나누고 → 진짜처럼 인사를 주고받는** 놀이예요. 받은 인사에는 알맞게 답해요!",
        "symbol_meanings": [
          {
            "symbol": "① 상황 정하기",
            "meaning": "등굣길·놀이터·가게 같은 상황을 골라요"
          },
          {
            "symbol": "② 역할 나누기",
            "meaning": "누가 어떤 사람이 될지 정해요"
          },
          {
            "symbol": "③ 인사 주고받기",
            "meaning": "바른 자세와 표정으로 말해요"
          },
          {
            "symbol": "④ 역할 바꾸기",
            "meaning": "역할을 바꿔 한 번 더 해요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_oneway"
      ],
      "tnote": {
        "ask": [
          "먼저 인사를 받으면 어떻게 할까?"
        ],
        "watch": "인사=주고받기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "question",
      "data": {
        "title": "역할놀이 상황을 정해요 🎭",
        "question": "짝과 함께 역할놀이를 해요. 어떤 상황으로 할지 정하고 인사를 주고받아요.",
        "items": [
          "등굣길에 이웃 어른을 만난 상황 (안녕하세요 ↔ 그래, 안녕)",
          "친구 생일을 축하하는 상황 (축하해 ↔ 고마워)",
          "실수로 부딪힌 상황 (미안해 ↔ 괜찮아)"
        ]
      },
      "suggested_extras": [
        "q_choose",
        "g_reply"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "역할놀이 발표하기 🎤",
        "sub": "버튼을 누르면 발표할 짝을 뽑아요. 짝과 함께 앞에 나와 역할놀이로 인사를 주고받아요!",
        "count": 24,
        "hint": "상황을 먼저 말하고 시작해요. “등굣길이에요 — 안녕하세요!” “그래, 안녕!”",
        "end_msg": "주고받는 인사가 정말 자연스러웠어요. 모두 멋진 배우였어요! 👏"
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
        "title": "역할을 정해 인사 주고받기",
        "levels": {
          "읽기": {
            "q": "주고받는 인사 '안녕? / 안녕!'을 읽어 볼까요?",
            "a": "안녕? / 안녕!"
          },
          "쓰기": {
            "q": "먼저 인사를 받으면 되돌려 하는 인사 '안녕'을 써 볼까요?",
            "a": "안녕"
          },
          "말하기": {
            "q": "짝과 정할 역할놀이 상황을 하나 말해 봐요.",
            "a": "여러 답 (예: 아침에 교실에서 만났을 때)",
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
        "title": "인사 역할놀이 짝 활동",
        "type": "pair",
        "goal": "상황을 정해 인사를 주고받아요",
        "body": "짝과 상황을 정해 한 사람이 인사하면 다른 사람이 알맞게 되받아 인사해요. 역할을 바꿔 가며 해요.",
        "materials": [
          "상황 카드"
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
            "q": "인사는 혼자 하나요, 주고받나요?",
            "a": "주고받아요"
          },
          {
            "q": "누가 먼저 인사하면 어떻게 할까요?",
            "a": "반갑게 되받아 인사해요"
          },
          {
            "q": "역할놀이에서 먼저 정할 것은?",
            "a": "상황과 역할"
          }
        ],
        "self": [
          "역할놀이로 인사를 주고받아요",
          "조금 어색해요",
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
          "인사는 주고받아야 완성됨을 알았어요",
          "역할을 나눠 진짜처럼 인사를 주고받았어요",
          "바른 자세와 표정으로 인사했어요"
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
        "preview": "인사가 담긴 시를 만나요",
        "body": "다음 시간에는 저녁마다 정답게 인사를 나누는 시를 듣고, 누가 누구에게 인사했는지 알아볼 거예요!"
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
      "title": "받아 본 인사",
      "content": "“인사했는데 답을 못 받은 적 있나요? 기분이 어땠어요?” 주고받기의 소중함을 경험에서 끌어내요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_roleplay",
      "type": "tip",
      "icon": "🧩",
      "title": "놀이가 곧 연습",
      "content": "역할놀이는 평가가 아니라 안전한 연습 무대예요. 틀려도 다시 하면 된다는 분위기를 만들어 주세요.",
      "fit_slides": [
        "objective",
        "present"
      ]
    },
    {
      "id": "q_noreply",
      "type": "fun_question",
      "icon": "🤝",
      "title": "답 인사 찾기",
      "content": "“‘축하해’를 받으면 뭐라고 답할까요?(고마워)” 받은 인사에 답하는 말을 미리 찾아보게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_pingpong",
      "type": "real_world",
      "icon": "🌍",
      "title": "주고받는 공놀이처럼",
      "content": "인사는 공을 주고받는 것과 같아요. 던지기만 하면 놀이가 안 되듯, 답 인사까지 해야 완성돼요.",
      "fit_slides": [
        "motivate",
        "concept"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "네 단계 손가락",
      "content": "상황·역할·주고받기·바꾸기 네 단계를 손가락으로 꼽으며 외우게 하면 놀이 진행이 매끄러워요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "x_oneway",
      "type": "misconception",
      "icon": "❓",
      "title": "한쪽만 말하는 역할놀이",
      "content": "한 명만 말하고 끝내는 짝이 있어요. 받은 사람도 꼭 답 인사를 해야 함을 시범으로 보여 주세요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "q_choose",
      "type": "fun_question",
      "icon": "💡",
      "title": "우리 짝의 상황",
      "content": "“세 상황 말고 새로운 상황을 만들어도 좋아요!” 스스로 상황을 만들면 놀이가 더 살아나요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "g_reply",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "인사 ↔ 답 인사 짝짓기",
      "description": "건넨 인사와 알맞은 답 인사를 짝지어 보세요.",
      "hint": "인사를 받으면 뭐라고 답할지 생각해요.",
      "pairs": [
        {
          "a": {
            "text": "안녕하세요"
          },
          "b": {
            "text": "그래, 안녕"
          }
        },
        {
          "a": {
            "text": "축하해"
          },
          "b": {
            "text": "고마워"
          }
        },
        {
          "a": {
            "text": "미안해"
          },
          "b": {
            "text": "괜찮아"
          }
        },
        {
          "a": {
            "text": "잘 가"
          },
          "b": {
            "text": "내일 보자"
          }
        }
      ],
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "관객도 배워요",
      "content": "발표를 보는 친구들에게 “어떤 점이 좋았나요?”를 묻게 하세요. 보면서도 인사 예절을 배워요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_swap",
      "type": "extension",
      "icon": "⬆",
      "title": "역할 바꿔 한 번 더",
      "content": "시간이 되면 역할을 바꿔 다시 해 보게 하세요. 인사하는 쪽과 받는 쪽 마음을 모두 경험해요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "기억나는 장면",
      "content": "“오늘 역할놀이에서 가장 기억에 남는 인사는 무엇이었나요?” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "시 만나기 예고",
      "content": "“밤이 되면 누구에게 인사하고 자나요?” 저녁 인사 이야기로 다음 시간 시를 살짝 예고해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l05"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 5,
    "title": "시를 듣고 내용을 알아요",
    "std": "[2국02-05]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 저녁 풍경 → 시를 듣는 약속 → 저녁 인사 시 읽어주기 → 누가·누구에게·뭐라고 확인 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "시를 듣고 내용을 알아요",
        "subtitle": "5단원 · 5/12차시 · 작품을 읽고 생각 나누기"
      },
      "suggested_extras": [
        "q_open",
        "t_poem"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "인사가 담긴 시를 들어 봐요",
          "누가 누구에게 인사했는지 알아봐요",
          "시 속 인사말을 찾아 말해요"
        ]
      },
      "suggested_extras": [
        "t_poem"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "해가 지는 저녁이에요 🌆",
        "visual": "🌆",
        "question": "하루를 마치고 잠자리에 들 시간,<br>여러분은 누구에게 어떤 인사를 하나요?",
        "img": "assets/photo/korean/evening_poem.jpg"
      },
      "suggested_extras": [
        "q_night",
        "r_evening"
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
            "q": "인사는 혼자 하나요, 주고받나요?",
            "a": "주고받아요"
          },
          {
            "q": "역할놀이에서 먼저 정할 것은?",
            "a": "상황과 역할"
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
        "title": "시를 듣는 약속",
        "content": "시를 들을 때는 **장면을 머릿속에 그리며** 들어요. 누가 나오는지, 누구에게 무슨 인사를 하는지 귀 기울여 봐요!",
        "symbol_meanings": [
          {
            "symbol": "장면 그리기",
            "meaning": "시 속 모습을 머릿속에 떠올려요"
          },
          {
            "symbol": "누가",
            "meaning": "시에 누가 나오는지 들어요"
          },
          {
            "symbol": "누구에게",
            "meaning": "누구에게 인사하는지 들어요"
          },
          {
            "symbol": "뭐라고",
            "meaning": "어떤 인사말을 하는지 들어요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_noise"
      ],
      "tnote": {
        "ask": [
          "시에서 누구에게 인사했니?"
        ],
        "watch": "듣기→시 내용 파악",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "read_aloud",
      "data": {
        "title": "저녁 인사가 담긴 시 📖",
        "author": "저녁 인사가 나오는 동시",
        "pages": [
          {
            "img_hint": "해가 지고 어두워지는 저녁 풍경",
            "quote": "저녁이 찾아온 장면이에요.\n시 속 아이가 하루를 마치고 잠자리에 들 준비를 해요."
          },
          {
            "img_hint": "가족에게 인사하는 장면",
            "quote": "아이가 가족에게 저녁 인사를 건네요.\n‘안녕히 주무세요’를 어떤 마음으로 말할지 이야기 나눠요."
          },
          {
            "img_hint": "창밖 달과 별에게 인사하는 장면",
            "quote": "아이가 창밖 달님에게도 잘 자라고 인사해요.\n또 누구에게 인사하고 싶을지 물어보세요."
          },
          {
            "img_hint": "포근하게 잠드는 장면",
            "quote": "정다운 인사를 나눈 아이가 포근하게 잠들어요.\n시의 따뜻한 느낌을 함께 음미해 주세요."
          }
        ],
        "copyright": "수업용 진행 안내입니다. 동시 본문은 학교 수업 목적 이용(저작권법 제25조) 범위에서 교사가 교과서·실물 자료로 보여 주세요."
      },
      "suggested_extras": [
        "q_imagine",
        "t_voice"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "시의 내용을 확인해요",
        "question": "시를 잘 들었나요? 함께 확인해 봐요.",
        "items": [
          "시 속 아이는 언제 인사를 했나요? (저녁·잘 때)",
          "누구누구에게 인사했나요? (가족·달님…)",
          "어떤 인사말이 나왔나요? (잘 자요·안녕히 주무세요)"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_mygreet"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "저녁 인사가 담긴 시 듣고 알기",
        "levels": {
          "읽기": {
            "q": "저녁 인사말 '잘 자요·안녕히 주무세요'를 읽어 볼까요?",
            "a": "잘 자요·안녕히 주무세요"
          },
          "쓰기": {
            "q": "밤에 잠자기 전 하는 인사 '잘 자요'를 써 볼까요?",
            "a": "잘 자요"
          },
          "말하기": {
            "q": "시에서 누가 누구에게 저녁 인사를 했는지 말해 봐요.",
            "a": "여러 답 (예: 아이가 가족에게 잘 자요 인사를 했어요)",
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
        "title": "저녁 인사 나누기 짝 놀이",
        "type": "pair",
        "goal": "여러 대상에게 저녁 인사를 해요",
        "body": "짝과 번갈아 가며 여러 대상(가족·인형·별)에게 잘 자요 저녁 인사를 해 봐요.",
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
            "q": "밤에 잠자기 전 하는 인사는?",
            "a": "잘 자요(안녕히 주무세요)"
          },
          {
            "q": "시를 들을 때 무엇을 찾을까요?",
            "a": "누가·누구에게·무슨 말"
          },
          {
            "q": "시 속 인사는 어떤 때 하는 인사인가요?",
            "a": "저녁(밤)"
          }
        ],
        "self": [
          "시를 듣고 내용을 알아요",
          "조금 헷갈려요",
          "다시 듣고 싶어요"
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
          "인사가 담긴 시를 장면을 그리며 들었어요",
          "누가 누구에게 인사했는지 알았어요",
          "시 속 저녁 인사말을 찾아 말했어요"
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
        "preview": "시를 따라 읽고 나만의 인사를 만들어요",
        "body": "다음 시간에는 시를 리듬감 있게 따라 읽고, 나만의 저녁 인사를 만들어 발표할 거예요!"
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
      "title": "저녁 인사 경험",
      "content": "“어젯밤 잠들기 전에 누구에게 인사했나요?” 가볍게 물으며 시의 세계로 들어가요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_poem",
      "type": "tip",
      "icon": "🧩",
      "title": "시는 느끼는 글",
      "content": "시는 정답 찾기보다 느낌이 먼저예요. 내용 확인은 가볍게, 따뜻한 분위기를 살리는 데 마음을 써 주세요.",
      "fit_slides": [
        "objective",
        "read_aloud"
      ]
    },
    {
      "id": "q_night",
      "type": "fun_question",
      "icon": "🌆",
      "title": "저녁 장면 그리기",
      "content": "“눈을 감고 저녁 우리 집을 떠올려 봐요. 무엇이 보이나요?” 장면 상상으로 듣기 준비를 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_evening",
      "type": "real_world",
      "icon": "🌍",
      "title": "우리 집 저녁 인사",
      "content": "가족마다 저녁 인사가 달라요. 우리 집의 저녁 인사를 떠올리게 하면 시가 내 이야기가 돼요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "세 가지 질문 예고",
      "content": "듣기 전에 ‘누가·누구에게·뭐라고’ 세 질문을 미리 알려 주세요. 목적이 있으면 귀가 열려요.",
      "fit_slides": [
        "concept",
        "read_aloud"
      ]
    },
    {
      "id": "x_noise",
      "type": "misconception",
      "icon": "❓",
      "title": "듣기는 가만히만?",
      "content": "가만히 있는 게 잘 듣는 거라 여기기 쉬워요. 머릿속으로 장면을 그리는 게 진짜 듣기임을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "read_aloud"
      ]
    },
    {
      "id": "q_imagine",
      "type": "fun_question",
      "icon": "💡",
      "title": "장면 묻기",
      "content": "한 장을 읽은 뒤 “지금 머릿속에 어떤 그림이 그려졌어요?” 물으면 상상 듣기가 살아나요.",
      "fit_slides": [
        "read_aloud"
      ]
    },
    {
      "id": "t_voice",
      "type": "tip",
      "icon": "🗣",
      "title": "포근한 목소리로",
      "content": "저녁 인사 시는 조용하고 포근한 목소리로 읽어 주세요. 교실 불을 살짝 낮추면 분위기가 살아요.",
      "fit_slides": [
        "read_aloud"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "시로 돌아가 확인",
      "content": "답이 나오면 “시 어디에서 들었어요?”라고 한 번 더 물어 시 속 장면과 답을 이어 주세요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_mygreet",
      "type": "extension",
      "icon": "⬆",
      "title": "인사하고 싶은 대상",
      "content": "“달님 말고 또 누구에게 잘 자라고 인사하고 싶나요?(인형·강아지·별)” 다음 차시 나만의 인사를 미리 모아요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "시의 느낌",
      "content": "“시를 듣고 어떤 느낌이 들었나요? 한 낱말로 말해 봐요(따뜻해요·포근해요).” 느낌으로 마무리해요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "따라 읽기 예고",
      "content": "“내일은 이 시를 우리가 직접 소리 내어 읽어요!” 낭송을 예고하며 기대를 심어요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l06"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 6,
    "title": "시를 따라 읽고 나만의 인사를 만들어요",
    "std": "[2국02-05] · [2국01-05]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 시 다시 만나기 → 리듬감 있게 읽는 법 → 누구에게 어떤 저녁 인사? → 나만의 저녁 인사 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "시를 따라 읽고 나만의 인사를 만들어요",
        "subtitle": "5단원 · 6/12차시 · 작품을 읽고 생각 나누기"
      },
      "suggested_extras": [
        "q_open",
        "t_rhythm"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "시를 리듬감 있게 따라 읽어요",
          "짝과 번갈아 가며 읽어 봐요",
          "나만의 저녁 인사를 만들어 발표해요"
        ]
      },
      "suggested_extras": [
        "t_rhythm"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "시를 소리 내어 읽으면 🎵",
        "visual": "🎵",
        "question": "지난 시간에 들은 저녁 인사 시,<br>이번에는 우리가 직접 소리 내어 읽어 볼까요?",
        "img": "assets/photo/korean/my_greeting.jpg"
      },
      "suggested_extras": [
        "q_again",
        "r_song"
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
            "q": "밤에 잠자기 전 하는 인사는?",
            "a": "잘 자요"
          },
          {
            "q": "시를 들을 때 무엇을 찾을까요?",
            "a": "누가·누구에게·무슨 말"
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
        "title": "리듬감 있게 따라 읽는 법",
        "content": "시는 **노래처럼 리듬**이 있어요. 한 행씩 따라 읽고, 짝과 번갈아 읽고, 손뼉 박자에 맞춰 읽으면 더 재미있어요!",
        "symbol_meanings": [
          {
            "symbol": "한 행씩 따라 읽기",
            "meaning": "선생님 따라 한 줄씩 읽어요"
          },
          {
            "symbol": "번갈아 읽기",
            "meaning": "짝과 한 줄씩 주고받으며 읽어요"
          },
          {
            "symbol": "박자 맞춰 읽기",
            "meaning": "손뼉을 치며 리듬을 살려요"
          },
          {
            "symbol": "마음 담아 읽기",
            "meaning": "포근한 저녁 마음을 담아 읽어요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_loud"
      ],
      "tnote": {
        "ask": [
          "너는 누구에게 저녁 인사를 하고 싶니?"
        ],
        "watch": "시 리듬→나만의 표현",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "누구에게 어떤 저녁 인사? 🌙",
        "sub": "저녁에 만나는 대상에게 알맞은 인사를 골라요. 카드를 누르고 다 같이 인사말을 읽어 봐요!",
        "cards": [
          {
            "clue": "잠자리에 들며 부모님께<br>공손하게 뭐라고 할까요?",
            "emoji": "👨‍👩‍👧",
            "name": "안녕히 주무세요"
          },
          {
            "clue": "같이 자는 동생에게<br>다정하게 뭐라고 할까요?",
            "emoji": "👶",
            "name": "잘 자"
          },
          {
            "clue": "창밖에 뜬 달님에게<br>속삭이듯 뭐라고 할까요?",
            "emoji": "🌙",
            "name": "달님, 잘 자요"
          },
          {
            "clue": "마당의 강아지에게<br>뭐라고 할까요?",
            "emoji": "🐶",
            "name": "잘 자, 또 만나"
          }
        ],
        "outro": "저녁마다 이렇게 인사하면 모두가 포근하게 잠들 수 있겠죠? 😊"
      },
      "suggested_extras": [
        "q_who",
        "g_night"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "나만의 저녁 인사 발표 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 인사하고 싶은 대상을 고르고 나만의 저녁 인사를 만들어 말해요!",
        "count": 24,
        "hint": "“창밖 나무야, 포근하게 잘 자” 처럼 대상과 인사를 함께 말해요",
        "end_msg": "여러분의 저녁 인사로 교실이 포근해졌어요. 시인이 따로 없네요! 👏"
      },
      "suggested_extras": [
        "t_present",
        "e_write"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "리듬감 있게 읽고 나만의 저녁 인사 만들기",
        "levels": {
          "읽기": {
            "q": "시를 리듬감 있게 '잘 자요, 잘 자요' 따라 읽어 볼까요?",
            "a": "잘 자요, 잘 자요"
          },
          "쓰기": {
            "q": "내가 인사하고 싶은 대상에게 '○○야, 잘 자'를 써 볼까요?",
            "a": "예: 인형아, 잘 자"
          },
          "말하기": {
            "q": "누구에게 어떤 저녁 인사를 하고 싶은지 말해 봐요.",
            "a": "여러 답 (예: 동생에게 잘 자 인사를 하고 싶어요)",
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
        "title": "나만의 저녁 인사 짝 발표",
        "type": "pair",
        "goal": "나만의 저녁 인사를 만들어 들려줘요",
        "body": "각자 인사할 대상을 정해 나만의 저녁 인사를 만들고 짝에게 들려줘요. 서로 좋은 점을 말해 줘요.",
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
            "q": "시를 소리 내어 읽으면 무엇이 살아나나요?",
            "a": "리듬(가락)"
          },
          {
            "q": "나만의 저녁 인사는 누구에게 하나요?",
            "a": "내가 정한 대상"
          },
          {
            "q": "따라 읽을 때 어떻게 읽으면 좋을까요?",
            "a": "리듬감 있게"
          }
        ],
        "self": [
          "시를 읽고 나만의 인사를 만들어요",
          "조금 어려워요",
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
          "시를 리듬감 있게 따라 읽었어요",
          "짝과 번갈아 읽으며 시를 즐겼어요",
          "나만의 저녁 인사를 만들어 발표했어요"
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
        "preview": "글자와 소리가 다른 낱말을 만나요",
        "body": "다음 시간에는 ‘걸음’이라고 쓰고 [거름]이라고 읽는, 글자와 소리가 다른 신기한 낱말의 비밀을 알아봐요!"
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
      "title": "기억나는 구절",
      "content": "“지난 시간 시에서 기억나는 인사말이 있나요?” 시의 기억을 꺼내며 낭송 준비를 해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_rhythm",
      "type": "tip",
      "icon": "🧩",
      "title": "낭송은 즐겁게",
      "content": "낭송 차시의 목표는 정확함보다 즐거움이에요. 틀려도 웃으며 다시 읽는 분위기를 만들어 주세요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_again",
      "type": "fun_question",
      "icon": "🎵",
      "title": "듣기와 읽기의 차이",
      "content": "“듣기만 할 때와 직접 읽을 때, 무엇이 다를까요?” 읽기 전 기대를 모아요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_song",
      "type": "real_world",
      "icon": "🌍",
      "title": "노래로 이어 가기",
      "content": "인사를 주제로 한 노래에 맞춰 몸을 흔들며 부르면, 시의 리듬과 인사말이 함께 몸에 남아요.",
      "fit_slides": [
        "motivate",
        "present"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "읽기 방법 골고루",
      "content": "한 행씩 → 번갈아 → 박자 맞춰, 세 방법을 차례로 다 써 보세요. 같은 시도 새롭게 느껴져요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_loud",
      "type": "misconception",
      "icon": "❓",
      "title": "크게 읽기가 잘 읽기?",
      "content": "무조건 크게 읽으려는 아이가 있어요. 저녁 인사 시는 포근하고 잔잔한 목소리가 어울림을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "present"
      ]
    },
    {
      "id": "q_who",
      "type": "fun_question",
      "icon": "💡",
      "title": "높임? 다정함?",
      "content": "“부모님과 동생, 인사말이 왜 다를까요?” 저녁 인사에도 상대에 따른 차이가 있음을 짚어요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_night",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "대상 ↔ 저녁 인사 짝짓기",
      "description": "저녁에 만나는 대상과 알맞은 인사를 짝지어 보세요.",
      "hint": "누구에게 하는 인사인지 생각해요.",
      "pairs": [
        {
          "a": {
            "text": "👨‍👩‍👧 부모님께"
          },
          "b": {
            "text": "안녕히 주무세요"
          }
        },
        {
          "a": {
            "text": "👶 동생에게"
          },
          "b": {
            "text": "잘 자"
          }
        },
        {
          "a": {
            "text": "🌙 달님에게"
          },
          "b": {
            "text": "잘 자요"
          }
        },
        {
          "a": {
            "text": "🐶 강아지에게"
          },
          "b": {
            "text": "잘 자, 또 만나"
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
      "title": "대상 먼저 부르기",
      "content": "나만의 인사는 “◯◯야/께” 하고 대상을 먼저 부르게 하세요. 부름말이 있어야 인사가 살아나요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_write",
      "type": "extension",
      "icon": "⬆",
      "title": "인사 시 한 줄 쓰기",
      "content": "발표한 저녁 인사를 한 줄로 적어 모으면 우리 반 저녁 인사 시가 돼요. 교실에 게시해 보세요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "가장 포근했던 인사",
      "content": "“오늘 친구들의 저녁 인사 중 가장 포근했던 것은?” 서로의 표현을 한 번 더 음미해요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "소리 비밀 예고",
      "content": "칠판에 ‘걸음’을 쓰고 “이 낱말, 어떻게 읽을까요?” 묻기만 하고 답은 다음 시간으로 남겨요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l07"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 7,
    "title": "글자와 소리가 다른 낱말을 알아요",
    "std": "[2국04-02]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 걸음을 읽어 보면 → 받침이 ㅇ 자리로 넘어가는 소리 → 글자와 소리 카드 → 왜 다르게 들릴까 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "글자와 소리가 다른 낱말을 알아요",
        "subtitle": "5단원 · 7/12차시 · 작품을 읽고 생각 나누기"
      },
      "suggested_extras": [
        "q_open",
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
          "글자와 소리가 다른 낱말을 만나요",
          "받침 소리가 어디로 가는지 살펴봐요",
          "낱말을 자연스럽게 소리 내어 읽어요"
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
        "scene_title": "‘걸음’을 읽어 볼까요? 👣",
        "visual": "👣",
        "question": "‘걸음’이라고 쓰여 있는데<br>소리 내어 읽으면 [거름]처럼 들려요. 왜 그럴까요?",
        "img": "assets/photo/korean/sound_diff.jpg"
      },
      "suggested_extras": [
        "q_walk",
        "r_name"
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
            "q": "시를 소리 내어 읽으면 무엇이 살아나나요?",
            "a": "리듬"
          },
          {
            "q": "나만의 저녁 인사는 누구에게 하나요?",
            "a": "내가 정한 대상"
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
        "title": "받침이 뒤로 넘어가는 소리",
        "content": "받침 뒤에 **‘ㅇ’으로 시작하는 글자**가 오면, 받침 소리가 뒤 글자 자리로 넘어가 자연스럽게 이어져요. 글자는 그대로, 소리만 달라져요!",
        "symbol_meanings": [
          {
            "symbol": "걸음 → [거름]",
            "meaning": "ㄹ 받침이 ‘음’ 자리로 넘어가요"
          },
          {
            "symbol": "국어 → [구거]",
            "meaning": "ㄱ 받침이 ‘어’ 자리로 넘어가요"
          },
          {
            "symbol": "악어 → [아거]",
            "meaning": "ㄱ 받침이 ‘어’ 자리로 넘어가요"
          },
          {
            "symbol": "음악 → [으막]",
            "meaning": "ㅁ 받침이 ‘악’ 자리로 넘어가요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_spell"
      ],
      "tnote": {
        "ask": [
          "글자대로 읽을 때와 소리가 어떻게 다를까?"
        ],
        "watch": "연음 현상 인식",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "글자와 소리가 달라요 🔊",
        "sub": "글자를 보고, 소리 내어 읽으면 어떻게 들리는지 맞혀요. 카드를 누르면 소리가 나와요!",
        "cards": [
          {
            "clue": "‘걸음’이라고 써요<br>소리 내어 읽으면?",
            "emoji": "👣",
            "name": "[거름]"
          },
          {
            "clue": "‘국어’라고 써요<br>소리 내어 읽으면?",
            "emoji": "📖",
            "name": "[구거]"
          },
          {
            "clue": "‘악어’라고 써요<br>소리 내어 읽으면?",
            "emoji": "🐊",
            "name": "[아거]"
          },
          {
            "clue": "‘음악’이라고 써요<br>소리 내어 읽으면?",
            "emoji": "🎵",
            "name": "[으막]"
          }
        ],
        "outro": "받침이 뒤로 사뿐 넘어가며 소리가 자연스럽게 이어졌어요! 글자는 그대로라는 점, 잊지 마요 😊"
      },
      "suggested_extras": [
        "q_where",
        "g_sound"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "왜 다르게 들릴까요?",
        "question": "글자와 소리가 다른 낱말에 대해 함께 생각해 봐요.",
        "items": [
          "‘걸음’의 ㄹ 받침 소리는 어디로 갔나요? (뒤 글자 자리로)",
          "받침 뒤에 어떤 글자가 오면 소리가 넘어가나요? (ㅇ으로 시작하는 글자)",
          "쓸 때도 [거름]이라고 쓰면 될까요? (안 돼요, 글자는 ‘걸음’)"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_find"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "받침이 넘어가는 소리 알기",
        "levels": {
          "읽기": {
            "q": "글자와 소리가 다른 낱말 '걸음·국어'를 소리 내어 읽어 볼까요?",
            "a": "걸음[거름]·국어[구거]"
          },
          "쓰기": {
            "q": "걸을 때 한 발 한 발 옮기는 것 '걸음'을 써 볼까요?",
            "a": "걸음"
          },
          "말하기": {
            "q": "'걸음'을 소리 내면 받침이 어디로 넘어가는지 말해 봐요.",
            "a": "여러 답 (예: ㄹ 받침이 뒷글자 ㅇ 자리로 넘어가요)",
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
        "title": "글자와 소리 견주기 짝 놀이",
        "type": "pair",
        "goal": "낱말을 소리 내어 어떻게 들리는지 견줘요",
        "body": "한 사람이 낱말(걸음·국어 등)을 보여 주면 짝이 소리 내어 읽고 어떻게 들리는지 말해요. 번갈아 가며 해요.",
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
            "q": "'걸음'은 소리 내면 어떻게 들리나요?",
            "a": "거름"
          },
          {
            "q": "받침은 뒷글자의 어느 자리로 넘어가나요?",
            "a": "ㅇ 자리"
          },
          {
            "q": "글자와 소리는 늘 같은가요?",
            "a": "다를 때가 있어요"
          }
        ],
        "self": [
          "글자와 소리가 다른 낱말을 알아요",
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
          "글자와 소리가 다른 낱말이 있음을 알았어요",
          "받침 소리가 뒤 ㅇ 자리로 넘어감을 알았어요",
          "걸음·국어·악어·음악을 자연스럽게 읽었어요"
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
        "preview": "글자와 소리, 같은 낱말과 다른 낱말을 가려요",
        "body": "다음 시간에는 글자대로 소리 나는 낱말과 다르게 소리 나는 낱말을 가려내며 자연스럽게 읽는 연습을 해요!"
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
      "title": "귀 기울여 듣기",
      "content": "“선생님이 ‘걸음’을 읽을게요. 글자랑 똑같이 들리나요?” 듣기에서 출발하면 호기심이 커져요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_listen",
      "type": "tip",
      "icon": "🧩",
      "title": "눈과 귀를 따로",
      "content": "이 차시는 눈(글자)과 귀(소리)를 나눠 쓰는 게 핵심이에요. 글자를 보여 주고 → 소리를 들려주는 순서를 지켜 주세요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_walk",
      "type": "fun_question",
      "icon": "👣",
      "title": "한 글자씩 vs 자연스럽게",
      "content": "“‘걸·음’ 한 글자씩 읽기와 ‘거름’처럼 이어 읽기, 어느 쪽이 자연스러운가요?” 비교로 느끼게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_name",
      "type": "real_world",
      "icon": "🌍",
      "title": "교과목 이름에도",
      "content": "매일 말하는 ‘국어[구거]·음악[으막]’이 바로 오늘 배우는 낱말이에요. 시간표를 보며 읽어 보게 하세요.",
      "fit_slides": [
        "motivate",
        "card_quiz"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "화살표로 보여 주기",
      "content": "칠판에 ‘걸음’을 크게 쓰고 ㄹ에서 뒤 글자로 화살표를 그려 주세요. 소리가 넘어가는 길이 눈에 보여요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_spell",
      "type": "misconception",
      "icon": "❓",
      "title": "소리대로 쓰려는 아이",
      "content": "[거름]으로 들리니 ‘거름’으로 쓰려는 아이가 있어요. 소리는 달라져도 글자는 그대로임을 꼭 짚어 주세요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "q_where",
      "type": "fun_question",
      "icon": "💡",
      "title": "받침 소리 추적",
      "content": "“‘국어’의 ㄱ 받침 소리는 어디로 갔을까요?” 받침 소리의 행방을 탐정처럼 쫓게 해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_sound",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "글자 ↔ 소리 짝짓기",
      "description": "쓰인 글자와 소리 나는 대로를 짝지어 보세요.",
      "hint": "받침이 뒤로 넘어간 소리를 떠올려요.",
      "pairs": [
        {
          "a": {
            "text": "👣 걸음"
          },
          "b": {
            "text": "[거름]"
          }
        },
        {
          "a": {
            "text": "📖 국어"
          },
          "b": {
            "text": "[구거]"
          }
        },
        {
          "a": {
            "text": "🐊 악어"
          },
          "b": {
            "text": "[아거]"
          }
        },
        {
          "a": {
            "text": "🎵 음악"
          },
          "b": {
            "text": "[으막]"
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
      "title": "입으로 확인",
      "content": "발문마다 답을 말로 하고 끝내지 말고, 그 낱말을 다 같이 자연스럽게 한 번 읽어 보게 하세요.",
      "fit_slides": [
        "question",
        "card_quiz"
      ]
    },
    {
      "id": "e_find",
      "type": "extension",
      "icon": "⬆",
      "title": "넘어가는 낱말 찾기",
      "content": "익숙해진 아이에겐 ‘웃음·길이·놀이터’처럼 소리가 넘어가는 낱말을 더 찾게 하면 한 단계 나아가요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "오늘의 비밀",
      "content": "“글자와 소리가 달라지는 비밀이 뭐였죠?(받침이 뒤 ㅇ 자리로)” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "가려내기 예고",
      "content": "“‘하늘’도 소리가 달라질까요?” 글자대로 읽는 낱말도 있음을 예고해 다음 시간 호기심을 심어요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l08"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 8,
    "title": "낱말을 자연스럽게 읽어요",
    "std": "[2국04-02]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 같을까 다를까 → 글자=소리/글자≠소리 가리기 → 가려내기 카드 → 연음 낱말 찾기 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "낱말을 자연스럽게 읽어요",
        "subtitle": "5단원 · 8/12차시 · 작품을 읽고 생각 나누기"
      },
      "suggested_extras": [
        "q_open",
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
          "글자대로 소리 나는 낱말을 찾아요",
          "글자와 다르게 소리 나는 낱말을 찾아요",
          "두 가지 낱말을 모두 자연스럽게 읽어요"
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
        "scene_title": "같을까요, 다를까요? ⚖️",
        "visual": "⚖️",
        "question": "‘하늘’은 글자대로 [하늘]로 들려요.<br>‘웃음’은요? 글자와 소리가 같을까요, 다를까요?",
        "img": "assets/photo/korean/read_natural.jpg"
      },
      "suggested_extras": [
        "q_compare",
        "r_read"
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
            "q": "'걸음'은 소리 내면 어떻게 들리나요?",
            "a": "거름"
          },
          {
            "q": "받침은 뒷글자의 어느 자리로 넘어가나요?",
            "a": "ㅇ 자리"
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
        "title": "두 갈래로 가려 읽어요",
        "content": "낱말에는 **글자대로 소리 나는 낱말**과 **받침이 넘어가 다르게 소리 나는 낱말**이 있어요. 가려내며 자연스럽게 읽어 봐요!",
        "symbol_meanings": [
          {
            "symbol": "하늘 = [하늘]",
            "meaning": "글자와 소리가 같아요"
          },
          {
            "symbol": "바다 = [바다]",
            "meaning": "글자와 소리가 같아요"
          },
          {
            "symbol": "웃음 → [우슴]",
            "meaning": "받침이 넘어가 소리가 달라요"
          },
          {
            "symbol": "길이 → [기리]",
            "meaning": "받침이 넘어가 소리가 달라요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_all"
      ],
      "tnote": {
        "ask": [
          "이 낱말은 글자와 소리가 같을까 다를까?"
        ],
        "watch": "연음 낱말 가려 읽기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "같은 소리? 다른 소리? 🔎",
        "sub": "이 낱말은 글자대로 들릴까요, 다르게 들릴까요? 먼저 읽어 보고 카드를 눌러 확인해요!",
        "cards": [
          {
            "clue": "‘웃음’ — 글자대로일까요?<br>소리 내어 읽어 봐요",
            "emoji": "😄",
            "name": "[우슴] — 달라요"
          },
          {
            "clue": "‘하늘’ — 글자대로일까요?<br>소리 내어 읽어 봐요",
            "emoji": "☁️",
            "name": "[하늘] — 같아요"
          },
          {
            "clue": "‘길이’ — 글자대로일까요?<br>소리 내어 읽어 봐요",
            "emoji": "📏",
            "name": "[기리] — 달라요"
          },
          {
            "clue": "‘할아버지’ — 글자대로일까요?<br>소리 내어 읽어 봐요",
            "emoji": "👴",
            "name": "[하라버지] — 달라요"
          }
        ],
        "outro": "받침 뒤에 ㅇ 글자가 오는지 보면 가려낼 수 있어요. 둘 다 자연스럽게 읽으면 합격! 😊"
      },
      "suggested_extras": [
        "q_rule",
        "g_sort"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "소리가 넘어가는 낱말 발표 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 글자와 소리가 다른 낱말을 하나 말하고 자연스럽게 읽어요!",
        "count": 24,
        "hint": "걸음·웃음·국어·음악·길이·놀이… 또 무엇이 있을까요?",
        "end_msg": "소리가 넘어가는 낱말을 자연스럽게 잘 읽었어요. 읽기 실력이 쑥쑥! 👏"
      },
      "suggested_extras": [
        "t_present",
        "e_sentence"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "같은 소리·다른 소리 가려 읽기",
        "levels": {
          "읽기": {
            "q": "낱말 '악어·음악'을 자연스럽게 읽어 볼까요?",
            "a": "악어[아거]·음악[으막]"
          },
          "쓰기": {
            "q": "입을 크게 벌린 무서운 동물 '악어'를 써 볼까요?",
            "a": "악어"
          },
          "말하기": {
            "q": "글자와 소리가 같은 낱말과 다른 낱말을 하나씩 말해 봐요.",
            "a": "여러 답 (예: 나무는 같고, 악어는 달라요)",
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
        "title": "두 갈래로 나누기 짝 놀이",
        "type": "pair",
        "goal": "낱말을 두 갈래로 나눠요",
        "body": "짝과 낱말 카드를 글자=소리와 글자≠소리 두 갈래로 나눠 놓고 서로 확인해요.",
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
            "q": "'악어'는 소리 내면 어떻게 들리나요?",
            "a": "아거"
          },
          {
            "q": "'음악'은 소리 내면 어떻게 들리나요?",
            "a": "으막"
          },
          {
            "q": "낱말을 어떻게 나눠 볼 수 있나요?",
            "a": "글자=소리 / 글자≠소리"
          }
        ],
        "self": [
          "낱말을 자연스럽게 가려 읽어요",
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
          "글자대로 소리 나는 낱말을 가려냈어요",
          "받침이 넘어가는 낱말을 가려냈어요",
          "두 가지 낱말을 자연스럽게 읽었어요"
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
        "preview": "여러 상황에서 알맞게 인사해요",
        "body": "다음 시간에는 배운 인사말을 들고 학교·집·동네 여러 상황으로 나가 볼 거예요. 실천 시간이에요!"
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
      "title": "어제의 비밀 복습",
      "content": "“받침 소리가 넘어가는 비밀, 기억나요?” 지난 시간 규칙을 한 문장으로 떠올리며 시작해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_both",
      "type": "tip",
      "icon": "🧩",
      "title": "두 갈래를 함께",
      "content": "다른 소리 낱말만 다루면 모든 낱말이 변한다고 오해해요. 같은 소리 낱말을 꼭 함께 보여 주세요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_compare",
      "type": "fun_question",
      "icon": "⚖️",
      "title": "먼저 읽고 판단",
      "content": "“정답을 듣기 전에 먼저 소리 내어 읽어 봐요.” 스스로 읽고 판단하는 습관을 들여 주세요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_read",
      "type": "real_world",
      "icon": "🌍",
      "title": "책 읽기가 달라져요",
      "content": "소리가 넘어가는 낱말을 알면 책을 읽을 때 훨씬 자연스러워져요. 읽기 자신감과 이어 주세요.",
      "fit_slides": [
        "motivate",
        "present"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "가려내는 기준",
      "content": "‘받침 뒤에 ㅇ으로 시작하는 글자가 있나?’ 이 한 가지 기준으로 가려 보게 하세요. 기준이 단순해야 써먹어요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_all",
      "type": "misconception",
      "icon": "❓",
      "title": "모든 낱말이 변한다?",
      "content": "배우고 나면 모든 낱말 소리를 바꿔 읽으려는 아이가 있어요. 하늘·바다처럼 글자대로인 낱말이 더 많음을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "q_rule",
      "type": "fun_question",
      "icon": "💡",
      "title": "왜 그렇게 판단했나",
      "content": "“왜 다르다고 생각했어요?” 카드마다 까닭(받침 뒤에 ㅇ 글자)을 말하게 하면 기준이 몸에 익어요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_sort",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "낱말 ↔ 소리 가려 짝짓기",
      "description": "낱말과 소리 나는 대로를 짝지어 보세요.",
      "hint": "글자대로인지, 받침이 넘어가는지 살펴요.",
      "pairs": [
        {
          "a": {
            "text": "😄 웃음"
          },
          "b": {
            "text": "[우슴]"
          }
        },
        {
          "a": {
            "text": "📏 길이"
          },
          "b": {
            "text": "[기리]"
          }
        },
        {
          "a": {
            "text": "☁️ 하늘"
          },
          "b": {
            "text": "[하늘]"
          }
        },
        {
          "a": {
            "text": "👴 할아버지"
          },
          "b": {
            "text": "[하라버지]"
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
      "title": "두 번 읽기",
      "content": "발표한 낱말은 글자대로 한 글자씩 → 자연스럽게 이어서, 두 가지로 읽어 보게 하면 차이가 또렷해져요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_sentence",
      "type": "extension",
      "icon": "⬆",
      "title": "문장 속에서 읽기",
      "content": "익숙해진 아이에겐 ‘음악을 들어요’처럼 짧은 문장 속에서 자연스럽게 읽게 하면 한 단계 나아가요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "가려내기 기준",
      "content": "“글자와 소리가 다른 낱말을 가려내는 기준이 뭐였죠?” 물으며 배움을 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "실천 예고",
      "content": "“이제 배운 인사말을 진짜로 써 볼 시간!” 실천 차시를 예고하며 단원의 흐름을 이어 주세요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l09"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 9,
    "title": "여러 상황에서 알맞게 인사해요",
    "std": "[2국01-02]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 하루 동안 만나는 인사 → 하루 인사 지도 → 상황별 인사말 카드 → 인사 실천 다짐 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "여러 상황에서 알맞게 인사해요",
        "subtitle": "5단원 · 9/12차시 · 배운 내용 실천"
      },
      "suggested_extras": [
        "q_open",
        "t_practice"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "하루 동안 만나는 인사 상황을 살펴봐요",
          "상황마다 알맞은 인사말을 골라요",
          "생활 속에서 인사를 실천하기로 다짐해요"
        ]
      },
      "suggested_extras": [
        "t_practice"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "아침부터 저녁까지 🕐",
        "visual": "🕐",
        "question": "아침에 눈 떠서 잠들 때까지,<br>우리는 하루에 인사를 몇 번이나 할까요?",
        "img": "assets/photo/korean/greeting_day.jpg"
      },
      "suggested_extras": [
        "q_count",
        "r_day"
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
            "q": "'악어'는 소리 내면 어떻게 들리나요?",
            "a": "아거"
          },
          {
            "q": "낱말을 어떻게 나눠 볼 수 있나요?",
            "a": "글자=소리 / 글자≠소리"
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
        "title": "하루 인사 지도",
        "content": "하루를 따라가며 인사 상황을 그려 봐요. **때와 곳, 만나는 사람**에 따라 알맞은 인사말이 있어요!",
        "symbol_meanings": [
          {
            "symbol": "아침 · 집",
            "meaning": "일어나서 — 안녕히 주무셨어요?"
          },
          {
            "symbol": "등굣길 · 학교",
            "meaning": "만나면 — 안녕하세요 · 안녕"
          },
          {
            "symbol": "점심 · 급식실",
            "meaning": "먹기 전 — 잘 먹겠습니다"
          },
          {
            "symbol": "저녁 · 집",
            "meaning": "잠들기 전 — 안녕히 주무세요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_skiphi"
      ],
      "tnote": {
        "ask": [
          "이때는 어떤 인사가 어울릴까?"
        ],
        "watch": "상황·때↔인사 실천",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "이 상황엔 어떤 인사? 🎴",
        "sub": "하루 동안 만나는 상황이에요. 알맞은 인사말을 골라요. 카드를 누르면 답이 나와요!",
        "cards": [
          {
            "clue": "아침에 일어나 부모님을 만났어요",
            "emoji": "🌅",
            "name": "안녕히 주무셨어요?"
          },
          {
            "clue": "학교 끝나고 집에 돌아왔어요",
            "emoji": "🏠",
            "name": "다녀왔습니다"
          },
          {
            "clue": "맛있게 밥을 다 먹었어요",
            "emoji": "🍚",
            "name": "잘 먹었습니다"
          },
          {
            "clue": "놀이터에서 친구와 헤어져요",
            "emoji": "🛝",
            "name": "잘 가, 내일 보자"
          }
        ],
        "outro": "하루가 인사로 가득해요! 이제 진짜 생활에서 실천하는 일만 남았어요 😊"
      },
      "suggested_extras": [
        "q_more",
        "g_day"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "인사 실천을 다짐해요",
        "question": "오늘부터 실천할 인사를 정해 이야기해 봐요.",
        "items": [
          "집에서 꼭 하고 싶은 인사는?",
          "학교에서 꼭 하고 싶은 인사는?",
          "인사를 받은 사람의 기분은 어떨까요?"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_mission"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "하루 동안 알맞게 인사하기",
        "levels": {
          "읽기": {
            "q": "때에 맞는 인사 '다녀오겠습니다·다녀왔습니다'를 읽어 볼까요?",
            "a": "다녀오겠습니다·다녀왔습니다"
          },
          "쓰기": {
            "q": "집을 나설 때 하는 인사 '다녀오겠습니다'를 써 볼까요?",
            "a": "다녀오겠습니다"
          },
          "말하기": {
            "q": "아침부터 저녁까지 언제 어떤 인사를 하는지 말해 봐요.",
            "a": "여러 답 (예: 아침엔 안녕하세요, 밤엔 안녕히 주무세요)",
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
        "title": "하루 인사 지도 짝 놀이",
        "type": "pair",
        "goal": "때와 상황에 맞는 인사를 실천해요",
        "body": "한 사람이 때·상황(등교·식사·잠자기)을 말하면 짝이 알맞은 인사말로 답해요. 번갈아 가며 해요.",
        "materials": [
          "하루 상황 카드"
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
            "q": "집을 나설 때 하는 인사는?",
            "a": "다녀오겠습니다"
          },
          {
            "q": "밥을 먹기 전에 하는 인사는?",
            "a": "잘 먹겠습니다"
          },
          {
            "q": "인사는 언제 하나요?",
            "a": "하루 동안 여러 때"
          }
        ],
        "self": [
          "여러 상황에 알맞게 인사해요",
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
          "하루 동안의 인사 상황을 살펴봤어요",
          "상황마다 알맞은 인사말을 골랐어요",
          "생활 속 인사 실천을 다짐했어요"
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
        "preview": "인사 놀이를 해요",
        "body": "다음 시간에는 상황을 말하면 알맞은 인사말을 외치는 신나는 인사 놀이를 할 거예요!"
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
      "title": "오늘 한 인사 세기",
      "content": "“오늘 아침부터 지금까지 인사를 몇 번 했나요?” 손가락으로 꼽으며 실천 차시를 열어요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_practice",
      "type": "tip",
      "icon": "🧩",
      "title": "실천이 목표",
      "content": "오늘은 아는 것을 넘어 ‘하는 것’이 목표예요. 다짐이 구체적일수록 실천으로 이어져요.",
      "fit_slides": [
        "objective",
        "question"
      ]
    },
    {
      "id": "q_count",
      "type": "fun_question",
      "icon": "🕐",
      "title": "하루 따라가기",
      "content": "“아침에 눈을 뜨면 제일 먼저 누구를 만나죠?” 하루 흐름을 따라가며 인사 장면을 모아요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_day",
      "type": "real_world",
      "icon": "🌍",
      "title": "우리 동네 인사",
      "content": "경비원 아저씨·가게 사장님·이웃 어른처럼 동네에서 만나는 분들께 하는 인사도 떠올리게 해 주세요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "시간 순서로 정리",
      "content": "인사 상황을 아침→낮→저녁 시간 순서로 정리하면 하루 인사 지도가 머릿속에 그려져요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_skiphi",
      "type": "misconception",
      "icon": "❓",
      "title": "아는 사람에게만?",
      "content": "친한 사람에게만 인사하면 된다고 여기는 아이가 있어요. 도움을 주시는 모든 분께 인사할 수 있음을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "q_more",
      "type": "fun_question",
      "icon": "💡",
      "title": "카드 밖 상황",
      "content": "“카드에 없는 인사 상황도 있을까요?(버스에서 내릴 때·전화 끊을 때)” 상황 곳간을 넓혀요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_day",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "하루 상황 ↔ 인사말",
      "description": "하루의 상황과 알맞은 인사말을 짝지어 보세요.",
      "hint": "때와 곳, 만나는 사람을 생각해요.",
      "pairs": [
        {
          "a": {
            "text": "🌅 아침에 일어나서"
          },
          "b": {
            "text": "안녕히 주무셨어요?"
          }
        },
        {
          "a": {
            "text": "🏠 집에 돌아와서"
          },
          "b": {
            "text": "다녀왔습니다"
          }
        },
        {
          "a": {
            "text": "🍚 밥을 다 먹고"
          },
          "b": {
            "text": "잘 먹었습니다"
          }
        },
        {
          "a": {
            "text": "🛝 친구와 헤어질 때"
          },
          "b": {
            "text": "잘 가"
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
      "title": "다짐은 한 가지만",
      "content": "여러 개보다 ‘저녁마다 안녕히 주무세요 하기’처럼 한 가지를 또렷하게 다짐하게 하세요. 실천 확률이 올라가요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_mission",
      "type": "extension",
      "icon": "⬆",
      "title": "일주일 인사 미션",
      "content": "다짐한 인사를 일주일 동안 실천하고 표시하는 인사 미션판을 만들면 실천이 습관이 돼요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "나의 다짐",
      "content": "“오늘 정한 나의 인사 다짐을 다시 한번 말해 볼까요?” 다짐을 입으로 굳혀요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "놀이 예고",
      "content": "“내일은 인사말로 신나게 노는 시간!” 인사 놀이를 예고하며 기대를 모아요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l10"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 10,
    "title": "인사 놀이를 해요",
    "std": "[2국01-02] · [2국01-05]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 놀이로 만나는 인사 → 인사 놀이 방법 → 모둠 인사 놀이 진행 → 상황 외치고 인사말 답하기 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "인사 놀이를 해요",
        "subtitle": "5단원 · 10/12차시 · 배운 내용 실천"
      },
      "suggested_extras": [
        "q_open",
        "t_game"
      ]
    },
    {
      "id": "s02",
      "stage": "열기",
      "block": "objective",
      "data": {
        "title": "오늘 우리가 할 일",
        "bullets": [
          "인사 놀이 방법을 알아봐요",
          "모둠 친구들과 인사 놀이를 해요",
          "알맞은 인사말을 빠르고 정확하게 말해요"
        ]
      },
      "suggested_extras": [
        "t_game"
      ]
    },
    {
      "id": "s03",
      "stage": "만나기",
      "block": "motivate",
      "data": {
        "scene_title": "인사말로 놀 수 있다고요? 🎲",
        "visual": "🎲",
        "question": "이 단원에서 배운 인사말이 정말 많아요.<br>오늘은 그 인사말로 신나게 놀아 볼 거예요!",
        "img": "assets/photo/korean/greeting_game.jpg"
      },
      "suggested_extras": [
        "q_ready",
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
            "q": "집을 나설 때 하는 인사는?",
            "a": "다녀오겠습니다"
          },
          {
            "q": "밥을 먹기 전에 하는 인사는?",
            "a": "잘 먹겠습니다"
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
        "title": "인사 놀이 방법",
        "content": "한 사람이 **상황을 말하면**, 다른 사람이 **알맞은 인사말을 외쳐요**. 알맞으면 통과, 역할을 바꿔 계속해요!",
        "symbol_meanings": [
          {
            "symbol": "① 상황 말하기",
            "meaning": "“친구 생일이야!” 처럼 상황을 외쳐요"
          },
          {
            "symbol": "② 인사말 답하기",
            "meaning": "“축하해!” 알맞은 인사말로 답해요"
          },
          {
            "symbol": "③ 함께 확인하기",
            "meaning": "알맞은지 모둠이 함께 판단해요"
          },
          {
            "symbol": "④ 역할 바꾸기",
            "meaning": "문제 내는 사람을 바꿔 이어 가요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_speed"
      ],
      "tnote": {
        "ask": [
          "이 상황엔 어떤 인사가 알맞을까?"
        ],
        "watch": "놀이로 인사 익히기",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "question",
      "data": {
        "title": "모둠 인사 놀이 시작! 🎲",
        "question": "모둠별로 인사 놀이를 해요. 선생님이 먼저 시범 상황을 낼게요.",
        "items": [
          "“이웃 어른을 만났어!” → (안녕하세요)",
          "“친구 지우개를 밟았어!” → (미안해)",
          "“밥을 다 먹었어!” → (잘 먹었습니다)"
        ]
      },
      "suggested_extras": [
        "q_judge",
        "g_quick"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "present",
      "data": {
        "title": "인사 놀이 무대 🎤",
        "sub": "버튼을 누르면 발표할 친구를 뽑아요. 뽑힌 친구가 상황을 외치면, 반 전체가 알맞은 인사말로 답해요!",
        "count": 24,
        "hint": "상황은 짧고 또렷하게! “전학 온 친구를 만났어!” → “만나서 반가워!”",
        "end_msg": "문제도 답도 척척! 인사말이 입에 착 붙었어요. 놀이 챔피언들! 🏆"
      },
      "suggested_extras": [
        "t_present",
        "e_team"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "인사 놀이로 즐겁게 인사하기",
        "levels": {
          "읽기": {
            "q": "놀이에서 외치는 말 '상황! 인사!'를 읽어 볼까요?",
            "a": "상황! 인사!"
          },
          "쓰기": {
            "q": "친구가 도와줬을 때 하는 인사 '고마워'를 써 볼까요?",
            "a": "고마워"
          },
          "말하기": {
            "q": "술래가 상황을 외치면 어떻게 답할지 말해 봐요.",
            "a": "여러 답 (예: 상황에 알맞은 인사말로 답해요)",
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
        "title": "인사 놀이 짝·모둠 활동",
        "type": "pair",
        "goal": "상황을 듣고 알맞은 인사말로 답해요",
        "body": "술래가 상황을 외치면 나머지가 알맞은 인사말을 큰 소리로 답해요. 번갈아 술래를 맡아요.",
        "materials": [
          "상황 카드"
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
            "q": "인사 놀이에서 술래는 무엇을 외치나요?",
            "a": "상황"
          },
          {
            "q": "상황을 들으면 무엇으로 답하나요?",
            "a": "알맞은 인사말"
          },
          {
            "q": "놀이로 인사하면 무엇이 좋을까요?",
            "a": "즐겁게 익혀요"
          }
        ],
        "self": [
          "인사 놀이를 즐겁게 해요",
          "조금 어색해요",
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
          "놀이로 여러 인사말을 연습했어요",
          "상황을 듣고 알맞은 인사말을 빠르게 골랐어요",
          "인사말이 더 친근하고 자신 있어졌어요"
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
        "body": "다음 시간에는 알맞은 인사말 고르기와 글자·소리가 다른 낱말 읽기로 이 단원을 정리할 거예요!"
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
      "title": "배운 인사말 모으기",
      "content": "“이 단원에서 배운 인사말을 다 같이 외쳐 볼까요?” 배운 말을 한자리에 모으며 놀이를 준비해요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_game",
      "type": "tip",
      "icon": "🧩",
      "title": "놀이 규칙은 단순하게",
      "content": "규칙 설명은 짧게, 시범은 확실하게! 교사가 짝과 한 번 시범을 보이면 모두가 금방 따라 해요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_ready",
      "type": "fun_question",
      "icon": "🎲",
      "title": "준비 점검",
      "content": "“상황을 들으면 어떤 인사말이 떠오르는지, 머릿속 준비됐나요?” 두뇌 준비 운동으로 긴장을 풀어요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_recall",
      "type": "real_world",
      "icon": "🌍",
      "title": "놀이가 곧 연습",
      "content": "놀이에서 빠르게 답해 본 인사말은 실제 상황에서도 자연스럽게 나와요. 놀이와 생활을 이어 주세요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "판정은 함께",
      "content": "인사말이 알맞은지 교사 혼자 판정하지 말고 모둠이 함께 판단하게 하세요. 판단도 배움이에요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "x_speed",
      "type": "misconception",
      "icon": "❓",
      "title": "빨리만 외치면 이긴다?",
      "content": "속도 경쟁이 되면 아무 말이나 외쳐요. ‘알맞게’가 먼저, ‘빠르게’는 그다음임을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "q_judge",
      "type": "fun_question",
      "icon": "💡",
      "title": "다른 답도 될까",
      "content": "“‘미안해’ 말고 ‘괜찮아?’도 될까요?” 한 상황에 어울리는 인사말이 여럿일 수 있음을 함께 살펴요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "g_quick",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "상황 외침 ↔ 인사말",
      "description": "놀이 속 상황과 알맞은 인사말을 짝지어 보세요.",
      "hint": "상황을 듣자마자 떠오르는 인사말을 찾아요.",
      "pairs": [
        {
          "a": {
            "text": "🎂 친구 생일이야!"
          },
          "b": {
            "text": "축하해!"
          }
        },
        {
          "a": {
            "text": "🙇 이웃 어른을 만났어!"
          },
          "b": {
            "text": "안녕하세요"
          }
        },
        {
          "a": {
            "text": "😥 발을 밟았어!"
          },
          "b": {
            "text": "미안해"
          }
        },
        {
          "a": {
            "text": "🍚 밥을 다 먹었어!"
          },
          "b": {
            "text": "잘 먹었습니다"
          }
        }
      ],
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "t_present",
      "type": "tip",
      "icon": "🗣",
      "title": "전체 답하기의 힘",
      "content": "반 전체가 한목소리로 답하면 부끄러운 아이도 자연스럽게 입을 열어요. 다 같이 외치게 해 주세요.",
      "fit_slides": [
        "present"
      ]
    },
    {
      "id": "e_team",
      "type": "extension",
      "icon": "⬆",
      "title": "모둠 대항전",
      "content": "익숙해지면 모둠 대항으로 — 한 모둠이 상황을 내고 다른 모둠이 답하는 방식으로 확장해 보세요.",
      "fit_slides": [
        "present",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "가장 어려웠던 상황",
      "content": "“오늘 놀이에서 가장 헷갈렸던 상황은 무엇이었나요?” 어려웠던 것을 함께 한 번 더 짚어요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "정리 예고",
      "content": "“이제 이 단원도 마무리 두 시간만 남았어요!” 배운 것을 모아 정리할 시간임을 알려요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l11"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 11,
    "title": "배운 내용을 정리해요",
    "std": "[2국01-02] · [2국04-02]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 두 갈래 정리 → 인사말 집 찾기 카드 → 연음 낱말 정리 발문 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "배운 내용을 정리해요",
        "subtitle": "5단원 · 11/12차시 · 단원 마무리"
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
          "상황에 맞는 인사말을 골라 정리해요",
          "글자와 소리가 다른 낱말을 정리해요"
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
        "scene_title": "인사말이 집을 잃었어요 🏘️",
        "visual": "🏘️",
        "question": "인사말들이 자기 집(상황)을 찾고 있어요.<br>알맞은 집을 찾아 데려다줄 수 있나요?",
        "img": "assets/photo/korean/greeting_review.jpg"
      },
      "suggested_extras": [
        "q_home",
        "r_review"
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
            "q": "인사 놀이에서 술래는 무엇을 외치나요?",
            "a": "상황"
          },
          {
            "q": "놀이로 인사하면 무엇이 좋을까요?",
            "a": "즐겁게 익혀요"
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
        "title": "이 단원의 두 갈래 정리",
        "content": "이 단원에서 우리는 **상황·상대에 알맞은 인사말**과 **글자와 소리가 다른 낱말 읽기**를 배웠어요. 둘 다 차근차근 정리해요!",
        "symbol_meanings": [
          {
            "symbol": "상대에 따라",
            "meaning": "안녕 ↔ 안녕하세요"
          },
          {
            "symbol": "상황에 따라",
            "meaning": "고마워·미안해·축하해"
          },
          {
            "symbol": "글자 = 소리",
            "meaning": "하늘 [하늘]"
          },
          {
            "symbol": "글자 ≠ 소리",
            "meaning": "걸음 [거름] — 받침이 넘어가요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_mix"
      ],
      "tnote": {
        "ask": [
          "이 단원에서 무엇이 가장 기억에 남니?"
        ],
        "watch": "단원 두 갈래 종합",
        "min": 3
      }
    },
    {
      "id": "s05",
      "stage": "활동",
      "block": "card_quiz",
      "data": {
        "title": "인사말 집 찾기 🏘️",
        "sub": "인사말이 어느 집(상황)에 사는지 찾아 줘요. 카드를 누르면 알맞은 집이 나와요!",
        "cards": [
          {
            "clue": "‘안녕히 주무세요’의 집은?<br>언제 하는 인사일까요?",
            "emoji": "🌙",
            "name": "잠자리에 들 때"
          },
          {
            "clue": "‘다녀오겠습니다’의 집은?<br>언제 하는 인사일까요?",
            "emoji": "🎒",
            "name": "집을 나설 때"
          },
          {
            "clue": "‘축하합니다’의 집은?<br>언제 하는 인사일까요?",
            "emoji": "🎉",
            "name": "좋은 일이 생겼을 때"
          },
          {
            "clue": "‘죄송합니다’의 집은?<br>언제 하는 인사일까요?",
            "emoji": "🙏",
            "name": "웃어른께 잘못했을 때"
          }
        ],
        "outro": "인사말이 모두 자기 집을 찾았어요! 상황을 보면 알맞은 인사말이 보여요 😊"
      },
      "suggested_extras": [
        "q_reverse",
        "g_home"
      ]
    },
    {
      "id": "s06",
      "stage": "발표",
      "block": "question",
      "data": {
        "title": "소리가 넘어가는 낱말 정리",
        "question": "글자와 소리가 다른 낱말을 다시 한번 정리해 봐요.",
        "items": [
          "‘국어’는 어떻게 소리 나죠? ([구거])",
          "‘웃음’은 어떻게 소리 나죠? ([우슴])",
          "‘바다’도 소리가 달라지나요? (아니요, 글자대로!)"
        ]
      },
      "suggested_extras": [
        "t_present",
        "e_both"
      ]
    },
    {
      "id": "s101",
      "stage": "활동",
      "block": "leveled_problem",
      "data": {
        "title": "두 갈래로 배운 것 정리하기",
        "levels": {
          "읽기": {
            "q": "단원에서 배운 '인사말·글자와 소리'를 읽어 볼까요?",
            "a": "인사말·글자와 소리"
          },
          "쓰기": {
            "q": "상대와 상황에 맞게 하는 것 '인사말'을 써 볼까요?",
            "a": "인사말"
          },
          "말하기": {
            "q": "이 단원에서 배운 두 갈래를 말해 봐요.",
            "a": "여러 답 (예: 알맞은 인사말과 글자와 소리가 다른 낱말)",
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
        "title": "인사말 집 찾기 짝 놀이",
        "type": "pair",
        "goal": "인사말을 상대·상황별로 알맞게 놓아요",
        "body": "인사말 카드를 상대·상황별 집에 알맞게 놓고 짝과 서로 확인해요.",
        "materials": [
          "인사말 카드"
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
            "q": "상대와 상황에 맞게 하는 것은?",
            "a": "인사말"
          },
          {
            "q": "글자와 소리가 다른 낱말 하나는?",
            "a": "걸음(거름) 등"
          },
          {
            "q": "이 단원은 몇 갈래로 배웠나요?",
            "a": "두 갈래(인사말·바르게 읽기)"
          }
        ],
        "self": [
          "배운 내용을 정리해요",
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
          "인사말을 알맞은 상황과 짝지었어요",
          "글자와 소리가 다른 낱말을 정리했어요",
          "단원의 두 갈래를 모두 돌아봤어요"
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
        "body": "다음 시간은 이 단원의 마지막! 인사말을 바르게 따라 쓰고 내가 얼마나 자랐는지 돌아볼 거예요!"
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
      "title": "단원 첫 기억",
      "content": "“이 단원 첫 시간, 우리가 무슨 이야기로 시작했죠?(아침 인사)” 시작을 떠올리며 정리를 열어요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_recap",
      "type": "tip",
      "icon": "🧩",
      "title": "두 갈래를 나눠 정리",
      "content": "인사말 갈래와 소리 갈래를 한꺼번에 섞지 말고 차례로 정리하세요. 갈래마다 머리가 정돈돼요.",
      "fit_slides": [
        "objective",
        "concept"
      ]
    },
    {
      "id": "q_home",
      "type": "fun_question",
      "icon": "🏘️",
      "title": "집 찾기 상상",
      "content": "“‘고마워’의 집은 어떤 모습일까요?” 상황을 집으로 상상하면 정리 활동이 이야기처럼 즐거워요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_review",
      "type": "real_world",
      "icon": "🌍",
      "title": "실천 점검",
      "content": "l09에서 다짐한 인사를 실천했는지 살짝 물어봐 주세요. 정리와 실천이 이어져요.",
      "fit_slides": [
        "motivate",
        "question"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "네 칸 표로",
      "content": "칠판을 네 칸(상대·상황·글자=소리·글자≠소리)으로 나눠 정리하면 단원 전체가 한눈에 보여요.",
      "fit_slides": [
        "concept",
        "card_quiz"
      ]
    },
    {
      "id": "x_mix",
      "type": "misconception",
      "icon": "❓",
      "title": "갈래 섞임 주의",
      "content": "인사말 문제에 소리 규칙을 답하는 등 갈래가 섞이는 아이가 있어요. 지금 어떤 갈래를 묻는지 짚어 주세요.",
      "fit_slides": [
        "concept",
        "question"
      ]
    },
    {
      "id": "q_reverse",
      "type": "fun_question",
      "icon": "💡",
      "title": "거꾸로 문제",
      "content": "“이번엔 거꾸로! ‘좋은 일이 생겼을 때’ 집에는 어떤 인사말이 살까요?” 양방향으로 확인해요.",
      "fit_slides": [
        "card_quiz"
      ]
    },
    {
      "id": "g_home",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "인사말 ↔ 집(상황)",
      "description": "인사말과 그 인사말이 사는 집을 짝지어 보세요.",
      "hint": "언제, 누구에게 하는 인사인지 생각해요.",
      "pairs": [
        {
          "a": {
            "text": "안녕히 주무세요"
          },
          "b": {
            "text": "🌙 잘 때"
          }
        },
        {
          "a": {
            "text": "다녀오겠습니다"
          },
          "b": {
            "text": "🎒 나설 때"
          }
        },
        {
          "a": {
            "text": "축하합니다"
          },
          "b": {
            "text": "🎉 좋은 일"
          }
        },
        {
          "a": {
            "text": "죄송합니다"
          },
          "b": {
            "text": "🙏 잘못했을 때"
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
      "title": "같은 소리 낱말도",
      "content": "소리 정리에서 ‘바다’처럼 글자대로인 낱말을 꼭 섞어 물어보세요. 가려내는 힘이 완성돼요.",
      "fit_slides": [
        "question"
      ]
    },
    {
      "id": "e_both",
      "type": "extension",
      "icon": "⬆",
      "title": "인사말 속 소리 찾기",
      "content": "익숙해진 아이에겐 ‘잘 먹었습니다[잘 머걷씀니다]’처럼 인사말 속 소리 변화를 찾게 하면 두 갈래가 만나요.",
      "fit_slides": [
        "question",
        "next_lesson"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "두 갈래 한 줄 정리",
      "content": "“이 단원에서 배운 두 가지를 한 줄로 말해 볼까요?” 정리를 아이 입으로 마무리해요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "마지막 시간 안내",
      "content": "“다음 시간엔 따라 쓰기와 나 돌아보기로 단원을 마쳐요.” 마무리 마음가짐을 안내해요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

LESSONS["u5_l12"] =
{
  "meta": {
    "grade": 1,
    "subject": "국어",
    "unit": 5,
    "n": 12,
    "title": "기초를 다지고 스스로 돌아봐요",
    "std": "[2국01-02] · [2국02-05]",
    "duration_min": 40,
    "lesson_format": "교사주도 8슬 — 마지막 시간 → 따라 쓰기와 돌아보기 안내 → 마지막 초성 퀴즈 → 비교 없는 자기 돌아보기 발표 · 40분 표준 증보(국어 §7)"
  },
  "slides": [
    {
      "id": "s01",
      "stage": "열기",
      "block": "cover",
      "data": {
        "title": "기초를 다지고 스스로 돌아봐요",
        "subtitle": "5단원 · 12/12차시 · 단원 마무리"
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
          "인사말을 바르게 따라 써요",
          "배운 낱말로 마지막 퀴즈를 풀어요",
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
        "scene_title": "단원의 마지막 시간이에요 🎁",
        "visual": "🎁",
        "question": "인사말도, 시 읽기도, 소리 읽기도 배웠어요.<br>이 단원을 시작할 때보다 무엇이 늘었을까요?",
        "img": "assets/photo/korean/self_reflect.jpg"
      },
      "suggested_extras": [
        "q_grow",
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
            "q": "상대와 상황에 맞게 하는 것은?",
            "a": "인사말"
          },
          {
            "q": "이 단원은 몇 갈래로 배웠나요?",
            "a": "두 갈래"
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
        "title": "바르게 쓰고, 나를 돌아봐요",
        "content": "인사말을 **글자의 짜임을 생각하며 바르게 따라 쓰고**, 이 단원에서 내가 얼마나 자랐는지 **나 스스로** 돌아봐요!",
        "symbol_meanings": [
          {
            "symbol": "안녕하세요",
            "meaning": "바른 자세로 또박또박 따라 써요"
          },
          {
            "symbol": "고맙습니다",
            "meaning": "받침까지 정확하게 써요"
          },
          {
            "symbol": "잘 자요",
            "meaning": "띄어쓰기도 살펴 가며 써요"
          },
          {
            "symbol": "나 돌아보기",
            "meaning": "친구와 비교하지 않고 나의 자람을 봐요"
          }
        ]
      },
      "suggested_extras": [
        "t_concept",
        "x_compare"
      ],
      "tnote": {
        "ask": [
          "이 단원에서 무엇이 늘었니?"
        ],
        "watch": "비교 없는 자기 돌아보기(지난날의 나 기준)",
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
            "chosung": "ㅇ ㅅ",
            "answer": "인사",
            "emoji": "🙇",
            "hint": "마음을 여는 문! 이 단원의 주인공"
          },
          {
            "chosung": "ㅊ ㅎ",
            "answer": "축하",
            "emoji": "🎉",
            "hint": "좋은 일이 생긴 친구에게 전하는 마음"
          },
          {
            "chosung": "ㄱ ㅇ",
            "answer": "걸음",
            "emoji": "👣",
            "hint": "[거름]으로 소리 나는 낱말!"
          },
          {
            "chosung": "ㅇ ㅇ",
            "answer": "음악",
            "emoji": "🎵",
            "hint": "[으막]으로 소리 나는 교과목!"
          }
        ]
      },
      "suggested_extras": [
        "q_final",
        "g_wrap"
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
        "hint": "“웃어른께 공손하게 인사하게 됐어요” 처럼 말해 봐요",
        "end_msg": "모두 자기만의 속도로 자랐어요. 5단원을 끝까지 해낸 우리 반, 정말 멋져요! 🎉"
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
        "title": "바르게 쓰고 스스로 돌아보기",
        "levels": {
          "읽기": {
            "q": "초성으로 낱말 'ㅇㄴ → 안녕'을 알아맞혀 읽어 볼까요?",
            "a": "안녕"
          },
          "쓰기": {
            "q": "만났을 때 반갑게 하는 인사 '안녕'을 바르게 써 볼까요?",
            "a": "안녕"
          },
          "말하기": {
            "q": "이 단원에서 내가 잘하게 된 것을 스스로 돌아보며 말해 봐요.",
            "a": "여러 답 (예: 상대에 맞게 인사할 수 있어요)",
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
        "title": "초성 인사말 맞히기 짝 놀이",
        "type": "pair",
        "goal": "초성을 보고 인사말을 맞혀요",
        "body": "한 사람이 인사말의 초성을 보여 주면 짝이 알맞은 인사말을 맞혀요. 역할을 바꿔 가며 해요.",
        "materials": [
          "초성 카드"
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
            "q": "만났을 때 반갑게 하는 인사는?",
            "a": "안녕"
          },
          {
            "q": "스스로 돌아볼 때 누구와 견주지 않나요?",
            "a": "다른 친구"
          },
          {
            "q": "내가 잘하게 된 것은 누구를 기준으로 보나요?",
            "a": "지난날의 나"
          }
        ],
        "self": [
          "배운 것을 스스로 돌아봐요",
          "조금 더 연습할래요",
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
        "title": "5단원에서 배운 것",
        "points": [
          "상황과 상대에 알맞은 인사말을 하게 됐어요",
          "인사가 담긴 시를 즐겁게 따라 읽었어요",
          "글자와 소리가 다른 낱말을 자연스럽게 읽게 됐어요"
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
        "preview": "6단원 — 또박또박 읽어요",
        "body": "다음 단원에서는 마침표·물음표 같은 문장 부호를 만나고, 문장을 또박또박 띄어 읽는 법을 배울 거예요!"
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
      "title": "마지막 시간 인사",
      "content": "“단원 마지막 시간이니, 시작 인사를 평소보다 더 마음 담아 해 볼까요?” 배운 것을 바로 써 봐요.",
      "fit_slides": [
        "cover",
        "motivate"
      ]
    },
    {
      "id": "t_base",
      "type": "tip",
      "icon": "🧩",
      "title": "편안한 마무리",
      "content": "기초 다지기는 시험이 아니라 배운 것을 단단히 하는 시간이에요. 편안한 분위기로 진행해 주세요.",
      "fit_slides": [
        "objective",
        "chosung_quiz"
      ]
    },
    {
      "id": "q_grow",
      "type": "fun_question",
      "icon": "🎁",
      "title": "자란 점 찾기",
      "content": "“단원을 시작할 때의 나와 지금의 나, 무엇이 달라졌나요?” 자람을 스스로 발견하게 해요.",
      "fit_slides": [
        "motivate"
      ]
    },
    {
      "id": "r_letter",
      "type": "real_world",
      "icon": "🌍",
      "title": "인사말 쪽지",
      "content": "따라 쓴 인사말로 가족에게 짧은 쪽지를 써 보게 하면, 쓰기 연습이 진짜 마음 전하기가 돼요.",
      "fit_slides": [
        "motivate",
        "present"
      ]
    },
    {
      "id": "t_concept",
      "type": "tip",
      "icon": "🧩",
      "title": "쓰기 전 소리 내어",
      "content": "따라 쓰기 전에 인사말을 소리 내어 읽게 하세요. 소리·글자·뜻이 함께 이어져요.",
      "fit_slides": [
        "concept",
        "chosung_quiz"
      ]
    },
    {
      "id": "x_compare",
      "type": "misconception",
      "icon": "❓",
      "title": "돌아보기 = 점수 매기기?",
      "content": "돌아보기를 잘함·못함 점수로 여기는 아이가 있어요. ‘처음보다 나아진 점 찾기’임을 짚어 주세요.",
      "fit_slides": [
        "concept",
        "present"
      ]
    },
    {
      "id": "q_final",
      "type": "fun_question",
      "icon": "💡",
      "title": "보너스 문제",
      "content": "“‘잘 먹겠습니다’는 언제 하는 인사죠?” 퀴즈 사이사이 배운 인사말을 보너스로 짚어요.",
      "fit_slides": [
        "chosung_quiz"
      ]
    },
    {
      "id": "g_wrap",
      "type": "game",
      "game_kind": "memory_match",
      "icon": "🎮",
      "title": "단원 총정리 짝짓기",
      "description": "이 단원에서 배운 것끼리 짝지어 보세요.",
      "hint": "인사말 갈래와 소리 갈래를 모두 떠올려요.",
      "pairs": [
        {
          "a": {
            "text": "🙇 웃어른께"
          },
          "b": {
            "text": "안녕하세요"
          }
        },
        {
          "a": {
            "text": "🎉 좋은 일에"
          },
          "b": {
            "text": "축하해"
          }
        },
        {
          "a": {
            "text": "👣 걸음"
          },
          "b": {
            "text": "[거름]"
          }
        },
        {
          "a": {
            "text": "📖 국어"
          },
          "b": {
            "text": "[구거]"
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
      "content": "알맞은 인사말을 한다 / 시를 즐겁게 읽는다 / 소리가 넘어가는 낱말을 읽는다 — 세 가지를 스스로 점검하게 해요.",
      "fit_slides": [
        "present",
        "summary"
      ]
    },
    {
      "id": "q_reflect",
      "type": "fun_question",
      "icon": "💡",
      "title": "단원의 한 장면",
      "content": "“이 단원에서 가장 기억에 남는 한 장면은?” 배움의 순간을 함께 떠올리며 마무리해요.",
      "fit_slides": [
        "summary"
      ]
    },
    {
      "id": "e_plan",
      "type": "extension",
      "icon": "⬆",
      "title": "6단원 잇기",
      "content": "“물음표(?)를 본 적 있나요? 다음 단원에서 그 친구들을 만나요!” 문장 부호로 호기심을 심어요.",
      "fit_slides": [
        "next_lesson"
      ]
    }
  ]
};

