/* 가게 섬 — 줄 선 손님이 원하는 만큼 과일을 바구니에 담아 건넨다. 문제 창·채점 없음:
 * 모자라면 「더 줘」, 넘치면 「너무 많아」 하고 기다릴 뿐. 손님이 그냥 가도 벌은 없다(단골 하트만 덜 찬다).
 * 번 동전으로 「가게 꾸미기」에서 아이가 골라 산다 — 산 것대로 가게가 바뀌고 주문이 커진다(규칙은 ./rules.js).
 * 틀(위쪽 띠·동전·알림·효과음·「커졌어!」)은 ../common/kit.js, 그림은 ../common/art.js. 산 것·하트·단골은 지갑의 가게 칸에 남는다. */
import { wallet, art, arts, group, paint, hud, pay, grew, did, audio, tone, sfx } from '../common/kit.js?v=3';
import * as R from './rules.js?v=1';
const $ = id => document.getElementById(id), one = a => a[Math.floor(Math.random() * a.length)];
const FRUIT = { apple: 'fruit.apple', orange: 'fruit.orange', banana: 'fruit.banana', grape: 'fruit.grape' }, pic = k => art(FRUIT[k]), FACES = group('guest');
const SAVE = R.migrate(wallet.island('shop')), O = () => SAVE.owned;
const S = { q: [], sel: null, basket: [], paused: false, busy: false, nextIn: .6, id: 0 };
function keep(){ wallet.save(); }
const count = k => S.basket.reduce((n, b) => n + (b.k === k ? b.n : 0), 0), total = o => Object.values(o).reduce((a, b) => a + b, 0);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// ── 가게 모습: 산 것대로
function look(){ const o = O(), roof = $('roof');
  $('shopName').textContent = R.shopName(o); roof.classList.toggle('sign', !!o.sign); roof.classList.toggle('awning', !!o.awning); $('bell').hidden = !o.bell; $('lamp').hidden = !o.lamp;
  $('shop').classList.toggle('has-pot', !!o.pot); $('basket').classList.toggle('big', !!o.basket); shelf(); hearts(); hammer(); }
function shelf(fresh){ const o = O(), sh = $('shelf'); sh.innerHTML = '';
  for (const k of R.crates(o)) { const b = el('button', 'crate', pic(k)); b.dataset.k = k; b.onclick = () => put(k, 1); sh.appendChild(b); }
  if (o.box) { const b = el('button', 'crate', `${art('shop.box')}<small>${pic('apple')} 10개</small>`); b.dataset.k = 'box'; b.onclick = () => put('apple', 10); sh.appendChild(b); }
  if (fresh) { const b = sh.querySelector(`[data-k="${fresh}"]`); if (b) b.classList.add('new'); } }
function hearts(up){ const h = $('hearts'); h.innerHTML = arts('shop.heart', SAVE.heart) + arts('shop.heart.empty', R.TUNE.HEART - SAVE.heart); if (up) { h.classList.remove('up'); void h.offsetWidth; h.classList.add('up'); } }
function hammer(){ const b = $('hammer'), rest = SAVE.rest > 0, offs = R.offers(O()); b.classList.toggle('rest', rest); b.hidden = !offs.length && !rest;
  $('restPips').innerHTML = rest ? Array.from({ length: R.TUNE.REST }, (_, i) => `<u class="${i < R.TUNE.REST - SAVE.rest ? 'on' : ''}"></u>`).join('') : '';
  b.classList.toggle('glow', !rest && offs.some(c => c.price <= wallet.coins())); }

// ── 바구니
function drawBasket(){ const b = $('basket'); b.innerHTML = ''; S.basket.forEach((x, i) => { const s = el('span', x.n === 10 ? 'box' : '', x.n === 10 ? arts(FRUIT[x.k], 5) + '<br>' + arts(FRUIT[x.k], 5) : pic(x.k)); s.onclick = () => { if (S.busy || S.paused) return; S.basket.splice(i, 1); tone(300, .06, 'sine'); drawBasket(); }; b.appendChild(s); });
  const g = S.sel; $('give').classList.toggle('glow', !!g && g.hint > 1 && matches(g.order)); }
const slots = () => S.basket.reduce((a, b) => a + (b.n === 10 ? 5 : 1), 0);
function put(k, n){ if (S.busy || S.paused || !S.q.length) return; audio(); if (slots() + (n === 10 ? 5 : 1) > R.basketCap(O())) { tone(180, .1, 'sine', .06); return; } S.basket.push({ k, n }); tone(520 + S.basket.length * 30, .07, 'square', .05); drawBasket(); }
const matches = o => [...new Set([...Object.keys(o), ...S.basket.map(b => b.k)])].every(k => count(k) === (o[k] || 0)) && S.basket.length > 0;

