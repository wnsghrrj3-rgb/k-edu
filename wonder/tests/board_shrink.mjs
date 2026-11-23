/* 점점 작아지기 회색 판: 표 아홉 줄 + 의뢰 셋을 손잡이(디버그 창 __shrink 와 실제 포인터)로 돌려 글자가 나오는지 */
export async function check(page) {
  return page.evaluate(async () => {
    window.__pause = true;
    const B = window.__shrink, $ = id => document.getElementById(id), say = () => $('say').textContent, note = () => $('note').innerText;
    const cv = $('cv'), wait = ms => new Promise(r => setTimeout(r, ms));
    const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
    const ev = (type, x, y, id = 1) => cv.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: id }));
    const tap = (x, y) => { ev('pointerdown', x, y); ev('pointerup', x, y); };
    const desk = o => { const d = B.geom().desk.find(q => q.obj === o); tap(d.x + d.w / 2, d.y + d.h / 2); };
    const roll = dz => { const w = B.geom().wheel, x = w.x + w.w / 2; let y = w.y + w.h / 2; ev('pointerdown', x, y); const n = 10; for (let i = 0; i < n; i++) { y -= dz * 110 / n; ev('pointermove', x, y); } ev('pointerup', x, y); };
    const at = z => { B.setZ(z); return say(); };
    const centre = () => { const G = B.geom(); tap(G.cx, G.cy); };
    let t, a, b, c;
    B.S.mi = 3; B.S.free = false;                        // 표를 도는 동안 의뢰는 잠시 끈다

    desk('butterfly'); roll(0.9); a = say(); const z1 = B.S.z; b = at(2.6); c = at(4.1); B.setZ(2.6); centre(); const brown = say();
    t = [a, b, c, brown].join(' → ');
    row('표 1 나비 날개: 파란 면 → 겹친 비늘 → 가는 골, 뒤집으면 갈색(포인터: 책상·휠·창)', `z ${z1.toFixed(2)} · ` + t,
      B.S.obj === 'butterfly' && z1 > 0.8 && a.includes('파란 면') && b.includes('기왓장처럼 겹친 비늘') && c.includes('가는 골') && brown.includes('갈색') && brown.includes('물감이 아니에요'));
    centre();
    desk('salt'); a = at(1); b = at(2.3); t = a + ' → ' + b; row('표 2 소금: 흰 가루 → 유리 주사위', t, a.includes('흰 가루') && b.includes('유리 주사위'));
    desk('moss'); a = at(1); b = at(1.9); c = at(2.6); t = [a, b, c].join(' → ');
    row('표 3 이끼의 물방울: 초록 덩어리 → 이끼 잎 숲 → 물곰(다리 여덟) · 짚신벌레', t, a.includes('초록 덩어리') && b.includes('이끼 잎') && c.includes('물곰') && c.includes('여덟') && c.includes('짚신벌레'));
    desk('velcro'); a = at(1); b = at(1.8); centre(); const stuck = say(); $('velcro').click(); const apart = say(); t = [a, b, stuck, apart].join(' → ');
    row('표 4 벨크로: 까슬한 면 → 갈고리 숲과 고리 숲, 붙였다 떼기(창 누름·칩)', t, a.includes('까슬한') && b.includes('갈고리 숲과 고리 숲') && stuck.includes('걸렸어요') && apart.includes('풀려요'));
    desk('hair'); const into = say(); a = at(1); b = at(2.6); c = at(3.6); t = [a, b, c].join(' → ');
    row('표 5 머리카락: 한 올 → 밧줄 굵기 → 비늘로 덮인 기둥', into + ' · ' + t, into.startsWith('머리카락으로 들어가요') && a.includes('한 올') && b.includes('밧줄') && c.includes('비늘로 덮인 기둥'));
    desk('pencil'); a = at(1); b = at(2.5); c = at(3.5); t = [a, b, c].join(' → ');
    row('표 6 연필 글씨: 검은 선 → 종이 섬유 → 반짝이는 검은 조각', t, a.includes('검은 선') && b.includes('섬유') && c.includes('반짝이는 검은 조각'));
    desk('sand'); a = at(1); b = at(2.0); c = at(2.6); t = [a, b, c].join(' → ');
    row('표 7 모래: 다 같은 모래 → 보석 더미 → 조개 조각', t, a.includes('다 같은 모래') && b.includes('보석 더미') && c.includes('조개 조각'));
    const pollenHidden = !B.geom().desk.some(q => q.obj === 'pollen');
    B.S.free = true; B.showMission(); desk('pollen'); a = at(1); b = at(3.2); t = a + ' → ' + b;
    row('표 8 꽃가루(자유): 노란 가루 → 가시 돋친 공', t, pollenHidden && B.S.obj === 'pollen' && a.includes('노란 가루') && b.includes('가시 돋친 공'));
    desk('moss'); B.setZ(2.6); B.refresh(); const dryOn = !$('dry').classList.contains('hide');
    $('dry').click(); B.run(3.5); a = say(); $('wet').click(); B.run(0.5); b = say(); B.run(4); c = say(); t = [a, b, c].join(' → ');
    row('표 9 물곰 말리기(자유): 통처럼 멈춤 → 물 주면 다시 걷는다(칩)', t, dryOn && a.includes('통처럼') && b.includes('부풀어') && c.includes('다시 걸어요'));
    const zf = at(5.2); row('자유: 더 작아질 수 있다(빛의 물결보다 작은 곳)', zf, zf.includes('빛의 물결'));
    // 손전등: 톡 눌러 끄면 어둡다 · 끌면 비추는 각이 바뀐다
    desk('salt'); B.setZ(2.5); let G = B.geom(); tap(G.lamp.x, G.lamp.y); a = say(); const off = !B.S.light; G = B.geom(); tap(G.lamp.x, G.lamp.y); b = say();
    row('손전등 끄면 어둡고 켜면 보인다(포인터)', a + ' → ' + b, off && a.includes('어두워요') && B.S.light && b.includes('유리 주사위'));
    desk('butterfly'); B.setZ(1.2); G = B.geom(); ev('pointerdown', G.lamp.x, G.lamp.y); ev('pointermove', G.cx + G.R + 18, G.cy - 10); ev('pointerup', G.cx + G.R + 18, G.cy - 10); a = say();
    row('손전등 각 → 나비 파랑이 흐른다(포인터로 끌기)', `각 ${B.S.lightA.toFixed(2)} · ` + a, Math.abs(B.S.lightA) > 1 && a.includes('보랏빛'));
    B.setLight(true, -0.5);
    { // 두 번째 손가락은 무시: 휠을 잡은 채 다른 손가락으로 책상을 눌러도 그대로
      const w = B.geom().wheel, d = B.geom().desk.find(q => q.obj === 'salt'), o0 = B.S.obj, z0 = B.S.z;
      ev('pointerdown', w.x + w.w / 2, w.y + w.h / 2, 1); ev('pointerdown', d.x + d.w / 2, d.y + d.h / 2, 2); ev('pointermove', w.x, w.y, 2); ev('pointerup', 0, 0, 2); ev('pointerup', 0, 0, 1);
      row('두 번째 손가락은 휠을 빼앗지 못한다', `${o0} → ${B.S.obj} · z ${z0.toFixed(2)} → ${B.S.z.toFixed(2)}`, B.S.obj === o0 && B.S.z === z0 && !B.S.drag);
    }

    // 의뢰 셋(처음부터)
    B.S.free = false; B.S.mi = 0; desk('salt'); B.showMission();
    $('photo').click(); row('의뢰 1 귀띔(다른 곳)', note(), note().includes('이끼') && note().includes('귀띔'));
    desk('moss'); B.setZ(2.6); $('photo').click(); row('의뢰 1 물곰 사진', note(), note().includes('성공'));
    $('photo').click(); desk('salt'); $('photo').click(); row('성공 글은 8초 동안 다음 의뢰 귀띔에 덮이지 않는다(찍기 두 번)', note(), note().includes('성공'));
    await wait(8200);
    desk('butterfly'); B.setZ(2.6); $('photo').click(); row('의뢰 2 귀띔(뒤집어 봐요)', note(), note().includes('뒤집어'));
    B.setLight(false); centre(); const darkNote = note(); G = B.geom(); tap(G.lamp.x, G.lamp.y);
    row('의뢰 2 비늘 뒤집기(손전등 끈 채 뒤집고 → 켜면 성공)', darkNote + ' → ' + note(), darkNote.includes('어두워요') && B.S.light && note().includes('성공'));
    await wait(8200);
    desk('sand'); B.setZ(2.0); $('photo').click(); row('의뢰 3 귀띔(모래는 제각각)', note(), note().includes('제각각'));
    desk('salt'); B.setZ(2.3); $('photo').click(); row('의뢰 3 주사위 = 소금', note(), note().includes('성공'));
    await wait(1500);
    const why = $('why').innerText; row('까닭 둘 뜸', why, why.includes('물감이 아니에요') && why.includes('깨알보다 작아요'));
    await wait(6800);
    row('세 의뢰 뒤 자유', note(), note().includes('자유') && B.geom().desk.some(q => q.obj === 'pollen'));
    window.__pause = false;
    return out;
  });
}
