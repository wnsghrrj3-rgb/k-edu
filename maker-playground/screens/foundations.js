/* ============================================================
   화면: Foundations — 실시간 Style Guide (디자이너용)
   좌: 토큰 컨트롤 (색 피커·슬라이더·프리셋 — 조작 즉시 :root 반영)
   우: Live Preview 고정 패널 (버튼·인풋·칩·탭·카드·타이포·템플릿 카드)
   [초기화] 기본값 복원 · [변경 토큰 CSS 복사] → 확정 시 tokens.css에 굳힘
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.foundations = (() => {
  const COLORS = [
    ['배경', '--mk-background'], ['서피스', '--mk-surface'], ['서피스 옅게', '--mk-surface-muted'],
    ['본문 글자', '--mk-text-primary'], ['보조 글자', '--mk-text-secondary'], ['테두리', '--mk-border'],
    ['코랄', '--mk-coral'], ['코랄 옅게', '--mk-coral-soft'], ['틸', '--mk-teal'], ['틸 옅게', '--mk-teal-soft'],
    ['크림', '--mk-cream'], ['위험', '--mk-danger'], ['성공', '--mk-success'],
  ];
  const RADII = [['작게', '--mk-r-small', 0, 16], ['중간', '--mk-r-medium', 0, 24], ['크게', '--mk-r-large', 0, 36]];
  const SHADOW_PRESETS = {
    '없음':   ['none', 'none', 'none'],
    '은은하게': ['0 1px 2px rgba(20,28,40,.05)', '0 4px 14px rgba(20,28,40,.07)', '0 12px 36px rgba(20,28,40,.16)'],
    '기본':   ['0 1px 2px rgba(20,28,40,.06)', '0 6px 20px rgba(20,28,40,.10)', '0 16px 48px rgba(20,28,40,.22)'],
    '뚜렷하게': ['0 2px 4px rgba(20,28,40,.10)', '0 8px 26px rgba(20,28,40,.16)', '0 20px 60px rgba(20,28,40,.30)'],
  };
  const FONTS = [
    ['Pretendard (기본)', "'Pretendard', -apple-system, 'Noto Sans KR', system-ui, sans-serif"],
    ['시스템 고딕', "-apple-system, 'Malgun Gothic', system-ui, sans-serif"],
    ['명조 (브라우저 기본)', "'Nanum Myeongjo', Batang, serif"],
  ];
  /* 타이포 크기 기준값 — 배율 슬라이더가 이 위에 곱해짐 */
  const TYPE_BASE = { display: 30, h1: 22, h2: 17, h3: 14.5, body: 14.5, 'body-sm': 13, caption: 11.5, button: 13.5 };
  const HEAD_KEYS = ['display', 'h1', 'h2', 'h3'], BODY_KEYS = ['body', 'body-sm', 'caption', 'button'];
  const LH = { display: 1.25, h1: 1.3, h2: 1.35, h3: 1.4, body: 1.6, 'body-sm': 1.55, caption: 1.4, button: 1 };
  const WGT = { display: 700, h1: 700, h2: 700, h3: 700, body: 400, 'body-sm': 400, caption: 500, button: 600 };

  const root = () => document.documentElement;
  const getVar = (v) => getComputedStyle(root()).getPropertyValue(v).trim();
  const st = () => {
    if (!PG.state.fd) PG.state.fd = { defaults: null, changed: {}, knobs: { headScale: 1, bodyScale: 1, spScale: 1, shadow: '기본', font: 0 } };
    return PG.state.fd;
  };
  const snapshot = () => {
    const s = st();
    if (s.defaults) return;
    s.defaults = {};
    for (const [, v] of COLORS) s.defaults[v] = getVar(v);
    for (const [, v] of RADII) s.defaults[v] = getVar(v);
  };
  const setTok = (v, val) => { root().style.setProperty(v, val); st().changed[v] = val; refreshMeta(); };

  const applyKnobs = () => {
    const k = st().knobs, r = root(), ch = st().changed;
    for (const key of HEAD_KEYS) { const val = `${WGT[key]} ${(TYPE_BASE[key] * k.headScale).toFixed(1)}px/${LH[key]} var(--mk-font)`; r.style.setProperty('--mk-t-' + key, val); ch['--mk-t-' + key] = k.headScale !== 1 ? val : undefined; }
    for (const key of BODY_KEYS) { const val = `${WGT[key]} ${(TYPE_BASE[key] * k.bodyScale).toFixed(1)}px/${LH[key]} var(--mk-font)`; r.style.setProperty('--mk-t-' + key, val); ch['--mk-t-' + key] = k.bodyScale !== 1 ? val : undefined; }
    [4, 8, 12, 16, 20, 24, 32, 40, 48, 64].forEach((px, i) => { const val = Math.round(px * k.spScale) + 'px'; r.style.setProperty(`--mk-sp-${i + 1}`, val); ch[`--mk-sp-${i + 1}`] = k.spScale !== 1 ? val : undefined; });
    const sh = SHADOW_PRESETS[k.shadow]; ['subtle', 'floating', 'modal'].forEach((n, i) => { r.style.setProperty('--mk-sh-' + n, sh[i]); ch['--mk-sh-' + n] = k.shadow !== '기본' ? sh[i] : undefined; });
    const f = FONTS[k.font][1]; r.style.setProperty('--mk-font', f); ch['--mk-font'] = k.font !== 0 ? f : undefined;
    refreshMeta();
  };

  const changedList = () => Object.entries(st().changed).filter(([, v]) => v !== undefined);
  function refreshMeta() {
    const n = changedList().length;
    const el = document.getElementById('fdChangedN');
    if (el) el.textContent = n ? `변경된 토큰 ${n}개` : '기본값 상태';
    document.querySelectorAll('[data-fd-dot]').forEach((d) => {
      d.style.visibility = st().changed[d.dataset.fdDot] !== undefined ? 'visible' : 'hidden';
    });
  }

  function copyCSS() {
    const list = changedList();
    const css = list.length ? `:root {\n${list.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}` : '/* 변경된 토큰 없음 */';
    (navigator.clipboard?.writeText(css) || Promise.reject()).catch(() => {});
    MK.Modal.open(`<h2>변경 토큰 CSS</h2><p style="color:var(--mk-text-secondary);font:var(--mk-t-body-sm)">클립보드에 복사됨 — 확정되면 이 값을 tokens.css에 굳혀요.</p>
      <textarea class="mk-input" style="height:180px;padding:10px;font-family:monospace;font-size:12px;margin:12px 0" readonly>${MK.esc(css)}</textarea>
      <div style="text-align:right">${MK.Button({ label: '닫기', kind: 'secondary', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
  }

  function resetAll() {
    const s = st();
    [...COLORS.map(([, v]) => v), ...RADII.map(([, v]) => v),
      '--mk-font', ...HEAD_KEYS.map((k) => '--mk-t-' + k), ...BODY_KEYS.map((k) => '--mk-t-' + k),
      ...Array.from({ length: 10 }, (_, i) => `--mk-sp-${i + 1}`), '--mk-sh-subtle', '--mk-sh-floating', '--mk-sh-modal',
    ].forEach((k) => root().style.removeProperty(k)); // 인라인 제거 → tokens.css 기본값 복원
    s.changed = {}; s.knobs = { headScale: 1, bodyScale: 1, spScale: 1, shadow: '기본', font: 0 };
    PG.render();
  }

  /* ---------- Live Preview (우측 고정) ---------- */
  const preview = () => {
    const M = window.MK, tpl = window.MK_SAMPLE.TEMPLATES[0];
    return `<div class="fd-pv-head"><b>Live Preview</b><span id="fdChangedN" style="font:var(--mk-t-caption);color:var(--mk-text-secondary)"></span></div>
      <div class="fd-pv-body">
        <div class="fd-pv-sec"><small>타이포그래피</small>
          <div style="font:var(--mk-t-display)">디스플레이</div>
          <div style="font:var(--mk-t-h1)">제목 하나</div>
          <div style="font:var(--mk-t-body)">본문 문장이 이렇게 보여요. 학교 행사 안내문을 만들어 봅시다.</div>
          <div style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">캡션 · 보조 설명</div></div>
        <div class="fd-pv-sec"><small>버튼 · 칩</small>
          <div class="spec-row">${M.Button({ label: '시작하기' })}${M.Button({ label: '보조', kind: 'secondary' })}${M.Button({ label: '강조', kind: 'accent' })}</div>
          <div class="spec-row">${M.Chip({ label: '전체', on: true })}${M.Chip({ label: '행사' })}${M.Chip({ label: '알림' })}</div></div>
        <div class="fd-pv-sec"><small>입력 · 탭</small>
          <input class="mk-input" placeholder="파일 이름" style="margin-bottom:10px">${M.Tabs({ items: ['Design', 'Video'], on: 'Design' })}</div>
        <div class="fd-pv-sec"><small>카드</small>
          <div class="mk-card" style="margin-bottom:12px"><b style="font:var(--mk-t-h3)">카드 제목</b><p style="color:var(--mk-text-secondary);font:var(--mk-t-body-sm);margin-top:6px">간격·반경·그림자 토큰이 여기 적용돼요.</p>
            <div style="margin-top:var(--mk-sp-4)">${M.Button({ label: '동작', size: 'sm' })}</div></div>
          ${M.TemplateCard(tpl)}</div>
        <div class="fd-pv-sec"><small>그림자 3단</small>
          <div class="spec-row">${['subtle', 'floating', 'modal'].map((s) => `<div style="width:76px;height:52px;background:var(--mk-surface);border-radius:var(--mk-r-medium);box-shadow:var(--mk-sh-${s});display:flex;align-items:center;justify-content:center"><small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${s}</small></div>`).join('')}</div></div>
      </div>`;
  };

  /* ---------- 좌측 컨트롤 ---------- */
  const controls = () => {
    const k = st().knobs;
    const colorRows = COLORS.map(([n, v]) => {
      const cur = (st().changed[v] || st().defaults[v] || '#ffffff');
      const hex = /^#([0-9a-f]{6})$/i.test(cur) ? cur : '#ffffff';
      return `<div class="fd-row">
        <input type="color" value="${hex}" data-fd-color="${v}">
        <span class="lab">${n} <i data-fd-dot="${v}" class="fd-dot"></i></span>
        <code>${v.replace('--mk-', '')}</code></div>`;
    }).join('');
    const radiusRows = RADII.map(([n, v, min, max]) => {
      const cur = parseInt(st().changed[v] || st().defaults[v]) || 0;
      return `<div class="fd-row">
        <input type="range" min="${min}" max="${max}" value="${cur}" data-fd-radius="${v}">
        <span class="lab">${n} <b data-fd-val="${v}">${cur}px</b> <i data-fd-dot="${v}" class="fd-dot"></i></span></div>`;
    }).join('');
    return `
      <div class="fd-group"><div class="fd-group-t">색상 <small>피커로 바로 바꿔요</small></div>${colorRows}</div>
      <div class="fd-group"><div class="fd-group-t">글꼴</div>
        <div class="fd-row">${FONTS.map(([n], i) => `<button class="mk-chip ${k.font === i ? 'on' : ''}" data-fd-font="${i}">${n}</button>`).join('')}</div></div>
      <div class="fd-group"><div class="fd-group-t">타이포 크기</div>
        <div class="fd-row"><input type="range" min="0.8" max="1.4" step="0.05" value="${k.headScale}" data-fd-knob="headScale"><span class="lab">제목 배율 <b data-fd-kval="headScale">×${k.headScale}</b></span></div>
        <div class="fd-row"><input type="range" min="0.85" max="1.25" step="0.05" value="${k.bodyScale}" data-fd-knob="bodyScale"><span class="lab">본문 배율 <b data-fd-kval="bodyScale">×${k.bodyScale}</b></span></div></div>
      <div class="fd-group"><div class="fd-group-t">간격</div>
        <div class="fd-row"><input type="range" min="0.75" max="1.5" step="0.05" value="${k.spScale}" data-fd-knob="spScale"><span class="lab">여백 배율 <b data-fd-kval="spScale">×${k.spScale}</b></span></div>
        <div class="fd-sp-demo">${[2, 4, 6, 8].map((i) => `<i style="width:var(--mk-sp-${i})"></i>`).join('')}</div></div>
      <div class="fd-group"><div class="fd-group-t">반경</div>${radiusRows}</div>
      <div class="fd-group"><div class="fd-group-t">그림자</div>
        <div class="fd-row">${Object.keys(SHADOW_PRESETS).map((n) => `<button class="mk-chip ${k.shadow === n ? 'on' : ''}" data-fd-shadow="${n}">${n}</button>`).join('')}</div></div>`;
  };

  return {
    title: 'Foundations', variants: ['A'],
    render() {
      snapshot();
      return `<div class="fd-bar"><span class="pg-note" style="margin:0">🎨 만지는 스타일 가이드 — 조작 즉시 전 화면 토큰에 반영 (이 세션에서만)</span>
          <span style="flex:1"></span>
          ${MK.Button({ label: '변경 토큰 CSS 복사', kind: 'secondary', size: 'sm', attrs: 'data-fd="copy"' })}
          ${MK.Button({ label: '초기화', kind: 'ghost', size: 'sm', attrs: 'data-fd="reset"' })}</div>
        <div class="fd-layout"><div class="fd-controls">${controls()}</div><div class="fd-preview">${preview()}</div></div>`;
    },
    mount(rootEl) {
      applyKnobs(); refreshMeta();
      rootEl.querySelector('[data-fd="copy"]').onclick = copyCSS;
      rootEl.querySelector('[data-fd="reset"]').onclick = resetAll;
      rootEl.querySelectorAll('[data-fd-color]').forEach((inp) => inp.oninput = () => setTok(inp.dataset.fdColor, inp.value));
      rootEl.querySelectorAll('[data-fd-radius]').forEach((inp) => inp.oninput = () => {
        setTok(inp.dataset.fdRadius, inp.value + 'px');
        rootEl.querySelector(`[data-fd-val="${inp.dataset.fdRadius}"]`).textContent = inp.value + 'px';
      });
      rootEl.querySelectorAll('[data-fd-knob]').forEach((inp) => inp.oninput = () => {
        st().knobs[inp.dataset.fdKnob] = +inp.value; applyKnobs();
        rootEl.querySelector(`[data-fd-kval="${inp.dataset.fdKnob}"]`).textContent = '×' + inp.value;
      });
      rootEl.querySelectorAll('[data-fd-font]').forEach((b) => b.onclick = () => { st().knobs.font = +b.dataset.fdFont; applyKnobs(); PG.render(); });
      rootEl.querySelectorAll('[data-fd-shadow]').forEach((b) => b.onclick = () => { st().knobs.shadow = b.dataset.fdShadow; applyKnobs(); PG.render(); });
    },
  };
})();
