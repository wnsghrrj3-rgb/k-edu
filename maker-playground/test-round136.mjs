/* ============================================================
   test-round136.mjs — R136 크로마키 (MK_CHROMA)
   ------------------------------------------------------------
   준호: 「케이메이커에 크로마키 기능 — 사진 같은 거 활용」.
   · 순수 로직 실실행 — 합성 이미지(초록 배경 + 살구 인물 + 스필
     테두리) 위에서 keyOut 이 옳은 알파·옳은 스필 제거를 내는지
     바이트로 잰다. 흰 벽·파랑·콕 찍기 색까지 3대장 전부.
   · 결정성: 같은 입력 = 같은 바이트. 원본 버퍼 무훼손.
   · 자동 키색: 모서리 다수파가 인물(중앙)에 안 속는지.
   · 배선 계약: 에디터 진입·index 스크립트 2곳·학생 화면 무접촉.
   · §5① 전제 가드: chroma.js 부재 = 통과가 아니라 실패.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R136_ROOT || path.resolve('.');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } };

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (detail ? ' — ' + detail : '')); }
};

/* ---------- 0. 전제 가드 ---------- */
console.log('\n[0] 전제 가드');
const csrc = read('data/chroma.js');
ok('data/chroma.js 실존', csrc.length > 1000, 'len=' + csrc.length);

/* ---------- 1. 부팅 ---------- */
console.log('\n[1] 부팅');
const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', url: 'https://x.test/', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
let bootErr = null;
try { w.eval(csrc); } catch (e) { bootErr = e; }
ok('chroma.js 평가 무오류', !bootErr, bootErr && bootErr.message);
const C = w.MK_CHROMA;
ok('window.MK_CHROMA 실존', !!C);
ok('로드 시 body 무접촉', w.document.body.children.length === 0);
const v = C && C.verify ? C.verify() : { ok: false, violations: ['no-verify'] };
ok('verify 통과', v.ok, (v.violations || []).join(','));

/* ---------- 2. 합성 이미지 — 초록 배경 + 살구 사각 인물 + 스필 테두리 ---------- */
console.log('\n[2] 초록 키잉 — 알파·스필·결정성');
const W = 40, H = 40;
const mk = () => {
  const b = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4;
    let r = 40, g = 190, b2 = 70;                       /* 초록 배경 */
    const inBody = x >= 12 && x < 28 && y >= 12 && y < 28;
    const inRim = !inBody && x >= 11 && x < 29 && y >= 11 && y < 29;
    if (inBody) { r = 230; g = 180; b2 = 160; }          /* 살구 인물 */
    if (inRim) { r = 150; g = 210; b2 = 140; }           /* 초록 물든 테두리(스필) */
    b[p] = r; b[p + 1] = g; b[p + 2] = b2; b[p + 3] = 255;
  }
  return b;
};
const src = mk();
const srcCopy = new Uint8ClampedArray(src);
const out = C.keyOut(src, W, H, { color: [40, 190, 70], tol: 35, soft: 30, spill: true });
const at = (buf, x, y) => { const p = (y * W + x) * 4; return [buf[p], buf[p + 1], buf[p + 2], buf[p + 3]]; };

ok('배경 픽셀 알파 0', at(out, 2, 2)[3] === 0, 'a=' + at(out, 2, 2)[3]);
ok('인물 픽셀 알파 255', at(out, 20, 20)[3] === 255, 'a=' + at(out, 20, 20)[3]);
const rim = at(out, 11, 20);
ok('스필 제거 — 테두리 g ≤ (r+b)/2', rim[3] === 0 || rim[1] <= (rim[0] + rim[2]) / 2 + 1, 'rgba=' + rim.join(','));
const body = at(out, 20, 20);
ok('인물 색 보존(스필 클램프 비발동 — g<(r+b)/2)', body[0] === 230 && body[1] === 180 && body[2] === 160, body.join(','));
ok('원본 버퍼 무훼손', src.every((x, i) => x === srcCopy[i]));
const out2 = C.keyOut(src, W, H, { color: [40, 190, 70], tol: 35, soft: 30, spill: true });
ok('결정성 — 같은 입력 = 같은 바이트', out.every((x, i) => x === out2[i]));

