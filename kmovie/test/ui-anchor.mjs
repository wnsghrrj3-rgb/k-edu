// 케이무비 — 부품 제 층(뚫린 글자 안에 촬영본이 남는가) · 초점(기준점) 9곳 · 가로/세로 · 크기 25~300 검증.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-anchor.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8771);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
process.env.KMV_PORT = String(PORT);
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KM_PARTS && window.KMV_PARTS);

/* 공용: "촬영본" = 마젠타 꽉 채운 캔버스 위에 카드 한 장을 그리고 픽셀을 본다 */
const R = await page.evaluate(() => {
  const W = 960, H = 540, PT = KMV_PARTS, FPS = KMV_PROJECT.FPS, theme = KMV_PROJECT.data.theme;
  const cv = new OffscreenCanvas(W, H), ctx = cv.getContext('2d');
  const video = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#ff00ff'; ctx.fillRect(0, 0, W, H); };
  const px = (x, y) => Array.from(ctx.getImageData(x | 0, y | 0, 1, 1).data);
  const isMag = c => c[3] > 250 && c[0] > 200 && c[1] < 60 && c[2] > 200;
  const holeStats = () => { // 마젠타(뚫린 곳) 픽셀의 개수·무게중심·가로 폭
    const d = ctx.getImageData(0, 0, W, H).data; let cnt = 0, sx = 0, sy = 0, minx = W, maxx = 0;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const i = (y * W + x) * 4; if (d[i + 3] > 250 && d[i] > 200 && d[i + 1] < 60 && d[i + 2] > 200) { cnt++; sx += x; sy += y; if (x < minx) minx = x; if (x > maxx) maxx = x; } }
    return { cnt, cx: cnt ? sx / cnt : -1, cy: cnt ? sy / cnt : -1, w: cnt ? maxx - minx : 0 };
  };
  const draw = card => { video(); PT.drawCard(ctx, W, H, Object.assign({ id: 'x', at: 0, dur: 5 * FPS, p: KM_PARTS.defaults(card.part) }, card), Math.round(2.4 * FPS), theme); };
  const out = {};
  // 1. 뚫린 글자 — 홀드 시각: 글자 안(화면 중앙 근처)은 마젠타, 모서리는 덮개(불투명·마젠타 아님)
  draw({ part: 'knockout' });
  const base = holeStats(); out.kBase = base; out.kCorner = px(8, 8); out.kAlphaAll = (() => { const d = ctx.getImageData(0, 0, W, H).data; let t = 0; for (let i = 3; i < d.length; i += 4 * 97) if (d[i] < 250) t++; return t; })();
  // 2. 크기 200% → 마젠타(뚫린 곳) 폭이 더 넓다, 덮개는 여전히 모서리까지 꽉
  draw({ part: 'knockout', size: 200 }); out.kBig = holeStats(); out.kBigCorner = px(8, 8);
  draw({ part: 'knockout', size: 25 }); out.kSmall = holeStats();
  // 3. 초점 ↖ → 뚫린 곳 무게중심이 왼쪽 위로, ↘ → 오른쪽 아래로; 가로/세로 미세도 움직인다
  draw({ part: 'knockout', anchor: 'tl' }); out.kTL = holeStats();
  draw({ part: 'knockout', anchor: 'br' }); out.kBR = holeStats();
  draw({ part: 'knockout', x: 30 }); out.kX = holeStats();
  draw({ part: 'knockout', y: -30 }); out.kY = holeStats();
  // 4. 도장 스탬프 — 잉크 뜯김(destination-out)이 촬영본을 지우지 않는다: 스탬프 영역 안에 알파 0 픽셀이 없다
  draw({ part: 'stamp' }); { const d = ctx.getImageData(0, 0, W, H).data; let holes = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 250) holes++; out.stampHoles = holes; }
  // 5. 흐르는 글자(sweep) — 초점 ↑ 이면 글자가 위쪽 띠에, ↓ 이면 아래쪽 띠에; 크기 200% 는 글자가 더 크다
  const inkRows = () => { const d = ctx.getImageData(0, 0, W, H).data; let top = 0, bot = 0, cnt = 0, sy = 0; for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 3) { const i = (y * W + x) * 4; if (!(d[i] > 200 && d[i + 1] < 60 && d[i + 2] > 200)) { cnt++; sy += y; if (y < H * 0.4) top++; else if (y > H * 0.6) bot++; } } return { cnt, top, bot, cy: cnt ? sy / cnt : -1 }; };
  const drawSweep = card => { video(); PT.drawCard(ctx, W, H, Object.assign({ id: 'x', at: 0, dur: 8 * FPS, p: KM_PARTS.defaults('sweep'), cut: false }, card), Math.round(4 * FPS), theme); };
  drawSweep({ part: 'sweep' }); out.sMid = inkRows();
  drawSweep({ part: 'sweep', anchor: 't' }); out.sTop = inkRows();
  drawSweep({ part: 'sweep', anchor: 'b' }); out.sBot = inkRows();
  drawSweep({ part: 'sweep', size: 200 }); out.sBig = inkRows();
  // 6. 보통 부품(오프닝)은 바깥 변환: 초점이 축 — k.frame 이 받는 ctx 변환을 훔쳐 본다
  const cap = []; const orig = KM_PARTS.frame; KM_PARTS.frame = function (id, c) { cap.push(c.getTransform()); return orig.apply(this, arguments); };
  try {
    draw({ part: 'opening' }); draw({ part: 'opening', anchor: 'tl', size: 150 }); draw({ part: 'opening', anchor: 'br', size: 50, x: 10, y: -10 });
  } finally { KM_PARTS.frame = orig; }
  out.o = cap.map(m => [m.a, m.d, m.e, m.f]);
  out.oExp = { tl: [0.5 * -W * 0.12, 0.5 * -H * 0.16], br: [W * 0.88 * 0.5 + W * 0.1, H * 0.84 * 0.5 - H * 0.1] };
  out.anchors = PT.ANCHORS.length; out.sizeRange = [PT.SIZE_MIN, PT.SIZE_MAX];
  return out;
});
ok(R.kBase.cnt > 200 && R.kBase.cx > 0, `뚫린 글자: 글자 안에 촬영본(마젠타)이 보인다 (뚫린 픽셀 ${R.kBase.cnt})`);
ok(R.kCorner[3] === 255 && !(R.kCorner[0] > 200 && R.kCorner[2] > 200), '뚫린 글자: 모서리는 덮개(불투명, 촬영본 아님)');
ok(R.kAlphaAll === 0, '뚫린 글자: 투명 픽셀 0 — destination-out 이 아래 촬영본을 지우지 않는다');
ok(R.kBig.w > R.kBase.w * 1.6 && R.kBigCorner[3] === 255 && !(R.kBigCorner[0] > 200 && R.kBigCorner[2] > 200), `크기 200%: 뚫린 폭 ${R.kBase.w}→${R.kBig.w}, 덮개는 여전히 꽉`);
ok(R.kSmall.w < R.kBase.w * 0.5 && R.kSmall.cnt > 20, `크기 25%: 뚫린 폭 ${R.kSmall.w} (작아도 보임)`);
ok(R.kTL.cx < R.kBase.cx - 150 && R.kTL.cy < R.kBase.cy - 100, `초점 ↖: 글자 무게중심 (${R.kBase.cx | 0},${R.kBase.cy | 0}) → (${R.kTL.cx | 0},${R.kTL.cy | 0})`);
ok(R.kBR.cx > R.kBase.cx + 150 && R.kBR.cy > R.kBase.cy + 100, `초점 ↘: (${R.kBR.cx | 0},${R.kBR.cy | 0})`);
ok(R.kX.cx > R.kBase.cx + 200 && Math.abs(R.kX.cy - R.kBase.cy) < 12, `가로 +30 → 오른쪽으로 ${(R.kX.cx - R.kBase.cx) | 0}px`);
ok(R.kY.cy < R.kBase.cy - 100 && Math.abs(R.kY.cx - R.kBase.cx) < 12, `세로 −30 → 위로 ${(R.kBase.cy - R.kY.cy) | 0}px`);
ok(R.stampHoles === 0, '도장 스탬프: 잉크 뜯김이 촬영본에 구멍을 내지 않는다');
ok(R.sMid.cnt > 100 && R.sTop.top > R.sTop.bot * 4 && R.sTop.cy < R.sMid.cy - 60, `흐르는 글자 초점 ↑: 글자가 위쪽 (cy ${R.sMid.cy | 0}→${R.sTop.cy | 0})`);
ok(R.sBot.bot > R.sBot.top * 4 && R.sBot.cy > R.sMid.cy + 60, `흐르는 글자 초점 ↓: 글자가 아래쪽 (cy ${R.sBot.cy | 0})`);
ok(R.sBig.cnt > R.sMid.cnt * 1.5, `흐르는 글자 크기 200%: 잉크 ${R.sMid.cnt}→${R.sBig.cnt}`);
const near = (a, b) => Math.abs(a - b) < 0.5;
ok(R.o[0][0] === 1 && R.o[0][2] === 0 && R.o[0][3] === 0, '보통 부품(오프닝): 초점 없이 크기 100 이면 변환 없음(예전 그대로)');
ok(near(R.o[1][0], 1.5) && near(R.o[1][2], R.oExp.tl[0]) && near(R.o[1][3], R.oExp.tl[1]), `보통 부품 초점 ↖ + 150%: 왼쪽 위가 축 (e ${R.o[1][2].toFixed(1)}, f ${R.o[1][3].toFixed(1)})`);
ok(near(R.o[2][0], 0.5) && near(R.o[2][2], R.oExp.br[0]) && near(R.o[2][3], R.oExp.br[1]), `보통 부품 초점 ↘ + 50% + 가로 10·세로 −10: 오른쪽 아래가 축 + 평행 이동`);
ok(R.anchors === 9 && R.sizeRange[0] === 0.25 && R.sizeRange[1] === 3, '초점 9곳 · 크기 25~300%');

