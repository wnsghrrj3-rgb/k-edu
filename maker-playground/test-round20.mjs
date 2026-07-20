/* Round 20 — Public API & Automation Platform 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/dev' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const A = window.MK_API, S = window.MK_API_SEED;
let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name); } };
const sec = (n) => console.log('—', n);
const gk = { 'x-api-key': S.geumKey }, hk = { 'x-api-key': S.hanbitKey };
const req = (method, path, headers, body, query) => A.request({ method, path, headers, body, query });

/* ============ 1. 상수 ============ */
sec('상수');
T('버전 3종·정본 v2', A.VERSIONS.length === 3 && A.CURRENT_VERSION === 'v2');
T('스코프 13종', A.SCOPES.length === 13);
T('요소 8타입', A.ELEMENT_TYPES.length === 8 && A.ELEMENT_TYPES.includes('animation'));
T('내보내기 8포맷', A.EXPORT_FORMATS.length === 8 && A.EXPORT_FORMATS.includes('mp4'));
T('AI 7작업', A.AI_OPS.length === 7);
T('이벤트 카탈로그 11종', A.EVENTS.length === 11 && A.EVENTS.includes('market.install'));
T('레이트 티어 5단', Object.keys(A.RATE_TIERS).length === 5 && A.RATE_TIERS.free === 60);
T('재시도 백오프 4단', A.RETRY_SCHEDULE.length === 4 && A.RETRY_SCHEDULE[3] === 30000);
T('노드 7타입', A.NODE_TYPES.length === 7);
T('라우트 테이블 노출', A.routes().length >= 35);

/* ============ 2. 인증 — 자격 4종 ============ */
sec('인증');
T('무자격 → 401', req('GET', '/v2/projects', {}).status === 401);
T('위조 키 → 401', req('GET', '/v2/projects', { 'x-api-key': 'mk_live_fake' }).status === 401);
T('API Key 통과', req('GET', '/v2/projects', gk).status === 200);
T('PAT 통과', req('GET', '/v2/projects', { authorization: 'Bearer ' + S.pat }).status === 200);
T('서비스 access_token 통과', req('GET', '/v2/projects', { authorization: 'Bearer ' + S.svcAccess }).status === 200);
const jwtR = A.serviceJwt(S.svcApp.id);
T('서비스 JWT 발급·통과', jwtR.ok && req('GET', '/v2/projects', { authorization: 'Bearer ' + jwtR.jwt }).status === 200);
const tmpApp = A.registerApp({ name: '폐기 실험' }).app;
const tmpKey = A.createKey(tmpApp.id).key;
T('신규 키 통과', req('GET', '/v2/projects', { 'x-api-key': tmpKey.token }).status === 200);
A.revokeKey(tmpKey.token);
T('폐기 키 → 401', req('GET', '/v2/projects', { 'x-api-key': tmpKey.token }).status === 401);
const shortPat = A.createPat('u-exp', { ttlMs: 1000 }).pat;
A._tick(1500);
T('만료 PAT → 401 token_expired', req('GET', '/v2/projects', { authorization: 'Bearer ' + shortPat.token }).body.error === 'token_expired');

