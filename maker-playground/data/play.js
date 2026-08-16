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
body.mkp-on #kedu-back { display:none !important }
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
    /* R90 — idle(켄번즈·float·pulse)의 「등장 후 시작」 지연은 두 번째 선언의
       제자리(시간값 자리)에 넣는다. 종전엔 콤마 앞을 치환해 첫 선언 꼬리에
       시간값이 하나 더 붙었고(`both 0.6s,`), 시간 3개 = CSS 문법 위반 →
       animation 선언 전체 무효 → 인라인 opacity:0에 영원히 갇힘 = 재생에서
       idle 딸린 요소가 전부 투명(준호 실기기: 소개 스토리 4/4 빈 장면). */
    const after = (p.delay + p.dur).toFixed(2) + 's';
    const kb = el.anim && /^kb-/.test(el.anim.idle || '') && el.anim.idle !== 'kb-static'
      ? `,mkp-${el.anim.idle} ${Math.max(0.8, (el.anim.idleDur || 4) - p.delay - p.dur).toFixed(1)}s linear ${after} forwards` : '';
    const idle = kb || (el.anim && el.anim.idle === 'float' ? `,mkp-idle-float 3.2s ease-in-out ${after} infinite`
      : el.anim && el.anim.idle === 'pulse' ? `,mkp-idle-pulse 2.6s ease-in-out ${after} infinite` : '');
    return `;opacity:0;animation:${p.name} ${p.dur}s ${p.ease} ${p.delay}s both${idle}`;
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
        /* R114 — 재생 화면도 export 창구로. R113 이 workspace·editor·미니를 옮길 때
           여기는 범위 밖이었는데, 재생은 교사가 「내보내기 전 마지막으로 보는 화면」이다.
           여기가 통짜 경로면 미리보기와 MP4 가 다르게 나온다 — 화면과 파일을 맞추려던
           일이 정작 확인하는 자리에서 새는 셈이다.
           cqh 는 컨테이너 높이 백분율이니 씬 px 을 씬 높이로 나누면 그대로 옮겨진다. */
        const R = window.MK_RENDER, SH = scene.height || 720;
        let T = null;
        try { T = R && R.layoutOf ? R.layoutOf(el, scene.width, scene.height) : null; } catch (e) { T = null; }
        if (T) {
          const fs = (T.size / SH * 100).toFixed(3);
          const ls = T.letterSpacingEm ? `;letter-spacing:${T.letterSpacingEm}em` : '';
          const body = T.lines.map((l) => esc(l)).join('<br>');
          /* white-space:pre — 줄은 이미 export 가 나눴다. 브라우저가 다시 나누면 갈린다 */
          return `<div class="mkp-el" style="${pos}font-size:${fs}cqh;font-weight:${el.weight || 400};line-height:${T.lineHeight};color:${col}${el.align ? ';text-align:' + el.align : ''}${ls};white-space:pre${rot}${an}${ts}">${body}</div>`;
        }
        const lsF = R && R.lsOf ? R.lsOf(el) : (el.letterSpacing != null ? el.letterSpacing : (el.tracking || 0));
        return `<div class="mkp-el" style="${pos}font-size:${el.size}cqh;font-weight:${el.weight || 400};line-height:1.3;color:${col}${el.align ? ';text-align:' + el.align : ''}${lsF ? ';letter-spacing:' + lsF + 'em' : ''};white-space:pre-wrap${rot}${an}${ts}">${esc(el.text)}</div>`;
      }
      const rad = el.radius ? `;border-radius:${el.radius > 100 ? '50%' : el.radius + 'px'}` : '';
      if (el.src) {
        /* R117 — 초점이 있으면 변형(켄번즈·등장 scale)의 축도 초점이다. 정본은
           MK_FOCAL.originOf 하나 — MP4(video.js animPivot)가 같은 수를 읽어 패리티.
           null(무초점·가운데·회전 요소) = 종전 바이트 동일. */
        const og = window.MK_FOCAL && window.MK_FOCAL.originOf ? window.MK_FOCAL.originOf(el) : null;
        const to = og ? `;transform-origin:${+(og.x * 100).toFixed(1)}% ${+(og.y * 100).toFixed(1)}%` : '';
        /* R119 — 회전 요소 초점: pan 계열이 아닌 애니면 축 분리 대상(회전은 중앙, 줌은 초점) */
        const isPan = /^kb-(pan|diagonal)/.test((el.anim && el.anim.idle) || '');
        const rf = (!isPan && window.MK_FOCAL && window.MK_FOCAL.focalRot) ? window.MK_FOCAL.focalRot(el) : null;
        const fit = el.fit === 'contain' ? 'contain' : 'cover';
        const crop = window.MK_PHOTO ? window.MK_PHOTO.cropCss(el) : '';
        const media = (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))
          ? `<video src="${el.src}" ${el.mute ? 'muted ' : ''}${el.trimStart || el.trimEnd ? `data-mkpt0="${+el.trimStart || 0}" ${el.trimEnd ? `data-mkpt1="${+el.trimEnd}" ` : ''}` : ''}autoplay loop playsinline style="width:100%;height:100%;object-fit:${fit}${window.MK_FOCAL ? window.MK_FOCAL.pos(el) : ''}${window.MK_PHOTO ? window.MK_PHOTO.mediaStyle(el) : ''};display:block;pointer-events:none"></video>`   /* R39 — 영상 프레임 실재생 · R94 초점 */
          : `<img src="${el.src}" alt="" style="width:100%;height:100%;object-fit:${fit}${window.MK_FOCAL ? window.MK_FOCAL.pos(el) : ''}${window.MK_PHOTO ? window.MK_PHOTO.mediaStyle(el) : ''};display:block">`;
        if (rf) {
          /* R119 — 축 분리: 바깥 rotate(중앙축)·안쪽 scale(초점축)을 별 transform 으로 나눠 얹어
             정적 회전과 애니 변형이 서로 덮지 않는다. MP4(video.js rotPivot)와 net 동치. */
          const toF = `transform-origin:${+(rf.x * 100).toFixed(1)}% ${+(rf.y * 100).toFixed(1)}%`;
          const inner = `<div class="mkp-inner" style="width:100%;height:100%${rad};overflow:hidden${crop};${toF}${an}">${media}</div>`;
          /* 바깥은 rotate 만 — transform-origin 기본값이 중앙(50% 50%)이라 정적 회전은 중앙축(R107).
             초점 축은 안쪽 origin 이 전담(축 분리). R117 originOf/animPivot 계약은 손대지 않는다. */
          return `<div class="mkp-el mkp-img" style="${pos}height:${el.h}%${rot}">${inner}</div>`;
        }
        return `<div class="mkp-el mkp-img" style="${pos}height:${el.h}%${rad};overflow:hidden${crop}${to}${rot}${an}">${media}</div>`; /* R105 — 자르기 · R117 — 초점 축 */
      }
      if (el.fill && el.fill !== 'none') return `<div class="mkp-el" style="${pos}height:${el.h}%;background:${el.fill}${rad}${rot}${an}"></div>`;
      return `<div class="mkp-el mkp-ph" style="${pos}height:${el.h}%${rad}${rot}${an}">${esc(el.label || '')}</div>`;
    }).join('');
    /* R127 — 나레이션: 씬에 녹음이 있으면 재생에 실재생으로 싣는다.
       정지 렌더(still — 썸네일·스프라이트 세계)엔 안 싣는다. MP4 쪽은
       sceneSprites 가 sceneHTML 을 안 거치므로 이 태그가 새지 않는다. */
    const narr = !opts.still && scene.narration && scene.narration.src
      ? `<audio class="mkp-narr" src="${scene.narration.src}" autoplay></audio>` : '';
    return `<div class="mkp-scene" style="background:${scene.background || '#fff'}">${els}${narr}</div>`;
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
    /* R127 — 소리 자동재생 구조대. 클립이 소리를 얻으면서 자동재생이 정책에
       걸릴 수 있다(미리보기는 클릭 뒤라 대개 허용되지만, 거부되면 영상이
       **멈춘 채**가 된다 — 그게 최악이다). 거부 시 무음으로 내려서라도 돈다. */
    host.querySelectorAll('video,audio').forEach((mEl) => {
      try {
        /* R128 — 트림 창 재생: 창 시작에서 출발, 창 끝을 지나면 창 시작으로
           (loop 속성은 원본 전체를 돌므로 창이 있으면 JS 가 창 루프를 진다) */
        const t0 = parseFloat(mEl.dataset && mEl.dataset.mkpt0);
        const t1 = parseFloat(mEl.dataset && mEl.dataset.mkpt1);
        if (isFinite(t0) && t0 > 0) { try { mEl.currentTime = t0; } catch (_) {} }
        if (isFinite(t0) || isFinite(t1)) {
          mEl.ontimeupdate = () => {
            try {
              const a2 = isFinite(t0) ? t0 : 0;
              if (isFinite(t1) && mEl.currentTime >= t1) mEl.currentTime = a2;
            } catch (_) {}
          };
        }
        const pr = mEl.play && mEl.play();
        if (pr && typeof pr.catch === 'function') pr.catch(() => { mEl.muted = true; try { mEl.play(); } catch (_) {} });
      } catch (_) {}
    });
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
    /* R91 — 재생 중에는 사이트 셸의 「← 나가기」 칩(#kedu-back, fixed·z 9999)을
       숨긴다. 오버레이(z 900) 위에 그대로 떠서 사용자가 「재생 나가기」로
       오해해 눌렀고, 발자국 트레일 하드 내비게이션이 /maker 밖(케이랩 허브)
       으로 데려갔다(준호 실기기·영상). 재생의 나가기는 ✕·ESC 하나면 된다. */
    document.body.classList.add('mkp-on');
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
    document.body.classList.remove('mkp-on');   /* R91 — 셸 칩 복원 (✕·ESC·자동 종료 전 경로) */
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
    if (!/mkp-kb-zoom-in [\d.]+s linear [\d.]+s forwards/.test(hk)) v.push('켄번즈 재생 미방출(지연 정위치)');
    /* R90 — 첫 선언 꼬리에 시간값이 하나 더 붙으면(시간 3개) animation 전체가
       문법 무효 → opacity:0 갇힘 = 빈 장면. 그 모양 자체를 감시한다. */
    if (/both\s+[\d.]+m?s\s*,/.test(hk)) v.push('R90 결합식 회귀 — both 뒤 시간값');
    return { ok: v.length === 0, violations: v };
  }

  return { KEYFRAMES, PRESET_KEYS, enterPlan, animCss, sequence, sceneHTML, open, close, go, playAudit,
    state: () => ({ on: P.on, idx: P.idx, paused: P.paused, scenes: P.seq.length }) };
})();
