/* gate_g3s2_math_u3.js — 3학년 2학기 수학 3단원 「원」 케이티처 2세대 게이트 (31차, 베프 — u2 게이트 복제 + 원 검산).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(u2_l11 → l01 → … → l07) · E 문제 정답(반지름·지름·컴퍼스 재계산·보기 정답 1개)
   F 산수·원 관계 전수(× + − ÷ 식 · 문장 속 「반지름 r … 지름 d」 d = 2r) · G 그림(circ 반지름·지름 · compass 벌린 길이 · cgrid · crow)
   H 재료 충실(자기주도 원문 계승) · L 선행 용어(반지름 l02 · 지름 l03 · 컴퍼스 l05 전에 학생 화면 0)
   I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22·연결 · K 발문 6장↑
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_math_u3.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

function load(file) { const L = {}; const c = { window: { LESSONS: L } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g3s2_math_u3.js'));
const U2 = load(path.join(TDIR, 'data/g3s2_math_u2.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_math_u3.json'), 'utf8'));
const KEYS = Array.from({ length: 7 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

// 2세대 무대 부팅(jsdom)
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '원', classNames: [] });

console.log('═══ A. 로드 ═══');
T('7차시 키 u3_l01~l07', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit_title 원 · 성취기준 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 3 && m.term === 2 && m.unit === 3 && m.unit_title === '원' && m.std === '[4수02-04]' && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex7 = U2.u2_l11.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'u2_l11') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex7;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_math:u2_l11'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/−/g, '-'); if (!/^[\d\s*+\-()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
const lead = (q) => { const t = String(q).replace(/\*\*/g, '');
  let d = t.match(/^(\d+)\s*÷\s*(\d+)\s*(?:는|은)\s*얼마/); if (d) { const a = +d[1], b = +d[2]; if (a % b) throw new Error('나누어떨어지지 않는데 「얼마」: ' + t); return a / b; }
  d = t.match(/^(\d+)\s*÷\s*(\d+)\s*의 몫(?:은|는)/); if (d) return Math.floor(+d[1] / +d[2]);
  d = t.match(/^(\d+)\s*÷\s*(\d+)\s*의 나머지(?:는|은)/); if (d) return +d[1] % +d[2];
  const m = t.match(/^(\d+(?:\s*[×+−]\s*\d+)+)\s*(?:는|은|을|를)\s*(?:얼마|계산)/); return m ? calc(m[1]) : null; };
// 원 문제 재계산: 반지름 ↔ 지름(2배·반) · 컴퍼스 벌린 길이 = 반지름 · 같은 원의 반지름·지름은 모두 같다
const leadC = (q) => { const t = String(q).replace(/\*\*/g, ''); let m;
  if ((m = t.match(/반지름이?\s*(?:약\s*)?(\d+)\s*(?:cm|m|칸)\s*인\s*[가-힣]+의 지름은/))) return 2 * m[1];
  if ((m = t.match(/(?<!반)지름이?\s*(?:약\s*)?(\d+)\s*(?:cm|m|칸)\s*인\s*[가-힣]+의 반지름은/))) return m[1] / 2;
  if ((m = t.match(/반지름이\s*(\d+)\s*cm\s*인 원을 그리려면 컴퍼스를 몇/))) return +m[1];
  if ((m = t.match(/(?<!반)지름이\s*(\d+)\s*cm\s*인 원을 그리려면 컴퍼스를 몇/))) return m[1] / 2;
  if ((m = t.match(/컴퍼스를\s*(\d+)\s*cm\s*벌려 그린 원의 지름/))) return 2 * m[1];
  if ((m = t.match(/반지름이\s*(\d+)\s*(?:cm|칸)\s*인 원에 반지름을 하나 더/))) return +m[1];
  if ((m = t.match(/(?<!반)지름이\s*(\d+)\s*(?:cm|칸)\s*인 원에 지름을 하나 더/))) return +m[1];
  if ((m = t.match(/누름 못에서\s*(\d+)\s*cm\s*떨어진 구멍.*반지름은/))) return +m[1];
  return lead(q); };
let nCheck = 0;
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = leadC(d.question); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' ≠ ' + d.answer); } ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadC(lv[t].q); if (v != null) { nCheck++; ok(parseInt(String(lv[t].a).replace(/,/g, ''), 10) === v, t + ' ' + lv[t].q + ' ≠ ' + lv[t].a); } ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadC(it.q); if (v != null) { nCheck++; ok(+it.a === v, '출구 ' + it.q + ' ≠ ' + it.a); } }); }));
T('다시 계산한 정답 수 ≥ 25', () => ok(nCheck >= 25, nCheck));

