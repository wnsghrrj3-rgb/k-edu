// 케이무비 — 전체 점검 5번(미착수 5개): 자막 「이 말 잘라내기」·샷 색 맞춤·J/L 컷 버튼·-14 LUFS·자막 「내 스타일」
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-polish.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8779);
const FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1900, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text() + ' @' + (m.location() && m.location().url)); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
await page.route('**/cdn.jsdelivr.net/**', route => route.fulfill({ body: '', contentType: /\.css/.test(route.request().url()) ? 'text/css' : 'application/javascript' }));   // 차단망 — supabase·프리텐다드 CSS 는 비움
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI);
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4'), path.join(FX, 'b.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length >= 2 && KMV_PROJECT.data.V.every(c => { const s = KMV_MEDIA.get(c.media); return s && s.analyzed; }), null, { timeout: 90000 });
const vis = sel => page.evaluate(s => { const el = document.querySelector(s); return !!el && !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none'; }, sel);

/* ---------- 1. 자막 「이 말 잘라내기」 ---------- */
const T1 = await page.evaluate(() => {
  const P = KMV_PROJECT;
  const s1 = P.addS({ text: '어 그러니까 음', at: 30, dur: 60, style: 'basic' });
  const s2 = P.addS({ text: '뒤 문장', at: 200, dur: 40, style: 'basic' });
  P.addMarker({ at: 250, text: '표시' }); KMV_UI.tab('sub'); KMV_UI.selectS(s1.id);
  return { total: P.total(), s1: s1.id, s2: s2.id, cutBtn: !!document.querySelector('#subList .sc.on .cut'), panelBtn: !!document.getElementById('btnSubCut') };
});
ok(T1.cutBtn && T1.panelBtn, '자막 목록 카드에 ✂ · 자막 카드 패널에 「이 말 잘라내기」');
await page.click('#subList .sc.on .cut');
const T1b = await page.evaluate(() => { const P = KMV_PROJECT; return { total: P.total(), s1: !!P.subtitle(window.__s1 || ''), S: P.data.S.map(s => [s.text, s.at]), mk: P.data.markers.map(m => m.at), toast: document.getElementById('toast').textContent }; });
ok(T1b.total === T1.total - 60, `✂ → 자막 구간 60f 만큼 리플 삭제 (${T1.total} → ${T1b.total})`);
ok(T1b.S.length === 1 && T1b.S[0][0] === '뒤 문장' && T1b.S[0][1] === 140 && T1b.mk[0] === 190, '잘린 자막은 사라지고 뒤 자막·마커는 60f 당겨짐');
ok(/잘라냈어요/.test(T1b.toast) && /Ctrl\+Z/.test(T1b.toast), '토스트에 되돌리기 안내');
await page.keyboard.press('Control+z');
const T1c = await page.evaluate(() => ({ total: KMV_PROJECT.total(), S: KMV_PROJECT.data.S.length }));
ok(T1c.total === T1.total && T1c.S === 2, 'Ctrl+Z 한 번에 전부 복귀');
// 패널 버튼 경로 + 영상 밖 자막은 안전장치
await page.evaluate(() => { const P = KMV_PROJECT; KMV_UI.selectS(P.data.S[0].id); });
await page.click('#btnSubCut');
const T1d = await page.evaluate(() => { const P = KMV_PROJECT; const s = P.addS({ text: '밖', at: P.total() + 100, dur: 30, style: 'basic' }); KMV_UI.selectS(s.id); const t0 = P.total(); document.getElementById('btnSubCut').click(); return { total: P.total(), t0, toast: document.getElementById('toast').textContent, S: P.data.S.length }; });
ok(T1d.t0 === T1.total - 60 && T1d.total === T1d.t0 && /영상 밖/.test(T1d.toast), '패널 버튼도 같은 길 · 영상 밖 자막은 잘라내지 않고 안내만');
await page.evaluate(() => { const P = KMV_PROJECT; P.undo(); P.clearS(); P.undo(); P.undo(); });

/* ---------- 2. J/L 컷 버튼 ---------- */
const T2 = await page.evaluate(() => {
  const P = KMV_PROJECT; const c1 = P.data.V[1]; KMV_UI.select(c1.id);
  const m = P.media(c1.media), a0 = Object.assign({}, P.audioOf(c1.id));
  return { fps: m.fps, mdur: m.dur, in: c1.in, out: c1.out, at: c1.at, a0, jl: !document.getElementById('rowJL').classList.contains('hidden'), link: document.getElementById('rowLink').classList.contains('hidden') };
});
ok(T2.jl && T2.link, '정속 영상 클립을 고르면 J/L 행이 보이고(링크 상태라 링크 행은 숨김)');
// 두 번째 클립(b 는 in=0) — J 는 원본 앞이 없어 안내, L 은 out 이 늘어난다
await page.click('#btnJcut');
const T2a = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[1], a = P.audioOf(c.id); return { in: a.in, linked: a.linked, toast: document.getElementById('toast').textContent }; });
ok(T2a.in === 0 && T2a.linked === true && /앞에/.test(T2a.toast), 'in=0 클립의 J 컷은 당길 소리가 없다고 안내(모델 무변경)');
// 첫 클립을 20f 앞에서 자른 뒤 두 번째 클립에서 J
await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[1]; P.trim(c.id, 'in', c.in + 20); KMV_UI.select(P.data.V[1].id); });
await page.click('#btnJcut');
const T2b = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[1], a = P.audioOf(c.id); return { cin: c.in, ain: a.in, aat: a.at, cat: c.at, linked: a.linked, link: !document.getElementById('rowLink').classList.contains('hidden'), state: document.getElementById('linkState').textContent, toast: document.getElementById('toast').textContent }; });
ok(T2b.ain === T2b.cin - 15 && T2b.aat === T2b.cat - 15 && T2b.linked === false, `J 컷 — 소리 in 이 15f(0.5초) 앞으로, 소리 띠가 영상보다 먼저 시작 (${T2b.aat} < ${T2b.cat})`);
ok(T2b.link && /소리 먼저/.test(T2b.state) && /J 컷/.test(T2b.toast), '링크 행 「J/L 컷 (소리 먼저)」 표시 · 토스트');
await page.click('#btnJcut');
const T2c = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[1], a = P.audioOf(c.id); return { d: c.in - a.in }; });
ok(T2c.d === 20, '한 번 더 누르면 0.5초 더 — 원본 앞(20f)까지가 한계라 20f 에서 멈춤');
// 첫 클립에서 L
await page.evaluate(() => { const P = KMV_PROJECT, c0 = P.data.V[0]; P.trim(c0.id, 'out', c0.out - 40); KMV_UI.select(P.data.V[0].id); });
await page.click('#btnLcut'); await page.click('#btnLcut');
const T2d = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[0], a = P.audioOf(c.id); return { d: a.out - c.out, aend: a.at + a.dur, cend: c.at + c.dur, state: document.getElementById('linkState').textContent }; });
ok(T2d.d === 30 && T2d.aend === T2d.cend + 30 && /소리 나중/.test(T2d.state), 'L 컷 두 번 — 소리 out 이 30f 뒤로, 소리 띠가 다음 컷 위로 1초 이어짐');
await page.keyboard.press('Control+z');
const T2e = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[0], a = P.audioOf(c.id); return a.out - c.out; });
ok(T2e === 15, 'Ctrl+Z 는 한 번 누른 만큼만');
await page.click('#btnRelink');
const T2f = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[0], a = P.audioOf(c.id); P.setSpeed(c.id, 'slow'); const hid = document.getElementById('rowJL').classList.contains('hidden'); P.setSpeed(c.id, 'normal'); return { linked: a.linked, same: a.out === c.out, hid }; });
ok(T2f.linked && T2f.same && T2f.hid, '링크 복원 → 소리 띠 = 영상 · 슬로 클립엔 J/L 행 숨김');

