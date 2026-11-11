/* ============================================================
 * 영어 놀이터 — 재료 검증(펼침 밖 소리·단어 0) — 게임설계 v1 §11·§12
 *   실행: node english/play/tests/content-validation.js      (k-edu 레포 안 어디서든)
 *   ① 소리 공방 12칸: 모든 단어가 그 칸까지 배운 소리로만 읽히는가 · 조각·조립 표시가 규칙과 같은가 · 소리를 실제로 낼 수 있는가
 *   ② 조건 칸: 놀이의 need 가 그 칸보다 앞인가(조건 칸 미달 놀이가 켜지지 않는가)는 조립기 하네스가 본다
 *   ③ Lv1 「소리 마을」(W06): 소리 숲 8칸 재료 검사(같은 규칙) · 알파벳 묶음 · 칸 12 · 문(gates) · 단어와 그림 칸 = 앞 소리 칸에서 읽을 수 있는 CVC ·
 *      Lv1 무대에서 들리는 영어(놀이 시작 한마디·사건·대화·특별 손님)는 Lv1 #1·#2 낱말 + 그 칸까지의 동물 + 감탄만
 *   ④ 설계 v2 · 한 해 길(W13): 길 없는 재료 0(구역 낱말·걸음 낱말마다 씨앗의 길) · 걸음 재료가 길 자료 안 · 길 자료 = 생성 파일 ·
 *      걸음마다 내용 최소치(사건 넷 · 켤 수 있는 놀이 여덟(힘마다 둘) · 쪽지 셋 · 부탁 하나 · 챈트 하나 · 이야기 세 마디)를 세어 **목록으로 보고**한다
 *      (모자란 것은 위반이 아니다 — 걸음 상세판과 그 무대 묶음에서 채운다). 자세한 목록: --min
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
load('content/phonics-lv1.js');
load('data/path.js');
load('core/decode.js');

const P = win.PlayPhonics, cells = P.cells();     /* 소리 공방(Lv2) 12칸 — Lv1 소리 숲 칸은 아래 ③ */
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

