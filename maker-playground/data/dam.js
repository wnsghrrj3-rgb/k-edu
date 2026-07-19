/* ============================================================
   K-MAKER Universal Asset Platform (DAM) — window.MK_DAM  (Round 15)
   ------------------------------------------------------------
   Asset은 더 이상 "파일"이 아니라 Entity다.
     Asset = Metadata + Version + Variant + Brand + Usage
             + Permission + AI + Storage(Reference)

   ★ 핵심 설계
     - 기존 window.MK_ASSETS(placeholder 목록)는 그대로 두고,
       그 목록을 시드로 승격(upgrade)해 Entity 레이어를 얹는다.
       → 기존 소비처(templates·workspace·projects·ai) 무수정 호환.
     - 콘텐츠는 blob(해시 dedup) 하나, 나머지는 전부 Reference.
       교체·검색·통계는 항상 Reference를 기준으로 수행한다.
     - 검색은 토큰 역색인(inverted index) — 10만 개 스케일 검증용.
     - AI(자동 태그·검색·유사)는 결정론 시뮬레이션. 실 모델 호출 없음.
   ============================================================ */
window.MK_DAM = (() => {

  /* ================= 0. 공통 유틸 ================= */
  const now = () => (window.performance ? Math.round(performance.now()) : Date.now());
  let clock = 1700000000; /* 결정론 타임스탬프 축 */
  const tick = () => ++clock;
  const deep = (o) => JSON.parse(JSON.stringify(o));

  /* FNV-1a — blob dedup·버전 중복 판정용 콘텐츠 해시 */
  function hash(s) {
    let h = 0x811c9dc5;
    s = String(s);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  /* ================= 1. Asset 종류 (§2) ================= */
  const KINDS = [
    'image', 'svg', 'icon', 'illustration', 'photo', 'video', 'audio', 'gif',
    'lottie', 'glb', 'pdf', 'spreadsheet', 'chart-template', 'color-palette',
    'gradient', 'texture', 'pattern', 'brush', 'sticker', 'shape', 'font',
    'animation-preset', 'mockup', 'template-snippet', 'section-block',
  ];
  /* 기존 category → kind 매핑 (시드 승격용) */
  const CAT2KIND = {
    templates: 'template-snippet', images: 'photo', videos: 'video', icons: 'icon',
    shapes: 'shape', stickers: 'sticker', illustrations: 'illustration',
    backgrounds: 'texture', audio: 'audio', uploads: 'image', brand: 'svg',
  };

  const SCOPES = ['private', 'workspace', 'organization', 'public', 'marketplace'];

  /* ================= 2. 저장소 (Storage) ================= */
  const STORE = {
    entities: new Map(),       /* id → entity */
    blobs: new Map(),          /* contentHash → { blobId, bytes, refs:Set(assetId) } */
    versions: new Map(),       /* assetId → [ {verId, name, at, by, snap, contentHash} ] */
    variants: new Map(),       /* assetId → [ {key, label, format, meta} ] */
    crops: new Map(),          /* assetId → { aspect → {x,y,w,h, sceneIds:[]} } */
    usage: [],                 /* { assetId, projectId?, templateId?, brandId?, sceneId?, elementId?, workspaceId?, at } */
    favs: new Set(), pins: new Set(), recents: [],
    folders: [],               /* { folderId, name, parent, assetIds:Set } */
    collections: [],           /* smart: { colId, name, rule } */
    scopes: new Map(),         /* assetId → scope */
    events: [],                /* 변경 이벤트 로그(테스트·Analytics 겸용) */
  };
  const CACHE = { thumb: new Map(), preview: new Map(), hit: 0, miss: 0 };

  function ingest(content) {
    const h = hash(content);
    if (!STORE.blobs.has(h)) STORE.blobs.set(h, { blobId: 'bl-' + h, bytes: String(content).length, refs: new Set() });
    return STORE.blobs.get(h);
  }
  const storageStats = () => ({
    blobs: STORE.blobs.size,
    assets: STORE.entities.size,
    dedupSaved: [...STORE.blobs.values()].reduce((s, b) => s + Math.max(0, b.refs.size - 1) * b.bytes, 0),
    cache: { hit: CACHE.hit, miss: CACHE.miss, thumbs: CACHE.thumb.size },
  });

  /* 썸네일/프리뷰 캐시 — 실파일 없음: 톤 기반 표시 정보를 캐시 */
  function thumb(id) {
    if (CACHE.thumb.has(id)) { CACHE.hit++; return CACHE.thumb.get(id); }
    CACHE.miss++;
    const e = get(id); if (!e) return null;
    const t = { id, tone: e.tone, kind: e.kind, label: e.name.slice(0, 14), dominant: e.colors.dominant };
    CACHE.thumb.set(id, t);
    return t;
  }

  /* 청크 업로드 시뮬레이션 — Background Upload 큐 */
  const UPQ = [];
  function enqueueUpload(name, kind, sizeBytes, meta = {}) {
    const chunks = Math.max(1, Math.ceil(sizeBytes / 262144));
    const job = { jobId: 'up-' + (UPQ.length + 1), name, kind, sizeBytes, chunks, done: 0, state: 'queued', meta };
    UPQ.push(job); return job;
  }
  function stepUploads(n = 1) {
    const out = [];
    for (const j of UPQ) {
      if (j.state === 'complete') continue;
      j.state = 'uploading';
      j.done = Math.min(j.chunks, j.done + n);
      if (j.done === j.chunks) {
        j.state = 'complete';
        const e = create({ name: j.name, kind: j.kind, tags: j.meta.tags || [], tone: j.meta.tone || 'slate' }, j.name + ':' + j.sizeBytes);
        j.assetId = e.id; out.push(e);
      }
    }
    return { jobs: UPQ.map((j) => ({ ...j })), created: out };
  }

  /* ================= 3. AI Auto Tag (§11) — 결정론 ================= */
  const DICT = {
    objects: [[/칠판|교실|책상/, '교실 집기'], [/하늘|구름|운동장/, '하늘'], [/색연필|문구|미술/, '문구'], [/학생|아이|어린이/, '사람'], [/로고|워드마크/, '로고'], [/실험|비커|과학/, '실험 도구'], [/책|도서/, '책'], [/꽃|식물|잎/, '식물']],
    scene: [[/교실|칠판|수업/, 'classroom'], [/야외|운동장|하늘/, 'outdoor'], [/회의|미팅/, 'meeting'], [/실험|과학/, 'lab'], [/무대|학예회/, 'stage']],
    style: [[/미니멀|minimal/i, 'Minimal'], [/프리미엄|luxury|고급/i, 'Luxury'], [/소프트|파스텔/, 'Soft'], [/모던/, 'Modern'], [/크리에이티브/, 'Creative'], [/사이언스|과학/, 'Science']],
    emotion: [[/웃|기쁨|축하|학예회/, 'joyful'], [/차분|미니멀|안내/, 'calm'], [/활기|운동|플레이/, 'energetic']],
  };
  const TONE_COLORWORDS = {
    slate: ['회색', 'gray', '차분'], coral: ['코랄', '주황', 'warm'], teal: ['청록', '푸른', 'blue', 'green'],
    cream: ['크림', '베이지', '화이트', 'white'], indigo: ['남색', '푸른', 'blue', '인디고'], plum: ['보라', 'purple'],
  };
  function autoTag(e) {
    const hay = e.name + ' ' + e.tags.join(' ') + ' ' + (e.meta ? JSON.stringify(e.meta) : '');
    const pick = (rules) => rules.filter(([re]) => re.test(hay)).map(([, v]) => v);
    const objects = pick(DICT.objects);
    const scene = pick(DICT.scene)[0] || 'general';
    const style = pick(DICT.style)[0] || 'Neutral';
    const emotion = pick(DICT.emotion)[0] || 'neutral';
    const ocr = /카드|안내|포스터|썸네일|학습지/.test(hay) ? [e.name] : [];        /* 텍스트성 자산만 OCR 결과 존재 */
    const faces = /학생|아이|사람|선생님/.test(hay) ? 1 : 0;
    const colorWords = TONE_COLORWORDS[e.tone] || [];
    const category = e.kind === 'photo' || e.kind === 'image' ? 'photo' : e.kind;
    const STYLE_KO = { Minimal: '미니멀', Luxury: '고급', Soft: '소프트', Modern: '모던', Creative: '크리에이티브', Science: '사이언스' };
    const keywords = [...new Set([...e.tags, ...objects, scene, style, ...(STYLE_KO[style] ? [STYLE_KO[style]] : [])])];
    const caption = `${style !== 'Neutral' ? style + ' 스타일 ' : ''}${scene === 'classroom' ? '교실 ' : scene === 'outdoor' ? '야외 ' : ''}${e.name}`;
    return { objects, scene, ocr, faces, colorWords, style, emotion, category, keywords, caption };
  }

  /* ================= 4. Entity ================= */
  let seq = 0;
  function blank(meta = {}) {
    return {
      id: meta.id || 'dm-' + String(++seq).padStart(4, '0'),
      kind: KINDS.includes(meta.kind) ? meta.kind : 'image',
      name: meta.name || '이름 없는 자산',
      desc: meta.desc || '',
      category: meta.category || '', sub: meta.sub || '',
      creator: meta.creator || 'me', ownerId: meta.ownerId || 'me',
      workspaceId: meta.workspaceId || (window.MK_TEAM ? window.MK_TEAM.ws().wsId : 'ws-design'),
      created: tick(), updated: clock,
      resolution: meta.resolution || '', aspect: meta.aspect || meta.ratio || '1/1',
      language: meta.language || 'ko',
      tags: meta.tags || [], keywords: [], license: meta.license || 'internal',
      brandId: meta.brandId || null,
      tone: meta.tone || 'slate',
      colors: meta.colors || null,
      meta: meta.meta || {},
      ai: null, storage: null,
    };
  }
  function finalize(e, content) {
    const tones = (window.MK_ASSETS && window.MK_ASSETS.TONES[e.tone]) || ['#E7EAEF', '#5B6472'];
    if (!e.colors) e.colors = { dominant: tones[0], palette: [tones[0], tones[1]] };
    e.ai = autoTag(e);
    e.keywords = e.ai.keywords;
    const blob = ingest(content != null ? content : e.id + ':' + e.name);
    blob.refs.add(e.id);
    e.storage = { blobId: blob.blobId, contentHash: blob.blobId.slice(3), bytes: blob.bytes, dedup: blob.refs.size > 1 };
    return e;
  }

  function create(meta, content) {
    const e = finalize(blank(meta), content);
    STORE.entities.set(e.id, e);
    STORE.scopes.set(e.id, meta && meta.scope && SCOPES.includes(meta.scope) ? meta.scope : 'workspace');
    STORE.versions.set(e.id, [snapOf(e, 'v1 · 최초 등록', 'me')]);
    index(e);
    log('asset.create', e.id);
    return e;
  }
  const get = (id) => STORE.entities.get(id) || null;
  const list = () => [...STORE.entities.values()];

  function update(actor, id, patch) {
    const e = get(id); if (!e) return { ok: false, why: '없음' };
    const p = canDo(actor, id, 'edit'); if (!p.ok) return p;
    const before = hash(JSON.stringify([e.name, e.desc, e.tags, e.tone, e.brandId, e.meta]));
    Object.assign(e, deep(patch)); e.updated = tick();
    e.ai = autoTag(e); e.keywords = e.ai.keywords;
    reindex(e);
    const after = hash(JSON.stringify([e.name, e.desc, e.tags, e.tone, e.brandId, e.meta]));
    let ver = null;
    if (before !== after) { ver = snapOf(e, 'v' + (STORE.versions.get(id).length + 1) + ' · 수정', actor); STORE.versions.get(id).push(ver); }
    log('asset.update', id);
    return { ok: true, entity: e, version: ver, skipped: before === after };
  }

  function remove(actor, id) {
    const p = canDo(actor, id, 'delete'); if (!p.ok) return p;
    const uses = usedBy(id);
    if (uses.total > 0) return { ok: false, why: `사용 중 (${uses.total}곳) — Replace Everywhere로 교체 후 삭제`, uses };
    const e = get(id);
    const blob = [...STORE.blobs.values()].find((b) => b.blobId === e.storage.blobId);
    if (blob) blob.refs.delete(id);
    STORE.entities.delete(id); unindex(id);
    log('asset.remove', id);
    return { ok: true };
  }

  function duplicate(actor, id) {
    const e = get(id); if (!e) return { ok: false, why: '없음' };
    const c = create({ ...deep(e), id: undefined, name: e.name + ' (복제)' }, 'dup:' + e.storage.contentHash);
    return { ok: true, entity: c };
  }

  /* ================= 5. Version (§4) ================= */
  const snapOf = (e, name, by) => ({
    verId: 'v-' + e.id + '-' + (STORE.versions.get(e.id)?.length + 1 || 1),
    name, at: tick(), by,
    contentHash: hash(JSON.stringify([e.name, e.desc, e.tags, e.tone, e.brandId, e.meta])),
    snap: deep({ name: e.name, desc: e.desc, tags: e.tags, tone: e.tone, brandId: e.brandId, meta: e.meta }),
  });
  const versions = (id) => (STORE.versions.get(id) || []).slice();
  function restoreVersion(actor, id, verId) {
    const p = canDo(actor, id, 'edit'); if (!p.ok) return p;
    const v = versions(id).find((x) => x.verId === verId); if (!v) return { ok: false, why: '버전 없음' };
    const e = get(id); Object.assign(e, deep(v.snap)); e.updated = tick(); e.ai = autoTag(e); reindex(e);
    STORE.versions.get(id).push(snapOf(e, `"${v.name}" 복원`, actor));
    return { ok: true, entity: e };
  }
  function compareVersions(id, aId, bId) {
    const vs = versions(id);
    const a = vs.find((v) => v.verId === aId), b = vs.find((v) => v.verId === bId);
    if (!a || !b) return { ok: false, why: '버전 없음' };
    const fields = ['name', 'desc', 'tags', 'tone', 'brandId'];
    const diff = fields.filter((f) => JSON.stringify(a.snap[f]) !== JSON.stringify(b.snap[f]))
      .map((f) => ({ field: f, from: a.snap[f], to: b.snap[f] }));
    return { ok: true, same: diff.length === 0, diff };
  }

  /* ================= 6. Variants (§5) ================= */
  function addVariant(id, key, label, meta = {}) {
    if (!get(id)) return { ok: false, why: '없음' };
    if (!STORE.variants.has(id)) STORE.variants.set(id, []);
    const vs = STORE.variants.get(id);
    if (vs.some((v) => v.key === key)) return { ok: false, why: '중복 variant' };
    const v = { key, label: label || key, format: meta.format || 'png', meta };
    vs.push(v); return { ok: true, variant: v };
  }
  const variants = (id) => (STORE.variants.get(id) || []).slice();

  /* ================= 7. Folder (§7) & Smart Collection (§6) ================= */
  function addFolder(name, parent = null) {
    const f = { folderId: 'fd-' + (STORE.folders.length + 1), name, parent, assetIds: new Set() };
    STORE.folders.push(f); return f;
  }
  const folderList = () => STORE.folders.map((f) => ({ ...f, count: f.assetIds.size, assetIds: [...f.assetIds] }));
  function moveToFolder(id, folderId) {
    if (!get(id)) return { ok: false, why: '자산 없음' };
    STORE.folders.forEach((f) => f.assetIds.delete(id));
    const f = STORE.folders.find((x) => x.folderId === folderId);
    if (!f) return { ok: true, folder: null }; /* folderId null → 폴더 해제 */
    f.assetIds.add(id); return { ok: true, folder: f.name };
  }
  const folderOf = (id) => STORE.folders.find((f) => f.assetIds.has(id)) || null;

  /* Smart Collection — 폴더가 아니라 "조건" */
  function addCollection(name, rule) {
    const c = { colId: 'sc-' + (STORE.collections.length + 1), name, rule };
    STORE.collections.push(c); return c;
  }
  const collections = () => STORE.collections.slice();
  function evalRule(rule, pool) {
    let l = pool || list();
    if (rule.brand) l = l.filter((e) => e.brandId === rule.brand);
    if (rule.kind) l = l.filter((e) => e.kind === rule.kind || (rule.kind === 'image' && ['photo', 'image'].includes(e.kind)));
    if (rule.tone) l = l.filter((e) => e.tone === rule.tone);
    if (rule.colorWord) l = l.filter((e) => e.ai.colorWords.includes(rule.colorWord));
    if (rule.tag) l = l.filter((e) => e.tags.includes(rule.tag) || e.keywords.includes(rule.tag));
    if (rule.workspace) l = l.filter((e) => e.workspaceId === rule.workspace);
    if (rule.recent) l = recents().map(get).filter(Boolean).filter((e) => l.includes(e));
    if (rule.frequent) l = l.map((e) => [e, stats(e.id).count]).filter(([, c]) => c >= (rule.frequent === true ? 2 : rule.frequent)).sort((a, b) => b[1] - a[1]).map(([e]) => e);
    return l;
  }
  const evalCollection = (colId) => { const c = STORE.collections.find((x) => x.colId === colId); return c ? evalRule(c.rule) : []; };

  /* ================= 8. Brand 연동 (§8) ================= */
  function linkBrand(id, brandId) {
    const e = get(id); if (!e) return { ok: false, why: '없음' };
    e.brandId = brandId; e.updated = tick(); reindex(e); return { ok: true };
  }
  const brandAssets = (brandId) => list().filter((e) => e.brandId === brandId);
  /* 브랜드 변경 → 자동 추천: 새 브랜드에 연결된 같은 kind 자산을 교체 후보로 */
  function brandChangeRecommend(fromBrandId, toBrandId) {
    const from = brandAssets(fromBrandId), to = brandAssets(toBrandId);
    return from.map((f) => {
      const cand = to.filter((t) => t.kind === f.kind)
        .sort((a, b) => simScore(f, b) - simScore(f, a))[0] || null;
      return { fromId: f.id, fromName: f.name, toId: cand?.id || null, toName: cand?.name || null, kind: f.kind };
    });
  }

  /* ================= 9. Reference & Usage (§9·§14·§16) ================= */
  const ref = (id) => ({ $asset: id });
  const isRef = (v) => !!(v && typeof v === 'object' && v.$asset);
  const resolve = (v) => (isRef(v) ? get(v.$asset) : null);

  function registerUse(assetId, ctx = {}) {
    if (!get(assetId)) return { ok: false, why: '자산 없음' };
    STORE.usage.push({ assetId, ...ctx, at: tick() });
    touchRecent(assetId);
    return { ok: true };
  }
  function usedBy(assetId) {
    const u = STORE.usage.filter((x) => x.assetId === assetId);
    const uniq = (k) => [...new Set(u.map((x) => x[k]).filter(Boolean))];
    return {
      total: u.length,
      projects: uniq('projectId'), templates: uniq('templateId'), brands: uniq('brandId'),
      scenes: uniq('sceneId'), elements: uniq('elementId'), workspaces: uniq('workspaceId'),
    };
  }

  /* Replace Everywhere — Reference 기준 전면 교체.
     targets 미지정 = 전체. { projects:[], templates:[], brands:[] }로 선택 교체. */
  function replaceEverywhere(actor, oldId, newId, targets = null) {
    if (!get(oldId) || !get(newId)) return { ok: false, why: '자산 없음' };
    const p = canDo(actor, oldId, 'edit'); if (!p.ok) return p;
    const report = { usage: 0, templates: [], projects: [], brands: [], skipped: [] };
    const allow = (kind, kId) => !targets || (targets[kind] || []).includes(kId);

    /* 1) usage 레코드 교체 */
    STORE.usage.forEach((u) => {
      if (u.assetId !== oldId) return;
      const kId = u.templateId || u.projectId || u.brandId;
      const kind = u.templateId ? 'templates' : u.projectId ? 'projects' : 'brands';
      if (allow(kind, kId)) { u.assetId = newId; report.usage++; }
      else report.skipped.push({ kind, id: kId });
    });

    /* 2) 템플릿의 assetIds Reference 교체 — MK_TPL.setAssetIds 경유 */
    if (window.MK_TPL && window.MK_TPL.setAssetIds) {
      window.MK_TPL.list().forEach((t) => {
        if ((t.assetIds || []).includes(oldId) && allow('templates', t.templateId)) {
          window.MK_TPL.setAssetIds(t.templateId, t.assetIds.map((x) => (x === oldId ? newId : x)));
          report.templates.push(t.templateId);
        }
      });
    }
    /* 3) 프로젝트 doc engine.assetIds 교체 */
    if (window.MK_PROJ) {
      (window.MK_PROJ.list ? window.MK_PROJ.list('recent') : []).forEach((pr) => {
        const ids = pr.doc && pr.doc.engine && pr.doc.engine.assetIds;
        if (ids && ids.includes(oldId) && allow('projects', pr.projectId)) {
          pr.doc.engine.assetIds = ids.map((x) => (x === oldId ? newId : x));
          report.projects.push(pr.projectId);
        }
      });
    }
    /* 4) doc 내부 element 단위 ref({$asset}) 교체 */
    const walkDoc = (doc) => {
      let n = 0;
      (doc.scenes || []).forEach((s) => (s.elements || []).forEach((el) => {
        if (isRef(el.asset) && el.asset.$asset === oldId) { el.asset = ref(newId); n++; }
      }));
      return n;
    };
    if (window.MK_PROJ) (window.MK_PROJ.list ? window.MK_PROJ.list('recent') : []).forEach((pr) => {
      if (pr.doc && allow('projects', pr.projectId)) walkDoc(pr.doc);
    });

    registerUse(newId, {}); log('asset.replaceEverywhere', oldId + '→' + newId);
    return { ok: true, report };
  }

  /* ================= 10. Crop Memory (§15) ================= */
  function saveCrop(id, aspect, rect, sceneId) {
    if (!get(id)) return { ok: false, why: '없음' };
    if (!STORE.crops.has(id)) STORE.crops.set(id, {});
    const m = STORE.crops.get(id);
    if (!m[aspect]) m[aspect] = { ...rect, sceneIds: [] };
    else Object.assign(m[aspect], rect);
    if (sceneId && !m[aspect].sceneIds.includes(sceneId)) m[aspect].sceneIds.push(sceneId);
    return { ok: true, crop: m[aspect] };
  }
  const cropFor = (id, aspect) => (STORE.crops.get(id) || {})[aspect] || null;
  const cropMap = (id) => STORE.crops.get(id) || {};

  /* ================= 11. Analytics (§16) ================= */
  function stats(id) {
    const u = STORE.usage.filter((x) => x.assetId === id);
    const by = (k) => u.reduce((m, x) => { if (x[k]) m[x[k]] = (m[x[k]] || 0) + 1; return m; }, {});
    return {
      count: u.length,
      last: u.length ? u[u.length - 1].at : null,
      byWorkspace: by('workspaceId'), byProject: by('projectId'),
      byTemplate: by('templateId'), byBrand: by('brandId'),
    };
  }

  /* ================= 12. Permission (§17) ================= */
  function setScope(actor, id, scope) {
    if (!SCOPES.includes(scope)) return { ok: false, why: '알 수 없는 범위' };
    const p = canDo(actor, id, 'manage'); if (!p.ok) return p;
    STORE.scopes.set(id, scope); return { ok: true, scope };
  }
  const scopeOf = (id) => STORE.scopes.get(id) || 'workspace';
  /* MK_TEAM이 있으면 역할 판정 위임, 없으면 소유자 판정만 */
  function canDo(actor, id, action) {
    const e = get(id); if (!e) return { ok: false, why: '자산 없음' };
    const sc = scopeOf(id);
    if (action === 'view') {
      if (['public', 'marketplace', 'organization'].includes(sc)) return { ok: true };
      if (sc === 'private' && e.ownerId !== actor) return { ok: false, why: 'Private 자산' };
      return { ok: true };
    }
    if (e.ownerId === actor) return { ok: true };
    if (sc === 'private') return { ok: false, why: 'Private — 소유자만' };
    if (window.MK_TEAM && window.MK_TEAM.member && window.MK_TEAM.member(actor)) {
      const perm = action === 'delete' || action === 'manage' ? 'asset.register' : 'asset.register';
      const okT = window.MK_TEAM.can(actor, perm, { workspace: e.workspaceId });
      return okT ? { ok: true } : { ok: false, why: '워크스페이스 권한 없음' };
    }
    return { ok: true }; /* 팀 시스템 밖 액터 — 데모 한정 허용 */
  }

  /* ================= 13. Favorites (§18) ================= */
  const star = (id) => { STORE.favs.has(id) ? STORE.favs.delete(id) : STORE.favs.add(id); return STORE.favs.has(id); };
  const isStar = (id) => STORE.favs.has(id);
  const pin = (id) => { STORE.pins.has(id) ? STORE.pins.delete(id) : STORE.pins.add(id); return STORE.pins.has(id); };
  const isPin = (id) => STORE.pins.has(id);
  const touchRecent = (id) => { STORE.recents = [id, ...STORE.recents.filter((x) => x !== id)].slice(0, 20); };
  const recents = () => STORE.recents.slice();
  const favorites = () => list().filter((e) => STORE.favs.has(e.id));

  /* ================= 14. 검색 (§12·§24) — 역색인 ================= */
  const IDX = new Map(); /* token → Set(assetId) */
  const tokenize = (s) => String(s).toLowerCase().split(/[\s,·/()\[\]{}"'+&|—-]+/).filter((t) => t.length >= 1);
  function tokensOf(e) {
    return new Set([
      ...tokenize(e.name), ...e.tags.flatMap(tokenize), ...e.keywords.flatMap(tokenize),
      ...tokenize(e.ai.caption), ...e.ai.ocr.flatMap(tokenize), ...e.ai.colorWords.flatMap(tokenize),
      ...tokenize(e.ai.style), ...tokenize(e.ai.scene), e.kind, e.tone,
      ...(e.brandId ? [e.brandId] : []), e.creator,
    ]);
  }
  function index(e) { for (const t of tokensOf(e)) { if (!IDX.has(t)) IDX.set(t, new Set()); IDX.get(t).add(e.id); } }
  function unindex(id) { for (const s of IDX.values()) s.delete(id); }
  function reindex(e) { unindex(e.id); index(e); }

  function search(q, filters = {}, pool = null) {
    const t0 = now();
    let ids = null;
    const toks = tokenize(q || '').filter(Boolean);
    if (toks.length) {
      for (const t of toks) {
        /* prefix 매칭 — 역색인 키 스캔 (토큰 짧을수록 넓게) */
        const hit = new Set();
        for (const [k, s] of IDX) if (k.includes(t)) for (const id of s) hit.add(id);
        ids = ids ? new Set([...ids].filter((x) => hit.has(x))) : hit;
        if (!ids.size) break;
      }
    }
    let l = ids ? [...ids].map(get).filter(Boolean) : (pool || list());
    if (pool && ids) l = l.filter((e) => pool.includes(e));
    /* 필터 (§24·§25) */
    if (filters.kind) l = l.filter((e) => e.kind === filters.kind);
    if (filters.tone) l = l.filter((e) => e.tone === filters.tone);
    if (filters.orientation) l = l.filter((e) => {
      const [w, h] = e.aspect.split('/').map(Number);
      return filters.orientation === 'landscape' ? w > h : filters.orientation === 'portrait' ? h > w : w === h;
    });
    if (filters.brand) l = l.filter((e) => e.brandId === filters.brand);
    if (filters.creator) l = l.filter((e) => e.creator === filters.creator);
    if (filters.tag) l = l.filter((e) => e.tags.includes(filters.tag));
    if (filters.after) l = l.filter((e) => e.created >= filters.after);
    return { items: l, ms: now() - t0, total: l.length };
  }

  /* Lazy Loading — 커서 페이지네이션 (§21) */
  function page(items, cursor = 0, size = 40) {
    return { items: items.slice(cursor, cursor + size), next: cursor + size < items.length ? cursor + size : null, total: items.length };
  }

  /* ================= 15. AI Similar (§13) ================= */
  function simScore(a, b) {
    if (a.id === b.id) return -1;
    let s = 0;
    if (a.kind === b.kind) s += 3;
    if (a.tone === b.tone) s += 2;
    if (a.brandId && a.brandId === b.brandId) s += 2;
    if (a.ai.scene === b.ai.scene) s += 1.5;
    if (a.ai.style === b.ai.style) s += 1;
    s += a.tags.filter((t) => b.tags.includes(t)).length * 1.5;
    s += a.keywords.filter((k) => b.keywords.includes(k)).length * 0.5;
    return s;
  }
  const similar = (id, n = 6) => {
    const e = get(id); if (!e) return [];
    return list().map((x) => [x, simScore(e, x)]).filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1]).slice(0, n).map(([x, s]) => ({ entity: x, score: Math.round(s * 10) / 10 }));
  };

  /* ================= 16. Cloud Connector (§22) — 구조만 ================= */
  const CLOUD = [
    { key: 'gdrive', name: 'Google Drive', auth: 'oauth2', ops: ['list', 'import', 'export'] },
    { key: 'dropbox', name: 'Dropbox', auth: 'oauth2', ops: ['list', 'import'] },
    { key: 'onedrive', name: 'OneDrive', auth: 'oauth2', ops: ['list', 'import'] },
    { key: 's3', name: 'Amazon S3', auth: 'accesskey', ops: ['list', 'import', 'export', 'sync'] },
    { key: 'supabase', name: 'Supabase Storage', auth: 'servicekey', ops: ['list', 'import', 'export', 'sync'] },
  ];
  function cloudPlan(key) {
    const c = CLOUD.find((x) => x.key === key); if (!c) return null;
    return {
      connector: c.key, state: 'staged', /* 실 연동은 추후 단계 — 설계만 */
      request: { auth: c.auth, endpoint: `/api/cloud/${c.key}/connect`, scopes: c.ops },
      importShape: { file: { name: '', bytes: 0, mime: '' }, target: { workspaceId: '', folderId: null, brandId: null } },
      response: { assetId: 'dm-XXXX', blobId: 'bl-XXXXXXXX', dedup: false },
    };
  }

  /* ================= 17. 대량 스케일 (§28) ================= */
  const BULK = { items: [], idx: new Map() };
  function makeBulk(n = 100000) {
    const t0 = now();
    BULK.items = new Array(n); BULK.idx.clear();
    const TONES = ['slate', 'coral', 'teal', 'cream', 'indigo', 'plum'];
    const WORDS = ['하늘', '학생', '교실', '실험', '회의', '화이트', '과학', '미니멀', 'luxury', '포스터', '로고', '카드', '배경', '아이콘', '차트'];
    for (let i = 0; i < n; i++) {
      const w1 = WORDS[i % WORDS.length], w2 = WORDS[(i * 7 + 3) % WORDS.length];
      const it = { id: 'bk-' + i, name: w1 + ' ' + w2 + ' ' + i, kind: KINDS[i % KINDS.length], tone: TONES[i % 6] };
      BULK.items[i] = it;
      for (const t of [w1.toLowerCase(), w2.toLowerCase(), it.kind, it.tone]) {
        if (!BULK.idx.has(t)) BULK.idx.set(t, []);
        BULK.idx.get(t).push(i);
      }
    }
    return { n, buildMs: now() - t0 };
  }
  function bulkSearch(q) {
    const t0 = now();
    const toks = tokenize(q);
    let hit = null;
    for (const t of toks) {
      const arr = BULK.idx.get(t) || [];
      const s = new Set(arr);
      hit = hit ? [...hit].filter((i) => s.has(i)) : arr.slice();
      if (hit instanceof Array === false) hit = [...hit];
    }
    const items = (hit || []).slice(0, 100).map((i) => BULK.items[i]);
    return { total: hit ? hit.length : 0, items, ms: now() - t0 };
  }

  /* ================= 18. 이벤트 로그 ================= */
  const log = (type, ref2) => STORE.events.push({ type, ref: ref2, at: tick() });

  /* ================= 19. 시드 — MK_ASSETS 승격 + 데모 구성 ================= */
  function seed() {
    if (seed._done || !window.MK_ASSETS) return; seed._done = true;
    /* 기존 placeholder 목록 → Entity 승격 (id 유지 → 기존 소비처 호환) */
    for (const a of window.MK_ASSETS.ASSETS) {
      create({
        id: a.id, kind: CAT2KIND[a.category] || 'image', name: a.name, category: a.category,
        tags: a.tags, tone: a.tone, aspect: a.ratio, resolution: (a.meta && a.meta.px) || '',
        meta: a.meta, creator: 'me',
        brandId: a.category === 'brand' ? 'bd-kmaker' : null,
      }, a.id + '|' + a.name + '|' + a.size);
    }
    /* Variants 데모 — 브랜드 로고 계열 */
    const logo = list().find((e) => e.category === 'brand') || list()[0];
    ['light', 'dark', 'white', 'black', 'svg', 'png', 'transparent', '2x', '3x'].forEach((k) =>
      addVariant(logo.id, k, { light: 'Light', dark: 'Dark', white: 'White', black: 'Black', svg: 'SVG', png: 'PNG', transparent: 'Transparent', '2x': '@2x', '3x': '@3x' }[k], { format: ['svg', 'png'].includes(k) ? k : 'png' }));
    /* Folder (§7) */
    ['Marketing', 'Education', 'Science', 'Presentation', 'Archive'].forEach((n) => addFolder(n));
    const eduF = STORE.folders[1];
    list().slice(0, 4).forEach((e) => eduF.assetIds.add(e.id));
    /* Smart Collections (§6) */
    addCollection('KEDU 브랜드', { brand: 'bd-kmaker' });
    addCollection('푸른 계열', { colorWord: '푸른' });
    addCollection('최근 사용', { recent: true });
    addCollection('자주 사용', { frequent: 2 });
    addCollection('Presentation', { tag: '발표' });
    addCollection('School', { tag: '수업' });
    /* Usage 시드 — 템플릿 assetIds 스캔(Reference) */
    if (window.MK_TPL && window.MK_TPL.list) {
      window.MK_TPL.list().forEach((t) =>
        (t.assetIds || []).forEach((aid) => get(aid) && registerUse(aid, { templateId: t.templateId, workspaceId: 'ws-design' })));
    }
    if (window.MK_PROJ && window.MK_PROJ.list) {
      window.MK_PROJ.list('recent').forEach((p) =>
        ((p.doc && p.doc.engine && p.doc.engine.assetIds) || []).forEach((aid) =>
          get(aid) && registerUse(aid, { projectId: p.projectId, workspaceId: 'ws-design' })));
    }
    /* 브랜드 자산 한 벌 더 — 교체 추천 데모용(다른 브랜드) */
    const alt = create({ name: 'Company A 로고', kind: 'svg', tags: ['로고', '브랜드'], tone: 'indigo', brandId: 'bd-companya' }, 'companya-logo');
    addVariant(alt.id, 'light', 'Light'); addVariant(alt.id, 'dark', 'Dark');
    log('seed.done', STORE.entities.size);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState !== 'loading') seed();
    else document.addEventListener('DOMContentLoaded', seed);
  }

  /* ================= 20. 에디터 훅 — doc 로드시 사용 스캔 ================= */
  function hook() {
    if (hook._done || !window.PG) return; hook._done = true;
    ['loadEditorDoc', 'openEditorDoc'].forEach((fn) => {
      const orig = window.PG[fn];
      if (!orig) return;
      window.PG[fn] = function (...args) {
        const r = orig.apply(this, args);
        try {
          const doc = window.PG.state && window.PG.state.editor && window.PG.state.editor.doc;
          if (doc) {
            ((doc.engine && doc.engine.assetIds) || []).forEach((aid) => get(aid) && registerUse(aid, { projectId: doc.projectId || null, workspaceId: 'ws-design' }));
            (doc.scenes || []).forEach((s) => (s.elements || []).forEach((el) => {
              if (isRef(el.asset)) registerUse(el.asset.$asset, { sceneId: s.sceneId || null, elementId: el.id || null });
            }));
          }
        } catch (e) { /* 훅 실패해도 에디터 동작 불변 */ }
        return r;
      };
    });
  }
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', hook);

  /* ================= 공개 API ================= */
  return {
    KINDS, SCOPES, CLOUD, STORE, CACHE, hash,
    /* Entity */
    blank, create, get, list, update, remove, duplicate,
    /* Version */
    versions, restoreVersion, compareVersions,
    /* Variant */
    addVariant, variants,
    /* Folder & Collection */
    addFolder, folderList, moveToFolder, folderOf, addCollection, collections, evalCollection, evalRule,
    /* Brand */
    linkBrand, brandAssets, brandChangeRecommend,
    /* Reference & Usage */
    ref, isRef, resolve, registerUse, usedBy, replaceEverywhere,
    /* Crop */
    saveCrop, cropFor, cropMap,
    /* Analytics */
    stats,
    /* Permission */
    setScope, scopeOf, canDo,
    /* Favorites */
    star, isStar, pin, isPin, touchRecent, recents, favorites,
    /* Search */
    search, page, tokenize, similar,
    /* Storage */
    ingest, storageStats, thumb, enqueueUpload, stepUploads,
    /* Cloud */
    cloudPlan,
    /* Scale */
    makeBulk, bulkSearch,
    /* AI */
    autoTag,
    seed, hook,
  };
})();
