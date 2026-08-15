/* ============================================================
   test-round123.mjs — R123 폴백 사다리 · 결과 전달지의 하부 검사
   ------------------------------------------------------------
   R123 이 메운 구멍 둘:

   ① **내보내기에 폴백이 아예 없었다.** R122 가 「이 기기 인코더가 우리 설정을
      받나」를 물을 수 있게 만들었지만, **못 받으면 할 수 있는 게 없었다** —
      configure 가 예외를 던지거나 error 콜백으로 프레임 한복판에서 죽는 게
      전부다. 준호 기기 하나가 통과해도 교실의 서른 대가 통과한다는 뜻이
      아니다(n=1). 그래서 실기기 결과를 기다리지 않고 사다리를 세웠다.

   ② **결과를 기기 밖으로 옮길 길이 없었다.** 스크린샷은 detail 을 자르는데,
      불합격의 정보는 대부분 거기 있다. 검사가 실패를 낼 수 있게 된 R122
      다음 라운드에서야 이 버튼은 값이 산다.

   이 하니스의 성격 — R120~R122 계열과 같다. **브라우저 탐침은 jsdom 에서 못
   돌리므로, 탐침·제품이 판정 근거로 쓰는 것을 전량 검사한다.** 사다리는
   가짜 VideoEncoder 를 심어 **실제로 걸어 내려가게 한다**(선언 확인이 아니라).

   ★ 반례를 반드시 둔다: 전부 거부인데 단이 나오면 사다리는 검사가 아니라 장식이다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R123_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/selfcheck', pretendToBeVisual: true });
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
const E = w.MK_SELFCHECK;
const vsrc = read('data/video.js');
const ssrc = read('data/selfcheck.js');
const scrsrc = read('screens/selfcheck.js');

/* ================================================================
   ⑴ 사다리 실존 · 형태 · 정본 단일성
   ================================================================ */
sec('1. 사다리 (VIDEO_LADDER)');

T('MK_VIDEO.VIDEO_LADDER 실존 · 깊이까지 동결', () =>
  (V && Array.isArray(V.VIDEO_LADDER) && Object.isFrozen(V.VIDEO_LADDER)
    && V.VIDEO_LADDER.every((r) => Object.isFrozen(r))) || '사다리 부재이거나 안 얼었다');

T('폴백이 실제로 있다 (단 2개 이상)', () =>
  (V.VIDEO_LADDER.length >= 2) || `단 ${V.VIDEO_LADDER.length}개 — 폴백이 아니다`);

T('★ 1단 = 정본 (코덱을 바꾸면 사다리 머리도 같이 움직인다)', () => {
  const S = V.EXPORT_SPEC, r = V.VIDEO_LADDER[0];
  return (r.codec === S.vcodec && r.targetMin === S.targetMin && r.bitrate === S.bitrate)
    || JSON.stringify(r);
});

T('사다리는 내려가기만 한다 (위로 오르면 폴백이 아니다)', () => {
  const L = V.VIDEO_LADDER;
  for (let i = 1; i < L.length; i++) if (L[i].targetMin > L[i - 1].targetMin) return `${i}단이 위로 올라감`;
  return true;
});

T('같은 코덱·같은 치수 단이 중복되지 않는다 (헛단 금지)', () => {
  const k = V.VIDEO_LADDER.map((r) => r.codec + '@' + r.targetMin);
  return new Set(k).size === k.length || '중복: ' + k.join(',');
});

T('모든 단이 avc1.PPCCLL 형태 · 비트레이트·이름 보유', () => {
  const bad = V.VIDEO_LADDER.filter((r) => !/^avc1\.[0-9A-Fa-f]{6}$/.test(r.codec) || !(r.bitrate > 0) || !r.label);
  return !bad.length || JSON.stringify(bad);
});

T('낮은 단은 비트레이트도 낮다 (720p 에 1080p 비트레이트를 붓지 않는다)', () => {
  const L = V.VIDEO_LADDER;
  const lo = L.filter((r) => r.targetMin < L[0].targetMin);
  return (!lo.length || lo.every((r) => r.bitrate < L[0].bitrate)) || '낮은 단 비트레이트 미조정';
});

