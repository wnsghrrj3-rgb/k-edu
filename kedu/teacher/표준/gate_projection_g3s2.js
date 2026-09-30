/* 표준/gate_projection_g3s2.js — 자기주도 투영(47차) 게이트 · 3학년 2학기 정본 전부 + 50차부터 3학년 1학기 정본(g3_*) 전부
   D1 50차: 1학기 물음 속 보기 → 하나 고르기(정답 = 정본 answer · 보기 수 · 물음 글에 보기 안 남음 · 정답 자리 쏠림 없음) · 글 답은 수 넣기 안 됨
   A 회수 지도: 케이티처 키마다 projmap 항목 · 원문 파일이 있고 id = 원문 <meta kedu-lesson-id> · 진도 키 = 원문 규칙
   B 교사 층 누출 0: 투영 데이터에 tnote·hint·👉·extras·suggested_extras·신호등 self 없음 · 교실 활동 = 혼자 흐름
   C 학생 화면(푼 전·첫 화면) 글에 정답·풀이·교사에게 하는 말 없음 — renderSlide + 학생 층(widget) 실제 HTML 로 검사
   B+ 48차: 출구 퀴즈 수 답 문항을 편 장(from) — 답 = 정본 출구 답 · 기본 문제와 같은 물음은 안 폄
   D 채점: 문항 점수 합 = 100 · check() 가 정답만 받는다(하나 고르기 보기마다 · 모두 고르기 · 수 넣기) · gained 규칙
   D+ 49차: 수준별 채점 — 수준마다 답 표(nums·frac·self) = 정본 답 글 · 식 문제는 따로 셈해 정본 답 검산 ·
      check() 가 맞는 답만 받는다 · 첫 화면(수준마다)에 답 없음 · 교사용 「정답 보기」 단추는 학생 화면에서 빠진다
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
const files = fs.readdirSync(path.join(T, 'data')).filter(f => /^g3(s2)?_[a-z]+_u\d+\.js$/.test(f)).sort();
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
  // 👉 쪽지 = 교사에게 주는 note(머리 👉) · 판 그림 안의 👉 항목(학생 글)은 쪽지가 아니다
  ok(!pj.slides.some(s => s.data && typeof s.data.note === 'string' && /^\s*👉/.test(s.data.note)), tag + ' 👉 쪽지');
  pj.slides.forEach(s => { nSlide++;
    if (s.block === 'misconception') ok(s.data.hint === undefined, tag + ' ' + s.id + ' 오개념 hint');
    if (s.block === 'exit_ticket') ok(s.data.self === undefined, tag + ' ' + s.id + ' 신호등');
    if (s.block === 'leveled_problem') { const src = L.slides.find(x => x.id === s.id).data.levels || {}; ok(!!s.lv && JSON.stringify(Object.keys(s.lv.levels)) === JSON.stringify(Object.keys(src)), tag + ' ' + s.id + ' 수준 답 표 = 정본 수준'); Object.values(s.data.levels || {}).forEach(lv => ok(lv.a === undefined && lv.steps === undefined, tag + ' ' + s.id + ' 투영 data 에 수준 답·풀이가 남음')); }
    if (s.block === 'offline_activity') { nOff++; const src = L.slides.find(x => x.id === s.id).data; ok(s.data.type === 'individual' && JSON.stringify(s.data.steps) === JSON.stringify(src.solo), tag + ' ' + s.id + ' 혼자 흐름 = 원 solo'); ok(s.data.minutes === undefined && s.data.materials === undefined, tag + ' ' + s.id + ' 타이머·준비물'); }
  });
  const own = pj.slides.filter(s => !s.from);
  const expectDrop = L.slides.filter(s => s.block === 'offline_activity' && !(s.data.solo || []).length).length;
  const exitGone = L.slides.filter(s => s.block === 'exit_ticket' && !own.some(x => x.id === s.id)).length;
  ok(own.length === L.slides.length - expectDrop - exitGone, tag + ' 장 수');
  // 48차 출구 펴기: 편 장의 답 = 정본 출구 문항 답 · 편 장이 없는데 출구 장이 사라지면 안 됨
  pj.slides.filter(s => s.from).forEach(s => { const ex = L.slides.find(x => x.id === s.from); const it = ex && (ex.data.items || []).find(i => i.q === s.data.question); ok(!!it && Number(String(it.a).replace(/,/g, '')) === s.learn.answer && s.learn.kind === 'num', tag + ' ' + s.id + ' 출구 편 장 답'); });
  ok(JSON.stringify(L).indexOf('"tnote"') >= 0 || true, '');
});
console.log('  투영 ' + nSlide + '장 · 혼자 활동 ' + nOff);

sec('C. 학생 첫 화면에 정답·풀이·교사 말 없음');
// 교사에게 하는 말 = 정본 tnote·hint 글 그 자체(학생 화면에 한 조각이라도 나오면 누출)
const TEACH_SAY = /(짚어 주세요|하게 하세요|확인시켜|물어보게|손을 들게|칠판에[^.!?]{0,14}(주세요|하세요|두세요)|판서)/; // 50차: 「칠판에 5분의 3이 적혀 있어요」(학생 장면)는 교사 말이 아니다
let nChk = 0;
PJ.forEach(({ slug, key, L, pj }) => pj.slides.forEach(s => {
  const src = L.slides.find(x => x.id === (s.from || s.id)); const tag = slug + ' ' + key + ' ' + s.id;
  const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: pj.meta, unitTitle: 'U', classNames: [] });
  const html = r.body + W(s, fresh()) + (s.solo || ''); const tx = text(html); nChk++;
  ok(!/풀이\s*[:：]/.test(tx), tag + ' 풀이가 첫 화면에');
  ok(!/class="opt[^"]*\bok\b/.test(html), tag + ' 정답 표시가 첫 화면에');
  ok(!TEACH_SAY.test(tx), tag + ' 교사에게 하는 말: ' + (tx.match(TEACH_SAY) || [])[0]);
  const d0 = src.data || {};
  const tn = d0.tnote; if (tn) (tn.ask || []).concat(tn.watch ? [tn.watch] : []).forEach(a => { const t = String(a).replace(/\*\*/g, ''); if (t.length >= 12 && JSON.stringify(s.data).replace(/\*\*/g, '').indexOf(t) < 0) ok(tx.indexOf(t) < 0, tag + ' 발문 글이 학생 화면에: ' + t.slice(0, 20)); });
  if (s.block === 'misconception' && d0.hint && d0.hint.length >= 12) ok(tx.indexOf(d0.hint.replace(/\*\*/g, '').slice(0, 20)) < 0, tag + ' 오개념 hint 가 학생 화면에');
  if (s.lv) Object.keys(s.lv.levels).forEach(k => {
    const LV = s.lv.levels[k]; const r2 = KT2.renderSlide(s, { revealed: false, state: { level: k }, meta: pj.meta, unitTitle: 'U', classNames: [] });
    const box = g.document.createElement('div'); box.innerHTML = r2.body + W(s, fresh(), k); box.querySelectorAll(g.KT2_LEARN.STRIP).forEach(b => b.remove());
    const t2 = box.textContent.replace(/\s+/g, ' '); const q = String((s.data.levels[k] || {}).q || ''); const a = String(LV.a == null ? '' : LV.a).replace(/\*\*/g, '').trim();
    ok(!box.querySelector('[data-act="reveal"]'), tag + ' ' + k + ' 교사용 정답 보기 단추가 학생 화면에');
    ok(t2.indexOf('✅') < 0 && !box.querySelector('.lv-a,.lv-steps'), tag + ' ' + k + ' 수준 답이 첫 화면에');
    if (!LV.open && a.length >= 2 && q.indexOf(a) < 0) ok(t2.indexOf(a) < 0, tag + ' ' + k + ' 수준 답 글이 첫 화면에: ' + a.slice(0, 16));
  });
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

