/* gate_g1s2_math_u4.js — 1학년 2학기 수학 4단원 「덧셈과 뺄셈(2)」 케이티처 2세대 게이트 (127차, 베프).
   A 로드 · B 19장 골격·단계 · C 복습 계보(g1s2_math u3_l09 → u4_l01 → … → l11)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문 · 개념 글 줄 = 원문 줄·장 제목·가르기 상자 글 · 정리·예고·자기 평가 = 원문
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈(덧셈·뺄셈 · 10 의 짝 · 이어/거꾸로 세기 · 모두/더 많은/남은 · 합·차가 같은 식 · 로봇 길 다음 칸 · 가르기) + 수 뒤 조사(은/는·을/를·과/와·이/가·이에요/예요)
   F 그림 — 가르기 상자 두 다리 합 = 가른 수 · 10 을 만드는 다리(ten) · 이어 세기 길 1 씩 · 덧셈표·뺄셈표 칸 답 = 식 셈 · 로봇 길 답 = 식 셈·1 씩 · 식 띠 「=」 셈 · 구슬·물건 카드 수 = 원문
         문제 그림엔 답 없음(식 띠 강조·답 글자 없음 · 덧셈표 고른 칸·강조 없음 · 가르기 글 없음 · 구할 칸 「?」)
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g1s2_math_u4.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g1s2_math_u4.js')), PREV = load(path.join(TDIR, 'data/g1s2_math_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_math_u4.json'), 'utf8'));
const KEYS = Array.from({ length: 11 }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* 식 셈 — 「a + b − c」 꼴만(왼쪽부터) */
function ev(s) { const t = String(s).replace(/−/g, '-').replace(/\s+/g, ''); if (!/^\d+([+-]\d+)*$/.test(t)) return null; let v = 0, sg = 1; for (const m of t.match(/[+-]|\d+/g)) { if (m === '+') sg = 1; else if (m === '-') sg = -1; else v += sg * +m; } return v; }
const EX = /(\d+) ?([+−-]) ?(\d+)/g, exs = (s) => Array.from(String(s).matchAll(EX)).map(m => ev(m[1] + m[2] + m[3]));
const bat = (n) => '0136781'.indexOf(String(n).slice(-1)) >= 0 && String(n).slice(-1) !== '' && !['2', '4', '5', '9'].includes(String(n).slice(-1)); // 받침: 영·일·삼·육·칠·팔·십
const jo = (n, a, b) => (bat(n) ? a : b);
/* 게이트 셈 — 물음 글에서 답을 다시 낸다(모르는 꼴은 null) */
function solve(q) {
  q = String(q).replace(/\*\*/g, ''); let m;
  if ((m = q.match(/(\d+) (?:과|와) 몇을 (?:모으면|더하면) 10 이/))) return String(10 - m[1]);
  if ((m = q.match(/^10 에서 (\d+) (?:을|를) 빼면/))) return String(10 - m[1]);
  if ((m = q.match(/^(\d+) 부터 (\d+) 만큼 (이어|거꾸로) 세면/))) return String(m[3] === '이어' ? +m[1] + +m[2] : m[1] - m[2]);
  if ((m = q.match(/(\d+) ?\+ ?(\d+) 에서 (\d+) (?:을|를) 갈라 10 을 만들려면 \3 (?:을|를) 몇과 몇/))) { const a = m[3] === m[2] ? +m[1] : +m[2], b = +m[3]; return (10 - a) + ' ' + jo(10 - a, '과', '와') + ' ' + (b - (10 - a)); }
  if ((m = q.match(/친구가 (\d+ ?[+−] ?\d+) = (\d+) 라고 했어요\. 맞을까요/))) { const v = ev(m[1]); return v === +m[2] ? '맞아요' : '틀려요, ' + v; }
  if ((m = q.match(/(\d+) ?([+−]) ?(\d+) (?:과|와) (합|차)가 같은 식/))) return { same: ev(m[1] + m[2] + m[3]) };
  if ((m = q.match(/(합|차)(?:이|가) (\d+) ?(?:이|가) 되는 식/))) return { same: +m[2], op: m[1] };
  if ((m = q.match(/(\d+ ?[+−] ?\d+) 다음 칸(?:의 (?:합|차)| 에 올 식|에 올 식)/))) return /식을/.test(q) ? { same: ev(m[1]) + 1 } : String(ev(m[1]) + 1);
  if ((m = q.match(/(\d+) 개 가운데 (\d+) 개를 썼어요\. 몇 개 남을까요/))) return m[1] - m[2] + '개';
  if ((m = q.match(/(\d+) 개[^.]*?(\d+) 개(?:가|를)? [^.]*?\. 모두 몇 개이고, [^.]*?몇 개 더 많을까요/))) return (+m[1] + +m[2]) + '개, ' + Math.abs(m[1] - m[2]) + '개';
  if ((m = q.match(/(\d+) 개[^.]*?(\d+) 개[^.]*?(?:\.|이에요\.|예요\.) [^.]*?몇 개 더 많을까요/))) return Math.abs(m[1] - m[2]) + '개';
  if ((m = q.match(/(\d+) 개[^.]*?(\d+) 개[^.]*?\. 모두 몇 개/))) return (+m[1] + +m[2]) + '개';
  const e = exs(q); if (e.length && /얼마일까요|구해 볼까요/.test(q)) return String(e[e.length - 1]);
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; const A = String(a).replace(/^예\) /, '');
  if (typeof r === 'string') { ok(nsp(r) === nsp(A), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
  const parts = A.split(/, /).filter(Boolean); ok(parts.length >= 1, q); parts.forEach(p => { const v = ev(p); ok(v === r.same, q + ' → ' + p + ' = ' + v + ' ≠ ' + r.same); if (r.op) ok((r.op === '합') === /\+/.test(p), q + ' 셈 꼴 ' + p); }); return 1; }
/* 조사 — 「수 + 띄어 쓴 조사」 */
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/(\d+) (은|는|을|를|과|와|이에요|예요)(?=[ ,.!?」)]|$)/g)) { const want = { 은: '은', 는: '은', 을: '을', 를: '을', 과: '과', 와: '과', 이에요: '이에요', 예요: '이에요' }[m[2]], has = bat(m[1]); const okk = has ? m[2] === want : m[2] !== want; if (!okk) bad.push(m[0]); } return bad; }
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const rowOk = (toks) => { const t = toks.map(String); const i = t.indexOf('='); if (i < 0 || t.indexOf('?') >= 0) return true; const l = ev(t.slice(0, i).join('')), r = ev(t.slice(i + 1).join('')); return l == null || r == null || l === r; };
const svgOf = (f, sel) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document.querySelector(sel);

