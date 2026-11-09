/* gate_g6s2_math_u6.js — 6학년 2학기 수학 6단원 「원기둥, 원뿔, 구」 케이티처 2세대 게이트 (N66 준비본 · gate_g6s2_math_u3 틀 + 게이트 자체 입체 셈).
   2세대 무대(stage2.js renderSlide)로 실렌더한다.
   A 로드·부품 등록(sol6·rot6·net6·fvw6) · 잘못된 인자는 던짐 · B 19장 골격 · C 7요소(6학년 = 인물 없이 장면·물음)
   D 복습 계보(l01 = 5단원 u5_l10 출구, 5단원 데이터가 없으면 지도서 진단 평가 세 문항 · l02 … l11 = 직전 출구)
   E 정답 다시 셈 — 게이트 자체 셈(부품·생성기와 따로: 유리수 BigInt · 원주율 157/50 · 돌리기(붙인 변 = 높이 · 뻗은 변 = 반지름) · 전개도(가로 = 지름 × 3.14)
     · 앞모양(삼각형 = 지름 × 높이 ÷ 2 · 직사각형 = 지름 × 높이) · 개수(밑면·평평한 면·꼭짓점·구의 중심 — 게이트 진리표))
     기본 문제 33 · 수준별 기본·도전 22(+ 풀이 끝 「= 답」) · 출구 33 · 넓히기 11 · 셈이 아닌 물음은 게이트 지식 표
   F 글 속 「… = …」 사슬 다시 셈 · G 그림 — sol6 진리표·라벨 허용표 · rot6 매핑·지름 · net6 가로 = 지름 × 3.14·픽셀 비 3.14·세로 배율 · fvw6 본 모양·넓이 · 문제 그림은 답을 그리지 않음 · 검사기 자체 확인
   H 재료 충실(개념 = 원문 장 또는 지도서 쪽 표시 · 기본 문제 = 원문 · 다음 시간 = 원문) · 교과서 수 · I 실렌더 · J extras 22 · K 발문·물음 끝맺음·마지막 장
   L 선행(전개도 l04 · 모선 l07 · 구의 중심 l08 — l01 단원 도입·다음 시간 예고 예외) · M 차단 어휘 · 「결」 0 · 인물 0 · 중학교 용어(회전체·직원기둥 …) 0 · 원뿔의 전개도 0
   실행: NODE_PATH=<jsdom> node kedu/teacher/표준/gate_g6s2_math_u6.js */
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
const L = load(path.join(TDIR, 'data/g6s2_math_u6.js'));
const U5F = path.join(TDIR, 'data/g6s2_math_u5.js'); const L5 = fs.existsSync(U5F) ? load(U5F) : null;
const SRC = JSON.parse(fs.readFileSync(path.join(TDIR, 'scripts/src_g6s2_math_u6.json'), 'utf8'));
const SK = { u6_l01: 'u6_l01', u6_l02: 'u6_l02', u6_l03: 'u6_l03', u6_l04: 'u6_l04', u6_l05: 'u6_l05', u6_l06: 'u6_l06', u6_l07: 'u6_l07', u6_l08: 'u6_l08', u6_l09: null, u6_l10: 'u6_l09', u6_l11: 'u6_l10' };
const KEYS = Array.from({ length: 11 }, (_, i) => 'u6_l' + String(i + 1).padStart(2, '0'));
const ORDER = ['cover', 'review', 'motivate', 'concept', 'concept', 'concept', 'concept', 'misconception', 'basic_problem', 'basic_problem', 'basic_problem', 'leveled_problem', 'offline_activity', 'real_world', 'advanced_problem', 'exit_ticket', 'summary', 'self_assessment', 'next_lesson'];
const STAGE = ['도입', '도입', '도입', '전개', '전개', '전개', '전개', '전개', '기본문제', '기본문제', '기본문제', '기본문제', '응용문제', '응용문제', '응용문제', '정리', '정리', '정리', '정리'];

const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const w = dom.window; w.KT2_NO_BOOT = true;
['stage2-art.js', 'stage2-fig.js', 'stage2.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(S2, f), 'utf8'), dom.getInternalVMContext(), { filename: f }));
const KT2 = w.KT2, FIG = w.KT2_FIG;
const render = (s, les, rev) => KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta, unitTitle: '원기둥, 원뿔, 구', classNames: [] });
const docOf = (h) => new JSDOM('<body>' + h + '</body>').window.document;
const clean = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const nsp = (s) => String(s).replace(/\*\*/g, '').replace(/\s+/g, '');
const SAME = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ── 게이트 자체 셈: 분수 [분자, 분모] BigInt 유리수 · 원주율 = 157/50 (부동소수 금지) ── */
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; };
const R = (n, d) => { if (d === 0n) throw new Error('0으로 나눔'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return [n / g, d / g]; };
function num(s) { s = String(s).trim(); let m; if ((m = s.match(/^(\d+)\/(\d+)$/))) return R(BigInt(m[1]), BigInt(m[2])); if (!/^\d+(\.\d+)?$/.test(s)) throw new Error('수 아님 ' + s); const i = s.indexOf('.'); return i < 0 ? R(BigInt(s), 1n) : R(BigInt(s.replace('.', '')), 10n ** BigInt(s.length - i - 1)); }
const add = (a, b) => R(a[0] * b[1] + b[0] * a[1], a[1] * b[1]), sub = (a, b) => R(a[0] * b[1] - b[0] * a[1], a[1] * b[1]), mul = (a, b) => R(a[0] * b[0], a[1] * b[1]), div = (a, b) => R(a[0] * b[1], a[1] * b[0]);
const eqR = (a, b) => a[0] === b[0] && a[1] === b[1];
const PI = R(157n, 50n), TWO = R(2n, 1n), I = (n) => R(BigInt(n), 1n);
function dec(r) { let [n, d] = r; for (let k = 0; k <= 8; k++) { if ((n * 10n ** BigInt(k)) % d === 0n) { let s = (n * 10n ** BigInt(k) / d).toString(); if (k) { while (s.length <= k) s = '0' + s; s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); s = s.replace(/0+$/, '').replace(/\.$/, ''); } return s; } } return null; }
function matchVal(ans, r) { const t = String(ans).replace(/\*\*/g, '').replace(/\s*(cm²|cm|개)$/, '').trim(); try { return eqR(num(t), r); } catch (e) { return false; } }
// 게이트 진리표(부품과 따로)
const TR = { 원기둥: { 밑면: 2, '평평한 면': 2, 꼭짓점: 0, '구의 중심': 0, 옆면: 1 }, 원뿔: { 밑면: 1, '평평한 면': 1, 꼭짓점: 1, '구의 중심': 0, 옆면: 1 }, 구: { 밑면: 0, '평평한 면': 0, 꼭짓점: 0, '구의 중심': 1, 옆면: 0 } };
const PRISM = { 삼: 3, 사: 4, 오: 5, 육: 6 };

