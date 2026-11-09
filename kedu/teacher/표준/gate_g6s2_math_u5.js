/* gate_g6s2_math_u5.js — 6학년 2학기 수학 5단원 「원의 둘레와 넓이」 케이티처 2세대 게이트 (gate_g6s2_math_u3 틀 + 게이트 자체 원 셈 · N65).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(cpm5·cun5·cgd5·csq5·csr5·crg5·ckk5·cpl5·cmv5) · 잘못된 인자는 던짐 · B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음)
   D 복습 계보(l01 = 4단원 u4_l10 출구 · l02 … l10 = 직전 출구) · 4단원 마지막 장 예고 = 원의 둘레와 넓이
   E 정답 다시 셈 — 게이트 자체 셈(부품·생성기와 따로: BigInt 유리수 · 원주율 3.14 · 원주·지름·넓이·고리·반원·사분원·굴러간 거리·정다각형 비율·반지름 k배 · 모눈 칸 수)
     기본 문제 30 · 수준별 기본·도전 20(+ 풀이 끝 「= 답」) · 출구 30 · 넓히기 10 · 지식 답 표
   F 글 속 「… = …」 사슬 다시 셈(여러 항 · 곱셈·나눗셈 먼저 · 「…」 버림) · G 그림 — 부품마다 data-* 값 = 게이트 셈 · ask 면 답 숨김 · cll 식 = 게이트 셈 · 검사기 자체 확인
   H 재료 충실(개념 = 원문 장 또는 meta.concept_src 지도서 쪽 · 기본 문제 = 원문 · 다음 시간 = 원문) · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원(6단원 원기둥, 원뿔, 구)
   L 선행(원주율 l03 — l01 단원 도입·다음 시간 예고 예외) · M 차단 어휘 · 「결」 0 · 인물 0(원문 달곰이·순달이·여울이, 교과서 세호·지윤)
   실행: NODE_PATH=<jsdom> node kedu/teacher/표준/gate_g6s2_math_u5.js */
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
const L = load(path.join(TDIR, 'data/g6s2_math_u5.js'));
const U4F = path.join(TDIR, 'data/g6s2_math_u4.js'); const L4 = fs.existsSync(U4F) ? load(U4F) : null;
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g6s2_math_u5.json'), 'utf8'));
const SK = { u5_l01: 'u5_l01', u5_l02: 'u5_l02', u5_l03: 'u5_l03', u5_l04: 'u5_l04', u5_l05: 'u5_l05', u5_l06: 'u5_l06', u5_l07: 'u5_l07', u5_l08: null, u5_l09: 'u5_l08', u5_l10: 'u5_l09' };
const KEYS = Array.from({ length: 10 }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '원의 둘레와 넓이', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 셈 (부품의 BigInt 소수와 따로: 분수 [분자, 분모] 유리수) ── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; };
const R = (n, d) => { if (d === 0n) throw new Error('0으로 나눔'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
function num(s) { s = String(s).trim(); let m; if ((m = s.match(/^(\d+)\/(\d+)$/))) return R(BigInt(m[1]), BigInt(m[2])); if (!/^\d+(\.\d+)?$/.test(s)) throw new Error('수 아님 ' + s); const i = s.indexOf('.'); return i < 0 ? R(BigInt(s), 1n) : R(BigInt(s.replace('.', '')), 10n ** BigInt(s.length - i - 1)); }
const add = (a, b) => R(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), sub = (a, b) => R(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => R(a[0] * b[0], a[1] * b[1]), div = (a, b) => R(a[0] * b[1], a[1] * b[0]);
const eqR = (a, b) => a[0] === b[0] && a[1] === b[1];
function dec(r, maxd) { let [n, d] = r; let k = 0; while (k <= (maxd || 8)) { if ((n * 10n ** BigInt(k)) % d === 0n) { const v = n * 10n ** BigInt(k) / d; let s = (v < 0n ? -v : v).toString(); if (k) { while (s.length <= k) s = '0' + s; s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); s = s.replace(/0+$/, '').replace(/\.$/, ''); } return (v < 0n ? '-' : '') + s; } k++; } return null; }
function cut(r, k) { const v = r[0] * 10n ** BigInt(k) / r[1]; let s = v.toString(); if (k) { while (s.length <= k) s = '0' + s; s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); } return s; }
const dpOf = (s) => { const i = String(s).indexOf('.'); return i < 0 ? 0 : String(s).length - i - 1; };
const PI = num('3.14'), TWO = num('2');
const CIRC = (d) => mul(num(d), PI), AREA = (r) => mul(mul(num(r), num(r)), PI);
const sqrtR = (r) => { for (let i = 1n; i < 2000n; i++) { if (eqR(R(i * i, 1n), r)) return R(i, 1n); } return null; };
function grid(r) { let a = 0, b = 0; for (let i = -r; i < r; i++) for (let j = -r; j < r; j++) { const fx = Math.max(Math.abs(i), Math.abs(i + 1)), fy = Math.max(Math.abs(j), Math.abs(j + 1)); if (fx * fx + fy * fy <= r * r) a++; const nx = i > 0 ? i : (i + 1 < 0 ? i + 1 : 0), ny = j > 0 ? j : (j + 1 < 0 ? j + 1 : 0); if (nx * nx + ny * ny < r * r) b++; } return [a, b]; }
function matchVal(ans, r) { const t = String(ans).replace(/\*\*/g, '').replace(/\s*(배|칸|바퀴|cm²|m²|cm|m)$/, '').trim(); if (/…$/.test(t)) { const c = t.slice(0, -1); return cut(r, dpOf(c)) === c && !eqR(num(c), r); } try { return eqR(num(t), r); } catch (e) { return false; } }

let nCheck = 0; const badE = [];
const E1 = (where, cond, msg) => { nCheck++; if (!cond) badE.push(where + ' ' + msg); };
const N_ = '(\\d+(?:\\.\\d+)?)';
const rx = (s) => new RegExp(s.replace(/N/g, N_));
// 물음 하나 다시 셈 — { r } 유리수, 못 읽으면 null
function solve(q) {
  const t = clean(q); let m;
  if ((m = t.match(rx('원주가 N ?cm, 지름이 N ?cm인 원의 \\(원주\\) ÷ \\(지름\\)')))) return { r: div(num(m[1]), num(m[2])) };
  if ((m = t.match(rx('반지름이 N ?cm인 원 안쪽에 맞닿는 정[가-힣]+의 둘레가 N ?cm')))) return { r: div(num(m[2]), mul(num(m[1]), TWO)) };
  if ((m = t.match(rx('반지름이 N ?cm ?인 원 안에 완전히|반지름이 N ?cm ?인 원.*걸친 칸까지')))) { const r = +(m[1] || m[2]); return /걸친/.test(t) ? { r: R(BigInt(grid(r)[1]), 1n) } : { r: R(BigInt(grid(r)[0]), 1n) }; }
  if ((m = t.match(rx('(?<!반)지름이 N ?cm ?인 원 안에 꼭 맞는 정육각형')))) return { r: mul(num(m[1]), num('3')) };
  if ((m = t.match(rx('(?<!반)지름이 N ?cm ?인 원 밖에 꼭 맞는 정사각형')))) return { r: mul(num(m[1]), num('4')) };
  if ((m = t.match(rx('반지름이 N ?cm ?인 원 (안|밖)에 꼭 맞는 정사각형')))) return { r: mul(mul(num(m[1]), num(m[1])), num(m[2] === '안' ? '2' : '4')) };
  if ((m = t.match(rx('반지름이 N ?cm ?인 원에서 반지름이 N ?cm ?인 원을 뺀')))) return { r: sub(AREA(m[1]), AREA(m[2])) };
  if ((m = t.match(rx('반지름이 N ?(?:cm|m) ?인 (반원|사분원)')))) return { r: div(AREA(m[1]), num(m[2] === '반원' ? '2' : '4')) };
  if ((m = t.match(rx('(?<!반)지름이 N ?cm ?인 [가-힣 ]*(?:굴렁쇠|원판)[을를]? (\\d+)바퀴')))) return { r: mul(CIRC(m[1]), num(m[2])) };
  if ((m = t.match(rx('(?<!반)지름이 N ?cm ?인 [가-힣 ]*바퀴가 한 바퀴')))) return { r: CIRC(m[1]) };
  if ((m = t.match(rx('(?:둘레|원주)가 N ?m ?(?:이고|예요|인)?.*다리의 길이')))) return { r: div(num(m[1]), PI) };
  if ((m = t.match(rx('원주가 N ?m ?인 원.*줄의 길이')))) return { r: div(div(num(m[1]), PI), TWO) };
  if ((m = t.match(rx('원주가 N ?cm ?인 원의 넓이')))) { const rr = div(div(num(m[1]), PI), TWO); return { r: mul(mul(rr, rr), PI) }; }
  if ((m = t.match(rx('(?:원주가|원주를 재었더니|둘레가|길이가) \\**N\\** ?(?:cm|m)[^?]*?(지름|반지름)')))) { const d = div(num(m[1]), PI); return { r: m[2] === '반지름' ? div(d, TWO) : d }; }
  if ((m = t.match(rx('(?<!반)지름이 \\**N ?(?:cm|m)\\** ?인 원의 \\**원주')))) return { r: CIRC(m[1]) };
  if (/^같은 모눈에서 원에 걸친 칸까지/.test(t)) return { r: R(BigInt(grid(5)[1]), 1n) };   // 앞 문제(반지름 5 cm 모눈)에 이어지는 원문 물음
  if ((m = t.match(rx('반지름이 \\**N ?cm\\** ?인 원의 \\**원주')))) return { r: mul(CIRC(m[1]), TWO) };
  if ((m = t.match(rx('반지름이 N ?cm ?인 원의 넓이는 반지름이 N ?cm ?인 원의 넓이의 몇 배')))) { const k = div(num(m[1]), num(m[2])); return { r: mul(k, k) }; }
  if ((m = t.match(rx('반지름이 N배가? (?:되면|될 때)[^?]*넓이는 몇 배')))) return { r: mul(num(m[1]), num(m[1])) };
  if ((m = t.match(rx('(?<!반)지름이 N배가 될 때 \\**원주\\**는 몇 배')))) return { r: num(m[1]) };
  if ((m = t.match(rx('직사각형 종이[^?]*가로가? N ?cm, 세로가? N ?cm|가로가? N ?cm, 세로가? N ?cm ?인 직사각형 종이[^?]*가장 큰 원')))) { const a = num(m[1] || m[3]), b = num(m[2] || m[4]); const s = a[0] * b[1] < b[0] * a[1] ? a : b; const rr = div(s, TWO); return { r: mul(mul(rr, rr), PI) }; }
  if ((m = t.match(rx('반지름이 \\**N ?cm\\** ?인 원(?: 모양 [가-힣]+)?(?:이 있어요\\. 이 [가-힣]+)?의 \\**넓이')))) return { r: AREA(m[1]) };
  if ((m = t.match(rx('(?<!반)지름이 N ?cm ?인 원의 \\**넓이')))) return { r: AREA(dec(div(num(m[1]), TWO))) };
  if ((m = t.match(rx('(?<!반)지름[은이] \\**N ?(?:cm|m)\\** ?(?:예요|인)[^?]*\\**반지름')))) return { r: div(num(m[1]), TWO) };
  if ((m = t.match(rx('반지름이 \\**N ?(?:cm|m)\\** ?인 원의 \\**지름')))) return { r: mul(num(m[1]), TWO) };
  if ((m = t.match(rx('한 변이 N ?cm ?인 정사각형[^?]*(둘레|넓이)')))) return { r: m[2] === '둘레' ? mul(num(m[1]), num('4')) : mul(num(m[1]), num(m[1])) };
  if ((m = t.match(rx('두 대각선이 N ?cm, N ?cm ?인 마름모')))) return { r: div(mul(num(m[1]), num(m[2])), TWO) };
  if ((m = t.match(rx('가로가? N ?cm, 세로가? N ?cm ?인 직사각형')))) return { r: mul(num(m[1]), num(m[2])) };
  return null;
}
// 지식 답(셈이 아닌 답) — 게이트가 따로 들고 있는 표
const KNOW = {
  '원의 중심을 지나도록 원 위의 두 점을 이은 선분을 무엇이라고 할까요?': '지름', '원의 둘레를 무엇이라고 할까요?': '원주', '원주는 지름의 몇 배보다 길고 몇 배보다 짧을까요?': '3배보다 길고 4배보다 짧아요',
  '원의 지름에 대한 원주의 비율을 무엇이라고 할까요?': '원주율', '지름이 길어지면 원주율은 어떻게 될까요?': '변하지 않아요',
  '반지름이 5 cm인 원에서 원 안에 완전히 들어간 모눈 칸이 60칸, 걸친 칸까지 88칸이에요. 원의 넓이는 몇 cm²보다 넓고 몇 cm²보다 좁을까요?': '60 cm²보다 넓고 88 cm²보다 좁아요', '원의 넓이는 (반지름) × (반지름)의 약 몇 배일까요?': '약 3배',
  '원을 한없이 잘라서 이어 붙인 직사각형의 세로는 원의 무엇과 같을까요?': '반지름', '원을 잘라 다른 자리로 옮겨 붙이면 넓이는 어떻게 될까요?': '변하지 않아요',
  '원 안에 꼭 맞는 정육각형의 둘레는 원의 지름의 몇 배일까요?': '3배', '원 안쪽에 맞닿는 정다각형의 변의 수가 늘어날수록 정다각형은 어떤 모양에 가까워질까요?': '원', '원 안쪽에 맞닿는 정다각형의 (둘레) ÷ (지름)은 원주율보다 클까요, 작을까요?': '작아요'
};

console.log('═══ A. 로드 ═══');
T('10차시 키 u5_l01~l10 · 파일 data/g6s2_math_u5.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 · 5단원 원의 둘레와 넓이 · [6수03-15][6수03-16] · live_url 실파일(l08 = 원문 없음, 지도서) · 40분 · 쪽', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 6 && m.term === 2 && m.unit === 5 && m.subject === '수학' && m.unit_title === '원의 둘레와 넓이' && /6수03-15/.test(m.std) && /6수03-16/.test(m.std) && m.n === +k.slice(-2), k); ok(m.duration_min === 40, k + ' 40분'); ok(/『수학』 \d+~\d+쪽/.test(m.pages), k + ' 쪽');
  if (SK[k]) { ok(fs.existsSync(path.join(TDIR, m.live_url)) || (process.env.KEDU_REPO && fs.existsSync(path.join(process.env.KEDU_REPO, 'kedu/teacher', m.live_url))), k + ' live_url ' + m.live_url); ok(m.source.endsWith(SRC[SK[k]].file), k + ' source'); } else ok(!m.live_url && /지도서 304~305 · 334~335/.test(m.source), k + ' 원문 없음 표시'); }));
