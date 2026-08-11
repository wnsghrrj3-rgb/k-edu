/* =============================================================
 * kquiz-ui.js — 케이퀴즈 렌더러 (KQuiz.mount / unmount)
 * 명세: handoff/kquiz/SPEC_KQUIZ_설계.md §5
 * 규약: 케이랩 KLab.mount(el, tool, cfg)와 동형 → KQuiz.mount(el, cfg)
 *
 * mode 3종: student(풀기→제출) · teacher(생성·미리보기·다시뽑기) · print(보류)
 * 의존: kquiz-core.js 먼저 로드. templates/*.js는 필요 lesson만 로드.
 * 사회적 비교 차단: 랭킹·등수·친구 비교 노출 절대 없음(헌법).
 * ============================================================= */
(function (root) {
  'use strict';
  var KQuiz = root.KQuiz = root.KQuiz || {};
  if (!KQuiz.core) { console.warn('[KQuiz] core 미로드'); }

  var CSS_ID = 'kquiz-ui-css';
  function injectCss() {
    if (document.getElementById(CSS_ID)) return;
    var s = document.createElement('style'); s.id = CSS_ID;
    s.textContent = [
      '.kq{--kq-pri:#5B8EF8;--kq-ok:#22A06B;--kq-no:#E5484D;--kq-ink:#243B53;--kq-sub:#627D98;--kq-line:#E3E8EF;--kq-card:#fff;font-family:"Noto Sans KR",sans-serif;color:var(--kq-ink);max-width:640px;margin:0 auto}',
      '.kq *{box-sizing:border-box}',
      '.kq-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}',
      '.kq-prog{font-size:13px;color:var(--kq-sub);font-weight:600}',
      '.kq-bar{height:7px;background:var(--kq-line);border-radius:50px;overflow:hidden;margin-bottom:20px}',
      '.kq-bar>i{display:block;height:100%;background:linear-gradient(90deg,var(--kq-pri),#7AA6FF);border-radius:50px;transition:width .3s}',
      '.kq-q{background:var(--kq-card);border:1px solid var(--kq-line);border-radius:18px;padding:24px 22px;box-shadow:0 6px 20px rgba(30,50,90,.05)}',
      '.kq-qn{font-size:12.5px;color:var(--kq-pri);font-weight:700;margin-bottom:10px}',
      '.kq-qt{font-size:22px;font-weight:700;line-height:1.4;margin-bottom:20px;word-break:keep-all}',
      '.kq-opts{display:grid;gap:10px}',
      '.kq-opt{display:flex;align-items:center;gap:12px;border:1.5px solid var(--kq-line);background:#fff;border-radius:13px;padding:14px 16px;font-size:18px;font-weight:600;cursor:pointer;transition:all .12s;text-align:left;font-family:inherit;color:var(--kq-ink)}',
      '.kq-opt:hover{border-color:var(--kq-pri);transform:translateY(-1px)}',
      '.kq-opt.sel{border-color:var(--kq-pri);background:#EEF4FF}',
      '.kq-opt.ok{border-color:var(--kq-ok);background:#E7F7EF}',
      '.kq-opt.no{border-color:var(--kq-no);background:#FDECEC}',
      '.kq-opt .mk{width:26px;height:26px;border-radius:50%;background:var(--kq-line);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;color:var(--kq-sub)}',
      '.kq-opt.ok .mk{background:var(--kq-ok);color:#fff}.kq-opt.no .mk{background:var(--kq-no);color:#fff}',
      '.kq-ox{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
      '.kq-ox .kq-opt{justify-content:center;font-size:26px;padding:20px}',
      '.kq-short input{width:100%;border:1.5px solid var(--kq-line);border-radius:13px;padding:16px;font-size:22px;font-family:inherit;text-align:center;font-weight:700;color:var(--kq-ink)}',
      '.kq-short input:focus{outline:none;border-color:var(--kq-pri)}',
      '.kq-exp{margin-top:14px;font-size:14px;color:var(--kq-sub);background:#F6F9FC;border-radius:11px;padding:12px 14px;line-height:1.5}',
      '.kq-foot{margin-top:18px;display:flex;gap:10px}',
      '.kq-btn{flex:1;height:52px;border:none;border-radius:14px;font-family:var(--kedu-title,"Jua"),sans-serif;font-size:18px;cursor:pointer;transition:transform .12s,opacity .12s}',
      '.kq-btn:disabled{opacity:.4;cursor:default}',
      '.kq-btn.pri{background:linear-gradient(120deg,var(--kq-pri),#7AA6FF);color:#fff}',
      '.kq-btn.ghost{background:#EEF2F7;color:var(--kq-sub);flex:0 0 auto;padding:0 20px}',
      '.kq-done{text-align:center;padding:30px 20px}',
      '.kq-done .big{font-family:var(--kedu-title,"Jua"),sans-serif;font-size:44px;color:var(--kq-pri);line-height:1.1}',
      '.kq-done .msg{font-size:17px;color:var(--kq-sub);margin-top:10px}',
      '.kq-tbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}',
      '.kq-tbar select,.kq-tbar button{font-family:inherit;font-size:14px;border:1.5px solid var(--kq-line);border-radius:10px;padding:9px 12px;background:#fff;color:var(--kq-ink);cursor:pointer}',
      '.kq-tbar .go{background:var(--kq-pri);color:#fff;border-color:var(--kq-pri);font-weight:700}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // 유틸: 요소 생성
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  // ── 학생 모드 렌더 ────────────────────────────────────────────────────────
  function renderStudent(el0, state, onSubmit) {
    var items = state.items, i = state.idx, it = items[i];
    el0.innerHTML = '';
    var wrap = el('div', 'kq');

    var head = el('div', 'kq-head');
    head.appendChild(el('div', 'kq-prog', '문제 ' + (i + 1) + ' / ' + items.length));
    wrap.appendChild(head);
    var bar = el('div', 'kq-bar'); var fill = el('i'); fill.style.width = ((i) / items.length * 100) + '%'; bar.appendChild(fill); wrap.appendChild(bar);

    var q = el('div', 'kq-q');
    q.appendChild(el('div', 'kq-qn', it.type === 'ox' ? 'O · X' : (it.type === 'short' ? '답 쓰기' : '알맞은 답 고르기')));
    q.appendChild(el('div', 'kq-qt', esc(it.q)));

    var answered = state.answers[i] != null;
    var graded = state.graded[i];

    if (it.type === 'choice' || it.type === 'ox') {
      var opts = el('div', it.type === 'ox' ? 'kq-ox' : 'kq-opts');
      var labels = it.type === 'ox' ? ['O', 'X'] : it.choices;
      labels.forEach(function (lab, oi) {
        var val = it.type === 'ox' ? (oi === 0) : oi;
        var o = el('button', 'kq-opt');
        if (it.type !== 'ox') o.appendChild(el('span', 'mk', String.fromCharCode(9312 + oi)));
        o.appendChild(el('span', null, esc(lab)));
        if (state.answers[i] === (it.type === 'ox' ? (val ? 1 : 0) : oi)) o.classList.add('sel');
        if (graded) {
          var isAns = it.type === 'ox' ? (val === it.answer) : (oi === it.answer);
          var chose = state.answers[i] === (it.type === 'ox' ? (val ? 1 : 0) : oi);
          if (isAns) o.classList.add('ok');
          else if (chose) o.classList.add('no');
          o.disabled = true;
        } else {
          o.onclick = function () { state.answers[i] = it.type === 'ox' ? (val ? 1 : 0) : oi; renderStudent(el0, state, onSubmit); };
        }
        opts.appendChild(o);
      });
      q.appendChild(opts);
    } else if (it.type === 'short') {
      var sd = el('div', 'kq-short'); var inp = el('input'); inp.type = 'text'; inp.inputMode = 'numeric';
      inp.value = state.answers[i] != null ? state.answers[i] : '';
      if (graded) inp.disabled = true;
      inp.oninput = function () {
        state.answers[i] = inp.value;
        // 렌더 시점에 잠가 둔 '확인'을 입력에 맞춰 풀어 준다.
        // (객관식은 보기 클릭에서 재렌더되지만 단답형은 재렌더가 없어 계속 잠겨 있었다)
        var c = el0.querySelector('.kq-foot .kq-btn.pri');
        if (c) c.disabled = (inp.value === '' || inp.value == null);
      };
      sd.appendChild(inp); q.appendChild(sd);
    }

    if (graded && it.explain) {
      var correct = KQuiz.core.gradeOne(it, state.answers[i]).correct;
      q.appendChild(el('div', 'kq-exp', (correct ? '⭕ ' : '💡 ') + esc(it.explain)));
    }
    wrap.appendChild(q);

    var foot = el('div', 'kq-foot');
    if (!graded) {
      var check = el('button', 'kq-btn pri', '확인');
      check.disabled = state.answers[i] == null || state.answers[i] === '';
      check.onclick = function () { state.graded[i] = true; renderStudent(el0, state, onSubmit); };
      foot.appendChild(check);
    } else {
      var isLast = i === items.length - 1;
      var next = el('button', 'kq-btn pri', isLast ? '결과 보기' : '다음 문제');
      next.onclick = function () {
        if (isLast) { renderDone(el0, state, onSubmit); }
        else { state.idx++; renderStudent(el0, state, onSubmit); }
      };
      foot.appendChild(next);
    }
    wrap.appendChild(foot);
    el0.appendChild(wrap);
  }

  function renderDone(el0, state, onSubmit) {
    var g = KQuiz.core.gradeSet(state.items, state.answers);
    el0.innerHTML = '';
    var wrap = el('div', 'kq');
    var done = el('div', 'kq-done');
    // 사회적 비교 없음 — 본인 성취만, 격려 톤
    done.appendChild(el('div', 'big', g.score + ' / ' + g.max));
    var msg = g.score === g.max ? '모두 맞혔어요! 최고예요 🎉'
            : g.score >= g.max * 0.6 ? '잘했어요! 조금만 더 🌱'
            : '괜찮아요, 다시 도전해 봐요 💪';
    done.appendChild(el('div', 'msg', msg));
    wrap.appendChild(done);

    var foot = el('div', 'kq-foot');
    var retry = el('button', 'kq-btn ghost', '다시 풀기');
    retry.onclick = function () { state.idx = 0; state.answers = []; state.graded = []; renderStudent(el0, state, onSubmit); };
    foot.appendChild(retry);
    if (onSubmit) {
      var sub = el('button', 'kq-btn pri', state.submitted ? '제출 완료 ✓' : '제출하기');
      sub.disabled = state.submitted;
      sub.onclick = function () {
        sub.disabled = true; sub.textContent = '제출 중…';
        Promise.resolve(onSubmit(g, state)).then(function () {
          state.submitted = true; sub.textContent = '제출 완료 ✓';
        }).catch(function () { sub.disabled = false; sub.textContent = '다시 제출'; });
      };
      foot.appendChild(sub);
    }
    wrap.appendChild(foot);
    el0.appendChild(wrap);
  }

  // ── 교사 모드(생성·미리보기·다시뽑기) ─────────────────────────────────────
  function renderTeacher(el0, cfg) {
    injectCss();
    var lesson = cfg.lesson;
    var state = { seed: cfg.seed != null ? cfg.seed : Math.floor(Math.random() * 1e9), n: cfg.n || 5, diff: cfg.difficulty || [1, 2] };
    function draw() {
      var gen = KQuiz.core.generate({ lesson: lesson, n: state.n, seed: state.seed, difficulty: state.diff });
      el0.innerHTML = '';
      var wrap = el('div', 'kq');
      var tbar = el('div', 'kq-tbar');
      var cnt = el('select'); [3, 5, 10, 15, 20].forEach(function (v) { var o = el('option', null, v + '문제'); o.value = v; if (v === state.n) o.selected = true; cnt.appendChild(o); });
      cnt.onchange = function () { state.n = +cnt.value; draw(); };
      tbar.appendChild(cnt);
      var re = el('button', 'go', '🎲 다시 뽑기'); re.onclick = function () { state.seed = Math.floor(Math.random() * 1e9); draw(); }; tbar.appendChild(re);
      if (cfg.onAddToBox) { var add = el('button', null, '📦 이 퀴즈 담기'); add.onclick = function () { cfg.onAddToBox({ lesson: lesson, n: state.n, difficulty: state.diff, seed: state.seed }); }; tbar.appendChild(add); }
      wrap.appendChild(tbar);
      // 미리보기(정답 표시)
      gen.items.forEach(function (it, qi) {
        var q = el('div', 'kq-q'); q.style.marginBottom = '10px';
        q.appendChild(el('div', 'kq-qn', (qi + 1) + '. ' + (it.type === 'ox' ? 'OX' : it.type === 'short' ? '단답' : '객관식')));
        q.appendChild(el('div', 'kq-qt', esc(it.q)));
        if (it.type === 'choice') {
          var opts = el('div', 'kq-opts');
          it.choices.forEach(function (c, oi) { var o = el('div', 'kq-opt' + (oi === it.answer ? ' ok' : '')); o.style.cursor = 'default'; o.appendChild(el('span', 'mk', String.fromCharCode(9312 + oi))); o.appendChild(el('span', null, esc(c))); opts.appendChild(o); });
          q.appendChild(opts);
        } else {
          q.appendChild(el('div', 'kq-exp', '정답: ' + (it.type === 'ox' ? (it.answer ? 'O' : 'X') : esc(it.answer))));
        }
        wrap.appendChild(q);
      });
      el0.appendChild(wrap);
    }
    draw();
    return function () { el0.innerHTML = ''; };
  }

  // ── 공개 mount/unmount ────────────────────────────────────────────────────
  KQuiz.mount = function (el0, cfg) {
    injectCss();
    cfg = cfg || {};
    var mode = cfg.mode || 'student';
    if (mode === 'teacher') return renderTeacher(el0, cfg);

    // student: seed 확정 후 생성
    var seed = cfg.seed != null ? cfg.seed : Math.floor(Math.random() * 1e9);
    var gen = KQuiz.core.generate({ lesson: cfg.lesson, n: cfg.n || 10, seed: seed, difficulty: cfg.difficulty });
    var state = { items: gen.items, seed: gen.seed, idx: 0, answers: [], graded: [], submitted: false, startAt: Date.now() };
    renderStudent(el0, state, cfg.onSubmit ? function (g) {
      return cfg.onSubmit({
        set: cfg.lesson, seed: state.seed, n: state.items.length,
        score: g.score, max: g.max,
        spent_sec: Math.round((Date.now() - state.startAt) / 1000),
        items: g.detail
      });
    } : null);
    return function () { el0.innerHTML = ''; };
  };
  KQuiz.unmount = function (el0) { if (el0) el0.innerHTML = ''; };
})(typeof self !== 'undefined' ? self : this);
