/* ============================================================================
   K-edu 케이배틀(KBattle) — 3층 모드 #4 「보물 지도」 (kb-mode-treasure.js)
   ----------------------------------------------------------------------------
   헌법 근거: 제4조(모드 6종 — **협동+개인**·학년칸 중 / "정답으로 지도 밝힘, 스트릭 달성자 힌트"),
             제3조(감점 없음), KP-1(정답 공개 전 미탑재), KB-2(타인 노출 금지).

   ⭐ 이 모드가 푸는 문제 하나:
      **잘하는 아이를 어떻게 다룰 것인가.**
      레이스에선 잘하는 아이가 앞서간다 → 뒤에 남는 아이가 생긴다.
      퍼즐에선 잘하는 아이도 그냥 조각 하나다 → 잘해도 티가 안 난다.
      보물지도의 답: **잘하는 아이는 앞서가는 대신, 반에 도움이 된다.**
        연속 정답(스트릭 3) → 그 아이에게만 **보물 방향 힌트**가 뜬다.
        그 아이는 "내가 저쪽인 것 같아!" 하고 **말로** 반을 이끈다.
        빨라서 이기는 게 아니라, 빨라서 **쓸모가 있다.**

   규칙:
     - 반 전체 정답 1개 = 지도 한 칸이 밝아진다(협동). 24칸(6×4).
     - **오답·미응답 = 아무 일 없음. 밝혀진 칸은 절대 다시 어두워지지 않는다**(제3조).
     - 보물은 방마다 다른 한 칸에 숨어 있다(방코드 시드 → 결정적).
     - 스트릭 3·5·7 도달 → 그 아이 폰에만 힌트(방향 → 행/열 → 정확한 줄).
     - 보물 칸이 밝아지면 **발견!** → 반 전체 협동 성공(제5조 coopCleared).
     - 못 찾고 문제가 끝나도 벌 없음 — 마지막에 어디 있었는지 보여주고 웃으면 된다.

   ⛔ KP-1 정신: 보물 위치는 **발견 전까지 참가자에게 안 보낸다.** 힌트만 간다.
   ⛔ KB-2: 폰엔 본인 힌트만. 누가 힌트를 받았는지 목록 없음.
   ============================================================================ */
