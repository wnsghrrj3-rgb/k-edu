// 흔들림 잡기(KMV_STAB) 모델 테스트 — node test/model-stab.test.mjs
// 합성 그림을 실제로 밀어 보고, 그 이동량을 되찾아내는지 → 궤적·보정·한계까지.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('../engine/stab.js');
const S = globalThis.KMV_STAB, W = S.PW, H = S.PH;
let n = 0, fail = 0;
const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const near = (a, b, e, m) => ok(Math.abs(a - b) <= e, m + ' → ' + (Math.round(a * 1000) / 1000) + ' (기대 ' + b + ' ±' + e + ')');

/* 무늬가 있는 그림 하나 — (dx, dy) 만큼 민 것을 만든다.
   되풀이되는 무늬(줄무늬)는 7칸 옆에서도 똑같이 맞아 버리므로(에일리어싱)
   되풀이되지 않게 흩어 놓은 덩어리로 그린다 — 실촬영본에 가깝다. */
const BLOBS = (() => { const a = []; let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 26; i++) a.push([rnd() * W, rnd() * H, 3 + rnd() * 7, 60 + rnd() * 160]); return a; })();
function scene(dx, dy, noise) {
  const g = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x - dx, v = y - dy;
    let val = 30;
    for (const [bx, by, br, bv] of BLOBS) { const q = ((u - bx) ** 2 + (v - by) ** 2) / (br * br); if (q < 4) val += bv * Math.exp(-q); }
    if (noise) val += ((x * 37 + y * 17) % 13) * noise;          // 결정적인 잔무늬
    g[y * W + x] = Math.max(0, Math.min(255, val));
  }
  return g;
}
const prof = (dx, dy, nz) => S.profile(scene(dx, dy, nz), W, H);

console.log('한 프레임 → 투영');
const p0 = S.profile(scene(0, 0), W, H);
ok(p0.col.length === W && p0.row.length === H, '세로줄 96 · 가로줄 54');
const mean = a => Array.from(a).reduce((s, v) => s + v, 0) / a.length;
ok(Math.abs(mean(p0.col)) < 1e-3 && Math.abs(mean(p0.row)) < 1e-3, '평균을 뺀 값 (밝기 변화에 안 흔들리게)');

console.log('이동량 되찾기');
for (const [dx, dy] of [[0, 0], [2, 0], [-3, 0], [0, 2], [-1, -2], [5, 3], [1.5, -0.5]]) {
  const e = S.estimate(p0, prof(dx, dy));
  near(e.dx, dx, 0.35, '(' + dx + ',' + dy + ') → dx');
  near(e.dy, dy, 0.35, '(' + dx + ',' + dy + ') → dy');
}
ok(S.estimate(p0, prof(2, -1)).ok, '자신 있음 (무늬 있는 그림)');

console.log('자신 없을 때는 0');
const flat = S.profile(new Uint8Array(W * H).fill(128), W, H);
ok(!S.estimate(flat, flat).ok && S.estimate(flat, flat).dx === 0, '민무늬 회색 → ok=false · 0');
const far = S.estimate(p0, prof(30, 0));                        // 탐색 범위(±8) 밖 = 벽에 붙음
ok(!far.ok, '탐색 범위를 넘는 큰 움직임(장면 바뀜) → ok=false');
ok(!S.estimate(null, p0).ok, '앞 프레임이 없으면 ok=false');

