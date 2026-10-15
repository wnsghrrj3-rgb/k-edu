/* gate_g1s2_math_u5.js — 1학년 2학기 수학 5단원 「규칙 찾기」 케이티처 2세대 게이트 (129차, 베프).
   A 로드 · B 19장 골격·단계·성취기준 · C 복습 계보(g1s2_math u4_l11 → u5_l01 → … → l09)
   D 원문 충실 — 기본 문제 물음·정답·보기(보기 글 = optText: 한 색 토큰이면 색+모양 이름) = 원문 · 개념 글 줄 = 원문 줄·장 제목 · 정리·예고·자기 평가 = 원문
   E 재계산 — 출구·수준별 물음을 게이트가 다시 셈(네 꼴: 되풀이 다음 · 몇부터 몇씩 · 「규칙」으로 N 개 중 X 개수 · 수 배열표 아래/오른쪽) + 조사(수·기호 읽기 — ★별 ♥하트 ✚십자 ○동그라미 …)
   F 그림 — pat1 되풀이 단위 = 원문 unit(크기 z 포함) · seq1 rule(step/rep) 재계산 · ntab1 칸 = start+i · 색 줄 marks/steps · pgrid1 단위 판 되풀이
         · floor1 로봇 길(「시작」 줄부터, 줄마다 방향 바뀜) 되풀이 · cnt 색 블록 run-length · 빈칸 답(seq·ntab·pat·pgrid·floor) = 그림에서 다시 낸 값
         · 문제 그림엔 처음 강조(on) 없음 · 묶음 테는 빈칸 없는 문제만
   G 실렌더(닫힘·열림) 예외 0 · 2세대 꼴 · H 차단 어휘 0(성취기준 원문은 빼고 봄)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g1s2_math_u5.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { JSDOM } = require('jsdom');
const TDIR = path.resolve(__dirname, '..'), S2 = path.join(TDIR, 'stage2');
let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };
function load(file) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L }; c.window.window = c.window; vm.createContext(c); vm.runInContext(fs.readFileSync(file, 'utf8'), c); return c.window.LESSONS; }
const L = load(path.join(TDIR, 'data/g1s2_math_u5.js')), PREV = load(path.join(TDIR, 'data/g1s2_math_u4.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g1s2_math_u5.json'), 'utf8'));
(function fix(o) { for (const k in o) { if (typeof o[k] === 'string') o[k] = o[k].replace(/연결 모형/g, '블록'); else if (o[k] && typeof o[k] === 'object') fix(o[k]); } })(SRC); // 생성기와 같은 치환
const KEYS = Array.from({ length: 9 }, (_, i) => 'u5_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }); const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;

/* ── 토큰 키(크기 z 포함) — 원문 unit 표기와 같은 꼴로 ── */
const SN = { sq: '■', tri: '▲', cir: '●', star: '★', dia: '◆', moon: '☾', cross: '✚', heart: '♥', 'tri-o': '△', 'cir-o': '○', x: '✕', o: '○', plus: '+', minus: '−', up: '↑', dn: '↓' };
const key = (t) => !t || t.h ? '?' : t.t ? 'c:' + t.t : t.s ? 's:' + t.s + ':' + t.c : t.e ? 'e:' + t.e + ':' + (t.z || '') : t.n != null ? 'n:' + t.n : t.g != null ? 'g:' + t.g : 'x';
function ukey(u) { u = String(u); let m; if ((m = u.match(/^s:([^:]+):(\w+)$/))) return 's:' + (SN[m[1]] || '#' + m[1]) + ':' + m[2]; if ((m = u.match(/^e:(.+):(\w*)$/))) return 'e:' + m[1] + ':' + m[2]; if (/^(c|n|g):/.test(u)) return u; return 'e:' + u + ':'; }
const unitList = (u) => Array.isArray(u) ? u.map(ukey) : String(u).split(';').map(r => r.split(',').map(ukey));
/* 읽기 — 답 글과 대조할 때 */
const CN = { y: ['노란', '노랑'], b: ['파란', '파랑'], r: ['빨간', '빨강'], pk: ['분홍'], o: ['주황'], g: ['초록'], k: ['검정', '검은'], w: ['흰'] };
const said = (k) => { const [a, b, c] = k.split(':'); if (a === 'c') return CN[b] || []; if (a === 's') return [b]; if (a === 'e') return [b]; if (a === 'n' || a === 'g') return [b]; return []; };

