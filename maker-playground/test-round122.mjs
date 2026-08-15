/* ============================================================
   test-round122.mjs — R122 내보내기 실브라우저 검증의 하부 검사
   ------------------------------------------------------------
   R122 가 메운 구멍: **내보내기가 R38 부터 84라운드 동안 한 번도 실브라우저
   에서 안 밟혔다.** 63개 엔진 스위트가 검증한 건 전부 「계획(plan)」 계층까지고,
   실제로 바이트가 나오는지는 아무도 확인한 적이 없다. 학생이 사진 고르고
   영상 만들고 **마지막에 누르는 버튼**이 이 제품의 종착점인데, 폰에서 깨져도
   알 방법이 없었다.

   R120·R121 과 같은 성격의 하니스다 — **브라우저 탐침은 jsdom 에서 돌릴 수
   없으므로, 탐침이 판정 근거로 쓰는 것을 전량 검사한다.**

   ① ★ 정본 단일성 (이 파일의 존재 이유)
      탐침이 코덱 문자열·CDN 주소·출력 치수를 **자기 파일에 다시 적으면**,
      video.js 가 코덱을 바꿔도 탐침은 옛 값을 계속 물어본다. 초록불이
      「지금 이 코드가 된다」를 뜻하지 않게 되고, 그건 검사가 아니라 착시다.
      그래서 소스를 문자열로 읽어 **EXPORT_SPEC 밖의 중복 리터럴이 0** 임을
      못 박는다. R117 「정본 하나를 양세계가 함께 읽는다」와 같은 결.

   ② 출력 치수 규칙 — 탐침이 묻는 치수 = 내보내기가 쓰는 치수
      isConfigSupported 를 1920×1080 으로 물어놓고 실제로는 다른 치수로
      configure 하면 질의가 아무 뜻이 없다. 같은 outSize() 를 쓰는지 본다.

   ③ 반례 — 검사기가 무엇이든 통과시키지 않는가
      ftyp 판정·빈 버퍼 판정이 실제로 걸러내는지 가짜 먹서로 밟는다.

   ④ 명세·화면 정직성
      R121 이 밟은 함정(하드코딩된 라운드 목록)이 R122 에서 재발하지 않는가.
      신규 4건이 실제로 화면에 그려지는지 확인한다.

   ⑤ jsdom 안전 계약 — 신규 탐침도 게이트를 안 샌다
      R11~R15 가 전 화면을 render+mount 한다. probeExport 가 게이트를 새면
      (jsdom 엔 VideoEncoder 가 없으므로) 다섯 스위트가 한꺼번에 무너진다.
      캔버스 잔존 0 도 함께 본다 — 1920×1080 캔버스가 남으면 메모리를 먹는다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R122_ROOT || path.resolve('.');
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

/* ================================================================
   ⑴ ★ 정본 단일성 — 값이 EXPORT_SPEC 말고 어디에도 안 적혀 있다
   ================================================================ */
sec('1. 정본 단일성 (EXPORT_SPEC)');

T('MK_VIDEO.EXPORT_SPEC 실존 · 동결', () =>
  (V && V.EXPORT_SPEC && Object.isFrozen(V.EXPORT_SPEC)) || '정본 부재이거나 안 얼었다');

T('정본이 내보내기 전 설정을 담는다', () => {
  const S = V.EXPORT_SPEC;
  /* R124 의도 보존 정정 — 먹서 주소가 자체/CDN 둘이 되었으므로 폴백도 정본이 진다 */
  const need = ['vcodec', 'acodec', 'muxerUrl', 'muxerFallbackUrl', 'targetMin', 'bitrate', 'fps',
    'audioSampleRate', 'audioBitrate', 'audioChannels', 'muxVideo', 'muxAudio'];
  const miss = need.filter((k) => S[k] === undefined);
  return !miss.length || '누락: ' + miss.join(',');
});

/* 리터럴이 정본 정의부 말고 다른 데 또 적혀 있으면, 거기가 바뀌어도 탐침은 모른다 */
const specBlock = (() => {
  const i = vsrc.indexOf('const EXPORT_SPEC');
  const j = vsrc.indexOf('});', i);
  return i < 0 ? '' : vsrc.slice(i, j + 3);
})();

T('★ 코덱 문자열이 video.js 안에서 정본 밖에 없다', () => {
  const c = V.EXPORT_SPEC.vcodec;
  const all = vsrc.split(c).length - 1;
  const inSpec = specBlock.split(c).length - 1;
  return (all === inSpec && inSpec === 1) || `video.js 에 ${all}회(정본 안 ${inSpec}회) — 중복 리터럴`;
});

