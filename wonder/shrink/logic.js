/* 케이원더 · 점점 작아지기 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 줄어든 정도 z: 0 = 책상 위(보이는 너비 20cm), z 가 1 늘 때마다 열 배 작아진다(보이는 너비 = 200mm / 10^z).
 * 책상 위 물건마다 단계 셋(도감 칸): 그 단계가 처음 보이는 z 와, 그때 보이는 것의 실제 크기(mm).
 * view(obj, z, opts) → { stage, find, says, field, ruler, blend, dark, … }
 *   opts = { light: 손전등 켬, flipped: 나비 비늘 뒤집음, free }
 *
 * 놀이로 줄인 것:
 *   - 단계 문턱은 「보이는 너비가 그 물건의 3~10배쯤일 때」로 손으로 골랐다(크기 열은 실제 크기에 가깝게).
 *   - 단계 사이는 문턱 앞뒤 0.12 만큼 겹쳐서 앞 단계가 흐려지며 다음 단계가 선명해진다(끊김 없음).
 *   - 많이 줄어들면(z ≥ 2) 같은 빛이 넓게 퍼져 어둡다 → 손전등이 있어야 보인다.
 *   - 물곰이 깨어나는 데 실제로는 몇 분~몇 시간 걸리지만 놀이에서는 몇 초로 줄였다.
 */

export const FIELD0 = 200;                 // z = 0 에서 보이는 너비(mm)
export const Z_MAX = 4.5, Z_MAX_FREE = 5.5;
export const DARK_Z = 2;                   // 이만큼 작아지면 손전등이 있어야 보인다
export const DEEP_Z = 5;                   // 자유: 빛의 물결보다 작은 세상
export const FADE = 0.12;                  // 단계 사이 겹침(z)
export const field = z => FIELD0 / 10 ** z;

export const OBJECTS = {
  butterfly: { name: '파란 나비', place: '나비 날개', stages: [
    { z: 0,   size: 60,    find: '책상 위의 파란 나비 표본이에요.' },
    { z: 0.7, size: 10,    key: '파란 면', find: '파란 면이에요. 물감을 칠한 것 같아요.' },
    { z: 2.4, size: 0.1,   key: '겹친 비늘', find: '기왓장처럼 겹친 비늘이에요!' },
    { z: 3.9, size: 0.001, key: '비늘의 가는 골', find: '비늘 겉에 아주 가는 골이 줄지어 나 있어요.' },
  ] },
  salt: { name: '소금 그릇', place: '소금 알갱이', stages: [
    { z: 0,   size: 60,    find: '책상 위의 소금 그릇이에요.' },
    { z: 0.6, size: 10,    key: '흰 가루', find: '흰 가루예요.' },
    { z: 2.0, size: 0.3,   key: '유리 주사위', find: '하나하나가 유리 주사위예요!' },
    { z: 3.4, size: 0.01,  key: '주사위 겉의 계단', find: '주사위 겉에 네모난 계단 무늬가 있어요.' },
  ] },
  moss: { name: '이끼 낀 돌', place: '이끼의 물방울', stages: [
    { z: 0,   size: 60,    find: '책상 위의 이끼 낀 돌이에요.' },
    { z: 0.5, size: 20,    key: '초록 덩어리', find: '초록 덩어리예요.' },
    { z: 1.6, size: 1,     key: '이끼 잎 숲', find: '이끼 잎이 숲처럼 서 있어요. 잎 끝에 물방울이 맺혀 있어요.' },
    { z: 2.3, size: 0.3,   key: '물곰', find: '물방울 속을 뒤뚱뒤뚱 걷는 물곰이에요! 다리가 여덟. 휙 지나가는 짚신벌레도 있어요.' },
  ] },
  velcro: { name: '운동화', place: '벨크로', stages: [
    { z: 0,   size: 250,   find: '책상 위의 찍찍이 운동화예요.' },
    { z: 0.5, size: 20,    key: '까슬한 면', find: '까슬한 면이에요.' },
    { z: 1.4, size: 1,     key: '갈고리 숲과 고리 숲', find: '갈고리 숲과 고리 숲이에요!' },
    { z: 2.3, size: 0.3,   key: '휜 갈고리', find: '갈고리 하나하나가 낚싯바늘처럼 휜 플라스틱이에요.' },
  ] },
  hair: { name: '머리카락', place: '머리카락', stages: [
    { z: 0,   size: 150,   find: '책상 위에 떨어진 머리카락 한 올이에요.' },
    { z: 0.6, size: 20,    key: '한 올', find: '가느다란 한 올이에요.' },
    { z: 2.4, size: 0.07,  key: '밧줄 굵기', find: '밧줄처럼 굵어 보여요.' },
    { z: 3.4, size: 0.005, key: '비늘 기둥', find: '겉이 비늘로 덮인 기둥이에요!' },
  ] },
  pencil: { name: '연필 글씨', place: '연필 글씨', stages: [
    { z: 0,   size: 100,   find: '책상 위 종이에 쓴 연필 글씨예요.' },
    { z: 0.6, size: 5,     key: '검은 선', find: '검은 선이에요.' },
    { z: 2.2, size: 0.02,  key: '종이 섬유', find: '종이는 섬유가 얽힌 숲이에요.' },
    { z: 3.3, size: 0.005, key: '반짝이는 검은 조각', find: '섬유 사이에 반짝이는 검은 조각들이 끼어 있어요.' },
  ] },
  sand: { name: '모래 한 줌', place: '모래', stages: [
    { z: 0,   size: 50,    find: '책상 위의 모래 한 줌이에요.' },
    { z: 0.6, size: 10,    key: '다 같은 모래', find: '다 같은 모래 같아요.' },
    { z: 1.8, size: 0.5,   key: '보석 더미', find: '알마다 색과 모양이 다른 보석 더미예요!' },
    { z: 2.4, size: 0.3,   key: '조개 조각', find: '모래알 사이에 작은 조개 조각이 끼어 있어요.' },
  ] },
  pollen: { name: '꽃', place: '꽃가루', free: true, stages: [
    { z: 0,   size: 40,    find: '책상 위 꽃병의 꽃이에요.' },
    { z: 0.6, size: 5,     key: '노란 가루', find: '노란 가루예요.' },
    { z: 3.0, size: 0.03,  key: '가시 돋친 공', find: '가시 돋친 공들이에요!' },
    { z: 3.8, size: 0.003, key: '공 겉의 구멍', find: '공 겉에 작은 구멍이 나 있어요.' },
  ] },
};
export const DESK = Object.keys(OBJECTS);

