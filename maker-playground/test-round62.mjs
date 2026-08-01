/* R62 — GPT 2단계 지시서 §19 시나리오 1~7 + §17 저장·재진입 (자동화 가능 몫 전량) */
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/video' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) { if (/^https?:/.test(f)) continue; const p = f.replace(/^\//, ''); if (!fs.existsSync(p) && !fs.existsSync(f)) continue; window.eval(fs.readFileSync(fs.existsSync(p) ? p : f, 'utf8')); }
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
window.alert = () => {}; window.confirm = () => true;

const C = window.MK_COMPOSE, R = window.MK_RENDER;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.log('  ✗ ' + name + ' — ' + e.message); } };
const A = (c, m) => { if (!c) throw new Error(m || 'assert'); };
const img = (i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: i % 2 ? 800 : 600, h: i % 2 ? 600 : 800 });
const vid = (i, dur) => ({ name: 'v' + i, kind: 'video', src: 'data:video/mp4;base64,' + i, w: 1280, h: 720, duration: dur });
const mk = (n) => Array.from({ length: n }, (_, i) => img(i));
const renderAll = (r) => r.doc.scenes.forEach((s) => { const svg = R.toSVG(s); A(/^<svg/.test(svg), '렌더 실패 ' + s.id); });

/* ---------- Test 1 — 슬라이드쇼 · 사진 1 · 9:16 · Minimal ---------- */
T('시나리오 1 — 사진 1장: 무분별 반복 0·빈 씬 0·짧고 자연스럽게', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(1), texts: { title: '한 장' }, ratio: '9:16' });
  A(r.ok, r.why);
  const placed = r.doc.scenes.flatMap((s) => s.elements.filter((e) => e.src));
  A(placed.length === 1, '같은 사진 반복 배치: ' + placed.length);
  A(r.total <= 12, '1장인데 과도한 길이 ' + r.total);
  for (const s of r.doc.scenes) A(s.elements.length > 0, '빈 씬 ' + s.id);
  A(placed[0].anim && /^kb-/.test(placed[0].anim.idle || ''), '단일 사진 subtle 모션 없음 (§8-3)');
  renderAll(r);
});

/* ---------- Test 2 — 슬라이드쇼 · 사진 8 · 16:9 · Bold ---------- */
T('시나리오 2 — 사진 8장: 씬 자동·variant 순환·전 미디어·전환 실배정', () => {
  const r = C.buildProject('cx-slideshow', 'th-bold', { medias: mk(8), texts: { title: '가을 운동회' }, mediaCaptions: ['입장', '', '달리기', '', '', '점심', '', ''] });
  A(r.ok && r.sceneCount >= 10, '씬=' + r.sceneCount);
  const placed = r.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
  A(placed === 8, '배치=' + placed);
  const sigs = r.doc.scenes.filter((s) => s.role === 'media').map((s) => s.elements.filter((e) => e.kind === 'image').map((e) => [e.x, e.w].join(',')).join('|'));
  A(new Set(sigs).size >= 2, 'variant 단일');
  for (let i = 1; i < r.doc.scenes.length; i++) A(r.doc.scenes[i].transition, '전환 누락');
  renderAll(r);
});

/* ---------- Test 3 — 슬라이드쇼 · 사진·영상 혼합 20 · 9:16 ---------- */
T('시나리오 3 — 혼합 20개: 누락 0·영상 길이 반영·몽타주·영상엔 KB 없음', () => {
  const medias = mk(16).concat([vid(0, 2.2), vid(1, 9), vid(2, 3.1), vid(3, 5)]);
  const t0 = Date.now();
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias, texts: { title: '학예회' }, ratio: '9:16' });
  A(Date.now() - t0 < 1500, '생성 지연 ' + (Date.now() - t0) + 'ms (§20)');
  A(r.ok, r.why);
  const placed = r.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
  A(placed === 20, '누락: ' + placed);
  A(r.doc.scenes.some((s) => s.elements.filter((e) => e.src).length >= 3), '몽타주 없음');
  const vScene = r.doc.scenes.find((s) => s.elements.some((e) => e.video && e.src.includes('base64,0')));
  A(vScene && vScene.duration <= 2.2 + 0.01, '짧은 영상(2.2s)에 긴 씬 ' + (vScene && vScene.duration) + ' (§8-6)');
  for (const s of r.doc.scenes) for (const e of s.elements)
    A(!(e.video && /^kb-/.test((e.anim || {}).idle || '')), '영상에 Ken Burns (§8-6)');
  renderAll(r);
});

/* ---------- Test 4 — 비포애프터 · 1 Pair · 16:9 · side-by-side ---------- */
T('시나리오 4 — 1쌍 좌우 비교: 동일 프레임·전후 라벨·실렌더', () => {
  const r = C.buildProject('cx-beforeafter', 'th-minimal', {
    pairs: [{ before: img(0), after: img(1), title: '교실' }], texts: { title: '변화' }, method: 'side-by-side' });
  A(r.ok && r.method === 'side-by-side');
  const cp = r.doc.scenes.find((s) => s.role === 'comparison');
  const ms = cp.elements.filter((e) => e.src);
  A(ms[0].w === ms[1].w && ms[0].h === ms[1].h && ms[0].y === ms[1].y, '프레임 불일치 (§9-6)');
  A(cp.elements.some((e) => e.text === '전') && cp.elements.some((e) => e.text === '후'), '라벨');
  renderAll(r);
});