/* 설정 열 UI — 초점 seg 9칸·자동·가로/세로 슬라이더 → 카드 모델·복원 */
const U = await page.evaluate(async () => {
  const P = KMV_PROJECT, $ = id => document.getElementById(id), vis = id => { const e = $(id); return !!e && e.getClientRects().length > 0; };
  const A = P.addP({ part: 'knockout', at: 0 }); KMV_UI.selectP(A.id);
  const segN = $('partAnchorSeg').children.length, shown = vis('partAnchorSeg') && vis('partX') && vis('partY') && vis('btnPartAnchorAuto');
  const autoOn0 = $('btnPartAnchorAuto').classList.contains('on');
  $('partAnchorSeg').querySelector('[data-k=tr]').click(); const a1 = P.part(A.id).anchor, on1 = $('partAnchorSeg').querySelector('[data-k=tr]').classList.contains('on'), autoOn1 = $('btnPartAnchorAuto').classList.contains('on');
  $('partAnchorSeg').querySelector('[data-k=tr]').click(); const a2 = P.part(A.id).anchor;   // 같은 칸 다시 = 자동
  $('partAnchorSeg').querySelector('[data-k=bl]').click(); $('btnPartAnchorAuto').click(); const a3 = P.part(A.id).anchor;
  const sx = $('partX'); sx.value = 25; sx.dispatchEvent(new Event('input')); sx.dispatchEvent(new Event('change'));
  const sy = $('partY'); sy.value = -15; sy.dispatchEvent(new Event('input')); sy.dispatchEvent(new Event('change'));
  const ss = $('partSize'); ss.value = 260; ss.dispatchEvent(new Event('input')); ss.dispatchEvent(new Event('change'));
  const c = P.part(A.id);
  $('partAnchorSeg').querySelector('[data-k=l]').click();
  const undo1 = P.undo(); const afterUndo = P.part(A.id).anchor;
  const sizeMax = +ss.max, sizeMin = +ss.min, xMin = +sx.min;
  return { segN, shown, autoOn0, a1, on1, autoOn1, a2, a3, x: c.x, y: c.y, size: c.size, undo1, afterUndo, sizeMax, sizeMin, xMin, id: A.id };
});
ok(U.shown && U.segN === 9, '부품 고르면 설정 열에 초점 9칸·자동·가로·세로');
ok(U.autoOn0 && U.a1 === 'tr' && U.on1 && !U.autoOn1, '초점 ↗ 클릭 → 카드 anchor, 칸 켜짐, 자동 꺼짐');
ok(U.a2 == null && U.a3 == null, '같은 칸 다시 클릭 · 「자동」= 초점 해제');
ok(U.x === 25 && U.y === -15 && U.size === 260, '가로·세로·크기 슬라이더 → 카드 (x 25 · y −15 · size 260)');
ok(U.undo1 && U.afterUndo == null, '초점 바꾸기는 undo 로 되돌아간다');
ok(U.sizeMax === 300 && U.sizeMin === 25 && U.xMin === -40, '크기 슬라이더 25~300 · 가로 ±40');
await page.waitForTimeout(900);
const S = await page.evaluate(async id => { const r = await KMV_STORE.local.get(KMV_UI.proj.id); const p = r.doc.P.find(x => x.id === id); return p ? { x: p.x, y: p.y, size: p.size } : null; }, U.id);
ok(S && S.x === 25 && S.y === -15 && S.size === 260, '작업 파일에 가로·세로·크기가 저장된다');

/* 미리보기 경로(compose)에서도 제 층 — 실제 스테이지 캔버스에서 뚫린 글자 안이 검정이 아니다 */
const V = await page.evaluate(async () => {
  const P = KMV_PROJECT; P.data.P.forEach(x => P.removeP(x.id));
  const cv = document.createElement('canvas'); cv.width = 480; cv.height = 270; const ctx = cv.getContext('2d');
  // 타임라인이 비어 있을 때의 emptyFrame 은 검정 위에 부품 — 그 경로도 제 층을 타므로 알파는 전부 255 여야 한다
  const A = P.addP({ part: 'knockout', at: 0, dur: 150 });
  KMV_RENDER.draw(ctx, 480, 270, 70);
  const d = ctx.getImageData(0, 0, 480, 270).data; let tr = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 250) tr++;
  P.removeP(A.id);
  return { tr };
});
ok(V.tr === 0, 'KMV_RENDER.draw 경로: 뚫린 글자 프레임에 투명 픽셀 0');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);
