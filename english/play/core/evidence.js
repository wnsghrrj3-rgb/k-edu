/* ============================================================
 * 영어 놀이터 — 증거(PlayEvidence) (게임설계 v1 §9 · 결정 §0-1)
 *   놀이가 끝났다(completed) ≠ 배웠다 ≠ 혼자 해냈다(independent) — 셋을 따로 적는다.
 *   아이 화면에는 outcome·attempts 가 절대 나오지 않는다. 교사(·동의 학부모) 리포트의 원천.
 *
 *   evidence = { targetId, skill:'say'|'listen'|'read'|'move'|'build'|'blend',
 *                outcome:'independent'|'assisted'|'attempted'|'not_observed',
 *                inputMode:'speech'|'touch'|'cam'|'drag',
 *                speechStatus:'recognized'|'unverified'|'unavailable'|'not_used', attempts, at }
 *
 *   말하기 규칙 — 음성 인식 실패는 발음 실패가 아니다:
 *     말로 통과(몇 번째든) = independent · speech · recognized      ← 씨앗은 이것에만
 *     도움말(모델·느린 모델)을 받고 말로 통과 = assisted · speech · recognized   (특별 손님 전용: 힌트 0 이어야 independent)
 *     말했지만 못 알아들어 골라서 끝냄 = assisted · touch · unverified
 *     마이크 없음·거부로 골라서 끝냄 = assisted · touch · unavailable
 *   저장: localStorage 'kedu-en-play-evidence'(kedu_scope 규칙 그대로 — 동의 전에는 이 화면 동안만). 서버는 리포트 묶음에서.
 *
 *   증거 v2(설계 v2 §8-1 — 더하기만 한다. 지우는 것 0, v1 기록·하네스 그대로):
 *     unit    'sound'|'letter'|'word'|'chunk'|'sentence'|'text'            — 무엇의 단위(놀이 등록 정보가 채운다. 없으면 칸을 만들지 않는다)
 *     skill   … + 'spell'(조각으로 쓰기 — 소리 상자) · 'write'(손 쓰기)
 *     inputMode … + 'pen'(손가락·펜·마우스의 획)
 *     support 'none'|'model'|'slow'|'picture'|'choice'|'ghost'|'tiles'     — 받은 도움(없으면 칸을 만들지 않는다)
 *   PlayEvidence.power(e)  → 'L'|'S'|'R'|'W'   (listen·move → L / say → S / read·blend → R / build·spell·write → W)
 *   PlayEvidence.powers(n) → 힘별 최근 n건의 「혼자 해냄」 비율 { L:{n,solo,rate}, … }(조립기 약한 힘 보충 · 리포트)
 * ============================================================ */
