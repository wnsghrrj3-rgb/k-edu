/* kedu_scope.js — 저장소 계정 분리 검산 (2026-09-09)
   ① 세션 없음(방문자) → 기기 저장 0(메모리만, 설정만 예외)  ② 교사 계정 u1 → 접두사 키로 읽고 씀, 옛 값은 첫 접속 때 u1 것으로 인계
   ③ 다른 계정 u2 → u1 값이 안 보이고 남의 것은 key(i) 에서 '' 로 숨음  ④ 익명(학생) 세션은 옛 값을 가져가지 않는다
   ⑤ 게스트(동의 전) 도 기기 저장 0, 설정만 학급코드별  ⑥ 인증·기억하기 키(sb-*, kedu_remember…)는 그대로(PASS)
   ⑦ 'kedu_progress_' 훑기(kedu_lesson_bridge 식)가 자기 것만 본다  ⑧ 게이트 두 파일에 같은 코드가 박혀 있고 두 번 실려도 한 번만 건다 */
const fs = require('fs'), path = require('path'), vm = require('vm');
let pass = 0, fail = 0;
const t = (c, n) => { if (c) { pass++; console.log('  ✓ ' + n); } else { fail++; console.log('  ✗ ' + n); } };
const ROOT = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(ROOT, 'kedu_scope.js'), 'utf8');

/* 브라우저 Storage 흉내 — prototype 메서드를 쓰는 진짜 구조 */
function Storage() { Object.defineProperty(this, '_m', { value: new Map(), enumerable: false }); }
Storage.prototype.getItem = function (k) { return this._m.has(String(k)) ? this._m.get(String(k)) : null; };
Storage.prototype.setItem = function (k, v) { this._m.set(String(k), String(v)); };
Storage.prototype.removeItem = function (k) { this._m.delete(String(k)); };
Storage.prototype.key = function (i) { return [...this._m.keys()][i] ?? null; };
Object.defineProperty(Storage.prototype, 'length', { get() { return this._m.size; } });
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const jwt = (sub, anon) => 'h.' + b64({ sub, is_anonymous: !!anon, exp: 9e9 }) + '.s';
function makeWin(seed, session, code) {
  const ls = new Storage(), ss = new Storage();
  for (const k in (seed || {})) ls._m.set(k, seed[k]);
  if (session) ls._m.set('sb-abc-auth-token', JSON.stringify({ access_token: jwt(session.sub, session.anon), user: { id: session.sub, is_anonymous: !!session.anon } }));
  if (code) ls._m.set('kedu_guest_v1', JSON.stringify({ code, day: 'x' }));
  const win = { Storage, localStorage: ls, sessionStorage: ss, console, atob: s => Buffer.from(s, 'base64').toString('binary'), escape: s => encodeURIComponent(s).replace(/%u/g, '\\u'), decodeURIComponent, JSON, Date, String };
  win.window = win; win.globalThis = win;
  vm.createContext(win);
  return win;
}
const run = (win, code) => vm.runInContext(code || src, win);
const rawKeys = win => [...win.localStorage._m.keys()];
// Storage.prototype 은 케이스마다 새로 쓴다(패치가 남지 않게)
const fresh = () => { const P = Storage.prototype; Storage.prototype.getItem = function (k) { return this._m.has(String(k)) ? this._m.get(String(k)) : null; }; Storage.prototype.setItem = function (k, v) { this._m.set(String(k), String(v)); }; Storage.prototype.removeItem = function (k) { this._m.delete(String(k)); }; Storage.prototype.key = function (i) { return [...this._m.keys()][i] ?? null; }; return P; };

