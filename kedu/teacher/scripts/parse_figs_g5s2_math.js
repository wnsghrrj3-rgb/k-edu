/* parse_figs_g5s2_math.js — 5학년 2학기 수학 자기주도 원문 renderModels → 케이티처 그림 재료 JSON (211차, 베프 · 217차 2단원 부품 더함).
   원문 부품 라이브러리(rangeLine·rangeRow·valueChips·dialRow·numLineZoom·rangeTable·estRow) 호출을 그대로 실행하되,
   부품 함수를 「그림 명세를 돌려주는 함수」로 바꿔 끼워 2세대 부품(rgl·vch·rdial·nlz·rtb·est) 명세로 받는다.
   자리: m-iN = 도입 N번째 장(개념 장 번호 N−1) · m-eN = 전개 N번째 장(개념 장 번호 N+2) · m-qN = 문항(문제 번호 N−8).
   사용: node parse_figs_g5s2_math.js <단원 폴더> <out.json> */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const [dir, out] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => /^g5_math_u\d+_l\d+_.*\.html$/.test(f)).sort();
const res = {};
files.forEach(f => {
  const m = f.match(/_u(\d+)_l(\d+)_/), key = 'u' + (+m[1]) + '_l' + m[2].padStart(2, '0');
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  const i = src.indexOf('(function renderModels(){'); if (i < 0) { res[key] = { slides: {}, problems: {} }; return; }
  const j = src.indexOf('})();', i); const body = src.slice(i, j + 5);
  const got = {};
  const ctx = {
    rangeLine: (o) => ({ k: 'rgl', rows: [o] }), rangeRow: (items, o) => Object.assign({ k: 'rgl', rows: items }, o && o.note ? { note: o.note } : {}),
    valueChips: (items, o) => Object.assign({ k: 'vch', items }, o || {}), dialRow: (items, o) => Object.assign({ k: 'rdial', items }, o && o.note ? { note: o.note } : {}),
    numLineZoom: (o) => Object.assign({ k: 'nlz' }, o), rangeTable: (rows, o) => Object.assign({ k: 'rtb', rows }, o || {}), estRow: (rows, o) => Object.assign({ k: 'est', rows }, o || {}),
    // 217차 2단원 「분수의 곱셈」 부품 — fracChips·fracLines·mulLine·mulCalc·wayCards·opBar·cmpMul·mixRect·areaGrid → fch·fln·mln·mcc·wyc·opb·cmm·mxr·agr
    fracChips: (items, o) => Object.assign({ k: 'fch', items }, o || {}), fracLines: (rows, o) => Object.assign({ k: 'fln', rows }, o || {}),
    mulLine: (o) => Object.assign({ k: 'mln' }, o), mulCalc: (rows, o) => Object.assign({ k: 'mcc', rows }, o || {}), wayCards: (items, o) => Object.assign({ k: 'wyc', items }, o || {}),
    opBar: (o) => Object.assign({ k: 'opb' }, o), cmpMul: (o) => Object.assign({ k: 'cmm' }, o), mixRect: (o) => Object.assign({}, o, { k: 'mxr', cols: o.k }), areaGrid: (o) => Object.assign({ k: 'agr' }, o),
    document: { getElementById: (id) => { const o = {}; Object.defineProperty(o, 'innerHTML', { set: (v) => { got[id] = v; } }); return o; } }
  };
  vm.createContext(ctx); vm.runInContext(body, ctx);
  const slides = {}, problems = {};
  Object.keys(got).forEach(id => { const a = id.match(/^m-([ieq])(\d+)$/); if (!a) return; const n = +a[2];
    if (a[1] === 'i') slides[n - 1] = got[id]; else if (a[1] === 'e') slides[n + 2] = got[id]; else problems[n - 8] = got[id]; });
  res[key] = JSON.parse(JSON.stringify({ slides, problems }));
});
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log(out, Object.keys(res).length, '차시 · 개념 그림', Object.values(res).reduce((a, r) => a + Object.keys(r.slides).length, 0), '· 문제 그림', Object.values(res).reduce((a, r) => a + Object.keys(r.problems).length, 0));
