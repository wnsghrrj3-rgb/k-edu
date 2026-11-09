/* gate_g6s2_math_u3.js — 6학년 2학기 수학 3단원 「소수의 나눗셈」 케이티처 2세대 게이트 (gate_g5s2_math_u3 틀 + 게이트 자체 소수 셈 · N63).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(dvs·dsc·rdq·lft) · 잘못된 인자는 던짐 · B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음)
   D 복습 계보(l01 = 2단원 u2_l12 출구 · l02 … l10 = 직전 출구) · 2단원 마지막 장 예고 = 소수의 나눗셈
   E 정답 다시 셈 — 게이트 자체 셈(부품·생성기와 따로: BigInt 유리수 · 반올림 · 버림 · 사람 수 = 자연수 부분 · 남는 양 = 전체 − 한 몫 × 사람 수)
     기본 문제 30 · 수준별 기본·도전 20(+ 풀이 끝 「= 답」) · 출구 30 · 넓히기 10 · 지식 답 표
   F 글 속 「… = …」 사슬 다시 셈(분수 a/b · 「…」 버림 포함) · G 그림 — dvs 몫·옮긴 칸·bug · dsc 배·몫 · rdq 반올림 · lft 횟수·남는 양 · jml 끝 · cll 식 = 게이트 셈
     · 문제 그림은 답을 그리지 않음 · 검사기 자체 확인(거짓 그림·틀린 식 잡음)
   H 재료 충실(개념 = 원문 장 또는 meta.concept_src 지도서 쪽 · 기본 문제 = 원문 · 다음 시간 = 원문) · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·다음 단원(4단원 비례식과 비례배분)
   L 선행(반올림 l07 · 남는 양 l09 — l01 단원 도입·다음 시간 예고 예외) · M 차단 어휘 · 「결」 0 · 인물 0(원문 달곰이·순달이, 교과서 혜리·선재·수지·은우·영훈)
   실행: NODE_PATH=<jsdom> node kedu/teacher/표준/gate_g6s2_math_u3.js */
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
const L = load(path.join(TDIR, 'data/g6s2_math_u3.js'));
const U2F = path.join(TDIR, 'data/g6s2_math_u2.js'); const L2 = fs.existsSync(U2F) ? load(U2F) : null;
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g6s2_math_u3.json'), 'utf8'));
const SK = { u3_l01: 'u3_l01', u3_l02: 'u3_l02', u3_l03: 'u3_l03', u3_l04: 'u3_l04', u3_l05: 'u3_l05', u3_l06: 'u3_l06', u3_l07: 'u3_l07', u3_l08: null, u3_l09: 'u3_l08', u3_l10: 'u3_l09' };
const KEYS = Array.from({ length: 10 }, (_, i) => 'u3_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '소수의 나눗셈', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 소수 셈 (부품의 BigInt 와 따로: 분수 [분자, 분모] 유리수) ── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; };
const R = (n, d) => { if (d === 0n) throw new Error('0으로 나눔'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
function num(s) { s = String(s).trim(); let m; if ((m = s.match(/^(\d+)\/(\d+)$/))) return R(BigInt(m[1]), BigInt(m[2])); if (!/^\d+(\.\d+)?$/.test(s)) throw new Error('수 아님 ' + s); const i = s.indexOf('.'); return i < 0 ? R(BigInt(s), 1n) : R(BigInt(s.replace('.', '')), 10n ** BigInt(s.length - i - 1)); }
const add = (a, b) => R(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), sub = (a, b) => R(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => R(a[0] * b[0], a[1] * b[1]), div = (a, b) => R(a[0] * b[1], a[1] * b[0]);
const eqR = (a, b) => a[0] === b[0] && a[1] === b[1];
function dec(r, maxd) { // 끝나는 소수면 글자, 아니면 null
  let [n, d] = r; let k = 0; while (k <= (maxd || 8)) { if ((n * 10n ** BigInt(k)) % d === 0n) { const v = n * 10n ** BigInt(k) / d; let s = v.toString(); if (k) { while (s.length <= k) s = '0' + s; s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); s = s.replace(/0+$/, '').replace(/\.$/, ''); } return s; } k++; } return null; }
function cut(r, k) { const v = r[0] * 10n ** BigInt(k) / r[1]; let s = v.toString(); if (k) { while (s.length <= k) s = '0' + s; s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); } return s; }
function rnd(r, p) { const v = r[0] * 10n ** BigInt(p + 1) / r[1]; let q = v / 10n; if (v % 10n >= 5n) q += 1n; let s = q.toString(); if (p) { while (s.length <= p) s = '0' + s; s = s.slice(0, s.length - p) + '.' + s.slice(s.length - p); } return s; }
const dpOf = (s) => { const i = String(s).indexOf('.'); return i < 0 ? 0 : String(s).length - i - 1; };
const floorR = (r) => r[0] / r[1];
const PL = { '일의 자리': 0, '소수 첫째 자리': 1, '소수 둘째 자리': 2 };
const qStr = (a, b) => { const r = div(num(a), num(b)); return dec(r) || null; };
// 값 견주기: 답 글자(… 포함) ↔ 유리수
function matchVal(ans, r) { const t = String(ans).replace(/\*\*/g, '').replace(/\s*(배|명|개|L|kg|cm|m|원|도막|통)$/, '').trim(); if (/…$/.test(t)) { const c = t.slice(0, -1); return cut(r, dpOf(c)) === c && !eqR(num(c), r); } try { return eqR(num(t), r); } catch (e) { return false; } }

let nCheck = 0; const badE = [];
const E1 = (where, cond, msg) => { nCheck++; if (!cond) badE.push(where + ' ' + msg); };
const DIVRE = /(\d+(?:\.\d+)?)\s*÷\s*(\d+(?:\.\d+)?)/; const PAREN = /(\d+(?:\.\d+)?)\)(\d+(?:\.\d+)?)/;
// 물음 하나 다시 셈 — 셈한 값(유리수) 또는 글자 답, 못 읽으면 null
function solve(q) {
  const t = clean(q); let m;
  const dvA = [...t.matchAll(new RegExp(DIVRE.source, 'g'))]; const dv = (/이어서/.test(t) && dvA.length > 1 ? dvA[dvA.length - 1] : t.match(DIVRE)) || (t.match(PAREN) ? (() => { const p = t.match(PAREN); return [p[0], p[2], p[1]]; })() : null);
  if ((m = t.match(/반올림하여 (일의 자리|소수 첫째 자리|소수 둘째 자리)까지/))) {
    if ((m = t.match(/몇째 자리 숫자/))) return null;
    const p = PL[t.match(/반올림하여 (일의 자리|소수 첫째 자리|소수 둘째 자리)까지/)[1]];
    if (dv) return { s: rnd(div(num(dv[1]), num(dv[2])), p) };
    let mm;
    if ((mm = t.match(/(\d+(?:\.\d+)?) L를 (\d+)명이 똑같이/))) return { s: rnd(div(num(mm[1]), num(mm[2])), p) };
    if ((mm = t.match(/거리는 (\d+(?:\.\d+)?) km.*거리는 (\d+(?:\.\d+)?) km/))) return { s: rnd(div(num(mm[1]), num(mm[2])), p) };
    return null;
  }
  { const mk = t.match(/(\d+(?:\.\d+)?)(?:의 소수점을|[을를]) (한|두|세) 칸 옮기면/); if (mk) return { r: mul(num(mk[1]), num(String(10 ** ({ 한: 1, 두: 2, 세: 3 })[mk[2]]))) }; }
  { const mk = t.match(/(\d+(?:\.\d+)?) ?kg과 [가-힣]+ (\d+(?:\.\d+)?) ?kg/); if (mk && /몇 배/.test(t)) return { r: div(num(mk[1]), num(mk[2])) }; }
  if (/몇 칸/.test(t) && dv) return { s: String(dpOf(dv[2])) };
  let m2;
  if ((m2 = t.match(/(\d+\.\d+)이 자연수가 되려면 소수점을 몇 칸/))) return { s: String(dpOf(m2[1])) };
  if ((m2 = t.match(/(\d+(?:\.\d+)?) ?(cm|m|L|kg)는? .*?(\d+(?:\.\d+)?) ?\2의 몇 배/))) return { r: div(num(m2[1]), num(m2[3])) };
  if ((m2 = t.match(/(\d+(?:\.\d+)?) (L|kg|m)[을를] [가-힣 ]*?(\d+(?:\.\d+)?) \2씩/)) && /몇 (명|개|봉지|통)|필요한/.test(t) && !/남는/.test(t)) return { r: R(floorR(div(num(m2[1]), num(m2[3]))), 1n) };
  let mm;
  if ((mm = t.match(/(\d+(?:\.\d+)?) L씩 (\d+)명에게/)) && /모두 몇 L/.test(t)) return { r: mul(num(mm[1]), num(mm[2])) };
  if ((mm = t.match(/(\d+(?:\.\d+)?) (L|kg|m)[을를] (?:한 명에게|한 상자에|통 한 개에|한 봉지에) (\d+(?:\.\d+)?) \2씩/)) && /몇 (명|개|봉지)|필요한/.test(t) && !/남는/.test(t)) return { r: R(floorR(div(num(mm[1]), num(mm[3]))), 1n) };
  if ((mm = t.match(/(\d+)명에게 (\d+(?:\.\d+)?) L씩/)) && /나누어 준|준\*?\*? /.test(t) && /모두 몇 L/.test(t)) return { r: mul(num(mm[1]), num(mm[2])) };
  if ((mm = t.match(/전체 (\d+(?:\.\d+)?) L 가운데 (\d+(?:\.\d+)?) L/)) && /남는/.test(t)) return { r: sub(num(mm[1]), num(mm[2])) };
  if ((mm = t.match(/(\d+(?:\.\d+)?) L를 한 명에게 (\d+(?:\.\d+)?) L씩 (\d+)명에게/)) && /남는/.test(t)) return { r: sub(num(mm[1]), mul(num(mm[2]), num(mm[3]))) };
  if ((mm = t.match(/(\d+(?:\.\d+)?) ?m[^\d]*?(\d+(?:\.\d+)?) ?m씩/)) && /도막/.test(t)) return { r: R(floorR(div(num(mm[1]), num(mm[2]))), 1n) };
  if ((mm = t.match(/(\d+(?:\.\d+)?) = (\d+(?:\.\d+)?)일 때 (\d+(?:\.\d+)?)\s*÷\s*(\d+(?:\.\d+)?)/))) return { r: div(num(mm[3]), num(mm[4])) };
  if ((mm = t.match(/(\d+(?:\.\d+)?)\/(\d+) ÷ (\d+(?:\.\d+)?)\/(\d+)/))) return { r: div(num(mm[1] + '/' + mm[2]), num(mm[3] + '/' + mm[4])) };
  if ((mm = t.match(/넓이가 (\d+(?:\.\d+)?) cm²인 직사각형의 세로가 (\d+(?:\.\d+)?) cm/))) return { r: div(num(mm[1]), num(mm[2])) };
  if (dv && /몫|계산하면|얼마|몇 배|몇 명|몇 개|필요한|분수의 나눗셈으로/.test(t) && !/분자끼리의 나눗셈|새로|까닭|잘못|어디|무엇으로|바꾸면|바꾼 것|옮겨야/.test(t)) {
    let r = div(num(dv[1]), num(dv[2]));
    if (/몇 명|몇 개/.test(t) && !dec(r)) r = R(floorR(r), 1n);
    return { r };
  }
  return null;
}
// 지식 답(셈이 아닌 답) — 게이트가 따로 들고 있는 표
const KNOW = {
  '6학년 1학기에 배운 (소수)÷(자연수)에서 몫의 소수점은 어디에 찍었나요?': '나누어지는 수의 소수점 위', '두 수에 똑같이 10배를 하면 몫은 어떻게 될까요?': '그대로예요',
  '2.4 cm와 0.8 cm를 mm로 바꾸면 어떤 나눗셈이 될까요?': '24÷8', '8.4÷2.1을 분수로 바꾸면 분자끼리 어떤 나눗셈이 될까요?': '84÷21', '8÷1.6을 세로로 계산할 때 8은 무엇으로 생각할까요?': '8.0',
  '1보다 작은 수로 나누면 몫은 나누어지는 수보다 어떻게 될까요?': '커져요', '몫을 반올림하여 소수 첫째 자리까지 나타내려면 몇째 자리 숫자를 볼까요?': '소수 둘째 자리', '34.8÷8을 계산할 때 소수점을 옮겨야 할까요?': '아니요',
  '나누어 주고 남는 양은 어떻게 구할까요?': '전체에서 나누어 준 양을 빼요', '5.4÷0.45에서 5.4를 두 칸 옮기면 얼마가 될까요?': '540'
};

console.log('═══ A. 로드 ═══');
T('10차시 키 u3_l01~l10 · 파일 data/g6s2_math_u3.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 · 3단원 소수의 나눗셈 · [6수01-15] · live_url 실파일(l08 = 원문 없음, 지도서) · 40분 · 쪽', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 6 && m.term === 2 && m.unit === 3 && m.subject === '수학' && m.unit_title === '소수의 나눗셈' && /6수01-15/.test(m.std) && m.n === +k.slice(-2), k); ok(m.duration_min === 40, k + ' 40분'); ok(/『수학』 \d+~\d+쪽/.test(m.pages), k + ' 쪽');
  if (SK[k]) { ok(fs.existsSync(path.join(TDIR, m.live_url)) || (process.env.KEDU_REPO && fs.existsSync(path.join(process.env.KEDU_REPO, 'kedu/teacher', m.live_url))), k + ' live_url ' + m.live_url); ok(m.source.endsWith(SRC[SK[k]].file), k + ' source'); } else ok(!m.live_url && /지도서 244~245/.test(m.source), k + ' 원문 없음 표시'); }));
