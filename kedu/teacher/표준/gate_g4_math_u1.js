/* gate_g4_math_u1.js — 4학년 1학기 수학 1단원 「큰 수」 케이티처 2세대 게이트 (57차, 베프 — 3-2 수학 u6 게이트 틀 + 큰 수 검산).
   4학년은 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g3s2 u6_l07 → l01 → … → l08)
   E 문제 정답 재계산(자릿값 숫자·값 · 몇 개인 수 · 얼마만큼 더 큰 · 뛰어 세기 빈칸·다음 수 · 더 큰 수 · 억·조가 몇 개 · 한글 → 수 · 읽기 · 부등호 · 0의 개수 · 카드로 가장 큰·작은 수)
   F 산수 전수(× + − 식 · 「N = a + b + …」 풀어 쓴 식) · 읽기 쌍 전수(「N은 ○○이에요」·「N → ○○」 — 게이트 자체 한글 셈으로)
   G 그림(pvt 칸·읽는 말·풀어 쓴 식·비교 부호·처음 달라지는 자리 · jump 수열·바뀌는 자리 · notes 합계)
   H 재료 충실(자기주도 원문 계승) · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22·연결 · K 발문 6장↑·분 합
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_math_u1.js */
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
const L = load(path.join(TDIR, 'data/g4_math_u1.js'));
const U6 = load(path.join(TDIR, 'data/g3s2_math_u6.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_math_u1.json'), 'utf8'));
const KEYS = Array.from({ length: 8 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '큰 수', classNames: [] });

/* ── 게이트 자체 큰 수 셈(부품의 readKo 와 따로 짬) ── */
const KD = { 영: 0, 일: 1, 이: 2, 삼: 3, 사: 4, 오: 5, 육: 6, 칠: 7, 팔: 8, 구: 9 }, KS = { 십: 10, 백: 100, 천: 1000 }, KB = { 만: 1e4, 억: 1e8, 조: 1e12 };
function koNum(s) { // 「백사십삼만 천오십」·「1억6000만」·「638조 7000억」·「칠천삼백구십이조」 → 수 (못 읽으면 null)
  const t = String(s).replace(/[\s,]/g, ''); if (!t || !/^[\d영일이삼사오육칠팔구십백천만억조]+$/.test(t)) return null;
  let total = 0, sec = 0, cur = null, i = 0;
  while (i < t.length) { const ch = t[i];
    if (/\d/.test(ch)) { let j = i; while (j < t.length && /\d/.test(t[j])) j++; cur = +t.slice(i, j); i = j; continue; }
    if (ch in KD) cur = KD[ch]; else if (ch in KS) { sec += (cur == null ? 1 : cur) * KS[ch]; cur = null; } else if (ch in KB) { sec += cur || 0; total += (sec || 1) * KB[ch]; sec = 0; cur = null; }
    i++; }
  return total + sec + (cur || 0); }
const NAMES = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억', '조', '십조', '백조', '천조'];
const digitAt = (n, place) => { const d = String(n), i = NAMES.indexOf(place); return i < 0 || i >= d.length ? null : +d[d.length - 1 - i]; };
function readG(n) { // 수 → 읽는 말 (게이트 쪽 따로 짠 것): 네 자리 묶음마다
  const d = String(n); if (/^0*$/.test(d)) return '영'; const G = ['', '만', '억', '조'], P = ['천', '백', '십', ''], D = '영일이삼사오육칠팔구'; const out = [];
  for (let g = Math.ceil(d.length / 4) - 1; g >= 0; g--) { const part = d.slice(Math.max(0, d.length - 4 * (g + 1)), d.length - 4 * g).padStart(4, '0'); if (/^0+$/.test(part)) continue;
    let s = ''; [...part].forEach((c, i) => { if (c === '0') return; s += (c === '1' && i < 3 ? '' : D[+c]) + P[i]; }); if (part === '0001' && g) s = '일'; out.push(s + G[g]); }
  return out.join(' '); }
