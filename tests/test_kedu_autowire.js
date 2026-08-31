#!/usr/bin/env node
/**
 * 엔진 자동 배선 (kedu_tracker.js v2.1) — 케이학습리포트 재료 검증
 *  ① 정적: 알려진 가족(KA getQState / 사회 state.q) 구조를 가진 차시는 recordAnswer 를 직접 부르지 않는다 (중복 기록 방지)
 *  ② 정적: 메타(kedu-lesson-id) 차시 전수 배선 커버리지 — 직접 배선 + 자동 배선 가족 + 예외 목록
 *  ③ jsdom: 실제 KA 차시를 열어 오답→정답 클릭 → scores 2행(false,true)·wrong_answers upsert/resolve · saveProgress(true) → _lesson_summary_ 1행(총점 = data-q-points 합)
 *  ④ jsdom: 실제 사회 차시 → state.q[i] 전이로 기록, 끝 기록은 페이지 자체 호출 1회만
 *  ⑤ jsdom: <meta kedu-autowire=off> 이면 손대지 않음
 * 실행: NODE_PATH=/home/claude/.jsdom/node_modules node tests/test_kedu_autowire.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── 정적 전수 ─────────────────────────────────────────────
const lessons = [];
function walk(d){ fs.readdirSync(d, { withFileTypes:true }).forEach(e => { const p = path.join(d, e.name);
  if (e.isDirectory()) { if (!/node_modules|archive/.test(e.name)) walk(p); }
  else if (/\.html?$/.test(e.name)) { const s = fs.readFileSync(p, 'utf8'); if (/kedu-lesson-id"\s+content=/.test(s)) lessons.push({ f: path.relative(R, p), s }); } }); }
['grade1','grade2','grade3','grade4','grade5','grade6'].map(g => path.join(R, g)).filter(fs.existsSync).forEach(walk);
const isKA = s => /function getQState\(qid\)/.test(s) && /function saveProgress\(/.test(s) && /data-q-points/.test(s);
const isSocial = s => /q:\s*Q\.map\(\(\)=>\(\{done:false/.test(s) && /qs\.wrongCount\+\+/.test(s);
const direct = s => /kedu\.recordAnswer\(/.test(s);
// pick 가족 — [data-answer] 묶음 안에 [data-pick] 선택지가 실제로 들어 있는 차시만
// (속성 두 개가 흩어져 있기만 한 페이지는 제외되어야 하므로 파서로 확인한다)
const pickGroups = s => {
  if (!/data-answer="/.test(s) || !/data-pick="/.test(s)) return 0;
  const doc = new JSDOM(s).window.document;
  return [...doc.querySelectorAll('[data-answer]')].filter(g => g.querySelector('[data-pick]')).length;
};
const isPick = s => pickGroups(s) > 0;
// 예외 = 리포트 대상 아님으로 확정한 차시
//   게임 10 · 심화/응용/올림피아드 6 : 정오 판정이 없거나 도달 판정에 넣지 않기로 함
//   u4_06(문장 빈칸 끌어놓기) · u5_04(짝맞추기) : 엔진이 제각각, 배선 보류
//   u1_l01(단원 도입) · u1_l12(마무리) : 채점 요소 자체가 없음
const EXCEPT = /(_game_\d+|_adv_\d+_|g1_math_u4_06_|g1_math_u1_l01|g1_math_u1_l12|g1_math_u5_04_)/;
const only = lessons.filter(l => /^grade[1-6]\//.test(l.f));
let nDirect = 0, nKA = 0, nSoc = 0, nPick = 0, nExc = 0, nMiss = [], overlap = [];
only.forEach(l => {
  const d = direct(l.s), k = isKA(l.s), so = isSocial(l.s), pk = isPick(l.s);
  if (d && (k || so || pk)) overlap.push(l.f);
  if (k && pk) overlap.push(l.f);
  if (d) nDirect++; else if (k) nKA++; else if (so) nSoc++; else if (pk) nPick++;
  else if (EXCEPT.test(l.f)) nExc++; else nMiss.push(l.f);
});
ok(overlap.length === 0, '중복 기록 위험(직접 배선 + 자동 배선 구조 동시 보유) 0 — ' + overlap.slice(0,3).join(','));
ok(nMiss.length === 0, '배선 누락(직접·자동·예외 어디에도 없음) 0 — ' + nMiss.slice(0,5).join(','));
ok(nKA >= 460 && nSoc >= 40 && nPick === 6, `자동 배선 가족: KA ${nKA} · 사회 ${nSoc} · pick ${nPick}`);
ok(nExc === 20, `예외 20(게임 10·심화 6·보류 4) — 실제 ${nExc}`);
console.log(`  메타 차시 ${only.length} = 직접 ${nDirect} + 자동(KA ${nKA} + 사회 ${nSoc} + pick ${nPick}) + 예외 ${nExc} + 누락 ${nMiss.length}`);

// ── jsdom 공통 ─────────────────────────────────────────────
function openLesson(file, opts){
  opts = opts || {};
  const inserts = [], upserts = [], updates = [];
  let html = rd(file).replace(/<script src="https:\/\/cdn\.jsdelivr\.net[^>]*><\/script>/g, '')
    .replace(/<script src="[^"]*kedu_config\.js"><\/script>/, '<script>var KEDU_AUTH_GATE=false;</script>')
    .replace(/<script src="[^"]*kedu_tracker\.js"><\/script>/, '<script>' + rd('kedu_tracker.js').replace(/<\/script>/g, '<\\/script>') + '</script>')
    .replace(/<script src="[^"]*kedu_(gate|boxbar|collect|kbox_adapter|lesson_bridge|back|resume|fit|accordion|tier|ga)\.js"><\/script>/g, '');
  if (opts.autowireOff) html = html.replace('<head>', '<head><meta name="kedu-autowire" content="off">');
  const vc = new VirtualConsole(); const errors = [];
  vc.on('jsdomError', e => { if (!/not implemented|Could not load/i.test(String(e.message||e))) errors.push(String(e.message||e)); });
  const dom = new JSDOM(html, { url: 'https://keduclass.com/' + file, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w){
      w.supabase = {};
      w.getKeduDb = () => ({
        auth: { getSession: async () => ({ data: { session: { user: { id: 'u-student' } } } }) },
        from(t){ let single = false, rows = t === 'student_profiles' ? [{ id: 'S1', class_code_id: 'CC', grade: 3 }] : [];
          const b = { select(){ return b; }, eq(){ return b; }, is(){ return b; }, maybeSingle(){ single = true; return b; },
            insert(r){ inserts.push({ t, r }); return b; }, update(r){ updates.push({ t, r }); return b; }, upsert(r){ upserts.push({ t, r }); return b; },
            then(res){ return Promise.resolve({ data: single ? (rows[0] || null) : rows, error: null }).then(res); }, catch(){ return b; } };
          return b; }
      });
      w.speechSynthesis = { cancel(){}, speak(){}, getVoices: () => [] }; w.SpeechSynthesisUtterance = function(){};
      w.HTMLMediaElement.prototype.play = () => Promise.resolve(); w.HTMLMediaElement.prototype.pause = () => {};
      w.AudioContext = function(){ return { createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0, setValueAtTime(){} } }; }, createGain(){ return { connect(){}, gain:{ value:0, setValueAtTime(){}, exponentialRampToValueAtTime(){} } }; }, destination:{}, currentTime:0 }; };
    } });
  return { dom, win: dom.window, doc: dom.window.document, inserts, upserts, updates, errors };
}

(async () => {
  // ── ③ KA 차시 ─────────────────────────────────────────
  {
    const file = only.find(l => isKA(l.s) && !direct(l.s) && /g3_math/.test(l.f) && /mcq-opt/.test(l.s)).f;
    const { win, doc, inserts, upserts, updates, errors } = openLesson(file);
    await sleep(80);
    if(!win.kedu){ console.log('  tracker 미실행 — errors:', errors.slice(0,3)); }
    ok(win.kedu && win.kedu.autowired === 'ka', 'KA: autowired=ka (' + file.split('/').pop() + ')');
    ok(win.kedu.isTracking(), 'KA: 학생 프로필 로드 → 추적 활성');
    const opts = doc.querySelector('.mcq-opt[data-correct="1"]').closest('[id$="-opts"]'); const qid = opts.id.replace(/-opts$/, '');
    const wrong = [...opts.querySelectorAll('.mcq-opt')].find(o => o.dataset.correct !== '1');
    const right = [...opts.querySelectorAll('.mcq-opt')].find(o => o.dataset.correct === '1');
    wrong.click(); await sleep(20);
    right.click(); await sleep(20);
    const sc = inserts.filter(x => x.t === 'scores');
    ok(sc.length === 2 && sc[0].r.is_correct === false && sc[1].r.is_correct === true && sc[0].r.question_id === qid, 'KA: 오답→정답 클릭 = scores 2행 (' + qid + ')');
    ok(sc[0].r.lesson_id && sc[0].r.lesson_id === doc.querySelector('meta[name="kedu-lesson-id"]').content, 'KA: lesson_id = 메타');
    ok(inserts.some(x => x.t === 'wrong_answers') && updates.some(x => x.t === 'wrong_answers' && x.r.resolved_at), 'KA: 오답노트 기록 → 정답 시 해결');
    right.click(); await sleep(10);
    ok(inserts.filter(x => x.t === 'scores').length === 2, 'KA: 이미 푼 문항 재클릭은 기록 안 함(st.solved 유지)');
    ok(JSON.stringify(win.eval('qState')).includes('"solved":true'), 'KA: 접근자 프로퍼티도 JSON 저장에 포함(saveProgress 호환)');
    win.saveProgress(true); win.saveProgress(true); await sleep(20);
    const ends = inserts.filter(x => x.t === 'scores' && x.r.question_id === '_lesson_summary_');
    let total = 0; doc.querySelectorAll('[data-q-points]').forEach(el => total += parseInt(el.getAttribute('data-q-points'), 10) || 0);
    ok(ends.length === 1 && ends[0].r.max_score === total && ends[0].r.score === win.eval('score'), `KA: 끝 기록 1회 (score ${ends[0]&&ends[0].r.score}/${total})`);
    ok(errors.length === 0, 'KA: JS 오류 없음 ' + errors.slice(0,2).join(' | '));
  }

  // ── ④ 사회 차시 ───────────────────────────────────────
  {
    const file = only.find(l => isSocial(l.s) && !direct(l.s) && /function pick\(i,k\)/.test(l.s)).f;
    const { win, inserts, errors } = openLesson(file);
    await sleep(80);
    ok(win.kedu.autowired === 'social', '사회: autowired=social (' + file.split('/').pop() + ')');
    const st = win.eval('state'), Q = win.eval('Q');
    const i = 0, correct = Q[0].correct;
    const wrongK = typeof correct === 'number' ? (correct === 0 ? 1 : 0) : 'zz';
    try { win.pick(i, wrongK); } catch(e){}
    await sleep(10);
    try { win.pick(i, correct); } catch(e){}
    await sleep(20);
    const sc = inserts.filter(x => x.t === 'scores' && x.r.question_id !== '_lesson_summary_');
    ok(sc.length === 2 && sc[0].r.is_correct === false && sc[1].r.is_correct === true && sc[0].r.question_id === 'q1', '사회: pick 오답→정답 = scores 2행 (q1)');
    ok(st.q[0].done === true && st.q[0].wrongCount === 1, '사회: 페이지 상태는 그대로 (done·wrongCount)');
    ok(errors.length === 0, '사회: JS 오류 없음 ' + errors.slice(0,2).join(' | '));
  }

  // ── ④-b pick 가족(1학년 활동형) ────────────────────────
  {
    const file = only.find(l => isPick(l.s) && /u4_02/.test(l.f)).f;
    const { win, doc, inserts, errors } = openLesson(file);
    await sleep(80);
    ok(win.kedu && win.kedu.autowired === 'pick', 'pick: autowired=pick (' + file.split('/').pop() + ')');
    const g = [...doc.querySelectorAll('[data-answer]')].find(x => x.querySelector('[data-pick]') && /^\d+$/.test(x.dataset.ap || ''));
    const ans = g.dataset.answer;
    const wrong = [...g.querySelectorAll('[data-pick]')].find(b => b.dataset.pick !== ans);
    const right = [...g.querySelectorAll('[data-pick]')].find(b => b.dataset.pick === ans);
    wrong.click(); await sleep(20);
    right.click(); await sleep(20);
    right.click(); await sleep(10);
    const sc = inserts.filter(x => x.t === 'scores' && x.r.question_id !== '_lesson_summary_');
    ok(sc.length === 2 && sc[0].r.is_correct === false && sc[1].r.is_correct === true, 'pick: 오답→정답 = scores 2행, 재클릭은 기록 안 함');
    ok(sc[0].r.question_id === 'q' + g.dataset.ap, 'pick: question_id = 슬라이드 번호 (q' + g.dataset.ap + ')');
    ok(inserts.some(x => x.t === 'wrong_answers'), 'pick: 오답노트 기록');
    // 누계 점수 수신 → 마지막 슬라이드 도달 시 끝 기록 1회
    win.eval('addScore(7)');
    const T = win.eval('TOTAL');
    win.eval('cur = ' + (T - 2));
    win.goNext(); await sleep(20);
    win.goNext(); await sleep(20);
    const ends = inserts.filter(x => x.t === 'scores' && x.r.question_id === '_lesson_summary_');
    ok(ends.length === 1, 'pick: 끝 기록 1회 (중복 없음)');
    ok(ends[0] && ends[0].r.score === win.eval('score') && ends[0].r.max_score > 0, `pick: 끝 점수 ${ends[0] && ends[0].r.score}/${ends[0] && ends[0].r.max_score}`);
    ok(errors.length === 0, 'pick: JS 오류 없음 ' + errors.slice(0,2).join(' | '));
  }

  // ── ⑤ 끄기 메타 ───────────────────────────────────────
  {
    const file = only.find(l => isKA(l.s) && !direct(l.s) && /mcq-opt/.test(l.s)).f;
    const { win, inserts } = openLesson(file, { autowireOff: true });
    await sleep(60);
    ok(win.kedu.autowired === undefined, 'autowire off: 손대지 않음');
    const right = win.document.querySelector('.mcq-opt[data-correct="1"]');
    if (right) { right.click(); await sleep(10); }
    ok(inserts.filter(x => x.t === 'scores').length === 0, 'autowire off: 기록 없음');
  }

  console.log(`kedu_autowire: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
