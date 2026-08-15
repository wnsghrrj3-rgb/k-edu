/* ============================================================
   test-round124.mjs — R124 먹서 자체 호스팅의 하부 검사
   ------------------------------------------------------------
   R124 가 메운 구멍: **학생이 마지막에 누르는 버튼이 남의 CDN 에 매달려
   있었다.** R38~R123 동안 내보내기는 `cdn.jsdelivr.net` 이 살아 있고 학교
   방화벽이 그걸 열어줘야만 동작했다. 방화벽은 우리가 못 고친다.

   ★ 부수 발견 하나가 더 크다 — mp4-muxer 패키지에는 `.min.js` 가 **실존하지
   않는다.** 종전 정본 주소가 가리키던 압축본은 jsdelivr 가 요청 시 즉석에서
   만들어 주던 것이다. 즉 우리는 파일이 아니라 **CDN 의 기능** 하나에
   매달려 있었고, 아무도 그걸 모르고 있었다.

   그래서 순서를 뒤집었다 — 자체 호스팅이 1순위, CDN 이 폴백이다.

   이 하니스의 성격 — R120~R123 계열과 같다. 브라우저 탐침은 jsdom 에서 못
   돌리므로 **판정 근거로 쓰는 것을 전량 검사한다.** 적재 사다리는 선언
   확인이 아니라 **가짜 스크립트 태그를 심어 실제로 걸어 내려가게 한다.**

   ★ 반례를 반드시 둔다:
     · 자체가 200 으로 실렸는데 Mp4Muxer 가 없으면(잘못된 리라이트가 HTML 을
       돌려주는 경우) 그것도 실패로 보고 폴백으로 내려가는가
     · 둘 다 죽으면 정직하게 reject 하는가
   둘 없이 「폴백이 있다」는 장식이다.

   ⚠ 이 스위트는 **부재를 결과로 환원한다**(§5②). 원본 세계에는
   muxerFallbackUrl·muxerSource·vendor/ 가 없다 — 없다고 프로세스가 죽으면
   역검증 수치가 안 나오고, 그러면 하니스가 진짜로 그 구멍을 겨누는지
   아무도 모른다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const ROOT = process.env.R124_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
/* 루트 절대경로(/maker-playground/...) → 디스크. 사이트 루트는 ROOT 의 부모다 */
const siteFile = (abs) => path.join(ROOT, '..', abs.replace(/^\//, ''));

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

/* §5② — 부재도 결과로. 검사기가 죽으면 역검증이 성립하지 않는다 */
const safe = (k, bag, fn) => {
  try { return Promise.resolve(fn()).then((r) => { bag[k] = r; })
    .catch((e) => { bag[k] = { _err: (e && e.message) || 'reject' }; }); }
  catch (e) { bag[k] = { _err: (e && e.message) || 'throw' }; return Promise.resolve(); }
};

const V = w.MK_VIDEO;
const E = w.MK_SELFCHECK;
const vsrc = read('data/video.js');
const ssrc = read('data/selfcheck.js');
const S = (V && V.EXPORT_SPEC) || {};

/* ★ 전제 가드 — R124 1차 역검증에서 배운 것.
   아래 여러 검사가 「두 주소가 있다」를 암묵 전제로 삼고 있었고, 원본 세계
   (주소 하나)에서 전제가 무너지자 **저절로 통과**해 버렸다(undefined 끼리
   비교하면 다 참이다). 전제가 안 서면 통과가 아니라 실패여야 한다 — §5②. */
const HAS2 = typeof S.muxerUrl === 'string' && typeof S.muxerFallbackUrl === 'string'
  && S.muxerUrl !== S.muxerFallbackUrl
  && S.muxerUrl.charAt(0) === '/' && /^https?:/i.test(S.muxerFallbackUrl);
const NO2 = '주소 2단 계약이 안 서 있다 — 이 검사는 뜻이 없다(전제 미성립)';
const CDN_HOST = (S.muxerFallbackUrl || '').split('/')[2] || '';

/* ================================================================
   ⑴ 벤더 파일 — 「자체 호스팅한다」가 말이 아니라 파일인가
   ================================================================ */
sec('1. 벤더 실물 (vendor/)');

T('★ 정본 자체 주소가 실제 파일을 가리킨다 (배포에서 빠지면 여기서 걸린다)', () => {
  if (typeof S.muxerUrl !== 'string') return '정본에 muxerUrl 이 없다';
  if (/^https?:/i.test(S.muxerUrl)) return '자체 주소가 아니라 외부 주소다';
  const p = siteFile(S.muxerUrl);
  if (!fs.existsSync(p)) return '그 주소에 파일이 없다: ' + S.muxerUrl;
  return fs.statSync(p).size > 20000 || '파일이 너무 작다 — 먹서 본문이 아니다';
});

T('★ 벤더 파일을 실행하면 Mp4Muxer 전역이 선다 (읽기만 하지 않고 밟는다)', () => {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(siteFile(S.muxerUrl), 'utf8'), sandbox, { timeout: 5000 });
  const M = sandbox.Mp4Muxer;
  if (!M) return '전역 Mp4Muxer 가 안 선다 — <script> 로 꽂아도 안 잡힌다';
  const miss = ['Muxer', 'ArrayBufferTarget'].filter((k) => typeof M[k] !== 'function');
  return !miss.length || '내보내기가 쓰는 것이 없다: ' + miss.join(',');
});

T('MIT 라이선스 원문을 함께 둔다 (재배포 조건)', () => {
  const p = path.join(path.dirname(siteFile(S.muxerUrl)), 'LICENSE-mp4-muxer.txt');
  if (!fs.existsSync(p)) return 'LICENSE-mp4-muxer.txt 부재';
  return /MIT License/.test(fs.readFileSync(p, 'utf8')) || 'MIT 표기 부재';
});

T('출처 머리말이 있다 (어디서 왔고 어떻게 갱신하는지)', () => {
  const src = fs.readFileSync(siteFile(S.muxerUrl), 'utf8').slice(0, 2000);
  const miss = ['mp4-muxer', 'MIT', 'npm pack'].filter((k) => !src.includes(k));
  return !miss.length || '머리말 누락: ' + miss.join(',');
});

T('벤더 본문을 손대지 않았다 (Mp4Muxer 정의부가 원본 그대로)', () => {
  const src = fs.readFileSync(siteFile(S.muxerUrl), 'utf8');
  return src.includes('var Mp4Muxer = (() => {') || '원본 번들 형태가 아니다 — 수정본이면 갱신이 막힌다';
});

/* ================================================================
   ⑵ 정본 주소 계약 — 자체가 1순위, CDN 은 폴백
   ================================================================ */
sec('2. 주소 계약 (EXPORT_SPEC)');

T('★ 주소가 둘이다 (폴백이 실존한다)', () =>
  !!(typeof S.muxerUrl === 'string' && typeof S.muxerFallbackUrl === 'string'
    && S.muxerUrl && S.muxerFallbackUrl) || 'muxerFallbackUrl 부재 — 폴백이 없다');

T('두 주소가 서로 다르다 (같으면 폴백이 아니라 재시도다)', () =>
  (typeof S.muxerFallbackUrl === 'string' && S.muxerUrl !== S.muxerFallbackUrl) || '두 주소가 동일이거나 폴백 부재');

T('★ 자체가 루트 절대경로다 (/maker/ 진입에서 안 빗나간다)', () => {
  if (typeof S.muxerUrl !== 'string') return 'muxerUrl 부재';
  return S.muxerUrl.charAt(0) === '/'
    || '상대경로 — loadMuxer 는 실행 시점에 꽂으므로 /maker/ 에서 /maker/vendor/ 로 빗나간다';
});

T('폴백만 외부 주소다 (1순위가 남의 서버면 자체 호스팅이 아니다)', () => {
  if (/^https?:/i.test(S.muxerUrl || '')) return '1순위가 외부 주소';
  return /^https?:/i.test(S.muxerFallbackUrl || '') || '폴백이 외부 주소가 아니다';
});

T('★ videoAudit 이 이 계약을 스스로 진다', () => {
  /* 위반 0 만 재면 「감사에 그 조항이 아예 없다」도 통과한다 — 원본 세계가
     실제로 그렇게 통과했다. 조항의 실존을 함께 못 박는다(§5④ 소스 대조). */
  if (!/muxerFallbackUrl/.test(vsrc)) return '감사가 폴백 주소를 모른다';
  const audit = vsrc.slice(vsrc.indexOf('먹서 주소 계약'));
  const need = ['먹서 폴백 주소 부재', '먹서 두 주소가 같음', '루트 절대경로가 아님'];
  const miss = need.filter((k) => !audit.includes(k));
  if (miss.length) return '감사 조항 누락: ' + miss.join(' / ');
  const v = V.videoAudit();
  const bad = (Array.isArray(v) ? v : (v && v.violations) || []).filter((x) => /먹서/.test(String(x)));
  return !bad.length || '자체 감사가 먹서 위반을 낸다: ' + bad.join(' / ');
});

T('★ 두 주소가 selfcheck.js 에 손글씨로 없다 (탐침은 정본을 읽는다 · §5④)', () => {
  if (!HAS2) return NO2;
  const leaked = [S.muxerUrl, S.muxerFallbackUrl].filter((x) => x && ssrc.includes(x));
  return !leaked.length || '탐침이 직접 적음: ' + leaked.join(' / ');
});

T('★ CDN 호스트명이 video.js 정본 밖에 없다 (자체로 옮겼다면 흔적이 하나여야 한다)', () => {
  if (!CDN_HOST) return '폴백 주소에 호스트가 없다';
  const n = vsrc.split(CDN_HOST).length - 1;
  return n === 1 || `video.js 에 ${n}회 — 주소가 갈라졌다`;
});

/* ================================================================
   ⑶ 적재 사다리 — 가짜 스크립트를 심어 실제로 걸어 내려가게 한다
   ================================================================ */
sec('3. 적재 사다리 (loadMuxer)');

const FAKE = () => ({ Muxer: function () {}, ArrayBufferTarget: function () {} });
/* 자체/CDN 을 **폴백 호스트 기준**으로 가른다. 파일 이름 꼬리로 가르면
   원본 세계(주소 하나)에서 CDN 주입이 「자체」로 잡혀 사다리 검사가 저절로
   통과한다 — R124 1차 역검증에서 실제로 그랬다. */
const isSelfSrc = (src) => !!CDN_HOST && !src.includes(CDN_HOST);

function ladderCase(opts) {
  const tried = [];
  const head = w.document.head;
  const origAppend = head.appendChild.bind(head);
  delete w.Mp4Muxer;
  if (opts.preloaded) w.Mp4Muxer = FAKE();
  head.appendChild = (el) => {
    if (el && el.tagName === 'SCRIPT' && el.src) {
      const isSelf = isSelfSrc(el.src);
      tried.push(isSelf ? 'self' : 'cdn');
      setTimeout(() => {
        const loads = isSelf ? opts.selfLoads : opts.cdnLoads;
        if (!loads) { if (el.onerror) el.onerror(new w.Event('error')); return; }
        /* 200 인데 본문이 먹서가 아닌 경우 — 잘못된 리라이트가 HTML 을 돌려준다 */
        const sets = isSelf ? opts.selfSetsGlobal !== false : opts.cdnSetsGlobal !== false;
        if (sets) w.Mp4Muxer = FAKE();
        if (el.onload) el.onload(new w.Event('load'));
      }, 0);
      return el;
    }
    return origAppend(el);
  };
  /* 출처는 **그 시점에** 딴다. muxerFrom 은 모듈 수명 상태라 나중에 읽으면
     뒤 사례가 덮어쓴 값을 보게 된다(R124 1차에서 실제로 밟은 함정) */
  const done = (r) => {
    const from = typeof V.muxerSource === 'function' ? V.muxerSource() : undefined;
    head.appendChild = origAppend; delete w.Mp4Muxer; return { ...r, tried, from };
  };
  return Promise.resolve(V.loadMuxer())
    .then((src) => done({ ok: true, src }), (e) => done({ ok: false, why: (e && e.message) || String(e) }));
}

const B = {};
/* preloaded 를 먼저 돌린다 — muxerFrom 은 모듈 수명 상태라 순서가 뜻을 바꾼다 */
Promise.resolve()
  .then(() => safe('pre', B, () => ladderCase({ preloaded: true })))
  .then(() => safe('self', B, () => ladderCase({ selfLoads: true })))
  .then(() => safe('fallback', B, () => ladderCase({ selfLoads: false, cdnLoads: true })))
  .then(() => safe('emptyself', B, () => ladderCase({ selfLoads: true, selfSetsGlobal: false, cdnLoads: true })))
  .then(() => safe('dead', B, () => ladderCase({ selfLoads: false, cdnLoads: false })))
  .then(() => {
    const g = (k) => B[k] || { _err: '미실행' };

    T('이미 올라와 있으면 아무것도 안 꽂는다', () =>
      (g('pre').ok && g('pre').tried && g('pre').tried.length === 0)
      || JSON.stringify(g('pre')));

    T('★ 자체를 먼저 시도한다 (CDN 은 안 건드린다)', () => {
      if (!HAS2) return NO2;
      const r = g('self');
      return (r.ok && JSON.stringify(r.tried) === JSON.stringify(['self']))
        || JSON.stringify(r);
    });

    T('★ 어디서 받았는지 기록한다 — 자체', () =>
      (g('self').src === 'self' && g('self').from === 'self') || JSON.stringify(g('self')));

    T('★ 어디서 받았는지 기록한다 — CDN 으로 내려갔을 때', () =>
      (g('fallback').src === 'cdn' && g('fallback').from === 'cdn') || JSON.stringify(g('fallback')));

    T('★ 자체가 죽으면 CDN 으로 내려간다 (이 순서로)', () => {
      const r = g('fallback');
      return (r.ok && JSON.stringify(r.tried) === JSON.stringify(['self', 'cdn']) && r.src === 'cdn')
        || JSON.stringify(r);
    });

    T('★ 반례 — 200 으로 실렸는데 Mp4Muxer 가 없으면 그것도 실패로 본다', () => {
      const r = g('emptyself');
      return (r.ok && r.src === 'cdn' && JSON.stringify(r.tried) === JSON.stringify(['self', 'cdn']))
        || '실렸다는 말만 믿고 통과시켰다: ' + JSON.stringify(r);
    });

    T('★ 반례 — 둘 다 죽으면 정직하게 실패한다 (조용히 성공하지 않는다)', () => {
      const r = g('dead');
      return (r.ok === false && typeof r.why === 'string' && r.why.length > 0
        && JSON.stringify(r.tried) === JSON.stringify(['self', 'cdn']))
        || JSON.stringify(r);
    });

    /* ================================================================
       ⑷ 탐침 정직성 — 「CDN 에서 받았어요」라고 거짓말하지 않는다
       ================================================================ */
    sec('4. 탐침 정직성 (muxer-reach)');

    T('탐침이 muxerSource 를 읽는다 (자체/CDN 을 실제로 가른다)', () =>
      /muxerSource/.test(ssrc) || '탐침이 출처를 안 묻는다 — 어디서 받았든 같은 문구가 나간다');

    T('★ 종전 문구가 남아 있지 않다 (자체에서 받고 CDN 이라 말하면 거짓말)', () =>
      !/CDN 에서 MP4 모듈을 받았어요/.test(ssrc) || '자체 적재에도 「CDN 에서 받았어요」가 나간다');

    T('★ CDN 폴백 적재는 합격이 아니다 (지금 되니까 괜찮다 = 헛통과 · §5②)', () => {
      const i = ssrc.indexOf("from === 'cdn'");
      if (i < 0) return '탐침이 cdn 분기를 안 만든다';
      return /'muxer-reach', 'fail'/.test(ssrc.slice(i, i + 200))
        || 'cdn 분기가 합격 처리된다 — 보호막이 없는데 초록불이 뜬다';
    });

    T('탐침이 CDN 호스트명을 손글씨로 적지 않는다', () => {
      if (!CDN_HOST) return '폴백 호스트가 없다 — 이 검사는 뜻이 없다';
      return !ssrc.includes(CDN_HOST) || '탐침이 ' + CDN_HOST + ' 를 직접 적는다';
    });

    let repObj = null;
    try { repObj = JSON.parse(E.reportText(w, [{ id: 'x', state: 'pass', msg: 'm' }])); }
    catch (e) { repObj = { _err: e.message }; }

    T('★ 보고서만 보고도 자체/CDN 을 가릴 수 있다', () => {
      if (!repObj || repObj._err) return String(repObj && repObj._err);
      const sp = repObj.spec || {};
      const miss = ['muxerUrl', 'muxerFallbackUrl', 'muxerFrom'].filter((k) => sp[k] === undefined);
      return !miss.length || '보고서 누락: ' + miss.join(',');
    });

    T('보고서의 두 주소가 정본과 같다 (보고서가 따로 적지 않는다)', () => {
      if (!HAS2) return NO2;
      if (!repObj || repObj._err) return String(repObj && repObj._err);
      const sp = repObj.spec || {};
      if (sp.muxerUrl === undefined || sp.muxerFallbackUrl === undefined) return '보고서에 주소가 없다';
      return (sp.muxerUrl === S.muxerUrl && sp.muxerFallbackUrl === S.muxerFallbackUrl)
        || JSON.stringify(sp);
    });

    /* ================================================================
       ⑸ /maker 제품 진입 — 루트 절대경로가 보정에 안 먹힌다
       ================================================================ */
    sec('5. 제품 진입 (/maker)');

    return import(path.join(ROOT, '..', 'maker', 'build.mjs')).then((mod) => {
      T('★ build.mjs 경로 보정이 먹서 자체 주소를 안 건드린다', () => {
        if (!HAS2) return NO2;
        const out = mod.transform(`<script src="${S.muxerUrl}"></script>`);
        return out.includes(`src="${S.muxerUrl}"`)
          || '보정이 먹서 주소를 다시 씀 — /maker/ 에서 404: ' + out;
      });
      T('상대경로였다면 보정에 먹혔을 것이다 (위 검사가 헛검사가 아님을 보인다)', () => {
        const rel = (S.muxerUrl || '/x/y.js').replace(/^\//, '');
        const out = mod.transform(`<script src="${rel}"></script>`);
        return out.includes('../maker-playground/') || '보정 자체가 안 도는 환경 — 위 검사에 뜻이 없다';
      });
    }, (e) => { T('build.mjs 를 읽는다', () => 'import 실패: ' + e.message); });
  })
  .then(() => {
    console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
    process.exit(fail ? 1 : 0);
  })
  .catch((e) => {
    console.log('  ✗ R124 검사 예외 0  → 던졌다: ' + e.message);
    console.log(`\n결과: ${pass}/${pass + fail + 1}  (실패 ${fail + 1})`);
    process.exit(1);
  });
