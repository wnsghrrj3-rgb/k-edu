// proto 스킨 — 도형 그림(월드 2, 계약 v2.9 question.pic·choices[].pic). id → 인라인 SVG 문자열. 판정과 무관(13 문서: 스킨은 id 만 그린다).
// 색은 CSS 변수(--mw-pic-fill·--mw-pic-line)로 테마가 바꾼다. 모든 그림은 viewBox 0 0 100 100 안.
const F = 'var(--mw-pic-fill,#ffd45c)', L = 'var(--mw-pic-line,#3a2a12)', F2 = 'var(--mw-pic-fill2,#8fd0ff)', SH = 'rgba(0,0,0,.18)';
const wrap = (inner, cls = '') => `<svg class="mw-pic ${cls}" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
const S = {
  // 평면(2-1 2단원) — 변형 2종씩
  tri:   () => `<polygon points="50,12 90,86 10,86" fill="${F}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`,
  tri2:  () => `<polygon points="14,80 94,80 36,22" fill="${F}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`,
  quad:  () => `<rect x="16" y="16" width="68" height="68" rx="3" fill="${F}" stroke="${L}" stroke-width="5"/>`,
  quad2: () => `<polygon points="30,18 76,18 92,84 8,84" fill="${F}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`,
  circ:  () => `<circle cx="50" cy="50" r="38" fill="${F}" stroke="${L}" stroke-width="5"/>`,
  circ2: () => `<circle cx="50" cy="54" r="24" fill="${F}" stroke="${L}" stroke-width="5"/>`,
  // 입체(1-1 2단원) — 상자·둥근 기둥·공
  box:   () => `<polygon points="20,34 60,34 60,84 20,84" fill="${F}" stroke="${L}" stroke-width="4" stroke-linejoin="round"/><polygon points="20,34 38,18 78,18 60,34" fill="${F}" stroke="${L}" stroke-width="4" stroke-linejoin="round" opacity=".92"/><polygon points="60,34 78,18 78,68 60,84" fill="${SH}" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`,
  cyl:   () => `<rect x="24" y="24" width="52" height="56" fill="${F}" stroke="none"/><path d="M24 24 v56 a26 9 0 0 0 52 0 v-56" fill="${F}" stroke="${L}" stroke-width="4"/><ellipse cx="50" cy="24" rx="26" ry="9" fill="${F}" stroke="${L}" stroke-width="4"/><path d="M50 60 a26 9 0 0 0 26 0" fill="none" stroke="${SH}" stroke-width="6"/>`,
  ball:  () => `<circle cx="50" cy="52" r="36" fill="${F}" stroke="${L}" stroke-width="4"/><ellipse cx="38" cy="38" rx="10" ry="6" fill="#fff" opacity=".55"/><path d="M22 66 a36 36 0 0 0 56 0" fill="none" stroke="${SH}" stroke-width="7" stroke-linecap="round"/>`,
  // 생활 물건(문제 그림) — 상자 계열
  book:  () => `<rect x="18" y="22" width="56" height="64" rx="3" fill="${F2}" stroke="${L}" stroke-width="4"/><rect x="18" y="22" width="12" height="64" fill="${SH}"/><line x1="40" y1="40" x2="66" y2="40" stroke="${L}" stroke-width="3"/><line x1="40" y1="52" x2="66" y2="52" stroke="${L}" stroke-width="3"/>`,
  gift:  () => `<rect x="16" y="40" width="68" height="46" rx="3" fill="${F}" stroke="${L}" stroke-width="4"/><rect x="12" y="30" width="76" height="14" rx="3" fill="${F}" stroke="${L}" stroke-width="4"/><rect x="44" y="30" width="12" height="56" fill="#e2534f"/><path d="M50 30 c-14-18-26-6-10 0 c-16 6-4 18 10 0 c14 18 26 6 10 0 c16-6 4-18-10 0" fill="#e2534f" stroke="${L}" stroke-width="2"/>`,
  brick: () => `<polygon points="10,44 62,44 62,80 10,80" fill="#d98a62" stroke="${L}" stroke-width="4" stroke-linejoin="round"/><polygon points="10,44 30,28 82,28 62,44" fill="#e9a07a" stroke="${L}" stroke-width="4" stroke-linejoin="round"/><polygon points="62,44 82,28 82,64 62,80" fill="#b76d48" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>`,
  // 둥근 기둥 계열
  can:   () => `<path d="M26 26 v50 a24 8 0 0 0 48 0 v-50" fill="#c9d3dc" stroke="${L}" stroke-width="4"/><ellipse cx="50" cy="26" rx="24" ry="8" fill="#e8eef2" stroke="${L}" stroke-width="4"/><rect x="26" y="40" width="48" height="22" fill="#e2534f"/><path d="M26 40 h48 M26 62 h48" stroke="${L}" stroke-width="2"/>`,
  drum:  () => `<path d="M22 30 v44 a28 9 0 0 0 56 0 v-44" fill="#e2534f" stroke="${L}" stroke-width="4"/><ellipse cx="50" cy="30" rx="28" ry="9" fill="#fff3d6" stroke="${L}" stroke-width="4"/><path d="M28 36 l12 32 M72 36 l-12 32 M40 36 l-8 32 M60 36 l8 32" stroke="#fff" stroke-width="3" opacity=".8"/>`,
  battery: () => `<rect x="42" y="12" width="16" height="8" fill="#555" stroke="${L}" stroke-width="3"/><path d="M30 24 v56 a20 7 0 0 0 40 0 v-56" fill="#3f8f4a" stroke="${L}" stroke-width="4"/><ellipse cx="50" cy="24" rx="20" ry="7" fill="#7bc47f" stroke="${L}" stroke-width="4"/><rect x="30" y="48" width="40" height="14" fill="#fff" opacity=".85"/>`,
  // 공 계열
  orange: () => `<circle cx="50" cy="54" r="34" fill="#f5a23a" stroke="${L}" stroke-width="4"/><ellipse cx="38" cy="42" rx="9" ry="5" fill="#fff" opacity=".5"/><path d="M50 20 c6-8 14-8 18-4" fill="none" stroke="#4e8b3a" stroke-width="5" stroke-linecap="round"/>`,
  ball2: () => `<circle cx="50" cy="52" r="36" fill="#fff" stroke="${L}" stroke-width="4"/><path d="M22 36 q28 16 56 0 M22 68 q28-16 56 0" fill="none" stroke="#2c6fd1" stroke-width="5"/>`,
  marble: () => `<circle cx="50" cy="56" r="26" fill="${F2}" stroke="${L}" stroke-width="4"/><ellipse cx="42" cy="46" rx="7" ry="4" fill="#fff" opacity=".7"/><path d="M36 60 q14-18 28 0" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>`,
  // v2.10 3학년 줄 — 선·각·직각 도형·원의 부분(코드 10~27). 점은 L 색, 선은 두껍게, 직각 기호는 작은 네모(교과서 표기)
  seg:   () => `<line x1="18" y1="62" x2="82" y2="38" stroke="${L}" stroke-width="6" stroke-linecap="round"/><circle cx="18" cy="62" r="7" fill="${L}"/><circle cx="82" cy="38" r="7" fill="${L}"/>`,
  ray:   () => `<line x1="18" y1="62" x2="78" y2="40" stroke="${L}" stroke-width="6" stroke-linecap="round"/><circle cx="18" cy="62" r="7" fill="${L}"/><polygon points="92,35 74,34 78,50" fill="${L}"/>`,
  line:  () => `<line x1="20" y1="62" x2="80" y2="38" stroke="${L}" stroke-width="6" stroke-linecap="round"/><polygon points="8,67 26,52 22,70" fill="${L}"/><polygon points="92,33 74,30 78,48" fill="${L}"/>`,
  rangle:  () => `<polyline points="26,22 26,78 84,78" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="26,66 38,66 38,78" fill="none" stroke="${L}" stroke-width="3"/><circle cx="26" cy="78" r="6" fill="${L}"/>`,
  rangle2: () => `<polyline points="18,30 74,30 74,86" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="62,30 62,42 74,42" fill="none" stroke="${L}" stroke-width="3"/><circle cx="74" cy="30" r="6" fill="${L}"/>`,
  angle:   () => `<polyline points="84,42 22,78 88,78" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 78 a18 18 0 0 0 -3 -9" fill="none" stroke="${L}" stroke-width="3"/><circle cx="22" cy="78" r="6" fill="${L}"/>`,
  angle2:  () => `<polyline points="10,52 60,78 92,30" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M44 70 a18 18 0 0 1 20 -8" fill="none" stroke="${L}" stroke-width="3"/><circle cx="60" cy="78" r="6" fill="${L}"/>`,
  rtri:  () => `<polygon points="18,82 82,82 18,22" fill="${F}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><polyline points="18,70 30,70 30,82" fill="none" stroke="${L}" stroke-width="3"/>`,
  rtri2: () => `<polygon points="14,80 86,80 86,36" fill="${F}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/><polyline points="74,80 74,68 86,68" fill="none" stroke="${L}" stroke-width="3"/>`,
  rect:  () => `<rect x="10" y="30" width="80" height="44" fill="${F}" stroke="${L}" stroke-width="5"/>`,
  rect2: () => `<rect x="30" y="12" width="40" height="76" fill="${F}" stroke="${L}" stroke-width="5"/>`,
  square:  () => `<rect x="20" y="20" width="60" height="60" fill="${F}" stroke="${L}" stroke-width="5"/>`,
  square2: () => `<rect x="30" y="30" width="40" height="40" fill="${F}" stroke="${L}" stroke-width="5"/>`,
  quad3: () => `<polygon points="28,24 92,24 72,80 8,80" fill="${F}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`,
  cdia:  () => `<circle cx="50" cy="50" r="38" fill="${F}" stroke="${L}" stroke-width="5"/><line x1="12" y1="50" x2="88" y2="50" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="${L}"/>`,
  cchord: () => `<circle cx="50" cy="50" r="38" fill="${F}" stroke="${L}" stroke-width="5"/><line x1="18" y1="72" x2="82" y2="72" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="${L}"/>`,
  crad:  () => `<circle cx="50" cy="50" r="38" fill="${F}" stroke="${L}" stroke-width="5"/><line x1="50" y1="50" x2="88" y2="50" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="${L}"/>`,
  seg2:  () => `<line x1="50" y1="14" x2="50" y2="86" stroke="${L}" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="14" r="7" fill="${L}"/><circle cx="50" cy="86" r="7" fill="${L}"/>`,
  ray2:  () => `<line x1="24" y1="30" x2="78" y2="74" stroke="${L}" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="30" r="7" fill="${L}"/><polygon points="88,84 70,82 82,68" fill="${L}"/>`,
  line2: () => `<line x1="14" y1="50" x2="86" y2="50" stroke="${L}" stroke-width="6" stroke-linecap="round"/><polygon points="4,50 22,40 22,60" fill="${L}"/><polygon points="96,50 78,40 78,60" fill="${L}"/>`,
  cdia2: () => `<circle cx="50" cy="50" r="38" fill="${F}" stroke="${L}" stroke-width="5"/><line x1="50" y1="12" x2="50" y2="88" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="${L}"/>`,
  crad2: () => `<circle cx="50" cy="50" r="38" fill="${F}" stroke="${L}" stroke-width="5"/><line x1="50" y1="50" x2="24" y2="22" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="${L}"/>`,
  cline: () => `<circle cx="50" cy="50" r="34" fill="${F}" stroke="${L}" stroke-width="5"/><line x1="6" y1="36" x2="94" y2="36" stroke="${L}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="${L}"/>`,
  // v2.14 4학년 줄(4-1 2단원 각도 · 4단원 삼각형) — 코드 50~63. 예각·둔각은 호(弧) 표시, 같은 변은 짧은 가로 표시(교과서 표기), 삼각형은 세 각 그대로 작도
  acute:   () => `<polyline points="88,78 22,78 76,40" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 78 a20 20 0 0 0 -4 -11" fill="none" stroke="${L}" stroke-width="3"/><circle cx="22" cy="78" r="6" fill="${L}"/>`,
  acute2:  () => `<polyline points="88,78 22,78 52,26" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 78 a20 20 0 0 0 -10 -17" fill="none" stroke="${L}" stroke-width="3"/><circle cx="22" cy="78" r="6" fill="${L}"/>`,
  obtuse:  () => `<polyline points="92,78 40,78 12,30" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 78 a20 20 0 0 0 -30 -17" fill="none" stroke="${L}" stroke-width="3"/><circle cx="40" cy="78" r="6" fill="${L}"/>`,
  obtuse2: () => `<polyline points="92,70 50,70 8,46" fill="none" stroke="${L}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 70 a20 20 0 0 0 -37 -10" fill="none" stroke="${L}" stroke-width="3"/><circle cx="50" cy="70" r="6" fill="${L}"/>`,
  iso:   () => tri([[50, 14], [16, 84], [84, 84]], [0, 2]),
  iso2:  () => tri([[12, 20], [12, 84], [90, 52]], [1, 2]),
  equi:  () => tri([[50, 12], [14, 74.4], [86, 74.4]], [0, 1, 2]),
  equi2: () => tri([[69, 17.1], [12, 50], [69, 82.9]], [0, 1, 2]),
  scal:  () => tri([[12, 80], [90, 80], [34, 20]], []),
  scal2: () => tri([[8, 84], [92, 84], [72, 18]], []),
  atri:  () => tri([[14, 80], [86, 80], [57.2, 18.3]], []),
  atri2: () => tri([[14, 80], [86, 80], [66.8, 27.2]], []),
  otri:  () => tri([[10, 80], [90, 80], [42, 57.6]], []),
  otri2: () => tri([[30, 80], [94, 80], [13, 33]], []),
};
// v2.14 삼각형 그리기 — 꼭짓점 3·같은 길이 표시를 넣을 변(꼭짓점 i → i+1) 번호
function tri(P, ticks){ const seg = P.map((p, i) => [p, P[(i + 1) % 3]]);
  const t = ticks.map(i => { const [a, b] = seg[i], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, nx = -dy / n * 5, ny = dx / n * 5; return `<line x1="${(mx - nx).toFixed(1)}" y1="${(my - ny).toFixed(1)}" x2="${(mx + nx).toFixed(1)}" y2="${(my + ny).toFixed(1)}" stroke="${L}" stroke-width="3.5" stroke-linecap="round"/>`; }).join('');
  return `<polygon points="${P.map(p => p.join(',')).join(' ')}" fill="${F}" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>` + t; }

