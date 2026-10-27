/* gate_g5s2_math_u1.js — 5학년 2학기 수학 1단원 「수의 범위와 어림하기」 케이티처 2세대 게이트 (212차, 베프 — 4-2 u5 게이트 틀 + 범위·어림 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소(5학년 = 인물 없이 장면·물음) · D 복습 계보(l01 = 지난 학년 되짚기 → l02 … l10 = 직전 출구)
   E 정답 다시 셈 — 글 셈(범위 말 → 자연수 세기·가장 작은/큰 수·합 · 목록 세기 · 「아닌 것」 · 올림/버림/반올림(게이트 자체 자리 셈)
     · 되짚기(어림하여 N 이 되는 가장 큰 수 · □ 숫자) · 묶음/지폐/보트/봉지/상자 낱말 문제 · 입장료 구간 합 · 뜻 낱말)
     + 그림 셈(rgl 렌더된 ●○·띠를 다시 읽어 범위 말 · vch 카드 세기 · rdial 게이트 셈 · nlz 올림/버림/반올림(물음이 「나타내면」일 때만)
     · rtb 구간 찾기 · est Σ) — 글·그림 둘 다 셀 수 있으면 서로 대조
   F 식 전수 · G 그림(rgl ●○·띠·눈금 ↔ 명세 · cap 범위 ↔ 명세 · picks = 범위 자연수 · vch note 조건 ↔ ○△표 · rdial data-calc = 게이트 셈 = 결과 칸
     · 밑줄 자리 · 개념 글 「N을 …하여 …자리까지 나타내면 R」 = 게이트 셈 · nlz pick = 어림 · cap 경계 · rtb 범위 표 겹침·빈틈 0 · 반올림 열 · est 어림값·곱·합·실제 비용)
   H 원문 충실 · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 6↑·30~45분 · 물음 끝맺음(요) · 다음 단원
   L 선행 용어(이상·이하 l02 · 초과·미만 l03 · 올림 l05(「반올림」 안 빼고) · 버림 l06 · 반올림 l07 · l01 단원 도입 예외) · N 차단 어휘 · 「결」 · 곰이·펭이 0
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g5s2_math_u1.js */
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
const L = load(path.join(TDIR, 'data/g5s2_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g5s2_math_u1.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '수의 범위와 어림하기', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 어림 셈 — 자리 숫자를 하나씩 다룬다(부품의 rdCalc·BigInt 를 쓰지 않음) ── */
const PL = { '만': 4, '천': 3, '백': 2, '십': 1, '일': 0, '소수 첫째': -1, '소수 둘째': -2, '소수 셋째': -3 };
function gRound(nStr, method, place) {
  const pe = PL[place]; if (pe == null) throw new Error('자리 모름 ' + place);
  const s = String(nStr); const [ip, fp = ''] = s.split('.');
  const dig = []; for (let i = 0; i < ip.length; i++) dig.push({ e: ip.length - 1 - i, d: +ip[i] }); for (let i = 0; i < fp.length; i++) dig.push({ e: -(i + 1), d: +fp[i] });
  const below = dig.filter(x => x.e < pe); const keep = dig.filter(x => x.e >= pe).map(x => Object.assign({}, x));
  let up = false; if (method === '올림') up = below.some(x => x.d > 0); else if (method === '반올림') { const nx = below.find(x => x.e === pe - 1); up = !!nx && nx.d >= 5; } else if (method !== '버림') throw new Error('어림 모름 ' + method);
  if (up && !keep.length) keep.push({ e: pe, d: 0 });
  if (up) { let i = keep.length - 1; while (i >= 0) { keep[i].d += 1; if (keep[i].d < 10) break; keep[i].d = 0; i--; } if (i < 0) keep.unshift({ e: keep[0].e + 1, d: 1 }); }
  let ints = keep.filter(x => x.e >= 0).map(x => x.d).join('') + '0'.repeat(Math.max(0, pe)); ints = ints.replace(/^0+(?=\d)/, '') || '0';
  if (pe >= 0) return ints; return ints + '.' + keep.filter(x => x.e < 0).map(x => x.d).join(''); }

/* ── 범위 말 읽기 ── */
const U = '(?:\\s*(?:°C|kg|mL|L|세|g|cm|원))?';
const NUM = '(\\d+(?:\\.\\d+)?)';
function parseRange(t0) { const t = clean(t0); let m;
  if ((m = t.match(new RegExp(NUM + U + '\\s*보다 크고 ' + NUM + U + '\\s*보다 작은')))) return { lo: +m[1], loInc: false, hi: +m[2], hiInc: false };
  if ((m = t.match(new RegExp(NUM + U + '\\s*(이상|초과)\\s*' + NUM + U + '\\s*(이하|미만)')))) return { lo: +m[1], loInc: m[2] === '이상', hi: +m[3], hiInc: m[4] === '이하' };
  if ((m = t.match(new RegExp(NUM + U + '\\s*와 같거나 큰')))) return { lo: +m[1], loInc: true, hi: null };
  if ((m = t.match(new RegExp(NUM + U + '\\s*(이상|초과|이하|미만)(?![가-힣]*해)')))) { const v = +m[1]; return /이상|초과/.test(m[2]) ? { lo: v, loInc: m[2] === '이상', hi: null } : { lo: null, hi: v, hiInc: m[2] === '이하' }; }
  return null; }
const inR = (v, R) => (R.lo == null || (R.loInc ? v >= R.lo : v > R.lo)) && (R.hi == null || (R.hiInc ? v <= R.hi : v < R.hi));
function nats(R) { const a = R.lo == null ? 1 : R.loInc ? Math.ceil(R.lo) : Math.floor(R.lo) + 1; const b = R.hi == null ? null : R.hiInc ? Math.floor(R.hi) : Math.ceil(R.hi) - 1; if (b == null) return { a, b: null, list: null }; const list = []; for (let v = Math.max(1, a); v <= b; v++) list.push(v); return { a, b, list }; }
const words = (R) => (R.lo != null ? R.lo + ' ' + (R.loInc ? '이상' : '초과') + (R.hi != null ? ' ' : '') : '') + (R.hi != null ? R.hi + ' ' + (R.hiInc ? '이하' : '미만') : '') + '인 수';
const listIn = (t) => { const m = clean(t).match(/\d+(?:\.\d+)?\s*(?:세|kg|L)?(?:,\s*\d+(?:\.\d+)?\s*(?:세|kg|L)?){2,}/); return m ? m[0].split(',').map(x => parseFloat(x)) : null; };
const pick = (opts, fn) => { if (!opts) return null; const hit = opts.map((o, i) => (fn(clean(o.text)) ? i : -1)).filter(i => i >= 0); return hit.length === 1 ? { opt: hit[0] } : null; };

/* ── 렌더된 그림 다시 읽기 ── */
function readRgl(f) { const d = docOf(FIG.render(f)); const rows = [...d.querySelectorAll('g.rgl-r')]; ok(rows.length, 'rgl 줄 없음');
  return rows.map(g => { const ticks = [...g.querySelectorAll('text.rgl-t')].map(t => ({ v: +t.getAttribute('data-v'), x: +t.getAttribute('x') })); const xOf = (v) => (ticks.find(t => t.v === v) || {}).x; const vAt = (x) => { const t = ticks.find(t => Math.abs(t.x - x) < 1); return t ? t.v : null; };
    const pts = [...g.querySelectorAll('circle.rgl-pt')].map(c => ({ v: vAt(+c.getAttribute('cx')), inc: c.getAttribute('fill') !== '#fff' }));
    const band = g.querySelector('line.rgl-band'); let R = null;
    if (band) { const x1 = +band.getAttribute('x1'), x2 = +band.getAttribute('x2'); const a = vAt(x1), b = vAt(x2); const first = ticks[0].x, last = ticks[ticks.length - 1].x;
      ok(a !== null || x1 < first - 5, 'rgl 띠 왼끝이 눈금에도 끝 밖에도 없음'); ok(b !== null || x2 > last + 5, 'rgl 띠 오른끝이 눈금에도 끝 밖에도 없음');
      const pa = a === null ? null : pts.find(p => p.v === a), pb = b === null ? null : pts.find(p => p.v === b); ok(a === null || pa, 'rgl 띠 왼끝 점 없음'); ok(b === null || pb, 'rgl 띠 오른끝 점 없음');
      R = { lo: a, loInc: a === null ? undefined : pa.inc, hi: b, hiInc: b === null ? undefined : pb.inc }; if (R.lo === null) { R.lo = null; delete R.loInc; } if (R.hi === null) { R.hi = null; delete R.hiInc; } }
    const picks = [...g.querySelectorAll('circle.rgl-pick')].map(c => vAt(+c.getAttribute('cx')));
    const cap = g.querySelector('text.rgl-cap'); return { ticks, pts, R, picks, cap: cap ? cap.textContent : '', ask: g.getAttribute('data-ask') === '1' }; }); }
function readVch(f) { const d = docOf(FIG.render(f)); return [...d.querySelectorAll('g.vch-c')].map(g => ({ v: g.getAttribute('data-v'), mk: g.getAttribute('data-mk'), o: !!g.querySelector('circle'), t: !!g.querySelector('path') })); }
function readDial(f) { const d = docOf(FIG.render(f)); return [...d.querySelectorAll('g.dial-c')].map(g => { const [n, method, place, res, bad] = g.getAttribute('data-round').split('|'); const tg = g.querySelector('text.tgt');
  return { n, method, place, res, bad: bad === '1', calc: g.getAttribute('data-calc'), shown: g.querySelector('text.dial-res').textContent, tgtE: tg ? +tg.getAttribute('data-e') : null, head: g.querySelector('text').textContent }; }); }
function readNlz(f) { const d = docOf(FIG.render(f)); const svg = d.querySelector('svg.fig-nlz'); const [from, to, step, at, pk, mode] = svg.getAttribute('data-zoom').split(','); const ticks = [...svg.querySelectorAll('text.nlz-t, text.nlz-pick')].map(t => +t.getAttribute('data-v'));
  const mid = svg.querySelector('text.nlz-mid'); const pickT = svg.querySelector('text.nlz-pick'); return { from: +from, to: +to, step: +step, at: +at, pick: pickT ? +pickT.getAttribute('data-v') : null, mode, ticks, mid: mid ? +mid.getAttribute('data-v') : null, texts: [...svg.querySelectorAll('text')].map(t => t.textContent) }; }
function readTbl(f) { const d = docOf(FIG.render(f)); const tb = d.querySelector('table'); const trs = [...tb.querySelectorAll('tr')]; const head = trs[0].querySelectorAll('th').length ? [...trs[0].querySelectorAll('th')].map(t => t.textContent) : null; return { head, rows: trs.slice(head ? 1 : 0).map(tr => [...tr.querySelectorAll('td')].map(t => t.textContent)), d }; }
const nlzRound = (at, step, mode) => mode === 'up' ? Math.ceil(at / step) * step : mode === 'down' ? Math.floor(at / step) * step : Math.round(at / step) * step;

/* 범위 표(rtb)에서 값이 들어가는 줄 */
function bracket(rows, v) { const hit = rows.map((r, i) => [i, r.map(c => parseRange(c)).find(Boolean)]).filter(([, R]) => R && inR(v, R)); return hit.length === 1 ? hit[0][0] : null; }

/* ── 뜻 낱말 ── */
const DEF = [[/어떤 수와 같거나 큰 수를 그 수 무엇인 수/, '이상'], [/정확히 재지 않고 (대략 얼마쯤인지 알아보는|약 .* 라고 말하는) 것/, '어림'], [/실제 수와 차이가 가장 작게 어림하는 방법/, '반올림'], [/상자에 \d+개씩 담아 팔 때 알맞은 어림 방법/, '버림'], [/초과와 미만은 수직선에서 속이 찬 점과 빈 점 가운데 어느 것/, '빈 점 (○)']];
let nDef = 0;
const PLACE = '(만|천|백|십|일|소수 첫째|소수 둘째|소수 셋째)';
const RND = '(반올림|올림|버림)';

/* 글에서 답을 셈 (undefined = 글로 셀 문제 아님 · null = 하나로 안 정해짐) */
function textAns(q0, d) { const t = clean(q0); let m, R;
  for (const [re, wd] of DEF) if (re.test(t)) { nDef++; return { word: wd }; }
  if ((m = t.match(/(\d+) L 는 몇 mL/))) return { num: +m[1] * 1000 };
  // 잘못 말한 친구 — 「R에는 v도 포함돼요」 · 「a, b, c 중에서 R인 나이는 v뿐이에요」
  if (/잘못 말한/.test(t) && d && d.options) { const bad = []; String(q0).split('\n').slice(1).forEach(ln => { const [who, say] = ln.split(' — '); let right; const RR = parseRange(say);
      if ((m = say.match(/에는 (\d+)\S* ?도 포함돼요/))) right = inR(+m[1], RR); else if ((m = say.match(/중에서 .*인 나이는 (\d+)\S*뿐이에요/))) { const ls = listIn(say).filter(v => inR(v, RR)); right = ls.length === 1 && ls[0] === +m[1]; } else throw new Error('친구 말 못 읽음 ' + say);
      if (!right) bad.push(who.trim()); });
    return pick(d.options, o => bad.length === 1 ? o === bad[0] : bad.length === 2 ? o === '둘 다 틀렸다' : o === '둘 다 맞다'); }
  // 입장료 구간 합
  if (/입장료/.test(t) && /모두 몇 원/.test(t)) { const br = [...t.matchAll(/(\d+세 (?:이상|미만)(?: \d+세 (?:이하|미만))?) (\d+)원/g)].map(x => [parseRange(x[1]), +x[2]]); const ages = [...t.matchAll(/\((\d+)세\)/g)].map(x => +x[1]); ok(br.length >= 2 && ages.length >= 2, '입장료 못 읽음');
    return { num: ages.reduce((a, g) => { const h = br.filter(([RR]) => inR(g, RR)); ok(h.length === 1, g + '세 구간 ' + h.length); return a + h[0][1]; }, 0) }; }
  // 체감 온도 단계 (괄호 속 범위)
  if ((m = t.match(/(\d+) °C 는 .* 어느 단계일까요\? \((\S+) (.+)\)/))) { R = parseRange(m[3]); return inR(+m[1], R) ? { word: m[2] } : null; }
  // 어림하여 N 이 되는 수 중 가장 큰 자연수
  if ((m = t.match(new RegExp(RND + '하여 ' + PLACE + '의? ?자리까지 나타내면 (\\d+)이 되는 수 중에서 가장 (큰|작은) 자연수')))) { const hit = []; for (let n = 1; n <= +m[3] * 2; n++) if (gRound(String(n), m[1], m[2]) === m[3]) hit.push(n); return { num: m[4] === '큰' ? Math.max(...hit) : Math.min(...hit) }; }
  // □ 에 들어갈 숫자
  if ((m = t.match(new RegExp(RND + '하여 ' + PLACE + '의? ?자리까지 나타낸 수가 (\\d+)이에요\\. (\\d*)□')))) { const ds = []; for (let x = 0; x <= 9; x++) if (gRound(m[4] + x, m[1], m[2]) === m[3]) ds.push(x); return d && d.options ? pick(d.options, o => o === ds.join(', ')) : { word: ds.join(', ') }; }
  // 어림 가격 × 수량
  if ((m = t.match(/(\d+)원인 \S+ (\d+)봉지 .*반올림하여 (천|백|만)의 자리까지 나타내 어림셈/))) return { num: +gRound(m[1], '반올림', m[3]) * +m[2] };
  if ((m = t.match(/어림한 가격 (\d+)원짜리를 (\d+)봉지/))) return { num: +m[1] * +m[2] };
  // 올림·버림·반올림 직접
  if ((m = t.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*(?:원|명|개|kg|g)?[을를] ' + RND + '하여 ' + PLACE + '의? ?자리까지 나타내면')))) return { num: +gRound(m[1], m[2], m[3]) };
  if ((m = t.match(new RegExp(RND + '하여 ' + PLACE + '의? ?자리까지 나타내면')))) { const ns = [...t.matchAll(/\d+(?:\.\d+)?/g)].map(x => x[0]); if (ns.length === 1) return { num: +gRound(ns[0], m[1], m[2]) }; }
  // 낱말 문제 — 묶음·지폐·보트·봉지·상자
  if ((m = t.match(/(\d+)원을 (\d+)원짜리 지폐로만 (낸다면|내면) 최소/))) return { num: Math.ceil(+m[1] / +m[2]) * +m[2] };
  if ((m = t.match(/(\d+)원을 (\d+)원짜리 지폐로만 (바꾼다면|바꾸면) 최대/))) return { num: Math.floor(+m[1] / +m[2]) * +m[2] };
  if ((m = t.match(/(\d+)명이 (\d+)명씩 탈 수 있는 \S+에 모두 타려면 .*최소 몇 대/))) return { num: Math.ceil(+m[1] / +m[2]) };
  if ((m = t.match(/(\d+)명에게 .*?(\d+)(권|개) ?(?:묶음|씩 묶음)으로만 판다면 (?:최소 )?몇 (권|개)/))) return { num: Math.ceil(+m[1] / +m[2]) * +m[2] };
  if ((m = t.match(/(\d+)개를 .*?(\d+)개씩 .*최대 몇 개/))) return { num: Math.floor(+m[1] / +m[2]) * +m[2] };
  if ((m = t.match(/(\d+)권 읽을 때마다 .*?(\d+)권 읽었다면 .*몇 권/))) return { num: Math.floor(+m[2] / +m[1]) };
  if ((m = t.match(/([\d.]+) ?(kg|g) ?(?:이|가)? ?필요(?:한데|하고) ([\d.]+) ?(kg|g) ?씩 .*몇 봉지/))) { ok(m[2] === m[4], '단위 다름'); return { num: Math.ceil(+m[1] / +m[3] - 1e-9) }; }
  if ((m = t.match(/(\d+) kg 을 한 상자에 (\d+) kg 씩 담아 한 상자에 (\d+)원씩 받고 모두 팔면/))) return { num: Math.floor(+m[1] / +m[2]) * +m[3] };
  // 범위 말
  R = parseRange(t); if (!R) return undefined;
  const ls = listIn(t);
  if (ls && /(모두 몇 (개|명)|몇 명)/.test(t)) return { num: ls.filter(v => inR(v, R)).length };
  if (/아닌 것/.test(t) && d && d.options) return pick(d.options, o => !inR(parseFloat(o), R));
  if (/(볼|탈) 수 있을까요/.test(t) && (m = t.match(/딱 (\d+)세/)) && d && d.options) return pick(d.options, o => o === (inR(+m[1], R) ? '볼 수 있다' : '볼 수 없다'));
  if (/자연수/.test(t)) { const N = nats(R);
    if (/모두 몇 개/.test(t)) { ok(N.list, '끝없는 범위를 셈'); return { num: N.list.length }; }
    if (/가장 작은/.test(t)) return { num: Math.max(1, N.a) };
    if (/가장 큰/.test(t)) { ok(N.b != null, '가장 큰 수 없음'); return { num: N.b }; }
    if (/모두 더하면/.test(t)) return { num: N.list.reduce((a, b) => a + b, 0) }; }
  return undefined; }

/* 그림에서 답을 셈 */
function figAns(f, q0, d) { if (!f) return undefined; const t = clean(q0);
  if (f.k === 'rgl' && /수직선이 나타내는 수의 범위/.test(t)) { const rows = readRgl(f); ok(rows.length === 1 && rows[0].R, '범위 줄 하나'); return pick(d && d.options, o => o === words(rows[0].R)); }
  if (f.k === 'vch') { const R = parseRange(t); const vs = readVch(f).map(c => parseFloat(c.v));
    if (R && /모두 몇 개/.test(t)) return { num: vs.filter(v => inR(v, R)).length };
    if (R && /아닌 것/.test(t)) { const no = readVch(f).filter(c => !inR(parseFloat(c.v), R)); return no.length === 1 ? pick(d && d.options, o => o === no[0].v) : null; }
    return undefined; }
  if (f.k === 'rdial') { const ds = readDial(f); if (ds.length !== 1) return undefined; return { num: +gRound(ds[0].n, ds[0].method, ds[0].place) }; }
  if (f.k === 'nlz') { if (!/나타내면/.test(t)) return undefined; const z = readNlz(f); return { num: nlzRound(z.at, z.step, z.mode) }; }
  if (f.k === 'rtb') { const tb = readTbl(f); let m;
    if ((m = t.match(/(\d+) kg인 소포의 요금/))) { const i = bracket(tb.rows, +m[1]); return i == null ? null : { num: parseFloat(tb.rows[i][1]) }; }
    if ((m = t.match(/\((\d+)세\)는 한 번에 몇 mL/))) { const i = bracket(tb.rows, +m[1]); return i == null ? null : pick(d && d.options, o => o === tb.rows[i][1]); }
    if (/입장료는 모두 몇 원/.test(t)) { const ages = [...t.matchAll(/\((\d+)세\)/g)].map(x => +x[1]); let s = 0; for (const g of ages) { const i = bracket(tb.rows, g); if (i == null) return null; s += parseFloat(tb.rows[i][tb.rows[i].length - 1]); } return { num: s }; }
    if (/몇 봉지/.test(t) && tb.rows.length === 1) { const need = parseFloat(tb.rows[0][1]), unit = parseFloat(tb.rows[0][2]); return { num: Math.ceil(need / unit - 1e-9) }; }
    return undefined; }
  if (f.k === 'est' && /합은 약 몇 원/.test(t)) { const tb = readTbl(f); return { num: tb.rows.slice(0, -1).reduce((a, r) => a + +r[2] * +r[3], 0) }; }
  return undefined; }
function optOf(res, d) { if (!res || res.opt != null || !d || !d.options) return res; if (res.word != null) return pick(d.options, o => o === res.word) || res; if (res.num != null) return pick(d.options, o => parseFloat(o) === res.num && !/,/.test(o)) || res; return res; }
function checkAns(where, res, d, ansText) {
  if (res.opt != null) { ok(d && d.options, where + ' 보기 없는데 보기 셈'); const ci = d.options.findIndex(o => o.correct); ok(res.opt === ci, where + ' 셈한 보기 ' + d.options[res.opt].text + ' ≠ 정답 ' + d.options[ci].text); return; }
  if (res.num != null) { const got = d && 'answer' in d ? d.answer : +String(ansText).trim(); ok(got === res.num, where + ' ' + res.num + ' ≠ ' + got); if (ansText != null) ok(String(ansText).trim() === String(res.num), where + ' 답 글자 ' + ansText); return; }
  if (res.word != null) { ok(String(ansText).trim() === res.word, where + ' ' + res.word + ' ≠ ' + ansText); return; }
  throw new Error(where + ' 셈 결과 꼴 모름'); }

console.log('═══ A. 로드 ═══');
T('10차시 키 u1_l01~l10 · 파일 data/g5s2_math_u1.js', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 5학년 2학기 · 1단원 수의 범위와 어림하기 · 성취기준 · live_url 실파일 · 40분 · source', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 5 && m.term === 2 && m.unit === 1 && m.subject === '수학' && m.unit_title === '수의 범위와 어림하기' && /수의 범위와 어림하기/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); ok(/grade5\/semester2\/math\/1단원_수의범위와어림하기\//.test(m.source) && m.source.endsWith(SRC[k].file), k + ' source'); }));
T('slug — KT2.slugOf({g:5,s:math,t:2}) = g5s2_math', () => ok(KT2.slugOf({ g: 5, s: 'math', t: '2' }) === 'g5s2_math', 'slug'));
T('그림 부품 rgl·vch·rdial·nlz·rtb·est 등록 · 모르는 자리·어림은 던짐', () => { [{ k: 'rgl', rows: [{ from: 1, to: 3 }] }, { k: 'vch', items: [{ v: '1' }] }, { k: 'rdial', items: [{ n: '12', method: '올림', place: '십' }] }, { k: 'nlz', from: 10, to: 20, step: 10, at: 15 }, { k: 'rtb', rows: [['a', 'b']] }, { k: 'est', rows: [{ name: 'a', price: 1, est: 1, cnt: 1, sum: 1 }], total: 1 }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); }); let th = 0; try { w.KT2_RDCALC('12', '올림', '억'); } catch (e) { th++; } try { w.KT2_RDCALC('12', '깎기', '십'); } catch (e) { th++; } ok(th === 2, '던짐 ' + th); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (5학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 10종 서로 다름', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 10, im.join(',')); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : '지난 학년 되짚기(수직선·어림)'), () => { const rv = L[k].slides[1].data;
  if (!i) { ok(rv.from === '' && rv.items.length === 3 && /지난 학년/.test(rv.title), 'l01 되짚기'); ok(/수직선/.test(rv.content) && /어림/.test(rv.content), 'l01 되짚기 글'); return; }
  const ex = L[KEYS[i - 1]].slides[15].data.items; ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(JSON.stringify(rv.items.map(x => [x.q, x.a])) === JSON.stringify(ex.map(x => [x.q, x.a])), '출구 어긋남'); }));

console.log('═══ E. 정답 다시 셈 ═══');
let nCheck = 0, nFigQ = 0, nBoth = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구' + (k === 'u1_l01' ? '·되짚기' : '') + ' 정답 (글 셈 · 그림 셈)', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; let ta = textAns(d.question, d); if (ta) ta = optOf(ta, d); let fa = d.fig ? figAns(d.fig, d.question, d) : undefined; if (fa) fa = optOf(fa, d);
    ok(ta !== null && fa !== null, s.id + ' 답이 하나로 안 정해짐 ' + JSON.stringify([ta, fa]));
    if (fa !== undefined) nFigQ++; if (ta !== undefined && fa !== undefined) { nBoth++; ok(SAME(ta, fa), s.id + ' 글 셈 ' + JSON.stringify(ta) + ' ≠ 그림 셈 ' + JSON.stringify(fa)); }
    if (d.options) ok(d.options.filter(o => o.correct).length === 1 && !('answer' in d), s.id + ' 보기 정답 수'); else ok(d.input === 'count_input' && Number.isFinite(d.answer) && new RegExp('\\*\\*' + d.answer + '\\*\\*$').test(d.note), s.id + ' 수 입력 · 풀이 끝 = 답');
    const r = ta !== undefined ? ta : fa; if (r === undefined) { unread.push(k + ' ' + s.id); return; } nCheck++; checkAns(s.id, r, d); });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(tt => { const r = textAns(lv[tt].q); if (r == null) { unread.push(k + ' ' + tt); return; } nCheck++; checkAns(tt, r, null, lv[tt].a); ok(lv[tt].steps.length >= 3, tt + ' 풀이 단계'); });
  const its = sl[15].data.items.concat(k === 'u1_l01' ? sl[1].data.items : []);
  its.forEach(it => { const r = textAns(it.q); if (r == null) { unread.push(k + ' ' + it.q.slice(0, 18)); return; } nCheck++; checkAns('「' + it.q.slice(0, 16) + '」', r, null, it.a); }); }));
