/* 수학 놀이터 「끝이 보인다」 부품(정본 26 문서 1-5절 → 27 문서 5-1절에 맞춤) — T01 에 필요한 만큼만.
 *   구슬: 판 = 문제 셋(●●○) · 문제 하나를 여럿으로 쪼개 보일 수도 있다(가르기 틀의 「여러 가지로」 = 셋으로)
 *   등불: 나들이 = 판 셋(돛대 등불 ◦◦◦)
 *   home(): 나들이가 끝나면 — 오늘 보낸 것이 한 줄로 · 큰 단추 「돌아가기」 · 작은 단추 「한 번 더」 · (next 를 주면) 단추 「다음으로」(T11 — 같은 학년 안의 다음 낱칸을 권할 때만 · go/next.js)
 *   fly(): 번 것이 날아가 쌓이는 연출(화면 위 표시)
 * 화면 위 표시라 코드로 그려도 된다(물체가 아님). 글은 단추 두 개뿐. */
const CSS = `
#marbles{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:5;display:flex;gap:10px;pointer-events:none}
#marbles i{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.35);border:3px solid rgba(255,255,255,.9);box-shadow:0 2px 6px rgba(0,0,0,.25);position:relative;overflow:hidden}
#marbles i b{position:absolute;left:0;bottom:0;width:100%;height:0;background:radial-gradient(circle at 35% 30%,#fff6c8,#ffc93a 55%,#d68a00);transition:height .35s}
#marbles i.on b{height:100%}#marbles i.pop{animation:endpop .45s}@keyframes endpop{45%{transform:scale(1.4)}}
#lanterns{position:fixed;right:calc(14px + env(safe-area-inset-right,0px));top:calc(10px + env(safe-area-inset-top,0px));z-index:5;display:flex;gap:6px;background:rgba(10,20,40,.45);border-radius:999px;padding:6px 10px;pointer-events:none}
#lanterns i{width:20px;height:26px;border-radius:9px 9px 7px 7px;background:#56606e;border:2px solid #2b2f36;transition:background .4s,box-shadow .4s}
#lanterns i.on{background:radial-gradient(circle at 50% 40%,#fff8d0,#ffbf3a 60%,#e07a10);box-shadow:0 0 14px 4px rgba(255,190,70,.75)}
#lanterns i.pop{animation:endpop .5s}
.end-fly{position:fixed;z-index:24;pointer-events:none;font-size:1.6rem;line-height:1;transition:transform .7s cubic-bezier(.3,-.3,.6,1),opacity .7s}.end-fly img.art{height:1em;width:auto}
#home{position:fixed;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:16px;padding:0 16px calc(28px + env(safe-area-inset-bottom,0px));background:linear-gradient(to bottom,rgba(10,20,40,0) 30%,rgba(10,20,40,.55));opacity:0;transition:opacity .6s;pointer-events:none}
#home.on{opacity:1;pointer-events:auto}
#home .row{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;max-width:min(94vw,720px);background:rgba(255,244,214,.92);border:4px solid #b9853b;border-radius:20px;padding:10px 14px}
#home .row span{font-size:1.9rem;line-height:1;animation:endin .4s backwards}#home .row img.art{height:1em;width:auto}@keyframes endin{0%{transform:translateY(20px) scale(.3);opacity:0}}
#home .btns{display:flex;align-items:center;gap:14px}
#home button{font-family:inherit;font-weight:900;border-radius:999px;cursor:pointer;touch-action:manipulation}
#home .go-back{font-size:1.6rem;padding:14px 40px;background:#ffd34d;color:#4a2a0c;border:5px solid #8a5a2b;box-shadow:0 6px 0 rgba(60,30,5,.4)}
#home .go-again{font-size:1rem;padding:8px 16px;background:rgba(255,255,255,.85);color:#1d4a63;border:3px solid #1d4a63}
#home .go-next{font-size:1.15rem;padding:10px 20px;background:#dff1ff;color:#12406a;border:4px solid #2b6a9c;box-shadow:0 5px 0 rgba(20,50,90,.35)}`;
let cssIn = false; function css(){ if (cssIn) return; cssIn = true; const s = document.createElement('style'); s.id = 'ends-css'; s.textContent = CSS; document.head.appendChild(s); }
const box = id => { css(); let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; document.body.appendChild(e); } return e; };

