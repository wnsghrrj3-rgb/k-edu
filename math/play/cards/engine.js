/* 수 카드 모험 — 규칙 엔진(화면을 모른다. 같은 씨앗이면 같은 판).
 * 한 줄: 손에 든 수 카드를 골라 몬스터 체력에 「딱」 맞춘다. 딱 맞히면 카드를 더 뽑는다 → 한 턴에 여럿을 쓰러뜨리는 길을 짠다.
 * 한 턴에 두 번 칠 수 있고, 딱 맞히면 그 한 번을 돌려받는다. 넘치게 쳐도 쓰러지지만 덤이 없다(카드만 낭비).
 * 방을 깰 때마다 능력(수의 성질로 된 규칙)을 하나 고른다 → 판마다 다른 전략.
 * 설계: 핸드오프 kmotion/math-wizard/22_수학놀이터_집판_깊은게임_설계_v1.md */
export const TERMS = [{ id: '1-1', label: '1학년 1학기' }, { id: '1-2', label: '1학년 2학기' }, { id: '2-1', label: '2학년 1학기' }, { id: '2-2', label: '2학년 2학기' }];
const CFG = {
  '1-1': { deck: [1, 1, 2, 2, 3, 3, 4, 5], lo: 4, hi: 9, boss: 22, weak: 5, add: [4, 5, 6] },
  '1-2': { deck: [1, 2, 2, 3, 3, 4, 5, 6, 7], lo: 6, hi: 15, boss: 36, weak: 10, add: [6, 8, 9] },
  '2-1': { deck: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10], lo: 8, hi: 22, boss: 50, weak: 20, add: [10, 20, 5] },
  '2-2': { deck: [3, 4, 5, 6, 7, 8, 9, 10, 10, 20], lo: 10, hi: 28, boss: 66, weak: 30, add: [20, 10, 30] } };
export const RELICS = {
  ten:    { name: '십의 번개', desc: '낸 카드의 합이 딱 10이면 모든 몬스터에게 번개(2)' },
  twin:   { name: '쌍둥이 주머니', desc: '같은 수 두 장을 함께 내면 카드 1장 더' },
  stairs: { name: '계단 부적', desc: '이어진 수 세 장(3·4·5처럼)을 함께 내면 카드 2장 더' },
  even:   { name: '짝수 방패', desc: '짝수로 딱 맞히면 이번 턴에 맞는 피해 1 줄어듦' },
  big:    { name: '큰 손', desc: '손에 드는 카드가 1장 늘어남' },
  minus:  { name: '빼기 지팡이', desc: '턴마다 한 번, 카드 한 장을 빼기로 낼 수 있음' },
  double: { name: '두 배 물약', desc: '턴마다 한 번, 카드 한 장을 두 배로 낼 수 있음' },
  fruit:  { name: '딱딱 열매', desc: '한 싸움에서 세 번 딱 맞힐 때마다 하트 1 회복' } };
export const MON = {
  slime:  { name: '슬라임', tip: '딱 맞히면 카드를 한 장 더 뽑아' },
  shield: { name: '짝수 방패병', tip: '짝수로만 칠 수 있어' },
  bat:    { name: '홀수 박쥐', tip: '홀수로만 칠 수 있어' },
  shroom: { name: '자라는 버섯', tip: '턴이 끝날 때마다 체력이 1 자라' },
  twin:   { name: '쌍둥이', tip: '둘을 같은 턴에 쓰러뜨려야 해. 하나만 남으면 다시 일어나' },
  golem:  { name: '숫자 골렘', tip: '' } };
export const NODES = ['싸움', '싸움', '싸움', '쉼터', '쌍둥이', '싸움', '골렘'];

