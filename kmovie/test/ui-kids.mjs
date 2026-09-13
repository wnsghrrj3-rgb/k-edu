// 케이무비 57 — 학생 기준 도구상자(2026-09-13 준호: "가장 기본적이고 직관적으로, 구분이 쉽게, 학생이 기본 대상").
// 글자·사진·화면 넘기기·분위기·소리·더 보기 여섯 칸, 「＋ 글자 넣기」 한 번에 글자 카드·설정 열, 접이식 「더 보기」,
// 학생 말 이름(부품·전환·색 느낌), 내 영상으로 그린 전환·색 느낌 타일, 「우리 학교」 이름이 부품 기본 문구에 들어감.
// 실행: KMV_ELECTRON=$PWD/node_modules/electron/dist/electron xvfb-run -a node ui-kids.mjs
import { launch } from './launch.mjs';
import { spawn } from 'child_process';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.KMV_ROOT || path.resolve(HERE, '../..'), PORT = +(process.env.KMV_PORT || 8797);
const DEPS = process.env.KMV_DEPS || path.join(HERE, 'node_modules'), FX = process.env.KMV_FX || path.join(HERE, 'fx');
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
let n = 0, fail = 0; const ok = (c, m) => { n++; console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fail++; };
const { page, close } = await launch({ width: 1500, height: 900 });
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
await page.route('**/cdn.jsdelivr.net/**', route => {
  const u = route.request().url();
  if (u.includes('mp4box')) return route.fulfill({ path: path.join(DEPS, 'mp4box/dist/mp4box.all.min.js'), contentType: 'application/javascript' });
  if (u.includes('mp4-muxer')) return route.fulfill({ path: path.join(DEPS, 'mp4-muxer/build/mp4-muxer.js'), contentType: 'application/javascript' });
  return route.fulfill({ body: '', contentType: 'text/css' });
});
await page.goto(`http://127.0.0.1:${PORT}/kmovie/`); await page.waitForFunction(() => window.KMV_UI && window.KMV_PARTS && KMV_PARTS.ready());
await page.waitForTimeout(400);
const vis = id => `(function(){const e=document.getElementById('${id}');return !!e && e.getBoundingClientRect().height>0;})()`;

console.log('탭 여섯 칸');
const tabs = await page.evaluate(() => ({
  names: Array.from(document.querySelectorAll('#toolTabs button')).map(b => b.textContent),
  ids: Array.from(document.querySelectorAll('#toolTabs button')).map(b => b.dataset.tab),
  on: document.querySelector('#toolTabs button.on').dataset.tab,
}));
ok(tabs.names.join('/') === '글자/사진/화면 넘기기/분위기/소리/더 보기' && tabs.ids.join('/') === 'text/photo/trans/mood/sound/more', '탭: ' + tabs.names.join(' · '));
ok(tabs.on === 'text', '처음은 「글자」 탭');
const t1 = await page.evaluate(() => { KMV_UI.tab('text'); const v = id => document.getElementById(id).getBoundingClientRect().height > 0; return { text: v('textPanel'), part: v('partPanel'), sub: v('subPanel'), photo: v('photoPanel'), trans: v('transPanel'), look: v('lookPanel'), music: v('musicPanel'), auto: v('autoPanel'), proj: v('projPanel'), btn: v('btnTextAdd'), gal: v('subDefGallery'), galN: document.querySelectorAll('#subDefGallery .stile').length }; });
ok(t1.text && t1.part && t1.sub && t1.btn && t1.gal && t1.galN === 23 && !t1.photo && !t1.trans && !t1.look && !t1.music && !t1.auto && !t1.proj, '「글자」 탭 = 글자 넣기 버튼 + 모양 23개 + 멋진 글자 + 말소리 자막(접힘) — 나머지 숨음');
const hid = await page.evaluate(() => { const g = document.getElementById('partGrid'); const all = g.querySelectorAll('.pc').length; const shown = Array.from(g.querySelectorAll('.pc')).filter(e => getComputedStyle(e).display !== 'none').length; const fx = Array.from(g.querySelectorAll('.pc[data-cat=fx]')).every(e => getComputedStyle(e).display === 'none'); const ph = Array.from(g.querySelectorAll('.pc[data-cat=photo]')).every(e => getComputedStyle(e).display === 'none'); const catHid = Array.from(g.querySelectorAll('.cat[data-cat=fx], .cat[data-cat=photo]')).every(e => getComputedStyle(e).display === 'none'); return { all, shown, fx, ph, catHid }; });
ok(hid.all === 55 && hid.shown === 28 && hid.fx && hid.ph && hid.catHid, '멋진 글자: 총 55칸 중 화면 효과·사진 틀은 숨고 글자 부품 28칸만 보임 (' + hid.shown + '/' + hid.all + ')');
const names = await page.evaluate(() => Array.from(document.querySelectorAll('#partGrid .pc')).slice(0, 60).map(e => [e.dataset.id, e.querySelector('b').textContent, e.querySelector('small').textContent]));
const byId = Object.fromEntries(names.map(x => [x[0], x]));
ok(byId.knockout[1] === '뚫린 글자' && byId.lower3rd[1] === '이름표' && byId.opening[1] === '큰 제목' && byId.knockout[2].includes('영상이 보여요') && byId.vfxPunch[1] === '쿵! 확대', '타일 이름은 학생 말 + 한 줄 쓰임새 (뚫린 글자 · 이름표 · 큰 제목 · 쿵! 확대)');
const kidApi = await page.evaluate(() => ({ p: KMV_PARTS.kid('sweep'), t: KMV_TRANSITION.kid('dissolve'), u: KMV_PARTS.kid('nope') }));
ok(kidApi.p.name === '사람 뒤로 흐르는 글자' && kidApi.t.name === '스르르 겹치기' && kidApi.t.use && kidApi.u.name === 'nope', 'KMV_PARTS.kid · KMV_TRANSITION.kid — 없는 id 는 그대로');

