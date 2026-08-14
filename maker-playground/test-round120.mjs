/* ============================================================
   test-round120.mjs — R120 실브라우저 자가 진단 (#/selfcheck)
   ------------------------------------------------------------
   R120 은 「검사하는 물건」을 만든다. 그래서 이 하니스의 표적은 둘이다.

   ① 검사기가 제품을 안 망가뜨리는가 (jsdom 안전 계약)
      R11~R15 다섯 스위트가 등록된 **모든 화면**을 jsdom 에서 render+mount
      한다. 진단 화면이 거기서 탐침을 돌리거나 예외를 던지면 다섯 스위트가
      한꺼번에 무너진다. supported() 게이트가 그 방벽이며, 여기서 못 박는다.

   ② 검사기 자신이 옳은가 (순수 켤레 항등)
      브라우저 탐침은 jsdom 에서 돌릴 수 없다 — 그래서 「초록불이 떴다」를
      이 하니스가 확인할 길은 없다. 대신 **탐침이 판정 근거로 쓰는 수학**을
      전량 검사한다. cssNet == canvasNet(P=R(θ,C)·Fs) 이 틀리면 실기기의
      초록불도 빨간불도 아무 뜻이 없다. 반례(옛 중앙 피벗)가 실제로 걸리는
      것까지 확인해 「무엇이든 통과시키는 검사기」가 아님을 증명한다.

   ③ 명세가 정직한가
      R118 은 test-round118 이 21/21 로 덮는 순수 계층이다. 그걸 기계 검사
      목록에 넣으면 「브라우저에서 더 검사했다」는 착시가 생긴다 — 그래서
      R118 은 눈 확인으로만 있어야 하고, 그 분리를 기계로 고정한다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R120_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/selfcheck', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};
const sec = (n) => console.log('\n[' + n + ']');

const E = w.MK_SELFCHECK, F = w.MK_FOCAL, SCR = w.MK_SCREENS;
const near = (A, B, tol = 1e-9) => A && B && A.every((v, i) => Math.abs(v - B[i]) <= tol);

/* ================================================================
   ⑴ jsdom 안전 계약 — R11~R15 가 전 화면을 render+mount 한다
   ================================================================ */
sec('1. jsdom 안전 계약 (R11~R15 전 화면 순회 보호)');

T('진단 엔진·화면 등재', () => (E && SCR && SCR.selfcheck) ? true : 'MK_SELFCHECK 또는 MK_SCREENS.selfcheck 부재');

T('화면 계약 — title·variants·render·mount', () => {
  const s = SCR.selfcheck;
  return (typeof s.render === 'function' && typeof s.mount === 'function'
    && Array.isArray(s.variants) && s.variants.length >= 1 && typeof s.title === 'string') || '계약 위반';
});

T('supported() 가 jsdom 을 막는다 (indexedDB 부재)', () => {
  const r = E.supported(w);
  return (r.ok === false && typeof r.why === 'string' && r.why.length > 0) || ('게이트 미작동: ' + JSON.stringify(r));
});

T('render() 예외 0 · 문자열 반환', () => {
  const s = SCR.selfcheck;
  for (const v of s.variants) {
    const h = s.render(v);
    if (typeof h !== 'string' || !h.length) return 'render 산출 이상: ' + typeof h;
  }
  return true;
});

T('mount() 예외 0 (R11~R15 가 실제로 하는 그 호출)', () => {
  const s = SCR.selfcheck, body = w.document.getElementById('pgBody');
  body.innerHTML = s.render(s.variants[0]);
  s.mount(body);                       /* 던지면 이 자리에서 실패 */
  return true;
});

T('mount 해도 탐침이 안 돈다 — 결과 비어 있음', () => {
  const st = w.PG.state.selfcheck;
  if (!st) return true;                /* 상태를 아예 안 만들었으면 더 안전 */
  return (!st.results || st.results.length === 0) || ('jsdom 에서 탐침이 돌았다: ' + st.results.length + '건');
});

T('전 화면 순회 재현 — selfcheck 포함 전량 render+mount 무예외', () => {
  const body = w.document.getElementById('pgBody');
  for (const k of Object.keys(SCR)) {
    const s = SCR[k];
    try {
      for (const v of (s.variants || [undefined])) { body.innerHTML = s.render(v); if (s.mount) s.mount(body); }
    } catch (e) { return '화면 ' + k + ' 에서 예외: ' + e.message; }
  }
  return true;
});

/* ================================================================
   ⑵ 순수 행렬 대수 — 탐침의 판정 근거
   ================================================================ */
