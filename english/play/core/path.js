/* ============================================================
 * 영어 놀이터 — 한 해 길(PlayPath) (한 해 길 v1 §2·§8·§9 · W13)
 *   52걸음 = 52주. 차례·낱말·문장·챈트·이야기는 전부 data/path.js(생성 파일 — 원천 handoff path_v1.js)에서 읽는다.
 *   걸음 하나 = 무대 진행(core/stage.js)이 그대로 돌릴 수 있는 「걸음 구역」 한 칸으로 꺼낸다(PlayPath.zone) —
 *     지은 무대의 놀이·그림·판정을 그대로 쓰고, 재료만 이 길 것으로(한 해 길 §9). 그림은 지은 구역·그린 그림에서 찾고 없으면 글자 카드.
 *   문(한 해 길 §2 — 구역 머리의 「문」): 걸음 차례가 문이다. 앞 걸음이 끝나야 다음 걸음.
 *     A 글자 숲   = 두 글자가 새싹 이상 + 입말 낱말 ¾ 이 씨앗 이상 + 특별 손님
 *     그 밖       = 그 걸음 낱말(읽기 낱말 — 없으면 통말·문장) ¾ 이 새싹 이상 + 특별 손님
 *     잔치·섞어 읽기처럼 새 낱말이 없는 걸음 = 특별 손님
 *   걸음이 끝나면 covers 의 사다리 칸을 점등한다(KProgress.light).
 *   세 날(만나는 날·읽는 날·쓰는 날)의 놀이 차례는 자료의 days — 조립은 core/assemble.js 의 day().
 * ============================================================ */