console.log('＋ 글자 넣기');
await page.setInputFiles('#fileIn', [path.join(FX, 'a.mp4')]);
await page.waitForFunction(() => KMV_PROJECT.data.V.length === 1, null, { timeout: 90000 });
await page.evaluate(() => { KMV_UI.setPH(40); });
await page.click('#btnTextAdd'); await page.waitForTimeout(200);
const add = await page.evaluate(() => { const P = KMV_PROJECT, s = P.data.S[0]; return { n: P.data.S.length, at: s && s.at, dur: s && s.dur, text: s && s.text, style: s && s.style, sel: KMV_UI.selS === s.id, edit: !document.getElementById('subEdit').classList.contains('hidden'), focus: document.activeElement && document.activeElement.id, inspTop: document.getElementById('colSet').scrollTop, labels: Array.from(document.querySelectorAll('#subEdit > .row > label')).map(l => l.textContent) }; });
ok(add.n === 1 && add.at === 40 && add.dur === 90 && add.text === '여기에 글자' && add.style === 'basic' && add.sel, '누르면 글자 카드 하나가 플레이헤드(40)에 3초 · 기본 모양 · 바로 선택됨');
ok(add.edit && add.focus === 'subEditText' && add.inspTop === 0, '왼쪽 설정이 글자 칸으로 열리고 글자 칸에 커서 (바로 쓰면 됨)');
ok(add.labels.slice(0, 8).join('/') === '글자/글씨체/크기/색/모양/자리/나타나기/사라지기', '설정 순서: 글자 → 글씨체·크기·색 → 모양 → 자리 → 나타나기·사라지기 (' + add.labels.slice(0, 8).join('/') + ')');
await page.fill('#subEditText', '우리 반 소개'); await page.dispatchEvent('#subEditText', 'input'); await page.waitForTimeout(120);
const typed = await page.evaluate(() => KMV_PROJECT.data.S[0].text);
ok(typed === '우리 반 소개', '글자 칸에 쓰면 카드 글자가 바뀐다');
const foldSub = await page.evaluate(() => { const f = document.querySelector('.fold[data-fold=subAdv]'); const v = id => document.getElementById(id).getBoundingClientRect().height > 0; const a = { open: f.classList.contains('open'), subY: v('subY'), save: v('btnStyleSave') }; f.querySelector('.foldBtn').click(); const b = { open: f.classList.contains('open'), subY: v('subY'), save: v('btnStyleSave'), saved: localStorage.getItem('kmv.fold.subAdv') }; f.querySelector('.foldBtn').click(); return { a, b, c: f.classList.contains('open') }; });
ok(!foldSub.a.open && !foldSub.a.subY && !foldSub.a.save && foldSub.b.open && foldSub.b.subY && foldSub.b.save && foldSub.b.saved === '1' && !foldSub.c, '글자 설정 「더 보기」 — 기본 접힘(위아래·내 모양 숨음) · 누르면 펴짐·기억 · 다시 누르면 접힘');
const alias = await page.evaluate(() => { KMV_UI.tab('sub'); return { tab: KMV_UI.toolTab, on: document.querySelector('#toolTabs button.on').dataset.tab, stt: document.querySelector('.fold[data-fold=stt]').classList.contains('open'), subAdv: document.querySelector('.fold[data-fold=subAdv]').classList.contains('open'), subText: document.getElementById('subText').getBoundingClientRect().height > 0 }; });
ok(alias.tab === 'text' && alias.on === 'text' && alias.stt && alias.subAdv && alias.subText, '옛 탭 이름 tab(\'sub\') → 「글자」 탭 + 접힌 「더 보기」 전부 펴짐 (옛 코드·테스트 호환)');
await page.evaluate(() => { document.querySelectorAll('.fold').forEach(f => f.classList.remove('open')); });

