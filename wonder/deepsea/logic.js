/* 케이원더 · 깊은 바다 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 잠수정 하나가 아래위로만 움직인다. 깊이 단위 = m. 시간 단위 = 놀이 초(진짜보다 훨씬 빠르다).
 *   createDive()      → 상태 s
 *   step(s, dt)       → 일어난 일 [{ k, say, … }]   (흐른 시간만큼 내려가기·전지·기다림)
 *   setLever(s, v)    v: -1(위로 빠르게) … 0(멈춤) … +1(내려가기 빠르게)
 *   setLight(s, on) · setDir(s, 'left'|'ahead'|'right') · tapWindow(s) · takePhoto(s)  → 일어난 일
 *   visible(s)        → 지금 창밖에 보이는 것 [{ id, name, glow }]
 *
 * 놀이로 줄인 것:
 *   - 빠르기 = 레버 × 400 m/초(놀이 초). 레버 0.8 넘게 1.2초 내려가면 「너무 빠름」 → 자동 멈춤, 사고 기록.
 *   - 길: 6,000m 깊은 바닥(평평한 바닥, 고래 뼈대가 있다) 옆에 바다 골짜기(10,900m)가 붙어 있다.
 *         깊은 바닥에 내린 뒤 레버를 계속 내리면 골짜기 쪽으로 넘어간다.
 *   - 뜨거운 물 굴뚝은 깊은 바닥 오른쪽(5,600~6,000m). 탐조등을 켜고 오른쪽으로 비춰야 보인다.
 *   - 전지: 물속에 있으면 초당 0.5%(숨 쉬는 공기 장치·모터), 탐조등을 켜면 초당 2.5% 더. 0 이 되면 비상으로 떠오른다.
 *     물 위로 돌아오면 새 전지·새 컵으로 갈아 단다(그 잠수가 하나의 기록).
 *   - 스티로폼 컵 크기(처음 = 1) = 0.3 + 0.7 × e^(-가장 깊이/3000). 한 번 쪼그라들면 다시 안 커진다.
 *     「엄지만」 = 0.35배 이하(9cm 컵 → 3cm 남짓) — 8,000m 아래, 곧 바다 골짜기에서만 된다.
 */

export const LAYERS = [
  { id: 'sun',      name: '햇빛 층',     top: 0,    bottom: 200 },
  { id: 'twilight', name: '어스름 층',   top: 200,  bottom: 1000 },
  { id: 'midnight', name: '캄캄한 층',   top: 1000, bottom: 4000 },
  { id: 'abyss',    name: '깊은 바닥',   top: 4000, bottom: 6000 },
  { id: 'hadal',    name: '바다 골짜기', top: 6000, bottom: 11000 },
];
export const PLAIN = 6000, TRENCH = 10900;          // 깊은 바닥 · 바다 골짜기 바닥
export const VENT_TOP = 5600, VENT_DIR = 'right';   // 굴뚝 자리
export const RED_GONE = 50;                          // 빨간빛이 거의 사라지는 깊이
export const SUN_GONE = 200;                         // 햇빛이 거의 못 내려가는 깊이
export const SPEED = 400, DEAD = 0.05, FAST = 0.8, FAST_T = 1.2, LOCK_T = 2, HOP_T = 1.5, EMERG = 300;
export const BATTERY = { base: 0.5, light: 2.5, low: 20 };
export const CUP_MIN = 0.3, CUP_K = 3000, THUMB = 0.35, CUP_CM = 9;
export const WAIT = { jelly: 1.5, lantern: 3, angler: 4 };   // 불을 끄고 몇 초 기다리면 나오나
export const DIRS = { left: '왼쪽', ahead: '앞', right: '오른쪽' };

