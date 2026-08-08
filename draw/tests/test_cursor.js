/* ============================================================
   test_cursor.js — R94 도화지 커서 링 순수 로직 (KArtCursor.plan)
   준호 실기기: 도화지 위 포인터 피드백 부재 — 십자 커서는 안 보이고
   태블릿·펜엔 OS 커서가 없다. plan(tool,size) = 도구·크기 → 링 설계.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/window\.KArtCursor = \(function\(\)\{[\s\S]*?\}\)\(\);/);
if (!m) { console.log('KArtCursor 블록 없음'); process.exit(1); }
const w = {};
new Function('window', m[0])(w);
const K = w.KArtCursor;

let pass = 0, fail = 0;
const T = (name, ok, why) => { if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (why ? '  → ' + why : '')); } };

/* ① 획 도구 11종 전수 — 링, 반지름 = 크기/2 (하한 3) */
const STROKES = ['pencil','pen','marker','watercolor','oil','crayon','pencilcolor','pastel','spray','neon','eraser'];
T('획 도구 목록 일치(11종)', JSON.stringify(K.STROKES) === JSON.stringify(STROKES), JSON.stringify(K.STROKES));
let all = true, why = '';
for (const t of STROKES) {
  const p8 = K.plan(t, 8), p40 = K.plan(t, 40);
  if (!(p8.kind === 'ring' && p8.r === 4 && p40.r === 20)) { all = false; why = t + ':' + JSON.stringify(p8); break; }
}
T('획 도구 = 링 · 반지름 크기/2', all, why);
T('아주 가는 붓도 링 하한 3 (안 보이는 링 금지)', K.plan('pen', 1).r === 3, JSON.stringify(K.plan('pen', 1)));
T('굵은 붓(≥10)은 중심점 동반', K.plan('pen', 12).center === true && K.plan('pen', 8).center === false);

/* ② 채우기·스포이드 = 고정 표식(크기 슬라이더 무관) */
T('채우기 = 고정 표식 r7', K.plan('fill', 40).kind === 'mark' && K.plan('fill', 40).r === 7);
T('스포이드 = 고정 표식 r7', K.plan('eyedropper', 3).r === 7);

/* ③ 도형·직선 = 시작점 표식 */
for (const t of ['line','rect','circle','triangle','star']) {
  T('도형 「' + t + '」 = 표식 r5', K.plan(t, 30).kind === 'mark' && K.plan(t, 30).r === 5);
}

/* ④ 방어 — 이상 입력에도 유한값 */
T('크기 0·음수·NaN 방어', [0, -5, NaN].every((s) => isFinite(K.plan('pen', s).r) && K.plan('pen', s).r >= 3));
T('모르는 도구도 표식으로 안전', K.plan('unknown-tool', 8).kind === 'mark');

console.log('');
console.log('test_cursor: ' + pass + '/' + (pass + fail));
process.exit(fail ? 1 : 0);