T('slug — KT2.slugOf({g:6,s:math,t:2}) = g6s2_math', () => ok(KT2.slugOf({ g: 6, s: 'math', t: '2' }) === 'g6s2_math', 'slug'));
T('그림 부품 9종 등록 · 잘못된 인자는 던짐', () => {
  [{ k: 'cpm5', d: 6 }, { k: 'cun5', d: 80 }, { k: 'cgd5', r: 5 }, { k: 'csq5', r: 10 }, { k: 'csr5', n: 8 }, { k: 'crg5', radii: [1, 4, 7, 10], hi: 3 }, { k: 'ckk5', r: 10, ks: [1, 2, 3] }, { k: 'cpl5', r: 5, items: [[4, '28.28']] }, { k: 'cmv5', r: 5 }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'cpm5', d: 'x' }, { k: 'cpm5', d: 6, ask: 'zz' }, { k: 'cun5', d: '0' }, { k: 'cgd5', r: 1 }, { k: 'cgd5', r: 5.5 }, { k: 'csq5', r: -1 }, { k: 'csr5', n: 5 }, { k: 'crg5', radii: [4, 1] }, { k: 'crg5', radii: [1] }, { k: 'ckk5', r: 10, ks: [2, 3] }, { k: 'cpl5', r: 5, items: [[4, '40']] }, { k: 'cpl5', r: 5, items: [[5, '20']] }, { k: 'cmv5', r: 'a' }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 13, '던짐 ' + th + '/13'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 10종 서로 다름 · 5-2 수학·6-2 다른 단원 2세대와 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 10, im.join(',')); const other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g5s2_math_u\d\.js$/.test(f) || /^g6s2_math_u[1234 6]\.js$/.test(f)).forEach(f => Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => s.data && s.data.img && other.push(s.data.img)))); ok(!im.some(x => other.indexOf(x) >= 0), '다른 단원과 겹침'); });