// v2.14 각으로 작도한 삼각형·사각형(문제 그림 `tri:a,b` · `quad:a,b,c`, 정본 작도 규약: 그림의 각 = 실제 각). 수학 좌표(y 위)로 풀고 화면에 맞춰 뒤집는다
const RAD = Math.PI / 180;
export function polyFromAngles(angles){ const [a, b, c] = angles; const A = [0, 0], B = [1, 0];
  if (angles.length === 2) { const cc = 180 - a - b, t = Math.sin(b * RAD) / Math.sin(cc * RAD); return { pts: [A, B, [t * Math.cos(a * RAD), t * Math.sin(a * RAD)]], labels: [a, b, '?'] }; }
  // 사각형: AB = 1, BC = L — L 은 1 부터 몇 가지를 돌려 D 가 C·A 와 겹치지 않는(교점이 두 반직선 앞쪽에 충분히 있는) 첫 것(예: 60·60·120 은 L=1 이면 D = C 로 찌그러짐)
  const u = [Math.cos(a * RAD), Math.sin(a * RAD)], v = [Math.cos((360 - b - c) * RAD), Math.sin((360 - b - c) * RAD)];
  for (const L of [1, .8, 1.25, .65, 1.5, .5, 2]) { const C = [1 + L * Math.cos((180 - b) * RAD), L * Math.sin((180 - b) * RAD)];
    const det = u[0] * -v[1] - u[1] * -v[0]; if (Math.abs(det) < 1e-9) continue;   // A + t u = C + s v
    const dx = C[0] - A[0], dy = C[1] - A[1], t = (dx * -v[1] - dy * -v[0]) / det, sv = (u[0] * dy - u[1] * dx) / det; if (t < .3 || sv < .3) continue;
    return { pts: [A, B, C, [A[0] + t * u[0], A[1] + t * u[1]]], labels: [a, b, c, '?'], t, s: sv, L }; }
  return null; }
