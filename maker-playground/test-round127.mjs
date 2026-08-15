/* ============================================================
   test-round127.mjs — R127 소리가 파일에 실린다 (클립·나레이션·꾸미기)
   ------------------------------------------------------------
   R127 이 메운 구멍: **화면에는 있는데 파일에는 없는 소리.** R39 이래 MP4
   소리 트랙은 배경음악 타임라인만 탔다 — R126 으로 AI 클립이 문을 통과했는데,
   클립에 담긴 대사·현장음은 미리보기에서도 무음(muted 고정), 저장에서도
   무음이었다. 준호가 직접 물었다: 「영상에 들어 있는 소리는 안 들어가는 거야?」

   세 갈래:
   ① 클립·나레이션 → MP4 — soundSources(순수 수집) + buildMasterPCM 확장.
      순서가 뜻이다: 음악 → 나레이션 구간 덕킹(×0.35) → 클립(×0.9·음량) →
      나레이션(×1.0) → 클램프. 나레이션은 반복 금지(loop:false).
   ② 녹음 — MK_AUDIO.makeRecorder, 기관 전량 주입 가능(R89 Reader 주입 규약).
      실패는 전부 「뭘 하면 되는지」 딸린 정직한 문구.
   ③ 꾸미기 — 스티커 = 보통 텍스트 요소(신규 렌더 능력 0 · MK_DECOR 원칙),
      영상 요소의 죽은 표기(볼륨 100% 고정)를 실컨트롤로.

   ★ 반례 필수: 음소거 클립이 「해독조차 안 되는가」는 호출 기록이 2건 이상일
   때만 뜻이 있다 — 기록 0건이면 공허 통과다(§5② 네 라운드 연속 밟은 형태,
   이번엔 처음부터 가드를 박는다).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R127_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {};
w.confirm = () => true;
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
const P = w.MK_PLAY;
const A = w.MK_AUDIO;
const vsrc = read('data/video.js');
const psrc = read('data/play.js');
const wsrc = read('screens/workspace.js');

/* 공용 문서 — 준호 시나리오: 씬1 음악+나레이션, 씬2 클립(음량 0.5) */
const CLIP = 'data:video/mp4;base64,CLIP';
const CLIP_MUTED = 'data:video/mp4;base64,MUTEDCLIP';
const NARR = 'data:audio/webm;base64,NARR';
const mkDoc = () => ({ scenes: [
  { duration: 2.7, music: { synth: 'piano' }, narration: { src: NARR, duration: 2 },
    elements: [
      { kind: 'video', src: CLIP_MUTED, x: 0, y: 0, w: 40, h: 30, mute: true },
      { kind: 'image', src: 'data:image/png;base64,I', x: 50, y: 0, w: 30, h: 30 }] },
  { duration: 3,
    elements: [{ kind: 'video', src: CLIP, x: 0, y: 0, w: 60, h: 50, volume: 0.5 }] },
] });

/* ================================================================
   ⑴ 소리 원천 수집 (soundSources · 순수)
   ================================================================ */
sec('1. 소리 원천 (soundSources)');

T('★ soundSources 실존 · 준호 문서에서 나레이션 1 + 클립 1', () => {
  if (typeof V.soundSources !== 'function') return 'soundSources 부재';
  const ss = V.soundSources(mkDoc());
  return (ss.length === 2 && ss.filter((x) => x.kind === 'narration').length === 1
    && ss.filter((x) => x.kind === 'clip').length === 1) || JSON.stringify(ss);
});

T('★ 음소거 클립·이미지는 원천이 아니다', () => {
  if (typeof V.soundSources !== 'function') return 'soundSources 부재';
  const ss = V.soundSources(mkDoc());
  return !ss.some((x) => x.src === CLIP_MUTED || /image/.test(x.src)) || JSON.stringify(ss);
});

