/* ============================================================
   K-MAKER EASY 엔진 (Round 35 — GPT P0 지시서)
   ------------------------------------------------------------
   window.MK_EASY — "K-MAKER must become the easiest AI creative
   platform." 새 메뉴 0 · 새 패널 0 · placeholder 0 · coming soon 0.
   10개 P0 기능 전부 실동작(실 doc 변형) + 기계 판정 + 스펙 실거부.

   · F1 Smart Replace: 이미지·영상을 자리에 드롭 — 자동 맞춤(틀 유지),
     애니 유지, 크롭 유지. 수동 맞춤 다이얼로그 낀 스펙 실거부.
   · F2 AI Quick Action: 선택 시 ✨개선·🖼교체·🎨스타일·🗑삭제 4개만.
     5개 이상·실행 없는 액션 스펙 실거부.
   · F3 Magic Resize: 비율 원클릭 변환 — 전 씬 앵커존 재배치(가장자리
     붙임 유지·중앙 비율 매핑·크기 공통 배율). 요소 유실·수동 보정
     요구 스펙 실거부.
   · F4 AI Timeline: 타임라인 조작 대신 자연어 — "제목 팝으로",
     "두 번째 장면 5초로", "사진 전부 순서대로". MK_ANIM 프리셋으로
     실변형. 못 알아들으면 정직하게 실패(가짜 성공 파서 실거부).
   · F5 Hover Editing: 캔버스 위 요소 호버 → 떠있는 즉시 동작 ≤3.
   · F6 Auto Animation: 새 미디어 삽입 = 애니 자동 부여, 수동 설정 0.
     삽입 설정 다이얼로그 스펙 실거부.
   · F7 Universal Asset Search: 사진·영상·아이콘·배경·음악 5종을
     입력창 하나에서(MK_ASSETS 실데이터) — 검색→삽입→자동 애니 체인.
   · F8 One Click Theme: 타이포·색·간격 전 씬 즉시(MK_SEC 팔레트).
     씬별 수동 반복 스펙 실거부.
   · F9 Command Palette: Ctrl+K — 모든 P0 진입점 검색 실행
     (MK_FLOW.search 병합 + easy 도메인). 커버리지 전수 판정.
   · F10 AI Coach: 지속 진단(6규칙) → 각 제안에 실행 가능한 fix →
     selfHeal 수렴 판정. 지적만 하고 fix 없는 스펙 실거부.

   브리지: MK_ANIM(프리셋·ensure) · MK_ASSETS(5종 실자산) ·
   MK_SEC(팔레트·isDark) · MK_FLOW(search) · MK_NAV(Ctrl+K) ·
   MK_HIST(스냅샷) · MK_SAMPLE(데모 doc) · PG(에디터 라이브)
   ============================================================ */