/* ---------- 3. 샷 색 맞춤 ---------- */
await page.evaluate(() => { KMV_UI.tab('look'); KMV_UI.select(KMV_PROJECT.data.V[0].id); });
const T3 = await page.evaluate(() => {
  const P = KMV_PROJECT, L = KMV_LOOK, a = P.data.V[0], b = P.data.V[1];
  const mp1 = L.matchParams(a.media, b.media), mp2 = L.matchParams(a.media, b.media);
  const note = document.getElementById('shotMatchNote').textContent;
  return { mp: mp1, same: JSON.stringify(mp1) === JSON.stringify(mp2), self: L.matchParams(a.media, a.media), note, offHidden: document.getElementById('btnShotMatchOff').classList.contains('hidden') };
});
ok(T3.mp && T3.mp.wb.length === 3 && T3.same, `matchParams 결정적 — wb ${T3.mp.wb.join('/')} gain ${T3.mp.gain} off ${T3.mp.off}`);
ok(T3.self && T3.self.wb.every(v => Math.abs(v - 1) < 1e-6) && Math.abs(T3.self.gain - 1) < 1e-6 && Math.abs(T3.self.off) < 1e-6, '자기 자신에 맞추면 1/1/1 · 게인 1 · 오프셋 0');
ok(/기준으로/.test(T3.note) && T3.offHidden, '룩 탭 안내가 고른 클립 이름을 보여주고, 적용 전엔 「해제」 숨김');
await page.click('#btnShotMatch');
const T3a = await page.evaluate(() => {
  const P = KMV_PROJECT, L = KMV_LOOK, a = P.data.V[0], b = P.data.V[1];
  const pa = L.resolve(a, P.data.look), pb = L.resolve(b, P.data.look);
  const W = 64, H = 36, cv = new OffscreenCanvas(W, H), ctx = cv.getContext('2d');
  const px = p => { ctx.fillStyle = 'rgb(120,120,120)'; ctx.fillRect(0, 0, W, H); L.applyCPU(ctx, W, H, Object.assign({}, p, { lut: null, vig: 0 })); const d = ctx.getImageData(W >> 1, H >> 1, 1, 1).data; return [d[0], d[1], d[2]]; };
  const raw = Object.assign({}, pb, { gain: 1, off: 0, wb: [1, 1, 1] });
  return { aMatch: !!(a.look && a.look.match), bMatch: b.look && b.look.match, ref: b.look && b.look.match && b.look.match.ref === a.id, pa: [pa.gain, pa.off, pa.wb.join(',')], pb: [pb.gain, pb.off, pb.wb.join(',')], pxOn: px(pb), pxRaw: px(raw), toast: document.getElementById('toast').textContent, note: document.getElementById('shotMatchNote').textContent, clipNote: document.getElementById('matchNote').classList.contains('hidden'), offVisible: !document.getElementById('btnShotMatchOff').classList.contains('hidden') };
});
ok(!T3a.aMatch && T3a.bMatch && T3a.ref, '기준 클립엔 안 붙고 다른 클립 look.match 에 계수(+기준 id) 저장');
ok(T3a.pa[0] === 1 && T3a.pa[1] === 0 && T3a.pa[2] === '1,1,1', '기준 클립 resolve 는 그대로');
ok(!(T3a.pb[0] === 1 && T3a.pb[1] === 0 && T3a.pb[2] === '1,1,1'), `맞춘 클립 resolve 에 계수 반영 (gain ${T3a.pb[0]} off ${T3a.pb[1]} wb ${T3a.pb[2]})`);
ok(T3a.pxOn.join() !== T3a.pxRaw.join(), `픽셀이 실제로 달라짐 (회색 120 → ${T3a.pxOn.join(',')})`);
ok(/맞췄어요/.test(T3a.toast) && /적용 중/.test(T3a.note) && T3a.offVisible && T3a.clipNote, '토스트·룩 탭 「적용 중 — 클립 1개」·「해제」 표시 (기준 클립 패널엔 안내 없음)');
const T3b = await page.evaluate(() => { const P = KMV_PROJECT; KMV_UI.select(P.data.V[1].id); const el = document.getElementById('matchNote'); const j = JSON.parse(JSON.stringify(P.toJSON())); return { note: el.textContent, hidden: el.classList.contains('hidden'), saved: !!(j.V[1].look && j.V[1].look.match && j.V[1].look.match.wb) }; });
ok(!T3b.hidden && /기준: a\.mp4/.test(T3b.note) && T3b.saved, '맞춘 클립 패널에 「적용 중 — 기준: a.mp4」 · 작업 파일에 저장됨');
await page.keyboard.press('Control+z');
const T3c = await page.evaluate(() => KMV_PROJECT.data.V.some(c => c.look && c.look.match));
ok(!T3c, 'Ctrl+Z 한 번에 전부 해제');
await page.evaluate(() => { KMV_UI.select(KMV_PROJECT.data.V[1].id); }); await page.click('#btnShotMatch');
const T3d = await page.evaluate(() => { const P = KMV_PROJECT; return { a: !!(P.data.V[0].look && P.data.V[0].look.match), b: !!(P.data.V[1].look && P.data.V[1].look.match) }; });
ok(T3d.a && !T3d.b, '기준을 두 번째 클립으로 바꾸면 첫 클립이 맞춰지고 두 번째는 풀림');
await page.click('#btnShotMatchOff');
const T3e = await page.evaluate(() => ({ any: KMV_PROJECT.data.V.some(c => c.look && c.look.match), toast: document.getElementById('toast').textContent, look0: KMV_PROJECT.data.V[0].look }));
ok(!T3e.any && /풀었어요/.test(T3e.toast) && T3e.look0 === null, '「해제」 → 전부 풀리고 빈 look 은 null 로');
await page.evaluate(() => { KMV_UI.select(null); }); await page.click('#btnShotMatch');
const T3f = await page.evaluate(() => document.getElementById('toast').textContent);
ok(/먼저 골라/.test(T3f), '클립을 안 고르고 누르면 안내');

