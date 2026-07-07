/* ============================================================
   1학년 1학기 국어 — 1단원 「글자를 만들어요」 (케이티처)
   양산 영역 — LESSONS["u1_l{NN}"] 누적 / 다른 단원·과목 .js = read-only
   g1_korean.html이 자동 로드 후 LESSONS 에 누적.
   ------------------------------------------------------------
   ★ 케이티처 = 교사 주도 수업 도구. 로깅 없음(수업 진행용).
   ★ 트랙 = 한글 해득(받침 없는 글자). 핵심 = 분해·결합 원리.
     ③ "글자 만들기(결합)"가 차시의 심장. concept의 symbol_meanings로
     ㄱ+ㅏ=가 결합을 표시, card_quiz/chosung_quiz/question으로 짜임 다룸.
   ★ 저작권: 교과서·지도서 본문·그림·삽화 미게재. 학습 목표·결합 원리·
     활동 의도만 차용. 예시 낱말(가지·오이·포도 등)은 보편/교과 어휘로 자체 구성.
   ------------------------------------------------------------
   차시 구성(14차시):
   l01 단원도입(배울 내용 살펴보기) · l02 단원도입(글자가 필요한 까닭)
   l03 자음자·모음자 찾기 · l04 자음자·모음자로 글자 만들기
   l05 받침 없는 글자의 짜임(옆·위아래) · l06 글자 만들기 놀이
   l07 바르게 읽는 자세 · l08 바르게 쓰는 자세
   l09 여러 모음자 ①(ㅐ·ㅔ) · l10 여러 모음자 ②(ㅒ·ㅖ·ㅘ·ㅙ·ㅚ)
   l11 여러 모음자 ③(ㅝ·ㅞ·ㅟ·ㅢ) + 낱말 놀이
   l12 글자 짜임 점검 놀이 · l13 자음자·모음자로 놀이하기 · l14 마무리(낱말 만들고 또박또박 읽기)
============================================================ */

  /* ─────────── l01 배울 내용 살펴보기 ─────────── */
  LESSONS["u1_l01"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 1,
      "title": "배울 내용을 살펴봐요",
      "std": "[2국04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 글자 호기심 → 글자는 자모로 이뤄짐 → 그림 속 자모 찾기 → 어디서 글자를 봤나 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글자를 만들어요",
          "subtitle": "1단원 · 1/14차시 · 단원 도입"
        },
        "suggested_extras": [
          "v_song",
          "q_open"
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
            "글자가 자음자와 모음자로 이뤄짐을 느껴요",
            "그림과 우리 둘레에서 글자를 찾아봐요"
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
          "scene_title": "글자가 궁금했던 적 있나요? 🔤",
          "visual": "🔤",
          "question": "간판·표지판·책에서 본 글자,<br>어떻게 만들어졌을까요? 함께 알아봐요!",
          "img": "assets/photo/korean/letters_intro.jpg"
        },
        "suggested_extras": [
          "q_around",
          "r_sign"
        ]
      },
      {
        "id": "s04",
        "stage": "만나기",
        "block": "concept",
        "data": {
          "title": "글자는 자음자 + 모음자",
          "content": "받침이 없는 글자는 **자음자**와 **모음자**가 만나 이뤄져요. 이번 단원에서 그 짜임을 차근차근 배울 거예요!",
          "symbol_meanings": [
            {
              "symbol": "자음자",
              "meaning": "ㄱ ㄴ ㄷ ㅁ ㅅ …"
            },
            {
              "symbol": "모음자",
              "meaning": "ㅏ ㅓ ㅗ ㅜ ㅣ …"
            },
            {
              "symbol": "ㄱ + ㅏ",
              "meaning": "→ 가"
            },
            {
              "symbol": "ㄴ + ㅜ",
              "meaning": "→ 누"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_letter"
        ],
        "tnote": {
          "ask": [
            "우리 주변 어디에 글자가 있을까?"
          ],
          "watch": "글자에 대한 관심 열기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "그림 속 글자를 찾아봐요! 🔍",
          "sub": "카드를 눌러서 어떤 낱말인지 맞혀 봐요!",
          "cards": [
            {
              "clue": "쑥쑥 자라는<br>초록 친구!",
              "emoji": "🌳",
              "name": "나무"
            },
            {
              "clue": "칙칙폭폭<br>길을 달려요!",
              "emoji": "🚆",
              "name": "기차"
            },
            {
              "clue": "동그란 얼굴에<br>밝게 빛나요!",
              "emoji": "🌞",
              "name": "해"
            }
          ],
          "outro": "낱말마다 자음자와 모음자가 숨어 있어요. 이번 단원에서 하나씩 찾아볼 거예요! 😊"
        },
        "suggested_extras": [
          "q_find",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "어디에서 글자를 봤나요?",
          "question": "우리 둘레 어디에서 글자를 보았는지 떠올려 말해 봐요!",
          "items": [
            "우리 교실 — 어디에 글자가 있나요?",
            "집에 가는 길 — 어떤 글자를 봤나요?",
            "내가 가진 물건 — 글자가 적혀 있나요?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "r_sign"
        ]
      },
      {
        "id": "s100",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "글자와 친해지기",
          "levels": {
            "읽기": {
              "q": "내 이름의 첫 글자를 소리 내어 읽어 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "쓰기": {
              "q": "내가 아는 글자 하나를 따라 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "주변에서 본 글자를 하나 말해 봐요.",
              "a": "여러 답 (예: 간판·책 제목)",
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
          "title": "글자 찾기 짝 놀이",
          "type": "pair",
          "goal": "교실에서 글자를 함께 찾아요",
          "body": "짝과 함께 교실을 둘러보며 눈에 띄는 글자를 번갈아 가리켜요.",
          "materials": [
            "글자 카드"
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
              "q": "오늘 무엇에 대해 배웠나요?",
              "a": "글자"
            },
            {
              "q": "글자는 어디에서 볼 수 있을까요?",
              "a": "책·간판 등 여러 곳"
            },
            {
              "q": "글자를 배우면 무엇이 좋을까요?",
              "a": "읽고 쓸 수 있어요"
            }
          ],
          "self": [
            "글자에 관심이 생겼어요",
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
            "이 단원에서 글자의 짜임을 배운다는 걸 알았어요",
            "글자는 자음자와 모음자로 이뤄짐을 느꼈어요",
            "그림과 둘레에서 글자를 찾아봤어요"
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
          "preview": "글자를 읽고 쓰면 어떤 점이 좋은지 알아봐요",
          "body": "글자를 몰라 답답했던 때를 떠올리며, 글자가 필요한 까닭을 함께 찾아봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ],
    "extras": [
      {
        "id": "v_song",
        "type": "video",
        "icon": "🎥",
        "title": "한글 자음·모음 노래",
        "url": "https://www.youtube.com/results?search_query=%ED%95%9C%EA%B8%80+%EC%9E%90%EC%9D%8C+%EB%AA%A8%EC%9D%8C+%EB%85%B8%EB%9E%98+%EC%9C%A0%EC%95%84",
        "description": "자음자·모음자를 노래로 만나며 흥미를 여는 영상. 수업 시작 분위기 띄우기용.",
        "source": "유튜브 검색 (교사 사전 확인 권장)",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "q_open",
        "type": "fun_question",
        "icon": "💡",
        "title": "내 이름에 숨은 글자",
        "content": "“여러분 이름에도 글자가 들어 있죠? 몇 글자인가요?” 가볍게 물으며 글자 이야기로 문을 열어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "도입은 ‘호기심’이 목표",
        "content": "이 차시는 정확한 지식 전달이 아니라 한글 학습에 흥미를 갖게 하는 준비 차시예요. 맞고 틀림보다 즐거운 참여에 둬요.",
        "fit_slides": [
          "objective"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "교실 속 글자 찾기",
        "content": "“우리 교실에서 글자가 보이는 곳을 손으로 가리켜 볼까요?” 모두가 둘러보며 참여하게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_sign",
        "type": "real_world",
        "icon": "🌍",
        "title": "길에서 만나는 글자",
        "content": "간판·버스 번호·표지판처럼 생활 곳곳에 글자가 있어요. 등굣길에 본 글자를 떠올리면 학습이 생활과 이어져요.",
        "fit_slides": [
          "motivate",
          "question"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "결합은 ‘보여 주기’부터",
        "content": "ㄱ과 ㅏ를 따로 보여 준 뒤 손으로 모아 ‘가’가 되는 모습을 천천히 보여 주면 결합 원리가 눈으로 들어와요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_letter",
        "type": "misconception",
        "icon": "❓",
        "title": "글자 = 그림 아님",
        "content": "글자를 그림처럼 통째로 외우려는 아이가 있어요. 글자는 자음자+모음자가 ‘합쳐진 것’임을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_find",
        "type": "fun_question",
        "icon": "💡",
        "title": "카드 속 자음 찾기",
        "content": "카드를 뒤집은 뒤 “이 낱말에 ㄱ이 보이나요?”처럼 아는 자모를 짚게 하면 다음 차시로 자연스럽게 이어져요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "그림 ↔ 첫소리 짝짓기",
        "description": "그림과 그 낱말의 첫소리(초성)를 짝지어 보세요.",
        "hint": "낱말을 소리 내어 읽고 첫 글자 소리를 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🌳 나무"
            },
            "b": {
              "text": "ㄴ"
            }
          },
          {
            "a": {
              "text": "🚆 기차"
            },
            "b": {
              "text": "ㄱ"
            }
          },
          {
            "a": {
              "text": "🌞 해"
            },
            "b": {
              "text": "ㅎ"
            }
          },
          {
            "a": {
              "text": "📚 책"
            },
            "b": {
              "text": "ㅊ"
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
        "icon": "🧩",
        "title": "손가락으로 가리키게",
        "content": "말로 답하기 어려워하는 아이는 글자가 있는 곳을 손가락으로 가리키게만 해도 충분히 참여한 거예요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 새로 안 것",
        "content": "“글자가 무엇으로 이뤄진다고 했죠?” 되짚으며 마무리해요. (자음자+모음자)",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "글자 못 읽어 불편했던 때",
        "content": "다음 시간을 위해, 글자를 몰라 답답했던 경험을 하나 떠올려 두게 하면 도입이 매끄러워요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l02"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 2,
      "title": "글자가 필요한 까닭",
      "std": "[2국04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 답답했던 경험 → 글자를 읽고 쓰면 좋은 점 → 생활 속 글자 맞히기 → 글자로 좋았던 일 발표 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글자가 필요한 까닭",
          "subtitle": "1단원 · 2/14차시 · 단원 도입"
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
            "글자를 몰라 답답했던 때를 떠올려요",
            "글자를 읽고 쓰면 좋은 점을 알아요",
            "생활 속에서 글자가 쓰이는 곳을 찾아요"
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
          "scene_title": "글자를 몰랐다면? 😵",
          "visual": "🤔",
          "question": "가게·병원·길에서 글자를 못 읽으면<br>어떤 일이 생길까요? 함께 생각해 봐요!",
          "img": "assets/photo/korean/why_letters.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "오늘 배운 것은?",
              "a": "글자"
            },
            {
              "q": "글자는 어디에서 볼까요?",
              "a": "여러 곳"
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
          "title": "글자를 읽고 쓰면 좋은 점",
          "content": "글자를 알면 **읽어서 알 수 있고**, **써서 전할 수 있어요.** 그래서 학교 공부도, 생활도 더 편리해져요!",
          "symbol_meanings": [
            {
              "symbol": "가게 🏪",
              "meaning": "무엇을 파는지 읽어요"
            },
            {
              "symbol": "병원 🏥",
              "meaning": "어디로 갈지 읽어요"
            },
            {
              "symbol": "길 🚸",
              "meaning": "표지판을 읽어요"
            },
            {
              "symbol": "편지 ✉️",
              "meaning": "마음을 써서 전해요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "r_life"
        ],
        "tnote": {
          "ask": [
            "글자가 없으면 무엇이 불편할까?"
          ],
          "watch": "글자로 뜻을 전한다는 감각",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "여기엔 어떤 글자가 있을까요?",
          "sub": "그림을 보고 어떤 곳인지, 어떤 글자를 보게 될지 맞혀 봐요!",
          "cards": [
            {
              "clue": "빵 냄새가 솔솔~<br>무엇을 파는 곳?",
              "emoji": "🥐",
              "name": "빵집"
            },
            {
              "clue": "책이 가득!<br>조용히 읽는 곳?",
              "emoji": "📚",
              "name": "도서관"
            },
            {
              "clue": "버스가 서는<br>이곳의 이름은?",
              "emoji": "🚏",
              "name": "버스 정류장"
            }
          ],
          "outro": "곳곳에 글자가 있어요. 글자를 읽으면 어디가 무엇을 하는 곳인지 알 수 있죠! 😊"
        },
        "suggested_extras": [
          "q_around2",
          "r_life"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "글자를 읽어서 좋았던 일 🎤",
          "sub": "버튼을 누르면 발표할 친구를 뽑아요. 글자를 읽거나 써서 좋았던 일을 말해요!",
          "count": 24,
          "hint": "“저는 ○○을(를) 읽어서 ~했어요” 처럼 말해 봐요",
          "end_msg": "글자가 우리 생활에 얼마나 도움이 되는지 함께 알았어요. 잘했어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "q_why"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "글자가 하는 일",
          "levels": {
            "읽기": {
              "q": "'물'이라고 쓰인 컵과 빈 컵 중 어느 것이 물일까요?",
              "a": "'물'이라고 쓰인 컵",
              "steps": [
                "글자가 뜻을 알려줘요"
              ]
            },
            "쓰기": {
              "q": "내 물건에 붙일 이름표에 글자를 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "글자가 없다면 어떤 점이 불편할지 말해 봐요.",
              "a": "여러 답 (예: 어디가 화장실인지 몰라요)",
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
          "title": "이름표 만들기 짝 활동",
          "type": "pair",
          "goal": "글자로 뜻을 전해요",
          "body": "짝과 서로의 물건에 이름표를 만들어 붙여 줘요.",
          "materials": [
            "종이",
            "색연필"
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
              "q": "글자는 무엇을 전할까요?",
              "a": "뜻·생각"
            },
            {
              "q": "이름표에 글자를 쓰면?",
              "a": "누구 것인지 알 수 있어요"
            },
            {
              "q": "글자가 없으면?",
              "a": "뜻을 전하기 어려워요"
            }
          ],
          "self": [
            "글자의 쓰임을 알아요",
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
            "글자를 몰라 답답했던 때를 떠올렸어요",
            "글자를 읽고 쓰면 좋은 점을 알았어요",
            "생활 속에서 글자가 쓰이는 곳을 찾았어요"
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
          "preview": "낱말 속에서 자음자와 모음자를 찾아봐요",
          "body": "시장에서 보는 낱말로 글자 속 자음자와 모음자를 직접 찾아볼 거예요!"
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
        "title": "글자가 없는 하루?",
        "content": "“만약 세상에 글자가 하나도 없다면 어떨까요?” 상상해 보게 하면 글자의 필요성으로 자연스럽게 들어가요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "‘필요성 느끼기’가 핵심",
        "content": "이 차시는 글자 지식이 아니라 ‘왜 글자를 배워야 하나’를 마음으로 느끼는 데 초점을 둬요. 생활 경험을 많이 끌어내세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "길 잃은 경험",
        "content": "“길을 잃었는데 글자를 못 읽으면 어떨까요?” 구체적 상황으로 답답함을 떠올리게 해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "읽기와 쓰기 둘 다",
        "content": "글자는 ‘읽어서 아는 것’과 ‘써서 전하는 것’ 두 쓰임이 있어요. 두 가지를 함께 보여 주면 균형이 잡혀요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "r_life",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 동네 글자 지도",
        "content": "가게 이름, 정류장 이름, 학교 이름 등 동네에서 본 글자를 떠올리면 학습이 생활과 단단히 이어져요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_around2",
        "type": "fun_question",
        "icon": "💡",
        "title": "간판 상상하기",
        "content": "카드를 뒤집기 전에 “여기엔 무슨 글자가 적혀 있을까요?” 먼저 상상하게 하면 흥미가 살아나요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "t_present",
        "type": "tip",
        "icon": "🧩",
        "title": "발표는 짧은 한마디",
        "content": "“책 제목을 읽었어요”처럼 짧은 한마디면 충분해요. 경험이 떠오르지 않으면 친구 발표를 듣기만 해도 좋아요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_why",
        "type": "fun_question",
        "icon": "💡",
        "title": "그때 기분은?",
        "content": "“글자를 읽었을 때 기분이 어땠나요?” 한 번 더 물으면 단순 사실이 아니라 느낌을 말하는 연습이 돼요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "x_read",
        "type": "misconception",
        "icon": "❓",
        "title": "읽기 = 외우기 아님",
        "content": "글자를 통째로 외우는 게 읽기라고 여기기 쉬워요. 자음자·모음자 소리를 합쳐 읽는 것이 진짜 읽기임을 다음 차시부터 익혀요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "g_place",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "장소 ↔ 하는 일 짝짓기",
        "description": "장소와 그곳에서 하는 일을 짝지어 보세요.",
        "hint": "그곳에 가면 무엇을 할까요?",
        "pairs": [
          {
            "a": {
              "text": "🥐 빵집"
            },
            "b": {
              "text": "빵을 사요"
            }
          },
          {
            "a": {
              "text": "📚 도서관"
            },
            "b": {
              "text": "책을 읽어요"
            }
          },
          {
            "a": {
              "text": "🏥 병원"
            },
            "b": {
              "text": "진료를 받아요"
            }
          },
          {
            "a": {
              "text": "🚏 정류장"
            },
            "b": {
              "text": "버스를 타요"
            }
          }
        ],
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "글자가 좋은 까닭",
        "content": "“글자를 읽고 쓰면 왜 좋다고 했죠?” 되짚으며 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "시장 낱말 떠올리기",
        "content": "다음 시간 ‘낱말 속 자모 찾기’를 위해, 시장이나 마트에서 본 채소·과일 이름을 떠올려 두게 하면 좋아요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l03"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 3,
      "title": "자음자와 모음자를 찾아요",
      "std": "[2국04-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 시장 구경 → 글자 속 자모 위치 → 낱말에서 자모 찾기 → 자모로 나눠 보기 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "자음자와 모음자를 찾아요",
          "subtitle": "1단원 · 3/14차시 · 글자의 짜임"
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
            "낱말을 소리 내어 또박또박 읽어요",
            "글자 속에서 자음자와 모음자를 찾아요",
            "글자가 자음자와 모음자로 이뤄짐을 알아요"
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
          "scene_title": "시장에 가 볼까요? 🛒",
          "visual": "🥬",
          "question": "시장에는 무엇이 있을까요?<br>가지·오이·무… 이름 속에 자음자와 모음자가 숨어 있어요!",
          "img": "assets/photo/korean/consonant_vowel.jpg"
        },
        "suggested_extras": [
          "q_around",
          "r_market"
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
              "q": "글자는 무엇을 전할까요?",
              "a": "뜻"
            },
            {
              "q": "이름표에 글자를 쓰면?",
              "a": "누구 것인지 알아요"
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
          "title": "글자 속 자음자와 모음자",
          "content": "받침이 없는 글자는 **자음자**와 **모음자**로 나눌 수 있어요. 자모가 만나는 위치는 **옆**일 때도 있고 **위아래**일 때도 있어요!",
          "symbol_meanings": [
            {
              "symbol": "가 = ㄱ + ㅏ",
              "meaning": "옆으로 만나요"
            },
            {
              "symbol": "지 = ㅈ + ㅣ",
              "meaning": "옆으로 만나요"
            },
            {
              "symbol": "오 = ㅇ + ㅗ",
              "meaning": "위아래로 만나요"
            },
            {
              "symbol": "무 = ㅁ + ㅜ",
              "meaning": "위아래로 만나요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_pos"
        ],
        "tnote": {
          "ask": [
            "자음자와 모음자는 어떻게 다를까?"
          ],
          "watch": "자음자·모음자 구별",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "낱말 속 자음자와 모음자 찾기",
          "sub": "낱말을 함께 읽고, 어떤 자음자·모음자가 들어 있는지 찾아봐요!",
          "cards": [
            {
              "clue": "길쭉하고 보라색!<br>‘ㄱ·ㅏ·ㅈ·ㅣ’가 숨었어요",
              "emoji": "🍆",
              "name": "가지"
            },
            {
              "clue": "길고 초록색 채소!<br>‘ㅇ·ㅗ·ㅣ’가 숨었어요",
              "emoji": "🥒",
              "name": "오이"
            },
            {
              "clue": "동그란 가을 열매!<br>‘ㅍ·ㅗ·ㄷ·ㅗ’가 숨었어요",
              "emoji": "🍇",
              "name": "포도"
            }
          ],
          "outro": "낱말마다 자음자와 모음자가 들어 있죠? 글자는 이렇게 자모가 모여 만들어져요! 😊"
        },
        "suggested_extras": [
          "q_split",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "이 글자, 어떻게 나눌까요?",
          "question": "다음 글자를 자음자와 모음자로 나눠 함께 말해 봐요!",
          "items": [
            "‘무’는 어떤 자음자와 모음자로 나뉠까요?",
            "‘파’는 어떤 자음자와 모음자로 나뉠까요?",
            "‘배’는 어떤 자음자와 모음자로 나뉠까요?",
            "‘소’는 어떤 자음자와 모음자로 나뉠까요?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "e_word"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "자음자와 모음자 찾기",
          "levels": {
            "읽기": {
              "q": "ㄱ, ㄴ, ㄷ을 소리 내어 읽어 볼까요?",
              "a": "기역·니은·디귿"
            },
            "쓰기": {
              "q": "모음자 ㅏ, ㅓ를 따라 써 볼까요?",
              "a": "ㅏ·ㅓ"
            },
            "말하기": {
              "q": "자음자와 모음자가 어떻게 다른지 말해 봐요.",
              "a": "여러 답 (예: 자음자는 닿소리, 모음자는 홀소리)",
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
          "title": "자모 카드 나누기 짝 활동",
          "type": "pair",
          "goal": "자음자·모음자를 구별해요",
          "body": "섞인 카드를 짝과 함께 자음자 칸·모음자 칸으로 나눠요.",
          "materials": [
            "자모 카드"
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
              "q": "ㄱ은 무엇일까요?",
              "a": "자음자"
            },
            {
              "q": "ㅏ는 무엇일까요?",
              "a": "모음자"
            },
            {
              "q": "자음자와 모음자를 나누는 기준은?",
              "a": "소리 나는 방법"
            }
          ],
          "self": [
            "자음자·모음자를 구별해요",
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
            "낱말을 또박또박 소리 내어 읽었어요",
            "글자 속에서 자음자와 모음자를 찾았어요",
            "글자가 자음자와 모음자로 이뤄짐을 알았어요"
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
          "preview": "자음자와 모음자를 합쳐 글자를 만들어요",
          "body": "오늘 찾은 자음자와 모음자를 거꾸로 합쳐서 글자를 만들어 볼 거예요!"
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
        "title": "내가 아는 채소",
        "content": "“시장에서 본 채소나 과일 이름을 말해 볼까요?” 가볍게 물으며 낱말 떠올리기로 시작해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "먼저 읽고, 그다음 나누기",
        "content": "낱말을 소리 내어 읽은 뒤 자모로 나눠야 글자-소리 대응이 살아나요. 읽기 → 나누기 순서를 지켜 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "가게 떠올리기",
        "content": "시장 경험이 없는 아이에겐 “채소 가게엔 뭐가 있을까?”처럼 가게부터 떠올리게 하면 낱말이 잘 나와요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "r_market",
        "type": "real_world",
        "icon": "🌍",
        "title": "우리 동네 시장·마트",
        "content": "가지·오이·무·고구마·파처럼 시장에서 흔히 보는 낱말로 자모를 찾으면 학습이 생활과 이어져요.",
        "fit_slides": [
          "motivate",
          "card_quiz"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "옆·위아래 두 자리",
        "content": "자음자와 모음자는 옆으로(가) 만나기도, 위아래로(오) 만나기도 해요. 손으로 위치를 짚어 주면 짜임이 보여요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "x_pos",
        "type": "misconception",
        "icon": "❓",
        "title": "자모 위치를 헷갈리기",
        "content": "‘오’를 ‘ㅇ’이 위, ‘ㅗ’가 아래로 보지 않고 옆으로 쓰려는 아이가 있어요. 모음자 모양에 따라 자리가 정해짐을 짚어 주세요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_split",
        "type": "fun_question",
        "icon": "💡",
        "title": "손뼉으로 나누기",
        "content": "‘가-지’ 두 글자를 손뼉 두 번으로 나눠 보면 글자 단위가 몸으로 느껴져요. 그다음 각 글자를 자모로 나눠요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 첫 자음자 짝짓기",
        "description": "낱말과 그 첫 자음자를 짝지어 보세요.",
        "hint": "낱말을 읽고 첫 글자의 자음자를 생각해요.",
        "pairs": [
          {
            "a": {
              "text": "🍆 가지"
            },
            "b": {
              "text": "ㄱ"
            }
          },
          {
            "a": {
              "text": "🥒 오이"
            },
            "b": {
              "text": "ㅇ"
            }
          },
          {
            "a": {
              "text": "🍇 포도"
            },
            "b": {
              "text": "ㅍ"
            }
          },
          {
            "a": {
              "text": "🥬 무"
            },
            "b": {
              "text": "ㅁ"
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
        "icon": "🧩",
        "title": "함께 소리 내어 나누기",
        "content": "한 명만 시키기보다 “다 함께! ㅁ… ㅜ… 무!”처럼 반 전체가 소리 내어 나누면 모두 참여해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_word",
        "type": "extension",
        "icon": "⬆",
        "title": "새로운 낱말로 나누기",
        "content": "익숙해진 아이에겐 낯선 낱말(두부·자두 등)을 주고 자모로 나눠 보게 하면 한 단계 더 나아가요.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "x_name",
        "type": "misconception",
        "icon": "❓",
        "title": "이름 ‘읽기’와 헷갈리기",
        "content": "‘ㄱ’의 이름은 ‘기역’이지만, 글자를 만들 땐 [그] 소리로 써요. 이름 말하기와 소리 내기를 구분해 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "글자는 무엇으로?",
        "content": "“글자는 무엇과 무엇으로 이뤄진다고 했죠?” 되짚으며 마무리해요. (자음자+모음자)",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "자모 카드 준비",
        "content": "다음 시간 ‘글자 만들기’를 위해 자음자·모음자 카드를 미리 준비해 두면 바로 활동할 수 있어요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l04"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 4,
      "title": "자음자와 모음자로 글자를 만들어요",
      "std": "[2국04-01] · [2국03-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 자모 모으기 → 결합 원리 → 합치면 무슨 글자? → 자모 카드로 낱말 만들기 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "자음자와 모음자로 글자를 만들어요",
          "subtitle": "1단원 · 4/14차시 · 글자의 짜임"
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
            "자음자와 모음자를 합치는 방법을 알아요",
            "자모를 합쳐 글자를 만들어요",
            "만든 글자를 또박또박 읽어요"
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
          "scene_title": "자모를 모으면? 🧲",
          "visual": "🔡",
          "question": "흩어진 자음자와 모음자를 모으면<br>어떤 글자가 될까요? 함께 합쳐 봐요!",
          "img": "assets/photo/korean/make_letter.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "ㄱ은 무엇?",
              "a": "자음자"
            },
            {
              "q": "ㅏ는 무엇?",
              "a": "모음자"
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
          "title": "글자를 만드는 방법",
          "content": "자음자를 **먼저**, 모음자를 **그다음**에 자리에 맞춰 합치면 글자가 돼요. 모음자 모양에 따라 옆 또는 위아래에 붙여요!",
          "symbol_meanings": [
            {
              "symbol": "ㄴ + ㅏ",
              "meaning": "→ 나 (옆)"
            },
            {
              "symbol": "ㅅ + ㅗ",
              "meaning": "→ 소 (위아래)"
            },
            {
              "symbol": "ㅂ + ㅣ",
              "meaning": "→ 비 (옆)"
            },
            {
              "symbol": "ㄷ + ㅜ",
              "meaning": "→ 두 (위아래)"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_order"
        ],
        "tnote": {
          "ask": [
            "자음자와 모음자를 합치면 무엇이 될까?"
          ],
          "watch": "결합 원리(자음자＋모음자＝글자)",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "합치면 무슨 글자가 될까요?",
          "sub": "자음자와 모음자를 합치면 어떤 글자·낱말이 되는지 맞혀 봐요!",
          "cards": [
            {
              "clue": "ㅈ + ㅗ + ㄱ + ㅐ<br>바닷가 작은 친구!",
              "emoji": "🐚",
              "name": "조개"
            },
            {
              "clue": "ㅅ + ㅐ + ㅇ + ㅜ<br>바다에서 잡는 친구!",
              "emoji": "🦐",
              "name": "새우"
            },
            {
              "clue": "ㄱ + ㅔ<br>옆으로 걷는 친구!",
              "emoji": "🦀",
              "name": "게"
            }
          ],
          "outro": "자음자와 모음자를 합치니 낱말이 만들어졌어요! 정말 신기하죠? 😊"
        },
        "suggested_extras": [
          "q_build",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "자모 카드로 낱말 만들기",
          "question": "자음자·모음자 카드로 만들 수 있는 낱말을 함께 말해 봐요!",
          "items": [
            "‘ㅂ·ㅏ·ㄴ·ㅏ·ㄴ·ㅏ’로 무슨 낱말을 만들까요?",
            "‘ㅅ·ㅏ·ㄱ·ㅘ’로 무슨 낱말을 만들까요?",
            "‘ㄴ·ㅏ·ㅁ·ㅜ’로 무슨 낱말을 만들까요?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "e_word"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "자음자＋모음자로 글자 만들기",
          "levels": {
            "읽기": {
              "q": "ㄱ＋ㅏ＝가, ㄴ＋ㅏ＝나, ㄷ＋ㅏ＝다를 읽어 볼까요?",
              "a": "가·나·다",
              "steps": [
                "자음자＋모음자 → 글자"
              ]
            },
            "쓰기": {
              "q": "ㄱ과 ㅏ를 합쳐 '가'를 써 볼까요?",
              "a": "가",
              "steps": [
                "ㄱ＋ㅏ＝가"
              ]
            },
            "말하기": {
              "q": "'가'로 시작하는 낱말을 말해 봐요.",
              "a": "여러 답 (예: 가지, 가위)",
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
          "title": "글자 만들기 짝 놀이",
          "type": "pair",
          "goal": "자음자＋모음자를 합쳐 글자를 만들어요",
          "body": "짝과 자음자 카드·모음자 카드를 골라 합쳐 글자를 만들고 읽어 줘요.",
          "materials": [
            "자음자 카드",
            "모음자 카드"
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
              "q": "ㄱ＋ㅏ는?",
              "a": "가"
            },
            {
              "q": "ㄴ＋ㅏ는?",
              "a": "나"
            },
            {
              "q": "글자는 무엇과 무엇으로 만들까요?",
              "a": "자음자와 모음자"
            }
          ],
          "self": [
            "자음자＋모음자로 글자를 만들 수 있어요",
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
            "자음자와 모음자를 합치는 방법을 알았어요",
            "자모를 합쳐 글자를 만들었어요",
            "만든 글자를 또박또박 읽었어요"
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
          "preview": "받침이 없는 글자의 짜임을 더 자세히 알아봐요",
          "body": "옆으로 만나는 글자와 위아래로 만나는 글자, 두 가지 짜임을 나눠 볼 거예요!"
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
        "title": "몸으로 자모 만들기",
        "content": "두 사람이 팔로 ‘ㅏ’ 모양, ‘ㄱ’ 모양을 만들어 보면 자모 모양에 흥미가 생겨요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "오늘의 심장 = 합치기",
        "content": "이 차시 핵심은 ‘자모를 합쳐 글자를 만드는 것’이에요. 합치는 순간을 천천히, 여러 번 보여 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "흩어진 글자 모으기",
        "content": "칠판에 자모를 흩어 놓고 “이걸 모으면 무슨 글자가 될까요?” 물으면 호기심이 살아나요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "자석·카드로 직접",
        "content": "낱자 자석이나 카드로 자음자 옆/아래에 모음자를 직접 붙여 보게 하면 결합이 손으로 익혀져요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_order",
        "type": "misconception",
        "icon": "❓",
        "title": "순서를 거꾸로 쓰기",
        "content": "모음자를 먼저 쓰고 자음자를 붙이려는 아이가 있어요. 받침 없는 글자는 자음자 → 모음자 순임을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_build",
        "type": "fun_question",
        "icon": "💡",
        "title": "한 글자씩 합치기",
        "content": "‘조개’처럼 두 글자면 ‘조’ 먼저 합치고 ‘개’를 합쳐요. 한 글자씩 천천히 합쳐야 아이들이 따라와요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "자모 ↔ 글자 짝짓기",
        "description": "자음자+모음자와 그 글자를 짝지어 보세요.",
        "hint": "두 자모를 합치면 무슨 글자가 될까요?",
        "pairs": [
          {
            "a": {
              "text": "ㄴ + ㅏ"
            },
            "b": {
              "text": "나"
            }
          },
          {
            "a": {
              "text": "ㅅ + ㅗ"
            },
            "b": {
              "text": "소"
            }
          },
          {
            "a": {
              "text": "ㅂ + ㅣ"
            },
            "b": {
              "text": "비"
            }
          },
          {
            "a": {
              "text": "ㄷ + ㅜ"
            },
            "b": {
              "text": "두"
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
        "icon": "🧩",
        "title": "함께 합쳐 읽기",
        "content": "카드를 합칠 때마다 반 전체가 “ㄴ… ㅏ… 나!”처럼 소리 내어 읽으면 결합과 소리가 동시에 익혀져요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_word",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 이름 만들기",
        "content": "자기 이름의 받침 없는 글자를 자모로 만들어 보게 하면 결합 원리를 자기 것으로 만들어요.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "r_word",
        "type": "real_world",
        "icon": "🌍",
        "title": "집에 있는 글자 합치기",
        "content": "집에서 본 짧은 낱말(우유·바지 등)을 자모로 나눴다 합쳐 보면 생활 속에서 글자 만들기를 연습해요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "글자 만드는 법",
        "content": "“자음자와 모음자 중 무엇을 먼저 쓴다고 했죠?” 되짚으며 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "옆·위아래 살펴 오기",
        "content": "다음 시간을 위해, 둘레의 낱말을 보고 옆으로 만난 글자와 위아래로 만난 글자를 찾아 두게 하면 좋아요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l05"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 5,
      "title": "받침이 없는 글자의 짜임을 알아요",
      "std": "[2국04-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 글자 관찰 → 옆·위아래 두 짜임 → 짜임 맞히기 → 옆/위아래로 나누기 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "받침이 없는 글자의 짜임을 알아요",
          "subtitle": "1단원 · 5/14차시 · 글자의 짜임"
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
            "글자에서 자음자와 모음자의 자리를 살펴요",
            "옆으로 만나는 글자를 알아요",
            "위아래로 만나는 글자를 알아요"
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
          "scene_title": "글자를 자세히 볼까요? 🔎",
          "visual": "🔍",
          "question": "‘가’와 ‘고’를 보세요.<br>모음자가 어디에 붙어 있는지 다르죠?",
          "img": "assets/photo/korean/structure.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "ㄱ＋ㅏ는?",
              "a": "가"
            },
            {
              "q": "글자는 무엇으로 만들까요?",
              "a": "자음자와 모음자"
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
          "title": "두 가지 글자 짜임",
          "content": "받침이 없는 글자는 모음자 모양에 따라 **옆으로** 만나거나 **위아래로** 만나요. 짜임을 알면 글자를 더 쉽게 읽고 쓸 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "가 (ㄱ→ㅏ)",
              "meaning": "옆으로 나란히"
            },
            {
              "symbol": "지 (ㅈ→ㅣ)",
              "meaning": "옆으로 나란히"
            },
            {
              "symbol": "고 (ㄱ↓ㅗ)",
              "meaning": "위아래로 차곡차곡"
            },
            {
              "symbol": "두 (ㄷ↓ㅜ)",
              "meaning": "위아래로 차곡차곡"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_pos"
        ],
        "tnote": {
          "ask": [
            "받침이 없는 글자는 어떻게 이루어질까?"
          ],
          "watch": "첫소리＋가운뎃소리 짜임",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 글자는 어떤 짜임일까요?",
          "sub": "글자를 보고 자음자와 모음자가 옆으로 만났는지, 위아래로 만났는지 맞혀 봐요!",
          "cards": [
            {
              "clue": "‘가’ — 자음자와 모음자가<br>어떻게 만났을까?",
              "emoji": "➡️",
              "name": "옆으로 (ㄱ + ㅏ)"
            },
            {
              "clue": "‘포’ — 자음자와 모음자가<br>어떻게 만났을까?",
              "emoji": "⬇️",
              "name": "위아래로 (ㅍ + ㅗ)"
            },
            {
              "clue": "‘비’ — 자음자와 모음자가<br>어떻게 만났을까?",
              "emoji": "➡️",
              "name": "옆으로 (ㅂ + ㅣ)"
            }
          ],
          "outro": "모음자 모양을 보면 옆인지 위아래인지 알 수 있어요. 짜임의 비밀을 알았네요! 😊"
        },
        "suggested_extras": [
          "q_look",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "옆일까, 위아래일까?",
          "question": "다음 글자는 자음자와 모음자가 옆으로 만났을까요, 위아래로 만났을까요? 함께 나눠 봐요!",
          "items": [
            "‘나’는 옆일까요, 위아래일까요?",
            "‘소’는 옆일까요, 위아래일까요?",
            "‘무’는 옆일까요, 위아래일까요?",
            "‘지’는 옆일까요, 위아래일까요?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "e_sort"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "받침 없는 글자의 짜임",
          "levels": {
            "읽기": {
              "q": "ㅇ＋ㅗ＝오, ㅇ＋ㅣ＝이를 읽어 볼까요?",
              "a": "오·이",
              "steps": [
                "첫소리＋가운뎃소리"
              ]
            },
            "쓰기": {
              "q": "ㅇ과 ㅗ를 합쳐 '오'를 써 볼까요?",
              "a": "오",
              "steps": [
                "ㅇ＋ㅗ＝오"
              ]
            },
            "말하기": {
              "q": "받침 없는 글자를 하나 만들어 말해 봐요.",
              "a": "여러 답 (예: 아, 무)",
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
          "title": "짜임 나누기 짝 활동",
          "type": "pair",
          "goal": "글자를 첫소리·가운뎃소리로 나눠요",
          "body": "짝과 함께 글자 카드를 보고 첫소리와 가운뎃소리를 손가락으로 짚어요.",
          "materials": [
            "글자 카드"
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
              "q": "받침 없는 글자는 무엇과 무엇으로?",
              "a": "첫소리와 가운뎃소리"
            },
            {
              "q": "ㅇ＋ㅗ는?",
              "a": "오"
            },
            {
              "q": "'이'는 어떤 소리로 이루어졌나요?",
              "a": "ㅇ과 ㅣ"
            }
          ],
          "self": [
            "받침 없는 글자의 짜임을 알아요",
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
            "글자에서 자음자와 모음자의 자리를 살폈어요",
            "옆으로 만나는 글자를 알았어요",
            "위아래로 만나는 글자를 알았어요"
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
          "preview": "자음자와 모음자로 글자 만들기 놀이를 해요",
          "body": "오늘 배운 짜임으로 자모를 합쳐 글자를 만드는 재미있는 놀이를 할 거예요!"
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
        "title": "닮은 글자 찾기",
        "content": "“‘가·나·다’는 모음자가 어디 있죠? ‘고·노·도’는요?” 비교하며 짜임에 눈뜨게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "모음자 모양이 열쇠",
        "content": "세로로 긴 모음자(ㅏㅓㅣ)는 옆에, 가로로 긴 모음자(ㅗㅜㅡ)는 아래에 붙어요. 모양과 자리를 연결해 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "손으로 자리 표시",
        "content": "오른손은 옆, 왼손은 아래를 가리키며 글자를 보면 짜임을 몸으로 익힐 수 있어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "두 짜임을 나란히",
        "content": "‘가/고’처럼 자음자가 같고 모음자만 다른 짝을 나란히 보여 주면 짜임 차이가 한눈에 들어와요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "x_pos",
        "type": "misconception",
        "icon": "❓",
        "title": "모음자 자리를 마음대로",
        "content": "‘오’를 옆으로 쓰거나 ‘가’를 위아래로 쓰려는 경우가 있어요. 모음자 모양이 자리를 정한다는 걸 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_look",
        "type": "fun_question",
        "icon": "💡",
        "title": "먼저 모음자 찾기",
        "content": "카드를 뒤집기 전에 “모음자가 어디 있나요?” 먼저 찾으면 짜임 판단이 쉬워져요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "글자 ↔ 짜임 짝짓기",
        "description": "글자와 그 짜임(옆/위아래)을 짝지어 보세요.",
        "hint": "모음자가 옆에 있나요, 아래에 있나요?",
        "pairs": [
          {
            "a": {
              "text": "가"
            },
            "b": {
              "text": "옆으로"
            }
          },
          {
            "a": {
              "text": "고"
            },
            "b": {
              "text": "위아래로"
            }
          },
          {
            "a": {
              "text": "비"
            },
            "b": {
              "text": "옆으로"
            }
          },
          {
            "a": {
              "text": "두"
            },
            "b": {
              "text": "위아래로"
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
        "icon": "🧩",
        "title": "몸으로 분류하기",
        "content": "옆 짜임이면 양팔 벌리기, 위아래 짜임이면 위아래 가리키기처럼 동작으로 답하면 모두 참여해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_sort",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 이름 짜임 나누기",
        "content": "친구 이름의 받침 없는 글자를 옆/위아래 짜임으로 나눠 보면 짜임 감각이 깊어져요.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "r_around",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 속 글자 짜임",
        "content": "교실 게시판이나 사물함 이름표에서 옆 짜임·위아래 짜임 글자를 찾아보면 학습이 생활과 이어져요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "두 가지 짜임",
        "content": "“글자 짜임에는 어떤 두 가지가 있다고 했죠?” 되짚으며 마무리해요. (옆/위아래)",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "놀이 자모 준비",
        "content": "다음 시간 글자 만들기 놀이를 위해 자모 카드를 모둠별로 나눠 둘 수 있게 준비해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l06"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 6,
      "title": "글자 만들기 놀이를 해요",
      "std": "[2국04-01] · [2국03-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 놀이 안내 → 짜임 복습 → 자모 조합 글자 맞히기 → 만든 낱말 발표 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글자 만들기 놀이를 해요",
          "subtitle": "1단원 · 6/14차시 · 글자의 짜임"
        },
        "suggested_extras": [
          "v_song",
          "q_open"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "글자 짜임을 떠올려요",
            "자음자와 모음자를 합쳐 글자를 만들어요",
            "만든 낱말을 친구들에게 발표해요"
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
          "scene_title": "오늘은 글자 만들기 놀이! 🎲",
          "visual": "🎲",
          "question": "자음자와 모음자를 뽑아 합치면<br>어떤 낱말이 될까요? 놀이로 만들어 봐요!",
          "img": "assets/photo/korean/play_make.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "ㅇ＋ㅗ는?",
              "a": "오"
            },
            {
              "q": "받침 없는 글자는 무엇과 무엇으로?",
              "a": "첫소리와 가운뎃소리"
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
          "title": "짜임을 떠올리며 합치기",
          "content": "자음자를 먼저, 모음자를 자리에 맞춰 합쳐요. **옆**으로 만나는 글자와 **위아래**로 만나는 글자를 모두 만들 수 있어요!",
          "symbol_meanings": [
            {
              "symbol": "ㅈ + ㅏ",
              "meaning": "→ 자 (옆)"
            },
            {
              "symbol": "ㄷ + ㅜ",
              "meaning": "→ 두 (위아래)"
            },
            {
              "symbol": "ㅂ + ㅣ",
              "meaning": "→ 비 (옆)"
            },
            {
              "symbol": "ㅁ + ㅗ",
              "meaning": "→ 모 (위아래)"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ],
        "tnote": {
          "ask": [
            "자음자를 바꾸면 글자가 어떻게 될까?"
          ],
          "watch": "자모 조합 놀이",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "chosung_quiz",
        "data": {
          "title": "자음자와 모음자를 합치면? 🧩",
          "sub": "가운데 자음자와 모음자를 보고 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요",
          "items": [
            {
              "chosung": "ㅈ ㄷ",
              "answer": "자두",
              "emoji": "🟣",
              "hint": "새콤달콤 여름 과일이에요!"
            },
            {
              "chosung": "ㅇ ㅇ",
              "answer": "우유",
              "emoji": "🥛",
              "hint": "하얗고 고소한 마실 거예요!"
            },
            {
              "chosung": "ㄱ ㅁ",
              "answer": "고무",
              "emoji": "🩹",
              "hint": "말랑말랑 늘어나요!"
            },
            {
              "chosung": "ㅂ ㅈ",
              "answer": "바지",
              "emoji": "👖",
              "hint": "다리에 입는 옷이에요!"
            },
            {
              "chosung": "ㄷ ㄹ",
              "answer": "다리",
              "emoji": "🦵",
              "hint": "걸을 때 쓰는 몸이에요!"
            }
          ]
        },
        "suggested_extras": [
          "x_chosung",
          "g_match",
          "e_make"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "내가 만든 낱말 발표하기 🎤",
          "sub": "버튼을 누르면 발표할 친구를 뽑아요. 자모를 합쳐 만든 낱말을 친구들에게 소개해요!",
          "count": 24,
          "hint": "“저는 ○과 ○을 합쳐 ‘○○’을 만들었어요” 처럼 말해요",
          "end_msg": "우리가 만든 낱말이 정말 많네요! 모두 잘했어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "r_word"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "글자 만들기 놀이",
          "levels": {
            "읽기": {
              "q": "ㅍ＋ㅗ＝포, ㄷ＋ㅗ＝도를 읽어 볼까요?",
              "a": "포·도",
              "steps": [
                "자음자를 바꾸면 글자가 달라져요"
              ]
            },
            "쓰기": {
              "q": "ㅍ과 ㅗ를 합쳐 '포'를 써 볼까요?",
              "a": "포",
              "steps": [
                "ㅍ＋ㅗ＝포"
              ]
            },
            "말하기": {
              "q": "모음자 ㅗ에 자음자를 바꿔 끼워 여러 글자를 말해 봐요.",
              "a": "여러 답 (예: 고·노·도·포)",
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
          "title": "자음자 바꿔 끼우기 짝 놀이",
          "type": "pair",
          "goal": "자음자를 바꾸며 새 글자를 만들어요",
          "body": "모음자 카드 하나를 두고 짝과 번갈아 자음자를 바꿔 끼워 글자를 만들어요.",
          "materials": [
            "자음자 카드",
            "모음자 카드"
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
              "q": "ㅍ＋ㅗ는?",
              "a": "포"
            },
            {
              "q": "ㄷ＋ㅗ는?",
              "a": "도"
            },
            {
              "q": "자음자를 바꾸면 글자는?",
              "a": "달라져요"
            }
          ],
          "self": [
            "자음자를 바꿔 글자를 만들 수 있어요",
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
            "글자 짜임을 떠올렸어요",
            "자음자와 모음자를 합쳐 글자를 만들었어요",
            "만든 낱말을 친구들에게 발표했어요"
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
          "preview": "바른 자세로 글자를 읽는 법을 알아봐요",
          "body": "글자를 또박또박 읽을 때 몸을 어떻게 해야 하는지 함께 익혀 봐요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ],
    "extras": [
      {
        "id": "v_song",
        "type": "video",
        "icon": "🎥",
        "title": "글자 만들기 노래·영상",
        "url": "https://www.youtube.com/results?search_query=%ED%95%9C%EA%B8%80+%EA%B8%80%EC%9E%90+%EB%A7%8C%EB%93%A4%EA%B8%B0+%EB%85%B8%EB%9E%98",
        "description": "자모를 합쳐 글자를 만드는 과정을 노래·영상으로 보며 흥미를 여는 자료.",
        "source": "유튜브 검색 (교사 사전 확인 권장)",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "q_open",
        "type": "fun_question",
        "icon": "💡",
        "title": "제비뽑기 자모",
        "content": "자모 카드를 통에 넣고 하나씩 뽑아 합쳐 보면 놀이의 설렘이 생겨요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "놀이지만 ‘짜임’ 의식",
        "content": "즐겁게 놀되 글자를 만들 때마다 “옆일까 위아래일까?” 한 번씩 짚으면 학습 목표가 살아 있어요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "먼저 자음 정하기",
        "content": "“오늘은 ㅂ으로 시작하는 낱말만 만들어 볼까요?”처럼 조건을 주면 놀이가 더 재미있어져요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "두 글자 낱말 위주",
        "content": "받침 없는 두 글자 낱말(자두·우유 등)이 1학년에 알맞아요. 무리한 긴 낱말은 피해요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "x_chosung",
        "type": "misconception",
        "icon": "❓",
        "title": "초성 칸 수 = 글자 수",
        "content": "‘ㅈ ㄷ’처럼 초성이 둘이면 글자도 두 글자예요. 초성 칸 수가 글자 수임을 짚어 주세요.",
        "fit_slides": [
          "chosung_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "자모 ↔ 낱말 짝짓기",
        "description": "자모 묶음과 만들어지는 낱말을 짝지어 보세요.",
        "hint": "자모를 합치면 무슨 낱말이 될까요?",
        "pairs": [
          {
            "a": {
              "text": "ㅈ + ㄷ"
            },
            "b": {
              "text": "자두"
            }
          },
          {
            "a": {
              "text": "ㅇ + ㅇ"
            },
            "b": {
              "text": "우유"
            }
          },
          {
            "a": {
              "text": "ㅂ + ㅈ"
            },
            "b": {
              "text": "바지"
            }
          },
          {
            "a": {
              "text": "ㄷ + ㄹ"
            },
            "b": {
              "text": "다리"
            }
          }
        ],
        "fit_slides": [
          "chosung_quiz"
        ]
      },
      {
        "id": "e_make",
        "type": "extension",
        "icon": "⬆",
        "title": "내 낱말 문제 내기",
        "content": "아이들이 자모로 낱말 문제를 직접 만들어 서로 내보게 하면 낱말 감각과 자신감이 자라요.",
        "fit_slides": [
          "chosung_quiz",
          "next_lesson"
        ]
      },
      {
        "id": "t_present",
        "type": "tip",
        "icon": "🧩",
        "title": "만드는 과정도 말하기",
        "content": "“ㅂ과 ㅏ를 합쳐 ‘바’, ㅈ과 ㅣ를 합쳐 ‘지’… 바지!”처럼 만든 과정을 말하면 결합 원리가 굳어져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_word",
        "type": "real_world",
        "icon": "🌍",
        "title": "집에서 낱말 찾기 놀이",
        "content": "집에 있는 물건 중 받침 없는 낱말(우유·바지 등)을 찾아 자모로 나눠 보면 놀이가 생활로 이어져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 재밌던 낱말",
        "content": "“오늘 만든 낱말 중 가장 마음에 드는 건?” 물으며 즐겁게 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "읽는 자세 살펴 오기",
        "content": "다음 시간을 위해, 책을 읽을 때 내 몸이 어떤지 떠올려 두게 하면 도입이 매끄러워요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l07"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 7,
      "title": "바른 자세로 글자를 읽어요",
      "std": "[2국02-01] · [2국03-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 자세의 필요성 → 바르게 읽는 자세 → 자세 맞히기 → 또박또박 읽기 발표 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "바른 자세로 글자를 읽어요",
          "subtitle": "1단원 · 7/14차시 · 읽고 쓰기"
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
            "바른 자세가 왜 필요한지 알아요",
            "글자를 바르게 읽는 자세를 익혀요",
            "또박또박 소리 내어 읽어요"
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
          "scene_title": "이렇게 읽으면 어떨까요? 😴",
          "visual": "📖",
          "question": "엎드려 읽거나 책을 너무 가까이 보면<br>어떻게 될까요? 함께 생각해 봐요!",
          "img": "assets/photo/korean/read_posture.jpg"
        },
        "suggested_extras": [
          "q_around",
          "x_eye"
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
              "q": "ㅍ＋ㅗ는?",
              "a": "포"
            },
            {
              "q": "자음자를 바꾸면 글자는?",
              "a": "달라져요"
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
          "title": "바르게 읽는 자세",
          "content": "바른 자세로 읽으면 **눈도 편하고** 글자도 **또박또박** 읽을 수 있어요. 허리를 펴고 책과 알맞은 거리를 두어요!",
          "symbol_meanings": [
            {
              "symbol": "허리 🪑",
              "meaning": "곧게 펴요"
            },
            {
              "symbol": "눈과 책 👀",
              "meaning": "한 뼘쯤 띄워요"
            },
            {
              "symbol": "두 발 🦶",
              "meaning": "바닥에 모아요"
            },
            {
              "symbol": "입 👄",
              "meaning": "또박또박 소리 내요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_eye"
        ],
        "tnote": {
          "ask": [
            "바르게 읽으려면 어떤 자세가 좋을까?"
          ],
          "watch": "읽기 자세·또박또박",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "어떤 자세가 바를까요?",
          "sub": "그림을 보고 책 읽기에 바른 자세인지 생각해 봐요!",
          "cards": [
            {
              "clue": "허리를 곧게 펴고<br>책을 알맞게 두었어요",
              "emoji": "🧒",
              "name": "바른 자세 ⭕"
            },
            {
              "clue": "책상에 엎드려서<br>읽고 있어요",
              "emoji": "😴",
              "name": "바르지 않아요 ❌"
            },
            {
              "clue": "책을 눈에<br>너무 가까이 댔어요",
              "emoji": "😵",
              "name": "바르지 않아요 ❌"
            }
          ],
          "outro": "바른 자세로 읽어야 눈도 편하고 글자도 또렷하게 보여요! 😊"
        },
        "suggested_extras": [
          "q_check",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "바른 자세로 또박또박 읽기 🎤",
          "sub": "버튼을 누르면 읽을 친구를 뽑아요. 바른 자세로 낱말을 또박또박 읽어요!",
          "count": 24,
          "hint": "허리 펴고, 책 알맞게 두고, ‘나-무’처럼 또박또박 읽어요",
          "end_msg": "모두 바른 자세로 또박또박 잘 읽었어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "r_habit"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "바른 자세로 읽기",
          "levels": {
            "읽기": {
              "q": "허리를 펴고 '가·나·다'를 또박또박 읽어 볼까요?",
              "a": "가·나·다"
            },
            "쓰기": {
              "q": "바르게 읽는 자세를 그림으로 표시해 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "바르게 읽으려면 어떻게 해야 할지 말해 봐요.",
              "a": "여러 답 (예: 허리를 펴고 또박또박)",
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
          "title": "또박또박 읽기 짝 점검",
          "type": "pair",
          "goal": "바른 자세로 또박또박 읽어요",
          "body": "짝과 마주 앉아 한 사람이 읽고 다른 사람이 자세를 살펴 줘요.",
          "materials": [
            "글자 카드"
          ],
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
              "q": "바르게 읽을 때 허리는?",
              "a": "곧게 펴요"
            },
            {
              "q": "어떻게 읽어야 할까요?",
              "a": "또박또박"
            },
            {
              "q": "바른 자세는 왜 필요할까요?",
              "a": "잘 읽고 오래 앉을 수 있어요"
            }
          ],
          "self": [
            "바른 자세로 읽을 수 있어요",
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
            "바른 자세가 왜 필요한지 알았어요",
            "글자를 바르게 읽는 자세를 익혔어요",
            "또박또박 소리 내어 읽었어요"
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
          "preview": "바른 자세로 글자를 쓰는 법을 알아봐요",
          "body": "연필을 바르게 잡고 글자를 또박또박 쓰는 자세를 함께 익혀 봐요!"
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
        "title": "내 읽기 자세는?",
        "content": "“여러분은 책 읽을 때 어떤 자세인가요?” 가볍게 물으며 자기 습관을 떠올리게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "자세 = 건강 + 또렷함",
        "content": "바른 자세는 눈 건강뿐 아니라 글자를 또렷하게 보고 또박또박 읽는 데도 도움이 됨을 함께 알려 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "따라 해 보기",
        "content": "교사가 바른 자세와 굽은 자세를 직접 보여 주고 “어느 쪽이 바를까요?” 고르게 하면 한눈에 이해해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "x_eye",
        "type": "misconception",
        "icon": "❓",
        "title": "가까이 봐야 잘 보임? ❌",
        "content": "책을 눈에 바짝 대야 잘 보인다고 여기기 쉬워요. 오히려 눈이 쉽게 피로해진다는 걸 알려 주세요.",
        "fit_slides": [
          "motivate",
          "concept"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "한 뼘 거리 보여 주기",
        "content": "눈과 책 사이를 손 한 뼘으로 재 보게 하면 ‘알맞은 거리’가 구체적으로 와닿아요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_check",
        "type": "fun_question",
        "icon": "💡",
        "title": "내 자세 점검",
        "content": "“지금 내 허리는 펴져 있나요?” 활동 중간에 스스로 점검하게 하면 바른 자세가 습관이 돼요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "자세 ↔ 알맞음 짝짓기",
        "description": "읽기 자세와 바른지/바르지 않은지를 짝지어 보세요.",
        "hint": "눈과 허리가 편한 자세일까요?",
        "pairs": [
          {
            "a": {
              "text": "허리 펴고 읽기"
            },
            "b": {
              "text": "바른 자세 ⭕"
            }
          },
          {
            "a": {
              "text": "엎드려 읽기"
            },
            "b": {
              "text": "바르지 않음 ❌"
            }
          },
          {
            "a": {
              "text": "책 한 뼘 거리"
            },
            "b": {
              "text": "바른 자세 ⭕"
            }
          },
          {
            "a": {
              "text": "눈에 바짝 대기"
            },
            "b": {
              "text": "바르지 않음 ❌"
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
        "icon": "🧩",
        "title": "또박또박이 목표",
        "content": "빨리 읽기보다 ‘또박또박’이 중요해요. 한 글자씩 정확히 소리 내는 아이를 크게 칭찬해 주세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_habit",
        "type": "real_world",
        "icon": "🌍",
        "title": "집에서도 바른 자세",
        "content": "집에서 책이나 그림책을 읽을 때도 바른 자세로 읽어 보게 하면 좋은 습관이 자리 잡아요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_read",
        "type": "extension",
        "icon": "⬆",
        "title": "짝과 자세 점검",
        "content": "짝끼리 서로의 읽기 자세를 살펴 주며 칭찬하면 바른 자세를 더 즐겁게 익혀요.",
        "fit_slides": [
          "present",
          "next_lesson"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 자세 요점",
        "content": "“바르게 읽으려면 허리는? 책 거리는?” 되짚으며 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "연필 잡기 떠올리기",
        "content": "다음 시간 ‘바르게 쓰는 자세’를 위해, 연필을 어떻게 잡는지 떠올려 두게 하면 도입이 매끄러워요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l08"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 8,
      "title": "바른 자세로 글자를 써요",
      "std": "[2국03-01] · [2국04-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 쓰기 자세 떠올리기 → 바르게 쓰는 자세·연필 잡기 → 자세 맞히기 → 글자 쓰기 발표 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "바른 자세로 글자를 써요",
          "subtitle": "1단원 · 8/14차시 · 읽고 쓰기"
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
            "바르게 쓰는 자세를 알아요",
            "연필을 바르게 잡는 법을 익혀요",
            "글자를 또박또박 바르게 써요"
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
          "scene_title": "글자를 쓸 때 내 몸은? ✍️",
          "visual": "✏️",
          "question": "연필을 주먹으로 꽉 쥐거나<br>공책에 코를 박으면 어떻게 될까요?",
          "img": "assets/photo/korean/write_posture.jpg"
        },
        "suggested_extras": [
          "q_around",
          "x_grip"
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
              "q": "바르게 읽을 때 허리는?",
              "a": "곧게 펴요"
            },
            {
              "q": "어떻게 읽어야 할까요?",
              "a": "또박또박"
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
          "title": "바르게 쓰는 자세",
          "content": "바른 자세로 쓰면 글자가 **반듯하게** 써지고 손도 **덜 아파요.** 연필은 세 손가락으로 가볍게 잡아요!",
          "symbol_meanings": [
            {
              "symbol": "연필 ✏️",
              "meaning": "세 손가락으로 가볍게"
            },
            {
              "symbol": "허리 🪑",
              "meaning": "곧게 펴요"
            },
            {
              "symbol": "공책 📓",
              "meaning": "살짝 비스듬히"
            },
            {
              "symbol": "반대 손 🤚",
              "meaning": "공책을 잡아 줘요"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_grip"
        ],
        "tnote": {
          "ask": [
            "연필을 어떻게 잡아야 바를까?"
          ],
          "watch": "쓰기 자세·연필 잡기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "어떤 자세가 바를까요?",
          "sub": "그림을 보고 글자 쓰기에 바른 자세인지 생각해 봐요!",
          "cards": [
            {
              "clue": "허리 펴고 연필을<br>세 손가락으로 잡았어요",
              "emoji": "🧒",
              "name": "바른 자세 ⭕"
            },
            {
              "clue": "연필을 주먹으로<br>꽉 쥐었어요",
              "emoji": "✊",
              "name": "바르지 않아요 ❌"
            },
            {
              "clue": "공책에 얼굴을<br>바짝 댔어요",
              "emoji": "😵",
              "name": "바르지 않아요 ❌"
            }
          ],
          "outro": "바른 자세로 써야 글자가 반듯하고 손도 안 아파요! 😊"
        },
        "suggested_extras": [
          "q_check",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "바른 자세로 글자 써서 보여 주기 🎤",
          "sub": "버튼을 누르면 발표할 친구를 뽑아요. 바른 자세로 쓴 글자를 친구들에게 보여 줘요!",
          "count": 24,
          "hint": "받침 없는 글자(나·무·가 등)를 바른 자세로 또박또박 써요",
          "end_msg": "모두 바른 자세로 또박또박 잘 썼어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "r_habit"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "바른 자세로 쓰기",
          "levels": {
            "읽기": {
              "q": "바르게 쓰는 자세를 설명한 글을 읽어 볼까요?",
              "a": "연필을 바르게 잡고 씁니다"
            },
            "쓰기": {
              "q": "연필을 바르게 잡고 '나'를 또박또박 써 볼까요?",
              "a": "나"
            },
            "말하기": {
              "q": "바르게 쓰려면 어떻게 해야 할지 말해 봐요.",
              "a": "여러 답 (예: 연필을 바르게 잡아요)",
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
          "title": "연필 바르게 잡기 짝 점검",
          "type": "pair",
          "goal": "연필을 바르게 잡고 써요",
          "body": "짝과 서로 연필 잡는 손 모양을 살펴 주고 고쳐 줘요.",
          "materials": [
            "연필",
            "공책"
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
              "q": "쓸 때 연필은 어떻게?",
              "a": "바르게 잡아요"
            },
            {
              "q": "글자는 어떻게 써야 할까요?",
              "a": "또박또박"
            },
            {
              "q": "바른 쓰기 자세는 왜 좋을까요?",
              "a": "글씨가 예쁘고 손이 편해요"
            }
          ],
          "self": [
            "바른 자세로 쓸 수 있어요",
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
            "바르게 쓰는 자세를 알았어요",
            "연필을 바르게 잡는 법을 익혔어요",
            "글자를 또박또박 바르게 썼어요"
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
          "preview": "여러 가지 모음자를 알아봐요",
          "body": "ㅐ·ㅔ 같은 새로운 모음자가 들어간 낱말을 함께 만나 볼 거예요!"
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
        "title": "내 연필 잡기",
        "content": "“여러분은 연필을 어떻게 잡나요? 한번 들어 볼까요?” 자기 습관을 보여 주게 하며 시작해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "자세 = 반듯함 + 편함",
        "content": "바른 쓰기 자세는 글자를 반듯하게 하고 손 피로도 줄여 줘요. 두 가지 이점을 함께 말해 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "같이 따라 잡기",
        "content": "교사가 연필 잡는 법을 천천히 보여 주고 다 함께 따라 잡아 보면 모두가 익힐 수 있어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "x_grip",
        "type": "misconception",
        "icon": "❓",
        "title": "꽉 쥐어야 잘 써짐? ❌",
        "content": "연필을 꽉 쥐어야 잘 써진다고 여기기 쉬워요. 오히려 손이 빨리 아프고 글자가 떨려요. 가볍게 잡게 해 주세요.",
        "fit_slides": [
          "motivate",
          "concept"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "세 손가락 보여 주기",
        "content": "엄지·검지·가운뎃손가락 세 손가락으로 잡는 모습을 크게 보여 주면 따라 하기 쉬워요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_check",
        "type": "fun_question",
        "icon": "💡",
        "title": "반대 손은 어디?",
        "content": "“연필을 안 든 손은 무엇을 하고 있죠?” 물으면 공책을 잡아 주는 손의 역할도 챙길 수 있어요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "쓰기 자세 ↔ 알맞음 짝짓기",
        "description": "쓰기 자세와 바른지/바르지 않은지를 짝지어 보세요.",
        "hint": "손과 허리가 편한 자세일까요?",
        "pairs": [
          {
            "a": {
              "text": "세 손가락 잡기"
            },
            "b": {
              "text": "바른 자세 ⭕"
            }
          },
          {
            "a": {
              "text": "주먹으로 쥐기"
            },
            "b": {
              "text": "바르지 않음 ❌"
            }
          },
          {
            "a": {
              "text": "허리 펴고 쓰기"
            },
            "b": {
              "text": "바른 자세 ⭕"
            }
          },
          {
            "a": {
              "text": "공책에 얼굴 대기"
            },
            "b": {
              "text": "바르지 않음 ❌"
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
        "icon": "🧩",
        "title": "또박또박이 먼저",
        "content": "빠르고 예쁘게보다 ‘또박또박 바르게’가 먼저예요. 천천히 정성껏 쓴 아이를 크게 칭찬해 주세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_habit",
        "type": "real_world",
        "icon": "🌍",
        "title": "집에서도 바른 자세",
        "content": "집에서 숙제나 그림을 그릴 때도 바른 자세로 해 보게 하면 좋은 습관이 자리 잡아요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "e_write",
        "type": "extension",
        "icon": "⬆",
        "title": "내 이름 바르게 쓰기",
        "content": "받침 없는 글자가 들어간 자기 이름을 바른 자세로 써 보게 하면 의미 있게 연습할 수 있어요.",
        "fit_slides": [
          "present",
          "next_lesson"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "바른 쓰기 요점",
        "content": "“연필은 몇 손가락으로 잡는다고 했죠? 허리는요?” 되짚으며 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "새 모음자 기대하기",
        "content": "다음 시간 ‘여러 가지 모음자’를 위해, ㅏ·ㅓ 말고 또 어떤 모음자를 아는지 떠올려 두게 해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l09"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 9,
      "title": "여러 가지 모음자를 알아요 ①",
      "std": "[2국04-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 낱말 뜻 추측 → 모음자 ㅐ·ㅔ 알기 → ㅐ·ㅔ 낱말 맞히기 → 모음자 넣어 말하기 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 모음자를 알아요 ①",
          "subtitle": "1단원 · 9/14차시 · 여러 모음자"
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
            "모음자 ㅐ와 ㅔ를 알아요",
            "ㅐ·ㅔ가 들어간 낱말을 읽어요",
            "모음자를 넣어 낱말을 말해요"
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
          "scene_title": "새로운 모음자가 있어요! 🆕",
          "visual": "🔤",
          "question": "ㅏ·ㅓ 말고도 모음자가 더 있어요.<br>오늘은 ‘ㅐ’와 ‘ㅔ’를 만나 봐요!",
          "img": "assets/photo/korean/vowels1.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "쓸 때 연필은?",
              "a": "바르게 잡아요"
            },
            {
              "q": "글자는 어떻게 써야 할까요?",
              "a": "또박또박"
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
          "title": "모음자 ㅐ와 ㅔ",
          "content": "**ㅐ**와 **ㅔ**도 모음자예요. 자음자와 합쳐 글자를 만들 수 있어요. 소리를 잘 듣고 또박또박 읽어 봐요!",
          "symbol_meanings": [
            {
              "symbol": "ㅐ",
              "meaning": "ㅂ + ㅐ → 배"
            },
            {
              "symbol": "ㅔ",
              "meaning": "ㄱ + ㅔ → 게"
            },
            {
              "symbol": "ㅐ",
              "meaning": "ㄷ + ㅐ → 대"
            },
            {
              "symbol": "ㅔ",
              "meaning": "ㅅ + ㅔ → 세"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_sound"
        ],
        "tnote": {
          "ask": [
            "모음자가 바뀌면 글자가 어떻게 될까?"
          ],
          "watch": "여러 모음자 ㅐ·ㅔ",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "chosung_quiz",
        "data": {
          "title": "ㅐ·ㅔ가 들어간 낱말 맞히기 🧩",
          "sub": "가운데 자음자와 모음자를 보고 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요",
          "items": [
            {
              "chosung": "ㅂ",
              "answer": "배",
              "emoji": "🍐",
              "hint": "노랗고 시원한 가을 과일이에요!"
            },
            {
              "chosung": "ㄱ",
              "answer": "게",
              "emoji": "🦀",
              "hint": "옆으로 걷는 바다 친구예요!"
            },
            {
              "chosung": "ㄴ ㄹ",
              "answer": "노래",
              "emoji": "🎵",
              "hint": "입으로 부르는 거예요!"
            },
            {
              "chosung": "ㅁ ㅈ",
              "answer": "매주",
              "emoji": "📅",
              "hint": "한 주마다 빠짐없이! (매주)"
            }
          ]
        },
        "suggested_extras": [
          "x_sound",
          "g_match",
          "e_word"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "ㅐ·ㅔ 들어간 낱말 말하기 🎤",
          "sub": "버튼을 누르면 발표할 친구를 뽑아요. ㅐ나 ㅔ가 들어간 낱말을 하나 말해요!",
          "count": 24,
          "hint": "“저는 ‘○○’을(를) 말할래요” — 배·게·세배·노래 등 떠올려 봐요",
          "end_msg": "ㅐ와 ㅔ가 들어간 낱말이 정말 많네요! 잘했어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "r_word"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "여러 가지 모음자 ①",
          "levels": {
            "읽기": {
              "q": "모음자 ㅐ, ㅔ를 읽어 볼까요?",
              "a": "ㅐ·ㅔ"
            },
            "쓰기": {
              "q": "ㄱ과 ㅐ를 합쳐 '개'를 써 볼까요?",
              "a": "개",
              "steps": [
                "ㄱ＋ㅐ＝개"
              ]
            },
            "말하기": {
              "q": "ㅐ가 들어간 글자를 하나 말해 봐요.",
              "a": "여러 답 (예: 개, 배)",
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
          "title": "모음자 이어 붙이기 짝 놀이",
          "type": "pair",
          "goal": "새 모음자로 글자를 만들어요",
          "body": "짝과 자음자에 ㅐ·ㅔ를 붙여 글자를 만들어 읽어 줘요.",
          "materials": [
            "자모 카드"
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
              "q": "ㄱ＋ㅐ는?",
              "a": "개"
            },
            {
              "q": "ㅐ와 ㅔ는 무엇일까요?",
              "a": "모음자"
            },
            {
              "q": "모음자가 바뀌면 글자는?",
              "a": "달라져요"
            }
          ],
          "self": [
            "여러 모음자를 알아요",
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
            "모음자 ㅐ와 ㅔ를 알았어요",
            "ㅐ·ㅔ가 들어간 낱말을 읽었어요",
            "모음자를 넣어 낱말을 말했어요"
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
          "preview": "또 다른 모음자를 알아봐요",
          "body": "ㅒ·ㅖ·ㅘ·ㅙ·ㅚ 같은 모음자가 들어간 낱말을 함께 만나 볼 거예요!"
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
        "title": "내가 아는 모음자",
        "content": "“우리가 아는 모음자를 말해 볼까요?” 떠올리게 한 뒤 “오늘은 새 친구가 둘!”로 흥미를 높여요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "소리 듣고 읽기",
        "content": "ㅐ·ㅔ는 소리가 비슷해 헷갈리기 쉬워요. 글자 만들기보다 소리를 듣고 또박또박 읽는 데 초점을 둬요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "입 모양 따라 하기",
        "content": "ㅐ와 ㅔ를 소리 낼 때 입 모양을 교사가 보여 주고 따라 하게 하면 차이를 느낄 수 있어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "낱말로 익히기",
        "content": "ㅐ·ㅔ는 낱자만 보기보다 ‘배·게’처럼 친숙한 낱말 속에서 익히면 더 잘 기억나요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "x_sound",
        "type": "misconception",
        "icon": "❓",
        "title": "ㅐ·ㅔ 소리 헷갈리기",
        "content": "두 소리가 비슷해 구분이 어려운 게 자연스러워요. 틀려도 괜찮다고 안심시키고 여러 번 들려주세요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 모음자 짝짓기",
        "description": "낱말과 그 안에 들어간 모음자를 짝지어 보세요.",
        "hint": "낱말 속 모음자가 ㅐ일까요, ㅔ일까요?",
        "pairs": [
          {
            "a": {
              "text": "🍐 배"
            },
            "b": {
              "text": "ㅐ"
            }
          },
          {
            "a": {
              "text": "🦀 게"
            },
            "b": {
              "text": "ㅔ"
            }
          },
          {
            "a": {
              "text": "대문"
            },
            "b": {
              "text": "ㅐ"
            }
          },
          {
            "a": {
              "text": "세배"
            },
            "b": {
              "text": "ㅔ"
            }
          }
        ],
        "fit_slides": [
          "chosung_quiz"
        ]
      },
      {
        "id": "e_word",
        "type": "extension",
        "icon": "⬆",
        "title": "ㅐ·ㅔ 낱말 모으기",
        "content": "칠판에 ㅐ칸·ㅔ칸을 만들고 떠오르는 낱말을 모아 적으면 모음자별로 정리돼요.",
        "fit_slides": [
          "chosung_quiz",
          "next_lesson"
        ]
      },
      {
        "id": "t_present",
        "type": "tip",
        "icon": "🧩",
        "title": "하나만 말해도 OK",
        "content": "낱말 하나만 말해도 충분해요. 떠오르지 않으면 친구가 말한 낱말을 따라 말하게 해도 좋아요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_word",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 ㅐ·ㅔ 낱말",
        "content": "가게·노래·세배처럼 생활에서 자주 쓰는 ㅐ·ㅔ 낱말을 떠올리면 모음자가 친숙해져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "x_write",
        "type": "misconception",
        "icon": "❓",
        "title": "ㅐ를 ㅏ+ㅣ로만 보기",
        "content": "ㅐ는 ㅏ와 ㅣ가 붙은 모양이지만 하나의 모음자예요. 한 글자로 함께 쓰는 모음자임을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 만난 모음자",
        "content": "“오늘 새로 만난 모음자 두 개는?” 되짚으며 마무리해요. (ㅐ, ㅔ)",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "더 많은 모음자 기대",
        "content": "다음 시간 ㅒ·ㅖ·ㅘ 같은 모음자를 만난다고 예고하면 기대가 생겨요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l10"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 10,
      "title": "여러 가지 모음자를 알아요 ②",
      "std": "[2국04-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 모음자 더 만나기 → ㅒ·ㅖ·ㅘ·ㅙ·ㅚ 알기 → 낱말 맞히기 → 모음자 넣어 말하기 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 모음자를 알아요 ②",
          "subtitle": "1단원 · 10/14차시 · 여러 모음자"
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
            "모음자 ㅒ·ㅖ·ㅘ·ㅙ·ㅚ를 알아요",
            "이 모음자가 들어간 낱말을 읽어요",
            "모음자를 넣어 낱말을 말해요"
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
          "scene_title": "모음자가 더 있어요! ✨",
          "visual": "🔠",
          "question": "두 모음자가 합쳐진 모음자도 있어요.<br>‘ㅘ’를 보세요 — ㅗ와 ㅏ가 만났죠?",
          "img": "assets/photo/korean/vowels2.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "ㄱ＋ㅐ는?",
              "a": "개"
            },
            {
              "q": "ㅐ와 ㅔ는?",
              "a": "모음자"
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
          "title": "여러 가지 모음자",
          "content": "두 모음자가 만나 만들어진 모음자도 있어요. 소리를 잘 듣고 글자를 또박또박 읽어 봐요!",
          "symbol_meanings": [
            {
              "symbol": "ㅘ",
              "meaning": "ㄱ + ㅘ → 과(일)"
            },
            {
              "symbol": "ㅚ",
              "meaning": "ㄱ + ㅚ → 교(실) 아닌 ‘외’"
            },
            {
              "symbol": "ㅖ",
              "meaning": "ㅅ + ㅖ → 셰(프)"
            },
            {
              "symbol": "ㅙ",
              "meaning": "ㄷ + ㅙ → ‘돼’(지)"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_combo"
        ],
        "tnote": {
          "ask": [
            "ㅏ와 ㅑ는 어떻게 다를까?"
          ],
          "watch": "여러 모음자 ㅑ·ㅕ",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "chosung_quiz",
        "data": {
          "title": "여러 모음자 낱말 맞히기 🧩",
          "sub": "가운데 글자를 보고 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요",
          "items": [
            {
              "chosung": "ㄱ ㅇ",
              "answer": "과일",
              "emoji": "🍎",
              "hint": "사과·배·포도 같은 거예요! (과일)"
            },
            {
              "chosung": "ㄷ ㅈ",
              "answer": "돼지",
              "emoji": "🐷",
              "hint": "꿀꿀 우는 동물이에요! (돼지)"
            },
            {
              "chosung": "ㅎ ㅂ",
              "answer": "화분",
              "emoji": "🪴",
              "hint": "꽃이나 풀을 심는 그릇이에요! (화분)"
            },
            {
              "chosung": "ㅇ ㅅ",
              "answer": "왼손",
              "emoji": "🤚",
              "hint": "오른손의 반대예요!"
            }
          ]
        },
        "suggested_extras": [
          "x_combo",
          "g_match",
          "e_word"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "여러 모음자 낱말 말하기 🎤",
          "sub": "버튼을 누르면 발표할 친구를 뽑아요. 오늘 배운 모음자가 들어간 낱말을 하나 말해요!",
          "count": 24,
          "hint": "과일·돼지·화분·왼손 등 ㅘ·ㅙ·ㅚ가 들어간 낱말을 떠올려 봐요",
          "end_msg": "새로운 모음자가 들어간 낱말을 잘 찾았어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "r_word"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "여러 가지 모음자 ②",
          "levels": {
            "읽기": {
              "q": "모음자 ㅑ, ㅕ를 읽어 볼까요?",
              "a": "ㅑ·ㅕ"
            },
            "쓰기": {
              "q": "ㅇ과 ㅑ를 합쳐 '야'를 써 볼까요?",
              "a": "야",
              "steps": [
                "ㅇ＋ㅑ＝야"
              ]
            },
            "말하기": {
              "q": "ㅑ나 ㅕ가 들어간 글자를 말해 봐요.",
              "a": "여러 답 (예: 야, 여)",
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
          "title": "모음자 짝 맞추기",
          "type": "pair",
          "goal": "비슷한 모음자를 구별해요",
          "body": "짝과 ㅏ/ㅑ, ㅓ/ㅕ 카드를 짝지어 소리 내어 읽어요.",
          "materials": [
            "모음자 카드"
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
              "q": "ㅇ＋ㅑ는?",
              "a": "야"
            },
            {
              "q": "ㅑ는 무엇일까요?",
              "a": "모음자"
            },
            {
              "q": "ㅏ와 ㅑ는 소리가 같을까요?",
              "a": "아니요, 달라요"
            }
          ],
          "self": [
            "여러 모음자를 구별해요",
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
            "모음자 ㅒ·ㅖ·ㅘ·ㅙ·ㅚ를 알았어요",
            "이 모음자가 들어간 낱말을 읽었어요",
            "모음자를 넣어 낱말을 말했어요"
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
          "preview": "남은 모음자를 알아보고 낱말 놀이를 해요",
          "body": "ㅝ·ㅞ·ㅟ·ㅢ를 만나고, 모음자가 들어간 낱말 말하기 놀이를 할 거예요!"
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
        "title": "모음자 합치기 상상",
        "content": "“ㅗ랑 ㅏ를 붙이면 어떤 소리가 날까요?” 상상하게 한 뒤 ‘ㅘ’를 보여 주면 신기해해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "많이 다루지 않기",
        "content": "여러 모음자를 한 번에 완벽히 익히긴 어려워요. ‘이런 모음자도 있구나’ 알고 낱말로 만나는 정도면 충분해요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "입 모양 변화",
        "content": "‘과’를 소리 낼 때 입이 ㅗ에서 ㅏ로 움직여요. 입 모양 변화를 함께 느껴 보면 재미있어요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "낱말 중심으로",
        "content": "낱자만 보면 어려워요. ‘과일·돼지·화분’처럼 친숙한 낱말 속에서 모음자를 만나게 해 주세요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "x_combo",
        "type": "misconception",
        "icon": "❓",
        "title": "두 글자로 나눠 쓰기",
        "content": "‘ㅘ’를 ㅗ와 ㅏ 두 칸에 따로 쓰려는 경우가 있어요. 한 자리에 함께 쓰는 모음자임을 보여 주세요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 모음자 짝짓기",
        "description": "낱말과 그 안에 들어간 모음자를 짝지어 보세요.",
        "hint": "낱말 속에 어떤 모음자가 들어 있나요?",
        "pairs": [
          {
            "a": {
              "text": "🍎 과일"
            },
            "b": {
              "text": "ㅘ"
            }
          },
          {
            "a": {
              "text": "🐷 돼지"
            },
            "b": {
              "text": "ㅙ"
            }
          },
          {
            "a": {
              "text": "🤚 왼손"
            },
            "b": {
              "text": "ㅚ"
            }
          },
          {
            "a": {
              "text": "🪴 화분"
            },
            "b": {
              "text": "ㅘ"
            }
          }
        ],
        "fit_slides": [
          "chosung_quiz"
        ]
      },
      {
        "id": "e_word",
        "type": "extension",
        "icon": "⬆",
        "title": "모음자 보물찾기",
        "content": "교실 게시물·책에서 오늘 배운 모음자가 들어간 낱말을 찾아보게 하면 보물찾기처럼 즐거워요.",
        "fit_slides": [
          "chosung_quiz",
          "next_lesson"
        ]
      },
      {
        "id": "t_present",
        "type": "tip",
        "icon": "🧩",
        "title": "어려우면 따라 말하기",
        "content": "떠올리기 어려운 아이는 친구가 말한 낱말을 따라 말하게 해도 충분히 참여한 거예요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_word",
        "type": "real_world",
        "icon": "🌍",
        "title": "생활 속 모음자 낱말",
        "content": "과일·화분·왼손처럼 생활에서 쓰는 낱말로 모음자를 만나면 더 친숙하게 익혀져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "x_read",
        "type": "misconception",
        "icon": "❓",
        "title": "비슷한 모음자 헷갈리기",
        "content": "ㅙ·ㅚ·ㅞ는 소리가 비슷해 헷갈리는 게 자연스러워요. 완벽히 구분하지 못해도 괜찮다고 안심시켜 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "오늘 만난 모음자",
        "content": "“오늘 만난 모음자 중 기억나는 것을 말해 볼까요?” 되짚으며 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "남은 모음자 예고",
        "content": "다음 시간 ㅝ·ㅟ·ㅢ를 만나고 낱말 놀이를 한다고 예고하면 기대가 생겨요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l11"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 11,
      "title": "여러 가지 모음자를 알아요 ③",
      "std": "[2국04-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 남은 모음자 → ㅝ·ㅞ·ㅟ·ㅢ 알기 → 낱말 맞히기 → 낱말 말하기 놀이 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "여러 가지 모음자를 알아요 ③",
          "subtitle": "1단원 · 11/14차시 · 여러 모음자"
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
            "모음자 ㅝ·ㅞ·ㅟ·ㅢ를 알아요",
            "이 모음자가 들어간 낱말을 읽어요",
            "모음자 낱말 말하기 놀이를 해요"
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
          "scene_title": "마지막 모음자 친구들! 🎉",
          "visual": "🔡",
          "question": "‘ㅝ·ㅟ’ 같은 모음자도 있어요.<br>‘귀’의 모음자가 무엇인지 보이나요?",
          "img": "assets/photo/korean/vowels3.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "ㅇ＋ㅑ는?",
              "a": "야"
            },
            {
              "q": "ㅑ는 무엇?",
              "a": "모음자"
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
          "title": "또 다른 모음자",
          "content": "두 모음자가 만난 모음자가 더 있어요. 소리를 잘 듣고 글자를 또박또박 읽어 봐요!",
          "symbol_meanings": [
            {
              "symbol": "ㅟ",
              "meaning": "ㄱ + ㅟ → 귀"
            },
            {
              "symbol": "ㅝ",
              "meaning": "ㄷ + ㅝ → ‘둬’"
            },
            {
              "symbol": "ㅢ",
              "meaning": "ㅇ + ㅢ → 의(자)"
            },
            {
              "symbol": "ㅞ",
              "meaning": "ㅇ + ㅞ → ‘웨’"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_combo"
        ],
        "tnote": {
          "ask": [
            "지금까지 배운 모음자를 떠올려 볼까?"
          ],
          "watch": "여러 모음자 ㅛ·ㅠ 종합",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "chosung_quiz",
        "data": {
          "title": "여러 모음자 낱말 맞히기 🧩",
          "sub": "가운데 글자를 보고 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요",
          "items": [
            {
              "chosung": "ㄱ",
              "answer": "귀",
              "emoji": "👂",
              "hint": "소리를 듣는 몸이에요! (귀)"
            },
            {
              "chosung": "ㅇ ㅈ",
              "answer": "의자",
              "emoji": "🪑",
              "hint": "앉을 때 쓰는 거예요! (의자)"
            },
            {
              "chosung": "ㅂ ㅇ",
              "answer": "바위",
              "emoji": "🪨",
              "hint": "크고 단단한 돌이에요! (바위)"
            },
            {
              "chosung": "ㄱ ㅇ",
              "answer": "가위",
              "emoji": "✂️",
              "hint": "종이를 자를 때 써요! (가위)"
            }
          ]
        },
        "suggested_extras": [
          "x_combo",
          "g_match",
          "e_word"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "모음자 낱말 말하기 놀이 🎤",
          "sub": "버튼을 누르면 발표할 친구를 뽑아요. 오늘 배운 모음자가 들어간 낱말을 하나 말해요!",
          "count": 24,
          "hint": "귀·의자·바위·가위 등 ㅟ·ㅢ가 들어간 낱말을 떠올려 봐요",
          "end_msg": "여러 가지 모음자가 들어간 낱말을 모두 잘 찾았어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "r_word"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "여러 가지 모음자 ③",
          "levels": {
            "읽기": {
              "q": "모음자 ㅛ, ㅠ를 읽어 볼까요?",
              "a": "ㅛ·ㅠ"
            },
            "쓰기": {
              "q": "ㅇ과 ㅛ를 합쳐 '요'를 써 볼까요?",
              "a": "요",
              "steps": [
                "ㅇ＋ㅛ＝요"
              ]
            },
            "말하기": {
              "q": "ㅛ나 ㅠ가 들어간 글자를 말해 봐요.",
              "a": "여러 답 (예: 요, 유)",
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
          "title": "모음자 모으기 짝 놀이",
          "type": "pair",
          "goal": "여러 모음자를 모아 읽어요",
          "body": "짝과 함께 배운 모음자 카드를 모두 모아 순서대로 읽어요.",
          "materials": [
            "모음자 카드"
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
              "q": "ㅇ＋ㅛ는?",
              "a": "요"
            },
            {
              "q": "ㅛ와 ㅠ는 무엇일까요?",
              "a": "모음자"
            },
            {
              "q": "모음자는 몇 가지나 배웠나요?",
              "a": "여러 가지"
            }
          ],
          "self": [
            "여러 모음자를 모두 알아요",
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
            "모음자 ㅝ·ㅞ·ㅟ·ㅢ를 알았어요",
            "이 모음자가 들어간 낱말을 읽었어요",
            "모음자 낱말 말하기 놀이를 했어요"
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
          "preview": "배운 글자 짜임을 점검하는 놀이를 해요",
          "body": "지금까지 배운 글자 짜임을 떠올리며 즐겁게 점검하는 놀이를 할 거예요!"
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
        "title": "내 몸 속 모음자",
        "content": "“‘귀’에는 어떤 모음자가 있죠?” 몸 낱말로 시작하면 친근하게 들어갈 수 있어요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "낯선 모음자는 가볍게",
        "content": "ㅝ·ㅞ는 자주 안 쓰여요. 깊이 다루기보다 ‘이런 것도 있구나’ 정도로 가볍게 지나가도 돼요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "귀 짚어 보기",
        "content": "“귀를 짚어 볼까요? ‘귀’에 든 모음자는?”처럼 몸으로 시작하면 모두 참여해요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "자주 쓰는 것 먼저",
        "content": "ㅟ(귀·가위)·ㅢ(의자)는 생활에서 자주 만나요. 이 둘을 중심으로 익히면 부담이 적어요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "x_combo",
        "type": "misconception",
        "icon": "❓",
        "title": "ㅢ 소리 헷갈리기",
        "content": "‘의자’의 ㅢ는 위치에 따라 소리가 달라질 수 있어요. 1학년은 정확한 표기만 익혀도 충분해요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "낱말 ↔ 모음자 짝짓기",
        "description": "낱말과 그 안에 들어간 모음자를 짝지어 보세요.",
        "hint": "낱말 속에 어떤 모음자가 들어 있나요?",
        "pairs": [
          {
            "a": {
              "text": "👂 귀"
            },
            "b": {
              "text": "ㅟ"
            }
          },
          {
            "a": {
              "text": "🪑 의자"
            },
            "b": {
              "text": "ㅢ"
            }
          },
          {
            "a": {
              "text": "✂️ 가위"
            },
            "b": {
              "text": "ㅟ"
            }
          },
          {
            "a": {
              "text": "🪨 바위"
            },
            "b": {
              "text": "ㅟ"
            }
          }
        ],
        "fit_slides": [
          "chosung_quiz"
        ]
      },
      {
        "id": "e_word",
        "type": "extension",
        "icon": "⬆",
        "title": "모음자 낱말 이어 가기",
        "content": "한 명이 ㅟ 낱말을 말하면 다음 친구가 또 다른 ㅟ 낱말을 잇는 놀이로 어휘를 넓혀요.",
        "fit_slides": [
          "chosung_quiz",
          "present"
        ]
      },
      {
        "id": "t_present",
        "type": "tip",
        "icon": "🧩",
        "title": "놀이처럼 즐겁게",
        "content": "발표를 점수 매기지 말고 ‘얼마나 많은 낱말을 함께 모았나’로 즐기면 참여가 활발해져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_word",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 속 모음자 낱말",
        "content": "의자·가위처럼 교실에 있는 물건 이름으로 모음자를 만나면 학습이 생활과 이어져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "x_read",
        "type": "misconception",
        "icon": "❓",
        "title": "모음자 하나도 글자",
        "content": "모음자가 복잡해 보여도 자음자 하나와 합치면 한 글자예요. 글자 수가 늘지 않음을 짚어 주세요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "여러 모음자 돌아보기",
        "content": "“ㅐ부터 ㅟ까지, 우리가 만난 모음자가 참 많았죠?” 되짚으며 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "배운 짜임 떠올리기",
        "content": "다음 시간 점검 놀이를 위해, 옆 짜임·위아래 짜임 글자를 하나씩 떠올려 두게 해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l12"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 12,
      "title": "글자 짜임을 점검해요",
      "std": "[2국04-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 배운 것 돌아보기 → 짜임 복습 → 글자 짜임 맞히기 → 옆/위아래 나누기 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "글자 짜임을 점검해요",
          "subtitle": "1단원 · 12/14차시 · 점검"
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
            "지금까지 배운 글자 짜임을 떠올려요",
            "글자를 자음자와 모음자로 나눠요",
            "옆 짜임과 위아래 짜임을 가려요"
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
          "scene_title": "얼마나 알게 됐을까요? 🌟",
          "visual": "🧠",
          "question": "글자가 무엇으로 이뤄지는지,<br>짜임이 어떤지 함께 점검해 봐요!",
          "img": "assets/photo/korean/check_structure.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "ㅇ＋ㅛ는?",
              "a": "요"
            },
            {
              "q": "ㅛ와 ㅠ는?",
              "a": "모음자"
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
          "title": "우리가 배운 것",
          "content": "글자는 **자음자 + 모음자**로 이뤄지고, 짜임에는 **옆**과 **위아래**가 있어요. 받침이 없는 글자를 또박또박 읽고 쓸 수 있게 됐어요!",
          "symbol_meanings": [
            {
              "symbol": "자모 결합",
              "meaning": "ㄱ + ㅏ → 가"
            },
            {
              "symbol": "옆 짜임",
              "meaning": "가 · 지 · 비"
            },
            {
              "symbol": "위아래 짜임",
              "meaning": "고 · 무 · 도"
            },
            {
              "symbol": "여러 모음자",
              "meaning": "ㅐ · ㅔ · ㅘ · ㅟ …"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ],
        "tnote": {
          "ask": [
            "이 글자는 어떤 자음자와 모음자로 되어 있을까?"
          ],
          "watch": "글자 짜임 분해",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "이 글자를 점검해 볼까요?",
          "sub": "글자를 보고 자음자·모음자로 나누고, 어떤 짜임인지 함께 확인해 봐요!",
          "cards": [
            {
              "clue": "‘바’ — 자모로 나누면?<br>짜임은?",
              "emoji": "➡️",
              "name": "ㅂ + ㅏ · 옆 짜임"
            },
            {
              "clue": "‘코’ — 자모로 나누면?<br>짜임은?",
              "emoji": "⬇️",
              "name": "ㅋ + ㅗ · 위아래 짜임"
            },
            {
              "clue": "‘배’ — 자모로 나누면?<br>모음자는?",
              "emoji": "🍐",
              "name": "ㅂ + ㅐ · 옆 짜임"
            }
          ],
          "outro": "자모로 나누고 짜임까지 알았어요. 정말 많이 배웠네요! 😊"
        },
        "suggested_extras": [
          "q_check",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "question",
        "data": {
          "title": "옆일까, 위아래일까?",
          "question": "다음 글자를 자음자·모음자로 나누고 어떤 짜임인지 함께 말해 봐요!",
          "items": [
            "‘소’ — 자모와 짜임은?",
            "‘기’ — 자모와 짜임은?",
            "‘두’ — 자모와 짜임은?",
            "‘재’ — 자모와 짜임은?"
          ]
        },
        "suggested_extras": [
          "t_present",
          "e_sort"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "글자 짜임 점검",
          "levels": {
            "읽기": {
              "q": "'다'는 어떤 자음자와 모음자로 되어 있나요?",
              "a": "ㄷ과 ㅏ",
              "steps": [
                "ㄷ＋ㅏ＝다"
              ]
            },
            "쓰기": {
              "q": "ㄷ과 ㅏ를 합쳐 '다'를 써 볼까요?",
              "a": "다",
              "steps": [
                "ㄷ＋ㅏ＝다"
              ]
            },
            "말하기": {
              "q": "내가 만든 글자의 짜임을 짝에게 설명해 봐요.",
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
          "title": "글자 짜임 알아맞히기 짝 활동",
          "type": "pair",
          "goal": "글자를 자음자·모음자로 풀어요",
          "body": "짝이 글자를 보여 주면 어떤 자음자＋모음자인지 맞혀요.",
          "materials": [
            "글자 카드"
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
              "q": "'다'의 자음자는?",
              "a": "ㄷ"
            },
            {
              "q": "'다'의 모음자는?",
              "a": "ㅏ"
            },
            {
              "q": "글자는 무엇과 무엇으로 이루어질까요?",
              "a": "자음자와 모음자"
            }
          ],
          "self": [
            "글자의 짜임을 풀 수 있어요",
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
            "배운 글자 짜임을 떠올렸어요",
            "글자를 자음자와 모음자로 나눴어요",
            "옆 짜임과 위아래 짜임을 가렸어요"
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
          "preview": "자음자와 모음자로 재미있는 놀이를 해요",
          "body": "칠판의 자음자·모음자를 보고 낱말을 알아맞히는 놀이를 할 거예요!"
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
        "title": "가장 쉬웠던 것",
        "content": "“이 단원에서 가장 쉬웠던 건 뭐였나요?” 가볍게 물으며 자신감을 북돋워요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "점검은 칭찬과 함께",
        "content": "점검 차시는 평가가 아니라 ‘이만큼 배웠구나’ 확인하는 시간이에요. 틀려도 다시 해 보며 칭찬으로 마무리해요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 재밌던 활동",
        "content": "“글자 만들기 놀이, 모음자 찾기 중 뭐가 제일 재밌었나요?” 돌아보며 흥미를 되살려요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "한눈에 정리",
        "content": "자모 결합·옆/위아래 짜임·여러 모음자를 칠판 한 곳에 모아 보여 주면 단원 전체가 정리돼요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_check",
        "type": "fun_question",
        "icon": "💡",
        "title": "먼저 모음자 찾기",
        "content": "카드를 뒤집기 전에 모음자부터 찾으면 짜임 판단이 빨라져요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "글자 ↔ 짜임 짝짓기",
        "description": "글자와 그 짜임(옆/위아래)을 짝지어 보세요.",
        "hint": "모음자가 옆에 있나요, 아래에 있나요?",
        "pairs": [
          {
            "a": {
              "text": "바"
            },
            "b": {
              "text": "옆 짜임"
            }
          },
          {
            "a": {
              "text": "코"
            },
            "b": {
              "text": "위아래 짜임"
            }
          },
          {
            "a": {
              "text": "비"
            },
            "b": {
              "text": "옆 짜임"
            }
          },
          {
            "a": {
              "text": "두"
            },
            "b": {
              "text": "위아래 짜임"
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
        "icon": "🧩",
        "title": "함께 소리 내어",
        "content": "“다 함께! ㅅ… ㅗ… 소, 위아래 짜임!”처럼 반 전체가 소리 내어 답하면 모두 점검에 참여해요.",
        "fit_slides": [
          "question"
        ]
      },
      {
        "id": "e_sort",
        "type": "extension",
        "icon": "⬆",
        "title": "우리 반 이름 점검",
        "content": "친구 이름의 받침 없는 글자를 자모로 나누고 짜임을 가려 보면 의미 있게 점검할 수 있어요.",
        "fit_slides": [
          "question",
          "next_lesson"
        ]
      },
      {
        "id": "r_around",
        "type": "real_world",
        "icon": "🌍",
        "title": "교실 글자 점검",
        "content": "교실 게시판의 받침 없는 글자를 골라 자모로 나누고 짜임을 가려 보면 생활 속 점검이 돼요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "x_help",
        "type": "misconception",
        "icon": "❓",
        "title": "어려워하는 친구 돕기",
        "content": "짜임을 어려워하는 아이는 단음절(가·소)부터 천천히 다시 해 보게 하면 자신감을 되찾아요.",
        "fit_slides": [
          "concept"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "많이 컸어요",
        "content": "“글자를 못 읽던 때보다 얼마나 자랐는지 느껴 보세요!” 격려하며 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "놀이 자모 준비",
        "content": "다음 시간 자모 놀이를 위해 자음자·모음자 카드를 준비해 두면 바로 활동할 수 있어요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l13"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 13,
      "title": "자음자와 모음자로 놀이해요",
      "std": "[2국04-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 놀이 안내 → 놀이 방법 → 자모 보고 낱말 알아맞히기 → 내 문제 발표 → 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "자음자와 모음자로 놀이해요",
          "subtitle": "1단원 · 13/14차시 · 실천"
        },
        "suggested_extras": [
          "v_song",
          "q_open"
        ]
      },
      {
        "id": "s02",
        "stage": "열기",
        "block": "objective",
        "data": {
          "title": "오늘 우리가 할 일",
          "bullets": [
            "자음자와 모음자로 하는 놀이를 알아요",
            "흩어진 자모를 보고 낱말을 알아맞혀요",
            "내가 만든 낱말 문제를 친구에게 내요"
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
          "scene_title": "오늘은 자모 놀이 시간! 🎮",
          "visual": "🎯",
          "question": "칠판에 자음자와 모음자가 흩어져 있어요.<br>이걸로 무슨 낱말을 만들 수 있을까요?",
          "img": "assets/photo/korean/play_letters.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "'다'의 자음자는?",
              "a": "ㄷ"
            },
            {
              "q": "글자는 무엇으로 이루어질까요?",
              "a": "자음자와 모음자"
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
          "title": "낱말 알아맞히기 놀이",
          "content": "흩어진 **자음자와 모음자**를 보고 어떤 **낱말**을 만들 수 있는지 알아맞혀요. 자모를 합치는 힘을 놀이로 길러요!",
          "symbol_meanings": [
            {
              "symbol": "ㄴ ㅂ ㅣ ㅜ",
              "meaning": "→ 나비? 누비?"
            },
            {
              "symbol": "ㄱ ㅁ ㅗ ㅜ",
              "meaning": "→ 고무? 구모?"
            },
            {
              "symbol": "ㅈ ㄷ ㅏ ㅜ",
              "meaning": "→ 자두!"
            },
            {
              "symbol": "ㅂ ㅈ ㅏ ㅣ",
              "meaning": "→ 바지!"
            }
          ]
        },
        "suggested_extras": [
          "t_concept",
          "x_order"
        ],
        "tnote": {
          "ask": [
            "자음자와 모음자로 어떤 글자를 만들 수 있을까?"
          ],
          "watch": "자모 조합 놀이 종합",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "chosung_quiz",
        "data": {
          "title": "흩어진 자모로 낱말 찾기 🧩",
          "sub": "가운데 자음자와 모음자를 보고 무슨 낱말일지 생각해요. [정답 보기]를 누르면 답이 나와요",
          "items": [
            {
              "chosung": "ㄴ ㅂ",
              "answer": "나비",
              "emoji": "🦋",
              "hint": "꽃밭을 훨훨 날아요!"
            },
            {
              "chosung": "ㄱ ㅁ",
              "answer": "고무",
              "emoji": "🎈",
              "hint": "말랑말랑 늘어나요!"
            },
            {
              "chosung": "ㅈ ㄷ",
              "answer": "자두",
              "emoji": "🟣",
              "hint": "새콤달콤 여름 과일이에요!"
            },
            {
              "chosung": "ㅂ ㅈ",
              "answer": "바지",
              "emoji": "👖",
              "hint": "다리에 입는 옷이에요!"
            },
            {
              "chosung": "ㅇ ㅈ",
              "answer": "의자",
              "emoji": "🪑",
              "hint": "앉을 때 쓰는 거예요!"
            }
          ]
        },
        "suggested_extras": [
          "x_order",
          "g_match",
          "e_make"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "내가 만든 낱말 문제 내기 🎤",
          "sub": "버튼을 누르면 문제를 낼 친구를 뽑아요. 자모를 흩어 놓고 친구들에게 낱말 문제를 내요!",
          "count": 24,
          "hint": "“ㄱ과 ㅣ, ㅊ과 ㅏ! 무슨 낱말일까요?” 처럼 문제를 내요",
          "end_msg": "서로 문제를 내고 맞히며 자모 놀이를 즐겼어요! 잘했어요! 👏"
        },
        "suggested_extras": [
          "t_present",
          "r_play"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "자음자와 모음자로 놀이하기",
          "levels": {
            "읽기": {
              "q": "만든 글자 '나·도·개'를 읽어 볼까요?",
              "a": "나·도·개"
            },
            "쓰기": {
              "q": "자음자와 모음자를 골라 새 글자를 만들어 써 볼까요?",
              "a": "여러 답",
              "open": true
            },
            "말하기": {
              "q": "내가 만든 글자를 친구에게 소리 내어 말해 봐요.",
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
          "title": "글자 만들기 대결 짝 놀이",
          "type": "pair",
          "goal": "정해진 시간에 글자를 많이 만들어요",
          "body": "짝과 카드를 골라 받침 없는 글자를 번갈아 만들며 읽어요.",
          "materials": [
            "자모 카드"
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
              "q": "자음자와 모음자로 무엇을 만들까요?",
              "a": "글자"
            },
            {
              "q": "'도'는 무엇과 무엇으로?",
              "a": "ㄷ과 ㅗ"
            },
            {
              "q": "글자 만들기는 재미있었나요?",
              "a": "여러 답"
            }
          ],
          "self": [
            "자음자·모음자로 글자를 만들며 놀 수 있어요",
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
            "자음자와 모음자로 하는 놀이를 알았어요",
            "흩어진 자모를 보고 낱말을 알아맞혔어요",
            "내가 만든 낱말 문제를 친구에게 냈어요"
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
          "preview": "단원을 마무리하며 낱말을 만들고 또박또박 읽어요",
          "body": "보기의 자모로 낱말을 만들고, 또박또박 읽으며 단원을 마무리할 거예요!"
        },
        "suggested_extras": [
          "e_plan"
        ]
      }
    ],
    "extras": [
      {
        "id": "v_song",
        "type": "video",
        "icon": "🎥",
        "title": "자모 놀이 영상",
        "url": "https://www.youtube.com/results?search_query=%ED%95%9C%EA%B8%80+%EC%9E%90%EB%AA%A8+%EB%86%80%EC%9D%B4+%EC%9C%A0%EC%95%84",
        "description": "자음자·모음자로 낱말을 만드는 놀이를 보며 흥미를 여는 자료.",
        "source": "유튜브 검색 (교사 사전 확인 권장)",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "q_open",
        "type": "fun_question",
        "icon": "💡",
        "title": "누가 빨리 맞힐까?",
        "content": "“선생님이 자모를 칠판에 쓰면 무슨 낱말인지 빨리 맞혀 볼까요?” 가벼운 도전으로 시작해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "놀이로 결합 다지기",
        "content": "이 차시는 배운 결합 원리를 놀이로 굳히는 시간이에요. 정답보다 ‘자모를 합쳐 보는 시도’를 칭찬해 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "여러 답 찾기",
        "content": "같은 자모로 여러 낱말이 나올 수 있어요. “또 다른 답은 없을까?” 물으면 사고가 넓어져요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "자모를 직접 옮기기",
        "content": "낱자 카드를 칠판에서 직접 옮겨 낱말을 만들어 보이면 결합 과정이 눈에 보여요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "x_order",
        "type": "misconception",
        "icon": "❓",
        "title": "순서 바꾸면 다른 낱말",
        "content": "같은 자모도 순서를 바꾸면 다른 낱말이 돼요(‘고무’↔‘무고’). 순서가 중요함을 놀이로 느끼게 해요.",
        "fit_slides": [
          "concept",
          "chosung_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "자모 ↔ 낱말 짝짓기",
        "description": "자모 묶음과 만들어지는 낱말을 짝지어 보세요.",
        "hint": "자모를 합치면 무슨 낱말이 될까요?",
        "pairs": [
          {
            "a": {
              "text": "ㄴ + ㅂ"
            },
            "b": {
              "text": "나비"
            }
          },
          {
            "a": {
              "text": "ㄱ + ㅁ"
            },
            "b": {
              "text": "고무"
            }
          },
          {
            "a": {
              "text": "ㅈ + ㄷ"
            },
            "b": {
              "text": "자두"
            }
          },
          {
            "a": {
              "text": "ㅇ + ㅈ"
            },
            "b": {
              "text": "의자"
            }
          }
        ],
        "fit_slides": [
          "chosung_quiz"
        ]
      },
      {
        "id": "e_make",
        "type": "extension",
        "icon": "⬆",
        "title": "모둠 대결 놀이",
        "content": "모둠별로 자모를 뽑아 더 많은 낱말을 만드는 대결을 하면 협동하며 즐겁게 익혀요.",
        "fit_slides": [
          "chosung_quiz",
          "present"
        ]
      },
      {
        "id": "t_present",
        "type": "tip",
        "icon": "🧩",
        "title": "문제 내기도 학습",
        "content": "문제를 내는 아이도 낱말을 자모로 나누며 배워요. 문제 내기와 맞히기를 번갈아 하게 해 주세요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_play",
        "type": "real_world",
        "icon": "🌍",
        "title": "집에서 가족과 놀이",
        "content": "집에서 가족과 자모 낱말 알아맞히기 놀이를 해 보게 하면 배운 내용이 즐겁게 이어져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 어려운 문제",
        "content": "“오늘 가장 어려웠던 문제는 뭐였나요?” 돌아보며 즐겁게 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_plan",
        "type": "extension",
        "icon": "⬆",
        "title": "마무리 낱말 떠올리기",
        "content": "다음 시간 단원 마무리를 위해, 받침 없는 낱말을 하나 떠올려 또박또박 읽어 보게 해요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };

  LESSONS["u1_l14"] =
  {
    "meta": {
      "grade": 1,
      "subject": "국어",
      "unit": 1,
      "n": 14,
      "title": "낱말을 만들고 또박또박 읽어요",
      "std": "[2국03-01] · [2국02-01]",
      "duration_min": 40,
      "lesson_format": "교사주도 8슬 — 단원 돌아보기 → 만들기·읽기 방법 → 보기 자모로 낱말 만들기 → 또박또박 읽기 발표 → 단원 마무리 · 40분 표준 증보(국어 §7)"
    },
    "slides": [
      {
        "id": "s01",
        "stage": "열기",
        "block": "cover",
        "data": {
          "title": "낱말을 만들고 또박또박 읽어요",
          "subtitle": "1단원 · 14/14차시 · 단원 마무리"
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
            "보기의 자음자와 모음자로 낱말을 만들어요",
            "받침 없는 낱말을 또박또박 읽어요",
            "단원에서 배운 것을 마무리해요"
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
          "scene_title": "우리 정말 많이 자랐어요! 🌱",
          "visual": "🎓",
          "question": "글자가 자음자와 모음자로 이뤄짐을 배웠죠.<br>오늘은 배운 것으로 낱말을 만들고 읽어 봐요!",
          "img": "assets/photo/korean/words.jpg"
        },
        "suggested_extras": [
          "q_around"
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
              "q": "자음자와 모음자로 무엇을 만들까요?",
              "a": "글자"
            },
            {
              "q": "'도'는 무엇과 무엇으로?",
              "a": "ㄷ과 ㅗ"
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
          "title": "낱말 만들고 읽기",
          "content": "보기의 자음자와 모음자를 자리에 맞춰 합치면 낱말이 돼요. 만든 낱말은 **또박또박** 소리 내어 읽어 봐요!",
          "symbol_meanings": [
            {
              "symbol": "보기 자음자",
              "meaning": "ㄱ ㅁ ㅅ …"
            },
            {
              "symbol": "보기 모음자",
              "meaning": "ㅏ ㅗ ㅐ ㅡ …"
            },
            {
              "symbol": "ㄱ + ㅡ",
              "meaning": "→ 그"
            },
            {
              "symbol": "ㅁ + ㅗ",
              "meaning": "→ 모"
            }
          ]
        },
        "suggested_extras": [
          "t_concept"
        ],
        "tnote": {
          "ask": [
            "글자를 이으면 무엇이 될까?"
          ],
          "watch": "낱말 만들기·또박또박 읽기",
          "min": 3
        }
      },
      {
        "id": "s05",
        "stage": "활동",
        "block": "card_quiz",
        "data": {
          "title": "보기 자모로 낱말 만들기",
          "sub": "보기의 자음자·모음자로 어떤 낱말을 만들 수 있는지 맞혀 봐요!",
          "cards": [
            {
              "clue": "ㄱ·ㅡ·ㄹ·ㅣ<br>그림 그리는 거예요!",
              "emoji": "🖍️",
              "name": "그림"
            },
            {
              "clue": "ㅅ·ㅗ·ㄱ·ㅐ<br>새로운 친구에게!",
              "emoji": "🙋",
              "name": "소개"
            },
            {
              "clue": "ㅁ·ㅏ·ㅇ·ㅡ·ㅁ<br>고마운 ○○이에요!",
              "emoji": "💛",
              "name": "마음"
            }
          ],
          "outro": "보기 자모로 낱말을 척척 만들었어요. 한글 해득의 첫걸음을 멋지게 마쳤어요! 🎉"
        },
        "suggested_extras": [
          "q_make",
          "g_match"
        ]
      },
      {
        "id": "s06",
        "stage": "발표",
        "block": "present",
        "data": {
          "title": "내가 만든 낱말 또박또박 읽기 🎤",
          "sub": "버튼을 누르면 읽을 친구를 뽑아요. 만든 낱말을 바른 자세로 또박또박 읽어요!",
          "count": 24,
          "hint": "허리 펴고, ‘그-림’처럼 한 글자씩 또박또박 읽어요",
          "end_msg": "받침 없는 글자를 또박또박 읽고 쓸 수 있게 됐어요. 단원을 멋지게 마쳤어요! 🎉👏"
        },
        "suggested_extras": [
          "t_present",
          "r_done"
        ]
      },
      {
        "id": "s101",
        "stage": "활동",
        "block": "leveled_problem",
        "data": {
          "title": "낱말을 만들고 또박또박 읽기",
          "levels": {
            "읽기": {
              "q": "낱말 '가지·오이·포도'를 또박또박 읽어 볼까요?",
              "a": "가지·오이·포도"
            },
            "쓰기": {
              "q": "글자를 이어 낱말 '포도'를 써 볼까요?",
              "a": "포도",
              "steps": [
                "포＋도＝포도"
              ]
            },
            "말하기": {
              "q": "내가 아는 낱말을 하나 만들어 말해 봐요.",
              "a": "여러 답 (예: 오이, 나비)",
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
          "title": "낱말 이어 만들기 짝 놀이",
          "type": "pair",
          "goal": "글자를 이어 낱말을 만들어요",
          "body": "짝과 글자 카드를 이어 낱말을 만들고 또박또박 읽어 줘요.",
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
              "q": "'포도'는 몇 글자인가요?",
              "a": "두 글자"
            },
            {
              "q": "낱말은 무엇을 이어 만들까요?",
              "a": "글자"
            },
            {
              "q": "낱말을 읽을 때는 어떻게?",
              "a": "또박또박"
            }
          ],
          "self": [
            "글자를 이어 낱말을 읽을 수 있어요",
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
          "title": "단원을 마치며",
          "points": [
            "글자가 자음자와 모음자로 이뤄짐을 배웠어요",
            "옆 짜임과 위아래 짜임, 여러 모음자를 알았어요",
            "받침 없는 낱말을 또박또박 읽고 쓸 수 있어요"
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
          "preview": "이번엔 받침이 있는 글자를 배워요",
          "body": "‘강·산·집’처럼 받침이 있는 글자의 짜임을 다음 단원에서 만나 볼 거예요!"
        },
        "suggested_extras": [
          "e_next"
        ]
      }
    ],
    "extras": [
      {
        "id": "q_open",
        "type": "fun_question",
        "icon": "💡",
        "title": "기억에 남는 것",
        "content": "“이 단원에서 가장 기억에 남는 건 뭐였나요?” 가볍게 물으며 단원을 돌아보게 해요.",
        "fit_slides": [
          "cover",
          "motivate"
        ]
      },
      {
        "id": "t_goal",
        "type": "tip",
        "icon": "🧩",
        "title": "만들고 읽기로 마무리",
        "content": "마무리 차시는 새 지식보다 ‘배운 것으로 직접 해 보기’예요. 낱말을 만들고 또박또박 읽는 성취감을 느끼게 해 주세요.",
        "fit_slides": [
          "objective",
          "concept"
        ]
      },
      {
        "id": "q_around",
        "type": "fun_question",
        "icon": "💡",
        "title": "처음과 지금",
        "content": "“글자를 잘 몰랐던 처음과 지금, 무엇이 달라졌나요?” 성장을 느끼게 하면 자신감이 자라요.",
        "fit_slides": [
          "motivate"
        ]
      },
      {
        "id": "t_concept",
        "type": "tip",
        "icon": "🧩",
        "title": "보기 자모 함께 보기",
        "content": "보기의 자모를 칠판에 크게 써 두고 “여기서 골라 합쳐 봐요”라고 하면 아이들이 안심하고 만들어요.",
        "fit_slides": [
          "concept",
          "card_quiz"
        ]
      },
      {
        "id": "q_make",
        "type": "fun_question",
        "icon": "💡",
        "title": "또 무슨 낱말?",
        "content": "같은 보기로 또 다른 낱말을 만들 수 있는지 물으면 더 많은 낱말을 떠올려요.",
        "fit_slides": [
          "card_quiz"
        ]
      },
      {
        "id": "g_match",
        "type": "game",
        "game_kind": "memory_match",
        "icon": "🎮",
        "title": "자모 ↔ 낱말 짝짓기",
        "description": "보기 자모와 만들어지는 낱말을 짝지어 보세요.",
        "hint": "자모를 합치면 무슨 낱말이 될까요?",
        "pairs": [
          {
            "a": {
              "text": "ㄱ + ㅡ + ㄹ + ㅣ"
            },
            "b": {
              "text": "그림"
            }
          },
          {
            "a": {
              "text": "ㅅ + ㅗ + ㄱ + ㅐ"
            },
            "b": {
              "text": "소개"
            }
          },
          {
            "a": {
              "text": "ㅁ + ㅏ + ㅇ + ㅡ + ㅁ"
            },
            "b": {
              "text": "마음"
            }
          },
          {
            "a": {
              "text": "ㄱ + ㅗ + ㅁ + ㅏ"
            },
            "b": {
              "text": "고마(워)"
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
        "icon": "🧩",
        "title": "또박또박 칭찬",
        "content": "빨리보다 ‘또박또박 바른 자세로’ 읽는 아이를 크게 칭찬하면 좋은 읽기 습관이 굳어져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "r_done",
        "type": "real_world",
        "icon": "🌍",
        "title": "집에서 낱말 만들기",
        "content": "집에서 가족과 자모로 낱말을 만들고 또박또박 읽어 보면 단원에서 배운 것이 생활로 이어져요.",
        "fit_slides": [
          "present"
        ]
      },
      {
        "id": "x_proud",
        "type": "misconception",
        "icon": "❓",
        "title": "느린 친구도 잘하는 중",
        "content": "아직 느린 아이도 ‘읽고 쓰는 힘이 자라는 중’이에요. 비교하지 말고 각자의 성장을 칭찬해 주세요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_more",
        "type": "extension",
        "icon": "⬆",
        "title": "나만의 낱말책",
        "content": "이 단원에서 만든 낱말을 모아 ‘나만의 낱말책’을 만들면 성취가 눈에 보여요.",
        "fit_slides": [
          "present",
          "summary"
        ]
      },
      {
        "id": "q_reflect",
        "type": "fun_question",
        "icon": "💡",
        "title": "가장 뿌듯한 것",
        "content": "“오늘 가장 뿌듯했던 건 뭐였나요?” 물으며 따뜻하게 단원을 마무리해요.",
        "fit_slides": [
          "summary"
        ]
      },
      {
        "id": "e_next",
        "type": "extension",
        "icon": "⬆",
        "title": "받침 글자 찾아보기",
        "content": "다음 단원을 위해, 둘레에서 받침이 있는 글자(강·산·집 등)를 찾아보게 하면 도입이 매끄러워요.",
        "fit_slides": [
          "next_lesson"
        ]
      }
    ]
  };
