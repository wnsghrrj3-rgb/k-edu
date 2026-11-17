/* 수학 놀이터 「수가 화면에」 부품(N00 기준 1) — 다리 길·광장·가게 섬이 같이 쓴다.
 * 팻말: 채워야 할 수가 세계 안 자리 위에 떠 있다(채울수록 준다) · 띠: 해낼 때마다 그 수가 위쪽에 모인다(2 + 5 + 1) ·
 * 끝의 셈: `= ?` 와 고를 수 셋 — 아닌 수는 물러날 뿐(가위표·감점 없음), 맞는 수를 눌러야 끝난다 · 불꽃: 연달아 해낸 수.
 * 화면 위 표시라 코드로 그려도 된다(물체가 아님). id 는 #tray · #pick · #streak 하나씩. */
const CSS = `
.sign{position:fixed;z-index:3;transform:translate(-50%,-100%);min-width:54px;height:54px;padding:0 10px;display:flex;align-items:center;justify-content:center;gap:6px;background:#fff4d6;color:#4a2a0c;border:4px solid #8a5a2b;border-radius:14px;font-weight:900;font-size:2rem;line-height:1;pointer-events:none;box-shadow:0 5px 0 rgba(60,30,5,.35);font-family:inherit}
.sign::after{content:"";position:absolute;left:50%;top:100%;width:6px;height:16px;margin-left:-3px;background:#8a5a2b;border-radius:0 0 3px 3px}
.sign.pop{animation:askpop .35s}@keyframes askpop{40%{transform:translate(-50%,-100%) scale(1.3)}}
.sign.night{background:#1d2a48;color:#ffd34d;border-color:#ffd34d;box-shadow:0 0 18px rgba(255,211,77,.55)}
.sign.night::after{background:#ffd34d}.sign small{font-size:.45em;font-weight:800;opacity:.85}
#tray{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:5;display:none;align-items:center;gap:10px;background:rgba(10,20,40,.5);border-radius:999px;padding:6px 18px;color:#fff;font-weight:900;font-size:1.7rem;line-height:1;pointer-events:none;font-family:inherit;white-space:nowrap}
#tray.on{display:flex}#tray b{min-width:38px;height:38px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff4d6;color:#4a2a0c;border-radius:10px;padding:0 6px;animation:askpop2 .4s;position:relative}#tray i{font-style:normal}
#tray b small{position:absolute;top:100%;margin-top:3px;font-size:.42em;color:#fff;font-weight:800;white-space:nowrap}
#tray b.hole{background:transparent;color:#fff;border:3px dashed #fff}#tray b.done{background:#ffd34d}@keyframes askpop2{0%{transform:scale(.3)}70%{transform:scale(1.25)}}
#pick{position:fixed;left:50%;top:26%;transform:translateX(-50%);z-index:6;display:none;gap:22px}#pick.on{display:flex}
#pick button{width:92px;height:92px;border-radius:24px;border:5px solid #8a5a2b;background:#fff4d6;color:#4a2a0c;font-weight:900;font-size:2.6rem;line-height:1;font-family:inherit;box-shadow:0 7px 0 rgba(60,30,5,.4);cursor:pointer;touch-action:manipulation;transition:transform .5s,opacity .5s}
#pick button:active{transform:translateY(4px)}#pick button.away{transform:translateY(40px) rotate(12deg);opacity:.15}
#streak{position:fixed;right:calc(14px + env(safe-area-inset-right,0px));top:calc(12px + env(safe-area-inset-top,0px));z-index:5;font-size:1.7rem;line-height:1.3;pointer-events:none}`;
let cssIn = false; function css(){ if (cssIn) return; cssIn = true; const s = document.createElement('style'); s.id = 'ask-css'; s.textContent = CSS; document.head.appendChild(s); }
const el = (tag, id) => { css(); let e = id && document.getElementById(id); if (!e) { e = document.createElement(tag); if (id) e.id = id; document.body.appendChild(e); } return e; };
const shuffle = (a, rnd = Math.random) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** 고를 수 셋: 맞는 수 + 가까운 둘(0 이상, 서로 다름, 순서 섞임). */
export function picks(sum, rnd = Math.random){ const near = shuffle([sum - 2, sum - 1, sum + 1, sum + 2].filter(n => n >= 0), rnd).slice(0, 2); return shuffle([sum, ...near], rnd); }

// ── 팻말: 세계 안 자리 위에 뜨는 수
/** 팻말 n 개를 새로 만든다 → [요소…] */
export function signs(n){ css(); document.querySelectorAll('.sign').forEach(e => e.remove()); return Array.from({ length: n }, () => { const e = document.createElement('div'); e.className = 'sign'; document.body.appendChild(e); return e; }); }
/** 팻말 하나를 그린다. at = 화면 좌표 {x,y} 또는 null(숨김) · text = 수 · cls = 'night' 등 · small = 수 앞의 작은 말. */
export function signDraw(e, at, text, cls = '', small = ''){ if (!at || at.x < -40 || at.x > innerWidth + 40) { e.style.display = 'none'; return; } e.style.display = ''; e.style.left = at.x + 'px'; e.style.top = at.y + 'px';
  const want = (small ? `<small>${small}</small>` : '') + text; if (e.dataset.v !== want) { e.dataset.v = want; e.innerHTML = want; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); } e.classList.toggle('night', cls === 'night'); }

// ── 띠 · 끝의 셈
export function trayClear(){ const t = el('div', 'tray'), p = el('div', 'pick'); t.innerHTML = ''; t.className = ''; p.innerHTML = ''; p.className = ''; }
/** 띠에 수 하나를 더한다. op = '+' · '−' · '' (첫 수) · label = 수 밑의 작은 말. */
export function trayAdd(n, op = '+', label = ''){ const t = el('div', 'tray'); if (t.children.length && op) { const p = document.createElement('i'); p.textContent = op; t.appendChild(p); } const b = document.createElement('b'); b.textContent = n; if (label) { const s = document.createElement('small'); s.textContent = label; b.appendChild(s); } t.appendChild(b); t.className = 'on'; }
/** 끝의 셈: 띠에 `= ?` 를 붙이고 고를 수 셋을 띄운다. 아닌 수는 물러날 뿐, 맞는 수를 누르면 끝난다.
 *  o = { sum, picks?, onWrong(n), onPick(n, right) } → Promise(맞는 수). cancel() 로 거둘 수 있다. */
export function ask(o){ const t = el('div', 'tray'), pk = el('div', 'pick'), list = o.picks || picks(o.sum); let done = false; const job = { sum: o.sum, picks: list, cancel(){ done = true; pk.className = ''; } };
  job.promise = new Promise(res => { const eq = document.createElement('i'); eq.textContent = '='; const hole = document.createElement('b'); hole.className = 'hole'; hole.textContent = '?'; t.append(eq, hole); t.className = 'on'; pk.innerHTML = ''; pk.className = 'on';
    list.forEach(n => { const b = document.createElement('button'); b.textContent = n; b.dataset.n = n; b.onclick = () => { if (done) return; const right = n === o.sum; if (o.onPick) o.onPick(n, right);
      if (!right) { b.disabled = true; b.classList.add('away'); if (o.onWrong) o.onWrong(n); return; }
      done = true; pk.className = ''; hole.textContent = n; hole.className = 'done'; res(n); }; pk.appendChild(b); }); });
  return job; }

// ── 불꽃: 연달아 해낸 수(글 없음)
export function flames(n){ const e = el('div', 'streak'); e.textContent = n > 1 ? '🔥'.repeat(Math.min(n, 6)) : ''; }
