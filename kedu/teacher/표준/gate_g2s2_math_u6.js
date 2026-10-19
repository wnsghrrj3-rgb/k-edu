/* gate_g2s2_math_u6.js — 2학년 2학기 수학 6단원 「규칙 찾기」 케이티처 2세대 게이트 (145차, 베프). u5 게이트 틀.
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g2s2_math u5_l08 → u6_l01 → … → l09)
   D 원문 충실 — 기본 문제 물음·정답·보기 = 원문(「~채워요」꼴 물음은 생성기 QOVR) · 개념 글 줄 = 원문 문장 또는 원문 규칙 카드 줄 · 정리·예고·스스로 점검 = 원문
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈: 「…다음에 올 수/색/소리」(같은 차이로 커지는 수 · 되풀이 묶음) · 덧셈표·곱셈표 칸
     · 「a개, b개, c개로 늘어나면」 · 모두 더하면 · 달력 아래 칸·다음 같은 요일 · 돌림판 처음 자리 · 묶음의 n번째 + 풀이 식 · 수 뒤 조사
   F 그림 — 원문 그림 그대로(rcard 는 글 줄로) · prow2/nstr2/beat2/pgd2 되풀이 묶음(모양·색 따로) · beat2 같은 소리 = 같은 수
         · optab2 칸 = 왼쪽 수 (+|×) 위쪽 수(렌더 data-optab) · ntab2 줄·칸이 같은 차이 · mcal2 띠 = 같은 요일 · spin2 칸 이동(방향·칸 수)
         · cubep2 쌓은 칸 아래가 비지 않음 · gdot2 색 번갈아·하나씩 늘어남
         · 기본·심화 문제 답 = 그림에서 다시 낸 값(빈칸 · 다음에 올 것 · 묶음 칸 수 · 돌아가는 칸 · 방향 · 늘어나는 수)
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(파일 이름 칸 live_url·source 빼고)
   실행: NODE_PATH=/tmp/nm/node_modules node kedu/teacher/표준/gate_g2s2_math_u6.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g2s2_math_u6.js')), PREV = load(path.join(TDIR, 'data/g2s2_math_u5.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g2s2_math_u6.json'), 'utf8'));
const QOVR = {
  '숫자 띠의 빈칸을 채워요': '숫자 띠의 빈칸에 알맞은 수는 얼마일까요?', '승강기 단추의 빈칸을 채워요': '승강기 단추의 빈칸에 알맞은 수는 얼마일까요?',
  '덧셈표의 빈칸을 채워요': '덧셈표의 빈칸에 알맞은 수는 얼마일까요?', '곱셈표의 빈칸을 채워요': '곱셈표의 빈칸에 알맞은 수는 얼마일까요?',
  '내가 만든 덧셈표의 빈칸을 채워요': '내가 만든 덧셈표의 빈칸에 알맞은 수는 얼마일까요?', '내가 만든 무늬의 빈칸을 채워요': '내가 만든 무늬의 빈칸에 알맞은 수는 얼마일까요?',
  '내가 만든 규칙의 빈칸을 채워요': '내가 만든 규칙의 빈칸에 들어갈 수는 얼마일까요?', '출구 번호를 찾아요': '출구 번호는 얼마일까요?', '공연장 의자 번호를 찾아요': '내 자리의 의자 번호는 몇 번일까요?'
};
const N = 9, KEYS = Array.from({ length: N }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── 수열·묶음 ── */
const eqv = (a, b) => same(a, b);
/* 가장 짧은 되풀이 칸 수(null = 아무것이나) — 한 번 이상 되풀이되어야(p < n) */
function periodOf(seq) { const n = seq.length; for (let p = 1; p < n; p++) { let good = true; for (let i = p; i < n && good; i++) { const a = seq[i], b = seq[i - p]; if (a != null && b != null && !eqv(a, b)) good = false; } if (good) { for (let r = 0; r < p; r++) { const vals = seq.filter((x, i) => i % p === r && x != null); if (!vals.length) good = false; } if (good) return p; } } return null; }
const atP = (seq, p, i) => seq.find((x, j) => j % p === i % p && x != null);
function nextOf(seq) { // 같은 차이(0 아님)로 커지는 수 → 다음 · 아니면 되풀이 묶음
  if (seq.every(x => typeof x === 'number') && seq.length >= 3) { const d = seq[1] - seq[0]; if (d && seq.every((x, i) => !i || x - seq[i - 1] === d)) return seq[seq.length - 1] + d; }
  const p = periodOf(seq); if (!p || seq.length < p + 2) return null; return atP(seq, p, seq.length);
}
/* ── 셈 ── */
function solve(q) {
  q = String(q).replace(/\*\*/g, '').trim(); let m;
  if ((m = q.match(/^(.+) 다음에 올 (수|색|소리)(는|은) (얼마|무엇)일까요\?$/))) { ok((m[2] === '색' ? '은' : '는') === m[3], '조사 ' + q); ok((m[2] === '수') === (m[4] === '얼마'), '물음 ' + q); const t = m[1].split(', ').map(x => (/^\d+$/.test(x) ? +x : x)); const r = nextOf(t); ok(r != null, '다음을 못 셈 ' + q); return String(r); }
  if ((m = q.match(/^(덧셈표|곱셈표)에서 왼쪽 수 (\d+)(과|와) 위쪽 수 (\d+)(이|가) 만나는 칸의 수는 얼마일까요\?$/))) { ok(m[3] === (finalOf(m[2]) ? '과' : '와') && m[5] === (finalOf(m[4]) ? '이' : '가'), '조사 ' + q); return String(m[1] === '덧셈표' ? +m[2] + +m[4] : +m[2] * +m[4]); }
  if ((m = q.match(/^((?:\d+개, )+\d+개)로 늘어나면 다음에는 몇 개일까요\?$/))) { const t = m[1].split(', ').map(x => parseInt(x, 10)); ok(t.length >= 3, '셋 이상 ' + q); const r = nextOf(t); ok(r != null && r > t[t.length - 1], '늘어남 ' + q); return r + '개'; }
  if ((m = q.match(/^((?:\d+개, )+\d+개)를 모두 더하면 몇 개일까요\?$/))) return m[1].split(', ').reduce((a, x) => a + parseInt(x, 10), 0) + '개';
  if ((m = q.match(/^달력에서 (\d+)일 바로 아래 칸은 며칠일까요\?$/))) { ok(+m[1] + 7 <= 31, q); return (+m[1] + 7) + '일'; }
  if ((m = q.match(/^(\d+)일이 (.)요일이면 다음 \2요일은 며칠일까요\?$/))) { ok('일월화수목금토'[(+m[1] - 1) % 7] === m[2], '달력(1일 일요일)과 요일 ' + q); return (+m[1] + 7) + '일'; }
  if ((m = q.match(/^(\d+)칸 돌림판에서 시계 방향으로 한 번에 (\d+)칸씩 돌면, 몇 번 돌아야 처음 자리로 돌아올까요\?$/))) { ok(+m[1] % +m[2] === 0, q); return (+m[1] / +m[2]) + '번'; }
  if ((m = q.match(/^(.+)(이|가) 되풀이되면 (\d+)번째에 올 (색|소리|수)(은|는) 무엇일까요\?$/))) { const t = m[1].split(', '), last = t[t.length - 1]; ok(m[2] === (/[가-힣]/.test(last.slice(-1)) && (last.slice(-1).charCodeAt(0) - 0xAC00) % 28 ? '이' : '가'), '조사 ' + q); return t[(+m[3] - 1) % t.length]; }
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }
function numExpr(e) { e = String(e).replace(/\s+/g, ''); if (!/^\d+([×+−]\d+)*$/.test(e)) return null; return e.split(/(?=[+−])/).reduce((acc, t) => { const sg = t[0] === '−' ? -1 : 1; return acc + sg * t.replace(/^[+−]/, '').split('×').reduce((a, b) => a * +b, 1); }, 0); }
function stepEq(s) { let n = 0; String(s).split(' | ').forEach(st => { const sides = st.split(' = '); if (sides.length < 2) return; const v = sides.map(numExpr); if (v.some(x => x == null)) return; ok(v.every(x => x === v[0]), '풀이 식 ' + st); n++; }); return n; }
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)"]|$)/g)) { const f = finalOf(m[1]); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }

/* ── 그림 ── */
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const htmlOf = (f) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document;
const PK = { prow: 'prow2', pgd2: 'pgd2', nstrip: 'nstr2', optab: 'optab2', ntab2: 'ntab2', cubep: 'cubep2', mcal: 'mcal2', spin: 'spin2', beat: 'beat2', gdot: 'gdot2', objs: 'objs1' };
/* 부품 = 원문 그림(빈 배열 칸만 빠짐) */
function srcMatch(f, pool) { return pool.find(x => PK[x.k] === f.k && Object.keys(x).every(key => key === 'k' || (Array.isArray(x[key]) && !x[key].length && f[key] === undefined) || same(x[key], f[key])) && Object.keys(f).every(key => key === 'k' || key in x)); }
const CN = { red: '빨간색', blu: '파란색', yel: '노란색', grn: '초록색', sky: '하늘색', lgr: '연두색', org: '주황색', pur: '보라색', pnk: '분홍색', gry: '회색' };
const SN = { cir: ['●', '◯', '원'], tri: ['△', '삼각형'], sq: ['■', '□', '사각형'], dia: ['◆', '마름모'] };
const SPOS4 = ['맨 위', '오른쪽', '맨 아래', '왼쪽'];
const opv = (op, a, b) => op === 'x' ? a * b : a + b;
const arith = (row) => row.length < 2 || row.every((x, i) => !i || x - row[i - 1] === row[1] - row[0]);
/* 모양 줄 되풀이 — 모양·색 따로 */
function cellPeriodic(cells, at) { const ps = periodOf(cells.map(c => c && c[0])), pc = periodOf(cells.map(c => c && c[1])); ok(ps && pc && ps <= cells.length - 2 && pc <= cells.length - 2, at + ' 모양·색이 되풀이되지 않음'); return { ps, pc }; }
const cellAt = (cells, ps, pc, i) => [atP(cells.map(c => c && c[0]), ps, i), atP(cells.map(c => c && c[1]), pc, i)];
function optText(o, c) { ok(o.indexOf(CN[c[1]]) >= 0 || (o === CN[c[1]]), '보기 색 「' + o + '」 ≠ ' + CN[c[1]]); const names = Object.values(SN).flat(); if (names.some(nm => o.indexOf(nm) >= 0)) ok(SN[c[0]].some(nm => o.indexOf(nm) >= 0), '보기 모양 「' + o + '」 ≠ ' + c[0]); }
/* 그림 하나 점검 — prob 이면 그림에서 다시 낸 답({n} 또는 {o: 보기 글 검사 함수})을 돌려준다 */
function figCheck(f, pool, at, prob, q, opts) {
  const sf = srcMatch(f, pool); ok(sf, at + ' 원문 그림과 다름 ' + f.k);
  const out = [], el = () => htmlOf(f);
  if (f.k === 'prow2') { ok(el().querySelector('svg[data-prow]'), at + ' 렌더'); const { ps, pc } = cellPeriodic(f.cells, at), hole = f.cells.indexOf(null);
    if (prob && opts) { const i = hole >= 0 ? hole : f.cells.length; const c = cellAt(f.cells, ps, pc, i); out.push({ o: (t) => optText(t, c) }); } }
  if (f.k === 'pgd2') { ok(el().querySelector('svg[data-pgrid]'), at + ' 렌더'); const runs = (r) => { const out = []; r.forEach((c, i) => { if (i && same(c, r[i - 1])) out[out.length - 1]++; else out.push(1); }); return out; }; f.rows.forEach(r => ok((periodOf(r.map(c => c && c[1])) && periodOf(r.map(c => c && c[0]))) || (runs(r).length > 1 && runs(r).every(x => x === runs(r)[0])), at + ' 줄 되풀이'));
    if (prob && /몇 가지 색/.test(q)) out.push({ n: Math.max(...f.rows.map(r => periodOf(r.map(c => c[1])))) }); }
  if (f.k === 'nstr2' || f.k === 'beat2') { const isB = f.k === 'beat2', seq = isB ? f.cells.map(c => c && c[1]) : f.vals; ok(el().querySelector(isB ? 'svg[data-beat]' : 'svg[data-nstrip]'), at + ' 렌더');
    if (isB) { const m = {}; f.cells.forEach(c => { if (!c) return; ok(m[c[0]] == null || m[c[0]] === c[1], at + ' 같은 소리 다른 수 ' + c[0]); m[c[0]] = c[1]; }); }
    const p = periodOf(seq); ok(p && p <= seq.length - 2, at + ' 되풀이 묶음 없음'); if (isB) ok(periodOf(f.cells.map(c => c && c[0])) === p, at + ' 소리 묶음 ≠ 수 묶음');
    if (prob) { const h = seq.indexOf(null); if (/몇 칸|몇 가지/.test(q)) out.push({ n: p }); else if (h >= 0 && /얼마/.test(q)) out.push({ n: atP(seq, p, h) }); else if (opts && isB) { const s = atP(f.cells.map(c => c && c[0]), p, f.cells.length); out.push({ o: (t) => ok(t === s, at + ' 다음 소리 ' + t + ' ≠ ' + s) }); } } }
  if (f.k === 'optab2') { const d = el().querySelector('svg[data-optab]'); ok(d, at + ' 렌더'); const parts = d.getAttribute('data-optab').split('|'), rows = parts[3].split(';').map(r => r.split(','));
    ok(rows.length === f.rh.length && rows.every(r => r.length === f.ch.length), at + ' 칸 수');
    f.rh.forEach((a, r) => f.ch.forEach((b, c) => { const isH = (f.holes || []).some(h => h[0] === r && h[1] === c); ok(isH ? rows[r][c] === '?' : +rows[r][c] === opv(f.op, a, b), at + ' 칸 ' + r + ',' + c); }));
    (f.bands || []).forEach(b => b[0].forEach(p => ok(p[0] < f.rh.length && p[1] < f.ch.length, at + ' 띠 자리')));
    if (prob) { const hs = f.holes || [];
      if (hs.length === 1 && /얼마/.test(q)) out.push({ n: opv(f.op, f.rh[hs[0][0]], f.ch[hs[0][1]]) });
      else if (opts && (f.bands || []).length === 1) { const vs = f.bands[0][0].map(p => opv(f.op, f.rh[p[0]], f.ch[p[1]])), dd = vs[1] - vs[0]; ok(arith(vs), at + ' 띠 같은 차이');
        out.push({ o: (t) => ok(dd === 0 ? /모두 같/.test(t) : new RegExp('^' + Math.abs(dd) + '씩 ' + (dd > 0 ? '커' : '작아')).test(t), at + ' 띠 규칙 「' + t + '」 ≠ ' + dd) }); }
      else if (opts && /어떤 수/.test(q)) { const all = f.rh.flatMap(a => f.ch.map(b => opv(f.op, a, b))); const kind = all.every(v => v % 2) ? '모두 홀수' : all.every(v => v % 2 === 0) ? '모두 짝수' : '섞여'; out.push({ o: (t) => ok(t.indexOf(kind) >= 0, at + ' 「' + t + '」 ≠ ' + kind) }); } } }
  if (f.k === 'ntab2') { ok(el().querySelector('svg[data-numtab]'), at + ' 렌더'); f.vals.forEach(r => ok(arith(r), at + ' 줄 같은 차이 ' + r)); const nc = f.vals[0].length; ok(f.vals.every(r => r.length === nc), at + ' 칸 수'); for (let c = 0; c < nc; c++) ok(arith(f.vals.map(r => r[c])), at + ' 세로 같은 차이');
    if (prob) { const hs = f.holes || [], bd = f.band || [];
      if (hs.length === 1 && /얼마/.test(q)) out.push({ n: f.vals[hs[0][0]][hs[0][1]] });
      else if (bd.length === 1 && /몇 번/.test(q)) out.push({ n: f.vals[bd[0][0]][bd[0][1]] });
      else if (opts) { const dr = f.vals[0][1] - f.vals[0][0], dc = f.vals[1][0] - f.vals[0][0];
        out.push({ o: (t) => { const m = t.match(/^(→|↓) 방향으로 (\d+)씩 (커|작아)집니다/); ok(m, at + ' 보기 꼴 ' + t); const d = m[1] === '→' ? dr : dc; ok(+m[2] === Math.abs(d) && (m[3] === '커') === (d > 0), at + ' 「' + t + '」 ≠ ' + d); } }); } } }
  if (f.k === 'mcal2') { ok(f.first >= 0 && f.first <= 6 && f.days >= 28 && f.days <= 31, at + ' 달력'); ok(el().querySelector('svg[data-mcal]'), at + ' 렌더'); const bd = f.band || [];
    if (bd.length) ok(bd.every((d, i) => !i || d - bd[i - 1] === 7) && bd[0] <= 7 && bd[bd.length - 1] + 7 > f.days, at + ' 띠 = 같은 요일 전부');
    if (prob) { const hs = f.holes || []; if (hs.length === 1 && /며칠일/.test(q)) out.push({ n: hs[0] }); else if (/며칠마다/.test(q)) out.push({ n: bd[1] - bd[0] }); else if (opts && /↓/.test(q)) out.push({ o: (t) => ok(/^7씩 커/.test(t), at + ' ↓ ' + t) }); } }
  if (f.k === 'spin2') { ok(el().querySelector('svg[data-spin]'), at + ' 렌더'); const n = f.n, mk = f.marks, sgn = f.dir === 'ccw' ? -1 : 1; ok(mk.length >= 2, at + ' 판 둘 이상');
    const steps = mk.slice(1).map((m, i) => ((sgn * (m - mk[i])) % n + n) % n), k = steps[0]; ok(steps.every(s => s === k) && k >= 1 && k <= n / 2, at + ' ' + f.dir + ' 같은 칸씩 ' + steps);
    if (prob) { if (/몇 칸씩/.test(q)) out.push({ n: k });
      else if (opts && /어느 쪽/.test(q)) out.push({ o: (t) => { ok(t.indexOf(f.dir === 'ccw' ? '시계 반대 방향' : '시계 방향') === 0 && (f.dir === 'ccw' || t.indexOf('반대') < 0), at + ' 방향 ' + t); if (/칸씩/.test(t)) ok(t.indexOf(['', '한', '두', '세'][k] + ' 칸씩') >= 0, at + ' 칸 수 ' + t); } });
      else if (opts) { ok(n === 4, at + ' 4칸 판만'); const nx = ((mk[mk.length - 1] + sgn * k) % n + n) % n; out.push({ o: (t) => ok(t.indexOf(SPOS4[nx]) === 0, at + ' 다음 칸 「' + t + '」 ≠ ' + SPOS4[nx]) }); } } }
  if (f.k === 'cubep2') { const d = el().querySelector('svg[data-cubep]'); ok(d && d.getAttribute('data-cubep') === f.steps.map(s => s.length).join(','), at + ' 렌더 수'); ok(same(f.nums, f.steps.map((_, i) => String(i + 1))), at + ' 단계 번호');
    f.steps.forEach((cs, s) => cs.forEach(c => ok(c[0] === 0 || cs.some(x => x[0] === c[0] - 1 && x[1] === c[1]), at + ' 단계 ' + (s + 1) + ' 뜬 쌓기나무')));
    if (prob) { const cnt = f.steps.map(s => s.length), df = cnt.slice(1).map((x, i) => x - cnt[i]), nxt = df.every(x => x === df[0]) ? cnt[cnt.length - 1] + df[0] : (df.length >= 2 && arith(df) ? cnt[cnt.length - 1] + df[df.length - 1] + (df[1] - df[0]) : null);
      if (/세 번째 모양/.test(q)) out.push({ n: cnt[2] }); else if (/다음에 쌓을|네 번째/.test(q)) { ok(nxt != null, at + ' 다음 수'); out.push({ n: nxt }); }
      else if (opts && /노란/.test(q)) { const rel = f.steps.map(cs => { const r = cs.find(c => c[2] === 'red'), y = cs.find(c => c[2] === 'yel'); return y[0] > r[0] ? '위' : y[1] < r[1] ? '왼쪽' : '오른쪽'; }); const p = periodOf(rel), want = p && rel.length >= p + 1 ? atP(rel, p, rel.length) : (new Set(rel).size === rel.length ? rel[0] : null); ok(want, at + ' 노란 자리 되풀이'); out.push({ o: (t) => ok(t === want, at + ' 노란 자리 ' + t + ' ≠ ' + want) }); }
      else if (opts) { const hs = f.steps.map(cs => Math.max(...cs.map(c => c[0] + 1))); ok(arith(hs) && hs[1] - hs[0] === 1, at + ' 한 층씩'); out.push({ o: (t) => ok(t.indexOf((hs[hs.length - 1] + 1) + '층') >= 0, at + ' 다음 층 ' + t) }); } } }
  if (f.k === 'gdot2') { ok(el().querySelector('svg[data-grow]'), at + ' 렌더'); const cols = [...new Set(f.cells.map(c => c[0]))];
    cols.forEach(co => { const v = f.cells.filter(c => c[0] === co).map(c => c[1]); ok(arith(v) && (v.length < 2 || v[1] - v[0] === 1), at + ' ' + co + ' 하나씩 늘어남'); });
    if (cols.length === 2) ok(f.cells.every((c, i) => c[0] === cols[i % 2]), at + ' 색 번갈아');
    if (prob) { const nm = Object.keys(CN).find(k => q.indexOf(CN[k]) === 0 || q.indexOf(CN[k].replace('색', '')) >= 0 && q.indexOf(CN[k]) >= 0); const v = f.cells.filter(c => c[0] === nm).map(c => c[1]);
      if (/다음/.test(q)) out.push({ n: v[v.length - 1] + 1 }); else if (/모두/.test(q)) out.push({ n: v.reduce((a, b) => a + b, 0) }); } }
  if (f.k === 'objs1') ok(same(sf.items, f.items), at + ' 원문 카드');
  return out;
}
function ansCheck(want, d, opts, at) {
  if (!want.length) return 0; ok(want.length === 1, at + ' 그림 답 둘 이상');
  const w0 = want[0];
  if (w0.n != null) { ok(!d.options && +d.answer === w0.n, at + ' 답 ' + d.answer + ' ≠ ' + w0.n); return 1; }
  const ci = opts.findIndex(o => o.correct); ok(ci >= 0, at + ' 정답 없음'); w0.o(opts[ci].text.replace(/\*\*/g, '')); let others = 0; opts.forEach((o, i) => { if (i === ci) return; try { w0.o(o.text.replace(/\*\*/g, '')); others++; } catch (_) { } }); ok(!others, at + ' 다른 보기도 맞음'); return 1;
}
const srcProb = (src, d) => src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(QOVR[p.q] || p.q).replace(/\?$/, '') && (d.options ? same(d.options.map(o => o.text), p.opts) : String(d.answer) === String(p.a)));

