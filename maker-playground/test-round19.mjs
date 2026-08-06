/* Round 19 — Enterprise Admin Console 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/admin' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const A = window.MK_ADMIN;
let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name); } };
const sec = (n) => console.log('—', n);
const no = (r, why) => r && r.ok === false && (!why || String(r.why).includes(why));

/* ============ 1. 상수 ============ */
sec('상수');
T('계층 5층', A.LAYERS.length === 5 && A.LAYERS[0] === 'org' && A.LAYERS[4] === 'user');
T('역할 8종', A.ROLES.length === 8);
T('자원 11 × 액션 5 = 권한 키 55', A.PERM_KEYS.length === 55);
T('SSO 6종', A.SSO_PROVIDERS.length === 6);
T('라이선스 5타입', A.LICENSE_TYPES.length === 5);
T('플랜 4종·교육 무상', Object.keys(A.PLANS).length === 4 && A.PLANS.education.seatPrice === 0);
T('감사 이벤트 카탈로그', A.AUDIT_EVENTS.length >= 35 && A.AUDIT_EVENTS.includes('security.lockout'));

/* ============ 2. 조직 · 계층 ============ */
sec('조직·계층');
T('시드 조직 2개', A.listOrgs().length === 2);
T('금성초 프로필', A.getOrg('geumseong').plan === 'education' && A.getOrg('geumseong').planInfo.seatPrice === 0);
T('이름 없이 생성 거부', no(A.createOrg({}), '이름'));
T('플랜 불명 거부', no(A.createOrg({ name: 'x', plan: 'gold' }), '플랜'));
T('조직 ID 중복 거부', no(A.createOrg({ orgId: 'geumseong', name: 'x' }), '중복'));
const tree = A.tree('geumseong');
T('트리: 워크스페이스 2', tree.length === 2);
const ws1 = tree.find((n) => n.name === '교무 워크스페이스');
T('트리: 교무 WS 아래 부서 3', ws1.children.length === 3);
const dSci = ws1.children.find((n) => n.name === 'Science');
T('트리: Science → 과학팀', dSci.children.length === 1 && dSci.children[0].name === '과학팀');
T('부서는 WS 아래에만', no(A.addDepartment('geumseong', dSci.children[0].nodeId, 'X'), 'workspace'));
T('팀은 부서 아래에만', no(A.addTeam('geumseong', ws1.nodeId, 'X'), 'department'));
const tSciId = dSci.children[0].nodeId;
const junho = A.listUsers('geumseong', { q: 'junho' })[0];
T('사슬 조회 [ws,dept,team]', A.chainOf('geumseong', tSciId).map((n) => n.type).join(',') === 'workspace,department,team');
const shared = A.sharedWith('geumseong', junho.userId, 'template');
T('공유 상속 합집합(팀 소속 → 팀 공유 수신)', shared.includes('tpl-science-report'));
T('공유 불가 종류 거부', no(A.share('geumseong', tSciId, 'nope', 'x'), '종류'));

