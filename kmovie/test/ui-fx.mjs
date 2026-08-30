// 케이무비 — 설정 열(글꼴·크기·위치·색·등장/퇴장) + KMV_FX(글씨 효과 20·클립 페이드 20·글꼴 36) 검증.
// 준호(2026-08-31): "오른쪽에 도구상자가 있으면 왼쪽엔 도구를 설정·조절하는 게 — 글씨체·크기·움직임 — 있어야 한다. 설명은 없어도 된다."
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-fx.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8773);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1900, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'application/javascript' });
});
await page.route('**/fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));   // 차단망 — 글꼴은 폴백
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_FX);

/* ---------- 1. 목록 ---------- */
const L = await page.evaluate(() => ({ text: KMV_FX.TEXT.length, textIds: new Set(KMV_FX.TEXT.map(x => x.id)).size, clip: KMV_FX.CLIP.length, clipIds: new Set(KMV_FX.CLIP.map(x => x.id)).size, fonts: KMV_FX.FONTS.length, fam: KMV_FX.FONTS.every(f => f.fam && f.ko && f.cat), cats: KMV_FX.FONT_CATS.length, out: KMV_FX.TEXT_OUT.length }));
ok(L.text === 20 && L.textIds === 20, '글씨 효과 20종 (id 겹침 없음)');
ok(L.clip === 20 && L.clipIds === 20, '클립 페이드 20종');
ok(L.fonts >= 36 && L.fam && L.cats === 5, `글꼴 ${L.fonts}종 · 5분류 (무료·상업 OFL)`);
ok(L.out === 4, '퇴장 4종 (거꾸로·페이드·블러·위로)');

/* 효과 수치가 결정적이고 범위 안 */
const T = await page.evaluate(() => {
  const out = {};
  for (const t of KMV_FX.TEXT) {
    const a = KMV_FX.text(t.id, 0.3, 12, { s: 1 }), b = KMV_FX.text(t.id, 0.3, 12, { s: 1 }), e = KMV_FX.text(t.id, 1, 12, { s: 1 });
    const per = a.per ? a.per(3, 12, { idx: 1, count: 4, line: 0, lines: 1 }) : null;
    out[t.id] = { same: JSON.stringify(a) === JSON.stringify(b), fin: [a.alpha, a.dy, a.scale, a.blur, a.ls, a.reveal, per ? per.alpha : 1].every(v => isFinite(v)), endAlpha: e.alpha, endReveal: e.reveal };
  }
  return out;
});
ok(Object.values(T).every(x => x.same && x.fin), '글씨 효과 20종 전부 결정적·유한값');
ok(Object.values(T).every(x => x.endAlpha >= 0.99 && x.endReveal >= 0.99), '등장이 끝나면(u=1) 전부 다 보임');