function anglePoly(spec){ const angles = spec.split(',').map(Number); const g = polyFromAngles(angles); if (!g) return '';
  const xs = g.pts.map(p => p[0]), ys = g.pts.map(p => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys), k = 72 / Math.max(maxX - minX, maxY - minY);
  const P = g.pts.map(([x, y]) => [50 + (x - (minX + maxX) / 2) * k, 50 - (y - (minY + maxY) / 2) * k]); const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cy = P.reduce((s, p) => s + p[1], 0) / P.length;
  const lab = P.map((p, i) => { const dx = cx - p[0], dy = cy - p[1], n = Math.hypot(dx, dy) || 1; const x = p[0] + dx / n * 15, y = p[1] + dy / n * 15; return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, system-ui, sans-serif" font-weight="800" font-size="${typeof g.labels[i] === 'number' ? 12 : 15}" fill="${L}">${g.labels[i]}${typeof g.labels[i] === 'number' ? '°' : ''}</text>`; }).join('');
  return wrap(`<polygon points="${P.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${F}" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>` + lab, 'angled'); }
// v2.12 이름 판(도형 정령 보호막 이름 맞히기) — 그림 대신 이름 글자. 긴 이름은 두 줄
const NM = { box: ['상자', '모양'], cyl: ['둥근 기둥', '모양'], ball: ['공', '모양'], tri: ['삼각형'], quad: ['사각형'], circ: ['원'], rtri: ['직각', '삼각형'], rect: ['직사각형'], square: ['정사각형'],
  atri: ['예각', '삼각형'], otri: ['둔각', '삼각형'], iso: ['이등변', '삼각형'], equi: ['정삼각형'] };   // v2.14 4학년 삼각형 이름 판(70~73)
for (const [f, ls] of Object.entries(NM)) S['nm-' + f] = () => { const long = Math.max(...ls.map(x => x.length)), fs = long <= 1 ? 40 : long <= 2 ? 32 : long <= 3 ? 26 : long <= 4 ? 20 : 17, y0 = ls.length === 1 ? 50 : 50 - fs * .58;
  return `<rect x="6" y="22" width="88" height="56" rx="14" fill="${F}" stroke="${L}" stroke-width="4"/>` + ls.map((t, i) => `<text x="50" y="${(y0 + i * fs * 1.16).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, system-ui, sans-serif" font-weight="900" font-size="${fs}" fill="${L}">${t}</text>`).join(''); };
// v2.12 3D 판(도형 정령 보호막)에 그릴 SVG 문자열 — img 로 읽으니 CSS 변수를 색으로 바꿔 둔다
export function svgMarkup(id, { fill = '#ffe7a3', line = '#1e3a46' } = {}){ if (!S[id]) return ''; const inner = S[id]().replace(/var\(--mw-pic-fill2,[^)]*\)/g, '#8fd0ff').replace(/var\(--mw-pic-fill,[^)]*\)/g, fill).replace(/var\(--mw-pic-line,[^)]*\)/g, line);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">${inner}</svg>`; }
// 쌓기나무(앞에서 본 기둥): 'cubes:2,1,3' — 기둥 높이들(1~3), 2~4줄. 네모를 쌓아 그린다.
function cubes(spec){ const hs = spec.split(',').map(Number); const n = hs.length, w = Math.min(22, 76 / n), x0 = 50 - (n * w) / 2; let o = '';
  hs.forEach((h, i) => { for (let k = 0; k < h; k++) o += `<rect x="${(x0 + i * w).toFixed(1)}" y="${(88 - (k + 1) * w).toFixed(1)}" width="${w}" height="${w}" fill="${F}" stroke="${L}" stroke-width="3"/>`; });
  return wrap(`<line x1="8" y1="88" x2="92" y2="88" stroke="${L}" stroke-width="3"/>${o}`, 'cubes'); }
