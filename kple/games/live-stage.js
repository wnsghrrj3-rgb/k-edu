/* ============================================================================
   K-edu 케이플 게임 #5 — 살아나는 무대 (live_stage)
   ----------------------------------------------------------------------------
   반 전체가 각자 폰에서 그림을 그리고 "무대로 보내기"를 누르면,
   그 그림이 전자칠판 하나의 무대에 나타나 스스로 헤엄치고 날고 뛴다.

   동기화 방식(획 단위 — co_draw 규약 계승):
     참가자 → 호스트 : answer { art: { s:[{c,w,p:[x,y,...]}...], m:'auto', f:1 } }
                       좌표는 0~1000 정규화 정수라 폰 해상도가 달라도 같은 그림이 된다.
                       PNG를 통째 보내지 않는 이유 = 메시지가 수십 KB로 불어나서.
     호스트 → 참가자 : state { stage, count, cleared }
                       (참가자 화면 머리글에 "지금은 🌊 바다 무대" 표시)

   규칙:
     - 한 사람당 한 마리. 다시 보내면 자기 그림이 새 그림으로 갈아탄다(무대가 안 넘침).
     - 정원 40. 넘으면 가장 오래 있던 그림이 자리를 내준다.
     - 무대 전환·먹이 주기·콕 찌르기는 호스트(교사)만. 학생은 그리기에 집중.

   점수 없음 → 사회적 비교 무관. co_draw와 같은 자리.
   ============================================================================ */
