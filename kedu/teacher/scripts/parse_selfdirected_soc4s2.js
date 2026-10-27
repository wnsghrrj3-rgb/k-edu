/* parse_selfdirected_soc4s2.js — 자기주도 사회 4-2(g4_social, 머리 주석 「… · N차시(lXX)」·「N~M차시(lXX)」) → 케이티처 재료 JSON (208차, 베프).
   4-1 추출기(parse_selfdirected_soc4.js · 무개변)를 그대로 쓰고, 4-2 원문은 지도서 차시가 머리 둘째 줄 「N차시(lXX)」에 있어
   키를 **차시 번호**(묶음은 첫 번호 — 5~6 → u1_l05)로 다시 단다 · file_key = 원문 파일 키 · title 의 「 · 사회 4-2」 뗌.
   셋째 인자 「l01=1~2」 꼴로 차시를 덮어쓸 수 있음(단원 도입 1차시를 첫 파일에 더하는 경우 — 4-1 사회 l01 = 1·2 처리와 같음).
   (build_projmap.js 는 재료 키를 그대로 케이티처 키로 쓰므로 반드시 차시 번호 키여야 함)
   사용: NODE_PATH=/home/claude/.jsdom/node_modules node parse_selfdirected_soc4s2.js <단원 폴더> <out.json> [l01=1~2,...] */
const fs = require('fs');
const path = require('path');
const { parse } = require('./parse_selfdirected_soc4.js');
const [d, o, ov] = process.argv.slice(2);
const OV = {}; (ov || '').split(',').filter(Boolean).forEach(x => { const [k, v] = x.split('='); OV[k] = v; });
const U = +(path.basename(d).match(/^(\d+)단원/) || [0, 0])[1];
const files = fs.readdirSync(d).filter(f => /^g\d_\w+_u\d+_l\d+.*\.html$/.test(f)).sort();
const res = {};
files.forEach(f => {
  const s = parse(path.join(d, f)); const head = fs.readFileSync(path.join(d, f), 'utf8').slice(0, 600);
  const fk = f.match(/_(u\d+_l\d+)_/)[1];
  const m = head.match(/(\d+(?:~\d+)?)차시\(l\d+/); const n = OV[fk.split('_')[1]] || (m && m[1]); if (!n) throw new Error(f + ' 차시 주석 없음');
  const [a, z] = n.split('~').map(Number); s.n = n; s.covers = Array.from({ length: (z || a) - a + 1 }, (_, i) => a + i); s.file_key = fk;
  s.title = s.title.replace(/\s*·\s*사회 4-2\s*$/, '').trim();
  res['u' + U + '_l' + String(a).padStart(2, '0')] = s;
});
fs.writeFileSync(o, JSON.stringify(res, null, 1));
const ks = Object.keys(res);
console.log(o, ks.length, '차시 키', ks.join(','), '·', ks.reduce((a, k) => a + res[k].covers.length, 0), '차시 ·', ks.reduce((a, k) => a + res[k].slides.length, 0), '장', ks.reduce((a, k) => a + res[k].problems.length, 0), '문제');