/* ---------- 4. -14 LUFS ---------- */
await page.evaluate(() => { KMV_UI.tab('music'); });
const T4 = await page.evaluate(() => ({ on: KMV_PROJECT.data.audio.loudness.on, tg: document.getElementById('tgLoud').classList.contains('on'), noteHidden: document.getElementById('loudNote').classList.contains('hidden') }));
ok(T4.on === false && !T4.tg && T4.noteHidden, '기본은 꺼짐 (옛 프로젝트 소리가 갑자기 달라지지 않게)');
await page.click('#tgLoud');
const T4a = await page.evaluate(async () => {
  const P = KMV_PROJECT, L = KMV_LOUD, A = KMV_AUDIO;
  const on = P.data.audio.loudness.on, tg = document.getElementById('tgLoud').classList.contains('on');
  const mt = L.meter(A.SR, 2); await A.renderMix(P.total(), async mix => { mt.push([mix.getChannelData(0), mix.getChannelData(1)]); });
  const r = mt.result(), gdb = L.gainDb(r.lufs, r.peak, -14);
  const mt2 = L.meter(A.SR, 2); await A.renderMix(P.total(), async mix => { mt2.push([mix.getChannelData(0), mix.getChannelData(1)]); });
  const j = P.toJSON(); const saved = j.audio.loudness.on === true && j.audio.loudness.target === -14;
  return { on, tg, lufs: r.lufs, peak: r.peak, gdb, same: mt2.result().lufs === r.lufs, saved, blocks: r.blocks };
});
ok(T4a.on && T4a.tg && T4a.saved, '켜면 모델·토글·작업 파일에 반영 (target -14)');
ok(isFinite(T4a.lufs) && T4a.peak > 0 && T4a.blocks > 10, `타임라인 믹스를 15초 창으로 재도 값이 나온다: ${T4a.lufs.toFixed(1)} LUFS · 피크 ${(20 * Math.log10(T4a.peak)).toFixed(1)} dBFS`);
ok(isFinite(T4a.gdb) && Math.abs(T4a.gdb) <= 24 && T4a.same, `내보내기 게인 ${T4a.gdb >= 0 ? '+' : ''}${T4a.gdb.toFixed(1)} dB · 두 번 재도 같은 값`);
const T4b = await page.evaluate(() => { const P = KMV_PROJECT; P.load(JSON.parse(JSON.stringify(P.toJSON()))); const l1 = P.data.audio.loudness.on; const j = P.toJSON(); delete j.audio.loudness; P.load(j); const l2 = P.data.audio.loudness; return { l1, l2 }; });
ok(T4b.l1 === true && T4b.l2 && T4b.l2.on === false && T4b.l2.target === -14, '저장·복원 유지 · 옛 작업 파일(항목 없음)은 꺼짐으로 채움');
await page.evaluate(() => KMV_PROJECT.setLoudness({ on: false }));