// 물건 줄: 'row:book,can,orange' — 4~6개 한 줄(모양 세기). 각 그림을 작게 가로로.
function row(spec){ const ids = spec.split(','); const n = ids.length, w = 100 / n; return `<span class="mw-picrow">${ids.map(id => S[id] ? `<svg class="mw-pic small" viewBox="0 0 100 100" style="width:${(w * .9).toFixed(1)}%">${S[id]()}</svg>` : '').join('')}</span>`; }
// ── v3.0 월드 3 「측정의 협곡」 측정 그림(17 문서 6절): 번호 ①②③ 는 그림 안에 — 답은 번호(1학년) 또는 cm 수(2학년)
const NUMS = ['①', '②', '③'];
const numTag = (x, y, i) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, system-ui, sans-serif" font-weight="900" font-size="13" fill="${L}">${NUMS[i]}</text>`;
// 'bars:5,3,7' — 가로 막대 셋, 왼쪽 끝 맞춤(1학년 길이 비교). 길이 2~9 → 폭 최대 70
function bars(spec){ const vs = spec.split(',').map(Number); let o = ''; vs.forEach((v, i) => { const y = 22 + i * 26; o += numTag(12, y + 7, i) + `<rect x="22" y="${y}" width="${(v / 9 * 70).toFixed(1)}" height="14" rx="4" fill="${F}" stroke="${L}" stroke-width="3"/>`; });
  return wrap(`<line x1="22" y1="14" x2="22" y2="90" stroke="${L}" stroke-width="2" stroke-dasharray="3 3"/>${o}`, 'bars'); }
