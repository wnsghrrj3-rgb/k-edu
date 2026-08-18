/* ============================================================
   test_coloring.js — 색칠 놀이(KCL) 도안 규격 + 순수 로직 검산
   ============================================================ */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'coloring', 'index.html'), 'utf8');
const m = html.match(/window\.KCL=\(function\(\)\{[\s\S]*?\n\}\)\(\);/);
if (!m) { console.log('KCL 블록 없음'); process.exit(1); }
const w = {};
new Function('window', m[0])(w);
const K = w.KCL;

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
}

console.log('[1] 도안 규격');
const D = K.DRAWINGS;
t('도안 12종', D.length === 12);
t('id 유일', new Set(D.map(d => d.id)).size === D.length);
t('제목·이모지 완비', D.every(d => d.title && d.emoji));
t('파츠 4~16칸(저학년 상한)', D.every(d => d.parts.length >= 4 && d.parts.length <= 16));
t('모든 칸 닫힌 경로(Z)', D.every(d => d.parts.every(p => /Z\s*$/.test(p.d))));
t('모든 칸 이름 있음', D.every(d => d.parts.every(p => p.n && p.n.length >= 1)));
t('경로 시작점이 화폭(0~400) 안', D.every(d => d.parts.every(p => {
  const m2 = p.d.match(/^M(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (!m2) return false;
  const x = +m2[1], y = +m2[2];
  return x >= -40 && x <= 440 && y >= -40 && y <= 440; /* 상대 arc 음수 이동은 정상 */
})));
t('장식 종류 f|l만', D.every(d => d.deco.every(x => x.k === 'f' || x.k === 'l')));

console.log('[2] 채움 로직');
const dw = D[0];
const st = K.newState(dw);
t('초기 전 칸 흰색', st.fills.every(c => c === K.BASE));
t('채움 성공', K.fill(st, 0, '#FF0000') === true && st.fills[0] === '#FF0000');
t('같은 색 재채움 거부', K.fill(st, 0, '#FF0000') === false);
t('범위 밖 거부', K.fill(st, 999, '#00FF00') === false && K.fill(st, -1, '#00FF00') === false);
K.fill(st, 1, '#00AA00');
t('칠한 칸 수 = 2', K.painted(st) === 2);

console.log('[3] 되돌리기·리셋');
const u = K.undo(st);
t('되돌리기 → 직전 칸 복원', u === 1 && st.fills[1] === K.BASE);
K.undo(st);
t('한 번 더 → 전부 흰색', K.painted(st) === 0);
t('빈 스택 되돌리기 = -1', K.undo(st) === -1);
K.fill(st, 2, '#0000FF'); K.reset(st);
t('리셋 → 전 칸 흰색·스택 비움', K.painted(st) === 0 && K.undo(st) === -1);

console.log('[4] 저장·복원');
K.fill(st, 0, '#123456'); K.fill(st, 3, '#ABCDEF');
const s = K.serialize(st);
const st2 = K.restore(dw, s);
t('직렬화 왕복 보존', st2 && st2.fills[0] === '#123456' && st2.fills[3] === '#ABCDEF' && K.painted(st2) === 2);
t('망가진 저장 = null', K.restore(dw, '{"f":[1,2]}') === null && K.restore(dw, 'garbage') === null);
const bad = JSON.stringify({ f: st.fills.map((c, i) => i === 0 ? 'javascript:x' : c) });
const st3 = K.restore(dw, bad);
t('이상한 색 값은 흰색으로 소독', st3 && st3.fills[0] === K.BASE);

console.log('[5] 진행률');
const st4 = K.newState(dw);
dw.parts.forEach((_, i) => K.fill(st4, i, '#111111'));
t('전 칸 칠하면 100%', K.pct(st4) === 100);
t('결정적(재실행 동일)', JSON.stringify(K.newState(dw)) === JSON.stringify(K.newState(dw)));

console.log('\n전체 통과 ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