// ── 손님
function orderHtml(o){ return Object.keys(o).map(k => R.pics(O()) && total(o) <= 6 ? `<span class="pics">${arts(FRUIT[k], o[k])}</span>` : `${pic(k)} ${o[k]}`).join('<br>'); }
function bubble(g, extra){ let h;
  if (g.kind === 'regular' && !g.reveal) h = '늘 먹던 걸로!' + (g.firstUsual ? `<em>${orderHtml(g.order)}</em>` : '');
  else h = orderHtml(g.order);
  const b = g.el.querySelector('.bubble'); b.innerHTML = h + (extra ? `<small>${extra}</small>` : ''); b.classList.toggle('say', g.kind === 'regular' || !!extra); }
function select(g){ if (!g || g.leaving) return; S.sel = g; for (const x of S.q) x.el.classList.toggle('sel', x === g); drawBasket(); }
function arrive(){ const regsOut = Object.keys(SAVE.regs).filter(f => !S.q.some(g => g.face === f)), n = R.nextGuest(SAVE, regsOut);
  const busyFaces = new Set([...S.q.map(g => g.face), ...Object.keys(SAVE.regs)]), face = n.reg || one(FACES.filter(f => !busyFaces.has(f)));
  const kind = n.kind, g = { id: ++S.id, face, kind, newReg: n.newReg, wait: 1, hint: 0, leaving: false, el: el('div', 'guest out', '<div class="bubble"></div><span class="face"></span><span class="mark"></span><div class="wait"><i></i></div>') };
  if (kind === 'regular') { const r = SAVE.regs[face]; g.order = { ...r.o }; g.firstUsual = r.n <= 1; } else g.order = R.orderFor(O(), kind);
  g.dur = R.waitSec(O(), kind); g.el.querySelector('.face').innerHTML = art(face); g.el.querySelector('.mark').innerHTML = kind === 'hurry' ? art('guest.mark.hurry') : kind === 'regular' ? art('guest.mark.regular') : '';
  g.el.dataset.kind = kind; g.el.dataset.id = g.id; g.el.addEventListener('pointerdown', e => { e.preventDefault(); audio(); select(g); }); bubble(g); $('line').appendChild(g.el); S.q.push(g);
  requestAnimationFrame(() => requestAnimationFrame(() => g.el.classList.remove('out'))); if (!S.sel) select(g); else select(S.sel);
  tone(880, .08, 'sine', .08); tone(1175, .12, 'sine', .08, .1); if (O().bell) { const b = $('bell'); b.classList.remove('ring'); void b.offsetWidth; b.classList.add('ring'); } }
function leave(g, happy){ g.leaving = true; S.q = S.q.filter(x => x !== g); if (S.sel === g) { S.sel = null; if (S.q.length) select(S.q[0]); }
  if (!happy) { g.el.querySelector('.bubble').innerHTML = '다음에 올게…'; SAVE.heart = Math.max(0, SAVE.heart - 1); keep(); hearts(); }
  setTimeout(() => g.el.classList.add('bye'), happy ? 900 : 500); setTimeout(() => { g.el.remove(); if (!S.sel && S.q.length) select(S.q[0]); }, happy ? 1500 : 1100);
  if (!S.q.length) S.nextIn = Math.min(S.nextIn, R.TUNE.GAP_EMPTY + (happy ? .8 : 0)); }
$('give').onclick = () => { const g = S.sel; if (S.busy || S.paused || !g || g.leaving) return; audio(); if (!S.basket.length) return;
  const o = g.order, keys = new Set([...Object.keys(o), ...S.basket.map(b => b.k)]); let less = null, more = null; for (const k of keys) { const d = count(k) - (o[k] || 0); if (d < 0 && !less) less = k; if (d > 0 && !more) more = k; }
  if (!less && !more) { S.busy = true; const n = total(o) + (g.kind === 'hurry' ? R.TUNE.HURRY_BONUS : 0); g.el.classList.add('happy'); sfx.yes(); pay(n, 'shop', g.el); did('shop.guest');
    let say = '고마워!'; if (g.newReg) { SAVE.regs[g.face] = { o: { ...o }, n: 1 }; SAVE.heart = 0; say = '또 올게!'; g.el.querySelector('.mark').innerHTML = art('guest.mark.regular'); } else { if (g.kind === 'regular') SAVE.regs[g.face].n++; SAVE.heart = Math.min(R.TUNE.HEART, SAVE.heart + 1); }
    SAVE.rest = Math.max(0, SAVE.rest - 1); keep(); g.el.querySelector('.bubble').innerHTML = say; S.basket = []; drawBasket(); hearts(true); hammer(); leave(g, true); setTimeout(() => { S.busy = false; }, 700); return; }
  g.hint++; g.el.classList.remove('sad'); void g.el.offsetWidth; g.el.classList.add('sad'); tone(200, .2, 'sine', .1);
  if (g.kind === 'regular' && !g.reveal) { g.reveal = true; bubble(g, '늘 먹던 건 이거야'); } else bubble(g, less ? `${pic(less)} 더 줘` : `${pic(more)} 너무 많아`); drawBasket(); };

