/* ============================================================
 * 영어 놀이터 — 놀이 #29 「소리 상자」(PlaySoundBox) (설계 v2 §4-29 · 듣기 → 쓰기 · 씨앗의 꽃)
 *   낱말을 듣고 소리 수만큼의 상자에 글자 조각을 차례로 놓는다. 다 놓으면 합쳐 들려준다.
 *     · 조각 나눔은 core/decode.js(PlayPhonics.tokenize) 한 곳 — sh·ch·th·ck·모음짝은 한 조각, 매직 e 는 끝 상자 밖 「꼬리 칸」.
 *     · 길마다 꼴이 다르다:
 *         decode·word  소리 상자(조각 + 헷갈리는 조각 둘)
 *         sight        글자 차례 맞추기(글자는 다 주어진다 — 소리로 쪼개지 않는다)
 *         oral         첫 글자 고르기(나머지 글자는 옅게 보인다 — 입말 낱말은 첫 글자만)
 *     · 앞머리에 귀로만 하는 한 판 — 소리 수 세기(글자 없이 듣고 상자 수 고르기). 글자를 놓기 전에 소리를 쪼갤 줄 알아야 한다.
 *   실패 지원: 다른 조각 → 그 조각만 내려앉고, 한 소리씩 끊어 다시 → 세 번째엔 첫 조각을 놓아 준다. 실패로 끝나는 길 없음.
 *   증거 = 조각으로 쓰기(spell · touch · support none|slow|model) — 씨앗의 꽃 조건(씨앗 엔진의 PATHS). 마이크가 없어도 된다.
 *   어른 메뉴 「손 쓰기 대신 조각으로」(o.asWrite) 로 부르면 같은 판이 쓰기 증거(write · tiles)를 낸다 — 손 쓰기(W14)가 오기 전의 열매 길.
 *   PlaySoundBox.parts(item) — 화면 없는 조각 나눔(검사는 여기를 직접 본다) · PlaySoundBox.one(ctx, host, item, o) — 한 낱말(정원 이름표가 부른다)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    words: 3,          /* 한 번에 만드는 낱말 수(1학년 — 조각 3~4개짜리 셋) */
    extra: 2,          /* 섞어 두는 헷갈리는 조각 수 */
    helpAt: 3,         /* 이만큼 헤매면 첫 조각을 놓아 준다 */
    doneMs: 900, nextMs: 400
  };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 조각 나눔 → { mode, boxes[조각], tail(매직 e 꼬리), tiles[놓을 조각들], sounds[들려줄 소리 조각] } */
  function parts(x) {
    var P = g.PlayPhonics, w = x.w, path = x.path || 'word';
    if (path === 'oral') return { mode: 'first', boxes: [w.charAt(0)], rest: w.slice(1), tail: '', tiles: [w.charAt(0)], sounds: [w.charAt(0)] };
    if (path === 'sight' || !P || !/^[a-z]+$/.test(w)) { var ls = w.split(''); return { mode: 'order', boxes: ls, tail: '', tiles: ls.slice(), sounds: [] }; }
    var t = (x.t && x.t.slice()) || P.tokenize(w), boxes = [], tail = '';
    t.forEach(function (k) { if (/_e$/.test(k)) { boxes.push(k.charAt(0)); tail = 'e'; } else boxes.push(k); });      /* a_e → 상자엔 a, 꼬리 칸에 e */
    return { mode: 'sound', boxes: boxes, tail: tail, tiles: boxes.concat(tail ? ['e'] : []), sounds: (x.s && x.s.slice()) || t };
  }
  /* 헷갈리는 조각 — 같은 종류에서(그 칸까지 배운 것). 소리 숲·소리 공방 칸이 아니면 낱글자에서 */
  function extras(x, p, zoneId) {
    var P = g.PlayPhonics, out = [];
    if (p.mode === 'order') return out;
    var from = p.mode === 'first' ? [p.boxes[0]] : p.boxes;
    from.forEach(function (k) { (P && P.cell && P.cell(zoneId) ? P.distract(k, zoneId, 1) : fallback(k)).forEach(function (d) { if (out.length < CONF.extra && p.tiles.indexOf(d) < 0 && out.indexOf(d) < 0) out.push(d); }); });
    if (p.mode === 'first') fallback(p.boxes[0]).forEach(function (d) { if (out.length < CONF.extra && out.indexOf(d) < 0) out.push(d); });
    return out;
  }
  function fallback(k) { var v = 'aeiou', pool = v.indexOf(k.charAt(0)) >= 0 ? v.split('') : 'stcpnmbdfghlr'.split(''); return shuffle(pool.filter(function (c) { return c !== k && k.indexOf(c) !== 0; })).slice(0, 2); }

  /* 한 낱말 — host 에 판을 그리고 다 놓일 때까지. → Promise({ word, clean, tries, support }) */
  function one(ctx, host, x, o) {
    o = o || {};
    var S = ctx.services || {}, P = g.PlayPhonics, tts = S.tts, audio = S.audio || { play: function () {} }, G = g.PlayGame;
    var p = parts(x), zoneId = (ctx.zone && ctx.zone.id) || ctx.cell, tiles = shuffle(p.tiles.concat(extras(x, p, zoneId)));
    host.innerHTML = '';
    var root = h('div', 'sx sx-' + p.mode), pic = h('div', 'sx-pic', x.pic && p.mode !== 'order' ? x.pic : g.PlayIcon.html('ear')), row = h('div', 'sx-row'), tray = h('div', 'sx-tray'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    root.appendChild(pic); root.appendChild(row); root.appendChild(tray); root.appendChild(rep); host.appendChild(root);
    var need = p.tiles.slice(), at = 0, tries = 0, support = 'none', over = false;
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function whole() { return G.soon(tts ? tts.word(x.w) : null); }
    function slow() { if (p.mode !== 'sound' || !tts || !tts.blend) return G.soon(tts ? tts.word(x.w, { rate: 0.5 }) : null); return G.soon(tts.blend(p.sounds, { passes: 1, word: x.w }), 9000); }
    function draw() {
      var cells = p.boxes.map(function (k, i) { return '<span class="sx-box' + (i < at ? ' full' : i === at ? ' now' : '') + '">' + (i < at ? k : '') + '</span>'; });
      if (p.tail) cells.push('<span class="sx-box sx-tail' + (at > p.boxes.length ? ' full' : at === p.boxes.length ? ' now' : '') + '">' + (at > p.boxes.length ? 'e' : '') + '</span>');
      if (p.mode === 'first') cells.push('<span class="sx-rest">' + p.rest + '</span>');
      row.innerHTML = cells.join('');
    }
    rep.onclick = function () { whole(); };
    return new Promise(function (resolve) {
      function place(b, k) {
        b.classList.add('used'); b.disabled = true; at++; audio.play('pop'); draw();
        if (at < need.length) return;
        over = true; row.classList.add('joined');
        (p.mode === 'sound' && tts && tts.blend ? G.soon(tts.blend(p.sounds, { passes: 1, word: x.w }), 9000) : whole()).then(function () {
          setTimeout(function () { if (alive()) resolve({ word: x.w, clean: tries === 0, tries: tries, support: support }); }, CONF.doneMs);
        });
      }
      tiles.forEach(function (k) {
        var b = h('button', 'sx-tile', k); b.type = 'button'; b.setAttribute('data-u', k);
        b.onclick = function () {
          if (over || b.disabled) return;
          if (k === need[at]) return place(b, k);
          tries++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); if (ctx.oops) ctx.oops();
          if (tries >= CONF.helpAt) {              /* 첫(지금) 조각을 놓아 준다 */
            support = 'model';
            var helper = Array.prototype.filter.call(tray.children, function (c) { return !c.disabled && c.getAttribute('data-u') === need[at]; })[0];
            if (helper) { helper.classList.add('hint'); return slow(); }
          }
          if (support === 'none') support = 'slow';
          slow();
        };
        tray.appendChild(b);
      });
      draw(); whole();
    });
  }

  /* 귀로만 한 판 — 소리 수 세기(글자 없이) */
  function count(ctx, host, x) {
    var S = ctx.services || {}, E = g.PlayEvidence, tts = S.tts, G = g.PlayGame, p = parts(x), n = p.sounds.length;
    host.innerHTML = '';
    var root = h('div', 'sx sx-count'), pic = h('div', 'sx-pic', x.pic || g.PlayIcon.html('ear')), opts = h('div', 'sx-nums'), rep = h('button', 'btn w pp-rep', g.PlayIcon.html('speaker')); rep.type = 'button';
    root.appendChild(pic); root.appendChild(opts); root.appendChild(rep); host.appendChild(root);
    var say = function () { return tts && tts.blend ? G.soon(tts.blend(p.sounds, { passes: 1, word: x.w }), 9000) : G.soon(tts ? tts.word(x.w, { rate: 0.5 }) : null); };
    rep.onclick = say;
    return new Promise(function (resolve) {
      var tries = 1, clean = true, over = false;
      (n >= 3 ? [n - 1, n, n + 1] : [n, n + 1, n + 2]).forEach(function (k) {
        var b = h('button', 'sx-num', new Array(k + 1).join('<i></i>')); b.type = 'button'; b.setAttribute('data-n', k);
        b.onclick = function () {
          if (over || b.disabled) return;
          if (k !== n) { clean = false; tries++; b.disabled = true; b.classList.add('dim'); if (ctx.oops) ctx.oops(); return say(); }
          over = true; b.classList.add('ok');
          ctx.emit(E.make({ targetId: x.w, skill: 'listen', outcome: clean ? 'independent' : 'assisted', inputMode: 'touch', attempts: tries, unit: 'sound', support: clean ? 'none' : 'slow' }));
          setTimeout(resolve, CONF.nextMs);
        };
        opts.appendChild(b);
      });
      say();
    });
  }

  function fitsItem(x) { return !!x && x.path !== 'sentence' && x.path !== 'text' && x.path !== 'letter' && /^[A-Za-z]+$/.test(x.w); }
  function start(ctx) {
    var E = g.PlayEvidence, o = ctx.opt || {}, list = (ctx.targets || []).filter(fitsItem).slice(0, CONF.words);
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'sxg'), dots = h('div', 'dots'), stage = h('div', 'sx-stage');
    root.appendChild(dots); root.appendChild(stage); host.appendChild(root);
    var i = 0, warm = list.filter(function (x) { return parts(x).mode === 'sound'; })[0];
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    return new Promise(function (resolve) {
      function next() {
        if (!alive()) return;
        dots.innerHTML = list.map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= list.length) return resolve({ completed: true });
        var x = list[i];
        one(ctx, stage, x, o).then(function (r) {
          if (!alive()) return;
          ctx.emit(o.asWrite ? E.write(x.w, { skill: 'write', support: 'tiles', inputMode: 'touch' }) : E.write(x.w, { skill: 'spell', support: r.support, clean: r.clean, attempts: r.tries + 1, inputMode: 'touch' }));
          ctx.good(r.clean);
          i++; setTimeout(next, CONF.nextMs);
        });
      }
      g.PlayGame.soon(ctx.intro, null).then(function () { if (!alive()) return; if (warm && !o.noWarm) count(ctx, stage, warm).then(next); else next(); });
    });
  }

  g.PlaySoundBox = { CONF: CONF, parts: parts, one: one, count: count, fitsItem: fitsItem, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sound-box', no: 29, name: '소리 상자', icon: 'box', channels: ['hand', 'sound'], axis: 'make', need: {},
    skills: ['W', 'L'], unit: 'word', serves: [2],
    fits: function (zone) { return (zone.words || []).some(fitsItem); },
    count: function (c) { return Math.min(CONF.words, (c.targets || []).filter(fitsItem).length) + 1; },
    intro: { en: 'Listen!', ko: '소리를 듣고 상자마다 글자 조각을 놓아 줘!' },
    intro1: { en: 'Listen!', ko: '소리를 듣고 상자마다 글자 조각을 놓아 줘!' },
    start: start
  });
})(window);
