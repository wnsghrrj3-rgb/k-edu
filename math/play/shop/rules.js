/* 가게 섬 규칙 — 화면 없이 도는 부분(하네스가 그대로 불러 3000회 돌린다).
 * 걸음은 「손님 수」가 아니라 「내가 산 것」으로 오른다:
 *   큰 바구니 → 주문이 커지고(3~9) 그림 대신 숫자 · 과일 상자 → 두 가지(셋이면 가끔 세 가지) · 열 개들이 상자 → 십몇.
 * 한 번에 하나만 새로: 하나를 사면 손님 REST 명을 받아야 다음 것을 살 수 있다. 무엇부터 살지는 아이 몫.
 * 수학(드러내지 않음): 수 세기 → 수 읽고 세기 → 모으기 → 묶음과 낱개. 값(가격표)·거스름·하루 장사는 M03. */

// ── 내가 정한 수치(준호가 해 보고 바꾼다)
export const TUNE = {
  REST: 2,                         // 하나 산 뒤 다음 것을 사기까지 받을 손님 수
  OFFER: 3,                        // 꾸미기 판에 한 번에 뜨는 것
  FRUIT_PRICE: [12, 22, 34],       // 과일 상자 첫째·둘째·셋째
  WAIT: 26, WAIT_BIG: 4, WAIT_BOX: 4, AWNING: 1.4, HURRY: .55,   // 기다림(초) · 큰 바구니·상자마다 더 · 차양 곱 · 급한 손님 곱
  GAP: 8, GAP_BELL: 4.5, GAP_EMPTY: 1.2,                          // 다음 손님이 오는 사이(초) · 종이 있으면 · 줄이 비었으면
  HURRY_BONUS: 2,                  // 급한 손님 덤 동전
  HURRY_P: .18, LOTS_P: .15, REG_P: .25,                          // 급한 손님 · 잔뜩 손님 · 단골이 올 확률
  HEART: 5,                        // 단골 하트 칸 수(다 차면 다음 손님이 새 단골)
  REG_MAX: 3,                      // 단골은 셋까지
  BASKET: 12, BASKET_BIG: 25 };    // 바구니에 들어가는 칸(열 개들이 상자는 5칸)

export const FRUITS = ['apple', 'orange', 'banana', 'grape'];
export const EXTRA = ['orange', 'banana', 'grape'];                // 과일 상자로 고를 수 있는 것
export const SIGNS = ['해님 과일 가게', '싱싱 과일 가게', '새콤달콤 가게'];
export const NAME = { apple: '사과', orange: '귤', banana: '바나나', grape: '포도' };

/* 살 수 있는 것. 꾸미기 판에는 이 차례에서 아직 안 산 것 앞의 셋이 뜬다(과일 상자·큰 바구니가 늘 앞에 있어 수가 크는 길이 막히지 않는다). */
export const CATALOG = [
  { id: 'basket', art: 'shop.basket', name: '큰 바구니', price: 10, math: true, say: '큰 바구니가 생겼어!' },
  { id: 'fruit', art: 'fruit.orange', name: '새 과일 상자', price: o => TUNE.FRUIT_PRICE[(o.fruits || []).length], math: true, max: 3, choose: 'fruit' },
  { id: 'pot', art: 'shop.pot', name: '화분', price: 8, say: '가게가 예뻐졌어!' },
  { id: 'awning', art: 'shop.awning', name: '차양', price: 15, say: '손님이 더 오래 기다려 줘!' },
  { id: 'box', art: 'shop.box', name: '열 개들이 상자', price: 30, math: true, need: o => !!o.basket, say: '사과 열 개들이 상자가 생겼어!' },
  { id: 'sign', art: 'shop.sign', name: '간판', price: 18, choose: 'sign' },
  { id: 'bell', art: 'shop.bell', name: '종', price: 20, say: '손님이 더 빨리 와!' },
  { id: 'lamp', art: 'shop.lamp', name: '등', price: 12, say: '가게가 반짝반짝!' } ];
const byId = Object.fromEntries(CATALOG.map(c => [c.id, c]));

/** 빈 가게. owned = { basket, box, pot, awning, bell, lamp: true · fruits: ['orange'…] · sign: '…' } */
export const fresh = () => ({ owned: { fruits: [] }, bought: 0, rest: 0, heart: 0, regs: {}, v: 2 });
/** 예전 저장(M01: stage·sold)을 산 것으로 바꿔 준다. */
export function migrate(save){
  if (save.v === 2) return save;
  const st = save.stage | 0, f = fresh(); if (st >= 1) f.owned.basket = true; if (st >= 2) f.owned.fruits.push('orange'); if (st >= 3) f.owned.fruits.push('banana'); if (st >= 4) f.owned.box = true;
  f.bought = (f.owned.basket ? 1 : 0) + f.owned.fruits.length + (f.owned.box ? 1 : 0);
  for (const k of Object.keys(save)) delete save[k]; return Object.assign(save, f); }

