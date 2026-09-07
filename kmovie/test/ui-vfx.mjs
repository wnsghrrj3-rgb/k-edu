// 케이무비 화면 효과 21종(engine/vfx.js) 검증 — 등록·분류·픽셀·결정성·화면 가공·시간·패널·카드 놓기.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-vfx.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8781);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
process.env.KMV_PORT = String(PORT);
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KM_PARTS && window.KMV_VFX);

// ---------- 등록·분류 ----------
const reg = await page.evaluate(() => {
  const V = KMV_VFX, out = { ids: V.IDS.length, cat: V.IDS.every(id => KMV_PARTS.meta(id).cat === 'fx' && KMV_PARTS.meta(id).self), loop: V.IDS.filter(id => KMV_PARTS.meta(id).loop).length, total: KM_PARTS.list().length,
    fields: V.IDS.every(id => KM_PARTS.get(id).fields.length >= 1), amt: V.IDS.filter(id => KM_PARTS.get(id).fields.some(f => f.k === 'amt')).length };
  return out;
});
ok(reg.ids === 21 && reg.cat && reg.total === 49, '화면 효과 21종 등록 · 분류 「화면 효과」·self · 부품 총 49 (' + reg.total + ')');
ok(reg.loop === 18 && reg.fields && reg.amt === 19, '연속 효과 18(loop) · 한 방 3 · 세기 3단 필드 19 (' + reg.loop + '/' + reg.amt + ')');

// ---------- 픽셀·결정성·화면 가공 ----------
const pix = await page.evaluate(() => {
  const V = KMV_VFX, W = 640, H = 360, cv = new OffscreenCanvas(W, H), c = cv.getContext('2d'), out = {};
  const base = () => { const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#5a6f92'); g.addColorStop(0.5, '#c9b07a'); g.addColorStop(1, '#2d3a2a'); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = g; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.fillRect(200, 120, 240, 120); c.fillStyle = '#123'; c.fillRect(60, 250, 120, 60); };
  const grab = () => c.getImageData(0, 0, W, H).data;
  base(); const b0 = grab();
  const diff = (a, b) => { let d = 0; for (let i = 0; i < a.length; i += 4) d += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); return d / (a.length / 4); };
  for (const id of V.IDS) {
    const m = KMV_PARTS.meta(id), t = m.thumbT;
    const shot = () => { base(); try { KM_PARTS.frame(id, c, W, H, t, { _len: 6 }, 'geumseong'); } catch (e) { return 'throw:' + e.message; } return grab(); };
    const a = shot(), b = shot(); if (typeof a === 'string') { out[id] = { err: a }; continue; }
    let same = true; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) { same = false; break; }
    // 세기 강 > 약 (세기 필드가 있는 것만)
    let strongMore = null;
    if (KM_PARTS.get(id).fields.some(f => f.k === 'amt')) {
      base(); KM_PARTS.frame(id, c, W, H, t, { _len: 6, amt: 'soft' }, 'geumseong'); const s1 = diff(grab(), b0);
      base(); KM_PARTS.frame(id, c, W, H, t, { _len: 6, amt: 'strong' }, 'geumseong'); const s2 = diff(grab(), b0);
      strongMore = s2 >= s1 * 0.95;   // 글리치처럼 해시로 자리가 바뀌는 건 근사
    }
    out[id] = { d: diff(a, b0), same, strongMore };
  }
  return out;
});
let allDrawn = true, allSame = true, strongOK = true; const weak = [];
for (const id of Object.keys(pix)) { const r = pix[id]; if (r.err || r.d < 0.4) { allDrawn = false; weak.push(id + ':' + (r.err || r.d.toFixed(2))); } if (!r.same) allSame = false; if (r.strongMore === false) strongOK = false; }
ok(allDrawn, '21종 전부 화면을 바꿈 (throw 0 · 평균 차 ≥0.4)' + (weak.length ? ' — ' + weak.join(' ') : ''));
ok(allSame, '21종 결정적 — 같은 (t,p) 면 같은 픽셀');
ok(strongOK, '세기 「강」이 「약」보다 화면을 더 바꿈' + (strongOK ? '' : ' — ' + Object.entries(pix).filter(([k, v]) => v.strongMore === false).map(([k]) => k).join(' ')));
// 화면 가공 효과: 흰 상자(200..440,120..240) 안 픽셀이 바뀐다 (덮개가 아니라 가공)
const proc = await page.evaluate(() => {
  const W = 640, H = 360, cv = new OffscreenCanvas(W, H), c = cv.getContext('2d'), out = {};
  const base = () => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.fillStyle = '#204060'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.fillRect(200, 120, 240, 120); };
  const px = (x, y) => { const d = c.getImageData(x, y, 1, 1).data; return [d[0], d[1], d[2]]; };
  const cases = { vfxDuotone: [320, 180], vfxRgb: [201, 180], vfxOldFilm: [320, 180], vfxTilt: [205, 122], vfxFrame: [10, 10], vfxPunch: [196, 118], vfxShake: [196, 118], vfxGlow: [190, 180], vfxSoft: [201, 121], vfxGlitch: [320, 180] };
  for (const id of Object.keys(cases)) {
    const [x, y] = cases[id]; let best = 0;
    for (const t of [0.02, 0.06, 0.5, 1.0, 1.5, 2.0, 2.4]) { base(); const before = px(x, y); KM_PARTS.frame(id, c, W, H, t, { _len: 6, amt: 'strong', kind: 'quake', rate: 'busy', dir: 'in' }, 'geumseong'); const after = px(x, y); best = Math.max(best, Math.abs(before[0] - after[0]) + Math.abs(before[1] - after[1]) + Math.abs(before[2] - after[2])); }
    out[id] = best;
  }
  return out;
});
const procBad = Object.entries(proc).filter(([k, v]) => v < 6).map(([k, v]) => k + ':' + v);
ok(procBad.length === 0, '화면 가공 10종 — 아래 그림이 실제로 바뀜 (듀오톤·색 분리·오래된 필름·틸트·프레임·펀치·흔들림·글로우·소프트·글리치)' + (procBad.length ? ' — ' + procBad.join(' ') : ''));

