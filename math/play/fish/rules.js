/* 낚시 섬 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다).
 * 하는 일: 수 물고기를 낚아 통을 딱 채운다. 걸음은 「배 꾸미기」에서 산 것으로 오른다(가게 섬과 같은 방식).
 *   큰 통(10칸) → 큰 미끼(6~9 물고기) → 둘째 통(두 통을 다 채워야 떠남) → 아주 큰 통(20칸) → 주문 배(칸 없이 뚜껑에 수만)
 *   별난 물고기: 황금(남은 만큼 딱) · 복어(통에 들어가면 +1 부풂) · 게(통에서 하나 집어 감 = 빼기) · 그물(끌어서 여러 마리) · 등불(밤낚시)
 * 수학(드러내지 않음): 모으기 · 10 만들기 · 세 수의 덧셈 · 스물까지 · 빼기. */

// ── 내가 정한 수치
export const TUNE = { REST: 2, OFFER: 3, HELP_P: .55, NET_MAX: 4, ORDER_P: .5, GOLD_P: .12, PUFFER_P: .14, CRAB_P: .1 };
export const CATALOG = [
  { id: 'tub10', art: 'boat.tub', name: '큰 통', price: 10, say: '통이 커졌어! 열 칸' },
  { id: 'bait', art: 'boat.bait', name: '큰 미끼', price: 15, need: o => !!o.tub10, say: '큰 물고기가 와!' },
  { id: 'tub2', art: 'boat.tub2', name: '둘째 통', price: 20, need: o => !!o.tub10, say: '통이 둘이 됐어!' },
  { id: 'gold', art: 'fish.gold', name: '황금 미끼', price: 12, say: '황금 물고기가 와!' },
  { id: 'tub20', art: 'boat.bigtub', name: '아주 큰 통', price: 25, need: o => !!o.bait, say: '배가 커졌어! 스무 칸' },
  { id: 'order', art: 'boat.flag', name: '주문 배', price: 22, need: o => !!o.tub10, say: '주문 배가 와!' },
  { id: 'puffer', art: 'fish.puffer', name: '복어 미끼', price: 14, say: '복어가 와!' },
  { id: 'crab', art: 'fish.crab', name: '게 통발', price: 16, need: o => !!o.tub10, say: '게가 와!' },
  { id: 'net', art: 'boat.net', name: '그물', price: 30, need: o => !!o.tub20, say: '그물이 생겼어! 끌어서 잡아' },
  { id: 'lamp', art: 'boat.lamp', name: '등불', price: 18, say: '밤낚시를 할 수 있어!' } ];
const byId = Object.fromEntries(CATALOG.map(c => [c.id, c]));

export const fresh = () => ({ v: 2, owned: {}, bought: 0, rest: 0, sent: 0 });
/** 예전 저장(M01: stage·sent)을 산 것으로 바꿔 준다. */
export function migrate(save){ if (save.v === 2) return save; const st = save.stage | 0, f = fresh(); if (st >= 1) f.owned.tub10 = true; if (st >= 2) f.owned.bait = true; if (st >= 3) f.owned.tub20 = true; f.bought = Object.keys(f.owned).length;
  for (const k of Object.keys(save)) delete save[k]; return Object.assign(save, f); }
export const has = (o, id) => !!o[id];
export const offers = o => CATALOG.filter(c => !o[c.id] && (!c.need || c.need(o))).slice(0, TUNE.OFFER);
export const priceOf = (o, id) => byId[id].price;
export const allOwned = o => CATALOG.every(c => o[c.id]);
export function buy(save, id){ save.owned[id] = true; save.bought++; save.rest = TUNE.REST; return byId[id].say; }