T('A 로드 11차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 11); });
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 1 && les.meta.term === 2 && les.meta.unit === 4 && les.meta.n === i + 1 && les.meta.std === ''); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u3_l09.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g1s2_math:u3_l09' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '') && (d.options ? JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.opts) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); ok(['pad', 'mcq'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text).replace(/연결하면/g, '이으면')).join('|'), titles = src.slides.map(s => nsp(s.title)), notes = srcFigs.filter(f => f.k === 'split' && f.note).map(f => nsp(f.note + '.')); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)) || notes.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·자기 평가 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 10) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); const selfL = (src.slides.find(x => x.kind === '자기 평가') || { text: '' }).text.split('\n').filter(l => /\?$/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '자기 평가'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { n += check(it.q, it.a); }); Object.values(sl[11].data.levels).forEach(lv => { n += check(lv.q, lv.a); lv.steps.forEach(st => { for (const m of String(st).matchAll(/(\d+ ?[+−] ?\d+) = (\d+)/g)) ok(ev(m[1]) === +m[2], lv.q + ' 풀이 ' + m[0]); }); }); ok(n >= 4, '셈한 물음 ' + n); });
  T(k + ' E 교사 층 셈·조사', () => { const txt = JSON.stringify([sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[15].data, sl[2].data]); for (const m of txt.replace(/\*\*/g, '').replace(/친구가 [^.]*?라고 했어요/g, '').matchAll(/(\d+ ?[+−] ?\d+(?: ?[+−] ?\d+)?) = (\d+)/g)) ok(ev(m[1]) === +m[2], '식 ' + m[0]); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 셈', () => { sl.forEach((s, j) => figsOf(s.data.fig).forEach(f => { const at = 's' + (j + 1) + ' ' + f.k;
    if (f.k === 'eqt') f.rows.forEach(r => ok(rowOk(r.toks), at + ' 식 ' + r.toks.join(' ')));
    if (f.k === 'split1') { const g = srcFigs.find(x => x.k === 'split' && x.n === f.n && JSON.stringify(x.toks) === JSON.stringify(f.toks)); ok(g, at + ' 원문에 없는 가르기'); ok(g.a + g.b === g.n, at + ' 두 다리 합 ' + g.a + '+' + g.b + '≠' + g.n);
      const tn = f.legs.findIndex(l => l.ten); if (tn >= 0) { const tv = tn === 0 ? g.a : g.b; ok(g.partner != null ? tv + g.partner === 10 : tv === 10, at + ' 10 을 만드는 다리'); }
      f.legs.forEach((l, q) => { if (!l.hole) ok(+l.v === (q === 0 ? g.a : g.b), at + ' 다리 ' + l.v); });
      const sv = svgOf(f, 'svg.fig-split1'); ok(sv && sv.getAttribute('data-split').startsWith(f.n + '|'), at + ' 렌더'); }
    if (f.k === 'cpath1') { const all = [f.from].concat(f.seq); all.slice(1).forEach((v, q) => ok(v - all[q] === (f.down ? -1 : 1), at + ' 1 씩')); }
    if (f.k === 'eqtab1') { f.rows.forEach(r => r.forEach(c => ok(ev(c.e) === c.v, at + ' 칸 ' + c.e + '=' + c.v))); ok(+svgOf(f, 'svg.fig-eqtab1').getAttribute('data-n') === f.rows.flat().length, at + ' 렌더 칸 수'); }
    if (f.k === 'rpath1') { f.steps.forEach((p, q) => { if (p.e && !p.hole) ok(ev(p.e) === +p.v, at + ' ' + p.e + '=' + p.v); if (q && !p.hole && !f.steps[q - 1].hole) ok(+p.v - +f.steps[q - 1].v === 1, at + ' 1 씩'); }); }
    if (f.k === 'bead1') { const g = srcFigs.find(x => x.k === 'bead' && JSON.stringify(x.rows) === JSON.stringify(f.rows)); ok(g, at + ' 원문 구슬'); const sv = svgOf(f, 'svg.fig-bead1'); ok(sv.querySelectorAll('circle.o-bead.on').length === f.rows.reduce((a, r) => a + r.r + r.w, 0), at + ' 켠 구슬 수'); }
    if (f.k === 'objs1') { if (k === 'u4_l01' && j === 6) { const h = fs.readFileSync(path.join(TDIR, '../../grade1/semester2/math/4단원_덧셈과뺄셈2', src.file), 'utf8'); const seg = h.slice(h.indexOf('재활용 표시를 찾아요')), dr = seg.match(/<div class="dotrow">(.*?)<\/div>/); ok(dr && (dr[1].match(/♻️/g) || []).length === f.items[0].n, at + ' 원문 dotrow 수'); } else ok(srcFigs.some(x => x.k === 'objs' && JSON.stringify(x.items) === JSON.stringify(f.items)), at + ' 원문 물건 카드'); }
    if (f.k === 'tf2') ok(f.a + f.b + (f.g || 0) <= 10, at + ' 칸 수'); })); });
  T(k + ' F 문제 그림에 답 없음', () => { sl.slice(8, 11).concat([sl[14]]).forEach((s, j) => { const d = s.data, ans = d.answer != null ? String(d.answer) : null; figsOf(d.fig).forEach(f => { const at = 's' + (j + 9) + ' ' + f.k;
      if (f.k === 'eqt') f.rows.forEach(r => { ok(!(r.hi || []).length, at + ' 강조'); const e = r.toks.indexOf('='); if (e >= 0 && ans != null) ok(r.toks.slice(e + 1).join('') !== ans, at + ' 답 글자 ' + r.toks.join(' ')); });
      if (f.k === 'eqtab1') ok(f.rows.flat().every(c => !c.h), at + ' 고른 칸·강조');
      if (f.k === 'split1') { ok(!f.note, at + ' 가르기 글'); if (ans != null) ok(f.legs.some(l => l.hole) || !/갈라/.test(d.question), at + ' 구할 다리 「?」'); }
      if (f.k === 'cpath1' && ans != null) ok(f.hole && String(f.seq[f.seq.length - 1]) === ans, at + ' 도착 칸 「?」 = 답');
      if (f.k === 'rpath1' && ans != null) ok(f.steps.some(p => p.hole && String(ev(p.e) != null ? ev(p.e) : ans) === ans), at + ' 구할 칸');
      if (f.k === 'lcube') ok(!f.num, at + ' 묶음 수');
      if (f.k === 'bingo1' && ans != null) ok(f.nums.includes(+ans), at + ' 빙고판에 답 칸'); }); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(2)', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(2)', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '덧셈과 뺄셈(2)', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
const ALL = fs.readFileSync(path.join(TDIR, 'data/g1s2_math_u4.js'), 'utf8');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('7 과 몇을 모으면 10 이 될까요?') === '3' && solve('10 에서 3 을 빼면 얼마일까요?') === '7' && solve('9 부터 3 만큼 이어 세면 얼마일까요?') === '12' && solve('12 부터 4 만큼 거꾸로 세면 얼마일까요?') === '8' && solve('16 − 8 은 얼마일까요?') === '8' && solve('9 + 5 = 14 예요. 9 + 6 은 얼마일까요?') === '15', '기본 셈');
  ok(solve('9 + 8 에서 8 을 갈라 10 을 만들려면 8 을 몇과 몇으로 가를까요?') === '1 과 7', '가르기'); ok(solve('친구가 14 − 6 = 12 라고 했어요. 맞을까요?') === '틀려요, 8', '친구 말');
  ok(solve('딸기 맛 14 개, 포도 맛 9 개예요. 딸기 맛은 몇 개 더 많을까요?') === '5개', '더 많은'); ok(solve('사과 7 개와 배 9 개가 있어요. 모두 몇 개이고, 배는 사과보다 몇 개 더 많을까요?') === '16개, 2개', '두 물음');
  ok(solve('합이 1 씩 커지는 길이에요. 9 + 4 다음 칸의 합은?') === '14', '로봇 길'); ok(solve('13 − 7 과 차가 같은 식을 하나 써 볼까요?').same === 6, '차가 같은'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('7 + 8 은 얼마일까요?', '14'); } catch (_) { e++; }
  try { check('13 − 7 과 차가 같은 식을 하나 써 볼까요?', '예) 14 − 7'); } catch (_) { e++; }
  try { check('합이 15 가 되는 식을 하나 써 볼까요?', '예) 8 − 7'); } catch (_) { e++; }
  ok(e === 3, '틀린 답 못 잡음 ' + e);
  ok(josa('9 를 갈라요').length === 0 && josa('9 을 갈라요').length === 1 && josa('13 예요').length === 1 && josa('6 과 4').length === 0 && josa('8 와 2').length === 1, '조사 역검증');
  ok(!rowOk(['8', '+', '6', '=', '15']) && rowOk(['8', '+', '6', '=', '?']), '식 띠 역검증');
  const sv = svgOf({ k: 'split1', toks: ['6', '+', '9'], n: 9, legs: [{ v: '4', ten: true }, { v: '5' }], partner: 6 }, 'svg'); ok(sv.getAttribute('data-split') === '9|4|5', '가르기 렌더'); });
console.log('gate_g1s2_math_u4: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
