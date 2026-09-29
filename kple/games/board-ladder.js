/* ============================================================================
   K-edu 케이플 보드게임 B1 — 🪜 오르락 내리락 (board_ladder)   [G9 골든샘플, 2026-09-29]
   ----------------------------------------------------------------------------
   뱀과 사다리(퍼블릭 도메인) 교실판. 설계: kple/KPLE_보드게임_설계.md B1.
   보드 레이어(kple-board.js) 전 부품을 가장 단순하게 쓰는 조합 — 이 게임이 통과해야 B2~ 양산.

   턴 = 팀 순환. 턴마다:
     ① 문제 게이트(팀 전원): 그 팀 폰 전원에 문제 → 20초 → 등급
          전원 정답 = 🎲🎲 주사위 2개 · 과반 = 🎲 1개 · 미달 = 1칸만
     ② 주자(팀 roster 순환) 폰에 「🎲 굴리기」 큰 버튼 → 호스트가 굴림(BP-1) → 말 이동
          사다리 🪜 4개(오름) · 미끄럼 🛝 4개(내림) · 칸 이벤트 2개(🍀 +2칸 · 🔁 한 번 더)
     ③ 먼저 30 골인 승. 라운드 상한(config.maxRounds, 기본 12) 도달 = 위치 순 승부.
   무응답 15초 = 자동 굴림(BP-5). 늦은 입장 = 가장 적은 팀 뒤. 이탈 = 게이트 기대 목록에서 제거·주자면 자동 굴림.
   state 마다 보드 스냅샷(팀·위치·턴) 동봉(BP-3). 정답은 게이트 공개 때만(KP-1).

   config.questions(4지선다 덱 계약) · config.teams(2~4) · config.maxRounds · config.gateTimeout · config.rollTimeout
   answer: { gate:seq, choice }  |  { roll:seq }
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[board_ladder] kple-core.js 먼저 로드'); return; }
  if (!window.KpleBoard) { console.error('[board_ladder] kple-board.js 먼저 로드'); return; }
  var B = window.KpleBoard, esc = B.esc;

  var N = 30, COLS = 6;
  var LADDERS = { 3: 14, 9: 21, 16: 26, 19: 28 };
  var SLIDES = { 12: 2, 18: 6, 24: 13, 29: 17 };
  var EVENTS = { 7: { emoji: '🍀', kind: 'plus', n: 2, label: '🍀 행운! +2칸' }, 22: { emoji: '🔁', kind: 'again', label: '🔁 한 번 더!' } };
  var POWER = { all: { dice: 2, label: '전원 정답! 🎲🎲 주사위 2개' }, most: { dice: 1, label: '과반 정답 🎲 주사위 1개' }, few: { dice: 0, label: '아쉬워요 — 1칸만' } };
  var SAMPLE = [
    { q: '7 + 8 은?', choices: ['13', '14', '15', '16'], answer: 2 },
    { q: '우리나라의 수도는?', choices: ['부산', '서울', '대전', '인천'], answer: 1 },
    { q: '1주일은 며칠?', choices: ['5일', '6일', '7일', '10일'], answer: 2 },
    { q: '6 × 3 은?', choices: ['15', '16', '18', '21'], answer: 2 },
    { q: '해가 뜨는 쪽은?', choices: ['서쪽', '남쪽', '북쪽', '동쪽'], answer: 3 },
    { q: '20 ÷ 4 는?', choices: ['4', '5', '6', '8'], answer: 1 },
    { q: '물이 어는 온도는?', choices: ['0도', '10도', '50도', '100도'], answer: 0 },
    { q: '30 - 12 는?', choices: ['16', '17', '18', '19'], answer: 2 }
  ];

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var gateTimeout = ctx.config.gateTimeout || 20000, rollTimeout = ctx.config.rollTimeout || 15000;
    var maxRounds = ctx.config.maxRounds || 12;
    var lay = B.track.layout(N, COLS);
    var phase = 'lobby', teamCount = ctx.config.teams || 2;
    var teams = [], pos = [], tm = null, qi = 0;
    var gate = null, gateRes = null, rollSeq = 0, rollTimer = null, moveTimer = null;
    var last = null;              // 마지막 이동 { team, dice, from, to, via[] }
    var again = false;            // 🔁 한 번 더(게이트 없이 굴림)

    function head() {
      return '<div class="kp-host-bar"><div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
        '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
        '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div></div>';
    }
    function snap() {                     // BP-3 보드 스냅샷
      return { teams: B.teams.pub(teams), pos: pos.slice(), turn: tm ? tm.team : 0, round: tm ? tm.round : 0, maxRounds: maxRounds, n: N };
    }
    function push(extra) { ctx.sendState(Object.assign({ phase: phase }, snap(), extra || {})); }
    function tokens() { return teams.map(function (t, i) { return { pos: pos[i], emoji: t.emoji, color: t.color, name: t.name, moved: last && last.team === i }; }); }
    function boardHTML() { return B.track.html(lay, { ladders: LADDERS, slides: SLIDES, events: { 7: '🍀', 22: '🔁' }, tokens: tokens() }); }
    function present(t) { var r = ctx.getRoster(); return t.members.filter(function (m) { return r.indexOf(m) >= 0; }); }
    function clearTimers() { if (rollTimer) { clearTimeout(rollTimer); rollTimer = null; } if (moveTimer) { clearTimeout(moveTimer); moveTimer = null; } if (gate) { gate.cancel(); gate = null; } }

    /* ── 진행 ── */
    function start() {
      teams = B.teams.build(ctx, teamCount); pos = teams.map(function () { return 0; }); tm = B.turn(teams);
      qi = 0; last = null;
      var p = ctx.party;
      if (p && p.countdown) { try { p.countdown(3, beginTurn); return; } catch (e) {} }
      beginTurn();
    }
    function beginTurn() {
      clearTimers(); gateRes = null;
      var t = teams[tm.team];
      if (!present(t).length) { skipTurn(); return; }
      if (again) { again = false; beginRoll({ grade: 'again', label: '🔁 한 번 더! 🎲 주사위 1개', dice: 1 }); return; }
      phase = 'gate';
      var Q = questions[qi % questions.length]; qi += 1;
      gate = B.qgate({ members: present(t), question: Q, timeout: gateTimeout, mode: 'team', onDone: onGate });
      push({ gate: gate.pub() }); render();
    }
    function onGate(res) {
      gateRes = res; gate = null;
      var pw = POWER[res.grade];
      ctx.sendState(Object.assign({ phase: 'gate_result' }, snap(), { result: { grade: res.grade, correct: res.correct, wrong: res.wrong, answer: res.answer, label: pw.label } }));
      beginRoll({ grade: res.grade, label: pw.label, dice: pw.dice });
    }
    function beginRoll(pw) {
      phase = 'roll'; rollSeq += 1;
      var t = teams[tm.team], runner = tm.runner();
      if (present(t).indexOf(runner) < 0) { tm.advanceRunner(); runner = tm.runner(); }   // 주자 자리 비었으면 다음
      last = { power: pw };
      push({ roll: rollSeq, runner: runner, power: pw }); render();
      if (pw.dice === 0) { moveTimer = setTimeout(function () { doMove([], 1); }, 1800); return; }
      rollTimer = setTimeout(function () { if (phase === 'roll') doMove(B.dice.roll(pw.dice)); }, rollTimeout);   // BP-5
    }
    function doMove(dice, fixed) {
      if (phase !== 'roll') return;
      clearTimers();
      var ti = tm.team, from = pos[ti], steps = fixed || dice.reduce(function (a, b) { return a + b; }, 0);
      var to = Math.min(N, from + steps), via = [];
      if (to < N) {
        if (LADDERS[to]) { via.push({ kind: 'ladder', from: to, to: LADDERS[to] }); to = LADDERS[to]; }
        else if (SLIDES[to]) { via.push({ kind: 'slide', from: to, to: SLIDES[to] }); to = SLIDES[to]; }
        else if (EVENTS[to]) {
          var ev = EVENTS[to]; via.push({ kind: ev.kind, label: ev.label, from: to });
          if (ev.kind === 'plus') to = Math.min(N, to + ev.n);
          else if (ev.kind === 'again') again = true;
        }
      }
      pos[ti] = to; tm.advanceRunner();
      last = { team: ti, dice: dice, steps: steps, from: from, to: to, via: via };
      phase = 'move';
      push({ move: last }); render();
      if (to >= N) { moveTimer = setTimeout(endGame, 2200); return; }
      moveTimer = setTimeout(nextTurn, 2600);
    }
    function nextTurn() {
      if (!again) tm.next();
      if (tm.round > maxRounds) { endGame(); return; }
      beginTurn();
    }
    function skipTurn() { again = false; tm.next(); if (tm.round > maxRounds || teams.every(function (t) { return !present(t).length; })) { endGame(); return; } beginTurn(); }
    function ranking() {
      return teams.map(function (t, i) { return { i: i, name: t.name, emoji: t.emoji, color: t.color, pos: pos[i], label: pos[i] >= N ? '🏁 골인!' : pos[i] + '칸' }; })
        .sort(function (a, b) { return b.pos - a.pos; });
    }
    function endGame() {
      clearTimers(); phase = 'end';
      var rk = ranking();
      push({ ranking: rk }); render();
      B.end(ctx, rk);
    }
    function resync(name) {
      if (phase === 'lobby') return;
      if (phase === 'gate' && gate) push({ gate: gate.pub() });
      else if (phase === 'roll') push({ roll: rollSeq, runner: tm.runner(), power: last && last.power });
      else if (phase === 'move') push({ move: last });
      else if (phase === 'end') push({ ranking: ranking() });
    }

    /* ── 화면 ── */
    function render() {
      var el = ctx.el; if (!el) return;
      var r = ctx.getRoster();
      if (phase === 'lobby') {
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-big">🪜 오르락 내리락</div>' +
            '<div class="kp-dim" style="font-size:18px;margin:-6px 0 10px">팀 전원이 문제를 맞힐수록 주사위가 늘어요 · 사다리 타고 미끄럼 조심 · 먼저 골인!</div>' +
            '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + r.length + '명</div>' +
            '<div class="kp-roster">' + (r.length ? r.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('') : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
            '<div class="kpb-gate">' + [2, 3, 4].map(function (k) { return '<button class="kp-btn' + (k === teamCount ? ' kp-go' : '') + '" data-tc="' + k + '">' + k + '팀</button>'; }).join('') + '</div>' +
            '<button class="kp-btn kp-go" id="kpStart"' + (r.length >= 2 ? '' : ' disabled') + '>게임 시작 ▶</button>' +
          '</div>';
        [].forEach.call(el.querySelectorAll('[data-tc]'), function (b) { b.onclick = function () { teamCount = +b.getAttribute('data-tc'); render(); }; });
        var s = el.querySelector('#kpStart'); if (s) s.onclick = start;
        return;
      }
      var t = teams[tm.team];
      var banner = '', extra = '';
      if (phase === 'gate') {
        banner = '<div class="kpb-banner" style="color:' + t.color + '">' + t.emoji + ' ' + esc(t.name) + '팀 문제 푸는 중 ✍️</div>' +
          '<div class="kp-timerbar host"><span style="animation-duration:' + gateTimeout + 'ms"></span></div>' +
          '<div class="kp-dim" style="text-align:center">전원 정답 🎲🎲 · 과반 🎲 · 미달 1칸</div>';
      } else if (phase === 'roll') {
        var pw = last && last.power;
        banner = '<div class="kpb-banner" style="color:' + t.color + '">' + (pw ? pw.label : '') + '</div>' +
          (pw && pw.dice ? '<div class="kp-dim" style="text-align:center">🎲 ' + esc(tm.runner() || '') + ' 굴려요!</div>' : '');
      } else if (phase === 'move') {
        var m = last;
        banner = '<div class="kpb-banner" style="color:' + t.color + '">' + t.emoji + ' ' + esc(t.name) + '팀 ' + (m.dice.length ? B.dice.html(m.dice) : '') +
          m.from + ' → ' + m.to + '칸' + (m.to >= N ? ' 🏁 골인!' : '') + '</div>' +
          (m.via.length ? '<div class="kp-dim" style="text-align:center;font-size:20px">' + m.via.map(viaLabel).join(' · ') + '</div>' : '');
      } else if (phase === 'end') {
        var rk = ranking();
        banner = '<div class="kp-big">🏁 ' + rk[0].emoji + ' ' + esc(rk[0].name) + '팀 승리!</div>' + B.rankHTML(rk);
      }
      el.innerHTML = head() +
        '<div class="kp-stage" style="padding-top:8px">' +
          B.teams.html(teams, phase === 'end' ? -1 : tm.team, function (tt, i) { return pos[i] + '칸'; }) +
          '<div class="kp-qmeta">라운드 ' + Math.min(tm.round, maxRounds) + ' / ' + maxRounds + '</div>' +
          banner + (phase === 'end' ? '' : boardHTML()) + extra +
        '</div>';
    }
    function viaLabel(v) {
      if (v.kind === 'ladder') return '🪜 사다리! ' + v.from + ' → ' + v.to;
      if (v.kind === 'slide') return '🛝 미끄럼… ' + v.from + ' → ' + v.to;
      return v.label || '';
    }

    /* ── 수신 ── */
    ctx.on('join', function (p) {
      if (phase !== 'lobby' && B.teams.of(teams, p.name) < 0) B.teams.add(teams, p.name);
      resync(p.name); render();
    });
    ctx.on('bye', function (p) {
      if (phase === 'lobby') { render(); return; }
      if (gate) gate.drop(p.name);
      var wasRunner = (phase === 'roll' && tm.runner() === p.name);
      B.teams.remove(teams, p.name);                        // 이탈 = 팀에서 빼기(스냅샷 정직) · 재입장은 join 에서 다시 배정
      if (wasRunner && last && last.power && last.power.dice) doMove(B.dice.roll(last.power.dice));
      render();
    });
    ctx.on('answer', function (p) {
      if (p.__pty) return;
      if (phase === 'gate' && gate && typeof p.gate === 'number') { if (gate.onAnswer(p)) push({ gate: gate.pub() }); return; }
      if (phase === 'roll' && p.roll === rollSeq && p.name === tm.runner() && last && last.power && last.power.dice) doMove(B.dice.roll(last.power.dice));
    });
    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var cur = null, answeredGate = -1, rolled = -1;
    function myTeam() { if (!cur || !cur.teams) return -1; return B.teams.of(cur.teams, ctx.name); }
    function tinfo(i) { return cur && cur.teams && cur.teams[i]; }
    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') { B.phone.wait(el, esc(ctx.name) + ' 님, 들어왔어요!', '🪜 오르락 내리락 — 팀이 함께 문제 풀고 주사위!'); return; }
      var mi = myTeam(), mt = tinfo(mi), tt = tinfo(cur.turn), badge = B.phone.teamBadge(mt);
      var posLine = mt ? '<div class="kp-dim" style="margin-bottom:8px">우리 팀 ' + cur.pos[mi] + '칸 / ' + cur.n + '</div>' : '';
      if (cur.phase === 'gate') {
        var g = cur.gate;
        if (mi === cur.turn && g && g.to.indexOf(ctx.name) >= 0 && answeredGate !== g.gate) {
          B.phone.question(el, { q: g.q, choices: g.choices, timeout: g.timeout }, function (i) { answeredGate = g.gate; ctx.answer({ gate: g.gate, choice: i }); }, { head: badge + '<div class="kp-pmeta">🎯 우리 팀 차례! 다 같이 맞혀요</div>' });
          return;
        }
        if (mi === cur.turn) { el.innerHTML = badge + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>✅ 제출!</div><div class="kp-dim">팀 친구들 ' + (g ? g.answered.length + ' / ' + g.to.length : '') + ' 제출</div></div>'; return; }
        el.innerHTML = badge + posLine + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(tt.name) + '팀 문제 푸는 중' : '') + '</div><div class="kp-dim">우리 차례를 기다려요</div></div>';
        return;
      }
      if (cur.phase === 'gate_result') {
        var res = cur.result;
        if (mi === cur.turn) {
          var mine = res.correct.indexOf(ctx.name) >= 0;
          el.innerHTML = badge + '<div class="kp-result ' + (mine ? 'kp-right' : 'kp-wrong') + '">' + (mine ? '⭕' : '❌') + '</div>' +
            '<div class="kp-pq" style="font-size:22px">' + esc(res.label) + '</div><div class="kp-dim" style="text-align:center">맞힌 사람 ' + res.correct.length + ' / ' + (res.correct.length + res.wrong.length) + '</div>';
        } else el.innerHTML = badge + posLine + '<div class="kp-wait"><div>' + (tt ? tt.emoji + ' ' + esc(tt.name) + '팀: ' : '') + esc(res.label) + '</div></div>';
        return;
      }
      if (cur.phase === 'roll') {
        var pw = cur.power || {};
        if (cur.runner === ctx.name && pw.dice && rolled !== cur.roll) {
          B.phone.action(el, '🎲 굴리기!', function () { rolled = cur.roll; ctx.answer({ roll: cur.roll }); }, { head: badge + '<div class="kp-pmeta">' + esc(pw.label) + '</div><div class="kp-pq" style="font-size:22px">내가 굴릴 차례!</div>', doneLabel: '🎲 굴리는 중…' });
          return;
        }
        el.innerHTML = badge + posLine + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(tt.name) + '팀 — ' : '') + esc(pw.label || '') + '</div>' +
          (pw.dice ? '<div class="kp-dim">🎲 ' + esc(cur.runner || '') + ' 굴리는 중</div>' : '') + '</div>';
        return;
      }
      if (cur.phase === 'move') {
        var m = cur.move, t2 = tinfo(m.team);
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big" style="font-size:36px">' + (m.dice && m.dice.length ? '🎲 ' + m.dice.join(' + ') + ' = ' + m.steps : '1칸') + '</div>' +
          '<div>' + (t2 ? t2.emoji + ' ' + esc(t2.name) + '팀 ' : '') + m.from + ' → ' + m.to + '칸' + (m.to >= cur.n ? ' 🏁' : '') + '</div>' +
          (m.via && m.via.length ? '<div class="kp-dim">' + m.via.map(function (v) { return v.kind === 'ladder' ? '🪜 사다리 ' + v.from + '→' + v.to : v.kind === 'slide' ? '🛝 미끄럼 ' + v.from + '→' + v.to : esc(v.label); }).join(' · ') + '</div>' : '') + '</div>';
        return;
      }
      if (cur.phase === 'end') {
        var rk = cur.ranking || [], place = -1; rk.forEach(function (r, i) { if (r.i === mi) place = i; });
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big">' + (place === 0 ? '🏆 우리 팀 우승!' : place >= 0 ? '우리 팀 ' + (place + 1) + '등' : '🎉 끝!') + '</div>' +
          (rk[0] ? '<div class="kp-dim">' + rk[0].emoji + ' ' + esc(rk[0].name) + '팀 골인</div>' : '') + '</div>';
      }
    }
    ctx.on('state', function (p) {
      if (!p.phase || p.__pty) return;
      cur = p; render();
    });
    render();
  }

  window.Kple.register('board_ladder', { host: hostView, join: joinView });
})();