export const SAYS = {
  dark:      '너무 어두워요. 손전등을 켜요.',
  deep:      '여기부터는 빛의 물결보다 작아서 또렷이 볼 수 없어요.',
  flipped:   '비늘을 뒤집으니 갈색이에요! 파랑은 물감이 아니에요.',
  flipEarly: '비늘이 보일 때까지 작아져야 뒤집을 수 있어요.',
  sheen:     '손전등을 비스듬히 비추니 파랑이 보랏빛으로 흘러요.',
  stuck:     '갈고리가 고리에 걸렸어요. 그래서 붙어요.',
  apart:     '떼니 갈고리가 휘었다가 풀려요. 찍— 소리가 이거예요.',
  velcroFar: '찍찍 붙었다 떨어져요. 갈고리가 보일 만큼 작아져서 봐요.',
  walk:      '물곰이 물방울 속을 뒤뚱뒤뚱 걸어요.',
  drying:    '물이 말라 가요. 물곰이 다리를 오므려요.',
  tun:       '물곰이 통처럼 오그라들어 멈췄어요.',
  waking:    '물을 주니 물곰이 부풀어 올라요…',
  revived:   '물곰이 다시 걸어요!',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const zMax = free => (free ? Z_MAX_FREE : Z_MAX);

/** 지금 단계(0 = 책상 위, 1~3 = 찾은 것) */
export function stageAt(obj, z) {
  const st = OBJECTS[obj].stages; let i = 0;
  for (let k = 1; k < st.length; k++) if (z >= st[k].z) i = k;
  return i;
}
/** 단계 겹침: [{ i, a }] — a 를 모두 더하면 1, z 를 조금 움직이면 a 도 조금만 바뀐다 */
export function blend(obj, z) {
  const st = OBJECTS[obj].stages, w = st.map(() => 0);
  const i = stageAt(obj, z); w[i] = 1;
  const nx = st[i + 1], here = st[i];
  if (nx && z > nx.z - FADE) { const f = (z - (nx.z - FADE)) / (2 * FADE); w[i] = 1 - f; w[i + 1] = f; }
  else if (i > 0 && z < here.z + FADE) { const f = (z - (here.z - FADE)) / (2 * FADE); w[i - 1] = 1 - f; w[i] = f; }
  return w.map((a, k) => ({ i: k, a })).filter(q => q.a > 1e-9);
}
/** 크기 자: 보이는 너비에 견줄 것 하나 */
export const RULERS = [
  { name: '연필', mm: 175 },
  { name: '쌀알', mm: 5 },
  { name: '머리카락 굵기', mm: 0.07 },
  { name: '머리카락 굵기의 백 분의 일', mm: 0.0007 },
];
export function ruler(z) {
  const f = field(z), target = f * 0.3;
  const r = RULERS.reduce((a, b) => (Math.abs(Math.log(b.mm / target)) < Math.abs(Math.log(a.mm / target)) ? b : a));
  return { ...r, frac: r.mm / f };
}
/** 손전등 각(라디안, 0 = 똑바로)에 따라 나비 파랑이 흐른다 — 구조색 */
export const sheen = angle => clamp(Math.abs(angle) / 1.2, 0, 1);   // 0 = 파랑, 1 = 보랏빛

export function view(obj, z, opts = {}) {
  const O = OBJECTS[obj] ? OBJECTS[obj] : OBJECTS.butterfly, key = OBJECTS[obj] ? obj : 'butterfly';
  const zz = clamp(z, 0, zMax(opts.free));
  const stage = stageAt(key, zz), S = O.stages[stage];
  const dark = zz >= DARK_Z && !opts.light, deep = zz >= DEEP_Z;
  const flipped = key === 'butterfly' && !!opts.flipped && stage >= 2;
  let says = S.find;
  if (flipped) says = SAYS.flipped;
  else if (key === 'butterfly' && stage >= 1 && opts.light && sheen(opts.lightA || 0) > 0.6) says += ' ' + SAYS.sheen;
  if (deep) says = S.find + ' ' + SAYS.deep;
  if (dark) says = SAYS.dark;
  return { obj: key, z: zz, stage, key: S.key || '', find: S.find, says, field: field(zz), ruler: ruler(zz), blend: blend(key, zz), dark, deep, flipped };
}

/** 벨크로: 붙였다 떼기 */
export function velcro(state, stage) {
  const next = state === 'stuck' ? 'apart' : 'stuck';
  return { state: next, says: stage >= 2 ? SAYS[next] : SAYS.velcroFar };
}

/** 물곰: { wet, water, form:'walk'|'tun'|'waking', wake, revived } 를 dt 초만큼 */
export const DRY_SPEED = 1 / 3, TUN_AT = 0.2, WAKE_TIME = 3;
export function tardiStep(s, dt) {
  const n = { ...s };
  if (!n.wet) {
    n.water = Math.max(0, n.water - DRY_SPEED * dt);
    if (n.water < TUN_AT) n.form = 'tun';
  } else {
    n.water = Math.min(1, n.water + dt);
    if (n.form === 'tun') { n.form = 'waking'; n.wake = 0; }
    if (n.form === 'waking') { n.wake += dt; if (n.wake >= WAKE_TIME) { n.form = 'walk'; n.revived = true; } }
  }
  return n;
}
export const tardiNew = () => ({ wet: true, water: 1, form: 'walk', wake: 0, revived: false });
export function tardiSays(s) {
  if (s.form === 'tun') return SAYS.tun;
  if (s.form === 'waking') return SAYS.waking;
  if (!s.wet) return SAYS.drying;
  return s.revived ? SAYS.revived : SAYS.walk;
}

/** 물곰 사진이 잘 찍히는 범위: 물곰(0.3mm)이 화면에 다 들어오고 너무 작지도 않을 때 */
export const TARDI_Z = [2.3, 2.8];                  // 2.8 에서 물곰이 보이는 너비의 95%

/** 의뢰 셋 — 상태 s = { obj, z, light, flipped, photo } */
export const MISSIONS = [
  { id: 'tardigrade', say: '물곰을 찾아 사진을 찍어라', hint: '이끼의 물방울 속. 아주 작아져야 하고, 손전등도 켜요.', why: 1,
    ok: s => !!s.photo && s.obj === 'moss' && s.z >= TARDI_Z[0] && s.z <= TARDI_Z[1] && !!s.light,
    tell: s => s.obj !== 'moss' ? '물곰은 이끼의 물방울 속에 살아요.'
      : s.z < TARDI_Z[0] ? '더 작아져요. 물방울 속까지.'
      : s.z > TARDI_Z[1] ? '너무 가까워요. 물곰이 화면보다 커요. 조금 커져요.'
      : !s.light ? SAYS.dark
      : '찍기를 눌러요.' },
  { id: 'blue', say: '파란 나비가 왜 파란지 밝혀라', hint: '비늘이 보일 만큼 작아진 다음, 비늘 하나를 눌러 뒤집어 봐요.', why: 0,
    ok: s => s.obj === 'butterfly' && !!s.flipped && stageAt('butterfly', s.z) >= 2 && !!s.light,
    tell: s => s.obj !== 'butterfly' ? '파란 나비 날개로 들어가요.'
      : stageAt('butterfly', s.z) < 2 ? '비늘이 보일 때까지 작아져요.'
      : !s.light ? SAYS.dark
      : '비늘 하나를 눌러 뒤집어 봐요.' },
  { id: 'dice', say: '책상 위에서 주사위 모양을 찾아라', hint: '흰 가루 하나를 아주 가까이.', why: 'all',
    ok: s => !!s.photo && s.obj === 'salt' && stageAt('salt', s.z) >= 2 && !!s.light,
    tell: s => s.obj === 'sand' ? '모래알은 모양이 제각각이에요. 다른 흰 가루를 찾아요.'
      : s.obj !== 'salt' ? '여기엔 주사위가 없어요. 흰 가루를 찾아요.'
      : stageAt('salt', s.z) < 2 ? '아직 가루로 보여요. 더 작아져요.'
      : !s.light ? SAYS.dark
      : '찍기를 눌러요.' },
];

export const WHY = [
  '나비의 파랑은 물감이 아니에요. 비늘에 난 아주 가는 골이 빛을 튕겨 파랗게 보이게 해요.',
  '물곰은 다 자라도 깨알보다 작아요. 말라도, 얼어도 죽지 않고 버텨요.',
];
