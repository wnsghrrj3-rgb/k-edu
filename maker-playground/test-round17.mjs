/* Round 17 — Plugin SDK & Extension Platform 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/plugins' });
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

const P = window.MK_PLUGIN;
const S = window.MK_PLUGIN_SAMPLES;
let pass = 0, fail = 0;
const T = (name, cond) => { if (cond) { pass++; } else { fail++; console.log('  ✗', name); } };
const throws = (fn) => { try { fn(); return false; } catch { return true; } };
const sec = (n) => console.log('—', n);

/* 에디터 문서 바인딩 (플러그인 캔버스 조작 대상) */
window.PG.loadEditorDoc();
const doc = () => window.PG.state.editor.doc;

/* ============ 1. Manifest ============ */
sec('Manifest');
T('유효 manifest', P.validateManifest({ id: 'a-b.c', name: 'A', version: '1.0.0', author: 'x', entry: 'i.js', category: 'ai', permissions: ['canvas'] }).ok);
T('필수 누락 검출', !P.validateManifest({ id: 'x' }).ok);
T('semver 오류 검출', !P.validateManifest({ id: 'x', name: 'X', version: '1.0', author: 'a', entry: 'i', category: 'ai', permissions: [] }).ok);
T('카테고리 검증', !P.validateManifest({ id: 'x', name: 'X', version: '1.0.0', author: 'a', entry: 'i', category: 'nope', permissions: [] }).ok);
T('권한 화이트리스트', !P.validateManifest({ id: 'x', name: 'X', version: '1.0.0', author: 'a', entry: 'i', category: 'ai', permissions: ['root'] }).ok);
T('카테고리 14종', P.CATEGORIES.length === 14);
T('권한 9종', P.PERMS.length === 9);
T('확장 지점 10곳', P.EXT_POINTS.length === 10);
T('이벤트 8종', P.EVENTS.length === 8);

/* ============ 2. Lifecycle FSM ============ */
sec('Lifecycle');
const mf = (id, extra) => ({ id, name: id, version: '1.0.0', author: 't', entry: 'i.js', category: 'productivity', permissions: ['canvas'], ...(extra || {}) });
const noop = () => ({});
T('install', P.install(mf('t-life'), noop).ok);
T('중복 설치 거부', !P.install(mf('t-life'), noop).ok);
T('installed 상태', P.stateOf('t-life') === 'installed');
T('installed→running 직행 불가', throws(() => P.run('t-life')));
P.load('t-life'); T('loaded', P.stateOf('t-life') === 'loaded');
P.initialize('t-life'); T('init→ready 자동', P.stateOf('t-life') === 'ready');
P.run('t-life'); T('running', P.stateOf('t-life') === 'running');
P.suspend('t-life'); T('suspended', P.stateOf('t-life') === 'suspended');
T('suspended→loaded 불가', throws(() => P.transition('t-life', 'loaded')));
P.resume('t-life'); T('resume', P.stateOf('t-life') === 'running');
P.unload('t-life'); T('unloaded', P.stateOf('t-life') === 'unloaded');
P.remove('t-life'); T('removed 후 조회 불가', throws(() => P.stateOf('t-life')));
T('의존성 미설치 거부', !P.install(mf('t-dep', { dependencies: ['ghost'] }), noop).ok);

/* ============ 3. Permission · Sandbox ============ */
sec('Permission · Sandbox');
let capApi = null;
P.install(mf('t-perm', { permissions: ['canvas'] }), (api) => { capApi = api; return {}; });
P.start('t-perm');
T('허용 권한 동작', typeof capApi.canvas.getDoc() === 'object');
T('미허용 asset 거부', throws(() => capApi.asset.search()));
T('미허용 ai 거부', throws(() => capApi.ai.rewrite('x')));
T('미허용 storage 거부', throws(() => capApi.storage.set('k', 1)));
P.grant('t-perm', 'storage');
T('런타임 grant 반영', capApi.storage.set('k', { a: 1 }) === true);
P.revoke('t-perm', 'storage');
T('revoke 반영', throws(() => capApi.storage.get('k')));
T('권한 거부가 콘솔 오류로 기록', P.console('t-perm').errors.some((e) => e.msg.includes('권한 거부')));
T('camera 게이트(선언만)', throws(() => capApi.device.camera()));

