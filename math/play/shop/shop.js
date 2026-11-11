/* 가게 섬(간단한 샘플) — 손님이 원하는 만큼 과일을 바구니에 담아 건넨다. 문제 창·채점 없음:
 * 모자라면 손님이 「더 줘」, 넘치면 「너무 많아」 하고 기다릴 뿐이다. 팔수록 가게가 커진다(새 과일 → 열 개 상자).
 * 수학: 수 세기 → 수 읽고 세기 → 두 가지 모으기 → 열 개 묶음과 낱개. 드러내지 않는다. 저장 0. */
const $ = id => document.getElementById(id), R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), one = a => a[Math.floor(Math.random() * a.length)];
const FRUIT = { apple: '🍎', orange: '🍊', banana: '🍌' }, FACES = ['🐻', '🐰', '🐱', '🐶', '🦊', '🐼', '🐸', '🐵'];
// 가게 단계: 팔수록 올라간다
const STAGES = [
  { name: '과일 가게', need: 3, crates: ['apple'], order: () => ({ apple: R(1, 5) }), pics: true },
  { name: '과일 가게', need: 4, crates: ['apple'], order: () => ({ apple: R(3, 9) }) },
  { name: '큰 과일 가게', need: 5, crates: ['apple', 'orange'], unlock: '귤이 들어왔어!', order: () => Math.random() < .4 ? { [one(['apple', 'orange'])]: R(4, 9) } : { apple: R(1, 5), orange: R(1, 4) } },
  { name: '큰 과일 가게', need: 6, crates: ['apple', 'orange', 'banana'], unlock: '바나나가 들어왔어!', order: () => { const k = ['apple', 'orange', 'banana'].sort(() => Math.random() - .5); return { [k[0]]: R(2, 6), [k[1]]: R(1, 4) }; } },
  { name: '과일 마트', need: 99, crates: ['apple', 'orange', 'banana'], box: true, unlock: '사과 열 개들이 상자가 생겼어!', order: () => Math.random() < .7 ? { apple: R(11, 19) } : { apple: R(10, 14), orange: R(1, 5) } } ];
const S = { stage: 0, sold: 0, coins: 0, order: null, basket: [], wait: 1, busy: false, hint: 0 };
let ac = null; const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} };
function tone(f, d = .1, type = 'triangle', g = .12, delay = 0){ if (!ac) return; try { const t = ac.currentTime + delay, o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.value = f; a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(a); a.connect(ac.destination); o.start(t); o.stop(t + d + .02); } catch (_) {} }
const count = k => S.basket.reduce((n, b) => n + (b.k === k ? b.n : 0), 0);
function toast(t, ms = 1800){ const e = $('toast'); e.textContent = t; e.style.opacity = 1; clearTimeout(toast.t); toast.t = setTimeout(() => e.style.opacity = 0, ms); }

function shelf(){ const st = STAGES[S.stage], el = $('shelf'); el.innerHTML = ''; $('shopName').textContent = st.name;
  for (const k of st.crates) { const b = document.createElement('button'); b.className = 'crate'; b.innerHTML = FRUIT[k]; b.onclick = () => put(k, 1, b); el.appendChild(b); }
  if (st.box) { const b = document.createElement('button'); b.className = 'crate new'; b.innerHTML = `📦<small>🍎 10개</small>`; b.onclick = () => put('apple', 10, b); el.appendChild(b); }
  if (st.unlock) el.lastElementChild.classList.add('new');
  $('lvT').textContent = st.need < 99 ? `손님 ${S.sold} / ${st.need} — 다 받으면 가게가 커져요` : '손님이 줄을 서요!'; $('lvBar').style.width = st.need < 99 ? (S.sold / st.need * 100) + '%' : '100%'; }
function drawBasket(){ const el = $('basket'); el.innerHTML = ''; S.basket.forEach((b, i) => { const s = document.createElement('span'); if (b.n === 10) { s.className = 'box'; s.textContent = FRUIT[b.k].repeat(5) + '\n' + FRUIT[b.k].repeat(5); s.style.whiteSpace = 'pre'; } else s.textContent = FRUIT[b.k]; s.onclick = () => { if (S.busy) return; S.basket.splice(i, 1); tone(300, .06, 'sine'); drawBasket(); }; el.appendChild(s); }); $('give').classList.toggle('glow', S.order && Object.keys(S.order).every(k => count(k) === S.order[k]) && S.basket.length > 0 && S.hint > 1); }
function put(k, n, from){ if (S.busy || !S.order) return; audio(); if (S.basket.reduce((a, b) => a + (b.n === 10 ? 5 : 1), 0) >= 25) return; S.basket.push({ k, n }); tone(520 + S.basket.length * 30, .07, 'square', .05); drawBasket(); }

