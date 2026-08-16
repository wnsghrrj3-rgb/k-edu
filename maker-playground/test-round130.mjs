/* ============================================================
   test-round130.mjs — R130 대사 한 칸이 자막과 목소리 둘 다가 된다
   ------------------------------------------------------------
   준호: 「자막 부분에 글씨를 입력하면 자막으로도 나오고 AI 목소리로도 나오게.
   폰트나 크기, 목소리도 다양하게.」

   브라우저 음성은 파일에 실리지 않으므로(캡처 API 부재 — R129 기록) 다리는
   넷이다, 전부 정직하게:
   ① captionScript(순수) — 전 씬 대사를 번호 대본 하나로. 대사 없는 씬도
      번호를 지킨다(파일 번호와 씬 번호가 어긋나면 목소리가 엉뚱한 장면에).
   ② assignVoices(순수) — TTS mp3 여러 개를 파일 이름 숫자 순서로 일괄 배치.
      남는 파일·빈 씬을 정직하게 센다.
   ③ makeSpeaker — 브라우저 목소리 「미리듣기 전용」(목소리 선택·배속).
      화면이 정직 경계 문구를 진다: 「영상에는 파일 목소리가 실려요」.
   ④ 자막 스타일 — 새 렌더 능력 0, R56 텍스트 스타일 프리셋 재사용 +
      크기·위치(하단/중앙/상단).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R130_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/studio', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};
const sec = (n) => console.log('\n[' + n + ']');

const L = w.MK_LIVE;
const A = w.MK_AUDIO;
let ssrc = '';
try { ssrc = read('screens/studio.js'); } catch (_) { ssrc = ''; }   /* §5② 부재 환원 */

const capEl = (t) => ({ kind: 'text', stCap: true, text: t, x: 6, y: 80, w: 88, size: 4.4 });

/* ================================================================
   ⑴ 대본 (captionScript)
   ================================================================ */
sec('1. 대본 (captionScript)');

T('★ 번호 대본 — 씬 순서대로, 대사 없는 씬도 번호를 지킨다', () => {
  if (typeof L.captionScript !== 'function') return 'captionScript 부재';
  const d = { scenes: [
    { duration: 3, elements: [capEl('여정의 시작')] },
    { duration: 3, elements: [] },
    { duration: 3, elements: [capEl('성벽에 오르다')] }] };
  const r = L.captionScript(d);
  return (r.text === '1. 여정의 시작\n2. (대사 없음)\n3. 성벽에 오르다'
    && r.scenes === 3 && r.withCaption === 2) || JSON.stringify(r);
});

T('빈 문서 = 빈 대본 (던지지 않는다)', () => {
  const r = L.captionScript({ scenes: [] });
  return (r.text === '' && r.scenes === 0) || JSON.stringify(r);
});

T('공백 대사는 「대사 없음」으로 정직 표기', () => {
  const r = L.captionScript({ scenes: [{ duration: 2, elements: [capEl('   ')] }] });
  return (r.text === '1. (대사 없음)' && r.withCaption === 0) || JSON.stringify(r);
});

/* ================================================================
   ⑵ 일괄 배치 (assignVoices)
   ================================================================ */
sec('2. 일괄 배치 (assignVoices)');

const mk3 = () => ({ scenes: [{ duration: 2, elements: [] }, { duration: 2, elements: [] }, { duration: 2, elements: [] }] });

T('★ 파일 이름 숫자 순서로 앉는다 (1,2,10 — 사전순이면 1,10,2 로 엉킨다)', () => {
  if (typeof L.assignVoices !== 'function') return 'assignVoices 부재';
  const d = { scenes: [{ duration: 2, elements: [] }, { duration: 2, elements: [] }, { duration: 2, elements: [] }] };
  const r = L.assignVoices(d, [
    { name: '10.mp3', src: 'data:audio/mpeg;base64,TEN', duration: 2 },
    { name: '1.mp3', src: 'data:audio/mpeg;base64,ONE', duration: 2 },
    { name: '2.mp3', src: 'data:audio/mpeg;base64,TWO', duration: 2 }]);
  const got = d.scenes.map((sc) => sc.narration.src.slice(-3)).join(',');
  return (r.assigned === 3 && got === 'ONE,TWO,TEN') || JSON.stringify({ r, got });
});

