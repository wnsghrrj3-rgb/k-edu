/* 가게 섬 — 줄 선 손님이 원하는 만큼 담아 건넨다. 문제 창·채점 없음:
 * 모자라면 「더 줘」, 넘치면 「너무 많아」 하고 기다릴 뿐. 손님이 그냥 가도 벌은 없다(단골 하트만 덜 찬다).
 * M02 번 동전으로 「가게 꾸미기」 — 산 것대로 가게가 바뀌고 주문이 커진다.
 * M03 열 개들이 상자를 사면 「하루 장사」(아침: 상자 싣기 → 낮: 손님 여덟 → 저녁: 번 돈을 열 개씩 쌓아 금고에).
 *     과일 상자를 셋 다 사면 값이 붙고(손님이 올려놓은 돈을 보고 「받기」·「더 줘야지?」), 값을 받은 손님이 열이 되면 거스름.
 *     다 꾸미면 옆에 빵집(식빵 10 · 크루아상 5). 규칙은 ./rules.js.
 * 틀(위쪽 띠·동전·알림·효과음·「커졌어!」)은 ../common/kit.js, 그림은 ../common/art.js. 산 것·하트·단골·오늘 장사는 지갑의 가게 칸에 남는다. */
import { wallet, art, arts, group, paint, hud, pay, grew, did, audio, tone, sfx, toast } from '../common/kit.js?v=6';
import * as R from './rules.js?v=2';
import * as A from '../common/ask.js?v=1';
import * as M5 from '../market/rules.js?v=3';
import * as L from '../common/loop.js?v=1';   /* N04 고리: 장터의 「물고기 통」은 낚시에서 가져온 생선만큼 */
const $ = id => document.getElementById(id), one = a => a[Math.floor(Math.random() * a.length)], wait = ms => new Promise(r => setTimeout(r, ms));
/* N05: 3D 항구 장터(/math/play/market/)는 같은 규칙에 물건 모습만 다르다(음식 꾸러미를 받으면 이 표만 바꾼다). M3 = 3D 쪽에서만 켜지는 것: 팻말의 남은 수 · 줄 끝의 셈 · 거스름 식 · 섞는 것 */
const M3 = document.body.dataset.mode === '3d';
const ARTN = M3 ? { apple: 'market.wood', orange: 'market.stone', banana: 'market.barrel', grape: 'market.fish', bread: 'bake.bread', croissant: 'bake.croissant' } : { apple: 'fruit.apple', orange: 'fruit.orange', banana: 'fruit.banana', grape: 'fruit.grape', bread: 'bake.bread', croissant: 'bake.croissant' }, pic = k => art(ARTN[k]), FACES = group('guest');
const SAVE = R.migrate(wallet.island('shop')), O = () => SAVE.owned;
const S = { q: [], sel: null, basket: [], paused: false, busy: false, nextIn: .6, id: 0, payG: null, shop: 'fruit', panel: null, asking: false, line: [], streak: 0, fair: 0, arrivals: 0, log: [] };
const NAMEX = M3 ? { apple: '장작', orange: '돌', banana: '통', grape: '물고기 통', bread: '식빵', croissant: '크루아상' } : R.NAME2;
/* N05 수치·사건 표는 ../market/rules.js(3D 만). ?calm = 시계 없이(손님이 기다림을 잃지 않음) */
const N5 = M5.N5, CALM = M3 && new URLSearchParams(location.search).has('calm');
if (M3) SAVE.n5 = M5.mend(SAVE.n5);
function keep(){ wallet.save(); }
const count = k => S.basket.reduce((n, b) => n + (b.k === k ? b.n : 0), 0), total = o => Object.values(o).reduce((a, b) => a + b, 0);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const T = () => SAVE.today, dayMode = () => !!T() && T().phase !== 'done', key = () => R.STOCK[S.shop];
const coin = (v, cls = '') => `<button class="c${v} ${cls}" data-v="${v}">${v}</button>`;

// ── 가게 모습: 산 것대로
function look(){ const o = O(), roof = $('roof'), bake = S.shop === 'bakery';
  $('shopName').textContent = bake ? R.BAKERY.name : R.shopName(o); roof.classList.toggle('sign', !!o.sign && !bake); roof.classList.toggle('awning', !!o.awning); roof.classList.toggle('bakery', bake); $('bell').hidden = !o.bell; $('lamp').hidden = !o.lamp;
  $('shop').classList.toggle('has-pot', !!o.pot); $('basket').classList.toggle('big', !!o.basket || bake); shelf(); hearts(); hammer(); dayBar(); }
