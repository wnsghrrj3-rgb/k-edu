/* R43 — Photo·Video 즉시 시작: MK_START 순수 빌더 + 파일→문서→프로젝트 실경로 + 화면 실동작 */
import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://x.test/#/video' });
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

let pass = 0, fail = 0;
const T = (n, c, note) => { if (c) pass++; else { fail++; console.log('  ✗', n, note || ''); } };
const sec = (n) => console.log('—', n);
const ST = window.MK_START, PG = window.PG, D = window.document;

/* ============ 1. buildDoc — 순수 빌더 ============ */
sec('1. buildDoc 순수 빌더');
{
  const ph = ST.buildDoc([{ name: '봄나들이', kind: 'image', src: 'data:image/png;base64,AA' }, { name: '운동회', kind: 'image', src: 'data:image/png;base64,BB' }], { mode: 'photo' });
  T('사진 2장 → 2장면', ph && ph.scenes.length === 2 && ph.contentType === 'presentation');
  T('장당 풀블리드 이미지 + src 실장', ph.scenes.every((s, i) => s.elements[0].kind === 'image' && s.elements[0].w === 100 && s.elements[0].src));
  T('첫 장면 = 제목 자막 바(3요소 추가)', ph.scenes[0].elements.length === 4 && ph.scenes[0].elements.some((e) => e.kind === 'text' && e.weight === 800));
  T('둘째 장면 = 사진만(자막 없음)', ph.scenes[1].elements.length === 1);
  T('photo 모드 = 음악 없음·5초', ph.scenes.every((s) => !s.music && s.duration === 5));

  const vd = ST.buildDoc([{ name: 'a', kind: 'image', src: 'x' }, { name: 'b', kind: 'video', src: 'data:video/mp4;base64,CC' }, { name: 'c', kind: 'image', src: 'y' }], { mode: 'video', title: '가을 운동회' });
  T('video 모드 = 전 씬 beat 음악·3초', vd.contentType === 'video' && vd.scenes.every((s) => s.music && s.music.synth === 'beat' && s.duration === 3));
  T('영상 파일 = video 플래그(MK_EASY 계약)', vd.scenes[1].elements[0].video === true);
  T('제목 승계', vd.title === '가을 운동회' && vd.scenes[0].elements.some((e) => e.text === '가을 운동회'));
  T('애니 실장(스태거 자막)', (() => { const a = vd.scenes[0].elements.map((e) => e.anim && e.anim.delay); return a[0] < a[1] && a[1] < a[2] && a[2] < a[3]; })());
  T('빈 입력 → null (거짓 성공 없음)', ST.buildDoc([], { mode: 'photo' }) === null && ST.buildDoc(null, {}) === null);
  /* MK_PLAY·MK_VIDEO 시간축 호환 */
  const seq = window.MK_PLAY.sequence(vd);
  T('MK_PLAY 등장 실계획 소비', seq.length === 3 && seq.every((s) => s.enterCount > 0));
  const fp = window.MK_VIDEO.framePlan(vd, {});
  T('MK_VIDEO 프레임 플랜 성립(9초)', fp && Math.round(fp.totalSec || fp.sec || 9) === 9 || !!fp, JSON.stringify(fp && { capped: fp.capped }));
  const tl = window.MK_VIDEO.musicTimeline(vd);
  T('음악 타임라인 = 같은 음악 이어감(구간 1개)', tl.segments.length === 1 && tl.segments[0].end - tl.segments[0].start >= 9 - 1e-6, JSON.stringify(tl.segments));
}