/* 부드러움 램프 — soft 를 올리면 중간 알파 픽셀이 생긴다 */
const grad = new Uint8ClampedArray(W * H * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = (y * W + x) * 4;
  const t = x / (W - 1);                                 /* 초록 → 살구 가로 그라데이션 */
  grad[p] = 40 + t * 190; grad[p + 1] = 190 - t * 10; grad[p + 2] = 70 + t * 90; grad[p + 3] = 255;
}
const gOut = C.keyOut(grad, W, H, { color: [40, 190, 70], tol: 30, soft: 80, spill: false });
let mid = 0;
for (let i = 3; i < gOut.length; i += 4) if (gOut[i] > 10 && gOut[i] < 245) mid++;
ok('부드러움 — 중간 알파 밴드 실존', mid > 20, 'mid=' + mid);

/* ---------- 3. 3대장 — 흰 벽·파랑·콕 찍기 ---------- */
console.log('\n[3] 흰 벽·파랑·임의 색');
const wall = new Uint8ClampedArray(W * H * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = (y * W + x) * 4;
  const inBody = x >= 12 && x < 28 && y >= 12 && y < 28;
  const c = inBody ? [200, 60, 50] : [246, 244, 242];    /* 흰 벽 + 빨강 옷 */
  wall[p] = c[0]; wall[p + 1] = c[1]; wall[p + 2] = c[2]; wall[p + 3] = 255;
}
const wOut = C.keyOut(wall, W, H, { color: [245, 245, 245], tol: 35, soft: 30, spill: true });
ok('흰 벽 알파 0 (무채색 키 = 밝기 가중 ↑)', at(wOut, 2, 2)[3] === 0, 'a=' + at(wOut, 2, 2)[3]);
ok('빨강 옷 생존', at(wOut, 20, 20)[3] === 255, 'a=' + at(wOut, 20, 20)[3]);
const wp = C.keyParams([245, 245, 245]);
ok('무채색 키 = 스필 생략(dom=-1)', wp.dom === -1, 'dom=' + wp.dom);

const blue = C.keyOut(mkColor([40, 90, 210], [235, 200, 90]), W, H, { color: [40, 90, 210], tol: 35, soft: 30, spill: true });
function mkColor(bg, fg) {
  const b = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4;
    const inBody = x >= 12 && x < 28 && y >= 12 && y < 28;
    const c = inBody ? fg : bg;
    b[p] = c[0]; b[p + 1] = c[1]; b[p + 2] = c[2]; b[p + 3] = 255;
  }
  return b;
}
ok('파랑 배경 알파 0', at(blue, 2, 2)[3] === 0);
ok('노랑 인물 생존', at(blue, 20, 20)[3] === 255);

/* 콕 찍기 상당 — 임의 보라 배경도 그 색을 키로 주면 지워진다 */
const pur = C.keyOut(mkColor([150, 60, 200], [80, 200, 120]), W, H, { color: [150, 60, 200], tol: 35, soft: 30, spill: true });
ok('임의 색(보라) 키잉', at(pur, 2, 2)[3] === 0 && at(pur, 20, 20)[3] === 255);

/* ---------- 4. 자동 키색 — 모서리 다수파 ---------- */
console.log('\n[4] 자동 키색');
const auto = C.sampleAuto(src, W, H);
const d = Math.hypot(auto[0] - 40, auto[1] - 190, auto[2] - 70);
ok('네 모서리 → 초록 복원', d < 12, 'got=' + auto.join(',') + ' d=' + d.toFixed(1));
ok('기존 알파와 곱 — 반투명 입력 보존', (() => {
  const half = new Uint8ClampedArray(src); 
  const p = (20 * W + 20) * 4; half[p + 3] = 128;        /* 인물 한 픽셀만 반투명 */
  const o = C.keyOut(half, W, H, { color: [40, 190, 70], tol: 35, soft: 30 });
  return o[p + 3] === 128;
})());

