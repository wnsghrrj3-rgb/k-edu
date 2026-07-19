/* ============================================================
   K-MAKER Collaboration Engine v1 — window.MK_COLLAB   (Round 14)
   ------------------------------------------------------------
   Real-time Collaboration · Live Cursor · Presence · Lock · Typing

   ★ 이중 채널 설계
     1) BroadcastChannel('mk-collab-v1') — 같은 브라우저의 두 탭이
        실제로 서로의 커서·선택·편집을 실시간 수신한다. (실동작)
     2) 시뮬레이션 팀원 — 서버가 없는 정적 SPA에서 "5명 동시 접속"
        시나리오를 재현하는 결정론적 봇. step()으로 수동 진행 가능
        (테스트), 브라우저에서는 타이머로 자동 진행.

   ★ 충돌 최소화
     - 편집 op는 Element 단위. Lock이 걸린 대상은 op가 거부된다.
     - Review Mode(comment-only) 프로젝트는 원격 op도 차단.
   ============================================================ */
window.MK_COLLAB = (() => {
  'use strict';
  const now = () => Date.now();
  const T = () => window.MK_TEAM;

  /* ---------- 세션 사용자 ---------- */
  const ME = { userId: 'me', name: '준호', color: '#2E8C7F' };
  /* 결정론 봇 — 이름·색은 MK_TEAM 시드 멤버와 일치 */
  const BOTS = [
    { userId: 'mb-kim',  name: '김철수', color: '#3B5BDB', role: 'editor' },
    { userId: 'mb-lee',  name: '이영희', color: '#E8735A', role: 'admin' },
    { userId: 'mb-park', name: '박다인', color: '#D99A2B', role: 'commenter' },
    { userId: 'mb-choi', name: '최선생', color: '#7C5CBF', role: 'viewer' },
  ];

  /* presence: userId → {state, scene, selEl, cursor{x,y}, typing, lastSeen}
     state: online | editing | idle | offline  (§7) */
  const PRES = {};
  const pres = (uid) => PRES[uid] = PRES[uid] || { state: 'offline', scene: 0, selEl: null, cursor: null, typing: null, lastSeen: 0 };

  /* ---------- Lock (§8) — element · scene · project ---------- */
  const LOCKS = []; /* {type, projectId, sceneId?, elIdx?, by, at} */
  const lockKey = (l) => [l.type, l.projectId, l.sceneId ?? '', l.elIdx ?? ''].join('|');
  function lock(userId, target) {
    const l = { by: userId, at: now(), ...target };
    if (findLock(target) ) return { ok: false, why: '이미 잠김', lock: findLock(target) };
    LOCKS.push(l);
    T()?.activity(userId, 'lock.on', target.type, { project: target.projectId, scene: target.sceneId });
    bc('lock', l);
    return { ok: true, lock: l };
  }
  function unlock(userId, target) {
    const i = LOCKS.findIndex((l) => lockKey(l) === lockKey({ ...target }) && (l.by === userId || T()?.can(userId, 'member.manage', { workspace: T().cur.wsId })));
    if (i < 0) return { ok: false, why: '해제할 잠금 없음(소유자만 해제)' };
    const [l] = LOCKS.splice(i, 1);
    T()?.activity(userId, 'lock.off', l.type, { project: l.projectId });
    bc('unlock', l);
    return { ok: true };
  }
  const findLock = (t) => LOCKS.find((l) => lockKey(l) === lockKey({ by: 0, at: 0, ...t })) || null;
  function isBlocked(userId, projectId, sceneId, elIdx) {
    /* 상위 잠금이 하위를 덮는다: project > scene > element */
    const hit = LOCKS.find((l) =>
      l.projectId === projectId && l.by !== userId &&
      (l.type === 'project' ||
       (l.type === 'scene' && l.sceneId === sceneId) ||
       (l.type === 'element' && l.sceneId === sceneId && l.elIdx === elIdx)));
    return hit || null;
  }

  /* ---------- 편집 op (§5) ---------- */
  let session = { projectId: null, doc: null };
  function join(projectId, doc) {
    session = { projectId, doc };
    Object.assign(pres(ME.userId), { state: 'online', scene: 0, lastSeen: now() });
    BOTS.forEach((b, i) => Object.assign(pres(b.userId), { state: i < 2 ? 'online' : (i === 2 ? 'idle' : 'offline'), scene: i % Math.max(1, (doc?.scenes || []).length), lastSeen: now() - i * 60e3 }));
    bc('presence', { userId: ME.userId, ...pres(ME.userId) });
    T()?.activity(ME.userId, 'collab.join', '', { project: projectId });
    return session;
  }
  function applyOp(userId, op) {
    /* op = {sceneId, elIdx, field, value} — Element 단위 최소 충돌 */
    if (!session.doc) return { ok: false, why: '세션 없음' };
    if (T()?.isReadOnly(session.projectId) && op.field !== '_comment') return { ok: false, why: 'Review Mode — Comment Only' };
    if (!T()?.can(userId, 'project.edit', { project: session.projectId, workspace: T().cur.wsId })) return { ok: false, why: '편집 권한 없음' };
    const blocked = isBlocked(userId, session.projectId, op.sceneId, op.elIdx);
    if (blocked) return { ok: false, why: `잠김(${blocked.type} · ${nameOf(blocked.by)})` };
    const s = (session.doc.scenes || []).find((x) => x.id === op.sceneId);
    const el = s?.elements?.[op.elIdx];
    if (!el) return { ok: false, why: '대상 없음' };
    el[op.field] = op.value;
    (session.doc._touched = session.doc._touched || {})[`${op.sceneId}.${op.elIdx}.${op.field}`] = now();
    Object.assign(pres(userId), { state: 'editing', lastSeen: now() });
    T()?.activity(userId, 'element.edit', `${op.field} 수정`, { project: session.projectId, scene: op.sceneId });
    bc('op', { userId, op });
    return { ok: true };
  }

  /* ---------- Live Cursor · Selection · Typing (§5 · §6) ---------- */
  function moveCursor(userId, x, y) { Object.assign(pres(userId), { cursor: { x, y }, lastSeen: now(), state: pres(userId).state === 'offline' ? 'online' : pres(userId).state }); bc('cursor', { userId, x, y }); }
  function select(userId, sceneIdx, elIdx) { Object.assign(pres(userId), { scene: sceneIdx, selEl: elIdx, lastSeen: now() }); bc('select', { userId, sceneIdx, elIdx }); }
  function typing(userId, text) { pres(userId).typing = text == null ? null : String(text).slice(0, 40); pres(userId).state = text == null ? 'online' : 'editing'; bc('typing', { userId, text: pres(userId).typing }); }
  const nameOf = (uid) => uid === ME.userId ? ME.name : (BOTS.find((b) => b.userId === uid)?.name || T()?.member(uid)?.name || uid);
  const colorOf = (uid) => uid === ME.userId ? ME.color : (BOTS.find((b) => b.userId === uid)?.color || '#6B7280');
  const roster = () => [ME, ...BOTS].map((u) => ({ ...u, ...pres(u.userId) }));

  /* ---------- 시뮬레이션 봇 — 결정론 스텝 ---------- */
  let tick = 0;
  function step() {
    /* 매 스텝: 김철수는 커서 이동+편집, 이영희는 다른 씬 이동, 박다인은 타이핑 */
    tick++;
    const scenes = session.doc?.scenes || [];
    if (!scenes.length) return tick;
    const kim = pres('mb-kim');
    moveCursor('mb-kim', 20 + (tick * 7) % 60, 15 + (tick * 11) % 60);
    if (tick % 3 === 0) {
      const s = scenes[kim.scene] || scenes[0];
      const ti = (s.elements || []).findIndex((e) => e.kind === 'text');
      if (ti >= 0) { select('mb-kim', kim.scene, ti); applyOp('mb-kim', { sceneId: s.id, elIdx: ti, field: 'weight', value: tick % 6 === 0 ? 700 : 600 }); }
    }
    select('mb-lee', (tick >> 1) % scenes.length, null);
    Object.assign(pres('mb-lee'), { state: 'online' });
    typing('mb-park', tick % 4 === 1 ? '여기 색이 좀 약한 것 같아요' : null);
    if (tick % 8 === 0) pres('mb-choi').state = pres('mb-choi').state === 'offline' ? 'online' : 'offline';
    /* idle 판정 — 90초 무활동 */
    for (const u of roster()) if (u.state === 'online' && now() - u.lastSeen > 90e3) pres(u.userId).state = 'idle';
    return tick;
  }

  /* ---------- BroadcastChannel — 실제 멀티탭 실시간 (§5·§6) ---------- */
  let chan = null;
  const bc = (type, data) => { try { chan && chan.postMessage({ type, data, from: ME.userId, at: now() }); } catch (e) { /* no-op */ } };
  function initChannel() {
    if (typeof BroadcastChannel === 'undefined') return false; /* jsdom 등 미지원 환경 */
    chan = new BroadcastChannel('mk-collab-v1');
    chan.onmessage = (ev) => {
      const { type, data, from } = ev.data || {};
      if (from === ME.userId) return;
      if (type === 'cursor') Object.assign(pres('tab:' + from), { cursor: { x: data.x, y: data.y }, state: 'online', lastSeen: now() });
      if (type === 'op' && session.doc) { const s = session.doc.scenes.find((x) => x.id === data.op.sceneId); const el = s?.elements?.[data.op.elIdx]; if (el) el[data.op.field] = data.op.value; }
      if (type === 'lock') LOCKS.push(data);
      if (type === 'unlock') { const i = LOCKS.findIndex((l) => lockKey(l) === lockKey(data)); if (i >= 0) LOCKS.splice(i, 1); }
      if (overlay.host) renderOverlay();
    };
    return true;
  }

  /* ============================================================
     Editor Overlay — 기존 editor 화면 무수정 확장
       mount 래핑: Presence Bar + 원격 커서 + 잠금 배지 + Review 배너
     ============================================================ */
  const overlay = { host: null, timer: null };
  function decorate(host) {
    const wrap = host.querySelector('.ed-canvaswrap');
    const canvas = host.querySelector('.ed-canvas');
    if (!wrap || !canvas) return;
    overlay.host = host;
    if (!session.doc && window.PG?.state.editor.doc) join(window.PG.state.editor.doc.templateId || 'pj-live', window.PG.state.editor.doc);
    /* Presence Bar */
    let bar = host.querySelector('.cw-presence');
    if (!bar) {
      bar = document.createElement('div'); bar.className = 'cw-presence';
      wrap.parentElement.insertBefore(bar, wrap);
    }
    /* 커서 레이어 */
    let layer = canvas.querySelector('.cw-cursors');
    if (!layer) { layer = document.createElement('div'); layer.className = 'cw-cursors'; canvas.appendChild(layer); }
    renderOverlay();
    if (overlay.timer) clearInterval(overlay.timer);
    if (typeof window !== 'undefined' && window.requestAnimationFrame && typeof BroadcastChannel !== 'undefined') {
      overlay.timer = setInterval(() => { step(); renderOverlay(); }, 1600); /* 브라우저에서만 자동 진행 */
    }
  }
  function renderOverlay() {
    const host = overlay.host; if (!host) return;
    const bar = host.querySelector('.cw-presence');
    const layer = host.querySelector('.cw-cursors');
    const ro = T()?.isReadOnly(session.projectId);
    if (bar) {
      const chips = roster().filter((u) => u.state !== 'offline').map((u) =>
        `<span class="cw-chip" style="--c:${u.color}" title="${u.name} · ${u.state}${u.scene != null ? ' · Scene ' + (u.scene + 1) : ''}"><i></i>${u.name}<em>${u.state === 'editing' ? '편집 중' : u.state === 'idle' ? '자리 비움' : 'Scene ' + (u.scene + 1)}</em></span>`).join('');
      const lk = LOCKS.length ? `<span class="cw-lockbadge">🔒 잠금 ${LOCKS.length}</span>` : '';
      bar.innerHTML = `${ro ? '<span class="cw-review">Review Mode — Comment Only</span>' : ''}${chips}${lk}`;
    }
    if (layer) {
      const meScene = window.PG?.state.editor.sceneIdx ?? 0;
      layer.innerHTML = roster().filter((u) => u.userId !== 'me' && u.cursor && u.state !== 'offline' && u.scene === meScene).map((u) => {
        const typ = u.typing ? `<span class="cw-type">${u.typing}</span>` : '';
        return `<div class="cw-cur" style="left:${u.cursor.x}%;top:${u.cursor.y}%;--c:${u.color}"><svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 1l11 5.5-5 1.3L6 13z" fill="var(--c)"/></svg><b>${u.name}</b>${typ}</div>`;
      }).join('');
    }
  }
  function hook() {
    if (hook._done) return; hook._done = true;
    const ed = window.MK_SCREENS?.editor;
    if (!ed) return;
    const om = ed.mount;
    ed.mount = function (host) { const r = om ? om.apply(this, arguments) : undefined; try { decorate(host); } catch (e) { /* 오버레이 실패가 에디터를 죽이면 안 됨 */ } return r; };
  }
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => { initChannel(); hook(); });

  return {
    ME, BOTS, roster, pres, nameOf, colorOf,
    join, applyOp, moveCursor, select, typing, step,
    lock, unlock, findLock, isBlocked, LOCKS,
    initChannel, hook, decorate, renderOverlay, session: () => session,
  };
})();
