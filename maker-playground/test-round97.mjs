/* ============================================================
   test-round97.mjs — R97 구조가 제 재료를 요구한다
   ------------------------------------------------------------
   준호 관찰: 구조 템플릿이 「들어가 보면 다 똑같다」. 해부 —
   정의부 문법은 실제로 다른데(번호 카드·문답·역순 순위·훅/지표),
   만들기 패널이 15종 전부에게 사진+제목+부제만 먹여서 items 구조
   전부가 사진 폴백으로 수렴했다. R97 = MK_INTAKE(컴포지션별 재료
   명세+순수 파서) + 패널의 구조별 「내용」 블록. 엔진 무수정.

   계약:
     ① MK_INTAKE 순수 — headbody·qa·body·step 파싱, 전각 경계,
        빈 줄·상한, audit
     ② 패널 — 카드뉴스 선택 시 items 텍스트영역 노출, 문제→해결은
        텍스트 필드만(items 없음), 전후는 순서 안내문, 구조 전환 시
        재료 리셋
     ③ 빌드 관통 — 카드뉴스에 3줄 입력 → 카드 3장에 그 문장이 실림
        (사진 0장, needsMedia false 경로)
     ④ 구조 차별성 실증 — 같은 사진 3장으로 슬라이드쇼 vs 랭킹
        (items 3줄) 빌드 → 장면 role 구성이 달라진다 (동질화 해소의
        직접 증거)
     ⑤ Q&A 관통 — 「질문? 답변」이 q/a 슬롯에 갈라져 실림
     ⑥ 빈 입력 회귀 — 재료를 안 쓰면 종전과 동일 빌드 (barren 세계
        와 장면 수·구성 일치)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R97_ROOT || path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/video', pretendToBeVisual: true });
const w = dom.window;
w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: {
  getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
for (const f of [...read('index.html').matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) {
  try { w.eval(read(f)); } catch (e) {}
}
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));

let pass = 0, fail = 0;
const T = (name, fn) => {
  try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + '  → ' + r); } }
  catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message); }
};

const IK = w.MK_INTAKE, H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const sceneTexts = (doc) => doc.scenes.map((s) => s.elements.filter((e) => e.kind === 'text').map((e) => e.text).join('|'));
const roles = (doc) => doc.scenes.map((s) => s.meta && s.meta.role || s.name).join(',');

console.log('--- ① MK_INTAKE 순수 ---');
T('T1 모듈 존재 + audit 통과', () => {
  if (!IK) return 'MK_INTAKE 없음';
  const a = IK.audit(); return a.ok ? true : a.violations.join(', ');
});
T('T2 headbody — 콜론 분리·전각 콜론·콜론 없음·빈 줄 무시', () => {
  const r = IK.parseItems('headbody', '이름: 설명\n전각：설명2\n이름만\n\n  \n');
  return r.length === 3 && r[0].head === '이름' && r[0].body === '설명'
    && r[1].head === '전각' && r[1].body === '설명2'
    && r[2].head === '이름만' && r[2].body == null ? true : JSON.stringify(r);
});
T('T3 qa — 물음표 경계(반각·전각)·슬래시 폴백·경계 없음', () => {
  const r = IK.parseItems('qa', '기억은? 운동회요\n전각은？ 답\n질문 / 답변\n경계없음');
  return r[0].q === '기억은?' && r[0].a === '운동회요'
    && r[1].q === '전각은？' && r[1].a === '답'
    && r[2].q === '질문' && r[2].a === '답변'
    && r[3].q === '경계없음' && r[3].a == null ? true : JSON.stringify(r);
});
T('T4 body·step·상한 24', () => {
  const b = IK.parseItems('body', '한 장\n두 장');
  const s = IK.parseItems('step', '걸음');
  const cap = IK.parseItems('body', Array.from({ length: 40 }, (_, i) => 'x' + i).join('\n'));
  return b[1].body === '두 장' && s[0].step === '걸음' && cap.length === 24 ? true
    : JSON.stringify([b, s, cap.length]);
});

console.log('--- ② 패널 ---');
T('T5 카드뉴스 선택 → items 텍스트영역 + 추가 필드 노출', () => {
  w.PG.go('video');
  H.select('cx-cardnews');
  w.MK_SCREENS.video.mount ? null : null;
  w.PG.go('video'); /* 재렌더 */
  const ta = w.document.querySelector('#vhItems');
  const ex = w.document.querySelectorAll('[data-vh-extra]');
  return ta && ex.length >= 2 ? true : JSON.stringify({ ta: !!ta, ex: ex.length });
});
T('T6 문제→해결 — items 없음·텍스트 필드 4종(훅·문제·해결·숫자)', () => {
  H.select('cx-cardnews'); /* 해제 */
  H.select('cx-problem');
  w.PG.go('video');
  const ta = w.document.querySelector('#vhItems');
  const keys = [...w.document.querySelectorAll('[data-vh-extra]')].map((n) => n.dataset.vhExtra);
  return !ta && keys.includes('hook') && keys.includes('problem') && keys.includes('solution') && keys.includes('metric')
    ? true : JSON.stringify({ ta: !!ta, keys });
});
T('T7 전후 — 순서 안내문 노출·구조 전환 시 재료 리셋', () => {
  H.st.itemsRaw = '남은 재료'; H.st.extra.hook = '남은 값';
  H.select('cx-problem'); /* 해제 */
  H.select('cx-beforeafter');
  w.PG.go('video');
  const note = [...w.document.querySelectorAll('.vh-panel .ed-note')].some((n) => /전·후/.test(n.textContent));
  return note && H.st.itemsRaw === '' && !H.st.extra.hook ? true
    : JSON.stringify({ note, raw: H.st.itemsRaw, extra: H.st.extra });
});