(function (g) {
  'use strict';
  var KEY = 'kedu-en-play-evidence';
  var MAX = 800;                                  /* 기기에 남기는 최근 기록 수 */
  var SKILL = ['say', 'listen', 'read', 'move', 'build', 'blend', 'spell', 'write'];
  var OUTCOME = ['independent', 'assisted', 'attempted', 'not_observed'];   /* 앞일수록 좋은 것 */
  var INPUT = ['speech', 'touch', 'cam', 'drag', 'pen'];
  var UNIT = ['sound', 'letter', 'word', 'chunk', 'sentence', 'text'];
  var SUPPORT = ['none', 'model', 'slow', 'picture', 'choice', 'ghost', 'tiles'];
  var POWER = { listen: 'L', move: 'L', say: 'S', read: 'R', blend: 'R', build: 'W', spell: 'W', write: 'W' };
  var SPEECH = ['recognized', 'unverified', 'unavailable', 'not_used'];

  function load() { try { return JSON.parse(g.localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(a) { try { g.localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }
  function day(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  /* 값이 계약 밖이면 null — 잘못된 증거는 기록되지 않는다 */
  function make(o) {
    o = o || {};
    if (!o.targetId || SKILL.indexOf(o.skill) < 0 || OUTCOME.indexOf(o.outcome) < 0 || INPUT.indexOf(o.inputMode) < 0) return null;
    var sp = o.speechStatus || (o.inputMode === 'speech' ? 'recognized' : 'not_used');
    if (SPEECH.indexOf(sp) < 0) return null;
    if (o.inputMode === 'speech' && sp !== 'recognized') return null;         /* 말로 통과했다면 인식된 것 */
    var v = { targetId: String(o.targetId), skill: o.skill, outcome: o.outcome, inputMode: o.inputMode, speechStatus: sp,
      attempts: Math.max(1, o.attempts | 0), at: o.at || Date.now() };
    if (o.unit != null) { if (UNIT.indexOf(o.unit) < 0) return null; v.unit = o.unit; }                 /* v2 — 준 것만 적는다 */
    if (o.support != null) { if (SUPPORT.indexOf(o.support) < 0) return null; v.support = o.support; }
    return v;
  }
  /* 쓰기 한 건(v2) — 조각(spell)·손(write). support 'none' = 혼자, 그 밖(유령·조각·시범) = 도움 */
  function write(targetId, o) {
    o = o || {};
    var sup = o.support || 'none';
    return make({ targetId: targetId, skill: o.skill || 'write', outcome: sup === 'none' && o.clean !== false ? 'independent' : 'assisted',
      inputMode: o.inputMode || (o.skill === 'spell' ? 'touch' : 'pen'), speechStatus: 'not_used', attempts: o.attempts || 1, unit: o.unit, support: sup });
  }
  function power(e) { return (e && POWER[e.skill]) || ''; }
  /* 말하기 한 건 — r = { by:'speech'|'chosen', tries(못 알아들은 횟수), hinted, mic(마이크가 있었나) } */
  function say(targetId, r) {
    r = r || {};
    if (r.by === 'speech') return make({ targetId: targetId, skill: 'say', outcome: r.hinted ? 'assisted' : 'independent', inputMode: 'speech', speechStatus: 'recognized', attempts: (r.tries | 0) + 1 });
    return make({ targetId: targetId, skill: 'say', outcome: 'assisted', inputMode: 'touch', speechStatus: r.mic === false ? 'unavailable' : 'unverified', attempts: (r.tries | 0) + 1 });
  }
  /* 말하기가 아닌 한 건(듣기·읽기·움직임…) — clean 이면 혼자, 아니면 도움 */
  function act(targetId, skill, inputMode, clean, attempts) {
    return make({ targetId: targetId, skill: skill, outcome: clean ? 'independent' : 'assisted', inputMode: inputMode, speechStatus: 'not_used', attempts: attempts || (clean ? 1 : 2) });
  }
  /* 씨앗을 심거나 키울 수 있는 증거인가 — 입으로 통과한 것만(결정 §0-1) */
  function spoken(e) { return !!e && e.skill === 'say' && e.inputMode === 'speech' && e.speechStatus === 'recognized'; }
  function tier(o) { var i = OUTCOME.indexOf(o); return i < 0 ? OUTCOME.length : i; }
  /* 다음에 다시 볼 것 — 혼자 해내지 못한 대상 */
  function nextReview(list) {
    var best = {}, out = [];
    (list || []).forEach(function (e) { if (!e) return; if (!(e.targetId in best) || tier(e.outcome) < tier(best[e.targetId])) best[e.targetId] = e.outcome; });
    Object.keys(best).forEach(function (k) { if (best[k] !== 'independent') out.push(k); });
    return out;
  }

  var PlayEvidence = {
    KEY: KEY, SKILL: SKILL, OUTCOME: OUTCOME, INPUT: INPUT, SPEECH: SPEECH, UNIT: UNIT, SUPPORT: SUPPORT, POWER: POWER,
    make: make, say: say, act: act, write: write, spoken: spoken, nextReview: nextReview, power: power,
    /* 힘별 최근 n건의 혼자 해냄 비율 — 증거가 없는 힘은 n 0 · rate null */
    powers: function (n) {
      var out = { L: { n: 0, solo: 0, rate: null }, S: { n: 0, solo: 0, rate: null }, R: { n: 0, solo: 0, rate: null }, W: { n: 0, solo: 0, rate: null } }, a = load();
      for (var i = a.length - 1; i >= 0; i--) { var p = power(a[i]), o = out[p]; if (!o || o.n >= (n || 30)) continue; o.n++; if (a[i].outcome === 'independent') o.solo++; }
      Object.keys(out).forEach(function (k) { if (out[k].n) out[k].rate = out[k].solo / out[k].n; });
      return out;
    },
    /* meta = { zone, cell, game } */
    record: function (meta, list) {
      meta = meta || {};
      var a = load(), n = 0;
      (list || []).forEach(function (e) {
        var v = make(e); if (!v) return;
        v.zone = meta.zone || ''; v.cell = meta.cell || ''; v.game = meta.game || ''; v.day = day(v.at);
        a.push(v); n++;
      });
      if (a.length > MAX) a = a.slice(-MAX);
      if (n) save(a);
      return n;
    },
    all: function () { return load(); },
    forCell: function (cell) { return load().filter(function (e) { return e.cell === cell; }); },
    /* 칸 요약 — 대상마다 기술별 가장 좋은 결과. independentSay = 힌트 없이 말로 해낸 적이 있나 */
    summary: function (cell, targets) {
      var out = {}; (targets || []).forEach(function (t) { out[t] = { independentSay: false, spoken: false, skills: {} }; });
      this.forCell(cell).forEach(function (e) {
        var o = out[e.targetId] || (out[e.targetId] = { independentSay: false, spoken: false, skills: {} });
        if (!(e.skill in o.skills) || tier(e.outcome) < tier(o.skills[e.skill])) o.skills[e.skill] = e.outcome;
        if (spoken(e)) { o.spoken = true; if (e.outcome === 'independent') o.independentSay = true; }
      });
      return out;
    },
    _reset: function () { try { g.localStorage.removeItem(KEY); } catch (e) {} }
  };
  g.PlayEvidence = PlayEvidence;
})(window);
