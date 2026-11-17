/* 케이원더 · 불꽃놀이 공장 — 논리(그림을 모른다. node 로 시험한다)
 * 껍질(shell) = { size:'s'|'m'|'l', layout, inner:[가루…], outer:[가루…], charge:true|false, lopsided:false }
 * buildBurst(shell, rnd) → { dud, apex, rise, stars:[{dir, speed, color, color2, life, size, drag, grav, glitter, tail}] }
 * 화약의 성분·비율은 여기에도 없다. 「색 가루」가 색을, 「놓은 자리」가 모양을 정한다는 것만 다룬다.
 */
export const POWDERS = {
  sr: { name: '스트론튬', says: '빨강', rgb: [1.00, 0.10, 0.07] },
  ca: { name: '칼슘',     says: '주황', rgb: [1.00, 0.42, 0.06] },
  na: { name: '나트륨',   says: '노랑', rgb: [1.00, 0.80, 0.12], bright: 1.35 },
  ba: { name: '바륨',     says: '초록', rgb: [0.14, 1.00, 0.26] },
  cu: { name: '구리',     says: '파랑', rgb: [0.10, 0.42, 1.00] },
  al: { name: '알루미늄', says: '흰 불티', rgb: [1.00, 0.97, 0.90], glitter: true },
  fe: { name: '쇳가루',   says: '금빛 꼬리', rgb: [1.00, 0.62, 0.18], tail: true },
};
const MIX_RGB = { 'cu+sr': [0.62, 0.16, 1.00], 'ba+cu': [0.08, 0.95, 0.85], 'ba+na': [0.62, 1.00, 0.16] };   // 섞었을 때 실제로 보이는 색
export const LAYOUTS = {
  ball:   { name: '둥글게 고루',  says: '국화' },
  ring:   { name: '한 줄 고리',   says: '고리' },
  heart:  { name: '하트로 놓기',  says: '하트' },
  double: { name: '두 겹',        says: '두 겹 꽃' },
  willow: { name: '버들',         says: '버들' },
  face:   { name: '웃는 얼굴',    says: '웃는 얼굴' },
  palm:   { name: '굵은 알 몇 개', says: '야자수' },
  cross:  { name: '쪼개지는 알',  says: '갈라지는 별' },
  kamuro: { name: '금빛 가득',    says: '금빛 폭포' },
};
export const SIZES = {
  s: { name: '작은 껍질', apex: 115, rise: 1.9, speed: 62,  stars: 190, life: 1.9, starSize: 1.25 },
  m: { name: '보통 껍질', apex: 165, rise: 2.5, speed: 92,  stars: 320, life: 2.4, starSize: 1.5 },
  l: { name: '큰 껍질',   apex: 215, rise: 3.1, speed: 128, stars: 520, life: 3.0, starSize: 1.8 },
};
export const SOUND_SPEED = 340;

/** 가루 묶음 → 색·성질. 스트론튬+구리 = 보라처럼 섞으면 섞인 색. */
export function mixPowders(ids) {
  ids = (ids || []).filter(id => POWDERS[id]);
  if (!ids.length) return null;
  const col = ids.filter(id => !POWDERS[id].glitter && !POWDERS[id].tail);
  const base = col.length ? col : ids;
  const rgb = [0, 0, 0]; let bright = 0;
  for (const id of base) { const p = POWDERS[id]; for (let k = 0; k < 3; k++) rgb[k] += p.rgb[k]; bright += p.bright || 1; }
  for (let k = 0; k < 3; k++) rgb[k] /= base.length;
  // 섞은 색은 둘의 가운데보다 조금 더 진하게(가장 큰 값을 1로)
  const mx = Math.max(rgb[0], rgb[1], rgb[2]) || 1; for (let k = 0; k < 3; k++) rgb[k] /= mx;
  const fixed = MIX_RGB[[...new Set(base)].sort().join('+')]; if (fixed) for (let k = 0; k < 3; k++) rgb[k] = fixed[k];
  return { rgb, bright: bright / base.length, glitter: ids.some(id => POWDERS[id].glitter), tail: ids.some(id => POWDERS[id].tail), ids: [...ids].sort() };
}
/** 사람 말로 된 색 이름(의뢰 판정·도감용) */
export function colorName(ids) {
  const s = [...new Set((ids || []).filter(id => POWDERS[id] && !POWDERS[id].glitter && !POWDERS[id].tail))].sort().join('+');
  return ({ sr: '빨강', ca: '주황', na: '노랑', ba: '초록', cu: '파랑', 'cu+sr': '보라', 'ba+cu': '청록', 'ca+sr': '다홍', 'ba+na': '연두', 'na+sr': '주황' })[s] || (s ? '섞인 색' : '흰빛');
}

