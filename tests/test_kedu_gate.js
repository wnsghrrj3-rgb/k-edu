#!/usr/bin/env node
/**
 * 열쇠 × 등급 게이트 — 생태계설계 v2 §B·§E · §J-2
 *  ① KeduTier.can — §B 판정표 20칸 + §E 우선순위(개방·학년·동의)
 *  ② tierOfPath / gradeOf / keyOf
 *  ③ kedu_gate.js 집행 (jsdom): 방문자+open 통과(서버 호출 0) · 방문자+class 잠금 카드 · 게스트 학년 불일치 카드 · 개방 목록 통과 · 교사 통과 · 문 없는 경로
 *  ④ 배선: kedu-lesson-id 메타가 있는 차시(gifted 제외)와 class/class_rec 입구는 전부 /kedu_gate.js 를 싣는다
 * 실행: NODE_PATH=/home/claude/.jsdom/node_modules node tests/test_kedu_gate.js   (k-edu 루트 · jsdom 은 케이티처 게이트와 같은 자리)
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };

// ── ① ② 판정기 ─────────────────────────────────────────────
function loadTier() {
  const win = { localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  win.window = win;
  vm.runInNewContext(rd('kedu_tier.js'), win);
  return win.KeduTier;
}
const KT = loadTier();
const L1 = { tier: 'visitor' };
const L2g = { tier: 'guest', guest: { code: 'ABCDEF', grade: 3 } };
const L2a = { tier: 'student', profile: { profile_id: 'p', grade: 3 } };
const T = { tier: 'account', teacher: { approved: true } };
const Tp = { tier: 'account', teacher: { approved: false, approval: 'pending' } };
const ACC = { tier: 'account' };

// §B 표 (열쇠 \ tier): [allow, save]
const table = {
  L1:  { open: [true, false], class: [false, false], class_rec: [false, false], home: [false, false] },
  L2g: { open: [true, false], class: [false, false], class_rec: [false, false], home: [false, false] },
  L2a: { open: [true, true],  class: [false, false], class_rec: [false, false], home: [false, false] },
  T:   { open: [true, false], class: [true, false],  class_rec: [true, false],  home: [true, false] },
};
const keys = { L1, L2g, L2a, T };
// §B 표는 굳은 모드(OPENING_LOCK=true)의 목표 상태. 기본은 무른 모드 — 아래에서 따로 본다.
ok(KT.OPENING_LOCK === false, '개방 잠금 기본값은 무른 모드(§J-3 우리 반에 열기 전)');
KT.OPENING_LOCK = true;
for (const k of Object.keys(table)) for (const tier of Object.keys(table[k])) {
  const r = KT.can(keys[k], tier, 3, {});
  const [a, s] = table[k][tier];
  ok(r.allow === a && r.save === s && r.key === k, `§B ${k}×${tier}: allow=${r.allow} save=${r.save} key=${r.key}`);
}
KT.OPENING_LOCK = false;
// 무른 모드: 학급 세션은 개방 목록 없이도 class·class_rec 을 연다 — 방문자는 여전히 잠김, 동의 규칙은 유지
ok(KT.can(L2g, 'class', 3, {}).allow === true && KT.can(L2g, 'class', 3, {}).reason === 'opened', '무른 모드: L2g class 통과');
ok(KT.can(L2a, 'class_rec', 3, {}).allow === true && KT.can(L2a, 'class_rec', 3, {}).save === true, '무른 모드: L2a class_rec 통과·저장');
ok(KT.can(L2g, 'class_rec', 3, {}).reason === 'consent', '무른 모드: L2g class_rec 은 동의 안내 그대로');
ok(KT.can(L1, 'class', 3, {}).allow === false, '무른 모드: 방문자 class 잠금 유지');
ok(KT.can(Tp, 'class', 3, {}).allow === false, '무른 모드: 미승인 교사 class 잠금 유지');
KT.OPENING_LOCK = true;
// §E ② 개방 목록 → L2 통과(학년 불문), 저장은 동의 학급만
ok(KT.can(L2g, 'class', 5, { opened: true }).allow === true, '개방: L2g class 통과');
ok(KT.can(L2a, 'class', 5, { opened: true }).save === true, '개방: L2a class 저장');
ok(KT.can(L2a, 'class_rec', 3, { opened: true }).allow === true, '개방: L2a class_rec 통과');
const c1 = KT.can(L2g, 'class_rec', 3, { opened: true });
ok(c1.allow === false && c1.reason === 'consent', '개방이어도 L2g class_rec 은 동의 안내');
ok(KT.can(L2g, 'class_rec', 3, {}).reason === 'consent', '미개방 L2g class_rec 도 동의 안내');
ok(KT.can(L2g, 'class', 3, {}).allow === false && KT.can(L2g, 'class', 3, {}).reason === 'locked', '굳은 모드: 미개방 L2g class 잠금');
KT.OPENING_LOCK = false;
// 학년 잠금 — 기본은 무른 모드(GRADE_LOCK=false): 통과 + gradeMismatch 표시. 굳은 모드에서만 잠근다. L2 만 해당.
ok(KT.GRADE_LOCK === false, '학년 잠금 기본값은 무른 모드(class_codes.grade 가 실데이터가 아님)');
const soft = KT.can(L2g, 'open', 5, {}); ok(soft.allow === true && soft.gradeMismatch === true && soft.myGrade === 3, '무른 모드: L2g 학년 불일치 통과+표시');
ok(KT.can(L2a, 'open', 5, {}).allow === true && KT.can(L2a, 'open', 5, {}).save === true, '무른 모드: L2a 통과·저장');
KT.GRADE_LOCK = true;
const g1 = KT.can(L2g, 'open', 5, {}); ok(g1.allow === false && g1.reason === 'grade' && g1.myGrade === 3, '굳은 모드: L2g open 학년 불일치 잠금');
ok(KT.can(L2a, 'open', 5, {}).reason === 'grade', '굳은 모드: L2a open 학년 불일치 잠금');
ok(KT.can(L1, 'open', 5, {}).allow === true, 'L1 은 전 학년 자유');
ok(KT.can(L2g, 'open', null, {}).allow === true, '전학년 콘텐츠(grade null) 는 L2 통과');
ok(KT.can(L2a, 'open', 5, { opened: true }).allow === true, '개방 목록은 학년 잠금보다 앞선다(A5 예외)');
KT.GRADE_LOCK = false;
// 교사·계정
ok(KT.keyOf(T) === 'T' && KT.keyOf(Tp) === 'account' && KT.keyOf(ACC) === 'account', 'keyOf 교사/미승인/계정');
ok(KT.can(Tp, 'class', 3, {}).allow === false && KT.can(Tp, 'class', 3, {}).key === 'account', '미승인 교사는 class 잠김');
ok(KT.can(Tp, 'open', 5, {}).allow === true, '미승인 교사도 open 은 자유');
ok(KT.can(L1, null, 3, {}).allow === true && KT.can(L1, null, 3, {}).reason === 'free', 'tier null = 문 없음');
ok(KT.canSave(L2a) === true && KT.canSave(L2g) === false, 'canSave 종전 규약 유지');

// 경로 → tier
const tp = {
  '/grade3/semester1/math/x.html': 'open', '/english/g5/grammar/x.html': 'open', '/gifted/math/x.html': 'open',
  '/labs/volcano.html': 'open', '/museum/index.html': 'open', '/kedu/hub/klab.html': 'open', '/hub2/index.html': 'open',
  '/kpark/index.html': 'class', '/maker/index.html': 'class', '/kmake/x.html': 'class', '/kple/index.html': 'class', '/draw/index.html': 'class',
  '/classwork/index.html': 'class_rec', '/morning/index.html': 'class_rec', '/kbattle/index.html': 'class_rec', '/live/index.html': 'class_rec',
  '/': null, '/teacher/index.html': null, '/kedu/teacher/g3_math.html': null, '/auth/': null, '/parent/': null,
};
for (const p of Object.keys(tp)) ok(KT.tierOfPath(p) === tp[p], `tierOfPath ${p} → ${KT.tierOfPath(p)} (기대 ${tp[p]})`);
ok(KT.gradeOf('g3_sci_u1_l09_v1', '/x') === 3, 'gradeOf lesson-id');
ok(KT.gradeOf('', '/grade5/semester1/math/x.html') === 5, 'gradeOf /grade5/');
ok(KT.gradeOf('', '/english/g2/x.html') === 2, 'gradeOf /english/g2/');
ok(KT.gradeOf('kg_math_l2_pro01', '/gifted/x') === null, 'gradeOf 케이영재 = 전학년');

// ── ③ 집행자 (jsdom) ───────────────────────────────────────
const gateSrc = rd('kedu_gate.js'), tierSrc = rd('kedu_tier.js');
function runGate({ url, meta = '', ls = {}, ss = {}, resolveAs = null, gradeLock = false, openingLock = false }) {
  const html = `<!doctype html><html><head>${meta}</head><body><p>page</p></body></html>`;
  const dom = new JSDOM(html, { url, runScripts: 'outside-only' });
  const w = dom.window;
  Object.keys(ls).forEach(k => w.localStorage.setItem(k, ls[k]));
  Object.keys(ss).forEach(k => w.sessionStorage.setItem(k, ss[k]));
  let rpcCalls = 0;
  if (resolveAs) {
    // 세션 흔적 + 가짜 DB: resolve 가 my_seat_class/teachers 를 두드린다
    w.localStorage.setItem('sb-x-auth-token', '{}');
    w.supabase = {};
    w.getKeduDb = () => ({
      auth: { getSession: () => Promise.resolve({ data: { session: { user: { id: 'u1' } } } }) },
      rpc: (n) => { rpcCalls++; return Promise.resolve(resolveAs.tier === 'student' ? { data: { status: 'ok', profile_id: 'p', grade: resolveAs.grade } } : { data: { status: 'no_profile' } }); },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => { rpcCalls++; return Promise.resolve({ data: resolveAs.teacher || null }); } }) }) }),
    });
  }
  w.eval(tierSrc);   // 판정기 선탑재 (실서비스에선 없으면 스스로 싣는다)
  if (gradeLock) w.KeduTier.GRADE_LOCK = true;
  if (openingLock) w.KeduTier.OPENING_LOCK = true;
  w.eval(gateSrc);
  return new Promise(res => setTimeout(() => res({ w, doc: w.document, rpcCalls }), 30));
}
(async () => {
  let r;
  r = await runGate({ url: 'https://keduclass.com/grade3/semester1/math/g3_math_tb_01.html', meta: '<meta name="kedu-lesson-id" content="g3_math_tb_01_v1">' });
  ok(!r.doc.getElementById('kedu-lock') && r.w.KeduGate && r.w.KeduGate.result.allow && r.w.KeduGate.result.reason === 'open', '방문자+open 통과');
  ok(r.rpcCalls === 0, '방문자+open 서버 호출 0');

  r = await runGate({ url: 'https://keduclass.com/kpark/index.html' });
  ok(!!r.doc.getElementById('kedu-lock') && /열어주면/.test(r.doc.getElementById('kedu-lock').textContent), '방문자+class 잠금 카드');
  ok(/학급 코드로 들어가기/.test(r.doc.getElementById('kedu-lock').textContent), '방문자 카드에 학급 코드 안내');

  const guest = JSON.stringify({ code: 'ABCDEF', label: 'x', grade: 3, day: (d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate())(new Date()) });
  r = await runGate({ url: 'https://keduclass.com/grade5/semester1/math/x.html', meta: '<meta name="kedu-lesson-id" content="g5_math_tb_01_v1">', ls: { kedu_guest_v1: guest } });
  ok(!r.doc.getElementById('kedu-lock') && r.w.KeduGate.result.gradeMismatch === true, '무른 모드(기본): 게스트 다른 학년 차시 통과 + 표시 — 2026-08-26 준호 접속 불가 재현 방지');
  r = await runGate({ url: 'https://keduclass.com/grade5/semester1/math/x.html', meta: '<meta name="kedu-lesson-id" content="g5_math_tb_01_v1">', ls: { kedu_guest_v1: guest }, gradeLock: true });
  ok(!!r.doc.getElementById('kedu-lock') && /5학년 방/.test(r.doc.getElementById('kedu-lock').textContent) && /3학년/.test(r.doc.getElementById('kedu-lock').textContent), '굳은 모드: 게스트 학년 불일치 카드');

  r = await runGate({ url: 'https://keduclass.com/grade3/semester1/math/x.html', meta: '<meta name="kedu-lesson-id" content="g3_math_tb_01_v1">', ls: { kedu_guest_v1: guest } });
  ok(!r.doc.getElementById('kedu-lock'), '게스트 학년 일치 통과');

  r = await runGate({ url: 'https://keduclass.com/kpark/index.html', ls: { kedu_guest_v1: guest } });
  ok(!r.doc.getElementById('kedu-lock') && r.w.KeduGate.result.reason === 'opened', '무른 모드(기본): 게스트 class 개방 목록 없이 통과 — 2026-08-26 "활동을 못 연다" 재현 방지');
  r = await runGate({ url: 'https://keduclass.com/kpark/index.html', ls: { kedu_guest_v1: guest }, openingLock: true });
  ok(!!r.doc.getElementById('kedu-lock') && /열어주면/.test(r.doc.getElementById('kedu-lock').textContent), '굳은 모드: 미개방 게스트 class 잠금 카드');
  r = await runGate({ url: 'https://keduclass.com/kpark/index.html', ls: { kedu_guest_v1: guest }, ss: { kedu_openings_v1: JSON.stringify(['/kpark/']) }, openingLock: true });
  ok(!r.doc.getElementById('kedu-lock') && r.w.KeduGate.result.reason === 'opened', '굳은 모드: 개방 목록(경로 접두) → 게스트 class 통과');

  r = await runGate({ url: 'https://keduclass.com/morning/index.html', ls: { kedu_guest_v1: guest }, ss: { kedu_openings_v1: JSON.stringify(['/morning/']) } });
  ok(!!r.doc.getElementById('kedu-lock') && /동의 후/.test(r.doc.getElementById('kedu-lock').textContent), '게스트 class_rec 은 개방돼도 동의 카드');

  r = await runGate({ url: 'https://keduclass.com/kpark/index.html', resolveAs: { tier: 'account', teacher: { id: 't', approval: 'approved' } } });
  ok(!r.doc.getElementById('kedu-lock') && r.w.KeduGate.result.reason === 'teacher', '승인 교사 class 통과');
  ok(!!r.w.sessionStorage.getItem('kedu_gate_t_v1'), '열쇠 판별 결과 캐시(교사)');
  ok(typeof r.w.KeduGate.clearCache === 'function', 'KeduGate.clearCache 노출');
  // 세션 흔적은 있는데 세션이 죽은 경우(로그아웃 직후 등) — 방문자 결과는 캐시하지 않는다
  {
    const html = `<!doctype html><html><head></head><body></body></html>`;
    const dom = new JSDOM(html, { url: 'https://keduclass.com/kpark/index.html', runScripts: 'outside-only' });
    const w = dom.window; w.localStorage.setItem('sb-x-auth-token', '{}'); w.supabase = {};
    w.getKeduDb = () => ({ auth: { getSession: () => Promise.resolve({ data: { session: null } }) } });
    w.eval(tierSrc); w.eval(gateSrc);
    await new Promise(res => setTimeout(res, 30));
    ok(!w.sessionStorage.getItem('kedu_gate_t_v1') && !!w.document.getElementById('kedu-lock'), '죽은 세션 → 방문자 잠금이되 캐시는 남기지 않는다(로그인 직후 5분 잠김 방지)');
  }

  r = await runGate({ url: 'https://keduclass.com/kpark/index.html', resolveAs: { tier: 'account', teacher: { id: 't', approval: 'pending' } } });
  ok(!!r.doc.getElementById('kedu-lock') && /계정 확인/.test(r.doc.getElementById('kedu-lock').textContent), '미승인 교사 class → 계정 확인 카드');

  r = await runGate({ url: 'https://keduclass.com/grade5/semester1/math/x.html', meta: '<meta name="kedu-lesson-id" content="g5_math_tb_01_v1">', resolveAs: { tier: 'student', grade: 3 } });
  ok(!r.doc.getElementById('kedu-lock'), '무른 모드(기본): 좌석 학생 다른 학년 차시 통과');
  r = await runGate({ url: 'https://keduclass.com/grade5/semester1/math/x.html', meta: '<meta name="kedu-lesson-id" content="g5_math_tb_01_v1">', resolveAs: { tier: 'student', grade: 3 }, gradeLock: true });
  ok(!!r.doc.getElementById('kedu-lock') && /5학년 방/.test(r.doc.getElementById('kedu-lock').textContent), '굳은 모드: 좌석 학생 학년 불일치 카드');
  // 굳은 모드 전제 ① — 교사 화면이 학급 학년을 실제로 받는다
  const tpage = rd('teacher/index.html');
  ok(!/grade:\s*1,/.test(tpage) && tpage.includes('id="new-class-grade"') && tpage.includes('function setClassGrade('), '교사 화면: 학급 생성 학년 선택 + 기존 학급 학년 변경 (grade:1 고정 제거)');

  r = await runGate({ url: 'https://keduclass.com/kpark/index.html', meta: '<meta name="kedu-tier" content="open">' });
  ok(!r.doc.getElementById('kedu-lock'), 'meta kedu-tier 가 경로 표보다 앞선다');

  r = await runGate({ url: 'https://keduclass.com/teacher/index.html' });
  ok(!r.doc.getElementById('kedu-lock') && !r.w.KeduGate, '문 없는 경로는 아무것도 안 한다');

  // ── ④ 배선 ───────────────────────────────────────────────
  const walk = (d, acc = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name.startsWith('.')) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, acc) : (p.endsWith('.html') && acc.push(p)); } return acc; };
  const all = walk(R);
  let missing = [];
  for (const f of all) {
    const rel = f.slice(R.length);
    if (rel.startsWith('/gifted/') || rel.startsWith('/archive/') || rel.startsWith('/node_modules/')) continue;
    const s = fs.readFileSync(f, 'utf8');
    if (s.includes('name="kedu-lesson-id"') && !s.includes('/kedu_gate.js')) missing.push(rel);
  }
  ok(missing.length === 0, '게이트 미탑재 차시 ' + missing.length + '건: ' + missing.slice(0, 5).join(', '));
  for (const e of ['/kpark/index.html', '/maker/index.html', '/kmake/index.html', '/kple/index.html', '/morning/index.html', '/live/index.html', '/classwork/index.html', '/kbattle/index.html', '/draw/index.html']) {
    if (fs.existsSync(path.join(R, e))) ok(rd(e).includes('/kedu_gate.js'), '입구 게이트 미탑재: ' + e);
  }
  ok(!/KEDU_TEMP_LOCK = true/.test(gateSrc), '구 임시 잠금은 꺼진 채');

  // ── ⑤ DB 원장 거울: sql/setup_contents_tier.sql 의 prefix→tier 가 JS 표와 같은가 (open 은 ELSE 로 떨어진다)
  const sqlTier = rd('sql/setup_contents_tier.sql');
  const sqlMap = {};
  for (const m of sqlTier.matchAll(/file_path LIKE '(\/[a-z0-9_-]+\/)%'\s+THEN '([a-z_]+)'/g)) sqlMap[m[1]] = m[2];
  const jsNonOpen = KT.CONTENT_TIERS.filter(([, t]) => t !== 'open');
  ok(Object.keys(sqlMap).length === jsNonOpen.length, `SQL 거울 항목 수 ${Object.keys(sqlMap).length} ≠ JS 비-open ${jsNonOpen.length}`);
  for (const [p, t] of jsNonOpen) ok(sqlMap[p] === t, `SQL 거울 불일치 ${p}: sql=${sqlMap[p]} js=${t}`);
  ok(/ELSE 'open'/.test(sqlTier), 'SQL 거울 ELSE open');

  console.log(`열쇠×등급 게이트 — ${pass} PASS / ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