sec('2. 순수 행렬 대수');

T('단위·곱 계약 (A∘B = B 먼저, A 나중)', () => {
  if (!near(E.mul(E.I(), E.I()), E.I())) return '단위 곱 위반';
  const t = E.mul(E.T(5, 7), E.scaleM(2));         /* 점 (1,1) → scale → (2,2) → translate → (7,9) */
  const x = t[0] * 1 + t[2] * 1 + t[4], y = t[1] * 1 + t[3] * 1 + t[5];
  return (Math.abs(x - 7) < 1e-9 && Math.abs(y - 9) < 1e-9) || `합성 순서 위반 (${x},${y})`;
});

T('rotM 90° — (1,0) → (0,1) (시계·y 아래 규약)', () => {
  const m = E.rotM(90);
  return (Math.abs(m[0]) < 1e-9 && Math.abs(m[1] - 1) < 1e-9) || `부호 규약 위반 [${m}]`;
});

T('about — 축 점은 불변점이다', () => {
  for (const [deg, ox, oy] of [[90, 10, 0], [37, -4, 9], [180, 3.5, 2.5]]) {
    const m = E.about(E.rotM(deg), ox, oy);
    const x = m[0] * ox + m[2] * oy + m[4], y = m[1] * ox + m[3] * oy + m[5];
    if (Math.abs(x - ox) > 1e-9 || Math.abs(y - oy) > 1e-9) return `축 (${ox},${oy}) 이 움직임`;
  }
  return true;
});

T('about — scale 도 축을 고정한다', () => {
  const m = E.about(E.scaleM(2.5), 30, 40);
  const x = m[0] * 30 + m[2] * 40 + m[4], y = m[1] * 30 + m[3] * 40 + m[5];
  return (Math.abs(x - 30) < 1e-9 && Math.abs(y - 40) < 1e-9) || 'scale 축 이동';
});

T('parseMatrix — 2d·none·미해결', () => {
  if (!near(E.parseMatrix('matrix(1, 0, 0, 1, 5, 6)'), [1, 0, 0, 1, 5, 6])) return '2d 파싱 위반';
  if (!near(E.parseMatrix('none'), E.I())) return 'none 위반';
  if (E.parseMatrix('rotate(20deg)') !== null) return '미해결 문자열을 통과시킴';
  if (E.parseMatrix('matrix(1,0,0,1,5)') !== null) return '인자 수 미검증';
  return true;
});

T('parseMatrix — matrix3d 의 2d 부분·z 성분 거부', () => {
  const flat = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 12,34,0,1)';
  if (!near(E.parseMatrix(flat), [1, 0, 0, 1, 12, 34])) return '평면 3d 파싱 위반';
  const zed = 'matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,55,1)';
  if (E.parseMatrix(zed) !== null) return 'z 이동이 있는 행렬을 2d 로 읽음';
  return true;
});

T('parseOrigin — px 두 값·빈값 거부', () => {
  const o = E.parseOrigin('12.5px 30px');
  if (!o || o[0] !== 12.5 || o[1] !== 30) return 'px 파싱 위반';
  if (E.parseOrigin('') !== null || E.parseOrigin('12px') !== null) return '불완전 입력을 통과시킴';
  return true;
});

/* ================================================================
   ⑶ 켤레 항등 — 이 라운드 판정의 심장
   ================================================================ */
sec('3. 켤레 항등 cssNet == canvasNet (P = R(θ,C)·Fs)');

const COMBOS = [];
for (const deg of [24, 90, -37, 200, 7, 179]) {
  for (const sc of [1.05, 1.18, 1.5, 2]) {
    for (const [fx, fy] of [[0.28, 0.82], [0.3, 1], [0, 0.25], [0.9, 0.1]]) COMBOS.push([deg, sc, fx, fy]);
  }
}

T(`전 조합 동치 (${COMBOS.length}조합 · 각 6성분)`, () => {
  const ew = 320, eh = 216, cx = ew / 2, cy = eh / 2;
  for (const [deg, sc, fx, fy] of COMBOS) {
    const pv = F.rotPivot({ rot: deg, focal: { x: fx, y: fy } }, 0, 0, ew, eh);
    if (!pv) return `rotPivot null (${deg}°, ${fx}/${fy})`;
    const A = E.cssNet(deg, cx, cy, sc, ew * fx, eh * fy);
    const B = E.canvasNet(deg, cx, cy, sc, pv.px, pv.py);
    if (!near(A, B, 1e-9)) return `불일치 ${deg}° s${sc} f${fx}/${fy} → 오차 ${E.maxDiff(A, B).toExponential(2)}`;
  }
  return true;
});

