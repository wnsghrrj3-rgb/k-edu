/* 폭풍 회색 판: 표 열 줄 + 의뢰 셋을 조종판 손잡이(실제 포인터 끌기)로 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__storm, cv = document.getElementById('cv'), DEG = Math.PI / 180;
    const say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const ev = (type, [x, y]) => cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1, isPrimary: true }));
    const drag = (name, v) => { const w = B.where(name, v), pts = w.path || [w.from, w.to]; ev('pointerdown', pts[0]); for (const p of pts.slice(1)) ev('pointermove', p); ev('pointerup', pts[pts.length - 1]); };
    const set = h => { for (const [k, v] of Object.entries(h)) drag(k, v); };
    const seen = new Set();
    const run = (sec, until) => { seen.clear(); for (let t = 0; t < sec; t += 1 / 30) { B.step(1 / 30); seen.add(say()); if (until && until()) break; } return [...seen].join(' | '); };
    const near = (a, b, e = 0.04) => Math.abs(a - b) < e;

    B.S.mi = 3; B.S.done = true; B.reset();                                    // 표를 도는 동안은 의뢰 판정을 쉬게
    set({ heat: 1, moist: 0.3, shear: -60 * DEG }); const W0 = B.W;
    row('손잡이 — 포인터로 돌린 값', `데우기 ${W0.heat.toFixed(2)} 물기 ${W0.moist.toFixed(2)} 엇갈림 ${Math.round(W0.shear / DEG)}°`, near(W0.heat, 1) && near(W0.moist, 0.3) && near(W0.shear, -60 * DEG));
    B.reset(); set({ heat: 1 });
    let t = run(15); row('표 1 데우기만', t, t.includes('아지랑이') && t.includes('구름은 없어요'));
    set({ moist: 0.3 }); t = run(20); row('표 2 데우기+물기 조금', t, t.includes('뭉게구름'));
    set({ moist: 0.62 }); t = run(20); row('표 3 데우기+물기 많이', t, t.includes('탑처럼') && t.includes('모루'));
    set({ moist: 1 }); t = run(30); row('표 4 계속 키움 — 번개', t + ` (번개 ${B.W.strikes}번)`, t.includes('번개가 땅으로') && B.W.strikes > 0);
    row('표 5 더 키움 — 우박·돌풍', t, t.includes('우박') && t.includes('돌풍'));
    set({ shear: 120 * DEG }); t = run(20); row('표 6 엇갈린 바람 — 돈다', t, t.includes('천천히 돌아요') && t.includes('벽 같은 구름'));
    t = run(25, () => B.W.tornado && B.W.tornado.age > 3); row('표 7 토네이도', t, t.includes('토네이도!') && t.includes('흙먼지'));
    set({ shear: -90 * DEG }); t = run(60, () => !B.W.mill.standing && say().includes('풍차')); row('표 8 토네이도가 풍차를 지남', t.slice(-160), t.includes('풍차가 빨려 올라가요'));
    set({ heat: 0 }); t = run(50, () => say().includes('무지개')); row('표 9 데우기를 끔', t.slice(-120), t.includes('흩어져요') && t.includes('무지개'));
    B.reset(); set({ shear: 120 * DEG }); t = run(5); row('표 10 물기 없이 엇갈린 바람만', t, t.includes('먼지 회오리'));

    // 의뢰 셋
    B.reset(); B.S.mi = 0; B.S.done = false; B.showMission();
    row('의뢰 1 시작 — 귀띔은 아직 없음', note(), note().includes('열 번') && !note().includes('귀띔'));
    set({ heat: 1, moist: 0.5 }); run(4); const tell1 = note(); row('의뢰 1 귀띔(구름이 낮으면)', tell1, tell1.includes('구름이 아직 낮아요'));
    set({ moist: 1 }); run(40, () => note().includes('성공')); row('의뢰 1 번개 열 번', note(), note().includes('성공'));
    run(5);                                                                     // 의뢰 1 의 끝: 다 큰 폭풍(손잡이 끝까지)
    const big = B.W.hailNow;
    await wait(8200);
    run(20); const n2 = note();
    row('의뢰 2 저절로 풀리지 않음(새 날)', `${n2} · 직전 우박 ${big.toFixed(1)}cm → 지금 꼭대기 ${B.W.top.toFixed(1)}km`, big >= 4 && !n2.includes('성공') && !n2.includes('귀띔'));
    set({ heat: 1, moist: 0.9 }); run(30); const tell2 = note(); row('의뢰 2 귀띔(메추리알)', tell2, tell2.includes('메추리알'));
    set({ heat: 1, moist: 1 }); run(30, () => note().includes('성공')); row('의뢰 2 골프공 우박', note(), note().includes('성공'));
    await wait(8200);
    const farm0 = [B.W.farm.x, B.W.farm.y];
    row('의뢰 3 시작 — 귀띔은 아직 없음', note(), note().includes('비켜') && !note().includes('귀띔'));
    set({ shear: 120 * DEG }); run(60, () => B.W.tornado && B.W.tornado.chase); const farmOn = Math.abs(Math.atan2(B.W.farm.y, B.W.farm.x) - B.W.tornado.h) < 0.01;
    t = run(30, () => B.W.farmHit); run(3); const tell3 = note();
    row('의뢰 3 뒤집힘 — 그대로 두면 농가에 닿음', `${t.includes('농가 쪽으로') ? '「농가 쪽으로」 ' : ''}${tell3}`, farmOn && t.includes('농가 쪽으로') && tell3.includes('농가에 닿았어요'));
    const T1 = B.W.tornado; run(60, () => B.W.tornado && B.W.tornado !== T1 && B.W.tornado.chase && B.W.tornado.age > 1);
    set({ shear: 175 * DEG }); run(40, () => note().includes('성공')); row('의뢰 3 도중에 틀어 비켜 가기', note(), note().includes('성공') && !B.W.farmHit);
    row('의뢰 3 내내 농가는 제자리', `농가 ${B.W.farm.x.toFixed(2)}, ${B.W.farm.y.toFixed(2)} km`, B.W.farm.x === farm0[0] && B.W.farm.y === farm0[1] && Math.abs(Math.hypot(...farm0) - 4.5) < 1e-9);
    await wait(1500); const why = document.getElementById('why').innerText; row('까닭 뜸', why, why.includes('돌기 시작해요'));
    await wait(6800); row('자유', note(), note().includes('자유') && B.S.free);
    window.__pause = false;
    return out;
  });
}
