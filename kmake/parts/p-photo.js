/* ============================================================
   사진 틀 부품 가족 (2026-09-11) — 프레임은 코드로 고정, 사진만 갈아끼운다.
   ------------------------------------------------------------
   기준 결: 금성초 입학설명회 오프닝(학교 전경 + 나뭇잎 프레임 + 남색 명조 제목·붓 밑줄·로고
   → 크림 종이 콜라주 3장이 문구 카드로 하나씩 뒤집힘). 다섯 부품이 한 벌:
     photoOpen  사진 오프닝   — 배경 사진 1 + 나뭇잎 프레임 + 제목 두 줄 + 붓 밑줄 + 로고
     collage3   콜라주 3장    — 테이프에 붙은 사진 3장이 차례로 문구 카드로 뒤집힘
     photoOne   한 장 크게    — 폴라로이드 한 장 + 작은 표기 + 한 줄 설명
     photoPair  두 장 나란히  — 좌우 비교·전후, 아래 이름표
     photoGrid4 네 장 격자    — 사진이 한 장씩 톡톡 붙는 활동 모음
   공유 부품(PH): 크림 종이 · 흰 테두리 폴라로이드 · 마스킹테이프 · 나뭇잎 · 붓 밑줄 · 명조 글자.
   색은 테마: 먹 = primary(남색), 붓 = accent 를 밝힌 노랑. 사진 칸(type:'img')은 parts.js 의 K.photo.
   부품 계약 그대로: draw(ctx,W,H,t,p,theme) 순수 — 같은 t·같은 사진이면 같은 바이트.
   ============================================================ */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life, clamp = K.clamp;

  /* ---------- 결정적 난수 (자리·기울기용) ---------- */
  function rnd(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function lighten(hex, u) { var c = K.hexToRgb(hex); return 'rgb(' + c.map(function (v) { return Math.round(v + (255 - v) * u); }).join(',') + ')'; }
  function withA(rgb, a) { return rgb.replace('rgb(', 'rgba(').replace(')', ',' + clamp(a, 0, 1) + ')'); }

  var PAPER = '#FBF6EE', PAPER2 = '#F3EBDD', CARD = '#F8F2E5', WHITE = '#FFFFFF';
  var GREENS = ['#7FB04A', '#9CC65A', '#B8D96A', '#6A9A3C', '#C9E27A'];
  var TAPES = ['rgba(196,208,166,0.86)', 'rgba(236,212,178,0.86)', 'rgba(190,206,180,0.86)'];

  /* ---------- 종이 (전면) ---------- */
  function paper(ctx, W, H, s, a) {
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha = a;
    var gr = ctx.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#FFFCF6'); gr.addColorStop(0.5, PAPER); gr.addColorStop(1, PAPER2);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    // 창가 빛 — 비스듬한 밝은 띠 둘
    for (var i = 0; i < 2; i++) {
      var x0 = W * (0.12 + i * 0.38), lg = ctx.createLinearGradient(x0, 0, x0 + W * 0.34, H);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.35)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    }
    // 나뭇잎 그림자 — 왼쪽 위에 아주 옅게
    ctx.fillStyle = 'rgba(110,100,80,0.03)';
    for (var j = 0; j < 9; j++) {
      var lx = W * (0.02 + rnd(j * 3 + 1) * 0.30), ly = H * (0.02 + rnd(j * 3 + 2) * 0.34), L = (150 + rnd(j * 3 + 3) * 180) * s;
      leafPath(ctx, lx, ly, L, L * 0.34, rnd(j * 3 + 4) * Math.PI); ctx.fill();
    }
    // 가장자리 비네트
    var vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.78);
    vg.addColorStop(0, 'rgba(120,100,70,0)'); vg.addColorStop(1, 'rgba(120,100,70,0.07)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /* ---------- 나뭇잎 ---------- */
  function leafPath(ctx, x, y, L, Wd, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(L * 0.45, -Wd, L, 0);
    ctx.quadraticCurveTo(L * 0.45, Wd, 0, 0);
    ctx.closePath(); ctx.restore();
  }
  /* 잎 하나 — soft 면 가장자리를 세 겹으로 뭉개 흐린 앞잎 느낌(필터 없이 node 도 같은 그림) */
  function leaf(ctx, x, y, L, Wd, rot, col, a, soft) {
    if (a <= 0.002) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    var c = K.hexToRgb(col), dark = 'rgb(' + c.map(function (v) { return Math.round(v * 0.62); }).join(',') + ')', light = lighten(col, 0.28);
    var gr = ctx.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, dark); gr.addColorStop(0.55, col); gr.addColorStop(1, light);
    if (soft) {           // 흐린 앞잎 — 바깥으로 갈수록 옅은 겹 여섯 장 = 필터 없는 블러(node 도 같은 그림)
      for (var i = 6; i >= 0; i--) { ctx.globalAlpha = a * (i === 0 ? 0.42 : 0.11); ctx.fillStyle = gr; leafPath(ctx, 0, 0, L * (1 + i * 0.045), Wd * (1 + i * 0.09), 0); ctx.fill(); }
    } else {
      ctx.globalAlpha = a; ctx.fillStyle = gr; leafPath(ctx, 0, 0, L, Wd, 0); ctx.fill();
      ctx.globalAlpha = a * 0.5; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = Math.max(1, L * 0.02);
      ctx.beginPath(); ctx.moveTo(L * 0.08, 0); ctx.lineTo(L * 0.9, 0); ctx.stroke();
    }
    ctx.restore();
  }
  /* 화면 귀퉁이 흐린 앞잎 프레임(오프닝용). k = 살짝 벌어지는 배율(1.03→1.15), a = 알파 */
  function foliage(ctx, W, H, s, k, a) {
    if (a <= 0.002) return;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
    // 군락 5곳: [cx, cy, 잎 수, 기본 방향]
    var C = [[0.05, 0.0, 11, 0.9], [0.30, -0.05, 6, 1.5], [0.99, 0.10, 5, 2.9], [0.0, 0.84, 9, -0.5], [0.97, 0.88, 10, 3.7]];
    for (var c = 0; c < C.length; c++) {
      var cx = W * C[c][0], cy = H * C[c][1], n = C[c][2];
      for (var i = 0; i < n; i++) {
        var sd = c * 40 + i, ang = C[c][3] + (rnd(sd) - 0.5) * 2.2, L = (140 + rnd(sd + 1) * 170) * s;
        var dx = Math.cos(ang) * (30 + rnd(sd + 2) * 120) * s, dy = Math.sin(ang) * (30 + rnd(sd + 3) * 120) * s;
        leaf(ctx, cx + dx, cy + dy, L, L * 0.36, ang + (rnd(sd + 4) - 0.5) * 0.8, GREENS[sd % 5], a * 0.92, true);
      }
      // 보케 — 잎 사이 흰 빛점
      for (var b = 0; b < 4; b++) {
        var bs = c * 9 + b + 500, bx = cx + (rnd(bs) - 0.5) * 300 * s, by = cy + (rnd(bs + 1) - 0.5) * 260 * s, br = (14 + rnd(bs + 2) * 22) * s;
        var rg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        rg.addColorStop(0, 'rgba(255,255,240,' + (0.55 * a) + ')'); rg.addColorStop(1, 'rgba(255,255,240,0)');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }
  /* 종이 위 작은 잎 장식(콜라주·격자용) — 얇은 올리브 줄기 + 잎 두세 장 */
  function sprigs(ctx, W, H, s, a) {
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
    var S = [[0.93, 0.13, 1, 2.2], [0.08, 0.86, 0.9, -0.9]];
    for (var i = 0; i < S.length; i++) {
      var x = W * S[i][0], y = H * S[i][1], sc = S[i][2] * s, d = S[i][3];
      ctx.strokeStyle = '#6E8A3B'; ctx.lineWidth = 3.5 * sc;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(d) * 90 * sc, y + Math.sin(d) * 30 * sc, x + Math.cos(d) * 160 * sc, y + Math.sin(d) * 110 * sc); ctx.stroke();
      leaf(ctx, x - 6 * sc, y + 4 * sc, 62 * sc, 22 * sc, d + 1.9, '#7FA843', 1, false);
      leaf(ctx, x + 10 * sc, y - 8 * sc, 58 * sc, 21 * sc, d - 1.3, '#9CBE58', 1, false);
    }
    // 오른쪽 아래 옅은 주황 곡선 하나(참고 이미지의 손그림 선)
    ctx.strokeStyle = 'rgba(232,180,90,0.75)'; ctx.lineWidth = 2.2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.66, H * 1.02); ctx.bezierCurveTo(W * 0.78, H * 0.80, W * 0.90, H * 0.96, W * 1.02, H * 0.72); ctx.stroke();
    ctx.restore();
  }

  /* ---------- 폴라로이드 · 테이프 ---------- */
  /* 흰 테두리 카드. inner(x,y,w,h) 는 회전된 좌표계 안에서 그린다 (사진·문구). */
  function polaroid(ctx, s, cx, cy, w, h, rot, a, inner) {
    if (a <= 0.002) return;
    var pad = 16 * s;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = a;
    ctx.shadowColor = 'rgba(70,50,25,0.24)'; ctx.shadowBlur = 30 * s; ctx.shadowOffsetY = 12 * s;
    ctx.fillStyle = WHITE; ctx.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    inner(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  function tape(ctx, s, cx, cy, w, h, rot, col, a) {
    if (a <= 0.002) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.globalAlpha = a; ctx.fillStyle = col;
    var tooth = 5 * s, n = Math.max(2, Math.round(h / tooth));
    ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    for (var i = 0; i <= n; i++) ctx.lineTo(w / 2 - (i % 2 ? tooth : 0), -h / 2 + h * i / n);
    ctx.lineTo(-w / 2, h / 2);
    for (var j = n; j >= 0; j--) ctx.lineTo(-w / 2 + (j % 2 ? tooth : 0), -h / 2 + h * j / n);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* 문구 카드 안쪽(크림 종이) — 사진 위에 덮어 뒤집힘을 만든다 */
  function cardFill(ctx, x, y, w, h, a) {
    if (a <= 0.002) return;
    ctx.save(); ctx.globalAlpha = a;
    var gr = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
    gr.addColorStop(0, '#FBF6EA'); gr.addColorStop(1, CARD);
    ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  /* ---------- 붓 밑줄 — 살짝 휜 노란 획, 왼쪽에서 오른쪽으로 그어짐(u 0→1) ---------- */
  function brush(ctx, s, x0, x1, y, th, col, u, a) {
    if (u <= 0.002 || a <= 0.002) return;
    var L = x1 - x0, N = 40, top = [], bot = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, x = x0 + L * t, yy = y - (1 - Math.pow(2 * t - 1, 2)) * th * 0.9 + (t - 0.5) * th * 0.25;
      var tk = th * (0.55 + 0.45 * Math.pow(Math.sin(Math.PI * clamp(t * 1.15 - 0.05, 0, 1)), 0.6));
      top.push([x, yy - tk / 2]); bot.push([x, yy + tk / 2]);
    }
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col;
    ctx.beginPath(); ctx.rect(x0 - th, y - th * 2, (L + th * 2) * u, th * 4); ctx.clip();   // 왼→오 닦임
    ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]);
    for (var k = 1; k <= N; k++) ctx.lineTo(top[k][0], top[k][1]);
    for (var m = N; m >= 0; m--) ctx.lineTo(bot[m][0], bot[m][1]);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x0, top[0][1] + (bot[0][1] - top[0][1]) / 2, (bot[0][1] - top[0][1]) / 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x1, top[N][1] + (bot[N][1] - top[N][1]) / 2, (bot[N][1] - top[N][1]) / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* 명조 글자(자간 없음) — 폭이 maxW 를 넘으면 크기를 줄인다. 반환 {w,size} */
  function serif(ctx, text, x, y, size, weight, col, a, maxW, dy) {
    if (!text || a <= 0.002) return { w: 0, size: size };
    ctx.save(); ctx.font = K.font(weight, size, true); var w = ctx.measureText(text).width; ctx.restore();
    if (maxW && w > maxW) { size = size * maxW / w; w = maxW; }
    K.drawText(ctx, text, x, y + (dy || 0), { size: size, weight: weight, color: col, align: 'center', alpha: a, serif: true, shadow: { color: 'rgba(20,20,40,0.10)', blur: 10, dy: 2 } });
    return { w: w, size: size };
  }
  /* 사진 → 문구 뒤집힘 카드의 안쪽 그리기 (콜라주·공용): tf = 뒤집힘 시작 시각(없으면 사진만) */
  function flipInner(ctx, s, t, img, x, y, w, h, tf, cap, main, T, mark, zoom, a) {
    K.drawCover(ctx, img, x, y, w, h, zoom, a);
    if (tf == null) return;
    var f = seg(t, tf, tf + 0.6, E.inOutCubic);
    cardFill(ctx, x, y, w, h, f * a);
    if (f <= 0.002) return;
    var cx = x + w / 2, cy = y + h / 2 - 14 * s, maxW = w - 64 * s;
    var tu = seg(t, tf + 0.5, tf + 1.4, E.outExpo), ta = seg(t, tf + 0.5, tf + 1.2) * a, rise = 14 * s * (1 - tu);
    serif(ctx, cap, cx, cy - 38 * s, 46 * s, 600, T.primary, ta, maxW, rise);
    var r = serif(ctx, main, cx, cy + 70 * s, 94 * s, 900, T.primary, ta, maxW, rise);
    var u = seg(t, tf + 1.15, tf + 1.95, E.inOutCubic);
    if (main) brush(ctx, s, cx - r.w * 0.55, cx + r.w * 0.55, cy + 92 * s, 22 * s, mark, u, a);
    // 밑줄 위로 글자를 한 번 더 — 획이 글자 아래로 들어가 보이게
    if (u > 0.002) serif(ctx, main, cx, cy + 70 * s, 94 * s, 900, T.primary, ta * Math.min(1, u * 3), maxW, rise);
  }
  function mark(T) { return lighten(T.accent, 0.28); }

  K.PH = { paper: paper, foliage: foliage, sprigs: sprigs, polaroid: polaroid, tape: tape, cardFill: cardFill, brush: brush, serif: serif, leaf: leaf, mark: mark, TAPES: TAPES };

  /* ============================================================
     1) 사진 오프닝 — 9초
     ============================================================ */
  K.register({
    id: 'photoOpen',
    name: '사진 오프닝',
    dur: 9,
    fields: [
      { k: 'photo',   label: '배경 사진', def: '', type: 'img' },
      { k: 'logo',    label: '로고(선택)', def: '', type: 'img' },
      { k: 'eyebrow', label: '작은 윗줄', def: '2027학년도 신입생' },
      { k: 'title',   label: '제목',      def: '입학설명회' },
      { k: 'leaves',  label: '나뭇잎',    def: 'on', opts: ['on', 'off'] },
      { k: 'haze',    label: '밝은 빛',   def: 'on', opts: ['on', 'off'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, cx = W / 2, D = 9, OUT_A = 7.6, OUT_B = 8.5;
      var img = K.photo(p.photo), logo = K.photo(p.logo), mk = mark(T);
      var G = life(t, 0, 0.8, 8.1, D, E.inOutCubic, E.inCubic);                  // 전체 페이드(사진·잎)
      var gone = seg(t, OUT_A, OUT_B, E.inCubic), lift = -14 * s * gone, keep = 1 - gone;
      if (G <= 0.002) return;
      // 배경 사진 — 천천히 다가감
      if (img) { var z = 1 + 0.08 * E.inOutCubic(t / D); K.drawCover(ctx, img, 0, 0, W, H, z, G); }
      // 밝은 빛 — 제목이 잘 읽히게 (사진이 있든 없든)
      var h = p.haze !== 'off' ? seg(t, 1.4, 2.6, E.inOutCubic) * G : 0;
      if (h > 0.002) {
        ctx.save(); ctx.globalAlpha = h * 0.22; ctx.fillStyle = '#FFFCF4'; ctx.fillRect(0, 0, W, H);
        var rg = ctx.createRadialGradient(cx, H * 0.42, 0, cx, H * 0.42, Math.max(W, H) * 0.55);
        rg.addColorStop(0, 'rgba(255,253,246,0.55)'); rg.addColorStop(1, 'rgba(255,253,246,0)');
        ctx.globalAlpha = h; ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
      // 나뭇잎 프레임 — 사진보다 조금 더 벌어짐
      if (p.leaves !== 'off') foliage(ctx, W, H, s, 1.03 + 0.12 * E.inOutCubic(t / D), G);
      // 글자
      var maxW = W - 240 * s;
      var eu = seg(t, 1.8, 2.8, E.outCubic), ea = seg(t, 1.8, 2.7) * keep * G;
      serif(ctx, p.eyebrow, cx, H * 0.30, 46 * s, 700, T.primary, ea, maxW, 18 * s * (1 - eu) + lift);
      var tu = seg(t, 2.2, 3.4, E.outCubic), ta = seg(t, 2.2, 3.2) * keep * G;
      var r = serif(ctx, p.title, cx, H * 0.46, 150 * s, 900, T.primary, ta, maxW, 30 * s * (1 - tu) + lift);
      var u = seg(t, 3.2, 4.1, E.inOutCubic);
      brush(ctx, s, cx - r.w * 0.55, cx + r.w * 0.55, H * 0.505 + lift, 26 * s, mk, u, keep * G);
      if (u > 0.002) serif(ctx, p.title, cx, H * 0.46, 150 * s, 900, T.primary, ta * Math.min(1, u * 3), maxW, 30 * s * (1 - tu) + lift);
      // 로고 — 오른쪽 위로 스르륵
      if (logo) {
        var lu = seg(t, 4.0, 5.0, E.outCubic), la = seg(t, 4.0, 4.9) * keep * G;
        var lh = 110 * s, lw = lh * (logo.naturalWidth || logo.width) / (logo.naturalHeight || logo.height);
        if (lw > W * 0.4) { lw = W * 0.4; lh = lw * (logo.naturalHeight || logo.height) / (logo.naturalWidth || logo.width); }
        ctx.save(); ctx.globalAlpha = la; ctx.drawImage(logo, W - 75 * s - lw + 16 * s * (1 - lu), 100 * s + lift, lw, lh); ctx.restore();
      }
    },
  });

  /* ============================================================
     2) 콜라주 3장 — 12초
     ============================================================ */
  K.register({
    id: 'collage3',
    name: '콜라주 3장',
    dur: 12,
    fields: [
      { k: 'photo1', label: '사진 1', def: '', type: 'img' },
      { k: 'cap1',   label: '1 작은 줄', def: '10월 17일' },
      { k: 'main1',  label: '1 큰 줄',   def: '10:00' },
      { k: 'photo2', label: '사진 2', def: '', type: 'img' },
      { k: 'cap2',   label: '2 작은 줄', def: '유튜브 채널' },
      { k: 'main2',  label: '2 큰 줄',   def: '금성초등학교' },
      { k: 'photo3', label: '사진 3', def: '', type: 'img' },
      { k: 'cap3',   label: '3 작은 줄', def: '입학설명회' },
      { k: 'main3',  label: '3 큰 줄',   def: '시작합니다' },
      { k: 'paper',  label: '크림 종이', def: 'on', opts: ['on', 'off'] },
      { k: 'leaves', label: '잎 장식',   def: 'on', opts: ['on', 'off'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, D = 12, mk = mark(T);
      var G = life(t, 0, 0.7, 11.0, D, E.inOutCubic, E.inCubic);
      if (G <= 0.002) return;
      var lay = Math.min(1, W / (1700 * s));                                   // 좁은 화면이면 셋을 오므린다
      ctx.save(); var z = 1 + 0.03 * E.inOutCubic(t / D); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      if (p.paper !== 'off') paper(ctx, W, H, s, G);
      if (p.leaves !== 'off') sprigs(ctx, W, H, s, G);
      var cw = 500 * s * lay, ch = 470 * s * lay, X = [0.19, 0.5, 0.81], R = [-0.085, 0.0, 0.094], cy = H * 0.5;
      for (var i = 0; i < 3; i++) {
        var cin = 0.3 + i * 0.35, iu = seg(t, cin, cin + 0.8, E.outCubic), ia = seg(t, cin, cin + 0.6) * G;
        var cxi = W / 2 + (X[i] - 0.5) * W * lay, cyi = cy + 50 * s * (1 - iu);
        var tf = 3.0 + 2.0 * i;
        var img = K.photo(p['photo' + (i + 1)]), cap = p['cap' + (i + 1)], main = p['main' + (i + 1)];
        (function (img, cap, main, tf) {
          polaroid(ctx, s, cxi, cyi, cw, ch, R[i], ia, function (x, y, w, h) {
            flipInner(ctx, s, t, img, x, y, w, h, tf, cap, main, T, mk, 1 + 0.05 * E.inOutCubic(t / D), 1);
          });
        })(img, cap, main, tf);
        var tx = cxi - Math.sin(R[i]) * (ch / 2 + 8 * s), ty = cyi - Math.cos(R[i]) * (ch / 2 + 8 * s);
        tape(ctx, s, tx, ty, 120 * s * lay, 34 * s, R[i] * 0.4 + (rnd(i + 7) - 0.5) * 0.16, TAPES[i % 3], ia);
      }
      ctx.restore();
    },
  });

  /* ============================================================
     3) 한 장 크게 — 7초
     ============================================================ */
  K.register({
    id: 'photoOne',
    name: '한 장 크게',
    dur: 7,
    fields: [
      { k: 'photo',   label: '사진',       def: '', type: 'img' },
      { k: 'tag',     label: '작은 표기',  def: '2026. 9' },
      { k: 'caption', label: '한 줄 설명', def: '처음 만난 날' },
      { k: 'paper',   label: '크림 종이',  def: 'on', opts: ['on', 'off'] },
      { k: 'leaves',  label: '잎 장식',    def: 'on', opts: ['on', 'off'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, D = 7, mk = mark(T), cx = W / 2;
      var G = life(t, 0, 0.6, 6.0, D, E.inOutCubic, E.inCubic);
      if (G <= 0.002) return;
      var gone = seg(t, 6.0, 6.8, E.inCubic), lift = -18 * s * gone;
      if (p.paper !== 'off') paper(ctx, W, H, s, G);
      if (p.leaves !== 'off') sprigs(ctx, W, H, s, G);
      var cw = Math.min(880 * s, W * 0.7), ch = cw * 0.68, cy = H * 0.44 + lift;
      var iu = seg(t, 0.1, 1.1, E.outCubic), ia = seg(t, 0.1, 0.8) * G;
      var rot = -0.14 + 0.096 * iu, sc = 1.06 - 0.06 * iu;
      var img = K.photo(p.photo);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
      polaroid(ctx, s, cx, cy, cw, ch, rot, ia, function (x, y, w, h) { K.drawCover(ctx, img, x, y, w, h, 1 + 0.06 * E.inOutCubic(t / D), 1); });
      tape(ctx, s, cx - Math.sin(rot) * (ch / 2 + 8 * s), cy - Math.cos(rot) * (ch / 2 + 8 * s), 150 * s, 36 * s, rot * 0.5 + 0.05, TAPES[1], ia);
      ctx.restore();
      var ta = seg(t, 0.9, 1.5) * G;
      if (p.tag) K.drawText(ctx, p.tag, cx - cw / 2 + 6 * s, cy - ch / 2 - 40 * s + lift, { size: 26 * s, weight: 600, ls: 5 * s, color: T.accent, alpha: ta, serif: true });
      var cu = seg(t, 1.2, 2.0, E.outCubic), ca = seg(t, 1.2, 1.9) * G;
      var r = serif(ctx, p.caption, cx, H * 0.86 + lift, 58 * s, 700, T.primary, ca, W - 200 * s, 16 * s * (1 - cu));
      var u = seg(t, 1.8, 2.5, E.inOutCubic);
      brush(ctx, s, cx - r.w * 0.55, cx + r.w * 0.55, H * 0.875 + lift, 16 * s, mk, u, G);
      if (u > 0.002) serif(ctx, p.caption, cx, H * 0.86 + lift, 58 * s, 700, T.primary, ca * Math.min(1, u * 3), W - 200 * s, 16 * s * (1 - cu));
    },
  });

  /* ============================================================
     4) 두 장 나란히 — 7초
     ============================================================ */
  K.register({
    id: 'photoPair',
    name: '두 장 나란히',
    dur: 7,
    fields: [
      { k: 'photo1', label: '왼쪽 사진',  def: '', type: 'img' },
      { k: 'label1', label: '왼쪽 이름표', def: '그때' },
      { k: 'photo2', label: '오른쪽 사진', def: '', type: 'img' },
      { k: 'label2', label: '오른쪽 이름표', def: '지금' },
      { k: 'title',  label: '위 제목(선택)', def: '' },
      { k: 'paper',  label: '크림 종이',  def: 'on', opts: ['on', 'off'] },
      { k: 'leaves', label: '잎 장식',    def: 'on', opts: ['on', 'off'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, D = 7, mk = mark(T);
      var G = life(t, 0, 0.6, 6.0, D, E.inOutCubic, E.inCubic);
      if (G <= 0.002) return;
      var gone = seg(t, 6.0, 6.8, E.inCubic), lift = -18 * s * gone;
      if (p.paper !== 'off') paper(ctx, W, H, s, G);
      if (p.leaves !== 'off') sprigs(ctx, W, H, s, G);
      var hasT = !!p.title, cw = Math.min(640 * s, W * 0.36), ch = cw * 0.78, cy = H * (hasT ? 0.50 : 0.46) + lift;
      var X = [0.5 - 0.19 * Math.min(1, W / (1700 * s)), 0.5 + 0.19 * Math.min(1, W / (1700 * s))], R = [-0.055, 0.05], IN = [0.1, 0.45];
      for (var i = 0; i < 2; i++) {
        var iu = seg(t, IN[i], IN[i] + 0.8, E.outCubic), ia = seg(t, IN[i], IN[i] + 0.6) * G, cx = W * X[i], cyi = cy + 40 * s * (1 - iu);
        var img = K.photo(p['photo' + (i + 1)]);
        (function (img) { polaroid(ctx, s, cx, cyi, cw, ch, R[i], ia, function (x, y, w, h) { K.drawCover(ctx, img, x, y, w, h, 1 + 0.05 * E.inOutCubic(t / D), 1); }); })(img);
        tape(ctx, s, cx - Math.sin(R[i]) * (ch / 2 + 8 * s), cyi - Math.cos(R[i]) * (ch / 2 + 8 * s), 130 * s, 34 * s, R[i] * 0.5, TAPES[i], ia);
        var lu = seg(t, 1.1 + i * 0.2, 1.8 + i * 0.2, E.outCubic), la = seg(t, 1.1 + i * 0.2, 1.7 + i * 0.2) * G, ly = cy + ch / 2 + 92 * s;
        var r = serif(ctx, p['label' + (i + 1)], cx, ly, 50 * s, 700, T.primary, la, cw, 12 * s * (1 - lu));
        var u = seg(t, 1.6 + i * 0.2, 2.2 + i * 0.2, E.inOutCubic);
        brush(ctx, s, cx - r.w * 0.55, cx + r.w * 0.55, ly + 14 * s, 14 * s, mk, u, G);
        if (u > 0.002) serif(ctx, p['label' + (i + 1)], cx, ly, 50 * s, 700, T.primary, la * Math.min(1, u * 3), cw, 12 * s * (1 - lu));
      }
      if (hasT) {
        var tu = seg(t, 1.4, 2.2, E.outCubic), ta = seg(t, 1.4, 2.1) * G;
        serif(ctx, p.title, W / 2, H * 0.17 + lift, 62 * s, 900, T.primary, ta, W - 200 * s, 14 * s * (1 - tu));
      }
    },
  });

  /* ============================================================
     5) 네 장 격자 — 8초
     ============================================================ */
  K.register({
    id: 'photoGrid4',
    name: '네 장 격자',
    dur: 8,
    fields: [
      { k: 'title',  label: '제목',   def: '우리 학교 하루' },
      { k: 'photo1', label: '사진 1', def: '', type: 'img' },
      { k: 'photo2', label: '사진 2', def: '', type: 'img' },
      { k: 'photo3', label: '사진 3', def: '', type: 'img' },
      { k: 'photo4', label: '사진 4', def: '', type: 'img' },
      { k: 'paper',  label: '크림 종이', def: 'on', opts: ['on', 'off'] },
      { k: 'leaves', label: '잎 장식',   def: 'on', opts: ['on', 'off'] },
    ],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, D = 8, mk = mark(T), cx = W / 2;
      var G = life(t, 0, 0.6, 7.0, D, E.inOutCubic, E.inCubic);
      if (G <= 0.002) return;
      var gone = seg(t, 7.0, 7.8, E.inCubic), lift = -16 * s * gone;
      if (p.paper !== 'off') paper(ctx, W, H, s, G);
      if (p.leaves !== 'off') sprigs(ctx, W, H, s, G);
      var hasT = !!p.title;
      var tu = seg(t, 0.1, 0.9, E.outCubic), ta = seg(t, 0.1, 0.8) * G;
      var r = hasT ? serif(ctx, p.title, cx, H * 0.135 + lift, 64 * s, 900, T.primary, ta, W - 200 * s, 14 * s * (1 - tu)) : { w: 0 };
      var u = seg(t, 0.7, 1.4, E.inOutCubic);
      if (hasT) { brush(ctx, s, cx - r.w * 0.55, cx + r.w * 0.55, H * 0.152 + lift, 18 * s, mk, u, G); if (u > 0.002) serif(ctx, p.title, cx, H * 0.135 + lift, 64 * s, 900, T.primary, ta * Math.min(1, u * 3), W - 200 * s, 14 * s * (1 - tu)); }
      var cw = Math.min(470 * s, W * 0.245), ch = cw * 0.7, gx = Math.min(0.155 * W, 300 * s);
      var P = [[cx - gx, H * 0.415], [cx + gx, H * 0.415], [cx - gx, H * 0.795], [cx + gx, H * 0.795]], R = [-0.045, 0.03, 0.04, -0.03];
      if (!hasT) for (var q = 0; q < 4; q++) P[q][1] -= H * 0.07;
      for (var i = 0; i < 4; i++) {
        var tin = 0.7 + i * 0.4, iu = seg(t, tin, tin + 0.7, E.outBack), ia = seg(t, tin, tin + 0.35) * G, sc = 1.18 - 0.18 * clamp(iu, 0, 1.2);
        var px = P[i][0], py = P[i][1] + lift, img = K.photo(p['photo' + (i + 1)]);
        ctx.save(); ctx.translate(px, py); ctx.scale(sc, sc); ctx.translate(-px, -py);
        (function (img) { polaroid(ctx, s, px, py, cw, ch, R[i], ia, function (x, y, w, h) { K.drawCover(ctx, img, x, y, w, h, 1 + 0.05 * E.inOutCubic(t / D), 1); }); })(img);
        tape(ctx, s, px - Math.sin(R[i]) * (ch / 2 + 8 * s), py - Math.cos(R[i]) * (ch / 2 + 8 * s), 100 * s, 30 * s, R[i] * 0.5 + (rnd(i + 20) - 0.5) * 0.14, TAPES[i % 3], ia);
        ctx.restore();
      }
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
