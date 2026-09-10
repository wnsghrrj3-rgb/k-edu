/* ============================================================
   test-round147 — 「3D 장면」 문 (MK_SCENE3D: 학교가 지어진다)
   ------------------------------------------------------------
   · 문 3곳(Templates 영상/전체 · 홈 칩 · 만들기 1단계)이 실부팅에서 뜨고
     같은 open() 으로 간다 (jsdom) — R143(3D 상장) 문과 나란히, 서로 안 밀림
   · url(): 장면 fields 가 plates/school/index.html 의 주소 칸과 1:1
   · index 스크립트 2곳(플레이그라운드·제품) 배선·순서
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '✅ ' : '❌ ') + m); };

/* ---- 정적 계약 ---- */
const page = fs.readFileSync('../kmake/plates/school/index.html', 'utf8');
for (const f of ['./index.html', '../maker/index.html']) {
  const h = fs.readFileSync(f, 'utf8');
  ok(/scene3d\.js\?v=\d{8}[a-z]/.test(h), `${f} 에 scene3d.js 배선`);
  ok(h.indexOf('award3d.js') < h.indexOf('scene3d.js') && h.indexOf('scene3d.js') < h.indexOf('screens/home.js'), `${f} 순서: award3d → scene3d → 화면들`);
}
ok(page.includes('href="/maker/"') && page.includes('MK_VIDEO.exportFramesMP4'), 'school 페이지: ← 케이메이커 · MP4 = exportFramesMP4');
{
  global.window = {};
  require('./data/scene3d.js');
  const S = window.MK_SCENE3D;
  ok(S.SCENES.length >= 1 && S.get('school').url === '/kmake/plates/school/', 'SCENES 에 school 장면');
  for (const s of S.SCENES) {
    ok(fs.existsSync('..' + s.poster), `${s.id}: 포스터 파일 존재 (${s.poster})`);
    const rel = '..' + s.url + 'index.html';
    ok(fs.existsSync(rel), `${s.id}: 화면 파일 존재`);
    const html = fs.readFileSync(rel, 'utf8');
    ok(s.fields.every((k) => html.includes(`Q.has('${k}')`) || html.includes(`Q.get('${k}')`)), `${s.id}: fields(${s.fields.join('·')}) 가 화면 주소 칸과 1:1`);
  }
  ok(S.url('school') === '/kmake/plates/school/', 'url() 빈 인자 = 기본 주소');
  const u = S.url('school', { school: '금성초등학교', sub: '한 줄', plate: 'school-build', junk: 'x', cls: '' });
  const q = new URLSearchParams(u.split('?')[1]);
  ok(q.get('school') === '금성초등학교' && q.get('sub') === '한 줄' && q.get('plate') === 'school-build' && !q.has('junk') && !q.has('cls'), 'url() 한글 왕복 · 모르는 칸 제외');
  ok(S.cardHTML('school').includes('mk-tplcard') && S.cardHTML('school').includes('data-scene3d="school"'), 'cardHTML = mk-tplcard + data-scene3d');
  ok(S.cardsFor('video').includes('data-scene3d="school"') && S.cardsFor('all').includes('data-scene3d="school"') && S.cardsFor('print') === '', 'cardsFor: 영상·전체엔 있고 인쇄물엔 없음');
  delete global.window;
}

/* ---- 실부팅: 문 3곳 ---- */
{
  const html = fs.readFileSync('./index.html', 'utf8').replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { url: 'http://localhost/maker-playground/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.requestAnimationFrame = (f) => setTimeout(f, 0);
  w.HTMLCanvasElement.prototype.getContext = () => null;
  const src = fs.readFileSync('./index.html', 'utf8');
  const scripts = [...src.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]).filter((p) => !p.startsWith('/') && !p.startsWith('http'));
  for (const p of scripts) { try { w.eval(fs.readFileSync(p, 'utf8')); } catch (e) { /* 문 3곳만 본다 */ } }
  ok(!!w.MK_SCENE3D && !!w.MK_AWARD3D && !!w.MK_SCREENS.templates, '부팅: MK_SCENE3D + MK_AWARD3D + Templates');
  const opened = [];
  w.MK_SCENE3D.open = (id, f) => { opened.push(w.MK_SCENE3D.url(id, f)); return ''; };
  const mount = (screen) => { const root = w.document.createElement('div'); root.innerHTML = screen.render(); w.document.body.appendChild(root); screen.mount(root); return root; };
  w.PG = w.PG || { render() {}, go() {}, state: {}, openEditor() {} };
  let root = mount(w.MK_SCREENS.templates);
  const grid = root.querySelector('.br-grid');
  const door = root.querySelector('[data-scene3d="school"]');
  ok(!!door, 'Templates 「전체」 에 학교가 지어진다 카드');
  ok(grid && grid.firstElementChild.hasAttribute('data-te-award3d') && grid.children[1] === door, '격자: 3D 상장 첫 칸 · 3D 장면 둘째 칸 (서로 안 밀림)');
  door.click(); ok(opened.length === 1 && opened[0] === '/kmake/plates/school/', '카드 클릭 → open()');
  root.querySelector('[data-te-cat="video"]').click(); root = mount(w.MK_SCREENS.templates);
  ok(!!root.querySelector('[data-scene3d="school"]') && !root.querySelector('[data-te-award3d]'), '「영상」 갈래: 3D 장면 있음 · 3D 상장 없음');
  root.querySelector('[data-te-cat="print"]').click(); root = mount(w.MK_SCREENS.templates);
  ok(!root.querySelector('[data-scene3d="school"]') && !!root.querySelector('[data-te-award3d]'), '「인쇄물」 갈래: 3D 상장 있음 · 3D 장면 없음');
  root.querySelector('[data-te-cat="all"]').click();
  if (w.MK_SCREENS.home) {
    try {
      root = mount(w.MK_SCREENS.home);
      const chip = root.querySelector('.h2-chip[data-scene3d="school"]');
      ok(!!chip && chip.previousElementSibling && chip.previousElementSibling.hasAttribute('data-h2-award3d'), '홈: 3D 상장 칩 옆에 🏫 학교가 지어진다 칩');
      chip.click(); ok(opened.length === 2, '홈 칩 클릭 → open()');
    } catch (e) { ok(false, '홈 부팅 실패: ' + e.message); }
  }
  w.PG.state.create = { step: 1, type: null, style: null, tpl: null };
  root = mount(w.MK_SCREENS.create);
  const cf = root.querySelector('.hv-type[data-scene3d="school"]');
  /* R148: 장면이 둘 이상이면 school 바로 뒤는 다음 장면 — 「3D 상장 앞」 은 마지막 장면 카드 기준 */
  const cfs = [...root.querySelectorAll('.hv-type[data-scene3d]')], cfLast = cfs[cfs.length - 1];
  ok(!!cf && cfs[0] === cf && cfLast.nextElementSibling && cfLast.nextElementSibling.hasAttribute('data-cf-award3d'), '만들기 1단계: 종류 카드 뒤 · (마지막 장면 카드) 3D 상장 앞');
  cf.click(); ok(opened.length === 3, '만들기 카드 클릭 → open()');
  ok(opened.every((u) => u === '/kmake/plates/school/'), '문 3곳 모두 같은 주소');
}
console.log(`\n${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
