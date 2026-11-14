/* 수학 놀이터 섬 틀 — 섬 페이지가 같이 쓰는 한 벌: 위쪽 띠(뒤로 · 동전) · 동전이 날아가는 연출 · 한 줄 알림 · 효과음 ·
 * 걸음이 오를 때의 「커졌어!」 · 부탁을 해냈을 때의 리본 · 저장 안내 한 줄(동의 전).
 * 섬 페이지는 걸음 표(STAGES)·반응·커짐만 가진다. 같은 기능을 섬마다 따로 쓰지 않는다. */
import * as wallet from './wallet.js';
import { art, arts, group, paint, glyph } from './art.js';
export { wallet, art, arts, group, paint, glyph };

// ── 내가 정한 수치
export const KIT = { FLY_MAX: 8, FLY_MS: 600, FLY_GAP: 60, GREW_MS: 2600, RIBBON_MS: 3200, CONFETTI: 26 };
const NOTICE = '지금은 구경 중이에요 · 화면을 나가면 동전이 처음으로 돌아가요';

const CSS = `
.kit-hud{position:fixed;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:flex-start;padding:calc(10px + env(safe-area-inset-top,0px)) 14px 0;z-index:20;pointer-events:none}
.kit-pill{background:rgba(10,20,40,.55);color:#fff;border-radius:999px;padding:8px 16px;font-weight:900;font-size:1.05rem;text-decoration:none;pointer-events:auto;font-family:inherit;line-height:1.3}
.kit-coin{display:flex;align-items:center;gap:8px}.kit-coin i{width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6b0,#ffc21a 60%,#c98a00);display:inline-block}
.kit-coin.pop{animation:kit-pop .4s}@keyframes kit-pop{40%{transform:scale(1.25)}}
.kit-note{position:fixed;left:50%;bottom:calc(6px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:19;background:rgba(10,20,40,.5);color:#fff;border-radius:999px;padding:3px 14px;font-size:.78rem;font-weight:700;white-space:nowrap;max-width:96vw;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
.kit-toast{position:fixed;left:50%;top:var(--kit-toast-top,22%);transform:translate(-50%,0);background:rgba(10,20,40,.82);color:#fff;font-weight:900;font-size:clamp(1.2rem,3.4vw,2rem);border-radius:20px;padding:14px 26px;opacity:0;transition:opacity .4s;pointer-events:none;z-index:22;text-align:center;max-width:92vw}
.kit-fly{position:fixed;font-size:1.6rem;line-height:1;pointer-events:none;z-index:24;transition:transform .6s cubic-bezier(.3,-.4,.6,1),opacity .6s}
.kit-grew{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;pointer-events:none;z-index:23;opacity:0;transition:opacity .35s}
.kit-grew.on{opacity:1}
.kit-grew b{font-size:clamp(2.1rem,7vw,4.2rem);color:#fff;font-weight:900;text-shadow:0 4px 0 rgba(0,0,0,.35),0 0 30px rgba(255,210,80,.95);transform:scale(.6);transition:transform .45s cubic-bezier(.2,1.6,.4,1)}
.kit-grew.on b{transform:scale(1)}
.kit-grew span{font-size:clamp(1.1rem,3.2vw,1.7rem);color:#fff;font-weight:900;background:rgba(10,20,40,.72);border-radius:999px;padding:6px 20px}
.kit-grew span:empty{display:none}
.kit-conf{position:fixed;width:12px;height:12px;border-radius:3px;z-index:23;pointer-events:none;animation:kit-conf 1.5s ease-out forwards}
@keyframes kit-conf{to{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
.kit-ribbon{position:fixed;left:50%;top:calc(58px + env(safe-area-inset-top,0px));transform:translate(-50%,-150%);opacity:0;z-index:21;background:#fff4d6;color:#5a3410;border:4px solid #b9853b;border-radius:16px;padding:8px 18px;font-weight:900;font-size:clamp(.95rem,2.6vw,1.2rem);box-shadow:0 6px 0 rgba(0,0,0,.18);transition:transform .45s cubic-bezier(.2,1.4,.4,1),opacity .3s;pointer-events:none;white-space:nowrap;max-width:94vw}
.kit-ribbon.on{transform:translate(-50%,0);opacity:1}
img.art{height:1em;width:auto;vertical-align:-.12em}`;
let cssIn = false; function css(){ if (cssIn) return; cssIn = true; const s = document.createElement('style'); s.id = 'kit-css'; s.textContent = CSS; document.head.appendChild(s); }
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

// ── 효과음
let ac = null;
export function audio(){ try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} }
export function tone(f, d = .1, type = 'triangle', g = .12, delay = 0, to){ if (!ac) return; try { const t = ac.currentTime + delay, o = ac.createOscillator(), a = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d); a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(a); a.connect(ac.destination); o.start(t); o.stop(t + d + .02); } catch (_) {} }
export const sfx = {
  yes: () => [660, 880, 1320].forEach((f, i) => tone(f, .14, 'triangle', .13, i * .07)),
  grew: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .14, i * .1)),
  coin: () => { tone(988, .07, 'square', .06); tone(1319, .16, 'square', .06, .07); },
  stamp: () => { tone(160, .12, 'sine', .2, 0, 90); tone(1200, .05, 'square', .04, .02); },
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, .28, 'triangle', .14, i * .11)) };