let nCheck = 0; const badE = [];
const E1 = (where, cond, msg) => { nCheck++; if (!cond) badE.push(where + ' ' + msg); };
const N = '(\\d+(?:\\.\\d+)?)';
function solve(q) {
  const t = clean(q).replace(/ (?=(인|이고|이에요|예요|이며)[ ,.])/g, ''); let m;
  // 각기둥·각뿔 (6학년 1학기 되짚기)
  if ((m = t.match(/(삼|사|오|육)각(기둥|뿔)의 (면|모서리|꼭짓점)[은는] 모두 몇 개/))) { const n = PRISM[m[1]]; return { r: I(m[2] === '기둥' ? { 면: n + 2, 모서리: 3 * n, 꼭짓점: 2 * n }[m[3]] : { 면: n + 1, 모서리: 2 * n, 꼭짓점: n + 1 }[m[3]]) }; }
  if ((m = t.match(/(삼|사|오|육)각(기둥|뿔)의 밑면은 몇 개/))) return { r: I(m[2] === '기둥' ? 2 : 1) };
  if ((m = t.match(/(삼|사|오|육)각기둥.*?(삼|사|오|육)각뿔.*?(밑면|면)의 수를 (?:모두 )?더하면/))) { const a = PRISM[m[1]], b = PRISM[m[2]]; return { r: I(m[3] === '밑면' ? 3 : (a + 2) + (b + 1)) }; }
  // 개수 — 「원기둥 1개, 원뿔 1개, 구 2개」 꼴 또는 이름만 나열
  { const what = (t.match(/(평평한 면|밑면|뾰족한 꼭짓점|꼭짓점|구의 중심)(?:의 수)?[은는을를이가]? .*?몇 개/) || [])[1];
    if (what && /원기둥|원뿔|구/.test(t)) { const w0 = what.replace('뾰족한 ', ''); const cnt = {}; let mm; const re = /(원기둥|원뿔|구) (\d+)개/g; while ((mm = re.exec(t))) cnt[mm[1]] = (cnt[mm[1]] || 0) + +mm[2];
      if (!Object.keys(cnt).length) { (t.match(/원기둥|원뿔|구(?=[ ·의])/g) || []).forEach(x => { cnt[x] = 1; }); }
      if (/구 2개에서 구의 중심/.test(t)) return { r: I(2) };
      const keys = Object.keys(cnt).filter(k => !(w0 === '구의 중심' && k !== '구')); if (keys.length && TR.원기둥[w0] != null) return { r: I(keys.reduce((a, k) => a + TR[k][w0] * cnt[k], 0)) }; } }
  // 전개도 — 옆면의 가로
  if ((m = t.match(new RegExp('밑면의 (반지름|지름)이 ' + N + ' ?cm인 원기둥의 전개도(?:에서|예요\\.)? ?옆면의 가로')))) { const d = m[1] === '반지름' ? mul(num(m[2]), TWO) : num(m[2]); return { r: mul(d, PI) }; }
  if ((m = t.match(new RegExp('옆면의 가로가 ' + N + ' ?cm(?:, 세로가 ' + N + ' ?cm)?')))) { const d = div(num(m[1]), PI);
    if (/지름과 높이를 더하면/.test(t) && m[2]) return { r: add(d, num(m[2])) }; if (/반지름은/.test(t)) return { r: div(d, TWO) }; if (/지름은/.test(t)) return { r: d }; }
  // 돌리기
  if ((m = t.match(new RegExp('가로 ' + N + ' ?cm, 세로 ' + N + ' ?cm인 직사각형을 (?:길이가 )?' + N + ' ?cm인 변을 기준으로')))) { const st = num(m[3]), other = eqR(num(m[1]), st) ? num(m[2]) : num(m[1]);
    if (/밑면의 지름/.test(t)) return { r: mul(other, TWO) }; if (/높이/.test(t)) return { r: st }; }
  if ((m = t.match(new RegExp('직각을 낀 두 변이 ' + N + ' ?cm, ' + N + ' ?cm인 직각삼각형을 ' + N + ' ?cm인 변을 기준으로')))) { const st = num(m[3]), other = eqR(num(m[1]), st) ? num(m[2]) : num(m[1]);
    if (/밑면의 지름/.test(t)) return { r: mul(other, TWO) }; if (/높이/.test(t)) return { r: st }; }
  if ((m = t.match(new RegExp('밑변이 ' + N + ' ?cm, 높이가 ' + N + ' ?cm ?인? ?직각삼각형의 높이 쪽 변을 막대에')))) { if (/지름/.test(t)) return { r: mul(num(m[1]), TWO) }; }
  if ((m = t.match(new RegExp('반지름이 ' + N + ' ?cm인 반원을 지름을 기준으로')))) { if (/반지름은/.test(t)) return { r: num(m[1]) }; if (/지름은/.test(t)) return { r: mul(num(m[1]), TWO) }; }
  if ((m = t.match(/(직사각형|직각삼각형|지름을 따라 반으로 나눈 원) 모양의 종이를 막대에 붙이고 한 바퀴 돌렸어요\. 어떤 입체도형/))) return { s: { 직사각형: '원기둥', 직각삼각형: '원뿔', '지름을 따라 반으로 나눈 원': '구' }[m[1]] };
  if (/막대에 붙인 변(?:\*\*)?은 만들어진 (원기둥|원뿔)의 무엇/.test(t)) return { s: '높이' };
  // 원기둥 높이·지름
  if ((m = t.match(new RegExp('두 밑면 사이의 거리가 ' + N + ' ?cm')))) { if (/높이는 몇/.test(t)) return { r: num(m[1]) }; }
  if ((m = t.match(new RegExp('밑면의 (반지름|지름)이 ' + N + ' ?cm(?:이고|,) 높이가 ' + N + ' ?cm(?:, 모선이 ' + N + ' ?cm)?')))) { const v = num(m[2]), h = num(m[3]);
    if (/반지름과 높이를 더하면/.test(t)) return { r: add(m[1] === '지름' ? div(v, TWO) : v, h) }; if (/지름과 높이를 더하면/.test(t)) return { r: add(m[1] === '반지름' ? mul(v, TWO) : v, h) }; }
  if ((m = t.match(new RegExp('밑면의 반지름이 ' + N + ' ?cm인 원기둥(?:이 있어요\\. 이 원기둥)?의 밑면의 지름')))) return { r: mul(num(m[1]), TWO) };
  if ((m = t.match(new RegExp('반지름이 ' + N + ' ?cm 인? ?반원을 지름을 기준으로 한 바퀴 돌려 구를 만들었어요\\. 이 구를 반으로 자른 면의 지름')))) return { r: mul(num(m[1]), TWO) };
  // 원뿔 높이
  if ((m = t.match(new RegExp('수직으로 내린 선분은 ' + N + ' ?cm')))) { if (/높이는 몇/.test(t)) return { r: num(m[1]) }; }
  // 앞모양
  if ((m = t.match(new RegExp('밑면의 (지름|반지름)이 ' + N + ' ?cm, 높이가 ' + N + ' ?cm인 원뿔을 앞에서')))) { const b = m[1] === '반지름' ? mul(num(m[2]), TWO) : num(m[2]); if (/넓이/.test(t)) return { r: div(mul(b, num(m[3])), TWO) }; }
  if ((m = t.match(new RegExp('직사각형의 넓이가 ' + N + ' ?cm², (세로|가로)가 ' + N + ' ?cm')))) return { r: div(num(m[1]), num(m[3])) };
  return null;
}
// 셈이 아닌 물음의 답 — 게이트가 따로 들고 있는 표(출구·기본 문제)
const KNOW = {
  '두 면이 서로 평행하고 합동인 다각형으로 이루어진 입체도형을 무엇이라고 할까요?': '각기둥', '눈사람 모자의 두 밑면은 어떤 도형일까요?': '원',
  '서로 평행하고 합동인 두 원을 면으로 하는 입체도형을 무엇이라고 할까요?': '원기둥', '위쪽 원이 아래쪽 원보다 작은 통이 원기둥이 아닌 까닭은 무엇일까요?': '두 원이 합동이 아니에요',
  '원기둥에서 두 밑면과 만나는 굽은 면을 무엇이라고 할까요?': '옆면', '원기둥의 전개도에서 옆면의 세로는 원기둥의 무엇과 같을까요?': '높이',
  '두 원이 옆면의 같은 쪽에 붙은 그림이 원기둥의 전개도가 될 수 없는 까닭은 무엇일까요?': '접으면 두 원이 겹쳐요', '한 원을 면으로 하는 입체도형을 무엇이라고 할까요?': '원뿔',
  '서로 합동인 두 원이 있는 입체도형이 원뿔이 아닌 까닭은 무엇일까요?': '원뿔은 한 원만 면으로 해요', '원뿔의 꼭짓점과 밑면인 원의 둘레의 한 점을 이은 선분을 무엇이라고 할까요?': '모선',
  '원뿔의 모선과 높이 중 더 긴 것은 무엇일까요?': '모선', '원기둥, 원뿔, 구 가운데 어느 방향에서 보아도 모양이 같은 것은 무엇일까요?': '구',
  '「알지오매스 키즈」에서 도형을 원하는 위치로 옮기는 모드는 무엇일까요?': '이동 모드', '원뿔을 앞에서 본 삼각형의 넓이를 구할 때 쓰지 않는 길이는 무엇일까요?': '모선의 길이',
  '직사각형, 직각삼각형, 반원 가운데 한 바퀴 돌리면 구가 되는 것은 무엇일까요?': '반원', '원기둥의 밑면은 몇 개일까요?': '2', '원뿔의 밑면은 몇 개일까요?': '1', '구의 중심은 몇 개일까요?': '1',
  '원기둥의 전개도를 그릴 때 밑면은 모두 몇 개 그려야 할까요?': '2'
};
// 기본 문제 가운데 셈이 아닌 보기 문제 — 게이트가 아는 정답(앞 22자 → 정답 보기)
const KNOWB = [['눈사람 모자는 둥근 기둥 모양', '두 밑면이 다각형이 아니라 원이라서'], ['‘다’는 마주 보는 두 면이 모두 원', '마주 보는 두 원이 서로 합동이 아니라서'], ['원기둥에서 두 밑면과 만나는 굽은 면', '옆면'], ['두 밑면도 서로 합동이에요', '두 밑면이 옆면을 기준으로 마주 보는 위치에 있지 않아서'],
  ['전개도에서 빨간색으로 표시한 곳', '밑면의 둘레'], ['이 그림이 원기둥의 전개도가 될 수 없는', null], ['‘나’에도 원이 있어요', '서로 합동인 두 원이 있어서'], ['원뿔의 꼭짓점과 밑면인 원의 둘레의 한 점', '모선'],
  ['원뿔의 모선이 높이보다 긴 까닭', '모선은 둘레까지 비스듬히 가고 높이는 한가운데까지 곧게 가서'], ['구는 어떻게 만든 입체도형', '지름을 따라 반으로 나눈 원을 지름을 기준으로 한 바퀴 돌려서 만든 입체도형'],
  ['원기둥 · 원뿔 · 구 가운데 어느 방향', '구'], ['원하는 크기로 바꾸려면 어느 모드', '배율 모드'], ['바르게 설명한 것은 무엇', '구의 중심은 1개이고 구의 반지름은 무수히 많습니다']];