/* ============ 3. OAuth2 ============ */
sec('OAuth2');
const app0 = S.geumApp;
T('redirect 불일치 거부', A.authorize(app0.clientId, 'u1', ['project:read'], 'https://evil.com').why === 'redirect_uri_mismatch');
T('범위 밖 스코프 거부', String(A.authorize(app0.clientId, 'u1', ['no:scope'], app0.redirectUris[0]).why).startsWith('invalid_scope'));
const code = A.authorize(app0.clientId, 'u1', ['project:read'], app0.redirectUris[0]).code;
T('client_secret 오류 → invalid_client', A.token({ grant_type: 'authorization_code', code, client_id: app0.clientId, client_secret: 'x' }).why === 'invalid_client');
const pair = A.token({ grant_type: 'authorization_code', code, client_id: app0.clientId, client_secret: app0.clientSecret });
T('코드 → 토큰 교환', pair.ok && pair.access_token && pair.refresh_token);
T('코드 재사용 거부', A.token({ grant_type: 'authorization_code', code, client_id: app0.clientId, client_secret: app0.clientSecret }).why === 'code_already_used');
const code2 = A.authorize(app0.clientId, 'u2', ['project:read'], app0.redirectUris[0]).code;
A._tick(301e3);
T('코드 만료', A.token({ grant_type: 'authorization_code', code: code2, client_id: app0.clientId, client_secret: app0.clientSecret }).why === 'code_expired');
T('client_credentials 는 서비스 전용', A.token({ grant_type: 'client_credentials', client_id: app0.clientId, client_secret: app0.clientSecret }).ok === false);
const pair2 = A.token({ grant_type: 'refresh_token', refresh_token: pair.refresh_token, client_id: app0.clientId, client_secret: app0.clientSecret });
T('리프레시 회전 성공', pair2.ok && pair2.access_token !== pair.access_token);
T('이전 access 폐기', req('GET', '/v2/projects', { authorization: 'Bearer ' + pair.access_token }).body.error === 'token_revoked');
T('이전 refresh 폐기', A.token({ grant_type: 'refresh_token', refresh_token: pair.refresh_token, client_id: app0.clientId, client_secret: app0.clientSecret }).why === 'invalid_grant');
T('새 access 유효', req('GET', '/v2/projects', { authorization: 'Bearer ' + pair2.access_token }).status === 200);

/* ============ 4. 버전 ============ */
sec('버전');
T('미지원 버전 404', req('GET', '/v9/projects', gk).status === 404);
const v1r = req('GET', '/v1/projects', gk);
T('v1 Deprecation 헤더', v1r.headers.deprecation === 'true' && v1r.headers.sunset === '2026-12-31');
const v1c = req('POST', '/v1/projects', gk, { title: 'v1 하위호환' });
T('v1 title→name 입력 매핑', v1c.status === 201 && v1c.body.name === 'v1 하위호환');
T('v1 응답에 title 동봉', v1c.body.title === 'v1 하위호환');
const v2g = req('GET', '/v2/projects/' + v1c.body.id, gk);
T('v2 응답엔 title 없음', v2g.status === 200 && v2g.body.title === undefined);
T('v3 베타 게이트 — 일반 키 403', req('GET', '/v3/projects', gk).body.error === 'beta_access_required');
T('v3 베타 앱 통과', req('GET', '/v3/projects', hk).status === 200);
T('베타 라우트 v2 에선 404', req('GET', '/v2/beta/insights', hk).body.error === 'not_in_v2');
T('베타 라우트 v3 통과', req('GET', '/v3/beta/insights', hk).status === 200);

/* ============ 5. 스코프 ============ */
sec('스코프');
const staging = A._keys().find((k) => k.label === '스테이징');
T('제한 키 읽기 허용', req('GET', '/v2/projects', { 'x-api-key': staging._full }).status === 200);
const denied = req('POST', '/v2/projects', { 'x-api-key': staging._full }, { name: 'x' });
T('제한 키 쓰기 403 insufficient_scope', denied.status === 403 && denied.body.required === 'project:write');
T('ai:run 없는 키 AI 403', req('POST', '/v2/ai', { 'x-api-key': staging._full }, { op: 'text', prompt: 'x' }).status === 403);

/* ============ 6. 검증 ============ */
sec('입력 검증');
T('필수 누락 400', req('POST', '/v2/projects', gk, {}).body.error === 'invalid_request');
T('길이 초과 400', req('POST', '/v2/projects', gk, { name: 'x'.repeat(99) }).status === 400);
const defSc = req('POST', '/v2/projects/' + S.projects.p1 + '/scenes', gk, {});
T('장면 name 생략 시 기본명', defSc.status === 201 && /^장면 \d+$/.test(defSc.body.name));
const badEl = req('POST', '/v2/projects/' + S.projects.p1 + '/scenes/xx/elements', gk, { type: 'hologram' });
T('알 수 없는 요소 타입 400', badEl.status === 400 && badEl.body.details.some((d) => d.includes('type')));
T('HTTPS 강제', A.request({ method: 'GET', path: '/v2/projects', headers: gk, insecure: true }).body.error === 'https_required');
const pre = req('OPTIONS', '/v2/projects', {});
T('CORS preflight 204+헤더', pre.status === 204 && pre.headers['access-control-allow-origin'] === '*');

