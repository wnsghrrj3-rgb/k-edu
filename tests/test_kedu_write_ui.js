/* 케이글쓰기 화면 왕복 — node tests/test_kedu_write_ui.js
   jsdom 으로 세 화면을 돈다.
   ① index.html(연습): 쓰기 → 선생님 표시(종이·메모·도장) → 표시 누르기 → 「이렇게 바꾸기」 → 다시 쓰기
   ② task.html(학생 과제, db 가짜): 논제 받기 → 쓰기 → 보내기(자동 점검 화면 없음) → 기다림 → 돌아온 글(빨강+파랑+한마디+수준)
   ③ teach.html(교사, db 가짜): 과제 열기 → 첨삭(자동 표시 지우기→fp_log, 낱말 표시, 문장 메모, 루브릭) → 돌려주기
   평가 낱말 0 검사 포함. */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const data = n => read('kedu/write/data/' + n + '.json');
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : (fail++, console.log('  ✗', m)); };
const strip = html => html.replace(/<script src="[^"]*"[^>]*><\/script>/g, '');
const tick = (ms = 60) => new Promise(r => setTimeout(r, ms));

function boot(file, url, dbFake){
  const dom = new JSDOM(strip(read(file)), { url, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.fetch = u => Promise.resolve({ json: () => Promise.resolve(JSON.parse(data(u.split('/').pop().replace('.json', '')))) });
  w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {}; w.alert = m => { w.__alert = m; }; w.confirm = () => true;
  if (dbFake) w.getKeduDb = () => dbFake;
  w.eval(read('kedu/write/engine.js')); w.eval(read('kedu/write/paper.js'));
  [...w.document.querySelectorAll('script:not([src])')].forEach(s => w.eval(s.textContent));
  return w;
}

(async () => {
  /* ---------- ① 연습 ---------- */
  {
    const w = boot('kedu/write/index.html', 'https://keduclass.com/kedu/write/?type=argue&grade=4&topic=' + encodeURIComponent('숙제가 없어야 할까요?'));
    await tick(); const d = w.document, $ = s => d.querySelector(s);
    ok($('#text'), '① 쓰기 화면');
    ok(!$('.palette'), '① 색칠 화면 없음');
    const ta = $('#text');
    ta.value = '나는 근데 숙제가 없어야 한다고 생각해요. 왜냐하면 숙제가 엄청 많으면 놀 시간이 없기때문이에요.\n예를들어 어제 숙제를 하느라 축구를 못 했어요\n그래서 나는 숙제가 없으면 좋겠어요.';
    ta.dispatchEvent(new w.Event('input')); $('#go').click();
    ok($('.kwp'), '① 종이 화면'); ok($('.frame'), '① 틀 그림 같이');
    ok(d.querySelectorAll('.para .role').length === 3, '① 문단 역할 3'); ok(d.querySelectorAll('.stamp').length >= 3, '① 문장 도장');
    const tms = [...d.querySelectorAll('.tm')]; ok(tms.length >= 4, '① 표시 ≥4 (' + tms.length + ')');
    const sp = tms.find(t => t.textContent.startsWith('근데')); ok(sp, '① 「근데」 표시'); sp.click();
    ok($('.pop') && /그런데/.test($('.pop').textContent), '① 누르면 설명'); $('#apply').click();
    ok(/그런데/.test($('.kwp').textContent) && !/근데/.test($('.kwp').textContent), '① 바꾸기 반영');
    const app = d.querySelector('.tm.append'); ok(app, '① 마침표 표시'); app.click(); $('#apply').click();
    ok(/못 했어요\./.test($('.kwp').textContent), '① 마침표 붙음');
    $('#fix').click(); ok($('#text') && /그런데/.test($('#text').value), '① 글에 반영');
    // 이유 없는 글 → 메모가 종이 사이에
    $('#text').value = '숙제는 많다. 숙제는 힘들다.\n놀 시간이 없다.'; $('#text').dispatchEvent(new w.Event('input')); $('#go').click();
    const memos = d.querySelectorAll('.kwp .memo'); ok(memos.length >= 2, '① 메모 ' + memos.length);
    ok($('.kwp').firstElementChild.classList.contains('memo') && /생각/.test($('.kwp').firstElementChild.textContent), '① 생각 메모가 첫 문단 앞');
  }

  /* ---------- 가짜 db ---------- */
  const T = '2026-09-08T10:00:00Z';
  const RUN = { run: 'run1', class_code_id: 'c1', closed: false, student_id: 'sp1', student_name: '민준', is_teacher: false, type: 'argue', band: 'mid', title: '숙제 글쓰기', topic: '숙제가 없어야 할까요?', keywords: ['숙제'], prompt_id: null, passage: '숙제에 대해 생각해 봐요.', guide: '이유를 두 가지 써요', rewrite_max: 1, due_at: null, subs: [] };
  const log = [];
  const rows = { write_reviews: [], write_fp_log: [], write_runs: [{ id: 'run1', class_code_id: 'c1', teacher_id: 't1', type: 'argue', band: 'mid', title: '숙제 글쓰기', topic: '숙제가 없어야 할까요?', keywords: ['숙제'], rewrite_max: 1, opened_at: T, closed_at: null, due_at: null, write_submissions: [] }], write_submissions: [], student_profiles: [{ id: 'sp1', nickname: '민준', seat_no: 1, class_code_id: 'c1', is_active: true }, { id: 'sp2', nickname: '서윤', seat_no: 2, class_code_id: 'c1', is_active: true }] };
  function table(name){
    const q = { _f: [] };
    const run = () => { let list = rows[name] || []; q._f.forEach(([k, v]) => { list = list.filter(r => r[k] === v); }); return list; };
    q.select = () => q; q.eq = (k, v) => { q._f.push([k, v]); return q; }; q.order = () => q; q.maybeSingle = () => Promise.resolve({ data: run()[0] || null }); q.single = () => Promise.resolve({ data: run()[0] || null, error: run()[0] ? null : { m: 'none' } });
    q.then = (res) => Promise.resolve({ data: run(), error: null }).then(res);
    q.insert = (row) => { const r = Object.assign({ id: name + (rows[name].length + 1) }, row); rows[name].push(r); log.push([name, 'insert', r]); return { select: () => ({ single: () => Promise.resolve({ data: r, error: null }) }), then: (f, g) => Promise.resolve({ data: r, error: null }).then(f, g) }; };
    q.update = (patch) => ({ eq: (k, v) => { rows[name].filter(r => r[k] === v).forEach(r => Object.assign(r, patch)); return Promise.resolve({ error: null }); } });
    q.upsert = (row, opt) => { const key = (opt && opt.onConflict) || 'id'; let r = rows[name].find(x => x[key] === row[key]); if (r) Object.assign(r, row); else { r = Object.assign({ id: name + (rows[name].length + 1) }, row); rows[name].push(r); } log.push([name, 'upsert', r]); return { select: () => ({ single: () => Promise.resolve({ data: r, error: null }) }) }; };
    return q;
  }
  const db = { auth: { getSession: () => Promise.resolve({ data: { session: { user: { id: 'u1' } } } }) }, from: table,
    rpc: (n, p) => { log.push(['rpc', n, p]);
      if (n === 'get_write_run') return Promise.resolve({ data: JSON.parse(JSON.stringify(RUN)), error: null });
      if (n === 'write_submit'){ const a = RUN.subs.length + 1; const sub = { id: 'sub' + a, attempt: a, text: p.p_text, submitted_at: T, review: null }; RUN.subs.push(sub); rows.write_submissions.push({ id: sub.id, run_id: 'run1', student_id: 'sp1', attempt: a, text: p.p_text, auto: p.p_auto, submitted_at: T, write_reviews: [] }); return Promise.resolve({ data: { status: 'ok', attempt: a, id: sub.id }, error: null }); }
      if (n === 'open_for_class') return Promise.resolve({ data: 'op1', error: null });
      if (n === 'list_write_runs_mine') return Promise.resolve({ data: [], error: null });
      return Promise.resolve({ data: null, error: null }); } };

  /* ---------- ② 학생 과제: 보내기 ---------- */
  {
    rows.teachers = [];
    const w = boot('kedu/write/task.html', 'https://keduclass.com/kedu/write/task.html?run=run1', db);
    await tick(); const d = w.document, $ = s => d.querySelector(s);
    ok($('#text'), '② 쓰기 화면'); ok(/숙제가 없어야/.test($('.topic').textContent), '② 논제 받음'); ok($('.passage') && $('.guide'), '② 읽을 글·안내');
    ok(!$('#go') && !$('.palette') && !$('.kwp'), '② 자동 점검·색칠 없음');
    const ta = $('#text'); ta.value = '나는 근데 숙제가 없어야 한다고 생각해요. 왜냐하면 숙제가 엄청 많으면 놀 시간이 없기때문이에요.\n예를들어 어제 숙제를 하느라 축구를 못 했어요\n그래서 나는 숙제가 없으면 좋겠어요.'; ta.dispatchEvent(new w.Event('input'));
    $('#send').click(); await tick();
    const sent = log.find(x => x[0] === 'rpc' && x[1] === 'write_submit'); ok(sent, '② write_submit 호출');
    ok(sent && sent[2].p_auto && sent[2].p_auto.marks && sent[2].p_auto.marks.length >= 4, '② 자동 첨삭 스냅샷 같이 보냄 (' + (sent && sent[2].p_auto.marks.length) + ')');
    ok($('.stamp') && /보냈어요/.test($('.stamp').textContent), '② 보냈어요 화면'); ok(!$('.kwp'), '② 보낸 뒤에도 자동 표시 안 보임'); ok($('#redo'), '② 아직 안 봤으면 고쳐 보내기 가능');
  }

  /* ---------- ③ 교사: 열기·첨삭·돌려주기 ---------- */
  {
    rows.teachers = [{ id: 't1', name: '준호', user_id: 'u1' }]; rows.class_codes = [{ id: 'c1', code: 'ABC123', is_active: true, teacher_id: 't1' }];
    rows.write_runs[0].write_submissions = rows.write_submissions.map(s => ({ id: s.id, student_id: s.student_id, attempt: s.attempt, submitted_at: s.submitted_at, write_reviews: [] }));
    const w = boot('kedu/write/teach.html', 'https://keduclass.com/kedu/write/teach.html', db);
    await tick(100); const d = w.document, $ = s => d.querySelector(s);
    ok($('#oTopic'), '③ 과제 열기 폼'); ok(d.querySelectorAll('#oPrompt button').length > 1, '③ 글감 목록');
    ok($('#oRewrite').value === '1', '③ 다시 쓰기 기본 1회');
    $('#oPrompt button[data-p]:not([data-p=""])').click(); await tick(); ok($('#oTopic').value.length > 3 && $('#oPassage').value.length > 10, '③ 글감 고르면 논제·지문 채움');
    $('#oGo').click(); await tick(100);
    const ins = log.find(x => x[0] === 'write_runs' && x[1] === 'insert'); ok(ins && ins[2].rewrite_max === 1 && ins[2].band === 'mid', '③ write_runs insert');
    const op = log.find(x => x[0] === 'rpc' && x[1] === 'open_for_class'); ok(op && /^write:/.test(op[2].p_content_key) && /task\.html\?run=/.test(op[2].p_url), '③ 케이박스 카드 write:<run>');
    ok($('[data-rev]'), '③ 연 과제 목록');
    $('[data-rev="run1"]').click(); await tick(100);
    ok($('.students') && d.querySelectorAll('.students button').length === 2, '③ 학생 명단 2'); ok($('.students button.on') && /민준/.test($('.students button.on').textContent), '③ 볼 것 있는 학생 먼저');
    ok($('.kwp') && d.querySelectorAll('.kwp .tm').length >= 4, '③ 자동 표시 깔림'); ok(d.querySelectorAll('.kwp .memo').length >= 1, '③ ✎ 메모');
    // 자동 표시 지우기 → fp_log
    const spoken = [...d.querySelectorAll('.tm[data-a]')].find(t => t.textContent.startsWith('근데')); spoken.click(); await tick();
    ok($('#pRemove'), '③ 지우기 버튼'); $('#pRemove').click(); await tick();
    ok(rows.write_fp_log.length === 1 && rows.write_fp_log[0].kind === 'spoken' && rows.write_fp_log[0].original === '근데', '③ 오탐 장부에 쌓임');
    ok([...d.querySelectorAll('.tm[data-a]')].find(t => t.textContent.startsWith('근데')).classList.contains('gone'), '③ 지운 표시는 흐려짐');
    // 문장 메모 + 낱말 표시
    d.querySelector('.sx[data-i="1"]').click(); await tick(); ok($('#bMemo'), '③ 문장 팝');
    $('#bMemo').value = '이유가 좋아요. 예를 하나 더 들면 더 힘이 세져요.'; $('#bMemoAdd').click(); await tick();
    ok(d.querySelector('.memo.blue') && /힘이 세져요/.test(d.querySelector('.memo.blue').textContent), '③ 파란 메모');
    d.querySelector('.sx[data-i="3"]').click(); await tick(); $('#bOrig').value = '좋겠어요'; $('#bFix').value = '생각해요'; $('#bWhy').value = '마무리에는 생각을 다시 써요'; $('#bMark').click(); await tick();
    ok(d.querySelector('.tm.blue') && /좋겠어요/.test(d.querySelector('.tm.blue').textContent) && /생각해요/.test(d.querySelector('.tm.blue .fx').textContent), '③ 파란 낱말 표시 + 바꿔 볼 말');
    $('#rvComment').value = '생각과 이유가 또렷해요.'; $('#rvComment').dispatchEvent(new w.Event('input'));
    d.querySelector('input[name="lv0"][value="0"]').click(); d.querySelector('input[name="lv2"][value="1"]').click();
    $('#rvAsk').click(); $('#rvReturn').click(); await tick(100);
    const up = log.filter(x => x[0] === 'write_reviews')[0]; ok(up && up[2].returned_at && up[2].comment === '생각과 이유가 또렷해요.' && up[2].teacher_marks.length === 2 && up[2].removed.length === 1 && up[2].levels['0'] === 0 && up[2].levels['2'] === 1 && up[2].ask_rewrite === true, '③ 돌려주기 upsert 내용');
  }

  /* ---------- ② 학생: 돌아온 글 + 다시 쓰기 ---------- */
  {
    const rv = rows.write_reviews[0];
    RUN.subs[0].review = { teacher_marks: rv.teacher_marks, removed: rv.removed, comment: rv.comment, levels: rv.levels, ask_rewrite: true, returned_at: T };
    const w = boot('kedu/write/task.html', 'https://keduclass.com/kedu/write/task.html?run=run1', db);
    await tick(); const d = w.document, $ = s => d.querySelector(s);
    ok(/돌아온 글/.test($('h1').textContent), '②′ 돌아온 글'); ok($('.kwp'), '②′ 종이');
    ok(![...d.querySelectorAll('.tm.hard')].some(t => t.textContent.startsWith('근데')), '②′ 지운 자동 표시는 하드로 안 보임');
    ok(d.querySelector('.memo.blue') && d.querySelector('.tm.blue'), '②′ 파란 메모·표시');
    ok(/생각과 이유가 또렷해요/.test($('.comment').textContent), '②′ 선생님 한마디');
    ok(d.querySelectorAll('.lv').length === 2 && /잘함/.test(d.querySelectorAll('.lv')[0].textContent), '②′ 수준 라벨(점수 0)');
    ok($('#rewrite'), '②′ 고쳐서 다시 보내기'); d.querySelector('.tm.blue').click(); await tick(); ok($('.pop') && /마무리에는/.test($('.pop').textContent), '②′ 파란 표시 누르면 왜');
    $('#rewrite').click(); await tick(); ok($('#text') && /숙제/.test($('#text').value), '②′ 다시 쓰기 화면에 글 미리 채움');
  }

  /* ---------- 평가 낱말 0 ---------- */
  const bad = /틀렸|부족|미흡|못했|잘못|점수는|등급|실패|낮/;
  const walk = (o, p) => { if (typeof o === 'string') ok(!bad.test(o), '평가 낱말: ' + p + ' ' + o); else if (o && typeof o === 'object') Object.keys(o).forEach(k => k !== '_doc' && walk(o[k], p + '.' + k)); };
  walk(JSON.parse(data('corrections')), 'corrections'); walk(JSON.parse(data('feedback')), 'feedback'); walk(JSON.parse(data('rubric')), 'rubric');
  console.log(`test_kedu_write_ui: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