T('★ 코덱 문자열이 selfcheck.js 에 아예 없다 (탐침은 정본을 읽는다)', () => {
  const S = V.EXPORT_SPEC;
  const leaked = [S.vcodec, S.acodec, S.muxerUrl, S.muxerFallbackUrl].filter((x) => x && ssrc.includes(x));
  return !leaked.length || '탐침이 직접 적음: ' + leaked.join(' / ');
});

/* R124 의도 보존 정정 — 종전 계약은 「CDN 주소가 정본 밖에 없다」였다.
   R124 가 자체 호스팅을 1순위로 올리면서 주소가 둘이 되었으므로, 계약을
   「주소가 **정본 안에서만** 갈린다」로 옮긴다. 재는 것은 그대로다 —
   주소가 video.js 어딘가에 또 적히면 거기가 바뀌어도 탐침은 모른다. */
T('★ 먹서 두 주소가 정본 안에서만 갈린다 (학교 방화벽 진단의 근거)', () => {
  const S = V.EXPORT_SPEC;
  const bad = [S.muxerUrl, S.muxerFallbackUrl].filter((u) => {
    const all = vsrc.split(u).length - 1;
    return !(all === 1 && specBlock.includes(u));
  });
  return !bad.length || '정본 밖에 또 적힘: ' + bad.join(' / ');
});

T('★ 자체 주소가 1순위이고 루트 절대경로다 (/maker/ 진입에서 안 빗나간다)', () => {
  const S = V.EXPORT_SPEC;
  if (/^https?:/i.test(S.muxerUrl)) return '1순위가 외부 주소 — 자체 호스팅이 아니다';
  if (S.muxerUrl.charAt(0) !== '/') return '상대경로 — /maker/ 에서 /maker/vendor/ 로 빗나간다';
  if (!/^https?:/i.test(S.muxerFallbackUrl)) return '폴백이 외부 주소가 아니다';
  return true;
});

T('★ 출력 기준값(1080)이 selfcheck.js 에 손글씨로 없다', () =>
  !/1080\s*\/\s*Math\.min|targetMin\s*[:=]\s*1080/.test(ssrc) || '탐침이 치수를 따로 계산한다');

/* ================================================================
   ⑵ 출력 치수 — 탐침이 묻는 치수 = 내보내기가 configure 하는 치수
   ================================================================ */
sec('2. 출력 치수 규칙');

T('outSize(1280,720) = 1920×1080 · scale 1.5', () => {
  const o = V.outSize(1280, 720);
  return (o.W === 1920 && o.H === 1080 && Math.abs(o.scale - 1.5) < 1e-9) || JSON.stringify(o);
});

T('세로 작품 — 짧은 변(가로)이 기준이 된다', () => {
  const o = V.outSize(1080, 1920);
  return (o.W === 1080 && Math.abs(o.scale - 1) < 1e-9) || JSON.stringify(o);
});

T('치수는 언제나 짝수 (H.264 매크로블록 계약)', () => {
  const bad = [[1281, 721], [999, 1333], [1237, 907]].map((d) => V.outSize(d[0], d[1]))
    .filter((o) => o.W % 2 || o.H % 2);
  return !bad.length || '홀수 산출: ' + JSON.stringify(bad);
});

