/* ============================================================================
   K-edu 케이플 게임 #4 — 캐치마인드 (catch_mind)
   ----------------------------------------------------------------------------
   co_draw 드로잉 토대 위. 한 명이 제시어를 받아 그리고(turn), 나머지가 폰에서
   텍스트로 맞힌다. 전자칠판이 그림판. 라운드마다 그리는 사람이 로테이션.

   역할(참가자):
     - 그리는 사람(drawer = roster[round % N]): 제시어 + 그리기 패드 → 획 조각 전송.
     - 맞히는 사람(guesser): "전자칠판 보고 맞혀요" + 추측 입력.

   점진 전송(실시간):
     - drawer 가 그리는 중 점 4개마다 조각 flush. answer{ seg:{sid, pts, done} }
       호스트는 sid 별 마지막 점을 기억해 이어 그림 → 그려지는 과정이 보임.

   제시어 비공개(한계):
     - broadcast 는 전원 수신 → state 에 word 가 실리지만 클라는 본인이 drawer 일
       때만 표시한다(표시 차원의 비공개). 진짜 비공개는 별도 채널 필요(후순위).

   매칭: 공백 제거 + 소문자 비교. 맞힌 사람 +100, 라운드 끝에 drawer += 맞힌수×30.
   사회적 비교 차단: 본인 점수만. 1등(정답왕)만 가볍게.
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[catch_mind] kple-core.js 먼저 로드'); return; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s || '').replace(/\s+/g, '').toLowerCase(); }

  var WORDS = ['사과', '코끼리', '자동차', '무지개', '아이스크림', '강아지', '바나나', '비행기'];
  var FLUSH_EVERY = 4;

  /* ---------------- 호스트(전자칠판) ---------------- */
  function hostView(ctx) {
    var words = (ctx.config.words && ctx.config.words.length) ? ctx.config.words : WORDS;
    var phase = 'lobby', round = -1;
    var drawer = null, word = '';
    var winners = [];          // 이번 라운드 맞힌 사람
    var scores = {};
    var canvas = null, ctx2d = null, lastPt = {};

    function totalRounds() { return ctx.config.rounds || Math.max(1, ctx.getRoster().length); }

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
            '<div class="kp-big">✏️ 캐치마인드</div>' +
            '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + roster.length + '명</div>' +
            '<div class="kp-roster">' + (roster.length
              ? roster.map(function (n) { return '<span class="kp-chip">' + esc(n) + '</span>'; }).join('')
              : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
            '<button class="kp-btn kp-go" id="kpStart"' + (roster.length ? '' : ' disabled') + '>게임 시작 ▶</button>' +
          '</div>';
        var b = el.querySelector('#kpStart'); if (b) b.onclick = nextRound;

      } else if (phase === 'draw') {
        el.innerHTML = head +
          '<div class="kp-draw-head">' +
            '<div class="kp-draw-title">라운드 ' + (round + 1) + ' / ' + totalRounds() +
              ' · ✏️ ' + esc(drawer) + ' 그리는 중</div>' +
            '<button class="kp-btn kp-go" id="kpReveal">정답 공개 ▶</button>' +
          '</div>' +
          '<canvas id="kpCanvas" class="kp-canvas host"></canvas>' +
          '<div class="kp-legend">' +
            '<span class="kp-dim">맞힌 사람:</span> ' +
            (winners.length
              ? winners.map(function (n) { return '<span class="kp-chip" style="font-size:16px">⭕ ' + esc(n) + '</span>'; }).join('')
              : '<span class="kp-dim">아직 없어요</span>') +
          '</div>';
        canvas = el.querySelector('#kpCanvas');
        setupCanvas();
        var r = el.querySelector('#kpReveal'); if (r) r.onclick = reveal;

      } else if (phase === 'reveal') {
        var last = (round >= totalRounds() - 1);
        el.innerHTML = head +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">라운드 ' + (round + 1) + ' / ' + totalRounds() + '</div>' +
            '<div class="kp-q">정답은 <span style="color:var(--kp-yellow)">' + esc(word) + '</span> 였어요</div>' +
            '<div class="kp-legend" style="justify-content:center">' +
              '<span class="kp-dim">맞힌 사람:</span> ' +
              (winners.length ? winners.map(function (n) { return '<span class="kp-chip">⭕ ' + esc(n) + '</span>'; }).join('')
                              : '<span class="kp-dim">아무도 못 맞혔어요 😅</span>') +
            '</div>' +
            '<button class="kp-btn kp-go" id="kpNext" style="margin-top:24px">' + (last ? '결과 보기 🏁' : '다음 라운드 ▶') + '</button>' +
          '</div>';
        var nx = el.querySelector('#kpNext'); if (nx) nx.onclick = last ? endGame : nextRound;

      } else if (phase === 'end') {
        var roster2 = ctx.getRoster();
        var top = null, topScore = -1;
        roster2.forEach(function (n) { if ((scores[n] || 0) > topScore) { topScore = scores[n] || 0; top = n; } });
        el.innerHTML = head +
          '<div class="kp-stage">' +
            '<div class="kp-big">🎉 끝!</div>' +
            (top && topScore > 0 ? '<div class="kp-top">정답왕 ✏️ ' + esc(top) + ' (' + topScore + '점)</div>' : '') +
            '<div class="kp-dim">점수는 각자 화면에서 확인!</div>' +
          '</div>';
      }
    }

    function setupCanvas() {
      if (!canvas) return;
      var w = canvas.clientWidth || 880, h = canvas.clientHeight || 460;
      canvas.width = w; canvas.height = h;
      ctx2d = canvas.getContext ? canvas.getContext('2d') : null;
      lastPt = {};
    }
    function drawSeg(seg) {
      if (!ctx2d || !canvas || !seg || !seg.pts) return;
      ctx2d.strokeStyle = '#222'; ctx2d.lineWidth = 5; ctx2d.lineCap = 'round'; ctx2d.lineJoin = 'round';
      ctx2d.beginPath();
      var prev = lastPt[seg.sid];
      seg.pts.forEach(function (p, i) {
        var x = p.x * canvas.width, y = p.y * canvas.height;
        if (i === 0 && prev) { ctx2d.moveTo(prev.x * canvas.width, prev.y * canvas.height); ctx2d.lineTo(x, y); }
        else if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      });
      ctx2d.stroke();
      lastPt[seg.sid] = seg.done ? null : seg.pts[seg.pts.length - 1];
    }

    function nextRound() {
      round += 1; winners = [];
      var roster = ctx.getRoster();
      drawer = roster[round % roster.length];
      word = words[round % words.length];
      phase = 'draw';
      // 전원에 라운드 정보(+word: 클라가 drawer 일 때만 표시), 캔버스 초기화 신호
      ctx.sendState({ phase: 'draw', round: round, total: totalRounds(), drawer: drawer, word: word, clear: true });
      render();
    }
    function reveal() {
      if (phase !== 'draw') return;
      // drawer 점수: 맞힌 사람 수 × 30
      if (winners.length) scores[drawer] = (scores[drawer] || 0) + winners.length * 30;
      phase = 'reveal';
      ctx.sendState({ phase: 'reveal', round: round, word: word, winners: winners.slice(), scores: scores });
      render();
    }
    function endGame() {
      phase = 'end';
      ctx.sendState({ phase: 'end', scores: scores });
      render();
    }

    ctx.on('join', function () { resync(); render(); });
    ctx.on('bye', function () { render(); });
    ctx.on('answer', function (p) {
      if (phase !== 'draw') return;
      if (p.seg && p.name === drawer) { drawSeg(p.seg); return; }   // drawer 그림 조각
      if (typeof p.guess === 'string' && p.name !== drawer) {        // guesser 추측
        if (winners.indexOf(p.name) !== -1) return;                  // 이미 맞힘
        if (norm(p.guess) === norm(word)) {
          winners.push(p.name);
          scores[p.name] = (scores[p.name] || 0) + 100;
          ctx.sendState({ phase: 'draw', round: round, total: totalRounds(), drawer: drawer, word: word, winners: winners.slice() });
          render();
        }
      }
    });
    function resync() {
      if (phase === 'draw') ctx.sendState({ phase: 'draw', round: round, total: totalRounds(), drawer: drawer, word: word, winners: winners.slice() });
      else if (phase === 'reveal') ctx.sendState({ phase: 'reveal', round: round, word: word, winners: winners.slice(), scores: scores });
    }
    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var cur = null, myScore = null;
    var isDrawer = false, guessed = false;
    var canvas = null, ctx2d = null, drawing = false, pts = [], sid = 0;

    function amDrawer() { return cur && cur.drawer === ctx.name; }

    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div>' + esc(ctx.name) + ' 님, 들어왔어요!</div>' +
          '<div class="kp-dim">✏️ 캐치마인드 — 그리고 맞혀요</div></div>';
        return;
      }
      if (cur.phase === 'draw') {
        if (amDrawer()) {
          el.innerHTML =
            '<div class="kp-pmeta">✏️ 내가 그릴 차례!</div>' +
            '<div class="kp-pq" style="font-size:22px">제시어: <span style="color:var(--kp-yellow)">' + esc(cur.word || '...') + '</span></div>' +
            '<canvas id="kpPad" class="kp-canvas pad"></canvas>' +
            '<div class="kp-dim" style="text-align:center;margin-top:8px">전자칠판에 그림이 나타나요</div>';
          canvas = el.querySelector('#kpPad'); setupPad();
        } else {
          el.innerHTML =
            '<div class="kp-pmeta">🔍 ' + esc(cur.drawer) + ' 가 그리는 중</div>' +
            '<div class="kp-pq" style="font-size:20px">전자칠판을 보고 맞혀요!</div>' +
            (guessed
              ? '<div class="kp-result kp-right">⭕ 정답!</div>'
              : '<div class="kp-guess-row">' +
                  '<input class="kp-input" id="kpGuess" maxlength="20" autocomplete="off" placeholder="정답 입력">' +
                  '<button class="kp-btn kp-enter" id="kpSend" style="margin-top:12px">제출 ▶</button>' +
                  '<div class="kp-err" id="kpGErr"></div>' +
                '</div>');
          if (!guessed) {
            var send = el.querySelector('#kpSend'), inp = el.querySelector('#kpGuess'), gerr = el.querySelector('#kpGErr');
            function submit() {
              var v = (inp.value || '').trim(); if (!v) return;
              ctx.answer({ guess: v });
              if (gerr) gerr.textContent = '"' + v + '" 제출! (맞으면 표시돼요)';
              inp.value = '';
            }
            if (send) send.onclick = submit;
            if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
          }
        }
        // 내가 winners 에 들었으면 잠금
        if (cur.winners && cur.winners.indexOf(ctx.name) !== -1 && !guessed) { guessed = true; render(); }
        return;
      }
      if (cur.phase === 'reveal') {
        var iWon = cur.winners && cur.winners.indexOf(ctx.name) !== -1;
        el.innerHTML =
          '<div class="kp-result ' + (iWon ? 'kp-right' : 'kp-noans') + '">' + (iWon ? '⭕ 맞혔어요!' : '🎨') + '</div>' +
          '<div class="kp-correctline">정답: ' + esc(cur.word) + '</div>' +
          '<div class="kp-dim">다음 라운드를 기다려요</div>';
        return;
      }
      if (cur.phase === 'end') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-big">🎉 끝!</div>' +
          (myScore !== null ? '<div class="kp-myscore">내 점수 ' + myScore + '점</div>' : '') +
          '<div class="kp-dim">잘했어요!</div></div>';
        return;
      }
    }

    /* drawer 패드 — 점진 조각 전송 */
    function setupPad() {
      if (!canvas) return;
      var w = canvas.clientWidth || 340, h = canvas.clientHeight || 340;
      canvas.width = w; canvas.height = h;
      ctx2d = canvas.getContext ? canvas.getContext('2d') : null;
      if (!canvas._bound) bindPointer();
    }
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return { x: Math.max(0, Math.min(1, cx / r.width)), y: Math.max(0, Math.min(1, cy / r.height)) };
    }
    function flush(done) {
      if (pts.length === 0) { if (done) ctx.answer({ seg: { sid: sid, pts: [], done: true } }); return; }
      ctx.answer({ seg: { sid: sid, pts: pts.slice(), done: !!done } });
      pts = done ? [] : [pts[pts.length - 1]]; // 연속성 위해 마지막 점 유지
    }
    function start(e) { e.preventDefault(); drawing = true; sid += 1; pts = [pos(e)]; }
    function move(e) {
      if (!drawing) return; e.preventDefault();
      var p = pos(e); pts.push(p);
      if (ctx2d && pts.length >= 2) {
        var a = pts[pts.length - 2];
        ctx2d.strokeStyle = '#222'; ctx2d.lineWidth = 4; ctx2d.lineCap = 'round';
        ctx2d.beginPath(); ctx2d.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx2d.lineTo(p.x * canvas.width, p.y * canvas.height); ctx2d.stroke();
      }
      if (pts.length >= FLUSH_EVERY) flush(false);
    }
    function end() { if (!drawing) return; drawing = false; flush(true); }
    function bindPointer() {
      canvas._bound = true;
      canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', end);
    }

    ctx.on('state', function (p) {
      if (p.phase === 'draw') {
        var newRound = !cur || cur.phase !== 'draw' || cur.round !== p.round;
        cur = Object.assign({}, cur, p);
        if (newRound) { guessed = false; sid = 0; isDrawer = amDrawer(); }
      } else if (p.phase === 'reveal') { cur = Object.assign({}, cur, p); }
      else if (p.phase === 'end') { cur = p; if (p.scores) myScore = p.scores[ctx.name] || 0; }
      render();
    });
    render();
  }

  window.Kple.register('catch_mind', { host: hostView, join: joinView });
})();
