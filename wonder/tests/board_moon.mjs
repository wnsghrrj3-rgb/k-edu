/* 달 만들기 회색 판: 표 여덟 줄 + 의뢰 셋을 손잡이(디버그 창 __moon · 실제 포인터)로 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__moon, say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const go = (size, angle, speed) => { B.setSize(size); B.setAim(angle); B.setSpeed(speed); B.fire(); B.run(8); B.draw(); return say(); };
    B.S.seed = 1; B.S.mi = 3; B.S.free = false; B.showMission();
    let t;
    t = go(0.01, 0, 1.2); row('표 1 작은 것 정면', t, t.includes('구덩이') && t.includes('다시 떨어져요'));
    t = go(0.107, 45, 1.1); row('표 2 화성만 한 것 비스듬히 — 고리', t, t.includes('빛나는 고리'));
    B.setYears(0.5); B.draw(); t = say(); row('표 2 감으면 달 하나', t, t.includes('달 하나'));
    t = go(1, 5, 1.1); row('표 3 같은 것 정면', t, t.includes('합쳐져'));
    t = go(1, 30, 2.6); row('표 4 같은 것 너무 빠르게', t, t.includes('파편 구름'));
    t = go(0.107, 80, 1.1); row('표 5 아주 스치듯', t, t.includes('두 번째'));
    t = go(0.107, 67, 1.1); row('표 6 조금 다르게 비스듬히 — 달 둘', t, t.includes('달이 둘'));
    B.setYears(2e5); B.draw(); t = say(); row('표 6 나중에 하나는 떨어지거나 달아남', t, t.includes('떨어졌어요') || t.includes('달아났어요'));
    B.S.free = true; B.showMission(); B.pick('ice'); B.paint();
    const iceShown = !document.getElementById('ice').classList.contains('hide');
    t = go(0.107, 45, 1.1); row('표 7 얼음 행성(자유)', t, t.includes('바다') && B.S.what === 'ice' && iceShown);
    B.pick('rock'); B.S.free = false;
    go(0.107, 45, 1.1); B.setYears(1e3); t = say(); const near = t;
    B.setYears(4.5e9); B.draw(); t = say();
    row('표 8 감기 — 멀어지고 파래짐', near + ' ‖ ' + t, near.includes('멀어져요') && t.includes('파래져요') && t.includes('45억 년'));

    // 의뢰 1: 실제 포인터로 — 행성 끌기, 크기 다이얼, 빠르기 레버, 던지기 단추, 시간 다이얼
    B.S.mi = 0; B.S.free = false; B.S.waiting = false; B.setSize(0.02); B.setAim(10); B.setSpeed(2); B.showMission();
    const cv = document.getElementById('cv');
    const pe = (type, x, y) => cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    const drag = pts => { pe('pointerdown', ...pts[0]); for (const p of pts.slice(1)) pe('pointermove', ...p); pe('pointerup', ...pts[pts.length - 1]); };
    let G = B.geom();
    const SW = Math.PI * 0.75, f = (Math.log(0.107) - Math.log(0.005)) / (Math.log(1) - Math.log(0.005)), a = -SW + f * 2 * SW;
    drag([[G.sizeDial.x, G.sizeDial.y - G.sizeDial.r], [G.sizeDial.x + Math.sin(a) * G.sizeDial.r, G.sizeDial.y - Math.cos(a) * G.sizeDial.r]]);
    G = B.geom();
    drag([[G.imp.x, G.imp.y], [G.imp.x, G.earth.y - (45 / 85) * G.railLen]]);
    const L = G.lever; drag([[L.x, (L.y0 + L.y1) / 2], [L.x, L.y0 + (1 - G.leverF(1.1)) * (L.y1 - L.y0)]]);
    const handles = `크기 ${B.S.size.toFixed(3)} · 방향 ${B.S.angle.toFixed(1)}° · 빠르기 ${B.S.speed.toFixed(2)}`;
    row('손잡이(포인터) 셋', handles, Math.abs(B.S.size - 0.107) < 0.01 && Math.abs(B.S.angle - 45) < 1 && Math.abs(B.S.speed - 1.1) < 0.06);
    B.draw(); G = B.geom(); pe('pointerdown', G.fireBtn.x, G.fireBtn.y); pe('pointerup', G.fireBtn.x, G.fireBtn.y);
    for (let i = 0; i < 10; i++) B.step(1 / 30);
    B.setSize(0.9); B.setSpeed(2.9); row('날아가는 중에는 크기·빠르기가 안 바뀜', `크기 ${B.S.size.toFixed(3)} · 빠르기 ${B.S.speed.toFixed(2)}`, Math.abs(B.S.size - 0.107) < 0.01 && Math.abs(B.S.speed - 1.1) < 0.06);
    B.run(8); B.draw(); row('던지기 단추(포인터)', say(), B.S.res && B.S.res.outcome === 'moon');
    row('의뢰 1 — 감기 전 귀띔', note(), note().includes('시간 다이얼'));
    G = B.geom(); const T = G.timeDial, ring = []; for (let i = 0; i <= 30; i++) { const q = i / 24 * Math.PI * 2 - Math.PI / 2; ring.push([T.x + Math.cos(q) * T.r, T.y + Math.sin(q) * T.r]); }
    drag(ring); B.draw();
    row('시간 다이얼(포인터)', say(), B.years() > 1 / 12);
    row('의뢰 1', note(), note().includes('성공'));
    await wait(8200);
    B.turnTime(0.05); B.setYears(1); row('의뢰 2 — 의뢰 1의 던지기로는 안 됨', note() + ' · 결과 ' + (B.S.res ? '남음' : '지움'), !note().includes('성공') && B.S.mi === 1);
    // 의뢰 2: 실패 한 번(너무 큰 행성) → 귀띔 → 맞춤
    go(0.4, 45, 1.1); B.setYears(1); row('의뢰 2 — 실패 귀띔', note(), note().includes('너무 커요'));
    go(0.107, 45, 1.1); B.setYears(1); row('의뢰 2', note(), note().includes('성공'));
    await wait(8200);
    // 의뢰 3: 느리게 → 하나를 잃음 → 더 세게
    go(0.107, 67, 1.1); B.setYears(4.5e9); row('의뢰 3 — 실패 귀띔', note(), note().includes('더 세게'));
    go(0.107, 62, 1.65); B.setYears(4.5e9); row('의뢰 3', note(), note().includes('성공'));
    await wait(1500);
    row('까닭 띄움', document.getElementById('why').innerText, document.getElementById('why').innerText.includes('화성만 한 행성'));
    await wait(6800);
    row('자유 열림', note() + ' · 얼음 칩 ' + !document.getElementById('ice').classList.contains('hide'), B.S.free && note().includes('자유') && !document.getElementById('ice').classList.contains('hide'));
    window.__pause = false;
    return out;
  });
}
