/* 가게 섬(간단한 샘플) — 손님이 원하는 만큼 과일을 바구니에 담아 건넨다. 문제 창·채점 없음:
 * 모자라면 손님이 「더 줘」, 넘치면 「너무 많아」 하고 기다릴 뿐이다. 팔수록 가게가 커진다(새 과일 → 열 개 상자).
 * 수학: 수 세기 → 수 읽고 세기 → 두 가지 모으기 → 열 개 묶음과 낱개. 드러내지 않는다.
 * 틀(위쪽 띠·동전·알림·효과음·「커졌어!」)은 ../common/kit.js, 그림은 ../common/art.js. 동전은 지갑으로, 걸음(stage·sold)은 지갑의 가게 칸에 남는다. */
import { wallet, art, arts, group, paint, hud, pay, grew, did, audio, tone, sfx } from '../common/kit.js?v=2';
const $ = id => document.getElementById(id), R = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), one = a => a[Math.floor(Math.random() * a.length)];
const FRUIT = { apple: 'fruit.apple', orange: 'fruit.orange', banana: 'fruit.banana' }, pic = k => art(FRUIT[k]), FACES = group('guest');
// 가게 단계: 팔수록 올라간다
const STAGES = [
  { name: '과일 가게', need: 3, crates: ['apple'], order: () => ({ apple: R(1, 5) }), pics: true },
  { name: '과일 가게', need: 4, crates: ['apple'], order: () => ({ apple: R(3, 9) }) },
  { name: '큰 과일 가게', need: 5, crates: ['apple', 'orange'], unlock: '귤이 들어왔어!', order: () => Math.random() < .4 ? { [one(['apple', 'orange'])]: R(4, 9) } : { apple: R(1, 5), orange: R(1, 4) } },
  { name: '큰 과일 가게', need: 6, crates: ['apple', 'orange', 'banana'], unlock: '바나나가 들어왔어!', order: () => { const k = ['apple', 'orange', 'banana'].sort(() => Math.random() - .5); return { [k[0]]: R(2, 6), [k[1]]: R(1, 4) }; } },
  { name: '과일 마트', need: 99, crates: ['apple', 'orange', 'banana'], box: true, unlock: '사과 열 개들이 상자가 생겼어!', order: () => Math.random() < .7 ? { apple: R(11, 19) } : { apple: R(10, 14), orange: R(1, 5) } } ];
const SAVE = wallet.island('shop'), clampStage = n => Math.max(0, Math.min(STAGES.length - 1, n | 0));
const S = { stage: clampStage(SAVE.stage), sold: Math.max(0, SAVE.sold | 0), order: null, basket: [], wait: 1, busy: false, hint: 0 };
function keep(){ SAVE.stage = S.stage; SAVE.sold = S.sold; wallet.save(); }
const count = k => S.basket.reduce((n, b) => n + (b.k === k ? b.n : 0), 0);

function shelf(){ const st = STAGES[S.stage], el = $('shelf'); el.innerHTML = ''; $('shopName').textContent = st.name;
  for (const k of st.crates) { const b = document.createElement('button'); b.className = 'crate'; b.innerHTML = pic(k); b.onclick = () => put(k, 1, b); el.appendChild(b); }
  if (st.box) { const b = document.createElement('button'); b.className = 'crate new'; b.innerHTML = `${art('shop.box')}<small>${pic('apple')} 10개</small>`; b.onclick = () => put('apple', 10, b); el.appendChild(b); }
  if (st.unlock) el.lastElementChild.classList.add('new');
  $('lvT').textContent = st.need < 99 ? `손님 ${S.sold} / ${st.need} — 다 받으면 가게가 커져요` : '손님이 줄을 서요!'; $('lvBar').style.width = st.need < 99 ? (S.sold / st.need * 100) + '%' : '100%'; }
function drawBasket(){ const el = $('basket'); el.innerHTML = ''; S.basket.forEach((b, i) => { const s = document.createElement('span'); if (b.n === 10) { s.className = 'box'; s.innerHTML = arts(FRUIT[b.k], 5) + '<br>' + arts(FRUIT[b.k], 5); } else s.innerHTML = pic(b.k); s.onclick = () => { if (S.busy) return; S.basket.splice(i, 1); tone(300, .06, 'sine'); drawBasket(); }; el.appendChild(s); }); $('give').classList.toggle('glow', S.order && Object.keys(S.order).every(k => count(k) === S.order[k]) && S.basket.length > 0 && S.hint > 1); }
function put(k, n, from){ if (S.busy || !S.order) return; audio(); if (S.basket.reduce((a, b) => a + (b.n === 10 ? 5 : 1), 0) >= 25) return; S.basket.push({ k, n }); tone(520 + S.basket.length * 30, .07, 'square', .05); drawBasket(); }

function bubble(extra){ const st = STAGES[S.stage], o = S.order; $('bubble').innerHTML = Object.keys(o).map(k => st.pics ? `<span class="pics">${arts(FRUIT[k], o[k])}</span>` : `${pic(k)} ${o[k]}`).join('<br>') + (extra ? `<small>${extra}</small>` : ''); }
function next(){ const st = STAGES[S.stage]; S.order = st.order(); S.basket = []; S.wait = 1; S.hint = 0; S.busy = false; drawBasket(); const g = $('guest'); $('face').innerHTML = art(one(FACES)); g.className = 'guest out'; bubble(); requestAnimationFrame(() => requestAnimationFrame(() => g.className = 'guest in')); tone(880, .08, 'sine', .08); tone(1175, .12, 'sine', .08, .1); }
$('give').onclick = () => { if (S.busy || !S.order) return; audio(); if (!S.basket.length) return; const o = S.order, keys = new Set([...Object.keys(o), ...S.basket.map(b => b.k)]); let less = null, more = null; for (const k of keys) { const d = count(k) - (o[k] || 0); if (d < 0 && !less) less = k; if (d > 0 && !more) more = k; }
  const g = $('guest');
  if (!less && !more) { S.busy = true; const n = Object.values(o).reduce((a, b) => a + b, 0); g.classList.add('happy'); $('bubble').innerHTML = '고마워!'; sfx.yes(); pay(n, 'shop', g); did('shop.guest');
    S.sold++; keep(); setTimeout(() => { g.className = 'guest bye'; }, 1000); setTimeout(() => { const st = STAGES[S.stage]; if (S.sold >= st.need && S.stage < STAGES.length - 1) { S.stage++; S.sold = 0; keep(); shelf(); grew('가게가 커졌어!', STAGES[S.stage].unlock || ''); } else shelf(); next(); }, 1500); }
  else { S.hint++; g.classList.remove('sad'); void g.offsetWidth; g.classList.add('sad'); tone(200, .2, 'sine', .1); bubble(less ? `${pic(less)} 더 줘` : `${pic(more)} 너무 많아`); drawBasket(); } };
// 기다림: 천천히 줄고, 다 줄면 손님이 그냥 간다(벌 없음)
setInterval(() => { if (!S.order || S.busy) return; S.wait -= .1 / (26 + S.stage * 6); $('wait').style.width = Math.max(0, S.wait * 100) + '%'; $('wait').style.background = S.wait < .3 ? '#ff6b6b' : '#35d07f'; if (S.wait <= 0) { S.busy = true; $('bubble').innerHTML = '다음에 올게…'; $('guest').className = 'guest bye'; setTimeout(next, 900); } }, 100);
paint(); hud(); shelf(); next();
window.__shop = { S, STAGES, count, put, next, wallet };