function fib(n, i) { const y = 1 - 2 * (i + .5) / n, r = Math.sqrt(1 - y * y), a = i * 2.399963229728653; return [Math.cos(a) * r, y, Math.sin(a) * r]; }
function rot(v, yaw, pitch) { // 판을 살짝 돌려 세움
  let [x, y, z] = v; const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  [x, z] = [x * cy + z * sy, -x * sy + z * cy]; [y, z] = [y * cp - z * sp, y * sp + z * cp]; return [x, y, z];
}

export function buildBurst(shell, rnd = Math.random) {
  const S = SIZES[shell.size] || SIZES.m;
  const inner = mixPowders(shell.inner) || { rgb: [1, .95, .85], bright: 1, glitter: false, tail: false, ids: [] };
  const outer = mixPowders(shell.outer);
  const out = { dud: false, apex: S.apex, rise: S.rise, stars: [], layout: shell.layout, size: shell.size,
                colorName: colorName(shell.inner), outerName: outer ? colorName(shell.outer) : null };
  if (shell.charge === false) { out.dud = true; return out; }             // 터뜨림 약이 없으면 불발
  const J = () => 1 + (rnd() - .5) * .08;
  const star = (dir, sp, c, o = {}) => out.stars.push({
    dir, speed: sp, color: c.rgb.map(v => v * (c.bright || 1)), color2: o.color2 || null,
    life: (o.life || S.life) * (0.85 + rnd() * .3), size: (o.size || S.starSize), drag: o.drag ?? 1.25, grav: o.grav ?? 0.55,
    glitter: !!(c.glitter || o.glitter), tail: !!(c.tail || o.tail), split: !!o.split, strobe: !!o.strobe, thick: !!o.thick, shift: o.shift || null });
  const yaw = (rnd() - .5) * 1.2, pitch = (rnd() - .5) * .5;               // 판 모양은 보는 방향에 따라 조금 납작
  const L = shell.layout || 'ball';
  if (L === 'ball' || L === 'double') {
    const n = S.stars;
    for (let i = 0; i < n; i++) {
      let d = fib(n, i);
      if (shell.lopsided) { if (d[0] < -.15 && rnd() < .8) continue; d = [d[0] * 1.25 + .2, d[1], d[2]]; }   // 한쪽에 몰아 넣음
      star(d, S.speed * J(), L === 'double' && outer ? outer : inner, { strobe: !!shell.strobe, shift: shell.shift ? (mixPowders(shell.shift) || {}).rgb : null });
    }
    if (L === 'ball' && shell.pistil) { const pc = mixPowders(shell.pistil), m = Math.round(n * .3);           // 속심: 가운데 작은 다른 색 꽃
      if (pc) for (let i = 0; i < m; i++) star(fib(m, i), S.speed * .42 * J(), pc, { life: S.life * .75 }); }
    if (L === 'double') {                                                    // 속 꽃: 작고 먼저 보인다
      const m = Math.round(n * .45);
      for (let i = 0; i < m; i++) star(fib(m, i), S.speed * .5 * J(), inner, { life: S.life * .8 });
    }
  } else if (L === 'ring') {
    const n = Math.round(S.stars * .28);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; star(rot([Math.cos(a), Math.sin(a), 0], yaw, pitch), S.speed * J(), inner, { size: S.starSize * 1.25 }); }
  } else if (L === 'heart') {
    const n = Math.round(S.stars * .32);
    for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3 / 17, y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
      const len = Math.hypot(x, y) || 1; star(rot([x / len, y / len, 0], yaw * .6, pitch * .6), S.speed * len * 1.05, inner, { size: S.starSize * 1.25, drag: 1.25 }); }
  } else if (L === 'willow') {
    const n = Math.round(S.stars * .42), gold = mixPowders(['fe']);
    const c = inner.ids.length ? { ...inner, tail: true } : gold;
    for (let i = 0; i < n; i++) star(fib(n, i), S.speed * .62 * J(), c, { life: S.life * 2.1, drag: .95, grav: 1.0, tail: true, color2: [1, .5, .12] });
  } else if (L === 'palm') {                                                  // 굵은 알 몇 개가 굵은 꼬리를 끌며 휘어 내린다
    const n = shell.size === 'l' ? 11 : shell.size === 's' ? 7 : 9, c = inner.ids.length ? inner : mixPowders(['fe']);
    for (let i = 0; i < n; i++) { const a = (i + rnd() * .5) / n * Math.PI * 2, up = .25 + rnd() * .55, r = Math.sqrt(1 - up * up);
      star([Math.cos(a) * r, up, Math.sin(a) * r], S.speed * .95 * J(), c, { life: S.life * 1.5, size: S.starSize * 2.3, drag: 1.0, grav: .95, tail: true, thick: true, color2: [1, .55, .15] }); }
  } else if (L === 'cross') {                                                 // 날아가다 넷으로 쪼개진다
    const n = Math.round(S.stars * .11);
    for (let i = 0; i < n; i++) star(fib(n, i), S.speed * .95 * J(), inner, { life: S.life * .95, size: S.starSize * 1.5, split: true });
  } else if (L === 'kamuro') {                                                // 금빛이 가득 차 강물까지 흘러내린다
    const n = Math.round(S.stars * .8), gold = { ...mixPowders(['fe']), glitter: true };
    for (let i = 0; i < n; i++) star(fib(n, i), S.speed * .78 * J(), gold, { life: S.life * 2.7, drag: 1.02, grav: .72, tail: true, color2: [1, .55, .16] });
  } else if (L === 'face') {
    const n = Math.round(S.stars * .22), put = (x, y, o) => { const len = Math.hypot(x, y) || 1e-3; star(rot([x / len, y / len, 0], yaw * .35, pitch * .35), S.speed * len, inner, { size: S.starSize * 1.3, ...o }); };
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; put(Math.cos(a), Math.sin(a)); }
    for (const ex of [-.36, .36]) for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; put(ex + Math.cos(a) * .07, .3 + Math.sin(a) * .07); }
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.2 + .6 * i / 12); put(Math.cos(a) * .55, Math.sin(a) * .55 + .1); }
  }
  return out;
}

