// 케이모션 과학실 — 「공기를 빼면」 압력 계산 (순수: 화면·Three.js 를 모른다 → node 로 시험, 실험10 설계 2장)
// 모든 걸음 함수는 (상태, 입력, dt, 값) → 새 상태. 받은 상태를 고치지 않고, 숨은 전역이 없다.
// 숫자는 전부 exp.json 의 vac · items[].vac 에서 온다(게임 값). 실제 값에 닻을 둔 것은 끓는 압력표(30℃ → 0.04)뿐이다.
//
// 종 안 ch = { t, p, sealed, leak, valve, minP }
//   p      압력(1 = 바깥 공기, pMin = 펌프가 뺄 수 있는 끝)
//   sealed 받침판 위가 닫혔나(종이 덮였거나 낙하 통이 꽂혔다). 안 닫혔으면 p 는 늘 1
//   leak   고무 테로 새어 드는 빠르기(초당 p). 금 간 종이면 훨씬 빠르다
//   valve  공기 밸브가 열린 정도 0~1
// 물체 o = 종류(kind)마다 다르다: puff · sound · water · flame · suction · tube (makeObject 참고)
import { clamp, curve } from './thermal.js';

/** exp.json 에서 압력 계산에 쓰는 것만 뽑는다 */
export function vacuumModel(exp){
  const specs = {}; for (const it of exp.items) if (it.vac) specs[it.id] = it.vac;
  return { ...exp.vac, water: exp.water, specs };
}

// ════ 종 안 공기
export function makeChamber(V){ return { t: 0, p: 1, sealed: false, leak: V.leak, valve: 0, minP: 1 }; }

/** 닫기(종을 덮음 · 낙하 통을 꽂음): 그때부터 펌프가 듣는다. leak = 그 종의 새는 빠르기 */
export function seal(ch, leak){ return { ...ch, sealed: true, leak, p: 1, minP: 1 }; }
/** 열기(종을 듦): 공기가 바로 찬다 */
export function unseal(ch){ return { ...ch, sealed: false, p: 1, minP: 1 }; }

/** 펌프질 한 번. strength 0~1 = 손잡이를 얼마나 끝까지 내렸나(끝까지 = stroke 만큼 뺀다).
 *  안 닫혔거나 밸브가 열려 있으면 빠지지 않는다 → { ch, removed } */
export function pumpStroke(ch, strength, V){
  const s = clamp(+strength || 0, 0, 1);
  if (!ch.sealed || ch.valve > V.valveShut) return { ch, removed: 0 };
  const p = Math.max(V.pMin, ch.p * (1 - V.stroke * s));
  return { ch: { ...ch, p, minP: Math.min(ch.minP, p) }, removed: ch.p - p };
}

/** 밸브 돌리기. fast = 한 번에 확(손잡이를 홱). 확 열면 공기가 한꺼번에 들어온다 → { ch, rush }
 *  rush = 안의 것이 날아갈 만큼 세게 들어왔나(그때 압력이 whooshBelow 보다 낮았다) */
export function setValve(ch, open, fast, V){
  const v = clamp(+open || 0, 0, 1), next = { ...ch, valve: v };
  if (!ch.sealed || !fast || v < V.fastOpen) return { ch: next, rush: false };
  return { ch: { ...next, p: 1 }, rush: ch.p < V.whooshBelow };
}

/** 시간이 흐른다: 고무 테로 조금씩 새어 들고(직선), 밸브가 열렸으면 (1−p) 에 비례해 빠르게 찬다 */
export function stepChamber(ch, dt, V){
  const h = Math.max(0, +dt || 0); if (!ch.sealed) return { ...ch, t: ch.t + h, p: 1 };
  let p = ch.p;
  if (p < 1) p = Math.min(1, p + ch.leak * h);
  if (ch.valve > 0) p = 1 - (1 - p) * Math.exp(-V.valveRate * ch.valve * h);
  if (p > 1 - 1e-4) p = 1;
  return { ...ch, t: ch.t + h, p };
}

/** 공기를 뺀 종은 바깥 공기가 꾹 눌러 안 들린다 */
export const canLift = (p, V) => p >= V.liftAt;
/** 소리 크기 = p (자명종 소리가 실제로 그만큼 작아진다) */
export const soundLevel = p => clamp(p, 0, 1);
/** 물 온도 → 끓기 시작하는 압력(표) */
export const boilPressure = (T, W) => curve(W.boilTable, T);
/** 바늘 계기 칸: p 가 몇 번째 문턱 아래인가(0 = 바깥 공기) */
export function gaugeLevel(p, marks){ let i = 0; for (const m of marks) if (p < m) i++; return i; }

// ════ 물체
/** 부풂 = 1/p 를 물체마다 탄력(elastic)만큼, 한도(cap)까지 */
export const growth = (p, s) => Math.min(s.cap, 1 + s.elastic * (1 / Math.max(1e-6, p) - 1));

