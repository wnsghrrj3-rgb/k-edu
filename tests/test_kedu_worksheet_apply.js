// 케이학습지 「응용」 칸 (교과서판 2학기 W0, 2026-11-06)
//  ① build.html — 교과서판(tb_)만 기본으로 보이고, 「응용 문항도 보기」를 켜면 옛 세트(lesson_apply·unit_apply)도 함께
//  ② check_sets — 응용 규칙(tb_ 는 응용 갈래 금지 · 응용은 같은 단원 tb_ 가 있어야 · 연결표 basic/challenge/review 는 교과서판만 · apply 는 응용만)
//  ③ play.html KINDNAME · sets_to_seed / RPC 가 다시 넣기로 갈래를 맞추는지
// 실행: NODE_PATH=<jsdom 있는 곳> node tests/test_kedu_worksheet_apply.js   (k-edu 루트)
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const R = path.join(__dirname, '..');
let P = 0, F = 0; const ok = (c, m) => { c ? P++ : (F++, console.log('FAIL', m)); };

/* ── ③ 정적 배선 ─────────────────────────────────────────── */
const play = fs.readFileSync(path.join(R, 'kedu/worksheet/play.html'), 'utf8');
ok(/lesson_apply:'응용 학습지'/.test(play) && /unit_apply:'단원 응용'/.test(play), 'play KINDNAME 응용 이름');
const seed = fs.readFileSync(path.join(R, 'kedu/worksheet/tools/sets_to_seed.py'), 'utf8');
ok(/source_kind=EXCLUDED\.source_kind/.test(seed), 'sets_to_seed 다시 넣기로 갈래 갱신');
const rpc = fs.readFileSync(path.join(R, 'sql/setup_admin_seed.sql'), 'utf8');
ok(/source_kind = EXCLUDED\.source_kind/.test(rpc), 'admin_seed_rows 다시 넣기로 갈래 갱신');
const sh = fs.readFileSync(path.join(R, 'admin/seed.html'), 'utf8');
ok(/\.\.\.\(v\.apply \|\| \[\]\)/.test(sh), 'seed.html 이 apply 세트도 넣음');
ok(/hk\.get\(x\.qcode\) === x\.source_kind/.test(sh), 'seed.html 「이미 있음」은 갈래까지 같을 때만');
const pr = fs.readFileSync(path.join(R, 'kedu_practice.js'), 'utf8'), te = fs.readFileSync(path.join(R, 'kedu/teacher/engine/teacher-engine.js'), 'utf8');
ok(!/\.apply\b(?!\()/.test(pr.replace(/orig\.apply/g, '')), '자기주도 문은 apply 칸을 읽지 않음(교과서판만)');
ok(!/e\.apply\b/.test(te), '케이티처 ✍ 문제는 apply 칸을 읽지 않음(교과서판만)');

/* ── ① build.html ───────────────────────────────────────── */
const { JSDOM } = require('jsdom'); const vm = require('vm');
let html = fs.readFileSync(path.join(R, 'kedu/worksheet/build.html'), 'utf8').replace(/<script src="[^"]*"[^>]*><\/script>/g, '');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://keduclass.com/kedu/worksheet/build.html' });
const w = dom.window;
const BANK = []; let id = 0;
const mk = (g, s, u, l, c, d, sk, ss) => BANK.push({ id: 'q' + (++id), qcode: `${ss}#${id}`, grade: g, semester: s, subject: 'math', unit_code: u, lesson_code: l, concept_code: c, difficulty: d, qkind: 'mc', stem: `${sk} 문항 ${id}`, misconception_codes: [], source_kind: sk, source_set: ss, source: 'bank' });
// 6-2 수학 1단원: 교과서판 + 응용(옛) / 6-2 수학 2단원: 옛것만(아직 교과서판 없음 = 그대로 lesson_basic)
for (let l = 1; l <= 2; l++) for (let d = 1; d <= 4; d++) for (let k = 0; k < 2; k++) {
  mk(6, 2, 'u1', 'L0' + l, `math-6-2-u1-C${l}`, d, 'lesson_basic', `tb_g6_2_math_u1_L0${l}_basic`);
  mk(6, 2, 'u1', 'L0' + l, `math-6-2-u1-C${l}`, d, 'lesson_apply', `g6_2_math_u1_L0${l}_basic`);
  mk(6, 2, 'u2', 'L0' + l, `math-6-2-u2-C${l}`, d, 'lesson_basic', `g6_2_math_u2_L0${l}_basic`);
}
for (const f of ['a', 'b']) for (let i = 0; i < 5; i++) {
  mk(6, 2, 'u1', 'L09', 'math-6-2-u1-C1', 1, 'unit_review', 'tb_g6_2_math_u1_review_' + f);
  mk(6, 2, 'u1', 'L09', 'math-6-2-u1-C1', 1, 'unit_apply', 'g6_2_math_u1_review_' + f);
}
const CONCEPTS = []; for (const q of BANK) if (!CONCEPTS.some(c => c.code === q.concept_code)) CONCEPTS.push({ code: q.concept_code, name: '개념 ' + q.concept_code, lesson_no: +q.lesson_code.slice(1), unit_code: q.unit_code, grade: q.grade, subject: q.subject, semester: q.semester });
const table = name => { const b = { select() { return b }, eq() { return b }, order() { return b }, limit() { return b }, maybeSingle() { return Promise.resolve({ data: { id: 't1', name: '준호' } }) },
  range(a, c) { return Promise.resolve({ data: BANK.slice(a, c + 1) }); },
  then(res) { res({ data: name === 'concepts' ? CONCEPTS : [], count: BANK.length }); } }; return b; };
w.getKeduDb = () => ({ auth: { getSession() { return Promise.resolve({ data: { session: { user: { id: 'u' } } } }) } }, from: table });
w.KEDU_MAP = {};
w.eval(html.match(/<script>([\s\S]*)<\/script>/)[1] + '\n;window.__U=()=>UCART;window.__C=()=>CART;');
setTimeout(() => {
  const d = w.document, $ = i => d.getElementById(i), txt = i => Array.from($(i).options).map(o => o.textContent);
  const n = () => d.querySelectorAll('#qlist .q').length;
  ok(n() === 26 + 16, '기본은 교과서판 + 교과서판 없는 단원 — 응용 숨김 ' + n());
  ok(!Array.from(d.querySelectorAll('#qlist .q .stem')).some(e => /lesson_apply/.test(e.textContent)), '목록에 응용 문항 없음');
  ok($('fApply') && !$('fApply').checked && /응용 26/.test($('fApply').parentNode.textContent), '「응용 문항도 보기」 칸 · 응용 수 표시');
  $('fUnit').value = 'u1'; $('fUnit').dispatchEvent(new w.Event('change'));
  ok(n() === 26, '1단원 교과서판만 26 ' + n());
  // 빠른 조립 — 기본은 교과서판에서만
  $('qaUnit').value = 'u1'; $('qaUnit').dispatchEvent(new w.Event('change'));
  $('qaConcept').value = 'math-6-2-u1-C1'; $('qaN').value = '10'; $('qaGo').click();
  ok(w.__C().length > 0 && w.__C().every(q => !/apply/.test(q.source_kind)), '빠른 조립은 교과서판만 ' + w.__C().map(q => q.source_kind).join(','));
  $('clear').click();
  // 켜기
  $('fApply').checked = true; $('fApply').dispatchEvent(new w.Event('change'));
  ok(n() === 68, '응용 켜면 전부 ' + n());
  ok(d.querySelectorAll('#qlist .badge.apply').length === 26, '응용 문항에 「응용」 표지 ' + d.querySelectorAll('#qlist .badge.apply').length);
  ok($('fApply') && $('fApply').checked, '켠 상태가 다시 그려도 유지');
  $('fApply').checked = false; $('fApply').dispatchEvent(new w.Event('change'));
  ok(n() === 42, '다시 끄면 숨김 ' + n());
  // 단원 평가 — 동형은 교과서판 종합만, 추천도 응용 빼고
  d.querySelector('#topTabs [data-top="unit"]').click();
  $('uUnit').value = 'u1'; $('uUnit').dispatchEvent(new w.Event('change'));
  ok(txt('uForm').join() === '단원 종합 A형,단원 종합 B형', '동형 = 교과서판 종합만 ' + txt('uForm'));
  $('uFormGo').click(); ok(w.__U().length === 5 && w.__U().every(x => x.q.source_kind === 'unit_review'), '동형 담기 = tb 종합 ' + w.__U().length);
  $('uGo').click(); ok(w.__U().length > 0 && w.__U().every(x => !/apply/.test(x.q.source_kind)), '추천안에 응용 없음 ' + w.__U().length);
  ok($('uApply') && !$('uApply').checked, '단원 평가에도 응용 칸');
  $('uApply').checked = true; $('uApply').dispatchEvent(new w.Event('change'));
  $('uUnit').value = 'u1'; $('uUnit').dispatchEvent(new w.Event('change'));
  $('uGo').click(); ok(w.__U().some(x => /apply/.test(x.q.source_kind)), '켜면 추천에 응용도 섞임');
  ok(txt('uForm').join() === '단원 종합 A형,단원 종합 B형', '켜도 동형 목록은 교과서판 종합만(unit_apply 는 동형 아님)');
  partB();
}, 300);

/* ── ② check_sets ───────────────────────────────────────── */
function partB() {
  const SRC = path.join(R, 'kedu/worksheet/data');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kws-apply-'));
  const U = 'g6_2_math_u1';
  const names = fs.readdirSync(SRC).filter(f => f.indexOf(U + '_') === 0).map(f => f.slice(0, -5));
  const lm0 = JSON.parse(fs.readFileSync(path.join(SRC, '_lesson_map.json'), 'utf8'));
  const run = (label, mut, wantFail, needle) => {
    fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
    fs.copyFileSync(path.join(SRC, '_concepts.json'), path.join(tmp, '_concepts.json'));
    const sets = {}; names.forEach(nm => {
      const d = JSON.parse(fs.readFileSync(path.join(SRC, nm + '.json'), 'utf8'));
      const tb = JSON.parse(JSON.stringify(d)); tb.set = 'tb_' + nm; sets['tb_' + nm] = tb;
      d.kind = d.kind === 'unit_review' ? 'unit_apply' : 'lesson_apply'; sets[nm] = d;
    });
    const lessons = {};
    Object.keys(lm0.lessons).filter(k => k.indexOf(U + '_') === 0).forEach(k => {
      const L = JSON.parse(JSON.stringify(lm0.lessons[k]));
      L.apply = [L.basic, L.challenge, ...(L.review || [])].filter(Boolean);
      if (L.basic) L.basic = 'tb_' + L.basic; if (L.challenge) L.challenge = 'tb_' + L.challenge;
      if (L.review) L.review = L.review.map(s => 'tb_' + s);
      lessons[k] = L;
    });
    const lm = { version: 1, lessons };
    if (mut) mut(sets, lm);
    Object.keys(sets).forEach(nm => fs.writeFileSync(path.join(tmp, nm + '.json'), JSON.stringify(sets[nm])));
    fs.writeFileSync(path.join(tmp, '_lesson_map.json'), JSON.stringify(lm));
    let out = '', code = 0;
    try { out = cp.execFileSync('node', [path.join(R, 'kedu/worksheet/tools/check_sets.js')], { env: Object.assign({}, process.env, { KWS_DATA: tmp, FUZZ: '1' }), encoding: 'utf8' }); }
    catch (e) { code = e.status; out = (e.stdout || '') + (e.stderr || ''); }
    if (wantFail) ok(code !== 0 && (!needle || out.indexOf(needle) >= 0), `${label} → 실패로 잡힘 ` + out.split('\n').slice(0, 4).join(' | '));
    else ok(code === 0, `${label} → 통과 ` + out.split('\n').slice(0, 6).join(' | '));
  };
  run('정상(교과서판 + 응용)', null, false);
  run('교과서판 없이 응용', (S) => { Object.keys(S).filter(k => /^tb_/.test(k)).forEach(k => delete S[k]); }, true, '교과서판');
  run('tb_ 세트가 응용 갈래', (S) => { const k = Object.keys(S).find(k => /^tb_.*_basic$/.test(k)); S[k].kind = 'lesson_apply'; }, true, '교과서판(tb_) 세트가 응용 갈래');
  run('모르는 갈래', (S) => { const k = Object.keys(S).find(k => /^tb_.*_basic$/.test(k)); S[k].kind = 'lesson_textbook'; }, true, '모르는 세트 갈래');
  run('종합에 lesson_apply', (S) => { const k = Object.keys(S).find(k => /^g.*_review_a$/.test(k)); S[k].kind = 'lesson_apply'; }, true, '이름 꼴');
  run('연결표 basic 이 응용을 가리킴', (S, M) => { const k = Object.keys(M.lessons)[0]; M.lessons[k].basic = M.lessons[k].apply[0]; }, true, '응용 세트');
  run('apply 가 교과서판을 가리킴', (S, M) => { const k = Object.keys(M.lessons)[0]; M.lessons[k].apply = [M.lessons[k].challenge]; }, true, '응용 갈래(lesson_apply·unit_apply)가 아니다');
  run('apply 가 빈 배열', (S, M) => { const k = Object.keys(M.lessons)[0]; M.lessons[k].apply = []; }, true, 'apply 는 옛 세트 이름 배열');
  run('apply 가 없는 세트', (S, M) => { const k = Object.keys(M.lessons)[0]; M.lessons[k].apply = ['g6_2_math_u1_L99_basic']; }, true, 'apply 가 가리키는 세트');
  // tb_flip.py — 교과서판을 올린 뒤 도구 한 번으로 옛 세트·연결표가 응용으로 바뀌고 check_sets 를 통과
  fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp);
  fs.copyFileSync(path.join(SRC, '_concepts.json'), path.join(tmp, '_concepts.json'));
  names.forEach(nm => { const d = JSON.parse(fs.readFileSync(path.join(SRC, nm + '.json'), 'utf8')); fs.writeFileSync(path.join(tmp, nm + '.json'), JSON.stringify(d)); d.set = 'tb_' + nm; fs.writeFileSync(path.join(tmp, 'tb_' + nm + '.json'), JSON.stringify(d)); });
  const lessons = {}; Object.keys(lm0.lessons).filter(k => k.indexOf(U + '_') === 0).forEach(k => { lessons[k] = lm0.lessons[k]; });
  fs.writeFileSync(path.join(tmp, '_lesson_map.json'), JSON.stringify({ version: 1, lessons }));
  const env = Object.assign({}, process.env, { KWS_DATA: tmp, FUZZ: '1' });
  const pv = cp.execFileSync('python3', [path.join(R, 'kedu/worksheet/tools/tb_flip.py'), U], { env, encoding: 'utf8' });
  ok(/미리 보기/.test(pv) && JSON.parse(fs.readFileSync(path.join(tmp, names[0] + '.json'), 'utf8')).kind.indexOf('apply') < 0, 'tb_flip 미리 보기는 안 씀');
  const wr = cp.execFileSync('python3', [path.join(R, 'kedu/worksheet/tools/tb_flip.py'), U, '--write'], { env, encoding: 'utf8' });
  ok(new RegExp(`응용 전환 ${names.length}세트`).test(wr) && /UPDATE question_bank SET source_kind='unit_apply'/.test(wr), 'tb_flip 전환 ' + wr.split('\n')[0]);
  const m2 = JSON.parse(fs.readFileSync(path.join(tmp, '_lesson_map.json'), 'utf8')).lessons;
  ok(Object.values(m2).every(L => (!L.basic || /^tb_/.test(L.basic)) && (L.apply || []).length), 'tb_flip 연결표 = 교과서판 + apply');
  let c2 = 0; try { cp.execFileSync('node', [path.join(R, 'kedu/worksheet/tools/check_sets.js')], { env, encoding: 'utf8' }); } catch (e) { c2 = e.status; console.log((e.stdout || '').slice(0, 400)); }
  ok(c2 === 0, 'tb_flip 뒤 check_sets 통과');
  const again = cp.execFileSync('python3', [path.join(R, 'kedu/worksheet/tools/tb_flip.py'), U, '--write'], { env, encoding: 'utf8' });
  ok(/응용 전환 0세트/.test(again), 'tb_flip 두 번 돌려도 같음(멱등)');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`kedu_worksheet_apply: ${P} PASS / ${F} FAIL`); process.exit(F ? 1 : 0);
}
