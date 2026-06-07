/* ============================================================================
   K-edu 케이플(Kple) — 멀티 게임 엔진 · 동기화 코어
   ----------------------------------------------------------------------------
   역할:
     - 방코드 기반 실시간 동기화의 단일 진입점.
     - Supabase Realtime "broadcast" 채널만 사용. 테이블·RLS 불필요.
       (방코드 = 채널명. 방은 메모리상 ephemeral — DB에 아무것도 안 쌓임.)
     - 게임은 이름으로 register() 해서 얹는다. 엔진은 게임 내용을 모른다.
       게임 늘어도 코어 불변(케이랩 register/mount 패턴과 동형).

   두 역할:
     Kple.host(gameName, opts)            → 방 만들고 호스트(전자칠판) 시작
     Kple.join(roomCode, nickname, opts)  → 방코드로 참가(학생 폰)

   메시지(둘 다 broadcast event 'kp'):
     참가자 → 호스트 : { kind:'join', name }
                       { kind:'answer', ... 게임 자유 ... }
                       { kind:'bye', name }
     호스트 → 참가자 : { kind:'roster', names:[...] }
                       { kind:'state', ... 게임 자유 ... }
     게임별 payload 모양은 게임 모듈이 정한다. 코어는 운반만 한다.

   주의(검증된 리스크):
     - broadcast 는 구독 전에 보낸 메시지는 못 받는다. 그래서 참가자가 붙으면
       먼저 'join'을 쏘고, 호스트가 받은 즉시 현재 state를 되쏘는 핸드셰이크로
       "늦게 들어온 사람"을 맞춘다(아래 host.onJoin → game.resync).
     - self:false 라 자기가 보낸 broadcast 는 자기에게 안 돌아온다.
   ============================================================================ */
