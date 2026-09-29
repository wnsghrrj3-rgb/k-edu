/* ============================================================================
   K-edu 케이플 게임 #8 — 🏃 계산 릴레이 (calc_relay)   [K2 · G6, 2026-09-29]
   ----------------------------------------------------------------------------
   팀전 전용 · 수학 특화. 팀마다 주자가 roster 순으로 돌아가며 바통을 잇는다.
     - 자기 차례에만 문제가 폰에 온다 → 맞히면 다음 주자에게 바통(호스트 트랙 위 팀 말 전진).
     - 오답 = 3초 벌칙 뒤 **같은 주자가 새 문제로 재도전**(주자 교체 없음 — 좌절 방지).
     - 주자가 한참 답을 못 하면(기본 25초) 바통은 다음 주자에게 넘어간다(팀이 통째로 멈추지 않게).
     - 먼저 완주(legs 바퀴)한 팀 승. 결과 = 팀 순위 + 각자 이어 준 바통 수.
   턴 권위 = 호스트 단독(KP-4): 폰은 "내 답"만 보내고, 누가 주자인지·전진 여부는 호스트가 정해 state 로 전파.
   팀 배정 = 시작 순간 고정해 state 로 전파(KP-5, 늦은 입장 resync 포함).
     파티 레이어 👥팀전이 켜져 있으면 그 배정을 그대로 가져온다. 아니면 로비의 팀 수(2~4)로 roster 순번 배정.
     늦은 입장 = 가장 적은 팀 뒤에 붙음. 이탈한 주자 = 자동 건너뜀.
   KP-1: 문제 state 에 정답 없음 — 채점은 호스트에서만.

   config.questions: [{ q, choices:[...], answer:index }]   (덱 4지선다 계약 그대로)
   config.legs (팀당 바통 수, 기본 = 가장 큰 팀 인원 × 1, 최소 3) · config.legTimeout (ms, 기본 25000)
   state:
     { phase:'race', legs, teams:[{ name, emoji, color, members[], runner, progress, q:{q,choices,leg,seq}|null,
                                    penaltyUntil, done }], ... }
     { phase:'end', legs, ranking:[{team, progress, done}], scores }
   answer: { t:teamIdx, seq, choice }
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[calc_relay] kple-core.js 먼저 로드'); return; }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var KEYS = ['①', '②', '③', '④'];
  var PRESETS = [
    { name: '불꽃', emoji: '🔥', color: '#ff5d5d' },
    { name: '파도', emoji: '🌊', color: '#38bdf8' },
    { name: '번개', emoji: '⚡', color: '#ffd23f' },
    { name: '새싹', emoji: '🌱', color: '#2dd4bf' }
  ];
  var PENALTY = 3000;
  var SAMPLE = [
    { q: '7 + 8 은?', choices: ['13', '14', '15', '16'], answer: 2 },
    { q: '12 - 5 는?', choices: ['6', '7', '8', '9'], answer: 1 },
    { q: '6 × 3 은?', choices: ['15', '16', '18', '21'], answer: 2 },
    { q: '20 ÷ 4 는?', choices: ['4', '5', '6', '8'], answer: 1 },
    { q: '9 + 6 은?', choices: ['14', '15', '16', '17'], answer: 1 },
    { q: '30 - 12 는?', choices: ['16', '17', '18', '19'], answer: 2 },
    { q: '4 × 7 은?', choices: ['24', '27', '28', '32'], answer: 2 },
    { q: '45 ÷ 5 는?', choices: ['8', '9', '10', '7'], answer: 1 },
    { q: '25 + 17 은?', choices: ['41', '42', '43', '44'], answer: 1 },
    { q: '8 × 8 은?', choices: ['56', '62', '64', '72'], answer: 2 }
  ];

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var legTimeout = ctx.config.legTimeout || 25000;
    var title = ctx.config.title || '';
    var phase = 'lobby';
    var teamCount = 2, legs = 0;
    var teams = [];                 // {name,emoji,color,members[],runner,progress,q,penaltyUntil,done,finishedAt,qp,seq}
    var seqNo = 0;                  // 문제 발급 일련번호(늦은 답·중복 답 방어)
    var timers = {};                // teamIdx -> setTimeout id (주자 시간 초과)
    var scores = {};                // name -> 이어 준 바통 수
    var started = false;
    var lastEvent = null;           // 호스트 화면 플래시 { t, kind:'ok'|'miss'|'skip', name }

    function roster() { return ctx.getRoster(); }
    function party() { return ctx.party || null; }
    function teamOf(name) { for (var i = 0; i < teams.length; i++) if (teams[i].members.indexOf(name) >= 0) return i; return -1; }

    function head() {
      return '<div class="kp-host-bar">' +
          '<div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
            '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
          '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div>' +
        '</div>';
    }
    function chips(list) { return list.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join(''); }

    // ── 팀 만들기 ──
    function buildTeams() {
      var r = roster(), p = party(), map = null;
      if (p && p.isTeams && p.isTeams()) {          // 파티 팀전 배정 그대로
        map = {}; var maxT = 0;
        r.forEach(function (n) { var t = p.teamOf(n); if (t >= 0) { map[n] = t; if (t > maxT) maxT = t; } });
        teamCount = Math.max(2, Math.min(4, maxT + 1));
      }
      teams = PRESETS.slice(0, teamCount).map(function (pr) {
        return { name: pr.name, emoji: pr.emoji, color: pr.color, members: [], runner: 0, progress: 0,
                 q: null, penaltyUntil: 0, done: false, finishedAt: 0, qp: 0, seq: 0 };
      });
      r.forEach(function (n, i) {
        var t = map && (n in map) ? map[n] : (i % teamCount);
        if (t >= teams.length) t = t % teams.length;
        teams[t].members.push(n);
      });
      var maxSize = 0; teams.forEach(function (t) { if (t.members.length > maxSize) maxSize = t.members.length; });
      legs = ctx.config.legs || Math.max(3, maxSize);
      teams.forEach(function (t, i) { t.qp = i; });   // 팀마다 다른 문제부터 시작(옆 팀 화면 훔쳐보기 방지)
      r.forEach(function (n) { scores[n] = 0; });
    }
    function smallestTeam() {
      var best = 0;
      teams.forEach(function (t, i) { if (t.members.length < teams[best].members.length) best = i; });
      return best;
    }
    function nextQuestionFor(t) {
      var Q = questions[t.qp % questions.length]; t.qp += 1;
      t.seq = ++seqNo;
      t.q = { q: Q.q, choices: Q.choices, answer: Q.answer, leg: t.progress, seq: t.seq };   // answer 는 호스트 메모리에만
    }
    function runnerName(t) { return t.members.length ? t.members[t.runner % t.members.length] : null; }
    function armTimer(ti) {
      clearTimer(ti);
      var t = teams[ti]; if (!t || t.done || !t.members.length) return;
      timers[ti] = setTimeout(function () { skipRunner(ti); }, legTimeout);
    }
    function clearTimer(ti) { if (timers[ti]) { clearTimeout(timers[ti]); delete timers[ti]; } }
    function clearAll() { Object.keys(timers).forEach(function (k) { clearTimer(k); }); }

    function pubTeam(t) {
      return { name: t.name, emoji: t.emoji, color: t.color, members: t.members.slice(),
               runner: runnerName(t), progress: t.progress, done: t.done, penaltyUntil: t.penaltyUntil,
               q: (t.q && !t.done) ? { q: t.q.q, choices: t.q.choices, leg: t.q.leg, seq: t.q.seq } : null };   // KP-1
    }
    function pushState(extra) {
      ctx.sendState(Object.assign({ phase: 'race', legs: legs, teams: teams.map(pubTeam), penalty: PENALTY, legTimeout: legTimeout }, extra || {}));
    }

    // ── 진행 ──
    function startRace() {
      buildTeams();
      started = true; phase = 'race';
      teams.forEach(function (t, i) { if (t.members.length) { nextQuestionFor(t); armTimer(i); } else t.done = true; });
      pushState(); render();
    }
    function advance(ti, name) {                     // 정답 → 바통
      var t = teams[ti];
      t.progress += 1; scores[name] = (scores[name] || 0) + 1;
      lastEvent = { t: ti, kind: 'ok', name: name };
      if (t.progress >= legs) { t.done = true; t.finishedAt = Date.now(); t.q = null; clearTimer(ti); }
      else { t.runner = (t.runner + 1) % t.members.length; t.penaltyUntil = 0; nextQuestionFor(t); armTimer(ti); }
      var p = party(); if (p && p.setScores) { try { p.setScores(scores); } catch (e) {} }
      if (teams.some(function (x) { return x.done && x.members.length; })) { endRace(); return; }
      pushState(); render();
    }
    function penalize(ti, name) {                    // 오답 → 3초 벌칙 → 새 문제, 같은 주자
      var t = teams[ti];
      t.penaltyUntil = Date.now() + PENALTY;
      nextQuestionFor(t);
      lastEvent = { t: ti, kind: 'miss', name: name };
      armTimer(ti);
      pushState(); render();
      setTimeout(function () { if (phase === 'race') render(); }, PENALTY + 60);   // 벌칙 배지 해제
    }
    function skipRunner(ti) {                        // 시간 초과·이탈 → 다음 주자(전진 없음)
      var t = teams[ti]; if (!t || t.done || !t.members.length) return;
      lastEvent = { t: ti, kind: 'skip', name: runnerName(t) };
      t.runner = (t.runner + 1) % t.members.length; t.penaltyUntil = 0;
      nextQuestionFor(t); armTimer(ti);
      pushState(); render();
    }
    function ranking() {
      return teams.map(function (t, i) { return { i: i, team: t.name, emoji: t.emoji, color: t.color, progress: t.progress, done: t.done, finishedAt: t.finishedAt, n: t.members.length }; })
        .filter(function (r) { return r.n; })
        .sort(function (a, b) { return (b.progress - a.progress) || ((a.finishedAt || 9e15) - (b.finishedAt || 9e15)); });
    }
    function endRace() {
      clearAll(); phase = 'end';
      var rk = ranking();
      ctx.sendState({ phase: 'end', legs: legs, ranking: rk, scores: scores, teams: teams.map(pubTeam) });
      render();
      var p = party();
      if (p && p.champion && rk.length) { try { p.champion(rk[0].emoji + ' ' + rk[0].team + '팀'); } catch (e) {} }
    }
    function resync() {
      if (phase === 'race') pushState();
      else if (phase === 'end') ctx.sendState({ phase: 'end', legs: legs, ranking: ranking(), scores: scores, teams: teams.map(pubTeam) });
    }

    // ── 화면 ──
    function trackHTML() {
      return '<div class="kp-rl-track">' + teams.map(function (t, i) {
        if (!t.members.length) return '';
        var pct = Math.min(100, Math.round(t.progress * 100 / legs));
        var ev = (lastEvent && lastEvent.t === i) ? lastEvent : null;
        var badge = t.done ? '<span class="kp-rl-done">🏁 완주!</span>'
          : (t.penaltyUntil > Date.now() ? '<span class="kp-rl-pen">❌ 벌칙 3초</span>' : '<span class="kp-rl-run">🏃 ' + esc(runnerName(t) || '') + '</span>');
        return '<div class="kp-rl-lane' + (ev ? ' ev-' + ev.kind : '') + '">' +
          '<div class="kp-rl-lane-h"><b style="color:' + t.color + '">' + t.emoji + ' ' + esc(t.name) + '팀</b> ' + badge +
            '<span class="kp-rl-cnt">' + t.progress + ' / ' + legs + '</span></div>' +
          '<div class="kp-rl-bar"><div class="kp-rl-fill" style="width:' + pct + '%;background:' + t.color + '"></div>' +
            '<div class="kp-rl-token" style="left:' + pct + '%;background:' + t.color + '">' + t.emoji + '</div></div>' +
          '<div class="kp-rl-order">' + t.members.map(function (m, k) {
            var cur = !t.done && k === (t.runner % t.members.length);
            return '<span class="kp-chip' + (cur ? ' kp-chip-alive' : '') + '">' + (cur ? '🏃 ' : '') + esc(m) + '</span>';
          }).join('') + '</div>' +
        '</div>';
      }).join('') + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      var r = roster();
      if (phase === 'lobby') {
        var p = party(), partyTeams = p && p.isTeams && p.isTeams();
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-big">🏃 계산 릴레이</div>' +
            '<div class="kp-qmeta">' + (title ? esc(title) + ' · ' : '') + '팀 주자가 차례로 문제를 풀어 바통을 이어요 · 먼저 완주하는 팀 승!</div>' +
            '<div class="kp-big" style="font-size:clamp(28px,5vw,46px)">참가자 ' + r.length + '명</div>' +
            '<div class="kp-roster">' + (r.length ? chips(r) : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
            (partyTeams ? '<div class="kp-dim">👥 파티 툴바의 팀 배정을 그대로 써요</div>'
              : '<div class="kp-rl-teamnum">팀 수 ' + [2, 3, 4].map(function (n) {
                  return '<button class="kp-lt-pill kp-rl-n' + (n === teamCount ? ' on' : '') + '" data-n="' + n + '">' + n + '팀</button>'; }).join('') + '</div>') +
            '<button class="kp-btn kp-go" id="kpStart"' + (r.length >= 2 ? '' : ' disabled') + '>출발 🏁</button>' +
            (r.length < 2 ? '<div class="kp-dim">2명 이상이면 출발할 수 있어요</div>' : '') +
          '</div>';
        [].forEach.call(el.querySelectorAll('.kp-rl-n'), function (b) { b.onclick = function () { teamCount = parseInt(b.getAttribute('data-n'), 10); render(); }; });
        var s = el.querySelector('#kpStart'); if (s) s.onclick = function () {
          var pp = party();
          if (pp && pp.countdown) pp.countdown(3, startRace); else startRace();
        };
      } else if (phase === 'race') {
        el.innerHTML = head() +
          '<div class="kp-stage kp-rl-stage">' +
            '<div class="kp-qmeta">🏃 계산 릴레이 · ' + legs + '바퀴 · 주자에게만 문제가 가요</div>' +
            trackHTML() +
            '<div class="kp-rl-hint">' + (lastEvent
              ? (lastEvent.kind === 'ok' ? '⭕ ' + esc(lastEvent.name) + ' 바통 전달!'
                : lastEvent.kind === 'miss' ? '❌ ' + esc(lastEvent.name) + ' 벌칙 3초 뒤 재도전'
                : '⏭ ' + esc(lastEvent.name) + ' 시간 초과 — 다음 주자')
              : '출발!') + '</div>' +
            '<button class="kp-btn" id="kpStop" style="opacity:.6">경기 끝내기</button>' +
          '</div>';
        var st = el.querySelector('#kpStop'); if (st) st.onclick = endRace;
      } else if (phase === 'end') {
        var rk = ranking();
        var mvp = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; }).filter(function (n) { return scores[n] > 0; }).slice(0, 3);
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-big">🏁 ' + (rk.length ? rk[0].emoji + ' ' + esc(rk[0].team) + '팀 우승!' : '끝!') + '</div>' +
            '<div class="kp-rl-rank">' + rk.map(function (x, i) {
              return '<div class="kp-rl-rank-row"><b>' + (i + 1) + '</b> <span style="color:' + x.color + '">' + x.emoji + ' ' + esc(x.team) + '팀</span> ' +
                '<span class="kp-dim">' + x.progress + ' / ' + legs + (x.done ? ' 완주' : '') + '</span></div>';
            }).join('') + '</div>' +
            (mvp.length ? '<div class="kp-gb-top3"><div class="kp-gb-top3-h">🏃 바통 많이 이은 사람</div>' +
              mvp.map(function (n, i) { return '<div class="kp-gb-top3-row"><b>' + (i + 1) + '</b> ' + esc(n) + ' <span class="kp-dim">— ' + scores[n] + '번</span></div>'; }).join('') + '</div>' : '') +
            '<div class="kp-dim">모두 수고했어요!</div>' +
          '</div>';
      }
    }

    ctx.on('join', function (p) {
      if (started && phase === 'race' && teamOf(p.name) < 0) {   // 늦은 입장 → 가장 적은 팀 뒤에
        var ti = smallestTeam(); teams[ti].members.push(p.name); scores[p.name] = scores[p.name] || 0;
        if (!teams[ti].q && !teams[ti].done) { nextQuestionFor(teams[ti]); armTimer(ti); }
      }
      resync(); render();
    });
    ctx.on('bye', function (p) {
      if (phase !== 'race') { render(); return; }
      var ti = teamOf(p.name); if (ti < 0) { render(); return; }
      var t = teams[ti], wasRunner = runnerName(t) === p.name, idx = t.members.indexOf(p.name);
      t.members.splice(idx, 1);
      if (!t.members.length) { t.q = null; clearTimer(ti); pushState(); render(); return; }
      if (idx < t.runner) t.runner -= 1;
      t.runner = t.runner % t.members.length;
      if (wasRunner) { t.penaltyUntil = 0; nextQuestionFor(t); armTimer(ti); lastEvent = { t: ti, kind: 'skip', name: p.name }; }
      pushState(); render();
    });
    ctx.on('answer', function (p) {
      if (phase !== 'race' || typeof p.choice !== 'number') return;
      var ti = teamOf(p.name); if (ti < 0 || ti !== p.t) return;
      var t = teams[ti];
      if (t.done || !t.q || p.seq !== t.q.seq) return;          // 옛 문제·중복 답
      if (runnerName(t) !== p.name) return;                     // 주자 아님(KP-4)
      if (t.penaltyUntil > Date.now()) return;                  // 벌칙 중
      if (p.choice === t.q.answer) advance(ti, p.name); else penalize(ti, p.name);
    });
    render();
  }

  /* ---------------- 참가자 ---------------- */
  function joinView(ctx) {
    var cur = null, sentSeq = null, penTimer = null;
    function me() { return ctx.name; }
    function myTeamIdx() { if (!cur || !cur.teams) return -1; for (var i = 0; i < cur.teams.length; i++) if (cur.teams[i].members.indexOf(me()) >= 0) return i; return -1; }

    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div>' + esc(me()) + ' 님, 들어왔어요!</div>' +
          '<div class="kp-dim">🏃 계산 릴레이 — 내 차례에 문제가 와요. 맞히면 바통 전달!</div></div>';
        return;
      }
      var ti = myTeamIdx(), t = ti >= 0 ? cur.teams[ti] : null;
      var badge = t ? '<div class="kp-gb-badge alive" style="background:' + t.color + ';color:#15162e">' + t.emoji + ' ' + esc(t.name) + '팀</div>' : '';
      if (cur.phase === 'end') {
        var rk = cur.ranking || [], myRank = -1;
        rk.forEach(function (x, i) { if (t && x.team === t.name) myRank = i; });
        el.innerHTML = badge + '<div class="kp-wait">' +
          (myRank === 0 ? '<div class="kp-big">🏆 우리 팀 우승!</div>' : '<div class="kp-big">🏁 끝!</div>' + (myRank >= 0 ? '<div class="kp-myscore">우리 팀 ' + (myRank + 1) + '등</div>' : '')) +
          '<div class="kp-dim">내가 이은 바통 ' + ((cur.scores && cur.scores[me()]) || 0) + '번</div></div>';
        return;
      }
      if (!t) { el.innerHTML = '<div class="kp-wait"><div class="kp-dim">팀 배정을 기다려요…</div></div>'; return; }
      var track = '<div class="kp-rl-mini"><div class="kp-rl-bar"><div class="kp-rl-fill" style="width:' + Math.min(100, Math.round(t.progress * 100 / cur.legs)) + '%;background:' + t.color + '"></div></div>' +
        '<div class="kp-dim">' + t.progress + ' / ' + cur.legs + ' 바퀴</div></div>';
      if (t.done) { el.innerHTML = badge + track + '<div class="kp-result kp-right">🏁 완주!</div><div class="kp-dim">결과를 기다려요</div>'; return; }
      var myTurn = t.runner === me(), pen = t.penaltyUntil && t.penaltyUntil > Date.now();
      if (myTurn && pen) {
        el.innerHTML = badge + track + '<div class="kp-result kp-wrong">❌ 아쉬워요</div><div class="kp-rl-pencount">벌칙 ' + Math.ceil((t.penaltyUntil - Date.now()) / 1000) + '초 뒤 새 문제!</div>';
        if (penTimer) clearTimeout(penTimer);
        penTimer = setTimeout(render, 250);
        return;
      }
      if (myTurn && t.q) {
        var locked = sentSeq === t.q.seq;
        el.innerHTML = badge + track +
          '<div class="kp-pmeta">🏃 내 차례! ' + (t.q.leg + 1) + '번째 바통</div>' +
          '<div class="kp-pq">' + esc(t.q.q) + '</div>' +
          '<div class="kp-pchoices">' + t.q.choices.map(function (c, i) {
            return '<button class="kp-pbtn kp-c' + i + (locked ? ' kp-gb-ro' : '') + '" data-i="' + i + '"><span class="kp-ckey">' + KEYS[i] + '</span>' + esc(c) + '</button>';
          }).join('') + '</div>' + (locked ? '<div class="kp-locked">확인 중…</div>' : '');
        if (!locked) [].forEach.call(el.querySelectorAll('.kp-pbtn'), function (b) {
          b.onclick = function () { sentSeq = t.q.seq; ctx.answer({ t: ti, seq: t.q.seq, choice: parseInt(b.getAttribute('data-i'), 10) }); render(); };
        });
        return;
      }
      var order = t.members, myIdx = order.indexOf(me()), runIdx = order.indexOf(t.runner);
      var ahead = (myIdx >= 0 && runIdx >= 0) ? ((myIdx - runIdx + order.length) % order.length) : 0;
      el.innerHTML = badge + track +
        '<div class="kp-rl-wait">🏃 지금 주자: <b>' + esc(t.runner || '') + '</b></div>' +
        '<div class="kp-dim">' + (ahead === 1 ? '다음은 내 차례! 준비해요' : '내 차례까지 ' + ahead + '명 · 응원해요 📣') + '</div>';
    }
    ctx.on('state', function (p) {
      if (p.phase === 'race' || p.phase === 'end') { cur = p; render(); }
    });
    render();
  }

  window.Kple.register('calc_relay', { host: hostView, join: joinView });
})();
