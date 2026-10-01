/* gate_g4_math_u2.js — 4학년 1학기 수학 2단원 「각도」 케이티처 2세대 게이트 (59차, 베프 — u1 큰 수 게이트 틀 + 각도 검산).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(g4 u1_l08 → l01 → … → l10)
   E 문제 정답 재계산 — 글 문제(각도의 합·차·어림 차이·삼각형 180°·사각형 360°·삼각자·단위 각 칸·예각/둔각·뜻 묻기)
     + 그림 문제(각도기 눈금 · 합·차 그림의 물음표 · 삼각형·사각형 그림의 모르는 각 · 단위 각 칸 · 각 그림 ↔ 예각/둔각 보기)
   F 식 전수(+ − × ÷ · ° 붙은 식 · 「180 − a − b = c」) · 「N°는 예각/직각/둔각」 판정 전수
   G 그림(ang 두 변 사이 실제 각 = 데이터 · prot 두 변 사이 각·읽는 눈금 = 각 · asum 경계 반직선 = 누적 · polyang 그린 꼴의 안쪽 각 = 데이터 · 삼각형 180 · 사각형 360)
   H 재료 충실(자기주도 원문 계승 — 원문 개념 장이 비어 있을 때만 교사 글) · I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22 · K 발문 · L 선행 용어(원문 차례와 같음)
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g4_math_u2.js */
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
const L = load(path.join(TDIR, 'data/g4_math_u2.js'));
const U1 = load(path.join(TDIR, 'data/g4_math_u1.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g4_math_u2.json'), 'utf8'));
const KEYS = Array.from({ length: 10 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '각도', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;

/* ── 게이트 자체 각도 셈 ── */
const kindG = (d) => (d > 0 && d < 90 ? '예각' : d === 90 ? '직각' : d > 90 && d < 180 ? '둔각' : d === 180 ? '일직선' : '?');
const degs = (s) => [...String(s).matchAll(/(\d+)\s*°/g)].map(m => +m[1]);
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const FACT = [ // 뜻을 묻는 문항 — 단원 정본 답(바뀌면 문장도 함께 봐야 한다)
  [/각의 크기는 무엇으로 정해/, '두 변이 벌어진 정도'], [/겹쳐 비교할 때 무엇을 맞추/, '꼭짓점과 한 변'], [/두 변을 길게 늘이면|두 변을 두 배로 길게 늘였/, '그대로예요'],
  [/1°는 무엇/, '한 바퀴를 360으로 나눈 하나'], [/각도기의 중심은 어디에/, '각의 꼭짓점'], [/각도기 눈금은 어디부터/, '밑금이 놓인 변의 0부터'],
  [/예각은 어떤 각/, '90°보다 작은 각'], [/둔각은 어떤 각/, '90°보다 크고 180°보다 작은 각'], [/어림값을 말할 때 앞에 붙이는 말/, '약'],
  [/어림한 뒤에는 무엇을/, '각도기로 재어 확인해요'], [/사각형 네 각의 합이 360°인 까닭/, '삼각형 2개로 나뉘니까 (180° + 180°)'],
  [/자릿수가 같을 때는/, null]];
function leadA(q0) { const q = String(q0).replace(/\*\*/g, '').replace(/\s+/g, ' '); let m;
  for (const [re, a] of FACT) if (re.test(q)) return a;
  if ((m = q.match(/0이 (안쪽|바깥쪽) 눈금에 있어요\. 다른 변이 안쪽 눈금 (\d+), 바깥쪽 눈금 (\d+)/))) return m[1] === '안쪽' ? +m[2] : +m[3];
  if (/직각은 몇 도/.test(q)) return 90; if (/한 바퀴는 몇 도/.test(q) || /한 바퀴를 꽉 채우면/.test(q)) return 360; if (/한 바퀴의 반만큼/.test(q)) return 180;
  if (/직각 두 개를 이어 붙이면|직각 두 개의 합/.test(q)) return 180; if (/직각 4개의 합/.test(q)) return 360; if (/한 바퀴 360°는 직각 몇 개/.test(q)) return 4;
  if (/직각을 똑같이 둘로 나눈/.test(q)) return 45; if (/예각은 몇 도보다 작은/.test(q)) return 90; if (/둔각은 90°보다 크고 몇 도보다 작은/.test(q)) return 180;
  if ((m = q.match(/삼각형의 세 각의 크기의 합은 몇 도/))) return 180; if ((m = q.match(/사각형의 네 각의 크기의 합은 몇 도/))) return 360;
  if (/삼각형의 세 각의 크기의 합|세 각의 크기의 합은 몇 도/.test(q)) return 180;
  if ((m = q.match(/세 각의 크기가 모두 같은 삼각형/))) return 60; if ((m = q.match(/네 각이 모두 같은 사각형/))) return 90;
  if ((m = q.match(/(\d+)\s*°?(?:로|으로)? 어림했는데 재어 보니 (\d+)\s*°/))) return Math.abs(+m[1] - +m[2]);
  if ((m = q.match(/곰이는 약 (\d+)°, 펭이는 약 (\d+)°로 어림했어요\. 재어 보니 (\d+)°/))) return Math.abs(+m[1] - +m[3]) < Math.abs(+m[2] - +m[3]) ? '곰이' : '펭이';
  if ((m = q.match(/삼각형의 두 각이 (\d+)°, (\d+)°/))) return 180 - m[1] - m[2];
  if ((m = q.match(/삼각형의 한 각이 직각이고 다른 한 각이 (\d+)°/))) return 180 - 90 - m[1];
  if ((m = q.match(/삼각형의 한 각이 (\d+)°이고 나머지 두 각의 크기가 같/))) return (180 - m[1]) / 2;
  if ((m = q.match(/사각형의 세 각이 (\d+)°, (\d+)°, (\d+)°/))) return 360 - m[1] - m[2] - m[3];
  if ((m = q.match(/마주 보는 두 각이 각각 (\d+)°로 같고, 나머지 두 각도 서로 같/))) return (360 - 2 * m[1]) / 2;
  if ((m = q.match(/(\d+)°에서 (\d+)°와 (\d+)°를 차례로 빼면/))) return m[1] - m[2] - m[3];
  if ((m = q.match(/전체 (\d+)°에서 (\d+)°를 뺀/)) || (m = q.match(/(\d+)°에서 (\d+)°를 덜어/)) || (m = q.match(/(\d+)° 위에 (\d+)°를 포개/)) || (m = q.match(/(\d+)° − (\d+)°는/))) return m[1] - m[2];
  if ((m = q.match(/(\d+)°(?:인 각)?에서 (\d+)°만큼 더 벌리면|팔 각도는 (\d+)°예요\. 여기서 (\d+)°만큼 더 벌리면/))) return m[1] ? +m[1] + +m[2] : +m[3] + +m[4];
  if ((m = q.match(/(\d+)°, 은비는 (\d+)°예요\. 은비는 몇 도만큼 더/))) return m[1] - m[2];
  if ((m = q.match(/(\d+)°와 (\d+)°를 (?:나란히 )?(?:이어 )?붙/)) || (m = q.match(/(\d+)°(?:\(직각\))?와 (\d+)°(?:\(직각\))?를 (?:나란히 )?붙/)) || (m = q.match(/(\d+)° \+ (\d+)°는/)) || (m = q.match(/(\d+)°(?: ?\(직각\))?와 (\d+)°(?: ?\(직각\))?를 붙였어요/))) return +m[1] + +m[2];
  if ((m = q.match(/(\d+)°를 삼각자로 만들려면/))) return { sumTo: +m[1] };
  if ((m = q.match(/삼각자 두 개로 (\d+)°를 만들려면|두 개를 붙여 (\d+)°를 만들려고/))) return { sumTo: +(m[1] || m[2]) };
  if (/삼각자 두 개로는 만들 수 없는|삼각자 두 개로 만들 수 없는/.test(q)) return { notSet: true };
  if ((m = q.match(/두 각의 크기는 몇 도 차이|몇 도 차이일까/)) && (m = q.match(/(\d+)°.*?(\d+)°/))) return Math.abs(m[1] - m[2]);
  if ((m = q.match(/가는 (\d+)칸, 나는 (\d+)칸이에요\. 가는 나보다 몇 칸/))) return m[1] - m[2];
  if ((m = q.match(/가 (\d+)칸, 나 (\d+)칸, 다 (\d+)칸이에요\. 가장 큰 각/))) { const v = [+m[1], +m[2], +m[3]]; return '가나다'[v.indexOf(Math.max(...v))]; }
  if ((m = q.match(/가에는 단위 각이 (\d+)칸, 나에는 (\d+)칸/))) return +m[1] > +m[2] ? '가' : '나';
  if ((m = q.match(/(\d+)칸인 각과 (\d+)칸인 각 가운데 큰 각/))) return Math.max(+m[1], +m[2]) + '칸인 각';
  if ((m = q.match(/두 각 (\d+)°와 (\d+)°는 각각 어떤 각/))) { const a = kindG(+m[1]), b = kindG(+m[2]); return a === b ? '둘 다 ' + a : null; }
  if ((m = q.match(/((?:\d+°, )+\d+°) 가운데 둔각은/))) { const d = degs(m[1]).filter(x => kindG(x) === '둔각'); return d.length === 1 ? d[0] : null; }
  if ((m = q.match(/(\d+)°는 예각, 직각, 둔각 가운데/))) return kindG(+m[1]);
  if (/3시 정각에 시계의 두 바늘/.test(q)) return '직각';
  if ((m = q.match(/(\d+)°, (\d+)°, (\d+)°는 삼각형의 세 각이 될 수/))) return +m[1] + +m[2] + +m[3] === 180 ? '네' : '아니요';
  if (/직각보다 크고, 180°보다 작은 각을 무엇이라/.test(q)) return '둔각';
  if (/직각보다 좁게 벌려 그린 각/.test(q)) return '예각';
  if (/직각보다 큰 각의 크기는 어느 범위/.test(q)) return '90°보다 크고 180°보다 작아요';
  if (/잘 어림하는 방법/.test(q)) return '90°·45° 같은 기준과 비교해요';
  if (/더해서 360°가 되는 것/.test(q)) return { sumOpt: 360 };
  if (/삼각형의 세 각이 될 수 있는/.test(q)) return { sumOpt: 180 }; if (/사각형의 네 각이 될 수 있는/.test(q)) return { sumOpt: 360 };
  if (/이 각은 둔각이에요\. 어떻게 어림/.test(q)) return '90°보다 크게 어림해요';
  if (/각도기를 바르게 놓은 방법/.test(q)) return '중심을 꼭짓점에, 밑금을 한 변에 맞춘다';
  return null; }
const SETSQ = [30, 45, 60, 90];
function same(a, v) { const A = nsp(String(a).replace(/\(.*?\)/g, ''));
  if (v && typeof v === 'object') { const ds = degs(a);
    if (v.sumTo) return ds.length === 2 && ds[0] + ds[1] === v.sumTo && ds.every(x => SETSQ.indexOf(x) >= 0);
    if (v.sumOpt) return ds.length >= 3 && ds.reduce((x, y) => x + y, 0) === v.sumOpt;
    if (v.notSet) return ds.length === 1 && ds[0] % 15 !== 0; }
  if (typeof v === 'number') { const d = String(a).replace(/\(.*?\)/g, '').match(/\d+/); return !!d && +d[0] === v; }
  const V = nsp(v); return A === V || A.indexOf(V) === 0 || V.indexOf(A) === 0; }
/* 그림 문제 — 그림 자료에서 답을 따로 셈 */
function figAns(f) { if (!f) return undefined;
  if (f.k === 'prot' && f.read === false) return +f.deg;
  if (f.k === 'asum' && f.q != null) { const P = f.parts.map(Number); if (f.op === '-') { const r = P[0] - P[1]; return [P[0], P[1], r][f.q]; } const tot = P.reduce((a, b) => a + b, 0); if (+f.q === P.length) return tot; return P[+f.q]; }
  if (f.k === 'polyang' && f.q != null) return f.angs[f.q];
  if (f.k === 'ang' && f.unit && f.q) return f.deg / f.unit;
  return undefined; }

console.log('═══ A. 로드 ═══');
T('10차시 키 u2_l01~l10', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 4학년 1학기 · 2단원 각도 · 성취기준 표시 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 4 && m.term === 1 && m.unit === 2 && m.unit_title === '각도' && /각도/.test(m.std) && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); ok(m.duration_min === 40, k + ' 40분'); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex08 = U1.u1_l08.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'g4 u1_l08') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex08;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g4_math:u1_l08'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
let nCheck = 0, nFigQ = 0; const unread = [];
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; const fa = figAns(d.fig);
    if (d.fig) { ok(!/NaN|undefined/.test(FIG.render(d.fig)), s.id + ' 그림 깨짐'); const h = FIG.render(d.fig); if (fa !== undefined) ok([...docOf(h).querySelectorAll('text')].some(t => /\?/.test(t.textContent)), s.id + ' 그림에 물음표 칸 없음 — 답이 보임'); }
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); const cor = d.options.find(o => o.correct).text; let v = leadA(d.question);
      if (v == null && d.fig && d.fig.k === 'ang' && d.fig.show === false && /어떤 각/.test(d.question)) v = kindG(d.fig.deg);
      if (v == null && d.fig && d.fig.k === 'panels' && /변의 길이/.test(d.question)) { const ds = d.fig.items.map(p => p.fig.deg); v = ds.every(x => x === ds[0]) ? '두 각의 크기는 같아요' : null; if (v) nFigQ++; }
      if (v == null && d.fig && d.fig.k === 'ang' && /둔각이에요\. 어떻게 어림/.test(d.question)) v = d.fig.deg > 90 ? '90°보다 크게 어림해요' : '90°보다 작게 어림해요';
      if (d.fig && d.fig.k === 'ang' && d.fig.show === false) { nFigQ++; ok(kindG(d.fig.deg) !== '?' && (cor.indexOf(kindG(d.fig.deg)) >= 0 || /90°보다 (크|작)게/.test(cor)), s.id + ' 그림 각 ' + d.fig.deg + '° ↔ 정답 ' + cor); }
      if (v != null) { nCheck++; ok(same(cor, v), s.id + ' ' + d.question + ' → ' + JSON.stringify(v) + ' ≠ ' + cor); } else unread.push(k + ' ' + s.id); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = fa !== undefined ? fa : leadA(d.question); if (fa !== undefined) nFigQ++;
      if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' → ' + v + ' ≠ ' + d.answer); } else unread.push(k + ' ' + s.id);
      ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadA(lv[t].q); if (v != null) { nCheck++; ok(same(lv[t].a, v), t + ' ' + lv[t].q + ' → ' + JSON.stringify(v) + ' ≠ ' + lv[t].a); } else unread.push(k + ' ' + t); ok(lv[t].steps.length >= 3, t + ' 풀이 단계'); });
  sl[15].data.items.forEach(it => { const v = leadA(it.q); if (v != null) { nCheck++; ok(same(it.a, v), '출구 ' + it.q + ' → ' + JSON.stringify(v) + ' ≠ ' + it.a); } else unread.push(k + ' 출구 ' + it.q.slice(0, 16)); }); }));