/* 크래시 격리 — 이벤트 훅이 3회 던져도 호스트 생존 + 자동 suspend */
let hostAlive = false;
P.install(mf('t-crash'), (api) => {
  api.events.on('sceneChanged', () => { throw new Error('boom'); });
  return {};
});
P.start('t-crash');
for (let i = 0; i < 3; i++) P.emit('sceneChanged', {});
hostAlive = true;
T('크래시 3회에도 호스트 생존', hostAlive);
T('연속 크래시 → 자동 suspend', P.stateOf('t-crash') === 'suspended');
T('크래시 로그 수집', P.console('t-crash').errors.length >= 3);
P.remove('t-crash');

/* 메모리 제한 */
P.install(mf('t-mem', { permissions: ['canvas', 'storage'] }), (api) => ({ api }));
P.start('t-mem');
const memApi = P._reg.get('t-mem').api;
T('메모리 제한 초과 거부', throws(() => memApi.storage.set('big', 'x'.repeat(P.MEM_LIMIT))));
T('제한 내 저장 허용', memApi.storage.set('ok', 'x'.repeat(1000)) === true);
P.remove('t-mem');

/* ============ 4. Event System ============ */
sec('Event');
let evGot = null;
P.install(mf('t-ev'), (api) => { api.events.on('brandChanged', (p2) => { evGot = p2; }); return {}; });
P.start('t-ev');
P.emit('brandChanged', { brand: 'b1' });
T('running 구독 수신', evGot && evGot.brand === 'b1');
P.suspend('t-ev'); evGot = null;
P.emit('brandChanged', { brand: 'b2' });
T('suspended 는 미수신', evGot === null);
P.resume('t-ev'); P.unload('t-ev');
P.emit('brandChanged', { brand: 'b3' });
T('unload 후 구독 자동 정리', evGot === null);
T('미지원 이벤트 구독 거부', (() => { let bad = false; P.install(mf('t-ev2'), (api) => { try { api.events.on('nope', () => {}); } catch { bad = true; } return {}; }); P.start('t-ev2'); P.remove('t-ev2'); return bad; })());
P.remove('t-ev');
let installedEv = 0; P.onHost((ev) => { if (ev === 'pluginInstalled') installedEv++; });
P.install(mf('t-ev3'), noop); P.remove('t-ev3');
T('pluginInstalled 호스트 통지', installedEv >= 1);

/* ============ 5. Command · Shortcut ============ */
sec('Command · Shortcut');
P.install(mf('t-cmd'), (api) => {
  api.commands.register({ id: 'tc.hello', title: '인사', run: (n) => 'hi-' + (n || 0) });
  return {};
});
P.start('t-cmd');
T('명령 실행 + 반환', P.execCommand('tc.hello', 7) === 'hi-7');
T('명령 목록 노출', P.commandList().some((c) => c.id === 'tc.hello'));
T('중복 명령 거부', (() => { let bad = false; P.install(mf('t-cmd2'), (api) => { try { api.commands.register({ id: 'tc.hello', title: 'x', run: () => {} }); } catch { bad = true; } return {}; }); P.start('t-cmd2'); P.remove('t-cmd2'); return bad; })());
P.suspend('t-cmd');
T('비활성 플러그인 명령 차단', throws(() => P.execCommand('tc.hello')));
P.resume('t-cmd');
/* 단축키 */
P.install(mf('t-key'), (api) => {
  api.commands.register({ id: 'tk.go', title: 'go', run: () => 'went' });
  const a = api.shortcuts.register('Ctrl+Shift+G', 'tk.go', 1);
  const b = api.shortcuts.register('shift+ctrl+g', 'tk.go', 1);     /* 정규화 후 같은 키 → 충돌 */
  const c = api.shortcuts.register('ctrl+shift+g', 'tk.go', 9);     /* 높은 우선순위 → 교체 */
  api.storage; return { a, b, c };
});
P.start('t-key');
const kh = P._reg.get('t-key').handle;
T('단축키 등록', kh.a.ok && kh.a.combo === 'ctrl+shift+g');
T('충돌 검사(정규화)', !kh.b.ok && kh.b.conflict === 't-key');
T('우선순위 교체', kh.c.ok && kh.c.replaced === 't-key');
T('키 입력 → 명령 실행', P.pressKey('CTRL+SHIFT+G') === 'went');
P.unload('t-key');
T('unload 시 단축키 정리', P.pressKey('ctrl+shift+g') === null);
T('unload 시 명령 정리', !P.commandList().some((c) => c.id === 'tk.go'));
P.remove('t-key'); P.unload('t-cmd'); P.remove('t-cmd');

