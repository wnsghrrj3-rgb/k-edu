/* ============================================================
 * 영어 놀이터 — 소리 숲 재료 (Lv1 파닉스 8칸) : 칸별 소리·단어·알파벳 묶음
 * ※ 자동 생성 — 손으로 고치지 않는다. 생성기: handoff/scripts/gen_en_play_lv1.js
 *   원천: v3 펼침 kedu/english/v3/lv1/NN_*.md (제목 괄호 = 본재료 · 「처음 보는 …」 = 응용 · 연습·대조 줄) · v3 사다리(칸 이름)
 *   Lv1 은 「글자 하나 = 소리 하나」 — 글자 둘 한 소리·자음 묶음은 아직 없다(known·knownBlends 빈칸).
 *   units = 그 칸에서 익히는 소리(낱글자) · bundles = 알파벳 칸을 날마다 한 묶음씩(모음 다섯 먼저 → 자음 한 바퀴)
 *   단어: role = main·apply(처음 보는 단어)·practice·contrast(대조 — 씨앗 대상 아님) · t = 소리 조각(글자마다)
 * ============================================================ */
window.PLAY_PHONICS_LV1 = {
 "source": "kedu/english/v3/lv1/*.md",
 "stage": "sound-forest",
 "cells": [
  {
   "id": "lv1-03",
   "n": 3,
   "kind": "letters",
   "label": "a b c",
   "name": "알파벳 A~Z 소리",
   "units": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [],
   "bundles": [
    ["a", "e", "i", "o", "u"],
    ["b", "c", "d", "f", "g"],
    ["h", "j", "k", "l", "m"],
    ["n", "p", "q", "r", "s"],
    ["t", "v", "w", "x", "y", "z"]
   ]
  },
  {
   "id": "lv1-04",
   "n": 4,
   "kind": "cvc",
   "label": "a",
   "name": "a 단어 읽기 (cat)",
   "units": ["a"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [
    { "w": "cat", "role": "main", "t": ["c", "a", "t"] },
    { "w": "mat", "role": "main", "t": ["m", "a", "t"] },
    { "w": "sat", "role": "main", "t": ["s", "a", "t"] },
    { "w": "man", "role": "main", "t": ["m", "a", "n"] },
    { "w": "nap", "role": "main", "t": ["n", "a", "p"] },
    { "w": "bat", "role": "apply", "t": ["b", "a", "t"] },
    { "w": "tap", "role": "apply", "t": ["t", "a", "p"] },
    { "w": "rag", "role": "apply", "t": ["r", "a", "g"] }
   ]
  },
  {
   "id": "lv1-06",
   "n": 6,
   "kind": "cvc",
   "label": "i",
   "name": "i 단어 읽기 (pig)",
   "units": ["i"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [
    { "w": "pig", "role": "main", "t": ["p", "i", "g"] },
    { "w": "sit", "role": "main", "t": ["s", "i", "t"] },
    { "w": "big", "role": "main", "t": ["b", "i", "g"] },
    { "w": "pin", "role": "main", "t": ["p", "i", "n"] },
    { "w": "tip", "role": "main", "t": ["t", "i", "p"] },
    { "w": "rip", "role": "apply", "t": ["r", "i", "p"] },
    { "w": "fin", "role": "apply", "t": ["f", "i", "n"] },
    { "w": "dim", "role": "apply", "t": ["d", "i", "m"] },
    { "w": "hit", "role": "apply", "t": ["h", "i", "t"] }
   ]
  },
  {
   "id": "lv1-07",
   "n": 7,
   "kind": "cvc",
   "label": "o",
   "name": "o 단어 읽기 (dog)",
   "units": ["o"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [
    { "w": "dog", "role": "main", "t": ["d", "o", "g"] },
    { "w": "hot", "role": "main", "t": ["h", "o", "t"] },
    { "w": "box", "role": "main", "t": ["b", "o", "x"] },
    { "w": "top", "role": "main", "t": ["t", "o", "p"] },
    { "w": "pot", "role": "main", "t": ["p", "o", "t"] },
    { "w": "cot", "role": "apply", "t": ["c", "o", "t"] },
    { "w": "mop", "role": "apply", "t": ["m", "o", "p"] },
    { "w": "rod", "role": "apply", "t": ["r", "o", "d"] },
    { "w": "job", "role": "apply", "t": ["j", "o", "b"] }
   ]
  },
  {
   "id": "lv1-11",
   "n": 11,
   "kind": "cvc",
   "label": "e",
   "name": "e 단어 읽기 (pen)",
   "units": ["e"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [
    { "w": "pen", "role": "main", "t": ["p", "e", "n"] },
    { "w": "bed", "role": "main", "t": ["b", "e", "d"] },
    { "w": "ten", "role": "main", "t": ["t", "e", "n"] },
    { "w": "red", "role": "main", "t": ["r", "e", "d"] },
    { "w": "net", "role": "main", "t": ["n", "e", "t"] },
    { "w": "leg", "role": "apply", "t": ["l", "e", "g"] },
    { "w": "web", "role": "apply", "t": ["w", "e", "b"] },
    { "w": "jet", "role": "apply", "t": ["j", "e", "t"] },
    { "w": "hen", "role": "apply", "t": ["h", "e", "n"] }
   ]
  },
  {
   "id": "lv1-12",
   "n": 12,
   "kind": "cvc",
   "label": "u",
   "name": "u 단어 읽기 (sun)",
   "units": ["u"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [
    { "w": "bus", "role": "main", "t": ["b", "u", "s"] },
    { "w": "sun", "role": "main", "t": ["s", "u", "n"] },
    { "w": "cup", "role": "main", "t": ["c", "u", "p"] },
    { "w": "run", "role": "main", "t": ["r", "u", "n"] },
    { "w": "mud", "role": "main", "t": ["m", "u", "d"] },
    { "w": "hug", "role": "apply", "t": ["h", "u", "g"] },
    { "w": "nut", "role": "apply", "t": ["n", "u", "t"] },
    { "w": "gum", "role": "apply", "t": ["g", "u", "m"] },
    { "w": "rug", "role": "apply", "t": ["r", "u", "g"] }
   ]
  },
  {
   "id": "lv1-14",
   "n": 14,
   "kind": "cvc",
   "label": "j w z",
   "name": "여러 자음으로 단어 읽기",
   "units": ["b", "d", "g", "h", "j", "k", "l", "r", "f", "v", "w", "y", "z"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [
    { "w": "jam", "role": "main", "t": ["j", "a", "m"] },
    { "w": "wet", "role": "main", "t": ["w", "e", "t"] },
    { "w": "zip", "role": "main", "t": ["z", "i", "p"] }
   ]
  },
  {
   "id": "lv1-16",
   "n": 16,
   "kind": "mix",
   "label": "a e i o u",
   "name": "여러 단어 섞어 읽기",
   "units": ["a", "e", "i", "o", "u"],
   "blends": [],
   "review": false,
   "known": [],
   "knownBlends": [],
   "words": [
    { "w": "pet", "role": "main", "t": ["p", "e", "t"] },
    { "w": "dig", "role": "main", "t": ["d", "i", "g"] },
    { "w": "log", "role": "main", "t": ["l", "o", "g"] },
    { "w": "sun", "role": "main", "t": ["s", "u", "n"] },
    { "w": "map", "role": "main", "t": ["m", "a", "p"] },
    { "w": "cap", "role": "practice", "t": ["c", "a", "p"] },
    { "w": "cup", "role": "practice", "t": ["c", "u", "p"] },
    { "w": "cop", "role": "practice", "t": ["c", "o", "p"] },
    { "w": "bed", "role": "contrast", "t": ["b", "e", "d"] },
    { "w": "bid", "role": "contrast", "t": ["b", "i", "d"] },
    { "w": "hot", "role": "contrast", "t": ["h", "o", "t"] },
    { "w": "hut", "role": "contrast", "t": ["h", "u", "t"] },
    { "w": "vet", "role": "apply", "t": ["v", "e", "t"] },
    { "w": "rib", "role": "apply", "t": ["r", "i", "b"] },
    { "w": "cob", "role": "apply", "t": ["c", "o", "b"] },
    { "w": "gum", "role": "apply", "t": ["g", "u", "m"] },
    { "w": "tan", "role": "apply", "t": ["t", "a", "n"] }
   ]
  }
 ]
};