T('★ 사다리 코덱이 selfcheck.js 에 하나도 없다 (탐침은 정본을 읽는다 · §5-③)', () => {
  const leaked = V.VIDEO_LADDER.map((r) => r.codec).filter((c) => ssrc.includes(c));
  return !leaked.length || '탐침이 직접 적음: ' + leaked.join(' / ');
});

T('★ 사다리 코덱 리터럴이 video.js 에 각 1회뿐 (주석 포함 · 중복 서술 금지)', () => {
  const bad = [...new Set(V.VIDEO_LADDER.map((r) => r.codec))]
    .map((c) => [c, vsrc.split(c).length - 1]).filter(([, n]) => n !== 1);
  return !bad.length || bad.map(([c, n]) => `${c}×${n}`).join(', ');
});

/* ================================================================
   ⑵ outSize 확장 — 하위 호환이 깨지면 R122 질의가 뜻을 잃는다
   ================================================================ */
sec('2. outSize · rungSize');

T('outSize(w,h) 인자 2개 = 종전과 동일 (R122 호출부·하니스 무변)', () => {
  const o = V.outSize(1280, 720);
  return (o.W === 1920 && o.H === 1080 && Math.abs(o.scale - 1.5) < 1e-9) || JSON.stringify(o);
});

T('outSize 3번째 인자로 낮은 단 치수', () => {
  const o = V.outSize(1280, 720, 720);
  return (o.W === 1280 && o.H === 720 && Math.abs(o.scale - 1) < 1e-9) || JSON.stringify(o);
});

T('낮은 단에서도 치수는 짝수 (H.264 매크로블록 계약)', () => {
  const bad = [[1281, 721], [999, 1333], [1237, 907]].map((d) => V.outSize(d[0], d[1], 720))
    .filter((o) => o.W % 2 || o.H % 2);
  return !bad.length || JSON.stringify(bad);
});

T('rungSize(i,w,h) 가 그 단의 실치수를 돌려준다', () => {
  const L = V.VIDEO_LADDER;
  const bad = L.map((r, i) => [i, V.rungSize(i, 1280, 720)])
    .filter(([i, s]) => !s || s.index !== i || s.rung !== L[i] || s.H !== L[i].targetMin);
  return !bad.length || JSON.stringify(bad.map(([i]) => i));
});

T('없는 단은 null (범위 밖을 조용히 지어내지 않는다)', () =>
  (V.rungSize(99, 1280, 720) === null && V.rungSize(-1, 1280, 720) === null) || '범위 밖이 null 이 아님');

/* ================================================================
   ⑶ ★ pickVideoRung — 가짜 인코더로 사다리를 실제로 걸어 내려간다
   ================================================================ */
/* accept: 어느 코덱을 받아줄지 결정하는 함수. 질의 기록을 남겨 「무엇을 물었나」까지 본다 */
const encWin = (accept, opts) => {
  const o = opts || {};
  const asked = [];
  const win = { asked };
  if (!o.noEncoder) {
    win.VideoEncoder = o.noQuery ? function () {} : {
      isConfigSupported: async (cfg) => {
        asked.push(cfg);
        if (o.throwOn && o.throwOn(cfg)) throw new Error('질의 폭발');
        return { supported: !!accept(cfg), config: cfg };
      },
    };
  }
  return win;
};
const L = V.VIDEO_LADDER || [];
const P = {};
/* §5-① — 하니스는 **부재도 결과로 환원**해야 한다. 역검증(원본 복귀)에서
   pickVideoRung 이 없으면 Promise.all 배열을 짓다가 동기 예외로 프로세스가
   죽어 수치가 안 나온다(R122 가 실제로 밟은 자리 — 여기서 그대로 재현됐다).
   검사기가 죽으면 역검증이 성립하지 않는다. */
