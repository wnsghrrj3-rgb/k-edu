/* ============================================================
   K-MAKER Enterprise Team Workspace v1 — window.MK_TEAM  (Round 14)
   ------------------------------------------------------------
   Project는 개인 소유가 아니라 Workspace에 속한다.
     Organization → Workspace → Folder → Project → Scene → Element

   ★ 핵심 설계
     - 권한은 "역할표 × 계층 오버라이드" 단일 함수 can() 하나로 판정.
       화면·엔진·AI 모든 경로가 같은 함수를 부른다.
     - Version/Comment/Activity/Audit/Notification은 전부 이 모듈의
       기록 계층을 통과한다 — 기록 없는 변경 경로를 만들지 않는다.
     - Brand(Round 13)·Template(MK_TPL)·Asset(MK_ASSETS)은 소유권만
       Workspace로 이관하고 엔진은 무수정으로 그대로 쓴다.
   ============================================================ */
window.MK_TEAM = (() => {
  'use strict';
  const now = () => Date.now();
  const H = 3600e3, D = 24 * H;
  let seq = 0;
  const id = (p) => p + '-' + (++seq).toString(36) + now().toString(36).slice(-4);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ============================================================
     1. Role & Permission — §2 · §18
     ============================================================ */
  const ROLES = ['owner', 'admin', 'editor', 'commenter', 'viewer'];
  const PERM_KEYS = [
    'project.create', 'project.edit', 'project.delete', 'project.export',
    'brand.edit', 'asset.register', 'template.register', 'ai.use',
    'comment.write', 'comment.resolve', 'review.decide',
    'member.invite', 'member.manage', 'version.restore', 'audit.view', 'workspace.manage',
  ];
  /* 역할 기본표 — 권한을 각각 분리한다(지시서 §2) */
  const MATRIX = {
    owner:     PERM_KEYS.reduce((a, k) => (a[k] = true, a), {}),
    admin:     PERM_KEYS.reduce((a, k) => (a[k] = k !== 'workspace.manage', a), {}),
    editor:    { 'project.create': true, 'project.edit': true, 'project.export': true, 'asset.register': true, 'template.register': true, 'ai.use': true, 'comment.write': true, 'comment.resolve': true, 'version.restore': true },
    commenter: { 'comment.write': true },
    viewer:    {},
  };
  /* 계층 오버라이드 — element/scene/folder/project/workspace (§18) */
  const LAYERS = ['element', 'scene', 'project', 'folder', 'workspace'];
  const overrides = []; /* {layer, targetId, role|memberId, perm, allow} */
  function setLayerPerm(layer, targetId, who, perm, allow) {
    overrides.unshift({ layer, targetId: String(targetId), who, perm, allow: !!allow, at: now() });
    audit('perm.override', who, `${layer}:${targetId} ${perm}=${allow}`);
  }
  /* ctx = {element, scene, project, folder, workspace} 각 계층 id — 좁은 계층 우선 */
  function can(memberId, perm, ctx) {
    const m = member(memberId);
    if (!m) return false;
    ctx = ctx || {};
    for (const layer of LAYERS) {
      if (ctx[layer] == null) continue;
      const o = overrides.find((o) => o.layer === layer && o.targetId === String(ctx[layer]) && o.perm === perm && (o.who === m.role || o.who === m.memberId));
      if (o) return o.allow;
    }
    return !!MATRIX[m.role]?.[perm];
  }

  /* ============================================================
     2. Organization / Workspace / Member — §0 · §1 · §2
     ============================================================ */
  const ORG = {
    orgId: 'org-keduclass', name: 'K-EDU Class', domain: 'keduclass.com',
    logo: null, plan: 'Enterprise', brandId: 'bd-kmaker', created: now() - 200 * D,
  };
  const WS = []; /* workspace records */
  function wsBlank(over) {
    return Object.assign({
      wsId: id('ws'), orgId: ORG.orgId, name: '새 워크스페이스', description: '',
      ownerId: 'me', brandId: ORG.brandId, created: now(), updated: now(),
      members: [], folders: [], assets: [], templates: [],
      storageMB: 0, aiCredits: { used: 0, quota: 5000 },
    }, over || {});
  }
  const ws = (wsId) => WS.find((w) => w.wsId === (wsId || cur.wsId)) || null;
  const member = (memberId, wsId) => ws(wsId)?.members.find((m) => m.memberId === memberId) || null;
  function addMember(wsId, over) {
    const w = ws(wsId); if (!w) return null;
    const m = Object.assign({ memberId: id('mb'), name: '이름 없음', email: '', role: 'viewer', color: '#6B7280', joined: now(), state: 'offline' }, over || {});
    w.members.push(m);
    activity(m.memberId, 'member.join', w.name, { workspace: w.wsId });
    return m;
  }
  function setRole(actorId, memberId, role) {
    if (!can(actorId, 'member.manage', { workspace: cur.wsId })) return { ok: false, why: '권한 없음' };
    if (!ROLES.includes(role)) return { ok: false, why: '알 수 없는 역할' };
    const m = member(memberId); if (!m) return { ok: false, why: '멤버 없음' };
    if (m.role === 'owner') return { ok: false, why: 'Owner 역할은 이전으로만 변경' };
    const old = m.role; m.role = role;
    activity(actorId, 'member.role', `${m.name}: ${old} → ${role}`, { workspace: cur.wsId });
    notify(memberId, 'role', `역할이 ${role}(으)로 변경되었습니다`);
    return { ok: true, member: m };
  }
  function removeMember(actorId, memberId) {
    if (!can(actorId, 'member.manage', { workspace: cur.wsId })) return { ok: false, why: '권한 없음' };
    const w = ws(); const i = w.members.findIndex((m) => m.memberId === memberId);
    if (i < 0) return { ok: false, why: '멤버 없음' };
    if (w.members[i].role === 'owner') return { ok: false, why: 'Owner는 제거 불가' };
    const [m] = w.members.splice(i, 1);
    activity(actorId, 'member.remove', m.name, { workspace: w.wsId });
    return { ok: true };
  }

  /* ============================================================
     3. Invite — §3 (이메일·링크·조직 / 자동·관리자·도메인 승인)
     ============================================================ */
  const INVITES = [];
  const APPROVE_MODES = ['auto', 'admin', 'domain'];
  function invite(actorId, kind, target, role, approveMode) {
    if (!can(actorId, 'member.invite', { workspace: cur.wsId })) return { ok: false, why: '초대 권한 없음' };
    approveMode = APPROVE_MODES.includes(approveMode) ? approveMode : 'admin';
    const iv = { inviteId: id('iv'), wsId: cur.wsId, kind, target, role: ROLES.includes(role) ? role : 'viewer', approveMode, status: 'pending', by: actorId, at: now() };
    /* 자동 승인 · 도메인 승인(조직 도메인 일치 시 즉시) */
    if (approveMode === 'auto') iv.status = 'accepted';
    if (approveMode === 'domain' && kind === 'email' && String(target).endsWith('@' + ORG.domain)) iv.status = 'accepted';
    INVITES.unshift(iv);
    if (iv.status === 'accepted') acceptInvite(iv);
    else notifyRole('admin', 'invite', `승인 대기 초대: ${target}`);
    activity(actorId, 'invite.send', `${kind}:${target} (${iv.approveMode})`, { workspace: cur.wsId });
    return { ok: true, invite: iv };
  }
  function decideInvite(actorId, inviteId, accept) {
    if (!can(actorId, 'member.invite', { workspace: cur.wsId })) return { ok: false, why: '권한 없음' };
    const iv = INVITES.find((x) => x.inviteId === inviteId && x.status === 'pending');
    if (!iv) return { ok: false, why: '대기 중 초대 없음' };
    iv.status = accept ? 'accepted' : 'rejected'; iv.decidedBy = actorId;
    if (accept) acceptInvite(iv);
    activity(actorId, 'invite.' + iv.status, iv.target, { workspace: cur.wsId });
    return { ok: true, invite: iv };
  }
  function acceptInvite(iv) {
    const name = iv.kind === 'link' ? '링크 참여자' : String(iv.target).split('@')[0];
    const m = addMember(iv.wsId, { name, email: iv.kind === 'email' ? iv.target : '', role: iv.role, color: '#3B5BDB' });
    notify(m.memberId, 'invite', `${ws(iv.wsId).name} 워크스페이스에 참여했습니다`);
    return m;
  }

  /* ============================================================
     4. Folder — §4 (Project는 Folder 안에 저장)
     ============================================================ */
  const FOLDER_SEED = ['Marketing', 'Sales', 'Education', 'Internal', 'Presentation', 'Archive'];
  const PROJ_FOLDER = {}; /* projectId → folderId */
  function folders(wsId) { return ws(wsId)?.folders || []; }
  function addFolder(wsId, name) {
    const w = ws(wsId); if (!w) return null;
    const f = { folderId: id('fd'), name, created: now() };
    w.folders.push(f); return f;
  }
  function moveProject(actorId, pid, folderId) {
    if (!can(actorId, 'project.edit', { project: pid, workspace: cur.wsId })) return { ok: false, why: '권한 없음' };
    const f = folders().find((x) => x.folderId === folderId);
    if (!f) return { ok: false, why: '폴더 없음' };
    PROJ_FOLDER[pid] = folderId;
    activity(actorId, 'project.move', `→ ${f.name}`, { project: pid, folder: folderId });
    return { ok: true };
  }
  const folderOf = (pid) => folders().find((f) => f.folderId === PROJ_FOLDER[pid]) || null;
  const projectsIn = (folderId) => (window.MK_PROJ ? window.MK_PROJ.list('recent') : []).filter((p) => PROJ_FOLDER[p.projectId] === folderId);

  /* ============================================================
     5. Comment — §9 (Element·Scene·Project / Reply·Resolve·Mention)
     ============================================================ */
  const COMMENTS = [];
  const MENTION_RE = /@([\w가-힣.\-]+)/g;
  function parseMentions(text) {
    const w = ws(); const out = [];
    for (const m of String(text).matchAll(MENTION_RE)) {
      const hit = w.members.find((x) => x.name === m[1] || x.email.split('@')[0] === m[1] || x.memberId === m[1]);
      if (hit) out.push(hit.memberId);
    }
    return out;
  }
  function comment(actorId, target, text) {
    /* target = {type:'element'|'scene'|'project', projectId, sceneId?, elIdx?} */
    if (!can(actorId, 'comment.write', { project: target.projectId, workspace: cur.wsId })) return { ok: false, why: '댓글 권한 없음' };
    const c = { commentId: id('cm'), ...target, by: actorId, text: String(text), at: now(), resolved: false, replies: [], mentions: parseMentions(text) };
    COMMENTS.unshift(c);
    c.mentions.forEach((mid) => notify(mid, 'mention', `${member(actorId)?.name || '누군가'}님이 회원님을 멘션했습니다`, { commentId: c.commentId }));
    notifyOthers(actorId, 'comment', `새 댓글: ${c.text.slice(0, 30)}`, { commentId: c.commentId });
    activity(actorId, 'comment.write', c.text.slice(0, 40), { project: target.projectId, scene: target.sceneId });
    return { ok: true, comment: c };
  }
  function reply(actorId, commentId, text) {
    const c = COMMENTS.find((x) => x.commentId === commentId);
    if (!c) return { ok: false, why: '댓글 없음' };
    if (!can(actorId, 'comment.write', { project: c.projectId, workspace: cur.wsId })) return { ok: false, why: '권한 없음' };
    const r = { by: actorId, text: String(text), at: now(), mentions: parseMentions(text) };
    c.replies.push(r);
    r.mentions.forEach((mid) => notify(mid, 'mention', '답글에서 멘션되었습니다', { commentId }));
    notify(c.by, 'comment', '내 댓글에 답글이 달렸습니다', { commentId });
    return { ok: true, reply: r };
  }
  function resolve(actorId, commentId, on = true) {
    const c = COMMENTS.find((x) => x.commentId === commentId);
    if (!c) return { ok: false, why: '댓글 없음' };
    if (!can(actorId, 'comment.resolve', { project: c.projectId, workspace: cur.wsId })) return { ok: false, why: '해결 권한 없음' };
    c.resolved = !!on; c.resolvedBy = actorId;
    activity(actorId, 'comment.resolve', c.text.slice(0, 30), { project: c.projectId });
    return { ok: true };
  }
  const commentsFor = (projectId, sceneId) => COMMENTS.filter((c) => c.projectId === projectId && (sceneId == null || c.sceneId === sceneId));

  /* ============================================================
     6. Review Mode — §10 (Comment Only / Approve / Reject / Changes)
     ============================================================ */
  const REVIEWS = {}; /* pid → {mode, decisions:[]} */
  function setReview(actorId, pid, on) {
    if (!can(actorId, 'project.edit', { project: pid, workspace: cur.wsId })) return { ok: false, why: '권한 없음' };
    REVIEWS[pid] = REVIEWS[pid] || { decisions: [] };
    REVIEWS[pid].mode = on ? 'comment-only' : null;
    activity(actorId, on ? 'review.open' : 'review.close', '', { project: pid });
    if (on) notifyOthers(actorId, 'approval', '검토 요청이 도착했습니다', { projectId: pid });
    return { ok: true };
  }
  function decide(actorId, pid, verdict, note) {
    /* verdict: approve | reject | changes */
    if (!can(actorId, 'review.decide', { project: pid, workspace: cur.wsId })) return { ok: false, why: '승인 권한 없음' };
    if (!REVIEWS[pid] || !REVIEWS[pid].mode) return { ok: false, why: 'Review Mode 아님' };
    const d = { by: actorId, verdict, note: note || '', at: now() };
    REVIEWS[pid].decisions.unshift(d);
    if (verdict === 'approve') REVIEWS[pid].mode = 'approved';
    activity(actorId, 'review.' + verdict, note || '', { project: pid });
    notifyOthers(actorId, 'approval', `검토 결과: ${verdict}`, { projectId: pid });
    return { ok: true, decision: d };
  }
  const review = (pid) => REVIEWS[pid] || null;
  const isReadOnly = (pid) => !!REVIEWS[pid] && REVIEWS[pid].mode === 'comment-only';

  /* ============================================================
     7. Version History — §11 (자동 저장·Revision·Restore·Diff·이름)
     ============================================================ */
  const VERSIONS = {}; /* pid → [{verId, name, auto, by, at, doc}] */
  function snapshot(actorId, pid, doc, name, auto) {
    const list = VERSIONS[pid] = VERSIONS[pid] || [];
    const prev = list[0];
    /* 자동 저장은 내용이 같으면 중복 스냅샷을 만들지 않는다 */
    const body = JSON.stringify(doc);
    if (auto && prev && prev._body === body) return prev;
    const v = { verId: id('vr'), pid, name: name || (auto ? '자동 저장' : 'Revision ' + (list.length + 1)), auto: !!auto, by: actorId, at: now(), doc: clone(doc), _body: body };
    list.unshift(v);
    if (list.length > 50) list.length = 50;
    if (!auto) notifyOthers(actorId, 'version', `새 버전: ${v.name}`, { projectId: pid });
    activity(actorId, 'version.save', v.name, { project: pid });
    return v;
  }
  function restoreVersion(actorId, pid, verId) {
    if (!can(actorId, 'version.restore', { project: pid, workspace: cur.wsId })) return { ok: false, why: '복원 권한 없음' };
    const v = (VERSIONS[pid] || []).find((x) => x.verId === verId);
    if (!v) return { ok: false, why: '버전 없음' };
    activity(actorId, 'version.restore', v.name, { project: pid });
    return { ok: true, doc: clone(v.doc), version: v };
  }
  function diff(a, b) {
    /* Scene 단위 → Element 단위 변경 요약 */
    const out = { scenes: { added: [], removed: [], changed: [] }, elements: 0, texts: [] };
    const ai = new Map((a.scenes || []).map((s) => [s.id, s]));
    const bi = new Map((b.scenes || []).map((s) => [s.id, s]));
    for (const idx of bi.keys()) if (!ai.has(idx)) out.scenes.added.push(idx);
    for (const idx of ai.keys()) if (!bi.has(idx)) out.scenes.removed.push(idx);
    for (const [sid, sa] of ai) {
      const sb = bi.get(sid); if (!sb) continue;
      const ea = sa.elements || [], eb = sb.elements || [];
      let changed = Math.abs(ea.length - eb.length);
      for (let i = 0; i < Math.min(ea.length, eb.length); i++) {
        if (JSON.stringify(ea[i]) !== JSON.stringify(eb[i])) {
          changed++;
          if (ea[i].kind === 'text' && eb[i].kind === 'text' && ea[i].text !== eb[i].text) out.texts.push({ scene: sid, from: ea[i].text, to: eb[i].text });
        }
      }
      if (changed || sa.background !== sb.background) out.scenes.changed.push({ id: sid, elements: changed, background: sa.background !== sb.background });
      out.elements += changed;
    }
    return out;
  }
  const versions = (pid) => (VERSIONS[pid] || []).map(({ _body, doc, ...v }) => v);
  const versionDoc = (pid, verId) => clone((VERSIONS[pid] || []).find((v) => v.verId === verId)?.doc || null);

  /* ============================================================
     8. Activity & Audit — §12 · §20 (누가·언제·무엇을)
     ============================================================ */
  const ACTIVITY = [], AUDIT = [];
  function activity(who, action, detail, target) {
    const a = { at: now(), who, action, detail: String(detail || ''), target: target || {} };
    ACTIVITY.unshift(a); if (ACTIVITY.length > 500) ACTIVITY.length = 500;
    AUDIT.unshift(a);    if (AUDIT.length > 5000) AUDIT.length = 5000;
    return a;
  }
  const audit = (action, who, detail) => activity(who, action, detail, {});
  function auditQuery(q) {
    q = q || {};
    return AUDIT.filter((a) =>
      (!q.who || a.who === q.who) &&
      (!q.action || a.action.startsWith(q.action)) &&
      (!q.from || a.at >= q.from) && (!q.to || a.at <= q.to) &&
      (!q.text || (a.detail + ' ' + a.action).toLowerCase().includes(q.text.toLowerCase())));
  }
  const auditExport = (q) => JSON.stringify({ org: ORG.orgId, exportedAt: now(), rows: auditQuery(q) }, null, 2);

  /* ============================================================
     9. Notification — §16 (댓글·멘션·승인·공유·초대·버전)
     ============================================================ */
  const NOTIF = {}; /* memberId → [] */
  function notify(memberId, kind, text, ref) {
    const list = NOTIF[memberId] = NOTIF[memberId] || [];
    list.unshift({ notifId: id('nt'), kind, text, ref: ref || {}, at: now(), read: false });
    if (list.length > 100) list.length = 100;
  }
  const notifyOthers = (actorId, kind, text, ref) => ws()?.members.forEach((m) => { if (m.memberId !== actorId) notify(m.memberId, kind, text, ref); });
  const notifyRole = (role, kind, text) => ws()?.members.forEach((m) => { if (m.role === role || m.role === 'owner') notify(m.memberId, kind, text); });
  const notifications = (memberId) => NOTIF[memberId] || [];
  const markRead = (memberId, notifId) => { const n = (NOTIF[memberId] || []).find((x) => x.notifId === notifId || notifId === '*'); if (notifId === '*') (NOTIF[memberId] || []).forEach((x) => x.read = true); else if (n) n.read = true; };
  const unread = (memberId) => (NOTIF[memberId] || []).filter((n) => !n.read).length;

  /* ============================================================
     10. Shared Asset · Template · Brand — §13~15
     ============================================================ */
  function shareAsset(actorId, asset) {
    if (!can(actorId, 'asset.register', { workspace: cur.wsId })) return { ok: false, why: '에셋 등록 권한 없음' };
    const a = Object.assign({ assetId: id('as'), by: actorId, at: now() }, asset);
    ws().assets.unshift(a);
    notifyOthers(actorId, 'share', `공유 에셋 추가: ${a.name || a.assetId}`);
    activity(actorId, 'asset.share', a.name || '', { workspace: cur.wsId });
    return { ok: true, asset: a };
  }
  function shareTemplate(actorId, tplMeta, scope) {
    if (!can(actorId, 'template.register', { workspace: cur.wsId })) return { ok: false, why: '템플릿 등록 권한 없음' };
    const t = Object.assign({ shareId: id('tp'), by: actorId, at: now(), scope: ['workspace', 'organization', 'public'].includes(scope) ? scope : 'workspace' }, tplMeta);
    ws().templates.unshift(t);
    notifyOthers(actorId, 'share', `공유 템플릿: ${t.name || t.templateId} (${t.scope})`);
    activity(actorId, 'template.share', `${t.name || ''} → ${t.scope}`, { workspace: cur.wsId });
    return { ok: true, template: t };
  }
  function setWorkspaceBrand(actorId, brandId) {
    if (!can(actorId, 'brand.edit', { workspace: cur.wsId })) return { ok: false, why: '브랜드 수정 권한 없음' };
    const B = window.MK_BRAND;
    if (B && !B.get(brandId)) return { ok: false, why: '브랜드 없음' };
    ws().brandId = brandId;
    if (B) B.setActive(brandId); /* Round 13 활성 브랜드 = 워크스페이스 기본 브랜드 (§15 자동 적용) */
    activity(actorId, 'brand.set', brandId, { workspace: cur.wsId });
    notifyOthers(actorId, 'share', '워크스페이스 기본 브랜드가 변경되었습니다');
    return { ok: true };
  }

  /* ============================================================
     11. Offline & Sync — §19 (오프라인 편집·재접속 Sync·충돌 해소)
     ============================================================ */
  const offline = { on: false, queue: [] };
  function goOffline() { offline.on = true; }
  function queueOp(actorId, pid, op) {
    /* op = {sceneId, elIdx, field, value, baseAt} */
    offline.queue.push({ actorId, pid, op: clone(op), at: now() });
    return offline.queue.length;
  }
  function goOnline(getDoc) {
    /* 필드 단위 last-write-wins + 충돌 리포트.
       서버 측 변경(baseAt 이후 같은 필드가 이미 바뀐 경우)은 conflict로 표기하되
       로컬 값을 채택(LWW)하고 리포트에 양쪽 값을 남긴다. */
    offline.on = false;
    const report = { applied: 0, conflicts: [] };
    for (const q of offline.queue) {
      const doc = getDoc(q.pid); if (!doc) continue;
      const s = (doc.scenes || []).find((x) => x.id === q.op.sceneId); if (!s) continue;
      const el = s.elements?.[q.op.elIdx]; if (!el) continue;
      const serverVal = el[q.op.field];
      const conflicted = doc._touched && doc._touched[`${q.op.sceneId}.${q.op.elIdx}.${q.op.field}`] > q.op.baseAt;
      if (conflicted) report.conflicts.push({ ...q.op, server: serverVal, local: q.op.value });
      el[q.op.field] = q.op.value;
      (doc._touched = doc._touched || {})[`${q.op.sceneId}.${q.op.elIdx}.${q.op.field}`] = now();
      report.applied++;
      activity(q.actorId, 'sync.apply', `${q.op.field} (${conflicted ? '충돌-LWW' : '정상'})`, { project: q.pid, scene: q.op.sceneId });
    }
    offline.queue.length = 0;
    return report;
  }

  /* ============================================================
     12. Search — §22 (Project·Scene·Text·Comment·Template·Asset·Brand)
     ============================================================ */
  function search(q) {
    q = String(q || '').toLowerCase().trim();
    const hit = (s) => String(s || '').toLowerCase().includes(q);
    const out = { q, projects: [], scenes: [], texts: [], comments: [], templates: [], assets: [], brands: [] };
    if (!q) return out;
    const projs = window.MK_PROJ ? window.MK_PROJ.list('recent') : [];
    for (const p of projs) {
      if (hit(p.name)) out.projects.push({ projectId: p.projectId, name: p.name });
      for (const s of p.doc?.scenes || []) {
        if (hit(s.name)) out.scenes.push({ projectId: p.projectId, sceneId: s.id, name: s.name });
        for (const el of s.elements || []) if (el.kind === 'text' && hit(el.text)) out.texts.push({ projectId: p.projectId, sceneId: s.id, text: el.text });
      }
    }
    for (const c of COMMENTS) if (hit(c.text)) out.comments.push({ commentId: c.commentId, text: c.text, projectId: c.projectId });
    for (const t of ws()?.templates || []) if (hit(t.name)) out.templates.push(t);
    for (const a of ws()?.assets || []) if (hit(a.name)) out.assets.push(a);
    if (window.MK_BRAND) for (const b of window.MK_BRAND.list()) if (hit(b.name)) out.brands.push({ brandId: b.brandId, name: b.name });
    out.total = out.projects.length + out.scenes.length + out.texts.length + out.comments.length + out.templates.length + out.assets.length + out.brands.length;
    return out;
  }

  /* ============================================================
     13. Dashboard — §21
     ============================================================ */
  function dashboard() {
    const w = ws();
    const projs = window.MK_PROJ ? window.MK_PROJ.list('recent') : [];
    return {
      workspace: { name: w.name, members: w.members.length, brandId: w.brandId },
      recentProjects: projs.slice(0, 5).map((p) => ({ projectId: p.projectId, name: p.name, folder: folderOf(p.projectId)?.name || '—', updatedAt: p.updatedAt })),
      recentActivity: ACTIVITY.slice(0, 8),
      openComments: COMMENTS.filter((c) => !c.resolved).length,
      pendingApprovals: Object.entries(REVIEWS).filter(([, r]) => r.mode === 'comment-only').length,
      pendingInvites: INVITES.filter((i) => i.status === 'pending').length,
      ai: { ...w.aiCredits },
      storage: { usedMB: w.storageMB, quotaMB: 10240 },
      versions: Object.values(VERSIONS).reduce((a, l) => a + l.length, 0),
    };
  }

  /* ============================================================
     14. AI Collaboration — §17 (Workspace Context 이해)
        MK_AIED 앞단 전처리 — 워크스페이스 문맥 명령을 해석해 위임
     ============================================================ */
  function aiContext(prompt, pid) {
    const p = String(prompt);
    if (/(우리\s*(회사|학교|조직)|브랜드)\s*(스타일|규칙)/.test(p)) {
      const brandId = ws().brandId;
      return { intent: 'brand.apply', brandId, say: `워크스페이스 기본 브랜드(${brandId}) 적용` };
    }
    const fd = folders().find((f) => p.includes(f.name) || (f.name === 'Marketing' && /마케팅/.test(p)) || (f.name === 'Education' && /교육/.test(p)) || (f.name === 'Sales' && /영업|세일즈/.test(p)));
    if (fd && /(팀|폴더|발표|자료)/.test(p)) {
      return { intent: 'folder.reference', folderId: fd.folderId, projects: projectsIn(fd.folderId).map((x) => x.projectId), say: `${fd.name} 폴더 참고` };
    }
    if (/(지난|이전)\s*버전.*(비교|diff)/i.test(p) && pid) {
      const vs = VERSIONS[pid] || [];
      if (vs.length >= 2) return { intent: 'version.diff', a: vs[1].verId, b: vs[0].verId, diff: diff(vs[1].doc, vs[0].doc), say: '지난 버전과 비교' };
      return { intent: 'version.diff', say: '비교할 이전 버전이 아직 없음' };
    }
    return { intent: 'passthrough' };
  }

  /* ============================================================
     15. Seed — 조직 1 · 워크스페이스 2 · 멤버 5 · 폴더 6
     ============================================================ */
  const cur = { wsId: null, me: 'me' };
  function seed() {
    if (WS.length) return;
    const w1 = wsBlank({ wsId: 'ws-design', name: '디자인팀 워크스페이스', description: 'K-MAKER 제작·검수 협업 공간', storageMB: 1843 });
    const w2 = wsBlank({ wsId: 'ws-class', name: '금성초 교사 워크스페이스', description: '학년별 수업자료 공동 제작', storageMB: 412 });
    WS.push(w1, w2);
    cur.wsId = 'ws-design';
    FOLDER_SEED.forEach((n) => { addFolder('ws-design', n); addFolder('ws-class', n); });
    /* 멤버 5명 — 디자이너·기획자·마케터·교사 역할 조합 (지시서 서두) */
    const seedM = [
      { memberId: 'me',       name: '준호',   email: 'junho@keduclass.com',   role: 'owner',     color: '#2E8C7F' },
      { memberId: 'mb-kim',   name: '김철수', email: 'kim@keduclass.com',     role: 'editor',    color: '#3B5BDB' },
      { memberId: 'mb-lee',   name: '이영희', email: 'lee@keduclass.com',     role: 'admin',     color: '#E8735A' },
      { memberId: 'mb-park',  name: '박다인', email: 'park@keduclass.com',    role: 'commenter', color: '#D99A2B' },
      { memberId: 'mb-choi',  name: '최선생', email: 'choi@keduclass.com',    role: 'viewer',    color: '#7C5CBF' },
    ];
    seedM.forEach((m) => { w1.members.push({ joined: now() - 30 * D, state: 'offline', ...m }); });
    w2.members.push({ ...seedM[0] }, { ...seedM[4], role: 'editor' });
    /* 프로젝트 → 폴더 배치 */
    if (window.MK_PROJ) {
      const list = window.MK_PROJ.list('recent');
      const f = folders('ws-design');
      list.forEach((p, i) => { PROJ_FOLDER[p.projectId] = f[i % 4].folderId; });
    }
    /* 활동·댓글·버전 시드 — 대시보드가 비지 않게 */
    activity('mb-kim', 'project.edit', 'Scene 03 · Chart 수정', {});
    activity('mb-lee', 'brand.set', 'bd-kmaker', {});
    ACTIVITY[0].at = now() - 2 * H; ACTIVITY[1].at = now() - 5 * H;
  }
  const setWorkspace = (wsId) => { if (ws(wsId)) cur.wsId = wsId; return ws(); };

  /* 부팅 — 다른 데이터 계층 준비 뒤 시드 */
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', seed);

  return {
    /* 조직·워크스페이스 */
    ORG, WS, ws, setWorkspace, wsBlank, cur, seed,
    /* 멤버·권한 */
    ROLES, PERM_KEYS, MATRIX, LAYERS, member, addMember, setRole, removeMember, can, setLayerPerm,
    /* 초대 */
    invite, decideInvite, INVITES,
    /* 폴더 */
    folders, addFolder, moveProject, folderOf, projectsIn, PROJ_FOLDER,
    /* 댓글 */
    comment, reply, resolve, commentsFor, COMMENTS,
    /* 리뷰 */
    setReview, decide, review, isReadOnly,
    /* 버전 */
    snapshot, restoreVersion, versions, versionDoc, diff,
    /* 활동·감사 */
    activity, ACTIVITY, auditQuery, auditExport, AUDIT,
    /* 알림 */
    notify, notifications, markRead, unread,
    /* 공유 */
    shareAsset, shareTemplate, setWorkspaceBrand,
    /* 오프라인 */
    goOffline, goOnline, queueOp, offline,
    /* 검색·대시보드·AI */
    search, dashboard, aiContext,
  };
})();