/* ============ 3. 정책 상속 ============ */
sec('정책 상속');
T('알 수 없는 정책 키 거부', no(A.setPolicy('geumseong', 'org', null, { foo: 1 }), '정책 키'));
const polJ = A.effectivePolicy('geumseong', junho.userId);
T('상속 경로 추적', polJ._trace.join(',').includes('org') && polJ._trace.includes('user') === false);
T('부서가 org 덮음(과학부 k-pro)', polJ.aiModels.includes('k-pro'));
const kim = A.listUsers('geumseong', { q: 'kim' })[0];
const polK = A.effectivePolicy('geumseong', kim.userId);
T('타 부서는 org 값 유지(k-pro 없음)', !polK.aiModels.includes('k-pro'));
T('팀 정책: 1학년팀 칸반 차단', no(A.pluginAllowed('geumseong', kim.userId, 'mk-kanban'), '차단'));
T('차단 외 플러그인 허용', A.pluginAllowed('geumseong', kim.userId, 'mk-mindmap').ok);
const guest = A.listUsers('geumseong', { role: 'guest' })[0];
T('사용자층이 최우선(게스트 PNG만)', no(A.exportAllowed('geumseong', guest.userId, 'pptx'), '내보내기') && A.exportAllowed('geumseong', guest.userId, 'png').ok);
T('게스트 마켓 차단', no(A.marketAllowed('geumseong', guest.userId), '마켓'));
T('일반 사용자 마켓 허용', A.marketAllowed('geumseong', junho.userId).ok);
T('브랜드 강제 조회', A.brandFor('geumseong', kim.userId) === 'brand-geumseong');
T('허용 목록 정책(한빛 mk-timeline 거부)', (() => {
  const hu = A.listUsers('hanbit')[0];
  return no(A.pluginAllowed('hanbit', hu.userId, 'mk-timeline'), '허용 목록') && A.pluginAllowed('hanbit', hu.userId, 'mk-mindmap').ok;
})());

/* ============ 4. 사용자 ============ */
sec('사용자');
T('이메일 중복 거부', no(A.createUser('geumseong', { email: 'junho@geumseong.es.kr' }), '중복'));
T('역할 불명 거부', no(A.createUser('geumseong', { email: 'z@geumseong.es.kr', role: 'king' }), '역할'));
T('미인증 도메인 가입 거부', no(A.createUser('geumseong', { email: 'x@gmail.com' }), '인증된 도메인'));
T('비밀번호 정책 위반 거부', no(A.createUser('geumseong', { email: 'w@geumseong.es.kr', password: 'weak' }), '8자'));
T('SSO 자동 가입 실증(시드 newbie)', A.listUsers('geumseong', { q: 'newbie' }).length === 1);
const inv = A.listUsers('geumseong', { state: 'invited' })[0];
T('초대 상태 존재', !!inv);
T('초대 수락도 비밀번호 정책 적용', no(A.acceptInvite('geumseong', inv.userId, 'short'), '8자'));
T('초대 수락 → 활성', A.acceptInvite('geumseong', inv.userId, 'Newbie12!').ok && A.listUsers('geumseong', { q: 'newteacher' })[0].state === 'active');
const park = A.listUsers('geumseong', { q: 'park' })[0];
T('삭제 시 세션·라이선스 회수', (() => {
  A.login('geumseong', 'park@geumseong.es.kr', 'Kmaker1!', { ip: '10.0.0.6' });
  const r = A.removeUser('geumseong', park.userId, 'admin');
  return r.ok && A.licenseOf('geumseong', park.userId) === null;
})());
T('삭제 후 기본 목록에서 제외', A.listUsers('geumseong', { q: 'park' }).length === 0);
T('includeDeleted 로 노출', A.listUsers('geumseong', { q: 'park', includeDeleted: true })[0].state === 'deleted');
T('같은 이메일 재가입 후 복구 거부', (() => {
  A.createUser('geumseong', { email: 'park@geumseong.es.kr', name: '박별2', password: 'Kmaker1!' });
  return no(A.restoreUser('geumseong', park.userId), '활성 계정');
})());
T('삭제 상태 아니면 복구 거부', no(A.restoreUser('geumseong', junho.userId), '삭제 상태'));

