/* ============================================================
   K-MAKER Plugin Platform v1  —  window.MK_PLUGIN
   ------------------------------------------------------------
   철학: Core는 최소 기능만 가진다. 새로운 기능은 전부 Plugin이다.
   Core를 수정하지 않고 기능을 추가할 수 있는 확장 구조.
   ------------------------------------------------------------
   구성:
   · Manifest Schema + 검증          · Lifecycle FSM(9단계)
   · Permission System(9권한)        · Sandbox(격리 API·Crash Isolation·메모리 제한)
   · Plugin API(Canvas·Selection·Scene·Element·Asset·Brand·AI·Render)
   · Event System(구독 자동 정리)     · Command / Keyboard Shortcut(충돌 검사)
   · Extension Point(10곳)           · Marketplace(설치·리뷰·라이선스·비공개 배포)
   · Auto Update(semver·Rollback)    · Developer Console(로그·오류·성능·API 호출)
   · Developer SDK(Scaffold·Manifest Generator·Test Harness)
   ⚠ 정직 표기: Sandbox는 iframe/worker 실격리가 아닌 API 게이트 격리
   (직접 window 접근을 막을 수는 없으나, 규약 위반은 감사 로그에 남는다).
   메모리 제한은 plugin storage 직렬화 크기 기준의 근사치다.
   Camera·Microphone 권한은 선언·게이트만 — 실장치 연결 없음.
   ============================================================ */
