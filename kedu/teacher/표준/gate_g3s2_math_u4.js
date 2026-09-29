/* gate_g3s2_math_u4.js — 3학년 2학기 수학 4단원 「분수와 소수」 케이티처 2세대 게이트 (32차, 베프 — u3 게이트 복제 + 분수·소수 검산).
   2학기는 1세대 무대가 없으므로 2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드 · B 19장 골격 · C 7요소 · D 복습 계보(u3_l07 → l01 → … → l11) · E 문제 정답(분수만큼·대분수↔가분수·0.1의 개수 재계산 · 보기 크기 비교 참/거짓 · 가장 큰/작은 수)
   F 산수·분수 전수(× + − ÷ 식 · 「N의 a/b 은 V」 · 대분수 = 가분수 · 분모 10 분수 = 소수 · 「x 는 0.1이 n개」 · 부등호 < > 참)
   G 그림(fgroup 묶음·분수만큼 · fmix 가분수↔대분수·소수 · nline 점 자리 · show 식 재계산)
   H 재료 충실(자기주도 원문 계승) · L 선행 용어(진분수·가분수·자연수 l05 · 대분수 l06 전에 학생 화면 0)
   I 실렌더(닫힘·열림) + 1인 흐름 · J extras 22·연결 · K 발문 6장↑
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node kedu/teacher/표준/gate_g3s2_math_u4.js */
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
const L = load(path.join(TDIR, 'data/g3s2_math_u4.js'));
const U3 = load(path.join(TDIR, 'data/g3s2_math_u3.js'));
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g3s2_math_u4.json'), 'utf8'));
const KEYS = Array.from({ length: 11 }, (_, i) => 'u4_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

// 2세대 무대 부팅(jsdom)
const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '분수와 소수', classNames: [] });

console.log('═══ A. 로드 ═══');
T('11차시 키 u4_l01~l11', () => ok(JSON.stringify(Object.keys(L).sort()) === JSON.stringify(KEYS), Object.keys(L).join(',')));
T('meta: 3학년 2학기 · unit_title 분수와 소수 · 성취기준 · live_url 실파일', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 3 && m.term === 2 && m.unit === 4 && m.unit_title === '분수와 소수' && m.std === '[4수01-11]' && m.n === +k.slice(-2), k); ok(fs.existsSync(path.join(TDIR, m.live_url)), k + ' live_url ' + m.live_url); }));

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 ═══');
KEYS.forEach(k => T(k + ' 7요소', () => { const sl = L[k].slides; const has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.kids && s.data.kids.length), '③서사');
  ok(has(s => s.block === 'offline_activity'), '④활동'); ok(has(s => s.block === 'leveled_problem'), '⑤수준별'); ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구');
  ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length); }));

console.log('═══ D. 복습 계보 ═══');
const ex7 = U3.u3_l07.slides.find(s => s.block === 'exit_ticket').data.items;
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : 'u3_l07') + ' 출구', () => { const rv = L[k].slides[1].data; const prev = i ? L[KEYS[i - 1]].slides[15].data.items : ex7;
  ok(JSON.stringify(rv.items) === JSON.stringify(prev.map(x => ({ q: x.q, a: x.a }))), '문항 불일치'); ok(rv.from === (i ? KEYS[i - 1] : 'g3s2_math:u3_l07'), 'from ' + rv.from); }));