/** 번쩍 뒤 쾅까지 걸리는 시간(초) — 떨어진 거리(m) ÷ 소리 빠르기 */
export const soundDelay = dist => dist / SOUND_SPEED;

/** 의뢰 셋 */
export const MISSIONS = [
  { id: 'green', say: '초록 국화를 쏘아 올려라', hint: '초록빛을 내는 가루는 무엇일까?',
    ok: s => s.charge !== false && s.layout === 'ball' && colorName(s.inner) === '초록' && !s.lopsided },
  { id: 'order', say: '주문서대로: 속은 빨강, 겉은 금빛 버들 두 겹', hint: '두 겹으로 놓고, 속과 겉에 다른 가루를.',
    ok: s => s.charge !== false && s.layout === 'double' && colorName(s.inner) === '빨강' && (s.outer || []).includes('fe') },
  { id: 'smile', say: '하늘에 웃는 얼굴을 띄워라', hint: '알갱이를 놓은 모양 그대로 하늘에서 퍼진다.',
    ok: s => s.charge !== false && s.layout === 'face' },
];
export const WHY = [
  '금속마다 뜨거워지면 내는 빛의 색이 달라요. 불꽃놀이의 색은 물감이 아니라 금속이에요.',
  '껍질 속에 알갱이를 놓은 모양 그대로 하늘에서 퍼져요.',
  '번쩍하고 한참 뒤에 쾅 해요. 빛은 순식간에 오는데 소리는 1초에 340m쯤밖에 못 와요.',
];
