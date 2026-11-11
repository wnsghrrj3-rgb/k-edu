/* ============================================================
 * 영어 놀이터 — 놀이 #31 「쓰는 일」 (설계 v2 §4-31 · §5 · 낱말 씨앗의 열매 · W14)
 *   낱말을 손으로 쓴다. 쓴 글씨는 그 무대의 글자 자리(구역의 inks — 점심 가게 메뉴판 · 교실 칠판 · 농장 문패 · 공방 견본판 · 거울 메모 ·
 *   독서 카드 · 우리 집 쪽지 · 운동장 모래밭 · 걸음의 팻말)에 붙고(PlayWrite 가 남긴 획), 다음 날 읽기 놀이의 카드에도 내 글씨로 나온다.
 *     열매 차례 낱말(하루 words 개) — decode·word 길 = 듣고 쓰기(글자 없이 소리·그림만) · sight 길 = 보고 쓰기(통말은 보고 옮겨 쓴다). 혼자 쓰기에서 시작.
 *     열매 차례가 없으면 — 오늘 낱말 하나를 따라 쓰는 맛보기(증거 assisted — 씨앗은 자라지 않는다).
 *   화면(11-11 준호): 쓰는 동안에는 쓰는 판만 — 글자 자리 칸을 미리 보여 주지 않는다.
 *     다 쓰면 낱말이 바뀐다(그림 + 내 글씨 + 인쇄 낱말이 한 장으로), 그 아래에 「○○에 붙었어요」와 오늘 쓴 글씨가 작게 남는다.
 *   어른 메뉴 「손 쓰기 대신 조각으로」(ctx.opt.tiles)면 같은 자리가 글자 조각 놓기(소리 상자)로 바뀐다(증거 support tiles).
 *   공통 인터페이스: start(ctx) — ctx.targets = 열매 차례 낱말들(무대 진행이 넘긴다 — 비면 맛보기). 증거 = 쓰기(write · pen)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    words: 3,         /* 하루에 쓰는 열매 차례 낱말 수 */
    nextMs: 1100      /* 다 쓴 낱말(내 글씨 + 인쇄 낱말)을 보여 주고 다음으로 */
  };
  var KIND = { word: 1, decode: 1, sight: 1 };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function plain(w) { return /^[A-Za-z]+$/.test(String(w)); }
  function wordsOf(zone) { return ((zone && zone.words) || []).filter(function (x) { return KIND[x.path || 'word'] && plain(x.w); }); }
  /* 그 무대의 글자 자리 */
  function inkOf(zone) { var Z = g.PLAY_ZONES; return (zone && zone.inks && zone.inks[0]) || (Z && Z.inks && zone && Z.inks[zone.stage]) || { id: 'note', name: '쪽지' }; }

  /* 한 낱말 — host 에 쓰는 판을 놓고 다 쓸 때까지. o.mode = 'free'|'faint'|'trace' → Promise(증거) */
  function one(ctx, host, x, o) {
    o = o || {};
    var S = ctx.services || {}, E = g.PlayEvidence, W = g.PlayWrite, mode = o.mode || 'free', see = x.path === 'sight' && mode === 'free';
    if (o.tiles && g.PlaySoundBox) return g.PlaySoundBox.one(ctx, host, x, { asWrite: true }).then(function () { return ctx.emit(E.write(x.w, { skill: 'write', support: 'tiles', inputMode: 'touch' })); });
    host.innerHTML = '';
    var top = h('div', 'wj-top', (x.pic && x.path !== 'sight' ? '<span class="pic">' + x.pic + '</span>' : '') + (see ? '<span class="wj-model word">' + x.w + '</span>' : '') + '<button type="button" class="btn w pp-rep wj-ear">' + g.PlayIcon.html('speaker') + '</button>');
    var sheet = h('div', 'wj-sheet'); host.appendChild(top); host.appendChild(sheet);
    top.querySelector('.wj-ear').onclick = function () { ctx.say(x.w); };
    ctx.say(x.w);
    return W.write(sheet, { text: x.w, mode: mode, onLetter: function () { if (S.audio) S.audio.play('pop'); }, onMiss: function () { ctx.oops(); ctx.say(x.w, 0.6); } }).then(function (res) {
      return ctx.emit(E.write(x.w, { skill: 'write', support: res.support, clean: res.clean, attempts: res.attempts, inputMode: 'pen' }));
    });
  }
  /* 다 쓴 낱말 — 그림 + 내 글씨 + 인쇄 낱말 */
  function done(host, x) {
    var W = g.PlayWrite, mine = W && W.ink(x.w) ? W.svg(x.w) : '';
    host.innerHTML = '<div class="wj-ok" data-w="' + x.w + '">' + (x.pic ? '<span class="pic">' + x.pic + '</span>' : '') + (mine ? '<span class="wj-mine">' + mine + '</span>' : '') + '<span class="word wj-print">' + x.w + '</span></div>';
  }

  function start(ctx) {
    var S = ctx.services || {}, seed = S.seed, G = g.PlayGame, W = g.PlayWrite, tiles = !!(ctx.opt && ctx.opt.tiles), hand = (ctx.opt && ctx.opt.hand) || '';      /* hand = 점검용 맛보기 모드 */
    var due = (ctx.targets || []).filter(function (x) { return x && KIND[x.path || 'word'] && plain(x.w); }).slice(0, CONF.words), list = due, taste = false;
    if (!list.length) {       /* 맛보기 — 오늘 낱말 하나(심긴 것 먼저)를 따라 쓴다 */
      var all = seed && seed.all ? seed.all() : {}, ws = wordsOf(ctx.zone), planted = ws.filter(function (x) { var s = all[seed && seed.key ? seed.key(x.w, x.path) : x.w]; return s && s.stage < 3; });
      list = (planted.length ? planted : ws).slice(0, 1); taste = true;
    }
    var ink = inkOf(ctx.zone), host = ctx.host; host.innerHTML = '';
    var root = h('div', 'wj wj-at-' + ink.id), work = h('div', 'wj-work'), stuck = h('div', 'wj-stuck'), dots = h('div', 'dots');
    stuck.style.display = 'none';
    root.appendChild(dots); root.appendChild(work); root.appendChild(stuck); host.appendChild(root);
    root.setAttribute('data-kind', taste ? 'taste' : 'fruit');
    var i = 0, mine = [];
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    /* 글자 자리에 붙은 글씨 — 오늘 여기서 쓴 것. 하나라도 쓴 뒤에만 보인다 */
    function stick() {
      var got = W ? mine.filter(function (w) { return !!W.ink(w); }) : [];
      if (!got.length) return;
      stuck.style.display = '';
      stuck.innerHTML = '<div class="wj-name">' + g.PlayIcon.html('pencil') + ' ' + ink.name + '에 붙었어요</div><div class="wj-lines">' + got.map(function (w) { return '<span class="wj-line" data-w="' + w + '">' + W.svg(w) + '</span>'; }).join('') + '</div>';
    }
    return new Promise(function (resolve) {
      function next() {
        if (!alive()) return;
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return resolve({ completed: true });
        var x = list[i];
        one(ctx, work, x, { mode: taste ? hand || 'trace' : 'free', tiles: tiles }).then(function (ev) {
          if (!alive()) return;
          mine.push(x.w); done(work, x); stick();
          ctx.good(!!ev && ev.outcome === 'independent', { at: work });
          i++; setTimeout(next, CONF.nextMs);
        });
      }
      if (!list.length || (!W && !tiles)) return resolve({ completed: true });
      G.soon(ctx.intro, null).then(function () { if (alive()) next(); });
    });
  }

  g.PlayWriteJob = { CONF: CONF, wordsOf: wordsOf, inkOf: inkOf, one: one, done: done, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'write-job', no: 31, name: '쓰는 일', icon: 'pencil', channels: ['hand'], axis: 'make', need: { lv1: 3 },      /* 손 쓰기는 Lv1 #3 부터(설계 v2 §3-8) */
    skills: ['W'], unit: 'word', serves: [3],
    fits: function (zone) { return !!(g.PlayWrite && g.PlayWrite.available()) && wordsOf(zone).length > 0; },
    count: function (c) { var n = (c.targets || []).filter(function (x) { return x && KIND[x.path || 'word'] && plain(x.w); }).length; return Math.min(CONF.words, n) || (wordsOf(c.zone).length ? 1 : 0); },
    intro: { en: 'Write it!', ko: '손가락으로 낱말을 써 줘!' },
    intro1: { en: 'Oh!', ko: '손가락으로 낱말을 써 줘!' },
    start: start
  });
})(window);