console.log('═══ E. 문제 정답 ═══');
// 수 모양 셋: 대분수 「w·a/b」 · 분수 「a/b」 · 소수·자연수
const NUM = '\\d+(?:·\\d+\\/\\d+|\\/\\d+|\\.\\d+)?';
const val = (t) => { t = String(t).trim(); let m; if ((m = t.match(/^(\d+)·(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3]; if ((m = t.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2]; if (/^\d+(?:\.\d+)?$/.test(t)) return +t; return null; };
const close = (a, b) => Math.abs(a - b) < 1e-9;
const calc = (e) => { const x = e.replace(/×/g, '*').replace(/−/g, '-'); if (!/^[\d\s*+\-()]+$/.test(x)) return null; return Function('return (' + x + ')')(); };
const lead = (q) => { const t = String(q).replace(/\*\*/g, '');
  let d = t.match(/^(\d+)\s*÷\s*(\d+)\s*(?:는|은)\s*얼마/); if (d) { const a = +d[1], b = +d[2]; if (a % b) throw new Error('나누어떨어지지 않는데 「얼마」: ' + t); return a / b; }
  const m = t.match(/^(\d+(?:\s*[×+−]\s*\d+)+)\s*(?:는|은|을|를)\s*(?:얼마|계산)/); return m ? calc(m[1]) : null; };
// 분수·소수 문제 재계산
const UNIT = '(?:\\s*(?:개|m|cm|km|시간|자루|장))?';
const leadF = (q) => { const t = String(q).replace(/\*\*/g, ''); let m;
  if ((m = t.match(new RegExp('(\\d+)' + UNIT + '의\\s*(\\d+)\\/(\\d+)\\s*(?:은|는)\\s*(?:몇|얼마)')))) { const v = m[1] * m[2] / m[3]; if (!Number.isInteger(v)) throw new Error('분수만큼이 자연수가 아님: ' + t); return v; }
  if ((m = t.match(/(\d+)·(\d+)\/(\d+)\s*(?:을|를)?\s*가분수로 나타내면 분자는/))) return m[1] * m[3] + +m[2];
  if ((m = t.match(/(\d+)\/(\d+)\s*(?:을|를)?\s*대분수로 나타내면 자연수 부분은/))) return Math.floor(m[1] / m[2]);
  if ((m = t.match(/(\d+)\/(\d+)\s*(?:을|를)?\s*대분수로 나타내면 분수 부분의 분자는/))) return m[1] % m[2];
  if ((m = t.match(/(\d+)·(\d+)\/10\s*(?:을|를)?\s*소수로 나타내면 0\.1이 몇 개/))) return m[1] * 10 + +m[2];
  if ((m = t.match(/(\d+(?:\.\d)?)\s*(?:은|는)\s*0\.1이 몇 개/))) return Math.round(m[1] * 10);
  if ((m = t.match(/(\d+)\/(\d+)\s*(?:은|는)\s*1\/(\d+)\s*이 몇 개/))) { if (m[2] !== m[3]) throw new Error('분모 다름: ' + t); return +m[1]; }
  if ((m = t.match(/(\d+)\s*(?:을|를)\s*분모가\s*(\d+)인 분수로 나타내면 분자는/))) return m[1] * m[2];
  if ((m = t.match(/(\d+)(?:개)?\s*(?:을|를)\s*(\d+)씩 묶으면 모두 몇 묶음/))) { if (m[1] % m[2]) throw new Error('나누어떨어지지 않음: ' + t); return m[1] / m[2]; }
  if ((m = t.match(/(\d+) cm (\d+) mm는 0\.1 cm가 몇 개/))) return m[1] * 10 + +m[2];
  if ((m = t.match(/(\d+(?:\.\d)?) cm는 몇 mm/))) return Math.round(m[1] * 10);
  return lead(q); };
// 보기 판정: 「P < Q」 꼴 보기는 정답만 참 · 「가장 큰/작은 수」는 정답이 최대/최소 · 「대분수로 바르게」는 분수 부분이 진분수이고 크기 같음
const relOpt = (t) => { const m = String(t).match(new RegExp('^\\s*(' + NUM + ')\\s*([<>=])\\s*(' + NUM + ')\\s*$')); if (!m) return null; const a = val(m[1]), b = val(m[3]); return m[2] === '<' ? a < b && !close(a, b) : m[2] === '>' ? a > b && !close(a, b) : close(a, b); };
let nCheck = 0, nRel = 0;
const checkOpts = (d, where) => { const q = String(d.question || ''); const ci = d.options.findIndex(o => o.correct); const texts = d.options.map(o => o.text);
  const rels = texts.map(relOpt); if (rels.some(r => r !== null)) { rels.forEach((r, i) => { if (r === null) return; nRel++; ok(r === (i === ci), where + ' 보기 「' + texts[i] + '」 ' + (r ? '참인데 오답' : '거짓인데 정답')); }); }
  const vs = texts.map(val); if (/가장 (큰|작은) 수/.test(q) && vs.every(v => v !== null)) { nCheck++; const tgt = /가장 큰/.test(q) ? Math.max.apply(null, vs) : Math.min.apply(null, vs); ok(close(vs[ci], tgt), where + ' 가장 ' + (/가장 큰/.test(q) ? '큰' : '작은') + ' 수 ≠ ' + texts[ci]); }
  let m; if ((m = q.match(/(\d+)\/(\d+)\s*(?:을|를)\s*대분수로 바르게/))) { nCheck++; const c = texts[ci].match(/^(\d+)·(\d+)\/(\d+)$/); ok(c && +c[2] < +c[3] && close(val(texts[ci]), m[1] / m[2]), where + ' 대분수 보기 ' + texts[ci]); }
  const v = leadF(q); if (v != null) { nCheck++; ok(parseInt(texts[ci], 10) === v, where + ' ' + q + ' → ' + v + ' ≠ ' + texts[ci]); } };
KEYS.forEach(k => T(k + ' 기본 3·수준별·출구 정답', () => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data;
    if (d.options) { ok(d.options.filter(o => o.correct).length === 1, s.id + ' 보기 정답 수'); ok(!('answer' in d), s.id + ' 보기+답 혼재'); checkOpts(d, k + ' ' + s.id); }
    else { ok(d.input === 'count_input' && Number.isFinite(d.answer), s.id + ' 수 입력'); const v = leadF(d.question); if (v != null) { nCheck++; ok(v === d.answer, s.id + ' ' + d.question + ' ≠ ' + d.answer); } ok(new RegExp('\\*\\*' + d.answer + '\\*\\*').test(d.note), s.id + ' 풀이 끝 = 답'); } });
  const lv = sl[11].data.levels; ok(lv.기본 && lv.도전 && lv.심화 && lv.심화.open === true, '수준 셋·심화 open');
  ['기본', '도전'].forEach(t => { const v = leadF(lv[t].q); if (v != null) { nCheck++; ok(parseInt(String(lv[t].a).replace(/,/g, ''), 10) === v, t + ' ' + lv[t].q + ' ≠ ' + lv[t].a); } ok(lv[t].steps.length >= 3, t + ' 풀이 단계');
    let m; if ((m = lv[t].q.match(new RegExp('^(' + NUM + ')\\s*(?:과|와)\\s*(' + NUM + ')\\s*중 더 큰')))) { nCheck++; const a = val(m[1]), b = val(m[2]); ok(lv[t].a === (a > b ? m[1] : m[2]), t + ' 더 큰 수 ' + lv[t].a); } });
  sl[15].data.items.forEach(it => { const v = leadF(it.q); if (v != null) { nCheck++; ok(+it.a === v, '출구 ' + it.q + ' ≠ ' + it.a); }
    let m; if ((m = it.q.match(new RegExp('^(' + NUM + ')\\s*(?:과|와)\\s*(' + NUM + ')\\s*중 더 큰')))) { nCheck++; const a = val(m[1]), b = val(m[2]); ok(it.a === (a > b ? m[1] : m[2]), '출구 더 큰 수 ' + it.q + ' → ' + it.a); }
    if ((m = it.q.match(/^(\d+)·(\d+)\/10\s*(?:을|를)\s*소수로 나타내면 무엇/))) { nCheck++; ok(it.a === m[1] + '.' + m[2], '출구 ' + it.q); } }); }));
T('다시 계산한 정답 수 ≥ 40 · 보기 부등호 판정 ≥ 12 (문장 부등호는 F에서 따로 전수)', () => { ok(nCheck >= 40, 'nCheck ' + nCheck); ok(nRel >= 12, 'nRel ' + nRel); });

console.log('═══ F. 산수·분수 전수 ═══');
const allStr = []; (function walk(o, where) { if (typeof o === 'string') allStr.push([o, where]); else if (o && typeof o === 'object') Object.keys(o).forEach(key => walk(o[key], where + '.' + key)); })(L, 'L');
const skip = (where) => /\.wrong$|\.watch$|\.options\.\d+\.text$/.test(where); // 틀린 생각·「이런 경우」·오답 보기는 틀린 식을 일부러 적는다(보기는 E 에서 따로 판정)
let nEq = 0; const bad = [];
allStr.forEach(([s0, where]) => { if (skip(where)) return; const s = s0.replace(/\*\*/g, ''); const re = /(\d+(?:\s*[×+−]\s*\d+)+)\s*=\s*(\d+)(?![\d.·\/]|\s*[×+−])/g; let m;
  while ((m = re.exec(s))) { const before = s.slice(0, m.index).replace(/\s+$/, ''); const pc = before.slice(-1); if (/[\d×+−=□).·\/]/.test(pc)) continue; const v = calc(m[1]); if (v == null) continue; nEq++; if (v !== +m[2]) bad.push(where + ': ' + m[0] + ' (→' + v + ')'); } });
