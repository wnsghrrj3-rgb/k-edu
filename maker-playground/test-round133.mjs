/* ============================================================
   test-round133.mjs — R133 스튜디오가 「수상한 교과서」 제작대가 된다
   ------------------------------------------------------------
   준호: 채널 「수상한 교과서」 확정 — Veo 클립을 잇는 실제 제작 파이프라인이
   #/studio 로 온다. 첫 실전 테스트 영상(이야기1.mp4)의 부검이 이번 라운드의
   요구사항 명세였다:
   · 세로 프롬프트로 뽑았는데 결과가 1280×720 가로 — 씬이 width·height 를
     안 들고 있어 render 기본값으로 굳은 것. → 화면비 정본(ASPECTS)과
     문서·씬 동시 적용. 새 문서 기본은 세로(쇼츠 표준).
   · 자막이 처음 16초에만 있고 88초 무자막 — 씬마다 손으로 치는 입력이
     병목. → 대본 일괄(assignCaptions): 컷 테이블 대사를 통째로 붙여넣으면
     줄 순서대로 앉는다. captionScript 의 역방향이라 왕복이 성립한다.
   · 유튜브 업로드에 자막 파일이 필요 — srtScript: 씬 길이 누적으로 큐
     시각을 계산하는 순수 문자열. 자막 없는 씬도 시간은 흐른다.
   · 채널 표준 자막(검은고딕·흰 글자·두꺼운 검정 외곽선 + 노랑 강조) —
     ts-susu·ts-susukey 프리셋. 새 자막은 표준으로 태어난다.
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R133_ROOT || path.resolve('.');
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
const TS = w.MK_TEXTSTYLE;
let ssrc = '';
try { ssrc = read('screens/studio.js'); } catch (_) { ssrc = ''; }

/* ================================================================
   ⑴ 채널 표준 자막 프리셋
   ================================================================ */
sec('1. 수상한 교과서 자막 프리셋 (MK_TEXTSTYLE)');

T('★ ts-susu·ts-susukey 가 실존하고 본문·강조가 색으로 갈린다', () => {
  const a = TS.PRESETS.find((p) => p.id === 'ts-susu');
  const b = TS.PRESETS.find((p) => p.id === 'ts-susukey');
  if (!a || !b) return '프리셋 부재';
  if (a.style.color !== '#FFFFFF') return '본문이 흰 글자가 아님: ' + a.style.color;
  if (b.style.color !== '#FFD93D') return '강조가 노랑이 아님: ' + b.style.color;
  if (a.style.color === b.style.color) return '본문·강조가 같은 색 — 강조가 장식';
  return true;
});

T('★ 외곽선이 ts-poster 보다 두껍다 (쇼츠 축소 화면 생존 근거)', () => {
  const susu = TS.PRESETS.find((p) => p.id === 'ts-susu');
  const post = TS.PRESETS.find((p) => p.id === 'ts-poster');
  if (!susu.style.outline || !susu.style.outline.w) return '외곽선 부재';
  if (!(susu.style.outline.w > post.style.outline.w)) return `외곽선이 더 얇음: ${susu.style.outline.w} vs ${post.style.outline.w}`;
  if (!susu.style.shadow) return '낙하 그림자 부재 — 밝은 배경 가독 근거가 없다';
  return true;
});

T('applyPreset(ts-susu) 가 텍스트 요소에 실제로 앉는다', () => {
  const el = { kind: 'text', text: 'x' };
  TS.applyPreset(el, 'ts-susu');
  return el.color === '#FFFFFF' && el.outline && el.outline.color === '#000000' || '적용 실패: ' + JSON.stringify(el);
});

/* ================================================================
   ⑵ 대본 일괄 — assignCaptions (captionScript 의 역방향)
   ================================================================ */
sec('2. 대본→자막 다리 (MK_LIVE.assignCaptions)');

const mkDoc = () => ({ id: 't', scenes: [
  { id: 's1', duration: 3, elements: [] },
  { id: 's2', duration: 4, elements: [] },
  { id: 's3', duration: 2.5, elements: [{ kind: 'text', stCap: true, text: '옛 자막' }] },
] });

T('★ 번호·[화자] 를 벗기고 줄 순서대로 앉는다', () => {
  const d = mkDoc();
  const r = L.assignCaptions(d, '1. 300년 전, 한양\n2) [소년] 이 많은 사람들이...\n3. 새 자막', { styleId: 'ts-susu' });
  if (r.assigned !== 3) return 'assigned=' + r.assigned;
  const c1 = d.scenes[0].elements.find((e) => e.stCap);
  const c2 = d.scenes[1].elements.find((e) => e.stCap);
  const c3 = d.scenes[2].elements.find((e) => e.stCap);
  if (c1.text !== '300년 전, 한양') return '번호가 안 벗겨짐: ' + c1.text;
  if (d.scenes[1].speaker !== '소년' || c2.text !== '이 많은 사람들이...') return '[화자] 미해석';
  if (c3.text !== '새 자막') return '기존 자막 교체 실패: ' + c3.text;
  if (c1.color !== '#FFFFFF') return '새 자막에 채널 표준이 안 앉음';
  if (c3.color === '#FFFFFF') return '기존 자막의 스타일을 함부로 바꿈 — 교체는 글만';
  return true;
});

