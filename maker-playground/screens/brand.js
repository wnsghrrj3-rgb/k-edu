/* ============================================================
   화면: Brand — Brand System Workspace            (Round 13)
   ------------------------------------------------------------
   좌 Brand 목록 · 중 편집 · 우 Preview(실시간)
   편집한 값은 즉시 Token → Palette → Preview 씬까지 관통한다.
   개별 요소를 손대지 않는다 — 기준색 하나 바꾸면 전부 따라온다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

(() => {
  const M = () => window.MK, B = () => window.MK_BRAND, SEC = () => window.MK_SEC;
  const esc = (s) => M().esc(String(s == null ? '' : s));

  const TABS = [
    ['overview', '개요'], ['logo', '로고'], ['color', '색상'], ['type', '타이포'],
    ['comp', '컴포넌트'], ['icon', '아이콘'], ['image', '이미지'], ['chart', '차트'],
    ['tpl', '템플릿'], ['valid', '검증'], ['share', '공유·내보내기'],
  ];

  const S = { id: null, tab: 'overview', msg: '', preview: 'scene' };
  let ROOT = null;

  const cur = () => {
    const L = B().list();
    if (!S.id || !B().get(S.id)) S.id = (B().active() || L[0] || {}).brandId || null;
    return B().get(S.id);
  };

  /* ---------- 미리보기용 브랜드 템플릿 (엔진 그대로) ---------- */
  function previewDoc(b) {
    B().sync(b);
    const json = {
      template: 'Brand Preview', palette: B().palId(b.brandId),
      meta: { templateId: 'bd-preview', title: b.name + ' Preview', contentType: 'presentation', ratio: b.templateDefaults.ratio },
      sections: [
        { id: 'cover', name: '표지', props: { label: (b.organization || b.name).toUpperCase(), title: b.name + '\n브랜드 적용 예시', subtitle: b.description || '브랜드가 적용된 표지입니다', meta: (b.owner || '') + ' · ' + b.updated } },
        { id: 'two-column', name: '본문', photo: 'a', props: { label: 'BRAND', title: '본문도\n같은 규칙을 따릅니다', body: '색·폰트·강조가 브랜드 토큰에서 나옵니다.', bullets: ['Primary가 강조를 맡습니다', 'Accent는 포인트 한 곳', 'Neutral이 본문을 읽힙니다'] } },
        { id: 'chart', name: '차트', props: { title: '차트도 브랜드 색', insight: '차트 색은 브랜드 Chart 규칙에서 옵니다.', bars: [{ k: '1분기', v: 32 }, { k: '2분기', v: 48 }, { k: '3분기', v: 61 }, { k: '4분기', v: 80 }] } },
      ],
    };
    const doc = SEC().buildTemplate(json);
    doc.paletteId = B().palId(b.brandId);
    doc.fontFamily = b.typography.fontFamily.korean;
    const cc = B().chartColors(b, 4);
    doc.scenes.forEach((s) => (s.elements || []).forEach((el) => { if (el.kind === 'chart') el.accent = cc[0]; }));
    return doc;
  }

  const mini = (scene, w) => (window.MK_MINI ? window.MK_MINI(scene, w || 260) : '');

  /* ---------- 좌: Brand 목록 ---------- */
  function listHTML() {
    const act = B().active();
    return `<div class="bd-list">
      <div class="bd-list-h"><b>Brand</b><button class="bd-mini" data-bd="new">＋ 새 브랜드</button></div>
      ${B().list().map((b) => {
        const T = B().tokens(b);
        return `<button class="bd-item ${b.brandId === S.id ? 'on' : ''}" data-bd="pick" data-id="${b.brandId}">
          <span class="sw"><i style="background:${T.primary[500]}"></i><i style="background:${T.accent[500]}"></i><i style="background:${T.gray[700]}"></i></span>
          <span class="nm"><b>${esc(b.name)}</b><small>${esc(b.organization || b.owner || '—')} · v${b.version}</small></span>
          ${act && act.brandId === b.brandId ? '<span class="live">활성</span>' : ''}
        </button>`;
      }).join('')}
      <div class="bd-list-f">
        <label class="bd-imp">가져오기<input type="file" accept=".json,application/json" data-bd="importfile" hidden></label>
        <button class="bd-mini" data-bd="importpaste">JSON 붙여넣기</button>
      </div>
    </div>`;
  }

  /* ---------- 공통 입력 위젯 ---------- */
  const row = (label, ctl, hint) => `<div class="bd-row"><label>${esc(label)}</label><div class="ctl">${ctl}</div>${hint ? `<small>${esc(hint)}</small>` : ''}</div>`;
  const txt = (k, v, ph) => `<input type="text" data-f="${k}" value="${esc(v || '')}" placeholder="${esc(ph || '')}">`;
  const num = (k, v, mn, mx, st) => `<input type="number" data-f="${k}" value="${v}" min="${mn}" max="${mx}" step="${st || 1}">`;
  const sel = (k, v, opts) => `<select data-f="${k}">${opts.map((o) => { const [val, nm] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${val === v ? 'selected' : ''}>${esc(nm)}</option>`; }).join('')}</select>`;
  const col = (k, v) => `<span class="bd-col"><input type="color" data-f="${k}" value="${esc(v)}"><input type="text" data-f="${k}" value="${esc(v)}" class="hex"></span>`;

  /* ---------- 중: 탭별 편집 ---------- */
  function editHTML(b) {
    const T = B().tokens(b);
    const ramp = (r) => `<div class="bd-ramp"><b>${r}</b><div class="ramp">${B().STEPS.map((s) =>
      `<i style="background:${T[r][s]}" title="${r}-${s} ${T[r][s]}"><em>${s}</em></i>`).join('')}</div></div>`;

    switch (S.tab) {
      case 'overview':
        return `<div class="bd-form">
          ${row('Brand Name', txt('name', b.name))}
          ${row('Description', txt('description', b.description, '한 줄 설명'))}
          ${row('Organization', txt('organization', b.organization))}
          ${row('Owner', txt('owner', b.owner))}
          ${row('Created / Updated', `<span class="bd-static">${esc(b.created)} → ${esc(b.updated)} · v${b.version}</span>`)}
          ${row('Brand ID', `<span class="bd-static mono">${esc(b.brandId)}</span>`, '팔레트 등재 id: ' + B().palId(b.brandId))}
          <div class="bd-actions">
            <button class="bd-btn pri" data-bd="activate">이 브랜드로 활성화</button>
            <button class="bd-btn" data-bd="applyproj">현재 프로젝트에 적용</button>
            <button class="bd-btn" data-bd="dup">복제</button>
            <button class="bd-btn danger" data-bd="del">삭제</button>
          </div>
        </div>`;

      case 'logo': {
        const V = [['primary', 'Primary'], ['secondary', 'Secondary'], ['iconOnly', 'Icon Only'], ['light', 'Light'], ['dark', 'Dark'], ['mono', 'Monochrome']];
        return `<div class="bd-form">
          <p class="bd-note">로고를 등록하지 않으면 브랜드 토큰으로 워드마크가 자동 생성됩니다. AI는 배경 명암을 보고 알맞은 버전을 자동 선택합니다.</p>
          <div class="bd-logos">${V.map(([k, nm]) => {
            const v = k === 'iconOnly' ? B().pickLogo(b, { iconOnly: true }) : k === 'dark' ? B().pickLogo(b, { background: '#111315' }) : k === 'mono' ? B().pickLogo(b, { mono: true }) : B().pickLogo(b, {});
            const darkbg = k === 'dark';
            return `<div class="bd-logo ${darkbg ? 'dk' : ''}"><div class="box">${v.svg}</div><b>${nm}</b><small>${b.logo[k] ? '등록됨 · SVG' : '자동 생성'}</small>
              <label class="bd-mini">SVG 등록<input type="file" accept=".svg,image/svg+xml" data-logo="${k}" hidden></label>
              ${b.logo[k] ? `<button class="bd-mini" data-bd="logoclear" data-k="${k}">해제</button>` : ''}</div>`;
          }).join('')}</div>
          <p class="bd-note">PNG 업로드는 실스토리지 연결 후 지원합니다(현재 SVG 인라인만).</p>
        </div>`;
      }

      case 'color':
        return `<div class="bd-form">
          <div class="bd-grid2">
            ${B().ROLES.map((r) => row(r[0].toUpperCase() + r.slice(1), col('color.' + r, b.color[r]))).join('')}
          </div>
          <h4>Token — 기준색에서 50~900 자동 생성</h4>
          ${B().ROLES.map(ramp).join('')}
          ${ramp('gray')}
          <p class="bd-note">500은 기준색 원본입니다. Token은 Theme(팔레트)로 연결되어 템플릿·에디터·AI 전 경로에서 그대로 쓰입니다.</p>
        </div>`;

      case 'type': {
        const F = b.typography.fontFamily, R = b.typography.roles;
        const rr = (k, nm) => `<div class="bd-typerow"><b>${nm}</b>
          <div class="f">${txt(`typography.roles.${k}.family`, R[k].family)}${num(`typography.roles.${k}.size`, R[k].size, 8, 96)}${sel(`typography.roles.${k}.weight`, R[k].weight, [[300, '300'], [400, '400'], [500, '500'], [600, '600'], [700, '700'], [800, '800']])}</div>
          <span class="pv" style="font-family:'${esc(R[k].family)}',Pretendard,sans-serif;font-size:${Math.min(28, R[k].size)}px;font-weight:${R[k].weight};letter-spacing:${R[k].tracking}em">가나다 Abc 123</span></div>`;
        return `<div class="bd-form">
          <div class="bd-grid2">
            ${row('Korean', txt('typography.fontFamily.korean', F.korean))}
            ${row('English', txt('typography.fontFamily.english', F.english))}
            ${row('Japanese', txt('typography.fontFamily.japanese', F.japanese))}
            ${row('Fallback', txt('typography.fontFamily.fallback', F.fallback))}
          </div>
          <h4>역할별 타이포</h4>
          ${['heading', 'body', 'caption', 'metric', 'button'].map((k) => rr(k, k[0].toUpperCase() + k.slice(1))).join('')}
        </div>`;
      }

      case 'comp': {
        const C = b.component;
        const keys = [['button', 'Button'], ['card', 'Card'], ['input', 'Input'], ['modal', 'Modal'], ['badge', 'Badge'], ['chip', 'Chip'], ['tooltip', 'Tooltip'], ['accordion', 'Accordion'], ['table', 'Table'], ['chart', 'Chart']];
        return `<div class="bd-form">
          <p class="bd-note">컴포넌트 기본 스타일 — 이 값이 Template 안의 모든 동종 부품에 적용됩니다.</p>
          <div class="bd-comp">${keys.map(([k, nm]) => `<div class="c"><b>${nm}</b>
            <label>radius ${num(`component.${k}.radius`, C[k].radius != null ? C[k].radius : 8, 0, 999)}</label>
            ${C[k].padX != null ? `<label>padX ${num(`component.${k}.padX`, C[k].padX, 0, 64)}</label>` : ''}
            ${C[k].padY != null ? `<label>padY ${num(`component.${k}.padY`, C[k].padY, 0, 64)}</label>` : ''}
            ${C[k].weight != null ? `<label>weight ${num(`component.${k}.weight`, C[k].weight, 300, 900, 100)}</label>` : ''}
          </div>`).join('')}</div>
        </div>`;
      }

      case 'icon':
        return `<div class="bd-form">
          ${row('Style', sel('icon.style', b.icon.style, [['line', 'Line'], ['filled', 'Filled'], ['rounded', 'Rounded'], ['sharp', 'Sharp']]))}
          ${row('Stroke Width', num('icon.stroke', b.icon.stroke, 0, 4, 0.1))}
          ${row('Corner Radius', num('icon.radius', b.icon.radius, 0, 12, 0.5))}
          ${row('Icon Pack', txt('icon.pack', b.icon.pack))}
          <div class="bd-icons">${['home', 'search', 'chart', 'image', 'text'].map((n, i) => {
            const st = b.icon.style, T = B().tokens(b);
            const f = st === 'filled' ? T.primary[500] : 'none';
            const sw = st === 'filled' ? 0 : b.icon.stroke;
            const lc = st === 'rounded' ? 'round' : st === 'sharp' ? 'butt' : 'round';
            const r = st === 'sharp' ? 0 : b.icon.radius;
            return `<span title="${n}"><svg viewBox="0 0 24 24" fill="${f}" stroke="${T.primary[500]}" stroke-width="${sw}" stroke-linecap="${lc}" stroke-linejoin="${lc}">
              ${i === 0 ? `<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>`
              : i === 1 ? `<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>`
              : i === 2 ? `<rect x="4" y="12" width="4" height="8" rx="${r}"/><rect x="10" y="7" width="4" height="13" rx="${r}"/><rect x="16" y="4" width="4" height="16" rx="${r}"/>`
              : i === 3 ? `<rect x="3" y="5" width="18" height="14" rx="${r + 1}"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5L6 19"/>`
              : `<path d="M5 6V4h14v2M12 4v16M9 20h6"/>`}
            </svg></span>`;
          }).join('')}</div>
        </div>`;

      case 'image':
        return `<div class="bd-form">
          ${row('Image Style', sel('image.style', b.image.style, [['photography', 'Photography'], ['illustration', 'Illustration'], ['3d', '3D'], ['gradient', 'Gradient'], ['outline', 'Outline'], ['flat', 'Flat']]))}
          ${row('Default Ratio', sel('image.ratio', b.image.ratio, ['16:9', '4:3', '1:1', '3:4', '9:16']))}
          ${row('AI Image Prompt Prefix', `<textarea data-f="image.promptPrefix" rows="3">${esc(b.image.promptPrefix)}</textarea>`, 'AI 이미지 생성 시 모든 프롬프트 앞에 붙습니다')}
          <div class="bd-phs">${['a', 'b', 'c', 'd'].map((k) => `<i style="background:${SEC().PH[k]}"></i>`).join('')}</div>
          <p class="bd-note">현재 이미지 슬롯은 브랜드 톤의 추상 그라데이션 더미를 씁니다 — 실이미지 생성/스토리지 연결은 후속.</p>
        </div>`;

      case 'chart': {
        const cc = B().chartColors(b, 6);
        return `<div class="bd-form">
          <div class="bd-grid2">
            ${row('Grid', sel('chart.grid', b.chart.grid, [['horizontal', 'Horizontal'], ['vertical', 'Vertical'], ['both', 'Both'], ['none', 'None']]))}
            ${row('Axis', sel('chart.axis', b.chart.axis, [['bottom', 'Bottom'], ['left', 'Left'], ['both', 'Both'], ['none', 'None']]))}
            ${row('Legend', sel('chart.legend', b.chart.legend, [['right', 'Right'], ['bottom', 'Bottom'], ['none', 'None']]))}
            ${row('Font', sel('chart.font', b.chart.font, [['body', 'Body'], ['caption', 'Caption'], ['metric', 'Metric']]))}
          </div>
          <h4>Chart Color — 브랜드 토큰에서 자동 파생</h4>
          <div class="bd-chartcols">${cc.map((c, i) => `<i style="background:${c}"><em>${i + 1}</em></i>`).join('')}</div>
          <div class="bd-charttypes">${['bar', 'line', 'pie', 'area', 'gauge'].map((t) => `<span>${t}</span>`).join('')}</div>
          <p class="bd-note">Bar·Line·Pie는 캔버스에서 실렌더됩니다. Area·Gauge는 규칙만 정의되어 있고 렌더러는 후속입니다.</p>
        </div>`;
      }

      case 'tpl': {
        const D = b.templateDefaults;
        return `<div class="bd-form">
          <div class="bd-grid2">
            ${row('기본 비율', sel('templateDefaults.ratio', D.ratio, ['16:9', '4:3', '1:1', '9:16', 'A4']))}
            ${row('기본 테마', sel('templateDefaults.theme', D.theme, [['light', 'Light'], ['dark', 'Dark'], ['mixed', 'Mixed']]))}
            ${row('Dark 기준', sel('templateDefaults.darkBase', D.darkBase, [['neutral', 'Neutral 900'], ['primary', 'Primary 900']]))}
            ${row('Light 기준', col('templateDefaults.lightBase', D.lightBase))}
            ${row('기본 스타일', sel('templateDefaults.style', D.style, ['Modern', 'Minimal', 'Luxury', 'Editorial', 'Corporate', 'Creative']))}
          </div>
          <h4>Template Mapping</h4>
          <p class="bd-note">브랜드를 적용하면 Template 내부의 Typography · Color · Button · Card · Chart가 모두 Brand Token으로 치환됩니다. 개별 요소를 하나씩 수정하지 않습니다.</p>
          <table class="bd-map"><tbody>
            ${[['Scene 배경(다크)', 'dark', 'Neutral/Primary 900'], ['Scene 배경(라이트)', 'light', 'Light 기준색'],
              ['면 강조 / soft', 'soft', 'Primary 50'], ['강조 1', 'accent', 'Primary 500'],
              ['강조 2(포인트)', 'accent2', 'Accent 500'], ['보조 텍스트(다크 위)', 'mutedOnDark', 'Gray 400'],
              ['보조 텍스트(라이트 위)', 'mutedOnLight', 'Gray 600']].map(([nm, k, src]) => {
              const P = B().toPalette(b);
              return `<tr><td>${nm}</td><td><i class="sw1" style="background:${P[k]}"></i><span class="mono">${P[k]}</span></td><td>${src}</td></tr>`;
            }).join('')}
          </tbody></table>
        </div>`;
      }

      case 'valid': {
        const bv = B().validateBrand(b.brandId);
        const doc = (window.PG.state.editor && window.PG.state.editor.doc) || null;
        const dv = doc ? B().validate(doc, b.brandId) : [];
        const li = (x) => `<li class="${x.level}"><b>${x.level === 'error' ? '위반' : '주의'}</b>${esc(x.msg)}</li>`;
        return `<div class="bd-form">
          <h4>브랜드 자체 검사</h4>
          <ul class="bd-vio">${bv.length ? bv.map(li).join('') : '<li class="ok">문제 없음 — 버튼 대비·색상·폰트 정의 정상</li>'}</ul>
          <h4>현재 프로젝트 검사 ${doc ? `<small>${esc(doc.title || '제목 없음')} · ${doc.scenes.length}장</small>` : ''}</h4>
          ${doc ? `<ul class="bd-vio">${dv.length ? dv.slice(0, 40).map(li).join('') : '<li class="ok">위반 없음 — 색·폰트·대비 모두 브랜드 규칙 준수</li>'}</ul>
            ${dv.length ? `<div class="bd-actions"><button class="bd-btn pri" data-bd="fix">${dv.length}건 자동 수정</button><span class="bd-static">${dv.filter((x) => x.level === 'error').length} 위반 · ${dv.filter((x) => x.level === 'warn').length} 주의</span></div>` : ''}`
            : '<p class="bd-note">에디터에 열린 프로젝트가 없습니다. Templates에서 템플릿을 열면 여기서 검사할 수 있습니다.</p>'}
        </div>`;
      }

      case 'share': {
        const S2 = b.sharing;
        return `<div class="bd-form">
          ${row('공유 범위', sel('sharing.scope', S2.scope, [['private', 'Private — 나만'], ['team', 'Team — 특정 팀'], ['org', 'Organization — 조직 전체'], ['public', 'Public — 전체 공개']]))}
          ${row('Team', txt('sharing.team', S2.team, '팀 이름'))}
          <h4>Export / Import</h4>
          <div class="bd-actions">
            <button class="bd-btn pri" data-bd="export">Brand JSON 내보내기</button>
            <button class="bd-btn" data-bd="copy">클립보드 복사</button>
            <button class="bd-btn" data-bd="importpaste">JSON 붙여넣기</button>
          </div>
          <pre class="bd-json" data-bd="jsonbox">${esc(B().exportJSON(b.brandId).slice(0, 1400))}${B().exportJSON(b.brandId).length > 1400 ? '\n…' : ''}</pre>
          <p class="bd-note">패키지에는 brand 본문 + 생성된 Token 트리 + Palette가 함께 담깁니다(스키마 v${B().SCHEMA}). 가져오기 시 id 충돌은 자동 회피합니다.</p>
        </div>`;
      }
    }
    return '';
  }

  /* ---------- 우: Preview ---------- */
  function prevHTML(b) {
    const T = B().tokens(b), P = B().toPalette(b);
    const doc = previewDoc(b);
    const btnFg = B().contrast('#FFFFFF', T.primary[500]) >= B().contrast(T.gray[900], T.primary[500]) ? '#FFFFFF' : T.gray[900];
    const C = b.component;
    return `<div class="bd-prev">
      <div class="bd-prev-h">Preview<span class="seg">${[['scene', '화면'], ['comp', '부품']].map(([k, n]) =>
        `<button class="${S.preview === k ? 'on' : ''}" data-bd="pv" data-k="${k}">${n}</button>`).join('')}</span></div>

      <div class="bd-brandcard" style="background:${P.dark}">
        <div class="lg">${B().pickLogo(b, { background: P.dark }).svg}</div>
        <div class="sw">${['primary', 'accent', 'secondary'].map((r) => `<i style="background:${T[r][500]}"></i>`).join('')}</div>
      </div>

      ${S.preview === 'scene' ? `<div class="bd-scenes">
        ${doc.scenes.map((s, i) => `<div class="sc"><div class="fr" style="font-family:'${esc(b.typography.fontFamily.korean)}',Pretendard,sans-serif">${mini(s, 300)}</div><small>${esc(s.name)}</small></div>`).join('')}
      </div>` : `<div class="bd-parts" style="font-family:'${esc(b.typography.fontFamily.korean)}',Pretendard,sans-serif">
        <div class="p"><b>Button</b><span>
          <button style="border-radius:${C.button.radius}px;padding:${C.button.padY}px ${C.button.padX}px;font-weight:${C.button.weight};background:${T.primary[500]};color:${btnFg};border:0">Primary</button>
          <button style="border-radius:${C.button.radius}px;padding:${C.button.padY}px ${C.button.padX}px;font-weight:${C.button.weight};background:transparent;color:${T.primary[600]};border:1px solid ${T.primary[300]}">Secondary</button>
        </span></div>
        <div class="p"><b>Card</b><span><div style="border-radius:${C.card.radius}px;padding:${C.card.padY}px ${C.card.padX}px;border:${C.card.border}px solid ${T.gray[200]};background:#fff;flex:1">
          <b style="font-size:14px;color:${T.gray[900]}">카드 제목</b><br><small style="color:${T.gray[600]}">본문 한 줄이 들어갑니다</small></div></span></div>
        <div class="p"><b>Input</b><span><input placeholder="입력" style="border-radius:${C.input.radius}px;padding:${C.input.padY}px ${C.input.padX}px;border:${C.input.border}px solid ${T.gray[300]};flex:1"></span></div>
        <div class="p"><b>Badge · Chip</b><span>
          <em style="border-radius:${C.badge.radius}px;padding:${C.badge.padY}px ${C.badge.padX}px;background:${T.accent[100]};color:${T.accent[700]};font-weight:${C.badge.weight};font-size:${C.badge.size}px;font-style:normal">NEW</em>
          <em style="border-radius:${C.chip.radius}px;padding:${C.chip.padY}px ${C.chip.padX}px;border:${C.chip.border}px solid ${T.gray[300]};color:${T.gray[700]};font-style:normal">필터</em>
        </span></div>
        <div class="p"><b>Table</b><span><table style="flex:1;border-collapse:collapse;font-size:12px">
          <tr style="background:${T.primary[50]}"><th style="text-align:left;padding:6px;font-weight:${C.table.headWeight};color:${T.gray[800]}">항목</th><th style="text-align:right;padding:6px;color:${T.gray[800]}">값</th></tr>
          <tr><td style="padding:6px;color:${T.gray[700]}">첫 행</td><td style="padding:6px;text-align:right;color:${T.gray[700]}">128</td></tr>
          <tr style="background:${C.table.zebra ? T.gray[50] : 'transparent'}"><td style="padding:6px;color:${T.gray[700]}">둘째 행</td><td style="padding:6px;text-align:right;color:${T.gray[700]}">240</td></tr>
        </table></span></div>
      </div>`}
    </div>`;
  }

  /* ---------- 조립 ---------- */
  function html() {
    const b = cur();
    if (!b) return '<div class="bd-empty">브랜드가 없습니다. 새 브랜드를 만들어 주세요.</div>';
    return `<div class="bd-wrap">
      ${listHTML()}
      <section class="bd-edit">
        <div class="bd-tabs">${TABS.map(([k, n]) => `<button class="${S.tab === k ? 'on' : ''}" data-bd="tab" data-k="${k}">${n}</button>`).join('')}</div>
        <div class="bd-editbody">${editHTML(b)}</div>
        ${S.msg ? `<div class="bd-msg">${esc(S.msg)}</div>` : ''}
      </section>
      ${prevHTML(b)}
    </div>`;
  }

  function rerender() {
    if (!ROOT) return;
    const sc = ROOT.querySelector('.bd-editbody');
    const top = sc ? sc.scrollTop : 0;
    ROOT.innerHTML = html();
    bind();
    const sc2 = ROOT.querySelector('.bd-editbody');
    if (sc2) sc2.scrollTop = top;
  }

  /* ---------- 값 쓰기 (a.b.c 경로) ---------- */
  function setPath(obj, path, val) {
    const ks = path.split('.'), last = ks.pop();
    let o = obj;
    ks.forEach((k) => { o = o[k] = o[k] || {}; });
    o[last] = val;
  }

  function bind() {
    const b = cur(); if (!b) return;

    ROOT.querySelectorAll('[data-bd]').forEach((el) => {
      const a = el.dataset.bd;
      if (a === 'importfile') return;
      el.onclick = (ev) => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return;
        ev.preventDefault();
        act(a, el, b);
      };
    });

    /* 필드 입력 — 즉시 반영 */
    ROOT.querySelectorAll('[data-f]').forEach((el) => {
      const f = el.dataset.f;
      const fire = () => {
        let v = el.value;
        if (el.type === 'number') v = parseFloat(v) || 0;
        if (/^(component|typography)\..*(weight)$/.test(f)) v = parseInt(v, 10);
        if (el.type === 'color' || el.classList.contains('hex')) { const n = B().norm(v); if (!n) return; v = n; }
        const patch = JSON.parse(JSON.stringify({}));
        setPath(patch, f, v);
        /* 최상위 키 기준 부분 병합 */
        const top = f.split('.')[0];
        const merged = JSON.parse(JSON.stringify(b));
        setPath(merged, f, v);
        B().update(b.brandId, { [top]: merged[top] });
        rerender();
      };
      el.onchange = fire;
      if (el.type === 'text' || el.tagName === 'TEXTAREA') el.onblur = fire;
    });

    /* 로고 SVG 업로드 */
    ROOT.querySelectorAll('[data-logo]').forEach((el) => {
      el.onchange = () => {
        const f = el.files && el.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => {
          const svg = String(r.result);
          if (svg.indexOf('<svg') < 0) { S.msg = 'SVG 파일이 아닙니다.'; rerender(); return; }
          const logo = Object.assign({}, b.logo); logo[el.dataset.logo] = svg;
          B().update(b.brandId, { logo });
          S.msg = '로고 등록 완료 — ' + el.dataset.logo; rerender();
        };
        r.readAsText(f);
      };
    });

    /* 브랜드 패키지 파일 가져오기 */
    const imp = ROOT.querySelector('[data-bd="importfile"]');
    if (imp) imp.onchange = () => {
      const f = imp.files && imp.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        const res = B().importJSON(String(r.result));
        S.msg = res.msg; if (res.ok) S.id = res.brand.brandId;
        rerender();
      };
      r.readAsText(f);
    };
  }

  function act(a, el, b) {
    switch (a) {
      case 'pick': S.id = el.dataset.id; S.msg = ''; break;
      case 'tab': S.tab = el.dataset.k; break;
      case 'pv': S.preview = el.dataset.k; break;
      case 'new': { const n = B().create({ name: '새 브랜드 ' + (B().list().length + 1) }); S.id = n.brandId; S.tab = 'overview'; S.msg = '새 브랜드를 만들었습니다.'; break; }
      case 'dup': { const c = B().duplicate(b.brandId); S.id = c.brandId; S.msg = '복제했습니다.'; break; }
      case 'del': {
        if (B().list().length <= 1) { S.msg = '마지막 브랜드는 삭제할 수 없습니다.'; break; }
        const nm = b.name; B().remove(b.brandId); S.id = null; S.msg = `"${nm}" 삭제됨`; break;
      }
      case 'activate': {
        B().setActive(b.brandId);
        if (window.PG.state.editor.doc) B().apply(window.PG.state.editor.doc, b.brandId);
        S.msg = `"${b.name}" 활성화 — 이후 만드는 프로젝트에 자동 적용됩니다.`;
        break;
      }
      case 'applyproj': {
        const doc = window.PG.state.editor.doc;
        if (!doc) { S.msg = '에디터에 열린 프로젝트가 없습니다.'; break; }
        window.MK_HIST && window.MK_HIST.push('브랜드 적용 · ' + b.name);
        B().apply(doc, b.brandId);
        S.msg = `현재 프로젝트 ${doc.scenes.length}장 전체에 "${b.name}" 적용 완료.`;
        break;
      }
      case 'fix': {
        const doc = window.PG.state.editor.doc; if (!doc) break;
        window.MK_HIST && window.MK_HIST.push('브랜드 위반 수정');
        const n = B().fix(doc, b.brandId);
        S.msg = `${n}건 자동 수정 완료.`;
        break;
      }
      case 'export': {
        const json = B().exportJSON(b.brandId);
        try {
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a2 = document.createElement('a');
          a2.href = url; a2.download = b.brandId + '.brand.json'; a2.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          S.msg = '내보내기 완료 — ' + b.brandId + '.brand.json';
        } catch (e) { S.msg = '이 환경에서는 파일 저장이 지원되지 않습니다.'; }
        break;
      }
      case 'copy': {
        const json = B().exportJSON(b.brandId);
        if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
        S.msg = 'Brand JSON을 클립보드에 복사했습니다.';
        break;
      }
      case 'importpaste': {
        const t = window.prompt ? window.prompt('Brand JSON을 붙여넣으세요') : null;
        if (!t) break;
        const res = B().importJSON(t);
        S.msg = res.msg; if (res.ok) S.id = res.brand.brandId;
        break;
      }
      case 'logoclear': {
        const logo = Object.assign({}, b.logo); logo[el.dataset.k] = null;
        B().update(b.brandId, { logo }); S.msg = '로고 해제 — 자동 워드마크로 돌아갑니다.'; break;
      }
      default: return;
    }
    rerender();
  }

  window.MK_SCREENS.brand = {
    title: 'Brand — 조직 디자인 시스템',
    variants: ['Workspace'],
    flush: true,
    render: () => html(),
    mount: (root) => { ROOT = root; bind(); },
  };
})();