T('다시 셈한 정답 ≥ 80 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 20 · 글·그림 둘 다 셈해 대조 ≥ 12 · 뜻 사전 ≥ 6', () => ok(nCheck >= 80 && !unread.length && nFigQ >= 20 && nBoth >= 12 && nDef >= 6, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 둘 다 ' + nBoth + ' · 뜻 ' + nDef + ' · 못 읽음 ' + unread.join(' | ')));
T('셈기 자체 확인 — 어림·범위·낱말 문제 틀린 답 잡음', () => {
  [['543', '올림', '십', '550'], ['2500', '올림', '백', '2500'], ['4.521', '올림', '소수 둘째', '4.53'], ['9.97', '올림', '소수 첫째', '10.0'], ['999', '반올림', '십', '1000'], ['5.639', '버림', '일', '5'], ['2449', '반올림', '백', '2400'], ['1.573', '반올림', '일', '2'], ['58600', '버림', '만', '50000'], ['3.457', '올림', '소수 첫째', '3.5']].forEach(([n, me, p, r]) => ok(gRound(n, me, p) === r, n + ' ' + me + ' ' + p + ' → ' + gRound(n, me, p)));
  for (let n = 1; n < 3000; n += 7) ['올림', '버림', '반올림'].forEach(me => ['십', '백', '천'].forEach(p => { const u = 10 ** PL[p]; const want = me === '올림' ? Math.ceil(n / u) * u : me === '버림' ? Math.floor(n / u) * u : Math.floor(n / u + 0.5) * u; ok(+gRound(String(n), me, p) === want, n + me + p); ok(w.KT2_RDCALC(String(n), me, p) === gRound(String(n), me, p), '부품 셈 ' + n + me + p); }));
  let caught = 0; const probes = [['10보다 크고 15보다 작은 자연수는 모두 몇 개일까요?', '5'], ['4 이상 9 미만인 자연수는 모두 몇 개일까요?', '6'], ['학생 143명이 10명씩 탈 수 있는 보트에 모두 타려면 보트는 최소 몇 대 필요할까요?', '14'], ['동전 46800원을 10000원짜리 지폐로만 바꾸면 최대 얼마까지 바꿀 수 있을까요?', '50000'], ['2499를 반올림하여 천의 자리까지 나타내면 얼마일까요?', '3000'], ['치즈가 3.2 kg 필요하고 1 kg 씩 한 봉지로 판다면 몇 봉지를 사야 할까요?', '3']];
  probes.forEach(([q, a]) => { try { checkAns('probe', textAns(q), null, a); } catch (e) { caught++; } }); ok(caught === probes.length, '잡은 수 ' + caught + '/' + probes.length);
  const bad = { k: 'rgl', rows: [{ from: 50, to: 60, lo: 52, loInc: true, hi: 58, hiInc: true }] }; ok(words(readRgl(bad)[0].R) === '52 이상 58 이하인 수', '그림 범위 다시 읽기'); });

console.log('═══ F. 식 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const CH = /(?<![\d.])(\(?\d+(?:\.\d+)?(?:\s*[+\-×÷]\s*\(?\d+(?:\.\d+)?\)?)+\)?)\s*=\s*(\d+(?:\.\d+)?)(?![\d.])/g;
const normE = (s) => String(s).replace(/\*\*/g, '').replace(/[−–]/g, '-').replace(/(\d)\s*(원|개|명|권|대|봉지|마리|kg|g|mL|L|세)(?![a-zA-Z가-힣])/g, '$1');
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = normE(s0); let m; CH.lastIndex = 0; while ((m = CH.exec(s))) { let lhs = m[1]; const o = (lhs.match(/\(/g) || []).length, c = (lhs.match(/\)/g) || []).length; if (o !== c) lhs = lhs.replace(/^\(/, '').replace(/\)$/, ''); const e = lhs.replace(/×/g, '*').replace(/÷/g, '/'); if (!/^[\d.\s+\-*/()]+$/.test(e)) continue; const v = Function('return (' + e + ')')(); nEq++; if (Math.abs(v - +m[2]) > 1e-9) bad.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('식 전수 재셈 (등호 ' + nEq + ') 틀림 0', () => ok(bad.length === 0 && nEq >= 8, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['9000×20 = 18000', '26 + 28 + 30 = 86', '2000 × 3 = 600'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('9000×20 = 180000 · 2000×5 = 10000원', 'ok'); ok(bad.length === b0, '오탐 ' + bad.slice(b0).join('|')); bad.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, k, s]); }));
const nG = { rgl: 0, pt: 0, picks: 0, cap: 0, vch: 0, mk: 0, dial: 0, claim: 0, nlz: 0, rtb: 0, est: 0 };
T('개념 40장 모두 그림 · 기본 문제 그림 30 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'concept').length === 40 && figs.filter(x => x[2] === 'basic_problem').length === 30, '개념 ' + figs.filter(x => x[2] === 'concept').length + ' · 기본 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
function checkRgl(w0, f, b) { const rows = readRgl(f); const spec = f.rows || [f]; ok(rows.length === spec.length, w0 + ' 줄 수');
  rows.forEach((r, i) => { const o = spec[i]; nG.rgl++; const n = Math.round((o.to - o.from) / (o.step || 1)); ok(r.ticks.length === n + 1 && r.ticks[0].v === o.from && r.ticks[n].v === o.to, w0 + ' 눈금');
    const want = (o.lo != null || o.hi != null) ? { lo: o.lo != null ? o.lo : null, hi: o.hi != null ? o.hi : null } : null; if (want) { if (o.lo != null) want.loInc = !!o.loInc; if (o.hi != null) want.hiInc = !!o.hiInc; }
    ok(SAME(r.R && { lo: r.R.lo, hi: r.R.hi, loInc: r.R.loInc, hiInc: r.R.hiInc }, want && { lo: want.lo, hi: want.hi, loInc: want.loInc, hiInc: want.hiInc }), w0 + ' 다시 읽은 범위 ' + JSON.stringify(r.R) + ' ≠ 명세 ' + JSON.stringify(want)); nG.pt += r.pts.length;
    if (b === 'basic_problem') ok(r.ask && r.cap === '?' && !r.picks.length, w0 + ' 문제 그림은 「?」·고른 점 없음');
    if (!r.ask && r.cap) { const CR = parseRange(r.cap); if (CR && r.R) { nG.cap++; ok(words(CR) === words(r.R), w0 + ' cap 「' + r.cap + '」 ↔ 그림 ' + words(r.R)); } else if (CR) ok(r.picks.length, w0 + ' cap 범위인데 띠도 고른 점도 없음');
      if (r.picks.length) { nG.picks++; const PR = parseRange(r.cap); if (PR && /자연수/.test(r.cap)) ok(SAME(r.picks, nats(PR).list), w0 + ' 고른 점 ' + r.picks + ' ≠ 범위 자연수'); } } }); }
figs.forEach(([w0, f, b]) => { if (f.k === 'rgl') T(w0 + ' rgl — ●○·띠 다시 읽기 = 명세 · cap 범위 = 그림 · 고른 점 = 범위 자연수', () => checkRgl(w0, f, b)); });
T('vch — note 조건(이상·미만·5~9 올림) ↔ ○△표 · 문제 그림 표 없음', () => figs.forEach(([w0, f, b]) => { if (f.k !== 'vch') return; nG.vch++; const cs = readVch(f);
  if (b === 'basic_problem') { ok(cs.every(c => !c.mk && !c.o && !c.t), w0 + ' 문제 그림에 표'); return; }
  if (!f.note) return; const tri = /△표/.test(f.note); let R = parseRange(f.note); if (!R && /5~9는 올린다/.test(f.note)) R = { lo: 5, loInc: true, hi: null }; ok(R, w0 + ' note 조건 못 읽음 ' + f.note);
  cs.forEach(c => { const want = inR(parseFloat(c.v), R) ? (tri ? 't' : 'o') : ''; nG.mk++; ok(c.mk === want && c.o === (want === 'o') && c.t === (want === 't'), w0 + ' ' + c.v + ' 표 ' + c.mk + ' ≠ ' + want); }); }));
T('rdial — data-calc = 게이트 셈 · 결과 칸 = 셈(bad 면 다름) · 밑줄 자리 = 구하려는 자리 · 머리말', () => figs.forEach(([w0, f, b]) => { if (f.k !== 'rdial') return; const ds = readDial(f); ok(ds.length === f.items.length, w0 + ' 카드 수');
  ds.forEach((c, i) => { nG.dial++; const g = gRound(c.n, c.method, c.place); ok(c.calc === g, w0 + ' calc ' + c.calc + ' ≠ ' + g); ok(c.tgtE === PL[c.place], w0 + ' 밑줄 자리'); ok(c.head === c.method + '하여 ' + c.place + (/^소수/.test(c.place) ? ' 자리까지' : '의 자리까지'), w0 + ' 머리말 ' + c.head);
    if (f.items[i].ask) ok(c.shown === '?' && c.res === '', w0 + ' 물음 카드'); else if (c.bad) ok(c.shown !== g, w0 + ' 틀린 카드인데 맞음'); else ok(c.shown === g && c.res === g, w0 + ' 결과 ' + c.shown + ' ≠ ' + g); }); }));
T('글 속 「N을 …하여 …자리까지 나타내면 R」·「…자리까지면 R」 = 게이트 셈 (개념·요약·발문·활동 전부)', () => { const re = new RegExp('(\\d+(?:\\.\\d+)?)(?:명)?[을를] ' + RND + '하여 ' + PLACE + '의? ?자리까지 나타내면 \\**(\\d+(?:\\.\\d+)?)', 'g'); const re2 = new RegExp('(?:,|·) ?(?:' + RND + '하여 )?' + PLACE + '의? ?자리까지(?: 나타내)?면 \\**(\\d+(?:\\.\\d+)?)', 'g');
  allStr.forEach(([s0, where]) => { const s = clean(s0); let m; re.lastIndex = 0; while ((m = re.exec(s))) { nG.claim++; ok(gRound(m[1], m[2], m[3]) === m[4], where + ' 「' + m[0] + '」 → ' + gRound(m[1], m[2], m[3]));
      re2.lastIndex = m.index + m[0].length; let m2; const rest = s.slice(re2.lastIndex, re2.lastIndex + 60); const r2 = new RegExp(re2.source, 'g'); while ((m2 = r2.exec(rest)) && m2.index < 4) { nG.claim++; const me = m2[1] || m[2]; ok(gRound(m[1], me, m2[2]) === m2[3], where + ' 이어진 「' + m2[0] + '」'); r2.lastIndex = m2.index + m2[0].length; const nx = rest.slice(r2.lastIndex); if (!/^\s*(,|·|이고|다|이다|\.)/.test(nx)) break; } } });
  const t10 = clean(L.u1_l10.slides[4].data.content); const m = t10.match(/(\d+)명을 (백)의 자리까지 어림해 보자\. 올림하면 (\d+), 버림하면 (\d+), 반올림하면 (\d+)/); ok(m, 'l10 세 방법 줄'); ['올림', '버림', '반올림'].forEach((me, i) => { nG.claim++; ok(gRound(m[1], me, m[2]) === m[3 + i], 'l10 ' + me); });
  const t7 = clean(L.u1_l10.slides[6].data.content).match(/(\d+)은 버림하면 (\d+), 반올림하면 (\d+)/); ok(t7 && gRound(t7[1], '버림', '백') === t7[2] && gRound(t7[1], '반올림', '백') === t7[3], 'l10 5267'); nG.claim++;
  ok(nG.claim >= 12, '글 속 어림 ' + nG.claim); });
T('nlz — 눈금 · 한가운데 = (처음+끝)/2 · 고른 수 = 어림(올림 위·버림 아래·반올림 가까운 쪽) · 문제 그림 고른 수 없음 · cap 경계 다시 셈', () => figs.forEach(([w0, f, b]) => { if (f.k !== 'nlz') return; nG.nlz++; const z = readNlz(f);
  ok(z.ticks.length === Math.round((z.to - z.from) / z.step) + 1, w0 + ' 눈금'); if (z.mid != null) ok(z.mid === (z.from + z.to) / 2, w0 + ' 한가운데'); ok(z.at > z.from && z.at < z.to, w0 + ' at');
  if (b === 'basic_problem') ok(z.pick === null, w0 + ' 문제 그림에 고른 수'); else if (z.pick != null) ok(z.pick === nlzRound(z.at, z.step, z.mode), w0 + ' 고른 수 ' + z.pick + ' ≠ ' + nlzRound(z.at, z.step, z.mode));
  if (f.cap) { let m; if ((m = f.cap.match(/(\d+)이거나 그보다 오른쪽이면 (\d+)으로 올라간다/))) { const s = z.step; ok(nlzRound(+m[1], s, 'near') === +m[2] && nlzRound(+m[1] - 1, s, 'near') !== +m[2], w0 + ' cap 경계 ' + f.cap); }
    else if ((m = f.cap.match(/^(\d+)을 (\d+)개 묶음으로 — 최소/))) ok(z.mode === 'up' && +m[2] === z.step && +m[1] === z.at, w0 + ' cap 올림'); else if ((m = f.cap.match(/^(\d+)을 (\d+)개씩 — 최대/))) ok(z.mode === 'down' && +m[2] === z.step && +m[1] === z.at, w0 + ' cap 버림'); else if ((m = f.cap.match(/^(\d+)은 (\d+)과 (\d+) 중/))) ok(+m[1] === z.at && +m[2] === z.from && +m[3] === z.to, w0 + ' cap 둘 중'); else throw new Error(w0 + ' cap 못 읽음 ' + f.cap); } }));
T('rtb — 칸 = 명세 · 범위 표는 겹침·빈틈 0(차례로 이어짐) · 반올림 열 = 게이트 셈 · 강조 줄 = 글이 짚은 줄', () => figs.forEach(([w0, f, b]) => { if (f.k !== 'rtb') return; nG.rtb++; const tb = readTbl(f);
  ok(SAME(tb.rows, f.rows.map(r => r.map(String))), w0 + ' 칸'); if (f.head) ok(SAME(tb.head, f.head), w0 + ' 머리');
  const col = f.head ? f.head.findIndex(h => /범위|무게|나이/.test(h)) : -1; if (col >= 0) { const Rs = f.rows.map(r => parseRange(r[col])); ok(Rs.every(Boolean), w0 + ' 범위 칸 못 읽음');
    Rs.slice(1).forEach((R, i) => { const P = Rs[i]; if (P.hi == null) return; const lo = R.lo; ok(lo === P.hi && (P.hiInc !== R.loInc), w0 + ' 줄 ' + i + '→' + (i + 1) + ' 겹침·빈틈 (' + words(P) + ' / ' + words(R) + ')'); }); }
  if (f.head && /반올림하여 (만|천|백)의 자리까지/.test(f.head[2] || '')) { const p = f.head[2].match(/반올림하여 (만|천|백)/)[1]; f.rows.forEach(r => ok(gRound(r[1], '반올림', p) === r[2], w0 + ' ' + r[0] + ' ' + r[1] + ' → ' + r[2])); }
  if (f.hi != null && b === 'concept') { const s = figs.find(x => x[1] === f)[4]; ok(clean(s.data.content).indexOf(f.rows[f.hi][0].replace(/광역시$/, '')) >= 0, w0 + ' 강조 줄 ' + f.rows[f.hi][0] + ' 이 글에 없음'); } }));
T('체감 온도 표 — l04 출구 「33 °C 는 어느 단계」·개념 「30.9 °C 는 관심」 = 표 구간 찾기', () => { const tb = L.u1_l04.slides.find(s => s.data.fig && s.data.fig.k === 'rtb' && /단계/.test(s.data.fig.head[0])).data.fig; const ex = L.u1_l04.slides[15].data.items.find(x => /체감 온도/.test(x.q)); const t = +ex.q.match(/(\d+) °C 는/)[1];
  ok(tb.rows[bracket(tb.rows, t)][0] === ex.a, '출구 ' + t); ok(tb.rows[bracket(tb.rows, 30.9)][0] === '관심', '30.9'); ok(clean(ex.q).indexOf(tb.rows[1][0] + ' ' + tb.rows[1][1]) >= 0, '출구 괄호 = 표 줄'); });
T('rtb l09 「구입해야 하는 양」 = 필요한 양을 봉지 단위로 올림 (100 g 봉지)', () => { const f = L.u1_l09.slides.find(s => s.block === 'concept' && s.data.fig.k === 'rtb').data.fig; f.rows.forEach(r => { const m = r[2].match(/^(\d+) g \((\d+)봉지\)$/); if (!m) { ok(r[1] === r[2], r[0]); return; } const need = parseFloat(r[1]); ok(+m[1] === Math.ceil(need / 100) * 100 && +m[2] === Math.ceil(need / 100), r[0]); }); });
T('est — 어림한 가격 = 반올림 천의 자리 · 어림셈 = 어림값×수량 · 합 · 실제 비용(note) = Σ 가격×수량 · 개념 글 「약 N원」', () => figs.forEach(([w0, f, b]) => { if (f.k !== 'est') return; nG.est++; const tb = readTbl(f); const rows = tb.rows.slice(0, -1); ok(rows.length === f.rows.length, w0 + ' 줄');
  rows.forEach((r, i) => { ok(gRound(r[1], '반올림', '천') === r[2], w0 + ' ' + r[0] + ' 어림값'); ok(+r[2] * +r[3] === +r[4], w0 + ' ' + r[0] + ' 곱'); ok(+r[1] === f.rows[i].price && +r[3] === f.rows[i].cnt, w0 + ' 명세'); });
  const tot = rows.reduce((a, r) => a + +r[4], 0); const last = tb.rows[tb.rows.length - 1].slice(-1)[0]; if (f.ask) ok(last === '약 ?', w0 + ' 물음'); else { ok(last === '약 ' + tot && f.total === tot, w0 + ' 합 ' + last); }
  if (f.note) { const real = +f.note.match(/(\d+)원/)[1]; ok(real === f.rows.reduce((a, r) => a + r.price * r.cnt, 0), w0 + ' 실제 비용'); }
  if (b === 'concept') { const s = figs.find(x => x[1] === f)[4]; ok(clean(s.data.content).indexOf('약 ' + tot + '원') >= 0, w0 + ' 글 합'); } }));
T('그림 부품 수 — rgl 줄 ≥ 25 · 점 ≥ 30 · cap 범위 ≥ 15 · vch ≥ 9 · ○△표 ≥ 20 · rdial 카드 ≥ 30 · nlz ≥ 8 · rtb ≥ 8 · est ≥ 2', () => ok(nG.rgl >= 25 && nG.pt >= 30 && nG.cap >= 15 && nG.vch >= 9 && nG.mk >= 20 && nG.dial >= 30 && nG.nlz >= 8 && nG.rtb >= 8 && nG.est >= 2, JSON.stringify(nG)));
T('그림 검사기 자체 확인 — 띠·●○ 뒤바뀜 · cap 어긋남 · 고른 점 · 틀린 어림 카드 · 표 겹침 · ○표 어긋남 잡음', () => { let caught = 0; const tr = (fn) => { try { fn(); } catch (e) { caught++; } };
  const base = { k: 'rgl', rows: [{ from: 1, to: 5, lo: 2, loInc: true, cap: '2 이상인 수' }] }; checkRgl('ok', base, 'concept');
  const keep = FIG.render; FIG.render = (f) => keep(f).replace('fill="#C2551A" stroke="#C2551A" stroke-width="4.5"', 'fill="#fff" stroke="#C2551A" stroke-width="4.5"'); tr(() => checkRgl('probe●', base, 'concept')); FIG.render = keep;
  tr(() => checkRgl('probe-cap', { k: 'rgl', rows: [{ from: 1, to: 5, lo: 2, loInc: true, cap: '2 초과인 수' }] }, 'concept'));
  tr(() => checkRgl('probe-pick', { k: 'rgl', rows: [{ from: 33, to: 41, picks: [35, 36, 37, 38], cap: '34보다 크고 40보다 작은 자연수' }] }, 'concept'));
  tr(() => { const c = readDial({ k: 'rdial', items: [{ n: '657', method: '버림', place: '십', result: '660' }] })[0]; ok(c.shown === gRound(c.n, c.method, c.place), '틀린 카드'); });
  tr(() => { const Rs = [['3세 이상 7세 미만'], ['7세 초과 11세 미만']].map(r => parseRange(r[0])); ok(Rs[1].lo === Rs[0].hi && Rs[0].hiInc !== Rs[1].loInc, '빈틈'); });
  tr(() => { const R = parseRange('12세 미만'); readVch({ k: 'vch', items: [{ v: '11세', mk: 't' }, { v: '12세', mk: 't' }] }).forEach(c => ok(c.mk === (inR(parseFloat(c.v), R) ? 't' : ''), '○△')); });
  ok(caught === 6, '잡은 수 ' + caught); });

console.log('═══ H. 재료 충실 ═══');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+(?:\.\d+)?/g) || []).join(',');
const srcP = (k, d) => SRC[k].problems.filter(p => normT(p.q).slice(0, 5) === normT(d.question).slice(0, 5) && numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts, d.options.map(o => o.text)) : !d.options && +p.a === d.answer));
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제(앞머리·수 같음 · 보기·정답 그대로) · 다음 시간 = 원문 다음', () => { const src = SRC[k]; const texts = src.slides.map(x => normT(x.text));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(normT(s.data.content)) >= 0 || src.slides.some(x => { const full = normT(x.text); let at = 0; return String(s.data.content).split('\n').every(ln => { const q = normT(ln); const j = q ? full.indexOf(q, at) : -1; if (j < 0) return false; at = j + q.length; return true; }); }), s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const ps = srcP(k, s.data); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length + '개 맞음'); const p = ps[0]; if (p.opts) ok(JSON.stringify(s.data.options.map(o => o.text)) === JSON.stringify(p.opts) && s.data.options[p.ci].correct, s.id + ' 보기·정답'); else ok(s.data.answer === +p.a, s.id + ' 답'); });
  const nx = L[k].slides[18].data; if (k !== 'u1_l10') ok(nx.preview.indexOf(src.next) === 0, '다음 ' + nx.preview); }));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(nsp); const dup = n.filter((x, j) => n.indexOf(x) !== j); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));
