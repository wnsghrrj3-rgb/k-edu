/* ============================================================
   tplpack-build.mjs — SVG 템플릿 팩 → data/tplpack01.js 생성기
   ------------------------------------------------------------
   원리는 maker/build.mjs 와 같다. 원본(assets/templates/**.svg)을
   MK_TPLSVG 파서로 풀어 요소 배열로 굳히고, Template Engine 에
   등록되는 정적 JS 한 장으로 쓴다.

   왜 굳히나: Templates 화면은 카드 그리드를 그릴 때 이미 요소가
   있어야 한다(썸네일이 실렌더다). 런타임 fetch 로는 화면이 먼저
   그려져 카드가 비고, 실패하면 조용히 사라진다. 굳히면 로드 즉시
   레지스트리에 선다.

   드리프트 방지: test-round137 이 이 변환을 재실행해 커밋본과
   비교한다. SVG 를 더하거나 고친 뒤에는 이 스크립트를 다시 돌려
   함께 커밋할 것.
     node maker-playground/tplpack-build.mjs
   ============================================================ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import { JSDOM } from 'jsdom';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export function packs() {
  const dom = new JSDOM('');
  const prev = global.window; global.window = { };
  delete require.cache[require.resolve('./data/tplsvg.js')];
  require('./data/tplsvg.js');
  const ks = [...new Set(global.window.MK_TPLSVG.CATALOG.map((t) => t.pack))];
  global.window = prev; dom.window.close();
  return ks;
}

export function build(packKey) {
  const dom = new JSDOM('');
  const g = { window: {} };
  const prev = global.window;
  global.window = g.window;
  delete require.cache[require.resolve('./data/tplsvg.js')];
  require('./data/tplsvg.js');
  const T = g.window.MK_TPLSVG;
  global.window = prev;

  const opts = { DOMParser: dom.window.DOMParser, XMLSerializer: dom.window.XMLSerializer };
  const packs = {}, regs = [];

  for (const t of T.CATALOG.filter((x) => x.pack === packKey)) {
    const file = path.join(HERE, 'assets', 'templates', t.pack, t.file);
    const p = T.parse(fs.readFileSync(file, 'utf8'), opts);
    if (!p.ok) throw new Error(t.id + ' 파싱 실패: ' + p.msg);
    if (p.width !== t.width || p.height !== t.height)
      throw new Error(`${t.id} 크기 불일치 — 카탈로그 ${t.width}x${t.height}, 실제 ${p.width}x${p.height}`);
    packs[t.id] = { width: p.width, height: p.height, background: p.background, elements: p.elements, notes: p.notes };
    regs.push(t);
  }

  /* Template Engine 의 category 는 좌측 갈래의 한글 이름이다 */
  const KO_CAT = { presentation: '발표자료', video: '영상', cardnews: '카드뉴스', poster: '포스터',
    worksheet: '학습지', activity: '활동자료', thumbnail: '썸네일', sns: 'SNS' };
  const J = (v) => JSON.stringify(v);
  const body = regs.map((t) => `  ${J(t.id)}: ${J(packs[t.id])},`).join('\n');

  const reg = regs.map((t) => `    { src: {
      templateId: 'tpl-${t.id}', title: ${J(t.ko)}, description: ${J(t.desc)},
      contentType: ${J(t.contentType)}, category: ${J(KO_CAT[t.contentType] || t.category)}, style: ${J(t.style)}, styleEn: ${J(t.styleEn)},
      ratio: ${J(t.ratio)}, difficulty: ${J(t.difficulty)}, targetUser: 'teacher', gradeRange: '전학년',
      uses: ${J(t.uses)}, tags: ${J(t.tags)}, recent: false, svgTemplate: ${J(t.id)},
      scenes: [{ id: 'p1', name: ${J(t.ko)}, width: ${t.width}, height: ${t.height}, duration: 5,
        background: ${J(packs[t.id].background)}, transition: 'fade', order: 0, elements: PACK[${J(t.id)}].elements }],
    }, ov: { styleId: ${J(t.styleId)}, animationId: 'an-none', assetIds: [],
      ai: { recommended: ${t.rec}, tags: ${J(t.tags)}, hints: ${J(t.hints)} } } },`).join('\n');

  const NUM = packKey.replace(/[^0-9]/g, '') || '01';
  return `/* ============================================================
   MK_SVGPACK — SVG 템플릿 ${packKey} (자동 생성 — 손으로 고치지 말 것)
   ------------------------------------------------------------
   원본: assets/templates/${packKey}/*.svg
   생성: node maker-playground/tplpack-build.mjs
   MK_TPLSVG 파서가 SVG 를 요소로 푼 결과를 굳힌 것이다. 로드되면
   Template Engine 레지스트리에 바로 등록돼 Templates 화면에 선다.
   ⚠ 이름 주의: data/tplpack.js 의 MK_TPLPACK 은 별개 모듈이다(실전 템플릿
   팩 v1). 전역명을 겹치면 그쪽 API(install·ids)가 통째로 사라진다.
   ============================================================ */
window.MK_SVGPACK = (() => {
  const PACK = window.MK_SVGPACK || {};   /* 팩은 여러 장 — 앞 팩에 덧쌓는다 */
  Object.assign(PACK, {
${body}
  });

  /* Template Engine 등록 — MK_TPL 이 없으면 조용히 건너뛴다(파서만 쓰는 환경) */
  const REG = [
${reg}
  ];
  if (window.MK_TPL && window.MK_TPL.register) {
    REG.forEach((r) => { try { window.MK_TPL.register(r.src, r.ov); } catch (_) { /* 등록 실패는 무해 */ } });
  }

  return PACK;
})();
`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const k of packs()) {
    const out = 'svg' + k + '.js';
    fs.writeFileSync(path.join(HERE, 'data', out), build(k));
    console.log('data/' + out + ' 생성 완료');
  }
}