console.log('사진 탭');
const ph = await page.evaluate(() => { KMV_UI.tab('photo'); const v = id => document.getElementById(id).getBoundingClientRect().height > 0; return { panel: v('photoPanel'), btn: v('btnPhotoImport'), grid: document.querySelectorAll('#photoGrid .pc').length, ids: Array.from(document.querySelectorAll('#photoGrid .pc')).map(e => e.dataset.id).join(','), shown: Array.from(document.querySelectorAll('#photoGrid .pc')).every(e => e.getBoundingClientRect().height > 0), text: !v('textPanel'), thumb: (() => { const c = document.querySelector('#photoGrid .pc canvas').getContext('2d').getImageData(0, 0, 240, 135).data; let k = 0; for (let i = 3; i < c.length; i += 64) if (c[i] > 8) k++; return k; })() }; });
ok(ph.panel && ph.btn && ph.grid === 5 && ph.ids.split(',').sort().join(',') === 'collage3,photoGrid4,photoOne,photoOpen,photoPair' && ph.shown && ph.text, '「사진」 탭 = 사진 가져오기 + 사진 틀 5칸 (' + ph.ids + ')');
ok(ph.thumb > 200, '사진 틀 타일도 썸네일이 그려짐 (픽셀 ' + ph.thumb + ')');
const dbl = await page.evaluate(() => { const b = document.getElementById('btnPhotoImport'); let clicked = 0; const orig = document.getElementById('btnImport2').onclick; document.getElementById('btnImport2').onclick = () => { clicked++; }; b.click(); document.getElementById('btnImport2').onclick = orig; return clicked; });
ok(dbl === 1, '「＋ 사진 가져오기」 = 미디어 띠의 가져오기와 같은 문');
await page.locator('#photoGrid .pc[data-id="photoOne"]').dblclick(); await page.waitForTimeout(150);
const placedPhoto = await page.evaluate(() => ({ n: KMV_PROJECT.data.P.length, part: KMV_PROJECT.data.P[0] && KMV_PROJECT.data.P[0].part, on: document.querySelector('#photoGrid .pc[data-id="photoOne"]').classList.contains('on') }));
ok(placedPhoto.n === 1 && placedPhoto.part === 'photoOne' && placedPhoto.on, '사진 틀 더블클릭 → 놓임 · 그 탭의 타일이 켜짐');
await page.evaluate(() => { const P = KMV_PROJECT; P.removeP(P.data.P[0].id); });

