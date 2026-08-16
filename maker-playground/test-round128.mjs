/* ============================================================
   test-round128.mjs — R128 준호 전용 제작대 (트리밍 · #/studio · 300초)
   ------------------------------------------------------------
   준호의 실제 파이프라인이 바뀌었다: GPT 대사 → Veo 클립(6~10초) → 조립.
   범용 편집기를 쫓지 않는다(그 판은 못 이긴다) — **이 파이프라인에 정확히
   맞는 조립대**를 만든다. 학생 화면과 목적이 달라 화면을 새로 올리되(#/studio,
   내비 비공개·직통 주소), 엔진은 전부 기존 기관을 쓴다(새 엔진 0).

   메운 구멍 셋:
   ① 트리밍 — Veo 클립의 앞뒤 죽은 프레임. clipSpan(순수) 하나가 창을 정의하고
      화면(seekTo)·소리(decodeToPCM offset/span)·미리보기(창 루프백)가 **같은
      창**을 읽는다. 창이 갈라지면 화면 따로 소리 따로 노는 최악이 된다.
   ② 총 상한 120→300초 — 폭주 인코드 가드이지 교육 방침이 아니었다(R38 임의값).
      2분 벽이 분 단위 제작을 막았다.
   ③ #/studio — 일괄 반입(1클립=1씬·전면·길이 자동), 순서·트림·대사·나레이션·
      음악·내보내기.

   의도 보존 정정 2건: R126·R127 의 「MAX_SEC 120 불변」 — 잣대의 의도는
   「총 상한이 실존하고 내보내기가 지킨다」였고 값 자체는 R38 임의값이었다.
   R128 이 값을 의도적으로 올렸으므로 300 으로 옮긴다(실존·집행은 그대로 잰다).
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R128_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/studio', pretendToBeVisual: true });
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
const vsrc = read('data/video.js');
const psrc = read('data/play.js');
const asrc = read('app.js');
/* §5② — 원본 세계엔 이 파일이 없다. 부재로 프로세스가 죽으면 역검증 수치가
   아예 안 나온다 — 빈 문자열로 환원해 각 검사가 정직하게 실패하게 둔다. */
let ssrc = '';
try { ssrc = read('screens/studio.js'); } catch (_) { ssrc = ''; }

/* ================================================================
   ⑴ 트림 창 (clipSpan · 순수)
   ================================================================ */
sec('1. 트림 창 (clipSpan)');

T('★ clipSpan 실존 · 기본 = 원본 전체', () => {
  if (typeof V.clipSpan !== 'function') return 'clipSpan 부재';
  const r = V.clipSpan({ clipDur: 8 });
  return (r.start === 0 && r.end === 8 && r.eff === 8) || JSON.stringify(r);
});

T('★ 창 계산 — 2~6초 창 = 유효 4초 (준호 시나리오)', () => {
  const r = V.clipSpan({ trimStart: 2, trimEnd: 6, clipDur: 8 });
  return (r.start === 2 && r.end === 6 && Math.abs(r.eff - 4) < 1e-9) || JSON.stringify(r);
});

T('반례 — 시작이 실길이를 넘으면 클램프 (창이 뒤집히지 않는다)', () => {
  const r = V.clipSpan({ trimStart: 99, clipDur: 8 });
  return (r.start <= 7.9 && r.eff >= 0.1) || JSON.stringify(r);
});

T('반례 — 끝 ≤ 시작이면 최소 0.1초 창', () => {
  const r = V.clipSpan({ trimStart: 5, trimEnd: 3, clipDur: 8 });
  return (r.eff >= 0.1 && r.end > r.start) || JSON.stringify(r);
});

T('★ 실길이 미상 = 모른다고 말한다 (eff:null — 끝을 지어내지 않는다)', () => {
  const r = V.clipSpan({ trimStart: 2 });
  return (r.start === 2 && r.end === null && r.eff === null) || JSON.stringify(r);
});

T('videoAudit 이 트림 계약을 진다 (조항 실존 + 그린 · §5②)', () => {
  const need = ['트림 창 계산', '무트림 기본', '실길이 클램프', '실길이 미상 정직'];
  const miss = need.filter((k) => !vsrc.includes(k));
  if (miss.length) return '감사 조항 누락: ' + miss.join(' / ');
  const r = V.videoAudit();
  const viol = (Array.isArray(r) ? r : (r && r.violations) || []).filter((x) => /트림|무트림|실길이/.test(String(x)));
  return !viol.length || viol.join(' / ');
});

/* ================================================================
   ⑵ 창의 단일성 — 화면·소리·미리보기가 같은 창을 읽는다
   ================================================================ */
sec('2. 창 단일성 (화면·소리·미리보기)');

T('★ 내보내기 시킹이 창을 받는다 (seekTo 에 요소 전달)', () => {
  if (!/function seekTo\(v, t, el\)/.test(vsrc)) return 'seekTo 가 요소를 안 받는다';
  return /seekTo\(sp\.vids\[i\], t, scene\.elements\[i\]\)/.test(vsrc) || '프레임 루프가 요소를 안 넘긴다';
});

