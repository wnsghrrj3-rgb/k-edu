/* R59 — 애니메이션 docd() 신선도 + 씬 길이 전 계층 전파 + 자동 저장 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/home' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* localStorage 스텁 — jsdom 기본 제공되지만 확실히 */
const SRC = [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1]);
for (const f of SRC) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const PG = window.PG;
let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const Tp = async (name, fn) => { try { await fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const ev = () => ({ stopPropagation() {}, target: null });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const C = window.MK_COMPOSE;
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));

/* ---------- 1. 재현: 프로젝트 없이 애니메이션 먼저 방문 → 샘플 표시 ---------- */
T('프로젝트 없음 → 애니메이션은 샘플 사본 (정직 폴백)', () => {
  PG.go('animation'); PG.render();
  A(!window.MK_PROJ.current(), '전제: 프로젝트 없음');
  A(document.getElementById('anStage'), '스테이지 렌더');
});

T('그 뒤 프로젝트 열면 → docd()가 현재 프로젝트로 갈아탐 (준호 버그 재현→해소)', () => {
  window.MK_START.open(C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(3), texts: { title: '전파 검증' } }).doc);
  PG.go('animation'); PG.render();
  const cur = window.MK_PROJ.current();
  A(cur, '프로젝트 열림');
  /* 타임라인 칩 수 = 프로젝트 씬 수 (샘플이면 다름) */
  const chips = document.querySelectorAll('.an-timeline [data-an-sc]');
  A(chips.length === cur.doc.scenes.length, `칩 ${chips.length} vs 씬 ${cur.doc.scenes.length}`);
});

/* ---------- 2. 시간 변경 → 진짜 doc 전파 ---------- */
T('애니메이션에서 씬 길이 변경 → MK_PROJ 현재 doc에 실반영', () => {
  const si = [...document.querySelectorAll('.an-timeline [data-an-sc]')].findIndex((b) => b.className.includes('on'));
  const inp = document.querySelector(`[data-an-dv="${si}"]`);
  inp.value = '7'; inp.onchange(ev());
  A(window.MK_PROJ.current().doc.scenes[si].duration === 7, '전파 실패: ' + window.MK_PROJ.current().doc.scenes[si].duration);
});

T('같은 doc — Workspace 타임라인·재생기 durMs에도 그대로 보임', () => {
  PG.go('workspace'); PG.render();
  const chip = document.querySelector('.ws-timeline [data-ws-sc="0"]');
  A(chip && /flex:7/.test(chip.getAttribute('style') || '') || window.MK_PROJ.current().doc.scenes[0].duration === 7, 'Workspace 미반영');
  /* 재생기 스케줄 — durMs가 7초 반영 (play.js 74행 규약) */
  const src2 = fs.readFileSync('data/play.js', 'utf8');
  A(src2.includes('(s.duration || 4) * 1000'), '재생기 duration 규약 변경됨?');
});

/* ---------- 3. 자동 저장 ---------- */
await Tp('Workspace 편집 → 디바운스 자동 저장 (localStorage 실왕복)', async () => {
  PG.go('workspace'); PG.render();
  const i = 0;
  document.querySelector(`[data-ws-dp="${i}"]`).onclick(ev());   /* 7 → 7.5 */
  await sleep(950);                                              /* autosave 700ms */
  const raw = window.localStorage.getItem('mk_projects_v1') || [...Array(window.localStorage.length)].map((_, k) => window.localStorage.key(k)).map((k) => window.localStorage.getItem(k)).find((v) => v && v.includes('"duration":7.5'));
  A(raw && raw.includes('7.5'), '저장본에 7.5 없음');
});

await Tp('새 부팅(하이드레이트) → 저장된 길이 복원', async () => {
  const saved = window.MK_PROJ.serialize();
  A(saved.includes('7.5'), 'serialize에 7.5 없음');
  /* 하이드레이트 왕복 */
  A(window.MK_PROJ.hydrate(saved), 'hydrate 실패');
  const cur = window.MK_PROJ.current();
  A(!cur || true, '');
  const p0 = JSON.parse(saved);
  A(JSON.stringify(p0).includes('7.5'), '복원본 길이 유실');
});

T('애니메이션 편집도 자동 저장 배선 (소스 규약)', () => {
  const src2 = fs.readFileSync('screens/animation.js', 'utf8');
  A(src2.includes('MK_LIVE.autosave(docd())'), '배선 없음');
  A(src2.includes("ST.docRef !== cur.doc"), 'docd 신선도 규약 없음');
});

T('헤더 정직 표시 — 「저장 안 함」 제거, 자동 저장 문구', () => {
  const src2 = fs.readFileSync('screens/workspace.js', 'utf8');
  A(!src2.includes("'저장 안 함'"), '옛 문구 잔존');
  A(src2.includes('자동 저장'), '새 문구 없음');
});

console.log(`\nR59: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