// 'tall:4,8,6' — 세로 막대 셋, 바닥 맞춤(높이·키 비교)
function tall(spec){ const vs = spec.split(',').map(Number); let o = ''; vs.forEach((v, i) => { const x = 16 + i * 30, h = v / 9 * 66; o += `<rect x="${x}" y="${(84 - h).toFixed(1)}" width="18" height="${h.toFixed(1)}" rx="4" fill="${F}" stroke="${L}" stroke-width="3"/>` + numTag(x + 9, 93, i); });
  return wrap(`<line x1="8" y1="84" x2="96" y2="84" stroke="${L}" stroke-width="3"/>${o}`, 'tall'); }
// 'cups:2,3,1' — 같은 컵 셋, 물 높이 다르게(들이 비교)
function cups(spec){ const vs = spec.split(',').map(Number); let o = ''; vs.forEach((v, i) => { const x = 10 + i * 30, hw = v / 9 * 54; o += `<rect x="${x + 2}" y="${(80 - hw).toFixed(1)}" width="22" height="${hw.toFixed(1)}" fill="var(--mw-pic-fill2, #8fd0ff)"/><path d="M${x} 22 L${x + 2} 80 L${x + 24} 80 L${x + 26} 22" fill="none" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>` + numTag(x + 13, 92, i); });
  return wrap(o, 'cups'); }