T('활동 갈래 — 짝·모둠·전체가 섞임 · l08 공학 도구 = 짝 12분', () => { const ty = KEYS.map(k => L[k].slides[12].data.type); ok(new Set(ty).size >= 3, ty.join(',')); ok(L.u5_l08.slides[12].data.type === 'pair' && L.u5_l08.slides[12].data.minutes === 12, 'l08'); });

console.log('═══ D. 복습 계보 ═══');
ok(L4 && L4.u4_l10, '4단원 데이터 g6s2_math_u4 · u4_l10');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '4단원 u4_l10') + ' 출구', () => { const rv = L[k].slides[1].data;
  const ex = i ? L[KEYS[i - 1]].slides[15].data.items : L4.u4_l10.slides[15].data.items; ok(rv.from === (i ? KEYS[i - 1] : 'g6s2_math:u4_l10'), 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); if (!i) ok(/지난 단원/.test(rv.title) && /비례식과 비례배분/.test(rv.content), 'l01 제목·글'); }));
T('4단원 마지막 장 예고 = 5단원 원의 둘레와 넓이', () => ok(/원의 둘레와 넓이/.test(L4.u4_l10.slides[18].data.preview), '4단원 예고'));
T('진단 평가 394~395 세 문항 셈(4단원 데이터가 없을 때 쓰던 이음) 게이트 셈과 같음', () => [['반지름이 5 cm인 원의 지름은 몇 cm일까요?', '10'], ['한 변이 4 cm인 정사각형의 넓이는 몇 cm²일까요?', '16'], ['두 대각선이 10 cm, 14 cm인 마름모의 넓이는 몇 cm²일까요?', '70']].forEach(([q, a]) => { const sv = solve(q); ok(sv && matchVal(a, sv.r), q); }));

