/* ============================================================
   화면: Simple — Radical Simplification  (Round 27)
   ------------------------------------------------------------
   개요/메뉴 분류/첫 화면/단계 공개/컨텍스트/팔레트/30초/산출물 8탭.
   전 버튼 실함수 — "초보자에게 전문가 메뉴가 보이는 경로가 없다"
   "숨겨도 검색으로는 전부 도달한다" 를 화면에서 실연.
   내비 우측 하단 🌱 토글은 app.js 실내비를 초보자 시야로 전환한다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.simple = (() => {
  const S = () => window.MK_SIMPLE, M = () => window.MK;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'over', edits: 0, opt: false, sel: 'text', q: '', t30: null, badSpec: false };
  const badge = (ok, t) => `<span class="mk-badge ${ok ? 'success' : 'danger'}">${esc(t)}</span>`;
  const chip = (t, cls) => `<span class="mk-badge ${cls || ''}">${esc(t)}</span>`;
  const Stat = (l, v, s2) => `<div class="adm-stat"><small>${esc(l)}</small><b>${v}</b>${s2 ? `<span>${esc(s2)}</span>` : ''}</div>`;
  const CLS_KO = { essential: '필수', hidden: '숨김', deleted: '삭제', ai: 'AI 대체', expert: '전문가' };
  const CLS_BD = { essential: 'success', hidden: '', deleted: 'danger', ai: 'info', expert: 'warning' };

  const TABS = [['over', '개요'], ['menu', '메뉴 분류'], ['first', '첫 화면'], ['level', '단계 공개'],
                ['ctx', '컨텍스트'], ['pal', '팔레트'], ['t30', '30초'], ['out', '산출물']];

  /* ---------- 개요 ---------- */
  function Over() {
    const d = S().deliverables();
    return `
      <div class="adm-stats">
        ${Stat('산출물', d.filter((x) => x.ready).length + '/7', '§18')}
        ${Stat('초보자 내비', S().navFor({ edits: 0 }).length + '개', '전체 ' + Object.keys(S().MENU).length + '개 중')}
        ${Stat('숨겨도 도달', S().discovery({ edits: 0 }).hiddenReachable + '개', '팔레트 검색')}
        ${Stat('완료 조건', S().complete() ? '충족' : '미달', '§19')}
      </div>
      <div class="mk-card"><h4>핵심 철학 (§0)</h4>
        <p class="dev-note"><b>${esc(S().PHILOSOPHY.user)}</b></p>
        <p class="dev-note">${esc(S().PHILOSOPHY.hero)}</p></div>
      <div class="mk-card"><h4>UX 원칙 4 (§17)</h4>
        <div class="dls-lm">${S().PRINCIPLES.map((p) => `<div class="dls-lm-row"><span>${esc(p.text)}</span>${badge(true, p.id)}</div>`).join('')}</div></div>
      <div class="mk-card"><h4>시각적 계층 (§16)</h4>
        <div class="dls-lm">${S().HIERARCHY.map((h) => `<div class="dls-lm-row"><span style="font-size:${Math.max(h.size, 11)}px;${h.size === 0 ? 'opacity:.4' : ''}">${esc(h.role)}</span><span class="dev-note">${h.size === 0 ? '숨김' : h.size + 'px'}</span></div>`).join('')}
        </div>${badge(S().hierarchyAudit().ok, '단조 감소 + 전문 기능 크기 0')}</div>`;
  }

  /* ---------- 메뉴 분류 ---------- */
  function Menu() {
    const aud = S().beginnerAudit();
    return `
      ${['essential', 'hidden', 'ai', 'expert', 'deleted'].map((cls) => {
        const rows = S().byClass(cls);
        return `<div class="mk-card"><h4>${CLS_KO[cls]} — ${rows.length}개</h4>
          <div class="dls-lm">${rows.map((m) => `<div class="dls-lm-row"><span>${chip(CLS_KO[cls], CLS_BD[cls])} <b>${esc(m.label)}</b>${m.minUsage ? ` <span class="dev-note">편집 ${m.minUsage}회↑</span>` : ''}</span><span class="dev-note">${esc(m.reason)}</span></div>`).join('')}</div></div>`;
      }).join('')}
      <div class="mk-card"><h4>초보자 금지 목록 감사 (§6)</h4>
        <p class="dev-note">Export·Plugin·Admin·Developer·Workflow 등 ${S().BEGINNER_BANNED.length}종 — 초보자 내비에 하나라도 새면 실패.</p>
        <p>${badge(aud.ok, aud.ok ? '누출 0' : '누출: ' + aud.leaked.join(','))} <span class="dev-note">현재 초보자 내비 = ${aud.nav.join(' · ')}</span></p></div>`;
  }

  /* ---------- 첫 화면 ---------- */
  function First() {
    const spec = st.badSpec
      ? { questions: ['무엇을 만들까요?', '어떤 스타일인가요?'], items: ['ai-make', 'recent', 'export-panel', 'plugin-shelf'], menuCount: 25, primary: null }
      : S().homeSpec('beginner');
    const aud = S().firstScreenAudit(spec), t3 = S().threeSecTest(spec);
    return `
      <div class="mk-card"><h4>신규 첫 화면 — 질문 하나 (§3·§4)</h4>
        <div style="text-align:center;padding:34px 16px;background:var(--mk-surface,#fff);border:1px solid var(--mk-line,#E4E8EE);border-radius:12px">
          <div style="font-size:30px;font-weight:700;letter-spacing:-.02em">${esc((spec.questions || [spec.question])[0] || '—')}${(spec.questions || []).length > 1 ? ' <span style="font-size:14px;color:#c00">(+질문 ' + ((spec.questions || []).length - 1) + '개 초과)</span>' : ''}</div>
          <div style="max-width:560px;margin:18px auto 0;padding:13px 18px;border:1.5px solid var(--mk-teal,#2A9D8F);border-radius:12px;color:var(--mk-text-muted,#667);text-align:left">발표, 초대장, 학습지… 한 문장으로 말해 주세요</div>
          <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
            ${(spec.items || []).map((i) => `<span class="mk-badge ${S().FIRST_SCREEN.allowed.includes(i) ? '' : 'danger'}">${esc(S().FIRST_SCREEN.labels[i] || i)}</span>`).join('')}
          </div>
          ${spec.menuCount ? `<p class="dev-note" style="color:#c00;margin-top:12px">메뉴 ${spec.menuCount}개 노출 중</p>` : ''}
        </div>
        <div class="dls-row" style="margin-top:10px">
          <button class="mk-btn sm ${st.badSpec ? '' : 'primary'}" data-sp-good>단순화 스펙</button>
          <button class="mk-btn sm ${st.badSpec ? 'primary' : ''}" data-sp-bad>불량 스펙(질문 2·메뉴 25)</button>
        </div>
        <p>${badge(aud.ok, aud.ok ? '첫 화면 감사 통과' : '거부')} ${aud.violations.map((v) => `<span class="dev-note">${esc(v)}</span>`).join(' · ')}</p></div>
      <div class="mk-card"><h4>3초 테스트 (§13)</h4>
        <div class="dls-lm">
          ${Object.entries(t3.answers).map(([k, a]) => `<div class="dls-lm-row"><span>${{ what: '무엇을 하는 프로그램인가?', where: '어디를 눌러야 하는가?', how: '어떻게 시작하는가?' }[k]}</span><span>${badge(a.ok, a.evidence)}</span></div>`).join('')}
        </div>
        <p>${badge(t3.pass, t3.pass ? '3초 테스트 통과' : '실패')}</p></div>`;
  }

  /* ---------- 단계 공개 ---------- */
  function Level() {
    const usage = { edits: st.edits, expertOptIn: st.opt };
    const lv = S().levelOf(usage), nav = S().navFor(usage), nx = S().nextReveal(usage);
    return `
      <div class="mk-card"><h4>Progressive Disclosure (§5~§8)</h4>
        <div class="dls-row">
          <span class="dev-note">편집 횟수: <b>${st.edits}</b></span>
          <button class="mk-btn sm" data-sp-edit>+5회 편집</button>
          <button class="mk-btn sm" data-sp-reset>초기화</button>
          <label class="dev-note"><input type="checkbox" data-sp-opt ${st.opt ? 'checked' : ''}> 전문가 모드 옵트인 (§8)</label>
        </div>
        <p>현재 레벨: ${chip(lv, lv === 'beginner' ? 'success' : lv === 'expert' ? 'warning' : 'info')}
        ${nx ? `<span class="dev-note">다음 노출: ${esc(nx.label)} (편집 ${nx.remain}회 남음)</span>` : `<span class="dev-note">숨김 기능 전부 노출됨</span>`}</p>
        <p class="dev-note">편집 999회여도 옵트인 없이는 expert 가 아니다 — 자동 승격 경로 없음: ${badge(S().levelOf({ edits: 999 }) !== 'expert', 'levelOf({edits:999}) = ' + S().levelOf({ edits: 999 }))}</p></div>
      <div class="mk-card"><h4>이 순간의 내비 — ${nav.length}개</h4>
        <div class="dls-row" style="flex-wrap:wrap">${nav.map((id) => chip(S().MENU[id].label, S().MENU[id].cls === 'essential' ? 'success' : S().MENU[id].cls === 'expert' ? 'warning' : '')).join(' ')}</div>
        <p class="dev-note">화면 밖 기능(영상 모드·사진 도구)은 Editor 문맥에서만 열린다.</p></div>
      <div class="mk-card"><h4>실내비 전환</h4>
        <p class="dev-note">좌측 내비 맨 아래 <b>🌱 단순 모드</b> 토글 — 플레이그라운드 실내비가 초보자 시야(4개)로 바뀐다. 검수용 기본값은 전체 보기.</p>
        <button class="mk-btn sm primary" data-sp-navmode>${(window.PG && window.PG.state && window.PG.state.navMode === 'simple') ? '전체 내비로' : '🌱 단순 내비 켜기'}</button></div>`;
  }

  /* ---------- 컨텍스트 ---------- */
  function Ctx() {
    const c = S().contextMenu(st.sel);
    return `
      <div class="mk-card"><h4>Context UI (§9) — 선택한 것에 따라 필요한 메뉴만</h4>
        <div class="dls-row">${Object.keys(S().CTX_MENUS).map((k) => `<button class="mk-btn sm ${st.sel === k ? 'primary' : ''}" data-sp-sel="${k}">${k}</button>`).join('')}</div>
        <p>선택 = <b>${esc(st.sel)}</b> → 메뉴 ${c.items.length}개: ${c.items.map((i) => chip(i)).join(' ')}</p>
        <p class="dev-note">항상 모든 메뉴를 보여주지 않는다 — full=${String(c.full)} ${badge(!c.full, '상시 전체 노출 금지')}</p>
        ${c.toolbar ? `<p class="dev-note">MK_FLOW 툴바 브리지: ${c.toolbar.join(' · ')}</p>` : ''}</div>`;
  }

  /* ---------- 팔레트 ---------- */
  function Pal() {
    const r = st.q ? S().paletteSearch(st.q, { edits: 0 }) : null;
    const d = S().discovery({ edits: 0 });
    return `
      <div class="mk-card"><h4>검색 중심 UX (§11) — 숨겨도 전부 도달한다</h4>
        <div class="dls-row">
          <input class="mk-input" data-sp-q placeholder="admin, plugin, 브랜드…" value="${esc(st.q)}" style="width:260px">
          <button class="mk-btn sm primary" data-sp-search>검색</button>
        </div>
        ${r ? `<div class="dls-lm">${r.items.length ? r.items.map((i) => `<div class="dls-lm-row"><span><b>${esc(i.label)}</b> ${chip(CLS_KO[i.cls], CLS_BD[i.cls])}</span><span>${i.hidden ? badge(true, '내비엔 숨김 — 검색으로 도달') : chip('노출 중', 'success')}</span></div>`).join('') : '<p class="dev-note">결과 없음</p>'}</div>` : ''}
        <p class="dev-note">초보자 시야에서 숨겨진 기능 중 팔레트로 도달 가능: <b>${d.hiddenReachable}개</b> — "이런 기능도 있었어?" 의 통로(§19).</p></div>`;
  }

  /* ---------- 30초 ---------- */
  function T30() {
    const t = st.t30, c = S().clickAudit();
    return `
      <div class="mk-card"><h4>30초 테스트 (§14) — 회원가입 없이 첫 결과물</h4>
        <button class="mk-btn sm primary" data-sp-t30>실행</button>
        ${t ? `
        <div class="dev-pipe" style="margin-top:10px">${t.steps.map((s) => `<span class="dev-pipe-node on">${esc(s.label)} ${s.sec}s</span>`).join('<span class="dev-pipe-arrow">→</span>')}</div>
        <p>합계 <b>${t.totalSec}s</b> ${badge(t.within, '≤30s')} ${badge(t.noSignup, '가입 단계 0')} ${badge(t.produced, 'AI 실생성 ' + t.scenes + '씬')} ${badge(t.pass, t.pass ? '통과' : '실패')}</p>` : ''}</div>
      <div class="mk-card"><h4>클릭 예산 (§15)</h4>
        <p>주요 작업 최대 ${c.max}클릭 ${badge(c.ok, '전 명령 ≤3클릭')} · 1클릭 ${esc(c.oneClick)} · AI 자연어 1입력 경로 ${badge(c.aiNatural, 'MK_AI.analyze')}</p></div>`;
  }

  /* ---------- 산출물 ---------- */
  function Out() {
    const d = S().deliverables(), ms = S().menuStructure(), j = S().journey();
    return `
      <div class="mk-card"><h4>Deliverables 7종 (§18)</h4>
        <div class="dls-lm">${d.map((x) => `<div class="dls-lm-row"><span>${esc(x.name)}</span>${badge(x.ready, x.ready ? 'ready' : 'missing')}</div>`).join('')}</div></div>
      <div class="mk-card"><h4>신규 메뉴 구조</h4>
        <div class="dls-lm">
          <div class="dls-lm-row"><span>초보자</span><span class="dev-note">${ms.beginner.join(' · ')}</span></div>
          <div class="dls-lm-row"><span>중급(편집 20회)</span><span class="dev-note">${ms.intermediate.join(' · ')}</span></div>
          <div class="dls-lm-row"><span>전문가(옵트인)</span><span class="dev-note">${ms.expert.length}개 전체</span></div>
          <div class="dls-lm-row"><span>노출 삭제</span><span class="dev-note">${ms.deleted.join(' · ')}</span></div>
        </div></div>
      <div class="mk-card"><h4>사용자 여정</h4>
        <div class="dls-lm">${j.map((x) => `<div class="dls-lm-row"><span><b>${esc(x.label)}</b> <span class="dev-note">${esc(x.spec)}</span></span>${badge(x.ok, x.ok ? 'OK' : '실패')}</div>`).join('')}</div></div>
      <div class="mk-card"><h4>완료 조건 (§19)</h4>
        <p>처음 보는 사람 = "정말 쉽다" (3초·30초·클릭 예산) / 오래 쓰는 사람 = "이런 기능도 있었어?" (숨김 도달 ${S().discovery({ edits: 0 }).hiddenReachable}개)</p>
        <p>${badge(S().complete(), S().complete() ? 'complete() = true' : '미달')}</p></div>`;
  }

  const BODY = { over: Over, menu: Menu, first: First, level: Level, ctx: Ctx, pal: Pal, t30: T30, out: Out };

  function render() {
    return `
      <div class="dev-tabs">${TABS.map(([k, n]) => `<button class="dev-tab ${st.tab === k ? 'on' : ''}" data-sp-tab="${k}">${n}</button>`).join('')}</div>
      <div data-sp-body>${BODY[st.tab]()}</div>`;
  }

  function mount(root) {
    const RR = () => { const b = root.querySelector('[data-sp-body]'); if (!b) return; root.innerHTML = render(); wire(root); };
    function wire(r) {
      r.querySelectorAll('[data-sp-tab]').forEach((b) => b.onclick = () => { st.tab = b.dataset.spTab; RR(); });
      r.querySelectorAll('[data-sp-sel]').forEach((b) => b.onclick = () => { st.sel = b.dataset.spSel; RR(); });
      const on = (sel, fn) => { const el = r.querySelector(sel); if (el) el.onclick = fn; };
      on('[data-sp-good]', () => { st.badSpec = false; RR(); });
      on('[data-sp-bad]', () => { st.badSpec = true; RR(); });
      on('[data-sp-edit]', () => { st.edits += 5; RR(); });
      on('[data-sp-reset]', () => { st.edits = 0; st.opt = false; RR(); });
      const opt = r.querySelector('[data-sp-opt]'); if (opt) opt.onchange = () => { st.opt = opt.checked; RR(); };
      on('[data-sp-navmode]', () => { if (window.PG && window.PG.toggleNavMode) window.PG.toggleNavMode(); RR(); });
      on('[data-sp-search]', () => { const i = r.querySelector('[data-sp-q]'); st.q = i ? i.value : ''; RR(); });
      const qi = r.querySelector('[data-sp-q]');
      if (qi) qi.onkeydown = (e) => { if (e.key === 'Enter') { st.q = qi.value; RR(); } };
      on('[data-sp-t30]', () => { st.t30 = S().thirtySecTest(); RR(); });
    }
    wire(root);
  }

  return { title: 'Simple — Radical Simplification', variants: ['v1'], render, mount };
})();