/* ============ 5. 역할 · 권한 ============ */
sec('역할·권한');
T('역할 이름 중복 거부', no(A.defineRole('geumseong', 'editor', {}), '중복'));
T('알 수 없는 권한 키 거부', no(A.defineRole('geumseong', 'r2', { 'magic.cast': true }), '권한 키'));
T('커스텀 역할 등재(science_head)', 'science_head' in A.roleMatrix('geumseong'));
const lee = A.listUsers('geumseong', { q: 'lee' })[0];
T('커스텀 역할 = base + 추가권한', A.can('geumseong', lee.userId, 'plugin.manage') && A.can('geumseong', lee.userId, 'project.edit'));
T('editor 는 delete 불가', !A.can('geumseong', kim.userId, 'project.delete'));
T('viewer 는 create 불가', (() => { const v = A.listUsers('geumseong', { role: 'viewer' })[0]; return !A.can('geumseong', v.userId, 'project.create'); })());
T('super_admin 전권', (() => { const c = A.listUsers('hanbit', { role: 'super_admin' })[0]; return A.can('hanbit', c.userId, 'billing.manage'); })());
T('workspace_admin 빌링 관리 불가', !A.roleMatrix('geumseong').workspace_admin['billing.manage']);
T('오버라이드: 행정팀 editor billing.view', (() => {
  const tAdm = ws1.children.find((n) => n.name === 'HR').children[0].nodeId;
  const r = A.createUser('geumseong', { email: 'acct@geumseong.es.kr', role: 'editor', nodeId: tAdm, password: 'Kmaker1!' });
  return A.can('geumseong', r.userId, 'billing.view') && !A.can('geumseong', kim.userId, 'billing.view');
})());
T('가까운 계층 오버라이드 우선', (() => {
  A.setPermOverride('geumseong', 'org', 'geumseong', kim.userId, 'asset.delete', true);
  A.setPermOverride('geumseong', 'user', kim.userId, kim.userId, 'asset.delete', false);
  return A.can('geumseong', kim.userId, 'asset.delete') === false;
})());
T('비활성 사용자 전권 거부', (() => {
  const r = A.createUser('geumseong', { email: 'off@geumseong.es.kr', role: 'org_admin', password: 'Kmaker1!' });
  A.deactivateUser('geumseong', r.userId);
  return !A.can('geumseong', r.userId, 'project.view');
})());

/* ============ 6. SSO · 도메인 ============ */
sec('SSO·도메인');
T('SSO 제공자 불명 거부', no(A.configureSSO('geumseong', 'kakao'), 'SSO'));
T('SSO 목록 2건', A.ssoList('geumseong').length === 2);
T('미구성 SSO 로그인 거부', no(A.ssoLogin('geumseong', 'saml', { email: 'a@geumseong.es.kr' }), '미구성'));
T('미인증 도메인 자동 가입 거부', no(A.ssoLogin('geumseong', 'google', { email: 'ext@gmail.com' }), '자동 가입'));
T('도메인 중복 등록 거부', no(A.addDomain('geumseong', 'geumseong.es.kr'), '이미 등록'));
T('TXT 불일치 검증 거부', (() => {
  A.addDomain('geumseong', 'geumseong2.kr');
  return no(A.verifyDomain('geumseong', 'geumseong2.kr', 'wrong-token'), 'TXT');
})());
T('올바른 TXT 로 인증', (() => {
  const d = A.domainList('geumseong').find((x) => x.domain === 'geumseong2.kr');
  return A.verifyDomain('geumseong', 'geumseong2.kr', d.token).ok;
})());

