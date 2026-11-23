/* 오로라 회색 판: 표 아홉 줄 + 의뢰 셋을 진짜 마우스로 조종판(레버·다이얼·스위치)을 움직여 글자가 나오는지 */
export async function check(page) {
  const out = [], row = (name, text, ok) => out.push({ name, text, ok: !!ok });
  const ev = (fn, arg) => page.evaluate(fn, arg);
  await ev(() => { window.__pause = true; });
  const say = () => ev(() => document.getElementById('say').textContent);
  const note = () => ev(() => document.getElementById('note').innerText);
  const H = () => ev(() => window.__aurora.handles());
  async function lever(f) {
    const h = await H(), L = h.lever;
    await page.mouse.move(L.x, L.ky); await page.mouse.down();
    await page.mouse.move(L.x, L.y1 - (L.y1 - L.y0) * f, { steps: 4 }); await page.mouse.up();
  }
  async function dial(alt) {
    const h = await H(), D = h.dial, a = -Math.PI * 0.75 + (Math.PI * 1.5) * (alt - 70) / 180;
    const x = D.x + Math.sin(a) * D.r * 0.7, y = D.y - Math.cos(a) * D.r * 0.7;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.up();
  }
  async function flip() { const h = await H(); await page.mouse.click(h.sw.x, h.sw.y); }
  const st = () => ev(() => { const S = window.__aurora.S; return { wind: S.wind, alt: S.alt, cut: S.cut }; });

  await ev(() => { const B = window.__aurora; B.S.mi = 3; B.S.free = false; });             // 표를 도는 동안은 판정하지 않는다
  let t;
  await dial(135);
  await lever(0.15); t = await say(); row('표 1 바람 약함', t, t.includes('지평선 가까이 희미한 초록 띠'));
  await lever(0.45); t = await say(); row('표 2 바람 보통', t, t.includes('하늘을 가로질러 너울너울'));
  await lever(0.75); t = await say(); row('표 3 바람 셈', t, t.includes('머리 위까지') && t.includes('주름이 빨라져요') && t.includes('분홍 테'));
  await lever(0.95); t = await say(); row('표 4 바람 폭풍', t, t.includes('하늘 전체') && t.includes('위쪽이 빨갛게') && t.includes('왕관'));
  await lever(0.4); await dial(230); t = await say(); row('표 5 고도 높임', t + ` (${Math.round((await st()).alt)}km)`, t.includes('빨간 커튼') && t.includes('산소'));
  await dial(75); t = await say(); row('표 6 고도 낮춤', t + ` (${Math.round((await st()).alt)}km)`, t.includes('보라·분홍') && t.includes('질소'));
  await dial(135); await flip(); const c1 = await st(); t = await say();
  await lever(0.9); const t2 = await say();
  row('표 7 우주 컷(고리)', t + ' → ' + t2, c1.cut === 'space' && t.includes('극지방을 두른 빛나는 고리') && t2.includes('굵어지고 남쪽으로'));
  await flip();
  await ev(() => { const B = window.__aurora; B.S.free = true; B.showMission(); });
  await page.click('#magnet'); t = await say(); row('표 8 (자유) 자석 끔', t, t.includes('사라지고') && t.includes('땅까지'));
  await page.click('#magnet');
  await page.click('[data-p="jupiter"]'); t = await say(); row('표 9 (자유) 목성', t, t.includes('훨씬 큰 푸른 오로라'));
  await page.click('[data-p="earth"]');

  // 의뢰 셋 — 처음부터(아직 안 맞는 자리에서 시작)
  await ev(() => { const B = window.__aurora; B.S.mi = 0; B.S.free = false; B.set({ wind: 0.2, alt: 135, cut: 'ground', magnet: true, planet: 'earth' }, false); B.showMission(); B.paint(); });
  const free0 = await ev(() => !document.getElementById('free').classList.contains('hide'));
  const fmt = s => ` [바람 ${s.wind.toFixed(2)} · 고도 ${Math.round(s.alt)}km]`;
  await lever(0.3); const f1 = await note();
  await lever(0.65); t = await note(); row('의뢰 1 초록 커튼 머리 위', f1 + ' → ' + t + fmt(await st()), f1.includes('귀띔') && t.includes('성공'));
  await page.waitForTimeout(1400);
  const why = await ev(() => document.getElementById('why').classList.contains('show') ? document.getElementById('why').innerText : '');
  row('까닭 뜸', why, why.includes('지구 자석'));
  await ev(() => window.__aurora.showMission());
  await lever(0.95); const f2 = await note();
  await lever(0.75); const f2b = await note();
  await dial(110); t = await note(); row('의뢰 2 분홍 테', f2 + ' → ' + f2b + ' → ' + t + fmt(await st()), f2.includes('빨개졌어요') && f2b.includes('가늘어요') && t.includes('성공'));
  await lever(1); const g = await note(), gs = await ev(() => ({ mi: window.__aurora.S.mi, free: window.__aurora.S.free, waiting: window.__aurora.S.waiting }));
  row('성공 뒤 쉬는 때는 다음 의뢰를 판정하지 않음', g + ` [의뢰 ${gs.mi + 1} 대기 ${gs.waiting}]`, g.includes('성공') && gs.mi === 2 && !gs.free && gs.waiting);
  await ev(() => window.__aurora.showMission());
  await lever(0.8); const f3 = await note();
  await lever(1); t = await note(); row('의뢰 3 우리나라에서도', f3 + ' → ' + t + fmt(await st()), f3.includes('귀띔') && t.includes('성공'));
  const free1 = await ev(() => window.__aurora.S.free && !document.getElementById('free').classList.contains('hide'));
  row('자유 풀림', `처음 ${free0} → 의뢰 셋 뒤 ${free1}`, !free0 && free1);
  await ev(() => { window.__aurora.showMission(); window.__aurora.set({ wind: 0.6, alt: 135, cut: 'ground' }, false); window.__pause = false; });
  return out;
}
