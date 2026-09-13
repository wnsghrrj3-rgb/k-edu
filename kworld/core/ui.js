// 케이히스토리 엔진 · ui.js — 화면 조각. 규칙은 game.js가, 여긴 그리기만.
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

export class UI {
  constructor() {
    this.hud = $('hud'); this.goal = $('goal'); this.prompt = $('prompt'); this.toast = $('toast');
    this.hungerBar = $('hungerbar'); this.inv = $('inv'); this.panel = $('panel');
    this.toastTimer = null;
  }
  setTitle(t, q) { $('title').textContent = t; $('question').textContent = q; }
  setGoal(t) { this.goal.textContent = t; }
  setMission(title, i, n) { $('mtitle').textContent = title; $('mcount').textContent = `${Math.min(i + 1, n)}/${n}`; $('mission').classList.add('flash'); setTimeout(() => $('mission').classList.remove('flash'), 900); }
  setCompass(name, bearing, dist) { const el = $('compass'); el.style.display = 'flex'; $('cname').textContent = name; $('cdist').textContent = dist < 6 ? '여기' : Math.round(dist) + 'm'; $('carrow').style.transform = `rotate(${-bearing}rad)`; }
  pulseHint() { $('hintbtn').classList.add('pulse'); setTimeout(() => $('hintbtn').classList.remove('pulse'), 6000); }
  setHunger(v, slow) { this.hungerBar.style.width = Math.max(0, Math.min(100, v)) + '%'; this.hungerBar.className = slow ? 'low' : ''; $('hungerlabel').textContent = slow ? '배가 너무 고파 느려진다' : '배부름'; }
  /** 근접 안내. info = 멀리서 보는 설명(누를 것 없음), action = 지금 할 수 있는 일(누르기) */
  setPrompt(p) {
    if (!p) { this.prompt.style.display = 'none'; return; }
    this.prompt.style.display = 'block';
    if (p.action) this.prompt.innerHTML = `<div class="act"><b>${esc(p.name)}</b> · ${esc(p.verb)}</div><div class="how">키보드 <kbd>E</kbd> 또는 <kbd>행동</kbd> 버튼</div>`;
    else this.prompt.innerHTML = `<div class="what">👀 <b>${esc(p.name)}</b> — ${esc(p.info)}</div><div class="near">아직 누를 건 없어 · 더 가까이 가면 할 수 있는 일이 떠</div>`;
  }
  say(text, ms = 3200) {
    this.toast.innerHTML = md(text); this.toast.style.display = 'block';
    clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => { this.toast.style.display = 'none'; }, ms);
  }
  renderInventory(items, defs, onTap) {
    this.inv.innerHTML = '';
    const counts = {}; for (const k of items) counts[k] = (counts[k] || 0) + 1;
    for (const [k, n] of Object.entries(counts)) {
      const d = defs[k]; const el = document.createElement('button'); el.className = 'slot';
      el.innerHTML = `<span class="ic">${d.icon}</span><span class="nm">${esc(d.name)}</span>${n > 1 ? `<span class="ct">${n}</span>` : ''}`;
      el.title = d.desc; el.onclick = () => onTap(k); this.inv.appendChild(el);
    }
    if (!items.length) this.inv.innerHTML = '<div class="empty">주머니가 비었어</div>';
  }
  /** 패널 하나. html + 버튼들 [{label, onClick, primary}] */
  open(html, buttons = [], cls = '') {
    this.panel.className = 'open ' + cls; this.panel.innerHTML = `<div class="pbody">${html}</div><div class="pbtns"></div>`;
    const bb = this.panel.querySelector('.pbtns');
    for (const b of buttons) { const el = document.createElement('button'); el.textContent = b.label; if (b.primary) el.className = 'primary'; el.onclick = b.onClick; bb.appendChild(el); }
    return this.panel;
  }
  close() { this.panel.className = ''; this.panel.innerHTML = ''; }
  isOpen() { return this.panel.classList.contains('open'); }

  craftPanel(inventory, defs, recipes, onCraft, onClose) {
    const counts = {}; for (const k of inventory) counts[k] = (counts[k] || 0) + 1;
    let html = '<h3>만들기</h3><p class="sub">두세 가지를 합치면 새 것이 된다. 무엇과 무엇이 맞을지 해 봐.</p><div class="recipes">';
    for (const r of recipes) {
      const need = {}; for (const i of r.in) need[i] = (need[i] || 0) + 1;
      const ok = Object.entries(need).every(([k, n]) => (counts[k] || 0) >= n);
      const known = r.known;
      html += `<button class="recipe ${ok ? 'ok' : ''}" data-out="${r.out}">${r.in.map((i) => defs[i].icon).join(' + ')} → ${known ? defs[r.out].icon + ' ' + esc(defs[r.out].name) : '❓'}<small>${known ? esc(r.name) : (ok ? '해 볼 수 있다' : '재료가 모자라')}</small></button>`;
    }
    html += '</div>';
    const p = this.open(html, [{ label: '닫기', onClick: onClose }]);
    p.querySelectorAll('.recipe').forEach((el) => { el.onclick = () => onCraft(el.dataset.out); });
  }
  whyCard(card, onClose) {
    const html = `<div class="why"><div class="tag">잠깐, 생각해 볼까?</div><h3>${md(card.title)}</h3>${card.body.map((b) => `<p>${md(b)}</p>`).join('')}
      <div class="facts"><div>📜 <b>실제</b> ${esc(card.fact)}</div><div>🎮 <b>게임 속 상상</b> ${esc(card.fiction)}</div></div></div>`;
    this.open(html, [{ label: '알겠어', onClick: onClose, primary: true }], 'whycard');
  }
  npcLine(name, text, onClose) { this.open(`<div class="npc"><b>${esc(name)}</b><p>${md(text)}</p></div>`, [{ label: '응', onClick: onClose, primary: true }], 'npcpanel'); }
  /** 확인하기: 문항 순서대로. onAnswer(q, value) → {ok, revisit?} */
  check(data, onAnswer, onFinish, onRevisit) {
    let i = 0; const results = [];
    const show = () => {
      if (i >= data.questions.length) { onFinish(results); return; }
      const q = data.questions[i]; let html = `<div class="chk"><div class="tag">확인하기 ${i + 1}/${data.questions.length}</div><h3>${esc(q.q)}</h3>`;
      if (q.type === 'choice') {
        html += '<div class="opts">' + q.options.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('') + '</div>';
        const p = this.open(html + '</div>', []);
        p.querySelectorAll('.opt').forEach((el) => { el.onclick = () => {
          const ok = Number(el.dataset.k) === q.answer; results.push({ id: q.id, concept: q.concept, ok });
          if (ok) { this.say('그래, 네가 겪은 그대로야.'); i++; show(); }
          else { this.open(`<div class="chk"><h3>음, 다시 한 번 가서 보고 올까?</h3><p>${esc(q.revisitText)}</p></div>`, [{ label: '다시 가 보기', primary: true, onClick: () => { this.close(); onRevisit(q); } }, { label: '여기서 다시 고르기', onClick: () => { results.pop(); show(); } }]); }
        }; });
      } else {
        html += `<textarea id="openans" rows="4" placeholder="네 생각을 써 봐. 정답은 없어."></textarea><p class="sub">이 답은 점수를 매기지 않아. 선생님만 읽어.</p></div>`;
        this.open(html, [{ label: '다 썼어', primary: true, onClick: () => { const v = $('openans').value.trim(); if (!v) { this.say('한 줄이라도 써 볼까?'); return; } results.push({ id: q.id, concept: q.concept, open: v }); i++; show(); } }]);
      }
    };
    show();
  }
}
