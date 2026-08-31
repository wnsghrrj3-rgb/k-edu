/* ============================================================
   방송 자막 부품 16종 (p-broadcast.js) — 케이메이커 부품 규격 그대로(register/draw), 내용에 매이지 않는 범용 글자 부품.
   준호(2026-08-31): "인물 소개·단계 카드로 정해 놓지 말고 하나씩의 자막 부품으로. 글꼴 종류로 최대한 다양하게, 입체적인 느낌,
   방송국에서 많이 쓰는 멋진 편집 기능." — 각 부품은 제목/보조 정도의 필드만 갖고, 모양(글꼴·입체·움직임)이 곧 정체성.
   글꼴 기본값은 케이무비 쪽 META(font) 로 붙는다(부품 안에서는 K.font 를 그대로 써 카드 글꼴 오버라이드가 통한다).
   결정적 — 같은 t 면 같은 그림. 잡음도 seed 로.
   ============================================================ */
(function (g) {
  'use strict';
  var K = g.KM_PARTS, E = K.E, seg = K.seg, life = K.life, mix = K.mix;
  var clamp = K.clamp;
  function tw(ctx, text, weight, size, ls) { ctx.save(); ctx.font = K.font(weight, size); var w = K.textWidth(ctx, text, ls || 0); ctx.restore(); return w; }
  function rnd(seed) { var a = seed >>> 0 || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function darker(hex, k) { var c = K.hexToRgb(hex); return 'rgb(' + Math.round(c[0] * k) + ',' + Math.round(c[1] * k) + ',' + Math.round(c[2] * k) + ')'; }
  /* 유리 패널 — 뒤 화면을 흐려 담고 흰 테두리 (backdrop 이 투명이면 그냥 반투명) */
  function glass(ctx, x, y, w, h, r, a, T) {
    ctx.save();
    K.rrect(ctx, x, y, w, h, r); ctx.clip();
    try { if ('filter' in ctx) { ctx.filter = 'blur(' + Math.round(h * 0.18) + 'px) saturate(1.2)'; ctx.globalAlpha = a; ctx.drawImage(ctx.canvas, x - h * 0.3, y - h * 0.3, w + h * 0.6, h + h * 0.6, x - h * 0.3, y - h * 0.3, w + h * 0.6, h + h * 0.6); ctx.filter = 'none'; } } catch (e) {}
    ctx.globalAlpha = a; ctx.fillStyle = K.rgba(T.primary, 0.42); ctx.fillRect(x, y, w, h);
    var grd = ctx.createLinearGradient(x, y, x, y + h); grd.addColorStop(0, 'rgba(255,255,255,0.16)'); grd.addColorStop(0.5, 'rgba(255,255,255,0.03)'); grd.addColorStop(1, 'rgba(255,255,255,0.08)');
    ctx.fillStyle = grd; ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = a; K.rrect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  /* 3D 압출 글자 — 뒤로 겹겹이 어두운 층, 앞면은 color */
  function extrudeText(ctx, text, x, y, o) {
    var depth = o.depth || 12, dx = o.dx == null ? 1 : o.dx, dy = o.dy == null ? 1 : o.dy;
    ctx.save(); ctx.font = K.font(o.weight || 900, o.size); ctx.textBaseline = 'alphabetic'; ctx.textAlign = o.align || 'left';
    ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
    for (var i = depth; i >= 1; i--) { var k = 0.28 + 0.22 * (1 - i / depth); ctx.fillStyle = K.rgba(o.side || '#000', k); ctx.fillText(text, x + dx * i, y + dy * i); }
    if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = o.shadow; ctx.shadowOffsetY = o.shadow * 0.3; }
    ctx.fillStyle = o.color || '#fff'; ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    if (o.edge) { ctx.lineWidth = o.edge; ctx.strokeStyle = o.edgeColor || 'rgba(255,255,255,0.35)'; ctx.strokeText(text, x, y); }
    ctx.restore();
  }

  /* 1. 3D 압출 타이틀 */
  K.register({
    id: 'extrude', name: '3D 압출 타이틀', dur: 5,
    fields: [{ k: 'text', label: '제목', def: '금성초등학교' }, { k: 'sub', label: '보조', def: '2026 학교 소개' }, { k: 'tone', label: '색', def: 'gold', opts: ['gold', 'white', 'navy'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.7, 4.2, 5), rot = (1 - seg(t, 0, 1.1, E.outExpo)) * 0.35, rise = (1 - seg(t, 0, 0.9, E.outExpo)) * 80 * s;
      if (a <= 0.002) return;
      K.backing(ctx, W, H, a * 0.8, 'center');
      var size = 132 * s, col = p.tone === 'white' ? '#fff' : p.tone === 'navy' ? T.primary : T.accent;
      ctx.save(); ctx.translate(W / 2, H * 0.5 + rise); ctx.transform(1, 0, rot * 0.35, Math.cos(rot), 0, 0);
      extrudeText(ctx, p.text, 0, 0, { size: size, align: 'center', depth: Math.round(16 * s), dx: 1, dy: 1.15, color: col, side: p.tone === 'navy' ? '#061226' : '#1a1206', alpha: a, shadow: 22 * s, edge: 1.2 * s, edgeColor: 'rgba(255,255,255,0.28)' });
      ctx.restore();
      if (p.sub) K.drawText(ctx, p.sub, W / 2, H * 0.5 + 76 * s, { size: 30 * s, weight: 500, ls: 6 * s, align: 'center', color: T.sub, alpha: a * seg(t, 0.5, 1.3) });
    },
  });

  /* 2. 유리 패널 */
  K.register({
    id: 'glass', name: '유리 패널', dur: 5,
    fields: [{ k: 'text', label: '제목', def: '함께 배우고, 함께 빛나는' }, { k: 'sub', label: '보조', def: '금성초등학교' }, { k: 'pos', label: '위치', def: 'center', opts: ['center', 'bottomleft', 'topright'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.6, 4.3, 5), open = life(t, 0.05, 0.9, 4.3, 5, E.outExpo, E.inCubic);
      if (a <= 0.002) return;
      var w1 = tw(ctx, p.text, 700, 54 * s, 1 * s), w2 = p.sub ? tw(ctx, p.sub, 500, 26 * s, 4 * s) : 0, pw = Math.max(w1, w2) + 120 * s, ph = (p.sub ? 168 : 124) * s;
      var x = p.pos === 'bottomleft' ? 96 * s : p.pos === 'topright' ? W - 96 * s - pw : (W - pw) / 2, y = p.pos === 'bottomleft' ? H - 110 * s - ph : p.pos === 'topright' ? 96 * s : (H - ph) / 2;
      ctx.save(); ctx.translate(x + pw / 2, y + ph / 2); ctx.scale(mix(0.94, 1, open), mix(0.94, 1, open)); ctx.translate(-(x + pw / 2), -(y + ph / 2));
      glass(ctx, x, y, pw, ph, 18 * s, a, T);
      ctx.globalAlpha = a; ctx.fillStyle = K.rgba(T.accent, 0.9); ctx.fillRect(x + 36 * s, y + ph * 0.28, 4 * s, ph * 0.44);
      K.drawText(ctx, p.text, x + 60 * s, y + (p.sub ? 76 : 80) * s, { size: 54 * s, weight: 700, ls: 1 * s, color: T.text, alpha: a * seg(t, 0.3, 1) });
      if (p.sub) K.drawText(ctx, p.sub, x + 60 * s, y + 128 * s, { size: 26 * s, weight: 500, ls: 4 * s, color: T.accent, alpha: a * seg(t, 0.5, 1.2) });
      ctx.restore();
    },
  });

  /* 3. 뉴스 헤드라인 2단 */
  K.register({
    id: 'headline', name: '뉴스 헤드라인', dur: 6,
    fields: [{ k: 'text', label: '헤드라인', def: '금성초, 전교생 텃밭 프로젝트 시작' }, { k: 'sub', label: '부제', def: '4월부터 학년별 작물 재배 · 수확은 급식으로' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.5, 5.3, 6), up = (1 - seg(t, 0, 0.7, E.outExpo)) * 140 * s, subIn = seg(t, 0.35, 1.0, E.outExpo);
      if (a <= 0.002) return;
      var bh = 108 * s, sh = 52 * s, y0 = H - 150 * s - bh + up;
      ctx.save(); ctx.globalAlpha = a;
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24 * s; ctx.shadowOffsetY = 6 * s;
      ctx.fillStyle = T.primary; ctx.fillRect(0, y0, W, bh);
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.fillStyle = T.accent; ctx.fillRect(0, y0, 18 * s, bh);
      var grd = ctx.createLinearGradient(0, y0, 0, y0 + bh); grd.addColorStop(0, 'rgba(255,255,255,0.12)'); grd.addColorStop(1, 'rgba(0,0,0,0.12)'); ctx.fillStyle = grd; ctx.fillRect(18 * s, y0, W - 18 * s, bh);
      K.drawText(ctx, p.text, 72 * s, y0 + bh * 0.66, { size: 58 * s, weight: 900, ls: -0.5 * s, color: '#fff', alpha: a });
      // 부제 — 아래 얇은 밝은 띠가 옆으로 열림
      ctx.beginPath(); ctx.rect(0, y0 + bh, W * subIn, sh); ctx.clip();
      ctx.fillStyle = '#F3F5F8'; ctx.fillRect(0, y0 + bh, W, sh);
      ctx.fillStyle = T.accent; ctx.fillRect(0, y0 + bh, 18 * s, sh);
      K.drawText(ctx, p.sub, 72 * s, y0 + bh + sh * 0.68, { size: 28 * s, weight: 600, ls: 0.5 * s, color: T.primary, alpha: a });
      ctx.restore();
    },
  });

  /* 4. 뉴스 띠 (흐르는 안내) */
  K.register({
    id: 'ticker', name: '뉴스 띠', dur: 10,
    fields: [{ k: 'label', label: '라벨', def: '안내' }, { k: 'text', label: '흐르는 문구', def: '9월 12일 학부모 공개수업 · 9월 20일 가을 운동회 · 10월 4일 현장체험학습' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.4, 9.5, 10), h = 60 * s, y = H - 60 * s - h;
      if (a <= 0.002) return;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(6,14,32,0.86)'; ctx.fillRect(0, y, W, h);
      ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(0, y, W, 1.5 * s);
      var lw = tw(ctx, p.label, 800, 26 * s, 2 * s) + 56 * s;
      ctx.fillStyle = T.accent; ctx.fillRect(0, y, lw, h);
      K.drawText(ctx, p.label, 28 * s, y + h * 0.66, { size: 26 * s, weight: 800, ls: 2 * s, color: T.primary, alpha: a });
      var text = p.text + '     ·     ', w = tw(ctx, text, 500, 28 * s, 0.5 * s), speed = 150 * s, off = (t * speed) % w;
      ctx.beginPath(); ctx.rect(lw, y, W - lw, h); ctx.clip();
      for (var x = lw + 30 * s - off; x < W; x += w) K.drawText(ctx, text, x, y + h * 0.66, { size: 28 * s, weight: 500, ls: 0.5 * s, color: '#EAF0F8', alpha: a });
      ctx.restore();
    },
  });

  /* 5. 인터뷰 명패 */
  K.register({
    id: 'nameplate', name: '인터뷰 명패', dur: 5,
    fields: [{ k: 'text', label: '이름', def: '김민서' }, { k: 'sub', label: '소속·역할', def: '6학년 2반 · 전교 학생회장' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.5, 4.3, 5), line = seg(t, 0.1, 0.9, E.outExpo), tx = (1 - seg(t, 0.2, 0.9, E.outExpo)) * -30 * s;
      if (a <= 0.002) return;
      var x = 120 * s, y = H - 150 * s, w1 = tw(ctx, p.text, 700, 62 * s, 1 * s), w2 = tw(ctx, p.sub, 500, 26 * s, 2 * s), w = Math.max(w1, w2);
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = T.accent; ctx.fillRect(x - 28 * s, y - 70 * s, 5 * s, 104 * s * line);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 12 * s; ctx.shadowOffsetY = 2 * s;
      K.drawText(ctx, p.text, x + tx, y, { size: 62 * s, weight: 700, ls: 1 * s, color: '#fff', alpha: a * seg(t, 0.15, 0.8) });
      K.drawText(ctx, p.sub, x + tx, y + 40 * s, { size: 26 * s, weight: 500, ls: 2 * s, color: T.sub, alpha: a * seg(t, 0.35, 1.0) });
      ctx.shadowBlur = 0; ctx.fillStyle = K.rgba(T.accent, 0.85); ctx.fillRect(x, y + 12 * s, (w + 8 * s) * seg(t, 0.4, 1.3, E.outCubic), 1.5 * s);
      ctx.restore();
    },
  });

  /* 6. 도장 스탬프 */
  K.register({
    id: 'stamp', name: '도장 스탬프', dur: 4,
    fields: [{ k: 'text', label: '문구', def: '합격' }, { k: 'tone', label: '색', def: 'red', opts: ['red', 'gold', 'navy'] }, { k: 'pos', label: '위치', def: 'right', opts: ['right', 'center', 'left'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.08, 3.4, 4), hit = seg(t, 0, 0.32, E.outExpo), sc = mix(1.9, 1, hit), col = p.tone === 'gold' ? T.accent : p.tone === 'navy' ? T.primary : '#C0392B';
      if (a <= 0.002) return;
      var size = 96 * s, w = tw(ctx, p.text, 900, size, 6 * s), pw = w + 70 * s, ph = size * 1.55;
      var cx = p.pos === 'left' ? 120 * s + pw / 2 : p.pos === 'center' ? W / 2 : W - 120 * s - pw / 2, cy = H * 0.62;
      ctx.save(); ctx.globalAlpha = a * mix(0.4, 0.92, hit); ctx.translate(cx, cy); ctx.rotate(-0.16); ctx.scale(sc, sc);
      // 잉크 얼룩 질감 — 결정적 점 무늬로 살짝 뜯긴 느낌
      var R = rnd(1234); ctx.lineWidth = 7 * s; ctx.strokeStyle = col; K.rrect(ctx, -pw / 2, -ph / 2, pw, ph, 14 * s); ctx.stroke();
      ctx.font = K.font(900, size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(p.text, 0, 6 * s);
      ctx.globalCompositeOperation = 'destination-out';
      for (var i = 0; i < 70; i++) { var px = (R() - 0.5) * pw, py = (R() - 0.5) * ph, r = R() * 5 * s; ctx.globalAlpha = 0.5 * R(); ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
  });

  /* 7. 카드 플립 (3D 회전) */
  K.register({
    id: 'flip', name: '카드 플립', dur: 5,
    fields: [{ k: 'text', label: '제목', def: '우리 학교 자랑' }, { k: 'sub', label: '보조', def: '전교생 텃밭 · 오케스트라 · 코딩 동아리' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.3, 4.4, 5), ang = (1 - seg(t, 0, 1.0, E.outCubic)) * Math.PI;      // π → 0 (뒷면에서 앞면으로)
      if (a <= 0.002) return;
      var w1 = tw(ctx, p.text, 800, 64 * s, 0), w2 = p.sub ? tw(ctx, p.sub, 500, 28 * s, 2 * s) : 0, pw = Math.max(w1, w2) + 140 * s, ph = (p.sub ? 220 : 160) * s;
      var cx = W / 2, cy = H / 2, cosv = Math.cos(ang), front = cosv > 0, sx = Math.abs(cosv), sk = Math.sin(ang) * 0.12;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy); ctx.transform(sx, sk * 0.3, 0, 1, 0, 0);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40 * s; ctx.shadowOffsetY = 12 * s;
      K.rrect(ctx, -pw / 2, -ph / 2, pw, ph, 20 * s); ctx.fillStyle = front ? T.primary : darker(T.primary, 0.55); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      var grd = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2); grd.addColorStop(0, 'rgba(255,255,255,' + (front ? 0.14 : 0.04) + ')'); grd.addColorStop(1, 'rgba(0,0,0,0.18)'); ctx.fillStyle = grd; ctx.fill();
      K.rrect(ctx, -pw / 2 + 2 * s, -ph / 2 + 2 * s, pw - 4 * s, ph - 4 * s, 18 * s); ctx.strokeStyle = K.rgba(T.accent, front ? 0.9 : 0.35); ctx.lineWidth = 2 * s; ctx.stroke();
      if (front) {
        K.drawText(ctx, p.text, 0, p.sub ? -14 * s : 22 * s, { size: 64 * s, weight: 800, align: 'center', color: '#fff', alpha: a });
        if (p.sub) K.drawText(ctx, p.sub, 0, 50 * s, { size: 28 * s, weight: 500, ls: 2 * s, align: 'center', color: T.accent, alpha: a });
      } else { ctx.fillStyle = K.rgba(T.accent, 0.5); ctx.beginPath(); ctx.arc(0, 0, 18 * s, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
  });

  /* 8. 세로 글씨 */
  K.register({
    id: 'vertical', name: '세로 글씨', dur: 6,
    fields: [{ k: 'text', label: '문구', def: '배움이 자라는 곳' }, { k: 'sub', label: '작게', def: '금성초등학교' }, { k: 'pos', label: '위치', def: 'right', opts: ['right', 'left'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.6, 5.3, 6), n = p.text.length, size = 60 * s, gap = size * 1.18;
      if (a <= 0.002) return;
      var x = p.pos === 'left' ? 150 * s : W - 150 * s, y0 = (H - (n - 1) * gap) / 2 + size * 0.35;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = K.rgba(T.accent, 0.8); ctx.fillRect(x + (p.pos === 'left' ? -60 : 60) * s, y0 - size, 2 * s, (n - 1) * gap + size * 1.2);
      ctx.font = K.font(500, size); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 14 * s; ctx.shadowOffsetY = 2 * s;
      for (var i = 0; i < n; i++) { var k = seg(t, 0.1 + i * 0.09, 0.6 + i * 0.09, E.outCubic); ctx.globalAlpha = a * k; ctx.fillStyle = '#fff'; ctx.fillText(p.text[i], x, y0 + i * gap + (1 - k) * 14 * s); }
      if (p.sub) { ctx.globalAlpha = a * seg(t, 0.8, 1.6); ctx.font = K.font(500, 22 * s); ctx.save(); ctx.translate(x + (p.pos === 'left' ? -60 : 60) * s, y0 - size - 16 * s); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'left'; ctx.fillStyle = T.accent; ctx.fillText(p.sub, 0, 8 * s); ctx.restore(); }
      ctx.restore();
    },
  });

  /* 9. 형광펜 */
  K.register({
    id: 'marker', name: '형광펜', dur: 5,
    fields: [{ k: 'text', label: '문구', def: '오늘도 한 뼘 더' }, { k: 'tone', label: '색', def: 'gold', opts: ['gold', 'green', 'pink'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.3, 4.3, 5), stroke = seg(t, 0.15, 0.95, E.inOutCubic), size = 78 * s, w = tw(ctx, p.text, 700, size, 2 * s);
      if (a <= 0.002) return;
      var col = p.tone === 'green' ? 'rgba(120,220,150,0.55)' : p.tone === 'pink' ? 'rgba(255,140,180,0.55)' : K.rgba(T.accent, 0.6);
      var x = (W - w) / 2, y = H * 0.56;
      ctx.save(); ctx.globalAlpha = a;
      var R = rnd(77);
      ctx.fillStyle = col; ctx.beginPath();                                     // 형광펜 획 — 끝이 살짝 삐뚤
      var hw = w * stroke + 24 * s, y1 = y - size * 0.62, y2 = y + size * 0.18;
      ctx.moveTo(x - 14 * s, y1 + R() * 6 * s); ctx.lineTo(x + hw, y1 - 4 * s + R() * 6 * s); ctx.lineTo(x + hw + 6 * s, y2 + R() * 6 * s); ctx.lineTo(x - 8 * s, y2 + 3 * s); ctx.closePath(); ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8 * s; ctx.shadowOffsetY = 2 * s;
      K.drawText(ctx, p.text, x, y, { size: size, weight: 700, ls: 2 * s, color: '#fff', alpha: a * seg(t, 0.05, 0.5) });
      ctx.restore();
    },
  });

  /* 10. 카운트다운 */
  K.register({
    id: 'countdown', name: '카운트다운', dur: 4,
    fields: [{ k: 'from', label: '시작 숫자', def: '3' }, { k: 'text', label: '끝 문구', def: '시작!' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, from = Math.max(1, Math.min(9, parseInt(p.from, 10) || 3)), a = life(t, 0, 0.2, 3.5, 4);
      if (a <= 0.002) return;
      var step = Math.floor(t), u = t - step, num = from - step, cx = W / 2, cy = H / 2, r = 170 * s;
      ctx.save(); ctx.globalAlpha = a;
      K.backing(ctx, W, H, a * 0.7, 'center');
      if (num >= 1) {
        ctx.lineWidth = 10 * s; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = T.accent; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - u)); ctx.stroke();
        var pop = mix(1.25, 1, seg(u, 0, 0.35, E.outExpo));
        ctx.save(); ctx.translate(cx, cy); ctx.scale(pop, pop);
        extrudeText(ctx, String(num), 0, 80 * s, { size: 230 * s, weight: 900, align: 'center', depth: Math.round(10 * s), color: '#fff', side: '#000', shadow: 20 * s });
        ctx.restore();
      } else {
        var k = seg(t - from, 0, 0.5, E.outBack);
        ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
        extrudeText(ctx, p.text, 0, 46 * s, { size: 140 * s, weight: 900, align: 'center', depth: Math.round(12 * s), color: T.accent, side: '#1a1206', shadow: 24 * s });
        ctx.restore();
      }
      ctx.restore();
    },
  });

  /* 11. 리본 배너 */
  K.register({
    id: 'ribbon', name: '리본 배너', dur: 5,
    fields: [{ k: 'text', label: '문구', def: '2026 가을 운동회' }, { k: 'pos', label: '위치', def: 'topleft', opts: ['topleft', 'topright'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.5, 4.3, 5), slide = (1 - seg(t, 0, 0.8, E.outExpo)), size = 40 * s, w = tw(ctx, p.text, 800, size, 2 * s) + 90 * s, h = 76 * s;
      if (a <= 0.002) return;
      var left = p.pos === 'topleft', x = left ? 0 - w * slide : W - w + w * slide, y = 120 * s, fold = 22 * s;
      ctx.save(); ctx.globalAlpha = a;
      ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18 * s; ctx.shadowOffsetY = 5 * s;
      ctx.fillStyle = T.accent; ctx.beginPath();
      if (left) { ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - fold, y + h / 2); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); }
      else { ctx.moveTo(x + w, y); ctx.lineTo(x, y); ctx.lineTo(x + fold, y + h / 2); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      // 접힌 면 — 어두운 삼각(입체)
      ctx.fillStyle = darker(T.accent, 0.62); ctx.beginPath();
      if (left) { ctx.moveTo(x, y + h); ctx.lineTo(x + fold, y + h); ctx.lineTo(x, y + h + fold); } else { ctx.moveTo(x + w, y + h); ctx.lineTo(x + w - fold, y + h); ctx.lineTo(x + w, y + h + fold); }
      ctx.closePath(); ctx.fill();
      var grd = ctx.createLinearGradient(0, y, 0, y + h); grd.addColorStop(0, 'rgba(255,255,255,0.22)'); grd.addColorStop(1, 'rgba(0,0,0,0.12)'); ctx.fillStyle = grd; ctx.fillRect(x, y, w, h);
      K.drawText(ctx, p.text, x + (left ? 40 : 40 + fold) * s, y + h * 0.66, { size: size, weight: 800, ls: 2 * s, color: T.primary, alpha: a });
      ctx.restore();
    },
  });

  /* 12. 말풍선 */
  K.register({
    id: 'bubble', name: '말풍선', dur: 4,
    fields: [{ k: 'text', label: '한마디', def: '학교 오는 게 제일 재밌어요!' }, { k: 'pos', label: '꼬리', def: 'left', opts: ['left', 'right'] }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.25, 3.4, 4), pop = seg(t, 0, 0.45, E.outBack), size = 44 * s, w = tw(ctx, p.text, 700, size, 0) + 80 * s, h = 96 * s;
      if (a <= 0.002) return;
      var left = p.pos === 'left', x = left ? W * 0.52 : W * 0.48 - w, y = H * 0.24, tailX = left ? x + 40 * s : x + w - 40 * s;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(tailX, y + h); ctx.scale(pop, pop); ctx.translate(-tailX, -(y + h));
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 20 * s; ctx.shadowOffsetY = 6 * s;
      ctx.fillStyle = '#fff'; K.rrect(ctx, x, y, w, h, 28 * s); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tailX - 16 * s, y + h - 2); ctx.lineTo(tailX + 16 * s, y + h - 2); ctx.lineTo(tailX + (left ? -18 : 18) * s, y + h + 36 * s); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      K.drawText(ctx, p.text, x + 40 * s, y + h * 0.65, { size: size, weight: 700, color: T.primary, alpha: a });
      ctx.restore();
    },
  });

  /* 13. 라이브 표시 */
  K.register({
    id: 'live', name: '라이브 표시', dur: 8,
    fields: [{ k: 'label', label: '라벨', def: 'LIVE' }, { k: 'text', label: '내용', def: '금성초 가을 운동회 현장' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.35, 7.6, 8), pulse = 0.55 + 0.45 * Math.abs(Math.sin(t * 2.4));
      if (a <= 0.002) return;
      var x = 90 * s, y = 90 * s, h = 54 * s, lw = tw(ctx, p.label, 800, 24 * s, 3 * s) + 64 * s, cw = tw(ctx, p.text, 600, 24 * s, 0.5 * s) + 48 * s;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = '#D93025'; K.rrect(ctx, x, y, lw, h, 8 * s); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,' + pulse + ')'; ctx.beginPath(); ctx.arc(x + 26 * s, y + h / 2, 7 * s, 0, Math.PI * 2); ctx.fill();
      K.drawText(ctx, p.label, x + 44 * s, y + h * 0.67, { size: 24 * s, weight: 800, ls: 3 * s, color: '#fff', alpha: a });
      glass(ctx, x + lw + 8 * s, y, cw * seg(t, 0.2, 0.9, E.outExpo), h, 8 * s, a, T);
      ctx.save(); ctx.beginPath(); ctx.rect(x + lw + 8 * s, y, cw * seg(t, 0.2, 0.9, E.outExpo), h); ctx.clip();
      K.drawText(ctx, p.text, x + lw + 32 * s, y + h * 0.67, { size: 24 * s, weight: 600, ls: 0.5 * s, color: '#fff', alpha: a });
      ctx.restore(); ctx.restore();
    },
  });

  /* 14. 좌우 대비 라벨 */
  K.register({
    id: 'split', name: '좌우 대비 라벨', dur: 5,
    fields: [{ k: 'text', label: '왼쪽', def: '예전' }, { k: 'sub', label: '오른쪽', def: '지금' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.5, 4.3, 5), line = seg(t, 0, 0.8, E.outExpo);
      if (a <= 0.002) return;
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = K.rgba(T.accent, 0.95); ctx.fillRect(W / 2 - 2 * s, H / 2 - H / 2 * line, 4 * s, H * line);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16 * s;
      var y = 150 * s;
      [[p.text, W * 0.25, -1], [p.sub, W * 0.75, 1]].forEach(function (it, i) {
        var k = seg(t, 0.3 + i * 0.15, 0.9 + i * 0.15, E.outExpo), size = 56 * s, w = tw(ctx, it[0], 800, size, 4 * s) + 64 * s;
        ctx.fillStyle = K.rgba(T.primary, 0.82); K.rrect(ctx, it[1] - w / 2, y - 44 * s, w, 68 * s, 12 * s); ctx.fill();
        K.drawText(ctx, it[0], it[1] + it[2] * (1 - k) * 30 * s, y + 6 * s, { size: size, weight: 800, ls: 4 * s, align: 'center', color: '#fff', alpha: a * k });
      });
      ctx.restore();
    },
  });

  /* 15. 반사 타이틀 (바닥 반사) */
  K.register({
    id: 'reflect', name: '반사 타이틀', dur: 5,
    fields: [{ k: 'text', label: '제목', def: 'GEUMSEONG' }, { k: 'sub', label: '보조', def: '금성초등학교' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.7, 4.3, 5), k = seg(t, 0, 1.0, E.outExpo), size = 150 * s, y = H * 0.52, ls = 10 * s;
      if (a <= 0.002) return;
      K.backing(ctx, W, H, a * 0.75, 'center');
      ctx.save(); ctx.globalAlpha = a;
      // 반사 — 뒤집어 옅게, 아래로 갈수록 사라짐
      ctx.save(); ctx.translate(0, y + 18 * s); ctx.scale(1, -0.9); ctx.translate(0, -y);
      K.drawText(ctx, p.text, W / 2, y, { size: size, weight: 900, ls: ls * k, align: 'center', color: '#fff', alpha: a * 0.28 });
      ctx.restore();
      var grd = ctx.createLinearGradient(0, y + 10 * s, 0, y + size * 0.9); grd.addColorStop(0, 'rgba(6,14,32,0)'); grd.addColorStop(1, 'rgba(6,14,32,1)');
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = grd; ctx.fillRect(0, y + 10 * s, W, size); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = K.rgba(T.accent, 0.8); ctx.fillRect(W / 2 - W * 0.3 * k, y + 14 * s, W * 0.6 * k, 1.5 * s);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24 * s; ctx.shadowOffsetY = 4 * s;
      K.drawText(ctx, p.text, W / 2, y, { size: size, weight: 900, ls: ls * k, align: 'center', color: '#fff', alpha: a });
      ctx.shadowBlur = 0;
      if (p.sub) K.drawText(ctx, p.sub, W / 2, y + 70 * s, { size: 28 * s, weight: 500, ls: 8 * s, align: 'center', color: T.accent, alpha: a * seg(t, 0.6, 1.4) });
      ctx.restore();
    },
  });

  /* 16. 이중 윤곽 포스터 */
  K.register({
    id: 'outline', name: '이중 윤곽 포스터', dur: 5,
    fields: [{ k: 'text', label: '문구', def: '운동회' }, { k: 'sub', label: '보조', def: '9.20 SAT' }],
    draw: function (ctx, W, H, t, p, T) {
      var s = H / 1080, a = life(t, 0, 0.35, 4.4, 5), k = seg(t, 0, 0.6, E.outBack), size = 200 * s, y = H * 0.58;
      if (a <= 0.002) return;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, y); ctx.scale(k, k); ctx.translate(-W / 2, -y);
      ctx.font = K.font(900, size); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
      ctx.lineWidth = 34 * s; ctx.strokeStyle = T.primary; ctx.strokeText(p.text, W / 2 + 10 * s, y + 10 * s);
      ctx.lineWidth = 20 * s; ctx.strokeStyle = '#fff'; ctx.strokeText(p.text, W / 2, y);
      ctx.fillStyle = T.accent; ctx.fillText(p.text, W / 2, y);
      if (p.sub) K.drawText(ctx, p.sub, W / 2, y + 72 * s, { size: 36 * s, weight: 800, ls: 8 * s, align: 'center', color: '#fff', alpha: a * seg(t, 0.4, 1.0) });
      ctx.restore();
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