T('slug — KT2.slugOf({g:6,s:math,t:2}) = g6s2_math', () => ok(KT2.slugOf({ g: 6, s: 'math', t: '2' }) === 'g6s2_math', 'slug'));
T('그림 부품 dvs·dsc·rdq·lft 등록 · 잘못된 인자는 던짐', () => {
  [{ k: 'dvs', a: '3.6', b: '0.5' }, { k: 'dsc', rows: [['8.4', '2.1'], ['84', '21']] }, { k: 'rdq', a: '3.7', b: '0.7' }, { k: 'lft', total: '7.8', each: '1.8', unit: 'L' }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'dvs', a: '3.6', b: '0.5', bug: '7.2' }, { k: 'dvs', a: '3.6', b: '0.5', bug: '7.3' }, { k: 'dvs', a: 'x', b: '1' }, { k: 'dsc', rows: [['8.4', '2.1'], ['84', '2.1']] }, { k: 'dsc', rows: [['8.4', '2.1'], ['840', '21']] }, { k: 'dsc', rows: [['8.4', '2.1']] }, { k: 'rdq', a: '7.2', b: '0.6' }, { k: 'lft', total: '1', each: '2' }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 8, '던짐 ' + th + '/8'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 10종 서로 다름 · 5-2 수학 2세대와 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 10, im.join(',')); const other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g5s2_math_u\d\.js$/.test(f) || /^g6s2_math_u[12456]\.js$/.test(f)).forEach(f => Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => s.data && s.data.img && other.push(s.data.img)))); ok(!im.some(x => other.indexOf(x) >= 0), '다른 단원과 겹침'); });