T('★ (대사 없음) = 그 씬의 자막을 지운다 (captionScript 왕복)', () => {
  const d = mkDoc();
  const r = L.assignCaptions(d, '1. 첫 대사\n2. (대사 없음)\n3. (대사 없음)');
  if (r.assigned !== 1 || r.cleared !== 1) return `assigned=${r.assigned} cleared=${r.cleared}`;
  if (d.scenes[2].elements.some((e) => e.stCap)) return '옛 자막이 안 지워짐';
  return true;
});

T('남는 줄·남는 씬을 정직하게 센다', () => {
  const d = mkDoc();
  const r = L.assignCaptions(d, '1. 하나\n2. 둘\n3. 셋\n4. 넷\n5. 다섯');
  if (r.extraLines !== 2) return 'extraLines=' + r.extraLines;
  const d2 = mkDoc();
  const r2 = L.assignCaptions(d2, '1. 하나');
  return r2.extraScenes === 2 || 'extraScenes=' + r2.extraScenes;
});

T('★ captionScript → assignCaptions 왕복이 자막을 보존한다', () => {
  const d = mkDoc();
  L.assignCaptions(d, '1. [소년] 가\n2. 나\n3. (대사 없음)');
  const script = L.captionScript(d).text;
  const d2 = mkDoc();
  const r = L.assignCaptions(d2, script);
  const c1 = d2.scenes[0].elements.find((e) => e.stCap);
  const c2 = d2.scenes[1].elements.find((e) => e.stCap);
  return c1.text === '가' && d2.scenes[0].speaker === '소년' && c2.text === '나'
    && !d2.scenes[2].elements.some((e) => e.stCap) && r.cleared === 1
    || '왕복 훼손: ' + JSON.stringify([c1 && c1.text, c2 && c2.text]);
});

/* ================================================================
   ⑶ SRT — 씬 길이 누적 시각
   ================================================================ */
sec('3. 자막→SRT 다리 (MK_LIVE.srtScript)');

T('★ 큐 시각이 씬 길이 누적과 일치한다 (자막 없는 씬도 시간은 흐른다)', () => {
  const d = mkDoc();                        /* 3s · 4s · 2.5s */
  L.assignCaptions(d, '1. 가\n2. (대사 없음)\n3. 다');
  const r = L.srtScript(d);
  if (r.cues !== 2) return 'cues=' + r.cues;
  if (!r.text.includes('00:00:00,000 --> 00:00:03,000')) return '1큐 시각 오류\n' + r.text;
  if (!r.text.includes('00:00:07,000 --> 00:00:09,500')) return '2큐가 무자막 씬 시간을 건너뜀\n' + r.text;
  if (r.totalSec !== 9.5) return 'totalSec=' + r.totalSec;
  return true;
});

T('시각 표기가 SRT 규격(HH:MM:SS,mmm)이다 — 61.25초 경계', () => {
  const d = { scenes: [{ duration: 61.25, elements: [{ kind: 'text', stCap: true, text: 'x' }] },
    { duration: 2, elements: [{ kind: 'text', stCap: true, text: 'y' }] }] };
  const r = L.srtScript(d);
  return r.text.includes('00:01:01,250 --> 00:01:03,250') || '분 자리올림 오류\n' + r.text;
});

T('자막 있는 장면이 없으면 cues 0 — 화면이 정직하게 말할 근거', () => {
  const r = L.srtScript({ scenes: [{ duration: 5, elements: [] }] });
  return r.cues === 0 && r.text === '' || JSON.stringify(r);
});

/* ================================================================
   ⑷ 스튜디오 배선 — 화면비·버튼
   ================================================================ */
sec('4. 스튜디오 배선 (screens/studio.js)');

T('★ 화면비 정본: 세로 1080×1920 · 가로 1280×720 · 새 문서 기본 세로', () => {
  if (!/portrait:[^}]*w:\s*1080[^}]*h:\s*1920/.test(ssrc)) return '세로 치수 부재';
  if (!/landscape:[^}]*w:\s*1280[^}]*h:\s*720/.test(ssrc)) return '가로 치수 부재';
  if (!/meta:\s*\{\s*aspect:\s*'portrait'\s*\}/.test(ssrc)) return '새 문서 기본이 세로가 아님';
  return true;
});

T('★ 씬 반입·토글 둘 다 width·height 를 심는다 (render 531행이 읽는 키)', () => {
  if (!/width:\s*a\.w,\s*height:\s*a\.h/.test(ssrc)) return 'addClipScene 이 화면비를 안 심음';
  if (!/sc\.width\s*=\s*a\.w;\s*sc\.height\s*=\s*a\.h/.test(ssrc)) return 'applyAspect 부재';
  if (!ssrc.includes('data-st-aspect')) return '토글 버튼 부재';
  return true;
});

T('대본 일괄·SRT 버튼이 MK_LIVE 다리를 쓴다 (새 엔진 0 원칙)', () => {
  if (!ssrc.includes('data-st-capb') || !ssrc.includes('MK_LIVE.assignCaptions')) return '대본 일괄 배선 부재';
  if (!ssrc.includes('data-st-srt') || !ssrc.includes('MK_LIVE.srtScript')) return 'SRT 배선 부재';
  return true;
});

T('새 자막이 채널 표준(ts-susu)으로 태어난다', () => {
  return /applyPreset\(el,\s*'ts-susu'\)/.test(ssrc) || 'setCaption 기본 스타일 부재';
});

console.log(`\n결과: ${pass} 통과 · ${fail} 실패`);
process.exit(fail ? 1 : 0);
