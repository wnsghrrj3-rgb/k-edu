/* 자라는 결정 회색 판: 표 열두 줄 + 의뢰 셋을 손잡이(디버그 창 __crystal 과 실제 포인터)로 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__crystal, say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const cv = document.getElementById('cv'), wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const ev = (type, x, y, id = 1) => cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: id }));
    /** 손잡이 i 를 포인터로 da 라디안 돌린다(작은 걸음으로 끌기) */
    const twist = (i, da) => {
      const k = B.knob(i), a0 = -Math.PI / 2, n = 12;
      ev('pointerdown', k.x + Math.cos(a0) * k.r * 0.8, k.y + Math.sin(a0) * k.r * 0.8);
      for (let s = 1; s <= n; s++) { const a = a0 + da * s / n; ev('pointermove', k.x + Math.cos(a) * k.r * 0.8, k.y + Math.sin(a) * k.r * 0.8); }
      ev('pointerup', 0, 0);
    };
    let t;
    B.S.mi = 3; B.S.free = false;                        // 표를 도는 동안 의뢰는 잠시 끈다
    // 1 · 2 — 온도 다이얼을 포인터로
    B.pick('snow'); B.setT(-2); B.setW(0.5); B.reset(true); B.run(10);
    t = say(); row('표 1 영하 2도 → 육각 판', t, t.includes('육각 판') && B.res().kind === 'plate');
    B.reset(true); twist(0, -(3 / 30) * Math.PI * 1.5); B.run(10);
    t = say(); row('표 2 영하 5도 → 바늘·기둥(포인터로 다이얼)', `${Math.round(B.S.T)}°C · ` + t, B.S.T < -4 && B.S.T > -10 && t.includes('바늘·기둥'));
    B.setT(-15); B.reset(true); twist(1, 0.4 * Math.PI * 1.5); B.run(10);
    t = say(); row('표 3 영하 15도 + 물기 많이 → 별 모양(포인터로 물기)', `물기 ${B.S.w.toFixed(2)} · ` + t, B.S.w > 0.67 && t.includes('별 모양'));
    B.setT(-2); B.setW(0.5); B.reset(true); B.run(8); B.setT(-15); B.setW(0.9); B.run(12);
    t = say(); row('표 4 도중에 온도 바꿈 → 가운데 판, 끝 가지', t, t.includes('가운데는 판, 끝은 가지'));
    B.twin(); B.run(30);
    t = say(); row('표 5 같은 조건 두 번 → 닮았지만 똑같지 않다', t, t.includes('닮았지만'));
    B.pick('salt'); B.setW(0.05); B.run(25);
    t = say(); row('표 6 소금물 천천히 → 정육면체', t, t.includes('정육면체') && B.res().kind === 'cube');
    B.setW(1); B.reset(true); B.run(10);
    t = say(); row('표 7 빨리 말림 → 잘고 뭉친 가루', t, t.includes('잘고 뭉친 가루'));
    B.pick('bismuth'); B.setW(0.05); B.run(1); const melt = say(); B.setT(240); B.run(14);
    t = melt + ' → ' + say(); row('표 8 녹였다 천천히 식힘 → 무지개 계단 탑', t, melt.includes('녹았어요') && say().includes('소용돌이') && say().includes('무지개'));
    B.setT(300); B.reset(true); B.setW(1); B.run(1); B.setT(240); B.run(6);
    t = say(); row('표 9 빨리 식힘 → 은빛 덩어리', t, t.includes('은빛 덩어리'));
    B.pick('quartz'); B.run(1); const young = say();
    // 시간 감기 바퀴를 포인터로 두 바퀴(시계 방향)
    for (let k = 0; k < 4; k++) twist(2, Math.PI * 0.99);
    t = young + ' → ' + say(); row('표 10 수정 아주 오래 → 육각 기둥에 뾰족한 끝(포인터로 시간 감기)', t, young.includes('작은 알갱이') && say().includes('뾰족한 끝'));
    B.crank(-2); t = say(); row('표 10-2 돌려 보기 → 다시 작은 알갱이', t + ` (${Math.round(B.S.viewT)} / ${Math.round(B.S.total)}년)`, t.includes('작은 알갱이') && B.S.viewT < B.S.total);
    { // 바퀴를 뒤로 돌린 채 잡고 있으면 그 자리에 멈춰 있다 → 놓으면 다시 앞으로
      const k = B.knob(2), a0 = -Math.PI / 2; ev('pointerdown', k.x + Math.cos(a0) * k.r * 0.8, k.y + Math.sin(a0) * k.r * 0.8);
      ev('pointermove', k.x + Math.cos(a0 - 0.3) * k.r * 0.8, k.y + Math.sin(a0 - 0.3) * k.r * 0.8);
      const held = B.S.viewT; B.run(2); const still = B.S.viewT; ev('pointerup', 0, 0); B.run(1); const moved = B.S.viewT;
      row('돌려 보기 — 바퀴를 잡고 있으면 멈춤, 놓으면 앞으로', `${Math.round(held)} → ${Math.round(still)} → ${Math.round(moved)}년`, Math.abs(still - held) < 1e-6 && moved > still);
    }
    { // 두 번째 손가락은 무시: 온도를 잡은 채 다른 손가락으로 물기를 돌려도 물기는 그대로
      const k0 = B.knob(0), k1 = B.knob(1), w0 = B.S.w;
      ev('pointerdown', k0.x, k0.y - k0.r * 0.8, 1); ev('pointerdown', k1.x, k1.y - k1.r * 0.8, 2); ev('pointermove', k1.x + k1.r * 0.8, k1.y, 2);
      ev('pointerup', 0, 0, 2); ev('pointerup', 0, 0, 1);
      row('두 번째 손가락은 손잡이를 빼앗지 못한다', `물기 ${w0.toFixed(2)} → ${B.S.w.toFixed(2)}`, B.S.w === w0 && !B.S.drag);
    }
    B.run(20);
    B.pick('snow'); B.setT(-2); B.setW(0.5); B.reset(true); B.run(6);
    // 결정(표본 상자 가운데)을 포인터로 눌러 흠을 낸다
    const W = innerWidth, top = document.querySelector('.top').getBoundingClientRect().bottom + 8, bot = innerHeight - document.querySelector('.bar').getBoundingClientRect().top + 12;
    const wide = W >= innerHeight * 1.15, stg = wide ? { x: 8, y: top, w: W * 0.64 - 12, h: innerHeight - top - bot } : { x: 8, y: top, w: W - 16, h: (innerHeight - top - bot) * 0.6 };
    ev('pointerdown', stg.x + stg.w / 2, stg.y + stg.h * 0.45); ev('pointerup', 0, 0); B.refresh();
    const cut = say(); B.run(10);
    t = cut + ' → ' + say(); row('표 11 흠을 냄 → 메우며 다시 반듯(포인터로 누름)', t, cut.includes('메워지고') && say().includes('다시 반듯해졌어요'));
    B.S.free = true; B.showMission(); B.pick('cave'); B.crank(3);
    t = say(); row('표 12 거대 결정 동굴(자유) → 사람보다 큰 기둥 + 탐험가', t, t.includes('사람보다 큰 흰 기둥') && t.includes('탐험가'));
    const caveBtn = !document.getElementById('cave').classList.contains('hide');
    row('자유 — 동굴 상자 칩이 보인다', String(caveBtn), caveBtn);

    // 의뢰 셋(처음부터)
    B.S.free = false; B.S.mi = 0; B.pick('snow'); B.showMission();
    B.setT(-15); B.setW(0.9); B.reset(true); B.run(10);
    row('의뢰 1 별 모양 눈', note(), note().includes('성공'));
    B.setT(-15); B.setW(0.9); B.reset(true); B.run(25);         // 성공 뒤 8초 안에 손잡이를 만지고 다 길러도
    row('성공 글은 8초 동안 다음 의뢰 귀띔에 덮이지 않는다', note(), note().includes('성공'));
    await wait(8200);
    B.setT(-15); B.setW(0.9); B.reset(true); B.run(25);
    row('의뢰 2 귀띔(처음부터 가지)', note(), note().includes('처음부터 가지') && note().includes('귀띔'));
    B.setT(-2); B.setW(0.5); B.reset(true); B.run(8); B.setT(-15); B.setW(0.9); B.run(8);
    row('의뢰 2 주문서(판 → 가지)', note(), note().includes('성공'));
    await wait(8200);
    B.pick('bismuth'); B.setW(0.5); B.run(1); B.setT(200); B.run(12);
    row('의뢰 3 귀띔(더 천천히)', note(), note().includes('더 천천히'));
    const tell3 = note();
    B.setT(300); B.run(40); B.setW(0.05); B.setT(200); B.run(12);   // 오래(160분) 녹여 두어도 한도에 막히지 않는다
    row('의뢰 3 가장 큰 무지개 계단(오래 녹인 뒤에도)', note(), tell3.includes('다시 271도 위로') && note().includes('성공'));
    await wait(1500);
    const why = document.getElementById('why').innerText; row('까닭 뜸', why, why.includes('천천히 자랄수록'));
    await wait(6800);
    row('세 의뢰 뒤 자유', note(), note().includes('자유') && !document.getElementById('cave').classList.contains('hide'));
    window.__pause = false;
    return out;
  });
}
