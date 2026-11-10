/* ============================================================
 * 영어 놀이터 — 소리 읽기 도구(PlayPhonics) : 조각 가르기 · 「배운 소리로만 읽히는가」 검증 · 소리 내기 · 소리 공방 구역 만들기
 *   재료는 content/phonics.js(생성 파일) — 여기는 규칙만.
 *   그 칸까지 배운 것 = Lv1 낱글자 26 + 그 칸의 known(글자 둘 한 소리·매직 e·모음짝) + knownBlends(자음 묶음).
 *   decodable(w, cell) : 아직 안 배운 「글자 둘 한 소리」가 하나라도 있으면 그 칸에서 못 쓴다
 *   buildable(w, cell) : 조각을 맞춰 조립할 수 있나(이어진 낱자음은 배운 묶음이어야 하고, 매직 e 앞의 c 는 뺀다)
 *   validate()         : 재료 전체를 훑어 위반을 모은다 — tests/content-validation.js · 하네스가 0 을 확인한다
 * ============================================================ */
(function (g) {
  'use strict';
  var D = g.PLAY_PHONICS || { cells: [], letters: [] };
  var TEAMS = ['sh', 'ch', 'th', 'ck', 'ai', 'ay', 'ee', 'ea', 'oa', 'ow'];          /* 글자 둘, 소리 하나(전체 목록 — 배웠는지는 칸마다 다르다) */
  var VOW = 'aeiou';
  var STAGE = { id: 'sound-shop', name: '소리 공방', emoji: '🔧', page: 'zone/sound-shop.html' };
  var GAMES = ['read-aloud', 'sound-monster', 'sound-jump', 'sound-bridge', 'sound-train', 'sound-swap'];
  var DECOR = [
    { id: 'gear', pic: '⚙️', name: '톱니' }, { id: 'bolt', pic: '🔩', name: '나사' }, { id: 'radio', pic: '📻', name: '라디오' }, { id: 'magnet', pic: '🧲', name: '자석' },
    { id: 'bulb', pic: '💡', name: '전구' }, { id: 'dial', pic: '🎛️', name: '조절판' }, { id: 'torch', pic: '🔦', name: '손전등' }, { id: 'bell', pic: '🔔', name: '종' }
  ];

  function scan(s) { var out = [], i = 0; while (i < s.length) { var two = s.slice(i, i + 2); if (TEAMS.indexOf(two) >= 0) { out.push(two); i += 2; } else { out.push(s.charAt(i)); i++; } } return out; }
  /* 매직 e(모음 + 자음 하나 + 끝 e) → 글자 둘 한 소리 → 낱글자 */
  function tokenize(w) {
    w = String(w || '').toLowerCase();
    var m = /^(.*?)([aiou])([b-df-hj-np-tv-z])e$/.exec(w);
    return m ? scan(m[1]).concat([m[2] + '_e', m[3]]) : scan(w);
  }
  function cell(id) { for (var i = 0; i < D.cells.length; i++) if (D.cells[i].id === id) return D.cells[i]; return null; }
  function index(id) { for (var i = 0; i < D.cells.length; i++) if (D.cells[i].id === id) return i; return -1; }
  function isVowel(t) { return VOW.indexOf(t.charAt(0)) >= 0; }

  function decodable(w, id) {
    var c = cell(id), why = [];
    if (!c) return { ok: false, why: ['칸 없음'] };
    if (!/^[a-z]+$/.test(w)) return { ok: false, why: ['글자 아님'] };
    tokenize(w).forEach(function (t) { if (t.length > 1 && c.known.indexOf(t) < 0) why.push('아직 안 배운 소리 ' + t); });
    return { ok: !why.length, why: why };
  }
  function buildable(w, id) {
    var c = cell(id); if (!c || !decodable(w, id).ok) return false;
    var t = tokenize(w);
    for (var i = 0; i + 1 < t.length; i++) if (t[i].length === 1 && t[i + 1].length === 1 && !isVowel(t[i]) && !isVowel(t[i + 1]) && c.knownBlends.indexOf(t[i] + t[i + 1]) < 0) return false;
    if (t.length >= 2 && /_e$/.test(t[t.length - 2]) && t[t.length - 1] === 'c') return false;
    return true;
  }
  /* 그 칸의 제 단어(씨앗 대상) · 대조 단어 */
  function own(id) { var c = cell(id); return c ? c.words.filter(function (x) { return x.role !== 'contrast'; }) : []; }
  function contrast(id) { var c = cell(id); return c ? c.words.filter(function (x) { return x.role === 'contrast'; }) : []; }
  /* 그 칸까지의 단어 전부(앞 칸 복습 포함) — 같은 단어는 처음 것만 */
  function pool(id) {
    var out = [], seen = {}, k = index(id);
    for (var i = 0; i <= k; i++) D.cells[i].words.forEach(function (x) { if (!seen[x.w]) { seen[x.w] = 1; out.push(x); } });
    return out;
  }
  function sounds(x) { return (x && (x.s || x.t)) || []; }
  /* 그 칸에서 연습할 소리 칩 — 새로 배운 것. 복습 칸(#16)은 매직 e 넷 */
  function units(id) {
    var c = cell(id); if (!c) return [];
    var u = c.units.concat(c.blends);
    if (!u.length) u = c.known.filter(function (k) { return /_e$/.test(k); });
    return u;
  }
  /* 헷갈림 보기 — 같은 종류(모음짝끼리·자음 묶음끼리)에서, 소리가 같은 것(ai↔ay↔a_e)은 빼고 */
  function family(u) { return /_e$/.test(u) || isVowel(u) ? 'v' : 'c'; }
  function sameSound(a, b) { var T = g.KTTS; if (a === b) return true; if (T && T.sameAs) return T.sameAs(a).indexOf(b) >= 0; return false; }
  function distract(u, id, n) {
    var c = cell(id), all = c ? c.known.concat(c.knownBlends) : [], fam = family(u);
    var list = all.filter(function (k) { return k !== u && family(k) === fam && !sameSound(u, k); });
    var letters = (fam === 'v' ? ['a', 'e', 'i', 'o', 'u'] : ['s', 't', 'c', 'p', 'n', 'm', 'b', 'd', 'f', 'g', 'h', 'l', 'r']).filter(function (k) { return k !== u && u.indexOf(k) !== 0 && !sameSound(u, k); });
    list = shuffle(list).concat(shuffle(letters));
    var out = []; list.forEach(function (k) { if (out.length < (n || 2) && out.indexOf(k) < 0) out.push(k); });
    return out;
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* 한 소리만 다른 짝 — to 는 이 칸의 제 단어, from 은 이 칸까지의 단어. 둘 다 조립할 수 있어야 한다 */
  function pairs(id) {
    var out = [], mine = own(id).filter(function (x) { return buildable(x.w, id); }), all = pool(id).filter(function (x) { return buildable(x.w, id); });
    mine.forEach(function (b) {
      all.forEach(function (a) {
        if (a.w === b.w || a.t.length !== b.t.length) return;
        var at = -1, n = 0; for (var i = 0; i < a.t.length; i++) if (a.t[i] !== b.t[i]) { n++; at = i; }
        if (n === 1) out.push({ from: a, to: b, at: at });
      });
    });
    return out;
  }
  /* 소리 하나 내기 — 한 소리(sh·a_e·ai…)는 그대로, 자음 묶음(st)은 두 소리를 이어서 */
  function say(tts, u, opt) {
    if (!tts) return Promise.resolve();
    if (tts.PHONEMES ? tts.PHONEMES[u] : (u.length === 1 || TEAMS.indexOf(u) >= 0 || /_e$/.test(u) || u === 'dh')) return tts.sound(u, opt);
    return tts.blend(u.split(''), { passes: 1, word: '' });
  }
  /* 단어를 글자로 보여 주기 — 「글자 둘 한 소리」와 매직 e 짝은 색으로 묶는다 */
  function html(x) {
    var t = (x && x.t) || tokenize(x && x.w || x), out = '';
    for (var i = 0; i < t.length; i++) {
      if (/_e$/.test(t[i])) { out += '<b class="ph-u">' + t[i].charAt(0) + '</b>' + (t[i + 1] || '') + '<b class="ph-u">e</b>'; i++; }
      else out += t[i].length > 1 ? '<b class="ph-u">' + t[i] + '</b>' : t[i];
    }
    return '<span class="ph-w">' + out + '</span>';
  }
  function chip(u) { return '<span class="ph-chip">' + u + '</span>'; }

  /* 재료 전체 검사 — 위반 목록(비어 있어야 한다) */
  function validate() {
    var v = [], T = g.KTTS, seen = {};
    D.cells.forEach(function (c) {
      c.units.concat(c.blends).forEach(function (u) {
        if (seen[u] && c.units.indexOf(u) >= 0) v.push(c.id + ' 소리 ' + u + ' — 앞 칸에서 이미 배움');
        seen[u] = 1;
        if (c.units.indexOf(u) >= 0 && T && T.PHONEMES && !T.PHONEMES[u]) v.push(c.id + ' 소리 ' + u + ' — 소리 사전에 없음');
        if (c.blends.indexOf(u) >= 0 && !/^[b-df-hj-np-tv-z]{2}$/.test(u)) v.push(c.id + ' 묶음 ' + u + ' — 자음 둘이 아님');
      });
      c.words.forEach(function (x) {
        var d = decodable(x.w, c.id);
        if (!d.ok) v.push(c.id + ' ' + x.w + ' — ' + d.why.join(', '));
        if (tokenize(x.w).join('|') !== x.t.join('|')) v.push(c.id + ' ' + x.w + ' — 조각이 규칙과 다름');
        if ((x.build !== false) !== buildable(x.w, c.id)) v.push(c.id + ' ' + x.w + ' — 조립 표시가 규칙과 다름');
        if (x.s && (x.s.length !== x.t.length)) v.push(c.id + ' ' + x.w + ' — 소리 열쇠 수가 다름');
        if (T && T.PHONEMES) sounds(x).forEach(function (k) { if (!T.PHONEMES[k]) v.push(c.id + ' ' + x.w + ' — 소리 ' + k + ' 를 낼 수 없음'); });
      });
      if (own(c.id).length < 4) v.push(c.id + ' — 제 단어가 넷보다 적음');
      if (own(c.id).filter(function (x) { return buildable(x.w, c.id); }).length < 3) v.push(c.id + ' — 조립할 수 있는 단어가 셋보다 적음');
      if (!units(c.id).length) v.push(c.id + ' — 연습할 소리가 없음');
      pairs(c.id).forEach(function (p) { if (!decodable(p.from.w, c.id).ok || !decodable(p.to.w, c.id).ok) v.push(c.id + ' 짝 ' + p.from.w + '→' + p.to.w + ' — 안 배운 소리'); });
    });
    return v;
  }

  /* 소리 공방 구역 12개를 구역 표(PLAY_ZONES)에 올린다 — 칸 하나 = 구역 하나, 무대는 하나 */
  function zones() {
    var Z = g.PLAY_ZONES; if (!Z || Z._phonics) return;
    Z._phonics = true; Z.stages = Z.stages || {}; Z.stages[STAGE.id] = STAGE;
    D.cells.forEach(function (c) {
      Z.zones.push({
        id: c.id, world: 'lv2', slug: 'p' + c.n, stage: STAGE.id, kind: 'phonics', decorKey: STAGE.id,
        name: STAGE.name, cellName: c.label, emoji: STAGE.emoji, color: '#4C6EF5', page: STAGE.page + '?cell=' + c.id,
        words: own(c.id).map(function (x) { return { w: x.w, ko: x.ko || '', pic: x.pic || '', t: x.t, s: x.s, build: x.build !== false, role: x.role }; }),
        confuse: [], games: GAMES.slice(), decor: DECOR,
        space: { kind: 'machine', label: '소리 기계' }, part: { id: 'goggles', name: '보안경', when: 'firstFruit' }
      });
    });
  }

  /* 구역 표에 올라간 소리 공방 구역들 */
  function stageZones() { var Z = g.PLAY_ZONES; return Z ? Z.zones.filter(function (z) { return z.stage === STAGE.id; }) : []; }
  /* 지금 놀 수 있는 마지막 칸의 차례 — 첫 칸 + 앞 칸이 열림 조건(특별 손님 + 단어 ¾ 이 꽃)을 채운 만큼 */
  function openIndex(seed) {
    var zs = stageZones(), k = 0;
    for (var i = 0; i < zs.length - 1; i++) { if (seed && seed.canClear(zs[i].id, zs[i].words.map(function (x) { return x.w; }))) k = i + 1; else break; }
    return k;
  }
  /* 내 공간 「소리 기계」 — 칸마다 칩 하나. 특별 손님을 넘으면 불이 들어오고(on), 단어 ¾ 이 꽃이면 금빛(gold). 아직 안 열린 칸은 안개(lock) */
  function machine(el, seed, curId, onTap) {
    if (!el) return;
    var zs = stageZones(), open = openIndex(seed);
    el.innerHTML = '';
    zs.forEach(function (z, i) {
      var c = cell(z.id), u = units(z.id), label = u.slice(0, 2).join('·') + (u.length > 2 ? '…' : '');
      var gold = !!seed && seed.canClear(z.id, z.words.map(function (x) { return x.w; })), on = !!seed && seed.bossDone(z.id), lock = i > open;
      var b = g.document.createElement('button'); b.type = 'button';
      b.className = 'mc' + (gold ? ' gold' : on ? ' on' : '') + (lock ? ' lock' : '') + (z.id === curId ? ' cur' : '');
      b.setAttribute('data-cell', z.id); b.title = c ? c.name : '';
      b.innerHTML = lock ? '☁️' : label;
      if (onTap) b.onclick = function () { onTap(z, lock); };
      el.appendChild(b);
    });
  }

  g.PlayPhonics = { STAGE: STAGE, stageZones: stageZones, openIndex: openIndex, machine: machine, TEAMS: TEAMS, data: D, tokenize: tokenize, cell: cell, index: index, cells: function () { return D.cells; },
    decodable: decodable, buildable: buildable, own: own, contrast: contrast, pool: pool, sounds: sounds, units: units, distract: distract, pairs: pairs,
    say: say, html: html, chip: chip, validate: validate, zones: zones };
  zones();
})(window);