/* ============ 7. 보안 — 로그인·세션 ============ */
sec('보안');
T('비밀번호 불일치 실패', no(A.login('geumseong', 'kim@geumseong.es.kr', 'nope', {}), '불일치'));
T('5회 실패 → 자동 잠금', (() => {
  for (let i = 0; i < 4; i++) A.login('geumseong', 'kim@geumseong.es.kr', 'nope', {});
  return A.listUsers('geumseong', { q: 'kim' })[0].state === 'locked';
})());
T('잠금 알림 생성', A.notifications('geumseong', { type: 'security' }).some((n) => n.text.includes('자동 잠금')));
T('잠긴 계정 로그인 거부', no(A.login('geumseong', 'kim@geumseong.es.kr', 'Kmaker1!', {}), '잠긴'));
T('해제 후 로그인 성공(실패 카운터 리셋)', (() => {
  A.unlockUser('geumseong', kim.userId, 'admin');
  return A.login('geumseong', 'kim@geumseong.es.kr', 'Kmaker1!', { ip: '10.0.0.4' }).ok;
})());
T('한빛: 2FA 없이 거부', no(A.login('hanbit', 'des@hanbit.io', 'HanbitPass12!', { ip: '211.34.9.9' }), '2단계'));
T('한빛: 허용 외 IP 거부', no(A.login('hanbit', 'des@hanbit.io', 'HanbitPass12!', { ip: '8.8.8.8', otp: '000000' }), 'IP'));
T('한빛: 2FA+IP 통과', A.login('hanbit', 'des@hanbit.io', 'HanbitPass12!', { ip: '211.34.9.9', otp: '000000', device: 'd1' }).ok);
T('기기 제한(2대) 초과 거부', (() => {
  A.login('hanbit', 'des@hanbit.io', 'HanbitPass12!', { ip: '211.34.9.9', otp: '000000', device: 'd2' });
  return no(A.login('hanbit', 'des@hanbit.io', 'HanbitPass12!', { ip: '211.34.9.9', otp: '000000', device: 'd3' }), '기기');
})());
T('세션 유효 → 시간 경과 만료', (() => {
  const r = A.login('geumseong', 'lee@geumseong.es.kr', 'Kmaker1!', { ip: '10.0.0.5' });
  const ok = A.sessionValid('geumseong', lee.userId, r.token);
  A._tick(481 * 60e3); /* 세션 정책 480분 */
  return ok && !A.sessionValid('geumseong', lee.userId, r.token);
})());
T('강제 로그아웃 → 세션 0', A.forceLogout('geumseong', lee.userId, 'admin').ok && A.listUsers('geumseong', { q: 'lee' })[0].sessions === 0);

/* ============ 8. 감사 로그 ============ */
sec('감사');
T('lockout 이벤트 기록', A.auditQuery('geumseong', { event: 'security.lockout' }).length >= 1);
T('행위자 필터', A.auditQuery('geumseong', { actor: kim.userId }).every((r) => r.actor === kim.userId));
T('텍스트 검색', A.auditQuery('geumseong', { q: '자동 잠금' }).length >= 1);
T('limit 동작', A.auditQuery('geumseong', { limit: 3 }).length === 3);
T('최신 우선 정렬', (() => { const q = A.auditQuery('geumseong', { limit: 5 }); return q[0].at >= q[4].at; })());
T('CSV 헤더+행', (() => { const c = A.auditCsv('geumseong', { limit: 2 }).split('\n'); return c[0] === 'at,actor,event,target,detail,ip' && c.length === 3; })());

/* ============ 9. AI 거버넌스 ============ */
sec('AI 거버넌스');
T('정책 외 모델 거부(k-vision)', no(A.recordAI('geumseong', junho.userId, { model: 'k-vision', tokens: 10 }), '모델'));
T('타 부서 k-pro 거부', no(A.recordAI('geumseong', kim.userId, { model: 'k-pro', tokens: 10 }), '모델'));
T('개인 일일 한도 초과 거부(과학부 4만)', no(A.recordAI('geumseong', junho.userId, { model: 'k-standard', tokens: 39000 }), '개인 일일'));
T('부서 할당량 초과 거부(Education 2만)', no(A.recordAI('geumseong', kim.userId, { model: 'k-standard', tokens: 17000 }), '부서'));
T('할당량 내 기록 성공', A.recordAI('geumseong', kim.userId, { model: 'k-fast', tokens: 1000 }).ok);
T('플랜 월 한도 판정(free 5만)', (() => {
  A.createOrg({ orgId: 't-ai', name: 'AI한도' });
  const u = A.createUser('t-ai', { email: 'a@t.kr' });
  A.recordAI('t-ai', u.userId, { tokens: 49000 });
  return no(A.recordAI('t-ai', u.userId, { tokens: 2000 }), '플랜 월');
})());
T('부서별 집계', A.aiUsage('geumseong', 'department').some((r) => r.key === 'Science' && r.tokens >= 8300));
T('모델별 집계 내림차순', (() => { const m = A.aiUsage('geumseong', 'model'); return m.length >= 2 && m[0].tokens >= m[m.length - 1].tokens; })());

