/* R39 이식 4차 — 눈·목소리: 삽입 영상 프레임 재생 + MP4 오디오 트랙 먹싱 검증 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/editor' });
const { window } = dom;
if (!window.performance) Object.defineProperty(window, 'performance', { value: { now: () => Date.now() } });
global.window = window; global.document = window.document;
for (const f of [...html.matchAll(/<script src="([^?"]+)/g)].map((m) => m[1])) window.eval(fs.readFileSync(f, 'utf8'));
window.document.dispatchEvent(new window.Event('DOMContentLoaded'));

const V = window.MK_VIDEO, A = window.MK_AUDIO, P = window.MK_PLAY, PG = window.PG;
let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);

/* ============ 1. 오프라인 PCM — 순수 수학 ============ */
sec('1. 오프라인 PCM (MK_AUDIO.renderPattern)');
{
  const aa = A.audioAudit();
  T('audioAudit 전 항목(PCM 판정 포함)', aa.ok, JSON.stringify(aa.violations));
  const sr = 48000;
  const pcm = A.renderPattern('piano', 2, sr);
  T('길이 = 초×샘플레이트', pcm && pcm.length === 2 * sr);
  let peak = 0, energy = 0;
  for (let i = 0; i < pcm.length; i++) { peak = Math.max(peak, Math.abs(pcm[i])); energy += pcm[i] * pcm[i]; }
  T('무음 아님 (peak > 0.05)', peak > 0.05, 'peak=' + peak.toFixed(3));
  T('클리핑 없음 (|s| ≤ 1)', peak <= 1);
  T('에너지 실존 (RMS > 0.01)', Math.sqrt(energy / pcm.length) > 0.01);
  /* 3종 전부 발성 */
  for (const s of A.SYNTHS) {
    const p2 = A.renderPattern(s.id, s.loopSec, sr);
    let pk = 0; for (let i = 0; i < p2.length; i++) pk = Math.max(pk, Math.abs(p2[i]));
    T(`${s.id} 패턴 발성`, pk > 0.05);
  }
  T('없는 id → null', A.renderPattern('없음', 1) === null);
  T('0초 → null', A.renderPattern('piano', 0) === null);
  /* 파형 — 순수 */
  T('sine 파형 경계', Math.abs(A.waveAt('sine', 0.25) - 1) < 1e-9 && Math.abs(A.waveAt('sine', 0)) < 1e-9);
  T('square 파형', A.waveAt('square', 0.1) === 1 && A.waveAt('square', 0.6) === -1);
  T('triangle 파형', Math.abs(A.waveAt('triangle', 0.5) - (-1)) < 1e-9 && Math.abs(A.waveAt('triangle', 0)) < 1.0001 && A.waveAt('triangle', 0) === 1);
  /* 엔벨로프 — 어택 후 g 도달, 범위 밖 0 */
  T('엔벨로프 어택 정점', Math.abs(A.envAt(0.02, 0.4, 0.8) - 0.8) < 1e-6);
  T('엔벨로프 범위 밖 0', A.envAt(-0.1, 0.4, 0.8) === 0 && A.envAt(0.5, 0.4, 0.8) === 0);
  T('엔벨로프 감쇠 단조', A.envAt(0.1, 0.4, 0.8) > A.envAt(0.3, 0.4, 0.8));
}

