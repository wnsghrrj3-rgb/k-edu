/* ============================================================
 * 영어 놀이터 — 놀이 #37 「소리 챈트」 (한 해 길 v1 §3 — 이 길의 심장 · 말하기·듣기)
 *   한 판 = 네 단. 낱말 하나를 입 밖으로 여러 번 — 아이에게는 놀이가 바뀔 뿐이다.
 *     1 듣기   — 주인이 한 줄씩. 낱말이 나올 때 그 그림이 빛난다. (글자 걸음은 끝에 「소리 듣고 글자 찾기」 한 판 — 글자 씨앗을 심는다)
 *     2 메아리 — 한 줄 듣고 한 줄 따라. 메아리 단추(#35)로 내 목소리를 바로 다시 들을 수 있다.
 *     3 같이   — 주인과 같이, 박자가 한 칸 빨라진다.
 *     4 혼자   — 주인은 박자만. 낱말 자리마다 그림이 뜨고 아이가 채운다.
 *   판정: 낱말 자리에서 목소리가 켜졌는지만 본다(PlayVoice — 마이크 소리 크기뿐, 기기 안에서만, 저장·전송 0).
 *         한 판에 한 낱말은 음성 인식으로 받아 씨앗에 먹인다(아직 씨앗이 없는 낱말 먼저). 못 알아들어도 판은 흐른다 — 「틀렸다」 0.
 *   마이크가 없으면 4단의 낱말 자리를 박자에 맞춰 누른다(증거는 듣기).
 *   발음 본보기는 하나 — 변하는 것은 박자뿐(우스운 목소리·속삭임 0). 챈트 글은 전부 길 자료(zone.chantLines)에서.
 *   글자 걸음은 한 판에 한 글자(그 글자의 네 줄 + 끝 줄) — 씨앗이 덜 심긴 글자부터.
 *   PlayChant.parse(line) · PlayChant.pick(zone, seeds) — 화면 없는 부분(검사는 여기를 직접 본다)
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = {
    beatMs: 650,        /* 한 줄 뒤 쉬는 박(듣기) */
    echoMs: 1500,       /* 메아리·혼자 — 아이 차례를 기다리는 길이 */
    faster: 0.8,        /* 「같이」 단의 박자(짧을수록 빠름) */
    listenMs: 4000,     /* 음성 인식으로 받는 한 낱말 */
    stageGap: 500
  };
  var NAMES = ['듣기', '메아리', '같이', '혼자'];
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* 줄 → { text, letter, word } — 글자 줄 「a, a, /a/ /a/ apple!」 · 그 밖은 끝 낱말 */
  function parse(line) {
    var m = /^([a-z]), \1, \/([a-z]+)\/ \/\2\/ ([A-Za-z]+)!$/.exec(line);
    if (m) return { text: line, letter: m[1], word: m[3].toLowerCase() };
    var ws = String(line).replace(/[^A-Za-z\- ]/g, ' ').split(/\s+/).filter(function (t) { return t && !/-/.test(t); });
    return { text: line, letter: '', word: ws.length ? ws[ws.length - 1].toLowerCase() : '' };
  }
  /* 오늘의 줄 — 글자 걸음은 한 글자(씨앗이 덜 심긴 쪽) + 끝 줄 · 그 밖은 전부 */
  function pick(zone, planted) {
    var lines = (zone.chantLines || []).map(parse), letters = (zone.letterItems || []).map(function (x) { return x.w; });
    if (!letters.length) return lines;
    var by = {}; letters.forEach(function (l) { by[l] = lines.filter(function (x) { return x.letter === l; }); });
    var left = function (l) { return by[l].filter(function (x) { return !(planted || {})[x.word]; }).length; };
    var L = letters.slice().sort(function (a, b) { return left(b) - left(a); })[0];
    return by[L].concat(lines.filter(function (x) { return !x.letter; }).slice(-1));
  }

  function start(ctx) {
    var S = ctx.services || {}, Z = ctx.zone || {}, E = g.PlayEvidence, G = g.PlayGame, P = g.PlayPhonics, tts = S.tts, speech = S.speech, seed = S.seed, audio = S.audio || { play: function () {} };
    var mic = (ctx.learner && ctx.learner.mic) || { ok: function () { return false; }, prime: function () {} };
    var byW = {}; (Z.words || []).forEach(function (x) { byW[x.w] = x; });
    var planted = {}; if (seed && seed.all) { var all = seed.all(); (Z.words || []).forEach(function (x) { if (all[seed.key(x.w, x.path)]) planted[x.w] = 1; }); }
    var lines = pick(Z, planted), letter = (lines[0] && lines[0].letter) || '';
    /* 낱말 자리 = 글자 줄(글자 걸음) · 그 밖은 끝 줄(문장 — 같이 외친다)을 뺀 줄 */
    var slot = function (x) { return !!byW[x.word] && (letter ? !!x.letter : x !== lines[lines.length - 1]); };
    var words = lines.filter(slot).filter(function (x, i, a) { return a.findIndex(function (y) { return y.word === x.word; }) === i; });
    var host = ctx.host; host.innerHTML = '';
    var root = h('div', 'sc'), tabs = h('div', 'sc-tabs', NAMES.map(function (n) { return '<span>' + n + '</span>'; }).join('')), row = h('div', 'sc-row'), text = h('div', 'sc-line'), pad = h('div', 'oq-act sc-pad');
    row.innerHTML = words.map(function (x) { return '<span class="sc-item" data-w="' + x.word + '">' + (byW[x.word].pic || x.word) + '</span>'; }).join('');
    root.appendChild(tabs); root.appendChild(row); root.appendChild(text); root.appendChild(pad); host.appendChild(root);
    function alive() { return root.parentNode === host && root.isConnected !== false && !(ctx.signal && ctx.signal.aborted); }
    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function tab(k) { Array.prototype.forEach.call(tabs.children, function (t, n) { t.className = n < k ? 'ok' : n === k ? 'on' : ''; }); root.setAttribute('data-stage', k + 1); }
    function glow(w, on) { var el = row.querySelector('.sc-item[data-w="' + w + '"]'); if (el) el.classList.toggle('on', !!on); return el; }
    /* 한 줄을 소리 낸다 — 글자 줄 = 소리 둘 + 낱말 · 그 밖 = 문장째 */
    function speak(x) {
      if (!tts) return Promise.resolve();
      if (x.letter) { var snd = function () { return G.soon(P ? P.say(tts, x.letter) : tts.sound ? tts.sound(x.letter) : null, 1500); }; return snd().then(snd).then(function () { return G.soon(tts.word(x.word)); }); }
      return G.soon(tts.sentence(x.text.replace(/-/g, '')));
    }
    function show(x) { text.innerHTML = x.letter ? '<b class="sc-letter">' + x.letter + '</b> <span>' + x.word + '</span>' : '<span>' + x.text + '</span>'; }
    var voice = g.PlayVoice && mic.ok() && g.PlayVoice.available() ? g.PlayVoice : null;

    return new Promise(function (resolve) {
      function each(fn) { return lines.reduce(function (p, x) { return p.then(function () { return alive() ? fn(x) : null; }); }, Promise.resolve()); }
      /* 1 듣기 */
      function listenStage() { tab(0); pad.innerHTML = ''; return each(function (x) { show(x); glow(x.word, true); return speak(x).then(function () { return wait(CONF.beatMs); }).then(function () { glow(x.word, false); }); }); }
      /* 글자 걸음 — 소리 듣고 글자 찾기(글자 씨앗 심기) */
      function findLetter() {
        if (!letter) return Promise.resolve();
        var opts = (Z.letterItems || []).map(function (x) { return x.w; }); if (opts.length < 2) return Promise.resolve();
        text.innerHTML = g.PlayIcon.html('ear'); pad.innerHTML = '';
        return new Promise(function (res) {
          var tries = 1, clean = true, over = false, box = h('div', 'oq-offer sc-letters');
          opts.forEach(function (k) {
            var b = h('button', 'tile', '<span class="ph-chip">' + k + '</span>'); b.type = 'button'; b.setAttribute('data-u', k);
            b.onclick = function () {
              if (over || b.disabled) return;
              if (k !== letter) { clean = false; tries++; b.disabled = true; b.classList.add('dim'); ctx.oops(); return G.soon(P ? P.say(tts, letter) : null); }
              over = true; b.classList.add('ok');
              ctx.emit(E.make({ targetId: letter, skill: 'listen', outcome: clean ? 'independent' : 'assisted', inputMode: 'touch', attempts: tries, unit: 'letter' })); ctx.good(clean, { at: b });
              setTimeout(res, CONF.stageGap);
            };
            box.appendChild(b);
          });
          pad.appendChild(box);
          G.soon(P ? P.say(tts, letter) : null);
        });
      }
      /* 2 메아리 — 듣고 따라(메아리 단추) */
      function echoStage() {
        tab(1); pad.innerHTML = ''; if (g.PlayEcho) g.PlayEcho.button(pad);
        return each(function (x) { show(x); glow(x.word, true); return speak(x).then(function () { return voice ? voice.heard(CONF.echoMs) : wait(CONF.echoMs); }).then(function () { glow(x.word, false); }); });
      }
      /* 3 같이 — 한 칸 빠르게 */
      function togetherStage() {
        tab(2); pad.innerHTML = '';
        return each(function (x) { show(x); var el = glow(x.word, true); if (el) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); } return speak(x).then(function () { return wait(CONF.beatMs * CONF.faster); }).then(function () { glow(x.word, false); }); });
      }
      /* 4 혼자 — 낱말 자리를 아이가 채운다 */
      function soloStage() {
        tab(3); pad.innerHTML = '';
        var asked = false, firstNew = words.filter(function (x) { return !planted[x.word]; })[0] || words[0];
        return each(function (x) {
          var it = slot(x) ? byW[x.word] : null; if (!it) { show(x); return speak(x).then(function () { return wait(CONF.beatMs); }); }      /* 끝 줄(문장)은 같이 */
          text.innerHTML = x.letter ? '<b class="sc-letter">' + x.letter + '</b>' : ''; glow(x.word, true); audio.play('pop');
          var done = function () { glow(x.word, false); };
          if (!mic.ok()) {            /* 박자에 맞춰 누르기 */
            return new Promise(function (res) {
              pad.innerHTML = ''; var b = h('button', 'btn sc-beat', it.pic || x.word); b.type = 'button'; b.setAttribute('data-w', x.word);
              var fin = function (hit) { if (b._d) return; b._d = 1; if (hit) { ctx.emit(E.act(x.word, 'listen', 'touch', true, 1)); ctx.good(true, { at: b }); } pad.innerHTML = ''; done(); res(); };
              b.onclick = function () { fin(true); }; pad.appendChild(b);
              setTimeout(function () { fin(false); }, CONF.echoMs * 2);
            });
          }
          if (!asked && x === firstNew && speech) {      /* 한 낱말은 음성 인식으로 — 씨앗에 먹인다 */
            asked = true;
            return speech.tryOnce(x.word, { kind: 'word', others: words.map(function (y) { return y.word; }).filter(function (y) { return y !== x.word; }), timeout: CONF.listenMs }).then(function (r) {
              if (r && r.ok) { mic.prime(); ctx.emit(E.say(x.word, { by: 'speech', tries: 0, hinted: true })); ctx.good(true, { at: row }); }
              done();
            });
          }
          return (voice ? voice.heard(CONF.echoMs) : wait(CONF.echoMs)).then(function (on) { var el = row.querySelector('.sc-item[data-w="' + x.word + '"]'); if (on && el) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); } done(); });
        });
      }
      var pre = voice ? G.soon(voice.start(), 2500) : Promise.resolve();
      Promise.all([G.soon(ctx.intro, null), pre]).then(function () { if (!alive()) return; return listenStage(); })
        .then(function () { return alive() ? findLetter() : null; })
        .then(function () { return alive() ? echoStage() : null; })
        .then(function () { return alive() ? togetherStage() : null; })
        .then(function () { return alive() ? soloStage() : null; })
        .then(function () { if (voice) voice.stop(); if (alive()) { tab(4); resolve({ completed: true }); } });
    });
  }

  g.PlayChant = { CONF: CONF, parse: parse, pick: pick, start: start };
  if (g.PlayGame) g.PlayGame.register({
    id: 'sound-chant', no: 37, name: '소리 챈트', icon: 'note', channels: ['say', 'ear'], axis: 'body', need: {},
    skills: ['S', 'L'], unit: 'word', serves: [0, 1],
    fits: function (zone) { return (zone.chantLines || []).length > 0; },
    count: function (c) { var z = c.zone || {}; return Math.max(1, pick(z, {}).length - 1); },
    intro: { en: 'Listen!', ko: '박자에 맞춰 듣고, 따라 하고, 같이 외쳐 봐!' },
    intro1: { en: 'Listen!', ko: '박자에 맞춰 듣고, 따라 하고, 같이 외쳐 봐!' },
    start: start
  });
})(window);
