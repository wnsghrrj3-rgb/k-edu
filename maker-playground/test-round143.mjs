/* ============================================================
   test-round143 — 「3D 상장」 문 (MK_AWARD3D) + MK_VIDEO.exportFramesMP4
   ------------------------------------------------------------
   · 문 3곳(Templates 인쇄물/전체 · 홈 칩 · 만들기 1단계)이 실부팅에서 뜨고
     같은 open() 으로 간다 (jsdom)
   · url(): 6칸이 plates/award/index.html 의 입력 칸 이름과 1:1
   · index 스크립트 2곳(플레이그라운드·제품) + plates 페이지가 video.js 를 문다
   · exportFramesMP4: 인자 가드·VideoEncoder 없음 정직 실패·busy 미오염
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '✅ ' : '❌ ') + m); };

/* ---- 정적 계약 ---- */
const plates = fs.readFileSync('../kmake/plates/award/index.html', 'utf8');
const award = fs.readFileSync('./data/award3d.js', 'utf8');
for (const f of ['./index.html', '../maker/index.html']) {
  const h = fs.readFileSync(f, 'utf8');
  ok(/award3d\.js\?v=\d{8}[a-z]/.test(h), `${f} 에 award3d.js 배선`);
  ok(h.indexOf('templates.js') < h.indexOf('award3d.js') && h.indexOf('award3d.js') < h.indexOf('maker-playground/app.js') || h.indexOf('award3d.js') < h.indexOf('"app.js'), `${f} 순서: templates → award3d → app`);
}
ok(/maker-playground\/data\/video\.js\?v=/.test(plates), 'plates 페이지가 /maker-playground/data/video.js 를 문다');
ok(plates.includes('MK_VIDEO.exportFramesMP4'), 'plates 페이지 MP4 버튼 = MK_VIDEO.exportFramesMP4');
ok(plates.includes('id="mp4"') && plates.includes('id="webm" hidden'), 'MP4 버튼 앞으로 · WebM 은 예비(hidden)');
ok(plates.includes('href="/maker/"'), 'plates 페이지에 ← 케이메이커 돌아가기');
ok(plates.includes("Q.get('plate')") && plates.includes('${PLATE}.json') && plates.includes('${PLATE}.mp4'), 'plate= 로 틀 고르기(2종째 대비)');
/* 6칸 이름 1:1 — award3d.js FIELDS ↔ plates 의 [k, id] 표 */
const fieldsJs = (award.match(/FIELDS = \[([^\]]+)\]/) || [])[1].replace(/['\s]/g, '').split(',');
const fieldsHtml = [...plates.matchAll(/\['(\w+)', 'f-[\w-]+'\]/g)].map((m) => m[1]);
ok(fieldsJs.length === 6 && JSON.stringify(fieldsJs) === JSON.stringify(fieldsHtml), `6칸 이름 1:1 (${fieldsJs.join('·')})`);
ok(fs.existsSync('../kmake/plates/award-wood-warm.poster.png'), '카드 포스터 파일 존재');

/* ---- 순수 계층: url() ---- */
{
  global.window = {};
  require('./data/award3d.js');
  const A = window.MK_AWARD3D;
  ok(A.url() === '/kmake/plates/award/', 'url() 빈 인자 = 기본 주소');
  const u = A.url({ title: '모범상', name: '김하늘', body: '첫 줄\n둘째 줄', cls: '', junk: 'x' }, 'award-wood-warm');
  const q = new URLSearchParams(u.split('?')[1]);
  ok(q.get('title') === '모범상' && q.get('name') === '김하늘' && q.get('body') === '첫 줄\n둘째 줄', 'url() 한글·줄바꿈 왕복');
  ok(!q.has('cls') && !q.has('junk') && q.get('plate') === 'award-wood-warm', 'url() 빈 칸·모르는 칸 제외, plate 실림');
  ok(A.cardHTML('data-x').includes('mk-tplcard') && A.cardHTML().includes(A.POSTER), 'cardHTML = mk-tplcard 껍데기 + 포스터');
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
  for (const p of scripts) { try { w.eval(fs.readFileSync(p, 'utf8')); } catch (e) { /* 일부 화면은 DOM 부재로 던짐 — 문 3곳만 본다 */ } }
  ok(!!w.MK_AWARD3D && !!w.MK_SCREENS && !!w.MK_SCREENS.templates, '부팅: MK_AWARD3D + Templates 화면');
  const opened = [];
  w.MK_AWARD3D.open = (f, p) => { opened.push(w.MK_AWARD3D.url(f, p)); return ''; };
  const mount = (screen, cat) => {
    const root = w.document.createElement('div');
    if (cat) w.eval(`(() => { const s = window.MK_SCREENS.templates; })()`);
    root.innerHTML = screen.render();
    w.document.body.appendChild(root);
    screen.mount(root);
    return root;
  };
  /* Templates — 전체(기본) 에 문 */
  w.PG = w.PG || { render() {}, go() {}, state: {}, openEditor() {} };
  let root = mount(w.MK_SCREENS.templates);
  const door = root.querySelector('[data-te-award3d]');
  ok(!!door, 'Templates 「전체」 격자 맨 앞에 3D 상장 카드');
  ok(root.querySelector('.br-grid') && root.querySelector('.br-grid').firstElementChild === door, '카드가 격자 첫 칸');
  door.click(); ok(opened.length === 1 && opened[0] === '/kmake/plates/award/', '카드 클릭 → open()');
  /* 인쇄물 갈래로 전환해도 있음, 검색어 있으면 없음 */
  root.querySelector('[data-te-cat="print"]').click();
  root = mount(w.MK_SCREENS.templates);
  ok(!!root.querySelector('[data-te-award3d]'), 'Templates 「인쇄물」 갈래에도 문');
  root.querySelector('[data-te-cat="video"]').click();
  root = mount(w.MK_SCREENS.templates);
  ok(!root.querySelector('[data-te-award3d]'), '「영상」 갈래엔 없음(인쇄물 옆에만)');
  root.querySelector('[data-te-cat="all"]').click();
  /* 홈 칩 */
  if (w.MK_SCREENS.home) {
    try {
      root = mount(w.MK_SCREENS.home);
      const chip = root.querySelector('[data-h2-award3d]');
      ok(!!chip && chip.previousElementSibling && chip.previousElementSibling.dataset.h2Chip === 'print', '홈: 인쇄물 칩 바로 옆에 🏆 3D 상장 칩');
      chip.click(); ok(opened.length === 2, '홈 칩 클릭 → open()');
    } catch (e) { ok(false, '홈 부팅 실패: ' + e.message); }
  }
  /* 만들기 1단계 */
  w.PG.state.create = { step: 1, type: null, style: null, tpl: null };
  root = mount(w.MK_SCREENS.create);
  const cf = root.querySelector('[data-cf-award3d]');
  ok(!!cf && cf.nextElementSibling && cf.nextElementSibling.hasAttribute('data-cf-ai'), '만들기 1단계: 종류 카드 뒤·AI 앞에 3D 상장');
  cf.click(); ok(opened.length === 3, '만들기 카드 클릭 → open()');
  /* 문 3곳 = 같은 주소 */
  ok(opened.every((u) => u === '/kmake/plates/award/'), '문 3곳 모두 같은 주소');
}

/* ---- exportFramesMP4 계약(VideoEncoder 없는 환경 = jsdom) ---- */
{
  const dom = new JSDOM('', { url: 'http://localhost/', runScripts: 'outside-only' });
  global.window = dom.window; global.document = dom.window.document;
  dom.window.eval(fs.readFileSync('./data/video.js', 'utf8'));
  const V = dom.window.MK_VIDEO;
  ok(typeof V.exportFramesMP4 === 'function', 'MK_VIDEO.exportFramesMP4 노출');
  const r = await V.exportFramesMP4({ width: 640, height: 360, fps: 12, frames: 48, drawFrame() {} });
  ok(r.ok === false && /지원하지 않아요/.test(r.msg), 'VideoEncoder 없음 → 정직 실패 (' + r.msg + ')');
  ok(V.busy() === false, '실패 후 busy 미오염');
  dom.window.VideoEncoder = function () {};
  const r2 = await V.exportFramesMP4({ width: 0, height: 0, frames: 1 });
  ok(r2.ok === false && /필요해요/.test(r2.msg), '인자 가드 (' + r2.msg + ')');
  const r3 = await V.exportFramesMP4({ width: 640, height: 360, fps: 1, frames: 100000, drawFrame() {} });
  ok(r3.ok === false && /넘어요/.test(r3.msg), 'MAX_SEC 가드');
  ok(V.busy() === false, '가드 실패 후 busy 미오염');
  const vjs = fs.readFileSync('./data/video.js', 'utf8');
  ok(!/exportFramesMP4[\s\S]*?'avc1\./.test(vjs.slice(vjs.indexOf('async function exportFramesMP4'), vjs.indexOf('function videoAudit'))), 'exportFramesMP4 안에 코덱 리터럴 없음(정본 EXPORT_SPEC·사다리만)');
}

console.log(`\n${fail === 0 ? '🟢' : '🔴'} test-round143: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
