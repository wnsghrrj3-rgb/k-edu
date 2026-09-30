/* ============================================================================
   K-edu 케이플 보드게임 B2 — 🎴 윷놀이 (board_yut)   [2026-09-30]
   ----------------------------------------------------------------------------
   설계: kple/KPLE_보드게임_설계.md B2. 전통 판형 29칸(지름길 2), 2~4팀·팀당 말 4, 15분.
     턴 = 팀 교대, 주자 = 팀 내 순환. ① 게이트(주자 1인, 15s) 정답 → ② 윷 던지기(호스트 랜덤 BP-1: 도15/개35/걸35/윷10/모05)
     → ③ 어느 말을 움직일지 선택(선택 컨트롤러: 「새 말」 또는 판 위 말 무리) → 호스트 이동·판정(BP-2).
     잡기 = 상대 말 출발로 + 한 번 더 · 업기 = 같은 칸 우리 말이 뭉쳐 함께 이동 · 윷·모 = 한 번 더(게이트 없이 다시 던짐).
     빽도는 v1 제외. 말 4개 먼저 완주 승. 턴 상한 60 → 완주 수·진행도 순.
     지름길: 모서리 5·10 에 **멈춘** 말은 다음 이동 때 대각선으로, 중앙(C)에 멈춘 말은 골인 쪽 대각선으로. 지나가기만 하면 원래 길.
     무응답 15초 = 호스트가 첫 번째 선택지(BP-5). 늦은 입장 = 적은 팀. 모든 state 에 판 스냅샷(pieces)(BP-3). 정답은 gate_result 에서만.
   노드: o0(출발) o1..o19 · FIN · 대각 A: a1 a2 C a3 a4(5→15) · 대각 B: b1 b2 C b3 b4(10→0골인)
   config.questions · gateTimeout · pickTimeout · maxTurns · teams(2~4) · showMs(연출 단축)
   answer: { gate:seq, choice } | { pick:seq, opt:i }
   ============================================================================ */