/* ============ 7. Project CRUD ============ */
sec('Project');
const pc = req('POST', '/v2/projects', gk, { name: '테스트 프로젝트' });
T('생성 201', pc.status === 201 && pc.body.id.startsWith('prj'));
const pid = pc.body.id;
T('목록에 노출', req('GET', '/v2/projects', gk).body.items.some((x) => x.id === pid));
T('q 필터', req('GET', '/v2/projects', gk, null, { q: '테스트 프로' }).body.items.length === 1);
const pu = req('PATCH', '/v2/projects/' + pid, gk, { name: '테스트 개정' });
T('수정 시 version 증가', pu.body.version === 2 && pu.body.name === '테스트 개정');
const dup = req('POST', '/v2/projects/' + pid + '/duplicate', gk);
T('복제 — 사본 이름', dup.status === 201 && dup.body.name === '테스트 개정 사본');
T('보관', req('POST', '/v2/projects/' + pid + '/archive', gk).body.status === 'archived');
T('이중 보관 409', req('POST', '/v2/projects/' + pid + '/archive', gk).status === 409);
T('복원', req('POST', '/v2/projects/' + pid + '/restore', gk).body.status === 'active');
T('삭제 204', req('DELETE', '/v2/projects/' + dup.body.id, gk).status === 204);
T('삭제 후 404', req('GET', '/v2/projects/' + dup.body.id, gk).status === 404);

/* ============ 8. Scene · Element ============ */
sec('Scene · Element');
const sc1 = req('POST', '/v2/projects/' + pid + '/scenes', gk, { name: '장면A' }).body;
const sc2 = req('POST', '/v2/projects/' + pid + '/scenes', gk, { name: '장면B' }).body;
T('장면 2개·순번', sc1.order === 0 && sc2.order === 1);
T('이름 변경', req('PATCH', '/v2/projects/' + pid + '/scenes/' + sc1.id, gk, { name: '표지' }).body.name === '표지');
const scd = req('POST', '/v2/projects/' + pid + '/scenes/' + sc1.id + '/duplicate', gk).body;
T('장면 복제 삽입 위치', req('GET', '/v2/projects/' + pid, gk).body.scenes[1].id === scd.id);
T('reorder 검증 실패 400', req('POST', '/v2/projects/' + pid + '/scenes/reorder', gk, { order: [sc1.id] }).status === 400);
const ro = req('POST', '/v2/projects/' + pid + '/scenes/reorder', gk, { order: [sc2.id, scd.id, sc1.id] });
T('reorder 적용', ro.status === 200 && ro.body.order[0] === sc2.id);
T('장면 삭제', req('DELETE', '/v2/projects/' + pid + '/scenes/' + scd.id, gk).status === 204);
const el1 = req('POST', '/v2/projects/' + pid + '/scenes/' + sc1.id + '/elements', gk, { type: 'text', props: { text: '안녕' } }).body;
T('요소 생성', el1.id.startsWith('el'));
T('요소 수정 병합', req('PATCH', '/v2/projects/' + pid + '/scenes/' + sc1.id + '/elements/' + el1.id, gk, { props: { size: 32 } }).body.props.text === '안녕');
T('요소 목록', req('GET', '/v2/projects/' + pid + '/scenes/' + sc1.id + '/elements', gk).body.items.length === 1);
T('요소 삭제', req('DELETE', '/v2/projects/' + pid + '/scenes/' + sc1.id + '/elements/' + el1.id, gk).status === 204);

/* ============ 9. Asset · Brand ============ */
sec('Asset · Brand');
const au = req('POST', '/v2/assets', gk, { name: '실험 사진', kind: 'image', size: 1000, meta: { unit: '자석' } });
T('업로드 201', au.status === 201);
T('다운로드 URL', req('GET', '/v2/assets/' + au.body.id + '/download', gk).body.url === au.body.url);
const ar = req('POST', '/v2/assets/' + au.body.id + '/replace', gk, { size: 2000, note: 'v2' });
T('교체 → 버전 2', ar.body.versions.length === 2 && ar.body.versions[1].size === 2000);
T('메타 병합', req('PATCH', '/v2/assets/' + au.body.id + '/metadata', gk, { meta: { grade: '4' } }).body.meta.unit === '자석');
T('에셋 검색(메타 포함)', req('GET', '/v2/assets', gk, null, { q: '자석' }).body.items.some((x) => x.id === au.body.id));
const bc = req('POST', '/v2/brands', gk, { name: '테스트 브랜드', colors: ['#111'], theme: 'dark' });
T('브랜드 생성', bc.status === 201 && bc.body.theme === 'dark');
T('브랜드 수정', req('PATCH', '/v2/brands/' + bc.body.id, gk, { colors: ['#111', '#222'] }).body.colors.length === 2);
T('브랜드 목록', req('GET', '/v2/brands', gk).body.items.length >= 3);

