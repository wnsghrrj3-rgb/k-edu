/* ============================================================
   test-round111.mjs — R111 모델이 자동 줄바꿈을 안다
   ------------------------------------------------------------
   R110 이 정직하게 남긴 빚:
     「textH 는 개행만 세므로 자동 줄바꿈된 글자는 상자를 넘칠 수 있다.
      export 가 늘 만들던 그림이지만 지금까진 화면이 감췄다.」

   파고 보니 이건 화면 미관이 아니라 export 자신의 자기모순이었다.
   같은 파일 안에서 두 값이 갈라져 있었다:
     · frameOf   — 높이를 개행 문자 수로 잰다
     · layoutText — 실제로는 wrap 해서 더 많은 줄을 그린다
   그리고 그 frameOf 높이가 곧 overflow=clip|ellipsis 의 maxLines 이고
   autoresize 의 축소 기준이다. 즉 틀린 높이는 결과물에서 사라지는 글자다.

   갚는 방식 — 세는 자를 하나로:
     - MK_RENDER.textLines 가 줄수 정본 (layoutText 와 같은 list 접두 규약)
     - frameOf 가 그 정본을 쓴다 → export 내부 모순 소멸
     - MK_LIVE.textH 는 ar 옵트인으로 같은 정본을 빌려 쓴다.
       wrap 판정이 절대 크기와 무관하고 ar 하나에만 의존하기 때문에 가능하다
       (probe111 §① 다섯 해상도 대조 증명). 두 번째 wrap 구현은 만들지 않는다 —
       그러면 R110 이 방금 없앤 병(상자가 둘)이 그대로 재발한다.
     - boxPx 는 CW·CH 를 이미 받으므로 ar 을 스스로 안다 → 회전축·초점 프레임이
       별도 배선 없이 실제 줄 수를 따라간다.

   계약:
     ① MK_LIVE audit (R111 확장 포함)
     ② textLines — layoutText 가 그리는 줄 수와 정확히 같다 (export 내부 정합)
     ③ frameOf — 프레임이 실제로 그리는 줄을 담는다 (자기모순 소멸)
     ④ ar 옵트인 — ar 없으면 개행만 세던 종전 값 그대로 (무회귀)
     ⑤ ar 불변 — 같은 비율이면 어느 해상도든 같은 % 높이
     ⑥ boxPx 가 CW·CH 로 ar 을 스스로 안다 (별도 옵트인 없이 줄수 반영)
     ⑦ 비텍스트·h 있는 텍스트는 무변형
     ⑧ aabb — 받은 ar 이 줄수에도 전달된다 (외접 박스가 흐른 글을 담는다)
     ⑨ 화면 텍스트 상자가 흐른 줄만큼 선다 (height:textH% 가 wrap 반영)
     ⑩ 회전축 — 여러 줄로 흐른 텍스트의 transform-origin 이 새 중심을 가리킨다
     ⑪ 정본 부재 폴백 — MK_RENDER.textLines 가 없으면 개행 세던 길로 되돌아간다
     ⑫ 기존 씬 무회귀 — 실제 템플릿 전수에서 프레임 변화가 실측 범위 안이다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R111_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const L = w.MK_LIVE, R = w.MK_RENDER;
const AR = 16 / 9;
/* 좁은 상자 · 개행 없는 긴 글 — 반드시 흐른다 */
const LONG = { kind: 'text', x: 10, y: 10, w: 20, size: 4, text: '오늘 우리는 산과 염기의 성질을 배우고 리트머스 종이로 확인해 봅시다' };
const SHORT = { kind: 'text', x: 0, y: 0, w: 60, size: 4, text: 'a\nb' };

console.log('\n── ① MK_LIVE audit');
const a = L.liveAudit();
ok(a.ok, 'liveAudit 무위반' + (a.ok ? '' : ' → ' + a.violations.join(' / ')));

