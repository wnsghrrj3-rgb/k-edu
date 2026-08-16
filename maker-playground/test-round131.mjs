/* ============================================================
   test-round131.mjs — R131 한국어 음성 1개짜리 기기에서도 캐릭터가 갈린다
   ------------------------------------------------------------
   준호: 「한국어는 지원이 별로 안 되네. 좀 다양하게 안 돼?」

   할 수 없는 것의 기록 — 브라우저에 한국어 음성을 **추가할 수 없다**(설치
   음성은 OS·브라우저 소관, 크롬/윈도우는 흔히 1~2개). 그 제약 안의 지렛대 둘:
   ① 화자 프리셋 — 같은 음성도 높낮이(pitch)×배속을 조합하면 캐릭터가 갈린다.
      6종(기본·밝은 아이·차분한 어른·낮은 목소리·씩씩한 진행자·느린 이야기꾼).
   ② 대본 [화자] 태그 — 진짜 다양성은 파일 목소리 쪽이다. 씬에 화자를 지정하면
      「대본 복사」에 [태그]가 실려 TTS 도구가 캐릭터별 목소리로 갈라 뽑는다.
   덤: 한국어 음성 ≤2 인 기기에는 화면이 엣지 안내를 띄운다(할 수 있는 다음
   행동을 말한다), 음성 목록은 한국어 전량 + 그 외 8개(엣지 400+ 늪 방지).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R131_ROOT || path.resolve('.');
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

const A = w.MK_AUDIO;
const L = w.MK_LIVE;
let ssrc = '';
try { ssrc = read('screens/studio.js'); } catch (_) { ssrc = ''; }

class FakeU { constructor(t) { this.text = t; this.rate = 1; this.pitch = 1; this.voice = null; } }
const SPOKE = [];
const oneKo = { getVoices: () => [{ name: '유나', lang: 'ko-KR' }],
  speak: (u) => SPOKE.push(u), cancel: () => {} };

/* ================================================================
   ⑴ 화자 프리셋 — 음성 1개 기기의 캐릭터 축
   ================================================================ */
sec('1. 화자 프리셋 (SPEAK_PRESETS)');

T('★ 프리셋 6종 · 높낮이×배속이 실제로 서로 다르다 (이름만 다르면 장식)', () => {
  const P = A.SPEAK_PRESETS;
  if (!Array.isArray(P) || P.length < 6) return '프리셋 ' + ((P && P.length) || 0) + '종';
  const keys = P.map((p2) => p2.pitch + '/' + p2.rate);
  return new Set(keys).size === P.length || '중복 조합: ' + keys.join(' · ');
});

T('★ pitch 가 발화에 실린다 — 밝은 아이 프리셋 실측', () => {
  SPOKE.length = 0;
  const sp = A.makeSpeaker({ synth: oneKo, Utterance: FakeU });
  const kid = A.SPEAK_PRESETS.find((p2) => p2.id === 'sp-kid');
  const r = sp.speak('성벽에 오르다', { pitch: kid.pitch, rate: kid.rate });
  const u = SPOKE[SPOKE.length - 1];
  return (r.ok && u && u.pitch === kid.pitch && u.rate === kid.rate) || JSON.stringify({ r, u });
});

T('반례 — pitch 는 0~2 로 잡힌다 (폭주 99 → 2 · 음수 → 0)', () => {
  SPOKE.length = 0;
  const sp = A.makeSpeaker({ synth: oneKo, Utterance: FakeU });
  sp.speak('가', { pitch: 99 }); sp.speak('나', { pitch: -3 });
  return (SPOKE[0].pitch === 2 && SPOKE[1].pitch === 0) || JSON.stringify(SPOKE.map((u) => u.pitch));
});

T('pitch 미지정 = 1 (종전 발화 불변 — R130 회귀)', () => {
  SPOKE.length = 0;
  const sp = A.makeSpeaker({ synth: oneKo, Utterance: FakeU });
  sp.speak('다');
  return SPOKE[0].pitch === 1 || String(SPOKE[0].pitch);
});

/* ================================================================
   ⑵ 대본 [화자] 태그 — 파일 목소리 다양화의 근거
   ================================================================ */
sec('2. 대본 태그 (captionScript)');

const capEl = (t) => ({ kind: 'text', stCap: true, text: t, x: 6, y: 80, w: 88, size: 4.4 });

T('★ 씬 화자가 대본에 [태그]로 실린다 (TTS 가 캐릭터별로 갈라 뽑는 근거)', () => {
  const d = { scenes: [
    { duration: 3, speaker: '밝은 아이', elements: [capEl('여정의 시작')] },
    { duration: 3, elements: [capEl('성벽에 오르다')] }] };
  const r = L.captionScript(d);
  return r.text === '1. [밝은 아이] 여정의 시작\n2. 성벽에 오르다' || JSON.stringify(r);
});