/* ① 방문자 — 기기에 안 남김(준호 결정 09-09: 동의 없으면 기기 안에도 저장 0) */
fresh(); let w = makeWin({ kedu_progress_l1: '{"a":1}', kedu_grade: '3' });
run(w); run(w, "localStorage.setItem('x','1'); localStorage.setItem('kedu_progress_l1','{\"new\":1}'); sessionStorage.setItem('quiz','{\"i\":2}')");
t(w.__keduScope.owner === null && w.__keduScope.persist === false, '① 세션 없음 → 주인 없음, persist false');
t(run(w, "localStorage.getItem('x')") === '1' && run(w, "localStorage.getItem('kedu_progress_l1')") === '{"new":1}' && run(w, "sessionStorage.getItem('quiz')") === '{"i":2}', '① 페이지 안에서는 쓰고 읽힌다(메모리)');
t(!rawKeys(w).includes('x') && w.localStorage._m.get('kedu_progress_l1') === '{"a":1}' && w.sessionStorage._m.has('quiz'), '① 기기(raw)엔 안 써졌다 — 옛 값도 안 덮임 (탭 한정 sessionStorage 는 그대로)');
fresh(); let w2 = makeWin(Object.fromEntries(w.localStorage._m)); run(w2);
t(run(w2, "localStorage.getItem('kedu_progress_l1')") === null && run(w2, "localStorage.getItem('x')") === null, '① 다음 접속엔 없다 — 옛 기기 값(kedu_progress_l1)도 안 읽힌다');
run(w2, "localStorage.setItem('kedu_grade','5')");
t(run(w2, "localStorage.getItem('kedu_grade')") === '5' && w2.localStorage._m.get('kedu_grade') === '5', '① 화면 설정(kedu_grade)만 기기에 남는다');
const vseen = run(w2, "(function(){var o=[];for(var i=0;i<localStorage.length;i++)o.push(localStorage.key(i));return o;})()");
t(!vseen.includes('kedu_progress_l1') && vseen.includes('kedu_grade'), '① key(i) 훑어도 옛 기록은 안 보이고 설정만');

/* ② 교사 u1 — 옛 값 인계 */
fresh(); w = makeWin({ kedu_progress_l1: '{"a":1}', 'kmuseum.tickets': '[1]', kedu_remember: '1' }, { sub: 'u1' });
run(w);
t(w.__keduScope.owner === 'u:u1' && !w.__keduScope.anonymous && w.__keduScope.persist === true, '② 교사 계정 → 주인 u:u1, persist true');
t(run(w, "localStorage.getItem('kedu_progress_l1')") === '{"a":1}' && rawKeys(w).includes('@u:u1|kedu_progress_l1') && !rawKeys(w).includes('kedu_progress_l1'), '② 옛 진행값이 u1 것으로 옮겨져 그대로 읽힌다');
t(rawKeys(w).includes('kedu_remember') && run(w, "localStorage.getItem('kedu_remember')") === '1', '⑥ kedu_remember 는 옮기지 않고 그대로');
run(w, "localStorage.setItem('kedu_progress_l2','{\"b\":2}'); sessionStorage.setItem('kedu_gate_t_v1','T')");
t(rawKeys(w).includes('@u:u1|kedu_progress_l2') && w.sessionStorage._m.has('@u:u1|kedu_gate_t_v1'), '② 새 값은 접두사 키로(localStorage·sessionStorage 둘 다)');
t(run(w, "localStorage.getItem('sb-abc-auth-token')") !== null, '⑥ sb-* 인증 키는 접두사 없이 읽힌다');
const u1raw = Object.fromEntries(w.localStorage._m);

/* ③ 같은 브라우저, 다른 교사 u2 */
fresh(); w = makeWin(u1raw, { sub: 'u2' });
run(w);
t(run(w, "localStorage.getItem('kedu_progress_l1')") === null && run(w, "localStorage.getItem('kedu_progress_l2')") === null, '③ u2 에겐 u1 진행값이 안 보인다');
const seen = run(w, "(function(){var o=[];for(var i=0;i<localStorage.length;i++)o.push(localStorage.key(i));return o;})()");
t(!seen.some(k => k && k.indexOf('kedu_progress') === 0) && seen.includes('sb-abc-auth-token'), '③ key(i) 훑어도 남의 것은 빈 문자열, 인증 키는 보임');
run(w, "localStorage.setItem('kedu_progress_l1','{\"u2\":1}')");
t(w.localStorage._m.get('@u:u1|kedu_progress_l1') === '{"a":1}' && w.localStorage._m.get('@u:u2|kedu_progress_l1') === '{"u2":1}', '③ u2 가 같은 키에 써도 u1 값은 안 덮인다');
const bothRaw = Object.fromEntries(w.localStorage._m);

/* 다시 u1 */
fresh(); w = makeWin(bothRaw, { sub: 'u1' }); run(w);
t(run(w, "localStorage.getItem('kedu_progress_l1')") === '{"a":1}' && run(w, "localStorage.getItem('kedu_progress_l2')") === '{"b":2}', '③ 다시 u1 이면 제 값 그대로 (인계 플래그로 두 번 안 옮김)');

