/* 낚시 섬(간단한 샘플) — 헤엄치는 수 물고기를 눌러 낚는다. 낚은 수만큼 통의 칸이 찬다. 통을 딱 채우면 장에 보내고 새 통이 온다.
 * 넘치게 낚으면 통이 기우뚱하고 물고기가 도로 뛰어 나간다(문제 창·채점 없음). 통을 보낼수록 배가 커진다(칸 5 → 10 → 20).
 * 수학: 수 세기 → 모으기 → 10 만들기 → 세 수의 덧셈·십몇. 드러내지 않는다.
 * 틀(위쪽 띠·동전·알림·효과음·「커졌어!」)은 ../common/kit.js, 그림은 ../common/art.js. 동전은 지갑으로, 걸음(stage·sent)은 지갑의 낚시 칸에 남는다. */
import { wallet, art, group, paint, hud, pay, toast, grew, did, audio, tone, sfx } from '../common/kit.js?v=2';
const $ = id => document.getElementById(id), R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const STAGES = [ { cap: 5, max: 3, need: 3, n: 4, sp: 1 }, { cap: 10, max: 5, need: 4, n: 5, sp: 1.1, msg: '통이 커졌어! 열 칸' }, { cap: 10, max: 9, need: 5, n: 6, sp: 1.25, msg: '큰 물고기가 나타났어!' }, { cap: 20, max: 9, need: 99, n: 7, sp: 1.35, msg: '배가 커졌어! 스무 칸' } ];
const KIND = group('fish');
const SAVE = wallet.island('fish'), S = { stage: Math.max(0, Math.min(STAGES.length - 1, SAVE.stage | 0)), sent: Math.max(0, SAVE.sent | 0), fill: [], fly: 0, fish: [], busy: false, id: 0 };
function keep(){ SAVE.stage = S.stage; SAVE.sent = S.sent; wallet.save(); }
const st = () => STAGES[S.stage], total = () => S.fill.reduce((a, b) => a + b, 0), left = () => st().cap - total() - S.fly;      /* 줄에 걸려 날아가는 중인 물고기도 칸에 센다(빨리 두 번 누르면 넘치던 것) */
function say(t){ const e = $('say'); e.textContent = t; e.style.opacity = 1; clearTimeout(say.t); say.t = setTimeout(() => e.style.opacity = 0, 1300); }
function bucket(){ const b = $('bucket'), cap = st().cap; b.innerHTML = ''; b.style.gridTemplateColumns = `repeat(${cap > 10 ? 10 : 5},clamp(${cap > 10 ? 16 : 22}px,${cap > 10 ? 3.4 : 4.4}vw,${cap > 10 ? 28 : 34}px))`; let k = 0; S.fill.forEach((n, j) => { for (let i = 0; i < n; i++, k++) { const c = document.createElement('i'); c.className = 'on c' + (j % 4); b.appendChild(c); } }); for (; k < cap; k++) b.appendChild(document.createElement('i'));
  $('lv').textContent = st().need < 99 ? `통 ${S.sent} / ${st().need} — 다 보내면 배가 커져요` : `통 ${S.sent}개째`; }
// 물고기: 남은 칸에 딱 맞는 수가 자주 섞여 나온다
function spawn(first){ const s = st(), l = left(), want = l <= s.max && l > 0 && !S.fish.some(f => f.v === l) && Math.random() < .55 ? l : R(1, s.max), dir = Math.random() < .5 ? 1 : -1, W = innerWidth, H = innerHeight;
  const f = { id: ++S.id, v: want, dir, x: first ? Math.random() * W : (dir > 0 ? -90 : W + 90), y: H * (.46 + Math.random() * .42), sp: (38 + Math.random() * 46) * s.sp, ph: Math.random() * 6, el: document.createElement('button') };
  const size = 46 + want * 7; f.el.className = 'fish'; f.el.style.setProperty('--s', size + 'px'); f.el.style.setProperty('--f', dir > 0 ? -1 : 1); f.el.innerHTML = `<span class="e">${art(KIND[(want + f.id) % KIND.length])}</span><b>${want}</b>` + (want <= 5 ? `<small>${'<u></u>'.repeat(want)}</small>` : ''); f.el.addEventListener('pointerdown', e => { e.preventDefault(); hook(f); }); document.body.appendChild(f.el); S.fish.push(f); }
