/* ============================================================
   test-round134.mjs — R134 인물 바꾸기 (MK_SEG)
   ------------------------------------------------------------
   준호: 「어떤 이미지에서 특정한 인물을 선택하면 다른 이미지와
   대체할 수 있는 기능」 → 굉장히 정교하고 제대로.
   · 순수 로직을 node 에서 **실제 실행**한다 — 탭 성분·번짐 선택·
     형태 연산·배경 메꿈·합성 3종이 합성 이미지 위에서 옳은 픽셀을
     내는지 바이트로 잰다. 결정성(같은 입력=같은 바이트)도 잰다.
   · 배선 계약: 에디터 진입·index 스크립트·벤더 실존(자체 호스팅).
   · 학생 화면(workspace) 무접촉 — R126 이래 규약.
   · §5① 전제 가드: segment.js 부재(원본) = 통과가 아니라 실패.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R134_ROOT || path.resolve('.');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } };
const stat = (f) => { try { return fs.statSync(path.join(ROOT, f)).size; } catch (_) { return -1; } };

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (detail ? ' — ' + detail : '')); }
};

/* ---------- 0. 전제 가드 — 신계약 실존 (§5①: 부재는 실패다) ---------- */
console.log('\n[0] 전제 가드');
const ssrc = read('data/segment.js');
ok('data/segment.js 실존', ssrc.length > 1000, 'len=' + ssrc.length);

/* ---------- 1. jsdom 부팅 — 로드 시 DOM 무접촉 + 계약 실존 ---------- */
console.log('\n[1] 부팅');
const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', url: 'https://x.test/', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
let bootErr = null;
try { w.eval(ssrc); } catch (e) { bootErr = e; }
ok('segment.js 평가 무오류', !bootErr, bootErr && bootErr.message);
const S = w.MK_SEG;
ok('window.MK_SEG 실존', !!S);
ok('로드 시 body 무접촉', w.document.body.children.length === 0);
const v = S && S.verify ? S.verify() : { ok: false, violations: ['no-verify'] };
ok('계약 자기 검증 verify().ok', v.ok, (v.violations || []).join(','));
if (!S) { console.log('\n결과 ' + pass + '/' + (pass + fail)); process.exit(1); }

/* ---------- 2. 탭 성분 — 두 사람 중 「탭한 그 사람」만 ---------- */
console.log('\n[2] 탭 성분 (tapComponent)');
{
  const W = 20, H = 20, prob = new Uint8Array(W * H);
  const blob = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) prob[y * W + x] = 220; };
  blob(2, 2, 6, 6);        /* 사람 A: 5×5 = 25 */
  blob(12, 12, 16, 16);    /* 사람 B: 5×5 = 25 */
  const a = S.tapComponent(prob, W, H, 4, 4);
  ok('A 탭 → A 만 (25px)', a && a.area === 25);
  ok('A 탭 → B 무포함', a && a.mask[14 * W + 14] === 0);
  const b = S.tapComponent(prob, W, H, 14, 14);
  ok('B 탭 → B 만 (25px)', b && b.area === 25 && b.mask[4 * W + 4] === 0);
  const snap = S.tapComponent(prob, W, H, 9, 4);   /* A 에서 3px 빗나감 — 스냅 */
  ok('빗나간 탭 → 가까운 사람으로 스냅', snap && snap.area === 25 && snap.mask[4 * W + 4] === 255);
  ok('허공 탭 → null (정직)', S.tapComponent(prob, W, H, 9, 18, 128, 1) === null);
}

/* ---------- 3. 번짐 선택 (폴백 완드) ---------- */
console.log('\n[3] 번짐 선택 (magicSelect)');
{
  const W = 20, H = 20, rgba = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) { rgba[i * 4] = 10; rgba[i * 4 + 1] = 10; rgba[i * 4 + 2] = 10; rgba[i * 4 + 3] = 255; }
  for (let y = 5; y <= 12; y++) for (let x = 5; x <= 12; x++) { const p = (y * W + x) * 4; rgba[p] = 200; rgba[p + 1] = 60; rgba[p + 2] = 60; }
  const r = S.magicSelect(rgba, W, H, 8, 8, 30);
  ok('덩어리 정확 선택 (64px)', r && r.area === 64);
  ok('배경 무포함 (강한 경계에서 정지)', r && r.mask[0] === 0 && r.mask[(4 * W + 8)] === 0);
  const all = S.magicSelect(rgba, W, H, 1, 1, 250);
  ok('허용치 최대 → 연결 전체', all && all.area === W * H);
}

