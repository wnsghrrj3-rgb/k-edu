/* 낚시 섬 — 헤엄치는 수 물고기를 눌러 낚는다. 낚은 수만큼 통이 찬다. 통을 다 딱 채우면 배가 장에 보내고 새 통이 온다.
 * 넘치게 낚으면 통이 기우뚱하고 물고기가 도로 뛰어 나간다(문제 창·채점 없음).
 * M04 번 동전으로 「배 꾸미기」(가게와 같은 부품 ../common/upgrade.js) — 산 것이 걸음: 큰 통 · 큰 미끼 · 둘째 통 · 아주 큰 통 · 주문 배 ·
 *     황금 물고기(남은 만큼 딱) · 복어(들어가면 +1) · 게(통에서 하나 집어 감) · 그물(끌어서 여러 마리) · 등불(밤낚시). 처음 낚은 종류는 도감에.
 * 규칙은 ./rules.js. 틀은 ../common/kit.js, 그림은 ../common/art.js. 산 것·보낸 배는 지갑의 낚시 칸에 남는다. */
import { wallet, art, paint, hud, pay, toast, grew, did, audio, tone, sfx } from '../common/kit.js?v=3';
import * as UP from '../common/upgrade.js?v=1';
import * as R from './rules.js?v=1';
const $ = id => document.getElementById(id);
const PLAIN = ['fish.blue', 'fish.tropical', 'fish.shrimp', 'fish.octopus'], SPECIAL = { gold: 'fish.gold', puffer: 'fish.puffer', crab: 'fish.crab' };
const SAVE = R.migrate(wallet.island('fish')), O = () => SAVE.owned;
const S = { tubs: [], sel: 0, fish: [], busy: false, paused: false, id: 0, net: null };
function keep(){ wallet.save(); }
function say(t){ const e = $('say'); e.textContent = t; e.style.opacity = 1; clearTimeout(say.t); say.t = setTimeout(() => e.style.opacity = 0, 1400); }
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// ── 배 모습
function look(){ const o = O(), b = $('boat'); b.classList.toggle('big', !!o.tub20); b.classList.toggle('lamp', !!o.lamp); b.classList.toggle('net', !!o.net);
  $('nightBtn').hidden = !o.lamp; document.documentElement.classList.toggle('night', !!(o.lamp && SAVE.night)); hammer(); }
function hammer(){ UP.hammer($('hammer'), { rest: SAVE.rest, REST: R.TUNE.REST, offers: R.offers(O()), coins: wallet.coins() }); }
function drawTubs(){ const box = $('tubs'); box.innerHTML = ''; S.tubs.forEach((t, i) => {
    const e = el('div', 'tub' + (t.kind === 'order' ? ' order' : '') + (i === S.sel && S.tubs.length > 1 ? ' sel' : '') + (R.left(t) === 0 ? ' done' : '')); e.dataset.i = i;
    if (t.kind === 'order') e.innerHTML = `<div class="lid">${t.cap}</div><div class="chips">${t.fill.map(v => `<u>${v}</u>`).join('')}</div>`;
    else { const big = t.cap > 10, cols = big ? 10 : 5, sz = big ? 'clamp(14px,2.6vw,26px)' : (S.tubs.length > 1 ? 'clamp(18px,3.4vw,30px)' : 'clamp(22px,4.4vw,34px)'); e.style.gridTemplateColumns = `repeat(${cols},${sz})`; let k = 0;
      t.fill.forEach((n, j) => { for (let q = 0; q < n; q++, k++) e.appendChild(el('i', 'on c' + (j % 4))); }); for (; k < t.cap; k++) e.appendChild(el('i')); }
    e.addEventListener('pointerdown', ev => { ev.preventDefault(); audio(); pick(i); }); box.appendChild(e); }); }
function pick(i){ if (R.left(S.tubs[i]) === 0) { const j = S.tubs.findIndex(t => R.left(t) > 0); if (j >= 0) i = j; } S.sel = i; tone(660, .05, 'sine', .05); drawTubs(); }
const selTub = () => S.tubs[S.sel];
function newTubs(){ S.tubs = R.tubsFor(O()); S.sel = 0; drawTubs(); }

