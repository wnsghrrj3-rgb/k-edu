/* ============================================================================
   K-edu 케이플 보드게임 B3 — 🔴 네 개 먼저 (board_four)   [2026-09-29]
   ----------------------------------------------------------------------------
   설계: kple/KPLE_보드게임_설계.md B3. 사목 계열(이름·아트 자체 — BP-6). 7×6 격자, 정확히 2팀, 템포 게임(8분).
     턴 = 팀 교대. 주자 = 팀 내 roster 순환(전원이 돌아가며 놓음 — 원칙 2).
     ① 게이트(주자 1인 모드, 15초): 주자 폰에만 문제 → 정답 = 열 고르기 / 오답·시간 끝 = 상대 턴
     ② 주자 폰 「열 선택」(선택 컨트롤러 1×7, 꽉 찬 열 비활성) → 호스트가 중력 낙하(BP-2) → 가로·세로·대각 4개 = 승
     ③ 판이 다 참 = 무승부 → 정답 수 많은 팀 승(그래도 같으면 공동). 무응답 15초 = 호스트가 빈 열 아무 데나(BP-5).
   모든 state 에 보드 스냅샷(cells·팀·턴·정답 수) 동봉(BP-3). 정답은 gate_result 에서만(KP-1).

   config.questions(4지선다) · config.gateTimeout(기본 15000) · config.pickTimeout(기본 15000) · config.maxTurns(기본 40 → 정답 수 승부)
   answer: { gate:seq, choice } | { pick:seq, col }
   ============================================================================ */
