/* ============================================================
   K-MAKER Enterprise Admin Console v1 — window.MK_ADMIN  (Round 19)
   ------------------------------------------------------------
   Organization → Workspace → Department → Team → User
   모든 정책은 이 계층을 따라 상속되고, 아래 층이 덮어쓴다.
   관리자 페이지가 아니라 "운영 플랫폼" — 사용자·권한·브랜드·
   스토리지·AI·라이선스·보안·감사·빌링을 한 엔진이 관장한다.
   ------------------------------------------------------------
   ⚠ 정직 표기: 전부 인메모리 결정론. 실 SSO(IdP)·실 DNS 조회·
   실 결제·실 백업 스토리지 없음 — 프로토콜 형태와 판정 로직만
   실규격으로 구현. 시간 의존 로직(세션 만료·자동 백업·DAU)은
   내부 클록(_tick)으로 결정론 검증 가능.
   ============================================================ */
window.MK_ADMIN = (() => {
  'use strict';

  /* ============ 0. 유틸 ============ */
  let CLOCK = 0;
  /* 오늘 정오 앵커 — ±11h 틱이 실행 시각에 따라 자정을 넘어
     일일 한도 창이 리셋되던 비결정론 제거 (R21 세션에서 수정) */
  const _B0 = Date.now();
  const ANCHOR = _B0 - (_B0 % 864e5) + 12 * 3600e3;
  const now = () => ANCHOR + CLOCK;
  const _tick = (ms) => { CLOCK += ms; ORGS.forEach((o) => runAutoBackup(o)); };
  let seq = 0;
  const id = (p) => p + '-' + (++seq).toString(36);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const day = (t) => new Date(t).toISOString().slice(0, 10);
  const month = (t) => day(t).slice(0, 7);
  const fail = (why) => ({ ok: false, why });

  /* ============ 1. 상수 ============ */
  const LAYERS = ['org', 'workspace', 'department', 'team', 'user'];
  const ROLES = ['super_admin', 'org_admin', 'workspace_admin', 'manager', 'editor', 'commenter', 'viewer', 'guest'];
  const ROLE_KO = { super_admin: '수퍼 관리자', org_admin: '조직 관리자', workspace_admin: '워크스페이스 관리자', manager: '매니저', editor: '편집자', commenter: '댓글자', viewer: '열람자', guest: '게스트' };
  const RESOURCES = ['project', 'template', 'asset', 'plugin', 'brand', 'ai', 'export', 'marketplace', 'storage', 'billing', 'analytics'];
  const ACTIONS = ['view', 'create', 'edit', 'delete', 'manage'];
  const PERM_KEYS = RESOURCES.flatMap((r) => ACTIONS.map((a) => r + '.' + a));
  const allPerms = () => PERM_KEYS.reduce((a, k) => (a[k] = true, a), {});
  const viewOnly = (rs) => rs.reduce((a, r) => (a[r + '.view'] = true, a), {});
  const MATRIX = {
    super_admin: allPerms(),
    org_admin: allPerms(),
    workspace_admin: (() => { const p = allPerms(); p['billing.manage'] = false; p['billing.edit'] = false; return p; })(),
    manager: Object.assign(viewOnly(RESOURCES), { 'project.create': true, 'project.edit': true, 'template.create': true, 'template.edit': true, 'asset.create': true, 'asset.edit': true, 'export.create': true, 'ai.create': true, 'analytics.view': true }),
    editor: Object.assign(viewOnly(['project', 'template', 'asset', 'brand', 'marketplace', 'plugin']), { 'project.create': true, 'project.edit': true, 'template.create': true, 'asset.create': true, 'asset.edit': true, 'export.create': true, 'ai.create': true }),
    commenter: viewOnly(['project', 'template', 'asset', 'brand']),
    viewer: viewOnly(['project', 'template', 'asset', 'brand']),
    guest: { 'project.view': true },
  };
  const DEPT_PRESETS = ['Marketing', 'Sales', 'Education', 'Science', 'HR', 'Finance'];
  const SSO_PROVIDERS = ['google', 'microsoft', 'apple', 'saml', 'oidc', 'enterprise'];
  const LICENSE_TYPES = ['seat', 'guest', 'education', 'enterprise', 'trial'];
  const PLANS = {
    free:       { name: 'Free',       seatPrice: 0,     seats: 5,      storage: 1e9,    aiTokens: 5e4,   aiRate: 0 },
    pro:        { name: 'Pro',        seatPrice: 12000, seats: 100,    storage: 100e9,  aiTokens: 1e6,   aiRate: 2 },
    education:  { name: 'Education',  seatPrice: 0,     seats: 2000,   storage: 500e9,  aiTokens: 5e6,   aiRate: 0 },
    enterprise: { name: 'Enterprise', seatPrice: 25000, seats: 100000, storage: 10e12,  aiTokens: 1e8,   aiRate: 1 },
  };
  const AI_MODELS = ['k-fast', 'k-standard', 'k-pro', 'k-vision'];
  const AUDIT_EVENTS = ['login', 'login.fail', 'login.sso', 'logout', 'user.create', 'user.invite', 'user.deactivate', 'user.delete', 'user.restore', 'user.lock', 'user.unlock', 'user.role', 'user.forceLogout', 'org.update', 'node.create', 'policy.set', 'perm.override', 'role.define', 'sso.config', 'domain.add', 'domain.verify', 'edit', 'delete', 'download', 'export', 'ai.use', 'plugin.install', 'storage.add', 'storage.release', 'license.assign', 'license.revoke', 'billing.invoice', 'billing.pay', 'backup.create', 'backup.restore', 'moderation.takedown', 'moderation.restore', 'security.lockout'];
  const NOTIF_TYPES = ['security', 'usage', 'storage', 'license', 'plugin'];
  const SESSION_MIN_DEFAULT = 720;

  /* ============ 2. Organization ============ */
  const ORGS = new Map();
  const org = (orgId) => { const o = ORGS.get(orgId); if (!o) throw new Error('조직 없음: ' + orgId); return o; };

  function createOrg(p) {
    if (!p || !p.name) return fail('조직 이름 필요');
    if (p.plan && !PLANS[p.plan]) return fail('알 수 없는 플랜');
    const orgId = p.orgId || id('org');
    if (ORGS.has(orgId)) return fail('조직 ID 중복');
    const o = {
      orgId, name: p.name, logo: p.logo || '🏢', domain: p.domain || '', industry: p.industry || '', country: p.country || 'KR',
      language: p.language || 'ko', timezone: p.timezone || 'Asia/Seoul', plan: p.plan || 'free', brandId: p.brandId || null,
      nodes: new Map(), users: new Map(), customRoles: new Map(), overrides: [],
      policies: { org: {}, node: new Map(), user: new Map() },
      sso: new Map(), domains: new Map(), domainPolicy: { autoJoin: false, restrictToVerified: false },
      audit: [], notifications: [], backups: [], autoBackupMs: 0, lastBackupAt: now(),
      ai: { deptQuota: new Map(), usage: [] }, storage: { items: new Map() },
      licenses: { pool: new Map(), assigned: new Map() },
      billing: { invoices: [], payments: [], taxInvoices: [] },
      metrics: { dau: new Map(), projects: 0, exports: 0, errors: 0, marketInstalls: 0 },
      loginFails: new Map(),
    };
    ORGS.set(orgId, o);
    audit(orgId, { actor: 'system', event: 'org.update', detail: '조직 생성: ' + p.name });
    return { ok: true, orgId };
  }
  function updateOrg(orgId, patch) {
    const o = org(orgId);
    const allowed = ['name', 'logo', 'domain', 'industry', 'country', 'language', 'timezone', 'plan', 'brandId'];
    if (patch.plan && !PLANS[patch.plan]) return fail('알 수 없는 플랜');
    for (const k of allowed) if (k in patch) o[k] = patch[k];
    audit(orgId, { actor: patch._actor || 'system', event: 'org.update', detail: Object.keys(patch).filter((k) => k[0] !== '_').join(',') });
    return { ok: true };
  }
  const getOrg = (orgId) => { const o = org(orgId); return { orgId: o.orgId, name: o.name, logo: o.logo, domain: o.domain, industry: o.industry, country: o.country, language: o.language, timezone: o.timezone, plan: o.plan, planInfo: clone(PLANS[o.plan]), brandId: o.brandId }; };
  const listOrgs = () => [...ORGS.values()].map((o) => ({ orgId: o.orgId, name: o.name, logo: o.logo, plan: o.plan, users: o.users.size }));

  /* ============ 3. 계층 (Workspace → Department → Team) ============ */
  const node = (o, nodeId) => o.nodes.get(nodeId) || null;
  function addNode(orgId, type, parentId, name) {
    const o = org(orgId);
    if (type !== 'workspace') {
      const p = node(o, parentId);
      const need = type === 'department' ? 'workspace' : 'department';
      if (!p || p.type !== need) return fail(need + ' 아래에만 생성 가능');
    }
    const n = { nodeId: id(type.slice(0, 2)), type, parentId: type === 'workspace' ? null : parentId, name, shares: { projects: [], brands: [], templates: [], assets: [] } };
    o.nodes.set(n.nodeId, n);
    audit(orgId, { actor: 'system', event: 'node.create', target: n.nodeId, detail: type + ': ' + name });
    return { ok: true, nodeId: n.nodeId };
  }
  const addWorkspace = (orgId, name) => addNode(orgId, 'workspace', null, name);
  const addDepartment = (orgId, wsId, name) => addNode(orgId, 'department', wsId, name);
  const addTeam = (orgId, deptId, name) => addNode(orgId, 'team', deptId, name);
  function chainOf(orgId, nodeId) { /* [ws, dept, team] 순 조상 사슬 */
    const o = org(orgId); const out = []; let cur = node(o, nodeId);
    while (cur) { out.unshift(cur); cur = cur.parentId ? node(o, cur.parentId) : null; }
    return out;
  }
  function tree(orgId) {
    const o = org(orgId);
    const kids = (pid) => [...o.nodes.values()].filter((n) => n.parentId === pid).map((n) => ({
      nodeId: n.nodeId, type: n.type, name: n.name,
      users: [...o.users.values()].filter((u) => u.nodeId === n.nodeId && u.state !== 'deleted').length,
      children: kids(n.nodeId) }));
    return [...o.nodes.values()].filter((n) => n.type === 'workspace').map((n) => ({
      nodeId: n.nodeId, type: 'workspace', name: n.name,
      users: [...o.users.values()].filter((u) => u.nodeId === n.nodeId && u.state !== 'deleted').length,
      children: kids(n.nodeId) }));
  }
  function share(orgId, nodeId, kind, refId) {
    const o = org(orgId); const n = node(o, nodeId);
    if (!n) return fail('노드 없음');
    const key = kind + 's';
    if (!n.shares[key]) return fail('공유 불가 종류');
    if (!n.shares[key].includes(refId)) n.shares[key].push(refId);
    return { ok: true, shares: clone(n.shares) };
  }
  const sharedWith = (orgId, userId, kind) => { /* 사용자가 속한 사슬 전체의 공유 합집합 */
    const o = org(orgId); const u = usr(o, userId); if (!u || !u.nodeId) return [];
    const set = new Set();
    for (const n of chainOf(orgId, u.nodeId)) for (const r of n.shares[kind + 's'] || []) set.add(r);
    return [...set];
  };

  /* ============ 4. 정책 — 계층 상속 ============ */
  const POLICY_KEYS = ['brandEnforced', 'pluginAllow', 'pluginBlock', 'exportFormats', 'marketAccess', 'aiModels', 'aiDailyTokens', 'storageQuota', 'sessionTimeoutMin', 'twoFactorRequired', 'ipAllow', 'deviceLimit', 'passwordPolicy'];
  function setPolicy(orgId, layer, targetId, patch) {
    const o = org(orgId);
    for (const k of Object.keys(patch)) if (!POLICY_KEYS.includes(k)) return fail('알 수 없는 정책 키: ' + k);
    let slot;
    if (layer === 'org') slot = o.policies.org;
    else if (layer === 'user') { if (!usr(o, targetId)) return fail('사용자 없음'); slot = o.policies.user.get(targetId) || {}; o.policies.user.set(targetId, slot); }
    else { if (!node(o, targetId)) return fail('노드 없음'); slot = o.policies.node.get(targetId) || {}; o.policies.node.set(targetId, slot); }
    Object.assign(slot, clone(patch));
    audit(orgId, { actor: 'system', event: 'policy.set', target: layer + ':' + (targetId || orgId), detail: Object.keys(patch).join(',') });
    return { ok: true };
  }
  function effectivePolicy(orgId, userId) { /* org → ws → dept → team → user 순 병합(아래가 덮음) */
    const o = org(orgId);
    const base = { sessionTimeoutMin: SESSION_MIN_DEFAULT, twoFactorRequired: false, marketAccess: true, deviceLimit: 0, pluginBlock: [], _trace: ['default'] };
    const merge = (p, tag) => { if (!p) return; for (const k of Object.keys(p)) base[k] = clone(p[k]); base._trace.push(tag); };
    merge(o.policies.org, 'org');
    const u = userId ? usr(o, userId) : null;
    if (u && u.nodeId) for (const n of chainOf(orgId, u.nodeId)) merge(o.policies.node.get(n.nodeId), n.type);
    if (u) merge(o.policies.user.get(u.userId), 'user');
    return base;
  }
  /* 정책 가드 — 화면·브리지가 부르는 실판정 */
  const pluginAllowed = (orgId, userId, pluginId) => {
    const p = effectivePolicy(orgId, userId);
    if ((p.pluginBlock || []).includes(pluginId)) return { ok: false, why: '정책상 차단된 플러그인' };
    if (p.pluginAllow && !p.pluginAllow.includes(pluginId)) return { ok: false, why: '허용 목록 외 플러그인' };
    return { ok: true };
  };
  const exportAllowed = (orgId, userId, fmt) => {
    const p = effectivePolicy(orgId, userId);
    if (p.exportFormats && !p.exportFormats.includes(fmt)) return { ok: false, why: '정책상 허용되지 않은 내보내기 형식: ' + fmt };
    return { ok: true };
  };
  const aiModelAllowed = (orgId, userId, model) => {
    const p = effectivePolicy(orgId, userId);
    if (p.aiModels && !p.aiModels.includes(model)) return { ok: false, why: '정책상 허용되지 않은 AI 모델: ' + model };
    return { ok: true };
  };
  const marketAllowed = (orgId, userId) => effectivePolicy(orgId, userId).marketAccess === false ? { ok: false, why: '마켓플레이스가 조직 정책으로 제한됨' } : { ok: true };
  const brandFor = (orgId, userId) => { const p = effectivePolicy(orgId, userId); return p.brandEnforced || null; };

  /* ============ 5. 사용자 ============ */
  const usr = (o, userId) => o.users.get(userId) || null;
  const byEmail = (o, email) => [...o.users.values()].find((u) => u.email === email && u.state !== 'deleted') || null;
  function pwCheck(policy, pw) {
    const p = policy || {}; pw = String(pw || '');
    if (p.min && pw.length < p.min) return fail(`비밀번호 ${p.min}자 이상`);
    if (p.upper && !/[A-Z]/.test(pw)) return fail('대문자 필요');
    if (p.digit && !/\d/.test(pw)) return fail('숫자 필요');
    if (p.special && !/[^A-Za-z0-9]/.test(pw)) return fail('특수문자 필요');
    return { ok: true };
  }
  function createUser(orgId, p) {
    const o = org(orgId);
    if (!p || !p.email) return fail('이메일 필요');
    if (byEmail(o, p.email)) return fail('이메일 중복');
    if (p.role && !ROLES.includes(p.role) && !o.customRoles.has(p.role)) return fail('알 수 없는 역할');
    if (o.domainPolicy.restrictToVerified) {
      const dom = String(p.email).split('@')[1];
      if (![...o.domains.values()].some((d) => d.verified && d.domain === dom)) return fail('인증된 도메인 계정만 가입 가능');
    }
    if (p.password) { const c = pwCheck(effectivePolicy(orgId, null).passwordPolicy, p.password); if (!c.ok) return c; }
    const u = { userId: id('u'), name: p.name || p.email.split('@')[0], email: p.email, role: p.role || 'viewer', nodeId: p.nodeId || null,
      state: p.state || 'active', createdAt: now(), deletedAt: 0, sessions: [], devices: p.devices || [], twoFactor: !!p.twoFactor, password: p.password || '', lastLogin: 0 };
    o.users.set(u.userId, u);
    audit(orgId, { actor: p._actor || 'system', event: 'user.create', target: u.userId, detail: u.email });
    return { ok: true, userId: u.userId };
  }
  function inviteUser(orgId, email, role, nodeId) {
    const r = createUser(orgId, { email, role, nodeId, state: 'invited' });
    if (r.ok) audit(orgId, { actor: 'system', event: 'user.invite', target: r.userId, detail: email });
    return r;
  }
  function acceptInvite(orgId, userId, password) {
    const o = org(orgId); const u = usr(o, userId);
    if (!u || u.state !== 'invited') return fail('초대 상태 아님');
    const c = pwCheck(effectivePolicy(orgId, userId).passwordPolicy, password); if (!c.ok) return c;
    u.state = 'active'; u.password = password;
    return { ok: true };
  }
  const setState = (orgId, userId, state, event, actor) => {
    const o = org(orgId); const u = usr(o, userId); if (!u) return fail('사용자 없음');
    u.state = state; if (state === 'deleted') u.deletedAt = now();
    audit(orgId, { actor: actor || 'system', event, target: userId, detail: u.email });
    return { ok: true };
  };
  const deactivateUser = (orgId, userId, actor) => setState(orgId, userId, 'inactive', 'user.deactivate', actor);
  function removeUser(orgId, userId, actor) { forceLogout(orgId, userId, actor); revokeLicense(orgId, userId, actor); return setState(orgId, userId, 'deleted', 'user.delete', actor); }
  function restoreUser(orgId, userId, actor) {
    const o = org(orgId); const u = usr(o, userId);
    if (!u || u.state !== 'deleted') return fail('삭제 상태 아님');
    if (byEmail(o, u.email)) return fail('같은 이메일의 활성 계정 존재');
    u.state = 'active'; u.deletedAt = 0;
    audit(orgId, { actor: actor || 'system', event: 'user.restore', target: userId, detail: u.email });
    return { ok: true };
  }
  const lockUser = (orgId, userId, actor) => setState(orgId, userId, 'locked', 'user.lock', actor);
  function unlockUser(orgId, userId, actor) { org(orgId).loginFails.delete(userId); return setState(orgId, userId, 'active', 'user.unlock', actor); }
  function forceLogout(orgId, userId, actor) {
    const o = org(orgId); const u = usr(o, userId); if (!u) return fail('사용자 없음');
    const n = u.sessions.length; u.sessions = [];
    audit(orgId, { actor: actor || 'system', event: 'user.forceLogout', target: userId, detail: n + '개 세션 종료' });
    return { ok: true, killed: n };
  }
  function setUserRole(orgId, userId, role, actor) {
    const o = org(orgId); const u = usr(o, userId); if (!u) return fail('사용자 없음');
    if (!ROLES.includes(role) && !o.customRoles.has(role)) return fail('알 수 없는 역할');
    const old = u.role; u.role = role;
    audit(orgId, { actor: actor || 'system', event: 'user.role', target: userId, detail: old + ' → ' + role });
    return { ok: true };
  }
  function assignToTeam(orgId, userId, nodeId) {
    const o = org(orgId); const u = usr(o, userId); if (!u) return fail('사용자 없음');
    if (nodeId && !node(o, nodeId)) return fail('노드 없음');
    u.nodeId = nodeId || null;
    return { ok: true };
  }
  const listUsers = (orgId, f) => {
    const o = org(orgId); f = f || {};
    return [...o.users.values()].filter((u) =>
      (f.state ? u.state === f.state : f.includeDeleted ? true : u.state !== 'deleted') &&
      (!f.role || u.role === f.role) && (!f.nodeId || u.nodeId === f.nodeId) &&
      (!f.q || (u.name + u.email).toLowerCase().includes(String(f.q).toLowerCase())))
      .map((u) => ({ userId: u.userId, name: u.name, email: u.email, role: u.role, nodeId: u.nodeId, state: u.state, twoFactor: u.twoFactor, sessions: u.sessions.length, lastLogin: u.lastLogin }));
  };

  /* ============ 6. 역할 & 권한 매트릭스 ============ */
  function defineRole(orgId, name, perms, base) {
    const o = org(orgId);
    if (ROLES.includes(name) || o.customRoles.has(name)) return fail('역할 이름 중복');
    for (const k of Object.keys(perms || {})) if (!PERM_KEYS.includes(k)) return fail('알 수 없는 권한 키: ' + k);
    const m = Object.assign({}, base && MATRIX[base] ? MATRIX[base] : {}, perms || {});
    o.customRoles.set(name, m);
    audit(orgId, { actor: 'system', event: 'role.define', detail: name });
    return { ok: true };
  }
  const roleMatrix = (orgId) => {
    const o = org(orgId); const out = {};
    for (const r of ROLES) out[r] = clone(MATRIX[r]);
    for (const [n, m] of o.customRoles) out[n] = clone(m);
    return out;
  };
  function setPermOverride(orgId, layer, targetId, who, perm, allow) {
    const o = org(orgId);
    if (!LAYERS.includes(layer)) return fail('알 수 없는 계층');
    if (!PERM_KEYS.includes(perm)) return fail('알 수 없는 권한 키');
    o.overrides.push({ layer, targetId: String(targetId || ''), who, perm, allow: !!allow });
    audit(orgId, { actor: 'system', event: 'perm.override', target: String(targetId || orgId), detail: `${who} ${perm}=${allow}` });
    return { ok: true };
  }
  function can(orgId, userId, perm, ctx) {
    const o = org(orgId); const u = usr(o, userId);
    if (!u || u.state !== 'active') return false;
    if (u.role === 'super_admin') return true;
    /* user → team → dept → ws → org 순으로 가까운 오버라이드 우선 */
    const chain = [{ layer: 'user', targetId: u.userId }];
    const nid = (ctx && ctx.nodeId) || u.nodeId;
    if (nid) for (const n of chainOf(orgId, nid).reverse()) chain.push({ layer: n.type, targetId: n.nodeId });
    chain.push({ layer: 'org', targetId: o.orgId });
    for (const c of chain) {
      const ov = o.overrides.find((v) => v.layer === c.layer && v.targetId === c.targetId && v.perm === perm && (v.who === u.role || v.who === u.userId));
      if (ov) return ov.allow;
    }
    const m = MATRIX[u.role] || o.customRoles.get(u.role) || {};
    return !!m[perm];
  }

  /* ============ 7. SSO ============ */
  function configureSSO(orgId, provider, cfg) {
    const o = org(orgId);
    if (!SSO_PROVIDERS.includes(provider)) return fail('알 수 없는 SSO 제공자');
    o.sso.set(provider, Object.assign({ enabled: true, defaultRole: 'viewer', clientId: '', issuer: '' }, cfg || {}));
    audit(orgId, { actor: 'system', event: 'sso.config', detail: provider });
    return { ok: true };
  }
  const ssoList = (orgId) => [...org(orgId).sso.entries()].map(([provider, c]) => Object.assign({ provider }, clone(c)));
  function ssoLogin(orgId, provider, claim) {
    const o = org(orgId); const cfg = o.sso.get(provider);
    if (!cfg || !cfg.enabled) return fail('SSO 미구성/비활성: ' + provider);
    let u = byEmail(o, claim.email);
    if (!u) {
      const dom = String(claim.email).split('@')[1];
      const verified = [...o.domains.values()].some((d) => d.verified && d.domain === dom);
      if (!(verified && o.domainPolicy.autoJoin)) return fail('계정 없음(자동 가입 조건 미충족)');
      const r = createUser(orgId, { email: claim.email, name: claim.name, role: cfg.defaultRole, state: 'active' });
      if (!r.ok) return r;
      u = usr(o, r.userId);
    }
    return openSession(o, u, claim, 'login.sso', provider);
  }

  /* ============ 8. 도메인 인증 ============ */
  function addDomain(orgId, domain) {
    const o = org(orgId);
    if (o.domains.has(domain)) return fail('이미 등록된 도메인');
    const token = 'kmaker-verify-' + id('tx');
    o.domains.set(domain, { domain, token, verified: false, at: 0 });
    audit(orgId, { actor: 'system', event: 'domain.add', detail: domain });
    return { ok: true, token };
  }
  function verifyDomain(orgId, domain, txtRecord) {
    const o = org(orgId); const d = o.domains.get(domain);
    if (!d) return fail('등록되지 않은 도메인');
    if (txtRecord !== d.token) return fail('TXT 레코드 불일치');
    d.verified = true; d.at = now();
    audit(orgId, { actor: 'system', event: 'domain.verify', detail: domain });
    return { ok: true };
  }
  const setDomainPolicy = (orgId, p) => { Object.assign(org(orgId).domainPolicy, p); return { ok: true }; };
  const domainList = (orgId) => [...org(orgId).domains.values()].map(clone);

  /* ============ 9. 보안 — 로그인·세션 ============ */
  const ipOk = (allow, ip) => !allow || !allow.length || allow.some((pre) => String(ip || '').startsWith(pre));
  function openSession(o, u, ctx, event, detail) {
    const pol = effectivePolicy(o.orgId, u.userId);
    if (u.state === 'locked') return fail('잠긴 계정');
    if (u.state !== 'active') return fail('비활성 계정');
    if (!ipOk(pol.ipAllow, ctx.ip)) { audit(o.orgId, { actor: u.userId, event: 'login.fail', detail: 'IP 차단 ' + ctx.ip, ip: ctx.ip }); return fail('허용되지 않은 IP'); }
    if (pol.deviceLimit && ctx.device) {
      if (!u.devices.includes(ctx.device)) {
        if (u.devices.length >= pol.deviceLimit) return fail('기기 제한 초과');
        u.devices.push(ctx.device);
      }
    }
    if (pol.twoFactorRequired || u.twoFactor) {
      if (ctx.otp !== '000000') { audit(o.orgId, { actor: u.userId, event: 'login.fail', detail: '2FA 실패', ip: ctx.ip }); return fail('2단계 인증 코드 필요/불일치'); }
    }
    const s = { token: id('ss'), at: now(), ip: ctx.ip || '', device: ctx.device || '', expiresAt: now() + (pol.sessionTimeoutMin || SESSION_MIN_DEFAULT) * 60e3 };
    u.sessions.push(s); u.lastLogin = now(); o.loginFails.delete(u.userId);
    const d = day(now());
    if (!o.metrics.dau.has(d)) o.metrics.dau.set(d, new Set());
    o.metrics.dau.get(d).add(u.userId);
    audit(o.orgId, { actor: u.userId, event, detail: detail || '', ip: ctx.ip });
    return { ok: true, token: s.token, expiresAt: s.expiresAt };
  }
  function login(orgId, email, password, ctx) {
    const o = org(orgId); const u = byEmail(o, email); ctx = ctx || {};
    if (!u) return fail('계정 없음');
    if (u.password !== password) {
      const n = (o.loginFails.get(u.userId) || 0) + 1; o.loginFails.set(u.userId, n);
      audit(orgId, { actor: u.userId, event: 'login.fail', detail: `비밀번호 불일치(${n}회)`, ip: ctx.ip });
      if (n >= 5 && u.state === 'active') {
        u.state = 'locked';
        audit(orgId, { actor: 'system', event: 'security.lockout', target: u.userId, detail: '5회 실패 자동 잠금' });
        notify(orgId, 'security', `${u.email} 5회 로그인 실패 — 자동 잠금`, 'warn');
      }
      return fail('비밀번호 불일치');
    }
    return openSession(o, u, ctx, 'login');
  }
  function sessionValid(orgId, userId, token) {
    const o = org(orgId); const u = usr(o, userId); if (!u) return false;
    const s = u.sessions.find((x) => x.token === token);
    return !!s && s.expiresAt > now() && u.state === 'active';
  }

  /* ============ 10. 감사 로그 ============ */
  function audit(orgId, e) {
    const o = ORGS.get(orgId); if (!o) return;
    o.audit.push({ at: now(), actor: e.actor || 'system', event: e.event, target: e.target || '', detail: e.detail || '', ip: e.ip || '' });
  }
  const auditQuery = (orgId, f) => {
    const o = org(orgId); f = f || {};
    let rows = o.audit.filter((r) =>
      (!f.event || r.event === f.event) && (!f.actor || r.actor === f.actor) &&
      (!f.from || r.at >= f.from) && (!f.to || r.at <= f.to) &&
      (!f.q || (r.event + r.detail + r.target).toLowerCase().includes(String(f.q).toLowerCase())));
    rows = rows.slice().reverse();
    return f.limit ? rows.slice(0, f.limit) : rows;
  };
  const auditCsv = (orgId, f) => ['at,actor,event,target,detail,ip']
    .concat(auditQuery(orgId, f).map((r) => [new Date(r.at).toISOString(), r.actor, r.event, r.target, JSON.stringify(r.detail), r.ip].join(','))).join('\n');

  /* ============ 11. AI 거버넌스 ============ */
  const setAIQuota = (orgId, deptId, dailyTokens) => { org(orgId).ai.deptQuota.set(deptId, dailyTokens); return { ok: true }; };
  function deptOf(orgId, userId) {
    const o = org(orgId); const u = usr(o, userId);
    if (!u || !u.nodeId) return null;
    return chainOf(orgId, u.nodeId).find((n) => n.type === 'department') || null;
  }
  function recordAI(orgId, userId, use) {
    const o = org(orgId); const model = use.model || 'k-standard'; const tokens = use.tokens || 0;
    const mchk = aiModelAllowed(orgId, userId, model); if (!mchk.ok) return mchk;
    const today = day(now());
    const pol = effectivePolicy(orgId, userId);
    const used = (who, f) => o.ai.usage.filter((r) => day(r.at) === today && f(r)).reduce((s, r) => s + r.tokens, 0);
    if (pol.aiDailyTokens && used(userId, (r) => r.userId === userId) + tokens > pol.aiDailyTokens) return fail('개인 일일 토큰 한도 초과');
    const dept = deptOf(orgId, userId);
    if (dept && o.ai.deptQuota.has(dept.nodeId)) {
      const inDept = (r) => { const d = deptOf(orgId, r.userId); return d && d.nodeId === dept.nodeId; };
      if (used(null, inDept) + tokens > o.ai.deptQuota.get(dept.nodeId)) return fail('부서 일일 할당량 초과: ' + dept.name);
    }
    const planCap = PLANS[o.plan].aiTokens;
    const monthUsed = o.ai.usage.filter((r) => month(r.at) === month(now())).reduce((s, r) => s + r.tokens, 0);
    if (monthUsed + tokens > planCap) return fail('플랜 월 토큰 한도 초과');
    o.ai.usage.push({ at: now(), userId, model, tokens });
    audit(orgId, { actor: userId, event: 'ai.use', detail: model + ' ' + tokens + 'tok' });
    return { ok: true };
  }
  const aiUsage = (orgId, by) => {
    const o = org(orgId); const agg = new Map();
    for (const r of o.ai.usage) {
      let k = r.userId;
      if (by === 'model') k = r.model;
      else if (by === 'department') { const d = deptOf(orgId, r.userId); k = d ? d.name : '(무소속)'; }
      agg.set(k, (agg.get(k) || 0) + r.tokens);
    }
    return [...agg.entries()].map(([key, tokens]) => ({ key, tokens })).sort((a, b) => b.tokens - a.tokens);
  };

  /* ============ 12. 스토리지 ============ */
  function recordStorage(orgId, item) {
    const o = org(orgId); const bytes = item.bytes || 0;
    const total = storageUsed(orgId);
    const planCap = PLANS[o.plan].storage;
    if (total + bytes > planCap) return fail('플랜 스토리지 한도 초과');
    if (item.userId) {
      const q = effectivePolicy(orgId, item.userId).storageQuota;
      if (q && storageUsed(orgId, { userId: item.userId }) + bytes > q) return fail('사용자 스토리지 쿼터 초과');
    }
    if (item.wsId) {
      const q = (o.policies.node.get(item.wsId) || {}).storageQuota;
      if (q && storageUsed(orgId, { wsId: item.wsId }) + bytes > q) return fail('워크스페이스 스토리지 쿼터 초과');
    }
    const refId = item.refId || id('st');
    o.storage.items.set(refId, { refId, userId: item.userId || '', wsId: item.wsId || '', kind: item.kind || 'asset', bytes, at: now() });
    audit(orgId, { actor: item.userId || 'system', event: 'storage.add', target: refId, detail: item.kind + ' ' + bytes + 'B' });
    if ((total + bytes) / planCap >= 0.9) notify(orgId, 'storage', `스토리지 90% 초과 (${Math.round((total + bytes) / planCap * 100)}%)`, 'warn');
    return { ok: true, refId };
  }
  function releaseStorage(orgId, refId) {
    const o = org(orgId); if (!o.storage.items.delete(refId)) return fail('항목 없음');
    audit(orgId, { actor: 'system', event: 'storage.release', target: refId });
    return { ok: true };
  }
  const storageUsed = (orgId, f) => {
    f = f || {};
    return [...org(orgId).storage.items.values()].filter((i) =>
      (!f.userId || i.userId === f.userId) && (!f.wsId || i.wsId === f.wsId) && (!f.kind || i.kind === f.kind))
      .reduce((s, i) => s + i.bytes, 0);
  };
  const storageReport = (orgId) => {
    const o = org(orgId); const by = (key) => {
      const m = new Map();
      for (const i of o.storage.items.values()) m.set(i[key] || '(없음)', (m.get(i[key] || '(없음)') || 0) + i.bytes);
      return [...m.entries()].map(([k, bytes]) => ({ key: k, bytes })).sort((a, b) => b.bytes - a.bytes);
    };
    return { total: storageUsed(orgId), cap: PLANS[o.plan].storage, byWorkspace: by('wsId'), byUser: by('userId'), byKind: by('kind') };
  };

  /* ============ 13. 라이선스 ============ */
  const setLicensePool = (orgId, type, seats) => {
    if (!LICENSE_TYPES.includes(type)) return fail('알 수 없는 라이선스 타입');
    org(orgId).licenses.pool.set(type, seats);
    return { ok: true };
  };
  function assignLicense(orgId, userId, type, actor) {
    const o = org(orgId);
    if (!LICENSE_TYPES.includes(type)) return fail('알 수 없는 라이선스 타입');
    if (!usr(o, userId)) return fail('사용자 없음');
    if (o.licenses.assigned.has(userId)) return fail('이미 라이선스 보유');
    const cap = o.licenses.pool.get(type) || 0;
    const used = [...o.licenses.assigned.values()].filter((l) => l.type === type).length;
    if (used >= cap) return fail('라이선스 좌석 소진: ' + type);
    const lic = { type, at: now(), expiresAt: type === 'trial' ? now() + 14 * 864e5 : 0 };
    o.licenses.assigned.set(userId, lic);
    audit(orgId, { actor: actor || 'system', event: 'license.assign', target: userId, detail: type });
    return { ok: true };
  }
  function revokeLicense(orgId, userId, actor) {
    const o = org(orgId); if (!o.licenses.assigned.delete(userId)) return fail('할당된 라이선스 없음');
    audit(orgId, { actor: actor || 'system', event: 'license.revoke', target: userId });
    return { ok: true };
  }
  const licenseReport = (orgId) => {
    const o = org(orgId);
    return LICENSE_TYPES.map((type) => {
      const cap = o.licenses.pool.get(type) || 0;
      const rows = [...o.licenses.assigned.entries()].filter(([, l]) => l.type === type);
      const expired = rows.filter(([, l]) => l.expiresAt && l.expiresAt < now()).length;
      return { type, cap, used: rows.length, expired };
    });
  };
  const licenseOf = (orgId, userId) => { const l = org(orgId).licenses.assigned.get(userId); return l ? clone(l) : null; };

  /* ============ 14. 빌링 ============ */
  function computeBill(orgId) {
    const o = org(orgId); const plan = PLANS[o.plan];
    const seats = [...o.licenses.assigned.values()].filter((l) => l.type === 'seat' || l.type === 'enterprise').length;
    const mTok = o.ai.usage.filter((r) => month(r.at) === month(now())).reduce((s, r) => s + r.tokens, 0);
    const overTok = Math.max(0, mTok - plan.aiTokens);
    const stor = storageUsed(orgId);
    const overGb = Math.max(0, Math.ceil((stor - plan.storage) / 1e9));
    const lines = [
      { item: `${plan.name} 좌석 × ${seats}`, amount: seats * plan.seatPrice },
      { item: `AI 초과 토큰 ${overTok.toLocaleString()}tok`, amount: Math.round(overTok / 1000) * plan.aiRate },
      { item: `스토리지 초과 ${overGb}GB`, amount: overGb * 100 },
    ].filter((l) => l.amount > 0 || l.item.startsWith(plan.name));
    const supply = lines.reduce((s, l) => s + l.amount, 0);
    return { lines, supply, vat: Math.round(supply * 0.1), total: supply + Math.round(supply * 0.1) };
  }
  function issueInvoice(orgId) {
    const o = org(orgId); const b = computeBill(orgId);
    const inv = Object.assign({ no: 'INV-' + (o.billing.invoices.length + 1).toString().padStart(4, '0'), at: now(), paid: false, period: month(now()) }, b);
    o.billing.invoices.push(inv);
    audit(orgId, { actor: 'system', event: 'billing.invoice', detail: inv.no + ' ₩' + inv.total });
    return { ok: true, invoice: clone(inv) };
  }
  function payInvoice(orgId, no) {
    const o = org(orgId); const inv = o.billing.invoices.find((i) => i.no === no);
    if (!inv) return fail('청구서 없음');
    if (inv.paid) return fail('이미 결제됨');
    inv.paid = true;
    o.billing.payments.push({ no, at: now(), amount: inv.total });
    audit(orgId, { actor: 'system', event: 'billing.pay', detail: no });
    return { ok: true };
  }
  function taxInvoice(orgId, no) {
    const o = org(orgId); const inv = o.billing.invoices.find((i) => i.no === no);
    if (!inv) return fail('청구서 없음');
    if (!inv.paid) return fail('결제 후 발행 가능');
    const t = { no: 'TAX-' + no, at: now(), supplier: 'K-MAKER(케이에듀)', supplierRegNo: '123-45-67890', buyer: o.name, buyerRegNo: o.domain || '-', supply: inv.supply, vat: inv.vat, total: inv.total, period: inv.period };
    o.billing.taxInvoices.push(t);
    return { ok: true, taxInvoice: clone(t) };
  }
  const billingReport = (orgId) => { const o = org(orgId); return { plan: o.plan, invoices: clone(o.billing.invoices), payments: clone(o.billing.payments), taxInvoices: clone(o.billing.taxInvoices), unpaid: o.billing.invoices.filter((i) => !i.paid).length }; };

  /* ============ 15. 분석 ============ */
  const recordEvent = (orgId, kind) => { const o = org(orgId); if (kind in o.metrics) o.metrics[kind]++; return { ok: true }; };
  const dau = (orgId, d) => (org(orgId).metrics.dau.get(d || day(now())) || new Set()).size;
  const mau = (orgId, m) => {
    const o = org(orgId); const mm = m || month(now()); const s = new Set();
    for (const [d, set] of o.metrics.dau) if (d.slice(0, 7) === mm) for (const u of set) s.add(u);
    return s.size;
  };
  const analytics = (orgId) => {
    const o = org(orgId);
    return { dau: dau(orgId), mau: mau(orgId), workspaces: [...o.nodes.values()].filter((n) => n.type === 'workspace').length,
      users: [...o.users.values()].filter((u) => u.state === 'active').length, projects: o.metrics.projects, exports: o.metrics.exports,
      aiTokens: o.ai.usage.reduce((s, r) => s + r.tokens, 0), storage: storageUsed(orgId),
      marketInstalls: o.metrics.marketInstalls };
  };

  /* ============ 16. 콘텐츠 심사 — MK_MARKET 브리지 ============ */
  const MKT = () => window.MK_MARKET || null;
  const moderationQueue = () => {
    const m = MKT(); if (!m) return { open: [], resolved: [] };
    return { open: m._reports.filter((r) => r.status === 'open').map((r) => ({ ...r })),
      resolved: m._reports.filter((r) => r.status !== 'open').map((r) => ({ ...r })) };
  };
  function takedown(orgId, itemId, actor, reportId) {
    const m = MKT(); if (!m) return fail('마켓 엔진 없음');
    try {
      if (reportId) m.resolveReport(reportId, 'takedown');
      else m.transition(itemId, 'deprecated', 'admin');
      audit(orgId, { actor: actor || 'system', event: 'moderation.takedown', target: itemId });
      return { ok: true };
    } catch (e) { return fail(e.message); }
  }
  function restoreItem(orgId, itemId, actor) {
    const m = MKT(); if (!m) return fail('마켓 엔진 없음');
    try {
      m.transition(itemId, 'published', 'admin');
      audit(orgId, { actor: actor || 'system', event: 'moderation.restore', target: itemId });
      return { ok: true };
    } catch (e) { return fail(e.message); }
  }

  /* ============ 17. 백업 ============ */
  function snapshotOf(o) {
    return JSON.stringify({
      profile: { name: o.name, plan: o.plan, domain: o.domain },
      nodes: [...o.nodes.entries()], users: [...o.users.entries()],
      policies: { org: o.policies.org, node: [...o.policies.node.entries()], user: [...o.policies.user.entries()] },
      overrides: o.overrides, customRoles: [...o.customRoles.entries()],
      licenses: { pool: [...o.licenses.pool.entries()], assigned: [...o.licenses.assigned.entries()] },
    });
  }
  const checksum = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h.toString(16); };
  function backup(orgId, label, auto) {
    const o = org(orgId); const data = snapshotOf(o);
    const b = { backupId: id('bk'), at: now(), label: label || (auto ? '자동 백업' : '수동 백업'), auto: !!auto, bytes: data.length, checksum: checksum(data), data };
    o.backups.push(b); o.lastBackupAt = now();
    audit(orgId, { actor: 'system', event: 'backup.create', target: b.backupId, detail: b.label });
    return { ok: true, backupId: b.backupId, checksum: b.checksum };
  }
  const setAutoBackup = (orgId, ms) => { org(orgId).autoBackupMs = ms; return { ok: true }; };
  function runAutoBackup(o) {
    if (o.autoBackupMs && now() - o.lastBackupAt >= o.autoBackupMs) backup(o.orgId, null, true);
  }
  function restoreBackup(orgId, backupId) {
    const o = org(orgId); const b = o.backups.find((x) => x.backupId === backupId);
    if (!b) return fail('백업 없음');
    if (checksum(b.data) !== b.checksum) return fail('백업 손상(체크섬 불일치)');
    const s = JSON.parse(b.data);
    o.name = s.profile.name; o.plan = s.profile.plan; o.domain = s.profile.domain;
    o.nodes = new Map(s.nodes); o.users = new Map(s.users);
    o.policies = { org: s.policies.org, node: new Map(s.policies.node), user: new Map(s.policies.user) };
    o.overrides = s.overrides; o.customRoles = new Map(s.customRoles);
    o.licenses = { pool: new Map(s.licenses.pool), assigned: new Map(s.licenses.assigned) };
    audit(orgId, { actor: 'system', event: 'backup.restore', target: backupId });
    return { ok: true };
  }
  const backupList = (orgId) => org(orgId).backups.map((b) => ({ backupId: b.backupId, at: b.at, label: b.label, auto: b.auto, bytes: b.bytes, checksum: b.checksum }));

  /* ============ 18. 알림 센터 ============ */
  function notify(orgId, type, text, level) {
    const o = ORGS.get(orgId); if (!o || !NOTIF_TYPES.includes(type)) return fail('알 수 없는 알림 타입');
    o.notifications.push({ notifId: id('nt'), at: now(), type, text, level: level || 'info', read: false });
    return { ok: true };
  }
  const notifications = (orgId, f) => {
    f = f || {};
    return org(orgId).notifications.filter((n) => (!f.type || n.type === f.type) && (!f.unread || !n.read)).slice().reverse();
  };
  const markRead = (orgId, notifId) => { const n = org(orgId).notifications.find((x) => x.notifId === notifId); if (!n) return fail('알림 없음'); n.read = true; return { ok: true }; };

  /* ============ 19. 관리자 대시보드 ============ */
  function checkAlerts(orgId) { /* 라이선스 만료·미결제 감시 → 알림 생성 */
    const o = org(orgId);
    for (const r of licenseReport(orgId)) if (r.expired) notify(orgId, 'license', `${r.type} 라이선스 ${r.expired}건 만료`, 'warn');
    if (o.billing.invoices.some((i) => !i.paid)) notify(orgId, 'usage', '미결제 청구서 존재', 'warn');
    return { ok: true };
  }
  function dashboard(orgId) {
    const o = org(orgId);
    const security = o.audit.filter((r) => r.event === 'login.fail' || r.event === 'security.lockout').length;
    return {
      recent: auditQuery(orgId, { limit: 8 }),
      analytics: analytics(orgId),
      storage: { used: storageUsed(orgId), cap: PLANS[o.plan].storage },
      securityEvents: security, errors: o.metrics.errors,
      warnings: notifications(orgId, { unread: true }).filter((n) => n.level === 'warn').length,
      licenses: licenseReport(orgId),
      unpaid: o.billing.invoices.filter((i) => !i.paid).length,
    };
  }

  /* ============ 20. API — 이름 고정 래퍼 ============ */
  const api = {
    org: { create: createOrg, get: getOrg, update: updateOrg, list: listOrgs, tree },
    user: { create: createUser, invite: inviteUser, list: listUsers, deactivate: deactivateUser, remove: removeUser, restore: restoreUser, lock: lockUser, unlock: unlockUser, forceLogout, setRole: setUserRole },
    role: { define: defineRole, matrix: roleMatrix, can, override: setPermOverride },
    analytics: { summary: analytics, dau, mau, event: recordEvent },
    billing: { compute: computeBill, invoice: issueInvoice, pay: payInvoice, tax: taxInvoice, report: billingReport },
    audit: { query: auditQuery, csv: auditCsv },
  };

  return {
    /* 상수 */
    LAYERS, ROLES, ROLE_KO, RESOURCES, ACTIONS, PERM_KEYS, DEPT_PRESETS, SSO_PROVIDERS, LICENSE_TYPES, PLANS, AI_MODELS, AUDIT_EVENTS, NOTIF_TYPES,
    /* Org · 계층 */
    createOrg, updateOrg, getOrg, listOrgs, addWorkspace, addDepartment, addTeam, tree, chainOf, share, sharedWith,
    /* 정책 */
    setPolicy, effectivePolicy, pluginAllowed, exportAllowed, aiModelAllowed, marketAllowed, brandFor,
    /* 사용자 */
    createUser, inviteUser, acceptInvite, deactivateUser, removeUser, restoreUser, lockUser, unlockUser, forceLogout, setUserRole, assignToTeam, listUsers,
    /* 역할·권한 */
    defineRole, roleMatrix, setPermOverride, can,
    /* SSO · 도메인 */
    configureSSO, ssoList, ssoLogin, addDomain, verifyDomain, setDomainPolicy, domainList,
    /* 보안 */
    login, sessionValid, pwCheck,
    /* 감사 */
    audit, auditQuery, auditCsv,
    /* AI · 스토리지 */
    setAIQuota, recordAI, aiUsage, recordStorage, releaseStorage, storageUsed, storageReport,
    /* 라이선스 · 빌링 */
    setLicensePool, assignLicense, revokeLicense, licenseReport, licenseOf,
    computeBill, issueInvoice, payInvoice, taxInvoice, billingReport,
    /* 분석 */
    recordEvent, dau, mau, analytics,
    /* 심사 · 백업 · 알림 */
    moderationQueue, takedown, restoreItem,
    backup, setAutoBackup, restoreBackup, backupList,
    notify, notifications, markRead, checkAlerts, dashboard,
    /* API */
    api,
    /* 테스트 */
    _tick, _now: now,
  };
})();