T('★ 남는 파일·빈 씬을 정직하게 센다', () => {
  const d2 = mk3();
  const r2 = L.assignVoices(d2, [{ name: '1.mp3', src: 'data:audio/mpeg;base64,A', duration: 1 }]);
  if (!(r2.assigned === 1 && r2.empty === 2 && r2.extra === 0)) return '부족: ' + JSON.stringify(r2);
  const d3 = { scenes: [{ duration: 2, elements: [] }] };
  const r3 = L.assignVoices(d3, [
    { name: '1.mp3', src: 'data:audio/mpeg;base64,A', duration: 1 },
    { name: '2.mp3', src: 'data:audio/mpeg;base64,B', duration: 1 }]);
  return (r3.assigned === 1 && r3.extra === 1) || '초과: ' + JSON.stringify(r3);
});

T('배치 자리 = 녹음·파일과 같은 계약(scene.narration) — 믹스가 그대로 싣는다', () => {
  const d = mk3();
  L.assignVoices(d, [{ name: '1.mp3', src: 'data:audio/mpeg;base64,A', duration: 1.24 }]);
  const nn = d.scenes[0].narration;
  return (nn && nn.src && nn.duration === 1.2) || JSON.stringify(nn);
});

T('반례 — src 없는 항목은 걸러진다 (빈 목소리가 씬을 덮지 않는다)', () => {
  const d = mk3();
  const r = L.assignVoices(d, [{ name: '1.mp3' }, { name: '2.mp3', src: 'data:audio/mpeg;base64,B', duration: 1 }]);
  return (r.assigned === 1 && d.scenes[0].narration.src.endsWith('B')) || JSON.stringify(r);
});

/* ================================================================
   ⑶ 미리듣기 화자 (makeSpeaker · 기관 주입)
   ================================================================ */
sec('3. 미리듣기 (makeSpeaker)');

T('★ makeSpeaker 실존 · 기관 없는 세계 = 미지원 정직 보고', () => {
  if (typeof A.makeSpeaker !== 'function') return 'makeSpeaker 부재';
  const sp = A.makeSpeaker();
  if (sp.supported()) return 'jsdom 에 음성이 있을 리 없다';
  const r = sp.speak('안녕');
  return (!r.ok && /지원하지 않아요/.test(r.msg)) || JSON.stringify(r);
});

const SPOKE = [];
class FakeU { constructor(t) { this.text = t; this.rate = 1; this.voice = null; } }
const fakeSynth = {
  getVoices: () => [
    { name: 'Alice EN', lang: 'en-US' },
    { name: '유나', lang: 'ko-KR' },
    { name: '민준', lang: 'ko-KR' }],
  speak: (u) => SPOKE.push(u), cancel: () => SPOKE.push('CANCEL'),
};

T('★ 한국어 목소리가 먼저 온다 (준호의 대사는 한국어다)', () => {
  const sp = A.makeSpeaker({ synth: fakeSynth, Utterance: FakeU });
  const vs = sp.voices();
  return (vs.length === 3 && /^ko/.test(vs[0].lang) && /^ko/.test(vs[1].lang) && vs[2].name === 'Alice EN')
    || JSON.stringify(vs.map((v) => v.name));
});

T('★ 목소리·배속이 실제로 실린다 (다양화의 실측)', () => {
  SPOKE.length = 0;
  const sp = A.makeSpeaker({ synth: fakeSynth, Utterance: FakeU });
  const r = sp.speak('성벽에 오르다', { voice: '민준', rate: 1.2 });
  const u = SPOKE.find((x) => x !== 'CANCEL');
  return (r.ok && u && u.text === '성벽에 오르다' && u.voice && u.voice.name === '민준' && u.rate === 1.2)
    || JSON.stringify({ r, u });
});

T('반례 — 빈 대사는 정직 거부 · 배속은 0.5~2 로 잡힌다', () => {
  SPOKE.length = 0;
  const sp = A.makeSpeaker({ synth: fakeSynth, Utterance: FakeU });
  const r0 = sp.speak('   ');
  sp.speak('가', { rate: 99 });
  const u = SPOKE.find((x) => x !== 'CANCEL');
  return (!r0.ok && /대사가 없어요/.test(r0.msg) && u && u.rate === 2) || JSON.stringify({ r0, u });
});

