/* augment7_g3_math_u5.js — 2세대 23차 「개념 그림 층」 3학년 수학 5단원 「길이와 시간」 개념 장 31장(l01 4 · l02~l10 27).
   부품(23차 신설): ruler(자 cm·mm) · joins(이어 붙여 어림) · road(거리 띠·km 표지판) · clock(시·분·초바늘) · tvert(시간 세로셈).
   그림 문법: 파랑 = 잰 것 · 연회색 = 눈금 · 주황 = 강조(1 mm 한 칸·초바늘·1초 한 칸·받아올림). 선행 표기 지킴 — mm 는 l02, km 는 l04, 초는 l06 부터.
   실행: node kedu/teacher/data/augment7_g3_math_u5.js */
'use strict';
const P = (items, vs) => (vs ? { k: 'panels', items, vs } : { k: 'panels', items });
const it = (label, fig) => ({ label, fig });
const R = (cm, mm, name, o) => Object.assign({ k: 'ruler', obj: { cm, mm, name } }, o || {});
const C = (h, m, s, o) => Object.assign({ k: 'clock', h, m, s }, o || {});
const TV = (a, b, op, o) => Object.assign({ k: 'tvert', a, b, op: op || '+' }, o || {});
const EQ = (lines, tag) => Object.assign({ k: 'eq', lines }, tag ? { tag } : {});
const F = {
  u5_l01: {
    s04: P([it('길이는 cm·m 로', EQ(['1 m = 100 cm'])), it('시각은 몇 시 몇 분', C(6, 42, 0, { sec: false, show: true, note: '1시간 = 60분 · 하루 = 24시간' }))]),
    s05: { k: 'tools', items: [{ name: '색연필', emoji: '🖍️', kind: 'cm 로 재요' }, { name: '연필심 굵기', emoji: '✏️', kind: '1 cm보다 작아요' }, { name: '도시 사이', emoji: '🏙️', kind: 'm 로는 너무 멀어요' }] },
    s06: P([it('몇 시 몇 분은 읽어요', C(6, 42, 0, { sec: false, show: true })), it('1분보다 짧은 순간은?', C(6, 42, 27, { hi: 'sec', note: '가장 빠른 바늘' }))]),
    s07: { k: 'chain', items: [{ name: 'mm' }, { name: 'km' }, { name: '초' }, { name: '시·분·초 덧셈·뺄셈' }] }
  },
  u5_l02: {
    s04: { k: 'ruler', zoom: true },
    s05: R(8, 3, '잎', { show: '8 cm 3 mm' }),
    s06: P([it('4 cm 7 mm = 47 mm', R(4, 7, '연필')), it('두 가지로 나타내요', EQ(['8 cm 3 mm = 83 mm', '2 cm 5 mm = 25 mm', '47 mm = 4 cm 7 mm']))])
  },
  u5_l03: {
    s04: { k: 'joins', items: [{ name: '사인펜', cm: 15 }], total: '약 15 cm', note: '자 없이 짐작하면 앞에 「약」' },
    s05: { k: 'joins', rep: { name: '엄지', cm: 1, n: 15 }, total: '약 15 cm' },
    s06: P([it('약 7 cm + 약 3 cm', { k: 'joins', items: [{ name: '색연필', cm: 7 }, { name: '클립', cm: 3 }], total: '약 10 cm' }), it('자로 재면', R(15, 5, '사인펜', { show: '15 cm 5 mm' }))])
  },
  u5_l04: {
    s04: { k: 'road', unit: 100, n: 10, label: '100 m 가 10번', show: '1 km = 1000 m' },
    s05: { k: 'road', km: 1, m: 300, unit: 100, sign: '1 km 300 m', show: '1 km 300 m = 1300 m' },
    s06: P([it('3 km 750 m = 3750 m', { k: 'road', km: 3, m: 750, unit: 250, sign: '3 km 750 m' }), it('표지판에도 km', EQ(['3750 m = 3 km 750 m', '6 km 927 m = 6927 m']))])
  },
  u5_l05: {
    s04: { k: 'road', unit: 500, n: 3, est: true, show: '약 500 m 가 3번 → 약 1 km 500 m' },
    s05: { k: 'road', unit: 50, n: 20, est: true, label: '운동장 한 바퀴 약 50 m × 20바퀴', show: '약 1 km' },
    s06: { k: 'tools', items: [{ name: '새끼손톱', emoji: '🤏', kind: 'mm' }, { name: '책상', emoji: '🪑', kind: 'cm' }, { name: '한라산 높이', emoji: '⛰️', kind: 'm' }, { name: '서울 → 제주', emoji: '✈️', kind: 'km' }] }
  },
  u5_l06: {
    s04: P([it('짧은바늘 = 시 · 긴바늘 = 분', C(2, 15, 0, { sec: false, show: true })), it('초바늘이 한 칸 가는 동안 = 1초', C(2, 15, 20, { hi: 'tick', note: '작은 눈금 한 칸 = 1초' }))]),
    s05: P([it('초바늘 한 바퀴 = 60초', C(2, 15, 0, { hi: 'round' })), it('그러면 긴바늘이 한 칸', C(2, 16, 0, { note: '60초 = 1분' }))]),
    s06: P([it('시 → 분 → 초 차례로 읽어요', C(4, 10, 30, { show: true, hi: 'big', names: true, note: '큰 눈금 한 칸 = 5초' })), it('60씩 묶어요', EQ(['1분 = 60초', '2분 = 120초', '185초 = 3분 5초']))])
  },
  u5_l07: {
    s04: TV([10, 20, 25], [null, 11, 25], '+', { label: '시는 시 · 분은 분 · 초는 초끼리' }),
    s05: P([it('60초 → 1분으로 받아올림', TV([null, 50], [null, 30], '+', { units: ['분', '초'] })), it('60분 → 1시간으로 받아올림', TV([2, 40], [null, 30], '+', { units: ['시간', '분'] }))]),
    s06: P([it('시작 3시 20분', C(3, 20, 0, { sec: false })), it('+ 걸린 시간 30분', TV([3, 20], [null, 30], '+', { units: ['시', '분'] })), it('끝 3시 50분', C(3, 50, 0, { sec: false }))])
  },
  u5_l08: {
    s04: TV([3, 50], [1, 20], '−', { units: ['시간', '분'], label: '같은 단위끼리 빼요' }),
    s05: P([it('1분(60초)을 빌려 와요', TV([1, 10], [null, 40], '−', { units: ['분', '초'] })), it('빌려준 자리는 1 줄어요', EQ(['1분 10초 = 70초', '70초 − 40초 = 30초']))]),
    s06: P([it('시작 2시 10분', C(2, 10, 0, { sec: false })), it('끝 − 시작 = 걸린 시간', TV([3, 50], [2, 10], '−', { units: ['시', '분'], runits: ['시간', '분'] })), it('끝 3시 50분', C(3, 50, 0, { sec: false }))])
  },
  u5_l09: {
    s04: R(22, 0, '발', { show: '약 220 mm = 22 cm' }),
    s05: P([it('나간 2시 30분', C(2, 30, 0, { sec: false })), it('온 시각 − 나간 시각', TV([3, 20, 15], [2, 30, null], '−', { runits: ['시간', '분', '초'] })), it('온 3시 20분 15초', C(3, 20, 15))]),
    s06: { k: 'tools', items: [{ name: '태민', kind: '220 mm · 50분 15초', on: true }, { name: '지아', kind: '210 mm · 40분' }, { name: '현우', kind: '195 mm · 30분' }, { name: '수빈', kind: '230 mm · 45분' }] }
  },
  u5_l10: {
    s04: P([it('mm ↔ cm ↔ m ↔ km', EQ(['1 cm = 10 mm', '1 m = 100 cm', '1 km = 1000 m'])), it('두 가지로', R(8, 3, '잎', { show: '8 cm 3 mm = 83 mm' }))]),
    s05: C(4, 10, 30, { show: true, names: true, note: '1분 = 60초 · 1시간 = 60분' }),
    s06: P([it('받아올림', TV([null, 50], [null, 30], '+', { units: ['분', '초'] })), it('받아내림', TV([1, 10], [null, 40], '−', { units: ['분', '초'] })), it('걸린 시간', EQ(['끝난 시각', '− 시작 시각', '= 걸린 시간']))])
  }
};
module.exports = F;
if (require.main === module) require('./augment7_lib.js')(require('path').join(__dirname, 'g3_math_u5.js'), F);