(function () {
  if (window.Kple) return;

  // ---- 게임 레지스트리 (케이랩 패턴) -------------------------------------
  var registry = {};
  function register(name, def) {
    // def = { host: fn(ctx), join: fn(ctx) }  — 각자 화면을 그리는 게임 모듈
    if (!def) return;
    registry[name] = def;
  }
  function hasGame(name) { return !!registry[name]; }
  function listGames() { return Object.keys(registry); }

  // ---- 방코드 생성 (헷갈리는 글자 제외) ----------------------------------
  var CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0,O,1,I 제외
  function makeRoomCode(len) {
    len = len || 4;
    var s = '';
    for (var i = 0; i < len; i++) {
      s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return s;
  }

  function channelName(code) { return 'kple:' + String(code).toUpperCase(); }

  // ---- Supabase 클라이언트 확보 ------------------------------------------
  function getDb() {
    if (typeof getKeduDb === 'function') return getKeduDb();        // kedu_config.js
    if (window.supabase && window.KEDU_SUPABASE_URL) {
      return window.supabase.createClient(window.KEDU_SUPABASE_URL, window.KEDU_SUPABASE_ANON_KEY);
    }
    throw new Error('[Kple] Supabase 클라이언트를 찾지 못했어요. kedu_config.js 로드 확인.');
  }

  // ---- 공통 채널 래퍼 -----------------------------------------------------
  // onMsg(payload) : 'kp' 이벤트 수신
  // onStatus(s)    : SUBSCRIBED / CHANNEL_ERROR / TIMED_OUT / CLOSED
  function openChannel(code, onMsg, onStatus) {
    var db = getDb();
    var ch = db.channel(channelName(code), {
      config: { broadcast: { self: false, ack: true } }
    });
    ch.on('broadcast', { event: 'kp' }, function (e) {
      if (e && e.payload) { try { onMsg(e.payload); } catch (err) { console.error('[Kple] onMsg', err); } }
    });
    function send(payload) {
      return ch.send({ type: 'broadcast', event: 'kp', payload: payload });
    }
    function close() {
      try { ch.unsubscribe(); } catch (e) {}
      try { db.removeChannel(ch); } catch (e) {}
    }
    var conn = { send: send, close: close, raw: ch };
    // subscribe 콜백에 conn 을 함께 넘긴다(콜백이 conn 할당 전에 불릴 가능성 차단)
    ch.subscribe(function (status) {
      if (onStatus) onStatus(status, conn);
    });
    return conn;
  }

  // ---- 호스트 ------------------------------------------------------------
  // gameName : 등록된 게임 이름
  // opts.el  : 화면 컨테이너
  // opts.config : 게임 설정(문제 세트 등)
  function host(gameName, opts) {
    opts = opts || {};
    var def = registry[gameName];
    if (!def || !def.host) throw new Error('[Kple] 게임 없음(host): ' + gameName);

    var code = opts.roomCode || makeRoomCode(4);
    var roster = [];   // 참가자 이름 목록
    var listeners = { join: [], answer: [], bye: [], status: [] };
    var conn = null;   // 아래에서 할당(핸들러 등록 후 구독)

    function emit(kind, data) {
      (listeners[kind] || []).forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } });
    }

    function onMsg(p) {
      if (p.kind === 'join') {
        if (roster.indexOf(p.name) === -1) roster.push(p.name);
        broadcastRoster();
        emit('join', p);              // 게임이 받아서 필요 시 resync state 되쏨
      } else if (p.kind === 'bye') {
        var i = roster.indexOf(p.name);
        if (i !== -1) roster.splice(i, 1);
        broadcastRoster();
        emit('bye', p);
      } else if (p.kind === 'answer') {
        emit('answer', p);
      }
    }

    function broadcastRoster() { conn.send({ kind: 'roster', names: roster.slice() }); }

    // 게임 모듈에 넘기는 호스트 컨텍스트
    var ctx = {
      role: 'host',
      roomCode: code,
      el: opts.el,
      config: opts.config || {},
      sendState: function (data) { var m = Object.assign({ kind: 'state' }, data); return conn.send(m); },
      getRoster: function () { return roster.slice(); },
      on: function (kind, fn) { if (listeners[kind]) listeners[kind].push(fn); },
      close: function () { if (conn) conn.close(); }
    };

    def.host(ctx);   // 핸들러 등록 먼저
    conn = openChannel(code, onMsg, function (status) { emit('status', status); });  // 그 다음 구독
    return ctx;
  }

  // ---- 참가자 ------------------------------------------------------------
  function join(roomCode, nickname, opts) {
    opts = opts || {};
    roomCode = String(roomCode || '').toUpperCase().trim();
    var def = registry[opts.game] || firstGameWithJoin();
    if (!def || !def.join) throw new Error('[Kple] 게임 없음(join)');

    var listeners = { roster: [], state: [], status: [] };
    var conn = null;   // 핸들러 등록 후 구독
    function emit(kind, data) {
      (listeners[kind] || []).forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } });
    }

    function onMsg(p) {
      if (p.kind === 'roster') emit('roster', p);
      else if (p.kind === 'state') emit('state', p);
    }

    var ctx = {
      role: 'join',
      roomCode: roomCode,
      name: nickname,
      el: opts.el,
      answer: function (data) { var m = Object.assign({ kind: 'answer', name: nickname }, data); return conn.send(m); },
      on: function (kind, fn) { if (listeners[kind]) listeners[kind].push(fn); },
      leave: function () { if (conn) { conn.send({ kind: 'bye', name: nickname }); conn.close(); } },
      close: function () { if (conn) conn.close(); }
    };

    def.join(ctx);   // 핸들러 등록 먼저
    conn = openChannel(roomCode, onMsg, function (status, c) {   // 그 다음 구독
      emit('status', status);
      if (status === 'SUBSCRIBED') {
        // 구독 직후 입장 신호 → 호스트가 현재 state 를 되쏴 줌(늦은 입장 동기화)
        c.send({ kind: 'join', name: nickname });
      }
    });
    return ctx;
  }

  function firstGameWithJoin() {
    var keys = Object.keys(registry);
    for (var i = 0; i < keys.length; i++) if (registry[keys[i]].join) return registry[keys[i]];
    return null;
  }

  window.Kple = {
    register: register, has: hasGame, list: listGames,
    host: host, join: join,
    makeRoomCode: makeRoomCode
  };
})();