T('★ exportMP4 가 outSize 를 쓴다 (1080 나눗셈을 따로 안 한다)', () =>
  (/const \{ scale, W, H \} = outSize\(/.test(vsrc) && !/1080 \/ Math\.min/.test(vsrc))
  || 'exportMP4 가 치수를 자체 계산한다 — 탐침 질의와 어긋날 수 있다');

T('exportMP4 가 정본 코덱으로 configure 한다', () =>
  (/codec: EXPORT_SPEC\.vcodec/.test(vsrc) && /codec: EXPORT_SPEC\.acodec/.test(vsrc))
  || 'configure 가 정본을 안 읽는다');

T('먹서도 정본 이름으로 짓는다', () =>
  /codec: EXPORT_SPEC\.muxVideo/.test(vsrc) || '먹서 코덱이 손글씨');

/* ================================================================
   ⑶ 반례 — 검사기가 무엇이든 통과시키지 않는가
   ================================================================ */
sec('3. 반례 (ftyp 판정이 실제로 거른다)');

/* 가짜 브라우저 기관을 심어 encodeTwoFrames 를 실제로 돌린다.
   jsdom 엔 VideoEncoder 가 없으므로 여기서만 만든 무대다(제품 경로 무관). */
const fakeWin = (bytes, opts) => {
  const o = opts || {};
  const chunks = [];
  return {
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => (o.noCtx ? null : { fillRect() {}, set fillStyle(_) {} }) }) },
    VideoFrame: function () { this.close = () => {}; },
    VideoEncoder: function (cfg) {
      this.state = 'configured';
      this.configure = () => { if (o.throwOnConfigure) throw new Error('configure 거부'); };
      this.encode = () => { if (o.encError) cfg.error(new Error('인코더 죽음')); else chunks.push(1); };
      this.flush = async () => {};
      this.close = () => { this.state = 'closed'; };
    },
    Mp4Muxer: {
      ArrayBufferTarget: function () { this.buffer = null; },
      Muxer: function (m) {
        this.target = m.target;
        this.addVideoChunk = () => {};
        this.finalize = () => { this.target.buffer = bytes ? bytes.buffer : null; };
      },
    },
  };
};
const mp4Head = () => {
  const u = new Uint8Array(16); u.set([0, 0, 0, 16], 0);
  u.set([0x66, 0x74, 0x79, 0x70], 4);                      /* 'ftyp' */
  return u;
};
const junkHead = () => { const u = new Uint8Array(16); u.set([0x6a, 0x75, 0x6e, 0x6b], 4); return u; };

const SPEC = V && V.EXPORT_SPEC;
const results = {};
/* 역검증(원본 복귀)에서 encodeTwoFrames 가 아예 없다. 그때 동기 예외로 죽으면
   하니스가 수치를 못 내놓는다 — 검사기는 부재도 **결과로** 환원해야 한다. */
const runCase = (k, win) => {
  const put = (r) => { results[k] = r; };
  try {
    if (!E || typeof E.encodeTwoFrames !== 'function') { put({ ok: false, why: 'encodeTwoFrames 부재' }); return Promise.resolve(); }
    return Promise.resolve(E.encodeTwoFrames(win, SPEC, 1920, 1080)).then(put)
      .catch((e) => put({ ok: false, why: '예외: ' + (e && e.message) }));
  } catch (e) { put({ ok: false, why: '예외: ' + (e && e.message) }); return Promise.resolve(); }
};
const got = (k) => results[k] || { ok: false, why: '결과 없음' };

/* ================================================================
   ⑷ 명세·화면 정직성
   ================================================================ */
sec('4. 명세 · 화면');

T('신규 4건이 CHECKS 에 있다', () => {
  const need = ['enc-support', 'muxer-reach', 'enc-bytes', 'audio-cfg'];
  const miss = need.filter((id) => !E.CHECKS.some((c) => c.id === id));
  return !miss.length || '누락: ' + miss.join(',');
});

T('검사 15건 · id 중복 0 · 항목 누락 0', () =>
  (E.CHECKS.length === 15
    && new Set(E.CHECKS.map((c) => c.id)).size === 15
    && E.CHECKS.every((c) => c.id && c.round && c.title && c.proves && c.blind))
  || `${E.CHECKS.length}건`);

T('내보내기 검사는 R38·R39 로 귀속된다 (빚이 난 자리)', () => {
  const m = Object.fromEntries(E.CHECKS.map((c) => [c.id, c.round]));
  return (m['enc-support'] === 'R38' && m['muxer-reach'] === 'R38'
    && m['enc-bytes'] === 'R38' && m['audio-cfg'] === 'R39') || JSON.stringify(m);
});

T('audit() 무위반', () => {
  const a = E.audit();
  return a.ok || '위반: ' + a.violations.join(' / ');
});

T('videoAudit() 무위반 (정본 도입 후 회귀)', () => {
  const a = V.videoAudit();
  return a.ok || '위반: ' + a.violations.join(' / ');
});

const SC = w.MK_SCREENS.selfcheck;
const out = SC.render();

T('★ 화면 표제가 CHECKS 에서 도출된다 (R121 하드코딩 함정 재발 방지)', () =>
  (out.includes('R38~R121') || out.includes('R38~R119'))
  || '표제가 신규 라운드를 못 따라간다 — 손글씨로 남았다');