(function () {
  var root = (typeof window !== 'undefined') ? window : global;
  var KBModes = root.KBModes = root.KBModes || {};
  if (KBModes.treasure) return;

  var COLS = 6, ROWS = 4;
  var CELLS = COLS * ROWS;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function injectStyle() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('kb-treasure-style')) return;
    var s = document.createElement('style');
    s.id = 'kb-treasure-style';
    s.textContent = [
      '.kb-tr{margin:0 0 18px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06)}',
      '.kb-tr-head{display:flex;justify-content:space-between;align-items:center;',
      '  font-weight:900;font-size:19px;margin-bottom:12px}',
      '.kb-tr-n{color:#ffd23f}',
      '.kb-tr-map{display:grid;grid-template-columns:repeat(' + COLS + ',1fr);gap:5px}',
      '.kb-tr-cell{aspect-ratio:1;border-radius:9px;background:#1f2147;',
      '  border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;',
      '  font-size:22px;transition:background .5s ease,transform .4s cubic-bezier(.22,1,.36,1)}',
      '.kb-tr-cell.lit{background:linear-gradient(135deg,#2dd4bf33,#38bdf833);',
      '  border-color:rgba(45,212,191,.45);animation:kbTrLit .5s ease}',
      '@keyframes kbTrLit{from{transform:scale(.75);opacity:.3}to{transform:scale(1);opacity:1}}',
      '.kb-tr-cell.gold{background:linear-gradient(135deg,#ffd23f,#ff922b);border-color:#ffd23f;',
      '  animation:kbTrGold .7s ease}',
      '@keyframes kbTrGold{0%{transform:scale(.6) rotate(-12deg)}60%{transform:scale(1.25)}100%{transform:scale(1)}}',
      '.kb-tr-msg{margin-top:12px;text-align:center;font-weight:900;font-size:22px;color:#ffd23f;min-height:28px}',
      /* 폰 — 우리 반 진행 + 내 힌트 (KB-2) */
      '.kb-tr-bar{margin:0 0 14px;padding:11px 14px;border-radius:14px;background:rgba(255,255,255,.06)}',
      '.kb-tr-bar-t{display:flex;justify-content:space-between;font-weight:900;font-size:14px;margin-bottom:7px}',
      '.kb-tr-track{height:10px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden}',
      '.kb-tr-fill{display:block;height:100%;background:#2dd4bf;transition:width .5s cubic-bezier(.22,1,.36,1)}',
      '.kb-tr-hint{margin-top:9px;padding:9px 11px;border-radius:11px;font-weight:900;font-size:14px;',
      '  background:rgba(255,210,63,.15);border:2px solid rgba(255,210,63,.45);color:#ffd23f;',
      '  animation:kbPop .4s ease}',
      '.kb-tr-none{margin-top:7px;font-weight:800;font-size:12px;color:rgba(255,255,255,.5)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function treasure(ctx) {
    injectStyle();
    var getRoster = ctx.getRoster;

    // 보물 위치 — 방마다 다르다. 방코드 시드 → 결정적(재접속해도 안 바뀜).
    var spot = hash('kb-treasure-' + ctx.roomCode) % CELLS;
    var srow = Math.floor(spot / COLS), scol = spot % COLS;

    // 밝힐 칸 순서 — 섞는다(왼쪽부터 밝히면 지도가 아니라 진행바가 된다)
    var order = [];
    for (var i = 0; i < CELLS; i++) order.push(i);
    for (var j = order.length - 1; j > 0; j--) {
      var k = hash('kb-ord-' + ctx.roomCode + '-' + j) % (j + 1);
      var t = order[j]; order[j] = order[k]; order[k] = t;
    }

    var correct = 0;             // 반 전체 정답 수 = 밝힌 칸 수 (절대 안 줄어든다)
    var found = false;
    var hints = {};              // { name: 힌트 문구 }  ← 폰에서 본인 것만 본다
    var mine = {};               // { name: 내가 밝힌 칸 수 }
    var built = false, cellEls = [];

    function lit() { return Math.min(CELLS, correct); }
    function litSet() {
      var s = {};
      for (var i = 0; i < lit(); i++) s[order[i]] = 1;
      return s;
    }
    function checkFound() {
      if (found) return;
      if (litSet()[spot]) found = true;
    }

    /* 힌트 — 스트릭이 오를수록 좁아진다. ⛔ 정확한 칸은 절대 안 알려준다(그럼 게임이 끝난다). */
    function hintFor(streak) {
      if (streak >= 7) return '보물은 ' + (srow + 1) + '번째 줄에 있어! (위에서 ' + (srow + 1) + '번째)';
      if (streak >= 5) return '보물은 ' + (scol < COLS / 2 ? '왼쪽' : '오른쪽') + ' ' +
                              (srow < ROWS / 2 ? '위' : '아래') + '쪽에 있어!';
      if (streak >= 3) return '보물은 ' + (scol < COLS / 2 ? '왼쪽' : '오른쪽') + '에 있어!';
      return null;
    }

    function onAnswer(e) {
      if (e.correct) {
        correct++;
        mine[e.name] = (mine[e.name] || 0) + 1;
        checkFound();
        // 잘하는 아이는 앞서가는 대신 **반에 도움이 된다** — 이 모드의 핵심
        var h = hintFor(e.streak | 0);
        if (h) hints[e.name] = h;
      }
      // 오답·미응답 = 아무 일 없음. 밝혀진 칸은 안 어두워진다.
    }

    function publicState() {
      return { id: 'treasure', cols: COLS, rows: ROWS, cells: CELLS,
               lit: lit(), found: found, hints: hints, mine: mine,
               cleared: found,                // 보물 발견 = 반 전체 협동 성공 (제5조 coopCleared)
               spot: found ? spot : null };   // ⛔ KP-1: 찾기 전엔 위치를 안 보낸다
    }

    /* ---- 전자칠판 ---- */
    function hostLayer(el) {
      if (!built) build(el);
      var s = litSet();
      var n = lit();
      var head = el.querySelector('.kb-tr-n');
      if (head) head.textContent = n + ' / ' + CELLS;
      cellEls.forEach(function (c, idx) {
        var on = !!s[idx];
        if (on && !c.classList.contains('lit')) c.classList.add('lit');
        if (found && idx === spot) {
          c.classList.add('gold');
          c.textContent = '💰';
        }
      });
      var msg = el.querySelector('.kb-tr-msg');
      if (msg) msg.textContent = found ? '💰 보물을 찾았어요! 우리 반이 해냈어요' : '';
    }

    function build(el) {
      el.className = 'kb-tr';
      el.innerHTML =
        '<div class="kb-tr-head"><span>🗺 우리 반이 지도를 밝혀요</span>' +
          '<span class="kb-tr-n">0 / ' + CELLS + '</span></div>' +
        '<div class="kb-tr-map"></div>' +
        '<div class="kb-tr-msg"></div>';
      var map = el.querySelector('.kb-tr-map');
      cellEls = [];
      for (var i = 0; i < CELLS; i++) {
        var d = document.createElement('div');
        d.className = 'kb-tr-cell';
        map.appendChild(d);
        cellEls.push(d);
      }
      built = true;
    }

    /* ---- 폰: 우리 반 진행 + 내 힌트만 (KB-2) ---- */
    function playerLayer(el, my) {
      var st = my && my.state;
      if (!st || st.id !== 'treasure') return;
      var pct = Math.round(st.lit / st.cells * 100);
      var h = st.hints && st.hints[my.name];
      var mineN = (st.mine && st.mine[my.name]) || 0;
      el.className = 'kb-tr-bar';
      el.innerHTML =
        '<div class="kb-tr-bar-t"><span>🗺 우리 반</span><span>' + st.lit + ' / ' + st.cells + '</span></div>' +
        '<div class="kb-tr-track"><i class="kb-tr-fill" style="width:' + pct + '%"></i></div>' +
        (st.found ? '<div class="kb-tr-hint">💰 보물을 찾았어요!</div>'
          : (h ? '<div class="kb-tr-hint">🔍 ' + esc(h) + '<br>' +
                 '<span style="font-size:11px;opacity:.8">친구들에게 말해 줘!</span></div>'
               : '<div class="kb-tr-none">' +
                   (mineN ? '내가 밝힌 칸 ' + mineN + '개 · 연속으로 맞히면 힌트가 와요'
                          : '3개 연속 맞히면 보물 힌트를 받아요') +
                 '</div>'));
      // ⛔ 누가 힌트를 받았는지 목록 없음 (KB-2)
    }

    return {
      onAnswer: onAnswer,
      publicState: publicState,
      hostLayer: hostLayer,
      playerLayer: playerLayer,
      _test: { get lit() { return lit(); }, get found() { return found; },
               get spot() { return spot; }, get hints() { return hints; },
               get order() { return order.slice(); }, CELLS: CELLS }
    };
  }

  KBModes.treasure = treasure;
})();
