/* augment4_lib.js — 2세대 7요소 증보 공용기(⑦발문 tnote + ③서사 kids + ②실사 img). 2026-09-22 베프.
   밀도표준 v2 §5: 기존 본문 diff-0 — 슬라이드 data 에 그 필드가 이미 있으면 건너뛰고, 없으면 data 맨 앞에 끼운다(삭제 0).
   NEWSLIDES 는 차시 안 지정 슬라이드 앞에 새 슬라이드를 통째로 끼운다(motivate 가 없는 차시용).
   검산(실행 · 차시별 tnote 6슬 이상 · motivate 마다 kids) 통과해야 파일을 쓴다. */
'use strict';
const fs = require('fs');
const vm = require('vm');
function run(src) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(src, c); return L; }
function marksOf(src) { return [...src.matchAll(/LESSONS\["(u\d+_l[\w]+)"\]\s*=/g)].map(m => ({ key: m[1], at: m.index })); }
function rangeOf(src, key) { const marks = marksOf(src); const i = marks.map(m => m.key).lastIndexOf(key); /* 같은 키가 두 번 정의된 파일(u4)은 실행 시 마지막 것이 이김 */ if (i < 0) return null; return [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length]; }
// data 객체 시작 위치(중괄호 뒤)와 끝 위치를 찾는다(문자열 안 중괄호는 무시)
function dataSpan(src, rg, sid) {
  const seg = src.slice(rg[0], rg[1]);
  const re = new RegExp('"id":\\s*"' + sid + '"[\\s\\S]*?"data":\\s*\\{'); const m = seg.match(re); if (!m) return null;
  const at = rg[0] + m.index + m[0].length;
  let depth = 1, i = at, inStr = false, escp = false; while (i < src.length && depth > 0) { const ch = src[i]; if (inStr) { if (escp) escp = false; else if (ch === '\\') escp = true; else if (ch === '"') inStr = false; } else if (ch === '"') inStr = true; else if (ch === '{') depth++; else if (ch === '}') depth--; i++; }
  return [at, i];
}
/* FIELDS: { lessonKey: { slideId: { tnote:{...}, kids:[...], img:'...' } } }
   NEWSLIDES: { lessonKey: [ { before:'s03', slide:{ id, stage, block, data } } ] } */
module.exports = function augment(FILE, FIELDS, NEWSLIDES, opts) {
  opts = opts || {}; const MIN = opts.min || 6;
  let src = fs.readFileSync(FILE, 'utf8');
  let added = 0, skipped = 0, missing = [], slides = 0;
  // ① 새 슬라이드 삽입(먼저 — 이후 필드 삽입이 새 슬라이드도 볼 수 있게)
  for (const key of Object.keys(NEWSLIDES || {})) {
    for (const ns of NEWSLIDES[key]) {
      const rg = rangeOf(src, key); if (!rg) { missing.push(key); continue; }
      const seg = src.slice(rg[0], rg[1]);
      if (new RegExp('"id":\\s*"' + ns.slide.id + '"').test(seg)) { skipped++; continue; }
      const re = new RegExp('\\n( {4,8})\\{\\n\\s+"id": "' + ns.before + '"'); const m = seg.match(re); if (!m) { missing.push(key + '/before ' + ns.before); continue; }
      const I = m[1];
      const obj = '\n' + I + JSON.stringify(ns.slide, null, 2).split('\n').join('\n' + I) + ',';
      const at = rg[0] + m.index; src = src.slice(0, at) + obj + src.slice(at); slides++;
    }
  }
  // ② 필드 삽입
  for (const key of Object.keys(FIELDS)) {
    for (const sid of Object.keys(FIELDS[key])) {
      const rg = rangeOf(src, key); if (!rg) { missing.push(key); break; }
      const span = dataSpan(src, rg, sid); if (!span) { missing.push(key + '/' + sid); continue; }
      const body = src.slice(span[0], span[1]); let f = FIELDS[key][sid]; if (f && f.ask) f = { tnote: f }; let ins = '';
      for (const name of Object.keys(f)) {
        if (new RegExp('"' + name + '"\\s*:').test(body)) { skipped++; continue; }
        ins += '\n        "' + name + '": ' + JSON.stringify(f[name]) + ','; added++;
      }
      if (ins) src = src.slice(0, span[0]) + ins + src.slice(span[0]);
    }
  }
  // ③ 검산
  const L = run(src);
  const cnt = k => (L[k].slides || []).filter(s => s.data && s.data.tnote).length;
  const under = Object.keys(L).filter(k => cnt(k) < MIN);
  const noKids = Object.keys(L).filter(k => (L[k].slides || []).some(s => s.block === 'motivate' && !(s.data && (s.data.kids || s.data.theme))));
  const noMot = Object.keys(L).filter(k => !(L[k].slides || []).some(s => s.block === 'motivate'));
  console.log(require('path').basename(FILE), '· 필드 추가', added, '· 이미 있음', skipped, '· 새 슬라이드', slides, '· 못 찾음', missing.length, missing.join(','));
  console.log(' 차시별 tnote:', Object.keys(L).map(k => k + ':' + cnt(k)).join(' '));
  if (under.length) { console.log(' ⛔ ' + MIN + '슬 미만:', under.join(',')); process.exit(1); }
  if (noKids.length) { console.log(' ⛔ motivate 에 kids 없음:', noKids.join(',')); process.exit(1); }
  if (noMot.length) { console.log(' ⛔ motivate 없는 차시:', noMot.join(',')); process.exit(1); }
  if (missing.length) { console.log(' ⛔ 못 찾은 자리가 있어 쓰지 않음'); process.exit(1); }
  fs.writeFileSync(FILE, src);
  console.log(' ✅', require('path').basename(FILE), '갱신');
};
