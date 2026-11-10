/* ============================================================
 * 영어 놀이터 — 놀이 공통 인터페이스(PlayGame) (게임설계 v1 §9)
 *   놀이 모듈(games/*.js)은 PlayGame.register({ id, no, name, icon, channels, axis, need, count, start }) 로 등록하고,
 *   무대 페이지는 PlayGame.run(id, ctx) 로만 부른다(무대는 조립만).
 *
 *   start(ctx) → Promise({ completed, evidence[], nextReview[] })
 *   ctx = { host, zone(구역 데이터), cell(칸 id), targets[{w,pic}], pool[{w,pic}], learner{ mic{ok,off,primed,prime}, cam },
 *           services{ tts, speech, cam, seed, audio, npc, fx, sam{say,react,el}, evidence }, signal{aborted}, opt }
 *   run() 이 ctx 에 얹어 주는 것:
 *     ctx.emit(evidence)   — 증거 한 건이 생길 때마다. 기록 + 씨앗(입으로 통과한 것만 심고 키운다 — 결정 §0-1) + 무대 알림(ctx.onEvidence)
 *     ctx.good(clean, opt) — 성공 반응: 소리 + Sam 웃음 + 깔끔한 연속 3·5·8 에 콤보(소리·불꽃·환호)
 *     ctx.oops()           — 실패 반응: 「틀렸다」 없이 부드러운 소리 + Sam 갸웃
 *     ctx.say(word, rate)  — 모델 음성(끝 신호가 안 와도 넘어간다)
 * ============================================================ */
(function (g) {
  'use strict';
  /* ── 상수는 여기 한 곳 ── */
  var CONF = {
    sayMax: 4000,       /* 음성이 끝났다는 신호가 안 와도 이만큼 뒤엔 넘어간다(ms) */
    mutedWait: 350      /* 아직 화면을 안 눌러 소리가 안 나는 동안은 이만큼만 기다린다 */
  };
  var GAMES = {}, ORDER = [];
  var CHANNELS = ['say', 'body', 'hand', 'ear', 'sound', 'read', 'make', 'talk'];   /* 말·몸·손·귀·소리·읽기·창작·관계 */

  function canSound() { var ua = g.navigator && g.navigator.userActivation; return !ua || ua.hasBeenActive; }
  function soon(p, ms) { return Promise.race([p || Promise.resolve(), new Promise(function (r) { setTimeout(r, ms == null ? (canSound() ? CONF.sayMax : CONF.mutedWait) : ms); })]); }
  function noop() {}

  /* 성공·실패 반응 — 놀이마다 다시 쓰지 않게 한 곳에. 연속(streak)은 services 에 두어 놀이가 바뀌어도 이어진다 */
  function feedback(S) {
    var audio = S.audio || { play: noop, combo: noop }, sam = S.sam || { react: noop }, fx = S.fx;
    if (!S.streak && fx) S.streak = fx.streak();
    var streak = S.streak || { hit: function () { return 0; }, miss: function () { return 0; } };
    return {
      good: function (clean, o) {
        o = o || {};
        if (!o.quiet) { audio.play('ok'); sam.react('ok'); }
        var lv = clean === false ? streak.miss() : streak.hit();
        if (lv) setTimeout(function () {
          if (audio.combo) audio.combo(lv); else audio.play('combo');
          if (fx && fx.burst) fx.burst(lv, o.at || (sam.el && sam.el()) || null);
          sam.react(lv >= 2 ? 'cheer' : 'ok');
        }, fx ? fx.CONF.comboDelay : 180);
        return lv;
      },
      oops: function () { audio.play('soft'); sam.react('no'); streak.miss(); }
    };
  }

  var PlayGame = {
    CONF: CONF, CHANNELS: CHANNELS,
    canSound: canSound, soon: soon,
    register: function (def) {
      if (!def || !def.id || typeof def.start !== 'function') throw new Error('PlayGame.register: id·start 가 필요');
      if (!GAMES[def.id]) ORDER.push(def.id);
      GAMES[def.id] = def;
      return def;
    },
    get: function (id) { return GAMES[id] || null; },
    list: function () { return ORDER.map(function (id) { return GAMES[id]; }); },
    /* 그 놀이가 이번에 낼 증거 건수(평판 불빛의 분모) */
    count: function (id, ctx) { var d = GAMES[id]; if (!d) return 0; return typeof d.count === 'function' ? d.count(ctx || {}) : (d.count || 0); },
    run: function (id, ctx) {
      var def = GAMES[id];
      if (!def) return Promise.resolve({ completed: false, evidence: [], nextReview: [], error: 'unknown:' + id });
      ctx = ctx || {};
      var S = ctx.services = ctx.services || {}, E = S.evidence || g.PlayEvidence;
      var cell = ctx.cell || (ctx.zone && ctx.zone.id) || '', zoneId = (ctx.zone && (ctx.zone.stage || ctx.zone.id)) || '';
      var got = [], fb = feedback(S);
      ctx.game = id;
      ctx.signal = ctx.signal || { aborted: false };
      ctx.good = fb.good; ctx.oops = fb.oops;
      ctx.say = function (w, rate) { return soon(S.tts ? S.tts.word(w, rate ? { rate: rate } : undefined) : null); };
      ctx.emit = function (ev) {
        var v = E ? E.make(ev) : ev;
        if (!v) return null;
        got.push(v);
        if (E) E.record({ zone: zoneId, cell: cell, game: id }, [v]);
        /* 씨앗 — 입으로 통과한 것만 심고 키운다(이미 있으면 돌보기 = 기한이 됐을 때 자람).
           그 밖의 증거는 씨앗을 건드리지 않는다 — 같은 날 나중에 말로 통과해도 자랄 수 있게 */
        if (S.seed && E && E.spoken(v)) { try { Object.defineProperty(v, 'seed', { value: S.seed.plant(v.targetId, cell, 'speech'), enumerable: false }); } catch (e) {} }   /* v.seed = 심은·자란 씨앗(놀이가 화면에 쓸 때만, 기록엔 안 들어감) */
        if (ctx.onEvidence) { try { ctx.onEvidence(v, id); } catch (e) {} }
        return v;
      };
      var p; try { p = def.start(ctx); } catch (e) { p = Promise.reject(e); }     /* 화면은 부르는 즉시 그려진다 */
      return Promise.resolve(p).then(function (res) {
        res = res || {};
        return { completed: res.completed !== false, evidence: got.slice(), nextReview: E ? E.nextReview(got) : [], passed: res.passed, by: res.by, results: res.results };
      });
    }
  };
  g.PlayGame = PlayGame;
})(window);
