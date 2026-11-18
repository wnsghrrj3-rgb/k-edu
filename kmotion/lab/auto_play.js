// 케이모션 과학실 — 그림 판 「한 판」 자동 재생: 진짜 입력 길(input.play 의 손)로 맛보기 「장미를 얼려라」를 처음부터 노트까지 돈다.
// session 을 직접 부르지 않는다 — 손을 움직이고 쥐고 펴기만 한다. 좌표는 그 순간 기구가 보이는 자리에서 읽는다.
// 멈춤(화면 찍기): opt.upto = 걸음 이름(아래 mark) + opt.freezeT = 그 뒤 더 흘릴 초 · 또는 opt.freezeRun = n번째 움직임 + opt.freezeT
export async function autoPlay(lab, opt = {}){
  const { stage, input, play: P } = lab;
  const log = [], paused = () => !!window.__pause;
  const FREEZE = at => Object.assign(new Error('freeze'), { freeze: true, at, log, overflow });
  let runIdx = 0, cur = { x: .5, y: .62, grab: false, tilt: 0, present: true };
  const run = (keys, hold) => new Promise((res, rej) => { let done = false; runIdx++; input.play(keys, () => { done = true; res(); }, { hold });
    if (paused()) { const stopAt = opt.freezeRun === runIdx ? Math.round((opt.freezeT || 0) * 30) : 1e9; let guard = 0; while (!done && guard < 6000) { if (guard++ >= stopAt) { rej(FREEZE('run' + runIdx)); return; } stage.advance(1 / 30, 30, guard % 8 === 0); } } });
  const wait = sec => paused() ? (stage.advance(sec), Promise.resolve()) : new Promise(r => setTimeout(r, sec * 1000));
  const overflow = [];
  async function waitFor(pred, max, label){ const n = Math.round(max * 30); for (let k = 0; k < n; k++) { if (pred()) return true; if (paused()) stage.advance(1 / 30, 30, k % 8 === 0); else await new Promise(r => setTimeout(r, 33)); } const why = label + (P.debugWhy ? ' [' + P.debugWhy() + ']' : ''); log.push('기다림 넘침:' + why); overflow.push(why); return false; }
  // opt.shots = ['이름', '이름+0.5', …]: 그 걸음에서 (더 흘린 뒤) 멈추고 제목을 「SHOT 이름」으로 — 찍는 쪽이 window.__shotDone = 이름 으로 풀어 준다
  const shots = new Map((opt.shots || []).map(s => { const [n, x] = String(s).split(/[+: ]/); return [n, +x || 0]; }));
  async function mark(name){ log.push(name);
    if (shots.has(name) && paused()) { const x = shots.get(name); if (x) stage.advance(x); stage.advance(1 / 30); document.title = 'SHOT ' + name;
      await new Promise(res => { const iv = setInterval(() => { if (window.__shotDone === name) { clearInterval(iv); res(); } }, 100); }); document.title = 'run'; }
    if (opt.upto === name) { if (opt.freezeT) await wait(opt.freezeT); throw FREEZE(name); } }
  /** steps: [{ dt, x, y, grab, tilt }] — 지금 손 자리에서 이어서. hold = 끝나도 그 자세로 */
  async function go(steps, hold = true){ const keys = [{ t: 0, hand: 0, ...cur }]; let t = 0, last = { ...cur };
    for (const s of steps) { t += s.dt; last = { x: s.x ?? last.x, y: s.y ?? last.y, grab: s.grab ?? last.grab, tilt: s.tilt ?? last.tilt, present: s.present ?? true }; keys.push({ t, hand: 0, ...last }); }
    await run(keys, hold); cur = last; }
  const add = (a, b, c) => { const x = a.x + (b.x - c.x), y = a.y + (b.y - c.y); return Number.isFinite(x) && Number.isFinite(y) ? { x: Math.min(1.05, Math.max(-.05, x)), y: Math.min(1.05, Math.max(-.05, y)) } : { x: a.x, y: a.y }; };
  /** 쥔 것의 한 점(part 화면 자리)을 화면 자리 to 로: 두 번 맞춘다(원근 때문에) */
  async function aim(id, part, toFn, dur = .8){ for (let k = 0; k < 2; k++) { const p = P.screenOf(id, part), to = toFn(); const h = add(cur, to, p); await go([{ dt: k ? .35 : dur, x: h.x, y: h.y }]); await wait(.25); } }
  async function pick(id, lift = .08){ await waitFor(() => !stage.camMoving, 3, '카메라'); const g = P.screenOf(id); await go([{ dt: .45, x: g.x, y: g.y, grab: false }, { dt: .12, grab: true }, { dt: .5, y: g.y - lift }]); await wait(.2); }
  async function carryTo(id, spot){ await pick(id); await aim(id, 'low', () => P.spotScreen(spot, .02), .9); await go([{ dt: .15, grab: false }], false); cur.grab = false; await wait(.7); }
  const BODY = { x: .5, y: .92 };
  const B = () => P.bowlInfo;
  const M = () => P.view.mission ? P.view.mission.id : null, O = id => P.view.objects[id] || {};
  // 컷 바꾸기: 손을 화면 맨 위로(→ A) · 실험대 쪽으로 내림(→ B)
  async function toA(){ if (stage.cut === 'A') return; await go([{ dt: .4, y: .02, grab: false }, { dt: .6 }]); await waitFor(() => stage.cut === 'A' && !stage.camMoving, 3, '컷 A'); }
  async function toB(){ await go([{ dt: .3, y: .9, grab: cur.grab }]); await waitFor(() => stage.cut === 'B' && !stage.camMoving, 3, '컷 B'); }
  async function wearGear(){ for (const id of ['visor', 'gloves']) { if (P.view.worn[id]) continue; await toA(); await pick(id, .06); await go([{ dt: .9, x: BODY.x, y: BODY.y }, { dt: .25 }, { dt: .12, grab: false }], false); cur.grab = false; await wait(.5); } await toB(); }
  async function card(i){ await waitFor(() => P.cards.open, 4, '카드'); const el = document.querySelectorAll('.cards .card')[i]; if (!el) return; const r = el.getBoundingClientRect();
    await go([{ dt: .5, x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight, grab: false }, { dt: 1.5 }]); await waitFor(() => !P.cards.open, 3, '카드 닫힘'); }
  async function release(){ await go([{ dt: .15, grab: false }], false); cur.grab = false; await wait(.5); }
  async function fetchToBench(id, spot){ if (P.loc(id) === 'shelf') { await toA(); await pick(id, .04); await toB(); } else await pick(id, .06); await aim(id, 'low', () => P.spotScreen(spot, .02), .8); await release(); }
  async function dipWithTongs(id, until, maxSec = 25){
    await pick('tongs', .08); await aim('tongs', 'tip', () => P.screenOf(id), .8); await waitFor(() => P.clampOf('tongs') === id, 2, '물림 ' + id);
    await aim(id, 'low', () => P.worldScreen(B().c.x, B().rim + .1, B().c.z), .8); { const p0 = P.screenOf(id, 'low'), to = P.worldScreen(B().c.x, B().rim - .015, B().c.z); await go([{ dt: .7, x: cur.x + to.x - p0.x, y: cur.y + to.y - p0.y }]); }   /* 입구까지만 — 그 아래는 그릇 자석이 끌어들인다 */
    await waitFor(() => P.loc(id) === 'bowl', 3, '담금 ' + id); await mark('dip_' + id); await waitFor(until, maxSec, '얼림 ' + id);
    await aim(id, 'low', () => P.worldScreen(B().c.x, B().rim + .12, B().c.z), .7); await waitFor(() => P.loc(id) === 'tongs', 2, '꺼냄 ' + id); await wait(.4); }
  async function setDownTongs(id, spot){ const sp = P.spots.find(s => s.name === spot).pos; await aim(id, 'low', () => P.worldScreen(sp.x, sp.y + .1, sp.z), .6); await aim(id, 'low', () => P.worldScreen(sp.x, sp.y - .02, sp.z), .5);
    await waitFor(() => P.clampOf('tongs') == null, 2, '내려놓음 ' + id); await go([{ dt: .4, y: cur.y - .08 }]); await aim('tongs', 'low', () => P.spotScreen('bench_a2', .02), .7); await release(); }
  async function finishMission(id){ await waitFor(() => P.causeOn, 20, '까닭 ' + id); await mark('cause_' + id); await waitFor(() => P.bookOpen, 12, '노트 ' + id); await waitFor(() => !P.bookOpen, 14, '노트 닫힘 ' + id); await wait(.5); }
  async function refill(){ if (B().fill > .45) return; await pick('dewar', .05); await aim('dewar', 'grip', () => P.worldScreen(B().c.x + .27, B().rim + .2, B().c.z), .9);
    await go([{ dt: .8, tilt: 70 }]); await waitFor(() => P.view.bowl.fill > .7, 10, '다시 붓기'); await go([{ dt: .5, tilt: 0 }]); await aim('dewar', 'low', () => P.spotScreen('bench_f', .02), .8); cur.tilt = 0; await release(); }
  // ── 나머지 의뢰: 같은 동사들로
  async function rest(){
    // 의뢰 1 풍선: 예상 → 장비 → 풍선을 실험대로 → 집게로 담가 납작하게 → 꺼내 두고 → 두 손으로 감싸기
    await card(1); await wearGear(); await refill();
    await fetchToBench('balloon', 'bench_d');
    await dipWithTongs('balloon', () => O('balloon').state === 'flat', 12); await mark('balloonFlat');
    await setDownTongs('balloon', 'bench_d'); await mark('balloonDown');
    { const c = P.screenOf('balloon', 'center'); const keys = [{ t: 0, hand: 0, ...cur, grab: false }, { t: .5, hand: 0, x: c.x - .05, y: c.y, grab: true }, { t: 6, hand: 0, x: c.x - .05, y: c.y, grab: true },
        { t: 0, hand: 1, x: c.x + .2, y: c.y + .1, present: true }, { t: .5, hand: 1, x: c.x + .05, y: c.y, grab: true, present: true }, { t: 6, hand: 1, x: c.x + .05, y: c.y, grab: true, present: true }];
      await run(keys, false); await mark('cup'); cur = { x: c.x - .05, y: c.y, grab: false, tilt: 0, present: true }; }
    await waitFor(() => P.missionOver, 20, '풍선 되살아남'); log.push('기구:' + P.debugItems()); await finishMission('balloon');
    // 의뢰 2 바나나: 예상 → 장비 → 나무토막·바나나를 실험대로 → 끓음이 조용해질 때까지 담금 → 꺼내 두고 → 장갑 손으로 쥐고 못 위에 세 번
    if (M() !== 'banana') return; await card(1); await wearGear(); await refill();
    await fetchToBench('woodblock', 'bench_e'); await fetchToBench('banana_1', 'bench_b2');
    await dipWithTongs('banana_1', () => O('banana_1').state === 'stone' && P.view.quiet, 30); await mark('bananaStone');
    await setDownTongs('banana_1', 'bench_b2');
    await pick('banana_1', .06);
    for (let k = 0; k < 6 && !P.missionOver; k++) { await aim('banana_1', 'tip', () => { const w = P.world('woodblock', 'top'); return P.worldScreen(w.x, w.y + .12, w.z); }, .6); await wait(.2);
      await go([{ dt: .1, y: cur.y + .42 }, { dt: .4 }]); await go([{ dt: .3, y: cur.y - .3 }]); if (k === 0) await mark('nail1'); }
    await release(); await waitFor(() => P.missionOver, 4, '못'); await finishMission('banana');
    // 의뢰 3 고무공: 예상 → 장비 → 안 얼린 공을 높이서 놓기(튐) → 얼린 공을 높이서 놓기(깨짐)
    if (M() !== 'balls') return; await card(2); await wearGear(); await refill();
    await fetchToBench('ball_1', 'bench_d'); await fetchToBench('ball_2', 'bench_e');
    { await pick('ball_1', .3); await wait(.2); await release(); await wait(1.5); await mark('ballBounce'); }
    await dipWithTongs('ball_2', () => O('ball_2').state === 'glass', 30);
    { const sp = P.spots.find(s => s.name === 'bench_e').pos; await aim('ball_2', 'low', () => P.worldScreen(sp.x, sp.y + .35, sp.z), .7); await release(); await wait(.3); await mark('ballShatter'); }
    await waitFor(() => P.missionOver, 4, '공 깨짐'); await finishMission('balls');
    // 마무리: 남은 질소에 따뜻한 물 → 구름
    if (M() !== 'finale') return; await card(1); await wearGear(); await refill();
    await toA(); await pick('kettle', .04); await toB();
    await aim('kettle', 'grip', () => P.worldScreen(B().c.x + .2, B().rim + .3, B().c.z), .9);
    await go([{ dt: .8, tilt: 60 }]); await aim('kettle', 'spout', () => P.worldScreen(B().c.x + .04, B().rim + .1, B().c.z), .6); await waitFor(() => P.missionOver, 20, '구름'); await mark('cloud'); await go([{ dt: .5, tilt: 0 }]); cur.tilt = 0;
    await aim('kettle', 'low', () => P.spotScreen('bench_d2', .02), .8); await release();
    await finishMission('finale'); await waitFor(() => P.view.phase === 'free', 20, '자유 실험'); await wait(1); await mark('free');
  }

  await wait(.6); await mark('start');
  // 1·2 보호 장비: 집어서 「내 몸」 자리에 놓기
  for (const id of ['visor', 'gloves']) { await pick(id, .1); await go([{ dt: .9, x: BODY.x, y: BODY.y }, { dt: .25 }, { dt: .12, grab: false }], false); cur.grab = false; await wait(.6); }
  await mark('gear');
  // 3 그릇 → 실험대(가운데 왼쪽)
  await carryTo('bowl', 'bench_c'); await mark('bowl');
  await waitFor(() => stage.cut === 'B' && !stage.camMoving, 5, '컷 B');
  await wait(.3); await mark('cutB');
  // 4 액체 질소 통: 그릇 오른쪽 위로 가져가 손목을 기울여 붓기
  await pick('dewar', .06);
  await aim('dewar', 'grip', () => P.worldScreen(B().c.x + .27, B().rim + .2, B().c.z), 1.0);
  await go([{ dt: .9, tilt: 64 }, { dt: .6 }]); await mark('pourStart');
  await go([{ dt: 2.6 }]); await mark('pouring');
  await waitFor(() => P.view.bowl.fill > .7, 4, '그릇 70%');
  await go([{ dt: .6, tilt: 0 }]); await wait(.3);
  await aim('dewar', 'low', () => P.spotScreen('bench_f', .02), .9); await go([{ dt: .15, grab: false }], false); cur.grab = false; cur.tilt = 0; await wait(.8);
  await mark('poured');
  // 5 예상 카드: 「유리처럼 된다」에 손을 1초 대고 있기
  await waitFor(() => P.cards.open, 4, '카드');
  { const el = document.querySelectorAll('.cards .card')[2]; if (el) { const r = el.getBoundingClientRect(); const c = { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
      await go([{ dt: .5, x: c.x, y: c.y, grab: false }, { dt: .5 }]); await mark('cards'); await go([{ dt: 1.0 }]); } }
  await waitFor(() => P.view.mission && P.view.mission.predicted != null, 3, '예상'); await waitFor(() => !P.cards.open, 3, '카드 닫힘');
  await mark('predicted');
  // 6 긴 집게로 장미를 문다
  await pick('tongs', .1);
  await aim('tongs', 'tip', () => P.screenOf('rose'), .9);
  await waitFor(() => P.clampOf('tongs') === 'rose', 2, '집게에 물림'); await wait(.4); await mark('clamp');
  // 7 그릇 위로 → 담그기(액면 아래로)
  await aim('rose', 'low', () => P.worldScreen(B().c.x, B().rim + .1, B().c.z), 1.0);
  await aim('rose', 'low', () => P.worldScreen(B().c.x, B().surf - .03, B().c.z), .9);
  await waitFor(() => P.loc('rose') === 'bowl', 3, '담금'); await wait(.5); await mark('dip');
  await waitFor(() => P.view.objects.rose && P.view.objects.rose.state === 'glass', 10, '유리'); await wait(.6); await mark('glass');
  // 8 꺼내기 → 서리
  await aim('rose', 'low', () => P.worldScreen(B().c.x, B().rim + .1, B().c.z), .8);
  await waitFor(() => P.loc('rose') === 'tongs', 2, '꺼냄'); await wait(1.2); await mark('lift');
  // 9 실험대에 내려놓기(집게는 다른 자리에)
  { const sp = P.spots.find(s => s.name === 'bench_b').pos;
    await aim('rose', 'low', () => P.worldScreen(sp.x, sp.y + .1, sp.z), .8);
    await aim('rose', 'low', () => P.worldScreen(sp.x, sp.y - .02, sp.z), .6); }
  await waitFor(() => P.clampOf('tongs') == null, 2, '내려놓음'); await wait(.3);
  await aim('tongs', 'low', () => P.spotScreen('bench_a2', .02), .8); await go([{ dt: .15, grab: false }], false); cur.grab = false; await wait(.6);
  await mark('setDown');
  // 10 고무망치로 쾅
  await pick('mallet', .1);
  await aim('mallet', 'tip', () => { const w = P.world('rose', 'top'); return P.worldScreen(w.x, w.y + .14, w.z); }, 1.0);
  await wait(.3); await mark('aim');
  await go([{ dt: .1, y: cur.y + .42 }, { dt: .5 }]);
  await waitFor(() => P.missionOver, 2, '깨짐'); await mark('strike');
  await wait(1.0); await mark('shards');
  await go([{ dt: .3, y: cur.y - .15 }, { dt: .12, grab: false }], false); cur.grab = false;
  // 11 까닭 한 줄 → 실험 노트
  await waitFor(() => P.causeOn, 8, '까닭'); await wait(1.0); await mark('cause');
  await waitFor(() => P.bookOpen, 12, '노트'); await wait(1.2); await mark('book');
  await waitFor(() => !P.bookOpen, 14, '노트 닫힘'); await wait(.6); await mark('next');
  // 12 (사고 하나 보기) 둘째 의뢰 — 장비는 선반으로 돌아갔다. 맨손을 그릇 질소 속으로 → 사고 기록
  await waitFor(() => P.view.mission && P.view.mission.id === 'balloon', 3, '둘째 의뢰');
  { const c = P.worldScreen(B().c.x, B().surf, B().c.z); await go([{ dt: .6, x: c.x, y: c.y, grab: false }, { dt: .1, grab: true }, { dt: .4 }, { dt: .1, grab: false }], false); cur.grab = false; }
  await waitFor(() => P.note.alarmOn, 2, '사고'); await wait(.5); await mark('accident');
  if (opt.full) await rest();
  return { done: overflow.length === 0, overflow, log, mission: P.view.mission && P.view.mission.id, accidents: P.note.accidents.length, pages: P.note.pages.length };
}
