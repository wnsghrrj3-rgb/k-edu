/* ============================================================
   K-edu 임시 잠금 게이트 (kedu_gate.js)
   ------------------------------------------------------------
   - 아이디 / 비밀번호를 입력해야 사이트를 볼 수 있게 가려두는 임시 장치입니다.
   - 운영 복귀 시: 아래 KEDU_TEMP_LOCK 값을 false 로만 바꿔서 커밋하면 해제됩니다.
     (각 페이지에 삽입한 <script> 태그는 그대로 둬도 무해합니다.)

   ※ 주의: 이것은 "외부에 잠깐 안 보이게" 하는 임시 가림막입니다.
     브라우저 소스를 보면 아이디/비번이 드러나므로 강한 보안용이 아닙니다.
   ============================================================ */
(function () {
  // ── 켜고 끄는 스위치 (이 한 줄만 바꾸면 됨) ─────────────
  var KEDU_TEMP_LOCK = true;     // true = 잠금,  false = 해제
  var GATE_ID = '11';            // 아이디
  var GATE_PW = '11';            // 비밀번호
  // ────────────────────────────────────────────────────────

  if (!KEDU_TEMP_LOCK) return;

  // 항상 공개되어야 하는 경로는 게이트에서 제외 (약관 / 개인정보 / 로그인)
  var WHITELIST = ['/terms', '/privacy', '/auth'];
  var path = location.pathname.toLowerCase();
  for (var i = 0; i < WHITELIST.length; i++) {
    if (path.indexOf(WHITELIST[i]) === 0) return;
  }

  // 이미 이번 세션에서 통과했으면 다시 묻지 않음
  try {
    if (sessionStorage.getItem('kedu_gate_ok') === '1') return;
  } catch (e) {}

  function buildGate() {
    if (document.getElementById('kedu-gate-overlay')) return;

    var css =
      '#kedu-gate-overlay{position:fixed;inset:0;z-index:2147483647;' +
      'background:linear-gradient(160deg,#FFF7ED 0%,#FFE9DF 55%,#FFE0D2 100%);' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;}' +
      '#kedu-gate-card{width:min(360px,86vw);background:#fff;border-radius:24px;' +
      'padding:40px 30px;box-shadow:0 20px 60px rgba(214,120,90,.18);text-align:center;}' +
      '#kedu-gate-card h1{margin:0 0 8px;font-size:22px;color:#E07856;font-weight:800;letter-spacing:-.5px;}' +
      '#kedu-gate-card p{margin:0 0 24px;font-size:14px;color:#8a7d76;line-height:1.6;}' +
      '#kedu-gate-card input{width:100%;box-sizing:border-box;padding:14px 16px;margin:6px 0;' +
      'border:2px solid #F2E0D7;border-radius:14px;font-size:16px;outline:none;transition:border-color .15s;}' +
      '#kedu-gate-card input:focus{border-color:#E07856;}' +
      '#kedu-gate-btn{width:100%;margin-top:14px;padding:14px;border:none;border-radius:14px;cursor:pointer;' +
      'background:#E07856;color:#fff;font-size:16px;font-weight:700;transition:transform .08s,background .15s;}' +
      '#kedu-gate-btn:hover{background:#d56a47;}#kedu-gate-btn:active{transform:scale(.98);}' +
      '#kedu-gate-msg{min-height:18px;margin-top:12px;font-size:13px;color:#e0506b;font-weight:600;}' +
      '@keyframes kedu-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}' +
      '.kedu-shake{animation:kedu-shake .35s;}';

    var style = document.createElement('style');
    style.id = 'kedu-gate-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'kedu-gate-overlay';
    overlay.innerHTML =
      '<div id="kedu-gate-card">' +
      '<h1>케이에듀</h1>' +
      '<p>잠시 점검 중이에요.<br>아이디와 비밀번호를 입력해 주세요.</p>' +
      '<input id="kedu-gate-id" type="text" placeholder="아이디" autocomplete="off" autocapitalize="off" />' +
      '<input id="kedu-gate-pw" type="password" placeholder="비밀번호" autocomplete="off" />' +
      '<button id="kedu-gate-btn" type="button">들어가기</button>' +
      '<div id="kedu-gate-msg"></div>' +
      '</div>';
    (document.body || document.documentElement).appendChild(overlay);

    var idEl = overlay.querySelector('#kedu-gate-id');
    var pwEl = overlay.querySelector('#kedu-gate-pw');
    var btn = overlay.querySelector('#kedu-gate-btn');
    var msg = overlay.querySelector('#kedu-gate-msg');
    var card = overlay.querySelector('#kedu-gate-card');

    function tryEnter() {
      if (idEl.value === GATE_ID && pwEl.value === GATE_PW) {
        try { sessionStorage.setItem('kedu_gate_ok', '1'); } catch (e) {}
        overlay.remove();
        if (style && style.remove) style.remove();
      } else {
        msg.textContent = '아이디 또는 비밀번호가 맞지 않아요.';
        card.classList.remove('kedu-shake');
        void card.offsetWidth;          // 애니메이션 재시작 트릭
        card.classList.add('kedu-shake');
        pwEl.value = '';
        pwEl.focus();
      }
    }

    btn.addEventListener('click', tryEnter);
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); tryEnter(); }
    });
    setTimeout(function () { idEl.focus(); }, 50);
  }

  if (document.body) {
    buildGate();
  } else {
    document.addEventListener('DOMContentLoaded', buildGate);
  }
})();