(function () {
  if (!window.Kple) { console.error('[live_stage] kple-core.js 먼저 로드'); return; }
  if (!window.LiveStage) { console.error('[live_stage] /labs/livestage-core.js 먼저 로드'); return; }

  var LS = window.LiveStage;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ═════════ 호스트 = 전자칠판 무대 ═════════ */
  function hostView(ctx) {
    var run = LS.createStageRun({ stage: 'sea' });
    var decor = LS.art.makeDecor();
    var bubbles = [], pops = [];
    var canvas = null, c2d = null, W = 0, H = 0, raf = 0, DPR = 1;

    function render() {
      var el = ctx.el; if (!el) return;
      el.innerHTML =
        '<div class="kp-host-bar">' +
          '<div class="kp-code-box"><span class="kp-code-label">방코드</span>' +
            '<span class="kp-code">' + esc(ctx.roomCode) + '</span></div>' +
          '<div class="kp-join-url">학생: keduclass.com/kple/play.html → 방코드 입력 → 그림 그려서 보내기</div>' +
        '</div>' +
        '<div class="kp-draw-head">' +
          '<div class="kp-ls-stages">' +
            LS.STAGES.map(function (s) {
              return '<button class="kp-btn kp-ls-stage' + (s.id === run.stage() ? ' on' : '') +
                     '" data-stage="' + s.id + '">' + s.emoji + ' ' + s.name + '</button>';
            }).join('') +
          '</div>' +
          '<button class="kp-btn kp-clear" id="kpLsClear">비우기 🧹</button>' +
        '</div>' +
        '<canvas id="kpLsCanvas" class="kp-canvas host"></canvas>' +
        '<div class="kp-legend">' +
          '<span class="kp-ls-count">무대가 비어 있어요</span>' +
          '<span class="kp-dim">무대를 누르면 먹이가 떨어져요 · 그림을 누르면 깜짝 놀라요</span>' +
        '</div>';

      canvas = el.querySelector('#kpLsCanvas');
      setupCanvas();

      el.querySelectorAll('.kp-ls-stage').forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute('data-stage');
          if (!run.setStage(id)) return;
          bubbles.length = 0;
          el.querySelectorAll('.kp-ls-stage').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          ctx.sendState({ stage: id, count: run.count() });
        };
      });
      var cl = el.querySelector('#kpLsClear');
      if (cl) cl.onclick = function () {
        run.clear(); bubbles.length = 0; pops.length = 0;
        paintCount();
        ctx.sendState({ stage: run.stage(), count: 0, cleared: true });
      };
    }

    function setupCanvas() {
      if (!canvas) return;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth || 880;
      H = canvas.clientHeight || 460;
      canvas.width = W * DPR; canvas.height = H * DPR;
      c2d = canvas.getContext ? canvas.getContext('2d') : null;
      if (c2d) c2d.setTransform(DPR, 0, 0, DPR, 0, 0);

      if (!canvas._bound) {
        canvas._bound = true;
        canvas.addEventListener('pointerdown', function (e) {
          var r = canvas.getBoundingClientRect();
          var x = e.clientX - r.left, y = e.clientY - r.top;
          var hit = run.hitTest(x, y);
          if (hit) { hit.scare = 1; hit.target = null; return; }
          run.pellets.drop(x, y);
        });
      }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function paintCount() {
      var el = ctx.el; if (!el) return;
      var n = run.count();
      var c = el.querySelector('.kp-ls-count');
      if (c) c.textContent = n ? ('그림 ' + n + '개가 무대에 있어요') : '무대가 비어 있어요';
    }

    /* 학생이 보낸 획 → 스프라이트 → 무대 방생 */
    function receiveArt(name, rawArt) {
      var sp = LS.ink.toSprite(rawArt);      // clampArt 내장 — 받은 값은 신뢰하지 않는다
      if (!sp) return;
      LS.ink.toImage(sp.canvas, function (im) {
        var b = run.add({
          w: sp.w, h: sp.h, face: sp.face, motionSel: sp.motion,
          name: name, unique: true,                       // 한 사람 = 한 마리
          y: 60 + Math.random() * Math.max(80, H - 200)
        });
        b.sprite = im;
        paintCount();
        ctx.sendState({ stage: run.stage(), count: run.count() });
      });
    }

    var last = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!c2d) return;
      var dt = last ? Math.min((now - last) / 16.7, 3) : 1;
      last = now;
      var t = now / 1000;
      var stageId = run.stage(), st = LS.findStage(stageId);
      var fy = LS.floorOf(stageId, H);

      c2d.clearRect(0, 0, W, H);
      var vig = LS.art.drawStage(c2d, stageId, { W: W, H: H, t: t, dt: dt, floorY: fy, decor: decor });

      var pel = run.pellets;
      pel.step(dt, fy, t);
      LS.art.drawFood(c2d, stageId, pel.list());

      var env = {
        t: t, dt: dt, W: W, H: H, floorY: fy, pellets: pel.list(),
        onEat: function (p, b) { pel.remove(p); pops.push({ x: b.x, y: b.y, r: 4, a: 1 }); }
      };
      run.beings().forEach(function (b) {
        LS.stepBeing(b, env);
        LS.art.drawBeing(c2d, b, t, { nameSize: 14 });   // 전자칠판은 이름을 조금 크게
        if (st.bubbles && Math.random() < 0.01) {
          bubbles.push({ x: b.x + b.dir * b.w / 2, y: b.y, r: 2 + Math.random() * 3, v: 0.5 + Math.random() });
        }
      });
      LS.art.drawPops(c2d, pops, dt);
      if (st.bubbles) LS.art.drawBubbles(c2d, bubbles, dt, W, fy);
      else bubbles.length = 0;
      LS.art.vignette(c2d, W, H, vig);
    }

    ctx.on('join', function () {
      render();
      ctx.sendState({ stage: run.stage(), count: run.count() });
    });
    ctx.on('bye', function () { paintCount(); });
    ctx.on('answer', function (p) { if (p.art) receiveArt(p.name, p.art); });

    render();
  }

  /* ═════════ 참가자 = 학생 폰 그리기 패드 ═════════ */
  function joinView(ctx) {
    var COLORS = ['#2B3A4A','#FF5C5C','#FF9D3C','#FFD23C','#5CC85C','#3CBCD8','#4C6CF0','#B06CF0','#F07CC0','#8A5A3C','#FFFFFF'];
    var color = COLORS[1], width = 22, erasing = false;
    var motionSel = 'auto', face = 1;
    var stageId = 'sea';
    var strokes = [], cur = null, drew = false, sent = false;
    var canvas = null, c2d = null;

    function stageLabel() {
      var s = LS.findStage(stageId);
      return s ? (s.emoji + ' ' + s.name + ' 무대') : '무대';
    }

    function render() {
      var el = ctx.el; if (!el) return;
      el.innerHTML =
        '<div class="kp-pmeta">🎪 지금은 <b>' + esc(stageLabel()) + '</b> — 그려서 보내면 살아 움직여요</div>' +
        '<canvas id="kpLsPad" class="kp-canvas pad ls"></canvas>' +
        '<div class="kp-ls-tools" id="kpLsPal"></div>' +
        '<div class="kp-ls-tools">' +
          '<button class="kp-chip" id="kpLsErase">🧽 지우개</button>' +
          '<button class="kp-chip" id="kpLsWipe">↺ 다시</button>' +
        '</div>' +
        '<div class="kp-ls-label">어떻게 움직일까요?</div>' +
        '<div class="kp-ls-tools" id="kpLsMotion"></div>' +
        '<div class="kp-ls-label">어느 쪽을 보고 있나요?</div>' +
        '<div class="kp-ls-tools">' +
          '<button class="kp-chip" id="kpLsL">◀ 왼쪽</button>' +
          '<button class="kp-chip on" id="kpLsR">오른쪽 ▶</button>' +
        '</div>' +
        '<button class="kp-btn kp-ls-send" id="kpLsSend">무대로 보내기 ✨</button>' +
        '<div class="kp-dim" id="kpLsMsg" style="text-align:center;margin-top:8px">전자칠판을 보세요</div>';

      canvas = el.querySelector('#kpLsPad');
      setup();

      var pal = el.querySelector('#kpLsPal');
      COLORS.forEach(function (c, i) {
        var b = document.createElement('button');
        b.className = 'kp-sw' + (i === 1 ? ' on' : '');
        b.style.background = c;
        b.onclick = function () {
          color = c; erasing = false;
          pal.querySelectorAll('.kp-sw').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          el.querySelector('#kpLsErase').classList.remove('on');
        };
        pal.appendChild(b);
      });

      var mrow = el.querySelector('#kpLsMotion');
      LS.MOTIONS.forEach(function (m, i) {
        var b = document.createElement('button');
        b.className = 'kp-chip' + (i === 0 ? ' on' : '');
        b.textContent = m.emoji + ' ' + m.name;
        b.onclick = function () {
          motionSel = m.id;
          mrow.querySelectorAll('.kp-chip').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        };
        mrow.appendChild(b);
      });

      el.querySelector('#kpLsErase').onclick = function () {
        erasing = true;
        pal.querySelectorAll('.kp-sw').forEach(function (x) { x.classList.remove('on'); });
        this.classList.add('on');
      };
      el.querySelector('#kpLsWipe').onclick = wipe;

      var bl = el.querySelector('#kpLsL'), br = el.querySelector('#kpLsR');
      bl.onclick = function () { face = -1; bl.classList.add('on'); br.classList.remove('on'); };
      br.onclick = function () { face = 1; br.classList.add('on'); bl.classList.remove('on'); };

      el.querySelector('#kpLsSend').onclick = send;
    }

    function setup() {
      if (!canvas) return;
      var w = canvas.clientWidth || 320;
      var h = Math.round(w * LS.PAD_H / LS.PAD_W);     // 화폭 비율 고정 → 전자칠판과 같은 그림
      canvas.style.height = h + 'px';
      canvas.width = w; canvas.height = h;
      c2d = canvas.getContext ? canvas.getContext('2d') : null;
      if (c2d) { c2d.lineCap = c2d.lineJoin = 'round'; }
      repaint();
      if (!canvas._bound) bindPointer();
    }

    /* 화면에 다시 그리기 — 저장된 획을 그대로 재현(전자칠판과 같은 경로) */
    function repaint() {
      if (!c2d || !canvas) return;
      c2d.clearRect(0, 0, canvas.width, canvas.height);
      strokes.forEach(function (st) { paintStroke(st); });
    }
    function paintStroke(st) {
      if (!c2d || st.p.length < 2) return;
      var W = canvas.width, H = canvas.height;
      var lw = Math.max(1, st.w / 1000 * W);
      c2d.globalCompositeOperation = (st.c === 'e') ? 'destination-out' : 'source-over';
      c2d.strokeStyle = (st.c === 'e') ? '#000' : st.c;
      c2d.lineWidth = (st.c === 'e') ? lw * 2.2 : lw;
      c2d.beginPath();
      for (var i = 0; i + 1 < st.p.length; i += 2) {
        var x = st.p[i] / 1000 * W, y = st.p[i + 1] / 1000 * H;
        if (i === 0) c2d.moveTo(x, y); else c2d.lineTo(x, y);
      }
      if (st.p.length === 2) c2d.lineTo(st.p[0] / 1000 * W + 0.1, st.p[1] / 1000 * H);
      c2d.stroke();
      c2d.globalCompositeOperation = 'source-over';
    }

    function norm(e) {
      var r = canvas.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      return [Math.max(0, Math.min(1000, Math.round(cx / r.width * 1000))),
              Math.max(0, Math.min(1000, Math.round(cy / r.height * 1000)))];
    }

    function start(e) {
      e.preventDefault();
      if (strokes.length >= LS.INK_MAX_STROKES) { msg('그림이 너무 복잡해요 — 보내거나 다시 그려요'); return; }
      var p = norm(e);
      cur = { c: erasing ? 'e' : color, w: width, p: [p[0], p[1]] };
      strokes.push(cur);
      drew = true;
    }
    function move(e) {
      if (!cur) return;
      e.preventDefault();
      var p = norm(e);
      var n = cur.p.length;
      var lx = cur.p[n - 2], ly = cur.p[n - 1];
      if (!LS.shouldAddPoint(lx, ly, p[0], p[1])) return;
      if (cur.p.length >= LS.INK_MAX_PTS_PER_STROKE * 2) return;
      if (LS.inkSize({ s: strokes }) >= LS.INK_MAX_PTS_TOTAL * 2) return;
      cur.p.push(p[0], p[1]);
      // 방금 이어진 구간만 덧그림(전체 다시 그리기 안 함 — 폰 성능)
      if (c2d) {
        var W = canvas.width, H = canvas.height;
        var lw = Math.max(1, cur.w / 1000 * W);
        c2d.globalCompositeOperation = (cur.c === 'e') ? 'destination-out' : 'source-over';
        c2d.strokeStyle = (cur.c === 'e') ? '#000' : cur.c;
        c2d.lineWidth = (cur.c === 'e') ? lw * 2.2 : lw;
        c2d.beginPath();
        c2d.moveTo(lx / 1000 * W, ly / 1000 * H);
        c2d.lineTo(p[0] / 1000 * W, p[1] / 1000 * H);
        c2d.stroke();
        c2d.globalCompositeOperation = 'source-over';
      }
    }
    function end() { cur = null; }

    function bindPointer() {
      canvas._bound = true;
      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', end);
    }

    function wipe() { strokes = []; cur = null; drew = false; sent = false; repaint(); msg('다시 그려요'); }

    function msg(s) {
      var el = ctx.el; if (!el) return;
      var m = el.querySelector('#kpLsMsg');
      if (m) m.textContent = s;
    }

    function send() {
      if (!drew || !strokes.length) { msg('먼저 그림을 그려 주세요 ✏️'); return; }
      var art = LS.clampArt({ s: strokes, m: motionSel, f: face });
      if (!art) { msg('먼저 그림을 그려 주세요 ✏️'); return; }
      ctx.answer({ art: art });
      sent = true;
      msg('보냈어요! 전자칠판을 보세요 ✨' + (sent ? ' (다시 보내면 내 그림이 바뀌어요)' : ''));
    }

    ctx.on('state', function (p) {
      if (p.stage && LS.findStage(p.stage)) stageId = p.stage;
      var el = ctx.el; if (!el) return;
      var meta = el.querySelector('.kp-pmeta');
      if (meta) meta.innerHTML = '🎪 지금은 <b>' + esc(stageLabel()) + '</b> — 그려서 보내면 살아 움직여요';
      if (p.cleared) msg('선생님이 무대를 비웠어요 — 다시 보내 보세요');
    });

    render();
  }

  window.Kple.register('live_stage', { host: hostView, join: joinView });
})();