/* ============ 2. 영상 기하·음악 타임라인 — 순수 ============ */
sec('2. 영상 기하·음악 타임라인 (MK_VIDEO 순수)');
{
  const va = V.videoAudit();
  T('videoAudit 전 항목(R39 기하·타임라인 포함)', va.ok, JSON.stringify(va.violations));
  /* cover — 16:9 → 정방형: 세로 전체·가로 중앙 크롭 */
  const cv = V.fitRect(1920, 1080, 200, 200, 'cover');
  T('cover 소스 크롭', cv.mode === 'cover' && Math.abs(cv.sw - 1080) < 1e-6 && Math.abs(cv.sh - 1080) < 1e-6 && Math.abs(cv.sx - 420) < 1e-6 && cv.sy === 0);
  /* contain — 16:9 → 정방형: 가로 채움·상하 여백 */
  const cn = V.fitRect(1920, 1080, 200, 200, 'contain');
  T('contain 목적지 축소', cn.mode === 'contain' && Math.abs(cn.dw - 200) < 1e-6 && Math.abs(cn.dh - 112.5) < 1e-6 && Math.abs(cn.dy - 43.75) < 1e-6 && cn.dx === 0);
  /* 세로 영상 cover — 가로 전체·세로 중앙 크롭 */
  const cv2 = V.fitRect(720, 1280, 100, 50, 'cover');
  T('세로 영상 cover', Math.abs(cv2.sw - 720) < 1e-6 && Math.abs(cv2.sh - 360) < 1e-6 && Math.abs(cv2.sy - 460) < 1e-6);
  T('0 크기 방어', V.fitRect(0, 0, 100, 100, 'cover').sw > 0);
  /* 루프 시각 */
  T('루프 시각 mod', V.secondsInto(5.5, 2) === 1.5 && V.secondsInto(2, 2) === 0 && Math.abs(V.secondsInto(0.3, 2) - 0.3) < 1e-9);
  T('duration 0 방어', V.secondsInto(3, 0) === 0 && V.secondsInto(3, Infinity) === 0);
  /* 영상 판별 */
  T('영상 판별 — kind', V.isVideoEl({ kind: 'video', src: 'data:video/mp4;base64,x' }));
  T('영상 판별 — dataURL', V.isVideoEl({ kind: 'image', src: 'data:video/webm;base64,x' }));
  T('이미지 비판별', !V.isVideoEl({ kind: 'image', src: 'data:image/png;base64,x' }) && !V.isVideoEl({ kind: 'video' }));
  /* 타임라인 — 병합·분리·공백·파일 키 */
  const md = { scenes: [
    { duration: 2, elements: [], music: { synth: 'piano' } },
    { duration: 3, elements: [], music: { synth: 'piano' } },
    { duration: 2, elements: [] },
    { duration: 2, elements: [], music: { synth: 'beat' } },
    { duration: 2, elements: [], music: { src: 'data:audio/mp3;base64,AAA', name: '내 음악' } },
  ] };
  const tl = V.musicTimeline(md);
  T('같은 음악 병합 (piano 2+3=5초)', tl.segments[0].start === 0 && tl.segments[0].end === 5);
  T('무음 장면 = 공백', tl.segments[1].start === 7);
  T('다른 음악 분리 (총 3구간)', tl.segments.length === 3);
  T('파일 키 분리', tl.segments[2].key.startsWith('src:') && tl.segments[2].start === 9 && tl.segments[2].end === 11);
  T('총 길이 = 플랜 합', Math.abs(tl.totalSec - 11) < 1e-6);
  T('음악 없는 문서 = 구간 0', V.musicTimeline({ scenes: [{ duration: 3, elements: [] }] }).segments.length === 0);
  /* 짧은 장면 최소 1.6초 규약이 타임라인에도 반영 (MK_PLAY.sequence 동일 시간축) */
  const tShort = V.musicTimeline({ scenes: [{ duration: 0.5, elements: [], music: { synth: 'beat' } }] });
  T('최소 장면 길이 시간축 일치', Math.abs(tShort.segments[0].end - 1.6) < 1e-6);
}

/* ============ 3. 플레이어 — 영상 프레임 실재생 ============ */
sec('3. 플레이어 영상 재생 (MK_PLAY)');
{
  const doc = { scenes: [{ name: 'v', duration: 3, background: '#fff', elements: [
    { kind: 'video', x: 10, y: 10, w: 50, h: 40, fit: 'cover', radius: 10, src: 'data:video/mp4;base64,AAAA', anim: { preset: 'fade', delay: 0, duration: 0.4 } },
    { kind: 'image', x: 60, y: 10, w: 30, h: 30, src: 'data:image/png;base64,BBBB' },
  ] }] };
  const h = P.sceneHTML(doc.scenes[0]);
  T('영상 = <video> 방출', /<video src="data:video\/mp4;base64,AAAA"/.test(h));
  T('무음·자동·루프·인라인', /muted autoplay loop playsinline/.test(h));
  T('fit 반영', /object-fit:cover/.test(h));
  T('이미지는 여전히 <img>', /<img src="data:image\/png;base64,BBBB"/.test(h));
  T('영상에 등장 애니 인라인', /mkp-fade 0.4s/.test(h));
  T('정지 렌더 = 애니 없음·video 유지', (() => { const s = P.sceneHTML(doc.scenes[0], { still: true }); return !s.includes('animation:') && /<video/.test(s); })());
  const pa = P.playAudit();
  T('playAudit 회귀', pa.ok, JSON.stringify(pa.violations));
}

