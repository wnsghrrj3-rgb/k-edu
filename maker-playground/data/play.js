/* ============================================================
   MK_PLAY — R37 폐(허파): 재생·미리보기 실동작
   미리보기 모달 = 진짜 슬라이드쇼 — 장면 순차 재생·요소 등장 애니 실재생·
   진행바 실움직임·자동/수동 넘김. 하단 재생 버튼·미리보기 버튼 공용.
   순수 로직(sequence·animCss·sceneHTML)은 전부 jsdom 검증 가능,
   타이머는 주입식. R38: 장면 music 은 MK_AUDIO 로 실재생(파일·합성).
   R39: 삽입 영상은 <video> 무음 루프로 프레임 실재생.
   ============================================================ */
window.MK_PLAY = (() => {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 등장 프리셋 → CSS 키프레임 (MK_ANIM 9종 + idle 2종) ---------- */
  const KEYFRAMES = `
@keyframes mkp-fade   { from { opacity:0 } to { opacity:1 } }
@keyframes mkp-slide-up    { from { opacity:0; transform:translateY(26px) } to { opacity:1; transform:none } }
@keyframes mkp-slide-down  { from { opacity:0; transform:translateY(-26px) } to { opacity:1; transform:none } }
@keyframes mkp-slide-left  { from { opacity:0; transform:translateX(26px) } to { opacity:1; transform:none } }
@keyframes mkp-slide-right { from { opacity:0; transform:translateX(-26px) } to { opacity:1; transform:none } }
@keyframes mkp-scale  { from { opacity:0; transform:scale(.82) } to { opacity:1; transform:scale(1) } }
@keyframes mkp-zoom   { from { opacity:0; transform:scale(1.14) } to { opacity:1; transform:scale(1) } }
@keyframes mkp-pop    { 0% { opacity:0; transform:scale(.6) } 70% { opacity:1; transform:scale(1.06) } 100% { opacity:1; transform:scale(1) } }
@keyframes mkp-bounce { 0% { opacity:0; transform:translateY(-34px) } 55% { opacity:1; transform:translateY(6px) } 78% { transform:translateY(-3px) } 100% { opacity:1; transform:none } }
@keyframes mkp-wipe   { from { clip-path:inset(0 100% 0 0); opacity:1 } to { clip-path:inset(0 0 0 0); opacity:1 } }
@keyframes mkp-wipe-v { from { clip-path:inset(0 0 100% 0); opacity:1 } to { clip-path:inset(0 0 0 0); opacity:1 } }
@keyframes mkp-blur   { from { opacity:0; filter:blur(9px) } to { opacity:1; filter:blur(0) } }
@keyframes mkp-rotate { from { opacity:0; transform:rotate(-7deg) scale(.94) } to { opacity:1; transform:none } }
@keyframes mkp-idle-float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-5px) } }
@keyframes mkp-idle-pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.02) } }
@keyframes mkp-kb-zoom-in { from { transform:scale(1) } to { transform:scale(1.08) } }
@keyframes mkp-kb-zoom-out { from { transform:scale(1.08) } to { transform:scale(1) } }
@keyframes mkp-kb-pan-left { from { transform:scale(1.06) translateX(12px) } to { transform:scale(1.06) translateX(-12px) } }
@keyframes mkp-kb-pan-right { from { transform:scale(1.06) translateX(-12px) } to { transform:scale(1.06) translateX(12px) } }
@keyframes mkp-kb-pan-up { from { transform:scale(1.06) translateY(12px) } to { transform:scale(1.06) translateY(-12px) } }
@keyframes mkp-kb-pan-down { from { transform:scale(1.06) translateY(-12px) } to { transform:scale(1.06) translateY(12px) } }
@keyframes mkp-kb-diagonal { from { transform:scale(1.04) translate(-8px,-8px) } to { transform:scale(1.1) translate(8px,8px) } }
@keyframes mkp-bar { from { width:0 } to { width:100% } }`;

  const PRESET_KEYS = ['fade', 'slide', 'scale', 'zoom', 'pop', 'bounce', 'wipe', 'blur', 'rotate'];

  /* 요소 1개의 등장 계획 — {name, delay(s), dur(s), ease} */
  function enterPlan(el, i, sceneAnim) {
    const a = el.anim || {};
    let preset = a.preset || 'inherit';
    if (preset === 'inherit') preset = (sceneAnim && sceneAnim.enter && sceneAnim.enter.preset) || 'fade';
    if (preset === 'none') return null;
    if (!PRESET_KEYS.includes(preset)) preset = 'fade';
    const dir = a.direction || 'up';
    const name = preset === 'slide' ? `mkp-slide-${['up', 'down', 'left', 'right'].includes(dir) ? dir : 'up'}`
      : preset === 'wipe' && (dir === 'up' || dir === 'down') ? 'mkp-wipe-v' /* R60 — 세로 리빌(전후 비교) */
      : `mkp-${preset}`;
    return {
      name,
      delay: clamp(a.delay != null ? +a.delay : i * 0.15, 0, 8),
      dur: clamp(a.duration != null ? +a.duration : 0.6, 0.15, 3),
      ease: a.ease || 'ease-out',
    };
  }
  const animCss = (el, i, sceneAnim) => {
    const p = enterPlan(el, i, sceneAnim);
    if (!p) return '';
    const kb = el.anim && /^kb-/.test(el.anim.idle || '') && el.anim.idle !== 'kb-static'
      ? `,mkp-${el.anim.idle} ${Math.max(0.8, (el.anim.idleDur || 4) - p.delay - p.dur).toFixed(1)}s linear forwards` : '';
    const idle = kb || (el.anim && el.anim.idle === 'float' ? ',mkp-idle-float 3.2s ease-in-out infinite'
      : el.anim && el.anim.idle === 'pulse' ? ',mkp-idle-pulse 2.6s ease-in-out infinite' : '');
    return `;opacity:0;animation:${p.name} ${p.dur}s ${p.ease} ${p.delay}s both${idle ? idle.replace(',', ` ${p.delay + p.dur}s,`) : ''}`;
  };

  /* ---------- 재생 순서 — 순수 데이터 ---------- */
  function sequence(doc) {
    return (doc.scenes || []).map((s, si) => {
      const enters = s.elements.map((el, i) => enterPlan(el, i, s.anim)).filter(Boolean);
      const lastIn = enters.reduce((m, p) => Math.max(m, p.delay + p.dur), 0);
      return {
        sceneIdx: si,
        durMs: Math.max(1600, Math.round((s.duration || 4) * 1000), Math.round((lastIn + 0.6) * 1000)),
        enterCount: enters.length,
      };
    });
  }

  /* ---------- 장면 → 재생용 HTML (요소별 등장 애니 인라인) ---------- */
  function sceneHTML(scene, opts = {}) {
    const dark = scene.background === '#1F2733' || (window.MK_SEC && window.MK_SEC.isDark(scene.background));
    const parts = (window.MK_EDPARTS || {});
    const els = scene.elements.map((el, i) => {
      const an = opts.still ? '' : animCss(el, i, scene.anim);
      const rot = el.rot ? `;transform:rotate(${el.rot}deg)` : '';
      const pos = `left:${el.x}%;top:${el.y}%;width:${el.w}%;`;
      if (el.kind === 'chart' || el.kind === 'table') {
        const inner = el.kind === 'chart'
          ? (parts.ChartSVG ? parts.ChartSVG(el, dark, false) : '')
          : (parts.TableHTML ? parts.TableHTML(el, dark, false) : '');
        return `<div class="mkp-el mkp-data" style="${pos}height:${el.h}%;font-size:2.4cqh${rot}${an}">${inner}</div>`;
      }
      if (el.kind === 'text') {
        const col = el.color || (dark ? ((el.weight || 400) >= 600 ? '#F2F5F9' : '#B7C0CD') : ((el.weight || 400) >= 600 ? '#1F2733' : '#525C6A'));
        const ts = window.MK_TEXTSTYLE ? window.MK_TEXTSTYLE.css(el) : ''; /* R56 — 글꼴·배경·외곽선·그림자 (lineHeight는 css가 뒤에서 override) */
        return `<div class="mkp-el" style="${pos}font-size:${el.size}cqh;font-weight:${el.weight || 400};line-height:1.3;color:${col}${el.align ? ';text-align:' + el.align : ''}${el.tracking ? ';letter-spacing:' + el.tracking + 'em' : ''};white-space:pre-wrap${rot}${an}${ts}">${esc(el.text)}</div>`;
      }
      const rad = el.radius ? `;border-radius:${el.radius > 100 ? '50%' : el.radius + 'px'}` : '';
      if (el.src) {
        const fit = el.fit === 'contain' ? 'contain' : 'cover';
        const media = (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))
          ? `<video src="${el.src}" muted autoplay loop playsinline style="width:100%;height:100%;object-fit:${fit};display:block;pointer-events:none"></video>`   /* R39 — 영상 프레임 실재생 */
          : `<img src="${el.src}" alt="" style="width:100%;height:100%;object-fit:${fit};display:block">`;
        return `<div class="mkp-el mkp-img" style="${pos}height:${el.h}%${rad};overflow:hidden${rot}${an}">${media}</div>`;
      }
      if (el.fill && el.fill !== 'none') return `<div class="mkp-el" style="${pos}height:${el.h}%;background:${el.fill}${rad}${rot}${an}"></div>`;
      return `<div class="mkp-el mkp-ph" style="${pos}height:${el.h}%${rad}${rot}${an}">${esc(el.label || '')}</div>`;
    }).join('');
    return `<div class="mkp-scene" style="background:${scene.background || '#fff'}">${els}</div>`;
  }

  /* ---------- 플레이어 ---------- */
  const P = { on: false, doc: null, idx: 0, seq: [], timer: null, paused: false, setT: null, clearT: null };

  function stageHTML(doc, idx) {
    const seq = P.seq;
    const segs = seq.map((s, i) =>
      `<span class="mkp-seg ${i < idx ? 'done' : ''}">${i === idx && !P.paused ? `<i style="animation:mkp-bar ${s.durMs / 1000}s linear both"></i>` : i < idx ? '<i style="width:100%"></i>' : ''}</span>`).join('');
    const sc = doc.scenes[idx];
    return `
      <div class="mkp-top"><div class="mkp-segs">${segs}</div>
        <span class="mkp-cap">${idx + 1} / ${doc.scenes.length} · ${esc(sc.name || '')}${sc.music ? ' · 🎵 ' + esc(sc.music.name || '배경음') : ''}</span>
        <button class="mkp-x" data-mkp="close" aria-label="닫기">✕</button></div>
      <div class="mkp-stagewrap" data-mkp="next">${sceneHTML(sc)}</div>
      <div class="mkp-ctl">
        <button data-mkp="prev">‹ 이전</button>
        <button data-mkp="pause">${P.paused ? '▶ 재생' : '⏸ 일시정지'}</button>
        <button data-mkp="next2">다음 ›</button>
      </div>`;
  }

  function paintStage() {
    const host = document.getElementById('mkPlayer');
    if (!host) return;
    host.innerHTML = stageHTML(P.doc, P.idx);
    host.querySelectorAll('[data-mkp]').forEach((b) => b.onclick = (ev) => {
      ev.stopPropagation();
      const k = b.dataset.mkp;
      if (k === 'close') close();
      else if (k === 'prev') go(P.idx - 1);
      else if (k === 'next' || k === 'next2') go(P.idx + 1);
      else if (k === 'pause') { P.paused = !P.paused; const A = window.MK_AUDIO; if (P.paused) { stopTimer(); if (A) A.pause(); } else { arm(); if (A) A.resume(); } paintStage(); }
    });
  }
  const stopTimer = () => { if (P.timer != null) { (P.clearT || clearTimeout)(P.timer); P.timer = null; } };
  function arm() {
    stopTimer();
    if (P.paused) return;
    P.timer = (P.setT || ((f, t) => setTimeout(f, t)))(() => { P.timer = null; go(P.idx + 1); }, P.seq[P.idx].durMs);
  }
  /* R38 — 장면 배경음 실재생 (같은 음악이면 끊김 없이 이어감) */
  function syncAudio() {
    const A = window.MK_AUDIO; if (!A) return;
    const sc = P.doc && P.doc.scenes[P.idx];
    if (sc && sc.music) A.play(sc.music); else A.stop();
  }
  function go(idx) {
    if (!P.on) return;
    if (idx >= P.seq.length) return close();
    P.idx = Math.max(0, idx);
    paintStage();
    syncAudio();
    arm();
  }
  function onKey(ev) {
    if (!P.on) return;
    if (ev.key === 'Escape') { ev.preventDefault(); close(); }
    if (ev.key === 'ArrowRight' || ev.key === ' ') { ev.preventDefault(); go(P.idx + 1); }
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); go(P.idx - 1); }
  }
  function open(doc, opts = {}) {
    if (!doc || !doc.scenes || !doc.scenes.length) return { ok: false, msg: '재생할 장면이 없어요' };
    close();
    P.on = true; P.doc = doc; P.paused = false;
    P.setT = opts.setTimeout || null; P.clearT = opts.clearTimeout || null;
    P.seq = sequence(doc);
    P.idx = clamp(opts.startIdx || 0, 0, doc.scenes.length - 1);
    if (!document.getElementById('mkpStyle')) {
      const st = document.createElement('style'); st.id = 'mkpStyle'; st.textContent = KEYFRAMES; document.head.appendChild(st);
    }
    const back = document.createElement('div');
    back.className = 'mkp-back'; back.id = 'mkPlayer';
    document.body.appendChild(back);
    document.addEventListener('keydown', onKey, true);
    paintStage();
    syncAudio();
    arm();
    return { ok: true, scenes: P.seq.length };
  }
  function close() {
    stopTimer();
    if (window.MK_AUDIO) window.MK_AUDIO.stop();
    P.on = false;
    document.removeEventListener('keydown', onKey, true);
    const n = document.getElementById('mkPlayer'); if (n) n.remove();
  }

  /* ---------- 판정 ---------- */
  function playAudit() {
    const v = [];
    const doc = { scenes: [
      { name: 'a', duration: 2, background: '#fff', elements: [{ kind: 'text', x: 5, y: 5, w: 60, size: 6, text: '가', anim: { preset: 'pop', delay: 0.2, duration: 0.5 } }] },
      { name: 'b', duration: 5, background: '#fff', elements: [{ kind: 'image', x: 5, y: 5, w: 40, h: 40, src: 'data:image/png;base64,A', anim: { preset: 'slide', direction: 'left', delay: 0, duration: 0.6 } }] },
    ] };
    const sq = sequence(doc);
    if (sq.length !== 2 || sq[0].durMs !== 2000 || sq[1].durMs !== 5000) v.push('sequence 시간 계산 오류');
    const h0 = sceneHTML(doc.scenes[0]);
    if (!/mkp-pop 0.5s ease-out 0.2s both/.test(h0)) v.push('pop 애니 인라인 미방출');
    const h1 = sceneHTML(doc.scenes[1]);
    if (!/mkp-slide-left/.test(h1) || !/<img src="data:image\/png;base64,A"/.test(h1)) v.push('slide 방향·실이미지 재생 미방출');
    if (sceneHTML(doc.scenes[0], { still: true }).includes('animation:')) v.push('정지 렌더에 애니 섞임');
    if (!/mkp-idle-float/.test(KEYFRAMES) || PRESET_KEYS.length !== 9) v.push('프리셋 9종 미충족');
    if (['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'pan-up', 'pan-down', 'diagonal'].some((k) => !KEYFRAMES.includes('mkp-kb-' + k))) v.push('R52 켄번즈 키프레임 미충족');
    const hk = sceneHTML({ duration: 4, elements: [{ kind: 'image', src: 'data:image/png;base64,K', x: 0, y: 0, w: 100, h: 100, anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } }] });
    if (!/mkp-kb-zoom-in [\d.]+s linear forwards/.test(hk)) v.push('켄번즈 재생 미방출');
    return { ok: v.length === 0, violations: v };
  }

  return { KEYFRAMES, PRESET_KEYS, enterPlan, animCss, sequence, sceneHTML, open, close, go, playAudit,
    state: () => ({ on: P.on, idx: P.idx, paused: P.paused, scenes: P.seq.length }) };
})();