/* ---------- 2. 자막 카드 그리기 — 크기·위치·색·글꼴·등장/퇴장 ---------- */
const S = await page.evaluate(() => {
  const W = 960, H = 540, cv = new OffscreenCanvas(W, H), ctx = cv.getContext('2d');
  const T = KM_PARTS.THEMES.geumseong;
  const render = card => { ctx.clearRect(0, 0, W, H); KMV_SUBTITLE.drawCard(ctx, W, H, card.t == null ? 30 : card.t, Object.assign({ at: 0, dur: 90, style: 'basic', text: '금성초등학교 아이들' }, card), T, 0); return ctx.getImageData(0, 0, W, H).data; };
  const lit = (d, x0, y0, x1, y1) => { let c = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * W + x) * 4; if (d[i + 3] > 40 && d[i] + d[i + 1] + d[i + 2] > 300) c++; } return c; };
  const gold = d => { let c = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 60 && d[i] > 170 && d[i + 1] > 140 && d[i + 2] < 120) c++; return c; };
  const base = render({}), big = render({ size: 200 }), small = render({ size: 50 });
  const top = render({ pos: 'top' }), mid = render({ pos: 'mid' }), yUp = render({ y: -25 });
  const gd = render({ color: 'gold', style: 'docu' }), wh = render({ color: 'white', style: 'docu' });
  const ch0 = render({ fxIn: { type: 'chars', dur: 'long' }, t: 0 }), ch1 = render({ fxIn: { type: 'chars', dur: 'long' }, t: 6 }), chEnd = render({ fxIn: { type: 'chars', dur: 'long' }, t: 40 });
  const ty2 = render({ fxIn: { type: 'type' }, t: 2 }), tyEnd = render({ fxIn: { type: 'type' }, t: 40 });
  const outUp = render({ fxOut: { type: 'up', dur: 'long' }, t: 78 }), outFade = render({ fxOut: { type: 'fade', dur: 'long' }, t: 88 });
  const cy = d => { let sy = 0, c = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i + 3] > 40 && d[i] + d[i + 1] + d[i + 2] > 300) { sy += y; c++; } } return c ? sy / c : -1; };
  const blur0 = render({ fxIn: { type: 'blur', dur: 'long' }, t: 0 });
  const font = KMV_SUBTITLE.fontOf({ font: 'jua' }, 700, 40), font0 = KMV_SUBTITLE.fontOf({}, 700, 40);
  return {
    base: lit(base, 0, 0, W, H), big: lit(big, 0, 0, W, H), small: lit(small, 0, 0, W, H),
    baseTop: lit(base, 0, 0, W, H * 0.4), topTop: lit(top, 0, 0, W, H * 0.4), midMid: lit(mid, 0, H * 0.35, W, H * 0.65), yUpTop: lit(yUp, 0, 0, W, H * 0.72),
    gold: gold(gd), goldW: gold(wh),
    ch0: lit(ch0, 0, 0, W, H), ch1: lit(ch1, 0, 0, W, H), chEnd: lit(chEnd, 0, 0, W, H), ty2: lit(ty2, 0, 0, W, H), tyEnd: lit(tyEnd, 0, 0, W, H),
    outUpCy: cy(outUp), baseCy: cy(base), outFade: lit(outFade, 0, 0, W, H), blur0: lit(blur0, 0, 0, W, H),
    font, font0,
  };
});
ok(S.big > S.base * 2 && S.small < S.base * 0.6, `크기 — 50% ${S.small} < 100% ${S.base} < 200% ${S.big} 픽셀`);
ok(S.baseTop === 0 && S.topTop > 100 && S.midMid > 100 && S.yUpTop > 100, '위치 — 위/가운데/미세(−25%) 가 실제로 옮겨 그려짐');
ok(S.gold > S.goldW * 3 && S.gold > 100, `색 — 금 ${S.gold} vs 흰 ${S.goldW} 금색 픽셀`);
ok(S.ch0 < S.ch1 && S.ch1 < S.chEnd, `글자 순차 — 0f ${S.ch0} < 6f ${S.ch1} < 끝 ${S.chEnd}`);
ok(S.ty2 > 0 && S.ty2 < S.tyEnd * 0.4, `타자기 — 2f ${S.ty2} 는 끝 ${S.tyEnd} 의 일부`);
ok(S.outUpCy < S.baseCy - 3 && S.outFade < S.base * 0.5, `퇴장 — 「위로」 무게중심 ${S.baseCy.toFixed(0)}→${S.outUpCy.toFixed(0)}, 「페이드」 옅어짐`);
ok(S.blur0 < S.base * 0.5, '블러에서 — 시작은 흐리고 옅음');
ok(/"Jua"/.test(S.font) && !/Jua/.test(S.font0), '글꼴 — 카드 font 가 ctx.font 에 들어감 (jua → "Jua")');

/* ---------- 3. 부품 — 글꼴·크기·위치·등장 ---------- */
const Pp = await page.evaluate(() => {
  const W = 960, H = 540, cv = new OffscreenCanvas(W, H), ctx = cv.getContext('2d');
  const seen = []; Object.defineProperty(ctx, 'font', { set(v) { seen.push(v); this._f = v; }, get() { return this._f; }, configurable: true });
  KM_PARTS.frame('section', ctx, W, H, 2.0, { title: '교육과정', _font: 'Do Hyeon' }, 'geumseong');
  const withFont = seen.some(f => /"Do Hyeon"/.test(f)); seen.length = 0;
  KM_PARTS.frame('section', ctx, W, H, 2.0, { title: '교육과정' }, 'geumseong');
  const without = seen.some(f => /Do Hyeon/.test(f));
  const lit = d => { let c = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 40) c++; return c; };
  const bbox = d => { let x0 = W, x1 = 0, y0 = H, y1 = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } } return { x0, x1, y0, y1 }; };
  const render = card => { ctx.clearRect(0, 0, W, H); KMV_PARTS.drawCard(ctx, W, H, Object.assign({ part: 'tag', at: 0, dur: 150, p: KMV_PROJECT.partDefault('tag').p }, card), 60, 'geumseong'); return ctx.getImageData(0, 0, W, H).data; };
  const b = bbox(render({})), big = bbox(render({ size: 150 })), up = bbox(render({ y: 20 }));
  const fade0 = lit(render(Object.assign({ fxIn: { type: 'fade', dur: 'long' } }, {}))), fadeStart = (() => { ctx.clearRect(0, 0, W, H); KMV_PARTS.drawCard(ctx, W, H, { part: 'section', at: 0, dur: 150, p: { title: '교육과정' }, fxIn: { type: 'fade', dur: 'long' } }, 0, 'geumseong'); return lit(ctx.getImageData(0, 0, W, H).data); })();
  return { withFont, without, w0: b.x1 - b.x0, w1: big.x1 - big.x0, y0: b.y0, yUp: up.y0, fade0, fadeStart };
});
const W2 = 960;
ok(Pp.withFont && !Pp.without, '부품 — p._font 로 글꼴이 부품 글자에 들어감 (Do Hyeon)');
ok(Pp.w1 > Pp.w0 * 1.3 && Pp.w1 < W2, `부품 크기 150% → 폭 ${Pp.w0} → ${Pp.w1} (화면 안에 남음)`);
ok(Pp.yUp > Pp.y0 + 40, `부품 위치 +20 → 아래로 (${Pp.y0} → ${Pp.yUp})`);
ok(Pp.fadeStart < Pp.fade0 * 0.3, `부품 등장 페이드 — 0f ${Pp.fadeStart} < 60f ${Pp.fade0}`);

