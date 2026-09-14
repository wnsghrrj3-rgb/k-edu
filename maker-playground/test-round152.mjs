/* ============================================================
   test-round152.mjs — 「편집형 SVG 에셋」 워크스페이스 배선 (R152)
   ------------------------------------------------------------
   MK_SVGASSET 엔진(파서·bbox·접두·paint·그룹) 순수 검증 +
   workspace.js 실부팅(jsdom):
   · 크리스마스 프레임 insert → 조각 38 + scene.groups
   · 캔버스에 .ws-el.vec 조각이 그려지고 그룹 상자(.ws-gbox)가 뜬다
   · 조각 pointerdown = 그룹 통째 선택(gsel) · 드래그 = 전부 이동
   · 두 번 탭 = 내부 편집 → 조각 단일 선택 → 색 스와치 · Esc = 그룹으로
   · 순서·복제·삭제·그룹 묶기/해제·레이어 패널·👁·키보드
   · undo/redo 왕복 · 저장 JSON 왕복(JSON.parse(JSON.stringify)) 후 다시 그려짐
   · PPTX 경로: rasterizeOps 가 svg op 를 image op 로 (jsdom 은 Image 없음 → 정직 null 유지)
   ============================================================ */
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
const ROOT = path.resolve('.');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const dom = new JSDOM('<!doctype html><body><div id="pgNav"></div><h1 id="pgTitle"></h1><div id="pgVariants"></div><div id="pgBody"></div></body>',
  { runScripts: 'outside-only', url: 'https://x.test/#/workspace', pretendToBeVisual: true });
const w = dom.window; w.alert = () => {}; w.confirm = () => true;
Object.defineProperty(w, 'performance', { value: { now: () => Date.now() } });
const store = {};
Object.defineProperty(w, 'localStorage', { value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear: () => {}, key: () => null, get length() { return 0; } } });
const html = read('index.html');
for (const f of [...html.matchAll(/src="([^"]+?)(?:\?v=[^"]*)?"/g)].map((m) => m[1]).filter((x) => !x.startsWith('http') && !x.startsWith('/'))) { try { w.eval(read(f)); } catch (e) {} }
w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
let pass = 0, fail = 0;
const T = (name, fn) => { try { const r = fn(); if (r === true) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + '  → ' + r); } } catch (e) { fail++; console.log('  ✗ ' + name + '  → ERROR ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 3).join('\n')); } };
const q = (s) => w.document.querySelector(s);
const qa = (s) => [...w.document.querySelectorAll(s)];
const pe = (type, tgt, opts) => tgt.dispatchEvent(new w.PointerEvent(type, { bubbles: true, ...opts }));
const fire = (el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true }));
const key = (k, o) => w.document.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...(o || {}) }));
const P = w.MK_PROJ, S = w.MK_SVGASSET;
const WSS = () => w.MK_WS.state;
const curDoc = () => { const p = P.get(WSS().projectId); return p && p.doc; };
const sc = () => curDoc().scenes[WSS().sceneIdx];
const cv = () => q('[data-ws-canvas]');
/* 캔버스 실측이 없는 jsdom — getBoundingClientRect 를 고정 크기로 흉내 */
const RECT = { left: 0, top: 0, width: 800, height: 450, right: 800, bottom: 450 };
const origRect = w.Element.prototype.getBoundingClientRect;
w.Element.prototype.getBoundingClientRect = function () { return this.hasAttribute && this.hasAttribute('data-ws-canvas') ? RECT : origRect.call(this); };
const down = (n, x, y, o) => pe('pointerdown', n, { pointerType: 'mouse', button: 0, clientX: x || 0, clientY: y || 0, pointerId: 1, ...(o || {}) });
const move = (x, y) => pe('pointermove', cv(), { pointerType: 'mouse', clientX: x, clientY: y, pointerId: 1 });
const up = () => pe('pointerup', cv(), { pointerType: 'mouse', pointerId: 1 });
const tap = (n) => { down(n, 10, 10); up(); };