const NETBAD = { skew: '옆면이 직사각형이 아니어서', same: '접으면 두 원이 겹쳐서', diff: '두 원이 서로 합동이 아니어서' };

console.log('═══ A. 로드 ═══');
T('11차시 키 u6_l01~l11 · 파일 data/g6s2_math_u6.js', () => ok(SAME(Object.keys(L).sort(), KEYS), Object.keys(L).join(',')));
T('meta: 6학년 2학기 · 6단원 원기둥, 원뿔, 구 · [6수03-07]/[6수03-08] · live_url 실파일(l09 = 원문 없음, 지도서) · 40분 · 쪽', () => KEYS.forEach(k => { const m = L[k].meta; ok(m.grade === 6 && m.term === 2 && m.unit === 6 && m.subject === '수학' && m.unit_title === '원기둥, 원뿔, 구' && m.n === +k.slice(-2), k);
  ok(/6수03-0[78]/.test(m.std), k + ' std'); ok((['u6_l04', 'u6_l05'].includes(k) ? /6수03-08/ : /6수03-07/).test(m.std), k + ' 성취기준 갈래'); ok(m.duration_min === 40, k + ' 40분'); ok(/『수학』 \d+(~\d+)?쪽/.test(m.pages), k + ' 쪽');
  if (SK[k]) { ok(fs.existsSync(path.join(TDIR, m.live_url)) || (process.env.KEDU_REPO && fs.existsSync(path.join(process.env.KEDU_REPO, 'kedu/teacher', m.live_url))), k + ' live_url ' + m.live_url); ok(m.source.endsWith(SRC[SK[k]].file), k + ' source'); } else ok(!m.live_url && /지도서 374~375/.test(m.source), k + ' 원문 없음 표시'); }));
