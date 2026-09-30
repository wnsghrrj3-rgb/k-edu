/* ============================================================================
   K-edu 케이플 보드게임 B4 — ✏️ 땅따먹기 (board_boxes)   [2026-09-30]
   ----------------------------------------------------------------------------
   설계: kple/KPLE_보드게임_설계.md B4. 점과 선(Dots and Boxes, 퍼블릭 도메인). 점 6×5 → 상자 5×4 = 20개, 선 49개. 2~3팀.
     턴 = 팀 교대, 주자 = 팀 내 순환. ① 게이트(주자 1인, 15s) 정답 → ② 선 1개 긋기(선택 컨트롤러 = 격자 9×11 의 선 슬롯 탭)
     상자 완성 = 팀 색 칠 + 1점 + **한 번 더**(같은 주자). 오답·시간 끝 = 다음 팀. 상자 20개 소진 → 많은 팀 승(동점 무승부).
     무응답 15초 = 호스트가 빈 선 아무 데나(BP-5). 판정 = 호스트(BP-2). 모든 state 에 판 스냅샷(h·v·box)(BP-3). 턴 상한 80.
   좌표: h[r][c] 가로선 (r 0..4, c 0..4) · v[r][c] 세로선 (r 0..3, c 0..5) · box[r][c] (r 0..3, c 0..4)
   폰/호스트 격자 = (2R+1)×(2C+1) = 9×11: (짝,짝) 점 · (짝,홀) 가로선 · (홀,짝) 세로선 · (홀,홀) 상자
   config.questions · gateTimeout · pickTimeout · maxTurns · teams(2~3)
   answer: { gate:seq, choice } | { pick:seq, r, c }  (격자 좌표)
   ============================================================================ */