console.log('화면 넘기기 탭');
const tr = await page.evaluate(() => { KMV_UI.tab('trans'); const tiles = Array.from(document.querySelectorAll('#transGrid .stile')); const px = tiles.map(t => { const c = t.querySelector('canvas').getContext('2d').getImageData(0, 0, 176, 99).data; let k = 0; for (let i = 3; i < c.length; i += 64) if (c[i] > 8) k++; return k; }); return { n: tiles.length, names: tiles.slice(0, 3).map(t => t.querySelector('b').textContent).join('/'), uses: tiles.every(t => t.querySelector('small').textContent.length > 0), pxMin: Math.min(...px), hint: document.getElementById('transHint').textContent, on: (document.querySelector('#transGrid .stile.on') || {}).dataset }; });
ok(tr.n === 20 && tr.names === '바로 바뀜/스르르 겹치기/필름처럼 겹치기' && tr.uses, '전환 타일 20개 · 학생 말 이름 + 쓰임새 (' + tr.names + ')');
ok(tr.pxMin > 300, '타일마다 지금 프레임 위에 반쯤 넘어간 모습이 그려짐 (최소 픽셀 ' + tr.pxMin + ')');
await page.evaluate(() => { KMV_UI.select(null); KMV_UI.setPH(60); });
await page.click('#transGrid .stile[data-k="push"]'); await page.waitForTimeout(150);
const applied = await page.evaluate(() => { const P = KMV_PROJECT, c = P.data.V[0]; return { tr: c.transIn, sel: KMV_UI.sel === c.id, on: (document.querySelector('#transGrid .stile.on') || {}).dataset.k, hint: document.getElementById('transHint').textContent, sel2: document.getElementById('trType').value }; });
ok(applied.tr && applied.tr.type === 'push' && applied.tr.dir === 'ltr' && applied.tr.dur === 'normal' && applied.sel && applied.on === 'push' && applied.sel2 === 'push', '타일 클릭 → 플레이헤드 아래 클립에 밀어내기(→, 보통) 붙고 클립 선택 · 타일 켜짐 · 설정 종류도 같이');
ok(applied.hint.includes('고른 클립') && applied.hint.includes('a.mp4'), '안내문이 고른 클립 이름을 보여 줌');
await page.click('#transGrid .stile[data-k="cut"]'); await page.waitForTimeout(100);
ok(await page.evaluate(() => !KMV_PROJECT.data.V[0].transIn), '「바로 바뀜」 = 전환 없음');
const optNames = await page.evaluate(() => Array.from(document.querySelectorAll('#trType option')).slice(0, 2).map(o => o.textContent).join('/'));
ok(optNames === '바로 바뀜/스르르 겹치기', '설정 열의 전환 종류 이름도 학생 말');

console.log('분위기 탭');
const md = await page.evaluate(() => { KMV_UI.tab('mood'); const v = id => document.getElementById(id).getBoundingClientRect().height > 0; const tiles = Array.from(document.querySelectorAll('#lutGallery .stile')); const px = tiles.map(t => { const c = t.querySelector('canvas').getContext('2d').getImageData(0, 0, 176, 99).data; let k = 0; for (let i = 3; i < c.length; i += 64) if (c[i] > 8) k++; return k; }); return { panel: v('lookPanel'), lut: tiles.length, names: tiles.map(t => t.querySelector('b').textContent).join('/'), pxMin: Math.min(...px), on: (document.querySelector('#lutGallery .stile.on') || {}).dataset.k, fx: document.querySelectorAll('#fxGrid .pc').length, fxShown: Array.from(document.querySelectorAll('#fxGrid .pc')).every(e => e.getBoundingClientRect().height > 0), adv: v('tgExpose'), fold: document.querySelector('.fold[data-fold=moodAdv]').classList.contains('open') }; });
ok(md.panel && md.lut === 4 && md.names === '원래 그대로/차분한 영화/밝고 깨끗/따뜻한 추억' && md.pxMin > 300 && md.on === 'cinema-navy', '색 느낌 타일 4개(원래 그대로 + 3) — 내 프레임에 입혀 그림 · 지금 것 켜짐 (' + md.names + ')');
ok(md.fx === 22 && md.fxShown && !md.adv && !md.fold, '화면 효과 22칸이 「분위기」 탭에 보이고, 밝기·색 맞춤 같은 조절기는 「더 보기」 뒤에 접힘');
await page.click('#lutGallery .stile[data-k="warm-memory"]'); await page.waitForTimeout(120);
const lutSet = await page.evaluate(() => ({ lut: KMV_PROJECT.data.look.lut, on: (document.querySelector('#lutGallery .stile.on') || {}).dataset.k, seg: (document.querySelector('#lutSeg .on') || {}).dataset.k }));
ok(lutSet.lut === 'warm-memory' && lutSet.on === 'warm-memory' && lutSet.seg === 'warm-memory', '타일 클릭 → 프로젝트 색 느낌 바뀜 · 타일·작은 버튼 둘 다 켜짐');
await page.click('#lutGallery .stile[data-k="none"]'); await page.waitForTimeout(80);
ok(await page.evaluate(() => KMV_PROJECT.data.look.lut === null), '「원래 그대로」 = 색 느낌 없음');
const lutDiff = await page.evaluate(() => { const g = id => { const c = document.querySelector('#lutGallery .stile[data-k="' + id + '"] canvas').getContext('2d').getImageData(0, 0, 176, 99).data; let s = 0; for (let i = 0; i < c.length; i += 4) s += c[i] - c[i + 2]; return s; }; return { a: g('none'), b: g('warm-memory'), c: g('cinema-navy') }; });
ok(lutDiff.b > lutDiff.a && lutDiff.c < lutDiff.a, '색 느낌마다 타일 색이 실제로 다르다 (따뜻한 추억은 더 붉고, 차분한 영화는 더 푸름)');

