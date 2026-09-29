/* ============================================================================
   K-edu 케이플 게임 #9 — 📞 그림전화놀이 (draw_phone)   [K2 · G8, 2026-09-29]
   ----------------------------------------------------------------------------
   체인 전화놀이. 사람 수만큼 체인이 동시에 돌아 전원이 매 단계 바쁘다.
     체인 i, 단계 k 의 담당 = players[(i + k) % N]  (시작 순간 순서 고정)
     k=0 : 제시어 보고 그림      k=1 : 그림 보고 글       k=2 : 글 보고 그림 …  (그림·글 번갈아)
   끝나면 **릴 공개**: 호스트 화면에 체인마다 「제시어 → 그림 → 글 → 그림 …」 변천사를 한 장씩. 여기가 폭소 포인트.
   점수 없음(순수 재미). 학습 모드 = config.words 에 차시 어휘.

   그림 = 획 벡터(co_draw·catch_mind 규약 계승, 0~1000 정수 정규화, 점 간격 솎음·상한 → 장당 ≤ 약 16KB).
     그리는 동안은 아무 데도 안 보인다(전화놀이라 공개 금지) → 점진 전송 없이 제출 때 한 번에.
   전달은 폰 하나마다 state 하나(`phase:'task', to:이름`) — 30명 그림을 한 메시지에 몰지 않는다.
   단계 마감 = 전원 제출 / 시간 끝(+유예) / 호스트 「지금 마감」. 폰은 자기 시계로 시간 끝에 자동 제출(안 그린 것도 그대로).
   KP-6 이탈자(bye) = 그 단계 자동 건너뜀(이전 내용 그대로 다음 사람에게) → 체인이 죽지 않는다.
   KP-4 단계 진행·마감 = 호스트 단독. 늦은 입장(시작 뒤 새 이름) = 관전(체인에 안 들어감), 같은 uid 재입장 = 자기 자리 유지.
   KP-1 해당 없음(정답 없음). 제시어는 그 체인 첫 사람 폰에만 task 로 감.

   config.words · config.steps(기본 = 인원, 2~6) · config.drawTime(ms, 기본 60000) · config.writeTime(ms, 기본 25000)
   state:
     { phase:'step', step, total, job:'draw'|'write', n, submitted:[...] }            ← 전원  (※ kind 는 코어 메시지 종류라 job 으로)
     { phase:'task', step, to, chain, job, prompt?, strokes?, time }                   ← 그 이름 폰만 씀
     { phase:'reveal', chain, chains, step, steps, job:'word'|'draw'|'write', text?, by } ← 전원(그림은 안 실림)
     { phase:'end' }
   answer: { chain, step, strokes:[[x,y,x,y,…],…] } | { chain, step, text }
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[draw_phone] kple-core.js 먼저 로드'); return; }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var WORDS = ['사과', '코끼리', '자동차', '무지개', '아이스크림', '강아지', '바나나', '비행기', '우산', '고래', '피자', '로봇'];
  var GRACE = 2500;          // 시간 끝 뒤 호스트 유예(폰 자동 제출 도착 기다림)
  var MAX_POINTS = 1800;     // 장당 점 상한(≈16KB)
  var MIN_GAP = 6;           // 0~1000 격자에서 이 거리보다 가까운 점은 솎음
  var MAX_TEXT = 30;

  /* ── 그림 그리기(공용) ── */
  function paint(canvas, strokes, color) {
    if (!canvas || !canvas.getContext) return;
    var w = canvas.clientWidth || canvas.width || 340, h = canvas.clientHeight || canvas.height || 340;
    canvas.width = w; canvas.height = h;
    var g = canvas.getContext('2d'); if (!g) return;
    g.clearRect(0, 0, w, h);
    g.strokeStyle = color || '#222'; g.lineWidth = Math.max(3, Math.round(w / 90)); g.lineCap = 'round'; g.lineJoin = 'round';
    (strokes || []).forEach(function (s) {
      if (!s || s.length < 2) return;
      g.beginPath();
      for (var i = 0; i + 1 < s.length; i += 2) {
        var x = s[i] / 1000 * w, y = s[i + 1] / 1000 * h;
        if (i === 0) { g.moveTo(x, y); if (s.length === 2) g.lineTo(x + .1, y); } else g.lineTo(x, y);
      }
      g.stroke();
    });
  }
  function countPoints(strokes) { var n = 0; (strokes || []).forEach(function (s) { n += s.length / 2; }); return n; }
  function kindOf(step) { return step % 2 === 0 ? 'draw' : 'write'; }

  /* ---------------- 호스트(전자칠판) ---------------- */
  function hostView(ctx) {
    var words = (ctx.config.words && ctx.config.words.length) ? ctx.config.words : WORDS;
    var drawTime = ctx.config.drawTime || 60000, writeTime = ctx.config.writeTime || 25000;
    var phase = 'lobby';
    var players = [];        // 시작 순간 순서 고정
    var gone = {};           // name -> true (이탈, KP-6)
    var chains = [];         // [{ word, entries:[ {kind, by, strokes|text, skipped} … ] }]
    var total = 0, step = -1;
    var submitted = {};      // name -> true (이번 단계)
    var timer = null, stepStartedAt = 0;
    var rv = { chain: 0, step: 0 };   // 릴 공개 커서 (step 0 = 제시어)

    function roster() { return ctx.getRoster(); }
    function party() { return ctx.party || null; }
    function active() { return players.filter(function (n) { return !gone[n]; }); }
    function assignee(chain, k) { return players[(chain + k) % players.length]; }
    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function stepTime(k) { return kindOf(k) === 'draw' ? drawTime : writeTime; }
    function head() {
      return '<div class="kp-host-bar">' +
          '<div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
            '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
          '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div>' +
        '</div>';
    }
    function chips(list, cls) { return list.map(function (n) { return '<span class="kp-chip' + (cls ? ' ' + cls : '') + '">' + esc(n) + '</span>'; }).join(''); }

    /* 체인의 마지막 유효 내용(건너뛴 단계는 통과) */
    function lastContent(ch) {
      for (var i = ch.entries.length - 1; i >= 0; i--) if (!ch.entries[i].skipped) return ch.entries[i];
      return { kind: 'word', text: ch.word };
    }
    function promptFor(chain) {
      var last = lastContent(chains[chain]);
      return last.kind === 'draw' ? { strokes: last.strokes } : { prompt: last.text };
    }

    /* ── 진행 ── */
    function start() {
      players = roster().slice(); gone = {};
      if (players.length < 2) return;
      total = ctx.config.steps || players.length;
      total = Math.max(2, Math.min(6, total, players.length));
      chains = players.map(function (_, i) { return { word: words[i % words.length], entries: [] }; });
      phase = 'step'; step = -1;
      var p = party();
      if (p && p.countdown) { try { p.countdown(3, beginStep); return; } catch (e) {} }
      beginStep();
    }
    function beginStep() {
      step += 1; submitted = {};
      chains.forEach(function (ch, i) {              // 이탈자 자리 = 즉시 건너뜀(KP-6)
        var who = assignee(i, step);
        if (gone[who]) ch.entries.push({ kind: kindOf(step), by: who, skipped: true });
      });
      stepStartedAt = Date.now();
      broadcastStep();
      sendTasks();
      clearTimer();
      timer = setTimeout(function () { if (phase === 'step') endStep(); }, stepTime(step) + GRACE);
      render();
      if (allIn()) endStep();                         // 전원 이탈 등
    }
    function broadcastStep() {
      ctx.sendState({ phase: 'step', step: step, total: total, job: kindOf(step), n: expected().length, submitted: Object.keys(submitted), time: stepTime(step) });
    }
    function taskOf(name) {                           // 이 사람이 이번 단계 맡은 체인
      for (var i = 0; i < chains.length; i++) if (assignee(i, step) === name && !gone[name]) return i;
      return -1;
    }
    function sendTask(name, delay) {
      var i = taskOf(name); if (i < 0 || submitted[name]) return;
      var msg = Object.assign({ phase: 'task', step: step, total: total, to: name, chain: i, job: kindOf(step),
                                time: Math.max(3000, stepTime(step) - (Date.now() - stepStartedAt)) }, promptFor(i));
      if (delay) setTimeout(function () { if (phase === 'step') ctx.sendState(msg); }, delay);
      else ctx.sendState(msg);
    }
    function sendTasks() {                            // 폰 하나마다 한 메시지, 60ms 간격(폭주 방지)
      active().forEach(function (n, k) { sendTask(n, k * 60); });
    }
    function expected() { return active().filter(function (n) { return taskOf(n) >= 0; }); }
    function allIn() { return expected().every(function (n) { return submitted[n]; }); }
    function endStep() {
      if (phase !== 'step') return;
      clearTimer();
      chains.forEach(function (ch, i) {              // 미제출 = 건너뜀(이전 내용 그대로 흐름)
        if (ch.entries.length <= step) ch.entries.push({ kind: kindOf(step), by: assignee(i, step), skipped: true });
      });
      if (step + 1 >= total) startReveal(); else beginStep();
    }
    function startReveal() {
      phase = 'reveal'; rv = { chain: 0, step: 0 };
      var p = party();
      if (p && p.drumroll) { try { p.drumroll(pushReveal); } catch (e) { pushReveal(); } } else pushReveal();
    }
    function revealItem() {
      var ch = chains[rv.chain]; if (!ch) return null;
      if (rv.step === 0) return { kind: 'word', text: ch.word, by: assignee(rv.chain, 0) };
      return ch.entries[rv.step - 1] || null;
    }
    function pushReveal() {
      var it = revealItem(); if (!it) return;
      ctx.sendState({ phase: 'reveal', chain: rv.chain, chains: chains.length, step: rv.step, steps: total, job: it.kind,
                      text: it.kind === 'draw' ? undefined : it.text, by: it.by, skipped: !!it.skipped });
      render();
    }
    function revealNext() {
      if (rv.step < total) rv.step += 1;
      else if (rv.chain + 1 < chains.length) { rv.chain += 1; rv.step = 0; }
      else { endGame(); return; }
      pushReveal();
    }
    function revealPrev() {
      if (rv.step > 0) rv.step -= 1;
      else if (rv.chain > 0) { rv.chain -= 1; rv.step = total; }
      pushReveal();
    }
    function endGame() { phase = 'end'; clearTimer(); ctx.sendState({ phase: 'end' }); render(); }
    function resync(name) {
      if (phase === 'step') { broadcastStep(); if (name) sendTask(name, 0); }
      else if (phase === 'reveal') pushReveal();
      else if (phase === 'end') ctx.sendState({ phase: 'end' });
    }

    /* ── 화면 ── */
    function render() {
      var el = ctx.el; if (!el) return;
      var r = roster();
      if (phase === 'lobby') {
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-big">📞 그림전화놀이</div>' +
            '<div class="kp-dim" style="font-size:18px;margin:-6px 0 10px">제시어 → 그림 → 글 → 그림 … 마지막에 변천사 공개!</div>' +
            '<div class="kp-big" style="font-size:clamp(26px,5vw,42px)">참가자 ' + r.length + '명</div>' +
            '<div class="kp-roster">' + (r.length ? chips(r) : '<span class="kp-dim">학생들이 방코드로 들어오면 여기 떠요</span>') + '</div>' +
            '<div class="kp-dim" style="margin:4px 0 12px">' + (r.length < 2 ? '2명부터 시작할 수 있어요' :
              '단계 ' + Math.max(2, Math.min(6, ctx.config.steps || r.length, r.length)) + '개 · 그리기 ' + Math.round(drawTime / 1000) + '초 · 글쓰기 ' + Math.round(writeTime / 1000) + '초') + '</div>' +
            '<button class="kp-btn kp-go" id="kpStart"' + (r.length >= 2 ? '' : ' disabled') + '>게임 시작 ▶</button>' +
          '</div>';
        var b = el.querySelector('#kpStart'); if (b) b.onclick = start;

      } else if (phase === 'step') {
        var exp = expected(), done = exp.filter(function (n) { return submitted[n]; }), left = exp.filter(function (n) { return !submitted[n]; });
        var draw = kindOf(step) === 'draw';
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">단계 ' + (step + 1) + ' / ' + total + '</div>' +
            '<div class="kp-big">' + (draw ? '✏️ 그리는 중' : '📝 글 쓰는 중') + '</div>' +
            '<div class="kp-dim" style="font-size:18px;margin-top:-8px">' + (draw ? (step === 0 ? '제시어를 보고 그려요' : '앞사람 글을 보고 그려요') : '앞사람 그림을 보고 무엇인지 써요') + ' · 전자칠판엔 아직 안 보여요 🤫</div>' +
            '<div class="kp-timerbar host" style="margin-top:18px"><span style="animation-duration:' + stepTime(step) + 'ms"></span></div>' +
            '<div class="kp-dp-count">제출 <b>' + done.length + '</b> / ' + exp.length + '</div>' +
            '<div class="kp-roster">' + chips(done, 'kp-chip-alive') + chips(left) + '</div>' +
            '<button class="kp-btn kp-go" id="kpEnd">지금 마감 ▶</button>' +
          '</div>';
        var e = el.querySelector('#kpEnd'); if (e) e.onclick = endStep;

      } else if (phase === 'reveal') {
        var it = revealItem(), ch = chains[rv.chain];
        var isLast = rv.chain + 1 >= chains.length && rv.step >= total;
        var body;
        if (!it || it.skipped) body = '<div class="kp-dp-skip">⏭ ' + esc(it ? it.by : '') + ' — 건너뜀</div>';
        else if (it.kind === 'word') body = '<div class="kp-dp-word">제시어<br><b>' + esc(it.text) + '</b></div>';
        else if (it.kind === 'draw') body = '<canvas id="kpRv" class="kp-canvas host kp-dp-rv"></canvas>';
        else body = '<div class="kp-dp-text">「' + esc(it.text || '') + '」</div>';
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-qmeta">📞 릴 공개 · 체인 ' + (rv.chain + 1) + ' / ' + chains.length + ' · ' + (rv.step === 0 ? '제시어' : (rv.step + ' / ' + total)) + '</div>' +
            '<div class="kp-dp-trail">' + trailHTML(ch) + '</div>' +
            '<div class="kp-dp-by">' + (it ? (it.kind === 'word' ? '처음 그린 사람: ' : (it.kind === 'draw' ? '✏️ ' : '📝 ')) + esc(it.by) : '') + '</div>' +
            body +
            '<div class="kp-dp-nav">' +
              '<button class="kp-btn" id="kpPrev"' + (rv.chain === 0 && rv.step === 0 ? ' disabled' : '') + '>◀</button>' +
              '<button class="kp-btn kp-go" id="kpNext">' + (isLast ? '끝! 🏁' : '다음 ▶') + '</button>' +
            '</div>' +
          '</div>';
        var cv = el.querySelector('#kpRv'); if (cv && it && it.kind === 'draw') paint(cv, it.strokes, '#222');
        var nx = el.querySelector('#kpNext'); if (nx) nx.onclick = revealNext;
        var pv = el.querySelector('#kpPrev'); if (pv) pv.onclick = revealPrev;

      } else if (phase === 'end') {
        el.innerHTML = head() +
          '<div class="kp-stage">' +
            '<div class="kp-big">🎉 끝!</div>' +
            '<div class="kp-dim">' + chains.length + '개 체인 · 어느 전화가 제일 엉뚱했나요?</div>' +
          '</div>';
      }
    }
    function trailHTML(ch) {                        // 체인 변천사 한 줄 요약(공개된 칸까지만 채움)
      var cells = ['🔤'];
      for (var k = 0; k < total; k++) cells.push(kindOf(k) === 'draw' ? '✏️' : '📝');
      return cells.map(function (c, i) {
        var seen = i <= rv.step;
        var en = i === 0 ? null : ch.entries[i - 1];
        return '<span class="kp-dp-cell' + (i === rv.step ? ' now' : '') + (seen ? ' seen' : '') + (en && en.skipped ? ' skip' : '') + '">' + c + '</span>';
      }).join('<span class="kp-dp-arrow">→</span>');
    }

    /* ── 수신 ── */
    ctx.on('join', function (p) {
      if (phase === 'step' && gone[p.name]) delete gone[p.name];   // 재입장 = 자기 자리 복귀(이미 건너뛴 단계는 그대로)
      resync(p.name); render();
    });
    ctx.on('bye', function (p) {
      if (phase === 'step' && players.indexOf(p.name) >= 0) {
        gone[p.name] = true;
        for (var c = 0; c < chains.length; c++) if (assignee(c, step) === p.name && chains[c].entries.length <= step) chains[c].entries.push({ kind: kindOf(step), by: p.name, skipped: true });
        broadcastStep();
        if (allIn()) { endStep(); return; }
      }
      render();
    });
    ctx.on('answer', function (p) {
      if (phase !== 'step' || p.__pty) return;
      if (p.step !== step || typeof p.chain !== 'number') return;                   // 옛 단계 답 무시
      if (assignee(p.chain, step) !== p.name || gone[p.name] || submitted[p.name]) return;   // KP-4: 담당 아님·중복
      var ch = chains[p.chain]; if (!ch || ch.entries.length > step) return;
      if (kindOf(step) === 'draw') {
        var strokes = Array.isArray(p.strokes) ? p.strokes.filter(function (s) { return Array.isArray(s) && s.length >= 2; }) : [];
        while (countPoints(strokes) > MAX_POINTS && strokes.length) strokes.pop();   // 상한 방어(폰이 이미 솎아 보냄)
        ch.entries.push({ kind: 'draw', by: p.name, strokes: strokes, skipped: strokes.length === 0 });
      } else {
        var text = String(p.text || '').trim().slice(0, MAX_TEXT);
        ch.entries.push({ kind: 'write', by: p.name, text: text, skipped: !text });
      }
      submitted[p.name] = true;
      broadcastStep(); render();
      if (allIn()) endStep();
    });
    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var cur = null;          // 마지막 phase state
    var task = null;         // 내 task
    var sent = false;        // 이번 단계 제출함
    var canvas = null, g = null, drawing = false, strokes = [], curStroke = null, pointCount = 0;
    var localTimer = null;

    function clearLocal() { if (localTimer) { clearTimeout(localTimer); localTimer = null; } }
    function render() {
      var el = ctx.el; if (!el) return;
      if (!cur || cur.phase === 'lobby') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div>' + esc(ctx.name) + ' 님, 들어왔어요!</div>' +
          '<div class="kp-dim">📞 그림전화놀이 — 그림과 글이 돌고 돌아요</div></div>';
        return;
      }
      if (cur.phase === 'step') {
        if (task && task.step === cur.step && !sent) { renderTask(el); return; }
        el.innerHTML = '<div class="kp-wait"><div class="kp-wait-dot"></div>' +
          '<div class="kp-pmeta">단계 ' + (cur.step + 1) + ' / ' + cur.total + '</div>' +
          (sent ? '<div class="kp-result kp-right" style="font-size:34px">📨 보냈어요!</div><div class="kp-dim">다른 친구들을 기다려요</div>'
                : '<div class="kp-dim">차례를 기다려요</div>') + '</div>';
        return;
      }
      if (cur.phase === 'reveal') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-big" style="font-size:40px">📺</div>' +
          '<div class="kp-pq" style="font-size:20px">전자칠판을 봐요!</div>' +
          '<div class="kp-pmeta">체인 ' + (cur.chain + 1) + ' / ' + cur.chains + '</div>' +
          (cur.job === 'word' ? '<div class="kp-dp-pword">제시어: <b>' + esc(cur.text) + '</b></div>' :
           cur.job === 'write' && !cur.skipped ? '<div class="kp-dp-pword">📝 「' + esc(cur.text) + '」</div>' : '') +
          '</div>';
        return;
      }
      if (cur.phase === 'end') {
        el.innerHTML = '<div class="kp-wait"><div class="kp-big">🎉 끝!</div><div class="kp-dim">재미있었어요?</div></div>';
      }
    }
    function renderTask(el) {
      var t = task, draw = t.job === 'draw';
      el.innerHTML =
        '<div class="kp-pmeta">단계 ' + (t.step + 1) + ' / ' + t.total + ' · ' + (draw ? '✏️ 그려요' : '📝 무엇일까요?') + '</div>' +
        '<div class="kp-timerbar"><span style="animation-duration:' + t.time + 'ms"></span></div>' +
        (draw
          ? '<div class="kp-pq" style="font-size:22px">' + (t.step === 0 ? '제시어: ' : '앞사람 글: ') + '<span style="color:var(--kp-yellow)">' + esc(t.prompt || '') + '</span></div>' +
            '<canvas id="kpPad" class="kp-canvas pad"></canvas>' +
            '<div class="kp-dp-tools"><button class="kp-btn" id="kpUndo">↩ 한 획 지우기</button><button class="kp-btn kp-enter" id="kpSend">보내기 ▶</button></div>'
          : '<div class="kp-dim" style="text-align:center">앞사람이 그린 그림이에요</div>' +
            '<canvas id="kpView" class="kp-canvas pad kp-dp-view"></canvas>' +
            '<div class="kp-guess-row"><input class="kp-input" id="kpText" maxlength="' + MAX_TEXT + '" autocomplete="off" placeholder="이 그림은…">' +
            '<button class="kp-btn kp-enter" id="kpSend" style="margin-top:12px">보내기 ▶</button></div>');
      if (draw) {
        canvas = el.querySelector('#kpPad'); strokes = []; curStroke = null; pointCount = 0; setupPad();
        var u = el.querySelector('#kpUndo'); if (u) u.onclick = function () { strokes.pop(); pointCount = countPoints(strokes); paint(canvas, strokes); };
        el.querySelector('#kpSend').onclick = submit;
      } else {
        var v = el.querySelector('#kpView'); paint(v, t.strokes || []);
        var inp = el.querySelector('#kpText');
        el.querySelector('#kpSend').onclick = submit;
        if (inp) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); }); try { inp.focus(); } catch (e) {} }
      }
    }
    function submit() {
      if (!task || sent) return;
      clearLocal();
      if (task.job === 'draw') ctx.answer({ chain: task.chain, step: task.step, strokes: strokes.slice() });
      else { var inp = ctx.el && ctx.el.querySelector('#kpText'); ctx.answer({ chain: task.chain, step: task.step, text: (inp && inp.value || '').trim().slice(0, MAX_TEXT) }); }
      sent = true; render();
    }

    /* 패드 — 획 벡터, 0~1000 정수, 가까운 점 솎음, 상한 */
    function setupPad() {
      if (!canvas) return;
      var w = canvas.clientWidth || 340, h = canvas.clientHeight || 340;
      canvas.width = w; canvas.height = h;
      g = canvas.getContext ? canvas.getContext('2d') : null;
      if (!canvas._bound) bindPointer();
    }
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return [Math.round(Math.max(0, Math.min(1, cx / (r.width || 1))) * 1000), Math.round(Math.max(0, Math.min(1, cy / (r.height || 1))) * 1000)];
    }
    function start(e) {
      e.preventDefault(); if (sent || pointCount >= MAX_POINTS) return;
      drawing = true; var p = pos(e); curStroke = [p[0], p[1]]; strokes.push(curStroke); pointCount += 1;
    }
    function move(e) {
      if (!drawing || !curStroke) return; e.preventDefault();
      var p = pos(e), n = curStroke.length, lx = curStroke[n - 2], ly = curStroke[n - 1];
      if (Math.abs(p[0] - lx) + Math.abs(p[1] - ly) < MIN_GAP) return;
      if (pointCount >= MAX_POINTS) { end(); return; }
      curStroke.push(p[0], p[1]); pointCount += 1;
      if (g && canvas) {
        g.strokeStyle = '#222'; g.lineWidth = 4; g.lineCap = 'round';
        g.beginPath(); g.moveTo(lx / 1000 * canvas.width, ly / 1000 * canvas.height);
        g.lineTo(p[0] / 1000 * canvas.width, p[1] / 1000 * canvas.height); g.stroke();
      }
    }
    function end() { if (!drawing) return; drawing = false; if (g && curStroke && curStroke.length === 2) { g.beginPath(); g.arc(curStroke[0] / 1000 * canvas.width, curStroke[1] / 1000 * canvas.height, 2, 0, 6.3); g.fillStyle = '#222'; g.fill(); } curStroke = null; }
    function bindPointer() {
      canvas._bound = true;
      canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', end);
    }

    ctx.on('state', function (p) {
      if (p.phase === 'task') {
        if (p.to !== ctx.name) return;                                  // 내 것만
        if (task && task.step === p.step && task.chain === p.chain) return;   // 재전송 = 무시(그리던 것 유지)
        task = p; sent = false; clearLocal();
        localTimer = setTimeout(function () { submit(); }, Math.max(1000, p.time || 1000));   // 시간 끝 = 있는 그대로 자동 제출
        if (cur && cur.phase === 'step' && cur.step !== p.step) cur = Object.assign({}, cur, { step: p.step, total: p.total });
        if (!cur || cur.phase !== 'step') cur = { phase: 'step', step: p.step, total: p.total };
        render(); return;
      }
      if (p.phase === 'step') {
        var newStep = !cur || cur.phase !== 'step' || cur.step !== p.step;
        cur = p;
        if (newStep && !(task && task.step === p.step)) { sent = false; task = null; clearLocal(); }
      } else if (p.phase === 'reveal' || p.phase === 'end') { cur = p; task = null; clearLocal(); }
      else return;
      render();
    });
    render();
  }

  window.Kple.register('draw_phone', { host: hostView, join: joinView });
})();
