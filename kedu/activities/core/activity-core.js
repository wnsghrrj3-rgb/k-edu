/* activity-core.js — 케이티처 활동 공통 프레임 v1.0.0 (Phase 3)
 * 헌법: 설계 §9-2. 여기 있는 것은 모든 활동이 공짜로 얻는다. 도구는 다시 만들지 않는다.
 *
 * core가 하는 일: 셸 DOM(3막 화면·HUD·팀 점수판·설정 칩·답 버튼·explain) · 효과음 ·
 *   점수/byType/judged 집계 · [넘기기]/[그만하기] · 부분 마감(§6-8) · 브리지 연동 · solo 최고 기록.
 * core가 하지 않는 일: 문제 렌더 · 게임 루프 · 승패 판정 — 그건 장르(genre/*.js)의 일.
 *
 * 사용:
 *   var app = ACore.create({
 *     activityId, title, subtitle, defaults, settings: [{key,label,options:[{v,label}]}],
 *     stageHtml, onConfig(app,cfg), onStart(app)
 *   });
 *   app.mode / app.cfg / app.settings / app.sfx / app.rng
 *   app.el(sel) / app.setStage(html)
 *   app.begin()                      // 게임 화면 진입 (장르가 호출)
 *   app.setProg(i, n) / app.addScore(delta) / app.teamScore(idx, delta)
 *   app.tally(type, ok) / app.markJudged()
 *   app.answers(list, onPick)        // §6-2 가로 일렬. class면 2팀 그룹 자동
 *   app.lockAnswers() / app.lockTeam(idx) / app.shake(idx, pick)
 *   app.explain(text, ok) / app.clearExplain()
 *   app.onSkip(fn) / app.finish(opts) / app.judged
 */
