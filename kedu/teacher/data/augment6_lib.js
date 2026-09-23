/* augment6_lib.js — 2세대 7요소 증보 공용기 v4. 2026-09-22 베프(12차). augment5_lib 후속.
   달라진 점: 생성기(g3·g1 수학)가 쓰는 **한 줄 압축 꼴** `{id:"s15", stage:…}`(키 따옴표 유무 무관)도 자리를 찾고,
   새 슬라이드도 같은 한 줄 꼴로 끼운다. JSON 꼴(augment4·5)은 그대로 된다. 나머지는 augment5_lib 과 같다.
   (원문 augment5_lib 머리 →)
   달라진 점 ① 슬라이드 수준 tnote(1세대 40분 증보가 slide.tnote 로 둔 것)가 있는 슬라이드에 data.tnote 를 넣을 때
     기존 ask 를 앞에 이어 붙이고 watch 는 「·」로 병기한다(2세대는 data.tnote 가 이기므로 옛 발문이 사라지지 않게). 삭제 0.
   ② OFFLINE: ④교실 활동 슬라이드를 첫 정리 슬라이드 앞에 통째로 끼운다(이미 offline_activity 가 있는 차시는 건너뜀).
   ③ NEWSLIDES: motivate 가 없는 차시에 새 슬라이드(augment4 와 같음).
   검산(실행 · 차시별 tnote 6슬↑(data 또는 slide) · motivate 마다 kids · OFFLINE 지정 차시에 offline 실존 · 못 찾은 자리 0) 통과해야 파일을 쓴다. */
'use strict';
const fs = require('fs');
const vm = require('vm');
function run(src) { const L = {}; const c = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; c.window.window = c.window; vm.createContext(c); vm.runInContext(src, c); return L; }
function marksOf(src) { return [...src.matchAll(/LESSONS\["(u\d+_l[\w]+)"\]\s*=/g)].map(m => ({ key: m[1], at: m.index })); }
function rangeOf(src, key) { const marks = marksOf(src); const i = marks.map(m => m.key).lastIndexOf(key); if (i < 0) return null; return [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length]; }
function dataSpan(src, rg, sid) {
  const seg = src.slice(rg[0], rg[1]);
  const re = new RegExp('"?id"?:\\s*"' + sid + '"[\\s\\S]*?"?data"?:\\s*\\{'); const m = seg.match(re); if (!m) return null;
  const at = rg[0] + m.index + m[0].length;
  let depth = 1, i = at, inStr = false, escp = false; while (i < src.length && depth > 0) { const ch = src[i]; if (inStr) { if (escp) escp = false; else if (ch === '\\') escp = true; else if (ch === '"') inStr = false; } else if (ch === '"') inStr = true; else if (ch === '{') depth++; else if (ch === '}') depth--; i++; }
  return [at, i];
}
function insertBefore(src, key, beforeId, slideObj) {
  const rg = rangeOf(src, key); if (!rg) return null;
  const seg = src.slice(rg[0], rg[1]);
  let re = new RegExp('\\n( {2,8})\\{\\n\\s+"id": "' + beforeId + '"'); let m = seg.match(re); let obj;
  if (m) { obj = '\n' + m[1] + JSON.stringify(slideObj, null, 2).split('\n').join('\n' + m[1]) + ','; }
  else { re = new RegExp('\\n( {2,8})\\{"?id"?:\\s*"' + beforeId + '"'); m = seg.match(re); if (!m) return null; obj = '\n' + m[1] + JSON.stringify(slideObj) + ','; }
  const at = rg[0] + m.index; return src.slice(0, at) + obj + src.slice(at);
}
const uniq = a => a.filter((x, i) => a.indexOf(x) === i);
/* FIELDS: { lessonKey: { slideId: { tnote:{ask,watch,min}, kids:[...], img:'...' } | {ask,watch,min} } }
   NEWSLIDES: { lessonKey: [ { before:'s03', slide:{ id, stage, block, data } } ] }
   OFFLINE: { lessonKey: { id, title, tag, type, icon, goal, steps, materials, minutes, tnote } } */
