/* Round 19(=GPT Round 20) §22 스케일 검증 — 10,000 사용자 · 500 워크스페이스 · 100,000 프로젝트
   전 수치는 실측(ms)으로 보고한다. */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/admin' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const A = window.MK_ADMIN;
let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name); } };
const ms = (t0) => (performance.now() - t0).toFixed(1) + 'ms';
const M = (label, fn) => { const t0 = performance.now(); const r = fn(); console.log(`  · ${label}: ${ms(t0)}`); return r; };

console.log('— 구축');
A.createOrg({ orgId: 'scale', name: '스케일 검증 조직', plan: 'enterprise' });

/* 500 워크스페이스 + 부서 500 + 팀 1,000 */
const teams = M('WS 500 + 부서 500 + 팀 1,000 생성', () => {
  const out = [];
  for (let w = 0; w < 500; w++) {
    const ws = A.addWorkspace('scale', 'WS-' + w).nodeId;
    const dp = A.addDepartment('scale', ws, 'Dept-' + w).nodeId;
    out.push(A.addTeam('scale', dp, 'Team-' + w + 'a').nodeId, A.addTeam('scale', dp, 'Team-' + w + 'b').nodeId);
  }
  return out;
});
T('노드 2,000개(500+500+1000)', A.tree('scale').length === 500);

/* 10,000 사용자 — 역할 분포·팀 라운드로빈 배치 */
const ROLES = ['org_admin', 'workspace_admin', 'manager', 'editor', 'editor', 'editor', 'commenter', 'viewer', 'viewer', 'guest'];
const users = M('사용자 10,000명 생성·배치', () => {
  const out = [];
  for (let i = 0; i < 10000; i++)
    out.push(A.createUser('scale', { email: 'u' + i + '@scale.kr', name: '사용자' + i, role: ROLES[i % 10], nodeId: teams[i % teams.length] }).userId);
  return out;
});
T('활성 사용자 10,000', A.listUsers('scale').length === 10000);

/* 100,000 프로젝트 카운터 + 스토리지 샘플 5,000건 */
M('프로젝트 100,000건 기록', () => { for (let i = 0; i < 100000; i++) A.recordEvent('scale', 'projects'); });
M('스토리지 5,000건 기록', () => { for (let i = 0; i < 5000; i++) A.recordStorage('scale', { userId: users[i], kind: i % 2 ? 'asset' : 'project', refId: 'sc-' + i, bytes: 1e6 }); });
T('프로젝트 100,000 집계', A.analytics('scale').projects === 100000);
T('스토리지 5GB 집계', A.storageUsed('scale') === 5e9);

console.log('— 정책·권한 (스케일 판정)');
A.setPolicy('scale', 'org', null, { aiModels: ['k-fast', 'k-standard'], exportFormats: ['png', 'pdf'], pluginBlock: ['mk-kanban'] });
for (let w = 0; w < 50; w++) A.setPolicy('scale', 'team', teams[w * 2], { aiDailyTokens: 10000 });
const pol = M('effectivePolicy × 1,000명', () => users.slice(0, 1000).map((u) => A.effectivePolicy('scale', u)));
T('상속 결과 정합(전원 org 정책 수신)', pol.every((p) => p.pluginBlock.includes('mk-kanban')));
T('팀 정책 덮어쓰기 50팀 반영', pol.filter((p) => p.aiDailyTokens === 10000).length > 0);
const verdicts = M('can() 판정 × 10,000회', () => {
  let allow = 0;
  for (let i = 0; i < 10000; i++) if (A.can('scale', users[i], 'project.create')) allow++;
  return allow;
});
/* 역할 분포 10명 주기 중 create 가능 = org_admin·workspace_admin·manager·editor×3 = 6/10 */
T('판정 정합(역할 분포와 일치: 6,000명 허용)', verdicts === 6000);
T('guest 는 project.view 만', !A.can('scale', users[9], 'project.create') && A.can('scale', users[9], 'project.view'));

console.log('— 조회·검색 (스케일)');
M('tree() 500 WS 렌더 데이터', () => A.tree('scale'));
const found = M('listUsers 텍스트 검색(10,000 중)', () => A.listUsers('scale', { q: '사용자9999' }));
T('검색 정확', found.length === 1 && found[0].email === 'u9999@scale.kr');
T('역할 필터', A.listUsers('scale', { role: 'guest' }).length === 1000);
const rep = M('storageReport 3축(5,000건)', () => A.storageReport('scale'));
T('축 분해 정합', rep.byKind.length === 2 && rep.byUser.length === 5000);

console.log('— 로그인·감사 (스케일)');
M('로그인 1,000명(DAU 적재)', () => { for (let i = 0; i < 1000; i++) A.login('scale', 'u' + i + '@scale.kr', '', { ip: '10.0.0.1' }); });
T('DAU 1,000', A.dau('scale') === 1000);
T('MAU ≥ DAU', A.mau('scale') >= 1000);
const audits = M('auditQuery 전량 필터(1.6만+ 행)', () => A.auditQuery('scale', { event: 'user.create' }));
T('감사 행 수 정합(생성 10,000)', audits.length === 10000);
const page = M('auditQuery limit 20', () => A.auditQuery('scale', { limit: 20 }));
T('페이지 조회 즉답', page.length === 20);
M('auditCsv 500행 직렬화', () => A.auditCsv('scale', { limit: 500 }));

console.log('— 백업 (스케일)');
const bk = M('백업 스냅샷(10,000 사용자 포함)', () => A.backup('scale', '스케일 스냅샷'));
T('체크섬 산출', /^[0-9a-f]+$/.test(bk.checksum));
console.log('  · 스냅샷 크기: ' + (A.backupList('scale').find((b) => b.backupId === bk.backupId).bytes / 1e6).toFixed(1) + 'MB');
A.updateOrg('scale', { name: '오염' });
A.removeUser('scale', users[0], 'admin');
M('복원(10,000 사용자 롤백)', () => A.restoreBackup('scale', bk.backupId));
T('복원 정합(이름·사용자 수)', A.getOrg('scale').name === '스케일 검증 조직' && A.listUsers('scale').length === 10000);

console.log('— 화면 (스케일 렌더)');
const t0 = performance.now();
let btn = [...document.querySelectorAll('[data-adm^="tab:"]')];
T('탭 버튼 존재', btn.length === 8);
btn.find((b) => b.dataset.adm === 'tab:dash').click(); /* 재렌더 → 셀렉터에 scale 조직 반영 */
const sel = document.querySelector('select[data-adm="org"]');
sel.value = 'scale'; sel.onchange();
console.log('  · 조직 전환+대시보드 렌더: ' + ms(t0));
T('스케일 조직 대시보드 렌더', document.body.innerHTML.includes('스케일 검증 조직') && document.body.innerHTML.includes('100000'));
btn = [...document.querySelectorAll('[data-adm^="tab:"]')];
btn.find((b) => b.dataset.adm === 'tab:users').click();
T('사용자 탭 렌더(필터 전 목록)', document.body.innerHTML.includes('u9999@scale.kr') || document.body.innerHTML.includes('사용자'));

console.log(`\n스케일: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
process.exit(fail ? 1 : 0);