/* ---------- 4. 형태 연산 ---------- */
console.log('\n[4] 팽창·침식·페더·브러시');
{
  const W = 15, H = 15, m = new Uint8Array(W * H);
  m[7 * W + 7] = 255;
  const g = S.growMask(m, W, H, 1);
  ok('팽창 r=1: 1px → 3×3', S.maskArea(g, 128) === 9);
  const sh = S.shrinkMask(g, W, H, 1);
  ok('침식 r=1: 3×3 → 1px (왕복 복원)', S.maskArea(sh, 128) === 1 && sh[7 * W + 7] === 255);
  ok('입력 불훼손', S.maskArea(m, 128) === 1);

  const hard = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < 8; x++) hard[y * W + x] = 255;
  const f = S.featherMask(hard, W, H, 2);
  const edge = f[7 * W + 8];
  ok('페더: 경계가 중간값 (0<v<255)', edge > 0 && edge < 255, 'v=' + edge);
  ok('페더: 먼 안쪽은 255 유지', f[7 * W + 1] === 255);

  const bm = new Uint8Array(W * H);
  S.brushStroke(bm, W, H, 2, 7, 12, 7, 2, true);
  let contig = true;
  for (let x = 2; x <= 12; x++) if (bm[7 * W + x] !== 255) contig = false;
  ok('브러시 선: 끊김 없음', contig);
  S.brushStroke(bm, W, H, 2, 7, 12, 7, 3, false);
  ok('빼기 브러시: 지워짐', S.maskArea(bm, 1) === 0);
}

/* ---------- 5. 경계·배율·배치 수학 ---------- */
console.log('\n[5] bounds · scaleMask · fit');
{
  const W = 10, H = 10, m = new Uint8Array(W * H);
  for (let y = 3; y <= 6; y++) for (let x = 2; x <= 7; x++) m[y * W + x] = 255;
  const b = S.maskBounds(m, W, H);
  ok('bbox 정확', b && b.x === 2 && b.y === 3 && b.w === 6 && b.h === 4);
  ok('빈 마스크 → null', S.maskBounds(new Uint8Array(W * H), W, H) === null);

  const up = S.scaleMask(m, W, H, 20, 20);
  const ub = S.maskBounds(up, 20, 20, 128);
  ok('배율 2×: bbox 도 ≈2×', ub && Math.abs(ub.w - 12) <= 2 && Math.abs(ub.h - 8) <= 2, JSON.stringify(ub));

  const cf = S.coverFit(100, 50, 60, 60);
  ok('coverFit: 목적지를 빈틈없이 덮는다', 100 * cf.s >= 60 - 1e-9 && 50 * cf.s >= 60 - 1e-9);
  const nf = S.containFit(100, 50, 60, 60, true);
  ok('containFit: 안에 다 들어간다', 100 * nf.s <= 60 + 1e-9 && 50 * nf.s <= 60 + 1e-9);
  ok('containFit 아래 기준: oy = dh − sh·s', Math.abs(nf.oy - (60 - 50 * nf.s)) < 1e-9);

  const fw = S.fitWork(2000, 1000, 512);
  ok('fitWork: 긴 변 512 로', fw.w === 512 && fw.h === 256);
}

