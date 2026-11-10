/* ============================================================
 * 영어 놀이터 — 소리 읽기 도구(PlayPhonics) : 조각 가르기 · 「배운 소리로만 읽히는가」 검증 · 소리 내기 · 소리 공방 구역 만들기
 *   재료는 생성 파일 둘 — content/phonics.js(Lv2 소리 공방 12칸) · content/phonics-lv1.js(Lv1 소리 숲 8칸). 여기는 규칙만.
 *   칸 찾기·앞 칸 단어(pool)·검사는 재료 묶음마다 따로 — 소리 숲 칸이 소리 공방 단어를 끌어오지 않는다.
 *   알파벳 칸(lv1-03)은 단어 없이 소리만 — 하루 한 묶음(setBundle). 그날 연습할 소리 = 그 묶음.
 *   그 칸까지 배운 것 = Lv1 낱글자 26 + 그 칸의 known(글자 둘 한 소리·매직 e·모음짝) + knownBlends(자음 묶음).
 *   decodable(w, cell) : 아직 안 배운 「글자 둘 한 소리」가 하나라도 있으면 그 칸에서 못 쓴다
 *   buildable(w, cell) : 조각을 맞춰 조립할 수 있나(이어진 낱자음은 배운 묶음이어야 하고, 매직 e 앞의 c 는 뺀다)
 *   validate()         : 재료 전체를 훑어 위반을 모은다 — tests/content-validation.js · 하네스가 0 을 확인한다
 * ============================================================ */