T('slug — KT2.slugOf({g:6,s:math,t:2}) = g6s2_math', () => ok(KT2.slugOf({ g: 6, s: 'math', t: '2' }) === 'g6s2_math', 'slug'));
T('그림 부품 sol6·rot6·net6·fvw6 등록 · 잘못된 인자는 던짐', () => {
  ['sol6', 'rot6', 'net6', 'fvw6'].forEach(p => ok(FIG.parts.indexOf(p) >= 0, p + ' 등록'));
  [{ k: 'sol6', kind: 'cone', show: ['모선'], dim: { r: '6', h: '8', l: '10' } }, { k: 'rot6', shape: 'rtri', stick: '5', out: '7' }, { k: 'net6', r: '4', h: '8' }, { k: 'fvw6', mode: 'views', kind: 'cyl' }].forEach(f => { const h = FIG.render(f); ok(h && h.length > 100 && !/NaN|undefined/.test(h), f.k); });
  let th = 0; [{ k: 'sol6', kind: 'cyl', show: ['모선'] }, { k: 'sol6', kind: 'sph', show: ['밑면'] }, { k: 'sol6', kind: 'cone', dim: { h: '10', l: '8' } }, { k: 'sol6', kind: 'cyl', dim: { r: '1', d: '2' } }, { k: 'rot6', shape: 'tri', stick: '1', out: '1' },
    { k: 'net6', r: '1', d: '2', h: '1' }, { k: 'net6', r: '1', h: '1', bad: 'x' }, { k: 'fvw6', cone: { r: '9', h: '12' }, cyl: { d: '10', h: '9' }, same: true }, { k: 'fvw6', mode: 'views', kind: 'box' }].forEach(f => { try { FIG.render(f); } catch (e) { th++; } }); ok(th === 9, '던짐 ' + th + '/9'); });

console.log('═══ B. 19장 골격 ═══');
KEYS.forEach(k => T(k + ' 19장 · 블록 차례 · 단계 · id', () => { const sl = L[k].slides; ok(sl.length === 19, sl.length); sl.forEach((s, i) => { ok(s.block === ORDER[i], s.id + ' ' + s.block + '≠' + ORDER[i]); ok(s.stage === STAGE[i], s.id + ' stage ' + s.stage); ok(s.id === 's' + String(i + 1).padStart(2, '0'), s.id); }); }));

console.log('═══ C. 7요소 (6학년 = 장면·물음) ═══');
KEYS.forEach(k => T(k + ' 7요소 · 인물 없음', () => { const sl = L[k].slides, has = f => sl.some(f);
  ok(has(s => s.block === 'review' && s.data.items.length >= 2), '①복습'); ok(has(s => s.data.img), '②실사'); ok(has(s => s.block === 'motivate' && s.data.desc && s.data.question && !s.data.kids), '③장면·물음');
  ok(has(s => s.block === 'offline_activity' && s.data.steps && s.data.steps.length && s.data.solo && s.data.solo.length >= 2), '④활동+1인'); ok(has(s => s.block === 'leveled_problem' && Object.keys(s.data.levels).length === 3), '⑤수준별');
  ok(has(s => s.block === 'exit_ticket' && s.data.items.length === 3), '⑥출구'); ok(sl.filter(s => s.data.tnote).length >= 6, '⑦발문 ' + sl.filter(s => s.data.tnote).length);
  ok(/^assets\/photo\/math\/[a-z_]+\.jpg$/.test(sl[2].data.img), '실사 자리 이름 ' + sl[2].data.img); }));
T('실사 자리 11종 서로 다름 · 5-2 수학·6-2 수학 다른 단원 2세대와 겹침 0', () => { const im = KEYS.map(k => L[k].slides[2].data.img); ok(new Set(im).size === 11, im.join(',')); const other = []; fs.readdirSync(path.join(TDIR, 'data')).filter(f => /^g5s2_math_u\d\.js$/.test(f) || /^g6s2_math_u[1-5]\.js$/.test(f)).forEach(f => Object.values(load(path.join(TDIR, 'data', f))).forEach(l => (l.slides || []).forEach(s => s.data && s.data.img && other.push(s.data.img)))); ok(!im.some(x => other.indexOf(x) >= 0), '다른 단원과 겹침'); });
T('활동 갈래 — 짝·모둠·개인이 섞임 · l09 운송 수단 = 모둠 15분(공학 도구)', () => { const ty = KEYS.map(k => L[k].slides[12].data.type); ok(new Set(ty).size >= 3, ty.join(',')); ok(L.u6_l09.slides[12].data.type === 'group' && L.u6_l09.slides[12].data.minutes === 15, 'l09'); });

console.log('═══ D. 복습 계보 ═══');
KEYS.forEach((k, i) => T(k + ' 복습 = ' + (i ? KEYS[i - 1] + ' 출구' : (L5 && L5.u5_l10 ? '5단원 u5_l10 출구' : '지도서 진단 평가 세 문항(5단원 데이터 없음)')), () => { const rv = L[k].slides[1].data;
  if (i) { ok(rv.from === KEYS[i - 1], 'from ' + rv.from); ok(SAME(rv.items.map(x => [x.q, x.a]), L[KEYS[i - 1]].slides[15].data.items.map(x => [x.q, x.a])), '출구 어긋남'); return; }
  ok(/지난 단원/.test(rv.title), 'l01 제목');
  if (L5 && L5.u5_l10) { ok(rv.from === 'g6s2_math:u5_l10', 'from'); ok(SAME(rv.items.map(x => [x.q, x.a]), L5.u5_l10.slides[15].data.items.map(x => [x.q, x.a])), '5단원 출구 어긋남'); }
  else { ok(!rv.from, 'from 없음'); ok(rv.items.length === 3, '세 문항'); ok(matchVal(rv.items[0].a, mul(I(6), PI)) && matchVal(rv.items[1].a, div(div(num('43.96'), PI), TWO)) && rv.items[2].a === '육각기둥', '진단 평가 답 다시 셈(지름 6 → 18.84 · 43.96 → 반지름 7 · 육각기둥)'); } }));

