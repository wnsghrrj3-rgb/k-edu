/* ============================================================
   test-round137.mjs — R137 SVG 템플릿 파서 (MK_TPLSVG)
   ------------------------------------------------------------
   준호: 「GPT가 만든 템플릿 팩을 케이메이커에 적용」.
   지시서의 계약은 한 줄이다 — SVG 를 이미지 한 장으로 붙이지 말고
   text·rect·circle 등을 개별 편집 가능한 요소로 푼다. 그래서 이 라운드가
   재는 것도 「붙었는가」가 아니라 「풀렸는가」다.
   · 팩 5종 전부 실파싱 — 요소 스키마 적합·좌표 범위·결정성
   · 카탈로그 크기와 실제 viewBox 일치 (메타가 거짓말하면 씬이 찌그러진다)
   · 씬 적용 왕복 — width·height·background·요소 수
   · 배선 계약: 템플릿 패널·그리드·클릭·갈래 칩, index 스크립트 2곳
   · radius 는 씬 px 로 해석돼야 한다 — 내보내기(render.js)가 이미 그렇게
     읽는데 화면만 화면 px 이라 줌에서 둘이 어긋나 있었다
   · §5① 전제 가드: tplsvg.js 부재 = 통과가 아니라 실패
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const dom = new JSDOM('');
global.window = {};
require('./data/sample.js'); require('./data/animations.js'); require('./data/easy.js');
require('./data/tplsvg.js');
const T = window.MK_TPLSVG;
const opts = { DOMParser: dom.window.DOMParser, XMLSerializer: dom.window.XMLSerializer };
let bad = 0;
const PACK_FILES = fs.readdirSync('./data').filter((f) => /^svgpack\d+\.js$/.test(f)).sort().map((f) => './data/' + f);
if (!fs.existsSync('./data/tplsvg.js')) { console.log('❌ tplsvg.js 없음 — 전제 실패'); process.exit(1); }
for (const t of T.CATALOG) {
  const f = 'assets/templates/' + t.pack + '/' + t.file;
  if (!fs.existsSync(f)) { console.log('❌ 파일 없음', f); bad++; continue; }
  const a = T.audit(fs.readFileSync(f, 'utf8'), opts);
  const p = T.parse(fs.readFileSync(f, 'utf8'), opts);
  if (!a.ok) { console.log('❌', t.id, a.violations); bad++; }
  // 카탈로그 크기와 실제 SVG 크기 일치
  if (p.width !== t.width || p.height !== t.height) { console.log('❌ 크기 불일치', t.id, p.width + 'x' + p.height, 'vs', t.width + 'x' + t.height); bad++; }
  // 씬 적용
  const doc = { scenes: [{ id: 's', width: 1280, height: 720, background: '#fff', elements: [] }] };
  const r = T.applyTo(doc, 0, p, t);
  const s = doc.scenes[0];
  if (!r.ok || s.elements.length !== p.elements.length || s.width !== t.width) { console.log('❌ 적용', t.id, r); bad++; }
  console.log((a.ok ? '✅' : '❌'), (t.pack + ' ' + t.id).padEnd(30), `요소 ${a.count}개 (편집가능 ${a.native} · 조각 ${a.frags})`, '씬', s.width + '×' + s.height, s.background);
  if (p.notes.length) p.notes.forEach((n) => console.log('      · ' + n));
}

/* ---- 굳힌 팩(tplpack01.js) 드리프트 — build 를 재실행해 커밋본과 비교 ---- */
{
  const mod = await import('./tplpack-build.mjs');
  for (const k of mod.packs()) {
    const out = './data/svg' + k + '.js';
    const fresh = mod.build(k);
    const onDisk = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    const same = fresh === onDisk;
    console.log((same ? '✅ ' : '❌ ') + `굳힌 ${k} 이 원본 SVG 와 일치 (drift 0)`);
    if (!same) { console.log('   → node maker-playground/tplpack-build.mjs 를 다시 돌려 함께 커밋할 것'); bad++; }
  }
}