const safe = (k, bag, fn) => {
  try { return Promise.resolve(fn()).then((r) => { bag[k] = r; }).catch((e) => { bag[k] = { _err: (e && e.message) || 'reject' }; }); }
  catch (e) { bag[k] = { _err: (e && e.message) || 'throw' }; return Promise.resolve(); }
};
const run = (k, win) => safe(k, P, () => {
  if (typeof V.pickVideoRung !== 'function') throw new Error('pickVideoRung 부재');
  return Promise.resolve(V.pickVideoRung(win, 1280, 720)).then((r) => ({ r, asked: win.asked }));
});
const at = (k) => P[k] || { _err: '결과 없음' };
const rung = (k) => (at(k).r) || { _absent: at(k)._err || '단 없음' };

/* ================================================================
   ⑷ pickAudio
   ================================================================ */
const A = {};
const audWin = (mode) => {
  if (mode === 'none') return {};
  if (mode === 'noquery') return { AudioEncoder: function () {} };
  if (mode === 'throw') return { AudioEncoder: { isConfigSupported: async () => { throw new Error('폭발'); } } };
  return { AudioEncoder: { isConfigSupported: async (cfg) => ({ supported: mode === 'yes', config: cfg }) } };
};
const runA = (k, mode) => safe(k, A, () => {
  if (typeof V.pickAudio !== 'function') throw new Error('pickAudio 부재');
  return V.pickAudio(audWin(mode));
});
const aud = (k) => A[k] || { _err: '결과 없음' };

/* ================================================================
   ⑸ exportMP4 배선 — 소스 계약
   ================================================================ */
sec('5. exportMP4 배선');

