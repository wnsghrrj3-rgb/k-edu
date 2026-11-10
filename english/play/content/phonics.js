/* ============================================================
 * 영어 놀이터 — 소리 공방 재료 (Lv2 파닉스 12칸) : 칸별 소리·배운 범위·단어
 * ★ 자동 생성 — 손으로 고치지 않는다. 생성기: handoff/scripts/gen_en_play_phonics.js
 *   원천: 재료 대장 kedu/english/v3/lv2/_LV2_WORDBANK.md (단어·역할) · v3 사다리(칸 이름) · v3 차시(그림·뜻)
 *   칸마다 units = 새로 배운 「글자 둘, 소리 하나」 · blends = 새로 배운 자음 묶음(두 소리 잇기)
 *          known·knownBlends = 그 칸까지 배운 것 전부(Lv1 의 낱글자 26 은 늘 아는 것)
 *   단어: role = main(본재료)·apply(응용)·practice(연습)·contrast(대조 — 앞 칸·Lv1 단어, 씨앗 대상 아님)
 *         t = 소리 조각 · s = 소리가 글자와 다를 때의 소리 열쇠(this 의 th = dh) · build:false = 조각 조립 놀이에 쓰지 않음(안 배운 자음 묶음 등)
 * ============================================================ */
window.PLAY_PHONICS = {
 "source": "_LV2_WORDBANK.md",
 "letters": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
 "cells": [
  {
   "id": "lv2-01",
   "n": 1,
   "kind": "digraph",
   "label": "sh·ch",
   "name": "sh·ch 소리 읽기",
   "units": ["sh", "ch"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch"],
   "knownBlends": [],
   "words": [
    { "w": "ship", "role": "main", "t": ["sh", "i", "p"] },
    { "w": "shop", "role": "main", "t": ["sh", "o", "p"], "pic": "🏪", "ko": "가게" },
    { "w": "fish", "role": "main", "t": ["f", "i", "sh"], "pic": "🐟", "ko": "물고기" },
    { "w": "chat", "role": "main", "t": ["ch", "a", "t"] },
    { "w": "chin", "role": "main", "t": ["ch", "i", "n"] },
    { "w": "lunch", "role": "main", "t": ["l", "u", "n", "ch"], "pic": "🍱", "ko": "점심" },
    { "w": "cash", "role": "apply", "t": ["c", "a", "sh"] },
    { "w": "chop", "role": "apply", "t": ["ch", "o", "p"], "pic": "🔪", "ko": "썰다" },
    { "w": "cat", "role": "contrast", "t": ["c", "a", "t"], "pic": "🐱", "ko": "고양이" },
    { "w": "sip", "role": "contrast", "t": ["s", "i", "p"] }
   ]
  },
  {
   "id": "lv2-03",
   "n": 3,
   "kind": "digraph",
   "label": "th·ck",
   "name": "th·ck 소리 읽기",
   "units": ["th", "ck"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch", "th", "ck"],
   "knownBlends": [],
   "words": [
    { "w": "this", "role": "main", "t": ["th", "i", "s"], "s": ["dh", "i", "s"], "pic": "👇", "ko": "이것" },
    { "w": "that", "role": "main", "t": ["th", "a", "t"], "s": ["dh", "a", "t"] },
    { "w": "bath", "role": "main", "t": ["b", "a", "th"] },
    { "w": "duck", "role": "main", "t": ["d", "u", "ck"] },
    { "w": "kick", "role": "main", "t": ["k", "i", "ck"] },
    { "w": "sock", "role": "main", "t": ["s", "o", "ck"] },
    { "w": "thin", "role": "apply", "t": ["th", "i", "n"] },
    { "w": "rock", "role": "apply", "t": ["r", "o", "ck"], "ko": "바위" }
   ]
  },
  {
   "id": "lv2-05",
   "n": 5,
   "kind": "blend",
   "label": "st·sp·sn·sw",
   "name": "st·sp·sn·sw 소리 읽기",
   "units": [],
   "blends": ["st", "sp", "sn", "sw"],
   "review": false,
   "known": ["sh", "ch", "th", "ck"],
   "knownBlends": ["st", "sp", "sn", "sw"],
   "words": [
    { "w": "stop", "role": "main", "t": ["s", "t", "o", "p"], "ko": "멈추다" },
    { "w": "spin", "role": "main", "t": ["s", "p", "i", "n"], "ko": "빙글 돌다" },
    { "w": "snap", "role": "main", "t": ["s", "n", "a", "p"], "ko": "딱 튕기다" },
    { "w": "swim", "role": "main", "t": ["s", "w", "i", "m"], "ko": "헤엄치다" },
    { "w": "step", "role": "apply", "t": ["s", "t", "e", "p"] },
    { "w": "spot", "role": "apply", "t": ["s", "p", "o", "t"] },
    { "w": "top", "role": "contrast", "t": ["t", "o", "p"] },
    { "w": "nap", "role": "contrast", "t": ["n", "a", "p"] }
   ]
  },
  {
   "id": "lv2-06",
   "n": 6,
   "kind": "blend",
   "label": "bl·cl·fl·gr·fr·dr",
   "name": "bl·cl·fl·gr·fr·dr 소리 읽기",
   "units": [],
   "blends": ["bl", "cl", "fl", "gr", "fr", "dr"],
   "review": false,
   "known": ["sh", "ch", "th", "ck"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr"],
   "words": [
    { "w": "black", "role": "main", "t": ["b", "l", "a", "ck"] },
    { "w": "clap", "role": "main", "t": ["c", "l", "a", "p"], "ko": "박수 치다" },
    { "w": "flag", "role": "main", "t": ["f", "l", "a", "g"] },
    { "w": "grab", "role": "main", "t": ["g", "r", "a", "b"], "ko": "붙잡다" },
    { "w": "frog", "role": "main", "t": ["f", "r", "o", "g"] },
    { "w": "drop", "role": "main", "t": ["d", "r", "o", "p"], "ko": "떨어뜨리다" },
    { "w": "flat", "role": "apply", "t": ["f", "l", "a", "t"] },
    { "w": "grin", "role": "apply", "t": ["g", "r", "i", "n"] },
    { "w": "cap", "role": "contrast", "t": ["c", "a", "p"] },
    { "w": "fog", "role": "contrast", "t": ["f", "o", "g"] }
   ]
  },
  {
   "id": "lv2-08",
   "n": 8,
   "kind": "blend",
   "label": "nd·nt·st·mp·nk",
   "name": "끝소리 묶어 읽기",
   "units": [],
   "blends": ["nd", "nt", "st", "mp", "nk"],
   "review": false,
   "known": ["sh", "ch", "th", "ck"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "hand", "role": "main", "t": ["h", "a", "n", "d"], "ko": "손" },
    { "w": "tent", "role": "main", "t": ["t", "e", "n", "t"] },
    { "w": "best", "role": "main", "t": ["b", "e", "s", "t"] },
    { "w": "pink", "role": "main", "t": ["p", "i", "n", "k"] },
    { "w": "sand", "role": "apply", "t": ["s", "a", "n", "d"], "ko": "모래" },
    { "w": "nest", "role": "apply", "t": ["n", "e", "s", "t"] },
    { "w": "pin", "role": "contrast", "t": ["p", "i", "n"] },
    { "w": "ten", "role": "contrast", "t": ["t", "e", "n"], "pic": "🔟", "ko": "열" },
    { "w": "bet", "role": "contrast", "t": ["b", "e", "t"] },
    { "w": "jump", "role": "main", "t": ["j", "u", "m", "p"], "ko": "뛰어오르다" }
   ]
  },
  {
   "id": "lv2-11",
   "n": 11,
   "kind": "magic",
   "label": "a_e",
   "name": "매직 e — a_e 읽기",
   "units": ["a_e"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch", "th", "ck", "a_e"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "cake", "role": "main", "t": ["c", "a_e", "k"], "pic": "🎂", "ko": "케이크" },
    { "w": "name", "role": "main", "t": ["n", "a_e", "m"], "pic": "📛", "ko": "이름" },
    { "w": "game", "role": "main", "t": ["g", "a_e", "m"], "pic": "🎮", "ko": "게임" },
    { "w": "late", "role": "main", "t": ["l", "a_e", "t"], "pic": "⏰", "ko": "늦은" },
    { "w": "face", "role": "apply", "t": ["f", "a_e", "c"], "build": false, "ko": "얼굴" },
    { "w": "gate", "role": "apply", "t": ["g", "a_e", "t"] },
    { "w": "cape", "role": "practice", "t": ["c", "a_e", "p"] },
    { "w": "tape", "role": "practice", "t": ["t", "a_e", "p"] },
    { "w": "mate", "role": "practice", "t": ["m", "a_e", "t"] }
   ]
  },
  {
   "id": "lv2-13",
   "n": 13,
   "kind": "magic",
   "label": "i_e",
   "name": "매직 e — i_e 읽기",
   "units": ["i_e"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch", "th", "ck", "a_e", "i_e"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "bike", "role": "main", "t": ["b", "i_e", "k"], "pic": "🚲", "ko": "자전거" },
    { "w": "five", "role": "main", "t": ["f", "i_e", "v"], "pic": "5️⃣", "ko": "다섯" },
    { "w": "time", "role": "main", "t": ["t", "i_e", "m"], "pic": "⏳", "ko": "시간" },
    { "w": "smile", "role": "main", "t": ["s", "m", "i_e", "l"], "build": false, "ko": "미소" },
    { "w": "nine", "role": "apply", "t": ["n", "i_e", "n"], "pic": "9️⃣", "ko": "아홉" },
    { "w": "ride", "role": "apply", "t": ["r", "i_e", "d"], "ko": "타다" },
    { "w": "kite", "role": "practice", "t": ["k", "i_e", "t"] },
    { "w": "bite", "role": "practice", "t": ["b", "i_e", "t"] },
    { "w": "pine", "role": "practice", "t": ["p", "i_e", "n"] }
   ]
  },
  {
   "id": "lv2-14",
   "n": 14,
   "kind": "magic",
   "label": "o_e·u_e",
   "name": "매직 e — o_e·u_e 읽기",
   "units": ["o_e", "u_e"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch", "th", "ck", "a_e", "i_e", "o_e", "u_e"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "home", "role": "main", "t": ["h", "o_e", "m"], "pic": "🏠", "ko": "집" },
    { "w": "nose", "role": "main", "t": ["n", "o_e", "s"], "ko": "코" },
    { "w": "bone", "role": "main", "t": ["b", "o_e", "n"], "ko": "뼈" },
    { "w": "cute", "role": "main", "t": ["c", "u_e", "t"] },
    { "w": "rose", "role": "apply", "t": ["r", "o_e", "s"] },
    { "w": "rope", "role": "apply", "t": ["r", "o_e", "p"] },
    { "w": "hope", "role": "practice", "t": ["h", "o_e", "p"] },
    { "w": "note", "role": "practice", "t": ["n", "o_e", "t"] }
   ]
  },
  {
   "id": "lv2-16",
   "n": 16,
   "kind": "magic",
   "label": "a_e·i_e·o_e·u_e",
   "name": "매직 e 섞어 읽기",
   "units": [],
   "blends": [],
   "review": true,
   "known": ["sh", "ch", "th", "ck", "a_e", "i_e", "o_e", "u_e"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "cape", "role": "main", "t": ["c", "a_e", "p"] },
    { "w": "cap", "role": "contrast", "t": ["c", "a", "p"] },
    { "w": "kite", "role": "main", "t": ["k", "i_e", "t"] },
    { "w": "kit", "role": "contrast", "t": ["k", "i", "t"] },
    { "w": "hope", "role": "main", "t": ["h", "o_e", "p"] },
    { "w": "hop", "role": "contrast", "t": ["h", "o", "p"] },
    { "w": "cute", "role": "main", "t": ["c", "u_e", "t"] },
    { "w": "cut", "role": "contrast", "t": ["c", "u", "t"] },
    { "w": "mate", "role": "main", "t": ["m", "a_e", "t"] },
    { "w": "mat", "role": "contrast", "t": ["m", "a", "t"] },
    { "w": "tape", "role": "main", "t": ["t", "a_e", "p"] },
    { "w": "tap", "role": "contrast", "t": ["t", "a", "p"] },
    { "w": "pine", "role": "main", "t": ["p", "i_e", "n"] },
    { "w": "pin", "role": "contrast", "t": ["p", "i", "n"] },
    { "w": "note", "role": "main", "t": ["n", "o_e", "t"] },
    { "w": "not", "role": "contrast", "t": ["n", "o", "t"] }
   ]
  },
  {
   "id": "lv2-19",
   "n": 19,
   "kind": "team",
   "label": "ai·ay",
   "name": "모음 ai·ay 읽기",
   "units": ["ai", "ay"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch", "th", "ck", "a_e", "i_e", "o_e", "u_e", "ai", "ay"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "rain", "role": "main", "t": ["r", "ai", "n"], "pic": "🌧️", "ko": "비" },
    { "w": "wait", "role": "main", "t": ["w", "ai", "t"], "pic": "🚏", "ko": "기다리다" },
    { "w": "day", "role": "main", "t": ["d", "ay"], "pic": "📅", "ko": "하루" },
    { "w": "play", "role": "main", "t": ["p", "l", "ay"], "build": false, "pic": "🛝", "ko": "놀다" },
    { "w": "mail", "role": "apply", "t": ["m", "ai", "l"] },
    { "w": "say", "role": "apply", "t": ["s", "ay"] }
   ]
  },
  {
   "id": "lv2-21",
   "n": 21,
   "kind": "team",
   "label": "ee·ea",
   "name": "모음 ee·ea 읽기",
   "units": ["ee", "ea"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch", "th", "ck", "a_e", "i_e", "o_e", "u_e", "ai", "ay", "ee", "ea"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "tree", "role": "main", "t": ["t", "r", "ee"], "build": false, "pic": "🌳", "ko": "나무" },
    { "w": "green", "role": "main", "t": ["g", "r", "ee", "n"], "pic": "🟢", "ko": "초록색" },
    { "w": "eat", "role": "main", "t": ["ea", "t"] },
    { "w": "read", "role": "main", "t": ["r", "ea", "d"], "pic": "📖", "ko": "읽다" },
    { "w": "sea", "role": "apply", "t": ["s", "ea"], "ko": "바다" },
    { "w": "seat", "role": "apply", "t": ["s", "ea", "t"] },
    { "w": "see", "role": "main", "t": ["s", "ee"], "pic": "👀", "ko": "보다" },
    { "w": "feet", "role": "main", "t": ["f", "ee", "t"], "ko": "발" }
   ]
  },
  {
   "id": "lv2-23",
   "n": 23,
   "kind": "team",
   "label": "oa·ow",
   "name": "모음 oa·ow 읽기",
   "units": ["oa", "ow"],
   "blends": [],
   "review": false,
   "known": ["sh", "ch", "th", "ck", "a_e", "i_e", "o_e", "u_e", "ai", "ay", "ee", "ea", "oa", "ow"],
   "knownBlends": ["st", "sp", "sn", "sw", "bl", "cl", "fl", "gr", "fr", "dr", "nd", "nt", "mp", "nk"],
   "words": [
    { "w": "boat", "role": "main", "t": ["b", "oa", "t"], "pic": "⛵", "ko": "배" },
    { "w": "road", "role": "main", "t": ["r", "oa", "d"], "ko": "길" },
    { "w": "goat", "role": "main", "t": ["g", "oa", "t"], "pic": "🐐", "ko": "염소" },
    { "w": "snow", "role": "main", "t": ["s", "n", "ow"], "pic": "❄️", "ko": "눈" },
    { "w": "grow", "role": "main", "t": ["g", "r", "ow"] },
    { "w": "coat", "role": "apply", "t": ["c", "oa", "t"], "pic": "🧥", "ko": "외투" },
    { "w": "show", "role": "apply", "t": ["sh", "ow"] }
   ]
  }
 ]
};
