/* ============================================================
   test-round118.mjs — R118 마지막 카드 5종의 재료 입구
   ------------------------------------------------------------
   R97(dbc30e0) 기록: 「마지막 카드 5종은 tbuild-seed 프리셋이라
   이중 동일 — 미해소」. 실측(R118 해부): 구조·길이·애니는 이미
   갈라져 있었다 — 잔여분은 출력이 아니라 「입구」. 15장 중 tb 프리셋
   4종 + tm-magazine 에 MK_INTAKE.spec 이 없어 재료 블록이 안 그려졌고,
   최악은 beforeafter 계 2장의 「전·후·전·후」 쌍 규칙 소실이었다.

   처방: spec(id) 2단 해석 — ① 직접 SPEC ② comp 구조 판정 위임
   (pairMode → beforeafter · 그 외 → bind 실존 필터). tb id 는
   부팅마다 재생성되므로 id 가 아니라 구조로 판정한다.

   계약:
     ⑴ 직접 spec 10장 종전 바이트 동일 — 위임이 기존 세계를 안 건드림
     ⑵ pairMode 프리셋 2장 → beforeafter note(전·후)·result 위임 실존
     ⑶ slideshow 프리셋 2장 → highlight·outro 필드 + bind 실존 필터
        증명(bind 없는 가짜 comp 는 필드가 안 나옴)
     ⑷ tb id 비결정론 내성 — 다른 id·같은 구조 = 같은 spec (두 부팅 상당)
     ⑸ 패널 렌더 — 프리셋 카드 선택 시 재료 블록 실출현
     ⑹ 빌드 파이프 — highlight/outro 입력 → sc-high·sc-outro 에 실림,
        빈 입력 = 종전과 동일 문서
     ⑺ MK_COMPOSE 부재 폴백 — 종전 동작 유지·무예외
     ⑻ audit 갱신 통과 + tm-magazine 은 outro 만 (highlight 는 거짓말
        이라 안 그림 — 실존 필터의 정직)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.R118_ROOT || path.resolve('.');
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

const IK = w.MK_INTAKE, CO = w.MK_COMPOSE, H = w.MK_VIDHUB;
const img = (n) => ({ name: 'p' + n, kind: 'image', src: 'data:image/png;base64,X' + n });
const byName = (nm) => { const c = CO.listCompositions().find((x) => x.name === nm); return c ? CO.getComposition(c.id) : null; };
const DIRECT10 = ['cx-slideshow', 'cx-story', 'cx-cardnews', 'cx-beforeafter', 'cx-ranking',
  'cx-timeline', 'cx-qa', 'cx-problem', 'cx-review', 'cx-narrative'];
const TB4 = ['느린 필름', '스냅 비트', '차분한 비교', '임팩트 체인지'];
const docSig = (doc) => JSON.stringify(doc.scenes.map((s) => [s.specId,
  s.elements.filter((e) => e.kind === 'text').map((e) => e.text)]));

console.log('--- ⑴ 직접 spec 종전 바이트 동일 ---');
T('T1 종전 10장 — spec(id)가 SPEC[id] 참조 그대로 (위임 우회 0)', () => {
  const bad = DIRECT10.filter((id) => IK.spec(id) !== IK.SPEC[id]);
  return bad.length === 0 ? true : '참조 변경: ' + bad.join(',');
});
T('T2 SPEC 골격 무변경 — 10장 키·note·items 구성 종전 그대로', () => {
  const s = IK.SPEC;
  return Object.keys(s).length === 10 && /전·후/.test(s['cx-beforeafter'].note)
    && s['cx-slideshow'].texts.map((f) => f.key).join(',') === 'highlight,outro'
    && s['cx-qa'].items && !s['cx-problem'].items
    ? true : 'SPEC 골격 변형';
});

console.log('--- ⑵ pairMode 프리셋 → beforeafter 위임 ---');
T('T3 프리셋 4장 전부 등록돼 있고 tb id 는 SPEC 리터럴 키가 아님', () => {
  const comps = TB4.map(byName);
  if (comps.some((c) => !c)) return '미등록: ' + TB4.filter((n, i) => !comps[i]).join(',');
  const leaked = comps.filter((c) => IK.SPEC[c.id]);
  return leaked.length === 0 ? true : 'SPEC 리터럴 오염: ' + leaked.map((c) => c.id).join(',');
});
T('T4 차분한 비교·임팩트 체인지 — pairMode 실림 + note·result 위임', () => {
  for (const nm of ['차분한 비교', '임팩트 체인지']) {
    const c = byName(nm);
    if (c.pairMode !== true) return nm + ': pairMode 없음';
    const sp = IK.spec(c.id);
    if (!sp || sp !== IK.SPEC['cx-beforeafter']) return nm + ': 위임 불발';
    if (!/전·후.*전·후/.test(sp.note)) return nm + ': 쌍 규칙 노트 소실';
    if (!sp.texts.some((f) => f.key === 'result')) return nm + ': result 소실';
  }
  return true;
});
T('T5 result 위임의 구조적 참 — tb 클론에 ba-result 씬(bind:result) 실존', () => {
  const c = byName('차분한 비교');
  const ba = (c.scenes || []).find((s) => s.id === 'ba-result');
  if (!ba) return 'ba-result 씬 소실 — result 필드가 거짓말이 됨';
  const binds = (ba.texts || ba.textSlots || []).map((t) => t.bind);
  return binds.includes('result') ? true : 'bind 소실: ' + binds.join(',');
});

console.log('--- ⑶ slideshow 프리셋 → bind 실존 필터 ---');
T('T6 느린 필름·스냅 비트 — highlight·outro 두 필드 노출', () => {
  for (const nm of ['느린 필름', '스냅 비트']) {
    const c = byName(nm);
    const sp = IK.spec(c.id);
    if (!sp || !sp.texts) return nm + ': spec 없음';
    const keys = sp.texts.map((f) => f.key).sort().join(',');
    if (keys !== 'highlight,outro') return nm + ': ' + keys;
    if (sp.items) return nm + ': items 위임 금지 위반';
  }
  return true;
});
T('T7 bind 실존 필터 증명 — bind 없는 가짜 comp 는 필드가 안 나옴', () => {
  const fake = { id: '__r118-fake', name: '가짜', scenes: [{ id: 's1', role: 'media' }] };
  if (IK.specForComp(fake) !== null) return '무 bind 인데 spec 반환';
  CO.registerComposition(fake);
  const viaId = IK.spec('__r118-fake');
  CO.unregisterComposition('__r118-fake');
  return viaId === null ? true : '등록 경유에서 가짜 필드 노출';
});
T('T8 부분 실존 — outro 만 있는 comp 는 outro 필드만', () => {
  const sp = IK.specForComp({ scenes: [{ texts: [{ bind: 'outro' }, { bind: 'title' }] }] });
  return sp && sp.texts.length === 1 && sp.texts[0].key === 'outro'
    ? true : JSON.stringify(sp);
});
T('T9 textSlots·layoutByRatio 경로도 훑음 (compileScene 산출 형태)', () => {
  const a = IK.specForComp({ scenes: [{ textSlots: [{ bind: 'highlight' }] }] });
  const b = IK.specForComp({ scenes: [{ layoutByRatio: { '9:16': { textSlots: [{ bind: 'outro' }] } } }] });
  return a && a.texts[0].key === 'highlight' && b && b.texts[0].key === 'outro'
    ? true : JSON.stringify({ a, b });
});

console.log('--- ⑷ tb id 비결정론 내성 ---');
T('T10 다른 id·같은 구조 = 같은 spec (두 부팅 상당)', () => {
  const real = byName('스냅 비트');
  const clone = JSON.parse(JSON.stringify(real)); clone.id = '__r118-otherboot'; clone.hidden = true;
  CO.registerComposition(clone);
  const a = IK.spec(real.id), b = IK.spec('__r118-otherboot');
  CO.unregisterComposition('__r118-otherboot');
  return JSON.stringify(a) === JSON.stringify(b) ? true : 'id 의존 판정';
});
T('T11 intake.js 소스에 tb 휘발 id 리터럴 없음 (주석 제외 코드 검사)', () => {
  const code = read('data/intake.js').replace(/\/\*[\s\S]*?\*\//g, '');
  return /msqx|['"]tb-/.test(code) ? 'tb 휘발 id 리터럴 발견' : true;
});

console.log('--- ⑸ 패널 렌더 ---');
T('T12 스냅 비트 선택 → highlight·outro 입력 필드 실출현', () => {
  const c = byName('스냅 비트');
  w.PG.go('video'); H.select(c.id); w.PG.go('video');
  const keys = [...w.document.querySelectorAll('[data-vh-extra]')].map((n) => n.dataset.vhExtra).sort().join(',');
  const ta = w.document.querySelector('#vhItems');
  return keys === 'highlight,outro' && !ta ? true : JSON.stringify({ keys, ta: !!ta });
});
T('T13 임팩트 체인지 선택 → 전·후 쌍 규칙 안내문 + result 필드', () => {
  const prev = byName('스냅 비트'), c = byName('임팩트 체인지');
  H.select(prev.id); /* 해제 */ H.select(c.id); w.PG.go('video');
  const note = [...w.document.querySelectorAll('.vh-panel .ed-note')].some((n) => /전·후/.test(n.textContent));
  const keys = [...w.document.querySelectorAll('[data-vh-extra]')].map((n) => n.dataset.vhExtra);
  return note && keys.includes('result') ? true : JSON.stringify({ note, keys });
});
T('T14 tm-magazine 선택 → outro 만 (highlight 거짓 필드 없음)', () => {
  const prev = byName('임팩트 체인지');
  H.select(prev.id); H.select('tm-magazine'); w.PG.go('video');
  const keys = [...w.document.querySelectorAll('[data-vh-extra]')].map((n) => n.dataset.vhExtra);
  return keys.join(',') === 'outro' ? true : JSON.stringify(keys);
});