/* N04 생선 진열대(3D 만): 나무 상자 칸에 남은 생선 수, 다 팔리면 빈 칸 */
/* 생선이 있으면 꾸미기와 상관없이 물고기 통을 판다(낚시 → 장터가 처음부터 이어지게). 규칙(rules.js)은 그대로 — 진열 목록과 주문에만 얹는다 */
const fishOn = () => M3 && S.shop === 'fruit' && L.fish() > 0;
function goodsM(){ const g = R.goods(O(), S.shop); if (fishOn() && !g.includes('grape')) g.push('grape'); return g; }
function fishMark(){ if (!M3) return; let a = $('shelf').querySelector('[data-k="grape"]'); if (S.shop === 'fruit' && !a && fishOn()) { shelf(); return; } if (!a) return; let s = a.querySelector('.stock'); if (!s) { s = el('span', 'stock'); a.appendChild(s); } const n = L.fish() - count('grape'); s.textContent = Math.max(0, n); a.classList.toggle('empty', n < 1); }
function shelf(fresh){ const o = O(), sh = $('shelf'), price = R.priceOn(o, S.shop); sh.innerHTML = '';
  for (const k of goodsM()) { const b = el('button', 'crate', pic(k) + (price ? `<span class="tag">${R.PRICE[k]}</span>` : '')); b.dataset.k = k; b.onclick = () => put(k, 1); sh.appendChild(b); }
  if (o.box || S.shop === 'bakery') { const k = key(), b = el('button', 'crate', `${art('shop.box')}<small>${pic(k)} 10개</small>`); b.dataset.k = 'box'; b.onclick = () => put(k, 10); sh.appendChild(b); }
  if (fresh) { const b = sh.querySelector(`[data-k="${fresh}"]`); if (b) b.classList.add('new'); } stockMarks(); fishMark(); }
function stockMarks(){ if (!dayMode() || T().phase !== 'open') return; const k = key(), n = T().stock, a = $('shelf').querySelector(`[data-k="${k}"]`), b = $('shelf').querySelector('[data-k="box"]');
  if (a) { let s = a.querySelector('.stock'); if (!s) { s = el('span', 'stock'); a.appendChild(s); } s.textContent = n; a.classList.toggle('empty', n < 1); } if (b) b.classList.toggle('empty', n < 10); }
function hearts(up){ const h = $('hearts'); h.innerHTML = arts('shop.heart', SAVE.heart) + arts('shop.heart.empty', R.TUNE.HEART - SAVE.heart); if (up) { h.classList.remove('up'); void h.offsetWidth; h.classList.add('up'); } }
function hammer(){ const b = $('hammer'), rest = SAVE.rest > 0, offs = R.offers(O()); b.classList.toggle('rest', rest); b.hidden = !offs.length && !rest;
  $('restPips').innerHTML = rest ? Array.from({ length: R.TUNE.REST }, (_, i) => `<u class="${i < R.TUNE.REST - SAVE.rest ? 'on' : ''}"></u>`).join('') : '';
  b.classList.toggle('glow', !rest && offs.some(c => c.price <= wallet.coins())); }
function dayBar(up){ const on = dayMode() && T().phase !== 'morning'; $('till').hidden = !on; $('dayPips').innerHTML = on ? T().plan.map(g => `<u class="${g.done ? 'on' : ''}"></u>`).join('') : '';
  if (on) { $('tillN').textContent = T().till.ten * 10 + T().till.one; if (up) { const t = $('till'); t.classList.remove('up'); void t.offsetWidth; t.classList.add('up'); } } }

// ── 바구니(하루 장사 중에는 상자로 들여온 것만큼만)
function drawBasket(){ const b = $('basket'); b.innerHTML = ''; S.basket.forEach((x, i) => { const s = el('span', x.n === 10 ? 'box' : '', x.n === 10 ? arts(ARTN[x.k], 5) + '<br>' + arts(ARTN[x.k], 5) : pic(x.k)); s.onclick = () => { if (S.busy || S.paused || S.payG) return; S.basket.splice(i, 1); if (dayMode() && x.k === key()) { T().stock += x.n; stockMarks(); } tone(300, .06, 'sine'); drawBasket(); }; b.appendChild(s); });
  const g = S.sel; $('give').classList.toggle('glow', !!g && g.hint > 1 && matches(g.order)); if (M3 && g && !g.leaving && !S.payG) bubble(g); fishMark(); }
/** 바구니에서 i 번째를 뺀다(3D 바구니를 눌렀을 때). */
function unput(i){ const x = S.basket[i]; if (!x || S.busy || S.paused || S.payG || S.asking) return; S.basket.splice(i, 1); if (dayMode() && x.k === key()) { T().stock += x.n; stockMarks(); } tone(300, .06, 'sine'); drawBasket(); }
const slots = () => S.basket.reduce((a, b) => a + (b.n === 10 ? 5 : 1), 0), cap = () => S.shop === 'bakery' ? R.TUNE.BASKET_BIG : R.basketCap(O());
function put(k, n){ if (S.busy || S.paused || S.asking || S.payG || !S.q.length) return; audio(); if (M3 && k === 'grape' && count('grape') + n > L.fish()) { tone(160, .12, 'sine', .07); fishMark(); return; } if (slots() + (n === 10 ? 5 : 1) > cap()) { tone(180, .1, 'sine', .06); return; }
  if (dayMode() && k === key()) { if (T().stock < n) { tone(160, .12, 'sine', .07); return; } T().stock -= n; stockMarks(); }
  S.basket.push({ k, n }); tone(520 + S.basket.length * 30, .07, 'square', .05); drawBasket(); }
const matches = o => [...new Set([...Object.keys(o), ...S.basket.map(b => b.k)])].every(k => count(k) === (o[k] || 0)) && S.basket.length > 0;

