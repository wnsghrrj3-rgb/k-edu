/* 수학 놀이터 손 그림(글 없는 길잡이) — 가만히 있으면 지금 누를 곳을 손이 짚어 준다. 누르면 사라진다.
 * 광장(어느 배로 갈지 · 나무 묶음 끌기) · 장터(첫 손님) · 낚시 섬(첫 판) · 다리 길 화물 싣기(첫 화물)가 같이 쓴다. 화면 위 표시(물체 아님). */
import { art } from './art.js?v=7';
import * as wallet from './wallet.js?v=1';
const CSS = `#handhint{position:fixed;z-index:9;font-size:2.8rem;line-height:1;margin:6px 0 0 -.5em;pointer-events:none;opacity:0;transition:opacity .3s,left .9s ease-in-out,top .9s ease-in-out;filter:drop-shadow(0 4px 6px rgba(0,0,0,.4))}
#handhint.on{opacity:1}#handhint span{display:block;animation:handbob .9s ease-in-out infinite}@keyframes handbob{50%{transform:translateY(-12px)}}#handhint img.art{height:1em;width:auto}`;
let el = null, last = (typeof performance !== 'undefined' ? performance.now() : 0);
function make(){ if (el) return el; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); el = document.createElement('div'); el.id = 'handhint'; el.innerHTML = `<span>${art('hint.hand')}</span>`; document.body.appendChild(el);
  addEventListener('pointerdown', () => { last = performance.now(); hide(); }, true); return el; }
// ── 누른 자리 물결(정본 5-11절 — 아무 일도 안 일어나는 누름을 두지 않는다 · 가르기 틀 · 세기 틀이 같이 쓴다)
const RIPPLE_CSS = `.ripple{position:fixed;z-index:9;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:4px solid rgba(255,255,255,.95);pointer-events:none;animation:ripple .6s ease-out forwards}@keyframes ripple{to{transform:scale(4.2);opacity:0}}`;
let rippleIn = false;
export function ripple(x, y){ if (!rippleIn) { rippleIn = true; const s = document.createElement('style'); s.textContent = RIPPLE_CSS; document.head.appendChild(s); } const d = document.createElement('div'); d.className = 'ripple'; d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 650); }
/** 손을 (x, y) 바로 아래에 띄운다(위를 가리킴). 이미 떠 있으면 그 자리로 미끄러진다. */
export function show(x, y){ const e = make(); e.style.left = x + 'px'; e.style.top = y + 'px'; e.classList.add('on'); }
export function hide(){ if (el) el.classList.remove('on'); }
export const shown = () => !!(el && el.classList.contains('on'));
/** 마지막으로 누른 뒤 ms 가 지났는가(가만히 있는가). */
export function idle(ms = 4000){ make(); return performance.now() - last > ms; }
/** 요소 가운데 아래를 짚는다. */
export function at(node){ if (!node) { hide(); return; } const r = node.getBoundingClientRect(); show(r.left + r.width / 2, r.bottom - Math.min(18, r.height * .3)); }

// ── 첫 판 한 줄 안내(준호 2026-11-17 「처음에 설명을 해 줘야 할 것 같아」) — 그 곳에 처음 두 번 올 때만 뜬다. 누르거나 조금 지나면 사라진다.
const TELL_CSS = `#tell{position:fixed;left:50%;top:calc(64px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:8;background:#fff;color:#12314a;border:4px solid #12314a;border-radius:22px;padding:10px 22px;font-weight:900;font-size:clamp(1.1rem,3.6vw,1.7rem);line-height:1.35;box-shadow:0 6px 0 rgba(0,0,0,.2);width:max-content;max-width:92vw;text-align:center;word-break:keep-all;opacity:0;transition:opacity .35s;pointer-events:none}#tell.on{opacity:1}`;
let tellEl = null, tellT = 0;
export const TELL = { TIMES: 2, MS: 8000 };
/** key 곳의 한 줄 안내를 띄운다(이미 TIMES 번 봤으면 안 띄움). → 띄웠는가 */
export function tell(key, text, opt = {}){ const o = wallet.island('loop'); o.told = o.told || {}; if ((o.told[key] | 0) >= (opt.times || TELL.TIMES)) return false; o.told[key] = (o.told[key] | 0) + 1; wallet.save();
  if (!tellEl) { const s = document.createElement('style'); s.textContent = TELL_CSS; document.head.appendChild(s); tellEl = document.createElement('div'); tellEl.id = 'tell'; document.body.appendChild(tellEl); }
  tellEl.textContent = text; const tr = document.getElementById('tray'); tellEl.style.top = tr && tr.classList.contains('on') ? (tr.getBoundingClientRect().bottom + 14) + 'px' : '';   /* 덧셈 띠가 떠 있으면 그 아래에 */ tellEl.classList.add('on'); clearTimeout(tellT); tellT = setTimeout(() => tellEl.classList.remove('on'), opt.ms || TELL.MS); const t0 = performance.now();
  const off = () => { if (performance.now() - t0 < 1500) return; tellEl.classList.remove('on'); removeEventListener('pointerdown', off, true); }; addEventListener('pointerdown', off, true); return true; }