(function () {
  if (!window.Kple || !window.KpleBoard) { console.error('[board_boxes] kple-core.js·kple-board.js 먼저 로드'); return; }
  var B = window.KpleBoard, esc = B.esc;
  var BR = 4, BC = 5, GR = 2 * BR + 1, GC = 2 * BC + 1;
  var SAMPLE = [
    { q: '7 + 8 은?', choices: ['13', '14', '15', '16'], answer: 2 }, { q: '우리나라의 수도는?', choices: ['부산', '서울', '대전', '인천'], answer: 1 },
    { q: '6 × 3 은?', choices: ['15', '16', '18', '21'], answer: 2 }, { q: '해가 뜨는 쪽은?', choices: ['서쪽', '남쪽', '북쪽', '동쪽'], answer: 3 },
    { q: '20 ÷ 4 는?', choices: ['4', '5', '6', '8'], answer: 1 }, { q: '물이 어는 온도는?', choices: ['0도', '10도', '50도', '100도'], answer: 0 }
  ];
  function kindOf(r, c) { var re = r % 2 === 0, ce = c % 2 === 0; return re && ce ? 'dot' : re ? 'h' : ce ? 'v' : 'box'; }

  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var gateTimeout = ctx.config.gateTimeout || 15000, pickTimeout = ctx.config.pickTimeout || 15000, maxTurns = ctx.config.maxTurns || 80, showMs = ctx.config.showMs || 0;   // showMs: 연출 대기 배율(테스트용 단축)
    var phase = 'lobby', teamCount = Math.min(3, ctx.config.teams || 2), teams = [], tm = null, scores = [];
    var h = [], v = [], box = [], qi = 0, gate = null, seq = 0, timer = null, moveTimer = null, turns = 0, last = null;

    function head() {
      return '<div class="kp-host-bar"><div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
        '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
        '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div></div>';
    }
    function present(t) { var r = ctx.getRoster(); return t.members.filter(function (m) { return r.indexOf(m) >= 0; }); }
    function mk(r, c, val) { var o = []; for (var i = 0; i < r; i++) { o.push([]); for (var j = 0; j < c; j++) o[i].push(val); } return o; }
    function snap() { return { teams: B.teams.pub(teams), scores: scores.slice(), turn: tm ? tm.team : 0, h: h, v: v, box: box, gr: GR, gc: GC, left: leftBoxes() }; }
    function push(extra) { ctx.sendState(Object.assign({ phase: phase }, snap(), extra || {})); }
    function leftBoxes() { var n = 0; box.forEach(function (row) { row.forEach(function (b) { if (b < 0) n++; }); }); return n; }
    function clearTimers() { if (timer) { clearTimeout(timer); timer = null; } if (moveTimer) { clearTimeout(moveTimer); moveTimer = null; } if (gate) { gate.cancel(); gate = null; } }
    function freeLines() { var o = []; for (var r = 0; r < GR; r++) for (var c = 0; c < GC; c++) { var k = kindOf(r, c); if ((k === 'h' && !h[r / 2][(c - 1) / 2]) || (k === 'v' && !v[(r - 1) / 2][c / 2])) o.push([r, c]); } return o; }
    function boxDone(r, c) { return h[r][c] && h[r + 1][c] && v[r][c] && v[r][c + 1]; }

    function start() {
      teams = B.teams.build(ctx, teamCount); tm = B.turn(teams); scores = teams.map(function () { return 0; }); turns = 0; qi = 0; last = null;
      h = mk(BR + 1, BC, 0); v = mk(BR, BC + 1, 0); box = mk(BR, BC, -1);
      var p = ctx.party;
      if (p && p.countdown) { try { p.countdown(3, beginTurn); return; } catch (e) {} }
      beginTurn();
    }
    function beginTurn() {
      clearTimers();
      turns += 1; if (turns > maxTurns) { endGame(); return; }
      var t = teams[tm.team];
      if (!present(t).length) { if (teams.every(function (x) { return !present(x).length; })) { endGame(); return; } tm.next(); beginTurn(); return; }
      if (present(t).indexOf(tm.runner()) < 0) tm.advanceRunner();
      phase = 'gate';
      var Q = questions[qi % questions.length]; qi += 1;
      gate = B.qgate({ members: present(t), runner: tm.runner(), question: Q, timeout: gateTimeout, mode: 'runner', onDone: onGate });
      push({ gate: gate.pub(), runner: tm.runner() }); render();
    }
    function onGate(res) {
      gate = null; var runner = tm.runner(), ok = res.grade === 'all';
      ctx.sendState(Object.assign({ phase: 'gate_result' }, snap(), { result: { ok: ok, runner: runner, answer: res.answer } }));
      if (ok) askPick(); else { last = { kind: 'miss', team: tm.team, runner: runner }; tm.advanceRunner(); phase = 'move'; render(); moveTimer = setTimeout(function () { tm.next(); beginTurn(); }, showMs || 1600); }
    }
    function askPick() {
      seq += 1; phase = 'pick';
      push({ pick: seq, runner: tm.runner() }); render();
      timer = setTimeout(function () { if (phase === 'pick') { var f = freeLines(); var x = f[Math.floor(Math.random() * f.length)]; draw(x[0], x[1], true); } }, pickTimeout);   // BP-5
    }
    function draw(r, c, auto) {
      if (phase !== 'pick') return;
      var k = kindOf(r, c); if (k !== 'h' && k !== 'v') return;
      if (k === 'h') { if (h[r / 2][(c - 1) / 2]) return; h[r / 2][(c - 1) / 2] = 1; } else { if (v[(r - 1) / 2][c / 2]) return; v[(r - 1) / 2][c / 2] = 1; }
      clearTimers();
      var t = tm.team, got = [];
      if (k === 'h') { var hr = r / 2, hc = (c - 1) / 2; if (hr > 0 && box[hr - 1][hc] < 0 && boxDone(hr - 1, hc)) got.push([hr - 1, hc]); if (hr < BR && box[hr][hc] < 0 && boxDone(hr, hc)) got.push([hr, hc]); }
      else { var vr = (r - 1) / 2, vc = c / 2; if (vc > 0 && box[vr][vc - 1] < 0 && boxDone(vr, vc - 1)) got.push([vr, vc - 1]); if (vc < BC && box[vr][vc] < 0 && boxDone(vr, vc)) got.push([vr, vc]); }
      got.forEach(function (b) { box[b[0]][b[1]] = t; }); scores[t] += got.length;
      last = { kind: 'line', team: t, runner: tm.runner(), r: r, c: c, got: got, auto: !!auto };
      phase = 'move'; push({ move: last }); render();
      if (got.length) { var p = ctx.party; if (p && p.setScores) { try { var m = {}; teams.forEach(function (tt, k2) { tt.members.forEach(function (n) { m[n] = scores[k2] * 100 / tt.members.length; }); }); p.setScores(m); } catch (e) {} } }
      if (!leftBoxes()) { moveTimer = setTimeout(endGame, showMs || 1800); return; }
      moveTimer = setTimeout(function () {
        if (got.length) { turns += 1; if (turns > maxTurns) { endGame(); return; } askPick(); }   // 한 번 더 = 같은 주자, 게이트 없이 선 하나 더
        else { tm.advanceRunner(); tm.next(); beginTurn(); }
      }, showMs || (got.length ? 1200 : 1000));
    }
    function ranking() { return teams.map(function (t, i) { return { i: i, name: t.name, emoji: t.emoji, color: t.color, score: scores[i], label: scores[i] + '칸' }; }).sort(function (a, b) { return b.score - a.score; }); }
    function endGame() {
      clearTimers(); phase = 'end';
      var rk = ranking(), tie = rk.length > 1 && rk[0].score === rk[1].score;
      push({ ranking: rk, tie: tie }); render(); if (!tie) B.end(ctx, rk);
    }
    function resync() {
      if (phase === 'lobby') return;
      if (phase === 'gate' && gate) push({ gate: gate.pub(), runner: tm.runner() });
      else if (phase === 'pick') push({ pick: seq, runner: tm.runner() });
      else if (phase === 'move') push({ move: last });
      else if (phase === 'end') push({ ranking: ranking() });
    }

    function boardHTML() {
      var ln = last && last.kind === 'line' ? last : null;
      return '<div class="kpb-dots">' + B.grid.html(GR, GC, function (r, c) {
        var k = kindOf(r, c);
        if (k === 'dot') return '<span class="kpb-dot"></span>';
        if (k === 'box') { var o = box[(r - 1) / 2][(c - 1) / 2]; return o < 0 ? '' : '<span class="kpb-box" style="background:' + teams[o].color + '">' + teams[o].emoji + '</span>'; }
        var on = k === 'h' ? h[r / 2][(c - 1) / 2] : v[(r - 1) / 2][c / 2];
        return '<span class="kpb-line ' + k + (on ? ' on' : '') + (ln && ln.r === r && ln.c === c ? ' new' : '') + '"></span>';
      }) + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      var r = ctx.getRoster();
      if (phase === 'lobby') {
        el.innerHTML = head() + '<div class="kp-stage">' +
          '<div class="kp-big">✏️ 땅따먹기</div>' +
          '<div class="kp-dim" style="font-size:18px;margin:-6px 0 10px">맞히면 선 하나 · 상자를 완성하면 내 땅 + 한 번 더 · 20칸 중 많이 차지한 팀 승</div>' +
          '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + r.length + '명</div>' +
          '<div class="kp-roster">' + (r.length ? r.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('') : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
          '<div class="kpb-gate">' + [2, 3].map(function (k) { return '<button class="kp-btn' + (k === teamCount ? ' kp-go' : '') + '" data-tc="' + k + '">' + k + '팀</button>'; }).join('') + '</div>' +
          '<button class="kp-btn kp-go" id="kpStart"' + (r.length >= 2 ? '' : ' disabled') + '>게임 시작 ▶</button></div>';
        [].forEach.call(el.querySelectorAll('[data-tc]'), function (b) { b.onclick = function () { teamCount = +b.getAttribute('data-tc'); render(); }; });
        var s = el.querySelector('#kpStart'); if (s) s.onclick = start; return;
      }
      var t = teams[tm.team], banner = '';
      if (phase === 'gate') banner = '<div class="kpb-banner" style="color:' + t.color + '">' + t.emoji + ' ' + esc(tm.runner() || '') + ' 문제 푸는 중 ✍️</div><div class="kp-timerbar host"><span style="animation-duration:' + gateTimeout + 'ms"></span></div>';
      else if (phase === 'pick') banner = '<div class="kpb-banner" style="color:' + t.color + '">⭕ ' + esc(tm.runner() || '') + ' 선 긋는 중…</div>';
      else if (phase === 'move' && last) { var lt = teams[last.team]; banner = '<div class="kpb-banner" style="color:' + lt.color + '">' + (last.kind === 'miss' ? '❌ ' + esc(last.runner) + ' 아쉬워요 — 다음 팀' : (last.got.length ? '🎉 ' + lt.emoji + ' 상자 ' + last.got.length + '개 완성! 한 번 더' : lt.emoji + ' 선 하나' + (last.auto ? ' (시간 끝 · 자동)' : ''))) + '</div>'; }
      else if (phase === 'end') { var rk = ranking(); banner = '<div class="kp-big">' + (rk.length > 1 && rk[0].score === rk[1].score ? '🤝 무승부!' : '🏆 ' + rk[0].emoji + ' ' + esc(rk[0].name) + '팀 승리!') + '</div>' + B.rankHTML(rk); }
      el.innerHTML = head() + '<div class="kp-stage" style="padding-top:8px">' +
        B.teams.html(teams, phase === 'end' ? -1 : tm.team, function (tt, i) { return scores[i] + '칸'; }) +
        '<div class="kp-qmeta">남은 상자 ' + leftBoxes() + '</div>' + banner + (phase === 'end' ? '' : boardHTML()) + '</div>';
    }

    ctx.on('join', function (p) { if (phase !== 'lobby' && B.teams.of(teams, p.name) < 0) B.teams.add(teams, p.name); resync(); render(); });
    ctx.on('bye', function (p) {
      if (phase === 'lobby') { render(); return; }
      var wasRunner = tm.runner() === p.name; B.teams.remove(teams, p.name);
      if (phase === 'gate' && wasRunner && gate) gate.drop(p.name);
      else if (phase === 'pick' && wasRunner) { var f = freeLines(); var x = f[Math.floor(Math.random() * f.length)]; draw(x[0], x[1], true); }
      render();
    });
    ctx.on('answer', function (p) {
      if (p.__pty) return;
      if (phase === 'gate' && gate && typeof p.gate === 'number') { gate.onAnswer(p); return; }
      if (phase === 'pick' && p.pick === seq && p.name === tm.runner() && typeof p.r === 'number' && typeof p.c === 'number') draw(p.r, p.c);
    });
    render();
  }

  function joinView(ctx) {
    var cur = null, answeredGate = -1, picked = -1;
    function myTeam() { return cur && cur.teams ? B.teams.of(cur.teams, ctx.name) : -1; }
    function isOn(r, c) { var k = kindOf(r, c); return k === 'h' ? cur.h[r / 2][(c - 1) / 2] : k === 'v' ? cur.v[(r - 1) / 2][c / 2] : 0; }
    function label(r, c) { var k = kindOf(r, c); if (k === 'dot') return '•'; if (k === 'box') { var o = cur.box[(r - 1) / 2][(c - 1) / 2]; return o < 0 ? '' : cur.teams[o].emoji; } return isOn(r, c) ? (k === 'h' ? '━' : '┃') : ''; }
    function miniBoard() {
      if (!cur || !cur.h) return '';
      return '<div class="kpb-dots mini"><div class="kpb-pick" style="grid-template-columns:repeat(' + cur.gc + ',1fr)">' + (function () { var o = ''; for (var r = 0; r < cur.gr; r++) for (var c = 0; c < cur.gc; c++) { var k = kindOf(r, c); o += '<span class="kpb-dcell ' + k + (isOn(r, c) ? ' on' : '') + '">' + (k === 'box' ? label(r, c) : '') + '</span>'; } return o; })() + '</div></div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') { B.phone.wait(el, esc(ctx.name) + ' 님, 들어왔어요!', '✏️ 땅따먹기 — 맞히고 선 긋기'); return; }
      var mi = myTeam(), mt = cur.teams[mi], tt = cur.teams[cur.turn], badge = B.phone.teamBadge(mt);
      var scoreLine = mt ? '<div class="kp-dim" style="margin-bottom:6px">우리 팀 ' + cur.scores[mi] + '칸 · 남은 상자 ' + cur.left + '</div>' : '';
      if (cur.phase === 'gate') {
        var g = cur.gate;
        if (cur.runner === ctx.name && g && answeredGate !== g.gate) {
          B.phone.question(el, { q: g.q, choices: g.choices, timeout: g.timeout }, function (i) { answeredGate = g.gate; ctx.answer({ gate: g.gate, choice: i }); }, { head: badge + '<div class="kp-pmeta">🎯 내 차례! 맞히면 선을 그어요</div>' });
          var lk = el.querySelector('#kpbLock'); if (lk) lk.textContent = ''; return;
        }
        el.innerHTML = badge + scoreLine + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(cur.runner || '') + (mi === cur.turn ? ' (우리 팀)' : '') + ' 문제 푸는 중' : '') + '</div></div>' + miniBoard(); return;
      }
      if (cur.phase === 'gate_result') { var rs = cur.result; el.innerHTML = badge + '<div class="kp-result ' + (rs.ok ? 'kp-right' : 'kp-wrong') + '">' + (rs.ok ? '⭕' : '❌') + '</div><div class="kp-dim" style="text-align:center">' + esc(rs.runner) + (rs.ok ? ' 정답! 선을 그어요' : ' 아쉬워요 — 다음 팀') + '</div>' + miniBoard(); return; }
      if (cur.phase === 'pick') {
        if (cur.runner === ctx.name && picked !== cur.pick) {
          B.phone.pick(el, { rows: cur.gr, cols: cur.gc, label: label, enabled: function (r, c) { var k = kindOf(r, c); return (k === 'h' || k === 'v') && !isOn(r, c); } },
            function (r, c) { picked = cur.pick; ctx.answer({ pick: cur.pick, r: r, c: c }); render(); },
            { head: badge + '<div class="kp-pmeta">⭕ 어디에 선을 그을까? (빈 자리를 눌러요)</div>' });
          [].forEach.call(el.querySelectorAll('.kpb-pbtn'), function (b) { var k = kindOf(+b.getAttribute('data-r'), +b.getAttribute('data-c')); b.classList.add('kpb-dcell', k); if (isOn(+b.getAttribute('data-r'), +b.getAttribute('data-c'))) b.classList.add('on'); });
          el.querySelector('.kpb-pick').classList.add('kpb-dots-pick'); return;
        }
        el.innerHTML = badge + scoreLine + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(cur.runner || '') + ' 선 긋는 중' : '') + '</div></div>' + miniBoard(); return;
      }
      if (cur.phase === 'move') { var m = cur.move, lt = cur.teams[m.team]; el.innerHTML = badge + scoreLine + '<div class="kp-wait"><div class="kp-big" style="font-size:30px">' + (m.kind === 'miss' ? '❌ ' + esc(m.runner) + ' 아쉬워요' : (m.got.length ? '🎉 ' + lt.emoji + ' 상자 ' + m.got.length + '개!' : lt.emoji + ' 선 하나')) + '</div></div>' + miniBoard(); return; }
      if (cur.phase === 'end') { var rk = cur.ranking || [], place = -1; rk.forEach(function (x, i) { if (x.i === mi) place = i; }); el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big">' + (cur.tie ? '🤝 무승부!' : place === 0 ? '🏆 우리 팀 승리!' : place >= 0 ? '우리 팀 ' + (place + 1) + '등' : '🎉 끝!') + '</div>' + (mt ? '<div class="kp-dim">우리 땅 ' + cur.scores[mi] + '칸</div>' : '') + '</div>' + miniBoard(); }
    }
    ctx.on('state', function (p) { if (!p.phase || p.__pty) return; cur = p; render(); });
    render();
  }

  window.Kple.register('board_boxes', { host: hostView, join: joinView });
})();