T('활동 갈래 — 짝·모둠·전체가 섞임 · l08 과자 집 = 모둠 10분', () => { const ty = KEYS.map(k => L[k].slides[12].data.type); ok(new Set(ty).size >= 3, ty.join(',')); ok(L.u3_l08.slides[12].data.type === 'group' && L.u3_l08.slides[12].data.minutes === 10, 'l08'); });

console.log('═══ D. 복습 계보 ═══');
ok(L2 && L2.u2_l12, '2단원 데이터 g6s2_math_u2 · u2_l12');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] : '2단원 u2_l12') + ' 출구', () => { const rv = L[k].slides[1].data;
  const ex = i ? L[KEYS[i - 1]].slides[15].data.items : L2.u2_l12.slides[15].data.items; ok(rv.from === (i ? KEYS[i - 1] : 'g6s2_math:u2_l12'), 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), ex.map(x => [x.q, x.a])), '출구 어긋남'); if (!i) ok(/지난 단원/.test(rv.title) && /공간과 입체/.test(rv.content), 'l01 제목·글'); }));
T('2단원 마지막 장 예고 = 3단원 소수의 나눗셈', () => ok(/소수의 나눗셈/.test(L2.u2_l12.slides[18].data.preview), '2단원 예고'));

console.log('═══ E. 정답 다시 셈 ═══');
const unsolved = [];
KEYS.forEach(k => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, got = d.options ? d.options.find(o => o.correct).text : String(d.answer), sv = solve(d.question);
    if (!sv) { unsolved.push(k + ' ' + s.id + ' ' + clean(d.question).slice(0, 30)); return; } E1(k + ' ' + s.id, sv.r ? matchVal(got, sv.r) : got === sv.s, '기본 ' + got + ' ≠ ' + (sv.r ? dec(sv.r) || cut(sv.r, 3) : sv.s)); });
  const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => { const x = lv[t], sv = solve(x.q); if (!sv) { E1(k + ' ' + t, false, '수준별 못 읽음 ' + x.q); return; } E1(k + ' ' + t, sv.r ? matchVal(x.a, sv.r) : x.a === sv.s, '수준별 ' + x.a); E1(k + ' ' + t + ' 풀이 끝', nsp(x.steps[x.steps.length - 1]).replace(/^=/, '') === nsp(x.a), '풀이 끝 ≠ 답'); });
  sl[15].data.items.forEach((x, j) => { const sv = solve(x.q); if (sv) E1(k + ' 출구' + j, sv.r ? matchVal(x.a, sv.r) : x.a === sv.s, '출구 ' + x.a); else { E1(k + ' 출구' + j, KNOW[clean(x.q)] !== undefined, '못 읽고 지식 표에도 없음: ' + x.q); E1(k + ' 출구' + j, KNOW[clean(x.q)] === x.a, '지식 답 ' + x.a); } });
});
// 넓히기 — 여러 단계라 게이트가 단계를 따로 셈
const ADV = { u3_l01: () => div(num('1.2'), num('0.3')), u3_l02: () => div(mul(num('2.4'), num('2')), mul(num('0.8'), num('2'))), u3_l03: () => sub(div(num('2.7'), num('0.3')), div(num('2.8'), num('0.4'))), u3_l04: () => div(num('4.34'), num('0.31')),
  u3_l05: () => div(num('7.36'), num('3.2')), u3_l06: () => div(num('5'), num('0.4')), u3_l07: () => num(rnd(div(num('3.5'), num('1.7')), 2)), u3_l08: () => div(num('1110'), num('185')), u3_l09: () => sub(num('4'), mul(num('1.3'), num('3'))), u3_l10: () => num(rnd(div(num('16.3'), num('2.56')), 1)) };
