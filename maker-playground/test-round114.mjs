/* ============================================================
   test-round114.mjs — R114 자간이 두 이름으로 갈려 있던 것을
                       정본 하나로 모은다
   ------------------------------------------------------------
   문제의 실체 — 같은 물리량(자간)이 서로 다른 이름으로 두 세계에 살았다:
     · el.letterSpacing — render 가 읽던 키. MK_TEXTSTYLE 프리셋이 심는다.
     · el.tracking      — 템플릿 t() 헬퍼·aiedit 이 심고 editor·play 가
                          CSS 로 그리던 키. render 는 이 이름을 몰랐다.
   그래서 tracking 붙은 글자는 화면에선 벌어져 보이고 내려받은 파일에선
   자간 0 으로 붙어 나왔다. 템플릿 텍스트 414 개 중 12 개가 이 상태였고
   letterSpacing 을 심는 템플릿은 0 개였다 — render 가 읽는 키를 아무도
   쓰지 않았다는 뜻이다.

   R113 이후로는 더 나빠졌다. 화면이 CSS 로는 자간을 그리면서 줄바꿈은
   그 이름을 모르는 창구에게 물으니, 화면이 자기가 그은 줄 안에서
   자기 글자에 넘쳤다. R113 이 창구를 세운 대가로 새로 생긴 결함이다.

   갚는 방식 — 두 번째 이름을 없애는 게 아니라 읽는 자리를 하나로:
     MK_RENDER.lsOf(el) 가 자간 읽기 정본이다. letterSpacing 이 정본 이름,
     tracking 은 옛 이름으로 읽기만 흡수한다. 저장된 프로젝트는 그대로 열리고
     새로 심는 곳(tplpack·aiedit)은 정본 이름 하나만 쓴다.
   화면은 자간을 제 손으로 읽지 않는다 — 창구(layoutOf)가 답한 값을 쓴다.

   계약:
     ① lsOf 존재·우선순위 — letterSpacing > tracking > 0
     ② 자간이 export 까지 간다 — SVG letter-spacing 속성에 실린다
     ③ 창구가 자간을 답한다 — px·em 두 단위
     ④ 자간이 줄바꿈을 바꾼다 — 정본을 통과했으니 wrap 이 따라온다
     ⑤ 캐시 키가 자간을 본다 — 자간만 다른 두 원소가 섞이지 않는다
     ⑥ workspace 화면 — 창구 자간이 DOM 에
     ⑦ editor 캔버스 — 같은 계약
     ⑧ 미니(스트립) — 같은 계약, em 이라야 3px 하한에서도 비율 유지
     ⑨ play 재생 — 창구 경로 (줄·크기·접두·자간). R113 범위 밖이던 자리
     ⑩ 화면 == export — 자간 있는 원소에서 줄이 한 글자도 다르지 않다
     ⑪ 쓰기 정본화 — 템플릿·aiedit 이 심는 키가 letterSpacing
     ⑫ 하위호환 — tracking 만 있는 옛 저장물이 그대로 열린다
     ⑬ 템플릿 전수 — 자간 보유 원소가 export 에 반영된다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R114_ROOT || path.resolve('.');
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

/* 공통 표본 — 자간이 줄바꿈을 실제로 바꾸는 길이로 고른다 */
const LONG = '학교에서 배우는 즐거운 과학 이야기 한마당';
const mk = (o = {}) => ({ kind: 'text', x: 10, y: 10, w: 40, size: 5, text: LONG, weight: 400, ...o });
const scOf = (el) => ({ width: 1280, height: 720, background: '#FFFFFF', elements: [el] });
const docOf = (el) => ({ width: 1280, height: 720, scenes: [scOf(el)] });
const svgOf = (el) => R.toSVG(R.renderScene(scOf(el), { doc: docOf(el) }));

