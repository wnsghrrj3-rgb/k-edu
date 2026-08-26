/* ============================================================================
   케이파크 보드게임 — 친구랑 놀기 붙이개 (KParkBoard)
   ----------------------------------------------------------------------------
   보드게임 12종은 뼈대가 같다: #modeOpts(ai/hot) · #setup · G.turn · G.human.
   그 뼈대에 방 UI 를 끼워 넣고, 락스텝 배선만 게임이 4~5줄로 연결한다.

   게임이 할 일:
     KParkBoard.attach({
       game: 'four',            // 방 종류 (다른 게임 방과 안 섞이게)
       seats: 2,                // 사람 수
       onStart(d){...}          // d = {seed, seat(0부터), seats}
       onAct(a){...}            // 남이 보낸 수도, 내가 보낸 수도 여기로 온다
     });
     KParkBoard.act('mv', v)    // 내 수 — 보내고 내 화면에도 onAct 로 돌아온다
     KParkBoard.on()            // 지금 친구랑 하는 중인가
     KParkBoard.mine(turn)      // turn(1부터)이 내 차례인가
     KParkBoard.rnd()           // 시드 난수 (주사위 등 — 모두가 같은 값)

   주의: 락스텝은 모든 피어가 전체 상태를 갖는다 → 패를 감추는 게임
        (마피아·달빛암호·타일마술사)에는 이 방식을 쓰면 안 된다.
   ========================================================================== */
