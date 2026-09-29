/* ============================================================================
   K-edu 케이플 게임 #6 — 🔔 골든벨 (goldenbell)   [K2 · G5, 2026-09-29]
   ----------------------------------------------------------------------------
   교실 킬러 1순위. 속도 무관 · 정확도 게임(스피드퀴즈와 성격이 다름).
     - 전원 동시 응답 → 호스트가 공개하는 순간 오답자 탈락(관전 모드).
       탈락자는 채널을 유지한 채 관전 플래그만 켜짐(KP-2) — 문제는 계속 보이고
       리액션도 계속 보낼 수 있다(소외 방지).
     - 전원 오답 = 그 문제는 없던 걸로(아무도 안 떨어짐). 교실에서 "다 틀렸어!" 순간을
       탈락으로 끝내지 않기 위해.
     - 패자부활전: 생존자 ≤ 1/3(또는 0) 이고 탈락자가 있으면 호스트 버튼 → 탈락자만
       푸는 문제 1회 → 맞힌 사람만 복귀. 한 판에 1회.
     - 최후 1인 = 🔔 골든벨 세리머니(파티 레이어 champion 있으면 호출).
     - 문제가 다 떨어지면 남은 생존자 전원이 공동 골든벨.
   두 가지 답 방식(호스트 토글):
     - 4지선다(기본) — 덱 계약 그대로.  - ✍️ 주관식 — 폰에 글자를 써서 제출(진짜 골든벨 맛).
       주관식은 문제에 answerText 가 있을 때만 켜짐(공백·대소문자 무시 비교).
   KP-1: 공개 전 정답(index·글자)을 state 에 싣지 않는다. reveal 에서만 보낸다.

   config.questions: [{ q, choices:[...], answer:index, answerText?, hint? }]
   state:
     { phase:'lobby' }
     { phase:'question', qi, total, q, choices|null, write, alive[], dead[], revival }
     { phase:'reveal', qi, answer, answerText, alive[], dead[], out[], wiped, revival, backIn[] }
     { phase:'end', winners[], rounds, scores }
   answer: { qi, choice } 또는 { qi, text }
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[goldenbell] kple-core.js 먼저 로드'); return; }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function normAns(s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, '').replace(/[.。!?]/g, ''); }

  var KEYS = ['①', '②', '③', '④'];
  var SAMPLE = [
    { q: '우리나라의 수도는?', choices: ['부산', '서울', '대전', '인천'], answer: 1, answerText: '서울' },
    { q: '1주일은 며칠?', choices: ['5일', '6일', '7일', '10일'], answer: 2, answerText: '7' },
    { q: '물이 어는 온도는 몇 도?', choices: ['0도', '10도', '50도', '100도'], answer: 0, answerText: '0' },
    { q: '해가 뜨는 쪽은?', choices: ['서쪽', '남쪽', '북쪽', '동쪽'], answer: 3, answerText: '동쪽' },
    { q: '3 × 4 는?', choices: ['7', '12', '14', '16'], answer: 1, answerText: '12' }
  ];

  function hasChoices(Q) { return Q && Q.choices && Q.choices.length >= 2 && typeof Q.answer === 'number'; }
  function hasText(Q) { return Q && Q.answerText != null && String(Q.answerText).trim() !== ''; }

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var title = ctx.config.title || '';
    var phase = 'lobby', qi = -1;
    var write = false;              // ✍️ 주관식 모드
    var canWrite = questions.every(hasText);
    var alive = [], dead = [];      // 표시명 목록
    var started = false;
    var answers = {};               // name -> {choice|text}
    var revivalUsed = false, revival = false;   // 이번 문제가 패자부활전인가
    var lastOut = [], lastBackIn = [], lastWiped = false;
    var rounds = 0;                 // 진행한 문제 수(무효 포함)
    var survived = {};              // name -> 살아남은 라운드 수(순위용)
    var missed = [];                // K4: 문제별 오답 수 [{qi, q, wrong, total}]

    function roster() { return ctx.getRoster(); }
    function isAlive(n) { return alive.indexOf(n) >= 0; }
    function needRevival() {
      if (revivalUsed || !dead.length) return false;
      var n = alive.length + dead.length;
      return alive.length === 0 || alive.length <= Math.ceil(n / 3);
    }
    function party() { return ctx.party || null; }

    function head() {
      return '<div class="kp-host-bar">' +
          '<div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
            '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
          '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div>' +
        '</div>';
    }
    function chips(list, cls) {
      return list.map(function (n) { return '<span class="kp-chip ' + (cls || '') + '">' + esc(n) + '</span>'; }).join('');
    }
    function lifeBar() {
      return '<div class="kp-gb-life">' +
        '<span class="kp-gb-alive">🔔 생존 <b>' + alive.length + '</b>명</span>' +
        '<span class="kp-gb-dead">😵 탈락 <b>' + dead.length + '</b>명</span>' +
        (revivalUsed ? '<span class="kp-dim">패자부활 사용됨</span>' : '') +
      '</div>';
    }

    function render() {
      var el = ctx.el; if (!el) return;
      var r = roster();

      if (phase === 'lobby') {
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-big">🔔 골든벨</div>' +
            (title ? '<div class="kp-qmeta">' + esc(title) + ' · ' + questions.length + '문제</div>' : '<div class="kp-qmeta">' + questions.length + '문제 · 끝까지 살아남기</div>') +
            '<div class="kp-big" style="font-size:clamp(28px,5vw,46px)">참가자 ' + r.length + '명</div>' +
            '<div class="kp-roster">' + (r.length ? chips(r) : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
            (canWrite ? '<label class="kp-gb-toggle"><input type="checkbox" id="kpWrite"' + (write ? ' checked' : '') + '> ✍️ 주관식으로 (폰에 답을 써서 제출)</label>' : '') +
            '<button class="kp-btn kp-go" id="kpStart"' + (r.length ? '' : ' disabled') + '>골든벨 시작 🔔</button>' +
          '</div>';
        var w = el.querySelector('#kpWrite'); if (w) w.onchange = function () { write = !!w.checked; };
        var b = el.querySelector('#kpStart'); if (b) b.onclick = startGame;

      } else if (phase === 'question') {
        var Q = questions[qi];
        var takers = revival ? dead : alive;
        var responded = takers.filter(function (n) { return answers[n]; }).length;
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">' + (revival ? '🔥 패자부활전 — 탈락자만 답해요' : '문제 ' + (qi + 1) + ' / ' + questions.length) + (write ? ' · ✍️ 주관식' : '') + '</div>' +
            lifeBar() +
            '<div class="kp-q">' + esc(Q.q) + '</div>' +
            (write || !hasChoices(Q)
              ? '<div class="kp-gb-writehint">폰에 답을 써서 제출하는 중…</div>'
              : '<div class="kp-choices kp-host-choices">' + Q.choices.map(function (c, i) {
                  return '<div class="kp-choice kp-c' + i + '"><span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) + '</div>';
                }).join('') + '</div>') +
            '<div class="kp-respbar"><b>' + responded + '</b> / ' + takers.length + ' 명 답함</div>' +
            '<button class="kp-btn kp-go" id="kpReveal">정답 공개 👀</button>' +
          '</div>';
        var rv = el.querySelector('#kpReveal'); if (rv) rv.onclick = reveal;

      } else if (phase === 'reveal') {
        var Qr = questions[qi];
        var ansLine = (write || !hasChoices(Qr))
          ? '<div class="kp-correctline">정답: ' + esc(Qr.answerText) + '</div>'
          : '<div class="kp-choices kp-host-choices">' + Qr.choices.map(function (c, i) {
              var cls = (i === Qr.answer) ? ' kp-correct' : ' kp-faded';
              var cnt = Object.keys(answers).filter(function (n) { return answers[n].choice === i; }).length;
              return '<div class="kp-choice kp-c' + i + cls + '"><span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) +
                '<span class="kp-cnt">' + cnt + '명</span></div>';
            }).join('') + '</div>';
        var verdict;
        if (revival) verdict = lastBackIn.length
          ? '<div class="kp-gb-verdict back">🔥 부활! ' + chips(lastBackIn, 'kp-chip-back') + '</div>'
          : '<div class="kp-gb-verdict">아무도 부활하지 못했어요…</div>';
        else if (lastWiped) verdict = '<div class="kp-gb-verdict wipe">😱 전원 오답! 이 문제는 없던 걸로 — 아무도 안 떨어져요</div>';
        else if (lastOut.length) verdict = '<div class="kp-gb-verdict out">😵 탈락 ' + lastOut.length + '명 ' + chips(lastOut, 'kp-chip-out') + '</div>';
        else verdict = '<div class="kp-gb-verdict safe">🎉 전원 정답! 모두 살아남았어요</div>';

        var over = gameOver();
        var btns = '';
        if (over) btns = '<button class="kp-btn kp-go" id="kpEnd">결과 보기 🏁</button>';
        else {
          if (needRevival()) btns += '<button class="kp-btn kp-gb-revive" id="kpRevive">🔥 패자부활전</button> ';
          btns += '<button class="kp-btn kp-go" id="kpNext">다음 문제 ▶</button>';
        }
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">' + (revival ? '🔥 패자부활전' : '문제 ' + (qi + 1) + ' / ' + questions.length) + '</div>' +
            lifeBar() +
            '<div class="kp-q">' + esc(Qr.q) + '</div>' + ansLine + verdict +
            '<div class="kp-roster">' + chips(alive, 'kp-chip-alive') + '</div>' +
            '<div class="kp-gb-actions">' + btns + '</div>' +
          '</div>';
        var nx = el.querySelector('#kpNext'); if (nx) nx.onclick = nextQuestion;
        var rvb = el.querySelector('#kpRevive'); if (rvb) rvb.onclick = startRevival;
        var en = el.querySelector('#kpEnd'); if (en) en.onclick = endGame;

      } else if (phase === 'end') {
        var winners = alive.slice();
        var top3 = missed.filter(function (m) { return m.wrong > 0; })
          .sort(function (a, b) { return b.wrong - a.wrong; }).slice(0, 3);
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            (winners.length === 1
              ? '<div class="kp-big">🔔 골든벨을 울려라!</div><div class="kp-top">👑 ' + esc(winners[0]) + '</div>'
              : winners.length
                ? '<div class="kp-big">🔔 공동 골든벨!</div><div class="kp-roster">' + chips(winners, 'kp-chip-alive') + '</div>'
                : '<div class="kp-big">🔔 아쉽다!</div><div class="kp-dim">이번엔 골든벨이 울리지 않았어요 — 다음엔 꼭!</div>') +
            '<div class="kp-dim">' + rounds + '문제 진행</div>' +
            (top3.length ? '<div class="kp-gb-top3"><div class="kp-gb-top3-h">📌 우리 반이 많이 틀린 문제</div>' +
              top3.map(function (m, i) { return '<div class="kp-gb-top3-row"><b>' + (i + 1) + '</b> ' + esc(m.q) +
                ' <span class="kp-dim">— ' + m.wrong + '/' + m.total + '명 오답</span></div>'; }).join('') + '</div>' : '') +
          '</div>';
      }
    }

    function gameOver() {
      if (alive.length <= 1 && !needRevival()) return true;
      return qi >= questions.length - 1;
    }

    function stateForQuestion() {
      var Q = questions[qi];
      var useWrite = write || !hasChoices(Q);
      return { phase: 'question', qi: qi, total: questions.length, q: Q.q,
               choices: useWrite ? null : Q.choices, write: useWrite,
               alive: alive.slice(), dead: dead.slice(), revival: revival };   // KP-1: 정답 없음
    }
    function stateForReveal() {
      var Q = questions[qi];
      var useWrite = write || !hasChoices(Q);
      return { phase: 'reveal', qi: qi, total: questions.length, q: Q.q,
               choices: useWrite ? null : Q.choices, write: useWrite,
               answer: useWrite ? null : Q.answer, answerText: Q.answerText != null ? String(Q.answerText) : (hasChoices(Q) ? String(Q.choices[Q.answer]) : ''),
               alive: alive.slice(), dead: dead.slice(), out: lastOut.slice(), backIn: lastBackIn.slice(),
               wiped: lastWiped, revival: revival, over: gameOver() };
    }

    function startGame() {
      started = true;
      alive = roster().slice(); dead = [];
      alive.forEach(function (n) { survived[n] = 0; });
      var p = party();
      if (p && p.countdown) { p.countdown(3, nextQuestion); } else nextQuestion();
    }
    function nextQuestion() {
      if (qi >= questions.length - 1) { endGame(); return; }
      qi += 1; answers = {}; revival = false; phase = 'question';
      ctx.sendState(stateForQuestion());
      render();
    }
    function startRevival() {
      if (!needRevival()) return;
      if (qi >= questions.length - 1) { endGame(); return; }   // 문제가 없으면 부활전 불가
      qi += 1; answers = {}; revival = true; revivalUsed = true; phase = 'question';
      ctx.sendState(stateForQuestion());
      render();
    }
    function isCorrect(Q, a) {
      if (!a) return false;
      if (write || !hasChoices(Q)) return normAns(a.text) === normAns(Q.answerText);
      return a.choice === Q.answer;
    }
    function reveal() {
      if (phase !== 'question') return;
      var Q = questions[qi];
      lastOut = []; lastBackIn = []; lastWiped = false;
      rounds += 1;
      if (revival) {
        dead.forEach(function (n) { if (isCorrect(Q, answers[n])) lastBackIn.push(n); });
        lastBackIn.forEach(function (n) { dead.splice(dead.indexOf(n), 1); alive.push(n); survived[n] = (survived[n] || 0); });
      } else {
        var wrong = alive.filter(function (n) { return !isCorrect(Q, answers[n]); });
        missed.push({ qi: qi, q: Q.q, wrong: wrong.length, total: alive.length });
        if (wrong.length && wrong.length === alive.length) { lastWiped = true; }     // 전원 오답 = 무효
        else {
          lastOut = wrong;
          wrong.forEach(function (n) { alive.splice(alive.indexOf(n), 1); dead.push(n); });
        }
        alive.forEach(function (n) { survived[n] = (survived[n] || 0) + 1; });
      }
      phase = 'reveal';
      ctx.sendState(stateForReveal());
      var p = party(); if (p && p.setScores) { try { p.setScores(survived); } catch (e) {} }
      render();
    }
    function endGame() {
      phase = 'end'; revival = false;
      ctx.sendState({ phase: 'end', winners: alive.slice(), rounds: rounds, scores: survived });
      render();
      var p = party();
      if (p && alive.length === 1 && p.champion) { try { p.champion(alive[0]); } catch (e) {} }
    }
    function resync() {
      if (phase === 'question') ctx.sendState(stateForQuestion());
      else if (phase === 'reveal') ctx.sendState(stateForReveal());
      else if (phase === 'end') ctx.sendState({ phase: 'end', winners: alive.slice(), rounds: rounds, scores: survived });
    }

    ctx.on('join', function (p) {
      // 시작 뒤 새로 온 사람 = 관전(탈락 명단) → 패자부활전으로 들어올 수 있다. 재입장(같은 표시명)은 그대로.
      if (started && !isAlive(p.name) && dead.indexOf(p.name) < 0) dead.push(p.name);
      resync(); render();
    });
    ctx.on('bye', function () { render(); });
    ctx.on('answer', function (p) {
      if (phase !== 'question' || p.qi !== qi) return;
      var takers = revival ? dead : alive;
      if (takers.indexOf(p.name) < 0) return;                    // 관전자 답은 무시
      if (typeof p.choice === 'number') answers[p.name] = { choice: p.choice };
      else if (typeof p.text === 'string') answers[p.name] = { text: p.text };
      else return;
      render();
    });
    render();
  }

  /* ---------------- 참가자 ---------------- */
  function joinView(ctx) {
    var cur = null, picked = null, sentText = null;

    function me() { return ctx.name; }
    function amDead() { return cur && cur.dead && cur.dead.indexOf(me()) >= 0; }
    function amAlive() { return cur && cur.alive && cur.alive.indexOf(me()) >= 0; }
    function canAnswer() {
      if (!cur || cur.phase !== 'question') return false;
      return cur.revival ? amDead() : amAlive();
    }

    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div>' + esc(me()) + ' 님, 들어왔어요!</div>' +
          '<div class="kp-dim">🔔 골든벨 — 틀리면 탈락, 끝까지 살아남아요</div></div>';
        return;
      }
      var badge = amDead()
        ? '<div class="kp-gb-badge dead">😵 탈락 · 관전 중 (응원은 계속!)</div>'
        : (amAlive() ? '<div class="kp-gb-badge alive">🔔 생존 중</div>' : '<div class="kp-gb-badge dead">👀 관전 중</div>');

      if (cur.phase === 'question') {
        var meta = cur.revival ? '🔥 패자부활전' + (amDead() ? ' — 맞히면 복귀!' : '') : '문제 ' + (cur.qi + 1) + ' / ' + cur.total;
        var body;
        if (!canAnswer()) {
          body = '<div class="kp-pq">' + esc(cur.q) + '</div>' +
            (cur.choices ? '<div class="kp-pchoices">' + cur.choices.map(function (c, i) {
              return '<div class="kp-pbtn kp-c' + i + ' kp-gb-ro"><span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) + '</div>'; }).join('') + '</div>' : '') +
            '<div class="kp-dim">' + (cur.revival && amAlive() ? '탈락한 친구들이 부활에 도전 중이에요' : '친구들이 푸는 중이에요') + '</div>';
        } else if (cur.write || !cur.choices) {
          body = '<div class="kp-pq">' + esc(cur.q) + '</div>' +
            (sentText === null
              ? '<div class="kp-guess-row"><input class="kp-input" id="kpText" maxlength="30" placeholder="답을 써요" autocomplete="off">' +
                '<button class="kp-btn kp-go" id="kpSend">제출</button></div>'
              : '<div class="kp-locked">제출! 「' + esc(sentText) + '」 (공개를 기다려요)</div>');
        } else {
          body = '<div class="kp-pq">' + esc(cur.q) + '</div>' +
            '<div class="kp-pchoices">' + cur.choices.map(function (c, i) {
              var sel = (picked === i) ? ' selected' : '';
              return '<button class="kp-pbtn kp-c' + i + sel + '" data-i="' + i + '">' +
                '<span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) + '</button>';
            }).join('') + '</div>' +
            (picked !== null ? '<div class="kp-locked">제출! (공개를 기다려요)</div>' : '');
        }
        el.innerHTML = '<div class="kp-pmeta">' + meta + '</div>' + badge + body;
        if (canAnswer() && (cur.write || !cur.choices) && sentText === null) {
          var inp = el.querySelector('#kpText'), btn = el.querySelector('#kpSend');
          function send() {
            var v = (inp.value || '').trim(); if (!v) return;
            sentText = v; ctx.answer({ text: v, qi: cur.qi }); render();
          }
          btn.onclick = send;
          inp.onkeydown = function (e) { if (e.key === 'Enter') send(); };
          try { inp.focus(); } catch (e) {}
        } else if (canAnswer() && picked === null) {
          [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (b) {
            b.onclick = function () {
              picked = parseInt(b.getAttribute('data-i'), 10);
              ctx.answer({ choice: picked, qi: cur.qi });
              render();
            };
          });
        }
        return;
      }
      if (cur.phase === 'reveal') {
        var mine = null;  // 내 결과
        if (cur.revival) {
          if ((cur.backIn || []).indexOf(me()) >= 0) mine = '<div class="kp-result kp-right">🔥 부활! 다시 도전해요</div>';
          else if (amDead()) mine = '<div class="kp-result kp-wrong">아쉬워요… 계속 응원해요</div>';
          else mine = '<div class="kp-result kp-right">🔔 살아 있어요</div>';
        } else if ((cur.out || []).indexOf(me()) >= 0) {
          mine = '<div class="kp-result kp-wrong">😵 탈락… 관전하며 응원해요</div>';
        } else if (amAlive()) {
          mine = cur.wiped ? '<div class="kp-result kp-noans">😱 전원 오답! 세이프</div>' :
            '<div class="kp-result kp-right">⭕ 살아남았어요!</div>';
        } else {
          mine = '<div class="kp-result kp-noans">👀 관전 중</div>';
        }
        var ansTxt = cur.choices && typeof cur.answer === 'number'
          ? KEYS[cur.answer] + ' ' + esc(cur.choices[cur.answer]) : esc(cur.answerText || '');
        el.innerHTML = '<div class="kp-pmeta">' + (cur.revival ? '🔥 패자부활전' : '문제 ' + (cur.qi + 1) + ' / ' + cur.total) + '</div>' +
          mine + '<div class="kp-correctline">정답: ' + ansTxt + '</div>' +
          '<div class="kp-dim">🔔 생존 ' + (cur.alive || []).length + '명 · 😵 탈락 ' + (cur.dead || []).length + '명</div>' +
          '<div class="kp-dim">' + (cur.over ? '결과를 기다려요' : '다음 문제를 기다려요') + '</div>';
        return;
      }
      if (cur.phase === 'end') {
        var w = cur.winners || [];
        var winner = w.indexOf(me()) >= 0;
        el.innerHTML = '<div class="kp-wait">' +
          (winner ? '<div class="kp-big">🔔 골든벨!</div><div class="kp-myscore">' + (w.length === 1 ? '👑 최후의 1인!' : '공동 우승!') + '</div>'
                  : '<div class="kp-big">🏁 끝!</div><div class="kp-myscore">' + (cur.scores && cur.scores[me()] != null ? cur.scores[me()] + '문제 살아남음' : '') + '</div>') +
          '<div class="kp-dim">잘했어요!</div></div>';
      }
    }

    ctx.on('state', function (p) {
      if (p.phase === 'question') {
        var isNew = !cur || cur.phase !== 'question' || cur.qi !== p.qi;
        cur = p;
        if (isNew) { picked = null; sentText = null; }
      } else if (p.phase === 'reveal') { cur = Object.assign({}, cur, p); }
      else if (p.phase === 'end') { cur = p; }
      render();
    });
    render();
  }

  window.Kple.register('goldenbell', { host: hostView, join: joinView });
})();
