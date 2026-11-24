/* 공통 엔진 · 캐릭터가 하고 싶은 일 — 「걷고 → 보고 → 뛰고」 같은 일의 차례를, 언제든 끊을 수 있게 돌린다.
 * 일은 async 함수다: async tok => { await b.walk(tok, x, z); await b.wait(tok, 0.5); … }
 * 새 일을 시작하면 하던 일은 그 자리에서 끊긴다(끊긴 일의 뒷부분은 돌지 않는다). 때는 놀이의 시계로 잰다(자동 확인에서도 같게 돈다). */
import { clamp } from './stage.js';

export const CANCEL = Symbol('cancel');
/** actor = createActor 가 준 것. o = { bounds:{ X, Z0, Z1 }(다닐 수 있는 범위), poses:[끊길 때 끄는 덧자세…], onEnd(), onLand(높이에서 내려앉을 때) } */
export function createBrain(actor, o = {}) {
  const timers = [], conds = [], errors = [], bd = o.bounds || { X: 99, Z0: -99, Z1: 99 }, poses = o.poses || ['hands', 'fluster', 'poke', 'sway', 'lean', 'reach'];
  const B = { tok: null, where: 'ground', hop: null, idle: 0 }, s = actor.state;
  const calm = () => { for (const k of poses) actor.pose(k, 0); };
  function stop() { if (B.tok) { B.tok.dead = true; B.tok.wake.splice(0).forEach(f => f()); B.tok = null; } calm(); s.busy = false; }
  /** 일 하나를 시작한다(하던 일은 그만둔다). */
  function run(fn) {
    stop(); const tok = { dead: false, wake: [] }; B.tok = tok; s.busy = true; B.idle = 0;
    Promise.resolve().then(() => fn(tok)).catch(e => { if (e !== CANCEL) { console.error(e); errors.push(String(e && e.stack || e)); } })
      .finally(() => { if (B.tok === tok) { B.tok = null; s.busy = false; calm(); B.idle = 0; if (o.onEnd) o.onEnd(); } });
  }
  const alive = tok => { if (tok.dead) throw CANCEL; };
  const wait = (tok, sec) => new Promise(res => { timers.push({ t: sec, res }); tok.wake.push(res); }).then(() => alive(tok));
  const until = (tok, cond, max = 9) => new Promise(res => { conds.push({ cond, t: max, res }); tok.wake.push(res); }).then(() => alive(tok));
  const walk = async (tok, x, z) => { actor.goTo(clamp(x, -bd.X, bd.X), clamp(z, bd.Z0, bd.Z1)); await until(tok, () => !s.target, 10); };
  const face = async (tok, a) => { s.faceTo = a; await until(tok, () => s.faceTo === null, 2.5); };
  /** 폴짝 뛰어 옮겨 간다. where = 내려앉을 곳의 이름(놀이가 정한다 — 'ground' · 'cup' …). 뛰는 동안은 장면마다 자리를 옮긴다. */
  function hop(x, z, y, where = 'ground', dur = 0.55) {
    s.act = null; s.target = null; s.faceTo = Math.atan2(x - s.pos.x, z - s.pos.z) || 0; actor.act('jump');
    B.hop = { x0: s.pos.x, z0: s.pos.z, y0: s.y, x, z, y, t: -0.2, dur, where, apex: 0.45 * Math.max(s.size, 0.6) + Math.max(0, y - s.y) * 0.5 }; B.where = 'air';
  }
  /** 매 장면(캐릭터 update 앞에). */
  function tick(dt) {
    for (let i = timers.length - 1; i >= 0; i--) if ((timers[i].t -= dt) <= 0) timers.splice(i, 1)[0].res();
    for (let i = conds.length - 1; i >= 0; i--) { const c = conds[i]; if ((c.t -= dt) <= 0 || c.cond()) { conds.splice(i, 1); c.res(); } }
    if (B.hop) { const h = B.hop; h.t += dt; const k = clamp(h.t / h.dur, 0, 1); s.pos.x = h.x0 + (h.x - h.x0) * k; s.pos.z = h.z0 + (h.z - h.z0) * k; s.y = h.y0 + (h.y - h.y0) * k + h.apex * 4 * k * (1 - k);
      if (k >= 1) { B.where = h.where; B.hop = null; s.y = h.y; s.faceTo = 0; if (o.onLand) o.onLand(h); } }      // 내려앉으면 아이 쪽을 본다
  }
  return { B, run, stop, wait, until, walk, face, hop, tick, calm, errors, get busy() { return !!B.tok; } };
}