/* ---------- 6. 배경 메꿈 (inpaint) ---------- */
console.log('\n[6] inpaint');
{
  const W = 16, H = 16, base = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4;
    if (x < 8) { base[p] = 200; base[p + 1] = 0; base[p + 2] = 0; }      /* 왼쪽 빨강 */
    else { base[p] = 0; base[p + 1] = 0; base[p + 2] = 200; }            /* 오른쪽 파랑 */
    base[p + 3] = 255;
  }
  const mask = new Uint8Array(W * H);
  for (let y = 4; y <= 11; y++) for (let x = 4; x <= 11; x++) {
    mask[y * W + x] = 255;
    const p = (y * W + x) * 4;                                            /* 구멍을 초록으로 오염 — 덮어씀 증명 */
    base[p] = 0; base[p + 1] = 255; base[p + 2] = 0;
  }
  const out = S.inpaint(base, W, H, mask);
  let outside = true, green = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4;
    if (mask[y * W + x] < 128) {
      for (let c = 0; c < 4; c++) if (out[p + c] !== base[p + c]) outside = false;
    } else if (out[p + 1] > out[p] && out[p + 1] > out[p + 2]) green++;
  }
  ok('구멍 밖 바이트 무접촉', outside);
  ok('구멍 안 초록 잔존 0 (전부 메꿔짐)', green === 0, green + '개');
  const L = (5 * W + 5) * 4, R = (5 * W + 10) * 4;
  ok('왼쪽 구멍 ≈ 빨강 계열', out[L] > out[L + 2]);
  ok('오른쪽 구멍 ≈ 파랑 계열', out[R + 2] > out[R]);
  const out2 = S.inpaint(base, W, H, mask);
  ok('결정성: 두 번 실행 = 같은 바이트', Buffer.compare(Buffer.from(out.buffer), Buffer.from(out2.buffer)) === 0);
  const full = new Uint8Array(W * H).fill(255);
  const guard = S.inpaint(base, W, H, full);
  ok('시드 0 (전면 마스크) → 원본 그대로 (가드)', Buffer.compare(Buffer.from(guard.buffer), Buffer.from(base.buffer)) === 0);
}

/* ---------- 7. 합성 3종 ---------- */
console.log('\n[7] cutout · fillSilhouette · replaceRegion');
{
  const W = 20, H = 20, base = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) { base[i * 4] = 100; base[i * 4 + 1] = 100; base[i * 4 + 2] = 100; base[i * 4 + 3] = 255; }
  const mask = new Uint8Array(W * H);
  for (let y = 5; y <= 14; y++) for (let x = 8; x <= 11; x++) {
    mask[y * W + x] = 255;
    const p = (y * W + x) * 4;                                            /* 「사람」 = 검정 기둥 */
    base[p] = 0; base[p + 1] = 0; base[p + 2] = 0;
  }

  const c = S.cutout(base, W, H, mask, 1);
  ok('오리기: bbox+pad 크기', c && c.w === 6 && c.h === 12, c && (c.w + '×' + c.h));
  ok('오리기: 알파 = 마스크', c && c.data[((5 - 4) * c.w + (8 - 7)) * 4 + 3] === 255 && c.data[3] === 0);

  const rep = new Uint8ClampedArray(4 * 4 * 4);
  for (let i = 0; i < 16; i++) { rep[i * 4] = 255; rep[i * 4 + 1] = 220; rep[i * 4 + 2] = 0; rep[i * 4 + 3] = 255; }
  const fillOut = S.fillSilhouette(base, W, H, mask, rep, 4, 4);
  const inP = (9 * W + 9) * 4, outP = (2 * W + 2) * 4;
  ok('실루엣: 마스크 안 = 대체 사진 색', fillOut[inP] === 255 && fillOut[inP + 1] === 220);
  ok('실루엣: 마스크 밖 무접촉', fillOut[outP] === 100 && fillOut[outP + 3] === 255);

  const mag = new Uint8ClampedArray(3 * 6 * 4);
  for (let i = 0; i < 18; i++) { mag[i * 4] = 230; mag[i * 4 + 1] = 0; mag[i * 4 + 2] = 200; mag[i * 4 + 3] = 255; }
  const sw = S.replaceRegion(base, W, H, mask, mag, 3, 6);
  let blackLeft = 0;
  for (let y = 5; y <= 14; y++) for (let x = 8; x <= 11; x++) {
    const p = (y * W + x) * 4;
    if (sw[p] < 30 && sw[p + 1] < 30 && sw[p + 2] < 30) blackLeft++;
  }
  ok('자리 바꾸기: 원래 사람(검정) 잔존 0', blackLeft === 0, blackLeft + 'px');
  const bottomC = ((14) * W + 9) * 4;                                     /* bbox 아래 기준 — 바닥을 딛는다 */
  ok('자리 바꾸기: 아래 기준으로 대체 착지', sw[bottomC] === 230 && sw[bottomC + 2] === 200);
  ok('자리 바꾸기: 먼 배경 무접촉', sw[0] === 100 && sw[1] === 100);
}