let nDiv = 0;
allStr.forEach(([s0, where]) => { if (skip(where)) return; const s = s0.replace(/\*\*/g, ''); const re = /(\d+)\s*÷\s*(\d+)\s*=\s*(\d+)(?:\s*…\s*(\d+))?/g; let m;
  while ((m = re.exec(s))) { const before = s.slice(0, m.index).replace(/\s+$/, ''); if (/[\d×+−=□)]/.test(before.slice(-1))) continue; const a = +m[1], b = +m[2], q = +m[3], r = m[4] == null ? 0 : +m[4]; nDiv++;
    if (b * q + r !== a || r >= b || (m[4] == null && a % b)) bad.push(where + ': ' + m[0]); } });
T('식 전수 재계산 (× + − ' + nEq + '개 · ÷ ' + nDiv + '개) 틀림 0', () => ok(bad.length === 0, bad.slice(0, 6).join(' | ')));
// 분수 전수 — ① N의 a/b 은(=) V ② 대분수 = 가분수 (양쪽) ③ 분모 10 대분수 = 소수 (양쪽) ④ x 는 0.1이 n개 · 0.1이 n개 = x ⑤ 부등호 P < Q · P > Q
const FB = []; const cnt = { of: 0, mix: 0, dec: 0, tenth: 0, rel: 0 };
const reOf = new RegExp('(?<![\\d.·\\/])(\\d+)' + UNIT + '의\\s*(\\d+)\\/(\\d+)\\s*(?:은|는|=)\\s*(\\d+)(?![\\d.·\\/]|\\s*(?:÷|를|을|가|묶음|부분|씩|개라서))', 'g');
const reMI = /(?<![\d.·\/])(\d+)·(\d+)\/(\d+)\s*=\s*(\d+)\/(\d+)(?![\d.·\/])/g, reIM = /(?<![\d.·\/])(\d+)\/(\d+)\s*=\s*(\d+)·(\d+)\/(\d+)(?![\d.·\/])/g;
const reMD = /(?<![\d.·\/])(\d+)·(\d+)\/10\s*=\s*(\d+)\.(\d)(?![\d.·\/])/g, reDM = /(?<![\d.·\/])(\d+)\.(\d)\s*=\s*(\d+)·(\d+)\/10(?![\d.·\/])/g;
const reT1 = /(?<![\d.·\/])(\d+(?:\.\d)?)\s*(?:은|는)\s*0\.1이\s*(\d+)개/g, reT2 = /0\.1이\s*(\d+)개(?:이면|면|인 수는|\s*=)\s*(\d+(?:\.\d)?)(?![\d.·\/])/g;
const reRel = new RegExp('(?<![\\d.·\\/□♥★])(' + NUM + ')\\s*([<>])\\s*(' + NUM + ')(?![\\d.·\\/])', 'g');
const fcheck = (s, where) => { let m;
  reOf.lastIndex = 0; while ((m = reOf.exec(s))) { cnt.of++; if (!close(m[1] * m[2] / m[3], +m[4])) FB.push(where + ': ' + m[0]); }
  reMI.lastIndex = 0; while ((m = reMI.exec(s))) { cnt.mix++; if (m[3] !== m[5] || m[1] * m[3] + +m[2] !== +m[4] || +m[2] >= +m[3]) FB.push(where + ': ' + m[0]); }
  reIM.lastIndex = 0; while ((m = reIM.exec(s))) { cnt.mix++; if (m[2] !== m[5] || m[3] * m[5] + +m[4] !== +m[1] || +m[4] >= +m[5]) FB.push(where + ': ' + m[0]); }
  reMD.lastIndex = 0; while ((m = reMD.exec(s))) { cnt.dec++; if (m[1] !== m[3] || m[2] !== m[4]) FB.push(where + ': ' + m[0]); }
  reDM.lastIndex = 0; while ((m = reDM.exec(s))) { cnt.dec++; if (m[1] !== m[3] || m[2] !== m[4]) FB.push(where + ': ' + m[0]); }
  reT1.lastIndex = 0; while ((m = reT1.exec(s))) { cnt.tenth++; if (Math.round(m[1] * 10) !== +m[2]) FB.push(where + ': ' + m[0]); }
  reT2.lastIndex = 0; while ((m = reT2.exec(s))) { cnt.tenth++; if (Math.round(m[2] * 10) !== +m[1]) FB.push(where + ': ' + m[0]); }
  reRel.lastIndex = 0; while ((m = reRel.exec(s))) { const a = val(m[1]), b = val(m[3]); if (a == null || b == null) continue; cnt.rel++; if (m[2] === '<' ? !(a < b) : !(a > b)) FB.push(where + ': ' + m[0]); } };
