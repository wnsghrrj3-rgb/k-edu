/* ============================================================
   probe111.mjs — R110 이 남긴 빚의 실측
   ------------------------------------------------------------
   R110 정직 보고: 「textH 는 개행만 센다. 자동 줄바꿈된 글자는
   상자를 넘친다 — export 가 늘 만들던 그림이지만 화면이 감췄었다.」

   이 탐침이 답할 두 가지:
     ① wrap 판정이 정말 씬 종횡비 ar 하나에만 의존하는가?
        (그렇다면 textH 는 aabb·snap 과 같은 ar 옵트인으로 wrap 을 알 수 있다)
     ② 고치면 기존 씬이 얼마나 흔들리는가? — 실제 템플릿·샘플 전수
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('.');
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

const R = w.MK_RENDER;
console.log('MK_RENDER:', !!R, '| wrap:', typeof (R && R.wrap), '| measure:', typeof (R && R.measure));

/* ── ① 원리: wrap 은 ar 에만 의존하는가 ────────────────────────
   모델은 % 로 산다: 폭 el.w = 씬폭%, 크기 el.size = 씬높이%.
   px 로 내리면 maxW = el.w/100·W, size = el.size/100·H.
   measure 는 size 에 선형이므로 판정 부등식의 양변을 W/100 으로 나누면
   절대 크기가 사라지고 ar = W/H 만 남는다:
       Σ CH_W·el.size/ar ≤ el.w
   즉 '씬 폭 %' 공간에서 size' = el.size/ar 로 재면 같은 결과여야 한다. */
console.log('\n=== ① wrap 은 ar 에만 의존하는가 ===');
const SAMPLES = [
  { text: '오늘 우리는 산과 염기의 성질을 배우고 리트머스 종이로 확인해 봅시다', w: 40, size: 4 },
  { text: 'The quick brown fox jumps over the lazy dog again and again', w: 30, size: 3 },
  { text: '짧은 글', w: 40, size: 6 },
  { text: '가나다라마바사아자차카타파하가나다라마바사아자차카타파하', w: 25, size: 5 },
  { text: '첫 줄입니다\n둘째 줄은 조금 더 길게 써서 넘치게 만들어 봅니다', w: 20, size: 4 },
  { text: 'supercalifragilisticexpialidocious', w: 12, size: 4 },
];
const AR = 16 / 9;
let ok1 = 0, bad1 = 0;
for (const s of SAMPLES) {
  const counts = [];
  for (const [W, H] of [[1280, 720], [1920, 1080], [640, 360], [3840, 2160], [800, 450]]) {
    const maxW = s.w / 100 * W, size = s.size / 100 * H;
    counts.push(R.wrap(s.text, maxW, size, 0).length);
  }
  /* 씬 폭 % 공간 — 절대 크기 없이 ar 만으로 */
  const pct = R.wrap(s.text, s.w, s.size / AR, 0).length;
  const same = counts.every((c) => c === counts[0]);
  const match = pct === counts[0];
  if (same && match) ok1++; else bad1++;
  console.log(`  px줄수[${counts.join(',')}] 일정=${same} | %공간=${pct} 일치=${match} | "${s.text.slice(0, 18)}…"`);
}
console.log(`  → 절대크기 무관·%공간 일치: ${ok1}/${SAMPLES.length}  (불일치 ${bad1})`);

/* ── ② 영향: 실제 씬에서 개행 줄수 vs wrap 줄수 ────────────────── */
console.log('\n=== ② 기존 씬 전수 — 개행 줄수 vs 실제 wrap 줄수 ===');
const nlLines = (t) => String(t == null ? '' : t).split('\n').length;
const wrapLines = (el, ar) => R.wrap(String(el.text == null ? '' : el.text), (el.w || 10),
  (el.size || 3) / ar, ((el.letterSpacing || 0) * (el.size || 3)) / ar).length;

function collectScenes() {
  const out = [];
  const push = (src, scenes) => (scenes || []).forEach((sc, i) => out.push({ src, i, sc }));
  try { (w.MK_TPL && w.MK_TPL.list ? w.MK_TPL.list() : []).forEach((t) => {
    const d = w.MK_TPL.build ? w.MK_TPL.build(t.id) : t;
    push('TPL:' + t.id, (d && d.scenes) || (t && t.scenes));
  }); } catch (e) { console.log('  TPL 수집 실패:', e.message); }
  try { const s = w.MK_SAMPLE; if (s) {
    if (typeof s.doc === 'function') push('SAMPLE', (s.doc() || {}).scenes);
    else if (s.scenes) push('SAMPLE', s.scenes);
    else Object.keys(s).forEach((k) => { const v = s[k]; if (v && v.scenes) push('SAMPLE:' + k, v.scenes); });
  } } catch (e) { console.log('  SAMPLE 수집 실패:', e.message); }
  try { const p = w.MK_PITCH || null; if (p && p.scenes) push('PITCH', p.scenes); } catch (e) {}
  return out;
}
const scenes = collectScenes();
console.log(`  씬 ${scenes.length}개 수집`);

