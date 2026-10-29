/* parse_figs_g5s2_math.js — 5학년 2학기 수학 자기주도 원문 renderModels → 케이티처 그림 재료 JSON (211차, 베프 · 217차 2단원 · 218차 3단원 · 219차 4단원 · 220차 5단원 · 221차 6단원 부품 더함).
   원문 부품 라이브러리(rangeLine·rangeRow·valueChips·dialRow·numLineZoom·rangeTable·estRow) 호출을 그대로 실행하되,
   부품 함수를 「그림 명세를 돌려주는 함수」로 바꿔 끼워 2세대 부품(rgl·vch·rdial·nlz·rtb·est) 명세로 받는다.
   자리: m-iN = 도입 N번째 장(개념 장 번호 N−1) · m-eN = 전개 N번째 장(개념 장 번호 N+2) · m-qN = 문항(문제 번호 N−8).
   219차: 원문이 부품을 「+」로 이어 붙이는 자리(tenChain(…) + tenChain(…) · mulChain(…) + vMul(…))가 있어, 부품 함수는 명세를 글자 토큰으로 돌려주고
          innerHTML 에 넣는 순간 풀어 하나면 그 명세, 둘 이상이면 panels(col) 로 받는다 — 하나짜리 단원(1~3단원)은 결과가 그대로다.
   사용: node parse_figs_g5s2_math.js <단원 폴더> <out.json> */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const [dir, out] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => /^g5_math_u\d+_l\d+_.*\.html$/.test(f)).sort();
const res = {};
const tok = (o) => '\u0001' + JSON.stringify(o) + '\u0002';
const untokAll = (v) => { const out = [], re = /\u0001([\s\S]*?)\u0002/g; let m; while ((m = re.exec(String(v)))) out.push(JSON.parse(m[1])); return out; };
const untok = (v) => { const a = untokAll(v); if (a.length !== 1) throw new Error('부품 토큰 하나가 아님'); return a[0]; };
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
    // 218차 3단원 「합동과 대칭」 부품 — congFig·symFig·symGrid·figPick·corrRow·landCut → cgf·syf·sgd·fpk·crr·lcut
    congFig: (o) => Object.assign({ k: 'cgf' }, o), symFig: (o) => Object.assign({ k: 'syf' }, o), symGrid: (o) => Object.assign({ k: 'sgd' }, o),
    figPick: (items, o) => Object.assign({ k: 'fpk', items }, o || {}), corrRow: (rows, o) => Object.assign({ k: 'crr', rows }, o || {}), landCut: (o) => Object.assign({ k: 'lcut' }, o),
    // 219차 4단원 「소수의 곱셈」 부품 — calcLines·tenChain·estCard·jumpLine·mulChain·vMul·vMulRow·partBar·decArea·dataTable → cll·tnc·ecd·jml·mch·vml·(panels)·pbr·dar·dtb
    calcLines: (rows, o) => Object.assign({ k: 'cll', rows }, o || {}), tenChain: (items, o) => Object.assign({ k: 'tnc', items }, o || {}),
    estCard: (o) => Object.assign({ k: 'ecd' }, o), jumpLine: (o) => Object.assign({ k: 'jml' }, o), mulChain: (rows, o) => Object.assign({ k: 'mch', rows }, o || {}),
    vMul: (a, b, o) => Object.assign({ k: 'vml', a: String(a), b: String(b) }, o || {}), vMulRow: (items) => ({ k: 'panels', items: items.map(untok).map(f => ({ fig: f })) }),
    partBar: (o) => Object.assign({ k: 'pbr' }, o), decArea: (o) => Object.assign({ k: 'dar' }, o), dataTable: (head, rows, o) => Object.assign({ k: 'dtb', head, rows }, o || {}),
    // 220차 5단원 「직육면체」 부품 — boxIso·boxRow·boxNet·netPick·diceProg → bxi·bxr·bxn·npk·dpg (fracChips·calcLines·dataTable 은 앞 부품 그대로)
    boxIso: (o) => Object.assign({ k: 'bxi' }, o), boxRow: (items, o) => Object.assign({ k: 'bxr', items }, o || {}), boxNet: (o) => Object.assign({ k: 'bxn' }, o),
    netPick: (items, o) => Object.assign({ k: 'npk', items }, o || {}), diceProg: (o) => Object.assign({ k: 'dpg' }, o),
    // 221차 6단원 「평균과 가능성」 부품 — avgBar·stripFold·barChart·ballBox·spinner·chanceLine·u6Row → abr·sfd·bch·bbx·spn·chl·u6r (fracChips·calcLines·dataTable 은 앞 부품 그대로)
    avgBar: (o) => Object.assign({ k: 'abr' }, o), stripFold: (vals, o) => Object.assign({ k: 'sfd', vals }, o || {}), barChart: (o) => Object.assign({ k: 'bch' }, o),
    ballBox: (o) => Object.assign({ k: 'bbx' }, o), spinner: (o) => Object.assign({ k: 'spn' }, o), chanceLine: (o) => Object.assign({ k: 'chl' }, o || {}),
    u6Row: (items, o) => Object.assign({ k: 'u6r', items: items.map(untok) }, o || {}),
    document: { getElementById: (id) => { const o = {}; Object.defineProperty(o, 'innerHTML', { set: (v) => { const a = untokAll(v); got[id] = a.length === 1 ? a[0] : { k: 'panels', col: true, items: a.map(f => ({ fig: f })) }; } }); return o; } }
  };
  Object.keys(ctx).forEach(n => { if (n !== 'document') { const f = ctx[n]; ctx[n] = (...a) => tok(f(...a)); } });
  vm.createContext(ctx); vm.runInContext(body, ctx);
  const slides = {}, problems = {};
  Object.keys(got).forEach(id => { const a = id.match(/^m-([ieq])(\d+)$/); if (!a) return; const n = +a[2];
    if (a[1] === 'i') slides[n - 1] = got[id]; else if (a[1] === 'e') slides[n + 2] = got[id]; else problems[n - 8] = got[id]; });
  res[key] = JSON.parse(JSON.stringify({ slides, problems }));
});
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log(out, Object.keys(res).length, '차시 · 개념 그림', Object.values(res).reduce((a, r) => a + Object.keys(r.slides).length, 0), '· 문제 그림', Object.values(res).reduce((a, r) => a + Object.keys(r.problems).length, 0));