// ── 물고기
function fishHtml(f){ const a = f.kind === 'plain' ? PLAIN[(f.v + f.id) % PLAIN.length] : SPECIAL[f.kind]; f.art = a;
  const badge = f.kind === 'gold' ? '?' : f.kind === 'crab' ? '−' : f.v; return `<span class="e">${art(a)}</span><b>${badge}</b>` + (f.kind === 'plain' && f.v <= 5 ? `<small>${'<u></u>'.repeat(f.v)}</small>` : ''); }
function spawn(first){ const k = R.spawnFish(O(), S.tubs, S.fish), dir = Math.random() < .5 ? 1 : -1, W = innerWidth, H = innerHeight;
  const f = { id: ++S.id, kind: k.kind, v: k.v, dir, x: first ? Math.random() * W : (dir > 0 ? -90 : W + 90), y: H * (.48 + Math.random() * .4), sp: (38 + Math.random() * 46) * R.speed(O()), ph: Math.random() * 6, el: document.createElement('button') };
  const size = 46 + (f.kind === 'plain' || f.kind === 'puffer' ? f.v : 4) * 7; f.el.className = 'fish ' + (f.kind === 'gold' ? 'gold' : f.kind === 'crab' ? 'crab' : ''); f.el.style.setProperty('--s', size + 'px'); f.el.style.setProperty('--f', dir > 0 ? -1 : 1); f.el.innerHTML = fishHtml(f); f.el.dataset.id = f.id; f.el.dataset.kind = f.kind;
  f.el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); hook(f); }); document.body.appendChild(f.el); S.fish.push(f); }
function reface(f, kind, v){ f.kind = kind; f.v = v; f.el.className = 'fish'; f.el.dataset.kind = kind; f.el.innerHTML = fishHtml(f); }
function lineTo(f){ const bk = $('tubs').getBoundingClientRect(), r = f.el.getBoundingClientRect(), line = $('line'), bx = bk.left + bk.width / 2, by = bk.bottom, fx = r.left + r.width / 2, fy = r.top + r.height / 2;
  Object.assign(line.style, { left: bx + 'px', top: by + 'px', height: Math.hypot(fx - bx, fy - by) + 'px', transform: `rotate(${Math.atan2(bx - fx, fy - by)}rad)`, opacity: .9 }); setTimeout(() => line.style.opacity = 0, 380); }
function bookIt(f){ if (wallet.collect('fish', f.art)) setTimeout(() => toast(`${art('book.new')} 새 물고기! ${art(f.art)} 도감에 넣었어`, 1800), 450); }
function hook(f){ if (f.caught || S.busy || S.paused || S.net) return; audio(); const t = selTub(); lineTo(f);
  if (!R.fits(f, t)) { f.el.classList.remove('back'); void f.el.offsetWidth; f.el.classList.add('back'); const te = $('tubs').children[S.sel]; te.classList.remove('tip'); void te.offsetWidth; te.classList.add('tip');
    if (f.kind === 'crab') say('게가 집을 게 없어!'); else if (f.kind === 'puffer' && f.v + 1 > R.left(t) && f.v <= R.left(t)) { f.el.classList.add('puff'); setTimeout(() => f.el.classList.remove('puff'), 600); say('복어가 부풀어서 넘쳐!'); } else say(`${R.worth(f, t) - R.left(t)}칸이 모자라!`);
    tone(220, .25, 'sine', .1, 0, 140); f.dir *= -1; f.el.style.setProperty('--f', f.dir > 0 ? -1 : 1); f.sp *= 1.6; return; }
  f.caught = true; const bk = $('tubs').children[S.sel].getBoundingClientRect(), r = f.el.getBoundingClientRect(); f.el.classList.add('up'); f.el.style.left = (bk.left + bk.width / 2 - r.width / 2) + 'px'; f.el.style.top = (bk.top - 10) + 'px'; tone(520, .12, 'sine', .1, 0, 1040);
  const res = R.catchInto(f, t); S.busy = true; bookIt(f);
  setTimeout(() => { f.el.remove(); S.fish = S.fish.filter(x => x !== f); S.busy = false;
    if (f.kind === 'crab') { say(`게가 ${res.took}을 집어 갔어!`); flyBack(res.took); tone(300, .15, 'sawtooth', .06, 0, 180); }
    else { if (f.kind === 'puffer') say('복어가 부풀었다! ' + (f.v + 1)); if (f.kind === 'gold') say('반짝! 딱 맞아!'); tone(700 + R.sum(t) * 30, .08, 'square', .06); }
    afterCatch(); }, 430); }