T('★ seekTo 목표가 창 안이다 (start + 창 길이 나머지 — 소스 대조)', () => {
  const i = vsrc.indexOf('function seekTo');
  const seg = vsrc.slice(i, i + 700);
  return (/clipSpan\(el, v\.duration\)/.test(seg) && /sp\.start \+ secondsInto/.test(seg))
    || '시킹이 창을 안 읽는다';
});

T('★ 소리 원천이 창을 싣는다 (offset·span)', () => {
  const d = { scenes: [{ duration: 4, elements: [
    { kind: 'video', src: 'data:video/mp4;base64,x', trimStart: 2, trimEnd: 6, clipDur: 8 }] }] };
  const c = V.soundSources(d).find((s2) => s2.kind === 'clip');
  return (c && c.offset === 2 && Math.abs(c.span - 4) < 1e-9) || JSON.stringify(c);
});

T('무트림 클립의 창 = 시작 0 · span 은 실길이(미상이면 null)', () => {
  const d = { scenes: [{ duration: 4, elements: [{ kind: 'video', src: 'data:video/mp4;base64,x' }] }] };
  const c = V.soundSources(d).find((s2) => s2.kind === 'clip');
  return (c && c.offset === 0 && c.span === null) || JSON.stringify(c);
});

T('★ 믹서가 해독에 창을 전달한다', () => {
  const i = vsrc.indexOf('const pcm = await dec(sp.src');
  if (i < 0) return '해독 호출부 부재';
  return /offsetSec: sp\.offset \|\| 0, spanSec: sp\.span/.test(vsrc.slice(i, i + 160)) || '창 미전달';
});

T('해독기가 창을 밟는다 (offset 에서 출발 · span 주기로 루프 — 소스 대조)', () => {
  const i = vsrc.indexOf('async function decodeToPCM');
  const seg = vsrc.slice(i, i + 1400);
  return (/offsetSec/.test(seg) && /spanSec/.test(seg) && /off \+ \(i % span\)/.test(seg))
    || '해독이 창을 모른다';
});

T('★ 미리보기가 창을 밟는다 (data-mkpt0/1 방출 + 창 루프백)', () => {
  const h = P.sceneHTML({ duration: 4, elements: [
    { kind: 'video', src: 'data:video/mp4;base64,x', trimStart: 2, trimEnd: 6, clipDur: 8, x: 0, y: 0, w: 100, h: 100 }] });
  if (!/data-mkpt0="2"/.test(h) || !/data-mkpt1="6"/.test(h)) return '창 속성 미방출: ' + h.slice(0, 200);
  const i = psrc.indexOf('function paintStage');
  const seg = psrc.slice(i, i + 1600);
  return (/mkpt0/.test(seg) && /currentTime = t0/.test(seg) && /currentTime >= t1/.test(seg))
    || '재생이 창을 안 지킨다';
});

T('무트림 클립은 창 속성이 없다 (종전 방출 그대로 — 회귀)', () => {
  const h = P.sceneHTML({ duration: 4, elements: [
    { kind: 'video', src: 'data:video/mp4;base64,x', x: 0, y: 0, w: 100, h: 100 }] });
  return !/data-mkpt/.test(h) || h.slice(0, 200);
});

/* ================================================================
   ⑶ 총 상한 300초
   ================================================================ */
sec('3. 총 상한 (MAX_SEC)');

T('★ 총 상한 300초 (분 단위 제작 개통) · 집행은 그대로', () => {
  if (V.MAX_SEC !== 300) return 'MAX_SEC=' + V.MAX_SEC;
  const r = V.videoAudit();
  const viol = (Array.isArray(r) ? r : (r && r.violations) || []).filter((x) => /길이 상한/.test(String(x)));
  return !viol.length || viol.join(' / ');
});

/* ================================================================
   ⑷ 제작대 (#/studio)
   ================================================================ */
sec('4. 제작대 (#/studio)');

T('★ 화면 등록 + 제품 라우트 통과 (직통 주소가 산다)', () => {
  if (!w.MK_SCREENS || !w.MK_SCREENS.studio) return 'MK_SCREENS.studio 부재';
  return /'studio'\]/.test(asrc.replace(/\s/g, '')) || asrc.includes("'studio'")
    ? true : 'PRODUCT_ROUTES 에 studio 가 없다 — 제품에서 home 으로 튕긴다';
});

