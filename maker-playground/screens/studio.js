/* ============================================================
   MK_SCREENS.studio — R128 준호 전용 제작대 (#/studio)
   ------------------------------------------------------------
   준호의 실제 파이프라인: GPT 가 대사·프롬프트를 쓰고 → Veo 가 6~10초
   클립을 만들고 → 여기서 잇는다. 학생 화면(workspace)과 목적이 다르다 —
   학생은 「만들며 배우는」 화면이 필요하고, 준호는 **조립대**가 필요하다.

   원칙:
   · 새 엔진 0 — 반입(MK_LIVE)·트림/내보내기(MK_VIDEO)·녹음(MK_AUDIO)·
     재생(MK_PLAY)·영속(MK_LIVE.saveDoc) 전부 기존 기관. 이 파일은 배선만 진다.
   · 클립 하나 = 씬 하나(전면 배치) — Veo 클립이 곧 장면이다.
   · 대사 = 보통 텍스트 요소(stCap 표식) — 재생·내보내기가 그냥 그린다.
   · 문서는 'studio-main' 하나로 영속 — 준호 전용이라 프로젝트 목록이 필요 없다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.studio = (() => {
  const esc = (x) => String(x == null ? '' : x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const DOC_ID = 'studio-main';

  const st = () => {
    if (!PG.state.studio) PG.state.studio = { doc: null, sel: 0, msg: '', busy: false };
    return PG.state.studio;
  };
  const doc = () => {
    const s = st();
    if (!s.doc) {
      const saved = window.MK_LIVE && window.MK_LIVE.loadDoc(DOC_ID);
      s.doc = (saved && saved.doc) || { id: DOC_ID, title: '스튜디오', contentType: 'video', scenes: [], meta: {} };
    }
    return s.doc;
  };
  const save = () => { if (window.MK_LIVE) window.MK_LIVE.saveDoc(doc()); };
  const scene = () => doc().scenes[st().sel] || null;
  const vidOf = (sc) => (sc && sc.elements || []).find((e) => e && (e.video === true || e.kind === 'video'));
  const capOf = (sc) => (sc && sc.elements || []).find((e) => e && e.stCap);
  const totalSec = () => doc().scenes.reduce((a, sc) => a + (+sc.duration || 0), 0);
  const fmt = (n) => (Math.round(n * 10) / 10).toFixed(1);

  /* ---- 반입: 파일 1개 = 씬 1개 (전면 클립 + 길이 자동) ---- */
  function addClipScene(file, done) {
    window.MK_LIVE.fileToSrc(file, (src, err) => {
      if (!src) { done(err || '읽지 못했어요'); return; }
      const d = doc();
      const sc = { id: 'st' + Date.now() + Math.floor(Math.random() * 1e4), name: file.name.replace(/\.[^.]+$/, ''),
        duration: 3, background: '#000',
        elements: [{ kind: 'video', video: true, x: 0, y: 0, w: 100, h: 100, fit: 'contain',
          label: file.name.replace(/\.[^.]+$/, ''), src }] };
      d.scenes.push(sc);
      const si = d.scenes.length - 1;
      window.MK_LIVE.videoDuration(src, (dur) => {
        if (dur) {
          sc.elements[0].clipDur = Math.round(dur * 10) / 10;   /* R128 — 트림의 근거 */
          sc.duration = Math.ceil(dur * 10) / 10;
        }
        save(); done(null, si);
      });
    });
  }

  /* ---- 대사: stCap 텍스트 요소 하나를 씬마다 유지 ---- */
  function setCaption(sc, text) {
    const cur = capOf(sc);
    const t = String(text || '').trim();
    if (!t) { if (cur) sc.elements.splice(sc.elements.indexOf(cur), 1); return; }
    if (cur) { cur.text = t; return; }
    sc.elements.push({ kind: 'text', stCap: true, text: t, x: 6, y: 80, w: 88, size: 4.4,
      weight: 700, align: 'center', anim: { preset: 'fade', delay: 0.1, duration: 0.4 } });
  }

  const recOf = () => {
    const s = st();
    if (!s._rec && window.MK_AUDIO && window.MK_AUDIO.makeRecorder) s._rec = window.MK_AUDIO.makeRecorder();
    return s._rec || null;
  };

  /* ---- 렌더 ---- */
  function stripHTML() {
    const d = doc(), sel = st().sel;
    if (!d.scenes.length) return `<div class="stu-empty">아직 클립이 없어요 — 「클립 추가」로 Veo 클립을 넣어 주세요 (여러 개 한 번에 돼요)</div>`;
    return d.scenes.map((sc, i) => {
      const v = vidOf(sc);
      const sp = v && window.MK_VIDEO ? window.MK_VIDEO.clipSpan(v) : null;
      const trimTxt = v && (v.trimStart || v.trimEnd) && sp && sp.eff != null
        ? ` · ✂ ${fmt(sp.start)}~${fmt(sp.end)}` : '';
      return `<div class="stu-clip${i === sel ? ' on' : ''}" data-st-sel="${i}">
        <b>${i + 1}</b><span class="nm">${esc(sc.name || '장면')}</span>
        <small>${fmt(+sc.duration || 0)}초${trimTxt}${sc.narration ? ' · 🎙' : ''}${capOf(sc) ? ' · 💬' : ''}</small>
        <span class="ops"><button data-st-up="${i}" title="위로">▲</button><button data-st-down="${i}" title="아래로">▼</button><button data-st-del="${i}" title="빼기">✕</button></span>
      </div>`;
    }).join('');
  }

  function detailHTML() {
    const sc = scene();
    if (!sc) return '<div class="stu-empty">왼쪽에서 클립을 고르면 여기서 다듬어요</div>';
    const v = vidOf(sc);
    const cap = capOf(sc);
    const rec = recOf();
    const recording = rec && rec.recording();
    const raw = v && v.clipDur != null ? v.clipDur : null;
    const trimCtl = v ? (raw != null
      ? `<label class="cx-field"><span>트리밍 (클립 ${fmt(raw)}초)</span></label>
         <div class="stu-trow">시작 <input type="number" min="0" max="${raw}" step="0.1" value="${+v.trimStart || 0}" data-st-t0>
         끝 <input type="number" min="0" max="${raw}" step="0.1" value="${v.trimEnd != null ? +v.trimEnd : raw}" data-st-t1> 초</div>
         <div class="cx-hint">앞뒤 죽은 프레임을 잘라요 — 화면·소리·저장이 같은 창을 써요</div>`
      : `<div class="cx-hint">클립 길이를 아직 못 읽어 트리밍을 잠갔어요 — 다시 반입해 보세요</div>`) : '';
    const sndCtl = v ? `<label class="cx-field"><span>클립 소리</span></label><div class="cx-shrow">
        <button class="cx-shb${!v.mute ? ' on' : ''}" data-st-vmute="0">🔊 켬</button>
        <button class="cx-shb${v.mute ? ' on' : ''}" data-st-vmute="1">🔇 끔</button><i></i></div>` : '';
    const narrCtl = rec && rec.supported()
      ? (recording
        ? `<button class="cx-scenebtn primary" data-st-nstop>■ 녹음 끝내기</button><div class="cx-hint">🔴 녹음 중 — 대사를 읽고 끝내기를 눌러 주세요</div>`
        : (sc.narration
          ? `<div class="cx-shrow"><button class="cx-shb" data-st-nplay>▶</button><button class="cx-shb" data-st-nrec>●</button><button class="cx-shb" data-st-nclear>✕</button><i></i></div>
             <div class="cx-hint">🎙 ${fmt(+sc.narration.duration || 0)}초 — 음악은 자동으로 작아져요</div>`
          : `<button class="cx-scenebtn" data-st-nrec>● 나레이션 녹음</button>`))
      : `<div class="cx-hint">이 브라우저는 녹음을 지원하지 않아요</div>`;
    const A = window.MK_AUDIO;
    const musCtl = A ? `<div class="cx-shrow"><button class="cx-shb${!sc.music ? ' on' : ''}" data-st-music="">없음</button>` +
      A.SYNTHS.map((m) => `<button class="cx-shb${sc.music && sc.music.synth === m.id ? ' on' : ''}" data-st-music="${m.id}">${esc(m.name)}</button>`).join('') + `<i></i></div>` : '';
    return `
      <label class="cx-field"><span>대사 (자막으로 실려요)</span><textarea rows="3" data-st-cap placeholder="GPT 대사를 붙여 넣으세요">${esc(cap ? cap.text : '')}</textarea></label>
      ${trimCtl}${sndCtl}
      <label class="cx-field"><span>나레이션</span></label>${narrCtl}
      <label class="cx-field"><span>배경 음악</span></label>${musCtl}
      <label class="cx-field"><span>장면 길이</span></label>
      <div class="stu-trow"><input type="number" min="0.5" step="0.1" value="${+sc.duration || 0}" data-st-dur> 초 <button class="cx-shb" data-st-fit title="트림 창 길이에 맞춤">= 클립</button></div>`;
  }

  return {
    get variants() { return ['제작대']; },
    render() {
      const d = doc(), s = st();
      const tot = totalSec(), cap = window.MK_VIDEO ? window.MK_VIDEO.MAX_SEC : 300;
      return `<div class="stu-wrap">
        <style>
          .stu-wrap{display:grid;grid-template-columns:300px 1fr;gap:14px;align-items:start}
          .stu-head{grid-column:1/3;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
          .stu-head h2{margin:0;font:var(--mk-t-h3, 700 18px/1.3 sans-serif)}
          .stu-head .sp{flex:1}
          .stu-btn{padding:9px 14px;border-radius:10px;border:1.5px solid var(--mk-border);background:transparent;cursor:pointer;font:inherit}
          .stu-btn.primary{background:var(--mk-teal);color:#fff;border-color:var(--mk-teal)}
          .stu-strip{display:flex;flex-direction:column;gap:8px;max-height:70vh;overflow:auto}
          .stu-clip{display:flex;gap:8px;align-items:center;border:1.5px solid var(--mk-border);border-radius:10px;padding:8px 10px;cursor:pointer}
          .stu-clip.on{border-color:var(--mk-teal);background:var(--mk-teal-soft)}
          .stu-clip .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .stu-clip .ops button{border:none;background:transparent;cursor:pointer;padding:2px}
          .stu-detail{border:1.5px solid var(--mk-border);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:10px}
          .stu-empty{color:var(--mk-mut,#888);padding:22px;text-align:center;border:1.5px dashed var(--mk-border);border-radius:12px}
          .stu-trow{display:flex;gap:8px;align-items:center}
          .stu-trow input{width:80px;padding:6px;border:1.5px solid var(--mk-border);border-radius:8px}
          .stu-msg{grid-column:1/3;font:var(--mk-t-caption,12px sans-serif);color:var(--mk-mut,#888)}
        </style>
        <div class="stu-head">
          <h2>🎬 스튜디오</h2><small>${d.scenes.length}클립 · 총 ${fmt(tot)}초 / ${cap}초</small><span class="sp"></span>
          <button class="stu-btn" data-st-add>＋ 클립 추가</button>
          <button class="stu-btn" data-st-play ${d.scenes.length ? '' : 'disabled'}>▶ 미리보기</button>
          <button class="stu-btn primary" data-st-export ${d.scenes.length && !s.busy ? '' : 'disabled'}>⬇ 내보내기</button>
        </div>
        <div class="stu-strip">${stripHTML()}</div>
        <div class="stu-detail">${detailHTML()}</div>
        ${s.msg ? `<div class="stu-msg">${esc(s.msg)}</div>` : ''}
      </div>`;
    },
    mount(root) {
      const s = st();
      const R = () => { save(); PG.render(); };

      const add = root.querySelector('[data-st-add]');
      if (add) add.onclick = () => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'video/*'; inp.multiple = true;
        inp.onchange = () => {
          const files = Array.from(inp.files || []);
          if (!files.length) return;                     /* 취소 = 변화 0 */
          let left = files.length; const errs = [];
          files.forEach((f) => addClipScene(f, (err) => {
            if (err) errs.push(`${f.name}: ${err}`);
            if (--left === 0) {
              s.sel = doc().scenes.length - 1;
              s.msg = errs.length ? '일부를 못 넣었어요 — ' + errs.join(' / ') : files.length + '개 클립을 넣었어요';
              PG.render();
            }
          }));
        };
        inp.click();
      };

      root.querySelectorAll('[data-st-sel]').forEach((el) => el.onclick = (ev) => {
        if (ev.target.closest('button')) return;
        s.sel = +el.dataset.stSel; s.msg = ''; PG.render();
      });
      const move = (i, dir) => {
        const d = doc(), j = i + dir;
        if (j < 0 || j >= d.scenes.length) return;
        const [x] = d.scenes.splice(i, 1); d.scenes.splice(j, 0, x);
        s.sel = j; R();
      };
      root.querySelectorAll('[data-st-up]').forEach((b) => b.onclick = () => move(+b.dataset.stUp, -1));
      root.querySelectorAll('[data-st-down]').forEach((b) => b.onclick = () => move(+b.dataset.stDown, 1));
      root.querySelectorAll('[data-st-del]').forEach((b) => b.onclick = () => {
        const i = +b.dataset.stDel;
        doc().scenes.splice(i, 1);
        s.sel = Math.min(s.sel, doc().scenes.length - 1); R();
      });

      const cap = root.querySelector('[data-st-cap]');
      if (cap) cap.onchange = () => { const sc = scene(); if (sc) { setCaption(sc, cap.value); R(); } };

      const t0 = root.querySelector('[data-st-t0]'), t1 = root.querySelector('[data-st-t1]');
      const applyTrim = () => {
        const sc = scene(); const v = sc && vidOf(sc); if (!v || !window.MK_VIDEO) return;
        if (t0) { const x = +t0.value; if (x > 0) v.trimStart = x; else delete v.trimStart; }
        if (t1) { const x = +t1.value; if (v.clipDur != null && x < v.clipDur) v.trimEnd = x; else delete v.trimEnd; }
        const sp = window.MK_VIDEO.clipSpan(v);
        if (sp.eff != null) sc.duration = Math.ceil(sp.eff * 10) / 10;   /* 창에 씬을 맞춘다 */
        R();
      };
      if (t0) t0.onchange = applyTrim;
      if (t1) t1.onchange = applyTrim;

      root.querySelectorAll('[data-st-vmute]').forEach((b) => b.onclick = () => {
        const v = vidOf(scene()); if (!v) return;
        v.mute = b.dataset.stVmute === '1'; if (!v.mute) delete v.mute; R();
      });

      const nr = root.querySelector('[data-st-nrec]');
      if (nr) nr.onclick = () => { const rec = recOf(); if (!rec) return;
        rec.start().then((r2) => { if (!r2.ok && typeof alert === 'function') alert(r2.msg); PG.render(); }); PG.render(); };
      const ns = root.querySelector('[data-st-nstop]');
      if (ns) ns.onclick = () => { const rec = recOf(); if (!rec) return;
        rec.stop().then((r2) => {
          const sc = scene();
          if (r2.ok && sc) sc.narration = { src: r2.src, duration: r2.duration };
          else if (!r2.ok && typeof alert === 'function') alert(r2.msg);
          R();
        }); };
      const np = root.querySelector('[data-st-nplay]');
      if (np) np.onclick = () => { const sc = scene();
        if (sc && sc.narration && typeof Audio === 'function') {
          try { const a2 = new Audio(sc.narration.src); const pr = a2.play && a2.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (_) {}
        } };
      const nc = root.querySelector('[data-st-nclear]');
      if (nc) nc.onclick = () => { const sc = scene(); if (sc) { delete sc.narration; R(); } };

      root.querySelectorAll('[data-st-music]').forEach((b) => b.onclick = () => {
        const sc = scene(); if (!sc) return;
        const id = b.dataset.stMusic;
        if (id) sc.music = { synth: id, name: id }; else delete sc.music;
        R();
      });

      const du = root.querySelector('[data-st-dur]');
      if (du) du.onchange = () => { const sc = scene(); if (sc) { sc.duration = Math.max(0.5, +du.value || 0.5); R(); } };
      const ft = root.querySelector('[data-st-fit]');
      if (ft) ft.onclick = () => { const sc = scene(); const v = sc && vidOf(sc);
        if (v && window.MK_VIDEO) { const sp = window.MK_VIDEO.clipSpan(v);
          if (sp.eff != null) { sc.duration = Math.ceil(sp.eff * 10) / 10; R(); } } };

      const pl = root.querySelector('[data-st-play]');
      if (pl) pl.onclick = () => { if (window.MK_PLAY && doc().scenes.length) window.MK_PLAY.open(doc(), { startIdx: s.sel }); };

      const ex = root.querySelector('[data-st-export]');
      if (ex) ex.onclick = async () => {
        if (!window.MK_VIDEO || s.busy) return;
        s.busy = true; s.msg = '준비 중…'; PG.render();
        const r = await window.MK_VIDEO.exportMP4(doc(), { onProgress: (m2) => { s.msg = m2; PG.render(); } });
        s.busy = false;
        s.msg = r.ok
          ? `완료 — ${r.sec}초 · ${r.w}×${r.h}${r.audio ? ' · 소리 포함' : (r.audioMsg ? ' · ' + r.audioMsg : '')}${r.lowered ? ' · ' + r.lowered : ''}`
          : r.msg;
        PG.render();
      };
    },
  };
})();