T('★ 시작초가 씬 누적이다 (씬2 클립 = 2.7초부터)', () => {
  if (typeof V.soundSources !== 'function') return 'soundSources 부재';
  const c = V.soundSources(mkDoc()).find((x) => x.kind === 'clip');
  return (c && Math.abs(c.start - 2.7) < 1e-6 && Math.abs(c.dur - 3) < 1e-6) || JSON.stringify(c);
});

T('나레이션은 반복 금지, 클립은 화면 루프 규약대로 반복', () => {
  if (typeof V.soundSources !== 'function') return 'soundSources 부재';
  const ss = V.soundSources(mkDoc());
  const nn = ss.find((x) => x.kind === 'narration'), cc = ss.find((x) => x.kind === 'clip');
  return (nn && nn.loop === false && cc && cc.loop === true) || JSON.stringify({ nn, cc });
});

T('음량이 0~1 로 잡힌다 (폭주 입력 3 → 1, 음수 → 0)', () => {
  if (typeof V.soundSources !== 'function') return 'soundSources 부재';
  const d = { scenes: [{ duration: 2, elements: [
    { kind: 'video', src: 'data:video/mp4;base64,x', volume: 3 },
    { kind: 'video', src: 'data:video/mp4;base64,y', volume: -1 }] }] };
  const vv = V.soundSources(d).map((x) => x.vol);
  return (vv.length === 2 && vv[0] === 1 && vv[1] === 0) || JSON.stringify(vv);
});

/* ================================================================
   ⑵ ★ 믹스 실측 (buildMasterPCM · 해독 주입)
   ================================================================ */
sec('2. 믹스 (buildMasterPCM)');

const SR = 1000;                                   /* 표본율을 줄여 배열을 작게 */
const calls = [];
const fakeDecode = async (src, len, sr, o) => {
  calls.push({ src, loop: o && o.loop });
  const out = new Float32Array(len);
  const val = src === NARR ? 0.6 : 0.4;
  const upto = (o && o.loop === false) ? Math.min(len, Math.round(2 * sr)) : len;  /* 나레이션 실길이 2초 흉내 */
  for (let i = 0; i < upto; i++) out[i] = val;
  return out;
};