(function (g) {
  'use strict';
  var D = g.PLAY_PHONICS || { cells: [], letters: [] };
  var L1 = g.PLAY_PHONICS_LV1 || null;
  var TEAMS = ['sh', 'ch', 'th', 'ck', 'ai', 'ay', 'ee', 'ea', 'oa', 'ow'];          /* 글자 둘, 소리 하나(전체 목록 — 배웠는지는 칸마다 다르다) */
  var VOW = 'aeiou';
  var STAGE = { id: 'sound-shop', name: '소리 공방', icon: 'wrench', page: 'zone/sound-shop.html' };
  var GAMES = ['read-aloud', 'sound-monster', 'sound-jump', 'sound-bridge', 'sound-train', 'sound-swap'];
  var FOREST = { id: 'sound-forest', name: '소리 숲', icon: 'tree', page: 'zone/sound-forest.html', world: 'lv1' };
  var FOREST_DECOR = [
    { id: 'leaf', icon: 'leaf', name: '나뭇잎' }, { id: 'nest', icon: 'nest', name: '새 둥지' }, { id: 'flower', icon: 'flower', name: '꽃' }, { id: 'lamp', icon: 'lamp', name: '등불' },
    { id: 'balloon', icon: 'balloon', name: '풍선' }, { id: 'bell', icon: 'bell', name: '종' }, { id: 'sparkle', icon: 'sparkle', name: '반딧불' }, { id: 'plant', icon: 'plant', name: '새싹 화분' }
  ];
  var DECOR = [
    { id: 'gear', icon: 'gear', name: '톱니' }, { id: 'bolt', icon: 'bolt', name: '나사' }, { id: 'radio', icon: 'radio', name: '라디오' }, { id: 'magnet', icon: 'magnet', name: '자석' },
    { id: 'bulb', icon: 'bulb', name: '전구' }, { id: 'dial', icon: 'dial', name: '조절판' }, { id: 'torch', icon: 'torch', name: '손전등' }, { id: 'bell', icon: 'bell', name: '종' }
  ];

  function scan(s) { var out = [], i = 0; while (i < s.length) { var two = s.slice(i, i + 2); if (TEAMS.indexOf(two) >= 0) { out.push(two); i += 2; } else { out.push(s.charAt(i)); i++; } } return out; }
  /* 매직 e(모음 + 자음 하나 + 끝 e) → 글자 둘 한 소리 → 낱글자 */
  function tokenize(w) {
    w = String(w || '').toLowerCase();
    var m = /^(.*?)([aiou])([b-df-hj-np-tv-z])e$/.exec(w);
    return m ? scan(m[1]).concat([m[2] + '_e', m[3]]) : scan(w);
  }
  /* 재료 묶음 — Lv2 소리 공방 · Lv1 소리 숲(있으면). min = 칸에 있어야 하는 제 단어 수 */
  STAGE.world = 'lv2';
  var SETS = [{ D: D, stage: STAGE, palette: 'sound', decor: DECOR, min: 4, host: 'max', part: { id: 'goggles', name: '보안경', when: 'firstFruit' }, space: { kind: 'machine', label: '소리 기계' } }];
  if (L1) SETS.unshift({ D: L1, stage: FOREST, palette: 'forest', decor: FOREST_DECOR, min: 3, host: 'mina', part: { id: 'leafhat', name: '나뭇잎 모자', when: 'firstFruit' }, space: { kind: 'tree', label: '소리 나무' } });
  function setOf(id) { for (var k = 0; k < SETS.length; k++) for (var i = 0; i < SETS[k].D.cells.length; i++) if (SETS[k].D.cells[i].id === id) return SETS[k]; return null; }
  function cell(id) { var S = setOf(id); if (!S) return null; for (var i = 0; i < S.D.cells.length; i++) if (S.D.cells[i].id === id) return S.D.cells[i]; return null; }
  function index(id) { var S = setOf(id); if (!S) return -1; for (var i = 0; i < S.D.cells.length; i++) if (S.D.cells[i].id === id) return i; return -1; }
  /* 알파벳 칸 — 오늘의 묶음(무대 진행이 정해 준다) */
  var BUNDLE = {};
  function setBundle(id, k) { var c = cell(id); if (c && c.bundles) BUNDLE[id] = Math.max(0, Math.min(c.bundles.length - 1, k | 0)); return BUNDLE[id]; }
  function bundle(id) { return BUNDLE[id] | 0; }
  function learned(id) { var c = cell(id); if (!c || !c.bundles) return []; var out = []; for (var i = 0; i <= bundle(id); i++) out = out.concat(c.bundles[i]); return out; }
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
    var out = [], seen = {}, k = index(id), S = setOf(id);
    if (!S) return out;
    for (var i = 0; i <= k; i++) S.D.cells[i].words.forEach(function (x) { if (!seen[x.w]) { seen[x.w] = 1; out.push(x); } });
    return out;
  }
  function sounds(x) { return (x && (x.s || x.t)) || []; }
  /* 그 칸에서 연습할 소리 칩 — 새로 배운 것. 복습 칸(#16)은 매직 e 넷 */
  function units(id) {
    var c = cell(id); if (!c) return [];
    if (c.bundles) return c.bundles[bundle(id)].slice();      /* 알파벳 칸 — 오늘 묶음 */
    var u = c.units.concat(c.blends);
    if (!u.length) u = c.known.filter(function (k) { return /_e$/.test(k); });
    return u;
  }
  /* 헷갈림 보기 — 같은 종류(모음짝끼리·자음 묶음끼리)에서, 소리가 같은 것(ai↔ay↔a_e)은 빼고 */
  function family(u) { return /_e$/.test(u) || isVowel(u) ? 'v' : 'c'; }
  function sameSound(a, b) { var T = g.KTTS; if (a === b) return true; if (T && T.sameAs) return T.sameAs(a).indexOf(b) >= 0; return false; }
  function distract(u, id, n) {
    var c = cell(id), all = c ? (c.bundles ? learned(id) : c.known.concat(c.knownBlends)) : [], fam = family(u);     /* 알파벳 칸은 지금까지 익힌 글자 중에서 */
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
    var v = [];
    SETS.forEach(function (S) { validateSet(S, v); });
    return v;
  }
  function validateSet(S, v) {
    var T = g.KTTS, seen = {};
    S.D.cells.forEach(function (c) {
      c.units.concat(c.blends).forEach(function (u) {
        if (seen[u] && u.length > 1 && c.units.indexOf(u) >= 0) v.push(c.id + ' 소리 ' + u + ' — 앞 칸에서 이미 배움');     /* 낱글자는 칸마다 다시 익힌다 */
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
      if (c.bundles) {                                                   /* 알파벳 칸 — 단어 0, 묶음이 26소리를 한 번씩 */
        var all = [].concat.apply([], c.bundles);
        if (all.length !== 26 || new Set(all).size !== 26) v.push(c.id + ' — 알파벳 묶음이 26소리를 한 번씩 덮지 않음');
        if (c.words.length) v.push(c.id + ' — 알파벳 칸에 단어가 있음');
        if (c.bundles[0].join('') !== 'aeiou') v.push(c.id + ' — 첫 묶음이 모음 다섯이 아님(펼침 3-1)');
        if (T && T.PHONEMES) all.forEach(function (k) { if (!T.PHONEMES[k]) v.push(c.id + ' 소리 ' + k + ' 를 낼 수 없음'); });
        return;
      }
      if (own(c.id).length < S.min) v.push(c.id + ' — 제 단어가 ' + (S.min === 4 ? '넷' : '셋') + '보다 적음');
      if (own(c.id).filter(function (x) { return buildable(x.w, c.id); }).length < 3) v.push(c.id + ' — 조립할 수 있는 단어가 셋보다 적음');
      if (!units(c.id).length) v.push(c.id + ' — 연습할 소리가 없음');
      pairs(c.id).forEach(function (p) { if (!decodable(p.from.w, c.id).ok || !decodable(p.to.w, c.id).ok) v.push(c.id + ' 짝 ' + p.from.w + '→' + p.to.w + ' — 안 배운 소리'); });
    });
  }

  /* 소리 공방 구역 12개를 구역 표(PLAY_ZONES)에 올린다 — 칸 하나 = 구역 하나, 무대는 하나 */
  function zones() {
    var Z = g.PLAY_ZONES; if (!Z || Z._phonics) return;
    Z._phonics = true; Z.stages = Z.stages || {};
    SETS.slice().reverse().forEach(function (S) {                       /* 소리 공방을 먼저(예전 차례 그대로), 소리 숲은 그 뒤 */
      Z.stages[S.stage.id] = S.stage;
      S.D.cells.forEach(function (c) {
        var z = {
          id: c.id, world: S.stage.world, slug: 'p' + c.n, stage: S.stage.id, kind: 'phonics', decorKey: S.stage.id,
          name: S.stage.name, cellName: c.label, icon: S.stage.icon, palette: S.palette, page: S.stage.page + '?cell=' + c.id,
          words: own(c.id).map(function (x) { return { w: x.w, ko: x.ko || '', pic: g.PlayArt && g.PlayArt.has(x.w) ? g.PlayArt.html(x.w) : '', t: x.t, s: x.s, build: x.build !== false, role: x.role }; }),     /* 그림은 그린 그림이 있을 때만(없으면 글자로 읽게) */
          confuse: [], games: GAMES.slice(), decor: S.decor, host: S.host,
          space: S.space, part: S.part
        };
        if (c.bundles) { z.letters = true; z.bundles = c.bundles; z.fixedGames = ['sound-monster', 'sound-jump']; }     /* 알파벳 칸 — 묶음마다 소리 몬스터·소리 점프(W06) */
        Z.zones.push(z);
      });
    });
  }

  /* 구역 표에 올라간 소리 공방 구역들 */
  function stageZones(stageId) { var Z = g.PLAY_ZONES, sid = stageId || STAGE.id; return Z ? Z.zones.filter(function (z) { return z.stage === sid; }) : []; }
  /* 지금 놀 수 있는 마지막 칸의 차례 — 첫 칸 + 앞 칸이 열림 조건(특별 손님 + 단어 ¾ 이 꽃)을 채운 만큼 */
  function openIndex(seed, stageId) { var Z = g.PLAY_ZONES; return Z && Z.openIndex ? Z.openIndex(stageId || STAGE.id, seed) : 0; }     /* 규칙은 구역 표 한 곳(data/zones.js) */
  /* 내 공간 「소리 기계」 — 칸마다 칩 하나. 특별 손님을 넘으면 불이 들어오고(on), 단어 ¾ 이 꽃이면 금빛(gold). 아직 안 열린 칸은 안개(lock) */
  function machine(el, seed, curId, onTap, stageId) {
    if (!el) return;
    var zs = stageZones(stageId), open = openIndex(seed, stageId);
    el.innerHTML = '';
    zs.forEach(function (z, i) {
      var c = cell(z.id), u = c && c.bundles ? ['a', 'b', 'c'] : units(z.id), label = u.slice(0, 2).join('·') + (u.length > 2 ? '…' : '');
      var gold = !!seed && seed.canClear(z.id, z.words.map(function (x) { return x.w; })), on = !!seed && seed.bossDone(z.id), lock = i > open;
      var b = g.document.createElement('button'); b.type = 'button';
      b.className = 'mc' + (gold ? ' gold' : on ? ' on' : '') + (lock ? ' lock' : '') + (z.id === curId ? ' cur' : '');
      b.setAttribute('data-cell', z.id); b.title = c ? c.name : '';
      b.innerHTML = lock ? g.PlayIcon.html('cloud') : label;
      if (onTap) b.onclick = function () { onTap(z, lock); };
      el.appendChild(b);
    });
  }

  g.PlayPhonics = { STAGE: STAGE, FOREST: FOREST, sets: function () { return SETS; }, setOf: setOf, setBundle: setBundle, bundle: bundle, learned: learned,
    allCells: function () { return [].concat.apply([], SETS.map(function (S) { return S.D.cells; })); }, stageZones: stageZones, openIndex: openIndex, machine: machine, TEAMS: TEAMS, data: D, tokenize: tokenize, cell: cell, index: index, cells: function () { return D.cells; },
    decodable: decodable, buildable: buildable, own: own, contrast: contrast, pool: pool, sounds: sounds, units: units, distract: distract, pairs: pairs,
    say: say, html: html, chip: chip, validate: validate, zones: zones };
  zones();
})(window);