(function (g) {
  'use strict';
  var CONF = { gate: 0.75 };       /* 문 — 낱말 가운데 이만큼(¾) */
  var D = g.PLAY_PATH || { steps: [], parts: {}, games: {} };
  var BY = {}; D.steps.forEach(function (s, i) { BY[s.id] = i; });
  /* 무대의 겉모습(지은 무대는 그 무대 것 · 아직 안 지은 무대는 기본) — 방·빛·배치는 입체 판(W15~)이 자료의 layout 으로 */
  var LOOK = {
    'sound-forest': { icon: 'tree', palette: 'forest', host: 'max', where: '숲' },
    'home':         { icon: 'home', palette: 'home', host: 'mina', where: '집' },
    'animal-farm':  { icon: 'barn', palette: 'farm', host: 'ben', wear: 'scarf', where: '농장' },
    'bookshop':     { icon: 'book', palette: 'book', host: 'mina', where: '책방' },
    'lunch-shop':   { icon: 'shop', palette: 'shop', host: 'sam', wear: 'apron', where: '가게' },
    'classroom':    { icon: 'school', palette: 'school', host: 'mina', wear: 'lanyard', where: '교실' },
    'playground':   { icon: 'body', palette: 'field', host: 'ben', wear: 'whistle', where: '운동장' },
    'vending':      { icon: 'vending', palette: 'vend', host: 'max', where: '자판기' },
    'mirror':       { icon: 'mirror', palette: 'mirror', host: 'amy', where: '거울 앞' },
    'sound-shop':   { icon: 'wrench', palette: 'sound', host: 'max', where: '공방' }
  };
  var DEF = { icon: 'map', palette: 'shop', host: 'sam', where: '마을' };
  var DECOR = [{ id: 'leaf', icon: 'leaf', name: '나뭇잎' }, { id: 'flower', icon: 'flower', name: '꽃' }, { id: 'lamp', icon: 'lamp', name: '등불' }, { id: 'balloon', icon: 'balloon', name: '풍선' }, { id: 'flag', icon: 'flag', name: '깃발' }, { id: 'bell', icon: 'bell', name: '종' }];

  function step(id) { return BY[id] != null ? D.steps[BY[id]] : null; }
  /* 지은 구역에서 같은 낱말의 그림·뜻을 찾는다 */
  function found(w) {
    var Z = g.PLAY_ZONES; if (!Z) return null;
    for (var i = 0; i < Z.zones.length; i++) { var ws = Z.zones[i].words || []; for (var j = 0; j < ws.length; j++) if (ws[j].w === w) return ws[j]; }
    return null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function item(w, path, extra) {
    var A = g.PlayArt, f = found(w), x = { w: w, path: path, ko: (f && f.ko) || '' };
    if (f && f.scene) x.scene = f.scene;
    x.drawn = !!(f && f.scene) || !!(A && A.has((f && f.art) || w));
    x.pic = f && f.pic && (f.scene || x.drawn) ? f.pic : A && A.has(w) ? A.html(w)
      : '<span class="art-word' + (path === 'oral' ? ' oral' : '') + '">' + (path === 'oral' ? '<b>' + esc(w.charAt(0)) + '</b>' + esc(w.slice(1)) : esc(w)) + '</span>';     /* 그림이 아직 없으면 글자 카드(입말 낱말은 첫 글자만 진하게) */
    if (path === 'sight') x.sight = true;
    if (extra) Object.keys(extra).forEach(function (k) { x[k] = extra[k]; });
    return x;
  }
  var ZC = {};
  /* 걸음 → 무대 진행이 돌리는 구역 한 칸 */
  function zone(id) {
    if (ZC[id]) return ZC[id];
    var s = step(id); if (!s) return null;
    var L = LOOK[s.stage] || DEF, P = D.parts[s.part] || {}, words = [], seen = {};
    var add = function (x) { var k = x.path + ':' + x.w; if (!seen[k]) { seen[k] = 1; words.push(x); } };
    var half = s.letters.length ? s.oral.length / s.letters.length : 0;
    s.oral.forEach(function (w, i) { add(item(w, 'oral', { letter: s.letters.length ? s.letters[Math.floor(i / half)] : w.charAt(0) })); });
    s.read.forEach(function (w) { add(item(w, 'decode')); });
    s.whole.concat(s.sight).forEach(function (w) { add(item(w, 'sight')); });
    s.sentences.forEach(function (w) { add(item(w, s.kind === 'text' ? 'text' : 'sentence')); });
    var games = []; ['meet', 'read', 'write'].forEach(function (k) { (s.days[k] || []).forEach(function (gid) { if (games.indexOf(gid) < 0) games.push(gid); }); });
    var z = ZC[id] = {
      id: s.id, step: true, part: s.part, n: s.n, world: P.world || 'lv1', stage: s.stage, kind: s.kind === 'text' ? 'story' : 'step', stepKind: s.kind,      /* 지문 걸음은 그림책의 문장 쪽으로(읽으면 장면이 움직인다) */
      name: s.room, cellName: s.title, icon: L.icon, palette: L.palette, host: L.host, wear: L.wear || '', where: L.where, light: s.light,
      page: 'zone/step.html?step=' + s.id,
      words: words, letterItems: s.letters.map(function (l) { return { w: l, path: 'letter' }; }), letters: s.letters.length > 0, more: s.more.map(function (w) { return item(w, 'decode', { role: 'apply' }); }),
      frames: s.frames, chantLines: s.chant, story: s.story, life: s.life, ink: s.ink, twist: s.twist, chains: s.chains, family: s.family,
      notes: s.notes, guestAsk: s.guest, favor: s.favor,
      confuse: [], games: games, days: s.days, covers: s.covers,
      decorKey: 'path:' + s.stage, decor: DECOR, space: null, part2: null
    };
    return z;
  }
  /* 씨앗 열쇠 → 그 낱말(길 전체에서 처음 나온 자리) — 정원이 지난 걸음 낱말을 꺼낼 때 */
  var IDX = null;
  function itemOf(key) {
    if (!IDX) { IDX = {}; D.steps.forEach(function (s) { var z = zone(s.id); z.words.concat(z.letterItems).forEach(function (x) { var k = g.PlaySeed ? g.PlaySeed.key(x.w, x.path) : x.w; if (!IDX[k]) IDX[k] = { item: x, step: s.id }; }); }); }
    return IDX[key] || null;
  }

  /* 문 — { ok, letters:{have,need}, words:{have,need}, guest } */
  function gate(id, seed) {
    var z = zone(id), s = step(id); seed = seed || g.PlaySeed;
    if (!z || !seed) return { ok: false, letters: { have: 0, need: 0 }, words: { have: 0, need: 0 }, guest: false };
    var all = seed.all(), st = function (x) { var e = all[seed.key(x.w, x.path)]; return e ? e.stage : -1; };
    var guest = seed.bossDone(id), lt = { have: 0, need: 0 }, wd = { have: 0, need: 0 };
    if (s.part === 'A') {
      lt.need = z.letterItems.length; lt.have = z.letterItems.filter(function (x) { return st(x) >= 1; }).length;
      var oral = z.words.filter(function (x) { return x.path === 'oral'; });
      wd.need = Math.ceil(oral.length * CONF.gate); wd.have = oral.filter(function (x) { return st(x) >= 0; }).length;
    } else {
      var main = z.words.filter(function (x) { return x.path === 'decode'; });
      if (!main.length) main = z.words.filter(function (x) { return x.path !== 'oral'; });
      if (s.kind === 'mix' || s.kind === 'festival') main = [];
      wd.need = Math.ceil(main.length * CONF.gate); wd.have = main.filter(function (x) { return st(x) >= 1; }).length;
    }
    return { ok: guest && lt.have >= lt.need && wd.have >= wd.need, letters: lt, words: wd, guest: guest };
  }
  function done(id, seed) { return gate(id, seed).ok; }
  function open(id, seed) { var i = BY[id]; return i === 0 || (i > 0 && done(D.steps[i - 1].id, seed)); }
  function current(seed) { for (var i = 0; i < D.steps.length; i++) if (!done(D.steps[i].id, seed)) return D.steps[i]; return null; }
  /* 걸음이 끝났으면 덮는 사다리 칸을 점등 — 몇 번 불러도 같다 */
  function finish(id, seed) {
    var s = step(id); if (!s || !done(id, seed)) return false;
    if (g.KProgress && g.KProgress.light) s.covers.forEach(function (c) { try { g.KProgress.light(c); } catch (e) {} });
    return true;
  }
  /* 길 자료 안의 낱말 전부(소문자) — 「길 자료 밖 낱말 0」 검사 */
  function vocab() {
    var out = {}; var put = function (w) { String(w).toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean).forEach(function (t) { out[t] = 1; }); };
    D.steps.forEach(function (s) { [s.letters, s.oral, s.read, s.more, s.whole, s.sight, s.sentences, s.frames, s.chant].forEach(function (a) { a.forEach(put); }); s.chains.forEach(function (c) { c.forEach(put); }); });
    return out;
  }

  g.PlayPath = { CONF: CONF, LOOK: LOOK, data: D, steps: function () { return D.steps; }, parts: function () { return D.parts; }, step: step, index: function (id) { return BY[id] != null ? BY[id] : -1; },
    zone: zone, item: itemOf, gate: gate, done: done, open: open, current: current, finish: finish, vocab: vocab,
    look: function (stage) { return LOOK[stage] || DEF; } };
})(window);
