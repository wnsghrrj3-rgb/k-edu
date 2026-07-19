/* ============================================================
   화면: Brand Workspace — Round 13
   좌: Brand 목록(붙박이 4 + 커스텀 + 새로 만들기/Import)
   우: 현재 Brand 편집 — 탭: 개요 · 컬러 · 타이포 · 컴포넌트 ·
       아이콘/이미지 · 차트 · 공유/내보내기
   ⚠ 로고 실아트는 GPT 산출물로 교체 예정 — 여기서는 타이포 워드마크 슬롯.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.brand = (() => {
  const M = () => window.MK, BR = () => window.MK_BRAND;
  const st = () => {
    if (!PG.state.brand) PG.state.brand = { sel: BR().DEFAULT, tab: 'overview', importOpen: false, msg: '' };
    return PG.state.brand;
  };
  const cur = () => BR().get(st().sel) || BR().list()[0];
  const esc = (v) => window.MK.esc(String(v == null ? '' : v));

  const TABS = [['overview', '개요'], ['color', '컬러'], ['type', '타이포'], ['comp', '컴포넌트'], ['iconimg', '아이콘·이미지'], ['chart', '차트'], ['share', '공유·내보내기']];

  /* ================= 좌측: Brand 목록 ================= */
  const SideList = () => {
    const b = cur();
    return `<aside class="bw-side">
      <h3>브랜드</h3>
      <div class="bw-list">` + BR().list().map((x) => `
        <button class="bw-item ${x.id === b.id ? 'on' : ''}" data-bw-sel="${x.id}">
          <span class="bw-dot" style="background:${x.colors.primary}"></span>
          <span class="bw-dot" style="background:${x.colors.secondary}"></span>
          <b>${esc(x.name)}</b>
          <small>${x.sharing.scope === 'organization' ? '조직' : x.sharing.scope === 'team' ? '팀' : x.sharing.scope === 'public' ? '공개' : '개인'}</small>
        </button>`).join('') + `
      </div>
      <div class="bw-side-acts">
        <button class="mk-btn accent sm" data-bw-new>＋ 새 브랜드</button>
        <button class="mk-btn sm" data-bw-import>가져오기</button>
      </div>
      ${st().importOpen ? `<div class="bw-import">
        <textarea class="mk-input" data-bw-import-text rows="6" placeholder="Brand JSON 붙여넣기"></textarea>
        <button class="mk-btn accent sm" data-bw-import-run>Import</button>
      </div>` : ''}
      ${st().msg ? `<p class="bw-msg">${esc(st().msg)}</p>` : ''}
    </aside>`;
  };

  /* ================= 우측: 탭 본문 ================= */
  const wordmark = (b, ver, slot) => {
    const v = b.logo.variants[slot || 'primary'][ver];
    const font = b.type.heading.family;
    return `<div class="bw-logo" style="background:${v.bg === 'transparent' ? 'repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/14px 14px' : v.bg}">
      <b style="color:${v.fg};font-family:'${font}',sans-serif;font-weight:${b.type.heading.weight};letter-spacing:${b.type.heading.tracking}em">${esc(v.text)}</b>
    </div>`;
  };
  const TabOverview = (b) => {
    const pick = BR().pickLogo(b, { dark: true });
    return `
    <div class="bw-grid2">
      <section class="bw-card">
        <h4>브랜드 정보</h4>
        <div class="kvs">
          ${[['Brand Name', b.name], ['Description', b.desc], ['Organization', b.org], ['Owner', b.owner], ['Version', b.version], ['Created', b.createdAt], ['Updated', b.updatedAt]]
            .map(([k, v]) => `<div class="kv"><small>${k}</small><b>${esc(v)}</b></div>`).join('')}
        </div>
      </section>
      <section class="bw-card">
        <h4>로고 — 슬롯 3 × 버전 3 <small class="bw-hint">실아트는 GPT 산출물로 교체 · SVG/PNG 슬롯 예약</small></h4>
        <div class="bw-logos">
          ${['primary', 'secondary', 'iconOnly'].map((slot) => `
            <div class="bw-logo-slot"><small>${slot === 'primary' ? 'Primary' : slot === 'secondary' ? 'Secondary' : 'Icon Only'}</small>
            ${['light', 'dark', 'mono'].map((ver) => wordmark(b, ver, slot)).join('')}</div>`).join('')}
        </div>
        <p class="ed-note">AI 자동 선택 예 — 어두운 배경: <b>${pick.slot}/${pick.version}</b> (${esc(pick.reason)})</p>
      </section>
    </div>
    <section class="bw-card">
      <h4>브랜드 미리보기 — 토큰이 실제로 입혀진 모습</h4>
      <div class="bw-preview" style="background:${b.palette.dark}">
        <b style="color:#fff;font-family:'${b.type.heading.family}',sans-serif;font-weight:${b.type.heading.weight};letter-spacing:${b.type.heading.tracking}em;font-size:22px">${esc(b.name)} 스타일 미리보기</b>
        <p style="color:${b.palette.mutedOnDark};font-family:'${b.type.body.family}',sans-serif;margin:6px 0 14px">본문은 ${esc(b.type.body.family)}, 제목은 ${esc(b.type.heading.family)} ${b.type.heading.weight}.</p>
        <span class="bw-pv-btn" style="background:${b.colors.primary};border-radius:${b.components.button.radius}px;font-weight:${b.components.button.weight};padding:${b.components.button.padY}px ${b.components.button.padX}px">주 버튼</span>
        <span class="bw-pv-btn" style="background:transparent;border:1.5px solid ${b.palette.mutedOnDark};border-radius:${b.components.button.radius}px;font-weight:${b.components.button.weight};padding:${b.components.button.padY}px ${b.components.button.padX}px">보조 버튼</span>
        <span class="bw-pv-badge" style="background:${b.colors.secondary};border-radius:${b.components.badge.radius > 100 ? '999px' : b.components.badge.radius + 'px'}">NEW</span>
      </div>
    </section>`;
  };
  const TabColor = (b) => `
    <section class="bw-card">
      <h4>기준 색 — 수정하면 램프·팔레트·차트색이 전부 다시 계산돼요</h4>
      <div class="bw-colors">` + Object.keys(b.colors).map((k) => `
        <label class="bw-color"><small>${k}</small>
          <input type="color" value="${b.colors[k]}" data-bw-color="${k}">
          <code>${b.colors[k]}</code></label>`).join('') + `
      </div>
    </section>
    <section class="bw-card">
      <h4>토큰 램프 50 → 900</h4>
      ${Object.keys(b.ramps).map((k) => `<div class="bw-ramp"><small>${k}</small><div class="bw-ramp-row">
        ${Object.keys(b.ramps[k]).map((s) => `<span title="${k}-${s} ${b.ramps[k][s]}" style="background:${b.ramps[k][s]}"><i>${s}</i></span>`).join('')}
      </div></div>`).join('')}
      <p class="ed-note">Theme 연결 — dark=${b.palette.dark} · soft=${b.palette.soft} · accent=${b.palette.accent} · muted=${b.palette.mutedOnLight}</p>
    </section>`;
  const TabType = (b) => `
    <section class="bw-card">
      <h4>역할별 타이포 토큰</h4>
      <div class="bw-typelist">` + ['heading', 'body', 'caption', 'metric', 'button'].map((r) => {
        const t = b.type[r];
        return `<div class="bw-typerow">
          <small>${r}</small>
          <b style="font-family:'${t.family}',sans-serif;font-weight:${t.weight};letter-spacing:${t.tracking}em;font-size:${r === 'heading' ? 22 : r === 'metric' ? 20 : 14}px">수업이 작품이 되는 곳 Aa 123</b>
          <code>${esc(t.family)} · ${t.weight} · tr ${t.tracking}</code>
        </div>`; }).join('') + `</div>
    </section>
    <section class="bw-card">
      <h4>언어별 Fallback</h4>
      <div class="kvs">${['ko', 'en', 'ja'].map((l) => `<div class="kv"><small>${l.toUpperCase()}</small><b>${esc((b.type.fallback[l] || []).join(' → '))}</b></div>`).join('')}</div>
    </section>`;
  const TabComp = (b) => {
    const c = b.components, P = b.palette;
    const card = (t, body) => `<div class="bw-comp"><small>${t}</small>${body}</div>`;
    return `<section class="bw-card"><h4>컴포넌트 기본 스타일 — 브랜드 토큰으로 렌더</h4>
      <div class="bw-comps">
        ${card('Button', `<span class="bw-pv-btn" style="background:${b.colors.primary};color:#fff;border-radius:${c.button.radius}px;font-weight:${c.button.weight};padding:${c.button.padY}px ${c.button.padX}px">확인</span>`)}
        ${card('Card', `<div style="border-radius:${c.card.radius}px;border:${c.card.border === 'none' ? 'none' : '1px solid #E1E5EC'};box-shadow:${c.card.shadow === 'deep' ? '0 12px 30px rgba(0,0,0,.18)' : c.card.shadow === 'soft' ? '0 4px 14px rgba(0,0,0,.08)' : 'none'};padding:12px;background:#fff"><b>카드 제목</b><br><small style="color:${P.mutedOnLight}">radius ${c.card.radius} · ${c.card.shadow}</small></div>`)}
        ${card('Input', `<input class="mk-input" style="border-radius:${c.input.radius}px;${c.input.border === 'underline' ? 'border-width:0 0 1.5px 0;border-radius:0;' : ''}" value="입력값" readonly>`)}
        ${card('Badge · Chip', `<span class="bw-pv-badge" style="background:${b.colors.secondary};border-radius:${c.badge.radius > 100 ? '999px' : c.badge.radius + 'px'};font-weight:${c.badge.weight}">BADGE</span>
          <span class="bw-pv-badge" style="background:${b.ramps.primary[100]};color:${b.ramps.primary[700]};border-radius:${c.chip.radius > 100 ? '999px' : c.chip.radius + 'px'};font-weight:${c.chip.weight}">칩</span>`)}
        ${card('Tooltip', `<span class="bw-pv-badge" style="background:${c.tooltip.tone === 'dark' ? P.dark : '#fff'};color:${c.tooltip.tone === 'dark' ? '#fff' : P.dark};border:1px solid #E1E5EC;border-radius:${c.tooltip.radius}px">도움말이에요</span>`)}
        ${card('Table', `<table style="width:100%;border-collapse:collapse;font-size:12px"><tr>${['항목', '값'].map((h) => `<th style="text-align:left;font-weight:${c.table.headWeight};padding:4px 6px;border-bottom:1.5px solid ${P.accent}">${h}</th>`).join('')}</tr>
          ${[['도입 학교', '128'], ['만족도', '4.8']].map((r, i) => `<tr style="background:${c.table.zebra && i % 2 ? b.ramps.neutral[50] : 'transparent'}">${r.map((v) => `<td style="padding:4px 6px;border-bottom:1px solid #EEE">${v}</td>`).join('')}</tr>`).join('')}</table>`)}
        ${card('Modal', `<div style="border-radius:${c.modal.radius}px;box-shadow:0 18px 44px rgba(0,0,0,.22);padding:12px;background:#fff"><b>모달</b><br><small style="color:${P.mutedOnLight}">radius ${c.modal.radius}</small></div>`)}
        ${card('Accordion', `<div style="border-bottom:1px solid #E1E5EC;padding:6px 0"><b style="font-size:13px">▸ 자주 묻는 질문</b></div><div style="padding:6px 0"><small style="color:${P.mutedOnLight}">divider: ${c.accordion.divider}</small></div>`)}
      </div></section>`;
  };
  const TabIconImg = (b) => `
    <section class="bw-card"><h4>아이콘 스타일</h4>
      <div class="kvs">
        ${[['Style', b.icon.style], ['Stroke', b.icon.strokeWidth + 'px'], ['Corner', b.icon.cornerRadius + 'px'], ['Pack', b.icon.pack]].map(([k, v]) => `<div class="kv"><small>${k}</small><b>${esc(v)}</b></div>`).join('')}
      </div>
      <div class="bw-iconsym">${['○', '□', '△', '✚'].map((s) => `<span style="border:${b.icon.strokeWidth}px solid ${b.colors.primary};border-radius:${b.icon.cornerRadius * 2}px">${s}</span>`).join('')}</div>
      <p class="ed-note">실아이콘 팩 아트는 GPT 산출 영역 — 여기서는 두께·모서리 토큰만 정의</p>
    </section>
    <section class="bw-card"><h4>이미지 스타일 규칙</h4>
      <div class="kvs"><div class="kv"><small>허용 스타일</small><b>${esc(b.image.styles.join(' · '))}</b></div></div>
      <small class="bw-hint">AI Image Prompt Prefix — 이미지 생성 요청 앞에 자동으로 붙어요</small>
      <blockquote class="bw-quote">${esc(b.image.promptPrefix)}</blockquote>
    </section>`;
  const TabChart = (b) => {
    const bar = (v, i) => `<rect x="${8 + i * 18}" y="${52 - v}" width="12" height="${v}" rx="${b.components.chart.corner}" fill="${b.chart.colors[i % b.chart.colors.length]}"/>`;
    return `<section class="bw-card"><h4>차트 스타일 토큰</h4>
      <div class="kvs">${[['Grid', b.chart.grid], ['Axis', b.chart.axis ? '표시' : '숨김'], ['Legend', b.chart.legend ? '표시' : '숨김'], ['Font', b.chart.font]].map(([k, v]) => `<div class="kv"><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="bw-chartcolors">${b.chart.colors.map((c) => `<span style="background:${c}" title="${c}"></span>`).join('')}</div>
      <svg viewBox="0 0 100 58" class="bw-chartdemo" aria-label="브랜드 차트 미리보기">
        <path d="M6 52.5H96" stroke="#D8DCE3" stroke-width="0.8"/>
        ${[34, 22, 44, 28, 38].map(bar).join('')}
      </svg>
      <p class="ed-note">Editor 의 bar·line·pie·표 렌더러가 doc.brandId 로 이 토큰을 라이브로 읽어요 — 문서는 손대지 않아요</p>
    </section>`;
  };
  const TabShare = (b) => `
    <section class="bw-card"><h4>공유 범위</h4>
      <div class="bw-scopes">${[['private', '개인'], ['team', '특정 팀'], ['organization', '조직 전체'], ['public', 'Public']].map(([k, l]) =>
        `<button class="bw-scope ${b.sharing.scope === k ? 'on' : ''}" data-bw-scope="${k}">${l}</button>`).join('')}</div>
      ${b.sharing.team ? `<p class="ed-note">팀: ${esc(b.sharing.team)}</p>` : ''}
    </section>
    <section class="bw-card"><h4>Export / Import / Version</h4>
      <div class="kvs"><div class="kv"><small>Version</small><b>${esc(b.version)}</b></div><div class="kv"><small>Schema</small><b>k-maker/brand@1</b></div></div>
      <div class="bw-side-acts" style="margin-top:10px">
        <a class="mk-btn accent sm" download="${esc(b.id)}.json" href="data:application/json;charset=utf-8,${encodeURIComponent(BR().exportJSON(b.id))}">Brand JSON 다운로드</a>
        <button class="mk-btn sm" data-bw-export-view>JSON 보기</button>
        ${/^br-custom-/.test(b.id) ? `<button class="mk-btn sm danger" data-bw-del>삭제</button>` : ''}
      </div>
    </section>`;

  const Body = () => {
    const b = cur(), s = st();
    const tab = s.tab;
    return `<main class="bw-main">
      <header class="bw-head">
        <div><h2>${esc(b.name)}</h2><p>${esc(b.desc)}</p></div>
        <div class="bw-head-acts">
          <button class="mk-btn sm" data-bw-validate>브랜드 검사</button>
          <button class="mk-btn accent sm" data-bw-tryeditor>Editor 에 적용해 보기</button>
        </div>
      </header>
      <nav class="bw-tabs">${TABS.map(([k, l]) => `<button class="bw-tab ${tab === k ? 'on' : ''}" data-bw-tab="${k}">${l}</button>`).join('')}</nav>
      <div class="bw-body">${
        tab === 'color' ? TabColor(b) : tab === 'type' ? TabType(b) : tab === 'comp' ? TabComp(b) :
        tab === 'iconimg' ? TabIconImg(b) : tab === 'chart' ? TabChart(b) : tab === 'share' ? TabShare(b) : TabOverview(b)
      }</div>
    </main>`;
  };

  return {
    title: 'Brand', variants: ['Workspace'],
    render() { return `<div class="bw">${SideList()}${Body()}</div>`; },
    mount(root) {
      const s = st(), b = cur(), M2 = window.MK;
      root.querySelectorAll('[data-bw-sel]').forEach((x) => x.onclick = () => { s.sel = x.dataset.bwSel; s.msg = ''; PG.render(); });
      root.querySelectorAll('[data-bw-tab]').forEach((x) => x.onclick = () => { s.tab = x.dataset.bwTab; PG.render(); });
      const nw = root.querySelector('[data-bw-new]');
      if (nw) nw.onclick = () => { const nb = BR().create('새 브랜드'); s.sel = nb.id; s.msg = nb.name + ' 생성됨 — K-MAKER 기본값에서 시작'; PG.render(); };
      const im = root.querySelector('[data-bw-import]');
      if (im) im.onclick = () => { s.importOpen = !s.importOpen; PG.render(); };
      const ir = root.querySelector('[data-bw-import-run]');
      if (ir) ir.onclick = () => {
        const t = root.querySelector('[data-bw-import-text]');
        const r = BR().importJSON(t ? t.value : '');
        s.msg = r.ok ? `가져옴: ${r.name} (${r.id} · v${r.version})` : '실패: ' + r.err;
        if (r.ok) { s.sel = r.id; s.importOpen = false; }
        PG.render();
      };
      root.querySelectorAll('[data-bw-color]').forEach((x) => x.onchange = () => {
        const patch = { colors: {} }; patch.colors[x.dataset.bwColor] = x.value.toUpperCase();
        BR().update(b.id, patch); s.msg = `${x.dataset.bwColor} → ${x.value.toUpperCase()} · 램프/팔레트 재계산됨`; PG.render();
      });
      root.querySelectorAll('[data-bw-scope]').forEach((x) => x.onclick = () => { BR().update(b.id, { sharing: { scope: x.dataset.bwScope, team: b.sharing.team } }); PG.render(); });
      const del = root.querySelector('[data-bw-del]');
      if (del) del.onclick = () => { BR().remove(b.id); s.sel = BR().DEFAULT; s.msg = '삭제됨'; PG.render(); };
      const ev = root.querySelector('[data-bw-export-view]');
      if (ev) ev.onclick = () => M2.Modal.open(`<h2>${esc(b.name)} — Brand JSON</h2>
        <pre style="max-height:50vh;overflow:auto;background:var(--mk-surface-2,#F5F6F8);padding:12px;border-radius:10px;font-size:11.5px">${esc(BR().exportJSON(b.id))}</pre>
        <div style="text-align:right;margin-top:12px"><button class="mk-btn" onclick="MK.Modal.close()">닫기</button></div>`);
      const vd = root.querySelector('[data-bw-validate]');
      if (vd) vd.onclick = () => {
        const doc = PG.state.editor.doc;
        const r = doc ? BR().validate(doc) : null;
        M2.Modal.open(`<h2>브랜드 검사</h2>` + (!doc
          ? `<p>열려 있는 문서가 없어요. Editor 에서 문서를 연 뒤 검사해 주세요.</p>`
          : r.ok ? `<p>✓ <b>${esc(r.brand)}</b> 규칙 위반 없음 — 색·폰트·차트·대비 모두 통과</p>`
          : `<p><b>${r.violations.length}건 위반</b> (브랜드: ${esc(r.brand || '미지정')})</p><ol style="max-height:40vh;overflow:auto">${r.violations.slice(0, 20).map((v) => `<li><code>${v.type}</code> ${esc(v.detail)}${v.sceneIdx !== undefined ? ` <small>(씬 ${v.sceneIdx + 1})</small>` : ''}</li>`).join('')}</ol>`)
          + `<div style="text-align:right;margin-top:12px"><button class="mk-btn" onclick="MK.Modal.close()">닫기</button></div>`);
      };
      const te = root.querySelector('[data-bw-tryeditor]');
      if (te) te.onclick = () => {
        if (!PG.state.editor.doc) PG.loadEditorDoc('tpl-pr-presentation-01');
        if (window.MK_HIST) MK_HIST.push('브랜드 적용: ' + b.name);
        BR().apply(PG.state.editor.doc, b.id);
        PG.go('editor');
      };
    },
  };
})();
