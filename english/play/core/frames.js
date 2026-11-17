/* ============================================================
 * 영어 놀이터 — 판정 뼈대 여섯(PlayFrames) (WD0 · 다름 설계 v1 §6)
 *   놀이 = 뼈대 하나 + 손짓 하나(core/hands.js) + 그릇. 뼈대는 「무엇이 맞는가」 와 「증거를 어떻게 적는가」 만 안다 — 손이 무엇을 했는지, 화면이 어떤지는 모른다.
 *   그래서 걸음마다 손짓 · 그릇 · 구도가 달라져도 판정과 증거는 같다(다름 설계 §1 — 같은 채로 두는 것).
 *     pick  고르기       여럿 가운데 그것 하나       answer(id, by)
 *     sort  가르기       이것을 어느 쪽에           answer(bin, by)  (끌어 놓기 · 던지기는 answer(zone))
 *     link  잇기         짝을 잇는다                join(a, b, by)
 *     order 차례 놓기    차례대로 놓는다            place(id, by)
 *     say   말하기       말로(마이크) · 못 알아들으면 골라서   result(said)
 *     write 쓰기         손으로 쓴다                result(res)
 *   돌려주는 것 = { ok, done, miss, evidence }. evidence 는 적을 거리(무엇 · 어떤 힘 · 손의 갈래 · 한 번에 · 몇 번째) — PlayFrames.value(PlayEvidence, evidence) 가 기록 한 건으로 바꾼다.
 *   「틀렸다」 는 없다 — 맞지 않은 답은 miss 로 세기만 하고 다시 듣게 한다(화면에 수 0).
 *   OF[놀이 열쇠] = 그 놀이의 뼈대(한 해 길 GAMES 의 열쇠). 사건을 몇 가지 판형으로 모으는 자리는 없다 — 사건마다 뼈대 + 그 걸음의 손짓 + 그릇으로 짓는다.
 * ============================================================ */
(function (g) {
  'use strict';
  var FRAMES = ['pick', 'sort', 'link', 'order', 'say', 'write'];
  var KO = { pick: '고르기', sort: '가르기', link: '잇기', order: '차례 놓기', say: '말하기', write: '쓰기' };
  /* 놀이 열쇠 → 뼈대. 지은 놀이만 적는다 — 없는 열쇠는 「뼈대를 정하지 않은 놀이」 로 막힌다 */
  var OF = { pop: 'pick', lfruit: 'pick', smonster: 'pick', guest: 'pick', sjump: 'sort', basket: 'sort', wtrain: 'say', order: 'say', schant: 'say', magic: 'say', talk: 'say', dict: 'write', lpath: 'write' };
  var modeOf = function (hand) { return hand && g.PlayHands && g.PlayHands.CARRY[hand] ? 'drag' : 'touch'; };
  function act(o, target, miss) { return { kind: 'act', target: target, skill: o.skill || 'listen', mode: modeOf(o.hand), clean: !miss, attempts: miss + 1, unit: o.unit || 'word' }; }

  /* 고르기 — o = { want, also?, id?(증거에 적을 것 — 없으면 want), hand, skill?, unit? } */
  function pick(o) { var miss = 0, done = false;
    return { frame: 'pick', get miss() { return miss; }, get done() { return done; },
      answer: function (id, by) { if (done) return null; if (id !== o.want && (o.also || []).indexOf(id) < 0) { miss++; return { ok: false, done: false, miss: miss, got: id }; } done = true; return { ok: true, done: true, miss: miss, by: by || 'gesture', got: id, evidence: act(o, o.id || o.want, miss) }; } }; }
  /* 가르기 — o = { item, bin, also?, hand } : 이 물건(낱말)은 어느 쪽인가 */
  function sort(o) { var p = pick({ want: o.bin, also: o.also, id: o.item, hand: o.hand, skill: o.skill, unit: o.unit }); return { frame: 'sort', get miss() { return p.miss; }, get done() { return p.done; }, answer: p.answer }; }
  /* 잇기 — o = { pairs: [[a, b], …], hand } : 짝마다 한 건 */
  function link(o) { var left = (o.pairs || []).map(function (p) { return p.slice(); }), miss = {}, n = left.length;
    return { frame: 'link', get done() { return !left.length; }, get left() { return left.length; },
      join: function (a, b, by) { var i = left.findIndex(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); }); var key = left.some(function (p) { return p[0] === a; }) ? a : b;
        if (i < 0) { miss[key] = (miss[key] || 0) + 1; return { ok: false, done: false, miss: miss[key] }; } var p = left.splice(i, 1)[0], m = miss[p[0]] || 0; return { ok: true, done: !left.length, miss: m, by: by || 'gesture', n: n - left.length, evidence: act(o, p[1], m) }; } }; }
  /* 차례 놓기 — o = { seq: [id, …], hand } : 다음 것만 받는다 */
  function order(o) { var at = 0, miss = 0, seq = o.seq || [];
    return { frame: 'order', get done() { return at >= seq.length; }, get at() { return at; },
      place: function (id, by) { if (at >= seq.length) return null; if (id !== seq[at]) { miss++; return { ok: false, done: false, miss: miss }; } var m = miss; miss = 0; at++; return { ok: true, done: at >= seq.length, miss: m, by: by || 'gesture', n: at, evidence: act(o, id, m) }; } }; }
  /* 말하기 — o = { id, unit? } · said = 'speech'(말로 통과) | 'heard' · 'tap'(말했지만 골라서) | 'pass' · false(관찰 안 됨 — 적지 않는다) */
  function say(o) { var done = false;
    return { frame: 'say', get done() { return done; }, result: function (said, mic) { done = true; if (!said || said === 'pass') return { ok: true, done: true, evidence: null }; return { ok: true, done: true, evidence: { kind: 'say', target: o.id, by: said === 'speech' ? 'speech' : 'chosen', mic: !!mic, unit: o.unit || null } }; } }; }
  /* 쓰기 — o = { id, unit? } · res = 손 쓰기 엔진의 결과({ support, clean, attempts }) | null(그만둠) */
  function write(o) { var done = false;
    return { frame: 'write', get done() { return done; }, result: function (res) { done = !!res; if (!res) return { ok: false, done: false, evidence: null }; return { ok: true, done: true, evidence: { kind: 'write', target: o.id, unit: o.unit || 'letter', support: res.support, clean: res.clean, attempts: res.attempts } }; } }; }
  /* 적을 거리 → 기록 한 건(PlayEvidence 의 계약 그대로) */
  function value(EVD, ev) {
    if (!EVD || !ev) return null; var v;
    if (ev.kind === 'say') { v = ev.by === 'speech' ? EVD.say(ev.target, { by: 'speech' }) : EVD.say(ev.target, { by: 'chosen', mic: ev.mic }); if (v && ev.unit) v.unit = ev.unit; return v; }
    if (ev.kind === 'write') return EVD.write(ev.target, { unit: ev.unit, support: ev.support, clean: ev.clean, attempts: ev.attempts });
    v = EVD.act(ev.target, ev.skill, ev.mode, ev.clean, ev.attempts); if (v && ev.unit) v.unit = ev.unit; return v;
  }
  g.PlayFrames = { FRAMES: FRAMES, KO: KO, OF: OF, of: function (game) { return OF[game] || null; }, pick: pick, sort: sort, link: link, order: order, say: say, write: write, value: value, modeOf: modeOf };
})(typeof window !== 'undefined' ? window : globalThis);