console.log('═══ F. 산수 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
let nEq = 0; const bad = [];
allStr.forEach(([s0, where]) => { const s = s0.replace(/\*\*/g, ''); const re = /(\d+(?:\s*[×+−]\s*\d+)+)\s*=\s*(\d+)(?![\d]|\s*[×+−])/g; let m;
  while ((m = re.exec(s))) { const before = s.slice(0, m.index).replace(/\s+$/, ''); const pc = before.slice(-1); if (/[\d×+−=□)]/.test(pc)) continue; const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } });
let nDiv = 0;
allStr.forEach(([s0, where]) => { const s = s0.replace(/\*\*/g, ''); const re = /(\d+)\s*÷\s*(\d+)\s*=\s*(\d+)(?:\s*…\s*(\d+))?/g; let m;
  while ((m = re.exec(s))) { const before = s.slice(0, m.index).replace(/\s+$/, ''); if (/[\d×+−=□)]/.test(before.slice(-1))) continue; const a = +m[1], b = +m[2], q = +m[3], r = m[4] == null ? 0 : +m[4]; nDiv++;
    if (b * q + r !== a || r >= b || (m[4] == null && a % b)) bad.push(where + ': ' + m[0] + ' (→' + Math.floor(a / b) + ' … ' + a % b + ')'); } });
T('식 전수 재계산 (× + − ' + nEq + '개 · ÷ ' + nDiv + '개) 틀림 0', () => ok(bad.length === 0, bad.slice(0, 6).join(' | ')));
T('식 재계산 ≥ 10개', () => ok(nEq + nDiv >= 10, nEq + '·' + nDiv));
// 문장 속 반지름·지름 짝 전수: 「반지름 r u (인 원의·인 원은·,·이면·→ …) 지름 d u」 → d = 2r (틀린 생각 wrong 칸 제외 · 「… 의 2배」 꼴은 건너뜀)
let nRD = 0; const badRD = [];
const U = '(cm|m|칸)', CON = '\\s*(?:인 원의|인 원은|인 원|,|이면|는|은|→|의)\\s*(?:다른\\s*)?';
const reRD = new RegExp('반지름(?:이|은|는)?\\s*(?:약\\s*)?(\\d+)\\s*' + U + CON + '(?<!반)지름(?:은|이|도)?\\s*(?:약\\s*)?(\\d+)\\s*\\2(?!\\s*의)', 'g');
const reDR = new RegExp('(?<!반)지름(?:이|은|는)?\\s*(?:약\\s*)?(\\d+)\\s*' + U + CON + '반지름(?:은|이|도)?\\s*(?:약\\s*)?(\\d+)\\s*\\2(?!\\s*의)', 'g');
allStr.forEach(([s0, where]) => { if (/\.wrong$|\.watch$/.test(where)) return; /* 틀린 생각·「이런 경우」 유의점은 틀린 짝을 일부러 적는다 */ const s = s0.replace(/\*\*/g, ''); let m;
  while ((m = reRD.exec(s))) { nRD++; if (+m[3] !== 2 * m[1]) badRD.push(where + ': ' + m[0]); }
  while ((m = reDR.exec(s))) { nRD++; if (+m[1] !== 2 * m[3]) badRD.push(where + ': ' + m[0]); } });
T('문장 속 반지름·지름 짝 ' + nRD + '개 전부 d = 2r', () => ok(badRD.length === 0, badRD.slice(0, 5).join(' | ')));
T('반지름·지름 짝 ≥ 6개', () => ok(nRD >= 6, nRD));
T('검산기 자체 확인 — 틀린 짝·「의 2배」 꼴', () => { const t1 = '반지름이 4 cm 인 원의 지름은 6 cm 예요.', t2 = '반지름이 4 cm 이면 지름은 4 cm 의 2배인 8 cm 예요.'; reRD.lastIndex = 0; const a = reRD.exec(t1); ok(a && +a[3] !== 2 * a[1], '틀린 짝을 못 잡음'); reRD.lastIndex = 0; ok(!reRD.exec(t2), '「의 2배」 꼴 오탐'); reRD.lastIndex = 0; });

