/* =============================================================
 * test_morning_sents.js — 「오늘의 문장」 하루 1문장 활동 스모크 (jsdom)
 *   ① 화면이 원장에서만 재료를 끌어오는가(학년·일수 하드코딩 금지 · DB 무접촉)
 *   ② 1막 만나기 — 소리가 글자보다 먼저 오는가, 뜻이 뒤따르는가,
 *      새 낱말 배지·밑줄이 원장 new 와 전수 일치하는가, 어제 문장이 맞는가
 *   ③ 2막 다섯 번 — 비계가 실제로 줄어드는가(문장→뜻→소리만),
 *      매회 소리가 울리는가, 틀린 타일은 자리에 놓이지 않는가, 도장 5개
 *   ④ 3막 넓히기 — expand 있는 날은 조립, 없는 날은 문장을 지어내지 않는가
 *   ⑤ 완주 기록(localStorage) → 둘러보기 도장
 *   ⑥ 주소: c키·grade/day·이상값·원장 없는 학년
 *   ⑦ 소리 없는 기기(실제 k-tts.js · speechSynthesis 없음)에서도 3막 완주
 * 실행: NODE_PATH=/home/claude/node_modules node kedu/quiz/test_morning_sents.js
 *      (인자로 검사할 sents.html 경로를 줄 수 있다 — 역검증은 변조 사본을 넘긴다)
 * ============================================================= */
'use strict';
var fs = require('fs'), path = require('path');
var { JSDOM } = require('jsdom');

var ROOT = path.join(__dirname, '..', '..');
var D = require('./templates/english_data.js');

var arg = process.argv[2];
var PAGE = arg ? (path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg))
               : path.join(ROOT, 'morning', 'sents.html');
if (!fs.existsSync(PAGE)) { console.log('검사 대상이 없음: ' + PAGE); process.exit(1); }

var RAW = fs.readFileSync(PAGE, 'utf8');
var DATA_SRC = fs.readFileSync(path.join(ROOT, 'kedu', 'quiz', 'templates', 'english_data.js'), 'utf8');
var TTS_SRC  = fs.readFileSync(path.join(ROOT, 'english', 'v3', 'engine', 'k-tts.js'), 'utf8');

var DATA_TAG = '<script src="/kedu/quiz/templates/english_data.js"></script>';
var TTS_TAG  = '<script src="/english/v3/engine/k-tts.js"></script>';
var BACK_TAG = '<script src="/kedu_back.js"></script>';

var pass = 0, fail = 0, msgs = [];
function T(c, m){ if (c) pass++; else { fail++; if (msgs.length < 40) msgs.push('  x ' + m); } }

/* 소리 엔진 대역: 무엇을 어떤 순서로 부르는지 기록한다.
   부를 때의 화면 상태(켜진 낱말 수)도 함께 남겨 "소리가 먼저"를 검증할 수 있게 한다. */
var STUB_TTS = [
  'window.__tts = { sent: [], word: [], unlock: 0 };',
  'window.KTTS = {',
  '  available: function(){ return true; },',
  '  unlock: function(){ window.__tts.unlock++; },',
  '  stop: function(){},',
  '  sentence: function(t){',
  '    var lit = document.querySelectorAll(".sent .w.in").length;',
  '    window.__tts.sent.push({ t: t, lit: lit });',
  '    return Promise.resolve(true); },',
  '  word: function(t){ window.__tts.word.push(t); return Promise.resolve(true); }',
  '};'
].join('\n');

