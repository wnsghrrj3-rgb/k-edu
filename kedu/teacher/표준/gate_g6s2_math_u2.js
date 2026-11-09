/* gate_g6s2_math_u2.js — 6학년 2학기 수학 2단원 「공간과 입체」 케이티처 2세대 게이트 (2026-11-09 준비본, 오푸스 5.5 — gate_g5s2_math_u2 틀 + 쌓기나무 셈기).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(skp·skd — 잘못된 인자는 던짐) · B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 1단원 u1_l11 출구 → l02 … l12 = 직전 출구)
   E 정답 다시 셈 — 게이트 자체 쌓기나무 셈기(개수·자리 수·층별 개수·앞·옆·위에서 본 모양·세 판의 해·폴리큐브 가짓수·방향 판 차례)로
     기본 문제 36 · 수준별 기본·도전 24 · 출구 36 · 넓히기 12 · 되짚기 3 을 그림의 높이 표에서 다시 셈해 대조
   F 글 속 「a + b + … = n」「a − b = n」 사슬 다시 셈(오개념 「틀린 생각」 칸만 뺌) · 검산기 자체 확인
   G 그림 — skp 판마다 그린 칸(data-grid) = 게이트 셈 · data-n = 개수 · 수 쓴 그림 ?·글자 자리 · 층별 ? · ask 판은 답을 그리지 않음 · 개수 문제의 겨냥도는
     가려진 자리가 없거나(위에서 본 모양 없을 때) 가려진 자리가 1개뿐(교과서 약속) · skd 「…에서 보면」 차례 = 게이트 셈 · 문제 그림이 답을 그리지 않음
   H 교과서 충실 — 그림의 높이 표는 모두 교과서·『수학익힘』 쪽에 있는 모양(아래 ANCHOR 표: 쪽·개수·층별·앞·옆을 교과서에 적힌 수와 대조) · 지어낸 모양 0
   키 = 지도서 차시 번호 1~12(1단원 준비본 꼴 · 10 = 함께하는 수학 · 11 = 생각이 반짝 수학 · 12 = 문제로 마무리)
   I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원 · L 선행(「위에서 본 모양에 수」 l05 · 「층별」 l06 · 「네 가지 표현」 l08 — l01 예외)
   M 차단 어휘 · 「결」 0 · 곰이·펭이 0 · 교사 화면 영어 차시 코드 0
   실행: NODE_PATH=<jsdom>/node_modules node kedu/teacher/표준/gate_g6s2_math_u2.js   (1단원 데이터가 다른 곳이면 KT_U1=<g6s2_math_u1.js>) */
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
const L = load(path.join(TDIR, 'data/g6s2_math_u2.js'));
const U1F = [path.join(TDIR, 'data/g6s2_math_u1.js'), process.env.KT_U1 || ''].find(f => f && fs.existsSync(f));
const L1 = U1F ? load(U1F) : null;
const KEYS = Array.from({ length: 12 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '공간과 입체', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 쌓기나무 셈기 (부품·생성기와 따로 짬 — 높이 표: 줄 = 뒤 → 앞) ── */
const gN = (h) => h.flat().reduce((a, v) => a + v, 0);
const gP = (h) => h.flat().filter(v => v > 0).length;
const gF = (h) => h[0].map((_, x) => h.reduce((m, r) => Math.max(m, r[x]), 0));
const gS = (h) => h.map(r => r.reduce((m, v) => Math.max(m, v), 0)).reverse();
const gTop = (h, k) => h.map(r => r.map(v => (v > (k || 0) ? 1 : 0)));
const gLay = (h) => { const t = Math.max(...h.flat()); const out = []; for (let k = 0; k < t; k++) out.push(h.flat().filter(v => v > k).length); return out; };
const gGE = (h, k) => h.flat().filter(v => v >= k).length;
const gHT = (hs) => hs.map(v => v + '층').join(', ');
function gSols(h, fixed) { // 세 판(위·앞·옆)이 같은 모양 전부 — 자리마다 1~4 를 모두 넣어 본다
  const F = gF(h), S = gS(h), ps = []; h.forEach((r, ri) => r.forEach((v, x) => { if (v) ps.push([ri, x]); })); const out = [];
  const rec = (i, cur) => { if (i === ps.length) { const t = h.map(r => r.map(() => 0)); ps.forEach(([ri, x], j) => { t[ri][x] = cur[j]; }); if (SAME(gF(t), F) && SAME(gS(t), S)) out.push(t); return; }
    const key = ps[i].join(','); const rng = fixed && key in fixed ? [fixed[key]] : [1, 2, 3, 4]; rng.forEach(v => { cur.push(v); rec(i + 1, cur); cur.pop(); }); };
  rec(0, []); return out;
}
function gPoly(n) { // 쌓기나무 n개를 면끼리 붙인 서로 다른 모양(공간에서 돌리기 24가지로 같은 것은 하나 — 뒤집기도 공간에서는 돌리기)
  const rots = []; const R = [[(p) => [p[0], -p[2], p[1]]], [(p) => [p[2], p[1], -p[0]]], [(p) => [-p[1], p[0], p[2]]]];
  const ap = (f, p) => f(p); const seen = new Set(); let frontier = [[[0, 0, 0]]];
  const mats = []; { const gen = [(p) => [p[0], -p[2], p[1]], (p) => [p[2], p[1], -p[0]]]; const all = [(p) => p]; const keyf = (f) => JSON.stringify([[1, 2, 3]].map(f)); const S = new Set([keyf(all[0])]);
    for (let i = 0; i < all.length; i++) gen.forEach(g => { const f = (p) => g(all[i](p)); const k = keyf(f); if (!S.has(k)) { S.add(k); all.push(f); } }); mats.push(...all); }
  ok(mats.length === 24, '돌리기 ' + mats.length);
  const norm = (cs) => { const mn = [0, 1, 2].map(i => Math.min(...cs.map(c => c[i]))); return JSON.stringify(cs.map(c => c.map((v, i) => v - mn[i])).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])); };
  const canon = (cs) => mats.map(f => norm(cs.map(f))).sort()[0];
  for (let k = 1; k < n; k++) { const next = new Map(); frontier.forEach(cs => { const S = new Set(cs.map(c => c.join(','))); cs.forEach(c => [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(d => { const q = [c[0] + d[0], c[1] + d[1], c[2] + d[2]]; if (S.has(q.join(','))) return; const nc = cs.concat([q]); const key = canon(nc); if (!next.has(key)) next.set(key, nc); })); }); frontier = [...next.values()]; }
  return frontier.length;
}
function gSeen(items, side) { const it = items.slice(); const f = { front: (a, b) => a.x - b.x, back: (a, b) => b.x - a.x, left: (a, b) => b.y - a.y, right: (a, b) => a.y - b.y }[side]; ok(f, '방향 ' + side); return it.sort(f).map(i => i.name); }
const ROWN = (h, ri) => (h.length === 2 ? ['뒷줄', '앞줄'] : ['뒷줄', '가운데 줄', '앞줄'])[ri];
const COLN = (h, x) => (h[0].length === 3 ? ['왼쪽', '가운데', '오른쪽'] : ['왼쪽', '오른쪽'])[x];

/* ── 교과서 모양 표(쪽 · 교과서·지도서에 적힌 수) — 그림의 높이 표는 이 가운데 하나여야 한다 ── */
const ANCHOR = [
  ['『수학』 36 다섯 방향', [[3, 1, 2], [1, 1, 1], [1, 0, 0]], { F: [3, 1, 2], S: [1, 1, 3] }],
  ['『수학』 37 색칠(빨 5·노 4·파 4)', [[0, 2, 1], [1, 1, 0], [0, 1, 0]], { P: 5, Fs: 4, Ss: 4 }],
  ['『수학』 37 문제 3', [[3, 1, 1], [1, 1, 0], [1, 0, 0]], { F: [3, 1, 1], S: [1, 1, 3] }],
  ['『수학』 38 가(6개)', [[2, 1, 1], [1, 1, 0]], { N: 6 }],
  ['『수학』 39 ㄱ(5개)', [[0, 2], [2, 1]], { N: 5 }], ['『수학』 39 ㄴ(6개)', [[1, 2], [2, 1]], { N: 6 }], ['『수학』 39 문제 3(10개)', [[1, 1, 2], [2, 2, 2]], { N: 10 }],
  ['『수학』 40 ㉠2·㉡3·㉢1·㉣1', [[2, 3, 1], [1, 0, 0]], { N: 7 }], ['『수학』 41 문제 3(9개)', [[1, 2, 3, 1], [1, 0, 0, 1]], { N: 9 }],
  ['『수학』 41 층별 6·3·1', [[2, 3, 0], [1, 2, 1], [1, 0, 0]], { Lay: [6, 3, 1] }], ['『수학』 42 문제 4(9개)', [[3, 2, 1], [2, 0, 0], [1, 0, 0]], { Lay: [5, 3, 1] }],
  ['『수학』 42 문제 5(13개)', [[2, 2, 1], [3, 1, 0], [2, 1, 1]], { N: 13 }], ['『수학』 42 문제 6(9개)', [[3, 1, 1], [2, 1, 0], [0, 1, 0]], { Lay: [6, 2, 1] }],
  ['『수학익힘』 33 수 쓴 그림 → 층별', [[0, 2, 3], [3, 2, 1], [0, 2, 0]], { Lay: [6, 5, 2] }],
  ['『수학』 44 활동 1(8개)', [[0, 1, 0], [1, 2, 3], [0, 1, 0]], { N: 8, F: [1, 2, 3], S: [1, 3, 1] }], ['『수학』 44 문제 2(10개)', [[0, 3, 3], [2, 2, 0]], { N: 10, F: [2, 3, 3], S: [2, 3] }],
  ['『수학』 45 활동 3(12개)', [[3, 2, 0], [2, 1, 0], [1, 2, 1]], { N: 12 }], ['『수학』 45 활동 4(5·3·2)', [[3, 0, 0], [3, 2, 1], [0, 1, 0]], { Lay: [5, 3, 2] }],
  ['『수학』 50~51 민수 ①(9개)', [[2, 3, 1], [2, 1, 0]], { N: 9, F: [2, 3, 1], S: [2, 3] }], ['『수학』 50~51 민수 ②(9개)', [[2, 3, 1], [1, 2, 0]], { N: 9, F: [2, 3, 1], S: [2, 3] }], ['『수학』 50~51 민수 ③(10개)', [[2, 3, 1], [2, 2, 0]], { N: 10, F: [2, 3, 1], S: [2, 3] }],
  ['『수학』 52 마무리 2', [[1, 1, 2], [1, 1, 0], [1, 1, 1]], { F: [1, 1, 2], S: [1, 1, 2] }], ['『수학』 52 마무리 3(10개)', [[0, 1, 0], [2, 2, 2], [1, 2, 0]], { N: 10 }], ['『수학』 53 마무리 4(12개)', [[3, 2, 0], [2, 1, 2], [1, 0, 1]], { N: 12 }],
  ['『수학』 53 마무리 6(11개)', [[3, 2, 0], [2, 1, 1], [0, 1, 1]], { Lay: [7, 3, 1] }], ['『수학』 54 마무리 7 세 판(7개)', [[1, 2, 3], [0, 1, 0]], { N: 7, F: [1, 2, 3], S: [1, 3] }], ['『수학』 54 마무리 7 수(10개)', [[2, 3, 3], [0, 2, 0]], { N: 10 }],
  ['『수학』 54 마무리 8', [[3, 1, 2], [1, 0, 0], [2, 1, 1]], { F: [3, 1, 2], S: [2, 1, 3] }],
  ['『수학』 46 쌓기나무 3개 일자', [[1, 1, 1]], { N: 3 }], ['『수학』 46 쌓기나무 3개 ㄱ자', [[1, 0], [1, 1]], { N: 3 }], ['『수학』 47 보라색 2개', [[1, 1]], { N: 2 }],
  ['『수학』 46 쌓기나무 4개 일자', [[1, 1, 1, 1]], { N: 4 }], ['『수학』 46 4개 ㄴ자', [[1, 0, 0], [1, 1, 1]], { N: 4 }], ['『수학』 46 4개 ㅗ자', [[0, 1, 0], [1, 1, 1]], { N: 4 }], ['『수학』 46·『수학익힘』 37 4개 네모', [[1, 1], [1, 1]], { N: 4 }]
];
const anchorOf = (h) => ANCHOR.find(a => SAME(a[1], h));

console.log('═══ A. 로드 ═══');
T('11차시 키 u2_l01~l11 · 파일 data/g6s2_math_u2.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 · 2단원 공간과 입체 · 성취기준 번호 · 40분 · src_key · source(지도서 직행 · 투영 회수 키)', () => KEYS.forEach(k => { const m = L[k].meta;
  ok(m.grade === 6 && m.term === 2 && m.unit === 2 && m.subject === '수학' && m.unit_title === '공간과 입체' && m.n === +k.slice(-2) && m.src_key === k, k); ok(/6수03-(09|10)/.test(m.std), k + ' std'); ok(m.duration_min === 40, k + ' 40분'); ok(!('live_url' in m), k + ' live_url 없음(1단원 꼴)');
  ok(/지도서 2단원/.test(m.source) && (k === 'u2_l10' ? /원문 없는 차시/.test(m.source) : /grade6\/semester2\/math\/2단원_공간과입체\/g6_math_u2_l\d\d_/.test(m.source)), k + ' source'); }));
T('자기주도 원문 회수 키 차례 — 지도서 1~9차시 = 원문 l01~l09 · 11차시 = 원문 l10 · 12차시 = 원문 l11', () => { const want = { u2_l09: 'l09', u2_l11: 'l10', u2_l12: 'l11', u2_l01: 'l01' }; Object.keys(want).forEach(k => ok(L[k].meta.source.indexOf('g6_math_u2_' + want[k] + '_') > 0, k)); });
T('성취기준 — l01~l03·l07~l11 6수03-10 · l04~l06 6수03-09 · l12 둘 다', () => KEYS.forEach((k, i) => { const s = L[k].meta.std; const want = i < 3 || (i >= 6 && i <= 10) ? ['10'] : i < 6 ? ['09'] : ['09', '10']; ok(want.every(x => s.indexOf('6수03-' + x) >= 0) && (want.length === 2 || s.match(/6수03-\d\d/g).length === 1), k + ' ' + s.slice(0, 12)); }));
T('slug — KT2.slugOf({g:6,s:math,t:2}) = g6s2_math', () => ok(KT2.slugOf({ g: 6, s: 'math', t: '2' }) === 'g6s2_math', 'slug'));
T('그림 부품 skp·skd 등록 · 잘못된 인자는 던짐', () => { [{ k: 'skp', h: [[1, 2]], show: ['iso', 'top', 'num', 'front', 'side', 'layers'] }, { k: 'skd', items: [{ name: '컵', x: 0.2, y: 0.4 }], dirs: { '가': 'left' }, from: '가' }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 200 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'skp', h: [[5]] }, { k: 'skp', h: [[1, 0]], q: [0, 1], show: ['num'] }, { k: 'skp', h: [[1]], show: ['back'] }, { k: 'skp', h: [[1, 1], [1]] }, { k: 'skd', items: [{ name: 'a', x: 2, y: 0 }] }, { k: 'skd', items: [{ name: 'a', x: 0.5, y: 0.5 }], dirs: { '가': 'up' } }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 6, '던짐 ' + th); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 12종 서로 다름', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 12, im.join(',')); });
T('실사 자리 — 6-2 수학 1단원·5-2 수학 1~6단원과 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); const other = ['g6s2_math_u1'].concat([1, 2, 3, 4, 5, 6].map(n => 'g5s2_math_u' + n)).map(f => path.join(TDIR, 'data', f + '.js')).filter(f => fs.existsSync(f)); ok(other.length >= 6, '견줄 단원 ' + other.length);
  other.forEach(f => Object.values(load(f)).forEach(l => ok(im.indexOf(l.slides[2].data.img) < 0, path.basename(f) + ' 와 겹침 ' + l.slides[2].data.img))); });

console.log('═══ D. 복습 계보 ═══');
const U1EXIT = [['7/18 ÷ 8/9 을 계산하면 얼마일까요?', '7/16'], ['간장 7 1/2 L를 한 병에 5/6 L씩 나누어 담으면 몇 병이 될까요?', '9'], ['2/5 ÷ 1/10 은 얼마일까요?', '4']];
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? '직전 차시 출구' : '1단원 마지막 차시(u1_l11) 출구' + (L1 ? ' — 1단원 데이터와 대조' : ' — 1단원 데이터 없음, 적어 둔 출구와 대조')), () => { const rv = L[k].slides[1].data;
  if (!i) { ok(rv.from === 'u1_l11' && rv.items.length === 3, 'l01 from ' + rv.from); const src = L1 ? L1.u1_l11.slides[15].data.items.map(x => [x.q, x.a]) : U1EXIT; ok(SAME(rv.items.map(x => [x.q, x.a]), src), 'l01 ≠ 1단원 출구');
    ok(/분수의 나눗셈/.test(rv.content) && /쌓기나무/.test(rv.content) && /뒤집기/.test(rv.content) && /겨냥도/.test(rv.content), 'l01 되짚기 글(1단원 · 선수 학습)'); if (L1) ok(/공간과 입체/.test(L1.u1_l11.slides[18].data.preview), '1단원 마지막 장 예고 = 공간과 입체'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0;
const figH = (d) => { const f = d.fig; ok(f && f.k === 'skp', '그림이 skp 아님'); return f.h; };
const cakeAt = (d, dir) => { const f = d.fig; ok(f && f.k === 'skd', 'skd 아님'); const ord = gSeen(f.items, f.dirs[dir]); const i = ord.indexOf('케이크'); return i === 0 ? '가장 왼쪽' : i === ord.length - 1 ? '가장 오른쪽' : '컵 2개 사이'; };
const posName = (h, v) => { let r = null; h.forEach((row, ri) => row.forEach((x, c) => { if (x === v) { ok(!r, '높이 ' + v + ' 자리가 둘'); r = ROWN(h, ri) + ' ' + COLN(h, c); } })); return r; };
const MSF = { '0,0': 2 };
const BASIC = {
  u2_l01: [() => '육각형', () => '왼쪽과 오른쪽', d => gN(figH(d))],
  u2_l02: [() => '다 방향', d => cakeAt(d, '나'), () => '다'],
  u2_l03: [d => gHT(gF(figH(d))), d => gHT(gS(figH(d))), d => gP(figH(d))],
  u2_l04: [d => gN(figH(d)), d => gN(figH(d)), d => gN(figH(d)) + '개'],
  u2_l05: [d => figH(d)[0][1], d => gN(figH(d)), d => gN(figH(d)) + '개'],
  u2_l06: [d => gN(figH(d)), d => gLay(figH(d))[d.fig.qlayer - 1], d => gGE(figH(d), 2) + '칸'],
  u2_l07: [d => { const s = gSols(figH(d)); ok(s.length === 1, '하나로 정해지지 않음'); return gN(s[0]); }, d => posName(figH(d), 3), d => Math.min(...gSols(figH(d)).map(gN))],
  u2_l08: [d => gN(figH(d)), d => gN(figH(d)), d => gHT(gF(figH(d)))],
  u2_l09: [() => gPoly(3), () => gPoly(4), () => 2 * 2 * 2 + '개'],
  u2_l10: [() => 14 + 7 + 6, () => '위에서 본 모양', d => gLay(figH(d))[d.fig.qlayer - 1]],
  u2_l11: [d => { const s = gSols(figH(d), MSF); const v = new Set(s.map(t => t[0][2])); ok(v.size === 1, '나 정해지지 않음'); return [...v][0]; }, d => { const s = gSols(figH(d), MSF); const v = new Set(s.map(t => t[0][1])); ok(v.size === 1, '가 정해지지 않음'); return [...v][0]; },
    d => { const s = gSols(figH(d), MSF).filter(t => gN(t) === 10); ok(s.length === 1, '10개 조건 해 ' + s.length); return '다 ' + s[0][1][0] + '개, 라 ' + s[0][1][1] + '개'; }],
  u2_l12: [d => gN(figH(d)), d => gN(figH(d)), d => gHT(gS(figH(d)))]
};
const HM = { P51: [[2, 3, 1], [1, 0, 0]], P53: [[1, 2, 3, 1], [1, 0, 0, 1]], P65: [[2, 2, 1], [3, 1, 0], [2, 1, 1]], A42: [[0, 2], [2, 1]], P43: [[1, 1, 2], [2, 2, 2]], GA: [[2, 1, 1], [1, 1, 0]], COLOR: [[0, 2, 1], [1, 1, 0], [0, 1, 0]], P62: [[2, 3, 0], [1, 2, 1], [1, 0, 0]], P64: [[3, 2, 1], [2, 0, 0], [1, 0, 0]], P71: [[0, 1, 0], [1, 2, 3], [0, 1, 0]], P72: [[0, 3, 3], [2, 2, 0]], P83: [[3, 2, 0], [2, 1, 0], [1, 2, 1]], MS: [[2, 3, 1], [2, 2, 0]], R3: [[0, 1, 0], [2, 2, 2], [1, 2, 0]], R6: [[3, 2, 0], [2, 1, 1], [0, 1, 1]], R8: [[3, 1, 2], [1, 0, 0], [2, 1, 1]] };
const TAB = L.u2_l02.slides.find(s => s.block === 'concept' && s.data.fig.k === 'skd' && s.data.fig.from === '가').data.fig;
const msSols = gSols(HM.MS, MSF);
const LEV = {
  u2_l01: [String(gP(HM.GA)), String(gN(HM.GA) - gP(HM.GA))], u2_l02: ['가', String(gSeen(TAB.items, TAB.dirs['다']).indexOf('케이크') + 1)], u2_l03: ['뒤', String(gF(HM.COLOR).reduce((a, b) => a + b) + gS(HM.COLOR).reduce((a, b) => a + b))],
  u2_l04: [String(gP(HM.GA)), String(8 + 1)], u2_l05: [String(gN(HM.P53)), String(gGE(HM.P53, 2))], u2_l06: [String(gN(HM.P64)), String(gN(HM.R6) - gLay(HM.R6)[0] - gLay(HM.R6)[2])],
  u2_l07: ['위에서 본 모양', String(gSols(HM.P72).length)], u2_l08: ['위에서 본 모양', String(gGE(HM.P83, 2))], u2_l09: [String(2 + 3), String(3 + 4 * 6)],
  u2_l10: [String(14 + 7), String(14 - 6)], u2_l11: [String(msSols.length), String(9 - 6 - 2)], u2_l12: [String(gN(HM.R6)), String(gN(HM.R8))]
};
const p72front = [...new Set(gSols(HM.P72).map(t => t[1][1]))].sort();
const EXIT = {
  u2_l01: ['예', '직사각형', '위, 앞, 옆 세 방향'], u2_l02: ['라', (() => { const i = gSeen(TAB.items, 'left').indexOf('케이크'); return i === 0 ? '가장 왼쪽' : '?'; })(), '라'], u2_l03: ['오른쪽', '가장 높은 층', '앞과 뒤 (또는 오른쪽과 왼쪽)'],
  u2_l04: ['위에서 본 모양', String(gN(HM.A42)), String(gN(HM.P43))], u2_l05: ['그 자리에 쌓인 쌓기나무 개수', String(gN(HM.P51)), String(HM.P65.flat().filter(v => v === 3).length)], u2_l06: ['위에서 본 모양', String(gN(HM.P62)), String(gN(HM.P64))],
  u2_l07: [String(gN(HM.P71)), '가장 높은 층', p72front.map(v => v + '개').join(', ')], u2_l08: [String(gN(HM.P83)), '예', '위, 앞, 옆에서 본 모양'], u2_l09: [String(gPoly(3)), String(gPoly(4)), '하나'],
  u2_l10: [String(14 + 7 + 6), '지우기 도구', '오른쪽'], u2_l11: [String(msSols[0][0][2]), String(Math.max(...msSols.map(gN))), '쌓기나무 10개를 사용했다'], u2_l12: ['다', String(gN(HM.R3)), gHT(gF(HM.R8))]
};
const REVIEW1 = U1EXIT.map(x => x[1]);
const ADV = { u2_l01: '보는 방향에 따라 보이는 부분이 달라져요', u2_l02: '물체끼리의 위치를 단서로 삼아요', u2_l03: gHT([2, 2, 1]), u2_l04: '가려져 보이지 않는 부분에 1개가 더 있어요', u2_l05: String(gN(HM.P65) - (gN(HM.P65) - 3)),
  u2_l06: String(gN([[0, 2, 3], [3, 2, 1], [0, 2, 0]])), u2_l07: '세 판을 모두 견주어요', u2_l08: '2층 라, 3층 가', u2_l09: '가, 라', u2_l10: '개수가 같아도 모양은 다를 수 있어요', u2_l11: '라에 쌓기나무 2개', u2_l12: '두 부분으로 나누어 보기' };
function want(d, exp) {
  exp = String(exp);
  if (d.options) { const c = d.options.filter(o => o.correct); ok(c.length === 1 && !('answer' in d), '보기 정답 수'); ok(clean(c[0].text) === exp, '정답 보기 「' + c[0].text + '」 ≠ 셈 「' + exp + '」'); ok(d.options.filter(o => clean(o.text) === exp).length === 1, '같은 보기 둘'); ok(new Set(d.options.map(o => o.text)).size === d.options.length, '보기 중복'); }
  else { ok(d.input === 'count_input' && String(d.answer) === exp, '답 ' + d.answer + ' ≠ 셈 ' + exp); }
  ok(new RegExp('\\*\\*' + exp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*$').test(d.note), '풀이 끝 = 답'); nCheck++;
}
KEYS.forEach(k => T(k + ' 기본 3 · 수준별 기본·도전 · 출구 3 · 넓히기' + (k === 'u2_l01' ? ' · 되짚기 3' : '') + ' = 게이트 셈', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach((s, i) => { try { want(s.data, BASIC[k][i](s.data)); } catch (e) { throw new Error(s.id + ' ' + e.message); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach((t, i) => { ok(String(lv[t].a) === String(LEV[k][i]), t + ' ' + lv[t].a + ' ≠ ' + LEV[k][i]); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); nCheck++; });
  sl[15].data.items.forEach((x, i) => { ok(String(x.a) === String(EXIT[k][i]), '출구 ' + (i + 1) + ' ' + x.a + ' ≠ ' + EXIT[k][i]); nCheck++; });
  if (k === 'u2_l01') sl[1].data.items.forEach((x, i) => { ok(String(x.a) === REVIEW1[i], '되짚기 ' + x.a); nCheck++; });
  const adv = sl[14].data.note, last = (adv.match(/\*\*([^*]+)\*\*/g) || []).pop(); ok(last && last.replace(/\*/g, '') === ADV[k], '넓히기 끝 ' + last + ' ≠ ' + ADV[k]); nCheck++; }));
T('다시 셈한 정답 = 111(기본 36 · 수준별 24 · 출구 36 · 넓히기 12 · 되짚기 3)', () => ok(nCheck === 111, nCheck));
T('셈기 자체 확인 — 폴리큐브 3개 2·4개 8 · 세 판 해 · 방향 차례 · 틀린 답 잡음', () => { ok(gPoly(2) === 1 && gPoly(3) === 2 && gPoly(4) === 8, '폴리큐브'); ok(gSols(HM.P71).length === 1 && gSols(HM.P72).length === 2 && gSols(HM.MS, MSF).length === 3, '세 판 해');
  ok(SAME(gSeen([{ name: 'a', x: 0.1, y: 0.9 }, { name: 'b', x: 0.9, y: 0.1 }], 'left'), ['a', 'b']) && SAME(gSeen([{ name: 'a', x: 0.1, y: 0.9 }, { name: 'b', x: 0.9, y: 0.1 }], 'back'), ['b', 'a']), '방향');
  let c = 0; try { want({ input: 'count_input', answer: 8, note: '**8**' }, gN(HM.P43)); } catch (e) { c++; } try { want({ options: [{ text: '3층, 1층, 2층' }, { text: '2층, 1층, 3층', correct: true }], note: '**2층, 1층, 3층**' }, gHT(gF(HM.R8))); } catch (e) { c++; } ok(c === 2, '틀린 답 못 잡음 ' + c); });

console.log('═══ F. 글 속 식 ═══');
const allStr = []; KEYS.forEach(k => (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(x => { if (x === 'fig' || x === 'extras') return; walk(o[x], where + '.' + x); }); })(L[k].slides, k));
const EQ = /(?<![\d×])(\d+(?: [+−×] \d+)+) = (\d+)(?! [+−×])/g;
let nEq = 0; const badEq = [];
function eqText(s0, where) { const s = String(s0).replace(/\*\*/g, ''); let m; EQ.lastIndex = 0; while ((m = EQ.exec(s))) { const tk = m[1].split(' '); let v = +tk[0]; const mul = []; // × 먼저
  const t2 = [v]; for (let i = 1; i < tk.length; i += 2) { if (tk[i] === '×') t2[t2.length - 1] *= +tk[i + 1]; else { t2.push(tk[i]); t2.push(+tk[i + 1]); } } v = t2[0]; for (let i = 1; i < t2.length; i += 2) v = t2[i] === '+' ? v + t2[i + 1] : v - t2[i + 1];
  nEq++; if (v !== +m[2]) badEq.push(where + ' 「' + m[0] + '」'); } }
allStr.forEach(([s, where]) => { if (/\.wrong$|\.watch$/.test(where)) return; eqText(s, where); });
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 40', () => ok(!badEq.length && nEq >= 40, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = badEq.length; ['2 + 3 + 1 + 1 = 8', '13 − 7 − 2 = 5', '2 × 2 × 2 = 6'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 3, '틀린 식 못 잡음'); badEq.length = b0; eqText('3 + 4 × 6 = 27 · 14 + 7 + 6 = 27', 'probe'); ok(badEq.length === b0, '맞는 식을 틀렸다 함'); });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s]); }));
const skps = (f) => f.k === 'skp' ? [f] : f.k === 'u6r' ? (f.items || []).filter(x => x.k === 'skp') : [];
const nG = { skp: 0, panel: 0, ask: 0, num: 0, lay: 0, skd: 0, hidOK: 0 };
function checkSkp(w0, f, isCount) {
  const d = docOf(FIG.render(f)); const box = d.querySelector('.fig-skp'); ok(box, w0 + ' skp 렌더'); nG.skp++;
  ok(box.getAttribute('data-n') === String(gN(f.h)) && box.getAttribute('data-h') === f.h.map(r => r.join(',')).join('/'), w0 + ' data-n·h');
  const ask = f.ask || [];
  [...d.querySelectorAll('.skp-p')].forEach(p => { const v = p.getAttribute('data-view'), g = p.getAttribute('data-grid'); nG.panel++;
    if (g === '?') { nG.ask++; ok(ask.indexOf(v) >= 0 || (f.qlayer && v === 'layer' + f.qlayer), w0 + ' ? 판 ' + v); ok(!/\d층|\d/.test(p.querySelector('.skp-q').textContent.replace('?', '')), w0 + ' ? 판에 수'); return; }
    const G = JSON.parse(g);
    if (v === 'iso') ok(SAME(G, f.h), w0 + ' iso');
    else if (v === 'top') ok(SAME(G, gTop(f.h)), w0 + ' 위에서 본 모양');
    else if (v === 'front') ok(SAME(G, gF(f.h)), w0 + ' 앞 ' + g + ' ≠ ' + gF(f.h));
    else if (v === 'side') ok(SAME(G, gS(f.h)), w0 + ' 옆 ' + g + ' ≠ ' + gS(f.h));
    else if (v === 'num') { nG.num++; f.h.forEach((r, ri) => r.forEach((x, c) => { const key = ri + ',' + c, cell = G[ri][c]; if (!x) ok(cell === 0, w0 + ' 빈 자리'); else if (f.q && f.q[0] === ri && f.q[1] === c) ok(cell === '?', w0 + ' ? 자리'); else if (f.marks && key in f.marks) ok(cell === f.marks[key], w0 + ' 글자 자리'); else ok(cell === x, w0 + ' 수 ' + cell + ' ≠ ' + x); })); }
    else if (/^layer\d$/.test(v)) { nG.lay++; ok(SAME(G, gTop(f.h, +v.slice(5) - 1)), w0 + ' ' + v); }
    else throw new Error(w0 + ' 모르는 판 ' + v); });
  ask.forEach(v => ok(!d.querySelector('.skp-p[data-view="' + v + '"]:not([data-grid="?"])'), w0 + ' ask 판이 그려짐 ' + v));
  if (isCount && (f.show || []).indexOf('iso') >= 0) { const hid = box.getAttribute('data-hidden').split(';').filter(Boolean); const helper = ['top', 'num', 'layers'].some(x => (f.show || []).indexOf(x) >= 0);
    if (!helper) ok(!hid.length, w0 + ' 위에서 본 모양 없이 가려진 자리 ' + hid); hid.forEach(p => { const [ri, c] = p.split(',').map(Number); ok(f.h[ri][c] === 1, w0 + ' 가려진 자리 ' + p + ' 에 ' + f.h[ri][c] + '개 — 가려진 자리는 1개(교과서 약속)'); }); nG.hidOK++; }
}
function checkFig(w0, f, b, s) {
  const h = FIG.render(f); ok(h && !/NaN|undefined/.test(h), w0 + ' 렌더');
  const isCount = b === 'basic_problem' && s && s.data.input === 'count_input' && skps(f).length === 1 && String(s.data.answer) === String(gN(skps(f)[0].h));
  skps(f).forEach((x, i) => checkSkp(w0 + (f.k === 'u6r' ? '#' + i : ''), x, isCount || (b === 'concept' && (x.show || []).indexOf('top') >= 0)));
  if (f.k === 'skd') { nG.skd++; const d = docOf(h); const box = d.querySelector('.fig-skd'); const ds = box.getAttribute('data-seen'); if (f.from) { const ord = gSeen(f.items, f.dirs[f.from]); ok(ds === (f.ask ? '?' : f.from + ':' + ord.join(',')), w0 + ' 차례 ' + ds); if (!f.ask) ok(box.querySelector('.skd-seen').textContent.indexOf(ord.join(' · ')) > 0, w0 + ' 차례 글'); } }
  if (b === 'basic_problem' && f.k === 'skd') ok(!f.from, w0 + ' 문제 그림이 차례(답)를 보임');
}
T('그림 ' + figs.length + '개 — 판마다 그린 칸 = 게이트 셈 · ? 판 · 수 쓴 그림 · 층별 · 가려진 자리 · 방향 차례', () => figs.forEach(([w0, f, b, s]) => checkFig(w0, f, b, s)));
T('문제 그림이 답을 그리지 않음 — 앞·옆을 묻는 문제는 그 판이 ?(ask) · 칸 값을 묻는 문제는 그 자리가 글자 · 층을 묻는 문제는 그 층이 ?', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, f = d.fig, q = d.question;
  if (f.k !== 'skp') return; if (/앞에서 본 모양을/.test(q)) ok((f.ask || []).indexOf('front') >= 0 && (f.show || []).indexOf('front') < 0, k + ' ' + s.id + ' 앞 판 보임'); if (/옆에서 본 모양을/.test(q)) ok((f.ask || []).indexOf('side') >= 0 && (f.show || []).indexOf('side') < 0, k + ' ' + s.id + ' 옆 판 보임');
  if (/(㉡|가|나) 자리에 쌓인/.test(q)) { const nm = q.match(/(㉡|가|나) 자리/)[1]; ok(Object.values(f.marks || {}).indexOf(nm) >= 0, k + ' ' + s.id + ' 묻는 자리가 수로 보임'); }
  if (/2층에 놓인 쌓기나무는 몇 개/.test(q)) ok(f.qlayer === 2, k + ' ' + s.id + ' 2층 보임'); })));
T('그림 부품 수 — skp ≥ 60 · 판 ≥ 140 · ? 판 ≥ 5 · 수 쓴 그림 ≥ 15 · 층별 판 ≥ 15 · skd ≥ 3 · 가려진 자리 검사 ≥ 15', () => ok(nG.skp >= 60 && nG.panel >= 140 && nG.ask >= 5 && nG.num >= 15 && nG.lay >= 15 && nG.skd >= 3 && nG.hidOK >= 15, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 틀린 앞 판 · 가려진 자리 2개 · ? 판에 답 · 틀린 차례 잡음', () => { let c = 0; const tr = (fn) => { try { fn(); } catch (e) { c++; } };
  tr(() => checkFig('probe', { k: 'skp', h: HM.P71, show: ['front'] }, 'concept'));  // 통과해야 함(c 안 늘어남)
  const bad = FIG.render({ k: 'skp', h: HM.P71, show: ['front'] }).replace(/data-grid="\[1,2,3\]"/, 'data-grid="[1,2,2]"');
  tr(() => { const d = docOf(bad); const g = JSON.parse(d.querySelector('.skp-p').getAttribute('data-grid')); ok(SAME(g, gF(HM.P71)), '앞 판'); });
  tr(() => checkSkp('probe', { k: 'skp', h: HM.P65, show: ['iso', 'top'] }, true));
  tr(() => checkFig('probe', { k: 'skd', items: TAB.items, dirs: TAB.dirs, from: '가' }, 'basic_problem'));
  ok(c === 3, '잡은 수 ' + c); });

console.log('═══ H. 교과서 충실 ═══');
T('그림의 높이 표는 모두 교과서·『수학익힘』 모양(ANCHOR) — 지어낸 모양 0', () => { const miss = []; figs.forEach(([w0, f]) => skps(f).forEach(x => { if (!anchorOf(x.h)) miss.push(w0 + ' ' + JSON.stringify(x.h)); })); ok(!miss.length, miss.slice(0, 5).join(' | ')); });
T('ANCHOR 표 = 교과서에 적힌 수(개수·자리·층별·앞·옆·색칠 수)', () => ANCHOR.forEach(([nm, h, o]) => { if (o.N !== undefined) ok(gN(h) === o.N, nm + ' 개수'); if (o.P !== undefined) ok(gP(h) === o.P, nm + ' 자리'); if (o.Lay) ok(SAME(gLay(h), o.Lay), nm + ' 층별'); if (o.F) ok(SAME(gF(h), o.F), nm + ' 앞'); if (o.S) ok(SAME(gS(h), o.S), nm + ' 옆'); if (o.Fs) ok(gF(h).reduce((a, b) => a + b) === o.Fs && gS(h).reduce((a, b) => a + b) === o.Ss, nm + ' 노·파'); }));
T('교과서 문항 열쇠 수 — 기본·출구·개념 글에 교과서 개수가 그대로(5·6·10·7·9·13·12·11)', () => { const all = clean(JSON.stringify(KEYS.map(k => L[k].slides))); ['5개', '6개', '10개', '7개', '9개', '13개', '12개', '11개', '8가지', '27'].forEach(t => ok(all.indexOf(t) >= 0, t)); });
T('한 차시 안에서 같은 문제 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question + JSON.stringify(s.data.fig)).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || s.block === 'basic_problem') ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 다음 단원 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」 · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?$/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 3단원 소수의 나눗셈 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u2_l12.slides[18].data; ok(nx.title === '다음 단원엔' && /소수의 나눗셈/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson').map(s => Object.assign({}, s.data, { fig: null }))) + JSON.stringify(L[k].extras);
const FIRST = [['위에서 본 모양에 수', 5], ['층별', 6], ['네 가지 표현', 8]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l' + String(n).padStart(2, '0'))));
T('선행 검사기 자체 확인', () => { ok(teach('u2_l03').indexOf('층별') < 0, 'l03 깨끗'); ok(teach('u2_l08').indexOf('층별') >= 0, 'l08 있음'); });

console.log('═══ M. 차단 어휘 · 「결」 · 인물 · 영어 코드 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 곰이·펭이 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(b => ok(all.indexOf(b) < 0, b)); ok(!/(^|[^달])곰이|펭이/.test(all), '곰이·펭이'); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));
T('교사 화면에 영어 차시 코드(u2_l03·L03 꼴) 0', () => KEYS.forEach(k => L[k].slides.forEach(s => [false, true].forEach(rev => { const r = render(s, L[k], rev); const txt = docOf(r.body).body.textContent + ' ' + (r.cover || ''); ok(!/\bu\d_l\d\d\b|\bL\d\d\b|\bl\d\d\b/.test(txt.replace(/<[^>]+>/g, '')), k + ' ' + s.id + ' 영어 코드'); }))));

console.log('\n게이트 g6s2 수학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
