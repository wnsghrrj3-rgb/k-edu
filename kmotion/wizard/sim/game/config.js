// 전투·이동·문제 수치 한 곳(03·04·07 문서). ?dev=1 패널이 이 객체를 실시간으로 만짐
export const GAME = {
  tick: 1 / 60,
  player: { hp: 100, mana: 30, manaMax: 100, atk: 10, def: 5, crit: .1, critMul: 1.5,
            xMax: 4.0, arcK: 0.03, vMax: 6.5, accel: 30, nearR: 0.2, hurtR: 0.30,
            dodge: { dist: 2.2, dur: .25, invuln: .35, cd: 1.6 }, chargeMul: .5, blockMul: .3, blockDmg: .4,
            staffTip: [0.25, 1.15, 0.35], hurtLock: .35 },
  grade: { // 04 문서 4절
    low:  { windup: 1.4, dmg: .7, speed: .8, maxEnemies: 4, tokens: 1, gaugeGrade: 1.6, readMs: 1800, holdMs: 550, regen: 5, gaugeHitMul: .5, feather: true },
    mid:  { windup: 1.2, dmg: .85, speed: .9, maxEnemies: 6, tokens: 2, gaugeGrade: 1.3, readMs: 1200, holdMs: 450, regen: 0, gaugeHitMul: 1, feather: false },
    high: { windup: 1.0, dmg: 1.0, speed: 1.0, maxEnemies: 8, tokens: 3, gaugeGrade: 1.0, readMs: 1200, holdMs: 450, regen: 0, gaugeHitMul: 1, feather: false },
  },
  gradeBand: g => g <= 2 ? 'low' : g <= 4 ? 'mid' : 'high',
  enemy: { spawnT: .6, recover: 1.0, backoff: .8, tokenReturn: .5, sep: .9, stagger: { bolt: .15, spell: .4, tick: .05 }, dieT: .6, fanDeg: 45, bounds: { x: 5.2, zMin: 0.5, zMax: 16 } },
  crystal: { firstAt: 2, every: 28, lowManaAfter: 12, max: 2, reach: 1.5, sideMin: 2.5, sideMax: 3.5, z: 1.2, y: 1.2, approachAfter: 25, approachV: .5 },   // v1.3: every 18→28 · 마나 부족 수정은 직전 문제 뒤 12초(문제 시간 비율 25~35% 맞추기)
  question: { slowTo: .15, slowIn: .2, slowOut: .25, gaugeBase: 12, gaugeByType: { calc1: 12, calc2: 16, pick: 10, word1: 24 },   // 07 문서 5절 유형별 기본 초
              hint: { autoLowS: 6, holdMs: 500 },   /* 07 문서 8절 — 1~2학년은 6초 손이 안 움직이면 부엉이가 먼저 · 힌트 구슬 유지 시간 */ gaugeSetting: { off: Infinity, slow: 1.5, normal: 1, fast: .65 },
              mana: { right: 25, hint1: 20, hint2: 15, wrong: 5, streak: [0, 0, 3, 6, 9, 12] }, rightShow: .9, wrongExplain: 2.0, revealShow: 1.0 },
  // 레벨(04 문서 2-1·11 문서 1절): 필요 경험치 60×L^1.35, 최대 30, 레벨당 HP +4·ATK +.5·DEF +.3 · 레벨 차이 ×3% 상한 ±25%
  level: { max: 30, need: L => Math.round(60 * Math.pow(L, 1.35)), hpPer: 4, atkPer: .5, defPer: .3, xpQ: 5, xpClear: 50, diffPct: .03, diffCap: .25 },
  // 강화 수정(07 문서 상황 B): 마나 100 뒤 3초 금빛 수정, 판당 3번, 15초 뒤 사라짐 · 성공 = 20초 마법 ×1.5 + 강력 공격(A08) · 실패 = 같은 개념 쉬운 문제 재도전 수정 1번
  //   문제 종류는 장착 주 마법의 「수학 연결」(05 문서 12항): 불 = 연산 속도형(게이지 ×.75) · 얼음 = 비교·크기형 · 번개 = 규칙형(1학년 생성기 없으면 계산형으로)
  empower: { delay: 3, perRun: 3, life: 15, t: 20, mul: 1.5, want: { fireball: 'calc', ice: 'compare', lightning: 'pattern' }, gaugeMul: { fireball: .75 } },
  // 적 투사체(계산 고블린 도토리): 날아오는 중(발사 뒤) 회피하거나 숙여서 피하면 「멋진 회피」 마나 +3
  acorn: { dodgeMana: 3 },
  shake: { hit: .05, hurt: .25, decay: 1.4, max: .7 },
  // 길 구간(09 문서 2절·07 문서 상황 D, v1.5): 자동 전진 = len/seconds(≈3.8 m/s) · 좌우 ±2.6 · 바위는 옆으로, 가지는 숙여서 · 맞으면 피해 + 1.2초 느려짐(판은 안 멈춤)
  //   퍼즐 자리에서 길이 멈춤(1초 감속) → S08P. 게이지 없음 · 3번 틀리면 정답 보여 주고 통과(보상 0) · 정답 = 마나 +20 + 골드 10~30 · 1~2학년은 장애물 간격 ×1.3
  rail: { xMax: 2.6, lane: 1.7, gap: 9, lowGapMul: 1.3, startD: 12, endD: 14, puzzleClear: 12, decel: 1.0, accel: 1.5, hitSlow: .35, hitRecover: 1.2, viewZ: 42, enemyZ: 14, engageZ: 6, goldCap: 200,
          rock: { r: .9, atk: 10 }, branch: { atk: 8, h: 1.25, win: .45 }, firefly: { r: .9, mana: 2 }, chest: { r: 1.0, mana: 15, goldMin: 10, goldMax: 30 }, nicePass: { r: .9, mana: 2 },
          puzzle: { rightShow: 1.6, wrongShow: 1.3, revealShow: 2.8, maxWrong: 3, laneX: 1.1, laneHold: .8, mana: 20 } },
  // 보스(06 문서 4·5절) — 1~2학년은 공격 주기 ×1.25 추가(5절 학년 배율 예)
  boss: { introT: 2.4, phaseT: 1.5, keep: 3.4, zMax: 12, dashT: .45, recover: .9, shieldMul: .1, weakMul: 1.5, weakT: 8, lowCycleMul: 1.25, sealCd: 1.2, heal: 20 },
};