// ── 위쪽 띠
let coinBox = null, coinNum = null, shown = 0, hold = 0;
function paintCoins(pop){ if (!coinNum) return; shown = wallet.coins(); coinNum.textContent = shown; if (pop) { coinBox.classList.remove('pop'); void coinBox.offsetWidth; coinBox.classList.add('pop'); } }
/** 위쪽 띠를 단다. back = { href, label }(기본: ← 광장 섬). 동전은 지갑을 그대로 보여 준다. */
export function hud({ back = { href: '/math/play/island/', label: '← 광장 섬' } } = {}){ css();
  const h = el('div', 'kit-hud'); const a = el('a', 'kit-pill', back.label); a.href = back.href; a.id = 'kitBack';
  coinBox = el('div', 'kit-pill kit-coin', '<i></i><span id="kitCoins">0</span>'); coinBox.id = 'kitCoinBox'; coinNum = coinBox.querySelector('span'); h.append(a, coinBox); document.body.appendChild(h);
  paintCoins(false); wallet.onChange(() => { if (!hold) paintCoins(wallet.coins() !== shown); });
  if (!wallet.persists()) document.body.appendChild(el('div', 'kit-note', NOTICE)).id = 'kitNote';
  return h; }
/** 동전을 번다: 지갑에는 바로 들어가고, 화면에서는 from 자리에서 동전이 날아와 닿을 때 숫자가 오른다. */
export function pay(n, from, fromEl){ if (n <= 0) return; css(); hold++; wallet.earn(n, from); const done = () => { hold = Math.max(0, hold - 1); if (!hold) paintCoins(true); };
  if (!fromEl || !coinBox) { done(); return; }
  const a = fromEl.getBoundingClientRect(), b = coinBox.getBoundingClientRect(), k = Math.min(n, KIT.FLY_MAX), x0 = a.left + a.width / 2 - 13, y0 = a.top + Math.min(40, a.height / 2);
  for (let i = 0; i < k; i++) { const c = el('div', 'kit-fly', art('coin')); c.style.left = x0 + 'px'; c.style.top = y0 + 'px'; document.body.appendChild(c);
    setTimeout(() => { c.style.transform = `translate(${b.left + 12 - x0}px,${b.top + 4 - y0}px)`; c.style.opacity = .2; }, 40 + i * KIT.FLY_GAP); setTimeout(() => c.remove(), KIT.FLY_MS + 200 + i * KIT.FLY_GAP); }
  setTimeout(done, KIT.FLY_MS - 100); }

// ── 한 줄 알림
let toastEl = null, toastT = 0;
export function toast(text, ms = 1800){ css(); if (!toastEl) { toastEl = el('div', 'kit-toast'); toastEl.id = 'kitToast'; document.body.appendChild(toastEl); } toastEl.textContent = text; toastEl.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.style.opacity = 0; }, ms); }

// ── 「커졌어!」
let grewEl = null, grewT = 0;
export function confetti(n = KIT.CONFETTI){ const cols = ['#ffd35c', '#ff7a3d', '#7dffa8', '#8fe3ff', '#ff8fb8']; for (let i = 0; i < n; i++) { const c = el('div', 'kit-conf'), a = Math.random() * 6.28, d = 120 + Math.random() * 260; c.style.left = '50%'; c.style.top = '46%'; c.style.background = cols[i % cols.length]; c.style.setProperty('--dx', Math.cos(a) * d + 'px'); c.style.setProperty('--dy', (Math.sin(a) * d + 120) + 'px'); c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg'); document.body.appendChild(c); setTimeout(() => c.remove(), 1600); } }
/** 걸음이 올랐다 — 큰 글씨 + 색종이 + 팡파르. title 은 「가게가 커졌어!」, sub 는 새로 생긴 것 한 줄. */
export function grew(title, sub = '', ms = KIT.GREW_MS){ css(); if (!grewEl) { grewEl = el('div', 'kit-grew', '<b></b><span></span>'); grewEl.id = 'kitGrew'; document.body.appendChild(grewEl); }
  grewEl.firstChild.textContent = title; grewEl.lastChild.textContent = sub; grewEl.classList.remove('on'); void grewEl.offsetWidth; grewEl.classList.add('on'); confetti(); sfx.grew(); clearTimeout(grewT); grewT = setTimeout(() => grewEl.classList.remove('on'), ms); }

// ── 오늘 한 일 → 부탁을 해냈으면 리본
let ribEl = null, ribT = 0;
export function ribbon(html, ms = KIT.RIBBON_MS){ css(); if (!ribEl) { ribEl = el('div', 'kit-ribbon'); ribEl.id = 'kitRibbon'; document.body.appendChild(ribEl); } ribEl.innerHTML = html; ribEl.classList.add('on'); clearTimeout(ribT); ribT = setTimeout(() => ribEl.classList.remove('on'), ms); }
/** 오늘 한 일을 세고, 이번에 막 부탁을 해냈으면 리본을 띄운다(도장은 광장 게시판에서 찍힌다). */
export function did(what, n = 1){ const q = wallet.did(what, n); if (q) setTimeout(() => { ribbon(`${art('board.stamp')} 부탁 하나 해냈어! 광장 게시판에 가 봐`); sfx.coin(); }, 900); return q; }