/* ---------- 4. 클립 페이드 — 렌더 ---------- */
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4'), path.join(FX, 'b.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length >= 2 && KMV_MEDIA.get(KMV_PROJECT.data.V[0].media), null, { timeout: 60000 });
await page.waitForTimeout(1500);
const C = await page.evaluate(async () => {
  const P = KMV_PROJECT, W = 480, H = 270, cv = new OffscreenCanvas(W, H), ctx = cv.getContext('2d');
  const c = P.data.V[0], m = KMV_MEDIA.get(c.media);
  await m.getFrame(0, true); await m.getFrame(3, true);
  const mean = d => { let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4) / 3; };
  const shot = async t => { await KMV_RENDER.drawExact(ctx, W, H, t); return ctx.getImageData(0, 0, W, H); };
  const base = mean((await shot(0)).data);
  P.setFade(c.id, 'in', { type: 'black', dur: 'long' }); const black0 = mean((await shot(0)).data), black20 = mean((await shot(20)).data), blackEnd = mean((await shot(40)).data);
  P.setFade(c.id, 'in', { type: 'white', dur: 'long' }); const white0 = mean((await shot(0)).data);
  P.setFade(c.id, 'in', { type: 'iris', dur: 'long' }); const ir = (await shot(3)).data; const corner = ir[0] + ir[1] + ir[2], center = (() => { const i = ((H / 2 | 0) * W + (W / 2 | 0)) * 4; return ir[i] + ir[i + 1] + ir[i + 2]; })();
  P.setFade(c.id, 'in', { type: 'hold' }); const hold = KMV_RENDER.draw(ctx, W, H, 3), heldIdx = hold.idx, normalIdx = P.srcFrame(c, 3);
  P.setFade(c.id, 'in', null); P.setFade(c.id, 'out', { type: 'navy', dur: 'long' }); const navyEnd = mean((await shot(c.dur - 1)).data), navyMid = mean((await shot(c.dur - 60)).data);
  P.setFade(c.id, 'out', null);
  let all = true; for (const f of KMV_FX.CLIP) { P.setFade(c.id, 'in', { type: f.id, dur: 'normal' }); try { await shot(4); } catch (e) { all = false; } }
  P.setFade(c.id, 'in', null);
  return { base, black0, black20, blackEnd, white0, corner, center, heldIdx, normalIdx, navyEnd, navyMid, all, undo: (() => { const n = P.data.V[0]; return n.fadeIn == null && n.fadeOut == null; })() };
});
ok(C.black0 < C.base * 0.25 && C.black20 > C.black0 && Math.abs(C.blackEnd - C.base) < 3, `페이드 검정 — 0f ${C.black0.toFixed(0)} → 20f ${C.black20.toFixed(0)} → 끝 ${C.blackEnd.toFixed(0)} (원본 ${C.base.toFixed(0)})`);
ok(C.white0 > C.base * 1.5, `페이드 흰 — 0f ${C.white0.toFixed(0)}`);
ok(C.corner < 30 && C.center > 60, `아이리스 — 모서리 ${C.corner} 검정 · 가운데 ${C.center} 보임`);
ok(C.heldIdx !== C.normalIdx && C.heldIdx === 0, `홀드 컷 — 3f 에도 첫 프레임(${C.heldIdx}, 원래 ${C.normalIdx})`);
ok(C.navyEnd < C.navyMid * 0.6, `퇴장 네이비 — 끝 ${C.navyEnd.toFixed(0)} < 중간 ${C.navyMid.toFixed(0)}`);
ok(C.all, '클립 페이드 20종 전부 오류 없이 그려짐');

