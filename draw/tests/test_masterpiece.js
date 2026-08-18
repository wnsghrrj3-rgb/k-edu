/* ============================================================
   test_masterpiece.js — 케이아트 명화 도안 엔진(KMP) 순수 로직
   합성 격자에서: 팔레트 스냅 → 라벨링 → 병합 → 테두리 추적 →
   단순화·부드럽게 → 번호 위치까지 전 구간 검증.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'masterpiece', 'index.html'), 'utf8');
const m = html.match(/window\.KMP = \(function\(\)\{[\s\S]*?\n\}\)\(\);/);
if (!m) { console.log('KMP 블록 없음'); process.exit(1); }
const w = {};
new Function('window', m[0])(w);
const K = w.KMP;

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
}

/* ── 합성 격자: 24×24, 왼쪽 색0 / 오른쪽 색1 / 가운데 2×2 얼룩(색2) ── */
const W = 24, H = 24;
const rgba = new Uint8ClampedArray(W * H * 4);
const PAL = [[255, 0, 0], [0, 0, 255], [0, 255, 0]];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const q = (y * W + x) * 4;
  let c = x < 12 ? PAL[0] : PAL[1];
  if (x >= 11 && x <= 12 && y >= 11 && y <= 12) c = PAL[2]; /* 얼룩 */
  rgba[q] = c[0]; rgba[q + 1] = c[1]; rgba[q + 2] = c[2]; rgba[q + 3] = 255;
}

console.log('[1] 팔레트 스냅');
const idx = K.snapImage(rgba, W, H, PAL);
t('픽셀 수 일치', idx.length === W * H);
t('왼쪽=0 오른쪽=1', idx[0] === 0 && idx[23] === 1);
t('얼룩=2', idx[11 * W + 11] === 2);

console.log('[2] 영역 라벨링');
const lab = K.labelRegions(idx, W, H);
t('영역 3개', lab.count === 3);
t('넓이 합=전체', lab.regionArea.reduce((a, b) => a + b, 0) === W * H);
t('얼룩 넓이 4', lab.regionArea.some(a => a === 4));

console.log('[3] 작은 영역 병합');
const merged = K.mergeRegions(lab, PAL, { W, H, minArea: 6, target: 99 });
t('얼룩 흡수 → 2개', merged.count === 2);
t('색 보존', merged.color[0] !== merged.color[1]);
t('넓이 보존', merged.area[0] + merged.area[1] === W * H);

console.log('[4] 테두리 추적');
const loops = K.traceAll(merged.flabels, W, H, merged.count);
t('영역마다 루프 존재', loops.every(l => l.length >= 1));
const L = loops[0][0];
t('루프 꼭짓점 정수 격자', L.every(v => v === Math.floor(v)));
t('둘레 충분', L.length / 2 >= (W + 12) * 2 - 4);

console.log('[5] 단순화·부드럽게·경로');
const simp = K.rdp(L, 0.75);
t('단순화로 점 감소', simp.length < L.length);
const smooth = K.chaikin(simp);
t('체이킨 2배 점', smooth.length === simp.length * 2);
const d = K.loopsToPath(loops[0], 0.75);
t('경로 M…Z 형식', /^M[\d. ]+/.test(d) && d.endsWith('Z'));

console.log('[6] 번호 위치(POI)');
const poi = K.computePOI(merged.flabels, W, H, merged.count);
t('모든 영역 POI 확보', Array.from(poi.best).every(p => p >= 0));
t('POI는 제 영역 안', Array.from(poi.best).every((p, r) => merged.flabels[p] === r));
t('안쪽 거리 > 1', Array.from(poi.bd).every(v => v > 1));

console.log('[7] 사진 팔레트(k-means)');
const pal2 = K.kmeans(rgba, W, H, 3);
t('색 3개 추출', pal2.length === 3);
t('결정적(재실행 동일)', JSON.stringify(pal2) === JSON.stringify(K.kmeans(rgba, W, H, 3)));

/* ── [8] 원작 기반 명화 데이터(artdata.js) ── */
console.log('[8] 원작 기반 명화 데이터');
const adSrc = fs.readFileSync(path.join(__dirname, '..', 'masterpiece', 'artdata.js'), 'utf8');
const win = {};
new Function('window', adSrc)(win);
const D = win.KMDATA;
const IDS = Object.keys(D);
t('작품 데이터 24점', IDS.length === 24);
t('8작품 데이터 존재', IDS.every(k => D[k] && D[k].w && D[k].h && D[k].pal && D[k].rle));
t('팔레트 4~14색 hex', IDS.every(k => D[k].pal.length >= 4 && D[k].pal.length <= 14 && D[k].pal.every(h => /^#[0-9A-F]{6}$/.test(h))));
t('격자 한 변 600 이하', IDS.every(k => D[k].w <= 600 && D[k].h <= 600));
function decode(d) {
  const t2 = d.rle; let n = 0, i = 0, maxc = -1;
  while (i < t2.length) {
    const c = t2.charCodeAt(i++) - 65; if (c > maxc) maxc = c;
    let v = 0, cc;
    while (i < t2.length && (cc = t2.charCodeAt(i)) >= 48 && cc <= 57) { v = v * 10 + cc - 48; i++; }
    if (v <= 0) return { ok: false };
    n += v;
  }
  return { ok: true, n, maxc };
}
t('RLE 복원 = w×h (전 작품)', IDS.every(k => { const r = decode(D[k]); return r.ok && r.n === D[k].w * D[k].h; }));
t('색 인덱스 < 팔레트 길이', IDS.every(k => decode(D[k]).maxc < D[k].pal.length));
t('원작 사진 동봉 (originals/*.jpg)', IDS.every(k => fs.existsSync(path.join(__dirname, '..', 'masterpiece', 'originals', k + '.jpg'))));

/* ── [9] ARTWORKS ↔ 데이터 일치 + paint 전면 채움 ── */
console.log('[9] ARTWORKS 연동');
const mA = html.match(/const AH=\{[\s\S]*?\n\};\n\nconst ARTWORKS=\[[\s\S]*?\n\];/);
t('AH·ARTWORKS 블록', !!mA);
const ARTS = new Function('KMP', 'window', mA[0] + '\nreturn ARTWORKS;')(K, win);
const byId = Object.fromEntries(ARTS.map(a => [a.id, a]));
t('팔레트 = 데이터 팔레트', IDS.every(k => JSON.stringify(byId[k].palette) === JSON.stringify(D[k].pal)));
t('vw·vh·gw·gh = 데이터 크기', IDS.every(k => byId[k].vw === D[k].w && byId[k].gw === D[k].w && byId[k].vh === D[k].h && byId[k].gh === D[k].h));
function mockPaint(a) {
  let area = 0, bad = 0; const w = a.vw, h = a.vh;
  const ctx = { fillStyle: '#000', fillRect(x, y, rw, rh) { area += rw * rh; if (x < 0 || y < 0 || x + rw > w || y + rh > h) bad++; } };
  a.paint(ctx, 4, K.mulberry32(1));
  return { area, bad };
}
t('paint가 화면을 빈틈없이 채움', IDS.every(k => mockPaint(byId[k]).area === D[k].w * D[k].h));
t('paint가 화면 밖을 넘지 않음', IDS.every(k => mockPaint(byId[k]).bad === 0));


console.log('');
console.log(fail === 0 ? `전체 통과 ${pass}/${pass + fail}` : `실패 ${fail}건 — ${pass}/${pass + fail}`);
process.exit(fail === 0 ? 0 : 1);
