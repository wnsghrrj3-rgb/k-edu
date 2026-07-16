/* ============================================================
   K-MAKER Template Builder v1  (#/builder) — 운영자 전용 도구
   ------------------------------------------------------------
   일반 사용자용 화면이 아니라 **운영자가 템플릿을 제작·관리**하는
   기준 도구. Template = Scene·Asset·Animation·Style·Metadata 통합 저장.
   ------------------------------------------------------------
   레이아웃: 좌 Template Explorer(상태 필터 5) /
             중앙 Template Canvas(+Scene Builder) /
             우 Template Properties(9필드)
   Editable Area: 요소별 교체 가능 지정(제목·본문·사진·영상·아이콘·배경)
   Lock Area:     수정 불가 지정
   Publish:       draft → review → approved(완료) → published
                  게시 시 MK_TPL.register()로 실제 Template Browser 노출
   ⚠ 샘플 데이터·세션 저장 — 실DB 없음. 스키마가 저장 포맷 기준.
   ============================================================ */
(() => {
  const M = () => window.MK;

  /* ---------- 상태 사전 ---------- */
  const STATUS = [
    ['draft', '초안'], ['review', '검수중'], ['approved', '완료'], ['published', '게시됨'],
  ];
  const stName = (k) => (STATUS.find(([s]) => s === k) || [])[1] || k;
  const EDIT_TYPES = [['title', '제목'], ['body', '본문'], ['photo', '사진'], ['video', '영상'], ['icon', '아이콘'], ['bg', '배경']];

  /* ---------- Builder 저장소 (세션) ---------- */
  const STORE = [];
  let seq = 0;
  const nid = () => 'tb-' + (++seq);

  function fromEngine(t, status) {
    /* MK_TPL 레코드 → Builder 작업본 (Scene 사본 + 엔진 메타 동반) */
    const src = window.MK_SAMPLE.TEMPLATES.find((x) => x.templateId === t.templateId);
    return {
      tbId: nid(), status, publishedId: status === 'published' ? t.templateId : null,
      name: t.title.replace(' (샘플)', ''), description: t.description,
      category: t.contentType, style: t.style, ratio: t.ratio,
      target: t.targetUser || 'teacher', tags: (t.ai?.tags || t.tags || []).join(', '),
      difficulty: t.difficulty || '보통',
      styleId: t.styleId, animationId: t.animationId, assetIds: [...(t.assetIds || [])],
      scenes: JSON.parse(JSON.stringify(src ? src.scenes : t.scenes)),
    };
  }

  let seeded = false;
  function ensure() {
    if (seeded) return; seeded = true;
    /* 기존 엔진 8종 = 게시됨 */
    window.MK_TPL.list().filter((t) => !t.duplicated).forEach((t) => STORE.push(fromEngine(t, 'published')));
    /* 초안·검수중 샘플 */
    const d = fromEngine(window.MK_TPL.get('smp-pres-01'), 'draft');
    d.name = '과학 실험 보고 발표 (제작 중)'; d.tags = '과학, 실험, 보고';
    d.scenes[0].elements[0].editable = { type: 'title' };
    STORE.push(d);
    const r = fromEngine(window.MK_TPL.get('smp-card-01'), 'review');
    r.name = '독서 기록 카드 (검수 대기)'; r.tags = '독서, 기록';
    r.scenes.forEach((s) => s.elements.forEach((e, i) => { if (e.kind === 'text') e.editable = { type: i === 0 ? 'title' : 'body' }; }));
    STORE.push(r);
  }

  /* ---------- Builder 상태 ---------- */
  const TB = { filter: 'all', cur: null, sceneIdx: 0, selEl: null /* number | 'bg' | null */ };
  const cur = () => STORE.find((t) => t.tbId === TB.cur) || null;
  const scene = () => cur()?.scenes[TB.sceneIdx];

  function create() {
    ensure();
    const t = {
      tbId: nid(), status: 'draft', publishedId: null,
      name: '새 템플릿', description: '', category: 'presentation', style: '모던', ratio: '16:9',
      target: 'teacher', tags: '', difficulty: '쉬움',
      styleId: 'st-modern', animationId: 'an-calm', assetIds: [],
      scenes: [{ id: 's' + Date.now(), name: '표지', width: 1280, height: 720, duration: 5, background: '#FFFFFF', transition: 'fade', order: 0,
        elements: [{ kind: 'text', x: 10, y: 30, w: 70, size: 10, text: '제목이 들어갑니다', weight: 700 }] }],
    };
    STORE.push(t);
    return t;
  }

  /* ---------- Publish 파이프라인 ---------- */
  const FLOW = { draft: 'review', review: 'approved', approved: 'published' };
  const FLOW_LABEL = { draft: '검수 요청 →', review: '검수 통과 →', approved: '게시하기 →' };
  function advance(t) {
    const next = FLOW[t.status];
    if (!next) return;
    t.status = next;
    if (next === 'published') {
      /* 엔진 레지스트리 등록 → Template Browser에 실노출 (확장점 register 첫 실사용) */
      const tpl = {
        templateId: 'tb-pub-' + Date.now(), title: t.name, description: t.description || t.name,
        contentType: t.category, category: catName(t.category), style: t.style, ratio: t.ratio,
        difficulty: t.difficulty, targetUser: t.target, gradeRange: '전학년',
        uses: t.tags || t.name, tags: t.tags.split(',').map((x) => x.trim()).filter(Boolean),
        scenes: JSON.parse(JSON.stringify(t.scenes)),
      };
      const reg = window.MK_TPL.register(tpl, {
        styleId: t.styleId, animationId: t.animationId, assetIds: [...t.assetIds],
        ai: { recommended: false, tags: tpl.tags, hints: [] },
      });
      t.publishedId = reg.templateId;
    }
  }
  const demote = (t) => { t.status = 'draft'; };
  const catName = (k) => (window.MK_SAMPLE.TYPES.find((x) => x.key === k) || {}).name || k;

  /* ================= 좌: Template Explorer ================= */
  const Explorer = () => {
    ensure();
    const m = M();
    const filters = [['all', '전체 Template'], ...STATUS];
    const list = STORE.filter((t) => TB.filter === 'all' || t.status === TB.filter);
    return `<div class="tb-explorer">
      ${m.Button({ label: '＋ 새 Template', size: 'sm', attrs: 'data-tb-new style="width:100%;justify-content:center;margin-bottom:8px"' })}
      <div class="flt">${filters.map(([k, n]) => `<button class="${TB.filter === k ? 'on' : ''}" data-tb-flt="${k}">${n}<span>${k === 'all' ? STORE.length : STORE.filter((t) => t.status === k).length}</span></button>`).join('')}</div>
      <div class="lst">${list.map((t) => `<button class="itm ${TB.cur === t.tbId ? 'on' : ''}" data-tb-open="${t.tbId}">
        <span class="st st-${t.status}">${stName(t.status)}</span><b>${m.esc(t.name)}</b><small>${catName(t.category)} · ${t.scenes.length}장</small></button>`).join('') || '<p class="mut">이 상태의 템플릿이 없어요</p>'}</div>
    </div>`;
  };

  /* ================= 중앙: Template Canvas + Scene Builder ================= */
  const BASE_W = 520;
  const Canvas = () => {
    const m = M(), t = cur();
    if (!t) return `<div class="tb-canvaswrap"><div class="tb-empty">왼쪽에서 템플릿을 고르거나<br>＋ 새 Template로 시작하세요</div></div>`;
    const sc = scene();
    const CW = BASE_W, CH = Math.round(CW * sc.height / sc.width);
    const els = sc.elements.map((el, i) => {
      const on = TB.selEl === i ? 'sel' : '';
      const badge = el.locked ? '<span class="mark lock">🔒</span>' : el.editable ? `<span class="mark edit">E·${(EDIT_TYPES.find(([k]) => k === el.editable.type) || [])[1] || ''}</span>` : '';
      const base = `class="tb-el ${on} ${el.locked ? 'locked' : ''} ${el.editable ? 'editable' : ''}" data-tb-el="${i}"`;
      if (el.kind === 'text') {
        const fs = (el.size / 100 * CH).toFixed(1);
        return `<div ${base} style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400}">${badge}${m.esc(el.text).replace(/\n/g, '<br>')}</div>`;
      }
      return `<div ${base} style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%">${badge}<span class="lb">${m.esc(el.label || '요소')}</span></div>`;
    }).join('');
    const bgBadge = sc.bgEditable ? '<span class="mark edit bg">E·배경</span>' : '';
    return `<div class="tb-canvaswrap">
      <div class="tb-canvashead">
        <span class="st st-${t.status}">${stName(t.status)}</span>
        <b>${m.esc(t.name)}</b>
        <span class="grow"></span>
        ${m.Button({ label: '👁 Preview', kind: 'secondary', size: 'sm', attrs: 'data-tb="preview"' })}
        ${t.status !== 'published'
          ? m.Button({ label: FLOW_LABEL[t.status], kind: 'accent', size: 'sm', attrs: 'data-tb="advance"' })
          : m.Button({ label: '게시됨 ✓ (Browser 노출 중)', kind: 'secondary', size: 'sm', attrs: 'disabled' })}
        ${t.status === 'review' ? m.Button({ label: '반려', kind: 'secondary', size: 'sm', attrs: 'data-tb="demote"' }) : ''}
      </div>
      <div class="tb-stage"><div class="tb-canvas ${TB.selEl === 'bg' ? 'bgsel' : ''}" data-tb-bg style="width:${CW}px;height:${CH}px;background:${sc.background}">${bgBadge}${els}</div></div>
      <div class="tb-scenes">
        ${t.scenes.map((s, i) => `<div class="sc ${i === TB.sceneIdx ? 'on' : ''}">
          <button class="fr" data-tb-sc="${i}">${m.sceneThumb(s)}<span class="n">${i + 1}</span></button>
          <div class="ops">
            <button data-tb-mv="-1" data-i="${i}" ${i === 0 ? 'disabled' : ''}>←</button>
            <button data-tb-op="dup" data-i="${i}">⧉</button>
            <button data-tb-op="del" data-i="${i}" ${t.scenes.length < 2 ? 'disabled' : ''}>✕</button>
            <button data-tb-mv="1" data-i="${i}" ${i === t.scenes.length - 1 ? 'disabled' : ''}>→</button>
          </div></div>`).join('')}
        <button class="add" data-tb-op="add">＋<br><small>Scene</small></button>
      </div>
    </div>`;
  };

  /* ================= 우: Template Properties + Editable/Lock ================= */
  const fld = (label, key, val, tag = 'input') =>
    `<label class="cx-field"><span>${label}</span>${tag === 'textarea'
      ? `<textarea data-tb-p="${key}" rows="2">${M().esc(String(val))}</textarea>`
      : `<input type="text" data-tb-p="${key}" value="${M().esc(String(val))}">`}</label>`;
  const sel = (label, key, val, opts) =>
    `<label class="cx-field"><span>${label}</span><select data-tb-p="${key}">${opts.map(([k, n]) => `<option value="${k}" ${k === val ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`;

  const Props = () => {
    const m = M(), t = cur();
    if (!t) return `<div class="ws-context"><small class="cap">Properties</small><h3>—</h3><p class="mut">템플릿을 선택하세요</p></div>`;
    const sc = scene();

    /* 요소 선택 시: Editable / Lock 지정 패널 */
    let areaPanel = '';
    if (TB.selEl === 'bg') {
      areaPanel = `<div class="tb-area"><h4>배경 — Editable Area</h4>
        ${m.Button({ label: sc.bgEditable ? '교체 가능 해제' : '배경을 교체 가능으로', kind: sc.bgEditable ? 'secondary' : '', size: 'sm', attrs: 'data-tb-bgedit style="width:100%;justify-content:center"' })}
        <p class="mut" style="margin-top:6px">사용자가 배경을 바꿀 수 있게 돼요</p></div>`;
    } else if (typeof TB.selEl === 'number' && sc.elements[TB.selEl]) {
      const el = sc.elements[TB.selEl];
      areaPanel = `<div class="tb-area"><h4>선택 요소 — ${el.kind === 'text' ? '텍스트' : (el.label || '요소')}</h4>
        <div class="sub">Editable Area 유형</div>
        <div class="types">${EDIT_TYPES.map(([k, n]) => `<button class="${el.editable?.type === k ? 'on' : ''}" data-tb-et="${k}" ${el.locked ? 'disabled' : ''}>${n}</button>`).join('')}</div>
        ${el.editable ? m.Button({ label: 'Editable 해제', kind: 'secondary', size: 'sm', attrs: 'data-tb-eclear style="width:100%;justify-content:center;margin-top:6px"' }) : ''}
        <div class="sub" style="margin-top:10px">Lock Area</div>
        ${m.Button({ label: el.locked ? '🔓 잠금 해제' : '🔒 수정 불가로 잠금', kind: el.locked ? 'secondary' : '', size: 'sm', attrs: 'data-tb-lock style="width:100%;justify-content:center"' })}
        <p class="mut" style="margin-top:6px">잠긴 요소는 사용자 화면에서 고정돼요</p></div>`;
    }

    return `<div class="ws-context tb-props"><small class="cap">Template Properties</small><h3>속성</h3>
      ${fld('이름', 'name', t.name)}
      ${fld('설명', 'description', t.description, 'textarea')}
      ${sel('카테고리', 'category', t.category, window.MK_TPL.CATEGORIES)}
      ${sel('스타일', 'style', t.style, Object.values(window.MK_TPL.STYLES).map((s) => [s.name, s.name]))}
      ${sel('비율', 'ratio', t.ratio, [['16:9', '16:9'], ['1:1', '1:1'], ['3:4', '3:4'], ['A4', 'A4']])}
      ${sel('대상', 'target', t.target, [['teacher', '교사'], ['student', '학생']])}
      ${fld('태그 (쉼표 구분)', 'tags', t.tags)}
      ${sel('난이도', 'difficulty', t.difficulty, [['쉬움', '쉬움'], ['보통', '보통'], ['어려움', '어려움']])}
      <label class="cx-field"><span>Scene 개수</span><input type="text" value="${t.scenes.length}장" readonly></label>
      ${areaPanel}
      <p class="mut" style="margin-top:8px">⚠ 세션 저장 — 실DB 연결 후속</p>
    </div>`;
  };

  /* ================= Template Preview (사용자 화면 시뮬) ================= */
  function openPreview() {
    const m = M(), t = cur();
    if (!t) return;
    let idx = 0;
    const editCount = () => t.scenes.reduce((a, s) => a + s.elements.filter((e) => e.editable).length + (s.bgEditable ? 1 : 0), 0);
    const draw = () => {
      const sc = t.scenes[idx];
      const CW = 480, CH = Math.round(CW * sc.height / sc.width);
      const els = sc.elements.map((el) => {
        const hl = el.editable ? 'hl' : '';
        if (el.kind === 'text') {
          const fs = (el.size / 100 * CH).toFixed(1);
          return `<div class="pv-el ${hl}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;font-size:${fs}px;font-weight:${el.weight || 400}">${m.esc(el.text).replace(/\n/g, '<br>')}</div>`;
        }
        return `<div class="pv-el box ${hl}" style="left:${el.x}%;top:${el.y}%;width:${el.w}%;height:${el.h}%"></div>`;
      }).join('');
      return `<div class="tb-preview">
        <h2>${m.esc(t.name)} <span class="st st-${t.status}">${stName(t.status)}</span></h2>
        <p class="mut">사용자에게 보이는 모습 — <b>교체 가능 영역 ${editCount()}곳</b>이 강조돼 있어요 ${sc.bgEditable ? '(배경 포함)' : ''}</p>
        <div class="stage ${sc.bgEditable ? 'bghl' : ''}" style="width:${CW}px;height:${CH}px;background:${sc.background}">${els}</div>
        <div class="nav">${m.IconButton({ icon: '‹', attrs: 'data-pv="prev"' })}<span>${idx + 1} / ${t.scenes.length} · ${m.esc(sc.name)}</span>${m.IconButton({ icon: '›', attrs: 'data-pv="next"' })}</div>
        <div style="display:flex;justify-content:flex-end;margin-top:10px">${m.Button({ label: '닫기', kind: 'secondary', size: 'sm', attrs: 'data-pv="close"' })}</div>
      </div>`;
    };
    m.Modal.open(draw());
    const back = document.getElementById('mkModal');
    back.querySelector('.mk-modal').classList.add('te-wide');
    const wire = () => {
      back.querySelector('[data-pv="prev"]').onclick = () => { idx = (idx - 1 + t.scenes.length) % t.scenes.length; redraw(); };
      back.querySelector('[data-pv="next"]').onclick = () => { idx = (idx + 1) % t.scenes.length; redraw(); };
      back.querySelector('[data-pv="close"]').onclick = () => m.Modal.close();
    };
    const redraw = () => { back.querySelector('.mk-modal').innerHTML = draw(); wire(); };
    wire();
  }

  /* ================= 화면 등록 ================= */
  window.MK_SCREENS.builder = {
    title: 'Template Builder', variants: ['운영자'],
    render() {
      ensure();
      return `<span class="pg-note">Template Builder v1 — 운영자 전용 · 세션 저장(실DB 후속) · 게시하면 Template Browser에 실노출</span>
        <div class="tb-shell">${Explorer()}<div class="tb-main">${Canvas()}</div>${Props()}</div>`;
    },
    mount(root) {
      const R = () => PG.render();
      const t = cur();

      /* Explorer */
      root.querySelectorAll('[data-tb-flt]').forEach((b) => b.onclick = () => { TB.filter = b.dataset.tbFlt; R(); });
      root.querySelectorAll('[data-tb-open]').forEach((b) => b.onclick = () => { TB.cur = b.dataset.tbOpen; TB.sceneIdx = 0; TB.selEl = null; R(); });
      const nw = root.querySelector('[data-tb-new]');
      if (nw) nw.onclick = () => { const n = create(); TB.cur = n.tbId; TB.filter = 'all'; TB.sceneIdx = 0; TB.selEl = null; R(); };
      if (!t) return;

      /* Publish */
      const acts = {
        preview: openPreview,
        advance: () => { advance(t); R(); },
        demote: () => { demote(t); R(); },
      };
      root.querySelectorAll('[data-tb]').forEach((b) => b.onclick = () => acts[b.dataset.tb]?.());

      /* Scene Builder */
      root.querySelectorAll('[data-tb-sc]').forEach((b) => b.onclick = () => { TB.sceneIdx = +b.dataset.tbSc; TB.selEl = null; R(); });
      root.querySelectorAll('[data-tb-op]').forEach((b) => b.onclick = () => {
        const i = +b.dataset.i;
        if (b.dataset.tbOp === 'add') {
          const base = scene();
          t.scenes.push({ id: 's' + Date.now(), name: '새 장면', width: base.width, height: base.height, duration: 5, background: '#FFFFFF', transition: 'fade', order: t.scenes.length,
            elements: [{ kind: 'text', x: 10, y: 40, w: 70, size: 8, text: '내용', weight: 700 }] });
          TB.sceneIdx = t.scenes.length - 1;
        } else if (b.dataset.tbOp === 'dup') { t.scenes.splice(i + 1, 0, JSON.parse(JSON.stringify(t.scenes[i]))); TB.sceneIdx = i + 1; }
        else if (t.scenes.length > 1) { t.scenes.splice(i, 1); TB.sceneIdx = Math.min(TB.sceneIdx, t.scenes.length - 1); }
        TB.selEl = null; R();
      });
      root.querySelectorAll('[data-tb-mv]').forEach((b) => b.onclick = () => {
        const i = +b.dataset.i, dir = +b.dataset.tbMv, j = i + dir;
        [t.scenes[i], t.scenes[j]] = [t.scenes[j], t.scenes[i]];
        if (TB.sceneIdx === i) TB.sceneIdx = j; else if (TB.sceneIdx === j) TB.sceneIdx = i;
        R();
      });

      /* Canvas 선택 (요소·배경) */
      root.querySelectorAll('[data-tb-el]').forEach((el) => el.onclick = (e) => { e.stopPropagation(); TB.selEl = +el.dataset.tbEl; R(); });
      const cv = root.querySelector('[data-tb-bg]');
      if (cv) cv.onclick = () => { TB.selEl = 'bg'; R(); };

      /* Editable / Lock */
      root.querySelectorAll('[data-tb-et]').forEach((b) => b.onclick = () => { scene().elements[TB.selEl].editable = { type: b.dataset.tbEt }; R(); });
      const ec = root.querySelector('[data-tb-eclear]'); if (ec) ec.onclick = () => { delete scene().elements[TB.selEl].editable; R(); };
      const lk = root.querySelector('[data-tb-lock]');
      if (lk) lk.onclick = () => {
        const el = scene().elements[TB.selEl];
        el.locked = !el.locked;
        if (el.locked) delete el.editable; /* 잠금과 교체 가능은 배타 */
        R();
      };
      const bge = root.querySelector('[data-tb-bgedit]'); if (bge) bge.onclick = () => { scene().bgEditable = !scene().bgEditable; R(); };

      /* Properties 실입력 */
      root.querySelectorAll('[data-tb-p]').forEach((inp) => {
        const apply = () => { t[inp.dataset.tbP] = inp.value; };
        inp.onchange = () => { apply(); R(); };
        if (inp.tagName !== 'SELECT') inp.oninput = apply;
      });
    },
  };
})();
