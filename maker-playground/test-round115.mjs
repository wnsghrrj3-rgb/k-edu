/* ============================================================
   test-round115.mjs — 폭 모델이 글꼴을 모르던 것을 실측표로 갚는다
   ------------------------------------------------------------
   문제의 실체 — layoutText 는 첫 줄에서 resolveFont 로 글꼴을 해석해놓고
   폭 계산엔 한 번도 쓰지 않았다. 문자폭 테이블이 전 글꼴 공통 하나여서
   프리텐다드든 나눔 손글씨 펜이든 검은고딕이든 같은 수로 쟀다.

   실폰트 파일(fontkit·hmtx advance)에서 잰 한글 폭은 어떤 글꼴에서도
   1.0em 이 아니다 — 0.624(나눔 손글씨 펜) ~ 0.940(나눔고딕).
   기본 글꼴 프리텐다드조차 0.864 로, 옛 모델이 15.7% 더 넓게 봤다.

   피해는 두 갈래였다:
     · 줄바꿈이 실제보다 일찍 일어난다 — 오른쪽에 안 쓴 자리가 남는다
     · 배경 pill 폭(textW)이 글자보다 넓다 — 손글씨 프리셋에서 34.2%

   그리고 export 안에서 자기모순이 됐다. 같은 배경 pill 을 SVG 는
   op.textW(모델)로, canvas(PNG·MP4)는 cx.measureText(브라우저 실측)로
   그렸다 — 같은 문서가 형식에 따라 다른 폭으로 나왔다.

   갚는 방식은 R113·R114 와 같다 — 재는 자리를 하나로:
     MK_RENDER.metricsOf(family) 가 폭 읽기 정본이다.
     measure·wrap·textLines·layoutText·textW 가 전부 이 표를 통과하고,
     canvas 도 제 손으로 재지 않고 op.textW 를 쓴다.

   계약:
     ① metricsOf 정본 — 실측 10 종 + 미지 글꼴 폴백
     ② 한글 1.0em 가정이 사라졌다 — 실측은 전부 1.0 미만
     ③ 폭이 글꼴을 본다 — 같은 문장이 글꼴에 따라 다른 폭
     ④ 줄바꿈이 글꼴을 따라간다 — 좁은 글꼴은 줄이 적다
     ⑤ layoutText 가 해석한 글꼴을 쓴다 — 폴백도 폴백 표로
     ⑥ 창구(layoutOf)가 같은 값을 답한다
     ⑦ 프레임(frameOf)도 같은 표로 — 줄 수 정본이 글꼴을 안다
     ⑧ 화면 == export — 글꼴 바꾼 원소에서 줄이 한 글자도 다르지 않다
     ⑨ 배경 pill 이 글자에 붙는다 — SVG 폭이 실폭을 따라간다
     ⑩ SVG == canvas — 같은 배경 pill 을 두 형식이 같은 폭으로 그린다
     ⑪ autoresize 가 글꼴을 본다 — 좁은 글꼴은 덜 줄어든다
     ⑫ 캐시 키가 글꼴을 본다 — 글꼴만 다른 둘이 섞이지 않는다
     ⑬ 하위호환 — measure·wrap 을 옛 인자수로 불러도 돈다
     ⑭ 템플릿 전수 — 창구·export 불일치 0, 프레임이 줄지 않는다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R115_ROOT || path.resolve('.');
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

const LONG = '학교에서 배우는 즐거운 과학 이야기 한마당 우리 반 친구들과 함께 만드는 작품';
const mk = (o = {}) => ({ kind: 'text', x: 10, y: 10, w: 40, size: 5, text: LONG, weight: 400, ...o });
const scOf = (els) => ({ width: 1280, height: 720, background: '#FFFFFF', elements: [].concat(els) });
const docOf = (els) => ({ width: 1280, height: 720, scenes: [scOf(els)] });
const svgOf = (els) => R.toSVG(R.renderScene(scOf(els), { doc: docOf(els), noCache: true }));
const FAMS = ['Pretendard', 'Noto Sans KR', 'Nanum Gothic', 'Jua', 'Do Hyeon', 'Black Han Sans', 'Gowun Dodum', 'Gowun Batang', 'Nanum Pen Script', 'Gaegu'];

sec('── ① metricsOf 정본 — 실측 10종 + 미지 글꼴 폴백', () => {
  ok(typeof R.metricsOf === 'function', 'MK_RENDER.metricsOf 가 공개 API 다');
  ok(FAMS.every((f) => R.metricsOf(f) && R.metricsOf(f).han > 0), `실측표에 ${FAMS.length}종이 있다`);
  const keys = ['han', 'cjkp', 'sp', 'up', 'lo', 'di', 'pu', 'ot'];
  ok(FAMS.every((f) => keys.every((k) => typeof R.metricsOf(f)[k] === 'number')), '모든 글꼴이 8개 문자군을 다 갖는다 (구멍 없음)');
  ok(R.metricsOf('없는글꼴') === R.metricsOf('Pretendard'), '미지 글꼴은 폴백 표 — 브랜드 커스텀·OS 글꼴이 여기로 온다');
  ok(R.metricsOf(null) === R.metricsOf('Pretendard') && R.metricsOf(undefined) === R.metricsOf('Pretendard'), '글꼴 미지정도 폴백 표');
});

sec('── ② 한글 1.0em 가정이 사라졌다', () => {
  const hans = FAMS.map((f) => R.metricsOf(f).han);
  ok(hans.every((h) => h < 1.0), `실측 한글 폭이 전부 1.0em 미만 (최대 ${Math.max(...hans)})`);
  ok(R.metricsOf('Pretendard').han === 0.864, '기본 글꼴 프리텐다드 0.864 — 옛 모델이 15.7% 과대');
  ok(R.metricsOf('Nanum Pen Script').han === 0.624, '나눔 손글씨 펜 0.624 — 옛 모델이 60% 과대');
  const spread = Math.max(...hans) / Math.min(...hans);
  ok(spread > 1.4, `글꼴 간 한글 폭 차이가 ${spread.toFixed(2)}배 — 공통표 하나로 덮을 수 없는 폭이다`);
});

sec('── ③ 폭이 글꼴을 본다', () => {
  const s = 36, txt = '우리 반 이야기';
  const ws = FAMS.map((f) => R.measure(txt, s, 0, R.metricsOf(f)));
  ok(new Set(ws).size >= 8, `같은 문장이 글꼴마다 다른 폭 (${new Set(ws).size}종)`);
  ok(R.measure(txt, s, 0, R.metricsOf('Nanum Pen Script')) < R.measure(txt, s, 0, R.metricsOf('Nanum Gothic')),
    '좁은 글꼴이 실제로 좁게 나온다 (나눔펜 < 나눔고딕)');
  ok(R.measure(txt, s, 0) === R.measure(txt, s, 0, R.metricsOf('Pretendard')),
    '표 없이 부르면 폴백(프리텐다드) 표 — 기본값이 정본과 같다');
});

sec('── ④ 줄바꿈이 글꼴을 따라간다', () => {
  const lines = {}, split = {};
  FAMS.forEach((f) => { const T = R.layoutOf(mk({ font: f }), 1280, 720); lines[f] = T.lines.length; split[f] = T.lines.join('|'); });
  ok(lines['Nanum Pen Script'] < lines['Nanum Gothic'], `좁은 글꼴은 줄이 적다 (나눔펜 ${lines['Nanum Pen Script']} < 나눔고딕 ${lines['Nanum Gothic']})`);
  /* 줄 "수"가 몇 갈래로 갈리느냐는 표본 문장이 경계를 몇 개 지나느냐에 달렸다 —
     계약으로 삼을 건 그게 아니라 나뉘는 자리가 글꼴마다 다르다는 것이다.
     임계 4 는 실측값(10종 → 4가지 배치)이 아니라 그 아래 여유를 둔 하한이다:
     실측을 그대로 임계로 쓰면 표본을 한 글자만 고쳐도 계약이 깨진다. */
  ok(new Set(Object.values(split)).size >= 3, `줄 나뉘는 자리가 글꼴마다 갈린다 (10종 중 ${new Set(Object.values(split)).size}가지 배치)`);
  const l1 = R.layoutOf(mk({ font: 'Do Hyeon' }), 1280, 720).lines;
  const l2 = R.layoutOf(mk({ font: 'Gowun Dodum' }), 1280, 720).lines;
  ok(l1.join('|') !== l2.join('|'), '줄 내용도 갈린다 (줄 수만 우연히 같아도 나뉘는 자리가 다르다)');
});