console.log('═══ E. 정답 다시 셈 ═══');
const unsolved = [];
KEYS.forEach(k => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, got = d.options ? d.options.find(o => o.correct).text : String(d.answer), sv = solve(d.question);
    if (!sv) { unsolved.push(k + ' ' + s.id + ' ' + clean(d.question).slice(0, 30)); return; } E1(k + ' ' + s.id, matchVal(got, sv.r), '기본 ' + got + ' ≠ ' + (dec(sv.r) || cut(sv.r, 3))); });
  const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => { const x = lv[t], sv = solve(x.q); if (!sv) { E1(k + ' ' + t, false, '수준별 못 읽음 ' + x.q); return; } E1(k + ' ' + t, matchVal(x.a, sv.r), '수준별 ' + x.a + ' ≠ ' + dec(sv.r)); E1(k + ' ' + t + ' 풀이 끝', nsp(x.steps[x.steps.length - 1]).replace(/^=/, '') === nsp(x.a), '풀이 끝 ≠ 답'); });
  sl[15].data.items.forEach((x, j) => { const sv = KNOW[clean(x.q)] !== undefined ? null : solve(x.q); if (sv) E1(k + ' 출구' + j, matchVal(x.a, sv.r), '출구 ' + x.a + ' ≠ ' + dec(sv.r)); else { E1(k + ' 출구' + j, KNOW[clean(x.q)] !== undefined, '못 읽고 지식 표에도 없음: ' + x.q); E1(k + ' 출구' + j, KNOW[clean(x.q)] === x.a, '지식 답 ' + x.a); } });
});
// 넓히기 — 여러 단계라 게이트가 단계를 따로 셈
const ADV = { u5_l01: () => mul(num('16'), num('4')), u5_l02: () => div(num('42'), num('7')), u5_l03: () => div(num('25.12'), num('6.28')), u5_l04: () => mul(CIRC('20'), num('10')),
  u5_l05: () => sub(mul(num('20'), num('20')), div(mul(num('20'), num('20')), TWO)), u5_l06: () => AREA('4.5'), u5_l07: () => add(mul(num('35'), num('20')), AREA('10')), u5_l08: () => sub(div(num('31.24'), num('10')), div(num('31.08'), num('10'))),
  u5_l09: () => sub(AREA('20'), AREA('10')), u5_l10: () => sub(mul(num('20'), num('20')), AREA('10')) };
