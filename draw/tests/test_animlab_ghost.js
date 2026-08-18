/* ============================================================
   test_animlab_ghost.js — 본보기↔미션 다리 + 👻 따라 그리기 검산
   MISSION_LINKS 유효성 · ghostFrameFor 장수 대응 · ghostPlan 판정 ·
   링크 대상 본보기 실렌더(node-canvas).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'labs', 'animlab.html'), 'utf8');
const m = html.match(/<script id="animlab-logic">\n([\s\S]*?)<\/script>/);
if (!m) { console.log('animlab-logic 블록 없음'); process.exit(1); }
const w = {};
new Function('window', fs.readFileSync(path.join(__dirname, '..', '..', 'labs', 'kchar-core.js'), 'utf8'))(w);
new Function('window', m[1])(w);
const L = w.AnimLab;

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
}

console.log('[1] 본보기↔미션 다리');
const LK = L.MISSION_LINKS;
const keys = Object.keys(LK);
t('링크 10건(원리 7 + 캐릭터 3)', keys.length === 10);
t('모든 링크의 미션이 실존', keys.every(k => L.findMission(k)));
t('모든 링크의 본보기가 실존', keys.every(k => L.findSample(LK[k])));
t('원리 궁합 고정점 — walk↔chick(보행)·face↔face(감정)·ball↔ball(스쿼시)',
  LK.walk === 'chick' && LK.face === 'face' && LK.ball === 'ball');
t('linkedSample 왕복', L.linkedSample('ball').id === 'ball'
  && L.linkedSample('flower').id === 'bloom'
  && L.linkedSample('blink') === null && L.linkedSample('없는미션') === null);
t('미연결 미션도 정상(blink·cloud)', !LK.blink && !LK.cloud
  && L.findMission('blink') && L.findMission('cloud'));

console.log('[2] ghostFrameFor — 장수 대응');
const gf = L.ghostFrameFor;
t('동일 장수 = 항등', [0,1,2,3,4,5,6,7].every(i => gf(8,8,i) === i));
t('미션 3장 ↔ 본보기 8장 = [0,2,5]',
  gf(3,8,0) === 0 && gf(3,8,1) === 2 && gf(3,8,2) === 5);
t('미션 6장 ↔ 본보기 8장 = [0,1,2,4,5,6]',
  [0,1,2,4,5,6].every((v,i) => gf(6,8,i) === v));
t('미션 8장 ↔ 본보기 6장(역방향 축소)도 범위 안·단조',
  (() => { let p = -1;
    for (let i = 0; i < 8; i++) { const v = gf(8,6,i);
      if (v < p || v < 0 || v >= 6) return false; p = v; }
    return true; })());
t('마지막 장은 항상 본보기 마지막 안쪽', gf(24,8,23) === 7 && gf(5,10,4) === 8);
t('방어 — count 0·sample 0·음수 cur·초과 cur',
  gf(0,8,0) === 0 && gf(3,0,1) === 0 && gf(3,8,-5) === 0 && gf(3,8,99) === 5);

console.log('[3] ghostPlan — 표시 판정');
const gp = L.ghostPlan;
t('꺼짐 → 숨김', gp({on:false, sampleId:'ball', count:3, cur:0}).show === false);
t('재생 중 → 숨김', gp({on:true, sampleId:'ball', playing:true, count:3, cur:0}).show === false);
t('본보기 없음 → 숨김', gp({on:true, sampleId:null, count:3, cur:0}).show === false
  && gp({on:true, sampleId:'유령', count:3, cur:0}).show === false);
t('켜짐 → 표시 + 매핑 일치', (() => {
  const p = gp({on:true, sampleId:'ball', playing:false, count:3, cur:1});
  return p.show === true && p.sampleId === 'ball' && p.frameIndex === gf(3,8,1);
})());
t('연출 값 정상(투명도 0~1·착색 문자열)', (() => {
  const p = gp({on:true, sampleId:'candle', count:4, cur:2});
  return p.opacity > 0 && p.opacity < 1 && typeof p.tint === 'string' && p.tint[0] === '#';
})());
t('인자 없음 방어', gp().show === false && gp(null).show === false);

console.log('[4] 링크 대상 본보기 실렌더');
const targets = [...new Set(Object.values(LK))];
function inkCount(id, i) {
  const c = createCanvas(900, 620), g = c.getContext('2d');
  L.drawSample(g, id, i);
  const d = g.getImageData(0, 0, 900, 620).data;
  let n = 0;
  for (let p = 3; p < d.length; p += 4) if (d[p] > 8) n++;
  return n;
}
t('링크 대상 = 9종(중복 hop 제거, 캐릭터 3 포함)', targets.length === 9);
t('전 대상 전 장 그림 존재', targets.every(id => {
  const S = L.findSample(id);
  for (let i = 0; i < S.frames; i++) if (inkCount(id, i) < 200) return false;
  return true;
}));
t('착색 합성 성립 — source-atop 후에도 픽셀 보존', (() => {
  const c = createCanvas(900, 620), g = c.getContext('2d');
  L.drawSample(g, 'chick', 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = '#0FA98E'; g.fillRect(0, 0, 900, 620);
  const d = g.getImageData(0, 0, 900, 620).data;
  let n = 0, teal = 0;
  for (let p = 0; p < d.length; p += 4) if (d[p+3] > 200) {   // 불투명 획만(테두리 저알파는 역프리멀티 오차)
    n++;
    if (Math.abs(d[p]-15) < 6 && Math.abs(d[p+1]-169) < 6 && Math.abs(d[p+2]-142) < 6) teal++;
  }
  return n > 200 && teal === n;   // 불투명 획 전부가 청록으로만 착색(다른 색 잔존 0)
})());

console.log('\n전체 통과 ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
