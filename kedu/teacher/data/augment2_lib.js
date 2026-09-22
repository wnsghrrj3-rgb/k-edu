/* augment2_lib.js — ⑦발문(tnote) 증보 공용기. 밀도표준 v2 §5: 기존 본문 diff-0 — 이미 tnote 가 있는 슬라이드는 건너뛰고,
   없는 슬라이드의 data 맨 앞에 tnote 필드만 끼운다. 검산(실행·차시별 6슬 이상) 통과해야 파일을 쓴다. */
'use strict';
const fs = require('fs');
const vm = require('vm');
module.exports = function augment(FILE, T, opts) {
  opts = opts || {}; const MIN = opts.min || 6;
let src = fs.readFileSync(FILE, 'utf8');
let added = 0, skipped = 0, missing = [];
// 차시 구간 경계
const marks = [...src.matchAll(/LESSONS\["(u\d+_l[\w]+)"\]\s*=/g)].map(m => ({ key: m[1], at: m.index }));
function range(key) { const i = marks.findIndex(m => m.key === key); if (i < 0) return null; return [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : src.length]; }
for (const key of Object.keys(T)) {
  const rg = range(key); if (!rg) { missing.push(key); continue; }
  for (const sid of Object.keys(T[key])) {
    const seg = src.slice(rg[0], rg[1]);
    const re = new RegExp('"id":\\s*"' + sid + '"[\\s\\S]*?"data":\\s*\\{'); const m = seg.match(re);
    if (!m) { missing.push(key + '/' + sid); continue; }
    const at = rg[0] + m.index + m[0].length;
    // 이 슬라이드 data 안에 이미 tnote 가 있으면 건너뜀(데이터 diff-0)
    // data 객체의 끝을 중괄호 짝으로 정확히 찾는다(문자열 안 중괄호는 무시)
    let depth = 1, i = at, inStr = false, escp = false; while (i < src.length && depth > 0) { const ch = src[i]; if (inStr) { if (escp) escp = false; else if (ch === '\\') escp = true; else if (ch === '"') inStr = false; } else if (ch === '"') inStr = true; else if (ch === '{') depth++; else if (ch === '}') depth--; i++; }
    if (/"tnote"\s*:/.test(src.slice(at, i))) { skipped++; continue; }
    const n = T[key][sid];
    const ins = '\n        "tnote": ' + JSON.stringify(n) + ',';
    src = src.slice(0, at) + ins + src.slice(at); added++;
    // 경계 갱신
    marks.forEach(mk => { if (mk.at > at) mk.at += ins.length; }); rg[1] += ins.length;
  }
}
// 검산: 실행되는가 · 차시별 tnote 수
const L = {}; const ctx = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(src, ctx);
const report = Object.keys(L).map(k => k + ':' + (L[k].slides || []).filter(s => s.data && s.data.tnote).length).join(' ');
const under = Object.keys(L).filter(k => (L[k].slides || []).filter(s => s.data && s.data.tnote).length < 6);
console.log('tnote 추가', added, '· 이미 있음', skipped, '· 못 찾음', missing.length, missing.join(','));
console.log('차시별 tnote:', report);
if (under.length) { console.log('⛔ 6슬 미만:', under.join(',')); process.exit(1); }
fs.writeFileSync(FILE, src);
console.log('✅', require('path').basename(FILE), '갱신');
};