console.log('--- ⑹ 빌드 파이프 ---');
T('T15 스냅 비트 + highlight/outro 입력 → sc-high·sc-outro 에 실림', () => {
  const prev = 'tm-magazine', c = byName('스냅 비트');
  H.select(prev); H.select(c.id);
  H.st.title = '운동회'; H.st.extra.highlight = '이어달리기 역전'; H.st.extra.outro = '고마워요';
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why || 'build 실패';
  const hi = r.doc.scenes.find((s) => s.specId === 'sc-high');
  const ou = r.doc.scenes.find((s) => s.specId === 'sc-outro');
  const hiT = hi && hi.elements.filter((e) => e.kind === 'text').map((e) => e.text).join('');
  const ouT = ou && ou.elements.filter((e) => e.kind === 'text').map((e) => e.text).join('');
  return hi && ou && /이어달리기 역전/.test(hiT) && /고마워요/.test(ouT)
    ? true : JSON.stringify({ hi: !!hi, ou: !!ou, hiT, ouT });
});
T('T16 빈 입력 = 종전 문서 — 직접 buildProject 와 씬·텍스트 서명 동일', () => {
  const c = byName('스냅 비트');
  H.select(c.id); H.select(c.id); /* 재선택으로 재료 리셋 */
  H.st.title = '운동회'; H.st.extra = {};
  const r = H.startBuild([img(1), img(2), img(3)]);
  if (!r.ok) return r.why || 'build 실패';
  const base = CO.buildProject(c.id, H.st.theme, { medias: [img(1), img(2), img(3)], texts: { title: '운동회' }, ...(H.st.ratio ? { ratio: H.st.ratio } : {}) });
  if (!base.ok) return 'base build 실패';
  return docSig(r.doc) === docSig(base.doc) ? true : '빈 입력이 종전과 다른 문서를 만듦';
});
T('T17 빈 입력엔 sc-high 미출현 (needs 규약 그대로)', () => {
  const c = byName('느린 필름');
  H.select(byName('스냅 비트').id); H.select(c.id);
  H.st.title = '봄'; H.st.extra = {};
  const r = H.startBuild([img(1), img(2)]);
  if (!r.ok) return r.why || 'build 실패';
  return r.doc.scenes.some((s) => s.specId === 'sc-high') ? 'highlight 없이 sc-high 출현' : true;
});