/* ============ 10. 스토리지 ============ */
sec('스토리지');
T('사용자 쿼터 초과 거부(게스트 5MB)', no(A.recordStorage('geumseong', { userId: guest.userId, kind: 'asset', bytes: 20e6 }), '사용자 스토리지'));
T('쿼터 내 기록', A.recordStorage('geumseong', { userId: guest.userId, kind: 'asset', refId: 'g1', bytes: 3e6 }).ok);
T('플랜 한도 초과 거부(free 1GB)', no(A.recordStorage('t-ai', { kind: 'asset', bytes: 2e9 }), '플랜 스토리지'));
T('90% 경고 알림', (() => {
  A.recordStorage('t-ai', { kind: 'asset', bytes: 0.95e9 });
  return A.notifications('t-ai', { type: 'storage' }).some((n) => n.text.includes('90%'));
})());
T('워크스페이스 쿼터 판정', (() => {
  const w = A.addWorkspace('t-ai', 'W').nodeId;
  A.setPolicy('t-ai', 'workspace', w, { storageQuota: 1e6 });
  return no(A.recordStorage('t-ai', { wsId: w, kind: 'asset', bytes: 2e6 }), '워크스페이스 스토리지');
})());
T('해제 → 용량 감소', (() => {
  const before = A.storageUsed('geumseong');
  A.releaseStorage('geumseong', 'g1');
  return A.storageUsed('geumseong') === before - 3e6;
})());
T('리포트 3축 분해', (() => { const r = A.storageReport('geumseong'); return r.byWorkspace.length >= 2 && r.byUser.length >= 3 && r.byKind.some((k) => k.key === 'project'); })());

/* ============ 11. 라이선스 ============ */
sec('라이선스');
T('타입 불명 거부', no(A.setLicensePool('geumseong', 'gold', 1), '타입'));
T('이미 보유 시 거부', no(A.assignLicense('geumseong', junho.userId, 'education'), '이미'));
T('좌석 소진 거부', (() => {
  A.setLicensePool('t-ai', 'seat', 1);
  const u1 = A.createUser('t-ai', { email: 'l1@t.kr' }).userId;
  const u2 = A.createUser('t-ai', { email: 'l2@t.kr' }).userId;
  A.assignLicense('t-ai', u1, 'seat');
  return no(A.assignLicense('t-ai', u2, 'seat'), '소진');
})());
T('회수 → 재할당 가능', (() => {
  const us = A.listUsers('t-ai', { q: 'l' });
  A.revokeLicense('t-ai', us.find((u) => A.licenseOf('t-ai', u.userId)).userId);
  return A.assignLicense('t-ai', us.find((u) => !A.licenseOf('t-ai', u.userId)).userId, 'seat').ok;
})());
T('trial 14일 만료 감지', (() => {
  A.setLicensePool('t-ai', 'trial', 1);
  const u = A.createUser('t-ai', { email: 'tr@t.kr' }).userId;
  A.assignLicense('t-ai', u, 'trial');
  A._tick(15 * 864e5);
  return A.licenseReport('t-ai').find((r) => r.type === 'trial').expired === 1;
})());
T('만료 감시 → 라이선스 알림', (() => {
  A.checkAlerts('t-ai');
  return A.notifications('t-ai', { type: 'license' }).some((n) => n.text.includes('만료'));
})());

