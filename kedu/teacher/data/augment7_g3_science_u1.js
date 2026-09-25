/* augment7_g3_science_u1.js — 2세대 21차 「개념 그림 층」 3학년 과학 1단원 「힘과 우리 생활」 개념 장 29장.
   그림 문법 하나: 주황 화살표 = 힘, 굵고 길수록 큰 힘(s·m·l). 인물은 이 단원의 곰이🐻(밀기)·펭이🐧(당기기).
   l07 s14(친구와 나누기 — 활동 장)는 그림 없음. 실행: node kedu/teacher/data/augment7_g3_science_u1.js */
'use strict';
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const push = (o) => Object.assign({ k: 'force', act: 'push', who: '🐻' }, o);
const pull = (o) => Object.assign({ k: 'force', act: 'pull', who: '🐧' }, o);
const bal = (l, r, o) => Object.assign({ k: 'balance', l, r }, o || {});
const T = (...xs) => ({ k: 'tools', items: xs.map(([name, kind]) => ({ name, kind })) });
const CHAIN = { k: 'chain', items: [{ name: '지레' }, { name: '빗면' }, { name: '입는 로봇' }] };
const F = {
  u1_l01: {
    s04: push({ obj: 'ball', size: 'm', trail: 'long', bottle: 'fall' }),
    s05: P([it('약하게', push({ obj: 'ball', size: 's', trail: 'short', bottle: 'stand' })), it('세게', push({ obj: 'ball', size: 'l', trail: 'long', bottle: 'fall' }))]),
    s06: P([it('미는 힘', push({ obj: 'box' })), it('당기는 힘', pull({ obj: 'cart' }))]),
    s07: P([it('움직여요', push({ obj: 'ball', trail: 'short' })), it('모양이 변해요', { k: 'force', act: 'press', flat: true })])
  },
  u1_l02: {
    s05: P([it('그네를 밀어요', push({ obj: 'swing' })), it('손수레를 당겨요', pull({ obj: 'cart' }))]),
    s06: P([it('밀면 움직여요', push({ obj: 'swing' })), it('잡으면 멈춰요', { k: 'force', act: 'stop', obj: 'swing', who: '🐧' })]),
    s07: P([it('가만히 있어요', { k: 'force', act: 'none' }), it('밀어 주면 굴러가요', push({ obj: 'ball', trail: 'long' }))])
  },
  u1_l03: {
    s05: P([it('빈 상자', push({ obj: 'box', load: 0, size: 's' })), it('가득 찬 상자', push({ obj: 'box', load: 3, size: 'l' }))]),
    s06: P([it('조금 넣으면', push({ obj: 'box', load: 1, size: 's' })), it('더 넣으면', push({ obj: 'box', load: 2, size: 'm' })), it('가득 넣으면', push({ obj: 'box', load: 3, size: 'l' }))]),
    s07: P([it('가벼운 수레', pull({ obj: 'cart', load: 0, size: 's' })), it('무거운 수레', pull({ obj: 'cart', load: 3, size: 'l' }))])
  },
  u1_l04: {
    s05: P([{ fig: bal(3, 3) }, { fig: bal(5, 2) }]),
    s06: P([{ fig: bal(2, 2) }, { fig: bal(1, 4) }]),
    s07: bal(6, 6, { dist: true })
  },
  u1_l05: {
    s05: P([it('손으로는 어림', { k: 'hand', who: '👧' }), it('저울은 정확', { k: 'scale', item: 'apple', show: '200 g' })], 'vs'),
    s06: P([it('동전 · 가벼움', { k: 'scale', item: 'coin', show: '5 g' }), it('사과 · 무거움', { k: 'scale', item: 'apple', show: '200 g' })]),
    s07: P([it('전자저울', { k: 'scale', item: 'apple', show: '200 g' }), it('용수철저울', { k: 'scale', type: 'spring' })])
  },
  u1_l06: {
    s05: P([it('맨손 · 큰 힘', { k: 'force', act: 'lift', obj: 'rock', size: 'l', who: '🐻' }), it('지레 · 작은 힘', { k: 'lever', size: 's' })], 'vs'),
    s06: P([it('곧장 · 큰 힘', { k: 'force', act: 'lift', obj: 'box', load: 2, size: 'l', who: '🐧' }), it('빗면 · 작은 힘', { k: 'slope', size: 's' })], 'vs'),
    s07: P([it('맨손', { k: 'force', act: 'lift', obj: 'rock', size: 'l', who: '🐻' }), it('지레', { k: 'lever', size: 's' }), it('빗면', { k: 'slope', size: 's' })])
  },
  u1_l07: {
    s05: T(['병따개', '지레'], ['집게', '지레']),
    s06: T(['시소', '지레'], ['계단', '빗면']),
    s07: T(['미끄럼틀', '빗면'], ['비탈길', '빗면']),
    s13: T(['경사판', '빗면'], ['병따개', '지레'])
  },
  u1_l09: {
    s05: { k: 'robot', who: '👦', size: 's' },
    s06: CHAIN,
    s07: { k: 'places', items: [{ name: '공사장', emoji: '🏗️' }, { name: '병원', emoji: '🏥' }, { name: '소방', emoji: '🚒' }] }
  },
  u1_l10: {
    s05: P([it('밀기', push({ obj: 'box' })), it('당기기', pull({ obj: 'cart' })), it('모양이 변해요', { k: 'force', act: 'press', flat: true })]),
    s06: P([{ fig: bal(2, 7) }, it('저울 · g·kg', { k: 'scale', item: 'apple', show: '200 g' })]),
    s07: CHAIN
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_science_u1.js'), F);
