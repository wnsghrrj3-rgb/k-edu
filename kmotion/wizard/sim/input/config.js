// WizardInput 문턱 — 02 문서 3·4절 값. 한 곳에서만 고친다(?dev=1 패널이 이 객체를 실시간으로 만짐)
// 단위: 길이 sw(어깨폭), 속도 sw/초, 시간 ms
export const INPUT = {
  visMin: 0.5,                 // 어깨 가시성
  swAlpha: 0.1, swBand: [0.6, 1.6],
  move:   { dead: 0.08, uMax: 1.6 },
  dodge:  { v: 3.2, vMin: 2.4, peakMul: 0.55, dist: 0.45, win: 200, exit: 1.2, cd: 1600 },
  duck:   { in: 0.30, out: 0.16, hold: 120 },
  // v1.2(합성 시험 반영): 「어깨→손목 거리가 늘어남(ext)」 조건은 2D 에서 늘어뜨린 팔을 앞으로 들면 거리가 오히려 줄어(원근 단축) 정면 내밀기를 놓침
  //   → 손목 상대 변위(150ms ≥ .6sw) + 아래로 떨어지는 움직임 아님 + 몸 가운데선 안 넘음 + 머리 구역 아님 으로 교체
  attack: { v: 4.0, vMin: 2.8, peakMul: 0.55, disp: 0.6, dispWin: 150, down: 0.3, mid: 0.15, head: 0.75, afterCast: 400, inward: 0.5, toHead: 0.9, raise2: 0.4, exit: 1.5,
            cdHand: 450, cdAll: 300, walkV: 1.8, walkMul: 1.3, corr: 0.8, hipFallback: 1.6,
            raiseHit: 0.5, raiseAbove: 0.35 },   // v2.1(준호 실기기 10-28 「손 들면 공격 아닌가」): 한 손을 빠르게 위로 치켜드는 것도 공격 — 머리 구역·머리 쪽 필터를 건너뜀(두 손 함께는 마법, 가운데로 모으면 막기)
  gather: { aboveNose: 0.10, noseFallback: 0.9, dist: 1.2, hold: 150, grace: 120, releaseWin: 300, autoCast: 3000, aimShift: 0.6 },
  block:  { cross: 0.15, yTop: -0.6, yBot: 1.2, hold: 200, rearm: 300 },
  select: { hold: 450, holdLow: 550, radiusMul: 1.15, lock: 600, lost: 900, stretchX: [0.08, 0.92], stretchY: [0.12, 0.95] },
  lost:   { body: 900 },
  swap:   { jump: 0.6, swLo: 0.75, swHi: 1.33, ignore: 500, pause: 3000 },
  drift:  { every: 15000, still: 0.3, pull: 0.1 },
};
// 조작 단계(D-11): 학년이 기본값
export const STAGE_BY_GRADE = g => g <= 2 ? 'A' : g <= 4 ? 'B' : 'C';
export const STAGE_ACTIONS = {
  A: { DODGE: false, BLOCK: false, autoAim: true },
  B: { DODGE: true,  BLOCK: false, autoAim: true },
  C: { DODGE: true,  BLOCK: true,  autoAim: false },
};
