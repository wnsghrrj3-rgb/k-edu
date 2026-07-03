/* ============================================================
   케이메이커 2.0 — 모션 엔진 (motion.js)
   1차: 요소 애니메이션(등장/상시) · [▶ 재생] 전체화면 · 움직이는 배경
   2차: 고급 이펙트 팩(fx) — 금가루 팡 · 글자 조립 · 네온 발광 ·
        스포트라이트 · 반짝이 궤적 · 도장 쾅 + 모션 배경 3종 추가
   kmake.js보다 먼저 로드되어도 안전 (모든 참조는 호출 시점)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 이징 ---------- */
  const easeOutCubic = p => 1 - Math.pow(1 - p, 3);
  const easeOutBack = p => { const c = 1.70158 * 1.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const easeOutBounce = p => {
    const n = 7.5625, d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
  };
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

  /* ---------- 프리셋 정의 ---------- */
  const IN_FX = {
    none:    { n: '없음 (바로 보임)' },
    pop:     { n: '팝! 튀어나오기' },
    fadeIn:  { n: '스르륵 나타나기' },
    slideL:  { n: '왼쪽에서 날아오기' },
    slideR:  { n: '오른쪽에서 날아오기' },
    slideUp: { n: '아래에서 떠오르기' },
    drop:    { n: '위에서 떨어지기 (통통)' },
  };
  const LOOP_FX = {
    none:    { n: '없음' },
    float:   { n: '둥둥 떠다니기' },
    pulse:   { n: '두근두근 커졌다 작아지기' },
    spin:    { n: '빙글빙글 돌기' },
    shake:   { n: '살랑살랑 흔들기' },
    twinkle: { n: '반짝반짝 깜빡이기' },
  };
  /* 2차 — 특수 효과 (요소별 anim.fx) */
  const FX = {
    none:      { n: '없음' },
    goldburst: { n: '✨ 금가루 팡 — 등장하며 반짝' },
    charpop:   { n: '🔤 글자 하나씩 조립 (텍스트만)', textOnly: true },
    stamp:     { n: '📮 도장 쾅! — 위에서 찍히기' },
    spotlight: { n: '🔦 스포트라이트 — 조명 켜지듯' },
    trail:     { n: '⭐ 반짝이 궤적 — 날아올 때 별가루' },
    neon:      { n: '💡 네온 발광 — 테두리가 숨쉬듯 (계속)' },
  };
  const IN_DUR = 0.65;      // 기본 등장 소요시간
  const STAMP_DUR = 0.55;   // 도장 쾅 소요시간
  const CHAR_STEP = 0.07;   // 글자 조립 간격

  function baseOf(o) {
    return { left: o.left, top: o.top, scaleX: o.scaleX, scaleY: o.scaleY, angle: o.angle, opacity: (o.opacity == null ? 1 : o.opacity) };
  }
  function restore(o, B) { o.set(B); o.setCoords(); }
  function getAnim(o) { return o.anim || { in: { type: 'none', delay: 0 }, loop: { type: 'none' }, fx: { type: 'none' } }; }
  function fxOf(A) { return (A.fx && A.fx.type) || 'none'; }
  function isTextObj(o) { return o && o.text != null; }
  function hasMotion(o) {
    const a = getAnim(o);
    return (a.in && a.in.type !== 'none') || (a.loop && a.loop.type !== 'none') || fxOf(a) !== 'none';
  }
  /* 등장 국면 존재 여부 — stamp/charpop 은 자체가 등장 효과 */
  function hasEntry(o, A) {
    const f = fxOf(A);
    if (f === 'stamp' || f === 'spotlight') return true;
    if (f === 'charpop' && isTextObj(o)) return true;
    return !!(A.in && A.in.type !== 'none');
  }
  function entryDur(o, A) {
    const f = fxOf(A);
    if (f === 'stamp') return STAMP_DUR;
    if (f === 'charpop' && isTextObj(o)) return Math.min(4.5, (o.text || '').length * CHAR_STEP + 0.4);
    if (A.in && A.in.type !== 'none') return IN_DUR;
    if (f === 'spotlight') return 0.9; // 등장 효과 없이 조명만 켜질 때
    return 0;
  }

  /* 등장 효과 — p(0→1), B=기준값 */
  function applyIn(o, type, p, B, W, H) {
    const e = easeOutCubic(p);
    if (type === 'fadeIn') { o.set({ opacity: B.opacity * e }); }
    else if (type === 'pop') { const s = Math.max(0.001, easeOutBack(p)); o.set({ scaleX: B.scaleX * s, scaleY: B.scaleY * s, opacity: B.opacity * Math.min(1, p * 2.5) }); }
    else if (type === 'slideL') { o.set({ left: B.left - (1 - e) * W * 0.22, opacity: B.opacity * Math.min(1, p * 2) }); }
    else if (type === 'slideR') { o.set({ left: B.left + (1 - e) * W * 0.22, opacity: B.opacity * Math.min(1, p * 2) }); }
    else if (type === 'slideUp') { o.set({ top: B.top + (1 - e) * H * 0.14, opacity: B.opacity * Math.min(1, p * 2) }); }
    else if (type === 'drop') { const b = easeOutBounce(p); o.set({ top: B.top - (1 - b) * H * 0.22, opacity: B.opacity * Math.min(1, p * 3) }); }
    o.setCoords();
  }
  /* 상시 효과 — t=초, B=기준값 */
  function applyLoop(o, type, t, B) {
    if (type === 'float') o.set({ top: B.top + Math.sin(t * 2.1) * 9 });
    else if (type === 'pulse') { const k = 1 + 0.06 * Math.sin(t * 3.4); o.set({ scaleX: B.scaleX * k, scaleY: B.scaleY * k }); }
    else if (type === 'spin') o.set({ angle: B.angle + t * 70 });
    else if (type === 'shake') o.set({ angle: B.angle + Math.sin(t * 9) * 2.4 });
    else if (type === 'twinkle') o.set({ opacity: B.opacity * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4.2))) });
    o.setCoords();
  }
  /* 도장 쾅 — p(0→1) */
  const STAMP_HIT = 0.5; // 이 지점에서 쾅
  function applyStamp(o, p, B) {
    if (p < STAMP_HIT) {
      const q = p / STAMP_HIT, e = q * q * q; // 가속하며 내리꽂기
      const s = 2.4 - 1.4 * e;
      o.set({ scaleX: B.scaleX * s, scaleY: B.scaleY * s, opacity: B.opacity * (0.25 + 0.75 * q) });
    } else {
      const w = (p - STAMP_HIT) * STAMP_DUR; // 충격 후 경과(초)
      const s = 1 + 0.06 * Math.sin(w * 42) * Math.exp(-w * 13);
      o.set({ scaleX: B.scaleX * s, scaleY: B.scaleY * s, opacity: B.opacity });
    }
    o.setCoords();
  }

  /* ============================================================
     FX 런타임 — fabric 위 오버레이 캔버스 (입자·발광·암전·글자조립)
     재생 모드와 편집 미리보기 양쪽에서 구동
     ============================================================ */
  const FXR = (function () {
    let cv = null, fired = new Set(), parts = [], last = 0;
    let cvDom = null, cvOverridden = false; // 오버라이드(MP4·뷰어) — cv가 null(마운트 전)이어도 동작해야 함
    function setOverride(c) {
      if (c) { if (!cvOverridden) { cvDom = cv; cvOverridden = true; } cv = c; }
      else if (cvOverridden) { cv = cvDom; cvDom = null; cvOverridden = false; }
      last = 0;
    }
    // 프레임별 등록 큐 (매 프레임 begin()에서 비움)
    let spots = [], neons = [], chars = [];

    function mount(st) {
      if (cv && cv.isConnected) return;
      cv = document.createElement('canvas');
      cv.id = 'kmFx';
      cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;border-radius:inherit';
      st.appendChild(cv);
    }
    function fit() {
      if (cvOverridden) return; // 오버라이드 중엔 고정 크기 (오프라인 렌더·뷰어)
      if (!cv) return;
      const st = cv.parentNode; if (!st) return;
      const w = st.clientWidth || 1, h = st.clientHeight || 1;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    }
    function rectOf(o) { return o.getBoundingRect(); } // 뷰포트(줌) 반영 px
    function centerOf(o) { const r = rectOf(o); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, d: Math.hypot(r.width, r.height) }; }
    function fillColorOf(o) { const f = o.fill || o.stroke; return (typeof f === 'string' && f && f !== 'transparent') ? f : '#7C3AED'; }

    /* ---- 프레임 수명주기 ---- */
    function begin() { spots = []; neons = []; chars = []; }
    function reset() { fired.clear(); parts = []; last = 0; begin(); clearCanvas(); }
    function clearCanvas() { if (cv) { fit(); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); } }
    function active() { return parts.length > 0 || spots.length > 0 || neons.length > 0 || chars.length > 0; }

    /* ---- 등록: 금가루 팡 (1회) ---- */
    function burstOnce(o) {
      const key = 'gb' + (o.__uid || (o.__uid = Math.random()));
      if (fired.has(key)) return;
      fired.add(key);
      const c = centerOf(o), COLS = ['#FDE68A', '#FBBF24', '#F59E0B', '#FFF7D6', '#FCD34D'];
      const N = 42, base = 90 + c.d * 0.55;
      for (let i = 0; i < N; i++) {
        const a = Math.random() * 6.283, v = base * (0.35 + Math.random() * 0.9);
        parts.push({
          k: 'gold', x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - base * 0.25,
          g: 380, s: 2 + Math.random() * 3.5, life: 1.1 + Math.random() * 0.7, t: 0,
          ph: Math.random() * 6.28, c: COLS[(Math.random() * COLS.length) | 0], star: Math.random() < 0.3,
        });
      }
    }
    /* ---- 등록: 도장 충격파 (1회) ---- */
    function stampOnce(o) {
      const key = 'st' + (o.__uid || (o.__uid = Math.random()));
      if (fired.has(key)) return;
      fired.add(key);
      const c = centerOf(o);
      parts.push({ k: 'ring', x: c.x, y: c.y, r0: c.d * 0.28, r1: c.d * 0.85, life: 0.5, t: 0, c: '#EF4444', lw: 6 });
      parts.push({ k: 'ring', x: c.x, y: c.y, r0: c.d * 0.22, r1: c.d * 1.05, life: 0.62, t: 0, c: '#FCA5A5', lw: 3 });
      for (let i = 0; i < 10; i++) { // 먼지
        const a = Math.random() * 6.283, v = 60 + Math.random() * 140;
        parts.push({ k: 'gold', x: c.x, y: c.y + c.h * 0.3, vx: Math.cos(a) * v, vy: -Math.abs(Math.sin(a)) * v * 0.7, g: 500, s: 1.5 + Math.random() * 2.5, life: 0.5 + Math.random() * 0.3, t: 0, ph: 0, c: '#D1B08A', star: false });
      }
    }
    /* ---- 등록: 반짝이 궤적 (등장 중 매 프레임) ---- */
    function trail(o) {
      const c = centerOf(o);
      for (let i = 0; i < 2; i++) {
        parts.push({
          k: 'star', x: c.x + (Math.random() - .5) * c.w * 0.5, y: c.y + (Math.random() - .5) * c.h * 0.5,
          vx: (Math.random() - .5) * 30, vy: -12 - Math.random() * 26, g: 0,
          s: 2.5 + Math.random() * 3.5, life: 0.45 + Math.random() * 0.45, t: 0, ph: Math.random() * 6.28,
          c: Math.random() < 0.5 ? '#FDE68A' : '#FFFFFF', rot: Math.random() * 6.28,
        });
      }
    }
    /* ---- 등록: 스포트라이트 (매 프레임) ----
       phase: 'pre'(암전만) | 'in'(구멍 확장, p) | 'out'(암전 해제, w초 경과) */
    function spot(o, phase, p) {
      const c = centerOf(o);
      let dark = 0.72, r = 0, flick = 1;
      if (phase === 'pre') { r = 0; dark = 0.72 * clamp01(p); if (dark <= 0.01) return; }
      else if (phase === 'in') {
        r = c.d * (0.4 + 0.75 * easeOutCubic(p));
        if (p < 0.22) flick = Math.random() < 0.45 ? 0.35 : 1; // 조명 켜질 때 지지직
      } else { // out
        r = c.d * 1.15;
        dark = 0.72 * clamp01(1 - p / 0.9);
        if (dark <= 0.01) return;
      }
      spots.push({ x: c.x, y: c.y, r, dark, flick });
    }
    /* ---- 등록: 네온 (매 프레임) ---- */
    function neon(o, t) {
      const r = rectOf(o);
      neons.push({ r, c: fillColorOf(o), t });
    }
    /* ---- 등록: 글자 조립 (매 프레임, tt=등장 후 경과초) ---- */
    function charpop(o, tt) {
      if (!isTextObj(o)) return;
      try {
        const z = (typeof canvas !== 'undefined' && canvas) ? canvas.getZoom() : 1;
        const M = o.calcTransformMatrix();
        const lines = o._textLines || [], cb = o.__charBounds || [];
        const fs = o.fontSize * (o.scaleY || 1) * z;
        const font = `${o.fontStyle && o.fontStyle !== 'normal' ? o.fontStyle + ' ' : ''}${o.fontWeight && o.fontWeight !== 'normal' ? o.fontWeight + ' ' : ''}${fs}px ${o.fontFamily || 'Jua'}`;
        const fill = (typeof o.fill === 'string') ? o.fill : '#2D3748';
        const ang = (o.angle || 0) * Math.PI / 180;
        let idx = 0, lineTop = 0;
        for (let i = 0; i < lines.length; i++) {
          const lh = o.getHeightOfLine ? o.getHeightOfLine(i) : o.fontSize * 1.16;
          const lo = o._getLineLeftOffset ? o._getLineLeftOffset(i) : 0;
          const bounds = cb[i] || [];
          for (let j = 0; j < lines[i].length; j++) {
            const ch = lines[i][j], b = bounds[j];
            const tc = idx * CHAR_STEP; idx++;
            if (!b || ch === ' ') continue;
            const pp = clamp01((tt - tc) / 0.28);
            if (pp <= 0) continue;
            const lx = -o.width / 2 + lo + b.left + b.width / 2;
            const ly = -o.height / 2 + lineTop + lh * 0.52;
            const pt = fabric.util.transformPoint(new fabric.Point(lx, ly), M);
            chars.push({ ch, x: pt.x * z, y: pt.y * z, font, fill, ang, s: pp >= 1 ? 1 : Math.max(0.001, easeOutBack(pp)), a: Math.min(1, pp * 3) });
          }
          lineTop += lh;
        }
      } catch (e) { /* 레이아웃 미초기화 등 — 조용히 건너뜀 */ }
    }

    /* ---- 렌더 ---- */
    function render(now) {
      if (!cv) return;
      fit();
      const ctx = cv.getContext('2d');
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      ctx.clearRect(0, 0, cv.width, cv.height);

      /* 1) 암전 + 스포트라이트 구멍 */
      if (spots.length) {
        const dark = Math.max(...spots.map(s => s.dark));
        ctx.save();
        ctx.fillStyle = `rgba(10,12,24,${dark})`;
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.globalCompositeOperation = 'destination-out';
        for (const s of spots) {
          if (s.r <= 0) continue;
          const g = ctx.createRadialGradient(s.x, s.y, s.r * 0.25, s.x, s.y, s.r);
          g.addColorStop(0, `rgba(0,0,0,${s.flick})`);
          g.addColorStop(0.75, `rgba(0,0,0,${0.85 * s.flick})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
        }
        ctx.restore();
        // 조명 가장자리 따뜻한 링
        ctx.save();
        for (const s of spots) {
          if (s.r <= 0) continue;
          ctx.globalAlpha = 0.14 * s.flick * (dark / 0.72);
          const g2 = ctx.createRadialGradient(s.x, s.y, s.r * 0.6, s.x, s.y, s.r);
          g2.addColorStop(0, 'rgba(255,238,180,0)');
          g2.addColorStop(0.85, 'rgba(255,238,180,0.9)');
          g2.addColorStop(1, 'rgba(255,238,180,0)');
          ctx.fillStyle = g2;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
        }
        ctx.restore();
      }

      /* 2) 네온 발광 */
      for (const nn of neons) {
        const { r, c, t } = nn;
        const breathe = 0.5 + 0.5 * Math.sin(t * 3.1);
        ctx.save();
        ctx.shadowColor = c;
        ctx.shadowBlur = 12 + 14 * breathe;
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.55 + 0.4 * breathe;
        ctx.lineWidth = 3;
        roundRect(ctx, r.left - 7, r.top - 7, r.width + 14, r.height + 14, 12);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFFFFF';
        ctx.globalAlpha = 0.35 + 0.35 * breathe;
        ctx.lineWidth = 1.2;
        roundRect(ctx, r.left - 7, r.top - 7, r.width + 14, r.height + 14, 12);
        ctx.stroke();
        ctx.restore();
      }

      /* 3) 글자 조립 */
      for (const g of chars) {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.ang);
        ctx.scale(g.s, g.s);
        ctx.globalAlpha = g.a;
        ctx.font = g.font;
        ctx.fillStyle = g.fill;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(g.ch, 0, 0);
        ctx.restore();
      }

      /* 4) 입자 */
      const alive = [];
      for (const p of parts) {
        p.t += dt;
        if (p.t >= p.life) continue;
        alive.push(p);
        const q = p.t / p.life;
        if (p.k === 'ring') {
          const r = p.r0 + (p.r1 - p.r0) * easeOutCubic(q);
          ctx.save();
          ctx.globalAlpha = (1 - q) * 0.85;
          ctx.strokeStyle = p.c; ctx.lineWidth = p.lw * (1 - q * 0.7);
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.stroke();
          ctx.restore();
          continue;
        }
        p.vy += (p.g || 0) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.save();
        if (p.k === 'star') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot || 0);
          ctx.globalAlpha = (1 - q);
          ctx.fillStyle = p.c;
          const s = p.s * (1 - q * 0.6);
          drawStar4(ctx, s);
        } else { // gold
          const tw = 0.55 + 0.45 * Math.sin(p.t * 11 + p.ph);
          ctx.globalAlpha = (1 - q) * tw;
          ctx.fillStyle = p.c;
          if (p.star) { ctx.translate(p.x, p.y); ctx.rotate(p.t * 4 + p.ph); drawStar4(ctx, p.s * 1.25); }
          else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1 - q * 0.4), 0, 7); ctx.fill(); }
        }
        ctx.restore();
      }
      parts = alive;
    }
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    }
    function drawStar4(ctx, s) { // 4각 별가루
      ctx.beginPath();
      ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s);
      ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
      ctx.fill();
    }

    return { mount, fit, begin, render, reset, clearCanvas, active, burstOnce, stampOnce, trail, spot, neon, charpop, setOverride };
  })();

  /* ============================================================
     통합 프레임 로직 — 재생 tick과 미리보기가 공유
     o=객체, B=기준값, A=anim, t=경과초, useDelay=지연 반영 여부
     ============================================================ */
  function animFrame(o, B, A, t, useDelay) {
    const f = fxOf(A);
    const start = useDelay ? ((A.in && +A.in.delay) || 0) : 0;
    const entry = hasEntry(o, A);
    const dur = entryDur(o, A);

    if (entry && t < start) {
      o.set({ opacity: 0 }); o.setCoords();
      if (f === 'spotlight') { const lead = start - t; if (lead < 0.35) FXR.spot(o, 'pre', 1 - lead / 0.35); }
      return;
    }
    if (entry && t < start + dur) {
      const p = (t - start) / dur;
      restore(o, B);
      if (f === 'stamp') {
        applyStamp(o, p, B);
        if (p >= STAMP_HIT) FXR.stampOnce(o);
      } else if (f === 'charpop' && isTextObj(o)) {
        o.set({ opacity: 0 }); o.setCoords();
        FXR.charpop(o, t - start);
      } else {
        applyIn(o, (A.in && A.in.type) || 'none', p, B, baseW, baseH);
      }
      if (f === 'trail') FXR.trail(o);
      if (f === 'spotlight') FXR.spot(o, 'in', p);
      return;
    }
    restore(o, B);
    if (A.loop && A.loop.type !== 'none') applyLoop(o, A.loop.type, t - (entry ? start + dur : 0), B);
    if (t >= start + dur) {
      if (f === 'goldburst') FXR.burstOnce(o);
      if (f === 'neon') FXR.neon(o, t);
      if (f === 'spotlight') { const w = t - start - dur; if (w < 0.9) FXR.spot(o, 'out', w); }
    }
  }

  /* ============================================================
     움직이는 배경 (fabric 캔버스 뒤에 별도 캔버스)
     ============================================================ */
  const MBG = {
    confetti: {
      n: '컨페티 파티', base: '#FFFCF5',
      thumb: '<rect width="1200" height="800" fill="#FFFCF5"/><rect x="150" y="120" width="46" height="46" rx="10" fill="#F472B6" transform="rotate(24 173 143)"/><circle cx="900" cy="180" r="26" fill="#60A5FA"/><rect x="480" y="320" width="40" height="40" rx="9" fill="#FBBF24" transform="rotate(40 500 340)"/><circle cx="260" cy="560" r="22" fill="#34D399"/><rect x="860" y="520" width="44" height="44" rx="10" fill="#A78BFA" transform="rotate(30 882 542)"/><circle cx="620" cy="640" r="18" fill="#FB7185"/>',
      init(w, h) {
        const C = ['#F472B6', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#FB7185'];
        const N = Math.round(w * h / 26000);
        this.ps = Array.from({ length: N }, () => ({
          x: Math.random() * w, y: Math.random() * h, s: 7 + Math.random() * 9,
          v: 26 + Math.random() * 44, sway: 20 + Math.random() * 30, ph: Math.random() * 6.28,
          rot: Math.random() * 360, rv: (Math.random() - .5) * 160, c: C[(Math.random() * C.length) | 0],
          circle: Math.random() < 0.4,
        }));
      },
      step(ctx, w, h, t, dt) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#FFFDF7'); g.addColorStop(1, '#FFF4F6');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (const p of this.ps) {
          p.y += p.v * dt; p.rot += p.rv * dt;
          if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
          const x = p.x + Math.sin(t * 1.6 + p.ph) * p.sway;
          ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.rot * Math.PI / 180);
          ctx.fillStyle = p.c; ctx.globalAlpha = 0.9;
          if (p.circle) { ctx.beginPath(); ctx.arc(0, 0, p.s * 0.55, 0, 7); ctx.fill(); }
          else { const r = p.s * 0.28; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-p.s / 2, -p.s / 2, p.s, p.s, r) : ctx.rect(-p.s / 2, -p.s / 2, p.s, p.s); ctx.fill(); }
          ctx.restore();
        }
      },
    },
    stars: {
      n: '밤하늘 반짝', base: '#1B2947',
      thumb: '<rect width="1200" height="800" fill="#1B2947"/><circle cx="200" cy="180" r="8" fill="#fff"/><circle cx="520" cy="120" r="5" fill="#FDE68A"/><circle cx="880" cy="220" r="7" fill="#fff"/><circle cx="340" cy="420" r="4" fill="#fff" opacity=".7"/><circle cx="1020" cy="480" r="6" fill="#FDE68A"/><circle cx="680" cy="560" r="5" fill="#fff"/><circle cx="140" cy="640" r="6" fill="#fff" opacity=".8"/>',
      init(w, h) {
        const N = Math.round(w * h / 14000);
        this.ps = Array.from({ length: N }, () => ({
          x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 2.4,
          ph: Math.random() * 6.28, sp: 1.5 + Math.random() * 3, gold: Math.random() < 0.22,
        }));
      },
      step(ctx, w, h, t) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#141F38'); g.addColorStop(1, '#243458');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (const p of this.ps) {
          const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
          ctx.globalAlpha = a; ctx.fillStyle = p.gold ? '#FDE68A' : '#FFFFFF';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
          if (p.r > 2.4) {
            ctx.globalAlpha = a * 0.5; ctx.fillRect(p.x - p.r * 3, p.y - 0.5, p.r * 6, 1); ctx.fillRect(p.x - 0.5, p.y - p.r * 3, 1, p.r * 6);
          }
        }
        ctx.globalAlpha = 1;
      },
    },
    bubbles: {
      n: '파스텔 비눗방울', base: '#EAF4FF',
      thumb: '<rect width="1200" height="800" fill="#EAF4FF"/><circle cx="240" cy="560" r="90" fill="#BFDBFE" opacity=".55"/><circle cx="640" cy="300" r="120" fill="#DDD6FE" opacity=".5"/><circle cx="960" cy="600" r="70" fill="#BBF7D0" opacity=".55"/><circle cx="880" cy="160" r="55" fill="#FBCFE8" opacity=".6"/>',
      init(w, h) {
        const C = ['#BFDBFE', '#DDD6FE', '#BBF7D0', '#FBCFE8', '#FDE68A'];
        const N = Math.round(w * h / 60000) + 6;
        this.ps = Array.from({ length: N }, () => ({
          x: Math.random() * w, y: Math.random() * h, r: 18 + Math.random() * 46,
          v: 10 + Math.random() * 18, ph: Math.random() * 6.28, c: C[(Math.random() * C.length) | 0],
        }));
      },
      step(ctx, w, h, t, dt) {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#F0F7FF'); g.addColorStop(1, '#EDEBFF');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (const p of this.ps) {
          p.y -= p.v * dt;
          if (p.y < -p.r) { p.y = h + p.r; p.x = Math.random() * w; }
          const x = p.x + Math.sin(t * 0.9 + p.ph) * 14;
          ctx.globalAlpha = 0.5; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, 7); ctx.fill();
          ctx.globalAlpha = 0.55; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(x - p.r * 0.32, p.y - p.r * 0.32, p.r * 0.2, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    },
    /* ---- 2차 추가 ---- */
    sakura: {
      n: '벚꽃 흩날림', base: '#FFF5F7',
      thumb: '<rect width="1200" height="800" fill="#FFF5F7"/><ellipse cx="220" cy="160" rx="26" ry="16" fill="#F9A8D4" transform="rotate(22 220 160)"/><ellipse cx="620" cy="300" rx="22" ry="14" fill="#FBCFE8" transform="rotate(-30 620 300)"/><ellipse cx="920" cy="180" rx="20" ry="13" fill="#F9A8D4" transform="rotate(50 920 180)"/><ellipse cx="380" cy="540" rx="24" ry="15" fill="#FDD3E0" transform="rotate(-14 380 540)"/><ellipse cx="1000" cy="580" rx="22" ry="14" fill="#FBCFE8" transform="rotate(34 1000 580)"/><ellipse cx="140" cy="650" rx="18" ry="12" fill="#F9A8D4" transform="rotate(60 140 650)"/>',
      init(w, h) {
        const C = ['#FBCFE8', '#F9A8D4', '#FDD3E0', '#FCE1EB'];
        const N = Math.round(w * h / 30000) + 8;
        this.ps = Array.from({ length: N }, () => ({
          x: Math.random() * w, y: Math.random() * h, s: 6 + Math.random() * 8,
          v: 34 + Math.random() * 40, sway: 34 + Math.random() * 44, ph: Math.random() * 6.28,
          rot: Math.random() * 6.28, rv: (Math.random() - .5) * 2.6, c: C[(Math.random() * C.length) | 0],
        }));
      },
      step(ctx, w, h, t, dt) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#FFF8FA'); g.addColorStop(1, '#FFECF2');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (const p of this.ps) {
          p.y += p.v * dt; p.rot += p.rv * dt;
          if (p.y > h + 16) { p.y = -16; p.x = Math.random() * w; }
          const x = p.x + Math.sin(t * 1.1 + p.ph) * p.sway;
          const tilt = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.8 + p.ph)); // 팔랑팔랑
          ctx.save(); ctx.translate(x, p.y); ctx.rotate(p.rot);
          ctx.globalAlpha = 0.85; ctx.fillStyle = p.c;
          ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.62 * tilt, 0, 0, 7); ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      },
    },
    snow: {
      n: '함박눈 소복소복', base: '#E8F1FB',
      thumb: '<rect width="1200" height="800" fill="#DCE9F8"/><circle cx="200" cy="150" r="12" fill="#fff"/><circle cx="540" cy="260" r="8" fill="#fff" opacity=".85"/><circle cx="860" cy="140" r="10" fill="#fff"/><circle cx="340" cy="470" r="7" fill="#fff" opacity=".7"/><circle cx="1030" cy="420" r="11" fill="#fff"/><circle cx="640" cy="600" r="9" fill="#fff" opacity=".85"/><circle cx="150" cy="640" r="8" fill="#fff" opacity=".75"/>',
      init(w, h) {
        const N = Math.round(w * h / 15000) + 10;
        this.ps = Array.from({ length: N }, () => {
          const depth = 0.35 + Math.random() * 0.65; // 원근
          return {
            x: Math.random() * w, y: Math.random() * h, r: 2 + depth * 5,
            v: 22 + depth * 55, sway: 12 + Math.random() * 22, ph: Math.random() * 6.28, a: 0.45 + depth * 0.5,
          };
        });
      },
      step(ctx, w, h, t, dt) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#EAF2FB'); g.addColorStop(1, '#D7E6F7');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (const p of this.ps) {
          p.y += p.v * dt;
          if (p.y > h + 8) { p.y = -8; p.x = Math.random() * w; }
          const x = p.x + Math.sin(t * 0.8 + p.ph) * p.sway;
          ctx.globalAlpha = p.a; ctx.fillStyle = '#FFFFFF';
          ctx.beginPath(); ctx.arc(x, p.y, p.r, 0, 7); ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    },
    meteor: {
      n: '별똥별 밤하늘', base: '#141B33',
      thumb: '<rect width="1200" height="800" fill="#141B33"/><circle cx="240" cy="200" r="5" fill="#fff"/><circle cx="700" cy="140" r="4" fill="#FDE68A"/><circle cx="980" cy="300" r="5" fill="#fff"/><circle cx="420" cy="480" r="4" fill="#fff" opacity=".7"/><line x1="560" y1="120" x2="760" y2="260" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/><line x1="150" y1="420" x2="290" y2="520" stroke="#FDE68A" stroke-width="3" stroke-linecap="round" opacity=".8"/>',
      init(w, h) {
        const N = Math.round(w * h / 20000);
        this.ps = Array.from({ length: N }, () => ({
          x: Math.random() * w, y: Math.random() * h, r: 0.7 + Math.random() * 2,
          ph: Math.random() * 6.28, sp: 1.2 + Math.random() * 2.6, gold: Math.random() < 0.2,
        }));
        this.ms = []; this.next = 0.6;
      },
      step(ctx, w, h, t, dt) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, '#0F1730'); g.addColorStop(1, '#1E2A4C');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        for (const p of this.ps) {
          const a = 0.2 + 0.7 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
          ctx.globalAlpha = a; ctx.fillStyle = p.gold ? '#FDE68A' : '#FFFFFF';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        }
        // 별똥별 스폰
        this.next -= dt;
        if (this.next <= 0) {
          this.next = 1.2 + Math.random() * 2.2;
          const dir = Math.random() < 0.5 ? 1 : -1;
          this.ms.push({
            x: Math.random() * w, y: Math.random() * h * 0.45,
            vx: dir * (340 + Math.random() * 260), vy: 200 + Math.random() * 160,
            life: 0.7 + Math.random() * 0.4, t: 0, gold: Math.random() < 0.35,
          });
        }
        const alive = [];
        for (const m of this.ms) {
          m.t += dt; if (m.t >= m.life) continue;
          alive.push(m);
          m.x += m.vx * dt; m.y += m.vy * dt;
          const q = m.t / m.life, a = Math.sin(q * Math.PI); // 서서히 밝아졌다 사라짐
          const L = 90 + 60 * a;
          const tx = m.x - m.vx / Math.hypot(m.vx, m.vy) * L;
          const ty = m.y - m.vy / Math.hypot(m.vx, m.vy) * L;
          const lg = ctx.createLinearGradient(m.x, m.y, tx, ty);
          const col = m.gold ? '253,230,138' : '255,255,255';
          lg.addColorStop(0, `rgba(${col},${0.95 * a})`);
          lg.addColorStop(1, `rgba(${col},0)`);
          ctx.strokeStyle = lg; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.fillStyle = `rgba(${col},${a})`;
          ctx.beginPath(); ctx.arc(m.x, m.y, 2.6, 0, 7); ctx.fill();
        }
        this.ms = alive;
        ctx.globalAlpha = 1;
      },
    },
  };

  let mbgKey = null, mbgCanvas = null, mbgRaf = 0, mbgLast = 0, mbgInitKey = null;
  function stage() { return document.querySelector('.canvas-stage'); }

  function mountBg() {
    const st = stage(); if (!st) return;
    st.style.position = 'relative';
    mbgCanvas = document.createElement('canvas');
    mbgCanvas.id = 'kmMbg';
    mbgCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;display:none;border-radius:inherit';
    st.insertBefore(mbgCanvas, st.firstChild);
    const fc = st.querySelector('.canvas-container'); if (fc) fc.style.zIndex = '1';
    FXR.mount(st); // fx 오버레이 (z-index:2)
    if (mbgKey) startBgLoop(); // 재진입 시 유지
  }
  function resizeBg() {
    if (!mbgCanvas || !mbgKey) return;
    const st = stage(); if (!st) return;
    const w = st.clientWidth || 1, h = st.clientHeight || 1;
    if (mbgCanvas.width !== w || mbgCanvas.height !== h || mbgInitKey !== mbgKey) {
      mbgCanvas.width = w; mbgCanvas.height = h;
      MBG[mbgKey].init(w, h);
      mbgInitKey = mbgKey;
    }
  }
  function startBgLoop() {
    cancelAnimationFrame(mbgRaf);
    if (!mbgCanvas || !mbgKey) return;
    mbgCanvas.style.display = 'block';
    resizeBg();
    mbgLast = performance.now();
    const t0 = mbgLast;
    const loop = now => {
      if (!mbgKey || !mbgCanvas) return;
      const dt = Math.min(0.05, (now - mbgLast) / 1000); mbgLast = now;
      resizeBg();
      MBG[mbgKey].step(mbgCanvas.getContext('2d'), mbgCanvas.width, mbgCanvas.height, (now - t0) / 1000, dt);
      mbgRaf = requestAnimationFrame(loop);
    };
    mbgRaf = requestAnimationFrame(loop);
  }
  let mbgSuspend = false;
  function suspendBg(on) { // MP4 내보내기 중 라이브 mbg 루프 정지 (MBG 상태를 오프라인이 독점)
    mbgSuspend = !!on;
    if (on) { cancelAnimationFrame(mbgRaf); if (mbgCanvas) mbgCanvas.style.display = 'none'; }
    else { mbgInitKey = null; if (mbgKey) startBgLoop(); else if (mbgCanvas) mbgCanvas.style.display = 'none'; }
  }
  function setMotionBg(key, opts) {
    mbgKey = (key && MBG[key]) ? key : null;
    if (typeof canvas !== 'undefined' && canvas) {
      if (mbgKey) {
        // SVG 배경 오브젝트와 상호 배타
        canvas.getObjects().filter(o => o.kmType === 'background').forEach(o => canvas.remove(o));
        canvas.backgroundColor = ''; // 투명 → 뒤의 모션 배경이 비침
      } else if (!(opts && opts.keepBgColor)) {
        canvas.backgroundColor = '#fff';
      }
      canvas.requestRenderAll();
    }
    if (mbgKey) { if (!mbgSuspend) startBgLoop(); }
    else { cancelAnimationFrame(mbgRaf); if (mbgCanvas) mbgCanvas.style.display = 'none'; }
  }
  function getBgKey() { return mbgKey; }
  function bgBaseColor() { return mbgKey ? MBG[mbgKey].base : null; }
  function bgItemsHTML() {
    return Object.entries(MBG).map(([k, b]) =>
      `<button class="ip-item mbg-item ${mbgKey === k ? 'sel' : ''}" data-mbg="${k}" title="${b.n} (움직여요!)">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">${b.thumb}</svg>
        <span class="mbg-tag">▶ 움직임</span>
      </button>`).join('');
  }

  /* ============================================================
     재생 모드 (전체화면)
     ============================================================ */
  let playing = false, playRaf = 0, playT0 = 0, bases = null, overlay = null, homeParent = null, homeNext = null, savedZoom = 1;

  function collectBases() {
    bases = new Map();
    canvas.forEachObject(o => bases.set(o, baseOf(o)));
  }
  function restoreAll() {
    if (!bases) return;
    bases.forEach((B, o) => restore(o, B));
    bases = null;
    canvas.requestRenderAll();
  }
  function tick(now) {
    const t = (now - playT0) / 1000;
    FXR.begin();
    bases.forEach((B, o) => animFrame(o, B, getAnim(o), t, true));
    FXR.render(now);
    canvas.requestRenderAll();
    playRaf = requestAnimationFrame(tick);
  }
  function replay() { cancelAnimationFrame(playRaf); restoreAll(); FXR.reset(); collectBases(); playT0 = performance.now(); playRaf = requestAnimationFrame(tick); }

  function enterPlay() {
    if (playing || typeof canvas === 'undefined' || !canvas) return;
    playing = true;
    canvas.discardActiveObject(); if (typeof closePops === 'function') closePops();
    canvas.selection = false; canvas.skipTargetFind = true;
    savedZoom = zoom;
    // 오버레이 생성 + 캔버스 스테이지 이사
    overlay = document.createElement('div');
    overlay.id = 'kmPlay';
    overlay.innerHTML = `<div class="kmp-stagewrap"></div>
      <div class="kmp-ctl">
        <button id="kmpReplay" title="처음부터">↻ 다시</button>
        <button id="kmpExit" title="닫기 (ESC)">✕ 닫기</button>
      </div>`;
    document.body.appendChild(overlay);
    const st = stage();
    homeParent = st.parentNode; homeNext = st.nextSibling;
    overlay.querySelector('.kmp-stagewrap').appendChild(st);
    // 화면 맞춤 줌
    const fit = Math.min((window.innerWidth - 72) / baseW, (window.innerHeight - 96) / baseH);
    applyZoom(Math.max(0.05, fit));
    document.addEventListener('keydown', escHandler, true);
    FXR.reset();
    collectBases();
    playT0 = performance.now();
    playRaf = requestAnimationFrame(tick);
  }
  function exitPlay() {
    if (!playing) return;
    playing = false;
    cancelAnimationFrame(playRaf);
    restoreAll();
    FXR.reset();
    canvas.selection = true; canvas.skipTargetFind = false;
    const st = stage();
    if (homeParent) homeParent.insertBefore(st, homeNext);
    if (overlay) { overlay.remove(); overlay = null; }
    document.removeEventListener('keydown', escHandler, true);
    applyZoom(savedZoom);
    if (typeof zoomFit === 'function') zoomFit();
    canvas.calcOffset(); canvas.requestRenderAll();
  }
  function escHandler(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); exitPlay(); } }
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'kmpExit') exitPlay();
    if (e.target && e.target.id === 'kmpReplay') replay();
  });

  /* ---------- 편집 중 단일 요소 미리보기 (fx 포함) ---------- */
  let prevRaf = 0;
  function previewObj(o) {
    cancelAnimationFrame(prevRaf);
    FXR.reset();
    const B = baseOf(o), A = getAnim(o), f = fxOf(A);
    const entry = hasEntry(o, A), dur = entryDur(o, A);
    const hasLoop = A.loop && A.loop.type !== 'none';
    if (!entry && !hasLoop && f === 'none') return;
    canvas.discardActiveObject(); canvas.requestRenderAll();
    const t0 = performance.now();
    const tail = (hasLoop || f === 'neon') ? 2.2 : (f === 'goldburst' || f === 'stamp' || f === 'spotlight' || f === 'trail') ? 1.6 : 0.2;
    const total = dur + tail;
    const step = now => {
      const t = (now - t0) / 1000;
      if (t >= total && !FXR.active()) {
        restore(o, B); FXR.reset();
        canvas.setActiveObject(o); canvas.requestRenderAll();
        return;
      }
      FXR.begin();
      if (t < total) animFrame(o, B, A, t, false);
      else restore(o, B); // 입자 여운만 마저 재생
      FXR.render(now);
      canvas.requestRenderAll();
      prevRaf = requestAnimationFrame(step);
    };
    prevRaf = requestAnimationFrame(step);
  }

  /* ---------- 우측 패널 UI ---------- */
  function sel(id, obj, cur, skip) {
    return `<select id="${id}">` + Object.entries(obj)
      .filter(([k, v]) => !(skip && skip(k, v)))
      .map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${v.n}</option>`).join('') + `</select>`;
  }
  const FX_HINT = {
    goldburst: '등장이 끝나는 순간 금가루가 팡! 터져요.',
    charpop: '글자가 한 글자씩 팝팝팝 조립돼요. (등장 효과를 대신해요)',
    stamp: '위에서 쾅 찍히며 충격파가 퍼져요. (등장 효과를 대신해요 — 상장 직인에 딱!)',
    spotlight: '주변이 어두워졌다가 조명이 켜지듯 등장해요.',
    trail: '날아오는 등장 효과와 함께 쓰면 별가루 꼬리가 남아요.',
    neon: '테두리가 네온사인처럼 계속 숨쉬며 빛나요.',
  };
  function panelHTML(o) {
    const A = getAnim(o);
    const inType = (A.in && A.in.type) || 'none';
    const delay = (A.in && A.in.delay) || 0;
    const loopType = (A.loop && A.loop.type) || 'none';
    const f = fxOf(A);
    const showDelay = inType !== 'none' || f === 'stamp' || (f === 'charpop' && isTextObj(o));
    return `<div class="panel-sec anim-sec"><h3>✨ 움직임</h3>
      <div class="field"><label>등장 효과</label>${sel('pAnimIn', IN_FX, inType)}</div>
      ${showDelay ? `<div class="field"><label>등장 시점 (초 뒤에)</label><div class="range-row"><input type="range" id="pAnimDelay" min="0" max="8" step="0.5" value="${delay}"><span class="val" id="pAnimDelayV">${delay}초</span></div></div>` : ''}
      <div class="field"><label>계속 움직이기</label>${sel('pAnimLoop', LOOP_FX, loopType)}</div>
      <div class="field"><label>특수 효과 🪄</label>${sel('pAnimFx', FX, f, (k, v) => v.textOnly && !isTextObj(o))}</div>
      ${f !== 'none' && FX_HINT[f] ? `<div class="slot-hint fx-hint">${FX_HINT[f]}</div>` : ''}
      <button class="tb-btn anim-prev" id="pAnimPrev">▶ 미리보기</button>
      <div class="slot-hint" style="margin-top:8px">[▶ 재생] 버튼을 누르면 전체 화면에서 순서대로 등장해요 — TV에 띄우기 딱!</div>
    </div>`;
  }
  function setAnim(o, patch) {
    const A = getAnim(o);
    o.anim = {
      in: Object.assign({ type: 'none', delay: 0 }, A.in, patch.in || {}),
      loop: Object.assign({ type: 'none' }, A.loop, patch.loop || {}),
      fx: Object.assign({ type: 'none' }, A.fx, patch.fx || {}),
    };
    if (typeof pushHistory === 'function') pushHistory();
  }
  function bindPanel(o) {
    const $ = id => document.getElementById(id);
    if ($('pAnimIn')) $('pAnimIn').onchange = e => { setAnim(o, { in: { type: e.target.value } }); buildPanel(o); if (e.target.value !== 'none') previewObj(o); };
    if ($('pAnimDelay')) $('pAnimDelay').oninput = e => { $('pAnimDelayV').textContent = e.target.value + '초'; };
    if ($('pAnimDelay')) $('pAnimDelay').onchange = e => setAnim(o, { in: { delay: +e.target.value } });
    if ($('pAnimLoop')) $('pAnimLoop').onchange = e => { setAnim(o, { loop: { type: e.target.value } }); if (e.target.value !== 'none') previewObj(o); };
    if ($('pAnimFx')) $('pAnimFx').onchange = e => { setAnim(o, { fx: { type: e.target.value } }); buildPanel(o); if (e.target.value !== 'none') previewObj(o); };
    if ($('pAnimPrev')) $('pAnimPrev').onclick = () => previewObj(o);
  }

  /* ---------- 공개 API ---------- */
  /* ============================================================
     오프라인 렌더 API (video.js 전용) — 결정적 시간 t 주입
     라이브 경로(tick·startBgLoop)와 완전 분리. 사용 규약:
     suspendBg(true) → [씬마다: offlineBegin → offlineFrame(t)* → offlineEnd]
     → suspendBg(false). FX 캔버스는 fxOverride로 리다이렉트.
     ============================================================ */
  let offBases = null;
  function offlineBegin() {
    offBases = new Map();
    canvas.forEachObject(o => offBases.set(o, baseOf(o)));
    FXR.reset();
  }
  function offlineFrame(t) { // t: 초 (씬 로컬). FXR엔 ms 합성 시계 주입
    if (!offBases) return;
    FXR.begin();
    offBases.forEach((B, o) => animFrame(o, B, getAnim(o), t, true));
    FXR.render(t * 1000);
    canvas.renderAll();
  }
  function offlineEnd() {
    if (offBases) { offBases.forEach((B, o) => restore(o, B)); offBases = null; }
    FXR.reset();
    canvas.renderAll();
  }
  function offlineMbg(key, w, h) { // 오프라인 모션 배경 드라이버 (suspendBg(true) 상태에서만)
    if (!key || !MBG[key]) return null;
    MBG[key].init(w, h);
    return { base: MBG[key].base, frame: (ctx, t, dt) => MBG[key].step(ctx, w, h, t, dt) };
  }
  function fxOverride(c) { FXR.setOverride(c); }

  window.KM_MOTION = {
    suspendBg, offlineBegin, offlineFrame, offlineEnd, offlineMbg, fxOverride,
    panelHTML, bindPanel, previewObj,
    enterPlay, exitPlay, isPlaying: () => playing,
    mountBg, resizeBg, setMotionBg, getBgKey, bgBaseColor, bgItemsHTML,
    hasMotion,
  };
})();