/* ============ 4. 에디터 — 캔버스·미니씬 영상 실표시 ============ */
sec('4. 에디터 실DOM');
{
  window.localStorage.clear();
  PG.go('editor');
  const e = PG.state.editor, sc = e.doc.scenes[e.sceneIdx];
  const i = sc.elements.findIndex((x) => x.kind !== 'text');
  window.MK_LIVE.replaceWithSrc(e.doc, e.sceneIdx, i, { name: '체육대회 영상', kind: 'video', src: 'data:video/mp4;base64,VVVV' });
  PG.render();
  const cvVid = window.document.querySelector('.ed-canvas video.ed-imgreal');
  T('캔버스 — 영상 <video> 실표시', !!cvVid && cvVid.getAttribute('src') === 'data:video/mp4;base64,VVVV');
  T('캔버스 영상 무음·루프', cvVid && cvVid.hasAttribute('muted') && cvVid.hasAttribute('loop'));
  const el = e.doc.scenes[e.sceneIdx].elements[i];
  T('교체 계약 유지 — video 플래그·틀 불변', el.video === true && el.media.kind === 'video' && el.src === 'data:video/mp4;base64,VVVV');
  T('isVideoEl — 교체 결과 실판별', V.isVideoEl(el));
  const miniVid = window.document.querySelector('.ed-mini video');
  T('미니씬 — 영상 첫 프레임 표기', !!miniVid && /pointer-events:none/.test(miniVid.getAttribute('style') || ''));
  /* 이미지 회귀 — img 경로 무변 */
  window.MK_LIVE.replaceWithSrc(e.doc, e.sceneIdx, i, { name: '사진', kind: 'image', src: 'data:image/png;base64,IIII' });
  PG.render();
  T('이미지 회귀 — <img> 경로 무변', !!window.document.querySelector('.ed-canvas img.ed-imgreal[src="data:image/png;base64,IIII"]'));
}

/* ============ 5. MP4 — 소리·영상 배선의 정직성 ============ */
sec('5. MP4 배선 정직성');
{
  /* jsdom = WebCodecs 없음 → 정직 거절 (R38 회귀) */
  const r = await V.exportMP4({ scenes: [{ duration: 1, elements: [] }] }, {});
  T('미지원 환경 정직 거절 유지', r.ok === false && /지원하지 않아요/.test(r.msg));
  T('120초 상한 유지', V.framePlan({ scenes: [{ duration: 200, elements: [] }] }, {}).capped === true);
  /* buildMasterPCM 은 내부 — 대신 그 재료(renderPattern×timeline)가 결합 가능함을 검증 */
  const md = { scenes: [{ duration: 2, elements: [], music: { synth: 'calm' } }] };
  const tl = V.musicTimeline(md);
  const seg = tl.segments[0];
  const pcm = A.renderPattern(seg.music.synth, seg.end - seg.start, 48000);
  T('타임라인×PCM 결합 성립', pcm && pcm.length === Math.round((seg.end - seg.start) * 48000));
  /* 내보내기 완료 문구에 소리 표기 배선 */
  const src = fs.readFileSync('screens/editor.js', 'utf8');
  T('완료 문구 소리 표기 배선', /소리 포함/.test(src) && /audioMsg/.test(src));
  T('MP4 소리 트랙 코드 실존 (AAC 모노)', /mp4a\.40\.2/.test(fs.readFileSync('data/video.js', 'utf8')));
  T('영상 시킹 합성 코드 실존', /seekTo\(sp\.vids\[i\], t\)/.test(fs.readFileSync('data/video.js', 'utf8')));
}

/* ============ 결과 ============ */
console.log(`\nR39 검증: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
if (fail) process.exit(1);