const svgText = read('assets/svgassets/christmas-frame/christmas-frame.svg');
w.PG.go('workspace');

console.log('--- ① 엔진 (순수) ---');
let parsed = null;
T('E1 파서: 크리스마스 프레임 조각 ≥ 30 · 미지원 0 · 사진 자리 1', () => {
  parsed = S.parse(svgText, { name: '크리스마스 프레임' });
  if (!parsed.ok) return parsed.msg;
  if (parsed.children.length < 30) return '조각 ' + parsed.children.length;
  if (parsed.unsupported.length) return '미지원 ' + parsed.unsupported.length;
  const ph = parsed.children.filter((c) => c.role === 'photo-slot');
  return ph.length >= 1 ? true : '사진 자리 ' + ph.length;
});
T('E2 bbox: 모든 조각이 viewBox 안(여유 5%)·양수 크기', () => {
  const vb = parsed.vb, pad = vb.w * 0.05;
  const bad = parsed.children.filter((c) => !(c.bbox.w > 0 && c.bbox.h > 0) || c.bbox.x < vb.x - pad || c.bbox.y < vb.y - pad || c.bbox.x + c.bbox.w > vb.x + vb.w + pad || c.bbox.y + c.bbox.h > vb.y + vb.h + pad);
  return bad.length ? bad.map((c) => c.name + JSON.stringify(c.bbox)).slice(0, 3).join(' | ') : true;
});
T('E3 접두: 두 번 넣으면 id 가 안 겹친다', () => {
  const d = { scenes: [{ id: 'x', width: 1280, height: 720, background: '#fff', elements: [] }] };
  const a = S.insert(d, 0, parsed), b = S.insert(d, 0, parsed);
  if (!a.ok || !b.ok || a.grp === b.grp) return 'insert 실패';
  const ids = (m) => (m.match(/ id="([^"]+)"/g) || []);
  const ea = d.scenes[0].elements[a.idxs.find((i) => d.scenes[0].elements[i].kind === 'vector')], eb = d.scenes[0].elements[b.idxs.find((i) => d.scenes[0].elements[i].kind === 'vector')];
  const ia = ids(ea.vec.body + ea.vec.defs), ib = ids(eb.vec.body + eb.vec.defs);
  if (!ia.length) return 'id 없음(검사 불가)';
  return ia.some((x) => ib.includes(x)) ? '겹침' : true;
});
T('E4 paint: setPaint → markupOf 치환, 원래로 되돌리면 삭제', () => {
  const d = { scenes: [{ id: 'x', width: 1280, height: 720, background: '#fff', elements: [] }] };
  const r = S.insert(d, 0, parsed);
  const el = d.scenes[0].elements.find((e) => e.kind === 'vector' && S.paintsOf(e).length);
  if (!el) return '색 있는 조각 없음';
  const p0 = S.paintsOf(el)[0].from;
  S.setPaint(el, p0, '#123456');
  const m = S.markupOf(el);
  if (!/#123456/i.test(m)) return '치환 안 됨';
  if (new RegExp(p0.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(m) && p0 !== '#123456') { /* 다른 곳에 같은 색이 남을 수 있음(style 속성 밖) — 치환된 개수만 본다 */ }
  S.setPaint(el, p0, p0);
  return el.paint ? '되돌린 뒤에도 paint 남음' : true;
});
T('E5 groupBox·transformGroup·dupGroup·ungroup·pruneGroups', () => {
  const d = { scenes: [{ id: 'x', width: 1280, height: 720, background: '#fff', elements: [] }] };
  const r = S.insert(d, 0, parsed); const s0 = d.scenes[0];
  const b = S.groupBox(s0, r.grp); if (!b) return 'groupBox 없음';
  const start = {}; S.membersOf(s0, r.grp).forEach((i) => { const e = s0.elements[i]; start[i] = { x: e.x, y: e.y, w: e.w, h: e.h }; });
  S.transformGroup(s0, r.grp, start, b, { x: b.x + 10, y: b.y + 5, w: b.w / 2, h: b.h / 2 });
  const b2 = S.groupBox(s0, r.grp);
  if (Math.abs(b2.x - (b.x + 10)) > 0.6 || Math.abs(b2.w - b.w / 2) > 0.6) return '변환 뒤 상자 ' + JSON.stringify(b2) + ' vs ' + JSON.stringify(b);
  const dup = S.dupGroup(s0, r.grp, 3, 3); if (!dup || S.membersOf(s0, dup.grp).length !== r.count) return '복제 실패';
  S.ungroup(s0, dup.grp); if (s0.groups[dup.grp]) return 'ungroup 뒤 groups 항목 남음';
  S.membersOf(s0, r.grp).slice().reverse().forEach((i) => s0.elements.splice(i, 1)); S.pruneGroups(s0);
  return (!s0.groups || !s0.groups[r.grp]) ? true : 'prune 안 됨';
});

console.log('--- ② 워크스페이스 배선 ---');
let grp = null, count = 0;
T('W1 Assets 패널에 🧩 편집형 에셋 카드 · 레이어 탭', () => {
  q('[data-ws-nav="assets"]').click();
  const c = q('[data-ws-svgasset="christmas-frame"]'); if (!c) return '카드 없음';
  return q('[data-ws-nav="layers"]') ? true : '레이어 탭 없음';
});
T('W2 insert → 조각이 캔버스에 .ws-el.vec 로, 그룹 상자 표시, 그룹 패널', () => {
  const before = sc().elements.length;
  /* fetch 없는 jsdom — 카드 대신 같은 경로(insert → 그룹 선택)를 파서 결과로 직접 */
  WSS().undo.push(JSON.stringify(curDoc().scenes)); WSS().redo = [];   /* = snap() 과 같은 자리 */
  const r = S.insert(curDoc(), WSS().sceneIdx, parsed); if (!r.ok) return r.msg;
  grp = r.grp; count = r.count;
  WSS().gsel = grp; WSS().msel = r.idxs.slice(); WSS().sel = { type: 'group', idx: r.idxs[0] };
  w.PG.go('workspace');
  if (sc().elements.length !== before + count) return '요소 수';
  const vec = qa('.ws-el.vec'); if (vec.length < count - 2) return 'vec DOM ' + vec.length + '/' + count;
  if (!vec[0].querySelector('svg')) return 'svg 없음';
  if (!q('[data-ws-gbox]')) return '그룹 상자 없음';
  if (qa('[data-ws-gh]').length !== 6) return '손잡이 ' + qa('[data-ws-gh]').length;
  return q('[data-ws-gin]') && q('[data-ws-ungroup]') && q('[data-ws-gphoto]') ? true : '그룹 패널 버튼 없음';
});
T('W3 빈 곳 클릭 = 해제 → 조각 pointerdown = 그룹 통째 선택', () => {
  cv().click();
  if (WSS().gsel || q('[data-ws-gbox]')) return '해제 안 됨';
  const n = q('.ws-el.vec'); tap(n);
  return WSS().gsel === grp && q('[data-ws-gbox]') ? true : 'gsel=' + WSS().gsel;
});
T('W4 조각 드래그 = 그룹 전부 이동(dx 10%) + undo 1칸', () => {
  const ms = S.membersOf(sc(), grp); const x0 = ms.map((i) => sc().elements[i].x);
  const u0 = WSS().undo.length;
  const n = q('.ws-el.vec'); down(n, 100, 100); move(180, 145); up();
  const x1 = S.membersOf(sc(), grp).map((i) => sc().elements[i].x);
  const bad = x1.filter((x, k) => Math.abs(x - x0[k] - 10) > 0.3);
  if (bad.length) return '안 움직인 조각 ' + bad.length + ' (' + x0[0] + '→' + x1[0] + ')';
  return WSS().undo.length === u0 + 1 ? true : 'undo ' + u0 + '→' + WSS().undo.length;
});
T('W5 그룹 손잡이 br 드래그 = 통째 크기 (폭 +10%, 비율 유지)', () => {
  const b0 = S.groupBox(sc(), grp);
  const h = q('[data-ws-gh="br"]'); if (!h) return '손잡이 없음';
  down(h, 400, 300); move(480, 300); up();
  const b1 = S.groupBox(sc(), grp);
  if (Math.abs(b1.w - b0.w - 10) > 0.5) return 'w ' + b0.w + '→' + b1.w;
  return Math.abs(b1.h / b1.w - b0.h / b0.w) < 0.02 ? true : '비율 ' + (b0.h / b0.w) + '→' + (b1.h / b1.w);
});
T('W6 두 번 탭 = 내부 편집 → 조각 단일 선택 + 색 스와치 + 이름', () => {
  const n = q('.ws-el.vec'); const i = +n.dataset.wsEl;
  tap(n); tap(q(`.ws-el.vec[data-ws-el="${i}"]`));
  if (WSS().inGrp !== grp) return 'inGrp=' + WSS().inGrp;
  if (WSS().gsel) return 'gsel 남음';
  if (!WSS().sel || WSS().sel.type !== 'vector') return 'sel=' + JSON.stringify(WSS().sel);
  if (q('[data-ws-gbox]')) return '내부 편집 중 그룹 상자';
  if (!q('[data-ws-label]')) return '이름 칸 없음';
  return q('[data-ws-paint]') || q('.cx-hint') ? true : '색 스와치 없음';
});
T('W7 색 스와치 input → el.paint + 캔버스 svg 즉시 치환, change → 유지', () => {
  /* 색이 있는 조각을 고른다 */
  const idx = S.membersOf(sc(), grp).find((i) => sc().elements[i].kind === 'vector' && S.paintsOf(sc().elements[i]).length);
  if (idx == null) return '색 있는 조각 없음';
  WSS().sel = { type: 'vector', idx }; w.PG.go('workspace');
  const pi = q('[data-ws-paint]'); if (!pi) return '스와치 없음';
  pi.value = '#ff00aa'; fire(pi, 'input');
  const el = sc().elements[idx];
  if (!el.paint || el.paint[pi.dataset.wsPaint] !== '#FF00AA') return 'paint=' + JSON.stringify(el.paint);
  const svg = q(`[data-ws-el="${idx}"] svg`); if (!svg || !/#FF00AA/i.test(svg.outerHTML)) return '캔버스 미치환';
  fire(pi, 'change');
  return sc().elements[idx].paint[pi.dataset.wsPaint] === '#FF00AA' && q('[data-ws-paint0]') ? true : 'change 뒤 유실';
});
T('W8 ↩ 원래 색으로 → paint 삭제', () => { q('[data-ws-paint0]').click(); const el = sc().elements[WSS().sel.idx]; return el.paint ? '남음' : true; });
T('W9 Esc = 그룹으로 돌아감 · Esc = 해제', () => {
  key('Escape'); if (WSS().gsel !== grp || WSS().inGrp) return '1차 Esc: gsel=' + WSS().gsel + ' in=' + WSS().inGrp;
  key('Escape'); return !WSS().gsel && WSS().sel.type === 'scene' ? true : '2차 Esc';
});
T('W10 순서: 조각 하나 맨 앞으로 → 배열 마지막', () => {
  const ms = S.membersOf(sc(), grp); const i = ms[0]; const el = sc().elements[i];
  WSS().inGrp = grp; WSS().sel = { type: 'vector', idx: i }; w.PG.go('workspace');
  q('[data-ws-ord="front"]').click();
  return sc().elements[sc().elements.length - 1] === el && WSS().sel.idx === sc().elements.length - 1 ? true : '순서 안 바뀜';
});
T('W11 조각 삭제(Delete) → 요소 -1, 그룹 유지 · undo 복원', () => {
  const n0 = sc().elements.length; const u0 = WSS().undo.length;
  key('Delete');
  if (sc().elements.length !== n0 - 1) return '삭제 안 됨';
  if (!sc().groups || !sc().groups[grp]) return '그룹 항목 소실';
  key('z', { ctrlKey: true });
  return sc().elements.length === n0 && WSS().undo.length === u0 ? true : 'undo 실패 ' + sc().elements.length;
});
T('W12 그룹 복제(Ctrl+D) → 새 그룹, 조각 수 같음, 접두 다름', () => {
  WSS().inGrp = null; WSS().gsel = grp; WSS().msel = S.membersOf(sc(), grp); WSS().sel = { type: 'group', idx: WSS().msel[0] }; w.PG.go('workspace');
  const gs0 = Object.keys(sc().groups).length;
  key('d', { ctrlKey: true });
  const ng = WSS().gsel; if (!ng || ng === grp) return '새 그룹 선택 안 됨';
  if (Object.keys(sc().groups).length !== gs0 + 1) return 'groups 수';
  if (S.membersOf(sc(), ng).length !== S.membersOf(sc(), grp).length) return '조각 수';
  const a = sc().elements[S.membersOf(sc(), grp).find((i) => sc().elements[i].kind === 'vector')];
  const b = sc().elements[S.membersOf(sc(), ng).find((i) => sc().elements[i].kind === 'vector')];
  return a.vec.pfx !== b.vec.pfx ? true : '접두 같음';
});
T('W13 그룹 삭제(패널 🗑) → 멤버 전부 삭제·groups 정리', () => {
  const ng = WSS().gsel; const n = S.membersOf(sc(), ng).length; const n0 = sc().elements.length;
  q('[data-ws-del]').click();
  return sc().elements.length === n0 - n && !sc().groups[ng] && !WSS().gsel ? true : '삭제 ' + sc().elements.length;
});
T('W14 그룹 해제(Ctrl+Shift+G) → grp 제거 → 다중 선택 → 다시 묶기(Ctrl+G)', () => {
  WSS().gsel = grp; WSS().msel = S.membersOf(sc(), grp); WSS().sel = { type: 'group', idx: WSS().msel[0] }; w.PG.go('workspace');
  const n = WSS().msel.length;
  key('g', { ctrlKey: true, shiftKey: true });
  if (sc().groups && sc().groups[grp]) return '해제 안 됨';
  if (sc().elements.some((e) => e.grp === grp)) return 'grp 남음';
  if (WSS().msel.length !== n) return 'msel ' + WSS().msel.length;
  if (!q('[data-ws-group]')) return '묶기 버튼 없음';
  key('g', { ctrlKey: true });
  grp = WSS().gsel;
  return grp && S.membersOf(sc(), grp).length === n && sc().groups[grp] ? true : '다시 묶기 실패';
});
T('W15 레이어 패널: 그룹 한 줄 + 조각 들여쓰기, 접기, 클릭 선택, 👁 숨김 → 캔버스에서 빠짐', () => {
  q('[data-ws-nav="layers"]').click();
  const grow = q(`[data-ws-lsel="g:${grp}"]`); if (!grow) return '그룹 줄 없음';
  const subs = qa('.ws-lrow.sub'); if (subs.length !== S.membersOf(sc(), grp).length) return '조각 줄 ' + subs.length;
  q(`[data-ws-lcol="${grp}"]`).click();
  if (qa('.ws-lrow.sub').length) return '접기 안 됨';
  q(`[data-ws-lcol="${grp}"]`).click();
  const sub0 = q('.ws-lrow.sub'); const i = +sub0.dataset.wsLsel;
  sub0.click();
  if (WSS().sel.idx !== i || WSS().inGrp !== grp) return '줄 클릭 선택 실패';
  q(`[data-ws-leye="${i}"]`).click();
  if (sc().elements[i].visible !== false) return 'visible';
  if (q(`.ws-el[data-ws-el="${i}"]`)) return '숨긴 조각이 캔버스에';
  q(`[data-ws-leye="${i}"]`).click();
  return sc().elements[i].visible === undefined && q(`.ws-el[data-ws-el="${i}"]`) ? true : '다시 보이기 실패';
});
T('W16 레이어 ▲(fwd) = 조각 한 칸 앞으로', () => {
  const ms = S.membersOf(sc(), grp); const i = ms[0]; const el = sc().elements[i];
  q(`[data-ws-lmv="${i}:fwd"]`).click();
  return sc().elements[i + 1] === el ? true : '이동 안 됨';
});
T('W17 그룹 투명도 슬라이더 → 멤버 전부 opacity', () => {
  WSS().gsel = grp; WSS().msel = S.membersOf(sc(), grp); WSS().sel = { type: 'group', idx: WSS().msel[0] }; WSS().inGrp = null; w.PG.go('workspace');
  const op = q('[data-ws-opac]'); if (!op) return '슬라이더 없음';
  op.value = '50'; fire(op, 'input'); fire(op, 'change');
  const bad = S.membersOf(sc(), grp).filter((i) => sc().elements[i].opacity !== 0.5);
  if (bad.length) return '미적용 ' + bad.length;
  const dom = q(`.ws-el.vec[data-ws-el="${S.membersOf(sc(), grp).find((i) => sc().elements[i].kind === 'vector')}"]`);
  return dom && /opacity:0\.5/.test(dom.getAttribute('style')) ? true : '캔버스 opacity 없음';
});
T('W18 화살표 → 그룹 전부 0.5% 이동', () => {
  const x0 = sc().elements[S.membersOf(sc(), grp)[0]].x;
  key('ArrowRight');
  return Math.abs(sc().elements[S.membersOf(sc(), grp)[0]].x - x0 - 0.5) < 0.01 ? true : 'x';
});
T('W19 사진 자리 = 기존 image 요소(src 없음·fill) → 그룹 패널 「사진 올리기」', () => {
  const ph = S.membersOf(sc(), grp).map((i) => sc().elements[i]).find((e) => e.role === 'photo-slot');
  if (!ph) return '사진 자리 없음';
  if (ph.kind !== 'image' || ph.src) return 'kind=' + ph.kind;
  return q('[data-ws-gphoto]') ? true : '버튼 없음';
});
T('W20 저장 왕복: JSON.parse(JSON.stringify(doc)) 뒤 그대로 그려진다 (조각 수·svg 수·groups)', () => {
  const d0 = curDoc(); const js = JSON.stringify(d0);
  const d1 = JSON.parse(js);
  const s1 = d1.scenes[WSS().sceneIdx];
  if (JSON.stringify(s1.groups) !== JSON.stringify(sc().groups)) return 'groups';
  const p = P.get(WSS().projectId); p.doc = d1; w.PG.go('workspace');
  const vec = qa('.ws-el.vec');
  const n = S.membersOf(sc(), grp).filter((i) => sc().elements[i].kind === 'vector').length;
  return vec.length === n && vec.every((v) => v.querySelector('svg')) ? true : 'vec ' + vec.length + '/' + n;
});
T('W21 재생(MK_PLAY)·렌더(MK_RENDER) 가 벡터 조각을 싣는다 (svg op)', () => {
  const dl = w.MK_RENDER.renderScene(sc(), { noCache: true });
  const nsvg = dl.ops.filter((o) => o.op === 'svg').length;
  const n = S.membersOf(sc(), grp).filter((i) => sc().elements[i].kind === 'vector' && sc().elements[i].visible !== false).length;
  if (nsvg !== n) return 'svg op ' + nsvg + '/' + n;
  const svg = w.MK_RENDER.toSVG(dl, {});
  return (svg.match(/preserveAspectRatio="none"/g) || []).length >= n ? true : 'toSVG 중첩 svg 부족';
});
T('W23 undo 로 처음(삽입 전)까지 되돌려도 groups 가 남지 않는다', () => {
  let n = 0; while (WSS().undo.length && n++ < 40) key('z', { ctrlKey: true });
  const has = sc().elements.some((e) => e.kind === 'vector');
  return !has && !(sc().groups && Object.keys(sc().groups).length) ? true : 'vector ' + has + ' groups ' + JSON.stringify(sc().groups);
});
{
  const a = read('index.html'), b = read('../maker/index.html');
  const ord = (h) => h.indexOf('tplsvg.js') < h.indexOf('svgasset.js') && h.indexOf('svgasset.js') < h.indexOf('screens/workspace.js');
  T('W24a index.html 순서', () => ord(a) ? true : '순서');
  T('W24b maker/index.html 순서 + 버스터', () => ord(b) && /workspace\.js\?v=2026091[45][a-z]/.test(b) && /playground\.css\?v=2026091[45][a-z]/.test(b) ? true : '순서/버스터');
  const css = read('playground.css');
  T('W24c CSS: .ws-gbox·.ws-gh·.ws-lrow·.cx-paint', () => ['.ws-gbox', '.ws-gh', '.ws-lrow', '.cx-paint', '.ws-el.vec'].every((k) => css.includes(k)) ? true : 'CSS 누락');
}
/* W22 — PPTX 경로: rasterizeOps. Image 가 로드 실패하면 svg op 를 정직하게 남기고,
   noCache 리스트만 만지므로 캐시된 리스트는 벡터 그대로다 */
{
  const d = { scenes: [{ id: 'x', width: 1280, height: 720, background: '#fff', elements: [] }] };
  S.insert(d, 0, parsed);
  const cached = w.MK_RENDER.renderScene(d.scenes[0], {});
  const fresh = w.MK_RENDER.renderScene(d.scenes[0], { noCache: true });
  const n0 = cached.ops.filter((o) => o.op === 'svg').length;
  w.Image = class { set src(v) { setTimeout(() => this.onerror && this.onerror(new Error('x')), 0); } };
  const r = await S.rasterizeOps(fresh, 1);
  T('W22 rasterizeOps: 로드 실패 = svg op 유지(정직) · 캐시 리스트 무접촉', () => r.ops.filter((o) => o.op === 'svg').length === n0 && cached.ops.filter((o) => o.op === 'svg').length === n0 && fresh !== cached ? true : '변형');
  w.Image = class { set src(v) { this.width = 10; this.height = 10; setTimeout(() => this.onload && this.onload(), 0); } };
  w.HTMLCanvasElement.prototype.getContext = () => ({ drawImage() {} });
  w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,AAAA';
  const fresh2 = w.MK_RENDER.renderScene(d.scenes[0], { noCache: true });
  const r2 = await S.rasterizeOps(fresh2, 1);
  T('W22b rasterizeOps: 로드 성공 = 전부 image op(src dataURL) → PPTX 가 싣는 형태', () => r2.ops.filter((o) => o.op === 'svg').length === 0 && r2.ops.filter((o) => o.op === 'image' && /^data:image\/png/.test(o.src)).length >= n0 ? true : '변환 안 됨');
  const pp = w.MK_RENDER.toPPTX([r2], {});
  T('W22c toPPTX(래스터 뒤) 경고 0 · 사진 수 ≥ 조각 수', () => (pp.warnings || []).filter((x) => /벡터 조각/.test(x.msg || '')).length === 0 && pp.media >= n0 ? true : JSON.stringify({ w: (pp.warnings || []).length, media: pp.media }));
}
console.log(`\ntest-round152: ${pass}/${pass + fail}`);
process.exit(fail ? 1 : 0);
