/* ============================================================
   test-round126.mjs — R126 영상 재료가 문을 통과한다
   ------------------------------------------------------------
   R126 이 메운 구멍: **AI 생성 클립이 문전에서 거부됐다.** 준호 실사용 —
   AI 로 만든 6~10초 클립(1080p·장당 10~20MB)을 장면마다 하나씩 넣고 대사와
   꾸밈을 얹으려는데, 종전 8MB 상한이 정상 재료를 돌려보냈다. R89 가 사진에서
   밟은 것과 같은 자리다(「요즘 재료」가 옛 상한을 넘는다) — 사진은 줄여서
   받는 처방이 있었지만 영상은 재인코딩이 불가하므로 **상한 자체를 실재료에
   맞춘다**(8MB → 32MB, 정본 MEDIA_SPEC).

   둘째 구멍: **클립을 넣어도 씬 길이가 안 따라왔다.** 8초 클립을 3초 씬에
   넣으면 3초에서 잘렸다 — 사용자는 클립이 「고장났다」고 느낀다. 그래서 클립이
   씬에 앉는 네 자리(워크스페이스 삽입·에디터 삽입·교체·드롭) 전부에서 씬
   길이가 클립을 따라온다. **늘리기만 한다** — 사용자가 이미 길게 잡아 둔
   씬을 클립이 줄이면 그건 맞춤이 아니라 덮어쓰기다.

   의도 보존 정정 3건(R36·R43·R89): 「8MB 초과 영상 거부」를 재던 잣대들은
   의도가 「감당 못 할 입력을 조용히 삼키지 않는다」이므로, 초과의 기준을
   정본에서 읽도록 옮겼다. 그 정정이 실제로 섰는지도 여기서 잰다.

   ⚠ 이 스위트는 부재를 결과로 환원한다(§5②) — 원본 세계(정본 부재)에서
   undefined 비교로 저절로 참이 되는 검사를 두지 않는다(전제 가드 HASPEC).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R126_ROOT || path.resolve('.');
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

const L = w.MK_LIVE;
const lsrc = read('data/live.js');
const wsrc = read('screens/workspace.js');
const esrc = read('screens/editor.js');

/* ★ 전제 가드(§5②) — 정본이 안 서 있으면 아래 다수가 뜻을 잃는다 */
const SPEC = L && L.MEDIA_SPEC;
const HASPEC = !!(SPEC && typeof SPEC.videoMaxBytes === 'number' && typeof SPEC.stillMaxBytes === 'number'
  && typeof SPEC.videoMaxLabel === 'string' && typeof SPEC.sceneFitMaxSec === 'number');
const NOSPEC = 'MEDIA_SPEC 정본이 안 서 있다 — 이 검사는 뜻이 없다(전제 미성립)';

const MB = 1024 * 1024;
class FakeReader {
  readAsDataURL(f) { setTimeout(() => { this.result = 'data:' + f.type + ';base64,' + 'A'.repeat(64); this.onload && this.onload(); }, 0); }
}
const file = (name, type, mb) => ({ name, type, size: Math.round(mb * MB) });
const call = (f) => new Promise((res) => L.fileToSrc(f, (src, err) => res({ src, err }), FakeReader));

/* ================================================================
   ⑴ ★ 정본(MEDIA_SPEC) — 상한이 값이 아니라 계약이다
   ================================================================ */
sec('1. 매체 입구 정본 (MEDIA_SPEC)');

T('★ MEDIA_SPEC 실존 · 동결', () =>
  (HASPEC && Object.isFrozen(SPEC)) || '정본 부재이거나 안 얼었다');

T('★ 영상 상한이 AI 클립 실재료(10~20MB)를 통과시킨다', () => {
  if (!HASPEC) return NOSPEC;
  return SPEC.videoMaxBytes >= 24 * MB || `${SPEC.videoMaxBytes} — 20MB 클립이 또 문전 거부된다`;
});

T('영상 상한 > 정지영상 상한 (재인코딩 불가 유형끼리도 처방이 다르다)', () => {
  if (!HASPEC) return NOSPEC;
  return SPEC.videoMaxBytes > SPEC.stillMaxBytes || '상한 역전';
});