console.log('═══ E. 정답 다시 셈 ═══');
const unsolved = [];
const knowB = (q) => { const t = clean(q); const hit = KNOWB.find(([p]) => t.indexOf(p) >= 0); return hit; };
KEYS.forEach(k => { const sl = L[k].slides;
  sl.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data, got = d.options ? d.options.find(o => o.correct).text : String(d.answer), sv = solve(d.question);
    if (sv) { E1(k + ' ' + s.id, sv.r ? matchVal(got, sv.r) : got === sv.s, '기본 ' + got + ' ≠ ' + (sv.r ? dec(sv.r) : sv.s)); return; }
    const kb = knowB(d.question); if (!kb) { unsolved.push(k + ' ' + s.id + ' ' + clean(d.question).slice(0, 30)); E1(k + ' ' + s.id, false, '셈도 지식 표도 없음'); return; }
    if (kb[1] === null) { const f = d.fig; E1(k + ' ' + s.id, f && f.k === 'net6' && NETBAD[f.bad] === got, '전개도 결함 그림과 정답이 어긋남 ' + got); } else E1(k + ' ' + s.id, kb[1] === got, '지식 답 ' + got); unsolved.push(k + ' ' + s.id); });
  const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => { const x = lv[t], sv = solve(x.q); if (!sv) { E1(k + ' ' + t, false, '수준별 못 읽음 ' + x.q); return; } E1(k + ' ' + t, sv.r ? matchVal(x.a, sv.r) : x.a === sv.s, '수준별 ' + x.a); E1(k + ' ' + t + ' 풀이 끝', nsp(x.steps[x.steps.length - 1]).replace(/^=/, '') === nsp(x.a), '풀이 끝 ≠ 답'); });
  sl[15].data.items.forEach((x, j) => { const sv = solve(x.q); if (sv) E1(k + ' 출구' + j, sv.r ? matchVal(x.a, sv.r) : x.a === sv.s, '출구 ' + x.a); else { E1(k + ' 출구' + j, KNOW[clean(x.q)] !== undefined, '못 읽고 지식 표에도 없음: ' + x.q); E1(k + ' 출구' + j, KNOW[clean(x.q)] === x.a, '지식 답 ' + x.a); } });
});
// 넓히기 — 여러 단계라 게이트가 단계를 따로 셈
const ADV = { u6_l01: () => I(2 * 4 + (4 + 1)), u6_l02: () => sub(mul(I(9), TWO), mul(I(4), TWO)), u6_l03: () => add(I(3), I(12)), u6_l04: () => mul(add(mul(I(10), PI), I(8)), TWO),
  u6_l05: () => add(add(div(I(2), TWO), mul(I(2), PI)), I(3)), u6_l06: () => sub(mul(I(7), TWO), mul(I(5), TWO)), u6_l07: () => add(add(I(17), I(15)), mul(I(8), TWO)), u6_l08: () => add(mul(I(6), TWO), mul(I(4), TWO)),
  u6_l09: () => I(TR.원기둥.밑면 + TR.원뿔.밑면 + 2 * TR.구.밑면), u6_l10: () => div(div(mul(mul(I(6), TWO), I(8)), TWO), mul(I(4), TWO)), u6_l11: () => div(div(num('37.68'), PI), TWO) };
KEYS.forEach(k => { const d = L[k].slides[14].data, m = d.note.match(/\*\*([\d.]+)\*\*/); E1(k + ' 넓히기', m && matchVal(m[1], ADV[k]()), '넓히기 ' + (m && m[1])); });
T('기본·수준별·출구·넓히기 정답 = 게이트 셈·지식 표 (' + nCheck + ') 틀림 0', () => ok(!badE.length, badE.slice(0, 8).join(' | ')));
T('기본 문제 33 가운데 셈으로 다시 셈 ≥ 18 · 나머지는 게이트 지식 표(보기 문제)', () => ok(33 - unsolved.length >= 18, (33 - unsolved.length) + ' / ' + unsolved.join(' | ')));
T('다시 셈 수 ≥ 110', () => ok(nCheck >= 110, nCheck));
T('수준별 심화 = 열린 답 · 기본/도전 물음 서로 다름', () => KEYS.forEach(k => { const lv = L[k].slides[11].data.levels; ok(lv.심화.open, k); ok(lv.기본.q !== lv.도전.q, k); }));
T('게이트 셈 자체 확인 — 반지름 4 → 25.12 · 25.12 → 지름 8 · 앞모양 18 × 12 ÷ 2 = 108 · 9 cm 변 기준 → 지름 8 · 평평한 면 2 + 1 + 0', () => { ok(dec(solve('밑면의 반지름이 4 cm인 원기둥의 전개도에서 옆면의 가로는 몇 cm일까요?').r) === '25.12', 'A'); ok(dec(solve('원기둥의 전개도에서 옆면의 가로가 25.12 cm예요. 밑면의 지름은 몇 cm일까요?').r) === '8', 'B');
  ok(dec(solve('밑면의 지름이 18 cm, 높이가 12 cm인 원뿔을 앞에서 본 삼각형의 넓이는 몇 cm²일까요?').r) === '108', 'H'); ok(dec(solve('가로 9 cm, 세로 4 cm인 직사각형을 9 cm인 변을 기준으로 돌려 만든 원기둥의 밑면의 지름은 몇 cm일까요?').r) === '8', 'C');
  ok(dec(solve('원기둥 · 원뿔 · 구의 평평한 면의 수를 모두 더하면 몇 개일까요?').r) === '3', 'K'); ok(!matchVal('12.56', solve('밑면의 반지름이 4 cm인 원기둥의 전개도에서 옆면의 가로는 몇 cm일까요?').r), '반지름 × 3.14 를 잡아야 함'); });

console.log('═══ F. 식 전수 ═══');
const NUMR = '\\d+(?:\\.\\d+)?(?:\\/\\d+)?';
const CHAIN = new RegExp('(?<![\\d./×÷+−])(?<![÷×+−] )(\\(?\\s*' + NUMR + '(?:\\s*[÷×+−]\\s*\\(?\\s*' + NUMR + '\\s*\\)?)*(?:\\s*[÷×]\\s*' + NUMR + ')*)((?:\\s*=\\s*\\(?' + NUMR + '(?:\\s*[÷×+−]\\s*' + NUMR + '\\)?)*)+)(?![\\d/])(?!\\s*[×÷+−□])', 'g');
let nEq = 0; const badEq = [];
function evx(e) { e = e.trim(); if (e.split('(').length !== e.split(')').length) e = e.replace(/[()]/g, ''); const js = e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  const toks = js.match(/\d+(?:\.\d+)?|[()+\-*/]/g); if (!toks || toks.join('') !== js.replace(/\s+/g, '')) return null; let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function P() { const t = next(); if (t === '(') { const v = Ex(); next(); return v; } return num(t); }
  function Tm() { let v = P(); while (peek() === '*' || peek() === '/') { const o = next(), b = P(); v = o === '*' ? mul(v, b) : div(v, b); } return v; }
  function Ex() { let v = Tm(); while (peek() === '+' || peek() === '-') { const o = next(), b = Tm(); v = o === '+' ? add(v, b) : sub(v, b); } return v; }
  try { const v = Ex(); return i === toks.length ? v : null; } catch (er) { return null; } }
function eqText(t, where) { t = String(t).replace(/\*\*/g, ''); let m; CHAIN.lastIndex = 0; while ((m = CHAIN.exec(t))) { const parts = [m[1]].concat(m[2].split('=').slice(1)); const vals = parts.map(evx); if (vals.some(v => v === null)) continue; for (let j = 1; j < vals.length; j++) { nEq++; if (!eqR(vals[j], vals[0])) badEq.push(where + ' 「' + m[0].trim() + '」'); } } }
KEYS.forEach(k => L[k].slides.forEach(s => { const d = s.data; const txts = [];
  ['content', 'note', 'question', 'context', 'challenge', 'right', 'wrong', 'desc', 'preview'].forEach(f => d[f] && txts.push(d[f])); if (d.levels) Object.values(d.levels).forEach(l => { txts.push(l.q, l.a); (l.steps || []).forEach(x => txts.push(x)); });
  if (d.points) d.points.forEach(x => txts.push(x)); if (d.scenario) txts.push(d.scenario.body); if (d.items && s.block !== 'self_assessment') d.items.forEach(x => txts.push(x.q || x, x.a || '')); if (d.steps) d.steps.forEach(x => txts.push(x));
  txts.forEach(x => eqText(x, k + ' ' + s.id)); }));