function hook(f){ if (f.caught || S.busy) return; audio(); const l = left(), bk = $('bucket').getBoundingClientRect(), r = f.el.getBoundingClientRect();
  const line = $('line'), bx = bk.left + bk.width / 2, by = bk.bottom, fx = r.left + r.width / 2, fy = r.top + r.height / 2, len = Math.hypot(fx - bx, fy - by); Object.assign(line.style, { left: bx + 'px', top: by + 'px', height: len + 'px', transform: `rotate(${Math.atan2(bx - fx, fy - by)}rad)`, opacity: .9 }); setTimeout(() => line.style.opacity = 0, 380);
  if (f.v > l) { f.el.classList.remove('back'); void f.el.offsetWidth; f.el.classList.add('back'); const b = $('bucket'); b.classList.remove('tip'); void b.offsetWidth; b.classList.add('tip'); say(`${f.v - l}칸이 모자라!`); tone(220, .25, 'sine', .1, 0, 140); f.dir *= -1; f.el.style.setProperty('--f', f.dir > 0 ? -1 : 1); f.sp *= 1.6; return; }      // 넘침: 통이 기우뚱, 물고기는 달아난다
  f.caught = true; S.fly += f.v; f.el.classList.add('up'); f.el.style.left = (bx - r.width / 2) + 'px'; f.el.style.top = (bk.top - 10) + 'px'; tone(520, .12, 'sine', .1, 0, 1040);
  setTimeout(() => { f.el.remove(); S.fish = S.fish.filter(x => x !== f); S.fly -= f.v; S.fill.push(f.v); bucket(); tone(700 + total() * 30, .08, 'square', .06);
    if (left() === 0 && !S.fly) full(); }, 430); }
function full(){ S.busy = true; const cap = st().cap; $('cat').classList.remove('yay'); void $('cat').offsetWidth; $('cat').classList.add('yay'); say('가득 찼다!'); sfx.yes();
  const expr = S.fill.join(' + ') + ' = ' + cap; setTimeout(() => { $('bucket').classList.add('go'); toast(expr, 1500); }, 500);
  setTimeout(() => { pay(cap, 'fish', $('boat')); did('fish.bucket'); S.sent++; S.fill = [];
    if (S.sent >= st().need && S.stage < STAGES.length - 1) { S.stage++; S.sent = 0; const m = st().msg.split(/(?<=!) /); grew(m[0], m[1] || ''); }
    keep();
    const b = $('bucket'); b.classList.remove('go'); b.style.transition = 'none'; b.style.transform = 'translate(-60vw,0)'; b.style.opacity = 0; bucket(); requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transition = 'transform .5s,opacity .5s'; b.style.transform = ''; b.style.opacity = 1; setTimeout(() => { b.style.transition = ''; S.busy = false; }, 520); })); }, 1400); }
let last = performance.now(); function loop(now){ requestAnimationFrame(loop); const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; const W = innerWidth;
  for (const f of S.fish) { if (f.caught) continue; f.x += f.dir * f.sp * dt; const y = f.y + Math.sin(now / 600 + f.ph) * 10; f.el.style.left = f.x + 'px'; f.el.style.top = y + 'px'; if (f.x < -140 || f.x > W + 140) { f.gone = true; f.el.remove(); } }
  S.fish = S.fish.filter(f => !f.gone); while (S.fish.filter(f => !f.caught).length < st().n) spawn(false);
  // 막힘 방지: 남은 칸보다 작은 물고기가 하나도 없으면 하나를 딱 맞는 수로 바꿔 준다
  const l = left(); if (l > 0 && !S.busy && !S.fish.some(f => !f.caught && f.v <= l)) { const f = S.fish.find(f => !f.caught); if (f) { f.v = Math.min(l, st().max); f.el.querySelector('b').textContent = f.v; const sm = f.el.querySelector('small'); if (sm) sm.innerHTML = '<u></u>'.repeat(f.v); } } }
for (let i = 0; i < 9; i++) { const b = document.createElement('div'); b.className = 'bub'; b.style.left = Math.random() * 100 + '%'; b.style.bottom = (Math.random() * 30 - 10) + '%'; b.style.animationDuration = (6 + Math.random() * 8) + 's'; b.style.animationDelay = -Math.random() * 8 + 's'; $('sea').appendChild(b); }
paint(); hud(); bucket(); for (let i = 0; i < st().n; i++) spawn(true); requestAnimationFrame(loop);
window.__fish = { S, STAGES, left, hook, wallet };