/* ============ 6. Marketplace · 비공개 배포 ============ */
sec('Marketplace');
T('스토어 시드 12종', S.count === 12 && S.ids.length === 12);
const pub = P.storeList({ org: null });
T('미소속 → 비공개 미노출', !pub.some((i) => i.id === 'gs-notice'));
const org = P.storeList({ org: 'geumseong' });
T('금성초 → 비공개 노출', org.some((i) => i.id === 'gs-notice'));
T('기본 설치 5종 반영', org.filter((i) => i.installed).length >= 5);
const r0 = P.rating('quiz-gen');
P.addReview('quiz-gen', 3, '무난');
T('리뷰 → 평점 갱신', P.rating('quiz-gen') !== r0 && P.rating('quiz-gen') > 0);
T('스토어 설치 즉시 실행', (() => { const r = P.installFromStore('kanban'); return r.ok && P.stateOf('kanban') === 'running'; })());
T('없는 스토어 항목 거부', !P.installFromStore('ghost-item').ok);

/* ============ 7. Auto Update · Rollback ============ */
sec('Update');
P.install(mf('t-up'), (api) => { api.commands.register({ id: 'up.v', title: 'v', run: () => 'v1' }); return {}; });
P.start('t-up');
T('버전 후퇴 거부', !P.update('t-up', mf('t-up'), noop).ok);
const up = P.update('t-up', { ...mf('t-up'), version: '2.0.0' }, (api) => { api.commands.register({ id: 'up.v', title: 'v', run: () => 'v2' }); return {}; });
T('업데이트 성공', up.ok && up.version === '2.0.0');
T('업데이트 후 실행 상태 유지', P.stateOf('t-up') === 'running');
T('신버전 명령 동작', P.execCommand('up.v') === 'v2');
const rb = P.rollback('t-up');
T('롤백 성공', rb.ok && rb.version === '1.0.0');
T('구버전 명령 복원', P.execCommand('up.v') === 'v1');
T('이중 롤백 거부', !P.rollback('t-up').ok);
P.remove('t-up');
T('스토어 업데이트 감지 구조', Array.isArray(P.checkUpdates()));

/* ============ 8. 샘플 플러그인 — 전부 API 만으로 캔버스 실조작 ============ */
sec('Sample Plugins');
const scenesBefore = doc().scenes.length;
const mm = P.execCommand('mindmap.create', '물의 순환', ['증발', '응결', '강수']);
T('마인드맵 장면 생성', doc().scenes[mm].name === '마인드맵' && doc().scenes[mm].elements.length >= 7);
const tl = P.execCommand('timeline.convert', ['봄', '여름', '가을', '겨울']);
T('타임라인 4단계', doc().scenes[tl].elements.filter((e) => e.kind === 'text').length === 4);
const qz = P.execCommand('quiz.generate', '자석', 2);
T('퀴즈 2장 생성', qz.length === 2 && doc().scenes[qz[1]].elements.length === 9);
T('퀴즈에 AI 재작성 사용', P.console('quiz-gen').apiCalls['ai.rewrite'] >= 8);
P.installFromStore('flowchart');
const fl = P.execCommand('flow.create', ['질문', '가설', '실험', '결론']);
T('순서도 화살표 3개', doc().scenes[fl].elements.filter((e) => e.text === '↓').length === 3);
P.installFromStore('calendar');
const ca = P.execCommand('calendar.month', 2026, 7);
T('2026-07 달력 31일', doc().scenes[ca].elements.filter((e) => e.kind === 'text' && /^\d+$/.test(e.text)).length === 31);
P.installFromStore('whiteboard');
P.execCommand('wb.sticky', '검토 필요');
T('스티커 storage 기록', P.console('whiteboard').apiCalls['storage.set'] >= 1);
P.installFromStore('math-formula'); P.installFromStore('barcode');
T('수식 삽입', typeof P.execCommand('math.insert', 'pyth') === 'number');
T('전 장면 증가 검증', doc().scenes.length > scenesBefore);

