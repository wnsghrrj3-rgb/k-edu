/* 화산 회색 판: 표 열 줄 + 의뢰 셋을 조종판 손잡이(실제 포인터 끌기)와 무인기로 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__volcano, cv = document.getElementById('cv');
    const say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const ev = (type, [x, y]) => cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1, isPrimary: true }));
    /** 손잡이를 진짜 포인터로 끈다 */
    const drag = (name, v) => { const w = B.where(name, v), pts = w.path || [w.from, w.to]; ev('pointerdown', pts[0]); for (const p of pts.slice(1)) ev('pointermove', p); ev('pointerup', pts[pts.length - 1]); };
    const set = h => { for (const [k, v] of Object.entries(h)) drag(k, v); };
    const near = (a, b) => Math.abs(a - b) < 0.04;
    const seen = new Set();
    const run = sec => { seen.clear(); for (let t = 0; t < sec; t += 1 / 30) { B.step(1 / 30); seen.add(say()); } return [...seen].join(' | '); };
    const flyDrone = spot => { ev('pointerdown', [B.S.drone.x, B.S.drone.y]); const to = B.droneTo(spot); ev('pointermove', [(B.S.drone.x + to[0]) / 2, (B.S.drone.y + to[1]) / 2]); ev('pointermove', to); ev('pointerup', to); B.step(1 / 30); return say(); };

    B.S.mi = 3; B.S.done = true; B.reset();                                  // 표를 도는 동안은 의뢰 판정을 쉬게
    set({ visc: 0.1, gas: 0.1, push: 0.6 });
    row('손잡이 — 포인터로 끈 값', `끈적임 ${B.V.visc.toFixed(2)} 기체 ${B.V.gas.toFixed(2)} 힘 ${B.V.push.toFixed(2)}`, near(B.V.visc, 0.1) && near(B.V.gas, 0.1) && near(B.V.push, 0.6));
    let t = run(20); row('표 1 묽음+기체 적음', t, t.includes('강처럼') && t.includes('완만'));
    set({ gas: 0.8 }); t = run(4); row('표 2 묽음+기체 많음', t, t.includes('불 분수'));
    set({ visc: 0.8, gas: 0.2 }); t = run(6); row('표 3 끈적+기체 적음', t, t.includes('용암 혹'));
    set({ gas: 0.8 }); t = run(12); row('표 4 끈적+기체 많음', t, t.includes('압력 바늘') && t.includes('대폭발') && t.includes('번개'));
    set({ gas: 0.4 }); t = run(4); row('표 5 재 기둥 무너짐', t, t.includes('쏟아져 내려요'));
    run(10);
    B.reset(); set({ visc: 0.05, gas: 0.1, push: 0.9 }); t = run(14);
    row('표 7 용암이 숲에', t, t.includes('나무 모양 구멍'));
    row('표 6 용암이 바다에', t, t.includes('베개 모양'));
    row('표 8 용암 동굴(겉이 굳음)', t, t.includes('용암 동굴'));
    t = flyDrone('flow'); row('표 8 무인기로 동굴 속', t, t.includes('동굴 속으로'));
    t = flyDrone('crater'); const lake = new Set(); for (let i = 0; i < 60; i++) { B.step(1 / 30); lake.add(B.V.lake.open); }
    row('표 9 무인기를 용암 호수 위로', t + ` (열림·덮임 ${[...lake].length}가지)`, t.includes('갈라지며') && lake.size === 2);
    B.ffwd(); t = say(); row('빨리 감기 — 아직 분출 중이면', t, t.includes('끝나지 않았어요'));
    set({ push: 0 }); run(2); B.ffwd(); t = say(); row('표 10 다 끝난 뒤 빨리 감기', t, t.includes('숲이 돌아와요'));

    // 의뢰 셋
    B.reset(); B.S.mi = 0; B.S.done = false; B.showMission();
    row('의뢰 1 시작 — 귀띔은 아직 없음', note(), note().includes('바다까지') && !note().includes('귀띔'));
    set({ visc: 0.6 }); run(3); const tell1 = note(); row('의뢰 1 귀띔(끈적하면)', tell1, tell1.includes('끈적한 용암은 멀리 못 가요'));
    set({ visc: 0.05, gas: 0.1, push: 0.9 }); run(16); row('의뢰 1 바다까지', note(), note().includes('성공'));
    await wait(8200);
    row('의뢰 2 시작 — 끈적하고 기체가 닫힌 채', `끈적임 ${B.V.visc.toFixed(2)} 기체 ${B.V.gas.toFixed(2)} · ${note()}`, B.V.visc >= 0.5 && B.V.gas < 0.5 && !note().includes('귀띔'));
    set({ gas: 0.8 }); run(3); const tell2 = note(); row('의뢰 2 밸브만으로는 안 됨', tell2, !tell2.includes('성공') && tell2.includes('갇혀요'));
    set({ visc: 0.2 }); run(3); row('의뢰 2 불 분수(레버+밸브)', note(), note().includes('성공'));
    await wait(8200);
    row('의뢰 3 시작 — 귀띔은 아직 없음', `${note()} (앞 폭발 ${B.V.blasts}번)`, !note().includes('귀띔') && !note().includes('성공'));
    set({ visc: 0.2, gas: 1, push: 1 }); run(4); const tell3 = note(); row('의뢰 3 귀띔(묽으면 안 됨)', tell3, tell3.includes('쉽게 빠져나가'));
    set({ visc: 0.85, gas: 0.85, push: 0.7 }); run(16); row('의뢰 3 산꼭대기', note(), note().includes('성공'));
    await wait(1500); const why = document.getElementById('why').innerText; row('까닭 뜸', why, why.includes('한꺼번에 터져요'));
    await wait(6800); row('자유', note(), note().includes('자유') && B.S.free);
    window.__pause = false;
    return out;
  });
}