/* 원문 그림 찾기 — 데이터 그림(부품) ↔ 원문 그림 */
function srcOfPat(f, src) { return src.find(x => x.k === 'pat' && JSON.stringify(x.toks) === JSON.stringify(f.toks)); }
function srcOfCnt(f, src) { return src.find(x => x.k === 'cnt' && JSON.stringify(x.groups) === JSON.stringify(f.cnt)); }
/* 되풀이 점검 — 순서 키 목록이 단위 u 의 되풀이인가(빈칸은 건너뜀) · 빈칸 자리 → 와야 할 키 */
function rep(keys, u, at) { const want = []; keys.forEach((k, i) => { const e = u[i % u.length]; if (k === '?') want.push(e); else ok(k === e, at + ' ' + (i + 1) + '째 ' + k + ' ≠ 단위 ' + e); }); return want; }
/* seq 규칙 */
function seqRule(g, at) { let m; if ((m = String(g.rule).match(/^step:(-?\d+)$/))) { g.seq.slice(1).forEach((v, i) => ok(v - g.seq[i] === +m[1], at + ' ' + m[1] + ' 씩')); } else if ((m = String(g.rule).match(/^rep:([\d,]+)$/))) { const u = m[1].split(',').map(Number); g.seq.forEach((v, i) => ok(v === u[i % u.length], at + ' 되풀이 ' + i)); } else ok(0, at + ' 모르는 규칙 ' + g.rule);
  g.vals.forEach((v, i) => { if ((g.hole || []).includes(i)) ok(v === '?', at + ' 빈칸 표시'); else ok(+v === g.seq[i], at + ' 보이는 수 ' + v); }); }
/* floor 로봇 길 — 「시작」 줄부터 첫 줄 왼→오, 줄마다 방향 바뀜 */
function snake(f) { const nc = f.nc, rows = []; for (let i = 0; i < f.toks.length; i += nc) rows.push(f.toks.slice(i, i + nc)); const up = /시작/.test((f.side || [])[1] || ''); if (up) rows.reverse(); const out = []; rows.forEach((r, j) => (j % 2 ? r.slice().reverse() : r).forEach(t => out.push(t))); return out; }

/* ── E 셈 — 네 꼴 ── */
const READ = { '★': '별', '☾': '달', '✚': '십자', '♥': '하트', '○': '동그라미', '□': '네모', '△': '세모', '✕': '엑스', '■': '네모', '▲': '세모', '●': '동그라미', '◆': '마름모' };
const NUM = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
function finalOf(w) { w = String(w).trim(); if (/\d$/.test(w)) { const d = +w.slice(-1); if (d === 0 && /0$/.test(w) && w.length > 1) return 1; return [1, 1, 0, 1, 0, 0, 1, 1, 1, 0][d]; } const r = READ[w.slice(-1)]; if (r) w = r; const c = w.charCodeAt(w.length - 1); if (c >= 0xAC00 && c <= 0xD7A3) return (c - 0xAC00) % 28 ? 1 : 0; return null; }
const PAIR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'], 이에요: ['이에요', '예요'], 예요: ['이에요', '예요'] };
function josa(s) { const bad = []; for (const m of String(s).replace(/\*\*/g, '').matchAll(/([0-9]+|[★☾✚♥○□△✕■▲●◆]|[가-힣]+) ?(은|는|이|가|을|를|과|와|이에요|예요)(?=[ ,.!?」)]|$)/g)) {
  const head = m[1]; if (/^[가-힣]+$/.test(head)) continue; // 한글 낱말은 붙여 쓴 조사와 구분이 어려워 수·기호만 본다
  const f = finalOf(head); if (f == null) continue; if (PAIR[m[2]][f ? 0 : 1] !== m[2]) bad.push(m[0]); } return bad; }