function flyBack(v){ const bk = $('tubs').children[S.sel].getBoundingClientRect(), e = el('div', 'flyfish', art(PLAIN[v % PLAIN.length])); e.style.left = bk.left + bk.width / 2 + 'px'; e.style.top = bk.top + 'px'; document.body.appendChild(e); requestAnimationFrame(() => { e.style.transform = `translate(${(Math.random() - .5) * 200}px,${innerHeight * .35}px)`; e.style.opacity = 0; }); setTimeout(() => e.remove(), 600); }
function afterCatch(){ drawTubs(); const t = selTub(); if (R.left(t) === 0) { const j = S.tubs.findIndex(x => R.left(x) > 0); if (j >= 0) { S.sel = j; say('다른 통도 채워!'); drawTubs(); } }
  if (S.tubs.every(x => R.left(x) === 0)) full(); }
function full(){ S.busy = true; $('cat').classList.remove('yay'); void $('cat').offsetWidth; $('cat').classList.add('yay'); say('가득 찼다!'); sfx.yes();
  const n = R.coinsFor(S.tubs), expr = S.tubs.map(t => t.fill.join(' + ') + ' = ' + t.cap).join('   ·   '); setTimeout(() => { [...$('tubs').children].forEach(e => e.classList.add('go')); toast(expr, 1600); }, 500);
  setTimeout(() => { pay(n, 'fish', $('boat')); did('fish.bucket', S.tubs.length); SAVE.sent = (SAVE.sent | 0) + 1; SAVE.rest = Math.max(0, SAVE.rest - 1); keep(); hammer();
    newTubs(); const b = $('tubs'); b.style.transition = 'none'; b.style.transform = 'translate(-60vw,0)'; b.style.opacity = 0; requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transition = 'transform .5s,opacity .5s'; b.style.transform = ''; b.style.opacity = 1; setTimeout(() => { b.style.transition = ''; S.busy = false; }, 520); })); }, 1400); }

// ── 그물: 바다를 끌어서 지나간 물고기를 한 번에(합이 통에 들어갈 때만 걸림)
const sea = $('sea');
sea.addEventListener('pointerdown', e => { if (!O().net || S.busy || S.paused) return; e.preventDefault(); audio(); S.net = [[e.clientX, e.clientY]]; sea.setPointerCapture(e.pointerId); drawNet(); });
sea.addEventListener('pointermove', e => { if (!S.net) return; const p = S.net[S.net.length - 1]; if (Math.hypot(e.clientX - p[0], e.clientY - p[1]) > 8) { S.net.push([e.clientX, e.clientY]); drawNet(); } });
const endNet = () => { if (!S.net) return; const pts = S.net; S.net = null; $('netLine').setAttribute('points', ''); S.fish.forEach(f => f.el.classList.remove('netted')); castNet(pts); };
sea.addEventListener('pointerup', endNet); sea.addEventListener('pointercancel', endNet);
function netted(pts){ return S.fish.filter(f => { if (f.caught) return false; const r = f.el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; return pts.some(([x, y]) => Math.hypot(x - cx, y - cy) < 46); }); }
function drawNet(){ $('netLine').setAttribute('points', S.net.map(p => p.join(',')).join(' ')); const on = new Set(netted(S.net)); S.fish.forEach(f => f.el.classList.toggle('netted', on.has(f))); }
function castNet(pts){ if (pts.length < 3) return; const got = netted(pts), t = selTub(); if (got.length < 2) return; const ok = R.netCatch(got, t);
  if (!ok) { say('너무 무거워! 그물이 빠져나갔어'); tone(200, .3, 'sine', .1, 0, 120); got.forEach(f => { f.dir *= -1; f.el.style.setProperty('--f', f.dir > 0 ? -1 : 1); f.sp *= 1.8; f.el.classList.remove('back'); void f.el.offsetWidth; f.el.classList.add('back'); }); return; }
  S.busy = true; const bk = $('tubs').children[S.sel].getBoundingClientRect(); ok.forEach((f, i) => { f.caught = true; R.catchInto(f, t); bookIt(f); const r = f.el.getBoundingClientRect(); setTimeout(() => { f.el.classList.add('up'); f.el.style.left = (bk.left + bk.width / 2 - r.width / 2) + 'px'; f.el.style.top = (bk.top - 10) + 'px'; tone(520 + i * 120, .1, 'sine', .1); }, i * 90); });
  setTimeout(() => { ok.forEach(f => f.el.remove()); S.fish = S.fish.filter(x => !ok.includes(x)); S.busy = false; say(`그물로 ${ok.length}마리!`); afterCatch(); }, 520 + ok.length * 90); }