T('라벨이 바이트와 일치한다 (안내문이 거짓말하지 않는다)', () => {
  if (!HASPEC) return NOSPEC;
  const bad = [[SPEC.videoMaxLabel, SPEC.videoMaxBytes], [SPEC.stillMaxLabel, SPEC.stillMaxBytes]]
    .filter(([l, b]) => parseInt(l, 10) * MB !== b);
  return !bad.length || '어긋남: ' + bad.map(([l]) => l).join(',');
});

T('★ 영상 상한 리터럴이 live.js 안에서 정본 밖에 없다 (정본 단일성 · §5④)', () => {
  if (!HASPEC) return NOSPEC;
  const n = lsrc.split('32 * 1024 * 1024').length - 1;
  return n === 1 || `${n}회 등장 — 상한이 갈라졌다`;
});

T('★ fileToSrc 가 상한 판정에 정본을 읽는다 (손글씨 8MB 비교 잔존 0)', () => {
  const gate = lsrc.slice(lsrc.indexOf('function fileToSrc'), lsrc.indexOf('/* ================= ③'));
  if (!gate) return 'fileToSrc 본문을 못 찾았다';
  if (!/MEDIA_SPEC\.videoMaxBytes|MEDIA_SPEC\.(videoMaxBytes|stillMaxBytes)|cap\b/.test(gate)) return '정본을 안 읽는다';
  return !/size > 8 \* 1024 \* 1024/.test(gate) || '손글씨 8MB 비교 잔존';
});

/* ================================================================
   ⑵ 입구 실동작 — 실재료가 살고, 초과는 정직하게 거부된다
   ================================================================ */
sec('2. 입구 (fileToSrc)');