T('다시 계산한 정답 수 ≥ 80 (못 읽는 문항 0) · 그림에서 셈한 문항 ≥ 18', () => ok(nCheck >= 80 && !unread.length && nFigQ >= 18, 'nCheck ' + nCheck + ' · 그림 ' + nFigQ + ' · 못 읽음 ' + unread.join(' | ')));
T('재계산기 자체 확인 — 합·차·어림·삼각형·사각형·삼각자·판정', () => {
  ok(leadA('삼각자의 **45°**와 **60°**를 나란히 붙였어요. 만들어진 각은 몇 도일까요?') === 105 && leadA('**90°** 위에 **45°**를 포개어 겹쳤어요. 남은 각은 몇 도일까요?') === 45 && leadA('전체 100°에서 45°를 뺀 **차**는 몇 도일까요?') === 55, '합·차');
  ok(leadA('약 **120°**로 어림했는데 재어 보니 **115°**였어요. 차이는?') === 5 && leadA('삼각형의 두 각이 70°, 45°예요. 나머지 한 각은 몇 도일까요?') === 65 && leadA('사각형의 세 각이 90°, 80°, 100°예요. 나머지 한 각은 몇 도일까요?') === 90, '어림·삼각형·사각형');
  ok(same('45°와 30°를 붙여서', leadA('**75°**를 삼각자로 만들려면 어떤 각을 붙여야 할까요?')) && !same('45°와 45°를 붙여서', leadA('**75°**를 삼각자로 만들려면 어떤 각을 붙여야 할까요?')) && same('40°', leadA('다음 중 삼각자 두 개로는 만들 수 없는 각은?')) && !same('75° (45 + 30)', leadA('다음 중 삼각자 두 개로는 만들 수 없는 각은?')), '삼각자');
  ok(same('50°, 60°, 70°', leadA('삼각형의 세 각이 될 수 있는 것은?')) && !same('90°, 50°, 50°', leadA('삼각형의 세 각이 될 수 있는 것은?')) && leadA('100°는 예각, 직각, 둔각 가운데 무엇인가요?') === '둔각' && leadA('35°, 90°, 150° 가운데 둔각은 몇 도일까요?') === 150, '판정');
  ok(figAns({ k: 'asum', parts: [40, 30], q: 2 }) === 70 && figAns({ k: 'asum', parts: [100, 45], op: '-', q: 2 }) === 55 && figAns({ k: 'polyang', angs: [60, 120, 100, 80], q: 3 }) === 80 && figAns({ k: 'prot', deg: 40, read: false }) === 40, '그림 셈'); });