function open(qs, opt){
  opt = opt || {};
  var html = RAW;
  T(html.indexOf(DATA_TAG) >= 0, '화면이 원장 스크립트를 예상 경로로 부르지 않음');
  html = html.replace(DATA_TAG, '<script>' + DATA_SRC + '</script>');
  T(html.indexOf(TTS_TAG) >= 0, '화면이 소리 엔진을 예상 경로로 부르지 않음');
  html = html.replace(TTS_TAG,
    opt.realTts ? '<script>' + TTS_SRC + '</script>'
    : (opt.noTts ? '' : '<script>' + STUB_TTS + '</script>'));
  html = html.replace(BACK_TAG, '');

  var dom = new JSDOM(html, {
    url: 'https://keduclass.com/morning/sents.html' + (qs || ''),
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse: function(win){
      var orig = win.setTimeout.bind(win);
      win.__t0 = orig;
      win.setTimeout = function(f){ return orig(f, 0); };   // 연출 대기를 0으로
      if (opt.pre) opt.pre(win);
    }
  });
  var doc = dom.window.document;
  function tick(n){
    n = n || 4;
    var p = Promise.resolve();
    for (var i = 0; i < n; i++) p = p.then(function(){
      return new Promise(function(r){ dom.window.__t0(r, 0); });
    });
    return p;
  }
  return {
    dom: dom, win: dom.window, doc: doc, tick: tick,
    tts: function(){ return dom.window.__tts || { sent: [], word: [] }; },
    txt: function(sel){ var e = doc.querySelector(sel); return e ? e.textContent : ''; },
    all: function(sel){ return Array.prototype.slice.call(doc.querySelectorAll(sel)); }
  };
}

/* 타일을 정답 순서대로 누른다 — 화면이 실제로 받아 주는지 본다 */
function assemble(o, tiles, label){
  for (var i = 0; i < tiles.length; i++) {
    var want = tiles[i];
    var btns = o.all('#pool .tile:not(.used)');
    var hit = null;
    for (var j = 0; j < btns.length; j++) if (btns[j].textContent === want) { hit = btns[j]; break; }
    T(!!hit, label + ' 타일 없음: ' + want);
    if (!hit) return false;
    hit.click();
  }
  return true;
}