const B = {};
Promise.resolve()
  .then(async () => {
    B.clip18 = await call(file('ai-clip.mp4', 'video/mp4', 18));
    B.clip9 = await call(file('ai-clip2.mp4', 'video/mp4', 9));
    B.over = HASPEC ? await call(file('huge.mp4', 'video/mp4', SPEC.videoMaxBytes / MB + 1)) : null;
    B.gif9 = await call(file('anim.gif', 'image/gif', 9));
    /* ⑷용 — jsdom video 는 metadata 를 못 읽으니 판독 실패 세계를 실측한다 */
    B.fitFailDoc = { scenes: [{ duration: 3, elements: [] }] };
    B.fitFail = await new Promise((res) => {
      if (typeof L.fitSceneToClipSrc !== 'function') return res({ _err: '부재' });
      L.fitSceneToClipSrc(B.fitFailDoc, 0, 'data:video/mp4;base64,AAAA', res);
      setTimeout(() => res({ _err: '콜백이 10초 안에 안 왔다' }), 10000);
    });
    /* ⑹용 — 음악 상한 회귀 */
    B.audio9 = await new Promise((res) => {
      const A = w.MK_AUDIO;
      if (!A || !A.fileToSrc) return res({ _err: 'MK_AUDIO 부재' });
      A.fileToSrc({ type: 'audio/mpeg', size: 9 * MB }, (src, err) => res({ src, err }), FakeReader);
    });
  })
  .then(() => {
    T('★ 18MB AI 클립이 산다 (이 라운드의 존재 이유)', () => {
      if (!HASPEC) return NOSPEC;
      return (typeof B.clip18.src === 'string' && B.clip18.src.indexOf('data:video/mp4') === 0)
        || JSON.stringify(B.clip18);
    });

    T('★ 9MB 클립이 산다 (종전 세계에서 거부되던 크기 — 회귀 방향 확인)', () => {
      if (!HASPEC) return NOSPEC;
      return (typeof B.clip9.src === 'string') || JSON.stringify(B.clip9);
    });

    T('★ 상한 초과는 정직하게 거부 + 안내가 정본 라벨과 자를 길을 말한다', () => {
      if (!HASPEC) return NOSPEC;
      if (!B.over || B.over.src !== null) return '초과가 살았다: ' + JSON.stringify(B.over);
      const e = B.over.err || '';
      if (!e.includes(SPEC.videoMaxLabel)) return '안내에 상한이 없다: ' + e;
      return /잘라/.test(e) || '안내가 다음 행동(클립 자르기)을 안 말한다: ' + e;
    });

    T('★ GIF 는 종전 8MB 유지 (영상 상한 인상이 정지영상까지 열지 않았다)', () => {
      if (!HASPEC) return NOSPEC;
      return (B.gif9.src === null && (B.gif9.err || '').includes(SPEC.stillMaxLabel))
        || JSON.stringify(B.gif9);
    });

    /* ================================================================
       ⑶ ★ 씬 길이가 클립을 따라온다 (fitSceneToClip)
       ================================================================ */
    sec('3. 클립 맞춤 (fitSceneToClip)');

    const mkDoc = (dur) => ({ scenes: [{ duration: dur, elements: [] }] });

    T('★ 8.3초 클립 → 3초 씬이 8.3초가 된다 (준호 시나리오 그대로)', () => {
      if (typeof L.fitSceneToClip !== 'function') return 'fitSceneToClip 부재';
      const d = mkDoc(3);
      const r = L.fitSceneToClip(d, 0, 8.3);
      return (r.ok && r.changed && d.scenes[0].duration === 8.3) || JSON.stringify({ r, dur: d.scenes[0].duration });
    });

    T('0.1초 올림 (7.82초 클립 → 7.9초 씬 — 클립 꼬리가 잘리지 않는다)', () => {
      const d = mkDoc(3);
      L.fitSceneToClip(d, 0, 7.82);
      return d.scenes[0].duration === 7.9 || String(d.scenes[0].duration);
    });

    T('★ 늘리기만 한다 — 12초 씬에 8초 클립을 넣어도 12초 그대로', () => {
      const d = mkDoc(12);
      const r = L.fitSceneToClip(d, 0, 8);
      return (r.ok && !r.changed && d.scenes[0].duration === 12) || JSON.stringify({ r, dur: d.scenes[0].duration });
    });

    T('★ 씬 상한에서 멈춘다 (폭주 클립이 씬을 무한정 늘리지 않는다)', () => {
      if (!HASPEC) return NOSPEC;
      const d = mkDoc(3);
      L.fitSceneToClip(d, 0, 300);
      return d.scenes[0].duration === SPEC.sceneFitMaxSec || String(d.scenes[0].duration);
    });

    T('반례 — 길이를 못 쟀으면(null·0·NaN) 씬을 건드리지 않는다', () => {
      const bad = [null, 0, NaN, -3, Infinity].filter((v) => {
        const d = mkDoc(3);
        const r = L.fitSceneToClip(d, 0, v);
        return r.ok || d.scenes[0].duration !== 3;
      });
      return !bad.length || '오염 입력이 통과: ' + bad.join(',');
    });

    T('반례 — 없는 씬은 조용히 실패한다 (던지지 않는다)', () => {
      const r = L.fitSceneToClip({ scenes: [] }, 5, 8);
      return (r && r.ok === false) || JSON.stringify(r);
    });

    /* ================================================================
       ⑷ 길이 판독 (videoDuration) — 실패를 삼키지 않는다
       ================================================================ */
    sec('4. 길이 판독 (videoDuration)');

    T('videoDuration 실존 · 시간 안전망 보유 (영영 안 끝나는 콜백 금지)', () => {
      if (typeof L.videoDuration !== 'function') return 'videoDuration 부재';
      const seg = lsrc.slice(lsrc.indexOf('function videoDuration'), lsrc.indexOf('function fitSceneToClip'));
      return (/setTimeout/.test(seg) && /fin\(null\)/.test(seg)) || '실패·지연이 null 로 안 돌아온다';
    });

    T('판독 실패 시 fitSceneToClipSrc 가 씬을 안 건드린다 (jsdom = 실패 세계 실측)', () => {
      const r = B.fitFail;
      if (r && r._err) return r._err;
      return (r && r.ok === false && B.fitFailDoc.scenes[0].duration === 3)
        || JSON.stringify({ r, dur: B.fitFailDoc.scenes[0].duration });
    });

    /* ================================================================
       ⑸ 배선 — 클립이 앉는 네 자리 전부에서 맞춤이 돈다
       ================================================================ */
    sec('5. 배선 (워크스페이스·에디터)');

    T('★ 워크스페이스 삽입이 맞춤을 부른다', () =>
      /fitSceneToClipSrc/.test(wsrc) || '워크스페이스가 클립 맞춤을 모른다');

    T('★ 에디터 세 자리(삽입·교체·드롭)가 전부 맞춤을 부른다', () => {
      const n = esrc.split('fitSceneToClipSrc').length - 1;
      return n >= 3 || `에디터에 ${n}곳 — 삽입·교체·드롭 중 빠진 자리가 있다`;
    });

    T('맞춤은 영상일 때만 돈다 (사진 삽입이 씬 길이를 건드리면 회귀)', () => {
      /* §5② 전제 가드 — 호출이 0곳이면 「전부 조건부다」가 공허하게 참이 된다 */
      const total = (wsrc + esrc).split('fitSceneToClipSrc').length - 1;
      if (total === 0) return '부르는 곳이 0 — 재는 대상이 없다(전제 미성립)';
      const bad = [wsrc, esrc].filter((src) => {
        let ok = true;
        let i = -1;
        while ((i = src.indexOf('fitSceneToClipSrc', i + 1)) >= 0) {
          const before = src.slice(Math.max(0, i - 260), i);
          if (!/video/.test(before)) ok = false;
        }
        return !ok;
      });
      return !bad.length || '영상 조건 없이 부르는 파일이 있다';
    });

    T('비동기 맞춤 뒤 다시 그린다 (씬 길이 표기가 즉시 갱신)', () => {
      const okWs = /fitSceneToClipSrc[^;]*\{[^}]*R\(\)/.test(wsrc.replace(/\n/g, ' '));
      const okEd = /fitSceneToClipSrc[^;]*\{[^}]*PG\.render\(\)/.test(esrc.replace(/\n/g, ' '));
      return (okWs && okEd) || `재렌더 누락: ws=${okWs} ed=${okEd}`;
    });

    /* ================================================================
       ⑹ 회귀 — 이 라운드가 안 건드린 세계
       ================================================================ */
    sec('6. 회귀');

    T('음악 파일 상한은 종전 8MB (영상 인상이 오디오까지 열지 않았다)', () => {
      const r = B.audio9;
      if (r && r._err) return r._err;
      return (r.src == null && /8MB/.test(r.err || '')) || JSON.stringify(r);
    });

    T('내보내기 전체 상한 120초 불변 (씬 맞춤 상한과 별개 계약)', () =>
      (w.MK_VIDEO && w.MK_VIDEO.MAX_SEC === 120) || 'MAX_SEC=' + (w.MK_VIDEO && w.MK_VIDEO.MAX_SEC));

    T('낡은 주석 잔존 0 (「영상은 종전 8MB 규칙 그대로」가 거짓이 됐다)', () =>
      !/영상.*종전 8MB 규칙.*그대로/.test(lsrc) || '거짓 주석 잔존');

    T('insertWithSrc 계약 불변 (src 탑재·자동 애니 — R36 세계 무손상)', () => {
      const d = { scenes: [{ duration: 3, elements: [] }] };
      const r = L.insertWithSrc(d, 0, { name: 'c', kind: 'video', src: 'data:video/mp4;base64,X' });
      const el = d.scenes[0].elements[0];
      return !!(r.ok && el.src === 'data:video/mp4;base64,X' && el.video === true && el.anim && el.anim.preset)
        || JSON.stringify({ r, el });
    });
  })
  .then(async () => {
    /* 비동기 T 하나(⑷ 두 번째)가 Promise 를 반환했을 수 있다 — 정리 대기 */
    await new Promise((r) => setTimeout(r, 50));
    console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
    process.exit(fail ? 1 : 0);
  })
  .catch((e) => {
    console.log('  ✗ R126 검사 예외 0  → 던졌다: ' + e.message);
    console.log(`\n결과: ${pass}/${pass + fail + 1}  (실패 ${fail + 1})`);
    process.exit(1);
  });