window.MK_PLUGIN = (() => {
  'use strict';

  /* ================================================================
     0. 공통 유틸
     ================================================================ */
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const now = () => Date.now();
  const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 8);

  /* semver: "1.2.3" 비교 (-1|0|1) */
  const semver = (a, b) => {
    const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
    for (let i = 0; i < 3; i++) { const d = (pa[i] || 0) - (pb[i] || 0); if (d) return d > 0 ? 1 : -1; }
    return 0;
  };
  const isSemver = (v) => /^\d+\.\d+\.\d+$/.test(String(v));

  /* ================================================================
     1. 상수 — 카테고리·권한·확장 지점·이벤트·라이프사이클
     ================================================================ */
  const CATEGORIES = ['editor', 'ai', 'asset', 'chart', 'table', 'education', 'presentation',
    'animation', 'media', 'developer', 'export', 'integration', 'productivity', 'collaboration'];

  const PERMS = ['canvas', 'network', 'storage', 'ai', 'asset', 'clipboard', 'export', 'camera', 'microphone'];

  const EXT_POINTS = ['leftSidebar', 'topToolbar', 'bottomToolbar', 'rightInspector', 'contextMenu',
    'canvasOverlay', 'assetBrowser', 'templateBrowser', 'brandManager', 'aiPanel'];

  const EVENTS = ['selectionChanged', 'sceneChanged', 'assetUploaded', 'projectSaved',
    'brandChanged', 'themeChanged', 'pluginInstalled', 'pluginRemoved'];

  /* 지시서 §2 라이프사이클: Install→Load→Initialize→Ready→Running→Suspend→Unload→Update→Remove */
  const STATES = ['installed', 'loaded', 'initialized', 'ready', 'running', 'suspended', 'unloaded', 'removed'];
  const FSM = {  /* state → 허용 전이 */
    installed:   ['loaded', 'removed'],
    loaded:      ['initialized', 'unloaded', 'removed'],
    initialized: ['ready', 'unloaded'],
    ready:       ['running', 'unloaded'],
    running:     ['suspended', 'unloaded'],
    suspended:   ['running', 'unloaded'],
    unloaded:    ['loaded', 'removed'],      /* update 는 unloaded 경유 */
    removed:     [],
  };

  const CRASH_LIMIT = 3;              /* 연속 크래시 → 자동 suspend */
  const MEM_LIMIT = 256 * 1024;       /* plugin storage 직렬화 256KB */

  /* ================================================================
     2. Manifest Schema + 검증
     ================================================================ */
  const SCHEMA = {
    required: ['id', 'name', 'version', 'author', 'entry', 'category', 'permissions'],
    optional: ['company', 'icon', 'description', 'dependencies', 'homepage', 'repository', 'license'],
  };

  function validateManifest(m) {
    const errors = [];
    if (!m || typeof m !== 'object') return { ok: false, errors: ['manifest 없음'] };
    for (const k of SCHEMA.required) if (m[k] == null || m[k] === '') errors.push(`필수 필드 누락: ${k}`);
    if (m.id && !/^[a-z0-9][a-z0-9.-]{1,63}$/.test(m.id)) errors.push('id 형식 오류(소문자·숫자·점·하이픈)');
    if (m.version && !isSemver(m.version)) errors.push('version 은 semver(x.y.z)');
    if (m.category && !CATEGORIES.includes(m.category)) errors.push(`category 미지원: ${m.category}`);
    if (m.permissions) {
      if (!Array.isArray(m.permissions)) errors.push('permissions 는 배열');
      else for (const p of m.permissions) if (!PERMS.includes(p)) errors.push(`permission 미지원: ${p}`);
    }
    if (m.dependencies && !Array.isArray(m.dependencies)) errors.push('dependencies 는 배열');
    return { ok: !errors.length, errors };
  }

  /* ================================================================
     3. 레지스트리 — 설치된 플러그인 상태
     ================================================================ */
  const REG = new Map();   /* id → record */
  const record = (manifest, factory) => ({
    manifest: clone(manifest), factory,
    state: 'installed', installedAt: now(),
    granted: new Set(clone(manifest.permissions || [])),   /* 설치 시 선언 권한 = 기본 승인 */
    handle: null,            /* factory(api) 반환값 */
    api: null,
    subs: [],                /* 이벤트 구독 [{ev, fn}] */
    commands: new Set(), shortcuts: new Set(), contribs: [],
    storage: {},             /* plugin 개인 저장소 */
    logs: [], errors: [], apiCalls: {}, perf: { totalMs: 0, calls: 0 },
    crash: 0,
    prev: null,              /* update 롤백 스냅샷 { manifest, factory } */
  });

  const rec = (id) => { const r = REG.get(id); if (!r) throw new Error(`플러그인 없음: ${id}`); return r; };
  const memBytes = (r) => { try { return JSON.stringify(r.storage).length; } catch { return MEM_LIMIT + 1; } };

  /* ================================================================
     4. Developer Console — 로그·오류·성능·API 호출 수집
     ================================================================ */
  const trim = (arr, n) => { while (arr.length > n) arr.shift(); };
  const devLog = (r, kind, msg) => {
    (kind === 'error' ? r.errors : r.logs).push({ at: now(), kind, msg: String(msg).slice(0, 300) });
    trim(r.logs, 200); trim(r.errors, 100);
  };

  /* ================================================================
     5. Sandbox 게이트 — 권한·상태·크래시 격리·성능 계측
     ================================================================ */
  function gate(r, area, perm, name, fn) {
    return (...args) => {
      if (r.state !== 'running' && r.state !== 'ready' && r.state !== 'initialized')
        throw new Error(`[${r.manifest.id}] ${r.state} 상태에서는 API 호출 불가`);
      if (perm && !r.granted.has(perm)) {
        devLog(r, 'error', `권한 거부: ${area}.${name} (요구: ${perm})`);
        throw new Error(`권한 없음: ${perm}`);
      }
      if (memBytes(r) > MEM_LIMIT) {
        devLog(r, 'error', `메모리 제한 초과(${MEM_LIMIT}B) — storage 정리 필요`);
        throw new Error('메모리 제한 초과');
      }
      const key = `${area}.${name}`;
      r.apiCalls[key] = (r.apiCalls[key] || 0) + 1;
      const t0 = (window.performance || Date).now();
      try {
        const out = fn(...args);
        r.perf.totalMs += ((window.performance || Date).now() - t0); r.perf.calls++;
        r.crash = 0;                                  /* 정상 호출 → 크래시 카운트 초기화 */
        return out;
      } catch (e) {
        devLog(r, 'error', `${key} 실패: ${e.message}`);
        r.crash++;
        if (r.crash >= CRASH_LIMIT && r.state === 'running') {
          transition(r.manifest.id, 'suspended', `연속 크래시 ${r.crash}회 — 자동 일시정지`);
        }
        throw e;
      }
    };
  }

  /* 플러그인 훅(이벤트 콜백 등) 실행 — 호스트를 절대 무너뜨리지 않는다 */
  function safeHook(r, label, fn, ...args) {
    try { return fn(...args); }
    catch (e) {
      devLog(r, 'error', `${label} 크래시: ${e.message}`);
      r.crash++;
      if (r.crash >= CRASH_LIMIT && r.state === 'running')
        transition(r.manifest.id, 'suspended', `연속 크래시 ${r.crash}회 — 자동 일시정지`);
      return undefined;
    }
  }

  /* ================================================================
     6. 에디터 컨텍스트 브리지
     ================================================================ */
  let TEST_DOC = null;   /* jsdom 등 에디터 미기동 시 바인딩용 */
  function ctx() {
    const e = window.PG && window.PG.state && window.PG.state.editor;
    if (e && e.doc) return e;
    if (TEST_DOC) return TEST_DOC;
    throw new Error('열린 문서가 없어요 — Editor 에서 문서를 연 뒤 실행');
  }
  const hist = (label) => { if (window.MK_HIST && window.PG?.state?.editor?.doc) window.MK_HIST.push(label); };
  const scene = (e, i) => {
    const idx = i == null ? e.sceneIdx : i;
    const sc = e.doc.scenes[idx];
    if (!sc) throw new Error(`장면 없음: ${idx}`);
    return sc;
  };

  /* ================================================================
     7. Plugin API 팩토리 — 플러그인이 받는 유일한 창구
     ================================================================ */
  function makeApi(r) {
    const id = r.manifest.id;

    /* ---- Selection API (§7) ---- */
    const selection = {
      getSelection: gate(r, 'selection', 'canvas', 'get', () => {
        const e = ctx(); return e.selEl == null ? [] : [e.selEl];
      }),
      setSelection: gate(r, 'selection', 'canvas', 'set', (idx) => {
        const e = ctx(); scene(e); e.selEl = idx == null ? null : idx; emit('selectionChanged', { by: id }); return true;
      }),
      replaceSelection: gate(r, 'selection', 'canvas', 'replace', (el) => {
        const e = ctx(); const sc = scene(e);
        if (e.selEl == null) throw new Error('선택 없음');
        hist(`[${id}] 선택 교체`); sc.elements[e.selEl] = clone(el); return true;
      }),
      duplicateSelection: gate(r, 'selection', 'canvas', 'duplicate', () => {
        const e = ctx(); const sc = scene(e);
        if (e.selEl == null) throw new Error('선택 없음');
        hist(`[${id}] 선택 복제`);
        const cp = clone(sc.elements[e.selEl]); cp.x = Math.min(92, (cp.x || 0) + 3); cp.y = Math.min(92, (cp.y || 0) + 3);
        sc.elements.push(cp); e.selEl = sc.elements.length - 1; return e.selEl;
      }),
      deleteSelection: gate(r, 'selection', 'canvas', 'delete', () => {
        const e = ctx(); const sc = scene(e);
        if (e.selEl == null) throw new Error('선택 없음');
        hist(`[${id}] 선택 삭제`); sc.elements.splice(e.selEl, 1); e.selEl = null; return true;
      }),
      group: gate(r, 'selection', 'canvas', 'group', (indices) => {
        const e = ctx(); const sc = scene(e);
        const gidV = uid('grp');
        for (const i of indices) { if (!sc.elements[i]) throw new Error(`요소 없음: ${i}`); }
        hist(`[${id}] 그룹`);
        for (const i of indices) sc.elements[i].group = gidV;
        return gidV;
      }),
      ungroup: gate(r, 'selection', 'canvas', 'ungroup', (groupId) => {
        const e = ctx(); const sc = scene(e);
        hist(`[${id}] 그룹 해제`);
        let n = 0; for (const el of sc.elements) if (el.group === groupId) { delete el.group; n++; }
        return n;
      }),
    };

    /* ---- Scene API (§8) ---- */
    const sceneApi = {
      list: gate(r, 'scene', 'canvas', 'list', () => ctx().doc.scenes.map((s, i) => ({ idx: i, id: s.id, name: s.name, elements: s.elements.length }))),
      get: gate(r, 'scene', 'canvas', 'get', (i) => clone(scene(ctx(), i))),
      current: gate(r, 'scene', 'canvas', 'current', () => ctx().sceneIdx),
      create: gate(r, 'scene', 'canvas', 'create', (props) => {
        const e = ctx(); hist(`[${id}] 장면 추가`);
        const base = e.doc.scenes[0] || { width: 1280, height: 720 };
        const sc = { id: uid('s'), name: (props && props.name) || '새 장면', width: base.width, height: base.height, duration: 5, background: (props && props.background) || '#FFFFFF', elements: [], ...clone(props || {}) };
        if (!sc.elements) sc.elements = [];
        e.doc.scenes.push(sc); emit('sceneChanged', { by: id, action: 'create' });
        return e.doc.scenes.length - 1;
      }),
      remove: gate(r, 'scene', 'canvas', 'remove', (i) => {
        const e = ctx(); scene(e, i);
        if (e.doc.scenes.length <= 1) throw new Error('마지막 장면은 삭제 불가');
        hist(`[${id}] 장면 삭제`); e.doc.scenes.splice(i, 1);
        e.sceneIdx = Math.min(e.sceneIdx, e.doc.scenes.length - 1);
        emit('sceneChanged', { by: id, action: 'remove' }); return true;
      }),
      duplicate: gate(r, 'scene', 'canvas', 'duplicate', (i) => {
        const e = ctx(); const sc = scene(e, i); hist(`[${id}] 장면 복제`);
        const cp = clone(sc); cp.id = uid('s'); cp.name = sc.name + ' 복사본';
        e.doc.scenes.splice(i + 1, 0, cp); emit('sceneChanged', { by: id, action: 'duplicate' });
        return i + 1;
      }),
      move: gate(r, 'scene', 'canvas', 'move', (from, to) => {
        const e = ctx(); scene(e, from);
        if (to < 0 || to >= e.doc.scenes.length) throw new Error(`이동 위치 오류: ${to}`);
        hist(`[${id}] 장면 이동`);
        const [sc] = e.doc.scenes.splice(from, 1); e.doc.scenes.splice(to, 0, sc);
        emit('sceneChanged', { by: id, action: 'move' }); return true;
      }),
      rename: gate(r, 'scene', 'canvas', 'rename', (i, name) => {
        const e = ctx(); const sc = scene(e, i); hist(`[${id}] 장면 이름`);
        sc.name = String(name); emit('sceneChanged', { by: id, action: 'rename' }); return true;
      }),
    };

    /* ---- Element API (§9) ---- */
    const alignOne = (el, sc, how) => {
      const w = el.w || 10, h = el.h || (el.size ? el.size * 1.2 : 10);
      if (how === 'left') el.x = 2; else if (how === 'centerX') el.x = Math.round((100 - w) / 2);
      else if (how === 'right') el.x = 98 - w; else if (how === 'top') el.y = 2;
      else if (how === 'centerY') el.y = Math.round((100 - h) / 2); else if (how === 'bottom') el.y = 98 - h;
      else throw new Error(`정렬 미지원: ${how}`);
    };
    const element = {
      create: gate(r, 'element', 'canvas', 'create', (el, sceneIdx) => {
        const e = ctx(); const sc = scene(e, sceneIdx);
        if (!el || !el.kind) throw new Error('kind 필수');
        hist(`[${id}] 요소 추가`); sc.elements.push(clone(el)); return sc.elements.length - 1;
      }),
      get: gate(r, 'element', 'canvas', 'get', (i, sceneIdx) => clone(scene(ctx(), sceneIdx).elements[i])),
      update: gate(r, 'element', 'canvas', 'update', (i, patch, sceneIdx) => {
        const sc = scene(ctx(), sceneIdx); if (!sc.elements[i]) throw new Error(`요소 없음: ${i}`);
        hist(`[${id}] 요소 수정`); Object.assign(sc.elements[i], clone(patch)); return true;
      }),
      remove: gate(r, 'element', 'canvas', 'remove', (i, sceneIdx) => {
        const sc = scene(ctx(), sceneIdx); if (!sc.elements[i]) throw new Error(`요소 없음: ${i}`);
        hist(`[${id}] 요소 삭제`); sc.elements.splice(i, 1); return true;
      }),
      transform: gate(r, 'element', 'canvas', 'transform', (i, dx, dy, sceneIdx) => {
        const sc = scene(ctx(), sceneIdx); const el = sc.elements[i]; if (!el) throw new Error(`요소 없음: ${i}`);
        hist(`[${id}] 이동`); el.x = Math.max(0, Math.min(98, (el.x || 0) + dx)); el.y = Math.max(0, Math.min(98, (el.y || 0) + dy)); return true;
      }),
      rotate: gate(r, 'element', 'canvas', 'rotate', (i, deg, sceneIdx) => {
        const sc = scene(ctx(), sceneIdx); const el = sc.elements[i]; if (!el) throw new Error(`요소 없음: ${i}`);
        hist(`[${id}] 회전`); el.rotate = (((el.rotate || 0) + deg) % 360 + 360) % 360; return el.rotate;
      }),
      resize: gate(r, 'element', 'canvas', 'resize', (i, w, h, sceneIdx) => {
        const sc = scene(ctx(), sceneIdx); const el = sc.elements[i]; if (!el) throw new Error(`요소 없음: ${i}`);
        hist(`[${id}] 크기`); if (w != null) el.w = Math.max(1, w); if (h != null && el.h != null) el.h = Math.max(1, h); return true;
      }),
      align: gate(r, 'element', 'canvas', 'align', (indices, how, sceneIdx) => {
        const sc = scene(ctx(), sceneIdx); hist(`[${id}] 정렬`);
        for (const i of indices) { if (!sc.elements[i]) throw new Error(`요소 없음: ${i}`); alignOne(sc.elements[i], sc, how); }
        return true;
      }),
      distribute: gate(r, 'element', 'canvas', 'distribute', (indices, axis, sceneIdx) => {
        const sc = scene(ctx(), sceneIdx);
        if (indices.length < 3) throw new Error('분배는 3개 이상');
        hist(`[${id}] 분배`);
        const els = indices.map((i) => { if (!sc.elements[i]) throw new Error(`요소 없음: ${i}`); return sc.elements[i]; });
        const k = axis === 'v' ? 'y' : 'x';
        const sorted = els.slice().sort((a, b) => (a[k] || 0) - (b[k] || 0));
        const min = sorted[0][k] || 0, max = sorted[sorted.length - 1][k] || 0;
        const step = (max - min) / (sorted.length - 1);
        sorted.forEach((el, i) => { el[k] = Math.round((min + step * i) * 10) / 10; });
        return true;
      }),
    };

    /* ---- Canvas API (§6) — 조회 종합 ---- */
    const canvas = {
      getDoc: gate(r, 'canvas', 'canvas', 'getDoc', () => clone(ctx().doc)),
      getScene: gate(r, 'canvas', 'canvas', 'getScene', () => clone(scene(ctx()))),
      elementsOf: gate(r, 'canvas', 'canvas', 'elementsOf', (kind) => {
        const sc = scene(ctx());
        return sc.elements.map((el, i) => ({ idx: i, ...clone(el) })).filter((el) => !kind || el.kind === kind);
      }),
      size: gate(r, 'canvas', 'canvas', 'size', () => { const sc = scene(ctx()); return { width: sc.width, height: sc.height }; }),
    };

    /* ---- Asset API (§10) — MK_DAM 브리지 ---- */
    const D = () => { if (!window.MK_DAM) throw new Error('DAM 미탑재'); return window.MK_DAM; };
    const asset = {
      upload: gate(r, 'asset', 'asset', 'upload', (props) => D().create({ ...props, meta: { ...(props.meta || {}), via: 'plugin:' + id } })),
      search: gate(r, 'asset', 'asset', 'search', (q) => D().list(q)),
      get: gate(r, 'asset', 'asset', 'get', (aid) => D().get(aid)),
      replace: gate(r, 'asset', 'asset', 'replace', (from, to) => D().replaceEverywhere(from, to)),
      favorite: gate(r, 'asset', 'asset', 'favorite', (aid, on) => D().star(aid, on)),
      metadata: gate(r, 'asset', 'asset', 'metadata', (aid, patch) => patch ? D().update(aid, patch) : (D().get(aid) || {}).meta),
      versions: gate(r, 'asset', 'asset', 'versions', (aid) => D().versions(aid)),
      linkBrand: gate(r, 'asset', 'asset', 'linkBrand', (aid, brandId) => D().linkBrand(aid, brandId)),
      ref: gate(r, 'asset', 'asset', 'ref', (aid) => D().ref(aid)),
    };

    /* ---- Brand API (§11) — 읽기 전용 ---- */
    const B = () => { if (!window.MK_BRAND) throw new Error('Brand 미탑재'); return window.MK_BRAND; };
    const brand = {
      active: gate(r, 'brand', null, 'active', () => clone(B().active() || null)),
      tokens: gate(r, 'brand', null, 'tokens', () => { const b = B().active(); return b ? B().tokens(b) : null; }),
      chartColors: gate(r, 'brand', null, 'chartColors', () => { const b = B().active(); return b ? B().chartColors(b) : null; }),
      logo: gate(r, 'brand', null, 'logo', () => { const b = B().active(); return b ? B().pickLogo(b) : null; }),
      list: gate(r, 'brand', null, 'list', () => B().list().map((b) => ({ id: b.id, name: b.name }))),
    };

    /* ---- AI API (§12) — 규칙 기반(LLM 미연결, 정직 표기) ---- */
    const ai = {
      rewrite: gate(r, 'ai', 'ai', 'rewrite', (text, tone) => {
        const t = String(text).trim();
        if (tone === 'formal') return t.replace(/야$|어$|해$/gm, '합니다').replace(/!/g, '.');
        if (tone === 'short') return t.split(/[.。!]/)[0].trim();
        return '✦ ' + t;
      }),
      translate: gate(r, 'ai', 'ai', 'translate', (text, to) => `[${to || 'en'}] ${text}`),
      summarize: gate(r, 'ai', 'ai', 'summarize', (text) => {
        const lines = String(text).split(/\n+/).filter(Boolean);
        return lines.slice(0, 3).map((l) => '· ' + l.slice(0, 40)).join('\n');
      }),
      generateImage: gate(r, 'ai', 'ai', 'generateImage', (prompt) =>
        D().create({ name: 'AI 이미지 · ' + String(prompt).slice(0, 24), kind: 'image', meta: { prompt, engine: 'stub(미연결)', via: 'plugin:' + id } })),
      generateChart: gate(r, 'ai', 'ai', 'generateChart', (spec) => {
        const A = window.MK_AIED;
        if (A && A.mkChart) return A.mkChart(spec && spec.type, spec && spec.series);
        return { kind: 'chart', chartType: (spec && spec.type) || 'bar', x: 20, y: 25, w: 60, h: 50, series: (spec && spec.series) || [{ k: 'A', v: 3 }, { k: 'B', v: 5 }] };
      }),
      generateLayout: gate(r, 'ai', 'ai', 'generateLayout', (kind) => {
        const L = { title: [{ kind: 'text', x: 10, y: 34, w: 80, size: 9, text: '제목', weight: 700 }, { kind: 'text', x: 10, y: 50, w: 80, size: 4, text: '부제', weight: 400 }],
          split: [{ kind: 'text', x: 6, y: 12, w: 42, size: 6, text: '왼쪽', weight: 700 }, { kind: 'image', x: 52, y: 12, w: 42, h: 70, label: '이미지' }] };
        return clone(L[kind] || L.title);
      }),
      generatePresentation: gate(r, 'ai', 'ai', 'generatePresentation', (topic, n) => {
        const scenes = [];
        for (let i = 0; i < (n || 3); i++) scenes.push({
          id: uid('s'), name: i === 0 ? '표지' : `본문 ${i}`, width: 1280, height: 720, duration: 5, background: '#FFFFFF',
          elements: [{ kind: 'text', x: 8, y: i === 0 ? 36 : 8, w: 84, size: i === 0 ? 9 : 6, text: i === 0 ? String(topic) : `${topic} — ${i}`, weight: 700 }],
        });
        return { templateId: uid('ai-doc'), title: String(topic), contentType: 'presentation', category: '발표자료', style: 'AI', ratio: '16:9', scenes };
      }),
    };

    /* ---- Render API (§13) — MK_RENDER 브리지 ---- */
    const RD = () => { if (!window.MK_RENDER) throw new Error('Render 미탑재'); return window.MK_RENDER; };
    const render = {
      renderScene: gate(r, 'render', 'export', 'renderScene', (sc) => RD().renderScene(sc || scene(ctx()))),
      renderProject: gate(r, 'render', 'export', 'renderProject', (doc) => RD().renderProject(doc || ctx().doc)),
      export: gate(r, 'render', 'export', 'export', (fmt, opts) => {
        const A = RD().ADAPTERS[fmt]; if (!A) throw new Error(`포맷 미지원: ${fmt}`);
        return A(RD().renderProject((opts && opts.doc) || ctx().doc), opts || {});
      }),
      preview: gate(r, 'render', 'export', 'preview', (sc) => RD().toSVG(RD().renderScene(sc || scene(ctx())))),
      thumbnail: gate(r, 'render', 'export', 'thumbnail', (sc) => RD().toSVG(RD().renderScene(sc || scene(ctx())), { scale: 0.125 })),
      formats: gate(r, 'render', null, 'formats', () => Object.keys(RD().ADAPTERS)),
    };

    /* ---- Event (§14) ---- */
    const events = {
      on: gate(r, 'events', null, 'on', (ev, fn) => {
        if (!EVENTS.includes(ev)) throw new Error(`이벤트 미지원: ${ev}`);
        r.subs.push({ ev, fn }); return () => { r.subs = r.subs.filter((s) => s.fn !== fn); };
      }),
      off: gate(r, 'events', null, 'off', (ev, fn) => { r.subs = r.subs.filter((s) => !(s.ev === ev && s.fn === fn)); }),
      list: () => EVENTS.slice(),
    };

    /* ---- Command (§15) ---- */
    const commands = {
      register: gate(r, 'commands', null, 'register', (cmd) => {
        if (!cmd || !cmd.id || !cmd.title || typeof cmd.run !== 'function') throw new Error('command {id,title,run} 필수');
        if (CMDS.has(cmd.id)) throw new Error(`명령 중복: ${cmd.id}`);
        CMDS.set(cmd.id, { ...cmd, plugin: id }); r.commands.add(cmd.id); return true;
      }),
      exec: gate(r, 'commands', null, 'exec', (cid, ...args) => execCommand(cid, ...args)),
    };

    /* ---- Shortcut (§16) ---- */
    const shortcuts = {
      register: gate(r, 'shortcuts', null, 'register', (combo, commandId, priority) => {
        const res = registerShortcut(id, combo, commandId, priority || 0);
        if (res.ok) r.shortcuts.add(res.combo);
        return res;
      }),
    };

    /* ---- Extension Point UI (§5) ---- */
    const ui = {
      add: gate(r, 'ui', null, 'add', (point, item) => {
        if (!EXT_POINTS.includes(point)) throw new Error(`확장 지점 미지원: ${point}`);
        if (!item || !item.id) throw new Error('item.id 필수');
        const c = { point, plugin: id, id: item.id, title: item.title || item.id, icon: item.icon || '🔌',
          render: item.render || null, command: item.command || null };
        r.contribs.push(c); return true;
      }),
      remove: gate(r, 'ui', null, 'remove', (itemId) => { r.contribs = r.contribs.filter((c) => c.id !== itemId); return true; }),
      points: () => EXT_POINTS.slice(),
    };

    /* ---- Storage · Clipboard · Network (권한 게이트 확인용) ---- */
    const storage = {
      get: gate(r, 'storage', 'storage', 'get', (k) => clone(r.storage[k] ?? null)),
      set: gate(r, 'storage', 'storage', 'set', (k, v) => {
        const next = JSON.stringify({ ...r.storage, [k]: v }).length;
        if (next > MEM_LIMIT) throw new Error('메모리 제한 초과');
        r.storage[k] = clone(v); return true;
      }),
      remove: gate(r, 'storage', 'storage', 'remove', (k) => { delete r.storage[k]; return true; }),
      keys: gate(r, 'storage', 'storage', 'keys', () => Object.keys(r.storage)),
      bytes: gate(r, 'storage', 'storage', 'bytes', () => memBytes(r)),
    };
    const clipboard = {
      write: gate(r, 'clipboard', 'clipboard', 'write', (text) => { CLIP.text = String(text); return true; }),
      read: gate(r, 'clipboard', 'clipboard', 'read', () => CLIP.text),
    };
    const network = {
      fetch: gate(r, 'network', 'network', 'fetch', (url) => {
        devLog(r, 'log', `network.fetch 요청 기록: ${url} (playground — 실요청 미발신)`);
        return { queued: true, url: String(url) };
      }),
    };
    const device = {
      camera: gate(r, 'device', 'camera', 'camera', () => { throw new Error('camera 미지원(선언만)'); }),
      microphone: gate(r, 'device', 'microphone', 'microphone', () => { throw new Error('microphone 미지원(선언만)'); }),
    };

    const api = { pluginId: id, version: r.manifest.version,
      canvas, selection, scene: sceneApi, element, asset, brand, ai, render,
      events, commands, shortcuts, ui, storage, clipboard, network, device,
      log: (...a) => devLog(r, 'log', a.join(' ')) };
    for (const k of Object.keys(api)) if (typeof api[k] === 'object') Object.freeze(api[k]);
    return Object.freeze(api);
  }

  /* ================================================================
     8. 이벤트 버스 — 크래시 격리 배포
     ================================================================ */
  const HOST_LISTENERS = [];   /* 호스트(화면)용 */
  function emit(ev, payload) {
    for (const r of REG.values()) {
      if (r.state !== 'running') continue;
      for (const s of r.subs) if (s.ev === ev) safeHook(r, `on(${ev})`, s.fn, payload || {});
    }
    for (const f of HOST_LISTENERS) { try { f(ev, payload || {}); } catch { /* host listener 실패 무시 */ } }
  }

  /* ================================================================
     9. Command · Shortcut 전역 레지스트리
     ================================================================ */
  const CMDS = new Map();      /* id → {id,title,run,plugin} */
  const KEYS = new Map();      /* combo → {plugin, commandId, priority} */
  const CLIP = { text: '' };

  function execCommand(cid, ...args) {
    const c = CMDS.get(cid); if (!c) throw new Error(`명령 없음: ${cid}`);
    const r = REG.get(c.plugin);
    if (r && r.state !== 'running') throw new Error(`플러그인 비활성: ${c.plugin}`);
    return r ? safeHook(r, `command(${cid})`, c.run, ...args) : c.run(...args);
  }
  const normCombo = (s) => String(s).toLowerCase().split('+').map((x) => x.trim()).sort((a, b) => {
    const w = { ctrl: 0, cmd: 0, alt: 1, shift: 2 }; return (w[a] ?? 9) - (w[b] ?? 9);
  }).join('+');
  function registerShortcut(pluginId, combo, commandId, priority) {
    const key = normCombo(combo);
    const cur = KEYS.get(key);
    if (cur && cur.priority >= priority)
      return { ok: false, combo: key, conflict: cur.plugin, msg: `단축키 충돌: ${key} (선점: ${cur.plugin}, 우선순위 ${cur.priority})` };
    KEYS.set(key, { plugin: pluginId, commandId, priority });
    return { ok: true, combo: key, replaced: cur ? cur.plugin : null };
  }
  function pressKey(combo) {
    const k = KEYS.get(normCombo(combo)); if (!k) return null;
    return execCommand(k.commandId);
  }

  /* ================================================================
     10. Lifecycle FSM
     ================================================================ */
  function transition(id, to, reason) {
    const r = rec(id);
    if (!FSM[r.state] || !FSM[r.state].includes(to))
      throw new Error(`전이 불가: ${r.state} → ${to}`);
    const from = r.state; r.state = to;
    devLog(r, 'log', `상태: ${from} → ${to}${reason ? ' · ' + reason : ''}`);
    return to;
  }

  function install(manifest, factory) {
    const v = validateManifest(manifest);
    if (!v.ok) return { ok: false, errors: v.errors };
    if (REG.has(manifest.id)) return { ok: false, errors: [`이미 설치됨: ${manifest.id}`] };
    for (const dep of manifest.dependencies || [])
      if (!REG.has(dep)) return { ok: false, errors: [`의존 플러그인 미설치: ${dep}`] };
    if (typeof factory !== 'function') return { ok: false, errors: ['factory 함수 필수'] };
    REG.set(manifest.id, record(manifest, factory));
    emit('pluginInstalled', { id: manifest.id });
    return { ok: true, id: manifest.id };
  }

  function load(id) { transition(id, 'loaded'); return true; }

  function initialize(id) {
    const r = rec(id); transition(id, 'initialized');
    r.api = makeApi(r);
    const handle = safeHook(r, 'factory', r.factory, r.api);
    if (handle === undefined && r.errors.length && r.errors[r.errors.length - 1].msg.startsWith('factory')) {
      r.state = 'unloaded';                           /* 초기화 실패 → 격리 */
      return { ok: false, errors: [r.errors[r.errors.length - 1].msg] };
    }
    r.handle = handle || {};
    transition(id, 'ready');
    return { ok: true };
  }

  function run(id) { transition(id, 'running'); return true; }
  function suspend(id) { transition(id, 'suspended'); return true; }
  function resume(id) { transition(id, 'running', '재개'); return true; }

  function unload(id) {
    const r = rec(id);
    if (r.handle && typeof r.handle.deactivate === 'function') safeHook(r, 'deactivate', r.handle.deactivate);
    transition(id, 'unloaded');
    /* 구독·명령·단축키·UI 기여 자동 정리 */
    r.subs = [];
    for (const c of r.commands) CMDS.delete(c); r.commands.clear();
    for (const [k, v] of KEYS) if (v.plugin === id) KEYS.delete(k);
    r.shortcuts.clear(); r.contribs = []; r.handle = null; r.api = null;
    return true;
  }

  function start(id) {   /* install 후 편의 체인 */
    const r = rec(id);
    if (r.state === 'installed') load(id);
    if (r.state === 'loaded') { const res = initialize(id); if (!res.ok) return res; }
    if (r.state === 'ready') run(id);
    return { ok: r.state === 'running', state: r.state };
  }

  function remove(id) {
    const r = rec(id);
    if (r.state === 'running' || r.state === 'suspended' || r.state === 'ready' || r.state === 'initialized') unload(id);
    if (r.state === 'loaded') transition(id, 'unloaded') && unloadCleanup(r);
    transition(id, 'removed');
    REG.delete(id);
    emit('pluginRemoved', { id });
    return true;
  }
  const unloadCleanup = () => true;

  /* ---- Auto Update (§20) ---- */
  function update(id, newManifest, newFactory) {
    const r = rec(id);
    const v = validateManifest(newManifest);
    if (!v.ok) return { ok: false, errors: v.errors };
    if (newManifest.id !== id) return { ok: false, errors: ['id 변경 불가'] };
    if (semver(newManifest.version, r.manifest.version) <= 0)
      return { ok: false, errors: [`버전 후퇴: ${r.manifest.version} → ${newManifest.version}`] };
    const wasRunning = r.state === 'running';
    if (r.state !== 'unloaded') unload(id);
    r.prev = { manifest: clone(r.manifest), factory: r.factory };   /* 롤백 지점 */
    r.manifest = clone(newManifest); r.factory = newFactory || r.factory;
    r.granted = new Set(clone(newManifest.permissions || []));
    load(id); const ini = initialize(id); if (!ini.ok) return ini;
    if (wasRunning) run(id);
    devLog(r, 'log', `업데이트: → v${newManifest.version}`);
    return { ok: true, version: newManifest.version };
  }
  function rollback(id) {
    const r = rec(id);
    if (!r.prev) return { ok: false, errors: ['롤백 지점 없음'] };
    const prev = r.prev; r.prev = null;
    const wasRunning = r.state === 'running';
    if (r.state !== 'unloaded') unload(id);
    r.manifest = prev.manifest; r.factory = prev.factory;
    r.granted = new Set(clone(prev.manifest.permissions || []));
    load(id); const ini = initialize(id); if (!ini.ok) return ini;
    if (wasRunning) run(id);
    devLog(r, 'log', `롤백: → v${prev.manifest.version}`);
    return { ok: true, version: prev.manifest.version };
  }

  /* ================================================================
     11. Permission 관리(호스트측)
     ================================================================ */
  const grant = (id, perm) => { if (!PERMS.includes(perm)) throw new Error(`권한 미지원: ${perm}`); rec(id).granted.add(perm); return true; };
  const revoke = (id, perm) => { rec(id).granted.delete(perm); return true; };
  const hasPerm = (id, perm) => rec(id).granted.has(perm);

  /* ================================================================
     12. Marketplace (§19·§25)
     ================================================================ */
  const CATALOG = new Map();   /* storeId → { manifest, factory, readme, license, visibility, audience, reviews[], installs } */
  function publish(item) {
    const v = validateManifest(item.manifest);
    if (!v.ok) return { ok: false, errors: v.errors };
    CATALOG.set(item.manifest.id, {
      manifest: clone(item.manifest), factory: item.factory,
      readme: item.readme || '', license: item.manifest.license || 'MIT',
      visibility: item.visibility || 'public',            /* public | school | company | private */
      audience: item.audience || null,                    /* 비공개 배포 대상 조직 */
      reviews: item.reviews ? clone(item.reviews) : [], installs: item.installs || 0,
    });
    return { ok: true };
  }
  const storeList = (opts) => {
    const org = opts && opts.org;
    return [...CATALOG.values()].filter((it) =>
      it.visibility === 'public' || (org && it.audience && it.audience.includes(org)))
      .map((it) => ({ ...it.manifest, license: it.license, visibility: it.visibility,
        rating: rating(it.manifest.id), reviews: it.reviews.length, installs: it.installs,
        installed: REG.has(it.manifest.id),
        updatable: REG.has(it.manifest.id) && semver(it.manifest.version, REG.get(it.manifest.id).manifest.version) > 0 }));
  };
  function installFromStore(id) {
    const it = CATALOG.get(id); if (!it) return { ok: false, errors: [`스토어에 없음: ${id}`] };
    const res = install(it.manifest, it.factory);
    if (res.ok) { it.installs++; start(id); }
    return res;
  }
  function addReview(id, stars, text) {
    const it = CATALOG.get(id); if (!it) throw new Error(`스토어에 없음: ${id}`);
    it.reviews.push({ stars: Math.max(1, Math.min(5, stars)), text: String(text || '').slice(0, 200), at: now() });
    return rating(id);
  }
  const rating = (id) => {
    const it = CATALOG.get(id); if (!it || !it.reviews.length) return 0;
    return Math.round(it.reviews.reduce((a, r2) => a + r2.stars, 0) / it.reviews.length * 10) / 10;
  };
  function checkUpdates() {
    const out = [];
    for (const [id, r] of REG) {
      const it = CATALOG.get(id);
      if (it && semver(it.manifest.version, r.manifest.version) > 0)
        out.push({ id, from: r.manifest.version, to: it.manifest.version });
    }
    return out;
  }
  function updateFromStore(id) {
    const it = CATALOG.get(id); if (!it) return { ok: false, errors: ['스토어에 없음'] };
    return update(id, it.manifest, it.factory);
  }

  /* ================================================================
     13. Developer SDK (§21·§22)
     ================================================================ */
  const SDK = {
    genManifest: (p) => ({ id: (p && p.id) || 'my-plugin', name: (p && p.name) || 'My Plugin', version: '1.0.0',
      author: (p && p.author) || '개발자', company: (p && p.company) || '', icon: (p && p.icon) || '🔌',
      description: (p && p.description) || '', category: (p && p.category) || 'productivity',
      permissions: (p && p.permissions) || ['canvas'], entry: 'index.js', dependencies: [],
      homepage: '', repository: '', license: 'MIT' }),
    starterTemplate: () => [
      "/* K-MAKER Plugin Starter */",
      "export const manifest = MK_PLUGIN.sdk.genManifest({ id: 'hello-plugin', name: 'Hello', category: 'productivity', permissions: ['canvas'] });",
      "export function factory(api) {",
      "  api.commands.register({ id: 'hello.say', title: '인사 넣기', run: () => {",
      "    api.element.create({ kind: 'text', x: 10, y: 10, w: 60, size: 5, text: '안녕, K-MAKER!', weight: 700 });",
      "  }});",
      "  api.ui.add('topToolbar', { id: 'hello-btn', title: '인사', icon: '👋', command: 'hello.say' });",
      "  return { deactivate() { api.log('bye'); } };",
      "}",
    ].join('\n'),
    /* Test Harness — 임시 설치→전 생명주기→명령 실행→정리, 리포트 반환 */
    runTest: (manifest, factory, testDoc) => {
      const report = { steps: [], ok: true };
      const step = (name, fn) => {
        try { const v = fn(); report.steps.push({ name, ok: true, value: v === undefined ? null : v }); }
        catch (e) { report.ok = false; report.steps.push({ name, ok: false, error: e.message }); }
      };
      const hadDoc = TEST_DOC;
      if (testDoc) TEST_DOC = testDoc;
      const mv = validateManifest(manifest);
      step('manifest 검증', () => { if (!mv.ok) throw new Error(mv.errors.join(', ')); return true; });
      if (mv.ok) {
        if (REG.has(manifest.id)) remove(manifest.id);
        step('install', () => { const r2 = install(manifest, factory); if (!r2.ok) throw new Error(r2.errors.join(',')); });
        step('start(load→init→run)', () => { const r2 = start(manifest.id); if (!r2.ok) throw new Error('state=' + r2.state); });
        step('명령 등록 확인', () => [...CMDS.values()].filter((c) => c.plugin === manifest.id).length);
        step('suspend/resume', () => { suspend(manifest.id); resume(manifest.id); return true; });
        step('unload 정리', () => { unload(manifest.id); return CMDS.size; });
        step('remove', () => { transition(manifest.id, 'removed'); REG.delete(manifest.id); return true; });
      }
      TEST_DOC = hadDoc;
      return report;
    },
  };

  const consoleOf = (id) => {
    const r = rec(id);
    return { id, state: r.state, version: r.manifest.version,
      logs: r.logs.slice(-50), errors: r.errors.slice(-30),
      perf: { ...r.perf, avgMs: r.perf.calls ? Math.round(r.perf.totalMs / r.perf.calls * 100) / 100 : 0 },
      apiCalls: { ...r.apiCalls }, memoryBytes: memBytes(r), crash: r.crash,
      permissions: [...r.granted], contribs: r.contribs.length,
      commands: [...r.commands], shortcuts: [...r.shortcuts] };
  };

  /* ================================================================
     14. 호스트 헬퍼 — 화면이 소비하는 조회
     ================================================================ */
  const listInstalled = () => [...REG.values()].map((r) => ({
    ...clone(r.manifest), state: r.state, crash: r.crash,
    permissions: [...r.granted], contribs: r.contribs.length,
    hasRollback: !!r.prev, memoryBytes: memBytes(r) }));
  const contributions = (point) => {
    const out = [];
    for (const r of REG.values()) {
      if (r.state !== 'running') continue;
      for (const c of r.contribs) if (!point || c.point === point) out.push({ ...c });
    }
    return out;
  };
  const commandList = () => [...CMDS.values()].map((c) => ({ id: c.id, title: c.title, plugin: c.plugin }));
  const shortcutList = () => [...KEYS.entries()].map(([combo, v]) => ({ combo, ...v }));

  return {
    /* 상수 */
    CATEGORIES, PERMS, EXT_POINTS, EVENTS, STATES, FSM, CRASH_LIMIT, MEM_LIMIT, SCHEMA,
    /* Manifest */
    validateManifest, semver,
    /* Lifecycle */
    install, load, initialize, run, suspend, resume, unload, start, remove, update, rollback, transition,
    stateOf: (id) => rec(id).state,
    /* Permission */
    grant, revoke, hasPerm,
    /* Event */
    emit, onHost: (f) => HOST_LISTENERS.push(f),
    /* Command · Shortcut */
    execCommand, pressKey, commandList, shortcutList,
    /* Marketplace */
    publish, storeList, installFromStore, addReview, rating, checkUpdates, updateFromStore,
    /* SDK · Console */
    sdk: SDK, console: consoleOf,
    /* 호스트 조회 */
    listInstalled, contributions,
    /* 테스트 바인딩 */
    _bindDoc: (doc) => { TEST_DOC = doc ? { doc, sceneIdx: 0, selEl: null } : null; },
    _reg: REG,
  };
})();