/* ---- 이름 충돌 가드 ----
   data/tplpack.js 의 MK_TPLPACK(실전 템플릿 팩 v1)과 전역을 겹치면 그쪽
   install·ids·PACK 이 통째로 사라진다. 한 번 실제로 겹쳤던 자리다. */
{
  const savedW = global.window;
  const g = {}; global.window = g;
  const req3 = createRequire(import.meta.url);
  for (const f of ['./data/sample.js', './data/assets.js', './data/templates.js', './data/tplpack.js',
                   './data/tplsvg.js', ...PACK_FILES]) {
    delete req3.cache[req3.resolve(f)]; req3(f);
  }
  const okOld = !!(g.MK_TPLPACK && g.MK_TPLPACK.install && Array.isArray(g.MK_TPLPACK.ids) && g.MK_TPLPACK.ids.length === 8);
  const okNew = !!(g.MK_SVGPACK && Object.keys(g.MK_SVGPACK).length === g.MK_TPLSVG.CATALOG.length);
  console.log((okOld ? '✅ ' : '❌ ') + '기존 MK_TPLPACK 무사 (실전 팩 8종 API 보존)');
  console.log((okNew ? '✅ ' : '❌ ') + `MK_SVGPACK 에 전 팩 적재 (${g.MK_SVGPACK ? Object.keys(g.MK_SVGPACK).length : 0}종)`);
  if (!okOld || !okNew) bad++;
  global.window = savedW;
}

/* ---- Template Engine 등록 — Templates 화면에 실제로 서는가 ---- */
{
  const savedWindow = global.window;
  const g = {};
  global.window = g;
  const req2 = createRequire(import.meta.url);
  for (const f of ['./data/sample.js', './data/assets.js', './data/templates.js', './data/tplpack.js',
                   './data/tplsvg.js', ...PACK_FILES]) {
    delete req2.cache[req2.resolve(f)]; req2(f);
  }
  const E = g.MK_TPL;
  const ids = E.list().map((t) => t.templateId);
  const want = g.MK_TPLSVG.CATALOG.map((t) => 'tpl-' + t.id);
  want.forEach((id) => {
    const t = E.get(id);
    const okReg = !!t && t.scenes && t.scenes.length === 1 && t.scenes[0].elements.length > 0
      && !!t.ai && !!t.style && !!t.contentType && !!t.ratio;
    console.log((okReg ? '✅ ' : '❌ ') + '레지스트리 등록 ' + id + (t ? ` — ${t.category}/${t.style} · 요소 ${t.scenes[0].elements.length}개` : ''));
    if (!okReg) bad++;
    /* 카드가 요구하는 필드가 하나라도 비면 그리드에서 조용히 깨진다 */
    if (t && !E.resolve(id)) { console.log('❌ resolve 실패 ' + id); bad++; }
  });
  console.log((ids.length >= want.length + 16 ? '✅ ' : '❌ ') + `전체 목록 ${ids.length}종 (샘플 8 + 실전 8 + SVG 팩 ${want.length})`);
  /* 씬 배경이 밝기 판정과 어긋나면 글자가 배경에 묻힌다 */
  want.forEach((id) => {
    const sc = E.get(id).scenes[0];
    const noColor = sc.elements.filter((e) => e.kind === 'text' && !e.color).length;
    if (noColor) { console.log('❌ 색 없는 글자 ' + id + ' — ' + noColor + '개'); bad++; }
  });
  console.log('✅ 모든 글자에 색이 박혔다 (배경 명암 판정과 무관하게 읽힌다)');
  global.window = savedWindow;   /* 앞 블록의 MK_EASY 를 되돌린다 */
}

