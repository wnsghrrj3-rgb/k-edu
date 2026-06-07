/* ============================================================================
   K-edu 케이플 게임 #2 — 스피드 퀴즈 (speed_quiz)
   ----------------------------------------------------------------------------
   만능 게임. 객관식이지만 "빠를수록 점수↑". 카훗 류.
     - 호스트가 문제 공개 → 타이머(기본 12초) 시작.
     - 참가자는 폰에서 빨리 답할수록 보너스. 정답 base 500 + 속도보너스 0~500.
     - 타이머 끝 / 전원 응답 → 자동 공개. 호스트 "지금 공개" 버튼도 있음.
     - 속도 측정: 참가자가 "문제 받은 로컬시각 ~ 답한 로컬시각" delta 를 직접 보냄.
       (기기 시계 차이·서버 시계 무관. broadcast 지연은 모두 공평하게 늦음.)

   문제 데이터(config.questions):
     [{ q, choices:[...], answer:index }]
   config.duration (ms, 기본 12000)

   사회적 비교 차단: 본인 점수만. 순위표·꼴등 X. 1등만 가볍게.
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[speed_quiz] kple-core.js 먼저 로드'); return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var KEYS = ['①', '②', '③', '④'];
  var BASE = 500, SPEED = 500;
  var SAMPLE = [
    { q: '7 + 6 은?', choices: ['11', '12', '13', '14'], answer: 2 },
    { q: '15 - 8 은?', choices: ['6', '7', '8', '9'], answer: 1 },
    { q: '가장 작은 수는?', choices: ['8', '3', '6', '5'], answer: 1 }
  ];

  function calcScore(correct, elapsed, duration) {
    if (!correct) return 0;
    var e = (typeof elapsed === 'number') ? elapsed : duration;
    var bonus = Math.max(0, Math.round(SPEED * (duration - e) / duration));
    return BASE + bonus;
  }

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var duration = ctx.config.duration || 12000;
    var phase = 'lobby', qi = -1;
    var answers = {};      // name -> {choice, elapsed}
    var scores = {};
    var timer = null;

    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    function render() {
      var el = ctx.el; if (!el) return;
      var roster = ctx.getRoster();
      var head =
        '<div class="kp-host-bar">' +
          '<div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
            '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
          '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div>' +
        '</div>';

      if (phase === 'lobby') {
        el.innerHTML = head +
          '<div class="kp-stage">' +
            '<div class="kp-big">⚡ 스피드 퀴즈</div>' +
            '<div class="kp-big" style="font-size:clamp(28px,5vw,46px)">참가자 ' + roster.length + '명</div>' +
            '<div class="kp-roster">' + (roster.length
              ? roster.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('')
              : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
            '<button class="kp-btn kp-go" id="kpStart"' + (roster.length ? '' : ' disabled') + '>게임 시작 ▶</button>' +
          '</div>';
        var b = el.querySelector('#kpStart'); if (b) b.onclick = nextQuestion;

      } else if (phase === 'question') {
        var Q = questions[qi];
        var responded = Object.keys(answers).length;
        el.innerHTML = head +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">문제 ' + (qi + 1) + ' / ' + questions.length + ' · ⚡ 빠를수록 점수↑</div>' +
            '<div class="kp-timerbar host"><span style="animation-duration:' + duration + 'ms"></span></div>' +
            '<div class="kp-q">' + esc(Q.q) + '</div>' +
            '<div class="kp-choices kp-host-choices">' +
              Q.choices.map(function (c, i) {
                return '<div class="kp-choice kp-c' + i + '"><span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) + '</div>';
              }).join('') + '</div>' +
            '<div class="kp-respbar"><b>' + responded + '</b> / ' + roster.length + ' 명 답함</div>' +
            '<button class="kp-btn kp-go" id="kpReveal">지금 공개 👀</button>' +
          '</div>';
        var r = el.querySelector('#kpReveal'); if (r) r.onclick = reveal;

      } else if (phase === 'reveal') {
        var Qr = questions[qi];
        var lastQ = (qi >= questions.length - 1);
        el.innerHTML = head +
          '<div class="kp-stage">' +
            '<div class="kp-q">' + esc(Qr.q) + '</div>' +
            '<div class="kp-choices kp-host-choices">' +
              Qr.choices.map(function (c, i) {
                var cls = (i === Qr.answer) ? ' kp-correct' : ' kp-faded';
                var cnt = Object.keys(answers).filter(function (n) { return answers[n].choice === i; }).length;
                return '<div class="kp-choice kp-c' + i + cls + '"><span class="kp-ckey">' + KEYS[i] + '</span>' +
                  esc(c) + '<span class="kp-cnt">' + cnt + '명</span></div>';
              }).join('') + '</div>' +
            '<button class="kp-btn kp-go" id="kpNext">' + (lastQ ? '결과 보기 🏁' : '다음 문제 ▶') + '</button>' +
          '</div>';
        var nx = el.querySelector('#kpNext'); if (nx) nx.onclick = lastQ ? endGame : nextQuestion;

      } else if (phase === 'end') {
        var roster2 = ctx.getRoster();
        var top = null, topScore = -1;
        roster2.forEach(function (n) { if ((scores[n] || 0) > topScore) { topScore = scores[n] || 0; top = n; } });
        el.innerHTML = head +
          '<div class="kp-stage">' +
            '<div class="kp-big">🎉 끝!</div>' +
            (top && topScore > 0 ? '<div class="kp-top">스피드왕 ⚡ ' + esc(top) + ' (' + topScore + '점)</div>' : '') +
            '<div class="kp-dim">점수는 각자 화면에서 확인!</div>' +
          '</div>';
      }
    }

    function nextQuestion() {
      clearTimer();
      qi += 1; answers = {}; phase = 'question';
      var Q = questions[qi];
      ctx.sendState({ phase: 'question', qi: qi, total: questions.length, q: Q.q, choices: Q.choices, duration: duration });
      render();
      timer = setTimeout(function () { if (phase === 'question') reveal(); }, duration);
    }
    function maybeAllAnswered() {
      if (phase === 'question' && ctx.getRoster().length > 0 &&
          Object.keys(answers).length >= ctx.getRoster().length) reveal();
    }
    function reveal() {
      clearTimer();
      if (phase !== 'question') return;
      var Q = questions[qi];
      ctx.getRoster().forEach(function (n) {
        var a = answers[n];
        if (a) scores[n] = (scores[n] || 0) + calcScore(a.choice === Q.answer, a.elapsed, duration);
      });
      phase = 'reveal';
      ctx.sendState({ phase: 'reveal', qi: qi, answer: Q.answer });
      render();
    }
    function endGame() {
      clearTimer();
      phase = 'end';
      ctx.sendState({ phase: 'end', scores: scores });
      render();
    }

    ctx.on('join', function () { resync(); render(); });
    ctx.on('bye', function () { render(); });
    ctx.on('answer', function (p) {
      if (phase === 'question' && typeof p.choice === 'number') {
        answers[p.name] = { choice: p.choice, elapsed: p.elapsed };
        render(); maybeAllAnswered();
      }
    });
    function resync() {
      if (phase === 'question' || phase === 'reveal') {
        var Q = questions[qi];
        ctx.sendState({ phase: phase, qi: qi, total: questions.length, q: Q.q, choices: Q.choices,
                        duration: duration, answer: (phase === 'reveal' ? Q.answer : undefined) });
      }
    }
    render();
  }

  /* ---------------- 참가자 ---------------- */
  function joinView(ctx) {
    var cur = null, picked = null, qStart = 0, myScore = null;

    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div>' + esc(ctx.name) + ' 님, 들어왔어요!</div>' +
          '<div class="kp-dim">⚡ 스피드 퀴즈 — 빠를수록 점수가 높아요</div></div>';
        return;
      }
      if (cur.phase === 'question') {
        el.innerHTML =
          '<div class="kp-pmeta">문제 ' + (cur.qi + 1) + ' / ' + cur.total + ' · ⚡</div>' +
          (picked === null ? '<div class="kp-timerbar"><span style="animation-duration:' + (cur.duration || 12000) + 'ms"></span></div>' : '') +
          '<div class="kp-pq">' + esc(cur.q) + '</div>' +
          '<div class="kp-pchoices">' +
            cur.choices.map(function (c, i) {
              var sel = (picked === i) ? ' selected' : '';
              return '<button class="kp-pbtn kp-c' + i + sel + '" data-i="' + i + '">' +
                '<span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) + '</button>';
            }).join('') + '</div>' +
          (picked !== null ? '<div class="kp-locked">제출! ⚡ 빠를수록 점수↑ (공개를 기다려요)</div>' : '');
        if (picked === null) {
          [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (btn) {
            btn.onclick = function () {
              picked = parseInt(btn.getAttribute('data-i'), 10);
              var elapsed = Date.now() - qStart;
              ctx.answer({ choice: picked, elapsed: elapsed, qi: cur.qi });
              render();
            };
          });
        }
        return;
      }
      if (cur.phase === 'reveal') {
        var correct = cur.answer, right = (picked === correct);
        el.innerHTML =
          '<div class="kp-result ' + (picked === null ? 'kp-noans' : (right ? 'kp-right' : 'kp-wrong')) + '">' +
            (picked === null ? '⏳ 시간 초과' : (right ? '⭕ 정답!' : '❌ 아쉬워요')) + '</div>' +
          '<div class="kp-correctline">정답: ' + KEYS[correct] + ' ' + esc(cur.choices[correct]) + '</div>' +
          '<div class="kp-dim">다음 문제를 기다려요</div>';
        return;
      }
      if (cur.phase === 'end') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-big">🎉 끝!</div>' +
          (myScore !== null ? '<div class="kp-myscore">내 점수 ' + myScore + '점</div>' : '') +
          '<div class="kp-dim">잘했어요!</div></div>';
        return;
      }
    }

    ctx.on('state', function (p) {
      if (p.phase === 'question') {
        var isNew = !cur || cur.phase !== 'question' || cur.qi !== p.qi;
        cur = p;
        if (isNew) { picked = null; qStart = Date.now(); }
      } else if (p.phase === 'reveal') { cur = Object.assign({}, cur, p); }
      else if (p.phase === 'end') { cur = p; if (p.scores) myScore = p.scores[ctx.name] || 0; }
      render();
    });
    render();
  }

  window.Kple.register('speed_quiz', { host: hostView, join: joinView });
})();