KEYS.forEach(k => L[k].extras.forEach(e => eqText(e.content || e.description || '', k + ' ' + e.id)));
T('글 속 「… = …」 사슬 다시 셈 (' + nEq + ') 틀림 0 · ≥ 25', () => ok(!badEq.length && nEq >= 25, 'nEq ' + nEq + ' ' + badEq.slice(0, 6).join(' | ')));
T('식 검산기 자체 확인(틀린 식 잡음)', () => { const b0 = badEq.length; ['8 × 3.14 = 25.13', '18 × 12 ÷ 2 = 106', '(31.4 + 8) × 2 = 78.6', '25.12 ÷ 3.14 = 9'].forEach((t, i) => eqText(t, 'probe' + i)); ok(badEq.length === b0 + 4, '틀린 식 못 잡음 ' + (badEq.length - b0)); badEq.length = b0; });

console.log('═══ G. 그림 ═══');
const TRUTH_G = { cyl: [2, 0, 2], cone: [1, 1, 1], sph: [0, 0, 0], frus: [2, 0, 2], prism: [2, 0, 5], pyr: [1, 1, 5] };
const LABOK = { cyl: ['밑면', '옆면', '높이'], cone: ['밑면', '옆면', '원뿔의 꼭짓점', '모선', '높이'], sph: ['구의 중심', '구의 반지름'] };
const VIEW_G = { cyl: ['원', '직사각형', '직사각형'], cone: ['원', '삼각형', '삼각형'], sph: ['원', '원', '원'] };
const figs = []; const flat = (f, cb) => { if (f.k === 'panels') (f.items || []).forEach(p => flat(p.fig || p, cb)); else cb(f); };
KEYS.forEach(k => L[k].slides.forEach(s => { if (s.data.fig) flat(s.data.fig, f => figs.push([k + ' ' + s.id, f, s.block, s.data])); }));
const nG = {};
function vis(doc) { return [...doc.querySelectorAll('text')].map(x => x.textContent.trim()); }
function checkFig(where, f, block, d) {
  const h = FIG.render(f); ok(h && h.length > 80 && !/NaN|undefined/.test(h), where + ' 렌더'); nG[f.k] = (nG[f.k] || 0) + 1; const doc = docOf(h);
  if (f.k === 'sol6') { const v = doc.querySelector('[data-sol]').getAttribute('data-sol').split('|'); ok(v[0] === f.kind, where + ' kind'); ok(SAME(v.slice(1, 4).map(Number), TRUTH_G[f.kind]), where + ' 진리표 ' + v.slice(1, 4)); (f.show || []).forEach(x => ok((LABOK[f.kind] || []).indexOf(x) >= 0, where + ' 라벨 허용 밖 ' + x));
    if (f.kind === 'cone' && f.dim && f.dim.l && f.dim.h) ok(Number(f.dim.l) > Number(f.dim.h), where + ' 모선 > 높이');
    if (f.kind === 'cone' && f.dim && f.dim.h) { const hl = doc.querySelector('.s6-h'); ok(hl && hl.getAttribute('x1') === hl.getAttribute('x2'), where + ' 원뿔 높이는 수직선'); }
    if (f.ask) ok(vis(doc).some(t => /^(높이 |모선 )?\? cm$/.test(t)), where + ' ask 가 ? 로'); }
  if (f.k === 'rot6') { const v = doc.querySelector('[data-rot]').getAttribute('data-rot').split('|'); const want = { rect: 'cyl', rtri: 'cone', semi: 'sph' }[f.shape]; ok(v[1] === want, where + ' 돌리기 매핑 ' + v[1]);
    const out = f.shape === 'semi' ? num(f.r) : num(f.out); ok(eqR(num(v[4]), mul(out, TWO)), where + ' 지름 = 뻗은 변 × 2'); if (f.shape !== 'semi') ok(eqR(num(v[2]), num(f.stick)), where + ' 높이 = 붙인 변');
    const name = doc.querySelector('.r6-name').textContent; ok(f.ask === 'solid' ? name === '?' : name === { cyl: '원기둥', cone: '원뿔', sph: '구' }[want], where + ' 이름 ' + name); }
  if (f.k === 'net6') { const v = doc.querySelector('[data-net]').getAttribute('data-net').split('|'); const d0 = f.d != null ? num(f.d) : mul(num(f.r), TWO); ok(eqR(num(v[0]), d0), where + ' 지름'); ok(eqR(num(v[2]), mul(d0, PI)), where + ' 가로 = 지름 × 3.14 (' + v[2] + ')');
    ok(v[3] === '3.14', where + ' 픽셀 비 가로 ÷ 지름 = ' + v[3]); ok(Math.abs(Number(v[4]) - Number(f.h) / Number(dec(d0))) < 0.011, where + ' 세로 배율 ' + v[4]); ok(v[5] === (f.bad || ''), where + ' bad');
    const nb = doc.querySelectorAll('.n6-base').length; ok(nb === 2, where + ' 밑면 원 2개'); if (f.bad === 'diff') { const rs = [...doc.querySelectorAll('.n6-base')].map(c => +c.getAttribute('r')); ok(Math.abs(rs[0] - rs[1]) > 4, where + ' diff 인데 크기가 같아 보임'); }
    if (f.bad === 'same') { const ys = [...doc.querySelectorAll('.n6-base')].map(c => c.getAttribute('cy')); ok(ys[0] === ys[1], where + ' same 인데 같은 쪽이 아님'); } else { const ys = [...doc.querySelectorAll('.n6-base')].map(c => +c.getAttribute('cy')); ok(ys[0] !== ys[1], where + ' 마주 보지 않음'); }
    if (f.ask) ok(vis(doc).some(t => /\?/.test(t)), where + ' ask'); }
  if (f.k === 'fvw6') { const v = doc.querySelector('[data-fvw]').getAttribute('data-fvw').split('|');
    if (f.mode === 'views') ok(v[2] === ['위', '앞', '옆'].map((s, i) => s + ':' + VIEW_G[f.kind][i]).join(','), where + ' 본 모양 ' + v[2]);
    else { if (f.cone) { const b = f.cone.d != null ? num(f.cone.d) : mul(num(f.cone.r), TWO); ok(eqR(num(v[1]), b), where + ' 밑변 = 지름'); ok(eqR(num(v[3]), div(mul(b, num(f.cone.h)), TWO)), where + ' 삼각형 넓이'); }
      if (f.cyl) { ok(eqR(num(v[6]), mul(num(v[4]), num(v[5]))), where + ' 직사각형 넓이'); if (f.same) ok(eqR(num(v[6]), num(v[3])), where + ' 같은 넓이'); }
      if (f.ask) ok(vis(doc).some(t => /\?/.test(t)), where + ' ask'); } }
  if (block === 'basic_problem') { const ans = d.options ? d.options.find(o => o.correct).text : String(d.answer); const texts = vis(doc).map(t => t.replace(/^(가로|세로|밑변|높이|넓이|지름|모선) /, '').replace(/ ?(cm²|cm)$/, ''));
    if (!f.ask && !f.bad) ok(texts.indexOf(ans.replace(/ ?(cm²|cm)$/, '')) < 0, where + ' 문제 그림에 답 「' + ans + '」'); }
}
T('그림 ' + figs.length + '개 — 진리표·라벨 허용표 · 돌리기 매핑·지름 · 전개도 3.14·세로 배율·두 밑면 · 본 모양·넓이 · 답 가림', () => figs.forEach(([w0, f, b, d]) => checkFig(w0, f, b, d)));
T('개념 44장 모두 그림 · 기본 문제 그림 ≥ 20 · 그 가운데 ask/결함 그림 ≥ 9', () => { let c = 0, p = 0, a = 0; KEYS.forEach(k => L[k].slides.forEach(s => { if (s.block === 'concept') { ok(s.data.fig, k + ' ' + s.id); c++; } if (s.block === 'basic_problem' && s.data.fig) { p++; if (s.data.fig.ask || s.data.fig.bad) a++; } })); ok(c === 44 && p >= 20 && a >= 9, c + '/' + p + '/' + a); });
T('그림 부품 수 — sol6 ≥ 40 · rot6 ≥ 10 · net6 ≥ 12 · fvw6 ≥ 8 · bad 세 갈래 모두', () => { ok(nG.sol6 >= 40 && nG.rot6 >= 10 && nG.net6 >= 12 && nG.fvw6 >= 8, JSON.stringify(nG)); ['skew', 'same', 'diff'].forEach(b => ok(figs.some(([, f]) => f.bad === b), 'bad ' + b)); });
T('그림 검사기 자체 확인 — 거짓 진리표·거짓 매핑·가로를 지름으로 잡은 전개도는 잡음', () => { let c = 0;
  const fake = (f, patch) => { const orig = FIG.render; FIG.render = (x) => patch(orig(x)); try { checkFig('probe', f, 'concept', {}); } catch (e) { c++; } FIG.render = orig; };
  fake({ k: 'sol6', kind: 'cyl' }, h => h.replace('cyl|2|0|2', 'cyl|1|0|2')); fake({ k: 'rot6', shape: 'rtri', stick: '5', out: '7' }, h => h.replace('rtri|cone', 'rtri|cyl')); fake({ k: 'net6', r: '4', h: '8' }, h => h.replace('8|8|25.12', '8|8|8')); fake({ k: 'fvw6', mode: 'views', kind: 'cone' }, h => h.replace('앞:삼각형', '앞:원'));
  ok(c === 4, c + '/4'); });

