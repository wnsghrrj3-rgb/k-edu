/* ============================================================================
   K-edu 케이플 보드게임 B7 — 🃏 같은 그림 (board_match)   [2026-09-29]
   ----------------------------------------------------------------------------
   설계: kple/KPLE_보드게임_설계.md B7. 메모리 짝맞추기. 2~4팀, 턴 팀 주자(팀 내 순환)가 폰에서 2장 지목.
     학습 모드 = **덱의 q↔a 가 그대로 짝**(단어↔뜻·수식↔답·나라↔수도) — 덱과 가장 아름답게 맞물리는 게임.
     짝 = +100 · 한 번 더(같은 주자) / 아니면 2초 뒤 뒤집고 다음 팀. 카드 소진 → 점수 많은 팀 승.
     짝 12 → 4×6 · 8 → 4×4 · 6 → 3×4 · 4 → 2×4 (덱 4문항 미만 = 비노출). 셔플·판정 = 호스트(BP-1·2).
     KP-1/BP-4: 앞면 값은 뒤집기 이벤트(flip)와 맞춘 카드에만 — 뒷면 카드 값은 state 에 없다.
     무응답 15초 = 호스트가 아무 뒷면 카드(BP-5). 늦은 입장 = 적은 팀 뒤 + 스냅샷(맞춘 카드 앞면 포함, BP-3).

   config.pairs:[{a,b}] 또는 config.questions(4지선다 덱 → {q, answerText}) · config.pickTimeout · config.maxTurns(기본 60)
   answer: { pick:seq, card:i }
   ============================================================================ */