T('수준별 기본·도전은 출구·기본 문제와 수가 다름(같은 문항 되풀이 0)', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const other = sl.filter(s => s.block === 'basic_problem').map(s => numsOf(s.data.question)).concat(sl[15].data.items.map(x => numsOf(x.q))); ['기본', '도전'].forEach(t => ok(other.indexOf(numsOf(lv[t].q)) < 0, k + ' ' + t + ' 수 같음 ' + numsOf(lv[t].q))); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 다음 단원 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~는가?」「~면?」「~은?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?/.test(t) || /[^요]\?/.test(t.replace(/\?\s*\(.*\)$/, '?')) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 2단원 분수의 곱셈 · 다른 차시는 「다음 시간엔」', () => { const nx = L.u1_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /분수의 곱셈/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); });

console.log('═══ L. 선행 용어 ═══');
// 원문 문제의 보기(헷갈리는 보기로 다음 차시 말을 쓴 것 — 예: l02 「13 초과인 수」)는 원문 그대로라 양쪽에서 뺀다
const stud = (k) => L[k].slides.filter(s => s.block !== 'next_lesson').map(s => { const d = Object.assign({}, s.data); delete d.tnote; if (s.block === 'basic_problem') delete d.options; return JSON.stringify(d); }).join(' ');
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems.map(p => Object.assign({}, p, { opts: null }))) + SRC[k].summary + SRC[k].title;
const FIRST = [['이상', 2], ['이하', 2], ['초과', 3], ['미만', 3], ['올림', 5], ['버림', 6], ['반올림', 7]];
const has = (txt, w0) => (w0 === '올림' ? txt.replace(/반올림/g, '') : txt).indexOf(w0) >= 0;
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0(l01 단원 도입 예외) · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i === 0 || i + 1 >= n) return; ok(!has(stud(k), w0), k + ' 케이티처에 선행 「' + w0 + '」'); ok(!has(srcTxt(k), w0), k + ' 원문에도 선행 — 차례 다시 볼 것'); }); ok(has(stud(KEYS[n - 1]), w0), KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); ok(has(srcTxt(KEYS[n - 1]), w0), '원문 ' + KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('발문(tnote)에도 선행 용어 0 (l01 예외)', () => KEYS.forEach((k, i) => { if (!i) return; const tn = JSON.stringify(L[k].slides.map(s => s.data.tnote || null)); FIRST.forEach(([w0, n]) => { if (i + 1 < n) ok(!has(tn, w0), k + ' 발문 「' + w0 + '」'); }); }));
T('요약 arrows 에 다음 차시 용어 0', () => KEYS.forEach((k, i) => { if (!i) return; const ar = JSON.stringify(L[k].slides[16].data.arrows); FIRST.filter(([, n]) => n > i + 1).forEach(([w0]) => ok(!has(ar, w0), k + ' 요약에 「' + w0 + '」')); }));
T('선행 검사기 자체 확인 — 「반올림」만 있는 글은 「올림」 아님 · 심은 낱말 잡음', () => { ok(!has('반올림하여', '올림') && has('올림과 반올림', '올림'), '올림 분리'); ok(!has(stud('u1_l02'), '초과'), 'l02 깨끗'); ok(has(stud('u1_l02') + ' 초과', '초과'), '심은 낱말'); });

console.log('═══ N. 차단 어휘 · 「결」 · 인물 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」은 원문 그림 note 「반올림 결과도」 하나뿐 · 곰이·펭이 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '곰이', '펭이'].forEach(b => ok(all.indexOf(b) < 0, b)); const at = [...all.matchAll(/결/g)].map(m => all.slice(m.index - 10, m.index + 6)); ok(at.length === 1 && /반올림 결과도/.test(at[0]), '「결」 ' + at.join(' | ')); });
T('교사 층(발문·오개념·활동·수준별·넓히기·요약 이야기) 「결」 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') return; const d = Object.assign({}, s.data); delete d.fig; ok(JSON.stringify(d).indexOf('결') < 0, k + ' ' + s.id); })));

console.log('\n게이트 g5s2 수학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
