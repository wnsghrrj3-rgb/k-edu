/* ============================================================
   test_animlab_samples.js — 애니 공방 본보기 12종 검산
   로직 블록의 SAMPLES 메타 + drawSample 실렌더(node-canvas):
   그림 존재·장별 차이(움직임의 본질)·결정성·규격.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'labs', 'animlab.html'), 'utf8');
const m = html.match(/<script id="animlab-logic">\n([\s\S]*?)<\/script>/);
if (!m) { console.log('animlab-logic 블록 없음'); process.exit(1); }
const w = {};
/* 리그 코어를 같은 window에 먼저 적재 (rig 본보기 렌더에 필요) */
new Function('window', fs.readFileSync(path.join(__dirname, '..', '..', 'labs', 'kchar-core.js'), 'utf8'))(w);
new Function('window', m[1])(w);
const L = w.AnimLab;
const KC = w.KChar;

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
}

console.log('[1] 본보기 규격');
const S = L.SAMPLES;
t('본보기 21종 (원리 12 + 캐릭터 9)', S.length === 21 && S.filter(x => x.rig).length === 9);
t('리그 캐릭터 id 유효', S.filter(x => x.rig).every(x => KC.findChar(x.rig)));
t('id 유일', new Set(S.map(x => x.id)).size === S.length);
t('제목·이모지·설명 완비', S.every(x => x.title && x.emoji && x.tip && x.tip.length >= 10));
t('장수 4~12 (상한 24 이내)', S.every(x => x.frames >= 4 && x.frames <= 12 && x.frames <= L.MAX_FRAMES));
t('캐릭터 본보기 pose 함수', S.filter(x => x.rig).every(x => typeof x.pose === 'function'));
t('fps 2~12', S.every(x => x.fps >= 2 && x.fps <= 12 && x.fps === L.clampFps(x.fps)));
t('findSample 왕복', S.every(x => L.findSample(x.id) === x) && L.findSample('없는것') === null);

console.log('[2] 실렌더 — 그림 존재·움직임·결정성');
function render(id, i) {
  const c = createCanvas(900, 620);
  const g = c.getContext('2d');
  L.drawSample(g, id, i);
  return c.toBuffer('raw');
}
function inkCount(buf) { let n = 0; for (let p = 3; p < buf.length; p += 4 * 97) if (buf[p] > 8) n++; return n; }
let allInk = true, allMove = true, allDet = true;
for (const x of S) {
  let prev = null;
  for (let i = 0; i < x.frames; i++) {
    const a = render(x.id, i);
    if (inkCount(a) < 5) { allInk = false; console.log('    ⚠ 그림 희박:', x.id, i); }
    const b = render(x.id, i);
    if (!a.equals(b)) { allDet = false; console.log('    ⚠ 비결정:', x.id, i); }
    if (prev && a.equals(prev)) { allMove = false; console.log('    ⚠ 이전 장과 동일:', x.id, i); }
    prev = a;
  }
}
t('모든 장에 그림이 있음', allInk);
t('이웃한 장이 서로 다름(조금씩 바뀜)', allMove);
t('결정적(같은 장 = 같은 그림)', allDet);

console.log('[3] 순환 애니 확인 — 첫 장과 끝 장도 이어짐(반복 재생용)');
const cyc = ['chick', 'bird', 'swim', 'spin', 'moon', 'candle'];
t('순환 본보기 첫·끝 장 다름', cyc.every(id => {
  const x = L.findSample(id);
  return !render(id, 0).equals(render(id, x.frames - 1));
}));

console.log('[4] 기존 로직 회귀');
const st = L.createFrameStore({ start: 1 });
for (let i = 0; i < 7; i++) st.add();
t('스토어 8장 구성', st.count() === 8);
t('본보기 상한 = 스토어 상한 호환', S.every(x => x.frames <= st.max));

console.log('\n전체 통과 ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