const arList = [16 / 9];
let nText = 0, nDiff = 0; const worst = [];
for (const { src, i, sc } of scenes) {
  for (const el of (sc.elements || [])) {
    if (el.kind !== 'text') continue;
    if (el.h != null) continue;                 /* h 가 있으면 모델이 이미 정본 */
    nText++;
    const a = nlLines(el.text), b = wrapLines(el, arList[0]);
    if (b !== a) { nDiff++; worst.push({ src, i, a, b, t: String(el.text || '').slice(0, 26), w: el.w, size: el.size }); }
  }
}
worst.sort((x, y) => (y.b - y.a) - (x.b - x.a));
console.log(`  h 없는 텍스트 요소 ${nText}개 중 줄수가 달라지는 것: ${nDiff}개 (${nText ? (nDiff / nText * 100).toFixed(1) : 0}%)`);
for (const x of worst.slice(0, 12)) {
  console.log(`    ${x.a}→${x.b}줄  w=${x.w} size=${x.size}  [${x.src}#${x.i}]  "${x.t}"`);
}

/* ── ③ export 내부 모순: frameOf 높이 vs layoutText 가 실제로 그린 줄 ── */
console.log('\n=== ③ export 자기모순 — 프레임이 담는 줄수 vs 실제 그린 줄수 ===');
let over = 0, clipLoss = 0;
for (const { src, i, sc } of scenes) {
  for (const el of (sc.elements || [])) {
    if (el.kind !== 'text' || el.h != null) continue;
    const W = 1280, H = 720;
    const size = (el.size || 3) * H / 100;
    const h = Math.max(size * 1.5, size * 1.4 * nlLines(el.text));
    const box = { x: 0, y: 0, w: (el.w || 10) * W / 100, h };
    const T = R.layoutText({ ...el, sizePx: size }, box, () => {});
    const drawn = T.lines.length * T.size * T.lineHeight;
    if (drawn > box.h + T.size * 0.4) {
      over++;
      const ov = (el.overflow || 'visible');
      if (ov === 'clip' || ov === 'ellipsis') clipLoss++;
    }
  }
}
console.log(`  프레임을 넘겨 그리는 텍스트: ${over}개 / ${nText}`);
console.log(`  그중 overflow=clip|ellipsis 라 실제로 글자가 잘려 사라지는 것: ${clipLoss}개`);

/* ── ④ 두 세계에 같은 씬을 통과시킨다 — 결함을 실물로 ──────────────
   좁은 상자에 긴 글, overflow=ellipsis. 프레임 높이가 곧 maxLines 이므로
   높이를 개행으로만 잰 세계에서는 실제로 글자가 사라진다. */
console.log('\n=== ④ 같은 씬, 두 세계 — 사라지는 글자 ===');
{
  const el = { kind: 'text', x: 6, y: 20, w: 26, size: 3.4, overflow: 'ellipsis',
    text: '산성 용액은 푸른 리트머스 종이를 붉게 변화시키고 염기성 용액은 붉은 리트머스 종이를 푸르게 변화시킵니다' };
  const scene = { id: 's', width: 1280, height: 720, elements: [el] };   /* 실픽셀 — 비율은 16:9 그대로 */
  const page = R.renderScene(scene, {});
  const op = (page.ops || []).find((o) => o.op === 'text');
  /* frameOf 는 새 세계에만 노출돼 있다 — 두 세계가 공유하는 renderScene 결과만 읽는다 */
  const f = op ? op.frame : { w: 0, h: 0 };
  const full = R.wrap(String(el.text), f.w, el.size * 720 / 100, 0).length;
  const drawnChars = op ? op.lines.join('').replace(/…/g, '').length : 0;
  console.log(`  프레임 h = ${f.h.toFixed(1)}px  (= ${(f.h / (el.size * 720 / 100 * 1.35)).toFixed(2)} 줄분)`);
  console.log(`  이 글의 실제 줄 수 = ${full}줄`);
  console.log(`  export 가 그린 줄 = ${op ? op.lines.length : 0}줄`);
  console.log(`  살아남은 글자 = ${drawnChars} / 원문 ${String(el.text).length}자`);
  if (op && op.lines.length) console.log(`  마지막 줄: "${op.lines[op.lines.length - 1]}"`);
}