allStr.forEach(([s0, where]) => { if (skip(where)) return; fcheck(s0.replace(/\*\*/g, ''), where); });
T('분수·소수 문장 전수 틀림 0 (분수만큼 ' + cnt.of + ' · 대분수↔가분수 ' + cnt.mix + ' · 분수↔소수 ' + cnt.dec + ' · 0.1의 개수 ' + cnt.tenth + ' · 부등호 ' + cnt.rel + ')', () => ok(FB.length === 0, FB.slice(0, 6).join(' | ')));
T('분수 검산 넉넉히 — 분수만큼 ≥ 10 · 대분수↔가분수 ≥ 8 · 분수↔소수 ≥ 6 · 0.1의 개수 ≥ 6 · 부등호 ≥ 10', () => { ok(cnt.of >= 10, 'of ' + cnt.of); ok(cnt.mix >= 8, 'mix ' + cnt.mix); ok(cnt.dec >= 6, 'dec ' + cnt.dec); ok(cnt.tenth >= 6, 'tenth ' + cnt.tenth); ok(cnt.rel >= 10, 'rel ' + cnt.rel); });
T('검산기 자체 확인 — 틀린 값 네 가지를 심으면 모두 잡는다', () => { const before = FB.length; ['12의 3/4 은 8이에요', '2·3/4 = 7/4', '3·1/10 = 3.2', '2.9는 0.1이 9개', '1.8 > 2.3'].forEach((t, i) => fcheck(t, 'probe' + i)); ok(FB.length - before === 5, '잡은 수 ' + (FB.length - before)); FB.length = before;
  fcheck('25의 4/5 는 5가 4개라서 20이에요 · 12의 1/3 은 12를 3묶음으로', 'probe-ok'); ok(FB.length === before, '오탐 ' + FB.slice(before).join(',')); FB.length = before; });

