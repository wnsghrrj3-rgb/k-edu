/* ============================================================
   화면: Foundations — Design System (Figma Variables 감성)
   좌: 토큰 편집 (색=피커+HEX 동기 · 타이포 6종 개별 · 여백 배율 ·
       반경 슬라이더 · 그림자 프리셋 · 글꼴)  → 조작 즉시 :root 반영
   우: Live Preview 34% 고정 패널 + 6탭 (Home/Hero/Card/Template/Editor/Video)
   [변경 토큰 CSS 복사] → 확정 시 tokens.css 굳힘 · [초기화]
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
    '없음': ['none', 'none', 'none'],
    '은은하게': ['0 1px 2px rgba(20,28,40,.05)', '0 4px 14px rgba(20,28,40,.07)', '0 12px 36px rgba(20,28,40,.16)'],
    '기본': ['0 1px 2px rgba(20,28,40,.06)', '0 6px 20px rgba(20,28,40,.10)', '0 16px 48px rgba(20,28,40,.22)'],
    '뚜렷하게': ['0 2px 4px rgba(20,28,40,.10)', '0 8px 26px rgba(20,28,40,.16)', '0 20px 60px rgba(20,28,40,.30)'],
  };
  const FONTS = [
    ['Pretendard', "'Pretendard', -apple-system, 'Noto Sans KR', system-ui, sans-serif"],
    ['시스템 고딕', "-apple-system, 'Malgun Gothic', system-ui, sans-serif"],
    ['명조', "'Nanum Myeongjo', Batang, serif"],
  ];
  /* 타이포 6종 — 개별 편집 (size / weight, 행간은 기준 유지) */
  const TYPE = [
    ['Display', 'display', 30, 700, 1.25], ['H1', 'h1', 22, 700, 1.3], ['H2', 'h2', 17, 700, 1.35],
    ['Body', 'body', 14.5, 400, 1.6], ['Caption', 'caption', 11.5, 500, 1.4], ['Button', 'button', 13.5, 600, 1],
  ];
  const WEIGHTS = [400, 500, 600, 700];

  const root = () => document.documentElement;
  const getVar = (v) => getComputedStyle(root()).getPropertyValue(v).trim();
  const st = () => {
    if (!PG.state.fd) PG.state.fd = {
      defaults: null, changed: {}, pvTab: 'Hero',
      knobs: { spScale: 1, shadow: '기본', font: 0 },
      type: Object.fromEntries(TYPE.map(([, k, size, weight]) => [k, { size, weight }])),
    };
    if (!PG.state.fd.type) PG.state.fd.type = Object.fromEntries(TYPE.map(([, k, size, weight]) => [k, { size, weight }]));
    return PG.state.fd;
  };
  const snapshot = () => { const s = st(); if (s.defaults) return; s.defaults = {}; for (const [, v] of [...COLORS, ...RADII.map((r) => [r[0], r[1]])]) s.defaults[v] = getVar(v); };
  const setTok = (v, val) => { root().style.setProperty(v, val); st().changed[v] = val; refreshMeta(); };

  const applyType = (key) => {
    const [, , size0, weight0, lh] = TYPE.find((t) => t[1] === key);
    const { size, weight } = st().type[key];
    const val = `${weight} ${size}px/${lh} var(--mk-font)`;
    root().style.setProperty('--mk-t-' + key, val);
    st().changed['--mk-t-' + key] = (size !== size0 || weight !== weight0) ? val : undefined;
    refreshMeta();
  };
  const applyKnobs = () => {
    const k = st().knobs, ch = st().changed;
    [4, 8, 12, 16, 20, 24, 32, 40, 48, 64].forEach((px, i) => { const val = Math.round(px * k.spScale) + 'px'; root().style.setProperty(`--mk-sp-${i + 1}`, val); ch[`--mk-sp-${i + 1}`] = k.spScale !== 1 ? val : undefined; });
    const sh = SHADOW_PRESETS[k.shadow]; ['subtle', 'floating', 'modal'].forEach((n, i) => { root().style.setProperty('--mk-sh-' + n, sh[i]); ch['--mk-sh-' + n] = k.shadow !== '기본' ? sh[i] : undefined; });
    const f = FONTS[k.font][1]; root().style.setProperty('--mk-font', f); ch['--mk-font'] = k.font !== 0 ? f : undefined;
    TYPE.forEach(([, key]) => applyType(key));
  };

  const changedList = () => Object.entries(st().changed).filter(([, v]) => v !== undefined);
  function refreshMeta() {
    const n = changedList().length;
    const el = document.getElementById('fdChangedN');
    if (el) el.textContent = n ? `● 변경 ${n}` : '기본값';
    document.querySelectorAll('[data-fd-dot]').forEach((d) => { d.style.visibility = st().changed[d.dataset.fdDot] !== undefined ? 'visible' : 'hidden'; });
  }
  function copyCSS() {
    const list = changedList();
    const css = list.length ? `:root {\n${list.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}` : '/* 변경된 토큰 없음 */';
    (navigator.clipboard?.writeText(css) || Promise.reject()).catch(() => {});
    MK.Modal.open(`<h2>변경 토큰 CSS</h2><p style="color:var(--mk-text-secondary);font:var(--mk-t-body-sm)">클립보드에 복사됨 — 확정되면 tokens.css에 굳혀요.</p>
      <textarea class="mk-input" style="height:180px;padding:10px;font-family:monospace;font-size:12px;margin:12px 0" readonly>${MK.esc(css)}</textarea>
      <div style="text-align:right">${MK.Button({ label: '닫기', kind: 'secondary', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
  }
  function resetAll() {
    const s = st();
    [...COLORS.map(([, v]) => v), ...RADII.map(([, v]) => v), '--mk-font',
      ...TYPE.map(([, k]) => '--mk-t-' + k),
      ...Array.from({ length: 10 }, (_, i) => `--mk-sp-${i + 1}`), '--mk-sh-subtle', '--mk-sh-floating', '--mk-sh-modal',
    ].forEach((k) => root().style.removeProperty(k)); // 인라인 제거 → tokens.css 기본값 복원
    s.changed = {}; s.knobs = { spScale: 1, shadow: '기본', font: 0 };
    s.type = Object.fromEntries(TYPE.map(([, k, size, weight]) => [k, { size, weight }]));
    PG.render();
  }

  /* ================= Live Preview 6탭 — 실제 화면 축소 투영 ================= */
  /* frame(): 실화면 렌더러 출력을 원본 폭 그대로 그린 뒤 scale로 패널에 맞춤 (검수용, 조작 불가) */
  const frame = (html, w, h, cap) =>
    `<div class="fd-frame"><div class="fd-frame-in" data-fw="${w}" ${h ? `data-fh="${h}"` : ''} style="width:${w}px;${h ? `height:${h}px;` : ''}">${html}</div></div>
     <div class="fd-frame-cap"><span>${cap}</span><span>실화면 축소 · 검수용</span></div>`;

  function fitFrames() {
    document.querySelectorAll('.fd-frame').forEach((f) => {
      const inner = f.querySelector('.fd-frame-in');
      if (!inner || !f.clientWidth) return;
      const w = +inner.dataset.fw, sc = f.clientWidth / w;
      inner.style.transform = `scale(${sc})`;
      const ih = inner.dataset.fh ? +inner.dataset.fh : inner.offsetHeight;
      if (ih) f.style.height = Math.ceil(ih * sc) + 'px';
    });
  }
  if (!window.__fdResize) { window.__fdResize = true; window.addEventListener('resize', () => { if (PG.state.screen === 'foundations') fitFrames(); }); }

  const PV = {
    Home()     { return frame(window.MK_SCREENS.home.render('A'), 1160, null, 'Home · variant A (실제 렌더러)'); },
    Hero() {
      return `<div style="background:var(--mk-surface);border:1px solid var(--mk-border);border-radius:var(--mk-r-large);padding:var(--mk-sp-8) var(--mk-sp-6);text-align:center;box-shadow:var(--mk-sh-subtle)">
          <span style="display:inline-block;font:var(--mk-t-caption);color:var(--mk-teal);background:var(--mk-teal-soft);border-radius:var(--mk-r-pill);padding:5px 12px;margin-bottom:var(--mk-sp-4)">K-MAKER</span>
          <div style="font:var(--mk-t-display)">만들기가 쉬워지는<br>우리 반 디자인 도구</div>
          <div style="font:var(--mk-t-body);color:var(--mk-text-secondary);margin:var(--mk-sp-4) 0 var(--mk-sp-6)">발표자료부터 영상까지, 템플릿을 고르고 글자만 바꾸세요.</div>
          <div style="display:flex;gap:10px;justify-content:center">${MK.Button({ label: '시작하기', kind: 'accent' })}${MK.Button({ label: '둘러보기', kind: 'secondary' })}</div></div>
        <div class="fd-frame-cap"><span>Hero 컴포넌트 (실물 크기)</span></div>`;
    },
    Card() {
      const S = window.MK_SAMPLE;
      return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--mk-sp-3);margin-bottom:var(--mk-sp-4)">${MK.TemplateCard(S.TEMPLATES[0])}${MK.TemplateCard(S.TEMPLATES[2])}</div>
        <div class="mk-card"><b style="font:var(--mk-t-h2)">기본 카드</b>
          <p style="font:var(--mk-t-body);color:var(--mk-text-secondary);margin-top:8px">서피스·테두리·반경·그림자 토큰 적용.</p>
          <div style="margin-top:var(--mk-sp-4);display:flex;gap:8px">${MK.Button({ label: '확인', size: 'sm' })}${MK.Button({ label: '취소', kind: 'ghost', size: 'sm' })}${MK.Badge({ label: '샘플', tone: 'teal' })}</div></div>
        <div class="fd-frame-cap"><span>Template Card · 기본 카드 (실물 크기)</span></div>`;
    },
    Template() { return frame(window.MK_SCREENS.templates.render('A'), 1160, null, 'Templates · variant A (실제 렌더러)'); },
    Editor()   { return frame(window.MK_SCREENS.editor.render('Design'), 1240, 660, 'Editor · Design 모드 (실제 렌더러)'); },
    Video()    { return frame(window.MK_SCREENS.editor.render('Video'), 1240, 660, 'Editor · Video 모드 (실제 렌더러)'); },
  };
  const PV_TABS = Object.keys(PV);

  const preview = () => {
    const tab = st().pvTab;
    return `<div class="fd-pv-head"><b>Live Preview</b>
        <span id="fdChangedN" style="font:var(--mk-t-caption);color:var(--mk-coral)"></span></div>
      <div class="fd-pv-tabs">${PV_TABS.map((t) => `<button class="fd-pv-tab ${t === tab ? 'on' : ''}" data-fd-pv="${t}">${t}</button>`).join('')}</div>
      <div class="fd-pv-body" style="background:var(--mk-background)">${PV[tab]()}</div>`;
  };

  /* ================= 좌측 토큰 편집 ================= */
  const controls = () => {
    const s = st(), k = s.knobs;
    const colorRows = COLORS.map(([n, v]) => {
      const cur = (s.changed[v] || s.defaults[v] || '#ffffff');
      const hex = /^#([0-9a-f]{6})$/i.test(cur) ? cur.toUpperCase() : '#FFFFFF';
      return `<div class="fd-row">
        <input type="color" value="${hex}" data-fd-color="${v}">
        <input class="fd-hex" value="${hex}" maxlength="7" data-fd-hex="${v}" spellcheck="false">
        <span class="lab">${n} <i data-fd-dot="${v}" class="fd-dot"></i></span></div>`;
    }).join('');
    const typeRows = TYPE.map(([label, key]) => {
      const t = s.type[key];
      return `<div class="fd-row fd-type-row">
        <span class="fd-type-label" data-fd-tlabel="${key}" style="font:var(--mk-t-${key})">${label}</span>
        <input type="number" class="fd-num" value="${t.size}" min="9" max="64" step="0.5" data-fd-tsize="${key}"><span class="fd-unit">px</span>
        <select class="fd-sel" data-fd-tweight="${key}">${WEIGHTS.map((w) => `<option ${w === t.weight ? 'selected' : ''}>${w}</option>`).join('')}</select>
        <i data-fd-dot="--mk-t-${key}" class="fd-dot"></i></div>`;
    }).join('');
    const radiusRows = RADII.map(([n, v, min, max]) => {
      const cur = parseInt(s.changed[v] || s.defaults[v]) || 0;
      return `<div class="fd-row"><span class="lab" style="width:44px">${n}</span>
        <input type="range" min="${min}" max="${max}" value="${cur}" data-fd-radius="${v}">
        <b class="fd-val" data-fd-val="${v}">${cur}px</b><i data-fd-dot="${v}" class="fd-dot"></i></div>`;
    }).join('');
    return `
      <div class="fd-group"><div class="fd-group-t">Color</div>${colorRows}</div>
      <div class="fd-group"><div class="fd-group-t">Typography <small>크기·굵기 개별 조정</small></div>
        <div class="fd-row" style="margin-bottom:14px">${FONTS.map(([n], i) => `<button class="mk-chip ${k.font === i ? 'on' : ''}" data-fd-font="${i}">${n}</button>`).join('')}</div>
        ${typeRows}</div>
      <div class="fd-group"><div class="fd-group-t">Spacing</div>
        <div class="fd-row"><input type="range" min="0.75" max="1.5" step="0.05" value="${k.spScale}" data-fd-knob="spScale"><b class="fd-val" data-fd-kval="spScale">×${k.spScale}</b></div>
        <div class="fd-sp-demo">${[2, 4, 6, 8].map((i) => `<i style="width:var(--mk-sp-${i})"></i>`).join('')}</div></div>
      <div class="fd-group"><div class="fd-group-t">Radius</div>${radiusRows}</div>
      <div class="fd-group"><div class="fd-group-t">Shadow</div>
        <div class="fd-row">${Object.keys(SHADOW_PRESETS).map((n) => `<button class="mk-chip ${k.shadow === n ? 'on' : ''}" data-fd-shadow="${n}">${n}</button>`).join('')}</div></div>`;
  };

  function bindPreviewTabs(rootEl) {
    rootEl.querySelectorAll('[data-fd-pv]').forEach((b) => b.onclick = () => {
      st().pvTab = b.dataset.fdPv;
      rootEl.querySelector('.fd-preview').innerHTML = preview();
      bindPreviewTabs(rootEl);
      refreshMeta();
      fitFrames();
    });
  }

  return {
    title: 'Foundations', variants: ['A'],
    render() {
      snapshot();
      return `<div class="fd-bar">
          <span style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">토큰을 만지면 오른쪽 Preview 전체가 즉시 바뀝니다 · 이 세션에서만 유지</span>
          <span style="flex:1"></span>
          ${MK.Button({ label: '변경 토큰 CSS 복사', kind: 'secondary', size: 'sm', attrs: 'data-fd="copy"' })}
          ${MK.Button({ label: '초기화', kind: 'ghost', size: 'sm', attrs: 'data-fd="reset"' })}</div>
        <div class="fd-layout"><div class="fd-controls">${controls()}</div><div class="fd-preview">${preview()}</div></div>`;
    },
    mount(rootEl) {
      applyKnobs(); refreshMeta(); requestAnimationFrame(fitFrames);
      rootEl.querySelector('[data-fd="copy"]').onclick = copyCSS;
      rootEl.querySelector('[data-fd="reset"]').onclick = resetAll;
      bindPreviewTabs(rootEl);
      /* 색: 피커 ↔ HEX 동기 */
      rootEl.querySelectorAll('[data-fd-color]').forEach((inp) => inp.oninput = () => {
        setTok(inp.dataset.fdColor, inp.value.toUpperCase());
        const hx = rootEl.querySelector(`[data-fd-hex="${inp.dataset.fdColor}"]`); if (hx) hx.value = inp.value.toUpperCase();
      });
      rootEl.querySelectorAll('[data-fd-hex]').forEach((inp) => inp.oninput = () => {
        let v = inp.value.trim(); if (!v.startsWith('#')) v = '#' + v;
        if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + [...v.slice(1)].map((c) => c + c).join('');
        if (!/^#[0-9a-f]{6}$/i.test(v)) return;
        v = v.toUpperCase();
        setTok(inp.dataset.fdHex, v);
        const pk = rootEl.querySelector(`[data-fd-color="${inp.dataset.fdHex}"]`); if (pk) pk.value = v;
      });
      /* 타이포 개별 */
      rootEl.querySelectorAll('[data-fd-tsize]').forEach((inp) => inp.oninput = () => {
        const key = inp.dataset.fdTsize; st().type[key].size = Math.max(9, Math.min(64, +inp.value || 9));
        applyType(key);
      });
      rootEl.querySelectorAll('[data-fd-tweight]').forEach((sel) => sel.onchange = () => {
        const key = sel.dataset.fdTweight; st().type[key].weight = +sel.value; applyType(key);
      });
      /* 반경·간격·그림자·글꼴 */
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
