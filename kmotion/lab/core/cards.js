// 케이모션 과학실 — 고르기(예상하기): 떠 있는 카드 셋 중 하나에 손을 1초 대고 있으면 고른다(테두리가 차오름).
// 동사가 아니라 공통 부품. 터치·마우스는 눌러서 바로 고른다. 맞고 틀림은 따지지 않는다(실험 노트에 「내 예상」으로 남김).
const DWELL = 1.0;   // 초

export function createCards(hudEl){
  const wrap = document.createElement('div'); wrap.className = 'cards'; wrap.style.display = 'none'; hudEl.appendChild(wrap);
  let cur = null;   // { els:[], prog:[], onPick, picked }
  function close(){ wrap.style.display = 'none'; wrap.innerHTML = ''; cur = null; }
  function pick(i){ if (!cur || cur.picked != null) return; cur.picked = i; cur.els.forEach((e, k) => e.classList.toggle('picked', k === i)); cur.els.forEach((e, k) => e.classList.toggle('dim', k !== i));
    const cb = cur.onPick; cur.closeIn = .9; cur.cb = () => cb && cb(i); }
  return {
    get open(){ return !!cur; },
    /** question: 「어떻게 될까?」 · choices: ['시든다', '그대로다', '유리처럼 된다'] */
    show(question, choices, onPick){
      close(); wrap.style.display = ''; const q = document.createElement('div'); q.className = 'q'; q.textContent = question; wrap.appendChild(q);
      const row = document.createElement('div'); row.className = 'row'; wrap.appendChild(row);
      const els = choices.map((c, i) => { const b = document.createElement('button'); b.className = 'card'; b.innerHTML = `<span class="ring"></span><span class="t"></span>`; b.querySelector('.t').textContent = c; b.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); pick(i); }); row.appendChild(b); return b; });
      cur = { els, prog: choices.map(() => 0), onPick, picked: null, closeIn: 0, cb: null, start: [null, null], armed: [false, false] };   /* 카드가 뜬 뒤 손이 한 번 움직여야 고르기 시작(쉬던 손 밑에 카드가 떠서 저절로 골라지지 않게) */
    },
    close,
    /** 매 프레임: hands = [{present, x, y}] 화면 비율. 손이 카드 위에 머무는 동안 테두리가 차오른다. */
    update(dt, hands){
      if (!cur) return;
      if (cur.picked != null) { cur.closeIn -= dt; if (cur.closeIn <= 0) { const cb = cur.cb; close(); cb && cb(); } return; }
      const W = innerWidth, H = innerHeight;
      hands.forEach((h, k) => { if (k > 1 || !h || !h.present) return; if (!cur.start[k]) cur.start[k] = { x: h.x, y: h.y }; else if (!cur.armed[k] && Math.hypot(h.x - cur.start[k].x, h.y - cur.start[k].y) > .06) cur.armed[k] = true; });
      cur.els.forEach((el, i) => { const r = el.getBoundingClientRect();
        const over = hands.some((h, k) => h.present && cur.armed[k] && h.src !== 'mouse' && h.src !== 'touch' && h.src !== 'pen' && h.x * W >= r.left && h.x * W <= r.right && h.y * H >= r.top && h.y * H <= r.bottom);
        cur.prog[i] = over ? Math.min(1, cur.prog[i] + dt / DWELL) : Math.max(0, cur.prog[i] - dt * 2.5);
        el.style.setProperty('--p', cur.prog[i].toFixed(3)); el.classList.toggle('hot', over);
        if (cur.prog[i] >= 1) pick(i); });
    },
  };
}