sec('── ⑤ layoutText 가 해석한 글꼴을 쓴다 (폴백 포함)', () => {
  const a = R.layoutOf(mk({ font: '있지도않은글꼴' }), 1280, 720);
  const b = R.layoutOf(mk({ font: 'Pretendard' }), 1280, 720);
  ok(a.lines.join('|') === b.lines.join('|'), '없는 글꼴은 폴백 글꼴의 폭으로 잰다 — 화면이 그리는 글꼴과 같은 표');
  ok(a.font && a.font.missing === true, 'resolveFont 는 여전히 폴백을 정직하게 표시한다');
  const c = R.layoutOf(mk({ font: 'Gaegu' }), 1280, 720);
  ok(c.font && c.font.family === 'Gaegu' && !c.font.missing, '있는 글꼴은 자기 이름 그대로');
});

sec('── ⑥ 창구(layoutOf)가 export 와 같은 값을 답한다', () => {
  FAMS.forEach((f) => {
    const el = mk({ font: f });
    const T = R.layoutOf(el, 1280, 720);
    const op = R.renderScene(scOf(el), { doc: docOf(el), noCache: true }).ops.find((o) => o.op === 'text');
    if (op.lines.join('|') !== T.lines.join('|')) { fail++; console.log(`  ✗ ${f} 창구≠export`); return; }
    if (Math.abs(op.textW - T.textW) > 0.02) { fail++; console.log(`  ✗ ${f} textW 불일치`); return; }
    pass++; console.log(`  ✓ ${f} — 줄·폭 일치 (${T.lines.length}줄 · ${T.textW}px)`);
  });
});

