/* ============================================================
   screens/video3.js (R67) — 내 사진으로 자동 구성 입구
   ------------------------------------------------------------
   R66 까지 자동 구성(MK_SVAR·MK_SVARX)은 Builder 의 견본 사진으로만
   돌았다. 실제 쓰는 사람이 자기 사진으로 들어오는 문은 #/video 다.
   여기서 그 문을 연다.

   · 슬라이드쇼 스테이지: 사진마다 「★ 중요 / ⊘ 빼기」 역할 지정(§19)
     → 중요는 더 길게·큰 자리, 뺀 사진은 이번 구성에서만 빠지고
       목록에는 그대로 남는다(원본 무손상).
   · 「🎲 자동 구성으로 만들기」 — buildSmart(씨앗 동행) → 프로젝트 생성
     → Workspace. 거기서 「다른 구성으로」가 바로 살아 있다(§12).
   · 비포 & 애프터도 같은 문 — 쌍은 그대로 두고 순서·비교 방식만 다시 골라진다.
   · 기존 「🎬 영상 만들기」(고정 구성)는 그대로 존속 — 대체가 아니라 갈래 추가.
   video.js(R53)·video2.js(R61)의 API 무손상, 이 파일은 뒤에서 감싸기만 한다.
   ============================================================ */
(() => {
  'use strict';
  const H = window.MK_VIDHUB;
  if (!H) return;
  const C = () => window.MK_COMPOSE;
  const M = () => window.MK_MANIFEST;
  const S = () => window.MK_SVAR;
  const esc = H.esc;

  /* ---------------- 역할 상태 (미디어와 같은 인덱스) ---------------- */
  H.st.roles = [];
  const syncRoles = () => { while (H.st.roles.length < H.st.medias.length) H.st.roles.push(''); H.st.roles.length = H.st.medias.length; };

  /* video2 조작을 감싸 역할을 함께 움직인다 — 순서가 어긋나면 엉뚱한 사진이 빠진다 */
  const baseStage = H.stageMedias, baseMove = H.moveMedia, baseRemove = H.removeMedia, baseReset = H.resetStage;
  H.stageMedias = (ms) => { baseStage(ms); syncRoles(); };
  H.moveMedia = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= H.st.medias.length) return;
    baseMove(i, dir); syncRoles();
    const t = H.st.roles[i]; H.st.roles[i] = H.st.roles[j]; H.st.roles[j] = t;
  };
  H.removeMedia = (i) => { baseRemove(i); H.st.roles.splice(i, 1); syncRoles(); };
  H.resetStage = () => { baseReset(); H.st.roles = []; H.st.pairRoles = []; H.st.seed = ''; H.st.pairFormPick = 'auto'; };
  H.setRole = (i, role) => { syncRoles(); H.st.roles[i] = H.st.roles[i] === role ? '' : role; };
  H.st.seed = '';

  /* 드래그 정렬(video2 내부)은 medias·captions 만 옮긴다 — 역할도 같이 옮기도록 훅 */
  H.dragRole = (from, to) => { const r = H.st.roles.splice(from, 1)[0]; H.st.roles.splice(to, 0, r == null ? '' : r); };

  /* ---------------- R69 쌍 역할 (자리 인덱스 기준) ---------------- */
  /* 쌍은 전→후가 한 몸이라 역할도 쌍 단위다. 화면에서는 자리(몇 번째 쌍)로 잡고,
     엔진에 넘길 때 이름표(_oi)로 옮긴다 — 순서를 바꿔도 역할이 딴 쌍에 붙지 않는다. */
  H.st.pairRoles = [];
  const syncPairRoles = () => {
    while (H.st.pairRoles.length < H.st.pairs.length) H.st.pairRoles.push('');
    H.st.pairRoles.length = H.st.pairs.length;
  };
  const basePAdd = H.addPair, basePMove = H.movePair, basePDel = H.removePair;
  H.addPair = () => { basePAdd(); syncPairRoles(); };
  H.movePair = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= H.st.pairs.length) return;
    basePMove(i, dir); syncPairRoles();
    const t = H.st.pairRoles[i]; H.st.pairRoles[i] = H.st.pairRoles[j]; H.st.pairRoles[j] = t;
  };
  H.removePair = (i) => { basePDel(i); H.st.pairRoles.splice(i, 1); syncPairRoles(); };
  H.setPairRoleAt = (i, role) => { syncPairRoles(); H.st.pairRoles[i] = H.st.pairRoles[i] === role ? '' : role; };

  /* ---------------- R73 구성 형태 (간결 ↔ 전 구성) ----------------
     R72 는 쌍이 많으면 조용히 간결 구성으로 지었다 — 만드는 사람은 그 사실도,
     되돌릴 길도 몰랐다. 여기서 고르게 한다. 기본은 자동(종전과 동일). */
  H.st.pairFormPick = 'auto';
  H.setPairForm = (v) => { H.st.pairFormPick = (v === 'compact' || v === 'full') ? v : 'auto'; };

  /* ---------------- 이 구조에 자동 구성이 있는가 ---------------- */
  /* Manifest 에 등록된 템플릿 중 이 Composition 을 쓰는 것 — Builder 로 새로 만든
     템플릿이 붙어도 코드 수정 없이 자동으로 잡힌다. */
  H.smartTemplateFor = (compId) => {
    if (!M() || !compId) return null;
    const list = M().listTemplates().filter((t) => t.compositionId === compId);
    if (!list.length) return null;
    const exact = list.find((t) => t.mode !== 'reference') || list[0];
    return exact.id;
  };
  const canSmart = () => !!(S() && H.smartTemplateFor(H.st.comp));

  /* ---------------- 자동 구성 입력 ---------------- */
  H.smartInput = () => {
    const inp = H.stagedInput();
    if (H.st.stage === 'pairs') {
      syncPairRoles();
      /* stagedInput 은 빈 쌍을 걸러 내므로 자리 번호가 밀린다 — 같은 기준으로 다시 세어
         역할이 딴 쌍에 붙지 않게 한다. */
      const kept = H.st.pairs.map((p, i) => i).filter((i) => H.st.pairs[i].before || H.st.pairs[i].after);
      const pairs = (inp.pairs || []).map((p, j) => ({
        ...p,
        before: p.before ? { ...p.before, _oi: j * 2 } : p.before,
        after: p.after ? { ...p.after, _oi: j * 2 + 1 } : p.after,
      }));
      const pr = {};
      pairs.forEach((p, j) => {
        const role = H.st.pairRoles[kept[j]];
        if (!role) return;
        const key = String(p.before ? p.before._oi : p.after._oi);
        pr[key] = role;
      });
      return { ...inp, pairs, ...(Object.keys(pr).length ? { pairRoles: pr } : {}),
        ...(H.st.pairFormPick && H.st.pairFormPick !== 'auto' ? { pairFormPick: H.st.pairFormPick } : {}) };
    }
    syncRoles();
    const roles = {};
    H.st.roles.forEach((r, i) => { if (r) roles[i] = r; });
    return { ...inp, ...(Object.keys(roles).length ? { mediaRoles: roles } : {}) };
  };

  /* 미리보기용 요약 — 실제 buildSmart 를 돌린 결과만 말한다(추정 금지) */
  H.smartPeek = () => {
    const tid = H.smartTemplateFor(H.st.comp);
    if (!tid || !S()) return null;
    const inp = H.smartInput();
    if (H.st.stage === 'media' && !(inp.medias || []).length) return null;
    if (H.st.stage === 'pairs' && !(inp.pairs || []).length) return null;
    const r = S().buildSmart(tid, inp, { theme: H.st.theme, seed: H.st.seed || undefined });
    if (!r.ok) return { ok: false, why: r.guide || r.why || '' };
    return { ok: true, variant: r.smart.variant, scenes: r.doc.scenes.length,
      total: r.total != null ? r.total : null, warnings: r.warnings || [],
      method: r.smart.method || null,
      /* R73 — 형태와 「다른 형태로 가면 어떻게 되는지」. 한 번의 빌드에서 나온 값이다. */
      pairForm: r.smart.pairForm || null };
  };

  /* ---------------- 자동 구성으로 만들기 ---------------- */
  H.buildSmartStaged = () => {
    const tid = H.smartTemplateFor(H.st.comp);
    if (!tid || !S()) { H.st.msg = '자동 구성 엔진이 없어요.'; return { ok: false, why: 'no-engine' }; }
    const seed = H.st.seed && H.st.seed.trim() ? H.st.seed.trim()
      : (window.MK_SVARX ? window.MK_SVARX.nextSeed(null) : 'k1');
    const r = S().buildSmart(tid, H.smartInput(), { theme: H.st.theme, seed });
    if (!r.ok) { H.st.msg = r.guide || '자동 구성을 만들지 못했어요.'; return r; }
    if (window.MK_SVARX) window.MK_SVARX.markSources(r.doc, 'random', seed);
    const say = [].concat(r.warnings || [], r.notes || []).filter((x) => String(x || '').trim());
    if (say.length && typeof window.alert === 'function') window.alert(say.join('\n'));
    if (!window.MK_PROJ) { H.st.msg = '프로젝트 저장소가 없어요.'; return { ok: false, why: 'no-proj' }; }
    const comp = C() && C().getComposition(H.st.comp);
    const pj = window.MK_PROJ.createFromDoc(r.doc, (H.st.title.trim() || (comp ? comp.name : '자동 구성')) + ' 자동 구성');
    window.MK_PROJ.open(pj.projectId);
    return { ...r, projectId: pj.projectId, seed };
  };

  /* ---------------- 렌더 조각 ---------------- */
  const ROLE_LABEL = { highlight: '★ 중요', exclude: '⊘ 뺌' };
  H.renderRoleChips = (i) => {
    const cur = H.st.roles[i] || '';
    return `<span class="vh-roles">
      <button data-vh-role="highlight" data-i="${i}" class="vh-rolebtn${cur === 'highlight' ? ' on' : ''}" title="더 길고 큰 자리로">★</button>
      <button data-vh-role="exclude" data-i="${i}" class="vh-rolebtn${cur === 'exclude' ? ' on' : ''}" title="이번 구성에서 빼기 (목록엔 남아요)">⊘</button>
    </span>`;
  };

  H.renderPairRoleChips = (i) => {
    const cur = H.st.pairRoles[i] || '';
    return `<span class="vh-roles">
      <button data-vh-prole="highlight" data-i="${i}" class="vh-rolebtn${cur === 'highlight' ? ' on' : ''}" title="이 쌍의 비교 장면을 더 길게">★</button>
      <button data-vh-prole="exclude" data-i="${i}" class="vh-rolebtn${cur === 'exclude' ? ' on' : ''}" title="이번 구성에서 이 쌍 빼기 (목록엔 남아요)">⊘</button>
    </span>`;
  };

  /* R71 — 요약 한 줄만 따로 뽑는다. 역할을 바꿨을 때 목록 전체를 다시 그리지 않고
     이 줄만 갈아 끼우기 위해서다(사진 30장에서 전체 재렌더는 0.7초, 이 줄만은 즉시). */
  H.smartLineHTML = () => {
    const peek = H.smartPeek();
    return !peek ? '<em class="vh-est">사진을 넣으면 어떤 구성이 잡히는지 바로 보여줘요</em>'
      : !peek.ok ? `<em class="vh-est vh-est-warn">${esc(peek.why)}</em>`
        : `<em class="vh-est">자동 구성: <b>${esc(peek.variant)}</b> · 장면 ${peek.scenes}개${peek.total != null ? ' · 약 ' + peek.total + '초' : ''}${peek.method ? ' · ' + esc(peek.method) : ''}</em>`
          + H.formLineHTML(peek.pairForm)
          + (peek.warnings || []).map((w) => `<em class="vh-est vh-est-warn">⚠ ${esc(w)}</em>`).join('');
  };

  /* R73 — 지금 형태와 「다른 형태로 가면 어떻게 되는지」.
     장면 수는 정확한 값이라 늘 적고, 초는 하한이라 **권장 길이를 넘을 때만** 적는다
     (넘지 않는 자리에서 「최소 16초」라고 적으면 실제 31초와 달라 거짓처럼 읽힌다). */
  const FORM_NAME = { compact: '간결', full: '전 구성' };
  H.formLineHTML = (pf) => {
    if (!pf || !pf.form) return '';
    const per = pf.form === 'compact' ? '쌍마다 1장면' : '쌍마다 전·후·비교';
    const a = pf.alt || {};
    const alt = !a.can ? `<br>${esc(a.why || '')}`
      : a.form === 'full'
        ? `<br>전 구성으로 하면 장면 ${a.scenes}개${a.over ? ' · 아무리 눌러도 ' + a.minTotal + '초 (권장 ' + pf.maxTotal + '초를 넘어요)' : ''}`
        : `<br>간결로 하면 장면 ${a.scenes}개 (쌍 제목처럼 그 장면에 없는 문구는 빠져요)`;
    return `<em class="vh-est">구성 형태: <b>${FORM_NAME[pf.form] || pf.form}</b> · ${per}`
      + (pf.pick !== 'auto' && pf.pick !== pf.form ? ' <span class="vh-est-warn">— 고른 형태를 못 지켰어요</span>' : '')
      + (pf.pick === 'auto' && pf.auto === 'compact' ? ' (자동 판정)' : '') + alt + '</em>';
  };

  H.renderSmartBar = () => {
    if (!canSmart()) return '';
    const kept = H.st.stage === 'media' ? H.st.roles.filter((r) => r === 'exclude').length : 0;
    const keptP = H.st.stage === 'pairs' ? H.st.pairRoles.filter((r) => r === 'exclude').length : 0;
    const line = H.smartLineHTML();
    return `<div class="vh-smart">
      <b style="font:var(--mk-t-h3);font-size:13px">🎲 자동 구성</b>
      <p class="ed-note" style="margin:4px 0 6px;font-size:11.5px">사진 수·방향·문구를 보고 구성을 골라 짜요.${H.st.stage === 'media' ? ' ★ 는 더 길고 큰 자리, ⊘ 는 이번 구성에서만 빠져요(목록엔 남아요).' : ' 쌍은 그대로 두고 순서·비교 방식만 골라요. ★ 는 그 쌍의 비교 장면을 더 길게, ⊘ 는 이번 구성에서만 빼요(자리·크기는 비교 방식이 정해요).'}${kept ? ' 지금 뺀 사진 ' + kept + '장.' : ''}${keptP ? ' 지금 뺀 쌍 ' + keptP + '개.' : ''}</p>
      ${H.st.stage === 'pairs' ? `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
        <span class="ed-note" style="font-size:11.5px">구성 형태</span>
        ${['auto', 'compact', 'full'].map((v) => `<button class="vh-chip${(H.st.pairFormPick || 'auto') === v ? ' on' : ''}" data-vh-pform="${v}" title="${v === 'auto' ? '권장 길이에 맞춰 자동으로 골라요' : v === 'compact' ? '쌍마다 장면 하나 — 짧게' : '쌍마다 전·후·비교 — 길어질 수 있어요'}">${v === 'auto' ? '자동' : v === 'compact' ? '간결' : '전 구성'}</button>`).join('')}
      </div>` : ''}
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <input class="vh-input" id="vhSeed" placeholder="씨앗 (비우면 자동 — 같은 씨앗 = 같은 구성)" value="${esc(H.st.seed || '')}" maxlength="20" style="flex:1;min-width:150px;margin:0">
        <button class="vh-chip" data-vh-reseed>🎲 다른 씨앗</button>
      </div>
      <span id="vhEst">${line}</span>
      <button class="vh-go" data-vh-smart>🎲 자동 구성으로 만들기</button>
    </div>`;
  };

  /* ---------------- 화면 승격 — video2 렌더를 감싼다 ---------------- */
  const base = window.MK_SCREENS.video;
  window.MK_SCREENS.video = {
    title: base.title, variants: base.variants,
    render() {
      let html = base.render.call(base);
      if (!H.st.stage) return html;
      /* 미디어 행에 역할 칩 — video2 가 그린 행 안에 삽입(행 구조 무변) */
      if (H.st.stage === 'media') {
        syncRoles();
        html = html.replace(/<span class="vh-rowbtns">\s*\n?\s*<button data-vh-mup="(\d+)"/g,
          (m0, i) => H.renderRoleChips(+i) + m0);
        html = html.replace(/(<div class="vh-row"[^>]*data-vh-mrow="(\d+)")/g,
          (m0, all, i) => (H.st.roles[+i] === 'exclude' ? all.replace('class="vh-row"', 'class="vh-row vh-row-off"') : all));
      }
      /* R69 — 쌍 행에 역할 칩 (행 구조는 그대로, 버튼 묶음 앞에만 끼운다) */
      if (H.st.stage === 'pairs' && canSmart()) {
        syncPairRoles();
        html = html.replace(/<button data-vh-pup="(\d+)"/g, (m0, i) => H.renderPairRoleChips(+i) + m0);
        html = html.replace(/<div class="vh-pair" data-vh-prow="(\d+)"/g,
          (m0, i) => (H.st.pairRoles[+i] === 'exclude' ? m0.replace('class="vh-pair"', 'class="vh-pair vh-row-off"') : m0));
      }
      /* 스테이지 안, 만들기 버튼 앞에 자동 구성 갈래 */
      const bar = H.renderSmartBar();
      if (bar) html = html.replace(/<button class="vh-go" data-vh-build>/, bar + '<button class="vh-go" data-vh-build>');
      return html;
    },
    mount(root) {
      base.mount.call(base, root);
      const redraw = () => { root.innerHTML = this.render(); this.mount(root); };
      root.querySelectorAll('[data-vh-role]').forEach((b) => b.onclick = (e) => {
        e.stopPropagation();
        H.setRole(+b.dataset.i, b.dataset.vhRole); redraw();
      });
      root.querySelectorAll('[data-vh-prole]').forEach((b) => b.onclick = (e) => {
        e.stopPropagation();
        H.setPairRoleAt(+b.dataset.i, b.dataset.vhProle); redraw();
      });
      /* 드래그 정렬 재배선 — video2 는 사진·문구만 옮긴다. 역할이 안 따라오면
         엉뚱한 사진이 빠지므로 같은 조작에 역할까지 묶어 다시 건다. */
      let from = null;
      root.querySelectorAll('[data-vh-mrow]').forEach((row) => {
        row.ondragstart = (e) => { from = +row.dataset.vhMrow; if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'; };
        row.ondragover = (e) => e.preventDefault();
        row.ondrop = (e) => {
          e.preventDefault();
          const to = +row.dataset.vhMrow;
          if (from == null || from === to) return;
          const m = H.st.medias.splice(from, 1)[0], c = H.st.captions.splice(from, 1)[0];
          H.st.medias.splice(to, 0, m); H.st.captions.splice(to, 0, c);
          H.dragRole(from, to);
          from = null; redraw();
        };
      });
      root.querySelectorAll('[data-vh-pform]').forEach((b) => b.onclick = (e) => {
        e.stopPropagation();
        H.setPairForm(b.dataset.vhPform); redraw();
      });
      const sd = root.querySelector('#vhSeed');
      if (sd) { sd.oninput = () => { H.st.seed = sd.value; }; sd.onchange = () => redraw(); }
      const rs = root.querySelector('[data-vh-reseed]');
      if (rs) rs.onclick = () => { H.st.seed = window.MK_SVARX ? window.MK_SVARX.nextSeed(H.st.seed) : String(Date.now()); redraw(); };
      const sm = root.querySelector('[data-vh-smart]');
      if (sm) sm.onclick = () => {
        const r = H.buildSmartStaged();
        if (!r.ok) { const el = root.querySelector('#vhMsg'); if (el) el.textContent = H.st.msg; redraw(); }
      };
    },
  };
})();
