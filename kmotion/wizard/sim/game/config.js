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
  enemy: { spawnT: .6, recover: 1.0, backoff: .8, tokenReturn: .5, sep: .9, stagger: { bolt: .15, spell: .4 }, dieT: .6, fanDeg: 45, bounds: { x: 5.2, zMin: 0.5, zMax: 16 } },
  crystal: { firstAt: 2, every: 18, max: 2, reach: 1.5, sideMin: 2.5, sideMax: 3.5, z: 1.2, y: 1.2, approachAfter: 25, approachV: .5 },
  question: { slowTo: .15, slowIn: .2, slowOut: .25, gaugeBase: 12, gaugeSetting: { off: Infinity, slow: 1.5, normal: 1, fast: .65 },
              mana: { right: 25, hint1: 20, hint2: 15, wrong: 5, streak: [0, 0, 3, 6, 9, 12] }, rightShow: .9, wrongExplain: 2.0, revealShow: 1.0 },
  shake: { hit: .05, hurt: .25, decay: 1.4, max: .7 },
  // 보스(06 문서 4·5절) — 1~2학년은 공격 주기 ×1.25 추가(5절 학년 배율 예)
  boss: { introT: 2.4, phaseT: 1.5, keep: 3.4, zMax: 12, dashT: .45, recover: .9, shieldMul: .1, weakMul: 1.5, weakT: 8, lowCycleMul: 1.25, sealCd: 1.2, heal: 20 },
};
