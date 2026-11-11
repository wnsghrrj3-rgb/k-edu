/* ============================================================
 * 영어 놀이터 — 구역 조립기(PlayAssemble) (게임설계 v1 §5)
 *   하루 세트 = (돌볼 씨앗이 있으면) 정원 + 사건 1 + 미니게임 3~4 + 특별 손님 + 마무리(무대의 작은 변화 하나).
 *   · 미니게임은 채널이 겹치지 않게 고른다(말 · 귀 · 손 · 몸 — 카메라가 없는 기기에선 몸 놀이를 눌러서 하므로 귀 쪽으로 친다).
 *   · 사건은 그날 미니게임 하나의 포장이다(대사·등장·배경만 바뀜) — 사건이 정한 놀이가 그날 첫 놀이.
 *   · 어제와 다르게: 사건은 어제 것이 아니고, 놀이는 적어도 둘이 바뀐다(가장 오래 안 한 것부터).
 *   · 조건 칸에 못 미친 놀이는 빠진다(놀이의 need — 그 칸까지 배운 것으로만 논다).
 *   · 씨앗이 아직 없는 단어가 있으면 말로 받는 놀이(주문 받기)를 먼저 넣는다 — 「둘은 바뀐다」를 해치지 않는 한에서.
 *   같은 날 다시 열면 같은 세트. 무엇을 할지는 화면이 아니라 여기(자료)에서 정해진다.
 *   · 알파벳 칸(구역 bundles — Lv1 #3)은 한 칸 = 여러 날: 오늘의 묶음 = 그 칸에서 지낸 날 수(마지막 묶음에서 멈춤).
 *     놀이는 구역 fixedGames(소리 몬스터·소리 점프)만, 특별 손님은 마지막 묶음 날부터 — 그때 칸이 점등된다(W06).
 *
 *   PlayAssemble.plan({ zone, cell, cam, unplanted, due, day }) → { day, event, eventGame, set[], minis[], reused, bundle? }
 *   PlayAssemble.targets(id, zone, { unplanted[], review[] }) → 그 놀이의 대상 단어들
 *   PlayAssemble.finish(cell, zone) → 오늘 무대에 생긴 것(장식 하나) 또는 null
 *   저장: localStorage 'kedu-en-play-stage'(kedu_scope 규칙 — 동의 전에는 이 화면 동안만. 그때는 날짜로 돌려 고른다)
 *
 *   하루 조립 v2 — PlayAssemble.day(o) (설계 v2 §1-2·§6 · 한 해 길 v1 §5 · W13) : 한 해 길의 걸음(zone.step)을 짠다.
 *     · 세 날: 만나는 날(meet) → 읽는 날(read) → 쓰는 날(write). 그 걸음에서 온 날 수로 정한다(요일 고정 0).
 *       둘째로 온 날이 첫날에서 사흘 넘게 지났으면(주 2회) 읽는 날과 쓰는 날이 한 날로 합쳐진다(both). 그 뒤로는 읽는 날·쓰는 날을 번갈아.
 *     · 놀이 차례는 길 자료의 days 그대로(구역마다 다르다) — 아직 안 지은 놀이·그 걸음에 안 맞는 놀이는 건너뛴다.
 *     · 하루에 네 힘(L·S·R·W)이 모두 한 번 이상 — 빠진 힘은 그 걸음에 맞는 놀이로 채운다(쓰기 = 소리 상자).
 *     · 약한 힘 보충 — 최근 증거 30건에서 가장 낮은 힘이 다른 힘 평균보다 15%p 넘게 낮으면 앞쪽 놀이 하나를 그 힘 놀이로 바꾼다.
 *     · 물 주기는 오늘 차례가 있을 때만 맨 앞 · 특별 손님은 쓰는 날 맨 뒤 · 같은 날 = 같은 세트 · 어제와 똑같은 조합 0.
 *     · 하루 상한(넘치면 다음 날로, 손해 0): 새싹 차례 6 · 꽃 차례 4 · 열매 차례(손 쓰기) 글자 12자 — PlayAssemble.caps(due) 가 자른다.
 *   PlayAssemble.day({ zone, cam, mic, due, day, powers }) → { day, kind, event, eventGame, minis[], set[], reused, boost, filled[] }
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 ── */
  var CONF = {
    minGames: 3, maxGames: 4,     /* 하루 미니게임 수 */
    changeAtLeast: 2,             /* 어제와 달라야 하는 놀이 수 */
    keepDays: 14,                 /* 기억해 두는 날 수 */
    order: ['say', 'body', 'ear', 'hand', 'sound', 'make'],   /* 하루 안에서 놀이가 놓이는 차례(사건 놀이는 맨 앞) */
    /* v2 — 하루 상한·약한 힘 보충(설계 v2 §3-5·§6 · 한 해 길 §2) */
    cap: { sprout: 6, flower: 4, fruitLetters: 12 },
    weakGap: 0.15, window: 30, weakMin: 4,           /* 15%p · 최근 30건 · 힘마다 이만큼은 쌓여야 견준다 */
    mergeGap: 3,                                      /* 둘째 날이 첫날에서 이만큼(일) 지났으면 읽는 날 + 쓰는 날 */
    maxDay: 7,                                        /* 하루 놀이 수 상한(물 주기·특별 손님 포함) */
    perGame: { 'write-job': 3, 'sound-box': 3, 'word-train': 8, 'first-basket': 6, 'order-shop': 8, plates: 8, pop: 6, 'catch': 6, lean: 6, belt: 6, 'read-aloud': 6, 'sound-bridge': 4, 'sound-train': 4, raccoon: 5, 'picture-book': 6, 'magic-call': 6, dance: 6 }   /* 놀이별 대상 수(없으면 구역 단어 전부) */
  };
  var KEY = 'kedu-en-play-stage';
  /* 놀이의 첫 채널 → 겹침을 따지는 묶음 */
  var GROUP = { say: 'say', talk: 'say', ear: 'ear', body: 'body', hand: 'hand', read: 'hand', make: 'make', sound: 'sound' };   /* make = 창작(만들기) */

  function load() { try { return JSON.parse(g.localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(d) { try { g.localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function dayStr(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dayNo(s) { return Math.round(new Date(s + 'T00:00:00').getTime() / 86400000); }
  function stateOf(cell) { var d = load(), s = d[cell] || {}; return { days: s.days || [], decor: s.decor || [], decorDay: s.decorDay || '' }; }
  function put(cell, st) { var d = load(); d[cell] = st; save(d); }

  /* 'lv2-02' → { lv: 2, n: 2 } */
  function cellOf(id) { var m = /^lv(\d+)-(\d+)$/.exec(String(id || '')); return m ? { lv: +m[1], n: +m[2] } : { lv: 0, n: 0 }; }
  /* 그 칸에서 이 놀이를 켤 수 있나 — need = { lv1: 5 } 는 「Lv1 다섯째 칸부터」 */
  function allowed(def, cell) {
    var c = cellOf(cell), need = (def && def.need) || {}, ok = true;
    Object.keys(need).forEach(function (k) { var lv = +k.replace('lv', ''); if (c.lv < lv || (c.lv === lv && c.n < need[k])) ok = false; });
    return ok;
  }
  function groupOf(def, cam) { var gr = GROUP[(def.channels || [])[0]] || 'hand'; return gr === 'body' && !cam ? 'ear' : gr; }
  /* 마지막으로 한 날이 며칠 전인가(한 적 없으면 아주 큼) */
  function ago(days, today, pick) {
    for (var i = days.length - 1; i >= 0; i--) if (pick(days[i])) return dayNo(today) - dayNo(days[i].day);
    return 9999;
  }
  /* 오래 안 한 것부터. 똑같으면 자료에 적힌 차례(첫날은 맨 앞 것).
     기록이 기기에 남지 않는 자리(동의 전 — kedu_scope 가 화면 동안만 기억)에서는 그 차례를 날짜만큼 돌려, 날마다 달라지게 한다 */
  var ROTATE = null;
  function rotating() { return ROTATE != null ? ROTATE : !!(g.__keduScope && g.__keduScope.persist === false); }
  function oldest(list, age, today) {
    var rot = rotating() && list.length ? ((dayNo(today) % list.length) + list.length) % list.length : 0;
    return list.map(function (x, i) { return { x: x, s: age(x), i: (i - rot + list.length) % list.length }; })
      .sort(function (a, b) { return b.s - a.s || a.i - b.i; }).map(function (o) { return o.x; });
  }

  function plan(o) {
    o = o || {};
    var zone = o.zone || {}, cell = o.cell || zone.id, today = o.day || dayStr(), G = o.games || g.PlayGame;
    var st = o.state || stateOf(cell), days = st.days.filter(function (d) { return d.day < today; }), cam = !!o.cam;
    ROTATE = o.rotate != null ? !!o.rotate : null;
    var same = st.days.filter(function (d) { return d.day === today; })[0];
    var garden = (o.due | 0) > 0 && G.get('garden') ? ['garden'] : [], guest = G.get('special-guest') ? ['special-guest'] : [];
    /* 알파벳 칸 — 오늘의 묶음(지낸 날 수). 마지막 묶음 전에는 특별 손님이 오지 않는다 */
    var bundle = zone.bundles ? Math.min(days.length, zone.bundles.length - 1) : null;
    if (bundle != null && bundle < zone.bundles.length - 1) guest = [];
    var withB = function (r) { if (bundle != null) r.bundle = bundle; return r; };
    if (same && !o.event && same.games.every(function (id) { return !!G.get(id); }))            /* 같은 날 다시 = 같은 세트 */
      return withB({ day: today, event: same.event || null, eventGame: same.eventGame || null, minis: same.games.slice(), set: garden.concat(same.games, guest), reused: true });
    var yest = days.length ? days[days.length - 1] : null, yGames = yest ? yest.games : [];

    /* 켤 수 있는 놀이 */
    var can = function (id) { var d = G.get(id); return !!d && !d.draft && allowed(d, cell) && !(d.cam && !cam && d.camOnly) && (!d.fits || d.fits(zone)); };
    var cands = (zone.games || []).filter(can);
    /* 사건 후보 — 그 놀이를 켤 수 있는 것 중, 어제 것이 아니고 오래 안 한 차례로 */
    var events = (o.events || (g.PLAY_EVENTS && g.PLAY_EVENTS[zone.stage]) || []).filter(function (e) { return can(e.game); });
    var evList = [];
    if (o.event) evList = events.filter(function (e) { return e.id === o.event; });
    if (!evList.length && events.length) {
      var pool = events.filter(function (e) { return !yest || e.id !== yest.event; }); if (!pool.length) pool = events;
      evList = oldest(pool, function (e) { return ago(days, today, function (d) { return d.event === e.id; }); }, today);
    }
    /* 놀이가 정해진 칸(알파벳) — 그 놀이들만. 사건은 그 놀이를 입히는 것 중 오래 안 한 것 */
    if (zone.fixedGames) {
      var fixed = zone.fixedGames.filter(function (id) { var d = G.get(id); return !!d && !d.draft && allowed(d, cell); });
      var fev = evList.filter(function (e) { return fixed.indexOf(e.game) >= 0; })[0] || null;
      var fm = fev ? [fev.game].concat(fixed.filter(function (id) { return id !== fev.game; })) : fixed;
      var fr = withB({ day: today, event: fev ? fev.id : null, eventGame: fev ? fev.game : null, minis: fm, set: garden.concat(fm, guest), reused: false });
      if (!o.dry) { st.days = days.concat([{ day: today, event: fr.event, eventGame: fr.eventGame, games: fm }]).slice(-CONF.keepDays); put(cell, st); }
      return fr;
    }
    /* 그 사건으로 하루를 짜 본다 */
    function build(ev) {
      /* 묶음마다 하나 */
      var byGroup = {}, groups = [];
      cands.concat(ev ? [ev.game] : []).forEach(function (id) { var gr = groupOf(G.get(id), cam); if (!byGroup[gr]) { byGroup[gr] = []; groups.push(gr); } if (byGroup[gr].indexOf(id) < 0) byGroup[gr].push(id); });
      var evGroup = ev ? groupOf(G.get(ev.game), cam) : null, pickOf = {};
      groups.forEach(function (gr) {
        if (gr === evGroup) { pickOf[gr] = ev.game; return; }
        var list = byGroup[gr].filter(function (id) { return (zone.games || []).indexOf(id) >= 0; });      /* 사건 전용 놀이는 사건 날에만 */
        if (!list.length) return;
        var fresh = list.filter(function (id) { return yGames.indexOf(id) < 0; });                            /* 어제 한 것은 뒤로 */
        pickOf[gr] = oldest(fresh.length ? fresh : list, function (id) { return ago(days, today, function (d) { return d.games.indexOf(id) >= 0; }); }, today)[0];
      });
      /* 씨앗이 없는 단어가 있으면 말로 받는 놀이를 — 어제와 둘은 달라야 한다는 규칙을 지키는 한에서 */
      var diff = function () { return Object.keys(pickOf).filter(function (gr) { return yGames.indexOf(pickOf[gr]) < 0; }).length; };
      if ((o.unplanted | 0) > 0 && evGroup !== 'say' && byGroup.say) {
        var plants = byGroup.say.filter(function (id) { return G.get(id).plants && (zone.games || []).indexOf(id) >= 0; })[0];
        if (plants && pickOf.say !== plants) { var keep = pickOf.say; pickOf.say = plants; if (yest && diff() < CONF.changeAtLeast) pickOf.say = keep; }
      }
      /* 묶음이 하루치보다 많으면 — 가장 최근에 한 놀이의 묶음부터 쉰다(사건 놀이·씨앗 심는 놀이는 남긴다) */
      var extra = Object.keys(pickOf).length - CONF.maxGames;
      if (extra > 0) {
        var keepSay = (o.unplanted | 0) > 0 && pickOf.say && G.get(pickOf.say).plants;
        Object.keys(pickOf).filter(function (gr) { return gr !== evGroup && !(gr === 'say' && keepSay); })
          .map(function (gr) { return { gr: gr, a: ago(days, today, function (d) { return d.games.indexOf(pickOf[gr]) >= 0; }), i: CONF.order.indexOf(gr) }; })
          .sort(function (x, y) { return x.a - y.a || y.i - x.i; }).slice(0, extra).forEach(function (x) { delete pickOf[x.gr]; });
      }
      /* 차례·개수 */
      var order = CONF.order.filter(function (gr) { return pickOf[gr] && gr !== evGroup; });
      var list2 = (ev ? [ev.game] : []).concat(order.map(function (gr) { return pickOf[gr]; })).slice(0, CONF.maxGames);
      return { ev: ev, minis: list2, changed: list2.filter(function (id) { return yGames.indexOf(id) < 0; }).length };
    }
    /* 오래 안 한 사건부터 짜 보고, 어제와 놀이 둘이 바뀌는 첫 세트를 쓴다(끝내 안 되면 가장 많이 바뀌는 것) */
    var best = null;
    (evList.length ? evList : [null]).some(function (e) {
      var t = build(e);
      if (!best || t.changed > best.changed) best = t;
      return !yest || !!o.event || t.changed >= CONF.changeAtLeast;
    });
    var ev = best.ev, minis = best.minis;
    var res = withB({ day: today, event: ev ? ev.id : null, eventGame: ev ? ev.game : null, minis: minis, set: garden.concat(minis, guest), reused: false });
    if (!o.dry) {
      st.days = days.concat([{ day: today, event: res.event, eventGame: res.eventGame, games: minis }]).slice(-CONF.keepDays);
      put(cell, st);
    }
    return res;
  }

  /* 그 놀이의 대상 — 아직 씨앗이 없는 단어 · 다시 볼 단어를 앞에 */
  function targets(id, zone, info) {
    info = info || {};
    var words = (zone.words || []).slice(), n = CONF.perGame[id] || words.length, first = (info.unplanted || []).concat(info.review || []);
    if (zone.step && PICTURE[id]) words = words.filter(function (x) { return x.drawn !== false && x.path !== 'sight' && x.path !== 'sentence'; });      /* 한 해 길 — 그림으로 하는 놀이는 그림이 있는 낱말로 */
    if (zone.step && id === 'read-aloud') words = words.filter(function (x) { return x.path === 'decode'; });
    var rnd = info.rng || Math.random;
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    if (id === 'sound-box' && info.flower && info.flower.length) {                 /* 소리 상자 — 꽃 차례인 낱말 먼저 */
      var fl = info.flower.filter(function (x) { return words.indexOf(x) >= 0 || true; });
      return fl.concat(shuffle(words.filter(function (x) { return fl.indexOf(x) < 0; }))).slice(0, n);
    }
    if (!CONF.perGame[id]) return words;
    var head = shuffle(words.filter(function (x) { return first.indexOf(x.w) >= 0; })), tail = shuffle(words.filter(function (x) { return first.indexOf(x.w) < 0; }));
    return shuffle(head.concat(tail).slice(0, n));
  }

  /* 마무리 — 오늘 무대에 장식이 하나 생긴다(하루에 하나, 아이템·열매와는 별개) */
  function finish(cell, zone, day) {
    var st = stateOf(cell), today = day || dayStr(), list = (zone && zone.decor) || [];
    if (st.decorDay === today) return null;
    var next = list.filter(function (x) { return st.decor.indexOf(x.id) < 0; })[0];
    if (!next) return null;
    st.decor = st.decor.concat([next.id]); st.decorDay = today; put(cell, st);
    return next;
  }
  function decor(cell, zone) { var st = stateOf(cell); return ((zone && zone.decor) || []).filter(function (x) { return st.decor.indexOf(x.id) >= 0; }); }

  var PICTURE = { 'order-shop': 1, pop: 1, 'catch': 1, lean: 1, 'magic-call': 1, 'word-train': 1, 'first-basket': 1, raccoon: 1, belt: 1, plates: 1, dance: 1 };
  /* ══ 하루 조립 v2 ══ */
  var POW = ['L', 'S', 'R', 'W'];
  function powersOf(G, ids) { var has = {}; ids.forEach(function (id) { var d = G.get(id); ((d && d.skills) || []).forEach(function (p) { has[p] = 1; }); }); return has; }
  function day(o) {
    o = o || {};
    var zone = o.zone || {}, cell = o.cell || zone.id, today = o.day || dayStr(), G = o.games || g.PlayGame;
    var st = o.state || stateOf(cell), days = st.days.filter(function (d) { return d.day < today; });
    var same = st.days.filter(function (d) { return d.day === today; })[0];
    var hasDue = (o.due | 0) > 0;
    var usable = function (id) { var d = G.get(id); return !!d && !d.draft && (!d.fits || d.fits(zone)) && !(d.cam && !o.cam && d.camOnly); };
    var wrap = function (r) { r.set = (hasDue && G.get('garden') ? ['garden'] : []).concat(r.minis.filter(function (id) { return id !== 'garden'; })); return r; };
    if (same && !o.force && same.games.every(function (id) { return !!G.get(id); }))             /* 같은 날 다시 = 같은 세트 */
      return wrap({ day: today, kind: same.kind || 'meet', event: same.event || null, eventGame: same.eventGame || null, minis: same.games.slice(), reused: true, boost: same.boost || null, filled: [] });
    /* 오늘은 어떤 날인가 */
    var n = days.length, kind = 'meet', prevKinds = days.map(function (d) { return d.kind; });
    if (n === 1) kind = dayNo(today) - dayNo(days[0].day) >= CONF.mergeGap ? 'both' : 'read';
    else if (n >= 2) kind = prevKinds.indexOf('write') < 0 && prevKinds.indexOf('both') < 0 ? 'write' : (prevKinds[n - 1] === 'read' ? 'write' : 'read');
    var D = zone.days || {}, base = kind === 'both' ? (D.read || []).concat((D.write || []).filter(function (id) { return (D.read || []).indexOf(id) < 0; })) : (D[kind] || []);
    var list = base.filter(function (id) { return id !== 'garden' && usable(id); }), filled = [];
    var guest = list.indexOf('special-guest') >= 0; list = list.filter(function (id) { return id !== 'special-guest'; });
    /* 빠진 힘 채우기 — 그 걸음의 다른 날 놀이에서 먼저, 없으면 지은 놀이 전부에서 */
    var poolAll = (zone.games || []).concat(G.list().map(function (d) { return d.id; })).filter(function (id, i, a) { return a.indexOf(id) === i && id !== 'garden' && id !== 'special-guest' && usable(id); });
    var findFor = function (p, not) { return poolAll.filter(function (id) { return not.indexOf(id) < 0 && (G.get(id).skills || [])[0] === p; })[0] || poolAll.filter(function (id) { return not.indexOf(id) < 0 && (G.get(id).skills || []).indexOf(p) >= 0; })[0] || null; };
    POW.forEach(function (p) { if (!powersOf(G, list)[p]) { var id = findFor(p, list); if (id) { list.push(id); filled.push(p); } } });
    /* 약한 힘 보충 — 앞쪽 놀이 하나를 그 힘 놀이로(네 힘은 그대로 남게) */
    var boost = null, pw = o.powers || (g.PlayEvidence && g.PlayEvidence.powers ? g.PlayEvidence.powers(CONF.window) : null);
    if (pw) {
      var rated = POW.filter(function (p) { return pw[p] && pw[p].n >= CONF.weakMin; });
      if (rated.length === POW.length) {
        var weak = rated.slice().sort(function (a, b) { return pw[a].rate - pw[b].rate; })[0];
        var others = rated.filter(function (p) { return p !== weak; }), mean = others.reduce(function (s, p) { return s + pw[p].rate; }, 0) / others.length;
        if (mean - pw[weak].rate > CONF.weakGap) {
          var add = findFor(weak, list);
          for (var k = 0; add && k < Math.min(2, list.length); k++) {
            var out = list[k]; if ((G.get(out).skills || []).indexOf(weak) >= 0) continue;
            var trial = list.slice(); trial[k] = add;
            if (POW.every(function (p) { return powersOf(G, trial)[p] || !powersOf(G, list)[p]; })) { list = trial; boost = { power: weak, out: out, 'in': add }; break; }
          }
          if (add && !boost) { list.splice(Math.min(1, list.length), 0, add); boost = { power: weak, out: null, 'in': add }; }      /* 바꿀 자리가 없으면(네 힘이 깨지면) 앞쪽에 하나 끼운다 */
        }
      }
    }
    /* 길이 — 채운 놀이를 남기고 뒤에서부터 덜어 낸다 */
    var room = CONF.maxDay - (hasDue ? 1 : 0) - (guest ? 1 : 0);
    while (list.length > room) { var cut = -1; for (var c = list.length - 1; c >= 0; c--) { var t2 = list.slice(); t2.splice(c, 1); if (POW.every(function (p) { return powersOf(G, t2)[p] || !powersOf(G, list)[p]; })) { cut = c; break; } } if (cut < 0) break; list.splice(cut, 1); }
    /* 어제와 똑같은 조합이면 하나를 바꾼다 */
    var yest = days.length ? days[days.length - 1] : null;
    if (yest && yest.games.slice().sort().join() === list.concat(guest ? ['special-guest'] : []).sort().join()) {
      for (var y = list.length - 1; y >= 0; y--) { var alt = findFor((G.get(list[y]).skills || [])[0], list); if (alt) { list[y] = alt; break; } }
    }
    /* 사건 — 그 걸음(없으면 그 무대)의 사건 표에서, 오늘 놀이를 입히는 것 중 오래 안 한 것. 그 놀이가 첫 놀이 */
    var evs = (o.events || (g.PLAY_EVENTS && (g.PLAY_EVENTS[zone.id] || g.PLAY_EVENTS[zone.stage])) || []).filter(function (e) { return list.indexOf(e.game) >= 0; });
    var evPool = evs.filter(function (e) { return !yest || e.id !== yest.event; }); if (!evPool.length) evPool = evs;
    var ev = oldest(evPool, function (e) { return ago(days, today, function (d) { return d.event === e.id; }); }, today)[0] || null;
    if (ev) list = [ev.game].concat(list.filter(function (id) { return id !== ev.game; }));
    var minis = list.concat(guest ? ['special-guest'] : []);
    var res = wrap({ day: today, kind: kind, event: ev ? ev.id : null, eventGame: ev ? ev.game : null, minis: minis, reused: false, boost: boost, filled: filled });
    if (!o.dry) { st.days = days.concat([{ day: today, kind: kind, event: res.event, eventGame: res.eventGame, games: minis, boost: boost }]).slice(-CONF.keepDays); put(cell, st); }
    return res;
  }
  /* 하루 상한 — due = { sprout[], flower[], fruit[] }(오래 기다린 것부터, 낱말). 넘친 것은 그대로 내일 차례 */
  function caps(due, o) {
    o = o || {};
    var sp = (due.sprout || []).slice(0, CONF.cap.sprout), fl = (due.flower || []).slice(0, CONF.cap.flower), fr = [], letters = 0;
    (due.fruit || []).forEach(function (x) { var w = typeof x === 'string' ? x : x.w, path = typeof x === 'string' ? '' : x.path, n = path === 'oral' || path === 'letter' ? 1 : String(w).replace(/[^A-Za-z]/g, '').length; if (letters + n <= CONF.cap.fruitLetters) { fr.push(x); letters += n; } });
    return { sprout: sp, flower: fl, fruit: fr, letters: letters };
  }

  g.PlayAssemble = { CONF: CONF, KEY: KEY, GROUP: GROUP, plan: plan, day: day, caps: caps, targets: targets, finish: finish, decor: decor,
    allowed: allowed, groupOf: groupOf, cellOf: cellOf, history: function (cell) { return stateOf(cell); }, today: dayStr,
    _reset: function () { try { g.localStorage.removeItem(KEY); } catch (e) {} } };
})(window);