console.log('\n── ② textLines == layoutText 가 그리는 줄 (export 내부 정합)');
{
  let same = 0, tot = 0;
  const cases = [LONG, { ...LONG, list: 'bullet' }, { ...LONG, list: 'number' },
    { ...LONG, letterSpacing: 0.08 }, SHORT, { kind: 'text', w: 12, size: 5, text: 'supercalifragilisticexpialidocious' }];
  for (const el of cases) {
    const W = 1280, H = 720, sz = (el.size || 3) * H / 100, bw = (el.w || 10) * W / 100;
    const n = R.textLines(el, bw, sz);
    const T = R.layoutText({ ...el, sizePx: sz }, { x: 0, y: 0, w: bw, h: 1e6 }, () => {});
    tot++; if (n === T.lines.length) same++;
  }
  ok(same === tot, `${tot}종(접두·자간·개행·강제분할)에서 줄수 정본이 실제 그림과 일치 — ${same}/${tot}`);
}

console.log('\n── ③ frameOf 가 그리는 줄을 담는다 (자기모순 소멸)');
{
  const W = 1280, H = 720;
  const f = R.frameOf(LONG, W, H);
  const sz = LONG.size * H / 100;
  const T = R.layoutText({ ...LONG, sizePx: sz }, f, () => {});
  const drawn = T.lines.length * T.size * T.lineHeight;
  ok(T.lines.length > 1, `이 글은 실제로 여러 줄로 흐른다 (${T.lines.length}줄)`);
  ok(drawn <= f.h + T.size * 0.4, `프레임 h=${f.h.toFixed(1)} 가 그린 높이 ${drawn.toFixed(1)} 를 담는다`);
}

console.log('\n── ④ ar 옵트인 — 안 주면 종전 세계 그대로');
{
  const nl = String(LONG.text).split('\n').length;
  ok(L.lineCount(LONG, 0) === nl, 'lineCount(ar 없음) = 개행 수');
  ok(Math.abs(L.textH(LONG) - Math.max(4 * 1.5, 4 * 1.4 * nl)) < 1e-9, 'textH(ar 없음) = R110 이전 값');
  ok(Math.abs(L.textH(SHORT, AR) - 11.2) < 1e-9, '개행만 있는 짧은 글은 ar 을 줘도 종전 11.2%');
}

console.log('\n── ⑤ ar 불변 — 절대 크기가 결과를 못 바꾼다');
{
  const hs = [[1280, 720], [1920, 1080], [640, 360], [3840, 2160]].map(([W2, H2]) => L.boxPx(LONG, W2, H2).h / H2);
  ok(hs.every((x) => Math.abs(x - hs[0]) < 1e-9), `네 해상도에서 같은 % 높이 (${(hs[0] * 100).toFixed(2)}%)`);
  const px = R.frameOf(LONG, 1280, 720).h / 720, px2 = R.frameOf(LONG, 640, 360).h / 360;
  ok(Math.abs(px - px2) < 1e-3, 'frameOf 도 해상도 무관 (px 경로·% 경로 동형)');
}

console.log('\n── ⑥ boxPx 가 CW·CH 로 ar 을 스스로 안다');
{
  const bp = L.boxPx(LONG, 1600, 900);
  const flat = L.textH(LONG, 0) / 100 * 900;
  ok(bp.h > flat + 1e-9, `옵트인 없이도 흐른 줄만큼 높다 (${bp.h.toFixed(1)}px > 옛 ${flat.toFixed(1)}px)`);
  const pv = L.pivotPx(LONG, 1600, 900);
  ok(Math.abs(pv.y - (bp.y + bp.h / 2)) < 1e-9, 'pivotPx 가 그 새 상자의 중심');
}

console.log('\n── ⑦ 비텍스트·h 있는 텍스트는 무변형');
{
  const IMG = { kind: 'image', x: 5, y: 5, w: 10, h: 10 };
  ok(L.boxOf(IMG, AR).h === 10 && L.boxOf(IMG, 0).h === 10, '이미지 높이는 ar 과 무관');
  const FIXED = { ...LONG, h: 12 };
  ok(L.boxOf(FIXED, AR).h === 12, 'h 가 있는 텍스트는 모델 값을 그대로 쓴다');
  ok(Math.abs(R.frameOf(FIXED, 1280, 720).h - 12 * 720 / 100) < 0.01, 'frameOf 도 h 를 존중');
  ok(R.frameOf(IMG, 1280, 720).h === 10 * 720 / 100, 'frameOf 비텍스트 무변형');
}