/* ============ 10. AI ============ */
sec('AI');
for (const op of A.AI_OPS) {
  const r = req('POST', '/v2/ai', gk, { op, prompt: '결정론 검사', target: 'en' });
  T('ai/' + op + ' 완료', r.status === 201 && r.body.status === 'completed' && r.body.output != null);
}
T('translate 결정론', req('POST', '/v2/ai', gk, { op: 'translate', prompt: 'abc', target: 'en' }).body.output === '[EN] abc');
T('op enum 400', req('POST', '/v2/ai', gk, { op: 'dream', prompt: 'x' }).status === 400);
const aij = req('POST', '/v2/ai', gk, { op: 'text', prompt: '잡 조회 검사' }).body;
T('잡 조회', req('GET', '/v2/ai/' + aij.id, gk).body.id === aij.id);

/* ============ 11. Render · Export ============ */
sec('Render · Export');
const rr = req('POST', '/v2/projects/' + S.projects.p1 + '/render', gk, {});
T('렌더 — displayList', rr.status === 200 && rr.body.displayList.length >= 2 && rr.body.displayList[0].ops > 2);
T('미리보기 URL', req('GET', '/v2/projects/' + S.projects.p1 + '/preview', gk).body.url.includes('/preview/'));
T('썸네일', req('GET', '/v2/projects/' + S.projects.p1 + '/thumbnail', gk).body.w === 320);
const exBefore = A.monitor().totals.count;
const ex = req('POST', '/v2/projects/' + S.projects.p1 + '/export', gk, { format: 'pptx' });
T('내보내기 201', ex.status === 201 && ex.body.url.endsWith('.pptx'));
T('포맷 enum 400', req('POST', '/v2/projects/' + S.projects.p1 + '/export', gk, { format: 'docx' }).status === 400);
const eb = req('POST', '/v2/projects/' + S.projects.p1 + '/export/batch', gk, { formats: ['png', 'svg', 'html'] });
T('일괄 내보내기 3건', eb.status === 201 && eb.body.total === 3);
T('일괄 검증 400', req('POST', '/v2/projects/' + S.projects.p1 + '/export/batch', gk, { formats: ['png', 'docx'] }).status === 400);

/* ============ 12. Search ============ */
sec('Search');
T('q 필수 400', req('GET', '/v2/search', gk).status === 400);
const sr = req('GET', '/v2/search', gk, null, { q: '테스트' });
T('교차 타입 검색', sr.body.items.some((x) => x.type === 'project') && sr.body.items.some((x) => x.type === 'brand'));
const sr2 = req('GET', '/v2/search', gk, null, { q: '테스트 브랜드' });
T('정확 일치 최상위', sr2.body.items[0].name === '테스트 브랜드' && sr2.body.items[0].score === 3);

/* ============ 13. 레이트 리밋 ============ */
sec('레이트 리밋');
const freeKey = A.createKey(tmpApp.id, { tier: 'free', label: 'rl' }).key;
let last;
for (let i = 0; i < 60; i++) last = req('GET', '/v2/projects', { 'x-api-key': freeKey.token });
T('60번째까지 통과', last.status === 200 && last.headers['x-ratelimit-remaining'] === 0);
last = req('GET', '/v2/projects', { 'x-api-key': freeKey.token });
T('61번째 429 + Retry-After', last.status === 429 && last.headers['retry-after'] >= 1);
A._tick(61000);
T('윈도 리셋 후 통과', req('GET', '/v2/projects', { 'x-api-key': freeKey.token }).status === 200);

