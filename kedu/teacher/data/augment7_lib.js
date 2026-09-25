/* augment7_lib.js — 2세대 21차 「개념 그림 층」 증보 공용기. 2026-09-25 베프.
   augment2_lib 방식: 지정한 슬라이드의 data 맨 앞에 "fig" 한 칸만 끼운다. 이미 fig 가 있으면 건너뜀(데이터 diff-0).
   JSON 꼴·한 줄 압축 꼴(키 따옴표 유무 무관) 모두 자리를 찾는다(augment6 dataSpan 과 같은 규칙).
   검산 통과해야만 파일을 쓴다: ① 실행 ② 지정한 자리 전부 fig 실존 ③ KT2_FIG.render 가 빈 글자가 아님(부품 이름 오타 0)
   ④ 못 찾은 자리 0 ⑤ 그 밖의 슬라이드 data 는 한 글자도 안 바뀜(fig 를 걷어 내면 원본과 같다). */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
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
function figLib() { const g = {}; const c = { window: g, globalThis: g }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(__dirname, '../stage2/stage2-fig.js'), 'utf8'), c); return c.window.KT2_FIG || c.globalThis.KT2_FIG; }
module.exports = function augment(FILE, F) {
  const before = fs.readFileSync(FILE, 'utf8'); let src = before;
  let added = 0, skipped = 0; const missing = [];
  for (const key of Object.keys(F)) for (const sid of Object.keys(F[key])) {
    const rg = rangeOf(src, key); if (!rg) { missing.push(key); continue; }
    const sp = dataSpan(src, rg, sid); if (!sp) { missing.push(key + '/' + sid); continue; }
    if (/^\s*"?fig"?\s*:/.test(src.slice(sp[0], sp[1])) || /[{,]\s*"?fig"?\s*:/.test(src.slice(sp[0] - 1, sp[1]))) { skipped++; continue; }
    const ins = '"fig": ' + JSON.stringify(F[key][sid]) + ', ';
    src = src.slice(0, sp[0]) + ins + src.slice(sp[0]); added++;
  }
  // 검산
  const L = run(src), L0 = run(before), FIG = figLib(); const bad = [];
  for (const key of Object.keys(F)) for (const sid of Object.keys(F[key])) {
    const s = ((L[key] || {}).slides || []).find(x => x.id === sid);
    if (!s || !s.data || !s.data.fig) { bad.push(key + '/' + sid + ' fig 없음'); continue; }
    if (!FIG.render(s.data.fig)) bad.push(key + '/' + sid + ' 그림 빈 글자');
  }
  for (const key of Object.keys(L0)) (L0[key].slides || []).forEach((s0, i) => {
    const s1 = L[key].slides[i]; const d1 = Object.assign({}, s1.data); if (!(s0.data && 'fig' in s0.data)) delete d1.fig;
    if (JSON.stringify(s0) !== JSON.stringify(Object.assign({}, s1, { data: d1 }))) bad.push(key + '/' + s0.id + ' 원본 달라짐');
  });
  console.log('fig 추가', added, '· 이미 있음', skipped, '· 못 찾음', missing.length, missing.join(','));
  if (missing.length || bad.length) { console.log('⛔', bad.slice(0, 10).join(' | ')); process.exit(1); }
  fs.writeFileSync(FILE, src); console.log('✅', path.basename(FILE), '갱신');
};