export function rng(seed){ let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function newRun(term, seed, hard = 0){ const c = CFG[term] || CFG['1-2'], r = rng(seed); let uid = 0;
  const s = { term, cfg: c, r, hard, uid: () => ++uid, hp: 5, maxHp: 5, crystals: 0, relics: [], deck: [], draw: [], discard: [], hand: [], enemies: [], node: 0, turn: 0, phase: 'battle', used: {}, guard: 0, acts: 3, reward: null,
    stat: { exact: 0, kills: 0, over: 0, blocked: 0, turns: 0, plays: 0, battleExact: 0 }, seen: { mon: new Set(), relic: new Set() } };
  s.deck = c.deck.map(v => ({ id: s.uid(), v })); enter(s); return s; }
const R = (s, a, b) => a + Math.floor(s.r() * (b - a + 1));
const WAIT = { slime: 2, shield: 3, bat: 2, shroom: 3, twin: 3, golem: 3 };      // 몇 턴마다 한 번 공격하나(머리 위에 남은 턴이 보인다)
const mk = (s, type, hp) => { s.seen.mon.add(type); return { id: s.uid(), type, name: MON[type].name, hp, max: hp, atk: type === 'golem' ? 2 : 1, wait: WAIT[type], cd: WAIT[type], dead: false, diedTurn: -1 }; };
function spawn(s){ const c = s.cfg, h = s.hard, lo = c.lo + h, hi = c.hi + h * 2, mid = Math.round((lo + hi) / 2), ev = v => v % 2 ? v + 1 : v, od = v => v % 2 ? v : v + 1;
  switch (s.node) {
    case 0: return [mk(s, 'slime', R(s, lo, mid)), mk(s, 'slime', R(s, lo, mid))];
    case 1: return [mk(s, 'slime', R(s, lo, mid)), mk(s, 'slime', R(s, lo + 1, mid + 1)), mk(s, 'slime', R(s, mid, hi))];
    case 2: return [mk(s, 'shield', ev(R(s, lo, mid))), mk(s, 'slime', R(s, lo, hi - 2)), mk(s, 'slime', R(s, lo, mid))];
    case 4: { const v = R(s, lo + 1, mid); return [mk(s, 'twin', v), mk(s, 'twin', v), mk(s, 'slime', R(s, mid, hi))]; }
    case 5: return [mk(s, 'shroom', R(s, lo, mid)), mk(s, 'bat', od(R(s, lo, mid))), mk(s, 'slime', R(s, mid, hi)), mk(s, 'shield', ev(R(s, lo, mid)))];
    case 6: { const g = mk(s, 'golem', c.boss + h * 4); g.weak = c.weak; return [g, mk(s, 'slime', R(s, lo, mid))]; }
    default: return []; } }
function drawN(s, n, ev){ let got = 0; for (let i = 0; i < n; i++) { if (!s.draw.length) { if (!s.discard.length) break; s.draw = shuffle(s.discard.splice(0), s.r); } s.hand.push(s.draw.pop()); got++; } if (got && ev) ev.push({ t: 'draw', n: got }); return got; }
const handSize = s => 5 + (s.relics.includes('big') ? 1 : 0);
function enter(s){ if (NODES[s.node] === '쉼터') { s.phase = 'rest'; return; }
  s.phase = 'battle'; s.enemies = spawn(s); s.draw = shuffle(s.deck.map(c => ({ ...c })), s.r); s.discard = []; s.hand = []; s.turn = 1; s.used = {}; s.guard = 0; s.acts = ACTS; s.stat.battleExact = 0; s.enemies.forEach((e, i) => { e.cd = e.wait + (i % 2); }); drawN(s, handSize(s)); }
export const ACTS = 2;          // 한 턴에 칠 수 있는 횟수
export const alive = s => s.enemies.filter(e => !e.dead);

/* 카드 내기: picks = [{id, neg?, dbl?}], 대상 enemyId. 돌려주는 것 = 화면에 보여 줄 일들의 차례 */
export function attack(s, picks, enemyId){ const ev = []; if (s.phase !== 'battle' || !picks.length) return ev; if (s.acts <= 0) { ev.push({ t: 'nope', why: '이번 턴엔 다 쳤어' }); return ev; } const e = s.enemies.find(x => x.id === enemyId && !x.dead); if (!e) return ev;
  const cards = picks.map(p => ({ c: s.hand.find(h => h.id === p.id), neg: !!p.neg && s.relics.includes('minus') && !s.used.minus, dbl: !!p.dbl && s.relics.includes('double') && !s.used.double })).filter(x => x.c); if (!cards.length) return ev;
  let neg = 0, dbl = 0; for (const x of cards) { if (x.neg && neg++) x.neg = false; if (x.dbl && dbl++) x.dbl = false; }
  const vals = cards.map(x => (x.dbl ? x.c.v * 2 : x.c.v) * (x.neg ? -1 : 1)), sum = vals.reduce((a, b) => a + b, 0);
  if (sum <= 0) { ev.push({ t: 'nope', why: '0보다 커야 해' }); return ev; }
  if (neg) s.used.minus = true; if (dbl) s.used.double = true;
  for (const x of cards) { s.hand.splice(s.hand.indexOf(x.c), 1); s.discard.push(x.c); } s.stat.plays++; s.acts--;
  ev.push({ t: 'sum', vals, sum, target: e.id });
  const blocked = (e.type === 'shield' && sum % 2 !== 0) || (e.type === 'bat' && sum % 2 === 0);
  if (blocked) { s.stat.blocked++; ev.push({ t: 'blocked', id: e.id, why: e.type === 'shield' ? '짝수만 통해!' : '홀수만 통해!' }); }
  else { const dmg = e.type === 'golem' && sum === e.weak ? sum * 2 : sum; if (dmg !== sum) ev.push({ t: 'weak', id: e.id, dmg });
    if (dmg > e.hp) { s.stat.over++; ev.push({ t: 'over', id: e.id, by: dmg - e.hp }); kill(s, e, ev, false); }          // 넘침: 쓰러지지만 덤 없음
    else if (dmg === e.hp) { kill(s, e, ev, true); s.stat.exact++; s.stat.battleExact++; s.crystals++; s.acts++; drawN(s, 1, ev);
      if (s.relics.includes('even') && sum % 2 === 0) { s.guard++; ev.push({ t: 'relic', id: 'even' }); }
      if (s.relics.includes('fruit') && s.stat.battleExact % 3 === 0 && s.hp < s.maxHp) { s.hp++; ev.push({ t: 'relic', id: 'fruit' }, { t: 'heal', n: 1 }); } }
    else { e.hp -= dmg; ev.push({ t: 'hit', id: e.id, dmg, left: e.hp }); } }
  // 능력: 낸 카드의 모양을 본다(맞았든 빗나갔든)
  const abs = cards.map(x => x.c.v).sort((a, b) => a - b);
  if (s.relics.includes('ten') && sum === 10) { ev.push({ t: 'relic', id: 'ten' }); for (const o of alive(s)) { if (o.hp <= 2) kill(s, o, ev, false); else { o.hp -= 2; ev.push({ t: 'hit', id: o.id, dmg: 2, left: o.hp, bolt: true }); } } }
  if (s.relics.includes('twin') && abs.some((v, i) => i && v === abs[i - 1])) { ev.push({ t: 'relic', id: 'twin' }); drawN(s, 1, ev); }
  if (s.relics.includes('stairs') && abs.some((v, i) => i > 1 && abs[i - 1] === v - 1 && abs[i - 2] === v - 2)) { ev.push({ t: 'relic', id: 'stairs' }); drawN(s, 2, ev); }
  if (!alive(s).length) win(s, ev); return ev; }
function kill(s, e, ev, exact){ e.dead = true; e.hp = 0; e.diedTurn = s.turn; s.stat.kills++; ev.push({ t: exact ? 'exact' : 'kill', id: e.id }); }
function win(s, ev){ ev.push({ t: 'clear', node: s.node }); if (s.tut) { s.phase = 'tutdone'; return; } if (s.node >= NODES.length - 1) { s.phase = 'won'; ev.push({ t: 'won' }); return; }
  const pool = shuffle(Object.keys(RELICS).filter(k => !s.relics.includes(k)), s.r).slice(0, 2).map(id => ({ kind: 'relic', id })); const cv = s.cfg.add[Math.floor(s.r() * s.cfg.add.length)];
  s.reward = shuffle([...pool, { kind: 'card', v: cv }, ...(pool.length < 2 ? [{ kind: 'card', v: s.cfg.add[0] }] : [])].slice(0, 3), s.r); s.phase = 'reward'; }

export function endTurn(s){ const ev = []; if (s.phase !== 'battle') return ev; s.stat.turns++;
  // 쌍둥이: 이번 턴에 하나만 쓰러졌으면 다시 일어난다
  const tw = s.enemies.filter(e => e.type === 'twin'); if (tw.length === 2 && tw.filter(e => e.dead).length === 1) { const d = tw.find(e => e.dead); d.dead = false; d.hp = d.max; d.cd = d.wait; s.stat.kills--; ev.push({ t: 'revive', id: d.id }); }
  let dmg = 0; for (const e of alive(s)) { e.cd--; if (e.cd <= 0) { dmg += e.atk; e.cd = e.wait; ev.push({ t: 'enemyHit', id: e.id, n: e.atk }); } if (e.type === 'shroom') { e.hp++; e.max = Math.max(e.max, e.hp); ev.push({ t: 'grow', id: e.id, hp: e.hp }); } }
  const blockedBy = Math.min(dmg, s.guard); dmg -= blockedBy; if (blockedBy) ev.push({ t: 'guard', n: blockedBy }); s.hp -= dmg; if (dmg) ev.push({ t: 'hurt', n: dmg, hp: s.hp });
  if (s.hp <= 0) { s.hp = 0; s.phase = 'lost'; ev.push({ t: 'lost' }); return ev; }
  s.discard.push(...s.hand.splice(0)); s.turn++; s.used = {}; s.guard = 0; s.acts = ACTS; drawN(s, handSize(s)); ev.push({ t: 'turn', n: s.turn }); return ev; }
export function takeReward(s, i){ if (s.phase !== 'reward') return; const r = s.reward[i]; if (!r) return; if (r.kind === 'relic') { s.relics.push(r.id); s.seen.relic.add(r.id); } else s.deck.push({ id: s.uid(), v: r.v }); s.reward = null; s.node++; enter(s); }
export function rest(s){ if (s.phase !== 'rest') return; s.hp = Math.min(s.maxHp, s.hp + 2); s.node++; enter(s); }
/* 배우는 방(하는 법): 정해진 몬스터와 손패로 싸움 하나를 차린다 */
export function custom(s, enemies, hand, draw = []){ s.phase = 'battle'; s.enemies = enemies.map(([type, hp, cd]) => { const e = mk(s, type, hp); e.cd = cd || e.wait; return e; }); s.hand = hand.map(v => ({ id: s.uid(), v })); s.draw = draw.map(v => ({ id: s.uid(), v })); s.discard = []; s.turn = 1; s.used = {}; s.guard = 0; s.acts = ACTS; s.reward = null; s.tut = true; }
export const score = s => s.stat.exact * 30 + s.stat.kills * 10 + s.node * 40 + (s.phase === 'won' ? 300 + s.hp * 40 : 0);