KEYS.forEach(k => { const d = L[k].slides[14].data, m = d.note.match(/\*\*([\d.]+)\*\*/); E1(k + ' 넓히기', m && matchVal(m[1], ADV[k]()), '넓히기 ' + (m && m[1])); });
T('기본·수준별·출구·넓히기 정답 = 게이트 셈 (' + nCheck + ') 틀림 0', () => ok(!badE.length, badE.slice(0, 8).join(' | ')));
T('기본 문제 셈으로 못 읽는 것 ≤ 10 (지식·까닭·어림 물음) — ' + unsolved.length, () => ok(unsolved.length <= 10, unsolved.join(' | ')));
T('다시 셈 수 ≥ 80', () => ok(nCheck >= 80, nCheck));
T('수준별 심화 = 열린 답 · 기본/도전 답 서로 다름', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; ok(lv.심화.open, k); ok(lv.기본.q !== lv.도전.q, k); }));
T('게이트 셈 자체 확인 — 지름 80 → 251.2 · 반지름 11 → 379.94 · 157 ÷ 3.14 = 50 · 모눈 반지름 5 → 60·88 · 고리 10/7 → 160.14 · 31.24 ÷ 10 = 3.124', () => {
  ok(dec(CIRC('80')) === '251.2' && dec(AREA('11')) === '379.94' && dec(div(num('157'), PI)) === '50' && SAME(grid(5), [60, 88]) && dec(sub(AREA('10'), AREA('7'))) === '160.14' && dec(div(num('31.24'), num('10'))) === '3.124', '셈');
  ok(matchVal('251.2 cm', CIRC('80')) && !matchVal('251.3', CIRC('80')) && matchVal('9배', num('9')), '견주기'); const sv = solve('반지름이 6 cm인 원의 원주는 몇 cm일까요?'); ok(sv && dec(sv.r) === '37.68', '반지름 → 원주'); });

console.log('═══ F. 식 전수 ═══');
const NUM = '\\d+(?:\\.\\d+)?(?:\\/\\d+)?…?'; const EX = '(?:' + NUM + '(?:\\s*[÷×+−]\\s*' + NUM + ')*)';
const CHAIN = new RegExp('(?<![\\d./×÷+−])(?<![÷×+−] )(' + EX + ')((?:\\s*=\\s*' + EX + ')+)(?![\\d/.])', 'g');
let nEq = 0; const badEq = [];
function evx(e) { e = e.trim(); const tok = e.split(/\s*([÷×+−])\s*/); if (tok.some(x => /…$/.test(x))) return tok.length === 1 ? { lng: tok[0].slice(0, -1) } : null;
  const vals = [num(tok[0])], ops = []; for (let i = 1; i < tok.length; i += 2) { ops.push(tok[i]); vals.push(num(tok[i + 1])); }
  const v2 = [vals[0]], o2 = []; ops.forEach((op, i) => { if (op === '×') v2[v2.length - 1] = mul(v2[v2.length - 1], vals[i + 1]); else if (op === '÷') v2[v2.length - 1] = div(v2[v2.length - 1], vals[i + 1]); else { o2.push(op); v2.push(vals[i + 1]); } });
  let r = v2[0]; o2.forEach((op, i) => { r = op === '+' ? add(r, v2[i + 1]) : sub(r, v2[i + 1]); }); return { r }; }
function eqText(t, where) { t = String(t).replace(/\*\*/g, ''); let m; CHAIN.lastIndex = 0; while ((m = CHAIN.exec(t))) { const parts = [m[1]].concat(m[2].split('=').slice(1)); let vals; try { vals = parts.map(evx); } catch (e) { continue; }
  const exact = vals.find(v => v && v.r); if (!exact) continue; for (const v of vals) { if (!v) continue; nEq++; const good = v.r ? eqR(v.r, exact.r) : (cut(exact.r, dpOf(v.lng)) === v.lng && !dec(exact.r, dpOf(v.lng))); if (!good) badEq.push(where + ' 「' + m[0] + '」'); } } }