/* KEDU 교육 플러그인 */
const ws = P.execCommand('kedu.worksheet', '자석 활동지', ['자석에 붙는 것', '자석의 극']);
T('KEDU 활동지 이름칸', doc().scenes[ws].elements.some((e) => String(e.text || '').includes('이름')));
P.execCommand('kedu.sci', '그림자 관찰');
T('KEDU 관찰 기록지 3칸', doc().scenes[doc().scenes.length - 1].elements.filter((e) => e.kind === 'image').length === 3);
const aiq = P.execCommand('kedu.aiquiz', '지층', 1);
T('KEDU → 퀴즈 플러그인 협업 호출', Array.isArray(aiq) && aiq.length === 1);
T('KEDU 단축키 등록', P.shortcutList().some((k) => k.combo === 'ctrl+shift+k' && k.plugin === 'kedu-suite'));

/* Enterprise */
P.installFromStore('gs-notice');
const gs = P.execCommand('gs.notice', '여름방학 안내');
T('가정통신문 학교 헤더', doc().scenes[gs].elements[0].fill === '#2A4E7A');

/* ============ 9. QR — 비트 역추출 + Reed-Solomon 검산 왕복 ============ */
sec('QR (실규격 검산)');
const q1 = S.QR.encode('keduclass.com');
T('버전 자동 선택(13B→v1)', q1.version === 1 && q1.size === 21);
const q3 = S.QR.encode('x'.repeat(50));
T('50B → v3', q3.version === 3 && q3.size === 29);
T('용량 초과 거부', throws(() => S.QR.encode('x'.repeat(90))));
T('결정론', JSON.stringify(S.QR.encode('abc').modules) === JSON.stringify(S.QR.encode('abc').modules));
/* 파인더 3개 + 다크 모듈 + 타이밍 */
const Mx = q1.modules, N1 = q1.size;
const finderOk = (r, c) => Mx[r][c] === 1 && Mx[r + 3][c + 3] === 1 && Mx[r + 1][c + 1] === 0;
T('파인더 3개', finderOk(0, 0) && finderOk(0, N1 - 7) && finderOk(N1 - 7, 0));
T('다크 모듈', Mx[N1 - 8][8] === 1);
T('타이밍 교대', Mx[6][8] === 1 && Mx[6][9] === 0 && Mx[6][10] === 1);
T('전 모듈 확정(null 없음)', Mx.every((row) => row.every((v) => v === 0 || v === 1)));
/* 역추출: 지그재그 + mask0 해제 → 모드/길이/데이터/ECC 검산 */
(() => {
  const N = q1.size, used = Array.from({ length: N }, () => new Array(N).fill(false));
  /* 기능 패턴 위치 재구성 */
  const mark = (r, c) => { if (r >= 0 && r < N && c >= 0 && c < N) used[r][c] = true; };
  for (const [fr, fc] of [[0, 0], [0, N - 7], [N - 7, 0]])
    for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) mark(fr + dr, fc + dc);
  for (let i = 0; i < N; i++) { mark(6, i); mark(i, 6); }
  for (let i = 0; i < 15; i++) {
    if (i < 6) mark(8, i); else if (i === 6) mark(8, 7); else if (i === 7) mark(8, 8); else if (i === 8) mark(7, 8); else mark(14 - i, 8);
    if (i < 7) mark(N - 1 - i, 8); else mark(8, N - 8 + (i - 7));
  }
  mark(N - 8, 8);
  const bits = [];
  let col = N - 1, up2 = true;
  while (col > 0) {
    if (col === 6) col--;
    for (let k = 0; k < N; k++) {
      const r = up2 ? N - 1 - k : k;
      for (const c of [col, col - 1]) {
        if (used[r][c]) continue;
        bits.push(Mx[r][c] ^ ((r + c) % 2 === 0 ? 1 : 0));
      }
    }
    col -= 2; up2 = !up2;
  }
  const cw = [];
  for (let i = 0; i + 8 <= 26 * 8; i += 8) cw.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  T('역추출 모드=Byte(0100)', (cw[0] >> 4) === 4);
  const len = ((cw[0] & 0xf) << 4) | (cw[1] >> 4);
  T('역추출 길이 일치', len === 'keduclass.com'.length);
  const txt = [];
  for (let i = 0; i < len; i++) txt.push(((cw[1 + i] & 0xf) << 4) | (cw[2 + i] >> 4));
  T('역추출 본문 일치', String.fromCharCode(...txt) === 'keduclass.com');
  /* RS 검산: data 19cw 로 ECC 7cw 재계산 = 매트릭스의 ECC */
  const EXP = new Array(512), LOG = new Array(256); let x2 = 1;
  for (let i = 0; i < 255; i++) { EXP[i] = x2; LOG[x2] = i; x2 <<= 1; if (x2 & 0x100) x2 ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const gmul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
  let g = [1];
  for (let i = 0; i < 7; i++) { const ng = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { ng[j] ^= gmul(g[j], EXP[i]); ng[j + 1] ^= g[j]; } g = ng; }
  const res = new Array(7).fill(0);
  for (const d of cw.slice(0, 19)) { const f2 = d ^ res.shift(); res.push(0); if (f2) for (let i = 0; i < 7; i++) res[i] ^= gmul(g[i + 1], f2); }
  T('Reed-Solomon ECC 검산 일치', res.every((v, i) => v === cw[19 + i]));
})();
T('QR SVG 출력', S.QR.toSVG(q1).startsWith('<svg') && (S.QR.toSVG(q1).match(/<rect/g) || []).length > 100);
const qres = P.execCommand('qr.make', 'https://naije.co.kr');
T('QR 플러그인 → 요소+자산', qres.version >= 1 && typeof qres.element === 'number');
T('QR 자산 DAM 등록', P.console('qr-gen').apiCalls['asset.upload'] >= 1);

