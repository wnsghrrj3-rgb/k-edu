/* ============================================================================
   K-edu 케이플 게임 #3 — 협동 캔버스 (co_draw)
   ----------------------------------------------------------------------------
   드로잉 계열의 토대. 반 전체가 폰에서 그린 획이 전자칠판 한 캔버스에 색깔별로
   모인다. 이 위에 캐치마인드·그림전화놀이가 얹힌다(코어는 안 건드림).

   동기화 방식(획 단위):
     - 참가자가 한 획(pointerdown~up)을 다 그리면 정규화 좌표(0~1) 배열을 보냄.
       answer { stroke: [{x,y}, ...] }   ← 점마다 X, 획 단위로 묶어 메시지 수 절약.
     - 호스트는 보낸 사람 이름으로 색을 정해 전자칠판 캔버스에 polyline 그림.
       (좌표가 0~1 이라 캔버스 크기 달라도 비율로 맞음. 기기 해상도 무관.)
     - 호스트 "지우기" → state{clear:true} → 전원 캔버스 초기화.

   모드: 일반(자유 그리기) / 학습(config.topic = "○○를 그려 봐요").
   점수 없음 → 사회적 비교 무관.
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[co_draw] kple-core.js 먼저 로드'); return; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var PALETTE = ['#ff5d5d', '#38bdf8', '#ffd23f', '#2dd4bf', '#a78bfa', '#fb923c', '#f472b6', '#4ade80'];
  function colorFor(roster, name) {
    var i = roster.indexOf(name);
    return PALETTE[(i < 0 ? roster.length : i) % PALETTE.length];
  }

  /* ---------------- 호스트(전자칠판) ---------------- */
  function hostView(ctx) {
    var topic = ctx.config.topic || '';
    var strokeCount = 0;
    var ctx2d = null, canvas = null;

    function render() {
      var el = ctx.el; if (!el) return;
      var roster = ctx.getRoster();
      el.innerHTML =
        '<div class="kp-host-bar">' +
          '<div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
            '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
          '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력</div>' +
        '</div>' +
        '<div class="kp-draw-head">' +
          '<div class="kp-draw-title">🎨 ' + (topic ? esc(topic) + ' 그려 봐요' : '함께 그리기') + '</div>' +
          '<button class="kp-btn kp-clear" id="kpClear">지우기 🧹</button>' +
        '</div>' +
        '<canvas id="kpCanvas" class="kp-canvas host"></canvas>' +
        '<div class="kp-legend">' +
          (roster.length
            ? roster.map(function (n) {
                return '<span class="kp-leg"><i style="background:' + colorFor(roster, n) + '"></i>' + esc(n) + '</span>';
              }).join('')
            : '<span class="kp-dim">학생들이 들어오면 색이 배정돼요</span>') +
          '<span class="kp-draw-cnt">획 ' + strokeCount + '개</span>' +
        '</div>';

      canvas = el.querySelector('#kpCanvas');
      setupCanvas();
      var c = el.querySelector('#kpClear'); if (c) c.onclick = clearAll;
    }

    function setupCanvas() {
      if (!canvas) return;
      // 표시 크기 기준 내부 해상도 맞춤(레티나 무시한 PoC 단순화)
      var w = canvas.clientWidth || 880, h = canvas.clientHeight || 460;
      canvas.width = w; canvas.height = h;
      ctx2d = canvas.getContext ? canvas.getContext('2d') : null;
    }

    function drawStroke(name, pts) {
      strokeCount += 1;
      if (!ctx2d || !pts || pts.length === 0) { paintCounter(); return; }
      var roster = ctx.getRoster();
      ctx2d.strokeStyle = colorFor(roster, name);
      ctx2d.lineWidth = 5; ctx2d.lineCap = 'round'; ctx2d.lineJoin = 'round';
      ctx2d.beginPath();
      pts.forEach(function (p, i) {
        var x = p.x * canvas.width, y = p.y * canvas.height;
        if (i === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);
      });
      if (pts.length === 1) { ctx2d.lineTo(pts[0].x * canvas.width + 0.1, pts[0].y * canvas.height); }
      ctx2d.stroke();
      paintCounter();
    }
    function paintCounter() {
      var el = ctx.el; if (!el) return;
      var cnt = el.querySelector('.kp-draw-cnt'); if (cnt) cnt.textContent = '획 ' + strokeCount + '개';
    }
    function clearAll() {
      strokeCount = 0;
      if (ctx2d && canvas) ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      paintCounter();
      ctx.sendState({ clear: true, topic: topic });
    }

    ctx.on('join', function () { render(); ctx.sendState({ topic: topic }); });
    ctx.on('bye', function () { render(); });
    ctx.on('answer', function (p) { if (p.stroke) drawStroke(p.name, p.stroke); });

    render();
  }

  /* ---------------- 참가자(폰) ---------------- */
  function joinView(ctx) {
    var topic = '';
    var canvas = null, ctx2d = null, drawing = false, pts = [];

    function render() {
      var el = ctx.el; if (!el) return;
      el.innerHTML =
        '<div class="kp-pmeta">🎨 ' + (topic ? esc(topic) + ' 그려 봐요' : '함께 그리기') + '</div>' +
        '<canvas id="kpPad" class="kp-canvas pad"></canvas>' +
        '<div class="kp-dim" style="text-align:center;margin-top:10px">전자칠판에 모두의 그림이 모여요</div>';
      canvas = el.querySelector('#kpPad');
      setup();
    }

    function setup() {
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
    function start(e) { e.preventDefault(); drawing = true; pts = [pos(e)]; }
    function move(e) {
      if (!drawing) return; e.preventDefault();
      var p = pos(e); pts.push(p);
      if (ctx2d && pts.length >= 2) {
        var a = pts[pts.length - 2], b = p;
        ctx2d.strokeStyle = '#222'; ctx2d.lineWidth = 4; ctx2d.lineCap = 'round';
        ctx2d.beginPath();
        ctx2d.moveTo(a.x * canvas.width, a.y * canvas.height);
        ctx2d.lineTo(b.x * canvas.width, b.y * canvas.height);
        ctx2d.stroke();
      }
    }
    function end() {
      if (!drawing) return; drawing = false;
      if (pts.length) ctx.answer({ stroke: pts });   // 한 획 통째 전송
      pts = [];
    }
    function bindPointer() {
      canvas._bound = true;
      canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', end);
    }

    ctx.on('state', function (p) {
      if (typeof p.topic === 'string') topic = p.topic;
      if (p.clear && ctx2d && canvas) ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      // topic 갱신 반영(그림은 유지하려고 clear 아닐 땐 헤더만 갱신)
      var el = ctx.el; var meta = el && el.querySelector('.kp-pmeta');
      if (meta) meta.innerHTML = '🎨 ' + (topic ? esc(topic) + ' 그려 봐요' : '함께 그리기');
    });

    render();
  }

  window.Kple.register('co_draw', { host: hostView, join: joinView });
})();
