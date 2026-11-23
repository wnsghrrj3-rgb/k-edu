/* 태양 회색 판: 표 열 줄 + 의뢰 셋을 진짜 마우스로 조종판(거리 레버·색유리 다이얼·지구 받침)과 창을 움직여 글자가 나오는지 */
export async function check(page) {
  const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
  const ev = (fn, arg) => page.evaluate(fn, arg);
  await ev(() => { window.__pause = true; });
  const say = () => ev(() => document.getElementById('say').textContent);
  const note = () => ev(() => document.getElementById('note').innerText);
  const H = () => ev(() => window.__sun.handles());
  const run = sec => ev(s => { for (let t = 0; t < s; t += 1 / 30) window.__sun.step(1 / 30); }, sec);
  const S2 = (x, y) => ev(([x, y]) => window.__sun.toS(x, y), [x, y]);
  async function lever(d) {
    const L = (await H()).lever;
    await page.mouse.move(L.x, L.ky); await page.mouse.down();
    await page.mouse.move(L.x, L.y0 + (L.y1 - L.y0) * d, { steps: 4 }); await page.mouse.up();
  }
  const DET = { none: -90, visible: -30, red: 30, uv: 90 };
  async function glass(f) {
    const D = (await H()).dial, a = DET[f] * Math.PI / 180;
    await page.mouse.click(D.x + Math.sin(a) * D.r * 0.7, D.y - Math.cos(a) * D.r * 0.7);
  }
  async function earthTo(x, y) {
    const T = (await H()).tray, [sx, sy] = await S2(x, y);
    await page.mouse.move(T.x, T.y); await page.mouse.down(); await page.mouse.move(sx, sy, { steps: 6 }); await page.mouse.up();
  }
  async function dragLine(a, b) {
    const [ax, ay] = await S2(a[0], a[1]), [bx, by] = await S2(b[0], b[1]);
    await page.mouse.move(ax, ay); await page.mouse.down(); await page.mouse.move(bx, by, { steps: 8 }); await page.mouse.up();
  }
  const { SPOTS, PROMS, EARTH_DIAM } = await ev(async () => {
    const m = await import('/wonder/sun/logic.js'); return { SPOTS: m.SPOTS, PROMS: m.PROMS, EARTH_DIAM: m.EARTH_DIAM };
  });
  const big = SPOTS.find(s => s.km >= EARTH_DIAM), small = SPOTS.find(s => s.km < EARTH_DIAM), P = PROMS[0];
  const st = () => ev(() => { const S = window.__sun.S; return `[${S.filter} · 거리 ${S.dist.toFixed(2)}]`; });

  await ev(() => { window.__sun.S.mi = 3; });                                               // 표를 도는 동안은 판정하지 않는다
  let t;
  await lever(0.5);
  await glass('none'); t = await say(); row('표 1 색유리 없음', t + await st(), t.includes('하얗게 날아가요') && t.includes('가리개'));
  await glass('visible'); t = await say(); row('표 2 보통 빛', t + await st(), t.includes('노란 공') && t.includes('흑점'));
  await glass('red'); t = await say(); row('표 3 붉은 빛', t + await st(), t.includes('쌀알 무늬') && t.includes('붉은 불기둥'));
  await glass('uv'); t = await say(); row('표 4 자외선', t + await st(), t.includes('빛의 다리'));
  await glass('red'); await earthTo(Math.cos(P.angle) * 1.05, Math.sin(P.angle) * 1.05); t = await say();
  row('표 5 지구를 불기둥 옆에', t, /불기둥 하나가 지구 \d+개 높이/.test(t));
  await lever(0.85); await glass('visible'); const t8 = await say();
  await earthTo(big.x, big.y); t = await say(); row('표 6 지구를 흑점 위에', t + await st(), t.includes('흑점 하나에 지구가 쏙'));
  await lever(0.5); await page.click('[data-m="line"]');
  await dragLine([-1.15, 0.01], [1.15, -0.01]); t = await say(); row('표 7 지구를 한 줄로', t, t.includes('태양 지름에 지구가 109개'));
  await page.click('[data-m="one"]');
  row('표 8 흑점에 다가감', t8, t8.includes('여전히 눈부시게 뜨거워요') && t8.includes('4,000도'));
  await glass('uv'); await run(6.6); t = await say(); row('표 9 꼬인 다리를 기다림', t, t.includes('툭 끊어지며 폭발') && t.includes('오로라'));
  await lever(0.1); await glass('visible');
  await earthTo(0.6, 0.6); t = await say(); row('멀리에서 지구를 놓으면 귀띔', t, t.includes('너무 멀어요'));
  const F = await ev(() => { const f = window.__sun.frameOf(); return [f.cx, f.cy]; });
  await page.mouse.click(F[0], F[1]); await run(4); const tGo = await say(); await run(5); t = await say();
  row('표 10 빛 한 줄기', tGo + ' → ' + t, tGo.includes('가는 중') && t.includes('8분 20초'));

  // 의뢰 셋 — 처음부터
  await ev(() => { const B = window.__sun; B.S.mi = 0; B.S.free = false; B.set({ dist: 0.5, filter: 'visible', mode: 'one' }, false); B.paint(); B.showMission(); });
  await lever(0.85);
  await earthTo(small.x, small.y); const f1 = await note();
  await earthTo(big.x, big.y); t = await note(); const cleared = await ev(() => window.__sun.S.earth === null);
  row('의뢰 1 지구가 들어가는 흑점', f1 + ' → ' + t + ` [성공 뒤 지구 치움 ${cleared}]`, f1.includes('더 큰 흑점') && t.includes('성공') && cleared);
  await page.waitForTimeout(1400);
  const why = await ev(() => document.getElementById('why').classList.contains('show') ? document.getElementById('why').innerText : '');
  row('까닭 뜸', why, why.includes('흑점은 식은 게 아니라'));
  await ev(() => window.__sun.showMission());
  await lever(0.5); await glass('uv'); await run(2);
  await page.click('#photo'); const f2 = await note();
  await run(4.5); await page.click('#photo'); t = await note(); row('의뢰 2 폭발의 순간 찍기', f2 + ' → ' + t, f2.includes('아직 안 터졌어요') && t.includes('성공'));
  await glass('visible'); await page.click('[data-m="line"]'); await dragLine([0.02, 1.15], [-0.02, -1.15]);
  const g = await note(), gs = await ev(() => ({ mi: window.__sun.S.mi, free: window.__sun.S.free, waiting: window.__sun.S.waiting }));
  row('성공 뒤 쉬는 때는 다음 의뢰를 판정하지 않음', g + ` [의뢰 ${gs.mi + 1} 대기 ${gs.waiting}]`, g.includes('성공') && gs.mi === 2 && !gs.free && gs.waiting);
  await ev(() => window.__sun.showMission());
  await glass('visible'); await page.click('[data-m="line"]');
  await dragLine([-1.15, 0], [0.1, 0]); const f3 = await note();
  await dragLine([0.02, 1.15], [-0.02, -1.15]); t = await note(); row('의뢰 3 지구 몇 개', f3 + ' → ' + t, f3.includes('끝에서 끝까지') && t.includes('성공'));
  const free = await ev(() => window.__sun.S.free);
  row('자유 풀림', '의뢰 셋 뒤 ' + free, free);
  await ev(() => { const B = window.__sun; B.showMission(); B.set({ dist: 0.5, filter: 'red', mode: 'one' }, false); B.S.flash = 0; B.paint(); window.__pause = false; });
  return out;
}