console.log('═══ G. 그림 ═══');
const showStr = (f) => Array.isArray(f.show) ? f.show.join(' ') : null;
KEYS.forEach(k => T(k + ' 개념 4장 fig 렌더 · fgroup 묶음·분수만큼 · fmix 가분수↔대분수 · nline 점 · show 식', () => { L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(s.data.fig, s.id + ' fig 없음'); const h = FIG.render(s.data.fig); ok(h && h.length > 200, s.id + ' 빈 그림'); ok(!/NaN|undefined/.test(h), s.id + ' NaN/undefined');
  const walkF = (f) => { if (!f) return; if (f.k === 'panels') return f.items.forEach(p => { walkF(p.fig || p); if (p.label) fcheck(p.label, s.id + ' 캡션'); });
    const ss = showStr(f); if (ss) { const before = FB.length; fcheck(ss, k + ' ' + s.id + ' show'); ok(FB.length === before, s.id + ' 그림 식 ' + ss); let m = ss.match(new RegExp('(\\d+)' + UNIT + '의\\s*(\\d+)\\/(\\d+)\\s*=\\s*(\\d+)')); if (m) { nCheck++; ok(close(m[1] * m[2] / m[3], +m[4]), s.id + ' ' + ss); } }
    if (f.k === 'fgroup') { const g = Math.floor(f.total / f.per); ok(f.total % f.per === 0, s.id + ' fgroup 똑같이 안 묶임'); ok(h.indexOf('data-g="' + g + '" data-m="' + f.m + '" data-v="' + f.m * f.per + '"') >= 0, s.id + ' fgroup data'); if (f.of) { nCheck++; ok(h.indexOf('>' + f.m * f.per + '<') >= 0, s.id + ' fgroup 분수만큼 글자'); } if (Array.isArray(f.show)) { const fr = f.show.find(x => /^\d+\/\d+$/.test(x)); if (fr) ok(fr === f.m + '/' + g, s.id + ' fgroup 분수 ' + fr + ' ≠ ' + f.m + '/' + g); } }
    if (f.k === 'fmix') { nCheck++; ok(h.indexOf('data-n="' + f.n + '" data-m="' + f.m + '" data-w="' + Math.floor(f.m / f.n) + '" data-p="' + f.m % f.n + '"') >= 0, s.id + ' fmix data'); if (Array.isArray(f.show)) f.show.forEach(x => { let m; if ((m = x.match(/^(\d+)\/(\d+)$/)) && +m[2] === f.n) ok(+m[1] === f.m, s.id + ' fmix 칠한 칸 ' + f.m + ' ≠ ' + x); if ((m = x.match(/^(\d+)·(\d+)\/(\d+)$/)) && +m[3] === f.n) ok(m[1] * f.n + +m[2] === f.m, s.id + ' fmix 대분수 ' + x); if ((m = x.match(/^(\d+)\.(\d)$/)) && f.n === 10) ok(+m[1] * 10 + +m[2] === f.m, s.id + ' fmix 소수 ' + x); }); if (f.units) ok(f.units * f.n >= f.m, s.id + ' fmix 칸 모자람'); }
    if (f.k === 'nline') { const at = (f.marks || []).map(mk => val(String(mk.at))); at.forEach(v => ok(v >= f.lo && v <= f.hi, s.id + ' nline 밖 ' + v)); ok(h.indexOf('data-at="' + at.map(v => +v.toFixed(4)).join(',') + '"') >= 0, s.id + ' nline data'); (f.marks || []).forEach(mk => { if (mk.label && val(mk.label) != null) ok(close(val(mk.label), val(String(mk.at))), s.id + ' nline 글자 ' + mk.label); }); }
    if (f.k === 'tenbox' && f.top) fcheck(f.top, s.id + ' tenbox');
    if (f.k === 'frac') ok(f.m <= f.n, s.id + ' frac'); };
  walkF(s.data.fig); }); }));

