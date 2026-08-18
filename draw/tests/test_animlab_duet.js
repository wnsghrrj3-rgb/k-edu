/* ============================================================
   test_animlab_duet.js — 🎭 본보기와 나란히 재생 검산
   duetPlan 판정(완성+연결만 노출) · duetIndices 시간축 대응
   (양쪽 전 장 커버·단조·시작끝 정렬·순환·방어).
   ============================================================ */
const fs = require('fs');
const path = require('path');
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

console.log('[1] duetPlan — 판정');
t('완성 + 연결 미션(ball) = 노출·본보기 필드', (() => {
  const p = L.duetPlan({ done: true, missionId: 'ball', fps: 6 });
  const S = L.findSample('ball');
  return p.show && p.sampleId === 'ball' && p.sampleFrames === S.frames
    && p.sampleTitle === S.title && p.fps === 6;
})());
t('미완성 = 숨김', !L.duetPlan({ done: false, missionId: 'ball', fps: 6 }).show);
t('미연결 미션(blink·cloud) = 숨김', !L.duetPlan({ done: true, missionId: 'blink' }).show
  && !L.duetPlan({ done: true, missionId: 'cloud' }).show);
t('없는 미션·빈 입력 방어', !L.duetPlan({ done: true, missionId: '없음' }).show
  && !L.duetPlan().show && !L.duetPlan(null).show);
t('fps 미지정 = 미션 fps 계승', L.duetPlan({ done: true, missionId: 'walk' }).fps
  === L.findMission('walk').fps);
t('fps 범위 밖 = clamp(2~12)', L.duetPlan({ done: true, missionId: 'ball', fps: 99 }).fps === 12
  && L.duetPlan({ done: true, missionId: 'ball', fps: 0.4 }).fps === 2);
t('연결 7미션 전부 노출 가능', Object.keys(L.MISSION_LINKS)
  .every(id => L.duetPlan({ done: true, missionId: id }).show));

console.log('[2] duetIndices — 같은 시간축, 각자 제 장수');
const di = L.duetIndices;
t('t=0 → 둘 다 첫 장', (() => { const r = di(0, 3, 8); return r.mine === 0 && r.sample === 0; })());
t('t→1 직전 → 둘 다 끝 장', (() => { const r = di(0.999, 3, 8); return r.mine === 2 && r.sample === 7; })());
t('한 사이클에 양쪽 전 장 커버(3↔8)', (() => {
  const mm = new Set(), ss = new Set();
  for (let k = 0; k < 400; k++) { const r = di(k / 400, 3, 8); mm.add(r.mine); ss.add(r.sample); }
  return mm.size === 3 && ss.size === 8;
})());
t('사이클 안 단조 비감소', (() => {
  let pm = -1, ps = -1;
  for (let k = 0; k < 400; k++) {
    const r = di(k / 400, 3, 8);
    if (r.mine < pm || r.sample < ps) return false;
    pm = r.mine; ps = r.sample;
  }
  return true;
})());
t('동일 장수 = 항상 같은 장', [0, .12, .4, .77, .99].every(x => {
  const r = di(x, 6, 6); return r.mine === r.sample;
}));
t('t>1 순환(루프)', (() => { const a = di(1.25, 3, 8), b = di(0.25, 3, 8);
  return a.mine === b.mine && a.sample === b.sample; })());
t('NaN·음수·0장 방어', (() => {
  const a = di(NaN, 3, 8), b = di(-5, 3, 8), c = di(0.5, 0, 0);
  return a.mine === 0 && a.sample === 0 && b.mine === 0 && b.sample === 0
    && c.mine === 0 && c.sample === 0;
})());
t('실전 조합 — 미션 3장↔본보기 8장·미션 8장↔본보기 8장 상한 안 넘음', (() => {
  for (let k = 0; k < 200; k++) {
    const r1 = di(k / 199, 3, 8), r2 = di(k / 199, 8, 8);
    if (r1.mine > 2 || r1.sample > 7 || r2.mine > 7 || r2.sample > 7) return false;
  }
  return true;
})());

console.log('\n' + (fail ? ('실패 ' + fail + '건 — ') : '전체 통과 ') + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