/* ── §15 비주얼 규범: 제작 파일에 이모지 0 · Jua 0 · 토큰 밖 색 값 0 ── */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}\u{200D}]/u;
const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
const look = [];
(function walk(d) { fs.readdirSync(path.join(ROOT, d)).forEach(f => { const r = d ? d + '/' + f : f, st = fs.statSync(path.join(ROOT, r)); if (st.isDirectory()) { if (f !== 'tests') walk(r); } else if (/\.(js|html|css|svg)$/.test(f)) look.push(r); }); })('');
let visual = 0;
look.forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (EMOJI.test(src)) { violations.push(f + ' — 이모지 문자(§15: 그린 그림·선 아이콘만)'); visual++; }
  if (/\bJua\b/.test(src)) { violations.push(f + ' — Jua 글꼴(§15)'); visual++; }
  if (f !== 'ui/tokens.css' && COLOR.test(src.replace(/&#[0-9]+;/g, ''))) { violations.push(f + ' — 색 값을 직접 적음(토큰 ui/tokens.css 만): ' + (src.match(COLOR) || [''])[0]); visual++; }
});
/* 쓰는 그림 이름이 실제로 있는가 */
load('ui/icons.js'); load('content/art/art.js'); load('content/art/food.js'); load('content/art/home.js'); load('content/art/farm.js'); load('content/art/forest.js'); load('content/art/school.js'); load('content/art/action.js'); load('content/art/mirror.js'); load('content/art/things.js');
const IC = win.PlayIcon, AR = win.PlayArt;
win.PLAY_ZONES.zones.forEach(z => {
  if (z.icon && !IC.has(z.icon)) violations.push(z.id + ' — 없는 아이콘 ' + z.icon);
  if (z.cellIcon && !AR.has(z.cellIcon)) violations.push(z.id + ' — 없는 그림 ' + z.cellIcon);
  (z.decor || []).forEach(x => { if (!IC.has(x.icon)) violations.push(z.id + ' 장식 ' + x.id + ' — 없는 아이콘 ' + x.icon); });
  (z.words || []).forEach(x => (x.scene || []).forEach(sc => { if (!AR.has(sc.split(':')[0])) violations.push(z.id + ' 장면 그림 ' + sc + ' — 없음'); }));
  if (z.gram) { (z.gram.ends || []).concat(z.gram.storyEnds || []).forEach(e => { const k = e.replace(/^an? /, ''), a = (z.gram.art || {})[k] || k; if (!AR.has(a)) violations.push(z.id + ' 자판기 칩 그림 ' + e + ' — 없음'); }); z.words.forEach(x => { if (!/^(I|You|It|He|She|We|They) (am|are|is) /.test(x.w)) violations.push(z.id + ' 문장틀 밖 ' + x.w); }); }
  if (['lunch-shop', 'animal-farm', 'classroom', 'playground', 'vending', 'mirror'].indexOf(z.stage) >= 0) z.words.forEach(x => { if (!AR.has(x.art || x.w)) violations.push(z.id + ' ' + x.w + ' — 그린 그림 없음'); });
  if (z.stage === 'lv1-gate') z.words.forEach(x => { if (x.art && !AR.has(x.art)) violations.push(z.id + ' ' + x.w + ' — 없는 그림 ' + x.art); });
});
/* 구역 안의 챈트·특별 손님 질문·대화 문장은 그 칸 재료 안(W07) */
win.PLAY_ZONES.zones.forEach(z => {
  const ws = (z.words || []).map(x => x.w);
  (z.chant || []).forEach(l => l.forEach(w => { if (ws.indexOf(w) < 0) violations.push(z.id + ' 챈트 ' + w + ' — 칸 재료 밖'); }));
  ((z.boss && z.boss.turns) || []).forEach(t => t.pick.forEach(w => { if (ws.indexOf(w) < 0) violations.push(z.id + ' 특별 손님 ' + w + ' — 칸 재료 밖'); }));
  (z.confuse || []).forEach(pr => pr.forEach(w => { if (ws.indexOf(w) < 0) violations.push(z.id + ' 혼동쌍 ' + w + ' — 칸 재료 밖'); }));
});
Object.keys(win.PLAY_ZONES.stages || {}).forEach(k => { if (!IC.has(win.PLAY_ZONES.stages[k].icon)) violations.push('무대 ' + k + ' — 없는 아이콘'); });
(win.PLAY_ZONES.peek || []).forEach(x => { if (!IC.has(x.icon)) violations.push('구경 ' + x.id + ' — 없는 아이콘'); });
/* ── ③ Lv1 「소리 마을」 ── */
const ZS = win.PLAY_ZONES, L1 = ZS.worldCells('lv1'), l1v0 = violations.length;
const L1IDS = ['lv1-01', 'lv1-02', 'lv1-03', 'lv1-04', 'lv1-05', 'lv1-06', 'lv1-07', 'lv1-08', 'lv1-11', 'lv1-12', 'lv1-14', 'lv1-16'];
if (L1.map(z => z.id).join() !== L1IDS.join()) violations.push('Lv1 칸이 열둘(01·02 입구 + 소리 숲 8 + 농장 05·08)이 아님: ' + L1.map(z => z.id).join());
Object.keys(ZS.gates).forEach(k => { if (!ZS.zone(k) || !ZS.zone(ZS.gates[k])) violations.push('문 ' + k + ' ← ' + ZS.gates[k] + ' — 없는 칸'); });
const forest = P.allCells().filter(c => /^lv1-/.test(c.id));
if (forest.length !== 8) violations.push('소리 숲 칸이 여덟이 아님');
const abc = ZS.zone('lv1-03');
if (!abc || !abc.letters || abc.bundles.length < 5 || abc.words.length || abc.fixedGames.join() !== 'sound-monster,sound-jump') violations.push('알파벳 칸 — 묶음 다섯 이상 · 단어 0 · 놀이 = 소리 몬스터·소리 점프 가 아님');
/* 단어와 그림 칸 — 앞 소리 칸(04·06·07)에서 읽은 CVC 만 */
const readable = {}; ['lv1-04', 'lv1-06', 'lv1-07'].forEach(id => P.own(id).forEach(x => { readable[x.w] = 1; }));
ZS.zone('lv1-08').words.forEach(x => { if (!readable[x.w]) violations.push('lv1-08 ' + x.w + ' — 앞 소리 칸(a·i·o)에서 읽은 단어가 아님'); });
/* Lv1 무대에서 들리는 영어 — Lv1 #1·#2 낱말 + 동물(#2 의 cat·dog · #5) + 감탄·신호 */
const OK1 = new Set('i you like a the see it cat dog pig fish bird oh hi listen go yay wow'.split(' '));
const words1 = s => String(s || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
const say1 = (where, en) => words1(en).forEach(w => { if (!OK1.has(w)) violations.push(where + ' — Lv1 무대에서 안 배운 말 「' + w + '」: ' + en); });
const G1 = {}; L1.forEach(z => (z.fixedGames || z.games || []).forEach(id => { G1[id] = 1; })); G1['special-guest'] = 1; G1.garden = 1;
['games/garden.js', 'games/order-shop.js', 'games/pop.js', 'games/catch.js', 'games/belt.js', 'games/legacy.js', 'games/raccoon.js', 'games/picture-book.js', 'games/talk.js',
 'games/read-aloud.js', 'games/sound-monster.js', 'games/sound-jump.js', 'games/sound-bridge.js', 'games/sound-train.js', 'games/sound-swap.js', 'games/special-guest.js'].forEach(f => {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const re = /id: '([\w-]+)'[\s\S]*?intro: \{ en: '([^']*)'/g; let m;
  const re1 = /intro1: \{ en: '([^']*)'/g, ones = []; let m1; while ((m1 = re1.exec(src))) ones.push(m1[1]);
  while ((m = re.exec(src))) { if (!G1[m[1]]) continue; const one = (src.slice(m.index, m.index + 900).match(/intro1: \{ en: '([^']*)'/) || [])[1]; say1('놀이 ' + m[1] + ' 시작 한마디', one != null ? one : m[2]); }
});
['lv1-gate', 'sound-forest', 'animal-farm'].forEach(st => { load('content/events/' + ({ 'lv1-gate': 'home', 'sound-forest': 'forest', 'animal-farm': 'farm' })[st] + '.js'); (win.PLAY_EVENTS[st] || []).forEach(e => { say1('사건 ' + e.id, e.intro.en); say1('사건 ' + e.id, e.outro.en); }); });
(ZS.zone('lv1-02').talk || []).forEach((t, k) => { say1('대화 ' + (k + 1), t.line.en); t.pick.forEach(w => { if (!ZS.zone('lv1-02').words.some(x => x.w === w)) violations.push('대화 ' + (k + 1) + ' — 고를 문장 ' + w + ' 이 칸 단어에 없음'); say1('대화 ' + (k + 1), w); }); });
L1.forEach(z => ((z.boss && z.boss.turns) || []).forEach(t => say1(z.id + ' 특별 손님', t.ask)));
console.log('소리 마을(Lv1) 검사: 칸 ' + L1.length + ' · 소리 숲 ' + forest.length + '칸 · 알파벳 묶음 ' + (abc ? abc.bundles.length : 0) + ' · 문 ' + Object.keys(ZS.gates).filter(k => /^lv1-/.test(k)).length + ' → 위반 ' + (violations.length - l1v0));
/* ── ④ 설계 v2 · 한 해 길 ── */
load('core/path.js'); load('engine/play-seed.js'); load('core/game.js');
load('content/letters.js'); load('engine/play-write.js');      /* 손 쓰기(W14) — 쓰는 놀이가 그 걸음에 맞는지 보려면 글자 자료가 있어야 한다 */
fs.readdirSync(path.join(ROOT, 'games')).filter(f => /\.js$/.test(f)).forEach(f => { try { load('games/' + f); } catch (e) { violations.push('놀이 파일 ' + f + ' — 실을 수 없음: ' + e.message); } });
const PP = win.PlayPath, PS = win.PlaySeed, PG = win.PlayGame, v4 = violations.length;
const PATHS = Object.keys(PS.PATHS);
win.PLAY_ZONES.zones.forEach(z => (z.words || []).forEach(x => { if (PATHS.indexOf(x.path) < 0) violations.push(z.id + ' ' + x.w + ' — 씨앗의 길이 없음'); }));
const VOC = PP.vocab(), outside = {};
win.PLAY_ZONES.zones.forEach(z => (z.words || []).forEach(x => String(x.w).toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean).forEach(t => { if (!VOC[t]) (outside[z.id] = outside[z.id] || []).push(t); })));
if (PP.steps().length !== 52) violations.push('한 해 길 — 걸음이 52 가 아님');
const short = [], tally = { story: 0, chant: 0, events: 0, notes: 0, favor: 0, games: 0, full: 0 };
PP.steps().forEach(st => {
  const z = PP.zone(st.id);
  z.words.concat(z.letterItems).forEach(x => { if (PATHS.indexOf(x.path) < 0) violations.push(st.id + ' ' + x.w + ' — 씨앗의 길이 없음'); });
  z.words.forEach(x => String(x.w).toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean).forEach(t => { if (!VOC[t]) violations.push(st.id + ' ' + x.w + ' — 길 자료 밖 낱말'); }));
  (st.covers || []).forEach(c => { if (!/^lv[12]-\d\d$/.test(c)) violations.push(st.id + ' 덮는 칸 ' + c + ' — 사다리 칸 이름이 아님'); });
  /* 내용 최소치(설계 v2 §1-2 표) */
  const usable = z.games.filter(id => { const d = PG.get(id); return d && !d.draft && (!d.fits || d.fits(z)); });
  const per = { L: 0, S: 0, R: 0, W: 0 }; usable.forEach(id => (PG.get(id).skills || []).forEach(p => { if (per[p] != null) per[p]++; }));
  const lack = [];
  if (st.story.length < 3) { lack.push('이야기 ' + st.story.length + '/3'); tally.story++; }
  if (st.chant.length < 1) { lack.push('챈트 0/1'); tally.chant++; }
  if ((st.events || []).length < 4) { lack.push('사건 ' + (st.events || []).length + '/4'); tally.events++; }
  if ((st.notes || []).length < 3) { lack.push('쪽지 ' + (st.notes || []).length + '/3'); tally.notes++; }
  if (!st.favor) { lack.push('부탁 0/1'); tally.favor++; }
  if (usable.length < 8 || Object.keys(per).some(k => per[k] < 2)) { lack.push('놀이 ' + usable.length + '/8(' + Object.keys(per).map(k => k + per[k]).join(' ') + ')'); tally.games++; }
  if (!lack.length) tally.full++; else short.push(st.id + ' ' + st.title + ' — ' + lack.join(' · '));
});
const nOut = Object.keys(outside).reduce((n, k) => n + outside[k].length, 0);
console.log('한 해 길 검사: 걸음 ' + PP.steps().length + ' · 길 낱말 ' + Object.keys(VOC).length + ' → 위반 ' + (violations.length - v4));
console.log('  내용 최소치 — 다 갖춘 걸음 ' + tally.full + '/52 · 모자란 걸음: 사건 ' + tally.events + ' · 쪽지 ' + tally.notes + ' · 부탁 ' + tally.favor + ' · 놀이(여덟·힘마다 둘) ' + tally.games + ' · 챈트 ' + tally.chant + ' · 이야기 ' + tally.story + ' (목록: --min)');
if (nOut) console.log('  예전 칸 재료 중 길 자료 밖 낱말 ' + nOut + ' — ' + Object.keys(outside).map(k => k + ':' + outside[k].join('·')).join(' / ') + ' (그 칸은 길의 걸음으로 옮길 때 길 재료로 바뀐다)');
if (process.argv.indexOf('--min') >= 0) console.log(short.join('\n'));
console.log('비주얼 규범 검사: 제작 파일 ' + look.length + '개 → 위반 ' + visual);
console.log('소리 공방 재료 검증: ' + cells.length + '칸 · 단어 ' + words + ' · 조립할 수 있는 단어 ' + build + ' · 한 소리 짝 ' + pairs + ' → 위반 ' + violations.length);
if (violations.length) { console.log(violations.join('\n')); process.exit(1); }
