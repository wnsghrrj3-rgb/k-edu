// 케이모션 과학실 — 실험 2 「공기를 빼면」 자동 한 판: 진짜 입력 길(input.play 의 손)만 쓴다. session 을 직접 부르지 않는다.
// ① 마시멜로(받침판에 놓기 → 종은 머물러 덮기 → 카드 → 펌프질 → 두 배 → 까닭 → 노트)
// &full=1: ② 안 들리는 종 → 밸브 → 종 들기 → 자명종 → 금 간 종(방호판 없이 → 사고) → 다시 세우기 → 좋은 종 → 소리가 사라질 때까지
//          ③ 밸브 → 비커 → 끓을 때까지 쉬지 않고 → 온도가 내려감 → 노트(그림) → 자유 실험
// 멈춤·찍기: &upto=걸음 · &shots=걸음[+초],… (auto_play.js 와 같은 약속)
export async function autoVacuum(lab, opt = {}){
  const { stage, input, play: P } = lab;
  const log = [], overflow = [], paused = () => !!window.__pause;
  const FREEZE = at => Object.assign(new Error('freeze'), { freeze: true, at, log, overflow });
  let runIdx = 0, cur = { x: .5, y: .62, grab: false, tilt: 0, present: true };
  const run = (keys, hold) => new Promise((res, rej) => { let done = false; runIdx++; input.play(keys, () => { done = true; res(); }, { hold });
    if (paused()) { const stopAt = opt.freezeRun === runIdx ? Math.round((opt.freezeT || 0) * 30) : 1e9; let guard = 0; while (!done && guard < 9000) { if (guard++ >= stopAt) { rej(FREEZE('run' + runIdx)); return; } stage.advance(1 / 30, 30, guard % 8 === 0); } } });
  const wait = sec => paused() ? (stage.advance(sec), Promise.resolve()) : new Promise(r => setTimeout(r, sec * 1000));
  async function waitFor(pred, max, label){ const n = Math.round(max * 30); for (let k = 0; k < n; k++) { if (pred()) return true; if (paused()) stage.advance(1 / 30, 30, k % 8 === 0); else await new Promise(r => setTimeout(r, 33)); }
    const why = label + (P.debugWhy ? ' [' + P.debugWhy() + ']' : ''); log.push('기다림 넘침:' + why); overflow.push(why); return false; }
  const shots = new Map((opt.shots || []).map(s => { const [n, x] = String(s).split(/[+: ]/); return [n, +x || 0]; }));
  // &perf=1: 이 걸음에서 장면 한 장 그리는 데 드는 시간(그리기 포함 / 셈만)을 잰다
  const PERF = new Set(['start', 'pumping', 'double', 'burst', 'boil', 'puffs']);
  function perf(name){ const gl = stage.renderer.getContext(), N = 20, px = new Uint8Array(4), sync = () => gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); stage.advance(1 / 30); sync(); let t0 = performance.now(); for (let k = 0; k < N; k++) { stage.advance(1 / 30, 30, true); sync(); }   /* 한 점을 읽어 그리기가 정말 끝날 때까지 기다린다 */ const draw = (performance.now() - t0) / N;
    t0 = performance.now(); for (let k = 0; k < N; k++) stage.advance(1 / 30, 30, false); const upd = (performance.now() - t0) / N; const inf = stage.renderer.info.render;
    log.push(`perf:${name}:그리기${draw.toFixed(1)}ms/셈${upd.toFixed(2)}ms/호출${inf.calls}/삼각형${inf.triangles}/컷${stage.cut}`); }
  async function mark(name){ log.push(name); if (opt.perf && paused() && PERF.has(name)) perf(name);
    if (shots.has(name) && paused()) { const x = shots.get(name); if (x) stage.advance(x); stage.advance(1 / 30); document.title = 'SHOT ' + name;
      await new Promise(res => { const iv = setInterval(() => { if (window.__shotDone === name) { clearInterval(iv); res(); } }, 100); }); document.title = 'run'; }
    if (opt.upto === name) { if (opt.freezeT) await wait(opt.freezeT); throw FREEZE(name); } }
  async function go(steps, hold = true){ const keys = [{ t: 0, hand: 0, ...cur }]; let t = 0, last = { ...cur };
    for (const s of steps) { t += s.dt; last = { x: s.x ?? last.x, y: s.y ?? last.y, grab: s.grab ?? last.grab, tilt: 0, present: s.present ?? true }; keys.push({ t, hand: 0, ...last }); }
    await run(keys, hold); cur = last; }
  const add = (a, b, c) => { const x = a.x + (b.x - c.x), y = a.y + (b.y - c.y); return Number.isFinite(x) && Number.isFinite(y) ? { x: Math.min(1.05, Math.max(-.05, x)), y: Math.min(1.05, Math.max(-.05, y)) } : { x: a.x, y: a.y }; };
  /** 쥔 것의 한 점(part 화면 자리)을 화면 자리 to 로 — 두 번 맞춘다(원근·컷이 바뀔 수 있으니) */
  async function aim(id, part, toFn, dur = .8){ for (let k = 0; k < 2; k++) { const p = P.screenOf(id, part), to = toFn(); const h = add(cur, to, p); await go([{ dt: k ? .3 : dur, x: h.x, y: h.y }]); await wait(.15); } }
  // 종 안에서 부푼 것이 종 벽·천장을 넘지 않는지(3 mm 넘게 삐져나오면 넘침으로 적는다)
  const fitGate = (ids) => { if (!P.fitCheck) return; for (const id of ids) { const f = P.fitCheck(id); if (!f) continue; log.push('맞춤 ' + id + ' 옆' + f.sideMm + ' 위' + f.topMm); if (f.sideMm > 3 || f.topMm > 3) overflow.push('종 밖으로 삐짐 ' + id + ' 옆' + f.sideMm + 'mm 위' + f.topMm + 'mm'); } };
  const V = () => P.view, O = id => P.view.objects[id] || {}, M = () => P.view.mission ? P.view.mission.id : null;
  async function steady(){ await waitFor(() => !stage.camMoving, 3, '카메라'); }
  async function pick(id, lift = .06){ await steady(); const g = P.screenOf(id); await go([{ dt: .45, x: g.x, y: g.y, grab: false }, { dt: .12, grab: true }, { dt: .4, y: g.y - lift }]); await wait(.15); }
  async function release(){ await go([{ dt: .15, grab: false }], false); cur.grab = false; await wait(.5); }
  async function toA(){ if (stage.cut === 'A') return; await go([{ dt: .4, y: .03, grab: cur.grab }, { dt: .5 }]); await waitFor(() => stage.cut === 'A' && !stage.camMoving, 3, '컷 A'); }
  async function toB(){ await go([{ dt: .3, y: .9, grab: cur.grab }, { dt: .5 }]); await waitFor(() => stage.cut === 'B' && !stage.camMoving, 3, '컷 B'); }
  /** 시료를 받침판에: 놓기(release) 또는 머물기(hover) */
  async function toPlate(id, how = 'release'){ await aim(id, 'low', () => P.seatScreen(0), .8);
    if (how === 'hover') { await waitFor(() => P.loc(id) !== 'hand', 1.5, '머물러 놓임 ' + id); await go([{ dt: .3, y: cur.y - .1 }]); await release(); } else await release();
    await waitFor(() => O(id).loc === 'plate', 2, '받침판 ' + id); }
  async function bellOn(id = 'bell', how = 'hover'){ await aim(id, 'low', () => P.bellSeatScreen(), .8);
    if (how === 'hover') { await waitFor(() => P.loc(id) !== 'hand', 1.5, '머물러 덮임 ' + id); await go([{ dt: .3, y: cur.y - .1 }]); } await release(); await waitFor(() => V().bell === id, 2, '덮음 ' + id); }
  async function fetchIt(id, onShelfHigh){ if (onShelfHigh) { await toA(); await pick(id, .04); await toB(); } else await pick(id); }
  async function card(i){ await waitFor(() => P.cards.open, 5, '카드'); const el = document.querySelectorAll('.cards .card')[i]; if (!el) return; const r = el.getBoundingClientRect();
    await go([{ dt: .5, x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight, grab: false }, { dt: .4 }]); await mark('cards'); await go([{ dt: 1.2 }]); await waitFor(() => !P.cards.open, 3, '카드 닫힘'); }
  /** 펌프질: 손잡이를 쥐고 크게 위아래(손잡이 끝까지). until 이 될 때까지, 아니면 max 번 */
  async function pumpUntil(until, max, label, onStroke){ await steady(); const g = P.screenOf('pump'); await go([{ dt: .5, x: g.x, y: g.y, grab: false }, { dt: .12, grab: true }, { dt: .15 }]);
    if (P.heldBy(0) !== 'pump') { overflow.push('펌프를 못 쥠 [' + P.debugWhy() + ']'); }
    let n = 0; for (; n < max && !until(); n++) { const ps = P.pumpScreen(), span = ps.bot.y - ps.top.y; const base = cur.y + (ps.h || 0) * span;
      await go([{ dt: .32, y: base - span * 1.02 }, { dt: .05 }, { dt: .32, y: base + .005 }, { dt: .05 }]); if (onStroke) await onStroke(n); }
    if (!until()) { overflow.push(label + ' (펌프질 ' + n + '번) [' + P.debugWhy() + ']'); log.push('펌프 넘침:' + label); }
    await release(); return n; }
  /** 밸브 손잡이를 쥐고 공기가 다 들어올 때까지(천천히) */
  async function valveOpen(){ await steady(); const k = P.screenOf('valve'); await go([{ dt: .45, x: k.x, y: k.y, grab: false }, { dt: .12, grab: true }]); await waitFor(() => V().p >= .97 && V().valve > .9, 10, '밸브 공기 다 들어옴'); await release(); }
  async function bellLift(to = 'bench_R1'){ await steady(); const g = P.screenOf(V().bell || 'bell'); const id = V().bell; await go([{ dt: .45, x: g.x, y: g.y, grab: false }, { dt: .12, grab: true }, { dt: .35, y: g.y - .12 }]);
    await waitFor(() => P.heldBy(0) === id, 1, '종 들림'); await aim(id, 'low', () => P.spotScreen(to, .01), .7); await release(); }
  async function finish(id){ await waitFor(() => P.causeOn, 12, '까닭 ' + id); await wait(.6); await mark('cause_' + id); await waitFor(() => P.bookOpen, 12, '노트 ' + id); await wait(.8); await mark('book_' + id); await waitFor(() => !P.bookOpen, 14, '노트 닫힘 ' + id); await wait(.5); }

  await wait(.8); await mark('start');
  // ── ① 부푸는 마시멜로
  await fetchIt('marshmallow'); await mark('carry'); await toPlate('marshmallow', 'release'); await mark('marshPlate');
  await fetchIt('bell'); await bellOn('bell', 'hover'); await mark('cover');
  await card(2); await mark('predicted');
  await pumpUntil(() => P.missionOver, 14, '두 배', async n => { if (n === 3) await mark('pumping'); });
  await wait(.8); fitGate(['marshmallow']); await mark('double');
  await finish('marsh');
  if (opt.full) await rest();
  return { done: overflow.length === 0, overflow, log, mission: M(), accidents: P.note.accidents.length, pages: P.note.pages.length, placeholders: P.placeholders };

  async function rest(){
    // ── ② 조용한 자명종: 공기를 뺀 종은 안 들린다 → 밸브 → 들기 → 마시멜로는 선반으로 → 자명종 → 금 간 종(방호판 없이) → 사고 → 좋은 종으로
    if (M() !== 'clock') return; await waitFor(() => !P.missionOver, 3, '둘째 의뢰');
    { await steady(); const g = P.screenOf('bell'); await go([{ dt: .45, x: g.x, y: g.y, grab: false }, { dt: .12, grab: true }, { dt: .3, y: g.y - .12 }]); await wait(.2); await mark('stuck'); await release(); }
    await valveOpen(); await mark('valve');
    await bellLift('bench_R1');
    await pick('marshmallow'); await aim('marshmallow', 'low', () => P.spotScreen('shelf_3_4', .01), .8); await release();
    await fetchIt('clock', true); await toPlate('clock'); await mark('clockPlate');
    await fetchIt('bell_cracked'); await bellOn('bell_cracked', 'release');
    await card(2);
    await pumpUntil(() => O('bell_cracked').lost, 20, '금 간 종', async () => { if (O('bell_cracked').crackStage === 1 && !log.includes('crack')) await mark('crack'); });
    await wait(.3); await mark('burst'); await waitFor(() => P.note.alarmOn || P.note.accidents.length > 0, 2, '사고');
    await wait(2.5);
    if (O('clock').knocked) { await pick('clock'); await toPlate('clock'); }
    await pick('bell'); await bellOn('bell', 'release');
    await pumpUntil(() => P.missionOver, 40, '소리 사라짐', async n => { if (n === 8) await mark('quieter'); }); await mark('silent');
    await finish('clock');
    // ── ③ 불 없이 끓는 물
    if (M() !== 'boil') return; await waitFor(() => !P.missionOver, 3, '셋째 의뢰');
    await valveOpen(); await bellLift('bench_R1');
    await pick('clock'); await aim('clock', 'low', () => P.spotScreen('bench_L1', .01), .8); await release();
    await fetchIt('beaker_water', true); await toPlate('beaker_water');
    await pick('bell'); await bellOn('bell', 'release');
    await card(2);
    await pumpUntil(() => P.missionOver, 140, '끓음·식음', async () => { if (O('beaker_water').boiling && !log.includes('boil')) await mark('boil'); });
    await finish('boil');
    await waitFor(() => V().phase === 'free', 6, '자유 실험'); await wait(1); await mark('free');
    // 자유 실험: 방호판을 받침판 앞으로 끌어다 머물기 → 세워짐
    { await steady(); const g = P.screenOf('shield'); await go([{ dt: .45, x: g.x, y: g.y, grab: false }, { dt: .12, grab: true }, { dt: .3, y: g.y - .05 }]);
      await aim('shield', 'low', () => P.frontScreen(), .8); await waitFor(() => V().shield, 1.5, '방호판 섬'); await release(); await mark('shield'); }
    if (!opt.more) return;
    // (&more=1) 자유 실험: 촛불 + 흡착판을 받침판에 → 펌프질 → 불꽃이 꺼지고 흡착판이 툭 → 밸브 → 연기
    await valveOpen(); await bellLift('bench_R1');
    await pick('beaker_water'); await aim('beaker_water', 'low', () => P.spotScreen('shelf_2_1', .01), .8); await release();
    for (const id of ['candle', 'suction']) { await fetchIt(id, true); await aim(id, 'low', () => P.seatScreen(), .8); await release(); await waitFor(() => O(id).loc === 'plate', 2, '받침판 ' + id); }
    await pick('bell'); await bellOn('bell', 'release');
    await pumpUntil(() => O('candle').lit === false && O('suction').stuck === false, 40, '촛불·흡착판', async () => { if (O('candle').lit === false && !log.includes('candleOut')) await mark('candleOut'); });
    await mark('suctionDrop'); await valveOpen(); await wait(.6); await mark('smoke');
    // 과자 봉지 · 물 묻힌 스펀지 · 덜 분 풍선을 한꺼번에 → 펌프질 → 봉지가 빵빵하다 터지고, 스펀지가 보글보글, 풍선이 종 벽까지
    const toHome = async id => { await pick(id); const h = P.items.get(id).home.slot; await aim(id, 'low', () => P.spotScreen(h, .01), .8); await release(); await toB(); };
    await bellLift('bench_R1'); await toHome('candle'); await toHome('suction');
    for (const id of ['chips', 'sponge', 'balloon_s']) { await fetchIt(id, id !== 'balloon_s'); await aim(id, 'low', () => P.seatScreen(), .8); await release(); await waitFor(() => O(id).loc === 'plate', 2, '받침판 ' + id); }
    await mark('three');
    await pick('bell'); await bellOn('bell', 'release');
    await pumpUntil(() => O('chips').burst && O('balloon_s').full, 50, '봉지·풍선', async n => { if (n === 6) await mark('puffing'); }); await wait(1.2); fitGate(['balloon_s', 'chips', 'sponge']); await mark('puffs');
    await valveOpen(); await wait(.5); await mark('back'); await bellLift('bench_R1');
    for (const id of ['chips', 'sponge', 'balloon_s']) await toHome(id);
    // 낙하 통: 든 채 잠깐 가만히 → 저절로 뒤집힘(공기 있을 때 = 쇠구슬 먼저) → 받침판에 꽂고 공기를 빼고 → 다시 들어 가만히(같이 떨어짐)
    const lastDrop = () => { const l = P.session.log.filter(e => e.type === 'dropResult'); return l.length ? l[l.length - 1].result : null; };
    await fetchIt('droptube'); await go([{ dt: .4, y: cur.y - .05 }, { dt: 1.3 }]); await waitFor(() => lastDrop() != null, 2, '낙하 통 뒤집힘'); await wait(.3); await mark('tubeAir'); log.push('낙하(공기):' + lastDrop());
    await aim('droptube', 'low', () => P.seatScreen(), .8); await release(); await waitFor(() => O('droptube').loc === 'plate', 2, '낙하 통 꽂음');
    await pumpUntil(() => V().p < .045, 50, '낙하 통 공기 빼기');
    { const g = P.screenOf('droptube'); const before = P.session.log.filter(e => e.type === 'dropResult').length; await go([{ dt: .45, x: g.x, y: g.y, grab: false }, { dt: .12, grab: true }, { dt: .4, y: g.y - .08 }, { dt: 1.3 }]);
      await waitFor(() => P.session.log.filter(e => e.type === 'dropResult').length > before, 2, '낙하 통 다시 뒤집힘'); await wait(.5); await mark('tubeVac'); log.push('낙하(진공):' + lastDrop()); await release(); }
  }
}
