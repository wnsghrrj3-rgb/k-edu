/* ============================================================
 * 영어 놀이터 — 씨앗(PlaySeed) : 아이템 = 반복 학습의 증거 (기본 설계 §5 · 설계 v2 §3·§8-2 · 한 해 길 v1 §4)
 *   낱말·문장 한살이: 씨앗(0) → +1일 새싹(1) → +3일 꽃(2) → +7일 열매(3) = 아이템
 *   간격 = 심은 날 기준 1·3·7일. 틀려도 등급은 안 내려가고, 다음 날 같은 단계 다시.
 *
 *   씨앗 v2 — 다음 단계로 자라는 조건이 「길(path)」마다 다르다. 간격이 벌어질수록 더 어려운 힘으로 꺼낸다.
 *     심기·새싹은 입으로(말로 통과한 것만 — 결정 §0-1) · 꽃·열매는 손으로(조각·쓰기 — 마이크가 없어도 된다).
 *     letter 길만 손으로 심는다(낱소리는 음성 판정 불가).
 *     길 일곱: word · sight · decode · letter · sentence · text · oral(입말 낱말 — 한 해 길 §4. 정원에서는 풀꽃)
 *     조건표는 PATHS 한 곳. 증거 한 건을 feed 로 먹이면 — 간격이 됐고 그 단계 조건이 다 차면 자란다.
 *       · 간격 전에 한 것은 세지 않는다 · 간격 뒤 며칠에 나눠 채워도 된다(need 에 남는다) · 도움 받아도 자란다 · 하루에 한 단계
 *     같은 낱말이 입말(oral)로도 읽기 낱말로도 나오면 씨앗이 따로다(풀꽃 옆에 나무 — 풀꽃은 그대로 남는다). 글자 씨앗도 따로.
 *       열쇠 = PlaySeed.key(w, path) — oral 'o:cat' · letter 'l:a' · 그 밖은 낱말 그대로
 *   v1 기록(path·need 없음)은 읽을 때 채워 넣는다 — 단계는 건드리지 않는다.
 *   plant·care 는 예전 약속 그대로 남긴다(간격만 보고 자란다 — 한 번에 그 단계 조건을 다 채운 것으로 친다). 놀이의 증거는 feed 로 들어온다.
 * 저장: localStorage 'kedu-en-play-seeds' — /kedu_gate.js(= kedu_scope) 아래서 돌면 계정 분리·동의 전 미저장이 자동 적용.
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
  /* ── 길마다 단계 조건(설계 v2 §3 표 · 한 해 길 §4) — [심기, 새싹, 꽃, 열매]. 열쇠 = 힘 글자, 값 = 그 힘으로 치는 증거 ── */
  var SAY = { skill: ['say'], input: ['speech'] };                  /* 입으로 — 인식된 말만 */
  var READ = { skill: ['read', 'blend'] };
  var SPELL = { skill: ['spell', 'build'] };                         /* 조각으로 쓰기(소리 상자·칩 조립) */
  var WRITE = { skill: ['write'] };                                  /* 손 쓰기(어른 메뉴 「조각으로」 = write·tiles) */
  var HEAR = { skill: ['listen', 'move'] };
  var PATHS = {
    word:     [{ S: SAY }, { S: SAY, R: READ }, { W: SPELL }, { W: WRITE }],
    sight:    [{ S: SAY }, { S: SAY, R: READ }, { W: SPELL }, { W: WRITE }],
    decode:   [{ S: SAY }, { S: SAY },          { W: SPELL }, { W: WRITE }],      /* 읽기 = 소리 내어 읽기(말로) */
    letter:   [{ L: HEAR }, { R: READ },        { W: WRITE }, { W: WRITE }],      /* 손으로 심는다(예외) */
    sentence: [{ S: SAY }, { W: SPELL, R: READ }, { S: SAY }, { W: WRITE }],
    text:     [{ S: SAY }, { S: SAY, R: READ }, { L: HEAR }, { W: WRITE }],
    oral:     [{ S: SAY }, { S: SAY, L: HEAR }, { W: WRITE }, { W: WRITE }]       /* 말하기 + 첫소리 글자 고르기 → 첫 글자 따라 → 혼자 */
  };
  function empty() { return { seeds: {}, days: [], xp: { spoken: 0, recalled: 0 }, parts: {}, cleared: {} }; }
  function load() {
    var d; try { d = JSON.parse(localStorage.getItem(KEY)) || empty(); } catch (e) { d = empty(); }
    /* v1 기록 — 길·조건 칸을 채워 넣는다(단계는 그대로) */
    Object.keys(d.seeds || {}).forEach(function (k) { var s = d.seeds[k]; if (!s.path) s.path = pathOfKey(k, s.zone); if (!s.need) s.need = {}; });
    return d;
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function dayStr(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }
  function touchDay(d) {
    var t = dayStr();
    if (d.days[d.days.length - 1] !== t) d.days.push(t);
    if (d.days.length > 400) d.days = d.days.slice(-400);
  }
  /* 씨앗 열쇠 — 입말·글자는 따로 심긴다 */
  function key(w, path) { return path === 'oral' ? 'o:' + w : path === 'letter' ? 'l:' + w : String(w); }
  function pathOfKey(k, zoneId) {
    if (/^o:/.test(k)) return 'oral'; if (/^l:/.test(k)) return 'letter';
    var Z = g.PLAY_ZONES, z = Z && Z.zone ? Z.zone(zoneId) : null, x = z ? (z.words || []).filter(function (y) { return y.w === k; })[0] : null;
    return (x && x.path) || 'word';
  }
  function hit(m, e) { return !!e && m.skill.indexOf(e.skill) >= 0 && (!m.input || (m.input.indexOf(e.inputMode) >= 0 && (e.inputMode !== 'speech' || e.speechStatus === 'recognized'))); }

  var PlaySeed = {
    STAGE: STAGE, PATHS: PATHS,
    today: dayStr, key: key,
    /* 구역의 단어가 지금 어느 단계인지. 없으면 null */
    get: function (w) { return load().seeds[w] || null; },
    all: function () { return load().seeds; },
    /* 그 길의 그 단계 조건(힘 글자들) — 화면이 「무엇이 남았나」를 볼 때 */
    needs: function (path, stage) { return Object.keys((PATHS[path] || PATHS.word)[stage] || {}); },
    /* 남은 조건 — 다음 단계로 자라려면 아직 채워야 하는 힘(간격 전이면 전부) */
    missing: function (k) { var s = load().seeds[k]; if (!s || s.stage >= 3) return []; return this.needs(s.path, s.stage + 1).filter(function (p) { return !s.need[p]; }); },

    /* ── v2: 증거 한 건을 먹인다. o = { zone, path } → { seed, planted, grew } ──
       씨앗이 없으면 그 길의 심기 조건을 본다. 있으면 다음 단계 조건을 채우고, 간격이 됐고 다 찼으면 자란다 */
    feed: function (w, e, o) {
      o = o || {};
      var d = load(), t = dayStr(), path = o.path || 'word', k = key(w, path), s = d.seeds[k], P = PATHS[path] || PATHS.word;
      var by = e && e.inputMode === 'speech' ? 'speech' : e && e.inputMode === 'pen' ? 'pen' : e && e.inputMode === 'cam' ? 'body' : 'hand';
      if (!s) {
        var plantOk = Object.keys(P[0]).every(function (p) { return hit(P[0][p], e); });
        if (!plantOk) return { seed: null, planted: false, grew: false };
        s = d.seeds[k] = { zone: o.zone || '', stage: 0, planted: t, last: t, next: 1, n: 1, by: [by], path: path, need: {} };
        if (by === 'speech') d.xp.spoken++;
        touchDay(d); save(d);
        return { seed: s, planted: true, grew: false };
      }
      s.n++; if (s.by.indexOf(by) < 0) s.by.push(by);
      var grew = false;
      if (s.stage < 3 && s.grown !== t && daysBetween(s.planted, t) >= STAGE[s.stage + 1].after) {      /* 간격 뒤에 한 것만 센다 · 하루에 한 단계 */
        var req = (PATHS[s.path] || PATHS.word)[s.stage + 1];
        Object.keys(req).forEach(function (p) { if (hit(req[p], e)) s.need[p] = true; });
        if (Object.keys(req).every(function (p) { return s.need[p]; })) {
          s.stage++; s.need = {}; s.grown = t; grew = true; d.xp.recalled++;
          if (by === 'speech') d.xp.spoken++;
        }
      }
      s.last = t; touchDay(d); save(d);
      s.grew = grew;
      return { seed: s, planted: false, grew: grew };
    },
    /* 단계별 오늘 차례 — stage 로 자랄 차례인 씨앗(간격이 됐고 오늘 아직 안 자람). 오래 기다린 것부터. 하루 상한은 조립기가 */
    dueBy: function (stage, zone) {
      var d = load(), t = dayStr(), out = [];
      Object.keys(d.seeds).forEach(function (k) {
        var s = d.seeds[k];
        if (zone && s.zone !== zone) return;
        if (s.stage !== stage - 1 || s.grown === t) return;
        if (daysBetween(s.planted, t) >= STAGE[stage].after) out.push(k);
      });
      return out.sort(function (a, b) { var x = d.seeds[a], y = d.seeds[b]; return x.planted < y.planted ? -1 : x.planted > y.planted ? 1 : (x.last < y.last ? -1 : x.last > y.last ? 1 : 0); });
    },

    /* ── 예전 약속(v1) — 간격만 보고 자란다 ── */
    /* 처음 통과 — 씨앗을 심는다. by = 'speech' | 'body' | 'hand' | 'chosen'. 이미 있으면 그대로(오늘 돌보기로 간주) */
    plant: function (w, zone, by) {
      var d = load(), t = dayStr();
      if (!d.seeds[w]) {
        d.seeds[w] = { zone: zone, stage: 0, planted: t, last: t, next: 1, n: 1, by: [by || 'chosen'], path: pathOfKey(w, zone), need: {} };
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
          s.stage++; s.need = {}; s.grown = t; grew = true; d.xp.recalled++;
          if (by === 'speech') d.xp.spoken++;
        }
      }
      s.last = t; touchDay(d); save(d);
      s.grew = grew;
      return s;
    },
    /* 구역 집계 */
    summary: function (zone, words) {
      var d = load(), out = { total: words.length, planted: 0, sprout: 0, flower: 0, fruit: 0, stages: {} };
      words.forEach(function (w) {
        var s = d.seeds[w]; out.stages[w] = s ? s.stage : -1;
        if (s) { out.planted++; if (s.stage >= 1) out.sprout++; if (s.stage >= 2) out.flower++; if (s.stage >= 3) out.fruit++; }
      });
      return out;
    },
    /* 다음 문 조건(한 해 길 v1 §2): 낱말 ¾ 이 새싹 이상(입으로 한 번 더 꺼냄) + 특별 손님 통과. 꽃·열매는 뒤 주에 따라온다 */
    canClear: function (zone, words) {
      var s = this.summary(zone, words), d = load();
      return s.sprout >= Math.ceil(words.length * 0.75) && !!d.cleared[zone];
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