(function () {
  if (!window.Kple || !window.KpleBoard) { console.error('[board_four] kple-core.js·kple-board.js 먼저 로드'); return; }
  var B = window.KpleBoard, esc = B.esc;
  var ROWS = 6, COLS = 7, DISC = ['🔴', '🔵'];
  var SAMPLE = [
    { q: '7 + 8 은?', choices: ['13', '14', '15', '16'], answer: 2 },
    { q: '우리나라의 수도는?', choices: ['부산', '서울', '대전', '인천'], answer: 1 },
    { q: '6 × 3 은?', choices: ['15', '16', '18', '21'], answer: 2 },
    { q: '해가 뜨는 쪽은?', choices: ['서쪽', '남쪽', '북쪽', '동쪽'], answer: 3 },
    { q: '20 ÷ 4 는?', choices: ['4', '5', '6', '8'], answer: 1 },
    { q: '물이 어는 온도는?', choices: ['0도', '10도', '50도', '100도'], answer: 0 },
    { q: '30 - 12 는?', choices: ['16', '17', '18', '19'], answer: 2 },
    { q: '1주일은 며칠?', choices: ['5일', '6일', '7일', '10일'], answer: 2 }
  ];

  function winLine(cells, r, c, who) {
    var dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (var d = 0; d < dirs.length; d++) {
      var line = [[r, c]], dr = dirs[d][0], dc = dirs[d][1];
      for (var s = -1; s <= 1; s += 2) {
        var rr = r + dr * s, cc = c + dc * s;
        while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && cells[rr][cc] === who) { line.push([rr, cc]); rr += dr * s; cc += dc * s; }
      }
      if (line.length >= 4) return line;
    }
    return null;
  }

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var gateTimeout = ctx.config.gateTimeout || 15000, pickTimeout = ctx.config.pickTimeout || 15000, maxTurns = ctx.config.maxTurns || 40;   // 턴 상한(원칙 4: 한 판 상한) → 정답 수 승부
    var turns = 0;
    var phase = 'lobby', teams = [], tm = null, cells = [], qi = 0, gate = null, pickSeq = 0, pickTimer = null, moveTimer = null;
    var correctCount = [0, 0], last = null, winLineCells = null, winner = -1, lastGate = null;

    function head() {
      return '<div class="kp-host-bar"><div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
        '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
        '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div></div>';
    }
    function blank() { var g = []; for (var r = 0; r < ROWS; r++) { g.push([]); for (var c = 0; c < COLS; c++) g[r].push(-1); } return g; }
    function present(t) { var r = ctx.getRoster(); return t.members.filter(function (m) { return r.indexOf(m) >= 0; }); }
    function snap() { return { teams: B.teams.pub(teams), cells: cells, turn: tm ? tm.team : 0, round: tm ? tm.round : 0, correct: correctCount.slice(), rows: ROWS, cols: COLS, win: winLineCells, winner: winner }; }
    function push(extra) { ctx.sendState(Object.assign({ phase: phase }, snap(), extra || {})); }
    function clearTimers() { if (pickTimer) { clearTimeout(pickTimer); pickTimer = null; } if (moveTimer) { clearTimeout(moveTimer); moveTimer = null; } if (gate) { gate.cancel(); gate = null; } }
    function openCols() { var o = []; for (var c = 0; c < COLS; c++) if (cells[0][c] === -1) o.push(c); return o; }

    function start() {
      teams = B.teams.build(ctx, 2); tm = B.turn(teams); cells = blank(); turns = 0; correctCount = [0, 0]; qi = 0; last = null; winLineCells = null; winner = -1;
      var p = ctx.party;
      if (p && p.countdown) { try { p.countdown(3, beginTurn); return; } catch (e) {} }
      beginTurn();
    }
    function beginTurn() {
      clearTimers();
      turns += 1; if (turns > maxTurns) { endGame(); return; }
      var t = teams[tm.team];
      if (!present(t).length) { if (!present(teams[1 - tm.team]).length) { endGame(); return; } tm.next(); beginTurn(); return; }
      var runner = tm.runner(); if (present(t).indexOf(runner) < 0) { tm.advanceRunner(); runner = tm.runner(); }
      phase = 'gate';
      var Q = questions[qi % questions.length]; qi += 1;
      gate = B.qgate({ members: present(t), runner: runner, question: Q, timeout: gateTimeout, mode: 'runner', onDone: onGate });
      push({ gate: gate.pub(), runner: runner }); render();
    }
    function onGate(res) {
      gate = null;
      var runner = tm.runner(), ok = res.grade === 'all';
      if (ok) correctCount[tm.team] += 1;
      lastGate = { ok: ok, runner: runner, answer: res.answer };
      ctx.sendState(Object.assign({ phase: 'gate_result' }, snap(), { result: { ok: ok, runner: runner, answer: res.answer } }));
      if (ok) beginPick(runner);
      else { last = { kind: 'miss', team: tm.team, runner: runner }; tm.advanceRunner(); moveTimer = setTimeout(nextTurn, 1600); render(); }
    }
    function beginPick(runner) {
      phase = 'pick'; pickSeq += 1;
      push({ pick: pickSeq, runner: runner, open: openCols() }); render();
      pickTimer = setTimeout(function () { if (phase === 'pick') { var o = openCols(); drop(o[Math.floor(Math.random() * o.length)], true); } }, pickTimeout);   // BP-5
    }
    function drop(col, auto) {
      if (phase !== 'pick' || cells[0][col] !== -1) return;
      clearTimers();
      var r = ROWS - 1; while (cells[r][col] !== -1) r--;
      var who = tm.team; cells[r][col] = who;
      last = { kind: 'drop', team: who, runner: tm.runner(), row: r, col: col, auto: !!auto };
      tm.advanceRunner();
      var wl = winLine(cells, r, col, who);
      if (wl) { winLineCells = wl; winner = who; phase = 'move'; push({ move: last }); render(); moveTimer = setTimeout(endGame, 2000); return; }
      if (!openCols().length) { phase = 'move'; push({ move: last }); render(); moveTimer = setTimeout(endGame, 2000); return; }
      phase = 'move'; push({ move: last }); render();
      moveTimer = setTimeout(nextTurn, 1400);
    }
    function nextTurn() { tm.next(); beginTurn(); }
    function ranking() {
      var order = winner >= 0 ? [winner, 1 - winner] : (correctCount[0] === correctCount[1] ? [0, 1] : (correctCount[0] > correctCount[1] ? [0, 1] : [1, 0]));
      return order.map(function (i) { var t = teams[i]; return { i: i, name: t.name, emoji: t.emoji, color: t.color, correct: correctCount[i], label: winner === i ? '4개 완성!' : ('정답 ' + correctCount[i]) }; });
    }
    function endGame() {
      clearTimers(); phase = 'end';
      var rk = ranking(); push({ ranking: rk, tie: winner < 0 && correctCount[0] === correctCount[1] }); render();
      if (winner >= 0 || correctCount[0] !== correctCount[1]) B.end(ctx, rk);
    }
    function resync() {
      if (phase === 'lobby') return;
      if (phase === 'gate' && gate) push({ gate: gate.pub(), runner: tm.runner() });
      else if (phase === 'pick') push({ pick: pickSeq, runner: tm.runner(), open: openCols() });
      else if (phase === 'move') push({ move: last });
      else if (phase === 'end') push({ ranking: ranking() });
    }

    /* ── 화면 ── */
    function boardHTML() {
      var win = {}; (winLineCells || []).forEach(function (p) { win[p[0] + ',' + p[1]] = 1; });
      return '<div class="kpb-four">' + B.grid.html(ROWS, COLS, function (r, c) {
        var v = cells[r] ? cells[r][c] : -1; if (v < 0) return '';
        var isLast = last && last.kind === 'drop' && last.row === r && last.col === c;
        return '<span class="kpb-disc' + (isLast ? ' moved' : '') + (win[r + ',' + c] ? ' win' : '') + '" style="background:' + teams[v].color + '">' + teams[v].emoji + '</span>';
      }) + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      var r = ctx.getRoster();
      if (phase === 'lobby') {
        el.innerHTML = head() + '<div class="kp-stage">' +
          '<div class="kp-big">🔴 네 개 먼저</div>' +
          '<div class="kp-dim" style="font-size:18px;margin:-6px 0 10px">2팀 · 문제 맞히면 돌을 떨어뜨려요 · 가로·세로·대각 4개 먼저!</div>' +
          '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + r.length + '명</div>' +
          '<div class="kp-roster">' + (r.length ? r.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('') : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
          '<button class="kp-btn kp-go" id="kpStart"' + (r.length >= 2 ? '' : ' disabled') + '>게임 시작 ▶</button></div>';
        var s = el.querySelector('#kpStart'); if (s) s.onclick = start; return;
      }
      var t = teams[tm.team], banner = '';
      if (phase === 'gate') banner = '<div class="kpb-banner" style="color:' + t.color + '">' + t.emoji + ' ' + esc(tm.runner() || '') + ' 문제 푸는 중 ✍️</div><div class="kp-timerbar host"><span style="animation-duration:' + gateTimeout + 'ms"></span></div>';
      else if (phase === 'pick') banner = '<div class="kpb-banner" style="color:' + t.color + '">⭕ 정답! ' + esc(tm.runner() || '') + ' 열을 고르는 중…</div>';
      else if (phase === 'move' && last) {
        var lt = teams[last.team];
        banner = last.kind === 'miss' ? '<div class="kpb-banner" style="color:' + lt.color + '">❌ ' + esc(last.runner) + ' 아쉬워요 — 상대 팀 차례</div>'
          : '<div class="kpb-banner" style="color:' + lt.color + '">' + lt.emoji + ' ' + (last.auto ? '(시간 끝 · 자동) ' : '') + (last.col + 1) + '열!' + (winner >= 0 ? ' 🎉 4개 완성!' : '') + '</div>';
      } else if (phase === 'end') {
        var rk = ranking();
        banner = winner >= 0 ? '<div class="kp-big">🏆 ' + rk[0].emoji + ' ' + esc(rk[0].name) + '팀 승리!</div>'
          : '<div class="kp-big">🤝 ' + (openCols().length ? '턴 상한' : '판이 다 찼어요') + ' — ' + (correctCount[0] === correctCount[1] ? '무승부!' : rk[0].emoji + ' ' + esc(rk[0].name) + '팀 승리(정답 수)') + '</div>';
      }
      el.innerHTML = head() + '<div class="kp-stage" style="padding-top:8px">' +
        B.teams.html(teams, phase === 'end' ? -1 : tm.team, function (tt, i) { return DISC[i] + ' 정답 ' + correctCount[i]; }) +
        banner + boardHTML() + '</div>';
    }

    ctx.on('join', function (p) { if (phase !== 'lobby' && B.teams.of(teams, p.name) < 0) B.teams.add(teams, p.name); resync(); render(); });
    ctx.on('bye', function (p) {
      if (phase === 'lobby') { render(); return; }
      var wasRunner = tm.runner() === p.name;
      B.teams.remove(teams, p.name);
      if (phase === 'gate' && wasRunner && gate) gate.drop(p.name);
      else if (phase === 'pick' && wasRunner) { var o = openCols(); drop(o[Math.floor(Math.random() * o.length)], true); }
      render();
    });
    ctx.on('answer', function (p) {
      if (p.__pty) return;
      if (phase === 'gate' && gate && typeof p.gate === 'number') { gate.onAnswer(p); return; }
      if (phase === 'pick' && p.pick === pickSeq && p.name === tm.runner() && typeof p.col === 'number' && p.col >= 0 && p.col < COLS) drop(p.col);
    });
    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var cur = null, answeredGate = -1, picked = -1;
    function myTeam() { return cur && cur.teams ? B.teams.of(cur.teams, ctx.name) : -1; }
    function miniBoard() {
      if (!cur || !cur.cells) return '';
      return '<div class="kpb-four mini">' + B.grid.html(cur.rows, cur.cols, function (r, c) {
        var v = cur.cells[r][c]; return v < 0 ? '' : '<span class="kpb-disc" style="background:' + cur.teams[v].color + '"></span>'; }) + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') { B.phone.wait(el, esc(ctx.name) + ' 님, 들어왔어요!', '🔴 네 개 먼저 — 맞히고 떨어뜨려요'); return; }
      var mi = myTeam(), mt = cur.teams[mi], tt = cur.teams[cur.turn], badge = B.phone.teamBadge(mt);
      if (cur.phase === 'gate') {
        var g = cur.gate;
        if (cur.runner === ctx.name && g && answeredGate !== g.gate) {
          B.phone.question(el, { q: g.q, choices: g.choices, timeout: g.timeout }, function (i) { answeredGate = g.gate; ctx.answer({ gate: g.gate, choice: i }); }, { head: badge + '<div class="kp-pmeta">🎯 내 차례! 맞히면 돌을 놓아요</div>' });
          var lk = el.querySelector('#kpbLock'); if (lk) lk.textContent = '';
          return;
        }
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(cur.runner || '') + (mi === cur.turn ? ' (우리 팀) ' : '') + ' 문제 푸는 중' : '') + '</div></div>' + miniBoard();
        return;
      }
      if (cur.phase === 'gate_result') {
        var rs = cur.result;
        el.innerHTML = badge + '<div class="kp-result ' + (rs.ok ? 'kp-right' : 'kp-wrong') + '">' + (rs.ok ? '⭕' : '❌') + '</div><div class="kp-dim" style="text-align:center">' + esc(rs.runner) + (rs.ok ? ' 정답! 돌을 놓아요' : ' 아쉬워요 — 상대 팀 차례') + '</div>' + miniBoard();
        return;
      }
      if (cur.phase === 'pick') {
        if (cur.runner === ctx.name && picked !== cur.pick) {
          B.phone.pick(el, { rows: 1, cols: cur.cols, label: function (r, c) { return (c + 1) + '열'; }, enabled: function (r, c) { return cur.open.indexOf(c) >= 0; } },
            function (r, c) { picked = cur.pick; ctx.answer({ pick: cur.pick, col: c }); render(); },
            { head: badge + '<div class="kp-pmeta">⭕ 정답! 어느 열에 떨어뜨릴까?</div>' });
          el.insertAdjacentHTML('beforeend', miniBoard());
          return;
        }
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(cur.runner || '') + ' 열 고르는 중' : '') + '</div></div>' + miniBoard();
        return;
      }
      if (cur.phase === 'move') {
        var m = cur.move, lt = cur.teams[m.team];
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big" style="font-size:32px">' + (m.kind === 'miss' ? '❌ ' + esc(m.runner) + ' 아쉬워요' : lt.emoji + ' ' + (m.col + 1) + '열' + (cur.winner >= 0 ? ' 🎉 4개 완성!' : '')) + '</div></div>' + miniBoard();
        return;
      }
      if (cur.phase === 'end') {
        var rk = cur.ranking || [], place = -1; rk.forEach(function (x, i) { if (x.i === mi) place = i; });
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big">' + (cur.tie ? '🤝 무승부!' : place === 0 ? '🏆 우리 팀 승리!' : place >= 0 ? '우리 팀 2등' : '🎉 끝!') + '</div>' +
          (mt ? '<div class="kp-dim">우리 팀 정답 ' + cur.correct[mi] + '개</div>' : '') + '</div>' + miniBoard();
      }
    }
    ctx.on('state', function (p) { if (!p.phase || p.__pty) return; cur = p; render(); });
    render();
  }

  window.Kple.register('board_four', { host: hostView, join: joinView });
})();