sec('── ① lsOf 정본 — letterSpacing > tracking > 0', () => {
  ok(typeof R.lsOf === 'function', 'MK_RENDER.lsOf 가 공개 API 다');
  ok(R.lsOf({ letterSpacing: 0.2 }) === 0.2, 'letterSpacing 을 읽는다');
  ok(R.lsOf({ tracking: 0.3 }) === 0.3, 'tracking 을 옛 이름으로 흡수한다');
  ok(R.lsOf({ letterSpacing: 0.2, tracking: 0.3 }) === 0.2, '둘 다 있으면 정본 이름이 이긴다');
  ok(R.lsOf({ letterSpacing: 0, tracking: 0.3 }) === 0, 'letterSpacing:0 은 값이다 — tracking 으로 새지 않는다');
  ok(R.lsOf({}) === 0 && R.lsOf(null) === 0, '없으면 0');
});

sec('── ② 자간이 export 까지 간다 (SVG)', () => {
  const svgT = svgOf(mk({ tracking: 0.3 }));
  const svgL = svgOf(mk({ letterSpacing: 0.3 }));
  const svg0 = svgOf(mk());
  const lsAttr = (s) => (s.match(/letter-spacing="([-\d.]+)"/) || [])[1];
  ok(lsAttr(svgT) != null, 'tracking 만 있어도 SVG 에 letter-spacing 이 실린다');
  ok(lsAttr(svgT) === lsAttr(svgL), 'tracking 과 letterSpacing 이 같은 수를 낸다');
  ok(lsAttr(svg0) == null, '자간 없으면 속성도 없다 (없는 걸 만들지 않는다)');
  ok(+lsAttr(svgT) > 0, `실린 값이 0 이 아니다 (${lsAttr(svgT)})`);
});

sec('── ③ 창구가 자간을 답한다 — px·em 두 단위', () => {
  const T = R.layoutOf(mk({ tracking: 0.3 }), 1280, 720);
  ok(T && T.letterSpacingEm === 0.3, 'letterSpacingEm 은 배수 그대로');
  ok(T && Math.abs(T.letterSpacing - 0.3 * T.size) < 0.01, `letterSpacing 은 px (${T.letterSpacing} == 0.3 × ${T.size})`);
  const T0 = R.layoutOf(mk(), 1280, 720);
  ok(T0.letterSpacingEm === 0, '자간 없으면 em 0 — 화면이 속성을 안 짓는 근거');
});

sec('── ④ 자간이 줄바꿈을 바꾼다', () => {
  const a = R.layoutOf(mk(), 1280, 720);
  const b = R.layoutOf(mk({ tracking: 0.3 }), 1280, 720);
  ok(b.lines.length > a.lines.length, `자간이 붙으면 줄이 는다 (${a.lines.length} → ${b.lines.length})`);
  ok(a.lines.join('|') !== b.lines.join('|'), '줄 내용이 갈린다');
  const c = R.layoutOf(mk({ letterSpacing: 0.3 }), 1280, 720);
  ok(b.lines.join('|') === c.lines.join('|'), '두 이름이 같은 줄을 낸다');
  const neg = R.layoutOf(mk({ tracking: -0.05 }), 1280, 720);
  ok(neg.textW < a.textW, `음수 자간도 통한다 (폭 ${a.textW} → ${neg.textW})`);
});

sec('── ⑤ 캐시 키가 자간을 본다', () => {
  /* 자간만 다른 두 원소를 같은 씬에 나란히 두면, 키가 자간을 안 볼 때
     뒤엣것이 앞엣것의 줄을 물려받는다. 한 씬 안에서 잡아야 캐시가 실제로 돈다. */
  const e1 = mk({ tracking: 0 }), e2 = mk({ tracking: 0.3, y: 40 });
  const sc = { width: 1280, height: 720, background: '#FFFFFF', elements: [e1, e2] };
  const dl = R.renderScene(sc, { doc: { width: 1280, height: 720, scenes: [sc] } });
  const texts = dl.ops.filter((o) => o.op === 'text');
  ok(texts.length === 2, '텍스트 op 두 개');
  ok(texts[0].lines.join('|') !== texts[1].lines.join('|'), '자간만 다른 둘이 서로 다른 줄을 받는다 (키 충돌 없음)');
  ok(!texts[0].letterSpacing && texts[1].letterSpacing > 0, '자간 값도 각자 실린다');
});

/* ---- 화면 3종 + 미니 : DOM 문자열에서 확인 ---- */
/* 씬 래퍼(mkp-scene)가 아니라 요소(mkp-el)의 style 을 집는다 —
   첫 style 을 집으면 배경색만 보고 자간을 못 찾는다 */