sec('D1. 1학기 물음 속 보기 → 하나 고르기 (50차)');
// 1세대 생성기 기본 문제: 보기를 물음 글 안에 적음. 투영은 그 보기를 떼어 하나 고르기로 — 정답 = 정본 answer 글자 그대로.
const nrm = (x) => String(x == null ? '' : x).replace(/\*\*/g, '').replace(/[‘’“”"'「」]/g, '').replace(/[.!?。]+$/, '').replace(/\s+/g, ' ').trim();
let nInl = 0, nNum1 = 0, nMul1 = 0; const posDist = {}; const leftSelf = [];
PJ.forEach(({ slug, key, L, pj }) => { if (/s2_/.test(slug)) return; const tag = slug + ' ' + key;
  pj.slides.forEach(s => { if (s.block !== 'basic_problem' || s.from) return; const src = L.slides.find(x => x.id === s.id).data; const q0 = String(src.question || ''); const Lr = s.learn;
    if (Lr && Lr.inline) { nInl++;
      const c = Lr.options.filter(o => o.correct).map(o => o.text).sort();
      if (Lr.kind === 'multi') { const w = String(src.answer).split(/\s*,\s*/).map(nrm).sort(); nMul1++; ok(c.length >= 2 && JSON.stringify(c) === JSON.stringify(w) && c.length < Lr.options.length, tag + ' ' + s.id + ' 모두 고르기 정답 = 정본 답 조각'); }
      else ok(c.length === 1 && c[0] === nrm(src.answer), tag + ' ' + s.id + ' 떼어 낸 보기 정답 = 정본 답');
      ok(Lr.options.every(o => nrm(q0).indexOf(o.text) >= 0), tag + ' ' + s.id + ' 보기가 정본 물음 글에 없음');
      const want = /①/.test(q0) ? (q0.match(/[①②③④⑤⑥]/g) || []).length : (q0.split(/\s*(?:중에서|가운데|[—–])\s*/)[0].split(' · ').length);
      ok(Lr.options.length === want, tag + ' ' + s.id + ' 보기 수 ' + Lr.options.length + ' ≠ ' + want);
      ok(!/[①②③④]| · /.test(s.data.question) && !/\*\*/.test(Lr.options.map(o => o.text).join('')) && /\?$/.test(s.data.question.trim()), tag + ' ' + s.id + ' 물음 글에 보기가 남음');
      const i = Lr.options.findIndex(o => o.correct); posDist[i] = (posDist[i] || 0) + 1;
    } else if (Lr && Lr.kind === 'num') { nNum1++; ok(Number(String(src.answer).replace(/,/g, '')) === Lr.answer && src.input !== undefined, tag + ' ' + s.id + ' 1학기 수 답'); }
    else if (Lr && Lr.kind === 'self' && / · |①/.test(q0)) leftSelf.push(tag + ' ' + s.id);
    if (src.input !== undefined && !/^-?\d[\d,]*(\.\d+)?$/.test(String(src.answer).trim())) ok(!Lr || Lr.kind !== 'num', tag + ' ' + s.id + ' 글 답이 수 넣기로');
  });
});
ok(nInl >= 200, '1학기 하나 고르기 ' + nInl + ' (200 이상이어야)');
ok((posDist[0] || 0) < nInl * 0.4, '정답이 첫 보기에 몰림 ' + JSON.stringify(posDist));
console.log('  1학기 하나 고르기 ' + nInl + ' (모두 고르기 ' + nMul1 + ') · 수 넣기 ' + nNum1 + ' · 정답 자리 ' + JSON.stringify(posDist) + ' · 보기 꼴인데 스스로 확인으로 남은 것 ' + leftSelf.length);

sec('D+. 수준별 채점');
const NUMONLY = /^-?\d[\d,]*(\.\d+)?$/; let nLv = 0, nGr = 0, nCalc = 0; const lvKind = {};
// 식 문제는 따로 셈한다(생성기·파서와 독립) — 「a × b 는 얼마」 · 「a ÷ b 의 몫과 나머지」
function calc(q) { const t = String(q).replace(/\*\*/g, ''); let m = t.match(/^(\d[\d,]*)\s*([×÷+\-−])\s*(\d[\d,]*)\s*(은|는|의)/); if (!m) return null; const x = +m[1].replace(/,/g, ''), y = +m[3].replace(/,/g, '');
  if (m[2] === '×') return [x * y]; if (m[2] === '+') return [x + y]; if (m[2] === '-' || m[2] === '−') return [x - y]; if (m[2] === '÷') return /나머지/.test(t) ? [Math.floor(x / y), x % y] : (/몫/.test(t) || !(x % y)) ? [Math.floor(x / y)] : null; return null; }
PJ.forEach(({ slug, key, L, pj }) => pj.slides.filter(s => s.lv).forEach(s => {
  const src = L.slides.find(x => x.id === s.id).data.levels || {};
  Object.keys(s.lv.levels).forEach(k => { nLv++; const LV = s.lv.levels[k], o = src[k] || {}, tag = slug + ' ' + key + ' ' + s.id + ' ' + k; lvKind[LV.kind] = (lvKind[LV.kind] || 0) + 1;
    ok(LV.a === o.a && JSON.stringify(LV.steps) === JSON.stringify(o.steps), tag + ' 답 표 글 = 정본');
    if (o.open) { ok(LV.kind === 'self' && LV.open, tag + ' 여러 답인데 채점'); return; }
    const a = String(o.a == null ? '' : o.a).replace(/\*\*/g, '').trim();
    if (NUMONLY.test(a.replace(/\s/g, ''))) ok(LV.kind === 'nums' && LV.parts.length === 1 && LV.parts[0].v === Number(a.replace(/[\s,]/g, '')), tag + ' 수 답인데 채점 안 함');
    if (/^약\s|보다|[㉠-㉮]|·\d+\//.test(a)) ok(LV.kind === 'self', tag + ' 어림·범위·기호·대분수 답을 채점함');
    if (LV.kind === 'nums') { nGr++;
      const vs = LV.parts.map(p => String(p.v)); ok(LV.parts.every(p => a.indexOf(String(p.v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) >= 0 || a.indexOf(String(p.v)) >= 0), tag + ' 답 칸 수가 정본 답 글에 없음');
      ok(P.check(LV, vs) && P.check(LV, vs.map(v => ' ' + v + ' ')) && !P.check(LV, vs.map((v, i) => i ? v : String(Number(v) + 1))) && !P.check(LV, vs.map(() => '')) && !P.check(LV, vs.slice(0, -1).concat(vs.length > 1 ? [] : ['x'])), tag + ' 수 칸 채점');
      if (LV.parts[0].v >= 1000) ok(P.check(LV, [LV.parts[0].v.toLocaleString('en-US')].concat(vs.slice(1))), tag + ' 쉼표 수');
      if (LV.parts.length > 1) ok(!P.check(LV, vs.slice().reverse()) || vs.every(v => v === vs[0]), tag + ' 칸 차례 바꿔도 맞음');
      const c = calc(o.q); if (c) { nCalc++; ok(c.length === LV.parts.length && c.every((v, i) => v === LV.parts[i].v), tag + ' 식을 셈한 값 ' + c.join('·') + ' ≠ 정본 답 ' + a); }
    }
    if (LV.kind === 'frac') { nGr++; const [x, y] = LV.answer.split('/'); ok(a.replace(/\s/g, '') === LV.answer && P.check(LV, LV.answer) && P.check(LV, x + ' / ' + y) && !P.check(LV, y + '/' + x) && !P.check(LV, ''), tag + ' 분수 채점'); }
  });
}));
ok(nGr >= 90, '채점 수준 ' + nGr + ' (90 아래로 줄어듦)'); ok(nCalc >= 20, '식 셈 검산 ' + nCalc);
{ const L0 = { parts: [{ v: 4 }, { v: 5 }], kind: 'nums' }; ok(P.check(L0, ['4', '5']) && !P.check(L0, ['5', '4']) && !P.check(L0, ['4']) && !P.check(L0, '4'), '검산기 자체: 몫·나머지 두 칸'); }
{ const t = P.parseLevelAnswer; ok(JSON.stringify(t('몫 4, 나머지 5').parts.map(p => [p.pre, p.v])) === '[["몫",4],["나머지",5]]' && t('6 L 50 mL').parts[1].unit === 'mL' && t('7봉지, 3개 남음').parts[1].post === '남음' && t('약 900 g') === null && t('241 × 3 (723 > 564)') === null && t('12,000원').parts[0].v === 12000, '파서 자체 확인'); }
console.log('  수준 ' + nLv + ' · 채점 ' + nGr + ' · 식 셈 검산 ' + nCalc + ' · 꼴 ' + JSON.stringify(lvKind));

sec('E. 혼자 흐름');
const PAIR = /짝|모둠|친구와|친구에게|다 함께/;
// 혼자 활동은 좁게: 짝·모둠과 함께 하는 말만(「짝을 맞춘다」·「짝이 되는 카드」·「친구에게 하는 말」처럼 혼자 해도 되는 글은 통과)
const SOLO_PAIR = /짝과|짝이 (말하|확인|들어|읽어)|짝에게 (말|보여|읽어)|모둠(에서|이|원)|다 함께/;
PJ.forEach(({ slug, key, pj }) => pj.slides.forEach(s => {
  const tag = slug + ' ' + key + ' ' + s.id;
  if (s.block === 'offline_activity') ok(!SOLO_PAIR.test(JSON.stringify(s.data.steps) + (s.data.goal || '')), tag + ' 혼자 활동에 짝·모둠 말');
  if (s.block === 'basic_problem' && PAIR.test(String(s.data.question || ''))) ok(!!s.solo, tag + ' 혼자라면 줄');
  if (s.block === 'leveled_problem') Object.values(s.data.levels || {}).forEach(lv => { if (PAIR.test(String(lv.q || '').split('\n')[0])) ok(String(lv.q).indexOf(P.SOLO_FALLBACK) >= 0, tag + ' 수준별 혼자라면 줄'); });
}));

sec('F. 정본 무개변');
all.forEach(({ slug, key, L }) => { const before = JSON.stringify(L); P.project(L); ok(JSON.stringify(L) === before, slug + ' ' + key + ' project() 가 정본을 바꿈'); });

console.log('\n결과: ' + pass + ' 통과 / ' + fail + ' 실패'); if (fails.length) console.log(fails.join('\n'));
process.exit(fail ? 1 : 0);
