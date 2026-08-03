/* ============================================================
   Template Builder 화면 (R64)  —  #/tbuilder
   ------------------------------------------------------------
   GPT 4단계 지시서 §3~§16 — 관리 목록 → 새 템플릿(2단계) → 4영역 편집기.
   상단: 이름·상태·비율·미리보기·검사·저장 / 좌: Scene 목록 /
   중앙: 실미리보기(MK_RENDER 실렌더 + MK_PLAY 실재생) / 우: 속성.
   렌더·재생·검증·저장 전부 MK_TBUILD → MK_MANIFEST → MK_COMPOSE 재사용.
   화면 전용 렌더러 0. 정적 이미지로 영상 흉내내지 않음(§4-3).
   ============================================================ */
(() => {
  'use strict';
  const B = () => window.MK_TBUILD;
  const M = () => window.MK_MANIFEST;
  const C = () => window.MK_COMPOSE;
  const R = () => window.MK_RENDER;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 화면 상태 (편집 데이터는 전부 MK_TBUILD 소유 — 여긴 선택뿐) ---------- */
  const st = { view: 'list', tid: null, sid: null, ratio: null,
    sample: { mediaCount: 5, pairCount: 2 }, val: null, msg: '',
    filter: { q: '', status: '', composition: '' }, newTpl: null,
    /* R66 §24·§25 — 자동 구성(Variant) 설정 탭 · 테스트 모드 표 */
    tab: 'props', vsel: null, matrix: null, vval: null };

  /* ---------- 실빌드 (미리보기 공용) ---------- */
  function buildNow() {
    if (!st.tid) return null;
    const t = B().get(st.tid); if (!t) return null;
    return B().previewBuild(st.tid, { ratio: st.ratio || undefined,
      mediaCount: st.sample.mediaCount, pairCount: st.sample.pairCount });
  }

  /* ---------- 목록 화면 (§3) ---------- */
  function renderList() {
    const rows = B().list({ q: st.filter.q, status: st.filter.status || undefined,
      composition: st.filter.composition || undefined });
    const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? '방금' : m < 60 ? m + '분 전' : Math.round(m / 60) + '시간 전'; };
    const stName = { draft: '초안', ready: '게시 가능', inactive: '비활성' };
    return `<span class="pg-note">Template Builder — 코드 수정 없이 Registry 조합으로 실작동 템플릿을 만들어요. Ready 저장하면 #/video 갤러리에 실제로 떠요.</span>
      <div style="display:flex;gap:8px;margin:10px 0;flex-wrap:wrap">
        <button class="mk-btn mk-btn-primary" data-tb="new">＋ 새 템플릿</button>
        <input class="mk-input" data-tb="q" placeholder="템플릿 검색" value="${esc(st.filter.q)}" style="width:180px">
        <select class="mk-input" data-tb="fst" style="width:130px">
          <option value="">모든 상태</option>${['draft', 'ready', 'inactive'].map((s) => `<option value="${s}" ${st.filter.status === s ? 'selected' : ''}>${stName[s]}</option>`).join('')}
        </select>
        <select class="mk-input" data-tb="fcp" style="width:150px">
          <option value="">모든 구성</option>
          <option value="slideshow" ${st.filter.composition === 'slideshow' ? 'selected' : ''}>포토 슬라이드쇼</option>
          <option value="beforeafter" ${st.filter.composition === 'beforeafter' ? 'selected' : ''}>비포 & 애프터</option>
        </select>
      </div>
      ${rows.length ? '' : '<p class="ed-note">아직 템플릿이 없어요 — 새 템플릿으로 시작하세요.</p>'}
      <div style="display:flex;flex-direction:column;gap:8px">${rows.map((t) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid var(--mk-border,#E3E8EF);border-radius:12px;background:var(--mk-surface,#fff)">
          <div style="width:44px;height:30px;border-radius:6px;background:var(--mk-bg-secondary,#F2F5F9);display:flex;align-items:center;justify-content:center;font-size:11px">${t.thumbnail ? '🖼' : '—'}</div>
          <div style="flex:1;min-width:0">
            <b>${esc(t.name)}</b>
            <span style="margin-left:8px;font-size:11px;padding:2px 8px;border-radius:99px;background:${t.status === 'ready' ? '#E7F6EC;color:#1E7A3C' : t.status === 'inactive' ? '#F1F1F4;color:#777' : '#FFF4E0;color:#9A6200'}">${stName[t.status]}${t.gallery && t.status === 'ready' ? ' · 갤러리' : ''}</span>
            <div style="font-size:12px;color:var(--mk-text-secondary,#68737F)">${t.composition === 'beforeafter' ? '비포 & 애프터' : '포토 슬라이드쇼'} · ${esc(t.theme || '')} · ${esc(t.ratios)} · 장면 ${t.sceneCount} · ${ago(t.updatedAt)}</div>
          </div>
          <button class="mk-btn" data-tb="edit" data-id="${t.id}">편집</button>
          <button class="mk-btn" data-tb="dup" data-id="${t.id}">복제</button>
          <button class="mk-btn" data-tb="prev" data-id="${t.id}">미리보기</button>
        </div>`).join('')}</div>
      ${st.newTpl ? renderNew() : ''}`;
  }

  /* ---------- 새 템플릿 시작 단계 (§5 — 빈 Manifest 를 바로 안 보여준다) ---------- */
  function renderNew() {
    const n = st.newTpl;
    return `<div style="margin-top:14px;padding:16px;border:2px solid var(--mk-primary,#3B6EF6);border-radius:14px;background:var(--mk-surface,#fff);max-width:520px">
      <b>새 템플릿</b>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
        <input class="mk-input" data-tb="n-name" placeholder="템플릿 이름" value="${esc(n.name)}">
        <div>구성:
          <label style="margin-left:6px"><input type="radio" name="ncp" data-tb="n-cp" value="slideshow" ${n.composition !== 'beforeafter' ? 'checked' : ''}> 포토 슬라이드쇼</label>
          <label style="margin-left:10px"><input type="radio" name="ncp" data-tb="n-cp" value="beforeafter" ${n.composition === 'beforeafter' ? 'checked' : ''}> 비포 & 애프터</label></div>
        <div>기본 Theme:
          <select class="mk-input" data-tb="n-th" style="width:160px;margin-left:6px">${C().listThemes().map((t) => `<option value="${t.id}" ${n.theme === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
        <div>기본 비율:
          ${Object.keys(C().RATIOS).map((r) => `<label style="margin-right:10px"><input type="radio" name="nrt" data-tb="n-rt" value="${r}" ${(n.ratio || '16:9') === r ? 'checked' : ''}> ${r}</label>`).join('')}</div>
        <div style="display:flex;gap:8px"><button class="mk-btn mk-btn-primary" data-tb="n-go">만들기 → 편집</button>
          <button class="mk-btn" data-tb="n-cancel">취소</button></div>
      </div></div>`;
  }

  /* ---------- 편집기 (§4 — 4영역) ---------- */
  function renderEdit() {
    const t = B().get(st.tid);
    if (!t) { st.view = 'list'; return renderList(); }
    const mf = t.manifest;
    st.ratio = st.ratio && (mf.supportedRatios || []).includes(st.ratio) ? st.ratio : mf.defaultRatio;
    const stName = { draft: '초안', ready: '게시 가능', inactive: '비활성' };
    const r = buildNow();
    const selIdx = st.sid ? mf.scenes.findIndex((s) => s.id === st.sid) : -1;
    /* 중앙 — 선택 씬(또는 첫 씬)의 실렌더 SVG. 재생은 ▶ 실플레이어 */
    let stage = '<p class="ed-note">빌드 실패 — ' + esc(r && (r.guide || r.why) || '') + '</p>';
    let planInfo = '';
    if (r && r.ok) {
      const match = selIdx >= 0 ? r.doc.scenes.findIndex((s) => s.specId === st.sid) : -1;
      const scene = r.doc.scenes[match >= 0 ? match : 0];
      const svg = R().toSVG(R().renderScene(scene, { noCache: true }));
      const dur = r.doc.scenes.reduce((a, s) => a + (s.duration || 3), 0);
      planInfo = `장면 ${r.doc.scenes.length} · 약 ${Math.round(dur)}초 · ${esc(st.ratio)}${r.method ? ' · ' + esc(r.method) : ''}`;
      stage = `<div style="max-width:100%;overflow:hidden;border-radius:10px;border:1px solid var(--mk-border,#E3E8EF)">${svg}</div>`;
    }
    const val = st.val;
    return `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <button class="mk-btn" data-tb="back">← 목록</button>
        <input class="mk-input" data-tb="e-name" value="${esc(mf.meta.name)}" style="width:200px;font-weight:600">
        <span style="font-size:11px;padding:2px 8px;border-radius:99px;background:${t.status === 'ready' ? '#E7F6EC;color:#1E7A3C' : '#FFF4E0;color:#9A6200'}">${stName[t.status]}</span>
        ${(mf.supportedRatios || []).map((rt) => `<button class="mk-btn" data-tb="ratio" data-rt="${rt}" style="${st.ratio === rt ? 'border-color:var(--mk-primary,#3B6EF6);color:var(--mk-primary,#3B6EF6)' : ''}">${rt}</button>`).join('')}
        <span style="flex:1"></span>
        <button class="mk-btn" data-tb="play">▶ 미리보기</button>
        <button class="mk-btn" data-tb="matrix" style="${st.matrix ? 'border-color:var(--mk-primary,#3B6EF6);color:var(--mk-primary,#3B6EF6)' : ''}">◫ 테스트 모드</button>
        ${t.status === 'ready' ? '<button class="mk-btn" data-tb="smartopen">🎲 자동 구성으로 열기</button>' : ''}
        <button class="mk-btn" data-tb="check">유효성 검사</button>
        <button class="mk-btn" data-tb="draft">초안 저장</button>
        <button class="mk-btn mk-btn-primary" data-tb="ready">Ready 저장</button>
      </div>
      ${st.msg ? `<p class="ed-note" style="margin:0 0 8px">${esc(st.msg)}</p>` : ''}
      ${val ? `<div style="margin:0 0 10px;padding:10px 14px;border-radius:10px;border:1px solid ${val.ok ? '#BFE5CB' : '#F1C6C6'};background:${val.ok ? '#F2FBF5' : '#FDF4F4'}">
        <b>${val.ok ? '✓ 검사 통과' : '✗ 오류 ' + val.errors.length + '건'}</b>${val.warnings.length ? ' · 경고 ' + val.warnings.length + '건' : ''}
        ${val.errors.map((e) => `<div style="font-size:12px;margin-top:4px">✗ ${esc(e.msg)}</div>`).join('')}
        ${val.warnings.map((e) => `<div style="font-size:12px;margin-top:4px;color:#9A6200">⚠ ${esc(e.msg)}</div>`).join('')}
      </div>` : ''}
      <div style="display:grid;grid-template-columns:230px 1fr 290px;gap:12px;align-items:start">
        <div><!-- 좌: Scene 목록 (§4-2) -->
          <div style="display:flex;flex-direction:column;gap:6px">${mf.scenes.map((s, i) => `
            <div data-tb="sel" data-sid="${s.id}" style="padding:8px 10px;border-radius:10px;cursor:pointer;border:1px solid ${st.sid === s.id ? 'var(--mk-primary,#3B6EF6)' : 'var(--mk-border,#E3E8EF)'};background:var(--mk-surface,#fff)">
              <div style="display:flex;align-items:center;gap:6px"><b style="font-size:12px">${i + 1}. ${esc(s.name || s.id)}</b>
                ${s.required !== false ? '<span title="필수" style="font-size:10px">📌</span>' : ''}
                ${s.repeatable || s.usePlan ? '<span title="반복" style="font-size:10px">🔁</span>' : ''}</div>
              <div style="font-size:11px;color:var(--mk-text-secondary,#68737F)">${esc(s.role)} · ${esc(s.layout || (s.mediaSlots ? '커스텀' : '텍스트'))} · ${(s.duration || {}).default || 3}s</div>
              <div style="display:flex;gap:4px;margin-top:4px">
                <button class="mk-btn" data-tb="mv" data-sid="${s.id}" data-d="-1" style="padding:1px 7px;font-size:11px">▲</button>
                <button class="mk-btn" data-tb="mv" data-sid="${s.id}" data-d="1" style="padding:1px 7px;font-size:11px">▼</button>
                <button class="mk-btn" data-tb="scdup" data-sid="${s.id}" style="padding:1px 7px;font-size:11px">복제</button>
                <button class="mk-btn" data-tb="scdel" data-sid="${s.id}" style="padding:1px 7px;font-size:11px">삭제</button>
              </div></div>`).join('')}
          </div>
          <button class="mk-btn" data-tb="scadd" style="margin-top:8px;width:100%">＋ Scene 추가</button>
        </div>
        <div><!-- 중앙: 실미리보기 (§4-3) / 테스트 모드 표 (§25) -->
          <div style="font-size:12px;color:var(--mk-text-secondary,#68737F);margin-bottom:6px">${planInfo}</div>
          ${st.matrix ? renderMatrix(st.matrix) : stage}
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px;font-size:12px;flex-wrap:wrap">
            샘플: ${mf.pairMode
              ? '쌍 ' + [1, 2, 3].map((n) => `<button class="mk-btn" data-tb="spair" data-n="${n}" style="padding:2px 8px;${st.sample.pairCount === n ? 'border-color:var(--mk-primary,#3B6EF6)' : ''}">${n}</button>`).join('')
              : '사진 ' + [1, 3, 5, 10, 20].map((n) => `<button class="mk-btn" data-tb="smedia" data-n="${n}" style="padding:2px 8px;${st.sample.mediaCount === n ? 'border-color:var(--mk-primary,#3B6EF6)' : ''}">${n}</button>`).join('')}
            <button class="mk-btn" data-tb="sreset" style="padding:2px 8px">초기화</button>
          </div>
        </div>
        <div style="padding:12px;border:1px solid var(--mk-border,#E3E8EF);border-radius:12px;background:var(--mk-surface,#fff)">
          ${st.sid && selIdx >= 0 ? renderSceneProps(mf, mf.scenes[selIdx]) : `
            <div style="display:flex;gap:6px;margin-bottom:10px">
              <button class="mk-btn" data-tb="tab" data-k="props" style="flex:1;padding:4px 6px;font-size:12px;${st.tab !== 'svar' ? 'border-color:var(--mk-primary,#3B6EF6);color:var(--mk-primary,#3B6EF6)' : ''}">템플릿</button>
              <button class="mk-btn" data-tb="tab" data-k="svar" style="flex:1;padding:4px 6px;font-size:12px;${st.tab === 'svar' ? 'border-color:var(--mk-primary,#3B6EF6);color:var(--mk-primary,#3B6EF6)' : ''}">자동 구성${(mf.smartVariants || []).length ? ' ' + (mf.smartVariants || []).length : ''}</button>
            </div>
            ${st.tab === 'svar' ? renderVariants(t) : renderTplProps(t)}`}
        </div>
      </div>`;
  }

  /* ---------- 우측: 템플릿 속성 (§4-4 A) ---------- */
  function renderTplProps(t) {
    const mf = t.manifest;
    return `<b>템플릿 속성</b>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;font-size:13px">
        <label>설명<input class="mk-input" data-tb="p-desc" value="${esc(mf.meta.purpose || '')}" style="width:100%"></label>
        <label>카테고리<input class="mk-input" data-tb="p-cat" value="${esc(mf.meta.category || '')}" style="width:100%"></label>
        <label>태그(쉼표)<input class="mk-input" data-tb="p-tags" value="${esc((mf.meta.tags || []).join(', '))}" style="width:100%"></label>
        <label>Theme<select class="mk-input" data-tb="p-theme" style="width:100%">${C().listThemes().map((x) => `<option value="${x.id}" ${mf.theme === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <div>지원 비율<br>${Object.keys(C().RATIOS).map((r) => `<label style="margin-right:8px"><input type="checkbox" data-tb="p-sr" value="${r}" ${(mf.supportedRatios || []).includes(r) ? 'checked' : ''}> ${r}</label>`).join('')}</div>
        <label>기본 비율<select class="mk-input" data-tb="p-dr" style="width:100%">${(mf.supportedRatios || []).map((r) => `<option ${mf.defaultRatio === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
        <label>썸네일(대표 Layout)<select class="mk-input" data-tb="p-thumb" style="width:100%">
          <option value="">없음</option>${M().listLayouts().map((l) => `<option value="${l}" ${mf.meta.thumbnail === l ? 'selected' : ''}>${esc((M().getLayout(l) || {}).name || l)}</option>`).join('')}</select></label>
        <label><input type="checkbox" data-tb="p-gal" ${t.gallery ? 'checked' : ''}> Gallery 공개 (Ready 저장 시 #/video 노출)</label>
      </div>`;
  }

  /* ---------- 우측: 자동 구성 Variant 설정 (R66 §24) ---------- */
  /* Variant 정의는 Manifest.smartVariants 에 산다 — 저장 = 실행 포맷 하나.
     여기서 만든 것이 Ready 저장 시 그대로 MK_SVAR 로 연결된다. */
  function renderVariants(t) {
    const mf = t.manifest;
    const list = B().getVariants(st.tid);
    const v = list.find((x) => x.id === st.vsel) || null;
    const key = mf.pairMode ? 'pairCount' : 'mediaCount';
    const unit = mf.pairMode ? '쌍' : '사진';
    const val = st.vval;
    /* R67 — 수·방향 밖의 조건 축도 목록에서 바로 보이게 */
    const axisOf = (c0) => {
      const c2 = c0 || {}, out = [];
      if (c2.orientation) out.push({ portraitDominant: '세로', landscapeDominant: '가로', squareDominant: '정사각', mixed: '섞임', mixedOrientation: '섞임' }[c2.orientation] || c2.orientation);
      if (c2.mediaKind) out.push({ imageOnly: '사진만', videoOnly: '영상만', mixed: '사진+영상', none: '미디어 없음' }[c2.mediaKind] || c2.mediaKind);
      if (c2.hasCaptions != null) out.push(c2.hasCaptions ? '문구 있음' : '문구 없음');
      if (c2.hasTitle != null) out.push(c2.hasTitle ? '제목 있음' : '제목 없음');
      if (Array.isArray(c2.ratio) && c2.ratio.length) out.push(c2.ratio.join('/'));
      return out.length ? ' · ' + out.join(' · ') : '';
    };
    const rangeOf = (c) => {
      const lo = (c || {})[key + 'Min'], hi = (c || {})[key + 'Max'];
      if (lo == null && hi == null) return '조건 없음';
      return (lo != null ? lo : 1) + '~' + (hi != null ? hi : '∞') + unit;
    };
    const head = `<b>자동 구성 (Smart Variant)</b>
      <p class="ed-note" style="margin:6px 0 8px;font-size:11px">사진 수·방향에 따라 다른 구성을 고르게 해요. 정의가 없으면 기본 구성 하나로만 만들어져요.</p>
      ${val ? `<div style="margin-bottom:8px;padding:8px 10px;border-radius:8px;font-size:11px;border:1px solid ${val.ok ? '#BFE5CB' : '#F1C6C6'};background:${val.ok ? '#F2FBF5' : '#FDF4F4'}">
        <b>${val.ok ? '✓ 쓸 수 있어요' : '✗ 오류 ' + val.errors.length + '건'}</b>
        ${(val.errors || []).map((e) => `<div style="margin-top:3px">✗ ${esc(e.msg)}</div>`).join('')}
        ${(val.warnings || []).map((w) => `<div style="margin-top:3px;color:#9A6200">⚠ ${esc(w)}</div>`).join('')}
      </div>` : ''}
      <div style="display:flex;flex-direction:column;gap:5px">${list.map((x) => `
        <div data-tb="vsel" data-vid="${x.id}" style="padding:7px 9px;border-radius:9px;cursor:pointer;border:1px solid ${st.vsel === x.id ? 'var(--mk-primary,#3B6EF6)' : 'var(--mk-border,#E3E8EF)'}">
          <div style="display:flex;align-items:center;gap:6px"><b style="font-size:12px;flex:1">${esc(x.name || x.id)}</b>
            <button class="mk-btn" data-tb="vdel" data-vid="${x.id}" style="padding:0 6px;font-size:11px">✕</button></div>
          <div style="font-size:11px;color:var(--mk-text-secondary,#68737F)">${esc(rangeOf(x.conditions))}${esc(axisOf(x.conditions))} · 우선 ${x.priority == null ? 10 : x.priority} · Layout ${(x.layoutPool || []).length}</div>
        </div>`).join('')}</div>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button class="mk-btn" data-tb="vadd" style="flex:1;padding:3px 6px;font-size:12px">＋ 구성 추가</button>
        <button class="mk-btn" data-tb="vcheck" style="flex:1;padding:3px 6px;font-size:12px">검사</button>
      </div>`;
    if (!v) return head + (list.length ? '<p class="ed-note" style="margin-top:8px;font-size:11px">구성을 고르면 조건을 편집해요.</p>' : '');

    const c = v.conditions || {}, ss = v.sceneStrategy || {}, du = v.duration || {};
    const layouts = M().listLayouts();
    return head + `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--mk-border,#E3E8EF);display:flex;flex-direction:column;gap:7px;font-size:12px">
      <b style="font-size:12px">「${esc(v.name || v.id)}」 조건</b>
      <label>이름<input class="mk-input" data-tb="v-name" value="${esc(v.name || '')}" style="width:100%"></label>
      <div>${unit} 수 최소 <input class="mk-input" data-tb="v-min" type="number" min="1" value="${c[key + 'Min'] != null ? c[key + 'Min'] : ''}" style="width:56px">
        최대 <input class="mk-input" data-tb="v-max" type="number" min="1" value="${c[key + 'Max'] != null ? c[key + 'Max'] : ''}" style="width:56px"></div>
      <div>방향 <select class="mk-input" data-tb="v-or" style="width:130px">
        ${[['', '상관없음'], ['portraitDominant', '세로 우세'], ['landscapeDominant', '가로 우세'], ['mixed', '섞임']].map(([k2, n2]) => `<option value="${k2}" ${(c.orientation || '') === k2 ? 'selected' : ''}>${n2}</option>`).join('')}</select>
        우선 <input class="mk-input" data-tb="v-pri" type="number" value="${v.priority == null ? 10 : v.priority}" style="width:52px"></div>
      <div>사진 종류 <select class="mk-input" data-tb="v-kind" style="width:110px">
        ${[['', '상관없음'], ['imageOnly', '사진만'], ['videoOnly', '영상만'], ['mixed', '섞임']].map(([k2, n2]) => `<option value="${k2}" ${(c.mediaKind || '') === k2 ? 'selected' : ''}>${n2}</option>`).join('')}</select>
        문구 <select class="mk-input" data-tb="v-cap" style="width:110px">
        ${[['', '상관없음'], ['yes', '있을 때'], ['no', '없을 때']].map(([k2, n2]) => `<option value="${k2}" ${(c.hasCaptions == null ? '' : (c.hasCaptions ? 'yes' : 'no')) === k2 ? 'selected' : ''}>${n2}</option>`).join('')}</select></div>
      <div>제목 <select class="mk-input" data-tb="v-ttl" style="width:110px">
        ${[['', '상관없음'], ['yes', '있을 때'], ['no', '없을 때']].map(([k2, n2]) => `<option value="${k2}" ${(c.hasTitle == null ? '' : (c.hasTitle ? 'yes' : 'no')) === k2 ? 'selected' : ''}>${n2}</option>`).join('')}</select>
        <span style="margin-left:8px;font-size:11px">비율</span>
        ${(mf.supportedRatios || Object.keys((C() && C().RATIOS) || {})).map((rr) => `<label style="font-size:11px;margin-left:4px;padding:2px 5px;border-radius:99px;border:1px solid ${(c.ratio || []).includes(rr) ? 'var(--mk-primary,#3B6EF6)' : 'var(--mk-border,#E3E8EF)'}">
          <input type="checkbox" data-tb="v-ratio" value="${rr}" ${(c.ratio || []).includes(rr) ? 'checked' : ''} style="vertical-align:-1px"> ${esc(rr)}</label>`).join('')}</div>
      ${mf.pairMode ? '' : `<div>최대 장면 <input class="mk-input" data-tb="v-msc" type="number" min="1" value="${ss.maxSceneCount || 14}" style="width:56px">
        <label style="margin-left:8px"><input type="checkbox" data-tb="v-col" ${ss.allowCollage ? 'checked' : ''}> 콜라주 허용</label>
        <label style="margin-left:6px"><input type="checkbox" data-tb="v-pair" ${ss.allowPair !== false ? 'checked' : ''}> 2장 배치</label></div>`}
      <div>권장 총 길이 <input class="mk-input" data-tb="v-mt" type="number" step="5" value="${du.maxTotal || 60}" style="width:64px">초</div>
      <div><b style="font-size:11px">쓸 Layout</b>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${layouts.map((l) => `
          <label style="font-size:11px;padding:2px 6px;border-radius:99px;border:1px solid ${(v.layoutPool || []).includes(l) ? 'var(--mk-primary,#3B6EF6)' : 'var(--mk-border,#E3E8EF)'}">
            <input type="checkbox" data-tb="v-lay" value="${l}" ${(v.layoutPool || []).includes(l) ? 'checked' : ''} style="vertical-align:-1px"> ${esc((M().getLayout(l) || {}).name || l)}</label>`).join('')}</div></div>
    </div>`;
  }

  /* ---------- 중앙: 테스트 모드 표 (R66 §25) ---------- */
  /* 실제 buildSmart 결과만 표기 — 예측·추정 금지. 배치 수가 입력 수와 다르면 그 자리에서 빨갛게 드러난다. */
  function renderMatrix(mx) {
    const bad = (r) => !r.ok || r.placed !== r.expected;
    return `<div style="border:1px solid var(--mk-border,#E3E8EF);border-radius:10px;overflow:hidden;background:var(--mk-surface,#fff)">
      <div style="padding:8px 12px;border-bottom:1px solid var(--mk-border,#E3E8EF);font-size:12px">
        <b>${mx.ok ? '✓ 모든 경우 정상' : '✗ 문제 ' + mx.problems + '건'}</b>
        <span style="color:var(--mk-text-secondary,#68737F);margin-left:6px">사진 수·방향별로 실제 만들어 본 결과예요</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:11.5px">
        <tr style="background:var(--mk-bg-secondary,#F2F5F9)">
          ${['입력', '고른 구성', '장면', '길이', '사진 배치', '배치 계획'].map((h) => `<th style="text-align:left;padding:6px 8px;font-weight:600">${h}</th>`).join('')}</tr>
        ${mx.rows.map((r) => r.ok ? `<tr style="border-top:1px solid var(--mk-border,#E3E8EF);${bad(r) ? 'background:#FDF4F4' : ''}">
            <td style="padding:6px 8px">${esc(r.label)}</td>
            <td style="padding:6px 8px">${esc(r.variant)}</td>
            <td style="padding:6px 8px">${r.scenes}</td>
            <td style="padding:6px 8px">${r.total}초</td>
            <td style="padding:6px 8px;${bad(r) ? 'color:#B3261E;font-weight:700' : ''}">${r.placed}/${r.expected}</td>
            <td style="padding:6px 8px;color:var(--mk-text-secondary,#68737F)">${esc(r.plan || '')}</td></tr>`
          : `<tr style="border-top:1px solid var(--mk-border,#E3E8EF);background:#FDF4F4">
            <td style="padding:6px 8px">${esc(r.label)}</td>
            <td colspan="5" style="padding:6px 8px;color:#B3261E">${esc(r.why)}</td></tr>`).join('')}
      </table>
      ${mx.rows.some((r) => (r.warnings || []).length) ? `<div style="padding:8px 12px;border-top:1px solid var(--mk-border,#E3E8EF);font-size:11px;color:#9A6200">
        ${mx.rows.filter((r) => (r.warnings || []).length).map((r) => `<div>⚠ ${esc(r.label)} — ${esc(r.warnings.join(' / '))}</div>`).join('')}</div>` : ''}
    </div>`;
  }

  /* ---------- 우측: Scene 속성 (§4-4 B) ---------- */
  function renderSceneProps(mf, sc) {
    const layouts = B().layoutsForRole(sc.role);
    const d = sc.duration || {};
    const anims = M().listAnimations().filter((a) => !(M().getAnimation(a) || {}).idle); /* 실지원 등장 애니만 (§12) */
    return `<b>Scene · ${esc(sc.name || sc.id)}</b>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;font-size:13px">
        <label>이름<input class="mk-input" data-tb="s-name" value="${esc(sc.name || '')}" style="width:100%"></label>
        <label>역할<select class="mk-input" data-tb="s-role" style="width:100%">${B().ROLES.map((r) => `<option ${sc.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
        <label>Layout<select class="mk-input" data-tb="s-layout" style="width:100%">
          ${sc.mediaSlots && !sc.layout ? '<option value="" selected>커스텀(원본 유지)</option>' : '<option value="">없음(텍스트만)</option>'}
          ${layouts.map((l) => { const m = B().layoutMeta(l); return `<option value="${l}" ${sc.layout === l ? 'selected' : ''}>${esc(m.name)} (미디어 ${m.mediaSlots})</option>`; }).join('')}</select></label>
        <label>등장 Animation<select class="mk-input" data-tb="s-anim" style="width:100%">
          <option value="">없음</option>${anims.map((a) => `<option value="${a}" ${sc.animation === a ? 'selected' : ''}>${esc((M().getAnimation(a) || {}).name || a)}</option>`).join('')}</select></label>
        <label>전환 Transition<select class="mk-input" data-tb="s-trans" style="width:100%">
          <option value="">기본</option>${M().listTransitions().map((a) => `<option value="${a}" ${sc.transition === a ? 'selected' : ''}>${esc((M().getTransition(a) || {}).name || a)}</option>`).join('')}</select></label>
        <div>길이(초) 기본 <input class="mk-input" data-tb="s-dd" type="number" step="0.5" value="${d.default || 3}" style="width:58px">
          최소 <input class="mk-input" data-tb="s-dmin" type="number" step="0.5" value="${d.min || 2}" style="width:58px">
          최대 <input class="mk-input" data-tb="s-dmax" type="number" step="0.5" value="${d.max || 5}" style="width:58px"></div>
        <label><input type="checkbox" data-tb="s-req" ${sc.required !== false ? 'checked' : ''}> 필수 Scene</label>
        <label>반복<select class="mk-input" data-tb="s-repeat" style="width:100%">
          <option value="" ${!sc.usePlan && !sc.pairOnly ? 'selected' : ''}>반복 없음</option>
          <option value="media-item" ${sc.usePlan ? 'selected' : ''}>미디어마다 (media-item)</option>
          ${mf.pairMode ? `<option value="comparison-pair" ${sc.pairOnly ? 'selected' : ''}>비교 쌍마다 (comparison-pair)</option>` : ''}</select></label>
        <div><b style="font-size:12px">텍스트 슬롯</b>
          ${(sc.texts || []).map((t) => `<div style="display:flex;gap:4px;align-items:center;margin-top:4px">
            <input class="mk-input" data-tb="t-text" data-tid="${t.id}" value="${esc(t.defaultText || '')}" placeholder="${esc(t.role)}·${esc(t.bind || '')}" style="flex:1;font-size:12px">
            <button class="mk-btn" data-tb="t-del" data-tid="${t.id}" style="padding:2px 7px;font-size:11px">✕</button></div>`).join('')}
          <button class="mk-btn" data-tb="t-add" style="margin-top:6px;padding:2px 8px;font-size:12px">＋ 텍스트 슬롯</button></div>
        ${sc.mediaSlots ? `<div style="font-size:11px;color:var(--mk-text-secondary,#68737F)">미디어 슬롯 ${sc.mediaSlots.length}개 — 좌표는 원본 스펙(수정은 Layout 교체로)</div>` : ''}
      </div>`;
  }

  /* ---------- mount — 실동작 배선 ---------- */
  function mount(root) {
    const rerender = () => window.PG.render();
    const on = (sel, fn) => root.querySelectorAll(sel).forEach((el) => { el.onclick = (ev) => { fn(el, ev); }; });
    const onch = (sel, fn) => root.querySelectorAll(sel).forEach((el) => { el.onchange = () => fn(el); });

    /* 목록 */
    on('[data-tb="new"]', () => { st.newTpl = { name: '', composition: 'slideshow', theme: (C().listThemes()[0] || {}).id, ratio: '16:9' }; rerender(); });
    onch('[data-tb="q"]', (el) => { st.filter.q = el.value; rerender(); });
    onch('[data-tb="fst"]', (el) => { st.filter.status = el.value; rerender(); });
    onch('[data-tb="fcp"]', (el) => { st.filter.composition = el.value; rerender(); });
    on('[data-tb="edit"]', (el) => { st.view = 'edit'; st.tid = el.dataset.id; st.sid = null; st.val = null; st.msg = ''; st.ratio = null; st.tab = 'props'; st.vsel = null; st.matrix = null; st.vval = null; rerender(); });
    on('[data-tb="dup"]', (el) => { const nid = B().duplicate(el.dataset.id); st.msg = nid ? '복사본을 만들었어요' : '복제 실패'; rerender(); });
    on('[data-tb="prev"]', (el) => {
      const t = B().get(el.dataset.id); if (!t) return;
      const r = B().previewBuild(el.dataset.id, {});
      if (r && r.ok && window.MK_PLAY) window.MK_PLAY.open(r.doc);
      else { st.msg = '빌드 실패: ' + (r && (r.guide || r.why) || ''); rerender(); }
    });
    /* 새 템플릿 */
    onch('[data-tb="n-name"]', (el) => { st.newTpl.name = el.value; });
    onch('[data-tb="n-cp"]', (el) => { st.newTpl.composition = el.value; });
    onch('[data-tb="n-th"]', (el) => { st.newTpl.theme = el.value; });
    onch('[data-tb="n-rt"]', (el) => { st.newTpl.ratio = el.value; });
    on('[data-tb="n-go"]', () => {
      const id = B().create(st.newTpl);
      st.newTpl = null; st.view = 'edit'; st.tid = id; st.sid = null; st.val = null; st.msg = ''; st.ratio = null; rerender();
    });
    on('[data-tb="n-cancel"]', () => { st.newTpl = null; rerender(); });

    /* 편집기 상단 */
    on('[data-tb="back"]', () => { st.view = 'list'; st.tid = null; st.msg = ''; st.val = null; rerender(); });
    onch('[data-tb="e-name"]', (el) => { B().setInfo(st.tid, { name: el.value }); rerender(); });
    on('[data-tb="ratio"]', (el) => { st.ratio = el.dataset.rt; rerender(); });
    on('[data-tb="play"]', () => {
      const r = buildNow();
      if (r && r.ok && window.MK_PLAY) window.MK_PLAY.open(r.doc);
      else { st.msg = '빌드 실패: ' + (r && (r.guide || r.why) || ''); rerender(); }
    });
    on('[data-tb="check"]', () => { st.val = B().validateDraft(st.tid); st.msg = ''; rerender(); });
    on('[data-tb="draft"]', () => { B().setStatus(st.tid, 'draft'); st.msg = '초안으로 저장했어요 — 새로고침해도 그대로예요'; st.val = null; rerender(); });
    on('[data-tb="ready"]', () => {
      const r = B().publish(st.tid);
      if (r.ok) { st.msg = 'Ready 저장 완료 — #/video 갤러리에 등록됐어요'; st.val = { ok: true, errors: [], warnings: r.warnings || [] }; }
      else { st.msg = 'Ready 저장 불가 — 아래 오류를 해결하세요'; st.val = { ok: false, errors: r.errors || [], warnings: r.warnings || [] }; }
      rerender();
    });
    /* R66 §12 — Ready 템플릿을 자동 구성으로 실제 작업 문서화 → Workspace 진입 */
    on('[data-tb="smartopen"]', () => {
      const S2 = window.MK_SVAR, t = B().get(st.tid);
      if (!S2 || !t) { st.msg = '자동 구성 엔진 미로드'; rerender(); return; }
      const mf = t.manifest;
      const input = { ratio: st.ratio || mf.defaultRatio, texts: B().sampleTexts() };
      if (mf.pairMode) input.pairs = B().samplePairs(st.sample.pairCount);
      else input.medias = B().sampleMedias(st.sample.mediaCount);
      const r = S2.buildSmart(mf.id, input, { theme: mf.theme });
      if (!r.ok) { st.msg = '자동 구성 실패 — ' + (r.guide || r.why || ''); rerender(); return; }
      if (!window.MK_PROJ) { st.msg = '프로젝트 저장소 미로드'; rerender(); return; }
      const pj = window.MK_PROJ.createFromDoc(r.doc, mf.meta.name + ' 자동 구성');
      window.MK_PROJ.open(pj.projectId);
    });

    /* R66 §25 — 테스트 모드: 실빌드 매트릭스 (초안 상태 그대로) */
    on('[data-tb="matrix"]', () => {
      if (st.matrix) { st.matrix = null; rerender(); return; }
      const mx = B().smartPreview(st.tid, { ratio: st.ratio || undefined });
      st.matrix = mx && mx.rows ? mx : null;
      st.msg = mx && mx.rows ? (mx.ok ? '모든 경우 정상이에요' : '문제 ' + mx.problems + '건 — 표에서 확인하세요')
        : '테스트 실패 — ' + ((mx && (mx.guide || mx.why)) || '');
      rerender();
    });
    /* R66 §24 — 자동 구성 탭 */
    on('[data-tb="tab"]', (el) => { st.tab = el.dataset.k; st.matrix = st.tab === 'svar' ? st.matrix : st.matrix; rerender(); });
    on('[data-tb="vsel"]', (el, ev) => { if (ev.target.closest('button')) return; st.vsel = st.vsel === el.dataset.vid ? null : el.dataset.vid; rerender(); });
    on('[data-tb="vadd"]', () => {
      const r = B().addVariant(st.tid, {});
      if (r.ok) { st.vsel = r.variantId; st.vval = null; } else st.msg = r.msg;
      rerender();
    });
    on('[data-tb="vdel"]', (el) => {
      const r = B().removeVariant(st.tid, el.dataset.vid);
      if (!r.ok) st.msg = r.msg; else if (st.vsel === el.dataset.vid) st.vsel = null;
      st.vval = null; rerender();
    });
    on('[data-tb="vcheck"]', () => {
      const X = window.MK_SVARX; const t = B().get(st.tid);
      st.vval = X ? X.validateVariants(B().getVariants(st.tid), { pairMode: !!t.manifest.pairMode })
        : { ok: true, errors: [], warnings: ['검증 엔진 미로드'] };
      rerender();
    });
    const vp = (patch) => {
      const r = B().setVariant(st.tid, st.vsel, patch);
      if (!r.ok) { st.vval = { ok: false, errors: r.errors || [{ msg: r.msg }], warnings: [] }; }
      else st.vval = { ok: true, errors: [], warnings: r.warnings || [] };
      rerender();
    };
    const numOrNull = (v) => (v === '' || v == null ? null : +v);
    const curKey = () => { const t = B().get(st.tid); return t.manifest.pairMode ? 'pairCount' : 'mediaCount'; };
    onch('[data-tb="v-name"]', (el) => vp({ name: el.value }));
    onch('[data-tb="v-min"]', (el) => vp({ conditions: { [curKey() + 'Min']: numOrNull(el.value) } }));
    onch('[data-tb="v-max"]', (el) => vp({ conditions: { [curKey() + 'Max']: numOrNull(el.value) } }));
    onch('[data-tb="v-or"]', (el) => vp({ conditions: { orientation: el.value || null } }));
    onch('[data-tb="v-pri"]', (el) => vp({ priority: +el.value || 0 }));
    /* R67 — 조건 축 확장 (종류·문구·제목·비율) */
    onch('[data-tb="v-kind"]', (el) => vp({ conditions: { mediaKind: el.value || null } }));
    const tri = (v) => (v === 'yes' ? true : v === 'no' ? false : null);
    onch('[data-tb="v-cap"]', (el) => vp({ conditions: { hasCaptions: tri(el.value) } }));
    onch('[data-tb="v-ttl"]', (el) => vp({ conditions: { hasTitle: tri(el.value) } }));
    onch('[data-tb="v-ratio"]', () => {
      const picked = [...root.querySelectorAll('[data-tb="v-ratio"]')].filter((x) => x.checked).map((x) => x.value);
      vp({ conditions: { ratio: picked.length ? picked : null } });
    });
    onch('[data-tb="v-msc"]', (el) => vp({ sceneStrategy: { maxSceneCount: +el.value || 14 } }));
    onch('[data-tb="v-col"]', (el) => vp({ sceneStrategy: { allowCollage: el.checked } }));
    onch('[data-tb="v-pair"]', (el) => vp({ sceneStrategy: { allowPair: el.checked } }));
    onch('[data-tb="v-mt"]', (el) => vp({ duration: { maxTotal: +el.value || 60 } }));
    onch('[data-tb="v-lay"]', () => {
      const pool = [...root.querySelectorAll('[data-tb="v-lay"]')].filter((x) => x.checked).map((x) => x.value);
      vp({ layoutPool: pool });
    });

    /* 좌측 Scene 목록 */
    on('[data-tb="sel"]', (el, ev) => { if (ev.target.closest('button')) return; st.sid = st.sid === el.dataset.sid ? null : el.dataset.sid; rerender(); });
    on('[data-tb="mv"]', (el) => { B().moveScene(st.tid, el.dataset.sid, +el.dataset.d); rerender(); });
    on('[data-tb="scdup"]', (el) => { B().dupScene(st.tid, el.dataset.sid); rerender(); });
    on('[data-tb="scdel"]', (el) => {
      const r = B().removeScene(st.tid, el.dataset.sid);
      if (r.warn) { if (window.confirm(r.msg)) B().removeScene(st.tid, el.dataset.sid, true); }
      else if (!r.ok) st.msg = r.msg;
      if (st.sid === el.dataset.sid) st.sid = null;
      rerender();
    });
    on('[data-tb="scadd"]', () => {
      const role = window.prompt('Scene 역할 (' + B().ROLES.join('/') + ')', 'media');
      if (!role) return;
      const lays = B().layoutsForRole(role);
      const layout = lays.length ? window.prompt('Layout (' + lays.join('/') + ' 또는 빈칸)', lays[0]) : '';
      const r = B().addScene(st.tid, { role, ...(layout ? { layout } : {}) });
      if (!r.ok) st.msg = r.msg; else st.sid = r.sceneId;
      rerender();
    });
    /* 샘플 (§15) */
    on('[data-tb="smedia"]', (el) => { st.sample.mediaCount = +el.dataset.n; rerender(); });
    on('[data-tb="spair"]', (el) => { st.sample.pairCount = +el.dataset.n; rerender(); });
    on('[data-tb="sreset"]', () => { st.sample = { mediaCount: 5, pairCount: 2 }; rerender(); });
    /* 우측 — 템플릿 속성 */
    onch('[data-tb="p-desc"]', (el) => { B().setInfo(st.tid, { purpose: el.value }); });
    onch('[data-tb="p-cat"]', (el) => { B().setInfo(st.tid, { category: el.value }); });
    onch('[data-tb="p-tags"]', (el) => { B().setInfo(st.tid, { tags: el.value.split(',').map((s) => s.trim()).filter(Boolean) }); });
    onch('[data-tb="p-theme"]', (el) => { B().setInfo(st.tid, { theme: el.value }); rerender(); }); /* Theme 즉시 반영 §11 */
    onch('[data-tb="p-sr"]', (el) => {
      const t = B().get(st.tid); const set = new Set(t.manifest.supportedRatios || []);
      el.checked ? set.add(el.value) : set.delete(el.value);
      B().setInfo(st.tid, { supportedRatios: [...set] }); rerender();
    });
    onch('[data-tb="p-dr"]', (el) => { B().setInfo(st.tid, { defaultRatio: el.value }); rerender(); });
    onch('[data-tb="p-thumb"]', (el) => { B().setInfo(st.tid, { thumbnail: el.value || null }); });
    onch('[data-tb="p-gal"]', (el) => { B().setInfo(st.tid, { gallery: el.checked }); });
    /* 우측 — Scene 속성 */
    const sp = (patch) => { const r = B().setScene(st.tid, st.sid, patch); if (!r.ok) st.msg = r.msg; else if (r.note) st.msg = r.note; rerender(); };
    onch('[data-tb="s-name"]', (el) => sp({ name: el.value }));
    onch('[data-tb="s-role"]', (el) => sp({ role: el.value }));
    onch('[data-tb="s-layout"]', (el) => sp({ layout: el.value || null }));
    onch('[data-tb="s-anim"]', (el) => sp({ animation: el.value || null }));
    onch('[data-tb="s-trans"]', (el) => sp({ transition: el.value || null }));
    onch('[data-tb="s-dd"]', (el) => sp({ duration: { default: +el.value } }));
    onch('[data-tb="s-dmin"]', (el) => sp({ duration: { min: +el.value } }));
    onch('[data-tb="s-dmax"]', (el) => sp({ duration: { max: +el.value } }));
    onch('[data-tb="s-req"]', (el) => sp({ required: el.checked }));
    onch('[data-tb="s-repeat"]', (el) => sp({ repeatBasis: el.value || null }));
    onch('[data-tb="t-text"]', (el) => { B().setTextSlot(st.tid, st.sid, el.dataset.tid, { defaultText: el.value }); rerender(); });
    on('[data-tb="t-del"]', (el) => { B().removeTextSlot(st.tid, st.sid, el.dataset.tid); rerender(); });
    on('[data-tb="t-add"]', () => { B().addTextSlot(st.tid, st.sid, {}); rerender(); });
  }

  window.MK_SCREENS = window.MK_SCREENS || {};
  window.MK_SCREENS.tbuilder = {
    title: 'Template Builder', variants: ['A'],
    render: () => st.view === 'edit' ? renderEdit() : renderList(),
    mount,
    _st: st, /* 테스트 훅 */
  };
})();
