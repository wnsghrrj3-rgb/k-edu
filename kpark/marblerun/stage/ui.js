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
        <div class="prow">
          <button data-part="cannon" title="3칸 건너 착지대로 발사! 속도가 모자라면 못 건넌다">💥<span>대포</span></button>
          <button data-part="trampoline" title="2칸 건너 착지대로 튕겨 보낸다">🤸<span>트램펄린</span></button>
          <button data-part="switch" title="갈림길! 구슬이 지날 때마다 방향이 딸깍 바뀐다">🔀<span>스위치</span></button>
        </div>
      </div>
      <div id="mr-buildops">
        <div id="mr-height">
          <span class="lbl">시작 높이</span>
          <button id="mr-h-minus">−</button>
          <b id="mr-h-val">3</b>
          <button id="mr-h-plus">＋</button>
        </div>
        <button id="mr-recenter" title="짓고 있는 자리로 화면 되돌리기">🎯</button>
        <button id="mr-frameall" title="트랙 전체 보기">🗺</button>
        <button id="mr-branch" class="hidden" title="다른 갈래로 전환 — 초록 링을 직접 눌러도 돼">🔀 갈래</button>
        <button id="mr-undo">↩ 되돌리기</button>
        <button id="mr-clear">🗑 처음부터</button>
        <button id="mr-gorun" class="primary">▶ 실행하기</button>
      </div>
    </div>

    <!-- 실행 모드 -->
    <div id="mr-run" class="hidden">
      <div id="mr-count" title="구슬 몇 개를 굴릴까?">
        <button data-n="1">①</button><button data-n="2">②</button><button data-n="3">③</button>
      </div>
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
  const recenterBtn = $('#mr-recenter');
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
  recenterBtn.addEventListener('click', () => { recenterBtn.classList.remove('lit'); handlers.onRecenter(); });
  $('#mr-frameall').addEventListener('click', handlers.onFrameAll);
  $('#mr-undo').addEventListener('click', handlers.onUndo);
  const branchBtn = $('#mr-branch');
  branchBtn.addEventListener('click', handlers.onBranch);
  const countBtns = Array.from(root.querySelectorAll('#mr-count button'));
  countBtns.forEach(b => b.addEventListener('click', () => {
    setMarbleCount(parseInt(b.dataset.n, 10));
    handlers.onMarbleCount(parseInt(b.dataset.n, 10));
  }));
  function setMarbleCount(n) {
    countBtns.forEach(b => b.classList.toggle('on', parseInt(b.dataset.n, 10) === n));
    const rel = $('#mr-release');
    rel.textContent = n === 1 ? '🔵 방출' : '🔵'.repeat(Math.min(n, 3)) + ' 방출';
  }
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
  const STATE_LABEL = { ready: '대기 중', rolling: '주행 중', goal: '완주!', rest: '멈춤', air: '비행 중 ✈', falling: '이탈!', fallen: '추락' };

  function update(sim, mode) {
    if (mode === 'run') {
      speedEl.textContent = (sim.speed ? sim.speed() : Math.abs(sim.v)).toFixed(2) + ' m/s';
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
    speedEl.textContent = comp.pieces.length + '개 부품';

    // 실행은 골 벨이 이미 있거나, 자동으로 놓아줄 수 있으면 열린다.
    const goalOk = canPlaceFn(comp, 'goal');
    goRunBtn.disabled = !(comp.ended || goalOk);
    const goalBtn = paletteBtns.find(b => b.dataset.part === 'goal');
    if (goalBtn) goalBtn.classList.remove('nudge');

    const multi = comp.routes && comp.routes.length > 1;
    branchBtn.classList.toggle('hidden', !multi);
    const openCnt = multi ? comp.routes.filter(rt => !rt.ended).length : 0;

    if (comp.ended) showHint(multi ? '갈래 전부 완성! 구슬 여러 개로 굴려봐 🔀' : '트랙 완성! ▶ 실행하기를 눌러봐', 'good');
    else if (comp.next && comp.next.blocked) showHint('막다른 길! ↩ 되돌리기로 물러나자', 'warn');
    else if (comp.exitH < 1) showHint('바닥에 닿았어 — 경사는 더 못 놓아', 'info');
    else if (multi && openCnt > 1) showHint('갈래가 ' + openCnt + '개 열려 있어 — 🔀 갈래 버튼이나 초록 링으로 오가며 짓자', 'info');
    else hideHint();
  }

  /* 잠긴 실행 버튼을 눌렀을 때 이유를 알려준다 (disabled는 클릭이 안 잡히므로 부모에서 받는다) */
  function wireLockedRunFeedback() {
    const host = goRunBtn.parentElement;
    if (!host) return;
    host.addEventListener('pointerdown', (e) => {
      if (!goRunBtn.disabled) return;
      const r = goRunBtn.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      showHint('앞이 막혀서 골 벨을 놓을 자리가 없어 — ↩ 되돌리기로 물러나자', 'warn');
      goRunBtn.classList.remove('shake');
      void goRunBtn.offsetWidth;
      goRunBtn.classList.add('shake');
      const goalBtn = paletteBtns.find(b => b.dataset.part === 'goal');
      if (goalBtn && !goalBtn.disabled) {
        goalBtn.classList.remove('nudge');
        void goalBtn.offsetWidth;
        goalBtn.classList.add('nudge');
      }
    }, true);
  }

  function showHint(msg, kind) {
    hintEl.textContent = msg;
    hintEl.className = kind || '';
    hintEl.classList.remove('hidden');
  }
  function hideHint() { hintEl.classList.add('hidden'); }

  function showResult(stats) {
    if (stats.marbles && stats.marbles.length > 1) {
      const rows = stats.marbles.map(mb =>
        mb.emoji + ' ' + mb.bell + ' 도착 <b>' + mb.time.toFixed(2) + '초</b>').join('<br>');
      resultBody.innerHTML = rows +
        '<br>🚀 최고 속도 <b>' + stats.vMax.toFixed(2) + ' m/s</b>';
    } else {
      resultBody.innerHTML =
        '⏱ 완주 시간 <b>' + stats.time.toFixed(2) + '초</b><br>' +
        '🚀 최고 속도 <b>' + stats.vMax.toFixed(2) + ' m/s</b><br>' +
        '📏 트랙 길이 <b>' + (stats.length * 100).toFixed(0) + ' cm</b>';
    }
    resultEl.classList.remove('hidden');
  }
  function hideResult() { resultEl.classList.add('hidden'); }

  /* 카메라가 사용자 조작으로 잠기면 🎯 버튼에 불이 들어온다 */
  function setCamLocked(locked) {
    recenterBtn.classList.toggle('lit', !!locked);
    recenterBtn.title = locked ? '화면을 직접 옮겼어 — 짓는 자리로 되돌리기' : '짓고 있는 자리로 화면 되돌리기';
  }

  wireLockedRunFeedback();

  setMarbleCount(1);
  return { update, setMode, setBuildState, showResult, hideResult, showHint, hideHint, setCamLocked, setMarbleCount };
}
