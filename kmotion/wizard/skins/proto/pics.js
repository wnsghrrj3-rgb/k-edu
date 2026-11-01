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
};
// 쌓기나무(앞에서 본 기둥): 'cubes:2,1,3' — 기둥 높이들(1~3), 2~4줄. 네모를 쌓아 그린다.
function cubes(spec){ const hs = spec.split(',').map(Number); const n = hs.length, w = Math.min(22, 76 / n), x0 = 50 - (n * w) / 2; let o = '';
  hs.forEach((h, i) => { for (let k = 0; k < h; k++) o += `<rect x="${(x0 + i * w).toFixed(1)}" y="${(88 - (k + 1) * w).toFixed(1)}" width="${w}" height="${w}" fill="${F}" stroke="${L}" stroke-width="3"/>`; });
  return wrap(`<line x1="8" y1="88" x2="92" y2="88" stroke="${L}" stroke-width="3"/>${o}`, 'cubes'); }
// 물건 줄: 'row:book,can,orange' — 4~6개 한 줄(모양 세기). 각 그림을 작게 가로로.
function row(spec){ const ids = spec.split(','); const n = ids.length, w = 100 / n; return `<span class="mw-picrow">${ids.map(id => S[id] ? `<svg class="mw-pic small" viewBox="0 0 100 100" style="width:${(w * .9).toFixed(1)}%">${S[id]()}</svg>` : '').join('')}</span>`; }
export function picHtml(id){ if (!id) return ''; if (id.startsWith('cubes:')) return cubes(id.slice(6)); if (id.startsWith('row:')) return row(id.slice(4)); return S[id] ? wrap(S[id]()) : ''; }
