/* ============================================================
   test-round129.mjs — R129 AI 목소리·AI 음악이 파일로 들어온다
   ------------------------------------------------------------
   준호: 「AI 목소리와 배경음악 등은 불가능하지?」 — 절반은 이미 엔진에 있고
   문만 없었다. 나레이션 슬롯(R127)·파일 음악 재생(R38 play src)·파일 음악
   믹스(musicTimeline→decodeToPCM)는 전부 살아 있는데, 스튜디오 화면이
   녹음과 합성음만 열어 두고 있었다.

   가지 않은 길의 기록 — 브라우저 내장 음성(speechSynthesis)은 캡처 API 가
   없어 **파일에 싣지 못한다.** 미리보기에만 목소리가 나고 저장본엔 없는
   제품은 거짓이다. 그래서 TTS 직결 대신 **파일 반입**이 정답이다: 준호가
   GPT·TTS 로 뽑은 mp3 를 씬 나레이션으로, Suno 류 음악을 배경음악으로.

   메운 문 셋(전부 배선 — 새 엔진 0):
   ① 나레이션 파일 반입(📁) — 녹음과 **같은 자리**(scene.narration)에 앉아
      R127 믹스(덕킹 포함)가 그대로 싣는다. 녹음 미지원 브라우저도 파일은 산다.
   ② 음악 파일 반입(📁) — sc.music={src,name}. 미리보기(play src)·내보내기
      (decodeToPCM) 기왕 지원.
   ③ 「모든 장면에」 — 같은 음악을 전 씬에 깔면 musicTimeline 이 한 구간으로
      병합해 장면이 넘어가도 이어 흐른다. 이 병합이 이 라운드의 핵심 계약이라
      musicTimeline 을 공개 표면에 올려 직접 잰다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R129_ROOT || path.resolve('.');
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

const V = w.MK_VIDEO;
const A = w.MK_AUDIO;
let ssrc = '';
try { ssrc = read('screens/studio.js'); } catch (_) { ssrc = ''; }   /* §5② — 원본 세계 부재 환원 */
const asrc2 = read('data/audio.js');

const MUS = 'data:audio/mpeg;base64,SUNO';
const VOICE = 'data:audio/mpeg;base64,TTSVOICE';

/* ================================================================
   ⑴ ★ 이어 흐름 (musicTimeline 병합) — 「모든 장면에」의 근거
   ================================================================ */
sec('1. 이어 흐름 (musicTimeline)');

T('★ musicTimeline 이 공개 표면에 있다 (핵심 계약을 직접 잰다)', () =>
  typeof V.musicTimeline === 'function' || 'musicTimeline 미공개');

T('★ 같은 파일 음악을 전 씬에 깔면 한 구간으로 병합된다 (끊김 0)', () => {
  if (typeof V.musicTimeline !== 'function') return '미공개';
  const d = { scenes: [
    { duration: 3, music: { src: MUS, name: 'AI음악' }, elements: [] },
    { duration: 4, music: { src: MUS, name: 'AI음악' }, elements: [] },
    { duration: 2, music: { src: MUS, name: 'AI음악' }, elements: [] }] };
  const tl = V.musicTimeline(d);
  return (tl.segments.length === 1 && tl.segments[0].start === 0
    && Math.abs(tl.segments[0].end - 9) < 1e-6) || JSON.stringify(tl.segments);
});

T('다른 음악은 갈라진다 (병합이 무차별이 아니다)', () => {
  const d = { scenes: [
    { duration: 3, music: { src: MUS }, elements: [] },
    { duration: 2, music: { synth: 'piano' }, elements: [] }] };
  const tl = V.musicTimeline(d);
  return tl.segments.length === 2 || JSON.stringify(tl.segments);
});

T('음악 없는 씬은 공백이 된다 (이어 흐름이 공백을 안 메운다)', () => {
  const d = { scenes: [
    { duration: 3, music: { src: MUS }, elements: [] },
    { duration: 2, elements: [] },
    { duration: 2, music: { src: MUS }, elements: [] }] };
  const tl = V.musicTimeline(d);
  return (tl.segments.length === 2 && Math.abs(tl.segments[1].start - 5) < 1e-6)
    || JSON.stringify(tl.segments);
});

/* ================================================================
   ⑵ ★ 파일 음악이 실제로 믹스에 실린다 (해독 주입 실측)
   ================================================================ */
sec('2. 파일 음악 믹스 (buildMasterPCM)');

const SR = 1000;
const calls = [];
const fakeDecode = async (src, len, sr, o) => {
  calls.push(src);
  const out = new Float32Array(len);
  out.fill(src === VOICE ? 0.6 : 0.4);
  return out;
};

