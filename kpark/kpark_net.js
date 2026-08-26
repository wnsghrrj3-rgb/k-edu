/* ============================================================================
   케이파크 — 친구랑 놀기 (KParkNet)
   ----------------------------------------------------------------------------
   기준 기기: 크롬북 (1366×768, 마우스·트랙패드, 주소 입력 가능)
     → 참가자도 화면을 다 그린다. "폰=선택지 버튼만" 모델을 쓰지 않는다.

   방식: 대칭 피어 + 결정적 락스텝(lockstep)
     - 모두가 똑같은 게임 코드를 돌린다. 오가는 건 "입력"뿐, 화면·연출은 각자 계산.
     - 같은 시드(seed) → 같은 난수 → 같은 판. 상태를 통째로 안 보내도 어긋나지 않는다.
     - 방장(host)은 로비 정리·이탈 처리·정합성 검사만 맡는다. 게임 진행 권한은 없다.

   왜 이 구조인가 (크롬북 사정):
     - Chrome 메모리 세이버가 백그라운드 탭을 버린다 → 한 명이 죽어도 나머지 판은
       그대로 굴러간다. 상태를 호스트가 독점하지 않기 때문.
     - 학교망에서 wss 가 막히면 방 자체가 안 열린다. 이건 코드로 못 넘긴다 →
       실기기 확인이 먼저. supported()/onStatus 로 실패를 분명히 알린다.

   전송: Supabase Realtime broadcast 채널 하나 (event 'kp'). 테이블·RLS 없음.
         방코드 = 채널명. DB에 아무것도 안 쌓인다.

   메시지
     hello {id,name,em}      참가자 → 전체 (구독 직후)
     lobby {game,seats}      방장 → 전체 (자리 확정본. 이게 유일한 진실)
     start {seed,seats,cfg}  방장 → 전체 (게임 시작)
     act   {n,seat,t,v}      현재 차례인 사람 → 전체 (입력 한 개)
     sync  {n,hash}          방장 → 전체 (턴 끝날 때 정합성 지문)
     need  {id}              어긋난 피어 → 방장
     full  {n,state}         방장 → 전체 (상태 통째로 재동기화)
     drop  {seat}            방장 → 전체 (이탈 → 그 자리 🤖 전환)
   ========================================================================== */