export const has = (o, id) => id === 'fruit' ? (o.fruits || []).length >= byId.fruit.max : id === 'sign' ? !!o.sign : !!o[id];
export const priceOf = (o, id) => { const p = byId[id].price; return typeof p === 'function' ? p(o) : p; };
/** 지금 살 수 있는 것(차례대로 앞의 OFFER 개). */
export function offers(o){ return CATALOG.filter(c => !has(o, c.id) && (!c.need || c.need(o))).slice(0, TUNE.OFFER).map(c => ({ ...c, price: priceOf(o, c.id) })); }
export const allOwned = o => CATALOG.every(c => has(o, c.id));
/** 고르는 것이 있는 물건의 고를 거리. */
export function choices(o, id){ if (id === 'fruit') return EXTRA.filter(f => !(o.fruits || []).includes(f)); if (id === 'sign') return SIGNS.slice(); return []; }
/** 산다(동전은 부르는 쪽이 지갑에서 뺀다). pick = 고른 과일·간판 이름. 돌려주는 값: 새로 생긴 것 한 줄. */
export function buy(save, id, pick){ const o = save.owned, c = byId[id];
  if (id === 'fruit') { if (!EXTRA.includes(pick) || o.fruits.includes(pick)) throw new Error('fruit'); o.fruits.push(pick); }
  else if (id === 'sign') { if (!SIGNS.includes(pick)) throw new Error('sign'); o.sign = pick; }
  else o[id] = true;
  save.bought++; save.rest = TUNE.REST;
  return id === 'fruit' ? `${NAME[pick]} 상자가 생겼어!` : id === 'sign' ? `「${pick}」 간판을 걸었어!` : c.say; }

// ── 가게 모습에서 나오는 것
export const crates = o => ['apple', ...(o.fruits || [])];
export const level = o => (o.basket ? 1 : 0) + (o.fruits || []).length + (o.box ? 1 : 0);   // 수가 크는 걸음(0~5)
export const queueCap = save => save.bought >= 4 ? 3 : save.bought >= 2 ? 2 : 1;
export const pics = o => !o.basket;                                                    // 큰 바구니 전에는 그림 주문
export const basketCap = o => o.basket ? TUNE.BASKET_BIG : TUNE.BASKET;
export const shopName = o => o.sign || (o.box ? '과일 마트' : (o.fruits || []).length >= 2 ? '큰 과일 가게' : '과일 가게');
export const waitSec = (o, kind) => (TUNE.WAIT + (o.basket ? TUNE.WAIT_BIG : 0) + (o.box ? TUNE.WAIT_BOX : 0)) * (o.awning ? TUNE.AWNING : 1) * (kind === 'hurry' ? TUNE.HURRY : 1);
export const gapSec = o => o.bell ? TUNE.GAP_BELL : TUNE.GAP;
/** 이 주문을 바구니에 담으면 몇 칸인지(상자가 있으면 사과 열 개 = 5칸). */
export function slotsOf(order, o){ let n = 0; for (const k in order) { const v = order[k]; n += o.box && k === 'apple' ? Math.floor(v / 10) * 5 + v % 10 : v; } return n; }

/** 주문 하나. kind = 'plain' · 'hurry' · 'lots'. rnd = 0~1 난수 함수. */
export function orderFor(o, kind = 'plain', rnd = Math.random){
  const R = (a, b) => a + Math.floor(rnd() * (b - a + 1)), fr = crates(o), lots = kind === 'lots', others = fr.filter(f => f !== 'apple');
  const pickN = n => { const a = fr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };
  if (o.box && (lots || rnd() < .55)) { const out = { apple: lots ? R(15, 19) : R(11, 19) }; if (others.length && rnd() < .35) out[others[Math.floor(rnd() * others.length)]] = R(1, 5); return out; }
  const multi = fr.length > 1 && (lots ? rnd() < .5 : rnd() < .6);
  if (!o.basket) { if (!multi) return { [pickN(1)[0]]: lots ? R(4, 5) : R(1, 5) }; const [a, b] = pickN(2); return { [a]: R(1, 3), [b]: R(1, 3) }; }
  if (!multi) return { [pickN(1)[0]]: lots ? R(7, 9) : R(3, 9) };
  if (fr.length >= 3 && rnd() < .2) { const out = {}; for (const k of pickN(3)) out[k] = R(1, 3); return out; }
  const [a, b] = pickN(2); return { [a]: lots ? R(4, 5) : R(1, 5), [b]: lots ? R(3, 4) : R(1, 4) }; }

/** 다음에 올 손님의 종류. regsOut = 지금 줄에 없는 단골 얼굴들. → { kind, reg: 얼굴 | null, newReg: bool } */
export function nextGuest(save, regsOut, rnd = Math.random){
  if (save.heart >= TUNE.HEART && Object.keys(save.regs).length < TUNE.REG_MAX) return { kind: 'plain', reg: null, newReg: true };
  if (regsOut.length && rnd() < TUNE.REG_P) return { kind: 'regular', reg: regsOut[Math.floor(rnd() * regsOut.length)], newReg: false };
  if (save.bought >= 3 && rnd() < TUNE.HURRY_P) return { kind: 'hurry', reg: null, newReg: false };
  if (save.bought >= 4 && rnd() < TUNE.LOTS_P) return { kind: 'lots', reg: null, newReg: false };
  return { kind: 'plain', reg: null, newReg: false }; }
/** 그 주문이 지금 가게로 채워지는가(진열대에 있는 것만 · 바구니에 들어감). */
export const fillable = (order, o) => { const ks = Object.keys(order); return ks.length > 0 && ks.every(k => crates(o).includes(k) && Number.isInteger(order[k]) && order[k] >= 1) && slotsOf(order, o) <= basketCap(o); };