// ---------- 시간: loop 는 늘여도 같은 속도, 한 방은 비례 · 봉투(_len) ----------
const tm = await page.evaluate(() => {
  const FPS = KMV_PROJECT.FPS, out = {};
  out.loopSame = KMV_PARTS.remap({ part: 'vfxGrain', dur: 60 * FPS }, 45 * FPS, FPS) === 45;
  out.oneShot = Math.abs(KMV_PARTS.remap({ part: 'vfxSweep', dur: Math.round(2.4 * FPS) }, Math.round(1.2 * FPS), FPS) - 0.6) < 0.05;
  // 봉투: 12초 카드의 11.9초는 흐려져 있어야(레터박스 바가 얇아짐)
  const W = 640, H = 360, cv = new OffscreenCanvas(W, H), c = cv.getContext('2d');
  const bar = (t, len) => { c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); KM_PARTS.frame('vfxLetterbox', c, W, H, t, { _len: len }, 'geumseong'); const d = c.getImageData(320, 0, 1, H).data; let n = 0; for (let y = 0; y < H; y++) if (d[y * 4] < 30) n++; return n; };
  out.mid = bar(6, 12); out.end = bar(11.9, 12); out.start = bar(0.1, 12);
  // 카드로 그릴 때 _len 이 카드 길이로 들어감 (drawCard 경유)
  const card = { part: 'vfxLetterbox', at: 0, dur: 12 * FPS, p: {} };
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); KMV_PARTS.drawCard(c, W, H, card, Math.round(11.9 * FPS), 'geumseong');
  const d = c.getImageData(320, 0, 1, H).data; let n = 0; for (let y = 0; y < H; y++) if (d[y * 4] < 30) n++; out.cardEnd = n;
  return out;
});
ok(tm.loopSame && tm.oneShot, '시간: 연속 효과는 늘여도 원속도(45초→45초) · 한 방(빛 스윕)은 비례');
ok(tm.mid > 80 && tm.end < tm.mid * 0.6 && tm.start < tm.mid * 0.6 && tm.cardEnd < tm.mid * 0.6, '봉투: 레터박스 바가 처음·끝에 들어오고 나감 (' + tm.start + '/' + tm.mid + '/' + tm.end + ' · 카드 경유 ' + tm.cardEnd + ')');

// ---------- 패널: 「화면 효과」 분류 안에 22칸(광누출+21) · 옵션 한글 ----------
const grid = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('#partGrid > *')); let cat = null; const byCat = {};
  for (const el of els) { if (el.classList.contains('cat')) { cat = el.textContent; byCat[cat] = 0; } else if (el.classList.contains('pc')) byCat[cat] = (byCat[cat] || 0) + 1; }
  const thumbs = Array.from(document.querySelectorAll('#partGrid .pc')).filter(e => e.dataset.id.startsWith('vfx')).map(e => { const c = e.querySelector('canvas').getContext('2d').getImageData(0, 0, 240, 135).data; let n = 0; for (let i = 3; i < c.length; i += 64) if (c[i] > 8) n++; return n; });
  return { fx: byCat['화면 효과'], cells: document.querySelectorAll('#partGrid .pc').length, thumbMin: Math.min(...thumbs) };
});
ok(grid.fx === 22 && grid.cells === 49, '꾸미기 패널: 「화면 효과」 22칸(광누출+21) · 총 49칸 (' + grid.fx + '/' + grid.cells + ')');
ok(grid.thumbMin > 200, '효과 썸네일 21장 전부 그려짐 (최소 픽셀 ' + grid.thumbMin + ')');

