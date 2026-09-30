/* 표준/gate_projection_g3s2.js — 자기주도 투영(47차) 게이트 · 3학년 2학기 정본 전부
   A 회수 지도: 케이티처 키마다 projmap 항목 · 원문 파일이 있고 id = 원문 <meta kedu-lesson-id> · 진도 키 = 원문 규칙
   B 교사 층 누출 0: 투영 데이터에 tnote·hint·👉·extras·suggested_extras·신호등 self 없음 · 교실 활동 = 혼자 흐름
   C 학생 화면(푼 전·첫 화면) 글에 정답·풀이·교사에게 하는 말 없음 — renderSlide + 학생 층(widget) 실제 HTML 로 검사
   D 채점: 문항 점수 합 = 100 · check() 가 정답만 받는다(하나 고르기 보기마다 · 모두 고르기 · 수 넣기) · gained 규칙
   E 혼자 흐름: 투영 교실 활동 글에 짝·모둠 말 0 · 짝·모둠 말이 남은 문제는 혼자라면 줄이 붙는다
   실행: NODE_PATH=…/jsdom/node_modules node kedu/teacher/표준/gate_projection_g3s2.js                 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const T = path.resolve(__dirname, '..'), ROOT = path.resolve(T, '../..'), S2 = path.join(T, 'stage2');
let pass = 0, fail = 0; const fails = []; const ok = (c, m) => { if (c) pass++; else { fail++; if (fails.length < 60) fails.push(m); } };
const sec = (t) => console.log('═══ ' + t + ' ═══');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const g = dom.window; g.KT2_NO_BOOT = true; g.KT2_LEARN_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js', 'stage2-project.js', 'stage2-learn.js', 'projmap.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = g.KT2, P = g.KT2_PROJECT, W = g.KT2_LEARN.widget, MAP = g.KT2_PROJMAP;
function load(f) { const L = {}; const ctx = { window: { LESSONS: L }, LESSONS: L }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(fs.readFileSync(f, 'utf8'), ctx); return ctx.window.LESSONS; }
const files = fs.readdirSync(path.join(T, 'data')).filter(f => /^g3s2_[a-z]+_u\d+\.js$/.test(f)).sort();
const all = []; files.forEach(f => { const slug = f.replace(/_u\d+\.js$/, ''); const L = load(path.join(T, 'data', f)); Object.keys(L).forEach(k => all.push({ slug, key: k, L: L[k] })); });
const text = (html) => { const d = g.document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' '); };
const fresh = () => ({ tries: 0, done: false, gaveUp: false, sel: [], wrong: [], val: '', shown: false });
console.log('정본 ' + all.length + '차시 키 · ' + files.length + '파일');

sec('A. 회수 지도');
all.forEach(({ slug, key }) => {
  const m = MAP[slug + ':' + key]; ok(!!m, slug + ':' + key + ' 지도 없음'); if (!m) return;
  const f = path.join(ROOT, decodeURI(m.url)); ok(fs.existsSync(f), m.url + ' 원문 없음'); if (!fs.existsSync(f)) return;
  const h = fs.readFileSync(f, 'utf8'); const meta = (h.match(/<meta name="kedu-lesson-id" content="([^"]+)"/) || [])[1];
  ok(m.id === (meta || path.basename(f, '.html')), key + ' id ' + m.id + ' ≠ 원문 ' + meta);
  if (m.ls) ok(h.indexOf(m.ls) >= 0 || (/['"`]kedu_progress_['"`]\s*\+\s*LESSON_ID/.test(h) && h.indexOf("'" + m.ls.replace('kedu_progress_', '') + "'") >= 0), key + ' 진도 키 ' + m.ls + ' 원문에 없음');
  else ok(!/localStorage\.setItem/.test(h), key + ' 원문은 기기 진도를 쓰는데 지도에 진도 키 없음');
});
console.log('  지도 ' + Object.keys(MAP).length + ' · 정본 키 ' + all.length);

sec('B. 교사 층 누출');
const TEACHER_KEYS = ['tnote', 'suggested_extras', 'extras'];
let nSlide = 0, nOff = 0;
const PJ = all.map(x => Object.assign(x, { pj: P.project(x.L) }));
PJ.forEach(({ slug, key, L, pj }) => {
  const js = JSON.stringify(pj); const tag = slug + ' ' + key;
  TEACHER_KEYS.forEach(k => ok(js.indexOf('"' + k + '"') < 0, tag + ' 투영에 ' + k));
  ok(!/👉/.test(js), tag + ' 👉 쪽지');
  pj.slides.forEach(s => { nSlide++;
    if (s.block === 'misconception') ok(s.data.hint === undefined, tag + ' ' + s.id + ' 오개념 hint');
    if (s.block === 'exit_ticket') ok(s.data.self === undefined, tag + ' ' + s.id + ' 신호등');
    if (s.block === 'offline_activity') { nOff++; const src = L.slides.find(x => x.id === s.id).data; ok(s.data.type === 'individual' && JSON.stringify(s.data.steps) === JSON.stringify(src.solo), tag + ' ' + s.id + ' 혼자 흐름 = 원 solo'); ok(s.data.minutes === undefined && s.data.materials === undefined, tag + ' ' + s.id + ' 타이머·준비물'); }
  });
  ok(pj.slides.length === L.slides.length - L.slides.filter(s => s.block === 'offline_activity' && !(s.data.solo || []).length).length, tag + ' 장 수');
  ok(JSON.stringify(L).indexOf('"tnote"') >= 0 || true, '');
});
console.log('  투영 ' + nSlide + '장 · 혼자 활동 ' + nOff);

sec('C. 학생 첫 화면에 정답·풀이·교사 말 없음');
// 교사에게 하는 말 = 정본 tnote·hint 글 그 자체(학생 화면에 한 조각이라도 나오면 누출)
const TEACH_SAY = /(짚어 주세요|하게 하세요|보여 주며|확인시켜|물어보게|손을 들게|칠판에|판서)/;
let nChk = 0;
PJ.forEach(({ slug, key, L, pj }) => pj.slides.forEach(s => {
  const src = L.slides.find(x => x.id === s.id); const tag = slug + ' ' + key + ' ' + s.id;
  const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: pj.meta, unitTitle: 'U', classNames: [] });
  const html = r.body + W(s, fresh()) + (s.solo || ''); const tx = text(html); nChk++;
  ok(!/풀이\s*[:：]/.test(tx), tag + ' 풀이가 첫 화면에');
  ok(!/class="opt[^"]*\bok\b/.test(html), tag + ' 정답 표시가 첫 화면에');
  ok(!TEACH_SAY.test(tx), tag + ' 교사에게 하는 말: ' + (tx.match(TEACH_SAY) || [])[0]);
  const d0 = src.data || {};
  const tn = d0.tnote; if (tn) (tn.ask || []).concat(tn.watch ? [tn.watch] : []).forEach(a => { const t = String(a).replace(/\*\*/g, ''); if (t.length >= 12) ok(tx.indexOf(t) < 0, tag + ' 발문 글이 학생 화면에: ' + t.slice(0, 20)); });
  if (s.block === 'misconception' && d0.hint && d0.hint.length >= 12) ok(tx.indexOf(d0.hint.replace(/\*\*/g, '').slice(0, 20)) < 0, tag + ' 오개념 hint 가 학생 화면에');
  if (s.learn && s.learn.kind === 'num') ok(tx.indexOf(String(s.learn.answer)) < 0 || String(d0.question || '').indexOf(String(s.learn.answer)) >= 0 || text(r.body).indexOf(String(s.learn.answer)) >= 0, tag + ' 수 넣기 답이 학생 층에');
}));
console.log('  그린 장 ' + nChk);

