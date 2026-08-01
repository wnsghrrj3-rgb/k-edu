/* R52 — Ken Burns idle 8종 + 전환 변형 + 오디오 fit 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://k.local/' });
global.window = dom.window; global.document = dom.window.document;
const load = (p) => dom.window.eval(fs.readFileSync(p, 'utf8'));
load('data/animations.js'); load('data/render.js'); load('data/caption.js');
load('data/compose.js'); load('data/compositions.js');
load('data/play.js'); load('data/video.js'); load('data/audio.js');

let pass = 0, fail = 0;
const T = (name, fn) => { try { fn(); pass++; console.log('  ✓', name); } catch (e) { fail++; console.log('  ✗', name, '—', e.message); } };
const A = (c, msg) => { if (!c) throw new Error(msg || 'assert'); };
const C = window.MK_COMPOSE, P = window.MK_PLAY, V = window.MK_VIDEO, AU = window.MK_AUDIO;
const mk = (n) => Array.from({ length: n }, (_, i) => ({ name: 'p' + i, kind: 'image', src: 'data:image/png;base64,' + i, w: 800, h: 600 }));

/* ---------- 1. Ken Burns 정의 ---------- */
T('KB 8종 정의 — zoom 2·pan 4·diagonal·static, 과도 확대 ≤1.1', () => {
  A(C.KENBURNS.length === 8, 'n=' + C.KENBURNS.length);
  ['kb-zoom-in', 'kb-zoom-out', 'kb-pan-left', 'kb-pan-right', 'kb-pan-up', 'kb-pan-down', 'kb-diagonal', 'kb-static']
    .forEach((id) => A(C.KENBURNS.some((k) => k.id === id), id + ' 없음'));
  A(C.KENBURNS.every((k) => Math.max(k.scale[0], k.scale[1]) <= 1.1), '과도 확대');
});

T('kbState 보간 — zoom-in 1→1.08 · pan-left dx +12→-12 · static 모션 0', () => {
  const z0 = C.kbState('kb-zoom-in', 0), z1 = C.kbState('kb-zoom-in', 1);
  A(z0.scale === 1 && Math.abs(z1.scale - 1.08) < 1e-9, 'zoom');
  const p0 = C.kbState('kb-pan-left', 0), p1 = C.kbState('kb-pan-left', 1);
  A(p0.dx === 12 && p1.dx === -12 && p0.scale === 1.06, 'pan');
  const st = C.kbState('kb-static', 0.5);
  A(st.scale === 1 && st.dx === 0 && st.dy === 0, 'static');
  A(C.kbState('kb-zoom-in', 2).scale === 1.08 + 0 || Math.abs(C.kbState('kb-zoom-in', 2).scale - 1.08) < 1e-9, '진행률 클램프');
});

/* ---------- 2. buildProject 배정 ---------- */
T('buildProject 기본 켬 — 미디어 씬에 kb 배정·idleDur=씬 길이', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(5), texts: { title: 'T' } });
  A(r.ok, r.why);
  const withMedia = r.doc.scenes.filter((s) => s.elements.some((e) => e.src));
  A(withMedia.length >= 3, '미디어 씬 부족');
  withMedia.forEach((s) => {
    const img = s.elements.find((e) => e.src);
    A(/^kb-/.test(img.anim.idle || ''), 'kb 미배정: ' + s.id);
    A(img.anim.idleDur === s.duration, 'idleDur 불일치');
  });
});

T('인접 씬 같은 종류 반복 금지', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(10), texts: { title: 'T' } });
  let prev = null;
  r.doc.scenes.forEach((s) => {
    const img = s.elements.find((e) => e.src && !e.video);
    const id = img && img.anim && /^kb-/.test(img.anim.idle || '') ? img.anim.idle : null;
    if (id) { A(id !== prev, '인접 반복: ' + id); prev = id; } else prev = null;
  });
});

T('끄기 가능 — kenburns:false 시 배정 0', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(5), texts: { title: 'T' }, kenburns: false });
  A(r.ok && r.doc.scenes.every((s) => s.elements.every((e) => !(e.anim && /^kb-/.test(e.anim.idle || '')))), 'kb 잔존');
});

T('영상 요소 제외 · 작은 슬롯은 이동 없는 종류만', () => {
  const scenes = [
    { duration: 3, elements: [{ kind: 'image', src: 'x', video: true, w: 100, h: 100 }] },
    { duration: 3, elements: [{ kind: 'image', src: 'y', w: 30, h: 30 }] },
  ];
  C.assignKenburns(scenes);
  A(!(scenes[0].elements[0].anim && /^kb-/.test(scenes[0].elements[0].anim.idle || '')), '영상에 kb');
  const small = scenes[1].elements[0].anim.idle;
  A(['kb-zoom-in', 'kb-zoom-out', 'kb-static'].includes(small), '작은 슬롯 이동형: ' + small);
});

