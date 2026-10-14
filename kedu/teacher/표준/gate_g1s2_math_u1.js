/* gate_g1s2_math_u1.js — 1학년 2학기 수학 1단원 「100까지의 수」 케이티처 2세대 게이트 (121차, 베프).
   A 로드 · B 19장 골격·단계 · C 복습 계보(g1_math u5_l11 → l01 → … → l10)
   D 원문 충실 — 기본 문제 물음·정답·보기가 자기주도 원문과 같음 · 개념 글 줄이 원문 글(또는 원문 수로 지은 한 줄)
   E 셈 재계산 — 출구·수준별 물음을 게이트가 다시 셈(묶음 a개와 낱개 b개 · 1만큼 더 큰/작은 · 다음 수 · ○ 기호 · 짝수/홀수 · 우리말/한자말 읽기)
   F 그림 — 문제 그림엔 답 없음(bt·gbun 수 글자 0) · 「모두 몇 개」 문제는 gbun/bt 의 수 = 정답 · 수의 줄 「?」 칸 = 정답 자리
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴(cv2·pa2·pf2…) 받음
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g1s2_math_u1.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g1s2_math_u1.js')), PREV = load(path.join(TDIR, 'data/g1_math_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_math_u1.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* 수 읽기 — 한자말·우리말 */
const HAN = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'], KOR10 = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'], KOR1 = ['', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉'];
const han = (n) => n === 100 ? '백' : (Math.floor(n / 10) > 1 ? HAN[Math.floor(n / 10)] : '') + (n >= 10 ? '십' : '') + HAN[n % 10];
const kor = (n) => KOR10[Math.floor(n / 10)] + KOR1[n % 10];
/* 게이트 셈 — 물음 글에서 답을 다시 낸다(모르는 꼴은 null) */
function solve(q) {
  q = String(q).replace(/\*\*/g, ''); let m; if ((q.match(/\?/g) || []).length > 1) return null;
  const cnt = (n) => kor(n).replace(/하나$/, '한').replace(/둘$/, '두').replace(/셋$/, '세').replace(/넷$/, '네').replace(/^스물$/, '스무');
  if ((m = q.match(/(\d+)번 버스를 (?:어떻게 )?읽/))) return han(+m[1]) + ' 번 버스';
  if ((m = q.match(/(\d+)개(?:를| 있어요\.)\s*(?:어떻게 )?읽/))) return cnt(+m[1]) + ' 개';
  if ((m = q.match(/\( \)세.*?(\d+)(?:을|를) 어울리게 읽으면/))) return kor(+m[1]);
  if ((m = q.match(/묶음 (\d)개와 낱개 (\d)개(?:는|가)? (?:얼마|몇 개)/))) return String(10 * m[1] + +m[2]);
  if ((m = q.match(/(\d+)(?:은|는) (?:10개씩 )?묶음 몇 개와 낱개 몇 개/))) return '묶음 ' + Math.floor(m[1] / 10) + '개, 낱개 ' + m[1] % 10 + '개';
  if ((m = q.match(/(\d+)(?:은|는) (?:10개씩 )?묶음 몇 개/))) return Math.floor(m[1] / 10) + '개';
  if ((m = q.match(/(\d+)보다 1만큼 더 큰 수/))) return String(+m[1] + 1);
  if ((m = q.match(/(\d+)보다 1만큼 더 작은 수/))) return String(+m[1] - 1);
  if ((m = q.match(/(\d+) 다음 (?:수|가게 번호)/))) return String(+m[1] + 1);
  if ((m = q.match(/(\d+)에서 (?:10개씩 )?묶음이 1개 더 늘면/))) return String(+m[1] + 10);
  if ((m = q.match(/(\d+)에 낱개 1개가 더 오면/))) return String(+m[1] + 1);
  if ((m = q.match(/(\d+)과 (\d+) 중 더 큰/))) return String(Math.max(+m[1], +m[2]));
  if ((m = q.match(/(\d+) ○ (\d+)/))) return +m[1] > +m[2] ? '>' : '<';
  if ((m = q.match(/(\d+)(?:은|는|개는)? 짝수일까요, 홀수일까요/))) return m[1] % 2 ? '홀수' : '짝수';
  if ((m = q.match(/(\d+)(?:을|를) 우리말로(?:만)? 읽으면/))) return kor(+m[1]);
  return null;
}

T('A 로드 10차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 10); });
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 1 && les.meta.term === 2 && les.meta.unit === 1); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u5_l11.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const qOf = (p) => { const c = (p.figs || []).find(f => f.k === 'cmp'); return (c ? c.a + ' ○ ' + c.b + ' — ' : '') + p.q; }; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(qOf(p)).replace(/\?$/, '')); ok(p, '원문 물음 없음: ' + d.question);
    if (d.options) { ok(JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.opts), '보기 ' + d.question); ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); } else ok(String(d.answer) === String(p.a), '답 ' + d.answer + ' ≠ ' + p.a); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { if (/^읽기:/.test(line) || /^10개씩 묶음 \*\*\d개\*\*와 낱개 \*\*\d개\*\*는 \*\*\d+\*\*이에요\.$/.test(line)) return; ok(all.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { const a = solve(it.q); if (a == null) return; n++; ok(nsp(a) === nsp(it.a), it.q + ' → ' + it.a + ' (셈 ' + a + ')'); });
    Object.values(sl[11].data.levels).forEach(lv => { const a = solve(lv.q); if (a == null) return; n++; ok(nsp(a) === nsp(lv.a), lv.q + ' → ' + lv.a + ' (셈 ' + a + ')'); }); ok(n >= 2, '셈한 물음 ' + n); });
  T(k + ' F 문제 그림에 답 없음', () => { sl.slice(8, 11).forEach(s => { const d = s.data; if (!d.fig) return; const h = FIG.render(d.fig); const doc = new JSDOM('<body>' + h + '</body>').window.document;
    doc.querySelectorAll('svg.fig-bt, svg.fig-gbun').forEach(sv => { const n = sv.getAttribute('data-n') || ''; const texts = [...sv.querySelectorAll('text')].map(t => t.textContent.trim()); ok(!texts.includes(String(d.answer)) || !/모두|얼마/.test(d.question), '그림에 답 ' + d.answer); });
    if (/모두 몇/.test(d.question) && d.answer != null) { const g = doc.querySelector('svg.fig-gbun'); if (g) ok(+g.getAttribute('data-n') === +d.answer, 'gbun ' + g.getAttribute('data-n') + ' ≠ ' + d.answer); }
    if (d.fig.k === 'ngrid' && d.answer != null) { const row = d.fig.rows[0]; const qi = row.findIndex(c => c && c.q); if (qi > 0 && typeof row[qi - 1] !== 'object' && /다음|더 큰|빈칸|1만큼/.test(d.question) && !/더 작은/.test(d.question)) ok(+row[qi - 1] + 1 === +d.answer, '수의 줄 ? 자리'); } }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '100까지의 수', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '100까지의 수', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '100까지의 수', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
T('E 읽기 셈 자체 점검', () => { ok(han(63) === '육십삼' && kor(63) === '예순셋' && kor(54) === '쉰넷' && han(100) === '백' && kor(99) === '아흔아홉'); });
console.log('gate_g1s2_math_u1: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