const nsp = (s) => String(s).replace(/\s+/g, '');
const readOk = (ans, n) => { const a = nsp(String(ans).replace(/\(.*?\)/g, '')); const r = nsp(readG(n)); return a === r || a === r.replace(/^일만/, '만') || a === r.replace(/일만/g, '만'); };
const numIn = (s) => { const m = String(s).replace(/\*\*/g, '').match(/\d+/); return m ? +m[0] : null; };
const stepOf = (s) => { const m = String(s).match(/(\d+)\s*(만|억|조)?씩/); return m ? +m[1] * (m[2] ? KB[m[2]] : 1) : null; };

function leadP(q0) { const q = String(q0).replace(/\*\*/g, '').replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' '); let m;
  if ((m = q.match(/(\d+)\s*(만|억)?씩 (\d+)번 뛰어 세었더니 (\d+)/))) return +m[4] - (+m[1]) * (m[2] ? KB[m[2]] : 1) * (+m[3]);
  if (/어느 자리부터 비교/.test(q)) return '가장 높은 자리';
  if ((m = q.match(/(\d+)\s*=\s*([\d\s+()]+)/)) && /\(\s*\)/.test(m[2])) { const rest = m[2].split('+').map(x => x.trim()).filter(x => /^\d+$/.test(x)).reduce((a, x) => a + +x, 0); return +m[1] - rest; }
  if ((m = q.match(/(\d+)원을 (\d+)원짜리 지폐 (\d+)장과 (\d+)원짜리 동전으로/))) return (+m[1] - m[2] * m[3]) / +m[4];
  if ((m = q.match(/(\d+)원짜리 동전이 몇 개 모이면 (\d+)원/))) return +m[2] / +m[1];
  if ((m = q.match(/(만|억|조)이 (\d+)개인 수를 숫자로 쓰면 0은 모두 몇 개/))) return (String(+m[2] * KB[m[1]]).match(/0/g) || []).length;
  if (/읽어/.test(q) && /개인 수/.test(q)) { const parts = [...q.replace(/\([^)]*\)/g, '').matchAll(/(\d+)\s*(만|억|조)?이\s*(\d+)개/g)]; if (parts.length) return { read: parts.reduce((a, x) => a + (+x[1]) * (x[2] ? KB[x[2]] : 1) * (+x[3]), 0) }; }
  // 뛰어 세기 — 빈칸 또는 다음 수
  if (/뛰어 세기/.test(q)) { const st = stepOf(q); if (st == null) return null; const back = /거꾸로/.test(q); const tail = q.slice(q.indexOf('뛰어 세기') + 5);
    const toks = tail.split(/\s+−\s+/).map(x => x.trim()); if (toks.length >= 3) { const i = toks.findIndex(x => /^\(\s*\)/.test(x) || /^\(\s*\)\s*의 빈칸/.test(x)); if (i < 0) return null; const nums = toks.map(x => (/^\(/.test(x) ? null : numIn(x)));
      const k = nums.findIndex((x, j) => j !== i && x != null); const s2 = back ? -st : st; return nums[k] + (i - k) * s2; }
    if ((m = tail.match(/(\d+)\)?\s*다음 수/)) || (m = tail.match(/(\d+)\s*다음/))) return +m[1] + (back ? -st : st); return null; }
  if ((m = q.match(/(\d+)\s*씩 뛰어 세면 어느 자리/))) return NAMES[String(+m[1]).length - 1] + '의 자리';
  // 자릿값
  if ((m = q.match(/(\d+)\s*에서 (\S+?)의 자리 숫자가 나타내는 값/))) { const v = digitAt(m[1], m[2]); return v == null ? null : v * Math.pow(10, NAMES.indexOf(m[2])); }
  if ((m = q.match(/(\S+?)\s*에서 (\S+?)의 자리 숫자(?:는|가)/))) { const n = /^\d+$/.test(m[1]) ? +m[1] : koNum(m[1]); return n == null ? null : digitAt(n, m[2]); }
  if ((m = q.match(/(\d+)에서 숫자 (\d)이? ?나타내는 값과 숫자 (\d)가 나타내는 값의 차/))) { const d = m[1]; const v = (c) => { const i = d.indexOf(c); return +c * Math.pow(10, d.length - 1 - i); }; return Math.abs(v(m[2]) - v(m[3])); }
  if ((m = q.match(/(\d+)에서 숫자 (\d)(?:가|이) 나타내는 값/))) { const d = m[1], i = d.indexOf(m[2]); return +m[2] * Math.pow(10, d.length - 1 - i); }
  // 몇 개인 수 (10000이 3개, 1000이 5개 … / 1000만이 10개 / 10000(만)이 10개)
  if (/개인 수(?:는|를|이)|개인 수$|개인 수를|개인 수는/.test(q) && !/몇 개/.test(q)) { const parts = [...q.replace(/\([^)]*\)/g, '').matchAll(/(\d+)\s*(만|억|조)?이\s*(\d+)개/g)]; if (parts.length) return parts.reduce((a, x) => a + (+x[1]) * (x[2] ? KB[x[2]] : 1) * (+x[3]), 0); }
  if ((m = q.match(/(\d+)\s*(?:은|는)\s*(\d+)이 몇 개인 수/))) return +m[1] / +m[2];
  if ((m = q.match(/(\d+)\s*(?:은|는)\s*(\d+)보다 얼마만큼 더 큰/))) return +m[1] - +m[2];
  if ((m = q.match(/(\d+)원은 (\d+)원짜리 지폐 몇 장/))) return +m[1] / +m[2];
  if ((m = q.match(/(\d+)원짜리 동전(?:을|이)?(?: 모아| 몇 개가 모이면)? ?(\d+)원/))) return +m[2] / +m[1];
  if ((m = q.match(/(\d+)원짜리 동전을 모아 (\d+)원/))) return +m[2] / +m[1];
  // 억·조가 몇 개
  if ((m = q.match(/(\S+?)\s*(?:은|는)\s*(\d+)(만|억|조)?이 몇 개인 수/))) { const n = /^\d+$/.test(m[1]) ? +m[1] : koNum(m[1]); if (n != null) return n / ((+m[2]) * (m[3] ? KB[m[3]] : 1)); }
  if ((m = q.match(/(\S+?)\s*(?:은|는)\s*(억|조|만)(?:이|가) 몇 개/))) { const n = /^\d+$/.test(m[1]) ? +m[1] : koNum(m[1]); return n == null ? null : Math.floor(n / KB[m[2]]) % 10000; }
  // 더 큰 수 (두 수)
  if ((m = q.match(/(\d+)과 (\d+) 중 더 큰 수/)) || (m = q.match(/(\d+)와 (\d+) 중 더 큰 수/))) return Math.max(+m[1], +m[2]);
  // 부등호
  if ((m = q.match(/(\d+)\s*\(\s*\)\s*(\d+)/)) && /부등호/.test(q)) return +m[1] > +m[2] ? '>' : +m[1] < +m[2] ? '<' : '=';
  if ((m = q.match(/(\d+)과 (\d+) 사이에 알맞은 부등호/))) return +m[1] > +m[2] ? '>' : '<';
  // 한글 → 수
  if ((m = q.match(/([가-힣0-9 ]+?)(?:을|를)\s*(?:숫자로|수로) 쓰면/))) { const txt = m[1].replace(/^.*?(?:인구|수는|수)\s+/, ''); const n = koNum(txt.split(' ').filter(x => koNum(x) != null).join(' ')); if (/0은 모두 몇 개/.test(q)) return n == null ? null : (String(n).match(/0/g) || []).length; return n; }
  if ((m = q.match(/(\S+?)인 수를 숫자로 쓰면 0은 모두 몇 개/))) { const mm = m[1].match(/(만|억|조)이 (\d+)개/); if (!mm) return null; return (String(+mm[2] * KB[mm[1]]).match(/0/g) || []).length; }
  // 카드로 가장 큰·작은 수
  if ((m = q.match(/수 카드 ([\d,\s]+?)(?:을|를)? ?한 번씩 써서 (?:만들 수 있는 )?가장 (큰|작은) (다섯|네) 자리 수/))) { const ds = m[1].match(/\d/g).map(Number); const s = ds.slice().sort((a, b) => (m[2] === '큰' ? b - a : a - b)); if (m[2] === '작은' && s[0] === 0) { const i = s.findIndex(x => x > 0); s.unshift(s.splice(i, 1)[0]); } return +s.join(''); }
  // 읽기
  if ((m = q.match(/(\d{4,})\s*을?를?\s*(?:바르게 )?읽/))) return { read: +m[1] };
  return null; }
