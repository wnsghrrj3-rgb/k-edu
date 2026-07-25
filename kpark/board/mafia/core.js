/* 케이파크 보드게임 · 🕵️ 마피아 대작전 — 순수 로직 (UI 없음)
 * 반 전체(5~35명)가 함께하는 마피아. 사회자(선생님) 1명이 기기를 들고 진행한다.
 * 역할: 마피아 / 의사 / 경찰 / 시민. 밤(마피아 지목→의사 보호→경찰 조사) → 아침 발표 → 낮 토론 → 투표.
 * 승리: 마피아 전멸 → 시민 승 / 마피아 수 ≥ 나머지 생존자 수 → 마피아 승. */
'use strict';
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MafiaCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {

  const MIN = 5, MAX = 35;
  const ROLES = ['mafia', 'doctor', 'police', 'citizen'];
  const ROLE_KO = { mafia: '마피아', doctor: '의사', police: '경찰', citizen: '시민' };
  const ROLE_IC = { mafia: '🕵️', doctor: '💉', police: '🚨', citizen: '🙂' };

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* 인원수에 따른 추천 역할 구성 */
  function recommendRoles(n) {
    let mafia;
    if (n < 8) mafia = 1;
    else if (n < 13) mafia = 2;
    else if (n < 18) mafia = 3;
    else if (n < 24) mafia = 4;
    else if (n < 30) mafia = 5;
    else mafia = 6;
    return { mafia, doctor: n >= 5 ? 1 : 0, police: n >= 7 ? 1 : 0 };
  }

  function validRoles(n, r) {
    const special = r.mafia + r.doctor + r.police;
    return r.mafia >= 1 && r.doctor >= 0 && r.doctor <= 1 && r.police >= 0 && r.police <= 1 &&
      special < n && n - r.mafia > r.mafia; /* 시작부터 마피아 우세 금지 */
  }

  /* names: 문자열 배열(1번부터). roles: {mafia,doctor,police}. seed: 정수 */
  function newGame(names, roles, seed) {
    const n = names.length;
    if (n < MIN || n > MAX) throw new Error('인원은 ' + MIN + '~' + MAX + '명');
    if (!validRoles(n, roles)) throw new Error('역할 구성이 올바르지 않음');
    const rnd = mulberry32(seed >>> 0);
    const deck = [];
    for (let i = 0; i < roles.mafia; i++) deck.push('mafia');
    for (let i = 0; i < roles.doctor; i++) deck.push('doctor');
    for (let i = 0; i < roles.police; i++) deck.push('police');
    while (deck.length < n) deck.push('citizen');
    for (let i = deck.length - 1; i > 0; i--) {              /* Fisher–Yates */
      const j = Math.floor(rnd() * (i + 1));
      const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    return {
      players: names.map((nm, i) => ({ id: i, name: nm, role: deck[i], alive: true })),
      roles: { mafia: roles.mafia, doctor: roles.doctor, police: roles.police },
      day: 1,
      night: { kill: null, save: null, check: null },
      log: []
    };
  }

  const alive = g => g.players.filter(p => p.alive);
  const aliveByRole = (g, role) => alive(g).filter(p => p.role === role);
  const mates = (g, id) => g.players.filter(p => p.role === 'mafia' && p.id !== id);

  /* 밤 행동 — 사회자가 대신 입력. 대상은 생존자만 */
  function nightKill(g, id) { _needAlive(g, id); g.night.kill = id; }
  function nightSave(g, id) { _needAlive(g, id); g.night.save = id; }        /* 자기 자신 보호 가능 */
  function nightCheck(g, id) { _needAlive(g, id); g.night.check = id; return g.players[id].role === 'mafia'; }
  function _needAlive(g, id) { if (!g.players[id] || !g.players[id].alive) throw new Error('생존자만 지목 가능'); }

  /* 아침: 밤 결과 정산. {victim:player|null, saved:bool} */
  function resolveNight(g) {
    const k = g.night.kill, s = g.night.save;
    let victim = null, saved = false;
    if (k !== null) {
      if (s !== null && s === k) saved = true;
      else { g.players[k].alive = false; victim = g.players[k]; }
    }
    g.log.push({ day: g.day, type: 'night', victim: victim ? victim.id : null, saved });
    g.night = { kill: null, save: null, check: null };
    return { victim, saved };
  }

  /* 투표: id 탈락, null이면 무효(동점·기권). 탈락자 반환 */
  function voteOut(g, id) {
    let out = null;
    if (id !== null) { _needAlive(g, id); g.players[id].alive = false; out = g.players[id]; }
    g.log.push({ day: g.day, type: 'vote', out: out ? out.id : null });
    g.day++;
    return out;
  }

  /* null | 'citizen' | 'mafia' */
  function winner(g) {
    const m = aliveByRole(g, 'mafia').length;
    const rest = alive(g).length - m;
    if (m === 0) return 'citizen';
    if (m >= rest) return 'mafia';
    return null;
  }

  return {
    MIN, MAX, ROLES, ROLE_KO, ROLE_IC,
    recommendRoles, validRoles, newGame,
    alive, aliveByRole, mates,
    nightKill, nightSave, nightCheck, resolveNight,
    voteOut, winner
  };
}));