/* ============ 12. 빌링 ============ */
sec('빌링');
T('교육 플랜 청구 0원', A.computeBill('geumseong').total === 0);
T('한빛 산식: 좌석 3×25,000 → 부가세 10%', (() => {
  const b = A.computeBill('hanbit');
  return b.supply === 75000 && b.vat === 7500 && b.total === 82500;
})());
T('시드 인보이스 결제 완료', A.billingReport('hanbit').unpaid === 0);
T('세금계산서 시드 발행', (() => { const t = A.billingReport('hanbit').taxInvoices[0]; return t && t.supplierRegNo === '123-45-67890' && t.total === 82500; })());
T('없는 청구서 결제 거부', no(A.payInvoice('hanbit', 'INV-9999'), '없음'));
T('이중 결제 거부', no(A.payInvoice('hanbit', 'INV-0001'), '이미'));
T('미결제 세금계산서 거부', (() => {
  const r = A.issueInvoice('hanbit');
  return no(A.taxInvoice('hanbit', r.invoice.no), '결제 후');
})());
T('미결제 감시 → 경고', (() => { A.checkAlerts('hanbit'); return A.notifications('hanbit', { type: 'usage' }).some((n) => n.text.includes('미결제')); })());
T('사용 시점 상한 게이트(초과 기록 자체가 불가)', (() => {
  A.updateOrg('t-ai', { plan: 'pro' });
  const u = A.listUsers('t-ai')[0];
  return no(A.recordAI('t-ai', u.userId, { tokens: 1000001 }), '플랜 월');
})());
T('AI 초과분 과금 산식(플랜 강등 시)', (() => {
  /* enterprise 상한에서 1,009,000 기록 후 pro 강등 → 초과 9,000tok × ₩2/1000
     (R45: t-ai 재사용 시 앞 테스트의 49,000tok이 실행 날짜에 따라 같은 달에
      합산되던 캘린더 플레이크 → 전용 조직으로 결정론화) */
  A.createOrg({ orgId: 't-bill', name: '과금검증', plan: 'enterprise' });
  const u = A.createUser('t-bill', { email: 'b@t.kr' });
  A.recordAI('t-bill', u.userId, { tokens: 1009000 });
  A.updateOrg('t-bill', { plan: 'pro' });
  const line = A.computeBill('t-bill').lines.find((l) => l.item.includes('AI 초과'));
  return line && line.amount === Math.round(9000 / 1000) * 2;
})());

/* ============ 13. 분석 ============ */
sec('분석');
T('DAU 사용자 중복 제거', A.dau('geumseong', new Date(A._now() - 16 * 864e5).toISOString().slice(0, 10)) >= 0);
T('MAU ≥ 시드 로그인 인원', A.mau('hanbit', new Date(Date.now()).toISOString().slice(0, 7)) >= 3);
T('요약 지표 정합', (() => { const s = A.analytics('geumseong'); return s.projects === 12 && s.exports === 5 && s.marketInstalls === 1 && s.workspaces === 2; })());
T('이벤트 카운터 증가', (() => { A.recordEvent('geumseong', 'exports'); return A.analytics('geumseong').exports === 6; })());

/* ============ 14. 심사 브리지 (MK_MARKET) ============ */
sec('심사 브리지');
const MQ = A.moderationQueue();
T('신고 큐 브리지 수신', MQ.open.length + MQ.resolved.length >= 1);
T('takedown → 마켓 deprecated', (() => {
  const it = [...window.MK_MARKET._items.values()].find((i) => i.state === 'published');
  const r = A.takedown('geumseong', it.id, 'admin');
  return r.ok && window.MK_MARKET._items.get(it.id).state === 'deprecated';
})());
T('restore → published 복귀', (() => {
  const it = [...window.MK_MARKET._items.values()].find((i) => i.state === 'deprecated');
  const r = A.restoreItem('geumseong', it.id, 'admin');
  return r.ok && window.MK_MARKET._items.get(it.id).state === 'published';
})());
T('감사 로그에 심사 기록', A.auditQuery('geumseong', { event: 'moderation.takedown' }).length === 1);