T('결정론 — 같은 입력 2회 = 동일 doc (kb·전환 포함)', () => {
  const inp = { medias: mk(6), texts: { title: 'T' } };
  const a = C.buildProject('cx-slideshow', 'th-bold', inp);
  const b = C.buildProject('cx-slideshow', 'th-bold', JSON.parse(JSON.stringify(inp)));
  A(JSON.stringify(a.doc) === JSON.stringify(b.doc), '비결정');
});

/* ---------- 3. 전환 변형 ---------- */
T('전환 변형 — 인접 동일 전환 0 (전환 2종 이상 테마)', () => {
  const r = C.buildProject('cx-slideshow', 'th-minimal', { medias: mk(8), texts: { title: 'T' } });
  for (let i = 1; i < r.doc.scenes.length; i++)
    A(r.doc.scenes[i].transition !== r.doc.scenes[i - 1].transition,
      i + ': ' + r.doc.scenes[i].transition);
});

T('전환 1종뿐인 테마 = 정직하게 그대로 (변형 강제 없음)', () => {
  const scenes = [{ transition: 'fade' }, { transition: 'fade' }];
  C.varyTransitions(scenes, { transitions: ['fade'] });
  A(scenes[1].transition === 'fade', '없는 전환을 만들어냄');
});

/* ---------- 4. 플레이어 CSS ---------- */
T('play 키프레임 kb 7종 + linear forwards 방출', () => {
  const a = P.playAudit();
  A(a.ok, JSON.stringify(a.violations));
});

T('kb-static은 CSS 애니 미방출 (모션 0 = 코드도 0)', () => {
  const h = P.sceneHTML({ duration: 4, elements: [{ kind: 'image', src: 'data:image/png;base64,S', x: 0, y: 0, w: 100, h: 100, anim: { preset: 'fade', idle: 'kb-static', idleDur: 4 } }] });
  A(!/mkp-kb-/.test(h), 'static인데 kb 애니 방출');
});

/* ---------- 5. MP4 수치판 ---------- */
T('video stateAt — kb 수치 CSS 동률·과도 확대 금지·static 0', () => {
  const a = V.videoAudit();
  A(a.ok, JSON.stringify(a.violations));
});

T('stateAt kb 중간값 — enter 종료 후 잔여 길이 선형 진행', () => {
  const plan = { name: 'mkp-fade', delay: 0, dur: 1, ease: 'linear' };
  const el = { anim: { idle: 'kb-zoom-in', idleDur: 5 } };  /* 진행 구간 = 1→5초(4초) */
  const mid = V.stateAt(plan, el, 3);                        /* p = 0.5 */
  A(Math.abs(mid.scale - 1.04) < 1e-9, 'scale=' + mid.scale);
});

/* ---------- 6. 오디오 fit ---------- */
T('fitPlan — 짧으면 loop(3.2s→10s = 4루프)·길면 trim·beatSync 정직', () => {
  const f = AU.fitPlan(3.2, 10);
  A(f.mode === 'loop' && f.loops === 4 && f.playSec === 10, JSON.stringify(f));
  A(AU.fitPlan(20, 10).mode === 'trim', 'trim');
  A(f.beatSync.supported === false && /준비 중/.test(f.beatSync.msg), 'beatSync 거짓 표기');
  A(AU.beatSync().supported === false, 'beatSync()');
});

T('fitPcm — 목표 길이 정확·루프 이어짐·끝 fadeOut 무음·본문 유음', () => {
  const a = AU.audioAudit();
  A(a.ok, JSON.stringify(a.violations));
});

T('exportMP4 끝 fadeOut 규약 — 마지막 구간 판별 소스 존재', () => {
  const src = fs.readFileSync('data/video.js', 'utf8');
  A(/atEnd/.test(src) && /1\.2 \* sr/.test(src), 'fadeOut 코드 부재');
  const tl = V.musicTimeline({ scenes: [{ duration: 3, elements: [], music: { synth: 'piano' } }, { duration: 3, elements: [], music: { synth: 'piano' } }] });
  A(Math.abs(tl.segments[0].end - tl.totalSec) < 0.05, '끝 구간 판별 전제 위반');
});

/* ---------- 7. 엔진 전체 회귀 ---------- */
T('MK_COMPOSE 전 감사 — kb 인접·영상 제외·끄기 포함 ALL PASS', () => {
  const a = C.audit();
  A(a.ok, JSON.stringify(a.violations.slice(0, 5)));
});

console.log(`\nR52: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