const same = (a, v) => { if (v && typeof v === 'object' && 'read' in v) return readOk(a, v.read); if (typeof v === 'number') { const a0 = String(a).replace(/\(.*?\)/g, '').trim(); const k = koNum(a0); if (k != null) return k === v; const d = a0.match(/\d+/); return !!d && +d[0] === v; } return nsp(a).indexOf(nsp(v)) === 0; };

console.log('═══ A. 로드 ═══');
T('8차시 키 u1_l01~l08', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 · unit_title 큰 수 · 성취기준 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 1 && m.unit === 1 && m.unit_title === '큰 수' && /\[4수01-01\]/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex07 = U6.u6_l07.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g3s2 u6_l07') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex07;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_math:u6_l07'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const v = leadP(d.question); if (v != null) { nCheck++; ok(same(d.options.find(o => o.correct).text, v), s.id + ' ' + d.question + ' → ' + JSON.stringify(v)); } else unread.push(k + ' ' + s.id); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = leadP(d.question); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' → ' + v + ' ≠ ' + d.answer); } else unread.push(k + ' ' + s.id); ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadP(lv[t].q); if (v != null) { nCheck++; ok(same(lv[t].a, v), t + ' ' + lv[t].q + ' → ' + JSON.stringify(v) + ' ≠ ' + lv[t].a); } else unread.push(k + ' ' + t); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadP(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + JSON.stringify(v) + ' ≠ ' + it.a); } else unread.push(k + ' 출구 ' + it.q.slice(0, 16)); }); }));
T('다시 계산한 정답 수 ≥ 60 (못 읽는 문항 0)', () => ok(nCheck >= 60 && !unread.length, 'nCheck ' + nCheck + ' · 못 읽음 ' + unread.join(' | ')));
T('재계산기 자체 확인 — 자릿값·몇 개·뛰어 세기·한글 셈·읽기·부등호·카드', () => {
  ok(leadP('68263 에서 **만의 자리** 숫자가 나타내는 값은?') === 60000 && leadP('**칠천삼백구십이조**에서 / **천조의 자리** 숫자는?') === 7 && leadP('4763 에서 **천의 자리** 숫자는 얼마일까요?') === 4, '자릿값');
  ok(leadP('10000이 3개, 1000이 5개, 100이 4개, / 10이 7개, 1이 6개인 수는?') === 35476 && leadP('1000만이 **10개**인 수는? / (억)') === 1e8, '몇 개인 수');
  ok(leadP('10만씩 뛰어 세기 / 5013000 − 5113000 − **( )** 의 빈칸은?') === 5213000 && leadP('20000씩 거꾸로 뛰어 세기 / **( )** − 100000 − 80000 − 60000 의 빈칸은?') === 120000 && leadP('10만씩 뛰어 세기 / 4713000 다음 수는?') === 4813000, '뛰어 세기');
  ok(koNum('백사십삼만 천오십') === 1431050 && koNum('638조 7000억') === 638700000000000 && koNum('1억6000만') === 160000000 && koNum('칠천삼백구십이조') === 7392e12 && koNum('만') === 10000, '한글 셈');
  ok(readOk('일만 오천칠백삼십구', 15739) && readOk('만 오천칠백삼십구', 15739) && !readOk('일만 오천칠백삼십', 15739) && readOk('백사십오조 구천삼백이십일억', 145932100000000) && !readOk('백사십오억 구천삼백이십일만', 145932100000000), '읽기');
  ok(leadP('빈칸에 알맞은 부등호는? / 325600000 ( ) 325700000') === '<' && leadP('수 카드 **5 3 8 1 6** 을 한 번씩 써서 / 만들 수 있는 **가장 큰** 다섯 자리 수는?') === 86531 && leadP('수 카드 2, 0, 7, 4, 9를 한 번씩 써서 만들 수 있는 가장 작은 다섯 자리 수는 얼마일까요?') === 20479, '부등호·카드'); });

