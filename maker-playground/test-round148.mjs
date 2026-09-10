/* ============================================================
   test-round148 — 「하늘에서 한 바퀴」 드론 인트로 (둘째 3D 장면)
   ------------------------------------------------------------
   · 틀 3파일(school-orbit.mp4/.json/.poster.png) 실존·형식 — 끝 자리가
     school-build 와 같다(같은 해상도·같은 카메라 → 디졸브·자막 공용)
   · plates/school/index.html 틀 고르기: PLATES 표 ↔ 버튼 ↔ 파일 1:1,
     jsdom 실부팅으로 ?plate= 선택·버튼 전환·주소 갱신·이상한 값 막기
   · scene3d.js SCENES 둘째 줄: preset 이 주소에 plate 를 싣고, 사용자 칸이 우선
   · 문 3곳에서 둘째 장면 카드가 첫 장면 뒤 · 3D 상장 칸을 안 민다
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '✅ ' : '❌ ') + m); };
const PL = '../kmake/plates/';
const pageSrc = fs.readFileSync(PL + 'school/index.html', 'utf8');

/* ---- 틀 파일 ---- */
const jb = JSON.parse(fs.readFileSync(PL + 'school-build.json', 'utf8'));
const jo = JSON.parse(fs.readFileSync(PL + 'school-orbit.json', 'utf8'));
ok(jo.name === 'school-orbit' && jo.shot === 'orbit', 'orbit JSON: name·shot');
ok(jo.frames === Math.round(jo.sec * jo.fps) && jo.hold_from > 1 && jo.hold_from < jo.frames, `orbit JSON: frames = sec×fps (${jo.frames}) · hold_from 안쪽 (${jo.hold_from})`);
ok(jo.width === jb.width && jo.height === jb.height && jo.fps === jb.fps, 'orbit·build 같은 해상도·fps (페이지 캔버스 공용)');
ok(JSON.stringify(jo.camera) === JSON.stringify(jb.camera), 'orbit·build 끝 카메라 동일 (디졸브 자리 같음)');
{
  const mp4 = fs.readFileSync(PL + 'school-orbit.mp4');
  ok(mp4.length > 10000 && mp4.toString('latin1', 4, 8) === 'ftyp', `orbit MP4 형식 (${mp4.length} B)`);
  const png = fs.readFileSync(PL + 'school-orbit.poster.png');
  ok(png.readUInt32BE(0) === 0x89504e47 && png.readUInt32BE(16) === jo.width && png.readUInt32BE(20) === jo.height, 'orbit 포스터 PNG · 틀과 같은 크기');
}
{
  const py = fs.readFileSync('../kmake/bake/hero_school.py', 'utf8');
  ok(/arg\('--shot', 'build'\)/.test(py) && py.includes("SHOT == 'orbit'") && py.includes("(BUILD if SHOT == 'build' else [])"), 'hero_school.py: --shot 기본 build · orbit 가드 · orbit 은 조립 키 없음');
}