/* ---- 순수 도형(kind:'shape') 계약 ----
   화면(editor.js)과 내보내기(render.js)가 같은 필드를 읽어야 한다.
   render.js 는 el.shape/fill/stroke/strokeWidth 를 보고, 화면도 이제 같다. */
{
  const ed2 = fs.readFileSync('screens/editor.js', 'utf8');
  const rd2 = fs.readFileSync('data/render.js', 'utf8');
  [['화면이 shape 를 그린다', /el\.kind === 'shape'/.test(ed2)],
   ['도형 속성 패널', /s\.kind === 'shape'/.test(ed2) && /data-ed="sh-stroke"/.test(ed2)],
   ['속성 실배선', /bind\('strokew'/.test(ed2)],
   ['미니 씬도 shape', (ed2.match(/el\.kind === 'shape'/g) || []).length >= 2],
   ['내보내기가 stroke 를 읽는다', /stroke: el\.stroke/.test(rd2)],
  ].forEach(([n, c]) => { console.log((c ? '✅ ' : '❌ ') + n); if (!c) bad++; });

  /* 파서가 낸 도형이 그 계약을 지키는가 */
  const g2 = {}; const sv = global.window; global.window = g2;
  const req4 = createRequire(import.meta.url);
  for (const f of ['./data/tplsvg.js', ...PACK_FILES]) { delete req4.cache[req4.resolve(f)]; req4(f); }
  let shapes = 0, frags = 0, bad2 = [];
  Object.entries(g2.MK_SVGPACK).forEach(([id, p2]) => p2.elements.forEach((e, i) => {
    if (e.kind === 'shape') {
      shapes++;
      if (!['rect', 'ellipse', 'line'].includes(e.shape)) bad2.push(id + '#' + i + ':shape');
      if (e.stroke && !(e.strokeWidth > 0)) bad2.push(id + '#' + i + ':굵기 없는 테두리');
      if (e.shape === 'line' && !e.stroke) bad2.push(id + '#' + i + ':색 없는 선');
    }
    if (e.src) frags++;
  }));
  global.window = sv;
  console.log((bad2.length ? '❌ ' : '✅ ') + `순수 도형 ${shapes}개 계약 준수` + (bad2.length ? ' — ' + bad2.join(', ') : ''));
  console.log(`   조각으로 남은 것 ${frags}개 (곡선 path·그라디언트·필터)`);
  if (bad2.length) bad++;
}

console.log('\nMK_EASY quickAudit', JSON.stringify(window.MK_EASY.quickAudit()));
// 에디터 배선 계약
const ed = fs.readFileSync('screens/editor.js', 'utf8');
[['tplBlock 호출', /tpl: \(\) => `\$\{tplBlock\(\)\}/], ['그리드', /data-tplgrid/], ['클릭 배선', /bindTpl\(root\)/],
 ['갈래 칩', /data-tplcat/], ['radius 씬환산', /el\.radius \/ \(scene\.width/]].forEach(([n, re]) =>
  console.log((re.test(ed) ? '✅ ' : '❌ ') + n));
for (const f of ['../maker-playground/index.html', '../maker/index.html']) {
  const h = fs.readFileSync(f, 'utf8');
  /* 팩은 계속 늘어난다 — 목록을 못 박지 않고 디스크에서 센다 */
  const packFiles = fs.readdirSync('./data').filter((f) => /^svgpack\d+\.js$/.test(f)).sort();
  const two = /tplsvg\.js/.test(h) && packFiles.every((f) => h.includes(f));
  /* 순서 계약: MK_TPL(templates.js) → 파서 → 팩. 뒤집히면 등록이 조용히 실패한다 */
  const order = h.indexOf('templates.js') < h.indexOf('tplsvg.js')
    && packFiles.every((f) => h.indexOf('tplsvg.js') < h.indexOf(f));
  console.log(((two && order) ? '✅ ' : '❌ ') + '스크립트 등록·순서 ' + f);
  if (!(two && order)) bad++;
}
process.exit(bad ? 1 : 0);