/* ---------- 5. 험한 조건 — 조명 그라데이션 48% + 노이즈 ±9 + 2px 가닥 ---------- */
console.log('\n[5] 험한 조건 (실사진 근사)');
{
  const HW = 120, HH = 120;
  const hb = new Uint8ClampedArray(HW * HH * 4);
  let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) {
    const p = (y * HW + x) * 4;
    const shade = 1 - (y / HH) * 0.48;                  /* 위 밝고 아래 그늘 */
    let r = 38 * shade + (rnd() - .5) * 18, g = 200 * shade + (rnd() - .5) * 18, b2 = 66 * shade + (rnd() - .5) * 18;
    const inBody = x >= 40 && x < 80 && y >= 40 && y < 100;
    const inHair = y >= 20 && y < 40 && ((x >= 50 && x < 52) || (x >= 60 && x < 62) || (x >= 70 && x < 72));
    if (inBody) { r = 225; g = 178; b2 = 158; }
    if (inHair) { r = 92; g = 64; b2 = 40; }
    hb[p] = r; hb[p + 1] = g; hb[p + 2] = b2; hb[p + 3] = 255;
  }
  const key = C.sampleAuto(hb, HW, HH);
  const hOut = C.keyOut(hb, HW, HH, { color: key, tol: 35, soft: 30, spill: true });
  const ha = (x, y) => hOut[(y * HW + x) * 4 + 3];
  let bgLeak = 0, bodyLoss = 0, hairLoss = 0;
  for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) {
    const inBody = x >= 40 && x < 80 && y >= 40 && y < 100;
    const inHair = y >= 20 && y < 40 && ((x >= 50 && x < 52) || (x >= 60 && x < 62) || (x >= 70 && x < 72));
    const edge = !inBody && !inHair && x >= 38 && x < 82 && y >= 18 && y < 102;
    if (inBody) { if (ha(x, y) < 200) bodyLoss++; }
    else if (inHair) { if (ha(x, y) < 128) hairLoss++; }
    else if (!edge) { if (ha(x, y) > 40) bgLeak++; }
  }
  ok('그늘 배경 잔존 0 (조명 적응 wY)', bgLeak === 0, 'leak=' + bgLeak);
  ok('인물 침식 0 (노이즈 내성)', bodyLoss === 0, 'loss=' + bodyLoss);
  ok('2px 가닥 생존 (가는 선)', hairLoss === 0, 'loss=' + hairLoss);
}

/* ---------- 6. 작업창 스모크 — open() 실부팅 (캔버스 없는 jsdom에서도 안 죽는다) ---------- */
console.log('\n[6] 작업창 스모크');
{
  C.open({ src: 'data:image/png;base64,x' });
  const root = w.document.querySelector('[data-mkchroma]');
  ok('작업창 루트 실존', !!root);
  ok('칩 4종 실렌더', root && root.querySelectorAll('[data-ckchip]').length === 4);
  ok('🎯 콕 찍기·슬라이더 2·스필 토글 실렌더', root && !!root.querySelector('[data-ck="pick"]') && !!root.querySelector('[data-ck="tol"]') && !!root.querySelector('[data-ck="soft"]') && !!root.querySelector('[data-ck="spill"]'));
  ok('적용 버튼 — 키색 확정 전 disabled', root && root.querySelector('[data-ck="apply"]').disabled === true);
  if (root) root.querySelector('[data-ck="close"]').onclick();
  ok('닫기 = DOM 소거·body 청정', !w.document.querySelector('[data-mkchroma]') && w.document.body.children.length === 0);
}

/* ---------- 7. 배선 계약 ---------- */
console.log('\n[7] 배선 계약');
const ed = read('screens/editor.js');
ok('에디터 진입 버튼(data-pane="chroma")', ed.includes('data-pane="chroma"'));
ok('에디터 핸들러 — MK_CHROMA.open', ed.includes('MK_CHROMA.open'));
ok('에디터 — src 교체가 전부(t3.src = url)', /t3\.src = url/.test(ed));
ok('maker/index.html 스크립트 배선', read('../maker/index.html').includes('data/chroma.js'));
ok('playground index.html 스크립트 배선', read('index.html').includes('data/chroma.js'));
const ws = read('screens/workspace.js');
ok('학생 화면(workspace) 무접촉', !ws.includes('MK_CHROMA'));

/* ---------- 결과 ---------- */
console.log('\n════════════════════════════════');
console.log('R136 크로마키: ' + pass + ' 통과 / ' + fail + ' 실패');
process.exit(fail ? 1 : 0);