// ---------- 실제 클립 위에 카드 놓기 → 미리보기 프레임이 바뀜 · 설정 열에 세기 버튼 한글 ----------
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
const placed = await page.evaluate(async () => {
  const P = KMV_PROJECT, W = 640, H = 360, cv = new OffscreenCanvas(W, H), c = cv.getContext('2d');
  const sum = async () => { await KMV_RENDER.drawExact(c, W, H, 30); const d = c.getImageData(0, 0, W, H).data; let s = 0; for (let i = 0; i < d.length; i += 512) s += d[i] + d[i + 1] + d[i + 2]; return s; };
  const base = await sum();
  const pt = P.addP({ part: 'vfxDuotone', at: 0 });
  const after = await sum();
  KMV_UI.selectP && KMV_UI.selectP(pt.id);
  await new Promise(r => setTimeout(r, 120));
  const btns = Array.from(document.querySelectorAll('#partFields .seg button')).map(b => b.textContent);
  return { base, after, dur: pt.dur, btns, p: pt.p };
});
ok(placed.base !== placed.after && placed.dur === 180, '듀오톤 카드를 놓으면 미리보기 프레임이 바뀜 · 기본 6초 (' + placed.dur + 'f)');
ok(placed.btns.includes('약') && placed.btns.includes('강') && placed.btns.includes('네이비·금'), '설정 열: 세기 약/중/강 · 색 이름이 한글로 (' + placed.btns.slice(0, 6).join(',') + ')');

// ---------- 글꼴 고르기: 목록이 그 글꼴로 보인다 (준호 2026-09-07) ----------
const fp = await page.evaluate(async () => {
  const P = KMV_PROJECT, s0 = P.addS({ text: '금성 어린이 여러분', at: 0, dur: 60 });
  KMV_UI.selectS(s0.id); KMV_UI.selectP(null); await new Promise(r => setTimeout(r, 100));
  const wrap = document.getElementById('subFont').closest('.fpick'), btn = wrap.querySelector('.fpBtn'), list = wrap.querySelector('.fpList');
  const before = { btn: btn.textContent, hidden: list.classList.contains('hidden'), selVis: document.getElementById('subFont').getBoundingClientRect().height > 0 };
  btn.click(); await new Promise(r => setTimeout(r, 50));
  const items = Array.from(list.querySelectorAll('.fi')), fams = new Set(items.map(i => i.querySelector('.sm').style.fontFamily)), samples = new Set(items.map(i => i.querySelector('.sm').textContent));
  const cats = Array.from(list.querySelectorAll('.cat')).map(c => c.textContent);
  const pen = items.find(i => i.dataset.id === 'nanumpen'); pen.click(); await new Promise(r => setTimeout(r, 50));
  const after = { hidden: list.classList.contains('hidden'), sel: document.getElementById('subFont').value, font: P.subtitle(s0.id).font, btn: btn.textContent, fam: btn.style.fontFamily, links: document.querySelectorAll('link[href*="fonts.googleapis"]').length };
  return { before, n: items.length, fams: fams.size, sample: [...samples][0], cats, after };
});
ok(fp.before.btn === '기본 (프리텐다드)' && fp.before.hidden && fp.before.selVis && fp.n === 37 && fp.fams === 37 && fp.cats.length >= 5, '글꼴 목록 37칸 — 칸마다 제 글꼴로 보기 글 (' + fp.sample + ') · 분류 ' + fp.cats.join('/'));
ok(fp.after.hidden && fp.after.sel === 'nanumpen' && fp.after.font === 'nanumpen' && /나눔 펜/.test(fp.after.btn) && /Nanum Pen/.test(fp.after.fam) && fp.after.links >= 30, '고르면 자막 글꼴이 바뀌고 버튼도 그 글꼴로 · 글꼴 CSS ' + fp.after.links + '개 요청');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\nui-vfx: ${n - fail}/${n} 통과`);
await close(); srv.kill(); process.exit(fail ? 1 : 0);