(function () {
  'use strict';

  var SHELL =
    '<div class="brand">K✦edu 놀이터</div>' +
    '<div class="screen active" id="scr-start">' +
      '<h1 id="a-title"></h1>' +
      '<div class="sub" id="a-sub"></div>' +
      '<div id="sid-badge"></div>' +
      '<div id="settings"></div>' +
      '<div id="best-line"></div>' +
      '<button class="btn" id="start-btn">시작!</button>' +
    '</div>' +
    '<div class="screen" id="scr-game">' +
      '<div id="hud">' +
        '<div class="pill" id="prog"></div>' +
        '<div class="pill num" id="score-pill">0점</div>' +
        '<button id="mute-btn" title="소리 켜기/끄기">🔊</button>' +
        '<button id="skip-btn" title="이 문제는 넘기기">넘기기 ⏭</button>' +
        '<button id="quit-btn">그만하기</button>' +
      '</div>' +
      '<div id="teams">' +
        '<div class="team A"><span id="tA-name">케이팀</span> <span class="num" id="tA-score">0</span></div>' +
        '<div class="team B"><span id="tB-name">듀팀</span> <span class="num" id="tB-score">0</span></div>' +
      '</div>' +
      '<div id="stage"></div>' +
      '<div id="explain"></div>' +
      '<div id="answers-solo"></div>' +
      '<div id="answers-class">' +
        '<div class="ansgrp A" data-team="0" data-label="케이팀"></div>' +
        '<div class="ansgrp B" data-team="1" data-label="듀팀"></div>' +
      '</div>' +
      '<div id="why-box"><div class="wq" id="why-q">🦉 어떻게 알았어?</div><div class="whyrow" id="why-opts"></div></div>' +
    '</div>' +
    '<div class="screen" id="scr-end">' +
      '<div class="big" id="end-big">🎉</div>' +
      '<div class="line" id="end-line"></div>' +
      '<div class="line" id="end-best" style="display:none"></div>' +
      '<div class="line" id="submit-line" style="display:none"></div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">' +
        '<button class="btn" id="again-btn">다시 하기</button>' +
      '</div>' +
    '</div>';

  function create(opts) {
    opts = opts || {};
    var doc = document;
    var host = doc.getElementById('a-root') || doc.body;
    host.innerHTML = SHELL + host.innerHTML;

    var $ = function (s) { return doc.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); };

    // ── 효과음 (mute 반영, 시작 제스처 뒤 생성)
    var AC = null, muted = false;
    function sfxInit() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    function tone(f, dur, type, vol) {
      if (muted || !AC) return;
      try {
        var o = AC.createOscillator(), g = AC.createGain();
        o.type = type || 'sine'; o.frequency.value = f;
        g.gain.value = vol || .12;
        o.connect(g); g.connect(AC.destination);
        o.start(); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + (dur || .15));
        o.stop(AC.currentTime + (dur || .15) + .02);
      } catch (e) {}
    }
    var sfx = {
      good: function () { tone(660, .12); setTimeout(function () { tone(880, .18); }, 90); },
      bad: function () { tone(200, .2, 'triangle', .08); },
      tick: function () { tone(440, .06, 'square', .05); },
      win: function () { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { tone(f, .22); }, i * 130); }); }
    };

    var app = {
      activityId: opts.activityId || 'unknown',
      mode: 'solo', cfg: null, settings: {},
      sfx: sfx,
      rng: function () { return Math.random(); },
      judged: 0, skipped: 0, score: 0, i: 0, n: 0,
      byType: {}, detail: [], teams: [{ name: '케이팀', score: 0 }, { name: '듀팀', score: 0 }],
      started: false, over: false,
      el: $, els: $$
    };

    // ── 설정 칩 (solo 전용 노출 — §3-2)
    function renderSettings() {
      var box = $('#settings');
      if (!opts.settings || !opts.settings.length) { box.style.display = 'none'; return; }
      box.innerHTML = opts.settings.map(function (s) {
        return '<div class="setrow"><span class="lb">' + s.label + '</span>' +
          s.options.map(function (o) {
            var on = (app.settings[s.key] === o.v) ? ' on' : '';
            return '<button class="chip' + on + '" data-set="' + s.key + '" data-v="' + o.v + '">' + o.label + '</button>';
          }).join('') + '</div>';
      }).join('');
      $$('.chip').forEach(function (c) {
        c.addEventListener('click', function () {
          $$('.chip[data-set="' + c.dataset.set + '"]').forEach(function (x) { x.classList.remove('on'); });
          c.classList.add('on');
          app.settings[c.dataset.set] = +c.dataset.v;
        });
      });
    }

    // ── solo 최고 기록
    var BEST_KEY = 'kedu_act_best_' + app.activityId;
    var LEGACY_KEYS = opts.legacyRecordKeys || [];      // 구 단일파일 시절 키 (D13: 마이그레이션은 코드가 한다)
    app.record = {
      get: function () {
        try {
          var v = JSON.parse(localStorage.getItem(BEST_KEY) || 'null');
          if (v) return v;
          for (var i = 0; i < LEGACY_KEYS.length; i++) {
            var old = JSON.parse(localStorage.getItem(LEGACY_KEYS[i]) || 'null');
            if (old) { localStorage.setItem(BEST_KEY, JSON.stringify(old)); return old; }
          }
        } catch (e) {}
        return null;
      },
      set: function (v) { try { localStorage.setItem(BEST_KEY, JSON.stringify(v)); } catch (e) {} }
    };
    function refreshBest() {
      var b = app.record.get();
      if (b) {
        $('#best-line').style.display = 'block';
        $('#best-line').textContent = '🏅 나의 최고 기록: ' + b.score + '점 / ' + b.total;
      }
    }

    // ── 화면
    function show(id) {
      $$('.screen').forEach(function (s) { s.classList.remove('active'); });
      $(id).classList.add('active');
    }
    app.show = show;
    app.setStage = function (html) { $('#stage').innerHTML = html; };

    // ── HUD
    app.setProg = function (i, n) { app.i = i; app.n = n; $('#prog').textContent = i + ' / ' + n; };
    app.addScore = function (d) { app.score += (d || 0); $('#score-pill').textContent = app.score + '점'; };
    app.teamScore = function (idx, d) {
      app.teams[idx].score += (d || 0);
      $(idx === 0 ? '#tA-score' : '#tB-score').textContent = app.teams[idx].score;
    };
    app.tally = function (type, ok) {
      if (!type) return;
      var t = app.byType[type] || (app.byType[type] = { ok: 0, miss: 0 });
      if (ok) t.ok++; else t.miss++;
    };
    app.markJudged = function () { app.judged++; };   // §6-8 채점 분모

    // ── 답 버튼 (§6-2 가로 일렬. class = 2팀 그룹)
    app.answers = function (list, onPick) {
      var mk = function (o, teamIdx) {
        return '<button class="abtn" data-pick="' + o.pick + '"' +
          (teamIdx != null ? ' data-team="' + teamIdx + '"' : '') + '>' + o.label + '</button>';
      };
      if (app.mode === 'class') {
        $('#answers-class').style.display = 'flex';
        $('#answers-solo').style.display = 'none';
        [0, 1].forEach(function (t) {
          var g = $('.ansgrp' + (t === 0 ? '.A' : '.B'));
          g.innerHTML = list.map(function (o) { return mk(o, t); }).join('');
        });
      } else {
        $('#answers-solo').style.display = 'flex';
        $('#answers-class').style.display = 'none';
        $('#answers-solo').innerHTML = list.map(function (o) { return mk(o, null); }).join('');
      }
      $$('.abtn[data-pick]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.classList.contains('locked')) return;
          var t = b.dataset.team;
          onPick(b.dataset.pick, (t == null || t === '') ? null : +t, b);
        });
      });
    };
    app.hideAnswers = function () {
      $('#answers-solo').style.display = 'none';
      $('#answers-class').style.display = 'none';
      $('#why-box').style.display = 'none';
    };
    app.unlockAnswers = function () {
      $$('.abtn').forEach(function (b) { b.classList.remove('locked', 'shake'); });
    };
    app.lockAnswers = function () { $$('.abtn').forEach(function (b) { b.classList.add('locked'); }); };
    app.lockTeam = function (idx) {
      $$('.ansgrp[data-team="' + idx + '"] .abtn').forEach(function (b) { b.classList.add('locked'); });
    };
    app.shake = function (btn) {
      if (!btn) return;
      btn.classList.add('shake');
      setTimeout(function () { btn.classList.remove('shake'); }, 460);
    };

    // ── explain (정답 근거 — §10-2에서 규약으로 승격)
    app.explain = function (text, ok) {
      var e = $('#explain');
      e.innerHTML = '<span class="mark">' + (ok ? '⭕' : '❌') + '</span> ' + text;
      e.classList.add('show');
    };
    app.clearExplain = function () { $('#explain').classList.remove('show'); };

    // ── why 보너스 (선택)
    app.why = function (question, list, onPick) {
      $('#why-q').textContent = question;
      $('#why-opts').innerHTML = list.map(function (o) {
        return '<button class="abtn" data-why="' + o.v + '">' + o.label + '</button>';
      }).join('');
      $('#answers-solo').style.display = 'none';
      $('#answers-class').style.display = 'none';
      $('#why-box').style.display = 'flex';
      $$('#why-opts .abtn').forEach(function (b) {
        b.addEventListener('click', function () { onPick(b.dataset.why, b); });
      });
    };
    app.hideWhy = function () { $('#why-box').style.display = 'none'; };

    // ── 넘기기 (§6-8)
    var skipFn = null;
    app.onSkip = function (fn) { skipFn = fn; };
    $('#skip-btn').addEventListener('click', function () {
      if (!app.started || app.over || !skipFn) return;
      app.skipped++;
      skipFn();
    });

    // ── 마감 (§6-8: judged 0이면 결과 없음)
    app.finish = function (o) {
      o = o || {};
      if (app.over) return false;
      if (app.judged === 0) {                       // 판정 0 → 빈 수첩 금지
        KBridge.exit('user', { q: app.i, total: app.n });
        app.over = true;
        show('#scr-start');
        return false;
      }
      app.over = true;
      var total = (o.total != null) ? o.total : app.judged;
      var score = (o.score != null) ? o.score
        : (app.mode === 'class' ? app.teams[0].score + app.teams[1].score : app.score);

      show('#scr-end'); sfx.win();
      if (app.mode === 'class') {
        var A = app.teams[0], B = app.teams[1];
        $('#end-big').textContent = A.score === B.score ? '🤝' : '🏆';
        $('#end-line').innerHTML =
          (A.score === B.score ? '무승부! ' : (A.score > B.score ? A.name : B.name) + ' 승리! ') +
          '<br><span class="num">' + A.name + ' ' + A.score + ' : ' + B.score + ' ' + B.name + '</span>';
      } else {
        $('#end-big').textContent = score >= total * 0.8 ? '🎉' : '💪';
        $('#end-line').innerHTML = '<span class="num" style="font-size:1.4em">' + score + '</span> / ' + total + '점';
        if (app.mode === 'solo') {
          var b = app.record.get();
          var isNew = !b || score > b.score;
          if (isNew) app.record.set({ score: score, total: total });
          $('#end-best').style.display = 'block';
          $('#end-best').textContent = isNew ? '🏅 최고 기록 갱신!' : ('🏅 최고 기록: ' + b.score + '점');
        }
      }
      if (app.mode === 'assign') {
        var sl = $('#submit-line');
        sl.style.display = 'block'; sl.textContent = '제출하는 중…';
        $('#again-btn').style.display = 'none';    // 재시도는 과제 정책 소관 (케이박스가 결정)
      }
      KBridge.finish({
        score: score, total: total, byType: app.byType, detail: app.detail,
        onSubmit: function (res) {
          var sl2 = $('#submit-line');
          if (!sl2) return;
          if (!res || res.status === 'pending') sl2.textContent = '📮 제출 대기 중 — 인터넷이 연결되면 자동으로 전달돼요';
          else if (res.status === 'inactive') sl2.textContent = '';
          else sl2.textContent = '✅ 선생님께 전달됐어요!';
        }
      });
      return true;
    };

    // ── 브리지 부팅
    KBridge.init({
      activityId: app.activityId,
      defaults: opts.defaults || {},
      onConfig: function (cfg) {
        app.cfg = cfg; app.mode = cfg.mode; app.rng = KBridge.rng;
        Object.keys(opts.defaults || {}).forEach(function (k) { app.settings[k] = cfg.params[k]; });
        muted = !!(cfg.meta && cfg.meta.mute);
        $('#mute-btn').textContent = muted ? '🔇' : '🔊';
        $('#a-title').textContent = opts.title || '';
        $('#a-sub').textContent = opts.subtitle || '';
        if (opts.stageHtml) app.setStage(opts.stageHtml);

        if (app.mode !== 'solo') $('#settings').style.display = 'none';   // §3-2
        else renderSettings();
        if (app.mode === 'assign') {
          $('#skip-btn').style.display = 'none';                          // §6-8 과제는 완주가 제출 조건
          if (cfg.meta.sid != null) {
            $('#sid-badge').style.display = 'block';
            $('#sid-badge').textContent = cfg.meta.sid + '번';
          }
        }
        if (app.mode === 'class' && cfg.meta.teamNames) {
          app.teams[0].name = cfg.meta.teamNames[0] || '케이팀';
          app.teams[1].name = cfg.meta.teamNames[1] || '듀팀';
          $('#tA-name').textContent = app.teams[0].name;
          $('#tB-name').textContent = app.teams[1].name;
          $('.ansgrp.A').setAttribute('data-label', app.teams[0].name);
          $('.ansgrp.B').setAttribute('data-label', app.teams[1].name);
        }
        if (cfg.hosted) $('#quit-btn').style.display = 'none';            // §6-6 출구는 하나
        if (app.mode === 'solo') refreshBest();
        if (typeof opts.onConfig === 'function') opts.onConfig(app, cfg);
      },
      onClose: function () {
        if (app.started && !app.over && app.judged > 0) app.finish({});   // §6-8 부분 결과도 결과다
      },
      getProgress: function () { return app.started ? { q: app.i, total: app.n } : null; }
    });

    // ── 시작 / 다시 / 음소거 / 그만하기
    $('#start-btn').addEventListener('click', function () {
      sfxInit();
      app.started = true; app.over = false;
      app.judged = 0; app.skipped = 0; app.score = 0;
      app.byType = {}; app.detail = [];
      app.teams[0].score = 0; app.teams[1].score = 0;
      $('#tA-score').textContent = '0'; $('#tB-score').textContent = '0';
      $('#score-pill').textContent = '0점';
      show('#scr-game');
      if (app.mode === 'class') { $('#teams').style.display = 'flex'; $('#score-pill').style.display = 'none'; }
      if (typeof opts.onStart === 'function') opts.onStart(app);
    });
    $('#again-btn').addEventListener('click', function () { location.reload(); });
    $('#mute-btn').addEventListener('click', function () {
      muted = !muted;
      $('#mute-btn').textContent = muted ? '🔇' : '🔊';
    });
    $('#quit-btn').addEventListener('click', function () {
      if (!app.started || app.over) return;
      if (!confirm('활동을 그만할까요?')) return;
      if (app.judged > 0) { app.finish({}); return; }   // §6-8 여기까지의 결과로 마감
      KBridge.exit('user', { q: app.i, total: app.n });
      app.started = false;
      show('#scr-start');
    });

    return app;
  }

  window.ACore = { create: create, version: '1.0.0' };
})();