KEYS.forEach(k => { const d = L[k].slides[14].data, m = d.note.match(/\*\*([\d.]+)\*\*/); E1(k + ' 넓히기', m && matchVal(m[1], ADV[k]()), '넓히기 ' + (m && m[1])); });
T('기본·수준별·출구·넓히기 정답 = 게이트 셈 (' + nCheck + ') 틀림 0', () => ok(!badE.length, badE.slice(0, 8).join(' | ')));
T('기본 문제 셈으로 못 읽는 것 ≤ 6 (지식·까닭 물음) — ' + unsolved.length, () => ok(unsolved.length <= 6, unsolved.join(' | ')));
T('다시 셈 수 ≥ 85', () => ok(nCheck >= 85, nCheck));
T('수준별 심화 = 열린 답 · 기본/도전 답 서로 다름', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; ok(lv.심화.open, k); ok(lv.기본.q !== lv.도전.q, k); }));
T('게이트 셈 자체 확인 — 1÷6 → 0.17 · 3.7÷0.7 → 5 / 5.3 / 5.29 · 7.8÷1.8 사람 4 · 남는 0.6 · 0.166… 버림 견주기', () => { const r = div(num('1'), num('6')); ok(rnd(r, 2) === '0.17' && cut(r, 3) === '0.166', '1÷6'); const q = div(num('3.7'), num('0.7')); ok(rnd(q, 0) === '5' && rnd(q, 1) === '5.3' && rnd(q, 2) === '5.29', '3.7÷0.7');
  ok(floorR(div(num('7.8'), num('1.8'))) === 4n && dec(sub(num('7.8'), mul(num('1.8'), num('4')))) === '0.6', '남는 양'); ok(matchVal('0.166…', r) && !matchVal('0.167…', r) && !matchVal('5.3', q), '견주기'); });

