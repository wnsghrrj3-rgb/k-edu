/* ============================================================================
   K-edu 케이플 보드게임 B10 — 🎱 빙고 (board_bingo)   [2026-09-29]
   ----------------------------------------------------------------------------
   설계: kple/KPLE_보드게임_설계.md B10. 「각자 폰이 보드」(보드게임 중 유일한 예외) · 개인전 · 실력 빙고.
     - 입장(시작) 때 호스트가 **덱 답안**을 폰마다 다른 배치로 섞어 판을 만든다(호스트 랜덤 BP-1). 중앙 FREE.
         칸 = 실제 답(먼저, 가능한 한 전부) + 부족분은 보기의 오답(교란 — 안 불리는 칸, 진짜 빙고처럼). 실제 답 5종 이상이어야 시작.
         종류 ≥24 → 5×5(3줄) · ≥15 → 4×4(2줄) · ≥8 → 3×3(1줄). 큰 덱(24+)은 답이 판에 없을 수도 → 폰 「내 판엔 없는 답」.
     - 호스트 문제 출제(4지선다, 15초/전원 응답/호스트 공개) → **맞힌 사람만** 판에서 그 답 칸을 **찾아 눌러** 마킹
       (정답 모르면 칸 못 지움 = 실력 빙고 · 눌러서 찾는 건 옛 빙고 문법 계승). 마킹 판정 = 호스트(KP-4).
     - 줄(가로·세로·대각) 목표 채우면 빙고! → 호스트 즉시 확정·순서 기록. 3명 빙고 또는 문제 소진 = 종료 → 줄 수 순위.
     - 호스트 화면 = 문제 + **전체 줄 현황 레이스**(막대) + 빙고 순서. 늦은 입장 = 그때 판 발급(마킹 0). 판·마킹은 폰마다 state 하나(`to`).
   KP-1: 문제 state 에 정답 없음(공개 때만). 이탈 = 기대 목록 제외.

   config.questions(4지선다 덱 계약, answerText 있으면 사용) · config.timeout(ms 기본 15000) · config.winners(기본 3)
   state: { phase:'card', to, size, cells[], marks[], lines }            ← 그 폰만
          { phase:'question', seq, qi, total, q, choices, answered[], timeout, race[], winners[] }
          { phase:'result', seq, answer, answerText, correct[], race[], winners[] }
          { phase:'end', ranking[] }
   answer: { gate:seq, choice } | { mark:seq, cell:i }
   ============================================================================ */
