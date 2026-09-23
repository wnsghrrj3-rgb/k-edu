/* stage2/test_stage2.js — 2세대 무대 전수 하니스.
   ① 렌더 전수: 모든 데이터 파일의 모든 슬라이드를 renderSlide 로 그린다(정답 닫힘·열림 두 번). 예외 0 · 본문 빈 슬라이드 0.
   ② 무대 실주행: 과목마다 차시 몇 개를 stage.html 에 실제로 부팅해 끝까지 넘기고, 슬라이드마다 data-act 버튼을 전부 눌러 보고,
      정답 공개·목차·자료·타이머·뽑기·점수판·펜·스포트라이트·검은 화면·발문을 연다. 예외 0.
   실행: node kedu/teacher/stage2/test_stage2.js   (jsdom 필요: npm i jsdom)                           */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
let pass = 0, fail = 0; const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }

// ── 공용: 데이터 파일 로드 ──
function loadLessons(file) {
  const L = {}; const ctx = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; ctx.window.window = ctx.window;
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file }); return ctx.window.LESSONS || {};
}
// ── ① 렌더 전수 ──
const dom0 = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const g0 = dom0.window; g0.KT2_NO_BOOT = true;
vm.runInContext(fs.readFileSync(path.join(__dirname, 'stage2-art.js'), 'utf8'), dom0.getInternalVMContext(), { filename: 'stage2-art.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'stage2.js'), 'utf8'), dom0.getInternalVMContext(), { filename: 'stage2.js' });
const KT2 = g0.KT2;
const files = fs.readdirSync(DATA).filter(f => /^g\d_[a-z]+_u\d+\.js$/.test(f)).sort();
let nSlides = 0, nLessons = 0; const blockSeen = {}; const fragBlocks = {}; let emptyBodies = [];
files.forEach(f => {
  const L = loadLessons(path.join(DATA, f));
  Object.keys(L).forEach(k => {
    const les = L[k]; nLessons++;
    (les.slides || []).forEach(s => {
      nSlides++; blockSeen[s.block] = (blockSeen[s.block] || 0) + 1;
      [false, true].forEach(rev => {
        try {
          const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta || {}, unitTitle: 'U', classNames: [] });
          ok(typeof r.body === 'string', f + ' ' + k + ' ' + s.id + ' body string');
          if (!r.cover && !r.body.trim()) emptyBodies.push(f + ' ' + k + ' ' + s.id + ' ' + s.block);
          if (rev === false && r.frag) fragBlocks[s.block] = (fragBlocks[s.block] || 0) + 1;
        } catch (e) { fail++; fails.push(f + ' ' + k + ' ' + s.id + ' (' + s.block + ') 예외: ' + e.message); }
      });
    });
  });
});
ok(emptyBodies.length === 0, '본문 빈 슬라이드 ' + emptyBodies.length + ': ' + emptyBodies.slice(0, 8).join(' | '));
{ const r = KT2.md('가<br>나 <b>다</b> <script>x</script>'); ok(r === '가<br>나 <strong>다</strong> &lt;script&gt;x&lt;/script&gt;', 'md: <br>·<b> 만 살리고 다른 태그는 글자로 (' + r + ')'); }
{ const A = g0.KT2_ART; ['🐻', '🐧', '👧', '👦', '🐿️', '🐿'].forEach(f => ok(/^<svg class="chr c-/.test(A.character(f)) && /class="eyes"/.test(A.character(f)) && /class="m-open" opacity="0"/.test(A.character(f)), '인물 층: ' + f + ' → 그림 인물(눈·입 포함, 입은 기본 닫힘)')); ['🐰', '🙂', '', undefined].forEach(f => ok(A.character(f) === '', '인물 층: ' + f + ' → 이모지 그대로'));
  const r1 = KT2.renderSlide({ id: 'x', block: 'motivate', data: { title: '공원', kids: [{ face: '👧', label: '하나 "같이 놀자!"' }, { face: '🐰', label: '토끼' }] } }, { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] });
  ok((r1.body.match(/class="face chr"/g) || []).length === 1 && /<div class="face">🐰<\/div>/.test(r1.body), '인물 층: 아는 얼굴만 그림, 모르는 얼굴은 이모지 (kidCard)'); }
{ const r2 = KT2.renderSlide({ id: 'y', block: 'interactive_number_line', data: { range: [0, 10], start: 4 } }, { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] });
  ok(/numline hero/.test(r2.body) && /class="nl-hero" style="left:40%"/.test(r2.body) && (r2.body.match(/data-act="nl"/g) || []).length === 11, '징검다리: 지금 수(4) 돌 위에 도토 · 돌 11개 조작 그대로');
  const r3 = KT2.renderSlide({ id: 'z', block: 'interactive_number_line', data: { range: [0, 10], start: 4 } }, { revealed: false, state: { position: 7 }, meta: {}, unitTitle: 'U', classNames: [] });
  ok(/class="nl-hero" style="left:70%"/.test(r3.body), '징검다리: 움직이면 도토도 옮겨 선다 (7)'); }