console.log('═══ F. 산수·읽기 쌍 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/−/g, '-'); if (!/^[\d\s*+\-()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
let nEq = 0; const bad = [];
const eqcheck = (s, where) => { let m; const re = /(\d+(?:\s*[×+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×+−])/g;
  while ((m = re.exec(s))) { const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); }
  const re2 = /(?<![\d+−×(=]\s*)(\d{3,})\s*=\s*(\d+(?:\s*\+\s*\d+)+)(?![\d]|\s*[×−])/g;
  while ((m = re2.exec(s))) { const v = calc(m[2]); nEq++; if (v !== +m[1]) bad.push(where + ': ' + m[1] + ' = ' + m[2] + ' (→' + v + ')'); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(' ' + s0.replace(/\*\*/g, ''), where); });
T('수 식 전수 재계산 (' + nEq + '개) 틀림 0', () => ok(bad.length === 0, bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 셋 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['9990 + 10 = 10001', ' 68263 = 60000 + 8000 + 200 + 60 + 4', '8741 − 1478 = 7363'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck(' 52780000 = 50000000 + 2000000 + 700000 + 80000 · 10000 − 3000 = 7000', 'ok'); ok(bad.length === b0, '오탐'); bad.length = b0; });
const RB = []; let nR = 0; const KOW = '[영일이삼사오육칠팔구십백천만억조 ]+';
const rcheck = (s, where) => { let m; const re = new RegExp('(\\d{5,})(?:은|는|원은|명은)?\\s*(?:→|,|은|는|·)?\\s*(?:읽기:\\s*)?\\*?\\*?(' + KOW + ')\\*?\\*?(?=이에요|예요|이라고|라고|\\s*·|\\s*$|\\s*\\(|\\s*원|,)', 'g');
  while ((m = re.exec(s))) { const word = m[2].trim(); if (!/[만억조천백십]/.test(word) || word.length < 2) continue; if (koNum(word) == null) continue; nR++; if (koNum(word) !== +m[1]) RB.push(where + ': ' + m[1] + ' ↔ ' + word + ' (→' + koNum(word) + ')'); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) rcheck(s0.replace(/\*\*/g, ''), where); });
T('읽기 쌍 전수 틀림 0 (' + nR + '쌍 — 「N은 ○○이에요」·「N → ○○」·「N, ○○」)', () => ok(RB.length === 0, RB.slice(0, 6).join(' | ')));
T('읽기 쌍 ≥ 8 · 검산기 자체 확인', () => { ok(nR >= 8, 'nR ' + nR); const b0 = RB.length; rcheck('52780000은 오천이백칠십팔이에요.', 'p1'); rcheck('2358000 · 읽기: 이백삼십오만 칠천', 'p2'); ok(RB.length - b0 === 2, '잡은 수 ' + (RB.length - b0)); RB.length = b0; });

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => figs.push([k + ' ' + s.id, s.data.fig])));
T('개념 32장 모두 그림 · 렌더 · NaN/undefined 0', () => figs.forEach(([w0, f]) => { ok(f, w0 + ' fig 없음'); const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }));
let nFig = 0;
T('pvt — 칸 숫자·읽는 말(게이트 셈)·풀어 쓴 식 합·비교 부호·처음 달라지는 자리·짚는 자리', () => figs.filter(([, f]) => f.k === 'pvt').forEach(([w0, f]) => { nFig++; const h = FIG.render(f); const rows = (f.rows || [{ v: f.v }]).map(r => String(r.v));
  ok(h.indexOf('data-vals="' + rows.join(',') + '"') >= 0, w0 + ' data-vals');
  const d = new JSDOM('<body>' + h + '</body>').window.document; const trs = [...d.querySelectorAll('tr.pv-row')]; ok(trs.length === rows.length, w0 + ' 줄 수');
  trs.forEach((tr, i) => { const cells = [...tr.querySelectorAll('td')].map(td => td.textContent).join(''); ok(cells === rows[i] || (f.q && cells.replace('?', '') !== cells), w0 + ' 칸 ' + cells + ' ≠ ' + rows[i]); });
  if (f.read) [...d.querySelectorAll('.pv-read b')].forEach((b, i) => ok(b.textContent === readG(rows[i]) && koNum(b.textContent) === +rows[i], w0 + ' 읽는 말 ' + b.textContent + ' ≠ ' + readG(rows[i])));
  if (f.expand) { const e = d.querySelector('.pv-eq').textContent; const m = e.match(/^(\d+) = (.+)$/); ok(m && +m[1] === +rows[0] && calc(m[2]) === +rows[0], w0 + ' 풀어 쓴 식 ' + e); ok(m[2].split(' + ').every(x => /^[1-9]0*$/.test(x)), w0 + ' 자리마다 한 항'); }
  if (f.cmp) { const e = [...d.querySelectorAll('.pv-eq')].pop().textContent; const [a, b] = rows.map(Number); ok(e === rows[0] + ' ' + (a > b ? '>' : a < b ? '<' : '=') + ' ' + rows[1], w0 + ' 비교 ' + e);
    if (rows[0].length === rows[1].length) { let i = 0; while (rows[0][i] === rows[1][i]) i++; ok(h.indexOf('data-diff="' + NAMES[rows[0].length - 1 - i] + '"') >= 0, w0 + ' 처음 달라지는 자리'); } }
  if (f.hi) [].concat(f.hi).forEach(p => { ok(NAMES.indexOf(p) >= 0 && NAMES.indexOf(p) < Math.max(...rows.map(r => r.length)), w0 + ' 짚는 자리 ' + p); ok(d.querySelectorAll('td.hi').length === rows.length, w0 + ' 짚는 칸'); });
  const cols = +h.match(/data-cols="(\d+)"/)[1]; ok(!!d.querySelector('tr.pv-band') === (cols > 8), w0 + ' 띠는 아홉 자리부터'); }));
