// 케이모션 과학실 — 실험 노트·까닭 한 줄·사고 알림 (화면에 뜨는 종이)
// 첫 판은 아무것도 저장하지 않는다(서버에도 기기에도). 노트는 그 자리에서만 산다 — 저장 자리는 save()/load() 로 비워 둔다(설계 8-2).
// 화면 글자는 전부 exp.json 에서 온다(ui = exp.texts.ui).
export function createNote(hudEl, ui = {}){
  const L = k => ui[k] || '';
  const cause = document.createElement('div'); cause.className = 'cause'; cause.style.display = 'none'; hudEl.appendChild(cause);
  const alarm = document.createElement('div'); alarm.className = 'alarm'; alarm.style.display = 'none'; hudEl.appendChild(alarm);
  const lamp = document.createElement('div'); lamp.className = 'lamp'; hudEl.appendChild(lamp);
  const frostFx = document.createElement('div'); frostFx.className = 'screen-frost'; hudEl.appendChild(frostFx);
  const book = document.createElement('div'); book.className = 'book'; book.style.display = 'none'; hudEl.appendChild(book);
  const btn = document.createElement('button'); btn.className = 'book-btn'; btn.textContent = '📒 ' + L('notebook'); btn.style.display = 'none'; hudEl.appendChild(btn);
  const pages = [], accidents = [], finds = new Map();
  let causeLeft = 0, alarmLeft = 0, frostLeft = 0, lampLeft = 0, onCauseDone = null, autoLeft = 0, onClose = null, fresh = -1;
  const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function pageHtml(p, i){
    const pr = p.predicted;
    return `<section class="${i === fresh ? 'fresh' : ''}"><h3><span class="stamp${i === fresh ? ' new' : ''}">${esc(p.stamp)}</span>${esc(p.title)} <small>${esc(p.note)}</small></h3>` +
      (pr ? `<p><b>${esc(L('myPrediction'))}</b> ${esc(pr.q)} → ${esc(pr.text)}</p><p><b>${esc(L('actual'))}</b> ${esc(pr.actual)}</p>` : '') +
      (p.happened ? `<p><b>${esc(L('happened'))}</b> ${esc(p.happened)}</p>` : '') +
      (p.tries && p.tries.length ? `<p class="tries"><b>${esc(L('tries'))}</b> ${p.tries.map(t => esc(t.text)).join(' · ')}</p>` : '') +
      (p.graph && p.graph.points && p.graph.points.length > 1 ? graphHtml(p.graph) : '') +
      (p.cause ? `<p><b>${esc(L('cause'))}</b> ${esc(p.cause)}</p>` : '') +
      (p.whyNot ? `<p class="why"><b>${esc(p.whyTitle)}</b> ${esc(p.whyNot)}</p>` : '') +
      (p.whyLines ? `<div class="whyall"><b>${esc(p.whyLinesTitle)}</b>${p.whyLines.map(l => `<p>• ${esc(l)}</p>`).join('')}</div>` : '') + `</section>`;
  }
  // 작은 그림(진공 실험 ③ 「끓는 동안 물 온도」): points = [[시간, 온도, 압력, 끓음 0/1], …] → 온도-시간 꺾은선, 끓는 동안은 빨간 선
  function graphHtml(g){ const P = g.points, W = 260, H = 96, t0 = P[0][0], t1 = P[P.length - 1][0] || t0 + 1; let lo = 1e9, hi = -1e9; for (const q of P) { lo = Math.min(lo, q[1]); hi = Math.max(hi, q[1]); } lo = Math.floor(lo - 1); hi = Math.ceil(hi + .5);
    const X = t => 30 + (t - t0) / Math.max(1e-6, t1 - t0) * (W - 38), Y = T => 8 + (hi - T) / Math.max(1e-6, hi - lo) * (H - 24);
    let d = '', b = ''; P.forEach((q, i) => { const pt = `${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)}`; d += (i ? ' L' : 'M') + pt; if (q[3] && i && P[i - 1][3]) b += ` M${X(P[i - 1][0]).toFixed(1)},${Y(P[i - 1][1]).toFixed(1)} L${pt}`; });
    return `<div class="graph"><b>${esc(g.title)}</b><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"><path d="M30,6 V${H - 16} H${W - 6}" fill="none" stroke="#8a7f6c" stroke-width="1"/><text x="2" y="${Y(hi) + 4}" font-size="10" fill="#6b6152">${hi}℃</text><text x="2" y="${Y(lo) + 4}" font-size="10" fill="#6b6152">${lo}℃</text><path d="${d}" fill="none" stroke="#3a6ea5" stroke-width="2"/>${b ? `<path d="${b}" fill="none" stroke="#c0392b" stroke-width="3"/>` : ''}<text x="${W - 6}" y="${H - 3}" font-size="10" text-anchor="end" fill="#6b6152">${esc(L('time') || '')}</text></svg></div>`; }
  function render(){
    const order = pages.map((p, i) => i).reverse();
    book.innerHTML = `<div class="paper"><button class="x">${esc(L('close'))}</button><h2>${esc(L('notebook'))}</h2>` +
      order.map(i => pageHtml(pages[i], i)).join('') +
      (finds.size ? `<section><h3>${esc(L('found'))}</h3><div class="finds">${[...finds.values()].map(f => `<span class="${f.found ? 'on' : ''}">${f.found ? esc(f.name) : '？'}</span>`).join('')}</div></section>` : '') +
      (accidents.length ? `<section class="acc"><h3>${esc(L('accidents'))}</h3>${accidents.map(a => `<p>• ${esc(a.text)}${a.real ? `<small>${esc(a.real)}</small>` : ''}</p>`).join('')}</section>` : '') + `</div>`;
    book.querySelector('.x').onclick = () => api.close();
  }
  function flashBtn(){ btn.style.display = ''; btn.classList.remove('new'); void btn.offsetWidth; btn.classList.add('new'); }
  btn.onclick = () => { if (book.style.display === 'none') api.open(); else api.close(); };
  const api = {
    /** 까닭 한 줄 — 실험이 끝난 뒤에만. 두 문장 이내. sec 뒤 저절로 접히고 done 을 부른다. */
    cause(text, { sec = 7, done = null, label = L('cause') } = {}){ cause.innerHTML = `<small>${esc(label)}</small>${esc(text)}`; cause.style.display = ''; cause.classList.remove('in'); void cause.offsetWidth; cause.classList.add('in'); causeLeft = sec; onCauseDone = done; },
    get causeOn(){ return causeLeft > 0; },
    /** 노트 한 쪽: session 의 note 효과 entry 그대로 */
    page(entry){ pages.push({ ...entry }); fresh = pages.length - 1; flashBtn(); },
    /** 마지막 의뢰 뒤 「왜 학교에서는 못 할까?」 세 줄 */
    whyAll(title, lines){ const p = pages[pages.length - 1]; if (p) { p.whyLinesTitle = title; p.whyLines = lines.slice(); } },
    /** 사고: 다치는 모습은 보여 주지 않는다 — 화면 서리·경보등·기록 한 줄. kind: 'frost' | 'alarm' */
    accident({ text, real, rule, kind = 'alarm', first = true }){ if (first || !accidents.some(a => a.text === text)) accidents.push({ text, real }); flashBtn();
      alarm.innerHTML = `<b>${esc(text)}</b>${real ? `<small>${esc(real)}</small>` : ''}${rule ? `<em>${esc(rule)}</em>` : ''}`; alarm.style.display = ''; alarm.classList.remove('in'); void alarm.offsetWidth; alarm.classList.add('in'); alarmLeft = 5.5;
      lamp.classList.add('on'); lampLeft = 3;
      if (kind === 'frost') { frostFx.classList.add('on'); frostLeft = 3.2; } },
    get alarmOn(){ return alarmLeft > 0; },
    /** 도감: total 을 알면 빈칸(？)이 보인다 */
    slots(list){ for (const f of list) if (!finds.has(f.id)) finds.set(f.id, { name: f.name, found: false }); },
    find(id, name){ const f = finds.get(id) || { name, found: false }; const first = !f.found; f.found = true; f.name = name || f.name; finds.set(id, f); if (first) flashBtn(); return first; },
    /** 노트 펴기: autoClose 초 뒤 저절로 닫히고 onClose 를 부른다(카메라 손으로는 단추를 못 누르니까) */
    open({ autoClose = 0, then = null } = {}){ render(); book.style.display = ''; autoLeft = autoClose; if (then) onClose = then; },
    close(){ if (book.style.display === 'none') return; book.style.display = 'none'; fresh = -1; autoLeft = 0; const f = onClose; onClose = null; if (f) f(); },
    get isOpen(){ return book.style.display !== 'none'; },
    get pages(){ return pages; }, get accidents(){ return accidents; },
    update(dt){
      if (causeLeft > 0) { causeLeft -= dt; if (causeLeft <= 0) { cause.style.display = 'none'; const d = onCauseDone; onCauseDone = null; if (d) d(); } }
      if (alarmLeft > 0) { alarmLeft -= dt; if (alarmLeft <= 0) alarm.style.display = 'none'; }
      if (lampLeft > 0) { lampLeft -= dt; if (lampLeft <= 0) lamp.classList.remove('on'); }
      if (frostLeft > 0) { frostLeft -= dt; if (frostLeft <= 0) frostFx.classList.remove('on'); }
      if (autoLeft > 0) { autoLeft -= dt; if (autoLeft <= 0) api.close(); }
    },
    save(){ /* 저장은 실험 둘째를 열 때 따로 설계 */ }, load(){ return null; },
  };
  return api;
}
