// 케이모션 과학실 — 규칙 표 읽기 (순수: 화면을 모른다. 표·문구는 전부 exp.json — 설계 8-1 「실험 = 데이터 한 묶음」)
// (물체, 상태, 동작, 세기) → 결과. 여기에는 물체 이름이 하나도 적혀 있지 않다. 새 실험은 exp.json 만 바꾼다.
import { balloonVolume, kindOf, clamp } from './thermal.js';
export { kindOf };

export const itemOf = (exp, idOrKind) => exp.items.find(it => it.id === kindOf(idOrKind)) || null;
export function itemMap(exp){ const m = {}; for (const it of exp.items) m[it.id] = it; return m; }

/** 물체 하나하나의 이름: 여럿인 것은 banana_1..3, 하나인 것은 그대로 */
export function instanceIds(exp){
  const out = []; for (const it of exp.items) { if ((it.count || 1) > 1) for (let i = 1; i <= it.count; i++) out.push(`${it.id}_${i}`); else out.push(it.id); }
  return out;
}

/** 물체 상태: 온도 문턱표(또는 풍선의 부피표)로 정한다. 한 번 얼었다 녹은 것은 thawed 상태(있으면). */
export function stateOf(exp, kind, body){
  const it = itemOf(exp, kind), st = it && it.states; if (!st || !body) return null;
  if (st.byVolume) { const v = balloonVolume(body, it.thermal); for (const [max, name] of st.byVolume) if (v <= max) return name; return st.byVolume[st.byVolume.length - 1][1]; }
  if (st.core && body.Tc <= st.core.below) return st.core.state;
  if (st.surface && body.Ts <= st.surface.below) return st.surface.state;
  if (st.thawed && st.surface && body.minTs <= st.surface.below) return st.thawed;
  return st.base;
}
export function stateName(exp, kind, state){ const it = itemOf(exp, kind); return (it && it.states && it.states.names && it.states.names[state]) || ''; }

/** 맨손으로 만지면 안 될 만큼 차가운가 */
export const isCold = (exp, body) => !!body && body.Ts <= exp.touch.cold;

const cell = (row, state, level) => { const r = row.states[state] || row.states['*']; return r ? r[clamp(Math.round(level), 1, 3) - 1] : null; };

/** 내리치기 결과 = (도구, 대상, 상태, 세기 1~3) 표. by:'tool' 인 줄은 도구(예: 바나나)의 상태로 읽는다.
 *  → { key, by, row, def } — def 는 exp.outcomes[key] */
export function strikeOutcome(exp, { tool = 'mallet', toolState = null, target, targetState = null, level = 1 }){
  const T = exp.strike, tk = kindOf(tool), gk = kindOf(target);
  for (const name of [`${tk}>${gk}`, `${tk}>*`, `*>${gk}`, '*>*']) { const row = T[name]; if (!row) continue;
    const by = row.by === 'tool' ? 'tool' : 'target', key = cell(row, by === 'tool' ? toolState : targetState, level);
    if (key) return { key, by, row: name, def: exp.outcomes[key] || null }; }
  return { key: 'tap', by: 'target', row: '*>*', def: exp.outcomes.tap || null };
}

/** 떨어뜨리기 결과 = (물체, 상태, 높이 m). 너무 낮으면 살며시 내려놓은 것. → { key, def, rebound } */
export function dropOutcome(exp, { kind, state = null, height = 0 }){
  const D = exp.drop, k = kindOf(kind), pick = (tab) => { const row = tab[k] || tab['*'] || {}; return row[state] || row['*'] || (tab['*'] || {})[state] || (tab['*'] || {})['*']; };
  const key = height < D.minHeight ? pick(D.low) : pick(D.table), def = exp.outcomes[key] || null, e = (def && def.restitution) || 0;
  return { key, def, rebound: +(height * e * e).toFixed(3) };
}

/** 사고 판정 — 사고는 판단에서만 난다(장비를 안 썼다, 하면 안 되는 조합). 손을 놓친 것은 여기 오지 않는다.
 *  action = 'handIn' | 'touch' | 'pourLn2' | 'cap' · ctx = { worn: {gloves, visor}, bowlLn2, cold, bottleLn2 } → 사고 이름 | null */
export function checkAccident(exp, action, ctx){
  for (const key in exp.accidents) { const w = exp.accidents[key].when; if (!w || w.action !== action) continue;
    if (w.needs && !ctx[w.needs]) continue;
    if (w.missing && ctx.worn && ctx.worn[w.missing]) continue;
    return key; }
  return null;
}

/** 조건 한 줄(쪽지의 걸음·예상 카드가 뜨는 때). ctx = { worn, bowlLn2(양), flags(Set), predicted, at: {id: 곳} } */
export function check(cond, ctx){
  if (!cond) return true;
  if (cond.worn && !cond.worn.every(id => ctx.worn[id])) return false;
  if (cond.bowlMin != null && !(ctx.bowlLn2 >= cond.bowlMin)) return false;
  if (cond.flag && !ctx.flags.has(cond.flag)) return false;
  if (cond.predicted && ctx.predicted == null) return false;
  if (cond.at) for (const id in cond.at) if (ctx.at[id] !== cond.at[id]) return false;
  return true;
}

/** 의뢰가 풀렸나: 의뢰의 done 깃발이 다 섰나 */
export const missionDone = (mission, flags) => !!mission.done && mission.done.every(f => flags.has(f));

/** 지금 할 걸음(빛나는 기구): 아직 안 된 첫 걸음의 번호. 다 됐으면 −1 */
export function currentStep(mission, ctx){ const s = mission.steps || []; for (let i = 0; i < s.length; i++) if (!check(s[i].done, ctx)) return i; return -1; }

/** 도감: 못 본 칸은 그림자(물체)만 보인다 */
export function encyclopediaView(exp, found = []){
  return exp.encyclopedia.map(e => found.includes(e.id) ? { id: e.id, item: e.item, found: true, title: e.title, text: e.text } : { id: e.id, item: e.item, found: false });
}

/** 물체가 선반에 놓이는 때: 의뢰 차례 번호(자유 실험 = 의뢰 수) */
export function appearIndex(exp, kind){
  const it = itemOf(exp, kind), i = exp.missions.findIndex(m => m.id === (it && it.appears));
  return i >= 0 ? i : exp.missions.length;
}
