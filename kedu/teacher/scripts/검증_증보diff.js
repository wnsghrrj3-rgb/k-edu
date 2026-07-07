/* 검증_증보diff.js — 증보(L3) diff-0 자동 검증.
   기존 슬라이드 본문 변경 0 + 타 차시 무변경을 백업본 대비 확인.
   사용: node 검증_증보diff.js <data파일> <백업파일> <증보차시키>
   예: node 검증_증보diff.js ../data/g2_math_u3.js /tmp/g2_math_u3.bak.js u3_l05 */
'use strict';
const path = require('path');

function load(p) {
  global.window = {};
  delete require.cache[require.resolve(path.resolve(p))];
  require(path.resolve(p));
  return JSON.parse(JSON.stringify(global.window.LESSONS));
}

const [, , curPath, bakPath, augKey] = process.argv;
if (!curPath || !bakPath || !augKey) {
  console.error('사용: node 검증_증보diff.js <data> <backup> <증보차시키>');
  process.exit(2);
}

const NEW = load(curPath);
const OLD = load(bakPath);

let fail = 0;
const bad = m => { fail++; console.log('  ❌ ' + m); };
const good = m => console.log('  ✅ ' + m);

// 1) 증보 차시 외 전 차시 바이트 동일
const others = Object.keys(OLD).filter(k => k !== augKey);
const changed = others.filter(k => JSON.stringify(OLD[k]) !== JSON.stringify(NEW[k]));
changed.length ? bad('타 차시 변경됨: ' + changed.join(',')) : good('타 차시 무변경 (' + others.length + '차시)');

// 2) 차시 수 불변
Object.keys(OLD).length === Object.keys(NEW).length
  ? good('차시 수 불변 (' + Object.keys(NEW).length + ')')
  : bad('차시 수 변화: ' + Object.keys(OLD).length + '→' + Object.keys(NEW).length);

// 3) 증보 차시: 기존 슬라이드 본문 diff-0 (신규 필드만 허용)
const oldSlides = {}; (OLD[augKey].slides || []).forEach(s => oldSlides[s.id] = s);
const newSlides = {}; (NEW[augKey].slides || []).forEach(s => newSlides[s.id] = s);
const ALLOWED_NEW_FIELDS = ['tnote', 'img', 'items', 'from'];   // 증보 허용 신규 필드

let bodyViol = [];
Object.keys(oldSlides).forEach(id => {
  const o = oldSlides[id], n = newSlides[id];
  if (!n) { bodyViol.push(id + '(삭제됨)'); return; }
  if (o.block !== n.block) { bodyViol.push(id + '(block변경)'); return; }
  // 기존 data의 모든 키가 그대로 보존됐는지 (값 동일)
  Object.keys(o.data || {}).forEach(k => {
    if (JSON.stringify(o.data[k]) !== JSON.stringify((n.data || {})[k])) {
      bodyViol.push(id + '.data.' + k);
    }
  });
  // 새로 추가된 data 키는 허용 목록 안에서만
  Object.keys(n.data || {}).forEach(k => {
    if (!(k in (o.data || {})) && !ALLOWED_NEW_FIELDS.includes(k)) {
      bodyViol.push(id + '.data.' + k + '(비허용 신규필드)');
    }
  });
});
bodyViol.length ? bad('기존 슬라이드 본문 변경: ' + bodyViol.join(', ')) : good('기존 슬라이드 본문 diff-0 (' + Object.keys(oldSlides).length + '슬 보존)');

// 4) 삽입만 발생 (신규 슬라이드는 기존에 없던 id)
const inserted = Object.keys(newSlides).filter(id => !(id in oldSlides));
good('삽입 슬라이드: ' + (inserted.length ? inserted.join(',') : '없음'));

console.log(fail ? '\n❌ diff-0 위반 ' + fail + '건' : '\n✅ diff-0 통과');
process.exit(fail ? 1 : 0);
