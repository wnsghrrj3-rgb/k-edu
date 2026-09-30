/* ============================================================================
   stage2-learn.js — 자기주도 투영 무대 (학생이 혼자 넘기며 푸는 화면) · 47차 2026-09-30
   · 그림·부품·글은 교사 무대와 같은 renderSlide 로 그린다 — 정본 하나, 화면 둘.
   · 교사 층은 KT2_PROJECT.project() 가 이미 뺐다. 여기는 학생이 스스로 푸는 층만 얹는다:
     하나 고르기·모두 고르기·수 넣기(채점) · 생각하고 정답 보기(스스로 확인) · 「풀이」는 푼 뒤에만.
   · 기록은 자기주도 원문과 **같은 자리**(projmap.js: lesson_id·진도 키) — kedu_tracker·브리지·scope 가 그대로 받는다.
     문항마다 kedu.recordAnswer(키_장, 맞음) · 끝에 saveProgress(true) → 진도(100점) + recordLessonEnd.
   · 채점 문항을 풀기 전에는 다음 장으로 안 넘어간다(정답 보기를 누르면 넘어갈 수 있다 — 0점).
   진입: learn.html?g=3&t=2&s=social&u=1&l=u1_l04
   ============================================================================ */
(function (global) {
  'use strict';
  const doc = global.document;
  const W = 1600, H = 900;
  const K = () => global.KT2, P = () => global.KT2_PROJECT;
  const STAGES = ['도입', '전개', '기본문제', '응용문제', '정리'];
  const M = ['①', '②', '③', '④', '⑤', '⑥'];
  const esc = (s) => K().esc(s), md = (t) => K().md(t);

  function Learn(o) {
    const self = this;
    self.q = o.params; self.key = o.params.l; self.g = +o.params.g; self.s = o.params.s; self.slug = K().slugOf(o.params);
    self.src = o.lesson; self.unitTitle = o.unitTitle || '';
    const pj = P().project(o.lesson); self.meta = pj.meta; self.slides = pj.slides; self.scoredIds = pj.scored;
    self.guide = K().guideOf(o.lesson);
    self.map = (global.KT2_PROJMAP || {})[self.slug + ':' + self.key] || null;
    // 이어서 하기 발자국 — 원문 차시와 같은 자리·같은 꼴(kedu_tracker footprint): 목록·홈의 「▶ 이어서 하기」가 이어지게
    try { const lm = self.map && decodeURIComponent(self.map.url).match(/^\/grade([1-6])\/semester([12])\/([a-z]+)\/(.+\.html)$/); if (lm) global.localStorage.setItem('kedu_last:' + lm[1] + '_' + lm[2] + '_' + lm[3], JSON.stringify({ file: lm[4], title: (o.lesson.meta && o.lesson.meta.title) || self.key, at: Date.now() })); } catch (e) { }
    self.IS = {}; self.rev = {}; self.L = {}; self.idx = 0; self.score = 0; self.finished = false;
    self.sound = true; self.still = false; self.started = Date.now();
    const hash = parseInt((global.location.hash || '').replace('#', ''), 10); if (!isNaN(hash)) self.idx = Math.max(0, Math.min(hash - 1, self.slides.length - 1));
    self.build(); self.bind(); self.fit(); self.go(self.idx, 0);
  }
  // 교사 무대에서 빌려 쓰는 것 — 연출·소리·넘침 맞춤·부품 조작(뒤집기·별·수준 고르기)
  ['decorate', 'fitBody', 'refitLater', 'tone', 'pop', 'celebrate', 'toggleZoom'].forEach(m => { Learn.prototype[m] = function () { return K().Stage.prototype[m].apply(this, arguments); }; });
  Learn.prototype.chime = function () { this.pop(); };
  Learn.prototype.timerStart = function () { }; Learn.prototype.openRes = function () { };
  Learn.prototype.act = function (btn) { return K().Stage.prototype.act.call(this, btn); };
  Learn.prototype.state = function (sid) { return this.IS[sid] || (this.IS[sid] = {}); };
  Learn.prototype.ls = function (sid) { return this.L[sid] || (this.L[sid] = { tries: 0, done: false, gaveUp: false, sel: [], wrong: [], val: '', shown: false }); };
  Learn.prototype.cur = function () { return this.slides[this.idx]; };

  Learn.prototype.build = function () {
    const st = doc.getElementById('kt2-stage');
    st.innerHTML = '<div class="kt2-canvas" id="kt2-canvas"><div class="kt2-paper" id="kt2-paper"></div><canvas id="fx" width="' + W + '" height="' + H + '"></canvas></div>';
    doc.body.className = 'learn subj-' + this.s + ' tier-' + (this.g <= 2 ? 'low' : this.g <= 4 ? 'mid' : 'high');
    doc.title = (this.meta.title || this.key) + ' — 케이에듀 자기주도';
    const bar = doc.getElementById('lbar');
    bar.innerHTML = '<a class="lb-home" id="lb-home" href="' + esc(this.hubUrl()) + '">← 목록</a>'
      + '<button class="lb-btn" id="lb-prev" aria-label="이전">◀</button>'
      + '<div class="lb-steps" id="lb-steps"></div>'
      + '<span class="lb-score" id="lb-score">⭐ 0</span>'
      + '<button class="lb-btn main" id="lb-next" aria-label="다음">다음 ▶</button>';
  };
  Learn.prototype.hubUrl = function () { const u = this.map && this.map.url; if (!u) return '/'; const p = u.split('/'); return p.slice(0, 4).join('/') + '/index.html'; }; // /grade3/semester2/<과목>/index.html
  Learn.prototype.fit = function () {
    const c = doc.getElementById('kt2-canvas'); if (!c) return;
    const barH = 64, vw = global.innerWidth, vh = global.innerHeight - barH;
    const k = Math.min((vw - 16) / W, (vh - 16) / H);
    c.style.transform = 'translate(-50%,-50%) scale(' + k + ')'; c.style.top = (vh / 2 + 4) + 'px'; this.scale = k;
  };

  // ── 학생이 푸는 층 ─────────────────────────────────────────────
  function widget(s, st) {
    const L = s.learn; if (!L) return '';
    const fin = st.done || st.gaveUp;
    let h = '<div class="lw lw-' + L.kind + (fin ? ' fin' : '') + '">';
    if (L.kind === 'pick' || L.kind === 'multi') {
      h += '<div class="options n' + L.options.length + (fin ? ' revealed' : '') + '">' + L.options.map((o, i) => {
        const on = L.kind === 'multi' ? st.sel.indexOf(i) >= 0 : false;
        const cls = 'opt lopt' + (fin && o.correct ? ' ok' : '') + (st.wrong.indexOf(i) >= 0 && !fin ? ' no' : '') + (on ? ' on' : '');
        return '<button class="' + cls + '" data-lact="' + L.kind + '" data-i="' + i + '"' + (fin ? ' disabled' : '') + '><div class="mk">' + (L.kind === 'multi' ? (on || (fin && o.correct) ? '☑' : '☐') : (M[i] || i + 1)) + '</div><div>' + md(o.text || '') + '</div></button>';
      }).join('') + '</div>';
      if (L.kind === 'multi' && !fin) h += '<div class="lw-row"><span class="lw-tip">☑ 알맞은 것을 모두 골라요</span><button class="btn main" data-lact="check">확인하기</button></div>';
    } else if (L.kind === 'num') {
      h += '<div class="lw-row">' + (fin ? '<div class="answer on"><span>답</span><div class="box">' + md(String(L.answer)) + '</div></div>' : '<input class="lw-in' + (st.wrong.length ? ' no' : '') + '" id="lw-in" inputmode="numeric" autocomplete="off" placeholder="?" value="' + esc(st.val) + '"><button class="btn main" data-lact="check">확인하기</button>') + '</div>';
    } else if (L.kind === 'self') {
      if (!st.shown) h += '<div class="lw-row"><span class="lw-tip">🤔 먼저 스스로 생각해 봐요</span><button class="btn main" data-lact="show">정답 보기</button></div>';
      else h += (L.answer !== undefined ? '<div class="answer on"><span>답</span><div class="box">' + md(String(L.answer)) + '</div></div>' : '');
    }
    if (!fin && st.tries > 0 && L.kind !== 'self') h += '<div class="lw-row"><span class="lw-msg">다시 생각해 봐요! 🔁</span><button class="btn ghost" data-lact="giveup">정답 볼래요</button></div>';
    if ((fin || (L.kind === 'self' && st.shown)) && L.note) h += '<div class="small-text lw-note">' + md(L.note) + '</div>';
    if (st.done && L.pts) h += '<div class="lw-got">⭐ +' + st.got + '</div>';
    return h + '</div>';
  }

  Learn.prototype.paint = function (dir, quiet) { // quiet: 답을 고른 뒤 다시 그릴 때 — 등장 연출을 다시 틀지 않는다
    const s = this.cur(); if (!s) return;
    const paper = doc.getElementById('kt2-paper');
    const r = K().renderSlide(s, { revealed: !!this.rev[s.id], state: this.state(s.id), meta: this.meta, unitTitle: this.unitTitle, classNames: [], guide: this.guide });
    const n = this.idx + 1, N = this.slides.length;
    const pos = this.slides.slice(0, n).filter(x => x.stage === s.stage).length, tot = this.slides.filter(x => x.stage === s.stage).length;
    const foot = '<div class="kt2-foot"><span class="brand">케이에듀 자기주도</span><span class="sp"></span><span class="pg"><b>' + n + '</b> / ' + N + '</span></div>';
    if (r.cover) {
      paper.className = 'kt2-paper cover' + (dir ? ' enter' + (dir < 0 ? ' back' : '') : ''); paper.setAttribute('data-stage', s.stage);
      paper.innerHTML = r.body.replace(/<span>⏱[^<]*<\/span>/, '') + foot.replace('class="kt2-foot"', 'class="kt2-foot" style="position:absolute;left:84px;right:84px;bottom:48px"');
    } else {
      paper.className = 'kt2-paper' + (dir ? ' enter' + (dir < 0 ? ' back' : '') : ''); paper.setAttribute('data-stage', s.stage);
      const tl = (r.title || '').length; const tcls = tl > 34 ? ' xs' : tl > 22 ? ' small' : '';
      let body = r.body + widget(s, this.ls(s.id)) + (s.solo ? '<div class="lw-solo">' + md(s.solo) + '</div>' : '');
      if (n === N) body += this.doneCard();
      paper.innerHTML = '<div class="kt2-head"><span class="kt2-chip">' + esc(s.stage) + ' <small style="opacity:.6">' + pos + '/' + tot + '</small></span><span class="kt2-kicker">' + esc(this.meta.title || '') + '</span><span class="sp"></span></div>'
        + (r.title ? '<h1 class="kt2-title' + tcls + '">' + md(r.title) + '</h1>' : '') + (r.sub ? '<div class="kt2-sub">' + md(r.sub) + '</div>' : '')
        + '<div class="kt2-body' + (r.cls ? ' ' + r.cls : '') + '">' + body + '</div>' + foot;
    }
    // 교사 무대 전용 단추는 학생 화면에서 뺀다(수준별 문제의 「정답 보기」는 남긴다 — 스스로 확인)
    paper.querySelectorAll('[data-act="timer"],[data-act="res-open"],.kt2-res-badge').forEach(b => b.remove());
    this.decorate(paper, r); if (quiet) paper.querySelectorAll('.anim').forEach(el => el.classList.remove('anim')); this.fitBody(); this.refitLater(); { const self = this; setTimeout(() => self.fitBody(), 400); }
    paper.querySelectorAll('.img-frame img').forEach(im => { im.addEventListener('error', () => { try { K().imgFallback(im); } catch (e) { } setTimeout(() => this.fitBody(), 0); }); im.addEventListener('load', () => this.fitBody()); });
    const inp = doc.getElementById('lw-in'); if (inp) { inp.addEventListener('input', () => { this.ls(s.id).val = inp.value; }); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); this.answer(s, inp.value); } }); if (!this._noFocus) setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { } }, 60); }
    this.paintBar();
    try { global.history.replaceState(null, '', '#' + n); } catch (e) { }
  };
  Learn.prototype.doneCard = function () {
    const n = this.scoredIds.length;
    return '<div class="lw-done"><div class="big">🎉 오늘 공부를 다 했어요!</div><div class="sc">⭐ <b>' + this.score + '</b> / 100</div>' + (n ? '<div class="sub">문제 ' + n + '개 · 한 번에 맞히면 만점, 두 번째에 맞히면 절반이에요.</div>' : '') + '<div class="lw-row"><a class="btn main" href="' + esc(this.hubUrl()) + '">목록으로</a><button class="btn ghost" data-lact="again">처음부터 다시</button></div></div>';
  };
  Learn.prototype.paintBar = function () {
    const s = this.cur(); const el = doc.getElementById('lb-steps'); if (!el) return;
    el.innerHTML = STAGES.map(st => { const tot = this.slides.filter(x => x.stage === st).length; if (!tot) return ''; const done = this.slides.slice(0, this.idx + 1).filter(x => x.stage === st).length; return '<i class="' + (s.stage === st ? 'on' : '') + '" data-st="' + esc(st) + '" title="' + esc(st) + '"><b style="width:' + Math.round(done / tot * 100) + '%"></b></i>'; }).join('');
    doc.getElementById('lb-score').textContent = '⭐ ' + this.score;
    doc.getElementById('lb-prev').disabled = this.idx === 0;
    const nx = doc.getElementById('lb-next'); const last = this.idx === this.slides.length - 1; nx.textContent = last ? '끝 ✔' : '다음 ▶'; nx.classList.toggle('locked', this.locked());
  };
  Learn.prototype.locked = function () { const s = this.cur(); if (!s || !s.learn || !P().SCORED.has(s.learn.kind)) return false; const st = this.ls(s.id); return !(st.done || st.gaveUp); };

  // ── 넘기기 ─────────────────────────────────────────────
  Learn.prototype.go = function (i, dir) {
    this.idx = Math.max(0, Math.min(i, this.slides.length - 1)); this.paint(dir);
    if (this.idx === this.slides.length - 1) this.finish();
  };
  Learn.prototype.next = function () {
    if (this.locked()) { this.toast('문제를 풀면 다음으로 넘어가요 ✏️'); const w = doc.querySelector('.lw'); if (w) { w.classList.remove('nudge'); void w.offsetWidth; w.classList.add('nudge'); } return; }
    if (this.idx < this.slides.length - 1) this.go(this.idx + 1, 1); else global.location.href = this.hubUrl();
  };
  Learn.prototype.prev = function () { if (this.idx > 0) this.go(this.idx - 1, -1); };

  // ── 풀기 ─────────────────────────────────────────────
  Learn.prototype.qid = function (s) { return this.key + '_' + s.id; };
  Learn.prototype.answer = function (s, ans) {
    const L = s.learn, st = this.ls(s.id); if (!L || st.done || st.gaveUp) return;
    if (L.kind === 'num' && String(ans == null ? '' : ans).trim() === '') { this.toast('답을 넣어 봐요'); return; }
    if (L.kind === 'multi' && !(ans || []).length) { this.toast('하나 이상 골라요'); return; }
    st.tries++;
    const ok = P().check(L, ans);
    const sec = Math.round((Date.now() - (st.t0 || this.started)) / 1000);
    try { if (global.kedu && global.kedu.recordAnswer) global.kedu.recordAnswer(this.qid(s), ok, sec, null, { src: 'kt2-learn', slug: this.slug, kind: L.kind, try: st.tries }); } catch (e) { }
    if (ok) { st.done = true; st.got = P().gained(L, st.tries, false); this.score += st.got; this.paint(0, true); this.celebrate(); }
    else { if (L.kind === 'pick') st.wrong.push(ans); else st.wrong = [1]; if (L.kind === 'multi') st.sel = []; this.tone(200, 0.18, 0.05, 'square'); this.paint(0, true); const w = doc.querySelector('.lw'); if (w) w.classList.add('shake'); }
  };
  Learn.prototype.lact = function (b) {
    const s = this.cur(), L = s.learn, st = this.ls(s.id), a = b.getAttribute('data-lact'), i = +b.getAttribute('data-i');
    if (!st.t0) st.t0 = Date.now();
    if (a === 'pick') return this.answer(s, i);
    if (a === 'multi') { const k = st.sel.indexOf(i); if (k >= 0) st.sel.splice(k, 1); else st.sel.push(i); st.wrong = []; this.pop(); return this.paint(0, true); }
    if (a === 'check') { if (L.kind === 'multi') return this.answer(s, st.sel.slice()); const inp = doc.getElementById('lw-in'); return this.answer(s, inp ? inp.value : st.val); }
    if (a === 'giveup') { st.gaveUp = true; st.got = 0; try { if (global.kedu && global.kedu.recordAnswer && st.tries === 0) global.kedu.recordAnswer(this.qid(s), false, null, null, { src: 'kt2-learn', gaveUp: true }); } catch (e) { } return this.paint(0, true); }
    if (a === 'show') { st.shown = true; this.pop(); return this.paint(0, true); }
    if (a === 'again') { this.IS = {}; this.rev = {}; this.L = {}; this.score = 0; return this.go(0, -1); }
  };

  // ── 끝 — 원문과 같은 자리에 기록 ─────────────────────────────
  Learn.prototype.finish = function () {
    if (this.finished) return; this.finished = true;
    const self = this;
    global.saveProgress = global.saveProgress || function (done) {
      const dur = Math.round((Date.now() - self.started) / 1000);
      const key = self.map && self.map.ls;
      if (key) { try { global.localStorage.setItem(key, JSON.stringify({ score: self.score, max_score: 100, completed: !!done, done: !!done, completed_at: new Date().toISOString(), duration_sec: dur, via: 'kt2-learn' })); } catch (e) { } }
      if (done && global.kedu && global.kedu.recordLessonEnd && !global.__keduScored) { global.__keduScored = true; try { global.kedu.recordLessonEnd(self.score, 100); } catch (e) { } }
    };
    try { global.saveProgress(true); } catch (e) { }
  };

  Learn.prototype.toast = function (m) { const t = doc.getElementById('toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(this._tt); this._tt = setTimeout(() => t.classList.remove('on'), 1600); };
  Learn.prototype.bind = function () {
    const self = this;
    global.addEventListener('resize', () => self.fit());
    doc.getElementById('kt2-paper').addEventListener('click', e => { const l = e.target.closest('[data-lact]'); if (l) { self.lact(l); return; } const b = e.target.closest('[data-act]'); if (b) self.act(b); });
    doc.getElementById('lb-prev').addEventListener('click', () => self.prev());
    doc.getElementById('lb-next').addEventListener('click', () => self.next());
    doc.addEventListener('keydown', e => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); self.next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); self.prev(); }
    });
  };

  // ── 부팅 ─────────────────────────────────────────────
  function boot() {
    const q = {}; (global.location.search || '').replace(/^\?/, '').split('&').forEach(kv => { if (!kv) return; const [k, v] = kv.split('='); q[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' ')); });
    const box = doc.getElementById('kt2-stage');
    if (!q.g || !q.s || !q.u || !q.l) { box.innerHTML = '<div class="lmsg">주소에 g·s·u·l 이 필요해요.</div>'; return; }
    const slug = K().slugOf(q); global.LESSONS = global.LESSONS || {};
    let unitTitle = ''; const man = global.KT2_MANIFEST; if (man) { const sj = man.subjects.find(x => x.slug === slug); const un = sj && sj.units.find(x => x.unit === +q.u); if (un) unitTitle = un.title; }
    const s = doc.createElement('script'); s.src = '../data/' + slug + '_u' + q.u + '.js';
    s.onload = () => { const L = global.LESSONS[q.l]; if (!L) { box.innerHTML = '<div class="lmsg">차시를 찾지 못했어요: ' + esc(q.l) + '</div>'; return; } global.KT2L = new Learn({ params: q, lesson: L, unitTitle }); };
    s.onerror = () => { box.innerHTML = '<div class="lmsg">차시 자료를 못 읽었어요.</div>'; };
    doc.head.appendChild(s);
  }
  global.KT2_LEARN = { Learn, boot, widget };
  if (doc && doc.getElementById && doc.getElementById('kt2-stage') && !global.KT2_LEARN_NO_BOOT) { if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot); else boot(); }
})(typeof window !== 'undefined' ? window : globalThis);