/* ④ 익명(학생) 세션 — 옛 값 안 가져감 */
fresh(); w = makeWin({ kedu_progress_l9: '{"old":1}' }, { sub: 'anon-s1', anon: true }); run(w);
t(w.__keduScope.owner === 'u:anon-s1' && w.__keduScope.anonymous === true && w.__keduScope.persist === true, '④ 동의 좌석(익명 세션) → 주인은 uid, 기기 저장 O');
t(run(w, "localStorage.getItem('kedu_progress_l9')") === null && rawKeys(w).includes('kedu_progress_l9'), '④ 학생(익명)은 옛 값을 가져가지 않는다 — 옛 키는 남는다');
run(w, "localStorage.setItem('kedu_progress_l9','{\"s1\":1}')");
fresh(); const s2 = makeWin(Object.fromEntries(w.localStorage._m), { sub: 'anon-s2', anon: true }); run(s2);
t(run(s2, "localStorage.getItem('kedu_progress_l9')") === null, '④ 다음 학생(익명 uid 다름)은 앞 학생 진행값을 못 본다');

/* ⑤ 게스트(동의 전 학생, 학급코드만) — 기기에 안 남김 */
fresh(); w = makeWin({ '@g:ABC1|kedu_english_done_g3': '[9]' }, null, 'abc1'); run(w); run(w, "localStorage.setItem('kedu_english_done_g3','[1]'); localStorage.setItem('klab_muted','1')");
t(w.__keduScope.owner === 'g:ABC1' && w.__keduScope.persist === false, '⑤ 게스트 → 주인 g:학급코드, persist false');
t(run(w, "localStorage.getItem('kedu_english_done_g3')") === '[1]' && w.localStorage._m.get('@g:ABC1|kedu_english_done_g3') === '[9]', '⑤ 게스트 기록은 메모리만 — 기기 값은 안 바뀜');
fresh(); w2 = makeWin(Object.fromEntries(w.localStorage._m), null, 'abc1'); run(w2);
t(run(w2, "localStorage.getItem('kedu_english_done_g3')") === null && run(w2, "localStorage.getItem('klab_muted')") === '1' && rawKeys(w2).includes('kedu_guest_v1'), '⑤ 다음 접속엔 기록 없음(설정 klab_muted 만 학급코드별로 남고 게스트 표는 그대로)');

/* ⑦ 'kedu_progress_' 훑기 — kedu_lesson_bridge 식 */
fresh(); w = makeWin({ '@u:u9|kedu_progress_g3_math_l1': '{"x":1}', '@u:u1|kedu_progress_g3_math_l1': '{"mine":1}', '@u:u1|kedu_progress_g3_math_l2': '{"mine":2}' }, { sub: 'u1' }); run(w);
const hits = run(w, "(function(){var h=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('kedu_progress_')===0)h.push(k);}return h;})()");
t(hits.length === 2 && hits.every(k => k.indexOf('kedu_progress_g3_math_l') === 0) && run(w, "localStorage.getItem('" + hits[0] + "')") !== null, '⑦ 접두사를 뗀 자기 키만 훑히고 그 키로 다시 읽힌다');

/* ⑧ 게이트 두 파일에 박힘 + 두 번 실려도 한 번만 */
const gate = fs.readFileSync(path.join(ROOT, 'kedu_gate.js'), 'utf8'), tgate = fs.readFileSync(path.join(ROOT, 'kedu_teacher_gate.js'), 'utf8');
const body = src.trim();
t(gate.indexOf(body) > -1 && tgate.indexOf(body) > -1 && gate.indexOf(body) < gate.indexOf("var KEDU_TEMP_LOCK"), '⑧ kedu_gate.js·kedu_teacher_gate.js 맨 위에 같은 코드(원본과 일치)');
fresh(); w = makeWin({}, { sub: 'u1' }); run(w); const first = w.__keduScope; run(w);
t(w.__keduScope === first && w.Storage.prototype.getItem.toString().indexOf('map') > -1, '⑧ 두 번 실려도 한 번만 건다');
/* 케이무비 키는 손대지 않는다 */
run(w, "localStorage.setItem('kmv.layout','{}')");
t(rawKeys(w).includes('kmv.layout'), '케이무비(kmv.*) 키는 그대로(자체 IndexedDB 주인 분리)');

console.log(`\n${pass}/${pass + fail} 통과`);
process.exit(fail ? 1 : 0);