/* ---------- 5. 자막 「내 스타일」 ---------- */
await page.evaluate(() => { KMV_UI.tab('sub'); });
const T5 = await page.evaluate(() => {
  const P = KMV_PROJECT; P.clearS(); const s1 = P.addS({ text: '첫 자막', at: 10, dur: 40, style: 'basic' }); const s2 = P.addS({ text: '둘째', at: 80, dur: 40, style: 'basic' });
  P.updateS(s1.id, { style: 'bar', font: 'blackhan', size: 150, pos: 'top', color: 'gold', fxIn: { type: 'type', dur: 'long' } });
  KMV_UI.selectS(s1.id);
  return { s1: s1.id, s2: s2.id, none: document.querySelector('#myStyles .none') && document.querySelector('#myStyles .none').textContent, btn: !!document.getElementById('btnStyleSave'), opt: !!document.querySelector('#subDefStyle optgroup[data-my]') };
});
ok(/없음/.test(T5.none || '') && T5.btn && !T5.opt, '저장 전: 「없음 — 지금 모양을 저장」 · 새 자막 select 에 내 스타일 그룹 없음');
page.on('dialog', d => d.accept('금성 띠'));
await page.click('#btnStyleSave'); await new Promise(r => setTimeout(r, 150));
const T5a = await page.evaluate(() => {
  const P = KMV_PROJECT, st = P.data.styles[0];
  return { n: P.data.styles.length, st, chips: Array.from(document.querySelectorAll('#myStyles .chip')).map(c => c.firstChild.textContent), opts: Array.from(document.querySelectorAll('#subDefStyle optgroup[data-my] option')).map(o => [o.value, o.textContent]), toast: document.getElementById('toast').textContent };
});
ok(T5a.n === 1 && T5a.st.name === '금성 띠' && T5a.st.style === 'bar' && T5a.st.font === 'blackhan' && T5a.st.size === 150 && T5a.st.pos === 'top' && T5a.st.color === 'gold' && T5a.st.fxIn && T5a.st.fxIn.type === 'type' && T5a.st.fxOut === null, '저장 → 프로젝트 styles 에 스타일·글꼴·크기·위치·색·등장 (퇴장 없음은 null)');
ok(T5a.chips.join() === '금성 띠' && T5a.opts.length === 1 && T5a.opts[0][0] === 'my:' + T5a.st.id && /저장/.test(T5a.toast), '칩 · 새 자막 select 「내 스타일」 그룹 · 토스트');
// 둘째 카드에 입히기
await page.evaluate(() => { KMV_UI.selectS(KMV_PROJECT.data.S.find(x => x.text === '둘째').id); });
await page.click('#myStyles .chip');
const T5b = await page.evaluate(() => { const P = KMV_PROJECT, s = P.data.S.find(x => x.text === '둘째'); return { style: s.style, font: s.font, size: s.size, pos: s.pos, color: s.color, fx: s.fxIn && s.fxIn.type, text: s.text, font_ui: document.getElementById('subFont').value, size_ui: document.getElementById('subSize').value }; });
ok(T5b.style === 'bar' && T5b.font === 'blackhan' && T5b.size === 150 && T5b.pos === 'top' && T5b.color === 'gold' && T5b.fx === 'type' && T5b.text === '둘째', '칩 클릭 → 둘째 카드에 전부 입혀짐(문구는 그대로)');
ok(T5b.font_ui === 'blackhan' && T5b.size_ui === '150', '설정 열 조절기가 새 값을 보여줌');
await page.keyboard.press('Control+z');
const T5c = await page.evaluate(() => { const s = KMV_PROJECT.data.S.find(x => x.text === '둘째'); return s.style === 'basic' && !s.font; });
ok(T5c, 'Ctrl+Z 한 번에 둘째 카드 원래대로');
// 「새 자막」 기본값으로 고르고 ＋ 여기에
await page.selectOption('#subDefStyle', 'my:' + T5a.st.id);
await page.evaluate(() => { document.getElementById('subText').value = '새로 넣은 자막'; KMV_UI.setPH(150); });
await page.click('#btnSubAdd');
const T5d = await page.evaluate(() => { const P = KMV_PROJECT, s = P.data.S.find(x => x.text === '새로 넣은 자막'); return s && { style: s.style, font: s.font, size: s.size, color: s.color, fx: s.fxIn && s.fxIn.type, at: s.at }; });
ok(T5d && T5d.style === 'bar' && T5d.font === 'blackhan' && T5d.size === 150 && T5d.color === 'gold' && T5d.fx === 'type' && T5d.at === 150, '「새 자막」을 내 스타일로 두면 ＋ 여기에 가 그 모양으로 생김');
// 같은 이름으로 다시 저장 = 덮어쓰기 · 저장·복원 · 지우기
const T5e = await page.evaluate(async () => {
  const P = KMV_PROJECT, s = P.data.S[0]; P.updateS(s.id, { size: 80 }); const st = P.addStyle('금성 띠', s);
  const j = JSON.parse(JSON.stringify(P.toJSON())); P.load(j);
  return { n: P.data.styles.length, size: P.data.styles[0].size, sameId: st.id === P.data.styles[0].id, chips: document.querySelectorAll('#myStyles .chip').length, sel: document.getElementById('subDefStyle').value };
});
ok(T5e.n === 1 && T5e.size === 80 && T5e.sameId && T5e.chips === 1, '같은 이름은 덮어쓰기(id 유지) · 저장·복원 뒤에도 남는다');
await page.evaluate(() => { KMV_UI.selectS(KMV_PROJECT.data.S[0].id); });
await page.click('#myStyles .chip i');
const T5f = await page.evaluate(() => ({ n: KMV_PROJECT.data.styles.length, none: !!document.querySelector('#myStyles .none'), opt: !!document.querySelector('#subDefStyle optgroup[data-my]'), sel: document.getElementById('subDefStyle').value }));
ok(T5f.n === 0 && T5f.none && !T5f.opt && T5f.sel === 'basic', '✕ → 스타일 삭제, select 그룹 사라지고 새 자막 기본값은 basic 으로');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
console.log(`\n${n - fail}/${n} 통과`);
await close(); srv.kill();
process.exit(fail ? 1 : 0);
