/* ============================================================
 * 영어 놀이터 — 음성 게이트(PlaySpeech) (설계 v1 §6)
 *   Web Speech API(무료). 전사 일치 판정이지 발음 평가 아님 — 점수 노출 0.
 *   통과: 핵심 낱말 포함 + 대략 비슷(글자 80%↑). 혼동쌍(dish↔fish 등)은 서로를 정답으로 받지 않는다.
 *   3회 안 넘으면 모델을 느리게 다시 들려주고, 그래도 안 되면 고르기 대체(passedBy 'chosen').
 *   마이크 없음·거부·오프라인 = 처음부터 고르기 대체. 결과 { ok, heard, by }.
 * 크롬은 구글 서버에서 처리 — 개인정보 항목(설계 §6). 음소 단위 판정 불가 → Lv1 단어 읽기·Lv2 문장.
 * ============================================================ */
(function (g) {
  'use strict';
  var SR = g.SpeechRecognition || g.webkitSpeechRecognition;
  var rec = null, busy = false, denied = false;

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function lev(a, b) {
    var m = a.length, n = b.length, i, j, d = [];
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  function sim(a, b) { var L = Math.max(a.length, b.length); return L ? 1 - lev(a, b) / L : 1; }

  /* 느슨한 별칭 — 음성 전사가 자주 내는 꼴. 발음 평가가 아니므로 넉넉히 */
  var ALIAS = {
    chips: ['chip', 'ships', 'cheeps', 'tips'], ham: ['hum', 'hem', 'hamm'], jam: ['gem', 'jem', 'jim', 'jamm', 'jump'],
    lunch: ['launch', 'lunche', 'lunge'], shop: ['shopp', 'shob', 'shaw'], fish: ['fishy', 'fiss', 'feesh'],
    dish: ['dishh', 'deesh', 'wish'], chop: ['chopp', 'chup', 'job']
  };

  /* 들은 글(heard)이 target 을 뜻하는가. others = 같은 구역의 다른 재료(혼동 방지) */
  function matchWord(heard, target, others) {
    var toks = norm(heard).split(' ').filter(Boolean);
    if (!toks.length) return false;
    var best = null, bestScore = 0;
    var cands = [target].concat(others || []);
    toks.forEach(function (tk) {
      cands.forEach(function (c) {
        var s = sim(tk, c);
        if ((ALIAS[c] || []).indexOf(tk) >= 0) s = Math.max(s, 0.9);
        if (tk === c) s = 1;
        if (s > bestScore) { bestScore = s; best = c; }
      });
    });
    return best === target && bestScore >= 0.8;
  }
  /* 문장: 핵심 단어(key)가 들어 있고, 틀(frame) 단어 중 하나 이상(like/lik/light…)이 들리면 통과 */
  function matchSentence(heard, key, others, frame) {
    var h = norm(heard);
    if (!matchWord(h, key, others)) return false;
    frame = frame || ['like', 'lik', 'light', 'likes'];
    var toks = h.split(' ');
    for (var i = 0; i < toks.length; i++) for (var j = 0; j < frame.length; j++) if (sim(toks[i], frame[j]) >= 0.75) return true;
    return false;
  }

  function listenOnce(opt) {
    opt = opt || {};
    return new Promise(function (resolve) {
      if (!SR || denied) return resolve({ error: 'unavailable' });
      if (busy) { try { rec.abort(); } catch (e) {} }
      rec = new SR();
      rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
      var done = false, timer = setTimeout(function () { finish({ error: 'timeout' }); try { rec.stop(); } catch (e) {} }, opt.timeout || 6000);
      function finish(r) { if (done) return; done = true; busy = false; clearTimeout(timer); resolve(r); }
      rec.onresult = function (ev) {
        var alts = [];
        for (var i = 0; i < ev.results.length; i++) for (var j = 0; j < ev.results[i].length; j++) alts.push(ev.results[i][j].transcript);
        finish({ alts: alts });
      };
      rec.onerror = function (ev) {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') denied = true;
        finish({ error: ev.error || 'error' });
      };
      rec.onend = function () { finish({ error: 'nospeech' }); };
      try { busy = true; rec.start(); if (opt.onStart) opt.onStart(); } catch (e) { finish({ error: 'start' }); }
    });
  }

  var PlaySpeech = {
    available: function () { return !!SR && !denied && navigator.onLine !== false; },
    matchWord: matchWord, matchSentence: matchSentence, norm: norm,
    /* 한 번 듣고 판정. kind 'word'|'sentence'. 반환 {ok, heard, error} */
    tryOnce: function (target, opt) {
      opt = opt || {};
      return listenOnce(opt).then(function (r) {
        if (r.error) return { ok: false, heard: '', error: r.error };
        var ok = false, heard = r.alts[0] || '';
        for (var i = 0; i < r.alts.length && !ok; i++) {
          ok = opt.kind === 'sentence' ? matchSentence(r.alts[i], target, opt.others) : matchWord(r.alts[i], target, opt.others);
          if (ok) heard = r.alts[i];
        }
        return { ok: ok, heard: heard };
      });
    },
    stop: function () { try { if (rec) rec.abort(); } catch (e) {} busy = false; }
  };
  g.PlaySpeech = PlaySpeech;
})(window);