// ── 손님
function orderHtml(o, g){ const pics = !M3 && S.shop === 'fruit' && R.pics(O()) && total(o) <= 6, rem = k => M3 && g && S.sel === g ? Math.max(0, o[k] - count(k)) : o[k]; return Object.keys(o).map(k => pics ? `<span class="pics">${arts(ARTN[k], o[k])}</span>` : `${pic(k)} ${rem(k)}`).join('<br>'); }
function bubble(g, extra){ let h;
  if (g.kind === 'regular' && !g.reveal) h = '늘 먹던 걸로!' + (g.firstUsual ? `<em>${orderHtml(g.order)}</em>` : '');
  else h = orderHtml(g.order, g);
  const b = g.el.querySelector('.bubble'); b.innerHTML = h + (extra ? `<small>${extra}</small>` : ''); b.classList.toggle('say', g.kind === 'regular' || !!extra); }
function say(g, h){ const b = g.el.querySelector('.bubble'); b.innerHTML = h; b.classList.add('say'); }
function select(g){ if (!g || g.leaving || (S.payG && S.payG !== g)) return; S.sel = g; for (const x of S.q) x.el.classList.toggle('sel', x === g); drawBasket(); }
function nextPlan(){ if (!dayMode()) return null; const inQ = new Set(S.q.map(g => g.pi)); return T().plan.findIndex((p, i) => !p.done && !inQ.has(i)); }
function arrive(){ let kind, face, order, pi = -1, newReg = false;
  if (dayMode()) { pi = nextPlan(); if (pi < 0) return; const p = T().plan[pi]; kind = p.kind; order = { ...p.order }; face = p.reg;
    if (!face) { const busy = new Set([...S.q.map(g => g.face), ...Object.keys(SAVE.regs)]); face = one(FACES.filter(f => !busy.has(f))); }
    newReg = S.shop === 'fruit' && kind !== 'regular' && SAVE.heart >= R.TUNE.HEART && Object.keys(SAVE.regs).length < R.TUNE.REG_MAX; }
  else { const regsOut = Object.keys(SAVE.regs).filter(f => !S.q.some(g => g.face === f)), n = R.nextGuest(SAVE, regsOut); kind = n.kind; newReg = n.newReg;
    const busy = new Set([...S.q.map(g => g.face), ...Object.keys(SAVE.regs)]); face = n.reg || one(FACES.filter(f => !busy.has(f))); order = kind === 'regular' ? { ...SAVE.regs[face].o } : R.orderFor(O(), kind); }
  /* N04: 생선이 있으면 손님이 생선도 찾는다(꾸미기 전에도 — 낚시 → 장터). 단골이 될 손님·단골 주문에는 얹지 않는다 */
  if (M3 && !dayMode() && kind !== 'regular' && !newReg && !order.grape && L.fish() > 0 && !(O().fruits || []).includes('grape') && Math.random() < N5.FISH_P) { const n = 1 + Math.floor(Math.random() * Math.min(N5.FISH_MAX, L.fish())); if (total(order) + n <= cap()) order.grape = n; }
  const g = { id: ++S.id, pi, face, kind, newReg, order, wait: 1, hint: 0, leaving: false, el: el('div', 'guest out', '<div class="bubble"></div><span class="face"></span><span class="mark"></span><div class="wait"><i></i></div>') };
  if (kind === 'regular') g.firstUsual = SAVE.regs[face].n <= 1;
  if (M3) { const ev = M5.arrival(SAVE.n5, kind); S.arrivals = SAVE.n5.arrivals; keep(); if (ev.surprise) g.surprise = true; if (ev.fair) { S.fair = N5.FAIR_N; S.log.push({ fair: true }); [196, 247, 294].forEach((f, i) => tone(f, .18, 'square', .06, i * .12)); } else if (S.fair > 0) S.fair--; }
  g.dur = R.waitSec(O(), kind); g.el.querySelector('.face').innerHTML = art(face); g.el.querySelector('.mark').innerHTML = kind === 'hurry' ? art('guest.mark.hurry') : kind === 'regular' ? art('guest.mark.regular') : '';
  g.el.dataset.kind = kind; g.el.dataset.id = g.id; g.el.addEventListener('pointerdown', e => { e.preventDefault(); audio(); select(g); }); bubble(g); $('line').appendChild(g.el); S.q.push(g);
  requestAnimationFrame(() => requestAnimationFrame(() => g.el.classList.remove('out'))); if (!S.sel) select(g); else select(S.sel);
  tone(880, .08, 'sine', .08); tone(1175, .12, 'sine', .08, .1); if (O().bell) { const b = $('bell'); b.classList.remove('ring'); void b.offsetWidth; b.classList.add('ring'); }
  setTimeout(() => soldOut(g), 700); }
/* 상자로 들여온 것이 모자라면 손님이 「다 팔렸네」 하고 간다(벌 없음 · 하트 그대로) */
function soldOut(g){ if (M3 && !g.leaving && S.payG !== g && (g.order.grape || 0) > L.fish()) { say(g, `${pic('grape')} 없네…`); g.el.classList.add('sad'); S.log.push({ nofish: g.order.grape }); leave(g, 'out'); return true; }   /* 생선이 모자라면 「없네」 하고 감(벌 없음) */
  if (!dayMode() || g.leaving || S.payG === g) return false; const k = key(), want = g.order[k] || 0; if (want <= T().stock + (S.sel === g ? count(k) : 0)) return false;
  say(g, `${pic(k)} 다 팔렸네…`); g.el.classList.add('sad'); T().out = (T().out | 0) + 1; leave(g, 'out'); return true; }
