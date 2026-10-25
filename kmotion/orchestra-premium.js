/* Presentation bindings only. Original controls remain the source of truth. */
(() => {
  const sync = () => {
    document.querySelectorAll('[data-mode], [data-players]').forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('on'))));
    document.querySelectorAll('[data-entry]').forEach(b => {
      const active = !!document.querySelector(`[data-mode="${b.dataset.entry}"].on`);
      b.classList.toggle('selected', active);
      b.setAttribute('aria-pressed', String(active));
    });
  };
  document.addEventListener('click', e => {
    const entry = e.target.closest('[data-entry]');
    if (entry) document.querySelector(`[data-mode="${entry.dataset.entry}"]`).click();
    if (entry || e.target.closest('[data-mode], [data-players]')) sync();
  });
  const labels = {kit1:'플레이어 1 악기',kit2:'플레이어 2 악기',npads:'패드 개수',scale:'음계',root:'기준음',backing:'반주',bpm:'반주 빠르기 BPM',sens:'동작 민감도',song:'곡 선택',tempo:'곡 빠르기',teacherSong:'선생님 곡 계이름',echoLen:'메아리 음 개수',echoSpd:'메아리 빠르기',bars:'루프 마디',loopList:'저장한 루프',latReset:'지연 보정 초기화',delSong:'선생님 곡 삭제',loopDel:'저장한 루프 삭제'};
  for (const [id, label] of Object.entries(labels)) document.getElementById(id).setAttribute('aria-label', label);
  // Use the same monochrome typographic icon family in native instrument menus.
  const icons = {drum:'◉',perc:'⋮',piano:'▥',marimba:'▥',bell:'♧',synth:'≋',bass:'♫',theremin:'∿'};
  for (const id of ['kit1','kit2']) for (const option of document.getElementById(id).options) {
    option.textContent = icons[option.value] + ' ' + option.textContent.split(' ').slice(1).join(' ');
  }
  sync();
})();
