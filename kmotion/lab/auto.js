// 케이모션 과학실 — 세 관문 「한 판」: 정해진 손 움직임을 재생해 사람 손 없이 연습 쪽지를 끝까지 돈다.
// 화면 터치와 같은 길(손 0 하나)로 움직인다. 미리보기 창이 숨겨져 있어도 돌도록 window.__pause 면 시간을 손으로 흘린다.
export const FREEZE = { freeze: true };
// opt.freezeRun = n(1~7번째 움직임), opt.freezeT = 그 움직임 시작 뒤 초 → 그 순간에서 멈춘다(화면 찍기용)
export async function autoplay(lab, opt = {}){
  const { stage, input, props, flow } = lab, THREE = stage.THREE;
  const log = [];
  const paused = () => !!window.__pause;
  let runIdx = 0;
  const run = keys => new Promise((res, rej) => { let done = false; runIdx++; input.play(keys, () => { done = true; res(); });
    if (paused()) { const stopAt = opt.freezeRun === runIdx ? Math.round((opt.freezeT || 0) * 30) : 1e9; let guard = 0; while (!done && guard < 4000) { if (guard++ >= stopAt) { rej(FREEZE); return; } stage.advance(1 / 30, 30); } } });
  const settle = sec => paused() ? (stage.advance(sec), Promise.resolve()) : new Promise(r => setTimeout(r, sec * 1000));
  const here = () => ({ x: input.hands[0].x, y: input.hands[0].y });
  const W = (v) => stage.project(v);
  const item = id => props.items.get(id);
  // 집어서 옮겨 놓기: 지금 손 자리 → 물체(누름) → 목적지(뗌)
  async function carry(id, dest, { dur = .9, hold = .15 } = {}){
    const a = here(), g = props.screenOfItem(id), b = typeof dest === 'function' ? null : dest;
    await run([{ t: 0, hand: 0, x: a.x, y: a.y }, { t: .35, hand: 0, x: g.x, y: g.y }, { t: .45, hand: 0, x: g.x, y: g.y, grab: true }, { t: .45 + dur, hand: 0, x: b.x, y: b.y, grab: true }, { t: .45 + dur + hold, hand: 0, x: b.x, y: b.y, grab: true }, { t: .6 + dur + hold, hand: 0, x: b.x, y: b.y }]);
    await settle(.7);
  }
  const step = () => flow.step;
  const note = (what) => log.push({ what, step: step(), cut: stage.cut });

  // 1·2 쓰기
  await carry('goggles', { x: .5, y: .9 }); note('보안경');
  await carry('gloves', { x: .5, y: .9 }); note('장갑');
  // 3 그릇 → 실험대 둘째 자리
  await carry('bowl', props.screenOfSlot('bench_b')); note('그릇');
  // 4 통 → 그릇 왼쪽 위에서 기울여 붓기(휠·키와 같은 tiltIn)
  { const bw = item('bowl').pivot.position, can = item('can'); const over = W(new THREE.Vector3(bw.x - .10, bw.y + .27, stage.WORK_Z)); const g = props.screenOfItem('can'), a = here();
    await run([{ t: 0, hand: 0, x: a.x, y: a.y }, { t: .35, hand: 0, x: g.x, y: g.y }, { t: .45, hand: 0, x: g.x, y: g.y, grab: true }, { t: 1.4, hand: 0, x: over.x, y: over.y, grab: true },
      { t: 2.2, hand: 0, x: over.x, y: over.y, grab: true, tilt: 65 }, { t: 4.6, hand: 0, x: over.x, y: over.y, grab: true, tilt: 65 }, { t: 5.1, hand: 0, x: over.x, y: over.y, grab: true, tilt: 0 },
      { t: 5.9, hand: 0, x: props.screenOfSlot('bench_a').x, y: props.screenOfSlot('bench_a').y, grab: true }, { t: 6.1, hand: 0, x: props.screenOfSlot('bench_a').x, y: props.screenOfSlot('bench_a').y }]);
    await settle(.6); note('붓기 ' + Math.round(props.bowl.level * 100) + '%'); }
  // 5 집게 → 그릇 위 → 담갔다 빼기
  { const bw = item('bowl').pivot.position, up = W(new THREE.Vector3(bw.x, bw.y + .40, stage.WORK_Z)), down = W(new THREE.Vector3(bw.x, bw.y + .19, stage.WORK_Z)), g = props.screenOfItem('tongs'), a = here(), c = props.screenOfSlot('bench_c');
    await run([{ t: 0, hand: 0, x: a.x, y: a.y }, { t: .35, hand: 0, x: g.x, y: g.y }, { t: .45, hand: 0, x: g.x, y: g.y, grab: true }, { t: 1.4, hand: 0, x: up.x, y: up.y, grab: true },
      { t: 2.0, hand: 0, x: down.x, y: down.y, grab: true }, { t: 3.2, hand: 0, x: down.x, y: down.y, grab: true }, { t: 3.7, hand: 0, x: up.x, y: up.y, grab: true }, { t: 4.4, hand: 0, x: c.x, y: c.y, grab: true }, { t: 4.6, hand: 0, x: c.x, y: c.y }]);
    await settle(1.6); note('담그기'); }
  // 6 망치 → 나무토막 위에서 세 가지 세기로 휙
  { const top = props.block.pivot.position, gy = item('hammer').gripLocal.y, hit = W(new THREE.Vector3(top.x, top.y + .08 + gy, stage.WORK_Z)), g = props.screenOfItem('hammer'), a = here();
    const keys = [{ t: 0, hand: 0, x: a.x, y: a.y }, { t: .35, hand: 0, x: g.x, y: g.y }, { t: .45, hand: 0, x: g.x, y: g.y, grab: true }]; let t = 1.5;
    for (const [dy, dur] of [[.15, .12], [.30, .12], [.45, .12]]) { keys.push({ t, hand: 0, x: hit.x, y: hit.y - dy, grab: true }, { t: t + .5, hand: 0, x: hit.x, y: hit.y - dy, grab: true }, { t: t + .5 + dur, hand: 0, x: hit.x, y: hit.y, grab: true }, { t: t + 1.0, hand: 0, x: hit.x, y: hit.y, grab: true }); t += 2.6; }
    const d = props.screenOfSlot('bench_d'); keys.push({ t: t + .6, hand: 0, x: d.x, y: d.y, grab: true }, { t: t + .8, hand: 0, x: d.x, y: d.y });
    await run(keys); await settle(2.2); note('치기 ' + props.counters.strikesOnTarget.slice(1).join('/')); }
  // 7 펌프질 다섯 번
  { const g = props.screenOfItem('pump'), a = here(); const keys = [{ t: 0, hand: 0, x: a.x, y: a.y }, { t: .4, hand: 0, x: g.x, y: g.y }, { t: .5, hand: 0, x: g.x, y: g.y, grab: true }]; let t = .9;
    for (let k = 0; k < 6; k++) { keys.push({ t, hand: 0, x: g.x, y: g.y + .09, grab: true }, { t: t + .35, hand: 0, x: g.x, y: g.y, grab: true }); t += .7; }
    keys.push({ t: t + .2, hand: 0, x: g.x, y: g.y }); await run(keys); await settle(.4); note('펌프 ' + props.counters.pumps); }
  return { done: flow.step === flow.total - 1, step: flow.step + 1, total: flow.total, log, counters: props.counters };
}