function leave(g, how){ const happy = how === true; g.leaving = true; S.q = S.q.filter(x => x !== g); if (S.sel === g) { S.sel = null; if (S.q.length) select(S.q[0]); }
  if (g.pi >= 0 && dayMode()) { T().plan[g.pi].done = true; keep(); dayBar(); }
  if (how === false) { say(g, '다음에 올게…'); SAVE.heart = Math.max(0, SAVE.heart - 1); keep(); hearts(); }
  setTimeout(() => g.el.classList.add('bye'), happy ? 900 : 700); setTimeout(() => { g.el.remove(); if (!S.sel && S.q.length) select(S.q[0]); }, happy ? 1500 : 1300);
  if (!S.q.length) S.nextIn = Math.min(S.nextIn, R.TUNE.GAP_EMPTY + (happy ? .8 : 0)); }
$('give').onclick = () => { const g = S.sel; if (S.busy || S.paused || S.payG || !g || g.leaving) return; audio(); if (!S.basket.length) return;
  const o = g.order, keys = new Set([...Object.keys(o), ...S.basket.map(b => b.k)]); let less = null, more = null; for (const k of keys) { const d = count(k) - (o[k] || 0); if (d < 0 && !less) less = k; if (d > 0 && !more) more = k; }
  if (!less && !more) { if (M3) { S.streak = g.hint === 0 ? S.streak + 1 : 0; A.flames(S.streak); } S.basket = []; drawBasket(); if (R.priceOn(O(), S.shop)) startPay(g); else done(g, total(o)); return; }
  g.hint++; g.el.classList.remove('sad'); void g.el.offsetWidth; g.el.classList.add('sad'); tone(200, .2, 'sine', .1);
  if (g.kind === 'regular' && !g.reveal) { g.reveal = true; bubble(g, '늘 먹던 건 이거야'); } else bubble(g, less ? `${pic(less)} 더 줘` : `${pic(more)} 너무 많아`); drawBasket(); };
/* 손님 하나를 다 받았다 — n = 받은 돈(덤 포함). 하루 장사 중이면 오늘 돈통에, 아니면 바로 지갑에 */
function done(g, n){ S.busy = true; if (M3 && g.order.grape) { L.useFish(g.order.grape); S.log.push({ fishSold: g.order.grape }); } const sold = M3 ? (R.priceOn(O(), S.shop) ? n : total(g.order)) : 0; n += g.kind === 'hurry' ? R.TUNE.HURRY_BONUS : 0; if (M3 && S.streak >= N5.STREAK_BONUS_AT) n += 1; if (M3) { SAVE.n5.served++; if (S.streak > 1) [0, 1, 2].forEach(i => tone(660 * 2 ** ((Math.min(S.streak, 8) * 2 + i * 4) / 12), .12, 'triangle', .1, .22 + i * .07)); }   /* 불꽃: 연달아 맞출수록 음이 오른다 */
  g.el.classList.add('happy'); sfx.yes(); did('shop.guest');
  if (dayMode()) { const t = T().till, s = R.split(n); t.ten += s.ten; t.one += s.one; T().served = (T().served | 0) + 1; flyTill(g.el, n); } else pay(n, 'shop', g.el);
  let line = '고마워!'; if (g.newReg) { SAVE.regs[g.face] = { o: { ...g.order }, n: 1 }; SAVE.heart = 0; line = '또 올게!'; g.el.querySelector('.mark').innerHTML = art('guest.mark.regular'); } else { if (g.kind === 'regular') SAVE.regs[g.face].n++; SAVE.heart = Math.min(R.TUNE.HEART, SAVE.heart + 1); }
  SAVE.rest = Math.max(0, SAVE.rest - 1); keep(); say(g, line); hearts(true); hammer();
  if (M3 && g.surprise) surprise(g); if (M3) { S.line.push(sold); A.trayAdd(sold); S.log.push({ sold }); }
  leave(g, true); setTimeout(() => { S.busy = false; for (const x of S.q.slice()) soldOut(x); if (M3 && S.line.length >= N5.LINE) lineAsk(); }, 700); }
/** 깜짝 손님: 들고 온 통을 열면 덤 동전 또는 지도 조각(광장 칸). */
function surprise(g){ const PL = wallet.island('plaza'), map = (PL.map | 0) < 4 && Math.random() < .5; S.log.push({ surprise: map ? 'map' : 'coins' }); if (map) { PL.map = (PL.map | 0) + 1; keep(); toast(`${art('map.piece')} 지도 조각!`, 1600); } else { if (dayMode()) { T().till.one += N5.BONUS; dayBar(true); } else pay(N5.BONUS, 'shop', g.el); toast(`${art('coin')} ${N5.BONUS} 덤!`, 1400); } [523, 784, 1047].forEach((f, i) => tone(f, .12, 'triangle', .1, i * .06)); }
/** 줄 끝의 셈: 손님 셋을 보낸 뒤 「모두 몇 개 팔았지?」(값이 붙은 뒤엔 「모두 얼마 받았지?」). 생각하는 동안 손님은 기다려 준다. */
async function lineAsk(){ S.asking = true; const sum = S.line.reduce((a, b) => a + b, 0); S.log.push({ lineAsk: sum }); const job = A.ask({ sum, onPick: (n, right) => { audio(); S.log.push({ pick: n, right }); }, onWrong: () => tone(240, .25, 'sine', .08) }); S.ask = job;
  await job.promise; S.ask = null; tone(880, .12, 'triangle', .1); await wait(900); A.trayClear(); S.line = []; S.asking = false; }