// 자(0~10 cm): 큰 눈금마다 숫자. 'ruler:a,b' = 눈금 a 에서 b 까지 막대 하나 · 'ruler2:x,y' = 0 에서 x·y 까지 막대 둘(위·아래)
function rulerBase(y){ let o = `<rect x="6" y="${y}" width="88" height="22" rx="3" fill="#fff8dc" stroke="${L}" stroke-width="2.5"/>`; for (let i = 0; i <= 10; i++) { const x = 10 + i * 8; o += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + (i % 5 === 0 ? 10 : 6)}" stroke="${L}" stroke-width="${i % 5 === 0 ? 2 : 1.2}"/>` + `<text x="${x}" y="${y + 17}" text-anchor="middle" font-family="Pretendard, system-ui, sans-serif" font-weight="700" font-size="6.5" fill="${L}">${i}</text>`; } return o; }
const bar = (a, b, y) => `<rect x="${10 + a * 8}" y="${y}" width="${(b - a) * 8}" height="11" rx="3" fill="${F}" stroke="${L}" stroke-width="2.5"/>`;
function ruler(spec){ const [a, b] = spec.split(',').map(Number); return wrap(bar(a, b, 38) + rulerBase(56), 'ruler'); }
function ruler2(spec){ const [x, y] = spec.split(',').map(Number); return wrap(numTag(4, 29, 0) + bar(0, x, 24) + numTag(4, 45, 1) + bar(0, y, 40) + rulerBase(58), 'ruler'); }
// 'units:n' — 1 cm 조각 n개 이어 붙임(조각마다 「1」)
function units(spec){ const n = Number(spec), w = Math.min(14, 84 / n), x0 = 50 - n * w / 2; let o = ''; for (let i = 0; i < n; i++) o += `<rect x="${(x0 + i * w).toFixed(1)}" y="40" width="${w}" height="20" fill="${F}" stroke="${L}" stroke-width="2.5"/>` + `<text x="${(x0 + i * w + w / 2).toFixed(1)}" y="51" text-anchor="middle" dominant-baseline="central" font-family="Pretendard, system-ui, sans-serif" font-weight="700" font-size="${Math.min(10, w * .7).toFixed(1)}" fill="${L}">1</text>`;
  return wrap(o + `<text x="50" y="76" text-anchor="middle" font-family="Pretendard, system-ui, sans-serif" font-weight="700" font-size="8" fill="${L}">한 조각 = 1 cm</text>`, 'units'); }
// v3.1 길이 맞추기 다리: 'gap:n' = 끊어진 다리(양쪽 널 + 가운데 틈 n칸) · 'plank:a' = 널빤지 하나(a칸, 숫자 없음) · 'gapcm:a,b' = 틈 아래 자(눈금 a~b)
const U = 8;   // 1칸 = 8(자 눈금과 같음)
function gap(spec){ const n = Number(spec), gw = n * U, x1 = 50 - gw / 2, x2 = 50 + gw / 2; return wrap(`<rect x="2" y="42" width="${(x1 - 2).toFixed(1)}" height="16" rx="3" fill="${F}" stroke="${L}" stroke-width="3"/><rect x="${x2.toFixed(1)}" y="42" width="${(98 - x2).toFixed(1)}" height="16" rx="3" fill="${F}" stroke="${L}" stroke-width="3"/><path d="M${x1.toFixed(1)} 66 Q50 92 ${x2.toFixed(1)} 66" fill="none" stroke="var(--mw-pic-fill2, #8fd0ff)" stroke-width="4"/><line x1="${x1.toFixed(1)}" y1="34" x2="${x1.toFixed(1)}" y2="40" stroke="${L}" stroke-width="2" stroke-dasharray="2 2"/><line x1="${x2.toFixed(1)}" y1="34" x2="${x2.toFixed(1)}" y2="40" stroke="${L}" stroke-width="2" stroke-dasharray="2 2"/>`, 'gap'); }
function plank(spec){ const a = Number(spec), w = a * U; return wrap(`<rect x="${(50 - w / 2).toFixed(1)}" y="40" width="${w}" height="18" rx="4" fill="${F}" stroke="${L}" stroke-width="3"/>`, 'plank'); }
function gapcm(spec){ const [a, b] = spec.split(',').map(Number); const x1 = 10 + a * U, x2 = 10 + b * U; return wrap(`<rect x="2" y="30" width="${(x1 - 2).toFixed(1)}" height="14" rx="3" fill="${F}" stroke="${L}" stroke-width="2.5"/><rect x="${x2}" y="30" width="${(98 - x2).toFixed(1)}" height="14" rx="3" fill="${F}" stroke="${L}" stroke-width="2.5"/><path d="M${x1} 50 Q${(x1 + x2) / 2} 64 ${x2} 50" fill="none" stroke="var(--mw-pic-fill2, #8fd0ff)" stroke-width="3"/>` + rulerBase(66), 'ruler'); }
const MEASURE = { 'gap:': gap, 'plank:': plank, 'gapcm:': gapcm, 'bars:': bars, 'tall:': tall, 'cups:': cups, 'ruler:': ruler, 'ruler2:': ruler2, 'units:': units };
export function picHtml(id){ if (!id) return ''; for (const k in MEASURE) if (id.startsWith(k)) return MEASURE[k](id.slice(k.length)); if (id.startsWith('cubes:')) return cubes(id.slice(6)); if (id.startsWith('row:')) return row(id.slice(4)); if (id.startsWith('tri:') || id.startsWith('quad:')) return anglePoly(id.slice(id.indexOf(':') + 1)); return S[id] ? wrap(S[id]()) : ''; }
