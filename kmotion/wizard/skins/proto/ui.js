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
    <div class="mw-panel"><div class="mw-row stages"></div><div class="mw-row chars"></div><div class="mw-row modes"></div><div class="mw-row calibs"></div>
    <button class="big go">▶ 시작</button><div class="mw-note help"></div></div>`;
  const stageRow = s01.querySelector('.stages'), charRow = s01.querySelector('.chars'), modeRow = s01.querySelector('.modes'), calRow = s01.querySelector('.calibs'), helpS = s01.querySelector('.help');
  let sel = { char: pref.char || 'luna', mode: pref.mode || 'camera', calib: false, stage: null };
  const MODES = [['camera', '📷 ' + T('start.camera')], ['keyboard', '⌨️ ' + T('start.keyboard')], ['mouse', '🖱 ' + T('start.mouse')]];
  function paintS01(m){
    // v1.6 스테이지 고르기(10 문서 S04 간이판): 열린 것만 누름, 잠긴 건 🔒 + 「앞 숲길을 깨면 열려요」, 별 ⭐
    const list = []; stageRow.classList.add('mw-hide'); stageRow.innerHTML = '';   // v1.9: 스테이지 고르기는 S04 지도로 옮김
    if (list.length >= 2) { if (!sel.stage || !list.some(x => x.id === sel.stage && !x.locked)) sel.stage = (m && m.stage) || list[0].id;
      for (const st of list) { const b = h('button', 'mw-stage' + (sel.stage === st.id ? ' on' : '') + (st.locked ? ' locked' : ''), `<b>${st.final ? '👑 ' : ''}${T('stage.' + st.id)}</b><s>${st.locked ? '🔒 ' + T('start.locked') : st.stars ? '⭐'.repeat(st.stars) + '☆'.repeat(3 - st.stars) : '☆☆☆'}</s>`); b.disabled = st.locked; b.onclick = () => { sel.stage = st.id; paintS01(m); }; stageRow.append(b); } }
    charRow.innerHTML = ''; for (const c of (m && m.chars) || ['luna', 'tori', 'haru']) { const b = h('button', 'mw-char' + (sel.char === c ? ' on' : ''), `<i>${CHAR_ICON[c] || '✨'}</i>${T('char.' + c)}`); b.onclick = () => { sel.char = c; pref.char = c; savePref(); paintS01(m); }; charRow.append(b); }
    modeRow.innerHTML = ''; for (const [v, l] of MODES) { const b = h('button', sel.mode === v ? 'on' : '', l); b.onclick = () => { sel.mode = v; pref.mode = v; savePref(); paintS01(m); }; modeRow.append(b); }
    calRow.innerHTML = ''; calRow.classList.toggle('mw-hide', !(sel.mode === 'camera' && m && m.hasCal));
    for (const [v, l] of [[false, T('start.quick')], [true, T('start.calib')]]) { const b = h('button', sel.calib === v ? 'on' : '', l); b.onclick = () => { sel.calib = v; paintS01(m); }; calRow.append(b); }
    helpS.innerHTML = sel.mode === 'keyboard' ? '<b>←→</b> 움직이기 · <b>Shift+←→</b> 피하기 · <b>Space</b> 마법탄 · <b>K</b> 꾹 눌러 불꽃탄 · <b>L</b> 막기 · <b>↓</b> 숙이기 · 문제는 <b>1 2 3</b> 또는 클릭'
      : sel.mode === 'mouse' ? '카메라 없이 시험: 마우스 좌우 = 몸 이동 · <b>Z/X</b> 손 휙(공격) · <b>V</b> 꾹(모으기→떼면 불꽃탄) · <b>B</b> 막기 · <b>S</b> 숙이기 · 빠르게 좌우 = 피하기 · 문제는 마우스로 구슬 위에 머물기'
      : '몸이 조종기예요 — 옆으로 걸으면 이동, 손을 휙 내밀면 마법탄, 두 손을 머리 위로 모았다 내리면 불꽃탄, 팔 X자 = 막기. 문제는 손을 구슬 위에 잠깐 대고 있어요.';
  }
  s01.querySelector('.go').onclick = () => act('start', { mode: sel.mode, char: sel.char, calib: sel.calib });

  // ── S04 월드 지도(v1.9, 10 문서 S04 받침대 + S06 지도) — 노드·들어가기 = snapshot.targets(kind 'map') rect 그대로(시스템 소유), 받침대는 보기만
  const map = h('section', 'mw-map mw-hide');
  map.innerHTML = `<div class="mw-map-top"><span class="lv"></span><span class="st"></span><button class="home">← ${T('map.back')}</button></div>
    <div class="mw-map-title"><b>${T('map.title')}</b><s></s></div>
    <svg class="mw-map-path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline/></svg>
    <div class="mw-ped"><em>${T('map.pedestal')}</em><div class="row"></div></div>
    <div class="mw-map-info"><b class="nm"></b><div class="learn"><em>${T('map.learn')}</em><span></span></div><div class="rec"></div></div>
    <div class="mw-map-help"></div>`;
  const mapNodes = {}, mapPed = map.querySelector('.mw-ped .row'), mapInfo = map.querySelector('.mw-map-info'), mapHelp = map.querySelector('.mw-map-help'), mapLine = map.querySelector('polyline');
  map.querySelector('.home').onclick = () => act('home');
  const CRYSTAL_ICON = { number: '🔮', shape: '🔷', measure: '📏', pattern: '🔁', data: '📊', arcana: '✨' };
  let mapPedKey = '';
  function paintMap(s){ const M = s.map; if (!M) return; const W = innerWidth, H = innerHeight, cam = s.input && s.input.mode !== 'keyboard'; rects = rects || {};
    map.querySelector('.lv').textContent = `${T('hud.level')}${M.level} · ✦${M.xp}`; map.querySelector('.st').textContent = `⭐ ${M.stars}`; map.querySelector('.mw-map-title s').textContent = `🌲 ${M.worldName || T('map.world.forest')}`;
    const pts = []; for (const t of M.targets || []) { let o = mapNodes[t.id]; const isEnter = t.id === 'enter', sid = isEnter ? null : t.id.slice(6), st = sid ? (M.stages || []).find(z => z.id === sid) : null;
      if (!o) { o = mapNodes[t.id] = h('div', 'mw-orb ' + (isEnter ? 'mw-enter' : 'mw-node'), `<b></b><s></s><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke-dasharray="289" stroke-dashoffset="289"/></svg>`); o.onclick = () => isEnter ? act('enter') : act('pick', { stage: sid }); map.append(o); }
      const d = t.rect.w * W, cx = (t.rect.x + t.rect.w / 2) * W, cy = (t.rect.y + t.rect.h / 2) * H; rects[t.id] = { x: cx / W, y: cy / H }; if (!isEnter) pts.push(`${cx / W * 100},${cy / H * 100}`);
      o.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px`; o.querySelector('circle').style.strokeDashoffset = String(289 * (1 - (t.hover || 0)));
      if (isEnter) { o.classList.toggle('locked', !!t.locked); o.querySelector('b').textContent = t.locked ? '🔒' : '🚪'; o.querySelector('s').textContent = T('map.enter'); }
      else { o.classList.toggle('on', sid === M.stage); o.classList.toggle('locked', !!(st && st.locked)); o.querySelector('b').textContent = st && st.locked ? '🔒' : st && st.final ? '👑' : String(st ? (M.stages.indexOf(st) + 1) : ''); o.querySelector('s').textContent = st ? (st.locked ? '' : '⭐'.repeat(st.stars) + '☆'.repeat(3 - st.stars)) : ''; o.title = st ? T('stage.' + sid) : ''; } }
    mapLine.setAttribute('points', pts.join(' '));
    const pk = (M.pedestals || []).map(p => p.crystal + (p.got ? 1 : 0) + (p.open ? 1 : 0)).join(); if (pk !== mapPedKey) { mapPedKey = pk; mapPed.innerHTML = (M.pedestals || []).map(p => `<i class="${p.got ? 'got' : p.open ? 'open' : ''}" title="${T('crystal.' + p.crystal)} · ${p.worldName}${p.open ? '' : ' (' + T('map.soon') + ')'}"><b>${p.got ? CRYSTAL_ICON[p.crystal] || '🔮' : '○'}</b><s>${p.icon || ''}</s></i>`).join(''); }
    mapInfo.querySelector('.nm').textContent = (M.locked ? '🔒 ' : '') + T('stage.' + M.stage); mapInfo.querySelector('.learn span').textContent = (M.learn || []).map(k => T('learn.' + k)).join(' · '); mapInfo.querySelector('.rec').textContent = `${T('map.recLevel')} ${T('hud.level')}${M.recLevel}`;
    mapHelp.textContent = cam ? T('map.hand') : T('map.key');
    const c = s.input && s.input.cursor; cursor.classList.toggle('mw-hide', !(cam && c && c.x != null)); if (cam && c && c.x != null) cursor.style.transform = `translate(${c.x * W}px,${c.y * H}px)`; }

  // ── S17 보정
  const s17 = h('section', 'mw-scr dim mw-hide');
  s17.innerHTML = `<div class="mw-calib"><canvas width="640" height="480"></canvas><div class="side"><div class="mw-dots"></div><div class="msg"></div>${ringSvg()}
    <div class="mw-row"><button class="skip">${T('calib.skip')}</button><button class="home">${T('pause.home')}</button></div></div></div>`;
  const cv17 = s17.querySelector('canvas'), msg17 = s17.querySelector('.msg'), dots17 = s17.querySelector('.mw-dots'), ring17 = s17.querySelector('.fg');
  s17.querySelector('.skip').onclick = () => act('calib-skip'); s17.querySelector('.home').onclick = () => act('home');
  let lastStep = null;

  // ── S08 HUD (S08Q 에서도 보임)
  const hud = h('section', 'mw-hud mw-hide');
  hud.innerHTML = `<div class="mw-bars"><div class="mw-bar hp"><i></i><span></span></div><div class="mw-bar mana"><i></i><s></s><span></span></div><div class="mw-bar xp"><i></i><span></span></div><div class="mw-chips"><span class="spell"></span><span class="feather">🪶</span><span class="shieldc mw-hide"></span><span class="empower mw-hide"></span></div></div>
    <div class="mw-wave"></div><div class="mw-rail mw-hide"><b class="nm"></b><div class="rb"><i></i><u>🧙</u></div><span class="ff">🪲 0</span></div><div class="mw-boss mw-hide"><b class="nm"></b><div class="bb"></div><span class="sh"></span></div><div class="mw-pack mw-hide"></div><div class="mw-top-r"><button class="mute">🔊</button><button class="pause">⏸</button></div><div class="mw-streak"></div>
    <canvas class="mw-pip" width="320" height="240"></canvas><div class="mw-help"></div><div class="mw-lost mw-hide"></div><div class="mw-flash"></div>`;
  const $h = s => hud.querySelector(s), hpBar = $h('.hp'), mpBar = $h('.mana'), xpBar = $h('.xp'), pip = $h('.mw-pip'), lost = $h('.mw-lost'), flashEl = $h('.mw-flash');
  $h('.pause').onclick = () => act('pause'); $h('.mute').onclick = () => { $h('.mute').textContent = audio.mute() ? '🔇' : '🔊'; };
  const pauseScr = h('section', 'mw-scr dim mw-hide'); pauseScr.innerHTML = `<div class="mw-panel"><div class="mw-big">${T('pause.title')}</div><div class="mw-note why"></div>
    <div class="mw-note spl-t">${T('pause.spell')}</div><div class="mw-row spells"></div><div class="mw-note hand mw-hide">${T('pause.hand')}</div><div class="mw-row"><button class="big resume">${T('pause.resume')}</button></div><div class="mw-row"><button class="recal">${T('pause.calib')}</button><button class="home">${T('pause.home')}</button></div></div>`;
  // 손 유지 마법 바퀴(v1.3) — 카메라 모드에선 snapshot.targets(kind 'menu') 자리에 구슬을 그리고 DOM 버튼 줄은 숨김
  const wheel = h('div', 'mw-wheel mw-hide'); pauseScr.append(wheel); const wheelOrbs = {};
  pauseScr.querySelector('.resume').onclick = () => act('resume'); pauseScr.querySelector('.recal').onclick = () => act('recalib'); pauseScr.querySelector('.home').onclick = () => act('home');

  // ── S08Q 문제
  const q = h('section', 'mw-q mw-hide'); q.innerHTML = `<div class="mw-qpanel"><div class="prompt"></div><div class="hint mw-hide"></div><div class="beads mw-hide"></div><div class="sub"></div><div class="mw-gauge"><i></i></div></div>`;
  const qp = q.querySelector('.mw-qpanel'), qPrompt = q.querySelector('.prompt'), qHint = q.querySelector('.hint'), qBeads = q.querySelector('.beads'), qSub = q.querySelector('.sub'), qGauge = q.querySelector('.mw-gauge'), qGaugeI = qGauge.querySelector('i');
  // 🦉 힌트 구슬(07 문서 8절) — 대상 rect 는 snapshot.targets 의 'hint'(시스템 소유)
  const owl = h('div', 'mw-orb mw-owl mw-hide', `<b>🦉</b><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke-dasharray="289" stroke-dashoffset="289"/></svg>`); owl.onclick = () => act('hint'); q.append(owl);
  let hintStep = -1;
  const orbs = []; for (let s = 0; s < 4; s++) { const o = h('div', 'mw-orb mw-hide', `<b></b><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke-dasharray="289" stroke-dashoffset="289"/></svg>`); o.onclick = () => act('select', { slot: s }); q.append(o); orbs.push(o); }
  const cursor = h('div', 'mw-cursor mw-hide');
  let qId = null, lastHot = false, rects = {}, qMana = '';
  // ── S08P 퍼즐(v1.5, 07 문서 상황 D) — 돌 구슬 = targets kind 'puzzle' rect 그대로 · 크기 문 = 좌우 문 카드(몸 위치, 눌리는 자리 없음)
  const pz = h('section', 'mw-pz mw-hide'); pz.innerHTML = `<div class="mw-qpanel pzp"><div class="kind"></div><div class="prompt"></div><div class="hint mw-hide"></div><div class="sub"></div><div class="tries"></div></div>
    <div class="mw-gate mw-hide"><div class="door L"><b></b><s>◀</s></div><div class="lane">${T('pz.lane')}</div><div class="door R"><b></b><s>▶</s></div></div>`;
  const pzp = pz.querySelector('.pzp'), pzKind = pz.querySelector('.kind'), pzPrompt = pz.querySelector('.prompt'), pzHint = pz.querySelector('.hint'), pzSub = pz.querySelector('.sub'), pzTries = pz.querySelector('.tries'), gate = pz.querySelector('.mw-gate');
  const pzOrbs = []; for (let s = 0; s < 3; s++) { const o = h('div', 'mw-orb mw-stone mw-hide', `<b></b><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke-dasharray="289" stroke-dashoffset="289"/></svg>`); o.onclick = () => act('select', { slot: s }); pz.append(o); pzOrbs.push(o); }
  let pzCur = null, pzState = null, fireflies = 0;

  // ── 결과
  const res = h('section', 'mw-scr dim mw-hide'); res.innerHTML = `<div class="mw-panel"><div class="mw-big ttl"></div><dl class="mw-result"></dl><div class="mw-row"><button class="big again"></button><button class="tomap">🗺 ${T('clear.map')}</button><button class="home">${T('clear.home')}</button></div></div>`;
  res.querySelector('.again').onclick = () => act('again'); res.querySelector('.tomap').onclick = () => act('map'); res.querySelector('.home').onclick = () => act('home');
  const toastEl = h('div', 'mw-toast mw-hide'); let toastT = 0;
  root.append(hud, q, pz, s01, map, s17, pauseScr, res, toastEl, cursor);
  ctx.root.append(root);

  const fmtQ = Q => { const a = Object.assign({}, Q.prompt.args); return T(Q.prompt.key, a); };
  // 힌트 2단계 그림: 구슬 — 더하기는 두 색 이어서, 빼기는 뒤에서 b개를 흐리게(거꾸로 세기)
  const beadsHtml = p => { const n = p.op === '+' ? p.a + p.b : p.a; let o = ''; for (let i = 0; i < n; i++) { const cls = p.op === '+' ? (i < p.a ? 'a' : 'b') : (i >= p.a - p.b ? 'x' : 'a'); o += `<i class="${cls}"></i>${(i + 1) % 5 === 0 && i < n - 1 ? '<s></s>' : ''}`; }
    return o + (p.op === '+' ? `<em>${p.a} + ${p.b}</em>` : `<em>${p.a} − ${p.b}</em>`); };
  // v2.3 묶음 그림(15 문서 3절 hint2): n줄, 한 줄에 each 개 구슬 — 「36을 4줄로 똑같이 나누면 한 줄은 9」
  const groupsHtml = p => { let o = ''; for (let r = 0; r < p.n; r++) { o += '<u>'; for (let i = 0; i < p.each; i++) o += '<i class="g"></i>'; o += '</u>'; } return o + `<em>${p.n} × ${p.each} = ${p.n * p.each}</em>`; };
  function paintHud(s){
    const P = s.player; if (!P) return; const hpk = P.hp / P.hpMax, mk = P.mana / P.manaMax;
    hpBar.firstElementChild.style.transform = `scaleX(${hpk})`; hpBar.classList.toggle('low', hpk < .3); hpBar.lastElementChild.textContent = `${T('hud.hp')} ${P.hp}`;
    mpBar.firstElementChild.style.transform = `scaleX(${mk})`; mpBar.querySelector('s').style.left = (P.spellCost / P.manaMax * 100) + '%'; mpBar.lastElementChild.textContent = `${T('hud.mana')} ${P.mana}`;
    mpBar.classList.toggle('ready', P.mana >= P.spellCost && P.castReady);
    if (P.level != null) { xpBar.firstElementChild.style.transform = `scaleX(${Math.min(1, P.xp / Math.max(1, P.xpNext))})`; xpBar.lastElementChild.textContent = `${T('hud.level')}${P.level} · ${P.xp}/${P.xpNext}`; }
    const SI = { fireball: '🔥', ice: '❄️', lightning: '⚡', meteor: '☄️', shield: '🛡' }, si = SI[P.spell] || '✨', sn = T('spell.' + P.spell);
    $h('.spell').textContent = P.charging ? `${si} ${Math.round(P.charging.ratio * 100)}%` : P.mana >= P.spellCost ? `${si} ${sn} 준비` : `${si} ${sn} ${P.spellCost} 필요`;
    $h('.shieldc').classList.toggle('mw-hide', !(P.shieldReady || P.arcana)); $h('.shieldc').textContent = P.arcana ? `🛡 ${Math.ceil(P.arcana.ratio * 6)}초` : '🛡 막기 꾹';
    const sp = pauseScr.querySelector('.spells'), list = P.spells || []; pauseScr.querySelector('.spl-t').classList.toggle('mw-hide', list.length < 2); sp.classList.toggle('mw-hide', list.length < 2);
    if (sp.dataset.k !== list.join() + P.main) { sp.dataset.k = list.join() + P.main; sp.innerHTML = ''; for (const id of list) { const b = h('button', id === P.main ? 'on' : '', `${SI[id]} ${T('spell.' + id)}`); b.onclick = () => act('spell', { id }); sp.append(b); } }
    $h('.feather').classList.toggle('mw-hide', !P.feather);
    $h('.empower').classList.toggle('mw-hide', !P.empowered); if (P.empowered) $h('.empower').textContent = `✨ 강화 ${Math.ceil((P.empowerT != null ? P.empowerT : 1) * 20)}초`;
    const w = s.world, Bs = s.boss, R = w && w.rail; $h('.mw-wave').textContent = !Bs && !R && w && w.waves ? `🌲 ${w.arenas > 1 ? T('hud.zone', { n: w.arenaNo || 1 }) + ' · ' : ''}${Math.min(w.wave + 1, w.waves)} / ${w.waves}` : ''; $h('.mw-wave').title = w && w.stageName ? w.stageName : '';
    const rb = $h('.mw-rail'); rb.classList.toggle('mw-hide', !R); if (R) { rb.querySelector('.nm').textContent = w.heart ? `🌳 ${w.stageName} · ${T('hud.heart')}` : `${R.dark ? '🔦' : '🌲'} ${w.stageName ? w.stageName + ' · ' : ''}${T(R.dark ? 'hud.cave' : 'hud.rail')} ${(w.arenaNo || 0) + 1}`; const k = Math.min(1, R.progress || 0); rb.querySelector('.rb i').style.transform = `scaleX(${k})`; rb.querySelector('.rb u').style.left = (k * 100) + '%'; rb.querySelector('.ff').textContent = `🪲 ${fireflies}`; rb.classList.toggle('stop', R.phase !== 'go'); }
    // v2.3 묶음 띠(15 문서 2절): 「🟢×4 = 36」 — 흐트러지면 지금 합도
    const pks = s.packs || [], pkEl = $h('.mw-pack'); pkEl.classList.toggle('mw-hide', !pks.length); if (pks.length) pkEl.innerHTML = pks.map(pk => `<span>🟢×${pk.alive} = ${pk.sum}${pk.sum !== pk.alive * pk.hpEach ? ` <s>(${pk.alive}마리 힘 ${pk.hpEach})</s>` : ''}</span>`).join('');
    const bb = $h('.mw-boss'); bb.classList.toggle('mw-hide', !Bs); if (Bs) { bb.querySelector('.nm').textContent = T(Bs.nameKey) + ` · ${Bs.phase + 1}/${Bs.phases}`;
      const bar = bb.querySelector('.bb'); if (bar.children.length !== Bs.phases) bar.innerHTML = Bs.phaseHpMax.map(() => '<i><u></u></i>').join('');
      [...bar.children].forEach((c, i) => { c.firstChild.style.transform = `scaleX(${Bs.phaseHp[i] / Bs.phaseHpMax[i]})`; c.classList.toggle('on', i === Bs.phase); });
      bb.querySelector('.sh').textContent = Bs.weak > 0 ? `⚡ ${T('toast.weak')}` : Bs.shieldMax ? `${T('boss.shield')} ` + '🔷'.repeat(Bs.shield) + '▫️'.repeat(Bs.shieldMax - Bs.shield) : '';
      bb.classList.toggle('weak', Bs.weak > 0); }
    $h('.mw-streak').textContent = s.streak >= 2 ? `연속 ${s.streak}!` : '';
    const cam = s.input && s.input.mode === 'camera'; pip.classList.toggle('mw-hide', !cam); pip.classList.toggle('bad', s.input && s.input.body !== 'ok');
    if (cam) drawSkeleton(pip, s.input.preview);
    $h('.mw-help').innerHTML = R ? (cam ? '<b>옆으로 걷기</b> 바위 피하기 · <b>숙이기</b> 가지 밑으로 · <b>반딧불</b>·<b>🍄 버섯</b>은 몸으로' : '<b>←→</b> 바위 피하기 · <b>↓</b> 가지 밑으로 숙이기 · <b>반딧불</b>·<b>🍄</b>을 지나며') : cam ? '<b>옆으로 걷기</b> 이동 · <b>손 휙</b> 마법탄 · <b>두 손 모아 머리 위→내리기</b> 불꽃탄 · <b>팔 X자</b> 막기 · <b>숙이기</b> · <b>수정</b>을 쳐서 문제 열기'
      : '<b>←→</b> 이동 · <b>Shift+←→</b> 피하기 · <b>Space</b> 마법탄 · <b>K</b> 불꽃탄 · <b>L</b> 막기 · <b>↓</b> 숙이기 · <b>H</b> 힌트 · <b>P</b> 멈춤';
    const lostOn = s.input && s.input.body === 'lost' && !s.paused; lost.classList.toggle('mw-hide', !lostOn); if (lostOn) lost.textContent = T('toast.showBody');
    pauseScr.classList.toggle('mw-hide', !s.paused); if (s.paused) pauseScr.querySelector('.why').textContent = s.paused === 'body' ? T('toast.showBody') : '';
    const menu = s.paused === 'user' && cam ? (s.targets || []).filter(t => t.kind === 'menu') : []; const handUI = menu.length > 0;
    wheel.classList.toggle('mw-hide', !handUI); pauseScr.querySelector('.hand').classList.toggle('mw-hide', !handUI); sp.classList.toggle('mw-hide', handUI || list.length < 2); pauseScr.querySelector('.resume').classList.toggle('mw-hide', handUI);
    const c = s.input && s.input.cursor; if (s.paused === 'user') { cursor.classList.toggle('mw-hide', !(cam && c && c.x != null)); if (cam && c && c.x != null) cursor.style.transform = `translate(${c.x * innerWidth}px,${c.y * innerHeight}px)`; }
    if (handUI) { if (!rects) rects = {}; const W = innerWidth, H = innerHeight; for (const o of Object.values(wheelOrbs)) o.classList.add('mw-hide');
      for (const t of menu) { let o = wheelOrbs[t.id]; if (!o) { o = wheelOrbs[t.id] = h('div', 'mw-orb mw-menu', `<b></b><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke-dasharray="289" stroke-dashoffset="289"/></svg>`); o.onclick = () => t.id === 'resume' ? act('resume') : act('spell', { id: t.id.slice(6) }); wheel.append(o); }
        const d = t.rect.w * W, cx = (t.rect.x + t.rect.w / 2) * W, cy = (t.rect.y + t.rect.h / 2) * H; rects[t.id] = { x: cx / W, y: cy / H };
        o.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px`; o.classList.remove('mw-hide'); o.classList.toggle('on', t.id === 'spell:' + P.main);
        o.querySelector('b').textContent = t.id === 'resume' ? '▶' : SI[t.id.slice(6)] || '✨'; o.querySelector('circle').style.strokeDashoffset = String(289 * (1 - (t.hover || 0))); } }
  }
  function paintQ(s){
    const Q = s.question; if (!Q) return;
    if (Q.id !== qId) { qId = Q.id; hintStep = -1; qPrompt.textContent = (Q.kind === 'seal' ? '🔒 ' : Q.kind === 'power' ? '★ ' : Q.kind === 'shield' ? '🛡 ' : Q.kind === 'golem' ? '💎 ' : Q.kind === 'share' ? '🟢 ' : '') + fmtQ(Q); qp.classList.toggle('shareq', Q.kind === 'share'); qp.classList.toggle('seal', Q.kind === 'seal'); qp.classList.toggle('shieldq', Q.kind === 'shield'); qp.classList.toggle('golemq', Q.kind === 'golem'); qp.dataset.sub = Q.kind === 'golem' ? T('q.golem') : Q.kind === 'share' ? T('q.share') : ''; qp.classList.toggle('power', Q.kind === 'power'); qp.classList.toggle('word', Q.type === 'word1'); }
    if (Q.hintStep !== hintStep) { hintStep = Q.hintStep; qHint.classList.toggle('mw-hide', !Q.hint); if (Q.hint) qHint.textContent = '🦉 ' + T(Q.hint.key, Q.hint.args);
      qBeads.classList.toggle('mw-hide', !Q.hintPic); if (Q.hintPic && Q.hintPic.kind === 'beads') qBeads.innerHTML = beadsHtml(Q.hintPic); else if (Q.hintPic && Q.hintPic.kind === 'groups') qBeads.innerHTML = groupsHtml(Q.hintPic); }
    qp.classList.toggle('right', Q.state === 'right'); qp.classList.toggle('wrong', Q.state === 'wrong');
    qSub.textContent = Q.state === 'right' ? T('q.right', { a: qMana }) + ' ✨' : Q.state === 'wrong' ? (Q.explain ? T(Q.explain) : T('q.wrong')) : Q.readP < 1 ? T('q.read') : '';
    qGauge.classList.toggle('mw-hide', !Q.gaugeOn); qGaugeI.style.transform = `scaleX(${Q.gauge})`;
    const hot = Q.gaugeOn && Q.gauge > .7 && Q.state === 'open'; q.classList.toggle('hot', hot); if (hot && !lastHot) audio.play('gauge'); lastHot = hot;
    const W = innerWidth, H = innerHeight; rects = {};
    orbs.forEach(o => o.classList.add('mw-hide'));
    owl.classList.add('mw-hide');
    for (const t of s.targets || []) {
      if (t.kind === 'hint') { const d = t.rect.w * W, cx = (t.rect.x + t.rect.w / 2) * W, cy = (t.rect.y + t.rect.h / 2) * H; rects[t.id] = { x: cx / W, y: cy / H };
        owl.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px`; owl.classList.remove('mw-hide'); owl.classList.toggle('locked', t.locked);
        owl.querySelector('circle').style.strokeDashoffset = String(289 * (1 - (t.hover || 0))); continue; }
      if (t.kind !== 'choice') continue; const slot = +t.id.slice(1), o = orbs[slot]; if (!o) continue; const ch = Q.choices.find(c => c.targetId === t.id);
      const d = t.rect.w * W, cx = (t.rect.x + t.rect.w / 2) * W, cy = (t.rect.y + t.rect.h / 2) * H; rects[t.id] = { x: cx / W, y: cy / H };
      o.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px`; o.classList.remove('mw-hide');
      o.querySelector('b').textContent = ch ? ch.num : '?';
      o.querySelector('circle').style.strokeDashoffset = String(289 * (1 - (t.hover || 0)));
      const done = Q.state !== 'open'; o.classList.toggle('locked', t.locked && !done);
      o.classList.toggle('right', Q.reveal === slot); o.classList.toggle('wrong', Q.state === 'wrong' && Q.picked === slot);
      o.classList.toggle('fade', done && Q.reveal !== slot && Q.picked !== slot); }
    const c = s.input && s.input.cursor; cursor.classList.toggle('mw-hide', !(c && c.x != null)); if (c && c.x != null) cursor.style.transform = `translate(${c.x * W}px,${c.y * H}px)`;
  }
  function paintPz(s){
    const Z = s.puzzle; if (!Z) return; const W = innerWidth, H = innerHeight; rects = {};
    if (Z.id !== pzCur) { pzCur = Z.id; pzState = null; pzKind.textContent = Z.type === 'number-bridge' ? '🌉 숫자 다리' : Z.type === 'size-gate' ? '🚪 크기 문' : Z.type === 'mushroom-add' ? '🍄 버섯 문' : Z.type === 'crystal-count' ? '💎 수정 묶음 세기' : '🪨 규칙 징검다리'; pzPrompt.textContent = T(Z.prompt.key, Z.prompt.args);
      if (Z.type === 'mushroom-add' && Z.mush) pzPrompt.innerHTML = `<span class="mush">🍄<i>${'●'.repeat(Z.mush.a)}</i> + 🍄<i>${'●'.repeat(Z.mush.b)}</i></span><br>${T(Z.prompt.key, Z.prompt.args)}`; pzp.classList.toggle('gate', Z.type === 'size-gate');
      if (Z.type === 'crystal-count' && Z.bundle) { const B = Z.bundle; pzPrompt.innerHTML = `<span class="bund">${'<b>💯</b>'.repeat(B.hund || 0)}${'<b>🔟</b>'.repeat(B.tens)}${B.ones ? ' + ' + '<i>💎</i>'.repeat(B.ones) : ''}</span><br>${T(Z.prompt.key, Z.prompt.args)}`; }
      gate.classList.toggle('mw-hide', Z.type !== 'size-gate'); if (Z.gate) { gate.querySelector('.L b').textContent = Z.gate.left; gate.querySelector('.R b').textContent = Z.gate.right; } }
    pzHint.classList.toggle('mw-hide', !Z.hint); if (Z.hint) pzHint.textContent = '🦉 ' + T(Z.hint.key, Z.hint.args);
    pzTries.textContent = Z.wrong > 0 ? '💧'.repeat(Z.wrong) + '○'.repeat(Math.max(0, Z.maxWrong - Z.wrong)) : '';
    pzp.classList.toggle('right', Z.state === 'right'); pzp.classList.toggle('wrong', Z.state === 'wrong'); pzp.classList.toggle('reveal', Z.state === 'reveal');
    pzSub.textContent = Z.state === 'right' ? T('pz.right') + ' ✨' : Z.state === 'wrong' ? T(Z.type === 'size-gate' ? 'pz.gateWrong' : Z.type === 'mushroom-add' ? 'pz.mushWrong' : Z.type === 'crystal-count' ? 'pz.countWrong' : 'pz.wrong') : Z.state === 'reveal' ? T('pz.reveal') : Z.need > 1 ? `돌 ${Z.picks.length} / ${Z.need}` : '';
    pzOrbs.forEach(o => o.classList.add('mw-hide'));
    for (const t of s.targets || []) { if (t.kind !== 'puzzle') continue; const st = Z.stones && Z.stones.find(x => x.targetId === t.id); const o = pzOrbs[st ? st.slot : +t.id.slice(1)]; if (!o) continue;
      const d = t.rect.w * W, cx = (t.rect.x + t.rect.w / 2) * W, cy = (t.rect.y + t.rect.h / 2) * H; rects[t.id] = { x: cx / W, y: cy / H };
      o.style.cssText = `left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px`; o.classList.remove('mw-hide'); o.querySelector('b').textContent = st ? st.num : '?';
      o.querySelector('circle').style.strokeDashoffset = String(289 * (1 - (t.hover || 0)));
      o.classList.toggle('locked', t.locked && Z.state === 'open'); o.classList.toggle('lit', !!(st && st.lit)); o.classList.toggle('right', !!(st && st.answer)); o.classList.toggle('wrong', !!(st && st.wrong)); o.classList.toggle('fade', Z.state !== 'open' && !(st && (st.answer || st.lit))); }
    if (Z.gate) { for (const side of ['L', 'R']) { const d = gate.querySelector('.' + side), G = Z.gate; d.classList.toggle('on', G.lane === side); d.classList.toggle('right', G.answer === side); d.classList.toggle('wrong', Z.state === 'wrong' && G.picked === side); } }
    const c = s.input && s.input.cursor; cursor.classList.toggle('mw-hide', !(c && c.x != null && Z.type !== 'size-gate')); if (c && c.x != null) cursor.style.transform = `translate(${c.x * W}px,${c.y * H}px)`;
  }
  function paintRes(s, win){ const r = s.result || {}; res.querySelector('.ttl').textContent = win ? '🏆 ' + T('clear.title') : '💪 ' + T('defeat.title');
    res.querySelector('.again').textContent = win ? T('clear.again') : T('defeat.again');
    const rows = [['result.kills', r.kills], ['result.q', r.q], ['result.right', r.right], ['result.time', (r.time || 0) + '초']]; if (r.xp != null) rows.push(['result.xp', `+${r.xp}` + (r.levelUps && r.levelUps.length ? ` · ${T('toast.levelUp')} Lv${r.levelUps.at(-1)}` : '')], ['result.level', `Lv${r.level}`]); if (r.fireflies != null) rows.push(['result.fireflies', `🪲 ${r.fireflies}`], ['result.gold', `💰 ${r.gold || 0}`], ['result.puzzles', `${r.puzzleRight || 0} / ${r.puzzles || 0}`], ['result.stars', (r.stars || []).map(b => b ? '⭐' : '☆').join('')]); if (r.shields) rows.push(['result.shields', `🛡 ${r.shields}`]); if (r.bounces) rows.push(['result.bounces', `🍄 ${r.bounces}`]); if (r.cracks) rows.push(['result.cracks', `💎 ${r.cracks}`]); if (r.reward) rows.push(['result.reward', ({ ice: '❄️ 얼음 폭풍', shield: '🛡 비전 방패', lightning: '⚡ 번개 사슬' })[r.reward] || r.reward]); if (r.crystal) rows.push(['result.crystal', ({ number: '🔮 수의 결정' })[r.crystal] || r.crystal]); if (r.final && r.stars && r.stars[0]) rows.push(['result.world1', '🎉']); if (r.keyboard) rows.push(['result.key', '⌨️']);
    res.querySelector('dl').innerHTML = rows.map(([k, v]) => `<dt>${T(k)}</dt><dd>${v}</dd>`).join(''); }

  const SCR = { S01: [s01], S04: [map], S17: [s17], S08: [hud], S08Q: [hud, q], S08P: [hud, pz], S13: [res], S14: [res] };
  return {
    bind(hd){ handlers = hd; },
    show(id, model){ for (const e of SCR[id] || []) e.classList.remove('mw-hide'); if (id === 'S01') { paintS01(model && model.title ? model.title : model); audio.bgm(false); } if (id === 'S04') { mapPedKey = ''; audio.bgm(false); audio.slow(false); }
      if (id === 'S17') lastStep = null; if (id === 'S08') audio.slow(false); if (id === 'S08Q') { qId = null; audio.slow(true); } if (id === 'S08P') { pzCur = null; audio.slow(true); } if (id === 'S01') fireflies = 0;
      if (id === 'S13' || id === 'S14') { paintRes(model, id === 'S13'); audio.bgm(false); } if (id === 'S08' || id === 'S08Q' || id === 'S08P') audio.bgm(true);
      if (id !== 'S08' && id !== 'S08Q' && id !== 'S08P') { pauseScr.classList.add('mw-hide'); cursor.classList.add('mw-hide'); } },
    update(id, s){
      if (id === 'S17' && s) { const c = s.calib; drawSkeleton(cv17, s.input && s.input.preview, { calib: c }); if (c) { msg17.textContent = T(c.msg); ring17.style.strokeDashoffset = String(326.7 * (1 - c.p));
          dots17.innerHTML = Array.from({ length: c.of }, (_, i) => `<b class="${i < c.idx ? 'done' : i === c.idx ? 'on' : ''}"></b>`).join(''); if (lastStep !== null && lastStep !== c.idx) audio.play('calibOk'); lastStep = c.idx; } }
      if (id === 'S04' && s) paintMap(s);
      if ((id === 'S08' || id === 'S08Q' || id === 'S08P') && s) { paintHud(s); if (id === 'S08Q') paintQ(s); if (id === 'S08P') paintPz(s); }
      if (toastT && performance.now() > toastT) { toastEl.classList.add('mw-hide'); toastT = 0; } },
    hide(id){ for (const e of SCR[id] || []) e.classList.add('mw-hide'); if (id === 'S04') { cursor.classList.add('mw-hide'); rects = {}; } if (id === 'S08Q') { cursor.classList.add('mw-hide'); q.classList.remove('hot'); rects = {}; } if (id === 'S08P') { cursor.classList.add('mw-hide'); rects = {}; } },
    toast(key, args){ toastEl.textContent = T(key, args); toastEl.classList.remove('mw-hide'); toastT = performance.now() + 2200; },
    // ── 계약 밖(스킨 안에서만): 떠오르는 숫자·피격 번쩍·검사기용 rect
    floatAt(x, y, text, cls = ''){ const e = h('div', 'mw-float ' + cls, text); e.style.left = x + 'px'; e.style.top = y + 'px'; root.append(e); setTimeout(() => e.remove(), 850); },
    flash(){ flashEl.style.transition = 'none'; flashEl.style.opacity = '1'; requestAnimationFrame(() => { flashEl.style.transition = 'opacity .35s'; flashEl.style.opacity = '0'; }); },
    targetRects: () => rects,
    setMana(m){ qMana = m; },
    setFireflies(n){ fireflies = n || 0; },
    dispose(){ root.remove(); },
  };
}