console.log('소리 · 더 보기');
const sd = await page.evaluate(() => { KMV_UI.tab('sound'); const v = id => document.getElementById(id).getBoundingClientRect().height > 0; return { music: v('musicPanel'), imp: v('btnMusicImport'), lib: v('libList') || v('libNote'), gen: v('btnGenPlace'), sfx: v('tgSfx'), duck: v('tgDuck'), mont: v('btnMontage'), fold: document.querySelector('.fold[data-fold=soundAdv]').classList.contains('open') }; });
ok(sd.music && sd.imp && sd.gen && !sd.sfx && !sd.duck && !sd.mont && !sd.fold, '「소리」 탭 = 음악 파일·내장 음원·만들기만 보이고 효과음·덕킹·몽타주는 접힘');
const sdAlias = await page.evaluate(() => { KMV_UI.tab('music'); const v = id => document.getElementById(id).getBoundingClientRect().height > 0; return { on: KMV_UI.toolTab, sfx: v('tgSfx'), loud: v('tgLoud') }; });
ok(sdAlias.on === 'sound' && sdAlias.sfx && sdAlias.loud, 'tab(\'music\') 별칭 → 소리 탭 + 접힌 것 펴짐');
await page.evaluate(() => { document.querySelectorAll('.fold').forEach(f => f.classList.remove('open')); });
const mr = await page.evaluate(() => { KMV_UI.tab('more'); const v = id => document.getElementById(id).getBoundingClientRect().height > 0; return { auto: v('autoPanel'), proj: v('projPanel'), school: v('schoolName'), sil: v('btnSilCut'), aspect: v('aspectSeg') }; });
ok(mr.auto && mr.proj && mr.school && mr.sil && mr.aspect, '「더 보기」 탭 = 자동으로 찾기 + 내 영상 정보(우리 학교·화면비·템플릿·마커)');
const goPhoto = await page.evaluate(() => { KMV_UI.tab('photo'); document.getElementById('btnGoPhotoSlide').click(); return KMV_UI.toolTab; });
ok(goPhoto === 'more', '「사진」 탭의 「사진 묶어 넣기로 가기」 → 더 보기 탭');
const remembered = await page.evaluate(() => { KMV_UI.tab('mood'); return localStorage.getItem('kmv.tab'); });
ok(remembered === 'mood', '탭은 이 브라우저에 기억');
const oldSaved = await page.evaluate(() => { localStorage.setItem('kmv.tab', 'parts'); KMV_UI.tab(localStorage.getItem('kmv.tab')); return { on: KMV_UI.toolTab, saved: localStorage.getItem('kmv.tab') }; });
ok(oldSaved.on === 'text' && oldSaved.saved === 'text', '옛 저장값(parts)로 시작해도 「글자」 탭으로 (저장값도 새 이름으로)');