const B = {};
Promise.resolve()
  .then(async () => {
    if (typeof V.buildMasterPCM !== 'function') { B._err = '미공개'; return; }
    const doc = { scenes: [
      { duration: 3, music: { src: MUS }, narration: { src: VOICE, duration: 3 }, elements: [] },
      { duration: 3, music: { src: MUS }, elements: [] }] };
    const tl = V.musicTimeline ? V.musicTimeline(doc) : { totalSec: 6, segments: [{ key: 'src:' + MUS.slice(0, 64), start: 0, end: 6, music: { src: MUS } }] };
    B.m = await V.buildMasterPCM(tl, SR, doc, null, { decode: fakeDecode });
    B.calls = calls.slice();
  })
  .then(() => {
    T('★ 파일 음악이 해독·믹스된다 (씬2 한가운데 = 0.4×0.85)', () => {
      if (B._err) return B._err;
      const got = B.m[Math.round(4.5 * SR)];
      return Math.abs(got - 0.34) < 1e-3 || `실제 ${got.toFixed(3)}`;
    });

    T('★ AI 목소리 파일이 나레이션 자리로 실리고 음악이 덕킹된다', () => {
      if (B._err) return B._err;
      /* 씬1 한가운데: 음악 0.4×0.85×0.35(덕킹) + 목소리 0.6×1.0 = 0.719 */
      const got = B.m[Math.round(1.5 * SR)];
      return Math.abs(got - (0.4 * 0.85 * 0.35 + 0.6)) < 1e-3 || `실제 ${got.toFixed(3)}`;
    });

    T('전제 — 해독 호출에 음악·목소리가 다 있다 (§5② 공허 방지)', () => {
      if (B._err) return B._err;
      return (B.calls.includes(MUS) && B.calls.includes(VOICE)) || JSON.stringify(B.calls);
    });

    /* ================================================================
       ⑶ 화면 문 셋 (studio 배선)
       ================================================================ */
    sec('3. 스튜디오 문 (배선)');

    T('★ 나레이션 파일 반입(📁) — 녹음과 같은 자리에 앉는다', () => {
      if (!ssrc) return 'studio.js 부재';
      if (!ssrc.includes('data-st-nfile')) return '문 없음';
      const i = ssrc.indexOf("[data-st-nfile]");
      const seg = ssrc.slice(i, i + 900);
      return (/MK_AUDIO\.fileToSrc/.test(seg) && /sc\.narration = \{ src, duration/.test(seg))
        || '녹음과 다른 자리에 앉는다';
    });

    T('★ 녹음 미지원 세계에도 파일 문은 열려 있다', () => {
      if (!ssrc) return 'studio.js 부재';
      const i = ssrc.indexOf('이 브라우저는 녹음을 지원하지 않아요');
      if (i < 0) return '미지원 안내 부재';
      return /data-st-nfile/.test(ssrc.slice(Math.max(0, i - 300), i + 200)) || '미지원 세계에 파일 문이 없다';
    });

    T('★ 음악 파일 반입(📁) — sc.music={src,name} 계약', () => {
      if (!ssrc) return 'studio.js 부재';
      if (!ssrc.includes('data-st-mfile')) return '문 없음';
      const i = ssrc.indexOf("[data-st-mfile]");
      const seg = ssrc.slice(i, i + 900);
      return (/MK_AUDIO\.fileToSrc/.test(seg) && /sc\.music = \{ src, name/.test(seg)) || '계약 자리 미배선';
    });

    T('★ 「모든 장면에」 — 전 씬 동일 음악 (깊은 복사 — 씬끼리 객체 공유 금지)', () => {
      if (!ssrc) return 'studio.js 부재';
      if (!ssrc.includes('data-st-mall')) return '문 없음';
      const i = ssrc.indexOf("[data-st-mall]");
      const seg = ssrc.slice(i, i + 700);
      if (!/scenes\.forEach/.test(seg)) return '전 씬 적용이 아니다';
      return (/JSON\.parse/.test(seg) && /JSON\.stringify/.test(seg)) || '얕은 공유 — 한 씬을 고치면 전부 바뀐다';
    });

    T('음악 반입이 MK_AUDIO 게이트를 탄다 (비오디오·8MB 초과 = 기존 정직 거부)', () => {
      if (!asrc2.includes("8MB 이하만")) return 'audio.js 게이트 문구 변형';
      const i = asrc2.indexOf('function fileToSrc');
      const seg = asrc2.slice(i, i + 500);
      return (seg.includes('audio') && /8 \* 1024 \* 1024/.test(seg) && seg.includes('음악 파일'))
        || '게이트 계약 변형';
    });

    /* ================================================================
       ⑷ 회귀 · 가지 않은 길
       ================================================================ */
    sec('4. 회귀');

    T('speechSynthesis 직결 잔존 0 (미리보기만 나는 목소리 = 거짓 제품)', () => {
      if (!ssrc) return 'studio.js 부재';
      return !/speechSynthesis/.test(ssrc) || 'TTS 직결이 들어왔다 — 저장본에 못 싣는다';
    });

    T('녹음 경로 불변 (R127 — data-st-nrec/nstop 그대로)', () => {
      if (!ssrc) return 'studio.js 부재';
      const miss = ['data-st-nrec', 'data-st-nstop'].filter((k) => !ssrc.includes(k));
      return !miss.length || '누락: ' + miss.join(',');
    });

    T('합성음 경로 불변 (SYNTHS 버튼 그대로)', () => {
      if (!ssrc) return 'studio.js 부재';
      return /A\.SYNTHS\.map/.test(ssrc) || '합성음 문이 닫혔다';
    });

    T('미리보기 파일 음악 재생 실존 (R38 — play src 경로 · 소스 대조)', () => {
      const i = asrc2.indexOf('function play');
      const seg = asrc2.slice(i, i + 900);
      return (/music\.src/.test(seg) && /new Audio\(music\.src\)/.test(seg)) || '파일 음악 미리보기 부재';
    });

    T('학생 세계 무접촉 (workspace 에 R129 표식 0)', () => {
      const wsrc2 = read('screens/workspace.js');
      return !/data-st-(nfile|mfile|mall)/.test(wsrc2) || 'workspace 에 샜다';
    });

    console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
    process.exit(fail ? 1 : 0);
  })
  .catch((e) => {
    console.log('  ✗ R129 검사 예외 0  → 던졌다: ' + e.message);
    console.log(`\n결과: ${pass}/${pass + fail + 1}  (실패 ${fail + 1})`);
    process.exit(1);
  });