console.log('═══ H. 재료 충실 ═══');
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
KEYS.forEach(k => T(k + ' 개념 = 자기주도 개념 장 원문 · 기본 문제 = 자기주도 문제', () => { const src = SRC[k]; const texts = src.slides.map(x => norm(x.text)); const qs = src.problems.map(p => norm(p.q.replace(/인가요\?$/, '일까요?')));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => ok(texts.indexOf(norm(s.data.content)) >= 0, s.id + ' 원문 아님'));
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(qs.indexOf(norm(s.data.question)) >= 0, s.id + ' 문제 원문 아님')); }));
T('기본 문제는 그림 없이 풀린다 — 「색칠한 부분」·「수직선의 ?」·「카드 중에서」·「㉡」 꼴 0', () => KEYS.forEach(k => L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => ok(!/색칠한 부분|수직선의|카드 중에서|㉡|병뚜껑을|큐브를|자동차는|썼나요/.test(s.data.question), k + ' ' + s.id + ' ' + s.data.question))));
T('한 차시 안에서 같은 문제 식 중복 0 (기본·수준별·응용)', () => KEYS.forEach(k => { const sl = L[k].slides; const e = []; sl.filter(s => s.block === 'basic_problem').forEach(s => e.push(s.data.question)); const lv = sl[11].data.levels; e.push(lv.기본.q, lv.도전.q); e.push(sl[14].data.context + sl[14].data.challenge);
  const exprs = e.map(q => (String(q).match(/\d+\s*(?:개|m|cm|km|시간|자루|장)?의\s*\d+\/\d+|\d+·\d+\/\d+|\d+\.\d/) || [''])[0].replace(/\s/g, '')).filter(Boolean); const dup = exprs.filter((x, i) => exprs.indexOf(x) !== i); ok(!dup.length, k + ' 중복 ' + dup.join(',')); }));

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
T('「진분수·가분수·자연수」는 l05 전 · 「대분수」는 l06 전 학생 화면 0 · 그림도 l06 전엔 대분수로 그리지 않음', () => { KEYS.forEach((k, i) => { const t = stud(k), n = i + 1;
  if (n < 5) ok(!/진분수|가분수|자연수/.test(t), k + ' 진분수/가분수/자연수 선행'); if (n < 6) { ok(!/대분수/.test(t), k + ' 대분수 선행'); ok(!/\d·\d+\/\d/.test(t), k + ' 대분수 꼴 선행'); L[k].slides.filter(s => s.data.fig).forEach(s => { const h = FIG.render(s.data.fig); ok(!/data-fig="(fmix|panels)"/.test(h) || !/data-w="[1-9]" data-p="[1-9]"/.test(h) || !/o-fr/.test(h) || /show/.test('') || JSON.stringify(s.data.fig).indexOf('"show":"improper"') >= 0 || JSON.stringify(s.data.fig).indexOf('"show":[') >= 0 || !/fmix/.test(JSON.stringify(s.data.fig)), k + ' ' + s.id + ' 그림에 대분수'); }); } });
  ok(/진분수/.test(stud('u4_l05')) && /가분수/.test(stud('u4_l05')) && /대분수/.test(stud('u4_l06')), '도입 차시엔 실제로 나온다'); });

console.log('\n게이트 g3s2 수학 u4: ' + pass + '/' + fail + ' (통과/실패)');
process.exit(fail ? 1 : 0);