const items = (s) => String(s).split(/,\s*/).map(x => x.trim()).filter(Boolean);
function solve(q) {
  q = String(q).replace(/\*\*/g, ''); let m;
  if ((m = q.match(/^(?:.*?가 )?(\d+) 부터 시작하여 (\d+) 씩 (커져요|작아져요)\. ([\d, ]+) 다음 수는\?$/))) { const s0 = +m[1], st = (m[3] === '커져요' ? 1 : -1) * m[2], xs = items(m[4]).map(Number); ok((xs[0] - s0) % st === 0 && (xs[0] - s0) / st >= 0, q + ' 첫 수 ' + xs[0] + ' 가 수 줄에 없음'); xs.forEach((x, i) => ok(x === xs[0] + st * i, q + ' 앞 수 ' + x)); /* 보여 준 수는 수 줄의 뒷부분일 수 있음 */ return String(xs[xs.length - 1] + st); }
  if ((m = q.match(/^한 줄에 (\d+) 칸인 수 배열표에서 (\d+) 바로 (아래|오른쪽) 수는\?$/))) return String(+m[2] + (m[3] === '아래' ? +m[1] : 1));
  if ((m = q.match(/^「([^」]+)」 규칙으로 (?:\S+ )?(\d+) (개|칸|그루)(?:를|을|에)? \S+ (.+?) ?(?:은|는) 몇 (개|칸|그루)일까요\?$/))) { const u = items(m[1]), n = +m[2], x = m[4].trim(); ok(u.includes(x), q + ' 셀 것 ' + x); ok(m[3] === m[5], q + ' 단위'); let c = 0; for (let i = 0; i < n; i++) if (u[i % u.length] === x) c++; return c + m[5]; }
  if ((m = q.match(/^(.+?) ?(?:이|가) (?:되풀이돼요|반복돼요)\. (.+?) 다음에 올 (?:색|모양|수|것)(?:은|는)\?$/))) { const u = items(m[1]), xs = items(m[2]); ok(u.length >= 2, q + ' 단위'); xs.forEach((x, i) => ok(x === u[i % u.length], q + ' 앞 ' + (i + 1) + '째 ' + x)); return u[xs.length % u.length]; }
  return null;
}
function check(q, a) { const r = solve(q); if (r == null) return 0; ok(nsp(r) === nsp(a), q + ' → ' + a + ' (셈 ' + r + ')'); return 1; }

/* 보기 글 — 생성기 optText 와 같은 규칙 */
const SHP = { '■': '네모', '▲': '세모', '●': '동그라미', '★': '별', '♥': '하트', '◆': '마름모', '☾': '달', '✚': '십자' };
const CLR = { y: '노란', b: '파란', r: '빨간', pk: '분홍', o: '주황', g: '초록', k: '검은', w: '흰' };
const optText = (p, i) => { const pt = p.optpt && p.optpt[i]; if (!pt) return p.opts[i]; if (pt.length === 1 && pt[0].s && SHP[pt[0].s] && CLR[pt[0].c]) return CLR[pt[0].c] + ' ' + SHP[pt[0].s]; return pt.map(t => t.s || t.e || '').join(' '); };
function figsOf(f) { if (!f) return []; if (f.k === 'panels') return f.items.flatMap(p => figsOf(p.fig || p)); return [f]; }
const svgOf = (f, sel) => new JSDOM('<body>' + FIG.render(f) + '</body>').window.document.querySelector(sel);