function flyTill(from, n){ const a = from.getBoundingClientRect(), b = $('till').getBoundingClientRect(); for (let i = 0; i < Math.min(6, n); i++) { const c = el('div', 'kit-fly', art('coin')); c.style.left = (a.left + a.width / 2) + 'px'; c.style.top = (a.top + 40) + 'px'; document.body.appendChild(c); setTimeout(() => { c.style.transform = `translate(${b.left - a.left - a.width / 2 + 8}px,${b.top - a.top - 40}px)`; c.style.opacity = .2; }, 40 + i * 60); setTimeout(() => c.remove(), 800 + i * 60); } setTimeout(() => dayBar(true), 550); }

// ── 값 받기 · 거스름
function payMode(){ return R.changeOn(SAVE, S.shop) ? 'change' : 'price'; }
function receipt(o){ return Object.keys(o).map(k => `${pic(k)} ${o[k]}개 <span class="c1" style="width:26px;height:26px;font-size:.8rem;vertical-align:middle;cursor:default">${R.PRICE[k]}</span>씩`).join('<br>'); }
function startPay(g){ const price = R.priceTotal(g.order), c = R.payCoins(price, payMode()); S.payG = g; g.pay = { price, ...c, chg: [] }; g.wait = Math.max(g.wait, .6);
  say(g, receipt(g.order)); g.el.querySelector('.bubble').classList.remove('say'); g.el.querySelector('.bubble').classList.add('wide'); $('basket').hidden = true; $('coinTray').hidden = false; $('give').hidden = true; $('take').hidden = false;
  if (c.change) { $('take').innerHTML = '거스름<br>주기'; $('take').classList.add('long'); $('more').hidden = true; $('trayChg').hidden = false; $('shop').classList.add('paying-change'); if (M3) changeAsk(g); else drawer(); } else { $('take').textContent = '받기'; $('take').classList.remove('long'); $('more').hidden = false; $('trayChg').hidden = true; }
  drawPaid(g); drawChg(g); tone(700, .08, 'sine', .07); }
/** 거스름 식: 낸 돈 − 값 = ? 를 먼저 고르고, 그만큼 서랍에서 꺼낸다. */
async function changeAsk(g){ S.asking = true; $('drawer').innerHTML = ''; const keep0 = [...S.line]; A.trayClear(); A.trayAdd(g.pay.paid, '', '낸 돈'); A.trayAdd(g.pay.price, '−', '값'); const job = A.ask({ sum: g.pay.change, onPick: (n, right) => { audio(); S.log.push({ chgPick: n, right }); }, onWrong: () => { say(g, '음…?'); tone(240, .25, 'sine', .08); } }); S.ask = job;
  await job.promise; S.ask = null; await wait(500); A.trayClear(); S.line = keep0; for (const v of S.line) A.trayAdd(v); S.asking = false; if (S.payG === g) drawer(); }
function drawPaid(g){ const p = g.pay, row = $('trayPaid'); row.innerHTML = coin(10, 'in').repeat(p.ten) + coin(1, 'in').repeat(p.one); row.querySelectorAll('button').forEach(b => b.onclick = e => e.preventDefault()); }
function drawChg(g){ const row = $('trayChg'); row.innerHTML = g.pay.chg.map(v => coin(v, 'in')).join(''); row.querySelectorAll('button').forEach((b, i) => b.onclick = () => { if (S.paused) return; g.pay.chg.splice(i, 1); tone(300, .06, 'sine'); drawChg(g); drawer(); }); }
function drawer(){ const g = S.payG; if (!g) return; const used = v => g.pay.chg.filter(x => x === v).length, d = $('drawer');
  d.innerHTML = `<div class="pile">${coin(10).repeat(R.DRAWER.ten - used(10))}</div><div class="pile">${coin(1).repeat(R.DRAWER.one - used(1))}</div>`;
  d.querySelectorAll('button').forEach(b => b.onclick = () => { if (S.paused || !S.payG) return; audio(); S.payG.pay.chg.push(+b.dataset.v); tone(900, .05, 'square', .05); drawChg(S.payG); drawer(); }); }