(function () {
  if (!window.Kple || !window.KpleBoard) { console.error('[board_yut] kple-core.js·kple-board.js 먼저 로드'); return; }
  var B = window.KpleBoard, esc = B.esc;
  var SAMPLE = [
    { q: '7 + 8 은?', choices: ['13', '14', '15', '16'], answer: 2 }, { q: '우리나라의 수도는?', choices: ['부산', '서울', '대전', '인천'], answer: 1 },
    { q: '6 × 3 은?', choices: ['15', '16', '18', '21'], answer: 2 }, { q: '해가 뜨는 쪽은?', choices: ['서쪽', '남쪽', '북쪽', '동쪽'], answer: 3 },
    { q: '한글날은 몇 월?', choices: ['8월', '9월', '10월', '11월'], answer: 2 }, { q: '20 ÷ 4 는?', choices: ['4', '5', '6', '8'], answer: 1 }
  ];

  /* ── 판 그래프 ── */
  var NODES = {};   // id -> { x, y, next, short?, label }
  function N(id, x, y, next, short, label) { NODES[id] = { id: id, x: x, y: y, next: next, short: short || null, label: label || id }; }
  N('o0', 5, 5, 'o1', null, '출발'); N('o1', 5, 4, 'o2'); N('o2', 5, 3, 'o3'); N('o3', 5, 2, 'o4'); N('o4', 5, 1, 'o5');
  N('o5', 5, 0, 'o6', 'a1', '모서리'); N('o6', 4, 0, 'o7'); N('o7', 3, 0, 'o8'); N('o8', 2, 0, 'o9'); N('o9', 1, 0, 'o10');
  N('o10', 0, 0, 'o11', 'b1', '모서리'); N('o11', 0, 1, 'o12'); N('o12', 0, 2, 'o13'); N('o13', 0, 3, 'o14'); N('o14', 0, 4, 'o15');
  N('o15', 0, 5, 'o16', null, '모서리'); N('o16', 1, 5, 'o17'); N('o17', 2, 5, 'o18'); N('o18', 3, 5, 'o19'); N('o19', 4, 5, 'FIN');
  N('a1', 4, 1, 'a2', null, '지름길 1'); N('a2', 3, 2, 'C', null, '지름길 2'); N('C', 2.5, 2.5, 'a3', 'b3', '중앙'); N('a3', 2, 3, 'a4', null, '지름길 3'); N('a4', 1, 4, 'o15', null, '지름길 4');
  N('b1', 1, 1, 'b2', null, '지름길 1'); N('b2', 2, 2, 'C', null, '지름길 2'); N('b3', 3, 3, 'b4', null, '지름길 3'); N('b4', 4, 4, 'FIN', null, '지름길 4');
  var ORDER = Object.keys(NODES);
  var PROG = {}; ORDER.forEach(function (id, i) { PROG[id] = i; });   // 진행도(순위용) — 완주 = 100
  function stepFrom(node, prev, first) {
    if (first && NODES[node].short) return NODES[node].short;
    if (node === 'C' && prev === 'b2') return 'b3';
    return NODES[node].next;
  }
  function dest(from, steps) {          // from: 'start' | nodeId. → { to, path }
    var cur = from === 'start' ? 'o0' : from, prev = null, path = [];
    for (var i = 0; i < steps; i++) {
      var nx = stepFrom(cur, prev, i === 0 && from !== 'start');
      if (from === 'start' && i === 0) nx = 'o1';
      if (nx === 'FIN') return { to: 'FIN', path: path.concat(['FIN']) };
      prev = cur; cur = nx; path.push(cur);
    }
    return { to: cur, path: path };
  }

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var gateTimeout = ctx.config.gateTimeout || 15000, pickTimeout = ctx.config.pickTimeout || 15000, maxTurns = ctx.config.maxTurns || 60, showMs = ctx.config.showMs || 0;
    var phase = 'lobby', teamCount = ctx.config.teams || 2, teams = [], tm = null, pieces = [];   // pieces[t] = ['start'|node|'FIN' ×4]
    var qi = 0, gate = null, seq = 0, timer = null, moveTimer = null, turns = 0, last = null, thrown = null, options = [];

    function head() {
      return '<div class="kp-host-bar"><div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
        '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
        '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div></div>';
    }
    function present(t) { var r = ctx.getRoster(); return t.members.filter(function (m) { return r.indexOf(m) >= 0; }); }
    function done(t) { return pieces[t].filter(function (p) { return p === 'FIN'; }).length; }
    function snap() { return { teams: B.teams.pub(teams), pieces: pieces.map(function (a) { return a.slice(); }), turn: tm ? tm.team : 0, done: teams.map(function (_, i) { return done(i); }) }; }
    function push(extra) { ctx.sendState(Object.assign({ phase: phase }, snap(), extra || {})); }
    function clearTimers() { if (timer) { clearTimeout(timer); timer = null; } if (moveTimer) { clearTimeout(moveTimer); moveTimer = null; } if (gate) { gate.cancel(); gate = null; } }
    function buildOptions(t, steps) {     // 움직일 수 있는 무리 목록
      var opts = [], seen = {};
      pieces[t].forEach(function (p, i) {
        if (p === 'FIN' || seen[p]) return; seen[p] = 1;
        var idx = []; pieces[t].forEach(function (q, j) { if (q === p) idx.push(j); });
        if (p === 'start') idx = [idx[0]];                       // 새 말은 한 개씩 (출발선은 업기 아님)
        var d = dest(p, steps);
        opts.push({ from: p, idx: idx, to: d.to, label: (p === 'start' ? '새 말' : NODES[p].label === p ? p.replace(/^o/, '') + '번 칸' : NODES[p].label) + (idx.length > 1 ? ' (' + idx.length + '개 업음)' : '') + ' → ' + (d.to === 'FIN' ? '🏁 완주' : NODES[d.to].label === d.to ? d.to.replace(/^o/, '') + '번' : NODES[d.to].label) });
      });
      opts.sort(function (a, b) { return (a.from === 'start' ? 0 : 1) - (b.from === 'start' ? 0 : 1); });   // 「새 말」 항상 첫 번째(무응답 자동도 새 말)
      return opts;
    }

    function start() {
      teams = B.teams.build(ctx, teamCount); tm = B.turn(teams); pieces = teams.map(function () { return ['start', 'start', 'start', 'start']; }); turns = 0; qi = 0; last = null;
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
      if (ok) doThrow(); else { last = { kind: 'miss', team: tm.team, runner: runner }; phase = 'move'; push({ move: last }); render(); moveTimer = setTimeout(nextTeam, showMs || 1600); }
    }
    function doThrow() {
      clearTimers();
      thrown = B.yut.throw(); phase = 'throw';
      options = buildOptions(tm.team, thrown.steps);
      push({ throw: thrown, runner: tm.runner() }); render();
      moveTimer = setTimeout(askPick, showMs || 1800);
    }
    function askPick() {
      seq += 1; phase = 'pick';
      if (options.length === 1) { movePiece(0, true); return; }
      push({ pick: seq, runner: tm.runner(), options: options.map(function (o) { return o.label; }), throw: thrown }); render();
      timer = setTimeout(function () { if (phase === 'pick') movePiece(0, true); }, pickTimeout);   // BP-5
    }
    function movePiece(oi, auto) {
      if (phase !== 'pick' && phase !== 'throw') return;
      clearTimers(); phase = 'move';
      var t = tm.team, o = options[oi]; if (!o) { nextTeam(); return; }
      var captured = [];
      if (o.to !== 'FIN') teams.forEach(function (_, k) { if (k === t) return; pieces[k].forEach(function (p, j) { if (p === o.to) { pieces[k][j] = 'start'; captured.push({ team: k, i: j }); } }); });
      o.idx.forEach(function (j) { pieces[t][j] = o.to; });
      var again = thrown.again || captured.length > 0, finished = done(t) >= 4;
      last = { kind: 'move', team: t, runner: tm.runner(), from: o.from, to: o.to, n: o.idx.length, captured: captured, again: again, throw: thrown, auto: !!auto };
      push({ move: last }); render();
      if (finished) { moveTimer = setTimeout(endGame, showMs || 1800); return; }
      moveTimer = setTimeout(function () {
        if (again) { turns += 1; if (turns > maxTurns) { endGame(); return; } doThrow(); }   // 한 번 더 = 게이트 없이 다시 던짐
        else nextTeam();
      }, showMs || (captured.length ? 1800 : 1200));
    }
    function nextTeam() { tm.advanceRunner(); tm.next(); beginTurn(); }
    function progress(t) { return pieces[t].reduce(function (s, p) { return s + (p === 'FIN' ? 100 : p === 'start' ? 0 : PROG[p]); }, 0); }
    function ranking() {
      return teams.map(function (t, i) { return { i: i, name: t.name, emoji: t.emoji, color: t.color, done: done(i), prog: progress(i), label: '완주 ' + done(i) + '/4' }; })
        .sort(function (a, b) { return b.done - a.done || b.prog - a.prog; });
    }
    function endGame() {
      clearTimers(); phase = 'end';
      var rk = ranking(), tie = rk.length > 1 && rk[0].done === rk[1].done && rk[0].prog === rk[1].prog;
      push({ ranking: rk, tie: tie }); render(); if (!tie) B.end(ctx, rk);
    }
    function resync() {
      if (phase === 'lobby') return;
      if (phase === 'gate' && gate) push({ gate: gate.pub(), runner: tm.runner() });
      else if (phase === 'throw') push({ throw: thrown, runner: tm.runner() });
      else if (phase === 'pick') push({ pick: seq, runner: tm.runner(), options: options.map(function (o) { return o.label; }), throw: thrown });
      else if (phase === 'move') push({ move: last });
      else if (phase === 'end') push({ ranking: ranking() });
    }

    /* ── 화면 ── */
    function boardHTML() {
      var at = {}; teams.forEach(function (t, k) { pieces[k].forEach(function (p) { if (p !== 'start' && p !== 'FIN') (at[p] || (at[p] = [])).push(k); }); });
      var lastTo = last && last.kind === 'move' ? last.to : null;
      var html = '<div class="kpb-yut"><svg viewBox="0 0 100 100" class="kpb-yut-lines"><path d="M92 92 L92 8 L8 8 L8 92 Z M92 8 L8 92 M8 8 L92 92" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1.2"/></svg>';
      ORDER.forEach(function (id) {
        var n = NODES[id], big = n.short || id === 'o0' || id === 'o15';
        var ts = at[id] || [];
        html += '<div class="kpb-ynode' + (big ? ' big' : '') + (id === lastTo ? ' new' : '') + '" style="left:' + (8 + n.x * 16.8) + '%;top:' + (8 + n.y * 16.8) + '%">' +
          (ts.length ? ts.map(function (k) { return '<span class="kpb-ypiece" style="background:' + teams[k].color + '">' + teams[k].emoji + '</span>'; }).join('') : (id === 'o0' ? '🚩' : '')) + '</div>';
      });
      return html + '</div>';
    }
    function homeHTML() {
      return '<div class="kpb-yhome">' + teams.map(function (t, k) {
        return '<div class="kpb-yteam" style="border-color:' + t.color + '"><b style="color:' + t.color + '">' + t.emoji + ' ' + esc(t.name) + '</b> ' +
          pieces[k].map(function (p) { return '<span class="kpb-ymini' + (p === 'FIN' ? ' fin' : p === 'start' ? ' home' : ' out') + '">' + (p === 'FIN' ? '🏁' : p === 'start' ? '●' : '○') + '</span>'; }).join('') + '</div>'; }).join('') + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      var r = ctx.getRoster();
      if (phase === 'lobby') {
        el.innerHTML = head() + '<div class="kp-stage">' +
          '<div class="kp-big">🎴 윷놀이</div>' +
          '<div class="kp-dim" style="font-size:18px;margin:-6px 0 10px">맞히면 윷을 던져요 · 잡으면 한 번 더 · 말 4개 먼저 완주!</div>' +
          '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + r.length + '명</div>' +
          '<div class="kp-roster">' + (r.length ? r.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('') : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
          '<div class="kpb-gate">' + [2, 3, 4].map(function (k) { return '<button class="kp-btn' + (k === teamCount ? ' kp-go' : '') + '" data-tc="' + k + '">' + k + '팀</button>'; }).join('') + '</div>' +
          '<button class="kp-btn kp-go" id="kpStart"' + (r.length >= 2 ? '' : ' disabled') + '>게임 시작 ▶</button></div>';
        [].forEach.call(el.querySelectorAll('[data-tc]'), function (b) { b.onclick = function () { teamCount = +b.getAttribute('data-tc'); render(); }; });
        var s = el.querySelector('#kpStart'); if (s) s.onclick = start; return;
      }
      var t = teams[tm.team], banner = '';
      if (phase === 'gate') banner = '<div class="kpb-banner" style="color:' + t.color + '">' + t.emoji + ' ' + esc(tm.runner() || '') + ' 문제 푸는 중 ✍️</div><div class="kp-timerbar host"><span style="animation-duration:' + gateTimeout + 'ms"></span></div>';
      else if (phase === 'throw') banner = '<div class="kpb-banner" style="color:' + t.color + '"><span class="kpb-ythrow">🎴</span> ' + esc(thrown.name) + '! ' + thrown.steps + '칸' + (thrown.again ? ' · 한 번 더!' : '') + '</div>';
      else if (phase === 'pick') banner = '<div class="kpb-banner" style="color:' + t.color + '">' + esc(thrown.name) + ' ' + thrown.steps + '칸 — ' + esc(tm.runner() || '') + ' 어느 말을 움직일까?</div>';
      else if (phase === 'move' && last) { var lt = teams[last.team]; banner = '<div class="kpb-banner" style="color:' + lt.color + '">' + (last.kind === 'miss' ? '❌ ' + esc(last.runner) + ' 아쉬워요 — 다음 팀' : lt.emoji + (last.n > 1 ? ' 말 ' + last.n + '개 ' : ' ') + (last.to === 'FIN' ? '🏁 완주!' : '이동') + (last.captured.length ? ' · 💥 잡았다! 한 번 더' : last.again ? ' · 한 번 더' : '')) + '</div>'; }
      else if (phase === 'end') { var rk = ranking(); banner = '<div class="kp-big">' + (rk.length > 1 && rk[0].done === rk[1].done && rk[0].prog === rk[1].prog ? '🤝 무승부!' : '🏆 ' + rk[0].emoji + ' ' + esc(rk[0].name) + '팀 승리!') + '</div>' + B.rankHTML(rk); }
      el.innerHTML = head() + '<div class="kp-stage" style="padding-top:8px">' +
        B.teams.html(teams, phase === 'end' ? -1 : tm.team, function (tt, i) { return '완주 ' + done(i) + '/4'; }) + banner +
        (phase === 'end' ? '' : '<div class="kpb-ywrap">' + boardHTML() + homeHTML() + '</div>') + '</div>';
    }

    ctx.on('join', function (p) { if (phase !== 'lobby' && B.teams.of(teams, p.name) < 0) B.teams.add(teams, p.name); resync(); render(); });
    ctx.on('bye', function (p) {
      if (phase === 'lobby') { render(); return; }
      var wasRunner = tm.runner() === p.name; B.teams.remove(teams, p.name);
      if (phase === 'gate' && wasRunner && gate) gate.drop(p.name);
      else if (phase === 'pick' && wasRunner) movePiece(0, true);
      render();
    });
    ctx.on('answer', function (p) {
      if (p.__pty) return;
      if (phase === 'gate' && gate && typeof p.gate === 'number') { gate.onAnswer(p); return; }
      if (phase === 'pick' && p.pick === seq && p.name === tm.runner() && typeof p.opt === 'number' && options[p.opt]) movePiece(p.opt);
    });
    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var cur = null, answeredGate = -1, picked = -1;
    function myTeam() { return cur && cur.teams ? B.teams.of(cur.teams, ctx.name) : -1; }
    function homeLine() { var mi = myTeam(); if (mi < 0 || !cur.pieces) return ''; return '<div class="kp-dim" style="margin-bottom:6px">우리 말 ' + cur.pieces[mi].map(function (p) { return p === 'FIN' ? '🏁' : p === 'start' ? '●' : '○'; }).join(' ') + ' · 완주 ' + cur.done[mi] + '/4</div>'; }
    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') { B.phone.wait(el, esc(ctx.name) + ' 님, 들어왔어요!', '🎴 윷놀이 — 맞히고 던져요'); return; }
      var mi = myTeam(), mt = cur.teams[mi], tt = cur.teams[cur.turn], badge = B.phone.teamBadge(mt) + homeLine();
      if (cur.phase === 'gate') {
        var g = cur.gate;
        if (cur.runner === ctx.name && g && answeredGate !== g.gate) {
          B.phone.question(el, { q: g.q, choices: g.choices, timeout: g.timeout }, function (i) { answeredGate = g.gate; ctx.answer({ gate: g.gate, choice: i }); }, { head: badge + '<div class="kp-pmeta">🎯 내 차례! 맞히면 윷을 던져요</div>' });
          var lk = el.querySelector('#kpbLock'); if (lk) lk.textContent = ''; return;
        }
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(cur.runner || '') + (mi === cur.turn ? ' (우리 팀)' : '') + ' 문제 푸는 중' : '') + '</div></div>'; return;
      }
      if (cur.phase === 'gate_result') { var rs = cur.result; el.innerHTML = badge + '<div class="kp-result ' + (rs.ok ? 'kp-right' : 'kp-wrong') + '">' + (rs.ok ? '⭕' : '❌') + '</div><div class="kp-dim" style="text-align:center">' + esc(rs.runner) + (rs.ok ? ' 정답! 윷을 던져요' : ' 아쉬워요 — 다음 팀') + '</div>'; return; }
      if (cur.phase === 'throw') { el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big" style="font-size:44px">🎴 ' + esc(cur.throw.name) + '!</div><div>' + cur.throw.steps + '칸' + (cur.throw.again ? ' · 한 번 더!' : '') + '</div></div>'; return; }
      if (cur.phase === 'pick') {
        if (cur.runner === ctx.name && picked !== cur.pick) {
          el.innerHTML = badge + '<div class="kp-pmeta">🎴 ' + esc(cur.throw.name) + ' ' + cur.throw.steps + '칸 — 어느 말을 움직일까?</div>' +
            '<div class="kp-choices">' + cur.options.map(function (o, i) { return '<button class="kp-pbtn kp-c' + (i % 4) + '" data-i="' + i + '">' + esc(o) + '</button>'; }).join('') + '</div>';
          [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (b) { b.onclick = function () { picked = cur.pick; [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (x) { x.disabled = true; }); ctx.answer({ pick: cur.pick, opt: +b.getAttribute('data-i') }); }; });
          return;
        }
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(cur.runner || '') + ' 말 고르는 중' : '') + '</div></div>'; return;
      }
      if (cur.phase === 'move') { var m = cur.move, lt = cur.teams[m.team]; el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big" style="font-size:30px">' + (m.kind === 'miss' ? '❌ ' + esc(m.runner) + ' 아쉬워요' : lt.emoji + ' ' + (m.to === 'FIN' ? '🏁 완주!' : '이동') + (m.captured.length ? ' 💥 잡았다!' : '')) + '</div>' + (m.kind === 'move' && m.again ? '<div class="kp-dim">한 번 더!</div>' : '') + '</div>'; return; }
      if (cur.phase === 'end') { var rk = cur.ranking || [], place = -1; rk.forEach(function (x, i) { if (x.i === mi) place = i; }); el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big">' + (cur.tie ? '🤝 무승부!' : place === 0 ? '🏆 우리 팀 승리!' : place >= 0 ? '우리 팀 ' + (place + 1) + '등' : '🎉 끝!') + '</div></div>'; }
    }
    ctx.on('state', function (p) { if (!p.phase || p.__pty) return; cur = p; render(); });
    render();
  }

  window.Kple.register('board_yut', { host: hostView, join: joinView });
})();