T('jump — 수열 = 시작 + 걸음 · 바뀌는 자리 알림 = 걸음의 자리 · 걸음 글자', () => figs.filter(([, f]) => f.k === 'jump').forEach(([w0, f]) => { nFig++; const h = FIG.render(f); const seq = Array.from({ length: f.n }, (_, i) => f.start + f.step * i); ok(h.indexOf('data-seq="' + seq.join(',') + '"') >= 0, w0 + ' 수열');
  const d = new JSDOM('<body>' + h + '</body>').window.document; ok([...d.querySelectorAll('.jp-b')].map(b => b.textContent).join(',') === seq.join(','), w0 + ' 칸 글자');
  const em = [...d.querySelectorAll('.jp-a em')].map(e => e.textContent); ok(em.length === f.n - 1 && em.every(t => koNum(t.replace(/^[+−]/, '')) === Math.abs(f.step) && (t[0] === '+') === (f.step > 0)), w0 + ' 걸음 글자 ' + em[0]);
  const key = d.querySelector('.jp-key'); if (key) { const lead = String(Math.abs(f.step)).length - 1; ok(key.textContent.indexOf(NAMES[lead] + '의 자리') === 0, w0 + ' 알림 자리'); for (let i = 1; i < seq.length; i++) ok(digitAt(seq[i], NAMES[lead]) - digitAt(seq[i - 1], NAMES[lead]) === f.step / Math.pow(10, lead), w0 + ' 받아올림이 있는데 「씩 커져요」 알림'); } }));
T('notes — 합계 · eq 줄 식', () => figs.forEach(([w0, f]) => { if (f.k === 'notes') { nFig++; const t = f.items.reduce((a, r) => a + r.v * r.n, 0); ok(FIG.render(f).indexOf('data-total="' + t + '"') >= 0, w0); } if (f.k === 'eq') f.lines.forEach(l => eqcheck(' ' + l.replace(/\*\*/g, ''), w0)); }));
T('큰 수 그림(pvt·jump·notes) ≥ 22 · 차시마다 하나 이상', () => { ok(nFig >= 22, 'nFig ' + nFig); KEYS.forEach(k => ok(L[k].slides.some(s => /"k":"(pvt|jump)"/.test(JSON.stringify(s.data.fig || {}))), k)); });

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(norm(s.data.content)) >= 0, s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('추출기: 자기주도 수 패드 답이 모두 읽힘(답 없는 문제 0)', () => KEYS.forEach(k => SRC[k].problems.forEach((p, i) => ok('a' in p || p.opts, k + ' P' + i))));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(norm); const dup = n.filter((x, i) => n.indexOf(x) !== i); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept') ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));

console.log('\n게이트 g4 수학 u1: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