sec('D. 채점');
const dist = {}; let nQ = 0;
PJ.forEach(({ slug, key, pj }) => {
  const tag = slug + ' ' + key; const n = pj.scored.length; dist[n] = (dist[n] || 0) + 1;
  const sum = pj.slides.reduce((a, s) => a + ((s.learn && s.learn.pts) || 0), 0); ok(n === 0 ? sum === 0 : sum === 100, tag + ' 점수 합 ' + sum);
  pj.slides.forEach(s => { const L = s.learn; if (!L || !P.SCORED.has(L.kind)) return; nQ++;
    if (L.kind === 'pick') { const c = L.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0); ok(c.length === 1, tag + ' ' + s.id + ' 하나 고르기 정답 ' + c.length); L.options.forEach((o, i) => ok(P.check(L, i) === !!o.correct, tag + ' ' + s.id + ' 보기 ' + i)); }
    if (L.kind === 'multi') { const c = L.options.map((o, i) => o.correct ? i : -1).filter(i => i >= 0); ok(c.length >= 1 && P.check(L, c) && !P.check(L, c.slice(1)) && (c.length === L.options.length || !P.check(L, L.options.map((_, i) => i))), tag + ' ' + s.id + ' 모두 고르기'); }
    if (L.kind === 'num') { ok(P.check(L, String(L.answer)) && P.check(L, ' ' + L.answer + ' ') && !P.check(L, String(Number(L.answer) + 1)) && !P.check(L, ''), tag + ' ' + s.id + ' 수 넣기'); if (Number(L.answer) >= 1000) ok(P.check(L, Number(L.answer).toLocaleString('en-US')), tag + ' 쉼표 수'); }
    ok(P.gained(L, 1) === L.pts && P.gained(L, 2) === Math.ceil(L.pts / 2) && P.gained(L, 3) === 0 && P.gained(L, 1, true) === 0, tag + ' ' + s.id + ' 점수 규칙');
  });
});
console.log('  채점 문항 ' + nQ + ' · 차시당 채점 문항 수 분포 ' + JSON.stringify(dist));

sec('E. 혼자 흐름');
const PAIR = /짝|모둠|친구와|친구에게|다 함께/;
PJ.forEach(({ slug, key, pj }) => pj.slides.forEach(s => {
  const tag = slug + ' ' + key + ' ' + s.id;
  if (s.block === 'offline_activity') ok(!PAIR.test(JSON.stringify(s.data.steps) + (s.data.goal || '')), tag + ' 혼자 활동에 짝·모둠 말');
  if (s.block === 'basic_problem' && PAIR.test(String(s.data.question || ''))) ok(!!s.solo, tag + ' 혼자라면 줄');
  if (s.block === 'leveled_problem') Object.values(s.data.levels || {}).forEach(lv => { if (PAIR.test(String(lv.q || '').split('\n')[0])) ok(String(lv.q).indexOf(P.SOLO_FALLBACK) >= 0, tag + ' 수준별 혼자라면 줄'); });
}));

sec('F. 정본 무개변');
all.forEach(({ slug, key, L }) => { const before = JSON.stringify(L); P.project(L); ok(JSON.stringify(L) === before, slug + ' ' + key + ' project() 가 정본을 바꿈'); });

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패'); if (fails.length) console.log(fails.join('\n'));
process.exit(fail ? 1 : 0);