T('★ 사다리를 물어보고 나서 인코딩한다 (맹목 configure 종료)', () =>
  /await pickVideoRung\(window,/.test(vsrc) || 'exportMP4 가 사다리를 안 부른다');

T('★ configure 가 고른 단을 쓴다 (정본 코덱 하드코딩 아님)', () =>
  (/encoder\.configure\(\{ codec: pick\.rung\.codec/.test(vsrc)
    && !/encoder\.configure\(\{ codec: EXPORT_SPEC\.vcodec/.test(vsrc))
  || 'configure 가 고른 단을 안 읽는다');

T('출력 치수도 고른 단에서 나온다 (질의 치수 = configure 치수)', () =>
  /outSize\(dl0\.width, dl0\.height, pick\.rung\.targetMin\)/.test(vsrc)
  || '치수가 단과 어긋난다 — 질의가 뜻을 잃는다');

T('★ 한 단도 못 받으면 정직하게 멈춘다 (프레임 한복판에서 죽지 않는다)', () =>
  (/if \(!pick\.rung\)/.test(vsrc) && /return \{ ok: false/.test(vsrc.slice(vsrc.indexOf('if (!pick.rung)'))))
  || '전단 거부 시 되돌아갈 길이 없다');

T('소리도 물어보고 나서 얹는다 (typeof 강행 종료)', () =>
  (/await pickAudio\(window\)/.test(vsrc) && !/typeof AudioEncoder !== 'undefined'/.test(vsrc))
  || '소리가 여전히 typeof 만 보고 강행된다');

T('소리 configure 가 물어본 설정 그대로', () =>
  /aenc\.configure\(apick\.cfg\)/.test(vsrc) || '소리 설정이 질의와 갈라진다');

T('내려간 사실이 결과에 실린다 (조용히 화질을 낮추지 않는다)', () =>
  (/rung: pick\.rung\.label/.test(vsrc) && /lowered/.test(vsrc)) || '내려간 사실이 안 남는다');

/* ================================================================
   ⑹ 탐침이 제품과 같은 함수를 부른다
   ================================================================ */
sec('6. 탐침 = 제품 (같은 함수)');

T('★ 탐침이 V.pickVideoRung 을 부른다 (자체 훑기 금지)', () =>
  /V\.pickVideoRung\(win,/.test(ssrc) || '탐침이 따로 훑는다 — 제품과 어긋날 수 있다');

T('★ 탐침이 V.pickAudio 를 부른다', () =>
  /V\.pickAudio\(win\)/.test(ssrc) || '탐침이 소리를 따로 묻는다');

T('★ 탐침이 isConfigSupported 를 직접 부르지 않는다', () =>
  !/\.isConfigSupported\(/.test(ssrc) || '탐침이 직접 질의한다 — 사다리를 우회한다');

T('탐침이 R123 이전 배포를 정직하게 알아본다', () =>
  /pickVideoRung !== 'function'/.test(ssrc) || '옛 배포에서 조용히 오판한다');

/* 가짜 인코딩 무대 — 어떤 코덱으로 configure 했는지 기록한다 */
function fakeEncWin() {
  const cfgs = [];
  const u = new Uint8Array(16); u.set([0, 0, 0, 16], 0); u.set([0x66, 0x74, 0x79, 0x70], 4);
  return {
    cfgs,
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillRect() {}, set fillStyle(_) {} }) }) },
    VideoFrame: function () { this.close = () => {}; },
    VideoEncoder: function () {
      this.state = 'configured';
      this.configure = (c) => cfgs.push(c);
      this.encode = () => {};
      this.flush = async () => {};
      this.close = () => { this.state = 'closed'; };
    },
    Mp4Muxer: {
      ArrayBufferTarget: function () { this.buffer = null; },
      Muxer: function (m) { this.target = m.target; this.addVideoChunk = () => {}; this.finalize = () => { this.target.buffer = u.buffer; }; },
    },
  };
}
const ENC = {};

/* ================================================================
   ⑺ reportText — 결과를 기기 밖으로
   ================================================================ */
sec('7. 결과 보내기 (reportText)');

const sample = [
  { id: 'enc-support', state: 'fail', msg: '못 받아요', detail: '거절당한 단: 1080p 고화질 / 1080p 표준(Main)' },
  { id: 'muxer-reach', state: 'pass', msg: '받았어요', detail: '' },
  { id: 'enc-bytes', state: 'skip', msg: '건너뜀', detail: '' },
];
let rep = null, repObj = null;
try { rep = E.reportText(w, sample); repObj = JSON.parse(rep); } catch (e) { repObj = { _err: e.message }; }

T('보고서가 JSON 으로 파싱된다', () => (repObj && !repObj._err) || String(repObj && repObj._err));

T('표식·검사 수·상태가 그대로 실린다', () =>
  (repObj.kind === 'kmaker-selfcheck' && repObj.checks.length === 3
    && repObj.checks.map((c) => c.state).join(',') === 'fail,pass,skip') || JSON.stringify(repObj.checks));

T('★ detail 이 안 잘린다 (스크린샷이 자르던 바로 그 정보)', () =>
  repObj.checks[0].detail === sample[0].detail || '잘림: ' + repObj.checks[0].detail);

T('라운드 귀속이 CHECKS 에서 붙는다 (손글씨 아님)', () =>
  (repObj.checks[0].round === 'R38' && repObj.checks[2].round === 'R38') || JSON.stringify(repObj.checks.map((c) => c.round)));

T('판정 집계가 동행한다 (skip 은 합격 아님)', () =>
  (repObj.verdict.fail === 1 && repObj.verdict.skip === 1 && repObj.verdict.ok === false) || JSON.stringify(repObj.verdict));

T('★ 사다리·정본이 실려 온다 (무엇을 물었는지가 결과에 붙는다)', () =>
  (repObj.ladder.length === L.length && repObj.spec.vcodec === V.EXPORT_SPEC.vcodec
    && repObj.spec.muxerUrl === V.EXPORT_SPEC.muxerUrl) || JSON.stringify(repObj.spec));

T('★ 버스터가 실려 온다 (「배포 도달 전이었을 가능성」을 끝낸다)', () => {
  const wantV = /[?&]v=([^&"']+)/.exec(read('index.html'));
  const got = E.busterOf({ document: { querySelectorAll: () => [{ getAttribute: () => 'data/x.js?v=20260815b' }] } });
  return (got === '20260815b' && (!wantV || typeof repObj.buster === 'string')) || `busterOf=${got}`;
});

T('버스터를 못 찾아도 죽지 않는다 (빈 문자열)', () =>
  E.busterOf({ document: { querySelectorAll: () => [] } }) === '' || '부재가 예외로 샌다');

T('기기 정보가 실린다 (어느 기기에서 난 실패인지)', () =>
  (repObj.env && typeof repObj.env.ua === 'string' && typeof repObj.env.dpr === 'number'
    && typeof repObj.env.webcodecs === 'boolean') || JSON.stringify(repObj.env));

T('결과 0건도 안 죽는다', () => {
  const o = JSON.parse(E.reportText(w, []));
  return (o.checks.length === 0 && o.verdict.ok === false) || JSON.stringify(o.verdict);
});

T('★ 코덱·주소를 스스로 적지 않는다 (정본에서 읽는다 · §5-③)', () => {
  const S = V.EXPORT_SPEC;
  const leaked = [S.vcodec, S.acodec, S.muxerUrl].filter((x) => ssrc.includes(x));
  return !leaked.length || '탐침이 직접 적음: ' + leaked.join(' / ');
});

/* ================================================================
   ⑻ 화면 — 무오염 · 실출현
   ================================================================ */
sec('8. 화면');

const SC = w.MK_SCREENS.selfcheck;
if (w.PG && w.PG.state) w.PG.state.selfcheck = { phase: 'idle', results: [], skipped: '', ran: 0 };
const emptyOut = SC.render();

T('★ 결과가 없으면 보고 블록이 안 뜬다 (검사 전 화면 오염 0)', () =>
  (!emptyOut.includes('data-sc-copy') && !emptyOut.includes('sc-json'))
  || '안 돌린 화면에 빈 보고서가 뜬다');

if (w.PG && w.PG.state) w.PG.state.selfcheck = { phase: 'done', results: sample, skipped: '', ran: 1 };
const doneOut = SC.render();

T('★ 결과가 있으면 복사 버튼과 본문이 뜬다', () =>
  (doneOut.includes('data-sc-copy') && doneOut.includes('data-sc-json') && doneOut.includes('결과 복사'))
  || '보고 블록 미출현');

T('본문에 실제 보고서가 들어 있다 (빈 상자가 아니다)', () =>
  (doneOut.includes('kmaker-selfcheck') && doneOut.includes('enc-support')) || '본문이 비었다');

T('본문이 손으로도 고를 수 있다 (자동 복사가 막히는 폰의 마지막 길)', () =>
  (/<textarea[^>]*data-sc-json/.test(doneOut) && /readonly/.test(doneOut))
  || '읽기 전용 본문이 없다 — 복사 실패 시 막다른 길');

T('복사가 세 갈래다 (clipboard → execCommand → 손 복사 안내)', () =>
  (/navigator\.clipboard/.test(scrsrc) && /execCommand\('copy'\)/.test(scrsrc) && /길게 눌러/.test(scrsrc))
  || '실패하는 길이 하나뿐이면 그게 막다른 길이다');

T('mount 가 결과 있는 화면에서도 예외 0', () => {
  const root = w.document.createElement('div');
  root.innerHTML = doneOut;
  SC.mount(root);
  return true;
});

T('CSS .sc-json 실존 (본문이 안 보이면 손 복사도 못 한다)', () =>
  read('playground.css').includes('.sc-report .sc-json') || 'CSS 선언 부재');

/* ================================================================
   ⑼ 회귀 · 감사
   ================================================================ */
sec('9. 회귀 · 감사');

T('videoAudit() 무위반 (사다리 차단망 포함)', () => {
  const a = V.videoAudit();
  return a.ok || '위반: ' + a.violations.join(' / ');
});

T('MK_SELFCHECK.audit() 무위반 (보고서 차단망 포함)', () => {
  const a = E.audit();
  return a.ok || '위반: ' + a.violations.join(' / ');
});

T('검사 명세는 15건 그대로 (R123 은 검사를 늘리지 않았다)', () =>
  E.CHECKS.length === 15 || `${E.CHECKS.length}건`);

T('정본 EXPORT_SPEC 은 여전히 동결', () => Object.isFrozen(V.EXPORT_SPEC) || '녹았다');

/* ================================================================
   비동기 — 사다리 실주행 · 소리 · 인코딩 단 전달 · jsdom 게이트
   ================================================================ */
const finish = () => {
  console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
  process.exit(fail ? 1 : 0);
};

const encRun = (k, rg) => {
  const win = fakeEncWin();
  ENC[k] = { win, r: { ok: false, why: '결과 없음' } };
  try {
    if (typeof E.encodeTwoFrames !== 'function') { ENC[k].r = { ok: false, why: 'encodeTwoFrames 부재' }; return Promise.resolve(); }
    return Promise.resolve(E.encodeTwoFrames(win, V.EXPORT_SPEC, 1280, 720, rg))
      .then((r) => { ENC[k].r = r; })
      .catch((e) => { ENC[k].r = { ok: false, why: '예외: ' + (e && e.message) }; });
  } catch (e) { ENC[k].r = { ok: false, why: '예외: ' + (e && e.message) }; return Promise.resolve(); }
};

Promise.all([
  run('all', encWin(() => true)),
  run('no1', encWin((c) => c.codec !== L[0].codec)),
  run('only720', encWin((c) => c.height <= 720)),
  run('none', encWin(() => false)),
  run('noquery', encWin(() => true, { noQuery: true })),
  run('noenc', encWin(() => true, { noEncoder: true })),
  run('boom1', encWin((c) => c.height <= 720, { throwOn: (c) => c.codec === L[0].codec })),
  runA('yes', 'yes'), runA('no', 'no'), runA('none', 'none'),
  runA('noquery', 'noquery'), runA('throw', 'throw'),
  encRun('default', undefined),
  encRun('rung', { codec: 'avc1.42001F', bitrate: 4000000 }),
]).then(() => {
  sec('3. 단 고르기 (실주행 결과)');

  T('전단 지원 → 1단 그대로 (내릴 이유가 없으면 안 내린다)', () =>
    (rung('all').index === 0 && rung('all').queried === true && rung('all').tried.length === 0) || JSON.stringify(rung('all')));

  T('★ 질의는 그 단의 코덱·치수·비트레이트로 나간다 (묻는 것 = 쓰는 것)', () => {
    const a = (at('all').asked || [])[0] || {};
    return (a.codec === L[0].codec && a.width === 1920 && a.height === 1080
      && a.bitrate === L[0].bitrate && a.framerate === V.EXPORT_SPEC.fps) || JSON.stringify(a);
  });

  T('★ 1단 거부 → 2단으로 내려간다', () =>
    (rung('no1').index === 1 && rung('no1').rung === L[1] && rung('no1').tried.length === 1) || JSON.stringify(rung('no1')));

  T('★ 1080p 전부 거부 → 720p 단으로 내려가고 치수가 실제로 720', () => {
    const r = rung('only720');
    return (r.rung && r.rung.targetMin === 720 && r.H === 720 && r.W === 1280) || JSON.stringify({ i: r.index, W: r.W, H: r.H });
  });

  T('내려간 자리는 거절당한 윗단을 전부 기록한다 (왜 내려갔는지가 남는다)', () =>
    (rung('only720').tried && rung('only720').tried.length === rung('only720').index && rung('only720').tried.length > 0)
    || JSON.stringify(rung('only720')));

  T('★ 반례 — 전부 거부면 단을 지어내지 않는다', () =>
    (rung('none').rung === null && rung('none').index === -1 && typeof rung('none').why === 'string' && rung('none').why.length > 0)
    || JSON.stringify(rung('none')));

  T('전부 거부해도 사다리 전 단을 다 물어본다 (중간에 포기 안 함)', () =>
    (L.length > 0 && (at('none').asked || []).length === L.length && (rung('none').tried || []).length === L.length)
    || `${(at('none').asked || []).length}/${L.length}`);

  T('isConfigSupported 없는 브라우저 → 1단 맹목 진행 (종전 동작 회귀 0)', () =>
    (rung('noquery').index === 0 && rung('noquery').queried === false && rung('noquery').rung === L[0])
    || JSON.stringify(rung('noquery')));

  T('VideoEncoder 자체가 없어도 던지지 않는다 (결과로 환원)', () =>
    (rung('noenc').index === 0 && rung('noenc').queried === false) || JSON.stringify(rung('noenc')));

  T('★ 질의가 예외로 죽어도 다음 단으로 간다 (한 단의 사고가 사다리를 끊지 않는다)', () => {
    const r = rung('boom1');
    return (r.rung && r.rung.targetMin === 720 && (r.tried || []).some((x) => /예외/.test(x)))
      || JSON.stringify(r);
  });

  sec('4. 소리 고르기 (실주행 결과)');

  T('지원 → 얹는다 · 설정은 정본값', () =>
    (aud('yes').ok && aud('yes').queried === true && aud('yes').cfg && aud('yes').cfg.codec === V.EXPORT_SPEC.acodec
      && aud('yes').cfg.sampleRate === V.EXPORT_SPEC.audioSampleRate) || JSON.stringify(aud('yes')));

  T('★ 미지원 → 강행하지 않고 무음으로 내려간다 · 이유를 말한다', () =>
    (aud('no').ok === false && typeof aud('no').why === 'string' && aud('no').why.length > 0) || JSON.stringify(aud('no')));

  T('AudioEncoder 부재 → 종전 무음 안내 그대로', () =>
    (aud('none').ok === false && /지원하지 않아/.test(aud('none').why || '')) || JSON.stringify(aud('none')));

  T('질의 없는 브라우저 → 종전대로 진행 (회귀 0)', () =>
    (aud('noquery').ok === true && aud('noquery').queried === false) || JSON.stringify(aud('noquery')));

  T('질의가 예외로 죽어도 던지지 않고 무음으로', () =>
    (aud('throw').ok === false && !aud('throw')._err) || JSON.stringify(aud('throw')));

  sec('6. 탐침 = 제품 (인코딩 단 전달)');

  T('encodeTwoFrames 4인자 → 정본 1단으로 configure (R122 계약 보존)', () => {
    const c = ENC.default.win.cfgs[0] || {};
    return (ENC.default.r.ok && c.codec === V.EXPORT_SPEC.vcodec && c.bitrate === V.EXPORT_SPEC.bitrate)
      || JSON.stringify({ r: ENC.default.r, c });
  });

  T('★ encodeTwoFrames 5인자 → 그 단으로 configure (탐침이 실제 쓰일 단을 밟는다)', () => {
    const c = ENC.rung.win.cfgs[0] || {};
    return (ENC.rung.r.ok && c.codec === 'avc1.42001F' && c.bitrate === 4000000)
      || JSON.stringify({ r: ENC.rung.r, c });
  });

  return E.run(w);
}).then((res) => {
  sec('10. jsdom 안전 계약');
  T('run() 이 jsdom 에서 탐침 0 · skipped 사유 반환 (게이트 무손상)', () =>
    (Array.isArray(res.results) && res.results.length === 0 && typeof res.skipped === 'string' && res.skipped.length > 0)
    || `게이트 통과됨: ${JSON.stringify(res).slice(0, 160)}`);
  T('CDN 스크립트 태그 잔존 0', () =>
    [...w.document.querySelectorAll('script')].filter((s) => {
      const src = s.src || '';
      /* R124 — 주소가 둘이 되었다. 'jsdelivr' 만 재면 자체 호스팅으로 옮긴 뒤
         이 검사가 저절로 통과하는 헛검사가 된다(§5②). 두 주소를 다 잰다. */
      return src.includes(V.EXPORT_SPEC.muxerUrl) || src.includes(V.EXPORT_SPEC.muxerFallbackUrl);
    }).length === 0
    || 'jsdom 에서 CDN 을 탔다');
  T('인코딩 캔버스 잔존 0', () =>
    w.document.querySelectorAll('canvas').length === 0 || '캔버스 잔존');
  finish();
}).catch((e) => {
  T('R123 검사 예외 0', () => '던졌다: ' + e.message);
  finish();
});