console.log('═══ G. 그림 ═══');
KEYS.forEach(k => T(k + ' 개념 4장 fig 렌더 · circ 반지름·지름 · compass · cgrid · crow', () => { L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(s.data.fig, s.id + ' fig 없음'); const h = FIG.render(s.data.fig); ok(h && h.length > 200, s.id + ' 빈 그림');
  ok(!/NaN|undefined/.test(h), s.id + ' NaN/undefined'); (h.match(/data-r="(\d+)"/g) || []).forEach(x => nCheck++);
  const walkF = (f) => { if (!f) return; if (f.k === 'panels') return f.items.forEach(p => walkF(p.fig || p));
    if (f.k === 'circ' && f.rcm != null && f.dcm != null) { nCheck++; ok(f.dcm === 2 * f.rcm, s.id + ' circ 지름 ' + f.dcm + ' ≠ 반지름 ' + f.rcm + ' × 2'); }
    if (f.k === 'circ') ok(h.indexOf('data-nr="' + (f.radii || []).length + '" data-nd="' + (f.diam || []).length + '"') >= 0, s.id + ' circ 선분 수');
    if (f.k === 'compass') { nCheck++; ok(h.indexOf('data-open="' + f.cm + '" data-d="' + 2 * f.cm + '"') >= 0, s.id + ' compass ' + f.cm); }
    if (f.k === 'cgrid') ok(h.indexOf('data-rs="' + f.items.map(it => it.r).join(',') + '"') >= 0, s.id + ' cgrid 반지름');
    if (f.k === 'crow') ok(h.indexOf('data-ds="' + f.items.map(it => it.d != null ? it.d : 2 * it.r).join(',') + '"') >= 0, s.id + ' crow 지름'); if (f.k === 'vmul') ok(h.indexOf('data-r="' + f.a * f.b + '"') >= 0, s.id + ' vmul ' + f.a + '×' + f.b); if (f.k === 'vdiv') { nCheck++; ok(h.indexOf('data-q="' + Math.floor(f.a / f.d) + '" data-rem="' + (f.a % f.d) + '"') >= 0, s.id + ' vdiv ' + f.a + '÷' + f.d); } if (f.k === 'brem') ok(h.indexOf('data-g="' + Math.floor(f.total / f.per) + '" data-r="' + (f.total % f.per) + '"') >= 0, s.id + ' brem'); if (f.k === 'range' && f.at != null) ok(f.at >= f.lo && f.at <= f.hi, s.id + ' range 밖'); if (f.k === 'grid') { const sw = f.sw || [f.w], sh = f.sh || [f.h]; ok(sw.reduce((a, b) => a + b) === f.w && sh.reduce((a, b) => a + b) === f.h, s.id + ' grid 가르기 합'); } };
  walkF(s.data.fig); }); }));

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(norm(s.data.content)) >= 0, s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('한 차시 안에서 같은 식 문제 중복 0 (기본·수준별·응용)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = []; sl.filter(s => s.block === 'basic_problem').forEach(s => e.push(s.data.question)); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); e.push(sl[14].data.context + sl[14].data.challenge);
  const exprs = e.map(q => (String(q).match(/\d+\s*÷\s*\d+/) || [''])[0].replace(/\s/g, '')).filter(Boolean); const dup = exprs.filter((x, i) => exprs.indexOf(x) !== i); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => { const out = []; (function walk(o, key) { if (key === 'tnote') return; if (typeof o === 'string') out.push(o); else if (o && typeof o === 'object') Object.keys(o).forEach(kk => walk(o[kk], kk)); })(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => s.data), ''); return out.join(' '); };
T('「반지름」·「원의 중심」은 l02 전 학생 화면 0 · 「지름」은 l03 전 0 · 「컴퍼스」는 l05 전 0', () => { KEYS.forEach((k, i) => { const t = stud(k), n = i + 1;
  if (n < 2) ok(!/반지름|원의 중심/.test(t), k + ' 반지름/원의 중심 선행'); if (n < 3) ok(!/(?<!반)지름/.test(t), k + ' 지름 선행'); if (n < 5) ok(!/컴퍼스/.test(t), k + ' 컴퍼스 선행'); });
  ok(/반지름/.test(stud('u3_l02')) && /(?<!반)지름/.test(stud('u3_l03')) && /컴퍼스/.test(stud('u3_l05')), '도입 차시엔 실제로 나온다'); });

console.log('\n게이트 g3s2 수학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