T('요소 원점이 (0,0) 이 아니어도 성립 (로컬 좌표 환산)', () => {
  const ex = 64, ey = 72, ew = 320, eh = 216, cx = ew / 2, cy = eh / 2;
  for (const [deg, sc, fx, fy] of [[24, 1.18, 0.28, 0.82], [-51, 1.7, 0.1, 0.9]]) {
    const pv = F.rotPivot({ rot: deg, focal: { x: fx, y: fy } }, ex, ey, ew, eh);
    const A = E.cssNet(deg, cx, cy, sc, ew * fx, eh * fy);
    const B = E.canvasNet(deg, cx, cy, sc, pv.px - ex, pv.py - ey);   /* 탐침이 하는 그 환산 */
    if (!near(A, B, 1e-9)) return `불일치 ${deg}° 오차 ${E.maxDiff(A, B).toExponential(2)}`;
  }
  return true;
});

T('반례 — 옛 중앙 피벗은 반드시 걸린다 (무엇이든 통과시키지 않음)', () => {
  const ew = 320, eh = 216, cx = ew / 2, cy = eh / 2;
  let caught = 0, tried = 0;
  for (const [deg, sc, fx, fy] of COMBOS) {
    if (fx === 0.5 && fy === 0.5) continue;
    tried++;
    const A = E.cssNet(deg, cx, cy, sc, ew * fx, eh * fy);
    const bad = E.canvasNet(deg, cx, cy, sc, cx, cy);     /* 옛 세계: 중앙 피벗 */
    if (!E.near(A, bad, 1e-6)) caught++;
  }
  /* deg 가 360 배수이거나 scale 1 이면 둘이 같아질 수 있으나 이 표본엔 없다 */
  return caught === tried || `${tried}건 중 ${caught}건만 검출 — 검사기가 옛 세계를 통과시킴`;
});

T('near/maxDiff — 허용오차 밖은 거른다', () => {
  const A = [1, 0, 0, 1, 0, 0], B = [1, 0, 0, 1, 0, 0.05];
  if (E.near(A, B, 1e-3)) return '오차 0.05 를 1e-3 허용에서 통과시킴';
  if (!E.near(A, B, 0.1)) return '오차 0.05 를 0.1 허용에서 거부';
  if (Math.abs(E.maxDiff(A, B) - 0.05) > 1e-9) return 'maxDiff 산출 위반';
  if (E.near(null, B) || E.maxDiff(null, B) !== Infinity) return 'null 방어 위반';
  return true;
});

/* ================================================================
   ⑷ 명세 정직성 — 무엇을 기계로 재고 무엇을 눈에 맡기는가
   ================================================================ */
sec('4. 명세 정직성');

T('CHECKS — 필드 전량·id 유일', () => {
  if (!Array.isArray(E.CHECKS) || !E.CHECKS.length) return 'CHECKS 부재';
  if (!E.CHECKS.every((c) => c.id && c.round && c.title && c.proves && c.blind)) return '필드 누락';
  if (new Set(E.CHECKS.map((c) => c.id)).size !== E.CHECKS.length) return 'id 중복';
  return true;
});

T('★ R118 은 기계 검사에 없다 (test-round118 이 21/21 로 덮는 순수 계층)', () => {
  const has = E.CHECKS.some((c) => c.round === 'R118');
  return !has || 'R118 이 기계 검사에 섞임 — 브라우저에서 더 검사했다는 착시';
});

T('R118 은 눈 확인 목록에 있다 (덮이지 않고 자리를 옮겼을 뿐)', () => {
  return (Array.isArray(E.EYES) && E.EYES.some((e) => e.round === 'R118')) || 'R118 이 어디에도 없음 — 누락';
});

T('기계 검사는 R116·R117·R119 만', () => {
  const rs = [...new Set(E.CHECKS.map((c) => c.round))].sort();
  return JSON.stringify(rs) === JSON.stringify(['R116', 'R117', 'R119']) || ('예상 밖 라운드: ' + rs.join(','));
});

T('네 라운드 전부가 어딘가에서 다뤄진다 (기계 ∪ 눈)', () => {
  const cov = new Set([...E.CHECKS.map((c) => c.round), ...E.EYES.map((e) => e.round)]);
  for (const r of ['R116', 'R117', 'R118', 'R119']) if (!cov.has(r)) return r + ' 미포함';
  return true;
});