export function makeObject(spec, W){
  switch (spec.kind) {
    case 'puff': return { kind: 'puff', base: 1, minP: 1, g: 1, gMax: 1, size: 1, burst: false, full: false };
    case 'sound': return { kind: 'sound', ringing: true, level: 1 };
    case 'water': return { kind: 'water', T: W.T0, boiling: false, simmer: false, boilT0: null, boiled: 0, cooled: 0, minRatio: 99, empty: false };
    case 'flame': return { kind: 'flame', lit: true, flame: 1, outByAir: false };
    case 'suction': return { kind: 'suction', stuck: true };
    case 'tube': return { kind: 'tube', p: 1 };
    default: return { kind: spec.kind };
  }
}

/** 부푸는 것(마시멜로·풍선·거품·과자 봉지·스펀지).
 *  뺄 때: base × 부풂(p). 공기가 돌아올 때: 가장 많이 부푼 만큼 속 거품이 터져(shrink) 처음보다 작게 끝난다.
 *  shrink = 0 이면 원래대로(풍선). 공기가 다 돌아오면(airBackAt) 그 크기가 새 base 가 된다. */
export function stepPuff(o, p, s, V){
  const n = { ...o };
  if (n.burst) { n.g = 1; n.size = n.base * (s.burstSize || 1); return n; }
  if (s.burst != null && p < s.burst) { n.burst = true; n.g = 1; n.size = n.base * (s.burstSize || 1); return n; }
  n.minP = Math.min(n.minP, p);
  const gNow = growth(p, s), gMin = growth(n.minP, s), dmg = clamp((gMin - 1) / Math.max(1e-6, s.cap - 1), 0, 1);
  const keep = 1 - (s.shrink || 0) * dmg, ret = n.minP < V.airBackAt ? clamp((p - n.minP) / (V.airBackAt - n.minP), 0, 1) : 0;
  n.g = gNow; n.gMax = Math.max(n.gMax, gNow); n.full = gNow >= s.cap - 1e-9;
  n.size = n.base * gNow * (1 + (keep - 1) * ret);
  if (p >= V.airBackAt && n.minP < V.airBackAt) { n.base = n.base * keep; n.minP = 1; n.size = n.base * gNow; n.gMax = 1; }
  return n;
}

/** 물: p 가 끓는 압력 아래면 불 없이 끓는다. 끓는 동안 물이 열을 가져가 온도계가 내려간다.
 *  내려간 만큼 끓는 압력도 낮아지니, 계속 빼야 계속 끓는다. 멈춤에는 조금 틈(stopAt)이 있다. */
export function stepWater(o, p, dt, W){
  const n = { ...o }; if (n.empty) { n.boiling = false; n.simmer = false; return n; }
  const pb = boilPressure(n.T, W), h = Math.max(0, dt);
  n.minRatio = Math.min(n.minRatio, p / pb);
  if (!n.boiling && p <= pb) { n.boiling = true; if (n.boilT0 == null) n.boilT0 = n.T; }
  else if (n.boiling && p > pb * W.stopAt) n.boiling = false;
  n.simmer = !n.boiling && p <= pb * W.simmer;
  if (n.boiling) { const drive = clamp((pb - p) / pb, 0, 1); n.T = Math.max(W.Tmin, n.T - (W.cool + W.coolGain * drive) * h); n.boiled += h; n.cooled = n.boilT0 - n.T; }
  return n;
}
/** 물을 새로 담는다(선반에 두면 새 미지근한 물) */
export const freshWater = W => makeObject({ kind: 'water' }, W);

/** 촛불: 공기가 모자라면 작아지다 꺼진다(out 아래). 한 번 꺼지면 공기가 돌아와도 다시 안 켜진다. */
export function stepFlame(o, p, s){
  const n = { ...o }; if (!n.lit) { n.flame = 0; return n; }
  if (p < s.out) { n.lit = false; n.flame = 0; n.outByAir = true; return n; }
  n.flame = clamp((p - s.out) / (1 - s.out), 0, 1); return n;
}
/** 흡착판: 바깥 공기가 눌러 붙어 있던 것 → 누르는 힘이 drop 아래로 약해지면 툭 떨어진다(다시 안 붙는다) */
export function stepSuction(o, p, s){ return o.stuck && p < s.drop ? { ...o, stuck: false } : o; }
/** 자명종: 계속 울린다. 들리는 크기만 p */
export function stepSound(o, p){ return { ...o, level: o.ringing ? soundLevel(p) : 0 }; }

/** 물체 하나를 한 걸음 */
export function stepObject(o, p, dt, s, V){
  switch (o.kind) {
    case 'puff': return stepPuff(o, p, s, V);
    case 'sound': return stepSound(o, p);
    case 'water': return stepWater(o, p, dt, V.water);
    case 'flame': return stepFlame(o, p, s);
    case 'suction': return stepSuction(o, p, s);
    case 'tube': return { ...o, p };
    default: return o;
  }
}

/** 낙하 통 뒤집기: 공기가 있으면 깃털이 공기에 받쳐 늦게 온다. 다 빼면 같이 떨어진다.
 *  → { key: 'ballFirst' | 'featherLate' | 'together', tBall, tFeather } (초, 통 길이 기준 게임 값) */
export function tubeDrop(p, s){
  const tBall = s.tBall, tFeather = +(tBall * (1 + s.drag * clamp(p, 0, 1))).toFixed(3);
  const key = p < s.together ? 'together' : p < s.close ? 'featherLate' : 'ballFirst';
  return { key, tBall, tFeather: key === 'together' ? tBall : tFeather };
}
