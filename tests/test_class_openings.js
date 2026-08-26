#!/usr/bin/env node
/**
 * 「우리 반에 열기」 게이트 — 생태계설계 v2 §F · §J-3
 *  ① sql/setup_class_openings.sql — 테이블·제약·RLS·RPC 셋(list/open/close)
 *  ② kedu_boxbar.js — openingKey 규약(차시/영역/페이지) · 패널의 열기 블록 · 열기(카드+원장, 한 통로) · 닫기 · 미승인 안내
 *  ③ kedu_gate.js — 학급 세션이 list_class_openings 로 개방 목록을 받아 판정(굳은 모드) · 캐시 {code,keys,at} · 실패 미캐시 · 「다시 확인」
 *  ④ teacher/index.html — 개방 현황 표 · close_for_class 배선 · 입구 5 에 boxbar
 * 실행: NODE_PATH=/home/claude/.jsdom/node_modules node tests/test_class_openings.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };
const tick = (ms = 40) => new Promise(r => setTimeout(r, ms));

// ── ① SQL ──────────────────────────────────────────────────
const sql = rd('sql/setup_class_openings.sql');
['CREATE TABLE IF NOT EXISTS class_openings', 'UNIQUE (class_code_id, content_key)', 'bundle_id     uuid REFERENCES cw_bundles(id)',
 'class_openings_key_check', 'ENABLE ROW LEVEL SECURITY', 'CREATE POLICY p_class_openings_teacher',
 'AND kedu_teacher_approved()', 'FUNCTION list_class_openings(p_class_code text)', 'TO anon, authenticated',
 'FUNCTION open_for_class(', 'ON CONFLICT (class_code_id, content_key) DO UPDATE', 'COALESCE(class_openings.bundle_id, EXCLUDED.bundle_id)',
 'FUNCTION close_for_class(', "RAISE EXCEPTION 'approval required'"]
  .forEach(k => ok(sql.includes(k), 'SQL 누락: ' + k));
ok(!/\$\$/.test(sql), 'SQL 에 $$ 사용 — $fn$/$do$ 로');
ok(/c\.is_active = true/.test(sql) && /upper\(trim\(coalesce\(p_class_code/.test(sql), 'list_class_openings: 활성 학급 + 코드 정규화(peek_class 와 동일)');

// ── 공용: 기록하는 가짜 DB ───────────────────────────────────
function mockDb(opts = {}) {
  const calls = [];
  const table = (name) => {
    const q = { _t: name, _f: [] };
    const chain = {
      insert(row) { calls.push({ op: 'insert', t: name, row }); q._ins = row; return chain; },
      select(cols) { q._sel = cols; return chain; },
      eq(k, v) { q._f.push([k, v]); return chain; },
      order() { return chain; },
      limit() { return chain; },
      upsert(row, o) { calls.push({ op: 'upsert', t: name, row, o }); return Promise.resolve({ error: opts.failSend ? { message: 'x' } : null }); },
      single() { return Promise.resolve({ data: { id: name + '_id_' + calls.length }, error: null }); },
      maybeSingle() {
        calls.push({ op: 'maybeSingle', t: name, f: q._f });
        if (name === 'class_openings') return Promise.resolve({ data: opts.opened ? { id: 'o1', bundle_id: opts.opened.bundle_id || null } : null, error: null });
        return Promise.resolve({ data: null, error: null });
      },
      then(res) {   // await 로 끝나는 체인(items insert · class list)
        calls.push({ op: 'then', t: name, f: q._f });
        if (name === 'class_codes') return Promise.resolve({ data: opts.classes || [{ id: 'c1', label: '1학년 2반' }] }).then(res);
        return Promise.resolve({ error: null, data: [] }).then(res);
      }
    };
    return chain;
  };
  return {
    calls,
    auth: { getSession: () => Promise.resolve({ data: { session: opts.noSession ? null : { user: { id: 'u1' } } } }) },
    rpc: (n, args) => {
      calls.push({ op: 'rpc', n, args });
      if (n === 'cw_my_teacher_id') return Promise.resolve({ data: 't1' });
      if (n === 'open_for_class') return Promise.resolve(opts.openError ? { error: { message: opts.openError } } : { data: 'open1', error: null });
      if (n === 'close_for_class') return Promise.resolve({ data: 1, error: null });
      if (n === 'list_class_openings') return Promise.resolve(opts.listError ? { error: { message: 'boom' } } : { data: (opts.list || []).map(k => ({ content_key: k })), error: null });
      if (n === 'my_seat_class') return Promise.resolve({ data: opts.seat || { status: 'no_profile' } });
      return Promise.resolve({ data: null, error: null });
    },
    from: table,
  };
}

// ── ② boxbar ───────────────────────────────────────────────
const boxSrc = rd('kedu_boxbar.js');
function boxWin({ url, title = '케이파크 | 케이에듀', meta = '', db }) {
  const dom = new JSDOM(`<!doctype html><html><head><title>${title}</title>${meta}</head><body></body></html>`, { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.localStorage.setItem('kedu_boxbar_teacher_v1', JSON.stringify({ at: Date.now() }));
  w.supabase = {}; w.getKeduDb = () => db;
  w.eval(boxSrc);
  return w;
}
(async () => {
  // openingKey 규약
  {
    const w = boxWin({ url: 'https://keduclass.com/kpark/index.html', db: mockDb() });
    const K = w.KeduBoxbar.openingKey;
    ok(K('/kpark/index.html', '').key === '/kpark/' && K('/kpark/index.html', '').scope === 'area', 'openingKey 허브 index.html → 영역');
    ok(K('/kpark/', '').key === '/kpark/', 'openingKey 허브 / → 영역');
    ok(K('/labs/volcano.html', '').key === '/labs/volcano.html' && K('/labs/volcano.html', '').scope === 'page', 'openingKey 도구 → 페이지');
    ok(K('/x', 'g3_sci_u1_l09_v1').key === 'g3_sci_u1_l09_v1' && K('/x', 'g3_sci_u1_l09_v1').scope === 'lesson', 'openingKey 차시 → lesson-id');
    ok(K('/Grade3/Semester1/Math/Index.HTML', '').key === '/grade3/semester1/math/index.html', 'openingKey 소문자 정규화');
    await tick();
    ok(w.document.querySelector('.kbx-fab'), '교사 표식 있으면 FAB 부팅');
  }
  // 패널 → 반 선택 → 열기 블록 상태 → 열기(카드 + 원장) → 닫기
  {
    const db = mockDb();
    const w = boxWin({ url: 'https://keduclass.com/kpark/index.html', db });
    w.KeduBoxbar.openPanel();
    await tick();
    const p = w.document.querySelector('.kbx-panel');
    ok(!!p && !!p.querySelector('.kbx-p-open-btn'), '패널에 열기 블록');
    await tick(60);   // 학급 칩 로드 + 유일 반 자동 선택 + 상태 조회
    const btn = p.querySelector('.kbx-p-open-btn'), txt = p.querySelector('.kbx-p-open-txt');
    ok(!btn.disabled && /1학년 2반에 열기/.test(btn.textContent) && /닫혀 있어요/.test(txt.textContent), '유일 반 자동 선택 → 닫힘 상태 + 열기 버튼');
    const res = await w.KeduBoxbar.openForClass({ id: 'c1', label: '1학년 2반' });
    const inserts = db.calls.filter(c => c.op === 'insert').map(c => c.t);
    const openRpc = db.calls.find(c => c.op === 'rpc' && c.n === 'open_for_class');
    ok(inserts.includes('cw_bundles') && inserts.includes('cw_items') && db.calls.some(c => c.op === 'upsert' && c.t === 'cw_sends'), '열기 = 케이박스 카드(박스·항목·발송) 생성');
    ok(!!openRpc && openRpc.args.p_content_key === '/kpark/' && openRpc.args.p_class_code_id === 'c1' && !!openRpc.args.p_bundle_id, '열기 = open_for_class(영역 키 · 반 · bundle_id)');
    ok(openRpc.args.p_title === '케이파크' && openRpc.args.p_kind === 'link' && openRpc.args.p_url === '/kpark/index.html', '열기: 제목·종류·url 전달');
    ok(res && res.id === 'open1', 'openForClass 결과');
    const n = await w.KeduBoxbar.closeForClass({ id: 'c1', label: '1학년 2반' });
    const closeRpc = db.calls.find(c => c.op === 'rpc' && c.n === 'close_for_class');
    ok(n === 1 && closeRpc && closeRpc.args.p_content_key === '/kpark/', '닫기 = close_for_class(키)');
  }
  // 이미 열린 반: 카드 다시 만들지 않고(bundle 재사용) 상태는 닫기 버튼
  {
    const db = mockDb({ opened: { bundle_id: 'b_old' } });
    const w = boxWin({ url: 'https://keduclass.com/kpark/index.html', db });
    w.KeduBoxbar.openPanel(); await tick(100);
    const btn = w.document.querySelector('.kbx-p-open-btn');
    ok(/에서 닫기/.test(btn.textContent) && btn.classList.contains('opened'), '열린 반 → 닫기 버튼');
    await w.KeduBoxbar.openForClass({ id: 'c1', label: '1학년 2반' });
    ok(!db.calls.some(c => c.op === 'insert' && c.t === 'cw_bundles'), '이미 열린 키 재열기 → 카드 중복 생성 없음');
    ok(db.calls.find(c => c.op === 'rpc' && c.n === 'open_for_class').args.p_bundle_id === 'b_old', '재열기 → 기존 bundle_id 전달');
  }
  // 차시 페이지에서는 lesson-id 로 연다
  {
    const db = mockDb();
    const w = boxWin({ url: 'https://keduclass.com/grade3/semester1/science/x.html', title: '자석의 이용 | 케이에듀', meta: '<meta name="kedu-lesson-id" content="g3_sci_u1_l09_v1">', db });
    await w.KeduBoxbar.openForClass({ id: 'c1', label: '1학년 2반' });
    const r = db.calls.find(c => c.op === 'rpc' && c.n === 'open_for_class');
    ok(r && r.args.p_content_key === 'g3_sci_u1_l09_v1' && r.args.p_kind === 'selfstudy', '차시 열기 = lesson-id · kind selfstudy');
  }
  // 미승인 교사: RPC 가 approval required → 안내 토스트, 결과 null
  {
    const db = mockDb({ openError: 'approval required' });
    const w = boxWin({ url: 'https://keduclass.com/kpark/index.html', db });
    const res = await w.KeduBoxbar.openForClass({ id: 'c1', label: '1학년 2반' });
    await tick();
    ok(res === null && /교사 확인이 끝나야/.test(w.document.body.textContent), '미승인 → 안내 토스트');
  }

  // ── ③ gate ─────────────────────────────────────────────────
  const gateSrc = rd('kedu_gate.js'), tierSrc = rd('kedu_tier.js');
  const today = (d => d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate())(new Date());
  const guest = JSON.stringify({ code: 'ABCDEF', label: '1학년 2반', grade: 1, day: today });
  function gateWin({ url, db, ls = {}, ss = {}, openingLock = true, session = false }) {
    const dom = new JSDOM('<!doctype html><html><head></head><body><p>x</p></body></html>', { url, runScripts: 'outside-only' });
    const w = dom.window;
    Object.keys(ls).forEach(k => w.localStorage.setItem(k, ls[k]));
    Object.keys(ss).forEach(k => w.sessionStorage.setItem(k, ss[k]));
    if (session) w.localStorage.setItem('sb-x-auth-token', '{}');
    w.supabase = {}; w.getKeduDb = () => db;
    w.eval(tierSrc); if (openingLock) w.KeduTier.OPENING_LOCK = true; w.eval(gateSrc);
    return w;
  }
  {
    const db = mockDb({ list: ['/kpark/'] });
    const w = gateWin({ url: 'https://keduclass.com/kpark/index.html', db, ls: { kedu_guest_v1: guest } });
    await tick();
    const rpc = db.calls.find(c => c.op === 'rpc' && c.n === 'list_class_openings');
    ok(rpc && rpc.args.p_class_code === 'ABCDEF', '게스트: list_class_openings(학급코드) 호출');
    ok(!w.document.getElementById('kedu-lock') && w.KeduGate.result.reason === 'opened', '게스트: 영역 개방 → 통과');
    const c = JSON.parse(w.sessionStorage.getItem('kedu_openings_v1'));
    ok(c && c.code === 'ABCDEF' && c.keys[0] === '/kpark/' && typeof c.at === 'number', '개방 목록 캐시 {code,keys,at}');
  }
  {
    const db = mockDb({ list: [] });
    const w = gateWin({ url: 'https://keduclass.com/kpark/index.html', db, ls: { kedu_guest_v1: guest } });
    await tick();
    const lk = w.document.getElementById('kedu-lock');
    ok(!!lk && /열어주면/.test(lk.textContent) && /다시 확인/.test(lk.textContent), '게스트: 미개방 → 잠금 카드 + 「다시 확인」');
    // 「다시 확인」 → 캐시 비우고 다시 묻는다(이번엔 열려 있음)
    db.calls.length = 0; db.rpc = ((orig) => (n, a) => n === 'list_class_openings' ? Promise.resolve({ data: [{ content_key: '/kpark/' }], error: null }) : orig(n, a))(db.rpc);
    const btn = [...lk.querySelectorAll('button')].find(b => /다시 확인/.test(b.textContent));
    btn.click();
    await tick(60);
    ok(!w.document.getElementById('kedu-lock') && w.KeduGate.result.reason === 'opened', '「다시 확인」 → 캐시 무효 → 개방 반영');
  }
  {
    const db = mockDb({ list: ['g3_sci_u1_l09_v1'] });
    const w = gateWin({ url: 'https://keduclass.com/kpark/index.html', db, ls: { kedu_guest_v1: guest } });
    await tick();
    ok(!!w.document.getElementById('kedu-lock'), '다른 키(차시)만 열림 → 영역은 잠김');
  }
  {
    const db = mockDb({ listError: true });
    const w = gateWin({ url: 'https://keduclass.com/kpark/index.html', db, ls: { kedu_guest_v1: guest } });
    await tick();
    ok(!!w.document.getElementById('kedu-lock') && !w.sessionStorage.getItem('kedu_openings_v1'), 'RPC 실패 → 잠금이되 캐시 없음(다음 페이지에서 다시 묻는다)');
  }
  {
    // 좌석 학생: my_seat_class 의 class_code 로 묻는다
    const db = mockDb({ list: ['/kpark/'], seat: { status: 'ok', profile_id: 'p', grade: 1, class_code: 'ZZZ999' } });
    const w = gateWin({ url: 'https://keduclass.com/kpark/index.html', db, session: true });
    await tick(60);
    const rpc = db.calls.find(c => c.op === 'rpc' && c.n === 'list_class_openings');
    ok(rpc && rpc.args.p_class_code === 'ZZZ999' && !w.document.getElementById('kedu-lock'), '좌석 학생: 자기 학급코드로 개방 목록 → 통과');
  }
  {
    // open 콘텐츠는 개방 목록을 묻지 않는다(무른 학년 잠금) — 서버 호출 최소화
    const db = mockDb({ list: [] });
    const w = gateWin({ url: 'https://keduclass.com/grade3/semester1/math/x.html', db, ls: { kedu_guest_v1: guest } });
    await tick();
    ok(!db.calls.some(c => c.op === 'rpc' && c.n === 'list_class_openings') && !w.document.getElementById('kedu-lock'), 'open 콘텐츠: 개방 목록 호출 없음');
  }
  {
    // 방문자는 개방 목록과 무관하게 잠긴다
    const db = mockDb({ list: ['/kpark/'] });
    const w = gateWin({ url: 'https://keduclass.com/kpark/index.html', db });
    await tick();
    ok(!!w.document.getElementById('kedu-lock') && !db.calls.some(c => c.op === 'rpc'), '방문자: 잠금 + 서버 호출 0');
  }

  // ── ④ teacher page + 입구 boxbar ────────────────────────────
  const t = rd('teacher/index.html');
  ['id="openings-list"', "from('class_openings')", "db.rpc('close_for_class'", 'await loadOpenings();', 'function openingScope(']
    .forEach(k => ok(t.includes(k), 'teacher 배선 누락: ' + k));
  ok(t.indexOf('await loadClassCode();') < t.indexOf('await loadOpenings();'), 'teacher: 개방 현황은 학급코드 뒤');
  for (const e of ['kpark/index.html', 'kmake/index.html', 'morning/index.html', 'live/index.html', 'maker/index.html', 'kple/index.html', 'draw/index.html']) {
    if (fs.existsSync(path.join(R, e))) ok(rd(e).includes('/kedu_boxbar.js'), '입구 boxbar 미탑재: ' + e);
  }

  console.log(`우리 반에 열기 게이트 — ${pass} PASS / ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})();