module.exports = function augment(FILE, FIELDS, NEWSLIDES, OFFLINE, opts) {
  opts = opts || {}; const MIN = opts.min || 6;
  let src = fs.readFileSync(FILE, 'utf8');
  let added = 0, skipped = 0, merged = 0, missing = [], slides = 0, offl = 0;
  // ① 새 슬라이드
  for (const key of Object.keys(NEWSLIDES || {})) for (const ns of NEWSLIDES[key]) {
    const rg = rangeOf(src, key); if (!rg) { missing.push(key); continue; }
    if (new RegExp('"id":\\s*"' + ns.slide.id + '"').test(src.slice(rg[0], rg[1]))) { skipped++; continue; }
    const out = insertBefore(src, key, ns.before, ns.slide); if (!out) { missing.push(key + '/before ' + ns.before); continue; }
    src = out; slides++;
  }
  // ② 교실 활동
  const L0 = run(src);
  for (const key of Object.keys(OFFLINE || {})) {
    const les = L0[key]; if (!les) { missing.push(key); continue; }
    if (les.slides.some(s => s.block === 'offline_activity')) { skipped++; continue; }
    const first = les.slides.find(s => s.stage === '정리'); if (!first) { missing.push(key + '/정리 없음'); continue; }
    const sp = OFFLINE[key]; const d = Object.assign({}, sp); delete d.id;
    const out = insertBefore(src, key, first.id, { id: sp.id, stage: '응용문제', block: 'offline_activity', data: d }); if (!out) { missing.push(key + '/before ' + first.id); continue; }
    src = out; offl++;
  }
  // ③ 필드(슬라이드 수준 tnote 병합)
  const L1 = run(src);
  for (const key of Object.keys(FIELDS)) for (const sid of Object.keys(FIELDS[key])) {
    const rg = rangeOf(src, key); if (!rg) { missing.push(key); break; }
    const span = dataSpan(src, rg, sid); if (!span) { missing.push(key + '/' + sid); continue; }
    const body = src.slice(span[0], span[1]); let f = FIELDS[key][sid]; if (f && f.ask) f = { tnote: f }; let ins = '';
    const sl = L1[key] && L1[key].slides.find(s => s.id === sid);
    for (const name of Object.keys(f)) {
      if (new RegExp('"' + name + '"\\s*:').test(body)) { skipped++; continue; }
      let v = f[name];
      if (name === 'tnote' && sl && sl.tnote) {
        const o = sl.tnote; v = { ask: uniq([].concat(o.ask || [], v.ask || [])), watch: [o.watch, v.watch].filter(Boolean).join(' · '), min: Math.max(o.min || 0, v.min || 0) || undefined }; merged++;
      }
      ins += '\n        "' + name + '": ' + JSON.stringify(v) + ','; added++;
    }
    if (ins) src = src.slice(0, span[0]) + ins + src.slice(span[0]);
  }
  // ④ 검산
  const L = run(src);
  const cnt = k => (L[k].slides || []).filter(s => (s.data && s.data.tnote) || s.tnote).length;
  const under = Object.keys(L).filter(k => cnt(k) < MIN);
  const noKids = Object.keys(L).filter(k => (L[k].slides || []).some(s => s.block === 'motivate' && !(s.data && (s.data.kids || s.data.theme))));
  const noMot = Object.keys(L).filter(k => !(L[k].slides || []).some(s => s.block === 'motivate'));
  const noOff = Object.keys(OFFLINE || {}).filter(k => !(L[k] && L[k].slides.some(s => s.block === 'offline_activity')));
  console.log(require('path').basename(FILE), '· 필드 추가', added, '(병합', merged + ') · 이미 있음', skipped, '· 새 슬라이드', slides, '· 교실 활동', offl, '· 못 찾음', missing.length, missing.join(','));
  console.log(' 차시별 tnote:', Object.keys(L).map(k => k + ':' + cnt(k)).join(' '));
  let bad = false;
  if (under.length) { console.log(' ⛔ ' + MIN + '슬 미만:', under.join(',')); bad = true; }
  if (noKids.length) { console.log(' ⛔ motivate 에 kids 없음:', noKids.join(',')); bad = true; }
  if (noMot.length) { console.log(' ⛔ motivate 없는 차시:', noMot.join(',')); bad = true; }
  if (noOff.length) { console.log(' ⛔ 교실 활동 못 넣음:', noOff.join(',')); bad = true; }
  if (missing.length) { console.log(' ⛔ 못 찾은 자리가 있어 쓰지 않음'); bad = true; }
  if (bad) process.exit(1);
  fs.writeFileSync(FILE, src);
  console.log(' ✅', require('path').basename(FILE), '갱신');
};
