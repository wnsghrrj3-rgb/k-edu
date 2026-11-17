// 케이모션 과학실 — 실험 노트·까닭 한 줄·사고 알림 (화면에 뜨는 종이)
// 첫 판은 아무것도 저장하지 않는다(서버에도 기기에도). 노트는 그 자리에서만 산다 — 저장 자리는 save()/load() 로 비워 둔다(설계 8-2).
export function createNote(hudEl){
  const cause = document.createElement('div'); cause.className = 'cause'; cause.style.display = 'none'; hudEl.appendChild(cause);
  const alarm = document.createElement('div'); alarm.className = 'alarm'; alarm.style.display = 'none'; hudEl.appendChild(alarm);
  const frostFx = document.createElement('div'); frostFx.className = 'screen-frost'; hudEl.appendChild(frostFx);
  const book = document.createElement('div'); book.className = 'book'; book.style.display = 'none'; hudEl.appendChild(book);
  const btn = document.createElement('button'); btn.className = 'book-btn'; btn.textContent = '📒 실험 노트'; btn.style.display = 'none'; hudEl.appendChild(btn);
  const pages = [], accidents = [], finds = new Map();
  let causeLeft = 0, alarmLeft = 0, frostLeft = 0, onCauseDone = null;
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function render(){
    book.innerHTML = `<div class="paper"><button class="x">닫기</button><h2>실험 노트</h2>` +
      (pages.length ? pages.map(p => `<section><h3><span class="stamp">${esc(p.stamp || '해냄')}</span>${esc(p.title)}</h3>` +
        (p.prediction ? `<p><b>내 예상</b> ${esc(p.prediction)}</p>` : '') + (p.actual ? `<p><b>실제로는</b> ${esc(p.actual)}</p>` : '') +
        (p.cause ? `<p><b>까닭</b> ${esc(p.cause)}</p>` : '') + (p.why ? `<p class="why"><b>왜 학교에서는 못 할까?</b> ${esc(p.why)}</p>` : '') + `</section>`).join('') : '<p class="empty">아직 적힌 것이 없어요.</p>') +
      (finds.size ? `<section><h3>찾아낸 것</h3><div class="finds">${[...finds.values()].map(f => `<span class="${f.found ? 'on' : ''}">${f.found ? esc(f.name) : '？'}</span>`).join('')}</div></section>` : '') +
      (accidents.length ? `<section class="acc"><h3>사고 기록</h3>${accidents.map(a => `<p>• ${esc(a.text)}${a.real ? `<small>진짜였다면: ${esc(a.real)}</small>` : ''}</p>`).join('')}</section>` : '') + `</div>`;
    book.querySelector('.x').onclick = () => { book.style.display = 'none'; };
  }
  btn.onclick = () => { render(); book.style.display = book.style.display === 'none' ? '' : 'none'; };
  return {
    /** 까닭 한 줄 — 실험이 끝난 뒤에만. 두 문장 이내. sec 뒤 저절로 접히고 done 을 부른다. */
    cause(text, { sec = 7, done = null, label = '까닭' } = {}){ cause.innerHTML = `<small>${esc(label)}</small>${esc(text)}`; cause.style.display = ''; cause.classList.remove('in'); void cause.offsetWidth; cause.classList.add('in'); causeLeft = sec; onCauseDone = done; },
    /** 노트 한 쪽: { title, stamp, prediction, actual, cause, why } */
    page(p){ pages.push(p); btn.style.display = ''; btn.classList.remove('new'); void btn.offsetWidth; btn.classList.add('new'); },
    /** 사고: 다치는 모습은 보여 주지 않는다 — 화면 서리·경보·기록 한 줄. kind: 'frost' | 'alarm' | 'flash' */
    accident({ text, real, kind = 'alarm' }){ accidents.push({ text, real }); btn.style.display = '';
      alarm.innerHTML = `<b>${esc(text)}</b>${real ? `<small>진짜였다면: ${esc(real)}</small>` : ''}`; alarm.style.display = ''; alarmLeft = 5;
      if (kind === 'frost') { frostFx.classList.add('on'); frostLeft = 3.2; } },
    /** 도감: 처음 본 결과. total 을 알면 빈칸(？)이 보인다 */
    slots(list){ for (const f of list) if (!finds.has(f.id)) finds.set(f.id, { name: f.name, found: false }); },
    find(id, name){ const f = finds.get(id) || { name, found: false }; const first = !f.found; f.found = true; f.name = name || f.name; finds.set(id, f); if (first) { btn.style.display = ''; btn.classList.remove('new'); void btn.offsetWidth; btn.classList.add('new'); } return first; },
    get pages(){ return pages; }, get accidents(){ return accidents; },
    update(dt){
      if (causeLeft > 0) { causeLeft -= dt; if (causeLeft <= 0) { cause.style.display = 'none'; const d = onCauseDone; onCauseDone = null; d && d(); } }
      if (alarmLeft > 0) { alarmLeft -= dt; if (alarmLeft <= 0) alarm.style.display = 'none'; }
      if (frostLeft > 0) { frostLeft -= dt; if (frostLeft <= 0) frostFx.classList.remove('on'); }
    },
    save(){ /* 저장은 실험 둘째를 열 때 따로 설계 */ }, load(){ return null; },
  };
}