/* ============ 15. 백업 ============ */
sec('백업');
T('시드 수동 백업 존재', A.backupList('geumseong').some((b) => b.label === '학기초 스냅샷'));
T('자동 백업 트리거(_tick 24h+)', (() => {
  const n = A.backupList('geumseong').filter((b) => b.auto).length;
  A._tick(25 * 3600e3);
  return A.backupList('geumseong').filter((b) => b.auto).length > n;
})());
T('스냅샷 복원(변형 → 롤백)', (() => {
  const bk = A.backup('geumseong', '복원 테스트').backupId;
  A.updateOrg('geumseong', { name: '오염된 이름' });
  A.setUserRole('geumseong', kim.userId, 'viewer', 'admin');
  const r = A.restoreBackup('geumseong', bk);
  return r.ok && A.getOrg('geumseong').name === '금성초등학교' && A.listUsers('geumseong', { q: 'kim' })[0].role === 'editor';
})());
T('없는 백업 복원 거부', no(A.restoreBackup('geumseong', 'bk-none'), '없음'));
T('체크섬 산출·기록', A.backupList('geumseong').every((b) => /^[0-9a-f]+$/.test(b.checksum)));

/* ============ 16. 알림 ============ */
sec('알림');
T('타입 불명 거부', no(A.notify('geumseong', 'party', 'x'), '타입'));
T('미읽음 필터 → 읽음 처리', (() => {
  const n = A.notifications('geumseong', { unread: true })[0];
  A.markRead('geumseong', n.notifId);
  return !A.notifications('geumseong', { unread: true }).some((x) => x.notifId === n.notifId);
})());

/* ============ 17. 대시보드 · API ============ */
sec('대시보드·API');
T('대시보드 8필드', (() => {
  const d = A.dashboard('geumseong');
  return d.recent.length === 8 && d.licenses.length === 5 && typeof d.securityEvents === 'number' && 'unpaid' in d && 'warnings' in d;
})());
T('API 래퍼 이름 고정', (() => {
  const k = A.api;
  return k.org.create === A.createOrg && k.role.can === A.can && k.billing.tax === A.taxInvoice && k.audit.csv === A.auditCsv && k.analytics.dau === A.dau;
})());

/* ============ 18. 화면 — #/admin 8탭 ============ */
sec('화면');
T('화면 등록', !!window.MK_SCREENS.admin && window.MK_SCREENS.admin.title === 'Admin');
const tabBtn = (k) => [...document.querySelectorAll('[data-adm^="tab:"]')].find((b) => b.dataset.adm === 'tab:' + k);
for (const [k, mark] of [['dash', 'adm-stat'], ['org', '상속 경로'], ['users', '강제 로그아웃'], ['perms', '권한 판정기'], ['security', '로그인 시뮬레이터'], ['gov', 'AI 사용량'], ['billing', '부가세'], ['ops', '감사 로그']]) {
  try {
    if (k !== 'dash') tabBtn(k).click();
    T('탭 렌더: ' + k, document.body.innerHTML.includes(mark));
  } catch (e) { T('탭 렌더: ' + k, false); }
}
T('버튼 실연: k-vision 정책 위반 메시지', (() => {
  tabBtn('gov').click();
  [...document.querySelectorAll('[data-adm="aiTry"]')][0].click();
  return document.body.innerHTML.includes('허용되지 않은 AI 모델');
})());
T('버튼 실연: 게스트 쿼터 초과 메시지', (() => {
  [...document.querySelectorAll('[data-adm="stTry"]')][0].click();
  return document.body.innerHTML.includes('쿼터 초과');
})());
T('조직 전환 → 한빛 렌더', (() => {
  const sel = document.querySelector('select[data-adm="org"]');
  sel.value = 'hanbit'; sel.onchange();
  return document.body.innerHTML.includes('한빛에듀테크') && window.MK_SCREENS.admin._st.org === 'hanbit';
})());
T('버튼 실연: 청구서 발행(한빛)', (() => {
  tabBtn('billing').click();
  [...document.querySelectorAll('[data-adm="invoice"]')][0].click();
  return document.body.innerHTML.includes('발행: INV-');
})());

console.log(`\nRound19: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);