sec('── ⑦ 프레임(frameOf)도 같은 표로', () => {
  const wide = R.frameOf(mk({ font: 'Nanum Gothic' }), 1280, 720);
  const narrow = R.frameOf(mk({ font: 'Nanum Pen Script' }), 1280, 720);
  ok(narrow.h < wide.h, `좁은 글꼴은 프레임도 낮다 (${narrow.h} < ${wide.h}) — 줄 수 정본이 글꼴을 안다`);
  const el = mk({ font: 'Do Hyeon' });
  const T = R.layoutOf(el, 1280, 720);
  const f = R.frameOf(el, 1280, 720);
  ok(f.h >= T.lines.length * T.size * 1.35 * 0.95, '프레임 높이가 실제 줄 수를 담는다 (R111 계약 유지)');
});

sec('── ⑧ 화면 == export (글꼴 바꾼 원소)', () => {
  let bad = 0;
  FAMS.forEach((f) => {
    ['visible', 'autoresize', 'clip', 'ellipsis'].forEach((ov) => {
      const el = mk({ font: f, overflow: ov, h: 12 });
      const T = R.layoutOf(el, 1280, 720);
      const op = R.renderScene(scOf(el), { doc: docOf(el), noCache: true }).ops.find((o) => o.op === 'text');
      if (op.lines.join('|') !== T.lines.join('|') || Math.abs(op.size - T.size) > 0.02) bad++;
    });
  });
  ok(bad === 0, `글꼴 10종 × 오버플로 4종 = 40 조합에서 화면·export 불일치 0 (${bad})`);
});

sec('── ⑨ 배경 pill 이 글자에 붙는다', () => {
  const el = mk({ font: 'Nanum Pen Script', text: '오늘의 학습 목표', w: 60, bg: { color: '#FFE86B', radius: 0.2 } });
  const T = R.layoutOf(el, 1280, 720);
  const real = R.measure(T.lines[0], T.size, T.letterSpacing, R.metricsOf('Nanum Pen Script'));
  ok(Math.abs(T.textW - real) < 0.02, 'textW 가 그 글꼴의 실폭이다');
  const old = R.measure(T.lines[0], T.size, T.letterSpacing, { han: 1, cjkp: 1, sp: .32, up: .66, lo: .52, di: .58, pu: .30, ot: .55 });
  ok(old > T.textW * 1.2, `옛 모델은 같은 글자를 ${(old / T.textW).toFixed(2)}배 넓게 봤다 — 그만큼 띠가 길게 그려졌다`);
  const svg = svgOf(el);
  const rect = (svg.match(/<rect[^>]*fill="#FFE86B"[^>]*>/) || [])[0] || '';
  const bw = +((rect.match(/width="([\d.]+)"/) || [])[1] || 0);
  ok(bw > 0 && Math.abs(bw - (T.textW + T.size)) < 1.0, `SVG 배경 폭이 실폭 + 패딩 (${bw})`);
});

sec('── ⑩ SVG == canvas — 같은 pill 을 두 형식이 같은 폭으로', () => {
  /* canvas 경로는 op.textW 를 쓰도록 바뀌었다. 종전엔 cx.measureText 로 제 손으로 쟀다.
     jsdom 엔 실캔버스가 없으니, 소스에서 재는 자리가 하나로 모였는지를 검사한다. */
  const src = read('data/render.js');
  const at = src.indexOf('op2.bg && op2.bg.color');
  const canvasSeg = at > -1 ? src.slice(at, at + 900) : '';
  ok(canvasSeg.indexOf('op2.textW') > -1, 'canvas 배경 pill 이 op.textW 를 쓴다');
  ok(/const tw = op2\.textW != null/.test(canvasSeg), '실측은 textW 부재 시 폴백으로만 남는다 (정본은 하나)');
  const sv = src.indexOf('R56 — 배경 pill');
  const svgSeg = sv > -1 ? src.slice(sv, sv + 600) : '';
  ok(svgSeg.indexOf('op.textW') > -1, 'SVG 배경 pill 도 같은 값을 쓴다');
});

