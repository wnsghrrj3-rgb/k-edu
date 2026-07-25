/* ============================================================
   화면: Editor v1 — "가장 편하고 직관적인 제작 경험"
   구역 역할 고정: 좌 = 추가 · 중앙 = 편집 · 우 = 속성
   6구역 = 독립 렌더 함수 (Toolbar/MainMenu/DetailPanel/CanvasArea/
   PropsPanel/BottomBar) — GPT 시안 교체 시 함수 단위로 갈아입힘.
   Design 모드: 하단 Scene Strip / Video 모드: 길이 타임라인.
   ⚠ 더미 편집 — Scene 선택·텍스트 입력·이미지 교체·씬 조작·줌만 동작.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.editor = (() => {
  const M = () => window.MK;
  const ed = () => PG.state.editor;

  /* ================= Toolbar (뒤로·프로젝트명·실행취소·다시실행·저장·미리보기·공유·내보내기) ================= */
  const Toolbar = (mode) => {
    const e = ed();
    return `<div class="ed-toolbar">
      ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M14.5 5.5L8 12l6.5 6.5'/></svg>", tip: '나가기', attrs: 'data-ed="back"' })}
      <span class="ed-tb-file">
        <span class="fname">${M().esc(e.doc.title)}</span>
        <span class="savestate" id="edSave">${e.savedAt ? '저장됨 · ' + e.savedAt : '저장 안 함'}</span>
        ${M().Button({ label: '저장', kind: 'secondary', size: 'sm', attrs: 'data-ed="save"' })}
      </span>
      <span class="grow"></span>
      <span class="ed-tb-hist">
        ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M8 7L4.5 10.5 8 14'/><path d='M4.5 10.5H15a4.5 4.5 0 0 1 0 9h-3'/></svg>", tip: '실행 취소 (⌘Z)', attrs: 'data-ed="undo"' + (window.MK_HIST && MK_HIST.canUndo() ? '' : ' disabled') })}
        ${M().IconButton({ icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M16 7l3.5 3.5L16 14'/><path d='M19.5 10.5H9a4.5 4.5 0 0 0 0 9h-3'/></svg>", tip: '다시 실행 (⇧⌘Z)', attrs: 'data-ed="redo"' + (window.MK_HIST && MK_HIST.canRedo() ? '' : ' disabled') })}
      </span>
      ${M().Tabs({ items: ['Design', 'Video'], on: mode === 'video' ? 'Video' : 'Design', attrs: 'data-ed="mode"' })}
      <span class="grow"></span>
      ${window.MK_PLUGIN ? window.MK_PLUGIN.contributions('topToolbar').map((c) => M().IconButton({ icon: c.icon, tip: c.title + ' · ' + c.plugin, attrs: `data-plugcmd="${c.command}"` })).join('') : ''}
      ${M().Button({ label: '미리보기', kind: 'secondary', size: 'sm', attrs: 'data-ed="preview"' })}
      ${M().Button({ label: '공유', kind: 'secondary', size: 'sm', attrs: 'data-ed="share"' })}
      ${M().Button({ label: '내보내기', kind: 'accent', size: 'sm', attrs: 'data-ed="export"' })}
    </div>`;
  };

  /* ================= Left: Main Menu (추가) ================= */
  const MENUS = [['tpl', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='17' height='17' rx='2.5'/><path d='M3.5 9.5h17M9.5 9.5v11'/></svg>", '템플릿'], ['ai', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7-4.7-1.8 4.7-1.8zM18.5 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z'/></svg>", 'AI'], ['text', '<span class="txtico">가</span>', '텍스트'], ['el', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='8' height='8' rx='1.5'/><circle cx='16.5' cy='16.5' r='4.2'/><path d='M12.5 7.5h4a3 3 0 0 1 3 3v1'/></svg>", '요소'],
    ['photo', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='4.5' width='17' height='15' rx='2.5'/><circle cx='9' cy='10' r='1.7'/><path d='M4.5 17l4.5-4.5 3.5 3.5 3-3 4 4'/></svg>", '사진'], ['video', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3' y='5.5' width='13' height='13' rx='2.5'/><path d='M16 10l5-2.8v9.6L16 14z'/></svg>", '영상'], ['audio', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M9.5 17.5V6.5l9-2v11'/><circle cx='7' cy='17.5' r='2.6'/><circle cx='16' cy='15.5' r='2.6'/></svg>", '오디오'], ['bg', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='3.5' y='3.5' width='17' height='17' rx='2.5'/><path d='M3.5 14.5l5-5 6 6M13 12l3-3 4.5 4.5'/></svg>", '배경'], ['up', "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 15.5v-11M7.5 8.5L12 4l4.5 4.5M4.5 19.5h15'/></svg>", '업로드']];
  const MainMenu = () => `<div class="ed-mainmenu"><small class="ed-zone-cap">추가</small>` +
    MENUS.map(([k, i, n]) => `<button class="${ed().menu === k ? 'on' : ''}" data-menu="${k}"><span class="ico">${i}</span>${n}</button>`).join('') + `</div>`;

  /* ================= Left: Detail Panel ================= */
  const DETAIL = {
    tpl: ['이 문서와 같은 유형의 템플릿', '스타일 바꾸기'], ai: ['발표자료 만들어줘', '문장을 짧게 바꿔줘', '1학년 수준으로 바꿔줘', '제목 추천'],
    text: ['제목 추가', '부제목 추가', '본문 추가', '글꼴 스타일 목록'], el: ['도형', '아이콘', '스티커', '표'],
    photo: ['사진 검색', '내 사진'], video: ['영상 클립 검색', '배경 영상'], audio: ['배경음악', '효과음'],
    bg: ['단색 배경', '이미지 배경', '움직이는 배경'], up: ['파일 올리기', '업로드 목록'],
  };
  /* ---- AI Dock (STEP 1·10) — Context 배지 + 대화 로그 + 빠른 명령 + 입력 ---- */
  const QUICK = [['이 제목을 더 고급스럽게', '고급'], ['배경을 어둡게', '배경'], ['색상 통일', '색통일'], ['여백 늘려', '여백'],
    ['표를 차트로', '표→차트'], ['원형 그래프로', '원형'], ['FAQ 페이지 추가', 'FAQ'], ['고객 후기 추가', '후기'],
    ['슬라이드를 8장으로 줄여', '8장'], ['투자자용으로 수정', '투자자'], ['다크 모드', '다크'], ['Apple 스타일', 'Apple']];

  const AIDock = () => {
    const e = ed(), ctx = window.MK_AIED ? MK_AIED.context() : null;
    if (!ctx) return '<div class="ed-detail"><h3>AI</h3><p class="ed-note">문서를 먼저 열어 주세요.</p></div>';
    const sel = ctx.selected
      ? (ctx.selectedKind === 'text' ? `텍스트 "${M().esc(String(ctx.selected.text).split('\n')[0].slice(0, 10))}"` : ctx.selectedKind === 'chart' ? '차트' : ctx.selectedKind === 'table' ? '표' : '이미지')
      : '선택 없음';
    const log = (e.aiLog || []).map((m) =>
      `<div class="aid-msg ${m.role}${m.err ? ' err' : ''}">${m.role === 'ai' ? '<span class="aid-dot"></span>' : ''}<span>${M().esc(m.text)}</span></div>`).join('')
      || '<div class="aid-empty">캔버스를 이해하는 AI 편집기예요.<br>아래 명령을 눌러 보거나 직접 말해 주세요.</div>';
    const hist = window.MK_HIST ? MK_HIST.list() : [];
    return `<div class="ed-detail ed-aidock"><h3>AI 편집</h3>
      <div class="aid-ctx" data-ed="aictx">
        <span title="현재 프로젝트">${M().esc(ctx.project)}</span>
        <b>씬 ${ctx.sceneIdx + 1}/${ctx.sceneCount} · ${M().esc(ctx.sceneName)}</b>
        <em>선택: ${M().esc(sel)} · 테마 ${M().esc(ctx.theme.paletteName)}${ctx.theme.dark ? ' (다크)' : ''}</em>
      </div>
      <div class="aid-log" id="aidLog">${log}</div>
      <div class="aid-quick">${QUICK.map(([c, l]) => `<button class="aid-chip" data-cmd="${M().esc(c)}" title="${M().esc(c)}">${l}</button>`).join('')}</div>
      <div class="aid-input">
        <input class="mk-input" data-ed="ai-in" placeholder="예) 이 카드 3개를 정렬" aria-label="AI 명령 입력">
        <button class="mk-btn accent" data-ed="ai-run">실행</button>
      </div>
      ${hist.length ? `<details class="aid-hist"><summary>AI 작업 기록 (${hist.length})</summary><ol>${hist.map((h) => `<li>${M().esc(h)}</li>`).join('')}</ol></details>` : ''}
      <p class="ed-note">규칙 기반 파서 — LLM 미연결. 명령은 실제 캔버스를 변형하고 Undo로 되돌릴 수 있어요.</p></div>`;
  };

  const DetailPanel = () => {
    if (ed().menu === 'ai') return AIDock();
    const name = (MENUS.find((m) => m[0] === ed().menu) || [])[2] || '';
    return `<div class="ed-detail"><h3>${name}</h3>
      <div class="ph-list">${(DETAIL[ed().menu] || []).map((d) => `<button class="ph-item">${d}</button>`).join('')}</div>
      <p class="ed-note">콘텐츠 연결 예정 — 외형 검토용</p></div>`;
  };


  /* ================= Chart / Table 렌더러 (Canvas·MiniScene 공용) ================= */
  const esc2 = (v) => window.MK.esc(String(v));
  const ChartSVG = (el, dark, mini) => {
    const S = el.series || [], ac = el.accent || '#2E8C7F';
    const muted = dark ? '#8A97A8' : '#8E97A3', grid = dark ? 'rgba(255,255,255,.14)' : 'rgba(31,39,51,.10)';
    const max = Math.max(1, ...S.map((d) => Math.abs(+d.v) || 0));
    const W = 100, H = 62, PADB = mini ? 6 : 11, TOP = el.title && !mini ? 12 : 4;
    let body = '';
    if (el.chartType === 'pie') {
      const total = S.reduce((a, d) => a + (+d.v || 0), 0) || 1;
      const cx = 30, cy = (H + TOP) / 2, r = Math.min(20, (H - TOP) / 2 - 2);
      let acc = -Math.PI / 2;
      body = S.map((d, i) => {
        const ang = (+d.v || 0) / total * Math.PI * 2, e2 = acc + ang;
        const x1 = cx + r * Math.cos(acc), y1 = cy + r * Math.sin(acc), x2 = cx + r * Math.cos(e2), y2 = cy + r * Math.sin(e2);
        const large = ang > Math.PI ? 1 : 0, op = (1 - i * 0.19).toFixed(2);
        acc = e2;
        return `<path d="M${cx} ${cy} L${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${ac}" opacity="${op}"/>`;
      }).join('');
      if (!mini) body += S.map((d, i) => `<rect x="60" y="${TOP + 3 + i * 11}" width="4" height="4" rx="1" fill="${ac}" opacity="${(1 - i * 0.19).toFixed(2)}"/><text x="67" y="${TOP + 6.6 + i * 11}" font-size="4.4" fill="${muted}">${esc2(d.k)} · ${esc2(d.v)}</text>`).join('');
    } else if (el.chartType === 'line') {
      const n = S.length || 1, step = 84 / Math.max(1, n - 1);
      const pts = S.map((d, i) => [8 + i * step, H - PADB - ((+d.v || 0) / max) * (H - PADB - TOP - 3)]);
      body = `<path d="M${pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' L')}" fill="none" stroke="${ac}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`
        + pts.map((p, i) => `<circle cx="${p[0].toFixed(2)}" cy="${p[1].toFixed(2)}" r="${i === pts.length - 1 ? 2.4 : 1.5}" fill="${ac}"/>`).join('')
        + (mini ? '' : S.map((d, i) => `<text x="${pts[i][0].toFixed(2)}" y="${H - 2}" font-size="3.8" fill="${muted}" text-anchor="middle">${esc2(d.k)}</text>`).join(''));
    } else {
      const n = S.length || 1, bw = Math.min(14, 84 / n - 3), gap = (84 - bw * n) / Math.max(1, n - 1);
      body = S.map((d, i) => {
        const h = ((+d.v || 0) / max) * (H - PADB - TOP - 3), x = 8 + i * (bw + gap), y = H - PADB - h;
        const last = i === S.length - 1;
        return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${bw.toFixed(2)}" height="${Math.max(0.6, h).toFixed(2)}" rx="0.8" fill="${ac}" opacity="${last ? 1 : 0.42}"/>`
          + (mini ? '' : `<text x="${(x + bw / 2).toFixed(2)}" y="${H - 2}" font-size="3.8" fill="${muted}" text-anchor="middle">${esc2(d.k)}</text>`
            + `<text x="${(x + bw / 2).toFixed(2)}" y="${(y - 1.6).toFixed(2)}" font-size="4" font-weight="700" fill="${last ? ac : muted}" text-anchor="middle">${esc2(d.v)}</text>`);
      }).join('');
    }
    const axis = el.chartType === 'pie' ? '' : `<path d="M6 ${H - PADB + 0.5}H94" stroke="${grid}" stroke-width="0.6"/>`;
    const title = (el.title && !mini) ? `<text x="6" y="7" font-size="5" font-weight="700" fill="${dark ? '#F2F5F9' : '#1F2733'}">${esc2(el.title)}</text>` : '';
    return `<svg viewBox="0 0 100 ${H}" preserveAspectRatio="none" style="width:100%;height:100%;display:block">${title}${axis}${body}</svg>`;
  };
  const TableHTML = (el, dark, mini) => {
    const line = dark ? 'rgba(255,255,255,.16)' : '#E1E5EC', head = dark ? '#F2F5F9' : '#1F2733', mut = dark ? '#B7C0CD' : '#525C6A';
    const fs = mini ? 'font-size:3px' : 'font-size:inherit';
    const rows = (el.rows || []).map((r, ri) => `<tr>${r.map((c, ci) => `<td style="padding:${mini ? '1px 2px' : '4px 8px'};border-top:1px solid ${line};color:${ci === 0 ? head : mut};font-weight:${ci === 0 ? 600 : 400};text-align:${ci ? 'right' : 'left'}">${esc2(c)}</td>`).join('')}</tr>`).join('');
    const cols = (el.cols || []).map((c, ci) => `<th style="padding:${mini ? '1px 2px' : '4px 8px'};color:${mut};font-weight:600;text-align:${ci ? 'right' : 'left'}">${esc2(c)}</th>`).join('');
    return `<div class="ed-tbl" style="${fs}">${el.title && !mini ? `<b style="color:${head}">${esc2(el.title)}</b>` : ''}<table style="width:100%;border-collapse:collapse"><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  const HANDLES = '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>';

  /* Round 35 — 선택 시 빠른동작 알약 4개 (MK_EASY) — 새 패널 아님, 캔버스 위 부유 */
  const QuickPill = (scene) => {
    const e = ed();
    if (!window.MK_EASY || e.selEl == null || !scene.elements[e.selEl]) return '';
    const el = scene.elements[e.selEl];
    const top = Math.max(0, el.y - 7);
    return `<div class="ed-quickpill" style="left:${Math.min(el.x, 78)}%;top:${top}%">${
      MK_EASY.quickFor(el).map((q) => `<button data-easyq="${q.id}" title="${q.label}">${q.icon} ${q.label}</button>`).join('')}</div>`;
  };

  /* ================= Center: Canvas (편집) — 확대/축소 ================= */
  const BASE_W = 680;
  const CanvasArea = (scene) => {
    const e = ed(), CW = Math.round(BASE_W * e.zoom), CH = Math.round(CW * scene.height / scene.width);
    const dk = MK_SEC ? MK_SEC.isDark(scene.background) : scene.background === '#1F2733';
    const rotSty = (el) => el.rot ? `;transform:rotate(${el.rot}deg)` : '';   /* R36 회전 */
    const els = scene.elements.map((el, i) => {
      const sel = e.selEl === i ? 'sel' : '';
      if (el.kind === 'chart' || el.kind === 'table') {
        const inner = el.kind === 'chart' ? ChartSVG(el, dk, false) : TableHTML(el, dk, false);
        const hd3 = e.selEl === i ? HANDLES : '';
        return `<div class="ed-el ed-data ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;font-size:${(2.6 / 100 * CH).toFixed(1)}px${rotSty(el)}">${inner}${hd3}</div>`;
      }
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        const hd = e.selEl === i ? '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>' : '';
        const dark = MK_SEC ? MK_SEC.isDark(scene.background) : scene.background === '#1F2733';
        const col = el.color || (dark ? ((el.weight || 400) >= 600 ? '#F2F5F9' : '#B7C0CD') : ((el.weight || 400) >= 600 ? '#1F2733' : '#525C6A'));
        const al = el.align ? `;text-align:${el.align}` : '';
        const tr = el.tracking ? `;letter-spacing:${el.tracking}em` : '';
        return `<div class="ed-el ${sel}" data-el="${i}" data-editable="1" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight};line-height:1.3;color:${col}${al}${tr};white-space:pre-wrap${rotSty(el)}"><span class="ed-txt">${M().esc(el.text)}</span>${hd}</div>`;
      }
      const hd2 = e.selEl === i ? '<i class="hd tl"></i><i class="hd tr"></i><i class="hd bl"></i><i class="hd br"></i><i class="hd tm"></i><i class="hd bm"></i><i class="hd ml"></i><i class="hd mr"></i><i class="hd rot"></i>' : '';
      const fillCls = el.fill && el.fill !== 'none' ? 'has-fill' : '', fillSty = el.fill && el.fill !== 'none' ? `;background:${el.fill}` : '';
      const rad = el.radius ? `;border-radius:${el.radius > 100 ? '50%' : el.radius + 'px'}` : '';
      const cut = el.cutout ? ';background:none;border:1px dashed var(--mk-border)' : '';
      if (el.src) {                                    /* R36 실이미지 — dataURL 실표시, 라벨은 걷는다 */
        const fit = el.fit === 'contain' ? 'contain' : 'cover';
        return `<div class="ed-el img-ph has-src ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${rad}${rotSty(el)}"><img class="ed-imgreal" src="${el.src}" alt="${M().esc(el.label || '')}" draggable="false" style="object-fit:${fit}">${hd2}</div>`;
      }
      return `<div class="ed-el img-ph ${fillCls} ${sel}" data-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${fillSty}${rad}${cut}${rotSty(el)}">${M().esc(el.label)}${hd2}</div>`;
    }).join('');
    return `<div class="ed-canvaswrap">
      <div class="ed-canvas" style="width:${CW}px;height:${CH}px;background:${scene.background}${e.doc.fontFamily ? `;font-family:'${e.doc.fontFamily}',Pretendard,sans-serif` : ''}">${els}${QuickPill(scene)}</div>
      <div class="ed-zoom">
        <button data-zoom="out" aria-label="축소"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' aria-hidden='true'><path d='M5.5 12h13'/></svg></button>
        <button data-zoom="fit">${Math.round(e.zoom * 100)}%</button>
        <button data-zoom="in" aria-label="확대"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' aria-hidden='true'><path d='M12 5.5v13M5.5 12h13'/></svg></button>
      </div>
    </div>`;
  };

  /* ================= Right: Properties (속성) ================= */
  const fld = (label, control) => `<div class="fld"><label>${label}</label>${control}</div>`;
  const num = (v, attrs = '') => `<input class="mk-input" value="${v}" ${attrs}>`;
  const sel2 = (opts, cur) => `<select class="mk-input">${opts.map((o) => `<option ${o === cur ? 'selected' : ''}>${o}</option>`).join('')}</select>`;

  const PropsPanel = (scene, mode) => {
    const e = ed(), s = e.selEl != null ? scene.elements[e.selEl] : null;
    let body;
    if (s && (s.kind === 'chart' || s.kind === 'table')) {
      const isCh = s.kind === 'chart';
      body = `<h3>${isCh ? '차트' : '표'} 속성</h3>
        ${fld('제목', num(M().esc(s.title || ''), 'data-ed="data-title"'))}
        ${isCh ? fld('유형', `<select class="mk-input" data-ed="chart-type">${['bar', 'line', 'pie'].map((o) => `<option value="${o}" ${o === s.chartType ? 'selected' : ''}>${o === 'bar' ? '막대' : o === 'line' ? '라인' : '원형'}</option>`).join('')}</select>`) : fld('열', num(M().esc((s.cols || []).join(' · '))))}
        ${fld('데이터', `<textarea class="mk-input" style="height:64px;padding:8px" data-ed="data-edit">${M().esc((isCh ? s.series.map((d) => `${d.k}, ${d.v}`) : s.rows.map((r) => r.join(', '))).join('\n'))}</textarea>`)}
        ${fld('', M().Button({ label: isCh ? '표로 바꾸기' : '차트로 바꾸기', kind: 'secondary', attrs: `data-ed="data-conv" style="width:100%"` }))}
        <p class="hint">제목·유형·데이터 전부 실동작 — AI 명령("막대그래프로", "표를 차트로")과 같은 엔진</p>`;
    } else if (s && s.kind === 'text') {
      body = `<h3>텍스트 속성</h3>
        ${fld('내용', `<textarea class="mk-input" style="height:60px;padding:8px" data-ed="text-edit">${M().esc(s.text)}</textarea>`)}
        <div class="fld row2"><span><label>Font</label>${sel2(['기본 (임시)'], '기본 (임시)')}</span><span><label>Size</label>${num(s.size)}</span></div>
        <div class="fld row2"><span><label>Weight</label>${sel2(['보통', '굵게'], s.weight >= 700 ? '굵게' : '보통')}</span><span><label>Color</label>${num('자동')}</span></div>
        <div class="fld row2"><span><label>Align</label>${sel2(['왼쪽', '가운데', '오른쪽'], '왼쪽')}</span><span><label>Line Height</label>${num('1.25')}</span></div>
        ${fld('Letter Spacing', num('0'))}
        <details class="ed-adv"><summary>고급</summary>
          <div class="fld row2"><span><label>투명도</label>${num('100%')}</span><span><label>회전</label>${num('0°')}</span></div>
        </details>
        <p class="hint">내용 입력만 실동작 — 나머지는 외형 검토용</p>`;
    } else if (s) {
      body = `<h3>이미지 속성</h3>
        ${fld('', M().Button({ label: '이미지 교체', kind: 'secondary', attrs: 'data-ed="img-swap" style="width:100%"' }))}
        <div class="fld row2"><span><label>Crop</label>${sel2(['원본', '정방형', '원형'], '원본')}</span><span><label>Brightness</label>${num('0')}</span></div>
        <div class="fld row2"><span><label>Contrast</label>${num('0')}</span><span><label>Saturation</label>${num('0')}</span></div>
        <div class="fld row2"><span><label>Opacity</label>${num('100%')}</span><span><label>Border Radius</label>${num('0')}</span></div>
        ${fld('Shadow', sel2(['없음', '은은하게', '뚜렷하게'], '없음'))}
        <details class="ed-adv"><summary>고급</summary>
          <div class="fld row2"><span><label>필터</label>${sel2(['없음', '흑백', '따뜻하게'], '없음')}</span><span><label>회전</label>${num('0°')}</span></div>
        </details>
        <p class="hint">교체 버튼만 실동작(더미) — 나머지는 외형 검토용</p>`;
    } else {
      body = `<h3>Scene 속성</h3>
        <div class="fld row2"><span><label>배경</label>${num(scene.background)}</span><span><label>전환</label>${sel2(['fade', 'slide', 'none'], scene.transition)}</span></div>
        ${mode === 'video' ? fld('길이 (초)', num(scene.duration, 'data-ed="dur"')) : ''}
        <p class="hint">캔버스에서 요소를 클릭하면 해당 속성이 열립니다</p>`;
    }
    return `<div class="ed-props"><small class="ed-zone-cap">속성</small>${body}</div>`;
  };


  /* 실캔버스 축소 미리보기 — Strip·Timeline 공용 */
  const MiniScene = (scene, W = 108) => {
    const H = Math.round(W * scene.height / scene.width);
    const dark = window.MK_SEC ? MK_SEC.isDark(scene.background) : scene.background === '#1F2733';
    const els = scene.elements.map((el) => {
      if (el.kind === 'chart' || el.kind === 'table') {
        return `<span style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;overflow:hidden">${el.kind === 'chart' ? ChartSVG(el, dark, true) : TableHTML(el, dark, true)}</span>`;
      }
      if (el.kind === 'text') {
        const fs = Math.max(3, el.size / 100 * H);
        const col = el.color || (dark ? ((el.weight || 400) >= 600 ? '#F2F5F9' : '#B7C0CD') : ((el.weight || 400) >= 600 ? '#1F2733' : '#525C6A'));
        const al = el.align ? `;text-align:${el.align}` : '';
        return `<span style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400};color:${col}${al}">${M().esc(el.text)}</span>`;
      }
      if (el.src) return `<i style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;background-image:url('${el.src}');background-size:${el.fit === 'contain' ? 'contain' : 'cover'};background-position:center;background-repeat:no-repeat;opacity:1"></i>`;   /* R36 실이미지 미니 */
      return `<i style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${el.fill ? ';background:' + el.fill + ';opacity:1' : ''}"></i>`;
    }).join('');
    return `<div class="ed-mini" style="background:${scene.background}" aria-hidden="true">${els}</div>`;
  };
  window.MK_MINI = MiniScene;   /* Round 13 — Brand Preview 등 외부 화면 공용 렌더러 */
  window.MK_EDPARTS = { ChartSVG, TableHTML };   /* R37 — 플레이어 공용 부품 */
  /* ================= Bottom: Scene Strip / Timeline ================= */
  const BottomBar = (mode) => {
    const e = ed(), doc = e.doc;
    if (mode === 'video') {
      const total = doc.scenes.reduce((a, s) => a + s.duration, 0);
      const done = doc.scenes.slice(0, e.sceneIdx).reduce((a, s) => a + s.duration, 0);
      const pct = total ? Math.round(done / total * 100) : 0;
      const blocks = doc.scenes.map((s, i) =>
        `<button class="ed-tl-block ${i === e.sceneIdx ? 'on' : ''}" data-scene="${i}" style="width:${Math.max(118, s.duration * 40)}px">${MiniScene(s, 132)}<span class="tx"><b>${i + 1}. ${M().esc(s.name)}</b><span class="dur">${s.duration}초</span></span></button>` +
        (i < doc.scenes.length - 1 ? `<span class="ed-tl-tr mk-tooltip" data-tip="전환: ${M().esc(s.transition)}" aria-label="전환 ${M().esc(s.transition)}"><svg viewBox='0 0 24 24' width='11' height='11' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 8.5h13M14 5l3.5 3.5L14 12M20 15.5H7M10 12l-3.5 3.5L10 19'/></svg></span>` : '')).join('');
      return `<div class="ed-bottom">
        <div class="ed-playbar"><span data-ed="play">${M().IconButton({ icon: "<svg viewBox='0 0 24 24' width='12' height='12' fill='currentColor' aria-hidden='true'><path d='M8 5.5v13l11-6.5z'/></svg>", tip: '재생' })}</span><div class="track"><i style="width:${pct}%"></i></div><span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">0:${String(done).padStart(2, '0')} / 0:${String(total).padStart(2, '0')} · 총 ${doc.scenes.length}장면</span></div>
        <div class="ed-timeline">${blocks}<button class="ed-strip-add" data-ed="add" style="height:52px">＋</button></div></div>`;
    }
    return `<div class="ed-bottom"><div class="ed-strip-head"><span class="cap">장면</span><span class="prg"><b>${e.sceneIdx + 1}</b> / ${doc.scenes.length}</span></div><div class="ed-strip">
      ${doc.scenes.map((s, i) => `<div class="ed-sc ${i === e.sceneIdx ? 'on' : ''}">
        <button class="frame" data-scene="${i}" aria-label="장면 ${i + 1} ${M().esc(s.name)}">
          <span class="num">${i + 1}</span><span class="dur">${s.duration}초</span>${MiniScene(s, 148)}</button>
        <span class="nm">${M().esc(s.name)}</span>
        <div class="ed-sceneops">
          <button data-op="dup" data-i="${i}"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='8.5' y='8.5' width='12' height='12' rx='2'/><path d='M15.5 5.5h-10a2 2 0 0 0-2 2v10'/></svg> 복제</button>
          <button data-op="del" data-i="${i}"><svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l1 13h9l1-13M10 10.5v5.5M14 10.5v5.5'/></svg> 삭제</button>
        </div>
      </div>`).join('')}
      <button class="ed-strip-add" data-ed="add" aria-label="장면 추가">＋</button></div></div>`;
  };

  /* ================= 화면 ================= */
  return {
    title: 'Editor', variants: ['Design', 'Video'], flush: true,
    render(v) {
      const e = ed();
      if (!e.doc) PG.loadEditorDoc('smp-pres-01');
      if (e.zoom == null) e.zoom = 1;
      e.mode = v === 'Video' ? 'video' : 'design';
      const scene = e.doc.scenes[e.sceneIdx];
      return `<div class="ed">${Toolbar(e.mode)}
        <div class="ed-mid">${MainMenu()}${DetailPanel()}${CanvasArea(scene)}${PropsPanel(scene, e.mode)}</div>
        ${BottomBar(e.mode)}
        <div class="ed-mobile-guard" role="note">
          <b>K-MAKER Editor</b>
          <p>데스크톱 또는 태블릿 가로 화면에 최적화되어 있습니다.<br>PC에서 계속 작업해 주세요.</p>
          <button class="mk-btn accent" data-ed="guard-home">홈으로 이동</button>
        </div></div>`;
    },
    mount(root) {
      const e = ed(), doc = e.doc, M2 = window.MK;
      const H = window.MK_HIST;
      /* --- History --- */
      root.querySelectorAll('[data-plugcmd]').forEach((b) => b.onclick = () => {
        try { window.MK_PLUGIN.execCommand(b.dataset.plugcmd); } catch (err) { alert('플러그인: ' + err.message); }
        PG.render();
      });
      const undoBtn = root.querySelector('[data-ed="undo"]'), redoBtn = root.querySelector('[data-ed="redo"]');
      if (undoBtn) undoBtn.onclick = () => { if (H.undo()) PG.render(); };
      if (redoBtn) redoBtn.onclick = () => { if (H.redo()) PG.render(); };
      if (!root._kbd) {
        root._kbd = true;
        root.addEventListener('keydown', (ev) => {
          if (!(ev.metaKey || ev.ctrlKey) || ev.key.toLowerCase() !== 'z') return;
          ev.preventDefault();
          if (ev.shiftKey ? H.redo() : H.undo()) PG.render();
        });
      }
      /* --- AI Dock --- */
      const say = (role, text, err) => { e.aiLog = (e.aiLog || []).concat([{ role, text, err: !!err }]).slice(-14); };
      const runAI = (cmd) => {
        const c = String(cmd || '').trim(); if (!c) return;
        say('me', c);
        const res = window.MK_AIED.run(c);
        /* Round 35 — 못 알아들으면 자연어 타임라인(MK_EASY)이 이어받는다: 같은 입력창, 패널 추가 0 */
        if (!res.ok && res.unknown && window.MK_EASY) {
          H.push('자연어 모션');
          const t = MK_EASY.timeline(c, doc, e.sceneIdx);
          if (t.ok) { say('ai', t.msg); PG.render(); const lg0 = document.getElementById('aidLog'); if (lg0) lg0.scrollTop = lg0.scrollHeight; return; }
          window.MK_HIST.undo();
        }
        say('ai', res.msg, !res.ok);
        PG.render();
        const lg = document.getElementById('aidLog'); if (lg) lg.scrollTop = lg.scrollHeight;
      };
      root.querySelectorAll('[data-cmd]').forEach((b) => b.onclick = () => runAI(b.dataset.cmd));
      const aiIn = root.querySelector('[data-ed="ai-in"]'), aiRun = root.querySelector('[data-ed="ai-run"]');
      if (aiRun) aiRun.onclick = () => runAI(aiIn && aiIn.value);
      if (aiIn) { aiIn.onkeydown = (ev) => { if (ev.key === 'Enter') runAI(aiIn.value); }; }
      /* --- Chart/Table 속성 실동작 --- */
      const ct = root.querySelector('[data-ed="chart-type"]');
      if (ct) ct.onchange = () => { H.push('차트 유형 변경'); doc.scenes[e.sceneIdx].elements[e.selEl].chartType = ct.value; PG.render(); };
      const dt = root.querySelector('[data-ed="data-title"]');
      if (dt) dt.onchange = () => { H.push('데이터 제목'); doc.scenes[e.sceneIdx].elements[e.selEl].title = dt.value; PG.render(); };
      const de = root.querySelector('[data-ed="data-edit"]');
      if (de) de.onchange = () => {
        H.push('데이터 수정');
        const el = doc.scenes[e.sceneIdx].elements[e.selEl];
        const rows = de.value.split('\n').map((l) => l.split(',').map((x) => x.trim())).filter((r) => r[0]);
        if (el.kind === 'chart') el.series = rows.map((r) => ({ k: r[0], v: parseFloat(r[1]) || 0 }));
        else el.rows = rows;
        PG.render();
      };
      const dc = root.querySelector('[data-ed="data-conv"]');
      if (dc) dc.onclick = () => {
        const el = doc.scenes[e.sceneIdx].elements[e.selEl];
        runAI(el.kind === 'chart' ? '차트를 표로' : '표를 차트로');
      };
      root.querySelector('[data-ed="back"]').onclick = () => PG.go(PG.state.create && PG.state.create.tpl ? 'create' : 'templates');
      const gh = root.querySelector('[data-ed="guard-home"]'); if (gh) gh.onclick = () => PG.go('home');
      root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { PG.state.variants[PG.state.screen] = b.dataset.tab; PG.render(); });
      root.querySelectorAll('[data-menu]').forEach((b) => b.onclick = () => { e.menu = b.dataset.menu; PG.render(); });
      root.querySelectorAll('[data-scene]').forEach((b) => b.onclick = () => { e.sceneIdx = +b.dataset.scene; e.selEl = null; PG.render(); });
      root.querySelectorAll('[data-el]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); e.selEl = +b.dataset.el; PG.render(); });
      root.querySelector('.ed-canvas').onclick = (ev) => { if (ev.target.classList.contains('ed-canvas')) { e.selEl = null; PG.render(); } };
      /* 줌 */
      root.querySelectorAll('[data-zoom]').forEach((b) => b.onclick = () => {
        if (b.dataset.zoom === 'in') e.zoom = Math.min(1.6, +(e.zoom + 0.1).toFixed(2));
        else if (b.dataset.zoom === 'out') e.zoom = Math.max(0.4, +(e.zoom - 0.1).toFixed(2));
        else e.zoom = 1;
        PG.render();
      });
      /* Toolbar 동작 */
      root.querySelector('[data-ed="save"]').onclick = () => {
        const cur = window.MK_PROJ && window.MK_PROJ.current(); if (cur) window.MK_PROJ.rename(cur.projectId, cur.name); /* rename=touch 겸용 — 수정일 갱신 */
        let real = false;
        if (window.MK_LIVE && !e.review) { real = MK_LIVE.saveDoc(doc); MK_LIVE.saveProjects(); }   /* R36 — 실저장 */
        e.savedAt = '방금'; document.getElementById('edSave').textContent = e.review ? '리뷰 모드 · 저장되지 않음' : (real ? '저장됨 · 방금' : '저장됨 · 방금(세션)');
      };
      /* R37 — 미리보기 = 실슬라이드쇼 (장면 순차·애니 실재생) */
      root.querySelector('[data-ed="preview"]').onclick = () => window.MK_PLAY.open(doc, { startIdx: 0 });
      const playBtn = root.querySelector('[data-ed="play"]');
      if (playBtn) playBtn.onclick = () => window.MK_PLAY.open(doc, { startIdx: e.sceneIdx });
      root.querySelector('[data-ed="share"]').onclick = () => M2.Modal.open(`<h2>공유</h2>
        <p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">보기 전용 링크 (Placeholder)</p>
        <div style="display:flex;gap:8px;margin:12px 0"><input class="mk-input" value="kmaker.app/v/abc123" readonly>${M2.Button({ label: '복사', kind: 'secondary' })}</div>
        <div style="text-align:right">${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })}</div>`);
      /* R37 — 내보내기 실동작: MK_RENDER 파이프라인 → PNG·SVG 실파일 다운로드 */
      const dl = (name, href) => { const a = document.createElement('a'); a.download = name; a.href = href; document.body.appendChild(a); a.click(); a.remove(); };
      const exName = (i, ext) => `${(doc.title || '케이메이커').replace(/[^\w가-힣 _-]/g, '')}-${i + 1}.${ext}`;
      const exMsg = (t) => { const m2 = document.getElementById('exMsg'); if (m2) m2.textContent = t; };
      const exportPng = async (si, scale) => {
        const dlist = window.MK_RENDER.renderScene(doc.scenes[si], {});
        const out = await window.MK_RENDER.toRaster(dlist, { format: 'png', scale });
        if (out && out.dataUrl) { dl(exName(si, 'png'), out.dataUrl); return true; }
        return false;
      };
      root.querySelector('[data-ed="export"]').onclick = () => M2.Modal.open(`<h2>내보내기</h2>
        <div class="ph-list" style="margin:12px 0">
          <button class="ph-item" data-ex="png1">PNG — 현재 장면</button>
          <button class="ph-item" data-ex="png2">PNG 2x — 현재 장면 (고해상도)</button>
          <button class="ph-item" data-ex="pngall">PNG — 전체 ${doc.scenes.length}장면</button>
          <button class="ph-item" data-ex="svg">SVG — 현재 장면 (벡터)</button>
        </div>
        <p id="exMsg" style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">PPT·PDF·MP4 실출력은 다음 이식 몫이에요.</p>
        <div style="text-align:right;margin-top:10px">${M2.Button({ label: '닫기', attrs: 'onclick="MK.Modal.close()"' })}</div>`,
      ) || setTimeout(() => {
        document.querySelectorAll('[data-ex]').forEach((b) => b.onclick = async () => {
          try {
            exMsg('만드는 중…');
            if (b.dataset.ex === 'svg') {
              const svg = window.MK_RENDER.toSVG(window.MK_RENDER.renderScene(doc.scenes[e.sceneIdx], {}));
              dl(exName(e.sceneIdx, 'svg'), 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
              exMsg('SVG 저장 완료');
            } else if (b.dataset.ex === 'pngall') {
              for (let i = 0; i < doc.scenes.length; i++) { await exportPng(i, 2); exMsg(`저장 중… ${i + 1}/${doc.scenes.length}`); }
              exMsg(`전체 ${doc.scenes.length}장면 저장 완료`);
            } else {
              await exportPng(e.sceneIdx, b.dataset.ex === 'png2' ? 2 : 1);
              exMsg('PNG 저장 완료');
            }
          } catch (err) { exMsg('실패: ' + err.message); }
        });
      }, 0);
      /* Scene 조작 */
      root.querySelectorAll('[data-op]').forEach((b) => b.onclick = (ev) => {
        ev.stopPropagation();
        const i = +b.dataset.i, sc = doc.scenes;
        H.push(b.dataset.op === 'dup' ? '장면 복제' : '장면 삭제');
        if (b.dataset.op === 'dup') { const c = JSON.parse(JSON.stringify(sc[i])); c.name += ' 복제'; sc.splice(i + 1, 0, c); e.sceneIdx = i + 1; }
        else if (sc.length > 1) { sc.splice(i, 1); e.sceneIdx = Math.min(e.sceneIdx, sc.length - 1); }
        e.selEl = null; PG.render();
      });
      const add = root.querySelector('[data-ed="add"]');
      if (add) add.onclick = () => {
        H.push('장면 추가');
        const base = doc.scenes[doc.scenes.length - 1];
        doc.scenes.push({ ...JSON.parse(JSON.stringify(base)), name: '새 장면', elements: [{ kind: 'text', x: 10, y: 40, w: 80, size: 6, text: '내용을 입력하세요', weight: 700 }] });
        e.sceneIdx = doc.scenes.length - 1; e.selEl = null; PG.render();
      };
      /* 더미 편집 */
      const te = root.querySelector('[data-ed="text-edit"]');
      if (te) { te.onfocus = () => H.push('텍스트 편집'); te.oninput = () => {
        doc.scenes[e.sceneIdx].elements[e.selEl].text = te.value;
        const cv = root.querySelector(`.ed-el[data-el="${e.selEl}"] .ed-txt`) || root.querySelector(`.ed-el[data-el="${e.selEl}"]`);
        if (cv) cv.textContent = te.value;
      }; }
      const sw = root.querySelector('[data-ed="img-swap"]');
      if (sw) sw.onclick = () => {
        if (window.MK_LIVE) {                            /* R36 — 진짜 파일 선택 → 실이미지 교체 */
          const inp = document.createElement('input');
          inp.type = 'file'; inp.accept = 'image/*,video/*';
          inp.onchange = () => MK_LIVE.fileToSrc(inp.files && inp.files[0], (src, err) => {
            if (err) return alert(err);
            if (!src) return;
            const f = inp.files[0];
            H.push('이미지 교체');
            MK_LIVE.replaceWithSrc(doc, e.sceneIdx, e.selEl, { name: f.name.replace(/\.[^.]+$/, ''), kind: /^video\//.test(f.type) ? 'video' : 'image', src });
            PG.render();
          });
          inp.click();
          return;
        }
        window.MK_AIED.run('이미지 교체'); PG.render();
      };
      const dur = root.querySelector('[data-ed="dur"]');
      if (dur) dur.onchange = () => { doc.scenes[e.sceneIdx].duration = Math.max(1, Math.min(30, +dur.value || 1)); PG.render(); };

      /* ================= Round 35 — MK_EASY 라이브 배선 (전부 가드·추가만) ================= */
      if (window.MK_EASY) {
        /* F2 — 빠른동작 알약 */
        root.querySelectorAll('[data-easyq]').forEach((b) => b.onclick = (ev) => {
          ev.stopPropagation();
          H.push('빠른동작 — ' + b.dataset.easyq);
          const r = MK_EASY.quickRun(doc, e.sceneIdx, e.selEl, b.dataset.easyq);
          if (r.deselect) e.selEl = null;
          PG.render();
          if (r.edit) { const te2 = document.querySelector('[data-ed="text-edit"]'); if (te2) te2.focus(); }
        });
        /* F5 — 호버 칩 */
        const cv = root.querySelector('.ed-canvas');
        let chip = null;
        const hideChip = () => { if (chip) { chip.remove(); chip = null; } };
        root.querySelectorAll('.ed-el').forEach((elDom) => {
          elDom.addEventListener('mouseenter', () => {
            const i = +elDom.dataset.el;
            if (i === e.selEl) return;
            hideChip();
            const el = doc.scenes[e.sceneIdx].elements[i]; if (!el) return;
            chip = document.createElement('div');
            chip.className = 'ed-hoverchip';
            chip.innerHTML = MK_EASY.hoverFor(el).map((h2) => `<button data-easyh="${h2.id}" data-i="${i}">${h2.icon} ${h2.label}</button>`).join('');
            chip.style.left = el.x + '%'; chip.style.top = Math.max(0, el.y - 6) + '%';
            cv.appendChild(chip);
            chip.querySelectorAll('[data-easyh]').forEach((b) => b.onclick = (ev) => {
              ev.stopPropagation();
              const idx = +b.dataset.i;
              H.push('호버 — ' + b.dataset.easyh);
              if (b.dataset.easyh === 'edit') { e.selEl = idx; PG.render(); const te2 = document.querySelector('[data-ed="text-edit"]'); if (te2) te2.focus(); return; }
              MK_EASY.quickRun(doc, e.sceneIdx, idx, b.dataset.easyh === 'replace' ? 'replace' : 'delete');
              if (b.dataset.easyh === 'delete' && e.selEl === idx) e.selEl = null;
              PG.render();
            });
          });
          elDom.addEventListener('mouseleave', (ev) => {
            if (chip && ev.relatedTarget && chip.contains(ev.relatedTarget)) return;
            setTimeout(hideChip, 150);
          });
        });
        /* F1 — 캔버스 드롭 스마트 교체 (파일·자산 드래그 공용) */
        if (cv) {
          cv.addEventListener('dragover', (ev) => { ev.preventDefault(); cv.classList.add('ed-dropping'); });
          cv.addEventListener('dragleave', () => cv.classList.remove('ed-dropping'));
          cv.addEventListener('drop', (ev) => {
            ev.preventDefault(); cv.classList.remove('ed-dropping');
            const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
            const hit = ev.target.closest && ev.target.closest('[data-el]');
            const hitIdx = hit ? +hit.dataset.el : null;
            const apply = (media) => {
              H.push('드롭 교체');
              const rep = (window.MK_LIVE && media.src) ? MK_LIVE.replaceWithSrc : MK_EASY.replace;
              const ins = (window.MK_LIVE && media.src) ? MK_LIVE.insertWithSrc : MK_EASY.insertMedia;
              const r = hitIdx != null ? rep(doc, e.sceneIdx, hitIdx, media) : ins(doc, e.sceneIdx, media);
              if (!r.ok && hitIdx != null) ins(doc, e.sceneIdx, media);   /* 텍스트 위 드롭 → 옆에 삽입 */
              PG.render();
            };
            if (f && window.MK_LIVE) {                    /* R36 — 실파일: dataURL로 읽어 실표시 */
              MK_LIVE.fileToSrc(f, (src, err) => {
                apply({ name: f.name.replace(/\.[^.]+$/, ''), kind: /^video\//.test(f.type) ? 'video' : 'image', src: src || undefined });
                if (err) alert(err);
              });
              return;
            }
            apply(f ? { name: f.name.replace(/\.[^.]+$/, ''), kind: /^video\//.test(f.type) ? 'video' : 'image' }
                    : { name: '드롭한 미디어', kind: 'image' });
          });
        }
      }

      /* ================= R36 이식 라운드 — 실편집·영속 (MK_LIVE, 전부 가드·추가만) ================= */
      if (window.MK_LIVE) {
        const L = window.MK_LIVE;
        const cv2 = root.querySelector('.ed-canvas');
        const scene2 = () => doc.scenes[e.sceneIdx];
        const nowStr = () => { const d2 = new Date(); return String(d2.getHours()).padStart(2, '0') + ':' + String(d2.getMinutes()).padStart(2, '0'); };
        const markSaved = (t) => { const n = document.getElementById('edSave'); if (n) n.textContent = t; };
        if (!doc.id) doc.id = doc.templateId || doc.projectId || 'local-doc';   /* 영속 키 보장 */

        /* --- 자동저장 훅: 모든 편집 경로(H.push·undo·redo)가 지나가는 길목 1곳 --- */
        if (!H._liveHook) {
          H._liveHook = true;
          ['push', 'undo', 'redo'].forEach((k) => {
            const orig = H[k].bind(H);
            H[k] = (...a) => {
              const r = orig(...a);
              const ee = PG.state.editor;
              if (ee && ee.doc && !ee.review) {
                markSaved('저장 중…');
                L.autosave(ee.doc, { review: false, onSaved: () => { ee.savedAt = nowStr(); markSaved('저장됨 · ' + ee.savedAt); } });
              }
              return r;
            };
          });
        }

        /* --- 복원: 같은 doc을 다시 열면 저장본에서 이어서 (리뷰·프로젝트 열람 제외, doc당 1회) --- */
        if (!e.review && doc.id && e._restoredFor !== doc.id && !(window.MK_PROJ && MK_PROJ.current())) {
          e._restoredFor = doc.id;
          const sv = L.loadDoc(doc.id);
          if (sv && sv.doc && sv.doc.scenes && JSON.stringify(sv.doc) !== JSON.stringify(doc)) {
            e.doc = sv.doc;
            e.sceneIdx = Math.min(e.sceneIdx, sv.doc.scenes.length - 1);
            e.selEl = null;
            e.savedAt = nowStr();
            PG.render();
            return;
          }
        }

        if (cv2 && !cv2._live) {
          cv2._live = true;

          /* --- 스냅 가이드 라인 --- */
          const gV = document.createElement('i'); gV.className = 'ed-guide gv';
          const gH = document.createElement('i'); gH.className = 'ed-guide gh';
          const showG = (g) => {
            if (g.v != null) { gV.style.left = g.v + '%'; if (!gV.parentNode) cv2.appendChild(gV); } else if (gV.parentNode) gV.remove();
            if (g.h != null) { gH.style.top = g.h + '%'; if (!gH.parentNode) cv2.appendChild(gH); } else if (gH.parentNode) gH.remove();
          };
          const hideG = () => { if (gV.parentNode) gV.remove(); if (gH.parentNode) gH.remove(); };

          const GEO = ['x', 'y', 'w', 'h', 'size', 'rot'];
          const pickGeo = (el) => { const o = {}; GEO.forEach((k) => { if (el[k] != null) o[k] = el[k]; }); return o; };
          const putGeo = (el, g) => { GEO.forEach((k) => { if (g[k] != null) el[k] = g[k]; else delete el[k]; }); };
          const paint = (n, el) => {
            n.style.left = el.x + '%'; n.style.top = el.y + '%'; n.style.width = el.w + '%';
            if (el.kind !== 'text' && el.h != null) n.style.height = el.h + '%';
            n.style.transform = el.rot ? `rotate(${el.rot}deg)` : '';
            if (el.kind === 'text' && el.size != null) n.style.fontSize = (el.size / 100 * cv2.clientHeight).toFixed(1) + 'px';
          };

          let ges = null;   /* {type, i, handle, start, sx, sy, rect, moved} */
          cv2.addEventListener('pointerdown', (ev) => {
            if (ev.button !== undefined && ev.button !== 0) return;
            const t = ev.target;
            if (t.isContentEditable || (t.closest && t.closest('[contenteditable]'))) return;
            const hd = t.closest && t.closest('.hd');
            const elDom = t.closest && t.closest('[data-el]');
            if (!elDom || (t.closest && t.closest('.ed-quickpill'))) return;
            const i = +elDom.dataset.el;
            const el = scene2().elements[i]; if (!el) return;
            e.selEl = i;
            const rect = cv2.getBoundingClientRect();
            const base = { type: 'move', i, start: pickGeo(el), sx: ev.clientX, sy: ev.clientY, rect, moved: false };
            if (hd) {
              const cls = [...hd.classList].find((c) => c !== 'hd');
              ges = { ...base, type: cls === 'rot' ? 'rotate' : 'resize', handle: cls };
            } else ges = base;
            if (cv2.setPointerCapture && ev.pointerId != null) { try { cv2.setPointerCapture(ev.pointerId); } catch (_) {} }
            ev.preventDefault();
          });

          const onMove = (ev) => {
            if (!ges) return;
            const el = scene2().elements[ges.i]; if (!el) { ges = null; return; }
            const rw = ges.rect.width || 1, rh = ges.rect.height || 1;
            const dx = (ev.clientX - ges.sx) / rw * 100;
            const dy = (ev.clientY - ges.sy) / rh * 100;
            if (Math.abs(dx) + Math.abs(dy) > 0.15) ges.moved = true;
            if (ges.type === 'move') {
              L.dragTo(el, ges.start.x, ges.start.y, dx, dy);
              showG(L.snap(el, scene2().elements.filter((_, j) => j !== ges.i)));
            } else if (ges.type === 'resize') {
              L.resizeTo(el, ges.handle, ges.start, dx, dy, { aspect: ev.shiftKey });
            } else {
              const cx = ges.rect.left + (el.x + (el.w || 10) / 2) / 100 * rw;
              const cy = ges.rect.top + (el.y + (el.h || 8) / 2) / 100 * rh;
              L.rotateTo(el, cx, cy, ev.clientX, ev.clientY);
            }
            const n = cv2.querySelector(`[data-el="${ges.i}"]`);
            if (n) paint(n, el);
          };
          const onUp = () => {
            if (!ges) return;
            hideG();
            const g0 = ges; ges = null;
            const el = scene2().elements[g0.i];
            if (!el) { PG.render(); return; }
            if (g0.moved) {
              const post = pickGeo(el);
              putGeo(el, g0.start);                      /* 되돌릴 지점 = 제스처 시작 상태 */
              H.push(g0.type === 'move' ? '이동' : g0.type === 'resize' ? '크기 조절' : '회전');
              putGeo(el, post);
            }
            PG.render();                                  /* 선택 상태·핸들·알약 반영 */
          };
          cv2.addEventListener('pointermove', onMove);
          cv2.addEventListener('pointerup', onUp);
          cv2.addEventListener('pointercancel', onUp);
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);

          /* --- 더블클릭 = 인라인 텍스트 편집 (캔버스에서 바로) --- */
          cv2.addEventListener('dblclick', (ev) => {
            const n = ev.target.closest && ev.target.closest('[data-editable]');
            if (!n) return;
            const i = +n.dataset.el;
            const el = scene2().elements[i]; if (!el || el.kind !== 'text') return;
            const span = n.querySelector('.ed-txt'); if (!span) return;
            e.selEl = i;
            try { span.contentEditable = 'plaintext-only'; } catch (_) {}
            if (span.contentEditable !== 'plaintext-only') { try { span.contentEditable = 'true'; } catch (_) {} }
            span.setAttribute('contenteditable', span.contentEditable === 'plaintext-only' ? 'plaintext-only' : 'true');   /* 속성 반영 보장 */
            span.focus();
            try { const r = document.createRange(); r.selectNodeContents(span); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (_) {}
            let done = false;
            const finish = (cancel) => {
              if (done) return; done = true;
              span.removeAttribute('contenteditable');
              const t2 = cancel ? el.text : (span.innerText != null ? span.innerText : span.textContent);
              if (!cancel && t2 !== el.text) { H.push('텍스트 편집'); L.editText(el, t2); }
              PG.render();
            };
            span.onblur = () => finish(false);
            span.onkeydown = (ke) => {
              ke.stopPropagation();
              if (ke.key === 'Enter' && !ke.shiftKey) { ke.preventDefault(); finish(false); }
              if (ke.key === 'Escape') { ke.preventDefault(); finish(true); }
            };
          });
        }

        /* --- 키보드: 화살표 이동(Shift=크게)·Delete 삭제·Ctrl/Cmd+D 복제 --- */
        if (!document._liveKbd) {
          document._liveKbd = true;
          document.addEventListener('keydown', (ev) => {
            if (PG.state.screen !== 'editor' && PG.state.screen !== 'review') return;
            const ee = PG.state.editor; if (!ee || !ee.doc || ee.selEl == null) return;
            const tg = ev.target;
            if (tg && (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName) || tg.isContentEditable)) return;
            const sc = ee.doc.scenes[ee.sceneIdx];
            const el = sc && sc.elements[ee.selEl]; if (!el) return;
            if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'd') {
              ev.preventDefault();
              H.push('복제');
              ee.selEl = L.dupEl(sc, ee.selEl);
              PG.render(); return;
            }
            if (ev.key === 'Delete' || ev.key === 'Backspace') {
              ev.preventDefault();
              H.push('삭제');
              L.removeEl(sc, ee.selEl); ee.selEl = null;
              PG.render(); return;
            }
            if (/^Arrow(Left|Right|Up|Down)$/.test(ev.key)) {
              ev.preventDefault();
              if (!ee._nudging) { H.push('이동'); ee._nudging = true; setTimeout(() => { ee._nudging = false; }, 900); }
              L.nudge(el, ev.key, ev.shiftKey);
              const n = document.querySelector(`.ed-canvas [data-el="${ee.selEl}"]`);
              if (n) { n.style.left = el.x + '%'; n.style.top = el.y + '%'; }
              const ee2 = PG.state.editor;
              L.autosave(ee2.doc, { review: !!ee2.review, onSaved: () => markSaved('저장됨 · ' + nowStr()) });
            }
          });
        }
      }
    },
  };
})();

/* ============================================================
   Review Mode — #/review (디자인 검수 전용)
   무로그인·더미 데이터·읽기 전용(세션 내 조작 가능, 저장만 차단).
   샘플 자동 로드 + 전 패널 노출 + 요소 선택 상태로 시작 + 고급 펼침.
   ============================================================ */
window.MK_SCREENS.review = (() => {
  const E = () => window.MK_SCREENS.editor;
  return {
    title: 'Editor — Review Mode', variants: ['Design', 'Video'], flush: true, chromeless: true,
    render(v) {
      const e = PG.state.editor;
      if (!e.doc || !e.review) {
        PG.loadEditorDoc('tpl-pr-presentation-01');
        e.review = true;
        const firstText = PG.state.editor.doc.scenes[0].elements.findIndex((el) => el.kind === 'text');
        e.selEl = firstText >= 0 ? firstText : 0;    /* 제목 선택 상태로 시작 — 우측 속성 폼 즉시 노출 */
        e.menu = e.menu || 'text';
      }
      return E().render(v);
    },
    mount(root) {
      E().mount(root);
      root.querySelector('.ed').classList.add('ed--review');
      /* 저장 차단 — 리뷰 모드의 유일한 제약 */
      const save = root.querySelector('[data-ed="save"]');
      const state = root.querySelector('#edSave');
      if (state) { state.textContent = '리뷰 모드 · 저장되지 않음'; state.style.color = 'var(--mk-coral)'; }
      if (save) save.onclick = () => { if (state) state.textContent = '리뷰 모드 — 저장하지 않습니다'; };
      /* 검수 편의 — 고급 섹션 펼침 */
      root.querySelectorAll('details.ed-adv').forEach((d) => { d.open = true; });
      /* 배지 */
      const tb = root.querySelector('.ed-toolbar');
      if (tb && !tb.querySelector('.ed-review-badge')) {
        const b = document.createElement('span');
        b.className = 'ed-review-badge';
        b.textContent = 'REVIEW';
        tb.insertBefore(b, tb.querySelector('.ed-tb-file'));
        const wm = document.createElement('span');
        wm.className = 'ed-brandmark';
        wm.textContent = 'K-MAKER';
        tb.insertBefore(wm, b);
      }
      /* 나가기 → 리뷰 홈이 아닌 Home으로 (검수 동선 단순화) */
      const back = root.querySelector('[data-ed="back"]');
      if (back) back.onclick = () => PG.go('home');
    },
  };
})();