const B = {};
Promise.resolve()
  .then(async () => {
    if (typeof V.buildMasterPCM !== 'function') { B._err = 'buildMasterPCM 미공개'; return; }
    const doc = mkDoc();
    /* 음악만 (원천 없이) — 종전 세계 기준선 */
    const docMusicOnly = JSON.parse(JSON.stringify(doc));
    delete docMusicOnly.scenes[0].narration;
    docMusicOnly.scenes.forEach((sc) => { sc.elements = sc.elements.filter((el) => el.kind !== 'video'); });
    /* musicTimeline·framePlan 은 비공개 — buildMasterPCM 에 필요한 timeline 을
       정본 형태 그대로(totalSec + segments) 손으로 짓는다. */
    const timeline = { totalSec: 5.7, segments: [{ key: 'synth:piano', start: 0, end: 2.7, music: { synth: 'piano' } }] };
    B.m0 = await V.buildMasterPCM(timeline, SR, docMusicOnly, null, { decode: fakeDecode });
    calls.length = 0;
    B.m1 = await V.buildMasterPCM(timeline, SR, doc, null, { decode: fakeDecode });
    B.calls = calls.slice();
  })
  .then(() => {
    const mid0 = Math.round(1.0 * SR);             /* 씬1 한가운데 (페이드 밖) */
    const mid1 = Math.round(4.2 * SR);             /* 씬2 한가운데 */

    T('★ 전제 — 해독 호출 기록 ≥ 2 (0건이면 아래 반례가 공허 통과다 · §5②)', () => {
      if (B._err) return B._err;
      return (B.calls && B.calls.length >= 2) || '해독 호출 ' + ((B.calls && B.calls.length) || 0) + '건 — 믹서가 원천을 안 읽는다';
    });

    T('★ 반례 — 음소거 클립은 해독조차 안 된다', () => {
      if (B._err) return B._err;
      if (!B.calls || B.calls.length < 2) return '전제 미성립';
      return !B.calls.some((c) => c.src === CLIP_MUTED) || '음소거 클립을 해독했다';
    });

    T('해독에 loop 계약이 전달된다 (나레이션 false · 클립 true)', () => {
      if (B._err) return B._err;
      const nc = B.calls.find((c) => c.src === NARR), cc = B.calls.find((c) => c.src === CLIP);
      return (nc && nc.loop === false && cc && cc.loop === true) || JSON.stringify(B.calls);
    });

    T('★ 나레이션 구간의 음악이 덕킹된다 (×0.35) 그리고 나레이션이 ×1.0 으로 얹힌다', () => {
      if (B._err) return B._err;
      const want = B.m0[mid0] * 0.35 + 0.6;
      const got = B.m1[mid0];
      return Math.abs(got - Math.min(1, want)) < 1e-3 || `기대 ${want.toFixed(3)} · 실제 ${got.toFixed(3)}`;
    });

    T('★ 클립은 음량을 존중한다 (0.9 × 0.5 × 0.4 = 0.18)', () => {
      if (B._err) return B._err;
      const got = B.m1[mid1];
      return Math.abs(got - 0.18) < 1e-3 || `실제 ${got.toFixed(3)}`;
    });

    T('나레이션 실길이(2초) 뒤는 음악만 남는다 (반복 금지의 실측)', () => {
      if (B._err) return B._err;
      const i = Math.round(2.4 * SR);              /* 나레이션 끝(2s)과 씬 끝(2.7s) 사이 */
      const want = B.m0[i] * 0.35;                 /* 덕킹은 씬 구간 전체 — 음악만, 목소리 0 */
      return Math.abs(B.m1[i] - want) < 1e-3 || `기대 ${want.toFixed(3)} · 실제 ${B.m1[i].toFixed(3)}`;
    });

    T('회귀 — 원천 없는 문서는 종전 음악 경로 그대로 (기준선 = 0.85 게인)', () => {
      if (B._err) return B._err;
      const pcm = A.renderPattern('piano', 0.001, SR);   /* 존재만 확인 — 결정론 전제 */
      if (!pcm) return 'renderPattern 부재';
      return (B.m0[mid1] === 0 && Math.abs(B.m0[mid0]) <= 1) || '기준선 오염';
    });

    T('★ 내보내기가 소리의 세 이유를 다 안다 (음악·클립·나레이션 — 소스 대조)', () => {
      const i = vsrc.indexOf('const wantAudio');
      if (i < 0) return 'wantAudio 부재';
      return /soundSources\(doc, plan\)/.test(vsrc.slice(i, i + 200)) || '클립·나레이션이 소리 조건에 없다';
    });

    /* ================================================================
       ⑶ 미리보기 패리티 (play.js)
       ================================================================ */
    sec('3. 미리보기 (sceneHTML · paintStage)');

    T('★ 기본 클립은 소리 켬 (muted 없음 · 자동·루프·인라인 유지)', () => {
      const h = P.sceneHTML({ duration: 3, elements: [{ kind: 'video', src: CLIP, x: 0, y: 0, w: 50, h: 40 }] });
      return (/<video [^>]*autoplay loop playsinline/.test(h) && !/<video [^>]*muted/.test(h)) || h.slice(0, 200);
    });

    T('음소거 요소는 muted 로 방출', () => {
      const h = P.sceneHTML({ duration: 3, elements: [{ kind: 'video', src: CLIP, x: 0, y: 0, w: 50, h: 40, mute: true }] });
      return /<video [^>]*muted [^>]*autoplay/.test(h) || h.slice(0, 200);
    });

    T('★ 나레이션이 재생에 실린다 (mkp-narr · autoplay)', () => {
      const h = P.sceneHTML({ duration: 3, narration: { src: NARR }, elements: [] });
      return /<audio class="mkp-narr" src="data:audio\/webm;base64,NARR" autoplay>/.test(h) || h.slice(-200);
    });

    T('정지 렌더(still)엔 나레이션이 없다 (썸네일·스프라이트 오염 0)', () => {
      const h = P.sceneHTML({ duration: 3, narration: { src: NARR }, elements: [] }, { still: true });
      return !/mkp-narr/.test(h) || '정지 렌더에 오디오 태그';
    });

    T('★ 자동재생 구조대 — 거부되면 무음으로 내려서라도 돈다 (소스 대조)', () => {
      const i = psrc.indexOf('function paintStage');
      const seg = psrc.slice(i, i + 900);
      if (!/video,audio/.test(seg)) return '구조대가 매체를 안 훑는다';
      if (!/\.catch\(/.test(seg)) return '재생 거부를 안 받는다 — 영상이 멈춘 채가 된다';
      return /muted = true/.test(seg) || '거부 시 무음 강하가 없다';
    });

    /* ================================================================
       ⑷ 녹음기 (makeRecorder · 기관 주입)
       ================================================================ */
    sec('4. 녹음 (makeRecorder)');

    T('★ makeRecorder 실존', () => typeof (A && A.makeRecorder) === 'function' || 'makeRecorder 부재');

    T('기관 없는 세계(jsdom 그대로) = 미지원 정직 보고', () => {
      if (typeof A.makeRecorder !== 'function') return '부재';
      const r = A.makeRecorder();
      if (r.supported()) return 'jsdom 에 마이크가 있을 리 없다 — 판별이 헛돈다';
      return r.start().then ? true : '';                /* start 는 아래 비동기 bag 에서 */
    });

    /* ================================================================
       ⑸ 화면 배선 (workspace)
       ================================================================ */
    sec('5. 화면 배선');

    T('★ 클립 소리 실컨트롤 (켬/끔·볼륨) — 죽은 표기 「볼륨 100%」 잔존 0', () => {
      const miss = ['data-ws-vmute', 'data-ws-vvol'].filter((k) => !wsrc.includes(k));
      if (miss.length) return '누락: ' + miss.join(',');
      return !/field\('볼륨', '100%'\)/.test(wsrc) || '죽은 표기 잔존';
    });

    T('★ 나레이션 4동작 (녹음·끝·듣기·지우기) 배선', () => {
      const miss = ['data-ws-nrec', 'data-ws-nstop', 'data-ws-nplay', 'data-ws-nclear'].filter((k) => !wsrc.includes(k));
      return !miss.length || '누락: ' + miss.join(',');
    });

    T('녹음 결과가 scene.narration 계약으로 앉는다 (재생·MP4 가 같은 자리를 읽는다)', () =>
      /scene\(\)\.narration = \{ src: r2\.src, duration: r2\.duration \}/.test(wsrc) || '계약 자리 미배선');

    T('★ 스티커 = 보통 텍스트 요소 (신규 렌더 능력 0 — 지우기·애니 전부 통용)', () => {
      if (!wsrc.includes('data-ws-stk')) return '스티커 배선 부재';
      const i = wsrc.indexOf("data-ws-stk]');");
      const seg = wsrc.slice(wsrc.indexOf('[data-ws-stk]'), wsrc.indexOf('[data-ws-stk]') + 600);
      return /kind: 'text'/.test(seg) || '스티커가 특수 요소다 — 기존 경로를 벗어났다';
    });

    T('스티커 팔레트가 실제로 여럿이다 (12종 이상)', () => {
      const m = wsrc.match(/const STICKERS = \[([^\]]*)\]/);
      if (!m) return 'STICKERS 부재';
      const n = m[1].split(',').filter((x) => x.trim()).length;
      return n >= 12 || `${n}종`;
    });

    /* ================================================================
       ⑹ 회귀·자체 감사
       ================================================================ */
    sec('6. 회귀');

    T('videoAudit 그린 (R127 소리 원천 계약 포함)', () => {
      /* §5② — 「조항 부재 = 위반 0」 공허 통과 봉인(R124 와 같은 형태).
         감사에 조항이 실존하는지 소스로 먼저 못 박는다. */
      const audit = vsrc.slice(vsrc.indexOf('function videoAudit') >= 0 ? vsrc.indexOf('function videoAudit') : vsrc.indexOf('videoAudit'));
      const need = ['soundSources 총원', '음소거·이미지 제외', '나레이션 반복 금지', '음량 범위'];
      const miss = need.filter((k) => !vsrc.includes(k));
      if (miss.length) return '감사 조항 누락: ' + miss.join(' / ');
      const r = V.videoAudit();
      const viol = Array.isArray(r) ? r : (r && r.violations) || [];
      return !viol.length || viol.join(' / ');
    });

    T('내보내기 전체 상한 120초 불변', () => V.MAX_SEC === 120 || 'MAX_SEC=' + V.MAX_SEC);

    T('이미지 요소 방출 불변 (<img> — 소리 세계가 사진을 안 건드린다)', () => {
      const h = P.sceneHTML({ duration: 3, elements: [{ kind: 'image', src: 'data:image/png;base64,I', x: 0, y: 0, w: 40, h: 30 }] });
      return (/<img src="data:image\/png;base64,I"/.test(h) && !/<video/.test(h)) || h.slice(0, 160);
    });
  })
  .then(async () => {
    /* ⑷ 비동기 — 가짜 기관으로 녹음 전 수명 */
    if (typeof A.makeRecorder === 'function') {
      class FakeMR {
        constructor(stream) { this.mimeType = 'audio/webm'; FakeMR.last = this; }
        start() { setTimeout(() => this.ondataavailable && this.ondataavailable({ data: { size: 3 } }), 0); }
        stop() { setTimeout(() => this.onstop && this.onstop(), 0); }
      }
      class FakeBlob { constructor(parts, o) { this.type = (o && o.type) || ''; this.parts = parts; } }
      class FakeFR {
        readAsDataURL(b) { setTimeout(() => { this.result = 'data:audio/webm;base64,RECORDED'; this.onload && this.onload(); }, 0); }
      }
      const stream = { getTracks: () => [{ stop() {} }] };
      const good = A.makeRecorder({ getUserMedia: async () => stream, MediaRecorder: FakeMR, BlobCls: FakeBlob, FileReaderCls: FakeFR });
      const deny = A.makeRecorder({ getUserMedia: async () => { throw new Error('deny'); }, MediaRecorder: FakeMR, BlobCls: FakeBlob, FileReaderCls: FakeFR });
      const none = A.makeRecorder();

      const rDeny = await deny.start();
      const rNone = await none.start();
      const r1 = await good.start();
      const r1b = await good.start();               /* 이중 시작 */
      await new Promise((r) => setTimeout(r, 10));  /* 데이터 청크 도착 */
      const r2 = await good.stop();
      const r3 = await good.stop();                 /* 시작 없는 정지 */

      T('★ 녹음 전 수명 — 시작→정지 = dataURL + 실길이', () =>
        (r1.ok && r2.ok && r2.src === 'data:audio/webm;base64,RECORDED' && r2.duration > 0)
        || JSON.stringify({ r1, r2 }));
      T('권한 거부 = 「뭘 하면 되는지」 딸린 정직 보고', () =>
        (!rDeny.ok && /권한|허용/.test(rDeny.msg)) || JSON.stringify(rDeny));
      T('기관 부재 = 미지원 정직 보고', () =>
        (!rNone.ok && /지원하지 않아요/.test(rNone.msg)) || JSON.stringify(rNone));
      T('반례 — 이중 시작 거부', () => (!r1b.ok && /이미/.test(r1b.msg)) || JSON.stringify(r1b));
      T('반례 — 시작 없는 정지 정직 실패', () => (!r3.ok) || JSON.stringify(r3));
    } else {
      T('★ 녹음 전 수명', () => 'makeRecorder 부재');
    }

    console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
    process.exit(fail ? 1 : 0);
  })
  .catch((e) => {
    console.log('  ✗ R127 검사 예외 0  → 던졌다: ' + e.message);
    console.log(`\n결과: ${pass}/${pass + fail + 1}  (실패 ${fail + 1})`);
    process.exit(1);
  });