(async function(){

/* ══ ① 재료의 출처 ══ */
(function(){
  T(/\[\s*1\s*,\s*2\s*,\s*3\s*,\s*4\s*,\s*5\s*,\s*6\s*\]/.test(RAW) === false,
    '문장 화면에 학년 하드코딩이 있음 — 원장 없는 1·2학년이 뜬다');
  T(/D\.grades\(\)/.test(RAW), '학년 목록을 원장(D.grades)에서 끌어오지 않음');
  T(/D\.maxDay\(/.test(RAW), '일수를 원장(D.maxDay)에서 끌어오지 않음');
  T(/D\.day\(/.test(RAW), '그날 문장을 원장(D.day)에서 끌어오지 않음');
  T(RAW.indexOf('ma_submit') < 0 && RAW.indexOf('getKeduDb') < 0,
    '학생 활동 화면이 DB 를 건드림 — 기록은 확인 문제(/morning/)가 담당한다');
  /* 원장에 없는 문장을 화면이 품고 있으면 안 된다(하드코딩 예문 금지) */
  var scriptOnly = RAW.split('<script>').slice(1).join('<script>');
  T(/"I like apples\.?"|'I like apples\.?'/.test(scriptOnly) === false,
    '화면 코드에 예문이 박혀 있음 — 문장은 원장만 준다');
})();

/* ══ ② 1막 만나기 ══ */
for (var gi = 0; gi < D.grades().length; gi++) {
  var g = D.grades()[gi];
  var days = [1, 2, Math.ceil(D.maxDay(g)/2), D.maxDay(g)];
  for (var di = 0; di < days.length; di++) {
    var d = days[di];
    var x = D.day(g, d);
    var o = open('?grade=' + g + '&day=' + d);
    var tag = 'g' + g + ' d' + d;

    /* 소리가 글자보다 먼저 온다 */
    var s0 = o.tts().sent[0];
    T(!!s0 && s0.t === x.sent, tag + ' 1막에서 오늘 문장 소리가 먼저 울리지 않음');
    T(!s0 || s0.lit === 0, tag + ' 글자가 소리보다 먼저 켜짐 — 1막 순서가 뒤집혔다');

    await o.tick(6);
    var lit = o.all('.sent .w.in');
    T(lit.length === x.tiles.length, tag + ' 켜진 낱말 ' + lit.length + ' ≠ 타일 ' + x.tiles.length);
    T(lit.map(function(e){ return e.textContent; }).join(' ') === x.tiles.join(' '),
      tag + ' 1막 문장이 원장 tiles 와 다름');
    T(o.doc.getElementById('ko').classList.contains('in'), tag + ' 뜻이 공개되지 않음');
    T(o.txt('#ko') === x.ko, tag + ' 뜻이 원장과 다름');

    /* 새 낱말: 배지 전수 + 문장 안 밑줄 위치 */
    var badges = o.all('#fresh .badge').map(function(e){ return e.textContent; });
    T(badges.length === (x['new'] || []).length, tag + ' 새 낱말 배지 ' + badges.length + ' ≠ 원장 ' + (x['new']||[]).length);
    (x['new'] || []).forEach(function(w){ T(badges.indexOf(w) >= 0, tag + ' 새 낱말 배지 누락: ' + w); });
    var underlined = o.all('.sent .w.fresh').map(function(e){ return e.dataset.w; });
    var wantIdx = [];
    (x.words || []).forEach(function(u, i){ if ((x['new']||[]).indexOf(u) >= 0) wantIdx.push(String(i)); });
    T(underlined.join(',') === wantIdx.join(','), tag + ' 새 낱말 밑줄 위치가 원장 words 와 어긋남');

    /* 어제 문장 */
    var yb = o.doc.getElementById('yb');
    if (d > 1) {
      T(!!yb && yb.textContent === D.day(g, d-1).sent, tag + ' 어제 문장이 없거나 어긋남');
      if (yb) { yb.click(); T(o.tts().sent.slice(-1)[0].t === D.day(g, d-1).sent, tag + ' 어제 문장을 눌러도 소리가 안 남'); }
    } else {
      T(!yb, tag + ' 1일째인데 어제 문장이 붙어 있음');
    }

    /* 낱말 탭 = 그 낱말만 소리 (구두점 없이) */
    lit[lit.length-1].click();
    T(o.tts().word.slice(-1)[0] === x.tiles[x.tiles.length-1].replace(/[.,!?]/g,''),
      tag + ' 낱말 탭 소리가 구두점을 달고 나감');

    /* 다시 듣기 */
    var before = o.tts().sent.length;
    o.doc.getElementById('replay').click();
    T(o.tts().sent.length === before + 1, tag + ' 다시 듣기가 소리를 내지 않음');
  }
}

/* ══ ③ 2막 다섯 번 — 비계 축소가 말이 아니라 화면에서 줄어드는가 ══ */
await (async function(){
  var g = 4, d = 12, x = D.day(g, d);
  var o = open('?grade=' + g + '&day=' + d);
  await o.tick(6);
  o.doc.getElementById('go-say').click();
  await o.tick(4);

  for (var r = 1; r <= 5; r++) {
    var bubble = o.txt('.bubble');
    var soundsBefore = o.tts().sent.length;
    T(o.txt('.corner').indexOf(r + '번째') >= 0, r + '회차 표시가 어긋남');

    if (r <= 2) {
      T(bubble.replace(/\s+/g,' ').indexOf(x.tiles.join(' ')) >= 0, r + '회는 문장을 보여 줘야 한다');
    } else if (r <= 4) {
      T(bubble.indexOf(x.ko) >= 0, r + '회는 뜻을 보여 줘야 한다');
      T(bubble.replace(/\s+/g,' ').indexOf(x.tiles.join(' ')) < 0, r + '회인데 문장이 그대로 보임 — 비계가 안 줄었다');
    } else {
      T(bubble.indexOf(x.ko) < 0, '5회인데 뜻이 보임 — 소리만 듣는 회차가 아니다');
      T(bubble.replace(/\s+/g,' ').indexOf(x.tiles.join(' ')) < 0, '5회인데 문장이 보임');
    }
    /* 매회 소리로 시작한다 */
    T(soundsBefore >= 1 && o.tts().sent.slice(-1)[0].t === x.sent, r + '회 시작에 문장 소리가 없음');

    /* 틀린 타일은 자리에 놓이지 않는다 */
    var wrong = o.all('#pool .tile').filter(function(b){ return b.textContent !== x.tiles[0]; })[0];
    if (wrong) {
      wrong.click();
      T(wrong.classList.contains('used') === false, r + '회 틀린 타일이 자리에 놓임');
      T(o.all('#slot .placed').length === 0, r + '회 틀린 타일이 조립줄에 들어감');
      T(o.txt('#say').indexOf('아니에요') >= 0, r + '회 오답 안내가 없음');
    }

    assemble(o, x.tiles, r + '회');
    T(o.all('#slot .placed').length === x.tiles.length, r + '회 조립줄이 다 안 참');
    await o.tick(6);

    if (r < 5) {
      var stamps = o.all('.cell .stamp').length;
      T(stamps === r, r + '회 뒤 도장 ' + stamps + '개 (기대 ' + r + ')');
      T(o.txt('.corner').indexOf((r+1) + '번째') >= 0, r + '회 뒤 다음 회차로 안 넘어감');
    }
  }
  /* 다섯 번을 채우면 3막으로 */
  T(o.txt('.journey').length > 0 && o.doc.querySelector('.jstep.on').textContent.indexOf('넓히기') >= 0,
    '다섯 번을 채웠는데 3막으로 넘어가지 않음');
})();

/* ══ ④ 3막 넓히기 ══ */
await (async function(){
  /* 넓히기가 있는 날과 없는 날을 원장에서 실제로 찾아 둘 다 몰아본다 */
  var withEx = null, without = null;
  D.grades().forEach(function(g){
    for (var d = 1; d <= D.maxDay(g); d++) {
      var x = D.day(g, d);
      if (x.expand && x.expand.sent && !withEx) withEx = { g:g, d:d, x:x };
      if ((!x.expand || !x.expand.sent) && !without) without = { g:g, d:d, x:x };
    }
  });
  T(!!withEx, '원장에 넓히기 있는 날이 하나도 없음');

  async function toWiden(c){
    var o = open('?grade=' + c.g + '&day=' + c.d);
    await o.tick(6);
    o.doc.getElementById('go-say').click();
    await o.tick(4);
    for (var r = 1; r <= 5; r++) { assemble(o, c.x.tiles, '3막가는길'); await o.tick(6); }
    return o;
  }

  if (withEx) {
    var o = await toWiden(withEx);
    var ex = withEx.x.expand;
    var tiles = ex.sent.split(/\s+/);
    T(o.txt('.bubble').indexOf(ex.ko) >= 0, '넓히기 뜻이 안 보임');
    T(o.txt('.sheet').indexOf(ex.sent) < 0, '넓히기 정답 문장이 화면에 미리 노출됨');
    var fin = o.doc.getElementById('fin');
    T(fin.disabled === true, '조립 전인데 끝내기가 열려 있음');
    assemble(o, tiles, '넓히기');
    await o.tick(4);
    T(fin.disabled === false, '넓히기를 만들었는데 끝내기가 안 열림');
    T(o.tts().sent.slice(-1)[0].t === ex.sent, '만든 새 문장을 소리로 안 들려줌');
    fin.click();
    await o.tick(4);
    T(o.txt('.sheet').indexOf('내 것이 됐어요') >= 0, '마무리 화면이 안 뜸');
    T(o.doc.querySelector('.bigsun') !== null, '해도장이 없음');
    var m = JSON.parse(o.win.localStorage.getItem('kedu_english_done_g' + withEx.g) || '{}');
    T(m[withEx.d] === 1, '완주 기록이 남지 않음');
  }

  if (without) {
    var o2 = await toWiden(without);
    var sheet = o2.txt('.sheet');
    /* 없는 재료로 문장을 지어내지 않았는가 — 화면의 영어 문장은 오늘 것뿐 */
    T(sheet.indexOf('새 문장을 만들지 않아요') >= 0, '넓히기 없는 날인데 정직한 안내가 없음');
    T(o2.doc.getElementById('pool') === null, '넓히기 없는 날인데 조립판이 서 있음');
    var fin2 = o2.doc.getElementById('fin');
    T(fin2 && fin2.disabled === false, '넓히기 없는 날은 바로 끝낼 수 있어야 한다');
  } else {
    console.log('  · 원장에 넓히기 없는 날이 없음 — 해당 갈래는 건너뜀');
  }
})();

/* ══ ⑤ 둘러보기 ══ */
(function(){
  var g = 5;
  var o = open('', { pre: function(win){
    /* 완주 기록이 있는 상태로 연다 */
    win.localStorage.setItem('kedu_english_done_g' + g, JSON.stringify({ 3: 1 }));
  }});
  /* 기본 진입은 학년 목록 첫 학년 */
  T(o.all('.wrow').length === D.maxDay(D.grades()[0]), '둘러보기 줄 수가 원장 일수와 다름');
  var opts = o.all('#g option').map(function(e){ return +e.value; });
  T(opts.join(',') === D.grades().join(','), '둘러보기 학년 목록이 원장과 다름: ' + opts.join(','));
  var first = o.doc.querySelector('.wrow');
  T(first.querySelector('.s').textContent === D.day(D.grades()[0], 1).sent, '둘러보기 첫 문장이 원장과 다름');
  T(/day=1(&|$)/.test(first.getAttribute('href')), '둘러보기 링크가 일차를 안 달고 있음');

  /* 학년을 바꾸면 도장이 보인다 */
  var sel = o.doc.getElementById('g');
  sel.value = String(g);
  sel.onchange();
  T(o.all('.wrow').length === D.maxDay(g), '학년 전환 뒤 줄 수가 어긋남');
  var minis = o.all('.wrow .mini');
  T(minis.length === 1, '완주 도장이 ' + minis.length + '개 (기대 1)');
  T(o.all('.wrow')[2].querySelector('.mini') !== null, '완주 도장이 3일째에 안 붙음');
})();

/* ══ ⑥ 주소 ══ */
(function(){
  var o1 = open('?key=g5_english_c007');
  T(o1.txt('.head').indexOf('5학년 7일째') >= 0, 'c키 주소 해석 실패: ' + o1.txt('.head'));
  var o2 = open('?grade=6&day=' + D.maxDay(6));
  T(o2.txt('.head').indexOf('6학년 ' + D.maxDay(6) + '일째') >= 0, 'grade/day 주소 해석 실패');
  T(o2.doc.getElementById('nx').disabled === true, '마지막 날인데 내일 버튼이 열려 있음');
  var o3 = open('?grade=3&day=999');
  T(o3.txt('.head').indexOf('3학년 ' + D.maxDay(3) + '일째') >= 0, '범위 넘는 일차를 안 잘라냄');
  var o4 = open('?grade=3&day=0');
  T(o4.txt('.head').indexOf('3학년 1일째') >= 0, '0 이하 일차를 안 잘라냄');
  /* 원장 없는 학년 — 빈 화면을 만나면 안 된다 */
  var o5 = open('?grade=1&day=1');
  T(o5.txt('.head').indexOf(D.grades()[0] + '학년') >= 0, '원장 없는 학년이 첫 학년으로 안 접힘');
  T(o5.doc.querySelector('.sent') !== null, '원장 없는 학년에서 빈 화면이 뜸');
})();

/* ══ ⑦ 소리 없는 기기 — 활동 자체는 굴러가야 한다 ══ */
await (async function(){
  for (var mode = 0; mode < 2; mode++) {
    var label = mode === 0 ? '무음(실제 엔진)' : '엔진 없음';
    var g = 3, d = 2, x = D.day(g, d);
    var o = open('?grade=' + g + '&day=' + d,
      mode === 0 ? { realTts: true } : { noTts: true });
    await o.tick(6);
    T(o.all('.sent .w.in').length === x.tiles.length, label + ': 1막 문장이 안 켜짐');
    T(o.txt('.credit').indexOf('소리를 낼 수 없어요') >= 0, label + ': 소리 없음 안내가 없음');
    o.doc.getElementById('go-say').click();
    await o.tick(4);
    for (var r = 1; r <= 5; r++) { assemble(o, x.tiles, label); await o.tick(6); }
    T(o.doc.querySelector('.jstep.on').textContent.indexOf('넓히기') >= 0, label + ': 3막까지 못 감');
  }
})();

/* ══ ⑧ 미리보기로 열기(peek) — 교사가 돌려 봐도 아이 기록이 생기지 않는가 ══
      교실 공용 기기에서 선생님이 먼저 돌려 보는 일이 잦다. 그때 도장이 찍히면
      아이가 아직 만나지도 않은 날이 이미 끝난 것으로 남는다.
      끄는 것만으로는 부족하고, 끈 사실이 화면에 적혀 있어야 한다. */
await (async function(){
  /* 넓히기가 있는 날 하나를 원장에서 실제로 고른다 */
  var c = null;
  D.grades().forEach(function(g){
    for (var d = 1; d <= D.maxDay(g); d++) {
      var x = D.day(g, d);
      if (x.expand && x.expand.sent && !c) c = { g:g, d:d, x:x };
    }
  });
  if (!c) { console.log('  · 넓히기 있는 날이 없어 peek 완주 갈래를 건너뜀'); return; }

  async function runThrough(qs){
    var o = open(qs);
    await o.tick(6);
    o.doc.getElementById('go-say').click();
    await o.tick(4);
    for (var r = 1; r <= 5; r++) { assemble(o, c.x.tiles, 'peek'); await o.tick(6); }
    assemble(o, c.x.expand.sent.split(/\s+/), 'peek넓히기');
    await o.tick(4);
    o.doc.getElementById('fin').click();
    await o.tick(4);
    return o;
  }

  var base = '?grade=' + c.g + '&day=' + c.d;

  /* 미리보기로 열면 — 완주해도 아무것도 남지 않는다 */
  var pk = await runThrough(base + '&peek=1');
  T(pk.txt('.sheet').indexOf('내 것이 됐어요') >= 0, 'peek: 마무리 화면까지 못 감 — 같은 화면이어야 한다');
  var mp = pk.win.localStorage.getItem('kedu_english_done_g' + c.g);
  T(mp === null || Object.keys(JSON.parse(mp)).length === 0,
    'peek 로 열었는데 완주 기록이 남음: ' + mp);

  /* 그냥 열면 — 남는다(끄는 쪽만 검사하면 항상 안 남는 화면도 통과한다) */
  var nm = await runThrough(base);
  var mn = JSON.parse(nm.win.localStorage.getItem('kedu_english_done_g' + c.g) || '{}');
  T(mn[c.d] === 1, '평소 열기에서 완주 기록이 안 남음 — peek 판정 자체가 무의미해진다');

  /* 끈 사실이 화면에 적혀 있는가 */
  var p1 = open(base + '&peek=1'); await p1.tick(6);
  T(p1.doc.querySelector('.peeknote') !== null, 'peek 안내 띠가 없음 — 조용히 다르게 도는 화면');
  T(p1.txt('.peeknote').indexOf('기록이 남지 않아요') >= 0, 'peek 안내에 기록 이야기가 없음');
  var n1 = open(base); await n1.tick(6);
  T(n1.doc.querySelector('.peeknote') === null, '평소 열기인데 peek 안내가 뜸');

  /* 화면 안 통로가 peek 를 계속 물고 가는가 — 한 칸 옮기자 기록이 살아나면 안 된다 */
  var all1 = p1.doc.querySelector('.head .nav-ch a.chip');
  T(all1 && /peek=1/.test(all1.getAttribute('href')), 'peek 상태에서 「전체」 통로가 peek 를 잃음');
  var allN = n1.doc.querySelector('.head .nav-ch a.chip');
  T(allN && /peek/.test(allN.getAttribute('href')) === false, '평소 열기인데 「전체」 통로에 peek 가 붙음');

  /* 둘러보기(일차 없이 열기)도 마찬가지 */
  var b1 = open('?grade=' + c.g + '&peek=1'); await b1.tick(4);
  T(b1.doc.querySelector('.peeknote') !== null, 'peek 둘러보기에 안내 띠가 없음');
  var w1 = b1.doc.querySelector('.wrow');
  T(w1 && /peek=1/.test(w1.getAttribute('href')), 'peek 둘러보기 목록 링크가 peek 를 잃음');
  var b0 = open('?grade=' + c.g); await b0.tick(4);
  T(/peek/.test(b0.doc.querySelector('.wrow').getAttribute('href')) === false,
    '평소 둘러보기 링크에 peek 가 붙음');
  T(b1.all('.wrow').length === D.maxDay(c.g), 'peek 둘러보기 줄 수가 원장과 다름 — 다른 화면이 되면 안 된다');
})();

msgs.forEach(function(m){ console.log(m); });
console.log('\n오늘의 문장 3막 활동 — ' + pass + ' PASS / ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);

})();
