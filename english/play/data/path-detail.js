/* ============================================================
 * 영어 놀이터 — 한 해 길 걸음 상세판 : 입체 방이 읽는 꼴(W15)
 * ※ 자동 생성 — 손으로 고치지 않는다. 생성기: handoff/scripts/gen_en_play_path.js
 *   원천: handoff kedu/english/play-path/path_v1.js 의 GLADE · CHANT · 걸음 detail(detail_A~F.js — 문서 kedu/영어_플레이_한해길_상세_*.md)
 *   glade = 빈터 판형(자리 · 쓰는 자리 · 선반 · 규칙) · chant = 챈트 박자 · steps[걸음] = room(방) · events(사건 넷) · notes(쪽지 셋) · guest(특별 손님) · job(부탁)
 * ============================================================ */
window.PLAY_PATH_DETAIL = {
 "source": "kedu/english/play-path/path_v1.js",
 "glade": {
  "size": [
   16,
   10
  ],
  "slots": {
   "La": [
    -6.6,
    -1.2
   ],
   "Lb": [
    -3.4,
    -1.8
   ],
   "Lc": [
    -5.6,
    1
   ],
   "Ld": [
    -3.4,
    1
   ],
   "Le": [
    -5,
    3.6
   ],
   "Ra": [
    6.6,
    -1.2
   ],
   "Rb": [
    3.4,
    -1.8
   ],
   "Rc": [
    5.6,
    1
   ],
   "Rd": [
    3.4,
    1
   ],
   "Re": [
    5,
    3.6
   ],
   "treeL": [
    -5,
    -3.2
   ],
   "treeR": [
    5,
    -3.2
   ],
   "center": [
    0,
    -3.4
   ],
   "back": [
    0,
    -5
   ],
   "skyL": [
    -2.4,
    -2.6
   ],
   "skyR": [
    2.4,
    -2.6
   ]
  },
  "spots": {
   "owner": [
    0,
    -1
   ],
   "me": [
    -1.5,
    1.9
   ],
   "guide": [
    1.5,
    1.9
   ],
   "basketL": [
    -3,
    3
   ],
   "basketR": [
    3,
    3
   ],
   "path": [
    0,
    4.3
   ],
   "dict": [
    -7.2,
    2.4
   ],
   "post": [
    -7.2,
    4.2
   ],
   "sign": [
    7.2,
    2.4
   ],
   "bus": [
    7.2,
    4.2
   ],
   "guest": [
    7.4,
    0.4
   ]
  },
  "shelf": {
   "L": [
    -5,
    -1.55
   ],
   "R": [
    5,
    -1.55
   ]
  },
  "neutral": [
   "center",
   "back",
   "me"
  ],
  "minGap": 1.6,
  "rules": [
   "첫 글자 낱말 넷은 왼쪽(L·treeL·skyL), 둘째 글자 낱말 넷은 오른쪽(R·treeR·skyR). 가운데·뒤·내 몸은 어느 글자든 쓸 수 있되 글자마다 둘까지.",
   "물건이 보이는 단계(v2 §7-2 를 바깥 무대로 읽음): 심기 전 = 제자리에 빛바랜 색 → 씨앗 = 제 색 + 살아 움직임 → 꽃 = 그 물건의 작은 나무 조각이 제 나무 앞 선반 칸에 하나 더 놓임 → 열매 = 조각에 아이가 쓴 첫 글자 이름표. 장면의 물건은 치우지 않는다(빈터가 비면 안 된다).",
   "몸 낱말(elbow·hand·leg·nose)은 내 캐릭터의 몸이다 — 누르면 그 자리가 반짝이며 몸짓. 선반 조각은 그림 판자.",
   "동작·수·색 낱말(kick·jump·up·under·six·ten·zero·red·yellow·quack·quiz·zip)은 with: 로 다른 물건에 얹거나 주민의 몸짓으로 보인다.",
   "놀이 소품(바구니·통나무 기차 길·발판·글자 길 잉크)은 그 놀이 동안만 나온다. 놀이가 끝나면 빈터로 돌아간다.",
   "빈터 안 글자는 그 걸음까지 배운 글자뿐(팻말·열매·이름표). 낱말을 통째로 적은 글자는 통말뿐(I·like·it…). 입말 낱말은 첫 글자만.",
   "통나무 버스는 왼쪽 숲길에서 들어와 정류장(bus)에 서고 오른쪽 숲길로 나간다. 문이 열리기 전에는 문을 닫은 채 김만 낸다."
  ],
  "rigs": [
   "morning",
   "day",
   "afternoon",
   "evening",
   "lantern"
  ],
  "weather": [
   "clear",
   "mist",
   "wind",
   "rain",
   "cloud",
   "dew",
   "moon",
   "cool",
   "glow"
  ],
  "accents": [
   "--a-gold",
   "--a-red",
   "--a-fish",
   "--a-plum",
   "--a-cream",
   "--a-leaf",
   "--a-wood",
   "--a-steel",
   "--a-pink"
  ]
 },
 "chant": {
  "cells": 8,
  "letter": {
   "L1": 1,
   "L2": 3,
   "S1": 5,
   "S2": 6,
   "word": [
    7,
    8
   ]
  },
  "stomp": [
   1,
   3,
   5,
   7
  ],
  "bpm": {
   "listen": 104,
   "echo": 104,
   "together": 116,
   "solo": 116,
   "readDayPlus": 12
  },
  "stages": [
   "듣기 — 주인이 줄마다, 낱말에서 물건이 빛난다",
   "메아리 — 한 줄 듣고 한 줄 따라, 내 목소리를 바로 다시 듣는다",
   "같이 — 박자가 한 걸음 빨라지고 낱말 자리에서 물건이 폴짝",
   "혼자 — 주인은 박자만, 낱말 자리에 그림이 뜨고 아이가 채운다"
  ],
  "half": "만나는 날 = 첫 글자 넉 줄 + 끝 줄 / 읽는 날 = 둘째 글자 넉 줄 + 끝 줄(빨라진 박자) / 쓰는 날의 낱말 기차가 여덟 낱말을 다시 돈다",
  "wordSec": [
   0.28,
   0.14
  ]
 },
 "steps": {
  "A01": {
   "room": {
    "rig": "morning",
    "weather": "clear",
    "accent": "--a-red",
    "sound": "아침 새소리 + 개울 졸졸",
    "center": "얕은 개울과 징검돌 셋. 물 위로 악어 눈 두 개. 왼쪽 나무는 진짜 사과나무(붉은 사과 사이에 a 열매)",
    "props": {
     "apple": [
      "Ld",
      "굴러 나온 큰 사과 — 누르면 데굴 한 바퀴"
     ],
     "ant": [
      "Lc",
      "사과 조각을 나르는 개미 줄(다섯 마리)"
     ],
     "ax": [
      "Lb",
      "그루터기에 놓인 둥근 나무 도끼(장난감)"
     ],
     "alligator": [
      "center",
      "개울에서 눈만 내놓다가 누르면 하품"
     ],
     "bag": [
      "Rd",
      "나뭇가지에 걸어 둔 배낭 — 누르면 덜렁"
     ],
     "bed": [
      "Rc",
      "이끼 침대. 머리판(왼쪽 막대)·발판(오른쪽 막대)이 b·d 모양 — 다음 걸음에 d 가 온다"
     ],
     "bus": [
      "Re",
      "통나무 버스 — 정류장으로 가는 길목에서 굴뚝 김"
     ],
     "bird": [
      "treeR",
      "가지 위의 통통한 새 — 누르면 깃을 턴다"
     ]
    },
    "extras": [
     "징검돌",
     "사과 바구니(빈 것)",
     "버섯 몇"
    ],
    "life": [
     "사과를 나르는 개미 줄",
     "개울에서 눈만 내놓은 악어",
     "통나무 버스 굴뚝 김",
     "가지 위 새",
     "나뭇잎 사이로 드는 아침 햇살 줄기"
    ],
    "ink": {
     "at": "sign",
     "on": "빈터 팻말(나무 판)",
     "lines": 1
    },
    "beat": "통나무 두드리는 소리 — 사과가 박자에 들썩",
    "ride": "숲길 양쪽에 찻잔 모양 버섯이 하나둘 — 그루터기 찻집으로"
   },
   "events": [
    {
     "id": "roll",
     "name": "굴러간 열매",
     "beat": 1,
     "game": "schant",
     "who": "max",
     "en": "Oh! Listen!",
     "scene": "사과나무에서 a 열매가 톡 떨어져 데굴데굴 — Max 발 앞에 멈춘다. Max 가 주워 들고 발을 구르기 시작한다.",
     "end": "열매가 빈터 가운데 받침돌에 올라앉는다."
    },
    {
     "id": "ants",
     "name": "개미 줄",
     "beat": 2,
     "game": "magic",
     "who": "mina",
     "en": "Oh! Hi, ant!",
     "scene": "개미들이 b 열매를 줄지어 메고 가 버린다. 아이가 b 낱말을 부를 때마다(bag·bed·bus·bird) 개미 줄이 한 걸음씩 돌아온다.",
     "end": "개미들이 열매를 내려놓고 사과 조각 하나를 받아 간다."
    },
    {
     "id": "busready",
     "name": "버스 떠날 채비",
     "beat": 3,
     "game": "wtrain",
     "who": "max",
     "en": "I like it!",
     "scene": "통나무 버스가 짐칸 여덟을 달고 빈터를 돈다. 칸마다 그림 하나 — 이름을 부르면 칸에 불이 켜진다.",
     "end": "굴뚝에서 김이 뿜 — a·b 열매가 두 나무에 다시 달린다."
    },
    {
     "id": "yawn",
     "name": "악어의 하품",
     "beat": 0,
     "game": "pop",
     "who": "ben",
     "en": "Wow! Big!",
     "scene": "악어가 크게 하품하면 물방울이 떠오른다. 물방울마다 그림 — 들린 이름의 물방울을 톡.",
     "end": "악어가 눈을 끔벅하고 다시 물속으로."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "ant",
     "show": [
      "[a]",
      "{apple}"
     ],
     "en": "I like it!",
     "act": {
      "do": "find",
      "letter": "a"
     },
     "react": "개미들이 한 줄로 서서 더듬이를 흔든다. 맨 끝 개미가 b 열매 쪽을 흘끔.",
     "leads": "ants"
    },
    {
     "arrive": "read",
     "from": "bird",
     "show": [
      "[b]",
      "{bird}",
      "{bus}"
     ],
     "en": "Hi, big bird!",
     "act": {
      "do": "say",
      "line": "Hi, big bird!",
      "tap": "bird"
     },
     "react": "새가 가지에서 내려와 버스 지붕에 앉는다.",
     "leads": "busready"
    },
    {
     "arrive": "write",
     "from": "cat",
     "sign": "고양이 발자국",
     "show": [
      "{apple}",
      "{bus}"
     ],
     "en": "Hi! I like it!",
     "act": {
      "do": "ride"
     },
     "react": "버스가 경적을 한 번. 문이 열렸으면 출발, 아직이면 문을 닫은 채 기다린다(쪽지는 우체통에 남는다).",
     "leads": "A02"
    }
   ],
   "guest": {
    "who": "alligator",
    "enter": "개울에서 눈만 내놓던 악어가 처음으로 뭍에 올라와 통나무에 턱을 괸다.",
    "turns": [
     {
      "show": "ant",
      "pick": [
       "a",
       "b"
      ],
      "ans": "a"
     },
     {
      "show": "bus",
      "pick": [
       "b",
       "a"
      ],
      "ans": "b"
     },
     {
      "say": "I like it!",
      "cue": "악어가 사과를 한입 베어 문다"
     }
    ],
    "bye": "꼬리로 물을 튕겨 작은 무지개 — 버스 문이 열린다."
   },
   "job": {
    "who": "max",
    "ask": "빈 팻말을 가리키며 어깨를 으쓱한다.",
    "write": [
     "a",
     "b"
    ],
    "gives": "팻말에 아이 글씨 a·b 가 붙는다. 그 아래 정류장 등이 켜지고 버스가 이 빈터에 선다."
   }
  },
  "A02": {
   "room": {
    "rig": "day",
    "weather": "clear",
    "accent": "--a-gold",
    "sound": "찻물 끓는 소리 + 나뭇잎",
    "center": "큰 그루터기 찻상. 둘레에 작은 그루터기 의자 넷(비어 있다). 오른쪽 뒤에 작은 연못",
    "props": {
     "cat": [
      "Ld",
      "그루터기 의자 옆에서 꼬리를 살랑 — 케이크를 본다"
     ],
     "cup": [
      "center",
      "찻상 위 김 나는 컵"
     ],
     "car": [
      "Lc",
      "동그란 길을 뱅글 도는 장난감 자동차"
     ],
     "cake": [
      "Lb",
      "손수레 위 케이크 받침대"
     ],
     "dog": [
      "Rd",
      "꼬리 흔드는 강아지 — 케이크를 본다"
     ],
     "dad": [
      "Rc",
      "앞치마를 두른 아빠(찻집 주인)"
     ],
     "duck": [
      "Ra",
      "연못을 도는 오리"
     ],
     "desk": [
      "Rb",
      "계산대 책상 — 차림표가 놓인다"
     ]
    },
    "extras": [
     "찻주전자",
     "방석 넷(하루에 하나씩 놓인다)",
     "연못 연잎"
    ],
    "life": [
     "컵에서 오르는 김",
     "꼬리 흔드는 개",
     "연못을 도는 오리",
     "장난감 자동차가 뱅글",
     "찻주전자 뚜껑이 달그락"
    ],
    "ink": {
     "at": "Rb",
     "on": "찻집 차림표(책상 위 세운 판)",
     "lines": 1
    },
    "beat": "찻숟가락이 컵을 치는 소리 — 컵과 케이크가 박자에 들썩",
    "ride": "물소리가 커지고 길가 풀잎에 물방울 — 코끼리 폭포로"
   },
   "events": [
    {
     "id": "empty",
     "name": "손님 없는 찻집",
     "beat": 1,
     "game": "order",
     "who": "max",
     "en": "Hi! Listen!",
     "scene": "찻상은 차려졌는데 의자가 다 비었다. 아빠가 종을 딸랑 — 숲 친구가 하나씩 와서 그림으로 주문하고, 아이가 그 이름을 외친다.",
     "end": "의자 하나에 방석이 놓인다."
    },
    {
     "id": "stare",
     "name": "케이크 눈싸움",
     "beat": 2,
     "game": "basket",
     "who": "ben",
     "en": "Oh! Cat! Dog!",
     "scene": "고양이와 강아지가 케이크 양쪽에서 서로 노려본다. 들린 낱말을 c 바구니(고양이 쪽)·d 바구니(강아지 쪽)에 가를 때마다 둘이 한 칸씩 제자리로 물러난다.",
     "end": "둘이 나란히 앉아 케이크 한 조각씩."
    },
    {
     "id": "duckway",
     "name": "오리 가족 길",
     "beat": 3,
     "game": "sjump",
     "who": "mina",
     "en": "Hi, duck!",
     "scene": "오리가 새끼들을 데리고 찻집으로 오다가 갈림길에서 멈춘다. 들린 소리의 글자 쪽으로 몸을 기울이면 그쪽 길이 열린다.",
     "end": "오리 가족까지 앉아 찻집이 꽉 찬다 — c·d 열매가 달린다."
    },
    {
     "id": "toytrain",
     "name": "뱅글 자동차",
     "beat": 0,
     "game": "wtrain",
     "who": "ben",
     "en": "Wow!",
     "scene": "장난감 자동차가 짐칸을 달고 찻상 둘레를 돈다. 칸마다 그림 — 이름을 부르면 불.",
     "end": "자동차가 제 길로 돌아가 다시 뱅글."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "cat",
     "show": [
      "[c]",
      "{cat}",
      "{cake}"
     ],
     "en": "I like it!",
     "act": {
      "do": "find",
      "letter": "c"
     },
     "react": "고양이가 가르랑거리며 케이크 쪽으로 한 발.",
     "leads": "stare"
    },
    {
     "arrive": "read",
     "from": "dad",
     "show": [
      "[c]",
      "[d]",
      "{cup}",
      "{duck}"
     ],
     "en": "Hi, dad!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "c",
        "cup"
       ],
       [
        "d",
        "duck"
       ]
      ]
     },
     "react": "아빠가 앞치마를 털고 연못 쪽을 가리킨다.",
     "leads": "duckway"
    },
    {
     "arrive": "write",
     "from": "elf",
     "sign": "뾰족 모자 그림자",
     "show": [
      "{cup}",
      "{bus}"
     ],
     "en": "Hi! I like it!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지 귀퉁이에서 물방울이 또르르. 버스가 경적.",
     "leads": "A03"
    }
   ],
   "guest": {
    "who": "duck",
    "enter": "연못을 돌던 오리가 뒤뚱뒤뚱 올라와 빈 의자에 앉는다.",
    "turns": [
     {
      "show": "cup",
      "pick": [
       "c",
       "d"
      ],
      "ans": "c"
     },
     {
      "show": "bed",
      "pick": [
       "d",
       "b",
       "c"
      ],
      "ans": "b",
      "why": "b·d 가르기 — 지난 빈터의 침대가 돌아온다"
     },
     {
      "say": "I like it!",
      "cue": "오리가 케이크 접시를 날개로 밀어 준다"
     }
    ],
    "bye": "꽥 한 번 하고 찻집 문 위 등을 부리로 켠다."
   },
   "job": {
    "who": "dad",
    "ask": "아무것도 안 적힌 차림표를 내밀며 머리를 긁적인다.",
    "write": [
     "c",
     "d"
    ],
    "gives": "차림표 머리에 아이 글씨 c·d, 그 옆에 컵·오리 도장이 찍힌다. 찻집 문 위 등이 켜진다."
   }
  },
  "A03": {
   "room": {
    "rig": "day",
    "weather": "mist",
    "accent": "--a-fish",
    "sound": "폭포 소리(멀리) + 물방울",
    "center": "뒤쪽 바위에서 떨어지는 폭포와 둥근 소. 소 앞 풀 둥지에 커다란 알 하나",
    "props": {
     "egg": [
      "center",
      "풀 둥지 위의 큰 알 — 누르면 톡톡 흔들린다"
     ],
     "elephant": [
      "La",
      "코로 물을 뿜는 아기 코끼리"
     ],
     "elbow": [
      "me",
      "내 캐릭터의 팔꿈치 — 누르면 팔을 굽혀 보인다"
     ],
     "elf": [
      "Ld",
      "알 곁을 지키는 뾰족 모자 요정"
     ],
     "fish": [
      "skyR",
      "폭포 소에서 높이 튀어 오르는 물고기"
     ],
     "fan": [
      "Rd",
      "세워 둔 큰 나뭇잎 부채 — 요정이 가끔 와서 부친다"
     ],
     "fox": [
      "Rc",
      "바위 뒤에서 기웃거리는 여우"
     ],
     "frog": [
      "Rb",
      "연잎 위 개구리"
     ]
    },
    "extras": [
     "이끼 바위",
     "연잎",
     "물안개 속 작은 무지개(해가 들 때)"
    ],
    "life": [
     "폭포 물안개",
     "코끼리 코 물뿜기",
     "튀어 오르는 물고기",
     "부채질하는 요정",
     "연잎이 물 위에서 천천히 돈다"
    ],
    "ink": {
     "at": "center",
     "on": "알 둥지 앞 작은 이름표",
     "lines": 1
    },
    "beat": "물방울 떨어지는 소리 — 알이 박자에 까딱",
    "ride": "길이 오르막이 되고 풀이 바람에 눕는다 — 염소 언덕으로"
   },
   "events": [
    {
     "id": "whoseegg",
     "name": "누구 알일까",
     "beat": 1,
     "game": "pop",
     "who": "mina",
     "en": "Oh! Egg!",
     "scene": "알이 톡톡 흔들린다. 물안개 방울 속에 그림이 하나씩 비친다 — 들린 이름의 방울을 톡.",
     "end": "알에 금이 하나 간다."
    },
    {
     "id": "guard",
     "name": "알 지키는 요정",
     "beat": 2,
     "game": "lfruit",
     "who": "amy",
     "en": "Oh! Fox!",
     "scene": "여우가 살금살금 다가온다. 요정이 글자 열매를 방패처럼 든다 — 글자를 보고 그 소리를 고르면 여우가 한 발씩 물러난다.",
     "end": "여우가 머쓱하게 웃고 바위에 앉아 구경한다."
    },
    {
     "id": "babyfish",
     "name": "아기 물고기 행렬",
     "beat": 3,
     "game": "wtrain",
     "who": "max",
     "en": "I like you!",
     "scene": "알이 열리고 아기 물고기들이 물길을 따라 줄줄이 폭포로 간다. 등마다 그림 — 이름을 부르면 반짝.",
     "end": "마지막 물고기가 퐁당. 요정이 손을 흔든다 — e·f 열매가 달린다."
    },
    {
     "id": "shower",
     "name": "코끼리 샤워",
     "beat": 0,
     "game": "sjump",
     "who": "ben",
     "en": "Listen!",
     "scene": "코끼리가 물을 뿜을 채비. 들린 소리의 글자 쪽으로 몸을 기울이면 그쪽에 무지개가 뜬다.",
     "end": "코끼리가 코를 높이 들어 인사."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "elf",
     "show": [
      "[e]",
      "{egg}",
      "{elf}"
     ],
     "en": "Hi, friend!",
     "act": {
      "do": "say",
      "line": "Hi, elf!",
      "tap": "elf"
     },
     "react": "요정이 모자를 벗어 인사하고, 바위 뒤 여우 쪽을 손가락으로 쉿.",
     "leads": "guard"
    },
    {
     "arrive": "read",
     "from": "frog",
     "show": [
      "[f]",
      "{fish}",
      "{frog}",
      "{fox}"
     ],
     "en": "I like you!",
     "act": {
      "do": "find",
      "letter": "f"
     },
     "react": "개구리가 연잎에서 퐁 뛰어 알 쪽을 가리킨다.",
     "leads": "babyfish"
    },
    {
     "arrive": "write",
     "from": "goat",
     "sign": "모자를 문 발굽 자국",
     "show": [
      "{fan}",
      "{bus}"
     ],
     "en": "Hi, friend! I like you!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지가 바람에 팔랑. 버스가 경적.",
     "leads": "A04"
    }
   ],
   "guest": {
    "who": "elf",
    "enter": "요정이 부채를 접고 둥지 앞으로 걸어 나와 한 손을 내민다.",
    "turns": [
     {
      "show": "fan",
      "pick": [
       "e",
       "f"
      ],
      "ans": "f"
     },
     {
      "show": "duck",
      "pick": [
       "d",
       "b",
       "f"
      ],
      "ans": "d",
      "why": "지난 빈터의 d — b 와 다시 가른다"
     },
     {
      "say": "I like you!",
      "cue": "요정이 아기 물고기를 손바닥에 올려 보여 준다"
     }
    ],
    "bye": "부채를 한 번 크게 부쳐 물안개를 걷는다 — 버스가 보인다."
   },
   "job": {
    "who": "elf",
    "ask": "둥지 앞 빈 이름표를 두 손으로 들어 보인다.",
    "write": [
     "e",
     "f"
    ],
    "gives": "이름표에 아이 글씨 e·f. 둥지 위에 나뭇잎 지붕이 얹히고, 아기 물고기가 가끔 돌아와 물 위로 인사한다."
   }
  },
  "A04": {
   "room": {
    "rig": "afternoon",
    "weather": "wind",
    "accent": "--a-leaf",
    "sound": "풀 스치는 바람 + 멀리 방울 소리",
    "center": "언덕 꼭대기의 납작한 큰 바위. 그 위에 돗자리와 놀이판",
    "props": {
     "goat": [
      "La",
      "모자를 물고 언덕 가장자리를 맴도는 염소(목에 방울)"
     ],
     "gum": [
      "Lc",
      "풍선껌 통 — 껌 풍선이 부풀었다 폭"
     ],
     "game": [
      "center",
      "바위 위 놀이판(칸과 말 — 글자 없음)"
     ],
     "girl": [
      "Ld",
      "놀이판 옆에 앉아 기다리는 소녀"
     ],
     "hat": [
      "Rd",
      "바람에 굴러다니는 밀짚모자(염소가 물고 있을 때는 염소 입에)"
     ],
     "hen": [
      "Rc",
      "모이를 쪼는 암탉"
     ],
     "ham": [
      "Rb",
      "바구니 속 따끈한 햄 — 김이 오른다"
     ],
     "hand": [
      "me",
      "내 캐릭터의 손 — 누르면 손을 활짝 흔든다"
     ]
    },
    "extras": [
     "간식 바구니",
     "바람개비",
     "언덕 아래로 보이는 지나온 숲"
    ],
    "life": [
     "바람에 흔들리는 풀",
     "모이를 쪼는 암탉",
     "껌 풍선",
     "굴러가는 모자",
     "바람개비가 돈다"
    ],
    "ink": {
     "at": "center",
     "on": "놀이판 머리의 이름 칸",
     "lines": 1
    },
    "beat": "염소 방울 소리 — 놀이판 말이 박자에 통통",
    "ride": "길이 내리막 그늘로 들어가고 숨이 하얗게 — 얼음 그늘 골짜기로"
   },
   "events": [
    {
     "id": "hatthief",
     "name": "모자 도둑 염소",
     "beat": 1,
     "game": "schant",
     "who": "max",
     "en": "Oh! Goat!",
     "scene": "염소가 모자를 물고 언덕을 빙빙 돈다. Max 가 발을 구르면 염소가 박자마다 멈칫 — 챈트가 시작된다.",
     "end": "염소가 바위 뒤에 숨는다. 모자 끝만 보인다."
    },
    {
     "id": "hamsmell",
     "name": "햄 냄새",
     "beat": 2,
     "game": "magic",
     "who": "mina",
     "en": "Yum! Hot ham!",
     "scene": "소녀와 암탉이 놀이판 옆에 간식을 편다. 아이가 h 낱말을 부를 때마다(hat·hen·ham·hand) 그 물건이 반짝이고 염소가 한 걸음씩 슬금슬금 온다.",
     "end": "염소가 바로 곁까지 와서 코를 벌름."
    },
    {
     "id": "oneround",
     "name": "놀이 한 판",
     "beat": 3,
     "game": "sjump",
     "who": "ben",
     "en": "I like you!",
     "scene": "염소가 모자를 돌려준다. 다 같이 놀이판 — 들린 소리의 글자 칸 쪽으로 몸을 기울이면 내 말이 그 칸으로 폴짝.",
     "end": "말이 끝 칸에 닿는다. 염소가 모자를 아이에게 씌운다 — g·h 열매."
    },
    {
     "id": "bubble",
     "name": "껌 풍선",
     "beat": 0,
     "game": "pop",
     "who": "amy",
     "en": "Wow! Big!",
     "scene": "껌 풍선들이 둥실 떠오른다. 풍선마다 그림 — 들린 이름의 풍선을 톡.",
     "end": "마지막 풍선이 폭 — 염소가 깜짝."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "girl",
     "show": [
      "[g]",
      "{girl}",
      "{game}",
      "{goat}"
     ],
     "en": "I like you!",
     "act": {
      "do": "find",
      "letter": "g"
     },
     "react": "소녀가 놀이판 말을 흔들어 보이고, 간식 바구니를 톡톡.",
     "leads": "hamsmell"
    },
    {
     "arrive": "read",
     "from": "hen",
     "show": [
      "[g]",
      "[h]",
      "{gum}",
      "{ham}"
     ],
     "en": "I like ham!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "g",
        "gum"
       ],
       [
        "h",
        "ham"
       ]
      ]
     },
     "react": "암탉이 꼬꼬 하며 햄 바구니를 염소 쪽으로 밀어 준다.",
     "leads": "oneround"
    },
    {
     "arrive": "write",
     "from": "iguana",
     "sign": "길게 끌린 꼬리 자국",
     "show": [
      "{hat}",
      "{bus}"
     ],
     "en": "Hi! I like you!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지 가장자리에 서리가 살짝. 버스가 경적.",
     "leads": "A05"
    }
   ],
   "guest": {
    "who": "goat",
    "enter": "염소가 모자를 쓰고(거꾸로) 방울을 딸랑이며 바위 위로 올라온다.",
    "turns": [
     {
      "show": "hen",
      "pick": [
       "g",
       "h"
      ],
      "ans": "h"
     },
     {
      "show": "cake",
      "pick": [
       "g",
       "c",
       "d"
      ],
      "ans": "c",
      "why": "/g/ 와 /k/ — 울림만 다른 두 소리를 가른다"
     },
     {
      "say": "I like you!",
      "cue": "염소가 모자를 벗어 아이 캐릭터에게 씌운다"
     }
    ],
    "bye": "방울을 한 번 크게 울리고 언덕 아래 버스 길을 턱으로 가리킨다."
   },
   "job": {
    "who": "girl",
    "ask": "놀이판의 빈 이름 칸을 손가락으로 톡톡 두드린다.",
    "write": [
     "g",
     "h"
    ],
    "gives": "놀이판에 아이 글씨 g·h(g 는 아랫줄까지). 염소 말·암탉 말이 새로 생기고, 다시 오면 놀이판에서 톡톡 듣기가 열린다."
   }
  },
  "A05": {
   "room": {
    "rig": "day",
    "weather": "cool",
    "accent": "--a-steel",
    "sound": "고드름 물방울 + 조용한 바람",
    "center": "그늘 속의 둥근 얼음집. 굴뚝에서 김, 작은 창으로 따뜻한 불빛",
    "props": {
     "igloo": [
      "center",
      "얼음집 — 누르면 창에 불이 깜박"
     ],
     "ink": [
      "Ld",
      "엎질러진 잉크병과 잉크 웅덩이"
     ],
     "insect": [
      "Lc",
      "폴짝 뛰는 무당벌레 무리 — 잉크 발자국을 찍고 다닌다"
     ],
     "iguana": [
      "Lb",
      "바위 위에서 지도를 그리는 이구아나"
     ],
     "jam": [
      "Rb",
      "얼음 선반 위 잼 병"
     ],
     "jet": [
      "skyR",
      "골짜기 위를 도는 종이 제트"
     ],
     "jug": [
      "Rd",
      "손잡이 달린 물병"
     ],
     "jump": [
      "Rc",
      "용수철 버섯 발판 — 누르면 내 캐릭터가 달려가 폴짝"
     ]
    },
    "extras": [
     "고드름",
     "펼쳐 놓은 지도(그림만)",
     "얼음 조각 징검돌"
    ],
    "life": [
     "얼음집 굴뚝 김",
     "잉크 발자국",
     "날아다니는 종이 제트",
     "폴짝 뛰는 벌레",
     "고드름 끝에서 떨어지는 물방울"
    ],
    "ink": {
     "at": "center",
     "on": "얼음집 문 위 문패",
     "lines": 1
    },
    "beat": "얼음 실로폰 소리 — 고드름이 박자에 반짝",
    "ride": "그늘을 벗어나자 바람이 세지고 하늘에 연 꼬리가 보인다 — 연 날리는 언덕으로"
   },
   "events": [
    {
     "id": "jamsmell",
     "name": "잼 냄새",
     "beat": 1,
     "game": "order",
     "who": "mina",
     "en": "Yum! Jam!",
     "scene": "얼음집 창으로 잼 냄새가 솔솔. 골짜기 친구들이 줄을 서서 그림으로 주문하고, 아이가 그 이름을 외친다.",
     "end": "굴뚝 김이 잼 빛으로 한 번 물든다."
    },
    {
     "id": "spill",
     "name": "엎질러진 잉크",
     "beat": 2,
     "game": "basket",
     "who": "ben",
     "en": "Oh! Ink!",
     "scene": "이구아나가 잉크를 엎질렀다. 벌레들이 발자국을 찍으며 물건을 여기저기 옮겨 놓는다 — 들린 낱말을 i 바구니·j 바구니에 가르면 제자리로.",
     "end": "발자국이 이어져 지도 위의 길이 된다."
    },
    {
     "id": "paperjet",
     "name": "종이 제트",
     "beat": 3,
     "game": "sjump",
     "who": "max",
     "en": "I see a jet!",
     "scene": "지도를 접어 종이 제트를 날린다. 들린 소리의 글자 쪽으로 몸을 기울이면 제트가 그쪽으로 돈다.",
     "end": "제트가 골짜기를 한 바퀴 돌아 얼음집 지붕에 내려앉는다. 다 같이 폴짝 — i·j 열매."
    },
    {
     "id": "bugmarch",
     "name": "벌레 행진",
     "beat": 0,
     "game": "wtrain",
     "who": "amy",
     "en": "I see it!",
     "scene": "벌레들이 잉크 발자국을 찍으며 줄지어 간다. 등마다 그림 — 이름을 부르면 등이 반짝.",
     "end": "벌레들이 폴짝폴짝 흩어진다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "iguana",
     "show": [
      "[i]",
      "{ink}",
      "{igloo}"
     ],
     "en": "I like it!",
     "act": {
      "do": "find",
      "letter": "i"
     },
     "react": "이구아나가 꼬리 끝으로 지도에 점 하나를 찍다가 — 잉크병이 흔들.",
     "leads": "spill"
    },
    {
     "arrive": "read",
     "from": "insect",
     "sign": "작은 발자국 여럿",
     "show": [
      "[i]",
      "[j]",
      "{insect}",
      "{jam}"
     ],
     "en": "I see a jug!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "i",
        "insect"
       ],
       [
        "j",
        "jam"
       ]
      ]
     },
     "react": "벌레들이 물병 손잡이에 조르르 올라앉아 하늘을 본다.",
     "leads": "paperjet"
    },
    {
     "arrive": "write",
     "from": "king",
     "sign": "왕관 그림자",
     "show": [
      "{jet}",
      "{bus}"
     ],
     "en": "Hi! I see a jet!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지가 바람에 한 번 뒤집힌다. 버스가 경적.",
     "leads": "A06"
    }
   ],
   "guest": {
    "who": "iguana",
    "enter": "이구아나가 지도를 둘둘 말아 겨드랑이에 끼고 바위에서 내려온다.",
    "turns": [
     {
      "show": "jug",
      "pick": [
       "i",
       "j"
      ],
      "ans": "j"
     },
     {
      "show": "egg",
      "pick": [
       "i",
       "e",
       "a"
      ],
      "ans": "e",
      "why": "짧은 모음 e·i — 가장 헷갈리는 두 소리. 입 벌린 크기로 가른다"
     },
     {
      "say": "I see a jet!",
      "cue": "종이 제트가 머리 위를 지나간다"
     }
    ],
    "bye": "지도를 펴서 다음 빈터 그림을 보여 주고 꼬리로 버스를 가리킨다."
   },
   "job": {
    "who": "iguana",
    "ask": "문패 없는 얼음집 문을 꼬리로 가리킨다.",
    "write": [
     "i",
     "j"
    ],
    "gives": "문패에 아이 글씨 i·j(점은 맨 나중 — 점 찍는 소리). 문이 열려 안쪽 잼 선반이 보이고, 다시 오면 얼음집 안에서 주문 받기가 열린다."
   }
  },
  "A06": {
   "room": {
    "rig": "day",
    "weather": "wind",
    "accent": "--a-red",
    "sound": "높은 바람 + 연줄 우는 소리",
    "center": "언덕 위 작은 성문(잠겨 있다). 문 옆 큰 바위 얼굴이 입술을 모아 바람을 후 분다",
    "props": {
     "kite": [
      "treeL",
      "나무에 걸린 빨간 연 — 꼬리가 바람에 나부낀다"
     ],
     "king": [
      "Ld",
      "발을 동동 구르는 작은 임금님"
     ],
     "key": [
      "Lb",
      "연줄에 매달려 반짝이는 열쇠"
     ],
     "kick": [
      "Lc",
      "공 하나 — 누르면 내 캐릭터가 달려가 뻥 찬다"
     ],
     "leg": [
      "me",
      "내 캐릭터의 다리 — 누르면 한 다리를 쭉 든다"
     ],
     "lip": [
      "center",
      "성문 옆 바위 얼굴의 입술 — 누르면 후 하고 바람"
     ],
     "lamp": [
      "Rb",
      "기둥에 달린 등 — 깜박인다"
     ],
     "lion": [
      "Rc",
      "갈기가 바람에 날리는 사자 — 긴 다리로 껑충"
     ]
    },
    "extras": [
     "성문",
     "연줄 얼레",
     "민들레 씨"
    ],
    "life": [
     "하늘의 연과 꼬리",
     "사자 갈기 바람",
     "깜박이는 등",
     "굴러가는 공",
     "바위 얼굴이 부는 바람에 민들레 씨가 날린다"
    ],
    "ink": {
     "at": "treeL",
     "on": "연 꼬리 리본 두 장",
     "lines": 1
    },
    "beat": "연줄 튕기는 소리 — 임금님 발 동동이 박자",
    "ride": "해가 기울고 길가에 반딧불이 하나둘 — 달빛 둥지로"
   },
   "events": [
    {
     "id": "stuck",
     "name": "나무에 걸린 연",
     "beat": 1,
     "game": "schant",
     "who": "max",
     "en": "Oh! Listen!",
     "scene": "연이 나무에 걸렸다. 임금님이 발을 동동 — 그 발소리가 박자가 되고 Max 가 받아 챈트를 시작한다.",
     "end": "연 꼬리가 한 뼘 풀려 내려온다."
    },
    {
     "id": "keyjump",
     "name": "연줄의 열쇠",
     "beat": 2,
     "game": "lfruit",
     "who": "amy",
     "en": "I see a key!",
     "scene": "열쇠가 연줄 높이 매달려 있다. 글자를 보고 그 소리를 고를 때마다 사자가 한 번씩 더 높이 껑충.",
     "end": "사자가 열쇠를 물어 임금님 손에 놓는다."
    },
    {
     "id": "lanterns",
     "name": "등불 행렬",
     "beat": 3,
     "game": "wtrain",
     "who": "mina",
     "en": "I see a kite!",
     "scene": "해가 기울며 등불이 줄지어 지나간다. 등마다 그림 — 이름을 부르면 불이 켜진다. 마지막에 공을 뻥.",
     "end": "공에 맞은 연이 풀려 하늘로 오른다. 성문 위에 등불 — k·l 열매."
    },
    {
     "id": "puff",
     "name": "바위 얼굴의 바람",
     "beat": 0,
     "game": "pop",
     "who": "ben",
     "en": "Wow!",
     "scene": "바위 얼굴이 후 불면 민들레 씨가 날린다. 씨마다 그림 — 들린 이름의 씨를 톡.",
     "end": "씨들이 언덕 너머로 날아간다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "king",
     "show": [
      "[k]",
      "{king}",
      "{key}",
      "{kite}"
     ],
     "en": "I see a kite!",
     "act": {
      "do": "say",
      "line": "I see a kite!",
      "tap": "kite"
     },
     "react": "임금님이 왕관을 고쳐 쓰고 연줄에 매달린 열쇠를 가리킨다.",
     "leads": "keyjump"
    },
    {
     "arrive": "read",
     "from": "lion",
     "show": [
      "[k]",
      "[l]",
      "{kick}",
      "{lamp}"
     ],
     "en": "I see a lion!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "k",
        "kick"
       ],
       [
        "l",
        "lamp"
       ]
      ]
     },
     "react": "사자가 앞발로 공을 굴려 아이 캐릭터 앞에 놓는다.",
     "leads": "lanterns"
    },
    {
     "arrive": "write",
     "from": "mom",
     "sign": "깃털 하나",
     "show": [
      "{lamp}",
      "{bus}"
     ],
     "en": "Hi! I see a lamp!",
     "act": {
      "do": "ride"
     },
     "react": "깃털이 쪽지에서 떠올라 길 쪽으로 날아간다. 버스가 경적.",
     "leads": "A07"
    }
   ],
   "guest": {
    "who": "king",
    "enter": "임금님이 열쇠를 목에 걸고 망토를 끌며 걸어 나온다.",
    "turns": [
     {
      "show": "lamp",
      "pick": [
       "k",
       "l"
      ],
      "ans": "l"
     },
     {
      "show": "cup",
      "pick": [
       "l",
       "c",
       "d"
      ],
      "ans": "c",
      "also": [
       "k"
      ],
      "why": "c 와 k 는 같은 소리 — 두 열매가 한 가지에 쌍둥이로 달려 나오고 어느 쪽을 골라도 받는다"
     },
     {
      "say": "I see a kite!",
      "cue": "연이 하늘 높이 떠 있다"
     }
    ],
    "bye": "열쇠로 성문을 열어 보인다 — 문 너머로 버스 길."
   },
   "job": {
    "who": "king",
    "ask": "연 꼬리에 달 빈 리본 두 장을 내민다.",
    "write": [
     "k",
     "l"
    ],
    "gives": "아이 글씨 k·l 리본이 연 꼬리에 달려 하늘에서 펄럭인다. 성문 위 등이 켜진다."
   }
  },
  "A07": {
   "room": {
    "rig": "evening",
    "weather": "moon",
    "accent": "--a-plum",
    "sound": "귀뚜라미 + 멀리 부엉이",
    "center": "달맞이 바위 — 엄마 새가 앉아 사방을 둘러본다. 오른쪽 나무는 도토리나무(높은 가지에 둥지)",
    "props": {
     "mom": [
      "center",
      "달맞이 바위 위의 엄마 새"
     ],
     "map": [
      "Ld",
      "그루터기에 펼쳐 놓은 지도(그림 지도)"
     ],
     "milk": [
      "Lc",
      "우유병과 작은 잔"
     ],
     "moon": [
      "skyL",
      "조금씩 차오르는 달"
     ],
     "net": [
      "Rd",
      "나무 사이에 걸린 그물 — 바람에 흔들린다"
     ],
     "nut": [
      "Rc",
      "그물에 걸린 도토리들"
     ],
     "nose": [
      "me",
      "내 캐릭터의 코 — 누르면 코를 찡긋"
     ],
     "nest": [
      "treeR",
      "도토리나무 가지의 둥지 — 아기 새 셋이 고개를 내민다"
     ]
    },
    "extras": [
     "반딧불",
     "도토리 깍지",
     "달빛 그림자"
    ],
    "life": [
     "차오르는 달",
     "반딧불",
     "둥지의 아기 새",
     "바람에 흔들리는 그물",
     "달빛에 길어지는 나무 그림자"
    ],
    "ink": {
     "at": "treeR",
     "on": "둥지 아래 줄기에 거는 이름표",
     "lines": 1
    },
    "beat": "귀뚜라미 소리 — 반딧불이 박자에 깜박",
    "ride": "밤이 지나 아침, 길가에 물웅덩이와 보글보글 소리 — 문어 연못으로"
   },
   "events": [
    {
     "id": "moonrise",
     "name": "달이 뜬다",
     "beat": 1,
     "game": "pop",
     "who": "mina",
     "en": "Oh! Moon!",
     "scene": "반딧불이 하나둘 켜지며 그림을 비춘다. 들린 이름의 반딧불을 톡.",
     "end": "달이 한 칸 차오르고 엄마 새가 날개를 편다."
    },
    {
     "id": "openmap",
     "name": "지도 펴기",
     "beat": 2,
     "game": "basket",
     "who": "amy",
     "en": "I see a map!",
     "scene": "지도 여기저기가 비어 있다. 들린 낱말을 m 바구니·n 바구니에 가를 때마다 지도 조각이 채워지고 둥지 가는 길이 이어진다.",
     "end": "길 끝에 도토리나무 그림이 나타난다."
    },
    {
     "id": "nuts",
     "name": "그물에 걸린 도토리",
     "beat": 3,
     "game": "dict",
     "who": "max",
     "en": "I like you, mom!",
     "scene": "도토리가 그물에 걸려 있다. 도토리마다 그림 딱지 — 그림 옆에 첫 글자를 써넣으면 도토리가 풀려 굴러 내려온다.",
     "end": "엄마 새가 둥지로 날아오른다. 둥지에 우유 한 잔 — m·n 열매."
    },
    {
     "id": "glowway",
     "name": "반딧불 길",
     "beat": 0,
     "game": "sjump",
     "who": "ben",
     "en": "Listen!",
     "scene": "반딧불이 두 갈래 길을 만든다. 들린 소리의 글자 쪽으로 몸을 기울이면 그쪽 길이 환해진다.",
     "end": "반딧불이 둥지 둘레에 모여 등불이 된다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "mom",
     "sign": "깃털 하나",
     "show": [
      "[m]",
      "{moon}",
      "{map}",
      "{milk}"
     ],
     "en": "I like milk!",
     "act": {
      "do": "find",
      "letter": "m"
     },
     "react": "엄마 새가 날개 끝으로 지도를 톡톡 친다.",
     "leads": "openmap"
    },
    {
     "arrive": "read",
     "from": "nest",
     "sign": "아기 새 발자국 셋",
     "show": [
      "[m]",
      "[n]",
      "{mom}",
      "{nest}"
     ],
     "en": "I like you, mom!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "m",
        "mom"
       ],
       [
        "n",
        "nest"
       ]
      ]
     },
     "react": "아기 새들이 짹짹거리며 그물 쪽으로 고개를 내민다.",
     "leads": "nuts"
    },
    {
     "arrive": "write",
     "from": "octopus",
     "sign": "빨판 자국 여덟",
     "show": [
      "{nut}",
      "{bus}"
     ],
     "en": "Hi! I see a nut!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지에서 물방울이 뚝. 버스가 경적.",
     "leads": "A08"
    }
   ],
   "guest": {
    "who": "mom",
    "enter": "엄마 새가 달맞이 바위에서 내려와 아이 캐릭터 앞에 사뿐히 앉는다.",
    "turns": [
     {
      "show": "nut",
      "pick": [
       "m",
       "n"
      ],
      "ans": "n"
     },
     {
      "show": "hand",
      "pick": [
       "n",
       "h",
       "m"
      ],
      "ans": "h",
      "why": "h·n — 막대 길이만 다른 두 글자"
     },
     {
      "say": "I like you, mom!",
      "cue": "엄마 새가 날개로 아기 새들을 감싼다"
     }
    ],
    "bye": "부리로 코를 살짝 부비고 날개로 버스 길을 가리킨다."
   },
   "job": {
    "who": "nest",
    "ask": "아기 새들이 이름표 없는 둥지에서 고개를 내밀고 줄기를 내려다본다.",
    "write": [
     "m",
     "n"
    ],
    "gives": "이름표에 아이 글씨 m·n(m 은 언덕 둘, n 은 언덕 하나). 둥지에 작은 등이 달려 밤에도 둥지가 보인다."
   }
  },
  "A08": {
   "room": {
    "rig": "day",
    "weather": "clear",
    "accent": "--a-fish",
    "sound": "보글보글 + 물장구",
    "center": "둥근 연못 한가운데 문어. 다리 여덟으로 냄비 여덟 개를 돌린다",
    "props": {
     "octopus": [
      "center",
      "연못의 문어 — 누르면 다리 하나로 인사"
     ],
     "ox": [
      "La",
      "수레를 맨 황소"
     ],
     "olive": [
      "Lc",
      "올리브가 가득한 바구니"
     ],
     "otter": [
      "Lb",
      "물가에서 배를 내놓고 물장구치는 수달"
     ],
     "pig": [
      "Rd",
      "줄을 선 돼지"
     ],
     "pen": [
      "Rb",
      "통나무 계산대 위의 큰 깃펜"
     ],
     "pot": [
      "Rc",
      "뭍에 올라온 냄비 하나 — 김이 오른다"
     ],
     "panda": [
      "Ra",
      "대나무를 씹는 판다"
     ]
    },
    "extras": [
     "수레",
     "대나무 몇 그루",
     "연못가 작은 식탁(부탁 뒤에 생긴다)"
    ],
    "life": [
     "문어 다리 여덟",
     "물장구치는 수달",
     "냄비 김",
     "대나무 씹는 판다",
     "연못 위로 번지는 물 동그라미"
    ],
    "ink": {
     "at": "Rc",
     "on": "냄비 뚜껑 손잡이의 이름표",
     "lines": 1
    },
    "beat": "냄비 뚜껑 달그락 — 냄비 여덟이 박자에 차례로 들썩",
    "ride": "하늘이 흐려지고 빗방울이 버스 지붕을 톡톡 — 비 오는 여왕의 뜰로"
   },
   "events": [
    {
     "id": "kitchen",
     "name": "문어 주방",
     "beat": 1,
     "game": "order",
     "who": "mina",
     "en": "Hi! Listen!",
     "scene": "문어는 냄비 여덟을 돌리느라 주문을 못 받는다. 손님이 그림으로 주문하면 아이가 그 이름을 대신 외친다.",
     "end": "냄비 하나가 뭍으로 올라온다."
    },
    {
     "id": "plop",
     "name": "올리브 퐁당",
     "beat": 2,
     "game": "magic",
     "who": "ben",
     "en": "I see the pig!",
     "scene": "수달이 올리브를 던질 채비. 아이가 p 낱말을 부르면(pig·pen·pot·panda) 그 친구 앞 냄비에 올리브가 퐁당.",
     "end": "냄비마다 김이 오르고 돼지와 판다가 줄을 선다."
    },
    {
     "id": "loadcart",
     "name": "잔치 짐 싣기",
     "beat": 3,
     "game": "dict",
     "who": "max",
     "en": "I see the pot!",
     "scene": "황소 수레에 실을 상자마다 그림 딱지. 그림 옆에 첫 글자를 써넣으면 상자가 수레에 척 실린다.",
     "end": "수레가 가득 — 황소가 음매 대신 고개를 끄덕. o·p 열매."
    },
    {
     "id": "inkdrops",
     "name": "먹물 방울",
     "beat": 0,
     "game": "pop",
     "who": "amy",
     "en": "Wow!",
     "scene": "문어가 장난으로 먹물 방울을 뿜는다. 방울마다 그림 — 들린 이름의 방울을 톡.",
     "end": "문어가 멋쩍게 다리로 머리를 긁는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "otter",
     "show": [
      "[o]",
      "{otter}",
      "{olive}",
      "{ox}"
     ],
     "en": "I like it!",
     "act": {
      "do": "find",
      "letter": "o"
     },
     "react": "수달이 배 위에 올리브를 올려놓고 둥둥 뜬다.",
     "leads": "plop"
    },
    {
     "arrive": "read",
     "from": "panda",
     "show": [
      "[o]",
      "[p]",
      "{octopus}",
      "{pot}"
     ],
     "en": "I see the pig!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "o",
        "octopus"
       ],
       [
        "p",
        "pot"
       ]
      ]
     },
     "react": "판다가 대나무 젓가락을 딱딱 치고 수레 쪽을 본다.",
     "leads": "loadcart"
    },
    {
     "arrive": "write",
     "from": "queen",
     "sign": "왕관과 빗방울",
     "show": [
      "{pot}",
      "{bus}"
     ],
     "en": "Hi! I see the pot!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지에 빗방울 무늬가 번진다. 버스가 경적.",
     "leads": "A09"
    }
   ],
   "guest": {
    "who": "octopus",
    "enter": "문어가 냄비를 내려놓고 연못가로 스르르 올라와 다리 둘로 팔짱을 낀다.",
    "turns": [
     {
      "show": "pen",
      "pick": [
       "o",
       "p"
      ],
      "ans": "p"
     },
     {
      "show": "bag",
      "pick": [
       "p",
       "b",
       "d"
      ],
      "ans": "b",
      "why": "b·d·p — 막대와 배의 자리가 다른 세 글자"
     },
     {
      "say": "I like the panda!",
      "cue": "판다가 문어에게 대나무 한 줄기를 건넨다"
     }
    ],
    "bye": "다리 여덟으로 한꺼번에 손을 흔든다 — 수레 뒤로 버스 길."
   },
   "job": {
    "who": "octopus",
    "ask": "이름표 없는 냄비 뚜껑을 다리 하나로 들어 보인다.",
    "write": [
     "o",
     "p"
    ],
    "gives": "뚜껑 이름표에 아이 글씨 o·p(p 는 땅속으로). 뚜껑이 들썩이며 김이 오르고 연못가에 작은 식탁이 차려진다."
   }
  },
  "A09": {
   "room": {
    "rig": "afternoon",
    "weather": "rain",
    "accent": "--a-plum",
    "sound": "빗소리 + 처마 물방울",
    "center": "지붕 있는 작은 정자. 여왕이 누비이불을 쓰고 앉아 있다",
    "props": {
     "queen": [
      "center",
      "정자 안의 여왕 — 누비이불을 망토처럼 썼다"
     ],
     "quilt": [
      "Ld",
      "난간에 걸쳐 둔 누비이불 한 채 — 끝에서 물이 똑똑"
     ],
     "quiz": [
      "Lc",
      "수수께끼 판 — 덮개 셋(그림을 가리고 있다)"
     ],
     "quack": [
      "Lb",
      "웅덩이의 오리 — 누르면 꽥, 소리 무늬가 퍼진다"
     ],
     "red": [
      "Rb",
      "빨간 장화 한 켤레"
     ],
     "rain": [
      "skyR",
      "빗줄기와 물웅덩이"
     ],
     "ring": [
      "Rd",
      "방석 위 반지"
     ],
     "robot": [
      "Rc",
      "삐걱거리며 걷는 깡통 로봇"
     ]
    },
    "extras": [
     "정자 처마 풍경(부탁 뒤)",
     "물웅덩이 셋",
     "비 그친 뒤의 무지개"
    ],
    "life": [
     "빗방울과 물웅덩이",
     "꽥꽥 오리",
     "삐걱 로봇",
     "이불 끝에서 떨어지는 물",
     "처마에서 줄지어 떨어지는 물방울"
    ],
    "ink": {
     "at": "Lc",
     "on": "수수께끼 판의 답 칸",
     "lines": 1
    },
    "beat": "빗방울이 정자 지붕을 두드리는 소리 — 웅덩이가 박자에 퐁",
    "ride": "비가 그치고 나무 사이로 짠 바람, 멀리 파도 소리 — 바닷가 천막으로"
   },
   "events": [
    {
     "id": "rainbeat",
     "name": "빗소리 박자",
     "beat": 1,
     "game": "schant",
     "who": "max",
     "en": "Oh! Rain! Listen!",
     "scene": "빗방울이 정자 지붕을 두드린다. 그 소리가 박자 — Max 가 받아 발을 구르고 웅덩이가 박자마다 퐁.",
     "end": "웅덩이에 동그라미가 겹겹이 번진다."
    },
    {
     "id": "riddle",
     "name": "여왕의 수수께끼",
     "beat": 2,
     "game": "lfruit",
     "who": "amy",
     "en": "Quack! Quack!",
     "scene": "여왕이 판의 덮개를 하나씩 연다. 글자가 나오면 그 소리를 고른다 — 맞히면 오리가 꽥.",
     "end": "덮개 셋이 다 열리고 여왕이 손뼉을 친다."
    },
    {
     "id": "ringwalk",
     "name": "로봇의 반지 배달",
     "beat": 3,
     "game": "sjump",
     "who": "ben",
     "en": "I see the queen!",
     "scene": "로봇이 빨간 반지를 들고 오다 갈림길마다 삐걱 멈춘다. 들린 소리의 글자 쪽으로 몸을 기울이면 그쪽으로 걷는다.",
     "end": "반지가 여왕 손에. 비가 그치고 무지개 — q·r 열매(q 는 u 와 붙어서)."
    },
    {
     "id": "leafboats",
     "name": "웅덩이 배",
     "beat": 0,
     "game": "wtrain",
     "who": "mina",
     "en": "I like rain!",
     "scene": "나뭇잎 배가 웅덩이 물길을 따라 줄줄이 흐른다. 배마다 그림 — 이름을 부르면 돛에 불.",
     "end": "배들이 정자 아래에 나란히 닿는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "queen",
     "show": [
      "[q]",
      "{queen}",
      "{quilt}"
     ],
     "en": "I see the queen!",
     "act": {
      "do": "say",
      "line": "I see the queen!",
      "tap": "queen"
     },
     "react": "여왕이 이불 한 자락을 들어 자리를 내주고 수수께끼 판을 톡톡.",
     "leads": "riddle",
     "note": "글자 칸의 q 는 u 와 붙은 열매(qu)로 그린다"
    },
    {
     "arrive": "read",
     "from": "robot",
     "show": [
      "[q]",
      "[r]",
      "{quack}",
      "{ring}"
     ],
     "en": "I like red!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "q",
        "quack"
       ],
       [
        "r",
        "ring"
       ]
      ]
     },
     "react": "로봇 가슴의 등이 빨갛게 깜박이고 반지 방석 쪽으로 삐걱.",
     "leads": "ringwalk"
    },
    {
     "arrive": "write",
     "from": "tiger",
     "sign": "줄무늬 꼬리 끝",
     "show": [
      "{rain}",
      "{bus}"
     ],
     "en": "Hi! I like rain!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지의 빗방울 무늬가 걷히고 환해진다. 버스가 경적.",
     "leads": "A10"
    }
   ],
   "guest": {
    "who": "queen",
    "enter": "여왕이 이불을 벗어 접고 반지 낀 손을 들어 보이며 정자에서 내려온다.",
    "turns": [
     {
      "show": "robot",
      "pick": [
       "q",
       "r"
      ],
      "ans": "r"
     },
     {
      "show": "pig",
      "pick": [
       "q",
       "p",
       "d"
      ],
      "ans": "p",
      "why": "p·q — 아랫줄로 내려가는 막대가 왼쪽인지 오른쪽인지"
     },
     {
      "say": "I like red!",
      "cue": "여왕이 빨간 반지를 햇빛에 비춘다"
     }
    ],
    "bye": "반지로 무지개를 가리킨다 — 무지개 끝에 버스."
   },
   "job": {
    "who": "queen",
    "ask": "수수께끼 판의 빈 답 칸을 부채 끝으로 가리킨다.",
    "write": [
     "q",
     "r"
    ],
    "gives": "답 칸에 아이 글씨 q·r. 덮개 그림이 열려 다시 오면 판에서 톡톡 듣기가 열리고, 정자 처마에 풍경이 달린다."
   }
  },
  "A10": {
   "room": {
    "rig": "day",
    "weather": "glow",
    "accent": "--a-gold",
    "sound": "파도 + 천막 펄럭",
    "center": "모래밭의 줄무늬 천막. 뒤로 바다 — 숲이 여기서 끝난다",
    "props": {
     "sun": [
      "skyL",
      "쨍한 해"
     ],
     "sock": [
      "Lc",
      "빨랫줄에 널린 양말"
     ],
     "six": [
      "with:sock",
      "양말은 모두 여섯 짝 — 누르면 하나씩 까딱이며 여섯까지"
     ],
     "sea": [
      "back",
      "뒤 배경의 바다 — 파도가 밀려왔다 간다"
     ],
     "ten": [
      "with:tent",
      "천막 줄의 깃발 열 장 — 누르면 차례로 펄럭"
     ],
     "top": [
      "Rd",
      "모래 위에서 도는 팽이"
     ],
     "tent": [
      "center",
      "줄무늬 천막 — 입구가 묶여 있다"
     ],
     "tiger": [
      "Rc",
      "양말을 너는 호랑이"
     ]
    },
    "extras": [
     "조개",
     "모래성",
     "해먹(부탁 뒤 천막 안에)"
    ],
    "life": [
     "파도",
     "빨랫줄의 양말",
     "도는 팽이",
     "천막 깃발",
     "모래 위를 옆걸음하는 작은 게"
    ],
    "ink": {
     "at": "center",
     "on": "천막 꼭대기에 다는 깃발 두 장",
     "lines": 1
    },
    "beat": "조개 캐스터네츠 — 파도가 박자에 밀려온다",
    "ride": "바닷가를 따라 달리다 바람에 우산 하나가 둥실 — 우산 골짜기로"
   },
   "events": [
    {
     "id": "tide",
     "name": "파도가 가져온 것",
     "beat": 1,
     "game": "pop",
     "who": "mina",
     "en": "Oh! Listen!",
     "scene": "파도가 밀려왔다 가면 모래 위에 조개가 남는다. 조개마다 그림 — 들린 이름의 조개를 톡.",
     "end": "조개들이 천막 앞에 한 줄로 놓인다."
    },
    {
     "id": "laundry",
     "name": "양말 널기",
     "beat": 2,
     "game": "basket",
     "who": "ben",
     "en": "I see a sock!",
     "scene": "호랑이가 양말을 널다가 뒤죽박죽. 양말마다 그림 — 들린 낱말을 s 빨래 바구니·t 빨래 바구니에 가른다.",
     "end": "빨랫줄에 양말 여섯 짝이 나란히."
    },
    {
     "id": "flags",
     "name": "깃발 열 장",
     "beat": 3,
     "game": "wtrain",
     "who": "max",
     "en": "I see the sun!",
     "scene": "깃발이 줄에 실려 줄줄이 천막으로 온다. 깃발마다 그림 — 이름을 부르면 깃발에 색이 든다.",
     "end": "깃발 열 장이 다 걸리고 해가 쨍 — s·t 열매."
    },
    {
     "id": "spin",
     "name": "팽이 길",
     "beat": 0,
     "game": "sjump",
     "who": "amy",
     "en": "Listen!",
     "scene": "팽이가 모래 위 두 갈래 길 앞에서 돈다. 들린 소리의 글자 쪽으로 몸을 기울이면 팽이가 그쪽으로 간다.",
     "end": "팽이가 모래에 동그란 무늬를 남긴다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "tiger",
     "show": [
      "[s]",
      "{sun}",
      "{sock}",
      "{sea}"
     ],
     "en": "I like the sea!",
     "act": {
      "do": "find",
      "letter": "s"
     },
     "react": "호랑이가 꼬리로 모래에 파도 줄을 긋다가 빨래 바구니를 엎는다.",
     "leads": "laundry"
    },
    {
     "arrive": "read",
     "from": "Ben",
     "show": [
      "[s]",
      "[t]",
      "{six}",
      "{ten}"
     ],
     "en": "I see a tent!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "s",
        "six"
       ],
       [
        "t",
        "ten"
       ]
      ]
     },
     "react": "Ben 이 팽이를 손바닥에 올려 돌리며 천막 줄을 가리킨다.",
     "leads": "flags",
     "note": "그림은 양말 여섯 짝·깃발 열 장"
    },
    {
     "arrive": "write",
     "from": "uncle",
     "sign": "우산 그림자",
     "show": [
      "{top}",
      "{bus}"
     ],
     "en": "Hi! I see the sun!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지가 우산처럼 둥실 떴다 내려앉는다. 버스가 경적.",
     "leads": "A11"
    }
   ],
   "guest": {
    "who": "tiger",
    "enter": "호랑이가 빨래 바구니를 내려놓고 앞발의 모래를 털며 온다.",
    "turns": [
     {
      "show": "tent",
      "pick": [
       "s",
       "t"
      ],
      "ans": "t"
     },
     {
      "show": "fish",
      "pick": [
       "s",
       "f",
       "t"
      ],
      "ans": "f",
      "why": "/s/ 와 /f/ — 바람 소리 둘을 가른다. t·f 는 모양도 가깝다"
     },
     {
      "say": "I like the sea!",
      "cue": "파도가 발끝까지 밀려온다"
     }
    ],
    "bye": "꼬리로 바닷가 길을 가리키고 양말 한 짝을 흔들어 인사."
   },
   "job": {
    "who": "tiger",
    "ask": "무늬 없는 깃발 두 장을 앞발로 내민다.",
    "write": [
     "s",
     "t"
    ],
    "gives": "아이 글씨 s·t 깃발이 천막 꼭대기에(s 는 유령 글씨를 가장 오래). 묶였던 입구가 걷혀 안의 해먹이 보인다."
   }
  },
  "A11": {
   "room": {
    "rig": "day",
    "weather": "cloud",
    "accent": "--a-steel",
    "sound": "부드러운 바람 + 멀리 바이올린 한 음",
    "center": "큰 우산 나무 — 가지마다 우산이 열매처럼 달려 있고 바람에 하나씩 떠오른다",
    "props": {
     "umbrella": [
      "center",
      "우산 나무의 큰 우산 — 누르면 활짝 펴진다"
     ],
     "up": [
      "skyL",
      "위로 떠오르는 작은 우산 — 누르면 내 캐릭터가 두 팔을 위로"
     ],
     "uncle": [
      "Ld",
      "수염 난 삼촌(조끼 차림)"
     ],
     "under": [
      "Lc",
      "펼친 우산 아래에 웅크린 고양이"
     ],
     "van": [
      "Rc",
      "덜컹거리는 승합차"
     ],
     "vet": [
      "Rd",
      "청진기를 목에 건 수의사"
     ],
     "vest": [
      "Rb",
      "옷걸이에 걸린 여벌 조끼"
     ],
     "violin": [
      "with:vet",
      "수의사가 켜는 바이올린 — 누르면 한 음"
     ]
    },
    "extras": [
     "옷걸이",
     "악기 가방",
     "우산꽂이(부탁 뒤 승합차 지붕에)"
    ],
    "life": [
     "떠오르는 우산",
     "덜컹 승합차",
     "바이올린 활",
     "우산 아래 고양이",
     "구름 그림자가 골짜기를 천천히 지나간다"
    ],
    "ink": {
     "at": "Rc",
     "on": "승합차 옆면",
     "lines": 1
    },
    "beat": "우산 펴지는 소리(펑) — 우산이 박자마다 한 뼘씩 뜬다",
    "ride": "골짜기 끝에 개울, 풀잎마다 이슬 — 거미줄 다리로"
   },
   "events": [
    {
     "id": "floatup",
     "name": "둥실 우산",
     "beat": 1,
     "game": "schant",
     "who": "max",
     "en": "Oh! Up! Up!",
     "scene": "우산들이 바람에 떠오른다. Max 가 발을 구르는 박자마다 우산이 한 뼘씩 — 챈트.",
     "end": "우산 하나가 나무 꼭대기에 걸린다."
    },
    {
     "id": "vanopen",
     "name": "삼촌의 승합차",
     "beat": 2,
     "game": "magic",
     "who": "mina",
     "en": "I see a van!",
     "scene": "승합차 뒷문이 열린다. 아이가 v 낱말을 부르면(van·vet·vest·violin) 그것이 반짝이거나 소리를 낸다.",
     "end": "수의사가 바이올린 줄을 고른다."
    },
    {
     "id": "fiddle",
     "name": "바이올린 춤",
     "beat": 3,
     "game": "sjump",
     "who": "ben",
     "en": "I like it!",
     "scene": "수의사가 바이올린을 켠다. 들린 소리의 글자 쪽으로 몸을 기울이면 그쪽에 우산이 활짝 펴진다.",
     "end": "모두 우산 아래로 모인다. 우산이 위로, 위로 — u·v 열매."
    },
    {
     "id": "pinwheel",
     "name": "뱅글 우산",
     "beat": 0,
     "game": "pop",
     "who": "amy",
     "en": "Wow!",
     "scene": "우산이 팽이처럼 뱅글 돈다. 우산 무늬마다 그림 — 들린 이름의 우산을 톡.",
     "end": "우산들이 접히며 나무로 돌아간다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "uncle",
     "show": [
      "[u]",
      "{umbrella}",
      "{uncle}",
      "{up}"
     ],
     "en": "I like it!",
     "act": {
      "do": "find",
      "letter": "u"
     },
     "react": "삼촌이 조끼 주머니에서 열쇠를 꺼내 승합차 쪽으로 흔든다.",
     "leads": "vanopen"
    },
    {
     "arrive": "read",
     "from": "vet",
     "show": [
      "[u]",
      "[v]",
      "{under}",
      "{violin}"
     ],
     "en": "I see the vet!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "u",
        "under"
       ],
       [
        "v",
        "violin"
       ]
      ]
     },
     "react": "수의사가 활로 인사하고 한 소절을 켠다.",
     "leads": "fiddle",
     "note": "under 는 그림(우산 아래 고양이)으로만 — 문장에 넣지 않는다"
    },
    {
     "arrive": "write",
     "from": "wolf",
     "sign": "발자국과 가발 그림자",
     "show": [
      "{van}",
      "{bus}"
     ],
     "en": "Hi! I see a van!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지에 이슬이 맺힌다. 버스가 경적.",
     "leads": "A12"
    }
   ],
   "guest": {
    "who": "uncle",
    "enter": "삼촌이 조끼 단추를 채우고 우산을 지팡이처럼 짚으며 온다.",
    "turns": [
     {
      "show": "vest",
      "pick": [
       "u",
       "v"
      ],
      "ans": "v"
     },
     {
      "show": "ox",
      "pick": [
       "u",
       "o",
       "a"
      ],
      "ans": "o",
      "why": "짧은 모음 o·u·a — 입 모양(동그랗게·편하게·옆으로)으로 가른다"
     },
     {
      "say": "I see a van!",
      "cue": "승합차가 덜컹 하며 문을 연다"
     }
    ],
    "bye": "우산을 펴서 둥실 떠올랐다 내려오며 버스 길을 가리킨다."
   },
   "job": {
    "who": "uncle",
    "ask": "승합차의 민 옆면을 손바닥으로 톡톡 친다.",
    "write": [
     "u",
     "v"
    ],
    "gives": "옆면에 아이 글씨 u·v. 지붕에 우산꽂이가 생기고, 다시 오면 승합차 뒷문이 열려 톡톡 듣기가 열린다."
   }
  },
  "A12": {
   "room": {
    "rig": "morning",
    "weather": "dew",
    "accent": "--a-cream",
    "sound": "개울 물소리 + 이슬 떨어지는 소리",
    "center": "개울 위에 놓인 거미줄 다리 — 이슬이 줄줄이 맺혀 반짝인다. 건너편(오른쪽)에 상자",
    "props": {
     "web": [
      "center",
      "거미줄 다리 — 누르면 이슬이 또르르"
     ],
     "wig": [
      "with:wolf",
      "늑대가 쓴 곱슬 가발 — 누르면 들썩"
     ],
     "wolf": [
      "Ld",
      "가발을 쓰고 지나가는 늑대"
     ],
     "water": [
      "Lb",
      "바위틈 샘물 — 물동이로 졸졸"
     ],
     "box": [
      "Rc",
      "열렸다 닫히는 상자"
     ],
     "fox": [
      "Rd",
      "상자를 여는 여우"
     ],
     "six": [
      "Rb",
      "상자에서 나온 구슬 여섯 알"
     ],
     "ax": [
      "Ra",
      "그루터기 위 둥근 나무 도끼"
     ]
    },
    "extras": [
     "물동이",
     "징검돌",
     "다리 난간 등(부탁 뒤)"
    ],
    "life": [
     "이슬 맺힌 거미줄",
     "개울 물",
     "가발 쓴 늑대",
     "열렸다 닫히는 상자",
     "풀잎 끝에서 떨어지는 이슬"
    ],
    "ink": {
     "at": "Rc",
     "on": "상자 뚜껑의 딱지",
     "lines": 1
    },
    "beat": "이슬 방울 소리 — 거미줄이 박자에 떨린다",
    "ride": "숲이 성기어지고 길 끝에 노란빛 — 노란 동물원 문으로"
   },
   "events": [
    {
     "id": "dewdrops",
     "name": "이슬 방울",
     "beat": 1,
     "game": "pop",
     "who": "mina",
     "en": "I see a web!",
     "scene": "거미줄 이슬마다 그림이 비친다. 들린 이름의 이슬을 톡.",
     "end": "거미줄이 반짝이며 건널 수 있는 다리가 된다."
    },
    {
     "id": "endsound",
     "name": "끝에 숨은 소리",
     "beat": 2,
     "game": "basket",
     "who": "amy",
     "en": "Oh! Box! Fox!",
     "scene": "여우가 상자를 열 때마다 물건이 튀어나온다. w 낱말은 첫소리 바구니에, x 낱말은 끝소리 바구니(상자 모양)에.",
     "end": "상자 속이 가지런해지고 여우가 뚜껑을 탁."
    },
    {
     "id": "xfriends",
     "name": "다리 건너는 친구들",
     "beat": 3,
     "game": "wtrain",
     "who": "max",
     "en": "I see a fox!",
     "scene": "w 친구들과 x 친구들이 줄지어 다리를 건넌다. 이름을 부르면 발밑 이슬이 반짝.",
     "end": "모두 건너편에 닿는다 — w·x 열매."
    },
    {
     "id": "wiggone",
     "name": "날아간 가발",
     "beat": 0,
     "game": "sjump",
     "who": "ben",
     "en": "Oh! Wig!",
     "scene": "늑대의 가발이 바람에 날아간다. 들린 소리의 글자 쪽으로 몸을 기울이면 가발이 그쪽으로.",
     "end": "가발이 늑대 머리에 다시 — 조금 비뚤게."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "wolf",
     "show": [
      "[w]",
      "{wolf}",
      "{wig}",
      "{web}"
     ],
     "en": "I see a web!",
     "act": {
      "do": "say",
      "line": "I see a web!",
      "tap": "web"
     },
     "react": "늑대가 가발을 벗어 인사하고 건너편 상자를 가리킨다.",
     "leads": "endsound"
    },
    {
     "arrive": "read",
     "from": "fox",
     "show": [
      "{fox}",
      "{box}",
      "{six}",
      "[x]"
     ],
     "en": "I see a fox!",
     "act": {
      "do": "find",
      "letter": "x",
      "pos": "end"
     },
     "react": "여우가 상자 뚜껑을 탁 닫고 다리 쪽으로 손짓.",
     "leads": "xfriends",
     "note": "글자 칸 x 는 그림들 뒤에 — 끝소리"
    },
    {
     "arrive": "write",
     "from": "zebra",
     "sign": "줄무늬와 지퍼",
     "show": [
      "{box}",
      "{bus}"
     ],
     "en": "Hi! I like water!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지 가장자리가 노랗게 물든다. 버스가 경적.",
     "leads": "A13"
    }
   ],
   "guest": {
    "who": "wolf",
    "enter": "늑대가 가발을 매만지고 다리 한가운데에 서서 고개를 까딱.",
    "turns": [
     {
      "show": "box",
      "pick": [
       "w",
       "x"
      ],
      "ans": "x",
      "pos": "end"
     },
     {
      "show": "van",
      "pick": [
       "w",
       "v",
       "u"
      ],
      "ans": "v",
      "why": "/v/ 와 /w/ — 윗니가 입술에 닿는지"
     },
     {
      "say": "I like water!",
      "cue": "늑대가 샘물을 한 모금 마신다"
     }
    ],
    "bye": "가발을 벗어 크게 인사 — 다리 끝에 버스."
   },
   "job": {
    "who": "fox",
    "ask": "상자 뚜껑의 빈 딱지를 앞발로 가리킨다.",
    "write": [
     "w",
     "x"
    ],
    "gives": "딱지에 아이 글씨 w·x. 다리에 난간 등이 켜지고, 다시 오면 상자에서 끝소리 톡톡 듣기가 열린다."
   }
  },
  "A13": {
   "room": {
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-gold",
    "sound": "저녁 풀벌레 + 멀리 동물 소리",
    "center": "숲 끝의 큰 노란 문. 가운데가 지퍼로 잠겨 있다. 문 너머로 동물원의 그림자",
    "props": {
     "yellow": [
      "center",
      "노란 문 — 누르면 노란빛이 한 번 환하게"
     ],
     "yo-yo": [
      "with:yak",
      "야크가 하는 요요 — 오르내린다"
     ],
     "yak": [
      "Ld",
      "털이 긴 야크"
     ],
     "yogurt": [
      "Lc",
      "요구르트 컵과 숟가락"
     ],
     "zebra": [
      "Rc",
      "줄무늬를 세는 얼룩말"
     ],
     "zoo": [
      "back",
      "문 너머 동물원(그림자와 불빛)"
     ],
     "zip": [
      "Rb",
      "문 기둥의 큰 지퍼 손잡이 — 누르면 지익"
     ],
     "zero": [
      "Rd",
      "빈 과일 바구니와 숫자판 0"
     ]
    },
    "extras": [
     "문 위 등 두 개(부탁 뒤 켜진다)",
     "줄무늬 깔개",
     "큰 글자 나무로 가는 등불 길(끝날 때)"
    ],
    "life": [
     "오르내리는 요요",
     "지퍼 문",
     "요구르트 먹는 야크",
     "줄무늬가 물결치는 얼룩말",
     "문틈으로 새어 나오는 불빛"
    ],
    "ink": {
     "at": "center",
     "on": "문 위 문패",
     "lines": 1
    },
    "beat": "지퍼 소리(지익)와 요요 — 요요가 박자에 오르내린다",
    "ride": "등불 길을 따라 숲 한가운데로 — 스물여섯 열매가 반짝이는 큰 글자 나무로"
   },
   "events": [
    {
     "id": "snack",
     "name": "잠긴 문 앞 간식",
     "beat": 1,
     "game": "order",
     "who": "mina",
     "en": "Yum! Yogurt!",
     "scene": "문이 잠겨 기다리는 동안 야크가 요구르트 좌판을 편다. 손님이 그림으로 주문하면 아이가 그 이름을 외친다.",
     "end": "지퍼가 한 칸 내려간다."
    },
    {
     "id": "stripes",
     "name": "줄무늬 세기",
     "beat": 2,
     "game": "lfruit",
     "who": "amy",
     "en": "I see a zebra!",
     "scene": "얼룩말 줄무늬마다 글자가 비친다. 글자를 보고 그 소리를 고르면 줄무늬가 하나씩 켜진다 — 빈 바구니(영)에서 시작.",
     "end": "줄무늬가 다 켜지고 지퍼가 또 한 칸."
    },
    {
     "id": "unzip",
     "name": "지퍼 열기",
     "beat": 3,
     "game": "wtrain",
     "who": "max",
     "en": "I like yellow!",
     "scene": "지퍼가 쭉 열리며 친구들이 줄지어 나온다. 이름을 부르면 문 등불이 하나씩 켜진다.",
     "end": "문이 활짝 — y·z 열매. 스물여섯 열매가 다 모여 큰 글자 나무 쪽 길에 등불이 켜진다."
    },
    {
     "id": "yoyo",
     "name": "요요",
     "beat": 0,
     "game": "sjump",
     "who": "ben",
     "en": "Listen!",
     "scene": "요요가 오르내리다 갈림길에서 멈춘다. 들린 소리의 글자 쪽으로 몸을 기울이면 요요가 그쪽으로 구른다.",
     "end": "요요가 야크 손으로 돌아온다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "yak",
     "show": [
      "[y]",
      "{yak}",
      "{yo-yo}",
      "{yogurt}"
     ],
     "en": "I like yogurt!",
     "act": {
      "do": "find",
      "letter": "y"
     },
     "react": "야크가 요요를 한 번 크게 돌리고 얼룩말 쪽을 본다.",
     "leads": "stripes"
    },
    {
     "arrive": "read",
     "from": "zebra",
     "show": [
      "[y]",
      "[z]",
      "{yellow}",
      "{zip}"
     ],
     "en": "I see a zebra!",
     "act": {
      "do": "match",
      "pairs": [
       [
        "y",
        "yellow"
       ],
       [
        "z",
        "zip"
       ]
      ]
     },
     "react": "얼룩말 줄무늬가 일렁이고 지퍼 손잡이가 달랑.",
     "leads": "unzip",
     "note": "yellow 그림은 노란 물감 통"
    },
    {
     "arrive": "write",
     "from": "Mina",
     "show": [
      "{zoo}",
      "{bus}"
     ],
     "en": "Hi, friend! I like you!",
     "act": {
      "do": "ride"
     },
     "react": "쪽지에서 작은 등불 스물여섯이 떠오른다. 버스가 경적.",
     "leads": "A14"
    }
   ],
   "guest": {
    "who": "zebra",
    "enter": "얼룩말이 줄무늬 깔개 위로 또각또각 걸어 나온다.",
    "turns": [
     {
      "show": "zip",
      "pick": [
       "y",
       "z"
      ],
      "ans": "z"
     },
     {
      "show": "sun",
      "pick": [
       "z",
       "s",
       "x"
      ],
      "ans": "s",
      "why": "/s/ 와 /z/ — 입 모양은 같고 울림만 다르다"
     },
     {
      "say": "I like yellow!",
      "cue": "노란 문이 환하게 빛난다"
     }
    ],
    "bye": "꼬리로 지퍼를 끝까지 내린다 — 문 너머 등불 길."
   },
   "job": {
    "who": "zebra",
    "ask": "문 위의 빈 문패를 코로 가리킨다.",
    "write": [
     "y",
     "z"
    ],
    "gives": "문패에 아이 글씨 y·z. 문 위 등 두 개가 켜진다. 글자 나무에 스물여섯 열매가 다 달린다."
   }
  },
  "A14": {
   "room": {
    "rig": "lantern",
    "weather": "glow",
    "accent": "--a-gold",
    "sound": "등불 타는 소리 + 열세 빈터 박자 소리가 번갈아",
    "center": "숲 한가운데의 큰 글자 나무. 열매 스물여섯(걸음마다 달아 온 것 — 아이가 쓴 글자가 열매 이름표). 오른쪽 뒤로 안개 낀 마을 길",
    "ring": [
     [
      "alligator",
      "a",
      "b",
      [
       -7,
       -0.3
      ]
     ],
     [
      "duck",
      "c",
      "d",
      [
       -6.3,
       -2
      ]
     ],
     [
      "elf",
      "e",
      "f",
      [
       -4.9,
       -3.2
      ]
     ],
     [
      "goat",
      "g",
      "h",
      [
       -3.2,
       -4
      ]
     ],
     [
      "iguana",
      "i",
      "j",
      [
       -4.4,
       -0.6
      ]
     ],
     [
      "king",
      "k",
      "l",
      [
       -2.6,
       -1.6
      ]
     ],
     [
      "mom",
      "m",
      "n",
      [
       2.6,
       -1.6
      ]
     ],
     [
      "octopus",
      "o",
      "p",
      [
       4.4,
       -0.6
      ]
     ],
     [
      "queen",
      "q",
      "r",
      [
       3.2,
       -4
      ]
     ],
     [
      "tiger",
      "s",
      "t",
      [
       4.9,
       -3.2
      ]
     ],
     [
      "uncle",
      "u",
      "v",
      [
       6.3,
       -2
      ]
     ],
     [
      "wolf",
      "w",
      "x",
      [
       7,
       -0.3
      ]
     ],
     [
      "zebra",
      "y",
      "z",
      [
       5,
       1.2
      ]
     ]
    ],
    "extras": [
     "긴 잔칫상",
     "등불 줄",
     "통나무 버스(마지막 정류장)",
     "마을 길의 안개"
    ],
    "life": [
     "열매 스물여섯의 빛",
     "모여든 동물들",
     "등불",
     "숲 너머로 걷히는 안개",
     "친구들이 저마다 제 빈터 박자로 발을 구른다"
    ],
    "ink": {
     "at": "center",
     "on": "나무 둘레에 거는 글자 띠 — 스물여섯 칸",
     "lines": 3
    },
    "beat": "열세 빈터의 소리가 줄마다 번갈아 — 통나무·찻숟가락·물방울·방울·얼음·연줄·귀뚜라미·냄비·빗방울·조개·우산·이슬·지퍼",
    "ride": "안개가 걷힌 길 끝에 집 한 채 — 낱말 마당, 우리 집 거실로"
   },
   "events": [
    {
     "id": "handsup",
     "name": "손 드는 친구들",
     "beat": 1,
     "game": "smonster",
     "who": "max",
     "en": "Listen!",
     "scene": "소리가 하나 들리면 그 글자를 맡은 친구가 손을 든다 — 아이가 들린 소리의 글자 열매를 찾는다. 스물여섯 소리를 섞어서.",
     "end": "맞힌 열매마다 등불이 켜진다."
    },
    {
     "id": "table",
     "name": "잔칫상 차리기",
     "beat": 2,
     "game": "basket",
     "who": "mina",
     "en": "I see it!",
     "scene": "빈터마다 가져온 것들이 한데 섞였다. 판마다 헷갈리는 짝 바구니(b·d · p·q · m·n · c·g · g·j · f·v · v·w · s·z · e·i · o·u) — 들린 낱말을 가른다.",
     "end": "긴 잔칫상이 차려진다."
    },
    {
     "id": "band",
     "name": "글자 띠",
     "beat": 3,
     "game": "lpath",
     "who": "max",
     "en": "I like it! I like you!",
     "scene": "소리를 듣고 글자를 쓴다 — 쓴 글자가 띠 한 칸이 된다(하루 열두 자까지, 세 날에 나누어 스물여섯).",
     "end": "띠가 나무에 걸리고 숲 너머 마을 길의 안개가 걷힌다."
    },
    {
     "id": "longtrain",
     "name": "긴 통나무 기차",
     "beat": 0,
     "game": "wtrain",
     "who": "ben",
     "en": "Wow!",
     "scene": "칸 스물여섯의 긴 기차 — 글자마다 낱말 하나씩(그날그날 다른 낱말). 이름을 부르면 칸에 불.",
     "end": "기차가 나무를 한 바퀴 돌아 버스 뒤에 선다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "[a]",
      "[c]",
      "[e]"
     ],
     "en": "I like it!",
     "act": {
      "do": "find",
      "letter": "a",
      "seq": [
       "a",
       "c",
       "e"
      ]
     },
     "react": "글자를 차례로 누르면 그 글자를 맡은 친구(악어·오리·요정)가 차례로 손을 흔든다.",
     "leads": "table",
     "note": "글자 셋을 읽고 그 소리의 친구를 차례로 — 물건 대신 친구를 누른다"
    },
    {
     "arrive": "read",
     "from": "Mina",
     "show": [
      "{cat}",
      "{sun}"
     ],
     "en": "I see a cat! I see the sun!",
     "act": {
      "do": "say",
      "line": "I see the sun!",
      "tap": "sun"
     },
     "react": "말한 것의 등불이 켜진다(고양이 등·해 등). 두 문장 중 어느 쪽을 말해도 받는다.",
     "leads": "band",
     "alt": "I see a cat!"
    },
    {
     "arrive": "write",
     "from": "cat",
     "sign": "고양이 발자국(거실 깔개 무늬)",
     "show": [
      "{hat}",
      "{bus}"
     ],
     "en": "Hi, friend! I see you!",
     "act": {
      "do": "ride"
     },
     "react": "버스가 길게 경적 — 숲 너머 길로 떠난다(낱말 마당이 열린다).",
     "leads": "B01"
    }
   ],
   "guest": {
    "who": "Mina",
    "enter": "Mina 가 등불을 들고 나무 아래로 오고, 열세 친구가 뒤에 반원으로 선다.",
    "turns": [
     {
      "hear": "m",
      "pick": [
       "m",
       "n",
       "w",
       "h"
      ],
      "ans": "m",
      "why": "그림 없이 소리만 듣고 글자 — 글자 길의 열매 단계와 같은 힘"
     },
     {
      "show": "quilt",
      "pick": [
       "q",
       "p",
       "g",
       "k"
      ],
      "ans": "q",
      "why": "숲 한가운데 걸음의 낱말 — 아랫줄 글자 셋 사이에서"
     },
     {
      "say": "I see the sun!",
      "alt": "I see a cat!",
      "cue": "등불 둘(고양이·해) 중 하나를 가리킨다"
     }
    ],
    "bye": "Mina 가 등불을 높이 든다 — 안개가 걷히고 마을 길이 보인다."
   },
   "job": {
    "who": "Max",
    "ask": "Max 와 Mina 가 나무 둘레에 빈 띠를 길게 펼친다.",
    "write": [
     "a",
     "b",
     "c",
     "d",
     "e",
     "f",
     "g",
     "h",
     "i",
     "j",
     "k",
     "l",
     "m",
     "n",
     "o",
     "p",
     "q",
     "r",
     "s",
     "t",
     "u",
     "v",
     "w",
     "x",
     "y",
     "z"
    ],
    "plan": {
     "meet": "abcdefgh",
     "read": "ijklmnopq",
     "write": "rstuvwxyz"
    },
    "gives": "스물여섯 글자 띠가 등불 줄처럼 나무에 걸린다. 숲 너머 길의 안개가 걷히고 사다리 칸 lv1-01·02 가 켜진다."
   }
  },
  "B01": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "morning",
    "weather": "clear",
    "accent": "--a-gold",
    "sound": "선풍기 도는 소리 + 창밖 아침 새",
    "center": "큰 창 아래 소파. 창으로 아침 해가 비스듬히 들고, 창밖으로 집 앞길이 보인다",
    "props": {
     "mat": [
      "Ld",
      "둥근 매트 — 누르면 가장자리 술이 찰랑"
     ],
     "cat": [
      "with:mat",
      "매트 위의 고양이(숲의 그루터기 찻집에서 본 그 고양이) — 누르면 기지개"
     ],
     "sat": [
      "with:cat",
      "고양이의 앉은 모습 — 누르면 일어섰다가 다시 살포시 앉는다"
     ],
     "hat": [
      "Lc",
      "모자걸이에서 떨어진 밀짚모자 — 선풍기 바람에 조금씩 구른다"
     ],
     "man": [
      "Rc",
      "문가에 선 아저씨(이야기 ③ 전에는 창밖 그림자) — 누르면 손을 흔든다"
     ],
     "pan": [
      "with:man",
      "아저씨가 든 프라이팬 — 누르면 뒤집개질 한 번"
     ],
     "fan": [
      "Rb",
      "목을 돌리는 선풍기 — 누르면 바람이 세졌다 약해진다"
     ],
     "van": [
      "winR",
      "창밖에 선 승합차(숲의 우산 골짜기에서 본 차) — 누르면 깜빡이"
     ]
    },
    "more": {
     "bat": "소파 뒤에서 야구 방망이가 톡 튀어나와 기대선다",
     "rat": "모자걸이 밑 쥐구멍에서 생쥐가 고개를 내민다",
     "ran": "고양이가 매트를 한 바퀴 달리고 발자국이 남았다 사라진다",
     "pat": "내 캐릭터가 고양이를 토닥토닥"
    },
    "wear": {
     "slide": "소파 등받이 쿠션 미끄럼 — 글자 쿠션 셋이 미끄러져 매트 위에서 붙는다",
     "wheel": "회전 모자걸이 — 모자마다 첫 글자, 돌려서 가족 팻말 앞에 세운다",
     "rhyme": "벽 액자 줄 — 끝소리가 같은 그림 둘을 한 끈에 건다",
     "belt": "바닥 장난감 기차 선로 — 낱말 화물칸이 지나가고 맞는 그림을 싣는다",
     "hidden": "소파 쿠션 셋 — /a/ 가 숨은 쿠션을 톡톡 두드리면 들썩",
     "sbox": "매트의 네모 무늬 세 칸",
     "lpath": "액자의 빈 종이 — 손가락이 지나간 자리에 색연필 자국"
    },
    "hiddenNo": [
     "dog",
     "pig",
     "sun",
     "bed"
    ],
    "extras": [
     "소파 쿠션 셋",
     "벽 액자 줄",
     "화분",
     "장난감 기차 선로",
     "모자걸이"
    ],
    "life": [
     "도는 선풍기",
     "꼬리 살랑 고양이",
     "창밖 승합차",
     "굴러가는 모자",
     "햇살 줄기 속에 떠다니는 먼지"
    ],
    "ink": {
     "at": "frame",
     "on": "거실 벽 낱말 액자(네 칸)",
     "lines": 4
    },
    "beat": "선풍기 날개가 탁탁 — 고양이 꼬리가 박자에 바닥을 친다",
    "way": {
     "by": "door",
     "sees": "부엌 문이 조금 열려 있다 — 문틈으로 잼 냄새와 코 고는 소리"
    }
   },
   "events": [
    {
     "id": "catmat",
     "name": "매트 위의 고양이",
     "beat": 1,
     "game": "slide",
     "who": "amy",
     "en": "Oh! A cat!",
     "scene": "소파에서 글자 쿠션 c·a·t 가 차례로 미끄러져 매트 위에서 붙는다 — 그 위에 고양이가 올라앉는다. 쿠션이 바뀔 때마다(h·a·t, m·a·t) 고양이가 그 물건 쪽을 본다.",
     "end": "고양이가 매트 한가운데 자리를 잡고 가르랑."
    },
    {
     "id": "rollhat",
     "name": "굴러가는 모자",
     "beat": 2,
     "game": "schant",
     "who": "ben",
     "en": "A hat! A fan!",
     "scene": "고양이가 모자 속으로 쏙 들어갔는데 선풍기 바람에 모자가 통째로 굴러간다. 챈트의 낱말 자리에서 아이 목소리가 켜지면 바람이 멈칫 — 모자가 한 칸씩 돌아온다.",
     "end": "모자가 제자리에 서고 고양이가 모자를 쓴 채 얼굴을 내민다."
    },
    {
     "id": "manvan",
     "name": "아저씨가 왔다",
     "beat": 3,
     "game": "talk",
     "who": "mina",
     "en": "I see a van! Hi, man!",
     "scene": "창밖에 승합차가 끽 선다. 아저씨가 프라이팬을 들고 문을 두드린다 — Mina 가 창밖을 가리키고, 아이가 본 것을 말하면 그것이 대답한다.",
     "end": "아저씨가 들어와 프라이팬을 식탁에 놓는다 — 거실 불이 한 단 밝아진다."
    },
    {
     "id": "cushions",
     "name": "쿠션 숨바꼭질",
     "beat": 0,
     "game": "hidden",
     "who": "ben",
     "en": "Listen!",
     "scene": "쿠션 셋 밑에 낱말이 하나씩 숨었다. 들린 낱말에 /a/ 가 있으면 그 쿠션을 톡톡 — 고양이 앞발이 쑥 나온다. 없으면 쿠션이 고개를 젓는다.",
     "end": "쿠션 셋이 소파에 다시 줄을 선다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "cat",
     "show": [
      "<hat>"
     ],
     "en": "I like the hat!",
     "act": {
      "do": "find",
      "word": "hat"
     },
     "react": "고양이가 모자 속으로 머리를 쏙 넣어 본다. 선풍기가 이쪽으로 목을 돌린다.",
     "leads": "rollhat"
    },
    {
     "arrive": "read",
     "from": "man",
     "show": [
      "<mat>",
      "<man>"
     ],
     "en": "A man! A mat!",
     "act": {
      "do": "bring",
      "word": "mat",
      "to": "door"
     },
     "react": "문 앞에 매트가 놓이자 창밖에서 깜빡이 불빛이 한 번.",
     "leads": "manvan",
     "note": "손님맞이 깔개 — 매트를 문 앞으로 끌어다 놓는다(고양이는 따라온다). 사건이 끝나면 매트는 제자리로 돌아간다"
    },
    {
     "arrive": "write",
     "from": "dad",
     "sign": "잼 묻은 손자국",
     "show": [
      "{jam}"
     ],
     "en": "Hi! I like jam!",
     "act": {
      "do": "go",
      "by": "door"
     },
     "react": "부엌 문고리가 달그락. 문이 열렸으면 문이 활짝, 아직이면 문틈으로 잼 냄새만(쪽지는 우편함에 남는다).",
     "leads": "B02"
    }
   ],
   "guest": {
    "who": "rat",
    "enter": "모자걸이 밑 쥐구멍에서 생쥐가 작은 여행 가방을 끌고 나온다. 가방 자물쇠에 낱말 하나.",
    "turns": [
     {
      "read": "rat",
      "pool": [
       "bat",
       "pat",
       "ran"
      ],
      "opens": "읽으면 생쥐가 모자를 벗어 인사한다 — 제 이름이다. 가방 자물쇠가 딸깍."
     },
     {
      "show": "fan",
      "cards": [
       "fan",
       "van",
       "pan"
      ],
      "ans": "fan",
      "why": "첫 글자 f·v·p — 숲에서 귀로 가른 f·v 를 이제 글자로 가른다"
     },
     {
      "say": "I see a hat!",
      "cue": "생쥐가 고양이 모자를 빌려 쓰고 한 바퀴 돈다"
     }
    ],
    "bye": "고양이가 꼬리로 자리를 내주고, 생쥐가 가방에서 작은 종을 꺼내 부엌 문 위에 단다."
   },
   "job": {
    "who": "amy",
    "ask": "벽의 빈 액자 넷을 가리키며 두 손바닥을 펴 보인다.",
    "write": [
     "cat",
     "hat",
     "man",
     "fan"
    ],
    "plan": {
     "meet": [
      "cat"
     ],
     "write": [
      "hat",
      "man",
      "fan"
     ]
    },
    "carry": [],
    "gives": "액자 네 칸에 아이 글씨 낱말. 액자 아래 그 물건의 작은 그림이 색을 얻고, 부엌 문 위 등이 켜진다."
   }
  },
  "B02": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "day",
    "weather": "clear",
    "accent": "--a-plum",
    "sound": "수도꼭지 똑똑 + 냉장고 웅",
    "center": "식탁과 흔들의자. 아빠가 흔들의자에서 낮잠을 잔다(이야기 ③부터 깨어 있다)",
    "props": {
     "cap": [
      "wallL",
      "벽 못에 걸린 아빠의 모자 — 누르면 챙이 까딱"
     ],
     "map": [
      "Ld",
      "식탁 옆 바닥에 반쯤 펼쳐진 지도(숲의 달빛 둥지에서 본 그림 지도) — 이야기 ② 전에는 가방 밖으로 귀퉁이만"
     ],
     "nap": [
      "with:dad",
      "낮잠 — 누르면 담요가 숨결에 오르내리고 코 고는 소리 한 번"
     ],
     "bag": [
      "Lc",
      "의자에 걸친 가방 — 누르면 덜렁"
     ],
     "dad": [
      "center",
      "흔들의자의 아빠(숲의 찻집 주인) — 깨어 있을 때 누르면 손을 흔든다"
     ],
     "sad": [
      "Rd",
      "바닥에 앉은 시무룩한 아기 — 누르면 입을 삐죽. 이야기 ③ 뒤에는 삐죽했다가 까르르"
     ],
     "ham": [
      "Rb",
      "찬장 접시의 햄 — 누르면 김이 한 줄"
     ],
     "jam": [
      "Rc",
      "조리대 위 잼 병 — 누르면 뚜껑이 반짝"
     ]
    },
    "more": {
     "tap": "수도꼭지에서 물방울이 똑 — 컵에 떨어진다",
     "mad": "아기가 볼을 빵빵하게 부풀렸다가 푸 하고 푼다",
     "bad": "아기가 구긴 그림 한 장이 휴지통으로 통",
     "tag": "가방 손잡이의 이름표가 뒤집히며 반짝"
    },
    "sight": {
     "baby": "시무룩한 아기(sad 자리)의 턱받이에 통말 딱지 — 누르면 아기가 기어서 한 칸"
    },
    "wear": {
     "slide": "기울여 놓은 긴 도마 — 글자 쿠키 셋이 미끄러져 접시에서 붙는다",
     "wheel": "양념 회전판 — 병뚜껑마다 첫 글자",
     "rhyme": "조리 도구 걸이 — 끝소리가 같은 그림 둘을 한 고리에",
     "belt": "조리대 배식 창 — 낱말 접시가 줄지어 지나가고 맞는 그림을 올린다",
     "hidden": "찬장 문 셋 — /a/ 가 숨은 문을 똑똑 두드리면 열린다",
     "sbox": "냉장고 자석 판 세 칸",
     "lpath": "냉장고 쪽지 종이"
    },
    "hiddenNo": [
     "pig",
     "bed",
     "sun",
     "box"
    ],
    "extras": [
     "수도꼭지",
     "찬장 문 셋",
     "냉장고",
     "양념 회전판",
     "가방 이름표 끈"
    ],
    "life": [
     "코 고는 아빠",
     "똑똑 수도꼭지",
     "기어가는 아기",
     "잼 병 반짝",
     "창가 커튼 살랑"
    ],
    "ink": {
     "at": "frame",
     "on": "냉장고 쪽지(네 줄)",
     "lines": 4
    },
    "beat": "숟가락으로 잼 병을 치는 소리 — 아빠 코 고는 소리가 박자에 끼어든다",
    "way": {
     "by": "lane",
     "sees": "뒷문 밖 농장 길 — 빗방울 한두 방울, 멀리 닭 우는 소리"
    }
   },
   "events": [
    {
     "id": "hush",
     "name": "쉿, 아빠 낮잠",
     "beat": 1,
     "game": "readaloud",
     "who": "amy",
     "en": "Oh! Dad! A nap!",
     "scene": "아빠가 낮잠을 자고 아기는 심심해서 시무룩. 낱말 카드를 소리 내어 읽을 때마다 아빠가 한 번 뒤척이고, 아기가 그 물건 쪽으로 한 칸 기어간다.",
     "end": "아기가 가방 앞에 도착해 끈을 잡는다."
    },
    {
     "id": "treasure",
     "name": "보물 지도",
     "beat": 2,
     "game": "rhyme",
     "who": "ben",
     "en": "A map! Ham! Jam!",
     "scene": "가방에서 지도가 나온다. 지도에는 그림들이 흩어져 있다 — 끝소리가 같은 짝을 이을 때마다 길이 한 토막 이어져 찬장으로 향한다.",
     "end": "지도 끝에 잼과 햄 그림 — 찬장 문 하나가 달그락."
    },
    {
     "id": "cupboard",
     "name": "찬장 문 셋",
     "beat": 3,
     "game": "hidden",
     "who": "mina",
     "en": "Yum! I like jam!",
     "scene": "/a/ 가 숨은 찬장 문을 두드리면 열리고 샌드위치 재료가 하나씩 나온다. 아빠가 깨어 모자를 쓰고 잼을 바른다.",
     "end": "잼 샌드위치 완성 — 아기가 까르르 웃는다."
    },
    {
     "id": "spice",
     "name": "양념 회전판",
     "beat": 0,
     "game": "wheel",
     "who": "ben",
     "en": "Wow!",
     "scene": "회전판을 돌려 병뚜껑 첫 글자를 바꾼다. 진짜 낱말이 되면 그것이 방에서 한 번 움직인다.",
     "end": "회전판이 스르르 멈추고 병들이 줄을 맞춘다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "baby",
     "show": [
      "<bag>",
      "<map>"
     ],
     "en": "A bag! A map!",
     "act": {
      "do": "match",
      "pairs": [
       "bag",
       "map"
      ]
     },
     "react": "아기가 가방 끈을 잡아당긴다 — 지도 귀퉁이가 쑥 나온다.",
     "leads": "treasure"
    },
    {
     "arrive": "read",
     "from": "dad",
     "show": [
      "<ham>",
      "<jam>"
     ],
     "en": "I like jam!",
     "act": {
      "do": "say",
      "line": "I like jam!",
      "tap": "jam"
     },
     "react": "아빠가 잠결에 입맛을 다시고 한쪽 눈을 뜬다.",
     "leads": "cupboard"
    },
    {
     "arrive": "write",
     "from": "hen",
     "sign": "젖은 닭 발자국",
     "show": [
      "{hen}"
     ],
     "en": "Hi! I see you!",
     "act": {
      "do": "go",
      "by": "lane"
     },
     "react": "뒷문 빗장이 덜컹. 문이 열렸으면 농장 길로, 아직이면 문틈으로 빗소리만.",
     "leads": "B03"
    }
   ],
   "guest": {
    "who": "dad",
    "enter": "낮잠에서 깬 아빠가 모자를 쓰고, 낱말 딱지가 붙은 손잡이 하나를 들어 보인다.",
    "turns": [
     {
      "read": "tap",
      "pool": [
       "tag",
       "mad",
       "bad"
      ],
      "opens": "읽으면 아빠가 손잡이를 수도꼭지에 끼운다 — 똑똑 새던 물이 뚝 그친다."
     },
     {
      "show": "mat",
      "cards": [
       "mat",
       "map",
       "man"
      ],
      "ans": "mat",
      "why": "끝 글자 t·p·n — 끝 글자 하나가 낱말을 바꾼다(거실의 mat 과 부엌의 map)"
     },
     {
      "say": "I like ham!",
      "alt": "I like jam!",
      "cue": "아빠가 햄 접시와 잼 병을 양손에 들고 고개를 갸웃한다"
     }
    ],
    "bye": "샌드위치를 반으로 잘라 한쪽을 내밀고 뒷문 빗장을 풀어 준다."
   },
   "job": {
    "who": "dad",
    "ask": "냉장고의 빈 쪽지를 톡톡 치고 장바구니를 들어 보인다.",
    "write": [
     "dad",
     "jam",
     "bag",
     "map"
    ],
    "plan": {
     "meet": [
      "map"
     ],
     "write": [
      "dad",
      "jam",
      "bag"
     ]
    },
    "carry": [
     "cat",
     "hat"
    ],
    "gives": "냉장고 쪽지에 아이 글씨 넷 — 자석이 붙고 냉장고 불이 켜진다. 뒷문 위 등이 켜진다."
   }
  },
  "B03": {
   "room": {
    "kind": "out",
    "owner": "ben",
    "rig": "morning",
    "weather": "rain",
    "accent": "--a-steel",
    "sound": "닭 꼬꼬 + 양철 지붕 빗소리(이야기 ②부터)",
    "center": "양철 지붕 닭장 집과 울타리 우리. 우리 문이 열려 있다",
    "props": {
     "hen": [
      "Ld",
      "종종걸음 대장 암탉(숲의 염소 언덕에서 본 암탉) — 누르면 꼬꼬"
     ],
     "ten": [
      "with:hen",
      "암탉은 모두 열 마리 — 누르면 하나씩 고개를 들며 열까지"
     ],
     "pen": [
      "Lc",
      "문패 옆 잉크병에 꽂힌 깃펜(암탉 깃털) — 누르면 깃이 살랑"
     ],
     "men": [
      "La",
      "비옷 입은 농장 아저씨 둘 — 누르면 둘이 같이 모자를 든다"
     ],
     "net": [
      "Rd",
      "울타리에 걸린 그물 — 바람에 펄럭"
     ],
     "pet": [
      "Rc",
      "토끼장 속 토끼(목에 리본) — 누르면 코를 벌름"
     ],
     "wet": [
      "with:pet",
      "젖은 털 — 누르면 토끼가 몸을 부르르 털어 물방울이 튄다"
     ],
     "jet": [
      "winR",
      "하늘을 가로지르는 제트 — 누르면 흰 줄이 길어진다"
     ]
    },
    "more": {
     "den": "울타리 밑 빈 굴 입구에서 풀잎이 흔들린다",
     "vet": "길 끝에서 왕진 가방이 반짝 — 누가 오고 있다",
     "set": "둥지의 알들이 한 줄로 가지런히 선다",
     "bet": "병아리 둘이 지렁이 하나를 두고 눈치를 본다"
    },
    "wear": {
     "slide": "닭 사다리(횃대로 오르는 판자) — 글자 달걀 셋이 굴러 둥지에서 붙는다",
     "wheel": "지붕 위 닭 풍향계 — 바람이 돌리면 첫 글자가 바뀐다",
     "rhyme": "횃대 — 끝소리가 같은 그림 둘을 나란히 올려 앉힌다",
     "belt": "모이 홈통 — 낱말 표가 빗물에 떠내려오고 맞는 그림 통에 담는다",
     "hidden": "둥지 상자 셋 — /e/ 가 숨은 상자를 톡톡 하면 암탉이 얼굴을 내민다",
     "sbox": "달걀판 세 칸",
     "lpath": "문패 나무판 — 젖은 흙 묻은 손가락 자국"
    },
    "hiddenNo": [
     "cat",
     "pig",
     "dog",
     "sun"
    ],
    "extras": [
     "닭 사다리",
     "둥지 상자 셋",
     "모이 홈통",
     "풍향계",
     "물웅덩이"
    ],
    "life": [
     "종종걸음 암탉",
     "빗방울",
     "펄럭이는 그물",
     "하늘의 제트",
     "물웅덩이에 번지는 동그라미"
    ],
    "ink": {
     "at": "frame",
     "on": "닭장 문패(네 줄)",
     "lines": 4
    },
    "beat": "빗방울이 양철 지붕을 치는 소리 — 암탉들이 박자에 고개를 까딱",
    "way": {
     "by": "lane",
     "sees": "비 갠 저녁 길 — 집 이층 창 하나에 불이 켜져 있다"
    }
   },
   "events": [
    {
     "id": "vane",
     "name": "풍향계가 돈다",
     "beat": 1,
     "game": "wheel",
     "who": "ben",
     "en": "Oh! A hen! Ten!",
     "scene": "암탉 열 마리가 우리 밖으로 나와 버렸다. 풍향계를 돌려 새 낱말을 읽어 낼 때마다 암탉 한 마리가 그 소리에 고개를 돌려 우리 쪽으로 걷는다.",
     "end": "세 마리가 우리로 들어가고 하늘이 흐려진다."
    },
    {
     "id": "wetfeed",
     "name": "젖은 모이 길",
     "beat": 2,
     "game": "belt",
     "who": "mina",
     "en": "A wet hen! A net!",
     "scene": "비가 온다. 모이 홈통으로 낱말 표가 떠내려온다 — 글자만 보고 맞는 그림 통에 담으면 그 통 앞으로 젖은 암탉이 모이고, 아저씨들이 그물로 살살 몬다.",
     "end": "일곱 마리가 우리 안에서 깃을 턴다."
    },
    {
     "id": "latch",
     "name": "달걀판 빗장",
     "beat": 3,
     "game": "sbox",
     "who": "ben",
     "en": "Ten! I see a jet!",
     "scene": "마지막 세 마리. 낱말을 듣고 달걀판 세 칸에 글자 달걀을 놓으면 우리 문 빗장이 한 칸씩 걸린다.",
     "end": "열 마리가 다 들어갔다 — 구름 사이로 제트가 흰 줄을 긋는다."
    },
    {
     "id": "ladder",
     "name": "닭 사다리",
     "beat": 0,
     "game": "slide",
     "who": "amy",
     "en": "Wow! A hen!",
     "scene": "글자 달걀 셋이 사다리를 굴러 내려와 둥지에서 붙는다. 낱말이 되면 암탉이 그 위에 앉아 품는다.",
     "end": "둥지에서 병아리 소리가 삐약."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "hen",
     "show": [
      "<net>",
      "<men>"
     ],
     "en": "I see ten!",
     "act": {
      "do": "bring",
      "word": "net",
      "to": "men"
     },
     "react": "아저씨들이 그물을 펴 보고 하늘을 올려다본다 — 먹구름이 온다.",
     "leads": "wetfeed"
    },
    {
     "arrive": "read",
     "from": "pet",
     "show": [
      "<jet>"
     ],
     "en": "I like the pet!",
     "act": {
      "do": "find",
      "word": "jet"
     },
     "react": "토끼가 귀를 쫑긋 세운다. 하늘 멀리서 웅 소리.",
     "leads": "latch"
    },
    {
     "arrive": "write",
     "from": "dog",
     "sign": "강아지 발자국",
     "show": [
      "{bed}",
      "{dog}"
     ],
     "en": "Hi! I like you!",
     "act": {
      "do": "go",
      "by": "lane"
     },
     "react": "집 쪽 길의 물웅덩이에 창 불빛이 비친다. 문이 열렸으면 집으로, 아직이면 닭장 등만 깜박.",
     "leads": "B04"
    }
   ],
   "guest": {
    "who": "vet",
    "enter": "우산 골짜기에서 만난 수의사가 왕진 가방을 들고 빗길을 걸어온다. 가방 이름표에 낱말 하나 — 귀로 알던 이름을 처음 읽는다.",
    "turns": [
     {
      "read": "vet",
      "pool": [
       "den",
       "set",
       "bet"
      ],
      "opens": "읽으면 수의사가 모자를 들어 인사하고 가방을 연다 — 보송한 수건이 나온다."
     },
     {
      "show": "pan",
      "cards": [
       "pan",
       "pen",
       "pat"
      ],
      "ans": "pan",
      "why": "가운데 a·e — 거실의 pan 과 닭장의 pen 은 가운데 글자 하나 차이"
     },
     {
      "say": "I see a hen!",
      "cue": "수의사가 수건으로 닦아 준 보송한 암탉을 안아 보인다"
     }
    ],
    "bye": "젖은 토끼까지 닦아 주고 문패 위 등을 켠다."
   },
   "job": {
    "who": "ben",
    "ask": "빈 문패를 닭장 문에 대 보이며 고개를 갸웃한다.",
    "write": [
     "hen",
     "ten",
     "net",
     "pet"
    ],
    "plan": {
     "meet": [
      "hen"
     ],
     "write": [
      "ten",
      "net",
      "pet"
     ]
    },
    "carry": [
     "jam",
     "map"
    ],
    "gives": "문패에 아이 글씨 넷 — 암탉들이 문패를 올려다보고 줄지어 들어간다. 우리 등이 켜진다."
   }
  },
  "B04": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "evening",
    "weather": "moon",
    "accent": "--a-red",
    "sound": "스탠드 등 지잉 + 창밖 풀벌레",
    "center": "창 아래 빨간 침대. 창으로 달빛이 든다",
    "props": {
     "bed": [
      "center",
      "빨간 침대(숲 첫 빈터의 이끼 침대와 같은 꼴 — 머리판 b, 발판 d) — 누르면 이불이 폭신"
     ],
     "red": [
      "with:bed",
      "빨간 이불 — 누르면 빨강이 한 번 환해진다"
     ],
     "fed": [
      "Lc",
      "강아지 밥그릇 — 누르면 사료가 차르르 차고 강아지가 먹는다"
     ],
     "web": [
      "winL",
      "창가의 거미줄(숲의 거미줄 다리처럼 이슬이 달렸다) — 달빛에 반짝"
     ],
     "leg": [
      "me",
      "내 캐릭터의 다리 — 누르면 한 다리를 쭉 든다"
     ],
     "peg": [
      "wallR",
      "벽 옷걸이 못 — 파란 옷이 걸려 흔들린다"
     ],
     "beg": [
      "Rd",
      "조르는 강아지 — 누르면 앞발을 모으고 낑"
     ],
     "yes": [
      "with:beg",
      "끄덕 — 누르면 강아지와 내 캐릭터가 같이 고개를 끄덕"
     ]
    },
    "more": {
     "led": "강아지가 목줄을 물고 문 쪽으로 앞장선 발자국",
     "hem": "파란 옷의 밑단이 살짝 접혔다 펴진다",
     "pep": "내 캐릭터가 기운차게 폴짝",
     "yet": "달이 구름 뒤에서 반만 나왔다가 다시 숨는다"
    },
    "sight": {
     "my": "방문 팻말의 첫 낱말 딱지 — 누르면 내 캐릭터가 가슴을 톡",
     "is": "문장 속에서만 — 낱말 사이를 잇는 작은 다리 조각으로 놓인다",
     "this": "누르면 내 캐릭터가 가장 가까운 물건을 손가락으로 가리킨다",
     "blue": "옷걸이 못(peg)에 걸린 파란 옷의 깃 딱지 — 누르면 파랑이 환해진다"
    },
    "wear": {
     "slide": "이불 언덕 — 글자 베개 셋이 미끄러져 침대 발치에서 붙는다",
     "wheel": "천장 모빌 — 돌리면 첫 글자 별이 가족 달 앞으로 온다",
     "rhyme": "벽 옷걸이 못 줄 — 끝소리가 같은 그림 둘을 한 못에 건다",
     "belt": "침대 밑을 도는 장난감 기차",
     "hidden": "서랍 셋 — /e/ 가 숨은 서랍을 당기면 양말이 폴짝",
     "sbox": "침대 머리판의 홈 세 칸",
     "lpath": "방문 팻말 — 분필 자국"
    },
    "hiddenNo": [
     "hat",
     "jam",
     "pig",
     "bus"
    ],
    "extras": [
     "스탠드",
     "서랍장",
     "천장 모빌",
     "강아지 방석",
     "장난감 기차"
    ],
    "life": [
     "조르는 강아지",
     "창가 거미줄",
     "흔들리는 옷걸이",
     "달빛",
     "숨 쉬듯 밝아졌다 어두워지는 스탠드"
    ],
    "ink": {
     "at": "frame",
     "on": "방문 팻말(네 줄)",
     "lines": 4
    },
    "beat": "강아지 꼬리가 바닥을 탁탁 — 스탠드 줄이 딸깍",
    "way": {
     "by": "lane",
     "sees": "아침 농장 길 — 흙냄새와 꿀꿀 소리"
    }
   },
   "events": [
    {
     "id": "redbed",
     "name": "빨간 침대",
     "beat": 1,
     "game": "schant",
     "who": "amy",
     "en": "This is my bed!",
     "scene": "빈방에 침대 하나. 챈트의 낱말 자리에서 아이 목소리가 켜질 때마다 방의 물건에 불이 하나씩 들어온다 — 침대, 이불, 밥그릇, 거미줄.",
     "end": "방이 다 밝아지고 침대 밑에서 낑 소리."
    },
    {
     "id": "begdog",
     "name": "조르는 강아지",
     "beat": 2,
     "game": "slide",
     "who": "ben",
     "en": "Oh! Yes! Yes!",
     "scene": "강아지가 침대 다리 밑에서 조른다. 이불 언덕에서 글자 베개가 붙어 낱말이 될 때마다 강아지가 한 칸 다가와 앞발을 모은다.",
     "end": "밥그릇이 차르르 — 강아지가 고개를 끄덕끄덕."
    },
    {
     "id": "lightsout",
     "name": "불 끄기 전",
     "beat": 3,
     "game": "talk",
     "who": "mina",
     "en": "This is my leg!",
     "scene": "옷걸이에 파란 옷을 건다. Mina 가 제 다리를 쭉 들어 보이면 아이가 제 것을 가리키며 말한다.",
     "end": "스탠드가 꺼지고 창가 거미줄이 달빛에 반짝인다."
    },
    {
     "id": "pegs",
     "name": "옷걸이 못",
     "beat": 0,
     "game": "rhyme",
     "who": "amy",
     "en": "Red! Bed!",
     "scene": "바닥에 흩어진 그림 옷들. 끝소리가 같은 둘을 한 못에 걸면 못이 까딱 인사한다.",
     "end": "옷이 다 걸리고 방이 말끔해진다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "dog",
     "show": [
      "<beg>",
      "{dog}"
     ],
     "en": "I beg! I beg!",
     "act": {
      "do": "say",
      "line": "Yes!",
      "tap": "yes"
     },
     "react": "침대 밑에서 꼬리가 바닥을 탁탁 친다.",
     "leads": "begdog"
    },
    {
     "arrive": "read",
     "from": "mom",
     "show": [
      "<bed>",
      "<peg>"
     ],
     "en": "My bed is red.",
     "act": {
      "do": "match",
      "pairs": [
       "bed",
       "peg"
      ]
     },
     "react": "옷걸이의 파란 옷이 살랑 흔들린다.",
     "leads": "lightsout"
    },
    {
     "arrive": "write",
     "from": "pig",
     "sign": "진흙 묻은 코 자국",
     "show": [
      "{pig}"
     ],
     "en": "Hi! I like you!",
     "act": {
      "do": "go",
      "by": "lane"
     },
     "react": "창밖이 밝아 온다. 문이 열렸으면 아침 농장 길로, 아직이면 닭 우는 소리만.",
     "leads": "B05"
    }
   ],
   "guest": {
    "who": "dog",
    "enter": "강아지가 침대 밑에서 잠긴 간식 통을 끌고 나온다. 뚜껑 자물쇠에 낱말 하나.",
    "turns": [
     {
      "read": "led",
      "pool": [
       "hem",
       "pep",
       "yet"
      ],
      "opens": "읽으면 딸깍 — 통이 열리고 강아지 과자가 나온다."
     },
     {
      "show": "dad",
      "cards": [
       "dad",
       "bad",
       "sad"
      ],
      "ans": "dad",
      "why": "b·d — 침대(bed)의 주에 낱말 첫 글자로 다시 가른다(배가 먼저면 d, 막대가 먼저면 b)"
     },
     {
      "say": "This is my bed.",
      "cue": "강아지가 침대 위로 폴짝 올라가 이불을 앞발로 톡톡 친다"
     }
    ],
    "bye": "과자 하나를 내 발치에 놓고 제 방석에 동그랗게 눕는다."
   },
   "job": {
    "who": "amy",
    "ask": "방문의 빈 팻말을 똑똑 두드리고 내 캐릭터를 가리킨다.",
    "write": [
     "bed",
     "red",
     "leg",
     "yes"
    ],
    "plan": {
     "meet": [
      "bed"
     ],
     "write": [
      "red",
      "leg",
      "yes"
     ]
    },
    "carry": [
     "hen",
     "net"
    ],
    "gives": "방문 팻말에 아이 글씨 — 통말 딱지 my 가 그 앞에 놓여 「my bed」. 이 방이 내 방이 된다(홈 섬의 집 이층 창에 불)."
   }
  },
  "B05": {
   "room": {
    "kind": "out",
    "owner": "ben",
    "rig": "day",
    "weather": "clear",
    "accent": "--a-pink",
    "sound": "꿀꿀 + 진흙 뽀글",
    "center": "진흙 마당과 낮은 울타리. 뒤쪽에 뽐내기 대회 단상",
    "props": {
     "pig": [
      "Ld",
      "큰 돼지(숲의 문어 연못에서 줄 섰던 돼지) — 누르면 꿀"
     ],
     "big": [
      "with:pig",
      "크다 — 누르면 큰 돼지가 더 커졌다가 돌아온다"
     ],
     "dig": [
      "Lc",
      "파고 있는 구덩이와 흙더미 — 누르면 흙이 퐁"
     ],
     "wig": [
      "Lb",
      "구덩이에서 나온 곱슬 가발(숲에서 늑대가 썼던 것) — 아기 돼지가 쓰고 있다"
     ],
     "pin": [
      "Rd",
      "리본에 달린 핀 — 반짝"
     ],
     "win": [
      "Rb",
      "단상 맨 윗자리 — 누르면 리본이 펄럭"
     ],
     "bin": [
      "Rc",
      "사료 통 — 위에 참새가 앉아 있다"
     ],
     "fin": [
      "Ra",
      "물통에서 삐죽 나온 금붕어 지느러미 — 누르면 찰방"
     ]
    },
    "more": {
     "fig": "울타리 옆 무화과나무에서 열매 하나가 톡",
     "jig": "아기 돼지가 엉덩이춤을 춘다",
     "tin": "빈 깡통이 데굴 굴러간다"
    },
    "sight": {
     "small": "가발 쓴 아기 돼지의 목 딱지 — 누르면 더 작아졌다가 돌아온다(big 옆에서 견줘 본다)"
    },
    "wear": {
     "slide": "진흙 비탈 — 글자 순무 셋이 미끄러져 여물통에서 붙는다",
     "wheel": "수레바퀴 — 바큇살마다 첫 글자",
     "rhyme": "울타리 가로대 — 끝소리가 같은 그림 둘을 리본으로 묶는다",
     "belt": "여물 홈통 — 낱말 표가 흘러오고 맞는 그림 통에",
     "hidden": "여물통 셋 — /i/ 가 숨은 통을 톡톡 하면 돼지 코가 쑥",
     "sbox": "울타리 말뚝 세 개",
     "lpath": "우승 리본 띠"
    },
    "hiddenNo": [
     "hen",
     "bed",
     "cat",
     "sun"
    ],
    "extras": [
     "수레바퀴",
     "여물통 셋",
     "대회 단상",
     "무화과나무",
     "물통"
    ],
    "life": [
     "흙 파는 돼지",
     "가발 쓴 아기 돼지",
     "통 위의 참새",
     "리본 핀 반짝",
     "진흙 방울이 뽀글"
    ],
    "ink": {
     "at": "frame",
     "on": "우승 리본(네 줄)",
     "lines": 4
    },
    "beat": "진흙 철벅 — 돼지 귀가 박자에 팔랑",
    "way": {
     "by": "lane",
     "sees": "집으로 가는 길 — 창 너머로 공 튀는 소리"
    }
   },
   "events": [
    {
     "id": "digging",
     "name": "땅 파는 돼지",
     "beat": 1,
     "game": "readaloud",
     "who": "ben",
     "en": "A big pig! Dig! Dig!",
     "scene": "큰 돼지가 땅을 팔 때마다 흙 묻은 낱말 카드가 나온다. 소리 내어 읽으면 흙이 털리고 카드의 그림이 제 색을 얻는다.",
     "end": "구덩이 바닥에서 곱슬한 털 뭉치 귀퉁이가 보인다."
    },
    {
     "id": "wigshow",
     "name": "가발 뽐내기",
     "beat": 2,
     "game": "rhyme",
     "who": "amy",
     "en": "Oh! A wig! A big wig!",
     "scene": "땅속에서 가발이 나왔다. 아기 돼지가 쓰고 울타리 위를 걷는다 — 끝소리 짝을 리본으로 묶을 때마다 구경하는 동물이 하나씩 는다.",
     "end": "울타리 둘레에 구경꾼이 가득."
    },
    {
     "id": "ribbon",
     "name": "우승 리본",
     "beat": 3,
     "game": "wjob",
     "who": "mina",
     "en": "The pig! Win! Win!",
     "scene": "농장 뽐내기 대회. 리본이 비어 있어 줄 수가 없다 — 리본에 낱말을 쓰면 핀이 달리고 큰 돼지 가슴으로 간다.",
     "end": "큰 돼지가 단상 맨 윗자리에 오르고 아기 돼지가 가발을 흔든다."
    },
    {
     "id": "trough",
     "name": "여물 길",
     "beat": 0,
     "game": "belt",
     "who": "ben",
     "en": "Yum!",
     "scene": "낱말 표가 홈통으로 흘러온다. 글자만 보고 맞는 그림 통에 담으면 돼지가 그 통에서 한입.",
     "end": "통이 다 차고 돼지들이 배를 두드린다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "pig",
     "show": [
      "<dig>"
     ],
     "en": "I dig! I dig!",
     "act": {
      "do": "find",
      "word": "dig"
     },
     "react": "돼지가 그 자리를 더 판다 — 털 뭉치가 조금 더 보인다.",
     "leads": "wigshow"
    },
    {
     "arrive": "read",
     "from": "pig",
     "show": [
      "<pin>",
      "<win>"
     ],
     "en": "My pig is big!",
     "act": {
      "do": "say",
      "line": "My pig is big!",
      "tap": "pig"
     },
     "react": "큰 돼지가 가슴을 펴고 단상 쪽으로 한 걸음.",
     "leads": "ribbon"
    },
    {
     "arrive": "write",
     "from": "kid",
     "sign": "작은 손바닥 도장",
     "show": [
      "{zip}"
     ],
     "en": "Hi! I like you!",
     "act": {
      "do": "go",
      "by": "lane"
     },
     "react": "길 끝 집 창에서 공이 통 튀어 오른다. 문이 열렸으면 놀이방으로, 아직이면 공 소리만.",
     "leads": "B06"
    }
   ],
   "guest": {
    "who": "pig",
    "enter": "가발 쓴 아기 돼지가 뚜껑 닫힌 깡통을 코로 굴리며 온다. 뚜껑에 낱말 하나.",
    "turns": [
     {
      "read": "fig",
      "pool": [
       "jig",
       "tin"
      ],
      "opens": "읽으면 깡통 뚜껑이 퐁 — 무화과 하나가 나온다."
     },
     {
      "show": "pen",
      "cards": [
       "pen",
       "pin",
       "pan"
      ],
      "ans": "pen",
      "why": "가운데 e·i·a — 숲에서 귀로 가른 e·i 를 낱말로 가른다(닭장의 pen · 돼지우리의 pin · 거실의 pan)"
     },
     {
      "say": "My pig is big!",
      "cue": "아기 돼지가 큰 돼지 등에 올라가 두 앞발을 벌린다"
     }
    ],
    "bye": "가발을 벗어 내 머리에 한 번 씌워 주고(바로 도로 쓴다) 울타리 문을 코로 연다."
   },
   "job": {
    "who": "ben",
    "ask": "빈 리본을 큰 돼지 가슴에 대 보고 어깨를 으쓱한다.",
    "write": [
     "pig",
     "big",
     "pin",
     "win"
    ],
    "plan": {
     "meet": [
      "pig"
     ],
     "write": [
      "big",
      "pin",
      "win"
     ]
    },
    "carry": [
     "bed",
     "red"
    ],
    "gives": "리본에 아이 글씨 넷 — 큰 돼지 가슴에 달린다. 단상 위 등이 켜진다."
   }
  },
  "B06": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "afternoon",
    "weather": "cloud",
    "accent": "--a-fish",
    "sound": "공 통통 + 창밖 바람",
    "center": "큰 창 아래 낮은 놀이 탁자. 창밖으로 구름이 흘러간다",
    "props": {
     "kit": [
      "Ld",
      "만들기 상자 — 누르면 달그락. 뚜껑이 안 열린다(이야기 ② 끝까지)"
     ],
     "lid": [
      "with:kit",
      "상자 뚜껑 — 누르면 들썩"
     ],
     "kid": [
      "Lc",
      "방석에 앉은 아이(친구) — 누르면 손을 흔든다"
     ],
     "sit": [
      "with:kid",
      "앉기 — 누르면 아이가 일어섰다가 다시 앉고, 내 캐릭터도 따라 앉는다"
     ],
     "hit": [
      "Lb",
      "장난감 망치와 두드림 판 — 누르면 탁"
     ],
     "zip": [
      "Rd",
      "지퍼 가방(숲의 노란 문 지퍼와 같은 손잡이) — 누르면 지익"
     ],
     "lip": [
      "me",
      "내 캐릭터의 입술 — 누르면 쪽 소리"
     ],
     "tip": [
      "Rb",
      "연필꽂이의 크레용 끝 — 누르면 끝이 반짝"
     ]
    },
    "more": {
     "fit": "블록 하나가 구멍에 쏙 들어간다",
     "pit": "볼풀에 공 하나가 퐁 빠진다",
     "dip": "붓이 물감 통에 콕",
     "hid": "공이 탁자 밑으로 데굴 숨는다"
    },
    "wear": {
     "slide": "장난감 미끄럼틀 — 글자 블록 셋이 타고 내려와 붙는다",
     "wheel": "돌림판 장난감 — 칸마다 첫 글자",
     "rhyme": "고리 던지기 기둥 — 끝소리가 같은 그림 둘을 한 기둥에",
     "belt": "구슬 굴림 길 — 낱말 구슬이 굴러오고 맞는 그림 컵에 받는다",
     "hidden": "상자 뚜껑 셋 — /i/ 가 숨은 뚜껑을 치면 북소리",
     "sbox": "블록 틀 세 칸",
     "lpath": "상자 이름표 딱지"
    },
    "hiddenNo": [
     "hen",
     "bed",
     "jam",
     "sun"
    ],
    "extras": [
     "장난감 미끄럼틀",
     "볼풀",
     "블록 통",
     "물감 통",
     "천장 종이 모빌"
    ],
    "life": [
     "들썩이는 뚜껑",
     "지퍼 가방",
     "통통 튀는 공",
     "창밖 구름",
     "천천히 도는 종이 모빌"
    ],
    "ink": {
     "at": "Ld",
     "on": "만들기 상자 이름표(네 줄)",
     "lines": 4
    },
    "beat": "공이 통통 — 뚜껑이 박자에 들썩",
    "way": {
     "by": "door",
     "sees": "부엌 쪽 문틈으로 화덕 불빛이 주황으로 샌다"
    }
   },
   "events": [
    {
     "id": "stucklid",
     "name": "안 열리는 상자",
     "beat": 1,
     "game": "slide",
     "who": "amy",
     "en": "Oh! A kit! The lid!",
     "scene": "만들기 상자의 뚜껑이 안 열린다. 미끄럼틀로 글자 블록이 내려와 낱말이 될 때마다 상자가 한 번 들썩 — 그래도 안 열린다.",
     "end": "아이(친구)가 상자 옆에 털썩 앉아 턱을 괸다."
    },
    {
     "id": "zipzip",
     "name": "지퍼 쭉",
     "beat": 2,
     "game": "belt",
     "who": "ben",
     "en": "Zip! Zip! Hit the lid!",
     "scene": "낱말 구슬이 굴러온다 — 글자만 보고 맞는 컵에 받을 때마다 가방 지퍼가 한 칸씩 열린다. 다 열리면 안에서 망치가 나온다.",
     "end": "뚜껑을 톡 치니 상자가 열린다."
    },
    {
     "id": "drum",
     "name": "뚜껑 북",
     "beat": 3,
     "game": "hidden",
     "who": "mina",
     "en": "I hit the lid! Listen!",
     "scene": "상자에서 북이 나왔다. 뚜껑 셋 가운데 /i/ 가 숨은 뚜껑을 치면 북소리가 난다 — 없으면 뚜껑이 삐 하고 고개를 젓는다.",
     "end": "아이들이 뚜껑을 치며 한 판 — 공이 박자에 튄다."
    },
    {
     "id": "ballbeat",
     "name": "통통 공 박자",
     "beat": 0,
     "game": "schant",
     "who": "ben",
     "en": "I sit. I zip.",
     "scene": "공이 통통 튀며 박자를 준다. 낱말 자리에서 목소리가 켜지면 공이 그 물건 위로 한 번 튄다.",
     "end": "공이 내 품으로 폭."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "kid",
     "show": [
      "<kit>",
      "<kid>"
     ],
     "en": "This is my kit.",
     "act": {
      "do": "bring",
      "word": "kit",
      "to": "kid"
     },
     "react": "아이가 상자를 흔들어 본다 — 안에서 달그락.",
     "leads": "zipzip"
    },
    {
     "arrive": "read",
     "from": "kid",
     "show": [
      "<zip>",
      "<lid>"
     ],
     "en": "I zip. I hit the lid!",
     "act": {
      "do": "match",
      "pairs": [
       "zip",
       "lid"
      ]
     },
     "react": "뚜껑이 한 번 크게 들썩인다.",
     "leads": "drum"
    },
    {
     "arrive": "write",
     "from": "mom",
     "sign": "국자 그림자",
     "show": [
      "{pot}"
     ],
     "en": "Hi, kid! I see you!",
     "act": {
      "do": "go",
      "by": "door"
     },
     "react": "문틈의 주황빛이 넓어진다. 문이 열렸으면 부엌 화덕으로, 아직이면 냄비 끓는 소리만.",
     "leads": "B07"
    }
   ],
   "guest": {
    "who": "kid",
    "enter": "아이가 등 뒤에 무엇을 숨기고 살금살금 온다. 손등에 낱말 딱지 하나.",
    "turns": [
     {
      "read": "hid",
      "pool": [
       "fit",
       "pit",
       "dip"
      ],
      "opens": "읽으면 아이가 등 뒤에 숨긴 공을 짠 하고 내민다."
     },
     {
      "show": "big",
      "cards": [
       "big",
       "dig",
       "pig"
      ],
      "ans": "big",
      "why": "첫 글자 b·d·p — 배의 방향과 막대의 길이(p 는 땅속으로)"
     },
     {
      "say": "This is my kit.",
      "cue": "아이가 제 상자를 끌어안고 내 상자를 가리킨다"
     }
    ],
    "bye": "북채 하나를 건네고 같이 둥 — 부엌 문을 열어 준다."
   },
   "job": {
    "who": "amy",
    "ask": "상자의 빈 이름표를 가리키고 내 캐릭터를 가리킨다.",
    "write": [
     "sit",
     "zip",
     "kid",
     "lid"
    ],
    "plan": {
     "meet": [
      "sit"
     ],
     "write": [
      "zip",
      "kid",
      "lid"
     ]
    },
    "carry": [
     "pig",
     "win"
    ],
    "gives": "상자에 아이 글씨 이름표 — 상자가 선반 내 칸으로 올라간다. 놀이방 등이 켜진다."
   }
  },
  "B07": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-wood",
    "sound": "화덕 장작 타닥 + 냄비 보글",
    "center": "같은 부엌의 화덕 쪽 벽. 화덕 위에 큰 냄비 — 뒤로 낮에 본 식탁과 냉장고(내가 쓴 쪽지가 붙어 있다)가 보인다",
    "props": {
     "pot": [
      "center",
      "화덕 위 큰 냄비(숲의 문어 연못에서 본 냄비) — 누르면 뚜껑이 달그락"
     ],
     "hot": [
      "with:pot",
      "뜨겁다 — 누르면 냄비가 빨갛게 달아오르고 김이 뿜"
     ],
     "mom": [
      "Ld",
      "앞치마를 두른 엄마 — 누르면 국자를 흔든다"
     ],
     "dot": [
      "Lc",
      "바닥에 점점이 튄 자국 — 누르면 점이 하나씩 톡톡 빛난다"
     ],
     "top": [
      "Rd",
      "팽이(숲의 바닷가 천막에서 돌던 것) — 누르면 뱅그르르"
     ],
     "hop": [
      "Rc",
      "깡충 발판 — 누르면 내 캐릭터가 한 발로 깡충"
     ],
     "mop": [
      "Rb",
      "대걸레 — 누르면 혼자 한 바퀴 쓱"
     ],
     "pop": [
      "Ra",
      "옥수수 바구니 — 누르면 팡 하고 한 알이 튄다"
     ]
    },
    "more": {
     "cot": "구석의 접이 침대에서 고양이가 하품한다",
     "lot": "찬장 안에 옥수수가 한가득 — 문틈으로 한 알이 또르르",
     "cop": "창밖을 지나던 순찰 아저씨가 냄새에 모자를 살짝 든다"
    },
    "sight": {
     "good": "엄마의 엄지 — 냄비 받침 쪽지의 통말 딱지. 누르면 엄마가 엄지를 척"
    },
    "wear": {
     "slide": "기울여 건 긴 국자 — 글자 옥수수 알 셋이 미끄러져 그릇에서 붙는다",
     "wheel": "냄비 뚜껑 돌리기 — 손잡이 둘레에 첫 글자",
     "rhyme": "화덕 위 국자 걸이 — 끝소리가 같은 그림 둘을 한 고리에",
     "belt": "조리대 배식 창(낮의 부엌과 같은 것 — 저녁 빛)",
     "hidden": "냄비 뚜껑 셋 — /o/ 가 숨은 뚜껑을 열면 김이 뿜",
     "sbox": "화덕 앞 타일 세 칸",
     "lpath": "냄비 받침 밑 쪽지"
    },
    "hiddenNo": [
     "cat",
     "hen",
     "pig",
     "bed"
    ],
    "extras": [
     "화덕 장작",
     "국자 걸이",
     "찬장",
     "접이 침대",
     "창밖 초저녁 길"
    ],
    "life": [
     "냄비 김",
     "팡팡 튀는 옥수수",
     "화덕 불빛",
     "대걸레 춤",
     "창밖에 뜨는 첫 별"
    ],
    "ink": {
     "at": "frame",
     "on": "냄비 받침 쪽지(네 줄)",
     "lines": 4
    },
    "beat": "옥수수가 팡팡 — 나무 숟가락이 냄비 가장자리를 친다",
    "way": {
     "by": "lane",
     "sees": "새벽 안개가 낀 숲 가장자리 — 개구리 소리와 물 냄새"
    }
   },
   "events": [
    {
     "id": "hotpot",
     "name": "뜨거운 냄비",
     "beat": 1,
     "game": "schant",
     "who": "amy",
     "en": "The pot is hot!",
     "scene": "엄마가 화덕에 냄비를 올린다. 챈트 박자마다 김이 뿜 — hot 자리에서 목소리가 켜지면 냄비가 빨갛게 달아오른다.",
     "end": "뚜껑이 달그락달그락 — 무언가 튀려고 한다."
    },
    {
     "id": "popcorn",
     "name": "팡팡 옥수수",
     "beat": 2,
     "game": "sbox",
     "who": "ben",
     "en": "Pop! Pop! A dot!",
     "scene": "낱말을 듣고 타일 세 칸에 글자를 놓는다. 다 놓으면 옥수수가 팡 — 한 알이 바닥에 떨어져 점이 된다.",
     "end": "바닥이 점투성이. 팽이가 그 사이를 돈다."
    },
    {
     "id": "dinner",
     "name": "맛있는 저녁",
     "beat": 3,
     "game": "talk",
     "who": "mina",
     "en": "Good! Good!",
     "scene": "대걸레로 쓱 닦고 팽이처럼 한 바퀴. 엄마가 두 팔을 벌리고 서 있다 — 아이가 엄마를 소개한다.",
     "end": "저녁상이 차려지고 화덕 불이 잦아든다."
    },
    {
     "id": "lidspin",
     "name": "뚜껑 돌리기",
     "beat": 0,
     "game": "wheel",
     "who": "ben",
     "en": "Wow! Hot!",
     "scene": "냄비 뚜껑을 돌려 첫 글자를 바꾼다. 진짜 낱말이 되면 그것이 부엌에서 한 번 움직인다.",
     "end": "뚜껑이 제자리에 딱 맞는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "mom",
     "show": [
      "<pot>",
      "<pop>"
     ],
     "en": "The pot is hot!",
     "act": {
      "do": "say",
      "line": "The pot is hot!",
      "tap": "pot"
     },
     "react": "냄비 뚜껑이 들썩이고 옥수수 한 알이 먼저 팡.",
     "leads": "popcorn"
    },
    {
     "arrive": "read",
     "from": "mom",
     "show": [
      "<mop>"
     ],
     "en": "I see a dot! I see a mop!",
     "act": {
      "do": "find",
      "word": "mop"
     },
     "react": "대걸레가 혼자 한 바퀴 춤을 춘다.",
     "leads": "dinner"
    },
    {
     "arrive": "write",
     "from": "fox",
     "sign": "안개 속 뾰족한 귀 그림자",
     "show": [
      "{box}"
     ],
     "en": "Hi! I see you!",
     "act": {
      "do": "go",
      "by": "lane"
     },
     "react": "뒷문 유리에 김이 서린다. 문이 열렸으면 새벽 길로, 아직이면 개구리 소리만.",
     "leads": "B08"
    }
   ],
   "guest": {
    "who": "mom",
    "enter": "엄마가 잠긴 찬장 앞에서 낱말 쪽지를 흔든다 — 열쇠 말이다.",
    "turns": [
     {
      "read": "lot",
      "pool": [
       "cot",
       "cop"
      ],
      "opens": "읽으면 찬장이 열리고 옥수수가 한가득 쏟아질 듯."
     },
     {
      "show": "hat",
      "cards": [
       "hat",
       "hot",
       "hit"
      ],
      "ans": "hat",
      "why": "가운데 a·o·i — 거실의 hat · 화덕의 hot · 놀이방의 hit"
     },
     {
      "say": "This is my mom.",
      "cue": "엄마가 두 팔을 벌린다"
     }
    ],
    "bye": "엄마가 꼭 안아 주고 그릇에 옥수수를 담아 준다 — 뒷문 등이 켜진다."
   },
   "job": {
    "who": "mom",
    "ask": "냄비 받침 밑에서 빈 쪽지를 꺼내 보이고 저녁상을 가리킨다.",
    "write": [
     "hot",
     "pot",
     "hop",
     "mom"
    ],
    "plan": {
     "meet": [
      "pot"
     ],
     "write": [
      "hot",
      "hop",
      "mom"
     ]
    },
    "carry": [
     "kid",
     "zip"
    ],
    "gives": "쪽지에 아이 글씨 넷 — 엄마가 냉장고의 낮 쪽지 옆에 나란히 붙인다. 화덕 위 등이 켜진다."
   }
  },
  "B08": {
   "room": {
    "kind": "out",
    "owner": "ben",
    "rig": "morning",
    "weather": "mist",
    "accent": "--a-cream",
    "sound": "개구리 소리 + 물 찰랑",
    "center": "안개 낀 연못과 물가에 걸친 긴 통나무. 통나무 위에 누군가의 그림자",
    "props": {
     "log": [
      "center",
      "물가의 긴 통나무 — 누르면 통 하고 울린다"
     ],
     "fog": [
      "back",
      "연못 위 안개 띠 — 누르면 후 걷혔다가 다시 낀다"
     ],
     "dog": [
      "Ld",
      "강아지(내 방의 그 강아지) — 누르면 멍"
     ],
     "jog": [
      "with:dog",
      "종종 달리기 — 누르면 강아지가 제자리에서 종종종"
     ],
     "fox": [
      "Rc",
      "여우(숲의 폭포에서 기웃거리던 여우) — 이야기 ② 전에는 통나무 위 그림자"
     ],
     "nod": [
      "with:fox",
      "끄덕 — 누르면 여우가 고개를 끄덕"
     ],
     "box": [
      "Rd",
      "여우의 상자(숲의 거미줄 다리 건너에 있던 상자) — 누르면 덜컹"
     ],
     "rod": [
      "Rb",
      "낚싯대 — 찌가 물 위에서 까딱"
     ]
    },
    "more": {
     "hog": "덤불에서 멧돼지 코가 킁 하고 나왔다 들어간다",
     "pod": "물가의 콩깍지가 톡 벌어진다",
     "cob": "상자 틈으로 옥수수 속대가 삐죽",
     "sob": "여우가 코를 한 번 훌쩍(곧 웃는다)"
    },
    "sight": {
     "go": "길 팻말의 화살표 딱지 — 누르면 강아지가 그쪽으로 달린다",
     "here": "통나무 위 발자국 표시 딱지 — 누르면 내 캐릭터가 발을 탁 딛는다",
     "no": "누르면 여우가 고개를 가로젓는다(아닌 척)"
    },
    "wear": {
     "slide": "물가로 기운 통나무 비탈 — 글자 조약돌 셋이 미끄러져 물가에서 붙는다",
     "wheel": "물레방아 — 물받이마다 첫 글자",
     "rhyme": "낚싯줄 — 끝소리가 같은 그림 둘을 한 줄에 꿴다",
     "belt": "물길에 떠가는 연잎 — 낱말 연잎이 흘러오고 맞는 그림 바위에 댄다",
     "hidden": "안개 덤불 셋 — /o/ 가 숨은 덤불을 톡톡 하면 안개가 걷힌다",
     "sbox": "연못 징검돌 셋",
     "lpath": "연못 팻말 — 젖은 나무에 손가락 자국"
    },
    "hiddenNo": [
     "cat",
     "hen",
     "pig",
     "sun"
    ],
    "extras": [
     "물레방아",
     "안개 덤불 셋",
     "연잎",
     "낚시 의자",
     "길 팻말"
    ],
    "life": [
     "피어오르는 안개",
     "통나무 위 개구리 소리",
     "달리는 강아지",
     "낚싯대 찌",
     "연잎 위를 구르는 물방울"
    ],
    "ink": {
     "at": "frame",
     "on": "연못 팻말(네 줄)",
     "lines": 4
    },
    "beat": "개구리가 개굴 — 찌가 박자에 퐁",
    "way": {
     "by": "lane",
     "sees": "안개가 걷힌 마당 — 해가 쨍하고 깔개가 펴져 있다"
    }
   },
   "events": [
    {
     "id": "whoisit",
     "name": "안개 속 누구?",
     "beat": 1,
     "game": "wheel",
     "who": "ben",
     "en": "A dog! A log! Oh!",
     "scene": "통나무 위에 누가 있다. 물레방아를 돌려 낱말을 읽어 낼 때마다 안개가 한 겹 걷히고 그림자가 조금 또렷해진다 — 강아지일까?",
     "end": "그림자의 귀가 뾰족하다."
    },
    {
     "id": "itsafox",
     "name": "여우다!",
     "beat": 2,
     "game": "slide",
     "who": "amy",
     "en": "No! It is a fox! Go, dog, go!",
     "scene": "안개가 걷히니 여우 — 상자를 물고 달아난다. 통나무 비탈에서 낱말이 붙을 때마다 강아지가 한 걸음씩 따라붙는다.",
     "end": "여우가 상자를 놓쳐 연못에 풍덩."
    },
    {
     "id": "pondsign",
     "name": "연못 팻말",
     "beat": 3,
     "game": "wjob",
     "who": "mina",
     "en": "The box is here!",
     "scene": "상자가 물에 잠겼다. 팻말에 낱말을 쓸 때마다 낚싯대가 한 뼘씩 내려가 상자를 건다.",
     "end": "상자가 올라온다 — 여우가 고개를 끄덕인다."
    },
    {
     "id": "lilycards",
     "name": "연잎 카드",
     "beat": 0,
     "game": "readaloud",
     "who": "ben",
     "en": "I go! I jog!",
     "scene": "연잎마다 낱말 카드. 소리 내어 읽으면 그 연잎에 개구리가 올라앉는다.",
     "end": "개구리들이 한꺼번에 개굴."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "dog",
     "show": [
      "<dog>",
      "<log>"
     ],
     "en": "The dog is here.",
     "act": {
      "do": "match",
      "pairs": [
       "dog",
       "log"
      ]
     },
     "react": "통나무 위 그림자가 귀를 쫑긋 — 뾰족하다.",
     "leads": "itsafox"
    },
    {
     "arrive": "read",
     "from": "fox",
     "show": [
      "<rod>",
      "<box>"
     ],
     "en": "No! No! My box!",
     "act": {
      "do": "bring",
      "word": "rod",
      "to": "dog"
     },
     "react": "강아지가 낚싯대를 물고 물가에 선다.",
     "leads": "pondsign"
    },
    {
     "arrive": "write",
     "from": "mom",
     "sign": "빵 바구니 그림자",
     "show": [
      "{sun}"
     ],
     "en": "Hi! The sun is here!",
     "act": {
      "do": "go",
      "by": "lane"
     },
     "react": "안개 너머가 환해진다. 문이 열렸으면 마당으로, 아직이면 해가 구름 뒤에서 기다린다.",
     "leads": "B09"
    }
   ],
   "guest": {
    "who": "fox",
    "enter": "여우가 건져 낸 상자를 안고 온다. 상자 자물쇠에 낱말 하나.",
    "turns": [
     {
      "read": "pod",
      "pool": [
       "hog",
       "cob",
       "sob"
      ],
      "opens": "읽으면 상자가 열린다 — 콩깍지와 옥수수, 나눠 먹을 간식."
     },
     {
      "show": "top",
      "cards": [
       "top",
       "tip",
       "tap"
      ],
      "ans": "top",
      "why": "가운데 o·i·a — 화덕의 top · 놀이방의 tip · 부엌의 tap"
     },
     {
      "say": "The dog is here.",
      "cue": "강아지가 달려와 여우 옆에 앉는다"
     }
    ],
    "bye": "여우가 끄덕 하고 콩 한 알을 강아지에게 준다 — 안개가 다 걷힌다."
   },
   "job": {
    "who": "ben",
    "ask": "물가의 빈 팻말을 세우고 낚싯대를 내밀어 보인다.",
    "write": [
     "dog",
     "fox",
     "box",
     "log"
    ],
    "plan": {
     "meet": [
      "dog"
     ],
     "write": [
      "fox",
      "box",
      "log"
     ]
    },
    "carry": [
     "pot",
     "mom"
    ],
    "gives": "팻말에 아이 글씨 넷 — 연못에 이름이 생긴다. 낚시 의자 옆 등이 켜진다."
   }
  },
  "B09": {
   "room": {
    "kind": "out",
    "owner": "amy",
    "rig": "day",
    "weather": "clear",
    "accent": "--a-gold",
    "sound": "한낮 매미 + 풀잎 스치는 소리",
    "center": "해가 쨍한 잔디 마당. 가운데 큰 나무 그늘",
    "props": {
     "sun": [
      "winL",
      "하늘의 해(숲의 바닷가에서 본 해) — 누르면 햇살이 한 번 크게"
     ],
     "run": [
      "Lc",
      "달리기 출발선 — 누르면 내 캐릭터가 한 바퀴 달리고 온다"
     ],
     "bun": [
      "Ld",
      "바구니 속 둥근 빵 — 누르면 김이 솔솔"
     ],
     "fun": [
      "Lb",
      "비눗방울 통과 바람개비 — 누르면 방울이 터지며 다 같이 까르르"
     ],
     "rug": [
      "Rd",
      "잔디 위에 편 깔개 — 바람에 한 귀퉁이가 펄럭"
     ],
     "mug": [
      "Rc",
      "김 나는 컵 — 누르면 김이 한 줄"
     ],
     "bug": [
      "Rb",
      "줄지어 가는 벌레 다섯 마리 — 누르면 맨 앞이 더듬이를 흔든다"
     ],
     "hug": [
      "Ra",
      "마당 의자의 엄마 — 누르면 내 캐릭터가 달려가 꼭 안긴다"
     ]
    },
    "more": {
     "jug": "탁자 위 물병(숲의 얼음 골짜기에서 본 것)에서 얼음이 달그락",
     "tug": "나무에 맨 줄이 한 번 팽팽해진다",
     "dug": "강아지가 파 놓은 작은 구덩이에서 뼈다귀가 삐죽",
     "gum": "풍선껌 풍선이 부풀었다 폭"
    },
    "sight": {
     "one": "벌레 등딱지의 점 하나 — 깃발 줄의 수 딱지",
     "two": "점 둘",
     "three": "점 셋",
     "four": "점 넷",
     "five": "점 다섯 — 누르면 벌레 다섯이 차례로 one 부터 five 까지 손을 든다"
    },
    "wear": {
     "slide": "마당 미끄럼틀 — 글자 공 셋이 타고 내려와 모래밭에서 붙는다",
     "wheel": "바람개비 — 날개마다 첫 글자",
     "rhyme": "빨랫줄 — 끝소리가 같은 그림 둘을 나란히 넌다",
     "belt": "벌레 행렬 길 — 벌레들이 낱말 잎사귀를 지고 오고 맞는 그림 돌에 내려놓는다",
     "hidden": "엎어 놓은 컵 셋 — /u/ 가 숨은 컵을 톡 하면 김이 뿜",
     "sbox": "깔개의 네모 무늬 세 칸",
     "lpath": "마당 깃발 천"
    },
    "hiddenNo": [
     "cat",
     "hen",
     "pig",
     "dog"
    ],
    "extras": [
     "마당 미끄럼틀",
     "빨랫줄",
     "바람개비",
     "깃발 줄",
     "큰 나무 그늘"
    ],
    "life": [
     "해와 그림자",
     "줄지어 가는 벌레",
     "컵의 김",
     "펄럭이는 깔개",
     "떠다니는 비눗방울"
    ],
    "ink": {
     "at": "frame",
     "on": "마당 깃발(네 줄)",
     "lines": 4
    },
    "beat": "벌레들의 작은 발소리(작은 북) — 깔개 귀퉁이가 박자에 펄럭",
    "way": {
     "by": "door",
     "sees": "집 뒷문 — 진흙 발자국이 욕실 쪽으로 이어진다"
    }
   },
   "events": [
    {
     "id": "picnic",
     "name": "깔개 펴기",
     "beat": 1,
     "game": "readaloud",
     "who": "amy",
     "en": "The sun! A bun! A rug!",
     "scene": "마당에 해가 쨍. 낱말 카드를 소리 내어 읽을 때마다 깔개 위에 물건이 하나씩 차려진다 — 빵, 컵, 비눗방울 통.",
     "end": "빵 냄새에 풀숲이 바스락거린다."
    },
    {
     "id": "fivebugs",
     "name": "벌레 다섯",
     "beat": 2,
     "game": "rhyme",
     "who": "ben",
     "en": "One, two, three, four, five! A bug!",
     "scene": "벌레들이 빵으로 온다. 빨랫줄에 끝소리 짝을 널 때마다 벌레 한 마리가 줄에 선다 — 하나, 둘, 셋…",
     "end": "다섯 마리가 깔개 앞에 나란히."
    },
    {
     "id": "crumbs",
     "name": "빵 나누기",
     "beat": 3,
     "game": "sbox",
     "who": "mina",
     "en": "I run! Fun! Fun!",
     "scene": "깔개 세 칸에 글자를 놓아 낱말을 만들면 빵 부스러기 한 조각이 벌레에게 간다. 다섯 마리가 다 받으면 출발선에 선다.",
     "end": "다 같이 달리기 — 비눗방울이 뒤따라온다."
    },
    {
     "id": "mugs",
     "name": "컵 셋",
     "beat": 0,
     "game": "hidden",
     "who": "ben",
     "en": "Listen! A mug!",
     "scene": "엎어 놓은 컵 셋. 들린 낱말에 /u/ 가 있으면 그 컵을 톡 — 김이 뿜. 없으면 컵이 딸깍 고개를 젓는다.",
     "end": "컵 셋이 다시 엎어져 줄을 선다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "mom",
     "show": [
      "<sun>",
      "<bun>"
     ],
     "en": "The sun is hot!",
     "act": {
      "do": "say",
      "line": "The sun is hot!",
      "tap": "sun"
     },
     "react": "엄마가 차양을 펴 준다. 풀숲에서 더듬이 한 쌍이 쏙.",
     "leads": "fivebugs"
    },
    {
     "arrive": "read",
     "from": "bug",
     "show": [
      "<bun>",
      "<bug>"
     ],
     "en": "A bun! A bug! Yum!",
     "act": {
      "do": "bring",
      "word": "bun",
      "to": "bug"
     },
     "react": "벌레들이 더듬이를 흔들고 깔개 쪽으로 방향을 튼다.",
     "leads": "crumbs"
    },
    {
     "arrive": "write",
     "from": "dog",
     "sign": "진흙 발자국",
     "show": [
      "{bus}"
     ],
     "en": "Hi! I run! I see you!",
     "act": {
      "do": "go",
      "by": "door"
     },
     "react": "뒷문에 진흙 발자국이 찍힌다. 문이 열렸으면 욕실로, 아직이면 물 받는 소리만.",
     "leads": "B10"
    }
   ],
   "guest": {
    "who": "bug",
    "enter": "벌레 다섯의 대장이 보자기 덮인 작은 수레를 끌고 온다. 보자기 매듭에 낱말 하나.",
    "turns": [
     {
      "read": "jug",
      "pool": [
       "tug",
       "dug",
       "gum"
      ],
      "opens": "읽으면 보자기가 스르르 — 얼음 든 물병이 나온다."
     },
     {
      "show": "bag",
      "cards": [
       "bag",
       "bug",
       "big"
      ],
      "ans": "bag",
      "why": "가운데 a·u·i — 부엌의 bag · 마당의 bug · 돼지우리의 big"
     },
     {
      "say": "I hug my mom.",
      "cue": "벌레 대장이 엄마 벌레를 꼭 안고, 엄마가 나를 향해 팔을 벌린다"
     }
    ],
    "bye": "다섯이 하나, 둘, 셋 — 출발선으로 달려가고 뒷문 위 등이 켜진다."
   },
   "job": {
    "who": "amy",
    "ask": "깃발 줄의 빈 깃발을 펼쳐 들고 바람에 날려 보인다.",
    "write": [
     "sun",
     "run",
     "bug",
     "hug"
    ],
    "plan": {
     "meet": [
      "sun"
     ],
     "write": [
      "run",
      "bug",
      "hug"
     ]
    },
    "carry": [
     "dog",
     "box"
    ],
    "gives": "깃발에 아이 글씨 넷 — 깃발 줄에 걸려 펄럭인다. 마당 등이 켜진다."
   }
  },
  "B10": {
   "room": {
    "kind": "both",
    "owner": "amy",
    "rig": "evening",
    "weather": "clear",
    "accent": "--a-steel",
    "sound": "욕조 물 받는 소리 + 멀리 버스",
    "center": "왼쪽은 타일 욕실, 오른쪽은 집 앞 정류장. 가운데 문턱에 거품 가득한 욕조",
    "props": {
     "tub": [
      "center",
      "거품 욕조 — 누르면 거품이 뽀글"
     ],
     "pup": [
      "with:tub",
      "진흙투성이 강아지(내 방의 강아지 — 아직 어린 강아지다) — 누르면 꼬리를 흔들어 거품이 튄다"
     ],
     "cup": [
      "Lc",
      "물 끼얹는 컵(숲의 찻집에서 본 컵) — 누르면 물이 쪼르르"
     ],
     "mud": [
      "Lb",
      "문간의 진흙 발자국 — 누르면 철벅"
     ],
     "bus": [
      "Re",
      "정류장에 서는 버스(숲의 통나무 버스가 마을 버스가 되었다) — 누르면 깜빡이"
     ],
     "hut": [
      "winR",
      "멀리 언덕 위 오두막 불빛 — 누르면 창이 환해진다"
     ],
     "nut": [
      "Rc",
      "간식 도토리 자루(숲의 달빛 둥지 도토리) — 누르면 한 알이 데굴"
     ],
     "cut": [
      "with:nut",
      "반으로 자르기 — 누르면 도토리가 딱 하고 반쪽이 된다"
     ]
    },
    "more": {
     "cub": "오두막 창에 아기 곰 그림자가 손을 흔든다",
     "rub": "수건이 강아지 등을 쓱쓱 문지른다",
     "up": "거품 하나가 위로 둥실 떠오른다",
     "bud": "정류장 화단의 꽃봉오리가 살짝 벌어진다"
    },
    "wear": {
     "slide": "욕조 가장자리 물 미끄럼 — 글자 비누 셋이 미끄러져 대야에서 붙는다",
     "wheel": "수도꼭지 손잡이 — 돌리면 첫 글자가 바뀐다",
     "rhyme": "수건 걸이 — 끝소리가 같은 그림 둘을 한 걸이에",
     "belt": "욕조 물 위를 떠가는 고무 오리 줄 — 오리 등에 낱말, 맞는 그림 대야로 건진다",
     "hidden": "큰 거품 셋 — /u/ 가 숨은 거품을 톡 하면 무지개",
     "sbox": "욕실 타일 세 칸",
     "lpath": "버스 행선판"
    },
    "hiddenNo": [
     "hat",
     "jet",
     "lid",
     "box"
    ],
    "extras": [
     "수건 걸이",
     "고무 오리",
     "정류장 팻말",
     "가로등",
     "화단"
    ],
    "life": [
     "욕조 거품",
     "진흙 발자국",
     "정류장에 서는 버스",
     "흔드는 꼬리",
     "깜박이다 켜지는 가로등"
    ],
    "ink": {
     "at": "frame",
     "on": "버스 행선판(네 줄)",
     "lines": 4
    },
    "beat": "물방울이 똑 — 버스 깜빡이가 박자에",
    "way": {
     "by": "bus",
     "sees": "오두막에서 하룻밤. 아침 버스 창밖으로 개울과 징검돌 셋이 보인다"
    }
   },
   "events": [
    {
     "id": "muddypup",
     "name": "진흙 강아지",
     "beat": 1,
     "game": "slide",
     "who": "amy",
     "en": "Oh! Mud! The pup!",
     "scene": "강아지가 진흙에서 뒹굴고 왔다. 물 미끄럼에서 글자 비누가 붙어 낱말이 될 때마다 진흙 얼룩이 하나씩 씻긴다.",
     "end": "강아지가 욕조 가장자리에 앞발을 올린다."
    },
    {
     "id": "splash",
     "name": "풍덩 욕조",
     "beat": 2,
     "game": "belt",
     "who": "ben",
     "en": "A tub! A cup! The pup!",
     "scene": "욕조에 풍덩. 고무 오리가 낱말을 지고 떠온다 — 글자만 보고 맞는 대야로 건질 때마다 컵이 물을 한 번 끼얹고 거품이 는다.",
     "end": "강아지가 거품 모자를 쓰고 나온다 — 말끔하다."
    },
    {
     "id": "busboard",
     "name": "버스 행선판",
     "beat": 3,
     "game": "wjob",
     "who": "mina",
     "en": "The bus is here!",
     "scene": "깨끗해진 강아지와 정류장에 섰는데 행선판이 비어 버스가 그냥 지나간다. 행선판에 낱말을 쓰면 버스가 돌아와 선다.",
     "end": "버스가 언덕 위 오두막으로 — 창에 불이 켜진다."
    },
    {
     "id": "nutsnack",
     "name": "도토리 간식",
     "beat": 0,
     "game": "talk",
     "who": "ben",
     "en": "A nut! Cut! Yum!",
     "scene": "오두막 간식 시간. Ben 이 도토리를 반으로 잘라 내밀며 한마디 — 아이가 제 것을 말하면 간식이 온다.",
     "end": "도토리 반쪽을 나눠 먹는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "pup",
     "show": [
      "<cup>",
      "<tub>"
     ],
     "en": "I like mud!",
     "act": {
      "do": "match",
      "pairs": [
       "cup",
       "tub"
      ]
     },
     "react": "강아지가 진흙 발로 욕조 가장자리를 톡톡 친다.",
     "leads": "splash"
    },
    {
     "arrive": "read",
     "from": "pup",
     "show": [
      "<bus>"
     ],
     "en": "This is my cup. I see the bus!",
     "act": {
      "do": "find",
      "word": "bus"
     },
     "react": "길 끝에서 버스가 깜빡이를 켠다.",
     "leads": "busboard"
    },
    {
     "arrive": "write",
     "from": "frog",
     "sign": "젖은 물갈퀴 자국",
     "show": [
      "{frog}"
     ],
     "en": "Hi! I see you! Go! Go!",
     "act": {
      "do": "go",
      "by": "bus"
     },
     "react": "버스가 경적을 한 번. 문이 열렸으면 개울로, 아직이면 문을 닫은 채 기다린다(쪽지는 우편함에 남는다).",
     "leads": "B11"
    }
   ],
   "guest": {
    "who": "cub",
    "enter": "언덕 위 오두막에서 아기 곰이 등불을 들고 내려온다. 목걸이 이름표에 낱말 하나.",
    "turns": [
     {
      "read": "cub",
      "pool": [
       "rub",
       "up",
       "bud"
      ],
      "opens": "읽으면 아기 곰이 꾸벅 인사한다 — 제 이름이다. 오두막 문이 열린다."
     },
     {
      "show": "cap",
      "cards": [
       "cap",
       "cup",
       "cop"
      ],
      "ans": "cap",
      "why": "가운데 a·u·o — 부엌의 cap · 욕실의 cup(cop 은 화덕 창밖을 지나던 아저씨)"
     },
     {
      "say": "The bus is here!",
      "cue": "버스가 오두막 앞에 끽 선다"
     }
    ],
    "bye": "도토리를 반으로 잘라 나눠 주고 등불을 길가에 건다."
   },
   "job": {
    "who": "mina",
    "ask": "버스의 빈 행선판을 가리키고 언덕 위 오두막을 가리킨다.",
    "write": [
     "cup",
     "bus",
     "mud",
     "tub"
    ],
    "plan": {
     "meet": [
      "cup"
     ],
     "write": [
      "bus",
      "mud",
      "tub"
     ]
    },
    "carry": [
     "sun",
     "hug"
    ],
    "gives": "행선판에 아이 글씨 넷 — 버스가 서고 문이 열린다. 정류장 가로등이 다 켜진다."
   }
  },
  "B11": {
   "room": {
    "kind": "bridge",
    "owner": "max",
    "rig": "day",
    "weather": "clear",
    "accent": "--a-fish",
    "sound": "개울 물소리 + 물수제비 퐁퐁",
    "center": "개울이 앞뒤로 흐르고 징검돌 셋이 왼쪽 기슭에서 오른쪽 기슭으로 놓였다(읽는 방향). 가운데 돌 자리가 비어 있다 — 모음 돌 다섯이 번갈아 끼워진다. 건너편 기슭에 변신 받침대",
    "stones": [
     [
      -2.2,
      0.4
     ],
     [
      0,
      0.4
     ],
     [
      2.2,
      0.4
     ]
    ],
    "vowels": {
     "a": [
      -3.4,
      3.4
     ],
     "e": [
      -1.7,
      3.4
     ],
     "i": [
      0,
      3.4
     ],
     "o": [
      1.7,
      3.4
     ],
     "u": [
      3.4,
      3.4
     ]
    },
    "spots": {
     "me": [
      -5.6,
      0.4
     ],
     "owner": [
      -5.6,
      -1.6
     ],
     "guide": [
      -5.6,
      2.4
     ],
     "stage": [
      5.6,
      0.4
     ],
     "guest": [
      5.6,
      -1.6
     ],
     "post": [
      -7.2,
      4.2
     ],
     "rail": [
      5.6,
      2.4
     ],
     "door": [
      7.2,
      4.2
     ]
    },
    "models": [
     [
      "B01",
      -7.2
     ],
     [
      "B02",
      -5.6
     ],
     [
      "B03",
      -4
     ],
     [
      "B04",
      -2.4
     ],
     [
      "B05",
      -0.8
     ],
     [
      "B06",
      0.8
     ],
     [
      "B07",
      2.4
     ],
     [
      "B08",
      4
     ],
     [
      "B09",
      5.6
     ],
     [
      "B10",
      7.2
     ]
    ],
    "looks": {
     "cat": "거실의 그 고양이",
     "cot": "고양이가 쏙 들어가 눕는 아기 침대",
     "cut": "가위가 리본을 싹둑 — 고양이가 깜짝",
     "hat": "밀짚모자",
     "hot": "모자에서 김이 오른다 — 뜨거운 찐빵이 되었다",
     "hut": "모자가 부풀어 오두막이 된다",
     "pin": "리본 핀",
     "pen": "핀이 길어져 깃펜",
     "pan": "깃펜이 납작해져 프라이팬",
     "big": "한껏 커진 돼지",
     "bag": "돼지가 쏙 들어간 가방",
     "bug": "가방에서 기어 나온 벌레",
     "beg": "벌레 앞에서 조르는 강아지",
     "pot": "냄비",
     "pet": "냄비에서 귀를 내민 토끼",
     "pit": "토끼가 판 구덩이",
     "tap": "수도꼭지",
     "tip": "물방울이 맺힌 꼭지 끝이 반짝",
     "top": "꼭지가 빙글 돌아 팽이",
     "bed": "빨간 침대",
     "bad": "침대 위에 구겨진 그림 한 장",
     "bud": "구겨진 종이가 펴지며 꽃봉오리",
     "dig": "땅 파는 돼지",
     "dog": "구덩이에서 고개를 내민 강아지",
     "dug": "다 파 놓은 구덩이와 뼈다귀"
    },
    "more": {
     "hip": "내 캐릭터가 엉덩이를 씰룩",
     "jab": "장난감 권투 장갑이 톡",
     "wag": "강아지 꼬리가 살랑살랑",
     "zap": "반딧불이 번쩍",
     "rim": "컵 가장자리가 빙 돌며 반짝",
     "pod": "콩깍지가 톡 벌어진다"
    },
    "extras": [
     "다리 난간의 나무판 셋",
     "물가 조약돌",
     "건너편 등불 길",
     "뒤 언덕의 방 모형 열"
    ],
    "life": [
     "흐르는 개울",
     "바뀌는 가운데 돌",
     "건너편에서 변하는 물건",
     "물수제비",
     "징검돌 옆에서 눈만 내놓은 개구리"
    ],
    "ink": {
     "at": "rail",
     "on": "다리 난간의 나무판 셋",
     "lines": 3
    },
    "beat": "조약돌 두 개를 맞부딪는 소리 — 가운데 돌이 박자에 깜박",
    "way": {
     "by": "bridge",
     "sees": "다리 끝에 등불 하나 — 그림책방 아래층 창"
    }
   },
   "events": [
    {
     "id": "nostone",
     "name": "가운데 돌이 없다",
     "beat": 1,
     "game": "bridge",
     "who": "max",
     "en": "Oh! Listen! Cat! Cot! Cut!",
     "scene": "징검돌 가운데 자리가 비어 건널 수 없다. 낱말을 듣고 맞는 모음 돌을 끼우면 세 돌이 차례로 울리며 합쳐져 한 걸음 건넌다 — 받침대의 고양이가 아기 침대로 변한다.",
     "end": "세 사슬을 건너고 다리 난간에 등이 하나 켜진다."
    },
    {
     "id": "morphtrain",
     "name": "변신 기차",
     "beat": 2,
     "game": "train",
     "who": "ben",
     "en": "A big bag! A big bug!",
     "scene": "천천히 들려준 소리 차례대로 칸을 이으면 받침대의 물건이 변한다 — 돼지가 가방으로, 가방에서 벌레가, 벌레 앞에 조르는 강아지가.",
     "end": "뒤 언덕의 방 모형 창에 불이 하나씩 켜진다."
    },
    {
     "id": "fivestones",
     "name": "다섯 돌",
     "beat": 3,
     "game": "swap",
     "who": "max",
     "en": "It is a big bug!",
     "scene": "가운데 돌만 바꿔 침대가 꽃봉오리로, 돼지가 강아지로. 다섯 모음 돌을 다 쓰면 마지막 징검돌이 물 위로 올라온다.",
     "end": "개울을 건넌다 — 뒤 언덕의 방 열 곳에 불이 다 켜졌다."
    },
    {
     "id": "skipping",
     "name": "물수제비",
     "beat": 0,
     "game": "hidden",
     "who": "amy",
     "en": "Listen! I see it!",
     "scene": "낱말이 들린다. 오늘의 모음이 숨어 있으면 조약돌을 던진다 — 퐁퐁퐁 물수제비. 없으면 돌이 손에서 고개를 젓는다.",
     "end": "물결이 건너편까지 닿는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<cat>",
      "<cot>"
     ],
     "en": "I see a cat. I see a cot!",
     "act": {
      "do": "match",
      "pairs": [
       "cat",
       "cot"
      ]
     },
     "react": "받침대의 고양이가 아기 침대에 쏙 들어갔다가 나온다.",
     "leads": "morphtrain"
    },
    {
     "arrive": "read",
     "from": "frog",
     "show": [
      "<big>",
      "<bug>"
     ],
     "en": "It is a big bug!",
     "act": {
      "do": "say",
      "line": "It is a big bug!",
      "tap": "bug"
     },
     "react": "개구리가 혀를 날름하려다 말고 벌레에게 길을 비켜 준다.",
     "leads": "fivestones"
    },
    {
     "arrive": "write",
     "from": "cat",
     "sign": "책 위의 고양이 발자국",
     "show": [
      "{cat}",
      "<hat>"
     ],
     "en": "Hi! I see you! I like you!",
     "act": {
      "do": "go",
      "by": "bridge"
     },
     "react": "다리 끝 등불이 흔들린다. 문이 열렸으면 다리를 건너 책방으로, 아직이면 마지막 징검돌이 물속에서 기다린다.",
     "leads": "B12"
    }
   ],
   "guest": {
    "who": "frog",
    "enter": "징검돌 옆에서 눈만 내놓던 개구리가 폴짝 올라앉는다. 물속에 잠긴 돌 둘에 낱말이 비친다.",
    "turns": [
     {
      "read": "hip",
      "also": "wag",
      "pool": [
       "jab",
       "zap",
       "rim",
       "pod"
      ],
      "opens": "읽은 돌이 물 위로 떠올라 징검돌이 이어진다(돌 둘 — 처음 보는 낱말 둘)."
     },
     {
      "show": "pet",
      "cards": [
       "pet",
       "pot",
       "pit"
      ],
      "ans": "pet",
      "why": "가운데 e·o·i — 다섯 모음을 한 자리에서 갈아 끼우는 주"
     },
     {
      "say": "It is a big bug!",
      "cue": "큰 벌레가 개구리 등에 올라탄다 — 개구리가 눈을 데굴 굴린다"
     }
    ],
    "bye": "개구리가 마지막 징검돌이 되어 준다 — 폴짝 밟고 건너면 다리 끝 책방 등불이 환해진다."
   },
   "job": {
    "who": "max",
    "ask": "다리 난간의 빈 나무판 셋을 차례로 두드린다.",
    "write": [
     "cat",
     "cot",
     "cut"
    ],
    "plan": {
     "meet": [
      "cat",
      "cot",
      "cut"
     ],
     "write": [
      "pin",
      "pen",
      "pan"
     ]
    },
    "carry": [
     "cup",
     "bus"
    ],
    "rule": "첫 낱말은 다 쓰고, 뒤 둘은 가운데 글자만 갈아 쓴다(나무판의 첫·끝 글자는 그대로 비친다) — 하루 글자 다섯",
    "gives": "난간에 아이 글씨 사슬이 걸린다. 가운데 글자만 색이 다르다. 다리 등이 다 켜진다."
   }
  },
  "B12": {
   "room": {
    "kind": "book",
    "owner": "mina",
    "rig": "lantern",
    "weather": "glow",
    "accent": "--a-wood",
    "sound": "책장 넘기는 소리 + 독서등 지잉",
    "center": "빈 책장 여덟 칸과 독서 의자. 독서등 아래 책 만드는 책상(내 첫 그림책의 빈 쪽 넷)",
    "shelf": [
     [
      -6.3,
      -3.4
     ],
     [
      -4.5,
      -3.4
     ],
     [
      -2.7,
      -3.4
     ],
     [
      -0.9,
      -3.4
     ],
     [
      0.9,
      -3.4
     ],
     [
      2.7,
      -3.4
     ],
     [
      4.5,
      -3.4
     ],
     [
      6.3,
      -3.4
     ]
    ],
    "pages": {
     "I see a cat.": "책방 고양이가 책장 위에서 내려다보며 꼬리를 살랑",
     "I like a dog.": "강아지가 공을 물고 달려온다",
     "It is a pig.": "진흙 속 분홍 등이 고개를 든다 — 돼지다",
     "I am Mina.": "Mina 가 책 속에서 손을 흔든다",
     "I am here.": "내 캐릭터가 책 속 장면에 발을 탁 딛는다",
     "This is my hat.": "모자가 날아와 내 머리 위에 얹힌다",
     "The sun is hot.": "해가 쨍 — 그림 속 아이가 손부채질",
     "My dog is big.": "강아지가 쪽 밖으로 넘칠 만큼 커졌다가 돌아온다"
    },
    "sight": {
     "am": "책상 위 낱말 칩 — I 옆에만 붙는다(I 칩 옆에 놓으면 딸깍, 다른 칩 옆에서는 미끄러진다)"
    },
    "extras": [
     "독서 의자",
     "책 만드는 책상",
     "낱말 칩 서랍",
     "위층으로 가는 계단(아직 어둡다)",
     "창가 화분"
    ],
    "life": [
     "독서등 불빛",
     "넘어가는 책장",
     "창밖 반딧불",
     "졸고 있는 책방 고양이",
     "날아다니던 글자들이 책등으로 돌아와 앉는다"
    ],
    "ink": {
     "at": "frame",
     "on": "내 첫 그림책(네 쪽)",
     "lines": 4
    },
    "beat": "책장을 톡톡 두드리는 소리 — 독서등이 박자에 숨 쉰다",
    "way": {
     "by": "lantern",
     "sees": "책방 문밖으로 등불 길 — 광장에서 북소리"
    }
   },
   "events": [
    {
     "id": "flown",
     "name": "날아간 글자",
     "beat": 1,
     "game": "story",
     "who": "mina",
     "en": "Oh! Listen! I see a cat. I like a dog.",
     "scene": "책장이 텅 비었다 — 책 속 글자가 나비처럼 날아다닌다. 두 문장을 듣고 장면 카드를 차례로 놓으면 글자 나비들이 책장 쪽으로 모인다.",
     "end": "책등 하나가 책장에 꽂힌다."
    },
    {
     "id": "comeback",
     "name": "돌아오는 문장",
     "beat": 2,
     "game": "book",
     "who": "amy",
     "en": "It is a pig. It is big!",
     "scene": "낱말 마당의 낱말들이 문장이 되어 돌아온다. 낱말을 하나씩 짚으며 소리 내어 읽으면 안개가 걷히고 그림이 움직인다.",
     "end": "책장 여섯 칸이 찬다."
    },
    {
     "id": "author",
     "name": "지은이는 나",
     "beat": 3,
     "game": "swrite",
     "who": "mina",
     "en": "I am here. This is my hat!",
     "scene": "책상 위 빈 쪽. 칩으로 문장을 조립하고 그 위에 따라 쓴다 — 쓴 쪽마다 그림이 생긴다.",
     "end": "첫 그림책 한 권이 묶인다 — 표지에 내 캐릭터 이름."
    },
    {
     "id": "sillypage",
     "name": "엉뚱한 쪽",
     "beat": 0,
     "game": "sstory",
     "who": "ben",
     "en": "My dog is big! The sun is hot!",
     "scene": "칩을 마음대로 골라 문장을 만든다 — 만든 문장대로 그림이 엉뚱하게 움직인다.",
     "end": "Ben 이 배를 잡고 웃는다 — 그 쪽이 책갈피에 끼워진다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Mina",
     "show": [
      "<I>",
      "<am>",
      "<here>"
     ],
     "en": "I am Mina. I am here.",
     "act": {
      "do": "say",
      "line": "I am here.",
      "tap": "here"
     },
     "react": "독서등이 한 단 밝아지고 빈 책장 한 칸이 반짝인다.",
     "leads": "comeback",
     "note": "낱말 셋을 하나씩 짚어 읽는다"
    },
    {
     "arrive": "read",
     "from": "cat",
     "show": [
      "<hat>"
     ],
     "en": "This is my hat.",
     "act": {
      "do": "find",
      "word": "hat"
     },
     "react": "고양이가 책 속 모자를 앞발로 톡 쳐서 책상으로 떨어뜨린다.",
     "leads": "author",
     "note": "책 속 장면에서 모자를 찾는다"
    },
    {
     "arrive": "write",
     "from": "Max",
     "show": [
      "{hat}",
      "{map}"
     ],
     "en": "Hi! I am Max. I see you!",
     "act": {
      "do": "go",
      "by": "lantern"
     },
     "react": "문밖 등불이 하나씩 켜진다. 문이 열렸으면 등불 길로, 아직이면 북소리만.",
     "leads": "B13"
    }
   ],
   "guest": {
    "who": "cat",
    "enter": "졸던 책방 고양이가 책장에서 내려와 책 한 권을 앞발로 누른다. 표지에 문장 하나.",
    "turns": [
     {
      "read": "The cat is here.",
      "pool": [
       "The dog is big.",
       "My hat is red."
      ],
      "opens": "읽으면 고양이가 앞발을 뗀다 — 책이 펼쳐지고 그 안에 고양이 그림."
     },
     {
      "show": "hen",
      "cards": [
       "It is a hen.",
       "It is a pen.",
       "I am a hen."
      ],
      "ans": "It is a hen.",
      "why": "「It is」와 「I am」 — 누구 이야기인지가 첫 두 낱말에서 갈린다(+ 첫 글자 h·p)"
     },
     {
      "say": "I am here.",
      "cue": "고양이가 책의 빈 쪽을 앞발로 톡톡 친다 — 내 자리"
     }
    ],
    "bye": "고양이가 완성된 책을 책장에 밀어 넣고 그 위에 눕는다."
   },
   "job": {
    "who": "Mina",
    "ask": "빈 쪽 넷이 묶인 책을 펼쳐 보이고 연필을 내민다.",
    "write": [
     "I see a cat.",
     "I am here.",
     "This is my hat.",
     "My dog is big."
    ],
    "plan": {
     "meet": [
      "I see a cat."
     ],
     "read": [
      "I am here."
     ],
     "write": [
      "This is my hat."
     ],
     "again": [
      "My dog is big."
     ]
    },
    "carry": [],
    "rule": "쪽마다 칩으로 조립한 뒤 그 위에 따라 쓴다 — 하루에 한 쪽(문장 하나)",
    "gives": "네 쪽짜리 내 첫 그림책 — 책장 아홉째 칸에 꽂힌다. 위층 계단에 불이 켜진다."
   }
  },
  "B13": {
   "room": {
    "kind": "festival",
    "owner": "mina",
    "rig": "lantern",
    "weather": "glow",
    "accent": "--a-gold",
    "sound": "멀리 북소리 + 등불 타는 소리",
    "center": "광장 한가운데 깃대. 깃대에서 사방으로 깃발 줄 넷(문장 틀 넷). 오른쪽 뒤로 안개 낀 마을 길",
    "ring": [
     [
      "rat",
      "B01",
      [
       -7,
       -0.3
      ]
     ],
     [
      "dad",
      "B02",
      [
       -6.3,
       -2
      ]
     ],
     [
      "vet",
      "B03",
      [
       -4.9,
       -3.2
      ]
     ],
     [
      "dog",
      "B04",
      [
       -3.2,
       -4
      ]
     ],
     [
      "pig",
      "B05",
      [
       -4.4,
       -0.6
      ]
     ],
     [
      "kid",
      "B06",
      [
       -2.6,
       -1.6
      ]
     ],
     [
      "mom",
      "B07",
      [
       2.6,
       -1.6
      ]
     ],
     [
      "fox",
      "B08",
      [
       4.4,
       -0.6
      ]
     ],
     [
      "bug",
      "B09",
      [
       3.2,
       -4
      ]
     ],
     [
      "cub",
      "B10",
      [
       4.9,
       -3.2
      ]
     ],
     [
      "frog",
      "B11",
      [
       6.3,
       -2
      ]
     ],
     [
      "cat",
      "B12",
      [
       7,
       -0.3
      ]
     ]
    ],
    "extras": [
     "깃대와 깃발 줄 넷",
     "등불 수레",
     "뒤 언덕에 등불을 든 숲 친구 열셋의 그림자",
     "마을 길의 안개",
     "긴 나무 의자"
    ],
    "life": [
     "떠오르는 등불",
     "줄줄이 깃발",
     "춤추는 동물들",
     "걷히는 안개",
     "깃대 꼭대기에서 도는 바람개비"
    ],
    "ink": {
     "at": "center",
     "on": "축제 깃발(내 문장 한 줄)",
     "lines": 1
    },
    "beat": "방 열 곳의 박자 소리가 줄마다 번갈아 — 선풍기·잼 병·빗방울·꼬리·진흙·공·옥수수·개구리·벌레 발소리·물방울",
    "way": {
     "by": "road",
     "sees": "안개가 걷힌 마을 길 끝에 간판이 지워진 가게 하나 — 점심 가게"
    }
   },
   "events": [
    {
     "id": "lanterntrain",
     "name": "등불 기차",
     "beat": 1,
     "game": "wtrain",
     "who": "max",
     "en": "I see a cat! I see a hat!",
     "scene": "칸마다 그림 하나를 실은 긴 기차 — 숲과 마당의 낱말이 섞여 있다. 이름을 부르면 그 칸의 등불이 켜진다.",
     "end": "기차가 광장을 한 바퀴 돌아 깃대 아래 선다."
    },
    {
     "id": "flagread",
     "name": "깃발 읽기",
     "beat": 2,
     "game": "book",
     "who": "mina",
     "en": "I like the hat! It is my map!",
     "scene": "친구들이 저마다 문장 깃발을 들었다. 소리 내어 읽으면 그 친구가 깃발을 흔들며 춤춘다.",
     "end": "열두 친구가 다 춤춘다."
    },
    {
     "id": "myflag",
     "name": "내 문장 깃발",
     "beat": 3,
     "game": "gvend",
     "who": "sam",
     "en": "This is my dog. I like the sun!",
     "scene": "광장 끝에서 낯선 요리사(Sam)가 문장 자판기 수레를 끌고 온다. 틀 칩과 낱말 칩으로 내 문장을 만들어 말하고, 깃발에 쓴다.",
     "end": "깃발이 줄에 걸리고 등불이 떠오른다 — 마을 쪽 안개가 걷힌다."
    },
    {
     "id": "sillyflag",
     "name": "엉뚱한 깃발",
     "beat": 0,
     "game": "sstory",
     "who": "ben",
     "en": "It is a big pig! It is my hat!",
     "scene": "칩을 마음대로 골라 문장을 만든다 — 그 문장대로 광장에서 엉뚱한 일이 벌어진다(큰 돼지가 내 모자를 쓴다).",
     "end": "Ben 이 그 깃발을 제 등에 꽂고 달린다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<fox>",
      "<sun>"
     ],
     "en": "I see a fox. I like the sun.",
     "act": {
      "do": "match",
      "pairs": [
       "fox",
       "sun"
      ]
     },
     "react": "여우 등불과 해 등불이 깃발 줄에 나란히 걸린다.",
     "leads": "flagread"
    },
    {
     "arrive": "read",
     "from": "Mina",
     "show": [
      "<dog>"
     ],
     "en": "This is my dog.",
     "act": {
      "do": "say",
      "line": "This is my dog.",
      "tap": "dog"
     },
     "react": "강아지가 달려와 내 옆에 앉는다 — 목에 작은 깃발.",
     "leads": "myflag"
    },
    {
     "arrive": "write",
     "from": "Sam",
     "show": [
      "{fish}"
     ],
     "en": "Hi! I am Sam. I like fish!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "마을 길의 안개가 걷힌다. 문이 열렸으면 마을로, 아직이면 길 끝 가게에 불만 하나.",
     "leads": "C01"
    }
   ],
   "guest": {
    "who": "Mina",
    "enter": "Mina 가 등불을 들고 깃대 아래로 오고, 열두 친구가 뒤에 반원으로 선다. Mina 의 깃발에 문장 하나.",
    "turns": [
     {
      "read": "The fox is here.",
      "pool": [
       "My pig is big.",
       "I like the bus."
      ],
      "opens": "읽으면 그 친구(여우)가 앞으로 나와 인사한다."
     },
     {
      "show": "map",
      "cards": [
       "It is my map.",
       "It is my mat.",
       "It is my man."
      ],
      "ans": "It is my map.",
      "why": "끝 글자 p·t·n — 부엌에서 가른 짝이 문장 속에서 돌아온다"
     },
     {
      "say": "I see a fox.",
      "alt": "This is my dog.",
      "cue": "등불 둘(여우·강아지) 가운데 하나를 가리킨다"
     }
    ],
    "bye": "Mina 가 등불을 높이 든다 — 안개가 걷히고 마을 길이 보인다."
   },
   "job": {
    "who": "Mina",
    "ask": "깃대 아래 빈 깃발을 펼쳐 놓고 문장 틀 깃발 넷을 가리킨다.",
    "write": [
     "I see a ___.",
     "I like the ___.",
     "It is a ___.",
     "This is my ___."
    ],
    "plan": {
     "meet": [
      "칩으로만 — 틀 넷을 다 한 번씩 조립해 말한다"
     ],
     "read": [
      "I see a ___. 을 따라 쓰고 빈칸 낱말은 내가 골라 손으로"
     ],
     "write": [
      "틀 하나를 골라 내 문장 한 줄 — 깃발에"
     ]
    },
    "carry": [],
    "rule": "틀은 옅은 글씨 위에 따라 쓰고, 빈칸 낱말(세 글자)은 보지 않고 쓴다 — 낱말 마당에서 열매가 된 낱말 가운데 내가 고른다",
    "gives": "내 문장 깃발이 깃발 줄에 걸린다. 등불이 떠오르고 마을 쪽 안개가 걷힌다 — 사다리 칸 lv1-18 이 켜지고 마을이 열린다."
   }
  },
  "C01": {
   "room": {
    "kind": "front",
    "owner": "sam",
    "rig": "day",
    "weather": "clear",
    "accent": "--a-fish",
    "sound": "부두 물결 + 갈매기 + 냄비 보글",
    "center": "가게 정면 — 벽을 잘라 왼쪽은 가게 앞길과 부두, 오른쪽은 가게 안이 보인다. 가운데 문턱에 닫힌 문(이야기 ③부터 열려 있다)",
    "props": {
     "shop": [
      "wallL",
      "가게 간판 — 글자가 지워진 빈 판(이야기 ③에 아이 글씨 shop). 누르면 간판 등이 깜박"
     ],
     "shut": [
      "center",
      "닫힌 가게 문 — 누르면 덜컹 하고 안 열린다(이야기 ③ 뒤에는 누르면 탁 닫혔다가 다시 활짝)"
     ],
     "ship": [
      "La",
      "부두에 들어온 배 — 이야기 ② 전에는 수평선의 점. 누르면 뱃고동 한 번"
     ],
     "shed": [
      "Lb",
      "부두 창고 — 누르면 문이 삐걱 열리고 안에 생선 상자"
     ],
     "fish": [
      "Rb",
      "얼음 진열대의 생선(숲의 코끼리 폭포에서 튀어 오르던 그 물고기) — 누르면 꼬리를 탁"
     ],
     "dish": [
      "Rc",
      "Sam 이 닦아 쌓는 접시 더미 — 누르면 뽀득"
     ],
     "cash": [
      "Ra",
      "계산대 — 누르면 서랍이 열리고 종이 딩"
     ],
     "wish": [
      "wallR",
      "벽의 소원 판 — 손님이 먹고 싶은 것을 그림으로 붙여 둔다. 누르면 그림 하나가 반짝이고 Sam 이 두 손을 모은다"
     ]
    },
    "more": {
     "rush": "부두 갈매기가 상자 끈을 물고 후다닥 달려간다",
     "mash": "주방 선반의 으깨는 방망이가 냄비를 쿵쿵",
     "shin": "내 캐릭터가 정강이를 톡톡 — 무릎 아래가 반짝",
     "hush": "Sam 이 손가락을 입에 댄다 — 가게 안 소리가 한 박 멎는다"
    },
    "wear": {
     "slide": "부두 널빤지 비탈 — 글자 나무 상자가 미끄러져 온다. s 상자와 h 상자는 밧줄로 묶여 한 덩이(sh)로 온다",
     "readaloud": "간판 아래 낱말 팻말 — 소리 내어 읽으면 팻말이 뒤집혀 그림이 된다",
     "order": "가게 앞 주문 창 — 손님이 그림 쪽지를 내밀고, 아이가 주방 쪽으로 외친다",
     "swap": "계산대 옆 접시 저울 — 접시 하나(소리 하나)를 바꿔 올리면 진열대의 물건이 변한다",
     "belt": "부두에서 가게로 이어진 도르래 줄 — 낱말 꼬리표 달린 바구니가 건너오고 맞는 그림 선반에 내린다",
     "pop": "얼음 진열대의 뚜껑 여섯 — 톡 열릴 때 들린 것을 잡는다",
     "wtrain": "부두 수레 줄 — 수레마다 그림 하나, 지나갈 때 이름을 대면 수레 등에 불",
     "magic": "주방 종 — 이름을 외치면 Sam 이 그 음식을 창구에 탁 내놓는다",
     "sbox": "메뉴판 아래 나무 칸 셋 — sh 는 한 칸에 두 글자",
     "wjob": "분필 메뉴판과 간판 — 손가락이 지나간 자리에 분필 자국"
    },
    "ears": [
     [
      "ship",
      "zip"
     ],
     [
      "shop",
      "hop"
     ],
     [
      "shut",
      "hut"
     ],
     [
      "fish",
      "fin"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "hop",
       "shop",
       "ship"
      ],
      "look": "폴짝 뛰던 토끼 발판이 가게로, 가게가 배로 — 맨 앞에 s 접시를 올리면 소리가 달라진다"
     },
     {
      "chain": [
       "fish",
       "dish",
       "wish"
      ],
      "look": "생선이 접시로, 접시가 소원 판의 그림으로"
     },
     {
      "chain": [
       "hut",
       "shut"
      ],
      "look": "언덕 오두막 문이 탁 닫힌다"
     }
    ],
    "work": {
     "L": "손님의 주문을 듣는다(그림 쪽지 + 목소리)",
     "S": "주방 쪽으로 「Fish!」 하고 외친다",
     "R": "주문표(글자만)를 읽고 접시에 차린다",
     "W": "오늘의 메뉴를 메뉴판에 쓴다",
     "next": "다음 날 손님은 내가 쓴 메뉴판을 보고 주문하고, 도르래 바구니의 꼬리표에 내 글씨가 달려 온다"
    },
    "extras": [
     "분필 메뉴판",
     "문 위 차양",
     "부두 밧줄 말뚝",
     "얼음 진열대",
     "창가 화분",
     "도르래 줄"
    ],
    "life": [
     "냄비 김",
     "창밖 부두의 배",
     "흔들리는 등",
     "계산대 종",
     "부두 말뚝 위의 갈매기"
    ],
    "ink": {
     "at": "frame",
     "on": "분필 메뉴판(두 줄) · 가게 간판 · 배 이름판",
     "lines": 4,
     "where": {
      "ship": "배 옆구리 이름판",
      "shop": "가게 간판",
      "fish": "메뉴판 첫 줄",
      "dish": "메뉴판 둘째 줄"
     }
    },
    "beat": "뱃고동이 붕 — 흔들리는 등이 박자에 까딱",
    "way": {
     "by": "door",
     "sees": "주방 문이 조금 열려 있다 — 탁탁 도마 소리와 튀김 냄새"
    }
   },
   "events": [
    {
     "id": "blanksign",
     "name": "지워진 간판",
     "beat": 1,
     "game": "slide",
     "who": "sam",
     "en": "Oh! The shop is shut!",
     "scene": "간판 글자가 지워졌고 문이 닫혔다. 부두 비탈에서 글자 상자가 미끄러져 온다 — s 와 h 는 밧줄로 묶여 한 덩이다. 낱말이 붙을 때마다 그 물건에 색이 돌아온다(가게 · 배 · 창고).",
     "end": "문틈으로 불빛이 샌다 — 안에서 Sam 이 손을 흔든다."
    },
    {
     "id": "shipin",
     "name": "배가 들어온다",
     "beat": 2,
     "game": "belt",
     "who": "max",
     "en": "A ship! Fish! A dish!",
     "scene": "부두에 배가 닿아 생선을 내린다. 도르래 줄로 꼬리표 달린 바구니가 건너온다 — 글자만 읽고 맞는 선반에 내리면 Sam 이 접시를 하나 닦아 올린다. 문 앞에 손님 그림자가 서면 Sam 이 쉿.",
     "end": "진열대가 차고 접시가 반짝반짝 쌓였다."
    },
    {
     "id": "opensign",
     "name": "간판을 쓰다",
     "beat": 3,
     "game": "wjob",
     "who": "sam",
     "en": "This is my shop!",
     "scene": "Sam 이 사다리를 받치고 빈 간판을 가리킨다. 간판에 shop 을 쓰면 글자에 등이 들어오고 닫힌 문이 덜컹 — 활짝 열린다.",
     "end": "첫 손님 Mina 가 문턱을 넘는다 — 계산대 종이 딩."
    },
    {
     "id": "firstorders",
     "name": "첫 주문",
     "beat": 0,
     "game": "order",
     "who": "mina",
     "en": "Hi! Fish! A big dish!",
     "scene": "문을 연 가게에 손님이 하나둘. 그림 쪽지를 내밀면 아이가 주방 쪽으로 외친다 — 외친 대로 Sam 이 창구에 내놓는다.",
     "end": "손님이 소원 판에 그림 한 장을 붙이고 간다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Sam",
     "show": [
      "<ship>"
     ],
     "en": "I see a ship!",
     "act": {
      "do": "find",
      "word": "ship"
     },
     "react": "수평선의 점이 커진다 — 멀리서 뱃고동이 붕.",
     "leads": "shipin"
    },
    {
     "arrive": "read",
     "from": "Sam",
     "show": [
      "<fish>",
      "<dish>"
     ],
     "en": "A fish! A dish!",
     "act": {
      "do": "bring",
      "word": "fish",
      "to": "dish"
     },
     "react": "생선이 접시에 올라가자 Sam 이 엄지를 든다 — 그러고는 빈 간판을 올려다본다.",
     "leads": "opensign",
     "note": "생선을 접시 더미 맨 위 접시에 올린다. 사건이 끝나면 생선은 진열대로 돌아간다"
    },
    {
     "arrive": "write",
     "from": "Ben",
     "show": [
      "{pan}",
      "{fish}"
     ],
     "en": "Hi! I am Ben. Yum! Yum!",
     "act": {
      "do": "go",
      "by": "door"
     },
     "react": "주방 문이 달그락. 문이 열렸으면 주방으로, 아직이면 문틈으로 튀김 냄새만(쪽지는 우편함에 남는다).",
     "leads": "C02"
    }
   ],
   "guest": {
    "who": "man",
    "enter": "거실에 프라이팬을 들고 왔던 그 아저씨 — 오늘은 배에서 내린다. 밧줄 감긴 나무 상자를 메고 오는데 상자 딱지에 낱말 하나.",
    "turns": [
     {
      "read": "mash",
      "pool": [
       "rush",
       "hush",
       "shin"
      ],
      "opens": "읽으면 밧줄이 풀리고 상자가 열린다 — 김 나는 으깬 감자 한 통. 오늘의 덤."
     },
     {
      "show": "hop",
      "cards": [
       "hop",
       "shop",
       "hip"
      ],
      "ans": "hop",
      "why": "h 와 sh — 앞에 s 가 붙으면 다른 소리가 된다(+ 가운데 o·i). 화덕의 hop 과 이 가게 shop",
      "again": {
       "show": "hut",
       "cards": [
        "hut",
        "shut",
        "hat"
       ],
       "ans": "hut"
      }
     },
     {
      "say": "I see a ship!",
      "alt": "I like fish!",
      "cue": "아저씨가 부두의 제 배를 가리키며 가슴을 편다"
     }
    ],
    "bye": "아저씨가 감자 통을 계산대에 올려놓고 뱃고동을 한 번 — 주방 문 위 등이 켜진다."
   },
   "job": {
    "who": "sam",
    "ask": "빈 간판과 빈 메뉴판을 차례로 가리키고 분필을 내민다.",
    "write": [
     "shop",
     "fish",
     "dish",
     "ship"
    ],
    "plan": {
     "meet": [
      "ship"
     ],
     "write": [
      "shop",
      "fish",
      "dish"
     ]
    },
    "carry": [],
    "gives": "배에 이름이 생겨 닻을 내리고, 간판에 불이 들어와 문이 열린다. 메뉴판 두 줄이 차서 손님이 그것을 보고 주문한다."
   }
  },
  "C02": {
   "room": {
    "kind": "in",
    "owner": "sam",
    "rig": "day",
    "weather": "clear",
    "accent": "--a-gold",
    "sound": "도마 탁탁 + 튀김 지글 + 손님 웅성",
    "center": "주방과 홀 사이의 음식 내는 창구. 창구 위에 분필 메뉴판 — 지난주에 쓴 내 글씨(fish · dish)가 그대로 있다. 왼쪽이 열린 주방, 오른쪽이 홀",
    "props": {
     "chop": [
      "Lb",
      "도마와 칼 — 누르면 탁탁탁"
     ],
     "chips": [
      "Ld",
      "갓 튀긴 감자튀김 바구니 — 누르면 김이 훅"
     ],
     "chin": [
      "Lc",
      "주방 걸상에 앉은 Ben 의 턱 — 소스가 묻었다. 누르면 손등으로 쓱"
     ],
     "chat": [
      "with:chin",
      "수다 — 누르면 Ben 의 말풍선에 그림이 줄줄이(글자 없음)"
     ],
     "lunch": [
      "Rc",
      "식탁에 차려진 점심 쟁반 — 누르면 뚜껑이 열린다"
     ],
     "much": [
      "with:lunch",
      "수북이 — 누르면 감자튀김이 산처럼 쌓였다가 돌아온다"
     ],
     "bench": [
      "Re",
      "문 옆 긴 의자 — 기다리는 손님들. 누르면 한 칸씩 당겨 앉는다"
     ],
     "rich": [
      "Rb",
      "금빛 방석이 놓인 임금님 자리 — 누르면 방석 술이 번쩍(쓰는 날에 누가 앉는다)"
     ]
    },
    "more": {
     "such": "손님 하나가 접시를 보고 눈이 동그래진다 — 이만큼이나!",
     "inch": "자벌레 한 마리가 창구 턱을 한 뼘씩 잰다",
     "chug": "주전자가 칙칙 김을 뿜으며 뚜껑을 들썩",
     "munch": "긴 의자 손님들이 한꺼번에 우적우적"
    },
    "wear": {
     "slide": "창구의 내리막 선반 — 글자 접시가 미끄러져 온다. c 와 h 는 한 접시(ch)에 담겨 온다",
     "readaloud": "창구에 꽂힌 주문 쪽지 — 소리 내어 읽으면 쪽지가 뒤집혀 음식 그림",
     "order": "긴 의자 손님 줄 — 한 사람씩 그림 쪽지를 내밀고, 아이가 주방에 외친다",
     "swap": "도마 위 글자 채소 — 한 조각을 바꿔 썰면 접시의 것이 변한다",
     "belt": "창구에서 식탁으로 도는 회전 쟁반 — 주문표(지난주 낱말은 내 글씨)가 지나가고 맞는 접시를 올린다",
     "pop": "튀김 냄비의 기름 방울 여섯 — 톡 튈 때 들린 것을 집게로",
     "wtrain": "식탁 사이를 도는 음식 수레 — 칸마다 그림 하나",
     "magic": "창구 종 — 이름을 외치면 주방에서 그 음식이 쓱 나온다",
     "sbox": "도마의 칼금 칸 — ch 는 한 칸(lunch 는 l·u·n·ch 네 칸)",
     "wjob": "창구 위 분필 메뉴판(새 줄 셋)과 Ben 의 턱받이 이름표 — 분필 자국"
    },
    "ears": [
     [
      "chop",
      "shop"
     ],
     [
      "chin",
      "shin"
     ],
     [
      "chat",
      "cat"
     ],
     [
      "much",
      "mug"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "shop",
       "chop",
       "hop"
      ],
      "look": "가게 간판이 도마로, 도마 위에서 토끼가 폴짝"
     },
     {
      "chain": [
       "cat",
       "chat",
       "hat"
      ],
      "look": "고양이가 수다쟁이 말풍선으로, 말풍선이 모자로"
     },
     {
      "chain": [
       "mug",
       "much",
       "mud"
      ],
      "look": "컵 하나가 수북한 컵 더미로, 더미가 진흙 범벅으로"
     },
     {
      "chain": [
       "pin",
       "chin",
       "fin"
      ],
      "look": "핀이 턱으로, 턱이 물고기 지느러미로 — 앞 소리만 바뀐다"
     }
    ],
    "work": {
     "L": "긴 의자 손님의 주문을 듣는다",
     "S": "주방 창구에 「Chips!」 하고 외친다",
     "R": "회전 쟁반의 주문표를 읽고 접시를 올린다",
     "W": "메뉴판에 오늘의 점심 줄을 쓴다",
     "next": "메뉴판에 지난주 줄(fish · dish)과 이번 주 줄이 나란히 — 손님이 내 글씨를 짚어 주문한다"
    },
    "extras": [
     "튀김 냄비",
     "소스 병",
     "회전 쟁반",
     "식탁 둘",
     "주문 종",
     "앞치마 걸이"
    ],
    "life": [
     "도마 소리",
     "튀김 냄비",
     "줄 선 손님",
     "수다 떠는 Ben",
     "창구에서 흔들리는 주문 쪽지"
    ],
    "ink": {
     "at": "center",
     "on": "창구 위 분필 메뉴판(새 줄 셋) · Ben 의 턱받이 이름표",
     "lines": 4,
     "where": {
      "chop": "메뉴판 셋째 줄",
      "chin": "Ben 의 턱받이 이름표",
      "lunch": "메뉴판 머리 줄(오늘의 점심)",
      "chips": "메뉴판 넷째 줄"
     }
    },
    "beat": "칼이 도마를 탁 탁 — 튀김 바구니가 박자에 들썩",
    "way": {
     "by": "road",
     "sees": "가게 문밖 길 끝에서 학교 종소리 — 창밖으로 가방 멘 아이들이 지나간다"
    }
   },
   "events": [
    {
     "id": "lunchline",
     "name": "점심 줄",
     "beat": 1,
     "game": "order",
     "who": "amy",
     "en": "Hi! Chips! I like chips!",
     "scene": "점심때 — 긴 의자에 손님이 줄을 섰다. 한 사람씩 그림 쪽지를 내밀면 아이가 주방 창구에 외친다. 외칠 때마다 줄이 한 칸 줄어든다.",
     "end": "줄 끝에 선 꼬마까지 접시를 받는다."
    },
    {
     "id": "saucychin",
     "name": "소스 묻은 턱",
     "beat": 2,
     "game": "talk",
     "who": "ben",
     "en": "Yum! This is my lunch.",
     "scene": "Sam 은 탁탁 썰고 Ben 은 턱에 소스를 묻힌 채 수다. Ben 의 한마디에 아이가 제 말을 고르면 Ben 이 그대로 해 보인다 — 감자튀김을 나눠 주거나, 도마 흉내를 내거나.",
     "end": "Ben 이 턱을 말끔히 닦고 접시를 비운다."
    },
    {
     "id": "fullhouse",
     "name": "가게가 꽉 찼다",
     "beat": 3,
     "game": "magic",
     "who": "sam",
     "en": "Fish! Chips! Lunch!",
     "scene": "식탁이 다 찼다. 아이가 창구 종을 치고 음식 이름을 외치면 주방에서 그 접시가 쓱 나온다 — 메뉴판 맨 윗줄에 lunch 가 올라간다.",
     "end": "가게가 손님으로 꽉 찬다 — 금빛 방석에도 누가 앉았다."
    },
    {
     "id": "choprhythm",
     "name": "도마 박자",
     "beat": 0,
     "game": "schant",
     "who": "sam",
     "en": "Chop! Chop! Chips! Yum!",
     "scene": "Sam 의 칼이 박자를 친다. 낱말 자리에서 아이 목소리가 켜지면 감자가 한 줄씩 썰려 바구니로 날아든다.",
     "end": "바구니가 수북 — 긴 의자에서 손뼉."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<chin>",
      "<chips>"
     ],
     "en": "Yum! Chips!",
     "act": {
      "do": "match",
      "pairs": [
       "chin",
       "chips"
      ]
     },
     "react": "Ben 이 턱의 소스를 가리키며 킥킥 — 감자튀김 하나를 내민다.",
     "leads": "saucychin"
    },
    {
     "arrive": "read",
     "from": "Sam",
     "show": [
      "<lunch>"
     ],
     "en": "This is my lunch.",
     "act": {
      "do": "say",
      "line": "This is my lunch.",
      "tap": "lunch"
     },
     "react": "쟁반 뚜껑이 열리고 김이 오른다 — 긴 의자 손님들이 목을 뺀다.",
     "leads": "fullhouse"
    },
    {
     "arrive": "write",
     "from": "Amy",
     "show": [
      "{bag}",
      "{pen}"
     ],
     "en": "Hi! I am Amy. This is my bag!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "길 끝에서 종이 댕. 문이 열렸으면 학교 가는 길로, 아직이면 창밖으로 가방 멘 아이들만 지나간다.",
     "leads": "C03"
    }
   ],
   "guest": {
    "who": "king",
    "enter": "숲의 연 날리는 언덕에서 발을 동동 구르던 그 임금님 — 소문을 듣고 왔다. 금빛 도시락 통을 들었는데 뚜껑 걸쇠에 낱말 하나.",
    "turns": [
     {
      "read": "munch",
      "pool": [
       "such",
       "inch",
       "chug"
      ],
      "opens": "읽으면 걸쇠가 딸깍 — 통은 텅 비었다. 임금님이 통을 내밀며 배를 두드린다(가득 채워 달라는 몸짓)."
     },
     {
      "show": "shop",
      "cards": [
       "shop",
       "chop",
       "ship"
      ],
      "ans": "shop",
      "why": "sh 와 ch — 지난주 간판의 shop 과 이번 주 도마의 chop(+ 가운데 o·i)",
      "again": {
       "show": "cat",
       "cards": [
        "cat",
        "chat",
        "hat"
       ],
       "ans": "cat"
      }
     },
     {
      "say": "I like chips!",
      "alt": "This is my lunch.",
      "cue": "임금님이 감자튀김 하나를 집어 먹고 눈이 동그래진다"
     }
    ],
    "bye": "임금님이 금빛 방석에 앉아 한 접시를 비우고 왕관을 벗어 인사한다 — 길 쪽 창에 학교 종탑이 보인다."
   },
   "job": {
    "who": "sam",
    "ask": "메뉴판의 빈 줄을 손등으로 톡톡 치고 분필을 내민다.",
    "write": [
     "lunch",
     "chips",
     "chop",
     "chin"
    ],
    "plan": {
     "meet": [
      "chop",
      "chin"
     ],
     "write": [
      "lunch",
      "chips"
     ]
    },
    "carry": [
     "shop",
     "fish"
    ],
    "gives": "메뉴판 맨 윗줄에 lunch — 그 아래 줄마다 음식 그림이 색을 얻는다. Ben 의 턱받이에 이름표. 가게 문 위에 단골 등이 하나 켜진다."
   }
  },
  "C03": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "morning",
    "weather": "clear",
    "accent": "--a-leaf",
    "sound": "시계 똑딱 + 분필 사각 + 창밖 오리",
    "center": "청록 칠판과 그 위의 둥근 시계. 칠판 아래 분필 받침. 교실 물건들이 뒤섞여 바닥에 흩어져 있다(이야기 ③에 제자리)",
    "props": {
     "this": [
      "Ld",
      "내 책상 위의 손가락 표지 — 누르면 내 캐릭터가 바로 앞 물건을 짚는다(가까운 것)"
     ],
     "that": [
      "wallL",
      "벽 선반 끝의 손가락 표지 — 누르면 Amy 가 팔을 쭉 뻗어 저쪽 물건을 가리킨다(먼 것)"
     ],
     "thin": [
      "Lb",
      "얇은 공책과 두꺼운 사전이 나란히 — 누르면 얇은 쪽이 팔랑"
     ],
     "bath": [
      "Lc",
      "미술 자리의 붓 씻는 대야 — 붓들이 목욕 중. 누르면 첨벙"
     ],
     "duck": [
      "winR",
      "창밖 연못의 오리(숲의 그루터기 찻집에 왔던 그 오리) — 누르면 꽥 하고 창턱까지 온다"
     ],
     "sock": [
      "Rd",
      "책상 밑 양말 한 짝(숲의 바닷가 천막에 널렸던 양말) — 누르면 꼼지락"
     ],
     "rock": [
      "Rb",
      "자연 관찰대의 돌 — 누르면 데굴 굴렀다 돌아온다"
     ],
     "kick": [
      "Rc",
      "사물함 앞 물렁 공 — 누르면 내 캐릭터가 톡 찬다(숲의 연 날리는 언덕에서 찼던 그 공)"
     ]
    },
    "more": {
     "math": "칠판 귀퉁이의 구슬 셈틀이 차르륵",
     "path": "교실 뒷문에서 운동장으로 난 오솔길에 발자국이 톡톡 찍힌다",
     "pack": "사물함의 배낭이 지퍼를 열고 입을 벌린다",
     "neck": "창밖 오리가 목을 길게 쭉 뺀다"
    },
    "sight": {
     "desk": "책상마다 붙은 통말 딱지 — 누르면 서랍이 드르륵",
     "chair": "의자 등받이의 딱지 — 누르면 의자가 한 바퀴",
     "book": "책꽂이의 그림책 등 딱지 — 누르면 책이 펼쳐진다",
     "clock": "칠판 위 시계 테두리의 딱지 — 누르면 똑딱이 커진다",
     "pencil": "굴러다니는 연필의 딱지 — 누르면 데구루루 굴러 필통으로"
    },
    "wear": {
     "slide": "칠판 분필 받침의 기울어진 홈 — 글자 분필이 미끄러져 온다. t 와 h 는 한 자루에 두 글자(th), c 와 k 도 한 자루(ck)",
     "readaloud": "칠판에 붙은 낱말 카드 — 소리 내어 읽으면 그 물건이 둥실 떠서 제 주인 책상으로 돌아간다",
     "order": "사물함 챙기기 — 친구가 그림 쪽지로 부탁하고, 아이가 이름을 말해 챙겨 준다",
     "swap": "칠판 지우개 — 낱말의 한 소리를 지우고 다른 분필로 쓰면 관찰대의 물건이 변한다",
     "belt": "책상 줄 사이로 건네는 쪽지 — 낱말 쪽지가 손에서 손으로, 맞는 물건 책상에 놓는다",
     "pop": "책상 서랍 여섯 — 톡 열릴 때 들린 것을 잡는다",
     "wtrain": "창턱을 도는 태엽 기차 — 칸마다 그림 하나",
     "magic": "칠판 지시봉 — 이름을 부르면 Mina 가 그 물건을 가져다 책상에 놓는다",
     "sbox": "칠판 아래 분필 칸 셋 — th · ck 는 한 칸",
     "wjob": "칠판(오늘의 낱말)과 물건 이름표 — 칠판은 분필, 이름표는 연필"
    },
    "ears": [
     [
      "that",
      "hat"
     ],
     [
      "thin",
      "chin"
     ],
     [
      "kick",
      "kid"
     ],
     [
      "rock",
      "rod"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "hat",
       "that",
       "chat"
      ],
      "look": "모자가 저쪽을 가리키는 손가락으로, 손가락이 수다 말풍선으로"
     },
     {
      "chain": [
       "chin",
       "thin",
       "pin"
      ],
      "look": "턱이 얇은 공책으로, 공책이 핀 하나로"
     },
     {
      "chain": [
       "sock",
       "rock"
      ],
      "look": "양말이 단단한 돌이 되어 데굴"
     },
     {
      "chain": [
       "kid",
       "kick",
       "kit"
      ],
      "look": "아이가 공을 뻥 — 공이 장난감 상자 속으로"
     }
    ],
    "work": {
     "L": "누구 것인지 듣고 물건을 찾는다",
     "S": "「This is my desk.」 하고 짚으며 말한다",
     "R": "칠판의 낱말 카드와 건네는 쪽지를 읽는다",
     "W": "칠판에 오늘의 낱말을, 물건에 이름표를 쓴다",
     "next": "다음 날 칠판의 「오늘의 낱말」은 내 글씨 — 건네는 쪽지에도 내 글씨가 적혀 온다"
    },
    "extras": [
     "사물함",
     "자연 관찰대",
     "미술 자리",
     "분필 받침",
     "구슬 셈틀",
     "창턱 화분"
    ],
    "life": [
     "똑딱 시계",
     "칠판 분필 가루",
     "창밖 오리",
     "굴러다니는 연필",
     "햇살에 흔들리는 커튼"
    ],
    "ink": {
     "at": "center",
     "on": "칠판(오늘의 낱말 두 줄) · 물건 이름표 둘",
     "lines": 4,
     "where": {
      "this": "칠판 첫 줄",
      "that": "칠판 둘째 줄",
      "duck": "창턱 오리 이름표",
      "sock": "양말 이름표(빨래집게로)"
     }
    },
    "beat": "시계가 똑 딱 — 분필이 칠판을 톡톡",
    "way": {
     "by": "door",
     "sees": "교실 뒷문 너머 운동장 — 깃발이 펄럭이고 누가 꼼짝 않고 서 있다"
    }
   },
   "events": [
    {
     "id": "mixedup",
     "name": "뒤섞인 교실",
     "beat": 1,
     "game": "readaloud",
     "who": "amy",
     "en": "Oh! This? That?",
     "scene": "교실 물건이 뒤섞였다 — 이건 누구 것? 칠판에 낱말 카드가 붙는다. 소리 내어 읽으면 그 물건이 둥실 떠서 제 책상으로 돌아간다.",
     "end": "책상 넷이 제 물건을 찾았다 — 양말 한 짝만 남았다."
    },
    {
     "id": "thisthat",
     "name": "이것 저것",
     "beat": 2,
     "game": "pop",
     "who": "amy",
     "en": "This is a sock. That is a duck!",
     "scene": "Amy 가 가까운 것을 짚고(this), 팔을 뻗어 먼 것을 가리킨다(that). 서랍이 톡톡 열릴 때 들린 것을 잡는다 — 책상 밑에서 양말, 창밖에서 오리.",
     "end": "오리가 창턱에 올라앉아 교실을 들여다본다."
    },
    {
     "id": "nametags",
     "name": "이름표 달기",
     "beat": 3,
     "game": "sbox",
     "who": "mina",
     "en": "This is my desk. That is my bag.",
     "scene": "물건마다 이름표를 단다. 분필 칸에 소리 조각을 놓아 낱말을 지으면(th · ck 는 한 칸) 이름표가 그 물건에 착 붙는다.",
     "end": "칠판에 「오늘의 낱말」 줄이 선다 — 시계가 댕 하고 쉬는 시간."
    },
    {
     "id": "sockrock",
     "name": "양말이 돌이 됐다",
     "beat": 0,
     "game": "swap",
     "who": "ben",
     "en": "A sock! A rock! Oh!",
     "scene": "Ben 이 칠판 지우개로 장난을 친다. 한 소리를 바꿔 쓸 때마다 관찰대의 물건이 변한다 — 양말이 돌로, 턱이 얇은 공책으로.",
     "end": "Ben 이 돌이 된 양말을 신으려다 주저앉는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Amy",
     "show": [
      "<thin>",
      "<this>"
     ],
     "en": "This is thin.",
     "act": {
      "do": "bring",
      "word": "thin",
      "to": "this"
     },
     "react": "얇은 공책이 내 책상에 놓이자 Amy 가 창밖을 가리킨다 — 저건?",
     "leads": "thisthat",
     "note": "얇은 공책을 내 책상(this 표지)으로 끌어다 놓는다"
    },
    {
     "arrive": "read",
     "from": "duck",
     "show": [
      "<sock>"
     ],
     "en": "That is my sock!",
     "act": {
      "do": "find",
      "word": "sock"
     },
     "react": "창턱의 오리가 꽥 — 양말을 부리로 가리킨다(제 둥지에 깔던 것이다).",
     "leads": "nametags"
    },
    {
     "arrive": "write",
     "from": "Ben",
     "show": [
      "{sun}",
      "{kick}"
     ],
     "en": "Hi! I am here. Go! Go! Kick!",
     "act": {
      "do": "go",
      "by": "door"
     },
     "react": "뒷문이 덜컹. 문이 열렸으면 운동장으로, 아직이면 문틈으로 깃발 펄럭이는 소리만.",
     "leads": "C04"
    }
   ],
   "guest": {
    "who": "girl",
    "enter": "숲의 염소 언덕에서 놀이판을 벌였던 그 소녀 — 오늘 전학 왔다. 불룩한 배낭을 멨는데 지퍼 고리에 낱말 하나.",
    "turns": [
     {
      "read": "pack",
      "pool": [
       "math",
       "path",
       "neck"
      ],
      "opens": "읽으면 지퍼가 주르륵 — 배낭에서 놀이판과 주사위가 나온다."
     },
     {
      "show": "chin",
      "cards": [
       "chin",
       "thin",
       "shin"
      ],
      "ans": "chin",
      "why": "ch · th · sh — 두 글자 한 소리 셋을 한 자리에서 가른다. 가게의 chin 과 교실의 thin",
      "again": {
       "show": "mat",
       "cards": [
        "mat",
        "math",
        "map"
       ],
       "ans": "mat"
      }
     },
     {
      "say": "This is my desk.",
      "alt": "That is my bag.",
      "cue": "소녀가 빈 책상을 두리번거리며 찾는다 — 아이가 제 책상을 짚어 보인다"
     }
    ],
    "bye": "소녀가 옆 책상에 앉아 놀이판을 편다 — 쉬는 시간 종이 울리고 뒷문이 열린다."
   },
   "job": {
    "who": "amy",
    "ask": "칠판의 빈 줄과 이름표 없는 물건들을 번갈아 가리킨다.",
    "write": [
     "this",
     "that",
     "duck",
     "sock"
    ],
    "plan": {
     "meet": [
      "this",
      "that"
     ],
     "write": [
      "duck",
      "sock"
     ]
    },
    "carry": [
     "chop",
     "lunch"
    ],
    "gives": "칠판에 오늘의 낱말 두 줄. 오리와 양말에 이름표 — 오리가 양말을 물고 둥지로 간다. 교실 뒷문 위 등이 켜진다."
   }
  },
  "C04": {
   "room": {
    "kind": "out",
    "owner": "ben",
    "rig": "day",
    "weather": "wind",
    "accent": "--a-red",
    "sound": "깃발 펄럭 + 잔디 바람 + 멀리 호루라기",
    "center": "운동장 한가운데 깃대와 펄럭이는 깃발. 그 앞에 Ben 이 꼼짝 않고 서 있다(이야기 ②부터 말하는 대로 움직인다)",
    "props": {
     "stop": [
      "La",
      "빨간 손바닥 표지(글자 없음) — 누르면 운동장의 움직이던 것이 한 박 멈춘다"
     ],
     "step": [
      "Le",
      "깃대 쪽으로 난 발자국 디딤판 줄 — 누르면 한 칸에 불"
     ],
     "stick": [
      "Lb",
      "모래에 꽂힌 막대기 — 누르면 탱 하고 떤다"
     ],
     "spin": [
      "Lc",
      "뱅뱅이 — 누르면 빙글 한 바퀴"
     ],
     "spot": [
      "Ld",
      "바닥에 그려진 큰 동그란 점(출발 자리) — 누르면 물감이 번지듯 환해진다"
     ],
     "snap": [
      "me",
      "내 손가락 — 누르면 딱 하고 튕긴다"
     ],
     "snip": [
      "Rb",
      "결승 리본과 가위 — 누르면 싹둑(리본은 다시 이어진다)"
     ],
     "swim": [
      "Rc",
      "물웅덩이 — 누르면 나뭇잎 배가 헤엄치듯 건넌다"
     ]
    },
    "more": {
     "snug": "물웅덩이 옆 수건이 Ben 을 포근히 감싼다",
     "spun": "뱅뱅이가 다 돌고 천천히 선다 — 돈 자국이 바닥에 동그랗게",
     "stuck": "막대기가 모래에 푹 박혀 꿈쩍도 안 한다"
    },
    "wear": {
     "slide": "운동장의 진짜 미끄럼틀 — 글자 공이 미끄러져 내려온다. s 공이 앞에서 다음 공의 손을 잡고 온다(s-t 가 붙어 st)",
     "readaloud": "깃대 아래 구령 카드 — 소리 내어 읽으면 Ben 이 그 동작을 한 번",
     "order": "체육 창고 창구 — 친구가 그림 쪽지로 빌리고, 아이가 이름을 말해 꺼내 준다",
     "swap": "출발 자리의 글자 발판 — 맨 앞에 s 발판을 놓거나 빼면 받침대의 물건이 변한다",
     "belt": "이어달리기 바통 — 낱말 바통이 손에서 손으로 오고, 맞는 그림 깃발 앞에 꽂는다",
     "pop": "잔디의 두더지 굴 여섯 — 톡 솟을 때 들린 것을 잡는다",
     "wtrain": "발자국 디딤판 줄 — 판마다 그림 하나, 이름을 대면 한 발 나아간다",
     "magic": "호루라기 — 구령을 외치면 Ben 이 그대로 한다",
     "sbox": "모래밭의 네 칸 — s 와 t 는 따로 한 칸씩(소리가 둘)",
     "wjob": "모래밭 — 손가락이 지나간 자리가 패인다"
    },
    "ears": [
     [
      "stop",
      "top"
     ],
     [
      "spin",
      "pin"
     ],
     [
      "snap",
      "nap"
     ],
     [
      "spot",
      "pot"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "top",
       "stop",
       "step"
      ],
      "look": "돌던 팽이가 딱 멈추고, 멈춘 자리에서 한 발 내딛는다"
     },
     {
      "chain": [
       "pin",
       "spin"
      ],
      "look": "리본 핀이 빙글빙글 돈다"
     },
     {
      "chain": [
       "nap",
       "snap",
       "snip"
      ],
      "look": "낮잠 자던 아이가 손가락을 딱 — 가위가 싹둑"
     },
     {
      "chain": [
       "pot",
       "spot"
      ],
      "look": "냄비에 동그란 점이 콕 찍힌다"
     }
    ],
    "work": {
     "L": "구령을 듣고 몸으로 따라 한다",
     "S": "내가 구령 — 말하면 Ben 이 움직인다",
     "R": "구령 카드와 바통의 낱말을 읽고 동작을 고른다",
     "W": "모래밭에 손가락으로 구령을 쓴다",
     "next": "다음 날 모래밭의 내 글씨가 구령 카드가 된다 — Ben 이 그것을 보고 움직인다"
    },
    "extras": [
     "미끄럼틀",
     "체육 창고",
     "울타리",
     "호루라기 걸이",
     "물뿌리개",
     "잔디 두더지 굴"
    ],
    "life": [
     "펄럭이는 깃발",
     "물웅덩이",
     "도는 Ben",
     "잔디 바람",
     "울타리 위를 걷는 참새"
    ],
    "ink": {
     "at": "path",
     "on": "모래밭(네 줄)",
     "lines": 4,
     "where": {
      "stop": "모래밭 첫 줄",
      "spin": "모래밭 둘째 줄",
      "swim": "물웅덩이 옆 모래",
      "step": "디딤판 줄 끝 모래"
     }
    },
    "beat": "깃발이 펄럭 펄럭 — Ben 의 호루라기 끈이 박자에 흔들린다",
    "way": {
     "by": "yard",
     "sees": "깃대 꼭대기에 검은 깃발이 올라간다 — 풀숲에서 누가 폴짝"
    }
   },
   "events": [
    {
     "id": "frozenben",
     "name": "꼼짝 않는 Ben",
     "beat": 1,
     "game": "slide",
     "who": "mina",
     "en": "Oh! Ben! Stop? Stop!",
     "scene": "Ben 이 깃대 앞에 서서 꼼짝도 안 한다. 미끄럼틀에서 글자 공이 붙어 낱말이 될 때마다 Ben 의 몸 한 군데가 풀린다 — 손가락, 발끝, 고개.",
     "end": "Ben 이 눈을 깜박 — 한쪽 발을 든다."
    },
    {
     "id": "mycall",
     "name": "내가 말하면",
     "beat": 2,
     "game": "talk",
     "who": "ben",
     "en": "I spin! I swim! I stop!",
     "scene": "내가 말하면 Ben 이 움직인다. 고른 말대로 — 빙글 돌고, 물웅덩이에 뛰어들어 헤엄치고, 딱 멈춘다.",
     "end": "Ben 이 흠뻑 젖은 채 엄지를 든다."
    },
    {
     "id": "stepbystep",
     "name": "한 발 한 발",
     "beat": 3,
     "game": "wtrain",
     "who": "amy",
     "en": "Step! Step! Stop!",
     "scene": "깃대까지 발자국 디딤판 줄. 판마다 그림 하나 — 이름을 대면 Ben 과 내가 한 발 나아간다. 바퀴가 돌수록 걸음이 빨라진다.",
     "end": "깃대에 닿는다 — 깃발이 높이 올라간다."
    },
    {
     "id": "whistle",
     "name": "호루라기 구령",
     "beat": 0,
     "game": "magic",
     "who": "ben",
     "en": "Spin! Snap! Swim! Stop!",
     "scene": "오늘은 내가 코치. 호루라기를 불고 구령을 외치면 Ben 이 그대로 한다 — 잘못 알아들어도 엉뚱한 동작이 나올 뿐이다.",
     "end": "Ben 이 잔디에 벌렁 눕는다 — 하늘에 구름 하나."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<spin>"
     ],
     "en": "I spin!",
     "act": {
      "do": "say",
      "line": "I spin!",
      "tap": "spin"
     },
     "react": "뱅뱅이가 혼자 반 바퀴 돈다 — Ben 의 눈동자가 따라 돈다.",
     "leads": "mycall"
    },
    {
     "arrive": "read",
     "from": "Ben",
     "show": [
      "<step>",
      "<spot>"
     ],
     "en": "Step! Step! I stop here.",
     "act": {
      "do": "match",
      "pairs": [
       "step",
       "spot"
      ]
     },
     "react": "출발 점과 디딤판 줄에 불이 들어온다 — 깃대까지 길이 보인다.",
     "leads": "stepbystep"
    },
    {
     "arrive": "write",
     "from": "frog",
     "sign": "진흙 폴짝 자국",
     "show": [
      "{frog}",
      "{stick}"
     ],
     "en": "Hi! I see a big stick. I like it!",
     "act": {
      "do": "go",
      "by": "yard"
     },
     "react": "풀숲이 바스락. 문이 열렸으면 깃대 쪽으로, 아직이면 풀숲에서 눈 두 개만 깜박.",
     "leads": "C05"
    }
   ],
   "guest": {
    "who": "robot",
    "enter": "숲의 여왕의 뜰에서 반지를 나르던 그 로봇 — 운동장 한가운데서 삐걱 멈춰 섰다. 가슴판 불빛에 낱말 하나.",
    "turns": [
     {
      "read": "stuck",
      "pool": [
       "snug",
       "spun"
      ],
      "opens": "읽으면 가슴판이 딸깍 — 끼었던 톱니가 풀리고 로봇이 팔을 든다."
     },
     {
      "show": "top",
      "cards": [
       "top",
       "stop",
       "tip"
      ],
      "ans": "top",
      "why": "맨 앞에 s 가 붙었나 — 화덕의 팽이 top 과 운동장의 stop(+ 가운데 o·i)",
      "again": {
       "show": "nap",
       "cards": [
        "nap",
        "snap",
        "map"
       ],
       "ans": "nap"
      }
     },
     {
      "say": "I spin!",
      "alt": "I swim!",
      "cue": "로봇이 팔을 프로펠러처럼 돌리며 따라 해 보라는 몸짓"
     }
    ],
    "bye": "로봇이 삐걱삐걱 한 바퀴 돌고 깃대 줄을 당긴다 — 검은 깃발이 올라간다."
   },
   "job": {
    "who": "ben",
    "ask": "모래밭을 발로 평평하게 고르고 손가락으로 허공에 글씨 쓰는 시늉.",
    "write": [
     "stop",
     "spin",
     "swim",
     "step"
    ],
    "plan": {
     "meet": [
      "stop",
      "spin"
     ],
     "write": [
      "swim",
      "step"
     ]
    },
    "carry": [
     "that",
     "duck"
    ],
    "gives": "모래밭에 구령 넷 — Ben 이 그것을 읽고 차례로 해 보인다. 깃대 아래 구령 카드 통에 내 글씨 카드가 꽂힌다."
   }
  },
  "C05": {
   "room": {
    "kind": "out",
    "owner": "ben",
    "rig": "afternoon",
    "weather": "clear",
    "accent": "--a-cream",
    "sound": "응원 소리 + 북 둥둥 + 풀숲 개굴",
    "center": "깃대 — 장대 끝에 검은 깃발. 장대 아래 흰 선으로 그린 두 편의 진영",
    "props": {
     "flag": [
      "center",
      "장대 끝의 깃발 — 누르면 펄럭"
     ],
     "black": [
      "with:flag",
      "깃발의 검은색 — 누르면 검정이 짙어졌다 돌아온다"
     ],
     "flat": [
      "Ld",
      "바람 빠져 납작해진 공 — 누르면 푸쉬 하고 더 납작"
     ],
     "clap": [
      "Lc",
      "응원석 친구들의 손 — 누르면 짝짝"
     ],
     "frog": [
      "Rc",
      "풀숲의 개구리(숲의 코끼리 폭포에 살던 그 개구리) — 누르면 폴짝"
     ],
     "grab": [
      "with:frog",
      "덥석 — 누르면 개구리가 깃발 끈을 덥석 문다"
     ],
     "drop": [
      "Rd",
      "개구리가 떨어뜨린 깃발 술 — 누르면 톡 떨어졌다 튀어 오른다"
     ],
     "grin": [
      "Rb",
      "응원 인형의 얼굴 — 누르면 입이 귀까지 씩"
     ]
    },
    "more": {
     "flip": "납작한 공이 뒤집개에 얹혀 휙 뒤집힌다",
     "drum": "응원석 북이 저 혼자 둥",
     "grip": "장대를 쥔 장갑이 꽉 조여진다",
     "clip": "깃발 줄의 집게가 딸깍 물린다"
    },
    "wear": {
     "slide": "응원석 계단 난간 — 글자 방석이 미끄러져 온다. 첫 두 방석은 끈으로 묶여 같이 온다(b-l 이 bl)",
     "readaloud": "응원 팻말 — 소리 내어 읽으면 팻말이 번쩍 들린다",
     "order": "물 당번 — 친구가 그림 쪽지를 들면 이름을 말해 건네준다",
     "swap": "깃발 줄의 글자 깃 — 둘째 깃(l · r)을 끼우거나 빼면 장대 끝의 것이 변한다",
     "belt": "장대에서 응원석으로 도는 깃발 줄 — 낱말 깃이 지나가고 맞는 그림 바구니에 건다",
     "pop": "풀숲 연잎 여섯 — 개구리가 폴짝 올라앉을 때 들린 것을 잡는다",
     "wtrain": "응원 행진 줄 — 한 사람씩 그림 팻말을 들고 지나간다",
     "magic": "응원 구령 — 외치면 두 편이 그대로 한다",
     "sbox": "진영 흰 선의 네 칸 — b 와 l 은 따로 한 칸씩(black 은 b·l·a·ck 네 칸)",
     "wjob": "응원 팻말 — 굵은 붓 자국"
    },
    "ears": [
     [
      "clap",
      "cap"
     ],
     [
      "frog",
      "fog"
     ],
     [
      "flag",
      "flat"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "cap",
       "clap"
      ],
      "look": "모자가 짝 하고 마주치는 두 손이 된다"
     },
     {
      "chain": [
       "fog",
       "frog"
      ],
      "look": "안개가 뭉쳐 개구리 한 마리"
     },
     {
      "chain": [
       "flat",
       "flag"
      ],
      "look": "납작한 공이 펴져 깃발로 펄럭"
     }
    ],
    "work": {
     "L": "응원 구령을 듣고 몸으로",
     "S": "내가 구령 — 「I clap!」",
     "R": "깃발 줄의 낱말 깃과 팻말을 읽는다",
     "W": "응원 팻말에 붓으로 쓴다",
     "next": "다음 날 응원석 친구들이 내 글씨 팻말을 들고 있다 — 팻말을 읽으면 그 동작이 나온다"
    },
    "extras": [
     "응원석 계단",
     "북",
     "물통",
     "진영 흰 선",
     "풀숲",
     "깃발 줄"
    ],
    "life": [
     "깃발",
     "폴짝 개구리",
     "손뼉 치는 친구들",
     "북",
     "기울어 가는 해에 길어지는 장대 그림자"
    ],
    "ink": {
     "at": "frame",
     "on": "응원 팻말 넷",
     "lines": 4,
     "where": {
      "clap": "첫째 팻말",
      "flag": "둘째 팻말",
      "frog": "셋째 팻말(개구리 편)",
      "drop": "넷째 팻말"
     }
    },
    "beat": "북이 둥 둥 — 개구리 목이 박자에 볼록",
    "way": {
     "by": "yard",
     "sees": "운동장 끝 모래밭 — 누가 분홍 천을 펼치고 있다"
    }
   },
   "events": [
    {
     "id": "blackflag",
     "name": "검은 깃발",
     "beat": 1,
     "game": "readaloud",
     "who": "amy",
     "en": "A flag! A black flag!",
     "scene": "깃발 뺏기 놀이 — 검은 깃발이 장대 끝에 높이 달렸다. 응원 팻말의 낱말을 소리 내어 읽을 때마다 깃발 줄이 한 뼘씩 내려온다.",
     "end": "깃발이 손 닿을 만큼 내려왔다 — 풀숲이 바스락."
    },
    {
     "id": "frogleap",
     "name": "개구리가 물고 갔다",
     "beat": 2,
     "game": "pop",
     "who": "max",
     "en": "A frog! Grab! Oh! Drop!",
     "scene": "개구리가 깃발을 덥석 물고 폴짝. 연잎에 올라앉을 때 들린 낱말의 연잎을 잡으면 — 잡았다, 놓쳤다. 놓칠 때마다 깃발 술이 하나 떨어진다.",
     "end": "개구리가 깃발을 제 발로 내려놓는다."
    },
    {
     "id": "cheerboards",
     "name": "응원 팻말",
     "beat": 3,
     "game": "wjob",
     "who": "ben",
     "en": "I clap! I grab the flag!",
     "scene": "놀이가 끝났다. 응원 팻말에 낱말을 쓸 때마다 응원석이 그 동작을 한다 — 다 같이 손뼉.",
     "end": "개구리도 씩 웃는다 — 두 편이 깃발을 같이 든다."
    },
    {
     "id": "flagline",
     "name": "깃발 줄",
     "beat": 0,
     "game": "belt",
     "who": "mina",
     "en": "Listen! Clap! Flag! Frog!",
     "scene": "장대에서 응원석으로 깃발 줄이 돈다. 낱말 깃을 글자만 보고 맞는 바구니에 걸면 깃이 제 색으로 물든다.",
     "end": "운동장 위로 알록달록한 줄이 한 바퀴."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Amy",
     "show": [
      "<flag>"
     ],
     "en": "I see a black flag!",
     "act": {
      "do": "find",
      "word": "flag"
     },
     "react": "장대가 살짝 휘며 깃발이 내려다본다 — 풀숲에서 눈 두 개.",
     "leads": "frogleap"
    },
    {
     "arrive": "read",
     "from": "frog",
     "show": [
      "<clap>"
     ],
     "en": "I grab! I drop! I grin!",
     "act": {
      "do": "say",
      "line": "I clap!",
      "tap": "clap"
     },
     "react": "응원석에서 손뼉이 번진다 — 개구리가 깃발을 문 채 멈칫.",
     "leads": "cheerboards"
    },
    {
     "arrive": "write",
     "from": "Max",
     "show": [
      "{tent}",
      "{lamp}"
     ],
     "en": "Hi! I am Max. This is my tent!",
     "act": {
      "do": "go",
      "by": "yard"
     },
     "react": "모래밭 쪽에서 말뚝 박는 소리. 문이 열렸으면 모래밭으로, 아직이면 분홍 천 귀퉁이만 펄럭.",
     "leads": "C06"
    }
   ],
   "guest": {
    "who": "panda",
    "enter": "숲의 문어 연못에서 대나무를 씹던 그 판다 — 응원하러 왔다. 둥근 가죽 가방을 멨는데 끈 매듭에 낱말 하나.",
    "turns": [
     {
      "read": "drum",
      "pool": [
       "flip",
       "grip",
       "clip"
      ],
      "opens": "읽으면 매듭이 풀리고 가방에서 북이 나온다 — 판다가 둥 하고 한 번 친다."
     },
     {
      "show": "fog",
      "cards": [
       "fog",
       "frog",
       "fig"
      ],
      "ans": "fog",
      "why": "f 와 fr — r 하나가 끼면 안개가 개구리가 된다(+ 가운데 o·i). 연못의 fog 와 운동장의 frog",
      "again": {
       "show": "cap",
       "cards": [
        "cap",
        "clap",
        "cup"
       ],
       "ans": "cap"
      }
     },
     {
      "say": "I clap!",
      "alt": "I see a frog!",
      "cue": "판다가 북채를 들고 박자를 기다린다"
     }
    ],
    "bye": "판다가 북을 둥둥 치며 모래밭 쪽으로 행진한다 — 개구리가 북 위에 올라탄다."
   },
   "job": {
    "who": "ben",
    "ask": "빈 응원 팻말 넷을 잔디에 늘어놓고 굵은 붓을 내민다.",
    "write": [
     "clap",
     "flag",
     "frog",
     "drop"
    ],
    "plan": {
     "meet": [
      "clap",
      "flag"
     ],
     "write": [
      "frog",
      "drop"
     ]
    },
    "carry": [
     "stop",
     "swim"
    ],
    "gives": "응원 팻말 넷에 아이 글씨 — 응원석 친구들이 하나씩 든다. 장대 그림자 끝에 등이 켜진다."
   }
  },
  "C06": {
   "room": {
    "kind": "out",
    "owner": "max",
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-pink",
    "sound": "저녁 풀벌레 + 천막 천 펄럭 + 멀리 부엉이",
    "center": "모래밭 한가운데 돌을 둥글게 놓은 자리(불 대신 등을 놓을 곳)와 통나무 의자 둘. 뒤로 해가 진다",
    "props": {
     "tent": [
      "Lb",
      "분홍 천막(숲의 바닷가에 쳤던 그 천막) — 이야기 ① 전에는 접힌 천. 누르면 문 자락이 펄럭"
     ],
     "pink": [
      "with:tent",
      "천막의 분홍 — 누르면 분홍이 노을빛으로 환해진다"
     ],
     "sand": [
      "Ld",
      "모래 더미와 삽 — 누르면 모래가 사르르"
     ],
     "hand": [
      "with:sand",
      "모래 위 손자국 — 누르면 내 캐릭터가 손바닥을 꾹 찍는다"
     ],
     "nest": [
      "wallR",
      "나무 위 둥지(숲의 달빛 둥지와 닮았다) — 누르면 아기 새가 고개를 쏙"
     ],
     "best": [
      "Rb",
      "별 리본 — 누르면 별이 반짝(이야기 ③에 천막 꼭대기에 달린다)"
     ],
     "lamp": [
      "Rc",
      "야영 등(숲의 연 날리는 언덕에서 켜지던 등) — 누르면 불이 켜졌다 잦아든다"
     ],
     "jump": [
      "Rd",
      "모래 구덩이와 구름판 — 누르면 내 캐릭터가 폴짝 뛴다"
     ]
    },
    "more": {
     "pond": "모래밭 옆 웅덩이에 달이 비친다",
     "sink": "조약돌 하나가 웅덩이에 퐁 가라앉는다",
     "vest": "통나무 의자에 걸린 조끼가 바람에 한 번 부푼다",
     "ant": "개미 줄이 천막 말뚝을 타고 오른다"
    },
    "wear": {
     "slide": "천막 버팀줄 — 글자 등이 줄을 타고 내려온다. 끝의 두 등은 한 고리에 걸려 같이 온다(n-t 가 nt)",
     "readaloud": "말뚝마다 걸린 낱말 꼬리표 — 소리 내어 읽으면 말뚝이 쿵 박힌다",
     "order": "야영 짐 수레 — 친구가 그림 쪽지를 들면 이름을 말해 꺼내 준다",
     "swap": "모래 위 글자 조개 — 끝에 조개 하나를 더 놓으면 받침대의 물건이 변한다(ten 에 t 를 놓아 tent)",
     "belt": "천막에서 나무로 이은 빨랫줄 도르래 — 낱말 꼬리표가 건너오고 맞는 그림 고리에 건다",
     "pop": "모래 게 구멍 여섯 — 톡 솟을 때 들린 것을 잡는다",
     "wtrain": "등불 줄 — 등마다 그림 하나, 이름을 대면 그 등에 불이 켜진다",
     "magic": "밤 신호 — 이름을 외치면 Max 가 손전등으로 그것을 비춘다",
     "sbox": "모래에 그은 네 칸 — n 과 d 는 따로 한 칸씩",
     "wjob": "모래밭과 천막 이름표 — 모래는 손가락, 이름표는 펜"
    },
    "ears": [
     [
      "tent",
      "ten"
     ],
     [
      "nest",
      "net"
     ],
     [
      "pink",
      "pin"
     ],
     [
      "sand",
      "sad"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "ten",
       "tent"
      ],
      "look": "암탉 열 마리가 천막 속으로 쏙 — 천막이 선다"
     },
     {
      "chain": [
       "net",
       "nest",
       "best"
      ],
      "look": "그물이 둥지로, 둥지 위에 별 리본"
     },
     {
      "chain": [
       "hand",
       "sand"
      ],
      "look": "손바닥이 모래 한 줌으로 사르르"
     },
     {
      "chain": [
       "pin",
       "pink"
      ],
      "look": "핀 끝에서 분홍이 번진다"
     }
    ],
    "work": {
     "L": "밤 소리를 듣고 무엇인지 찾는다",
     "S": "「This is my tent.」 하고 보여 준다",
     "R": "말뚝 꼬리표와 빨랫줄의 낱말을 읽는다",
     "W": "모래밭에 손가락으로, 천막 이름표에 펜으로 쓴다",
     "next": "다음 날 천막 이름표는 내 글씨 — 등불 줄의 꼬리표에도 내 글씨가 달린다"
    },
    "extras": [
     "말뚝과 버팀줄",
     "통나무 의자 둘",
     "짐 수레",
     "빨랫줄 도르래",
     "돌 둘레",
     "손전등"
    ],
    "life": [
     "천막 펄럭",
     "등불",
     "둥지의 새",
     "모래 손자국",
     "하나둘 돋는 별"
    ],
    "ink": {
     "at": "path",
     "on": "모래밭(두 줄) · 천막 이름표 · 구름판 표지",
     "lines": 4,
     "where": {
      "tent": "천막 이름표",
      "hand": "모래밭 첫 줄(손자국 옆)",
      "sand": "모래밭 둘째 줄",
      "jump": "구름판 표지"
     }
    },
    "beat": "말뚝을 쿵 쿵 박는 소리 — 등불이 박자에 깜박",
    "way": {
     "by": "lantern",
     "sees": "운동장 너머 등불 길 — 그림책방 2층 창에 불이 켜진다"
    }
   },
   "events": [
    {
     "id": "pitchtent",
     "name": "분홍 천막 치기",
     "beat": 1,
     "game": "schant",
     "who": "max",
     "en": "A tent! A pink tent!",
     "scene": "접힌 분홍 천을 편다. Max 가 말뚝을 박자에 맞춰 쿵 쿵 — 낱말 자리에서 아이 목소리가 켜지면 버팀줄이 하나씩 팽팽해진다.",
     "end": "천막이 선다 — 문 자락이 펄럭."
    },
    {
     "id": "handsand",
     "name": "손자국과 둥지",
     "beat": 2,
     "game": "swap",
     "who": "amy",
     "en": "A hand! Sand! Oh! A nest!",
     "scene": "모래에 손자국을 찍는다. 글자 조개 하나를 바꾸거나 더 놓을 때마다 받침대의 것이 변한다 — 손이 모래로, 그물이 둥지로. 고개를 드니 나무 위에 진짜 둥지.",
     "end": "둥지에서 아기 새가 고개를 쏙 내민다."
    },
    {
     "id": "lampline",
     "name": "등불 줄",
     "beat": 3,
     "game": "wtrain",
     "who": "max",
     "en": "The lamp! The best tent!",
     "scene": "날이 저문다. 천막에서 나무까지 등불 줄 — 등마다 그림 하나, 이름을 대면 그 등에 불이 들어온다.",
     "end": "등불이 다 켜졌다 — 천막에서 하룻밤, 최고의 야영."
    },
    {
     "id": "sandboxes",
     "name": "모래 네 칸",
     "beat": 0,
     "game": "sbox",
     "who": "ben",
     "en": "Listen! Jump! I jump!",
     "scene": "Ben 이 모래에 네 칸을 긋는다. 들은 낱말의 소리 조각을 칸에 놓으면 — 끝의 두 소리까지 다 놓아야 — 그 물건이 모래에서 솟는다.",
     "end": "Ben 이 구름판에서 폴짝 뛰어 모래에 발자국."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<hand>",
      "<sand>"
     ],
     "en": "The sand is hot.",
     "act": {
      "do": "match",
      "pairs": [
       "hand",
       "sand"
      ]
     },
     "react": "모래 위 손자국이 하나 더 찍힌다 — 따뜻한 김이 살짝.",
     "leads": "handsand"
    },
    {
     "arrive": "read",
     "from": "bird",
     "show": [
      "<lamp>",
      "<nest>"
     ],
     "en": "I see a lamp. I like it!",
     "act": {
      "do": "bring",
      "word": "lamp",
      "to": "nest"
     },
     "react": "등이 나무 아래 놓이자 아기 새가 눈을 감는다 — 엄마 새가 날개를 덮는다.",
     "leads": "lampline",
     "note": "야영 등을 둥지 나무 아래로 끌어다 놓는다. 사건이 끝나면 등은 제자리로"
    },
    {
     "arrive": "write",
     "from": "Mina",
     "show": [
      "{book}",
      "{moon}"
     ],
     "en": "Hi! I am Mina. This is my book!",
     "act": {
      "do": "go",
      "by": "lantern"
     },
     "react": "등불 길에 불이 하나씩 켜진다. 문이 열렸으면 책방으로, 아직이면 2층 창의 불빛만.",
     "leads": "C07"
    }
   ],
   "guest": {
    "who": "ant",
    "enter": "숲의 사과나무 빈터에서 열매를 나르던 그 개미 줄 — 천막 앞까지 작은 상자를 끌고 왔다. 맨 앞 개미의 깃발에 낱말 하나.",
    "turns": [
     {
      "read": "ant",
      "pool": [
       "pond",
       "sink",
       "vest"
      ],
      "opens": "읽으면 개미들이 일제히 더듬이를 든다 — 제 이름이다(숲의 첫날 「Hi, ant!」 하고 불렀던 그 이름을 이제 읽는다). 상자가 열리고 사과 조각이 나온다."
     },
     {
      "show": "net",
      "cards": [
       "net",
       "nest",
       "nut"
      ],
      "ans": "net",
      "why": "끝의 t 와 st — 닭장의 net 과 나무 위 nest(+ 가운데 e·u)",
      "again": {
       "show": "pin",
       "cards": [
        "pin",
        "pink",
        "pan"
       ],
       "ans": "pin"
      }
     },
     {
      "say": "I jump!",
      "alt": "This is my tent.",
      "cue": "개미들이 줄지어 폴짝폴짝 뛰어 보인다"
     }
    ],
    "bye": "개미 줄이 사과 조각을 나눠 놓고 등불 길 쪽으로 줄지어 간다 — 길의 등이 하나씩 켜진다."
   },
   "job": {
    "who": "max",
    "ask": "천막 문 위의 빈 이름표를 톡 치고, 모래밭을 손바닥으로 쓸어 평평하게 한다.",
    "write": [
     "hand",
     "tent",
     "sand",
     "jump"
    ],
    "plan": {
     "meet": [
      "tent",
      "hand"
     ],
     "write": [
      "sand",
      "jump"
     ]
    },
    "carry": [
     "clap",
     "frog"
    ],
    "gives": "천막에 이름표가 붙고 모래밭에 손자국과 나란히 내 글씨. 구름판에 표지 — 등불 길의 첫 등이 켜진다."
   }
  },
  "C07": {
   "room": {
    "kind": "book2",
    "owner": "mina",
    "rig": "lantern",
    "weather": "moon",
    "accent": "--a-steel",
    "sound": "책장 넘기는 소리 + 계단 삐걱 + 독서등 지잉",
    "center": "2층 창가의 독서대 셋. 책 세 권이 저마다 안개에 싸여 있다. 계단 끝 책장에는 아래층에서 만든 내 첫 그림책이 꽂혀 있다",
    "stands": [
     [
      -4.4,
      -1.6
     ],
     [
      0,
      -2.8
     ],
     [
      4.4,
      -1.6
     ]
    ],
    "texts": [
     {
      "line": "I see a big fish.",
      "who": "ben",
      "day": "meet",
      "card": "I see a fish.",
      "scene": "작은 Ben 이 큰 물고기를 올려다본다 — 읽으면 물고기가 책 밖으로 꼬리를 한 번 친다. big 을 건너뛰면 물고기가 조그맣게 남는다"
     },
     {
      "line": "It is a black duck.",
      "who": "mina",
      "day": "read",
      "card": "It is a duck.",
      "scene": "Mina 앞에 잉크처럼 까만 오리 — 읽으면 오리가 잉크 발자국을 콩콩 찍으며 쪽을 가로지른다. black 을 건너뛰면 오리가 하얗게 남는다"
     },
     {
      "line": "I like a shop.",
      "who": "max",
      "day": "write",
      "card": "I like a shop.",
      "unseen": true,
      "scene": "Max 가 가게 앞에서 두 팔을 벌린다 — 읽으면 가게 간판(내가 쓴 shop)에 불이 들어온다. 아무도 먼저 읽어 주지 않는 글 — 특별 손님이 들고 온다"
     }
    ],
    "wear": {
     "story": "독서 의자 — Mina 가 한 편을 읽어 주고, 장면 조각 둘을 들은 차례로 독서대에 놓는다",
     "book": "안개에 싸인 책 — 낱말을 하나씩 짚으며 소리 내어 읽으면 안개가 한 겹씩 걷히고 그림이 움직인다",
     "readaloud": "책에서 빠져나온 낱말 카드(big · black · fish · duck) — 읽으면 책 속 제자리로 날아가 꽂힌다",
     "belt": "책 반납 벨트 — 문장 띠가 지나가고 맞는 그림 책에 꽂는다",
     "echo": "창가의 소라 껍데기 — 내가 읽은 문장이 되돌아 들린다. 들리는 동안 그 책의 그림이 다시 움직인다",
     "swrite": "독서 카드 — 낱말 칩으로 한 줄을 조립하고 그 위에 따라 쓴다",
     "wjob": "독서 카드 꽂이 — 다 쓴 카드를 그 책 옆에 꽂는다"
    },
    "work": {
     "L": "한 편을 듣고 장면 조각을 차례로 놓는다",
     "S": "낱말을 짚으며 소리 내어 읽는다 — 소라 껍데기가 내 목소리를 돌려준다",
     "R": "안개 속의 책을 혼자 읽어 안개를 걷는다",
     "W": "독서 카드에 한 줄을 쓴다",
     "next": "내가 쓴 독서 카드가 책 옆에 꽂혀 있다 — 다음에 그 책을 펴면 카드의 내 글씨가 먼저 보인다"
    },
    "extras": [
     "독서대 셋",
     "독서 의자",
     "독서 카드 꽂이",
     "책 반납 벨트",
     "창가 소라 껍데기",
     "아래층으로 가는 계단"
    ],
    "life": [
     "독서등",
     "걷히는 안개",
     "책방 고양이",
     "창밖 달",
     "책 사이에서 팔랑이는 책갈피 끈"
    ],
    "ink": {
     "at": "frame",
     "on": "독서 카드 세 장(책마다 한 장)",
     "lines": 3
    },
    "beat": "책등을 톡톡 두드리는 소리 — 독서등이 박자에 숨 쉰다",
    "way": {
     "by": "alley",
     "sees": "책방 뒷문 골목 — 해 질 녘 빛 속에 자판기 하나가 깜박인다"
    }
   },
   "events": [
    {
     "id": "threemist",
     "name": "안개 속 세 권",
     "beat": 1,
     "game": "story",
     "who": "mina",
     "en": "Listen! I see a big fish.",
     "scene": "2층이 열렸다. 책 세 권이 안개에 싸여 있다. Mina 가 첫 권을 읽어 준다 — 들은 대로 장면 조각(작은 Ben · 큰 물고기)을 독서대에 놓으면 첫 권의 안개가 옅어진다.",
     "end": "첫 권 표지에 Ben 의 얼굴이 비친다."
    },
    {
     "id": "mistlifts",
     "name": "걷히는 안개",
     "beat": 2,
     "game": "book",
     "who": "ben",
     "en": "It is a black duck!",
     "scene": "둘째 권. 낱말을 하나씩 짚으며 소리 내어 읽으면 안개가 걷히고 그림이 움직인다 — 까만 오리가 잉크 발자국을 찍으며 걷는다.",
     "end": "두 권이 책장에 꽂힌다 — 셋째 권만 안개 속."
    },
    {
     "id": "readingcard",
     "name": "독서 카드",
     "beat": 3,
     "game": "wjob",
     "who": "mina",
     "en": "I like the shop. I see a duck.",
     "scene": "책마다 독서 카드 한 장. 한 줄을 쓰면 카드가 그 책 옆에 꽂히고 책등에 내 표시가 생긴다.",
     "end": "셋째 권을 안은 손님이 계단을 올라온다."
    },
    {
     "id": "bookreturn",
     "name": "책 반납",
     "beat": 0,
     "game": "belt",
     "who": "amy",
     "en": "Oh! A big fish! A black duck!",
     "scene": "반납 벨트로 문장 띠가 온다. 읽고 맞는 책에 꽂으면 책이 살짝 들썩 — 고양이가 벨트 끝에서 앞발로 거든다.",
     "end": "책장이 가지런해지고 고양이가 그 위에 눕는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<big>",
      "<fish>"
     ],
     "en": "I see a big fish.",
     "act": {
      "do": "say",
      "line": "I see a big fish.",
      "tap": "fish"
     },
     "react": "첫 권 속 물고기가 꼬리로 책장을 탁 — 둘째 권의 안개가 술렁인다.",
     "leads": "mistlifts",
     "note": "낱말을 하나씩 짚어 읽는다"
    },
    {
     "arrive": "read",
     "from": "cat",
     "show": [
      "<black>",
      "<duck>"
     ],
     "en": "It is a black duck.",
     "act": {
      "do": "find",
      "word": "duck"
     },
     "react": "고양이가 잉크 발자국을 따라가다 제 발에 잉크를 묻힌다 — 독서 카드 꽂이를 앞발로 톡.",
     "leads": "readingcard",
     "note": "둘째 권의 장면에서 까만 오리를 찾아 누른다"
    },
    {
     "arrive": "write",
     "from": "Max",
     "show": [
      "{key}"
     ],
     "en": "Hi! I am Max. I am here. Go! Go!",
     "act": {
      "do": "go",
      "by": "alley"
     },
     "react": "뒷문 골목에서 자판기 불빛이 깜박. 문이 열렸으면 골목으로, 아직이면 불빛만 창에 어른거린다.",
     "leads": "C08"
    }
   ],
   "guest": {
    "who": "Max",
    "enter": "Max 가 안개에 싸인 셋째 권을 안고 계단을 올라온다. 표지에 문장 하나 — 아무도 먼저 읽어 주지 않은 글.",
    "turns": [
     {
      "read": "I like a shop.",
      "pool": [
       "I see a black sock.",
       "It is a big ship."
      ],
      "opens": "읽으면 안개가 걷히고 책이 펼쳐진다 — 가게 앞의 Max. 간판에 불이 들어온다."
     },
     {
      "show": "fish",
      "cards": [
       "I see a big fish.",
       "I see a big dish.",
       "I see a pink fish."
      ],
      "ans": "I see a big fish.",
      "why": "끝 낱말 fish · dish 와 꾸밈말 big · pink — 한 문장의 낱말을 하나도 건너뛰지 않고 읽는다"
     },
     {
      "say": "I like the shop.",
      "alt": "I see a duck.",
      "cue": "Max 가 책 속 가게와 창밖 마을 쪽을 번갈아 가리킨다"
     }
    ],
    "bye": "세 권이 책장에 나란히 꽂힌다. Max 가 뒷문 열쇠를 흔들어 보인다 — 골목 쪽."
   },
   "job": {
    "who": "Mina",
    "ask": "독서 카드 세 장을 부채처럼 펴 보이고 연필을 내민다.",
    "write": [
     "I see a fish.",
     "It is a duck.",
     "I like a shop."
    ],
    "plan": {
     "read": [
      "I see a fish."
     ],
     "write": [
      "It is a duck."
     ],
     "again": [
      "I like a shop."
     ]
    },
    "carry": [],
    "rule": "책마다 카드 한 장 — 지문에서 꾸밈말을 뺀 한 줄. 칩으로 조립한 뒤 그 위에 따라 쓴다(하루 한 장 · 열두 자 안). 쓰는 날에는 두 장 가운데 더 좋아하는 쪽을 먼저 골라도 된다",
    "gives": "독서 카드가 책 옆에 꽂히고 책등에 내 표시. 세 장이 다 차면 2층 책장 한 칸이 「내가 읽은 책」 칸이 된다."
   }
  },
  "C08": {
   "room": {
    "kind": "alley",
    "owner": "max",
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-plum",
    "sound": "자판기 웅 + 칩 딸깍 + 골목 바람",
    "center": "골목 막다른 벽 앞의 큰 자판기. 칩 구멍 셋(누가 · 가운데 · 끝)과 꺼내는 서랍. 양옆 벽과 자판기 차양에 문장 거는 줄 셋",
    "rails": [
     [
      "I",
      "am",
      [
       -5,
       -3.2
      ]
     ],
     [
      "You",
      "are",
      [
       5,
       -3.2
      ]
     ],
     [
      "It",
      "is",
      [
       0,
       -5
      ]
     ]
    ],
    "drawers": {
     "who": [
      -3,
      3
     ],
     "be": [
      0,
      4.3
     ],
     "end": [
      3,
      3
     ]
    },
    "pages": {
     "I am Ben.": "Ben 가면이 서랍에서 나온다 — Ben 이 쓰고 제 가슴을 톡",
     "I am here.": "발자국 깔개가 나온다 — 올라서면 발밑이 환해진다",
     "You are Max.": "Max 이름 리본 — Max 가슴에 달아 주면 Max 가 꾸벅",
     "You are big.": "키 재는 자 — 상대 옆에 세우면 쑥 늘어난다",
     "It is a duck.": "태엽 오리 — 뒤뚱뒤뚱 골목을 걷는다",
     "It is a shop.": "작은 가게 모형 — 간판에 불이 들어온다",
     "I am hot.": "부채 — 내 캐릭터가 부치면 머리칼이 날린다",
     "You are Mina.": "Mina 이름 리본 — Mina 가 리본을 달고 한 바퀴"
    },
    "sight": {
     "are": "자판기 가운데 구멍의 칩 — You 칩 옆에서만 딸깍 들어간다(I 칩 옆에서는 통 튕겨 나온다)"
    },
    "bounce": "안 맞는 가운데 칩은 구멍에서 통 튀어 나와 골목 바닥을 구르다 서랍으로 돌아간다 — 틀렸다는 표시 0, 규칙을 말해 주는 글 0",
    "wear": {
     "gvend": "큰 자판기 — 그림 주문대로 칩 셋을 끼우면 그 문장대로 무언가 나온다. 안 맞는 가운데 칩은 튕겨 나온다",
     "echo": "골목 메아리 — 만든 문장을 말하면 벽이 내 목소리로 되돌려 준다",
     "swrite": "주문 쪽지 — 칩으로 조립한 문장을 쪽지에 따라 쓴다",
     "belt": "자판기 옆 빨래집게 쪽지 줄 — 문장 쪽지가 지나가고 맞는 그림에 건다",
     "mirror": "가게 쇼윈도 유리 — 비친 나를 보며 「I am ~.」, 유리 속의 내가 나를 가리키면 「You are ~.」",
     "sstory": "장난 단추 — 칩이 제멋대로 섞여 나오고, 만든 문장대로 골목에 엉뚱한 일이 벌어진다",
     "wjob": "주문 쪽지 묶음 — 「I am」 뒤의 빈칸 낱말은 보지 않고 쓴다"
    },
    "work": {
     "L": "문장을 듣고 무엇이 나올지 맞힌다",
     "S": "만든 문장을 말한다 — 골목이 되돌려 준다",
     "R": "칩과 쪽지 줄의 문장을 읽는다",
     "W": "주문 쪽지를 쓴다",
     "next": "내가 쓴 주문 쪽지가 벽 줄에 걸려 남는다 — 다음 날 쪽지 줄에는 내 글씨 쪽지가 섞여 지나간다"
    },
    "extras": [
     "칩 서랍 셋",
     "문장 거는 줄 셋",
     "쇼윈도 유리",
     "빨래집게 쪽지 줄",
     "골목 가로등",
     "상자 더미"
    ],
    "life": [
     "자판기 불빛",
     "튕겨 나오는 칩",
     "골목 고양이",
     "깜박이는 간판",
     "가로등에 모이는 나방"
    ],
    "ink": {
     "at": "frame",
     "on": "주문 쪽지(하루 한 장)",
     "lines": 4
    },
    "beat": "칩이 딸깍 딸깍 — 자판기 불빛이 박자에 깜박",
    "way": {
     "by": "road",
     "sees": "골목 끝 큰길 — 점심 가게 창에 새 진열장 불빛이 들어온다"
    }
   },
   "events": [
    {
     "id": "oddmachine",
     "name": "이상한 자판기",
     "beat": 1,
     "game": "gvend",
     "who": "max",
     "en": "Oh! I am Max. I am here!",
     "scene": "골목에 이상한 자판기. 그림 주문대로 칩 셋을 끼우면 그 문장대로 뭔가 나온다 — 가면, 깔개, 부채.",
     "end": "자판기가 부르르 떨고 가운데 구멍의 불이 한 칸 더 켜진다."
    },
    {
     "id": "bouncedchips",
     "name": "튕겨 나온 칩",
     "beat": 2,
     "game": "belt",
     "who": "mina",
     "en": "You are Max. You are big!",
     "scene": "안 맞는 칩이 통 튕겨 나와 쪽지 줄에 걸렸다. 지나가는 문장 쪽지를 읽고 맞는 그림에 걸면 — I 쪽지는 왼쪽 벽으로, You 쪽지는 오른쪽 벽으로 간다.",
     "end": "벽의 두 줄이 차기 시작한다 — 줄마다 가운데 낱말이 같다."
    },
    {
     "id": "mywall",
     "name": "내 문장 벽",
     "beat": 3,
     "game": "wjob",
     "who": "max",
     "en": "It is a duck. It is a shop.",
     "scene": "주문 쪽지를 쓴다 — I am 뒤의 빈칸은 내가 고른 낱말로. 쓴 쪽지가 자판기로 들어가면 그대로 나오고, 쪽지는 벽 줄에 걸린다.",
     "end": "벽 세 줄에 문장이 나란히 — 줄마다 둘째 낱말이 다르다. Max 가 고개를 갸웃하다 씩 웃는다."
    },
    {
     "id": "prankbutton",
     "name": "장난 단추",
     "beat": 0,
     "game": "sstory",
     "who": "ben",
     "en": "You are a duck! I am a shop!",
     "scene": "Ben 이 장난 단추를 눌렀다. 칩이 제멋대로 섞여 나온다 — 만든 문장대로 골목에서 엉뚱한 일이 벌어진다(Ben 이 오리처럼 뒤뚱).",
     "end": "모두 깔깔 — 그 쪽지는 Ben 이 이마에 붙이고 간다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<hot>",
      "<big>"
     ],
     "en": "I am hot. You are big.",
     "act": {
      "do": "match",
      "pairs": [
       "hot",
       "big"
      ]
     },
     "react": "부채가 팔랑, 키 재는 자가 쑥 — 자판기 가운데 구멍이 궁금한 듯 깜박인다.",
     "leads": "bouncedchips",
     "note": "낱말을 자판기에서 나온 물건(부채 · 키 재는 자)에 잇는다"
    },
    {
     "arrive": "read",
     "from": "cat",
     "show": [
      "<duck>"
     ],
     "en": "It is a duck. It is here!",
     "act": {
      "do": "bring",
      "word": "duck",
      "to": "cat"
     },
     "react": "골목 고양이가 태엽 오리를 앞발로 톡 — 오리가 벽 쪽으로 뒤뚱뒤뚱 걸어간다.",
     "leads": "mywall",
     "note": "서랍에서 나온 태엽 오리를 골목 고양이에게"
    },
    {
     "arrive": "write",
     "from": "Sam",
     "show": [
      "{cake}"
     ],
     "en": "Hi! You are here! I like cake!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "큰길 쪽에서 달콤한 냄새. 문이 열렸으면 점심 가게로, 아직이면 진열장 불빛만.",
     "leads": "D01"
    }
   ],
   "guest": {
    "who": "elephant",
    "enter": "숲의 폭포에서 물을 뿜던 그 코끼리 — 골목이 꽉 찬다. 코끝에 문장 쪽지 한 장을 말아 쥐었다.",
    "turns": [
     {
      "read": "You are here.",
      "pool": [
       "I am big.",
       "It is hot."
      ],
      "opens": "읽으면 자판기 맨 아래 큰 서랍이 덜컹 열린다 — 코끼리만 한 물뿌리개."
     },
     {
      "show": "ship",
      "cards": [
       "It is a ship.",
       "It is a shop.",
       "You are a ship."
      ],
      "ans": "It is a ship.",
      "why": "첫 두 낱말(It is · You are)과 가운데 모음 i · o — 누구 이야기인지, 무엇인지 둘 다 읽는다"
     },
     {
      "say": "You are big!",
      "alt": "I am here.",
      "cue": "코끼리가 골목 벽 사이에 끼어 귀만 펄럭인다"
     }
    ],
    "bye": "코끼리가 물뿌리개로 골목 화분에 물을 주고 뒷걸음으로 나간다 — 큰길 쪽이 환하다."
   },
   "job": {
    "who": "Max",
    "ask": "주문 쪽지 묶음을 내밀고 자판기의 쪽지 구멍을 가리킨다.",
    "write": [
     "I am here.",
     "You are big.",
     "I am ___.",
     "It is a duck."
    ],
    "plan": {
     "meet": [
      "I am here."
     ],
     "read": [
      "You are big."
     ],
     "write": [
      "I am ___."
     ],
     "again": [
      "It is a duck."
     ]
    },
    "carry": [],
    "blank": [
     "hot",
     "big",
     "here"
    ],
    "rule": "쪽지마다 칩으로 조립한 뒤 따라 쓴다(하루 한 장 · 열두 자 안). 쓰는 날의 「I am ___.」 은 틀만 옅은 글씨 — 빈칸 낱말(hot · big · here 가운데 내가 고른 것)은 보지 않고 쓴다",
    "gives": "쪽지가 자판기에 들어가면 그 문장대로 무언가 나온다. 쪽지는 벽 줄에 걸려 남는다 — 줄 셋이 차면 골목 가로등이 다 켜진다."
   }
  },
  "D01": {
   "room": {
    "kind": "in",
    "owner": "sam",
    "rig": "afternoon",
    "weather": "clear",
    "accent": "--a-pink",
    "sound": "진열장 냉장고 웅 + 거품기 휘휘 + 문 종 딸랑",
    "center": "가게 홀 한가운데 새 유리 진열장(세 칸 선반). 칸마다 이름 팻말 자리가 있고 팻말 끝 한 칸이 비어 있다. 진열장 위에 e 등(반짝이는 e 블록이 든 유리 등 — 이 구역의 표지). 창구 위 분필 메뉴판에는 지난 주들의 내 글씨(fish · dish · lunch · chips)가 그대로",
    "props": {
     "cake": [
      "La",
      "진열장 왼쪽 칸의 케이크 — 이야기 ① 전에는 뾰족한 모자(cap) 꼴로 보인다. 누르면 촛불이 화르르(숲의 그루터기 찻집에서 고양이와 강아지가 노려보던 그 케이크)"
     ],
     "name": [
      "Lb",
      "진열장 앞 손님 이름표 — 머리 칸은 비었고 아래 칸에 손님 얼굴 그림. 누르면 이름표가 빙글"
     ],
     "game": [
      "Lc",
      "창가 탁자의 「케이크 맞히기」 놀이판 — 누르면 말이 한 칸 뛴다(숲의 염소 언덕 놀이판)"
     ],
     "face": [
      "Ld",
      "웃는 얼굴 쿠키를 얹은 얼굴 케이크 — 누르면 쿠키가 눈을 찡긋"
     ],
     "late": [
      "wallR",
      "벽시계 — 바늘이 약속 시간을 넘었다. 누르면 똑딱이 빨라지고 시계가 발을 동동(늦었다!)"
     ],
     "gate": [
      "Rb",
      "주방으로 드는 허리 높이 나무 쪽문 — 누르면 삐걱 열렸다 닫힌다"
     ],
     "plate": [
      "Rc",
      "계산대 옆에 쌓인 케이크 접시 — 누르면 맨 위 접시가 반짝"
     ],
     "grape": [
      "Ra",
      "포도 바구니 — 누르면 한 알이 톡 떨어져 접시 쪽으로 데굴"
     ]
    },
    "more": {
     "cape": "모자걸이의 뾰족 모자가 e 를 만나 펄럭이는 망토로 — 한 바퀴 휘날린다",
     "tape": "개수대 꼭지가 e 를 만나 둘둘 감긴 테이프로 — 쭉 풀려 케이크 상자 뚜껑을 붙인다",
     "date": "벽 달력의 오늘 칸에 동그라미가 그려진다 — 그 칸에 케이크 그림",
     "shake": "여왕의 작은 상자 — 흔들면 딸랑, 뚜껑이 열리며 오르골이 돈다",
     "race": "창밖 길에서 꼬마 둘이 케이크 상자를 들고 달리기 시합",
     "chase": "굴러가는 포도 알을 가게 고양이가 쫓아 진열장 밑으로"
    },
    "wheel": [
     {
      "rime": "ate",
      "words": [
       "late",
       "gate",
       "plate",
       "date"
      ]
     },
     {
      "rime": "ape",
      "words": [
       "grape",
       "cape",
       "tape"
      ]
     }
    ],
    "hiddenNo": [
     "cap",
     "hat",
     "bag",
     "map"
    ],
    "wear": {
     "swap": "진열장 위 e 등 — e 블록을 낱말 끝에 끼우면 받침대 위의 것이 변한다(모자 → 망토). 빼면 돌아온다",
     "readaloud": "진열장 칸의 이름 팻말 — 소리 내어 읽으면 그 칸에 케이크가 제 색으로 쑥",
     "silly": "케이크 꾸미기 주문 — 손님이 엉뚱한 주문(포도 눈 · 접시 모자)을 하면 들은 차례대로 꾸며져 나온다",
     "wjob": "케이크 이름 팻말과 초콜릿 펜 — 손가락이 지나간 자리에 초콜릿 선",
     "wheel": "진열장 옆 케이크 회전대 — 돌릴 때마다 첫 글자 접시가 바뀐다(-ate · -ape 받침 위에서)",
     "belt": "주방 쪽문에서 홀로 도는 케이크 쟁반 줄 — 팻말(지난 낱말은 내 글씨)이 지나가고 맞는 케이크에 꽂는다",
     "monster": "진열장 밑에서 나온 배고픈 반죽 몬스터 — 들린 낱말의 케이크만 먹는다(비슷한 소리 cap · cape 가 섞인다)",
     "sbox": "케이크 틀 칸 — a_e 는 한 칸(a 블록과 e 블록이 초콜릿 다리로 이어져 있다)",
     "vend": "주문 진열장 — 칸에 낱말을 다 놓고 끝에 e 를 끼우면 그 케이크가 칸에 쑥 나온다",
     "hidden": "오븐 문 셋 — 긴 a(제 이름 에이)가 숨어 있으면 오븐 문을 두드린다(빵이 부푼다). 짧은 a 면 그대로"
    },
    "ears": [
     [
      "game",
      "gum"
     ],
     [
      "late",
      "lot"
     ],
     [
      "grape",
      "grip"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "cap",
       "cape"
      ],
      "look": "모자걸이의 뾰족 모자 — e 블록이 날아와 끝에 붙자 펄럭이는 망토로"
     },
     {
      "chain": [
       "tap",
       "tape"
      ],
      "look": "개수대 꼭지가 e 를 만나 둘둘 감긴 테이프로"
     },
     {
      "chain": [
       "name",
       "game",
       "gate"
      ],
      "look": "이름표가 놀이판으로, 놀이판이 주방 쪽문으로 — 소리 하나씩"
     },
     {
      "chain": [
       "late",
       "plate"
      ],
      "look": "늦었다고 동동거리던 벽시계가 앞에 p 가 붙자 둥근 접시로 내려앉는다"
     }
    ],
    "work": {
     "L": "손님이 원하는 케이크를 듣는다(그림 쪽지 + 목소리)",
     "S": "주방 쪽으로 「Cake!」 「Grape!」 하고 외친다",
     "R": "진열장 팻말을 읽고 케이크를 칸에 놓는다",
     "W": "케이크 이름 팻말을 쓴다",
     "next": "내가 쓴 팻말이 진열장에 꽂혀 남는다 — 다음 날 손님이 팻말의 내 글씨를 짚어 고르고, 쟁반 줄의 팻말도 내 글씨로 온다"
    },
    "extras": [
     "거품기와 볼",
     "케이크 상자 더미",
     "벽 달력",
     "오븐",
     "모자걸이",
     "분필 메뉴판(지난 주 줄 그대로)"
    ],
    "life": [
     "진열장 불빛",
     "반짝이는 e",
     "포도 알",
     "문을 여는 Amy",
     "거품기를 돌리는 Sam"
    ],
    "ink": {
     "at": "Lb",
     "on": "케이크 이름 팻말 · 손님 이름표 · 놀이판 뚜껑 · 접시 테두리",
     "lines": 4,
     "where": {
      "cake": "진열장 왼쪽 칸 팻말",
      "name": "손님 이름표의 머리 칸",
      "game": "놀이판 뚜껑",
      "plate": "접시 테두리 이름표"
     }
    },
    "beat": "거품기가 볼을 탁 탁 — 진열장 불빛이 박자에 숨 쉬고, e 칸마다 e 등이 깜박",
    "way": {
     "by": "road",
     "sees": "창밖 길 끝 집의 창 — 커튼 사이로 멈춘 벽시계가 보인다"
    }
   },
   "events": [
    {
     "id": "capcake",
     "name": "모자 케이크",
     "beat": 1,
     "game": "readaloud",
     "who": "sam",
     "en": "Oh! A cap? A cake!",
     "scene": "새 진열장의 팻말마다 끝 칸이 비어 있다. 팻말을 소리 내어 읽으면 그 칸이 제 색으로 — 그런데 e 가 빠진 팻말은 읽는 순간 케이크가 뾰족 모자(cap)로 변한다. 진열장 위 e 등이 깜박이며 빈 칸을 비춘다.",
     "end": "e 등에서 반짝이는 e 블록 하나가 톡 떨어져 아이 손에 쥐어진다."
    },
    {
     "id": "pluse",
     "name": "e 를 붙이면",
     "beat": 2,
     "game": "vend",
     "who": "sam",
     "en": "A cap! A cape! A cake!",
     "scene": "주문 진열장 앞. 낱말을 칸에 놓고 끝에 e 블록을 끼우면 — 모자걸이의 cap 이 cape 로 펄럭이고, 진열장 칸에 케이크가 쑥 나온다. 칸마다 한 판씩.",
     "end": "진열장 세 칸이 다 차고 e 등이 환하게 켜진다."
    },
    {
     "id": "namecards",
     "name": "케이크 이름 팻말",
     "beat": 3,
     "game": "wjob",
     "who": "sam",
     "en": "This is my cake! It is a game.",
     "scene": "Sam 이 초콜릿 펜을 내민다. 케이크마다 팻말에 이름을 쓰면 팻말이 케이크에 꽂히고, 포도 바구니에서 한 알씩 접시로 굴러간다. 문 종이 딸랑 — 숨이 찬 Amy.",
     "end": "늦게 온 Amy 까지 한 조각 — 접시가 다 찼다."
    },
    {
     "id": "sillycake",
     "name": "엉뚱한 케이크",
     "beat": 0,
     "game": "silly",
     "who": "ben",
     "en": "A face! A grape! A cake! Yum!",
     "scene": "Ben 이 엉뚱한 주문을 한다. 들은 차례대로 케이크를 꾸미면(얼굴 쿠키 · 포도 눈 · 접시 모자) 그대로 나온다. 차례가 바뀌면 케이크가 웃긴 얼굴로.",
     "end": "Ben 이 제 얼굴 같은 케이크를 들고 깔깔."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Sam",
     "show": [
      "<cake>"
     ],
     "en": "I like cake!",
     "act": {
      "do": "find",
      "word": "cake"
     },
     "react": "진열장 왼쪽 칸에서 촛불이 반짝 — 그런데 옆 칸은 아직 모자 꼴이다. 진열장 위 e 등이 깜박.",
     "leads": "pluse"
    },
    {
     "arrive": "read",
     "from": "Amy",
     "show": [
      "<grape>",
      "<plate>"
     ],
     "en": "A grape! A plate!",
     "act": {
      "do": "bring",
      "word": "grape",
      "to": "plate"
     },
     "react": "포도 한 알이 접시에 쏙 — 벽시계가 발을 동동, 누가 늦나 보다.",
     "leads": "namecards",
     "note": "포도 바구니의 포도 한 알을 맨 위 접시에. 사건이 끝나면 포도는 바구니로 돌아간다"
    },
    {
     "arrive": "write",
     "from": "Amy",
     "show": [
      "{five}",
      "{kite}"
     ],
     "en": "Hi! I am Amy. I am late! Oh!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "창밖 길 끝 집 창에 불이 깜박. 문이 열렸으면 그 집으로, 아직이면 커튼 사이 멈춘 시계만 보인다(쪽지는 우편함에 남는다).",
     "leads": "D02"
    }
   ],
   "guest": {
    "who": "queen",
    "enter": "비 오는 뜰의 여왕 — 반지 낀 손에 작은 상자를 들고 진열장 앞에 선다. 상자 뚜껑에 낱말 하나.",
    "turns": [
     {
      "read": "shake",
      "pool": [
       "race",
       "chase"
      ],
      "opens": "읽으면 여왕이 상자를 흔든다 — 딸랑, 뚜껑이 열리고 오르골이 돈다. 오르골 위의 작은 케이크 그림 = 여왕의 생일 케이크 주문."
     },
     {
      "show": "cap",
      "cards": [
       "cap",
       "cape",
       "cup"
      ],
      "ans": "cap",
      "why": "cap 과 cape — 끝에 e 가 붙으면 a 가 제 이름(에이)을 부른다(+ 가운데 a · u). 부엌의 모자와 이번 주의 망토",
      "again": {
       "show": "dot",
       "cards": [
        "dot",
        "date",
        "dog"
       ],
       "ans": "dot"
      }
     },
     {
      "say": "I like cake!",
      "alt": "It is a game.",
      "cue": "여왕이 케이크 한 조각을 맛보고 왕관을 고쳐 쓴다"
     }
    ],
    "bye": "여왕이 생일 케이크 상자를 안고 반지로 진열장 유리를 톡 — 창밖 길 끝 집 창에 불이 깜박인다."
   },
   "job": {
    "who": "sam",
    "ask": "진열장 팻말의 빈 줄을 가리키고 초콜릿 펜을 내민다.",
    "write": [
     "cake",
     "name",
     "game",
     "plate"
    ],
    "plan": {
     "meet": [
      "cake",
      "name"
     ],
     "write": [
      "game",
      "plate"
     ]
    },
    "carry": [],
    "gives": "팻말에 이름이 생긴 케이크가 진열장 칸에 꽂히고 촛불이 켜진다. 이름표 머리 칸 · 놀이판 뚜껑 · 접시 테두리에 내 글씨 — 다음 손님은 팻말을 짚어 고른다."
   }
  },
  "D02": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "morning",
    "weather": "dew",
    "accent": "--a-gold",
    "sound": "새벽 참새 짹 + 멈춘 시계(소리 없음 — 맞추면 똑딱) + 이불 바스락",
    "center": "Amy 의 다락 아침 방. 침대 머리맡 벽에 큰 벽시계 — 바늘이 멈췄다. 창은 아직 어둡고 창턱의 e 등만 희미하게 빛난다. 방이 걸음 내내 새벽 → 아침으로 밝아진다(이야기 ①은 남빛, ②에 해가 들고, ③은 환한 아침)",
    "props": {
     "time": [
      "center",
      "멈춘 벽시계 — 바늘이 다섯 시 앞에 서 있다. 누르면 똑딱 한 번(이야기 ② 뒤로는 계속 똑딱)"
     ],
     "wake": [
      "La",
      "침대 — 이불 속에서 Amy 가 꿈틀. 누르면 기지개(어제 늦은 까닭 — 시계가 멈췄다)"
     ],
     "five": [
      "Lb",
      "창턱 화분 다섯 — 꽃봉오리가 오므라져 있다. 누르면 하나씩 핀다"
     ],
     "nine": [
      "Lc",
      "책상 위 유리병의 구슬 아홉 — 누르면 하나씩 통통 튀어 오른다"
     ],
     "smile": [
      "wallR",
      "벽 거울 — 누르면 거울 속 Amy 가 활짝 웃는다"
     ],
     "bike": [
      "Ra",
      "방문 옆에 세운 자전거 — 누르면 따르릉"
     ],
     "ride": [
      "with:bike",
      "자전거 타기 — 누르면 바퀴가 한 바퀴 돌고 Amy 가 올라타는 시늉"
     ],
     "kite": [
      "Rb",
      "벽 고리에 걸린 연(숲의 연 날리는 언덕에서 온 그 연) — 누르면 꼬리가 팔랑"
     ]
    },
    "more": {
     "bite": "접시의 토스트를 Amy 가 한 입 앙 — 이 자국",
     "hide": "Amy 가 이불 속으로 쏙 숨는다 — 발가락만 꼼지락",
     "like": "하루표 옆 엄지 스티커가 반짝 — 통말로 알던 like 가 소리로도 읽힌다",
     "pine": "창밖 소나무 가지에서 솔방울이 톡 떨어진다",
     "line": "창밖 빨랫줄에 양말이 한 줄로 쪼르르 걸린다"
    },
    "wheel": [
     {
      "rime": "ite",
      "words": [
       "kite",
       "bite"
      ]
     },
     {
      "rime": "ide",
      "words": [
       "ride",
       "hide"
      ]
     },
     {
      "rime": "ike",
      "words": [
       "bike",
       "like"
      ]
     }
    ],
    "hiddenNo": [
     "kit",
     "pig",
     "zip",
     "fin"
    ],
    "wear": {
     "swap": "창턱의 e 등 — e 블록을 끼우면 받침대(협탁) 위의 것이 변한다(상자 → 연)",
     "readaloud": "하루표 옆 낱말 쪽지 — 소리 내어 읽으면 쪽지가 뒤집혀 그림이 되고 방 그 자리가 밝아진다",
     "silly": "엉뚱한 아침 차림 — Ben 이 창밖에서 엉뚱하게 시키면(연을 쓰고 자전거에 구슬) 들은 차례대로 차려진다",
     "wjob": "벽의 하루표와 크레용 — 손가락이 지나간 자리에 크레용 선",
     "wheel": "벽시계 바늘 — 바늘을 돌리면 숫자 자리의 첫 글자가 바뀐다(-ite · -ide · -ike 시계판)",
     "belt": "창밖 빨랫줄 — 낱말 쪽지가 집게에 걸려 지나가고 맞는 물건에 건다",
     "monster": "침대 밑 아침밥 몬스터 — 들린 낱말의 그림만 먹는다(kit · kite 가 섞여 나온다)",
     "sbox": "서랍장 칸 — i_e 는 한 칸(i 블록과 e 블록이 다리로 이어져 있다)",
     "vend": "아침 상자 — 칸에 낱말을 다 놓고 e 를 끼우면 그것이 상자에서 나온다",
     "hidden": "이불 산 셋 — 긴 i(제 이름 아이)가 숨어 있으면 이불을 톡(Amy 가 고개를 내민다). 짧은 i 면 그대로"
    },
    "ears": [
     [
      "kite",
      "kit"
     ],
     [
      "ride",
      "red"
     ],
     [
      "wake",
      "cake"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "kit",
       "kite",
       "bite"
      ],
      "look": "협탁의 작은 공구 상자에 e 가 붙자 펼쳐져 연으로 — 첫소리를 바꾸자 참새가 연 꼬리를 앙"
     },
     {
      "chain": [
       "hid",
       "hide",
       "ride"
      ],
      "look": "숨었던(hid) 곰 인형이 e 를 만나 이불 속으로 쏙(hide) — 첫소리를 바꾸자 자전거에 올라탄다"
     },
     {
      "chain": [
       "bike",
       "like"
      ],
      "look": "자전거 손잡이에 엄지 스티커가 착"
     },
     {
      "chain": [
       "cake",
       "wake"
      ],
      "look": "어제 가게의 케이크가 첫소리만 바뀌자 기지개 켜는 Amy"
     }
    ],
    "work": {
     "L": "시계 소리와 Amy 의 말을 듣고 몇 시인지 맞힌다",
     "S": "「Wake!」 「It is time!」 하고 Amy 를 깨운다",
     "R": "하루표의 낱말을 읽고 그 일을 한다",
     "W": "하루표에 오늘 한 칸을 쓴다",
     "next": "내가 쓴 하루표가 벽에 남는다 — 다음 날 아침 Amy 가 그 칸을 짚으며 일어나고, 빨랫줄 쪽지가 내 글씨로 온다"
    },
    "extras": [
     "다락 경사 천장",
     "협탁",
     "빨랫줄 창",
     "이불 산",
     "유리병 구슬",
     "토스트 접시"
    ],
    "life": [
     "밝아지는 창",
     "똑딱 시계",
     "이불 속 꿈틀",
     "창밖 연",
     "창턱의 참새"
    ],
    "ink": {
     "at": "wallL",
     "on": "벽의 하루표(네 줄) · 자전거 번호판 · 거울 아래 메모",
     "lines": 4,
     "where": {
      "time": "하루표 머리 줄",
      "five": "하루표 첫 칸(일어난 시각)",
      "bike": "자전거 번호판",
      "smile": "거울 아래 메모"
     }
    },
    "beat": "시계가 똑 딱 — 창턱 꽃봉오리가 박자에 하나씩 벌어지고, e 칸마다 e 등이 깜박",
    "way": {
     "by": "door",
     "sees": "방 문틈 너머 복도 끝 — 동그란 거울 등 불빛과 분첩 가루"
    }
   },
   "events": [
    {
     "id": "stopclock",
     "name": "멈춘 시계",
     "beat": 1,
     "game": "schant",
     "who": "amy",
     "en": "Listen! It is time! I wake!",
     "scene": "새벽. 방이 어둡고 벽시계가 멈췄다. Amy 가 이불 속에서 발로 박자를 구른다 — 낱말 자리에서 아이 목소리가 켜질 때마다 시계 바늘이 한 칸씩 움직이고 창이 조금 밝아진다. e 칸에서는 소리 없이 손끝만 톡.",
     "end": "시계가 다시 똑딱 — 창밖이 푸르스름해진다."
    },
    {
     "id": "clockwheel",
     "name": "시계 바퀴",
     "beat": 2,
     "game": "wheel",
     "who": "amy",
     "en": "Five! Nine! It is time!",
     "scene": "시계판이 바퀴가 된다. 바늘을 돌리면 숫자 자리의 첫 글자가 바뀐다 — kite · bite · ride · hide · bike · like. 진짜 낱말이면 방에서 그 일이 일어난다(연 꼬리 · 이 자국 · 이불 속에 숨기 · 엄지 스티커).",
     "end": "바늘이 아침에 서자 창으로 해가 들어온다 — Amy 가 일어나 거울 앞에서 웃는다."
    },
    {
     "id": "outside",
     "name": "연 날리러",
     "beat": 3,
     "game": "talk",
     "who": "mina",
     "en": "Hi! A kite! I ride my bike.",
     "scene": "Mina 가 창밖에서 연을 흔들며 손짓한다. Mina 의 한마디에 아이가 제 말을 고르면 그대로 — 자전거를 타고 나가거나, 하루표를 짚어 보이거나.",
     "end": "연이 하늘에 오르고 하루표에 오늘 한 칸이 찬다."
    },
    {
     "id": "breakfast",
     "name": "아침밥 몬스터",
     "beat": 0,
     "game": "monster",
     "who": "ben",
     "en": "Yum! A kite? A kit? Yum! Yum!",
     "scene": "침대 밑에서 배고픈 아침밥 몬스터가 나온다. 들린 낱말의 그림만 먹는다 — 비슷한 소리(kit · kite · ride · red)가 섞여 나온다. Ben 이 창밖에서 몬스터 흉내.",
     "end": "몬스터가 배를 두드리고 이불 속으로 쏙 — 같이 숨는 Amy."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Amy",
     "show": [
      "<time>"
     ],
     "en": "It is time!",
     "act": {
      "do": "say",
      "line": "It is time!",
      "tap": "time"
     },
     "react": "멈춘 시계가 한 번 똑 — 바늘이 바르르 떨지만 아직 움직이지 않는다.",
     "leads": "clockwheel"
    },
    {
     "arrive": "read",
     "from": "bird",
     "show": [
      "<kite>",
      "<bike>"
     ],
     "en": "A kite! A bike!",
     "act": {
      "do": "match",
      "pairs": [
       "kite",
       "bike"
      ]
     },
     "react": "창턱의 참새가 연 꼬리에 앉았다가 자전거 손잡이로 폴짝 — 창밖에서 Mina 의 목소리.",
     "leads": "outside"
    },
    {
     "arrive": "write",
     "from": "Ben",
     "show": [
      "{nose}",
      "{hat}"
     ],
     "en": "Hi! I am Ben. I like you!",
     "act": {
      "do": "go",
      "by": "door"
     },
     "react": "복도 끝 거울 등이 깜박. 문이 열렸으면 분장실로, 아직이면 문틈으로 분첩 가루만 날린다.",
     "leads": "D03"
    }
   ],
   "guest": {
    "who": "goat",
    "enter": "언덕의 염소 — 목에 방울을 달고 창턱으로 고개를 들이민다(자명종처럼 딸랑). 방울 끈에 낱말 하나.",
    "turns": [
     {
      "read": "pine",
      "pool": [
       "line"
      ],
      "opens": "읽으면 염소가 방울을 딸랑딸랑 — 창밖 소나무에서 솔방울이 우수수, 하루표 옆에 「일어났다」 도장이 쾅."
     },
     {
      "show": "kit",
      "cards": [
       "kit",
       "kite",
       "pit"
      ],
      "ans": "kit",
      "why": "kit 과 kite — 끝에 e 가 붙으면 i 가 제 이름(아이)을 부른다. 지난주 a_e 와 같은 e(+ 첫소리 k · p)",
      "again": {
       "show": "rod",
       "cards": [
        "rod",
        "ride",
        "red"
       ],
       "ans": "rod"
      }
     },
     {
      "say": "I wake.",
      "alt": "It is time!",
      "cue": "염소가 방울을 흔들며 벽시계를 뿔로 가리킨다"
     }
    ],
    "bye": "염소가 솔방울 하나를 물고 창턱에서 폴짝 — 복도 끝 거울 등이 켜진다."
   },
   "job": {
    "who": "amy",
    "ask": "하루표의 빈 줄을 손가락으로 짚고 크레용을 내민다.",
    "write": [
     "time",
     "five",
     "bike",
     "smile"
    ],
    "plan": {
     "meet": [
      "time",
      "five"
     ],
     "write": [
      "bike",
      "smile"
     ]
    },
    "carry": [
     "name",
     "plate"
    ],
    "gives": "하루표 머리 줄에 time, 첫 칸에 five — 시계가 똑딱 다시 간다. 자전거 번호판과 거울 메모에 내 글씨. 어제 가게로 보낸 엽서(name · plate)는 진열장 이름표와 접시 테두리에 붙는다."
   }
  },
  "D03": {
   "room": {
    "kind": "in",
    "owner": "ben",
    "rig": "lantern",
    "weather": "glow",
    "accent": "--a-plum",
    "sound": "거울 등 지잉 + 분첩 톡톡 + 옷걸이 딸깍",
    "center": "큰 분장 거울 — 거울 속 내 얼굴이 비어 있다(머리 모양만). 거울 둘레에 동그란 등, 꼭대기에 e 등. 분장대 앞 발판, 옆에 가발 걸이",
    "props": {
     "nose": [
      "La",
      "가짜 코 상자 — 빨간 코가 들었다. 누르면 거울 속 빈 얼굴에 코가 생긴다(숲의 달빛 둥지에서 엄마 새가 콕 찍던 그 코)"
     ],
     "rose": [
      "Lb",
      "분장대 꽃병의 장미 — 누르면 꽃잎 하나가 거울 쪽으로 날린다"
     ],
     "home": [
      "Lc",
      "분장실 구석 인형 집 — 누르면 창에 불, 굴뚝에 김"
     ],
     "bone": [
      "Ld",
      "강아지 방석 위 뼈다귀 — 누르면 강아지가 덥석"
     ],
     "rope": [
      "Ra",
      "천장에서 내려온 줄과 줄 타는 인형 — 누르면 인형이 쭉 올라간다"
     ],
     "hope": [
      "wallR",
      "거울 옆 소원 별 — 누르면 별이 반짝, 거울 등이 하나 더 켜진다"
     ],
     "note": [
      "Rc",
      "거울 아래 메모지 묶음 — 누르면 한 장 팔랑"
     ],
     "cute": [
      "Rb",
      "고양이 귀 머리띠 — 누르면 귀가 쫑긋, 거울 속 얼굴이 귀여워진다"
     ]
    },
    "sight": {
     "feet": "분장대 앞 발판의 딱지 feet — 올라서면 거울 속 발이 반짝",
     "eye": "거울 위 눈 스티커의 딱지 eye — 누르면 거울 속 얼굴이 눈을 깜박",
     "hair": "가발 걸이의 딱지 hair — 누르면 가발이 빙글, 거울 속 머리 모양이 바뀐다"
    },
    "more": {
     "cube": "반짝이 상자(네모 반듯한 정육면체)가 데굴 — 한 면 굴러갈 때마다 다른 색 반짝이",
     "tube": "물감 튜브가 쭉 — 거울 속 볼에 하트가 그려진다",
     "hole": "호랑이 물감 가방 바닥에 동그란 구멍 — 물감이 퐁퐁 굴러 나온다",
     "mule": "분장 옷걸이의 노새 탈이 고개를 끄덕 — 귀가 펄럭"
    },
    "wheel": [
     {
      "rime": "ope",
      "words": [
       "rope",
       "hope"
      ]
     },
     {
      "rime": "ose",
      "words": [
       "nose",
       "rose"
      ]
     },
     {
      "rime": "ube",
      "words": [
       "cube",
       "tube"
      ]
     }
    ],
    "hiddenNo": [
     "hop",
     "dog",
     "cut",
     "sun"
    ],
    "wear": {
     "swap": "거울 꼭대기 e 등 — 받침대에 물건을 올리고 e 블록을 끼우거나 소리 하나를 바꾸면 거울 속 얼굴에 그대로 생긴다",
     "readaloud": "분장 상자 뚜껑의 낱말 — 소리 내어 읽으면 뚜껑이 열리고 소품이 거울 앞으로",
     "silly": "엉뚱한 분장 — Ben 이 시키는 차례대로(코에 장미 · 머리에 뼈다귀) 거울 속 얼굴이 꾸며진다",
     "wjob": "거울 메모와 눈썹 연필 — 손가락이 지나간 자리에 연필 선",
     "wheel": "분장 회전 의자 — 돌릴 때마다 첫 글자 가면이 바뀐다(-ope · -ose · -ube)",
     "belt": "분장 쟁반 줄 — 낱말 카드가 지나가고 맞는 소품에 놓으면 거울 속 얼굴에 그대로",
     "monster": "분장 상자 속 배고픈 털 몬스터 — 들린 낱말의 소품만 먹는다(hop · hope 가 섞인다)",
     "sbox": "분장 상자 칸 — o_e · u_e 는 한 칸(모음 블록과 e 블록이 다리로 이어져 있다)",
     "vend": "가면 상자 — 칸에 낱말을 다 놓고 e 를 끼우면 그 가면이 상자에서 튀어나온다",
     "hidden": "분장실 문 — 긴 o · u(제 이름 오우 · 유)가 숨어 있으면 똑똑(강아지가 한 걸음 집으로). 짧은 소리면 강아지가 고개를 갸웃"
    },
    "ears": [
     [
      "hope",
      "hop"
     ],
     [
      "cute",
      "cut"
     ],
     [
      "bone",
      "bun"
     ],
     [
      "home",
      "ham"
     ]
    ],
    "swaps": [
     {
      "chain": [
       "hop",
       "hope",
       "rope"
      ],
      "look": "장난감 토끼가 폴짝(hop) — e 가 붙자 소원 별이 반짝(hope), 첫소리를 바꾸자 별에서 줄이 스르르 내려온다(rope)"
     },
     {
      "chain": [
       "cut",
       "cute"
      ],
      "look": "가위가 종이를 싹둑(cut) — e 가 붙자 잘린 종이가 고양이 귀 머리띠로(cute)"
     },
     {
      "chain": [
       "nose",
       "rose"
      ],
      "look": "빨간 코가 첫소리만 바뀌자 장미로 피어난다"
     }
    ],
    "work": {
     "L": "Ben 이 말하는 분장을 듣는다",
     "S": "거울 앞에서 「My nose!」 하고 말한다 — 거울 속 얼굴에 생긴다",
     "R": "분장 쟁반의 낱말 카드를 읽고 소품을 고른다",
     "W": "거울 메모를 쓴다",
     "next": "내가 쓴 메모가 그 소품 앞에 붙어 남는다 — 다음 날 거울 속 얼굴이 메모를 읽고 그대로 분장하고, 쟁반 카드도 내 글씨로 온다"
    },
    "extras": [
     "분장대",
     "분첩과 붓",
     "가발 걸이",
     "옷걸이 줄",
     "강아지 방석",
     "발판"
    ],
    "life": [
     "거울 등 불빛",
     "장미 꽃잎",
     "뼈다귀 문 강아지",
     "줄 타는 인형",
     "분첩에서 날리는 가루"
    ],
    "ink": {
     "at": "frame",
     "on": "거울 메모(네 장 — 쓴 메모가 그 소품 앞에 붙는다)",
     "lines": 4,
     "where": {
      "nose": "빨간 코 상자 뚜껑",
      "home": "인형 집 문패",
      "rose": "꽃병 리본",
      "cute": "머리띠 상자 이름표"
     }
    },
    "beat": "분첩이 톡 톡 — 거울 등이 박자에 하나씩 켜지고, e 칸마다 꼭대기 e 등이 깜박",
    "way": {
     "by": "door",
     "sees": "분장실 뒷문 너머 — 화덕의 주황빛과 쿵 쿵 기계 소리"
    }
   },
   "events": [
    {
     "id": "blankface",
     "name": "빈 거울",
     "beat": 1,
     "game": "swap",
     "who": "ben",
     "en": "Oh! My nose! My face!",
     "scene": "분장 거울 속 내 얼굴이 비어 있다. 받침대에 물건을 올리고 e 블록을 끼우거나 소리 하나를 바꾸면 — 거울 속 얼굴에 하나씩 생긴다(빨간 코 · 장미 꽂은 머리 · 고양이 귀).",
     "end": "거울 속 얼굴이 다 차고 Ben 이 똑같은 분장을 하고 거울 뒤에서 튀어나온다."
    },
    {
     "id": "maketray",
     "name": "분장 쟁반",
     "beat": 2,
     "game": "belt",
     "who": "mina",
     "en": "A rose! It is cute!",
     "scene": "분장 쟁반 줄에 낱말 카드가 지나간다. 읽고 맞는 소품에 놓으면 거울 속 얼굴에 그대로 — 장미를 꽂으면 거울이 반짝, 귀엽다!",
     "end": "거울 둘레 등이 하나씩 다 켜진다."
    },
    {
     "id": "doghome",
     "name": "강아지 집으로",
     "beat": 3,
     "game": "hidden",
     "who": "ben",
     "en": "Listen! A bone! I am home.",
     "scene": "강아지가 뼈다귀를 물고 문 앞에서 기다린다. 들리는 낱말에 긴 o · u 가 숨어 있으면 문을 똑똑 — 강아지가 한 걸음씩 집으로. 짧은 소리(hop · dog · cut · sun)에는 강아지가 고개를 갸웃.",
     "end": "강아지가 인형 집에 쏙 — 거울에 메모가 붙는다."
    },
    {
     "id": "kitbox",
     "name": "분장 상자 칸",
     "beat": 0,
     "game": "sbox",
     "who": "max",
     "en": "A note! A rope! Wow!",
     "scene": "분장 상자의 칸에 소리 블록을 놓는다 — o_e 는 한 칸(o 와 e 가 다리로 이어진 블록). 다 맞으면 상자에서 그 소품이 튀어나온다.",
     "end": "상자 뚜껑에 줄 타는 인형이 걸터앉는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<rose>",
      "<nose>"
     ],
     "en": "A rose! My nose!",
     "act": {
      "do": "bring",
      "word": "rose",
      "to": "nose"
     },
     "react": "장미가 빨간 코 위에 얹히자 거울 속 얼굴이 재채기 — 꽃잎이 쟁반 쪽으로 흩날린다.",
     "leads": "maketray",
     "note": "장미를 빨간 코 상자 위로. 사건이 끝나면 장미는 꽃병으로 돌아간다"
    },
    {
     "arrive": "read",
     "from": "dog",
     "show": [
      "<bone>"
     ],
     "en": "A bone! A bone! I am home.",
     "act": {
      "do": "find",
      "word": "bone"
     },
     "react": "강아지가 꼬리를 흔들며 뼈다귀를 덥석 — 문 쪽을 본다.",
     "leads": "doghome"
    },
    {
     "arrive": "write",
     "from": "Max",
     "show": [
      "{cap}",
      "{kit}"
     ],
     "en": "Hi! I am Max. Go! Go!",
     "act": {
      "do": "go",
      "by": "door"
     },
     "react": "뒷문 너머에서 쿵 — 문이 열렸으면 공방으로, 아직이면 문틈으로 화덕 빛만 일렁인다.",
     "leads": "D04"
    }
   ],
   "guest": {
    "who": "tiger",
    "enter": "바닷가 천막의 호랑이 — 분장하러 왔다. 얼굴 줄무늬가 반쯤 지워졌고, 물감 가방 매듭에 낱말 하나.",
    "turns": [
     {
      "read": "hole",
      "pool": [
       "mule"
      ],
      "opens": "읽으면 매듭이 풀린다 — 가방 바닥에 동그란 구멍, 물감이 퐁퐁 굴러 나온다. 호랑이가 거울 앞에 앉는다(줄무늬를 그려 달라는 몸짓)."
     },
     {
      "show": "hop",
      "cards": [
       "hop",
       "hope",
       "hip"
      ],
      "ans": "hop",
      "why": "hop 과 hope — 끝의 e 가 o 를 제 이름(오우)으로 부른다(+ 가운데 o · i). 화덕의 토끼와 이번 주의 소원 별",
      "again": {
       "show": "cut",
       "cards": [
        "cut",
        "cute",
        "cat"
       ],
       "ans": "cut"
      }
     },
     {
      "say": "It is cute!",
      "alt": "This is my nose.",
      "cue": "호랑이가 거울 앞에서 새 줄무늬를 보고 수염을 쓸어 본다"
     }
    ],
    "bye": "호랑이가 줄무늬를 뽐내며 꼬리로 발판을 탁 — 뒷문 너머 화덕 빛이 커진다."
   },
   "job": {
    "who": "ben",
    "ask": "거울 메모 묶음을 부채처럼 펴고 눈썹 연필을 내민다.",
    "write": [
     "nose",
     "home",
     "rose",
     "cute"
    ],
    "plan": {
     "meet": [
      "nose",
      "home"
     ],
     "write": [
      "rose",
      "cute"
     ]
    },
    "carry": [
     "five",
     "smile"
    ],
    "gives": "메모가 그 소품 앞에 붙자 거울 속 얼굴에 그 분장이 남는다. 인형 집 문패에 home — 강아지가 그 집에 들어간다. 아침 방으로 보낸 엽서(five · smile)는 하루표와 거울 메모에 붙는다."
   }
  },
  "D04": {
   "room": {
    "kind": "press",
    "owner": "max",
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-red",
    "sound": "톱니 철컥 + 화덕 불 + 찍는 기계 쿵",
    "center": "공방 한가운데 낱말 찍는 기계 — 위 깔때기로 글자 블록이 들어가고 아래 입구로 낱말 판이 찍혀 나온다. 기계 오른쪽 끝에 e 블록 끼우는 구멍과 e 등. 오른쪽 벽에 견본판(갈고리 여덟 쌍 — 왼쪽 갈고리 = 짧은 낱말, 오른쪽 = e 가 붙은 낱말)",
    "spots": {
     "press": [
      0,
      -2.8
     ],
     "tray": [
      -4.6,
      0.6
     ],
     "stage": [
      3.2,
      0.6
     ],
     "board": [
      5.6,
      -2.4
     ],
     "owner": [
      -3,
      -2.4
     ],
     "me": [
      -1.4,
      2.4
     ],
     "guide": [
      1.4,
      2.4
     ],
     "guest": [
      6.6,
      1
     ],
     "post": [
      -7.2,
      4.2
     ],
     "frame": [
      5.4,
      3.6
     ],
     "door": [
      7.4,
      4.4
     ]
    },
    "board": {
     "hooks": 8,
     "sides": [
      "짧은 낱말",
      "e 가 붙은 낱말"
     ]
    },
    "looks": {
     "cap": "빵모자",
     "cape": "빵모자가 펄럭이는 망토로",
     "kit": "공구 상자",
     "kite": "공구 상자가 펼쳐져 연으로",
     "hop": "폴짝 뛰는 장난감 토끼",
     "hope": "토끼가 앞발을 모으고 올려다보는 소원 별",
     "cut": "가위가 종이를 싹둑",
     "cute": "잘린 종이가 귀여운 고양이 얼굴로",
     "mat": "현관 발깔개",
     "mate": "발깔개 위에 나란히 선 단짝 인형 둘",
     "tap": "수도꼭지",
     "tape": "꼭지가 둘둘 감긴 테이프로",
     "pin": "압정",
     "pine": "압정이 쑥 자라 작은 소나무로",
     "not": "고개를 젓는 인형(아니야)",
     "note": "인형이 쪽지를 펼쳐 보인다"
    },
    "wear": {
     "swap": "찍는 기계의 e 구멍 — e 블록을 끼우면 받침대의 것이 변하고, 빼면 돌아온다",
     "hidden": "기계 옆 망치 종 — 긴 소리(제 이름을 부르는 모음)가 숨어 있으면 종을 땡",
     "sbox": "찍는 기계 깔때기 칸 — 짧은 낱말은 c · a · p 세 칸, e 가 붙으면 모음 칸에 e 다리가 걸려 c · a_e · p(칸 수는 그대로 셋)",
     "belt": "찍혀 나온 낱말 판이 실려 가는 벨트 — 읽고 맞는 짝 갈고리(짧은 쪽 · 긴 쪽)에 건다",
     "wheel": "기계 왼쪽 손잡이 바퀴 — 첫 글자를 돌리며 -ape · -ite · -ote 가족을 찍는다",
     "wtrain": "화덕 둘레를 도는 광석 수레 — 칸마다 그림 하나(짧은 것과 긴 것이 번갈아)",
     "wjob": "공방 견본판 — 짧은 낱말을 쓰면 옆 칸에 그대로 비치고, 끝에 e 만 덧붙여 쓴다"
    },
    "work": {
     "L": "기계가 찍는 소리를 듣고 짧은지 긴지 가른다",
     "S": "받침대의 것을 「It is a cap. It is a cape!」 하고 말한다",
     "R": "찍혀 나온 낱말 판을 읽고 짝 갈고리에 건다",
     "W": "견본판에 짝을 쓴다",
     "next": "내가 쓴 견본판이 벽에 남는다 — 다음 날 기계는 견본판의 내 글씨를 보고 찍고, 벨트의 판도 내 글씨로 온다"
    },
    "extras": [
     "깔때기",
     "톱니 벽",
     "화덕",
     "광석 수레 길",
     "e 블록 바구니",
     "견본판 갈고리 여덟 쌍"
    ],
    "life": [
     "도는 톱니",
     "화덕 불",
     "찍혀 나오는 낱말",
     "깜박이는 e 등",
     "화덕 앞에서 조는 공방 고양이"
    ],
    "ink": {
     "at": "board",
     "on": "공방 견본판(갈고리 여덟 쌍)",
     "lines": 2
    },
    "beat": "기계가 쿵 — 쉬고 — 쿵. e 칸에서 e 등이 번쩍",
    "way": {
     "by": "lantern",
     "sees": "공방 문밖 등불 길 끝 — 그림책방 2층 독서등"
    }
   },
   "events": [
    {
     "id": "brokenpress",
     "name": "고장 난 찍는 기계",
     "beat": 1,
     "game": "swap",
     "who": "max",
     "en": "Oh! A cap! A cape! A cap!",
     "scene": "Max 의 공방. 찍는 기계가 e 를 붙였다 뗐다 — 같은 판이 모자였다 망토였다. e 블록을 제대로 끼우거나 빼서 들린 낱말에 맞추면 받침대의 것이 그 모습으로 멈춘다.",
     "end": "세 짝(cap · kit · cut)이 받침대에서 멈추고 기계가 덜컹 숨을 고른다."
    },
    {
     "id": "pairbelt",
     "name": "찍혀 나온 짝",
     "beat": 2,
     "game": "belt",
     "who": "ben",
     "en": "A kit! A kite! A tap! A tape!",
     "scene": "벨트로 낱말 판이 줄줄이 나온다. 읽고 짝 갈고리에 걸면(짧은 쪽 · 긴 쪽) 받침대의 물건이 그 모습으로 — 상자가 연으로, 꼭지가 테이프로.",
     "end": "견본판에 짝 셋이 더 걸린다."
    },
    {
     "id": "sampleboard",
     "name": "견본판",
     "beat": 3,
     "game": "wjob",
     "who": "max",
     "en": "It is a cap. It is a cape!",
     "scene": "Max 가 견본판의 빈 갈고리를 두드린다. 짧은 낱말을 쓰면 옆 칸에 그대로 비치고, 아이는 끝에 e 만 덧붙인다 — 다 쓴 짝마다 기계 등이 하나씩.",
     "end": "여덟 쌍이 나란히 — 기계가 다시 힘차게 쿵 쿵."
    },
    {
     "id": "hammerbell",
     "name": "망치 종",
     "beat": 0,
     "game": "hidden",
     "who": "amy",
     "en": "Listen! Hop? Hope!",
     "scene": "기계가 낱말을 찍을 때마다 소리가 난다. 긴 소리가 숨어 있으면 망치 종을 땡 — 짧은 소리면 그대로 둔다. 짝이 붙어서 나온다(hop 다음에 hope).",
     "end": "종이 울린 판만 견본판으로 날아가 오른쪽 갈고리에 걸린다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<cap>",
      "<cape>"
     ],
     "en": "A cap! A cape!",
     "act": {
      "do": "match",
      "pairs": [
       "cap",
       "cape"
      ]
     },
     "react": "받침대에 모자와 망토가 나란히 — 기계의 e 구멍이 궁금한 듯 깜박.",
     "leads": "pairbelt",
     "note": "낱말 둘을 받침대 위의 모자 · 망토 그림에 잇는다"
    },
    {
     "arrive": "read",
     "from": "Ben",
     "show": [
      "<kit>",
      "<kite>"
     ],
     "en": "It is a kit. It is a kite!",
     "act": {
      "do": "say",
      "line": "It is a kit. It is a kite!",
      "tap": "kite"
     },
     "react": "공구 상자가 펼쳐져 연이 되어 공방 천장을 한 바퀴 — 견본판 빈 갈고리가 흔들린다.",
     "leads": "sampleboard"
    },
    {
     "arrive": "write",
     "from": "Mina",
     "show": [
      "{book}",
      "{cake}"
     ],
     "en": "Hi! I am Mina. I like you!",
     "act": {
      "do": "go",
      "by": "lantern"
     },
     "react": "등불 길 끝 책방 독서등이 깜박. 문이 열렸으면 등불 길로, 아직이면 창으로 불빛만.",
     "leads": "D05"
    }
   ],
   "guest": {
    "who": "octopus",
    "enter": "숲 연못의 문어 — 냄비 대신 공구 가방을 다리마다 하나씩 들고 온다. 맨 앞 가방 자물쇠에 낱말 하나가 짧게 적혀 있고 그 옆에 e 구멍.",
    "turns": [
     {
      "read": "tube",
      "from": "tub",
      "pool": [
       [
        "cub",
        "cube"
       ],
       [
        "hid",
        "hide"
       ]
      ],
      "opens": "짧은 낱말(tub)을 읽고 e 를 끼워 긴 낱말(tube)로 읽으면 가방이 열린다 — 기름 튜브. 기계 톱니에 쭉 짜 넣자 쿵 소리가 부드러워진다."
     },
     {
      "show": "kite",
      "cards": [
       "kite",
       "kit",
       "bite"
      ],
      "ans": "kite",
      "why": "e 가 있나(kite · kit) + 첫소리(k · b) — 끝과 앞을 둘 다 보고 읽는다",
      "again": {
       "show": "note",
       "cards": [
        "note",
        "not",
        "nose"
       ],
       "ans": "note"
      }
     },
     {
      "say": "It is a kit. It is a kite!",
      "alt": "It is a cap. It is a cape!",
      "cue": "문어가 다리 둘로 공구 상자를 펼쳐 연을 만든다"
     }
    ],
    "bye": "문어가 다리 여덟로 견본판을 한 번씩 톡톡 두드리고 연못 쪽으로 — 등불 길에 불이 켜진다."
   },
   "job": {
    "who": "max",
    "ask": "견본판의 빈 갈고리 여덟을 망치로 차례로 톡톡.",
    "write": [
     "cap → cape",
     "kit → kite",
     "cut → cute",
     "hop → hope",
     "tap → tape"
    ],
    "plan": {
     "write": [
      "cap",
      "kit",
      "cut"
     ],
     "again": [
      "hop",
      "tap"
     ]
    },
    "carry": [],
    "rule": "짧은 낱말을 다 쓰면 옆 칸에 그대로 비친다 — 아이는 끝에 e 만 덧붙여 쓴다(짝 하나 = 짧은 낱말 + e 한 자). 쓰는 날 짝 셋(열두 자) · 다시 온 날 짝 둘",
    "gives": "견본판에 아이 글씨 짝이 걸린다 — e 만 강조색. 짝이 걸릴 때마다 기계 등이 하나씩 켜지고, 다 차면 기계가 고쳐진다."
   }
  },
  "D05": {
   "room": {
    "kind": "book2",
    "owner": "mina",
    "rig": "lantern",
    "weather": "moon",
    "accent": "--a-steel",
    "sound": "책장 넘기는 소리 + 창밖 바람 + 독서등 지잉",
    "center": "2층 창가의 독서대 셋. 책 세 권이 또 안개에 싸였다. 「내가 읽은 책」 칸에 지난번 세 권과 독서 카드 세 장이 꽂혀 있다",
    "stands": [
     [
      -4.4,
      -1.6
     ],
     [
      0,
      -2.8
     ],
     [
      4.4,
      -1.6
     ]
    ],
    "texts": [
     {
      "line": "I am late. It is a race.",
      "who": "amy",
      "day": "meet",
      "card": "I am late.",
      "scene": "Amy 가 신발 끈을 매다 벌떡 — 첫 문장을 읽으면 시계를 보고 깜짝, 쪽이 넘어가고 둘째 문장에 결승 끈을 향해 달린다. race 를 건너뛰면 Amy 가 혼자 제자리 뛰기"
     },
     {
      "line": "It is a big cake. I like cake.",
      "who": "max",
      "day": "read",
      "card": "I like cake.",
      "scene": "Max 앞에 층층이 큰 케이크 — 첫 문장에 촛불이 켜지고, 쪽이 넘어가 둘째 문장에 Max 가 한 입. big 을 건너뛰면 케이크가 컵케이크만 하게"
     },
     {
      "line": "You are big. I swim.",
      "who": "ben",
      "day": "write",
      "card": "You are big.",
      "unseen": true,
      "scene": "바다에서 Ben 이 큰 고래를 올려다본다 — 첫 문장에 고래가 물을 뿜고, 둘째 문장에 Ben 이 그 옆을 쭉 헤엄친다. 아무도 먼저 읽어 주지 않는 글 — 손님이 들고 온다"
     }
    ],
    "wear": {
     "story": "독서 의자 — Mina 가 한 편을 읽어 주고, 장면 조각 둘(시계 · 결승 끈)을 들은 차례로 독서대에 놓는다",
     "book": "안개 책 — 낱말을 짚으며 읽으면 안개가 걷히고, 두 문장 사이에서 쪽이 한 번 넘어간다(장면 둘)",
     "readaloud": "책에서 빠져나온 낱말 카드(late · race · cake · big) — 읽으면 책 속 제자리로 날아가 꽂힌다",
     "belt": "책 반납 벨트 — 두 문장 띠가 지나가고 맞는 그림 책에 꽂는다",
     "echo": "창가 소라 껍데기 — 두 문장을 읽으면 한 문장씩 되돌아 들린다. 들리는 동안 그 쪽의 그림이 움직인다",
     "swrite": "독서 카드 — 틀(I am · I like · You are)은 칩으로 놓고 빈칸 낱말만 손으로",
     "wjob": "독서 카드 꽂이 — 다 쓴 카드를 그 책 옆에 꽂는다"
    },
    "work": {
     "L": "한 편을 듣고 장면 조각을 차례로 놓는다",
     "S": "두 문장을 소리 내어 읽는다 — 소라 껍데기가 한 문장씩 돌려준다",
     "R": "안개 속의 책을 혼자 읽어 두 장면을 다 연다",
     "W": "독서 카드에 한 줄을 쓴다(빈칸 낱말은 손으로)",
     "next": "내가 쓴 독서 카드가 책 옆에 꽂혀 있다 — 「내가 읽은 책」 칸이 둘째 줄로 넘어가고, 다음에 그 책을 펴면 카드의 내 글씨가 먼저 보인다"
    },
    "extras": [
     "독서대 셋",
     "독서 의자",
     "「내가 읽은 책」 칸",
     "책 반납 벨트",
     "창가 소라 껍데기",
     "아래층으로 가는 계단"
    ],
    "life": [
     "독서등",
     "걷히는 안개",
     "책방 고양이",
     "넘어가는 책장",
     "창밖에서 흔들리는 나뭇가지"
    ],
    "ink": {
     "at": "frame",
     "on": "독서 카드 세 장(책마다 한 장 — 틀은 칩, 빈칸 낱말만 손으로)",
     "lines": 3
    },
    "beat": "책장을 툭 툭 넘기는 소리 — 독서등이 박자에 숨 쉰다",
    "way": {
     "by": "road",
     "sees": "책방 창밖 큰길 — 하늘이 회색으로 흐려지고 창유리에 빗방울 하나"
    }
   },
   "events": [
    {
     "id": "againmist",
     "name": "또 안개",
     "beat": 1,
     "game": "story",
     "who": "mina",
     "en": "Listen! I am late. It is a race.",
     "scene": "책 세 권이 또 안개에 싸였다. Mina 가 첫 권을 읽어 준다 — 들은 차례대로 장면 조각(시계 · 결승 끈)을 독서대에 놓으면 첫 권의 안개가 옅어진다. 이번에는 두 문장이라 조각도 둘.",
     "end": "첫 권 표지에 달리는 Amy 가 비친다."
    },
    {
     "id": "twoscenes",
     "name": "두 장면",
     "beat": 2,
     "game": "book",
     "who": "amy",
     "en": "It is a big cake! I like cake.",
     "scene": "둘째 권. 낱말을 하나씩 짚으며 소리 내어 읽으면 안개가 걷힌다 — 첫 문장에 큰 케이크, 쪽이 넘어가 둘째 문장에 Max 가 한 입.",
     "end": "두 권이 책장에 꽂힌다 — 셋째 권만 안개 속."
    },
    {
     "id": "secondcard",
     "name": "두 장째 카드",
     "beat": 3,
     "game": "swrite",
     "who": "mina",
     "en": "I am late. I like cake.",
     "scene": "독서 카드 — 틀 칩(I am · I like)을 놓고 빈칸 낱말만 손으로 쓴다. 다 쓴 카드가 그 책 옆에 꽂히고 책등에 내 표시가 생긴다.",
     "end": "「내가 읽은 책」 칸이 둘째 줄로 넘어간다 — 계단에서 젖은 발소리."
    },
    {
     "id": "shellecho",
     "name": "소라 메아리",
     "beat": 0,
     "game": "echo",
     "who": "ben",
     "en": "I am late! It is a race!",
     "scene": "창가 소라 껍데기에 두 문장을 읽으면 한 문장씩 되돌아 들린다 — 들리는 동안 책 속 그림이 다시 움직인다. Ben 이 소라에 귀를 대고 키득.",
     "end": "소라 속에서 파도 소리가 한 번 — 셋째 권의 안개가 술렁인다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Amy",
     "show": [
      "<race>"
     ],
     "en": "It is a race.",
     "act": {
      "do": "say",
      "line": "It is a race.",
      "tap": "race"
     },
     "react": "첫 권 속 Amy 가 결승 끈을 끊고 손을 번쩍 — 둘째 권의 안개가 술렁인다.",
     "leads": "twoscenes",
     "note": "낱말을 하나씩 짚어 읽는다"
    },
    {
     "arrive": "read",
     "from": "cat",
     "show": [
      "<big>",
      "<cake>"
     ],
     "en": "A big cake!",
     "act": {
      "do": "find",
      "word": "cake"
     },
     "react": "고양이가 케이크 크림을 앞발로 콕 — 독서 카드 꽂이를 앞발로 톡.",
     "leads": "secondcard",
     "note": "둘째 권의 장면에서 케이크를 찾아 누른다"
    },
    {
     "arrive": "write",
     "from": "Amy",
     "show": [
      "{rain}",
      "{hat}"
     ],
     "en": "Hi! I am Amy. I like rain!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "창유리에 빗방울이 톡톡. 문이 열렸으면 큰길로, 아직이면 창밖 하늘만 회색으로.",
     "leads": "E01"
    }
   ],
   "guest": {
    "who": "Ben",
    "enter": "Ben 이 머리가 젖은 채 계단을 올라온다 — 안개에 싸인 셋째 권을 수건에 싸서 안았다. 표지에 두 문장 — 아무도 먼저 읽어 주지 않은 글.",
    "turns": [
     {
      "read": "You are big. I swim.",
      "pool": [
       "I see a big kite.",
       "It is a cute cat."
      ],
      "opens": "읽으면 안개가 걷히고 책이 펼쳐진다 — 큰 고래가 물을 뿜고 Ben 이 그 옆을 쭉 헤엄친다. 수건에서 물방울이 똑."
     },
     {
      "show": "cake",
      "cards": [
       "It is a big cake.",
       "It is a big cape.",
       "It is a big cap."
      ],
      "ans": "It is a big cake.",
      "why": "끝 낱말의 k · p 와 끝 e — 문장 끝까지 한 글자도 건너뛰지 않고 읽는다(cake · cape · cap)"
     },
     {
      "say": "It is a race.",
      "alt": "I am late!",
      "cue": "Ben 이 젖은 머리를 털다 말고 책 속 결승 끈을 가리킨다"
     }
    ],
    "bye": "세 권이 「내가 읽은 책」 칸에 나란히 — Ben 이 수건을 목에 걸고 창밖 흐린 하늘을 가리킨다."
   },
   "job": {
    "who": "Mina",
    "ask": "독서 카드 세 장을 부채처럼 펴 보이고 연필을 내민다.",
    "write": [
     "I am late.",
     "I like cake.",
     "You are big."
    ],
    "plan": {
     "read": [
      "I am late."
     ],
     "write": [
      "I like cake."
     ],
     "again": [
      "You are big."
     ]
    },
    "carry": [],
    "rule": "책마다 카드 한 장 — 지문의 한 문장. 틀(I am · I like · You are)은 칩으로 놓고 빈칸 낱말(late · cake · big)만 손으로 쓴다(하루 한 장 · 열두 자 안). 쓰는 날에는 두 장 가운데 더 좋아하는 쪽을 먼저 골라도 된다",
    "gives": "독서 카드가 책 옆에 꽂히고 책등에 내 표시. 세 장이 다 차면 「내가 읽은 책」 칸이 둘째 줄까지 찬다."
   }
  },
  "E01": {
   "room": {
    "kind": "in",
    "owner": "amy",
    "rig": "day",
    "weather": "cloud",
    "accent": "--a-fish",
    "sound": "유리창에 빗방울 톡톡 + 처마 물받이 졸졸 + 먼 천둥 한 번",
    "center": "Amy 네 집 아래층 큰 창가. 뒤 벽이 통째로 유리창이고 김이 뽀얗게 서려 있다. 창밖은 온통 회색(이야기 ①) — 말하는 낱말에 따라 비가 오고 해가 난다(②), 비 갠 뒤에는 무지개와 젖은 길(③). 창턱 한가운데 짝 그네(두 자리 — 이 구역의 표지)",
    "pair": "창턱의 두 자리 그네 — a 블록과 i 블록이 나란히 앉으면 앞 블록(a)만 입을 벌려 제 이름(에이)을 부르고 뒤 블록은 입을 꼭 다문 채 발만 까딱. a 와 y 가 앉아도 같다. 그네는 낱말 가운데에도(rain), 낱말 끝에도(day) 걸린다",
    "props": {
     "rain": [
      "winL",
      "큰 창의 왼쪽 유리 — 빗줄기가 유리를 타고 흐른다. 누르면 후두둑 굵어진다(숲의 비 오는 여왕의 뜰에서 귀로 만난 그 비)"
     ],
     "wait": [
      "wallL",
      "왼쪽 유리 너머 처마 밑 — 우체부가 가방을 안고 서서 발끝을 까딱까딱(기다린다). 누르면 손목시계를 본다"
     ],
     "mail": [
      "Lb",
      "창가 탁자 위 편지 다발 — 누르면 맨 위 봉투가 팔랑 뒤집힌다"
     ],
     "day": [
      "wallR",
      "오른쪽 벽 날씨판 — 요일 일곱 칸과 날씨 그림 자리. 누르면 오늘 칸이 환해진다"
     ],
     "play": [
      "Rc",
      "놀이 깔개 위 공과 블록 — 누르면 공이 통통 튄다"
     ],
     "say": [
      "Ra",
      "창턱 횃대의 앵무새 — 누르면 방금 들은 낱말을 그대로 따라 말한다"
     ],
     "way": [
      "back",
      "창밖 뒤로 멀리 뻗은 길 — 누르면 길 끝까지 가로등이 차례로 켜진다(비가 그치면 나갈 길)"
     ],
     "gray": [
      "winR",
      "오른쪽 유리 너머 회색 구름 — 누르면 구름이 꾸물꾸물 뭉친다"
     ]
    },
    "more": {
     "tail": "창턱에서 자던 고양이의 꼬리가 살랑 — 꼬리로 유리의 김을 쓱 닦는다",
     "pay": "우체부에게 우표값 동전을 내민다 — 가방 저금통에 짤랑",
     "nail": "날씨판을 건 못이 헐렁 — 톡 치면 판이 바로 걸린다",
     "hay": "삼촌의 수레에 실린 건초 더미 — 덮개가 걷히고 마른 풀 냄새가 폴폴"
    },
    "sight": {
     "rainy": "날씨판의 비 그림 딱지(통말) — 누르면 창밖에 비가 온다",
     "sunny": "날씨판의 해 그림 딱지(통말) — 누르면 구름이 갈라지고 해가 난다"
    },
    "wheel": [
     {
      "rime": "ay",
      "words": [
       "day",
       "say",
       "way",
       "pay",
       "play",
       "gray"
      ]
     },
     {
      "rime": "ail",
      "words": [
       "mail",
       "tail"
      ]
     }
    ],
    "wear": {
     "slide": "창유리 빗물 길 — 글자 물방울이 유리를 타고 주르르 내려와 창턱에서 합쳐진다. a 와 i 는 한 방울에 두 글자(ai)로 같이 흐른다",
     "readaloud": "날씨판에 붙은 낱말 카드 — 소리 내어 읽으면 카드가 뒤집혀 그림이 되고 창밖 그 자리가 제 색으로",
     "magic": "날씨 주문 — 창을 향해 낱말을 말하면 창밖이 그대로 된다(rain 하면 비 · sunny 하면 해 · gray 하면 구름)",
     "wjob": "김 서린 창 — 손가락이 지나간 자리만 김이 닦여 맑은 유리 선이 된다",
     "wheel": "우산 바퀴 — 펼친 우산을 돌리면 살 끝에 달린 첫 글자가 바뀐다(-ay · -ail 손잡이 위에서)",
     "belt": "처마 밑 빨랫줄 우편 — 낱말이 적힌 봉투가 집게에 걸려 지나가고 맞는 그림 우편함에 넣는다",
     "catch": "빗방울 받기 — 처마에서 떨어지는 큰 물방울 속에 그림이 들었다. 들린 낱말의 방울만 양동이로 받는다(rain · ran 이 섞여 떨어진다)",
     "sbox": "창턱 화분 칸 — ai · ay 는 한 칸에 두 글자(짝 블록)",
     "wtrain": "물받이 종이배 줄 — 종이배마다 그림 하나, 지나갈 때 이름을 대면 돛에 불",
     "sstory": "날씨 이야기 판 — 낱말 카드를 틀에 끼우면 창밖에서 그대로 벌어진다"
    },
    "ears": [
     [
      "rain",
      "ran"
     ],
     [
      "wait",
      "wet"
     ],
     [
      "play",
      "plate"
     ],
     [
      "way",
      "wake"
     ]
    ],
    "slides": [
     {
      "chain": [
       "ran",
       "rain"
      ],
      "look": "달리던(ran) 장난감 강아지 — i 블록이 a 옆자리에 폴짝 앉자 창밖에 비가 쏟아진다"
     },
     {
      "chain": [
       "mail",
       "tail"
      ],
      "look": "편지 봉투가 첫소리를 바꾸자 고양이 꼬리로 — 살랑"
     },
     {
      "chain": [
       "day",
       "say",
       "way"
      ],
      "look": "날씨판의 오늘 칸이 앵무새의 한마디로, 또 창밖 길로 — 첫소리 하나씩"
     },
     {
      "chain": [
       "pay",
       "play"
      ],
      "look": "우표값 동전이 l 을 만나 통통 튀는 공으로"
     }
    ],
    "tale": {
     "frames": [
      "It is a ___ day.",
      "I like ___!"
     ],
     "chips": [
      "gray",
      "rainy",
      "sunny",
      "rain",
      "mail",
      "play"
     ],
     "look": "고른 대로 창밖이 변한다 — 「It is a mail day.」 면 하늘에서 편지 봉투가 비처럼 내리고, 「It is a play day.」 면 구름이 공이 되어 통통 튄다"
    },
    "work": {
     "L": "날씨를 듣고 창밖을 고른다(비 · 해 · 구름)",
     "S": "창을 향해 말한다 — 말한 대로 비가 오고 해가 난다",
     "R": "날씨판과 봉투의 낱말을 읽는다",
     "W": "김 서린 창에 손가락으로 오늘 날씨를 쓴다",
     "next": "내가 쓴 글씨가 창에 남는다 — 다음 날 김이 다시 서려도 내 글씨 자리만 맑고, 날씨판 카드와 봉투의 낱말도 내 글씨로 온다"
    },
    "extras": [
     "창턱 쿠션",
     "물받이와 양동이",
     "우산꽂이",
     "장화 한 켤레",
     "창가 탁자",
     "유리 구슬 모빌"
    ],
    "life": [
     "창밖 비·해",
     "김 서린 유리",
     "기다리는 우체부",
     "물방울 길",
     "꼬리를 살랑이는 창턱 고양이"
    ],
    "ink": {
     "at": "center",
     "on": "김 서린 창(두 줄) · 날씨판 오늘 칸 · 우체부 쪽 유리",
     "lines": 4,
     "where": {
      "rain": "김 서린 창 왼쪽 유리 — 쓴 자리로 빗물이 흘러내린다",
      "wait": "우체부 쪽 유리 — 우체부가 글씨를 보고 손을 흔든다",
      "day": "날씨판의 오늘 칸",
      "play": "김 서린 창 오른쪽 유리 — 쓴 자리 너머로 물웅덩이가 보인다"
     }
    },
    "beat": "빗방울이 양동이에 톡 톡 — 짝 그네가 박자에 흔들리고, 짝 조각마다 앞 블록이 입을 길게 벌린다",
    "way": {
     "by": "road",
     "sees": "비 갠 길 끝 학교 — 교실 창밖 큰 나무에 아직 잎이 없다"
    }
   },
   "events": [
    {
     "id": "grayday",
     "name": "올 듯 말 듯",
     "beat": 1,
     "game": "magic",
     "who": "amy",
     "en": "Rain! Rain! Oh! It is rain!",
     "scene": "창밖은 온통 회색 — 비가 올 듯 말 듯. Amy 가 장화를 신고 창에 코를 붙이고 있다. 창을 향해 낱말을 말하면 창밖이 그대로 된다 — rain 하면 후두둑, mail 하면 우체부 가방이 반짝.",
     "end": "비가 쏟아지고 우체부가 처마 밑으로 뛰어든다 — 짝 그네가 흔들."
    },
    {
     "id": "bigdrops",
     "name": "큰 빗방울",
     "beat": 2,
     "game": "catch",
     "who": "ben",
     "en": "Listen! Rain? Ran? Rain!",
     "scene": "처마 끝에서 큰 물방울이 뚝뚝 — 방울마다 그림이 들었다. 들린 낱말의 방울만 양동이로 받는다. 비슷한 소리(rain · ran, wait · wet)가 섞여 떨어진다. 처마 밑에서 기다리는 우체부도 모자로 한 방울.",
     "end": "양동이가 찰랑 — 물에 비친 구름 사이로 해가 한 줄기."
    },
    {
     "id": "foggyglass",
     "name": "김 서린 창",
     "beat": 3,
     "game": "wjob",
     "who": "amy",
     "en": "It is a gray day. I play!",
     "scene": "비가 그쳤다. Amy 가 김 서린 창에 입김을 호 분다. 오늘 날씨를 손가락으로 쓰면 쓴 자리만 맑아지고, 그 자리로 창밖이 보인다 — 무지개, 젖은 길, 손 흔드는 우체부.",
     "end": "글씨 너머로 해가 난다 — Amy 가 문을 열고 물웅덩이로 첨벙."
    },
    {
     "id": "wetmail",
     "name": "젖은 편지",
     "beat": 0,
     "game": "belt",
     "who": "mina",
     "en": "Mail! Mail! I like mail!",
     "scene": "우체부 가방이 젖었다. 처마 밑 빨랫줄에 봉투를 널어 말린다 — 지나가는 봉투의 낱말을 읽고 맞는 그림 우편함에 넣으면 우체부가 한 통씩 챙긴다.",
     "end": "가방이 다시 불룩 — 우체부가 모자를 벗어 인사한다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Amy",
     "show": [
      "<rain>"
     ],
     "en": "I like rain!",
     "act": {
      "do": "find",
      "word": "rain"
     },
     "react": "창 왼쪽 유리의 빗줄기가 굵어진다 — 처마 끝에 큰 물방울 하나가 맺힌다.",
     "leads": "bigdrops"
    },
    {
     "arrive": "read",
     "from": "Max",
     "show": [
      "<mail>"
     ],
     "en": "Mail! I wait.",
     "act": {
      "do": "bring",
      "word": "mail",
      "to": "wait"
     },
     "react": "우체부가 편지 다발을 받아 가방에 넣고 손목시계를 본다 — 유리에 김이 더 뽀얗게 서린다.",
     "leads": "foggyglass",
     "note": "탁자 위 편지 다발을 처마 밑 우체부에게. 사건이 끝나면 다발은 탁자로 돌아간다"
    },
    {
     "arrive": "write",
     "from": "Mina",
     "show": [
      "{book}",
      "{desk}"
     ],
     "en": "Hi! I am Mina. This is my book!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "비 갠 길 끝 학교 창에 불이 켜진다. 문이 열렸으면 그 길로, 아직이면 길 끝 잎 없는 큰 나무만 보인다(쪽지는 우편함에 남는다).",
     "leads": "E02"
    }
   ],
   "guest": {
    "who": "uncle",
    "enter": "우산 골짜기의 삼촌 — 큰 우산을 쓰고 덮개 씌운 수레를 끌고 온다. 덮개 끈의 꼬리표에 낱말 하나.",
    "turns": [
     {
      "read": "hay",
      "pool": [
       "nail"
      ],
      "opens": "읽으면 덮개 끈이 풀린다 — 마른 건초 더미. 삼촌이 한 아름 안아 처마 밑에 깔아 주자 우체부와 고양이가 그 위에 폭 앉는다."
     },
     {
      "show": "wet",
      "cards": [
       "wet",
       "wait",
       "web"
      ],
      "ans": "wet",
      "why": "wet 과 wait — 가운데에 a 와 i 가 짝으로 앉으면 a 가 제 이름(에이)을 부른다(+ 끝소리 t · b). 젖은 것과 기다리는 것",
      "again": {
       "show": "run",
       "cards": [
        "run",
        "rain",
        "ran"
       ],
       "ans": "run"
      }
     },
     {
      "say": "I like rain!",
      "alt": "It is a gray day.",
      "cue": "삼촌이 우산을 접고 손바닥을 내밀어 빗방울을 받는다"
     }
    ],
    "bye": "삼촌이 우산을 Amy 에게 씌워 주고 수레를 끌고 간다 — 길 끝 학교 쪽 하늘이 갠다."
   },
   "job": {
    "who": "amy",
    "ask": "김 서린 창에 입김을 호 불고 손가락으로 빈 유리를 가리킨다.",
    "write": [
     "rain",
     "day",
     "play",
     "wait"
    ],
    "plan": {
     "meet": [
      "rain",
      "wait"
     ],
     "write": [
      "day",
      "play"
     ]
    },
    "carry": [],
    "gives": "쓴 자리만 김이 걷혀 맑은 글씨가 된다 — rain 글씨로는 빗물이 흘러내리고, wait 글씨를 본 우체부가 손을 흔들고, day 는 날씨판 오늘 칸에, play 글씨 너머로는 물웅덩이가 보인다. 다음 날 김이 다시 서려도 내 글씨 자리는 맑다."
   }
  },
  "E02": {
   "room": {
    "kind": "in",
    "owner": "mina",
    "rig": "afternoon",
    "weather": "clear",
    "accent": "--a-leaf",
    "sound": "책장 넘기는 소리 + 창밖 나뭇가지 사락 + 분필 톡톡",
    "center": "청록 칠판(오늘 읽은 낱말 자리). 왼쪽 큰 창밖에 잎이 하나도 없는 큰 나무, 왼쪽 벽에 일주일 표(요일 일곱 칸 — 칸마다 잎 붙일 자리). 교실 한가운데 짝꿍 책상(두 자리 — 이 구역의 표지). 책상마다 책이 덮여 있다. 읽기 시간이라 Mina 가 책 수레를 밀고 왔다",
    "pair": "교실 한가운데 짝꿍 책상 — e 블록 둘이 나란히 앉으면 앞 블록만 입을 옆으로 벌려 제 이름(이이)을 길게 부르고 짝꿍은 입을 다문 채 책장을 넘긴다. e 와 a 가 앉아도 같다. 책상은 낱말 끝에도(see), 가운데에도(week), 맨 앞에도(eat) 놓인다",
    "props": {
     "see": [
      "Lb",
      "창가의 망원경 — 누르면 눈을 대고 들여다본다. 렌즈 속에 창밖 나무가 크게"
     ],
     "tree": [
      "winL",
      "왼쪽 창밖 큰 나무 — 처음엔 잎이 없다. 누르면 가지가 흔들린다(읽을수록 초록으로 물든다)"
     ],
     "green": [
      "with:tree",
      "나무에 돋는 초록 잎 — 누르면 잎 하나가 팔랑 내려와 손바닥에"
     ],
     "week": [
      "wallL",
      "일주일 표 — 요일 일곱 칸. 누르면 칸이 차례로 반짝"
     ],
     "eat": [
      "Ra",
      "간식 바구니의 사과 — 누르면 한 입 아삭"
     ],
     "read": [
      "Rb",
      "독서대 위에 펼친 그림책 — 누르면 책장이 한 장 넘어간다"
     ],
     "teach": [
      "Rc",
      "곰 인형 학생 셋 앞의 꼬마 칠판 — 누르면 맨 앞 곰이 선생님이 되어 지시봉을 든다"
     ],
     "clean": [
      "Rd",
      "칠판지우개와 걸레 양동이 — 누르면 지우개가 칠판을 쓱 닦는다"
     ]
    },
    "more": {
     "sea": "벽 세계 지도의 파란 바다가 출렁 — 소라 껍데기에서 파도 소리(숲의 바닷가 천막에서 귀로 만난 그 바다)",
     "seat": "짝꿍 책상의 빈 의자 — 방석이 폭신 부풀고 의자가 아이 쪽으로 돌아선다",
     "feet": "책상 밑 실내화 — 발 둘이 콩콩 발장단(분장실 거울에서 통말로 만난 그 발)",
     "speak": "교탁의 깡통 마이크 — 대고 말하면 교실 스피커에서 내 목소리가 울린다"
    },
    "wheel": [
     {
      "rime": "eat",
      "words": [
       "eat",
       "seat"
      ]
     },
     {
      "rime": "ee",
      "words": [
       "see",
       "tree"
      ]
     }
    ],
    "wear": {
     "slide": "칠판 분필 받침의 기울어진 홈 — 글자 분필이 미끄러져 온다. e 와 e 는 한 자루에 두 글자(ee), e 와 a 도 한 자루(ea)",
     "readaloud": "책상마다 덮인 책 — 표지의 낱말을 소리 내어 읽으면 책이 펼쳐지고 창밖 나무에 잎이 한 줌 돋는다",
     "magic": "칠판 지시봉 — 이름을 부르면 Mina 가 그것을 짚고, 그것이 움직인다(tree 하면 가지가 흔들 · read 하면 책장이 넘어간다)",
     "wjob": "칠판과 일주일 표 — 칠판은 분필, 표의 잎은 초록 크레용",
     "wheel": "책 수레 바퀴 — 수레 바퀴를 돌리면 책등의 첫 글자가 바뀐다(-eat · -ee 책등 위에서)",
     "belt": "책상 줄 사이로 건네는 책갈피 — 낱말 책갈피가 손에서 손으로 오고 맞는 그림 책에 꽂는다",
     "catch": "떨어지는 잎 받기 — 창밖 나무에서 그림 잎이 팔랑팔랑. 들린 낱말의 잎만 펼친 책으로 받는다(green · grin 이 섞여 내린다)",
     "sbox": "칠판 아래 분필 칸 — ee · ea 는 한 칸에 두 글자(짝 분필)",
     "wtrain": "창턱을 도는 태엽 기차 — 칸마다 그림 하나(소리 공방 때의 그 기차)",
     "sstory": "엉뚱한 읽기 책 — 낱말 카드를 빈 쪽의 틀에 끼우면 그 쪽 그림이 그대로 움직인다"
    },
    "ears": [
     [
      "see",
      "say"
     ],
     [
      "read",
      "ride"
     ],
     [
      "eat",
      "it"
     ],
     [
      "green",
      "grin"
     ]
    ],
    "slides": [
     {
      "chain": [
       "red",
       "read"
      ],
      "look": "빨간(red) 책 — a 블록이 e 옆자리에 앉자 책이 펼쳐지고 책장이 넘어간다"
     },
     {
      "chain": [
       "set",
       "seat",
       "eat"
      ],
      "look": "교탁에 놓인(set) 방석 — a 가 끼어 앉자 의자 위로 올라가 자리가 되고, 첫소리가 떨어지자 그 자리에서 사과를 아삭"
     },
     {
      "chain": [
       "grin",
       "green"
      ],
      "look": "씩 웃는(grin) 얼굴 그림 — 가운데에 e 둘이 앉자 초록 잎으로 물든다"
     },
     {
      "chain": [
       "wake",
       "week"
      ],
      "look": "기지개 켜는(wake) Amy 그림 — 가운데 소리가 바뀌자 일주일 표가 주르륵 펼쳐진다"
     },
     {
      "chain": [
       "fit",
       "feet"
      ],
      "look": "꼭 맞는(fit) 실내화 — 가운데에 e 둘이 앉자 발 둘이 쏙 들어가 콩콩"
     }
    ],
    "tale": {
     "frames": [
      "I ___ a tree.",
      "I ___ a green book."
     ],
     "chips": [
      "see",
      "eat",
      "read",
      "clean",
      "teach"
     ],
     "look": "고른 대로 책 속 그림이 움직인다 — 「I eat a tree.」 면 나무를 브로콜리처럼 아삭, 「I teach a tree.」 면 나무가 책상에 앉아 손을 든다"
    },
    "work": {
     "L": "읽어 주는 낱말을 듣고 교실에서 그것을 찾는다",
     "S": "지시봉으로 짚으며 이름을 부른다 — 부른 것이 움직인다",
     "R": "덮인 책의 낱말을 소리 내어 읽는다 — 읽은 만큼 나무가 초록으로",
     "W": "칠판에 오늘 읽은 낱말을 분필로 쓴다",
     "next": "내가 쓴 낱말이 칠판에 남는다 — 다음 날 책갈피와 책 표지의 낱말이 내 글씨로 오고, 일주일 표에 내가 붙인 잎이 하나씩 는다"
    },
    "extras": [
     "사물함",
     "책 수레",
     "벽 세계 지도",
     "분필 받침",
     "실내화 줄",
     "창턱 화분",
     "교탁"
    ],
    "life": [
     "창밖 나무",
     "넘어가는 책장",
     "칠판",
     "일주일 표",
     "책 수레를 미는 Mina"
    ],
    "ink": {
     "at": "center",
     "on": "칠판(오늘 읽은 낱말 두 줄) · 창턱 나무 팻말 · 간식 바구니 꼬리표",
     "lines": 4,
     "where": {
      "see": "칠판 첫 줄",
      "tree": "창턱의 나무 팻말",
      "eat": "간식 바구니 꼬리표",
      "read": "칠판 둘째 줄"
     }
    },
    "beat": "분필이 칠판을 톡 톡 — 짝꿍 책상의 두 블록이 박자에 까딱이고, 짝 조각마다 앞 블록이 입을 길게 벌린다",
    "way": {
     "by": "yard",
     "sees": "운동장 너머 큰길 — 눈송이가 하나둘 내리고 길 끝 정류장 지붕이 하얗다"
    }
   },
   "events": [
    {
     "id": "closedbooks",
     "name": "덮인 책",
     "beat": 1,
     "game": "readaloud",
     "who": "mina",
     "en": "Listen! I see a tree. A green tree!",
     "scene": "읽기 시간인데 책이 다 덮여 있다. 창밖 큰 나무에는 잎이 하나도 없다. 표지의 낱말을 소리 내어 읽으면 책이 펼쳐지고 — 창밖 가지에 초록 잎이 한 줌씩 돋는다.",
     "end": "나무 왼쪽 절반이 초록 — 일주일 표의 첫 칸이 깜박인다."
    },
    {
     "id": "deskmate",
     "name": "짝꿍 자리",
     "beat": 2,
     "game": "talk",
     "who": "ben",
     "en": "This is my seat! I read.",
     "scene": "Ben 이 짝꿍 책상의 한 자리에 앉아 옆 의자를 톡톡 친다. 고른 말에 따라 Ben 이 책을 같이 펴거나 자리를 내준다 — 둘이 나란히 앉아 소리 내어 읽으면 창밖 나무 오른쪽도 물든다.",
     "end": "나무가 온통 초록 — 잎 하나가 창틈으로 날아와 책갈피가 된다."
    },
    {
     "id": "sillybook",
     "name": "엉뚱한 읽기 책",
     "beat": 3,
     "game": "sstory",
     "who": "amy",
     "en": "I eat a tree! I teach a tree!",
     "scene": "Amy 가 빈 책을 편다. 낱말 카드를 틀에 끼워 문장을 만들면 그 쪽 그림이 그대로 움직인다 — 나무를 먹고, 나무를 가르친다. 마음에 드는 낱말은 칠판에 남긴다.",
     "end": "엉뚱한 책 한 권이 책꽂이에 꽂히고 일주일 표에 초록 잎 하나가 붙는다."
    },
    {
     "id": "cleanup",
     "name": "청소 시간 챈트",
     "beat": 0,
     "game": "schant",
     "who": "max",
     "en": "Clean, clean! I clean! I eat!",
     "scene": "읽기 시간이 끝났다. Max 가 지우개 둘을 맞부딪쳐 박자를 친다 — 챈트 한 줄마다 칠판이 한 줄씩 닦이고 책이 한 권씩 제자리로. 끝 줄에 간식 바구니가 열린다.",
     "end": "반짝이는 교실 — 모두 사과를 한 입 아삭."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Mina",
     "show": [
      "<tree>"
     ],
     "en": "I see a tree.",
     "act": {
      "do": "say",
      "line": "I see a tree.",
      "tap": "tree"
     },
     "react": "창밖 나무가 가지를 흔든다 — 짝꿍 책상의 빈 의자가 살짝 돌아선다.",
     "leads": "deskmate",
     "note": "낱말을 하나씩 짚어 읽는다"
    },
    {
     "arrive": "read",
     "from": "Ben",
     "show": [
      "<eat>",
      "<read>"
     ],
     "en": "I eat. I read.",
     "act": {
      "do": "match",
      "pairs": [
       "eat",
       "read"
      ]
     },
     "react": "사과가 아삭, 책장이 팔랑 — 책꽂이의 빈 책 한 권이 덜컹.",
     "leads": "sillybook",
     "note": "낱말 둘을 간식 바구니의 사과 · 독서대의 책에 잇는다"
    },
    {
     "arrive": "write",
     "from": "Ben",
     "show": [
      "{goat}",
      "{bus}"
     ],
     "en": "Hi! I am Ben. I see a bus!",
     "act": {
      "do": "go",
      "by": "yard"
     },
     "react": "운동장 너머 큰길에 눈송이. 문이 열렸으면 그 길로, 아직이면 하얀 정류장 지붕만 보인다(쪽지는 우편함에 남는다).",
     "leads": "E03"
    }
   ],
   "guest": {
    "who": "mom",
    "enter": "달빛 둥지의 엄마 새 — 초록이 된 창밖 나무에 둥지를 틀러 왔다. 부리에 소라 껍데기를 물었는데 껍데기에 낱말 하나.",
    "turns": [
     {
      "read": "sea",
      "pool": [
       "speak"
      ],
      "opens": "읽으면 소라에서 파도 소리가 쏴 — 벽 세계 지도의 바다가 출렁인다. 창가의 망원경(see)도 같이 반짝 — 소리는 같고 짝꿍이 다르다(말해 주지 않는다). 엄마 새가 바다 건너 물어 온 씨앗 하나를 창턱 화분에 놓는다."
     },
     {
      "show": "red",
      "cards": [
       "red",
       "read",
       "rod"
      ],
      "ans": "red",
      "why": "red 와 read — e 옆에 a 가 짝으로 앉으면 e 가 제 이름(이이)을 길게 부른다(+ 가운데 e · o). 빨간색과 읽기",
      "again": {
       "show": "grin",
       "cards": [
        "grin",
        "green",
        "grip"
       ],
       "ans": "grin"
      }
     },
     {
      "say": "I see a green tree.",
      "alt": "I read.",
      "cue": "엄마 새가 초록 가지에 앉아 펼친 책을 들여다보며 고개를 갸웃"
     }
    ],
    "bye": "엄마 새가 새 둥지에 앉아 날개 끝으로 일주일 표를 가리킨다 — 운동장 너머로 첫 눈송이."
   },
   "job": {
    "who": "mina",
    "ask": "분필을 내밀고 칠판의 빈 줄을 지시봉으로 톡톡.",
    "write": [
     "see",
     "tree",
     "eat",
     "read"
    ],
    "plan": {
     "meet": [
      "see",
      "tree"
     ],
     "write": [
      "eat",
      "read"
     ]
    },
    "carry": [
     "rain",
     "day"
    ],
    "gives": "칠판에 오늘 읽은 낱말이 내 글씨로 남고 일주일 표에 초록 잎이 하나 붙는다. 창턱 팻말에 tree, 간식 바구니 꼬리표에 eat. 날씨 창가로 보낸 엽서(rain · day)는 김 서린 창과 날씨판에 붙는다."
   }
  },
  "E03": {
   "room": {
    "kind": "out",
    "owner": "ben",
    "rig": "morning",
    "weather": "cool",
    "accent": "--a-steel",
    "sound": "눈 밟는 뽀드득 + 먼 뱃고동 + 버스 종 딸랑",
    "center": "눈 덮인 길가 정류장. 지붕 아래 두 자리 벤치(이 구역의 표지)와 행선판(칸마다 탈것 그림 자리와 낱말 자리). 뒤로는 부두와 작은 배. 눈이 걸음 내내 내린다 — 길이 하얗게 덮여 어디가 길인지 안 보인다(이야기 ①), 탈것이 지나가며 길이 난다(②), 배가 떠날 때 눈이 그친다(③)",
    "pair": "정류장 지붕 아래 두 자리 벤치 — o 블록과 a 블록이 목도리 하나를 같이 두르고 앉으면 앞 블록(o)만 입을 동그랗게 벌려 제 이름(오우)을 부르고 짝은 입김만 호. o 와 w 가 앉아도 같다. 벤치는 낱말 가운데에도(boat), 낱말 끝에도(snow) 놓인다",
    "props": {
     "boat": [
      "back",
      "부두에 묶인 작은 배 — 누르면 뱃고동 뿌우, 돛에 쌓인 눈이 털린다"
     ],
     "road": [
      "Le",
      "눈에 덮인 길 — 누르면 발자국이 찍히며 길 한 토막이 드러난다"
     ],
     "goat": [
      "Lb",
      "벤치 옆에 선 염소(숲의 염소 언덕에서 온 그 염소) — 누르면 방울을 딸랑, 입김이 호"
     ],
     "coat": [
      "Ld",
      "벤치 등받이에 걸린 빨간 외투 — 누르면 소매가 팔랑(쪽지 1 뒤로는 염소가 입고 있다)"
     ],
     "soap": [
      "La",
      "부두 물통 옆 갑판 닦는 비누 — 누르면 비눗방울이 눈송이 사이로 둥실"
     ],
     "snow": [
      "winR",
      "오른쪽 하늘에서 내리는 눈 — 누르면 눈송이가 굵어진다"
     ],
     "grow": [
      "Rb",
      "정류장 옆 눈사람 — 눈이 쌓일수록 쑥쑥 자란다. 누르면 한 뼘 커진다"
     ],
     "show": [
      "Ra",
      "매표소 창 — 누르면 창 안의 장갑 낀 손이 표를 척 내보인다"
     ]
    },
    "more": {
     "bowl": "매표소 창턱의 김 나는 국 그릇 — 뚜껑이 달그락, 김이 눈 사이로 모락",
     "row": "배의 노 — 한 번 저으면 배가 한 뼘 나아가고 물살이 인다",
     "foam": "이구아나의 통에서 거품이 뭉게뭉게 — 눈과 섞여 반짝인다",
     "jeep": "눈길을 달려온 초록 지프 — 정류장 앞에 끽 서고 경적 빵(지난주의 짝 ee)"
    },
    "wheel": [
     {
      "rime": "oat",
      "words": [
       "boat",
       "goat",
       "coat"
      ]
     },
     {
      "rime": "ow",
      "words": [
       "snow",
       "grow",
       "show",
       "row"
      ]
     }
    ],
    "wear": {
     "slide": "눈 언덕 썰매 길 — 글자 썰매가 미끄러져 내려와 정류장 앞에서 합쳐진다. o 와 a 는 한 썰매에 둘이 타고(oa), o 와 w 도 한 썰매(ow)",
     "readaloud": "행선판의 낱말 판 — 소리 내어 읽으면 판이 차르륵 넘어가 그림이 되고, 눈 속에서 그것이 제 색으로 드러난다",
     "magic": "탈것 부르기 — 길을 향해 이름을 부르면 그것이 눈길을 헤치고 정류장에 온다(boat 하면 뱃고동 · goat 하면 방울 소리)",
     "wjob": "행선판과 표 — 행선판은 분필, 표는 잉크 펜",
     "wheel": "배의 키 바퀴 — 키를 돌리면 뱃머리 깃발의 첫 글자가 바뀐다(-oat · -ow 깃발 위에서)",
     "belt": "부두 도르래 줄 — 낱말 꼬리표 달린 짐이 건너오고 맞는 그림 짐칸에 싣는다",
     "catch": "눈송이 받기 — 큰 눈송이 속에 그림이 들었다. 들린 낱말의 눈송이만 벙어리장갑으로 받는다(coat · cot 이 섞여 내린다)",
     "sbox": "표의 칸 — oa · ow 는 한 칸에 두 글자(짝 도장)",
     "wtrain": "지나가는 탈것 줄 — 자전거 · 승합차 · 배가 그림 깃발을 달고 지나간다. 지나갈 때 이름을 대면 경적이 빵",
     "sstory": "엉뚱한 행선판 — 낱말 카드를 틀에 끼우면 정류장에 그대로 온다"
    },
    "ears": [
     [
      "boat",
      "bat"
     ],
     [
      "road",
      "rod"
     ],
     [
      "goat",
      "gate"
     ],
     [
      "grow",
      "gray"
     ]
    ],
    "slides": [
     {
      "chain": [
       "cot",
       "coat"
      ],
      "look": "접이 침대(cot)의 담요 — a 블록이 o 옆자리에 앉자 소매가 돋아 빨간 외투로"
     },
     {
      "chain": [
       "rod",
       "road"
      ],
      "look": "눈 위에 누운 낚싯대(rod) — a 가 끼어 앉자 길게 뻗은 길로"
     },
     {
      "chain": [
       "boat",
       "goat",
       "coat"
      ],
      "look": "배가 첫소리를 바꾸자 염소로, 또 바꾸자 외투로 — 첫소리 하나씩"
     },
     {
      "chain": [
       "grow",
       "row"
      ],
      "look": "자라던 눈사람이 첫소리를 떼자 노를 쥐고 배를 젓는다"
     }
    ],
    "tale": {
     "frames": [
      "This is my ___.",
      "It is a big ___!"
     ],
     "chips": [
      "boat",
      "goat",
      "coat",
      "road",
      "soap"
     ],
     "look": "고른 대로 정류장에 온다 — 「This is my goat.」 면 염소가 내 표를 물고 따라오고, 「It is a big soap!」 이면 집채만 한 비누가 눈길을 미끄러져 온다"
    },
    "work": {
     "L": "듣고 탈것을 세운다(들린 것이 오면 손을 든다)",
     "S": "길을 향해 이름을 불러 태운다",
     "R": "행선판을 읽고 맞는 탈것을 고른다",
     "W": "행선판과 표를 쓴다",
     "next": "내가 쓴 행선판과 표가 남는다 — 다음 날 행선판의 낱말 판이 내 글씨로 넘어가고, 도르래 짐의 꼬리표도 내 글씨로 온다"
    },
    "extras": [
     "정류장 지붕",
     "가로등",
     "매표소",
     "부두 말뚝과 밧줄",
     "눈 삽",
     "짐 수레"
    ],
    "life": [
     "내리는 눈",
     "지나가는 탈것",
     "외투 입은 염소",
     "부두의 배",
     "하얀 입김"
    ],
    "ink": {
     "at": "frame",
     "on": "행선판(두 칸) · 눈사람 이름표 · 외투 꼬리표가 붙은 표",
     "lines": 4,
     "where": {
      "boat": "행선판 첫 칸(배 그림 옆)",
      "road": "행선판 둘째 칸(버스 그림 옆)",
      "snow": "눈사람 이름표",
      "coat": "표의 맡긴 짐 칸(외투 꼬리표)"
     }
    },
    "beat": "눈 밟는 소리 뽀드득 뽀드득 — 벤치의 두 블록이 목도리째 흔들리고, 짝 조각마다 입김이 길게 호",
    "way": {
     "by": "alley",
     "sees": "부두 창고 사이 골목 — 해 질 녘 자두빛 속에 자판기 불빛이 깜박인다"
    }
   },
   "events": [
    {
     "id": "whiteroad",
     "name": "하얀 길",
     "beat": 1,
     "game": "slide",
     "who": "ben",
     "en": "Snow! Snow! Oh! A road!",
     "scene": "밤새 눈이 왔다. 길이 하얗게 덮여 어디가 길인지 모른다. 눈 언덕에서 글자 썰매를 밀어 낱말을 합치면 그 낱말의 것이 눈 속에서 드러난다 — road 가 합쳐지자 길 한 줄이 뻥.",
     "end": "길이 드러나고 멀리서 방울 소리 — 누가 걸어온다."
    },
    {
     "id": "helm",
     "name": "배의 키",
     "beat": 2,
     "game": "wheel",
     "who": "max",
     "en": "A boat! A goat! A coat!",
     "scene": "염소가 외투를 입고 배를 기다리는데 배가 꼼짝 않는다. 키 바퀴를 돌려 뱃머리 깃발의 낱말을 읽으면 — 진짜 낱말마다 배가 한 뼘씩 부두로 다가온다.",
     "end": "배가 부두에 닿고 발판이 철컥 내려온다."
    },
    {
     "id": "ticket",
     "name": "표",
     "beat": 3,
     "game": "sbox",
     "who": "ben",
     "en": "This is my coat. I see a boat!",
     "scene": "매표소 창이 열린다. 표의 칸에 소리 도장을 차례로 찍어 낱말을 만들면 표가 한 장씩 나온다 — 염소의 표, 내 표. oa 는 한 칸에 두 글자.",
     "end": "표를 내보이자 뱃고동 뿌우 — 배가 떠나고 염소가 갑판에서 방울을 흔든다."
    },
    {
     "id": "passing",
     "name": "지나가는 것들",
     "beat": 0,
     "game": "wtrain",
     "who": "amy",
     "en": "A bike! A van! A boat!",
     "scene": "눈길로 탈것이 줄줄이 지나간다 — 자전거, 승합차, 그리고 물길로 배. 지나갈 때 이름을 대면 경적을 울리고 깃발을 흔든다. 줄이 점점 빨라진다.",
     "end": "마지막 탈것이 눈을 뿌리며 지나가고 Amy 가 눈을 뒤집어쓴다 — 깔깔."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<coat>",
      "<goat>"
     ],
     "en": "A coat! A goat!",
     "act": {
      "do": "bring",
      "word": "coat",
      "to": "goat"
     },
     "react": "염소가 외투에 앞발을 쑥 — 단추를 채우고 부두 쪽을 본다. 멀리서 뱃고동이 뿌우.",
     "leads": "helm",
     "note": "벤치의 외투를 염소에게. 이때부터 염소는 외투를 입고 있다"
    },
    {
     "arrive": "read",
     "from": "Amy",
     "show": [
      "<snow>"
     ],
     "en": "It is snow! I like snow!",
     "act": {
      "do": "find",
      "word": "snow"
     },
     "react": "눈송이가 굵어져 매표소 창턱에 소복 — 창 안에서 불이 켜진다.",
     "leads": "ticket"
    },
    {
     "arrive": "write",
     "from": "Max",
     "show": [
      "{egg}",
      "{ant}"
     ],
     "en": "Hi! It is Max. A big egg is here!",
     "act": {
      "do": "go",
      "by": "alley"
     },
     "react": "창고 사이 골목 끝에서 자판기 불빛이 깜박. 문이 열렸으면 골목으로, 아직이면 불빛만(쪽지는 우편함에 남는다).",
     "leads": "E04"
    }
   ],
   "guest": {
    "who": "iguana",
    "enter": "얼음 그늘 골짜기의 이구아나 — 목도리를 칭칭 감고 큰 나무 통을 굴려 온다. 통 뚜껑에 낱말 하나.",
    "turns": [
     {
      "read": "foam",
      "pool": [
       "bowl",
       "jeep"
      ],
      "opens": "읽으면 뚜껑이 퐁 — 거품이 뭉게뭉게 솟아 정류장 지붕까지. 이구아나가 거품을 떠서 눈사람에게 수염을 붙여 준다."
     },
     {
      "show": "rod",
      "cards": [
       "rod",
       "road",
       "red"
      ],
      "ans": "rod",
      "why": "rod 와 road — o 옆에 a 가 짝으로 앉으면 o 가 제 이름(오우)을 부른다(+ 가운데 o · e). 낚싯대와 길",
      "again": {
       "show": "cat",
       "cards": [
        "cat",
        "coat",
        "cut"
       ],
       "ans": "cat"
      }
     },
     {
      "say": "This is my coat.",
      "alt": "I see a boat!",
      "cue": "이구아나가 제 목도리 끝을 들어 보이며 염소의 외투를 부러운 듯 본다"
     }
    ],
    "bye": "이구아나가 빈 통을 굴리며 골목 쪽으로 — 창고 사이로 자두빛 불빛이 샌다."
   },
   "job": {
    "who": "ben",
    "ask": "행선판의 빈 칸을 장갑 낀 손으로 톡톡 치고 표 한 장을 내민다.",
    "write": [
     "boat",
     "road",
     "snow",
     "coat"
    ],
    "plan": {
     "meet": [
      "boat",
      "road"
     ],
     "write": [
      "snow",
      "coat"
     ]
    },
    "carry": [
     "see",
     "eat"
    ],
    "gives": "행선판 칸에 내 글씨가 걸리고 그 탈것이 제 색으로 선다. 눈사람 이름표에 snow, 표의 짐 칸에 coat — 표가 찍혀 나온다. 교실로 보낸 엽서(see · eat)는 칠판과 간식 바구니에 붙는다."
   }
  },
  "E04": {
   "room": {
    "kind": "vendbook",
    "owner": "max",
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-plum",
    "sound": "자판기 웅 + 칩 딸깍 + 종이 묶는 찰칵",
    "center": "골목 막다른 벽 앞의 큰 자판기. 칩 구멍 셋(틀 · a 나 an · 끝 낱말)과 꺼내는 서랍, 그 아래 책 나오는 서랍. 자판기 위에 입 모양 그림. 양옆 벽에 문장 거는 줄 둘(a 줄 · an 줄). 왼쪽은 그림책방 뒷문 차양 — 그 아래 독서대 셋",
    "rails": [
     [
      "a",
      [
       -5,
       -3.2
      ]
     ],
     [
      "an",
      [
       5,
       -3.2
      ]
     ]
    ],
    "drawers": {
     "lead": [
      -3,
      3
     ],
     "art": [
      0,
      4.3
     ],
     "end": [
      3,
      3
     ]
    },
    "stands": [
     [
      -6.4,
      0
     ],
     [
      -4.6,
      0.4
     ],
     [
      -5.4,
      2
     ]
    ],
    "mouth": "자판기 위 입 모양 그림 — 끝 칸에 놓인 낱말이 입을 벌리는 소리(a · e · i · o · u)로 시작하면 입이 쩍 벌어진다. 그때는 an 칩만 딸깍 들어간다. 다른 낱말이면 입이 다물려 있고 a 칩만 들어간다",
    "bounce": "안 맞는 칩(a + egg · an + dog)은 구멍에서 통 튀어 나와 골목 바닥을 구르다 서랍으로 돌아간다 — 틀렸다는 표시 0, 규칙을 말해 주는 글 0. 입 그림만 벌어져 있거나 다물려 있다",
    "vend": {
     "a": [
      "dog",
      "cat",
      "cake",
      "boat"
     ],
     "an": [
      "ant",
      "egg",
      "apple",
      "eye"
     ]
    },
    "pages": {
     "dog": "태엽 강아지 — 꼬리를 흔들며 골목을 한 바퀴",
     "cat": "털실 고양이 — 가로등 밑에서 하품",
     "cake": "촛불 켠 조각 케이크(점심 가게의 그 케이크)",
     "boat": "종이배 — 골목 물웅덩이에 동동(지난주 부두의 그 배)",
     "ant": "초록 잎을 진 개미 줄 — 자판기 밑으로 줄지어 간다(숲의 사과나무 빈터에서 온 그 개미)",
     "egg": "큰 달걀 — 데굴 굴러 나와 바로 선다(숲의 코끼리 폭포 둥지의 그 알)",
     "apple": "빨간 사과 — 한 입 아삭 자국(글자 숲 첫 빈터의 그 사과)",
     "eye": "눈 그림 가면 — 쓰면 눈을 찡긋(분장실의 그 눈)"
    },
    "basket": {
     "an": [
      "ant",
      "egg",
      "apple",
      "eye",
      "ax",
      "elephant",
      "igloo",
      "octopus",
      "umbrella"
     ],
     "a": [
      "dog",
      "cat",
      "cake",
      "boat",
      "goat",
      "fish",
      "king",
      "queen"
     ]
    },
    "sight": {
     "an": "자판기 가운데 구멍의 칩 — 입 그림이 벌어졌을 때만 딸깍 들어간다",
     "apple": "끝 낱말 서랍의 사과 그림 칩(통말) — 놓으면 입 그림이 쩍(아)",
     "eye": "끝 낱말 서랍의 눈 그림 칩(통말) — 놓으면 입 그림이 쩍(아이)"
    },
    "texts": [
     {
      "line": "It is a goat. It is a boat.",
      "who": "ben",
      "day": "read",
      "scene": "눈 내리는 부두 — 첫 문장에 외투 입은 염소가 방울을 딸랑, 쪽이 넘어가 둘째 문장에 배가 뿌우 하고 들어온다. a 를 건너뛰면 그림이 흐릿한 채 멈춘다"
     },
     {
      "line": "I see an ant. It is green.",
      "who": "amy",
      "day": "write",
      "scene": "Amy 가 돋보기를 댄다 — 첫 문장에 개미 한 마리가 또렷해지고, 쪽이 넘어가 둘째 문장에 개미가 초록 잎을 지고 간다(개미도 초록으로 물든다)"
     },
     {
      "line": "I see snow. It is a big coat.",
      "who": "max",
      "day": "write",
      "unseen": true,
      "scene": "눈밭에 커다란 외투 하나 — 첫 문장에 눈이 내리고, 쪽이 넘어가 둘째 문장에 외투 속에서 염소가 고개를 쏙. 아무도 먼저 읽어 주지 않는 글 — 손님이 물고 온다"
     }
    ],
    "wear": {
     "gvend": "큰 자판기 — 틀 칩(It is · I see) 뒤에 a 나 an, 끝에 낱말 칩을 끼우면 그것이 나온다. 안 맞는 칩은 튕겨 나온다",
     "basket": "자판기 옆 바구니 둘 — 입을 다문 바구니(a)와 입을 벌린 바구니(an). 숲에서 온 친구들의 이름을 듣고 첫소리가 입을 벌리는 소리면 벌린 바구니에 넣는다",
     "swrite": "주문 쪽지 — 틀은 옅은 글씨를 따라 쓰고, a · an 은 칩으로 고르고, 끝 낱말은 손으로",
     "book": "책이 된 칩 — 바르게 끼운 문장이 찰칵 묶여 책으로 나온다. 낱말을 짚으며 읽으면 그림이 움직이고 두 문장 사이에서 쪽이 넘어간다",
     "belt": "빨래집게 쪽지 줄 — a ___ · an ___ 쪽지가 지나가고 맞는 그림에 건다(a 쪽지는 왼쪽 줄로, an 쪽지는 오른쪽 줄로 간다)",
     "wjob": "독서 카드 꽂이 — 쓰는 날의 주문 쪽지가 독서 카드가 되어 그 책 옆에 꽂힌다"
    },
    "work": {
     "L": "이름을 듣고 입 벌린 바구니와 입 다문 바구니에 가른다",
     "S": "나온 것을 「It is an egg.」 하고 말한다",
     "R": "칩과 쪽지 줄의 문장, 책 세 권을 읽는다",
     "W": "주문 쪽지를 쓴다(끝 낱말은 손으로)",
     "next": "내가 쓴 주문 쪽지가 벽의 a 줄 · an 줄에 걸려 남는다 — 다음 날 쪽지 줄에는 내 글씨 쪽지가 섞여 지나가고, 책 옆에는 내 독서 카드가 꽂혀 있다"
    },
    "extras": [
     "칩 서랍 셋",
     "문장 거는 줄 둘(a 줄 · an 줄)",
     "입 다문 바구니와 입 벌린 바구니",
     "독서대 셋",
     "빨래집게 쪽지 줄",
     "골목 가로등"
    ],
    "life": [
     "자판기 불빛",
     "입 모양 그림",
     "숲에서 온 개미 줄",
     "책이 되는 칩",
     "독서대 밑에서 조는 골목 고양이"
    ],
    "ink": {
     "at": "frame",
     "on": "주문 쪽지(하루 한 장) — 쓰는 날의 쪽지는 독서 카드가 되어 책 옆에",
     "lines": 4
    },
    "beat": "칩이 딸깍 딸깍 — 자판기 불빛이 박자에 깜박이고, an 마다 입 그림이 쩍",
    "way": {
     "by": "road",
     "sees": "골목 끝 큰길 — 한낮 햇빛 아래 시장 천막들의 깃발이 보인다"
    }
   },
   "events": [
    {
     "id": "twochips",
     "name": "새 칩 둘",
     "beat": 1,
     "game": "gvend",
     "who": "max",
     "en": "It is a dog. It is an egg!",
     "scene": "자판기에 새 칩 둘 — a 와 an. 틀 뒤에 끼우고 끝 낱말을 놓으면 그것이 나온다. a 칩은 dog 앞에서 딸깍, 그런데 egg 앞에서는 통 튕겨 나온다 — 자판기 위 입 그림이 쩍 벌어져 있다.",
     "end": "an 칩이 딸깍 — 큰 달걀이 데굴 나오고 입 그림이 다물린다."
    },
    {
     "id": "chipbooks",
     "name": "책이 된 칩",
     "beat": 2,
     "game": "book",
     "who": "mina",
     "en": "It is a goat. It is a boat.",
     "scene": "바르게 끼운 문장들이 찰칵 묶여 책이 된다. 첫 권 — 낱말을 짚으며 읽으면 외투 입은 염소가 나오고, 쪽이 넘어가 배가 들어온다. 지난주 정류장의 그 염소와 그 배.",
     "end": "첫 권이 독서대에 서고 둘째 권이 서랍에서 반쯤 나온다."
    },
    {
     "id": "antcard",
     "name": "개미 독서 카드",
     "beat": 3,
     "game": "wjob",
     "who": "mina",
     "en": "I see an ant. It is green.",
     "scene": "둘째 권을 읽고 주문 쪽지를 쓴다 — 틀은 따라 쓰고, an 칩을 고르고, 끝 낱말은 손으로. 다 쓴 쪽지가 독서 카드가 되어 책 옆에 꽂힌다. 초록 개미가 카드 위를 줄지어 지나간다.",
     "end": "개미 줄이 자판기 뒤로 사라진다 — 골목 끝에서 쿵 쿵 발소리."
    },
    {
     "id": "forestline",
     "name": "숲에서 온 줄",
     "beat": 0,
     "game": "basket",
     "who": "ben",
     "en": "An elephant! An igloo! A dog!",
     "scene": "글자 숲의 친구들이 골목에 줄을 섰다 — 코끼리, 문어, 우산 든 삼촌, 그리고 강아지와 임금님. 이름을 듣고 첫소리가 입을 벌리는 소리면 입 벌린 바구니(an)에, 아니면 입 다문 바구니(a)에 이름 그림을 넣는다.",
     "end": "두 바구니가 차고 — 입 벌린 바구니의 친구들이 다 같이 「아」 하고 입을 벌린다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<egg>",
      "<dog>"
     ],
     "en": "It is an egg. It is a dog.",
     "act": {
      "do": "match",
      "pairs": [
       "egg",
       "dog"
      ]
     },
     "react": "달걀이 데굴, 태엽 강아지가 멍 — 자판기 아래 서랍에서 종이 묶는 소리가 찰칵.",
     "leads": "chipbooks",
     "note": "낱말 둘을 자판기에서 나온 달걀 · 태엽 강아지에 잇는다"
    },
    {
     "arrive": "read",
     "from": "Mina",
     "show": [
      "<ant>"
     ],
     "en": "I see an ant!",
     "act": {
      "do": "say",
      "line": "I see an ant!",
      "tap": "ant"
     },
     "react": "초록 개미 한 마리가 쪽지 위로 올라와 더듬이를 까딱 — 둘째 권 표지가 들썩인다.",
     "leads": "antcard"
    },
    {
     "arrive": "write",
     "from": "Sam",
     "show": [
      "{ham}",
      "{jam}"
     ],
     "en": "Hi! I am Sam. I see you!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "큰길 끝 천막들에 한낮 햇빛. 문이 열렸으면 큰길로, 아직이면 천막 꼭대기 깃발만 보인다(쪽지는 우편함에 남는다).",
     "leads": "F01"
    }
   ],
   "guest": {
    "who": "alligator",
    "enter": "사과나무 빈터의 악어 — 입을 쩍 벌린 채 골목으로 들어온다(자판기 위 입 그림과 똑같이). 이빨 사이에 안개 싸인 셋째 권을 살짝 물었다.",
    "turns": [
     {
      "read": "I see snow. It is a big coat.",
      "pool": [
       "I see an egg. It is big.",
       "It is an ant. It is here."
      ],
      "opens": "읽으면 안개가 걷힌다 — 눈밭에 커다란 외투 하나, 쪽이 넘어가자 외투 속에서 염소가 고개를 쏙. 악어가 놀라 입을 탁 다문다."
     },
     {
      "show": "egg",
      "cards": [
       "It is an egg.",
       "It is a leg.",
       "It is an ant."
      ],
      "ans": "It is an egg.",
      "why": "a 와 an, 그리고 끝 낱말 — 작은 낱말 하나도 건너뛰지 않고 읽는다(an egg · a leg · an ant)"
     },
     {
      "say": "It is an egg.",
      "alt": "I see an apple.",
      "cue": "악어가 자판기에서 나온 큰 달걀을 조심조심 안아 본다"
     }
    ],
    "bye": "악어가 달걀을 등에 얹고 뒷걸음으로 나간다 — 세 권이 독서대에 나란히 서고 골목 끝 큰길이 환하다."
   },
   "job": {
    "who": "Max",
    "ask": "주문 쪽지 묶음을 내밀고 자판기의 쪽지 구멍을 가리킨다.",
    "write": [
     "It is a dog.",
     "It is an egg.",
     "It is an ___.",
     "It is a ___."
    ],
    "plan": {
     "meet": [
      "It is a dog."
     ],
     "read": [
      "It is an egg."
     ],
     "write": [
      "It is an ___."
     ],
     "again": [
      "It is a ___."
     ]
    },
    "carry": [],
    "blank": {
     "a": [
      "dog",
      "cat",
      "boat",
      "goat"
     ],
     "an": [
      "ant",
      "egg"
     ]
    },
    "rule": "쪽지마다 칩으로 조립한 뒤 쓴다(하루 한 장 · 열두 자 안). 틀(It is)은 옅은 글씨를 따라 쓰고, a · an 은 칩으로 고르고(안 맞으면 튕긴다), 빈칸 틀의 끝 낱말은 보지 않고 쓴다 — 쓰는 날은 an 쪽(ant · egg), 다시 온 날은 a 쪽(dog · cat · boat · goat) 가운데 내가 고른 것",
    "gives": "쪽지가 자판기에 들어가면 그 문장대로 무언가 나온다. 쪽지는 벽의 a 줄 · an 줄에 걸려 남고, 쓰는 날의 쪽지는 독서 카드가 되어 책 옆에 꽂힌다 — 줄 둘이 차면 골목 가로등이 다 켜진다."
   }
  },
  "F01": {
   "room": {
    "kind": "market",
    "owner": "sam",
    "rig": "day",
    "weather": "clear",
    "accent": "--a-red",
    "sound": "천막 펄럭 + 시장 종 + 멀리 웅성거림(말소리 아님)",
    "center": "마을 시장이 열렸다. 천막 넷이 뒤로 한 줄(생선 · 케이크 · 풋사과 · Sam 의 빈 천막), 가운데 장 마당에 주인 잃은 바구니 더미. 천막마다 사람들 — Ben · Mina · Amy · Max. Sam 이 가게 앞치마를 두른 채 종을 친다",
    "line": "장 마당 위를 가로지르는 빨랫줄 — 낱말 칩이 집게로 걸린다. 첫 칩(He · She · We · They)은 큰 글자 집게, 끝에는 마침표 구슬. 구슬을 끼우면 줄이 한 번 출렁이고 그 문장이 장 마당에서 일어난다",
    "cast": {
     "he": "Ben · Max · Sam — 가리키면(누르면) 그 사람이 손을 들고 머리 위에 he 딱지가 뜬다",
     "she": "Mina · Amy — 가리키면 손을 들고 머리 위에 she 딱지",
     "we": "내 캐릭터가 누군가의 손을 잡으면 둘을 감싸는 끈이 생기고 끈에 we 딱지",
     "they": "둘 이상을 손가락으로 한 번에 묶으면(풋사과 셋 · 나란히 선 두 사람) 묶음 위에 they 딱지"
    },
    "rails": [
     [
      "He",
      [
       -5,
       -3.2
      ]
     ],
     [
      "She",
      [
       5,
       -3.2
      ]
     ],
     [
      "We",
      [
       0,
       -5
      ]
     ],
     [
      "They",
      [
       -6.8,
       -1
      ]
     ]
    ],
    "drawers": {
     "who": [
      -4.6,
      3.2
     ],
     "be": [
      -1.6,
      4.2
     ],
     "end": [
      1.6,
      4.2
     ],
     "dot": [
      4.6,
      3.2
     ]
    },
    "pages": {
     "He is big.": "장대 다리를 탄 Ben 이 천막 지붕 위로 쑥 — 깃발 끝을 손으로 톡",
     "She is here.": "케이크 천막 뒤에서 Mina 가 쏙 나와 손을 번쩍 — 발밑 깔개가 환해진다",
     "We are here.": "내 캐릭터와 Amy 가 손을 잡고 장 마당 한가운데 선다 — 둘을 감싼 끈이 반짝",
     "They are green.": "풋사과 셋이 좌판에서 데굴데굴 굴러 나와 나란히 선다 — 셋 다 초록",
     "Ben has a fish.": "Ben 의 바구니가 열리고 생선 한 마리가 꼬리를 팔딱 — 바구니 손잡이에 has 딱지",
     "She has a cake.": "Mina 가 바구니에서 케이크를 꺼내 들어 보인다 — 촛불 하나"
    },
    "things": {
     "fish": "Ben 의 바구니 속 생선",
     "cake": "Mina 의 바구니 속 케이크",
     "green": "풋사과 좌판",
     "big": "장대 다리",
     "here": "장 마당 한가운데 발자국 깔개"
    },
    "sight": {
     "he": "남자 주민 머리 위에 뜨는 통말 딱지 — 문장 줄에서는 큰 글자 집게(He)",
     "she": "여자 주민 머리 위에 뜨는 통말 딱지 — 문장 줄에서는 큰 글자 집게(She)",
     "we": "손잡은 둘을 감싸는 끈에 달린 딱지 — 내 캐릭터가 꼭 들어 있다",
     "they": "둘 이상을 묶은 묶음 위의 딱지 — 내 캐릭터는 들어 있지 않다",
     "was": "빈 천막 앞 발자국 위에 뜨는 딱지 — 이야기 듣기의 문장 띠에서만 읽는다(「Ben was here.」 — 발자국만 남았다)",
     "has": "바구니 손잡이의 딱지 — 든 사람과 든 것 사이를 잇는다",
     "of": "상자와 그 안의 것을 잇는 끈 딱지 — 이야기 듣기의 문장 띠에서(「a box of fish」)",
     "said": "말풍선 꼬리의 딱지 — 이야기 듣기의 문장 띠에서만 읽는다(「Mina said, Hi!」 — 말풍선이 Mina 에게 붙는다)"
    },
    "tale": {
     "frames": [
      "He is ___.",
      "She is ___."
     ],
     "chips": [
      "big",
      "small",
      "green",
      "hot",
      "late",
      "here"
     ],
     "look": "고른 대로 장 마당에서 벌어진다 — 「He is green.」 이면 Ben 이 풋사과 색으로 물들고, 「She is small.」 이면 Mina 가 바구니에 쏙 들어갈 만큼 작아진다"
    },
    "wear": {
     "story": "Sam 의 종 — 종을 치고 두 문장을 들려준다(문장 띠가 같이 뜬다). 들은 차례대로 사람 그림 조각 둘을 천막에 세운다. was · said 는 여기서 귀와 눈으로만",
     "magic": "가리킴 주문 — 사람을 향해 he · she 를 말하면 그 사람이 손을 들고 제 바구니를 찾아간다. 둘을 묶고 they, 손을 잡고 we",
     "gvend": "장 마당 문장 조립대 — 누가 칩 · 가운데 칩(is · are · has) · 끝 칩을 끼우고 마침표 구슬을 놓으면 그 문장이 일어난다. 안 맞는 가운데 칩(We + is)은 통 튕겨 나온다",
     "book": "시장 그림 장부 — 문장을 짚으며 읽으면 장부 속 천막 그림이 움직인다(We are here. · They are green.)",
     "belt": "바구니 줄 — 문장 꼬리표를 단 바구니가 지나가고, 읽고 맞는 주인에게 건넨다",
     "sstory": "뒤바뀐 딱지 판 — 낱말 카드를 틀에 끼우면 장 마당에서 그대로 벌어진다",
     "swrite": "바구니 이름표 — 틀(He is · She is)은 옅은 글씨를 따라 쓰고, 이름은 그 사람 가슴의 이름표를 보고 쓴다",
     "wtrain": "시장 수레 줄 — 수레마다 사람이나 물건 하나. 지나갈 때 he · she · they 나 이름을 대면 수레 등에 불",
     "wjob": "이름표 끈 — 다 쓴 이름표를 바구니 손잡이에 묶는다"
    },
    "work": {
     "L": "Sam 의 두 문장을 듣고 누구 이야기인지 고른다",
     "S": "사람을 가리키며 「He is Ben.」 하고 말한다",
     "R": "바구니 꼬리표와 장부의 문장을 읽는다",
     "W": "바구니 이름표를 쓴다(이름은 보고 쓴다)",
     "next": "내가 쓴 이름표가 바구니에 묶여 남는다 — 다음 날 바구니 줄에는 내 글씨 이름표를 단 바구니가 섞여 지나간다"
    },
    "extras": [
     "천막 넷",
     "문장 조립대",
     "칩 서랍 넷",
     "바구니 더미",
     "장대 다리",
     "시장 수레"
    ],
    "life": [
     "펄럭이는 천막",
     "바구니 든 사람들",
     "굴러가는 과일",
     "시장 종",
     "천막 줄에 앉은 참새 셋"
    ],
    "ink": {
     "at": "frame",
     "on": "바구니 이름표(하루 한 장)",
     "lines": 4
    },
    "beat": "Sam 의 종이 댕 댕 — 천막 자락이 박자에 펄럭이고, 큰 글자 집게가 줄 위에서 까딱",
    "way": {
     "by": "road",
     "sees": "같은 시장의 오후 — 해가 기울어 천막 그림자가 길어지고, 저울 접시가 햇빛에 번쩍"
    }
   },
   "events": [
    {
     "id": "marketopen",
     "name": "시장이 열린다",
     "beat": 1,
     "game": "magic",
     "who": "sam",
     "en": "Hi! He is Ben. She is Mina.",
     "scene": "천막마다 사람들이 서 있는데 다들 바구니가 없다. 사람을 가리키며 he · she 를 말하면 그 사람이 손을 들고, 장 마당의 바구니 하나가 통통 뛰어 그 사람에게 간다.",
     "end": "Ben 과 Mina 가 바구니를 안고 꾸벅 — 아직 바구니 넷이 남았다."
    },
    {
     "id": "lostbaskets",
     "name": "주인 잃은 바구니",
     "beat": 2,
     "game": "belt",
     "who": "mina",
     "en": "He? She? Oh! They are green!",
     "scene": "남은 바구니가 줄에 걸려 지나간다. 꼬리표의 문장을 읽고 맞는 주인에게 건네면 바구니가 열려 그 문장이 일어난다 — 풋사과 셋이 데굴, 손잡은 둘의 끈이 반짝.",
     "end": "바구니가 다 주인을 찾았다 — 장 마당이 텅 비고 문장 줄만 출렁."
    },
    {
     "id": "ourbasket",
     "name": "우리 바구니",
     "beat": 3,
     "game": "swrite",
     "who": "sam",
     "en": "We are here! He is Ben. She is Mina.",
     "scene": "Sam 이 빈 이름표 묶음을 내민다. 이름표를 쓰면 그 바구니에 물건이 차오른다 — 틀은 따라 쓰고, 이름은 그 사람 가슴을 보고 쓴다.",
     "end": "우리 바구니가 가득 — 모두 장 마당 한가운데 모여 손을 든다."
    },
    {
     "id": "swappedtags",
     "name": "뒤바뀐 딱지",
     "beat": 0,
     "game": "sstory",
     "who": "ben",
     "en": "He is green! She is small!",
     "scene": "Ben 이 딱지를 뒤섞어 놓았다. 낱말 카드를 틀에 끼우면 그대로 벌어진다 — Ben 이 풋사과 색이 되고, Mina 가 바구니만 해진다.",
     "end": "모두 깔깔 — 종이 한 번 울리자 다들 제 모습으로 돌아온다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<fish>"
     ],
     "en": "Ben has a fish.",
     "act": {
      "do": "find",
      "word": "fish"
     },
     "react": "Ben 의 바구니에서 생선이 꼬리를 팔딱 — 줄에 걸린 다른 바구니들이 덜컹거린다.",
     "leads": "lostbaskets"
    },
    {
     "arrive": "read",
     "from": "Sam",
     "show": [
      "<cake>"
     ],
     "en": "She has a cake.",
     "act": {
      "do": "bring",
      "word": "cake",
      "to": "mina"
     },
     "react": "Mina 가 케이크를 받아 바구니에 넣고 손가락으로 크림을 콕 — Sam 이 빈 이름표 묶음을 꺼낸다.",
     "leads": "ourbasket",
     "note": "쪽지 그림의 she 는 Mina — 케이크를 Mina 에게"
    },
    {
     "arrive": "write",
     "from": "Amy",
     "show": [
      "{jam}",
      "{ham}"
     ],
     "en": "Hi! I am Amy. I like jam!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "저울 접시가 햇빛에 번쩍. 문이 열렸으면 오후의 좌판으로, 아직이면 길어진 천막 그림자만 보인다(쪽지는 우편함에 남는다).",
     "leads": "F02"
    }
   ],
   "guest": {
    "who": "kid",
    "enter": "놀이방의 그 아이(B06) — 두 어른의 손을 잡고 장 보러 왔다. 바구니 둘의 이름표가 뒤집혀 있고, 아이 목에 건 쪽지에 문장 한 줄.",
    "turns": [
     {
      "read": "He is my dad.",
      "pool": [
       "She is my mom.",
       "They are here."
      ],
      "opens": "읽으면 아빠의 바구니 이름표가 뒤집히고 덮개가 열린다 — 햄 한 덩이. 아빠가 아이를 번쩍 들어 목말을 태운다."
     },
     {
      "show": "fish",
      "cards": [
       "Ben has a fish.",
       "Ben has a dish.",
       "She has a fish."
      ],
      "ans": "Ben has a fish.",
      "why": "누가(Ben · She)와 무엇(fish · dish) — 첫 낱말과 끝 낱말을 둘 다 읽는다"
     },
     {
      "say": "He is Ben.",
      "alt": "She is Mina.",
      "cue": "아이가 목말을 탄 채 천막 쪽의 Ben 과 Mina 를 번갈아 가리킨다"
     }
    ],
    "bye": "세 식구가 손을 흔들며 간다 — 묶음 위에 they 딱지가 한 번 떴다 사라지고, 시장 길 끝으로 해가 기운다."
   },
   "job": {
    "who": "Sam",
    "ask": "빈 이름표 묶음을 부채처럼 펴 보이고 주인 잃은 바구니 손잡이를 가리킨다.",
    "write": [
     "He is Ben.",
     "She is ___.",
     "He is ___."
    ],
    "plan": {
     "read": [
      "He is Ben."
     ],
     "write": [
      "She is ___."
     ],
     "again": [
      "He is ___."
     ]
    },
    "carry": [],
    "blank": {
     "she": [
      "Mina",
      "Amy"
     ],
     "he": [
      "Ben",
      "Sam",
      "Max"
     ]
    },
    "rule": "이름표마다 칩으로 조립한 뒤 쓴다(하루 한 장 · 열두 자 안). 틀(He is · She is)은 옅은 글씨를 따라 쓰고 — 첫 글자는 큰 글자, 끝에 점 — 이름은 그 사람 가슴의 이름표를 보고 쓴다. he 칩 뒤에 Mina 를 놓으면 칩이 통 튕긴다",
    "gives": "이름표를 바구니 손잡이에 묶으면 그 바구니에 물건이 차오른다. 다섯 사람의 바구니가 다 차면 Sam 의 빈 천막에 깃발이 올라간다."
   }
  },
  "F02": {
   "room": {
    "kind": "out",
    "owner": "amy",
    "rig": "afternoon",
    "weather": "clear",
    "accent": "--a-gold",
    "sound": "저울 접시 딸깍 + 주판알 소리 + 천막 펄럭",
    "center": "같은 시장의 오후 — 해가 기울어 천막 그림자가 길다. 가운데에 Amy 의 큰 저울과 빈 장바구니. 왼쪽 좌판은 하나씩 세어 파는 것(점 딱지), 오른쪽 좌판은 덜어 파는 것(국자 · 됫박). 숫자 글자는 어디에도 없다 — 점과 낱말뿐",
    "line": "저울 위 차양의 줄 — 「I see ___!」 「I like some ___.」 칩이 걸린다. 마침표 구슬 대신 느낌표 구슬도 있다(끼우면 종이 한 번 더 크게 울린다)",
    "props": {
     "six": [
      "La",
      "달걀 여섯 알 꾸러미 — 누르면 여섯 알이 차례로 톡톡 뛴다(숲에서 귀로 만난 그 여섯)"
     ],
     "seven": [
      "Lb",
      "일곱 빛깔 풍선 다발 — 누르면 한 개씩 차례로 부푼다"
     ],
     "eight": [
      "Lc",
      "수조의 문어 — 누르면 다리 여덟을 하나씩 든다(숲의 문어 바위에서 온 그 문어)"
     ],
     "nine": [
      "Ld",
      "나무 핀 아홉 — 누르면 공이 굴러와 아홉이 차례로 넘어진다"
     ],
     "ten": [
      "Le",
      "손가락 장갑 한 켤레 — 누르면 손가락 열이 차례로 펴진다"
     ],
     "many": [
      "Ra",
      "귤 산더미 좌판 — 누르면 귤이 와르르 쏟아져 다 셀 수가 없다"
     ],
     "some": [
      "Rb",
      "잼 단지와 국자 — 누르면 국자가 조금 떠서 작은 병에 담는다"
     ],
     "all": [
      "Rc",
      "좌판과 빈 수레 — 누르면 좌판의 것이 하나도 안 남고 수레로 쓸려 담긴다"
     ]
    },
    "sight": {
     "six": "달걀 꾸러미의 낱말 딱지 — 옆에 점 여섯",
     "seven": "풍선 다발의 낱말 딱지 — 옆에 점 일곱",
     "eight": "수조의 낱말 딱지 — 옆에 점 여덟",
     "many": "귤 산더미의 낱말 딱지 — 점 대신 넘치는 더미 그림",
     "all": "수레의 낱말 딱지 — 텅 빈 좌판 그림",
     "some": "국자의 낱말 딱지 — 한 국자 그림"
    },
    "someWith": [
     "jam",
     "ham",
     "rain",
     "snow"
    ],
    "ears": [
     [
      "six",
      "sit"
     ],
     [
      "ten",
      "tin"
     ],
     [
      "nine",
      "line"
     ]
    ],
    "wear": {
     "pop": "좌판 덮개 넷 — 덮개가 들썩일 때 점 카드가 보인다. 들린 수의 덮개를 톡(six · sit 이 섞여 들린다)",
     "order": "손님 말풍선에 점 — 아이가 「six!」 하고 말하면 저울에 그만큼 올라가고 접시가 기운다",
     "sandwich": "장바구니 쌓기 — 부른 차례대로 담는다(「ten!」 「some jam!」 「six!」). 쌓일수록 바구니가 흔들",
     "wjob": "장 볼 목록 — 좌판의 낱말 딱지를 보고 쓴다(보고 쓰기)",
     "belt": "낱말 가격표 줄 — 낱말표가 지나가고 맞는 좌판에 꽂는다(many 는 산더미에, some 은 국자에)",
     "catch": "굴러 내리는 봉지 받기 — 봉지마다 점이 찍혀 있다. 들린 수의 봉지만 장바구니로 받는다(ten · tin 이 섞여 들린다)",
     "tag": "좌판 낱말표 — 읽고 꽂고, 글자를 맞추고, 쓴다(정원의 이름표와 같은 놀이가 좌판에서)",
     "wtrain": "시장 한 바퀴 수레 — 수레마다 점 묶음이나 더미 하나. 지나갈 때 낱말을 대면 수레 등에 불",
     "monster": "배고픈 시장 고양이 — 「Some ham!」 이면 한 점만, 「All!」 이면 접시째. 들은 만큼만 준다"
    },
    "work": {
     "L": "수를 듣고 그만큼 바구니에 담는다",
     "S": "점을 보고 「I see ten!」 하고 말한다",
     "R": "낱말표를 읽고 좌판에 꽂는다",
     "W": "장 볼 목록을 쓴다",
     "next": "내가 쓴 장 볼 목록이 장바구니에 꽂혀 남는다 — 다음 날 낱말 가격표 줄에는 내 글씨 낱말표가 섞여 지나간다"
    },
    "extras": [
     "큰 저울",
     "빈 장바구니",
     "국자와 됫박",
     "점 딱지 묶음",
     "좌판 덮개 넷",
     "빈 수레"
    ],
    "life": [
     "쌓인 좌판",
     "저울",
     "담기는 바구니",
     "시장 고양이",
     "저울 접시에 내려앉는 나비"
    ],
    "ink": {
     "at": "frame",
     "on": "장 볼 목록(네 줄)",
     "lines": 4,
     "where": {
      "six": "목록 첫 줄 — 쓰면 달걀 꾸러미가 장바구니로",
      "ten": "목록 둘째 줄 — 쓰면 장갑 한 켤레가 바구니 손잡이에 걸린다",
      "some": "목록 셋째 줄 — 쓰면 잼 한 병이 바구니로",
      "many": "목록 넷째 줄 — 쓰면 귤이 바구니가 넘치도록"
     }
    },
    "beat": "저울 접시가 딸깍 딸깍 — 좌판 덮개가 박자에 들썩이고, 수 낱말마다 점이 하나씩 켜진다",
    "way": {
     "by": "alley",
     "sees": "시장 뒤 골목 — 해가 지고 자판기 불빛이 보랏빛으로 켜진다"
    }
   },
   "events": [
    {
     "id": "howmany",
     "name": "몇 개일까",
     "beat": 1,
     "game": "order",
     "who": "amy",
     "en": "Six! Seven! Eight! I see ten!",
     "scene": "좌판에 물건이 쌓여 있다. 손님 말풍선에 점이 뜨면 아이가 그 수를 말한다 — 말한 만큼 저울에 올라가고 접시가 기운다. 점이 많아질수록 손님 눈이 커진다.",
     "end": "저울이 수평이 되고 Amy 가 장바구니에 담아 준다."
    },
    {
     "id": "rollingbags",
     "name": "굴러 내리는 봉지",
     "beat": 2,
     "game": "catch",
     "who": "ben",
     "en": "Listen! Ten? Tin? Ten!",
     "scene": "Ben 이 수레를 기울였다 — 점 찍힌 봉지가 비탈로 데굴데굴. 들린 수의 봉지만 장바구니로 받는다. 비슷한 소리(ten · tin, six · sit)가 섞여 들린다.",
     "end": "장바구니가 반쯤 찼다 — 시장 고양이가 냄새를 맡고 다가온다."
    },
    {
     "id": "marketlap",
     "name": "시장 한 바퀴",
     "beat": 3,
     "game": "wtrain",
     "who": "amy",
     "en": "Nine, ten! Some jam! Many, many!",
     "scene": "장 볼 목록을 들고 수레가 시장을 한 바퀴 돈다. 수레마다 점 묶음이나 더미 하나 — 낱말을 대면 수레 등에 불이 켜지고 목록의 그 줄에 표시.",
     "end": "수레 여덟 칸에 불이 다 켜지고 장바구니가 가득 — Amy 가 끈으로 묶어 준다."
    },
    {
     "id": "hungrycat",
     "name": "배고픈 시장 고양이",
     "beat": 0,
     "game": "monster",
     "who": "max",
     "en": "Some ham! Yum! All!",
     "scene": "시장 고양이가 접시 앞에 앉았다. 들은 만큼만 준다 — some 이면 한 점, all 이면 접시째. 다른 만큼 주면 고양이가 고개를 갸웃하고 기다린다.",
     "end": "고양이가 배를 보이고 눕는다 — 수염에 햄 한 점."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Amy",
     "show": [
      "<ten>"
     ],
     "en": "I see ten!",
     "act": {
      "do": "say",
      "line": "I see ten!",
      "tap": "ten"
     },
     "react": "장갑의 손가락 열이 차례로 펴지며 손을 흔든다 — 비탈 위의 수레가 삐걱 기운다.",
     "leads": "rollingbags"
    },
    {
     "arrive": "read",
     "from": "cat",
     "show": [
      "<some>",
      "<many>"
     ],
     "en": "Some jam! Many, many!",
     "act": {
      "do": "match",
      "pairs": [
       "some",
       "many"
      ]
     },
     "react": "국자가 잼을 한 번 뜨고 귤이 와르르 — 빈 수레가 스스로 굴러와 선다.",
     "leads": "marketlap",
     "note": "낱말 둘을 국자 · 귤 산더미에 잇는다. 보낸 이는 발자국 도장(시장 고양이)"
    },
    {
     "arrive": "write",
     "from": "Max",
     "show": [
      "{dog}",
      "{egg}"
     ],
     "en": "Hi! I am Max. It is a dog!",
     "act": {
      "do": "go",
      "by": "alley"
     },
     "react": "골목 안에서 자판기 불빛이 깜박. 문이 열렸으면 골목으로, 아직이면 보랏빛만 샌다(쪽지는 우편함에 남는다).",
     "leads": "F03"
    }
   ],
   "guest": {
    "who": "duck",
    "enter": "오리 연못의 그 오리(A02) — 새끼 오리들을 줄줄이 달고 장 보러 왔다. 목에 건 장바구니의 꼬리표에 문장 한 줄.",
    "turns": [
     {
      "read": "I see seven!",
      "pool": [
       "I see nine!",
       "I like some snow."
      ],
      "opens": "읽으면 새끼 오리 일곱이 차례로 꽥 — 장바구니 덮개가 열리고 작은 목도리 일곱이 나온다. 한 마리씩 목에 두른다."
     },
     {
      "show": "jam",
      "cards": [
       "I like some jam.",
       "I like some ham.",
       "I see some jam."
      ],
      "ans": "I like some jam.",
      "why": "가운데 some 은 그대로 — 앞(like · see)과 끝(jam · ham)이 다르다. 문장 끝까지 읽는다"
     },
     {
      "say": "I see many!",
      "alt": "I see ten!",
      "cue": "오리가 날개로 귤 산더미와 제 새끼들을 번갈아 가리킨다"
     }
    ],
    "bye": "오리 식구가 줄지어 뒤뚱뒤뚱 — 골목 쪽으로 해가 지고 보랏빛이 번진다."
   },
   "job": {
    "who": "amy",
    "ask": "빈 목록 종이를 장바구니에 꽂고 연필로 좌판의 낱말 딱지를 하나씩 가리킨다.",
    "write": [
     "six",
     "ten",
     "some",
     "many"
    ],
    "plan": {
     "meet": [
      "six",
      "ten"
     ],
     "write": [
      "some",
      "many"
     ]
    },
    "carry": [],
    "rule": "보고 쓰기 — 좌판의 낱말 딱지를 보고 한 줄씩. six · ten 은 다 쓴 뒤 점을 세어 맞춰 본다",
    "gives": "쓴 줄마다 그것이 장바구니에 담긴다 — 달걀 여섯, 장갑 한 켤레, 잼 한 병, 넘치는 귤. 네 줄이 다 차면 Amy 가 바구니를 끈으로 묶어 준다."
   }
  },
  "F03": {
   "room": {
    "kind": "alley5",
    "owner": "max",
    "rig": "lantern",
    "weather": "moon",
    "accent": "--a-plum",
    "sound": "자판기 웅 + 칩 딸깍 + 골목 등 켜지는 팅",
    "center": "밤의 자판기 골목. 자판기가 커졌다 — 칩 구멍이 다섯(누가 · 가운데 · a 나 an · 끝 · 마침표 구슬). 주문 그림판에는 그림이 **하나** 뜨거나 **여럿** 뜬다. 골목 벽을 따라 꺼진 등이 여덟 — 문장 하나에 등 하나",
    "line": "골목 벽의 문장 거는 줄 다섯 — 줄마다 첫 칩(It · They · He · She · We)이 큰 글자로 붙어 있다. 조립한 문장이 마침표 구슬과 함께 그 줄에 걸리고, 걸릴 때마다 골목 등이 하나 켜진다",
    "rails": [
     [
      "It",
      [
       -5,
       -3.2
      ]
     ],
     [
      "They",
      [
       5,
       -3.2
      ]
     ],
     [
      "We",
      [
       0,
       -5
      ]
     ],
     [
      "He",
      [
       -6.8,
       -1
      ]
     ],
     [
      "She",
      [
       6.8,
       -1.4
      ]
     ]
    ],
    "drawers": {
     "who": [
      -4.6,
      3.2
     ],
     "be": [
      -2.3,
      3.9
     ],
     "art": [
      0,
      4.4
     ],
     "end": [
      2.3,
      3.9
     ],
     "dot": [
      4.6,
      3.2
     ]
    },
    "count": "주문 그림이 하나면 It 칩 옆에 is 만 딸깍, 여럿이면 They 칩 옆에 are 만 딸깍. They are 뒤에는 a · an 구멍의 덮개가 스르르 닫힌다(꾸미는 말 · 자리말만 온다)",
    "bounce": "안 맞는 칩(They + is · It + are · They are + a)은 구멍에서 통 튀어 나와 골목 바닥을 구르다 서랍으로 돌아간다 — 틀렸다는 표시 0, 규칙을 말해 주는 글 0. 주문 그림만 하나이거나 여럿이다",
    "pages": {
     "It is a dog.": "태엽 강아지 한 마리 — 꼬리를 흔들며 골목을 한 바퀴",
     "It is an egg.": "큰 달걀 하나 — 데굴 굴러 나와 바로 선다(an 칩이 들어갈 때 자판기 위 입 그림이 쩍)",
     "They are big.": "큰 상자 셋이 쿵 쿵 쿵 — 자판기 서랍보다 커서 골목을 꽉 채운다",
     "They are green.": "초록 풍선 한 다발 — 골목 등 사이로 둥실",
     "They are here.": "발자국 깔개 여러 장이 내 발밑까지 줄지어 깔린다 — 밟을 때마다 환해진다",
     "He is big.": "Ben 태엽 인형 — 키 재는 자 옆에서 쑥 늘어난다",
     "She is late.": "Amy 태엽 인형 — 손목시계를 보며 종종걸음으로 뛰어나온다(진열장 앞에서 늦었던 그 Amy)",
     "We are here.": "손잡은 두 인형과 발자국 깔개 — 둘을 감싼 끈이 반짝"
    },
    "things": {
     "dog": "태엽 강아지",
     "egg": "큰 달걀",
     "big": "큰 상자 셋",
     "green": "초록 풍선 다발",
     "here": "발자국 깔개",
     "late": "손목시계 든 Amy 인형"
    },
    "tale": {
     "frames": [
      "They are ___.",
      "He is ___."
     ],
     "chips": [
      "big",
      "small",
      "green",
      "hot",
      "wet",
      "late"
     ],
     "look": "고른 대로 골목에서 벌어진다 — 「They are wet.」 이면 상자 셋 위로 물뿌리개 비가 내리고, 「He is small.」 이면 Ben 인형이 칩만 해져 서랍에 쏙 들어간다"
    },
    "wear": {
     "gvend": "큰 자판기 — 주문 그림(하나 · 여럿)을 보고 칩 넷과 마침표 구슬을 끼우면 그 문장대로 나온다. 안 맞는 칩은 튕겨 나온다",
     "story": "골목 스피커 — Max 가 두 문장을 들려준다(문장 띠가 같이 뜬다). 들은 차례대로 그림 조각 둘(하나 · 여럿)을 주문판에 놓는다",
     "swrite": "주문 쪽지 — 틀은 옅은 글씨를 따라 쓰고, 끝 낱말은 손으로",
     "book": "쪽지 책 — 벽 줄의 쪽지들이 찰칵 묶여 책이 된다. 낱말을 짚으며 읽으면 그 쪽의 그림이 하나에서 여럿으로 불어난다",
     "belt": "빨래집게 쪽지 줄 — 문장 쪽지가 지나가고 맞는 그림(하나 · 여럿)에 건다. It 쪽지는 왼쪽 벽으로, They 쪽지는 오른쪽 벽으로 간다",
     "sstory": "장난 단추 — 낱말 카드를 틀에 끼우면 골목에서 그대로 벌어진다",
     "wjob": "골목 등 스위치 — 다 쓴 쪽지를 벽 줄에 걸면 그 줄 아래 등이 켜진다"
    },
    "work": {
     "L": "문장을 듣고 하나인지 여럿인지 고른다",
     "S": "나온 것을 보고 「They are big!」 하고 말한다",
     "R": "칩과 쪽지 줄, 쪽지 책의 문장을 읽는다",
     "W": "주문 쪽지를 쓴다(끝 낱말은 손으로)",
     "next": "내가 쓴 주문 쪽지가 벽의 다섯 줄에 걸려 남는다 — 다음 날 쪽지 줄에는 내 글씨 쪽지가 섞여 지나가고, 내 쪽지 아래 등은 켜져 있다"
    },
    "extras": [
     "칩 서랍 다섯",
     "문장 거는 줄 다섯",
     "주문 그림판",
     "골목 등 여덟",
     "빨래집게 쪽지 줄",
     "상자 더미"
    ],
    "life": [
     "자판기 불빛",
     "칩 서랍",
     "켜지는 골목 등",
     "나오는 물건",
     "등 사이를 오가는 반딧불이"
    ],
    "ink": {
     "at": "frame",
     "on": "주문 쪽지(하루 한 장)",
     "lines": 4
    },
    "beat": "칩이 딸깍 딸깍 — 자판기 불빛이 박자에 깜박이고, They are 마다 주문 그림이 여럿으로 불어난다",
    "way": {
     "by": "alley",
     "sees": "골목 끝 분장실 뒷문 — 문틈으로 거울 등의 노란 빛, 문고리에 가면 하나가 걸려 있다"
    }
   },
   "events": [
    {
     "id": "bigmachine",
     "name": "커진 자판기",
     "beat": 1,
     "game": "gvend",
     "who": "max",
     "en": "It is a dog. They are big!",
     "scene": "자판기가 커졌다 — 칩 서랍이 다섯 칸. 주문 그림에 강아지 하나가 뜨면 It is a dog. 가 딸깍 들어가는데, 상자 셋이 뜨자 is 칩이 통 튕겨 나온다. 주문 그림만 여럿이다.",
     "end": "are 칩이 딸깍 — 큰 상자 셋이 쿵 쿵 쿵, 골목 등이 둘 켜진다."
    },
    {
     "id": "slipbook",
     "name": "쪽지 책",
     "beat": 2,
     "game": "book",
     "who": "mina",
     "en": "They are green. They are here.",
     "scene": "벽 줄의 쪽지들이 찰칵 묶여 책이 된다. 낱말을 짚으며 읽으면 그림이 하나에서 여럿으로 불어난다 — 초록 풍선 다발, 줄지어 깔리는 발자국 깔개.",
     "end": "책이 독서대에 서고 골목 등이 다섯까지 켜진다."
    },
    {
     "id": "alleylights",
     "name": "골목 불",
     "beat": 3,
     "game": "wjob",
     "who": "max",
     "en": "He is big. She is late. We are here!",
     "scene": "남은 등은 셋. 주문 쪽지를 써서 벽 줄에 건다 — 끝 낱말은 손으로. 걸릴 때마다 그 줄 아래 등이 팅 하고 켜지고 그 문장의 인형이 나온다.",
     "end": "골목에 불이 다 켜졌다 — 내가 만든 문장 여덟이 다섯 줄에 나란히."
    },
    {
     "id": "speakeronly",
     "name": "소리만 듣고",
     "beat": 0,
     "game": "story",
     "who": "ben",
     "en": "Listen! She is late. They are here!",
     "scene": "Ben 이 주문 그림판을 천으로 가렸다. 스피커에서 두 문장이 나온다 — 들은 차례대로 그림 조각 둘을 놓으면 천이 걷히고 맞는지 보인다.",
     "end": "천이 걷히고 그림이 딱 맞는다 — Ben 이 엄지를 든다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<egg>"
     ],
     "en": "It is an egg.",
     "act": {
      "do": "bring",
      "word": "egg",
      "to": "max"
     },
     "react": "Max 가 큰 달걀을 받아 귀에 대고 톡톡 — 벽 줄의 쪽지들이 바람에 팔랑 모인다.",
     "leads": "slipbook",
     "note": "서랍에서 나온 큰 달걀을 Max 에게"
    },
    {
     "arrive": "read",
     "from": "Mina",
     "show": [
      "<green>"
     ],
     "en": "They are green.",
     "act": {
      "do": "find",
      "word": "green"
     },
     "react": "초록 풍선 다발이 한꺼번에 둥실 — 꺼진 등 셋이 궁금한 듯 한 번 깜박인다.",
     "leads": "alleylights",
     "note": "골목에서 초록인 것(풍선 다발)을 찾아 누른다"
    },
    {
     "arrive": "write",
     "from": "Ben",
     "show": [
      "{hat}",
      "{wig}"
     ],
     "en": "Hi! I am Ben. I am hot!",
     "act": {
      "do": "go",
      "by": "alley"
     },
     "react": "분장실 뒷문 틈으로 거울 등 빛이 샌다. 문이 열렸으면 그 문으로, 아직이면 문고리의 가면만 흔들린다(쪽지는 우편함에 남는다).",
     "leads": "F04"
    }
   ],
   "guest": {
    "who": "robot",
    "enter": "운동장에서 구령대로 움직이던 그 로봇(C04) — 몸통에 서랍이 여럿. 가슴 화면에 문장 한 줄이 깜박인다.",
    "turns": [
     {
      "read": "They are hot.",
      "pool": [
       "It is a jet.",
       "She is big."
      ],
      "opens": "읽으면 로봇 몸통 서랍 셋이 한꺼번에 열린다 — 김 나는 찐빵 셋. 로봇이 손부채를 부친다."
     },
     {
      "show": "big",
      "cards": [
       "They are big.",
       "It is big.",
       "They are pink."
      ],
      "ans": "They are big.",
      "why": "하나(It is)인가 여럿(They are)인가, 그리고 끝 낱말 — 첫 두 낱말과 끝 낱말을 다 읽는다"
     },
     {
      "say": "They are big!",
      "alt": "It is a goat.",
      "cue": "로봇이 큰 상자 셋을 한 팔에 번쩍 들어 보인다"
     }
    ],
    "bye": "로봇이 상자 셋을 쌓아 등에 지고 삐빅 인사 — 골목 끝 분장실 뒷문이 살짝 열린다."
   },
   "job": {
    "who": "Max",
    "ask": "주문 쪽지 묶음을 내밀고 벽의 다섯 줄 가운데 빈 줄을 가리킨다.",
    "write": [
     "It is a dog.",
     "They are big.",
     "It is a ___.",
     "They are ___."
    ],
    "plan": {
     "meet": [
      "It is a dog."
     ],
     "read": [
      "They are big."
     ],
     "write": [
      "It is a ___."
     ],
     "again": [
      "They are ___."
     ]
    },
    "carry": [],
    "blank": {
     "it": [
      "dog",
      "cat",
      "goat",
      "boat"
     ],
     "they": [
      "big",
      "here",
      "hot",
      "wet"
     ]
    },
    "rule": "쪽지마다 칩으로 조립한 뒤 쓴다(하루 한 장 · 열두 자 안). 틀(It is a · They are)은 옅은 글씨를 따라 쓰고 — 첫 글자는 큰 글자, 끝에 점 — 빈칸 틀의 끝 낱말은 보지 않고 쓴다. 쓰는 날은 하나 쪽, 다시 온 날은 여럿 쪽",
    "gives": "쪽지가 자판기에 들어가면 그 문장대로 무언가 나온다(하나 또는 여럿). 쪽지는 벽 줄에 걸려 남고 그 줄 아래 등이 켜진다 — 등 여덟이 다 켜지면 골목이 대낮처럼 환하다."
   }
  },
  "F04": {
   "room": {
    "kind": "in",
    "owner": "ben",
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-pink",
    "sound": "거울 등 지잉 + 옷걸이 딸랑 + 분첩 톡톡",
    "center": "분장실의 큰 변신 거울. 거울 둘레 등이 켜져 있고 거울 속에는 내 캐릭터가 비친다. 거울 양옆 벽에 가면이 넷씩 — 왼쪽은 마음 가면, 오른쪽은 몸 가면. 화장대 위에 꽃병과 거울 메모 묶음",
    "line": "거울 꼭대기를 따라 걸린 줄 — 「I am ___.」 칩이 걸린다. 마침표 구슬을 끼우면 거울 속의 내가 그 얼굴이 된다. 「You are ___.」 를 걸면 거울 밖의 친구가 그 얼굴이 된다",
    "props": {
     "happy": [
      "La",
      "활짝 웃는 가면 — 누르면 깔깔 소리와 함께 색종이가 팡"
     ],
     "sad": [
      "Lb",
      "눈물 한 방울 가면 — 누르면 눈물이 또르르, 손수건이 날아와 닦아 준다"
     ],
     "mad": [
      "Lc",
      "눈썹을 치켜든 가면 — 누르면 콧김이 뿜, 귀에서 김이 모락"
     ],
     "nice": [
      "Ld",
      "꽃을 내미는 가면 — 누르면 꽃병의 꽃 한 송이를 뽑아 건넨다"
     ],
     "hot": [
      "Ra",
      "땀방울 가면과 부채 — 누르면 부채가 저절로 팔랑"
     ],
     "wet": [
      "Rb",
      "물이 뚝뚝 듣는 가면과 수건 — 누르면 수건이 탈탈 턴다"
     ],
     "sick": [
      "Rc",
      "체온계를 문 가면과 담요 — 누르면 에취, 담요가 폭 덮인다"
     ],
     "fine": [
      "Rd",
      "엄지를 든 가면 — 누르면 담요를 걷고 벌떡, 팔을 쭉 편다"
     ]
    },
    "sight": {
     "happy": "활짝 웃는 가면 아래의 통말 딱지 — 거울 줄에서는 끝 칩으로"
    },
    "ears": [
     [
      "sad",
      "sat"
     ],
     [
      "mad",
      "mud"
     ],
     [
      "hot",
      "hat"
     ],
     [
      "wet",
      "web"
     ]
    ],
    "wear": {
     "mirror": "변신 거울 — 가면을 골라 쓰면 거울 속의 내가 변신하고, 「I am happy!」 하고 말하면 가면이 스르르 녹아 진짜 얼굴이 된다",
     "pop": "가면 숨바꼭질 — 옷걸이 넷 뒤에서 가면이 쏙쏙. 들린 낱말의 가면을 톡(sad · sat, hot · hat 이 섞여 들린다)",
     "wjob": "거울 메모 — 분첩 묻힌 손가락으로 거울 귀퉁이 메모지에 쓴다",
     "belt": "옷걸이 레일 — 낱말표가 달린 옷걸이가 지나가고 맞는 가면에 건다",
     "sbox": "화장대 서랍 칸 — 가면 낱말을 소리대로 칸에 놓는다(sick 의 ck 는 한 칸 · fine 과 nice 는 모음과 e 가 한 칸)",
     "swrite": "거울 줄의 문장 — 틀(I am)은 옅은 글씨를 따라 쓰고 빈칸 낱말은 손으로",
     "wtrain": "가면 수레 — 옷 수레에 가면이 줄지어 걸려 지나간다. 지나갈 때 이름을 대면 가면이 그 얼굴을 한 번 짓는다"
    },
    "work": {
     "L": "낱말을 듣고 그 얼굴의 가면을 고른다",
     "S": "가면을 쓰고 「I am happy!」 하고 말한다 — 거울 속의 내가 그 얼굴이 된다",
     "R": "옷걸이 낱말표를 읽고 가면에 건다",
     "W": "오늘 기분을 거울 메모에 쓴다",
     "next": "내가 쓴 거울 메모가 거울 귀퉁이에 붙어 남는다 — 다음 날 옷걸이 레일에는 내 글씨 낱말표가 섞여 지나가고, 거울을 열면 어제의 내 메모가 먼저 보인다"
    },
    "extras": [
     "큰 변신 거울",
     "화장대와 분첩",
     "옷걸이 레일",
     "옷 수레",
     "가면 걸이 여덟",
     "둥근 의자"
    ],
    "life": [
     "가면 여덟",
     "거울 등",
     "표정 바뀌는 거울 속 나",
     "꽃병",
     "화장대 서랍에서 고개를 내미는 생쥐"
    ],
    "ink": {
     "at": "center",
     "on": "거울 메모(하루 한 장 — 거울 귀퉁이에 붙는다)",
     "lines": 4
    },
    "beat": "분첩이 톡 톡 — 거울 등이 박자에 한 알씩 밝아지고, 낱말마다 그 가면이 표정을 한 번 짓는다",
    "way": {
     "by": "lantern",
     "sees": "분장실 창밖 — 등불 길 끝, 섬 한가운데 언덕 위로 달이 뜨고 나무 한 그루의 그림자"
    }
   },
   "events": [
    {
     "id": "eightmasks",
     "name": "가면 여덟",
     "beat": 1,
     "game": "mirror",
     "who": "ben",
     "en": "I am happy! I am sad.",
     "scene": "거울 속 얼굴이 가면 여덟 개로 바뀐다. 가면을 골라 쓰면 거울 속의 내가 변신 — 「I am happy!」 하고 말하면 가면이 녹아 진짜 표정이 된다. Ben 도 옆에서 따라 쓴다.",
     "end": "거울 속의 내가 활짝 웃고, 왼쪽 벽 가면 넷에 제 색이 돌아온다."
    },
    {
     "id": "maskpieces",
     "name": "가면 조각",
     "beat": 2,
     "game": "sbox",
     "who": "mina",
     "en": "Hot! Wet! Sick! I am fine.",
     "scene": "오른쪽 벽의 가면 넷이 조각나 화장대 서랍에 흩어졌다. 낱말을 듣고 소리대로 칸에 조각을 놓으면 가면이 다시 붙는다 — sick 의 끝은 한 칸, fine 은 모음과 e 가 한 칸.",
     "end": "가면 넷이 다 붙었다 — 엄지 가면이 엄지를 척."
    },
    {
     "id": "mirrornote",
     "name": "거울 메모",
     "beat": 3,
     "game": "swrite",
     "who": "ben",
     "en": "I am fine. You are nice!",
     "scene": "오늘 기분을 거울 메모에 쓴다 — 틀은 따라 쓰고 빈칸 낱말은 손으로. 메모를 거울 귀퉁이에 붙이면 거울 속의 내가 그 얼굴로 한 번 웃는다. 문가에 Amy 가 꽃을 들고 서 있다.",
     "end": "Amy 에게 「You are nice!」 — Amy 가 꽃을 꽃병에 꽂아 준다."
    },
    {
     "id": "hidingmasks",
     "name": "가면 숨바꼭질",
     "beat": 0,
     "game": "pop",
     "who": "amy",
     "en": "Listen! Sad? Sat? Sad!",
     "scene": "가면들이 옷걸이 뒤에 숨었다. 들린 낱말의 가면이 고개를 내밀 때 톡 — 비슷한 소리(sad · sat, hot · hat)가 섞여 들린다.",
     "end": "가면 여덟이 다 나와 제 걸이에 걸린다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<sad>",
      "<mad>"
     ],
     "en": "I am sad. I am mad!",
     "act": {
      "do": "match",
      "pairs": [
       "sad",
       "mad"
      ]
     },
     "react": "눈물 가면이 훌쩍, 치켜든 눈썹 가면이 콧김을 뿜 — 오른쪽 벽의 가면 하나가 툭 떨어져 조각난다.",
     "leads": "maskpieces",
     "note": "낱말 둘을 왼쪽 벽의 두 가면에 잇는다"
    },
    {
     "arrive": "read",
     "from": "Mina",
     "show": [
      "<fine>"
     ],
     "en": "I am fine.",
     "act": {
      "do": "say",
      "line": "I am fine.",
      "tap": "fine"
     },
     "react": "엄지 가면이 담요를 걷고 벌떡 — 화장대 위 거울 메모 묶음이 한 장 팔랑 넘어간다.",
     "leads": "mirrornote"
    },
    {
     "arrive": "write",
     "from": "Amy",
     "show": [
      "{tree}",
      "{sea}"
     ],
     "en": "Hi! I am Amy. I see the sea!",
     "act": {
      "do": "go",
      "by": "lantern"
     },
     "react": "창밖 등불 길에 불이 하나씩 켜진다. 문이 열렸으면 그 길로, 아직이면 언덕 위 나무 그림자만 보인다(쪽지는 우편함에 남는다).",
     "leads": "F05"
    }
   ],
   "guest": {
    "who": "baby",
    "enter": "엄마 품에 안긴 아기 — 으앙 하고 운다. 엄마가 어쩔 줄 모르고, 아기 턱받이에 문장 한 줄.",
    "turns": [
     {
      "read": "She is wet.",
      "pool": [
       "He is sick.",
       "They are mad."
      ],
      "opens": "읽으면 엄마의 가방이 열린다 — 마른 수건과 새 옷. 수건으로 톡톡 닦아 주자 아기가 뚝 그친다."
     },
     {
      "show": "hot",
      "cards": [
       "I am hot.",
       "I am wet.",
       "You are hot."
      ],
      "ans": "I am hot.",
      "why": "누구 이야기인지(I am · You are)와 어떤지(hot · wet) — 앞과 끝을 둘 다 읽는다"
     },
     {
      "say": "You are nice!",
      "alt": "I am happy!",
      "cue": "아기가 방긋 웃으며 두 손을 내 쪽으로 뻗는다"
     }
    ],
    "bye": "아기가 엄마 어깨 너머로 손을 흔든다 — 꽃병의 꽃이 한 송이 더 피고 창밖 등불 길이 밝다."
   },
   "job": {
    "who": "Ben",
    "ask": "거울 메모 묶음에서 한 장을 떼어 내밀고 거울 귀퉁이를 톡톡 두드린다.",
    "write": [
     "I am fine.",
     "I am happy.",
     "I am ___.",
     "You are nice."
    ],
    "plan": {
     "meet": [
      "I am fine."
     ],
     "read": [
      "I am happy."
     ],
     "write": [
      "I am ___."
     ],
     "again": [
      "You are nice."
     ]
    },
    "carry": [],
    "blank": {
     "i": [
      "sad",
      "mad",
      "hot",
      "wet",
      "fine",
      "nice",
      "sick"
     ]
    },
    "rule": "메모마다 거울 줄에 칩으로 건 뒤 쓴다(하루 한 장 · 열두 자 안). 틀(I am)은 옅은 글씨를 따라 쓰고 — 첫 글자는 큰 글자, 끝에 점 — happy 는 가면 아래 딱지를 보고, 빈칸 틀의 낱말은 보지 않고 쓴다. 쓰는 날의 빈칸은 오늘 내 기분으로 고른다",
    "gives": "메모를 거울 귀퉁이에 붙이면 거울 속의 내가 그 얼굴이 된다. 다시 온 날의 「You are nice.」 는 Amy 의 거울에 붙는다 — Amy 가 꽃을 한 송이 더 꽂는다."
   }
  },
  "F05": {
   "room": {
    "kind": "out",
    "owner": "amy",
    "rig": "day",
    "weather": "wind",
    "accent": "--a-leaf",
    "sound": "바람에 잎 사락 + 호수 물결 찰랑 + 먼 파도",
    "center": "섬 한가운데 정원 — 홈 섬의 그 정원이다. 한 해 동안 심은 내 씨앗 · 풀꽃 · 나무가 다 여기 산다(이름표는 내 글씨). 왼쪽은 언덕으로 오르는 길, 오른쪽은 호수와 모래톱, 뒤로 멀리 바다. 걸음 내내 빛이 흐른다 — 아침(이야기 ①) · 한낮(②) · 노을(③)",
    "line": "언덕 위 나무와 물가 말뚝 사이의 줄 — 「I see a ___.」 「I like the ___.」 칩이 걸린다. 마침표 구슬을 끼우면 그쪽으로 바람이 불어 그것이 한 번 움직인다(잎이 날리고, 물결이 인다)",
    "props": {
     "hill": [
      "wallL",
      "뒤 왼쪽의 둥근 언덕 — 누르면 내 캐릭터가 꼭대기까지 뛰어올라 손차양을 한다"
     ],
     "tree": [
      "La",
      "언덕 아래 큰 나무 — 누르면 가지가 흔들리고 잎이 한 줌 날린다(교실 창밖의 그 나무와 같은 낱말)"
     ],
     "leaf": [
      "with:tree",
      "나무에서 떨어진 큰 잎 한 장 — 누르면 팔랑팔랑 돌며 내려온다"
     ],
     "rock": [
      "Lc",
      "이끼 낀 큰 바위 — 누르면 바위 뒤에서 도마뱀이 쏙(혼자서는 못 드는 크기)"
     ],
     "lake": [
      "Rb",
      "잔잔한 호수 — 누르면 동그란 물결이 번진다"
     ],
     "sea": [
      "wallR",
      "뒤 오른쪽 멀리 바다 — 누르면 파도가 한 줄 밀려오고 갈매기 소리(숲의 바닷가 천막에서 귀로 만난 그 바다)"
     ],
     "sand": [
      "Rc",
      "호숫가 모래톱 — 누르면 발자국이 콕콕 찍힌다"
     ],
     "stone": [
      "Rd",
      "손에 쥐는 납작한 조약돌 — 누르면 호수 위를 통 통 통 튄다(물수제비)"
     ]
    },
    "tale": {
     "frames": [
      "I see a ___.",
      "It is a big ___!"
     ],
     "chips": [
      "lake",
      "hill",
      "tree",
      "rock",
      "leaf",
      "stone"
     ],
     "look": "고른 대로 섬에서 벌어진다 — 「It is a big leaf!」 면 잎 한 장이 돛단배만 해져 호수에 뜨고, 「It is a big stone!」 이면 조약돌이 바위만 해져 도마뱀이 깜짝"
    },
    "wear": {
     "story": "Amy 의 망원경 — 두 문장을 들려준다(문장 띠가 같이 뜬다). 들은 차례대로 풍경 조각 둘을 지도에 놓는다",
     "order": "섬 안내 — 길 잃은 새가 가고 싶은 곳을 말풍선 그림으로 보여 준다. 아이가 이름을 말하면 그쪽 길에 등이 켜지고 새가 날아간다",
     "gvend": "바람개비 문장대 — 틀 칩(I see a · I like the · It is a)에 끝 낱말을 끼우고 구슬을 놓으면 바람개비가 그쪽을 가리킨다",
     "wjob": "정원 지도 — 지도의 빈 이름 칸에 쓴다. 쓴 자리에 작은 깃발이 선다",
     "book": "섬 지도책 — 쪽마다 풍경 하나와 한 문장. 낱말을 짚으며 읽으면 그 풍경에 빛이 든다",
     "belt": "호수 위 나뭇잎 배 줄 — 낱말이 적힌 잎 배가 떠내려오고 맞는 풍경 쪽 말뚝에 맨다",
     "sandwich": "돌탑 쌓기 — 부른 차례대로 쌓는다(「rock!」 「stone!」 「leaf!」). 높아질수록 탑이 흔들",
     "sbox": "모래톱 칸 — 손가락으로 판 칸에 소리대로 조개 글자를 놓는다(지난 걸음들의 무늬가 다 모인다 — a_e · o_e · ea · ee · ck · 겹친 ll)",
     "swrite": "바람개비 문장 — 틀은 옅은 글씨를 따라 쓰고 끝 낱말은 손으로",
     "wtrain": "섬 한 바퀴 나룻배 — 나룻배가 풍경 여덟 곳을 지나간다. 지나갈 때 이름을 대면 그곳에 깃발",
     "sstory": "엉뚱한 섬 — 낱말 카드를 틀에 끼우면 섬에서 그대로 벌어진다"
    },
    "work": {
     "L": "풍경 이야기를 듣고 지도에서 그곳을 고른다",
     "S": "언덕에 올라 보이는 것을 「I see a lake.」 하고 말한다",
     "R": "잎 배와 지도책의 낱말을 읽는다",
     "W": "정원 지도에 이름을 써넣는다",
     "next": "내가 쓴 이름이 지도의 깃발로 남는다 — 다음 날 나뭇잎 배에는 내 글씨 낱말이 섞여 떠내려오고, 홈 섬의 지도에도 그 이름이 내 글씨로 보인다"
    },
    "extras": [
     "정원 지도 받침대",
     "바람개비 문장대",
     "망원경",
     "나룻배",
     "물가 말뚝",
     "돌탑 터"
    ],
    "life": [
     "내 식물 전부",
     "호수 물결",
     "굴러가는 나뭇잎",
     "멀리 바다",
     "바위 뒤의 도마뱀"
    ],
    "ink": {
     "at": "frame",
     "on": "정원 지도(이름 칸 넷)",
     "lines": 4,
     "where": {
      "hill": "지도의 언덕 칸 — 쓰면 언덕 꼭대기에 깃발",
      "tree": "지도의 나무 칸 — 쓰면 나무에 그네가 걸린다",
      "lake": "지도의 호수 칸 — 쓰면 호수에 나룻배가 뜬다",
      "sea": "지도의 바다 칸 — 쓰면 먼 바다에 등대 불빛"
     }
    },
    "beat": "바람이 휙 휙 — 풀꽃들이 박자에 눕고 일어나고, 낱말마다 그 풍경에 햇빛 한 줄기",
    "way": {
     "by": "yard",
     "sees": "언덕 아래 운동장 길 — 아침 안개 속에 깃발 줄을 거는 사람 그림자"
    }
   },
   "events": [
    {
     "id": "islandguide",
     "name": "섬 안내",
     "beat": 1,
     "game": "order",
     "who": "amy",
     "en": "I see a lake. I see a hill!",
     "scene": "아침의 정원. 길 잃은 새가 가고 싶은 곳을 말풍선 그림으로 보여 준다 — 아이가 이름을 말하면 그쪽 길에 등이 켜지고 새가 날아가 앉는다. 내 식물들이 바람에 인사한다.",
     "end": "새가 언덕 위 나무에 앉아 노래한다 — 언덕으로 오르는 길이 열린다."
    },
    {
     "id": "stonetower",
     "name": "돌탑",
     "beat": 2,
     "game": "sandwich",
     "who": "max",
     "en": "Rock! Stone! Leaf!",
     "scene": "한낮의 언덕. Max 가 돌탑 터에서 손짓한다 — 부른 차례대로 쌓는다. 맨 아래는 큰 바위, 그 위에 조약돌, 꼭대기에 잎 한 장. 높아질수록 탑이 흔들.",
     "end": "꼭대기의 잎이 바람에 날려 호수로 — 나뭇잎 배가 되어 뜬다."
    },
    {
     "id": "gardenmap",
     "name": "정원 지도",
     "beat": 3,
     "game": "wjob",
     "who": "amy",
     "en": "Lake. Hill. Tree. Sea. I like the sea!",
     "scene": "노을의 정원. 지도의 이름 칸이 비어 있다 — 이름을 써넣으면 그 자리에 작은 깃발이 서고 풍경에 빛이 든다. 언덕에서 내려다보니 섬이 한눈에.",
     "end": "지도가 다 찼다 — 먼 바다에 등대 불빛이 한 번 반짝."
    },
    {
     "id": "sillyisland",
     "name": "엉뚱한 섬",
     "beat": 0,
     "game": "sstory",
     "who": "ben",
     "en": "It is a big leaf! I see a tree!",
     "scene": "Ben 이 바람개비 문장대를 마구 돌렸다. 낱말 카드를 틀에 끼우면 섬에서 그대로 벌어진다 — 잎 한 장이 돛단배만 해지고, 조약돌이 바위만 해진다.",
     "end": "Ben 이 큰 잎 배를 타고 호수를 한 바퀴 — 내리자 잎이 제 크기로."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Amy",
     "show": [
      "<hill>"
     ],
     "en": "It is a big hill!",
     "act": {
      "do": "find",
      "word": "hill"
     },
     "react": "내 캐릭터가 언덕 꼭대기로 뛰어올라 손차양 — 꼭대기에서 Max 가 돌 하나를 들어 보인다.",
     "leads": "stonetower"
    },
    {
     "arrive": "read",
     "from": "Max",
     "show": [
      "<leaf>"
     ],
     "en": "A leaf! I like the lake.",
     "act": {
      "do": "bring",
      "word": "leaf",
      "to": "lake"
     },
     "react": "잎이 호수에 닿자 작은 배가 되어 동동 — 지도 받침대의 빈 이름 칸이 반짝인다.",
     "leads": "gardenmap",
     "note": "나무 아래의 큰 잎을 호수로 — 나뭇잎 배"
    },
    {
     "arrive": "write",
     "from": "Ben",
     "show": [
      "{flag}"
     ],
     "en": "Hi! I am Ben. I jump!",
     "act": {
      "do": "go",
      "by": "yard"
     },
     "react": "언덕 아래 운동장에 깃발 줄이 올라간다. 문이 열렸으면 그 길로, 아직이면 안개 속 깃발만 보인다(쪽지는 우편함에 남는다).",
     "leads": "F06"
    }
   ],
   "guest": {
    "who": "otter",
    "enter": "문어 바위 물가의 그 수달(A08 에서 귀로 만난 otter) — 호수에 누워 둥둥 떠 온다. 배 위에 꼭 닫힌 조개 하나, 조개에 문장 한 줄.",
    "turns": [
     {
      "read": "I like the sand.",
      "pool": [
       "I see a stone.",
       "It is a big tree!"
      ],
      "opens": "읽으면 조개가 딱 열린다 — 모래로 빚은 작은 성. 수달이 모래톱에 내려놓자 성에 깃발이 선다."
     },
     {
      "show": "rock",
      "cards": [
       "I see a rock.",
       "I see a sock.",
       "I see a rose."
      ],
      "ans": "I see a rock.",
      "why": "끝 낱말의 첫소리(r · s)와 가운데·끝(o·ck · o_e·s) — 문장 끝 낱말을 끝까지 읽는다"
     },
     {
      "say": "I like the sea.",
      "alt": "I see a lake.",
      "cue": "수달이 앞발로 먼 바다와 발밑 호수를 번갈아 가리킨다"
     }
    ],
    "bye": "수달이 조약돌 하나를 선물로 내려놓고 물결을 타고 간다 — 노을이 지고 언덕 아래 운동장 쪽에 불이 하나 켜진다."
   },
   "job": {
    "who": "amy",
    "ask": "정원 지도를 받침대에 펴고 빈 이름 칸을 손가락으로 하나씩 짚는다.",
    "write": [
     "lake",
     "hill",
     "tree",
     "sea"
    ],
    "plan": {
     "meet": [
      "hill",
      "tree"
     ],
     "write": [
      "lake",
      "sea"
     ]
    },
    "carry": [],
    "rule": "듣고 쓰기 — 낱말을 듣고 소리대로 쓴다(유령 글씨는 두 번 헤맨 뒤에만). 넷 다 지난 걸음들의 무늬다 — 겹친 ll · ee · a_e · ea",
    "gives": "쓴 자리마다 깃발이 서고 풍경이 달라진다 — 언덕 꼭대기에 깃발, 나무에 그네, 호수에 나룻배, 바다에 등대 불빛. 지도는 홈 섬에도 그대로 걸린다."
   }
  },
  "F06": {
   "room": {
    "kind": "out",
    "owner": "ben",
    "rig": "morning",
    "weather": "dew",
    "accent": "--a-fish",
    "sound": "깃발 줄 펄럭 + 호루라기 한 번 + 멀리 북소리",
    "center": "운동회 날 아침의 운동장. 뒤로 만국기 대신 색 깃발 줄(글자 없음)이 걸리는 중이고, 가운데 흰 선 트랙. 왼쪽은 응원석, 오른쪽은 준비 천막. Ben 이 호루라기를 목에 걸고 서 있고 강아지가 발치에서 꼬리를 흔든다",
    "line": "응원석 위 깃발 줄 가운데 한 줄 — 「I ___!」 「We ___!」 칩이 걸린다. 느낌표 구슬을 끼우면 운동장의 모두가 그 동작을 한 번 한다",
    "props": {
     "wave": [
      "La",
      "깃발을 든 응원 인형 — 누르면 깃발을 좌우로 크게 흔든다"
     ],
     "stand": [
      "Lb",
      "시상대와 앉아 있는 곰 인형 — 누르면 곰이 벌떡 일어선다"
     ],
     "jump": [
      "Lc",
      "줄넘기 줄과 낮은 뜀틀 — 누르면 강아지가 폴짝 넘는다(숲에서 귀로 만난 그 낱말 · 운동장에서 읽은 그 낱말)"
     ],
     "sing": [
      "Ld",
      "확성기와 악보대 — 누르면 음표가 퐁퐁 솟는다"
     ],
     "sweep": [
      "Ra",
      "싸리 빗자루 — 누르면 트랙 위 낙엽을 쓱쓱 쓴다"
     ],
     "ride": [
      "Rb",
      "세발자전거 — 누르면 따릉, 혼자서 트랙을 반 바퀴"
     ],
     "smile": [
      "Rc",
      "웃는 얼굴 메달 — 누르면 메달이 반짝 웃고 옆의 것들도 따라 웃는다"
     ],
     "wake": [
      "Rd",
      "준비 천막 아래 낮잠 자는 고양이와 자명종 — 누르면 따르릉, 고양이가 눈을 번쩍"
     ]
    },
    "sight": {
     "sing": "확성기 아래의 통말 딱지 — 깃발 줄에서는 끝 칩으로"
    },
    "ears": [
     [
      "ride",
      "hide"
     ],
     [
      "stand",
      "sand"
     ],
     [
      "wake",
      "way"
     ]
    ],
    "wear": {
     "dance": "강아지 구령 — 강아지가 외친 동작을, 움직이는 카드 둘 가운데 고르고 「같이!」 에 몸으로 한다. 카메라가 없으면 고르기만으로 끝난다",
     "magic": "내 구령 — 아이가 동작을 말하면 Ben 이 그대로 한다(「sweep!」 하면 쓸고, 「wave!」 하면 깃발을 흔든다)",
     "wjob": "응원 팻말 — 굵은 붓으로 팻말에 쓴다. 쓴 팻말은 응원석에 꽂힌다",
     "belt": "바통 이어달리기 — 낱말이 적힌 바통이 손에서 손으로 오고, 맞는 동작 그림의 주자에게 넘긴다",
     "catch": "떨어지는 풍선 받기 — 풍선마다 동작 그림. 들린 낱말의 풍선만 몸을 기울여 받는다(ride · hide, wake · way 가 섞여 들린다)",
     "sbox": "뜀틀 칸 — 뜀틀 단마다 소리 하나(wave 와 ride · smile · wake 는 모음과 e 가 한 단 · sweep 의 ee 도 한 단)",
     "wtrain": "운동회 행진 — 행진 줄의 칸마다 동작 그림 하나. 지나갈 때 이름을 대면 그 칸이 그 동작을 한다"
    },
    "work": {
     "L": "강아지의 구령을 듣고 그 동작을 고른다",
     "S": "내가 구령한다 — 말한 대로 Ben 이 움직인다",
     "R": "바통의 낱말을 읽고 맞는 주자에게 넘긴다",
     "W": "응원 팻말을 쓴다",
     "next": "내가 쓴 응원 팻말이 응원석에 꽂혀 남는다 — 다음 날 바통에는 내 글씨 낱말이 섞여 오고, 응원 인형들이 내 팻말을 들고 있다"
    },
    "extras": [
     "색 깃발 줄",
     "흰 선 트랙",
     "시상대",
     "준비 천막",
     "호루라기",
     "바통 바구니"
    ],
    "life": [
     "운동회 깃발",
     "빗자루질",
     "춤추는 강아지",
     "응원하는 친구들",
     "트랙 위를 구르는 낙엽"
    ],
    "ink": {
     "at": "frame",
     "on": "응원 팻말(네 장)",
     "lines": 4,
     "where": {
      "wave": "응원석 첫째 팻말 — 응원 인형이 들고 흔든다",
      "jump": "뜀틀 옆 팻말 — 강아지가 그 앞에서 폴짝",
      "ride": "트랙 출발선 팻말 — 세발자전거가 그 앞에 선다",
      "smile": "시상대 위 팻말 — 메달 셋이 나란히 웃는다"
     }
    },
    "beat": "북이 둥 둥 — 깃발 줄이 박자에 출렁이고, 동작 낱말마다 강아지가 그 동작을 한 번 한다",
    "way": {
     "by": "road",
     "sees": "운동장 너머 마을 길 — 저녁 무렵 그림책방 맨 윗칸 창에 독서등이 켜진다"
    }
   },
   "events": [
    {
     "id": "sportsmorning",
     "name": "운동회 아침",
     "beat": 1,
     "game": "magic",
     "who": "ben",
     "en": "Stand! Wave! I wave!",
     "scene": "운동회 날 아침, 아직 준비가 덜 됐다. 아이가 구령하면 Ben 이 그대로 한다 — 일어서고, 깃발을 흔들고, 노래한다. 구령할 때마다 깃발 줄이 한 칸씩 올라간다.",
     "end": "깃발 줄이 다 걸렸다 — 강아지가 한 바퀴 돌며 짖는다."
    },
    {
     "id": "dogcalls",
     "name": "강아지 구령",
     "beat": 2,
     "game": "catch",
     "who": "amy",
     "en": "Listen! Ride? Hide? Ride!",
     "scene": "강아지가 구령을 외치면 동작 그림 풍선이 떨어진다 — 들린 낱말의 풍선만 몸을 기울여 받는다. 비슷한 소리(ride · hide, stand · sand)가 섞여 들린다.",
     "end": "받은 풍선들이 한 다발로 묶여 시상대 위에 뜬다."
    },
    {
     "id": "alltogether",
     "name": "다 같이",
     "beat": 3,
     "game": "dance",
     "who": "mina",
     "en": "We sing! We smile! We jump!",
     "scene": "운동회의 끝. 강아지가 외친 동작을 다 같이 — 노래하고, 웃고, 뛴다. 응원석의 팻말은 내가 쓴 것들이다.",
     "end": "모두 웃으며 시상대에 선다 — 메달 셋이 반짝 웃는다."
    },
    {
     "id": "cheerchant",
     "name": "응원 챈트",
     "beat": 0,
     "game": "schant",
     "who": "max",
     "en": "Wave, wave, I wave! We sing!",
     "scene": "Max 가 북을 메고 왔다. 응원석이 박자에 맞춰 챈트 — 낱말 자리마다 응원 인형이 그 동작을 한다. 빨라질수록 깃발 줄이 더 크게 출렁.",
     "end": "북이 둥 — 응원석이 파도처럼 일어났다 앉는다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Ben",
     "show": [
      "<ride>"
     ],
     "en": "I ride!",
     "act": {
      "do": "bring",
      "word": "ride",
      "to": "dog"
     },
     "react": "강아지가 세발자전거에 올라타 따릉따릉 — 준비 천막 위로 풍선 하나가 떠오른다.",
     "leads": "dogcalls",
     "note": "세발자전거를 강아지에게"
    },
    {
     "arrive": "read",
     "from": "Amy",
     "show": [
      "<smile>",
      "<wake>"
     ],
     "en": "Wake! Smile!",
     "act": {
      "do": "match",
      "pairs": [
       "smile",
       "wake"
      ]
     },
     "react": "자명종이 따르릉, 고양이가 눈을 번쩍 뜨고 메달이 반짝 웃는다 — 시상대에 빈자리가 셋.",
     "leads": "alltogether",
     "note": "낱말 둘을 메달 · 자명종에 잇는다"
    },
    {
     "arrive": "write",
     "from": "Mina",
     "show": [
      "{book}",
      "{sun}"
     ],
     "en": "Hi! I am Mina. I read!",
     "act": {
      "do": "go",
      "by": "road"
     },
     "react": "마을 길 끝 그림책방 창에 독서등이 켜진다. 문이 열렸으면 그 길로, 아직이면 창의 불빛만 보인다(쪽지는 우편함에 남는다).",
     "leads": "F07"
    }
   ],
   "guest": {
    "who": "zebra",
    "enter": "얼룩말 들판의 그 얼룩말(A13) — 등번호 천을 두르고 트랙을 달려온다. 등번호 자리에 숫자 대신 문장 한 줄.",
    "turns": [
     {
      "read": "We ride!",
      "pool": [
       "I smile!",
       "We wave!"
      ],
      "opens": "읽으면 얼룩말이 무릎을 굽힌다 — 내 캐릭터와 강아지가 등에 올라타고 트랙을 한 바퀴."
     },
     {
      "show": "jump",
      "cards": [
       "I jump!",
       "I jog!",
       "We jump!"
      ],
      "ans": "I jump!",
      "why": "누가(I · We)와 무엇을(jump · jog) — 짧은 문장도 두 낱말을 다 읽는다"
     },
     {
      "say": "We sing!",
      "alt": "I wave!",
      "cue": "얼룩말이 앞발로 박자를 구르며 고개를 까딱까딱한다"
     }
    ],
    "bye": "얼룩말이 결승 끈을 가슴으로 끊고 달려 나간다 — 색종이가 날리고 마을 길 쪽으로 해가 기운다."
   },
   "job": {
    "who": "ben",
    "ask": "빈 응원 팻말 넷을 응원석에 세우고 굵은 붓을 내민다.",
    "write": [
     "wave",
     "ride",
     "smile",
     "jump"
    ],
    "plan": {
     "meet": [
      "wave",
      "jump"
     ],
     "write": [
      "ride",
      "smile"
     ]
    },
    "carry": [
     "hill",
     "sea"
    ],
    "rule": "듣고 쓰기 — 낱말을 듣고 소리대로 쓴다. 이어 쓰기 둘(hill · sea)은 지난 걸음 정원에 보내는 엽서 — 열매 차례가 아니면 건너뛴다",
    "gives": "쓴 팻말이 응원석에 꽂히고 그 동작이 운동장에서 일어난다 — 깃발이 흔들리고, 강아지가 뛰고, 자전거가 서고, 메달이 웃는다. 엽서는 정원 지도 옆에 붙는다."
   }
  },
  "F07": {
   "room": {
    "kind": "book3",
    "owner": "mina",
    "rig": "evening",
    "weather": "glow",
    "accent": "--a-cream",
    "sound": "책장 넘기는 소리 + 독서등 지잉 + 창밖 시계탑 종",
    "center": "그림책방 맨 윗칸 창가. 긴 창을 따라 독서대 셋이 나란히 — 창밖 하늘이 왼쪽은 아침, 가운데는 한낮, 오른쪽은 저녁이다. 책장 맨 윗칸에 마지막 세 권, 표지에 Mina 의 그림. 아래 칸들은 한 해 동안 읽은 책과 내 독서 카드로 차 있다",
    "line": "창틀을 따라 걸린 줄 — 책에서 고른 한 문장이 칩으로 걸린다. 마침표 구슬을 끼우면 창밖 하늘이 그 문장의 때(아침 · 낮 · 저녁)로 바뀐다",
    "stands": [
     [
      -4.4,
      -1.6
     ],
     [
      0,
      -2.8
     ],
     [
      4.4,
      -1.6
     ]
    ],
    "texts": [
     {
      "line": "It is a sunny day. I wake.",
      "who": "mina",
      "day": "meet",
      "time": "morning",
      "card": "I wake.",
      "scene": "Mina 의 방 아침 — 첫 문장에 창으로 해가 쏟아지고, 쪽이 넘어가 둘째 문장에 Mina 가 이불을 걷고 기지개. sunny 를 건너뛰면 창밖이 흐린 채 멈춘다"
     },
     {
      "line": "Ben has a green fish. We smile.",
      "who": "ben",
      "day": "read",
      "time": "noon",
      "card": "We smile.",
      "scene": "한낮의 부두 — 첫 문장에 Ben 이 낚싯줄 끝의 초록 물고기를 번쩍 들어 보이고, 쪽이 넘어가 둘째 문장에 Mina 와 Ben 이 마주 보고 웃는다. green 을 건너뛰면 물고기가 색 없이 올라온다"
     },
     {
      "line": "They are here. We ride a boat.",
      "who": "sam",
      "day": "write",
      "time": "evening",
      "card": "We ride a boat.",
      "unseen": true,
      "scene": "저녁 부두 — 첫 문장에 친구들이 손을 흔들며 모여들고, 쪽이 넘어가 둘째 문장에 다 같이 배를 타고 노을 속으로. 아무도 먼저 읽어 주지 않는 글 — 손님이 들고 온다"
     }
    ],
    "order": "세 권을 다 읽으면 책 세 권이 독서대에서 내려와 섞인다 — 아침 → 낮 → 저녁 차례로 다시 독서대에 세운다. 세울 때마다 그 창의 하늘이 켜진다(글자를 읽어야 차례를 안다 — 표지 그림은 셋 다 Mina)",
    "retell": "책을 덮은 뒤 한 문장을 다시 말한다 — 독서 카드의 그 문장(I wake. · We smile. · We ride a boat.). 그림만 보고 말하고, 못 떠올리면 책이 한 번 펼쳐졌다 닫힌다",
    "things": {
     "wake": "첫 권 속 기지개 켜는 Mina",
     "fish": "둘째 권 속 초록 물고기",
     "green": "둘째 권 속 초록 물고기",
     "smile": "둘째 권 속 마주 웃는 둘",
     "sunny": "첫 권 속 창으로 쏟아지는 해",
     "day": "아침 창밖 하늘"
    },
    "wear": {
     "story": "독서 의자 — Mina 가 첫 권을 읽어 준다(문장 띠가 같이 뜬다). 들은 차례대로 장면 조각 둘(해 · 기지개)을 독서대에 놓는다",
     "book": "맨 윗칸의 세 권 — 낱말을 짚으며 읽으면 그림이 움직이고, 두 문장 사이에서 쪽이 넘어가며 창밖 하늘이 그때로 바뀐다",
     "readaloud": "책에서 빠져나온 낱말 카드(sunny · wake · green · smile) — 읽으면 책 속 제자리로 날아가 꽂힌다",
     "belt": "책 반납 벨트 — 두 문장 띠가 지나가고 맞는 때의 독서대(아침 · 낮)에 꽂는다",
     "echo": "창가 소라 껍데기 — 두 문장을 읽으면 한 문장씩 되돌아 들린다. 들리는 동안 그 쪽의 그림이 다시 움직인다",
     "swrite": "독서 카드 — 책마다 한 문장을 통째로 손으로 쓴다(첫 글자는 큰 글자, 끝에 점)",
     "wjob": "독서 카드 꽂이 — 다 쓴 카드를 그 책 옆에 꽂고, 세 권을 아침 → 낮 → 저녁 차례로 세운다"
    },
    "work": {
     "L": "첫 권을 듣고 장면 조각을 차례로 놓는다",
     "S": "책을 덮고 한 문장을 다시 말한다",
     "R": "세 권을 혼자 읽고 아침 · 낮 · 저녁 차례로 세운다",
     "W": "독서 카드에 한 문장을 통째로 쓴다",
     "next": "내가 쓴 독서 카드가 책 옆에 꽂혀 남는다 — 「내가 읽은 책」 칸이 맨 윗줄까지 차고, 다음에 그 책을 펴면 카드의 내 글씨가 먼저 보인다"
    },
    "extras": [
     "독서대 셋",
     "독서 의자",
     "「내가 읽은 책」 칸",
     "책 반납 벨트",
     "창가 소라 껍데기",
     "아래층으로 가는 사다리"
    ],
    "life": [
     "창밖으로 흐르는 하루",
     "독서등",
     "책방 고양이",
     "가득 찬 책장",
     "창틀에 내려앉는 저녁 새"
    ],
    "ink": {
     "at": "frame",
     "on": "독서 카드 세 장(책마다 한 장 — 한 문장을 통째로)",
     "lines": 3
    },
    "beat": "책장을 툭 툭 넘기는 소리 — 독서등이 박자에 숨 쉬고, 줄마다 창밖 하늘이 한 칸씩 흐른다",
    "way": {
     "by": "lantern",
     "sees": "책방 창밖 등불 길 — 광장 쪽에서 등불이 하나둘 떠오르고 멀리 북소리"
    }
   },
   "events": [
    {
     "id": "lastthree",
     "name": "맨 윗칸 세 권",
     "beat": 1,
     "game": "story",
     "who": "mina",
     "en": "Listen! It is a sunny day. I wake.",
     "scene": "책장 맨 윗칸의 마지막 세 권 — Mina 네 하루. Mina 가 첫 권을 읽어 준다. 들은 차례대로 장면 조각(해 · 기지개)을 독서대에 놓으면 아침 창의 하늘이 켜진다.",
     "end": "첫 권이 아침 독서대에 선다 — 창밖에 해가 떠오른다."
    },
    {
     "id": "noonbook",
     "name": "낮의 책",
     "beat": 2,
     "game": "book",
     "who": "ben",
     "en": "Ben has a green fish. We smile.",
     "scene": "둘째 권. 낱말을 하나씩 짚으며 읽으면 그림이 움직인다 — Ben 이 초록 물고기를 번쩍, 쪽이 넘어가 둘이 마주 웃는다. 읽는 동안 가운데 창의 해가 머리 위로.",
     "end": "둘째 권이 낮 독서대에 선다 — 셋째 권만 안개 속."
    },
    {
     "id": "dayorder",
     "name": "하루의 차례",
     "beat": 3,
     "game": "wjob",
     "who": "mina",
     "en": "It is a sunny day. We smile.",
     "scene": "세 권이 독서대에서 내려와 섞였다. 독서 카드를 쓰고, 책을 아침 → 낮 → 저녁 차례로 다시 세운다 — 세울 때마다 그 창의 하늘이 켜진다.",
     "end": "세 창에 하루가 차례로 흐른다 — 책장이 가득 찼다."
    },
    {
     "id": "shellecho2",
     "name": "소라 메아리",
     "beat": 0,
     "game": "echo",
     "who": "amy",
     "en": "I wake! We smile!",
     "scene": "창가 소라 껍데기에 두 문장을 읽으면 한 문장씩 되돌아 들린다 — 들리는 동안 책 속 그림이 다시 움직인다. Amy 가 소라에 대고 하품 소리를 내 본다.",
     "end": "소라 속에서 뱃고동 소리가 한 번 — 셋째 권의 안개가 술렁인다."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Mina",
     "show": [
      "<wake>"
     ],
     "en": "I wake.",
     "act": {
      "do": "say",
      "line": "I wake.",
      "tap": "wake"
     },
     "react": "첫 권 속 Mina 가 기지개를 켜고 창을 연다 — 둘째 권의 표지가 들썩인다.",
     "leads": "noonbook",
     "note": "낱말을 하나씩 짚어 읽는다"
    },
    {
     "arrive": "read",
     "from": "cat",
     "show": [
      "<green>",
      "<fish>"
     ],
     "en": "A green fish!",
     "act": {
      "do": "find",
      "word": "fish"
     },
     "react": "책방 고양이가 책 속 초록 물고기를 앞발로 톡 — 독서 카드 꽂이를 꼬리로 툭 친다.",
     "leads": "dayorder",
     "note": "둘째 권의 장면에서 물고기를 찾아 누른다. 보낸 이는 발자국 도장(책방 고양이)"
    },
    {
     "arrive": "write",
     "from": "Max",
     "show": [
      "{lamp}"
     ],
     "en": "Hi! I am Max. We play!",
     "act": {
      "do": "go",
      "by": "lantern"
     },
     "react": "등불 길에 불이 줄지어 켜진다. 문이 열렸으면 광장으로, 아직이면 떠오르는 등불만 보인다(쪽지는 우편함에 남는다).",
     "leads": "F08"
    }
   ],
   "guest": {
    "who": "Sam",
    "enter": "Sam 이 부두에서 젖은 밧줄을 어깨에 메고 사다리를 올라온다 — 안개에 싸인 셋째 권을 앞치마에 싸서 안았다. 표지에 두 문장 — 아무도 먼저 읽어 주지 않은 글.",
    "turns": [
     {
      "read": "They are here. We ride a boat.",
      "pool": [
       "It is a rainy day. I read.",
       "She has a kite. We play."
      ],
      "opens": "읽으면 안개가 걷히고 책이 펼쳐진다 — 친구들이 부두에 모여 손을 흔들고, 쪽이 넘어가 다 같이 배를 타고 노을 속으로. 저녁 창의 하늘이 켜진다."
     },
     {
      "show": "fish",
      "cards": [
       "Ben has a green fish.",
       "Ben has a green dish.",
       "Ben has a gray fish."
      ],
      "ans": "Ben has a green fish.",
      "why": "색(green · gray)과 끝 낱말(fish · dish) — 긴 문장도 낱말 하나 건너뛰지 않고 읽는다"
     },
     {
      "say": "We ride a boat!",
      "alt": "We smile.",
      "cue": "Sam 이 밧줄을 창틀에 걸고 노 젓는 시늉을 한다"
     }
    ],
    "bye": "세 권이 아침 · 낮 · 저녁 독서대에 나란히 — Sam 이 창밖 광장 쪽에서 떠오르는 등불을 가리킨다."
   },
   "job": {
    "who": "Mina",
    "ask": "독서 카드 세 장을 부채처럼 펴 보이고 깃펜을 내민다.",
    "write": [
     "I wake.",
     "We smile.",
     "We ride a boat."
    ],
    "plan": {
     "read": [
      "I wake."
     ],
     "write": [
      "We smile."
     ],
     "again": [
      "We ride a boat."
     ]
    },
    "carry": [],
    "rule": "책마다 카드 한 장 — 지문의 한 문장을 통째로 손으로 쓴다(하루 한 장 · 열두 자 안). 칩으로 먼저 줄에 걸어 보고, 걸린 문장을 보며 쓴다 — 첫 글자는 큰 글자, 끝에 점. 쓴 뒤에는 책을 덮고 그 문장을 다시 말한다",
    "gives": "독서 카드가 책 옆에 꽂히고 책등에 내 표시. 세 장이 다 차면 「내가 읽은 책」 칸이 맨 윗줄까지 가득 — 책방 종이 한 번 울린다."
   }
  },
  "F08": {
   "room": {
    "kind": "feast",
    "owner": "max",
    "rig": "lantern",
    "weather": "glow",
    "accent": "--a-gold",
    "sound": "멀리 북소리 + 등불 타는 소리 + 부두의 뱃고동",
    "center": "섬 전체에 등불. 광장 한가운데 등불 나무 — 글자 숲 큰 나무의 가지를 옮겨 심은 것이라 열매 스물여섯이 달려 있다(내 글씨 이름표). 나무 둘레에 꺼진 등불 여섯, 그 뒤로 친구 열둘이 말굽으로 섰다. 뒤로 부두 — 처음 보는 큰 배 한 척이 들어와 있다. 섬의 모든 간판에 글자가 돌아왔다",
    "line": "등불 나무에서 부두 쪽으로 뻗은 줄 — 내 문장이 칩으로 걸린다. 마침표 구슬을 끼우면 광장의 모두가 그 문장을 한 번 한다. 이 줄에 걸린 문장이 그대로 졸업장에 옮겨진다",
    "ring": [
     [
      "kid",
      "F01",
      [
       -7,
       -0.3
      ]
     ],
     [
      "duck",
      "F02",
      [
       -6.3,
       -2
      ]
     ],
     [
      "robot",
      "F03",
      [
       -4.9,
       -3.2
      ]
     ],
     [
      "baby",
      "F04",
      [
       -3.2,
       -4
      ]
     ],
     [
      "otter",
      "F05",
      [
       -4.4,
       -0.6
      ]
     ],
     [
      "zebra",
      "F06",
      [
       -2.6,
       -1.6
      ]
     ],
     [
      "alligator",
      "A01",
      [
       2.6,
       -1.6
      ]
     ],
     [
      "rat",
      "B01",
      [
       4.4,
       -0.6
      ]
     ],
     [
      "king",
      "C02",
      [
       3.2,
       -4
      ]
     ],
     [
      "queen",
      "D01",
      [
       4.9,
       -3.2
      ]
     ],
     [
      "uncle",
      "E01",
      [
       6.3,
       -2
      ]
     ],
     [
      "elephant",
      "C08",
      [
       7,
       -0.3
      ]
     ]
    ],
    "lamps": [
     "bee",
     "pail",
     "toad",
     "bake",
     "dime",
     "low"
    ],
    "more": {
     "bee": "첫 등불 — 켜지면 불빛 속에서 벌 한 마리가 붕 날아오른다",
     "pail": "둘째 등불 — 켜지면 양동이가 나타나 등불 나무에 물을 준다",
     "toad": "셋째 등불 — 켜지면 두꺼비가 폴짝 나와 광장 한가운데서 꾸륵",
     "bake": "넷째 등불 — 켜지면 화덕에 불이 붙고 Sam 이 잔치 케이크를 굽는다",
     "dime": "다섯째 등불 — 켜지면 은빛 동그란 것이 반짝 굴러 나와 배의 뱃삯 통에 쏙",
     "low": "여섯째 등불 — 켜지면 벌이 낮게, 풀잎 바로 위를 스치며 난다"
    },
    "mission": {
     "text": "I see a bee. It is low.",
     "retell": "It is low.",
     "how": "등불 여섯을 하나씩 읽어 켠다(처음 보는 낱말도 배운 소리로 읽힌다 — ee · ai · oa · a_e · i_e · ow) → 처음 보는 글 한 편을 소리 내어 읽는다 → 물음 그림에 문장 카드로 답한다 → 책을 덮고 한 문장을 다시 말한다"
    },
    "things": {
     "read": "등불 나무 아래 책 더미",
     "play": "광장의 놀이 깔개",
     "say": "확성기",
     "here": "광장 한가운데 발자국 깔개",
     "book": "내가 읽은 책 열두 권의 수레"
    },
    "tale": {
     "frames": [
      "I see a ___.",
      "It is a big ___!"
     ],
     "chips": [
      "cat",
      "ship",
      "cake",
      "kite",
      "goat",
      "lake"
     ],
     "look": "한 해의 낱말이 구역마다 하나씩 — 고른 대로 광장에서 벌어진다. 「It is a big cake!」 면 잔치 케이크가 등불 나무만 해지고, 「I see a ship.」 이면 부두의 배가 뿌우 하고 답한다"
    },
    "wear": {
     "wtrain": "한 해 기차 — 긴 등불 기차의 칸마다 그림 하나. 숲 · 마당 · 공방 · 진열장 · 창가 · 시장의 낱말이 섞여 지나간다. 이름을 대면 그 칸의 등불이 켜진다",
     "book": "책 읽어 주는 밤 — 내가 읽은 책 열두 권이 수레에 실려 온다. 친구가 고른 책을 소리 내어 읽어 주면 그 친구가 책 속 그림을 따라 한다",
     "belt": "등불 쪽지 줄 — 문장 쪽지가 등불에 매달려 지나가고, 읽고 맞는 친구(그림)에게 건넨다",
     "sstory": "엉뚱한 잔치 — 낱말 카드를 틀에 끼우면 광장에서 그대로 벌어진다",
     "swrite": "졸업장 밑글 — 「We are here.」 를 옅은 글씨 위에 따라 쓴다",
     "gvend": "졸업 문장대 — 틀이 없다. 누가 칩 · 가운데 칩 · 끝 칩을 내 마음대로 골라 끼우고 마침표 구슬을 놓는다. 말이 되는 문장이면 줄에 걸리고 광장에서 일어난다",
     "wjob": "졸업장 — 줄에 걸린 내 문장을 보며 졸업장에 손으로 쓴다. 내 이름은 처음부터 내 글씨(한 해의 첫 이름표)"
    },
    "work": {
     "L": "친구가 고른 책의 문장을 듣고 그 그림을 고른다",
     "S": "처음 보는 글을 읽고 한 문장을 다시 말한다",
     "R": "등불 여섯과 처음 보는 글 한 편을 혼자 읽는다",
     "W": "내 문장을 졸업장에 쓴다",
     "next": "내가 쓴 졸업장이 홈 섬 내 방 벽에 걸린다 — 섬의 간판마다 글자가 돌아와 있고, 어느 방에 가도 내가 쓴 것들이 그대로 있다. 부두의 배는 다음 길(사다리)로 간다"
    },
    "extras": [
     "등불 나무",
     "꺼진 등불 여섯",
     "긴 잔칫상",
     "책 수레",
     "졸업 문장대",
     "부두와 큰 배"
    ],
    "life": [
     "섬 전체 등불",
     "모여든 친구 모두",
     "글자가 다 돌아온 간판들",
     "부두의 배",
     "등불 나무 위를 도는 벌 한 마리"
    ],
    "ink": {
     "at": "center",
     "on": "졸업장(내 문장 한 줄 — 등불 나무 아래 받침대)",
     "lines": 1
    },
    "beat": "여섯 구역의 박자 소리가 줄마다 번갈아 — 통나무 · 잼 병 · 화덕 · e 등 · 빗방울 · 시장 종",
    "way": {
     "by": "lantern",
     "sees": "부두에 들어온 큰 배 — 돛에 사다리 그림. 배다리가 내려와 있고, 갑판에 새 책 한 권이 펼쳐져 있다"
    },
    "after": "졸업장을 쓰면 사다리 칸 lv2-34 가 켜지고 배다리에 불이 들어온다 — 배에 오르면 사다리(Lv3) 입구로 간다. 섬은 그대로 남아 언제든 돌아올 수 있다(정원의 씨앗은 계속 자란다)"
   },
   "events": [
    {
     "id": "yeartrain",
     "name": "한 해 기차",
     "beat": 1,
     "game": "wtrain",
     "who": "max",
     "en": "I see a cat! I see a ship! I see a cake!",
     "scene": "숲 · 마당 · 마을의 친구들이 광장에 모인다. 긴 등불 기차가 들어온다 — 칸마다 한 해의 낱말 그림 하나. 이름을 대면 그 칸의 등불이 켜지고 그 낱말을 만난 방의 친구가 손을 든다.",
     "end": "기차가 광장을 한 바퀴 돌아 등불 나무 아래 선다 — 섬 전체에 불이 번진다."
    },
    {
     "id": "readingnight",
     "name": "책 읽어 주는 밤",
     "beat": 2,
     "game": "book",
     "who": "mina",
     "en": "We read! We say! We play!",
     "scene": "내가 읽은 책 열두 권이 수레에 실려 온다. 친구가 한 권을 고르면 아이가 소리 내어 읽어 준다 — 듣던 친구가 책 속 그림을 따라 한다. 이제 읽어 주는 쪽은 나다.",
     "end": "친구들이 박수 — 등불 나무 둘레의 꺼진 등불 여섯이 궁금한 듯 흔들린다."
    },
    {
     "id": "mysentence",
     "name": "졸업 문장",
     "beat": 3,
     "game": "gvend",
     "who": "max",
     "en": "We are here! We are here!",
     "scene": "졸업 문장대에는 틀이 없다. 칩을 내 마음대로 골라 문장을 만든다 — 말이 되면 줄에 걸리고 광장에서 일어난다. 가장 마음에 드는 한 줄을 졸업장에 쓴다.",
     "end": "졸업장에 내 문장과 내 이름 — 섬의 모든 간판에 불이 들어오고 배가 뿌우 하고 답한다."
    },
    {
     "id": "sillyfeast",
     "name": "엉뚱한 잔치",
     "beat": 0,
     "game": "sstory",
     "who": "ben",
     "en": "It is a big cake! I see a goat!",
     "scene": "Ben 이 잔칫상 위에 카드를 쏟았다. 틀에 끼우는 대로 벌어진다 — 케이크가 등불 나무만 해지고, 염소가 잔칫상 위를 걷는다.",
     "end": "모두 깔깔 — 큰 케이크는 열두 친구가 한 조각씩."
    }
   ],
   "notes": [
    {
     "arrive": "meet",
     "from": "Max",
     "show": [
      "<read>",
      "<play>"
     ],
     "en": "We read! We play!",
     "act": {
      "do": "match",
      "pairs": [
       "read",
       "play"
      ]
     },
     "react": "책 더미가 들썩, 놀이 깔개가 펄럭 — 광장 끝에서 책 수레 바퀴 소리가 난다.",
     "leads": "readingnight",
     "note": "낱말 둘을 책 더미 · 놀이 깔개에 잇는다"
    },
    {
     "arrive": "read",
     "from": "Mina",
     "show": [
      "<book>"
     ],
     "en": "This is my book. We read!",
     "act": {
      "do": "bring",
      "word": "book",
      "to": "kid"
     },
     "react": "아이(kid)가 책을 받아 품에 안고 한 장 넘긴다 — 등불 나무 아래 졸업 문장대의 덮개가 벗겨진다.",
     "leads": "mysentence",
     "note": "책 수레의 한 권을 말굽의 그 아이에게 — 이제 내가 빌려준다"
    },
    {
     "arrive": "write",
     "from": "Sam",
     "show": [
      "{boat}"
     ],
     "en": "Hi! We are here! I see a boat!",
     "act": {
      "do": "go",
      "by": "lantern"
     },
     "react": "배다리에 불이 들어온다. 졸업장을 썼으면 배에 오를 수 있고, 아직이면 배가 부두에서 기다린다 — 떠나지 않는다(쪽지는 우편함에 남는다).",
     "leads": "LADDER"
    }
   ],
   "guest": {
    "who": "Mina",
    "enter": "Mina 가 등불을 들고 등불 나무 아래로 온다 — 글자 잔치와 마을 축제의 그 밤처럼. 이번에는 꺼진 등불 여섯과, 아무도 읽어 준 적 없는 책 한 권을 들었다.",
    "turns": [
     {
      "read": "I see a bee. It is low.",
      "pool": [
       "I see a toad. It is wet.",
       "I bake a big cake."
      ],
      "opens": "등불 여섯을 하나씩 읽어 켠 뒤 책을 읽는다 — 안개가 걷히고, 벌 한 마리가 풀잎 바로 위를 낮게 난다. 친구 열둘이 숨을 죽이고 본다."
     },
     {
      "show": "low",
      "cards": [
       "It is low.",
       "It is late.",
       "It is hot."
      ],
      "ans": "It is low.",
      "why": "읽고 답한다 — 벌이 어떻게 나는지. low 는 오늘 처음 읽은 낱말(l · ow), late · hot 은 아는 낱말"
     },
     {
      "say": "We are here!",
      "alt": "I see a bee.",
      "cue": "Mina 가 등불을 높이 들고 친구 열둘과 나를 한 번에 둘러 가리킨다"
     }
    ],
    "bye": "Mina 가 졸업장을 두 손으로 건넨다 — 친구 열둘이 등불을 띄우고, 부두의 배가 뿌우 하고 길게 운다."
   },
   "job": {
    "who": "Mina",
    "ask": "등불 나무 아래 받침대에 빈 졸업장을 펴고, 줄에 걸린 내 문장을 가리킨다.",
    "write": [
     "We are here.",
     "내 문장 한 줄"
    ],
    "plan": {
     "meet": [
      "칩으로만 — 졸업 문장대에서 문장 셋을 만들어 말한다(쓰지 않는다)"
     ],
     "read": [
      "「We are here.」 를 옅은 글씨 위에 따라 쓴다 — 졸업장 밑글"
     ],
     "write": [
      "줄에 건 내 문장 한 줄을 졸업장에 손으로 — 그 아래 내 이름"
     ]
    },
    "carry": [],
    "chips": {
     "who": [
      "I",
      "We",
      "He",
      "She",
      "It",
      "They"
     ],
     "mid": [
      "am",
      "is",
      "are",
      "see",
      "like",
      "has",
      "ride",
      "read",
      "play",
      "sing"
     ],
     "end": [
      "here",
      "big",
      "happy",
      "a",
      "the",
      "my",
      "cat",
      "dog",
      "sea",
      "boat",
      "kite",
      "book"
     ]
    },
    "samples": [
     "We play here.",
     "I see the sea.",
     "She has a kite.",
     "I am happy."
    ],
    "rule": "틀이 없다 — 칩을 골라 문장을 만들고(말이 안 되면 칩이 통 튕긴다), 줄에 걸린 문장을 보며 손으로 쓴다(열두 자 안 · 첫 글자는 큰 글자, 끝에 점). 정답은 없다 — 내가 고른 문장이 졸업장의 문장이다",
    "gives": "졸업장에 내 문장과 내 이름이 내 글씨로. 사다리 칸 lv2-34 가 켜지고 섬의 모든 간판에 불이 들어온다 — 배다리가 내려온다."
   }
  }
 }
};