sec('── ⑪ autoresize 가 글꼴을 본다', () => {
  const base = { kind: 'text', x: 5, y: 5, w: 30, h: 8, size: 6, text: LONG, overflow: 'autoresize' };
  const narrow = R.layoutOf({ ...base, font: 'Nanum Pen Script' }, 1280, 720);
  const wide = R.layoutOf({ ...base, font: 'Nanum Gothic' }, 1280, 720);
  ok(narrow.size > wide.size, `좁은 글꼴은 덜 줄어든다 (나눔펜 ${narrow.size} > 나눔고딕 ${wide.size})`);
  ok(narrow.size <= 6 * 720 / 100 + 0.01, '축소는 원크기를 넘지 않는다');
  ok(narrow.lines.length * narrow.size * narrow.lineHeight <= (8 * 720 / 100) + narrow.size * 0.4 + 0.01, '축소 결과가 상자에 담긴다');
});

sec('── ⑫ 캐시 키가 글꼴을 본다', () => {
  const e1 = mk({ font: 'Nanum Pen Script' }), e2 = mk({ font: 'Nanum Gothic', y: 40 });
  const dl = R.renderScene(scOf([e1, e2]), { doc: docOf([e1, e2]) });
  const ts = dl.ops.filter((o) => o.op === 'text');
  ok(ts.length === 2, '텍스트 op 두 개');
  ok(ts[0].lines.join('|') !== ts[1].lines.join('|'), '글꼴만 다른 둘이 서로 다른 줄을 받는다 (키 충돌 없음)');
  ok(ts[0].textW !== ts[1].textW, '폭도 각자');
});

sec('── ⑬ 하위호환 — 옛 인자수 호출', () => {
  ok(typeof R.measure('가나다', 36) === 'number', 'measure(text,size) 2인자');
  ok(typeof R.measure('가나다', 36, 2) === 'number', 'measure(text,size,ls) 3인자');
  ok(Array.isArray(R.wrap('가나다 라마바', 100, 36)), 'wrap(text,maxW,size) 3인자');
  ok(Array.isArray(R.wrap('가나다 라마바', 100, 36, 1)), 'wrap(text,maxW,size,ls) 4인자');
  const old = { kind: 'text', x: 5, y: 5, w: 40, size: 5, text: LONG, tracking: 0.1 };
  ok(R.layoutOf(old, 1280, 720).lines.length > 0, '글꼴 없는 옛 저장물이 그대로 열린다');
});

sec('── ⑭ 템플릿 전수 — 불일치 0 · 프레임이 줄지 않는다', () => {
  const TP = w.MK_TPL;
  const list = TP && TP.list ? TP.list() : [];
  let nText = 0, mismatch = 0, shrunk = 0, wDiff = 0;
  list.forEach((t) => {
    const d = t.doc || t;
    (d.scenes || []).forEach((sc) => {
      const W = sc.width || d.width || 1280, H = sc.height || d.height || 720;
      const ops = R.renderScene(sc, { doc: d }).ops.filter((o) => o.op === 'text');
      let k = 0;
      (sc.elements || []).forEach((el) => {
        if (el.kind !== 'text') return;
        nText++;
        const T = R.layoutOf(el, W, H), op = ops[k++];
        if (!T || !op) return;
        if (op.lines.join('|') !== T.lines.join('|')) mismatch++;
        const f = R.frameOf(el, W, H);
        if (el.h == null && f.h < T.lines.length * T.size * 1.35 * 0.9) shrunk++;
        const real = Math.max(...T.lines.map((l) => R.measure(l, T.size, T.letterSpacing, R.metricsOf(el.font))), 0);
        if (Math.abs(real - T.textW) > 0.02) wDiff++;
      });
    });
  });
  console.log(`  · 템플릿 ${list.length}종 · 텍스트 ${nText}개`);
  ok(mismatch === 0, `창구와 export 불일치 0 (${mismatch})`);
  ok(shrunk === 0, `줄을 못 담는 프레임 0 (${shrunk})`);
  ok(wDiff === 0, `textW 가 실측표와 어긋난 원소 0 (${wDiff})`);
});

console.log(`\nR115  ${pass}/${pass + fail}  ${fail ? '✗ FAIL' : '✓ PASS'}`);
process.exit(fail ? 1 : 0);