function endPay(){ S.payG = null; $('basket').hidden = false; $('coinTray').hidden = true; $('give').hidden = false; $('take').hidden = true; $('more').hidden = true; $('shop').classList.remove('paying-change'); $('trayPaid').innerHTML = ''; $('trayChg').innerHTML = ''; }
$('take').onclick = async () => { const g = S.payG; if (!g || S.busy || S.paused || S.asking) return; audio(); const p = g.pay;
  if (p.change) { const c = p.chg.reduce((a, b) => a + b, 0);
    if (c < p.change) { say(g, '더 줘야지?'); g.el.classList.remove('sad'); void g.el.offsetWidth; g.el.classList.add('sad'); tone(220, .15, 'sine', .08); return; }
    if (c > p.change) { say(g, '너무 많이 줬어!'); g.el.classList.remove('sad'); void g.el.offsetWidth; g.el.classList.add('sad'); tone(220, .15, 'sine', .08); return; }
    SAVE.paid = (SAVE.paid | 0) + 1; endPay(); done(g, p.price); return; }
  if (p.short) { S.busy = true; say(g, '앗, 내가 덜 냈네!'); await wait(700); p.one += p.short; while (p.one >= 10) { p.one -= 10; p.ten++; } p.short = 0; drawPaid(g); tone(900, .05, 'square', .05); await wait(700); S.busy = false; }
  SAVE.paid = (SAVE.paid | 0) + 1; endPay(); done(g, p.price); };
$('more').onclick = async () => { const g = S.payG; if (!g || S.busy || S.paused || g.pay.change) return; audio(); const p = g.pay;
  if (p.short) { say(g, '아, 맞다!'); await wait(450); p.one += p.short; while (p.one >= 10) { p.one -= 10; p.ten++; } p.short = 0; drawPaid(g); tone(900, .05, 'square', .05); g.el.classList.add('happy'); setTimeout(() => g.el.classList.remove('happy'), 1000); }
  else { say(g, '딱 맞게 냈는데?'); $('trayPaid').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 420); } };

// ── 기다림·다음 손님(꾸미는 동안·판이 떠 있는 동안은 멈춘다)
setInterval(() => { if (S.paused || S.asking) return; const qcap = R.queueCap(SAVE) + (M3 && S.fair > 0 ? N5.FAIR_CAP : 0);
  /* N05: 생각할 시간이 다 돼 가면 북소리(가장 급한 손님 기준, 빨라짐) */ if (M3 && !CALM) { const ws = S.q.filter(g => !g.leaving && S.payG !== g).map(g => g.wait), m = ws.length ? Math.min(...ws) : 1; S.beat = (S.beat || 0) - .1; if (m < N5.DRUM && S.beat <= 0) { S.beat = .25 + m * 3; tone(96, .09, 'sine', .16); tone(72, .12, 'sine', .12, .09); S.drums = (S.drums | 0) + 1; } }
  for (const g of S.q.slice()) { if (g.leaving || S.payG === g) continue; if (!CALM) g.wait -= .1 / g.dur; const w = g.el.querySelector('.wait i'); w.style.width = Math.max(0, g.wait * 100) + '%'; w.style.background = g.wait < .3 ? '#ffb347' : '#35d07f'; if (g.wait <= 0 && !(S.busy && S.sel === g)) leave(g, false); }
  if (dayMode()) { if (T().phase !== 'open') return; if (nextPlan() < 0) { if (!S.q.length && !S.payG && !S.busy) evening(); return; } }
  else if (R.dayOn(O(), 'fruit') && !S.q.length && !S.payG && !S.busy) { morning(); return; }
  S.nextIn -= .1; if (S.nextIn <= 0 && S.q.length < qcap) { arrive(); S.nextIn = R.gapSec(O()) * (M3 ? M5.gapMul(S.fair, S.streak) : 1); } else if (S.nextIn <= 0) S.nextIn = .5; }, 100);

// ── 판(꾸미기 · 아침 · 저녁)
function sheet(html, cls = ''){ $('sheetCard').innerHTML = html; const s = $('sheet'); s.className = 'sheet on ' + cls; S.paused = true; S.panel = cls || 'deco'; }
function closeSheet(){ $('sheet').className = 'sheet'; S.paused = false; S.panel = null; }
function itemPic(c){ if (c.id !== 'fruit') return art(c.art); const ch = R.choices(O(), 'fruit'); return `<span style="font-size:${ch.length > 2 ? .62 : .8}em">${ch.map(f => pic(f)).join('')}</span>`; }
function openSheet(){ if (S.panel && S.panel !== 'deco') return; audio(); const offs = R.offers(O()), c = wallet.coins();
  if (SAVE.rest > 0) { const b = $('hammer'); b.classList.remove('glow'); b.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], 360); tone(240, .1, 'sine', .06); return; }
  const items = offs.map(x => `<button class="item${x.price > c ? ' no' : ''}" data-id="${x.id}"><span class="pic">${itemPic(x)}</span><b>${x.name}</b><span class="price">${art('coin')} ${x.price}</span><span class="more">${x.price > c ? `${x.price - c}개 더` : ''}</span></button>`).join('');
  sheet(`<h2>${art('shop.hammer')} 가게 꾸미기</h2>` + (offs.length ? `<div class="items">${items}</div>` : '<div class="empty">가게를 다 꾸몄어!</div>') + '<button class="close" id="sheetClose">닫기</button>');
  $('sheetClose').onclick = closeSheet; $('sheetCard').querySelectorAll('.item').forEach(b => b.onclick = () => { const x = offs.find(o => o.id === b.dataset.id); if (x.price > wallet.coins()) { b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], 300); tone(220, .12, 'sine', .07); return; } x.choose ? choose(x) : doBuy(x.id); }); }