console.log('═══ F. 식·판정 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where);
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'); if (!/^[\d\s*+\-/()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
let nEq = 0; const bad = [];
const eqcheck = (s0, where) => { const s = ' ' + String(s0).replace(/\*\*/g, '').replace(/°/g, ''); let m; const re = /(\d+(?:\s*[×÷+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×÷+−])/g;
  while ((m = re.exec(s))) { const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } };
allStr.forEach(([s0, where]) => { if (!skip(where)) eqcheck(s0, where); });
T('각도 식 전수 재계산 (' + nEq + '개) 틀림 0', () => ok(bad.length === 0 && nEq >= 60, 'nEq ' + nEq + ' ' + bad.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 셋 잡음 · 맞는 식 통과)', () => { const b0 = bad.length; ['60° + 30° = 100°', '180 − 50 − 60 = 80', '30° × 4 = 100°'].forEach((t, i) => eqcheck(t, 'probe' + i)); ok(bad.length - b0 === 3, '잡은 수 ' + (bad.length - b0)); bad.length = b0; eqcheck('360 − 60 − 120 − 100 = 80 · 90 ÷ 2 = 45 · 120° − 45° = 75°', 'ok'); ok(bad.length === b0, '오탐'); bad.length = b0; });
const KB2 = []; let nKind = 0;
const kcheck = (s0, where) => { const s = String(s0).replace(/\*\*/g, ''); let m; const re = /((?:\d+°\s*[·,]?\s*)+)(?:는|은|가|이|→)?\s*(예각|직각|둔각)(?!\s*\d|의|을|를|과|와|보다|\(|\s*[·,]?\s*\d)/g;
  while ((m = re.exec(s))) { const ds = degs(m[1]); if (!ds.length) continue; if (/보다|가운데|중/.test(s.slice(m.index + m[0].length, m.index + m[0].length + 3))) continue; ds.forEach(d => { nKind++; if (kindG(d) !== m[2]) KB2.push(where + ': ' + d + '° ' + m[2]); }); } };
allStr.forEach(([s0, where]) => { if (!skip(where) && !/\.q$/.test(where)) kcheck(s0, where); });
T('「N°는 예각·직각·둔각」 판정 전수 (' + nKind + '건) 틀림 0', () => ok(KB2.length === 0 && nKind >= 5, 'nKind ' + nKind + ' ' + KB2.slice(0, 6).join(' | ')));
T('판정 검산기 자체 확인', () => { const b0 = KB2.length; kcheck('100°는 예각', 'p1'); kcheck('40°·70° 둔각', 'p2'); ok(KB2.length - b0 === 3, '잡은 수 ' + (KB2.length - b0)); KB2.length = b0; kcheck('150°가 둔각 · 90°는 직각 · 35°는 예각', 'ok'); ok(KB2.length === b0, '오탐'); KB2.length = b0; });
T('삼각형 세 각 · 사각형 네 각 문장 — 「A°, B°, C°」 정답 보기 합 전수', () => KEYS.forEach(k => L[k].slides.filter(s => s.data.options).forEach(s => { const q = s.data.question; if (/삼각형의 세 각이 될 수 있는/.test(q)) s.data.options.forEach(o => ok(!!o.correct === (degs(o.text).reduce((a, b) => a + b, 0) === 180), s.id + ' ' + o.text)); if (/사각형의 네 각이 될 수 있는/.test(q)) s.data.options.forEach(o => ok(!!o.correct === (degs(o.text).reduce((a, b) => a + b, 0) === 360), s.id + ' ' + o.text)); })));

console.log('═══ G. 그림 ═══');
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block]); }));
const flat = (f) => (f.k === 'panels' ? f.items.map(p => p.fig || p) : [f]);
const parts = []; figs.forEach(([w0, f, b]) => flat(f).forEach((g, i) => parts.push([w0 + (f.k === 'panels' ? '#' + i : ''), g, b])));
T('개념 40장 모두 그림 · 기본 문제 그림 ≥ 15 · 렌더 · NaN/undefined 0', () => { KEYS.forEach(k => L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(s.data.fig, k + ' ' + s.id + ' fig 없음'))); ok(figs.filter(x => x[2] === 'basic_problem').length >= 15, '기본 문제 그림 ' + figs.filter(x => x[2] === 'basic_problem').length); figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h && h.length > 150, w0 + ' 빈 그림'); ok(!/NaN|undefined/.test(h), w0 + ' NaN'); }); });
const lines = (h, sel) => [...docOf(h).querySelectorAll('line')].filter(sel).map(l => [+l.getAttribute('x1'), +l.getAttribute('y1'), +l.getAttribute('x2'), +l.getAttribute('y2')]);
const dirDeg = (l) => { const a = Math.atan2(-(l[3] - l[1]), l[2] - l[0]) * 180 / Math.PI; return (a + 360) % 360; };
const between = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
let nG = { ang: 0, prot: 0, asum: 0, polyang: 0 };
T('ang — 두 변 사이 실제 각 = 데이터 · 글자 · 예각/둔각 이름 · 단위 각 칸', () => parts.filter(([, g]) => g.k === 'ang').forEach(([w0, g]) => { nG.ang++; const h = FIG.render(g); ok(h.indexOf('data-deg="' + g.deg + '"') >= 0, w0 + ' data-deg');
  const R = lines(h, l => l.getAttribute('stroke') === '#2B3440' && l.getAttribute('stroke-width') === '6'); ok(R.length === 2, w0 + ' 변 ' + R.length); ok(Math.abs(between(dirDeg(R[0]), dirDeg(R[1])) - g.deg) < 0.6, w0 + ' 그린 각 ' + between(dirDeg(R[0]), dirDeg(R[1])).toFixed(1) + ' ≠ ' + g.deg);
  const tx = [...docOf(h).querySelectorAll('text')].map(t => t.textContent); if (g.show !== false && !g.unit) ok(tx.indexOf(g.q ? '?' : g.deg + '°') >= 0, w0 + ' 각도 글자'); if (g.show === false) ok(!tx.some(t => t === g.deg + '°'), w0 + ' 숨긴 각도가 보임');
  if (g.kind) ok(tx.indexOf(kindG(g.deg)) >= 0, w0 + ' 이름 ' + kindG(g.deg)); if (g.unit) { ok(g.deg % g.unit === 0, w0 + ' 칸이 딱 나누어떨어짐'); ok(tx.indexOf(g.q ? '? 칸' : (g.deg / g.unit) + '칸') >= 0, w0 + ' 칸 글자'); }
  (g.ref || []).forEach(rf => ok(tx.indexOf(rf + '°') >= 0, w0 + ' 기준선 ' + rf)); }));
