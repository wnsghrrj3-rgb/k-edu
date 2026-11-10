/* ============================================================
 * 영어 놀이터 — 문장 자판기(PlayGram) : 놀이 #4 마법 자판기(문법판) + #23 엉뚱한 이야기 (게임설계 v1 §4-4·23 · 창작)
 *   문법 칸(G)은 「문제」가 아니라 조합 놀이로만(W08 끝 조건). 규칙은 화면이 먼저 말하지 않는다 — 맞지 않는 칩은 그냥 「안 들어간다」.
 *   · 자판기 화면에 주문 그림(누가·무엇) → 아이가 칩을 차례로 끼워 문장을 만든다 → 자판기가 그 문장대로 내보낸다.
 *     주문과 다른 문장을 만들면 그 문장대로 엉뚱한 것이 나온다(웃음) — 「틀렸다」 없이 다시.
 *   · 다 만들면 소리 내어 말한다(PlayTutor 3단) → 말로 하면 씨앗(문장째로).
 *   칸마다 문장틀이 펼침과 1:1 — zone.gram.mode
 *     'be'      (Lv2 #10) [I / You / It] + [am / are / is] + [끝말]          — 「a duck」은 한 칩(관사는 아직 · #24)
 *     'article' (Lv2 #24) It is + [명사] → [a / an]                           — 명사를 먼저 끼우면 관사 칩이 고르라고 흔들린다(24_2) · an 에는 입 그림
 *     'total'   (Lv2 #29) [It / They / He / She / We] + [am·are·is] + [a / an / —] + [명사·꾸밈말·here] — They·We 에는 a 가 안 들어간다(29_1 저울)
 *     'story'   (#23 엉뚱한 이야기) [I / You] + [am·are / like] + [끝말] — 주문 없이 마음대로, 결과가 웃기게 움직인다
 *   lv2-10 의 끝에는 「내가 만든 문장」 — 만든 문장을 주어별로 모아 둘째 낱말을 나란히(10_2 정렬 공개 — 규칙 문장은 쓰지 않는다).
 *   PlayGram.fits(slots, chip) · PlayGram.parse(sentence) — 화면 없는 규칙(검사는 여기를 직접 본다)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { rounds: 5, guestRounds: 3, storyRounds: 3, outMs: 900, nextMs: 400 };
  var BE = { I: 'am', You: 'are', It: 'is', He: 'is', She: 'is', We: 'are', They: 'are' };
  var MANY = { We: 1, They: 1 };
  var VOWEL = /^[aeiou]/;     /* Lv2 재료는 소리 기준 = 글자 기준(펼침 24 판정) — hour·university 류 노출 0 */
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* 문장 → { subj, be, art, end } (be 칸 문장 「It is a duck.」의 a duck 은 끝말 한 칩) */
  function parse(s, mode) {
    var t = String(s).replace(/[.!?]$/, '').split(' ');
    var o = { subj: t[0], be: t[1], art: '', end: t.slice(2).join(' ') };
    if (mode !== 'be' && (t[2] === 'a' || t[2] === 'an')) { o.art = t[2]; o.end = t.slice(3).join(' '); }
    return o;
  }
  function join(o) { return [o.subj, o.be, o.art, o.end].filter(Boolean).join(' ') + '.'; }
  /* 끝말의 종류 — 이름·자리(here)·꾸밈말은 관사 없이, 명사는 a/an */
  function kindOf(end, Z) { var k = ((Z && Z.gram && Z.gram.kinds) || {})[end]; if (k) return k; return /^[A-Z]/.test(end) ? 'name' : 'noun'; }
  /* 그 칩이 지금까지 끼운 칸들과 맞나 — 안 맞으면 들어가지 않는다(규칙은 칩이 말한다) */
  function fits(slot, chip, sofar, Z) {
    var mode = (Z && Z.gram && Z.gram.mode) || 'be';
    if (slot === 'be') return chip === 'like' ? !!sofar.subj : BE[sofar.subj] === chip;
    if (slot === 'art') {
      var k = kindOf(sofar.end, Z);
      if (chip === '—') return k !== 'noun' || mode === 'be';
      if (MANY[sofar.subj]) return false;                              /* 여럿에는 a 가 안 붙는다(29) */
      if (k !== 'noun') return false;
      return chip === (VOWEL.test(sofar.end) ? 'an' : 'a');
    }
    if (slot === 'end') {
      if (sofar.be === 'like') return /^a /.test(chip) || kindOf(chip, Z) === 'noun';      /* 「I like big.」 은 안 된다 */
      if (MANY[sofar.subj] && kindOf(chip, Z) === 'noun') return false;  /* 복수 -s 는 Lv2 노출 0 → They are 뒤엔 꾸밈말·here 만(29 판정) */
      return true;
    }
    return true;
  }

  function start(ctx, o) {
    o = o || {};
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, A = g.PlayArt, tts = S.tts, audio = S.audio || { play: function () {} };
    var gram = Z.gram || {}, mode = o.story ? 'story' : (gram.mode || 'be');
    var words = Z.words || [], byW = {}; words.forEach(function (x) { byW[x.w] = x; });
    var items = (ctx.targets || words).filter(function (x) { return !!x.w; });
    var orders = mode === 'story' ? [] : (o.guest ? shuffle(words) : items).slice(0, o.guest ? CONF.guestRounds : CONF.rounds);
    var nRounds = mode === 'story' ? CONF.storyRounds : orders.length;
    /* 칩 — 칸마다 고를 거리 */
    var ends = mode === 'story' ? (gram.storyEnds || []) : (gram.ends || []);
    var SL = mode === 'article' ? [{ k: 'end', chips: ends }, { k: 'art', chips: ['a', 'an'] }]
      : mode === 'total' ? [{ k: 'subj', chips: gram.subjects }, { k: 'be', chips: ['am', 'are', 'is'] }, { k: 'end', chips: ends }, { k: 'art', chips: ['a', 'an', '—'] }]
      : mode === 'story' ? [{ k: 'subj', chips: ['I', 'You'] }, { k: 'be', chips: ['am', 'are', 'like'] }, { k: 'end', chips: ends }]
      : [{ k: 'subj', chips: gram.subjects || ['I', 'You', 'It'] }, { k: 'be', chips: ['am', 'are', 'is'] }, { k: 'end', chips: ends }];
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'gv gv-' + mode), dots = h('div', 'dots'), box = h('div', 'gv-box'), slotsEl = h('div', 'gv-slots'), tray = h('div', 'gv-tray'), act = h('div', 'oq-act');
    box.innerHTML = '<div class="gv-screen"></div><div class="gv-out"></div>';
    root.appendChild(dots); root.appendChild(box); root.appendChild(slotsEl); root.appendChild(tray); root.appendChild(act); host.appendChild(root);
    var screen = box.querySelector('.gv-screen'), out = box.querySelector('.gv-out');
    var i = 0, made = [], bys = [];
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function later(ms, fn) { setTimeout(function () { if (alive()) fn(); }, ms); }
    function speak(s) { return G.soon(tts ? tts.sentence(s) : null); }
    /* 그림 — 문장 하나를 그림으로(주어 신호 + 끝말 그림). 주문 화면·내보내기 공통 */
    function cue(subj) { return subj === 'I' ? A.html('I') : subj === 'You' ? A.html('you') : subj === 'He' ? A.html('ben') : subj === 'She' ? A.html('amy') : subj === 'We' ? A.html('I') + A.html('mina') : ''; }
    function endPic(end) { var key = end.replace(/^an? /, ''), x = byW[key]; var art = (gram.art || {})[key] || key; return A.has(art) ? A.html(art) : (x && x.pic) || '<span class="art-word">' + key + '</span>'; }
    function picOf(s) {
      var p = parse(s, mode === 'story' ? 'be' : mode), main = endPic(p.end);
      if (MANY[p.subj] && p.subj === 'They') return '<span class="gv-many">' + main + main + main + '</span>';
      return '<span class="gv-cue">' + cue(p.subj) + '</span>' + (p.be === 'like' ? A.html('like') : '') + '<span class="gv-main">' + main + '</span>';
    }

    return new Promise(function (resolve) {
      function round() {
        dots.innerHTML = new Array(nRounds + 1).join('x').split('').map(function (_, k) { return '<i class="' + (k < i ? 'ok' : k === i ? 'on' : '') + '"></i>'; }).join('');
        if (i >= nRounds) return finish();
        var order = orders[i] || null, sofar = {}, at = 0, refused = 0, tries = 1;
        if (mode === 'article') { sofar.subj = 'It'; sofar.be = 'is'; }
        screen.innerHTML = order ? picOf(order.w) : A.html('sparkle'); screen.setAttribute('data-w', order ? order.w : '');
        out.innerHTML = ''; out.className = 'gv-out'; act.innerHTML = '';
        drawSlots(); drawTray();
        function drawSlots() {
          var cells = (mode === 'article' ? ['It', 'is'] : []).map(function (w) { return '<span class="gv-slot fixed">' + w + '</span>'; });
          var order2 = mode === 'article' ? ['art', 'end'] : mode === 'total' ? ['subj', 'be', 'art', 'end'] : ['subj', 'be', 'end'];
          order2.forEach(function (k) { var v = sofar[k]; cells.push('<span class="gv-slot' + (v ? ' full' : '') + (SL[at] && SL[at].k === k ? ' now' : '') + '" data-k="' + k + '">' + (v ? (v === '—' ? '·' : v) : '') + '</span>'); });
          slotsEl.innerHTML = cells.join('');
        }
        function drawTray() {
          tray.innerHTML = '';
          var s = SL[at]; if (!s) return;
          (s.chips || []).forEach(function (c) {
            var b = h('button', 'gv-chip' + (c === 'an' ? ' an' : ''), (c === 'an' ? '<span class="gv-mouth">' + A.html('mouth') + '</span>' : '') + (c === '—' ? '·' : c)); b.type = 'button'; b.setAttribute('data-c', c);
            b.onclick = function () {
              if (!fits(s.k, c, sofar, Z)) { refused++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); ctx.oops(); if (c === 'a' && s.k === 'art' && VOWEL.test(sofar.end || '')) tray.classList.add('hint-an'); return; }     /* 안 들어간다 — 그것뿐 */
              sofar[s.k] = c; at++; audio.play('pop'); tray.classList.remove('hint-an');
              if (at < SL.length) { drawSlots(); drawTray(); return; }
              drawSlots(); tray.innerHTML = ''; vend();
            };
            tray.appendChild(b);
          });
        }
        function vend() {
          var built = join({ subj: sofar.subj, be: sofar.be, art: sofar.art === '—' ? '' : (sofar.art || ''), end: sofar.end });
          out.innerHTML = picOf(built); out.className = 'gv-out on' + (mode === 'story' ? ' st-' + (sofar.be === 'like' ? 'like' : 'am') : '');
          audio.play('tray'); if (S.fx && S.fx.puff) S.fx.puff(out);
          if (order && built !== order.w) {                 /* 주문과 다른 것이 나왔다 — 웃고 다시 */
            tries++; later(CONF.outMs, function () { ctx.oops(); sofar = {}; at = 0; if (mode === 'article') { sofar.subj = 'It'; sofar.be = 'is'; } out.className = 'gv-out silly'; drawSlots(); drawTray(); });
            return;
          }
          var target = order ? order.w : built, clean = refused === 0 && tries === 1;
          made.push(target);
          ctx.emit(E.act(target, 'build', 'touch', clean, tries + refused));
          later(CONF.outMs, function () { say(target, clean); });
        }
      }
      /* 말하기 — 문장틀(주어·be) + 끝 낱말 열쇠로 판정 */
      function say(sent, clean) {
        var p = parse(sent, mode === 'story' ? 'be' : mode), key = p.end.split(' ').pop().toLowerCase();
        var tctx = {}; Object.keys(ctx).forEach(function (k) { tctx[k] = ctx[k]; }); tctx.pool = [{ w: key, pic: endPic(p.end) }];
        G.soon(o.guest ? null : speak(sent), o.guest ? 0 : null).then(function () {
          if (!alive()) return;
          return g.PlayTutor.ask(tctx, { host: act, cands: [key], kind: 'sentence', sentence: function () { return sent; }, frame: [p.subj.toLowerCase(), p.be], hint0: !!o.guest });
        }).then(function (r) {
          if (!r || !alive()) return;
          bys.push(r.by); ctx.emit(E.say(sent, r)); ctx.good(clean && r.by === 'speech' && !r.hinted, { at: out });
          i++; later(CONF.nextMs, round);
        });
      }
      /* 끝 — lv2-10 은 만든 문장을 주어별로 모아 나란히(정렬 공개) */
      function finish() {
        if (gram.reveal && made.length) {
          var groups = {}; made.forEach(function (s) { var p = parse(s, 'be'); (groups[p.subj] = groups[p.subj] || []).push(p); });
          box.innerHTML = '<div class="gv-reveal">' + Object.keys(groups).map(function (k) { return '<div class="gv-row"><b>' + k + '</b>' + groups[k].map(function (p) { return '<span><i>' + p.be + '</i> ' + p.end + '</span>'; }).join('') + '</div>'; }).join('') + '</div>';
          slotsEl.innerHTML = ''; tray.innerHTML = ''; act.innerHTML = '<div class="heard">내가 만든 문장 — 뭐가 보여?</div>';
          return later(CONF.outMs * 2, function () { resolve({ completed: true, passed: true, by: bys.indexOf('speech') >= 0 ? 'speech' : 'chosen' }); });
        }
        resolve({ completed: true, passed: true, by: bys.indexOf('speech') >= 0 ? 'speech' : 'chosen' });
      }
      G.soon(ctx.intro, null).then(function () { if (alive()) round(); });
    });
  }

  g.PlayGram = { CONF: CONF, BE: BE, fits: fits, parse: parse, join: join, start: start, run: start };
  if (g.PlayGame) {
    g.PlayGame.register({
      id: 'gram-vending', no: 4, name: '문장 자판기', icon: 'vending', channels: ['make', 'say'], axis: 'make', need: { lv2: 10 }, plants: true,
      fits: function (zone) { return !!(zone.gram && zone.gram.mode); },
      count: function (c) { return Math.min(CONF.rounds, (c.targets || []).length) * 2; },
      intro: { en: 'Make it!', ko: '그림을 보고 칩을 끼워 문장을 만들어 봐 — 맞지 않는 칩은 안 들어가!' },
      start: function (ctx) { return start(ctx, {}); }
    });
    g.PlayGame.register({
      id: 'silly-story', no: 23, name: '엉뚱한 이야기', icon: 'mask', channels: ['make', 'say'], axis: 'laugh', need: { lv2: 10 }, plants: true,
      fits: function (zone) { return !!(zone.gram && (zone.gram.storyEnds || []).length >= 3); },
      count: function () { return CONF.storyRounds * 2; },
      intro: { en: 'Ha ha!', ko: '마음대로 문장을 만들면 그대로 변신해 — 엉뚱하게!' },
      start: function (ctx) { return start(ctx, { story: true }); }
    });
  }
})(window);