console.log('--- ⑺ MK_COMPOSE 부재 폴백 ---');
T('T18 부재 시 — 직접 spec 유지·미지 id 는 null·무예외', () => {
  const saved = w.MK_COMPOSE;
  try {
    w.MK_COMPOSE = undefined;
    const direct = IK.spec('cx-qa') === IK.SPEC['cx-qa'];
    const unknown = IK.spec('__nope') === null;
    return direct && unknown ? true : JSON.stringify({ direct, unknown });
  } finally { w.MK_COMPOSE = saved; }
});

console.log('--- ⑻ audit · tm-magazine 정직 ---');
T('T19 audit 통과 (R118 위임 검증 포함)', () => {
  const a = IK.audit();
  return a.ok ? true : a.violations.join(', ');
});
T('T20 tm-magazine spec — outro 실존·highlight 필터됨 (bind 실측 일치)', () => {
  const sp = IK.spec('tm-magazine');
  if (!sp || !sp.texts) return 'spec 없음';
  const keys = sp.texts.map((f) => f.key);
  const comp = CO.getComposition('tm-magazine');
  const binds = new Set();
  for (const sc of comp.scenes) for (const t of (sc.texts || sc.textSlots || [])) if (t.bind) binds.add(t.bind);
  if (keys.includes('highlight')) return 'highlight 거짓 필드';
  return keys.join(',') === 'outro' && binds.has('outro') && !binds.has('highlight')
    ? true : JSON.stringify({ keys, binds: [...binds] });
});
T('T21 15장 전수 — spec 있는 카드의 texts 키는 전부 bind 실존 (거짓말 0)', () => {
  const lies = [];
  for (const { id } of CO.listCompositions()) {
    if (IK.SPEC[id]) continue; /* 직접 spec 은 R97 세계 — 이 계약의 표적 아님 */
    const sp = IK.spec(id);
    if (!sp || !sp.texts || sp === IK.SPEC['cx-beforeafter']) continue; /* pairMode 위임은 T5 가 고정 */
    const comp = CO.getComposition(id);
    const binds = new Set();
    for (const sc of comp.scenes || []) {
      for (const t of (sc.texts || []).concat(sc.textSlots || [])) if (t.bind) binds.add(t.bind);
      if (sc.layoutByRatio) for (const d of Object.values(sc.layoutByRatio)) for (const t of (d && d.textSlots) || []) if (t.bind) binds.add(t.bind);
    }
    for (const f of sp.texts) if (!binds.has(f.key)) lies.push(id + ':' + f.key);
  }
  return lies.length === 0 ? true : lies.join(', ');
});

console.log(`\nR118: ${pass}/${pass + fail}${fail ? '  ← FAIL ' + fail : '  ALL PASS'}`);
process.exit(fail ? 1 : 0);
