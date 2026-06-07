/* ============================================================================
   K-edu 케이플 게임 #1 — 객관식 퀴즈쇼 (quiz_show)
   ----------------------------------------------------------------------------
   만능 게임(전 과목 공용). 호스트가 문제를 한 개씩 공개하고, 참가자는 폰에서
   보기를 골라 답한다. 호스트 화면에 응답 수가 실시간으로 차오르고, 공개 누르면
   정답이 드러난다.

   문제 데이터(config.questions):
     [{ q:"질문", choices:["가","나","다","라"], answer:1 }]   answer = 정답 index

   사회적 비교 데미지 차단(불변 원칙 5):
     - 참가자 화면에는 본인 정오답만. 등수·꼴등·남의 점수 노출 X.
     - 호스트 화면에서도 1등 한 명 정도만 가볍게. 꼴등·전체 순위표 X.
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[quiz_show] kple-core.js 먼저 로드'); return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // 샘플 문제(일반 모드 PoC용) — 학습 모드면 config.questions 로 차시 덱 주입
  var SAMPLE = [
    { q: '5 + 3 은 얼마일까요?', choices: ['6', '7', '8', '9'], answer: 2 },
    { q: '가장 큰 수는?', choices: ['4', '9', '2', '7'], answer: 1 },
    { q: '10 - 4 는?', choices: ['5', '6', '7', '8'], answer: 1 }
  ];

  /* ---------------- 호스트(전자칠판) ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var phase = 'lobby';   // lobby → question → reveal → end
    var qi = -1;
    var answers = {};      // { name: choiceIndex } (현재 문제)
    var scores = {};       // { name: 점수 누적 }

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
            '<div class="kp-big">참가자 ' + roster.length + '명</div>' +
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
            '<div class="kp-qmeta">문제 ' + (qi + 1) + ' / ' + questions.length + '</div>' +
            '<div class="kp-q">' + esc(Q.q) + '</div>' +
            '<div class="kp-choices kp-host-choices">' +
              Q.choices.map(function (c, i) {
                return '<div class="kp-choice kp-c' + i + '"><span class="kp-ckey">' +
                  ['①', '②', '③', '④'][i] + '</span>' + esc(c) + '</div>';
              }).join('') + '</div>' +
            '<div class="kp-respbar"><b>' + responded + '</b> / ' + roster.length + ' 명 답함</div>' +
            '<button class="kp-btn kp-go" id="kpReveal">정답 공개 👀</button>' +
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
                var cnt = Object.keys(answers).filter(function (n) { return answers[n] === i; }).length;
                return '<div class="kp-choice kp-c' + i + cls + '"><span class="kp-ckey">' +
                  ['①', '②', '③', '④'][i] + '</span>' + esc(c) +
                  '<span class="kp-cnt">' + cnt + '명</span></div>';
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
            (top && topScore > 0 ? '<div class="kp-top">오늘의 퀴즈왕 👑 ' + esc(top) + ' (' + topScore + '점)</div>' : '') +
            '<div class="kp-dim">모두 잘했어요. 점수는 각자 화면에서 확인!</div>' +
          '</div>';
      }
    }

    function nextQuestion() {
      qi += 1; answers = {}; phase = 'question';
      var Q = questions[qi];
      ctx.sendState({ phase: 'question', qi: qi, total: questions.length,
                      q: Q.q, choices: Q.choices });
      render();
    }
    function reveal() {
      var Q = questions[qi];
      // 채점은 공개 시점에 딱 1회 (render 안에서 하면 재렌더마다 중복 가산됨)
      ctx.getRoster().forEach(function (n) {
        if (answers[n] === Q.answer) scores[n] = (scores[n] || 0) + 1;
      });
      phase = 'reveal';
      ctx.sendState({ phase: 'reveal', qi: qi, answer: Q.answer });
      render();
    }
    function endGame() {
      phase = 'end';
      // 참가자 본인 점수만 각자에게(개인화) — 전체 순위표는 안 보냄
      ctx.sendState({ phase: 'end', scores: scores });
      render();
    }

    ctx.on('join', function () { if (phase !== 'lobby') resync(); render(); });
    ctx.on('bye', function () { render(); });
    ctx.on('answer', function (p) {
      if (phase === 'question' && typeof p.choice === 'number') { answers[p.name] = p.choice; render(); }
    });

    function resync() {
      // 늦게 들어온 참가자에게 현재 문제 다시 던짐
      if (phase === 'question' || phase === 'reveal') {
        var Q = questions[qi];
        ctx.sendState({ phase: phase, qi: qi, total: questions.length, q: Q.q, choices: Q.choices,
                        answer: (phase === 'reveal' ? Q.answer : undefined) });
      }
    }

    render();
  }

  /* ---------------- 참가자(학생 폰) ---------------- */
  function joinView(ctx) {
    var cur = null;    // 현재 문제 state
    var picked = null; // 내가 고른 보기
    var myScore = null;

    function render() {
      var el = ctx.el; if (!el) return;

      if (!cur || cur.phase === 'lobby') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div>' + esc(ctx.name) + ' 님, 들어왔어요!</div>' +
          '<div class="kp-dim">선생님이 시작하면 문제가 나와요</div></div>';
        return;
      }

      if (cur.phase === 'question') {
        el.innerHTML =
          '<div class="kp-pmeta">문제 ' + (cur.qi + 1) + ' / ' + cur.total + '</div>' +
          '<div class="kp-pq">' + esc(cur.q) + '</div>' +
          '<div class="kp-pchoices">' +
            cur.choices.map(function (c, i) {
              var sel = (picked === i) ? ' selected' : '';
              return '<button class="kp-pbtn kp-c' + i + sel + '" data-i="' + i + '">' +
                '<span class="kp-ckey">' + ['①', '②', '③', '④'][i] + '</span>' + esc(c) + '</button>';
            }).join('') + '</div>' +
          (picked !== null ? '<div class="kp-locked">답 제출 완료 ✔ (선생님이 공개할 때까지 기다려요)</div>' : '');
        if (picked === null) {
          [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (btn) {
            btn.onclick = function () {
              picked = parseInt(btn.getAttribute('data-i'), 10);
              ctx.answer({ choice: picked, qi: cur.qi });
              render();
            };
          });
        }
        return;
      }

      if (cur.phase === 'reveal') {
        var correct = cur.answer;
        var right = (picked === correct);
        el.innerHTML =
          '<div class="kp-result ' + (picked === null ? 'kp-noans' : (right ? 'kp-right' : 'kp-wrong')) + '">' +
            (picked === null ? '⏳ 이번엔 못 골랐어요' : (right ? '⭕ 정답!' : '❌ 아쉬워요')) +
          '</div>' +
          '<div class="kp-correctline">정답: ' + ['①', '②', '③', '④'][correct] + ' ' + esc(cur.choices[correct]) + '</div>' +
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
      if (p.phase === 'question') { cur = p; if (p.qi !== (cur && cur.qi)) picked = null; picked = null; }
      else if (p.phase === 'reveal') { cur = Object.assign({}, cur, p); }
      else if (p.phase === 'end') { cur = p; if (p.scores) myScore = p.scores[ctx.name] || 0; }
      render();
    });
    ctx.on('roster', function () { /* PoC: 참가자는 명단 안 봄 */ });

    render();
  }

  window.Kple.register('quiz_show', { host: hostView, join: joinView });
})();