window.MK_EASY = (() => {
  const AN = () => window.MK_ANIM, AS = () => window.MK_ASSETS, SEC = () => window.MK_SEC,
        FL = () => window.MK_FLOW, NV = () => window.MK_NAV;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ============================================================
     §0 — 철학·규칙
     ============================================================ */
  const PHILOSOPHY = {
    rule: 'K-MAKER must become the easiest AI creative platform.',
    how: '기능을 더하는 게 아니라 손을 덜게 한다 — AI가 수동 설정을 대신한다.',
  };
  const RULES = [
    { id: 'no-menu', rule: '메뉴를 늘리지 않는다' }, { id: 'no-panel', rule: '패널을 늘리지 않는다' },
    { id: 'no-stub', rule: '빈 자리표시를 두지 않는다' }, { id: 'no-soon', rule: '"곧 제공"이 없다 — 지금 동작하거나, 없거나' },
    { id: 'e2e', rule: '모든 기능은 끝까지 동작한다' }, { id: 'testable', rule: '모든 인터랙션은 검증 가능하다' },
    { id: 'fewer-clicks', rule: '클릭을 줄인다' }, { id: 'ai-config', rule: 'AI가 수동 설정을 대체한다' },
  ];
  const FORBIDDEN_TEXT = ['미구현', 'coming soon', 'Coming Soon', '준비 중', '후속 단계', 'Placeholder', 'placeholder'];
  /* 표면 텍스트 심사 — P0 표면에 금지 문구가 실리면 위반 */
  function textAudit(str) {
    const hits = FORBIDDEN_TEXT.filter((w) => String(str || '').includes(w));
    return { ok: !hits.length, violations: hits };
  }
  /* 에디터 실DOM 표면 심사 — 기준선: 메뉴 9 · 구역 4 (늘면 위반) */
  const SURFACE_BASELINE = { menus: 9, zones: 5 };   /* R35 이전 실측 동결 — 메뉴 9 · 구역 5(협업 presence 오버레이 포함) */
  function surfaceAudit(editorRoot) {
    const menus = editorRoot.querySelectorAll('.ed-mainmenu [data-menu]').length;
    const zones = editorRoot.querySelectorAll('.ed-mid > *').length;
    const v = [];
    if (menus > SURFACE_BASELINE.menus) v.push(`메뉴 ${menus} > 기준 ${SURFACE_BASELINE.menus}`);
    if (zones > SURFACE_BASELINE.zones) v.push(`패널 구역 ${zones} > 기준 ${SURFACE_BASELINE.zones}`);
    return { ok: !v.length, menus, zones, violations: v };
  }

  /* ---------- 공용: doc 접근 · 요소 분류 ---------- */
  const liveDoc = () => (window.PG && PG.state.editor.doc) || null;
  function demoDoc() { return clone(window.MK_SAMPLE.TEMPLATES[0]); }
  const kindOf = (el) => el.kind === 'text' ? 'text'
    : (el.kind === 'image' && el.fill && el.fill !== 'none' && !el.label) ? 'box'
    : el.kind === 'image' ? 'image' : el.kind;
  const lum = (hex) => {
    if (!hex || hex[0] !== '#') return 1;
    const n = hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex;
    return (0.2126 * parseInt(n.slice(1, 3), 16) + 0.7152 * parseInt(n.slice(3, 5), 16) + 0.0722 * parseInt(n.slice(5, 7), 16)) / 255;
  };
  const hist = (label) => { if (window.MK_HIST && liveDoc()) window.MK_HIST.push(label); };

  /* ============================================================
     F1 — Smart Replace (드롭 교체: 자동 맞춤 · 애니 유지 · 크롭 유지)
     ============================================================ */
  function replace(doc, si, ei, media) {
    const s = doc.scenes[si]; if (!s) return { ok: false, msg: '장면이 없어요' };
    const el = s.elements[ei];
    if (!el || kindOf(el) === 'text') return { ok: false, msg: '사진·영상 자리가 아니에요' };
    if (!media || !media.name) return { ok: false, msg: '넣을 미디어가 없어요' };
    const keptAnim = el.anim ? clone(el.anim) : null;
    const keptCrop = { radius: el.radius, fit: el.fit };
    el.label = media.name;                      /* 미디어 교체 */
    el.media = { kind: media.kind || 'image', id: media.id || null };
    if (media.kind === 'video') el.video = true; else delete el.video;
    /* 자동 맞춤 = 틀(x·y·w·h) 불변 — 미디어가 틀에 맞춰진다. 별도 맞춤 단계 없음 */
    if (keptAnim) el.anim = keptAnim;           /* 애니 유지 */
    if (keptCrop.radius != null) el.radius = keptCrop.radius;  /* 크롭 유지 */
    if (keptCrop.fit != null) el.fit = keptCrop.fit;
    delete el.fill; delete el.cutout;           /* 빈 틀 표시는 걷어낸다 — 실미디어가 찼다 */
    return { ok: true, msg: `${media.kind === 'video' ? '영상' : '사진'} "${media.name}" — 자리 그대로, 애니·크롭 유지`, interactions: 1 };
  }
  /* 판정: 교체 전후로 애니·크롭·기하가 실제로 보존되는가 */
  function replaceAudit() {
    const d = demoDoc(); AN().ensure(d.scenes[0]);
    const ei = d.scenes[0].elements.findIndex((e) => kindOf(e) !== 'text');
    const el = d.scenes[0].elements[ei];
    el.radius = 12; el.anim.preset = 'pop'; el.anim.delay = 0.4;
    const before = { x: el.x, y: el.y, w: el.w, h: el.h, anim: clone(el.anim), radius: el.radius };
    const img = replace(d, 0, ei, { name: '운동회 사진', kind: 'image', id: 'as-001' });
    const vid = replace(d, 0, ei, { name: '실험 영상', kind: 'video', id: 'as-052' });
    const after = d.scenes[0].elements[ei];
    const v = [];
    if (!img.ok || !vid.ok) v.push('교체 실패');
    if (after.x !== before.x || after.y !== before.y || after.w !== before.w || after.h !== before.h) v.push('자동 맞춤 위반 — 틀이 흔들림');
    if (JSON.stringify(after.anim) !== JSON.stringify(before.anim)) v.push('애니 유실');
    if (after.radius !== before.radius) v.push('크롭 유실');
    if (!after.video) v.push('영상 미반영');
    if ((img.interactions || 9) !== 1) v.push('드롭 1회 초과');
    return { ok: !v.length, violations: v };
  }
  function replaceSpecAudit(spec) {
    if (spec.losesAnim) return { ok: false, reason: '교체가 애니메이션을 잃는다 — 유지가 계약' };
    if (spec.manualFit) return { ok: false, reason: '수동 맞춤 다이얼로그 — 자동 맞춤이 계약' };
    if ((spec.interactions || 1) > 1) return { ok: false, reason: '드롭 한 번을 넘는 절차' };
    return { ok: true };
  }

  /* ============================================================
     F2 — AI Quick Action (선택 시 4개만: 개선·교체·스타일·삭제)
     ============================================================ */
  const STYLE_CYCLE_TEXT = [
    { name: '기본', set: { weight: 400, color: undefined } },
    { name: '강조', set: { weight: 700, color: undefined } },
    { name: '포인트', set: { weight: 700, color: '#E8735A' } },
    { name: '차분', set: { weight: 500, color: '#2E8C7F' } },
  ];
  const STYLE_CYCLE_BOX = ['#E3F1EE', '#FBE9E4', '#F5F1E6', '#E8EAF6', '#EEF2F0'];
  const QUICK = [
    { id: 'improve', icon: '✨', label: (el) => '개선' },
    { id: 'replace', icon: '🖼', label: (el) => kindOf(el) === 'text' ? '고치기' : '교체' },
    { id: 'style', icon: '🎨', label: (el) => '스타일' },
    { id: 'delete', icon: '🗑', label: (el) => '삭제' },
  ];
  const quickFor = (el) => QUICK.map((q) => ({ id: q.id, icon: q.icon, label: q.label(el) }));
  function quickRun(doc, si, ei, action) {
    const s = doc.scenes[si], el = s && s.elements[ei];
    if (!el) return { ok: false, msg: '선택된 요소가 없어요' };
    if (action === 'delete') { s.elements.splice(ei, 1); return { ok: true, msg: '삭제했어요', deselect: true }; }
    if (action === 'replace') {
      if (kindOf(el) === 'text') return { ok: true, msg: '바로 고쳐 쓰세요', edit: true };
      return replace(doc, si, ei, { name: '추천 이미지', kind: 'image', id: 'as-auto' });
    }
    if (action === 'style') {
      el._sty = ((el._sty || 0) + 1);
      if (kindOf(el) === 'text') {
        const st = STYLE_CYCLE_TEXT[el._sty % STYLE_CYCLE_TEXT.length];
        el.weight = st.set.weight; if (st.set.color) el.color = st.set.color; else delete el.color;
        return { ok: true, msg: `스타일 — ${st.name}` };
      }
      el.fill = STYLE_CYCLE_BOX[el._sty % STYLE_CYCLE_BOX.length];
      return { ok: true, msg: '색을 바꿨어요' };
    }
    if (action === 'improve') {
      const fixed = fixElement(doc, si, ei);
      return { ok: true, msg: fixed.length ? '✨ ' + fixed.join(' · ') : '✨ 이미 좋아요', noop: !fixed.length };
    }
    return { ok: false, msg: '없는 동작' };
  }
  function quickAudit() {
    const d = demoDoc();
    const el = d.scenes[0].elements.find((e) => kindOf(e) === 'text');
    const v = [];
    const acts = quickFor(el);
    if (acts.length !== 4) v.push(`액션 ${acts.length}개 — 정확히 4개가 계약`);
    if (acts.map((a) => a.id).join() !== 'improve,replace,style,delete') v.push('구성·순서 위반');
    const n0 = d.scenes[0].elements.length;
    const st = quickRun(d, 0, d.scenes[0].elements.indexOf(el), 'style');
    if (!st.ok || el.weight !== 700) v.push('스타일 실변형 실패');
    const ii = d.scenes[0].elements.findIndex((e) => kindOf(e) === 'image');
    const rp = quickRun(d, 0, ii, 'replace');
    if (!rp.ok || !d.scenes[0].elements[ii].media) v.push('교체 실변형 실패');
    quickRun(d, 0, 0, 'delete');
    if (d.scenes[0].elements.length !== n0 - 1) v.push('삭제 실변형 실패');
    return { ok: !v.length, violations: v };
  }
  function quickSpecAudit(spec) {
    if ((spec.actions || []).length > 4) return { ok: false, reason: `액션 ${spec.actions.length}개 — 4개를 넘으면 빠른 동작이 아니다` };
    if ((spec.actions || []).some((a) => !a.run)) return { ok: false, reason: '실행 없는 액션 — 모든 인터랙션은 동작해야 한다' };
    return { ok: true };
  }

  /* ============================================================
     F3 — Magic Resize (비율 원클릭 · 전 씬 앵커존 재배치)
     ============================================================ */
  const RATIOS = [
    { id: '16:9', name: '발표 16:9', w: 1280, h: 720 }, { id: '1:1', name: '정사각 1:1', w: 1080, h: 1080 },
    { id: '4:5', name: '피드 4:5', w: 1080, h: 1350 }, { id: '9:16', name: '쇼츠 9:16', w: 1080, h: 1920 },
    { id: 'a4', name: 'A4 세로', w: 794, h: 1123 },
  ];
  /* 한 축 재배치: 가장자리 여백<12% → 여백 비율 유지, 아니면 중심 비율 매핑 */
  function anchorMap(c, size, oldD, newD) {
    const half = size / 2, lead = c - half, trail = oldD - (c + half), edge = oldD * 0.12;
    if (lead <= edge && lead <= trail) return lead * (newD / oldD) + half;
    if (trail <= edge && trail < lead) return newD - trail * (newD / oldD) - half;
    return (c / oldD) * newD;
  }
  function magicResize(doc, ratioId) {
    const R = RATIOS.find((r) => r.id === ratioId);
    if (!R) return { ok: false, msg: '없는 비율' };
    doc.scenes.forEach((s) => {
      const ow = s.width, oh = s.height, nw = R.w, nh = R.h;
      if (ow === nw && oh === nh) return;
      const k = Math.min(nw / ow, nh / oh);              /* 요소 크기 공통 배율 — 형태 유지 */
      s.elements.forEach((el) => {
        const aw = el.w / 100 * ow;
        const ah = (el.h != null ? el.h / 100 * oh : (el.size / 100 * oh) * 1.3 * String(el.text || '').split('\n').length);
        const acx = (el.x / 100 * ow) + aw / 2, acy = (el.y / 100 * oh) + ah / 2;
        const full = el.w >= 96 && (el.h == null ? false : el.h >= 96);
        const ncx = full ? nw / 2 : anchorMap(acx, aw * k, ow, nw);
        const ncy = full ? nh / 2 : anchorMap(acy, ah * k, oh, nh);
        const naw = full ? nw : aw * k, nah = ah * k;
        el.x = +(((ncx - naw / 2) / nw) * 100).toFixed(2);
        el.y = +(((ncy - nah / 2) / nh) * 100).toFixed(2);
        el.w = +((naw / nw) * 100).toFixed(2);
        if (el.h != null) el.h = +(((full ? nh : nah) / nh) * 100).toFixed(2);
        if (el.size != null) el.size = +(((el.size / 100 * oh) * k / nh) * 100).toFixed(2);
      });
      s.width = R.w; s.height = R.h;
    });
    doc.ratio = R.id;
    return { ok: true, msg: `${R.name}로 변환 — 전 ${doc.scenes.length}장면 자동 재배치`, interactions: 1 };
  }
  function resizeAudit() {
    const d = demoDoc();
    const counts = d.scenes.map((s) => s.elements.length);
    const r = magicResize(d, '9:16');
    const v = [];
    if (!r.ok) v.push('변환 실패');
    if (r.interactions !== 1) v.push('원클릭 위반');
    d.scenes.forEach((s, i) => {
      if (s.width !== 1080 || s.height !== 1920) v.push(`씬 ${i + 1} 크기 미변환`);
      if (s.elements.length !== counts[i]) v.push(`씬 ${i + 1} 요소 유실`);
      s.elements.forEach((el) => {
        if (el.x < -1 || el.x + el.w > 101 || el.y < -1 || el.y > 104) v.push(`씬 ${i + 1} 요소 화면 밖 (${el.x},${el.y})`);
      });
    });
    /* 가장자리 붙음 유지 — 표지 좌측 세로 바(x=0)가 계속 왼쪽에 붙어 있는가 */
    const bar = d.scenes[0].elements[0];
    if (bar.x > 2) v.push('좌측 붙임 요소가 떨어짐');
    return { ok: !v.length, violations: v };
  }
  function resizeSpecAudit(spec) {
    if (spec.perElementManual) return { ok: false, reason: '요소별 수동 보정 요구 — AI 재배치가 계약' };
    if (spec.dropsElements) return { ok: false, reason: '내용을 잘라내는 변환 — 요소 유실 금지' };
    if ((spec.clicks || 1) > 1) return { ok: false, reason: '클릭 ' + spec.clicks + '회 — 원클릭이 계약' };
    return { ok: true };
  }

  /* ============================================================
     F4 — AI Timeline (자연어 → 모션·씬 실변형, MK_ANIM 프리셋)
     ============================================================ */
  const VERB_IN = [
    [/팝|튀어|뿅/, 'pop'], [/스르륵|페이드|살며시/, 'fade'], [/바운스|통통|떨어/, 'bounce'],
    [/밀려|슬라이드|왼쪽에서|오른쪽에서|아래에서|위에서/, 'slide'], [/줌|크게 시작/, 'zoom'],
    [/커지/, 'scale'], [/닦아|와이프/, 'wipe'], [/초점|흐림|블러/, 'blur'], [/돌며|회전|기울/, 'rotate'],
  ];
  const VERB_IDLE = [[/둥둥|떠다니|부유/, 'float'], [/두근|맥동|콩닥/, 'pulse']];
  const ORD = { '첫': 0, '두': 1, '둘': 1, '세': 2, '셋': 2, '네': 3, '넷': 3, '다섯': 4 };
  const ordOf = (w) => ORD[w] != null ? ORD[w] : (parseInt(w, 10) - 1);

  function pickEls(t, scene) {
    const els = scene.elements;
    if (/제목|타이틀/.test(t)) {
      let bi = -1, bs = -1;
      els.forEach((el, i) => { if (kindOf(el) === 'text' && el.size > bs) { bs = el.size; bi = i; } });
      return bi >= 0 ? [bi] : [];
    }
    let kind = null;
    if (/사진|이미지|그림|영상/.test(t)) kind = 'image';
    else if (/글자|텍스트|문구/.test(t)) kind = 'text';
    else if (/도형|박스|상자/.test(t)) kind = 'box';
    const pool = els.map((el, i) => ({ el, i })).filter((x) => !kind || kindOf(x.el) === kind);
    const m = t.match(/(첫|두|둘|세|셋|네|넷|다섯|\d+)\s*(?:번째|번)/);
    if (m && !/장면|씬/.test(t)) { const p = pool[ordOf(m[1])]; return p ? [p.i] : []; }
    return pool.map((x) => x.i);
  }
  function timeline(text, doc, sceneIdx) {
    doc = doc || liveDoc(); if (!doc) return { ok: false, msg: '문서가 없어요' };
    const t = String(text || '').trim(); if (!t) return { ok: false, msg: '' };
    const si = sceneIdx == null ? 0 : sceneIdx;
    const notes = [];
    /* 장면 길이·전환 */
    const dm = t.match(/(?:(첫|두|둘|세|셋|네|넷|다섯|\d+)\s*(?:번째)?\s*)?(?:장면|씬)\s*(?:을|를)?\s*(\d+(?:\.\d+)?)\s*초/);
    if (dm) {
      const i = dm[1] ? ordOf(dm[1]) : si;
      if (doc.scenes[i]) { doc.scenes[i].duration = clamp(parseFloat(dm[2]), 1, 30); notes.push(`${i + 1}장면 → ${dm[2]}초`); }
    }
    const tm = t.match(/전환.*(페이드|슬라이드|없)|(페이드|슬라이드)\s*전환/);
    if (tm) {
      const ty = /슬라이드/.test(t) ? 'slide' : /없/.test(t) ? 'none' : 'fade';
      doc.scenes[si].transition = ty; notes.push('전환 → ' + ty);
    }
    /* 요소 애니 */
    let preset = null, idle = null, dir = null;
    for (const [re, p] of VERB_IN) if (re.test(t)) { preset = p; break; }
    for (const [re, p] of VERB_IDLE) if (re.test(t)) { idle = p; break; }
    if (/왼쪽에서/.test(t)) dir = 'right'; else if (/오른쪽에서/.test(t)) dir = 'left';
    else if (/아래에서/.test(t)) dir = 'up'; else if (/위에서/.test(t)) dir = 'down';
    const delayM = t.match(/(\d+(?:\.\d+)?)\s*초\s*(?:뒤|후|늦게)/);
    const seq = /순서대로|차례로|하나씩/.test(t);
    if (preset || idle || delayM || seq) {
      const sc = doc.scenes[si]; AN().ensure(sc);
      const ids = pickEls(t, sc);
      if (!ids.length) return { ok: false, msg: '대상을 못 찾았어요 — "제목", "사진 전부"처럼 말해 보세요' };
      ids.forEach((i, order) => {
        const a = sc.elements[i].anim;
        if (preset) a.preset = preset;
        if (dir) a.direction = dir;
        if (delayM) a.delay = parseFloat(delayM[1]);
        if (seq) { a.delay = +(order * 0.3).toFixed(2); if (!preset && a.preset === 'inherit') a.preset = 'slide'; }
      });
      if (idle) sc.anim.idle.preset = idle;
      notes.push(`${ids.length}개 요소 · ${[preset && '등장:' + preset, idle && '상시:' + idle, delayM && delayM[1] + '초 뒤', seq && '순차 0.3s'].filter(Boolean).join(' · ')}`);
    }
    if (!notes.length) return { ok: false, msg: '아직 못 알아듣는 말이에요 — "제목 팝으로", "장면 5초로", "사진 전부 순서대로"' };
    return { ok: true, msg: '🎬 ' + notes.join(' / '), summary: notes.join(' / ') };
  }
  function timelineAudit() {
    const d = demoDoc(); const v = [];
    const r1 = timeline('제목 팝으로 나오게', d, 0);
    const ti = pickEls('제목', d.scenes[0])[0];
    if (!r1.ok || d.scenes[0].elements[ti].anim.preset !== 'pop') v.push('제목 팝 실변형 실패');
    const r2 = timeline('두 번째 장면을 8초로', d, 0);
    if (!r2.ok || d.scenes[1].duration !== 8) v.push('장면 길이 실변형 실패');
    const r3 = timeline('사진 전부 순서대로 나오게', d, 0);
    const imgs = pickEls('사진', d.scenes[0]);
    if (!r3.ok || imgs.length < 1 || d.scenes[0].elements[imgs[imgs.length - 1]].anim.delay !== +((imgs.length - 1) * 0.3).toFixed(2)) v.push('순차 등장 실패');
    const r4 = timeline('아무말이나 해본다', d, 0);
    if (r4.ok) v.push('가짜 성공 — 못 알아들으면 실패해야 정직');
    if (!timeline('둥둥 떠다니게', d, 0).ok || d.scenes[0].anim.idle.preset !== 'float') v.push('상시 모션 실패');
    return { ok: !v.length, violations: v };
  }
  function timelineSpecAudit(spec) {
    if (spec.dragOnly) return { ok: false, reason: '타임라인 드래그 조작이 유일 경로 — 자연어가 계약' };
    if (spec.fakeSuccess) return { ok: false, reason: '못 알아들어도 성공이라 답하는 파서 — 정직 위반' };
    return { ok: true };
  }

  /* ============================================================
     F5 — Hover Editing (호버 즉시 동작 ≤3)
     ============================================================ */
  const hoverFor = (el) => kindOf(el) === 'text'
    ? [{ id: 'edit', icon: '✏️', label: '고치기' }, { id: 'delete', icon: '🗑', label: '삭제' }]
    : [{ id: 'replace', icon: '🖼', label: '교체' }, { id: 'delete', icon: '🗑', label: '삭제' }];
  function hoverAudit() {
    const d = demoDoc(); const v = [];
    d.scenes[0].elements.forEach((el) => { if (hoverFor(el).length > 3) v.push('호버 동작 3개 초과'); });
    const img = d.scenes[0].elements.find((e) => kindOf(e) === 'image');
    if (!hoverFor(img).some((h) => h.id === 'replace')) v.push('이미지 호버에 교체 없음');
    return { ok: !v.length, violations: v };
  }

  /* ============================================================
     F6 — Auto Animation (새 미디어 = 자동 애니, 수동 설정 0)
     ============================================================ */
  const AUTO_PRESET = { image: 'fade', video: 'zoom', box: 'fade', text: 'fade' };
  function insertMedia(doc, si, media) {
    const s = doc.scenes[si]; if (!s) return { ok: false, msg: '장면이 없어요' };
    if (media.kind === 'audio') {              /* 음악 = 씬 배경음 — 요소가 아니라 씬 속성 */
      s.music = { name: media.name, id: media.id || null };
      return { ok: true, msg: `♪ "${media.name}" 배경음악으로`, manualConfig: 0 };
    }
    AN().ensure(s);
    const n = s.elements.length;
    const el = { kind: 'image', x: 30, y: 30, w: 40, h: 34, label: media.name,
      media: { kind: media.kind || 'image', id: media.id || null } };
    if (media.kind === 'video') el.video = true;
    el.anim = { preset: AUTO_PRESET[media.kind] || 'fade', delay: +(Math.min(2, n * 0.15)).toFixed(2), duration: 0.6, direction: 'up', ease: 'ease-out', repeat: 1 };
    s.elements.push(el);
    return { ok: true, msg: `"${media.name}" 넣고 애니까지 자동으로`, manualConfig: 0, elIdx: s.elements.length - 1 };
  }
  function autoAnimAudit() {
    const d = demoDoc(); const v = [];
    const r = insertMedia(d, 0, { name: '현장체험 사진', kind: 'image', id: 'as-010' });
    const el = d.scenes[0].elements[r.elIdx];
    if (!r.ok || !el.anim || el.anim.preset === 'inherit') v.push('삽입 요소에 자동 애니 없음');
    if (r.manualConfig !== 0) v.push('수동 설정 요구');
    const rv = insertMedia(d, 0, { name: '증발 실험', kind: 'video' });
    if (!rv.ok || d.scenes[0].elements[rv.elIdx].anim.preset !== 'zoom') v.push('영상 자동 프리셋 실패');
    const rm = insertMedia(d, 0, { name: '밝은 피아노 루프', kind: 'audio' });
    if (!rm.ok || !d.scenes[0].music) v.push('음악 삽입 실패');
    return { ok: !v.length, violations: v };
  }
  function autoAnimSpecAudit(spec) {
    if (spec.settingsDialog) return { ok: false, reason: '삽입할 때 설정 다이얼로그 — AI 자동이 계약' };
    if ((spec.manualConfig || 0) > 0) return { ok: false, reason: '수동 설정 ' + spec.manualConfig + '개 — 0이 계약' };
    return { ok: true };
  }

  /* ============================================================
     F7 — Universal Asset Search (사진·영상·아이콘·배경·음악 한 곳)
     ============================================================ */
  const SEARCH_KINDS = [
    { id: 'images', ko: '사진' }, { id: 'videos', ko: '영상' }, { id: 'icons', ko: '아이콘' },
    { id: 'backgrounds', ko: '배경' }, { id: 'audio', ko: '음악' },
  ];
  function searchAll(q) {
    q = String(q || '').trim().toLowerCase();
    const kinds = SEARCH_KINDS.map((k) => k.id);
    const hit = (a) => {
      if (!q) return 1;
      const hay = (a.name + ' ' + (a.tags || []).join(' ')).toLowerCase();
      return hay.includes(q) ? 10 : 0;
    };
    const groups = SEARCH_KINDS.map((k) => ({
      kind: k.id, ko: k.ko,
      items: AS().ASSETS.filter((a) => a.category === k.id).map((a) => ({ id: a.id, name: a.name, score: hit(a), kind: k.id }))
        .filter((x) => x.score > 0).slice(0, 6),
    })).filter((g) => g.items.length);
    return { q, entrances: 1, kinds, groups, total: groups.reduce((s, g) => s + g.items.length, 0) };
  }
  /* 검색 결과 → 삽입 (F6 자동 애니 체인) */
  function pickResult(doc, si, item) {
    const kindMap = { images: 'image', videos: 'video', icons: 'image', backgrounds: 'image', audio: 'audio' };
    return insertMedia(doc, si, { name: item.name, kind: kindMap[item.kind] || 'image', id: item.id });
  }
  function searchAudit() {
    const v = [];
    const all = searchAll('');
    if (JSON.stringify(all.kinds) !== JSON.stringify(['images', 'videos', 'icons', 'backgrounds', 'audio'])) v.push('5종 커버리지 위반');
    if (all.entrances !== 1) v.push('입구가 하나가 아님');
    const m = searchAll('피아노');
    if (!m.groups.some((g) => g.kind === 'audio' && g.items.length)) v.push('음악 실검색 실패');
    const d = demoDoc();
    const pk = pickResult(d, 0, { id: 'as-104', name: '밝은 피아노 루프', kind: 'audio' });
    if (!pk.ok || !d.scenes[0].music) v.push('검색→삽입 체인 실패');
    return { ok: !v.length, violations: v };
  }

  /* ============================================================
     F8 — One Click Theme (타이포·색·간격 전 씬 즉시)
     ============================================================ */
  const THEMES = () => Object.entries(SEC().PALETTES).map(([id, p]) => ({ id, name: p.name, palette: p }));
  function applyTheme(doc, paletteId) {
    const P = SEC().PALETTES[paletteId];
    if (!P) return { ok: false, msg: '없는 테마' };
    doc.palette = paletteId; doc.fontFamily = 'Pretendard';
    doc.scenes.forEach((s, si) => {
      const dark = si === 0 || si === doc.scenes.length - 1;   /* 표지·엔딩 = 다크, 본문 = 라이트 */
      s.background = dark ? P.dark : P.light;
      s.elements.forEach((el) => {
        const k = kindOf(el);
        if (k === 'text') {
          el.color = (el.weight || 400) >= 600 ? (dark ? P.light : P.dark) : (dark ? P.mutedOnDark : P.mutedOnLight);
          if (el.size >= 6) el.color = dark ? P.light : P.dark;
          el.x = Math.round(el.x / 2) * 2;                      /* 간격 — 2% 격자 정돈 */
          el.y = Math.round(el.y / 2) * 2;
        } else if (k === 'box') {
          el.fill = el.w < 12 && (el.h || 0) < 4 ? P.accent : (dark ? 'rgba(255,255,255,.08)' : P.soft);
        }
      });
    });
    return { ok: true, msg: `테마 「${P.name}」 — 전 ${doc.scenes.length}장면 즉시 적용`, interactions: 1 };
  }
  function themeAudit() {
    const d = demoDoc(); const v = [];
    const r = applyTheme(d, 'pl-noir');
    if (!r.ok || r.interactions !== 1) v.push('원클릭 위반');
    const P = SEC().PALETTES['pl-noir'];
    d.scenes.forEach((s, i) => {
      if (s.background !== P.dark && s.background !== P.light) v.push(`씬 ${i + 1} 배경 미적용`);
      s.elements.forEach((el) => {
        if (kindOf(el) === 'text' && el.color) {
          const bgDark = SEC().isDark(s.background);
          if (Math.abs(lum(el.color) - lum(s.background)) < 0.25) v.push(`씬 ${i + 1} 저대비 텍스트`);
          void bgDark;
        }
        if (kindOf(el) === 'text' && (el.x % 2 || el.y % 2)) v.push('격자 정돈 위반');
      });
    });
    return { ok: !v.length, violations: v };
  }
  function themeSpecAudit(spec) {
    if (spec.perScene) return { ok: false, reason: '씬마다 수동 반복 — 프로젝트 전체 즉시가 계약' };
    if ((spec.clicks || 1) > 1) return { ok: false, reason: '클릭 ' + spec.clicks + '회 — 원클릭이 계약' };
    return { ok: true };
  }

  /* ============================================================
     F9 — Command Palette (Ctrl+K — 모든 P0 진입점 검색 실행)
     ============================================================ */
  const CMDS = [
    { id: 'ez-replace', f: 'F1', label: '사진·영상 자리 교체', k: ['교체', 'replace', '드롭'], run: (doc) => replace(doc, 0, doc.scenes[0].elements.findIndex((e) => kindOf(e) !== 'text'), { name: '추천 이미지', kind: 'image' }) },
    { id: 'ez-quick', f: 'F2', label: '빠른 동작 — 선택 개선', k: ['개선', 'improve', '빠른'], run: (doc) => quickRun(doc, 0, 0, 'improve') },
    ...RATIOS.map((r) => ({ id: 'ez-resize-' + r.id, f: 'F3', label: '매직 리사이즈 → ' + r.name, k: ['리사이즈', '비율', 'resize', r.id], run: (doc) => magicResize(doc, r.id) })),
    { id: 'ez-timeline', f: 'F4', label: '자연어 모션 — "제목 팝으로"', k: ['타임라인', '모션', '애니'], run: (doc) => timeline('제목 팝으로', doc, 0) },
    { id: 'ez-insert', f: 'F6', label: '미디어 넣기 (애니 자동)', k: ['삽입', '넣기', '사진'], run: (doc) => insertMedia(doc, 0, { name: '추천 사진', kind: 'image' }) },
    { id: 'ez-search', f: 'F7', label: '통합 검색 — 사진·영상·아이콘·배경·음악', k: ['검색', 'search', '음악'], run: () => searchAll('') },
    { id: 'ez-theme', f: 'F8', label: '테마 한 번에 — ' + 'Ink & Teal', k: ['테마', 'theme', '색'], run: (doc) => applyTheme(doc, 'pl-ink') },
    { id: 'ez-coach', f: 'F10', label: 'AI 코치 — 디자인 진단', k: ['코치', 'coach', '진단'], run: (doc) => ({ ok: true, suggestions: coach(doc).length }) },
  ];
  const SHORTCUT = 'Ctrl+K';
  function paletteSearch(q) {
    q = String(q || '').trim().toLowerCase();
    const score = (c) => !q ? 1 : (c.label.toLowerCase().includes(q) || c.k.some((k) => k.toLowerCase().includes(q))) ? 10 : 0;
    const easy = CMDS.map((c) => ({ id: c.id, f: c.f, label: c.label, score: score(c) })).filter((x) => x.score > 0);
    const flow = (FL() && q) ? FL().search(q).groups : [];
    return { q, shortcut: SHORTCUT, easy, flow, total: easy.length + flow.reduce((s, g) => s + g.items.length, 0) };
  }
  function paletteRun(id, doc) {
    const c = CMDS.find((x) => x.id === id);
    if (!c) return { ok: false, msg: '없는 명령' };
    return c.run(doc || demoDoc());
  }
  function paletteAudit() {
    const v = [];
    if (NV() && NV().SHORTCUT !== SHORTCUT) v.push('단축키 불일치 (MK_NAV)');
    /* 커버리지 — P0 기능별 진입점이 팔레트 검색으로 실도달 */
    const need = [['F1', '교체'], ['F2', '개선'], ['F3', '리사이즈'], ['F4', '모션'], ['F6', '넣기'], ['F7', '음악'], ['F8', '테마'], ['F10', '코치']];
    need.forEach(([f, q]) => {
      const r = paletteSearch(q);
      if (!r.easy.some((c) => c.f === f)) v.push(`${f} 팔레트 미도달 ("${q}")`);
    });
    /* 전 명령 실행 실동작 */
    CMDS.forEach((c) => { const r = c.run(demoDoc()); if (!r || r.ok === false) v.push(c.id + ' 실행 실패'); });
    return { ok: !v.length, commands: CMDS.length, violations: v };
  }

  /* ============================================================
     F10 — AI Coach (지속 진단 6규칙 · fix 실행 · selfHeal 수렴)
     ============================================================ */
  function fixElement(doc, si, ei) {
    const s = doc.scenes[si], el = s.elements[ei], did = [];
    if (kindOf(el) === 'text') {
      if (el.size < 2) { el.size = 2.4; did.push('읽기 좋은 크기'); }
      if (el.color && Math.abs(lum(el.color) - lum(s.background)) < 0.25) { delete el.color; did.push('대비 살리기'); }
      const t0 = el.text; el.text = String(el.text || '').replace(/[ \t]+$/gm, '');
      if (el.text !== t0) did.push('공백 정리');
    }
    if (el.x < 0 || el.x + el.w > 100 || el.y < 0 || el.y > 100) {
      el.x = clamp(el.x, 0, 100 - el.w); el.y = clamp(el.y, 0, 96); did.push('화면 안으로');
    }
    return did;
  }
  function coach(doc) {
    const out = [];
    doc.scenes.forEach((s, si) => {
      s.elements.forEach((el, ei) => {
        const k = kindOf(el);
        if (k === 'text' && el.size < 2)
          out.push({ rule: 'tiny', msg: `${si + 1}장면 글자가 너무 작아요`, fix: (d) => { d.scenes[si].elements[ei].size = 2.4; } });
        if (k === 'text' && el.color && Math.abs(lum(el.color) - lum(s.background)) < 0.25)
          out.push({ rule: 'contrast', msg: `${si + 1}장면 글자색이 배경에 묻혀요`, fix: (d) => { delete d.scenes[si].elements[ei].color; } });
        if (el.x < 0 || el.x + el.w > 100 || el.y < 0 || el.y > 100)
          out.push({ rule: 'off', msg: `${si + 1}장면에 화면 밖 요소가 있어요`, fix: (d) => { const e2 = d.scenes[si].elements[ei]; e2.x = clamp(e2.x, 0, 100 - e2.w); e2.y = clamp(e2.y, 0, 96); } });
        const edge = Math.min(el.x, el.y, 100 - (el.x + el.w));
        if (k === 'text' && edge > 0 && edge < 3)
          out.push({ rule: 'edge', msg: `${si + 1}장면 가장자리에 아슬한 글자가 있어요`, fix: (d) => { const e2 = d.scenes[si].elements[ei]; e2.x = clamp(e2.x, 4, 100 - e2.w - 4); } });
      });
    });
    const first = doc.scenes[0];
    if (first && !first.elements.some((el) => kindOf(el) === 'text' && el.size >= 5))
      out.push({ rule: 'title', msg: '표지에 눈에 띄는 제목이 없어요', fix: (d) => { let bi = -1, bs = -1; d.scenes[0].elements.forEach((el, i) => { if (kindOf(el) === 'text' && el.size > bs) { bs = el.size; bi = i; } }); if (bi >= 0) d.scenes[0].elements[bi].size = Math.max(6, bs); } });
    const dursOk = doc.scenes.every((s) => s.duration >= 1 && s.duration <= 30);
    if (!dursOk) out.push({ rule: 'dur', msg: '장면 길이가 어색해요', fix: (d) => d.scenes.forEach((s) => { s.duration = clamp(s.duration, 1, 30); }) });
    /* 규칙당 1건 — 잔소리 금지 */
    const seen = {}, dedup = [];
    out.forEach((s) => { if (!seen[s.rule]) { seen[s.rule] = 1; dedup.push(s); } });
    return dedup;
  }
  function selfHeal(doc) {
    let rounds = 0;
    for (; rounds < 10; rounds++) {
      const sug = coach(doc);
      if (!sug.length) break;
      sug.forEach((s) => s.fix(doc));
    }
    return { ok: coach(doc).length === 0, rounds };
  }
  function coachAudit() {
    const d = demoDoc(); const v = [];
    /* 결함 심기 → 진단 → fix → 재진단 수렴 */
    d.scenes[0].elements.push({ kind: 'text', x: 40, y: 30, w: 30, size: 1.2, text: '깨알', weight: 400 });
    d.scenes[1].elements.push({ kind: 'image', x: 96, y: 40, w: 20, h: 20, label: '삐져나감' });
    d.scenes[2].elements[1].color = d.scenes[2].background;    /* 배경색 = 글자색 */
    const sug = coach(d);
    if (!sug.some((s) => s.rule === 'tiny')) v.push('작은 글자 미감지');
    if (!sug.some((s) => s.rule === 'off')) v.push('화면 밖 미감지');
    if (!sug.some((s) => s.rule === 'contrast')) v.push('저대비 미감지');
    if (sug.some((s) => typeof s.fix !== 'function')) v.push('fix 없는 제안');
    const rules = sug.map((s) => s.rule);
    if (new Set(rules).size !== rules.length) v.push('같은 잔소리 반복');
    const heal = selfHeal(d);
    if (!heal.ok) v.push('selfHeal 미수렴');
    const clean = coach(demoDoc());
    if (clean.length) v.push('깨끗한 문서에 잔소리 ' + clean.length + '건');
    return { ok: !v.length, violations: v };
  }
  function coachSpecAudit(spec) {
    if ((spec.suggestions || []).some((s) => !s.fix)) return { ok: false, reason: '고쳐주지 않는 지적 — 제안엔 실행 가능한 fix가 계약' };
    if (spec.nagRepeat) return { ok: false, reason: '같은 지적 반복 — 규칙당 1건이 계약' };
    return { ok: true };
  }

  /* ============================================================
     §완료 — P0 전수 판정
     ============================================================ */
  const FEATURES = [
    ['F1', 'Smart Replace', replaceAudit], ['F2', 'AI Quick Action', quickAudit],
    ['F3', 'Magic Resize', resizeAudit], ['F4', 'AI Timeline', timelineAudit],
    ['F5', 'Hover Editing', hoverAudit], ['F6', 'Auto Animation', autoAnimAudit],
    ['F7', 'Universal Search', searchAudit], ['F8', 'One Click Theme', themeAudit],
    ['F9', 'Command Palette', paletteAudit], ['F10', 'AI Coach', coachAudit],
  ];
  function p0Audit() {
    const rows = FEATURES.map(([id, name, fn]) => { const r = fn(); return { id, name, ok: r.ok, violations: r.violations || [] }; });
    return { ok: rows.every((r) => r.ok), rows, passed: rows.filter((r) => r.ok).length, total: rows.length };
  }
  function complete() { return p0Audit().ok; }

  return {
    PHILOSOPHY, RULES, FORBIDDEN_TEXT, SURFACE_BASELINE, textAudit, surfaceAudit,
    demoDoc, kindOf, hist,
    /* F1 */ replace, replaceAudit, replaceSpecAudit,
    /* F2 */ QUICK, quickFor, quickRun, quickAudit, quickSpecAudit,
    /* F3 */ RATIOS, anchorMap, magicResize, resizeAudit, resizeSpecAudit,
    /* F4 */ timeline, timelineAudit, timelineSpecAudit, pickEls,
    /* F5 */ hoverFor, hoverAudit,
    /* F6 */ insertMedia, autoAnimAudit, autoAnimSpecAudit,
    /* F7 */ SEARCH_KINDS, searchAll, pickResult, searchAudit,
    /* F8 */ THEMES, applyTheme, themeAudit, themeSpecAudit,
    /* F9 */ CMDS, SHORTCUT, paletteSearch, paletteRun, paletteAudit,
    /* F10 */ coach, fixElement, selfHeal, coachAudit, coachSpecAudit,
    FEATURES, p0Audit, complete,
  };
})();