function choose(x){ const ch = R.choices(O(), x.id), opt = v => x.id === 'fruit' ? `<span class="pic">${pic(v)}</span><b>${NAMEX[v]}</b>` : `<span class="pic">${art('shop.sign')}</span><b>${v}</b>`;
  sheet(`<h2>${art('shop.hammer')} ${x.id === 'fruit' ? '어떤 과일?' : '어떤 간판?'}</h2><div class="items">${ch.map(v => `<button class="item pick" data-v="${v}">${opt(v)}<span class="price">${art('coin')} ${x.price}</span></button>`).join('')}</div><button class="close" id="sheetBack">뒤로</button>`);
  $('sheetBack').onclick = openSheet; $('sheetCard').querySelectorAll('.item').forEach(b => b.onclick = () => doBuy(x.id, b.dataset.v)); }
function doBuy(id, pick){ const price = R.priceOf(O(), id), c = R.CATALOG.find(c => c.id === id); if (!wallet.spend(price)) return; const msg = R.buy(SAVE, id, pick); keep(); closeSheet(); look();
  if (id === 'fruit') shelf(pick); else if (id === 'box' && S.shop === 'fruit') shelf('box'); grew(c.math ? '가게가 커졌어!' : '가게가 예뻐졌어!', msg);
  if (R.bakeryOpen(O()) && !SAVE.bakery) { SAVE.bakery = 1; keep(); setTimeout(() => grew('빵집 문이 열렸어!', '아침에 어느 가게를 열지 골라'), 3000); } }
$('hammer').onclick = openSheet;
wallet.onChange(() => hammer());

// ── 아침: 오늘 필요한 만큼 상자를 수레에 싣는다
function morning(){ if (!T() || T().phase === 'done') { const shop = S.shop === 'bakery' && R.bakeryOpen(O()) ? 'bakery' : 'fruit'; newDay(shop); } S.shop = T().shop; look(); drawMorning(); }
function newDay(shop){ const d = R.planDay(SAVE, shop); SAVE.days = (SAVE.days | 0); SAVE.today = { n: SAVE.days + 1, shop, phase: 'morning', plan: d.plan.map(p => ({ ...p, done: false })), need: d.need, loaded: 0, stock: 0, till: { ten: 0, one: 0 }, served: 0, out: 0 }; keep(); }
function drawMorning(){ const t = T(), k = R.STOCK[t.shop], max = R.DAY.BOXES * 10, okNow = t.loaded * 10 >= t.need;
  const sel = R.bakeryOpen(O()) ? `<div class="shopsel"><button data-shop="fruit" class="${t.shop === 'fruit' ? 'on' : ''}">${pic('apple')} 과일 가게</button><button data-shop="bakery" class="${t.shop === 'bakery' ? 'on' : ''}">${pic('bread')} 빵집</button></div>` : '';
  const box = i => `<button class="bx" data-i="${i}">${art('shop.box')}<small>${pic(k)} 10</small></button>`;
  sheet(`<h2>${art('day.morning')} 아침</h2>${sel}<div class="memo">${art('shop.memo')} 오늘은 ${pic(k)} ${t.need}개가 필요해</div>
    <div class="load"><div class="boxes" id="mPile">${Array.from({ length: R.DAY.BOXES - t.loaded }, (_, i) => box(i)).join('')}</div><div class="cart"><div class="on" id="mCart">${Array.from({ length: t.loaded }, (_, i) => `<button class="bx" data-c="${i}">${art('shop.box')}<small>${(i + 1) * 10}</small></button>`).join('')}</div><span class="cartpic">${art('shop.cart')}</span></div></div>
    <div class="meter${okNow ? ' ok' : ''}"><i style="width:${t.loaded * 10 / max * 100}%"></i><b style="left:${t.need / max * 100}%"></b></div>
    <button class="go-open" id="mOpen">가게 열기!</button>`, 'day');
  $('sheetCard').querySelectorAll('[data-shop]').forEach(b => b.onclick = () => { if (b.dataset.shop === t.shop) return; audio(); newDay(b.dataset.shop); S.shop = T().shop; look(); drawMorning(); });
  $('mPile').querySelectorAll('.bx').forEach(b => b.onclick = () => { audio(); t.loaded++; keep(); tone(420 + t.loaded * 50, .08, 'square', .06); drawMorning(); });
  $('mCart').querySelectorAll('.bx').forEach(b => b.onclick = () => { audio(); t.loaded = Math.max(0, t.loaded - 1); keep(); tone(300, .06, 'sine'); drawMorning(); });
  $('mOpen').onclick = () => { audio(); t.stock = t.loaded * 10; t.phase = 'open'; keep(); closeSheet(); S.nextIn = .6; look(); sfx.grew(); toast(t.shop === 'bakery' ? '빵집 문을 열었어!' : '가게 문을 열었어!', 1400); }; }