(function () {
  if (!window.Kple || !window.KpleBoard) { console.error('[board_bingo] kple-core.js·kple-board.js 먼저 로드'); return; }
  var B = window.KpleBoard, esc = B.esc;

  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function answerOf(Q) { return norm(Q.answerText != null ? Q.answerText : (Q.choices || [])[Q.answer]); }
  function sizeFor(n) { return n >= 24 ? 5 : n >= 15 ? 4 : n >= 8 ? 3 : 0; }
  function targetFor(size) { return size === 5 ? 3 : size === 4 ? 2 : 1; }
  function lineList(size) {
    var L = [], r, c, a, b;
    for (r = 0; r < size; r++) { a = []; for (c = 0; c < size; c++) a.push(r * size + c); L.push(a); }
    for (c = 0; c < size; c++) { a = []; for (r = 0; r < size; r++) a.push(r * size + c); L.push(a); }
    a = []; b = []; for (r = 0; r < size; r++) { a.push(r * size + r); b.push(r * size + (size - 1 - r)); } L.push(a); L.push(b);
    return L;
  }
  function countLines(size, marks) {
    var set = {}; marks.forEach(function (i) { set[i] = 1; });
    return lineList(size).filter(function (ln) { return ln.every(function (i) { return set[i]; }); }).length;
  }
  var SAMPLE = [
    ['우리나라의 수도는?', '서울'], ['1주일은 며칠?', '7일'], ['물이 어는 온도는?', '0도'], ['해가 뜨는 쪽은?', '동쪽'],
    ['3 × 4 는?', '12'], ['가장 큰 행성은?', '목성'], ['개구리의 아기는?', '올챙이'], ['한글을 만든 왕은?', '세종대왕'],
    ['1년은 몇 달?', '12달'], ['무지개 색은 몇 가지?', '7가지'], ['얼음이 녹으면?', '물'], ['우리 몸의 뼈는 몇 개쯤?', '206개'],
    ['지구의 위성은?', '달'], ['5 + 6 은?', '11'], ['곤충의 다리는 몇 개?', '6개'], ['가장 작은 한 자리 수는?', '0']
  ].map(function (p, i, all) {
    var ch = [p[1]]; for (var k = 1; ch.length < 4; k++) ch.push(all[(i + k) % all.length][1]);
    ch = B.shuffle(ch); return { q: p[0], choices: ch, answer: ch.indexOf(p[1]), answerText: p[1] };
  });

  /* ---------------- 호스트 ---------------- */
  function hostView(ctx) {
    var questions = (ctx.config.questions && ctx.config.questions.length) ? ctx.config.questions : SAMPLE;
    var timeout = ctx.config.timeout || 15000, maxWinners = ctx.config.winners || 3;
    var pool = [], decoys = [], seen = {};
    questions.forEach(function (Q) { var a = answerOf(Q); if (a && !seen[a]) { seen[a] = 1; pool.push(a); } });
    questions.forEach(function (Q) { (Q.choices || []).forEach(function (c) { c = norm(c); if (c && !seen[c]) { seen[c] = 1; decoys.push(c); } }); });
    // 판 크기 = 실제 답 종류로(교란은 빈칸 채우기만) — 실제 답이 5종은 있어야 게임이 된다(작은 놀이덱 = 3×3)
    var size = pool.length >= 5 ? Math.max(3, sizeFor(pool.length)) : 0, target = targetFor(size), FREE = size % 2 ? Math.floor(size * size / 2) : -1;
    var phase = 'lobby', qi = -1, order = [], seq = 0, gate = null, cur = null, lastRes = null;
    var cards = {};      // name -> { cells[], marks[], lines }
    var winners = [];    // 빙고 순서
    var pending = {};    // name -> answerText (정답 맞혀 마킹 대기)

    function head() {
      return '<div class="kp-host-bar"><div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
        '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
        '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div></div>';
    }
    function makeCard(name) {
      var need = size * size - (FREE >= 0 ? 1 : 0);
      var picks = B.shuffle(pool).slice(0, need);                       // 실제 답 먼저(가능한 한 전부)
      if (picks.length < need) picks = picks.concat(B.shuffle(decoys).slice(0, need - picks.length));   // 부족분 = 교란(안 불리는 칸)
      picks = B.shuffle(picks); var cells = [];
      for (var i = 0, k = 0; i < size * size; i++) cells.push(i === FREE ? '★' : picks[k++]);
      cards[name] = { cells: cells, marks: FREE >= 0 ? [FREE] : [], lines: 0 };
      return cards[name];
    }
    function sendCard(name) { var c = cards[name]; if (!c) return; ctx.sendState({ phase: 'card', to: name, size: size, cells: c.cells, marks: c.marks.slice(), lines: c.lines, target: target }); }
    function race() {
      return ctx.getRoster().map(function (n) { return { name: n, lines: cards[n] ? cards[n].lines : 0, marks: cards[n] ? cards[n].marks.length : 0, bingo: winners.indexOf(n) + 1 }; })
        .sort(function (a, b) { return (a.bingo || 99) - (b.bingo || 99) || b.lines - a.lines || b.marks - a.marks; });
    }
    function pubQ() { return { phase: 'question', seq: seq, qi: qi + 1, total: order.length, q: cur.q, choices: cur.choices, answered: gate ? gate.pub().answered : [], timeout: timeout, race: race(), winners: winners.slice(), target: target }; }

    function start() {
      if (!size) return;
      order = B.shuffle(questions.filter(function (Q) { return answerOf(Q); }));
      ctx.getRoster().forEach(function (n, i) { makeCard(n); setTimeout(function () { sendCard(n); }, i * 40); });
      var p = ctx.party;
      if (p && p.countdown) { try { p.countdown(3, nextQ); return; } catch (e) {} }
      setTimeout(nextQ, ctx.getRoster().length * 40 + 50);
    }
    function nextQ() {
      qi += 1;
      if (qi >= order.length) { endGame(); return; }
      cur = order[qi]; seq += 1; phase = 'question'; lastRes = null; pending = {};
      gate = B.qgate({ members: ctx.getRoster(), question: cur, timeout: timeout, mode: 'team', onDone: reveal });
      ctx.sendState(pubQ()); render();
    }
    function reveal(res) {
      if (phase !== 'question') return;
      gate = null; phase = 'result';
      var at = answerOf(cur);
      res.correct.forEach(function (n) { pending[n] = at; });
      lastRes = { seq: seq, answer: cur.answer, answerText: at, correct: res.correct.slice() };
      ctx.sendState(Object.assign({ phase: 'result' }, lastRes, { race: race(), winners: winners.slice(), target: target }));
      render();
    }
    function mark(name, cell) {
      var c = cards[name]; if (!c || !(name in pending)) return;
      if (c.cells[cell] !== pending[name] || c.marks.indexOf(cell) >= 0) return;
      c.marks.push(cell); delete pending[name];
      c.lines = countLines(size, c.marks);
      if (c.lines >= target && winners.indexOf(name) < 0) {
        winners.push(name);
        var p = ctx.party; if (p && p.drumroll && winners.length === 1) { try { p.drumroll(); } catch (e) {} }
      }
      sendCard(name);
      ctx.sendState({ phase: 'race', race: race(), winners: winners.slice(), target: target });
      render();
      if (winners.length >= maxWinners) setTimeout(endGame, 1500);
    }
    function endGame() {
      if (gate) gate.cancel(); gate = null; phase = 'end';
      var rk = race();
      ctx.sendState({ phase: 'end', ranking: rk, target: target }); render();
      var p = ctx.party; if (p && p.champion && rk.length && (rk[0].bingo || rk[0].lines)) { try { p.champion(rk[0].name); } catch (e) {} }
    }
    function resync(name) {
      if (phase === 'lobby') return;
      if (!cards[name]) makeCard(name);
      sendCard(name);
      if (phase === 'question') ctx.sendState(pubQ());
      else if (phase === 'result') ctx.sendState(Object.assign({ phase: 'result' }, lastRes, { race: race(), winners: winners.slice(), target: target }));
      else if (phase === 'end') ctx.sendState({ phase: 'end', ranking: race(), target: target });
    }

    /* ── 화면 ── */
    function raceHTML() {
      var rc = race(), max = Math.max(target, 1);
      return '<div class="kpb-race">' + rc.slice(0, 30).map(function (r) {
        var pct = Math.min(100, Math.round(r.lines * 100 / max));
        return '<div class="kpb-race-row' + (r.bingo ? ' bingo' : '') + '"><span class="kpb-race-name">' + (r.bingo ? '🎉' + r.bingo + ' ' : '') + esc(r.name) + '</span>' +
          '<span class="kpb-race-bar"><span style="width:' + pct + '%"></span></span><span class="kpb-race-n">' + r.lines + '줄 · ' + r.marks + '칸</span></div>';
      }).join('') + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      var r = ctx.getRoster();
      if (phase === 'lobby') {
        el.innerHTML = head() + '<div class="kp-stage">' +
          '<div class="kp-big">🎱 빙고</div>' +
          '<div class="kp-dim" style="font-size:18px;margin:-6px 0 10px">' + (size ? size + '×' + size + ' 판 · ' + target + '줄이면 빙고 · 맞혀야 칸을 지워요' : '이 덱은 답이 너무 적어 빙고 판을 만들 수 없어요(답 5종·보기 8종 필요)') + '</div>' +
          '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + r.length + '명</div>' +
          '<div class="kp-roster">' + (r.length ? r.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('') : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
          '<button class="kp-btn kp-go" id="kpStart"' + (r.length && size ? '' : ' disabled') + '>게임 시작 ▶</button></div>';
        var s = el.querySelector('#kpStart'); if (s) s.onclick = start; return;
      }
      if (phase === 'question') {
        var ans = gate ? gate.pub().answered.length : 0;
        el.innerHTML = head() + '<div class="kp-stage" style="padding-top:8px">' +
          '<div class="kp-qmeta">문제 ' + (qi + 1) + ' / ' + order.length + ' · 응답 ' + ans + ' / ' + r.length + '</div>' +
          '<div class="kp-timerbar host"><span style="animation-duration:' + timeout + 'ms"></span></div>' +
          '<div class="kp-q">' + esc(cur.q) + '</div>' +
          '<div class="kp-choices kp-host-choices">' + cur.choices.map(function (c, i) { return '<div class="kp-pbtn kp-c' + i + ' kp-gb-ro"><span class="kp-ckey">' + B.KEYS[i] + '</span>' + esc(c) + '</div>'; }).join('') + '</div>' +
          '<button class="kp-btn kp-go" id="kpReveal" style="margin:14px 0">정답 공개 ▶</button>' + raceHTML() + '</div>';
        var b = el.querySelector('#kpReveal'); if (b) b.onclick = function () { if (gate) gate.finish(); };
        return;
      }
      if (phase === 'result') {
        el.innerHTML = head() + '<div class="kp-stage" style="padding-top:8px">' +
          '<div class="kp-qmeta">문제 ' + (qi + 1) + ' / ' + order.length + '</div>' +
          '<div class="kp-q">정답: <span style="color:var(--kp-yellow)">' + esc(lastRes.answerText) + '</span> · 맞힌 사람 ' + lastRes.correct.length + '명 — 판에서 찾아 눌러요!</div>' +
          '<button class="kp-btn kp-go" id="kpNext" style="margin:14px 0">' + (qi + 1 >= order.length ? '결과 보기 🏁' : '다음 문제 ▶') + '</button>' + raceHTML() + '</div>';
        var nx = el.querySelector('#kpNext'); if (nx) nx.onclick = function () { pending = {}; nextQ(); };
        return;
      }
      if (phase === 'end') {
        var rk = race();
        el.innerHTML = head() + '<div class="kp-stage"><div class="kp-big">🎉 끝!</div>' +
          (winners.length ? '<div class="kp-top">빙고 ' + winners.map(function (n, i) { return (i + 1) + '등 ' + esc(n); }).join(' · ') + '</div>' : '<div class="kp-dim">빙고는 없었어요 — 줄 수 순위</div>') +
          raceHTML() + '</div>';
      }
    }

    ctx.on('join', function (p) { resync(p.name); render(); });
    ctx.on('bye', function (p) { if (gate) gate.drop(p.name); render(); });
    ctx.on('answer', function (p) {
      if (p.__pty) return;
      if (phase === 'question' && gate && typeof p.gate === 'number') { var ok = gate.onAnswer(p); if (ok && phase === 'question' && gate) { ctx.sendState(pubQ()); render(); } return; }   // 마지막 답이면 onAnswer 안에서 이미 공개됨 — 옛 question 을 덧보내지 않는다
      if (typeof p.mark === 'number' && p.mark === seq && typeof p.cell === 'number') mark(p.name, p.cell);
    });
    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var card = null, cur = null, res = null, answered = -1, marked = -1, myPick = null, endRk = null;
    function cardHTML(findText) {
      if (!card) return '';
      var set = {}; card.marks.forEach(function (i) { set[i] = 1; });
      return '<div class="kpb-bingo" style="grid-template-columns:repeat(' + card.size + ',1fr)">' + card.cells.map(function (c, i) {
        var hit = findText && c === findText && !set[i];
        return '<button class="kpb-bcell' + (set[i] ? ' on' : '') + (hit ? ' find' : '') + '" data-i="' + i + '"' + (findText && !set[i] ? '' : ' disabled') + '>' + esc(c) + '</button>'; }).join('') + '</div>' +
        '<div class="kp-dim" style="text-align:center;margin:4px 0 10px">' + card.lines + ' / ' + card.target + '줄' + (card.lines >= card.target ? ' 🎉 빙고!' : '') + '</div>';
    }
    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur && !card) { B.phone.wait(el, esc(ctx.name) + ' 님, 들어왔어요!', '🎱 빙고 — 맞혀야 칸을 지워요'); return; }
      if (cur && cur.phase === 'end') {
        var me = null; (cur.ranking || []).forEach(function (r, i) { if (r.name === ctx.name) me = Object.assign({ place: i + 1 }, r); });
        el.innerHTML = '<div class="kp-wait"><div class="kp-big">' + (me && me.bingo ? '🎉 빙고 ' + me.bingo + '등!' : '🎉 끝!') + '</div>' + (me ? '<div class="kp-dim">' + me.lines + '줄 · ' + me.marks + '칸</div>' : '') + '</div>' + cardHTML(null);
        return;
      }
      if (cur && cur.phase === 'question' && answered !== cur.seq) {
        B.phone.question(el, { q: cur.q, choices: cur.choices, timeout: cur.timeout }, function (i) { answered = cur.seq; myPick = i; ctx.answer({ gate: cur.seq, choice: i }); render(); },
          { head: '<div class="kp-pmeta">문제 ' + cur.qi + ' / ' + cur.total + '</div>' });
        var lk = el.querySelector('#kpbLock'); if (lk) lk.textContent = '';
        el.insertAdjacentHTML('beforeend', cardHTML(null));
        return;
      }
      if (cur && cur.phase === 'question') {
        el.innerHTML = '<div class="kp-pmeta">문제 ' + cur.qi + ' / ' + cur.total + '</div><div class="kp-locked">✅ 제출! 공개를 기다려요</div>' + cardHTML(null); return;
      }
      if (cur && cur.phase === 'result') {
        var right = cur.correct.indexOf(ctx.name) >= 0, onCard = !!card && card.cells.indexOf(cur.answerText) >= 0, canMark = right && onCard && marked !== cur.seq;
        el.innerHTML = '<div class="kp-result ' + (right ? 'kp-right' : (myPick === null ? 'kp-noans' : 'kp-wrong')) + '" style="font-size:36px;margin:8px 0">' + (right ? '⭕ 정답!' : '❌ 정답: ' + esc(cur.answerText)) + '</div>' +
          (canMark ? '<div class="kp-pq" style="font-size:20px">판에서 「' + esc(cur.answerText) + '」을 찾아 눌러요!</div>'
            : right ? (onCard ? '<div class="kp-locked">✅ 지웠어요</div>' : '<div class="kp-dim" style="text-align:center">맞혔지만 내 판엔 없는 답이에요 😅</div>')
            : '<div class="kp-dim" style="text-align:center">이번엔 칸을 못 지워요</div>') +
          cardHTML(canMark ? cur.answerText : null);
        if (canMark) [].forEach.call(el.querySelectorAll('.kpb-bcell:not([disabled])'), function (b) {
          b.onclick = function () {
            var i = +b.getAttribute('data-i');
            if (card.cells[i] !== cur.answerText) { b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 400); return; }
            marked = cur.seq; ctx.answer({ mark: cur.seq, cell: i }); b.classList.add('on'); render();
          };
        });
        return;
      }
      el.innerHTML = '<div class="kp-pmeta">🎱 내 빙고판</div>' + cardHTML(null) + '<div class="kp-dim" style="text-align:center">문제를 기다려요</div>';
    }
    ctx.on('state', function (p) {
      if (p.__pty) return;
      if (p.phase === 'card') { if (p.to !== ctx.name) return; card = { size: p.size, cells: p.cells, marks: p.marks, lines: p.lines, target: p.target }; render(); return; }
      if (p.phase === 'race') return;
      if (p.phase === 'question') { if (!cur || cur.seq !== p.seq) { myPick = null; } cur = p; }
      else if (p.phase === 'result' || p.phase === 'end') cur = p;
      else return;
      render();
    });
    render();
  }

  window.Kple.register('board_bingo', { host: hostView, join: joinView });
})();