const styleOfHTML = (h) => (h.match(/class="mkp-el"[^>]*style="([^"]*)"/) || h.match(/style="([^"]*)"/) || [])[1] || '';
const lsInStyle = (s) => (s.match(/letter-spacing:([^;"]+)/) || [])[1];

sec('── ⑥ workspace — 창구 자간이 DOM 에', () => {
  const src = read('screens/workspace.js');
  ok(/letterSpacingEm/.test(src), 'workspace 가 창구 자간을 읽는다');
  ok(!/el\.tracking\s*\?/.test(src.split('txtBody')[1] || ''), 'txtBody 가 제 손으로 el.tracking 을 읽지 않는다');
  ok(/letter-spacing:\$\{T\.letterSpacingEm\}em/.test(src), 'em 단위로 그린다 (글자 크기 상대)');
});

sec('── ⑦ editor 캔버스 — 같은 계약', () => {
  const src = read('screens/editor.js');
  const canvasPart = src.slice(src.indexOf("if (el.kind === 'text')"), src.indexOf("if (el.kind === 'text')") + 1400);
  ok(/T\.letterSpacingEm/.test(canvasPart), 'editor 캔버스가 창구 자간을 쓴다');
  ok(/T \? \(T\.letterSpacingEm/.test(canvasPart), '창구가 있으면 창구 값이 먼저다');
  ok(/el\.tracking \? /.test(canvasPart), '창구 부재 시 옛 경로로 조용히 되돌아간다 (폴백 생존)');
});

sec('── ⑧ 미니(스트립) — em 이라야 3px 하한에서도 비율 유지', () => {
  const src = read('screens/editor.js');
  const miniPart = src.slice(src.indexOf('썸네일도 export'));
  ok(/const mls = T && T\.letterSpacingEm/.test(miniPart), '미니가 창구 자간을 쓴다');
  ok(/\$\{mls\}/.test(miniPart), '미니 span 스타일에 실제로 붙는다');
  ok(/letter-spacing:\$\{T\.letterSpacingEm\}em/.test(miniPart), 'em 단위 — 크기가 하한에 걸려도 글자 대비 비율이 산다');
});

sec('── ⑨ play 재생 — 창구 경로 (R113 범위 밖이던 자리)', () => {
  const P = w.MK_PLAY || w.MK_PLAYER;
  const fn = P && (P.sceneHTML || P.renderScene);
  ok(typeof fn === 'function', 'play 의 sceneHTML 이 열려 있다');
  if (typeof fn !== 'function') return;
  const el = mk({ tracking: 0.3 });
  const h = fn(scOf(el), { still: true });
  const sty = styleOfHTML(h);
  ok(/letter-spacing:0\.3em/.test(sty), `재생 화면에 자간이 붙는다 (${lsInStyle(sty)})`);
  ok(/white-space:pre(?!-wrap)/.test(sty), '줄은 export 가 나눈 것을 쓴다 (pre — 브라우저 재줄바꿈 차단)');
  const T = R.layoutOf(el, 1280, 720);
  const body = (h.match(/>([^<]*(?:<br>[^<]*)*)<\/div>/) || [])[1] || '';
  ok(body.split('<br>').length === T.lines.length, `줄 수가 export 와 같다 (${T.lines.length})`);
  const li = fn(scOf(mk({ list: 'bullet', text: '첫째\n둘째' })), { still: true });
  ok(/·/.test(li), '목록 접두가 재생 화면에도 그려진다');
  /* h 가 있어야 autoresize 가 줄일 이유를 갖는다 — 높이 없는 상자는 넘칠 수 없다 */
  const ar = fn(scOf(mk({ overflow: 'autoresize', size: 14, h: 8, w: 20, text: LONG })), { still: true });
  const fsz = +((styleOfHTML(ar).match(/font-size:([\d.]+)cqh/) || [])[1]);
  ok(fsz > 0 && fsz < 14, `autoresize 축소가 재생 화면에도 (14 → ${fsz}cqh)`);
});

sec('── ⑩ 화면 == export — 자간 있는 원소에서 줄이 같다', () => {
  for (const tr of [0.3, 0.12, -0.03, 0.22]) {
    const el = mk({ tracking: tr });
    const T = R.layoutOf(el, 1280, 720);
    const op = R.renderScene(scOf(el), { doc: docOf(el) }).ops.find((o) => o.op === 'text');
    ok(op && op.lines.join('|') === T.lines.join('|') && Math.abs(op.letterSpacing - T.letterSpacing) < 0.01,
      `자간 ${tr} — 창구와 export 가 같은 줄·같은 자간 (${T.lines.length}줄)`);
  }
});

sec('── ⑪ 쓰기 정본화 — 새로 심는 키가 letterSpacing', () => {
  const tp = read('data/tplpack.js'), ae = read('data/aiedit.js');
  ok(/letterSpacing: o\.tracking/.test(tp), '템플릿 t() 헬퍼가 정본 이름으로 심는다');
  ok(!/\.tracking\s*=/.test(ae), 'aiedit 이 tracking 을 더는 심지 않는다');
  ok(/\.letterSpacing\s*=/.test(ae), 'aiedit 이 정본 이름으로 심는다');
  const TP = w.MK_TPL;
  const docs = (TP && TP.list ? TP.list() : []).map((t) => t.doc || t).filter(Boolean);
  let track = 0, ls = 0;
  docs.forEach((d) => (d.scenes || []).forEach((s) => (s.elements || []).forEach((e) => {
    if (e.kind !== 'text') return;
    if (e.tracking != null && e.tracking !== 0) track++;
    if (e.letterSpacing != null && e.letterSpacing !== 0) ls++;
  })));
  ok(track === 0, `살아 있는 템플릿에 옛 이름이 남지 않았다 (tracking ${track})`);
  ok(ls > 0, `정본 이름으로 심겼다 (letterSpacing ${ls})`);
});

sec('── ⑫ 하위호환 — tracking 만 있는 옛 저장물', () => {
  const old = { kind: 'text', x: 5, y: 5, w: 50, size: 4, text: LONG, tracking: 0.25, weight: 700 };
  const T = R.layoutOf(old, 1280, 720);
  ok(T && T.letterSpacingEm === 0.25, '옛 저장물이 그대로 열리고 자간이 산다');
  const svg = svgOf(old);
  ok(/letter-spacing=/.test(svg), '옛 저장물의 자간이 이제 파일까지 간다');
  ok(!/undefined|NaN/.test(svg), 'SVG 에 undefined·NaN 이 없다');
});

sec('── ⑬ 템플릿 전수 — 자간이 export 에 반영', () => {
  const TP = w.MK_TPL;
  const list = TP && TP.list ? TP.list() : [];
  let nText = 0, nLs = 0, mismatch = 0, shrunk = 0, reflected = 0;
  list.forEach((t) => {
    const d = t.doc || t;
    (d.scenes || []).forEach((sc) => {
      const W = sc.width || d.width || 1280, H = sc.height || d.height || 720;
      const dl = R.renderScene(sc, { doc: d });
      const ops = dl.ops.filter((o) => o.op === 'text');
      let k = 0;
      (sc.elements || []).forEach((el) => {
        if (el.kind !== 'text') return;
        nText++;
        const hasLs = R.lsOf(el) !== 0;
        if (hasLs) nLs++;
        const T = R.layoutOf(el, W, H), op = ops[k++];
        if (!T || !op) return;
        if (op.lines.join('|') !== T.lines.join('|')) mismatch++;
        if (hasLs && !op.letterSpacing) shrunk++;
        if (hasLs && op.letterSpacing) reflected++;
      });
    });
  });
  console.log(`  · 템플릿 ${list.length}종 · 텍스트 ${nText}개 · 자간 보유 ${nLs}개`);
  ok(mismatch === 0, `창구와 export 불일치 0 (${mismatch})`);
  ok(shrunk === 0, `자간 보유 원소 중 export 에서 자간이 빠진 것 0 (${shrunk})`);
  ok(reflected === nLs && nLs > 0, `자간 ${nLs}개 전부가 파일까지 간다 (${reflected})`);
});

console.log(`\nR114  ${pass}/${pass + fail}  ${fail ? '✗ FAIL' : '✓ PASS'}`);
process.exit(fail ? 1 : 0);