(function () {
  if (window.KParkBoard) return;

  var cfg = null, seat = -1, live = false;
  var LSK = { n: 'kpark.me.name', e: 'kpark.me.em' };
  function lsGet(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  var EMS = ['🦊', '🐼', '🐯', '🐸', '🐙', '🦄', '🐢', '🐧', '🦁', '🐰', '🐻', '🐨'];
  var myName = lsGet(LSK.n, ''), myEm = lsGet(LSK.e, '🦊');

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function say(t) { var s = document.getElementById('kbStatus'); if (s) s.textContent = t; }

  function styles() {
    if (document.getElementById('kbCss')) return;
    var st = el('style'); st.id = 'kbCss';
    st.textContent =
      '#kbPane{display:none;flex-direction:column;align-items:center;gap:10px;margin-top:12px}' +
      '#kbPane.on{display:flex}' +
      '#kbMe{display:flex;align-items:center;gap:9px;width:min(340px,92vw);background:rgba(18,24,60,.7);border:1px solid rgba(140,165,255,.22);border-radius:14px;padding:9px 11px}' +
      '#kbPane input.n{flex:1;min-width:0;padding:8px 11px;border-radius:11px;font-size:15px;font-weight:700;color:#eef2ff;background:rgba(140,165,255,.08);border:1px solid rgba(140,165,255,.22);outline:none}' +
      '#kbPane button.em{width:42px;height:42px;flex:none;font-size:23px;border-radius:11px;background:rgba(140,165,255,.1);border:1px solid rgba(140,165,255,.22);cursor:pointer}' +
      '#kbRow{display:flex;gap:8px;width:min(340px,92vw)}' +
      '#kbCode{flex:1;padding:10px;border-radius:12px;font-size:19px;font-weight:900;letter-spacing:6px;text-align:center;text-transform:uppercase;color:#ffd35c;background:rgba(140,165,255,.08);border:1px solid rgba(140,165,255,.22);outline:none}' +
      '#kbPane .b{padding:10px 18px;border-radius:12px;font-weight:800;font-size:15px;background:rgba(140,165,255,.12);border:1px solid rgba(140,165,255,.28);color:#eef2ff;cursor:pointer}' +
      '#kbPane .b.go{background:linear-gradient(135deg,#ffd35c,#ffb02e);color:#1b1230;border-color:transparent}' +
      '#kbLobby{display:none;flex-direction:column;align-items:center;gap:8px}' +
      '#kbLobby.on{display:flex}' +
      '#kbCodeBig{font-size:15px;color:#9fb0e8}#kbCodeBig b{font-size:28px;letter-spacing:8px;color:#ffd35c;margin-left:8px}' +
      '#kbList{display:flex;flex-direction:column;gap:6px}' +
      '#kbList .r{display:flex;align-items:center;gap:8px;background:rgba(18,24,60,.7);border:1px solid rgba(140,165,255,.22);border-radius:12px;padding:7px 12px;font-weight:800;color:#eef2ff}' +
      '#kbStatus{font-size:13px;color:#9fb0e8;text-align:center;max-width:340px}' +
      '#kbEm{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:120;background:rgba(4,6,18,.72)}' +
      '#kbEm .g{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;background:#121838;border:1px solid rgba(140,165,255,.22);border-radius:18px;padding:16px}' +
      '#kbEm button{width:48px;height:48px;font-size:26px;border-radius:12px;background:rgba(140,165,255,.1);border:1px solid rgba(140,165,255,.22);cursor:pointer}';
    document.head.appendChild(st);
  }

  function buildUI() {
    styles();
    var setup = document.getElementById('setup');
    var opts = document.querySelector('#modeOpts');
    if (!setup || !opts) return false;

    // 모드 버튼 한 개 추가 — 기존 ai/hot 은 그대로 둔다
    var tmpl = opts.querySelector('.opt');
    var b = el('button', tmpl ? tmpl.className.replace(/\bsel\b/, '').trim() : 'opt', '👫 친구 크롬북이랑');
    b.dataset.m = 'net';
    opts.appendChild(b);

    var pane = el('div'); pane.id = 'kbPane';
    pane.innerHTML =
      '<div id="kbMe"><button class="em" id="kbEmBtn">' + myEm + '</button>' +
      '<input class="n" id="kbName" maxlength="6" placeholder="내 이름을 정해 봐" value="' + myName.replace(/"/g, '') + '"></div>' +
      '<div id="kbHome"><button class="b go" id="kbMake">🏠 방 만들기</button>' +
      '<div id="kbRow" style="margin-top:9px"><input id="kbCode" maxlength="4" placeholder="코드"><button class="b" id="kbJoin">들어가기</button></div></div>' +
      '<div id="kbLobby"><div id="kbCodeBig">방코드 <b id="kbCodeTxt">----</b></div>' +
      '<div id="kbList"></div><button class="b go" id="kbGo">다 모였어! 시작 🎲</button></div>' +
      '<p id="kbStatus">친구가 알려준 방코드 4글자를 넣으면 같은 판에서 놀 수 있어.</p>';
    // 시작 버튼 앞에 끼워 넣는다
    var anchor = document.getElementById('btnStart');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(pane, anchor);
    else setup.appendChild(pane);

    var em = el('div'); em.id = 'kbEm'; em.innerHTML = '<div class="g" id="kbEmG"></div>';
    document.body.appendChild(em);
    var g = document.getElementById('kbEmG');
    EMS.forEach(function (e) {
      var x = el('button', '', e);
      x.onclick = function () { myEm = e; lsSet(LSK.e, e); document.getElementById('kbEmBtn').textContent = e; em.style.display = 'none'; };
      g.appendChild(x);
    });
    em.onclick = function (ev) { if (ev.target === em) em.style.display = 'none'; };
    document.getElementById('kbEmBtn').onclick = function () { em.style.display = 'flex'; };
    document.getElementById('kbName').oninput = function () { myName = this.value; lsSet(LSK.n, myName); };

    // 모드 전환 감시 — 기존 핸들러가 .sel 을 옮기면 그걸 보고 판넬을 켠다
    opts.addEventListener('click', function () {
      setTimeout(function () {
        var sel = opts.querySelector('.opt.sel');
        var isNet = sel && sel.dataset.m === 'net';
        pane.classList.toggle('on', !!isNet);
        var s = document.getElementById('btnStart');
        if (s) s.style.display = isNet ? 'none' : '';
        if (isNet && !window.KParkNet.supported()) say('⚠️ 학교 인터넷이 막고 있는 것 같아. 선생님께 말해 줘.');
      }, 0);
    });

    document.getElementById('kbMake').onclick = function () { openRoom(null); };
    document.getElementById('kbJoin').onclick = function () {
      var c = (document.getElementById('kbCode').value || '').toUpperCase().trim();
      if (c.length < 4) return say('방코드 4글자를 넣어 줘.');
      openRoom(c);
    };
    document.getElementById('kbGo').onclick = function () {
      if (window.KParkNet.seats().length < cfg.seats) return say(cfg.seats + '명이 모여야 시작할 수 있어.');
      window.KParkNet.start({});
    };
    return true;
  }

  function me() { return { name: (myName || '').trim() || '이름없음', em: myEm }; }

  function callbacks() {
    return {
      game: cfg.game, max: cfg.seats, name: me().name, em: me().em,
      onStatus: function (s) {
        if (s === 'SUBSCRIBED') say('연결됐어! 친구를 기다리는 중…');
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') say('⚠️ 연결이 안 돼. 학교 인터넷이 막고 있을 수 있어.');
      },
      onLobby: function (seats) {
        document.getElementById('kbHome').style.display = 'none';
        document.getElementById('kbLobby').classList.add('on');
        document.getElementById('kbCodeTxt').textContent = window.KParkNet.code();
        document.getElementById('kbGo').style.display = window.KParkNet.isHost() ? '' : 'none';
        var box = document.getElementById('kbList'); box.innerHTML = '';
        seats.forEach(function (p, i) {
          box.appendChild(el('div', 'r', '<span style="font-size:20px">' + p.em + '</span><b>' + p.name + '</b>' +
            (i === window.KParkNet.mySeat() ? '<span style="color:#ffd35c;font-size:11px">나</span>' : '')));
        });
        say(seats.length + '/' + cfg.seats + '명 모였어.');
      },
      onNotice: function (t) { say(t); },
      onStart: function (d) {
        live = true; seat = window.KParkNet.mySeat();
        window.KParkNet.useSeed(d.seed);
        if (cfg.onStart) cfg.onStart({ seed: d.seed, seat: seat, seats: d.seats });
      },
      onAction: function (a) { if (cfg.onAct) cfg.onAct(a); }
    };
  }

  function openRoom(code) {
    if (!window.KParkNet || !window.KParkNet.supported()) return say('⚠️ 연결을 못 했어. 학교 인터넷을 확인해 줘.');
    window.KParkNet.setMe(me().name, me().em);
    if (code) { window.KParkNet.joinRoom(code, callbacks()); say('들어가는 중…'); }
    else { var c = window.KParkNet.createRoom(callbacks()); say('친구에게 코드 ' + c + ' 를 알려 줘.'); }
  }

  window.KParkBoard = {
    attach: function (o) { cfg = o; if (!buildUI()) console.warn('[KParkBoard] #setup/#modeOpts 를 못 찾음'); },
    act: function (t, v) { window.KParkNet.act(t, v); },
    on: function () { return live; },
    seat: function () { return seat; },
    mine: function (turn) { return !live || (turn - 1) === seat; },   // turn 은 1부터
    rnd: function () { return window.KParkNet.rnd ? window.KParkNet.rnd() : Math.random(); },
    say: say
  };
})();
