/* ============================================================
   test_stencil.js — 도안 인쇄(KST) 12종 규격 + 렌더 검산
   ============================================================ */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'stencil', 'index.html'), 'utf8');
const m = html.match(/window\.KST=\(function\(\)\{[\s\S]*?\n\}\)\(\);/);
if (!m) { console.log('KST 블록 없음'); process.exit(1); }
const w = {};
new Function('window', m[0])(w);
const K = w.KST;

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
}
const allCombos = (item) => {
  const keys = (item.opts || []).map(o => o.k);
  let combos = [{}];
  (item.opts || []).forEach(o => { const next = []; combos.forEach(c => o.values.forEach(v => next.push(Object.assign({}, c, { [o.k]: v[0] })))); combos = next; });
  return combos;
};

console.log('[1] 도안 규격');
const I = K.ITEMS;
t('도안 12종', I.length === 12);
t('id 유일', new Set(I.map(d => d.id)).size === I.length);
t('제목·이모지·학년·설명 완비', I.every(d => d.title && d.emoji && d.grades && d.desc));
t('옵션 기본값이 값 목록 안에 있음', I.every(d => (d.opts || []).every(o => o.values.some(v => v[0] === o.def))));
t('옵션 키 유일', I.every(d => new Set((d.opts || []).map(o => o.k)).size === (d.opts || []).length));

console.log('[2] 렌더 — 모든 조합');
let total = 0, bad = [];
I.forEach(d => allCombos(d).forEach(opts => ['p', 'l'].forEach(orient => [true, false].forEach(name => {
  total++;
  let r; try { r = K.render({ id: d.id, opts, seed: 3, orient, name }); } catch (e) { bad.push(d.id + ' ' + JSON.stringify(opts) + ' ' + orient + ' ' + e.message); return; }
  if (!r || !/^<svg[\s\S]*<\/svg>$/.test(r.svg)) bad.push(d.id + ' svg 아님');
  if (r && !(orient === 'p' ? r.w === 210 && r.h === 297 : r.w === 297 && r.h === 210)) bad.push(d.id + ' A4 아님');
  if (r && /NaN|undefined/.test(r.svg)) bad.push(d.id + ' NaN/undefined ' + JSON.stringify(opts));
  if (r && !/id="content">[\s\S]{200,}/.test(r.svg)) bad.push(d.id + ' 내용 빈약 ' + JSON.stringify(opts));
}))));
t(`전 조합 렌더 (${total}건)`, bad.length === 0);
if (bad.length) console.log('    ' + bad.slice(0, 8).join('\n    '));

console.log('[3] 결정성·변형');
t('같은 시드 = 같은 결과', I.every(d => K.render({ id: d.id, seed: 5 }).svg === K.render({ id: d.id, seed: 5 }).svg));
const seeded = ['sym', 'enlarge', 'mandala', 'band', 'persp'];
t('시드형 도안은 시드가 바뀌면 달라짐(시드 1~6 중 변형 존재)', seeded.every(id => { const o = id === 'sym' ? { shape: 'free' } : {}; const set = new Set([1, 2, 3, 4, 5, 6].map(seed => K.render({ id, seed, opts: o }).svg)); return set.size > 1; }));
t('세로/가로 크기 다름', K.render({ id: 'wheel', orient: 'p' }).svg !== K.render({ id: 'wheel', orient: 'l' }).svg);
t('이름칸 없으면 이름 글자 없음', !/이름/.test(K.render({ id: 'wheel', name: false }).svg) && /이름/.test(K.render({ id: 'wheel', name: true }).svg));
t('없는 id → null', K.render({ id: 'nope' }) === null);

console.log('[4] 내용 검산');
t('색상환 완성본 24색 = hsl 24개', (K.render({ id: 'wheel', opts: { n: '24', mode: 'full' } }).svg.match(/hsl\(/g) || []).length === 24);
t('색상환 기준색 = 3칸만 색', (K.render({ id: 'wheel', opts: { n: '12', mode: 'prim' } }).svg.match(/hsl\(/g) || []).length === 3);
t('명암 7단계 = 양끝 2칸만 채움', (K.render({ id: 'value', opts: { n: '7', shape: 'none' } }).svg.match(/fill="rgb\(/g) || []).length === 2);
t('전개도 4종 모두 접는 선·풀칠면 있음', ['cube', 'prism', 'tetra', 'pyramid'].every(s => { const v = K.render({ id: 'net', opts: { solid: s } }).svg; return /stroke-dasharray="2,1.5"/.test(v) && /url\(#hatch\)/.test(v); }));
t('픽셀 32×32 좌표 라벨은 홀수만(겹침 방지)', !/>2<\/text>/.test(K.render({ id: 'pixel', opts: { n: '32', coord: 'on' } }).svg.split('id="content"')[1].split('색 계획')[0]));
t('무늬 띠 세 규칙 라벨', (() => { const v = K.render({ id: 'band', opts: { rules: 'all' } }).svg; return /반복/.test(v) && /대칭/.test(v) && /회전/.test(v); })());
t('2점 투시 = 소실점 2개', (K.render({ id: 'persp', opts: { pts: '2' } }).svg.match(/>소실점<\/text>/g) || []).length === 2);

console.log('[5] 정적');
const banned = ['박음', '결로', '빵꾸', '갈아엎'];
t('차단 어휘 없음', banned.every(b => !html.includes(b)));
t('공용 복귀·GA 배선', /kedu_back\.js/.test(html) && /kedu_ga\.js/.test(html));
t('인쇄 CSS @page 동적 주입', /@page\{size:A4/.test(html) && /@media print/.test(html));

console.log(`\n${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
