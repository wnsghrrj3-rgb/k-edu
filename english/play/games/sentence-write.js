/* ============================================================
 * 영어 놀이터 — 놀이 #32 「문장 쓰기」 (설계 v2 §4-32 · 문장(sentence)·지문(text) 씨앗의 열매 · W14)
 *   따라 쓰기(Lv1 — 소리 마을·한 해 길의 앞 구역): 낱말 칩으로 내 문장을 조립한다 → 그 문장을 낱말 하나씩 따라 쓴다(한 화면에 한 낱말).
 *   빈칸 쓰기(Lv2 마을 · 한 해 길의 문장 마을 F): 문장에서 빈칸 낱말 하나만 손으로 쓴다(혼자 쓰기에서 시작 — 안 되면 빈칸에 유령 글씨).
 *   다 쓴 문장은 내 글씨로 남는다(따라 쓰기 = 문장째 · 빈칸 쓰기 = 그 낱말).
 *   열매 차례 문장이 없으면 그 구역의 문장 하나를 따라 쓰는 맛보기(씨앗은 자라지 않는다).
 *   공통 인터페이스: start(ctx) — ctx.targets = 열매 차례 문장들(무대 진행이 넘긴다). 증거 = 쓰기(write · pen · unit sentence|text)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    sentences: 1,     /* 하루에 쓰는 문장 수 */
    nextMs: 500
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function isSent(x) { return !!x && (x.path === 'sentence' || x.path === 'text') && / /.test(x.w); }
  function sentOf(zone) { return ((zone && zone.words) || []).filter(isSent); }
  /* 빈칸 쓰기를 하는 곳 — Lv2 마을 · 한 해 길의 문장 마을 */
  function blankZone(zone) { return !!zone && (zone.part === 'F' || (!zone.step && zone.world === 'lv2')); }
  /* 문장을 낱말로(문장 부호는 낱말에 붙은 채). bare = 글자만 */
  function tokens(s) { return String(s).split(' ').filter(Boolean).map(function (t) { return { t: t, bare: t.replace(/[^A-Za-z]/g, '') }; }); }
  /* 빈칸 낱말 — 뒤에서부터, 두 글자 넘는 낱말 */
  function blankAt(tk) { for (var i = tk.length - 1; i >= 0; i--) if (tk[i].bare.length >= 2) return i; return tk.length - 1; }

  /* 한 문장 — host 에 판을 놓고 다 쓸 때까지. o.blank = 빈칸 쓰기 · o.chips = 조립부터 → Promise(증거) */
  function one(ctx, host, x, o) {
    o = o || {};
    var S = ctx.services || {}, E = g.PlayEvidence, G = g.PlayGame, W = g.PlayWrite, tts = S.tts, tk = tokens(x.w), unit = x.path === 'text' ? 'text' : 'sentence';
    host.innerHTML = '';
    var root = h('div', 'sw' + (o.blank ? ' sw-blank' : '')), pic = h('div', 'sw-pic', x.pic || ''), line = h('div', 'sw-line'), work = h('div', 'sw-work');
    root.appendChild(pic); root.appendChild(line); root.appendChild(work); host.appendChild(root);
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function tell(slow) { return G.soon(tts ? tts.sentence(x.w, slow ? { rate: 0.7 } : undefined) : null, 9000); }
    function pop() { if (S.audio) S.audio.play('pop'); }      /* 글자 하나가 될 때마다 톡 */
    function show(at, mine) { line.innerHTML = tk.map(function (t, k) { var done = mine && mine[k]; return '<span class="sw-w' + (k === at ? ' now' : '') + (done ? ' mine' : '') + '" data-k="' + k + '">' + (done ? done : (o.blank && k === at ? '<i class="sw-gap"></i>' + t.t.replace(/[A-Za-z]/g, '') : t.t)) + '</span>'; }).join(' '); }
    /* 낱말 칩 차례 맞추기 */
    function chips() {
      var at = 0, tries = 0; show(-1); line.innerHTML = ''; work.innerHTML = '<div class="gd-chips sw-chips"></div>';
      var tray = work.firstChild;
      return new Promise(function (res) {
        shuffle(tk.map(function (t, k) { return { t: t.t, k: k }; })).forEach(function (c) {
          var b = h('button', 'gv-chip', c.t); b.type = 'button'; b.setAttribute('data-c', c.t);
          b.onclick = function () {
            if (b.disabled || !alive()) return;
            if (c.t !== tk[at].t) { tries++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); ctx.oops(); return tell(true); }
            b.disabled = true; b.classList.add('used'); at++; line.textContent = tk.slice(0, at).map(function (t) { return t.t; }).join(' ');
            if (at === tk.length) { ctx.emit(E.write(x.w, { skill: 'spell', support: tries ? 'slow' : 'none', clean: !tries, attempts: tries + 1, inputMode: 'touch', unit: unit })); res(); }
          };
          tray.appendChild(b);
        });
      });
    }
    /* 문장째 따라 쓰기 — 낱말 하나씩 */
    function traceAll() {
      var cells = [], mine = {}, k = 0, worst = 1;
      return new Promise(function (res) {
        (function step() {
          if (!alive()) return;
          while (k < tk.length && !tk[k].bare) k++;
          if (k >= tk.length) {
            if (W.layout(x.w).letters === cells.length) W.keep(x.w, cells, { text: x.w });
            return res(ctx.emit(E.write(x.w, { skill: 'write', support: 'ghost', clean: false, attempts: worst, inputMode: 'pen', unit: unit })));
          }
          show(k, mine); work.innerHTML = '';
          W.write(work, { text: tk[k].t, mode: 'trace', keep: false, demo: k === 0, onLetter: pop, onMiss: function () { ctx.oops(); } }).then(function (r) {
            if (!alive()) return;
            r.cells.forEach(function (c) { cells.push(c); }); worst = Math.max(worst, r.attempts);
            mine[k] = W.svg({ text: tk[k].t, cells: r.cells, first: r.cells }); k++; step();
          });
        })();
      });
    }
    /* 빈칸 낱말만 손으로 */
    function blank() {
      var at = blankAt(tk); show(at); work.innerHTML = '';
      return W.write(work, { text: tk[at].bare, mode: o.mode || 'free', onLetter: pop, onMiss: function () { ctx.oops(); tell(true); } }).then(function (r) {
        if (!alive()) return null;
        var mine = {}; mine[at] = W.svg({ text: tk[at].bare, cells: r.cells, first: r.cells }) + tk[at].t.replace(/[A-Za-z]/g, ''); show(-1, mine);
        return ctx.emit(E.write(x.w, { skill: 'write', support: r.support, clean: r.clean, attempts: r.attempts, inputMode: 'pen', unit: unit }));
      });
    }
    tell();
    if (o.blank) return blank();
    return (o.chips === false ? Promise.resolve() : chips()).then(function () { if (alive()) return traceAll(); });
  }

  function start(ctx) {
    var G = g.PlayGame, W = g.PlayWrite, due = (ctx.targets || []).filter(isSent).slice(0, CONF.sentences), list = due, taste = false;
    if (!list.length) { list = sentOf(ctx.zone).slice(0, 1); taste = true; }
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'swg'), dots = h('div', 'dots'), body = h('div', 'swg-body');
    root.appendChild(dots); root.appendChild(body); host.appendChild(root);
    root.setAttribute('data-kind', taste ? 'taste' : 'fruit');
    var i = 0, blank = blankZone(ctx.zone);
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    return new Promise(function (resolve) {
      function next() {
        if (!alive()) return;
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return resolve({ completed: true });
        one(ctx, body, list[i], { blank: blank, mode: taste ? 'faint' : 'free' }).then(function (ev) {
          if (!alive()) return;
          ctx.good(!!ev && ev.outcome === 'independent', { at: body });
          i++; setTimeout(next, CONF.nextMs);
        });
      }
      if (!list.length || !W) return resolve({ completed: true });
      G.soon(ctx.intro, null).then(function () { if (alive()) next(); });
    });
  }

  g.PlaySentenceWrite = { CONF: CONF, sentOf: sentOf, blankZone: blankZone, blankAt: blankAt, tokens: tokens, one: one, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sentence-write', no: 32, name: '문장 쓰기', icon: 'pencil', channels: ['hand', 'make'], axis: 'make', need: {},
    skills: ['W'], unit: 'sentence', serves: [3],
    fits: function (zone) { return !!(g.PlayWrite && g.PlayWrite.available()) && sentOf(zone).length > 0; },
    count: function (c) { var n = Math.min(CONF.sentences, (c.targets || []).filter(isSent).length) || (sentOf(c.zone).length ? 1 : 0); return blankZone(c.zone) ? n : n * 2; },      /* 따라 쓰기 = 조립 + 쓰기 */
    intro: { en: 'Write it!', ko: '내 문장을 손으로 써 보자!' },
    intro1: { en: 'I like it!', ko: '내 문장을 만들고 따라 써 보자!' },
    start: start
  });
})(window);