console.log('═══ H. 재료 충실 ═══');
const nk = (s) => String(s).replace(/계산 결과가/g, '계산한 값이').replace(/결과가/g, '값이').replace(/결과는/g, '값은').replace(/결과를/g, '값을').replace(/문제를 해결해요/g, '문제를 풀어요').replace(/어떻게 해결했나/g, '어떻게 풀었나').replace(/해결/g, '풀이');
const normT = (t) => String(t).replace(/\*\*/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const numsOf = (t) => (normT(t).match(/\d+(?:\.\d+)?/g) || []).join(',');
KEYS.forEach(k => T(k + ' 개념 = 원문 장(또는 지도서 쪽 표시) · 기본 문제 = 원문(수·보기·정답) · 다음 시간 = 원문 다음', () => { const src = SK[k] ? SRC[SK[k]] : null;
  L[k].slides.filter(s => s.block === 'concept').forEach(s => { ok(!s.data.source_note, s.id + ' 근거 쪽은 장이 아니라 meta.concept_src 에'); const cs = (L[k].meta.concept_src || {})[s.id]; if (cs) { ok(/지도서|『수학』/.test(cs), s.id + ' 근거 쪽'); return; } ok(src && src.slides.some(x => normT(nk(x.text)) === normT(s.data.content) && nk(x.title) === s.data.title), s.id + ' 원문 아님'); });
  L[k].slides.filter(s => s.block === 'basic_problem').forEach(s => { const d = s.data; if (!src) { ok(/운송 수단/.test(d.question), s.id + ' l09 = 『수학』 136~137쪽 운송 수단'); return; }
    const ps = src.problems.filter(p => numsOf(p.q) === numsOf(d.question) && (p.opts ? !!d.options && SAME(p.opts.map(nk), d.options.map(o => o.text)) : !d.options && +p.a === d.answer)); ok(ps.length === 1, s.id + ' 원문 문제 ' + ps.length); if (ps[0].opts) ok(d.options[ps[0].ci].correct, s.id + ' 보기·정답'); });
  const nx = L[k].slides[18].data; if (src && !['u6_l08', 'u6_l10', 'u6_l11'].includes(k)) ok(nx.preview.indexOf(nk(src.next)) === 0, '다음 ' + nx.preview); }));
T('원문의 인물 문제(3차시 여울·순달·달곰·지호 · 7차시 민지·지석·서우·여울)·지어낸 수 장(원문 9차시 「다른 수로 한 번 해 봐요」 10·6·30) 안 씀', () => { ok(!L.u6_l03.slides.some(s => s.block === 'basic_problem' && /잘못 말한/.test(s.data.question)), 'l03'); ok(!L.u6_l07.slides.some(s => s.block === 'basic_problem' && /잘못 말한/.test(s.data.question)), 'l07'); ok(!L.u6_l10.slides.some(s => s.block === 'concept' && /다른 수로/.test(s.data.title)), 'l10 지어낸 수'); });
T('한 차시 안에서 같은 문제 중복 0', () => KEYS.forEach(k => { const sl = L[k].slides; const lv = sl[11].data.levels; const all = sl.filter(s => s.block === 'basic_problem').map(s => s.data.question).concat(sl[15].data.items.map(x => x.q), [lv.기본.q, lv.도전.q]).map(nsp); ok(new Set(all).size === all.length, k + ' 중복'); }));
T('교과서 수 — 차시마다 지도서 장면 수·말이 화면에 있음', () => { const NEED = { u6_l01: ['사각기둥', '사각뿔', '눈사람'], u6_l02: ['간식', '9 cm', '4 cm'], u6_l03: ['8 cm', '3 cm', '12 cm'], u6_l04: ['25.12', '18.84', '대나무 칫솔'], u6_l05: ['9.42', '6.28', '분리배출'],
  u6_l06: ['5 cm', '7 cm', '14'], u6_l07: ['모선', '17 cm', '15 cm'], u6_l08: ['축구공', '테니스공', '원통'], u6_l09: ['알지오매스 키즈', '원기둥 1개', '구 2개'], u6_l10: ['9 cm', '12 cm', '15 cm', '108', '48'], u6_l11: ['37.68', '6.28', '육각기둥'] };
  KEYS.forEach(k => { const all = JSON.stringify(L[k].slides); NEED[k].forEach(x => ok(all.indexOf(x) >= 0, k + ' ' + x)); }); });

console.log('═══ I. 실렌더 ═══');
KEYS.forEach(k => T(k + ' 19장 × 닫힘·열림 렌더 예외 0 · 빈 본문 0 · 1인 흐름 · 그림 섬', () => { const les = L[k]; les.slides.forEach(s => [false, true].forEach(rev => { const r = render(s, les, rev); ok(typeof r.body === 'string' && (r.cover || r.body.trim()), s.id + ' 빈 본문'); ok(!/undefined|NaN|\[object Object\]/.test(r.body), s.id + ' 글자 깨짐');
  if (s.block === 'concept' || (s.block === 'basic_problem' && s.data.fig)) ok(/class="fig/.test(r.body), s.id + ' 그림 안 섬'); if (s.block === 'offline_activity') ok(/class="solo"/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === s.data.solo.length - 1, s.id + ' 1인 흐름 줄'); })); }));

console.log('═══ J. extras ═══');
KEYS.forEach(k => T(k + ' extras 22 · id 유일 · 추천 연결 전부 존재', () => { const ex = L[k].extras; ok(ex.length === 22, ex.length); const ids = ex.map(e => e.id); ok(new Set(ids).size === 22, 'id 중복');
  L[k].slides.forEach(s => (s.suggested_extras || []).forEach(id => ok(ids.indexOf(id) >= 0, s.id + ' → ' + id))); ex.forEach(e => ok(e.title && (e.content || e.url), e.id + ' 내용')); }));

console.log('═══ K. 발문 · 물음 끝맺음 · 마지막 장 ═══');
T('발문(tnote) 차시마다 6장↑ · ask 2 · watch · min', () => KEYS.forEach(k => { const tn = L[k].slides.filter(s => s.data.tnote); ok(tn.length >= 6, k + ' ' + tn.length); tn.forEach(s => ok(s.data.tnote.ask.length === 2 && s.data.tnote.watch && s.data.tnote.min > 0, k + ' ' + s.id)); }));
T('발문 분 합계 30~45분', () => KEYS.forEach(k => { const m = L[k].slides.reduce((a, s) => a + (s.data.tnote ? s.data.tnote.min : 0), 0); ok(m >= 30 && m <= 45, k + ' ' + m + '분'); }));
T('학생이 읽는 물음 끝 = 「요?」(「~은?」「~까?」 0) · 물음 속 「~다.」 0', () => { const qs = []; KEYS.forEach(k => { const sl = L[k].slides; sl.filter(s => s.block === 'basic_problem').forEach(s => qs.push([k + ' ' + s.id, s.data.question])); const lv = sl[11].data.levels; ['기본', '도전'].forEach(t => qs.push([k + ' ' + t, lv[t].q])); sl[15].data.items.concat(sl[1].data.items).forEach(x => qs.push([k + ' 출구·복습', x.q])); qs.push([k + ' 동기', sl[2].data.question]); qs.push([k + ' 넓히기', sl[14].data.challenge]); });
  const badQ = qs.filter(([, q]) => { const t = clean(q); return !/요\?/.test(t) || /[^요]\?/.test(t) || /[가-힣]다\.(\s|$)/.test(t); }); ok(!badQ.length, badQ.map(x => x[0] + ' 「' + clean(x[1]).slice(-24) + '」').join(' | ')); });
T('마지막 차시 「다음 단원엔」 = 6학년 2학기 수학 끝 · 중학교 · 다른 차시는 「다음 시간엔」 · l08 → 운송 수단 · l09 → 찰칵 · l10 → 문제로 마무리', () => { const nx = L.u6_l11.slides[18].data; ok(nx.title === '다음 단원엔' && /6학년 2학기 수학/.test(nx.preview) && /중학교/.test(nx.preview), '마지막 장 ' + nx.preview);
  KEYS.slice(0, -1).forEach(k => ok(L[k].slides[18].data.title === '다음 시간엔', k)); ok(/운송 수단/.test(L.u6_l08.slides[18].data.preview) && /찰칵/.test(L.u6_l09.slides[18].data.preview) && /문제로 마무리/.test(L.u6_l10.slides[18].data.preview), '예고 계보'); });
T('교사 화면 영어 코드 0 — 제목·표지·글에 u6·l01·L02 같은 말 없음', () => KEYS.forEach(k => { const vis0 = JSON.stringify(L[k].slides.map(s => { const d = Object.assign({}, s.data); delete d.from; delete d.img; delete d.fig; return d; })) + JSON.stringify(L[k].meta.title); ok(!/\bu\d_l\d|\bL\d\d\b|\bl\d\d\b/.test(vis0), k); }));

console.log('═══ L. 선행 용어 ═══');
const teach = (k) => JSON.stringify(L[k].slides.filter(s => s.block !== 'next_lesson'));
const FIRST = [['전개도', 4], ['모선', 7], ['구의 중심', 8]];
T('처음 배우는 차시 전에는 그 말 0 (l01 단원 도입 · 다음 시간 예고 예외)', () => KEYS.forEach((k, i) => { if (!i) return; FIRST.forEach(([t, n]) => { if (i + 1 < n) ok(teach(k).indexOf(t) < 0, k + ' 선행 「' + t + '」'); }); }));
T('처음 배우는 차시에는 그 말 있음', () => FIRST.forEach(([t, n]) => ok(teach(KEYS[n - 1]).indexOf(t) >= 0, t + ' l0' + n)));

console.log('═══ M. 차단 어휘 · 「결」 · 인물 · 중학교 용어 ═══');
T('차단 어휘(박음·빵꾸·갈아엎·결로) 0 · 「결」 0 · 원문·교과서 인물(달곰·순달·여울·지호·민지·지석·서우·곰이·펭이) 0', () => { const all = JSON.stringify(L); ['박음', '빵꾸', '갈아엎', '결로', '결', '곰이', '펭이', '달곰', '순달', '여울', '지호', '민지', '지석', '서우'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('중학교 용어(회전체·직원기둥·빗원기둥·직원뿔·빗원뿔·대원·소원) 0 · 원뿔의 전개도 0 (지도서 343·344)', () => { const all = JSON.stringify(L); ['회전체', '직원기둥', '빗원기둥', '직원뿔', '빗원뿔', '대원', '소원', '원뿔의 전개도'].forEach(b => ok(all.indexOf(b) < 0, b)); });
T('렌더된 그림 속 「결」·중학교 용어 0', () => figs.forEach(([w0, f]) => { const h = FIG.render(f); ok(h.indexOf('결') < 0 && !/회전체/.test(h), w0); }));

console.log('\n게이트 g6s2 수학 u6: ' + pass + '/' + fail + ' (통과/실패)');
process.exitCode = fail ? 1 : 0;
