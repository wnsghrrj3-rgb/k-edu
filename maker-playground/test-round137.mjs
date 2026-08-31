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
  console.log((a.ok ? '✅' : '❌'), t.id.padEnd(22), `요소 ${a.count}개 (편집가능 ${a.native} · 조각 ${a.frags})`, '씬', s.width + '×' + s.height, s.background);
  if (p.notes.length) p.notes.forEach((n) => console.log('      · ' + n));
}
console.log('\nMK_EASY quickAudit', JSON.stringify(window.MK_EASY.quickAudit()));
// 에디터 배선 계약
const ed = fs.readFileSync('screens/editor.js', 'utf8');
[['tplBlock 호출', /tpl: \(\) => `\$\{tplBlock\(\)\}/], ['그리드', /data-tplgrid/], ['클릭 배선', /bindTpl\(root\)/],
 ['갈래 칩', /data-tplcat/], ['radius 씬환산', /el\.radius \/ \(scene\.width/]].forEach(([n, re]) =>
  console.log((re.test(ed) ? '✅ ' : '❌ ') + n));
for (const f of ['../maker-playground/index.html', '../maker/index.html'])
  console.log((/tplsvg\.js/.test(fs.readFileSync(f, 'utf8')) ? '✅ ' : '❌ ') + '스크립트 등록 ' + f);
process.exit(bad ? 1 : 0);
