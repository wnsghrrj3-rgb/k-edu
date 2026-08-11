/* ============================================================
   K-MAKER Workspace v1  (#/workspace)
   ------------------------------------------------------------
   프로젝트를 열었을 때 모든 제작이 이루어지는 **핵심 작업 공간**.
   Editor(#/editor)는 Workspace 안의 편집 기능 — 기존 화면은 유지.
   흐름: 프로젝트→Scene→편집→AI→Asset→미리보기→Export 를 한 허브로.
   ------------------------------------------------------------
   구역 = 독립 렌더 함수 (GPT 시안 = 함수 단위 교체):
     TopBar / QuickActions / NavRail / NavPanel / CanvasArea /
     ContextPanel / FooterBar / AIDock
   상태 = WS (project·sceneIdx·sel·mode·zoom·nav·dock·undo/redo)
   모드 4종: design · presentation · video · photo — 모드별 UI 차등.
   ⚠ Placeholder — 실편집·실렌더링·실AI 없음. 구조·상태 관리 검증용.
   ============================================================ */
(() => {
  const M = () => window.MK;

  /* ================= 상태 ================= */
  const WS = {
    projectId: null, sceneIdx: 0,
    sel: null,              /* null=프로젝트 | {type:'scene'} | {type:'text'|'image'|'video'|'shape', idx} */
    mode: 'design',         /* design | presentation | video | photo */
    msel: [],               /* R103 — Shift 다중 선택 (상태 기본값 — enter 없이도 안전) */
    crop: null,             /* R105 — 자르기 모드 {idx, sc, d:{x,y,w,h}} (초안 — 확인 전 문서 무변형) */
    focal: null,            /* R106 — 세밀 초점 모드 {idx, sc, d:{x,y}, nar} (초안 — 확인 전 문서 무변형) */
    zoom: 100, nav: 'scenes', dock: false,
    undo: [], redo: [], savedAt: null, svarMsg: '', notice: '', smartMsg: '',
  };
  const proj = () => window.MK_PROJ.get(WS.projectId);
  const doc = () => proj()?.doc;
  const scene = () => doc()?.scenes[WS.sceneIdx];

  const MODES = [['design', 'Design'], ['presentation', 'Presentation'], ['video', 'Video'], ['photo', 'Photo']];
  const modeOf = (ct) => ct === 'video' ? 'video' : ct === 'presentation' ? 'presentation' : 'design';

  /* undo/redo — doc 스냅샷 (placeholder 구조) */
  const snap = () => {
    WS.undo.push(JSON.stringify(doc().scenes)); if (WS.undo.length > 30) WS.undo.shift(); WS.redo = [];
    /* R66 §23 — 자동 구성 문서에서 사용자가 손댄 장면은 이후 재구성이 덮지 않는다 */
    const d = doc();
    if (window.MK_SVARX && d && d.meta && d.meta.svar) { const sc = d.scenes[WS.sceneIdx]; if (sc) window.MK_SVARX.markEdited(d, sc.id); }
  };
  const undo = () => { if (!WS.undo.length) return; WS.redo.push(JSON.stringify(doc().scenes)); doc().scenes = JSON.parse(WS.undo.pop()); WS.sceneIdx = Math.min(WS.sceneIdx, doc().scenes.length - 1); };
  const redo = () => { if (!WS.redo.length) return; WS.undo.push(JSON.stringify(doc().scenes)); doc().scenes = JSON.parse(WS.redo.pop()); WS.sceneIdx = Math.min(WS.sceneIdx, doc().scenes.length - 1); };

  /* 외부 진입 API — MK_PROJ.open이 호출 */
  window.MK_WS = {
    enter(projectId) {
      WS.projectId = projectId; WS.sceneIdx = 0; WS.sel = null;
      WS.undo = []; WS.redo = []; WS.savedAt = null; WS.dock = false; WS.nav = 'scenes';
      WS.msel = [];                                    /* R103 — Shift 다중 선택 (씬 이동·재진입 시 초기화) */
      WS.crop = null;                                  /* R105 — 자르기 모드 재진입 시 종료 */
      WS.focal = null;                                 /* R106 — 세밀 초점 모드 재진입 시 종료 */
      /* R93 — 빌드 정직 안내는 차단형 alert 가 아니라 이 자리 한 줄로.
         (준호 실기기: 「생략: ss-title」 OS 경고창이 에러처럼 읽히고 흐름을 끊음) */
      WS.notice = window.MK_WS && window.MK_WS.pendingNotice ? String(window.MK_WS.pendingNotice) : '';
      if (window.MK_WS) window.MK_WS.pendingNotice = '';
      WS.mode = modeOf(window.MK_PROJ.get(projectId)?.contentType);
      WS.zoom = 100;
      PG.go('workspace');
    },
    state: WS,
  };

  /* ================= 상단: TopBar + Quick Actions ================= */
  const QUICK = [['scene', '＋ Scene'], ['text', '＋ Text'], ['image', '＋ Image'], ['video', '＋ Video'], ['shape', '＋ Shape'], ['ai', '＋ AI']];
  const TopBar = () => {
    const m = M(), p = proj();
    return `<div class="ws-top">
      ${m.IconButton({ icon: '←', tip: '내 프로젝트로', attrs: 'data-ws="back"' })}
      <div class="pjname"><b>${m.esc(p.name)}</b><small id="wsSave">${WS.savedAt ? '자동 저장됨 · ' + WS.savedAt : '자동 저장 대기'}</small></div>
      <div class="quick">${QUICK.map(([k, l]) => `<button class="qk" data-ws-q="${k}">${l}</button>`).join('')}</div>
      <span class="grow"></span>
      ${m.IconButton({ icon: '↺', tip: '실행 취소', attrs: `data-ws="undo" ${WS.undo.length ? '' : 'disabled'}` })}
      ${m.IconButton({ icon: '↻', tip: '다시 실행', attrs: `data-ws="redo" ${WS.redo.length ? '' : 'disabled'}` })}
      ${m.Button({ label: '미리보기', kind: 'secondary', size: 'sm', attrs: 'data-ws="preview"' })}
      ${m.Button({ label: p.shared ? '공유 중' : '공유', kind: 'secondary', size: 'sm', attrs: 'data-ws="share"' })}
      ${m.Button({ label: '내보내기', kind: 'accent', size: 'sm', attrs: 'data-ws="export"' })}
      ${m.IconButton({ icon: '✦', tip: 'AI Dock', on: WS.dock, attrs: 'data-ws="dock"' })}
    </div>${WS.notice ? `<div class="ws-notice" style="font:var(--mk-t-caption);color:var(--mk-text-secondary);background:var(--mk-surface-2,#F2EFE8);border-bottom:1px solid var(--mk-border);padding:7px 16px">📋 ${m.esc(WS.notice)} <button data-ws="notice-x" style="border:none;background:none;cursor:pointer;color:inherit;font:inherit;padding:0 2px;margin-left:6px">닫기 ✕</button></div>` : ''}`;
  };

  /* ================= 좌: Nav Rail + Nav Panel ================= */
  const NAVS = [['scenes', '▦', 'Scenes'], ['templates', '📐', 'Templates'], ['assets', '🖼', 'Assets'], ['ai', '✦', 'AI'], ['comments', '💬', 'Comments'], ['history', '⟲', 'History']];
  const NavRail = () => `<div class="ws-rail">${NAVS.map(([k, i, n]) =>
    `<button class="${WS.nav === k ? 'on' : ''}" data-ws-nav="${k}"><span class="ico">${i}</span><span class="nm">${n}</span></button>`).join('')}</div>`;

  const NavPanel = () => {
    const m = M(), d = doc();
    if (WS.nav === 'scenes') {
      return `<h3>Scenes <small>${d.scenes.length}장</small></h3>
        <div class="ws-scenes">${d.scenes.map((s, i) => m.SceneCard(s, i, i === WS.sceneIdx, `data-ws-sc="${i}"`)).join('')}</div>
        ${m.Button({ label: '＋ Scene 추가', kind: 'secondary', size: 'sm', attrs: 'data-ws-q="scene" style="width:100%;justify-content:center;margin-top:8px"' })}`;
    }
    if (WS.nav === 'templates') {
      const list = window.MK_TPL.list().filter((t) => t.contentType === d.contentType).slice(0, 4);
      return `<h3>Templates</h3><p class="mut">같은 유형 템플릿 — 적용은 후속</p>
        <div class="ws-minitpl">${list.map((t) => m.TemplateCard(t, `data-ws-tpl="${t.templateId}"`, { aiRec: t.ai.recommended })).join('')}</div>`;
    }
    if (WS.nav === 'assets') {
      const cats = window.MK_ASSETS.CATEGORIES.filter((c) => !c.virtual).slice(0, 6);
      const list = window.MK_ASSETS.ASSETS.slice(0, 8);
      return `<h3>Assets</h3><p class="mut">누르면 캔버스에 추가 (placeholder)</p>
        <div class="ws-miniassets">${list.map((a) => `<button class="mini" data-ws-asset="${a.id}">${m.assetThumb(a)}</button>`).join('')}</div>
        <p class="mut" style="margin-top:8px">전체는 Asset Browser에서 — <button class="lnk" data-ws-go="assets">열기 →</button></p>`;
    }
    if (WS.nav === 'ai') {
      return `<h3>AI</h3><p class="mut">오른쪽 AI Dock에서 프로젝트를 함께 봐요</p>
        ${m.Button({ label: '✦ AI Dock 열기', size: 'sm', attrs: 'data-ws="dock" style="width:100%;justify-content:center"' })}
        <div class="ws-aihist"><h4>이 프로젝트의 AI 기록</h4>
        ${proj().aiHistory.length ? proj().aiHistory.slice().reverse().map((h) => `<div class="row"><b>${m.esc(h.action)}</b><small>「${m.esc(h.prompt)}」</small></div>`).join('') : '<p class="mut">아직 없어요</p>'}</div>`;
    }
    if (WS.nav === 'comments') {
      return `<h3>Comments</h3><p class="mut">협업 코멘트 — 후속 단계 자리표시</p>
        <div class="ws-comment ph"><b>동료 교사</b><p>2번 장 제목이 조금 길어 보여요!</p><small>예시 코멘트</small></div>
        <div class="ws-comment ph"><b>나</b><p>@AI 문장 짧게 부탁해요</p><small>예시 코멘트</small></div>`;
    }
    /* history */
    const hist = [
      ...(WS.savedAt ? [{ t: '수동 저장', s: WS.savedAt }] : []),
      ...proj().aiHistory.map((h) => ({ t: 'AI: ' + h.action, s: window.MK_PROJ.ago(h.at) })),
      ...proj().exportHistory.map((h) => ({ t: h.format + ' 내보냄', s: window.MK_PROJ.ago(h.at) })),
      { t: '프로젝트 생성', s: window.MK_PROJ.ago(proj().createdAt) },
    ];
    return `<h3>History</h3><p class="mut">버전 복원은 후속 단계</p>
      <div class="ws-hist">${hist.map((h) => `<div class="row"><span class="dot"></span><div><b>${m.esc(h.t)}</b><small>${m.esc(h.s)}</small></div></div>`).join('')}</div>`;
  };

  /* ================= 중앙: Canvas ================= */
  const BASE_W = 560;
  let lastTap = null;    /* R106 — 더블탭 감지 {i, t} — 렌더마다 재배선돼도 살아남게 모듈 스코프 (dblclick 은 preventDefault 지형에서 못 믿는다) */
  /* R55 — 선택 핸들: 코너 4 + 좌우변 2 (리사이즈는 MK_LIVE.resizeTo, #/editor R36 동일 규약) */
  const WSHD = '<i class="ws-hd tl"></i><i class="ws-hd tr"></i><i class="ws-hd bl"></i><i class="ws-hd br"></i><i class="ws-hd ml"></i><i class="ws-hd mr"></i>'
    + '<i class="ws-rh" data-ws-rh title="회전"></i>';   /* R107 — 회전 손잡이. .ws-hd 6개 계약(R55) 은 건드리지 않는다 */
  /* R107 — 회전 표시. rot=0 이면 빈 문자열 = 회전 이전과 바이트 동일 */
  const rotDeg = (el) => (window.MK_LIVE && window.MK_LIVE.rotOf ? window.MK_LIVE.rotOf(el) : 0);
  const rotSty = (el) => { const d = rotDeg(el); return d ? `;transform:rotate(${d}deg)` : ''; };
  /* R108 — 텍스트만 모델에 높이가 없다. 브라우저는 실측 박스 중심으로 돌리고
     export(render.js frameOf)는 추정 높이 중심으로 돌리므로, 둘이 다르면 회전한 글자가
     화면과 결과물에서 다른 자리에 앉는다. 화면을 export 의 축에 맞춘다. */
  /* R111 — 씬 종횡비. 모델이 자동 줄바꿈을 아는 데 필요한 유일한 수 (probe111 §①). */
  const sar = () => { const s2 = scene() || { width: 16, height: 9 };
    return (+s2.width > 0 && +s2.height > 0) ? s2.width / s2.height : 16 / 9; };
  const rotStyText = (el, CH) => {
    const d = rotDeg(el); if (!d) return '';
    const L = window.MK_LIVE;
    const hpx = (L && L.textH ? L.textH(el, sar()) : 0) / 100 * CH;   /* R111 — 줄바꿈 반영 축 */
    return `;transform:rotate(${d}deg);transform-origin:50% ${(hpx / 2).toFixed(1)}px`;
  };
  /* R110 — 텍스트 상자가 모델 높이를 입는다.
     여태 이 div 는 브라우저 자동 높이(CSS line-height 1.3 · 자동 줄바꿈)로 서 있었는데,
     리사이즈·스냅·정렬·간격·export(render.js frameOf)는 전부 모델 높이 textH 를 쓴다.
     그래서 손잡이가 앉은 자리와 실제로 움직이는 상자가 서로 달랐다 — 1줄 6% 글자에서
     DOM 은 7.8%, 모델은 9.0%. 상자를 정본에 맞춰 둘을 하나로 만든다.
     글자 자체는 종전과 똑같이 위에서부터 흐른다: overflow:visible 은 export 의
     기본 overflow 규약과 같아서, 넘치면 넘치는 그대로가 결과물과 같은 그림이다.

     R111 — 그리고 그 모델 높이가 이제 자동 줄바꿈까지 센다. R110 이 정직하게 적어둔
     「textH 는 개행만 세므로 넘칠 수 있다」가 여기서 갚인다: 상자가 흐른 줄만큼 자라서
     손잡이·스냅·정렬·간격이 눈에 보이는 글자 덩어리를 그대로 잡는다. */
  const textBoxSty = (el) => {
    const L = window.MK_LIVE;
    if (!L || !L.textH) return '';
    return `;height:${(+L.textH(el, sar())).toFixed(3)}%;overflow:visible`;
  };
  /* 캔버스 실픽셀 — 회전 수학은 % 가 아니라 px 공간에서만 성립한다 */
  const cpx = () => { const s2 = scene() || { width: 16, height: 9 };
    const CW = Math.round(BASE_W * WS.zoom / 100); return { CW, CH: Math.round(CW * s2.height / s2.width) }; };
  /* R105 — 자르기 오버레이 조각 (스크림 4 + 상자 + 코너 4 + 확인 바) */
  const cropLayer = (d) => {
    const P = (v) => (Math.max(0, v) * 100).toFixed(2);
    return `<div class="ws-croplay" data-ws-croplay>
      <i class="sc" style="left:0;top:0;width:100%;height:${P(d.y)}%"></i>
      <i class="sc" style="left:0;top:${P(d.y + d.h)}%;width:100%;height:${P(1 - d.y - d.h)}%"></i>
      <i class="sc" style="left:0;top:${P(d.y)}%;width:${P(d.x)}%;height:${P(d.h)}%"></i>
      <i class="sc" style="left:${P(d.x + d.w)}%;top:${P(d.y)}%;width:${P(1 - d.x - d.w)}%;height:${P(d.h)}%"></i>
      <div class="ws-crbox" data-ws-crbox style="left:${P(d.x)}%;top:${P(d.y)}%;width:${P(d.w)}%;height:${P(d.h)}%">
        <i class="ws-crh tl" data-ws-crh="tl"></i><i class="ws-crh tr" data-ws-crh="tr"></i>
        <i class="ws-crh bl" data-ws-crh="bl"></i><i class="ws-crh br" data-ws-crh="br"></i></div>
      <div class="ws-cropbar"><button data-ws-crok>✓ 자르기</button><button data-ws-crno>✕ 취소</button></div>
    </div>`;
  };
  /* R106 — 세밀 초점 오버레이 (마커 + 확인 바). 스크림 없음 — 사진이
     실시간으로 미끄러지는 게 그 자체로 미리보기다 */
  const focalLayer = (d) => {
    const P = (v) => (Math.max(0, Math.min(1, v)) * 100).toFixed(2);
    return `<div class="ws-folay" data-ws-folay>
      <i class="ws-fopt" data-ws-fopt style="left:${P(d.x)}%;top:${P(d.y)}%"></i>
      <div class="ws-cropbar"><button data-ws-fook>✓ 초점</button><button data-ws-fono>✕ 취소</button></div>
    </div>`;
  };
  const CanvasArea = () => {
    const sc = scene();
    /* R105 — 장면 이동·요소 소실·사진 아님이면 자르기 모드 자동 종료 */
    if (WS.crop && (WS.crop.sc !== WS.sceneIdx || !sc.elements[WS.crop.idx] || !sc.elements[WS.crop.idx].src)) WS.crop = null;
    /* R106 — 세밀 초점 모드 자동 종료 (장면 이동·요소 소실·contain 전환 포함) */
    if (WS.focal && (WS.focal.sc !== WS.sceneIdx || !sc.elements[WS.focal.idx] || !sc.elements[WS.focal.idx].src || sc.elements[WS.focal.idx].fit === 'contain')) WS.focal = null;
    const CW = Math.round(BASE_W * WS.zoom / 100), CH = Math.round(CW * sc.height / sc.width);
    const els = sc.elements.map((el, i) => {
      const on = (WS.sel && WS.sel.idx === i && WS.sel.type !== 'scene') || WS.msel.indexOf(i) >= 0 ? 'sel' : '';
      const hd = on && WS.msel.indexOf(i) < 0 ? WSHD : '';   /* R103 — 다중 선택은 외곽만, 핸들 없음 */
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        const ts = window.MK_TEXTSTYLE ? window.MK_TEXTSTYLE.css(el) : ''; /* R56 — 글꼴·배경·외곽선·그림자 */
        return `<div class="ws-el text ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%${textBoxSty(el)};font-size:${fs}px;font-weight:${el.weight || 400}${el.color ? `;color:${el.color}` : ''}${el.align ? `;text-align:${el.align}` : ''}${ts}${rotStyText(el, CH)}">${M().esc(el.text).replace(/\n/g, '<br>')}${hd}</div>`;
      }
      if (el.src) {                                    /* R45 — Workspace도 실이미지·실영상 표시 (R36 editor와 동일) */
        const fit = el.fit === 'contain' ? 'contain' : 'cover';
        const focaling = WS.focal && WS.focal.idx === i;
        const fo = focaling                            /* R106 — 초점 모드 중엔 초안 좌표를 그대로(가운데여도 명시) */
          ? `;object-position:${(WS.focal.d.x * 100).toFixed(1)}% ${(WS.focal.d.y * 100).toFixed(1)}%`
          : (window.MK_FOCAL ? window.MK_FOCAL.pos(el) : ''); /* R94 — 초점 */
        const pf = window.MK_PHOTO ? window.MK_PHOTO.mediaStyle(el, CW / sc.width) : ''; /* R101·R102 — 보정·뒤집기, blur 는 표시 배율 */
        const shp = window.MK_PHOTO ? window.MK_PHOTO.shapeStyle(el, CW / sc.width) : ''; /* R102 — 모양(사각·둥근·원) */
        const cropping = WS.crop && WS.crop.idx === i;
        const crp = !cropping && window.MK_PHOTO ? window.MK_PHOTO.cropCss(el) : ''; /* R105 — 자르기 중엔 원본 전체 노출 */
        const media = (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))
          ? `<video class="ws-media" src="${el.src}" muted autoplay loop playsinline style="width:100%;height:100%;object-fit:${fit}${fo}${pf};display:block"></video>`
          : `<img class="ws-media" src="${el.src}" alt="${M().esc(el.label || '')}" draggable="false" style="width:100%;height:100%;object-fit:${fit}${fo}${pf};display:block">`;
        /* R55 — overflow 클립을 내부 span으로 옮겨 음수 오프셋 핸들이 잘리지 않게 */
        return `<div class="ws-el media ${on}${cropping ? ' cropping' : ''}${focaling ? ' focaling' : ''}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${rotSty(el)}"><span class="ws-clip" style="${(shp + crp).replace(/^;/, '')}">${media}</span>${cropping ? cropLayer(WS.crop.d) : focaling ? focalLayer(WS.focal.d) : hd}</div>`;
      }
      if (el.fill) {                                   /* R45 — 색 채움 요소 (자막 바 등) 실표시 · R49 radius */
        const rad = el.radius ? `;border-radius:${el.radius > 100 ? '50%' : (el.radius * CW / sc.width).toFixed(1) + 'px'}` : ''; /* R98 — >100 = 원 (play.js 규약 정렬) */
        return `<div class="ws-el media ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;background:${el.fill}${rad}${rotSty(el)}">${hd}</div>`;
      }
      return `<div class="ws-el box ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%${rotSty(el)}"><span>${M().esc(el.label || '요소')}</span>${hd}</div>`;
    }).join('');
    return `<div class="ws-canvaswrap"><div class="ws-canvas ${WS.mode === 'photo' ? 'photo' : ''}" data-ws-canvas style="width:${CW}px;height:${CH}px;background:${sc.background}">${els}</div></div>`;
  };

  /* ================= 우: Context Panel — 선택 대상별 전환 ================= */
  const field = (label, val) => `<label class="cx-field"><span>${label}</span><input type="text" value="${M().esc(String(val))}" readonly></label>`;
  /* R47 — 채우기 방식 컨트롤 (cover=꽉 채우기·잘림 / contain=원본 전체) */
  const fitCtl = (el, idx) => {
    const cur = el.fit === 'contain' ? 'contain' : 'cover';
    return `<label class="cx-field"><span>채우기</span></label>
      <div style="display:flex;gap:6px;margin:-4px 0 8px">
        <button data-ws-fit="cover" data-ws-fitidx="${idx}" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid ${cur === 'cover' ? 'var(--mk-teal)' : 'var(--mk-border)'};background:${cur === 'cover' ? 'var(--mk-teal-soft)' : 'transparent'};cursor:pointer;font:var(--mk-t-caption)">꽉 채우기</button>
        <button data-ws-fit="contain" data-ws-fitidx="${idx}" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid ${cur === 'contain' ? 'var(--mk-teal)' : 'var(--mk-border)'};background:${cur === 'contain' ? 'var(--mk-teal-soft)' : 'transparent'};cursor:pointer;font:var(--mk-t-caption)">원본 전체</button>
      </div>`;
  };
  /* R94 — 초점: 꽉 채우기에서 잘릴 때 남길 곳 (3×3 — SVG 내보내기 정렬 9칸과 정확히 일치) */
  /* R107 — 회전 컨트롤. 종류를 가리지 않는다(글자·사진·도형·색칠 전부 el.rot 을 쓴다) */
  const rotCtl = (el) => {
    const d = rotDeg(el);
    return `<label class="cx-field"><span>회전</span><b data-ws-rotval>${d}°</b></label>` +
      `<div class="cx-rotrow">` +
        `<button class="cx-shb" data-ws-rotby="-15" title="왼쪽으로 15°">↺</button>` +
        `<button class="cx-shb" data-ws-rotby="15" title="오른쪽으로 15°">↻</button>` +
        `<input type="range" min="0" max="359" step="1" value="${d}" data-ws-rotr data-stop>` +
      `</div>` +
      (d ? `<button class="cx-scenebtn" data-ws-rot0>↺ 회전 없음</button>` : '') +
      `<div class="cx-hint">모서리 위 손잡이를 끌어도 돌아가요</div>`;
  };

  const focalCtl = (el, idx) => {
    if (!window.MK_FOCAL || !el.src || el.fit === 'contain') return ''; /* R98 — fill 장식엔 미노출 */
    const n = window.MK_FOCAL.norm(el.focal);
    const cells = [];
    const NAME = ['왼쪽', '가운데', '오른쪽'], VNAME = ['위', '가운데', '아래'];
    for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 3; rx++) {
      const fx = rx / 2, fy = ry / 2;
      const on = Math.abs(n.x - fx) < 1 / 6 && Math.abs(n.y - fy) < 1 / 6;
      cells.push(`<button data-ws-focal="${fx},${fy}" data-ws-focalidx="${idx}" title="${VNAME[ry]} ${NAME[rx]}" style="aspect-ratio:1;border-radius:6px;border:1.5px solid ${on ? 'var(--mk-teal)' : 'var(--mk-border)'};background:${on ? 'var(--mk-teal-soft)' : 'transparent'};cursor:pointer;font:var(--mk-t-caption);line-height:1;padding:0">·</button>`);
    }
    /* R106 — 9칸에 안 걸리는 연속 좌표면 세밀 초점 사용 중임을 알린다 */
    const fine = el.focal && ![0, 0.5, 1].some((g) => n.x === g) || el.focal && ![0, 0.5, 1].some((g) => n.y === g);
    return `<label class="cx-field"><span>초점</span></label>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:96px;margin:-4px 0 4px">${cells.join('')}</div>
      <div class="cx-hint" style="margin:0 0 8px">${fine ? `세밀 초점 ${Math.round(n.x * 100)}% · ${Math.round(n.y * 100)}% 사용 중 — ` : '꽉 채우기에서 잘릴 때 이 지점이 남아요 — '}사진을 빠르게 두 번 누르면 세밀하게 잡아요</div>`;
  };
  /* R49 — 자막 디자인 선택 (MK_CAPTION 프리셋) */
  const capCtl = (sc) => {
    if (!window.MK_CAPTION) return '';
    const cur = window.MK_CAPTION.detect(sc).preset;
    return `<label class="cx-field"><span>자막 디자인</span></label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:-4px 0 8px">
        ${window.MK_CAPTION.PRESETS.map((p) => `<button data-ws-cap="${p.id}" title="${M().esc(p.hint)}" style="padding:8px 4px;border-radius:8px;border:1.5px solid ${cur === p.id ? 'var(--mk-teal)' : 'var(--mk-border)'};background:${cur === p.id ? 'var(--mk-teal-soft)' : 'transparent'};cursor:pointer;font:var(--mk-t-caption)">${M().esc(p.name)}</button>`).join('')}
      </div>`;
  };
  /* ================= R66 §12 — 「다른 구성」·잠금·되돌리기 ================= */
  /* 자동 구성으로 만들어진 문서(doc.meta.svar)에서만 뜬다. 무작위여도 seed 로 재현되고,
     잠근 장면과 손댄 장면은 그대로 남는다 — 「다른 구성」은 실험이지 손실이 아니다. */
  const svarState = () => (window.MK_SVARX && doc() && doc().meta && doc().meta.svar)
    ? window.MK_SVARX.readState(doc()) : null;
  const histKey = () => 'ws:' + WS.projectId;
  const SRC_NAME = { auto: '자동', variant: '자동', random: '다른 구성', user: '내가 수정' };

  const smartCtl = () => {
    const stt = svarState();
    if (!stt) return '';
    const X = window.MK_SVARX;
    const sum = stt.sources || { total: 0, locked: 0 };
    /* R68 — 쌍 모드 문서면 쌍 단위 잠금 상태도 같이 보여 준다(반쪽 상태는 여기서 바로 푼다) */
    const ps = X.pairLockSummary ? X.pairLockSummary(doc()) : null;
    const prs = X.pairRoleSummary ? X.pairRoleSummary(doc()) : null; /* R69 — ★ 쌍 개수 */
    /* R73 — 구성 형태. R72 가 조용히 간결로 지었던 사실을 여기서 처음 말한다. */
    const pf = X.pairFormSummary ? X.pairFormSummary(doc()) : null;
    const fname = pf ? (pf.form === 'compact' ? '간결' : '전 구성') : '';
    const other = pf && pf.form === 'compact' ? 'full' : 'compact';
    const depth = X.historyDepth(histKey());
    return `<div class="cx-smart" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--mk-border)">
      <label class="cx-field"><span>자동 구성</span></label>
      <div style="font:var(--mk-t-caption);color:var(--mk-text-secondary);margin:-4px 0 8px">
        구성 「${M().esc(stt.variant || '기본')}」 · 장면 ${sum.total}개${sum.locked ? ' · 🔒 잠금 ' + sum.locked : ''}${stt.seed ? '<br>씨앗 ' + M().esc(String(stt.seed)) : ''}${ps && ps.pairs ? `<br>쌍 ${ps.pairs}개 · 🔒 통째 잠금 ${ps.locked}개${ps.partial ? ' · ⚠ 반쪽 ' + ps.partial + '개' : ''}${prs && prs.highlight ? ' · ★ 중요 ' + prs.highlight + '개(+' + prs.add + '초' + (prs.trimmed ? ', 권장 길이 때문에 ' + prs.want + '초에서 줄임' : '') + ')' : ''}` : ''}</div>
      ${pf && pf.pairs ? `<div style="font:var(--mk-t-caption);color:var(--mk-text-secondary);margin:-4px 0 8px">
        구성 형태 <b>${fname}</b> · 쌍마다 ${pf.perMin === pf.perMax ? pf.perMin + '장면' : pf.perMin + '~' + pf.perMax + '장면'}${pf.pick !== 'auto' ? ' (직접 고름)' : ''}${pf.mixed ? '<br>⚠ 쌍마다 장면 수가 달라요 — 잠근 쌍은 바꾸기 전 형태 그대로예요' : ''}</div>
      <button class="cx-scenebtn" data-ws-pform="${other}">${other === 'full' ? '📐 전 구성으로 바꾸기 (전·후·비교 · 길어져요)' : '📐 간결하게 바꾸기 (쌍마다 1장면)'}</button>` : ''}
      ${ps && ps.partial ? `<button class="cx-scenebtn" data-ws-pairfix="1" style="border-color:var(--mk-teal)">🔒 반쪽 잠긴 쌍 ${ps.partial}개를 통째로 잠그기</button>` : ''}
      <button class="cx-scenebtn" data-ws-svar="new">🎲 다른 구성으로</button>
      ${depth > 1 ? `<button class="cx-scenebtn" data-ws-svar="prev">↩ 이전 구성으로</button>` : ''}
      ${WS.svarMsg ? `<div style="font:var(--mk-t-caption);color:var(--mk-text-secondary);margin-top:6px">${M().esc(WS.svarMsg)}</div>` : ''}
    </div>`;
  };

  const lockCtl = (sc) => {
    if (!svarState()) return '';
    const sv = sc.svar || { source: 'auto', locked: false };
    /* R68 — 이 장면이 쌍의 일부라면, 지켜야 할 단위는 장면이 아니라 쌍이다.
       한 쌍은 2~3장면으로 흩어지므로 통째로만 자리를 지킬 수 있다. */
    const X2 = window.MK_SVARX;
    const g = (X2 && X2.pairGroupOf && sc.pairKey != null) ? X2.pairGroupOf(doc(), sc.pairKey) : null;
    /* R69 — 이 쌍이 ★ 인지. 여기서는 ★ 만 건다(⊘ 는 만들기 화면 전용 — 뺀 쌍은
       이 영상에 사진이 없어 되살릴 근거가 없다). */
    const phl = (g && X2 && X2.pairRoleOf) ? X2.pairRoleOf(doc(), g.key) === 'highlight' : false;
    const pairBox = g ? `<label class="cx-field"><span>이 쌍 (전·후 ${g.count}장면)</span></label>
      <div style="display:flex;gap:6px;margin:-4px 0 8px;align-items:center">
        <button data-ws-pairlock="${M().esc(String(g.key))}" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid ${g.state === 'full' ? 'var(--mk-teal)' : 'var(--mk-border)'};background:${g.state === 'full' ? 'var(--mk-teal-soft)' : 'transparent'};cursor:pointer;font:var(--mk-t-caption)">${g.state === 'full' ? '🔒 쌍 ' + g.no + ' 통째 잠김 — 순서·방식 그대로' : g.state === 'partial' ? '⚠ 반쪽 잠김 — 쌍 ' + g.no + ' 통째 잠그기' : '🔓 쌍 ' + g.no + ' 통째 잠그기'}</button>
        <button data-ws-pairstar="${M().esc(String(g.key))}" title="이 쌍의 비교 장면을 더 길게 (다른 구성에서도 유지)" style="padding:7px 10px;border-radius:8px;border:1.5px solid ${phl ? 'var(--mk-teal)' : 'var(--mk-border)'};background:${phl ? 'var(--mk-teal-soft)' : 'transparent'};cursor:pointer;font:var(--mk-t-caption)">${phl ? '★ 중요' : '☆ 중요'}</button>
      </div>` : '';
    return pairBox + `<label class="cx-field"><span>이 장면</span></label>
      <div style="display:flex;gap:6px;margin:-4px 0 8px;align-items:center">
        <button data-ws-lock="${sc.id}" style="flex:1;padding:7px 4px;border-radius:8px;border:1.5px solid ${sv.locked ? 'var(--mk-teal)' : 'var(--mk-border)'};background:${sv.locked ? 'var(--mk-teal-soft)' : 'transparent'};cursor:pointer;font:var(--mk-t-caption)">${sv.locked ? '🔒 잠김 — 다른 구성에도 그대로' : '🔓 잠그기'}</button>
        <span style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">${SRC_NAME[sv.source] || '자동'}</span>
      </div>`;
  };

  const ContextPanel = () => {
    const m = M(), sc = scene(), p = proj();
    let title = '프로젝트', body = '';
    if (WS.msel.length >= 2 && window.MK_ARRANGE) {    /* R103 — 여러 요소 선택 → 정렬·간격 (§10·§19) */
      const n = WS.msel.length;
      const ab = (m2, ic, tip) => `<button class="cx-shb" data-ws-arr="${m2}" title="${tip}">${ic}</button>`;
      const dist = n >= 3
        ? `<label class="cx-field"><span>간격</span></label><div class="cx-shrow">${ab('dist-h', '⇹', '가로 간격 동일')}${ab('dist-v', '⇳', '세로 간격 동일')}</div>`
        : '';
      return `<div class="ws-context"><small class="cap">속성</small><h3>선택 ${n}개</h3>
        <label class="cx-field"><span>정렬</span></label>
        <div class="cx-shrow">${ab('left', '⯇', '왼쪽')}${ab('centerH', '⬌', '가운데')}${ab('right', '⯈', '오른쪽')}</div>
        <div class="cx-shrow">${ab('top', '⯅', '위')}${ab('centerV', '⬍', '세로 중앙')}${ab('bottom', '⯆', '아래')}</div>
        ${dist}
        <p class="mut" style="font:var(--mk-t-caption)">Shift+클릭으로 빼거나 더할 수 있어요</p></div>`;
    }
    let sel = WS.sel;
    /* 방어: undo·삭제 등으로 선택 요소가 사라졌으면 Scene으로 폴백 */
    if (sel && sel.type !== 'scene' && !sc.elements[sel.idx]) { WS.sel = sel = { type: 'scene' }; }
    if (!sel) {
      body = field('이름', p.name) + field('종류', p.contentType) + field('Scene 수', doc().scenes.length) +
        field('스타일', doc().engine?.style?.name || '—') + field('애니메이션', doc().engine?.animation?.name || '—') +
        `<div class="cx-sw">${(doc().engine?.style?.palette || []).map((c) => `<span style="background:${c}"></span>`).join('')}</div>` +
        smartCtl();
    } else if (sel.type === 'scene') {
      title = 'Scene';
      body = field('이름', sc.name) + field('크기', sc.width + '×' + sc.height) + field('배경', sc.background) +
        (WS.mode === 'video' || WS.mode === 'presentation' ? field('길이', (sc.duration || 0) + '초') + field('전환', sc.transition || 'none') : '') +
        lockCtl(sc) + capCtl(sc) +
        (window.MK_SMART ? `<label class="cx-field"><span>한 번에 정돈</span></label><div class="cx-shrow">${window.MK_SMART.RULES.map((r2) =>
          `<button class="cx-shb wide" data-ws-smart="${r2.id}" title="${r2.name}">${r2.icon} ${r2.name}</button>`).join('')}</div>${WS.smartMsg ? `<p class="mut" style="font:var(--mk-t-caption)">${WS.smartMsg}</p>` : ''}` : '') +
        `<button class="cx-scenebtn" data-ws-anim>✨ 애니메이션 편집 →</button>`;
    } else {
      const el = sc.elements[sel.idx];
      if (el.kind === 'text') {
        title = '텍스트';
        /* R56 — 텍스트 스타일 실컨트롤 (MK_TEXTSTYLE) */
        const TS = window.MK_TEXTSTYLE;
        let styleCtl = '';
        if (TS) {
          const presets = TS.PRESETS.map((p) => {
            const st2 = p.style;
            const prev = `font-family:'${st2.font || 'Pretendard'}',sans-serif;color:${st2.color || 'var(--mk-text)'};` +
              (st2.bg && st2.bg.color ? `background:${st2.bg.color};` : '') +
              (st2.outline && st2.outline.color ? `-webkit-text-stroke:.045em ${st2.outline.color};paint-order:stroke fill;` : '') +
              (st2.shadow && st2.shadow.color ? `text-shadow:${st2.shadow.x || 0}em ${st2.shadow.y || 0}em ${(st2.shadow.blur || 0) / 2}em ${st2.shadow.color};` : '');
            return `<button class="cx-tsp" data-ws-tsp="${p.id}" title="${m.esc(p.hint)}"><span style="${prev}">가나</span><small>${m.esc(p.name)}</small></button>`;
          }).join('');
          const fonts = TS.FONTS.map((f2) => `<option value="${f2.family}"${el.font === f2.family || (!el.font && f2.family === 'Pretendard') ? ' selected' : ''}>${m.esc(f2.name)}</option>`).join('');
          const cols = TS.COLORS.map((c2) => `<button class="cx-swb${el.color === c2 ? ' on' : ''}" data-ws-tcol="${c2}" style="background:${c2}"></button>`).join('');
          const bgs = TS.BGS.map((b2, bi) => b2 === null
            ? `<button class="cx-swb none${!el.bg ? ' on' : ''}" data-ws-tbg="none" title="배경 없음">∅</button>`
            : `<button class="cx-swb${el.bg && el.bg.color === b2 ? ' on' : ''}" data-ws-tbg="${bi}" style="background:${b2}"></button>`).join('');
          const alignBtn = (a2, ic) => `<button class="cx-alb${(el.align || 'left') === a2 ? ' on' : ''}" data-ws-tal="${a2}">${ic}</button>`;
          styleCtl =
            `<label class="cx-field"><span>스타일</span></label><div class="cx-tsps">${presets}</div>` +
            `<label class="cx-field"><span>글꼴</span><select data-ws-tfont>${fonts}</select></label>` +
            `<label class="cx-field"><span>글자색</span></label><div class="cx-sws">${cols}</div>` +
            `<label class="cx-field"><span>배경</span></label><div class="cx-sws">${bgs}</div>` +
            `<label class="cx-field"><span>정렬</span></label><div class="cx-als">${alignBtn('left', '⯇')}${alignBtn('center', '≡')}${alignBtn('right', '⯈')}</div>` +
            `<button class="cx-scenebtn" data-ws-tsall>✨ 이 스타일을 모든 장면 글자에</button>`;
        }
        body = `<label class="cx-field"><span>내용</span><textarea data-ws-txt="${sel.idx}" rows="3">${m.esc(el.text)}</textarea></label>` +
          field('크기', el.size) + field('굵기', el.weight || 400) + field('폭', el.w + '%') + styleCtl;
      } else if (sel.type === 'video') {
        title = '영상';
        body = field('클립', el.label || '영상') + fitCtl(el, sel.idx) + focalCtl(el, sel.idx) + field('볼륨', '100%') + `<div class="cx-hint">트리밍·속도 — 후속</div>`;
      } else if (sel.type === 'shape') {
        title = '도형';
        body = field('종류', el.label || '도형') + field('채움', '단색') + field('테두리', '없음');
      } else {
        title = '이미지';
        /* R101 — 사진 보정·필터 실컨트롤 (MK_PHOTO). 클릭 첫 행동 = 사진 바꾸기(§11) */
        const PH = window.MK_PHOTO;
        let photoCtl = '';
        if (PH) {
          const cur = PH.matchPreset(el);
          const chips = PH.PRESETS.map((pr) => {
            const fCss = PH.css({ filters: pr.f });
            const thumb = el.src
              ? `<img src="${el.src}" alt="" style="${fCss ? `filter:${fCss};` : ''}width:100%;height:100%;object-fit:cover;display:block">`
              : `<span style="display:block;width:100%;height:100%;background:linear-gradient(135deg,#7FB2D9,#E8A87C);${fCss ? `filter:${fCss}` : ''}"></span>`;
            return `<button class="cx-fchip${cur === pr.id ? ' on' : ''}" data-ws-pfilter="${pr.id}" title="${pr.name}"><span class="th">${thumb}</span><small>${pr.name}</small></button>`;
          }).join('');
          const sliders = PH.SLIDERS.map((k) => {
            const d = PH.BY[k]; const v = PH.valOf(el, k);
            return `<label class="cx-prow"><span>${d.label}</span><input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" data-ws-padj="${k}" data-stop><b data-ws-pval="${k}">${d.def === 1 ? Math.round(v * 100) + '%' : v + d.unit}</b></label>`;
          }).join('');
          photoCtl =
            (el.src ? `<button class="cx-scenebtn primary" data-ws-preplace>🖼 사진 바꾸기</button>` : '') +
            `<label class="cx-field"><span>필터</span></label><div class="cx-fchips">${chips}</div>` +
            `<label class="cx-field"><span>사진 보정</span></label><div class="cx-padj">${sliders}</div>` +
            `<label class="cx-field"><span>모양 · 뒤집기</span></label><div class="cx-shrow">${PH.SHAPES.map((s2) =>
              `<button class="cx-shb${PH.shapeOf(el) === s2.id ? ' on' : ''}" data-ws-pshape="${s2.id}" title="${s2.name}">${s2.icon}</button>`).join('')}<i></i>` +
              `<button class="cx-shb${el.flipH ? ' on' : ''}" data-ws-pflip="h" title="좌우 뒤집기">⇋</button>` +
              `<button class="cx-shb${el.flipV ? ' on' : ''}" data-ws-pflip="v" title="상하 뒤집기">⥮</button>` +
              (el.src ? `<button class="cx-shb${PH.cropOf(el) ? ' on' : ''}" data-ws-pcrop title="자르기">✂</button>` : '') + `</div>` +
            (el.src && PH.cropOf(el) ? `<button class="cx-scenebtn" data-ws-pcrop0>✂ 자르기 해제</button>` : '') + /* R105 */
            (PH.isEdited(el) ? `<button class="cx-scenebtn" data-ws-preset0>↩ 원래대로</button>` : '');
        }
        body = field('이름', el.label || '이미지') + field('크기', el.w + '×' + el.h + '%') + photoCtl + fitCtl(el, sel.idx) + focalCtl(el, sel.idx);
      }
      body += rotCtl(el);                              /* R107 — 회전은 요소 종류를 가리지 않는다 */
    }
    return `<div class="ws-context"><small class="cap">속성</small><h3>${title}</h3>${body}
      ${sel && sel.type !== 'scene' ? `<button class="cx-scenebtn" data-ws-selscene>← Scene 속성 보기</button>` : ''}
      ${sel ? `<button class="cx-scenebtn" data-ws-selproj>프로젝트 속성 보기</button>` : ''}</div>`;
  };

  /* ================= 하단: Footer — 모드·Zoom·Page·Timeline ================= */
  const FooterBar = () => {
    const m = M(), d = doc(), sc = scene();
    const timeline = WS.mode === 'video'
      ? `<div class="ws-timeline">${d.scenes.map((s, i) => {
          const t = s.duration || 3;
          /* R58 — 선택 칩 그 자리 시간 조절 */
          const inner = i === WS.sceneIdx
            ? `<small>${i + 1}</small><span class="mk-durctl" data-stop><button data-ws-dm="${i}">−</button><input type="number" step="0.5" min="1" max="30" value="${t}" data-ws-dv="${i}">s<button data-ws-dp="${i}">＋</button></span>`
            : `<small>${i + 1}</small><span>${t}s</span>`;
          const tag = i === WS.sceneIdx ? 'div' : 'button'; /* button 중첩 분해 방지 */
          return `<${tag} class="tl ${i === WS.sceneIdx ? 'on' : ''}" style="flex:${t}" data-ws-sc="${i}">${inner}</${tag}>`;
        }).join('')}</div>`
      : '';
    return `<div class="ws-footer">
      <div class="modes">${MODES.map(([k, n]) => `<button class="${WS.mode === k ? 'on' : ''}" data-ws-mode="${k}">${n}</button>`).join('')}</div>
      ${timeline}
      <span class="grow"></span>
      <div class="zoom">${m.IconButton({ icon: '−', attrs: 'data-ws="zout"' })}<span>${WS.zoom}%</span>${m.IconButton({ icon: '＋', attrs: 'data-ws="zin"' })}</div>
      <div class="page">${m.IconButton({ icon: '‹', attrs: 'data-ws="prev"' })}<span>${WS.sceneIdx + 1} / ${d.scenes.length}</span>${m.IconButton({ icon: '›', attrs: 'data-ws="next"' })}</div>
    </div>`;
  };

  /* ================= AI Dock (접이식 — 프로젝트 인식) ================= */
  const DOCK_ACTIONS = [['design', '디자인 제안'], ['rewrite', '문장 수정'], ['scene', 'Scene 생성'], ['style', '스타일 변경']];
  const AIDock = () => WS.dock ? `<aside class="ws-dock">
      <div class="head"><b>✦ AI</b><small>「${M().esc(proj().name)}」를 보고 있어요</small><button data-ws="dock">✕</button></div>
      <div class="quickai">${DOCK_ACTIONS.map(([k, l]) => `<button data-ws-ai="${k}">${l}</button>`).join('')}</div>
      <div class="chat" id="wsDockChat"></div>
    </aside>` : '';
  const DOCK_REPLY = {
    design: (p) => `「${p.name}」 ${WS.sceneIdx + 1}번 장 기준 — 제목 크기를 한 단계 키우고 본문 폭을 좁히면 시선 흐름이 좋아져요. (실적용은 후속)`,
    rewrite: () => `현재 장의 문장을 3가지 톤(간결·친근·격식)으로 다시 써 드릴 수 있어요. 텍스트를 선택해 주세요. (실적용 후속)`,
    scene: (p) => `이 흐름 다음엔 「정리」 장이 어울려요. Scene ${doc().scenes.length + 1}로 추가해 볼까요? 상단 ＋ Scene으로도 추가돼요.`,
    style: (p) => `현재 스타일 「${doc().engine?.style?.name || '기본'}」 → 미니멀·프리미엄 팔레트로 바꾼 비교안을 만들 수 있어요. (실적용 후속)`,
  };

  /* ================= 화면 등록 ================= */
  window.MK_SCREENS.workspace = {
    title: 'Workspace', variants: ['v1'],
    render() {
      if (!WS.projectId || !proj()) {
        const first = window.MK_PROJ.list('recent')[0];
        if (first) { WS.projectId = first.projectId; WS.mode = modeOf(first.contentType); }
        else return `<span class="pg-note">열 프로젝트가 없어요 — My Projects에서 시작하세요</span>`;
      }
      return `<div class="ws-shell mode-${WS.mode}">
        ${TopBar()}
        <div class="ws-mid">
          <div class="ws-left">${NavRail()}<div class="ws-navpanel">${NavPanel()}</div></div>
          ${CanvasArea()}
          ${ContextPanel()}
          ${AIDock()}
        </div>
        ${FooterBar()}
      </div>`;
    },
    mount(root) {
      const m = M();
      const R = () => {
        /* R59 — 모든 편집 경로가 R()를 지나므로 여기서 디바운스 자동 저장 */
        if (window.MK_LIVE) window.MK_LIVE.autosave(doc(), {
          onSaved() {
            WS.savedAt = new Date().toTimeString().slice(0, 5);
            const el = document.getElementById('wsSave');
            if (el) el.textContent = '자동 저장됨 · ' + WS.savedAt;
          },
        });
        PG.render();
      };

      /* 상단 */
      const act = {
        back: () => PG.go('projects'),
        dock: () => { WS.dock = !WS.dock; R(); },
        undo: () => { undo(); R(); }, redo: () => { redo(); R(); },
        zin: () => { WS.zoom = Math.min(160, WS.zoom + 10); R(); },
        zout: () => { WS.zoom = Math.max(40, WS.zoom - 10); R(); },
        prev: () => { WS.sceneIdx = Math.max(0, WS.sceneIdx - 1); WS.sel = { type: 'scene' }; R(); },
        next: () => { WS.sceneIdx = Math.min(doc().scenes.length - 1, WS.sceneIdx + 1); WS.sel = { type: 'scene' }; R(); },
        'notice-x': () => { WS.notice = ''; R(); },
        preview: () => {
          /* R48 — 실재생 (#/editor R37과 동일 엔진: 장면 순차·애니·배경음·영상 프레임) */
          if (window.MK_PLAY) { window.MK_PLAY.open(doc(), { startIdx: 0 }); return; }
          m.Modal.open(`<h2>미리보기</h2><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">재생 엔진이 로드되지 않았어요 — 새로고침 후 다시 시도해 주세요</p>`);
        },
        share: () => {
          /* R48 — 케이에듀 생태계 공유: 케이박스 「바로 초대」 파이프라인 연결 */
          const hasBox = !!(window.KeduBoxbar && document.querySelector('.kbx-fab'));
          m.Modal.open(`<h2>공유</h2>
            <div style="display:flex;flex-direction:column;gap:8px;margin:12px 0">
              <button data-ws-sh="invite" ${hasBox ? '' : 'disabled'} style="height:46px;border:none;border-radius:12px;background:${hasBox ? 'linear-gradient(120deg,#5B8EF8,#7AA6FF)' : 'var(--mk-border)'};color:#fff;font:700 14px/1 inherit;cursor:${hasBox ? 'pointer' : 'not-allowed'}">📤 우리 반에 바로 초대 (케이박스)</button>
              ${hasBox ? '' : `<small style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">교사 로그인 상태의 케이에듀에서 열면 활성화돼요</small>`}
              <button data-ws-sh="link" style="height:42px;border:1.5px solid var(--mk-border);border-radius:12px;background:transparent;cursor:pointer;font:var(--mk-t-body-sm)">🔗 케이메이커 링크 복사</button>
            </div>
            <p style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">작업물 파일을 보내려면 「내보내기」로 MP4·PNG·PPTX 저장 후 공유하세요. 작업물 자체를 링크로 여는 기능은 서버 저장(후속)이 필요해요.</p>
            <div id="wsShMsg" style="font:var(--mk-t-caption);color:var(--mk-text-secondary);margin-top:8px;min-height:16px"></div>`);
          const msg = (t) => { const d2 = document.querySelector('#wsShMsg'); if (d2) d2.textContent = t; };
          const iv = document.querySelector('[data-ws-sh="invite"]');
          if (iv && hasBox) iv.onclick = () => {
            window.KEDU_BOXBAR_CTX = { kind: 'kmake', title: '케이메이커: ' + (doc().title || '내 작업'), url: '/maker-playground/' };
            m.Modal.close(); window.KeduBoxbar.openPanel();
          };
          const lk = document.querySelector('[data-ws-sh="link"]');
          if (lk) lk.onclick = () => {
            const u = location.origin + '/maker-playground/';
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(() => msg('복사됨: ' + u), () => msg(u));
            else msg(u);
          };
          window.MK_PROJ.toggleShare(WS.projectId);
        },
        export: () => {
          /* R47 — 실출력 배선 (#/editor R37~40과 동일 엔진: MK_RENDER·MK_VIDEO) */
          if (!window.MK_RENDER) {
            m.Modal.open(`<h2>내보내기</h2><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary)">렌더 엔진이 로드되지 않았어요 — 새로고침 후 다시 시도해 주세요</p>`);
            return;
          }
          m.Modal.open(`<h2>내보내기</h2><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin:6px 0 12px">형식을 고르세요</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">${[['png', 'PNG (현재 장면)'], ['pptx', 'PPTX'], ['pdf', 'PDF'], ['mp4', 'MP4 영상']].map(([f, l]) => m.Button({ label: l, kind: 'secondary', size: 'sm', attrs: `data-ws-ex="${f}"` })).join('')}</div>
            <div id="wsExMsg" style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:12px;min-height:20px"></div>`);
          const exMsg = (t) => { const d2 = document.querySelector('#wsExMsg'); if (d2) d2.textContent = t; };
          const dl = (name, href) => { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
          const safeName = () => (doc().title || '케이메이커').replace(/[^\w가-힣 _-]/g, '');
          document.querySelectorAll('[data-ws-ex]').forEach((b) => b.onclick = async () => {
            const f = b.dataset.wsEx;
            try {
              exMsg('만드는 중…');
              if (f === 'mp4') {
                if (!window.MK_VIDEO) throw new Error('영상 엔진 미로드 — 새로고침 후 시도');
                const r = await window.MK_VIDEO.exportMP4(doc(), { onProgress: exMsg });
                exMsg(r.ok ? `MP4 저장 완료 — ${r.sec}초 · ${r.w}×${r.h}${r.audio ? ' · 🎵 소리 포함' : (r.audioMsg ? ' · ' + r.audioMsg : '')}` : r.msg);
              } else if (f === 'pptx') {
                const pages = doc().scenes.map((sc2) => window.MK_RENDER.renderScene(sc2, {}));
                const r = window.MK_RENDER.toPPTX(pages, {});
                const blob = new Blob([r.bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
                const u = URL.createObjectURL(blob);
                dl(`${safeName()}.pptx`, u); setTimeout(() => URL.revokeObjectURL(u), 4000);
                exMsg(`PPTX 저장 완료 — 슬라이드 ${r.slides}장${r.media ? ' · 사진 ' + r.media + '장 포함' : ''}`);
              } else if (f === 'pdf') {
                const imgs = [];
                for (let i = 0; i < doc().scenes.length; i++) {
                  exMsg(`장면 그리는 중… ${i + 1}/${doc().scenes.length}`);
                  const dlist = window.MK_RENDER.renderScene(doc().scenes[i], {});
                  const out = await window.MK_RENDER.toRaster(dlist, { format: 'jpg', scale: 2, quality: 0.92 });
                  if (!out || !out.dataUrl) throw new Error('장면 래스터 실패 — 크롬·엣지에서 시도해 주세요');
                  const jb = window.MK_RENDER.dataUrlBytes(out.dataUrl);
                  if (!jb) throw new Error('JPEG 변환 실패');
                  imgs.push({ bin: jb.bin, w: out.plan.width, h: out.plan.height });
                }
                const r = window.MK_RENDER.toPDFRaster(imgs, {});
                if (!r.pages) throw new Error('PDF 페이지 생성 실패');
                const u8 = new Uint8Array(r.bytes.length);
                for (let i = 0; i < r.bytes.length; i++) u8[i] = r.bytes.charCodeAt(i) & 255;
                const blob = new Blob([u8], { type: 'application/pdf' });
                const u = URL.createObjectURL(blob);
                dl(`${safeName()}.pdf`, u); setTimeout(() => URL.revokeObjectURL(u), 4000);
                exMsg(`PDF 저장 완료 — ${r.pages}쪽`);
              } else {
                const dlist = window.MK_RENDER.renderScene(scene(), {});
                const out = await window.MK_RENDER.toRaster(dlist, { format: 'png', scale: 2 });
                if (!out || !out.dataUrl) throw new Error('래스터 실패 — 크롬·엣지에서 시도해 주세요');
                dl(`${safeName()}_${WS.sceneIdx + 1}.png`, out.dataUrl);
                exMsg('PNG 저장 완료');
              }
              window.MK_PROJ.logExport(WS.projectId, f.toUpperCase());
            } catch (err) { exMsg('실패: ' + err.message); }
          });
        },
      };
      root.querySelectorAll('[data-ws]').forEach((b) => b.onclick = () => act[b.dataset.ws]?.());

      /* Quick Actions */
      root.querySelectorAll('[data-ws-q]').forEach((b) => b.onclick = () => {
        const k = b.dataset.wsQ;
        if (k === 'ai') { WS.dock = true; R(); return; }
        snap();
        const sc = scene();
        if (k === 'scene') {
          const n = JSON.parse(JSON.stringify(sc));
          n.id = 's' + Date.now(); n.name = '새 장면'; n.elements = [{ kind: 'text', x: 10, y: 40, w: 80, size: 8, text: '새 장면', weight: 700 }];
          doc().scenes.splice(WS.sceneIdx + 1, 0, n); WS.sceneIdx++;
        } else if (k === 'text') sc.elements.push({ kind: 'text', x: 12, y: 70, w: 60, size: 4, text: '새 텍스트', weight: 400 });
        else if ((k === 'image' || k === 'video') && window.MK_LIVE) {   /* R46 — 실파일 선택·실삽입 (#/editor R41과 동일 경로) */
          const inp = document.createElement('input');
          inp.type = 'file'; inp.accept = k === 'video' ? 'video/*' : 'image/*';
          inp.onchange = () => window.MK_LIVE.fileToSrc(inp.files && inp.files[0], (src, err) => {
            if (!src) { if (err && typeof alert === 'function') alert(err); return; }
            const f = inp.files[0];
            const r = window.MK_LIVE.insertWithSrc(doc(), WS.sceneIdx, { name: f.name.replace(/\.[^.]+$/, ''), kind: k === 'video' ? 'video' : 'image', src });
            if (r && r.ok) { WS.sel = { type: k, idx: scene().elements.length - 1 }; R(); }
          });
          inp.click();
          return;                                                       /* 파일 고르기 전엔 아무것도 안 넣는다 — 취소 = 변화 0 */
        }
        else sc.elements.push({ kind: 'image', x: 60, y: 60, w: 28, h: 24, label: k === 'video' ? '영상 클립' : k === 'shape' ? '도형' : '이미지' });
        WS.sel = k === 'scene' ? { type: 'scene' } : { type: k, idx: sc.elements.length - 1 };
        R();
      });

      /* R66 §12 — 「다른 구성」·이전 구성·장면 잠금 */
      const applyDoc = (nd) => {
        const p2 = proj();
        nd.title = nd.title || p2.doc.title;
        p2.doc = nd;
        WS.sceneIdx = Math.min(WS.sceneIdx, nd.scenes.length - 1);
        WS.sel = null; WS.undo = []; WS.redo = [];
      };
      root.querySelectorAll('[data-ws-svar]').forEach((b) => b.onclick = () => {
        const X = window.MK_SVARX; if (!X) return;
        const key = histKey();
        if (b.dataset.wsSvar === 'prev') {
          const h = X.previous(key);
          if (!h) { WS.svarMsg = '되돌릴 이전 구성이 없어요'; R(); return; }
          applyDoc(h.doc);
          WS.svarMsg = '이전 구성으로 되돌렸어요' + (h.seed ? ' (씨앗 ' + h.seed + ')' : '');
          R(); return;
        }
        /* 현재 구성을 먼저 스택에 올려야 되돌리기가 성립한다 */
        if (X.historyDepth(key) === 0) {
          const cur = X.readState(doc()) || {};
          X.pushHistory(key, doc(), { seed: cur.seed, variant: cur.variant });
        }
        const r = X.recomposeDoc(doc(), { key });
        if (!r.ok) { WS.svarMsg = r.guide || r.why || '다른 구성을 만들지 못했어요'; R(); return; }
        applyDoc(r.doc);
        WS.svarMsg = '새 구성을 만들었어요 — 장면 ' + r.doc.scenes.length + '개'
          + (r.lockedKept ? ' · 잠긴 ' + r.lockedKept + '개는 그대로' : '')
          + ((r.warnings || []).length ? ' · ' + r.warnings.join(' ') : '');
        R();
      });
      /* R73 — 구성 형태 전환. 씨앗을 그대로 넘겨 순서·비교 방식은 붙잡고 장면 수만 바꾼다
         (형태만 바꾸려고 눌렀는데 구성이 통째로 달라지면 그건 「다른 구성」이지 전환이 아니다). */
      root.querySelectorAll('[data-ws-pform]').forEach((b) => b.onclick = () => {
        const X = window.MK_SVARX; if (!X) return;
        const key = histKey();
        if (X.historyDepth(key) === 0) {
          const cur = X.readState(doc()) || {};
          X.pushHistory(key, doc(), { seed: cur.seed, variant: cur.variant });
        }
        const st = X.readState(doc()) || {};
        const want = b.dataset.wsPform;
        const r = X.recomposeDoc(doc(), { key, formPick: want, seed: st.seed || undefined });
        if (!r.ok) { WS.svarMsg = r.guide || r.why || '형태를 바꾸지 못했어요'; R(); return; }
        applyDoc(r.doc);
        const now = X.pairFormSummary ? X.pairFormSummary(r.doc) : null;
        const got = now && now.form === want;
        WS.svarMsg = (got ? (want === 'compact' ? '간결 구성으로 바꿨어요' : '전 구성으로 바꿨어요')
          : '고른 형태로 못 바꿨어요')
          + ' — 장면 ' + r.doc.scenes.length + '개'
          + ((r.warnings || []).length ? ' · ' + r.warnings.join(' ') : '');
        R();
      });
      /* R68 — 쌍 통째 잠금 / 반쪽 상태 일괄 승격 */
      root.querySelectorAll('[data-ws-pairlock]').forEach((b) => b.onclick = () => {
        const X = window.MK_SVARX; if (!X || !X.setPairLock) return;
        const key = b.dataset.wsPairlock;
        const g = X.pairGroupOf(doc(), key); if (!g) return;
        const on = g.state !== 'full';
        const r = X.setPairLock(doc(), key, on);
        WS.svarMsg = on
          ? '쌍 ' + g.no + '은 다른 구성에서도 자리·방식 그대로 남아요 (장면 ' + r.scenes + '개)'
          : '쌍 ' + g.no + ' 잠금을 풀었어요' + (g.edited ? ' — 직접 고친 장면이 있어 다시 잠가야 순서를 바꿀 수 있어요' : '');
        R();
      });
      /* R69 — 쌍 ★ 중요 토글 (길이 가산은 그 쌍의 마지막 장면 하나에만) */
      root.querySelectorAll('[data-ws-pairstar]').forEach((b) => b.onclick = () => {
        const X = window.MK_SVARX; if (!X || !X.setPairRole) return;
        const key = b.dataset.wsPairstar;
        const g = X.pairGroupOf(doc(), key); if (!g) return;
        const r = X.setPairRole(doc(), key, 'highlight');
        if (!r.ok) { WS.svarMsg = r.guide || '중요 표시를 바꾸지 못했어요'; R(); return; }
        WS.svarMsg = r.highlight
          ? '쌍 ' + g.no + '을 중요로 뒀어요 — 비교 장면이 ' + r.duration + '초로 길어졌고 다른 구성에서도 유지돼요'
          : '쌍 ' + g.no + '의 중요 표시를 풀었어요 — 길이가 원래대로 돌아왔어요';
        R();
      });
      root.querySelectorAll('[data-ws-pairfix]').forEach((b) => b.onclick = () => {
        const X = window.MK_SVARX; if (!X || !X.pairLockSummary) return;
        const keys = X.pairLockSummary(doc()).partialKeys || [];
        keys.forEach((k) => X.setPairLock(doc(), k, true));
        WS.svarMsg = '반쪽 잠긴 쌍 ' + keys.length + '개를 통째로 잠갔어요 — 이제 나머지만 다시 골라요';
        R();
      });
      root.querySelectorAll('[data-ws-lock]').forEach((b) => b.onclick = () => {
        const X = window.MK_SVARX; if (!X) return;
        const sc = doc().scenes.find((x) => x.id === b.dataset.wsLock); if (!sc) return;
        const on = !(sc.svar && sc.svar.locked);
        X.setLock(doc(), sc.id, on);
        WS.svarMsg = on ? '이 장면은 다른 구성에도 그대로 남아요' : '잠금을 풀었어요';
        R();
      });

      /* 좌 내비 */
      root.querySelectorAll('[data-ws-nav]').forEach((b) => b.onclick = () => { WS.nav = b.dataset.wsNav; R(); });
      /* R58 — 씬 길이 그 자리 조절 (undo 적립) */
      const setDur = (i, v) => {
        snap();
        doc().scenes[i].duration = Math.round(Math.min(30, Math.max(1, v)) * 10) / 10;
        R();
      };
      root.querySelectorAll('[data-ws-dm]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); const i = +b.dataset.wsDm; setDur(i, (doc().scenes[i].duration || 3) - 0.5); });
      root.querySelectorAll('[data-ws-dp]').forEach((b) => b.onclick = (ev) => { ev.stopPropagation(); const i = +b.dataset.wsDp; setDur(i, (doc().scenes[i].duration || 3) + 0.5); });
      root.querySelectorAll('[data-ws-dv]').forEach((inp) => {
        inp.onclick = (ev) => ev.stopPropagation();
        inp.onchange = (ev) => { ev.stopPropagation(); setDur(+inp.dataset.wsDv, +inp.value || 3); };
      });
      root.querySelectorAll('[data-ws-sc]').forEach((b) => b.onclick = (ev) => {
        if (ev && ev.target && ev.target.closest && ev.target.closest('[data-stop]')) return; WS.sceneIdx = +b.dataset.wsSc; WS.sel = { type: 'scene' }; R(); });
      root.querySelectorAll('[data-ws-tpl]').forEach((b) => b.onclick = () => m.Modal.open(`<h2>템플릿 적용</h2><p style="font:var(--mk-t-body-sm);color:var(--mk-text-secondary);margin-top:6px">현재 프로젝트에 스타일 적용 — 후속 단계예요.</p><div style="display:flex;justify-content:flex-end;margin-top:12px">${m.Button({ label: '확인', size: 'sm', attrs: 'onclick="MK.Modal.close()"' })}</div>`));
      root.querySelectorAll('[data-ws-asset]').forEach((b) => b.onclick = () => {
        snap();
        const a = window.MK_ASSETS.ASSETS.find((x) => x.id === b.dataset.wsAsset);
        scene().elements.push({ kind: 'image', x: 55, y: 55, w: 30, h: 26, label: a.name });
        WS.sel = { type: 'image', idx: scene().elements.length - 1 }; R();
      });
      const goAssets = root.querySelector('[data-ws-go="assets"]');
      if (goAssets) goAssets.onclick = () => PG.go('assets');

      /* Scene 조작 (SceneCard 복제/삭제 버튼) */
      root.querySelectorAll('.ws-scenes [data-op]').forEach((b) => b.onclick = (e) => {
        e.stopPropagation(); snap();
        const i = +b.dataset.i;
        if (b.dataset.op === 'dup') { doc().scenes.splice(i + 1, 0, JSON.parse(JSON.stringify(doc().scenes[i]))); WS.sceneIdx = i + 1; }
        else if (doc().scenes.length > 1) { doc().scenes.splice(i, 1); WS.sceneIdx = Math.min(WS.sceneIdx, doc().scenes.length - 1); }
        R();
      });

      /* 캔버스 선택 */
      root.querySelectorAll('[data-ws-el]').forEach((el) => el.onclick = (e) => {
        e.stopPropagation();
        const i = +el.dataset.wsEl, k = scene().elements[i].kind;
        const lb = scene().elements[i].label || '';
        WS.sel = { type: k === 'text' ? 'text' : lb.includes('영상') ? 'video' : lb.includes('도형') ? 'shape' : 'image', idx: i };
        R();
      });
      const cv = root.querySelector('[data-ws-canvas]');
      if (cv) cv.onclick = () => { WS.sel = { type: 'scene' }; R(); };

      /* R55 — 실편집: 드래그 이동 + 핸들 리사이즈 (MK_LIVE 재사용, #/editor R36 동일 규약) */
      const L = window.MK_LIVE;
      if (cv && L) {
        const selType = (el) => el.kind === 'text' ? 'text'
          : (el.video === true || el.kind === 'video' || (el.label || '').includes('영상')) ? 'video'
          : (el.label || '').includes('도형') ? 'shape' : 'image';
        const GEO = ['x', 'y', 'w', 'h', 'size', 'rot'];   /* R107 — 회전도 제스처 시작 상태에 포함 */
        const pickGeo = (el) => { const o = {}; GEO.forEach((k) => { if (el[k] != null) o[k] = el[k]; }); return o; };
        const paint = (n, el) => {
          n.style.left = el.x + '%'; n.style.top = el.y + '%'; n.style.width = el.w + '%';
          n.style.transform = rotDeg(el) ? `rotate(${rotDeg(el)}deg)` : '';   /* R107 */
          if (el.kind !== 'text' && el.h != null) n.style.height = el.h + '%';
          if (el.kind === 'text' && el.size != null) n.style.fontSize = (el.size / 100 * cv.clientHeight).toFixed(1) + 'px';
        };
        let ges = null, swallow = false;
        /* R105 — 자르기 오버레이 직갱신 (재렌더 없이 스크림·상자만) */
        const paintCrop = (host, d) => {
          const P = (v) => (Math.max(0, v) * 100).toFixed(2) + '%';
          const sc4 = host.querySelectorAll('.ws-croplay .sc');
          if (sc4.length === 4) {
            sc4[0].style.height = P(d.y);
            sc4[1].style.top = P(d.y + d.h); sc4[1].style.height = P(1 - d.y - d.h);
            sc4[2].style.top = P(d.y); sc4[2].style.width = P(d.x); sc4[2].style.height = P(d.h);
            sc4[3].style.left = P(d.x + d.w); sc4[3].style.top = P(d.y); sc4[3].style.width = P(1 - d.x - d.w); sc4[3].style.height = P(d.h);
          }
          const bx = host.querySelector('.ws-crbox');
          if (bx) { bx.style.left = P(d.x); bx.style.top = P(d.y); bx.style.width = P(d.w); bx.style.height = P(d.h); }
        };
        /* R106 — 초점 초안 라이브: 마커·사진 object-position 만 만진다 (문서 무변형) */
        const paintFocal = (host, d) => {
          const pt = host.querySelector('[data-ws-fopt]');
          if (pt) { pt.style.left = (d.x * 100).toFixed(2) + '%'; pt.style.top = (d.y * 100).toFixed(2) + '%'; }
          const md = host.querySelector('.ws-media');
          if (md) md.style.objectPosition = (d.x * 100).toFixed(1) + '% ' + (d.y * 100).toFixed(1) + '%';
        };
        const focalAt = (host, ev) => {                /* 프레임 내 포인터 → 0~1 (object-position 정의와 동일 좌표) */
          const r = host.getBoundingClientRect(), cl = (v) => Math.min(1, Math.max(0, v));
          const el0 = scene() && scene().elements[+host.dataset.wsEl];
          const rt = rotDeg(el0);
          if (!rt) return { x: cl((ev.clientX - r.left) / (r.width || 1)), y: cl((ev.clientY - r.top) / (r.height || 1)) };
          /* R107 — 회전 요소의 getBoundingClientRect 은 외접 상자다. 중심만 참이므로
             중심 기준으로 역회전해 회전 전 프레임 좌표로 되돌린다. */
          const c = cpx();
          /* R110 — 프레임 크기도 모델 박스에서. 사진은 h 가 있어 종전과 같은 수치이고,
             h 없는 종류가 초점에 들어오더라도 0 짜리 프레임으로 무너지지 않는다. */
          const bp = L.boxPx ? L.boxPx(el0, c.CW, c.CH)
            : { w: (el0.w || 0) / 100 * c.CW, h: (el0.h || 0) / 100 * c.CH };
          return L.framePos(r.left + r.width / 2, r.top + r.height / 2,
            bp.w, bp.h, ev.clientX, ev.clientY, rt);
        };
        cv.addEventListener('pointerdown', (ev) => {
          if (ev.button !== undefined && ev.button !== 0) return;
          const t = ev.target;
          if (WS.focal) {                              /* R106 — 초점 모드: 해당 사진 안에서만 탭·드래그, 나머지 잠금 */
            if (t.closest && (t.closest('[data-ws-fook]') || t.closest('[data-ws-fono]'))) return; /* 버튼 click 통과 */
            const host = cv.querySelector(`[data-ws-el="${WS.focal.idx}"]`); if (!host) return;
            if (!(t.closest && t.closest('[data-ws-el]') === host)) return;
            WS.focal.d = focalAt(host, ev); paintFocal(host, WS.focal.d);
            ges = { focalMode: true, host };
            if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (_) {} }
            ev.preventDefault(); return;
          }
          if (WS.crop) {                               /* R105 — 자르기 모드: 크롭 상자만 조작, 다른 요소는 잠금 */
            if (t.closest && (t.closest('[data-ws-crok]') || t.closest('[data-ws-crno]'))) return; /* 버튼 click 통과 */
            const crh = t.closest && t.closest('[data-ws-crh]');
            const crb = t.closest && t.closest('[data-ws-crbox]');
            if (!crh && !crb) return;
            const host = cv.querySelector(`[data-ws-el="${WS.crop.idx}"]`); if (!host) return;
            ges = { cropMode: true, handle: crh ? crh.dataset.wsCrh : null,
              start: { ...WS.crop.d }, sx: ev.clientX, sy: ev.clientY,
              rect: host.getBoundingClientRect(), host };
            if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (_) {} }
            ev.preventDefault(); return;
          }
          const hd = t.closest && t.closest('.ws-hd');
          const elDom = t.closest && t.closest('[data-ws-el]');
          if (!elDom) return;
          const i = +elDom.dataset.wsEl;
          const el = scene().elements[i]; if (!el) return;
          /* R95 — 터치·펜: 이미 선택된 요소의 모서리 근처를 짚으면 핸들을 못
             맞혔어도 리사이즈로 판정(근접 22px, MK_LIVE.handleAt). 첫 탭 =
             선택, 그 다음 모서리 근처 = 크기 조절 — 손가락의 해상도에 맞춘다. */
          if (ev.shiftKey && !hd) {                    /* R103 — Shift+클릭 = 다중 선택 토글 (드래그 억제) */
            const base = WS.sel && WS.sel.type !== 'scene' && WS.sel.idx != null ? [WS.sel.idx] : [];
            if (!WS.msel.length && base.length && base[0] !== i) WS.msel = base;
            const at = WS.msel.indexOf(i);
            if (at >= 0) WS.msel.splice(at, 1); else WS.msel.push(i);
            if (WS.msel.length === 1) { WS.sel = { type: selType(scene().elements[WS.msel[0]]), idx: WS.msel[0] }; WS.msel = []; }
            ev.preventDefault(); R(); return;
          }
          if (WS.msel.length) WS.msel = [];            /* 일반 클릭 = 다중 해제 (기존 단일 동작 복귀) */
          /* R106 — 같은 사진을 350ms 안에 두 번 탭 = 세밀 초점 후보.
             진입 확정은 up 에서 무이동일 때만 — 「탭 후 바로 끌기」를 잡아먹지 않는다 (교훈③) */
          const now2 = Date.now();
          const dtap = !!(el.src && el.fit !== 'contain' && window.MK_FOCAL && lastTap && lastTap.i === i && now2 - lastTap.t < 350);
          lastTap = { i, t: now2 };
          const wasSel = WS.sel && WS.sel.idx === i && WS.sel.type !== 'scene';
          WS.sel = { type: selType(el), idx: i };
          let handle = hd ? [...hd.classList].find((c) => c !== 'ws-hd') : null;
          if (!handle && wasSel && ev.pointerType && ev.pointerType !== 'mouse' && L.handleAt) {
            const rd9 = rotDeg(el);
            let pts9 = null;
            if (rd9 && L.handleAtPts) {
              /* R109 — 회전 요소의 손잡이는 외접 박스 모서리가 아니라 브라우저가
                 돌려놓은 자리에 있다. getBoundingClientRect(외접)로 재면 다른(없는)
                 손잡이가 잡히므로, .ws-hd 실좌표를 그대로 잰다. */
              pts9 = {};
              elDom.querySelectorAll('.ws-hd').forEach((h9) => {
                const k9 = [...h9.classList].find((c) => c !== 'ws-hd'); if (!k9) return;
                const r9 = h9.getBoundingClientRect();
                if (r9 && (r9.width > 0 || r9.height > 0))
                  pts9[k9] = [r9.left + r9.width / 2, r9.top + r9.height / 2];
              });
              const ks9 = Object.keys(pts9);
              if (ks9.length < 2 || !ks9.some((k9) =>
                pts9[k9][0] !== pts9[ks9[0]][0] || pts9[k9][1] !== pts9[ks9[0]][1])) pts9 = null;  /* 실측 불가 환경 */
            }
            handle = pts9 ? L.handleAtPts(pts9, ev.clientX, ev.clientY)
              : L.handleAt(elDom.getBoundingClientRect(), ev.clientX, ev.clientY);  /* rot=0 = 종전 그대로 */
          }
          const rh = t.closest && t.closest('[data-ws-rh]');   /* R107 — 회전 손잡이 */
          /* R110 — 회전의 축은 모델 박스의 중심이다(=CSS transform-origin, export 회전축).
             DOM 외접 상자의 중심은 사진·도형에서만 우연히 같다: 텍스트는 DOM 높이가
             textH 와 달라 축이 어긋나고, 손끝이 재는 각과 글자가 도는 각이 갈라졌다.
             실측 불가 환경에서는 종전 erect 중심으로 되돌아간다. */
          let epiv = null;
          try {
            const cpv = cpx(), crb = cv.getBoundingClientRect();
            if (L.pivotPx && cpv.CW > 0 && cpv.CH > 0) {
              const p0 = L.pivotPx(el, cpv.CW, cpv.CH);
              if (isFinite(p0.x) && isFinite(p0.y)) epiv = { x: crb.left + p0.x, y: crb.top + p0.y };
            }
          } catch (_) { epiv = null; }
          ges = { i, type: rh ? 'rotate' : (handle ? 'resize' : 'move'),
            epiv,                                      /* R110 — 모델 기준 회전 불변점 */
            erect: elDom.getBoundingClientRect(),      /* 폴백 — 회전해도 DOM 중심은 참(텍스트 제외) */
            dtap: rh ? false : dtap,                                      /* R106 — 더블탭 후보 (무이동 up 에서 확정) */
            handle,
            start: pickGeo(el), sx: ev.clientX, sy: ev.clientY,
            rect: cv.getBoundingClientRect(), moved: false,
            pre: JSON.stringify(doc().scenes) };            /* 되돌릴 지점 = 제스처 시작 상태 */
          if (cv.setPointerCapture && ev.pointerId != null) { try { cv.setPointerCapture(ev.pointerId); } catch (_) {} }
          ev.preventDefault();
        });
        const onGesMove = (ev) => {
          if (!ges) return;
          if (ges.cropMode) {                          /* R105 — 초안만 갱신, 문서·undo 무변형 */
            const ce = WS.crop && scene() ? scene().elements[WS.crop.idx] : null;
            const crt = rotDeg(ce);                    /* R107 — 회전 요소는 손가락 방향을 제 축으로 돌려놓는다 */
            let dx, dy;
            if (crt) {
              const cv2 = cpx(), v2 = L.unrotVec(ev.clientX - ges.sx, ev.clientY - ges.sy, crt);
              dx = v2.x / (((ce.w || 0) / 100 * cv2.CW) || 1);
              dy = v2.y / (((ce.h || 0) / 100 * cv2.CH) || 1);
            } else {
              dx = (ev.clientX - ges.sx) / (ges.rect.width || 1);
              dy = (ev.clientY - ges.sy) / (ges.rect.height || 1);
            }
            const s = ges.start, MIN = window.MK_PHOTO.CROP_MIN, cl = (v, a, b) => Math.min(b, Math.max(a, v));
            const d = { ...s }, h = ges.handle;
            if (!h) { d.x = cl(s.x + dx, 0, 1 - s.w); d.y = cl(s.y + dy, 0, 1 - s.h); }
            else {
              if (h.indexOf('l') >= 0) { const nx = cl(s.x + dx, 0, s.x + s.w - MIN); d.w = s.x + s.w - nx; d.x = nx; }
              if (h.indexOf('r') >= 0) d.w = cl(s.w + dx, MIN, 1 - s.x);
              if (h.indexOf('t') >= 0) { const ny = cl(s.y + dy, 0, s.y + s.h - MIN); d.h = s.y + s.h - ny; d.y = ny; }
              if (h.indexOf('b') >= 0) d.h = cl(s.h + dy, MIN, 1 - s.y);
            }
            WS.crop.d = d; paintCrop(ges.host, d); return;
          }
          if (ges.focalMode) {                         /* R106 — 초안만 갱신, 문서·undo 무변형 */
            if (!WS.focal) { ges = null; return; }
            WS.focal.d = focalAt(ges.host, ev); paintFocal(ges.host, WS.focal.d); return;
          }
          const el = scene().elements[ges.i]; if (!el) { ges = null; return; }
          const dx = (ev.clientX - ges.sx) / (ges.rect.width || 1) * 100;
          const dy = (ev.clientY - ges.sy) / (ges.rect.height || 1) * 100;
          if (Math.abs(dx) + Math.abs(dy) > 0.15) ges.moved = true;
          if (ges.type === 'rotate') {                 /* R107 — 중심과 손끝의 각도 (0·90·180·270 자석은 MK_LIVE) */
            const er = ges.erect;
            const pv = ges.epiv || { x: er.left + er.width / 2, y: er.top + er.height / 2 };  /* R110 — 모델 축 우선 */
            L.rotateTo(el, pv.x, pv.y, ev.clientX, ev.clientY);
            ges.moved = true;
          } else if (ges.type === 'move') {
            /* 이동은 회전과 무관 — 중심 기준 회전이라 화면 이동량 = 좌표 이동량 */
            L.dragTo(el, ges.start.x, ges.start.y, dx, dy);
            L.snap(el, scene().elements.filter((_, j) => j !== ges.i), 1.2,
              (scene().width || 16) / (scene().height || 9));  /* 자석 정렬 — R108: 회전은 외접 박스로 */
          } else {
            const rt = rotDeg(el);
            let rx = dx, ry = dy;
            if (rt) {                                  /* R107 — 끈 거리를 요소의 제 축으로 */
              const v2 = L.unrotVec(ev.clientX - ges.sx, ev.clientY - ges.sy, rt);
              rx = v2.x / (ges.rect.width || 1) * 100;
              ry = v2.y / (ges.rect.height || 1) * 100;
            }
            L.resizeTo(el, ges.handle, ges.start, rx, ry,
              { aspect: L.aspectDefault ? L.aspectDefault(el, ges.handle, ev.shiftKey) : ev.shiftKey }); /* R95 — 사진 모서리 = 비율 기본 고정 */
            if (rt) {                                  /* R107 — 중심이 움직인 만큼 화면 앵커가 밀린다: Δ=(I−R)(c−c') */
              const s0 = ges.start, c2 = cpx();
              const CWp = c2.CW || 1, CHp = c2.CH || 1;
              const d2 = L.recenter(
                (s0.x + (s0.w || 0) / 2) / 100 * CWp, (s0.y + (s0.h || 0) / 2) / 100 * CHp,
                (el.x + (el.w || 0) / 2) / 100 * CWp, (el.y + (el.h || 0) / 2) / 100 * CHp, rt);
              el.x = Math.round((el.x + d2.x / CWp * 100) * 10) / 10;
              el.y = Math.round((el.y + d2.y / CHp * 100) * 10) / 10;
            }
          }
          const n = cv.querySelector(`[data-ws-el="${ges.i}"]`);
          if (n) paint(n, el);
        };
        const onGesUp = () => {
          if (!ges) return;
          if (ges.cropMode || ges.focalMode) { ges = null; return; } /* R105·R106 — 커밋은 ✓ 버튼에서만 */
          const g = ges; ges = null;
          if (g.moved) lastTap = null;                 /* R106 — 드래그였다면 탭 계보 리셋 */
          if (g.dtap && !g.moved) {                    /* R106 — 무이동 더블탭 확정 → 세밀 초점 진입 */
            const el2 = scene().elements[g.i];
            if (el2 && el2.src && el2.fit !== 'contain' && window.MK_FOCAL) {
              lastTap = null;
              const host = cv.querySelector(`[data-ws-el="${g.i}"]`);
              const md = host && host.querySelector('.ws-media');
              const nw = md ? (md.naturalWidth || md.videoWidth || 0) : 0;
              const nh = md ? (md.naturalHeight || md.videoHeight || 0) : 0;
              WS.crop = null;
              WS.focal = { idx: g.i, sc: WS.sceneIdx, d: window.MK_FOCAL.norm(el2.focal),
                nar: nw > 0 && nh > 0 ? nw / nh : (window.MK_FOCAL.narOf(el2.nar) || null) };
              swallow = true; R(); return;
            }
          }
          if (g.moved) {
            WS.undo.push(g.pre); if (WS.undo.length > 30) WS.undo.shift(); WS.redo = [];
            swallow = true;                                 /* 제스처 직후 합성 click 무시 */
          }
          R();
        };
        cv.addEventListener('pointermove', onGesMove);
        cv.addEventListener('pointerup', onGesUp);
        cv.addEventListener('pointercancel', onGesUp);
        cv.addEventListener('click', (e2) => { if (swallow && e2.target !== cv) { swallow = false; e2.stopPropagation(); } }, true);
        const cvClick = cv.onclick;
        cv.onclick = (e2) => { if (swallow) { swallow = false; return; } if (cvClick) cvClick(e2); };
      }

      /* Context Panel */
      const txt = root.querySelector('[data-ws-txt]');
      if (txt) {
        let snapped = false;
        txt.oninput = () => {
          if (!snapped) { snap(); snapped = true; }
          scene().elements[+txt.dataset.wsTxt].text = txt.value;
          const elDom = root.querySelector(`[data-ws-el="${txt.dataset.wsTxt}"]`);
          if (elDom) elDom.innerHTML = m.esc(txt.value).replace(/\n/g, '<br>');
        };
        txt.onchange = () => R();
      }
      const ab = root.querySelector('[data-ws-anim]'); if (ab) ab.onclick = () => PG.go('animation');
      /* R47 — 채우기 방식 */
      root.querySelectorAll('[data-ws-fit]').forEach((b) => b.onclick = () => {
        const el = scene().elements[+b.dataset.wsFitidx];
        if (!el) return;
        snap(); el.fit = b.dataset.wsFit; R();
      });
      /* R94 — 초점 (가운데 선택 = focal 삭제, MK_FOCAL.set 규약) */
      root.querySelectorAll('[data-ws-focal]').forEach((b) => b.onclick = () => {
        const el = scene().elements[+b.dataset.wsFocalidx];
        if (!el || !el.src || !window.MK_FOCAL) return;
        const [fx, fy] = b.dataset.wsFocal.split(',').map(Number);
        snap(); window.MK_FOCAL.set(el, fx, fy); R();
      });
      /* R104 — 원클릭 프리셋 (MK_SMART) — 무변화면 undo 를 남기지 않는다 */
      root.querySelectorAll('[data-ws-smart]').forEach((b) => b.onclick = () => {
        const SM = window.MK_SMART; if (!SM) return;
        const pre = JSON.stringify(doc().scenes);
        const r = SM.run(scene(), b.dataset.wsSmart, window.MK_ARRANGE);
        if (r && r.ok && r.changed) {
          WS.undo.push(pre); if (WS.undo.length > 30) WS.undo.shift(); WS.redo = [];
          WS.smartMsg = (SM.RULES.find((x) => x.id === b.dataset.wsSmart) || {}).name + ' — ' + r.changed + '곳 정돈 (↺로 되돌리기)';
        } else WS.smartMsg = '이미 정돈되어 있어요';
        R();
      });
      /* R103 — 정렬·간격 (MK_ARRANGE) */
      root.querySelectorAll('[data-ws-arr]').forEach((b) => b.onclick = () => {
        const AR = window.MK_ARRANGE; if (!AR || WS.msel.length < 2) return;
        const els = WS.msel.map((ix) => scene().elements[ix]).filter(Boolean);
        snap();
        const m2 = b.dataset.wsArr;
        const s9 = scene(), ar9 = (s9.width || 16) / (s9.height || 9);   /* R109 — 회전 요소는 외접 박스로 정렬·간격 */
        const r = m2 === 'dist-h' ? AR.distribute(els, 'h', ar9) : m2 === 'dist-v' ? AR.distribute(els, 'v', ar9) : AR.align(els, m2, ar9);
        if (r && r.ok) R();
      });
      /* R101 — 사진 보정·필터 (MK_PHOTO) */
      const PH = window.MK_PHOTO;
      const phEl = () => WS.sel && WS.sel.idx != null ? scene().elements[WS.sel.idx] : null;
      if (PH) {
        root.querySelectorAll('[data-ws-pfilter]').forEach((b) => b.onclick = () => {
          const el = phEl(); if (!el) return;
          snap(); PH.apply(el, b.dataset.wsPfilter); R();
        });
        root.querySelectorAll('[data-ws-pshape]').forEach((b) => b.onclick = () => {
          const el = phEl(); if (!el) return;
          snap(); PH.setShape(el, b.dataset.wsPshape); R();
        });
        root.querySelectorAll('[data-ws-pflip]').forEach((b) => b.onclick = () => {
          const el = phEl(); if (!el) return;
          snap(); PH.flip(el, b.dataset.wsPflip); R();
        });
        const rz = root.querySelector('[data-ws-preset0]');
        if (rz) rz.onclick = () => { const el = phEl(); if (!el) return; snap(); PH.reset(el); R(); };
        /* R105 — 자르기: 진입(초안=기존 crop 또는 풀프레임)·해제·확인·취소.
           초안은 WS.crop.d 에만 살고 문서는 확인 순간까지 무변형 — undo 1건 보장 */
        const cb = root.querySelector('[data-ws-pcrop]');
        if (cb) cb.onclick = () => {
          const el = phEl(); if (!el || !el.src) return;
          WS.focal = null;                             /* R106 — 두 모드 상호배타 */
          WS.crop = { idx: WS.sel.idx, sc: WS.sceneIdx, d: PH.cropOf(el) || { x: 0, y: 0, w: 1, h: 1 } };
          R();
        };
        /* R106 — 세밀 초점 확인·취소: 초안은 WS.focal.d 에만 살고 문서는 ✓ 순간까지 무변형 */
        const fok = root.querySelector('[data-ws-fook]');
        if (fok) fok.onclick = () => {
          const el = scene().elements[WS.focal && WS.focal.idx]; if (!el) { WS.focal = null; R(); return; }
          snap(); window.MK_FOCAL.setFine(el, WS.focal.d.x, WS.focal.d.y, WS.focal.nar); WS.focal = null; R();
        };
        const fno = root.querySelector('[data-ws-fono]');
        if (fno) fno.onclick = () => { WS.focal = null; R(); };
        const cb0 = root.querySelector('[data-ws-pcrop0]');
        if (cb0) cb0.onclick = () => { const el = phEl(); if (!el) return; snap(); PH.setCrop(el, null); R(); };
        const cok = root.querySelector('[data-ws-crok]');
        if (cok) cok.onclick = () => {
          const el = scene().elements[WS.crop && WS.crop.idx]; if (!el) { WS.crop = null; R(); return; }
          snap(); PH.setCrop(el, WS.crop.d); WS.crop = null; R();
        };
        const cno = root.querySelector('[data-ws-crno]');
        if (cno) cno.onclick = () => { WS.crop = null; R(); };
        const rp = root.querySelector('[data-ws-preplace]');
        if (rp) rp.onclick = () => {                   /* §11 — 구조는 두고 사진만. 취소 = 변화 0 (R46 규약) */
          const el = phEl(); if (!el || !window.MK_LIVE) return;
          const inp = document.createElement('input');
          inp.type = 'file'; inp.accept = 'image/*';
          inp.onchange = () => window.MK_LIVE.fileToSrc(inp.files && inp.files[0], (src, err) => {
            if (!src) { if (err && typeof alert === 'function') alert(err); return; }
            snap();
            el.src = src; el.label = inp.files[0].name.replace(/\.[^.]+$/, '');
            delete el.video;                           /* 사진으로 확정 — 영상 흔적 정리 */
            R();
          });
          inp.click();
        };
        /* 슬라이더 — input: 재렌더 없이 캔버스 media·수치만 직갱신(§22), 드래그 세션당 snap 1회(§24), change: R() 커밋·자동저장 */
        root.querySelectorAll('[data-ws-padj]').forEach((s) => {
          const key = s.dataset.wsPadj; const d = PH.BY[key];
          let armed = false;
          s.oninput = () => {
            const el = phEl(); if (!el || !d) return;
            if (!armed) { snap(); armed = true; }
            PH.setVal(el, key, +s.value);
            const dom = root.querySelector(`[data-ws-el="${WS.sel.idx}"] .ws-media`);
            if (dom) { const sc2 = scene(); const cw = dom.closest('[data-ws-canvas]'); dom.style.filter = PH.css(el, (cw ? cw.offsetWidth : sc2.width) / sc2.width); }
            const val = root.querySelector(`[data-ws-pval="${key}"]`);
            if (val) val.textContent = d.def === 1 ? Math.round(+s.value * 100) + '%' : +s.value + d.unit;
          };
          s.onchange = () => { armed = false; R(); };
        });
      }
      /* R107 — 회전 컨트롤 (요소 종류 무관). 슬라이더 한 번 끌면 undo 한 칸 규약(R101) 승계 */
      {
        const rEl = () => (WS.sel && WS.sel.type !== 'scene' && scene() ? scene().elements[WS.sel.idx] : null);
        root.querySelectorAll('[data-ws-rotby]').forEach((b) => {
          b.onclick = () => { const el = rEl(); if (!el) return;
            snap(); L.setRot(el, L.rotOf(el) + (+b.dataset.wsRotby || 0)); R(); };
        });
        const r0 = root.querySelector('[data-ws-rot0]');
        if (r0) r0.onclick = () => { const el = rEl(); if (!el) return; snap(); L.setRot(el, 0); R(); };
        const rr = root.querySelector('[data-ws-rotr]');
        if (rr) {
          let armed = false;
          rr.oninput = () => {
            const el = rEl(); if (!el) return;
            if (!armed) { snap(); armed = true; }
            L.setRot(el, +rr.value);
            const dom = root.querySelector(`[data-ws-el="${WS.sel.idx}"]`);
            if (dom) dom.style.transform = L.rotOf(el) ? `rotate(${L.rotOf(el)}deg)` : '';
            const lab = root.querySelector('[data-ws-rotval]');
            if (lab) lab.textContent = L.rotOf(el) + '°';
          };
          rr.onchange = () => { armed = false; R(); };
        }
      }

      /* R49 — 자막 디자인 */
      root.querySelectorAll('[data-ws-cap]').forEach((b) => b.onclick = () => {
        if (!window.MK_CAPTION) return;
        snap();
        window.MK_CAPTION.apply(scene(), b.dataset.wsCap);
        WS.sel = { type: 'scene' }; R();
      });
      /* R56 — 텍스트 스타일: 프리셋·글꼴·색·배경·정렬·전 씬 적용 */
      const TS = window.MK_TEXTSTYLE;
      const selEl = () => WS.sel && WS.sel.idx != null ? scene().elements[WS.sel.idx] : null;
      if (TS) {
        root.querySelectorAll('[data-ws-tsp]').forEach((b) => b.onclick = () => {
          const el = selEl(); if (!el || el.kind !== 'text') return;
          snap(); TS.applyPreset(el, b.dataset.wsTsp); R();
        });
        const fsel = root.querySelector('[data-ws-tfont]');
        if (fsel) fsel.onchange = () => {
          const el = selEl(); if (!el || el.kind !== 'text') return;
          snap();
          if (fsel.value === 'Pretendard') delete el.font; else el.font = fsel.value;
          R();
        };
        root.querySelectorAll('[data-ws-tcol]').forEach((b) => b.onclick = () => {
          const el = selEl(); if (!el || el.kind !== 'text') return;
          snap(); el.color = b.dataset.wsTcol; R();
        });
        root.querySelectorAll('[data-ws-tbg]').forEach((b) => b.onclick = () => {
          const el = selEl(); if (!el || el.kind !== 'text') return;
          snap();
          if (b.dataset.wsTbg === 'none') delete el.bg;
          else el.bg = { color: TS.BGS[+b.dataset.wsTbg], radius: 0.22 };
          R();
        });
        root.querySelectorAll('[data-ws-tal]').forEach((b) => b.onclick = () => {
          const el = selEl(); if (!el || el.kind !== 'text') return;
          snap(); el.align = b.dataset.wsTal; R();
        });
        const allBtn = root.querySelector('[data-ws-tsall]');
        if (allBtn) allBtn.onclick = () => {
          const el = selEl(); if (!el || el.kind !== 'text') return;
          snap();
          const r = TS.applyAll(doc(), TS.styleOf(el));
          if (typeof window.alert === 'function') window.alert(`모든 장면의 글자 ${r.count}개에 이 스타일을 적용했어요.`);
          R();
        };
      }
      const sb = root.querySelector('[data-ws-selscene]'); if (sb) sb.onclick = () => { WS.sel = { type: 'scene' }; R(); };
      const pb = root.querySelector('[data-ws-selproj]'); if (pb) pb.onclick = () => { WS.sel = null; R(); };

      /* 하단 모드 */
      root.querySelectorAll('[data-ws-mode]').forEach((b) => b.onclick = () => { WS.mode = b.dataset.wsMode; R(); });

      /* AI Dock */
      root.querySelectorAll('[data-ws-ai]').forEach((b) => b.onclick = () => {
        const p = proj();
        window.MK_PROJ.logAI(WS.projectId, DOCK_ACTIONS.find(([k]) => k === b.dataset.wsAi)[1], 'Dock 제안');
        const chat = root.querySelector('#wsDockChat');
        const div = document.createElement('div'); div.className = 'msg';
        div.innerHTML = `<b>${DOCK_ACTIONS.find(([k]) => k === b.dataset.wsAi)[1]}</b><p>${m.esc(DOCK_REPLY[b.dataset.wsAi](p))}</p>`;
        chat.prepend(div);
      });

      /* 저장 단축 표시 갱신 (TopBar 저장 상태는 Export/공유 등에서 touch) */
      WS.savedAt = WS.savedAt; /* noop — 구조 유지 */
    },
  };
})();