// ── 저녁: 오늘 받은 돈 — 10원짜리는 바로 금고에, 1원짜리는 열 개씩 쌓아서
const E = { ten: 0, one: 0, stack: 0, bund: 0, loose: 0, timer: 0 };
function evening(){ const t = T(); t.phase = 'evening'; keep(); if (M3) { A.trayClear(); S.line = []; }   /* 저녁엔 낮의 줄 셈 띠를 접는다 */ Object.assign(E, { ten: t.till.ten, one: t.till.one, stack: 0, bund: 0, loose: 0 }); drawEvening(); }
function drawEvening(){ const t = T(), left = t.stock > 0 ? `<small>${pic(R.STOCK[t.shop])} ${t.stock}개가 남았어</small>` : t.out ? `<small>${pic(R.STOCK[t.shop])} 다 팔렸어!</small>` : '';
  sheet(`<h2>${art('day.evening')} 저녁</h2><div class="eve"><div class="heap" id="eHeap"><div class="tens" id="eTens"></div></div><div class="stack" id="eStack"></div><div class="safe"><div class="bund" id="eBund"></div><span class="pic">${art('shop.safe')}</span></div></div><div class="evsum" id="eSum">${left}</div><button class="go-open" id="eNext" hidden>내일 또!</button>`, 'night');
  const heap = $('eHeap'); let hold = 0; const startHold = e => { e.preventDefault(); audio(); move1(); clearInterval(E.timer); E.timer = setInterval(() => { if (!move1()) clearInterval(E.timer); }, 90); hold = 1; }, stopHold = () => { clearInterval(E.timer); hold = 0; };
  heap.addEventListener('pointerdown', e => { if (e.target.closest('.c10')) return; startHold(e); }); heap.addEventListener('pointerup', stopHold); heap.addEventListener('pointerleave', stopHold); heap.addEventListener('pointercancel', stopHold);
  $('eStack').onclick = () => { if (!E.one && !E.ten && E.stack) toSafeLoose(); };
  $('eNext').onclick = () => { audio(); SAVE.days = (SAVE.days | 0) + 1; T().phase = 'done'; keep(); closeSheet(); morning(); };
  drawHeap(); drawStack(); drawSafe(); if (!E.one && !E.ten) after(); }
function drawHeap(){ const h = $('eHeap'); if (!h) return; h.querySelectorAll('.c1').forEach(c => c.remove()); const n = Math.min(E.one, 60), W = h.clientWidth || 200, H = h.clientHeight || 150, top = E.ten ? 26 : 0;
  for (let i = 0; i < n; i++) { const c = el('span', 'c1', '1'); const a = (i * 137.5) % 360 * Math.PI / 180, r = Math.sqrt((i + .5) / Math.max(n, 12)) * Math.min(W, H - top) * .46; c.style.left = Math.max(2, Math.min(W - 36, W / 2 - 17 + Math.cos(a) * r * 1.25)) + 'px'; c.style.top = Math.max(top + 2, Math.min(H - 36, top + (H - top) / 2 - 17 + Math.sin(a) * r * .8)) + 'px'; h.appendChild(c); }
  const tens = $('eTens'); tens.innerHTML = coin(10).repeat(E.ten); tens.querySelectorAll('.c10').forEach(b => b.onclick = e => { e.stopPropagation(); audio(); if (!E.ten) return; E.ten--; T().till.ten--; toBundle(); drawHeap(); }); }
function drawStack(){ const s = $('eStack'); if (s) s.innerHTML = '<span class="c1">1</span>'.repeat(E.stack); }
function drawSafe(){ const b = $('eBund'); if (b) b.innerHTML = '<u></u>'.repeat(E.bund) + '<u class="l"></u>'.repeat(E.loose); }
function move1(){ if (!E.one || E.stack >= 10) return false; E.one--; E.stack++; tone(500 + E.stack * 60, .05, 'square', .05); drawHeap(); drawStack();
  if (E.stack === 10) { clearInterval(E.timer); setTimeout(() => { E.stack = 0; T().till.one -= 10; toBundle(); drawStack(); }, 260); return false; } if (!E.one && !E.ten) setTimeout(toSafeLoose, 700); return true; }
function toBundle(){ E.bund++; keep(); sfx.coin(); drawSafe(); pay(10, 'shop', $('eBund')); after(); }
function toSafeLoose(){ if (!E.stack) return; const n = E.stack; E.loose += n; E.stack = 0; T().till.one -= n; tone(700, .1, 'triangle', .1); drawStack(); drawSafe(); pay(n, 'shop', $('eBund')); after(); }
function after(){ if (E.one || E.ten || E.stack) return; const n = E.bund * 10 + E.loose, t = T(); $('eSum').innerHTML = `${art('shop.safe')} ${n}` + `<small>${E.bund ? `10이 ${E.bund}묶음` : ''}${E.bund && E.loose ? ' · ' : ''}${E.loose ? `낱개 ${E.loose}` : ''}</small>`;
  $('eNext').hidden = false; keep(); sfx.win(); }

// ── 시작
if (dayMode()) S.shop = T().shop;
paint(); hud(M3 ? { back: { href: '/math/play/plaza/', label: '← 광장' } } : undefined); look(); drawBasket();
if (dayMode()) { if (T().phase === 'morning') morning(); else if (T().phase === 'evening') evening(); }
else if (R.dayOn(O(), 'fruit')) morning();
window.__shop = { L, goodsM, S, SAVE, R, wallet, put, unput, select, openSheet, doBuy, arrive, matches, count, morning, evening, E, T, M3, ARTN, NAMEX, M5, CALM };