let chrAll = 0;
let brLeak = 0; files.forEach(f => { const L = loadLessons(path.join(DATA, f)); Object.keys(L).forEach(k => (L[k].slides || []).forEach(s => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: L[k].meta || {}, unitTitle: 'U', classNames: [] }); if (/&lt;br|&lt;b&gt;/.test(r.body + r.title)) brLeak++; })); }); ok(brLeak === 0, '글자로 새는 <br>/<b> 슬라이드 ' + brLeak);
console.log('① 렌더 전수 — 파일', files.length, '· 차시', nLessons, '· 슬라이드', nSlides, '× 2(정답 닫힘·열림)');
console.log('   블록 종류', Object.keys(blockSeen).length, '· 조각 공개 블록', Object.keys(fragBlocks).length, '· 본문 빈 슬라이드', emptyBodies.length);

// ── ② 무대 실주행 ──
const manifest = (() => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(__dirname, 'manifest.js'), 'utf8'), c); return c.window.KT2_MANIFEST; })();
ok(manifest && manifest.lessons === nLessons, 'manifest 차시 수 = 데이터 차시 수 (' + (manifest && manifest.lessons) + ' vs ' + nLessons + ')');
const html = fs.readFileSync(path.join(__dirname, 'stage.html'), 'utf8');
function runStage(sj, un, l) {
  const url = 'https://keduclass.com/kedu/teacher/stage2/stage.html?g=' + sj.grade + '&s=' + sj.subject + '&u=' + un.unit + '&l=' + l.key;
  const dom = new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g, ''), { url, pretendToBeVisual: true, runScripts: 'outside-only' });
  const w = dom.window; const d = w.document; w.KT2_NO_BOOT = true; w.setInterval = () => 0;
  w.HTMLCanvasElement.prototype.getContext = () => null; w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  const ctx = dom.getInternalVMContext();
  const run = (p) => vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: path.basename(p) });
  w.LESSONS = {}; run(path.join(__dirname, 'manifest.js')); run(path.join(DATA, path.basename(un.file))); if (un.resources) run(path.join(ROOT, un.resources));
  run(path.join(ROOT, 'engine/klab.js')); run(path.join(ROOT, 'engine/tools/shape3d.js')); run(path.join(ROOT, 'engine/tools/place_value.js'));
  run(path.join(__dirname, 'stage2-art.js')); run(path.join(__dirname, 'stage2.js'));
  const tag = sj.slug + '/' + l.key;
  let st;
  try { st = new w.KT2.Stage({ params: { g: String(sj.grade), s: sj.subject, u: String(un.unit), l: l.key }, lessons: w.LESSONS, unitTitle: un.title }); } catch (e) { fail++; fails.push(tag + ' 부팅 예외: ' + e.message); return; }
  ok(st.slides.length === l.slides, tag + ' 슬라이드 수 ' + st.slides.length + ' = ' + l.slides);
  ok(d.querySelector('#kt2-paper').innerHTML.length > 100, tag + ' 첫 슬라이드 그림');
  ok(d.querySelector('#hud button[data-h="next"]'), tag + ' HUD 생성');
  ok(d.querySelector('#kt2-paper.anim, #kt2-paper .anim'), tag + ' 연출(anim) 걸림');
  ok(d.querySelector('#fx'), tag + ' 축하 캔버스');
  // 케이에듀 학급 명단(가짜 DB) → 뽑기·발표 뽑기
  try {
    w.supabase = {}; w.getKeduDb = () => ({ auth: { getUser: () => Promise.resolve({ data: { user: { id: 't1' } } }) }, from: (tbl) => { const q = { select: () => q, eq: () => q, order: () => q, limit: () => q, then: (fn) => Promise.resolve(tbl === 'class_codes' ? { data: [{ id: 'c1', label: '1학년 3반' }] } : { data: [{ nickname: '김하나', seat_no: 2 }, { nickname: '이둘', seat_no: 1 }] }).then(fn) }; return q; } });
    rosterChecks.push(st.loadRoster().then(() => { ok(st.rosterSrc === 'kedu' && st.classNames[0] === '1번 이둘' && st.classNames[1] === '2번 김하나', tag + ' 케이에듀 학급 명단 → 뽑기(번호순)'); st.openPick(); ok((d.querySelector('#ov-pick .pick-src').textContent || '').indexOf('1학년 3반') >= 0, tag + ' 뽑기 출처 표시'); st.closeOv(); }));
  } catch (e) { fail++; fails.push(tag + ' 명단 예외: ' + e.message); }
  let zoomN = 0, misOk = true, bubN = 0, picN = 0, chipN = 0, illusN = 0;
  let guard = 0, acts = 0, frags = 0;
  while (st.idx < st.slides.length - 1 && guard++ < 2000) {
    const before = st.idx;
    // 슬라이드 안 버튼 전부 눌러 보기(정답·조작)
    const paper = d.querySelector('#kt2-paper');
    Array.from(paper.querySelectorAll('[data-act]')).slice(0, 40).forEach(b => { try { st.act(b); acts++; } catch (e) { fail++; fails.push(tag + ' #' + (st.idx + 1) + ' act ' + b.getAttribute('data-act') + ' 예외: ' + e.message); } });
    if (st.idx % 2 === 0) try { st.revealAll(); st.revealAll(); } catch (e) { fail++; fails.push(tag + ' #' + (st.idx + 1) + ' revealAll 예외: ' + e.message); }
    try { st.next(); } catch (e) { fail++; fails.push(tag + ' #' + (st.idx + 1) + ' next 예외: ' + e.message); break; }
    if (st.idx === before) frags++;
    { const p2 = d.querySelector('#kt2-paper'); zoomN += p2.querySelectorAll('.zoomable').length; bubN += p2.querySelectorAll('.kid.talk .bub').length; chrAll += p2.querySelectorAll('.kid .face.chr svg.chr').length; picN += p2.querySelectorAll('.picture .bd').length; chipN += p2.querySelectorAll('svg.tenframe.chips .chip').length; p2.querySelectorAll('.img-frame img').forEach(im => { w.KT2.imgFallback(im); }); illusN += p2.querySelectorAll('.img-frame.illus .bd').length; if (st.cur().block === 'misconception' && p2.querySelectorAll('.mis-card').length !== 2) misOk = false; if (p2.querySelector('.zoomable')) { const z = p2.querySelector('.zoomable'); st.toggleZoom(z); if (!z.classList.contains('zoomed')) misOk = misOk && false; st.toggleZoom(z); } }
  }
  ok(st.idx === st.slides.length - 1, tag + ' 끝까지 넘김 (' + (st.idx + 1) + '/' + st.slides.length + ')');
  // 도구
  ['openToc', 'openRes', 'openTimer', 'openPick', 'openScore'].forEach(fn => { try { st[fn](); st.closeOv(); } catch (e) { fail++; fails.push(tag + ' ' + fn + ' 예외: ' + e.message); } });
  try { st.setPen(true); st.setPen(false); st.setSpot(true); st.setSpot(false); st.setBlack(true); st.setBlack(false); st.setTnote(true); st.setTnote(false); st.timerStart(60); st.timerTick(); st.timerPause(); st.prev(); st.go(0, -1); } catch (e) { fail++; fails.push(tag + ' 도구 예외: ' + e.message); }
  // 자료 열기(영상 → iframe)
  const vid = st.extras.find(e => e.type === 'video' && (e.video_id || /v=/.test(e.url || '')));
  if (vid) { try { st.openExtra(vid.id); ok(!!d.querySelector('#ov-media iframe'), tag + ' 영상 오버레이 iframe'); st.closeOv(); } catch (e) { fail++; fails.push(tag + ' openExtra 예외: ' + e.message); } }
  // 편집 층(우리 반 판)
  try {
    const n0 = st.slides.length; st.go(1, 1);
    st.setEdit(true); ok(d.body.classList.contains('editing') && d.querySelector('#kt2-paper .editable'), tag + ' 편집 모드 · 글자 편집 가능');
    const ed = d.querySelector('#kt2-paper .editable'); if (ed) { ed.innerHTML = '고친 글자 ' + tag; ed.dispatchEvent(new w.Event('blur')); }
    st.plan.imgs[st.cur().id] = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; st.savePlan();
    st.setEdit(false); st.paint(0, true);
    ok(d.querySelector('#kt2-paper').innerHTML.indexOf('고친 글자 ' + tag) >= 0, tag + ' 글자 덮어쓰기 유지');
    ok(!!d.querySelector('#kt2-paper .img-frame.user img'), tag + ' 사진 자리 채움');
    st.addSlide('ask'); ok(st.slides.length === n0 + 1 && st.cur()._added && st.cur().block === 'question', tag + ' 발문 슬라이드 추가');
    st.setEdit(false); const addedId = st.cur().id; const i0 = st.idx; st.moveSlide(i0, -1); ok(st.slides[i0 - 1].id === addedId, tag + ' 슬라이드 이동');
    st.setTnote(true); st.setEdit(true); st.paintTnote(); const ta = d.querySelector('#tn-edit'); ok(!!ta, tag + ' 발문 편집 칸'); if (ta) { ta.value = '왜 그럴까요?\n👀 거꾸로 세기'; d.querySelector('#tn-save').click(); } st.setEdit(false); st.paintTnote(); ok((d.querySelector('#tnote').textContent || '').indexOf('왜 그럴까요') >= 0, tag + ' 발문 저장·표시'); st.setTnote(false);
    const exp = st.exportPlan(); ok(JSON.parse(exp).added.length === 1, tag + ' 내보내기');
    st.removeAdded(addedId); ok(st.slides.length === n0, tag + ' 추가 슬라이드 지우기');
    ok(st.importPlan(exp) && st.slides.length === n0 + 1, tag + ' 가져오기');
    // 자료 연결 v2
    ok(st.attachRes('https://www.youtube.com/watch?v=Qxi-dPmsl-Q', '테스트 영상') && st.fitFor(st.cur()).some(e => e.mine && e.video_id === 'Qxi-dPmsl-Q'), tag + ' 영상 붙이기 → 이 슬라이드에 맞는 자료');
    ok(!st.attachRes('abc', ''), tag + ' 잘못된 주소 거절');
    st.paint(0, true); ok(!!d.querySelector('#kt2-paper .kt2-res-badge'), tag + ' 📎 배지');
    st.openRes(); ok(d.querySelector('#ov-res #res-url') && d.querySelector('#ov-res .res.fit') && /youtube\.com\/results/.test(d.querySelector('#ov-res a[href*="results"]').getAttribute('href')), tag + ' 서랍: 붙이기 칸·우리 반 자료·유튜브 찾기'); 
    const myId = st.fitFor(st.cur()).find(e => e.mine).id; st.markBroken(myId); ok(!st.fitFor(st.cur()).some(e => e.id === myId), tag + ' 안 열려요 → 제외'); st.markBroken(myId); st.closeOv();
    const s7 = st.sevenOf(); ok(s7.length === 7, tag + ' 7요소 판정 ' + s7.filter(Boolean).length + '/7');
    st.resetPlan(); ok(st.slides.length === n0 && !st.planDirty(), tag + ' 원래 차시로');
    st.openToc(); ok(d.querySelectorAll('#ov-toc .seven span').length === 8 && d.querySelector('#ov-toc .toc-tools [data-a="ask"]'), tag + ' 목차 7요소·도구'); st.closeOv();
  } catch (e) { fail++; fails.push(tag + ' 편집 층 예외: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  // 건너뛰기
  if (st.slides.length > 3) { st.slides[1].included = false; st.go(0, -1); st.fragMax = 0; st.next(); ok(st.idx === 2, tag + ' 건너뛰기(2번 제외 → 3번으로)'); st.slides[1].included = true; }
  ok(misOk, tag + ' 오개념 두 칸·확대 토글');
  try { st.celebrate(); st.pop(); st.hudAct('still', d.querySelector('#hud button[data-h="still"]')); st.hudAct('still', d.querySelector('#hud button[data-h="still"]')); st.hudAct('sound', d.querySelector('#hud button[data-h="sound"]')); } catch (e) { fail++; fails.push(tag + ' 연출 도구 예외: ' + e.message); }
  ok(true, tag + ' 실주행 ' + acts + ' 조작 · ' + frags + ' 조각 · 확대 가능 ' + zoomN + ' · 말풍선 ' + bubN);
  bubAll += bubN; picAll += picN; illusAll += illusN;
  return { acts, frags };
}
const rosterChecks = [];
let ran = 0, actsAll = 0, fragsAll = 0, bubAll = 0, picAll = 0, illusAll = 0;
manifest.subjects.forEach(sj => {
  // 과목마다: 각 단원의 첫 차시 + 조작 많은 차시 하나
  sj.units.forEach(un => {
    const picks = [un.lessons[0]];
    const inter = un.lessons.slice().sort((a, b) => b.interactive - a.interactive)[0]; if (inter && inter !== picks[0]) picks.push(inter);
    picks.forEach(l => { const r = runStage(sj, un, l); if (r) { ran++; actsAll += r.acts; fragsAll += r.frags; } });
  });
});
Promise.all(rosterChecks).then(() => {
console.log('② 무대 실주행 —', ran, '차시 부팅 · 슬라이드 안 조작', actsAll, '회 · 조각 공개', fragsAll, '회 · 말풍선', bubAll, '· 장면 무대', picAll, '· 사진 폴백 무대', illusAll, '· 그림 인물', chrAll);
ok(chrAll > 0, '인물 층: 무대 실주행에서 그림 인물이 선다 (' + chrAll + ')');
console.log('결과: PASS', pass, '· FAIL', fail);
if (fail) { console.log(fails.slice(0, 40).join('\n')); process.exit(1); }
});
