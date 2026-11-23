/* 혈관 속 회색 판: 표 열 줄 + 의뢰 셋을 진짜 손가락처럼(캔버스 포인터) 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__blood, cv = document.getElementById('cv'), R = () => B.R;
    const say = () => document.getElementById('say').textContent, note = () => document.getElementById('note').innerText;
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const press = (x, y) => { cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true, pointerId: 1 })); cv.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, bubbles: true, pointerId: 1 })); };
    const G = () => B.geom();
    const lever = v => { const L = G().lever; press(L.x, L.mid - v * (L.y1 - L.y0) / 2); };
    const fork = b => { const p = G().fork[b]; press(p.x, p.y); };
    const runBtn = on => { const k = on ? G().run : G().rest; press(k.x, k.y); };
    const light = () => { const k = G().sw; press(k.x, k.y); };
    const SEGS = ['heartL', 'aorta', 'artery', 'cap', 'vein', 'heartR', 'pa', 'lungcap', 'pv'], at = () => SEGS[R().seg];
    let seen = [];
    const run = (sec, until) => { for (let t = 0; t < sec; t += 1 / 30) { B.step(1 / 30); const s = say(); if (seen[seen.length - 1] !== s) seen.push(s); if (until && until()) break; } };
    const rideTo = id => run(150, () => at() === id);
    const fresh = () => { B.reset(); R().free = true; seen = []; };
    const got = (...w) => w.every(x => seen.some(s => s.includes(x)));
    // 들어오자마자: 손대기 전에는 심장 안에서 기다리고, 갈림길을 고르면 출발
    run(3); const parked = at() === 'heartL' && R().parked; fork('머리'); run(1.2);
    row('처음엔 심장에서 기다림 → 갈림길 고르면 출발', `기다림 ${parked} · 지금 ${at()}`, parked && at() === 'aorta');
    { const p = G().fork, d = Math.min(20, (p['손'].y - p['머리'].y) * 0.45);           // 두 칩 사이: 가까운 쪽이 골라져야 한다
      press(p['손'].x, p['손'].y - d); const a1 = R().fork; press(p['머리'].x, p['머리'].y + d); const a2 = R().fork;
      row('갈래 칩: 가장 가까운 것', a1 + ' · ' + a2, a1 === '손' && a2 === '머리'); }
    { // 둘째 손가락이 레버 끌기를 빼앗지 않는다
      const L = G().lever, p = G().fork['발'], ev = (t, id, x, y) => cv.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, bubbles: true, pointerId: id }));
      const f0 = R().fork; ev('pointerdown', 1, L.x, L.mid); ev('pointerdown', 2, p.x, p.y); ev('pointermove', 2, L.x, L.y1);
      const ok2 = R().fork === f0 && R().lever === 0; ev('pointerup', 2, p.x, p.y); ev('pointermove', 1, L.x, L.y0); const lv = R().lever; ev('pointerup', 1, L.x, L.y0); B.act.lever(0);
      row('둘째 손가락 무시', `갈래 ${R().fork} · 레버 ${lv}`, ok2 && lv === 1); }
    B.S.mi = 9;                                                   // 표를 도는 동안은 의뢰 판정을 쉰다
    fresh(); run(0.2); const waited = at() === 'heartL'; rideTo('aorta'); row('표 1 심장 안에서 기다리기', seen.join(' | '), got('쿵 열리며') && waited);
    row('표 2 굵은 길', say(), say().includes('불룩'));
    seen = []; rideTo('artery'); row('표 3 가는 길', say(), say().includes('좁아져요'));
    seen = []; rideTo('vein'); row('표 4 실핏줄(한 줄 · 검붉게)', seen.join(' | '), got('한 줄로', '검붉게'));
    seen = [say()]; run(30, () => R().valveIdx >= 1); lever(-1); run(4); lever(0);
    row('표 5 돌아오는 길(느림 · 문 · 거꾸로 못 감)', seen.join(' | '), got('한쪽으로만 열리는 문이', '거꾸로 못 가요'));
    seen = []; rideTo('pv'); row('표 6 허파의 실핏줄', seen.join(' | '), got('공기주머니', '선홍색으로'));
    runBtn(true); row('표 7 달리기 단추', say(), say().includes('빨라지고') && R().run);
    runBtn(false);
    fresh(); fork('발'); seen = []; rideTo('cap'); row('표 8 상처(발 쪽 길)', seen.join(' | '), got('혈소판', '그물'));
    seen = []; rideTo('heartR'); row('표 9 세균', seen.join(' | '), got('백혈구', '삼켜요'));
    fresh(); R().free = false; rideTo('aorta'); lever(-1); const b0 = R().battery; run(1.5);
    row('표 10 흐름을 거슬러 버티기', say() + ` (전지 ${Math.round(b0)}→${Math.round(R().battery)})`, say().includes('부딪쳐') && R().battery < b0);
    lever(0); light(); row('탐조등 스위치', say(), R().light && say().includes('탐조등')); light();

    // 의뢰 셋
    B.reset(); B.S.free = false; B.startMission(0);
    fork('머리'); rideTo('cap'); const n1 = note();
    run(150, () => at() === 'aorta'); fork('손'); rideTo('cap');
    row('의뢰 1 손끝까지(머리로 가면 귀띔)', n1 + ' → ' + note(), n1.includes('머리의 실핏줄') && note().includes('성공'));
    // 성공 뒤 8초 창: 손끝 실핏줄에서 검붉어져도 의뢰 2 귀띔이 성공 문구를 덮지 않는다
    const w0 = note(); rideTo('vein'); const w1 = note();
    row('의뢰 사이 기다림(성공 문구 그대로)', w1, w1 === w0 && B.S.waiting);
    B.startMission(1); rideTo('heartR'); const n2 = note(); rideTo('pv'); const n2b = note();
    const mk = () => { const k = G().mark; press(k.x, k.y); };
    mk(); const n2c = note(); rideTo('lungcap'); run(0.5); mk();
    row('의뢰 2 붉어지는 곳(흐름만 타면 안 됨 · 「여기!」)', [n2, n2b, n2c, note()].join(' → '),
      n2.includes('숨 쉬는 곳') && !n2b.includes('성공') && n2c.includes('이미 붉은') && note().includes('성공'));
    B.startMission(2); run(150, () => at() === 'aorta'); rideTo('heartR'); const n3 = note(); run(150, () => R().lap.done); const n3b = note();
    const askOn = !document.getElementById('ask').classList.contains('hide');
    const chip = n => document.querySelector(`#ask .chip[data-n="${n}"]`).click();
    chip(1); const n3c = note(); chip(2);
    row('의뢰 3 한 바퀴 + 심장 지난 수 맞히기', [n3, n3b, n3c, note()].join(' → '),
      n3.includes('아직 한 바퀴가 아니') && !n3b.includes('성공') && askOn && n3c.includes('1번이 아니') && note().includes('성공')
      && document.getElementById('ask').classList.contains('hide'));
    row('자유 열림', String(B.S.free), B.S.free === true);
    return out;
  });
}