/* 그림 하나 점검 — 빈칸 자리에 와야 할 키 목록을 돌려준다 */
function figCheck(f, srcFigs, at, prob) {
  if (f.k === 'pat1' && f.cnt) { const g = srcOfCnt(f, srcFigs); ok(g, at + ' 원문 색 블록'); const runs = []; f.toks.forEach((t, i) => { if (i && t.t === f.toks[i - 1].t) runs[runs.length - 1]++; else runs.push(1); }); ok(JSON.stringify(runs) === JSON.stringify(f.cnt), at + ' run-length ' + runs + ' ≠ ' + f.cnt); ok(new Set(f.toks.filter((t, i) => i % 1 === 0).map(t => t.t)).size === 2, at + ' 두 색');
    if (f.pu) { ok(!prob, at + ' 문제 그림 묶음 테'); ok(f.pu.every(x => x === f.cnt[0] + f.cnt[1]), at + ' 묶음 = 앞 두 묶음'); } return []; }
  if (f.k === 'pat1') { const g = srcOfPat(f, srcFigs); ok(g, at + ' 원문 규칙 줄'); const u = unitList(g.unit); const want = rep(f.toks.map(key), u, at);
    if (f.pu) { ok(f.pu.every(x => x === u.length) || f.toks.every(t => !t.h) && f.pu.reduce((a, b) => a + b, 0) <= f.toks.length, at + ' 묶음 크기 ' + f.pu); if (prob) ok(f.toks.every(t => !t.h), at + ' 빈칸 문제에 묶음 테'); }
    const sv = svgOf(f, 'svg.fig-pat1'); ok(sv && sv.getAttribute('data-toks').split(',').length === f.toks.length && +sv.getAttribute('data-holes') === f.toks.filter(t => t.h).length, at + ' 렌더'); return want; }
  if (f.k === 'seq1') { const g = srcFigs.find(x => x.k === 'seq' && JSON.stringify(x.vals) === JSON.stringify(f.vals)); ok(g, at + ' 원문 수 줄'); seqRule(g, at); ok(JSON.stringify(f.hole || []) === JSON.stringify(g.hole || []), at + ' 빈칸 자리'); if (prob) ok(!(f.on || []).length, at + ' 문제 그림 처음 강조');
    ok(svgOf(f, 'svg.fig-seq1').getAttribute('data-seq') === f.vals.join(','), at + ' 렌더'); return (g.hole || []).map(i => 'n:' + g.seq[i]); }
  if (f.k === 'ntab1') { const g = srcFigs.find(x => x.k === 'ntab' && x.start === f.start && x.nc === f.nc && JSON.stringify(x.cells) === JSON.stringify(f.cells) && JSON.stringify(x.cls) === JSON.stringify(f.cls)); ok(g, at + ' 원문 수 배열표(칸·색 줄)');
    const want = []; f.cells.forEach((v, i) => { if (v === '?') { ok(/hole/.test(f.cls[i] || ''), at + ' 빈칸 표시'); want.push('n:' + (f.start + i)); } else ok(+v === f.start + i, at + ' 칸 ' + v + ' ≠ ' + (f.start + i)); });
    String(g.marks || '').split('|').filter(Boolean).forEach(mk => { const [c, vs] = mk.split(':'), xs = vs.split(',').map(Number); const got = f.cells.map((v, i) => new RegExp('\\b' + c + '\\b').test(f.cls[i] || '') ? f.start + i : null).filter(x => x != null); ok(JSON.stringify(got) === JSON.stringify(xs), at + ' ' + c + ' 칸 ' + got + ' ≠ ' + xs);
      const st = String(g.steps || '').split('|').find(s => s.startsWith(c + ':')); if (st) { const d = +st.split(':')[1]; xs.slice(1).forEach((x, i) => ok(x - xs[i] === d, at + ' ' + c + ' ' + d + ' 씩')); } });
    const sv = svgOf(f, 'svg.fig-ntab1'); ok(+sv.getAttribute('data-start') === f.start && sv.getAttribute('data-cells') === f.cells.join(','), at + ' 렌더'); return want; }
  if (f.k === 'pgrid1') { const g = srcFigs.find(x => x.k === 'pgrid' && x.nc === f.nc && JSON.stringify(x.toks) === JSON.stringify(f.toks)); ok(g, at + ' 원문 무늬 판'); const U = unitList(g.unit), want = [];
    f.toks.forEach((t, i) => { const r = Math.floor(i / f.nc), c = i % f.nc, row = U[r % U.length], e = row[c % row.length]; if (t.h) want.push(e); else ok(key(t) === e, at + ' ' + (r + 1) + '줄 ' + (c + 1) + '칸 ' + key(t) + ' ≠ ' + e); });
    ok(svgOf(f, 'svg.fig-pgrid1').getAttribute('data-toks').split(',').length === f.toks.length, at + ' 렌더'); return want; }
  if (f.k === 'floor1') { const g = srcFigs.find(x => x.k === 'floor' && x.nc === f.nc && JSON.stringify(x.toks) === JSON.stringify(f.toks)); ok(g, at + ' 원문 로봇 바닥'); ok((f.side || []).some(s => /시작/.test(s)) && (f.side || []).some(s => /끝/.test(s)), at + ' 시작·끝 꼬리표');
    const path_ = snake(f); const want = rep(path_.map(key), unitList(g.unit), at + ' 로봇 길'); return want; }
  if (f.k === 'objs1') { ok(srcFigs.some(x => x.k === 'objs' && JSON.stringify(x.items) === JSON.stringify(f.items)), at + ' 원문 물건 카드'); return []; }
  ok(0, at + ' 모르는 부품 ' + f.k); return [];
}
/* 빈칸 답 대조 — 와야 할 키 목록 ↔ 문제 답(보기 토큰 · 보기 글 · 쓴 답) */
function ansCheck(want, d, p, at) {
  if (!want.length) return 0;
  if (p.optpt && p.optpt[p.ci]) { const got = p.optpt[p.ci].map(t => key(t)); ok(JSON.stringify(got.map(k => k.replace(/^s:([^:]+):.*$/, 's:$1'))) === JSON.stringify(want.map(k => k.replace(/^s:([^:]+):.*$/, 's:$1'))) && got.every((k, i) => k === want[i] || want[i].endsWith(':' + k.split(':')[2])), at + ' 보기 토큰 ' + got + ' ≠ ' + want); return 1; }
  const A = d.options ? d.options.find(o => o.correct).text : Array.isArray(p.a) ? p.a.join(', ') : String(d.answer);
  const parts = want.length > 1 ? (/[ ,]/.test(A.trim()) ? A.split(/[, ]+/).filter(Boolean) : Array.from(A.trim())) : [A];
  ok(parts.length === want.length, at + ' 답 조각 수 ' + A + ' / ' + want);
  want.forEach((k, i) => { const ss = said(k); ok(ss.some(s => parts[i].includes(s)), at + ' 빈칸 ' + (i + 1) + ' 답 「' + parts[i] + '」 ≠ ' + k); }); return 1;
}