console.log('═══ F. 식 전수 ═══');
const NUM = '\\d+(?:\\.\\d+)?(?:\\/\\d+)?…?'; const EX = '(?:' + NUM + '(?:\\s*[÷×+−]\\s*' + NUM + ')?)';
const CHAIN = new RegExp('(?<![\\d./×÷+−])(?<![÷×+−] )(' + EX + ')((?:\\s*=\\s*' + EX + ')+)(?![\\d/])', 'g');
let nEq = 0; const badEq = [];
function evx(e) { e = e.trim(); const m = e.match(new RegExp('^(' + NUM + ')\\s*([÷×+−])\\s*(' + NUM + ')$')); const v = (s) => /…$/.test(s) ? { lng: s.slice(0, -1) } : { r: num(s) };
  if (!m) return v(e); const a = v(m[1]), b = v(m[3]); if (a.lng || b.lng) return null; const op = m[2]; return { r: op === '÷' ? div(a.r, b.r) : op === '×' ? mul(a.r, b.r) : op === '+' ? add(a.r, b.r) : sub(a.r, b.r) }; }
function eqText(t, where) { t = String(t).replace(/\*\*/g, '').replace(/(\d+(?:\.\d+)?)\)(\d+(?:\.\d+)?)/g, '$2 ÷ $1'); let m; CHAIN.lastIndex = 0; while ((m = CHAIN.exec(t))) { const parts = [m[1]].concat(m[2].split('=').slice(1)); let vals; try { vals = parts.map(evx); } catch (e) { continue; }
  const exact = vals.find(v => v && v.r); if (!exact) continue; for (const v of vals) { if (!v) continue; nEq++; const good = v.r ? eqR(v.r, exact.r) : (cut(exact.r, dpOf(v.lng)) === v.lng && !dec(exact.r, dpOf(v.lng))); if (!good) badEq.push(where + ' 「' + m[0] + '」'); } } }