T('EYES — 필드 전량', () => (E.EYES.every((e) => e.round && e.title && e.how)) || '필드 누락');

/* ================================================================
   ⑸ 판정 집계 — 건너뜀은 합격이 아니다
   ================================================================ */
sec('5. 판정 집계');

T('전량 합격만 ok', () => (E.verdict([{ state: 'pass' }, { state: 'pass' }]).ok === true) || '합격 판정 위반');
T('skip 이 섞이면 ok 아님 (미확정을 초록으로 부르지 않는다)', () => (E.verdict([{ state: 'pass' }, { state: 'skip' }]).ok === false) || 'skip 을 합격으로 셈');
T('fail 이 섞이면 ok 아님', () => (E.verdict([{ state: 'pass' }, { state: 'fail' }]).ok === false) || 'fail 을 합격으로 셈');
T('빈 결과는 ok 아님 (안 돌린 것을 통과라 하지 않는다)', () => (E.verdict([]).ok === false) || '빈 결과를 합격으로 셈');
T('집계 수치·라벨', () => {
  const v = E.verdict([{ state: 'pass' }, { state: 'fail' }, { state: 'skip' }]);
  return (v.pass === 1 && v.fail === 1 && v.skip === 1 && v.total === 3 && /불합격/.test(v.label)) || JSON.stringify(v);
});
T('알 수 없는 state 는 불합격으로 센다 (관대하지 않다)', () => (E.verdict([{ state: 'weird' }]).fail === 1) || '미지 상태를 합격 취급');

/* ================================================================
   ⑹ 엔진 자가 검증 + 회귀
   ================================================================ */
sec('6. 자가 검증 · 회귀');

T('MK_SELFCHECK.audit 무위반', () => { const a = E.audit(); return a.ok || a.violations.join(' / '); });
T('MK_FOCAL.audit 무위반 (R117·R119 계약 무손상)', () => { const a = F.audit(); return a.ok || a.violations.join(' / '); });
T('MK_PLAY.playAudit 무위반', () => { const a = w.MK_PLAY.playAudit(); return a.ok || a.violations.join(' / '); });
T('R119 방출 회귀 — 회전+초점+비pan 은 여전히 중첩', () => {
  const h = w.MK_PLAY.sceneHTML({ duration: 4, width: 1280, height: 720, elements: [
    { kind: 'image', src: 'data:image/png;base64,K', x: 10, y: 10, w: 50, h: 50, rot: 20, focal: { x: 0.3, y: 0.8 }, anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 } }] });
  return /mkp-inner/.test(h) || '중첩 방출 소실 — R119 회귀';
});
T('R119 방출 회귀 — 회전+pan 은 여전히 단일', () => {
  const h = w.MK_PLAY.sceneHTML({ duration: 4, width: 1280, height: 720, elements: [
    { kind: 'image', src: 'data:image/png;base64,K', x: 10, y: 10, w: 50, h: 50, rot: 20, focal: { x: 0.3, y: 0.8 }, anim: { preset: 'fade', idle: 'kb-pan-left', idleDur: 4 } }] });
  return !/mkp-inner/.test(h) || 'pan 인데 중첩 — R119 제외 계약 위반';
});

/* ================================================================
   ⑺ 배선 · 제품 격리
   ================================================================ */
sec('7. 배선 · 제품 격리');

T('index.html 에 엔진·화면 배선', () => {
  const h = read('index.html');
  return (/data\/selfcheck\.js\?v=/.test(h) && /screens\/selfcheck\.js\?v=/.test(h)) || '배선 누락';
});

T('버스터 균일 (신규 2건 포함)', () => {
  const h = read('index.html');
  const vs = [...new Set([...h.matchAll(/\?v=([0-9a-z]+)/g)].map((m) => m[1]))];
  return vs.length === 1 || ('버스터 불균일: ' + vs.join(','));
});

T('★ 제품 격리 — PRODUCT_ROUTES 에 selfcheck 없음 (/maker 에 안 샌다)', () => {
  const a = read('app.js');
  const m = /const PRODUCT_ROUTES\s*=\s*([^;]+);/.exec(a);
  if (!m) return 'PRODUCT_ROUTES 선언을 못 찾음';
  return !/selfcheck/.test(m[1]) || '진단 화면이 제품 라우팅에 등재됨';
});

T('내비에 없음 (검수 전용 — R31 homex·R32 nav 규약)', () => {
  const a = read('app.js');
  const m = /const NAV\s*=\s*\[([\s\S]*?)\n\s*\];/.exec(a);
  if (!m) return 'NAV 선언을 못 찾음';
  return !/selfcheck/.test(m[1]) || '진단 화면이 내비에 등재됨';
});

