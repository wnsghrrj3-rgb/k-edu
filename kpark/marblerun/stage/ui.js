/* 케이파크 · 마블런 — stage/ui.js
 * 건설 ↔ 실행 이중 모드 UI.
 * 건설: 부품 팔레트(탭 = 이어붙이기), 되돌리기, 전체 지우기, 시작탑 높이, 예시 불러오기.
 * 실행: 방출, 다시, 카메라, 완주 기록 카드.
 * 기록은 자기 트랙 안에서만 의미 — 랭킹·비교 없음.
 */
export function createUI(root, handlers, tracks) {
  const options = ['<option value="-1">예시 불러오기…</option>']
    .concat(tracks.map((t, i) => '<option value="' + i + '">' + t.name + '</option>')).join('');

  root.innerHTML = `
    <div id="mr-title">
      <div class="park">케이파크</div>
      <div class="ride">마블런</div>
      <select id="mr-track">${options}</select>
      <div id="mr-desc"></div>
    </div>

    <div id="mr-hud">
      <span id="mr-speed">0.00 m/s</span>
      <span id="mr-state">건설 중</span>
    </div>

    <div id="mr-hint" class="hidden"></div>

    <!-- 건설 모드 -->
    <div id="mr-build">
      <div id="mr-palette">
        <div class="prow">
          <button data-part="straight" title="직선 레일">➖<span>직선</span></button>
          <button data-part="curve_l" title="왼쪽으로 도는 커브">⤴<span>커브 L</span></button>
          <button data-part="curve_r" title="오른쪽으로 도는 커브">⤵<span>커브 R</span></button>
          <button data-part="slope" title="한 칸 내려가는 경사">↘<span>경사</span></button>
          <button data-part="goal" title="트랙의 끝, 골 벨">🔔<span>골 벨</span></button>
        </div>
        <div class="prow">
          <button data-part="hill" title="봉우리를 넘어라 — 속도가 부족하면 되돌아온다!">⛰<span>언덕</span></button>
          <button data-part="loop" title="360° 수직 루프 — 빠르게 진입해야 넘는다">➰<span>루프</span></button>
          <button data-part="gyro" title="나선 2회전 급강하 (높이 2칸 필요)">🌀<span>자이로</span></button>
          <button data-part="jump" title="레일이 끊긴 공중 구간!">🛫<span>점프</span></button>
          <button data-part="booster" title="지나가면 슝 — 가속!">🚀<span>부스터</span></button>
          <button data-part="zigzag" title="좌우 물결 — 커브 마찰로 살짝 감속">〰<span>지그재그</span></button>
        </div>
      </div>
      <div id="mr-buildops">
        <div id="mr-height">
          <span class="lbl">시작 높이</span>
          <button id="mr-h-minus">−</button>
          <b id="mr-h-val">3</b>
          <button id="mr-h-plus">＋</button>
        </div>
        <button id="mr-undo">↩ 되돌리기</button>
        <button id="mr-clear">🗑 처음부터</button>
        <button id="mr-gorun" class="primary">▶ 실행하기</button>
      </div>
    </div>

    <!-- 실행 모드 -->
    <div id="mr-run" class="hidden">
      <button id="mr-release" class="primary">🔵 방출</button>
      <button id="mr-reset">다시</button>
      <button id="mr-cam">📷 전경</button>
      <button id="mr-gobuild">🔨 다시 만들기</button>
    </div>

    <div id="mr-result" class="hidden">
      <div class="result-title">🔔 완주!</div>
      <div class="result-body"></div>
      <button id="mr-again" class="primary">한 번 더</button>
    </div>
  `;

  const $ = (sel) => root.querySelector(sel);
  const speedEl = $('#mr-speed'), stateEl = $('#mr-state');
  const camBtn = $('#mr-cam');
  const resultEl = $('#mr-result'), resultBody = resultEl.querySelector('.result-body');
  const hintEl = $('#mr-hint');
  const buildEl = $('#mr-build'), runEl = $('#mr-run');
  const trackSel = $('#mr-track'), descEl = $('#mr-desc');
  const hVal = $('#mr-h-val');
  const goRunBtn = $('#mr-gorun');
  const paletteBtns = Array.from(root.querySelectorAll('#mr-palette button'));

  // ---- 이벤트 ----
  trackSel.addEventListener('change', () => {
    const i = parseInt(trackSel.value, 10);
    if (i >= 0) {
      descEl.textContent = tracks[i].desc;
      hideResult();
      handlers.onSelectPreset(i);
    }
  });
  paletteBtns.forEach(b => b.addEventListener('click', () => handlers.onAppend(b.dataset.part)));
  $('#mr-undo').addEventListener('click', handlers.onUndo);
  $('#mr-clear').addEventListener('click', () => { trackSel.value = '-1'; descEl.textContent = ''; handlers.onClear(); });
  $('#mr-h-minus').addEventListener('click', () => handlers.onStartH(-1));
  $('#mr-h-plus').addEventListener('click', () => handlers.onStartH(1));
  goRunBtn.addEventListener('click', () => handlers.onMode('run'));
  $('#mr-gobuild').addEventListener('click', () => { hideResult(); handlers.onMode('build'); });
  $('#mr-release').addEventListener('click', handlers.onRelease);
  $('#mr-reset').addEventListener('click', () => { hideResult(); handlers.onReset(); });
  $('#mr-again').addEventListener('click', () => { hideResult(); handlers.onRelease(); });
  camBtn.addEventListener('click', () => {
    const m = handlers.onToggleCamera();
    camBtn.textContent = m === 'orbit' ? '📷 전경' : '📷 추적';
  });

  // ---- 표시 갱신 ----
  const STATE_LABEL = { ready: '대기 중', rolling: '주행 중', goal: '완주!', rest: '멈춤', falling: '이탈!', fallen: '추락' };

  function update(sim, mode) {
    if (mode === 'run') {
      speedEl.textContent = Math.abs(sim.v).toFixed(2) + ' m/s';
      stateEl.textContent = STATE_LABEL[sim.status] || sim.status;
    }
  }

  function setMode(mode, comp) {
    buildEl.classList.toggle('hidden', mode !== 'build');
    runEl.classList.toggle('hidden', mode !== 'run');
    if (mode === 'build') { speedEl.textContent = (comp ? comp.pieces.length : 0) + '개 부품'; stateEl.textContent = '건설 중'; }
  }

  /* 팔레트·버튼 활성화 + 상황 안내 */
  function setBuildState(comp, canPlaceFn) {
    for (const b of paletteBtns) b.disabled = !canPlaceFn(comp, b.dataset.part);
    hVal.textContent = String(comp.pieces[0].h);
    goRunBtn.disabled = !comp.ended;
    speedEl.textContent = comp.pieces.length + '개 부품';

    if (comp.ended) showHint('트랙 완성! ▶ 실행하기를 눌러봐', 'good');
    else if (comp.next && comp.next.blocked) showHint('막다른 길! ↩ 되돌리기로 물러나자', 'warn');
    else if (comp.exitH < 1) showHint('바닥에 닿았어 — 경사는 더 못 놓아', 'info');
    else hideHint();
  }

  function showHint(msg, kind) {
    hintEl.textContent = msg;
    hintEl.className = kind || '';
    hintEl.classList.remove('hidden');
  }
  function hideHint() { hintEl.classList.add('hidden'); }

  function showResult(stats) {
    resultBody.innerHTML =
      '⏱ 완주 시간 <b>' + stats.time.toFixed(2) + '초</b><br>' +
      '🚀 최고 속도 <b>' + stats.vMax.toFixed(2) + ' m/s</b><br>' +
      '📏 트랙 길이 <b>' + (stats.length * 100).toFixed(0) + ' cm</b>';
    resultEl.classList.remove('hidden');
  }
  function hideResult() { resultEl.classList.add('hidden'); }

  return { update, setMode, setBuildState, showResult, hideResult, showHint, hideHint };
}
