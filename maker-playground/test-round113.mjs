/* ============================================================
   test-round113.mjs — R113 화면이 export 에게 배치를 묻는다,
                       썸네일까지 남김없이
   ------------------------------------------------------------
   R112 가 이 일을 했으나 커밋이 원격에 닿지 못하고 유실됐다(origin 에
   c097759 없음, 버스터 v=20260811h 그대로). R113 은 그 작업을 다시
   세우고, R112 가 정직 보고로 남겨둔 빚 하나를 같이 갚는다:
     「editor 하단 씬 스트립 썸네일은 옛 통짜 경로 그대로 뒀다(표시 전용).」

   문제의 실체 — 화면엔 오버플로 정책이 아예 없었다:
     · ellipsis|clip — export 는 잘라 그리는데 화면은 다 보여줬다
     · autoresize    — export 는 줄여 그리는데 화면은 원크기로 그렸다
     · list          — export 는 '· ' 접두를 그리는데 화면엔 없었다
   화면은 export 배치를 근사하고 있던 게 아니라 배치를 안 하고 있었다.
   문자열을 통째로 div 에 넣고 브라우저에 맡겼으니까.

   갚는 방식 — 두 번째 배치 엔진이 아니라 창구 하나:
     MK_RENDER.layoutOf(el, W, H) 가 renderScene 이 텍스트에 하는 일
     (frameOf → sizePx → layoutText)을 그대로 밟아 결과만 돌려준다.
     새 계산이 없으니 화면은 export 를 흉내내는 게 아니라 export 에게 묻는다.

   계약:
     ① 창구 존재·형태 — layoutOf 가 공개 API 다
     ② 창구 == export — renderScene 이 실제로 내보내는 text op 과 한 글자도 다르지 않다
     ③ 좌표계 — 씬 자신의 px 공간이라 autoresize 절대 하한(6px)까지 같다
     ④ 오버플로 정책 3종이 창구를 통과한다 (clip·ellipsis·autoresize)
     ⑤ list 접두가 창구를 통과한다
     ⑥ 무캐시 — 자간만 바꿔도 결과가 따라온다 (renderScene 캐시 키의 함정 회피)
     ⑦ workspace 화면 — 줄·pre·autoresize·접두가 DOM 에 있다
     ⑧ editor 캔버스 — 같은 계약
     ⑨ 미니(스트립·타임라인·Brand Preview) — 같은 계약  ← R112 의 빚
     ⑩ 편집 진입 원문 복원 — 그린 줄이 el.text 에 굳지 않는다
     ⑪ 폴백 — 창구가 없으면 종전 통짜 경로로 조용히 되돌아간다
     ⑫ 템플릿 전수 — 창구와 export 불일치 0
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R113_ROOT || path.resolve('.');
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
const sec = (title, fn) => { console.log('\n' + title); try { fn(); } catch (e) { fail++; console.log('  ✗ 구간 중단: ' + e.message); } };
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };
const R = w.MK_RENDER;

/* 씬 규약은 export 와 같은 px 공간 */
const SC = (els) => ({ id: 's1', name: '검사', width: 1280, height: 720, duration: 5, background: '#FFFFFF', elements: els });
const LONG = '오늘 우리는 산과 염기의 성질을 배우고 리트머스 종이로 확인해 봅시다';
const T_PLAIN = { kind: 'text', x: 8, y: 10, w: 24, size: 4, text: LONG };
const T_CLIP = { ...T_PLAIN, h: 8, overflow: 'clip' };
const T_ELL = { ...T_PLAIN, h: 8, overflow: 'ellipsis' };
const T_AUTO = { ...T_PLAIN, h: 8, overflow: 'autoresize' };
const T_BUL = { ...T_PLAIN, list: 'bullet', text: '첫째 줄\n둘째 줄' };
const T_NUM = { ...T_PLAIN, list: 'number', text: '첫째 줄\n둘째 줄' };

