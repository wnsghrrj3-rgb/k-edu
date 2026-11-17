/* 항구 장터 섞기 규칙(N05) — 화면 없는 부분(하네스가 그대로 불러 3000회 돌린다). 가게 규칙은 ../shop/rules.js 그대로, 여기는 3D 장터에서만 켜지는 사건 표.
 * 처음에는 받은 손님 수에 따라 정해진 차례로 하나씩 처음 보여 준다(굴러가는 물건 → 깜짝 손님 → 장날). 그 뒤에는 섞는다.
 * 놓쳐도(손님이 그냥 가도) 받은 손님 수는 그대로 — 어려워지지 않는다. */

// ── 내가 정한 수치(준호가 해 보고 바꾼다)
export const N5 = {
  LINE: 3,                      // 줄 끝의 셈: 손님 셋마다
  FIRST: { roll: 3, surprise: 6, fair: 10 },   // 처음 보이는 때(받은 손님 수)
  SURPRISE_P: .15,              // 그 뒤 깜짝 손님(보통 손님만)
  FAIR_EVERY: 7, FAIR_N: 5, FAIR_CAP: 2, FAIR_GAP: .5,   // 장날: 손님 일곱마다 · 다섯 명 동안 · 줄 +2 · 다음 손님 간격 ×0.5
  STREAK_GAP: .1, STREAK_MAX: 4, STREAK_BONUS_AT: 3,     // 불꽃: 하나마다 다음 손님 10% 빨리(넷까지) · 셋부터 덤 동전 1
  BONUS: 3,                     // 깜짝 손님 덤 동전
  ROLL: [40, 70],               // 굴러가는 물건: 처음 본 뒤 몇 초마다
  DRUM: .3,                     // 손님 기다림이 이만큼 남으면 북소리(생각할 시간이 다 돼 감)
};

/** 장터 걸음 칸(가게 저장 안 n5): { served(받은 손님), arrivals(온 손님), seen:{ roll, surprise, fair }, lastFair } */
export function fresh(){ return { served: 0, arrivals: 0, seen: {}, lastFair: 0 }; }
export function mend(n5){ const f = fresh(); if (!n5 || typeof n5 !== 'object') return f; n5.served = Math.max(0, n5.served | 0); n5.arrivals = Math.max(0, n5.arrivals | 0); n5.lastFair = n5.lastFair | 0; n5.seen = n5.seen && typeof n5.seen === 'object' ? n5.seen : {}; return n5; }

/** 손님 하나가 온다 → { surprise, fair }. 한 손님에 새것은 하나만. n5 를 바꾼다(arrivals·seen·lastFair). */
export function arrival(n5, kind, rnd = Math.random){ n5.arrivals++; const F = N5.FIRST, s = n5.served, seen = n5.seen, out = { surprise: false, fair: false };
  if (kind === 'plain') { if (!seen.surprise && seen.roll && s >= F.surprise) { out.surprise = true; seen.surprise = true; return out; } if (seen.surprise && rnd() < N5.SURPRISE_P) out.surprise = true; }
  if (!seen.fair && seen.surprise && !out.surprise && s >= F.fair) { out.fair = true; seen.fair = true; n5.lastFair = n5.arrivals; return out; }
  if (seen.fair && !out.surprise && n5.arrivals - n5.lastFair >= N5.FAIR_EVERY) { out.fair = true; n5.lastFair = n5.arrivals; }   /* 깜짝 손님과 겹치면 장날은 다음 손님으로 */
  return out; }
/** 굴러가는 물건이 처음 나올 때인가. */
export const rollDue = n5 => !n5.seen.roll && n5.served >= N5.FIRST.roll;
/** 다음 굴러가는 물건까지(초). */
export const rollGap = (rnd = Math.random) => N5.ROLL[0] + rnd() * (N5.ROLL[1] - N5.ROLL[0]);
/** 다음 손님까지의 간격 배수: 장날이면 ×0.5 · 불꽃 하나마다 10% 빨리. */
export const gapMul = (fair, streak) => (fair > 0 ? N5.FAIR_GAP : 1) * (1 - N5.STREAK_GAP * Math.min(streak, N5.STREAK_MAX));
