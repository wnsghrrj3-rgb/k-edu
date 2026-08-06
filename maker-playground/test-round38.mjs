/* R38 이식 3차 — MP4(MK_VIDEO)·오디오(MK_AUDIO)·PPTX 실임베드·실 AI(MK_AILIVE) 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
/* R75 — 없는 파일은 건너뛴다. index.html 의 `/kedu_back.js`·`/kedu_boxbar.js` 는
   배포 루트 기준 절대 경로라 여기선 파일계 최상단으로 풀려 ENOENT 로 죽었다.
   그 바람에 이 스위트가 오래 아예 못 돌았다(§1.94 가 적어 둔 사각). */
const __res = (p) => [p.replace(/^\//, '../'), p.replace(/^\//, ''), p].find((x) => fs.existsSync(x));
const __ld = (p) => { const f = __res(p); if (f) window.eval(fs.readFileSync(f, 'utf8')); };
for (const f of [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1])) __ld(f);
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const V = window.MK_VIDEO, A = window.MK_AUDIO, L = window.MK_AILIVE, R = window.MK_RENDER, P = window.MK_PLAY, PG = window.PG;
let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. MP4 엔진 — 순수 계층 ============ */
sec('1. MP4 엔진 (MK_VIDEO)');
{
  const va = V.videoAudit();
  T('videoAudit 전 항목', va.ok, JSON.stringify(va.violations));
  /* 프레임 플랜 = MK_PLAY.sequence 와 같은 시간축 */
  const doc = { scenes: [
    { duration: 2, elements: [{ kind: 'text', x: 5, y: 5, w: 60, size: 6, text: '가', anim: { preset: 'pop', delay: 0.2, duration: 0.5 } }] },
    { duration: 3, elements: [] },
  ] };
  const fp = V.framePlan(doc, {});
  const sq = P.sequence(doc);
  T('플랜 시간축 = 재생 시간축', fp.scenes[0].durSec === sq[0].durMs / 1000 && fp.scenes[1].durSec === sq[1].durMs / 1000);
  T('30fps 프레임 수', fp.totalFrames === Math.round(sq[0].durMs / 1000 * 30) + Math.round(sq[1].durMs / 1000 * 30));
  T('전환 = 첫 장면 없음·이후 크로스페이드', fp.scenes[0].transIn === 0 && fp.scenes[1].transIn === V.TRANS_DUR);
  /* 상태 보간이 MK_PLAY 등장 계획과 동일 입력을 쓴다 */
  const plan = P.enterPlan(doc.scenes[0].elements[0], 0, null);
  T('등장 전 alpha 0', V.stateAt(plan, doc.scenes[0].elements[0], 0.1).alpha === 0);
  const mid = V.stateAt(plan, doc.scenes[0].elements[0], 0.45);
  T('pop 중간 — 커지는 중', mid.alpha > 0 && mid.scale > 0.6 && mid.scale < 1.07);
  const done = V.stateAt(plan, doc.scenes[0].elements[0], 2);
  T('종료 후 정착 (alpha 1·scale 1)', Math.abs(done.alpha - 1) < 1e-9 && Math.abs(done.scale - 1) < 1e-9);
  T('120초 상한 게이트', V.framePlan({ scenes: [{ duration: 200, elements: [] }] }, {}).capped === true);
  /* jsdom = WebCodecs 없음 → 정직 거절 */
  const r = await V.exportMP4({ scenes: [{ duration: 1, elements: [] }] }, {});
  T('미지원 환경 정직 거절', r.ok === false && /지원하지 않아요/.test(r.msg));
}

/* ============ 2. 오디오 엔진 ============ */
sec('2. 오디오 엔진 (MK_AUDIO)');
{
  const aa = A.audioAudit();
  T('audioAudit 전 항목', aa.ok, JSON.stringify(aa.violations));
  T('합성 프리셋 3종', A.SYNTHS.length === 3 && A.SYNTHS.every((s) => s.id && s.name && s.loopSec > 0));
  const pp = A.patternPlan('piano');
  T('패턴 플랜 순수 산출', pp && pp.noteCount === 10 && pp.loopSec === 3.2);
  /* 주입 컨텍스트로 실스케줄 검증 */
  const calls = [];
  const fakeCtx = () => ({
    currentTime: 0, destination: {},
    createGain: () => ({ gain: { value: 0, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }),
    createOscillator: () => ({ type: '', frequency: { value: 0 }, connect: () => {}, start: (t) => calls.push(t), stop: () => {} }),
    resume: () => {}, close: () => {},
  });
  const timers = [];
  const r = A.play({ name: 'x', synth: 'beat' }, { ctxFactory: fakeCtx, setTimeout: (f, t) => (timers.push(f), 1), clearTimeout: () => {} });
  T('합성 실스케줄 — 루프 1회 발성 등록', r.ok && r.engine === 'webaudio' && calls.length === A.SYNTHS.find((s) => s.id === 'beat').notes.length);
  T('같은 음악 = 이어 재생(재시작 없음)', A.play({ name: 'x', synth: 'beat' }).cont === true);
  A.pause();
  T('일시정지 상태', A.state().paused === true);
  A.stop();
  T('정지 초기화', A.state().playing === false && A.state().name === null);
  /* 파일 게이트 */
  let err1 = null; A.fileToSrc({ type: 'video/mp4', size: 10 }, (src, e2) => { err1 = e2; });
  T('비오디오 파일 차단', /음악 파일/.test(err1 || ''));
  let err2 = null; A.fileToSrc({ type: 'audio/mpeg', size: 9e6 }, (src, e2) => { err2 = e2; });
  T('8MB 상한', /8MB/.test(err2 || ''));
}

/* ============ 3. 플레이어 오디오 배선 ============ */
sec('3. 플레이어 배선 (MK_PLAY × MK_AUDIO)');
{
  PG.go('editor');
  const doc = JSON.parse(JSON.stringify(PG.state.editor.doc));
  doc.scenes[0].music = { name: '밝은 피아노 루프', synth: 'piano' };
  const played = [];
  const realPlay = A.play, realStop = A.stop;
  A.play = (m) => (played.push('play:' + (m.synth || 'src')), { ok: true });
  A.stop = () => played.push('stop');
  const timers = [];
  P.open(doc, { startIdx: 0, setTimeout: (f, t) => (timers.push({ f, t }), timers.length), clearTimeout: () => {} });
  T('첫 장면 배경음 실재생 호출', played.includes('play:piano'));
  T('캡션 — "다음 이식" 문구 제거', !/다음 이식/.test(window.document.getElementById('mkPlayer').innerHTML));
  timers[timers.length - 1].f();                       /* 다음 장면(음악 없음) */
  T('음악 없는 장면 = 정지', played[played.length - 1] === 'stop');
  P.close();
  T('닫기 = 정지', played.filter((x) => x === 'stop').length >= 2);
  A.play = realPlay; A.stop = realStop;
}

/* ============ 4. PPTX 실임베드 ============ */
sec('4. PPTX — 이미지 실임베드');
{
  /* 1×1 붉은 PNG */
  const png1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const sc = { name: 's', background: '#FFFFFF', elements: [
    { kind: 'text', x: 5, y: 5, w: 80, size: 6, text: '제목', weight: 700 },
    { kind: 'image', x: 10, y: 30, w: 40, h: 40, src: png1, radius: 12 },
    { kind: 'image', x: 60, y: 30, w: 30, h: 30, label: '자리표시' },
  ] };
  const pages = [R.renderScene(sc, {})];
  const r = R.toPPTX(pages, {});
  T('미디어 1건 실임베드', r.media === 1);
  T('media 엔트리 실존', r.entries.includes('ppt/media/image1.png'));
  const bytes = r.bytes;
  T('ZIP 시그니처', bytes[0] === 0x50 && bytes[1] === 0x4B);
  const txt = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  T('[Content_Types] png 등재', /Default Extension="png"/.test(txt));
  T('슬라이드 blip 참조', /<a:blip r:embed="rIdImg2"\/>/.test(txt));
  T('슬라이드 rels 이미지 관계', /relationships\/image" Target="\.\.\/media\/image1\.png"/.test(txt));
  T('PNG 바이트 실포함', txt.includes('\x89PNG') || (() => { for (let i = 0; i < bytes.length - 3; i++) if (bytes[i] === 0x89 && bytes[i + 1] === 0x50 && bytes[i + 2] === 0x4E && bytes[i + 3] === 0x47) return true; return false; })());
  T('자리표시 이미지 = 라벨 폴백 유지(회귀)', r.warnings.some((w) => /라벨 도형 폴백/.test(w.msg)));
  /* src 없는 문서 = 기존 동작 그대로 (R16 회귀) */
  const r0 = R.toPPTX([R.renderScene({ name: 'p', background: '#FFF', elements: [{ kind: 'text', x: 5, y: 5, w: 60, size: 6, text: 'T' }] }, {})], {});
  T('무미디어 문서 회귀 — media 0·zip 정상', r0.media === 0 && r0.bytes[0] === 0x50);
}

/* ============ 5. 실 AI (MK_AILIVE) ============ */
sec('5. 실 AI 연결');
{
  const la = await L.liveAudit();
  T('liveAudit 전 항목 (키 게이트·요청 규격·오류 전달)', la.ok, JSON.stringify(la.violations));
  T('모델 지정', L.MODEL === 'claude-sonnet-4-6');
}

/* ============ 6. 에디터 배선 ============ */
sec('6. 에디터 배선');
{
  PG.state.editor = {}; PG.go('editor');
  const root = window.document;
  root.querySelector('[data-ed="export"]').click();
  const exs = [...root.querySelectorAll('[data-ex]')].map((b) => b.dataset.ex);
  T('내보내기 — PPTX·MP4 실버튼 등재', exs.includes('pptx') && exs.includes('mp4') && exs.length >= 6); /* R40에서 pdf 추가 — 고정 수 → 존재검증 보정 */
  T('가짜 문구("다음 이식 몫") 제거', !/다음 이식 몫이에요/.test(root.getElementById('exMsg').textContent));
  window.MK.Modal.close();
  /* 오디오 패널 */
  PG.state.editor.menu = 'audio'; PG.render();
  T('오디오 패널 — 합성 3종 + 파일 넣기', root.querySelectorAll('[data-au="set"]').length === 3 && !!root.querySelector('[data-au="file"]'));
  root.querySelectorAll('[data-au="set"]')[0].click();
  const doc = PG.state.editor.doc;
  T('씬에 넣기 = 장면 music 실기록', !!doc.scenes[PG.state.editor.sceneIdx].music && !!doc.scenes[PG.state.editor.sceneIdx].music.synth);
  T('패널에 현재 배경음 표기', /🎵/.test(root.querySelector('.ed-detail').innerHTML));
  root.querySelector('[data-au="clear"]').click();
  T('빼기 = music 제거 (Undo 가능 편집)', !doc.scenes[PG.state.editor.sceneIdx].music);
  /* AI Dock — 연결 문구·키 버튼 */
  PG.state.editor.menu = 'ai'; PG.render();
  T('AI Dock — 실 AI 연결 버튼', !!root.querySelector('[data-ed="ai-key"]'));
  T('무키 상태 문구', /실 AI 연결/.test(root.querySelector('.ed-aidock .ed-note').innerHTML));
  /* 키 연결 → 미지 명령 = Claude 실이어받기 (가짜 fetch) */
  const mem = (() => { let m = {}; return { getItem: (k) => m[k] || null, setItem: (k, x) => { m[k] = x; }, removeItem: (k) => { delete m[k]; } }; })();
  L.useBackend(mem); L.setKey('sk-test');
  PG.render();
  T('연결됨 문구 전환', /연결됨 · Claude/.test(root.querySelector('.ed-aidock .ed-note').innerHTML));
  const realFetch = window.fetch;
  window.fetch = () => Promise.resolve({ json: () => Promise.resolve({ content: [{ type: 'text', text: '멋진 제목이에요' }] }) });
  const aiIn = root.querySelector('[data-ed="ai-in"]');
  aiIn.value = '이 장면 어때 솔직히 말해줘';                 /* 규칙 파서 미지 명령 */
  root.querySelector('[data-ed="ai-run"]').click();
  await new Promise((r) => setTimeout(r, 20));
  const log = PG.state.editor.aiLog || [];
  T('미지 명령 → Claude 실응답 로그', log.some((m) => m.role === 'ai' && /멋진 제목이에요/.test(m.text)));
  window.fetch = realFetch;
  L.clearKey(); L.useBackend(null);
}

/* ============ 7. 회귀 가드 ============ */
sec('7. 회귀 가드');
{
  T('R37 재생 엔진 공존', P.playAudit().ok);
  T('R36 실편집 엔진 공존', window.MK_LIVE.liveAudit().ok);
  T('R35 p0 불변', window.MK_EASY.p0Audit().ok !== false);
  const svg = R.toSVG(R.renderScene({ background: '#fff', elements: [{ kind: 'image', x: 0, y: 0, w: 20, h: 20, src: 'data:image/png;base64,QQ', rot: 15, radius: 8 }] }, {}));
  T('R37 SVG 실이미지·회전 출력 불변', /<image href=/.test(svg) && /rotate\(15 /.test(svg));
  const scr = ['home', 'library', 'easy', 'editor'];
  T('주요 화면 렌더', scr.every((s2) => { try { PG.go(s2); return (window.document.getElementById('app') || window.document.body).innerHTML.length > 500; } catch (_) { return false; } }));
}

console.log(`\nRound 38: ${pass} pass / ${fail} fail`);
process.exit(fail ? 1 : 0);