sec('── ① 창구 존재·형태', () => {
  ok(typeof R.layoutOf === 'function', 'MK_RENDER.layoutOf 가 공개 API 다');
  const T = R.layoutOf(T_PLAIN, 1280, 720);
  ok(!!T && Array.isArray(T.lines) && T.lines.length > 0, `줄 배열을 돌려준다 (${T.lines.length}줄)`);
  ok(T.frame && typeof T.size === 'number' && typeof T.lineHeight === 'number', 'frame·size·lineHeight 동반');
  ok(R.layoutOf({ kind: 'image', w: 10, h: 10 }, 1280, 720) === null, '비텍스트는 null (호출부가 옛길로 간다)');
});

sec('── ② 창구 == export 가 실제로 내보내는 것', () => {
  let same = 0, tot = 0, worst = null;
  for (const el of [T_PLAIN, T_CLIP, T_ELL, T_AUTO, T_BUL, T_NUM,
    { ...T_PLAIN, letterSpacing: 0.08 }, { ...T_PLAIN, align: 'center' }, { ...T_PLAIN, w: 60 }]) {
    const sc = SC([el]);
    const out = R.renderScene(sc, { noCache: true });
    const op = out.ops.find((o) => o.op === 'text');
    const T = R.layoutOf(el, sc.width, sc.height);
    tot++;
    const eq = op && JSON.stringify(op.lines) === JSON.stringify(T.lines)
      && Math.abs(op.size - +T.size.toFixed(2)) < 0.02
      && op.lineHeight === T.lineHeight;
    if (eq) same++; else if (!worst) worst = { el: el.overflow || el.list || 'plain', op: op && op.lines, T: T.lines };
  }
  ok(same === tot, `${tot}종에서 창구가 export op 과 동일 — ${same}/${tot}` + (worst ? ` (첫 불일치: ${worst.el})` : ''));
});

sec('── ③ 좌표계 — 씬 px 공간이라 절대 하한까지 같다', () => {
  /* autoresize 는 size>6px 에서 멈춘다. 절대항이라 ar 불변으로는 못 잡힌다 */
  const TIGHT = { kind: 'text', x: 0, y: 0, w: 10, h: 3, size: 6, overflow: 'autoresize', text: LONG + LONG };
  const scene = R.layoutOf(TIGHT, 1280, 720);
  const canvas = R.layoutOf(TIGHT, 560, 315);          /* 화면 캔버스 px 로 물었을 때 */
  ok(scene.size <= 6.001, `씬 공간에서 하한에 닿는다 (${scene.size}px)`);
  ok(Math.abs(canvas.size / 315 - scene.size / 720) > 1e-6,
    `캔버스 px 로 물으면 값이 갈린다 (${canvas.size}px vs 환산 ${(scene.size * 315 / 720).toFixed(2)}px) — 그래서 씬 공간으로 묻는다`);
});

sec('── ④ 오버플로 정책 3종이 창구를 통과한다', () => {
  const base = R.layoutOf(T_PLAIN, 1280, 720);
  const clip = R.layoutOf(T_CLIP, 1280, 720);
  const ell = R.layoutOf(T_ELL, 1280, 720);
  const auto = R.layoutOf(T_AUTO, 1280, 720);
  ok(clip.lines.length < base.lines.length, `clip 이 줄을 자른다 (${base.lines.length} → ${clip.lines.length})`);
  ok(/…$/.test(ell.lines[ell.lines.length - 1]), 'ellipsis 가 말줄임표를 남긴다');
  ok(auto.size < base.size, `autoresize 가 글자를 줄인다 (${base.size}px → ${auto.size}px)`);
  const chars = (T) => T.lines.join('').length;
  ok(chars(clip) < String(LONG).length, `옛 화면은 ${String(LONG).length}자를 다 보여줬고 파일엔 ${chars(clip)}자만 있었다`);
});

sec('── ⑤ list 접두가 창구를 통과한다', () => {
  const b = R.layoutOf(T_BUL, 1280, 720), n = R.layoutOf(T_NUM, 1280, 720);
  ok(b.lines[0].indexOf('· ') === 0, '글머리표 접두가 줄에 있다');
  ok(/^1\. /.test(n.lines[0]) && /^2\. /.test(n.lines[1] || ''), '번호 접두가 줄에 있다');
  ok(String(T_BUL.text).indexOf('·') < 0, '원문엔 접두가 없다 — 화면에만 없던 게 이제 보인다');
});