T('★ 신규 4건이 실제로 화면에 그려진다', () => {
  const miss = ['이 기기 인코더가 우리 설정을 받나', 'MP4 모듈이 이 망에서 닿나',
    '진짜 MP4 바이트가 나온다', '소리 트랙을 얹을 수 있나'].filter((t) => !out.includes(t));
  return !miss.length || '안 그려짐: ' + miss.join(' / ');
});

T('variants 도 도출된다 (하드코딩 R116~R119 잔존 0)', () =>
  (!out.includes('R116~R119') && !JSON.stringify(SC.variants).includes('R116~R119'))
  || '옛 표제 잔존');

T('내보내기가 처음 밟힌다는 안내가 화면에 있다', () =>
  (out.includes('84라운드') && out.includes('sc-note')) || '안내 부재');

T('sc-note 스타일이 CSS 에 실존한다', () =>
  read('playground.css').includes('.sc-head .sc-note') || 'CSS 선언 부재');

T('건너뜀은 여전히 합격이 아니다 (신규 검사 다수가 skip 가능)', () =>
  (!E.verdict([{ state: 'pass' }, { state: 'skip' }]).ok
    && E.verdict([{ state: 'pass' }]).ok) || 'skip 판정 규약 붕괴');

/* ================================================================
   ⑸ jsdom 안전 계약 + 반례 결과 확인 (비동기)
   ================================================================ */
sec('5. 반례 실행 · jsdom 게이트');

const finish = () => {
  console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
  process.exit(fail ? 1 : 0);
};

Promise.all([
  runCase('good', fakeWin(mp4Head())),
  runCase('junk', fakeWin(junkHead())),
  runCase('empty', fakeWin(null)),
  runCase('noctx', fakeWin(mp4Head(), { noCtx: true })),
  runCase('encerr', fakeWin(mp4Head(), { encError: true })),
  runCase('cfgthrow', fakeWin(mp4Head(), { throwOnConfigure: true })),
]).then(() => {
  T('정상 ftyp 는 통과한다', () => (got('good').ok && got('good').bytes === 16) || JSON.stringify(got('good')));
  T('★ ftyp 아닌 바이트는 걸린다 (아무거나 통과시키지 않는다)', () =>
    (!got('junk').ok && /junk/.test(got('junk').why)) || JSON.stringify(got('junk')));
  T('★ 빈 버퍼는 걸린다', () => (!got('empty').ok && /빈 버퍼/.test(got('empty').why)) || JSON.stringify(got('empty')));
  T('캔버스 없음은 걸린다', () => !got('noctx').ok || '2d 부재를 통과시킴');
  T('인코더 error 콜백은 걸린다', () => !got('encerr').ok || 'error 콜백을 통과시킴');
  T('configure 예외는 결과로 환원된다 (던지지 않는다)', () =>
    (!got('cfgthrow').ok && typeof got('cfgthrow').why === 'string') || '예외가 새어나감');

  return E.run(w);
}).then((res) => {
  T('run() 이 jsdom 에서 탐침 0 · skipped 사유 반환', () =>
    (Array.isArray(res.results) && res.results.length === 0 && typeof res.skipped === 'string' && res.skipped.length > 0)
    || `게이트 통과됨: ${JSON.stringify(res).slice(0, 160)}`);
  T('탐침 무대 잔존 0 (data-sc-stage · data-sc-hit)', () =>
    (w.document.querySelectorAll('[data-sc-stage]').length === 0
      && w.document.querySelectorAll('[data-sc-hit]').length === 0) || '무대 노드 잔존');
  T('★ 인코딩 캔버스 잔존 0 (1920×1080 이 남으면 메모리를 먹는다)', () =>
    w.document.querySelectorAll('canvas').length === 0 || '캔버스 잔존');
  T('★ CDN 스크립트 태그 잔존 0 (게이트에서 멈췄으므로 loadMuxer 미호출)', () =>
    [...w.document.querySelectorAll('script')].filter((s) => {
      const src = s.src || '';
      /* R124 — 주소가 둘이 되었다. 'jsdelivr' 만 재면 자체 호스팅으로 옮긴 뒤
         이 검사가 저절로 통과하는 헛검사가 된다(§5②). 두 주소를 다 잰다. */
      return src.includes(V.EXPORT_SPEC.muxerUrl) || src.includes(V.EXPORT_SPEC.muxerFallbackUrl);
    }).length === 0
    || 'jsdom 에서 CDN 을 탔다 — 게이트가 샜다');
  finish();
}).catch((e) => {
  T('R122 검사 예외 0', () => '던졌다: ' + e.message);
  finish();
});