console.log('궤적 → 보정');
// 30프레임 톱니 떨림(±2칸)이 이어진 뒤 계속 오른쪽으로 흐름(팬)
const N = 120, d = new Float32Array(N), okA = new Uint8Array(N).fill(1), cut = new Uint8Array(N);
for (let i = 1; i < N; i++) d[i] = (i % 2 ? 2 : -2) + (i > 60 ? 1 : 0);
const c1 = S.correct(d, okA, cut, 15, 0.045, W);
const jit = a => { let s = 0; for (let i = 1; i < a.length; i++) s += Math.abs(a[i] - a[i - 1]); return s / (a.length - 1); };
const pos = (() => { const p = new Float32Array(N); for (let i = 1; i < N; i++) p[i] = p[i - 1] + d[i]; return p; })();
const after = pos.map((v, i) => v + c1[i]);
ok(jit(after) < jit(pos) * 0.35, '떨림이 크게 줄어듦 (' + jit(pos).toFixed(2) + ' → ' + jit(after).toFixed(2) + ')');
ok(Math.max(...Array.from(c1).map(Math.abs)) <= 0.045 * W + 1e-6, '보정량이 여백(4.5%) 을 넘지 않음');
ok(after[110] - after[70] > 20, '흐름(팬)은 그대로 따라감 — 떨림만 뺀다');
const c1b = S.correct(d, okA, cut, 15, 0.045, W);
ok(Array.from(c1).every((v, i) => v === c1b[i]), '같은 입력이면 값이 항상 같다 (결정적)');

console.log('컷에서 끊기');
// 앞 토막은 계속 흐르고(팬), 컷 뒤는 완전히 고정된 그림
const d2 = new Float32Array(N), ok2 = new Uint8Array(N).fill(1), cut2 = new Uint8Array(N);
for (let i = 1; i < 60; i++) d2[i] = 3;
cut2[60] = 1;
const c2 = S.correct(d2, ok2, cut2, 21, 0.10, W);
const maxAfter = Math.max(...Array.from(c2.slice(60)).map(Math.abs));
ok(maxAfter < 1e-6, '컷 뒤(고정된 그림)는 보정 0 — 앞 토막의 흐름이 넘어오지 않음');
ok(Math.abs(c2[55]) > 1, '컷 직전 프레임은 보정 중');
const c2n = S.correct(d2, ok2, new Uint8Array(N), 21, 0.10, W);
ok(Math.abs(c2n[63]) > 1, '컷 표시가 없으면 앞 흐름이 넘어옴 (컷일 때만 끊는다)');

console.log('자신 없는 프레임은 이어 붙임');
const d3 = new Float32Array(N), ok3 = new Uint8Array(N).fill(1);
for (let i = 1; i < N; i++) d3[i] = i % 2 ? 2 : -2;
ok3[40] = 0; d3[40] = 7;                                          // 못 믿을 값
const c3 = S.correct(d3, ok3, new Uint8Array(N), 15, 0.045, W);
ok(Math.abs(c3[40] - c3[39]) < 4, '못 믿을 프레임은 "안 움직였다"로 보아 튀지 않음');

console.log('세기 · 확대');
near(S.zoomOf(0.045), 1 / (1 - 0.09), 1e-9, '여백 4.5% → 확대 배율');
ok(S.LEVELS.a.margin < S.LEVELS.b.margin && S.LEVELS.a.win < S.LEVELS.b.win, '강하게가 더 넓게 · 더 많이 자름');
const built = S.build({ x: d, y: d, ok: okA, cut }, 'b', 30);
ok(built && built.sx.length === N && built.zoom > 1.2, 'build → sx·sy·zoom');
ok(S.build({ x: d, y: d, ok: okA, cut }, 'off', 30) === null, "세기 'off' 면 null");
ok(S.build(null, 'a', 30) === null, '흔들림 기록이 없으면 null');

console.log('offset — 분석이 끝난 원본만');
const src = { id: 'm1', fps: 30, analyzed: false, shake: { x: d, y: d, ok: okA, cut } };
ok(S.offset(src, 'a', 10) === null, '분석 중이면 null (반쯤 만든 표로 밀지 않는다)');
src.analyzed = true;
const o = S.offset(src, 'a', 10);
ok(o && o.zoom > 1 && Math.abs(o.sx) <= 0.045 + 1e-6, 'zoom·sx (화면 비율)');
ok(S.offset(src, 'a', 1e9).sx === S.offset(src, 'a', N - 1).sx, '범위를 넘는 프레임은 끝값으로');
S.forget('m1');
ok(S.offset(src, 'a', 10).sx === o.sx, 'forget 뒤 다시 만들어도 같은 값');

console.log('\n' + (n - fail) + '/' + n + ' 통과');
process.exit(fail ? 1 : 0);