sec('── ⑥ 무캐시 — 자간을 만져도 결과가 따라온다', () => {
  /* renderScene 텍스트 캐시 키는 letterSpacing 을 안 본다. 빌려 썼다면 여기서 굳는다 */
  const a = R.layoutOf({ ...T_PLAIN, letterSpacing: 0 }, 1280, 720);
  const b = R.layoutOf({ ...T_PLAIN, letterSpacing: 0.3 }, 1280, 720);
  ok(JSON.stringify(a.lines) !== JSON.stringify(b.lines), '자간 변화가 줄에 반영된다 (캐시에 안 굳는다)');
  const c = R.layoutOf({ ...T_PLAIN, letterSpacing: 0 }, 1280, 720);
  ok(JSON.stringify(a.lines) === JSON.stringify(c.lines), '같은 입력은 같은 결과 (결정론)');
});

/* ---- 화면 소스 계약 (DOM 문자열 생성 경로를 소스로 검사) ---- */
const WS = read('screens/workspace.js');
const ED = read('screens/editor.js');

sec('── ⑦ workspace 화면이 창구를 쓴다', () => {
  ok(/MK_RENDER[\s\S]{0,120}layoutOf/.test(WS), 'workspace 가 layoutOf 를 부른다');
  ok(/T\.lines\.map\([\s\S]{0,60}join\('<br>'\)/.test(WS), 'export 가 나눈 줄을 <br> 로 놓는다');
  ok(/white-space:pre(?!-wrap)/.test(WS), 'white-space:pre — 브라우저 재줄바꿈을 껐다');
  ok(/T\.size\s*\/\s*\(sc\.height/.test(WS), 'autoresize 로 줄어든 크기를 화면 px 로 환산한다');
  ok(/line-height:\$\{T\.lineHeight\}/.test(WS), '줄간격도 export 값을 따른다 (CSS 1.3 → export 1.35)');
  ok(/layoutOf\(el, sc\.width, sc\.height\)/.test(WS), '씬 px 공간으로 묻는다');
});

sec('── ⑧ editor 캔버스가 같은 창구를 쓴다', () => {
  ok(/const txtLay = \(el, sc\)/.test(ED), 'editor 에 창구 헬퍼가 있다');
  ok(/layoutOf\(el, sc\.width, sc\.height\)/.test(ED), '씬 px 공간으로 묻는다');
  const canvas = ED.slice(ED.indexOf('const CanvasArea'), ED.indexOf('const MiniScene'));
  ok(/T\.lines\.map\([\s\S]{0,60}join\('<br>'\)/.test(canvas), '캔버스가 export 줄을 그린다');
  ok(/white-space:pre(?!-wrap)/.test(canvas), '캔버스가 재줄바꿈을 껐다');
});

sec('── ⑨ 미니 — 씬 스트립·타임라인·Brand Preview (R112 의 빚)', () => {
  const mini = ED.slice(ED.indexOf('const MiniScene'), ED.indexOf('window.MK_MINI'));
  ok(/txtLay\(el, scene\)/.test(mini), '미니도 창구에 묻는다');
  ok(/T\.lines\.map\([\s\S]{0,60}join\('<br>'\)/.test(mini), '썸네일이 export 줄을 그린다');
  ok(/white-space:pre(?!-wrap)/.test(mini), '썸네일이 재줄바꿈을 껐다');
  ok(/T\.size\s*\/\s*\(scene\.height/.test(mini), '썸네일이 autoresize 축소를 반영한다');
  /* 실제 렌더 결과로도 확인 */
  const sc = SC([T_ELL]);
  const out = w.MK_MINI ? w.MK_MINI(sc, 108) : '';
  const T = R.layoutOf(T_ELL, sc.width, sc.height);
  ok(!!out && out.indexOf(T.lines[T.lines.length - 1]) >= 0, '미니 DOM 에 export 의 마지막 줄(말줄임 포함)이 들어 있다');
  ok(!!out && out.indexOf(LONG) < 0, '미니가 더 이상 원문 전체를 보여주지 않는다');
});

sec('── ⑩ 편집 진입 원문 복원', () => {
  ok(/span\.textContent = el\.text/.test(ED), '편집에 들어갈 때 원문으로 되돌린다');
  ok(/whiteSpace = 'pre-wrap'/.test(ED), '편집 중엔 pre-wrap 으로 풀어 전체가 보인다');
  ok(/whiteSpace = wsBack/.test(ED), '편집을 마치면 그리는 규약으로 복귀한다');
  ok(ED.indexOf('span.textContent = el.text') < ED.indexOf('span.focus()'), '복원이 포커스보다 먼저다 (커밋 오염 차단)');
});

sec('── ⑪ 폴백 — 창구가 없으면 옛길', () => {
  ok(/if \(!R \|\| !R\.layoutOf/.test(WS) && /if \(!R \|\| !R\.layoutOf/.test(ED), '두 화면 모두 창구 부재를 확인한다');
  ok(/T \? [\s\S]{0,200}: M\(\)\.esc\(el\.text\)/.test(ED), 'editor 폴백이 종전 통짜 경로');
  ok(/M\(\)\.esc\(el\.text\)\.replace\(\/\\n\/g, '<br>'\)/.test(WS), 'workspace 폴백이 종전 통짜 경로');
});

sec('── ⑫ 템플릿 전수 — 창구와 export 불일치 0', () => {
  const scenes = [];
  try { (w.MK_TPL && w.MK_TPL.list ? w.MK_TPL.list() : []).forEach((t) => {
    const d = w.MK_TPL.build ? w.MK_TPL.build(t.id) : t;
    ((d && d.scenes) || []).forEach((sc) => scenes.push(sc));
  }); } catch (e) {}
  let tot = 0, bad = 0;
  for (const sc of scenes) {
    const W2 = sc.width || 1280, H2 = sc.height || 720;
    for (const el of (sc.elements || [])) {
      if (el.kind !== 'text') continue;
      tot++;
      const T = R.layoutOf(el, W2, H2);
      const f = R.frameOf(el, W2, H2);
      const X = R.layoutText({ ...el, sizePx: (el.size || 3) * H2 / 100 }, f, () => {});
      if (JSON.stringify(T.lines) !== JSON.stringify(X.lines) || T.size !== X.size) bad++;
    }
  }
  ok(tot > 100, `템플릿 텍스트 ${tot}개 수집`);
  ok(bad === 0, `창구와 export 불일치 ${bad}개`);
});

sec('── ⑬ export 텍스트 캐시가 자간·줄간격을 본다 (R113 이 잡은 결함)', () => {
  /* 화면이 export 에게 묻기 시작한 이상, export 가 캐시로 틀리면 화면도 같이 틀린다.
     종전 키엔 letterSpacing·lineHeight 가 없어서, 줄 수가 우연히 같으면 충돌했다. */
  const A = { kind: 'text', x: 8, y: 10, w: 24, size: 4, text: LONG };
  /* R115 — 표본 재보정. 폭 모델이 글꼴 실측으로 바뀌면서 이 문장이 옛 경계에서
     벗어났다(자간 0.08 로는 줄이 안 갈린다). 계약은 그대로고 자간 값만
     새 경계 위로 다시 앉힌다 — 검사하려는 건 캐시 키의 격리이지 특정 수치가 아니다. */
  const B = { ...A, letterSpacing: 0.2 };
  const line = (el) => R.renderScene(SC([el]), { noCache: true }).ops.find((o) => o.op === 'text').lines;
  line(A);                                   /* 캐시를 먼저 채운다 — 종전이면 여기서 오염된다 */
  ok(JSON.stringify(line(B)) !== JSON.stringify(line(A)), '자간 다른 텍스트가 남의 배치를 물려받지 않는다');
  ok(JSON.stringify(line(B)) === JSON.stringify(R.layoutOf(B, 1280, 720).lines), 'export 와 창구가 같은 줄을 낸다');
  const C = { ...A, h: 20, lineHeight: 1.0, overflow: 'clip' }, D = { ...C, lineHeight: 2.4 };
  line(C);
  ok(line(D).length < line(C).length, '줄간격도 키에 있다 (clip maxLines 가 따라 변한다)');
  ok(R.cache && R.cache.text && R.cache.text.size > 0, '캐시 자체는 살아 있다 (키만 정확해졌다)');
});

console.log(`\nR113: ${pass}/${pass + fail} ${fail ? 'FAIL' : 'PASS'}`);
process.exit(fail ? 1 : 0);