T('A 로드 9차시', () => { ok(KEYS.every(k => L[k]), '키 ' + Object.keys(L).join(',')); ok(Object.keys(L).length === 9); });
let holeChecked = 0;
KEYS.forEach((k, i) => {
  const les = L[k], src = SRC[k], sl = les.slides;
  const srcFigs = src.slides.flatMap(x => x.figs || []).concat(src.problems.flatMap(p => p.figs || []));
  T(k + ' B 골격', () => { ok(sl.length === 19, '장 ' + sl.length); sl.forEach((s, j) => { ok(s.block === ORDER[j], 's' + (j + 1) + ' ' + s.block); ok(s.stage === STAGE[j], 's' + (j + 1) + ' 단계'); }); ok(les.meta.grade === 1 && les.meta.term === 2 && les.meta.unit === 5 && les.meta.n === i + 1); ok(/^\[2수02-01\] .* · \[2수02-02\] /.test(les.meta.std), '성취기준 ' + les.meta.std); });
  T(k + ' C 복습 계보', () => { const prev = i === 0 ? PREV.u4_l11.slides.find(s => s.block === 'exit_ticket').data.items : L[KEYS[i - 1]].slides[15].data.items; ok(JSON.stringify(sl[1].data.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a })))); ok(sl[1].data.from === (i === 0 ? 'g1s2_math:u4_l11' : KEYS[i - 1])); });
  T(k + ' D 기본 문제 = 원문', () => { sl.slice(8, 11).forEach(s => { const d = s.data; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '') && (d.options ? JSON.stringify(d.options.map(o => o.text)) === JSON.stringify(p.opts.map((_, q) => optText(p, q))) : String(d.answer) === String(p.a))); ok(p, '원문 물음·답 없음: ' + d.question + ' / ' + d.answer);
    if (d.options) ok(d.options.findIndex(o => o.correct) === p.ci, '정답 ' + d.question); ok(['pad', 'mcq'].includes(p.part)); }); });
  T(k + ' D 개념 글 = 원문', () => { const all = src.slides.map(s => nsp(s.text)).join('|'), titles = src.slides.map(s => nsp(s.title)); sl.slice(3, 7).forEach(s => s.data.content.split('\n').forEach(line => { ok(all.includes(nsp(line)) || titles.includes(nsp(line)), '원문에 없는 줄: ' + line); })); });
  T(k + ' D 정리·예고·자기 평가 = 원문', () => { ok(nsp(sl[16].data.points.join('')) === nsp(src.summary), '정리'); if (i < 8) ok(nsp(sl[18].data.preview) === nsp(src.next), '예고'); else ok(/덧셈과 뺄셈\(3\)/.test(sl[18].data.preview), '다음 단원 예고'); const selfL = (src.slides.find(x => x.kind === '자기 평가') || { text: '' }).text.split('\n').filter(l => /\?$/.test(l)); ok(selfL.length === 3 && sl[17].data.items.every((t, j) => t.endsWith(selfL[j])), '자기 평가'); });
  T(k + ' E 출구·수준별 재계산', () => { let n = 0; sl[15].data.items.forEach(it => { n += check(it.q, it.a); }); Object.values(sl[11].data.levels).forEach(lv => { n += check(lv.q, lv.a); }); ok(n >= 4, '셈한 물음 ' + n); });
  T(k + ' E 교사 층 조사', () => { const txt = JSON.stringify([sl[2].data, sl[7].data, sl[11].data, sl[12].data, sl[13].data, sl[14].data.tnote || '', sl[15].data, sl[16].data.arrows || []]) + JSON.stringify(sl.map(s => s.data.tnote || '')); const b = josa(txt); ok(!b.length, '조사 ' + b.join(' | ')); });
  T(k + ' F 그림 규칙', () => { sl.forEach((s, j) => figsOf(s.data.fig).forEach(f => figCheck(f, srcFigs, 's' + (j + 1) + ' ' + f.k, j >= 8 && j <= 10))); });
  T(k + ' F 빈칸 답 = 그림에서 다시 낸 값', () => { sl.slice(8, 11).forEach((s, j) => { const d = s.data; if (!d.fig) return; const p = src.problems.find(p => nsp(d.question).replace(/\?$/, '') === nsp(p.q).replace(/\?$/, '')); const want = figsOf(d.fig).flatMap(f => figCheck(f, srcFigs, 's' + (j + 9) + ' ' + f.k, true)); holeChecked += ansCheck(want, d, p, 's' + (j + 9) + ' ' + d.question); }); });
  T(k + ' G 실렌더', () => { sl.forEach((s, j) => [false, true].forEach(rev => { const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '규칙 찾기', classNames: [] }); ok(r && r.body && r.body.length > 20, 's' + (j + 1) + ' 빈 몸'); })); });
  T(k + ' G 2세대 꼴', () => { sl.slice(3, 7).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '규칙 찾기', classNames: [] }); ok(/cv2|mg2|bd2|sm2/.test(r.cls || ''), 'concept s' + (j + 4) + ' cls ' + r.cls); });
    sl.slice(8, 11).forEach((s, j) => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: les.meta, unitTitle: '규칙 찾기', classNames: [] }); ok(/pa2|pv3|ch2/.test((r.cls || '') + r.body.slice(0, 200)), 'basic s' + (j + 9) + ' cls ' + r.cls); }); });
});
T('F 빈칸 답 대조한 문제 수', () => { console.log('  · 빈칸 답 대조 ' + holeChecked + ' 문제'); ok(holeChecked >= 12, '대조 ' + holeChecked); });
const ALL = fs.readFileSync(path.join(TDIR, 'data/g1s2_math_u5.js'), 'utf8').split(L.u5_l01.meta.std).join('');
T('H 차단 어휘 0 — 박음·빵꾸·갈아엎·결로·결', () => ['박음', '빵꾸', '갈아엎', '결로', '결'].forEach(x => ok(ALL.indexOf(x) < 0, '「' + x + '」')));
T('E 셈 자체 점검', () => { ok(solve('빨강, 노랑이 되풀이돼요. 빨강, 노랑, 빨강 다음에 올 색은?') === '노랑' && solve('사물함 번호가 1 부터 시작하여 1 씩 커져요. 4, 5, 6 다음 수는?') === '7' && solve('20 부터 시작하여 2 씩 작아져요. 20, 18, 16 다음 수는?') === '14', '되풀이·몇씩');
  ok(solve('「왼발, 오른발」 규칙으로 계단 7 칸에 붙이면 왼발은 몇 칸일까요?') === '4칸' && solve('「✚, ✚, ☾」 규칙으로 9 칸을 깔면 ✚ 는 몇 칸일까요?') === '6칸', '개수'); ok(solve('한 줄에 5 칸인 수 배열표에서 8 바로 아래 수는?') === '13' && solve('한 줄에 10 칸인 수 배열표에서 45 바로 오른쪽 수는?') === '46', '배열표'); });
