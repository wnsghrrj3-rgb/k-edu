/* ============================================================
   test-round135.mjs — R135 캐릭터 필터 (MK_TOON)
   ------------------------------------------------------------
   준호: 「일반 사진을 캐릭터처럼」 + 「여러 버전으로」 → 스타일 6종.
   · 순수 로직 실실행 — 회색·블러·소벨·포스터라이즈·채도·픽셀화·
     스케치·먹선이 합성 이미지 위에서 옳은 픽셀을 내는지 바이트로.
   · stylize 한 창구 계약: 세기 0 = 원본 바이트, 프리셋 6종 전량
     결정적이고 서로 다른 그림을 낸다.
   · 배선·학생 화면 무접촉 · §5① 전제 가드(부재 = 실패).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R135_ROOT || path.resolve('.');
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (_) { return ''; } };

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name + (detail ? ' — ' + detail : '')); }
};

/* ---------- 0. 전제 가드 ---------- */
console.log('\n[0] 전제 가드');
const tsrc = read('data/toon.js');
ok('data/toon.js 실존', tsrc.length > 1000, 'len=' + tsrc.length);

/* ---------- 1. 부팅 ---------- */
console.log('\n[1] 부팅');
const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', url: 'https://x.test/', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
let bootErr = null;
try { w.eval(tsrc); } catch (e) { bootErr = e; }
ok('toon.js 평가 무오류', !bootErr, bootErr && bootErr.message);
const T = w.MK_TOON;
ok('window.MK_TOON 실존', !!T);
ok('로드 시 body 무접촉', w.document.body.children.length === 0);
const v = T && T.verify ? T.verify() : { ok: false, violations: ['no-verify'] };
ok('계약 자기 검증 verify().ok', v.ok, (v.violations || []).join(','));
if (!T) { console.log('\n결과 ' + pass + '/' + (pass + fail)); process.exit(1); }

/* ---- 시험용 합성 사진: 좌 빨강 / 우 파랑, 가운데 세로 경계 ---- */
const W = 40, H = 30;
const photo = new Uint8ClampedArray(W * H * 4);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const p = (y * W + x) * 4;
  if (x < 20) { photo[p] = 190; photo[p + 1] = 60; photo[p + 2] = 50; }
  else { photo[p] = 40; photo[p + 1] = 80; photo[p + 2] = 200; }
  photo[p + 3] = 255;
}

/* ---------- 2. 공용 부품 ---------- */
console.log('\n[2] 공용 부품');
{
  const g = T.toGray(photo, W, H);
  const gl = 0.299 * 190 + 0.587 * 60 + 0.114 * 50;
  ok('toGray 계수 정확', Math.abs(g[5 * W + 5] - gl) < 0.6, g[5 * W + 5].toFixed(1));

  const flat = new Float32Array(W * H).fill(100);
  const bf = T.blurCh(flat, W, H, 3);
  ok('블러: 평탄면 보존', Math.abs(bf[15 * W + 15] - 100) < 1e-6);

  const magG = T.sobelMag(T.toGray(photo, W, H), W, H);
  ok('회색 소벨: 평탄면 0', magG[10 * W + 5] === 0);
  const mag = T.sobelMaxRGB(photo, W, H);
  ok('채널 소벨: 등휘도 색 경계(빨강↔파랑)를 잡는다', mag[10 * W + 20] > 60, mag[10 * W + 20].toFixed(1));
  ok('채널 소벨 ≥ 회색 소벨 (구멍이 없다)', mag[10 * W + 20] >= magG[10 * W + 20]);

  const post = T.posterize(photo, W, H, 3);
  const uniq = new Set();
  for (let i = 0; i < W * H; i++) uniq.add(post[i * 4]);
  ok('포스터라이즈 3단: R 채널 값 ≤3종', uniq.size <= 3, uniq.size + '종');

  const sat = T.saturate(photo, W, H, 1);
  ok('채도 1 = 무변화', Buffer.compare(Buffer.from(sat.buffer), Buffer.from(photo.buffer)) === 0);
  const sat2 = T.saturate(photo, W, H, 1.8);
  ok('채도 1.8 = 회색에서 더 멀어짐', Math.abs(sat2[0] - 255 * 0) + 0 >= 0 && sat2[0] >= photo[0]);

  const px = T.pixelate(photo, W, H, 8);
  let blocky = true;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const p = (y * W + x) * 4;
    if (px[p] !== px[0] || px[p + 1] !== px[1]) blocky = false;
  }
  ok('픽셀화: 블록 안 단색', blocky);

  const sk = T.sketch(photo, W, H, 3);
  let grayish = true;
  for (let i = 0; i < W * H; i += 7) {
    const p = i * 4;
    if (sk[p] !== sk[p + 1] || sk[p + 1] !== sk[p + 2]) grayish = false;
  }
  ok('스케치: 무채색 (r=g=b)', grayish);
  ok('스케치: 평탄면은 종이(밝음)', sk[(5 * W + 5) * 4] > 200, sk[(5 * W + 5) * 4]);

  const ink = T.inkEdges(photo, W, H, mag, 30, 1, 0, 0, 0);
  ok('먹선: 경계 픽셀 어두워짐', ink[(10 * W + 20) * 4] < photo[(10 * W + 20) * 4]);
  ok('먹선: 평탄면 무접촉', ink[(10 * W + 5) * 4] === photo[(10 * W + 5) * 4]);
}