console.log('\n── ⑧ aabb 가 받은 ar 을 줄수에도 쓴다');
{
  const rotated = { ...LONG, rot: 30 };
  const box = L.aabb(rotated, AR);
  const flatH = L.textH(LONG, 0);
  ok(box.h > flatH, `회전 외접 박스가 흐른 글을 담는다 (h=${box.h.toFixed(2)}% > 옛 ${flatH.toFixed(2)}%)`);
  const plain = L.aabb(LONG, AR);
  ok(Math.abs(plain.h - L.textH(LONG, AR)) < 1e-9, 'rot=0 에서도 ar 이 줄수에 전달된다');
}

console.log('\n── ⑨ 화면 텍스트 상자가 흐른 줄만큼 선다');
{
  const src = read('screens/workspace.js');
  const m = src.match(/const textBoxSty[\s\S]{0,400}?\};/);
  ok(!!m && /L\.textH\(el,\s*sar\(\)\)/.test(m[0]), 'textBoxSty 가 씬 종횡비를 넘긴다');
  ok(/const sar\s*=\s*\(\)\s*=>/.test(src), 'sar() 헬퍼가 씬에서 종횡비를 읽는다');
  ok(/overflow:visible/.test(m ? m[0] : ''), 'export 의 기본 overflow 규약(visible)은 유지');
}

console.log('\n── ⑩ 회전축이 새 중심을 가리킨다');
{
  const src = read('screens/workspace.js');
  const m = src.match(/const rotStyText[\s\S]{0,400}?\};/);
  ok(!!m && /L\.textH\(el,\s*sar\(\)\)/.test(m[0]), 'rotStyText 의 transform-origin 도 줄수를 안다');
  /* 화면 축(CSS)과 모델 축(pivotPx)이 같은 점을 가리키는가 */
  const CH = 900, CW = 1600;
  const cssOriginY = L.textH(LONG, CW / CH) / 100 * CH / 2;
  const modelPiv = L.pivotPx(LONG, CW, CH), modelTop = LONG.y / 100 * CH;
  ok(Math.abs(cssOriginY - (modelPiv.y - modelTop)) < 1e-9, 'CSS 회전축 == 모델 회전 불변점 (같은 점)');
}

console.log('\n── ⑪ 정본 부재 폴백');
{
  const keep = w.MK_RENDER;
  try {
    w.MK_RENDER = { };                       /* textLines 없는 세계 */
    ok(L.lineCount(LONG, AR) === 1, 'textLines 가 없으면 개행 세던 길로');
    ok(Math.abs(L.textH(LONG, AR) - 6) < 1e-9, 'textH 도 종전 값으로 되돌아간다');
    w.MK_RENDER = { textLines: () => { throw new Error('boom'); } };
    ok(L.lineCount(LONG, AR) === 1, '정본이 던져도 삼키고 옛 값을 준다');
  } finally { w.MK_RENDER = keep; }
}

console.log('\n── ⑫ 기존 씬 무회귀 — 실제 템플릿 전수');
{
  const scenes = [];
  try { (w.MK_TPL && w.MK_TPL.list ? w.MK_TPL.list() : []).forEach((t) => {
    const d = w.MK_TPL.build ? w.MK_TPL.build(t.id) : t;
    ((d && d.scenes) || []).forEach((sc) => scenes.push(sc));
  }); } catch (e) {}
  let tot = 0, moved = 0, shrank = 0;
  for (const sc of scenes) for (const el of (sc.elements || [])) {
    if (el.kind !== 'text' || el.h != null) continue;
    tot++;
    const W = 1280, H = 720, sz = (el.size || 3) * H / 100;
    const old = Math.max(sz * 1.5, sz * 1.4 * String(el.text || '').split('\n').length);
    const now = R.frameOf(el, W, H).h;
    if (Math.abs(now - old) > 0.5) { moved++; if (now < old - 0.5) shrank++; }
  }
  ok(tot > 100, `템플릿 텍스트 요소 ${tot}개 수집`);
  ok(shrank === 0, `프레임이 줄어든 요소 없음 (글자가 잘려나갈 방향의 변화 0)`);
  ok(moved <= Math.max(4, tot * 0.02), `프레임이 변한 요소 ${moved}개 — 실측 상한 안 (probe111 §②는 2개)`);
}

console.log(`\nR111: ${pass}/${pass + fail} ${fail ? 'FAIL' : 'PASS'}`);
process.exit(fail ? 1 : 0);