function bubble(extra){ const st = STAGES[S.stage], o = S.order; $('bubble').innerHTML = Object.keys(o).map(k => st.pics ? `<span class="pics">${FRUIT[k].repeat(o[k])}</span>` : `${FRUIT[k]} ${o[k]}`).join('<br>') + (extra ? `<small>${extra}</small>` : ''); }
function next(){ const st = STAGES[S.stage]; S.order = st.order(); S.basket = []; S.wait = 1; S.hint = 0; S.busy = false; drawBasket(); const g = $('guest'); $('face').textContent = one(FACES); g.className = 'guest out'; bubble(); requestAnimationFrame(() => requestAnimationFrame(() => g.className = 'guest in')); tone(880, .08, 'sine', .08); tone(1175, .12, 'sine', .08, .1); }
function coinsFly(n){ const from = $('guest').getBoundingClientRect(), to = $('coinBox').getBoundingClientRect(); for (let i = 0; i < Math.min(n, 8); i++) { const c = document.createElement('div'); c.className = 'fly'; c.textContent = '🪙'; c.style.left = (from.left + from.width / 2) + 'px'; c.style.top = (from.top + 40) + 'px'; document.body.appendChild(c); setTimeout(() => { c.style.transform = `translate(${to.left - from.left - from.width / 2 + 20}px,${to.top - from.top - 40}px)`; c.style.opacity = .2; }, 40 + i * 60); setTimeout(() => c.remove(), 800 + i * 60); } }
$('give').onclick = () => { if (S.busy || !S.order) return; audio(); if (!S.basket.length) return; const o = S.order, keys = new Set([...Object.keys(o), ...S.basket.map(b => b.k)]); let less = null, more = null; for (const k of keys) { const d = count(k) - (o[k] || 0); if (d < 0 && !less) less = k; if (d > 0 && !more) more = k; }
  const g = $('guest');
  if (!less && !more) { S.busy = true; const pay = Object.values(o).reduce((a, b) => a + b, 0); g.classList.add('happy'); $('bubble').innerHTML = '고마워!'; [660, 880, 1320].forEach((f, i) => tone(f, .14, 'triangle', .13, i * .07)); coinsFly(pay); setTimeout(() => { S.coins += pay; $('coins').textContent = S.coins; $('coinBox').classList.remove('pop'); void $('coinBox').offsetWidth; $('coinBox').classList.add('pop'); }, 500);
    S.sold++; setTimeout(() => { g.className = 'guest bye'; }, 1000); setTimeout(() => { const st = STAGES[S.stage]; if (S.sold >= st.need && S.stage < STAGES.length - 1) { S.stage++; S.sold = 0; shelf(); toast('가게가 커졌어! ' + (STAGES[S.stage].unlock || ''), 2600); [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .14, i * .1)); } else shelf(); next(); }, 1500); }
  else { S.hint++; g.classList.remove('sad'); void g.offsetWidth; g.classList.add('sad'); tone(200, .2, 'sine', .1); bubble(less ? `${FRUIT[less]} 더 줘` : `${FRUIT[more]} 너무 많아`); drawBasket(); } };
// 기다림: 천천히 줄고, 다 줄면 손님이 그냥 간다(벌 없음)
setInterval(() => { if (!S.order || S.busy) return; S.wait -= .1 / (26 + S.stage * 6); $('wait').style.width = Math.max(0, S.wait * 100) + '%'; $('wait').style.background = S.wait < .3 ? '#ff6b6b' : '#35d07f'; if (S.wait <= 0) { S.busy = true; $('bubble').innerHTML = '다음에 올게…'; $('guest').className = 'guest bye'; setTimeout(next, 900); } }, 100);
shelf(); next();
window.__shop = { S, STAGES, count, put, next };