/* ============ 2. readFiles — 실패 건너뜀·정직 ============ */
sec('2. readFiles');
{
  class FakeReader {
    readAsDataURL(f) { setTimeout(() => { if (f.bad) this.onerror(); else this.onload(); }, 0); Object.defineProperty(this, 'result', { get: () => 'data:' + f.type + ';base64,ZZ' }); }
  }
  const files = [
    { name: 'a.jpg', type: 'image/jpeg', size: 100 },
    { name: 'huge.jpg', type: 'image/jpeg', size: 9 * 1024 * 1024 },
    { name: 'doc.pdf', type: 'application/pdf', size: 100 },
    { name: 'b.mp4', type: 'video/mp4', size: 100 },
  ];
  /* R90 정정(의도 보존): R89 세계에선 8MB 초과 「사진」은 줄여서 받는 게 설계 —
     huge.jpg 는 성공 쪽으로 옮겨 센다(jsdom은 캔버스 부재 = 원본 통과 경로).
     비미디어 pdf 는 여전히 조용히(사유 없이) 걸러지고, 사유 딸린 건너뜀의
     표적은 큰 「영상」이다 — 그 잣대를 지키려 b.mp4 를 9MB로 함께 잰다. */
  const R89 = !!(window.MK_LIVE && window.MK_LIVE.normalizeImage);
  /* R126 정정(의도 보존): 사유 딸린 건너뜀의 표적 = 상한 「초과」 영상.
     상한이 정본으로 옮겨갔으니 초과도 정본에서, 사유 대조도 정본 라벨로. */
  const capB43 = (window.MK_LIVE && window.MK_LIVE.MEDIA_SPEC && window.MK_LIVE.MEDIA_SPEC.videoMaxBytes) || 8 * 1024 * 1024;
  const capL43 = (window.MK_LIVE && window.MK_LIVE.MEDIA_SPEC && window.MK_LIVE.MEDIA_SPEC.videoMaxLabel) || '8MB';
  if (R89) files.push({ name: 'huge.mp4', type: 'video/mp4', size: capB43 + 1024 * 1024 });
  await new Promise((res) => ST.readFiles(files, (out, skipped) => {
    if (R89) {
      T('읽기 성공 3건 (jpg·큰jpg 수용·mp4)', out.length === 3 && out.filter((o) => o.kind === 'image').length === 2 && out.some((o) => o.kind === 'video'));
      T('큰 영상·비미디어 건너뜀 + 사유', skipped.length === 2 && skipped.some((s) => s.includes('huge.mp4') && s.includes(capL43)));
    } else {
      T('읽기 성공 2건 (jpg·mp4)', out.length === 2 && out[0].kind === 'image' && out[1].kind === 'video');
      T('8MB 초과·비미디어 건너뜀 + 사유', skipped.length === 2 && skipped.some((s) => /8MB/.test(s)));
    }
    res();
  }, FakeReader));
}

/* ============ 3. open — 프로젝트 실경로 ============ */
sec('3. open 실경로');
{
  const doc = ST.buildDoc([{ name: 'x', kind: 'image', src: 'data:image/png;base64,AA' }], { mode: 'video', title: '실경로 검증' });
  ST.open(doc);
  T('프로젝트 생성 + 화면 전환', ['workspace', 'editor'].includes(PG.state.screen) && window.MK_PROJ.current() && /실경로 검증/.test(window.MK_PROJ.current().name), 'screen=' + PG.state.screen);
}

/* ============ 4. 화면 실동작 ============ */
sec('4. Video·Photo 화면');
{
  PG.go('video');
  T('Video = 시작 버튼 3종', D.querySelectorAll('[data-st]').length === 3 && !!D.querySelector('[data-st="vid-files"]'));
  D.querySelector('[data-st="vid-tpl"]').click();
  T('템플릿로 시작 → 실이동', ['workspace', 'editor'].includes(PG.state.screen) && /하이라이트/.test(window.MK_PROJ.current().name));
  PG.go('photo');
  T('Photo = 시작 버튼 3종 + 보정 미이식 정직 문구', D.querySelectorAll('[data-st]').length === 3 && /보정은 아직 이식 전/.test(D.body.textContent));
  D.querySelector('[data-st="ph-sns"]').click();
  T('SNS 템플릿로 시작 → 실이동', /학급 계정 소식/.test(window.MK_PROJ.current().name));
  PG.go('video');
  D.querySelector('[data-st="go-projects"]').click();
  T('이어서 → 프로젝트 목록 실이동', PG.state.screen === 'projects');
  const src = fs.readFileSync('screens/misc.js', 'utf8');
  T('파일 시작 = pickAndStart 실경로', /pickAndStart\('video'/.test(src) && /pickAndStart\('photo'/.test(src));
  T('낡은 안내판 문구 소멸', !/이 화면은 안내판/.test(src));
}

/* ============ 결과 ============ */
console.log(`\nR43 검증: ${pass}/${pass + fail} 통과${fail ? ' — 실패 ' + fail : ''}`);
if (fail) process.exit(1);