T('prot — 두 변 사이 각 = 데이터 · 읽는 눈금 = 각(0이 있는 쪽) · 다른 눈금 = 180 − 각', () => parts.filter(([, g]) => g.k === 'prot').forEach(([w0, g]) => { nG.prot++; const h = FIG.render(g); ok(h.indexOf('data-read="' + g.deg + '"') >= 0 && h.indexOf('data-other="' + (180 - g.deg) + '"') >= 0, w0 + ' 눈금');
  const R = lines(h, l => l.getAttribute('stroke') === '#2B3440' && l.getAttribute('stroke-width') === '6'); ok(R.length === 2, w0 + ' 변 ' + R.length); ok(Math.abs(between(dirDeg(R[0]), dirDeg(R[1])) - g.deg) < 0.6, w0 + ' 그린 각'); ok(Math.abs(dirDeg(R[0]) - (g.from === 'left' ? 180 : 0)) < 0.6, w0 + ' 밑금 방향');
  const tx = [...docOf(h).querySelectorAll('text')].map(t => t.textContent); ok(tx.indexOf(g.read === false ? '?' : String(g.deg)) >= 0, w0 + ' 읽는 글자'); }));
T('asum — 경계 반직선 = 누적 각 · 결과 = 합·차 · 식 글자', () => parts.filter(([, g]) => g.k === 'asum').forEach(([w0, g]) => { nG.asum++; const P = g.parts.map(Number); const h = FIG.render(g); const r = g.op === '-' ? P[0] - P[1] : P.reduce((a, b) => a + b, 0); ok(h.indexOf('data-r="' + r + '"') >= 0, w0 + ' 결과');
  const R = lines(h, l => l.getAttribute('stroke-width') === '6' || l.getAttribute('stroke-width') === '4').filter(l => !/dash/.test('')); const ds = R.map(dirDeg).map(x => Math.round(x * 10) / 10);
  const want = g.op === '-' ? [0, P[1], P[0]] : P.reduce((acc, a) => acc.concat(acc[acc.length - 1] + a), [0]).filter(a => a < 360); want.forEach(a => ok(ds.some(d => between(d, a) < 0.6), w0 + ' 경계 ' + a + '° 없음 (' + ds.join(',') + ')'));
  const lab = [...docOf(h).querySelectorAll('text')].pop().textContent; if (!g.label) { ok(/=/.test(lab), w0 + ' 식 글자'); if (g.q == null) eqcheck(lab, w0); } }));