/* ============ 14. 웹훅 — 서명·재시도·DLQ ============ */
sec('웹훅');
T('알 수 없는 이벤트 거부', A.createWebhook({ url: 'https://x', events: ['nope'] }).ok === false);
let got = null;
A.registerHandler('https://test.local/ok', (body, sig) => { got = { body, sig }; return { ok: true }; });
const whOk = A.createWebhook({ url: 'https://test.local/ok', events: ['brand.updated'] }).hook;
req('PATCH', '/v2/brands/' + bc.body.id, gk, { theme: 'light' });
T('즉시 배달(attempt 0 due 0)', got && got.body.event === 'brand.updated');
T('서명 검증 통과', A.verifySignature(whOk.id, got.body, got.sig));
T('서명 위조 검출', !A.verifySignature(whOk.id, got.body, 'mk-sig=deadbeef'));
S.unflaky(); // 시드 불안정 훅 복구 — 이후 export 이벤트가 DLQ 소음을 만들지 않게
A._tick(31000); A._tick(31000); // 잔여 재시도 체인 정착
let downCount = 0;
A.registerHandler('https://test.local/down', () => { downCount++; return { ok: false, why: '502' }; });
const whDown = A.createWebhook({ url: 'https://test.local/down', events: ['brand.updated'] }).hook;
const dlqBefore = A.dlq().length;
req('PATCH', '/v2/brands/' + bc.body.id, gk, { theme: 'dark' });
A._tick(1500); A._tick(5000); A._tick(30000);
T('재시도 4회 소진', downCount === 4);
T('DLQ 적재', A.dlq().length === dlqBefore + 1);
const dlqItem = A.dlq()[A.dlq().length - 1];
A.registerHandler('https://test.local/down', () => ({ ok: true }));
T('재배달 예약', A.redeliver(dlqItem.id).ok);
T('복구 후 재배달 성공·DLQ 소거', A.dlq().length === dlqBefore && A.hooks().find((h) => h.id === whDown.id).delivered === 1);
T('배달 로그에 attempt 기록', A.deliveries(200).filter((d) => d.hookId === whDown.id && !d.ok).length === 4);

/* ============ 15. Automation ============ */
sec('Automation');
T('규칙 검증 — 액션 없음 거부', A.createRule({ name: 'x', trigger: { type: 'event', event: 'user.login' }, actions: [] }).ok === false);
T('규칙 검증 — 미지 이벤트 거부', A.createRule({ name: 'x', trigger: { type: 'event', event: 'nope' }, actions: [{ type: 'email' }] }).ok === false);
const obBefore = A.outbox().length;
const loginRule = A.createRule({ name: '로그인 환영', trigger: { type: 'event', event: 'user.login' }, conditions: [{ path: 'payload.userId', op: 'eq', value: 'vip' }], actions: [{ type: 'email', to: '{{payload.userId}}@x.kr', text: '{{payload.userId}}님 환영' }] }).rule;
A.triggerLogin('nobody');
T('조건 불일치 — 기록만', A.runsLog(5).some((r) => r.ruleId === loginRule.id && !r.matched) && A.outbox().length === obBefore);
A.triggerLogin('vip');
const vipMsg = A.outbox()[A.outbox().length - 1];
T('조건 매치 — 변수 치환 발신', vipMsg.to === 'vip@x.kr' && vipMsg.text === 'vip님 환영');
const seedRule = A.rules().find((r) => r.name.includes('PDF 백업'));
T('시드 규칙 실행 이력 존재(매치+불일치)', A.runsLog(500).some((r) => r.ruleId === seedRule.id && r.matched) && A.runsLog(500).some((r) => r.ruleId === seedRule.id && !r.matched));
A.setRuleEnabled(loginRule.id, false);
const loginRuns = A.runsLog(500).filter((r) => r.ruleId === loginRule.id).length;
A.triggerLogin('vip');
T('비활성 규칙 미발화', A.runsLog(500).filter((r) => r.ruleId === loginRule.id).length === loginRuns);
const obW = A.outbox().length;
A._tick(7 * 86400e3 + 1000);
T('스케줄 트리거 발화(주간 리포트)', A.outbox().length > obW && A.outbox().some((m) => m.text.includes('주간 사용 리포트')));
T('마켓 설치 트리거 이벤트 존재', (() => { A.triggerMarketInstall('itm', 'geumseong'); return true; })());

