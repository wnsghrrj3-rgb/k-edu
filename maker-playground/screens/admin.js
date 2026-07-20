/* ============================================================
   화면: Admin — Enterprise Admin Console  (Round 19)
   ------------------------------------------------------------
   대시보드/조직/사용자/권한/보안/거버넌스/빌링·분석/운영 8탭.
   모든 버튼은 MK_ADMIN 실함수를 부르고 실패 메시지(쿼터 초과·
   IP 차단·좌석 소진·불법 전이 등)를 그대로 보여준다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.admin = (() => {
  const M = () => window.MK, A = () => window.MK_ADMIN;
  const esc = (s) => M().esc(String(s == null ? '' : s));
  const st = { org: 'geumseong', tab: 'dash', uq: '', ustate: '', selUser: null, permWho: null, permKey: 'project.edit',
    logEmail: 'junho@geumseong.es.kr', logPw: 'Kmaker1!', logIp: '10.0.0.3', logOtp: '', auditQ: '', msg: null };
  const say = (ok, text) => { st.msg = { ok, text: String(text) }; };
  const gb = (b) => b >= 1e9 ? (b / 1e9).toFixed(1) + 'GB' : b >= 1e6 ? (b / 1e6).toFixed(1) + 'MB' : Math.round(b / 1e3) + 'KB';
  const won = (n) => '₩' + Number(n || 0).toLocaleString();
  const ts = (t) => new Date(t).toISOString().slice(5, 16).replace('T', ' ');
  const Stat = (label, val, sub) => `<div class="adm-stat"><small>${esc(label)}</small><b>${val}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;

  /* ---------- 대시보드 ---------- */
  function Dash() {
    const d = A().dashboard(st.org); const an = d.analytics;
    const lic = d.licenses.filter((l) => l.cap).map((l) => `<tr><td>${l.type}</td><td>${l.used}/${l.cap}</td><td>${l.expired ? `<span class="mk-badge danger">만료 ${l.expired}</span>` : '<span class="mk-badge success">정상</span>'}</td></tr>`).join('');
    return `
      <div class="adm-stats">
        ${Stat('DAU', an.dau)}${Stat('MAU', an.mau)}${Stat('활성 사용자', an.users)}${Stat('워크스페이스', an.workspaces)}
        ${Stat('프로젝트', an.projects)}${Stat('AI 토큰', an.aiTokens.toLocaleString())}
        ${Stat('스토리지', gb(d.storage.used), '한도 ' + gb(d.storage.cap))}
        ${Stat('보안 이벤트', d.securityEvents)}${Stat('미읽음 경고', d.warnings)}${Stat('미결제', d.unpaid)}
      </div>
      <div class="adm-2col">
        <div class="adm-panel"><h3>최근 활동</h3><table class="adm-tbl">${d.recent.map((r) =>
          `<tr><td>${ts(r.at)}</td><td>${esc(r.actor)}</td><td><b>${esc(r.event)}</b></td><td>${esc(r.detail)}</td></tr>`).join('')}</table></div>
        <div class="adm-panel"><h3>라이선스 현황</h3><table class="adm-tbl"><tr><th>타입</th><th>사용</th><th>상태</th></tr>${lic}</table></div>
      </div>`;
  }

  /* ---------- 조직 ---------- */
  function Org() {
    const o = A().getOrg(st.org);
    const nodeRow = (n, depth) => `<div class="adm-node d${depth}"><span class="adm-node-t">${{ workspace: '🗂', department: '🏷', team: '👥' }[n.type]}</span> ${esc(n.name)} <small>${n.users}명</small></div>` + n.children.map((c) => nodeRow(c, depth + 1)).join('');
    const users = A().listUsers(st.org);
    const selU = st.selUser && users.find((u) => u.userId === st.selUser) ? st.selUser : (users[0] || {}).userId;
    const pol = selU ? A().effectivePolicy(st.org, selU) : null;
    return `
      <div class="adm-2col">
        <div class="adm-panel"><h3>프로필</h3><table class="adm-tbl">
          ${[['이름', o.name], ['도메인', o.domain], ['업종', o.industry], ['국가/언어', o.country + ' / ' + o.language], ['타임존', o.timezone], ['브랜드', o.brandId || '—']].map(([k, v]) => `<tr><td>${k}</td><td><b>${esc(v)}</b></td></tr>`).join('')}
          <tr><td>플랜</td><td><select data-adm="plan">${Object.keys(A().PLANS).map((p) => `<option value="${p}" ${o.plan === p ? 'selected' : ''}>${A().PLANS[p].name}</option>`).join('')}</select></td></tr>
        </table></div>
        <div class="adm-panel"><h3>계층 (Org → WS → Dept → Team)</h3>${A().tree(st.org).map((n) => nodeRow(n, 0)).join('')}</div>
      </div>
      <div class="adm-panel"><h3>유효 정책 (상속 결과)</h3>
        사용자: <select data-adm="polUser">${users.map((u) => `<option value="${u.userId}" ${u.userId === selU ? 'selected' : ''}>${esc(u.name)} (${esc(u.role)})</option>`).join('')}</select>
        ${pol ? `<div class="adm-code">상속 경로: ${pol._trace.join(' → ')}\n${esc(JSON.stringify(Object.fromEntries(Object.entries(pol).filter(([k]) => k !== '_trace')), null, 1))}</div>` : ''}
      </div>`;
  }

  /* ---------- 사용자 ---------- */
  function Users() {
    const users = A().listUsers(st.org, { q: st.uq, state: st.ustate || undefined, includeDeleted: st.ustate === 'deleted' });
    const roles = Object.keys(A().roleMatrix(st.org));
    const badge = { active: 'success', invited: 'teal', inactive: '', locked: 'danger', deleted: 'danger' };
    return `
      <div class="mkt-head">
        <input class="mkt-search" placeholder="이름·이메일 검색" value="${esc(st.uq)}" data-adm="uq">
        <select data-adm="ustate">${[['', '전체'], ['active', '활성'], ['invited', '초대됨'], ['inactive', '비활성'], ['locked', '잠김'], ['deleted', '삭제됨']].map(([v, l]) => `<option value="${v}" ${st.ustate === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
        ${M().Button({ label: '초대', icon: '✉️', attrs: 'data-adm="invite"' })}
      </div>
      <table class="adm-tbl adm-users"><tr><th>이름</th><th>이메일</th><th>역할</th><th>상태</th><th>세션</th><th>동작</th></tr>
      ${users.map((u) => `<tr>
        <td><b>${esc(u.name)}</b></td><td>${esc(u.email)}</td>
        <td><select data-adm="role:${u.userId}">${roles.map((r) => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${esc(A().ROLE_KO[r] || r)}</option>`).join('')}</select></td>
        <td><span class="mk-badge ${badge[u.state] || ''}">${u.state}</span></td><td>${u.sessions}</td>
        <td class="adm-acts">
          ${u.state === 'locked' ? `<button data-adm="unlock:${u.userId}">해제</button>` : `<button data-adm="lock:${u.userId}">잠금</button>`}
          ${u.state === 'inactive' ? `<button data-adm="restore2:${u.userId}">활성화</button>` : `<button data-adm="deact:${u.userId}">비활성</button>`}
          <button data-adm="kick:${u.userId}">강제 로그아웃</button>
          ${u.state === 'deleted' ? `<button data-adm="restore:${u.userId}">복구</button>` : `<button data-adm="del:${u.userId}">삭제</button>`}
        </td></tr>`).join('')}</table>`;
  }

  /* ---------- 권한 ---------- */
  function Perms() {
    const mtx = A().roleMatrix(st.org);
    const roles = Object.keys(mtx);
    const users = A().listUsers(st.org);
    const who = st.permWho && users.find((u) => u.userId === st.permWho) ? st.permWho : (users[0] || {}).userId;
    const verdict = who ? A().can(st.org, who, st.permKey) : false;
    const cell = (r, res) => ACTIONS_SHORT.map((a) => mtx[r][res + '.' + a.k] ? a.s : '·').join('');
    return `
      <div class="adm-panel"><h3>권한 판정기 — can(user, perm)</h3>
        <select data-adm="permWho">${users.map((u) => `<option value="${u.userId}" ${u.userId === who ? 'selected' : ''}>${esc(u.name)} (${esc(u.role)})</option>`).join('')}</select>
        <select data-adm="permKey">${A().PERM_KEYS.map((k) => `<option ${k === st.permKey ? 'selected' : ''}>${k}</option>`).join('')}</select>
        → <span class="mk-badge ${verdict ? 'success' : 'danger'}">${verdict ? '허용' : '거부'}</span>
      </div>
      <div class="adm-panel"><h3>역할 × 자원 매트릭스 <small>(V보기 C생성 E편집 D삭제 M관리)</small></h3>
        <div class="adm-scroll"><table class="adm-tbl adm-mtx"><tr><th>역할</th>${A().RESOURCES.map((r) => `<th>${r}</th>`).join('')}</tr>
        ${roles.map((r) => `<tr><td><b>${esc(A().ROLE_KO[r] || r)}</b></td>${A().RESOURCES.map((res) => `<td class="adm-mono">${cell(r, res)}</td>`).join('')}</tr>`).join('')}</table></div>
      </div>`;
  }
  const ACTIONS_SHORT = [{ k: 'view', s: 'V' }, { k: 'create', s: 'C' }, { k: 'edit', s: 'E' }, { k: 'delete', s: 'D' }, { k: 'manage', s: 'M' }];

  /* ---------- 보안 ---------- */
  function Security() {
    const sso = A().ssoList(st.org);
    const doms = A().domainList(st.org);
    const pol = A().effectivePolicy(st.org, null);
    return `
      <div class="adm-2col">
        <div class="adm-panel"><h3>로그인 시뮬레이터 (실판정)</h3>
          <div class="adm-form">
            <input data-adm="logEmail" value="${esc(st.logEmail)}" placeholder="이메일">
            <input data-adm="logPw" value="${esc(st.logPw)}" placeholder="비밀번호">
            <input data-adm="logIp" value="${esc(st.logIp)}" placeholder="IP">
            <input data-adm="logOtp" value="${esc(st.logOtp)}" placeholder="OTP (000000)">
            ${M().Button({ label: '로그인 시도', kind: 'primary', attrs: 'data-adm="tryLogin"' })}
            ${M().Button({ label: '오답 5회 → 자동 잠금 실연', attrs: 'data-adm="brute"' })}
          </div></div>
        <div class="adm-panel"><h3>조직 보안 정책</h3><table class="adm-tbl">
          ${[['2단계 인증 강제', pol.twoFactorRequired ? 'ON' : 'OFF'], ['세션 만료', pol.sessionTimeoutMin + '분'],
            ['IP 제한', (pol.ipAllow || []).join(', ') || '없음'], ['기기 제한', pol.deviceLimit || '없음'],
            ['비밀번호 정책', pol.passwordPolicy ? JSON.stringify(pol.passwordPolicy) : '기본']].map(([k, v]) => `<tr><td>${k}</td><td><b>${esc(v)}</b></td></tr>`).join('')}
        </table></div>
      </div>
      <div class="adm-2col">
        <div class="adm-panel"><h3>SSO</h3><table class="adm-tbl">${sso.map((s) => `<tr><td><b>${esc(s.provider)}</b></td><td>기본 역할 ${esc(s.defaultRole)}</td><td><span class="mk-badge ${s.enabled ? 'success' : ''}">${s.enabled ? '활성' : '비활성'}</span></td></tr>`).join('') || '<tr><td>구성 없음</td></tr>'}</table></div>
        <div class="adm-panel"><h3>도메인 인증</h3><table class="adm-tbl">${doms.map((d) => `<tr><td><b>${esc(d.domain)}</b></td><td class="adm-mono">${esc(d.token)}</td><td>${d.verified ? '<span class="mk-badge success">인증됨</span>' : `<button data-adm="verify:${esc(d.domain)}">TXT 검증</button>`}</td></tr>`).join('')}</table></div>
      </div>`;
  }

  /* ---------- 거버넌스: AI · 스토리지 · 라이선스 ---------- */
  function Gov() {
    const byDept = A().aiUsage(st.org, 'department');
    const byModel = A().aiUsage(st.org, 'model');
    const sr = A().storageReport(st.org);
    const users = A().listUsers(st.org);
    const bar = (v, cap) => `<div class="adm-bar"><i style="width:${Math.min(100, cap ? v / cap * 100 : 0)}%"></i></div>`;
    return `
      <div class="adm-2col">
        <div class="adm-panel"><h3>AI 사용량 — 부서별</h3><table class="adm-tbl">${byDept.map((r) => `<tr><td>${esc(r.key)}</td><td><b>${r.tokens.toLocaleString()}</b> tok</td></tr>`).join('')}</table>
          <h3>모델별</h3><table class="adm-tbl">${byModel.map((r) => `<tr><td>${esc(r.key)}</td><td><b>${r.tokens.toLocaleString()}</b> tok</td></tr>`).join('')}</table>
          ${M().Button({ label: 'k-vision 10만 tok 시도 (정책 위반 실연)', attrs: 'data-adm="aiTry"' })}</div>
        <div class="adm-panel"><h3>스토리지 ${gb(sr.total)} / ${gb(sr.cap)}</h3>${bar(sr.total, sr.cap)}
          <table class="adm-tbl"><tr><th>워크스페이스</th><th>사용</th></tr>${sr.byWorkspace.map((r) => `<tr><td>${esc(r.key)}</td><td>${gb(r.bytes)}</td></tr>`).join('')}</table>
          <table class="adm-tbl"><tr><th>사용자</th><th>사용</th></tr>${sr.byUser.slice(0, 5).map((r) => { const u = users.find((x) => x.userId === r.key); return `<tr><td>${esc(u ? u.name : r.key)}</td><td>${gb(r.bytes)}</td></tr>`; }).join('')}</table>
          ${M().Button({ label: '게스트 쿼터 초과 업로드 실연', attrs: 'data-adm="stTry"' })}</div>
      </div>
      <div class="adm-panel"><h3>라이선스</h3><table class="adm-tbl"><tr><th>타입</th><th>좌석</th><th>사용</th><th>만료</th><th></th></tr>
        ${A().licenseReport(st.org).map((l) => `<tr><td><b>${l.type}</b></td><td>${l.cap}</td><td>${l.used}</td><td>${l.expired}</td>
          <td>${l.cap ? `<button data-adm="licTry:${l.type}">추가 할당 시도</button>` : ''}</td></tr>`).join('')}</table></div>`;
  }

  /* ---------- 빌링 · 분석 ---------- */
  function Billing() {
    const bill = A().computeBill(st.org);
    const rep = A().billingReport(st.org);
    const an = A().analytics(st.org);
    return `
      <div class="adm-2col">
        <div class="adm-panel"><h3>이번 달 청구 미리보기 (${A().PLANS[rep.plan].name})</h3>
          <table class="adm-tbl">${bill.lines.map((l) => `<tr><td>${esc(l.item)}</td><td>${won(l.amount)}</td></tr>`).join('')}
          <tr><td>공급가액</td><td>${won(bill.supply)}</td></tr><tr><td>부가세(10%)</td><td>${won(bill.vat)}</td></tr>
          <tr><td><b>합계</b></td><td><b>${won(bill.total)}</b></td></tr></table>
          ${M().Button({ label: '청구서 발행', kind: 'primary', attrs: 'data-adm="invoice"' })}</div>
        <div class="adm-panel"><h3>청구서</h3><table class="adm-tbl"><tr><th>번호</th><th>기간</th><th>합계</th><th>상태</th><th></th></tr>
          ${rep.invoices.map((i) => `<tr><td class="adm-mono">${i.no}</td><td>${i.period}</td><td>${won(i.total)}</td>
            <td><span class="mk-badge ${i.paid ? 'success' : 'danger'}">${i.paid ? '결제됨' : '미결제'}</span></td>
            <td>${!i.paid ? `<button data-adm="pay:${i.no}">결제</button>` : `<button data-adm="tax:${i.no}">세금계산서</button>`}</td></tr>`).join('') || '<tr><td>없음</td></tr>'}</table>
          ${rep.taxInvoices.map((t) => `<div class="adm-code">📄 ${t.no} · 공급자 ${esc(t.supplier)}(${t.supplierRegNo}) → ${esc(t.buyer)} · 공급가 ${won(t.supply)} · 세액 ${won(t.vat)}</div>`).join('')}</div>
      </div>
      <div class="adm-panel"><h3>분석</h3><div class="adm-stats">
        ${Stat('DAU', an.dau)}${Stat('MAU', an.mau)}${Stat('프로젝트 생성', an.projects)}${Stat('Export', an.exports)}
        ${Stat('AI 토큰', an.aiTokens.toLocaleString())}${Stat('마켓 설치', an.marketInstalls)}</div></div>`;
  }

  /* ---------- 운영: 감사 · 심사 · 백업 · 알림 ---------- */
  function Ops() {
    const logs = A().auditQuery(st.org, { q: st.auditQ, limit: 12 });
    const mod = A().moderationQueue();
    const notifs = A().notifications(st.org).slice(0, 6);
    return `
      <div class="adm-panel"><h3>감사 로그</h3>
        <input class="mkt-search" placeholder="이벤트·내용 검색 (예: login, 잠금)" value="${esc(st.auditQ)}" data-adm="auditQ">
        <table class="adm-tbl">${logs.map((r) => `<tr><td>${ts(r.at)}</td><td>${esc(r.actor)}</td><td><b>${esc(r.event)}</b></td><td>${esc(r.detail)}</td><td class="adm-mono">${esc(r.ip)}</td></tr>`).join('')}</table>
        ${M().Button({ label: 'CSV 내보내기(미리보기)', attrs: 'data-adm="csv"' })}</div>
      <div class="adm-2col">
        <div class="adm-panel"><h3>콘텐츠 심사 (마켓 브리지)</h3>
          ${mod.open.map((r) => `<div class="adm-row">🚩 <b>${esc(r.kind)}</b> ${esc(r.targetId)} — ${esc(r.reason)}
            <button data-adm="takedown:${esc(r.targetId)}:${esc(r.id)}">내리기</button></div>`).join('') || '<p>열린 신고 없음</p>'}
          ${mod.resolved.slice(-3).map((r) => `<div class="adm-row adm-dim">✅ ${esc(r.kind)} ${esc(r.targetId)} → ${esc(r.action || 'resolved')}
            ${r.action === 'takedown' ? `<button data-adm="restoreItem:${esc(r.targetId)}">복구</button>` : ''}</div>`).join('')}</div>
        <div class="adm-panel"><h3>백업</h3>
          ${M().Button({ label: '지금 백업', attrs: 'data-adm="backup"' })}
          <table class="adm-tbl">${A().backupList(st.org).slice(-5).reverse().map((b) => `<tr><td>${ts(b.at)}</td><td>${esc(b.label)}</td><td>${(b.bytes / 1e3).toFixed(1)}KB</td><td class="adm-mono">${b.checksum}</td><td><button data-adm="restoreBk:${b.backupId}">복원</button></td></tr>`).join('')}</table>
          <h3>알림 센터</h3>${notifs.map((n) => `<div class="adm-row ${n.read ? 'adm-dim' : ''}">${{ security: '🛡', usage: '📈', storage: '💾', license: '🎫', plugin: '🔌' }[n.type]} ${esc(n.text)} ${!n.read ? `<button data-adm="read:${n.notifId}">읽음</button>` : ''}</div>`).join('') || '<p>알림 없음</p>'}</div>
      </div>`;
  }

  /* ---------- 조립 ---------- */
  const TABS = [['dash', '대시보드'], ['org', '조직'], ['users', '사용자'], ['perms', '권한'], ['security', '보안'], ['gov', '거버넌스'], ['billing', '빌링·분석'], ['ops', '운영']];
  function render() {
    const body = { dash: Dash, org: Org, users: Users, perms: Perms, security: Security, gov: Gov, billing: Billing, ops: Ops }[st.tab]();
    return `<div class="mkt-wrap adm-wrap">
      <div class="mkt-tabs">
        ${TABS.map(([k, l]) => `<button class="mkt-tab ${st.tab === k ? 'on' : ''}" data-adm="tab:${k}">${l}</button>`).join('')}
        <span style="flex:1"></span>
        <label class="pl-org">조직: <select data-adm="org">${A().listOrgs().map((o) => `<option value="${o.orgId}" ${st.org === o.orgId ? 'selected' : ''}>${o.logo} ${esc(o.name)}</option>`).join('')}</select></label>
      </div>
      ${st.msg ? `<div class="adm-msg ${st.msg.ok ? 'ok' : 'no'}">${esc(st.msg.text)}</div>` : ''}
      ${body}</div>`;
  }

  function mount(root) {
    const re = () => window.PG.render();
    const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach((el) => el[ev] = fn(el));
    on('[data-adm]', 'onclick', (el) => () => {
      const [cmd, a, b] = el.dataset.adm.split(':');
      const R = (r, okMsg) => { say(r.ok !== false, r.ok !== false ? okMsg : r.why); re(); };
      if (cmd === 'tab') { st.tab = a; st.msg = null; re(); }
      else if (cmd === 'lock') R(A().lockUser(st.org, a, 'admin'), '잠금 완료');
      else if (cmd === 'unlock') R(A().unlockUser(st.org, a, 'admin'), '잠금 해제');
      else if (cmd === 'deact') R(A().deactivateUser(st.org, a, 'admin'), '비활성화');
      else if (cmd === 'restore2') R(A().unlockUser(st.org, a, 'admin'), '활성화');
      else if (cmd === 'kick') { const r = A().forceLogout(st.org, a, 'admin'); R(r, `세션 ${r.killed || 0}개 종료`); }
      else if (cmd === 'del') R(A().removeUser(st.org, a, 'admin'), '삭제(복구 가능)');
      else if (cmd === 'restore') R(A().restoreUser(st.org, a, 'admin'), '복구 완료');
      else if (cmd === 'invite') R(A().inviteUser(st.org, 'invited' + Date.now() % 1000 + '@' + (A().getOrg(st.org).domain || 'x.kr'), 'editor'), '초대장 발송');
      else if (cmd === 'verify') { const d = A().domainList(st.org).find((x) => x.domain === a); R(A().verifyDomain(st.org, a, d.token), 'TXT 일치 — 인증 완료'); }
      else if (cmd === 'tryLogin') { const r = A().login(st.org, st.logEmail, st.logPw, { ip: st.logIp, otp: st.logOtp, device: 'sim' }); R(r, '로그인 성공 — 세션 ' + (r.token || '')); }
      else if (cmd === 'brute') { let r; for (let i = 0; i < 5; i++) r = A().login(st.org, st.logEmail, 'wrong-pw', { ip: st.logIp }); R({ ok: false, why: r.why + ' → 잠김 상태는 사용자 탭에서 확인' }); }
      else if (cmd === 'aiTry') { const u = A().listUsers(st.org)[0]; R(A().recordAI(st.org, u.userId, { model: 'k-vision', tokens: 100000 }), 'AI 기록됨'); }
      else if (cmd === 'stTry') { const g = A().listUsers(st.org).find((u) => u.role === 'guest') || A().listUsers(st.org)[0]; R(A().recordStorage(st.org, { userId: g.userId, kind: 'asset', bytes: 20e6 }), '업로드 기록됨'); }
      else if (cmd === 'licTry') { const free = A().listUsers(st.org).find((u) => !A().licenseOf(st.org, u.userId)); R(free ? A().assignLicense(st.org, free.userId, a, 'admin') : { ok: false, why: '미보유 사용자 없음' }, a + ' 할당 완료'); }
      else if (cmd === 'invoice') { const r = A().issueInvoice(st.org); R(r, '발행: ' + (r.invoice || {}).no + ' ' + won((r.invoice || {}).total)); }
      else if (cmd === 'pay') R(A().payInvoice(st.org, a), a + ' 결제 완료');
      else if (cmd === 'tax') { const r = A().taxInvoice(st.org, a); R(r, r.ok ? '세금계산서 ' + r.taxInvoice.no + ' 발행' : ''); }
      else if (cmd === 'csv') { say(true, A().auditCsv(st.org, { limit: 3 }).split('\n').slice(0, 4).join(' ⏎ ')); re(); }
      else if (cmd === 'takedown') R(A().takedown(st.org, a, 'admin', b), a + ' 내림(deprecated)');
      else if (cmd === 'restoreItem') R(A().restoreItem(st.org, a, 'admin'), a + ' 복구(published)');
      else if (cmd === 'backup') { const r = A().backup(st.org, '수동 백업'); R(r, '백업 완료 · 체크섬 ' + r.checksum); }
      else if (cmd === 'restoreBk') R(A().restoreBackup(st.org, a), '스냅샷 복원 완료');
      else if (cmd === 'read') R(A().markRead(st.org, a), '읽음 처리');
    });
    on('select[data-adm]', 'onchange', (el) => () => {
      const [cmd, a] = el.dataset.adm.split(':');
      if (cmd === 'org') { st.org = el.value; st.msg = null; }
      else if (cmd === 'plan') { const r = A().updateOrg(st.org, { plan: el.value, _actor: 'admin' }); say(r.ok, r.ok ? '플랜 변경: ' + el.value : r.why); }
      else if (cmd === 'ustate') st.ustate = el.value;
      else if (cmd === 'polUser') st.selUser = el.value;
      else if (cmd === 'permWho') st.permWho = el.value;
      else if (cmd === 'permKey') st.permKey = el.value;
      else if (cmd === 'role') { const r = A().setUserRole(st.org, a, el.value, 'admin'); say(r.ok, r.ok ? '역할 변경: ' + el.value : r.why); }
      re();
    });
    on('input[data-adm]', 'onkeydown', (el) => (e) => {
      if (e.key !== 'Enter') return;
      const k = el.dataset.adm;
      if (k === 'uq') st.uq = el.value; else if (k === 'auditQ') st.auditQ = el.value;
      else st[k] = el.value;
      re();
    });
    ['logEmail', 'logPw', 'logIp', 'logOtp'].forEach((k) => on(`input[data-adm="${k}"]`, 'onblur', (el) => () => { st[k] = el.value; }));
  }

  return { title: 'Admin', variants: ['Console'], flush: true, render: () => render(), mount, _st: st };
})();
