/* 깊은 바다 회색 판: 표 열 줄 + 전지 + 의뢰 셋을 진짜 손가락처럼(캔버스 포인터) 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__deepsea, D = B.D, cv = document.getElementById('cv');
    const say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const press = (x, y) => { cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 })); cv.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true, pointerId: 1 })); };
    const G = () => B.geom();
    const lever = v => { const L = G().lever; press(L.x, L.mid + v * (L.y1 - L.y0) / 2); };
    const light = () => { const k = G().sw; press(k.x, k.y); };
    const dir = a => { const k = G().dial; press(k.x + Math.sin(a) * k.s, k.y - Math.cos(a) * k.s); };
    const photo = () => { const k = G().cam; press(k.x, k.y); };
    const tap = () => { const c = G().win; press(c.x, c.y); };
    let seen = [];
    const run = (sec, until) => { for (let t = 0; t < sec; t += 1 / 30) { B.step(1 / 30); const s = say(); if (seen[seen.length - 1] !== s) seen.push(s); if (until && until()) break; } };
    const goTo = (depth, v = 0.6) => { const down = depth > D.depth; lever(down ? v : -v); run(200, () => down ? D.depth >= depth || D.landed : D.depth <= depth); lever(0); };
    const fresh = () => { B.newDive(); D.free = true; seen = []; };
    const got = (...words) => words.every(w => seen.some(s => s.includes(w)));
    B.S.mi = 9;                                                   // 표를 도는 동안은 의뢰 판정을 쉰다
    fresh(); goTo(1200, 0.5); row('표 1 물색·햇빛 무늬', seen.join(' | '), got('파랑으로', '남색으로', '검정으로', '햇빛 무늬가 사라졌어요'));
    fresh(); goTo(30, 0.2); goTo(90, 0.2); light(); seen.push(say());
    row('표 2 빨간 물고기 검게 → 켜면 빨갛게', seen.join(' | '), got('검게 보여요', '다시 빨개요'));
    fresh(); goTo(500); run(4); row('표 3 어스름 층 불 끄기', say(), got('푸른 점들'));
    light(); row('표 4 탐조등 켜기', say(), say().includes('바다 눈'));
    light(); seen = []; goTo(2000); run(5); light(); seen.push(say());
    row('표 5 캄캄한 층에서 기다리기 → 켜면', seen.join(' | '), got('초롱 하나가', '이빨'));
    light(); tap(); row('표 6 창 톡톡', say(), say().includes('번쩍'));
    seen = []; goTo(5000); row('표 7 계속 내려가기', seen.join(' | '), got('쪼그라들', '끼익'));
    seen = []; goTo(5800); light(); dir(0.9); seen.push(say());
    row('표 8 깊은 바닥 굴뚝(오른쪽 비추기)', seen.join(' | '), got('따뜻한 물', '검은 연기', '관 벌레'));
    seen = []; lever(0.6); run(200, () => D.landed && D.stage === 'trench'); lever(0);
    row('표 9 바닥에 내리기', seen.join(' | '), got('고래 뼈대', '흙먼지', '가장 깊은 곳'));
    fresh(); const na = D.accidents.length; lever(1); run(3, () => D.accidents.length > na);
    { const L = G().lever; cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: L.x, clientY: L.mid + 10, bubbles: true, pointerId: 1 }));
      for (let k = 0; k < 5; k++) cv.dispatchEvent(new PointerEvent('pointermove', { clientX: L.x, clientY: L.mid + 20 + k * 8, bubbles: true, pointerId: 1 }));
      cv.dispatchEvent(new PointerEvent('pointerup', { clientX: L.x, clientY: L.mid, bubbles: true, pointerId: 1 })); } row('표 10 너무 빨리(잠긴 레버를 끌어도 경보 문구가 남음)', say(), say().includes('자동으로 멈췄') && say().includes('잠겼어요') && D.accidents.length > 0 && D.lever === 0);
    fresh(); D.free = false; goTo(300); light(); const dv = D.dives; run(80, () => D.dives > dv);
    row('긴장: 전지(켜고 다니면 비상으로 떠오름)', seen.join(' | '), got('전지가 다 떨어졌어요', '비상 떠오르기 끝'));

    // 의뢰 셋
    B.S.free = false; B.startMission(0); B.newDive();
    goTo(500); run(4); photo(); const n1 = note(); tap(); D.found.vent = true; photo();
    row('의뢰 1 빛나는 것 셋(둘이면 귀띔)', n1 + ' → ' + note(), n1.includes('1가지 더') && note().includes('성공'));
    // 성공 뒤 다음 의뢰가 뜨기 전(8초 창): 굴뚝을 이미 본 적이 있어도 의뢰 2 가 저절로 통과하면 안 된다
    const w0 = note(); tap(); run(1); light(); dir(0.9); light(); const w1 = note();
    row('의뢰 사이 기다림(의뢰 2 저절로 통과 안 함)', w1, w1 === w0 && !w1.includes('굴뚝 마을') && B.S.waiting && !D.found.vent);
    B.startMission(1); goTo(5800); dir(-0.9); light(); const n2 = note(); dir(0.9);
    row('의뢰 2 굴뚝 마을', n2 + ' → ' + note(), n2.includes('돌려') && note().includes('성공'));
    B.startMission(2); const d0 = D.dives; lever(0.75); run(200, () => D.landed); lever(-1); run(200, () => D.dives > d0); const n3 = note();
    lever(0.75); run(200, () => D.landed && D.stage === 'trench'); lever(-1); run(200, () => D.dives > d0 + 1);
    row('의뢰 3 컵 엄지만(얕으면 귀띔)', n3 + ' → ' + note(), n3.includes('더 깊이') && note().includes('성공'));
    row('자유 열림', String(B.S.free), B.S.free === true);
    return out;
  });
}