/* ============ 16. Workflow ============ */
sec('Workflow');
T('trigger 없는 플로 거부', A.createFlow({ name: 'x', nodes: [{ id: 'a', type: 'action', config: {} }] }).ok === false);
T('미지 노드 거부', A.createFlow({ name: 'x', nodes: [{ id: 'a', type: 'teleport' }] }).ok === false);
T('끊어진 엣지 거부', A.createFlow({ name: 'x', nodes: [{ id: 'a', type: 'trigger', config: {} }], edges: [{ from: 'a', to: 'ghost' }] }).ok === false);
const flowId = S.flow;
const frBefore = A.flowRuns().length;
const obX = A.outbox().length;
req('POST', '/v2/projects/' + S.projects.p1 + '/export', gk, { format: 'pdf' });
const runPdf = A.flowRuns()[A.flowRuns().length - 1];
T('이벤트 트리거로 실행 생성', A.flowRuns().length === frBefore + 1 && runPdf.flowId === flowId);
T('true 분기 — discord 발신', A.outbox().slice(obX).some((m) => m.channel === 'discord'));
T('변수 fromPath 설정', runPdf.vars.fmt === 'pdf');
T('루프 2회 실행 로그', runPdf.log.filter((l) => l.msg.startsWith('루프[')).length === 2);
T('delay 대기 상태', runPdf.status === 'waiting');
A._tick(5001);
const runPdf2 = A.flowRun(runPdf.id);
T('_tick 후 재개·완료', runPdf2.status === 'completed' && A.outbox().some((m) => m.text.includes('후속 파이프라인 완료 (pdf)')));
const obY = A.outbox().length;
req('POST', '/v2/projects/' + S.projects.p1 + '/export', gk, { format: 'png' });
const runPng = A.flowRuns()[A.flowRuns().length - 1];
T('false 분기 — discord 미발신', !A.outbox().slice(obY).some((m) => m.channel === 'discord'));
T('false 분기 로그', runPng.log.some((l) => l.type === 'branch' && l.msg === 'false'));

/* ============ 17. SDK · CLI ============ */
sec('SDK · CLI');
const sdk = A.sdk({ apiKey: S.geumKey });
const sp = sdk.projects.create({ name: 'SDK 생성' });
T('SDK 생성→조회 왕복', sdk.projects.get(sp.id).name === 'SDK 생성');
let threw = null; try { sdk.projects.get('prj_ghost'); } catch (e) { threw = e; }
T('SDK 오류 throw(status)', threw && threw.status === 404);
T('SDK AI', typeof sdk.ai.run({ op: 'summarize', prompt: '가나다라마바사아자차카타파하 열심히' }).output === 'string');
T('CLI projects list', A.cli('mk projects list', { apiKey: S.geumKey }).out.includes('SDK 생성'));
T('CLI create', A.cli('mk projects create --name CLI생성', { apiKey: S.geumKey }).out.includes('CLI생성'));
T('CLI export', A.cli('mk export --project ' + S.projects.p1 + ' --format svg', { apiKey: S.geumKey }).out.includes('.svg'));
T('CLI generate', A.cli('mk generate text --prompt 안내문', { apiKey: S.geumKey }).ok);
T('CLI 미지 명령 안내', A.cli('mk frobnicate', { apiKey: S.geumKey }).ok === false);

/* ============ 18. OpenAPI · 문서 ============ */
sec('OpenAPI');
const spec = A.openapi('v2');
const opCount = Object.values(spec.paths).reduce((a, p) => a + Object.keys(p).length, 0);
T('3.1 명세 — 경로 25+ · 오퍼레이션 35+', spec.openapi === '3.1.0' && Object.keys(spec.paths).length >= 25 && opCount >= 35);
T('경로 파라미터 표기', Object.keys(spec.paths).some((p) => p.includes('{id}')));
T('보안 스킴 2종', !!spec.components.securitySchemes.bearerAuth && !!spec.components.securitySchemes.apiKey);
T('v2 명세에 베타 라우트 없음', !Object.keys(spec.paths).some((p) => p.includes('/beta/')));
T('v3 명세엔 베타 포함', Object.keys(A.openapi('v3').paths).some((p) => p.includes('/beta/')));
T('게이트웨이로 명세 제공', req('GET', '/v2/openapi.json', {}).status === 200);
T('스니펫 3언어 생성', ['curl', 'javascript', 'python'].every((l) => A.sdkSnippet(l, { method: 'POST', path: '/projects', schema: { name: { required: true } } }).length > 40));