/* ---------- 5. 설정 열 UI ---------- */
const U = await page.evaluate(() => {
  const P = KMV_PROJECT, vis = id => { const el = document.getElementById(id); return !!el && el.getBoundingClientRect().height > 0; };
  KMV_UI.select(null);
  const noneShown = Array.from(document.querySelectorAll('#colSet .none')).some(el => el.getBoundingClientRect().height > 0);
  const empty = { clip: vis('clipPanel'), tr: vis('trPanel'), sub: vis('subCardPanel'), none: noneShown };
  const s2 = P.addS({ text: '금성초', at: 0, dur: 90, style: 'gold' }); KMV_UI.selectS(s2.id);
  const subShown = vis('subCardPanel') && vis('subFont') && vis('subStyleSeg');
  const fontOpts = document.getElementById('subFont').options.length, fxOpts = document.getElementById('subFxIn').options.length, clipOpts = document.getElementById('clipFadeIn').options.length;
  const sel = document.getElementById('subFxIn'); sel.value = 'chars'; sel.dispatchEvent(new Event('change'));
  const after = P.subtitle(s2.id).fxIn;
  document.getElementById('subFxInDur').querySelector('[data-k="long"]').click();
  const afterDur = P.subtitle(s2.id).fxIn;
  const sz = document.getElementById('subSize'); sz.value = 150; sz.dispatchEvent(new Event('input')); sz.dispatchEvent(new Event('change'));
  const size = P.subtitle(s2.id).size;
  document.getElementById('subColorSeg').querySelector('[data-k="gold"]').click();
  document.getElementById('subPosSeg').querySelector('[data-k="top"]').click();
  const col = P.subtitle(s2.id).color, pos = P.subtitle(s2.id).pos;
  const f = document.getElementById('subFont'); f.value = 'nanumpen'; f.dispatchEvent(new Event('change'));
  const font = P.subtitle(s2.id).font;
  KMV_UI.selectS(null);
  KMV_UI.select(P.data.V[1].id);
  const clipShown = vis('clipPanel') && vis('clipFadeIn');
  const cf = document.getElementById('clipFadeIn'); cf.value = 'goldLine'; cf.dispatchEvent(new Event('change'));
  const fade = P.data.V[1].fadeIn;
  KMV_UI.select(null);
  const A = P.addP({ part: 'opening', at: 0 }); KMV_UI.selectP(A.id);
  const partShown = vis('inspector') && vis('partFont') && vis('partFxIn');
  const pf = document.getElementById('partFxIn'); pf.value = 'blur'; pf.dispatchEvent(new Event('change'));
  const partFx = P.part(A.id).fxIn;
  const defSel = document.getElementById('subDefStyle');
  return { empty, subShown, fontOpts, fxOpts, clipOpts, after, afterDur, size, col, pos, font, clipShown, fade, partShown, partFx, defOpts: defSel ? defSel.options.length : 0 };
});
ok(!U.empty.clip && !U.empty.tr && !U.empty.sub && !U.empty.none, '아무것도 안 고르면 설정 열에 패널·설명이 없다');
ok(U.subShown && U.fontOpts >= 37 && U.fxOpts === 21, `자막 카드 고르면 설정 열에 스타일·글꼴(${U.fontOpts})·등장(${U.fxOpts}) 조절기`);
ok(U.after && U.after.type === 'chars' && U.afterDur.dur === 'long', '등장 select + 길이 seg → 카드 fxIn');
ok(U.size === 150 && U.col === 'gold' && U.pos === 'top' && U.font === 'nanumpen', '크기·색·위치·글꼴 조절이 카드에 저장');
ok(U.clipShown && U.clipOpts === 21 && U.fade && U.fade.type === 'goldLine', '클립 고르면 등장/퇴장 조절기 (20종) → setFade');
ok(U.partShown && U.partFx && U.partFx.type === 'blur', '부품 고르면 카드 설정에 글꼴·크기·위치·등장/퇴장');
ok(U.defOpts === 9, '도구상자 자막에 새 자막 기본 스타일 select');

/* 저장·복원 */
await page.waitForTimeout(900);
const R = await page.evaluate(async () => { const r = await KMV_STORE.local.get(KMV_UI.proj.id); const s = r.doc.S[0], c = r.doc.V[1], p = r.doc.P[0]; return { s: s.font === 'nanumpen' && s.size === 150 && s.fxIn && s.fxIn.type === 'chars', c: c.fadeIn && c.fadeIn.type === 'goldLine', p: p.fxIn && p.fxIn.type === 'blur' }; });
ok(R.s && R.c && R.p, '글꼴·크기·효과·페이드가 작업 파일에 저장');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);
