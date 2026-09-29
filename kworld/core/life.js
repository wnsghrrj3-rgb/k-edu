// 케이히스토리 엔진 · life.js — 「인생 층」(역사 인생게임). world.life 가 life.json 을 가리키면 켜진다. 코어는 시대 이름을 모른다.
//  · 상황은 장소에서 시작한다: 그 장소에 들어서면(또는 깃발이 서면) 「상황 카드」 한 장 — 할 수 있는 일은 버튼이 아니라 세상 속 행동이다.
//  · 선택 = 몸으로 한 행동(깃발·주머니). 그 깃발이 서는 순간 「결과 카드」 — 값(솜씨·인심)·역사 사실 한 줄.
//  · 값: 솜씨 ✋ · 인심 🤝 · 곡식 🌾(잠김 — 다음 시대에서 열린다). 능력 다섯(눈·손·발·배·몸) 1~3, 하면 오른다.
//  · 굴림(roll): 능력 단계 vs 어려움. 실패해도 막히지 않는다 — 「왜 안 됐는지」 한 줄, 다시 할 수 있다.
//  · 흔적(hurt): 다치면 절뚝이고(느려짐) 어떤 선택지는 회색이 된다. 끝까지 남는다.
//  · 꼭 나오는 상황은 전부, 섞여 나오는 상황은 판마다 몇 개만(태어남 때 정한 씨앗).
const ABIL = ['눈', '손', '발', '배', '몸'];
const DOTS = (lv) => ({ 3: '●●●', 2: '●●○', 1: '●○○' })[Math.max(1, Math.min(3, lv))] || '●●○';
const LV = ['', '낮음', '보통', '높음'];
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export class Life {
  constructor(g, data) {
    this.g = g; this.d = data; this.values = { craft: 0, heart: 0 }; this.abil = {}; this.xp = {}; this.hurt = new Set(); this.opened = new Set(); this.done = new Set(); this.queue = []; this.log = []; this.tries = {}; this.seed = 0; this.mixed = null; this.busy = false;
  }
  /** 태어남 뒤(캐릭터가 정해진 뒤) 부른다 — 능력 단계·섞여 나오는 상황 뽑기 */
  begin() {
    const c = this.g.character; for (const a of ABIL) { this.abil[a] = c?.levels?.[a] ?? 2; this.xp[a] = 0; }
    if (!this.mixed) { this.seed = this.seed || ((Date.now() % 100000) + Math.floor(Math.random() * 1000)); this.mixed = this.pickMixed(this.seed); }
    this.g.e.onFrame.push((dt) => this.tick(dt)); this.hud(); this.render();
  }
  /** 씨앗으로 섞여 나오는 상황을 n개 뽑는다(판마다 다르게, 저장하면 같은 판) */
  pickMixed(seed) {
    let s = seed * 9301 + 49297; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const pool = (this.d.situations || []).filter((x) => !x.must).map((x) => x.id); const n = Math.min(this.d.mixedCount ?? 5, pool.length);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, n);
  }
  get situations() { return (this.d.situations || []).filter((x) => x.must || (this.mixed || []).includes(x.id)); }
  sit(id) { return (this.d.situations || []).find((x) => x.id === id); }
  // ---------- 값·능력 ----------
  add(key, n) { if (!n) return; this.values[key] = Math.max(0, (this.values[key] || 0) + n); this.render(); this.g.save?.touch(); }
  gain(ab, n = 1) {
    if (!ab || !ABIL.includes(ab)) return; const before = this.abil[ab]; if (before >= 3) return; this.xp[ab] = (this.xp[ab] || 0) + n; const need = this.d.xpPerLevel ?? 2;
    if (this.xp[ab] >= need) { this.xp[ab] -= need; this.abil[ab] = before + 1; this.g.ui.say(`${ab}이(가) 익어 간다 ${DOTS(before)} → **${DOTS(before + 1)}**`, 3400); this.render(); this.g.save?.touch(); }
  }
  /** 굴림 — rule.roll = { ab:'손', hard:1~3, why:'실패 때 한 줄' }. 성공/실패와 함께 능력이 오른다(낮은 단계에서 성공하면 더 많이). */
  roll(rule) {
    const R = rule.roll; if (!R) return true; const lv = this.abil[R.ab] ?? 2; const hard = R.hard ?? 2; const key = R.key || R.ab + ':' + hard; this.tries[key] = (this.tries[key] || 0) + 1;
    const p = lv >= hard ? 0.9 : lv === hard - 1 ? 0.55 : 0.3; const ok = Math.random() < p || (this.tries[key] >= 3 && lv >= hard - 1);   // 세 번째부터는 한 단계 낮아도 된다(막지 않는다)
    this.gain(R.ab, ok ? (lv < hard ? 2 : 1) : 1);
    if (!ok) { this.lastWhy = this.whyLine(R, lv, hard); this.g.ui.say(`${rule.rollFail || R.fail || '…안 됐다.'}\n🧭 **왜?** ${this.lastWhy}`, 5600); this.g.flag(rule.rollFailFlag); if (rule.rollFailHunger) this.g.hunger = Math.max(0, this.g.hunger + rule.rollFailHunger); if (rule.rollHurt) this.injure(rule.rollHurt); }
    return ok;
  }
  whyLine(R, lv, hard) {
    const hist = this.tries[R.key || R.ab + ':' + hard]; const tail = R.why || `${R.ab}이(가) 아직 ${LV[lv]}이다. 필요한 건 ${LV[hard]}.`;
    return `${tail}${hist >= 2 ? ` 벌써 ${hist}번째다 — 하면 할수록 익는다.` : ''}`;
  }
  /** 흔적 — 다침. 끝까지 남는다. leg: 절뚝(느려짐) */
  injure(kind) { if (this.hurt.has(kind)) return; this.hurt.add(kind); const t = (this.d.hurts || {})[kind]; this.g.ui.say(t?.say || '…다쳤다. 흔적이 남는다.', 4800); this.render(); this.g.save?.touch(); }
  get speedMul() { return this.hurt.has('leg') ? (this.d.hurts?.leg?.speed ?? 0.7) : 1; }
  /** 선택지 회색 — c.if 조건이 거짓이면 못 누른다(이유 한 줄). hurt:leg 같은 흔적도 깃발처럼 본다 */
  cond(expr) { if (!expr) return true; return expr.split('&&').every((t) => { t = t.trim(); const neg = t.startsWith('!'); const f = neg ? t.slice(1) : t; const v = f.startsWith('hurt:') ? this.hurt.has(f.slice(5)) : (f.startsWith('val:') ? this.valCond(f.slice(4)) : this.g.flags.has(f)); return neg ? !v : v; }); }
  valCond(s) { const m = s.match(/^(\w+)(>=|<=|>|<|=)(\d+)$/); if (!m) return false; const v = this.values[m[1]] || 0, n = Number(m[3]); return { '>=': v >= n, '<=': v <= n, '>': v > n, '<': v < n, '=': v === n }[m[2]]; }
  // ---------- 상황 ----------
  tick(dt) {
    const g = this.g; if (!g.p?.pos || g.restoring || g.story?.cutsceneOn) return;
    this.t = (this.t || 0) + dt; if (this.t < 0.5) return; this.t = 0;
    for (const s of this.situations) {
      if (this.opened.has(s.id) || !this.cond(s.if)) continue;
      if (s.on) { if (this.cond(s.on)) this.open(s); continue; }   // on 이 있으면 장소는 나침반일 뿐, 여는 건 깃발
      if (s.place) { const a = g.e.areas.get(s.place); if (a && Math.hypot(a.x - g.p.pos.x, a.z - g.p.pos.z) < (s.radius || 11)) this.open(s); }
    }
    for (const s of this.situations) if (this.opened.has(s.id) && !this.done.has(s.id)) this.resolve(s);
    this.flush();
  }
  onFlag() { if (this.g.restoring) return; for (const s of this.situations) { if (!this.opened.has(s.id) && s.on && this.cond(s.on) && this.cond(s.if)) this.open(s); if (this.opened.has(s.id) && !this.done.has(s.id)) this.resolve(s); } this.flush(); }
  open(s) {
    if (this.opened.has(s.id)) return; this.opened.add(s.id); const g = this.g;
    g.flags.add('sit:' + s.id + ':open'); g.checkpoint = { act: 'sit:' + s.id, flags: [...g.flags], inventory: [...g.inventory] };   // 쓰러지면 이 상황 앞으로(열린 채)
    g.flag('sit:' + s.id + ':open'); if (s.goal) g.ui.setGoal(s.goal); if (s.onOpen) this.doThen(s.onOpen);
    this.queue.push({ kind: 'sit', s }); this.flush();
  }
  resolve(s) {
    for (const c of s.choices || []) if (this.hit(c)) { this.finish(s, c); return; }
  }
  hit(c) { if (c.done && !this.g.cond(c.done)) return false; if (c.count && this.g.count(c.count[0]) < c.count[1]) return false; if (!c.done && !c.count) return false; return true; }
  finish(s, c) {
    const g = this.g; this.done.add(s.id);
    const deltas = []; if (c.craft) { this.add('craft', c.craft); deltas.push(`✋ 솜씨 ${c.craft > 0 ? '+' : ''}${c.craft}`); } if (c.heart) { this.add('heart', c.heart); deltas.push(`🤝 인심 ${c.heart > 0 ? '+' : ''}${c.heart}`); }
    for (const a of [].concat(c.gain || [])) this.gain(a, 1); if (c.hurt) this.injure(c.hurt);
    this.log.push({ sit: s.id, choice: c.id, t: Date.now() }); g.telemetry && ((g.telemetry.life ??= []).push({ sit: s.id, choice: c.id }));
    this.queue.push({ kind: 'result', s, c, deltas }); if (c.then) this.queue.push({ kind: 'then', list: c.then });
    g.flag(['sit:' + s.id + ':done', 'sit:' + s.id + ':' + c.id]);   // 결과 카드를 먼저 줄 세운 뒤 깃발(깃발이 여는 다음 상황은 그 뒤에)
    if (c.retry) { this.done.delete(s.id); g.flags.delete('sit:' + s.id + ':done'); g.flags.delete('sit:' + s.id + ':' + c.id); if (c.done) for (const f of c.done.split('&&')) if (!f.trim().startsWith('!')) g.flags.delete(f.trim()); }   // 쓰러짐: 그 상황 앞으로 — 다른 선택을 해 본다
    this.flush(); g.save?.touch();
  }
  /** 카드는 한 번에 하나 — 다른 판이 열려 있으면 기다린다 */
  flush() {
    const g = this.g; if (this.busy || !this.queue.length || g.ui.isOpen?.() || g.story?.cutsceneOn) return;
    const q = this.queue.shift(); this.busy = true;
    const done = () => { this.busy = false; g.p.enabled = true; setTimeout(() => this.flush(), 120); };
    if (q.kind === 'sit') this.showSituation(q.s, done);
    else if (q.kind === 'result') this.showResult(q.s, q.c, q.deltas, done);
    else if (q.kind === 'then') { this.busy = false; this.doThen(q.list); setTimeout(() => this.flush(), 120); }
    else done();
  }
  showSituation(s, cb) {
    const g = this.g; g.p.enabled = false; g.sound?.play?.('night_rustle', 0.2);
    const ways = (s.ways || []).map((w) => `<li>${esc(w)}</li>`).join('');
    g.ui.open(`<div class="chk life"><div class="tag">${esc(s.tag || '상황')}${s.must ? '' : ' · 이번 판'}</div><h3>${esc(s.title)}</h3>${(s.body || []).map((b) => `<p>${esc(b)}</p>`).join('')}${ways ? `<p class="sub">할 수 있는 것 — 말이 아니라 몸으로:</p><ul class="mlist">${ways}</ul>` : ''}</div>`, [{ label: s.button || '…해 보자', primary: true, onClick: () => { g.ui.close(); cb(); } }]);
  }
  showResult(s, c, deltas, cb) {
    const g = this.g; g.p.enabled = false; g.sound?.play?.(c.bad ? 'growl' : 'night_rustle', 0.15);
    const why = c.why ? `<p class="why">🧭 <b>왜?</b> ${esc(c.why)}</p>` : '';
    const fact = (c.fact || s.fact) ? `<div class="facts"><div>📜 <b>실제</b> ${esc(c.fact || s.fact)}</div></div>` : '';
    g.ui.open(`<div class="chk life ${c.bad ? 'bad' : ''}"><div class="tag">${c.bad ? '결과 — 안 됐다' : '결과'}</div><h3>${esc(c.title || c.label || '')}</h3>${(c.result || []).map((b) => `<p>${esc(b)}</p>`).join('')}${why}${deltas.length ? `<p class="delta">${deltas.join(' · ')}</p>` : ''}${fact}</div>`, [{ label: c.button || '알겠어', primary: true, onClick: () => { g.ui.close(); cb(); } }]);
  }
  /** 결과 뒤 세상 바꾸기(사건과 같은 명령어 + remove/fire) */
  doThen(list) {
    const g = this.g; const rest = [];
    for (const a of list) { if (a.remove) { for (const pat of [].concat(a.remove)) for (const k of [...g.e.interactables.keys()]) if (k === pat || (pat.endsWith('*') && k.startsWith(pat.slice(0, -1)))) g.e.removeInteractable(k); } else if (a.take) { for (const k of [].concat(a.take)) g.take(k); g.renderInv?.(); } else if (a.takeAll) { let n = 0; while (g.has(a.takeAll)) { g.take(a.takeAll); n++; } g.renderInv?.(); } else if (a.halfFood) { const have = g.inventory.filter((k) => (this.d.food || ['berry', 'meat', 'fish']).includes(k)); for (let i = 0; i < Math.floor(have.length / 2); i++) g.take(have[i]); g.renderInv?.(); } else if (a.give) { for (const k of [].concat(a.give)) g.inventory.push(k); g.renderInv?.(); } else if (a.flee) { for (const k of [...g.e.interactables.keys()]) if (k === a.flee.pattern || (a.flee.pattern.endsWith('*') && k.startsWith(a.flee.pattern.slice(0, -1)))) { const it = g.e.interactables.get(k); if (it && g.story) g.story.flee(it, { flee: { to: a.flee.to || [0, 90], sec: a.flee.sec || 4 } }); } } else if (a.end) { this.end(a.end); } else rest.push(a); }
    if (rest.length) g.story?.doActions(rest);
  }
  /** 쓰러진 뒤(위험층) — 상황 앞으로 돌아온다: 열린 상황은 다시 열리고, 값·흔적은 남는다 */
  afterCollapse(reason) {
    const g = this.g; for (const s of this.situations) { const open = g.flags.has('sit:' + s.id + ':open'), done = g.flags.has('sit:' + s.id + ':done'); if (!open) this.opened.delete(s.id); if (!done) this.done.delete(s.id); }
    const cp = g.checkpoint?.act?.startsWith('sit:') ? this.sit(g.checkpoint.act.slice(4)) : null; if (cp?.wake) g.ui.say(cp.wake, 5200); if (cp?.onWake) this.doThen(cp.onWake);
    this.render();
  }
  /** 이번 삶 끝 — 값·흔적·다음 대. 갈림은 값과 흔적으로 정해진다(대본이 아니라 실제 수치) */
  end(e) {
    const g = this.g; g.p.enabled = false; const v = this.values; const branch = (e.branches || []).find((b) => this.cond(b.if)) || (e.branches || []).slice(-1)[0] || {};
    g.flag(['life:end', 'life:' + (branch.id || 'end')]); g.results = [...(g.results || []), { id: 'life:end', concept: 'hist.life', ok: true, open: JSON.stringify({ craft: v.craft, heart: v.heart, hurt: [...this.hurt], log: this.log, branch: branch.id }) }];
    const marks = [...this.hurt].map((h) => this.d.hurts?.[h]?.name || h);
    const html = `<div class="chk life end"><div class="tag">${esc(e.tag || '이번 삶')}</div><h3>${esc(branch.title || e.title || '')}</h3>${(branch.body || []).map((b) => `<p>${esc(b)}</p>`).join('')}<ul class="mlist"><li>✋ 솜씨 <b>${v.craft}</b> · 🤝 인심 <b>${v.heart}</b> · 🌾 곡식 🔒</li><li>능력 ${ABIL.map((a) => `${a} ${DOTS(this.abil[a])}`).join(' · ')}</li>${marks.length ? `<li>흔적 — ${esc(marks.join(', '))}</li>` : ''}<li>겪은 상황 ${this.log.length}가지</li></ul>${e.fact ? `<div class="facts"><div>📜 <b>실제</b> ${esc(e.fact)}</div></div>` : ''}${e.next ? `<p class="sub">${esc(e.next)}</p>` : ''}</div>`;
    const btns = [{ label: e.again || '다시 태어난다', primary: true, onClick: () => { g.save?.clear(); const u = new URL(location.href); u.searchParams.set('resume', '0'); location.href = u.toString(); } }];
    if (g.world.gate) btns.push({ label: g.world.gate.ready ? `${g.world.gate.nextName}로 가기` : `${g.world.gate.nextName}로 (준비 중)`, onClick: () => { const gt = g.world.gate; if (gt.ready) { const u = new URL(location.href); u.searchParams.set('era', gt.next); location.href = u.toString(); } else g.ui.say(`${gt.nextName}는 다음에 열려. 솜씨·인심은 그때 넘어간다.`, 4000); } });
    btns.push({ label: '더 둘러보기', onClick: () => { g.ui.close(); g.p.enabled = true; } });
    g.ui.open(html, btns); g.save?.touch();
  }
  // ---------- 저장 ----------
  snapshot() { return { values: this.values, abil: this.abil, xp: this.xp, hurt: [...this.hurt], opened: [...this.opened], done: [...this.done], log: this.log, seed: this.seed, mixed: this.mixed, tries: this.tries }; }
  restore(s) { if (!s) return; Object.assign(this.values, s.values || {}); Object.assign(this.abil, s.abil || {}); Object.assign(this.xp, s.xp || {}); this.hurt = new Set(s.hurt || []); this.opened = new Set(s.opened || []); this.done = new Set(s.done || []); this.log = s.log || []; this.seed = s.seed || this.seed; this.mixed = s.mixed || this.mixed; this.tries = s.tries || {}; this.render(); }
  // ---------- 화면 ----------
  hud() {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function' || document.getElementById('life')) return;
    const st = document.createElement('style'); st.textContent = `#life{position:fixed;top:199px;right:22px;width:150px;background:var(--panel);border:1px solid var(--line);padding:10px 13px;border-radius:14px;font-size:12px;backdrop-filter:blur(10px);line-height:1.55}#life .v{display:flex;justify-content:space-between}#life .v b{font-variant-numeric:tabular-nums}#life .lock{opacity:.55}#life .ab{margin-top:6px;padding-top:6px;border-top:1px solid var(--line);display:grid;grid-template-columns:1fr 1fr;gap:0 8px;font-size:11px;letter-spacing:.5px}#life .ab span i{font-style:normal;opacity:.9}#life .hurt{margin-top:5px;color:#f3a05a;font-size:11px}#life .up{animation:lifeup .9s ease}@keyframes lifeup{0%{transform:scale(1.25);color:#ffe08a}100%{transform:none}}.chk.life .why{background:rgba(255,220,138,.12);border-left:3px solid #ffe08a;padding:8px 10px;border-radius:8px}.chk.life .delta{font-weight:700;letter-spacing:.3px}.chk.life.bad .tag{color:#f3a05a}.pbtns button.gray{opacity:.45;cursor:not-allowed;text-decoration:line-through}@media(max-width:760px){#life{right:10px;top:10px;width:118px;padding:7px 9px;font-size:11px}#life .ab{display:none}}`;
    document.head.appendChild(st); const el = document.createElement('div'); el.id = 'life'; document.body.appendChild(el); this.el = el;
  }
  render() {
    if (!this.el) return; const v = this.values; const prev = this.el.dataset.v || '';
    const marks = [...this.hurt].map((h) => this.d.hurts?.[h]?.name || h).join(' · ');
    this.el.innerHTML = `<div class="v"><span>✋ 솜씨</span><b>${v.craft}</b></div><div class="v"><span>🤝 인심</span><b>${v.heart}</b></div><div class="v lock" title="${esc(this.d.grainLocked || '들고 다닐 수도, 쌓아 둘 수도 없다.')}"><span>🌾 곡식</span><b>🔒</b></div><div class="ab">${ABIL.map((a) => `<span>${a} <i>${DOTS(this.abil[a] ?? 2)}</i></span>`).join('')}</div>${marks ? `<div class="hurt">흔적 · ${esc(marks)}</div>` : ''}`;
    const now = `${v.craft}/${v.heart}/${ABIL.map((a) => this.abil[a]).join('')}`; if (prev && prev !== now) { this.el.classList.remove('up'); void this.el.offsetWidth; this.el.classList.add('up'); } this.el.dataset.v = now;
  }
}