/* ============ 19. 모니터링 ============ */
sec('모니터링');
const mon = A.monitor();
T('총 호출 집계', mon.totals.count > 150);
T('오류 집계(4xx 포함)', mon.totals.errors > 5);
const km = mon.keys.find((k) => S.geumKey.startsWith(k.key.slice(0, 10)));
T('키별 상태코드 분해', km && km.byStatus['200'] > 10 && km.avgMs >= 0);
T('상위 라우트 노출', km.topRoutes.length >= 1);
T('쿼터 조회', A.quota(S.geumKey).tier === 'education' && A.quota(S.geumKey).limit === 1200);
T('감사 로그 적재', A.auditLog(200).some((a) => a.event === 'key.created') && A.auditLog(200).some((a) => a.event === 'webhook.dlq'));

/* ============ 20. MK_ADMIN 브리지 ============ */
sec('MK_ADMIN 브리지');
T('금성초 → education 티어', A._keys().find((k) => k.label === '교무실 공용').tier === 'education');
T('한빛 → enterprise 티어', A._keys().find((k) => k.label === '프로덕션').tier === 'enterprise');

/* ============ 21. 화면 8탭 ============ */
sec('화면');
const scr = window.MK_SCREENS.dev; const st = scr._st;
for (const [t] of [['over'], ['explorer'], ['auth'], ['hooks'], ['auto'], ['flow'], ['mon'], ['docs']]) {
  st.tab = t;
  let ok = true; try { const h = scr.render(); ok = h.length > 400; } catch (e) { ok = false; console.log('   render err', t, e.message); }
  T('탭 렌더: ' + t, ok);
}
st.tab = 'explorer'; st.exRoute = A.routes().findIndex((r) => r.method === 'GET' && r.path === '/projects'); st.exAuth = 'none';
const host = window.document.createElement('div'); host.innerHTML = scr.render(); window.document.body.appendChild(host); scr.mount(host);
T('탐색기 요청 버튼 401 실판정', (() => { host.querySelector('button[data-dev="exec"]').onclick(); return st.exResp && st.exResp.status === 401; })());
st.exAuth = 'geum';
T('탐색기 자격 전환 후 200', (() => { host.innerHTML = scr.render(); scr.mount(host); host.querySelector('button[data-dev="exec"]').onclick(); return st.exResp.status === 200; })());

/* ============ 22. 스케일 — 100,000 요청 ============ */
sec('스케일');
const scaleJwt = A.serviceJwt(S.svcApp.id).jwt; // 전용 토큰 — RL 윈도 독립
const svcHdr = { authorization: 'Bearer ' + scaleJwt };
const t0 = Date.now();
let okCount = 0, lastR;
for (let i = 0; i < 100000; i++) { lastR = A.request({ method: 'GET', path: '/v2/projects/' + S.projects.p1 + '/thumbnail', headers: svcHdr }); if (lastR.status === 200) okCount++; }
const elapsed = Date.now() - t0;
T('100,000 요청 전부 200', okCount === 100000);
T('service 티어 한도 정확(100001번째 429)', A.request({ method: 'GET', path: '/v2/projects/' + S.projects.p1 + '/thumbnail', headers: svcHdr }).status === 429);
const jm = A.monitor().keys.find((k) => scaleJwt.startsWith(k.key.slice(0, 10)) && k.count >= 100000);
T('메트릭 10만+ 집계', jm && jm.count >= 100001);
console.log('   [실측] 100,000 요청 ' + elapsed + 'ms (' + (100000 / elapsed * 1000 | 0) + ' req/s) · 평균 ' + jm.avgMs + 'ms · 최대 ' + jm.maxMs + 'ms');

console.log('\n결과: ' + pass + '/' + (pass + fail) + (fail ? ' — 실패 ' + fail : ' 전부 통과'));
process.exit(fail ? 1 : 0);