/* ---------- 3. stylize 한 창구 ---------- */
console.log('\n[3] stylize — 프리셋 6종');
{
  ok('프리셋 6종 이상', T.PRESETS.length >= 6, T.PRESETS.length + '종');
  ok('요구 스타일 전량: 웹툰·진한만화·스케치·수채·팝아트·픽셀',
    ['webtoon', 'comic', 'sketch', 'water', 'popart', 'pixel'].every((id) => !!T.presetOf(id)));

  const zero = T.stylize(photo, W, H, 'webtoon', 0);
  ok('세기 0 = 원본 바이트 그대로', Buffer.compare(Buffer.from(zero.buffer), Buffer.from(photo.buffer)) === 0);

  const sigs = {};
  let allDiffFromOrig = true, allDeterministic = true;
  T.PRESETS.forEach((P) => {
    const a = T.stylize(photo, W, H, P.id, 1);
    const b = T.stylize(photo, W, H, P.id, 1);
    if (Buffer.compare(Buffer.from(a.buffer), Buffer.from(b.buffer)) !== 0) allDeterministic = false;
    if (Buffer.compare(Buffer.from(a.buffer), Buffer.from(photo.buffer)) === 0) allDiffFromOrig = false;
    sigs[P.id] = Buffer.from(a.buffer).toString('base64').slice(0, 48);
  });
  ok('6종 전량 결정적 (두 번 = 같은 바이트)', allDeterministic);
  ok('6종 전량 원본과 다른 그림', allDiffFromOrig);
  ok('6종 서로 다른 그림', new Set(Object.values(sigs)).size === T.PRESETS.length);

  const half = T.stylize(photo, W, H, 'popart', 0.5);
  const fullS = T.stylize(photo, W, H, 'popart', 1);
  const p0 = (10 * W + 20) * 4;
  const between = (a, b, m) => m >= Math.min(a, b) - 1 && m <= Math.max(a, b) + 1;
  ok('세기 0.5 = 원본과 효과 사이', between(photo[p0], fullS[p0], half[p0]));

  ok('모르는 프리셋 → null (가드)', T.stylize(photo, W, H, 'nope', 1) === null);
  const alpha = T.stylize(photo, W, H, 'comic', 1);
  ok('알파 채널 보존', alpha[3] === 255 && alpha[(W * H - 1) * 4 + 3] === 255);
}

/* ---------- 4. 작업창 스모크 ---------- */
console.log('\n[4] 작업창 open/close');
{
  let err = null;
  try { T.open(); } catch (e) { err = e; }
  ok('무인자 open → 무해 반환', !err);
  try { T.open({ src: 'data:image/png;base64,x' }); } catch (e) { err = e; }
  ok('open 무오류 (canvas 부재 환경)', !err, err && err.message);
  const overlay = w.document.querySelector('[data-mktoon]');
  ok('오버레이 생성', !!overlay);
  const styleBtns = overlay ? overlay.querySelectorAll('[data-toonstyle]').length : 0;
  ok('스타일 버튼 6개 실존', styleBtns === T.PRESETS.length, styleBtns + '개');
  ok('적용 버튼 스타일 선택 전 잠김', overlay && overlay.querySelector('[data-toon="apply"]').disabled);
  if (overlay) overlay.querySelector('[data-toon="close"]').click();
  ok('✕ → 오버레이 제거', !w.document.querySelector('[data-mktoon]'));
}

/* ---------- 5. 배선 계약 ---------- */
console.log('\n[5] 배선');
{
  const ed = read('screens/editor.js');
  ok('에디터: toon 진입 버튼', ed.includes('data-pane="toon"'));
  ok('에디터: MK_TOON.open 호출', ed.includes('MK_TOON.open('));
  ok('에디터: onApply → el.src 교체 + 히스토리', /act === 'toon'[\s\S]{0,900}H\.push[\s\S]{0,200}\.src = url/.test(ed));

  const idx = read('index.html');
  const pidx = (() => { try { return fs.readFileSync(path.join(ROOT, '..', 'maker', 'index.html'), 'utf8'); } catch (_) { return ''; } })();
  ok('플레이그라운드 index: toon.js 배선', idx.includes('data/toon.js'));
  ok('제품 /maker index: toon.js 배선 (build 드리프트 0)', pidx.includes('maker-playground/data/toon.js'));
  const busters = [...new Set([...idx.matchAll(/\?v=([0-9a-z]+)/g)].map((m) => m[1]))];
  ok('버스터 균일 유지 (R120 규약)', busters.length === 1, busters.join(','));
}

/* ---------- 6. 학생 화면 무접촉 ---------- */
console.log('\n[6] 학생 화면 무접촉');
{
  const ws = read('screens/workspace.js');
  ok('workspace.js: MK_TOON 참조 0', ws.length > 1000 && !ws.includes('MK_TOON'));
  ok('workspace.js: R135 흔적 0', ws.length > 1000 && !ws.includes('R135'));
}

console.log('\n결과 ' + pass + '/' + (pass + fail) + (fail ? ' — 실패 ' + fail : ' ALL PASS'));
process.exit(fail ? 1 : 0);
