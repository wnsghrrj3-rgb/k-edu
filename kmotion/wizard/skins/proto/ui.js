// proto 스킨 — 화면 UI(DOM). 계약 contract/ui.d.ts: show·update·hide·toast·bind. 눌리는 자리(답 구슬)는 snapshot.targets rect 그대로
// 손 선택 판정은 시스템 몫 — 여기선 hover·locked 를 보여 주기만 한다
const J = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28], JI = Object.fromEntries(J.map((v, i) => [v, i]));
const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
const CHAR_ICON = { luna: '🌙', tori: '🌰', haru: '☀️' };
const PREF = 'kmwiz.ui';
const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const ringSvg = (r = 52) => `<svg class="mw-ring" viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="${r}"/><circle class="fg" cx="60" cy="60" r="${r}" stroke-dasharray="${(2 * Math.PI * r).toFixed(1)}" stroke-dashoffset="${(2 * Math.PI * r).toFixed(1)}"/></svg>`;

export function drawSkeleton(cv, preview, { calib = null } = {}){
  const g = cv.getContext('2d'), W = cv.width, H = cv.height; g.clearRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 1; for (let x = 0; x <= W; x += W / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  if (calib) { // 보정 안내 그림: 서기 동그라미 · 좌우 별
    g.lineWidth = 6; g.setLineDash([14, 10]); g.strokeStyle = 'rgba(255,212,92,.7)';
    if (calib.step === 'stand') { g.beginPath(); g.ellipse(W / 2, H * .5, W * .17, H * .38, 0, 0, Math.PI * 2); g.stroke(); }
    if (calib.step === 'side') { g.setLineDash([]); g.font = `${H * .12}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⭐', W * .2, H * .3); g.fillText('⭐', W * .8, H * .3); }
    if (calib.step === 'up') { g.setLineDash([]); g.font = `${H * .1}px sans-serif`; g.textAlign = 'center'; g.fillText('🙌', W / 2, H * .1); }
    g.setLineDash([]);
  }
  if (!preview || !preview.joints) { g.fillStyle = 'rgba(255,255,255,.5)'; g.font = `700 ${Math.round(H * .07)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('📷 …', W / 2, H / 2); return; }
  const P = preview.joints, col = preview.ok ? '#5cf29a' : '#ff5c6e', pt = i => { const q = P[JI[i]]; return q && q[2] !== 0 ? [q[0] * W, q[1] * H] : null; };
  g.lineCap = 'round'; g.lineWidth = Math.max(3, W / 90); g.strokeStyle = col;
  for (const [a, b] of BONES) { const p = pt(a), q = pt(b); if (p && q) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); } }
  g.fillStyle = '#fff'; for (const i of J) { const p = pt(i); if (p) { g.beginPath(); g.arc(p[0], p[1], i === 0 ? W / 30 : W / 90, 0, Math.PI * 2); g.fill(); } }
}

export function createUI(ctx, audio){
  const T = ctx.text, root = h('div', 'mw-ui'); let handlers = { action(){} };
  const act = (id, p) => { audio.unlock(); audio.play('click'); handlers.action(id, p); };
  let pref = {}; try { pref = JSON.parse(localStorage.getItem(PREF) || '{}'); } catch (_) {}
  const savePref = () => { try { localStorage.setItem(PREF, JSON.stringify(pref)); } catch (_) {} };

  // ── S01 시작
  const s01 = h('section', 'mw-scr dim mw-hide');
  s01.innerHTML = `<a class="mw-back" href="../">← 케이모션</a><div class="mw-title">${T('title')}</div><div class="mw-sub">${T('title.sub')}</div>
    <div class="mw-panel"><div class="mw-row chars"></div><div class="mw-row modes"></div><div class="mw-row calibs"></div>
    <button class="big go">▶ 시작</button><div class="mw-note help"></div></div>`;
  const charRow = s01.querySelector('.chars'), modeRow = s01.querySelector('.modes'), calRow = s01.querySelector('.calibs'), helpS = s01.querySelector('.help');
  let sel = { char: pref.char || 'luna', mode: pref.mode || 'camera', calib: false };
  const MODES = [['camera', '📷 ' + T('start.camera')], ['keyboard', '⌨️ ' + T('start.keyboard')], ['mouse', '🖱 ' + T('start.mouse')]];
  function paintS01(m){
    charRow.innerHTML = ''; for (const c of (m && m.chars) || ['luna', 'tori', 'haru']) { const b = h('button', 'mw-char' + (sel.char === c ? ' on' : ''), `<i>${CHAR_ICON[c] || '✨'}</i>${T('char.' + c)}`); b.onclick = () => { sel.char = c; pref.char = c; savePref(); paintS01(m); }; charRow.append(b); }
    modeRow.innerHTML = ''; for (const [v, l] of MODES) { const b = h('button', sel.mode === v ? 'on' : '', l); b.onclick = () => { sel.mode = v; pref.mode = v; savePref(); paintS01(m); }; modeRow.append(b); }
    calRow.innerHTML = ''; calRow.classList.toggle('mw-hide', !(sel.mode === 'camera' && m && m.hasCal));
    for (const [v, l] of [[false, T('start.quick')], [true, T('start.calib')]]) { const b = h('button', sel.calib === v ? 'on' : '', l); b.onclick = () => { sel.calib = v; paintS01(m); }; calRow.append(b); }
    helpS.innerHTML = sel.mode === 'keyboard' ? '<b>←→</b> 움직이기 · <b>Shift+←→</b> 피하기 · <b>Space</b> 마법탄 · <b>K</b> 꾹 눌러 불꽃탄 · <b>L</b> 막기 · <b>↓</b> 숙이기 · 문제는 <b>1 2 3</b> 또는 클릭'
      : sel.mode === 'mouse' ? '카메라 없이 시험: 마우스 좌우 = 몸 이동 · <b>Z/X</b> 손 휙(공격) · <b>V</b> 꾹(모으기→떼면 불꽃탄) · <b>B</b> 막기 · <b>S</b> 숙이기 · 빠르게 좌우 = 피하기 · 문제는 마우스로 구슬 위에 머물기'
      : '몸이 조종기예요 — 옆으로 걸으면 이동, 손을 휙 내밀면 마법탄, 두 손을 머리 위로 모았다 내리면 불꽃탄, 팔 X자 = 막기. 문제는 손을 구슬 위에 잠깐 대고 있어요.';
  }
  s01.querySelector('.go').onclick = () => act('start', { mode: sel.mode, char: sel.char, calib: sel.calib });

  // ── S17 보정
  const s17 = h('section', 'mw-scr dim mw-hide');
  s17.innerHTML = `<div class="mw-calib"><canvas width="640" height="480"></canvas><div class="side"><div class="mw-dots"></div><div class="msg"></div>${ringSvg()}
    <div class="mw-row"><button class="skip">${T('calib.skip')}</button><button class="home">${T('pause.home')}</button></div></div></div>`;
  const cv17 = s17.querySelector('canvas'), msg17 = s17.querySelector('.msg'), dots17 = s17.querySelector('.mw-dots'), ring17 = s17.querySelector('.fg');
  s17.querySelector('.skip').onclick = () => act('calib-skip'); s17.querySelector('.home').onclick = () => act('home');
  let lastStep = null;

  // ── S08 HUD (S08Q 에서도 보임)
  const hud = h('section', 'mw-hud mw-hide');
  hud.innerHTML = `<div class="mw-bars"><div class="mw-bar hp"><i></i><span></span></div><div class="mw-bar mana"><i></i><s></s><span></span></div><div class="mw-chips"><span class="spell"></span><span class="feather">🪶</span></div></div>
    <div class="mw-wave"></div><div class="mw-top-r"><button class="mute">🔊</button><button class="pause">⏸</button></div><div class="mw-streak"></div>
    <canvas class="mw-pip" width="320" height="240"></canvas><div class="mw-help"></div><div class="mw-lost mw-hide"></div><div class="mw-flash"></div>`;
  const $h = s => hud.querySelector(s), hpBar = $h('.hp'), mpBar = $h('.mana'), pip = $h('.mw-pip'), lost = $h('.mw-lost'), flashEl = $h('.mw-flash');
  $h('.pause').onclick = () => act('pause'); $h('.mute').onclick = () => { $h('.mute').textContent = audio.mute() ? '🔇' : '🔊'; };
  const pauseScr = h('section', 'mw-scr dim mw-hide'); pauseScr.innerHTML = `<div class="mw-panel"><div class="mw-big">${T('pause.title')}</div><div class="mw-note why"></div>
    <div class="mw-row"><button class="big resume">${T('pause.resume')}</button></div><div class="mw-row"><button class="recal">${T('pause.calib')}</button><button class="home">${T('pause.home')}</button></div></div>`;
  pauseScr.querySelector('.resume').onclick = () => act('resume'); pauseScr.querySelector('.recal').onclick = () => act('recalib'); pauseScr.querySelector('.home').onclick = () => act('home');

  // ── S08Q 문제
  const q = h('section', 'mw-q mw-hide'); q.innerHTML = `<div class="mw-qpanel"><div class="prompt"></div><div class="sub"></div><div class="mw-gauge"><i></i></div></div>`;
  const qp = q.querySelector('.mw-qpanel'), qPrompt = q.querySelector('.prompt'), qSub = q.querySelector('.sub'), qGauge = q.querySelector('.mw-gauge'), qGaugeI = qGauge.querySelector('i');
  const orbs = []; for (let s = 0; s < 4; s++) { const o = h('div', 'mw-orb mw-hide', `<b></b><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke-dasharray="289" stroke-dashoffset="289"/></svg>`); o.onclick = () => act('select', { slot: s }); q.append(o); orbs.push(o); }
  const cursor = h('div', 'mw-cursor mw-hide');
  let qId = null, lastHot = false, rects = {}, qMana = '';

  // ── 결과
  const res = h('section', 'mw-scr dim mw-hide'); res.innerHTML = `<div class="mw-panel"><div class="mw-big ttl"></div><dl class="mw-result"></dl><div class="mw-row"><button class="big again"></button><button class="home">${T('clear.home')}</button></div></div>`;
  res.querySelector('.again').onclick = () => act('again'); res.querySelector('.home').onclick = () => act('home');
  const toastEl = h('div', 'mw-toast mw-hide'); let toastT = 0;
  root.append(hud, q, s01, s17, pauseScr, res, toastEl, cursor);
  ctx.root.append(root);

  const fmtQ = Q => { const a = Object.assign({}, Q.prompt.args); return T(Q.prompt.key, a); };
  function paintHud(s){
    const P = s.player; if (!P) return; const hpk = P.hp / P.hpMax, mk = P.mana / P.manaMax;
    hpBar.firstElementChild.style.transform = `scaleX(${hpk})`; hpBar.classList.toggle('low', hpk < .3); hpBar.lastElementChild.textContent = `${T('hud.hp')} ${P.hp}`;
    mpBar.firstElementChild.style.transform = `scaleX(${mk})`; mpBar.querySelector('s').style.left = (P.spellCost / P.manaMax * 100) + '%'; mpBar.lastElementChild.textContent = `${T('hud.mana')} ${P.mana}`;
    mpBar.classList.toggle('ready', P.mana >= P.spellCost && P.castReady);
    $h('.spell').textContent = P.charging ? `🔥 ${Math.round(P.charging.ratio * 100)}%` : P.mana >= P.spellCost ? '🔥 불꽃탄 준비' : `🔥 ${P.spellCost} 필요`;
    $h('.feather').classList.toggle('mw-hide', !P.feather);
    const w = s.world; $h('.mw-wave').textContent = w && w.waves ? `🌲 ${Math.min(w.wave + 1, w.waves)} / ${w.waves}` : '';
    $h('.mw-streak').textContent = s.streak >= 2 ? `연속 ${s.streak}!` : '';
    const cam = s.input && s.input.mode === 'camera'; pip.classList.toggle('mw-hide', !cam); pip.classList.toggle('bad', s.input && s.input.body !== 'ok');
    if (cam) drawSkeleton(pip, s.input.preview);
    $h('.mw-help').innerHTML = cam ? '<b>옆으로 걷기</b> 이동 · <b>손 휙</b> 마법탄 · <b>두 손 모아 머리 위→내리기</b> 불꽃탄 · <b>팔 X자</b> 막기 · <b>숙이기</b> · <b>수정</b>을 쳐서 문제 열기'
      : '<b>←→</b> 이동 · <b>Shift+←→</b> 피하기 · <b>Space</b> 마법탄 · <b>K</b> 불꽃탄 · <b>L</b> 막기 · <b>↓</b> 숙이기 · <b>P</b> 멈춤';
    const lostOn = s.input && s.input.body === 'lost' && !s.paused; lost.classList.toggle('mw-hide', !lostOn); if (lostOn) lost.textContent = T('toast.showBody');
    pauseScr.classList.toggle('mw-hide', !s.paused); if (s.paused) pauseScr.querySelector('.why').textContent = s.paused === 'body' ? T('toast.showBody') : '';
  }
  function paintQ(s){
    const Q = s.question; if (!Q) return;
    if (Q.id !== qId) { qId = Q.id; qPrompt.textContent = fmtQ(Q); }
    qp.classList.toggle('right', Q.state === 'right'); qp.classList.toggle('wrong', Q.state === 'wrong');
    qSub.textContent = Q.state === 'right' ? T('q.right', { a: qMana }) + ' ✨' : Q.state === 'wrong' ? (Q.explain ? T(Q.explain) : T('q.wrong')) : Q.readP < 1 ? T('q.read') : '';
    qGauge.classList.toggle('mw-hide', !Q.gaugeOn); qGaugeI.style.transform = `scaleX(${Q.gauge})`;
    const hot = Q.gaugeOn && Q.gauge > .7 && Q.state === 'open'; q.classList.toggle('hot', hot); if (hot && !lastHot) audio.play('gauge'); lastHot = hot;
    const W = innerWidth, H = innerHeight; rects = {};
    orbs.forEach(o => o.classList.add('mw-hide'));
    for (const t of s.targets || []) { if (t.kind !== 'choice') continue; const slot = +t.id.slice(1), o = orbs[slot]; if (!o) continue; const ch = Q.choices.find(c => c.targetId === t.id);
      const d = t.rect.w * W, cx = (t.rect.x + t.rect.w / 2) * W, cy = (t.rect.y + t.rect.h / 2) * H; rects[t.id] = { x: cx / W, y: cy / H };
      o.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px`; o.classList.remove('mw-hide');
      o.querySelector('b').textContent = ch ? ch.num : '?';
      o.querySelector('circle').style.strokeDashoffset = String(289 * (1 - (t.hover || 0)));
      const done = Q.state !== 'open'; o.classList.toggle('locked', t.locked && !done);
      o.classList.toggle('right', Q.reveal === slot); o.classList.toggle('wrong', Q.state === 'wrong' && Q.picked === slot);
      o.classList.toggle('fade', done && Q.reveal !== slot && Q.picked !== slot); }
    const c = s.input && s.input.cursor; cursor.classList.toggle('mw-hide', !(c && c.x != null)); if (c && c.x != null) cursor.style.transform = `translate(${c.x * W}px,${c.y * H}px)`;
  }
  function paintRes(s, win){ const r = s.result || {}; res.querySelector('.ttl').textContent = win ? '🏆 ' + T('clear.title') : '💪 ' + T('defeat.title');
    res.querySelector('.again').textContent = win ? T('clear.again') : T('defeat.again');
    const rows = [['result.kills', r.kills], ['result.q', r.q], ['result.right', r.right], ['result.time', (r.time || 0) + '초']]; if (r.keyboard) rows.push(['result.key', '⌨️']);
    res.querySelector('dl').innerHTML = rows.map(([k, v]) => `<dt>${T(k)}</dt><dd>${v}</dd>`).join(''); }

  const SCR = { S01: [s01], S17: [s17], S08: [hud], S08Q: [hud, q], S13: [res], S14: [res] };
  return {
    bind(hd){ handlers = hd; },
    show(id, model){ for (const e of SCR[id] || []) e.classList.remove('mw-hide'); if (id === 'S01') { paintS01(model && model.title ? model.title : model); audio.bgm(false); }
      if (id === 'S17') lastStep = null; if (id === 'S08') audio.slow(false); if (id === 'S08Q') { qId = null; audio.slow(true); }
      if (id === 'S13' || id === 'S14') { paintRes(model, id === 'S13'); audio.bgm(false); } if (id === 'S08' || id === 'S08Q') audio.bgm(true);
      if (id !== 'S08' && id !== 'S08Q') { pauseScr.classList.add('mw-hide'); cursor.classList.add('mw-hide'); } },
    update(id, s){
      if (id === 'S17' && s) { const c = s.calib; drawSkeleton(cv17, s.input && s.input.preview, { calib: c }); if (c) { msg17.textContent = T(c.msg); ring17.style.strokeDashoffset = String(326.7 * (1 - c.p));
          dots17.innerHTML = Array.from({ length: c.of }, (_, i) => `<b class="${i < c.idx ? 'done' : i === c.idx ? 'on' : ''}"></b>`).join(''); if (lastStep !== null && lastStep !== c.idx) audio.play('calibOk'); lastStep = c.idx; } }
      if ((id === 'S08' || id === 'S08Q') && s) { paintHud(s); if (id === 'S08Q') paintQ(s); }
      if (toastT && performance.now() > toastT) { toastEl.classList.add('mw-hide'); toastT = 0; } },
    hide(id){ for (const e of SCR[id] || []) e.classList.add('mw-hide'); if (id === 'S08Q') { cursor.classList.add('mw-hide'); q.classList.remove('hot'); rects = {}; } },
    toast(key, args){ toastEl.textContent = T(key, args); toastEl.classList.remove('mw-hide'); toastT = performance.now() + 2200; },
    // ── 계약 밖(스킨 안에서만): 떠오르는 숫자·피격 번쩍·검사기용 rect
    floatAt(x, y, text, cls = ''){ const e = h('div', 'mw-float ' + cls, text); e.style.left = x + 'px'; e.style.top = y + 'px'; root.append(e); setTimeout(() => e.remove(), 850); },
    flash(){ flashEl.style.transition = 'none'; flashEl.style.opacity = '1'; requestAnimationFrame(() => { flashEl.style.transition = 'opacity .35s'; flashEl.style.opacity = '0'; }); },
    targetRects: () => rects,
    setMana(m){ qMana = m; },
    dispose(){ root.remove(); },
  };
}