// ── 기다림·다음 손님(꾸미는 동안은 멈춘다)
setInterval(() => { if (S.paused) return; const cap = R.queueCap(SAVE);
  for (const g of S.q.slice()) { if (g.leaving) continue; g.wait -= .1 / g.dur; const w = g.el.querySelector('.wait i'); w.style.width = Math.max(0, g.wait * 100) + '%'; w.style.background = g.wait < .3 ? '#ffb347' : '#35d07f'; if (g.wait <= 0 && !(S.busy && S.sel === g)) leave(g, false); }
  S.nextIn -= .1; if (S.nextIn <= 0 && S.q.length < cap) { arrive(); S.nextIn = R.gapSec(O()); } else if (S.nextIn <= 0) S.nextIn = .5; }, 100);

// ── 가게 꾸미기
function sheet(html){ $('sheetCard').innerHTML = html; $('sheet').classList.add('on'); S.paused = true; }
function closeSheet(){ $('sheet').classList.remove('on'); S.paused = false; }
function itemPic(c){ if (c.id !== 'fruit') return art(c.art); const ch = R.choices(O(), 'fruit'); return `<span style="font-size:${ch.length > 2 ? .62 : .8}em">${ch.map(f => pic(f)).join('')}</span>`; }
function openSheet(){ audio(); const offs = R.offers(O()), c = wallet.coins();
  if (SAVE.rest > 0) { const b = $('hammer'); b.classList.remove('glow'); b.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], 360); tone(240, .1, 'sine', .06); return; }
  const items = offs.map(x => `<button class="item${x.price > c ? ' no' : ''}" data-id="${x.id}"><span class="pic">${itemPic(x)}</span><b>${x.name}</b><span class="price">${art('coin')} ${x.price}</span><span class="more">${x.price > c ? `${x.price - c}개 더` : ''}</span></button>`).join('');
  sheet(`<h2>${art('shop.hammer')} 가게 꾸미기</h2>` + (offs.length ? `<div class="items">${items}</div>` : '<div class="empty">가게를 다 꾸몄어!</div>') + '<button class="close" id="sheetClose">닫기</button>');
  $('sheetClose').onclick = closeSheet; $('sheetCard').querySelectorAll('.item').forEach(b => b.onclick = () => { const x = offs.find(o => o.id === b.dataset.id); if (x.price > wallet.coins()) { b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], 300); tone(220, .12, 'sine', .07); return; } x.choose ? choose(x) : doBuy(x.id); }); }
function choose(x){ const ch = R.choices(O(), x.id), opt = v => x.id === 'fruit' ? `<span class="pic">${pic(v)}</span><b>${R.NAME[v]}</b>` : `<span class="pic">${art('shop.sign')}</span><b>${v}</b>`;
  sheet(`<h2>${art('shop.hammer')} ${x.id === 'fruit' ? '어떤 과일?' : '어떤 간판?'}</h2><div class="items">${ch.map(v => `<button class="item pick" data-v="${v}">${opt(v)}<span class="price">${art('coin')} ${x.price}</span></button>`).join('')}</div><button class="close" id="sheetBack">뒤로</button>`);
  $('sheetBack').onclick = openSheet; $('sheetCard').querySelectorAll('.item').forEach(b => b.onclick = () => doBuy(x.id, b.dataset.v)); }
function doBuy(id, pick){ const price = R.priceOf(O(), id), c = R.CATALOG.find(c => c.id === id); if (!wallet.spend(price)) return; const msg = R.buy(SAVE, id, pick); keep(); closeSheet(); look();
  if (id === 'fruit') shelf(pick); else if (id === 'box') shelf('box'); grew(c.math ? '가게가 커졌어!' : '가게가 예뻐졌어!', msg); }
$('hammer').onclick = openSheet;
wallet.onChange(() => hammer());

paint(); hud(); look(); drawBasket();
window.__shop = { S, SAVE, R, wallet, put, select, openSheet, doBuy, arrive, matches, count };
