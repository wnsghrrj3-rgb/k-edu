/* ============================================================
   화면: Team — Enterprise Team Workspace           (Round 14)
   ------------------------------------------------------------
   좌: Organization → Workspace → Folder 트리
   중: 탭(Dashboard·Members·Invites·Comments·Review·Versions·
        Activity·Audit·Search)
   모든 버튼은 MK_TEAM 실함수를 부르고, 결과(권한 거부 포함)를
   그대로 화면에 보여준다 — 데모용 가짜 성공 없음.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.team = (() => {
  const M = () => window.MK, T = () => window.MK_TEAM, C = () => window.MK_COLLAB;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { tab: 'dashboard', folder: null, actor: 'me', q: '', lastMsg: null, verSel: null };
  const TABS = [
    ['dashboard', 'Dashboard'], ['members', 'Members'], ['invites', 'Invites'],
    ['comments', 'Comments'], ['review', 'Review'], ['versions', 'Versions'],
    ['activity', 'Activity'], ['audit', 'Audit'], ['search', 'Search'],
  ];
  const ago = (ts) => window.MK_PROJ ? window.MK_PROJ.ago(ts) : new Date(ts).toLocaleTimeString();
  const roleBadge = (r) => `<span class="tm-role tm-role-${r}">${r}</span>`;
  const msg = () => st.lastMsg ? `<div class="tm-msg ${st.lastMsg.ok ? 'ok' : 'no'}">${esc(st.lastMsg.text)}</div>` : '';
  const firstProject = () => (window.MK_PROJ?.list('recent') || [])[0] || null;

  /* ---------- 좌측 트리 ---------- */
  function Tree() {
    const t = T();
    const wsList = t.WS.map((w) => `<button class="tm-ws ${w.wsId === t.cur.wsId ? 'on' : ''}" data-tm="ws:${w.wsId}"><b>${esc(w.name)}</b><small>${w.members.length}명 · ${esc(w.brandId)}</small></button>`).join('');
    const folders = t.folders().map((f) => {
      const n = t.projectsIn(f.folderId).length;
      return `<button class="tm-folder ${st.folder === f.folderId ? 'on' : ''}" data-tm="folder:${f.folderId}">📁 ${esc(f.name)}<em>${n}</em></button>`;
    }).join('');
    return `<aside class="tm-tree">
      <div class="tm-org"><span class="tm-orglogo">K</span><div><b>${esc(t.ORG.name)}</b><small>${esc(t.ORG.domain)} · ${esc(t.ORG.plan)}</small></div></div>
      <small class="ed-zone-cap">Workspace</small>${wsList}
      <small class="ed-zone-cap">Folder</small><div class="tm-folders">${folders}</div>
      <small class="ed-zone-cap">보기 권한 (역할 체험)</small>
      <select class="tm-actor" data-tm="actor">${t.ws().members.map((m) => `<option value="${m.memberId}" ${m.memberId === st.actor ? 'selected' : ''}>${esc(m.name)} · ${m.role}</option>`).join('')}</select>
    </aside>`;
  }

  /* ---------- 탭 본문 ---------- */
  function Dashboard() {
    const d = T().dashboard();
    const projs = st.folder ? T().projectsIn(st.folder).map((p) => ({ projectId: p.projectId, name: p.name, folder: T().folderOf(p.projectId)?.name, updatedAt: p.updatedAt })) : d.recentProjects;
    const cards = [
      ['멤버', d.workspace.members + '명'], ['미해결 댓글', d.openComments], ['승인 대기', d.pendingApprovals],
      ['대기 초대', d.pendingInvites], ['버전', d.versions], ['AI 사용량', `${d.ai.used}/${d.ai.quota}`],
      ['Storage', `${(d.storage.usedMB / 1024).toFixed(1)}GB / ${(d.storage.quotaMB / 1024).toFixed(0)}GB`],
    ].map(([k, v]) => `<div class="tm-stat"><b>${v}</b><small>${k}</small></div>`).join('');
    const rows = projs.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.folder || '—')}</td><td>${ago(p.updatedAt)}</td></tr>`).join('');
    const act = d.recentActivity.map((a) => Act(a)).join('');
    return `<div class="tm-grid2">
      <div><h3>${st.folder ? esc(T().folders().find((f) => f.folderId === st.folder)?.name) + ' 폴더' : '최근 프로젝트'}</h3>
        <div class="tm-stats">${cards}</div>
        <table class="tm-table"><thead><tr><th>프로젝트</th><th>폴더</th><th>수정</th></tr></thead><tbody>${rows || '<tr><td colspan="3">비어 있음</td></tr>'}</tbody></table></div>
      <div><h3>멤버 활동</h3><div class="tm-feed">${act}</div></div></div>`;
  }
  const Act = (a) => `<div class="tm-act"><i style="--c:${C().colorOf(a.who)}"></i><span><b>${esc(C().nameOf(a.who))}</b> ${esc(a.action)} <em>${esc(a.detail)}</em></span><small>${ago(a.at)}</small></div>`;

  function Members() {
    const t = T();
    const rows = t.ws().members.map((m) => {
      const sel = t.ROLES.map((r) => `<option ${m.role === r ? 'selected' : ''}>${r}</option>`).join('');
      return `<tr><td><i class="tm-dot" style="--c:${m.color}"></i>${esc(m.name)}</td><td>${esc(m.email)}</td><td>${roleBadge(m.role)}</td>
        <td><select data-tm="role:${m.memberId}" ${m.role === 'owner' ? 'disabled' : ''}>${sel}</select></td>
        <td><button class="mk-btn ghost sm" data-tm="kick:${m.memberId}" ${m.role === 'owner' ? 'disabled' : ''}>제거</button></td></tr>`;
    }).join('');
    const perms = `<h3 style="margin-top:20px">Permission Matrix</h3><div class="tm-permwrap"><table class="tm-table tm-perm"><thead><tr><th>권한</th>${t.ROLES.map((r) => `<th>${r}</th>`).join('')}</tr></thead><tbody>` +
      t.PERM_KEYS.map((k) => `<tr><td>${k}</td>${t.ROLES.map((r) => `<td class="${t.MATRIX[r][k] ? 'y' : 'n'}">${t.MATRIX[r][k] ? '✓' : '·'}</td>`).join('')}</tr>`).join('') + `</tbody></table></div>`;
    return `<h3>멤버 ${t.ws().members.length}명</h3>${msg()}<table class="tm-table"><thead><tr><th>이름</th><th>이메일</th><th>역할</th><th>변경</th><th></th></tr></thead><tbody>${rows}</tbody></table>${perms}`;
  }

  function Invites() {
    const t = T();
    const rows = t.INVITES.map((i) => `<tr><td>${i.kind}</td><td>${esc(i.target)}</td><td>${roleBadge(i.role)}</td><td>${i.approveMode}</td><td class="tm-st-${i.status}">${i.status}</td>
      <td>${i.status === 'pending' ? `<button class="mk-btn sm" data-tm="ivok:${i.inviteId}">승인</button> <button class="mk-btn ghost sm" data-tm="ivno:${i.inviteId}">거절</button>` : ''}</td></tr>`).join('');
    return `<h3>초대</h3>${msg()}
      <div class="tm-row"><input id="tmIvMail" class="mk-input" placeholder="email@keduclass.com" style="width:220px">
        <select id="tmIvRole">${t.ROLES.slice(1).map((r) => `<option>${r}</option>`).join('')}</select>
        <select id="tmIvMode"><option value="admin">관리자 승인</option><option value="auto">자동 승인</option><option value="domain">도메인 승인</option></select>
        <button class="mk-btn" data-tm="ivmail">이메일 초대</button>
        <button class="mk-btn ghost" data-tm="ivlink">링크 초대 생성</button></div>
      <table class="tm-table"><thead><tr><th>방식</th><th>대상</th><th>역할</th><th>승인</th><th>상태</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="6">초대 없음</td></tr>'}</tbody></table>`;
  }

  function Comments() {
    const t = T(), p = firstProject();
    const list = t.COMMENTS.map((c) => {
      const rep = c.replies.map((r) => `<div class="tm-reply"><b style="color:${C().colorOf(r.by)}">${esc(C().nameOf(r.by))}</b> ${esc(r.text)}<small>${ago(r.at)}</small></div>`).join('');
      return `<div class="tm-cm ${c.resolved ? 'done' : ''}"><div class="tm-cm-h"><b style="color:${C().colorOf(c.by)}">${esc(C().nameOf(c.by))}</b>
        <em>${c.type}${c.sceneId ? ' · ' + esc(c.sceneId) : ''}${c.elIdx != null ? ' · el ' + c.elIdx : ''}</em><small>${ago(c.at)}</small></div>
        <p>${esc(c.text).replace(/@([\w가-힣.\-]+)/g, '<b class="tm-mention">@$1</b>')}</p>${rep}
        <div class="tm-cm-a"><button class="mk-btn ghost sm" data-tm="cmre:${c.commentId}">답글</button>
        <button class="mk-btn ghost sm" data-tm="cmok:${c.commentId}">${c.resolved ? '다시 열기' : 'Resolve'}</button></div></div>`;
    }).join('');
    return `<h3>댓글</h3>${msg()}
      <div class="tm-row"><select id="tmCmType"><option value="project">Project</option><option value="scene">Scene</option><option value="element">Element</option></select>
        <input id="tmCmText" class="mk-input" placeholder="@김철수 이 씬 색 확인 부탁!" style="flex:1">
        <button class="mk-btn" data-tm="cmnew">작성${p ? '' : ' (프로젝트 없음)'}</button></div>
      <div class="tm-cms">${list || '<p class="ed-note">댓글 없음</p>'}</div>`;
  }

  function Review() {
    const t = T(), p = firstProject();
    if (!p) return '<p class="ed-note">프로젝트 없음</p>';
    const r = t.review(p.projectId);
    const dec = (r?.decisions || []).map((d) => `<div class="tm-act"><i style="--c:${C().colorOf(d.by)}"></i><span><b>${esc(C().nameOf(d.by))}</b> <em class="tm-verdict tm-v-${d.verdict}">${d.verdict}</em> ${esc(d.note)}</span><small>${ago(d.at)}</small></div>`).join('');
    return `<h3>Review Mode — ${esc(p.name)}</h3>${msg()}
      <p class="ed-note">상태: <b>${r?.mode || '일반 편집'}</b>${r?.mode === 'comment-only' ? ' · 편집 차단, 댓글만 허용' : ''}</p>
      <div class="tm-row">
        <button class="mk-btn" data-tm="rvon">검토 시작 (Comment Only)</button>
        <button class="mk-btn ghost" data-tm="rvoff">검토 종료</button>
        <span style="width:14px"></span>
        <button class="mk-btn sm" data-tm="rv:approve">Approve</button>
        <button class="mk-btn ghost sm" data-tm="rv:changes">Request Changes</button>
        <button class="mk-btn ghost sm" data-tm="rv:reject">Reject</button></div>
      <div class="tm-feed">${dec || '<p class="ed-note">결정 이력 없음</p>'}</div>`;
  }

  function Versions() {
    const t = T(), p = firstProject();
    if (!p) return '<p class="ed-note">프로젝트 없음</p>';
    const vs = t.versions(p.projectId);
    const rows = vs.map((v) => `<tr class="${st.verSel === v.verId ? 'on' : ''}"><td>${esc(v.name)}${v.auto ? ' <em class="tm-auto">auto</em>' : ''}</td><td>${esc(C().nameOf(v.by))}</td><td>${ago(v.at)}</td>
      <td><button class="mk-btn ghost sm" data-tm="vdiff:${v.verId}">Diff</button> <button class="mk-btn sm" data-tm="vres:${v.verId}">복원</button></td></tr>`).join('');
    let diffBox = '';
    if (st.verSel) {
      const old = t.versionDoc(p.projectId, st.verSel);
      if (old && p.doc) {
        const d = t.diff(old, p.doc);
        diffBox = `<div class="tm-diff"><b>선택 버전 → 현재</b> · 변경 요소 ${d.elements}개 · 씬 변경 ${d.scenes.changed.length} · 추가 ${d.scenes.added.length} · 삭제 ${d.scenes.removed.length}` +
          d.texts.slice(0, 3).map((x) => `<div class="tm-difft">"${esc(x.from)}" → "${esc(x.to)}"</div>`).join('') + `</div>`;
      }
    }
    return `<h3>Version History — ${esc(p.name)}</h3>${msg()}
      <div class="tm-row"><input id="tmVerName" class="mk-input" placeholder="버전 이름 (예: 검수 전 최종)" style="width:240px">
        <button class="mk-btn" data-tm="vsave">Revision 저장</button>
        <button class="mk-btn ghost" data-tm="vauto">자동 저장 시뮬</button></div>
      ${diffBox}
      <table class="tm-table"><thead><tr><th>버전</th><th>작성자</th><th>시각</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="4">버전 없음 — Revision을 저장해 보세요</td></tr>'}</tbody></table>`;
  }

  const Activity = () => `<h3>Activity</h3><div class="tm-feed">${T().ACTIVITY.slice(0, 40).map(Act).join('') || '<p class="ed-note">기록 없음</p>'}</div>`;

  function Audit() {
    const rows = T().auditQuery({ text: st.q }).slice(0, 60).map((a) =>
      `<tr><td>${new Date(a.at).toLocaleTimeString()}</td><td>${esc(C().nameOf(a.who))}</td><td>${esc(a.action)}</td><td>${esc(a.detail)}</td><td>${esc(Object.entries(a.target).map(([k, v]) => k + ':' + v).join(' '))}</td></tr>`).join('');
    return `<h3>Audit Log <em class="tm-auto">Enterprise</em></h3>
      <div class="tm-row"><input id="tmAuQ" class="mk-input" placeholder="검색 (액션·내용)" value="${esc(st.q)}" style="width:240px">
        <button class="mk-btn ghost" data-tm="auq">조회</button><button class="mk-btn ghost" data-tm="auex">Export JSON</button></div>
      <pre id="tmAuOut" class="tm-export" hidden></pre>
      <table class="tm-table"><thead><tr><th>시각</th><th>누가</th><th>액션</th><th>내용</th><th>대상</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function Search() {
    const r = st.q ? T().search(st.q) : null;
    const sect = (name, arr, f) => arr?.length ? `<h4>${name} <em>${arr.length}</em></h4>` + arr.slice(0, 6).map(f).join('') : '';
    const body = !r ? '<p class="ed-note">Workspace 전체 검색 — Project · Scene · Text · Comment · Template · Asset · Brand</p>'
      : r.total === 0 ? '<p class="ed-note">결과 없음</p>'
      : sect('Projects', r.projects, (x) => `<div class="tm-sr">📄 ${esc(x.name)}</div>`) +
        sect('Scenes', r.scenes, (x) => `<div class="tm-sr">🖼 ${esc(x.name)} <small>${esc(x.projectId)}</small></div>`) +
        sect('Texts', r.texts, (x) => `<div class="tm-sr">✏️ ${esc(x.text).slice(0, 60)}</div>`) +
        sect('Comments', r.comments, (x) => `<div class="tm-sr">💬 ${esc(x.text)}</div>`) +
        sect('Templates', r.templates, (x) => `<div class="tm-sr">📐 ${esc(x.name)}</div>`) +
        sect('Assets', r.assets, (x) => `<div class="tm-sr">🧩 ${esc(x.name)}</div>`) +
        sect('Brands', r.brands, (x) => `<div class="tm-sr">🏷 ${esc(x.name)}</div>`);
    return `<h3>검색</h3><div class="tm-row"><input id="tmQ" class="mk-input" placeholder="워크스페이스 전체 검색" value="${esc(st.q)}" style="width:300px"><button class="mk-btn" data-tm="q">검색</button></div><div class="tm-srs">${body}</div>`;
  }

  /* ---------- render / mount ---------- */
  function render() {
    const tabs = TABS.map(([k, n]) => `<button class="tm-tab ${st.tab === k ? 'on' : ''}" data-tm="tab:${k}">${n}${k === 'comments' && T().COMMENTS.filter((c) => !c.resolved).length ? `<em>${T().COMMENTS.filter((c) => !c.resolved).length}</em>` : ''}</button>`).join('');
    const BODY = { dashboard: Dashboard, members: Members, invites: Invites, comments: Comments, review: Review, versions: Versions, activity: Activity, audit: Audit, search: Search };
    return `<div class="tm-wrap">${Tree()}<main class="tm-main"><div class="tm-tabs">${tabs}</div><div class="tm-body">${(BODY[st.tab] || Dashboard)()}</div></main></div>`;
  }

  function mount(host) {
    const rerender = () => { const b = host.closest('#pgBody') || host; b.innerHTML = render(); mount(b); };
    const say = (ok, text) => { st.lastMsg = { ok, text }; rerender(); };
    const t = T(), p = firstProject();
    host.querySelectorAll('[data-tm]').forEach((el) => {
      const [cmd, arg] = el.dataset.tm.split(':');
      const H = {
        tab: () => { st.tab = arg; st.lastMsg = null; rerender(); },
        ws: () => { t.setWorkspace(arg); st.folder = null; st.actor = t.ws().members[0].memberId; rerender(); },
        folder: () => { st.folder = st.folder === arg ? null : arg; st.tab = 'dashboard'; rerender(); },
        role: () => { const r = t.setRole(st.actor, arg, el.value); say(r.ok, r.ok ? '역할 변경 완료' : '거부: ' + r.why); },
        kick: () => { const r = t.removeMember(st.actor, arg); say(r.ok, r.ok ? '멤버 제거' : '거부: ' + r.why); },
        ivmail: () => { const v = host.querySelector('#tmIvMail').value || 'guest@example.com'; const r = t.invite(st.actor, 'email', v, host.querySelector('#tmIvRole').value, host.querySelector('#tmIvMode').value); say(r.ok, r.ok ? `초대 발송 (${r.invite.status})` : '거부: ' + r.why); },
        ivlink: () => { const r = t.invite(st.actor, 'link', 'https://keduclass.com/join/' + Math.random().toString(36).slice(2, 8), host.querySelector('#tmIvRole').value, host.querySelector('#tmIvMode').value); say(r.ok, r.ok ? '초대 링크 생성' : '거부: ' + r.why); },
        ivok: () => { const r = t.decideInvite(st.actor, arg, true); say(r.ok, r.ok ? '승인' : r.why); },
        ivno: () => { const r = t.decideInvite(st.actor, arg, false); say(r.ok, r.ok ? '거절' : r.why); },
        cmnew: () => { if (!p) return; const type = host.querySelector('#tmCmType').value; const target = { type, projectId: p.projectId }; if (type !== 'project') target.sceneId = p.doc.scenes[0].id; if (type === 'element') target.elIdx = 0; const r = t.comment(st.actor, target, host.querySelector('#tmCmText').value || '확인 부탁드립니다'); say(r.ok, r.ok ? '댓글 작성' : '거부: ' + r.why); },
        cmre: () => { const r = t.reply(st.actor, arg, '확인했습니다 👍'); say(r.ok, r.ok ? '답글 작성' : '거부: ' + r.why); },
        cmok: () => { const c = t.COMMENTS.find((x) => x.commentId === arg); const r = t.resolve(st.actor, arg, !c.resolved); say(r.ok, r.ok ? '상태 변경' : '거부: ' + r.why); },
        rvon: () => { const r = t.setReview(st.actor, p.projectId, true); say(r.ok, r.ok ? 'Review Mode 시작' : '거부: ' + r.why); },
        rvoff: () => { const r = t.setReview(st.actor, p.projectId, false); say(r.ok, r.ok ? 'Review 종료' : '거부: ' + r.why); },
        rv: () => { const r = t.decide(st.actor, p.projectId, arg, arg === 'changes' ? '3번 씬 색 보완' : ''); say(r.ok, r.ok ? '결정: ' + arg : '거부: ' + r.why); },
        vsave: () => { t.snapshot(st.actor, p.projectId, p.doc, host.querySelector('#tmVerName').value, false); say(true, 'Revision 저장'); },
        vauto: () => { const before = t.versions(p.projectId).length; t.snapshot(st.actor, p.projectId, p.doc, null, true); const after = t.versions(p.projectId).length; say(true, after > before ? '자동 저장 생성' : '변경 없음 — 중복 스냅샷 생략'); },
        vdiff: () => { st.verSel = st.verSel === arg ? null : arg; rerender(); },
        vres: () => { const r = t.restoreVersion(st.actor, p.projectId, arg); if (r.ok) { p.doc = r.doc; window.MK_PROJ.touch?.(p.projectId); } say(r.ok, r.ok ? `"${r.version.name}" 복원` : '거부: ' + r.why); },
        auq: () => { st.q = host.querySelector('#tmAuQ').value; rerender(); },
        auex: () => { const o = host.querySelector('#tmAuOut'); o.hidden = false; o.textContent = t.auditExport({ text: st.q }).slice(0, 2000) + '\n…'; },
        q: () => { st.q = host.querySelector('#tmQ').value; rerender(); },
      };
      if (cmd === 'actor') { el.onchange = () => { st.actor = el.value; say(true, `이제 ${C().nameOf(st.actor)}(${t.member(st.actor).role}) 시점으로 동작`); }; return; }
      if (cmd === 'role') { el.onchange = H.role; return; }
      el.onclick = H[cmd] || null;
    });
  }

  return { title: 'Team Workspace', variants: ['Enterprise'], render, mount, flush: true, _st: st };
})();