T('polyang — 그린 꼴의 안쪽 각 = 데이터 · 삼각형 합 180 · 사각형 합 360 · 모르는 각은 물음표', () => parts.filter(([, g]) => g.k === 'polyang').forEach(([w0, g]) => { nG.polyang++; const h = FIG.render(g); const n = g.angs.length; const sum = g.angs.reduce((a, b) => a + b, 0); ok(sum === (n === 3 ? 180 : 360), w0 + ' 합 ' + sum);
  const pts = docOf(h).querySelector('polygon').getAttribute('points').split(' ').map(t => t.split(',').map(Number)); ok(pts.length === n, w0 + ' 꼭짓점 수');
  pts.forEach((p, i) => { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n]; const v1 = [a[0] - p[0], a[1] - p[1]], v2 = [b[0] - p[0], b[1] - p[1]]; const got = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / Math.hypot(...v1) / Math.hypot(...v2)) * 180 / Math.PI; ok(Math.abs(got - g.angs[i]) < 0.8, w0 + ' 꼭짓점 ' + i + ' ' + got.toFixed(1) + ' ≠ ' + g.angs[i]); });
  const tx = [...docOf(h).querySelectorAll('text')].map(t => t.textContent); g.angs.forEach((a, i) => ok(tx.indexOf(i === g.q ? '?' : a + '°') >= 0, w0 + ' 각 글자 ' + a)); if (g.q != null) ok(!tx.slice(0, n).some(t => t === g.angs[g.q] + '°') || g.angs.filter(x => x === g.angs[g.q]).length > 1, w0 + ' 모르는 각이 보임');
  if (g.label) eqcheck(g.label, w0); }));
