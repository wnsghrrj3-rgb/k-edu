/* ============================================================
   K-MAKER Export Studio (#/export) — Universal Render Engine 콘솔
   ------------------------------------------------------------
   좌: 소스(템플릿) · Export Preset 9종
   중: 라이브 미리보기(같은 Display List) · Scene 페이저 · 애니 스크럽
   우: 포맷·옵션 · 큐(진행/취소/재시도) · 배치 · 캐시 통계 · 경고
   모든 미리보기·다운로드는 window.MK_RENDER 하나만 경유한다.
   ============================================================ */
(() => {
  const M = () => window.MK;
  const R = () => window.MK_RENDER;
  const esc = (s) => M().esc(String(s == null ? '' : s));

  const S = {
    tplId: null, sceneIdx: 0, t: null,          /* t=null → 완성 상태, 숫자 → 애니 샘플 */
    fmt: 'pptx', presetKey: null,
    opts: { scale: 2, quality: 0.92, transparent: false, paper: 'a4', bleed: 3, cropMarks: true, cmyk: false, fps: 30, interactive: true, pretty: true },
    lastMs: null, lastWarn: [],
  };

  const srcList = () => window.MK_SAMPLE.TEMPLATES;
  const curTpl = () => srcList().find((t) => t.templateId === S.tplId) || srcList()[0];

  const FMT = [
    ['pptx', 'PPTX', '파워포인트'], ['pdf', 'PDF', '인쇄·문서'], ['png', 'PNG', '이미지'], ['jpg', 'JPG', '사진 압축'],
    ['svg', 'SVG', '벡터'], ['html', 'HTML', '웹 페이지'], ['json', 'JSON', '데이터'], ['video', 'Video', '프레임 플랜'],
  ];

  /* ---------- 다운로드 ---------- */
  function download(name, payload, mime) {
    let blob;
    if (payload instanceof Uint8Array) blob = new Blob([payload], { type: mime });
    else if (typeof payload === 'string' && payload.startsWith('data:')) { const a = document.createElement('a'); a.href = payload; a.download = name; a.click(); return; }
    else blob = new Blob([payload], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  const MIME = { pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', pdf: 'application/pdf', svg: 'image/svg+xml', html: 'text/html', json: 'application/json' };

  async function deliver(job) {
    const tpl = curTpl();
    const base = (tpl.title || 'export').replace(/[^\w가-힣]+/g, '-');
    const r = job.result;
    if (!r) return;
    if (job.format === 'pptx') download(base + '.pptx', r.files[0].bin, MIME.pptx);
    else if (job.format === 'pdf') { const b = r.files[0].bytes; const u8 = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i) & 255; download(base + '.pdf', u8, MIME.pdf); }
    else if (job.format === 'svg') r.files.forEach((f) => download(base + '-' + f.name, f.text, MIME.svg));
    else if (job.format === 'html') download(base + '.html', r.files[0].text, MIME.html);
    else if (job.format === 'json') download(base + '.json', r.files[0].text, MIME.json);
    else if (job.format === 'png' || job.format === 'jpg') {
      for (let i = 0; i < r.raster.length; i++) {
        const out = await Promise.resolve(r.raster[i]);
        if (out.dataUrl) download(`${base}-${i + 1}.${job.format}`, out.dataUrl);
      }
    } else if (job.format === 'video') download(base + '-frames.json', JSON.stringify(r.plan, null, 2), MIME.json);
  }

  /* ---------- 렌더 ---------- */
  function previewSvg() {
    const tpl = curTpl();
    const scene = tpl.scenes[Math.min(S.sceneIdx, tpl.scenes.length - 1)];
    const t0 = performance.now();
    const dl = R().renderScene(scene, S.t != null ? { time: S.t, noCache: true } : {});
    S.lastMs = Math.round((performance.now() - t0) * 100) / 100;
    S.lastWarn = dl.warnings;
    return R().toSVG(dl);
  }

  function optRows() {
    const o = S.opts; const chk = (k, on) => `<button class="mk-chip ${on ? 'on' : ''}" data-ex-opt="${k}">${on ? '✓ ' : ''}${({ transparent: '투명 배경', cropMarks: '재단선', cmyk: 'CMYK', interactive: '인터랙티브', pretty: '보기 좋게' })[k]}</button>`;
    if (S.fmt === 'png' || S.fmt === 'jpg') return `
      <div class="ex-opt"><label>배율</label>${[1, 2, 3, 4].map((s) => `<button class="mk-chip ${o.scale === s ? 'on' : ''}" data-ex-scale="${s}">${s}x</button>`).join('')}</div>
      ${S.fmt === 'jpg' ? `<div class="ex-opt"><label>품질</label><input type="range" min="50" max="100" value="${Math.round(o.quality * 100)}" data-ex-q><b>${Math.round(o.quality * 100)}%</b></div>` : `<div class="ex-opt"><label>배경</label>${chk('transparent', o.transparent)}</div>`}`;
    if (S.fmt === 'pdf') return `
      <div class="ex-opt"><label>용지</label>${['a4', 'a3'].map((p) => `<button class="mk-chip ${o.paper === p ? 'on' : ''}" data-ex-paper="${p}">${p.toUpperCase()}</button>`).join('')}</div>
      <div class="ex-opt"><label>재단 여백</label>${[0, 3, 5].map((b) => `<button class="mk-chip ${o.bleed === b ? 'on' : ''}" data-ex-bleed="${b}">${b}mm</button>`).join('')}</div>
      <div class="ex-opt"><label>인쇄</label>${chk('cropMarks', o.cropMarks)}${chk('cmyk', o.cmyk)}</div>`;
    if (S.fmt === 'video') return `<div class="ex-opt"><label>FPS</label>${[30, 60].map((f) => `<button class="mk-chip ${o.fps === f ? 'on' : ''}" data-ex-fps="${f}">${f}</button>`).join('')}</div>`;
    if (S.fmt === 'html') return `<div class="ex-opt"><label>동작</label>${chk('interactive', o.interactive)}</div>`;
    if (S.fmt === 'json') return `<div class="ex-opt"><label>형식</label>${chk('pretty', o.pretty)}</div>`;
    return `<div class="ex-opt" style="color:var(--mk-text-muted);font-size:12.5px">기본 옵션으로 내보냅니다</div>`;
  }

  function jobRow(j) {
    const ico = { queued: '⏳', running: '⚙️', done: '✅', error: '⚠️', cancelled: '🚫' }[j.status];
    return `<div class="ex-job">
      <div class="ex-job-top"><span>${ico} <b>${esc(j.title)}</b> · ${j.format.toUpperCase()}${j.priority > 5 ? ' · 우선' : ''}</span>
        <span class="ex-job-act">${j.status === 'done' ? `<button class="mk-chip" data-ex-dl="${j.id}">💾 저장</button>` : ''}${j.status === 'queued' || j.status === 'running' ? `<button class="mk-chip" data-ex-cancel="${j.id}">취소</button>` : ''}${j.status === 'error' || j.status === 'cancelled' ? `<button class="mk-chip" data-ex-retry="${j.id}">재시도</button>` : ''}</span></div>
      <div class="ex-bar"><i style="width:${j.progress}%"></i></div>
      ${j.error ? `<div class="ex-warn">⚠ ${esc(j.error)}</div>` : ''}
      ${j.status === 'done' && j.warnings.length ? `<div class="ex-warn">정직 보고 ${j.warnings.length}건 — ${esc(j.warnings[0].msg)}${j.warnings.length > 1 ? ` 외 ${j.warnings.length - 1}건` : ''}</div>` : ''}
    </div>`;
  }

  window.MK_SCREENS = window.MK_SCREENS || {};
  window.MK_SCREENS.export = {
    title: 'Export', variants: ['A'], _S: S,
    render() {
      const tpl = curTpl(); S.tplId = tpl.templateId;
      const scene = tpl.scenes[Math.min(S.sceneIdx, tpl.scenes.length - 1)];
      const cs = R().cache.stats;
      const jobs = R().queue();
      return `
      <style>
        .ex-wrap{display:grid;grid-template-columns:236px 1fr 320px;gap:14px;align-items:start}
        .ex-panel{background:var(--mk-surface);border:1px solid var(--mk-border);border-radius:var(--mk-r-large);padding:14px}
        .ex-sec{font:var(--mk-t-label);color:var(--mk-text-muted);margin:2px 0 8px;letter-spacing:.4px}
        .ex-src{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
        .ex-src button{text-align:left;border:1px solid var(--mk-border);background:var(--mk-bg);border-radius:var(--mk-r-medium);padding:8px 10px;cursor:pointer;font-size:12.5px}
        .ex-src button.on{border-color:var(--mk-accent);background:var(--mk-accent-soft, #E9F5F2);font-weight:600}
        .ex-preset{display:flex;flex-direction:column;gap:6px}
        .ex-preset button{display:flex;flex-direction:column;gap:2px;text-align:left;border:1px solid var(--mk-border);background:var(--mk-bg);border-radius:var(--mk-r-medium);padding:7px 10px;cursor:pointer}
        .ex-preset button.on{border-color:var(--mk-accent)}
        .ex-preset b{font-size:12.5px}.ex-preset span{font-size:11px;color:var(--mk-text-muted)}
        .ex-stage{background:#141A22;border-radius:var(--mk-r-large);padding:18px;display:flex;flex-direction:column;gap:12px}
        .ex-canvas{background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,.45)}
        .ex-canvas svg{display:block;width:100%;height:auto}
        .ex-stagebar{display:flex;align-items:center;gap:10px;color:#B9C4D0;font-size:12.5px}
        .ex-stagebar .mk-chip{background:#26303C;border-color:#333F4D;color:#E7EDF3}
        .ex-scrub{flex:1;display:flex;align-items:center;gap:8px}
        .ex-scrub input{flex:1}
        .ex-opt{display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap}
        .ex-opt label{width:64px;font-size:12px;color:var(--mk-text-muted)}
        .ex-fmt{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px}
        .ex-fmt button{border:1px solid var(--mk-border);background:var(--mk-bg);border-radius:var(--mk-r-medium);padding:8px 6px;cursor:pointer;font-size:12.5px}
        .ex-fmt button.on{border-color:var(--mk-accent);background:var(--mk-accent-soft,#E9F5F2);font-weight:700}
        .ex-fmt small{display:block;font-size:10.5px;color:var(--mk-text-muted);font-weight:400}
        .ex-job{border:1px solid var(--mk-border);border-radius:var(--mk-r-medium);padding:9px 10px;margin-bottom:8px;background:var(--mk-bg)}
        .ex-job-top{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;gap:6px}
        .ex-bar{height:5px;background:var(--mk-border);border-radius:3px;margin-top:7px;overflow:hidden}
        .ex-bar i{display:block;height:100%;background:var(--mk-accent);transition:width .2s}
        .ex-warn{margin-top:6px;font-size:11.5px;color:#A3612B;background:#FCF3E5;border-radius:6px;padding:5px 8px}
        .ex-stats{font-size:11.5px;color:var(--mk-text-muted);margin-top:10px;line-height:1.7}
      </style>
      <span class="pg-note">Universal Render Engine — Canvas는 하나, 출력 포맷만 다르다. 미리보기·PPTX·PDF·이미지·HTML 전부 같은 Display List에서 나온다.</span>
      <div class="ex-wrap">

        <div class="ex-panel">
          <div class="ex-sec">소스</div>
          <div class="ex-src">${srcList().map((t) => `<button data-ex-src="${t.templateId}" class="${t.templateId === tpl.templateId ? 'on' : ''}">${esc(t.title)}<br><small style="color:var(--mk-text-muted)">${t.scenes.length} 장면 · ${esc(t.ratio)}</small></button>`).join('')}</div>
          <div class="ex-sec">Export Preset</div>
          <div class="ex-preset">${R().PRESETS.map((p) => `<button data-ex-preset="${p.key}" class="${S.presetKey === p.key ? 'on' : ''}"><b>${esc(p.name)}</b><span>${esc(p.desc)}</span></button>`).join('')}</div>
        </div>

        <div class="ex-stage">
          <div class="ex-canvas" id="exCanvas" style="aspect-ratio:${scene.width}/${scene.height}">${previewSvg()}</div>
          <div class="ex-stagebar">
            <button class="mk-chip" data-ex-pg="-1">◀</button>
            <span>${S.sceneIdx + 1} / ${tpl.scenes.length} · ${esc(scene.name)}</span>
            <button class="mk-chip" data-ex-pg="1">▶</button>
            <div class="ex-scrub"><span>🎬</span><input type="range" min="0" max="200" value="${S.t == null ? 200 : Math.round(S.t * 100)}" data-ex-t><span>${S.t == null ? '완성' : S.t.toFixed(2) + 's'}</span></div>
            <span>렌더 ${S.lastMs}ms${S.lastWarn.length ? ` · ⚠ ${S.lastWarn.length}` : ''}</span>
          </div>
        </div>

        <div class="ex-panel">
          <div class="ex-sec">포맷</div>
          <div class="ex-fmt">${FMT.map(([k, n, d]) => `<button data-ex-fmt="${k}" class="${S.fmt === k ? 'on' : ''}">${n}<small>${d}</small></button>`).join('')}</div>
          <div class="ex-sec">옵션</div>
          ${optRows()}
          <div style="display:flex;gap:8px;margin:12px 0 16px">
            ${M().Button({ label: '📤 내보내기', kind: 'accent', attrs: 'data-ex-run' })}
            ${M().Button({ label: '전체 배치', attrs: 'data-ex-batch' })}
          </div>
          <div class="ex-sec">내보내기 큐 ${jobs.length ? `(${jobs.length})` : ''}</div>
          <div id="exQueue">${jobs.length ? jobs.map(jobRow).join('') : `<div style="font-size:12px;color:var(--mk-text-muted)">아직 작업이 없습니다</div>`}</div>
          <div class="ex-stats">캐시 적중 ${cs.hit} · 미스 ${cs.miss} · 장면 캐시 ${R().cache.scene.size}건<br>어댑터 ${Object.keys(R().ADAPTERS).length}종 등록 — 새 포맷은 registerAdapter 하나로 확장</div>
        </div>
      </div>`;
    },
    mount(root) {
      const rerender = () => window.PG.render();
      const on = (sel, fn) => root.querySelectorAll(sel).forEach((b) => b.onclick = () => fn(b));
      on('[data-ex-src]', (b) => { S.tplId = b.dataset.exSrc; S.sceneIdx = 0; S.t = null; rerender(); });
      on('[data-ex-fmt]', (b) => { S.fmt = b.dataset.exFmt; S.presetKey = null; rerender(); });
      on('[data-ex-preset]', (b) => {
        const p = R().PRESETS.find((x) => x.key === b.dataset.exPreset);
        S.presetKey = p.key; S.fmt = p.format === 'video' ? 'video' : p.format;
        Object.assign(S.opts, p.opts); rerender();
      });
      on('[data-ex-pg]', (b) => { const n = curTpl().scenes.length; S.sceneIdx = (S.sceneIdx + Number(b.dataset.exPg) + n) % n; rerender(); });
      on('[data-ex-scale]', (b) => { S.opts.scale = Number(b.dataset.exScale); rerender(); });
      on('[data-ex-paper]', (b) => { S.opts.paper = b.dataset.exPaper; rerender(); });
      on('[data-ex-bleed]', (b) => { S.opts.bleed = Number(b.dataset.exBleed); rerender(); });
      on('[data-ex-fps]', (b) => { S.opts.fps = Number(b.dataset.exFps); rerender(); });
      on('[data-ex-opt]', (b) => { const k = b.dataset.exOpt; S.opts[k] = !S.opts[k]; rerender(); });
      const q = root.querySelector('[data-ex-q]'); if (q) q.oninput = () => { S.opts.quality = Number(q.value) / 100; };
      const t = root.querySelector('[data-ex-t]'); if (t) t.oninput = () => {
        S.t = Number(t.value) >= 200 ? null : Number(t.value) / 100;
        const cv = root.querySelector('#exCanvas'); if (cv) cv.innerHTML = previewSvg();
        t.nextElementSibling.textContent = S.t == null ? '완성' : S.t.toFixed(2) + 's';
      };

      const runQueueVisual = () => { /* 단계 실행을 시각화 — 결정론 step 반복 */
        const tick = () => {
          const pending = R().queue().find((j) => j.status === 'queued' || j.status === 'running');
          if (!pending) { rerender(); return; }
          R().step(pending.id, 34);
          const el = root.querySelector('#exQueue'); if (el) el.innerHTML = R().queue().map(jobRow).join('');
          bindQueue();
          setTimeout(tick, 160);
        };
        tick();
      };
      const bindQueue = () => {
        on('[data-ex-cancel]', (b) => { R().cancel(b.dataset.exCancel); rerender(); });
        on('[data-ex-retry]', (b) => { R().retry(b.dataset.exRetry); runQueueVisual(); });
        on('[data-ex-dl]', async (b) => { const j = R().queue().find((x) => x.id === b.dataset.exDl); if (j) await deliver(j); });
      };
      bindQueue();

      const enqueueCur = (priority) => R().enqueue({
        format: S.fmt, presetKey: S.presetKey, title: curTpl().title, priority: priority || 5,
        scenes: curTpl().scenes, opts: { ...S.opts, format: S.fmt },
      });
      on('[data-ex-run]', () => { enqueueCur(8); rerender(); setTimeout(runQueueVisual, 60); });
      on('[data-ex-batch]', () => { R().batch(srcList(), S.fmt, { ...S.opts }); rerender(); setTimeout(runQueueVisual, 60); });
    },
  };
})();