T('CSS 실존 (.sc-row 판정 색이 있어야 결과가 읽힌다)', () => {
  const c = read('playground.css');
  return (/\.sc-row/.test(c) && /\.sc-pass/.test(c) && /\.sc-fail/.test(c) && /\.sc-skip/.test(c)) || 'selfcheck 스타일 누락';
});

/* ================================================================
   ⑻ 비동기 게이트 실측
   ================================================================ */
const finish = async () => {
  if (E && typeof E.settle === 'function' && asyncT.length) {
    console.log('\n[9. settle 정직성 — 실측]');
    for (const [name, fn] of asyncT) {
      try { const r = await fn(); if (r === true) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
      catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
    }
  } else if (asyncT.length) {
    asyncT.forEach(([name]) => { fail++; console.log('  ✗ ' + name + '  → MK_SELFCHECK.settle 부재'); });
  }
  console.log('\n' + '='.repeat(56));
  console.log(`R120 결과: ${pass}/${pass + fail}`);
  console.log('='.repeat(56));
  process.exit(fail ? 1 : 0);
};

/* ================================================================
   ⑼ settle 정직성 — 느린 기기를 불합격으로 부르지 않는다
   ------------------------------------------------------------
   MK_STORE.setItem → idbPut 은 pending 을 **동기로** 올리므로 whenIdle 은
   쓰기가 착지한 뒤에 발화한다. 여기에 짧은 타임아웃을 경주시키면 저사양
   기기에서 6MB 쓰기가 아직 날고 있는데 먼저 읽어 거짓 불합격이 뜬다 —
   하필 이 진단이 가장 필요한 그 기기에서. 타임아웃은 판정이 아니라
   먹통 방지 밧줄이어야 하고, 밧줄로 나온 사실은 호출부에 전해져야 한다.
   ================================================================ */
const fakeWin = (whenIdle) => ({ MK_STORE: whenIdle ? { whenIdle } : {} });

const asyncT = [];
asyncT.push(['whenIdle 발화 = true (쓰기 착지 확인)', () =>
  E.settle(fakeWin((cb) => setTimeout(cb, 10)), 5000).then((v) => v === true || `반환 ${v}`)]);

asyncT.push(['★ whenIdle 이 늦어도 밧줄 전엔 기다린다 (짧은 경주 금지)', () =>
  E.settle(fakeWin((cb) => setTimeout(cb, 900)), 5000).then((v) => v === true || '900ms 쓰기를 못 기다림 — 저사양에서 거짓 불합격')]);

asyncT.push(['먹통이면 false (불합격이 아니라 미확정 신호)', () =>
  E.settle(fakeWin(() => {}), 120).then((v) => v === false || `반환 ${v}`)]);

asyncT.push(['whenIdle 없는 구버전도 죽지 않는다', () =>
  E.settle(fakeWin(null), 5000).then((v) => v === true || `반환 ${v}`)]);

asyncT.push(['whenIdle 이 던져도 결과를 돌려준다', () =>
  E.settle(fakeWin(() => { throw new Error('boom'); }), 5000).then((v) => v === true || `반환 ${v}`)]);

sec('8. run() 게이트 실측');
/* 역검증(엔진 부재)에서 최상위 예외로 죽으면 「몇 건이 왜 실패했나」를 못 읽는다.
   R75 의 「거짓 역검증」 교훈 — 사망을 실패로 읽지 않도록 여기서 정직하게 센다. */
if (!E || typeof E.run !== 'function') {
  T('run() 이 jsdom 에서 탐침 0 · skipped 사유 반환', () => 'MK_SELFCHECK.run 부재');
  T('run() 이 문서를 어지르지 않는다 (탐침 무대 잔존 0)', () => 'MK_SELFCHECK.run 부재');
  finish();
} else E.run(w).then((out) => {
  T('run() 이 jsdom 에서 탐침 0 · skipped 사유 반환', () =>
    (Array.isArray(out.results) && out.results.length === 0 && typeof out.skipped === 'string' && out.skipped.length > 0)
    || `게이트 통과됨: ${JSON.stringify(out).slice(0, 160)}`);
  T('run() 이 문서를 어지르지 않는다 (탐침 무대 잔존 0)', () =>
    w.document.querySelectorAll('[data-sc-stage]').length === 0 || '무대 노드 잔존');
  finish();
}).catch((e) => {
  T('run() 예외 0', () => 'run 이 던졌다: ' + e.message);
  finish();
});