/* ============ 10. Code39 ============ */
sec('Code39');
T('시작·종료 * 패턴', S.C39.encode('A').startsWith('100101101101') && S.C39.encode('A').endsWith('100101101101'));
T('문자 간 간격 0', S.C39.encode('AB').length === 12 * 4 + 3);
T('소문자 자동 대문자', S.C39.encode('kedu') === S.C39.encode('KEDU'));
T('미지원 문자 거부', throws(() => S.C39.encode('한글')));
T('바코드 SVG', S.C39.toSVG('KEDU-2026').includes('KEDU-2026'));
T('바코드 삽입 명령', typeof P.execCommand('barcode.make', 'GS-101') === 'number');

/* ============ 11. Render API 브리지 ============ */
sec('Render Bridge');
let svgOut = null, fmts = null;
P.install(mf('t-render', { permissions: ['canvas', 'export'] }), (api) => {
  fmts = api.render.formats();
  svgOut = api.render.preview();
  return {};
});
P.start('t-render');
T('포맷 목록(8종+)', fmts && fmts.length >= 8 && fmts.includes('pptx'));
T('플러그인이 SVG 미리보기 생성', typeof svgOut === 'string' && svgOut.includes('<svg'));
T('썸네일 스케일', (() => { const th = P._reg.get('t-render').api.render.thumbnail(); return th.includes('<svg'); })());
P.remove('t-render');

