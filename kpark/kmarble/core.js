/* 케이파크 보드게임 · 케이마블 — 순수 로직 (UI 없음)
 * 세계 도시를 도는 28칸 부루마블형 보드게임. 최대 4인 (사람·🤖 자유 조합).
 * 도시를 사고 → 🏠빌라·🏢빌딩·🏰랜드마크로 키우고 → 통행료를 걷는다.
 * 승리: 상대 전원 파산 / 한 줄 독점 / 색깔 3세트 독점 / 관광지 3곳 독점 / 30라운드 뒤 재산왕. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KMarbleCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const N = 28;
  const START_CASH = 1000, SALARY_PASS = 150, SALARY_LAND = 300;
  const ISLAND_ESCAPE = 100, ISLAND_TURNS = 2, FOUNTAIN = 50, MAX_ROUNDS = 30;
  const RENT_M = [0.4, 1, 2, 4];          // 레벨별 통행료 배수 (땅·빌라·빌딩·랜드마크)
  const UP_M   = [0, 0.5, 1, 1.5];        // 그 레벨로 올리는 데 드는 추가비 배수
  const INV_M  = [1, 1.5, 2.5, 4];        // 누적 투자 배수
  const LV_EM  = ['🚩', '🏠', '🏢', '🏰'];
  const LV_NM  = ['땅', '빌라', '빌딩', '랜드마크'];
  const r10 = x => Math.round(x / 10) * 10;

  /* 칸 정의 — t: start|island|festival|space|city|tourist|key|tax|fountain
   * city: g = 색깔 그룹 1~6, p = 땅값. tourist: p = 값 (통행료 p/2, 건물 없음) */
  const TILES = [
    { t: 'start',    em: '🏁', nm: '출발' },                            // 0
    { t: 'city',     em: '🛕', nm: '방콕',     g: 1, p: 60 },
    { t: 'key',      em: '🔑', nm: '황금열쇠' },
    { t: 'city',     em: '🌴', nm: '마닐라',   g: 1, p: 80 },
    { t: 'city',     em: '🐪', nm: '카이로',   g: 2, p: 100 },
    { t: 'tourist',  em: '🍊', nm: '제주도',   p: 120 },                // 5
    { t: 'city',     em: '🦘', nm: '시드니',   g: 2, p: 120 },
    { t: 'island',   em: '🏝️', nm: '무인도' },                          // 7
    { t: 'city',     em: '⚽', nm: '리우',     g: 3, p: 140 },
    { t: 'key',      em: '🔑', nm: '황금열쇠' },
    { t: 'city',     em: '🎪', nm: '모스크바', g: 3, p: 160 },          // 10
    { t: 'tourist',  em: '🗿', nm: '피라미드', p: 160 },
    { t: 'city',     em: '🏛️', nm: '로마',     g: 4, p: 180 },
    { t: 'city',     em: '💂', nm: '런던',     g: 4, p: 200 },
    { t: 'festival', em: '🎪', nm: '축제' },                            // 14
    { t: 'city',     em: '🗼', nm: '파리',     g: 4, p: 220 },          // 15
    { t: 'key',      em: '🔑', nm: '황금열쇠' },
    { t: 'city',     em: '🗻', nm: '도쿄',     g: 5, p: 240 },
    { t: 'tourist',  em: '🧱', nm: '만리장성', p: 200 },
    { t: 'city',     em: '🗽', nm: '뉴욕',     g: 5, p: 260 },
    { t: 'tax',      em: '🧾', nm: '세금' },                            // 20
    { t: 'space',    em: '🚀', nm: '우주여행' },                        // 21
    { t: 'city',     em: '🏙️', nm: '두바이',   g: 5, p: 280 },
    { t: 'key',      em: '🔑', nm: '황금열쇠' },
    { t: 'city',     em: '🐋', nm: '부산',     g: 6, p: 300 },
    { t: 'fountain', em: '⛲', nm: '행운의 분수' },                     // 25
    { t: 'key',      em: '🔑', nm: '황금열쇠' },
    { t: 'city',     em: '👑', nm: '서울',     g: 6, p: 340 }           // 27
  ];

  /* 한 줄 독점용 — 각 변의 살 수 있는 칸들 */
  const LINES = [
    { nm: '첫째 줄', idx: [1, 3, 4, 5, 6] },
    { nm: '둘째 줄', idx: [8, 10, 11, 12, 13] },
    { nm: '셋째 줄', idx: [15, 17, 18, 19] },
    { nm: '넷째 줄', idx: [22, 24, 27] }
  ];
  const GROUPS = {};   // g → [tile indices]
  const TOURISTS = [];
  TILES.forEach((t, i) => {
    if (t.t === 'city') (GROUPS[t.g] = GROUPS[t.g] || []).push(i);
    if (t.t === 'tourist') TOURISTS.push(i);
  });

  /* 황금열쇠 10장 */
  const KEYS = [
    { k: 'cash',    em: '💰', nm: '반짝반짝 용돈',   tx: '길에서 주운 지갑을 돌려주고 사례금!', v: 100 },
    { k: 'cash',    em: '🧸', nm: '장난감 지름신',   tx: '너무 갖고 싶었던 그것… 사 버렸다!', v: -80 },
    { k: 'goto',    em: '🏁', nm: '순간이동 출발점', tx: '출발점으로 슝! 월급도 받는다.', to: 0 },
    { k: 'goto',    em: '🏝️', nm: '표류',           tx: '뗏목이 뒤집혔다… 무인도로!', to: 7 },
    { k: 'festival',em: '🎪', nm: '축제 개최권',     tx: '내 도시 하나에서 축제 개막! 통행료 2배.' },
    { k: 'upgrade', em: '🆙', nm: '무료 공사',       tx: '내 도시 하나를 공짜로 한 단계 업!' },
    { k: 'shield',  em: '🛡️', nm: '무적 방패',       tx: '다음에 낼 통행료 한 번을 막아 준다.' },
    { k: 'birthday',em: '🎂', nm: '생일 축하해',     tx: '모두에게 축하 선물을 받는다. 각자 50씩!', v: 50 },
    { k: 'treat',   em: '🍩', nm: '도넛 쏘기',       tx: '기분이다! 친구들에게 도넛을 돌린다. 각자 30씩.', v: 30 },
    { k: 'again',   em: '🎲', nm: '한 번 더!',       tx: '주사위를 한 번 더 굴린다!' }
  ];

  /* ---------- 돈 계산 ---------- */
  function rentOf(state, i) {
    const t = TILES[i], o = state.owner[i];
    if (!o) return 0;
    let r = t.t === 'tourist' ? t.p / 2 : t.p * RENT_M[o.lv];
    if (state.festival === i) r *= 2;
    return r10(r);
  }
  function investedOf(i, lv) {
    const t = TILES[i];
    return r10(t.t === 'tourist' ? t.p : t.p * INV_M[lv]);
  }
  function upgradeCost(i, toLv) { return r10(TILES[i].p * UP_M[toLv]); }
  function takeoverCost(state, i) {
    const o = state.owner[i];
    return 2 * investedOf(i, o ? o.lv : 0);
  }
  function assets(state, pid) {
    let s = state.players[pid].cash;
    for (const i in state.owner) if (state.owner[i].p === pid) s += investedOf(+i, state.owner[i].lv);
    return s;
  }

  /* ---------- 새 판 ---------- */
  function shuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  /* cfgs: [{name, em, ai(bool), level}] × 2~4 */
  function newGame(cfgs, rnd) {
    rnd = rnd || Math.random;
    return {
      players: cfgs.map((c, id) => ({
        id, name: c.name, em: c.em, ai: !!c.ai, level: c.level || 2,
        cash: START_CASH, pos: 0, alive: true, island: 0, shield: false, fly: false
      })),
      owner: {},                 // tileIdx → { p: pid, lv }
      festival: null,
      deck: shuffle(KEYS.map((_, i) => i), rnd), deckIdx: 0,
      turn: 0, round: 1, doubles: 0, winner: null
    };
  }

  function rollDie(rnd) { return 1 + Math.floor((rnd || Math.random)() * 6); }
  function alivePlayers(state) { return state.players.filter(p => p.alive); }

  /* pos에서 n칸 전진 → { path, passStart } */
  function walk(pos, n) {
    const path = []; let passStart = false, p = pos;
    for (let k = 0; k < n; k++) { p = (p + 1) % N; path.push(p); if (p === 0) passStart = true; }
    return { path, passStart };
  }

  /* ---------- 돈 내기 (파산 처리 포함) ---------- */
  function charge(state, pid, amount, toPid, ev) {
    const pl = state.players[pid];
    const paid = Math.min(pl.cash, amount);
    pl.cash -= amount;
    if (toPid != null && state.players[toPid].alive) state.players[toPid].cash += paid;
    if (pl.cash < 0) {
      pl.cash = 0; pl.alive = false;
      for (const i in state.owner) if (state.owner[i].p === pid) delete state.owner[i];
      if (state.festival != null && !state.owner[state.festival]) state.festival = null;
      ev.push({ e: 'bankrupt', pid });
    }
    return paid;
  }
  function gain(state, pid, amount) { state.players[pid].cash += amount; }

  /* ---------- 승리 판정 ---------- */
  function ownAll(state, idxs, pid) { return idxs.every(i => state.owner[i] && state.owner[i].p === pid); }
  function checkWin(state) {
    const alive = alivePlayers(state);
    if (alive.length === 1) return { type: 'last', pid: alive[0].id, tx: '혼자 살아남았다!' };
    for (const pl of alive) {
      for (const L of LINES) if (ownAll(state, L.idx, pl.id))
        return { type: 'line', pid: pl.id, tx: L.nm + ' 한 줄 독점!' };
      let sets = 0;
      for (const g in GROUPS) if (ownAll(state, GROUPS[g], pl.id)) sets++;
      if (sets >= 3) return { type: 'triple', pid: pl.id, tx: '색깔 3세트 독점!' };
      if (ownAll(state, TOURISTS, pl.id))
        return { type: 'tourist', pid: pl.id, tx: '관광지 3곳 독점!' };
    }
    return null;
  }
  function roundsEndWinner(state) {
    let best = null;
    for (const pl of alivePlayers(state)) {
      const a = assets(state, pl.id);
      if (!best || a > best.a) best = { pid: pl.id, a };
    }
    return { type: 'rich', pid: best.pid, tx: MAX_ROUNDS + '라운드 종료 — 재산왕!', a: best.a };
  }

  /* ---------- 착지 처리 ----------
   * 자동 효과(월급·통행료·세금·열쇠 등)는 즉시 적용, 선택이 남으면 choice 반환.
   * 반환: { ev: [...], choice: null | {type:'buy'|'upgrade'|'takeover'|'festival'|'islandPay', ...} } */
  function land(state, pid, opts) {
    opts = opts || {};
    const ev = [], pl = state.players[pid], i = pl.pos, t = TILES[i];
    const done = c => ({ ev, choice: c || null });

    if (t.t === 'start') { gain(state, pid, SALARY_LAND); ev.push({ e: 'salaryLand', v: SALARY_LAND }); return done(); }
    if (t.t === 'fountain') { gain(state, pid, FOUNTAIN); ev.push({ e: 'fountain', v: FOUNTAIN }); return done(); }
    if (t.t === 'tax') {
      const amt = r10(pl.cash / 10);
      charge(state, pid, amt, null, ev); ev.push({ e: 'tax', v: amt });
      return done();
    }
    if (t.t === 'island') { pl.island = ISLAND_TURNS; ev.push({ e: 'island' }); return done(); }
    if (t.t === 'space') { pl.fly = true; ev.push({ e: 'space' }); return done(); }
    if (t.t === 'festival') {
      const mine = myCities(state, pid);
      if (!mine.length) { gain(state, pid, FOUNTAIN); ev.push({ e: 'festivalNone', v: FOUNTAIN }); return done(); }
      return done({ type: 'festival', options: mine });
    }
    if (t.t === 'key') {
      const card = KEYS[state.deck[state.deckIdx]];
      state.deckIdx = (state.deckIdx + 1) % state.deck.length;
      ev.push({ e: 'key', card });
      return applyKey(state, pid, card, ev, opts);
    }
    /* city / tourist */
    const o = state.owner[i];
    if (!o) {
      const price = investedOf(i, 0);
      if (pl.cash >= price) return done({ type: 'buy', i, price });
      ev.push({ e: 'tooPoor', i }); return done();
    }
    if (o.p === pid) {
      if (t.t === 'city' && o.lv < 3) {
        const cost = upgradeCost(i, o.lv + 1);
        if (pl.cash >= cost) return done({ type: 'upgrade', i, toLv: o.lv + 1, cost });
      }
      return done();
    }
    /* 남의 땅 — 통행료 */
    const rent = rentOf(state, i);
    if (pl.shield) { pl.shield = false; ev.push({ e: 'shieldUsed', i, rent }); }
    else {
      const paid = charge(state, pid, rent, o.p, ev);
      ev.push({ e: 'rent', i, v: rent, paid, to: o.p });
    }
    if (!pl.alive) return done();
    /* 인수 기회 — 랜드마크는 못 뺏는다 */
    if (!(t.t === 'city' && o.lv === 3)) {
      const cost = takeoverCost(state, i);
      if (pl.cash >= cost) return done({ type: 'takeover', i, cost, lv: o.lv });
    }
    return done();
  }

  function myCities(state, pid) {
    const r = [];
    for (const i in state.owner) if (state.owner[i].p === pid && TILES[i].t === 'city') r.push(+i);
    return r.sort((a, b) => a - b);
  }

  /* 열쇠 효과. goto·again은 호출자가 이어서 처리할 수 있게 표시 반환 */
  function applyKey(state, pid, card, ev, opts) {
    const pl = state.players[pid];
    if (card.k === 'cash') {
      if (card.v >= 0) gain(state, pid, card.v); else charge(state, pid, -card.v, null, ev);
      return { ev, choice: null };
    }
    if (card.k === 'birthday') {
      for (const q of alivePlayers(state)) if (q.id !== pid) { charge(state, q.id, card.v, pid, ev); }
      return { ev, choice: null };
    }
    if (card.k === 'treat') {
      for (const q of alivePlayers(state)) if (q.id !== pid && pl.alive) { charge(state, pid, card.v, q.id, ev); if (!pl.alive) break; }
      return { ev, choice: null };
    }
    if (card.k === 'shield') { pl.shield = true; return { ev, choice: null }; }
    if (card.k === 'goto') {
      pl.pos = card.to;
      ev.push({ e: 'teleport', to: card.to });
      if (card.to === 0) { gain(state, pid, SALARY_LAND); ev.push({ e: 'salaryLand', v: SALARY_LAND }); return { ev, choice: null }; }
      const sub = land(state, pid, opts);
      return { ev: ev.concat(sub.ev), choice: sub.choice };
    }
    if (card.k === 'festival') {
      const mine = myCities(state, pid);
      if (!mine.length) { gain(state, pid, FOUNTAIN); ev.push({ e: 'festivalNone', v: FOUNTAIN }); return { ev, choice: null }; }
      return { ev, choice: { type: 'festival', options: mine } };
    }
    if (card.k === 'upgrade') {
      const ups = myCities(state, pid).filter(i => state.owner[i].lv < 3);
      if (!ups.length) { gain(state, pid, FOUNTAIN); ev.push({ e: 'festivalNone', v: FOUNTAIN }); return { ev, choice: null } }
      return { ev, choice: { type: 'freeUpgrade', options: ups } };
    }
    if (card.k === 'again') { ev.push({ e: 'again' }); return { ev, choice: null, again: true }; }
    return { ev, choice: null };
  }

  /* ---------- 선택 실행 ---------- */
  function applyChoice(state, pid, choice, yes, arg) {
    const ev = [], pl = state.players[pid];
    if (!yes) return ev;
    if (choice.type === 'buy') {
      charge(state, pid, choice.price, null, ev);
      state.owner[choice.i] = { p: pid, lv: 0 };
      ev.push({ e: 'buy', i: choice.i, v: choice.price });
    } else if (choice.type === 'upgrade') {
      charge(state, pid, choice.cost, null, ev);
      state.owner[choice.i].lv = choice.toLv;
      ev.push({ e: 'upgrade', i: choice.i, lv: choice.toLv, v: choice.cost });
    } else if (choice.type === 'takeover') {
      const o = state.owner[choice.i];
      charge(state, pid, choice.cost, o.p, ev);
      if (pl.alive) { state.owner[choice.i] = { p: pid, lv: o.lv }; ev.push({ e: 'takeover', i: choice.i, v: choice.cost }); }
    } else if (choice.type === 'festival') {
      state.festival = arg;
      ev.push({ e: 'festival', i: arg });
    } else if (choice.type === 'freeUpgrade') {
      state.owner[arg].lv++;
      ev.push({ e: 'upgrade', i: arg, lv: state.owner[arg].lv, v: 0 });
    }
    return ev;
  }

  /* ---------- 무인도 ---------- */
  function islandTry(state, pid, d1, d2) {
    const pl = state.players[pid], ev = [];
    if (d1 === d2) { pl.island = 0; ev.push({ e: 'escape', how: 'double' }); return { ev, free: true }; }
    pl.island--;
    if (pl.island <= 0) { ev.push({ e: 'escape', how: 'wait' }); return { ev, free: false, next: true } }
    ev.push({ e: 'islandSkip', left: pl.island });
    return { ev, free: false };
  }
  function islandPay(state, pid) {
    const ev = [];
    charge(state, pid, ISLAND_ESCAPE, null, ev);
    state.players[pid].island = 0;
    ev.push({ e: 'escape', how: 'pay', v: ISLAND_ESCAPE });
    return ev;
  }

  /* ---------- 우주여행 이동 ---------- */
  function flyTo(state, pid, dest) {
    const pl = state.players[pid], ev = [];
    pl.fly = false;
    if (dest === pl.pos) dest = (dest + 1) % N;
    const forwardPass = dest <= pl.pos;      // 출발점을 넘어 앞으로 간 셈
    pl.pos = dest;
    ev.push({ e: 'fly', to: dest });
    if (forwardPass || dest === 0) { gain(state, pid, dest === 0 ? SALARY_LAND : SALARY_PASS); ev.push({ e: dest === 0 ? 'salaryLand' : 'salary', v: dest === 0 ? SALARY_LAND : SALARY_PASS }); }
    if (dest === 0) return { ev, choice: null };
    const sub = land(state, pid);
    return { ev: ev.concat(sub.ev), choice: sub.choice };
  }

  /* ---------- 다음 차례 ---------- */
  function nextTurn(state) {
    let guard = 0, endRound = false;
    do {
      state.turn = (state.turn + 1) % state.players.length;
      if (state.turn === 0) endRound = true;
      guard++;
    } while (!state.players[state.turn].alive && guard < 10);
    if (endRound) state.round++;
    state.doubles = 0;
    return state.round > MAX_ROUNDS;
  }

  /* ================== 🤖 AI ================== */
  /* 살까? */
  function aiBuy(state, pid, choice, rnd) {
    const pl = state.players[pid], lv = pl.level;
    const after = pl.cash - choice.price;
    if (lv === 1) return after >= 100 && rnd() < 0.6;
    const val = tileValue(state, pid, choice.i);
    if (lv === 2) return after >= 150 || val >= 3;
    return after >= reserve(state, pid) || val >= 2;   // 도사: 가치 있으면 과감히
  }
  /* 업그레이드할까? */
  function aiUpgrade(state, pid, choice, rnd) {
    const pl = state.players[pid], lv = pl.level;
    const after = pl.cash - choice.cost;
    if (lv === 1) return after >= 150 && rnd() < 0.4;
    if (lv === 2) return after >= 200;
    return after >= reserve(state, pid) * 0.7;
  }
  /* 인수할까? */
  function aiTakeover(state, pid, choice, rnd) {
    const pl = state.players[pid], lv = pl.level;
    if (lv === 1) return false;
    const after = pl.cash - choice.cost;
    const val = tileValue(state, pid, choice.i);
    if (lv === 2) return val >= 3 && after >= 200;
    return (val >= 2 && after >= 150) || (val >= 4 && after >= 0);
  }
  /* 이 칸이 나에게 얼마나 소중한가 (0~5) — 줄·색세트·관광지 완성 근접도 */
  function tileValue(state, pid, i) {
    const t = TILES[i]; let v = 1;
    const near = idxs => {
      const mine = idxs.filter(j => j !== i && state.owner[j] && state.owner[j].p === pid).length;
      const enemy = idxs.filter(j => j !== i && state.owner[j] && state.owner[j].p !== pid).length;
      const need = idxs.length;
      if (mine === need - 1) return 4;                       // 이거면 완성!
      if (enemy === need - 1) return 3;                      // 상대 완성 저지
      return mine >= 1 ? 1 : 0;
    };
    if (t.t === 'tourist') v += near(TOURISTS);
    if (t.t === 'city') v += near(GROUPS[t.g]);
    for (const L of LINES) if (L.idx.includes(i)) v += near(L.idx) * 0.8;
    return v;
  }
  /* 남길 비상금 — 상대 최고 통행료 */
  function reserve(state, pid) {
    let m = 100;
    for (const i in state.owner) if (state.owner[i].p !== pid) m = Math.max(m, rentOf(state, +i));
    return Math.min(m, 400);
  }
  /* 축제·무료공사 도시 고르기 */
  function aiPickCity(state, pid, options, purpose, rnd) {
    if (state.players[pid].level === 1) return options[Math.floor(rnd() * options.length)];
    let best = options[0], bs = -1;
    for (const i of options) {
      const s = purpose === 'festival' ? rentOf(state, i) : TILES[i].p * (state.owner[i].lv + 1);
      if (s > bs) { bs = s; best = i; }
    }
    return best;
  }
  /* 우주여행 목적지 */
  function aiFly(state, pid, rnd) {
    const pl = state.players[pid], lv = pl.level;
    const cand = [];
    for (let i = 0; i < N; i++) {
      const t = TILES[i];
      if (t.t !== 'city' && t.t !== 'tourist') continue;
      const o = state.owner[i];
      if (!o && pl.cash >= investedOf(i, 0)) cand.push({ i, s: tileValue(state, pid, i) + t.p / 400 });
      else if (o && o.p !== pid && !(t.t === 'city' && o.lv === 3) && pl.cash >= takeoverCost(state, i) + rentOf(state, i))
        cand.push({ i, s: tileValue(state, pid, i) - 1 });
    }
    if (!cand.length) return 0;                              // 갈 데 없으면 출발점 (월급)
    if (lv === 1) return cand[Math.floor(rnd() * cand.length)].i;
    cand.sort((a, b) => b.s - a.s);
    return cand[0].i;
  }
  function aiIslandPay(state, pid) {
    const pl = state.players[pid];
    if (pl.level === 1) return false;
    return pl.cash >= (pl.level === 2 ? 400 : 300);
  }
  /* 선택 하나를 AI가 결정해 실행 */
  function aiResolve(state, pid, choice, rnd) {
    if (!choice) return [];
    if (choice.type === 'buy') return applyChoice(state, pid, choice, aiBuy(state, pid, choice, rnd));
    if (choice.type === 'upgrade') return applyChoice(state, pid, choice, aiUpgrade(state, pid, choice, rnd));
    if (choice.type === 'takeover') return applyChoice(state, pid, choice, aiTakeover(state, pid, choice, rnd));
    if (choice.type === 'festival') return applyChoice(state, pid, choice, true, aiPickCity(state, pid, choice.options, 'festival', rnd));
    if (choice.type === 'freeUpgrade') return applyChoice(state, pid, choice, true, aiPickCity(state, pid, choice.options, 'up', rnd));
    return [];
  }

  /* AI 한 차례 전체 실행 → 이벤트 목록 (더블 연속 굴림 포함) */
  function aiTurn(state, rnd) {
    rnd = rnd || Math.random;
    const pid = state.turn, pl = state.players[pid];
    let ev = [];
    if (pl.fly) {
      const dest = aiFly(state, pid, rnd);
      const r = flyTo(state, pid, dest);
      ev = ev.concat(r.ev, aiResolve(state, pid, r.choice, rnd));
      return ev;
    }
    if (pl.island > 0 && aiIslandPay(state, pid)) ev = ev.concat(islandPay(state, pid));
    let rolls = 0;
    while (pl.alive) {
      const d1 = rollDie(rnd), d2 = rollDie(rnd);
      rolls++;
      ev.push({ e: 'roll', d1, d2, dbl: d1 === d2 });
      if (pl.island > 0) {
        const r = islandTry(state, pid, d1, d2);
        ev = ev.concat(r.ev);
        if (!r.free) break;
      }
      if (d1 === d2) state.doubles++;
      if (state.doubles >= 3) { pl.pos = 7; pl.island = ISLAND_TURNS; ev.push({ e: 'tripleDouble' }, { e: 'island' }); break; }
      const w = walk(pl.pos, d1 + d2);
      pl.pos = w.path[w.path.length - 1];
      ev.push({ e: 'move', path: w.path });
      if (w.passStart && pl.pos !== 0) { gain(state, pid, SALARY_PASS); ev.push({ e: 'salary', v: SALARY_PASS }); }
      const r = land(state, pid, {});
      ev = ev.concat(r.ev, aiResolve(state, pid, r.choice, rnd));
      const again = r.ev.some(x => x.e === 'again');
      if (checkWin(state)) break;
      if (!((d1 === d2 || again) && pl.alive && pl.island === 0 && !pl.fly) || rolls >= 5) break;
    }
    return ev;
  }

  /* AI끼리 자동 한 판 (테스트·밸런스용) */
  function simulate(cfgs, rnd, maxSteps) {
    const state = newGame(cfgs, rnd);
    maxSteps = maxSteps || 400;
    for (let s = 0; s < maxSteps; s++) {
      aiTurn(state, rnd);
      const w = checkWin(state);
      if (w) { state.winner = w; return state; }
      if (nextTurn(state)) { state.winner = roundsEndWinner(state); return state; }
    }
    state.winner = roundsEndWinner(state);
    return state;
  }

  return {
    N, TILES, LINES, GROUPS, TOURISTS, KEYS, LV_EM, LV_NM,
    START_CASH, SALARY_PASS, SALARY_LAND, ISLAND_ESCAPE, FOUNTAIN, MAX_ROUNDS,
    r10, rentOf, investedOf, upgradeCost, takeoverCost, assets,
    newGame, rollDie, walk, land, applyChoice, charge, gain, myCities,
    islandTry, islandPay, flyTo, nextTurn, checkWin, roundsEndWinner,
    aiBuy, aiUpgrade, aiTakeover, aiPickCity, aiFly, aiIslandPay, aiResolve, aiTurn, simulate,
    alivePlayers
  };
}));