/* ---------- Test 5 — 비포애프터 · 3 Pair · 9:16 · wipe-vertical + 저장·재진입 ---------- */
T('시나리오 5 — 3쌍 세로 wipe: 묶음 반복·순서 유지·저장·재진입 동일 (§17)', () => {
  const pairs = [0, 1, 2].map((i) => ({ before: { ...img(i), name: 'b' + i, src: 'data:image/png;base64,B' + i }, after: { ...img(i), name: 'a' + i, src: 'data:image/png;base64,A' + i }, title: '쌍' + i }));
  const r = C.buildProject('cx-beforeafter', 'th-bold', { pairs, texts: { title: 'T', result: '결과' }, ratio: '9:16', method: 'wipe-vertical' });
  A(r.ok, r.why);
  const tfs = r.doc.scenes.filter((s) => s.role === 'transform');
  const cps = r.doc.scenes.filter((s) => s.role === 'comparison');
  A(tfs.length === 3 && cps.length === 3, '묶음 반복: tf=' + tfs.length + ' cp=' + cps.length);
  tfs.forEach((s, i) => {
    const rv = s.elements.filter((e) => e.src)[1];
    A(rv.src.includes('A' + i), '쌍 순서 붕괴 @' + i);
    A(rv.anim.preset === 'wipe' && rv.anim.direction === 'down', '세로 wipe 아님');
  });
  /* §17 저장·재진입 — 프로젝트 생성 → serialize → hydrate → doc 동일 */
  window.MK_START.open(r.doc);
  const P = window.MK_PROJ, cur = P.current();
  A(cur && cur.doc.scenes.length === r.sceneCount, '프로젝트 미생성');
  const pid = cur.projectId, snap = JSON.stringify(cur.doc);
  const raw = P.serialize();
  A(P.hydrate(raw), 'hydrate 실패');
  const back = P.get(pid);
  A(back && JSON.stringify(back.doc) === snap, '재진입 후 doc 불일치 (씬 수·순서·미디어·전환·비율)');
  renderAll(r);
});

/* ---------- Test 6 — Before만 업로드 ---------- */
T('시나리오 6 — 전만 있는 쌍: 완성 비교로 위장 0·명확한 안내', () => {
  const r = C.buildProject('cx-beforeafter', 'th-minimal', { pairs: [{ before: img(0), after: null }], texts: { title: 'T' } });
  A(r.ok && r.warnings.length && /후 사진.*추가/.test(r.warnings[0]), JSON.stringify(r.warnings));
  A(!r.doc.scenes.some((s) => s.role === 'comparison' || s.role === 'transform'), '미완성인데 비교/변신 씬');
  A(r.doc.scenes.some((s) => s.elements.some((e) => e.text === '전')), '단독 씬 라벨');
  A(r.doc.scenes.some((s) => s.elements.some((e) => /없음/.test(e.text || ''))), '미완성 정직 표기');
});

/* ---------- Test 7 — 같은 입력 16:9 ↔ 9:16 ---------- */
T('시나리오 7 — 비율 전환: 단순 스케일 아님·텍스트 안전영역·데이터 무손실 (§12)', () => {
  const inp = { medias: mk(6), texts: { title: '비율' }, mediaCaptions: ['하나', '', '셋', '', '', ''] };
  const a = C.buildProject('cx-slideshow', 'th-minimal', { ...JSON.parse(JSON.stringify(inp)), ratio: '16:9' });
  const b = C.buildProject('cx-slideshow', 'th-minimal', { ...JSON.parse(JSON.stringify(inp)), ratio: '9:16' });
  A(a.doc.scenes[0].width === 1280 && b.doc.scenes[0].width === 1080, '캔버스');
  /* 단순 배율이 아님 — % 프레임 자체가 다르다 */
  const fr = (r2) => r2.doc.scenes.filter((s) => s.role === 'media').map((s) => s.elements.filter((e) => e.kind === 'image').map((e) => [e.x, e.y, e.w, e.h].join(',')).join('|')).join(';');
  A(fr(a) !== fr(b), '프레임 재계산 없음 — 단순 스케일');
  /* 9:16 텍스트 전량 안전영역 (§12·R54) */
  const z = C.SAFE['9:16'];
  for (const s of b.doc.scenes) for (const e of s.elements) if (e.kind === 'text') {
    A(e.x >= z.x - 1e-9 && e.x + e.w <= z.x + z.w + 1e-9 && e.y >= z.y - 1e-9 && e.y <= z.y + z.h + 1e-9, '안전영역 이탈 ' + s.id);
  }
  /* 데이터 무손실 — 두 비율 모두 캡션·미디어 전량 */
  for (const r2 of [a, b]) {
    const placed = r2.doc.scenes.reduce((c, s) => c + s.elements.filter((e) => e.src).length, 0);
    A(placed === 6, '미디어 손실');
    const txt = r2.doc.scenes.flatMap((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text));
    A(txt.includes('하나') && txt.includes('셋'), '캡션 손실');
  }
});

/* ---------- §16 미리보기 동기화 — 재생 계획이 doc과 동률 ---------- */
T('§16 — 씬 길이·전환이 재생 계획(durMs)·MP4 프레임 플랜에 실반영', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3), texts: { title: 'T' } });
  const plan = window.MK_VIDEO.framePlan(r.doc.scenes.map((s) => ({ duration: s.duration })), 30);
  const totalSec = r.doc.scenes.reduce((x, s) => x + s.duration, 0);
  A(Math.abs(plan.totalSec - Math.min(totalSec, window.MK_VIDEO.MAX_SEC)) < 0.2, 'MP4 플랜 불일치');
  const html2 = window.MK_PLAY.sceneHTML(r.doc.scenes[2]);
  A(/mkp-/.test(html2), '재생 애니 미배선');
});

console.log('');
console.log(`R62: ${pass}/${pass + fail}` + (fail ? ' FAIL' : ' ALL PASS'));
process.exit(fail ? 1 : 0);
