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
    zoom: 100, nav: 'scenes', dock: false,
    undo: [], redo: [], savedAt: null,
  };
  const proj = () => window.MK_PROJ.get(WS.projectId);
  const doc = () => proj()?.doc;
  const scene = () => doc()?.scenes[WS.sceneIdx];

  const MODES = [['design', 'Design'], ['presentation', 'Presentation'], ['video', 'Video'], ['photo', 'Photo']];
  const modeOf = (ct) => ct === 'video' ? 'video' : ct === 'presentation' ? 'presentation' : 'design';

  /* undo/redo — doc 스냅샷 (placeholder 구조) */
  const snap = () => { WS.undo.push(JSON.stringify(doc().scenes)); if (WS.undo.length > 30) WS.undo.shift(); WS.redo = []; };
  const undo = () => { if (!WS.undo.length) return; WS.redo.push(JSON.stringify(doc().scenes)); doc().scenes = JSON.parse(WS.undo.pop()); WS.sceneIdx = Math.min(WS.sceneIdx, doc().scenes.length - 1); };
  const redo = () => { if (!WS.redo.length) return; WS.undo.push(JSON.stringify(doc().scenes)); doc().scenes = JSON.parse(WS.redo.pop()); WS.sceneIdx = Math.min(WS.sceneIdx, doc().scenes.length - 1); };

  /* 외부 진입 API — MK_PROJ.open이 호출 */
  window.MK_WS = {
    enter(projectId) {
      WS.projectId = projectId; WS.sceneIdx = 0; WS.sel = null;
      WS.undo = []; WS.redo = []; WS.savedAt = null; WS.dock = false; WS.nav = 'scenes';
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
      <div class="pjname"><b>${m.esc(p.name)}</b><small id="wsSave">${WS.savedAt ? '저장됨 · ' + WS.savedAt : '저장 안 함'}</small></div>
      <div class="quick">${QUICK.map(([k, l]) => `<button class="qk" data-ws-q="${k}">${l}</button>`).join('')}</div>
      <span class="grow"></span>
      ${m.IconButton({ icon: '↺', tip: '실행 취소', attrs: `data-ws="undo" ${WS.undo.length ? '' : 'disabled'}` })}
      ${m.IconButton({ icon: '↻', tip: '다시 실행', attrs: `data-ws="redo" ${WS.redo.length ? '' : 'disabled'}` })}
      ${m.Button({ label: '미리보기', kind: 'secondary', size: 'sm', attrs: 'data-ws="preview"' })}
      ${m.Button({ label: p.shared ? '공유 중' : '공유', kind: 'secondary', size: 'sm', attrs: 'data-ws="share"' })}
      ${m.Button({ label: '내보내기', kind: 'accent', size: 'sm', attrs: 'data-ws="export"' })}
      ${m.IconButton({ icon: '✦', tip: 'AI Dock', on: WS.dock, attrs: 'data-ws="dock"' })}
    </div>`;
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
  const CanvasArea = () => {
    const sc = scene();
    const CW = Math.round(BASE_W * WS.zoom / 100), CH = Math.round(CW * sc.height / sc.width);
    const els = sc.elements.map((el, i) => {
      const on = WS.sel && WS.sel.idx === i && WS.sel.type !== 'scene' ? 'sel' : '';
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        return `<div class="ws-el text ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400}${el.color ? `;color:${el.color}` : ''}">${M().esc(el.text).replace(/\n/g, '<br>')}</div>`;
      }
      if (el.src) {                                    /* R45 — Workspace도 실이미지·실영상 표시 (R36 editor와 동일) */
        const fit = el.fit === 'contain' ? 'contain' : 'cover';
        const media = (el.video === true || el.kind === 'video' || /^data:video\//.test(el.src))
          ? `<video class="ws-media" src="${el.src}" muted autoplay loop playsinline style="width:100%;height:100%;object-fit:${fit};display:block"></video>`
          : `<img class="ws-media" src="${el.src}" alt="${M().esc(el.label || '')}" draggable="false" style="width:100%;height:100%;object-fit:${fit};display:block">`;
        return `<div class="ws-el media ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;overflow:hidden">${media}</div>`;
      }
      if (el.fill) {                                   /* R45 — 색 채움 요소 (자막 바 등) 실표시 */
        return `<div class="ws-el media ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%;background:${el.fill}"></div>`;
      }
      return `<div class="ws-el box ${on}" data-ws-el="${i}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%"><span>${M().esc(el.label || '요소')}</span></div>`;
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
  const ContextPanel = () => {
    const m = M(), sc = scene(), p = proj();
    let title = '프로젝트', body = '';
    let sel = WS.sel;
    /* 방어: undo·삭제 등으로 선택 요소가 사라졌으면 Scene으로 폴백 */
    if (sel && sel.type !== 'scene' && !sc.elements[sel.idx]) { WS.sel = sel = { type: 'scene' }; }
    if (!sel) {
      body = field('이름', p.name) + field('종류', p.contentType) + field('Scene 수', doc().scenes.length) +
        field('스타일', doc().engine?.style?.name || '—') + field('애니메이션', doc().engine?.animation?.name || '—') +
        `<div class="cx-sw">${(doc().engine?.style?.palette || []).map((c) => `<span style="background:${c}"></span>`).join('')}</div>`;
    } else if (sel.type === 'scene') {
      title = 'Scene';
      body = field('이름', sc.name) + field('크기', sc.width + '×' + sc.height) + field('배경', sc.background) +
        (WS.mode === 'video' || WS.mode === 'presentation' ? field('길이', (sc.duration || 0) + '초') + field('전환', sc.transition || 'none') : '') +
        `<button class="cx-scenebtn" data-ws-anim>✨ 애니메이션 편집 →</button>`;
    } else {
      const el = sc.elements[sel.idx];
      if (el.kind === 'text') {
        title = '텍스트';
        body = `<label class="cx-field"><span>내용</span><textarea data-ws-txt="${sel.idx}" rows="3">${m.esc(el.text)}</textarea></label>` +
          field('크기', el.size) + field('굵기', el.weight || 400) + field('폭', el.w + '%') +
          `<div class="cx-hint">글꼴·색·정렬·행간 — 시안 반영 대상</div>`;
      } else if (sel.type === 'video') {
        title = '영상';
        body = field('클립', el.label || '영상') + fitCtl(el, sel.idx) + field('볼륨', '100%') + `<div class="cx-hint">트리밍·속도 — 후속</div>`;
      } else if (sel.type === 'shape') {
        title = '도형';
        body = field('종류', el.label || '도형') + field('채움', '단색') + field('테두리', '없음');
      } else {
        title = '이미지';
        body = field('이름', el.label || '이미지') + field('크기', el.w + '×' + el.h + '%') + fitCtl(el, sel.idx) +
          `<div class="cx-hint">자르기·보정·필터 — Photo 모드/후속</div>`;
      }
    }
    return `<div class="ws-context"><small class="cap">속성</small><h3>${title}</h3>${body}
      ${sel && sel.type !== 'scene' ? `<button class="cx-scenebtn" data-ws-selscene>← Scene 속성 보기</button>` : ''}
      ${sel ? `<button class="cx-scenebtn" data-ws-selproj>프로젝트 속성 보기</button>` : ''}</div>`;
  };

  /* ================= 하단: Footer — 모드·Zoom·Page·Timeline ================= */
  const FooterBar = () => {
    const m = M(), d = doc(), sc = scene();
    const timeline = WS.mode === 'video'
      ? `<div class="ws-timeline">${d.scenes.map((s, i) => `<button class="tl ${i === WS.sceneIdx ? 'on' : ''}" style="flex:${s.duration || 3}" data-ws-sc="${i}"><small>${i + 1}</small><span>${s.duration || 3}s</span></button>`).join('')}</div>`
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
      const R = () => PG.render();

      /* 상단 */
      const act = {
        back: () => PG.go('projects'),
        dock: () => { WS.dock = !WS.dock; R(); },
        undo: () => { undo(); R(); }, redo: () => { redo(); R(); },
        zin: () => { WS.zoom = Math.min(160, WS.zoom + 10); R(); },
        zout: () => { WS.zoom = Math.max(40, WS.zoom - 10); R(); },
        prev: () => { WS.sceneIdx = Math.max(0, WS.sceneIdx - 1); WS.sel = { type: 'scene' }; R(); },
        next: () => { WS.sceneIdx = Math.min(doc().scenes.length - 1, WS.sceneIdx + 1); WS.sel = { type: 'scene' }; R(); },
        preview: () => m.Modal.open(`<h2>미리보기</h2><div style="margin:14px 0;border:1px solid var(--mk-border);border-radius:8px;overflow:hidden">${m.sceneThumb(scene())}</div><p style="font:var(--mk-t-caption);color:var(--mk-text-secondary)">전체 재생 미리보기는 후속 단계</p><div style="display:flex;justify-content:flex-end;margin-top:12px">${m.Button({ label: '닫기', size: 'sm', attrs: 'onclick="MK.Modal.close()"' })}</div>`),
        share: () => { window.MK_PROJ.toggleShare(WS.projectId); R(); },
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

      /* 좌 내비 */
      root.querySelectorAll('[data-ws-nav]').forEach((b) => b.onclick = () => { WS.nav = b.dataset.wsNav; R(); });
      root.querySelectorAll('[data-ws-sc]').forEach((b) => b.onclick = () => { WS.sceneIdx = +b.dataset.wsSc; WS.sel = { type: 'scene' }; R(); });
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
