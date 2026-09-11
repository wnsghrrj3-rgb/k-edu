/* ============================================================
   test-round149 — 「불이 켜지는 저녁」 엔딩 (셋째 3D 장면)
   ------------------------------------------------------------
   · 틀 3파일(school-night.mp4/.json/.poster.png) 실존·형식 — photo_at 'start'
     · photo_until 안쪽 · 끝 카메라는 build 와 같지 않아도 된다(물러난 자리)
   · plates/school/index.html 셋째 버튼 · PLATES 셋째 줄 · 앞쪽 역디졸브
     (실사 알파 1→0, photo_until 프레임 전에 끝) · 끝 디졸브 0 · 엔딩 기본 자막
     (사용자 sub 있으면 안 덮음) · 라벨 문구 전환
   · scene3d.js SCENES 셋째 줄 + 문 3곳
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
const jn = JSON.parse(fs.readFileSync(PL + 'school-night.json', 'utf8'));
ok(jn.name === 'school-night' && jn.shot === 'night', 'night JSON: name·shot');
ok(jn.frames === Math.round(jn.sec * jn.fps) && jn.hold_from > 1 && jn.hold_from < jn.frames, `night JSON: frames = sec×fps (${jn.frames}) · hold_from 안쪽 (${jn.hold_from})`);
ok(jn.width === jb.width && jn.height === jb.height && jn.fps === jb.fps, 'night·build 같은 해상도·fps (페이지 캔버스 공용)');
ok(jn.photo_at === 'start' && jn.photo_until > 1 && jn.photo_until < jn.hold_from, `photo_at start · photo_until 앞쪽 (${jn.photo_until})`);
{
  const mp4 = fs.readFileSync(PL + 'school-night.mp4');
  ok(mp4.length > 10000 && mp4.toString('latin1', 4, 8) === 'ftyp', `night MP4 형식 (${mp4.length} B)`);
  const png = fs.readFileSync(PL + 'school-night.poster.png');
  ok(png.readUInt32BE(0) === 0x89504e47 && png.readUInt32BE(16) === jn.width && png.readUInt32BE(20) === jn.height, 'night 포스터 PNG · 틀과 같은 크기');
}
{
  const py = fs.readFileSync('../kmake/bake/hero_school.py', 'utf8');
  ok(py.includes("SHOT == 'night'") && py.includes("photo_at") && py.includes("photo_until"), 'hero_school.py: night 가드 · JSON 에 photo_at/photo_until');
}

/* ---- 페이지 정적 계약 ---- */
const plateKeys = [...pageSrc.matchAll(/'(school-[\w-]+)': \{ title:/g)].map((m) => m[1]);
const btnKeys = [...pageSrc.matchAll(/data-plate="([\w-]+)"/g)].map((m) => m[1]);
ok(plateKeys.join() === 'school-build,school-orbit,school-night', `PLATES 표 = build·orbit·night (${plateKeys.join('·')})`);
ok(btnKeys.join() === plateKeys.join(), '틀 고르기 버튼 ↔ PLATES 표 1:1 · 같은 순서');
ok(plateKeys.every((k) => ['.mp4', '.json', '.poster.png'].every((x) => fs.existsSync(PL + k + x))), 'PLATES 마다 mp4·json·poster 실존');
ok(pageSrc.includes("meta.photo_at === 'start'") && pageSrc.includes('startDissolve') && pageSrc.includes("defSub: '내일 또 만나요'"), '역디졸브·기본 자막 코드 존재');

/* ---- 페이지 실부팅 (영상·fetch·캔버스 흉내 + drawImage 알파 기록) ---- */
async function bootPage(query) {
  const html = pageSrc.replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { url: 'http://localhost/kmake/plates/school/' + query, runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const fetched = [];
  w.fetch = async (u) => { const name = String(u).replace(/^\.\.\//, ''); fetched.push(name); return { json: async () => JSON.parse(fs.readFileSync(PL + name, 'utf8')) }; };
  /* 캔버스 흉내: drawImage(사진) 때의 globalAlpha 를 기록 — 디졸브 방향·구간 검산용 */
  const draws = [];
  const state = { globalAlpha: 1 };
  const ctx = new Proxy(state, { get: (t, k) => k in t ? t[k] : (k === 'drawImage' ? (img, ...a) => { if (img && img.__photo) draws.push({ a: t.globalAlpha }); } : () => {}), set: (t, k, v) => { t[k] = v; return true; } });
  w.HTMLCanvasElement.prototype.getContext = () => ctx;
  w.requestAnimationFrame = (f) => setTimeout(f, 0); w.cancelAnimationFrame = (i) => clearTimeout(i);
  const MP = w.HTMLMediaElement.prototype;
  MP.load = function () { setTimeout(() => this.onloadeddata && this.onloadeddata(), 0); };
  MP.play = function () { return Promise.resolve(); }; MP.pause = function () {};
  const ct = new WeakMap();
  Object.defineProperty(MP, 'currentTime', { configurable: true, get() { return ct.get(this) || 0; }, set(v) { ct.set(this, v); setTimeout(() => this.dispatchEvent(new w.Event('seeked')), 0); } });
  w.Image = class { constructor() { this.__photo = true; this.naturalWidth = 1920; this.naturalHeight = 1080; } set src(v) { this._s = v; setTimeout(() => this.onload && this.onload(), 0); } get src() { return this._s; } };
  const vids = []; const ce = w.document.createElement.bind(w.document);
  w.document.createElement = (t, o) => { const e = ce(t, o); if (String(t).toLowerCase() === 'video') vids.push(e); return e; };
  const code = pageSrc.match(/<script>([\s\S]*?)<\/script>/)[1];
  w.eval(code);
  const wait = async (fn, ms = 3000) => { const t0 = Date.now(); while (!fn() && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 10)); return fn(); };
  return { w, $: (s) => w.document.querySelector(s), vids, fetched, wait, draws };
}
/* 스크럽으로 특정 초를 그리고 그때 사진 알파(없으면 0) 를 얻는다 */
async function photoAlphaAt(P, sec, total) {
  P.draws.length = 0;
  const seek = P.$('#seek'); seek.value = Math.round(sec / total * 1000); seek.oninput();
  await new Promise((r) => setTimeout(r, 40));
  return P.draws.length ? P.draws[P.draws.length - 1].a : 0;
}
{
  const P = await bootPage('?plate=school-night&school=%EA%B8%88%EC%84%B1%EC%B4%88');
  await P.wait(() => P.$('#h-title').textContent === '불이 켜지는 저녁');
  ok(P.$('#h-title').textContent === '불이 켜지는 저녁', '?plate=school-night → 제목 「불이 켜지는 저녁」');
  ok(P.vids.length === 1 && /school-night\.mp4$/.test(P.vids[0].src) && P.fetched.includes('school-night.json'), 'night 틀 영상·JSON 을 읽음');
  ok(P.$('[data-plate="school-night"]').classList.contains('on') && !P.$('[data-plate="school-build"]').classList.contains('on'), '틀 고르기 버튼 on 표시 (셋째)');
  ok(P.$('#f-sub').value === '내일 또 만나요', 'sub 없이 열면 엔딩 기본 자막 「내일 또 만나요」');
  ok(P.$('#f-photo-l').textContent.includes('처음에') && P.$('#note').innerHTML.includes('에서 시작해'), '라벨·설명이 「처음에 실사에서 시작」으로 전환');
  await P.wait(() => typeof P.$('[data-plate="school-build"]').onclick === 'function');
  const total = jn.frames / jn.fps + (+P.$('#f-tail').value);
  const until = (jn.photo_until - 1) / jn.fps;
  const a0 = await photoAlphaAt(P, 0, total), aMid = await photoAlphaAt(P, 0.9, total), aU = await photoAlphaAt(P, until, total), aEnd = await photoAlphaAt(P, jn.frames / jn.fps - 0.05, total), aTail = await photoAlphaAt(P, total, total);
  ok(a0 === 1, `0초: 실사 알파 1 (사진에서 시작) [${a0}]`);
  ok(aMid > 0 && aMid < 1, `0.9초: 역디졸브 진행 중 [${aMid.toFixed(3)}]`);
  ok(aU === 0, `photo_until(${until.toFixed(2)}s) 프레임: 실사 알파 0 (그 전에 끝남)`);
  ok(aEnd === 0 && aTail === 0, '틀 끝·여운: 끝 디졸브 없음 (저녁 그대로)');
  /* 체크 끄면 앞쪽도 실사 0 */
  P.$('#f-photo').checked = false;
  ok((await photoAlphaAt(P, 0, total)) === 0, '체크 끄면 시작도 3D 그대로');
  P.$('#f-photo').checked = true;
  /* build 로 전환: 기본 자막이 build 것으로 따라가고, 끝 디졸브 복귀 */
  P.$('[data-plate="school-build"]').click();
  await P.wait(() => P.$('#h-title').textContent === '학교가 지어진다');
  ok(P.$('#f-sub').value === '아이의 첫 시작을 함께합니다' && P.$('#f-photo-l').textContent.includes('끝에'), 'build 로 전환 → 기본 자막·라벨 복귀 (손 안 댄 자막이라 덮음)');
  const totalB = jb.frames / jb.fps + (+P.$('#f-tail').value);
  ok((await photoAlphaAt(P, 0, totalB)) === 0 && (await photoAlphaAt(P, totalB, totalB)) === 1, 'build: 시작 실사 0 · 끝 실사 1 (끝 디졸브 그대로)');
  ok(new URL(P.w.location.href).searchParams.get('plate') === 'school-build' && new URL(P.w.location.href).searchParams.get('school') === '금성초', '전환 시 주소 plate 갱신 · school 칸 유지');
}
{
  const P = await bootPage('?plate=school-night&sub=%EC%9A%B0%EB%A6%AC%20%ED%95%99%EA%B5%90');
  await P.wait(() => P.$('#h-title').textContent === '불이 켜지는 저녁');
  ok(P.$('#f-sub').value === '우리 학교', '주소 sub 있으면 기본 자막으로 안 덮음');
  await P.wait(() => typeof P.$('[data-plate="school-orbit"]').onclick === 'function');
  P.$('[data-plate="school-orbit"]').click();
  await P.wait(() => P.$('#h-title').textContent === '하늘에서 한 바퀴');
  ok(P.$('#f-sub').value === '우리 학교', '틀 바꿔도 사용자 sub 유지');
}
{
  const P = await bootPage('?plate=school-build');
  await P.wait(() => P.$('#h-title').textContent === '학교가 지어진다');
  P.$('#f-sub').value = '손으로 고침'; P.$('#f-sub').dispatchEvent(new P.w.Event('input'));
  await P.wait(() => typeof P.$('[data-plate="school-night"]').onclick === 'function');
  P.$('[data-plate="school-night"]').click();
  await P.wait(() => P.$('#h-title').textContent === '불이 켜지는 저녁');
  ok(P.$('#f-sub').value === '손으로 고침', '손으로 고친 자막은 틀 바꿔도 안 덮음');
}

/* ---- scene3d SCENES 셋째 줄 ---- */
{
  global.window = {};
  require('./data/scene3d.js');
  const S = window.MK_SCENE3D;
  const n = S.get('school-night');
  ok(S.SCENES.map((s) => s.id).join() === 'school,school-orbit,school-night', 'SCENES = school · orbit · night (순서)');
  ok(n.id === 'school-night' && n.ico === '🌆' && n.url === S.get('school').url && n.poster === '/kmake/plates/school-night.poster.png' && fs.existsSync('..' + n.poster), '셋째 장면: 🌆 · 같은 화면 · 자기 포스터 실존');
  ok(plateKeys.includes(n.preset.plate) && n.fields.join() === S.get('school').fields.join(), 'preset.plate 가 페이지 PLATES 에 있고 fields 동일');
  ok(S.url('school-night') === '/kmake/plates/school/?plate=school-night', 'url(night) 빈 인자 → ?plate=school-night');
  ok(S.url('school-night', { plate: 'school-build' }).endsWith('?plate=school-build'), '사용자 plate 가 preset 보다 우선');
  const v = S.cardsFor('video');
  ok(v.indexOf('data-scene3d="school-orbit"') < v.indexOf('data-scene3d="school-night"') && S.cardsFor('print') === '', 'cardsFor: 영상 = … → orbit → night · 인쇄물 0');
  delete global.window;
}

/* ---- 실부팅: 문 3곳의 셋째 장면 ---- */
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
  const NIGHT = '/kmake/plates/school/?plate=school-night';
  let root = mount(w.MK_SCREENS.templates);
  const g = root.querySelector('.br-grid');
  ok(g && g.children[0].hasAttribute('data-te-award3d') && g.children[2].dataset.scene3d === 'school-orbit' && g.children[3].dataset.scene3d === 'school-night', 'Templates 격자: 3D 상장 → 지어진다 → 한 바퀴 → 불이 켜지는 저녁');
  g.children[3].click(); ok(opened[opened.length - 1] === NIGHT, 'Templates 카드 → ?plate=school-night');
  if (w.MK_SCREENS.home) {
    root = mount(w.MK_SCREENS.home);
    const c2 = root.querySelector('.h2-chip[data-scene3d="school-orbit"]'), c3 = root.querySelector('.h2-chip[data-scene3d="school-night"]');
    ok(!!c3 && c2.nextElementSibling === c3 && c3.textContent.includes('불이 켜지는 저녁') && !c3.textContent.includes('(영상)'), '홈: 🚁 칩 옆 🌆 불이 켜지는 저녁 칩');
    c3.click(); ok(opened[opened.length - 1] === NIGHT, '홈 칩 → ?plate=school-night');
  }
  w.PG.state.create = { step: 1, type: null, style: null, tpl: null };
  root = mount(w.MK_SCREENS.create);
  const k2 = root.querySelector('.hv-type[data-scene3d="school-orbit"]'), k3 = root.querySelector('.hv-type[data-scene3d="school-night"]');
  ok(!!k3 && k2.nextElementSibling === k3 && k3.nextElementSibling.hasAttribute('data-cf-award3d'), '만들기 1단계: … → 한 바퀴 → 저녁 → 3D 상장');
  k3.click(); ok(opened[opened.length - 1] === NIGHT, '만들기 카드 → ?plate=school-night');
  ok(opened.length === 3, '문 3곳 클릭 3번 = open 3번');
}
{
  for (const f of ['./index.html', '../maker/index.html']) ok(/scene3d\.js\?v=20260911a/.test(fs.readFileSync(f, 'utf8')), `${f}: scene3d 버스터 20260911a`);
}
console.log(`\n${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