T('내비에는 없다 (준호 전용 — 학생 내비 오염 0)', () => {
  const i = asrc.indexOf('PRODUCT_NAV');
  const navSeg = asrc.slice(0, asrc.indexOf('PRODUCT_ROUTES'));
  const inNav = /\['studio'/.test(navSeg);
  return !inNav || '내비에 studio 가 올라갔다';
});

T('★ 화면이 렌더된다 (빈 문서 = 정직한 빈 안내)', () => {
  w.PG.go('studio');
  const b = w.document.getElementById('pgBody');
  return (b && /스튜디오/.test(b.innerHTML) && /클립이 없어요/.test(b.innerHTML))
    || (b ? b.innerHTML.slice(0, 150) : 'pgBody 부재');
});

T('★ 반입 = 1클립 1씬 · 전면 배치 · 길이 자동 (소스 대조)', () => {
  const i = ssrc.indexOf('function addClipScene');
  const seg = ssrc.slice(i, i + 900);
  const miss = [];
  if (!/fileToSrc/.test(seg)) miss.push('반입이 MK_LIVE 를 안 탄다');
  if (!/x: 0, y: 0, w: 100, h: 100/.test(seg)) miss.push('전면 배치 아님');
  if (!/videoDuration/.test(seg)) miss.push('길이 자동 없음');
  if (!/clipDur/.test(seg)) miss.push('트림 근거(clipDur) 미기록');
  return !miss.length || miss.join(' / ');
});

T('트림 조작이 씬 길이를 창에 맞춘다 (소스 대조)', () => {
  const i = ssrc.indexOf('const applyTrim');
  const seg = ssrc.slice(i, i + 700);
  return (/clipSpan/.test(seg) && /sc\.duration = Math\.ceil\(sp\.eff/.test(seg)) || '트림·길이 미연동';
});

T('★ 6동작 배선 (추가·순서↑↓·삭제·미리보기·내보내기)', () => {
  const miss = ['data-st-add', 'data-st-up', 'data-st-down', 'data-st-del', 'data-st-play', 'data-st-export']
    .filter((k) => !ssrc.includes(k));
  return !miss.length || '누락: ' + miss.join(',');
});

T('대사·나레이션·음악·트림 배선', () => {
  const miss = ['data-st-cap', 'data-st-nrec', 'data-st-music', 'data-st-t0', 'data-st-t1']
    .filter((k) => !ssrc.includes(k));
  return !miss.length || '누락: ' + miss.join(',');
});

T('대사 = 보통 텍스트 요소 (stCap 표식 — 재생·내보내기가 그냥 그린다)', () => {
  const i = ssrc.indexOf('function setCaption');
  const seg = ssrc.slice(i, i + 600);
  return (/stCap: true/.test(seg) && /kind: 'text'/.test(seg)) || '대사가 특수 요소다';
});

T('빈 대사는 요소를 지운다 (유령 자막 0)', () => {
  const i = ssrc.indexOf('function setCaption');
  const seg = ssrc.slice(i, i + 600);
  return /splice\(sc\.elements\.indexOf\(cur\), 1\)/.test(seg) || '빈 대사 정리 없음';
});

T('영속 = studio-main 단일 문서 (MK_LIVE.saveDoc/loadDoc)', () => {
  return (/DOC_ID = 'studio-main'/.test(ssrc) && /saveDoc\(doc\(\)\)/.test(ssrc) && /loadDoc\(DOC_ID\)/.test(ssrc))
    || '영속 미배선';
});

T('취소 = 변화 0 (파일 안 고르면 아무것도 안 넣는다 — R46 규약)', () =>
  /if \(!files\.length\) return/.test(ssrc) || '취소 경로 부재');

T('내보내기 결과가 정직하다 (완료/실패·소리 포함 여부 그대로)', () => {
  const i = ssrc.indexOf('[data-st-export]');
  const seg = ssrc.slice(i, i + 700);
  return (/r\.ok/.test(seg) && /r\.msg/.test(seg) && /소리 포함/.test(seg)) || '결과 보고 미흡';
});

/* ================================================================
   ⑸ 회귀
   ================================================================ */
sec('5. 회귀');

T('학생 세계 무접촉 — workspace 는 R128 을 모른다 (trimStart 미배선 그대로)', () => {
  const wsrc2 = read('screens/workspace.js');
  return !/trimStart/.test(wsrc2) || 'workspace 에 트림이 샜다(이번 라운드 범위 밖)';
});

T('무트림 소리 해독 = 종전 그대로 (offset 0 · 전체 루프)', () => {
  const d = { scenes: [{ duration: 4, elements: [{ kind: 'video', src: 'data:video/mp4;base64,x' }] }] };
  const c = V.soundSources(d).find((s2) => s2.kind === 'clip');
  return (c.offset === 0 && c.loop === true) || JSON.stringify(c);
});

T('나레이션 계약 불변 (반복 금지·창 없음)', () => {
  const d = { scenes: [{ duration: 4, narration: { src: 'data:audio/webm;base64,n' }, elements: [] }] };
  const nn = V.soundSources(d)[0];
  return (nn.loop === false && nn.offset === undefined) || JSON.stringify(nn);
});

T('sceneHTML 이미지 방출 불변', () => {
  const h = P.sceneHTML({ duration: 3, elements: [{ kind: 'image', src: 'data:image/png;base64,I', x: 0, y: 0, w: 40, h: 30 }] });
  return (/<img /.test(h) && !/data-mkpt/.test(h)) || h.slice(0, 160);
});

console.log(`\n결과: ${pass}/${pass + fail}  (실패 ${fail})`);
process.exit(fail ? 1 : 0);