KEYS.forEach(k => L[k].slides.forEach(s => { const d = s.data; const txts = [];
  ['content', 'note', 'question', 'context', 'challenge', 'right', 'wrong', 'desc', 'preview'].forEach(f => d[f] && txts.push(d[f])); if (d.levels) Object.values(d.levels).forEach(l => { txts.push(l.q, l.a); (l.steps || []).forEach(x => txts.push(x)); });
  if (d.points) d.points.forEach(x => txts.push(x)); if (d.scenario) txts.push(d.scenario.body); if (d.items && s.block !== 'self_assessment') d.items.forEach(x => txts.push(x.q || x, x.a || '')); if (d.steps) d.steps.forEach(x => txts.push(x));
  txts.forEach(x => eqText(x, k + ' ' + s.id)); }));
KEYS.forEach(k => L[k].extras.forEach(e => eqText(e.content || e.description || '', k + ' ' + e.id)));
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 60', () => ok(!badEq.length && nEq >= 60, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 — 여러 항·소수·「…」)', () => { const b0 = badEq.length; ['80 × 3.14 = 251.3', '10 × 10 × 3.14 − 7 × 7 × 3.14 = 160.41', '66 ÷ 21 = 3.143…', '20 × 20 − 314 = 85'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 4, '틀린 식 못 잡음 ' + (badEq.length - b0)); badEq.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s.data]); }));
const nG = {};
const dat = (doc, key) => doc.querySelector('[data-' + key + ']').getAttribute('data-' + key).split('|');
const txtOf = (doc, cls) => [...doc.querySelectorAll('.' + cls)].map(x => x.textContent);
function checkFig(where, f, block, d) {
  const h = FIG.render(f); ok(h && h.length > 80 && !/NaN|undefined/.test(h), where + ' 렌더'); nG[f.k] = (nG[f.k] || 0) + 1; const doc = docOf(h);
  if (f.k === 'cpm5') { const v = dat(doc, 'cpm5'); if (f.d != null) { ok(v[1] === dec(mul(num(f.d), num('3'))) && v[2] === dec(mul(num(f.d), num('4'))), where + ' 둘레 ' + v.join('|')); if (f.ask) ok(txtOf(doc, 'cpm-' + (f.ask === 'hex' ? 'h' : 's')).join('').indexOf(f.ask === 'hex' ? v[1] : v[2]) < 0, where + ' ask 인데 답이 보임'); } else ok(!v[1] && !v[2], where + ' 수 없는 꼴'); }
  if (f.k === 'cun5') { const v = dat(doc, 'cun5'); if (f.d != null) { ok(v[1] === dec(CIRC(f.d)), where + ' 원주 ' + v[1]); if (f.ask) ok(txtOf(doc, 'cun-h').join('').indexOf(v[1]) < 0, where + ' ask 인데 원주 보임'); } }
  if (f.k === 'cgd5') { const v = dat(doc, 'cgd5'), g = grid(+f.r); ok(+v[1] === g[0] && +v[2] === g[1], where + ' 칸 ' + v.join('|') + ' ≠ ' + g); if (f.ask === 'in') ok(txtOf(doc, 'cgd-a').join('').indexOf(String(g[0])) < 0 && txtOf(doc, 'cgd-r').join('').indexOf(String(g[0])) < 0, where + ' ask in'); if (f.ask === 'out') ok(txtOf(doc, 'cgd-b').join('').indexOf(String(g[1])) < 0 && txtOf(doc, 'cgd-r').join('').indexOf(String(g[1])) < 0, where + ' ask out'); }
  if (f.k === 'csq5') { const v = dat(doc, 'csq5'); if (f.r != null) { const rr = mul(num(f.r), num(f.r)); ok(v[1] === dec(mul(rr, TWO)) && v[2] === dec(mul(rr, num('4'))), where + ' 넓이 ' + v.join('|')); if (f.ask) ok(txtOf(doc, 'csq-' + f.ask).join('').indexOf(v[f.ask === 'lo' ? 1 : 2]) < 0 && txtOf(doc, 'csq-r').join('').indexOf(v[f.ask === 'lo' ? 1 : 2] + ' cm²') < 0, where + ' ask 인데 답 보임'); } }
  if (f.k === 'csr5') { const v = dat(doc, 'csr5'); ok(+v[0] === f.n, where + ' 등분'); if (f.r != null) { ok(v[2] === dec(mul(num(f.r), PI)) && v[3] === dec(AREA(f.r)), where + ' 가로·넓이 ' + v.join('|')); if (f.ask === 'a') ok(txtOf(doc, 'csr-a').join('').indexOf(v[3]) < 0, where + ' ask a'); } }
  if (f.k === 'crg5') { const v = dat(doc, 'crg5'), rs = f.radii.map(String), parts = rs.map((x, i) => dec(i ? sub(AREA(x), AREA(rs[i - 1])) : AREA(x))); ok(v[1] === parts.join(','), where + ' 넓이 ' + v[1] + ' ≠ ' + parts.join(',')); if (f.ask) ok(txtOf(doc, 'crg-v').join('').indexOf(parts[f.hi]) < 0, where + ' ask 인데 답 보임'); }
  if (f.k === 'ckk5') { const v = dat(doc, 'ckk5'), ks = (f.ks || [1, 2, 3]); const A = ks.map(k => dec(AREA(dec(mul(num(f.r), num(String(k))))))); ok(v[2] === A.join(',') && v[3] === ks.map(k => String(k * k)).join(','), where + ' 넓이·배 ' + v.join('|')); if (f.ask != null) ok(txtOf(doc, 'ckk-a')[f.ask].indexOf(A[f.ask]) < 0 && doc.body.textContent.indexOf(ks[f.ask] + ' × ' + ks[f.ask] + ' = ') < 0, where + ' ask 인데 답 보임'); }
  if (f.k === 'cpl5') { const v = dat(doc, 'cpl5'); const want = f.items.map(([n, per]) => n + ':' + per + ':' + dec(div(num(per), mul(num(f.r), TWO)))).join(','); ok(v[1] === want, where + ' 비율 ' + v[1] + ' ≠ ' + want); if (f.ask != null) { const rat = dec(div(num(f.items[f.ask][1]), mul(num(f.r), TWO))); ok(txtOf(doc, 'cpl-v')[f.ask].indexOf('= ' + rat) < 0, where + ' ask 인데 답 보임'); } }
  if (f.k === 'cmv5') { const v = dat(doc, 'cmv5'); ok(v[1] === dec(mul(mul(num(f.r), TWO), num(f.r))), where + ' 넓이 ' + v[1]); if (f.ask) ok(txtOf(doc, 'cmv-a').join('').indexOf('= ' + v[1]) < 0, where + ' ask 인데 답 보임'); }
  if (f.k === 'circ') { const sv = doc.querySelector('svg'); const r0 = sv.getAttribute('data-rcm'), d0 = sv.getAttribute('data-dcm'); if (r0 && d0) ok(+d0 === 2 * +r0, where + ' 지름 = 반지름 × 2'); }
  if (f.k === 'cll') { const lastV = (e) => { const m = String(e).match(/=\s*([\d.\/]+)…?\s*$/); return m ? num(m[1]) : null; };
    f.rows.forEach(r => { const b0 = badEq.length; eqText(r.expr, where); ok(badEq.length === b0, where + ' 식 틀림 ' + r.expr); });
    const bad = f.rows.filter(r => r.cls === 'bad').map(r => lastV(r.expr)).filter(Boolean), hi = f.rows.filter(r => r.cls === 'hi').map(r => lastV(r.expr)).filter(Boolean);
    bad.forEach(b => ok(!hi.some(h => eqR(h, b)), where + ' 잘못된 길과 바른 길의 값이 같음')); }
  if (block === 'basic_problem' && f.ask != null) { const ans = d.options ? d.options.find(o => o.correct).text : String(d.answer); const a0 = ans.replace(/\s*(cm²|cm|m|배|칸)$/, ''); ok(doc.body.textContent.indexOf('= ' + a0) < 0 && doc.body.textContent.indexOf(a0 + '칸') < 0, where + ' 문제 그림에 답 ' + a0); }
}
T('그림 ' + figs.length + '개 — 원 부품 값 = 게이트 셈 · ask 답 가림 · 식 줄', () => figs.forEach(([w0, f, b, d]) => checkFig(w0, f, b, d)));
T('개념 40장 모두 그림 · 기본 문제 그림 ≥ 10 · 그 가운데 ask ≥ 9', () => { let c = 0, p = 0, a = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem' && s.data.fig) { p++; if (s.data.fig.ask != null) a++; } })); ok(c === 40 && p >= 10 && a >= 9, c + '/' + p + '/' + a); });
T('그림 부품 수 — 새 부품 9종 모두 쓰임 · cll ≥ 10', () => { ['cpm5', 'cun5', 'cgd5', 'csq5', 'csr5', 'crg5', 'ckk5', 'cpl5', 'cmv5'].forEach(k => ok(nG[k] >= 1, k + ' ' + nG[k])); ok(nG.cll >= 10, 'cll ' + nG.cll); });
T('그림 검사기 자체 확인 — 거짓 값은 부품이 던지거나 게이트가 잡음', () => { let c = 0; [{ k: 'cll', rows: [{ expr: '80 × 3.14 = 251.3' }] }, { k: 'cll', rows: [{ expr: '6 × 3.14 = 18.84', cls: 'bad' }, { expr: '6 × 3.14 = 18.84', cls: 'hi' }] }, { k: 'cpl5', r: 5, items: [[4, '33']] }].forEach(f => { try { checkFig('probe', f, 'concept', {}); } catch (e) { c++; } }); ok(c === 3, c + '/3'); });

console.log('═══ H. 재료 충실 ═══');
const nk = (s) => String(s).replace(/계산 결과가/g, '계산한 값이').replace(/결과가/g, '값이').replace(/결과는/g, '값은').replace(/결과를/g, '값을').replace(/어떻게 해결했나/g, '어떻게 풀었나').replace(/해결/g, '풀이');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+(?:\.\d+)?/g) || []).join(',');
KEYS.forEach(k => T(k + ' 개념 = 원문 장(또는 지도서 쪽 표시) · 기본 문제 = 원문(수·보기·정답) · 다음 시간 = 원문 다음', () => { const src = SK[k] ? SRC[SK[k]] : null;
  const cs = L[k].meta.concept_src || {}; Object.keys(cs).forEach(id => ok(L[k].slides.find(s => s.id === id && s.block === 'concept'), id + ' concept_src 장 없음'));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(!('source_note' in s.data), s.id + ' 장 안 근거 필드(무대가 안 그림)'); if (cs[s.id]) { ok(/지도서|『수학』/.test(cs[s.id]), s.id + ' 근거 쪽'); return; } ok(src && src.slides.some(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title), s.id + ' 원문 아님'); });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; if (!src) { ok(/정다각형|정육각형|정십이각형/.test(d.question), s.id + ' l08 = 『수학』 114~115쪽 정다각형'); return; }
    const ps = src.problems.filter(p => numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); if (ps[0].opts) ok(d.options[ps[0].ci].correct, s.id + ' 보기·정답'); });
  const nx = L[k].slides[18].data; if (src && !['u5_l07', 'u5_l09', 'u5_l10'].includes(k)) ok(nx.preview.indexOf(nk(src.next)) === 0, '다음 ' + nx.preview); }));