/* ---- 페이지 정적 계약 ---- */
const plateKeys = [...pageSrc.matchAll(/'(school-[\w-]+)': \{ title:/g)].map((m) => m[1]);
const btnKeys = [...pageSrc.matchAll(/data-plate="([\w-]+)"/g)].map((m) => m[1]);
ok(plateKeys.join() === 'school-build,school-orbit', `PLATES 표 = build·orbit (${plateKeys.join('·')})`);
ok(btnKeys.join() === plateKeys.join(), '틀 고르기 버튼 ↔ PLATES 표 1:1 · 같은 순서');
ok(plateKeys.every((k) => ['.mp4', '.json', '.poster.png'].every((x) => fs.existsSync(PL + k + x))), 'PLATES 마다 mp4·json·poster 실존');
ok(pageSrc.includes('PLATES[PLATE].file') && !pageSrc.includes("title: `학교가지어진다_"), 'MP4·PNG 파일명이 틀 따라 바뀜');
ok(pageSrc.includes("Q.get('plate')") && pageSrc.includes("Q.has('school')") && pageSrc.includes("Q.has('sub')"), '주소 칸 plate·school·sub 유지');

/* ---- 페이지 실부팅 (영상·fetch·캔버스 흉내) ---- */
async function bootPage(query) {
  const html = pageSrc.replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { url: 'http://localhost/kmake/plates/school/' + query, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const fetched = [];
  w.fetch = async (u) => { const name = String(u).replace(/^\.\.\//, ''); fetched.push(name); return { json: async () => JSON.parse(fs.readFileSync(PL + name, 'utf8')) }; };
  const ctx = new Proxy({}, { get: () => () => {}, set: () => true });
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
  w.requestAnimationFrame = (f) => setTimeout(f, 0); w.cancelAnimationFrame = (i) => clearTimeout(i);
  const MP = w.HTMLMediaElement.prototype;
  MP.load = function () { setTimeout(() => this.onloadeddata && this.onloadeddata(), 0); };
  MP.play = function () { return Promise.resolve(); }; MP.pause = function () {};
  const ct = new WeakMap();
  Object.defineProperty(MP, 'currentTime', { configurable: true, get() { return ct.get(this) || 0; }, set(v) { ct.set(this, v); setTimeout(() => this.dispatchEvent(new w.Event('seeked')), 0); } });
  w.Image = class { constructor() { this.naturalWidth = 1920; this.naturalHeight = 1080; } set src(v) { this._s = v; setTimeout(() => this.onload && this.onload(), 0); } get src() { return this._s; } };
  const vids = []; const ce = w.document.createElement.bind(w.document);
  w.document.createElement = (t, o) => { const e = ce(t, o); if (String(t).toLowerCase() === 'video') vids.push(e); return e; };
  const code = pageSrc.match(/<script>([\s\S]*?)<\/script>/)[1];
  w.eval(code);
  const wait = async (fn, ms = 3000) => { const t0 = Date.now(); while (!fn() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 10)); return fn(); };
  return { w, $: (s) => w.document.querySelector(s), vids, fetched, wait };
}
{
  const P = await bootPage('?plate=school-orbit&school=%EA%B8%88%EC%84%B1%EC%B4%88');
  await P.wait(() => P.$('#h-title').textContent === '하늘에서 한 바퀴');
  ok(P.$('#h-title').textContent === '하늘에서 한 바퀴', '?plate=school-orbit → 제목 「하늘에서 한 바퀴」');
  ok(P.vids.length === 1 && /school-orbit\.mp4$/.test(P.vids[0].src) && P.fetched.includes('school-orbit.json'), 'orbit 틀 영상·JSON 을 읽음');
  ok(P.$('[data-plate="school-orbit"]').classList.contains('on') && !P.$('[data-plate="school-build"]').classList.contains('on'), '틀 고르기 버튼 on 표시');
  ok(P.$('#cv').width === jo.width && P.$('#note').innerHTML.includes('school-orbit.mp4'), '캔버스 크기·설명 문구 = orbit');
  ok(P.$('#f-school').value === '금성초', '주소 school 칸 프리필 유지');
  await P.wait(() => typeof P.$('[data-plate="school-build"]').onclick === 'function');   /* 버튼 배선은 부팅 끝(첫 화면 그린 뒤) */
  P.$('[data-plate="school-build"]').click();
  await P.wait(() => P.$('#h-title').textContent === '학교가 지어진다');
  ok(P.$('#h-title').textContent === '학교가 지어진다' && /school-build\.mp4$/.test(P.vids[0].src), '버튼으로 build 틀 전환 (같은 video 재사용)');
  ok(new URL(P.w.location.href).searchParams.get('plate') === 'school-build' && new URL(P.w.location.href).searchParams.get('school') === '금성초', '전환 시 주소 plate 갱신 · 다른 칸 유지');
  ok(P.$('#note').innerHTML.includes('school-build.mp4') && P.$('[data-plate="school-build"]').classList.contains('on'), '전환 뒤 설명·버튼 표시 따라감');
  /* 창은 닫지 않음 — 페이지 비동기(showAt)가 뒤에서 도는 중일 수 있음, 끝에 process.exit */
}
for (const bad of ['?plate=..%2Fsecret', '?plate=award-wood-warm', '']) {
  const P = await bootPage(bad);
  await P.wait(() => P.fetched.length > 0 && P.$('[data-plate].on'));
  ok(P.fetched[0] === 'school-build.json' && P.$('[data-plate="school-build"]').classList.contains('on'), `plate「${bad || '없음'}」→ 기본 build 틀`);
  /* 창은 닫지 않음 — 페이지 비동기(showAt)가 뒤에서 도는 중일 수 있음, 끝에 process.exit */
}

/* ---- scene3d SCENES 둘째 줄 ---- */
{
  global.window = {};
  require('./data/scene3d.js');
  const S = window.MK_SCENE3D;
  const o = S.get('school-orbit');
  ok(S.SCENES.map((s) => s.id).join() === 'school,school-orbit', 'SCENES = school · school-orbit (순서)');
  ok(o.id === 'school-orbit' && o.url === S.get('school').url && o.poster === '/kmake/plates/school-orbit.poster.png', '둘째 장면: 같은 화면 · 자기 포스터');
  ok(plateKeys.includes(o.preset.plate) && o.fields.includes('plate'), 'preset.plate 가 페이지 PLATES 에 있고 fields 에 plate');
  ok(S.url('school-orbit') === '/kmake/plates/school/?plate=school-orbit', 'url(orbit) 빈 인자 → ?plate=school-orbit');
  const q = new URLSearchParams(S.url('school-orbit', { school: '금성초등학교', sub: '' }).split('?')[1]);
  ok(q.get('school') === '금성초등학교' && q.get('plate') === 'school-orbit' && !q.has('sub'), 'url(orbit, 칸) → 칸 + preset, 빈 칸 제외');
  ok(S.url('school-orbit', { plate: 'school-build' }).endsWith('?plate=school-build'), '사용자 plate 가 preset 보다 우선');
  ok(S.url('school') === '/kmake/plates/school/' && !S.url('school', { school: 'x' }).includes('plate='), '첫 장면(preset 없음) 주소 무변화');
  ok(S.cardsFor('video').indexOf('data-scene3d="school"') < S.cardsFor('video').indexOf('data-scene3d="school-orbit"') && S.cardsFor('print') === '', 'cardsFor: 영상 = school → orbit · 인쇄물 0');
  delete global.window;
}

/* ---- 실부팅: 문 3곳의 둘째 장면 ---- */
{
  const html = fs.readFileSync('./index.html', 'utf8').replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { url: 'http://localhost/maker-playground/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.requestAnimationFrame = (f) => setTimeout(f, 0);
  w.HTMLCanvasElement.prototype.getContext = () => null;
  const src = fs.readFileSync('./index.html', 'utf8');
  const scripts = [...src.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]).filter((p) => !p.startsWith('/') && !p.startsWith('http'));
  for (const p of scripts) { try { w.eval(fs.readFileSync(p, 'utf8')); } catch (e) { /* 문만 본다 */ } }
  const opened = [];
  w.MK_SCENE3D.open = (id, f) => { opened.push(w.MK_SCENE3D.url(id, f)); return ''; };
  const mount = (screen) => { const root = w.document.createElement('div'); root.innerHTML = screen.render(); w.document.body.appendChild(root); screen.mount(root); return root; };
  w.PG = w.PG || { render() {}, go() {}, state: {}, openEditor() {} };
  const ORB = '/kmake/plates/school/?plate=school-orbit';
  let root = mount(w.MK_SCREENS.templates);
  const g = root.querySelector('.br-grid');
  ok(g && g.children[0].hasAttribute('data-te-award3d') && g.children[1].dataset.scene3d === 'school' && g.children[2].dataset.scene3d === 'school-orbit', 'Templates 격자: 3D 상장 → 지어진다 → 하늘에서 한 바퀴');
  g.children[2].click(); ok(opened[opened.length - 1] === ORB, 'Templates 카드 → ?plate=school-orbit');
  if (w.MK_SCREENS.home) {
    root = mount(w.MK_SCREENS.home);
    const c1 = root.querySelector('.h2-chip[data-scene3d="school"]'), c2 = root.querySelector('.h2-chip[data-scene3d="school-orbit"]');
    ok(!!c2 && c1.nextElementSibling === c2 && c2.textContent.includes('하늘에서 한 바퀴') && !c2.textContent.includes('(영상)'), '홈: 🏫 칩 옆 🚁 하늘에서 한 바퀴 칩');
    c2.click(); ok(opened[opened.length - 1] === ORB, '홈 칩 → ?plate=school-orbit');
  }
  w.PG.state.create = { step: 1, type: null, style: null, tpl: null };
  root = mount(w.MK_SCREENS.create);
  const k1 = root.querySelector('.hv-type[data-scene3d="school"]'), k2 = root.querySelector('.hv-type[data-scene3d="school-orbit"]');
  ok(!!k2 && k1.nextElementSibling === k2 && k2.nextElementSibling.hasAttribute('data-cf-award3d'), '만들기 1단계: 지어진다 → 하늘에서 한 바퀴 → 3D 상장');
  k2.click(); ok(opened[opened.length - 1] === ORB, '만들기 카드 → ?plate=school-orbit');
  ok(opened.length === 3, '문 3곳 클릭 3번 = open 3번');
}
{
  for (const f of ['./index.html', '../maker/index.html']) ok(/scene3d\.js\?v=20260910c/.test(fs.readFileSync(f, 'utf8')), `${f}: scene3d 버스터 20260910c`);
}
console.log(`\n${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
