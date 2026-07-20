/* ============================================================
   K-MAKER Public API & Automation Platform — window.MK_API  (Round 20)
   ------------------------------------------------------------
   UI ↓ Internal Service ↓ Public API ↓ SDK ↓ Automation —
   모든 핵심 기능이 Gateway(request) 하나를 통과한다.
   Gateway → Auth → Authz(스코프) → RateLimit → Service → Response.
   Webhook·Event Bus·Automation·Workflow·SDK·CLI·OpenAPI 포함.
   ------------------------------------------------------------
   ⚠ 정직 표기: 전부 인메모리 결정론. 실 HTTP 서버·실 네트워크
   전송·실 OAuth IdP·실 암호화(HMAC-SHA256) 없음 — 프로토콜
   형태(상태코드·헤더·서명·재시도 스케줄·토큰 회전)만 실규격.
   서명은 결정론 해시(djb2 계열), 지연·스케줄은 내부 클록 _tick.
   ============================================================ */
window.MK_API = (() => {
  'use strict';

  /* ============ 0. 유틸 ============ */
  let CLOCK = 0;
  const now = () => Date.now() + CLOCK;
  let seq = 0;
  const id = (p) => p + '_' + (++seq).toString(36);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const hash = (s) => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, '0'); };
  const sign = (secret, body) => 'mk-sig=' + hash(secret + '.' + JSON.stringify(body));
  const b64 = (o) => { try { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); } catch (e) { return hash(JSON.stringify(o)); } };
  const getPath = (obj, path) => String(path).split('.').reduce((a, k) => (a == null ? a : a[k]), obj);

  /* ============ 1. 상수 ============ */
  const VERSIONS = ['v1', 'v2', 'v3'];           // v1 deprecated · v2 current · v3 beta
  const CURRENT_VERSION = 'v2';
  const SUNSET_V1 = '2026-12-31';
  const SCOPES = ['project:read', 'project:write', 'asset:read', 'asset:write', 'brand:read', 'brand:write', 'ai:run', 'render:run', 'export:run', 'search:read', 'webhook:manage', 'automation:manage', 'org:read'];
  const ELEMENT_TYPES = ['text', 'shape', 'image', 'table', 'chart', 'video', 'audio', 'animation'];
  const EXPORT_FORMATS = ['pdf', 'pptx', 'png', 'jpg', 'svg', 'html', 'mp4', 'gif'];
  const AI_OPS = ['text', 'image', 'layout', 'presentation', 'translate', 'summarize', 'rewrite'];
  const EVENTS = ['project.created', 'project.updated', 'project.deleted', 'project.saved', 'asset.uploaded', 'plugin.installed', 'brand.updated', 'export.completed', 'ai.completed', 'user.login', 'market.install'];
  const RATE_TIERS = { free: 60, pro: 600, education: 1200, enterprise: 6000, service: 100000 }; // req/min per key
  const RETRY_SCHEDULE = [0, 1000, 5000, 30000]; // webhook 재시도 백오프(ms) — 4회 후 DLQ
  const TOKEN_TTL = { access: 3600e3, refresh: 30 * 86400e3, pat_default: 90 * 86400e3, code: 300e3 };
  const SDK_LANGS = ['javascript', 'typescript', 'python', 'node', 'react', 'flutter'];

  /* ============ 2. 저장소 ============ */
  const APPS = new Map();       // OAuth 앱 · 서비스 계정
  const KEYS = new Map();       // API Key (mk_live_/mk_test_)
  const PATS = new Map();       // Personal Access Token
  const TOKENS = new Map();     // access/refresh/code
  const PROJECTS = new Map();
  const ASSETS = new Map();
  const BRANDS = new Map();
  const AIJOBS = new Map();
  const EXPORTS = new Map();
  const HOOKS = new Map();      // webhook endpoints
  const DELIVERIES = [];        // webhook 배달 시도 로그
  const DLQ = [];               // dead letter queue
  const QUEUE = [];             // event bus 대기열
  const RULES = new Map();      // automation rules
  const RUNS = [];              // automation 실행 로그
  const FLOWS = new Map();      // workflows
  const FLOWRUNS = new Map();   // workflow 실행(지연 대기 포함)
  const OUTBOX = [];            // email/slack/discord 발신 시뮬레이션
  const AUDIT = [];
  const METRICS = new Map();    // key별 사용량
  const HANDLERS = new Map();   // 테스트용 webhook 수신 핸들러(url → fn)
  const SCHEDULES = [];         // schedule 트리거 대기열

  const audit = (event, meta) => { AUDIT.push({ at: now(), event, meta: meta || {} }); if (AUDIT.length > 20000) AUDIT.shift(); };

  /* ============ 3. 인증 자격 발급 ============ */
  function registerApp(opts) {
    if (!opts || !opts.name) return { ok: false, why: '앱 이름 필요' };
    const app = { id: id('app'), name: opts.name, orgId: opts.orgId || null, type: opts.type === 'service' ? 'service' : 'oauth',
      clientId: 'mkc_' + hash(opts.name + seq), clientSecret: 'mks_' + hash(opts.name + 'secret' + seq),
      scopes: opts.scopes || SCOPES.slice(), redirectUris: opts.redirectUris || [], beta: !!opts.beta, createdAt: now() };
    APPS.set(app.id, app); audit('app.registered', { app: app.id, type: app.type });
    return { ok: true, app: clone(app) };
  }
  function createKey(appId, opts) {
    const app = APPS.get(appId); if (!app) return { ok: false, why: '앱 없음' };
    opts = opts || {};
    const key = { id: id('key'), appId, token: (opts.test ? 'mk_test_' : 'mk_live_') + hash(appId + seq + 'k') + hash(String(seq)),
      scopes: opts.scopes || app.scopes, tier: opts.tier || planTier(app.orgId), label: opts.label || 'default', revoked: false, createdAt: now() };
    KEYS.set(key.token, key); audit('key.created', { app: appId, key: key.id, tier: key.tier });
    return { ok: true, key: clone(key) };
  }
  function revokeKey(token) { const k = KEYS.get(token); if (!k) return { ok: false, why: '키 없음' }; k.revoked = true; audit('key.revoked', { key: k.id }); return { ok: true }; }
  function createPat(userId, opts) {
    opts = opts || {};
    const pat = { id: id('pat'), userId, token: 'mk_pat_' + hash(userId + seq) + hash('p' + seq),
      scopes: opts.scopes || SCOPES.slice(), expiresAt: now() + (opts.ttlMs || TOKEN_TTL.pat_default), revoked: false, createdAt: now() };
    PATS.set(pat.token, pat); audit('pat.created', { user: userId, pat: pat.id });
    return { ok: true, pat: clone(pat) };
  }
  function planTier(orgId) { // MK_ADMIN 브리지(read-only): 조직 플랜 → 레이트 티어
    try { const A = window.MK_ADMIN; if (orgId && A && A.getOrg) { const o = A.getOrg(orgId); if (o && o.plan && RATE_TIERS[o.plan]) return o.plan; } } catch (e) {}
    return 'pro';
  }

  /* ---------- OAuth2 ---------- */
  function authorize(clientId, userId, scopes, redirectUri) {
    const app = [...APPS.values()].find((a) => a.clientId === clientId);
    if (!app) return { ok: false, why: 'unknown_client' };
    if (app.redirectUris.length && !app.redirectUris.includes(redirectUri)) return { ok: false, why: 'redirect_uri_mismatch' };
    const bad = (scopes || []).filter((s) => !app.scopes.includes(s));
    if (bad.length) return { ok: false, why: 'invalid_scope:' + bad.join(',') };
    const code = 'mk_code_' + hash(clientId + userId + seq++);
    TOKENS.set(code, { kind: 'code', clientId, userId, scopes: scopes || app.scopes, expiresAt: now() + TOKEN_TTL.code, used: false });
    audit('oauth.authorized', { client: clientId, user: userId });
    return { ok: true, code };
  }
  function issuePair(clientId, userId, scopes) {
    const at = 'mk_at_' + hash(clientId + 'a' + seq++), rt = 'mk_rt_' + hash(clientId + 'r' + seq++);
    TOKENS.set(at, { kind: 'access', clientId, userId, scopes, expiresAt: now() + TOKEN_TTL.access, revoked: false });
    TOKENS.set(rt, { kind: 'refresh', clientId, userId, scopes, access: at, expiresAt: now() + TOKEN_TTL.refresh, revoked: false });
    return { access_token: at, refresh_token: rt, token_type: 'Bearer', expires_in: TOKEN_TTL.access / 1000, scope: scopes.join(' ') };
  }
  function token(body) {
    body = body || {};
    const app = [...APPS.values()].find((a) => a.clientId === body.client_id);
    if (!app || app.clientSecret !== body.client_secret) return { ok: false, why: 'invalid_client' };
    if (body.grant_type === 'authorization_code') {
      const c = TOKENS.get(body.code);
      if (!c || c.kind !== 'code' || c.clientId !== body.client_id) return { ok: false, why: 'invalid_grant' };
      if (c.used) return { ok: false, why: 'code_already_used' };
      if (c.expiresAt < now()) return { ok: false, why: 'code_expired' };
      c.used = true; audit('oauth.token', { client: body.client_id, grant: 'code' });
      return { ok: true, ...issuePair(body.client_id, c.userId, c.scopes) };
    }
    if (body.grant_type === 'client_credentials') {
      if (app.type !== 'service') return { ok: false, why: 'client_credentials는 서비스 계정 전용' };
      audit('oauth.token', { client: body.client_id, grant: 'client_credentials' });
      return { ok: true, ...issuePair(body.client_id, 'svc:' + app.id, app.scopes) };
    }
    if (body.grant_type === 'refresh_token') {
      const r = TOKENS.get(body.refresh_token);
      if (!r || r.kind !== 'refresh' || r.revoked) return { ok: false, why: 'invalid_grant' };
      if (r.expiresAt < now()) return { ok: false, why: 'refresh_expired' };
      r.revoked = true; const old = TOKENS.get(r.access); if (old) old.revoked = true; // 회전: 이전 쌍 폐기
      audit('oauth.token', { client: body.client_id, grant: 'refresh' });
      return { ok: true, ...issuePair(body.client_id, r.userId, r.scopes) };
    }
    return { ok: false, why: 'unsupported_grant_type' };
  }
  /* ---------- 서비스 계정 JWT ---------- */
  function serviceJwt(appId) {
    const app = APPS.get(appId); if (!app || app.type !== 'service') return { ok: false, why: '서비스 계정 아님' };
    const head = { alg: 'MKHS', typ: 'JWT' }, payload = { sub: 'svc:' + app.id, iss: 'k-maker', scopes: app.scopes, exp: now() + TOKEN_TTL.access };
    const body = b64(head) + '.' + b64(payload);
    const jwt = 'mk_jwt_' + body + '.' + hash(app.clientSecret + body);
    TOKENS.set(jwt, { kind: 'jwt', clientId: app.clientId, userId: 'svc:' + app.id, scopes: app.scopes, expiresAt: payload.exp, revoked: false });
    return { ok: true, jwt };
  }

  /* ============ 4. Gateway — 인증 해석 ============ */
  function resolveAuth(req) {
    const h = req.headers || {};
    const apiKey = h['x-api-key'] || (req.auth && req.auth.apiKey);
    if (apiKey) {
      const k = KEYS.get(apiKey);
      if (!k) return { err: [401, 'invalid_api_key'] };
      if (k.revoked) return { err: [401, 'api_key_revoked'] };
      const app = APPS.get(k.appId);
      return { principal: { kind: 'key', keyToken: k.token, appId: k.appId, orgId: app && app.orgId, scopes: k.scopes, tier: k.tier, beta: !!(app && app.beta) } };
    }
    const bearer = (h.authorization || '').replace(/^Bearer\s+/i, '') || (req.auth && req.auth.bearer);
    if (bearer) {
      if (bearer.startsWith('mk_pat_')) {
        const p = PATS.get(bearer);
        if (!p) return { err: [401, 'invalid_token'] };
        if (p.revoked) return { err: [401, 'token_revoked'] };
        if (p.expiresAt < now()) return { err: [401, 'token_expired'] };
        return { principal: { kind: 'pat', keyToken: bearer, userId: p.userId, scopes: p.scopes, tier: 'pro' } };
      }
      const t = TOKENS.get(bearer);
      if (!t || (t.kind !== 'access' && t.kind !== 'jwt')) return { err: [401, 'invalid_token'] };
      if (t.revoked) return { err: [401, 'token_revoked'] };
      if (t.expiresAt < now()) return { err: [401, 'token_expired'] };
      const app = [...APPS.values()].find((a) => a.clientId === t.clientId);
      const tier = t.kind === 'jwt' || (app && app.type === 'service') ? 'service' : planTier(app && app.orgId);
      return { principal: { kind: t.kind, keyToken: bearer, appId: app && app.id, orgId: app && app.orgId, userId: t.userId, scopes: t.scopes, tier, beta: !!(app && app.beta) } };
    }
    return { err: [401, 'missing_credentials'] };
  }

  /* ============ 5. Rate Limiter ============ */
  const RL = new Map(); // keyToken → { windowStart, count }
  function rateCheck(p) {
    const limit = RATE_TIERS[p.tier] || RATE_TIERS.pro;
    const w = RL.get(p.keyToken) || { windowStart: now(), count: 0 };
    if (now() - w.windowStart >= 60000) { w.windowStart = now(); w.count = 0; }
    w.count++; RL.set(p.keyToken, w);
    const remaining = Math.max(0, limit - w.count);
    const reset = Math.ceil((w.windowStart + 60000 - now()) / 1000);
    const headers = { 'x-ratelimit-limit': limit, 'x-ratelimit-remaining': remaining, 'x-ratelimit-reset': reset };
    if (w.count > limit) return { blocked: true, headers: { ...headers, 'retry-after': reset } };
    return { blocked: false, headers };
  }

  /* ============ 6. 스키마 검증 ============ */
  function validate(schema, body) {
    if (!schema) return null;
    body = body || {};
    const errs = [];
    for (const [f, rule] of Object.entries(schema)) {
      const v = body[f];
      if (rule.required && (v === undefined || v === null || v === '')) { errs.push(f + ': 필수'); continue; }
      if (v === undefined || v === null) continue;
      if (rule.type && typeof v !== rule.type) errs.push(f + ': ' + rule.type + ' 아님');
      if (rule.enum && !rule.enum.includes(v)) errs.push(f + ': 허용값 밖(' + rule.enum.join('|') + ')');
      if (rule.max && String(v).length > rule.max) errs.push(f + ': 길이 초과(' + rule.max + ')');
      if (rule.arrayOf && (!Array.isArray(v) || v.some((x) => typeof x !== rule.arrayOf))) errs.push(f + ': ' + rule.arrayOf + ' 배열 아님');
    }
    return errs.length ? errs : null;
  }

  /* ============ 7. 서비스 계층 ============ */
  const SVC = {};
  /* ---- Project ---- */
  SVC.projectCreate = (p, body) => {
    const pr = { id: id('prj'), name: body.name, orgId: p.orgId || body.orgId || null, owner: p.userId || p.appId, status: 'active',
      scenes: [], version: 1, createdAt: now(), updatedAt: now() };
    PROJECTS.set(pr.id, pr); emit('project.created', { projectId: pr.id, name: pr.name, orgId: pr.orgId });
    return [201, projView(pr)];
  };
  const projView = (pr) => ({ id: pr.id, name: pr.name, orgId: pr.orgId, owner: pr.owner, status: pr.status, sceneCount: pr.scenes.length, version: pr.version, createdAt: pr.createdAt, updatedAt: pr.updatedAt });
  const findProj = (pid, includeDeleted) => { const pr = PROJECTS.get(pid); return pr && (includeDeleted || pr.status !== 'deleted') ? pr : null; };
  SVC.projectList = (p, body, params, query) => {
    let list = [...PROJECTS.values()].filter((x) => x.status !== 'deleted');
    if (query && query.status) list = list.filter((x) => x.status === query.status);
    if (query && query.q) list = list.filter((x) => x.name.includes(query.q));
    return [200, { items: list.map(projView), total: list.length }];
  };
  SVC.projectGet = (p, b, params) => { const pr = findProj(params.id); return pr ? [200, { ...projView(pr), scenes: clone(pr.scenes) }] : [404, { error: 'not_found' }]; };
  SVC.projectUpdate = (p, body, params) => {
    const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }];
    if (body.name) pr.name = body.name;
    pr.version++; pr.updatedAt = now(); emit('project.updated', { projectId: pr.id, version: pr.version });
    return [200, projView(pr)];
  };
  SVC.projectDelete = (p, b, params) => { const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }]; pr.status = 'deleted'; emit('project.deleted', { projectId: pr.id }); return [204, null]; };
  SVC.projectDuplicate = (p, b, params) => {
    const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }];
    const cp = clone(pr); cp.id = id('prj'); cp.name = pr.name + ' 사본'; cp.version = 1; cp.createdAt = now(); cp.updatedAt = now();
    PROJECTS.set(cp.id, cp); emit('project.created', { projectId: cp.id, duplicatedFrom: pr.id });
    return [201, projView(cp)];
  };
  SVC.projectArchive = (p, b, params) => { const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }]; if (pr.status === 'archived') return [409, { error: 'already_archived' }]; pr.status = 'archived'; pr.updatedAt = now(); return [200, projView(pr)]; };
  SVC.projectRestore = (p, b, params) => { const pr = PROJECTS.get(params.id); if (!pr) return [404, { error: 'not_found' }]; if (pr.status === 'active') return [409, { error: 'not_archived' }]; pr.status = 'active'; pr.updatedAt = now(); return [200, projView(pr)]; };
  SVC.projectSave = (p, b, params) => { const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }]; pr.version++; pr.updatedAt = now(); emit('project.saved', { projectId: pr.id, version: pr.version, name: pr.name }); return [200, { saved: true, version: pr.version }]; };
  /* ---- Scene ---- */
  SVC.sceneCreate = (p, body, params) => {
    const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }];
    const sc = { id: id('scn'), name: body.name || '장면 ' + (pr.scenes.length + 1), order: pr.scenes.length, elements: [] };
    pr.scenes.push(sc); pr.updatedAt = now();
    return [201, clone(sc)];
  };
  const findScene = (params) => { const pr = findProj(params.id); if (!pr) return {}; return { pr, sc: pr.scenes.find((s) => s.id === params.sid) }; };
  SVC.sceneDelete = (p, b, params) => { const { pr, sc } = findScene(params); if (!sc) return [404, { error: 'not_found' }]; pr.scenes = pr.scenes.filter((s) => s !== sc); pr.scenes.forEach((s, i) => s.order = i); return [204, null]; };
  SVC.sceneDuplicate = (p, b, params) => { const { pr, sc } = findScene(params); if (!sc) return [404, { error: 'not_found' }]; const cp = clone(sc); cp.id = id('scn'); cp.name = sc.name + ' 사본'; pr.scenes.splice(sc.order + 1, 0, cp); pr.scenes.forEach((s, i) => s.order = i); return [201, clone(cp)]; };
  SVC.sceneReorder = (p, body, params) => {
    const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }];
    const order = body.order || [];
    if (order.length !== pr.scenes.length || order.some((sid) => !pr.scenes.find((s) => s.id === sid))) return [400, { error: 'invalid_order' }];
    pr.scenes.sort((a, b2) => order.indexOf(a.id) - order.indexOf(b2.id)); pr.scenes.forEach((s, i) => s.order = i);
    return [200, { order: pr.scenes.map((s) => s.id) }];
  };
  SVC.sceneRename = (p, body, params) => { const { sc } = findScene(params); if (!sc) return [404, { error: 'not_found' }]; sc.name = body.name; return [200, clone(sc)]; };
  /* ---- Element ---- */
  SVC.elementCreate = (p, body, params) => {
    const { pr, sc } = findScene(params); if (!sc) return [404, { error: 'not_found' }];
    const el = { id: id('el'), type: body.type, props: body.props || {}, order: sc.elements.length };
    sc.elements.push(el); pr.updatedAt = now();
    return [201, clone(el)];
  };
  const findEl = (params) => { const { pr, sc } = findScene(params); if (!sc) return {}; return { pr, sc, el: sc.elements.find((e) => e.id === params.eid) }; };
  SVC.elementList = (p, b, params) => { const { sc } = findScene(params); return sc ? [200, { items: clone(sc.elements) }] : [404, { error: 'not_found' }]; };
  SVC.elementUpdate = (p, body, params) => { const { pr, el } = findEl(params); if (!el) return [404, { error: 'not_found' }]; Object.assign(el.props, body.props || {}); pr.updatedAt = now(); return [200, clone(el)]; };
  SVC.elementDelete = (p, b, params) => { const { sc, el } = findEl(params); if (!el) return [404, { error: 'not_found' }]; sc.elements = sc.elements.filter((e) => e !== el); return [204, null]; };
  /* ---- Asset ---- */
  SVC.assetUpload = (p, body) => {
    const a = { id: id('ast'), name: body.name, kind: body.kind || 'image', size: body.size || 1024, meta: body.meta || {}, versions: [{ v: 1, size: body.size || 1024, note: '초기 업로드' }], url: '/assets/' + hash(body.name + seq), createdAt: now() };
    ASSETS.set(a.id, a); emit('asset.uploaded', { assetId: a.id, name: a.name, kind: a.kind });
    return [201, clone(a)];
  };
  SVC.assetGet = (p, b, params) => { const a = ASSETS.get(params.id); return a ? [200, clone(a)] : [404, { error: 'not_found' }]; };
  SVC.assetDownload = (p, b, params) => { const a = ASSETS.get(params.id); return a ? [200, { url: a.url, size: a.versions[a.versions.length - 1].size }] : [404, { error: 'not_found' }]; };
  SVC.assetReplace = (p, body, params) => {
    const a = ASSETS.get(params.id); if (!a) return [404, { error: 'not_found' }];
    a.versions.push({ v: a.versions.length + 1, size: body.size || a.size, note: body.note || '교체' }); a.size = body.size || a.size;
    return [200, clone(a)];
  };
  SVC.assetMeta = (p, body, params) => { const a = ASSETS.get(params.id); if (!a) return [404, { error: 'not_found' }]; Object.assign(a.meta, body.meta || {}); return [200, clone(a)]; };
  SVC.assetSearch = (p, b, params, query) => {
    const q = (query && query.q || '').toLowerCase();
    const list = [...ASSETS.values()].filter((a) => !q || a.name.toLowerCase().includes(q) || Object.values(a.meta).join(' ').toLowerCase().includes(q));
    return [200, { items: list.map((a) => ({ id: a.id, name: a.name, kind: a.kind, versions: a.versions.length })), total: list.length }];
  };
  /* ---- Brand ---- */
  SVC.brandCreate = (p, body) => {
    const b = { id: id('brd'), name: body.name, colors: body.colors || [], typography: body.typography || {}, logos: body.logos || [], components: body.components || [], theme: body.theme || 'light', createdAt: now() };
    BRANDS.set(b.id, b); emit('brand.updated', { brandId: b.id, name: b.name });
    return [201, clone(b)];
  };
  SVC.brandGet = (p, b2, params) => { const b = BRANDS.get(params.id); return b ? [200, clone(b)] : [404, { error: 'not_found' }]; };
  SVC.brandUpdate = (p, body, params) => {
    const b = BRANDS.get(params.id); if (!b) return [404, { error: 'not_found' }];
    ['colors', 'typography', 'logos', 'components', 'theme', 'name'].forEach((k) => { if (body[k] !== undefined) b[k] = body[k]; });
    emit('brand.updated', { brandId: b.id }); return [200, clone(b)];
  };
  SVC.brandList = () => [200, { items: [...BRANDS.values()].map((b) => ({ id: b.id, name: b.name, colors: b.colors.length, theme: b.theme })) }];
  /* ---- AI (결정론) ---- */
  const AI_GEN = {
    text: (i) => '「' + i.prompt + '」에 대한 생성 문안 — 핵심을 한 문장으로: ' + i.prompt.slice(0, 24) + '.',
    image: (i) => ({ url: '/ai/img/' + hash(i.prompt), w: 1024, h: 1024, style: i.style || 'default' }),
    layout: (i) => ({ grid: '12col', regions: ['header', 'hero', 'body', 'footer'], seedFrom: hash(i.prompt) }),
    presentation: (i) => ({ scenes: [{ name: '표지' }, { name: '개요' }, { name: '본문' }, { name: '마무리' }], topic: i.prompt }),
    translate: (i) => (i.target === 'en' ? '[EN] ' : '[KO] ') + i.prompt,
    summarize: (i) => '요약: ' + i.prompt.slice(0, 30) + (i.prompt.length > 30 ? '…' : ''),
    rewrite: (i) => '다듬음: ' + i.prompt,
  };
  SVC.aiRun = (p, body) => {
    const job = { id: id('ai'), op: body.op, input: { prompt: body.prompt, target: body.target, style: body.style }, status: 'completed',
      output: AI_GEN[body.op]({ prompt: body.prompt, target: body.target, style: body.style }), createdAt: now(), finishedAt: now() };
    AIJOBS.set(job.id, job); emit('ai.completed', { jobId: job.id, op: job.op });
    return [201, clone(job)];
  };
  SVC.aiGet = (p, b, params) => { const j = AIJOBS.get(params.id); return j ? [200, clone(j)] : [404, { error: 'not_found' }]; };
  /* ---- Render / Export ---- */
  SVC.render = (p, body, params) => {
    const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }];
    const scenes = body && body.scene ? pr.scenes.filter((s) => s.id === body.scene) : pr.scenes;
    return [200, { projectId: pr.id, scenes: scenes.length, displayList: scenes.map((s) => ({ scene: s.id, ops: s.elements.length * 3 + 2 })) }];
  };
  SVC.preview = (p, b, params) => { const pr = findProj(params.id); return pr ? [200, { url: '/preview/' + pr.id + '?v=' + pr.version }] : [404, { error: 'not_found' }]; };
  SVC.thumbnail = (p, b, params) => { const pr = findProj(params.id); return pr ? [200, { url: '/thumb/' + pr.id + '.png', w: 320, h: 180 }] : [404, { error: 'not_found' }]; };
  SVC.exportRun = (p, body, params) => {
    const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }];
    const ex = { id: id('exp'), projectId: pr.id, format: body.format, status: 'completed',
      size: 4096 + pr.scenes.reduce((a, s) => a + s.elements.length, 0) * 512, url: '/export/' + pr.id + '.' + body.format, createdAt: now() };
    EXPORTS.set(ex.id, ex); emit('export.completed', { exportId: ex.id, projectId: pr.id, format: ex.format });
    return [201, clone(ex)];
  };
  SVC.exportBatch = (p, body, params) => {
    const pr = findProj(params.id); if (!pr) return [404, { error: 'not_found' }];
    const bad = (body.formats || []).filter((f) => !EXPORT_FORMATS.includes(f));
    if (bad.length) return [400, { error: 'invalid_format:' + bad.join(',') }];
    const items = body.formats.map((f) => SVC.exportRun(p, { format: f }, params)[1]);
    return [201, { items, total: items.length }];
  };
  /* ---- Search (통합) ---- */
  SVC.search = (p, b, params, query) => {
    const q = (query && query.q || '').toLowerCase(); if (!q) return [400, { error: 'q_required' }];
    const score = (name) => name.toLowerCase() === q ? 3 : name.toLowerCase().startsWith(q) ? 2 : name.toLowerCase().includes(q) ? 1 : 0;
    const out = [];
    PROJECTS.forEach((x) => { if (x.status !== 'deleted' && score(x.name)) out.push({ type: 'project', id: x.id, name: x.name, score: score(x.name) }); });
    ASSETS.forEach((x) => { if (score(x.name)) out.push({ type: 'asset', id: x.id, name: x.name, score: score(x.name) }); });
    BRANDS.forEach((x) => { if (score(x.name)) out.push({ type: 'brand', id: x.id, name: x.name, score: score(x.name) }); });
    AIJOBS.forEach((x) => { const n = String(x.input.prompt || ''); if (n.toLowerCase().includes(q)) out.push({ type: 'ai', id: x.id, name: n.slice(0, 30), score: 1 }); });
    try { const MP = window.MK_PLUGIN; if (MP && MP.list) MP.list().forEach((pl) => { if (score(pl.name || '')) out.push({ type: 'plugin', id: pl.id, name: pl.name, score: score(pl.name) }); }); } catch (e) {}
    out.sort((a, b2) => b2.score - a.score);
    return [200, { items: out.slice(0, 30), total: out.length }];
  };

  /* ============ 8. 라우트 테이블 (OpenAPI 원천) ============ */
  const R = (method, path, scope, handler, opts) => ({ method, path, scope, handler, schema: opts && opts.schema, summary: (opts && opts.summary) || '', versions: (opts && opts.versions) || [1, 2, 3] });
  const ROUTES = [
    R('POST', '/oauth/token', null, null, { summary: 'OAuth2 토큰 발급(공개)' }),
    R('GET', '/openapi.json', null, null, { summary: 'OpenAPI 명세(공개)' }),
    R('GET', '/projects', 'project:read', SVC.projectList, { summary: '프로젝트 목록' }),
    R('POST', '/projects', 'project:write', SVC.projectCreate, { schema: { name: { required: true, type: 'string', max: 80 } }, summary: '프로젝트 생성' }),
    R('GET', '/projects/:id', 'project:read', SVC.projectGet, { summary: '프로젝트 조회' }),
    R('PATCH', '/projects/:id', 'project:write', SVC.projectUpdate, { schema: { name: { type: 'string', max: 80 } }, summary: '프로젝트 수정' }),
    R('DELETE', '/projects/:id', 'project:write', SVC.projectDelete, { summary: '프로젝트 삭제' }),
    R('POST', '/projects/:id/duplicate', 'project:write', SVC.projectDuplicate, { summary: '복제' }),
    R('POST', '/projects/:id/archive', 'project:write', SVC.projectArchive, { summary: '보관' }),
    R('POST', '/projects/:id/restore', 'project:write', SVC.projectRestore, { summary: '복원' }),
    R('POST', '/projects/:id/save', 'project:write', SVC.projectSave, { summary: '저장(이벤트 발화)' }),
    R('POST', '/projects/:id/scenes', 'project:write', SVC.sceneCreate, { summary: '장면 생성' }),
    R('DELETE', '/projects/:id/scenes/:sid', 'project:write', SVC.sceneDelete, { summary: '장면 삭제' }),
    R('POST', '/projects/:id/scenes/:sid/duplicate', 'project:write', SVC.sceneDuplicate, { summary: '장면 복제' }),
    R('POST', '/projects/:id/scenes/reorder', 'project:write', SVC.sceneReorder, { summary: '장면 순서' }),
    R('PATCH', '/projects/:id/scenes/:sid', 'project:write', SVC.sceneRename, { schema: { name: { required: true, type: 'string', max: 60 } }, summary: '장면 이름' }),
    R('GET', '/projects/:id/scenes/:sid/elements', 'project:read', SVC.elementList, { summary: '요소 목록' }),
    R('POST', '/projects/:id/scenes/:sid/elements', 'project:write', SVC.elementCreate, { schema: { type: { required: true, type: 'string', enum: ELEMENT_TYPES } }, summary: '요소 생성' }),
    R('PATCH', '/projects/:id/scenes/:sid/elements/:eid', 'project:write', SVC.elementUpdate, { summary: '요소 수정' }),
    R('DELETE', '/projects/:id/scenes/:sid/elements/:eid', 'project:write', SVC.elementDelete, { summary: '요소 삭제' }),
    R('POST', '/assets', 'asset:write', SVC.assetUpload, { schema: { name: { required: true, type: 'string', max: 80 } }, summary: '에셋 업로드' }),
    R('GET', '/assets', 'asset:read', SVC.assetSearch, { summary: '에셋 검색' }),
    R('GET', '/assets/:id', 'asset:read', SVC.assetGet, { summary: '에셋 조회' }),
    R('GET', '/assets/:id/download', 'asset:read', SVC.assetDownload, { summary: '다운로드' }),
    R('POST', '/assets/:id/replace', 'asset:write', SVC.assetReplace, { summary: '교체(버전+1)' }),
    R('PATCH', '/assets/:id/metadata', 'asset:write', SVC.assetMeta, { summary: '메타데이터' }),
    R('POST', '/brands', 'brand:write', SVC.brandCreate, { schema: { name: { required: true, type: 'string', max: 60 } }, summary: '브랜드 킷 생성' }),
    R('GET', '/brands', 'brand:read', SVC.brandList, { summary: '브랜드 목록' }),
    R('GET', '/brands/:id', 'brand:read', SVC.brandGet, { summary: '브랜드 조회' }),
    R('PATCH', '/brands/:id', 'brand:write', SVC.brandUpdate, { summary: '브랜드 수정' }),
    R('POST', '/ai', 'ai:run', SVC.aiRun, { schema: { op: { required: true, type: 'string', enum: AI_OPS }, prompt: { required: true, type: 'string', max: 500 } }, summary: 'AI 실행' }),
    R('GET', '/ai/:id', 'ai:run', SVC.aiGet, { summary: 'AI 잡 조회' }),
    R('POST', '/projects/:id/render', 'render:run', SVC.render, { summary: '렌더' }),
    R('GET', '/projects/:id/preview', 'render:run', SVC.preview, { summary: '미리보기' }),
    R('GET', '/projects/:id/thumbnail', 'render:run', SVC.thumbnail, { summary: '썸네일' }),
    R('POST', '/projects/:id/export', 'export:run', SVC.exportRun, { schema: { format: { required: true, type: 'string', enum: EXPORT_FORMATS } }, summary: '내보내기' }),
    R('POST', '/projects/:id/export/batch', 'export:run', SVC.exportBatch, { summary: '일괄 내보내기' }),
    R('GET', '/search', 'search:read', SVC.search, { summary: '통합 검색' }),
    R('GET', '/beta/insights', 'org:read', () => [200, { beta: true, insight: '요소 밀도 상위 프로젝트 분석(베타)' }], { versions: [3], summary: 'v3 베타 전용' }),
  ];

  /* ============ 9. Gateway 본체 ============ */
  function match(method, segs) {
    for (const r of ROUTES) {
      if (r.method !== method) continue;
      const ps = r.path.split('/').filter(Boolean);
      if (ps.length !== segs.length) continue;
      const params = {}; let ok = true;
      for (let i = 0; i < ps.length; i++) {
        if (ps[i][0] === ':') params[ps[i].slice(1)] = segs[i];
        else if (ps[i] !== segs[i]) { ok = false; break; }
      }
      if (ok) return { route: r, params };
    }
    return null;
  }
  function v1MapIn(route, body) { // v1 하위호환: title → name
    if (!body) return body;
    const b = { ...body };
    if (b.title !== undefined && b.name === undefined) { b.name = b.title; delete b.title; }
    return b;
  }
  function v1MapOut(body) {
    if (body && typeof body === 'object' && !Array.isArray(body) && body.name !== undefined && body.id && String(body.id).startsWith('prj')) return { ...body, title: body.name };
    return body;
  }
  function metric(p, route, status, ms) {
    if (!p || !p.keyToken) return;
    const m = METRICS.get(p.keyToken) || { count: 0, errors: 0, latencySum: 0, latencyMax: 0, byStatus: {}, byRoute: {} };
    m.count++; if (status >= 400) m.errors++;
    m.latencySum += ms; m.latencyMax = Math.max(m.latencyMax, ms);
    m.byStatus[status] = (m.byStatus[status] || 0) + 1;
    if (route) m.byRoute[route.method + ' ' + route.path] = (m.byRoute[route.method + ' ' + route.path] || 0) + 1;
    METRICS.set(p.keyToken, m);
  }
  function request(req) {
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const done = (status, body, headers, p, route) => {
      const ms = ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
      metric(p, route, status, ms);
      return { status, headers: headers || {}, body };
    };
    if (req.insecure) return done(400, { error: 'https_required' });
    const segs = String(req.path || '').split('/').filter(Boolean);
    const version = segs.shift();
    if (!VERSIONS.includes(version)) return done(404, { error: 'unknown_version', supported: VERSIONS });
    const verHeaders = {};
    if (version === 'v1') { verHeaders.deprecation = 'true'; verHeaders.sunset = SUNSET_V1; verHeaders.link = '</v2/>; rel="successor-version"'; }
    /* CORS preflight */
    if (req.method === 'OPTIONS') return done(204, null, { ...verHeaders, 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,PATCH,DELETE', 'access-control-allow-headers': 'authorization,x-api-key,content-type' });
    /* 공개 라우트 */
    if (req.method === 'POST' && segs.join('/') === 'oauth/token') { const r = token(req.body); return r.ok ? done(200, (delete r.ok, r), verHeaders) : done(400, { error: r.why }, verHeaders); }
    if (req.method === 'GET' && segs.join('/') === 'openapi.json') return done(200, openapi(version), verHeaders);
    /* 인증 */
    const auth = resolveAuth(req);
    if (auth.err) return done(auth.err[0], { error: auth.err[1] }, { ...verHeaders, 'www-authenticate': 'Bearer' });
    const p = auth.principal;
    /* v3 베타 게이트 */
    if (version === 'v3' && !p.beta && p.tier !== 'service') return done(403, { error: 'beta_access_required' }, verHeaders, p);
    /* 레이트 리밋 */
    const rl = rateCheck(p);
    if (rl.blocked) { audit('rate.limited', { key: p.keyToken.slice(0, 16) }); return done(429, { error: 'rate_limited' }, { ...verHeaders, ...rl.headers }, p); }
    /* 라우팅 */
    const m = match(req.method, segs);
    if (!m) return done(404, { error: 'route_not_found' }, { ...verHeaders, ...rl.headers }, p);
    if (m.route.versions && !m.route.versions.includes(Number(version.slice(1)))) return done(404, { error: 'not_in_' + version }, { ...verHeaders, ...rl.headers }, p);
    /* 스코프 */
    if (m.route.scope && !p.scopes.includes(m.route.scope)) { audit('authz.denied', { scope: m.route.scope }); return done(403, { error: 'insufficient_scope', required: m.route.scope }, { ...verHeaders, ...rl.headers }, p, m.route); }
    /* 검증 */
    let body = version === 'v1' ? v1MapIn(m.route, req.body) : req.body;
    const errs = validate(m.route.schema, body);
    if (errs) return done(400, { error: 'invalid_request', details: errs }, { ...verHeaders, ...rl.headers }, p, m.route);
    /* 서비스 실행 */
    let out;
    try { out = m.route.handler(p, body || {}, m.params, req.query || {}); }
    catch (e) { audit('api.error', { path: req.path, msg: String(e.message) }); return done(500, { error: 'internal', message: String(e.message) }, { ...verHeaders, ...rl.headers }, p, m.route); }
    let respBody = out[1];
    if (version === 'v1') respBody = v1MapOut(respBody);
    return done(out[0], respBody, { ...verHeaders, ...rl.headers, 'x-api-version': version }, p, m.route);
  }

  /* ============ 10. OpenAPI ============ */
  function openapi(version) {
    const paths = {};
    ROUTES.filter((r) => r.handler && (!r.versions || r.versions.includes(Number((version || CURRENT_VERSION).slice(1))))).forEach((r) => {
      const p = '/' + (version || CURRENT_VERSION) + r.path.replace(/:(\w+)/g, '{$1}');
      paths[p] = paths[p] || {};
      paths[p][r.method.toLowerCase()] = {
        summary: r.summary, security: [{ bearerAuth: [] }, { apiKey: [] }],
        'x-scope': r.scope,
        parameters: (r.path.match(/:(\w+)/g) || []).map((s) => ({ name: s.slice(1), in: 'path', required: true, schema: { type: 'string' } })),
        requestBody: r.schema ? { content: { 'application/json': { schema: { type: 'object', properties: Object.fromEntries(Object.entries(r.schema).map(([k, v]) => [k, { type: v.type || 'string', enum: v.enum }])), required: Object.entries(r.schema).filter(([, v]) => v.required).map(([k]) => k) } } } } : undefined,
        responses: { 200: { description: 'OK' }, 400: { description: '검증 실패' }, 401: { description: '인증 실패' }, 403: { description: '권한/스코프 부족' }, 429: { description: '레이트 리밋' } },
      };
    });
    return { openapi: '3.1.0', info: { title: 'K-MAKER Public API', version: version || CURRENT_VERSION }, servers: [{ url: 'https://api.keduclass.com' }], paths,
      components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' }, apiKey: { type: 'apiKey', in: 'header', name: 'X-Api-Key' } } } };
  }

  /* ============ 11. Event Bus + Webhook ============ */
  function emit(event, payload) {
    const ev = { id: id('ev'), event, payload, at: now() };
    QUEUE.push(ev);
    drainBus();
    return ev.id;
  }
  function drainBus() {
    while (QUEUE.length) {
      const ev = QUEUE.shift();
      /* 구독 1: 웹훅 배달 예약 */
      HOOKS.forEach((h) => { if (!h.disabled && h.events.includes(ev.event)) scheduleDelivery(h, ev, 0); });
      /* 구독 2: 자동화 트리거 */
      RULES.forEach((r) => { if (r.enabled && r.trigger.type === 'event' && r.trigger.event === ev.event) runRule(r, ev); });
      /* 구독 3: 워크플로 트리거 */
      FLOWS.forEach((f) => { if (f.enabled && f.triggerEvent === ev.event) runFlow(f.id, { event: ev.event, payload: clone(ev.payload) }); });
    }
  }
  function createWebhook(opts) {
    if (!opts || !opts.url || !Array.isArray(opts.events) || !opts.events.length) return { ok: false, why: 'url·events 필요' };
    const bad = opts.events.filter((e) => !EVENTS.includes(e));
    if (bad.length) return { ok: false, why: '알 수 없는 이벤트: ' + bad.join(',') };
    const h = { id: id('wh'), url: opts.url, events: opts.events.slice(), secret: 'whsec_' + hash(opts.url + seq), disabled: false, createdAt: now(), delivered: 0, failed: 0 };
    HOOKS.set(h.id, h); audit('webhook.created', { hook: h.id, url: h.url });
    return { ok: true, hook: clone(h) };
  }
  const PENDING = []; // 배달 대기(재시도 포함)
  function scheduleDelivery(hook, ev, attempt) {
    PENDING.push({ id: id('dl'), hookId: hook.id, event: ev.event, payload: ev.payload, attempt, dueAt: now() + RETRY_SCHEDULE[attempt] });
    pump();
  }
  function pump() { // 기한 도래분 배달 시도
    for (let i = PENDING.length - 1; i >= 0; i--) {
      const d = PENDING[i];
      if (d.dueAt > now()) continue;
      PENDING.splice(i, 1);
      const hook = HOOKS.get(d.hookId); if (!hook || hook.disabled) continue;
      const body = { id: d.id, event: d.event, data: d.payload, attempt: d.attempt + 1 };
      const sig = sign(hook.secret, body);
      let ok = false, resp = 'unreachable';
      const fn = HANDLERS.get(hook.url);
      if (fn) { try { const r = fn(body, sig); ok = !!(r && r.ok); resp = ok ? '200' : (r && r.why) || '500'; } catch (e) { resp = 'handler_error'; } }
      DELIVERIES.push({ id: d.id, hookId: d.hookId, event: d.event, attempt: d.attempt + 1, ok, resp, sig, at: now() });
      if (DELIVERIES.length > 5000) DELIVERIES.shift();
      if (ok) { hook.delivered++; }
      else {
        hook.failed++;
        if (d.attempt + 1 < RETRY_SCHEDULE.length) scheduleDelivery(hook, { event: d.event, payload: d.payload }, d.attempt + 1);
        else { DLQ.push({ id: d.id, hookId: d.hookId, event: d.event, payload: d.payload, exhaustedAt: now() }); audit('webhook.dlq', { hook: d.hookId, event: d.event }); }
      }
    }
  }
  function redeliver(dlqId) {
    const i = DLQ.findIndex((x) => x.id === dlqId); if (i < 0) return { ok: false, why: 'DLQ 항목 없음' };
    const d = DLQ.splice(i, 1)[0];
    const hook = HOOKS.get(d.hookId); if (!hook) return { ok: false, why: '훅 삭제됨' };
    scheduleDelivery(hook, { event: d.event, payload: d.payload }, 0);
    return { ok: true };
  }
  function verifySignature(hookId, body, sig) { const h = HOOKS.get(hookId); return !!h && sign(h.secret, body) === sig; }

  /* ============ 12. Automation Engine ============ */
  function createRule(opts) {
    if (!opts || !opts.name || !opts.trigger || !Array.isArray(opts.actions) || !opts.actions.length) return { ok: false, why: 'name·trigger·actions 필요' };
    if (opts.trigger.type === 'event' && !EVENTS.includes(opts.trigger.event)) return { ok: false, why: '알 수 없는 이벤트' };
    if (opts.trigger.type === 'schedule' && !(opts.trigger.everyMs > 0)) return { ok: false, why: 'everyMs 필요' };
    const r = { id: id('rule'), name: opts.name, trigger: clone(opts.trigger), conditions: clone(opts.conditions || []), actions: clone(opts.actions), enabled: opts.enabled !== false, runs: 0, createdAt: now() };
    RULES.set(r.id, r);
    if (r.trigger.type === 'schedule') SCHEDULES.push({ ruleId: r.id, nextAt: now() + r.trigger.everyMs });
    audit('automation.created', { rule: r.id });
    return { ok: true, rule: clone(r) };
  }
  const OPS = { eq: (a, b) => a === b, ne: (a, b) => a !== b, gt: (a, b) => a > b, lt: (a, b) => a < b, contains: (a, b) => String(a).includes(b), exists: (a) => a !== undefined && a !== null };
  function checkConds(conds, ctx) { return (conds || []).every((c) => { const v = getPath(ctx, c.path); return OPS[c.op] ? OPS[c.op](v, c.value) : false; }); }
  const SYS = { kind: 'system', keyToken: null, scopes: SCOPES, tier: 'service' };
  function doAction(a, ctx) {
    const pid = a.projectId || getPath(ctx, 'payload.projectId');
    if (a.type === 'export') { const r = SVC.exportRun(SYS, { format: a.format || 'pdf' }, { id: pid }); return { type: a.type, ok: r[0] < 400, out: r[1] }; }
    if (a.type === 'duplicate') { const r = SVC.projectDuplicate(SYS, {}, { id: pid }); return { type: a.type, ok: r[0] < 400, out: r[1] }; }
    if (a.type === 'rename') { const r = SVC.projectUpdate(SYS, { name: a.name }, { id: pid }); return { type: a.type, ok: r[0] < 400, out: r[1] }; }
    if (a.type === 'move') { const pr = findProj(pid); if (pr) pr.folder = a.folder; return { type: a.type, ok: !!pr, out: { folder: a.folder } }; }
    if (a.type === 'translate') { const r = SVC.aiRun(SYS, { op: 'translate', prompt: a.text || getPath(ctx, 'payload.name') || '', target: a.target || 'en' }); return { type: a.type, ok: true, out: r[1].output }; }
    if (a.type === 'generate') { const r = SVC.aiRun(SYS, { op: a.op || 'text', prompt: a.prompt || '자동 생성' }); return { type: a.type, ok: true, out: r[1].output }; }
    if (a.type === 'email' || a.type === 'slack' || a.type === 'discord') { OUTBOX.push({ id: id('msg'), channel: a.type, to: fillVars(a.to, ctx), text: fillVars(a.text, ctx), at: now() }); return { type: a.type, ok: true }; }
    if (a.type === 'webhook') { const h = [...HOOKS.values()].find((x) => x.url === a.url); if (h) scheduleDelivery(h, { event: 'automation.action', payload: ctx.payload || {} }, 0); return { type: a.type, ok: !!h, out: h ? undefined : 'url 미등록' }; }
    return { type: a.type, ok: false, out: 'unknown_action' };
  }
  const fillVars = (t, ctx) => String(t || '').replace(/\{\{([\w.]+)\}\}/g, (m, p) => { const v = getPath(ctx, p); return v === undefined ? m : String(v); });
  function runRule(r, ev) {
    const ctx = { event: ev ? ev.event : r.trigger.type, payload: ev ? clone(ev.payload) : {} };
    const matched = checkConds(r.conditions, ctx);
    const run = { id: id('run'), ruleId: r.id, at: now(), matched, results: [] };
    if (matched) { run.results = r.actions.map((a) => doAction(a, ctx)); r.runs++; }
    RUNS.push(run); if (RUNS.length > 2000) RUNS.shift();
    return run;
  }
  function triggerLogin(userId) { emit('user.login', { userId }); }
  function triggerMarketInstall(itemId, orgId) { emit('market.install', { itemId, orgId }); }

  /* ============ 13. Workflow ============ */
  const NODE_TYPES = ['trigger', 'condition', 'action', 'branch', 'loop', 'delay', 'variable'];
  function createFlow(opts) {
    if (!opts || !opts.name || !Array.isArray(opts.nodes)) return { ok: false, why: 'name·nodes 필요' };
    const badN = opts.nodes.filter((n) => !NODE_TYPES.includes(n.type));
    if (badN.length) return { ok: false, why: '알 수 없는 노드: ' + badN.map((n) => n.type).join(',') };
    const trig = opts.nodes.find((n) => n.type === 'trigger');
    if (!trig) return { ok: false, why: 'trigger 노드 필요' };
    const ids = new Set(opts.nodes.map((n) => n.id));
    const badE = (opts.edges || []).filter((e) => !ids.has(e.from) || !ids.has(e.to));
    if (badE.length) return { ok: false, why: '끊어진 엣지 ' + badE.length + '건' };
    const f = { id: id('flow'), name: opts.name, nodes: clone(opts.nodes), edges: clone(opts.edges || []), triggerEvent: trig.config && trig.config.event, enabled: opts.enabled !== false, createdAt: now() };
    FLOWS.set(f.id, f); audit('workflow.created', { flow: f.id });
    return { ok: true, flow: clone(f) };
  }
  function nextNode(f, fromId, port) {
    const e = f.edges.find((x) => x.from === fromId && (x.port || 'out') === (port || 'out'));
    return e ? f.nodes.find((n) => n.id === e.to) : null;
  }
  function runFlow(flowId, ctx) {
    const f = FLOWS.get(flowId); if (!f) return { ok: false, why: '플로 없음' };
    const run = { id: id('frun'), flowId, status: 'running', vars: clone(ctx || {}), log: [], startedAt: now(), waitUntil: null, resumeNode: null };
    FLOWRUNS.set(run.id, run);
    const start = f.nodes.find((n) => n.type === 'trigger');
    step(f, run, nextNode(f, start.id, 'out'));
    return { ok: true, runId: run.id, status: run.status };
  }
  function step(f, run, node) {
    let guard = 0;
    while (node && guard++ < 200) {
      const L = (msg, extra) => run.log.push({ node: node.id, type: node.type, msg, ...(extra || {}), at: now() });
      if (node.type === 'variable') {
        const v = node.config.fromPath ? getPath(run.vars, node.config.fromPath) : node.config.value;
        run.vars[node.config.name] = v; L('설정 ' + node.config.name + '=' + JSON.stringify(v));
        node = nextNode(f, node.id, 'out');
      } else if (node.type === 'condition' || node.type === 'branch') {
        const pass = checkConds(node.config.conditions || [], run.vars);
        L(pass ? 'true' : 'false');
        node = nextNode(f, node.id, pass ? 'true' : 'false') || (node.type === 'condition' && pass ? nextNode(f, node.id, 'out') : null);
      } else if (node.type === 'action') {
        const r = doAction(node.config, run.vars);
        L(r.ok ? '실행 완료' : '실패', { result: r });
        node = nextNode(f, node.id, 'out');
      } else if (node.type === 'loop') {
        const arr = getPath(run.vars, node.config.overPath) || [];
        const max = node.config.maxIter || 20;
        L('루프 ' + Math.min(arr.length, max) + '회');
        for (let i = 0; i < arr.length && i < max; i++) {
          run.vars[node.config.as || 'item'] = arr[i]; run.vars._loopIndex = i;
          let bn = nextNode(f, node.id, 'body');
          let g2 = 0;
          while (bn && bn.type === 'action' && g2++ < 50) { const r = doAction(bn.config, run.vars); run.log.push({ node: bn.id, type: 'action', msg: '루프[' + i + '] ' + (r.ok ? '완료' : '실패'), at: now() }); bn = nextNode(f, bn.id, 'out'); }
        }
        node = nextNode(f, node.id, 'done');
      } else if (node.type === 'delay') {
        run.status = 'waiting'; run.waitUntil = now() + (node.config.ms || 1000); run.resumeNode = (nextNode(f, node.id, 'out') || {}).id || null;
        L('대기 ' + (node.config.ms || 1000) + 'ms');
        return;
      } else node = nextNode(f, node.id, 'out');
    }
    run.status = 'completed'; run.finishedAt = now();
  }
  function resumeFlows() {
    FLOWRUNS.forEach((run) => {
      if (run.status !== 'waiting' || run.waitUntil > now()) return;
      const f = FLOWS.get(run.flowId);
      run.status = 'running';
      const node = f.nodes.find((n) => n.id === run.resumeNode);
      run.waitUntil = null; run.resumeNode = null;
      if (node) step(f, run, node); else { run.status = 'completed'; run.finishedAt = now(); }
    });
  }

  /* ============ 14. 내부 클록 ============ */
  function _tick(ms) {
    CLOCK += ms;
    pump();          // 웹훅 재시도 기한 도래분
    resumeFlows();   // delay 워크플로 재개
    SCHEDULES.forEach((s) => { // schedule 트리거
      while (s.nextAt <= now()) {
        const r = RULES.get(s.ruleId);
        if (r && r.enabled) runRule(r, null);
        s.nextAt += r ? r.trigger.everyMs : 60000;
      }
    });
  }

  /* ============ 15. SDK ============ */
  function sdk(auth) { // 실동작 JS SDK — 전 호출이 Gateway 통과
    const call = (method, path, body, query) => {
      const res = request({ method, path: '/' + (auth.version || CURRENT_VERSION) + path, headers: auth.apiKey ? { 'x-api-key': auth.apiKey } : { authorization: 'Bearer ' + auth.bearer }, body, query });
      if (res.status >= 400) { const e = new Error((res.body && res.body.error) || 'error'); e.status = res.status; e.body = res.body; throw e; }
      return res.body;
    };
    return {
      projects: { list: (q) => call('GET', '/projects', null, q), create: (b) => call('POST', '/projects', b), get: (pid) => call('GET', '/projects/' + pid), update: (pid, b) => call('PATCH', '/projects/' + pid, b), del: (pid) => call('DELETE', '/projects/' + pid), duplicate: (pid) => call('POST', '/projects/' + pid + '/duplicate'), archive: (pid) => call('POST', '/projects/' + pid + '/archive'), restore: (pid) => call('POST', '/projects/' + pid + '/restore'), save: (pid) => call('POST', '/projects/' + pid + '/save') },
      scenes: { create: (pid, b) => call('POST', '/projects/' + pid + '/scenes', b), del: (pid, sid) => call('DELETE', '/projects/' + pid + '/scenes/' + sid), duplicate: (pid, sid) => call('POST', '/projects/' + pid + '/scenes/' + sid + '/duplicate'), reorder: (pid, order) => call('POST', '/projects/' + pid + '/scenes/reorder', { order }), rename: (pid, sid, name) => call('PATCH', '/projects/' + pid + '/scenes/' + sid, { name }) },
      elements: { list: (pid, sid) => call('GET', '/projects/' + pid + '/scenes/' + sid + '/elements'), create: (pid, sid, b) => call('POST', '/projects/' + pid + '/scenes/' + sid + '/elements', b), update: (pid, sid, eid, b) => call('PATCH', '/projects/' + pid + '/scenes/' + sid + '/elements/' + eid, b), del: (pid, sid, eid) => call('DELETE', '/projects/' + pid + '/scenes/' + sid + '/elements/' + eid) },
      assets: { upload: (b) => call('POST', '/assets', b), get: (aid) => call('GET', '/assets/' + aid), download: (aid) => call('GET', '/assets/' + aid + '/download'), replace: (aid, b) => call('POST', '/assets/' + aid + '/replace', b), meta: (aid, b) => call('PATCH', '/assets/' + aid + '/metadata', b), search: (q) => call('GET', '/assets', null, { q }) },
      brands: { create: (b) => call('POST', '/brands', b), list: () => call('GET', '/brands'), get: (bid) => call('GET', '/brands/' + bid), update: (bid, b) => call('PATCH', '/brands/' + bid, b) },
      ai: { run: (b) => call('POST', '/ai', b), get: (jid) => call('GET', '/ai/' + jid) },
      render: { run: (pid, b) => call('POST', '/projects/' + pid + '/render', b), preview: (pid) => call('GET', '/projects/' + pid + '/preview'), thumbnail: (pid) => call('GET', '/projects/' + pid + '/thumbnail') },
      exports: { run: (pid, format) => call('POST', '/projects/' + pid + '/export', { format }), batch: (pid, formats) => call('POST', '/projects/' + pid + '/export/batch', { formats }) },
      search: (q) => call('GET', '/search', null, { q }),
    };
  }
  function sdkSnippet(lang, route) { // 문서용 샘플 코드 생성
    const path = '/v2' + route.path.replace(/:(\w+)/g, '{$1}');
    const bodyEx = route.schema ? JSON.stringify(Object.fromEntries(Object.entries(route.schema).map(([k, v]) => [k, v.enum ? v.enum[0] : '…']))) : null;
    if (lang === 'curl') return `curl -X ${route.method} https://api.keduclass.com${path} \\\n  -H "X-Api-Key: mk_live_…"${bodyEx ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyEx}'` : ''}`;
    if (lang === 'python') return `import kmaker\nclient = kmaker.Client(api_key="mk_live_…")\nresp = client.request("${route.method}", "${path}"${bodyEx ? `, json=${bodyEx}` : ''})`;
    return `const client = MK_API.sdk({ apiKey: 'mk_live_…' });\nconst resp = client.request('${route.method}', '${path}'${bodyEx ? `, ${bodyEx}` : ''});`;
  }

  /* ============ 16. CLI ============ */
  function cli(line, auth) {
    const argv = String(line || '').trim().split(/\s+/);
    if (argv[0] === 'mk') argv.shift();
    const cmd = argv.shift();
    const flags = {}; const pos = [];
    for (let i = 0; i < argv.length; i++) {
      if (argv[i].startsWith('--')) { const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; flags[argv[i - (v === true ? 0 : 1)].slice(2)] = v; }
      else pos.push(argv[i]);
    }
    const sub = pos[0];
    const s = sdk(auth || { apiKey: flags.key });
    try {
      if (cmd === 'login') return { ok: true, out: flags.key ? '로그인: ' + String(flags.key).slice(0, 12) + '…' : '오류: --key 필요' };
      if (cmd === 'projects' && sub === 'list') { const r = s.projects.list(); return { ok: true, out: r.items.map((x) => x.id + '  ' + x.name + '  v' + x.version).join('\n') || '(없음)' }; }
      if (cmd === 'projects' && sub === 'create') { const r = s.projects.create({ name: flags.name || '무제' }); return { ok: true, out: '생성: ' + r.id + ' ' + r.name }; }
      if (cmd === 'export') { const r = s.exports.run(flags.project, flags.format || 'pdf'); return { ok: true, out: '내보내기: ' + r.url }; }
      if (cmd === 'generate') { const r = s.ai.run({ op: sub || 'text', prompt: flags.prompt || '' }); return { ok: true, out: typeof r.output === 'string' ? r.output : JSON.stringify(r.output) }; }
      if (cmd === 'publish' && (sub === 'plugin' || sub === 'template')) return { ok: true, out: sub + ' 발행 요청 접수 — 마켓 심사 큐 등록(시뮬레이션)' };
      if (cmd === 'deploy') return { ok: true, out: '배포 파이프라인 트리거(시뮬레이션) — 대상: ' + (flags.target || 'production') };
      return { ok: false, out: '알 수 없는 명령: ' + [cmd, sub].filter(Boolean).join(' ') + '\n사용: mk login|projects list|projects create|export|generate|publish|deploy' };
    } catch (e) { return { ok: false, out: '오류 ' + (e.status || '') + ': ' + JSON.stringify(e.body || e.message) }; }
  }

  /* ============ 17. 모니터링 ============ */
  function monitor() {
    const keys = [...METRICS.entries()].map(([k, m]) => ({ key: k.slice(0, 14) + '…', count: m.count, errors: m.errors, avgMs: m.count ? +(m.latencySum / m.count).toFixed(2) : 0, maxMs: +m.latencyMax.toFixed(2), byStatus: m.byStatus, topRoutes: Object.entries(m.byRoute).sort((a, b) => b[1] - a[1]).slice(0, 5) }));
    const totals = keys.reduce((a, k) => ({ count: a.count + k.count, errors: a.errors + k.errors }), { count: 0, errors: 0 });
    return { keys, totals, hooks: [...HOOKS.values()].map((h) => ({ id: h.id, url: h.url, delivered: h.delivered, failed: h.failed, disabled: h.disabled })), dlq: DLQ.length, pending: PENDING.length, outbox: OUTBOX.length };
  }
  function quota(keyToken) {
    const k = KEYS.get(keyToken); const w = RL.get(keyToken) || { count: 0 };
    const limit = k ? RATE_TIERS[k.tier] : null;
    return { tier: k && k.tier, limit, used: w.count, remaining: limit ? Math.max(0, limit - w.count) : null };
  }

  /* ============ 18. 공개 표면 ============ */
  return {
    /* 상수 */ VERSIONS, CURRENT_VERSION, SCOPES, ELEMENT_TYPES, EXPORT_FORMATS, AI_OPS, EVENTS, RATE_TIERS, RETRY_SCHEDULE, SDK_LANGS, NODE_TYPES,
    /* 자격 */ registerApp, createKey, revokeKey, createPat, authorize, token, serviceJwt,
    /* 게이트웨이 */ request, openapi, routes: () => ROUTES.filter((r) => r.handler).map((r) => ({ method: r.method, path: r.path, scope: r.scope, summary: r.summary, versions: r.versions, schema: r.schema })),
    /* 웹훅·버스 */ createWebhook, redeliver, verifySignature, emit, registerHandler: (url, fn) => HANDLERS.set(url, fn),
    hooks: () => [...HOOKS.values()].map(clone), deliveries: (n) => DELIVERIES.slice(-(n || 50)).map(clone), dlq: () => DLQ.map(clone),
    /* 자동화 */ createRule, runRule: (rid) => { const r = RULES.get(rid); return r ? runRule(r, null) : { matched: false, why: '규칙 없음' }; },
    rules: () => [...RULES.values()].map(clone), runsLog: (n) => RUNS.slice(-(n || 50)).map(clone), triggerLogin, triggerMarketInstall,
    setRuleEnabled: (rid, on) => { const r = RULES.get(rid); if (!r) return { ok: false, why: '규칙 없음' }; r.enabled = !!on; return { ok: true }; },
    /* 워크플로 */ createFlow, runFlow, flows: () => [...FLOWS.values()].map(clone), flowRuns: () => [...FLOWRUNS.values()].map(clone), flowRun: (rid) => { const r = FLOWRUNS.get(rid); return r ? clone(r) : null; },
    /* SDK·CLI */ sdk, sdkSnippet, cli,
    /* 모니터링 */ monitor, quota, outbox: () => OUTBOX.map(clone), auditLog: (n) => AUDIT.slice(-(n || 50)).map(clone),
    /* 시간 */ _tick,
    /* 내부 조회(화면용) */ _apps: () => [...APPS.values()].map(clone), _keys: () => [...KEYS.values()].map((k) => ({ ...clone(k), token: k.token.slice(0, 16) + '…', _full: k.token })), _pats: () => [...PATS.values()].map((p) => ({ ...clone(p), token: p.token.slice(0, 14) + '…', _full: p.token })),
  };
})();
