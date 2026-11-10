/* ============================================================
 * 영어 놀이터 — 씨앗(PlaySeed) : 아이템 = 반복 학습의 증거 (설계 v1 §5)
 *   단어·문장 한살이: 처음 말해서 통과 → 씨앗(0) → +1일 새싹(1) → +3일 꽃(2) → +7일 열매(3) = 아이템
 *   간격 = 심은 날 기준 1·3·7일. 틀려도 등급은 안 내려가고, 다음 날 같은 단계 다시.
 *   경험치는 문항 정답이 아니라 「내 입으로 통과한 것」과 「며칠 뒤 기억한 것」에만(spoken / recalled).
 * 저장: localStorage 'kedu-en-play-seeds' — /kedu_gate.js(= kedu_scope) 아래서 돌면 계정 분리·동의 전 미저장이 자동 적용.
 *   가정 이용(학급 없는 아이)의 저장 자리는 열린 결정(설계 v1 §7) — 지금은 같은 규칙(방문자 = 기기 메모리만).
 * ============================================================ */
(function (g) {
  'use strict';
  var KEY = 'kedu-en-play-seeds';
  var STAGE = [
    { n: 0, name: '씨앗', icon: 'seed', after: 0 },
    { n: 1, name: '새싹', icon: 'sprout', after: 1 },
    { n: 2, name: '꽃',   icon: 'flower', after: 3 },
    { n: 3, name: '열매', icon: 'fruit', after: 7 }
  ];
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { seeds: {}, days: [], xp: { spoken: 0, recalled: 0 }, parts: {}, cleared: {} }; }
    catch (e) { return { seeds: {}, days: [], xp: { spoken: 0, recalled: 0 }, parts: {}, cleared: {} }; }
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function dayStr(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }

  function touchDay(d) {
    var t = dayStr();
    if (d.days[d.days.length - 1] !== t) d.days.push(t);
    if (d.days.length > 400) d.days = d.days.slice(-400);
  }

  var PlaySeed = {
    STAGE: STAGE,
    today: dayStr,
    /* 구역의 단어가 지금 어느 단계인지. 없으면 null */
    get: function (w) { return load().seeds[w] || null; },
    all: function () { return load().seeds; },
    /* 처음 통과 — 씨앗을 심는다. by = 'speech' | 'body' | 'hand' | 'chosen'. 이미 있으면 그대로(오늘 돌보기로 간주) */
    plant: function (w, zone, by) {
      var d = load(), t = dayStr();
      if (!d.seeds[w]) {
        d.seeds[w] = { zone: zone, stage: 0, planted: t, last: t, next: 1, n: 1, by: [by || 'chosen'] };
        if (by === 'speech') d.xp.spoken++;
      } else {
        return this.care(w, true, by);
      }
      touchDay(d); save(d);
      return d.seeds[w];
    },
    /* 오늘 돌볼 씨앗(기한이 된 것). 단계별 기한 = 심은 날 + 1·3·7 */
    due: function (zone) {
      var d = load(), t = dayStr(), out = [];
      Object.keys(d.seeds).forEach(function (w) {
        var s = d.seeds[w];
        if (zone && s.zone !== zone) return;
        if (s.stage >= 3) return;
        var need = STAGE[s.stage + 1].after;
        if (daysBetween(s.planted, t) >= need && s.last !== t) out.push(w);
      });
      return out;
    },
    /* 돌보기 — ok 면 기한이 됐을 때 다음 단계. 틀려도 안 내려감(다음 날 다시) */
    care: function (w, ok, by) {
      var d = load(), t = dayStr(), s = d.seeds[w];
      if (!s) return null;
      s.n++; if (by && s.by.indexOf(by) < 0) s.by.push(by);
      var grew = false;
      if (ok && s.stage < 3) {
        var need = STAGE[s.stage + 1].after;
        if (daysBetween(s.planted, t) >= need && s.last !== t) {
          s.stage++; grew = true; d.xp.recalled++;
          if (by === 'speech') d.xp.spoken++;
        }
      }
      s.last = t; touchDay(d); save(d);
      s.grew = grew;
      return s;
    },
    /* 구역 집계 */
    summary: function (zone, words) {
      var d = load(), out = { total: words.length, planted: 0, flower: 0, fruit: 0, stages: {} };
      words.forEach(function (w) {
        var s = d.seeds[w]; out.stages[w] = s ? s.stage : -1;
        if (s) { out.planted++; if (s.stage >= 2) out.flower++; if (s.stage >= 3) out.fruit++; }
      });
      return out;
    },
    /* 구역 열기 조건(설계 §5): 단어 대부분(¾) 꽃 이상 + 보스전 통과 */
    canClear: function (zone, words) {
      var s = this.summary(zone, words), d = load();
      return s.flower >= Math.ceil(words.length * 0.75) && !!d.cleared[zone];
    },
    bossPassed: function (zone, by) {
      var d = load(); if (!d.cleared[zone]) { d.cleared[zone] = { at: dayStr(), by: by || 'speech' }; if (by === 'speech') d.xp.spoken += 2; save(d); }
      return d.cleared[zone];
    },
    bossDone: function (zone) { return !!load().cleared[zone]; },
    /* 캐릭터 파츠 */
    givePart: function (id) { var d = load(); if (!d.parts[id]) { d.parts[id] = dayStr(); save(d); return true; } return false; },
    parts: function () { return load().parts; },
    xp: function () { return load().xp; },
    /* 연속 출석(끊겨도 벌점 0 — 표시만) */
    streak: function () {
      var d = load(), n = 0, t = dayStr();
      for (var i = d.days.length - 1; i >= 0; i--) {
        if (daysBetween(d.days[i], t) === n || (n === 0 && daysBetween(d.days[i], t) === 1)) { n++; t = d.days[i]; } else break;
      }
      return n;
    },
    _reset: function () { localStorage.removeItem(KEY); }
  };
  g.PlaySeed = PlaySeed;
})(window);
