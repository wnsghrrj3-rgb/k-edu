/* ============================================================
   화면: 자가 진단 (#/selfcheck) — R120
   ------------------------------------------------------------
   준호가 링크 하나를 열면 브라우저가 스스로 R116~R119 를 밟는다.
   내비에 없음(검수 전용 규약 — R31 homex·R32 nav 와 같은 자리).
   MK_PRODUCT 깃발이 있는 /maker 에서는 guard() 가 home 으로 돌린다 —
   진단 화면은 제품에 새지 않는다.

   ⚠ jsdom 안전 계약 (R11~R15 가 전 화면을 render+mount 한다):
     · render() 는 순수 — 탐침을 부르지 않는다.
     · mount() 는 MK_SELFCHECK.supported() 가 참일 때만 탐침을 예약한다.
       jsdom 엔 indexedDB 가 없어 게이트에서 멈춘다(예외 0).
     · 모든 탐침은 엔진 안에서 try/catch 로 감싸여 결과로 환원된다.
   ============================================================ */
window.MK_SCREENS = window.MK_SCREENS || {};

window.MK_SCREENS.selfcheck = (() => {
  const E = () => window.MK_SELFCHECK;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 화면 상태 — PG.state 에 얹어 재렌더를 건너도 결과가 산다 */
  const st = () => {
    if (!PG.state.selfcheck) PG.state.selfcheck = { phase: 'idle', results: [], skipped: '', ran: 0 };
    return PG.state.selfcheck;
  };

  const ICON = { pass: '✓', fail: '✕', skip: '—' };

  /* R121 이 밟은 함정(하드코딩된 라운드 목록)의 재발 방지 — 표제도 CHECKS 에서 도출한다.
     R122 착수 때 신규 4건이 들어오는데 여기가 손글씨였다면 또 「R116~R119」로 남았다. */
  const span = () => {
    const E0 = E();
    if (!E0 || !E0.CHECKS.length) return '';
    const n = E0.CHECKS.map((c) => parseInt(String(c.round).replace(/\D/g, ''), 10)).filter(isFinite);
    if (!n.length) return '';
    const lo = Math.min(...n), hi = Math.max(...n);
    return lo === hi ? `R${lo}` : `R${lo}~R${hi}`;
  };

  /* ---- 견본: 기울인 사진 + 초점. 눈 확인용이라 실제 재생 경로(sceneHTML)를 탄다 ---- */
  const FOC = { x: 0.3, y: 0.3 };
  const SAMPLE_SRC = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="640" viewBox="0 0 400 640">
      <rect width="400" height="640" fill="#2E3A4B"/>
      <rect y="440" width="400" height="200" fill="#3C4A5E"/>
      <circle cx="120" cy="192" r="62" fill="#F2C9A0"/>
      <circle cx="100" cy="182" r="7" fill="#1F2733"/><circle cx="142" cy="182" r="7" fill="#1F2733"/>
      <path d="M100 214 Q121 232 142 214" stroke="#1F2733" stroke-width="6" fill="none" stroke-linecap="round"/>
      <text x="200" y="600" fill="#8894A6" font-family="sans-serif" font-size="26" text-anchor="middle">견본 · 초점=얼굴</text>
    </svg>`);

  const sampleScene = (withFocal) => ({
    duration: 4, width: 400, height: 640, background: '#141A22',
    elements: [{
      kind: 'image', src: SAMPLE_SRC, x: 12, y: 8, w: 76, h: 84,
      rot: 18, fit: 'cover',
      focal: withFocal ? { x: FOC.x, y: FOC.y } : null,
      anim: { preset: 'fade', idle: 'kb-zoom-in', idleDur: 4 },
    }],
  });

  const sampleBox = (label, withFocal, note) => {
    const P = window.MK_PLAY;
    const body = (P && P.sceneHTML) ? P.sceneHTML(sampleScene(withFocal)) : '<div class="sc-nosample">재생 엔진이 없어요</div>';
    return `<div class="sc-sample">
      <div class="sc-sample-hd"><b>${esc(label)}</b><small>${esc(note)}</small></div>
      <div class="sc-stage" style="container-type:size">${body}${withFocal ? `<i class="sc-dot" style="left:${(12 + 76 * FOC.x).toFixed(1)}%;top:${(8 + 84 * FOC.y).toFixed(1)}%"></i>` : ''}</div>
    </div>`;
  };

  /* ---- 기계 검사 목록 ---- */
  const checkRow = (c, r) => {
    const state = r ? r.state : 'idle';
    return `<li class="sc-row sc-${state}">
      <span class="sc-ico">${ICON[state] || '·'}</span>
      <div class="sc-body">
        <div class="sc-t"><b>${esc(c.title)}</b><em>${esc(c.round)}</em></div>
        <div class="sc-p">${esc(c.proves)}</div>
        ${r && r.msg ? `<div class="sc-m">${esc(r.msg)}</div>` : ''}
        ${r && r.detail ? `<div class="sc-d">${esc(r.detail)}</div>` : ''}
        ${!r ? `<div class="sc-why">jsdom 이 못 하는 까닭 — ${esc(c.blind)}</div>` : ''}
      </div>
    </li>`;
  };

  return {
    title: '자가 진단',
    get variants() { return [span() || '자가 진단']; },

    render() {
      const E0 = E();
      if (!E0) return `<div class="sc"><div class="sc-head"><h2>자가 진단</h2><p>진단 엔진(MK_SELFCHECK)이 없어요 — 배포가 R120 이전이에요.</p></div></div>`;
      const s = st();
      const byId = {};
      (s.results || []).forEach((r) => { byId[r.id] = r; });
      const vd = E0.verdict(s.results || []);

      const badge = s.phase === 'running' ? `<span class="sc-badge run">검사 중…</span>`
        : s.phase === 'unsupported' ? `<span class="sc-badge skip">이 환경에선 검사 안 함</span>`
          : s.results && s.results.length ? `<span class="sc-badge ${vd.fail ? 'bad' : vd.skip ? 'warn' : 'good'}">${esc(vd.label)}</span>`
            : `<span class="sc-badge">검사 전</span>`;

      /* R121 — 라운드 목록을 손으로 적지 않는다. R121 착수 때 신규 2건이 CHECKS 에
         들어왔는데 여기가 하드코딩이라 화면에 안 그려졌다(같은 함정 재발 방지). */
      const rounds = [...new Set(E0.CHECKS.map((c) => c.round))];
      const groups = rounds.map((rd) => {
        const list = E0.CHECKS.filter((c) => c.round === rd);
        return `<div class="sc-group"><h3>${rd}</h3><ul class="sc-list">${list.map((c) => checkRow(c, byId[c.id])).join('')}</ul></div>`;
      }).join('');

      return `<div class="sc">
        <div class="sc-head">
          <h2>자가 진단 ${badge}</h2>
          <p>${esc(span())} 가운데 <b>jsdom 이 원리적으로 못 닿는 것만</b> 이 기기의 진짜 브라우저에서 밟아요.
             이미 111개 스위트가 덮는 순수 계층은 여기서 다시 재지 않아요 — 그건 더 검사한 게 아니라 착시니까요.</p>
          <p class="sc-note">★ <b>내보내기(R38)</b>는 여기서 처음 밟혀요 — 84라운드 동안 「계획」까지만 검사됐고
             실제로 MP4 바이트가 나오는지는 아무도 확인한 적이 없어요. 이 검사는 <b>진짜로 인코딩을 한 번 돌려요</b>(몇 초 걸려요).</p>
          <div class="sc-cta">
            <button class="sc-btn" data-sc-run ${s.phase === 'running' ? 'disabled' : ''}>${s.results && s.results.length ? '다시 검사' : '검사 시작'}</button>
            ${s.skipped ? `<span class="sc-skipmsg">${esc(s.skipped)}</span>` : ''}
          </div>
        </div>

        <div class="sc-sec"><h3 class="sc-sech">기계 검사</h3>${groups}</div>

        <div class="sc-sec">
          <h3 class="sc-sech">눈 확인 <small>기계가 흉내내면 거짓이 되는 것</small></h3>
          <div class="sc-eyes">
            ${sampleBox('초점 있음 (R119)', true, '기울어진 사진이 커질 때 붉은 점 쪽으로 파고들어야 해요')}
            ${sampleBox('초점 없음 (대조군)', false, '가운데서 커지면 정상 — 종전 그대로')}
          </div>
          <ul class="sc-eyelist">${E0.EYES.map((e) => `<li><b>${esc(e.title)}</b><em>${esc(e.round)}</em><span>${esc(e.how)}</span></li>`).join('')}</ul>
        </div>
      </div>`;
    },

    mount(root) {
      const E0 = E();
      if (!E0) return;
      const s = st();
      const btn = root.querySelector('[data-sc-run]');

      const start = () => {
        const sup = E0.supported(window);
        if (!sup.ok) { s.phase = 'unsupported'; s.skipped = sup.why; PG.render(); return; }
        s.phase = 'running'; s.skipped = ''; PG.render();
        /* 탐침은 비동기 — 실패해도 화면은 반드시 결과로 환원된다 */
        E0.run(window).then((out) => {
          s.results = out.results || [];
          s.skipped = out.skipped || '';
          s.phase = out.skipped ? 'unsupported' : 'done';
          s.ran++;
          if (PG.state.screen === 'selfcheck') PG.render();
        }).catch((e) => {
          s.results = [{ id: 'idb-open', state: 'fail', msg: '검사가 예외로 죽었어요', detail: e && e.message }];
          s.phase = 'done';
          if (PG.state.screen === 'selfcheck') PG.render();
        });
      };

      if (btn) btn.onclick = start;

      /* 첫 진입 자동 실행 — 준호는 링크만 열면 된다.
         supported() 가 게이트라 jsdom 에서는 여기까지 와도 아무 일도 안 난다. */
      if (s.phase === 'idle' && !s.ran && E0.supported(window).ok) {
        setTimeout(() => { if (st().phase === 'idle') start(); }, 0);
      }
    },
  };
})();