(function () {
  if (!window.Kple || !window.KpleBoard) { console.error('[board_match] kple-core.js·kple-board.js 먼저 로드'); return; }
  var B = window.KpleBoard, esc = B.esc;
  var SAMPLE = [['사과', 'apple'], ['강아지', 'dog'], ['고양이', 'cat'], ['물', 'water'], ['해', 'sun'], ['달', 'moon'], ['책', 'book'], ['학교', 'school'], ['친구', 'friend'], ['꽃', 'flower'], ['나무', 'tree'], ['바다', 'sea']];
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function pairsFrom(config) {
    var out = [], seen = {};
    if (config.pairs && config.pairs.length) config.pairs.forEach(function (p) { var a = norm(p.a || p[0]), b = norm(p.b || p[1]); if (a && b && a !== b && !seen[a] && !seen[b]) { seen[a] = seen[b] = 1; out.push([a, b]); } });
    else if (config.questions && config.questions.length) config.questions.forEach(function (Q) {
      var a = norm(Q.q), b = norm(Q.answerText != null ? Q.answerText : (Q.choices || [])[Q.answer]);
      if (a && b && a !== b && !seen[a] && !seen[b] && a.length <= 40) { seen[a] = seen[b] = 1; out.push([a, b]); }
    });
    else out = SAMPLE.slice();
    return out;
  }
  function layoutFor(n) { return n >= 12 ? [4, 6, 12] : n >= 8 ? [4, 4, 8] : n >= 6 ? [3, 4, 6] : n >= 4 ? [2, 4, 4] : null; }

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var allPairs = pairsFrom(ctx.config), lay = layoutFor(allPairs.length);
    var pickTimeout = ctx.config.pickTimeout || 15000, maxTurns = ctx.config.maxTurns || 60;
    var phase = 'lobby', teamCount = ctx.config.teams || 2, teams = [], tm = null, scores = [];
    var faces = [], pairOf = [], matched = [], open = [], seq = 0, timer = null, hideTimer = null, turns = 0, last = null;

    function head() {
      return '<div class="kp-host-bar"><div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
        '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
        '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div></div>';
    }
    function present(t) { var r = ctx.getRoster(); return t.members.filter(function (m) { return r.indexOf(m) >= 0; }); }
    function pubCards() { return faces.map(function (f, i) { return matched[i] >= 0 ? { m: matched[i], f: f } : (open.indexOf(i) >= 0 ? { o: 1, f: f } : {}); }); }   // BP-4: 뒷면 값 없음
    function snap() { return { teams: B.teams.pub(teams), scores: scores.slice(), turn: tm ? tm.team : 0, rows: lay[0], cols: lay[1], cards: pubCards(), left: leftPairs() }; }
    function push(extra) { ctx.sendState(Object.assign({ phase: phase }, snap(), extra || {})); }
    function leftPairs() { var n = 0; matched.forEach(function (m) { if (m < 0) n += 1; }); return n / 2; }
    function clearTimers() { if (timer) { clearTimeout(timer); timer = null; } if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }
    function backs() { var o = []; for (var i = 0; i < faces.length; i++) if (matched[i] < 0 && open.indexOf(i) < 0) o.push(i); return o; }

    function start() {
      if (!lay) return;
      teams = B.teams.build(ctx, teamCount); tm = B.turn(teams); scores = teams.map(function () { return 0; }); turns = 0;
      var ps = B.shuffle(allPairs).slice(0, lay[2]), deck = [];
      ps.forEach(function (p, k) { deck.push({ f: p[0], p: k }); deck.push({ f: p[1], p: k }); });
      deck = B.shuffle(deck); faces = deck.map(function (d) { return d.f; }); pairOf = deck.map(function (d) { return d.p; });
      matched = faces.map(function () { return -1; }); open = [];
      var p = ctx.party;
      if (p && p.countdown) { try { p.countdown(3, beginTurn); return; } catch (e) {} }
      beginTurn();
    }
    function beginTurn() {
      clearTimers(); open = [];
      turns += 1; if (turns > maxTurns) { endGame(); return; }
      var t = teams[tm.team];
      if (!present(t).length) { if (teams.every(function (x) { return !present(x).length; })) { endGame(); return; } tm.next(); beginTurn(); return; }
      if (present(t).indexOf(tm.runner()) < 0) tm.advanceRunner();
      phase = 'pick'; askPick();
    }
    function askPick() {
      seq += 1; phase = 'pick';
      push({ pick: seq, runner: tm.runner(), nth: open.length + 1 }); render();
      timer = setTimeout(function () { if (phase === 'pick') { var b = backs(); flip(b[Math.floor(Math.random() * b.length)], true); } }, pickTimeout);   // BP-5
    }
    function flip(i, auto) {
      if (phase !== 'pick' || matched[i] >= 0 || open.indexOf(i) >= 0) return;
      clearTimers(); open.push(i);
      var t = tm.team;
      if (open.length < 2) { ctx.sendState(Object.assign({ phase: 'flip' }, snap(), { flip: { i: i, f: faces[i], auto: !!auto } })); render(); askPick(); return; }
      var a = open[0], b = open[1], hit = pairOf[a] === pairOf[b];
      last = { team: t, runner: tm.runner(), a: a, b: b, fa: faces[a], fb: faces[b], hit: hit, auto: !!auto };
      if (hit) { matched[a] = t; matched[b] = t; scores[t] += 100; open = []; }
      phase = 'show';
      push({ show: last });
      render();
      var p = ctx.party; if (p && p.setScores && hit) { try { var m = {}; teams.forEach(function (tt, k) { tt.members.forEach(function (n) { m[n] = scores[k] / tt.members.length; }); }); p.setScores(m); } catch (e) {} }
      if (hit && leftPairs() === 0) { hideTimer = setTimeout(endGame, 1800); return; }
      hideTimer = setTimeout(function () { if (hit) { turns += 1; if (turns > maxTurns) { endGame(); return; } phase = 'pick'; open = []; askPick(); } else { tm.advanceRunner(); tm.next(); beginTurn(); } }, hit ? 1500 : 2200);
    }
    function ranking() {
      return teams.map(function (t, i) { return { i: i, name: t.name, emoji: t.emoji, color: t.color, score: scores[i], label: scores[i] + '점' }; }).sort(function (a, b) { return b.score - a.score; });
    }
    function endGame() {
      clearTimers(); phase = 'end';
      var rk = ranking(); push({ ranking: rk, tie: rk.length > 1 && rk[0].score === rk[1].score }); render();
      if (!(rk.length > 1 && rk[0].score === rk[1].score)) B.end(ctx, rk);
    }
    function resync() {
      if (phase === 'lobby') return;
      if (phase === 'pick') push({ pick: seq, runner: tm.runner(), nth: open.length + 1 });
      else if (phase === 'show') push({ show: last });
      else if (phase === 'end') push({ ranking: ranking() });
    }

    /* ── 화면 ── */
    function boardHTML() {
      var cards = pubCards();
      return '<div class="kpb-match">' + B.grid.html(lay[0], lay[1], function (r, c) {
        var i = r * lay[1] + c, cd = cards[i];
        if (cd.m >= 0) return '<span class="kpb-card face done" style="border-color:' + teams[cd.m].color + '">' + teams[cd.m].emoji + ' ' + esc(cd.f) + '</span>';
        if (cd.o) return '<span class="kpb-card face open">' + esc(cd.f) + '</span>';
        return '<span class="kpb-card back">' + (i + 1) + '</span>';
      }) + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      var r = ctx.getRoster();
      if (phase === 'lobby') {
        el.innerHTML = head() + '<div class="kp-stage">' +
          '<div class="kp-big">🃏 같은 그림</div>' +
          '<div class="kp-dim" style="font-size:18px;margin:-6px 0 10px">' + (lay ? '카드 ' + lay[2] * 2 + '장 · 짝을 맞히면 +100 · 한 번 더!' : '이 덱은 짝이 4쌍보다 적어요') + '</div>' +
          '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + r.length + '명</div>' +
          '<div class="kp-roster">' + (r.length ? r.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('') : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
          '<div class="kpb-gate">' + [2, 3, 4].map(function (k) { return '<button class="kp-btn' + (k === teamCount ? ' kp-go' : '') + '" data-tc="' + k + '">' + k + '팀</button>'; }).join('') + '</div>' +
          '<button class="kp-btn kp-go" id="kpStart"' + (r.length >= 2 && lay ? '' : ' disabled') + '>게임 시작 ▶</button></div>';
        [].forEach.call(el.querySelectorAll('[data-tc]'), function (b) { b.onclick = function () { teamCount = +b.getAttribute('data-tc'); render(); }; });
        var s = el.querySelector('#kpStart'); if (s) s.onclick = start; return;
      }
      var t = teams[tm.team], banner = '';
      if (phase === 'pick') banner = '<div class="kpb-banner" style="color:' + t.color + '">' + t.emoji + ' ' + esc(tm.runner() || '') + ' — ' + (open.length ? '두 번째' : '첫 번째') + ' 카드 고르는 중 🃏</div>';
      else if (phase === 'show' && last) banner = '<div class="kpb-banner" style="color:' + teams[last.team].color + '">' + (last.hit ? '🎉 짝! +100 · 한 번 더' : '😅 아니에요 — 다음 팀') + '</div>';
      else if (phase === 'end') { var rk = ranking(); banner = '<div class="kp-big">' + (rk.length > 1 && rk[0].score === rk[1].score ? '🤝 무승부!' : '🏆 ' + rk[0].emoji + ' ' + esc(rk[0].name) + '팀 승리!') + '</div>' + B.rankHTML(rk); }
      el.innerHTML = head() + '<div class="kp-stage" style="padding-top:8px">' +
        B.teams.html(teams, phase === 'end' ? -1 : tm.team, function (tt, i) { return scores[i] + '점'; }) +
        '<div class="kp-qmeta">남은 짝 ' + leftPairs() + '</div>' + banner + (phase === 'end' ? '' : boardHTML()) + '</div>';
    }

    ctx.on('join', function (p) { if (phase !== 'lobby' && B.teams.of(teams, p.name) < 0) B.teams.add(teams, p.name); resync(); render(); });
    ctx.on('bye', function (p) {
      if (phase === 'lobby') { render(); return; }
      var wasRunner = tm.runner() === p.name; B.teams.remove(teams, p.name);
      if (phase === 'pick' && wasRunner) { var b = backs(); flip(b[Math.floor(Math.random() * b.length)], true); }
      render();
    });
    ctx.on('answer', function (p) {
      if (p.__pty) return;
      if (phase === 'pick' && p.pick === seq && p.name === tm.runner() && typeof p.card === 'number') flip(p.card);
    });
    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var cur = null, picked = -1;
    function myTeam() { return cur && cur.teams ? B.teams.of(cur.teams, ctx.name) : -1; }
    function openFaces() { return (cur && cur.cards || []).filter(function (c) { return c.o; }).map(function (c) { return c.f; }); }
    function cardLabel(i) { var cd = cur.cards[i]; return cd.m >= 0 ? cur.teams[cd.m].emoji : cd.o ? '👀' : '?'; }
    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') { B.phone.wait(el, esc(ctx.name) + ' 님, 들어왔어요!', '🃏 같은 그림 — 짝을 기억해요'); return; }
      var mi = myTeam(), mt = cur.teams[mi], tt = cur.teams[cur.turn], badge = B.phone.teamBadge(mt);
      var scoreLine = mt ? '<div class="kp-dim" style="margin-bottom:6px">우리 팀 ' + cur.scores[mi] + '점 · 남은 짝 ' + cur.left + '</div>' : '';
      if (cur.phase === 'pick' && cur.runner === ctx.name && picked !== cur.pick) {
        B.phone.pick(el, { rows: cur.rows, cols: cur.cols, label: function (r, c) { var i = r * cur.cols + c; return cardLabel(i) === '?' ? String(i + 1) : cardLabel(i); },
          enabled: function (r, c) { var cd = cur.cards[r * cur.cols + c]; return !(cd.m >= 0) && !cd.o; } },
          function (r, c) { picked = cur.pick; ctx.answer({ pick: cur.pick, card: r * cur.cols + c }); render(); },
          { head: badge + '<div class="kp-pmeta">🎯 내 차례! ' + (cur.nth === 2 ? '두 번째' : '첫 번째') + ' 카드를 골라요</div>' + (cur.nth === 2 ? '<div class="kp-dim" style="text-align:center">👀 = 방금 뒤집은 카드 (전자칠판을 봐요)</div>' : '') });
        return;
      }
      if (cur.phase === 'pick' || cur.phase === 'flip') {
        el.innerHTML = badge + scoreLine + '<div class="kp-wait"><div class="kp-wait-dot"></div><div>' + (tt ? tt.emoji + ' ' + esc(cur.runner || '') + (mi === cur.turn ? ' (우리 팀)' : '') + ' 카드 고르는 중' : '') + '</div>' +
          (openFaces().length ? '<div class="kp-dim" style="font-size:20px">👀 ' + openFaces().map(esc).join(' · ') + '</div>' : '') + '</div>';
        return;
      }
      if (cur.phase === 'show') {
        var s = cur.show, st = cur.teams[s.team];
        el.innerHTML = badge + scoreLine + '<div class="kp-wait"><div class="kp-big" style="font-size:30px">' + (s.hit ? '🎉 짝!' : '😅 아니에요') + '</div>' +
          '<div>「' + esc(s.fa) + '」 · 「' + esc(s.fb) + '」</div><div class="kp-dim">' + st.emoji + ' ' + esc(st.name) + '팀' + (s.hit ? ' +100 · 한 번 더' : ' — 다음 팀') + '</div></div>';
        return;
      }
      if (cur.phase === 'end') {
        var rk = cur.ranking || [], place = -1; rk.forEach(function (x, i) { if (x.i === mi) place = i; });
        el.innerHTML = badge + '<div class="kp-wait"><div class="kp-big">' + (cur.tie ? '🤝 무승부!' : place === 0 ? '🏆 우리 팀 승리!' : place >= 0 ? '우리 팀 ' + (place + 1) + '등' : '🎉 끝!') + '</div>' + (mt ? '<div class="kp-dim">우리 팀 ' + cur.scores[mi] + '점</div>' : '') + '</div>';
      }
    }
    ctx.on('state', function (p) { if (!p.phase || p.__pty) return; cur = p; render(); });
    render();
  }

  window.Kple.register('board_match', { host: hostView, join: joinView });
})();