KEYS.forEach(k => L[k].slides.forEach(s => { const d = s.data; const txts = [];
  ['content', 'note', 'question', 'context', 'challenge', 'right', 'wrong', 'desc', 'preview'].forEach(f => d[f] && txts.push(d[f])); if (d.levels) Object.values(d.levels).forEach(l => { txts.push(l.q, l.a); (l.steps || []).forEach(x => txts.push(x)); });
  if (d.points) d.points.forEach(x => txts.push(x)); if (d.scenario) txts.push(d.scenario.body); if (d.items && s.block !== 'self_assessment') d.items.forEach(x => txts.push(x.q || x, x.a || '')); if (d.steps) d.steps.forEach(x => txts.push(x));
  txts.forEach(x => eqText(x, k + ' ' + s.id)); }));
KEYS.forEach(k => L[k].extras.forEach(e => eqText(e.content || e.description || '', k + ' ' + e.id)));
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 60', () => ok(!badEq.length && nEq >= 60, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음 — 소수·분수·「…」)', () => { const b0 = badEq.length; ['8.4 ÷ 2.1 = 84 ÷ 21 = 5', '7.8 − 7.2 = 0.4', '1÷6 = 0.167…', '84/10 ÷ 21/10 = 4.2'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 4, '틀린 식 못 잡음 ' + (badEq.length - b0)); badEq.length = b0; });