// ── 배 모습에서 나오는 것
export const cap = o => o.tub20 ? 20 : o.tub10 ? 10 : 5;
export const maxFish = o => o.bait ? 9 : o.tub10 ? 5 : 3;
export const nFish = o => (o.tub20 ? 7 : o.bait ? 6 : o.tub10 ? 5 : 4) + (o.lamp ? 1 : 0);
export const speed = o => o.tub20 ? 1.35 : o.bait ? 1.25 : o.tub10 ? 1.1 : 1;
/** 새 통 하나: 칸 통 또는 (주문 배를 샀으면 가끔) 뚜껑에 수만 있는 통. */
export function newTub(o, rnd = Math.random){ const c = cap(o); if (o.order && rnd() < TUNE.ORDER_P) { const t = Math.max(4, Math.round(c * .4)) + Math.floor(rnd() * (c - Math.max(4, Math.round(c * .4)) + 1)); return { cap: t, kind: 'order', fill: [] }; } return { cap: c, kind: 'slots', fill: [] }; }
export const tubsFor = (o, rnd = Math.random) => o.tub2 ? [newTub(o, rnd), newTub(o, rnd)] : [newTub(o, rnd)];
export const sum = t => t.fill.reduce((a, b) => a + b, 0), left = t => t.cap - sum(t);

/** 물고기가 그 통에 들어가면 몇이 되나 — 황금은 남은 만큼, 복어는 하나 부풂. 게는 들어가지 않는다(null). */
export function worth(f, t){ if (f.kind === 'crab') return null; if (f.kind === 'gold') return left(t); if (f.kind === 'puffer') return f.v + 1; return f.v; }
/** 그 물고기를 그 통에 낚을 수 있는가(게는 통에 하나라도 들어 있으면). */
export function fits(f, t){ if (left(t) <= 0) return false; if (f.kind === 'crab') return t.fill.length > 0; const w = worth(f, t); return w >= 1 && w <= left(t); }
/** 낚는다: 통이 바뀐다. → { ok, took(게가 집어 간 수), w(들어간 수) } */
export function catchInto(f, t){ if (!fits(f, t)) return { ok: false }; if (f.kind === 'crab') { const took = t.fill.pop(); return { ok: true, took }; } const w = worth(f, t); t.fill.push(w); return { ok: true, w }; }

/** 새 물고기 하나의 종류와 수. 남은 칸에 딱 맞는 수가 자주 섞인다(HELP_P). */
export function spawnFish(o, tubs, onScreen, rnd = Math.random){ const mx = maxFish(o), R = (a, b) => a + Math.floor(rnd() * (b - a + 1)), open = tubs.filter(t => left(t) > 0);
  const r = rnd(); if (o.gold && r < TUNE.GOLD_P) return { kind: 'gold', v: 0 }; if (o.crab && r < TUNE.GOLD_P + TUNE.CRAB_P && open.some(t => t.fill.length)) return { kind: 'crab', v: 0 };
  if (o.puffer && r < TUNE.GOLD_P + TUNE.CRAB_P + TUNE.PUFFER_P) { const t = open[Math.floor(rnd() * open.length)]; const v = t && left(t) >= 2 && rnd() < .6 ? Math.min(mx, left(t) - 1) : R(1, Math.max(1, mx - 1)); return { kind: 'puffer', v }; }
  const want = open.map(left).filter(l => l <= mx && !onScreen.some(f => f.kind === 'plain' && f.v === l)); if (want.length && rnd() < TUNE.HELP_P) return { kind: 'plain', v: want[Math.floor(rnd() * want.length)] };
  return { kind: 'plain', v: R(1, mx) }; }
/** 막힘 방지: 화면의 물고기 가운데 어느 통에도 못 들어가는 것뿐이면, 하나를 딱 맞는 수로 바꿀 것을 돌려준다(null = 괜찮음). */
export function unstick(o, tubs, fish){ const open = tubs.filter(t => left(t) > 0); if (!open.length || !fish.length) return null; if (fish.some(f => open.some(t => fits(f, t)))) return null;
  const t = open.reduce((a, b) => left(a) <= left(b) ? a : b), f = fish.find(x => x.kind === 'plain') || fish[0]; return { fish: f, kind: 'plain', v: Math.min(left(t), maxFish(o)) }; }
/** 그물: 걸린 물고기들(합이 그 통에 들어갈 때만, 게·황금은 그물에 안 걸림). → 걸린 것 배열 또는 null */
export function netCatch(caught, t){ const fish = caught.filter(f => f.kind === 'plain' || f.kind === 'puffer').slice(0, TUNE.NET_MAX); if (fish.length < 2) return null; const s = fish.reduce((a, f) => a + worth(f, t), 0); return s <= left(t) ? fish : null; }
export const coinsFor = tubs => tubs.reduce((a, t) => a + t.cap, 0);
export const KINDS = ['plain', 'gold', 'puffer', 'crab'];
