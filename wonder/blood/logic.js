/* 케이원더 · 혈관 속 — 논리(그림을 모른다. node 로 시험한다)
 *
 * 아주 작은 잠수정이 적혈구들과 함께 몸을 한 바퀴 돈다. 길이 단위 = 칸, 시간 = 초.
 *   한 바퀴 길: 심장(왼쪽 방) → 굵은 길 → [갈림길: 손·머리·발] 가는 길 → 실핏줄 → 돌아오는 길
 *              → 심장(오른쪽 방) → 허파로 가는 길 → 허파의 실핏줄 → 허파에서 돌아오는 길 → 심장(왼쪽 방)
 *   createRide()     → 상태 s
 *   step(s, dt)      → 일어난 일 [{ k, say, … }]
 *   setLever(s, v)   v: -1(힘껏 버티기) … 0(흐름 타기) … +1(앞으로 밀기)
 *   setFork(s, '손'|'머리'|'발') · setRun(s, 달리기?) · setLight(s, 켜기?)
 *   markHere(s)      「여기!」 단추 — 지금 자리와 피 색을 짚는다(의뢰 2)
 *   answerLap(s, n)  「심장을 몇 번 지났나요?」에 답한다(의뢰 3)
 *   parked: true 면 처음 손대기 전까지 심장 안에서 기다린다(판에서만 켠다)
 *   view(s)          → 그리기에 쓸 지금 모습(굴 넓이·불룩함·한 줄·색·공기주머니…)
 *
 * 맥박이 장면 전체의 박자다: 박자 안에서 심장이 조이는 동안(앞 35%)만 흐름이 세게 밀린다.
 * 놀이로 줄인 것:
 *   - 쉴 때 맥박 70, 달리면 140. 달리면 흐름이 1.8배.
 *   - 흐름 빠르기는 길마다 하나의 수(굵은 길 2 · 가는 길 1 · 실핏줄 1/3 · 돌아오는 길 2/3 칸/초)에 맥박 모양을 곱한다.
 *     쉬면서 흐름만 타면 한 바퀴가 1분쯤(설계 까닭 「한 바퀴 도는 데 1분쯤」).
 *   - 산소(적혈구가 실은 몫, 0~1): 동맥 0.98. 몸의 실핏줄을 지나며 쉴 때 0.72, 달릴 때 0.5 까지 내려놓는다.
 *     허파의 실핏줄 앞쪽 40% 안에 다시 0.98. 0.9 이상 = 선홍색, 아래 = 검붉은색.
 *   - 상처(무릎)와 세균은 발 쪽 길에만 있다(까진 무릎으로 세균이 들어온 이야기).
 *   - 거꾸로는 길의 시작(심장 문·갈림목)까지만, 돌아오는 길에서는 지나온 문(판막)까지만 갈 수 있다.
 *   - 전지: 버티기·밀기·탐조등이 먹고, 손을 놓고 흐름만 타면 조금씩 찬다. 0 이면 흐름에 맡긴다.
 */

export const BRANCHES = { 손: '손끝', 머리: '머리', 발: '발끝' };
export const ORDER = ['heartL', 'aorta', 'artery', 'cap', 'vein', 'heartR', 'pa', 'lungcap', 'pv'];
export const SEG = {
  heartL:  { kind: 'heart', name: '심장(왼쪽 방)',      len: 1,  v: 0,    amp: 0,   width: 1.4 },
  aorta:   { kind: 'big',   name: '굵은 길',            len: 10, v: 2.0,  amp: 1.0, width: 1.0 },
  artery:  { kind: 'small', name: '가는 길',            len: 8,  v: 1.0,  amp: 0.6, width: 0.8, widthEnd: 0.3 },
  cap:     { kind: 'cap',   name: '실핏줄',             len: 4,  v: 1 / 3, amp: 0.1, width: 0.12 },
  vein:    { kind: 'vein',  name: '돌아오는 길',        len: 8,  v: 2 / 3, amp: 0,   width: 0.6, valves: [2, 4, 6] },
  heartR:  { kind: 'heart', name: '심장(오른쪽 방)',    len: 1,  v: 0,    amp: 0,   width: 1.4 },
  pa:      { kind: 'big',   name: '허파로 가는 길',     len: 5,  v: 1.4,  amp: 0.8, width: 0.9 },
  lungcap: { kind: 'cap',   name: '허파의 실핏줄',      len: 4,  v: 0.4,  amp: 0.1, width: 0.12 },
  pv:      { kind: 'vein',  name: '허파에서 돌아오는 길', len: 5, v: 1.0, amp: 0,   width: 0.6, valves: [] },
};
export const BPM = { rest: 70, run: 140 }, RUN_FLOW = 1.8, BREATH = { rest: 15, run: 30 };
export const SYSTOLE = 0.35;
export const O2 = { art: 0.98, rest: 0.72, run: 0.5, red: 0.9 };
export const BAT = { hold: 6, push: 2, light: 1, refill: 2, back: 10 };   // 초당 %
export const WOUND_AT = 0.5, GERM_AT = 0.2;                               // 길이에 대한 몫

