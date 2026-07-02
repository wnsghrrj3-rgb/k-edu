/* ============================================================
   케이메이커 2.0 — 모션 엔진 (motion.js)
   요소 애니메이션(등장/상시) · [▶ 재생] 전체화면 모드 · 움직이는 배경
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
  const IN_DUR = 0.65; // 등장 소요시간(고정 — 단순하게)

  function baseOf(o) {
    return { left: o.left, top: o.top, scaleX: o.scaleX, scaleY: o.scaleY, angle: o.angle, opacity: (o.opacity == null ? 1 : o.opacity) };
  }
  function restore(o, B) { o.set(B); o.setCoords(); }
  function getAnim(o) { return o.anim || { in: { type: 'none', delay: 0 }, loop: { type: 'none' } }; }
  function hasMotion(o) { const a = getAnim(o); return (a.in && a.in.type !== 'none') || (a.loop && a.loop.type !== 'none'); }

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
          if (p.r > 2.4) { // 큰 별은 십자 광채
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
  };

  let mbgKey = null, mbgCanvas = null, mbgRaf = 0, mbgLast = 0;
  function stage() { return document.querySelector('.canvas-stage'); }

  function mountBg() {
    const st = stage(); if (!st) return;
    st.style.position = 'relative';
    mbgCanvas = document.createElement('canvas');
    mbgCanvas.id = 'kmMbg';
    mbgCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;display:none;border-radius:inherit';
    st.insertBefore(mbgCanvas, st.firstChild);
    const fc = st.querySelector('.canvas-container'); if (fc) fc.style.zIndex = '1';
    if (mbgKey) startBgLoop(); // 재진입 시 유지
  }
  function resizeBg() {
    if (!mbgCanvas || !mbgKey) return;
    const st = stage(); if (!st) return;
    const w = st.clientWidth || 1, h = st.clientHeight || 1;
    if (mbgCanvas.width !== w || mbgCanvas.height !== h) {
      mbgCanvas.width = w; mbgCanvas.height = h;
      MBG[mbgKey].init(w, h);
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
    if (mbgKey) startBgLoop();
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
    bases.forEach((B, o) => {
      const A = getAnim(o);
      const hasIn = A.in && A.in.type !== 'none';
      const start = hasIn ? (+A.in.delay || 0) : 0;
      if (hasIn) {
        if (t < start) { o.set({ opacity: 0 }); return; }
        if (t < start + IN_DUR) { restore(o, B); applyIn(o, A.in.type, (t - start) / IN_DUR, B, baseW, baseH); return; }
      }
      restore(o, B);
      if (A.loop && A.loop.type !== 'none') applyLoop(o, A.loop.type, t - (hasIn ? start + IN_DUR : 0), B);
    });
    canvas.requestRenderAll();
    playRaf = requestAnimationFrame(tick);
  }
  function replay() { cancelAnimationFrame(playRaf); restoreAll(); collectBases(); playT0 = performance.now(); playRaf = requestAnimationFrame(tick); }

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
    collectBases();
    playT0 = performance.now();
    playRaf = requestAnimationFrame(tick);
  }
  function exitPlay() {
    if (!playing) return;
    playing = false;
    cancelAnimationFrame(playRaf);
    restoreAll();
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

  /* ---------- 편집 중 단일 요소 미리보기 ---------- */
  let prevRaf = 0;
  function previewObj(o) {
    cancelAnimationFrame(prevRaf);
    const B = baseOf(o), A = getAnim(o);
    const hasIn = A.in && A.in.type !== 'none';
    const hasLoop = A.loop && A.loop.type !== 'none';
    if (!hasIn && !hasLoop) return;
    canvas.discardActiveObject(); canvas.requestRenderAll();
    const t0 = performance.now();
    const total = (hasIn ? IN_DUR : 0) + (hasLoop ? 2.2 : 0.15);
    const step = now => {
      const t = (now - t0) / 1000;
      if (t >= total) { restore(o, B); canvas.setActiveObject(o); canvas.requestRenderAll(); return; }
      if (hasIn && t < IN_DUR) { restore(o, B); applyIn(o, A.in.type, t / IN_DUR, B, baseW, baseH); }
      else { restore(o, B); if (hasLoop) applyLoop(o, A.loop.type, t - (hasIn ? IN_DUR : 0), B); }
      canvas.requestRenderAll();
      prevRaf = requestAnimationFrame(step);
    };
    prevRaf = requestAnimationFrame(step);
  }

  /* ---------- 우측 패널 UI ---------- */
  function sel(id, obj, cur) {
    return `<select id="${id}">` + Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === cur ? 'selected' : ''}>${v.n}</option>`).join('') + `</select>`;
  }
  function panelHTML(o) {
    const A = getAnim(o);
    const inType = (A.in && A.in.type) || 'none';
    const delay = (A.in && A.in.delay) || 0;
    const loopType = (A.loop && A.loop.type) || 'none';
    return `<div class="panel-sec anim-sec"><h3>✨ 움직임</h3>
      <div class="field"><label>등장 효과</label>${sel('pAnimIn', IN_FX, inType)}</div>
      ${inType !== 'none' ? `<div class="field"><label>등장 시점 (초 뒤에)</label><div class="range-row"><input type="range" id="pAnimDelay" min="0" max="8" step="0.5" value="${delay}"><span class="val" id="pAnimDelayV">${delay}초</span></div></div>` : ''}
      <div class="field"><label>계속 움직이기</label>${sel('pAnimLoop', LOOP_FX, loopType)}</div>
      <button class="tb-btn anim-prev" id="pAnimPrev">▶ 미리보기</button>
      <div class="slot-hint" style="margin-top:8px">[▶ 재생] 버튼을 누르면 전체 화면에서 순서대로 등장해요 — TV에 띄우기 딱!</div>
    </div>`;
  }
  function setAnim(o, patch) {
    const A = getAnim(o);
    o.anim = {
      in: Object.assign({ type: 'none', delay: 0 }, A.in, patch.in || {}),
      loop: Object.assign({ type: 'none' }, A.loop, patch.loop || {}),
    };
    if (typeof pushHistory === 'function') pushHistory();
  }
  function bindPanel(o) {
    const $ = id => document.getElementById(id);
    if ($('pAnimIn')) $('pAnimIn').onchange = e => { setAnim(o, { in: { type: e.target.value } }); buildPanel(o); if (e.target.value !== 'none') previewObj(o); };
    if ($('pAnimDelay')) $('pAnimDelay').oninput = e => { $('pAnimDelayV').textContent = e.target.value + '초'; };
    if ($('pAnimDelay')) $('pAnimDelay').onchange = e => setAnim(o, { in: { delay: +e.target.value } });
    if ($('pAnimLoop')) $('pAnimLoop').onchange = e => { setAnim(o, { loop: { type: e.target.value } }); if (e.target.value !== 'none') previewObj(o); };
    if ($('pAnimPrev')) $('pAnimPrev').onclick = () => previewObj(o);
  }

  /* ---------- 공개 API ---------- */
  window.KM_MOTION = {
    panelHTML, bindPanel, previewObj,
    enterPlay, exitPlay, isPlaying: () => playing,
    mountBg, resizeBg, setMotionBg, getBgKey, bgBaseColor, bgItemsHTML,
    hasMotion,
  };
})();