/* 역검증 — 게이트가 틀린 것을 잡는지 */
T('역검증 셈·조사·그림', () => { let e = 0;
  try { check('노랑, 파랑이 되풀이돼요. 노랑, 파랑, 노랑 다음에 올 색은?', '노랑'); } catch (_) { e++; }
  try { check('3 부터 시작하여 2 씩 커져요. 3, 5, 8 다음 수는?', '10'); } catch (_) { e++; }
  try { check('「별, 하트」 규칙으로 6 개를 놓으면 하트는 몇 개일까요?', '2개'); } catch (_) { e++; }
  try { check('한 줄에 10 칸인 수 배열표에서 23 바로 아래 수는?', '24'); } catch (_) { e++; }
  ok(e === 4, '틀린 답 못 잡음 ' + e);
  ok(josa('♥ 은 몇 칸').length === 1 && josa('♥ 는 몇 칸').length === 0 && josa('△, ○ 이 되풀이').length === 1 && josa('★ 은').length === 0 && josa('2, 8 이').length === 0 && josa('2, 5, 5 가').length === 0 && josa('2, 5, 8 가').length === 1 && josa('10 이').length === 0, '조사 역검증');
  let c = 0; try { rep(['c:y', 'c:b', 'c:b'], ['c:y', 'c:b'], 'x'); } catch (_) { c++; } try { seqRule({ rule: 'step:2', seq: [1, 3, 6], vals: ['1', '3', '6'], hole: [] }, 'x'); } catch (_) { c++; } ok(c === 2, '그림 역검증 ' + c);
  ok(snake({ nc: 3, toks: [1, 2, 3, 4, 5, 6].map(n => ({ n })), side: ['🤖 시작', '🤖 끝'] }).map(t => t.n).join('') === '123654' && snake({ nc: 2, toks: [1, 2, 3, 4].map(n => ({ n })), side: ['🤖 끝', '🤖 시작'] }).map(t => t.n).join('') === '3421', '로봇 길'); });
console.log('gate_g1s2_math_u5: PASS ' + pass + ' · FAIL ' + fail);
process.exit(fail ? 1 : 0);