console.log('--- ③~⑥ 빌드 관통 ---');
T('T8 카드뉴스 3줄 → 카드 3장에 그 문장 (사진 0장)', () => {
  H.select('cx-beforeafter'); /* 해제 */
  H.select('cx-cardnews');
  H.st.title = '알림'; H.st.itemsRaw = '첫 소식\n둘째 소식\n셋째 소식';
  const r = H.startBuild([]);
  if (!r.ok) return r.why || 'build 실패';
  const joined = sceneTexts(r.doc).join(' § ');
  const cards = r.doc.scenes.filter((s) => /첫 소식|둘째 소식|셋째 소식/.test(
    s.elements.filter((e) => e.kind === 'text').map((e) => e.text).join('')));
  return cards.length === 3 && /첫 소식/.test(joined) && /셋째 소식/.test(joined) ? true
    : JSON.stringify({ cards: cards.length, joined: joined.slice(0, 120) });
});
T('T9 Q&A — 「질문? 답변」이 q·a 슬롯으로 갈라져 실림', () => {
  H.select('cx-cardnews'); H.select('cx-qa');
  H.st.title = '인터뷰'; H.st.itemsRaw = '기억에 남는 날은? 운동회 날이요';
  H.st.extra.guest = '3반 어린이';
  const r = H.startBuild([]);
  if (!r.ok) return r.why;
  const joined = sceneTexts(r.doc).join(' § ');
  return /기억에 남는 날은\?/.test(joined) && /운동회 날이요/.test(joined) && /3반 어린이/.test(joined)
    ? true : joined.slice(0, 160);
});
T('T10 구조 차별성 — 같은 사진 3장, 슬라이드쇼 vs 랭킹(3줄) 장면 구성이 다르다', () => {
  H.select('cx-qa'); H.select('cx-slideshow');
  H.st.title = '비교'; H.st.itemsRaw = '';
  const a = H.startBuild([img(1), img(2), img(3)]);
  if (!a.ok) return 'slideshow ' + a.why;
  H.select('cx-slideshow'); H.select('cx-ranking');
  H.st.title = '비교'; H.st.itemsRaw = '동메달: 셋째\n은메달: 둘째\n금메달: 첫째';
  const b = H.startBuild([img(1), img(2), img(3)]);
  if (!b.ok) return 'ranking ' + b.why;
  const ja = sceneTexts(a.doc).join(' § '), jb = sceneTexts(b.doc).join(' § ');
  const distinct = roles(a.doc) !== roles(b.doc) || ja !== jb;
  return distinct && /금메달/.test(jb) && !/금메달/.test(ja) ? true
    : JSON.stringify({ ra: roles(a.doc), rb: roles(b.doc) });
});
T('T11 빈 입력 회귀 — 재료 미사용 빌드 = 종전 동작(장면 수·텍스트 동일)', () => {
  H.select('cx-ranking'); H.select('cx-cardnews');
  H.st.title = '회귀'; H.st.itemsRaw = ''; H.st.extra = {};
  const now = H.startBuild([img(1), img(2)]);
  if (!now.ok) return now.why;
  /* 종전 세계 = 엔진 직접 호출(items 없이) — 입구 무수정 시 결과와 동일해야 */
  const bare = w.MK_COMPOSE.buildProject('cx-cardnews', H.st.theme, { medias: [img(1), img(2)], texts: { title: '회귀' }, ratio: H.st.ratio });
  if (!bare.ok) return 'bare ' + bare.why;
  const a = sceneTexts(now.doc).join('§'), b = sceneTexts(bare.doc).join('§');
  return now.doc.scenes.length === bare.doc.scenes.length && a === b ? true
    : JSON.stringify({ n1: now.doc.scenes.length, n2: bare.doc.scenes.length });
});

console.log(`\n=== R97: ${pass} 통과 · ${fail} 실패 ===`);
process.exit(fail ? 1 : 0);
