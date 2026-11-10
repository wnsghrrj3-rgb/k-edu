/* ============================================================
 * 영어 놀이터 — 재료 검증(펼침 밖 소리·단어 0) — 게임설계 v1 §11·§12
 *   실행: node english/play/tests/content-validation.js      (k-edu 레포 안 어디서든)
 *   ① 소리 공방 12칸: 모든 단어가 그 칸까지 배운 소리로만 읽히는가 · 조각·조립 표시가 규칙과 같은가 · 소리를 실제로 낼 수 있는가
 *   ② 조건 칸: 놀이의 need 가 그 칸보다 앞인가(조건 칸 미달 놀이가 켜지지 않는가)는 조립기 하네스가 본다
 *   위반이 하나라도 있으면 종료 코드 1.
 * ============================================================ */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');          /* english/play */
const win = { console };
win.window = win; win.globalThis = win;
vm.createContext(win);
const load = f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), win, { filename: f });
load('../v3/engine/k-tts.js');
load('data/zones.js');
load('content/phonics.js');
load('core/decode.js');

const P = win.PlayPhonics, cells = P.cells();
const violations = P.validate();
let words = 0, build = 0, pairs = 0;
cells.forEach(c => {
  const own = P.own(c.id);
  words += c.words.length; build += own.filter(x => P.buildable(x.w, c.id)).length; pairs += P.pairs(c.id).length;
  /* 앞 칸에서는 못 읽는 단어여야 그 칸의 새 재료다(복습 칸 제외) — 새 소리가 들어간 단어가 하나는 있어야 한다 */
  const i = P.index(c.id);
  if (!c.review && c.units.length && !own.some(x => x.t.some(t => c.units.indexOf(t) >= 0))) violations.push(c.id + ' — 새 소리가 들어간 단어가 없음');
  if (!c.review && c.blends.length && !own.some(x => c.blends.some(b => x.w.indexOf(b) >= 0))) violations.push(c.id + ' — 새 묶음이 들어간 단어가 없음');
  if (i > 0) own.forEach(x => x.t.forEach(t => { if (t.length > 1 && c.known.indexOf(t) < 0) violations.push(c.id + ' ' + x.w + ' — 범위 밖 ' + t); }));
});
/* 구역 표에 올라간 소리 공방 구역이 재료와 같은가 */
const Z = win.PLAY_ZONES.zones.filter(z => z.stage === 'sound-shop');
if (Z.length !== cells.length) violations.push('구역 수가 칸 수와 다름');
Z.forEach(z => z.words.forEach(x => { if (!P.decodable(x.w, z.id).ok) violations.push(z.id + ' 구역 단어 ' + x.w + ' — 안 배운 소리'); }));

console.log('소리 공방 재료 검증: ' + cells.length + '칸 · 단어 ' + words + ' · 조립할 수 있는 단어 ' + build + ' · 한 소리 짝 ' + pairs + ' → 위반 ' + violations.length);
if (violations.length) { console.log(violations.join('\n')); process.exit(1); }