(function () {
  if (window.KParkNet) return;

  var CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0,O,1,I 뺌
  function makeCode(n) {
    var s = '';
    for (var i = 0; i < (n || 4); i++) s += CODE_ABC[Math.floor(Math.random() * CODE_ABC.length)];
    return s;
  }
  function myId() {
    return Math.random().toString(36).slice(2, 10);
  }

  /* ---- 시드 난수 (mulberry32) — 모든 피어가 같은 수열을 뽑는다 ---------- */
  function mulberry32(a) {
    var f = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    /* 재동기화용 — 난수 수열의 현재 위치까지 같이 맞춰야 그 뒤가 안 어긋난다 */
    f.get = function () { return a; };
    f.set = function (v) { a = v | 0; };
    return f;
  }

  /* ---- 상태 지문: 순서가 흔들려도 같은 값이 나오게 키 정렬 ------------- */
  function stableStr(v) {
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(stableStr).join(',') + ']';
    var k = Object.keys(v).sort();
    return '{' + k.map(function (x) { return JSON.stringify(x) + ':' + stableStr(v[x]); }).join(',') + '}';
  }
  function hashOf(obj) {
    var s = stableStr(obj), h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  /* ---- 상태 ------------------------------------------------------------ */
  var ch = null, db = null;
  var me = { id: myId(), name: '', em: '🙂' };
  var st = {
    on: false,        // 방에 들어와 있나
    host: false,
    code: '',
    game: '',
    max: 4,
    seats: [],        // [{id,name,em,ai,level}] — 확정된 자리
    mySeat: -1,
    started: false,
    n: 0,             // 적용한 입력 개수 (락스텝 시계)
    buf: {},          // 늦게·먼저 도착한 act 버퍼
    dropped: {},      // seat → true
    gen: 0            // 판 번호 (한 판 더 하면 올라간다)
  };
  var cb = {};        // onLobby onStart onAction onStatus onNotice onResync

  function fire(name, a, b) {
    var f = cb[name];
    if (f) { try { f(a, b); } catch (e) { console.error('[KParkNet]', name, e); } }
  }

  function supported() {
    return !!(window.supabase && window.KEDU_SUPABASE_URL);
  }

  function send(m) {
    if (!ch) return;
    try { ch.send({ type: 'broadcast', event: 'kp', payload: m }); } catch (e) { console.error(e); }
  }

  /* ---- 채널 열기 -------------------------------------------------------- */
  function open(code, onMsg) {
    if (!supported()) throw new Error('Supabase 미로드');
    db = window.supabase.createClient(window.KEDU_SUPABASE_URL, window.KEDU_SUPABASE_ANON_KEY);
    ch = db.channel('kpark:' + code, {
      config: { broadcast: { self: false, ack: true }, presence: { key: me.id } }
    });
    ch.on('broadcast', { event: 'kp' }, function (e) { onMsg(e.payload || {}); });

    // 이탈 감지 — 크롬북 탭 폐기·네트워크 끊김을 여기서 잡는다
    ch.on('presence', { event: 'leave' }, function (e) {
      if (!st.host) return;
      (e.leftPresences || []).forEach(function (p) { peerGone(p.id || e.key); });
    });

    ch.subscribe(function (status) {
      fire('onStatus', status);
      if (status === 'SUBSCRIBED') {
        ch.track({ id: me.id, name: me.name });
        if (!st.host) send({ kind: 'hello', id: me.id, name: me.name, em: me.em });
      }
    });
  }

  /* ---- 자리 배정 (방장만) ---------------------------------------------- */
  function seatAdd(p) {
    for (var i = 0; i < st.seats.length; i++) if (st.seats[i].id === p.id) return false;
    if (st.seats.length >= st.max) return false;
    st.seats.push({ id: p.id, name: p.name || '친구', em: p.em || '🙂', ai: false, level: 0 });
    return true;
  }
  function pushLobby() {
    send({ kind: 'lobby', game: st.game, seats: st.seats, max: st.max });
    fire('onLobby', st.seats.slice());
  }
  function peerGone(id) {
    var i = -1;
    for (var k = 0; k < st.seats.length; k++) if (st.seats[k].id === id) i = k;
    if (i < 0) return;
    if (!st.started) { st.seats.splice(i, 1); resolveMySeat(); pushLobby(); return; }
    if (st.dropped[i]) return;
    st.dropped[i] = true;
    send({ kind: 'drop', seat: i });
    applyDrop(i);
  }
  function applyDrop(seat) {
    st.dropped[seat] = true;
    var s = st.seats[seat];
    if (s) { s.ai = true; s.level = 2; }
    fire('onNotice', (s ? s.em + ' ' + s.name : '한 명') + ' 나갔어 — 🤖 가 이어서 해!');
    fire('onAction', { t: '__drop', seat: seat });
  }
  function resolveMySeat() {
    st.mySeat = -1;
    for (var i = 0; i < st.seats.length; i++) if (st.seats[i].id === me.id) st.mySeat = i;
  }

  /* ---- 수신 ------------------------------------------------------------- */
  function onMsg(p) {
    if (p.kind === 'hello') {
      if (!st.host || st.started) return;
      if (seatAdd(p)) fire('onNotice', p.em + ' ' + p.name + ' 들어왔어!');
      pushLobby();
      return;
    }
    if (p.kind === 'lobby') {
      if (st.host) return;
      st.game = p.game; st.max = p.max || st.max; st.seats = p.seats || [];
      resolveMySeat();
      fire('onLobby', st.seats.slice());
      return;
    }
    if (p.kind === 'start') {
      var g = p.gen || 1;
      if (g <= st.gen) return;              // 이미 시작한 판이면 무시
      st.gen = g;
      st.seats = p.seats; resolveMySeat();
      st.started = true; st.n = 0; st.buf = {}; st.dropped = {};
      fire('onStart', { seed: p.seed, seats: st.seats.slice(), cfg: p.cfg });
      return;
    }
    if (p.kind === 'act') { st.buf[p.n] = p; drain(); return; }
    if (p.kind === 'drop') { if (!st.host) applyDrop(p.seat); return; }
    if (p.kind === 'sync') {
      if (st.host) return;
      fire('onResync', { n: p.n, hash: p.hash, ask: function () { send({ kind: 'need', id: me.id }); } });
      return;
    }
    if (p.kind === 'need') {
      if (!st.host) return;
      var s = cb.snapshot && cb.snapshot();
      if (s) send({ kind: 'full', n: st.n, state: s });
      return;
    }
    if (p.kind === 'full') {
      if (st.host) return;
      st.n = p.n; st.buf = {};
      fire('onAction', { t: '__full', state: p.state });
      return;
    }
  }

  /* 락스텝 시계에 맞춰 순서대로만 적용 */
  function drain() {
    var guard = 0;
    while (st.buf[st.n + 1] && guard++ < 200) {
      var a = st.buf[st.n + 1];
      delete st.buf[st.n + 1];
      st.n++;
      fire('onAction', { t: a.t, v: a.v, seat: a.seat, n: a.n });
    }
  }

  /* ---- 바깥 API --------------------------------------------------------- */
  var API = {
    supported: supported,
    makeCode: makeCode,
    rnd: null,               // start 이후 시드 난수로 채워진다

    /* 방 만들기 — 나는 0번 자리, 방장 */
    createRoom: function (o) {
      me.name = o.name || '방장'; me.em = o.em || '🙂';
      st.on = true; st.host = true; st.game = o.game; st.max = o.max || 4;
      st.code = o.code || makeCode(4);
      st.seats = [{ id: me.id, name: me.name, em: me.em, ai: false, level: 0 }];
      st.mySeat = 0;
      cb = o;
      open(st.code, onMsg);
      setTimeout(pushLobby, 400);   // 구독 직후 한 번 뿌려 늦은 합류 대비
      return st.code;
    },

    /* 방코드로 들어가기 */
    joinRoom: function (code, o) {
      me.name = o.name || '친구'; me.em = o.em || '🙂';
      st.on = true; st.host = false; st.game = o.game || '';
      st.code = String(code || '').toUpperCase().trim();
      cb = o;
      open(st.code, onMsg);
      return st.code;
    },

    /* 사람이 모자랄 때 방장이 🤖 자리를 채운다 */
    addBot: function (name, em, level) {
      if (!st.host || st.started || st.seats.length >= st.max) return false;
      var n = st.seats.length + 1;
      st.seats.push({
        id: 'bot' + n + '-' + myId(), name: name || ('로봇 ' + n),
        em: em || '🤖', ai: true, level: level || 2
      });
      pushLobby();
      return true;
    },

    /* 방장이 판을 연다 — 시드를 여기서 한 번만 정한다 */
    start: function (cfg) {
      if (!st.host) return null;
      var seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
      st.gen++;
      st.started = true; st.n = 0; st.buf = {}; st.dropped = {};
      send({ kind: 'start', gen: st.gen, seed: seed, seats: st.seats, cfg: cfg || {} });
      fire('onStart', { seed: seed, seats: st.seats.slice(), cfg: cfg || {} });
      return seed;
    },

    /* 시드 난수 장착 — 모든 피어가 같은 값으로 부른다 */
    useSeed: function (seed) {
      API.rnd = mulberry32(seed >>> 0);
      return API.rnd;
    },

    /* 입력 한 개 — 보내고, 내 화면에도 똑같이 적용된다 */
    act: function (t, v) {
      if (!st.on || !st.started) return;
      st.n++;
      var m = { kind: 'act', n: st.n, seat: st.mySeat, t: t, v: v };
      send(m);
      fire('onAction', { t: t, v: v, seat: st.mySeat, n: st.n });
    },

    /* 방장이 턴 끝에 지문을 뿌린다 */
    sync: function (state) {
      if (!st.host || !st.started) return;
      send({ kind: 'sync', n: st.n, hash: hashOf(state) });
    },
    hash: hashOf,

    on: function () { return st.on; },
    started: function () { return st.started; },
    isHost: function () { return st.host; },
    code: function () { return st.code; },
    seats: function () { return st.seats.slice(); },
    mySeat: function () { return st.mySeat; },
    isMine: function (seat) { return st.on ? seat === st.mySeat : true; },
    dropped: function (seat) { return !!st.dropped[seat]; },
    myName: function () { return me.name; },
    setMe: function (name, em) { me.name = name; me.em = em; },

    leave: function () {
      try { if (ch) { ch.untrack(); ch.unsubscribe(); } } catch (e) { }
      try { if (db && ch) db.removeChannel(ch); } catch (e) { }
      ch = null; st.on = false; st.started = false; st.seats = []; st.mySeat = -1;
    }
  };

  window.addEventListener('beforeunload', function () { try { API.leave(); } catch (e) { } });
  window.KParkNet = API;
})();