/** 판 구슬: n 개 가운데 done 개가 찼다. part = 지금 문제의 찬 몫(0~1 — 문제 하나를 쪼개 보일 때). */
export function marbles(done, n = 3, part = 0){ const e = box('marbles'); if (e.children.length !== n) e.innerHTML = '<i><b></b></i>'.repeat(n);
  [...e.children].forEach((m, k) => { const on = k < done, was = m.classList.contains('on'); m.classList.toggle('on', on); m.firstChild.style.height = on ? '' : k === done && part > 0 ? Math.round(part * 100) + '%' : '0';
    if (on && !was) { m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); } }); }
/** 나들이 등불: n 개 가운데 lit 개가 켜졌다. */
export function lanterns(lit, n = 3){ const e = box('lanterns'); if (e.children.length !== n) e.innerHTML = '<i></i>'.repeat(n);
  [...e.children].forEach((m, k) => { const on = k < lit, was = m.classList.contains('on'); m.classList.toggle('on', on); if (on && !was) { m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); } }); }
/** 구슬 · 등불을 숨긴다/보인다(고르는 화면에서는 숨김). */
export function showBar(on){ for (const id of ['marbles', 'lanterns']) box(id).style.display = on ? '' : 'none'; }

/** html 하나를 from 요소 자리에서 to 요소로 n 개 날린다 → 닿을 때 끝나는 Promise. */
export function fly(fromEl, toEl, html, n = 1){ css(); if (!fromEl || !toEl || n <= 0) return Promise.resolve(); const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect(), x0 = a.left + a.width / 2 - 12, y0 = a.top + a.height / 2 - 12;
  for (let i = 0; i < Math.min(n, 8); i++) { const c = document.createElement('div'); c.className = 'end-fly'; c.innerHTML = html; c.style.left = x0 + 'px'; c.style.top = y0 + 'px'; document.body.appendChild(c);
    setTimeout(() => { c.style.transform = `translate(${b.left + b.width / 2 - 12 - x0}px,${b.top + b.height / 2 - 12 - y0}px)`; c.style.opacity = .3; }, 30 + i * 70); setTimeout(() => c.remove(), 900 + i * 70); }
  return new Promise(r => setTimeout(r, 750 + Math.min(n, 8) * 70)); }

/** 나들이 끝: 오늘 보낸 것이 한 줄로(items = html 조각들) · 「돌아가기」(큰) · 「한 번 더」(작은) · next(글)를 주면 「다음으로」. → Promise('back' | 'again' | 'next') */
export function home({ items = [], back = '돌아가기', again = '한 번 더', next = '' } = {}){ const e = box('home');
  e.innerHTML = `<div class="row">${items.map((h, i) => `<span style="animation-delay:${(i * .06).toFixed(2)}s">${h}</span>`).join('')}</div><div class="btns"><button class="go-again" type="button">${again}</button><button class="go-back" type="button">${back}</button>${next ? `<button class="go-next" type="button">${next}</button>` : ''}</div>`;
  void e.offsetWidth; e.classList.add('on');
  return new Promise(res => { const done = v => { e.classList.remove('on'); setTimeout(() => { if (!e.classList.contains('on')) e.innerHTML = ''; }, 650); res(v); };
    e.querySelector('.go-back').addEventListener('click', () => done('back')); e.querySelector('.go-again').addEventListener('click', () => done('again')); const nx = e.querySelector('.go-next'); if (nx) nx.addEventListener('click', () => done('next')); }); }
export const homeOpen = () => { const e = document.getElementById('home'); return !!(e && e.classList.contains('on')); };