T('원문 인물 장(달곰이·순달이·여울이가 나오는 장) 안 씀', () => KEYS.forEach(k => { const src = SK[k] ? SRC[SK[k]] : null; if (!src) return; L[k].slides.filter(s => s.block === 'concept' && !(L[k].meta.concept_src || {})[s.id]).forEach(s => { const x = src.slides.find(y => nk(y.title) === s.data.title); ok(x && !/달곰|순달|여울/.test(x.text + x.title), k + ' ' + s.id); }); }));
T('한 차시 안에서 같은 문제 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));
T('교과서 수 — 차시마다 지도서 장면 수가 화면에 있음', () => { const NEED = { u5_l01: ['16', '3 × 2 = 6'], u5_l02: ['500원', '100원'], u5_l03: ['66', '21', '20.4', '6.5', '23.9', '7.6', '18.85', '43.98'], u5_l04: ['80', '251.2', '157', '50'], u5_l05: ['60', '88'], u5_l06: ['8등분', '28.26'], u5_l07: ['47.1', '103.62', '160.14', '1014'], u5_l08: ['28.28', '31.08', '31.24', '3.124'], u5_l09: ['314', '1256', '2826', '452.16'], u5_l10: ['78.5', '48', '153.86'] };
  KEYS.forEach(k => { const all = JSON.stringify(L[k].slides); NEED[k].forEach(x => ok(all.indexOf(x) >= 0, k + ' ' + x)); }); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 다음 단원 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~은?」「~까?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 6단원 원기둥, 원뿔, 구 · 다른 차시는 「다음 시간엔」 · l07 → 딸깍딸깍 · l08 → 동물 보호소 · l09 → 문제로 마무리', () => { const nx = L.u5_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /원기둥, 원뿔, 구/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); ok(/딸깍딸깍/.test(L.u5_l07.slides[18].data.preview) && /동물 보호소/.test(L.u5_l08.slides[18].data.preview) && /문제로 마무리/.test(L.u5_l09.slides[18].data.preview), '예고 계보'); });
T('교사 화면 영어 코드 0 — 제목·표지·글에 u5·l01·L02 같은 말 없음', () => KEYS.forEach(k => { const vis = JSON.stringify(L[k].slides.map(s => { const d = Object.assign({}, s.data); delete d.from; delete d.img; delete d.fig; return d; })) + JSON.stringify(L[k].meta.title); ok(!/\bu\d_l\d|\bL\d\d\b|\bl\d\d\b/.test(vis), k); }));

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson'));
const FIRST = [['원주율', 3]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 · 다음 시간 예고 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));
T('l02 그림·글에 3.14 없음(원주율 앞 차시)', () => ok(teach('u5_l02').indexOf('3.14') < 0 && L.u5_l02.slides.filter(s => s.data.fig).every(s => FIG.render(s.data.fig).indexOf('3.14') < 0), 'l02 3.14'));

console.log('═══ M. 차단 어휘 · 「결」 · 인물 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 달곰이·순달이·여울이·곰이·펭이·세호·지윤 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결', '곰이', '펭이', '달곰', '순달', '여울이', '세호', '지윤'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));

console.log('\n게이트 g6s2 수학 u5: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