console.log('═══ G. 그림 ═══');
// 게이트 자체 세로셈 몫(부품과 따로): 끝나면 정확한 몫, 아니면 upto 자리 버림 + …
function dvsWant(a, b, upto) { const r = div(num(a), num(b)); const d = dec(r, 6); if (d !== null && dpOf(d) <= 6) return d; return cut(r, upto == null ? 4 : upto) + '…'; }
const figs = []; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) figs.push([k + ' ' + s.id, s.data.fig, s.block, s.data]); }));
const nG = {};
function checkFig(where, f, block, d) {
  const h = FIG.render(f); ok(h && h.length > 80 && !/NaN|undefined/.test(h), where + ' 렌더'); nG[f.k] = (nG[f.k] || 0) + 1; const doc = docOf(h);
  if (f.k === 'dvs') { const [a, b, k, q, ask, bug] = doc.querySelector('[data-dvs]').getAttribute('data-dvs').split('|'); ok(a === f.a && b === f.b, where + ' 수'); ok(+k === dpOf(b), where + ' 옮긴 칸 ' + k); ok(q === dvsWant(a, b, f.upto), where + ' 몫 ' + q + ' ≠ ' + dvsWant(a, b, f.upto));
    const shown = [...doc.querySelectorAll('.dvs-qd')].map(x => x.textContent).join('');
    if (f.ask) ok(!shown && /\?/.test(doc.querySelector('.dvs-q').textContent), where + ' ask 인데 몫이 보임'); else if (f.bug) { ok(/잘못/.test(JSON.stringify([d.title, d.content, d.question])), where + ' 틀린 몫 그림은 「잘못」 장에만'); ok(bug === f.bug && f.bug !== q && f.bug.replace('.', '').replace(/^0+/, '') === q.replace('.', '').replace(/^0+/, ''), where + ' bug'); } else ok(shown === q.replace('…', '').replace('.', ''), where + ' 몫 숫자 ' + shown);
    const nRow = doc.querySelectorAll('.dvs-r.p').length; ok(nRow >= 1, where + ' 곱 줄'); }
  if (f.k === 'dsc') { const rows = f.rows.map(r => div(num(r[0]), num(r[1]))); rows.forEach(r => ok(eqR(r, rows[0]), where + ' 몫 다름')); const lab = doc.querySelector('[data-dsc]').getAttribute('data-dsc').split('|'); ok(lab[1] === dec(rows[0]), where + ' 몫 ' + lab[1]);
    f.rows.slice(1).forEach((r, i) => { const fa = div(num(r[0]), num(f.rows[i][0])), fb = div(num(r[1]), num(f.rows[i][1])); ok(eqR(fa, fb), where + ' 배 다름'); ok(lab[2].split(',')[i] === dec(fa) + '배', where + ' 배 이름표 ' + lab[2]); });
    if (f.ask === 'q') ok(![...doc.querySelectorAll('.dsc-q')].some(x => x.textContent === lab[1]), where + ' ask 인데 몫이 보임'); }
  if (f.k === 'rdq') { const v = doc.querySelector('[data-rdq]').getAttribute('data-rdq').split('|'); const pl = (f.places || [0, 1, 2]); const want = pl.map(p => rnd(div(num(f.a), num(f.b)), p)); ok(v[3] === want.join(','), where + ' 반올림 ' + v[3] + ' ≠ ' + want.join(',')); }
  if (f.k === 'lft') { const v = doc.querySelector('[data-lft]').getAttribute('data-lft').split('|'); const n = floorR(div(num(f.total), num(f.each))), r = sub(num(f.total), mul(num(f.each), R(n, 1n))); ok(v[2] === String(n) && v[3] === dec(r), where + ' 횟수·남는 양 ' + v.join('|'));
    if (f.ask === 'r') ok(!new RegExp('남는 양 ' + dec(r).replace('.', '\\.')).test(doc.body.textContent), where + ' ask r 인데 남는 양 보임'); if (f.ask === 'n') ok(doc.body.textContent.indexOf(n + '번') < 0, where + ' ask n 인데 횟수 보임'); }
  if (f.k === 'jml') { const v = doc.querySelector('[data-jump]').getAttribute('data-jump').split('|'); ok(eqR(num(v[4]), mul(num(f.step), num(String(f.times)))), where + ' 뛰어 세기 끝'); }
  if (f.k === 'cll') { const lastV = (e) => { const m = String(e).match(/=\s*([\d.\/]+)…?\s*$/); return m ? num(m[1]) : null; };
    f.rows.forEach(r => { const b0 = badEq.length; eqText(r.expr, where); ok(badEq.length === b0, where + ' 식 틀림 ' + r.expr); });
    const bad = f.rows.filter(r => r.cls === 'bad').map(r => lastV(r.expr)).filter(Boolean), hi = f.rows.filter(r => r.cls === 'hi').map(r => lastV(r.expr)).filter(Boolean);
    bad.forEach(b => ok(!hi.some(h => eqR(h, b)), where + ' 잘못된 길과 바른 길의 값이 같음')); }
  if (block === 'basic_problem') { const ans = d.options ? d.options.find(o => o.correct).text : String(d.answer); const vis = [...doc.querySelectorAll('text, span, div')].map(x => x.textContent.trim()); if (f.k === 'dvs' && !f.ask) ok(vis.join('').indexOf(ans.replace('.', '')) < 0 || clean(d.question).indexOf('반올림') >= 0, where + ' 문제 그림에 답'); }
}
T('그림 ' + figs.length + '개 — 세로셈 몫·칸·bug · 배·몫 · 반올림 · 덜어 내기 · 뛰어 세기 · 식 줄 · 답 가림', () => figs.forEach(([w0, f, b, d]) => checkFig(w0, f, b, d)));
T('개념 40장 모두 그림 · 기본 문제 그림 ≥ 10 · 그 가운데 ask/가림 ≥ 9', () => { let c = 0, p = 0, a = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem' && s.data.fig) { p++; if (s.data.fig.ask) a++; } })); ok(c === 40 && p >= 10 && a >= 9, c + '/' + p + '/' + a); });
T('그림 부품 수 — dvs ≥ 18 · dsc ≥ 6 · rdq ≥ 2 · lft ≥ 4 · cll ≥ 10 · jml ≥ 4 · bug ≥ 1', () => { ok(nG.dvs >= 18 && nG.dsc >= 6 && nG.rdq >= 2 && nG.lft >= 4 && nG.cll >= 10 && nG.jml >= 4, JSON.stringify(nG)); ok(figs.some(([, f]) => f.bug), 'bug'); });
T('그림 검사기 자체 확인 — 거짓 몫·거짓 배·거짓 반올림은 부품이 던지거나 게이트가 잡음', () => { let c = 0; [{ k: 'dvs', a: '54', b: '1.5', bug: '36' }, { k: 'dsc', rows: [['8.64', '2.4'], ['864', '24']] }, { k: 'rdq', a: '1', b: '6', places: [3] }].forEach(f => { try { checkFig('probe', f, 'concept', {}); } catch (e) { c++; } }); ok(c === 3, c + '/3'); });

console.log('═══ H. 재료 충실 ═══');
const nk = (s) => String(s).replace(/계산 결과가/g, '계산한 값이').replace(/결과가/g, '값이').replace(/결과는/g, '값은').replace(/결과를/g, '값을').replace(/어떻게 해결했나/g, '어떻게 풀었나').replace(/해결/g, '풀이');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+(?:\.\d+)?/g) || []).join(',');
KEYS.forEach(k => T(k + ' 개념 = 원문 장(또는 지도서 쪽 표시) · 기본 문제 = 원문(수·보기·정답) · 다음 시간 = 원문 다음', () => { const src = SK[k] ? SRC[SK[k]] : null;
  const cs = L[k].meta.concept_src || {}; Object.keys(cs).forEach(id => ok(L[k].slides.find(s => s.id === id && s.block === 'concept'), id + ' concept_src 장 없음'));
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(!('source_note' in s.data), s.id + ' 장 안 근거 필드(무대가 안 그림)'); if (cs[s.id]) { ok(/지도서|『수학』/.test(cs[s.id]), s.id + ' 근거 쪽'); return; } ok(src && src.slides.some(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title), s.id + ' 원문 아님'); });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; if (!src) { ok(/과자 카드/.test(d.question), s.id + ' l08 = 『수학』 70~71쪽 과자 카드'); return; }
    const ps = src.problems.filter(p => numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); if (ps[0].opts) ok(d.options[ps[0].ci].correct, s.id + ' 보기·정답'); });
  const nx = L[k].slides[18].data; if (src && !['u3_l07', 'u3_l10'].includes(k)) ok(nx.preview.indexOf(nk(src.next)) === 0, '다음 ' + nx.preview); }));
