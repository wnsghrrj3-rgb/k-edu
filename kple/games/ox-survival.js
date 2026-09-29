/* ============================================================================
   K-edu 케이플 게임 #7 — ⭕❌ OX 서바이벌 (ox_survival)   [K2 · G7, 2026-09-29]
   ----------------------------------------------------------------------------
   골든벨의 빠른 워밍업 버전. 명제 하나 → 전원 O/X 선택.
     - 공개 전 호스트 화면에 **실시간 분포 바**(⭕ 62% : ❌ 38%) — 손 든 교실의 디지털판.
       이름은 안 보이고 비율만(동조 압력의 재미 + 사회적 비교 차단).
     - 공개 → 오답자 탈락(관전 플래그, KP-2). 전원 오답 = 무효(아무도 안 떨어짐).
     - 패자부활전 1회(생존자 ≤ 1/3 or 0) · 최후 1인 = 세리머니 · 문제 소진 = 공동 우승.
     - 타이머(기본 10초)로 텐션 유지 — 끝나면 자동 공개. 호스트 「지금 공개」도 가능.
   KP-1: 공개 전 정답(O/X)을 state 에 싣지 않는다.

   config.statements: [{ s, o:true|false, why? }]   (덱 → kple-deck.toGame('ox_survival') 가 변환)
   config.duration (ms, 기본 10000)
   state:
     { phase:'question', qi, total, s, alive[], dead[], revival, duration }
     { phase:'reveal',  qi, total, s, o, why, dist:{o,x}, alive[], dead[], out[], backIn[], wiped, revival, over }
     { phase:'end', winners[], rounds, scores }
   answer: { qi, ox:'o'|'x' }
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[ox_survival] kple-core.js 먼저 로드'); return; }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var SAMPLE = [
    { s: '거미는 곤충이다.', o: false, why: '곤충은 다리가 6개, 거미는 8개예요.' },
    { s: '1년은 12달이다.', o: true },
    { s: '태양은 서쪽에서 뜬다.', o: false, why: '해는 동쪽에서 떠서 서쪽으로 져요.' },
    { s: '물은 100도에서 끓는다.', o: true },
    { s: '고래는 물고기다.', o: false, why: '고래는 새끼를 낳고 젖을 먹이는 포유류예요.' },
    { s: '삼각형의 꼭짓점은 3개다.', o: true }
  ];

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var items = (ctx.config.statements && ctx.config.statements.length) ? ctx.config.statements : SAMPLE;
    var duration = ctx.config.duration || 10000;
    var title = ctx.config.title || '';
    var phase = 'lobby', qi = -1, timer = null;
    var alive = [], dead = [], started = false;
    var answers = {};                      // name -> 'o'|'x'
    var revivalUsed = false, revival = false;
    var lastOut = [], lastBackIn = [], lastWiped = false, lastDist = { o: 0, x: 0 };
    var rounds = 0, survived = {}, missed = [];

    function roster() { return ctx.getRoster(); }
    function isAlive(n) { return alive.indexOf(n) >= 0; }
    function party() { return ctx.party || null; }
    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function needRevival() {
      if (revivalUsed || !dead.length) return false;
      var n = alive.length + dead.length;
      return alive.length === 0 || alive.length <= Math.ceil(n / 3);
    }
    function takers() { return revival ? dead : alive; }
    function dist() {
      var o = 0, x = 0;
      takers().forEach(function (n) { if (answers[n] === 'o') o++; else if (answers[n] === 'x') x++; });
      return { o: o, x: x };
    }
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
    // 분포 바: 공개 전엔 비율만, 공개 후엔 정답 쪽 강조
    function distBar(d, revealO) {
      var n = d.o + d.x, po = n ? Math.round(d.o * 100 / n) : 50, px = 100 - po;
      var oCls = revealO === true ? ' win' : (revealO === false ? ' lose' : '');
      var xCls = revealO === false ? ' win' : (revealO === true ? ' lose' : '');
      return '<div class="kp-ox-dist">' +
        '<div class="kp-ox-seg o' + oCls + '" style="width:' + (n ? po : 50) + '%"><span>⭕ ' + (n ? po + '%' : '') + (n ? ' · ' + d.o + '명' : '') + '</span></div>' +
        '<div class="kp-ox-seg x' + xCls + '" style="width:' + (n ? px : 50) + '%"><span>❌ ' + (n ? px + '%' : '') + (n ? ' · ' + d.x + '명' : '') + '</span></div>' +
      '</div>';
    }

    function render() {
      var el = ctx.el; if (!el) return;
      var r = roster();
      if (phase === 'lobby') {
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-big">⭕❌ OX 서바이벌</div>' +
            '<div class="kp-qmeta">' + (title ? esc(title) + ' · ' : '') + items.length + '문제 · 틀리면 탈락</div>' +
            '<div class="kp-big" style="font-size:clamp(28px,5vw,46px)">참가자 ' + r.length + '명</div>' +
            '<div class="kp-roster">' + (r.length ? chips(r) : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
            '<button class="kp-btn kp-go" id="kpStart"' + (r.length ? '' : ' disabled') + '>시작 ▶</button>' +
          '</div>';
        var b = el.querySelector('#kpStart'); if (b) b.onclick = startGame;

      } else if (phase === 'question') {
        var Q = items[qi], d = dist(), tk = takers();
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">' + (revival ? '🔥 패자부활전 — 탈락자만 답해요' : '문제 ' + (qi + 1) + ' / ' + items.length) + '</div>' +
            lifeBar() +
            '<div class="kp-timerbar host"><span style="animation-duration:' + duration + 'ms"></span></div>' +
            '<div class="kp-q kp-ox-s">' + esc(Q.s) + '</div>' +
            distBar(d) +
            '<div class="kp-respbar"><b>' + (d.o + d.x) + '</b> / ' + tk.length + ' 명 답함</div>' +
            '<button class="kp-btn kp-go" id="kpReveal">지금 공개 👀</button>' +
          '</div>';
        var rv = el.querySelector('#kpReveal'); if (rv) rv.onclick = reveal;

      } else if (phase === 'reveal') {
        var Qr = items[qi];
        var verdict;
        if (revival) verdict = lastBackIn.length
          ? '<div class="kp-gb-verdict back">🔥 부활! ' + chips(lastBackIn, 'kp-chip-back') + '</div>'
          : '<div class="kp-gb-verdict">아무도 부활하지 못했어요…</div>';
        else if (lastWiped) verdict = '<div class="kp-gb-verdict wipe">😱 전원 오답! 이 문제는 없던 걸로</div>';
        else if (lastOut.length) verdict = '<div class="kp-gb-verdict out">😵 탈락 ' + lastOut.length + '명 ' + chips(lastOut, 'kp-chip-out') + '</div>';
        else verdict = '<div class="kp-gb-verdict safe">🎉 전원 정답!</div>';
        var over = gameOver(), btns = '';
        if (over) btns = '<button class="kp-btn kp-go" id="kpEnd">결과 보기 🏁</button>';
        else {
          if (needRevival()) btns += '<button class="kp-btn kp-gb-revive" id="kpRevive">🔥 패자부활전</button> ';
          btns += '<button class="kp-btn kp-go" id="kpNext">다음 문제 ▶</button>';
        }
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">' + (revival ? '🔥 패자부활전' : '문제 ' + (qi + 1) + ' / ' + items.length) + '</div>' +
            lifeBar() +
            '<div class="kp-q kp-ox-s">' + esc(Qr.s) + '</div>' +
            '<div class="kp-ox-answer ' + (Qr.o ? 'o' : 'x') + '">' + (Qr.o ? '⭕ 맞아요' : '❌ 틀려요') + '</div>' +
            (Qr.why ? '<div class="kp-correctline">' + esc(Qr.why) + '</div>' : '') +
            distBar(lastDist, !!Qr.o) + verdict +
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
              ? '<div class="kp-big">🏆 최후의 생존자!</div><div class="kp-top">👑 ' + esc(winners[0]) + '</div>'
              : winners.length
                ? '<div class="kp-big">🏆 끝까지 살아남았어요!</div><div class="kp-roster">' + chips(winners, 'kp-chip-alive') + '</div>'
                : '<div class="kp-big">🏁 끝!</div><div class="kp-dim">이번엔 생존자가 없어요 — 다음엔 꼭!</div>') +
            '<div class="kp-dim">' + rounds + '문제 진행</div>' +
            (top3.length ? '<div class="kp-gb-top3"><div class="kp-gb-top3-h">📌 우리 반이 많이 틀린 문제</div>' +
              top3.map(function (m, i) { return '<div class="kp-gb-top3-row"><b>' + (i + 1) + '</b> ' + esc(m.s) +
                ' <span class="kp-dim">— ' + m.wrong + '/' + m.total + '명 오답</span></div>'; }).join('') + '</div>' : '') +
          '</div>';
      }
    }

    function gameOver() {
      if (alive.length <= 1 && !needRevival()) return true;
      return qi >= items.length - 1;
    }
    function stateForQuestion() {
      return { phase: 'question', qi: qi, total: items.length, s: items[qi].s, duration: duration,
               alive: alive.slice(), dead: dead.slice(), revival: revival };   // KP-1: o 없음
    }
    function stateForReveal() {
      var Q = items[qi];
      return { phase: 'reveal', qi: qi, total: items.length, s: Q.s, o: !!Q.o, why: Q.why || '',
               dist: lastDist, alive: alive.slice(), dead: dead.slice(), out: lastOut.slice(),
               backIn: lastBackIn.slice(), wiped: lastWiped, revival: revival, over: gameOver() };
    }

    function startGame() {
      started = true;
      alive = roster().slice(); dead = [];
      alive.forEach(function (n) { survived[n] = 0; });
      var p = party();
      if (p && p.countdown) p.countdown(3, nextQuestion); else nextQuestion();
    }
    function openQuestion() {
      clearTimer();
      answers = {}; phase = 'question';
      ctx.sendState(stateForQuestion());
      render();
      timer = setTimeout(function () { if (phase === 'question') reveal(); }, duration);
    }
    function nextQuestion() {
      if (qi >= items.length - 1) { endGame(); return; }
      qi += 1; revival = false; openQuestion();
    }
    function startRevival() {
      if (!needRevival()) return;
      if (qi >= items.length - 1) { endGame(); return; }
      qi += 1; revival = true; revivalUsed = true; openQuestion();
    }
    function maybeAll() {
      if (phase !== 'question') return;
      var tk = takers();
      if (tk.length && tk.every(function (n) { return answers[n]; })) reveal();
    }
    function reveal() {
      clearTimer();
      if (phase !== 'question') return;
      var Q = items[qi], key = Q.o ? 'o' : 'x';
      lastOut = []; lastBackIn = []; lastWiped = false; lastDist = dist();
      rounds += 1;
      if (revival) {
        dead.forEach(function (n) { if (answers[n] === key) lastBackIn.push(n); });
        lastBackIn.forEach(function (n) { dead.splice(dead.indexOf(n), 1); alive.push(n); survived[n] = survived[n] || 0; });
      } else {
        var wrong = alive.filter(function (n) { return answers[n] !== key; });
        missed.push({ qi: qi, s: Q.s, wrong: wrong.length, total: alive.length });
        if (wrong.length && wrong.length === alive.length) lastWiped = true;
        else { lastOut = wrong; wrong.forEach(function (n) { alive.splice(alive.indexOf(n), 1); dead.push(n); }); }
        alive.forEach(function (n) { survived[n] = (survived[n] || 0) + 1; });
      }
      phase = 'reveal';
      ctx.sendState(stateForReveal());
      var p = party(); if (p && p.setScores) { try { p.setScores(survived); } catch (e) {} }
      render();
    }
    function endGame() {
      clearTimer();
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
      if (started && !isAlive(p.name) && dead.indexOf(p.name) < 0) dead.push(p.name);   // 늦은 입장 = 관전(부활 가능)
      resync(); render();
    });
    ctx.on('bye', function () { render(); });
    ctx.on('answer', function (p) {
      if (phase !== 'question' || p.qi !== qi) return;
      if (p.ox !== 'o' && p.ox !== 'x') return;
      if (takers().indexOf(p.name) < 0) return;
      if (answers[p.name]) return;                       // 한 번 고르면 끝(번복 없음)
      answers[p.name] = p.ox;
      render(); maybeAll();
    });
    render();
  }

  /* ---------------- 참가자 ---------------- */
  function joinView(ctx) {
    var cur = null, picked = null;
    function me() { return ctx.name; }
    function amDead() { return cur && cur.dead && cur.dead.indexOf(me()) >= 0; }
    function amAlive() { return cur && cur.alive && cur.alive.indexOf(me()) >= 0; }
    function canAnswer() { return cur && cur.phase === 'question' && (cur.revival ? amDead() : amAlive()); }

    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div>' + esc(me()) + ' 님, 들어왔어요!</div>' +
          '<div class="kp-dim">⭕❌ OX 서바이벌 — 맞으면 ⭕, 틀리면 ❌</div></div>';
        return;
      }
      var badge = amDead()
        ? '<div class="kp-gb-badge dead">😵 탈락 · 관전 중 (응원은 계속!)</div>'
        : (amAlive() ? '<div class="kp-gb-badge alive">🔔 생존 중</div>' : '<div class="kp-gb-badge dead">👀 관전 중</div>');
      var meta = cur.revival ? '🔥 패자부활전' + (amDead() ? ' — 맞히면 복귀!' : '') : '문제 ' + (cur.qi + 1) + ' / ' + cur.total;

      if (cur.phase === 'question') {
        var can = canAnswer();
        el.innerHTML = '<div class="kp-pmeta">' + meta + '</div>' + badge +
          (can && picked === null ? '<div class="kp-timerbar"><span style="animation-duration:' + (cur.duration || 10000) + 'ms"></span></div>' : '') +
          '<div class="kp-pq kp-ox-s">' + esc(cur.s) + '</div>' +
          '<div class="kp-ox-btns">' +
            '<button class="kp-ox-btn o' + (picked === 'o' ? ' selected' : '') + (can && picked === null ? '' : ' ro') + '" data-ox="o">⭕<span>맞아요</span></button>' +
            '<button class="kp-ox-btn x' + (picked === 'x' ? ' selected' : '') + (can && picked === null ? '' : ' ro') + '" data-ox="x">❌<span>틀려요</span></button>' +
          '</div>' +
          (picked !== null ? '<div class="kp-locked">제출! (공개를 기다려요)</div>' :
            (!can ? '<div class="kp-dim">' + (cur.revival && amAlive() ? '탈락한 친구들이 부활에 도전 중이에요' : '친구들이 고르는 중이에요') + '</div>' : ''));
        if (can && picked === null) {
          [].forEach.call(el.querySelectorAll('.kp-ox-btn'), function (b) {
            b.onclick = function () { picked = b.getAttribute('data-ox'); ctx.answer({ ox: picked, qi: cur.qi }); render(); };
          });
        }
        return;
      }
      if (cur.phase === 'reveal') {
        var mine;
        if (cur.revival) {
          if ((cur.backIn || []).indexOf(me()) >= 0) mine = '<div class="kp-result kp-right">🔥 부활! 다시 도전해요</div>';
          else if (amDead()) mine = '<div class="kp-result kp-wrong">아쉬워요… 계속 응원해요</div>';
          else mine = '<div class="kp-result kp-right">🔔 살아 있어요</div>';
        } else if ((cur.out || []).indexOf(me()) >= 0) mine = '<div class="kp-result kp-wrong">😵 탈락… 관전하며 응원해요</div>';
        else if (amAlive()) mine = cur.wiped ? '<div class="kp-result kp-noans">😱 전원 오답! 세이프</div>' : '<div class="kp-result kp-right">⭕ 살아남았어요!</div>';
        else mine = '<div class="kp-result kp-noans">👀 관전 중</div>';
        var d = cur.dist || { o: 0, x: 0 }, n = d.o + d.x, po = n ? Math.round(d.o * 100 / n) : 0;
        el.innerHTML = '<div class="kp-pmeta">' + meta + '</div>' + mine +
          '<div class="kp-correctline">' + (cur.o ? '⭕ 맞아요' : '❌ 틀려요') + (cur.why ? ' — ' + esc(cur.why) : '') + '</div>' +
          (n ? '<div class="kp-dim">⭕ ' + po + '% · ❌ ' + (100 - po) + '%</div>' : '') +
          '<div class="kp-dim">🔔 생존 ' + (cur.alive || []).length + '명 · 😵 탈락 ' + (cur.dead || []).length + '명</div>';
        return;
      }
      if (cur.phase === 'end') {
        var w = cur.winners || [], win = w.indexOf(me()) >= 0;
        el.innerHTML = '<div class="kp-wait">' +
          (win ? '<div class="kp-big">🏆 살아남았다!</div><div class="kp-myscore">' + (w.length === 1 ? '👑 최후의 1인!' : '공동 우승!') + '</div>'
               : '<div class="kp-big">🏁 끝!</div><div class="kp-myscore">' + (cur.scores && cur.scores[me()] != null ? cur.scores[me()] + '문제 살아남음' : '') + '</div>') +
          '<div class="kp-dim">잘했어요!</div></div>';
      }
    }
    ctx.on('state', function (p) {
      if (p.phase === 'question') {
        var isNew = !cur || cur.phase !== 'question' || cur.qi !== p.qi;
        cur = p; if (isNew) picked = null;
      } else if (p.phase === 'reveal') cur = Object.assign({}, cur, p);
      else if (p.phase === 'end') cur = p;
      render();
    });
    render();
  }

  window.Kple.register('ox_survival', { host: hostView, join: joinView });
})();
