/* 수학 놀이터 「수 셋 고르기」(정본 27 문서 5-9절 — T01 을 준호가 해 본 뒤 굳힌 것 · T02 에서 split/ 에서 옮겨 옴).
 *   고르는 수는 화면 가운데 위 · 띠(#tray) 바로 아래 · 크게(가로 104px · 전화기 84px). 뜰 때 위에서 톡 튀어나오고,
 *   수가 떠 있는 동안 띠의 「?」 칸(#tray b.hole)이 깜박인다(여기에 들어갈 수라는 뜻).
 *   아닌 수를 고르면 그 단추에 away(물러남) — 가위표 · 빨간 테두리 없음. 화면 위 표시라 코드로 그려도 된다. id 는 #choose 하나. */
const CSS = `
#choose{position:fixed;z-index:7;display:none;gap:18px;transform:translateX(-50%)}#choose.on{display:flex}
#choose button{width:104px;height:104px;border-radius:26px;border:6px solid #8a5a2b;background:#fff4d6;color:#4a2a0c;font-weight:900;font-size:3.4rem;line-height:1;font-family:inherit;box-shadow:0 8px 0 rgba(60,30,5,.4),0 10px 24px rgba(0,0,0,.25);cursor:pointer;touch-action:manipulation;transition:transform .5s,opacity .5s;animation:chin .45s backwards}
#choose button:nth-child(2){animation-delay:.08s}#choose button:nth-child(3){animation-delay:.16s}@keyframes chin{0%{transform:translateY(-30px) scale(.4);opacity:0}70%{transform:scale(1.12)}}
#choose button:active{transform:translateY(4px)}#choose button.away{transform:translateY(40px) rotate(12deg);opacity:.15;pointer-events:none;animation:none}
@media (max-width:520px){#choose button{width:84px;height:84px;font-size:2.7rem;border-radius:22px;border-width:5px}#choose{gap:12px}}
#tray b.hole.ask{animation:holeask 1s infinite}@keyframes holeask{50%{background:rgba(255,211,77,.55);transform:scale(1.08)}}`;
export const GAP = 14;   /* 띠와 수 셋 사이(px) */
let cssIn = false; function css(){ if (cssIn) return; cssIn = true; const s = document.createElement('style'); s.id = 'choose-css'; s.textContent = CSS; document.head.appendChild(s); }
const box = () => { css(); let e = document.getElementById('choose'); if (!e) { e = document.createElement('div'); e.id = 'choose'; document.body.appendChild(e); } return e; };
/** 띠의 「?」 칸 깜박임. */
export function ask(on){ const e = document.querySelector('#tray b.hole'); if (e) e.classList.toggle('ask', !!on); }
/** 수 셋을 띄운다. onPick(n, 단추) — 아닌 수면 부르는 쪽이 retreat(단추)를 부른다. */
export function show(list, onPick){ const c = box(); c.innerHTML = ''; c.className = 'on';
  for (const n of list) { const b = document.createElement('button'); b.type = 'button'; b.textContent = n; b.dataset.n = n; b.addEventListener('click', () => onPick(n, b)); c.appendChild(b); } place(); ask(true); }
export function hide(){ const c = box(); c.className = ''; c.innerHTML = ''; ask(false); }
export const shown = () => { const c = document.getElementById('choose'); return !!(c && c.classList.contains('on')); };
/** 띠 바로 밑 · 화면 가운데(창 크기가 바뀌면 다시 — 틀이 장면마다 부른다). */
export function place(){ const c = box(); if (!c.classList.contains('on')) return; const t = document.getElementById('tray'), r = t && t.classList.contains('on') ? t.getBoundingClientRect() : null;
  c.style.left = (innerWidth / 2) + 'px'; c.style.top = ((r ? r.bottom : 70) + GAP) + 'px'; }
/** 아닌 수: 물러남(다시 누를 수 없음). */
export function retreat(btn){ btn.classList.add('away'); btn.disabled = true; }