T('새 미리듣기가 이전 것을 끊는다 (cancel 선행 — 목소리 겹침 0)', () => {
  SPOKE.length = 0;
  const sp = A.makeSpeaker({ synth: fakeSynth, Utterance: FakeU });
  sp.speak('하나'); sp.speak('둘');
  return (SPOKE.filter((x) => x === 'CANCEL').length === 2 && SPOKE[0] === 'CANCEL')
    || JSON.stringify(SPOKE.map((x) => (x === 'CANCEL' ? x : x.text)));
});

/* ================================================================
   ⑷ 화면 배선 · 정직 경계
   ================================================================ */
sec('4. 화면 배선 (studio)');

T('★ 대본 복사·목소리 일괄 배선', () => {
  if (!ssrc) return 'studio.js 부재';
  const miss = ['data-st-script', 'data-st-vbatch'].filter((k) => !ssrc.includes(k));
  if (miss.length) return '누락: ' + miss.join(',');
  return (/captionScript/.test(ssrc) && /assignVoices/.test(ssrc)) || '순수 계층을 안 탄다';
});

T('★ 정직 경계 문구 — 「미리듣기 전용 · 영상에는 파일 목소리」를 화면이 진다', () => {
  if (!ssrc) return 'studio.js 부재';
  return (/미리듣기 전용/.test(ssrc) && /파일 목소리/.test(ssrc))
    || '경계 문구 부재 — 브라우저 목소리가 실리는 줄 알게 된다';
});

T('미리듣기 3배선 (재생·목소리 선택·배속)', () => {
  if (!ssrc) return 'studio.js 부재';
  const miss = ['data-st-speak', 'data-st-voice', 'data-st-rate'].filter((k) => !ssrc.includes(k));
  return !miss.length || '누락: ' + miss.join(',');
});

T('★ 자막 스타일 = R56 프리셋 재사용 (새 렌더 능력 0) + 크기·위치', () => {
  if (!ssrc) return 'studio.js 부재';
  const miss = ['data-st-capstyle', 'data-st-capsize', 'data-st-cappos'].filter((k) => !ssrc.includes(k));
  if (miss.length) return '누락: ' + miss.join(',');
  return (/MK_TEXTSTYLE\.applyPreset/.test(ssrc) && /TS\.PRESETS\.map/.test(ssrc)) || '프리셋 미재사용';
});

T('일괄 반입도 취소 = 변화 0 (R46 규약)', () => {
  if (!ssrc) return 'studio.js 부재';
  const i = ssrc.indexOf('[data-st-vbatch]');
  return /if \(!files\.length\) return/.test(ssrc.slice(i, i + 800)) || '취소 경로 부재';
});

T('일괄 결과 보고가 셋을 다 센다 (앉힘·남음·빈 씬)', () => {
  if (!ssrc) return 'studio.js 부재';
  const i = ssrc.indexOf('[data-st-vbatch]');
  const seg = ssrc.slice(i, i + 1400);
  return (/r2\.assigned/.test(seg) && /r2\.extra/.test(seg) && /r2\.empty/.test(seg)) || '보고 미흡';
});

/* ================================================================
   ⑸ 회귀
   ================================================================ */
sec('5. 회귀');

T('applyPreset 이 자막 요소를 훼손하지 않는다 (stCap·text·기하 불변)', () => {
  const TS = w.MK_TEXTSTYLE;
  if (!TS) return 'MK_TEXTSTYLE 부재';
  const c = capEl('여정의 시작');
  TS.applyPreset(c, 'ts-poster');
  return (c.stCap === true && c.text === '여정의 시작' && c.x === 6 && c.y === 80 && c.kind === 'text')
    || JSON.stringify(c);
});

T('개별 반입 문 불변 (R129 — nfile·mfile·mall 그대로)', () => {
  if (!ssrc) return 'studio.js 부재';
  const miss = ['data-st-nfile', 'data-st-mfile', 'data-st-mall'].filter((k) => !ssrc.includes(k));
  return !miss.length || '누락: ' + miss.join(',');
});

T('학생 세계 무접촉 (workspace 에 R130 표식 0)', () => {
  const wsrc2 = read('screens/workspace.js');
  return !/data-st-(script|vbatch|speak|capstyle)/.test(wsrc2) || 'workspace 에 샜다';
});

T('재생 세계 무접촉 (play.js 에 speechSynthesis 0 — 재생은 파일 목소리만)', () => {
  const psrc2 = read('data/play.js');
  return !/speechSynthesis/.test(psrc2) || '재생에 브라우저 목소리가 샜다 — 저장본과 갈라진다';
});

console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
process.exit(fail ? 1 : 0);