/* ---------- 8. 작업창 스모크 (canvas 없는 jsdom 에서 열고 닫힘) ---------- */
console.log('\n[8] 작업창 open/close');
{
  let err = null;
  try { S.open(); } catch (e) { err = e; }
  ok('무인자 open → 무해 반환', !err);
  try { S.open({ src: 'data:image/png;base64,x', docImages: [] }); } catch (e) { err = e; }
  ok('open 무오류 (canvas 부재 환경)', !err, err && err.message);
  const overlay = w.document.querySelector('[data-mkseg]');
  ok('오버레이 생성', !!overlay);
  const btns = overlay ? ['m-pick', 'm-add', 'm-del', 'a-cut', 'a-erase', 'a-fill', 'a-swap', 'reset', 'close']
    .every((k) => !!overlay.querySelector('[data-seg="' + k + '"]')) : false;
  ok('도구·동작 버튼 전량 실존', btns);
  const actDisabled = overlay ? ['a-cut', 'a-erase', 'a-fill', 'a-swap']
    .every((k) => overlay.querySelector('[data-seg="' + k + '"]').disabled) : false;
  ok('마스크 전 동작 버튼 잠김', actDisabled);
  if (overlay) overlay.querySelector('[data-seg="close"]').click();
  ok('✕ → 오버레이 제거', !w.document.querySelector('[data-mkseg]'));
}

/* ---------- 9. 배선 계약 ---------- */
console.log('\n[9] 배선 — 에디터 · index · 벤더');
{
  const ed = read('screens/editor.js');
  ok('에디터: person-swap 진입 버튼', ed.includes('data-pane="person-swap"'));
  ok('에디터: MK_SEG.open 호출', ed.includes('MK_SEG.open('));
  ok('에디터: onApply → el.src 교체', /onApply[\s\S]{0,220}\.src = url/.test(ed));
  ok('에디터: onCutout → 새 요소 push', /onCutout[\s\S]{0,600}elements\.push/.test(ed));
  ok('에디터: 히스토리 태움 (undo 성립)', /person-swap[\s\S]{0,1600}H\.push/.test(ed));

  const idx = read('index.html');
  const pidx2 = (() => { try { return fs.readFileSync(path.join(ROOT, '..', 'maker', 'index.html'), 'utf8'); } catch (_) { return ''; } })();
  ok('플레이그라운드 index: segment.js 배선', idx.includes('data/segment.js'));
  ok('제품 /maker index: segment.js 배선 (build 드리프트 0)', pidx2.includes('maker-playground/data/segment.js'));

  ok('세그 모듈: 벤더 경로가 자체 호스팅', ssrc.includes("vendor/selfie-seg/"));
  const files = [
    ['vendor/selfie-seg/selfie_segmentation.js', 10000],
    ['vendor/selfie-seg/selfie_segmentation.binarypb', 100],
    ['vendor/selfie-seg/selfie_segmentation.tflite', 100000],
    ['vendor/selfie-seg/selfie_segmentation_landscape.tflite', 100000],
    ['vendor/selfie-seg/selfie_segmentation_solution_simd_wasm_bin.js', 100000],
    ['vendor/selfie-seg/selfie_segmentation_solution_simd_wasm_bin.wasm', 1000000],
    ['vendor/selfie-seg/selfie_segmentation_solution_wasm_bin.js', 100000],
    ['vendor/selfie-seg/selfie_segmentation_solution_wasm_bin.wasm', 1000000],
  ];
  ok('벤더 8파일 실존·크기 정상', files.every(([f, min]) => stat(f) >= min),
    files.map(([f, min]) => path.basename(f) + '=' + stat(f)).join(' '));
  ok('벤더 라이선스 고지 실존', stat('vendor/LICENSE-selfie-segmentation.txt') > 100);
}

/* ---------- 10. 학생 화면 무접촉 (R126 규약) ---------- */
console.log('\n[10] 학생 화면 무접촉');
{
  const ws = read('screens/workspace.js');
  ok('workspace.js: MK_SEG 참조 0', ws.length > 1000 && !ws.includes('MK_SEG'));
  ok('workspace.js: R134 흔적 0', ws.length > 1000 && !ws.includes('R134'));
}

console.log('\n결과 ' + pass + '/' + (pass + fail) + (fail ? ' — 실패 ' + fail : ' ALL PASS'));
process.exit(fail ? 1 : 0);