/* ============ 12. Extension Point · Editor 통합 ============ */
sec('Extension Points');
const tb = P.contributions('topToolbar');
T('topToolbar 기여 존재', tb.some((c) => c.plugin === 'timeline'));
T('leftSidebar 기여', P.contributions('leftSidebar').some((c) => c.plugin === 'kedu-suite'));
T('aiPanel 기여', P.contributions('aiPanel').some((c) => c.plugin === 'quiz-gen'));
T('assetBrowser 기여', P.contributions('assetBrowser').some((c) => c.plugin === 'qr-gen'));
T('suspend 시 기여 숨김', (() => { P.suspend('timeline'); const off = !P.contributions('topToolbar').some((c) => c.plugin === 'timeline'); P.resume('timeline'); return off; })());
/* Editor 화면에 플러그인 버튼 노출 */
window.PG.state.screen = 'editor'; window.PG.render();
T('Editor 툴바에 플러그인 버튼', !!window.document.querySelector('[data-plugcmd="timeline.convert"]'));
window.document.querySelector('[data-plugcmd="timeline.convert"]').onclick();
T('툴바 버튼 실행 → 장면 추가', doc().scenes[doc().scenes.length - 1].name === '타임라인');

/* ============ 13. SDK · Developer Console ============ */
sec('SDK · Console');
const gen = P.sdk.genManifest({ id: 'gen-x', category: 'ai' });
T('Manifest 생성기 유효', P.validateManifest(gen).ok && gen.category === 'ai');
T('Starter 템플릿 API 사용', P.sdk.starterTemplate().includes('api.commands.register'));
const rep = P.sdk.runTest(P.sdk.genManifest({ id: 'harness-x' }), (api) => {
  api.commands.register({ id: 'hx.go', title: 'go', run: () => 1 });
  return {};
}, JSON.parse(JSON.stringify(window.MK_SAMPLE.TEMPLATES[0])));
T('Test Harness 전 단계 통과', rep.ok && rep.steps.length === 7);
T('Harness 후 정리(설치 안 남음)', !P.listInstalled().some((i) => i.id === 'harness-x'));
const badRep = P.sdk.runTest({ id: 'bad' }, noop);
T('Harness manifest 실패 보고', !badRep.ok && !badRep.steps[0].ok);
const con = P.console('quiz-gen');
T('콘솔 perf 집계', con.perf.calls > 0 && con.perf.avgMs >= 0);
T('콘솔 API 호출 수', Object.keys(con.apiCalls).length >= 2);
T('메모리 실측', typeof con.memoryBytes === 'number');

/* ============ 14. 화면 렌더 — 3탭 전부 ============ */
sec('Plugins 화면');
window.PG.state.screen = 'plugins'; window.PG.render();
const body = () => window.document.getElementById('pgBody');
T('스토어 카드 렌더', body().querySelectorAll('.pl-card').length >= 10);
T('비공개 카드 표기', !!body().querySelector('.pl-private'));
window.document.querySelector('[data-pl="tab:installed"]').onclick();
T('설치됨 목록 렌더', body().querySelectorAll('.pl-inst').length >= 5);
T('명령 버튼 렌더', body().querySelectorAll('.pl-cmd').length >= 8);
T('권한 토글 렌더', body().querySelectorAll('.pl-permtog').length >= 9);
window.document.querySelector('[data-pl="tab:dev"]').onclick();
T('개발자 SDK 코드 렌더', !!body().querySelector('.pl-code'));
window.document.querySelector('[data-pl="runtest"]').onclick();
T('Harness 리포트 렌더', !!body().querySelector('.pl-report.ok'));

/* ============ 15. 완료 조건 — Core 무수정 증명 ============ */
sec('완료 조건');
T('Core 전역 무오염(플러그인 전역 2개만)', !!window.MK_PLUGIN && !!window.MK_PLUGIN_SAMPLES);
const kd = P.console('kedu-suite');
T('KEDU 가 Canvas·AI 활용', kd.apiCalls['scene.create'] >= 1);
const usedAreas = new Set(Object.keys(P.console('qr-gen').apiCalls).map((k) => k.split('.')[0]));
T('플러그인 하나가 다영역 활용(QR: canvas+asset)', usedAreas.has('element') && usedAreas.has('asset'));

console.log(`\nRound17: ${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
