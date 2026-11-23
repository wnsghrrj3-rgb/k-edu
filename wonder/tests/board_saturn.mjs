/* 토성 고리 속 회색 판: 표 열 줄 + 의뢰 셋을 손잡이(디버그 창 __saturn · 실제 포인터)로 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__saturn, say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const cv = document.getElementById('cv');
    const pe = (type, x, y) => cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));
    const { GAP_AIM, gapMoon } = await import('/wonder/saturn/logic.js');
    const GAP = (GAP_AIM[0] + GAP_AIM[1]) / 2;
    B.S.mi = 3; B.S.free = false; B.showMission();
    let t;
    // 표 1~3: 다가가기 레버를 실제 포인터로
    B.setAim(0.45); B.setElev(18); B.draw();
    let V = B.geom().lever; const leverTo = f => { const V = B.geom().lever, y0 = V.y0 + B.S.lever * (V.y1 - V.y0); pe('pointerdown', V.x, y0); pe('pointermove', V.x, V.y0 + f * (V.y1 - V.y0)); pe('pointerup', V.x, V.y0 + f * (V.y1 - V.y0)); B.draw(); };
    leverTo(0.05); t = say(); row('표 1 멀리서', t, t.includes('매끈한 띠') && B.look().stage === 'far');
    leverTo(0.3); t = say(); row('표 2 다가감(레버 포인터)', t, t.includes('수천 줄'));
    leverTo(0.6); t = say(); row('표 3 더 다가감', t, t.includes('알갱이의 강'));
    leverTo(1); t = say(); row('표 4 고리 안으로', t, t.includes('같은 방향') && t.includes('붙었다 떨어져요'));
    // 표 5: 멀리서, 조종 손잡이를 실제 포인터로 아래로 눌러 기울기를 0 근처로
    leverTo(0.05); B.setElev(6); B.draw();
    const J = B.geom().joy; pe('pointerdown', J.x, J.y); pe('pointermove', J.x, J.y + J.r * 0.5);
    for (let i = 0; i < 400 && Math.abs(B.S.elev) > 1; i++) B.step(1 / 60);
    pe('pointerup', J.x, J.y + J.r * 0.5); B.draw(); t = say();
    row('표 5 옆에서(손잡이 포인터)', t + ` (기울기 ${B.S.elev.toFixed(2)}°)`, t.includes('종이') && B.S.joy.y === 0);
    B.setElev(18); B.setAim(GAP); leverTo(0.6); t = say(); row('표 6 검은 틈', t, t.includes('텅 비었어요') && t.includes('작은 달'));
    // 표 7: 고리 속에서 집게 팔을 실제 포인터로 덩어리까지 끌어 놓기
    B.setAim(0.45); leverTo(1); B.run(0.2); B.draw();
    const G = B.geom(), reach = B.geom().view.h * 0.6, target = G.chunks.filter(c => Math.hypot(c.x - G.clawBase.x, c.y - G.clawBase.y) < reach && c.r > 4).sort((a, b) => b.r - a.r)[0];
    pe('pointerdown', G.claw.x, G.claw.y);
    for (let i = 1; i <= 40; i++) { pe('pointermove', G.claw.x + (target.x - G.claw.x) * i / 40, G.claw.y + (target.y - G.claw.y) * i / 40); await wait(25); }
    pe('pointerup', target.x, target.y); B.draw(); t = say();
    row('표 7 집게로 집어 비춤(포인터)', t, t.includes('순수한 얼음') && B.S.sample);
    B.run(7); B.draw();
    { const G2 = B.geom(), c2 = G2.chunks.filter(c => Math.hypot(c.x - G2.clawBase.x, c.y - G2.clawBase.y) < reach).sort((a, b) => b.r - a.r)[0];
      pe('pointerdown', G2.claw.x, G2.claw.y); await wait(30); pe('pointermove', c2.x, c2.y); pe('pointerup', c2.x, c2.y); B.draw(); t = say();
      row('표 8 집게로 휙 밀기(포인터)', t, t.includes('부서져요')); B.run(8); }
    B.push(0.9); t = say(); row('표 8 세게 민다', t, t.includes('부서져요') && t.includes('다시 섞여요'));
    B.push(0.05); t = say(); row('표 8 살짝 밀면(덧)', t, t.includes('붙었다가'));
    B.setAim(0.05); B.draw(); t = say(); row('표 9 토성 쪽', t, t.includes('줄무늬 그림자') && t.includes('육각형'));
    B.S.free = true; B.showMission(); document.getElementById('tubS').click(); t = say();
    row('표 10 물통(자유)', t, t.includes('둥둥') && !document.getElementById('free').classList.contains('hide'));
    document.getElementById('tubE').click(); t = say(); row('표 10 지구는 가라앉음(덧)', t, t.includes('가라앉아요'));
    B.run(8); B.S.free = false;

    // 두 손가락: 조종 손잡이를 쥔 채 레버를 다른 손가락으로 — 손을 떼면 손잡이가 가운데로
    { const pid = (type, id, x, y) => cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: id }));
      B.setLever(0.05); B.draw(); const J2 = B.geom().joy, V2 = B.geom().lever, ly = V2.y0 + B.S.lever * (V2.y1 - V2.y0);
      pid('pointerdown', 1, J2.x, J2.y); pid('pointermove', 1, J2.x, J2.y + J2.r * 0.6);
      pid('pointerdown', 2, V2.x, ly); pid('pointermove', 2, V2.x, ly + 20); pid('pointerup', 2, V2.x, ly + 20);
      const held = B.S.joy.y < -0.3, leverMoved = B.S.lever > 0.06;
      pid('pointermove', 1, J2.x, J2.y + J2.r * 0.8); const stillFollows = B.S.joy.y < -0.6;
      pid('pointerup', 1, J2.x, J2.y + J2.r * 0.8); const zeroA = B.S.joy.x === 0 && B.S.joy.y === 0;
      pid('pointerdown', 1, J2.x, J2.y); pid('pointermove', 1, J2.x + J2.r * 0.7, J2.y);
      pid('pointerdown', 2, V2.x, V2.y0 + B.S.lever * (V2.y1 - V2.y0)); pid('pointerup', 1, J2.x + J2.r * 0.7, J2.y);
      const zeroB = B.S.joy.x === 0 && B.S.joy.y === 0; pid('pointercancel', 2, 0, 0);
      const e0 = B.S.elev; B.run(1); const noDrift = B.S.elev === e0;
      row('두 손가락(손잡이 + 레버) — 손잡이가 붙지 않음', `쥔 동안 ${held} · 레버 ${leverMoved} · 계속 따라옴 ${stillFollows} · 손잡이 먼저 뗌 ${zeroA} · 반대 차례 ${zeroB} · 안 흘러감 ${noDrift}`,
        held && leverMoved && stillFollows && zeroA && zeroB && noDrift && B.S.drags.size === 0); }

    // 의뢰 1
    B.S.mi = 0; B.S.waiting = false; B.setAim(0.45); B.setLever(0); B.setElev(10); B.showMission();
    pe('pointerdown', J.x, J.y); pe('pointerup', J.x, J.y);
    row('의뢰 1 — 실패 귀띔', note(), note().includes('아직 고리가 보여요'));
    B.setElev(0.6); row('의뢰 1', note(), note().includes('성공'));
    await wait(8200);
    // 의뢰 2: 바로 내려가면 부딪힘 → 기다렸다 내려감
    B.setAim(0.45); B.setLever(1); B.enterInside(); B.joy(0, -1);
    for (let i = 0; i < 600 && !B.S.cross.hit && !B.S.cross.crossed; i++) B.step(1 / 30);
    B.joy(0, 0); row('의뢰 2 — 실패 귀띔', note(), note().includes('부딪혔어요'));
    B.enterInside(); B.run(11); B.joy(0, -1);
    for (let i = 0; i < 600 && !B.S.cross.hit && !B.S.cross.crossed; i++) B.step(1 / 30);
    B.joy(0, 0); row('의뢰 2', note() + ' · ' + say(), note().includes('성공'));
    await wait(8200);
    // 의뢰 3: 틈으로 가서 엉뚱한 곳 → 지나가는 작은 달을 포인터로
    B.setLever(0.6); B.setAim(GAP); B.S.gt = 4; B.draw();
    const view = B.geom().view;
    pe('pointerdown', view.x + view.w * 0.5, view.y + view.h * 0.15);
    row('의뢰 3 — 실패 귀띔', note(), note().includes('거기는 아니에요'));
    const m = gapMoon(B.S.gt); pe('pointerdown', view.x + m.u * view.w, view.y + m.v * view.h);
    row('의뢰 3', note(), note().includes('성공'));
    await wait(1500);
    row('까닭 띄움', document.getElementById('why').innerText, document.getElementById('why').innerText.includes('얼음 조각'));
    await wait(6800);
    row('자유 열림', note(), B.S.free && note().includes('자유') && !document.getElementById('free').classList.contains('hide'));
    B.setLever(0.1); B.setAim(0.45); B.setElev(14);
    window.__pause = false;
    return out;
  });
}