T('각도 그림 부품 수 — ang ≥ 20 · prot ≥ 6 · asum ≥ 15 · polyang ≥ 15 · 차시마다 각도 그림', () => { ok(nG.ang >= 20 && nG.prot >= 6 && nG.asum >= 15 && nG.polyang >= 15, JSON.stringify(nG)); KEYS.forEach(k => ok(L[k].slides.some(s => /"k":"(ang|prot|asum|polyang)"/.test(JSON.stringify(s.data.fig || {}))), k)); });
T('그림 검사기 자체 확인 — 틀린 부품 셋 잡음', () => { const bad3 = [PA0 => 0]; const h1 = FIG.render({ k: 'polyang', angs: [50, 60, 80] }); ok(/data-sum="190"/.test(h1), '삼각형 합 190 표시'); const h2 = FIG.render({ k: 'prot', deg: 70, from: 'left' }); ok(/data-read="70"/.test(h2) && !/data-read="110"/.test(h2), '왼쪽 밑금 읽기'); const h3 = FIG.render({ k: 'ang', deg: 120, kind: true }); ok(/data-kind="둔각"/.test(h3), '둔각 이름'); void bad3; });

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문(원문이 빈 장만 교사 글) · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const titles = src.slides.map(x => x.title); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { const i = texts.indexOf(norm(s.data.content)); if (i < 0) { const j = titles.indexOf(s.data.title); ok(j >= 0 && !src.slides[j].text && s.data.content.length > 20, s.id + ' 원문 아님 (원문 장이 비어 있을 때만 교사 글)'); } });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('추출기: 자기주도 문제 답이 모두 읽힘(답 없는 문제 0)', () => KEYS.forEach(k => SRC[k].problems.forEach((p, i) => ok('a' in p || p.opts, k + ' P' + i))));
T('한 차시 안에서 같은 문제 중복 0 (기본·수준별·출구)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); sl[15].data.items.forEach(x => e.push(x.q)); const n = e.map(norm); const dup = n.filter((x, i) => n.indexOf(x) !== i); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 문제 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig"/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));

console.log('═══ L. 선행 용어 ═══');
const stud = (k) => L[k].slides.filter(s => s.block !== 'next_lesson').map(s => { const d = Object.assign({}, s.data); delete d.tnote; return JSON.stringify(d); }).join(' ');
const srcTxt = (k) => JSON.stringify(SRC[k].slides) + JSON.stringify(SRC[k].problems) + SRC[k].summary;
const FIRST = [['각도기', 3], ['예각', 4], ['둔각', 4], ['대각선', 8]];
FIRST.forEach(([w0, n]) => T('「' + w0 + '」 l' + String(n).padStart(2, '0') + ' 전 학생 화면 0 · 그 차시엔 나옴 · 원문도 같은 차례', () => { KEYS.forEach((k, i) => { if (i + 1 < n) { ok(stud(k).indexOf(w0) < 0, k + ' 케이티처에 선행 「' + w0 + '」'); ok(srcTxt(k).indexOf(w0) < 0, k + ' 원문에도 선행 — 차례 다시 볼 것'); } }); ok(stud(KEYS[n - 1]).indexOf(w0) >= 0, KEYS[n - 1] + ' 에 「' + w0 + '」 없음'); }));
T('선행 검사기 자체 확인', () => { const probe = JSON.parse(JSON.stringify(L.u2_l02.slides[3].data)); ok(JSON.stringify(probe).indexOf('각도기') < 0, 'l02 개념 장 깨끗'); probe.content += ' 각도기'; ok(JSON.stringify(probe).indexOf('각도기') >= 0, '심은 낱말'); });

console.log('\n게이트 g4 수학 u2: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
