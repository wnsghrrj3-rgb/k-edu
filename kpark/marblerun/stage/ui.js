/* 케이파크 · 마블런 — stage/ui.js
 * DOM UI: 방출/리셋/카메라 버튼, 실시간 속도, 완주 기록 카드.
 * 기록은 자기 트랙 안에서만 의미 — 랭킹·비교 없음.
 */
export function createUI(root, handlers, tracks) {
  const options = tracks.map((t, i) => '<option value="' + i + '">' + t.name + '</option>').join('');
  root.innerHTML = `
    <div id="mr-title">
      <div class="park">케이파크</div>
      <div class="ride">마블런 <span class="tag">M0</span></div>
      <select id="mr-track">${options}</select>
      <div id="mr-desc"></div>
    </div>
    <div id="mr-hud">
      <span id="mr-speed">0.00 m/s</span>
      <span id="mr-state">대기 중</span>
    </div>
    <div id="mr-controls">
      <button id="mr-release" class="primary">🔵 방출</button>
      <button id="mr-reset">다시</button>
      <button id="mr-cam">📷 전경</button>
    </div>
    <div id="mr-result" class="hidden">
      <div class="result-title">🔔 완주!</div>
      <div class="result-body"></div>
      <button id="mr-again" class="primary">한 번 더</button>
    </div>
  `;

  const $ = (id) => root.querySelector(id);
  const speedEl = $('#mr-speed');
  const stateEl = $('#mr-state');
  const camBtn = $('#mr-cam');
  const resultEl = $('#mr-result');
  const resultBody = resultEl.querySelector('.result-body');

  const trackSel = $('#mr-track');
  const descEl = $('#mr-desc');
  descEl.textContent = tracks[0].desc;
  trackSel.addEventListener('change', () => {
    const i = parseInt(trackSel.value, 10);
    descEl.textContent = tracks[i].desc;
    hideResult();
    handlers.onSelectTrack(i);
  });

  $('#mr-release').addEventListener('click', handlers.onRelease);
  $('#mr-reset').addEventListener('click', () => { hideResult(); handlers.onReset(); });
  $('#mr-again').addEventListener('click', () => { hideResult(); handlers.onRelease(); });
  camBtn.addEventListener('click', () => {
    const m = handlers.onToggleCamera();
    camBtn.textContent = m === 'orbit' ? '📷 전경' : '📷 추적';
  });

  const STATE_LABEL = { ready: '대기 중', rolling: '주행 중', goal: '완주!', rest: '멈춤' };

  function update(sim) {
    speedEl.textContent = Math.abs(sim.v).toFixed(2) + ' m/s';
    stateEl.textContent = STATE_LABEL[sim.status] || sim.status;
  }

  function showResult(stats) {
    resultBody.innerHTML =
      '⏱ 완주 시간 <b>' + stats.time.toFixed(2) + '초</b><br>' +
      '🚀 최고 속도 <b>' + stats.vMax.toFixed(2) + ' m/s</b><br>' +
      '📏 트랙 길이 <b>' + (stats.length * 100).toFixed(0) + ' cm</b>';
    resultEl.classList.remove('hidden');
  }
  function hideResult() { resultEl.classList.add('hidden'); }

  return { update, showResult, hideResult };
}