export const SAYS = {
  beat:     '문(판막)이 닫혔다가 쿵 열리며 왈칵 밀려 나가요.',
  big:      '굵은 길 — 넓은 굴이에요. 맥박마다 벽이 불룩거리고 빨리 흘러요.',
  small:    '가는 길로 들었어요. 점점 좁아져요.',
  cap:      '실핏줄 — 적혈구가 한 줄로, 몸을 접어 가며 겨우 지나요.',
  capdark:  '여기서 선홍색이 검붉게 바뀌어요. 산소를 내려놓았어요.',
  vein:     '돌아오는 길 — 느려요. 군데군데 한쪽으로만 열리는 문이 있어요.',
  valve:    '한쪽으로만 열리는 문을 지났어요. 뒤에서 탁 닫혀요.',
  valveblock: '문이 닫혀 거꾸로 못 가요!',
  heartR:   '심장으로 돌아왔어요 — 이번엔 오른쪽 방이에요.',
  pa:       '허파로 가는 길이에요.',
  lung:     '허파의 실핏줄 — 벽 너머 공기주머니가 숨 쉴 때마다 부풀어요.',
  lungred:  '검붉던 것들이 선홍색으로 돌아와요! 산소를 새로 실었어요.',
  pv:       '허파에서 돌아오는 길 — 다시 심장으로.',
  lap:      '한 바퀴를 돌아 처음 자리(심장 왼쪽 방)로 돌아왔어요!',
  lapwhy:   '심장을 두 번 지났어요 — 몸 한 바퀴, 허파 한 바퀴.',
  run:      '달리기! 쿵쿵이 빨라지고 흐름이 거세져요.',
  rest:     '쉬기 — 맥박이 다시 느려져요.',
  wound:    '벽에 상처가 났어요! 작은 조각들(혈소판)이 몰려와 그물을 치고 구멍을 메워요.',
  germ:     '세균이에요! 흰 덩어리(백혈구)가 벽을 타고 기어와 꿀꺽 삼켜요.',
  hold:     '흐름을 거슬러 버텨요. 전지가 닳고 적혈구들이 창에 부딪쳐 와요.',
  out:      '전지가 다 떨어졌어요. 흐름에 맡겨요 — 흐름을 타면 다시 조금씩 차요.',
  light:    '탐조등을 켜니 벽의 주름과 가는 핏줄이 또렷해요.',
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/** 맥박 모양(박자 평균 = 1): 조이는 동안 솟고, 나머지는 낮게 */
export function pulseShape(phi) {
  const base = 0.15, k = (1 - base) / (SYSTOLE * 2 / Math.PI);
  return phi < SYSTOLE ? base + k * Math.sin(Math.PI * phi / SYSTOLE) : base;
}
/** 벽이 불룩한 정도(0~1) */
export const bulgeAt = phi => (phi < SYSTOLE ? Math.sin(Math.PI * phi / SYSTOLE) : 0);
export const colorName = o2 => (o2 >= O2.red ? '선홍색' : '검붉은색');
export const segName = s => {
  const id = ORDER[s.seg], b = s.branch || s.fork;
  if (id === 'artery') return `가는 길(${b} 쪽)`;
  if (id === 'cap') return `${BRANCHES[b]}의 실핏줄`;
  if (id === 'vein') return `${b}에서 돌아오는 길`;
  return SEG[id].name;
};

export function createRide(opts = {}) {
  return {
    t: 0, seg: 0, pos: 0, lever: 0, fork: opts.fork || '머리', branch: null, run: false, light: false, battery: 100, free: !!opts.free,
    phase: 0.5, breath: 0, o2: O2.art, o2In: O2.art, speed: 0, flow: 0, valveIdx: 0, bumps: 0, holdSaid: false, blockSaid: false, outLock: false,
    departed: false, lap: { started: false, hearts: 0, heartR: false, lung: false, done: false, laps: 0, t0: 0, time: 0 },
    parked: !!opts.parked, marked: null, answer: null, lastLap: null,
    reachedHand: false, lastCap: null, lungRed: false, darkSaid: false, woundSeen: false, germSeen: false, woundT: 0, germT: 0,
  };
}

export function setLever(s, v) { if (s.outLock && v !== 0) return false; s.lever = clamp(v, -1, 1); if (s.lever >= -0.3) s.holdSaid = false; return true; }
export function setFork(s, b) { if (BRANCHES[b]) s.fork = b; return []; }
export function setRun(s, on) { if (!!on === s.run) return []; s.run = !!on; return [{ k: on ? 'run' : 'rest', say: (on ? SAYS.run : SAYS.rest) + ` (맥박 ${on ? BPM.run : BPM.rest})` }]; }
export function setLight(s, on) { if (on && s.outLock) return []; s.light = !!on; return on ? [{ k: 'light', say: SAYS.light }] : []; }
export const bpm = s => (s.run ? BPM.run : BPM.rest);
/** 지금 자리의 흐름 빠르기(칸/초) */
export function flowAt(s) {
  const L = SEG[ORDER[s.seg]]; if (L.kind === 'heart') return 0;
  const phi = s.phase % 1;
  return L.v * (1 + L.amp * (pulseShape(phi) - 1)) * (s.run ? RUN_FLOW : 1);
}
/** 한 바퀴 다시 재기(의뢰 3 시작) — 다음에 왼쪽 방을 나설 때부터 */
export function resetLap(s) { s.lap = { started: false, hearts: 0, heartR: false, lung: false, done: false, laps: s.lap.laps, t0: 0, time: 0 }; }
/** 의뢰 3 을 처음부터: 바퀴도, 지난 바퀴 기록도, 답도 지운다 */
export function resetLapMission(s) { resetLap(s); s.lastLap = null; s.answer = null; }
/** 「여기!」 — 지금 자리를 짚는다 */
export function markHere(s) {
  const id = ORDER[s.seg]; s.marked = { seg: id, o2: s.o2, t: s.t };
  const say = id === 'lungcap' ? '여기! 허파의 실핏줄 — 검붉던 피가 선홍색으로 바뀌는 곳이에요.' : `여기는 ${segName(s)} — 피는 ${colorName(s.o2)}이에요.`;
  return [{ k: 'mark', seg: id, say }];
}
/** 「심장을 몇 번 지났나요?」 답 */
export function answerLap(s, n) { s.answer = n; return [{ k: 'answer', n, say: `${n}번이라고 답했어요.` }]; }

function enter(s, ev) {
  const id = ORDER[s.seg];
  s.pos = 0; s.valveIdx = 0; s.blockSaid = false;
  if (id === 'aorta') ev.push({ k: 'big', say: SAYS.big });
  if (id === 'artery') { s.branch = s.fork; s.woundSeen = false; ev.push({ k: 'small', say: SAYS.small + ` ${BRANCHES[s.branch]} 쪽으로 가요.`, branch: s.branch }); }
  if (id === 'cap') {
    s.lastCap = s.branch; s.o2In = s.o2; s.darkSaid = false;
    if (s.branch === '손' && s.departed) s.reachedHand = true;
    ev.push({ k: 'cap', say: `${BRANCHES[s.branch]}의 ` + SAYS.cap, branch: s.branch });
  }
  if (id === 'vein') { s.germSeen = false; ev.push({ k: 'vein', say: SAYS.vein }); }
  if (id === 'heartR') { if (s.lap.started) { s.lap.hearts++; s.lap.heartR = true; } ev.push({ k: 'heartR', say: SAYS.heartR }); }
  if (id === 'pa') ev.push({ k: 'pa', say: SAYS.pa });
  if (id === 'lungcap') { s.o2In = s.o2; s.redSaid = false; if (s.lap.started) s.lap.lung = true; ev.push({ k: 'lung', say: SAYS.lung }); }
  if (id === 'pv') ev.push({ k: 'pv', say: SAYS.pv });
  if (id === 'heartL') {
    s.branch = null;
    if (s.lap.started) {
      s.lap.hearts++;
      if (s.lap.heartR && s.lap.lung) { s.lap.done = true; s.lap.laps++; s.lap.time = s.t - s.lap.t0; s.lastLap = { hearts: s.lap.hearts, time: s.lap.time }; s.answer = null; ev.push({ k: 'lap', say: SAYS.lap + ` (${Math.round(s.lap.time)}초)`, time: s.lap.time }); }
    }
  }
}

export function step(s, dt) {
  const ev = [];
  s.t += dt;
  const ph0 = s.phase; s.phase += dt * bpm(s) / 60; s.breath += dt * (s.run ? BREATH.run : BREATH.rest) / 60;
  const beat = Math.floor(s.phase) > Math.floor(ph0);
  const id = ORDER[s.seg], L = SEG[id];
  // 전지
  const r = s.lever;
  if (!s.free) {
    const use = (r < -0.05 ? BAT.hold * -r * Math.min(2, flowAt(s) + (L.kind === 'heart' ? 1 : 0)) : 0) + (r > 0.05 ? BAT.push * r : 0) + (s.light ? BAT.light : 0);
    s.battery = clamp(s.battery + (use > 0 ? -use : BAT.refill) * dt, 0, 100);
    if (s.battery <= 0 && !s.outLock) { s.outLock = true; s.lever = 0; s.light = false; ev.push({ k: 'out', say: SAYS.out }); }
    if (s.outLock && s.battery >= BAT.back) s.outLock = false;
  }
  if (L.kind === 'heart') {
    s.speed = 0; s.flow = 0;
    if (beat) {
      if (s.lever > -0.5 && !s.parked) {                                      // 문이 열리면 왈칵(처음 손대기 전에는 기다린다)
        if (id === 'heartL') { s.departed = true; if (!s.lap.started || s.lap.done) { resetLap(s); s.lap.started = true; s.lap.t0 = s.t; } }
        ev.push({ k: 'beat', say: SAYS.beat + (id === 'heartR' ? ' 이번엔 허파 쪽으로!' : ''), from: id });
        s.seg = (s.seg + 1) % ORDER.length; enter(s, ev);
      } else if (!s.parked) holdNote(s, ev, 1);
    }
    return ev;
  }
  const flow = flowAt(s), f = r >= 0 ? 1 + 0.5 * r : 1 + 1.3 * r;
  s.flow = flow; s.speed = flow * f;
  let pos = s.pos + s.speed * dt;
  // 거꾸로: 지나온 문까지만
  const valves = L.valves || [], back = s.valveIdx > 0 ? valves[s.valveIdx - 1] : 0;
  if (pos < back) { pos = back; s.speed = 0; if (back > 0 && !s.blockSaid) { s.blockSaid = true; ev.push({ k: 'valveblock', say: SAYS.valveblock }); } }
  while (s.valveIdx < valves.length && pos >= valves[s.valveIdx]) { s.valveIdx++; s.blockSaid = false; ev.push({ k: 'valve', say: SAYS.valve }); }
  if (r < -0.3) holdNote(s, ev, flow - s.speed);
  // 산소
  if (id === 'cap') {
    const low = s.run ? O2.run : O2.rest, fr = clamp(pos / L.len, 0, 1);
    s.o2 = Math.min(s.o2, s.o2In + (low - s.o2In) * fr);
    if (s.o2 < O2.red && !s.darkSaid) { s.darkSaid = true; ev.push({ k: 'capdark', say: SAYS.cap + ' ' + SAYS.capdark }); }
  }
  if (id === 'lungcap') {
    s.o2 = Math.max(s.o2, s.o2In + (O2.art - s.o2In) * clamp(pos / (0.4 * L.len), 0, 1));
    if (s.o2 >= O2.red && s.o2In < O2.red && !s.redSaid) { s.redSaid = true; s.lungRed = true; ev.push({ k: 'lungred', say: SAYS.lungred }); }
  }
  // 상처·세균(발 쪽)
  if (id === 'artery' && s.branch === '발' && !s.woundSeen && pos >= WOUND_AT * L.len) { s.woundSeen = true; s.woundT = 4; ev.push({ k: 'wound', say: SAYS.wound }); }
  if (id === 'vein' && s.branch === '발' && !s.germSeen && pos >= GERM_AT * L.len) { s.germSeen = true; s.germT = 4; ev.push({ k: 'germ', say: SAYS.germ }); }
  if (s.woundT > 0) s.woundT = Math.max(0, s.woundT - dt);
  if (s.germT > 0) s.germT = Math.max(0, s.germT - dt);
  s.pos = pos;
  if (pos >= L.len) { s.seg = (s.seg + 1) % ORDER.length; enter(s, ev); }
  return ev;
}
function holdNote(s, ev, against) {
  s.bumps += Math.max(0, against) * 3;
  if (!s.holdSaid) { s.holdSaid = true; ev.push({ k: 'hold', say: SAYS.hold }); }
}

/** 그리기에 쓸 지금 모습 */
export function view(s) {
  const id = ORDER[s.seg], L = SEG[id], phi = s.phase % 1, fr = clamp(s.pos / L.len, 0, 1);
  let width = L.widthEnd ? L.width + (L.widthEnd - L.width) * fr : L.width;
  const bulge = (L.kind === 'big' ? 1 : L.kind === 'small' ? 0.5 : 0) * bulgeAt(phi);
  width *= 1 + 0.12 * bulge;
  const valves = L.valves || [], nextValve = valves[s.valveIdx], valveNear = nextValve != null && nextValve - s.pos < 1.2;
  return {
    id, kind: L.kind, name: segName(s), width, bulge, phi, flow: s.flow, speed: s.speed, singleFile: L.kind === 'cap',
    o2: s.o2, color: colorName(s.o2), alveoli: id === 'lungcap' ? 0.5 - 0.5 * Math.cos(2 * Math.PI * s.breath) : 0,
    valveNear, heartOpen: L.kind === 'heart' && phi < SYSTOLE, wound: s.woundT > 0 ? 1 - s.woundT / 4 : 0, germ: s.germT > 0 ? 1 - s.germT / 4 : 0,
    holding: s.lever < -0.3, bpm: bpm(s), battery: s.battery, fr,
  };
}

/** 의뢰 셋 — ok(s) 맞았나, tell(s) 아니면 무엇이 걸렸나 */
export const MISSIONS = [
  { id: 'hand', say: '심장에서 나가 손끝까지 가라', hint: '갈림길에서 손 쪽을 골라 두어요.', why: 0,
    ok: s => s.reachedHand,
    tell: s => s.lastCap && s.lastCap !== '손' ? `여기는 ${BRANCHES[s.lastCap]}의 실핏줄이에요. 갈림길에서 손 쪽을 골라요.` : '아직 손끝이 아니에요. 흐름을 타고 가요.' },
  { id: 'lung', say: '검붉은 피가 다시 붉어지는 곳을 찾아라', hint: '찾았다 싶으면 그 자리에서 「여기!」 단추를 눌러요.', why: 0,
    ok: s => !!s.marked && s.marked.seg === 'lungcap',
    tell: s => {
      const m = s.marked;
      if (!m) return s.o2 < O2.red ? '아직 검붉어요. 숨 쉬는 곳을 지나야 다시 붉어져요.' : '아직 검붉어지지도 않았어요. 실핏줄을 먼저 지나요.';
      if (m.seg === 'cap') return '여기는 붉던 피가 검붉어지는 곳이에요. 거꾸로 바뀌는 곳을 찾아요.';
      if (m.o2 < O2.red) return '아직 검붉어요. 숨 쉬는 곳을 지나야 다시 붉어져요.';
      return '여기는 이미 붉은 피가 흘러요. 붉어지는 바로 그 자리에서 눌러요.';
    } },
  { id: 'lap', say: '한 바퀴를 돌고, 심장을 몇 번 지났는지 맞혀라', hint: '심장에서 나가 다시 심장으로 — 지도에서 심장 방을 잘 봐요.', why: 1,
    ok: s => !!s.lastLap && s.answer === s.lastLap.hearts,
    tell: s => s.lastLap && s.answer != null ? `${s.answer}번이 아니에요. 지난 길을 지도에서 다시 따라가 봐요.`
      : s.lastLap ? '심장을 몇 번 지났나요? 답을 골라요.'
      : s.lap.heartR ? '심장을 한 번 지났지만 아직 한 바퀴가 아니에요. 계속 가요.'
      : !s.lap.started ? '심장(왼쪽 방)에서 출발해요.' : '아직 돌아오는 중이에요.' },
];

export const WHY = [
  '피는 온몸에 산소를 배달하고 돌아와요. 심장은 쉬지 않는 펌프예요.',
  '한 바퀴 도는 데 1분쯤 걸려요. 지금도 돌고 있어요.',
];
