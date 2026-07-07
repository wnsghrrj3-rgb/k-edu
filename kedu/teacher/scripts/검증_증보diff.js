/* 검증_증보diff.js — 증보(L3) diff-0 자동 검증.
   기존 슬라이드 본문 변경 0 + 증보 대상 외 차시 무변경을 백업본 대비 확인.
   사용: node 검증_증보diff.js <data파일> <백업파일> <증보차시키...(쉼표 또는 복수 인자)>
   예1(단일): node 검증_증보diff.js ../data/g2_math_u3.js /tmp/g2_math_u3.bak.js u3_l05
   예2(전단원): node 검증_증보diff.js ../data/g2_math_u1.js /tmp/g2_math_u1.bak.js "u1_l01,...,u1_l09"
   예3(전단원 간편): 세 번째 인자에 "*" → 모든 차시가 증보 대상(타차시 검사 생략) */
'use strict';
const path = require('path');

function load(p) {
  global.window = {};
  delete require.cache[require.resolve(path.resolve(p))];
  require(path.resolve(p));
  return JSON.parse(JSON.stringify(global.window.LESSONS));
}

const [, , curPath, bakPath, augArg] = process.argv;
if (!curPath || !bakPath || !augArg) {
  console.error('사용: node 검증_증보diff.js <data> <backup> <증보차시키(쉼표구분 또는 *)>');
  process.exit(2);
}

const NEW = load(curPath);
const OLD = load(bakPath);
const augKeys = augArg === '*' ? Object.keys(OLD) : augArg.split(',').map(s => s.trim());

let fail = 0;
const bad = m => { fail++; console.log('  ❌ ' + m); };
const good = m => console.log('  ✅ ' + m);

// 1) 증보 대상 외 전 차시 바이트 동일
const others = Object.keys(OLD).filter(k => !augKeys.includes(k));
if (others.length) {
  const changed = others.filter(k => JSON.stringify(OLD[k]) !== JSON.stringify(NEW[k]));
  changed.length ? bad('증보대상 외 차시 변경됨: ' + changed.join(',')) : good('증보대상 외 무변경 (' + others.length + '차시)');
} else {
  good('전 차시가 증보 대상 (타차시 검사 생략)');
}

// 2) 차시 수 불변
Object.keys(OLD).length === Object.keys(NEW).length
  ? good('차시 수 불변 (' + Object.keys(NEW).length + ')')
  : bad('차시 수 변화: ' + Object.keys(OLD).length + '→' + Object.keys(NEW).length);

// 3) 각 증보 차시: 기존 슬라이드 본문 diff-0 (신규 필드만 허용)
const ALLOWED_NEW_FIELDS = ['tnote', 'img', 'items', 'from'];
let bodyViol = [];
let insertedTotal = 0, preservedTotal = 0;
augKeys.forEach(augKey => {
  if (!OLD[augKey]) { bad(augKey + ' 백업에 없음'); return; }
  const oldSlides = {}; (OLD[augKey].slides || []).forEach(s => oldSlides[s.id] = s);
  const newSlides = {}; (NEW[augKey].slides || []).forEach(s => newSlides[s.id] = s);
  Object.keys(oldSlides).forEach(id => {
    const o = oldSlides[id], n = newSlides[id];
    if (!n) { bodyViol.push(augKey + ':' + id + '(삭제)'); return; }
    if (o.block !== n.block) { bodyViol.push(augKey + ':' + id + '(block변경)'); return; }
    preservedTotal++;
    Object.keys(o.data || {}).forEach(k => {
      if (JSON.stringify(o.data[k]) !== JSON.stringify((n.data || {})[k])) bodyViol.push(augKey + ':' + id + '.data.' + k);
    });
    Object.keys(n.data || {}).forEach(k => {
      if (!(k in (o.data || {})) && !ALLOWED_NEW_FIELDS.includes(k)) bodyViol.push(augKey + ':' + id + '.data.' + k + '(비허용)');
    });
  });
  insertedTotal += Object.keys(newSlides).filter(id => !(id in oldSlides)).length;
});
bodyViol.length ? bad('기존 슬라이드 본문 변경: ' + bodyViol.join(', ')) : good('기존 슬라이드 본문 diff-0 (' + preservedTotal + '슬 보존)');
good('삽입 슬라이드 총 ' + insertedTotal + '개');

console.log(fail ? '\n❌ diff-0 위반 ' + fail + '건' : '\n✅ diff-0 통과');
process.exit(fail ? 1 : 0);
