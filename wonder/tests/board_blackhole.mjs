/* 블랙홀 회색 판: 표 열 줄 + 의뢰 셋을 손잡이(디버그 창 __bh)로 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__bh, say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const run = sec => { for (let t = 0; t < sec; t += 1 / 30) B.step(1 / 30); };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const go = (what, aim, power, sec = 40, ship = 20) => { B.setShip(ship); B.pick(what); B.throwIt(aim, power); run(sec); return say(); };
    B.S.mi = 0; B.showMission();
    let t;
    t = go('planet', 0, .3); row('표 1 곧장', t, t.includes('국수'));
    t = go('planet', Math.PI / 2, .57, 60); row('표 2 궤도', t, t.includes('둘레를 돌아요'));
    B.S.mi = 0;
    t = go('planet', 1.0, .2); row('표 3 나선', t, t.includes('나선'));
    t = go('planet', .35, 1); row('표 4 튕김', t, t.includes('튕겨'));
    t = go('star', Math.PI / 2, .35); row('표 5 별 찢김', t, t.includes('찢겨'));
    B.S.mi = 1; t = go('probe', Math.PI / 2, .3); row('표 6 시계 느려짐', t, /0\.\d\d배/.test(t));
    t = go('probe', 0, .3, 20); row('표 7 가장자리 멈춤', t, t.includes('끝내 못 봐요'));
    B.setShip(30); B.S.shipBase = 30; const shadowFar = B.rel();
    t = say(); row('표 8 다가가기(레버 값)', 'rel ' + shadowFar, shadowFar === 30);
    B.passBehind(); const kinds = new Set(); for (let s = 0; s < 8.2; s += 1 / 30) { B.step(1 / 30); kinds.add(say()); }
    t = [...kinds].join(' | '); row('표 9 하나→둘→고리', t, t.includes('하나') && t.includes('둘로') && t.includes('고리'));
    B.S.free = true; B.grow(); B.grow(); t = say(); row('표 10 키우기', t, t.includes('순해요'));
    B.grow();
    B.S.mi = 0; B.S.free = false; B.showMission();
    go('planet', Math.PI / 2, .5, 60); row('의뢰 1', note(), note().includes('성공'));
    go('probe', Math.PI / 2, .24, 40); row('성공 뒤 8초 안에는 다음 의뢰를 재지 않음', note() + ' · mi ' + B.S.mi, note().includes('세 바퀴') && B.S.mi === 1);
    await wait(8200);
    go('probe', Math.PI / 2, .24, 40); row('의뢰 2', note(), note().includes('성공'));
    await wait(8200);
    // 의뢰 3: 창밖 고리를 실제 포인터로 짚는다(고리 반지름 = 아인슈타인 각)
    const { lensImages } = await import('/wonder/blackhole/logic.js');
    const W = innerWidth, H = innerHeight, top = document.querySelector('.top').getBoundingClientRect().bottom + 8, bot = innerHeight - document.querySelector('.bar').getBoundingClientRect().top + 12;
    const WIN = { x: W * 0.6 + 4, y: top, w: W * 0.4 - 12, h: H - top - bot }, R = Math.min(WIN.w, WIN.h - 30) / 2 - 6;
    const cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2 + 8, th = lensImages(B.S.hidden.beta, B.rel(), B.S.mass).thetaE;
    const cv = document.getElementById('cv');
    cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: cx, clientY: cy - th * R / 0.85, bubbles: true, pointerId: 1 }));
    row('의뢰 3', note(), note().includes('성공'));
    return out;
  });
}