// ── 배 꾸미기(꾸미는 동안 물고기가 멈춘다)
function show(h){ $('sheetCard').innerHTML = h; $('sheet').classList.add('on'); S.paused = true; }
function hide(){ $('sheet').classList.remove('on'); S.paused = false; }
function itemPic(x){ return x.id === 'tub2' ? `<span style="font-size:.8em">${art('boat.tub')}${art('boat.tub')}</span>` : x.id === 'gold' ? `<span style="filter:sepia(1) saturate(6) hue-rotate(-12deg) brightness(1.15)">${art('fish.gold')}</span>` : art(x.art); }
function openSheet(){ if (SAVE.rest > 0) { UP.nudge($('hammer')); return; } UP.open({ show, hide, card: $('sheetCard'), title: '배 꾸미기', doneText: '배를 다 꾸몄어!', offers: R.offers(O()), coins: () => wallet.coins(), itemPic, onBuy: doBuy }); }
function doBuy(id){ if (!wallet.spend(R.priceOf(O(), id))) return; const msg = R.buy(SAVE, id); keep(); hide(); look(); if (['tub10', 'tub2', 'tub20', 'order'].includes(id) && S.tubs.every(t => t.fill.length === 0)) newTubs(); grew('배가 커졌어!', msg); }
$('hammer').onclick = openSheet; wallet.onChange(() => hammer());
$('nightBtn').onclick = () => { audio(); SAVE.night = !SAVE.night; keep(); look(); tone(SAVE.night ? 440 : 880, .2, 'triangle', .1); };

// ── 헤엄
let last = performance.now(); function loop(now){ requestAnimationFrame(loop); const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; if (S.paused) return; const W = innerWidth;
  for (const f of S.fish) { if (f.caught) continue; f.x += f.dir * f.sp * dt; const y = f.y + Math.sin(now / 600 + f.ph) * 10; f.el.style.left = f.x + 'px'; f.el.style.top = y + 'px'; if (f.x < -140 || f.x > W + 140) { f.gone = true; f.el.remove(); } }
  S.fish = S.fish.filter(f => !f.gone); while (S.fish.filter(f => !f.caught).length < R.nFish(O())) spawn(false);
  if (!S.busy) { const u = R.unstick(O(), S.tubs, S.fish.filter(f => !f.caught)); if (u) reface(u.fish, u.kind, u.v); } }
for (let i = 0; i < 9; i++) { const b = document.createElement('div'); b.className = 'bub'; b.style.left = Math.random() * 100 + '%'; b.style.bottom = (Math.random() * 30 - 10) + '%'; b.style.animationDuration = (6 + Math.random() * 8) + 's'; b.style.animationDelay = -Math.random() * 8 + 's'; $('sea').appendChild(b); }
paint(); hud(); look(); newTubs(); for (let i = 0; i < R.nFish(O()); i++) spawn(true); requestAnimationFrame(loop);
window.__fish = { S, SAVE, R, wallet, hook, pick, openSheet, doBuy, newTubs, castNet, left: () => R.left(selTub()) };