export const SAYS = {
  descend:   '내려갈수록 물색이 하늘색 → 파랑 → 남색 → 검정으로 바뀌어요.',
  sungone:   '창 위쪽의 햇빛 무늬가 사라졌어요. 햇빛은 200m 아래로는 거의 못 내려와요.',
  redfish:   '빨간 물고기가 창밖을 지나가요.',
  redblack:  '창밖 빨간 물고기가 검게 보여요! 빨간빛이 가장 먼저 사라져요.',
  redback:   '탐조등을 켜니 물고기가 다시 빨개요.',
  glow:      '어둠 속에 푸른 점들이 하나둘 — 빛나는 해파리, 등불 물고기 떼.',
  snow:      '빛나던 것들이 달아나고, 불빛 속에는 바다 눈(하얀 부스러기)만 흩날려요.',
  angler:    '캄캄한 데서 기다리니… 작은 초롱 하나가 천천히 다가와요.',
  teeth:     '불을 켜니 — 이빨! 초롱아귀였어요. 깜짝 놀라 달아나요.',
  flash:     '톡톡! 둘레의 작은 것들이 한꺼번에 번쩍 푸른 불빛을 내요(놀라면 빛나요).',
  tapbright: '톡톡. 여기는 밝아서 작은 것들의 불빛이 안 보여요.',
  taplight:  '톡톡. 불이 켜져 있어 작은 것들이 이미 달아났어요. 불을 끄고 두드려 봐요.',
  squeeze:   '매단 스티로폼 컵이 점점 쪼그라들어요. 선체가 끼익 울어요.',
  ventnear:  '어디선가 따뜻한 물이 아른거리며 올라와요. 캄캄해서 안 보여요.',
  vent:      '뜨거운 물 굴뚝에서 검은 연기가 솟아요. 둘레에 하얀 게와 붉은 관 벌레 숲 — 해도 없는 곳의 생물 마을!',
  land:      '바닥에 내렸어요. 고래 뼈대와 거기 모인 것들 — 흙먼지가 천천히 일어요.',
  edge:      '바닥 끝에서 바다 골짜기로 넘어가요. 더 깊이!',
  landdeep:  '바다 골짜기 바닥, 가장 깊은 곳에 내렸어요. 흙먼지가 천천히 일어요.',
  alarm:     '삐익! 압력 경보, 창에서 쩍 금 가는 소리 — 너무 빨라요. 자동으로 멈췄어요(사고 기록).',
  low:       '전지가 얼마 안 남았어요. 탐조등을 아껴요.',
  out:       '전지가 다 떨어졌어요! 추를 버리고 비상으로 떠올라요.',
  surface:   '물 위로 돌아왔어요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const layerAt = d => LAYERS.find(L => d < L.bottom || (L.id === 'abyss' && d === PLAIN)) || LAYERS[LAYERS.length - 1];   // 깊은 바닥에 내려앉은 6,000m 는 깊은 바닥
/** 물색(사람 말) — 하늘색 → 파랑 → 남색 → 검정 */
export function waterColor(d) {
  if (d < 60) return { name: '하늘색', level: 0 };
  if (d < 250) return { name: '파랑', level: 1 };
  if (d < 800) return { name: '남색', level: 2 };
  return { name: '검정', level: 3 };
}
/** 물빛 밝기(1 = 물 위, 0 = 캄캄) — 깊이마다 빛이 줄어든다 */
export const brightness = d => Math.exp(-d / 70);
/** 창 위쪽 햇빛 무늬 세기 */
export const sunPattern = d => Math.max(0, 1 - d / SUN_GONE);
/** 컵 크기(처음 = 1) */
export const cupScale = maxDepth => CUP_MIN + (1 - CUP_MIN) * Math.exp(-Math.max(0, maxDepth) / CUP_K);
/** 누르는 힘 — 기압 수(물 위 = 1) · 엄지손톱(1cm²)에 올라선 무게(kg) */
export const pressure = d => 1 + d / 10;
export const thumbKg = d => Math.round(1.033 * pressure(d));
const fmt = d => Math.round(d).toLocaleString('en-US');

export function createDive(opts = {}) {
  return {
    t: 0, depth: 0, lever: 0, light: false, dir: 'ahead', battery: 100, free: !!opts.free,
    maxDepth: 0, stage: 'plain', landed: false, hopT: 0, fastT: 0, lockT: 0, emergency: false, lowSaid: false,
    layer: 'sun', darkT: 0, stillT: 0, anglerNear: false, teethT: 0, flashT: 0, dustT: 0,
    seen: [], wasBlack: false, ventHinted: false,
    found: { vent: false }, photos: [], lastPhoto: null, accidents: [], lastDive: null, dives: 0,
  };
}

/** 지금 창밖에 보이는 것 */
export function visible(s) {
  const out = [], d = s.depth, L = layerAt(d).id, put = (id, name, glow = false) => out.push({ id, name, glow });
  if (d > 0 && d < SUN_GONE) put(d >= RED_GONE && !s.light ? 'redfish_black' : 'redfish_red', d >= RED_GONE && !s.light ? '빨간 물고기(검게 보임)' : '빨간 물고기');
  if (L === 'twilight' && !s.light) {
    if (s.darkT >= WAIT.jelly) put('jelly', '빛나는 해파리', true);
    if (s.darkT >= WAIT.lantern) put('lantern', '등불 물고기 떼', true);
  }
  if (s.light && d >= SUN_GONE) put('snow', '바다 눈');
  if (s.anglerNear && !s.light) put('angler', '초롱아귀의 초롱', true);
  if (s.teethT > 0) put('teeth', '초롱아귀(이빨!)');
  if (s.flashT > 0) put('flash', '놀라 번쩍이는 작은 것들', true);
  if (nearVent(s) && s.light && s.dir === VENT_DIR) put('vent', '뜨거운 물 굴뚝 마을');
  if (s.landed && s.stage === 'plain') put('whale', '고래 뼈대와 모인 것들');
  if (s.landed && s.stage === 'trench') put('trenchfloor', '바다 골짜기 바닥');
  return out;
}
export const nearVent = s => s.stage === 'plain' && s.depth >= VENT_TOP;

/** 보이는 것이 바뀐 만큼 일어난 일을 낸다(순서 = 화면에 마지막으로 남길 우선순위의 반대) */
const ORDER = ['redfish_red', 'redfish_black', 'snow', 'jelly', 'lantern', 'angler', 'flash', 'vent', 'teeth'];
function observe(s, ev) {
  const now = visible(s), ids = now.map(v => v.id), before = s.seen;
  for (const id of ORDER) {
    if (!ids.includes(id) || before.includes(id)) continue;
    if (id === 'redfish_red') ev.push({ k: s.wasBlack ? 'redback' : 'redfish', say: s.wasBlack ? SAYS.redback : SAYS.redfish });
    if (id === 'redfish_black') { s.wasBlack = true; ev.push({ k: 'redblack', say: SAYS.redblack }); }
    if (id === 'snow') ev.push({ k: 'snow', say: SAYS.snow });
    if (id === 'jelly') ev.push({ k: 'glow', say: SAYS.glow, what: '빛나는 해파리' });
    if (id === 'lantern') ev.push({ k: 'glow', say: SAYS.glow, what: '등불 물고기 떼' });
    if (id === 'angler') ev.push({ k: 'angler', say: SAYS.angler });
    if (id === 'flash') ev.push({ k: 'flash', say: SAYS.flash });
    if (id === 'vent') { s.found.vent = true; ev.push({ k: 'vent', say: SAYS.vent }); }
    if (id === 'teeth') ev.push({ k: 'teeth', say: SAYS.teeth });
  }
  if (!ids.some(i => i.startsWith('redfish'))) s.wasBlack = false;
  if (nearVent(s) && !ids.includes('vent') && !s.ventHinted && !s.found.vent) { s.ventHinted = true; ev.push({ k: 'ventnear', say: SAYS.ventnear }); }
  s.seen = ids;
  return ev;
}

export function setLever(s, v) {
  if (s.emergency || s.lockT > 0) return false;
  s.lever = clamp(v, -1, 1); return true;
}
export function setLight(s, on) {
  const ev = [];
  if (s.emergency && on) return ev;
  if (on && !s.light && s.anglerNear) { s.anglerNear = false; s.teethT = 2.5; }
  s.light = !!on;
  if (s.light) s.darkT = 0;
  return observe(s, ev);
}
export function setDir(s, dir) { if (DIRS[dir]) s.dir = dir; return observe(s, []); }
export function tapWindow(s) {
  const ev = [];
  if (s.depth < SUN_GONE) ev.push({ k: 'tapbright', say: SAYS.tapbright });
  else if (s.light) ev.push({ k: 'taplight', say: SAYS.taplight });
  else s.flashT = 1.6;
  return observe(s, ev);
}
export function takePhoto(s) {
  const now = visible(s), glow = now.filter(v => v.glow), names = now.filter(v => v.id !== 'snow').map(v => v.name);
  const p = { t: s.t, depth: s.depth, light: s.light, glow: glow.map(v => v.id), names };
  s.photos.push(p); s.lastPhoto = p;
  let say;
  if (glow.length) say = `찰칵! ${glow.map(v => v.name).join(', ')} — 빛나는 것이 찍혔어요.`;
  else if (s.light && s.depth >= SUN_GONE) say = '찰칵! 바다 눈만 찍혔어요. 빛나는 것들은 불빛을 보고 달아났어요.';
  else if (names.length) say = `찰칵! ${names.join(', ')} 사진이에요. 빛나는 것은 아니에요.`;
  else say = '찰칵! 캄캄한 물만 찍혔어요.';
  return [{ k: 'photo', say, photo: p }];
}
export const glowKinds = s => new Set(s.photos.flatMap(p => p.glow)).size;

/** 물 위로 돌아오면 새 잠수(전지·컵 새것) */
export function newDive(s) {
  Object.assign(s, { depth: 0, lever: 0, light: false, battery: 100, maxDepth: 0, stage: 'plain', landed: false, hopT: 0, fastT: 0, lockT: 0,
    emergency: false, lowSaid: false, darkT: 0, stillT: 0, anglerNear: false, teethT: 0, flashT: 0, dustT: 0, seen: [], wasBlack: false, ventHinted: false });
  return s;
}

export function step(s, dt) {
  const ev = [];
  s.t += dt;
  for (const k of ['lockT', 'teethT', 'flashT', 'dustT']) if (s[k] > 0) s[k] = Math.max(0, s[k] - dt);
  // 전지
  if (!s.free && !s.emergency && s.depth > 0) {
    s.battery = Math.max(0, s.battery - (BATTERY.base + (s.light ? BATTERY.light : 0)) * dt);
    if (s.battery <= BATTERY.low && !s.lowSaid) { s.lowSaid = true; ev.push({ k: 'low', say: SAYS.low }); }
    if (s.battery <= 0) { s.emergency = true; s.light = false; s.lever = 0; ev.push({ k: 'out', say: SAYS.out }); }
  }
  // 움직임
  const prev = s.depth, prevMax = s.maxDepth;
  let rate = s.emergency ? -EMERG : s.lockT > 0 || Math.abs(s.lever) < DEAD ? 0 : s.lever * SPEED;
  if (s.landed && rate > 0) {
    rate = 0;
    if (s.stage === 'plain') { s.hopT += dt; if (s.hopT >= HOP_T) { s.stage = 'trench'; s.landed = false; s.hopT = 0; ev.push({ k: 'edge', say: SAYS.edge }); } }
  } else s.hopT = 0;
  if (!s.emergency && s.lever > FAST && rate > 0) {
    s.fastT += dt;
    if (s.fastT >= FAST_T) {
      s.fastT = 0; s.lever = 0; s.lockT = LOCK_T; rate = 0;
      s.accidents.push({ depth: Math.round(prev), t: s.t }); ev.push({ k: 'alarm', say: SAYS.alarm + ` (${fmt(prev)}m)` });
    }
  } else s.fastT = 0;
  let d = prev + rate * dt;
  const floor = s.stage === 'plain' ? PLAIN : TRENCH;
  let touch = null;
  if (d >= floor) {
    d = floor;
    if (!s.landed) { s.landed = true; s.dustT = 4; touch = s.stage === 'plain' ? { k: 'land', say: SAYS.land } : { k: 'landdeep', say: SAYS.landdeep }; }
  }
  if (d < prev) s.landed = false;
  if (s.stage === 'trench' && d < PLAIN) s.stage = 'plain';
  let surfaced = false;
  if (d <= 0) { d = 0; if (prev > 0) surfaced = true; }
  s.depth = d; s.maxDepth = Math.max(s.maxDepth, d);
  // 내려가며 바뀌는 것
  if (d > prev) {
    const c0 = waterColor(prev), c1 = waterColor(d);
    if (c1.level > c0.level) ev.push({ k: 'descend', color: c1.name, say: `물색이 ${c1.name}으로 바뀌어요. ` + SAYS.descend });
    if (prev < SUN_GONE && d >= SUN_GONE) ev.push({ k: 'sungone', say: SAYS.sungone });
    if (d > prevMax && Math.floor(d / 1000) > Math.floor(prevMax / 1000) && d >= 1000) {
      const c = cupScale(s.maxDepth);
      ev.push({ k: 'squeeze', cup: c, say: SAYS.squeeze + ` (컵이 처음의 ${c.toFixed(2)}배 · 엄지손톱에 ${thumbKg(d).toLocaleString('en-US')}kg)` });
    }
  }
  if (touch) ev.push(touch);                          // 바닥에 닿은 일은 지나온 일들보다 뒤에(화면에 남게)
  // 기다림
  const L = layerAt(d).id;
  if (L !== s.layer) { s.layer = L; s.darkT = 0; s.stillT = 0; s.anglerNear = false; }
  const still = rate === 0;
  if (!s.light) s.darkT += dt; else s.darkT = 0;
  if (!s.light && still) s.stillT += dt; else s.stillT = 0;
  if (!still) s.anglerNear = false;
  if (L === 'midnight' && s.stillT >= WAIT.angler && !s.light) s.anglerNear = true;
  observe(s, ev);
  if (surfaced) {
    const cup = cupScale(s.maxDepth);
    s.lastDive = { maxDepth: s.maxDepth, cup, emergency: s.emergency, battery: s.battery, accidents: s.accidents.length };
    s.dives++;
    const say = (s.emergency ? '비상 떠오르기 끝 — ' : '') + SAYS.surface + ` 가장 깊이 ${fmt(s.maxDepth)}m · 컵은 처음의 ${cup.toFixed(2)}배`
      + (cup <= THUMB ? '(엄지만 해졌어요!)' : '') + '. 새 전지와 새 컵을 달아요.';
    newDive(s);
    ev.push({ k: 'surface', say, dive: s.lastDive });
  }
  return ev;
}

/** 의뢰 셋 — ok(s) 맞았나, tell(s) 아니면 무엇이 걸렸나 */
export const MISSIONS = [
  { id: 'glow3', say: '빛나는 것 셋을 찍어라', hint: '어스름 층 아래에서 불을 끄고 기다려요. 창을 두드려도 좋아요.', why: 0,
    ok: s => glowKinds(s) >= 3,
    tell: s => {
      const p = s.lastPhoto, n = glowKinds(s);
      if (p && !p.glow.length && p.light && p.depth >= SUN_GONE) return '불이 켜져 있으면 빛나는 것들이 달아나요.';
      if (p && !p.glow.length && p.depth < SUN_GONE) return '여기는 밝아서 빛나는 것이 안 보여요. 더 깊이.';
      if (p && !p.glow.length) return '빛나는 것이 안 찍혔어요. 불을 끄고 조금 기다려요.';
      return `빛나는 것 ${n}가지를 찍었어요. ${3 - n}가지 더.`;
    } },
  { id: 'vent', say: '해도 없는 곳의 생물 마을을 찾아라', hint: '깊은 바닥 가까이, 따뜻한 물이 올라오는 쪽을 비춰요.', why: 0,
    ok: s => s.found.vent,
    tell: s => s.stage === 'trench' ? '너무 깊이 왔어요. 마을은 바다 골짜기 위, 깊은 바닥에 있어요.'
      : s.depth < VENT_TOP ? '더 깊이 — 깊은 바닥(6,000m) 가까이까지 내려가요.'
      : !s.light ? '캄캄해서 안 보여요. 탐조등을 켜요.'
      : s.dir !== VENT_DIR ? '거기는 아무것도 없어요. 탐조등을 다른 쪽으로 돌려 봐요.' : '' },
  { id: 'cup', say: '컵을 엄지만 하게 만들어 돌아오라', hint: '가장 깊은 곳까지 갔다 와야 해요. 전지가 닳으니 탐조등을 아껴요.', why: 1,
    ok: s => !!s.lastDive && !s.lastDive.emergency && s.lastDive.cup <= THUMB,
    tell: s => !s.lastDive ? '아직 물 위로 돌아오지 않았어요.'
      : s.lastDive.emergency ? '전지가 다 떨어져 비상으로 떠올랐어요. 탐조등을 아껴요.'
      : `컵이 처음의 ${s.lastDive.cup.toFixed(2)}배예요. 엄지만 하려면 바다 골짜기까지 더 깊이.` },
];

export const WHY = [
  '햇빛은 200m 아래로는 거의 못 내려가요. 그 아래 생물들은 제 몸으로 빛을 만들어요 — 먹이를 꾀고, 짝을 찾고, 적을 놀라게 하려고.',
  '깊이 들어갈수록 위에 쌓인 물이 무겁게 눌러요. 가장 깊은 곳은 엄지손톱 위에 자동차 한 대가 올라선 만큼.',
];