T('화자 없는 문서 = R130 형식 그대로 (기존 대본 불변)', () => {
  const d = { scenes: [{ duration: 3, elements: [capEl('여정의 시작')] }, { duration: 3, elements: [] }] };
  const r = L.captionScript(d);
  return r.text === '1. 여정의 시작\n2. (대사 없음)' || JSON.stringify(r);
});

T('반례 — 공백 화자는 태그가 안 붙는다... 는 아니고 지정한 대로 낸다 (지어내지 않는다)', () => {
  const d = { scenes: [{ duration: 3, speaker: '  할아버지  ', elements: [capEl('허허')] }] };
  const r = L.captionScript(d);
  return r.text === '1. [할아버지] 허허' || JSON.stringify(r);
});

/* ================================================================
   ⑶ 화면 배선
   ================================================================ */
sec('3. 화면 배선 (studio)');

T('★ 화자 칩 배선 — 프리셋에서 그린다 (손글씨 목록 금지)', () => {
  if (!ssrc) return 'studio.js 부재';
  if (!ssrc.includes('data-st-spkp')) return '칩 부재';
  return /SPEAK_PRESETS\.map/.test(ssrc) || '칩이 프리셋을 안 읽는다';
});

T('★ 칩 하나가 둘을 동시에 진다 — 미리듣기(높낮이×배속) + 씬 화자 라벨', () => {
  if (!ssrc) return 'studio.js 부재';
  const i = ssrc.indexOf('[data-st-spkp]');
  const seg = ssrc.slice(i, i + 700);
  return (/st\(\)\.pitch = p2\.pitch/.test(seg) && /sc2\.speaker = p2\.name/.test(seg))
    || '칩이 반쪽만 진다';
});

T('「기본」 칩은 화자 라벨을 지운다 (태그 강요 금지)', () => {
  if (!ssrc) return 'studio.js 부재';
  const i = ssrc.indexOf('[data-st-spkp]');
  return /sp-basic'\) delete sc2\.speaker/.test(ssrc.slice(i, i + 700)) || '기본이 라벨을 남긴다';
});

T('★ 미리듣기 발화가 pitch 를 전달한다', () => {
  if (!ssrc) return 'studio.js 부재';
  const i = ssrc.indexOf('[data-st-speak]');
  return /pitch: st\(\)\.pitch/.test(ssrc.slice(i, i + 500)) || 'pitch 미전달';
});

T('★ 음성 목록 — 한국어 전량 + 그 외 8개 (20개 절단·늪 동시 해소)', () => {
  if (!ssrc) return 'studio.js 부재';
  if (/vs\.slice\(0, 20\)/.test(ssrc)) return '20개 절단 잔존';
  return (/ko = vs\.filter/.test(ssrc) && /slice\(0, 8\)/.test(ssrc)) || '목록 규칙 미배선';
});

T('★ 한국어 ≤2 기기에는 다음 행동을 말한다 (엣지 안내 + 화자 칩 안내)', () => {
  if (!ssrc) return 'studio.js 부재';
  return (/ko\.length <= 2/.test(ssrc) && /엣지/.test(ssrc)) || '안내 부재 — 막힌 채 끝난다';
});

/* ================================================================
   ⑷ 회귀
   ================================================================ */
sec('4. 회귀');

T('R130 화자 계약 불변 — 한국어 우선 정렬·겹침 방지·정직 경계 문구', () => {
  const sp = A.makeSpeaker({ synth: {
    getVoices: () => [{ name: 'Alice', lang: 'en-US' }, { name: '유나', lang: 'ko-KR' }],
    speak: () => {}, cancel: () => {} }, Utterance: FakeU });
  const vs = sp.voices();
  if (!(vs[0].name === '유나')) return '정렬 회귀';
  return (/미리듣기 전용/.test(ssrc) && /파일 목소리/.test(ssrc)) || '경계 문구 소실';
});

T('일괄 목소리·대본 복사 문 불변 (R130)', () => {
  if (!ssrc) return 'studio.js 부재';
  const miss = ['data-st-script', 'data-st-vbatch'].filter((k) => !ssrc.includes(k));
  return !miss.length || '누락: ' + miss.join(',');
});

T('재생 세계 무접촉 유지 (play.js 에 speechSynthesis·pitch 0)', () => {
  const psrc2 = read('data/play.js');
  return !/speechSynthesis|SPEAK_PRESETS/.test(psrc2) || '재생에 샜다';
});

T('학생 세계 무접촉 (workspace 에 R131 표식 0)', () => {
  const wsrc2 = read('screens/workspace.js');
  return !/data-st-spkp|SPEAK_PRESETS/.test(wsrc2) || 'workspace 에 샜다';
});

console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
process.exit(fail ? 1 : 0);