T('원문 인물 장(l01 「달곰이의 삼행시」·「순달이가 멈춘 자리」) 안 씀', () => { const used = L.u3_l01.slides.filter(s => s.block === 'concept').map(s => s.data.title); ok(!used.some(t => /달곰|순달/.test(t)), used.join(',')); });
T('한 차시 안에서 같은 문제 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));
T('교과서 수 — 차시마다 지도서 장면 수가 화면에 있음', () => { const NEED = { u3_l01: ['1.5', '0.3'], u3_l02: ['2.4', '0.8', '8.4', '2.1'], u3_l03: ['3.6', '0.5', '24.5', '3.5'], u3_l04: ['8.24', '4.12', '2.24', '0.08'], u3_l05: ['5.4', '0.45', '8.64', '2.4'], u3_l06: ['1.6', '1.75'], u3_l07: ['3.7', '0.7'], u3_l08: ['52', '1.3', '11.1', '1.85'], u3_l09: ['7.8', '1.8', '10.2', '1.4'], u3_l10: ['1.18', '0.2', '19.2', '6.52'] };
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
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 4단원 비례식과 비례배분 · 다른 차시는 「다음 시간엔」 · l07 → 과자 집 · l08 → 남는 양', () => { const nx = L.u3_l10.slides[18].data; ok(nx.title === '다음 단원엔' && /비례식과 비례배분/.test(nx.preview), '다음 단원 ' + nx.preview); KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); ok(/과자 집/.test(L.u3_l07.slides[18].data.preview) && /남는 양/.test(L.u3_l08.slides[18].data.preview), '예고 계보'); });
T('교사 화면 영어 코드 0 — 제목·표지·글에 u3·l01·L02 같은 말 없음', () => KEYS.forEach(k => { const vis = JSON.stringify(L[k].slides.map(s => { const d = Object.assign({}, s.data); delete d.from; delete d.img; delete d.fig; return d; })) + JSON.stringify(L[k].meta.title); ok(!/\bu\d_l\d|\bL\d\d\b|\bl\d\d\b/.test(vis), k); }));

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson'));
const FIRST = [['반올림', 7], ['남는 양', 9]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 · 다음 시간 예고 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));
T('「나머지」 말은 소수의 나눗셈에서 쓰지 않음(지도서 212 ⑤) — 오개념·발문 경계 글 밖 0', () => KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'misconception' || s.block === 'offline_activity') return; const t = JSON.stringify(Object.assign({}, s.data, { tnote: null })); ok(t.indexOf('나머지') < 0, k + ' ' + s.id); })));

console.log('═══ M. 차단 어휘 · 「결」 · 인물 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 달곰이·순달이·곰이·펭이·혜리·선재·수지·은우·영훈 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결', '곰이', '펭이', '달곰', '순달', '여울이', '혜리', '선재', '수지', '은우', '영훈'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」 0', () => figs.forEach(([w0, f]) => ok(FIG.render(f).indexOf('결') < 0, w0)));

console.log('\n게이트 g6s2 수학 u3: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