T('A 로드 9차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === N); });
let eChecked = 0, stepChecked = 0, holeChecked = 0, advChecked = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 2 && les.meta.term === 2 && les.meta.unit === 6 && les.meta.n === i + 1 && les.meta.unit_title === '규칙 찾기'); ok(/^\[2수02-01\] .* · \[2수02-02\] /.test(les.meta.std), '성취기준 ' + les.meta.std); ok(fs.existsSync(path.resolve(TDIR, les.meta.live_url)), 'live_url ' + les.meta.live_url);
    ok(/^(단원 도입|개념|단원 평가|수학이랑 만들어요) · /.test(les.meta.lesson_format) && (i === 0) === /^단원 도입/.test(les.meta.lesson_format) && (i === 7) === /^단원 평가/.test(les.meta.lesson_format) && (i === 8) === /^수학이랑 만들어요/.test(les.meta.lesson_format), 'lesson_format ' + les.meta.lesson_format); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u5_l08.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(same(sl[1].data.items, prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g2s2_math:u5_l08' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = srcProb(src, d); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); else { ok(d.input === 'count_input' && d.unit === (p.unit || undefined), '단위 ' + d.unit); ok(/몇|얼마|며칠/.test(d.question), '수 답 물음에 「몇/얼마/며칠」 없음 ' + d.question); }
    ok(['pad', 'mcq'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문 문장·규칙 카드', () => { const titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => { const si = titles.indexOf(nsp(s.data.title)); ok(si >= 0, '원문에 없는 장 제목 ' + s.data.title); const ss = src.slides[si], lines = ss.text.split('\n').map(nsp).concat((ss.figs || []).filter(f => f.k === 'rcard').flatMap(f => f.lines.map(nsp)));
    const cl = s.data.content.split('\n'); ok(cl.length <= 4, '글 줄 ' + cl.length); cl.forEach(line => ok(lines.includes(nsp(line)), '원문에 없는 줄: ' + line));
    (ss.figs || []).filter(f => f.k === 'rcard').forEach(f => f.lines.forEach(l => ok(cl.map(nsp).includes(nsp(l)), '규칙 카드 줄 빠짐: ' + l))); }); });
  T(k + ' D 정리·예고·스스로 점검 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < N - 1) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/수학이랑 함께해요/.test(sl[18].data.preview), '다음 단원 예고');
    const selfL = src.slides.find(x => x.kind === '스스로 점검').text.split('\n').filter(l => l && !/^잘했어요/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '스스로 점검');
    if (src.goal && src.goal.length) ok(same(sl[16].data.arrows, src.goal.slice(0, 3)), '정리 화살표 = 원문 목표'); else ok(sl[16].data.arrows.length === 3, '화살표 셋'); });
  T(k + ' E 출구·수준별 재계산', () => { sl[15].data.items.forEach(it => { const c = check(it.q, it.a); ok(c, '셈 못 하는 출구 물음 ' + it.q); eChecked += c; }); ok(sl[15].data.items.length === 3, '출구 셋');
    Object.values(sl[11].data.levels).forEach(lv => { const c = check(lv.q, lv.a); ok(c, '셈 못 하는 수준별 물음 ' + lv.q); eChecked += c; stepChecked += stepEq(lv.steps.join(' | ')); ok(nsp(lv.steps[lv.steps.length - 1]).endsWith(nsp(lv.a)), '풀이 끝 = 답 ' + lv.q); }); });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[0].data, sl[1].data.content, sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[14].data.context, sl[15].data, sl[16].data.arrows || [], sl[17].data.prompts]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 개념 장 그림 = 원문 그 장', () => { sl.slice(3, 7).forEach((s, j) => { const ss = src.slides.find(x => nsp(x.title) === nsp(s.data.title)), pool = (ss.figs || []).filter(f => f.k !== 'rcard');
    ok(s.data.fig, 's' + (j + 4) + ' 그림 없음'); const fs2 = figsOf(s.data.fig); ok(fs2.length === pool.length, 's' + (j + 4) + ' 그림 수 ' + fs2.length + ' ≠ ' + pool.length); ok(!fs2.some(f => f.k === 'rcd2'), '규칙 카드는 글 줄로'); fs2.forEach(f => figCheck(f, pool, 's' + (j + 4) + ' 개념 ' + f.k, false)); }); });
  T(k + ' F 기본 문제 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data, p = srcProb(src, d), pool = (p && p.figs) || [];
    if (!pool.length) { ok(!d.fig, 's' + (j + 9) + ' 원문 문제에 없는 그림'); return; } ok(figsOf(d.fig).length === pool.length, 's' + (j + 9) + ' 그림 수');
    const want = figsOf(d.fig).flatMap(f => figCheck(f, pool, 's' + (j + 9) + ' ' + f.k, true, d.question, d.options)); const c0 = ansCheck(want, d, d.options || [], 's' + (j + 9) + ' ' + d.question); if (!c0 && process.env.DBG) console.log('    · 그림 답 없음 ' + k + ' s' + (j + 9) + ' ' + d.question); holeChecked += c0; }); });
  T(k + ' F 심화 문제 답 = 원문 그림에서 다시 낸 값', () => { const d = sl[14].data, p = src.problems.find(x => nsp(d.challenge).indexOf(nsp(QOVR[x.q] || x.q)) === 0); ok(p, '원문 응용 문제 없음 ' + d.challenge); ok(nsp(d.note).endsWith(nsp(String(p.opts ? p.opts[p.ci] : p.a + (p.unit ? ' ' + p.unit : '')))), '심화 풀이 끝 = 원문 답');
    const opts = p.opts ? p.opts.map((t, i) => ({ text: t, correct: i === p.ci })) : null, want = (p.figs || []).flatMap(f => { const g = Object.assign(JSON.parse(JSON.stringify(f)), { k: PK[f.k] }); ['holes', 'bands', 'band'].forEach(x => { if (Array.isArray(g[x]) && !g[x].length) delete g[x]; }); return figCheck(g, [f], '심화 ' + g.k, true, QOVR[p.q] || p.q, opts); });
    const c1 = ansCheck(want, { answer: p.a, options: opts }, opts || [], '심화 ' + p.q); if (!c1 && process.env.DBG) console.log('    · 심화 그림 답 없음 ' + k + ' ' + p.q); advChecked += c1; });
  T(k + ' F 원문 그림 전부 = 규칙', () => { srcFigs.forEach((f, j) => { if (!PK[f.k]) { ok(f.k === 'rcard', '모르는 원문 그림 ' + f.k); return; } const g = Object.assign(JSON.parse(JSON.stringify(f)), { k: PK[f.k] }); ['holes', 'bands', 'band'].forEach(x => { if (Array.isArray(g[x]) && !g[x].length) delete g[x]; }); figCheck(g, [f], 'src#' + j + ' ' + g.k, false); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '규칙 찾기', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '규칙 찾기', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '규칙 찾기', classNames: [] }); ok(/pa2|pv3|ch2|pf2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
const EXP = { e: 54, hole: 27, adv: 9 };
console.log('  · 출구·수준별 재계산 ' + eChecked + ' 물음 · 풀이 식 ' + stepChecked + ' · 기본 문제 그림 답 ' + holeChecked + ' · 심화 그림 답 ' + advChecked);
T('E·F 셈·대조 수', () => { ok(eChecked === EXP.e, '셈 ' + eChecked); ok(holeChecked === EXP.hole, '기본 ' + holeChecked); ok(advChecked === EXP.adv, '심화 ' + advChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g2s2_math_u6.js'), 'utf8').replace(/"(live_url|source)":\s*"[^"]*"/g, '');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결(파일 이름 칸 빼고)', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('1, 5, 9 다음에 올 수는 얼마일까요?') === '13' && solve('12, 9, 6 다음에 올 수는 얼마일까요?') === '3' && solve('1, 2, 3, 2, 1, 2, 3 다음에 올 수는 얼마일까요?') === '2', '다음 수');
  ok(solve('쿵, 쿵, 짝, 쿵, 쿵, 짝, 쿵 다음에 올 소리는 무엇일까요?') === '쿵' && solve('쿵, 타, 리가 되풀이되면 10번째에 올 소리는 무엇일까요?') === '쿵', '소리');
  ok(solve('곱셈표에서 왼쪽 수 7과 위쪽 수 8이 만나는 칸의 수는 얼마일까요?') === '56' && solve('5일이 목요일이면 다음 목요일은 며칠일까요?') === '12일', '표·달력'); });
T('역검증 셈·조사·그림', () => { let e = 0;
  const bad = [['2, 4, 6, 8 다음에 올 수는 얼마일까요?', '9'], ['빨강, 파랑, 빨강, 파랑 다음에 올 색는 무엇일까요?', '빨강'], ['덧셈표에서 왼쪽 수 3과 위쪽 수 4가 만나는 칸의 수는 얼마일까요?', '12'], ['곱셈표에서 왼쪽 수 3와 위쪽 수 4가 만나는 칸의 수는 얼마일까요?', '12'],
    ['2개, 4개, 6개로 늘어나면 다음에는 몇 개일까요?', '7개'], ['달력에서 3일 바로 아래 칸은 며칠일까요?', '4일'], ['5일이 금요일이면 다음 금요일은 며칠일까요?', '12일'], ['6칸 돌림판에서 시계 방향으로 한 번에 2칸씩 돌면, 몇 번 돌아야 처음 자리로 돌아올까요?', '2번'], ['쿵, 타, 리가 되풀이되면 10번째에 올 소리는 무엇일까요?', '리'], ['1, 2, 3 다음에 올 수는 얼마일까요?', '3']];
  bad.forEach(([q, a]) => { try { check(q, a); if (process.env.DBG) console.log('    · 못 잡음 ' + q); } catch (_) { e++; } });
  try { stepEq('16 + 5 = 22'); } catch (_) { e++; }
  ok(e === 11, '틀린 것 못 잡음 ' + e + '/11');
  ok(josa('4 가').length === 0 && josa('3과').length === 0 && josa('3와').length === 1, '조사 역검증');
  let c = 0; const P0 = { k: 'prow', cells: [['cir', 'red'], ['cir', 'blu'], ['cir', 'red'], ['cir', 'blu'], ['cir', 'blu'], ['cir', 'blu']] };
  try { figCheck(Object.assign({}, P0, { k: 'prow2' }), [P0], 'x', false); } catch (_) { c++; } // 되풀이 깨짐
  const O0 = { k: 'optab', op: '+', rh: [1, 2], ch: [1, 2], holes: [[0, 1]], bands: [] };
  try { const w = figCheck({ k: 'optab2', op: '+', rh: [1, 2], ch: [1, 2], holes: [[0, 1]] }, [O0], 'x', true, '빈칸에 알맞은 수는 얼마일까요?'); ansCheck(w, { answer: 2 }, [], 'x'); } catch (_) { c++; } // 1 + 2 = 3
  const S0 = { k: 'spin', n: 4, marks: [0, 1, 3], dir: 'cw' };
  try { figCheck({ k: 'spin2', n: 4, marks: [0, 1, 3], dir: 'cw' }, [S0], 'x', false); } catch (_) { c++; } // 칸 이동이 다름
  const C0 = { k: 'cubep', steps: [[[1, 0, 'yel']]], nums: ['1'] };
  try { figCheck({ k: 'cubep2', steps: [[[1, 0, 'yel']]], nums: ['1'] }, [C0], 'x', false); } catch (_) { c++; } // 뜬 쌓기나무
  const B0 = { k: 'beat', cells: [['쿵', 4], ['짝', 1], ['쿵', 2], ['짝', 1]] };
  try { figCheck({ k: 'beat2', cells: B0.cells }, [B0], 'x', false); } catch (_) { c++; } // 같은 소리 다른 수
  const M0 = { k: 'mcal', first: 0, days: 31, holes: [], band: [1, 8, 16] };
  try { figCheck({ k: 'mcal2', first: 0, days: 31, band: [1, 8, 16] }, [M0], 'x', false); } catch (_) { c++; }
  try { figCheck({ k: 'prow2', cells: P0.cells.slice(0, 4) }, [P0], 'x', false); } catch (_) { c++; } // 원문과 다름
  ok(c === 7, '그림 역검증 ' + c + '/7'); });
console.log('gate_g2s2_math_u6: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