console.log('우리 학교 이름');
await page.evaluate(() => { document.querySelectorAll('.fold').forEach(f => f.classList.remove('open')); KMV_UI.tab('text'); });
const sc0 = await page.evaluate(() => { const P = KMV_PROJECT; P.setSchool(null); const a = P.addP({ part: 'knockout', at: 0 }); const b = P.addP({ part: 'opening', at: 0 }); const c = P.addP({ part: 'lower3rd', at: 0 }); const r = { school: P.data.school, ko: a.p.text, koSub: a.p.sub, op: b.p.title, opEye: b.p.eyebrow, l3: c.p.name, l3role: c.p.role, name: P.schoolName(), short: P.schoolShort() }; [a, b, c].forEach(x => P.removeP(x.id)); return r; });
ok(sc0.school === null && sc0.name === '우리 학교' && sc0.short === '우리 학교' && sc0.ko === '우리 학교' && sc0.koSub === 'OUR SCHOOL' && sc0.op === '우리 학교' && sc0.opEye === 'OUR SCHOOL' && sc0.l3 === '이름' && sc0.l3role === '우리 학교 교장', '학교 이름 없을 때: 「금성초」 기본 문구가 「우리 학교」·「이름」으로 (금성초 전용이 아님)');
await page.evaluate(() => { KMV_UI.tab('more'); });
await page.fill('#schoolName', '한빛초등학교'); await page.dispatchEvent('#schoolName', 'change'); await page.waitForTimeout(120);
const sc1 = await page.evaluate(() => { const P = KMV_PROJECT; const a = P.addP({ part: 'knockout', at: 0 }); const b = P.addP({ part: 'opening', at: 0 }); const c = P.addP({ part: 'emblem', at: 0 }); const d = P.addP({ part: 'knockout', at: 0, p: { text: '직접 쓴 글' } }); const r = { school: P.data.school, short: P.schoolShort(), ko: a.p.text, koSub: a.p.sub, op: b.p.title, opEye: b.p.eyebrow, em: c.p.caption, own: d.p.text, toast: document.getElementById('toast').textContent, undo: P.canUndo ? P.canUndo() : true }; [a, b, c, d].forEach(x => P.removeP(x.id)); return r; });
ok(sc1.school === '한빛초등학교' && sc1.short === '한빛초' && sc1.ko === '한빛초' && sc1.koSub === '한빛초등학교' && sc1.op === '한빛초등학교' && sc1.opEye === '한빛초등학교' && sc1.em === '한빛초등학교', '「우리 학교」에 한빛초등학교 → 뚫린 글자 「한빛초」 · 큰 제목·학교 마크 「한빛초등학교」');
ok(sc1.own === '직접 쓴 글' && /한빛초등학교/.test(sc1.toast), '직접 준 글자는 그대로 · 토스트 안내');
const sc2 = await page.evaluate(() => { const P = KMV_PROJECT; const a = P.addP({ part: 'knockout', at: 0 }); P.updateP(a.id, { p: { text: '6학년 2반' } }); const t = P.part(a.id).p.text; P.removeP(a.id); return { t, saved: JSON.parse(JSON.stringify(P.data)).school }; });
ok(sc2.t === '6학년 2반' && sc2.saved === '한빛초등학교', '놓은 뒤 글자 칸에서 바꾸면 그대로 · 학교 이름은 작업 파일에 남음');
const sc3 = await page.evaluate(() => { const P = KMV_PROJECT; const snap = JSON.parse(JSON.stringify(P.data)); P.load(Object.assign(snap, { school: '늘푸른초' })); const s = P.data.school, sh = P.schoolShort(); P.load(Object.assign(JSON.parse(JSON.stringify(P.data)), { school: null })); const a = P.addP({ part: 'knockout', at: 0 }); const t = a.p.text; P.removeP(a.id); return { s, sh, t, inp: document.getElementById('schoolName').value }; });
ok(sc3.s === '늘푸른초' && sc3.sh === '늘푸른초' && sc3.t === '우리 학교' && sc3.inp === '', '불러온 작업의 학교 이름을 따르고, 없으면 도로 「우리 학교」 · 칸도 비워짐');

console.log('회귀 — 옛 동선');
await page.evaluate(() => { KMV_UI.tab('text'); });
await page.locator('#partGrid .pc[data-id="ribbon"]').dblclick(); await page.waitForTimeout(150);
const legacy = await page.evaluate(() => { const P = KMV_PROJECT, pt = P.data.P[P.data.P.length - 1]; const r = { part: pt && pt.part, edit: !document.getElementById('partEdit').classList.contains('hidden'), fields: document.querySelectorAll('#partFields input, #partFields select').length > 0, adv: document.getElementById('partAnchorSeg').getBoundingClientRect().height, labels: Array.from(document.querySelectorAll('#partEdit > .row > label')).map(l => l.textContent).join('/') }; P.removeP(pt.id); return r; });
ok(legacy.part === 'ribbon' && legacy.edit && legacy.fields && legacy.adv === 0 && legacy.labels === '글씨체/크기/나타나기/사라지기/길이', '멋진 글자 더블클릭 → 글자 칸 있는 설정이 열리고, 기준점·위치·사람 뒤는 「더 보기」 뒤 (' + legacy.labels + ')');

ok(errs.length === 0, '콘솔 오류 0' + (errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''));
console.log('\n' + (n - fail) + '/' + n + ' 통과');
await close(); srv.kill();
process.exit(fail ? 1 : 0);
