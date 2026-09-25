/* stage2/test_stage2.js — 2세대 무대 전수 하니스.
   ① 렌더 전수: 모든 데이터 파일의 모든 슬라이드를 renderSlide 로 그린다(정답 닫힘·열림 두 번). 예외 0 · 본문 빈 슬라이드 0.
   ② 무대 실주행: 과목마다 차시 몇 개를 stage.html 에 실제로 부팅해 끝까지 넘기고, 슬라이드마다 data-act 버튼을 전부 눌러 보고,
      정답 공개·목차·자료·타이머·뽑기·점수판·펜·스포트라이트·검은 화면·발문을 연다. 예외 0.
   실행: node kedu/teacher/stage2/test_stage2.js   (jsdom 필요: npm i jsdom)                           */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
let pass = 0, fail = 0; const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }

// ── 공용: 데이터 파일 로드 ──
function loadLessons(file) {
  const L = {}; const ctx = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } }; ctx.window.window = ctx.window;
  vm.createContext(ctx); vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file }); return ctx.window.LESSONS || {};
}
// ── ① 렌더 전수 ──
const dom0 = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' });
const g0 = dom0.window; g0.KT2_NO_BOOT = true;
vm.runInContext(fs.readFileSync(path.join(__dirname, 'stage2-art.js'), 'utf8'), dom0.getInternalVMContext(), { filename: 'stage2-art.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'stage2-fig.js'), 'utf8'), dom0.getInternalVMContext(), { filename: 'stage2-fig.js' });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'stage2.js'), 'utf8'), dom0.getInternalVMContext(), { filename: 'stage2.js' });
const KT2 = g0.KT2;
const files = fs.readdirSync(DATA).filter(f => /^g\d_[a-z]+_u\d+\.js$/.test(f)).sort();
let nSlides = 0, nLessons = 0; const blockSeen = {}; const fragBlocks = {}; let emptyBodies = [];
files.forEach(f => {
  const L = loadLessons(path.join(DATA, f));
  Object.keys(L).forEach(k => {
    const les = L[k]; nLessons++;
    (les.slides || []).forEach(s => {
      nSlides++; blockSeen[s.block] = (blockSeen[s.block] || 0) + 1;
      [false, true].forEach(rev => {
        try {
          const r = KT2.renderSlide(s, { revealed: rev, state: {}, meta: les.meta || {}, unitTitle: 'U', classNames: [] });
          ok(typeof r.body === 'string', f + ' ' + k + ' ' + s.id + ' body string');
          if (!r.cover && !r.body.trim()) emptyBodies.push(f + ' ' + k + ' ' + s.id + ' ' + s.block);
          if (rev === false && r.frag) fragBlocks[s.block] = (fragBlocks[s.block] || 0) + 1;
        } catch (e) { fail++; fails.push(f + ' ' + k + ' ' + s.id + ' (' + s.block + ') 예외: ' + e.message); }
      });
    });
  });
});
ok(emptyBodies.length === 0, '본문 빈 슬라이드 ' + emptyBodies.length + ': ' + emptyBodies.slice(0, 8).join(' | '));
{ const r = KT2.md('가<br>나 <b>다</b> <script>x</script>'); ok(r === '가<br>나 <strong>다</strong> &lt;script&gt;x&lt;/script&gt;', 'md: <br>·<b> 만 살리고 다른 태그는 글자로 (' + r + ')'); }
{ const A = g0.KT2_ART; ['🐻', '🐧', '👧', '👦', '🐿️', '🐿'].forEach(f => ok(/^<svg class="chr c-/.test(A.character(f)) && /class="eyes"/.test(A.character(f)) && /class="m-open" opacity="0"/.test(A.character(f)), '인물 층: ' + f + ' → 그림 인물(눈·입 포함, 입은 기본 닫힘)')); ['🧺', '📦', '❓', '', undefined].forEach(f => ok(A.character(f) === '', '인물 층: ' + f + ' → 이모지 그대로'));
  ['🐰', '🦉', '🐱', '🐯', '🦆', '🐦', '🐝', '🦋', '🙂', '😊', '😀', '🤩', '😋', '🤔', '😮', '😟', '😐', '🙆'].forEach(f => { const c = A.character(f); ok(/^<svg class="chr c-[a-z-]+ cast"/.test(c) && /class="eyes"/.test(c) && /class="bodyg"/.test(c) && /class="head"/.test(c) && /class="m-open" opacity="0"/.test(c) && !A.isMain(f), '조연 층: ' + f + ' → 그림 조연(눈·몸·고개·입, 안내 인물 아님)'); });
  ['🐻', '🐧', '👧', '👦', '🐿️'].forEach(f => ok(A.isMain(f) && !/ cast"/.test(A.character(f)), '조연 층: 주인공 ' + f + ' 은 cast 아님'));
  ok(/class="wing wl"/.test(A.character('🐝')) && /class="wing wr"/.test(A.character('🦋')), '조연 층: 벌·나비는 날개(wing) 좌우');
  { const fs2 = ['🙂','😀','😋','🤔','😮','😟','😐'].map(f => A.character(f).replace(/aria-label="[^"]*"/, '').replace(/c-friend-[a-z]+/, '')); ok(new Set(fs2).size === 7, '조연 층: 기분 얼굴 일곱은 서로 다른 얼굴'); }
  const r1 = KT2.renderSlide({ id: 'x', block: 'motivate', data: { title: '공원', kids: [{ face: '👧', label: '하나 "같이 놀자!"' }, { face: '🐰', label: '토끼' }, { face: '🧺', label: '바구니' }] } }, { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] });
  ok((r1.body.match(/class="face chr"/g) || []).length === 2 && /c-rabbit cast/.test(r1.body) && /<div class="face">🧺<\/div>/.test(r1.body), '인물 층: 주인공·조연은 그림, 모르는 얼굴은 이모지 (kidCard)'); }
{ const r2 = KT2.renderSlide({ id: 'y', block: 'interactive_number_line', data: { range: [0, 10], start: 4 } }, { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] });
  ok(/numline hero/.test(r2.body) && /class="nl-hero" style="left:40%"/.test(r2.body) && (r2.body.match(/data-act="nl"/g) || []).length === 11, '징검다리: 지금 수(4) 돌 위에 도토 · 돌 11개 조작 그대로');
  const r3 = KT2.renderSlide({ id: 'z', block: 'interactive_number_line', data: { range: [0, 10], start: 4 } }, { revealed: false, state: { position: 7 }, meta: {}, unitTitle: 'U', classNames: [] });
  ok(/class="nl-hero" style="left:70%"/.test(r3.body), '징검다리: 움직이면 도토도 옮겨 선다 (7)'); }
// ── 15차: 안내 인물 · 빠진 내용 되살리기 · 큐브 계단 ──
{ const C = { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] };
  const g = Object.assign({}, C, { guide: ['🐻', '🐧'] });
  const a = KT2.renderSlide({ id: 'c', block: 'concept', data: { title: 't', content: '열이 **하나**' } }, g);
  ok(/class="guide-say l"/.test(a.body) && /class="g-chr"><svg class="chr c-bear/.test(a.body) && /class="g-bub"><div class="big-text">열이 <strong>하나<\/strong><\/div>/.test(a.body), '안내 인물: 개념 글 = 첫 인물(곰이)이 왼쪽에서 말풍선으로');
  const a0 = KT2.renderSlide({ id: 'c', block: 'concept', data: { title: 't', content: '열이 하나' } }, C);
  ok(!/guide-say/.test(a0.body) && /<div class="big-text">열이 하나<\/div>/.test(a0.body), '안내 인물: 인물 없는 차시는 종전 그대로');
  const b = KT2.renderSlide({ id: 'b', block: 'basic_problem', data: { title: 't', scenario: { icon: '🍬', body: '사탕이 5개' }, question: '몇 개?' } }, g);
  ok(/class="guide-say r q"/.test(b.body) && /c-penguin/.test(b.body) && /class="sc-ic">🍬/.test(b.body), '안내 인물: 문제 상황 = 짝 인물(펭이)이 오른쪽에서 마주 보고');
  const b1 = KT2.renderSlide({ id: 'b', block: 'real_world', data: { title: 't', scenario: { body: 'x' } } }, Object.assign({}, C, { guide: ['👧'] }));
  ok(/guide-say r q/.test(b1.body) && /c-girl/.test(b1.body), '안내 인물: 짝이 없으면 첫 인물이 문제도 들려준다');
  const kx = KT2.renderSlide({ id: 'k', block: 'concept', data: { title: 't', content: 'x', kids_after: [{ face: '👧', label: '하나' }] } }, g);
  ok(!/guide-say/.test(kx.body), '안내 인물: 인물 장면(kids_after)이 있는 개념엔 겹쳐 세우지 않는다');
  ok(JSON.stringify(KT2.guideOf({ slides: [{ data: { kids: [{ face: '🐰' }, { face: '👦' }] } }, { data: { kids: [{ face: '👦' }, { face: '🐿️' }, { face: '🐻' }] } }] })) === JSON.stringify(['👦', '🐿️']), '안내 인물: 차시의 kids 에서 그림 인물 둘(모르는 얼굴 건너뜀·중복 없음)');
  const o = KT2.renderSlide({ id: 'o', block: 'objective', data: { title: 't', bullets: ['가', '나', '다'] } }, C);
  ok((o.body.match(/<li>/g) || []).length === 3 && /obj-list/.test(o.body), '되살림: 목표 bullets → 번호 목록(빈 목표 카드였음)');
  const sm = KT2.renderSlide({ id: 's', block: 'concept', data: { title: 't', content: 'x', symbol_meanings: [{ symbol: '자음자', meaning: 'ㄱ ㄴ' }, { symbol: '모음자', meaning: 'ㅏ ㅓ' }] } }, C);
  ok((sm.body.match(/class="sym"/g) || []).length === 2 && /<b>자음자<\/b><span>ㄱ ㄴ<\/span>/.test(sm.body), '되살림: 개념 symbol_meanings → 낱말 카드');
  const vd = KT2.renderSlide({ id: 'v', block: 'visual_demo', data: { title: 't', sub_text: '두 가지로 읽어요' } }, C);
  ok(/두 가지로 읽어요/.test(vd.body), '되살림: visual_demo sub_text');
  const tp = KT2.renderSlide({ id: 'p', block: 'interactive_ten_frame', data: { title: 't', start_count: 3, prompt: '4개를 더 눌러요' } }, C);
  ok(/4개를 더 눌러요/.test(tp.body), '되살림: 십 배열판 prompt');
  const cs = KT2.renderSlide({ id: 'q', block: 'interactive_cube_stairs', data: { title: 't', start_count: 3 } }, Object.assign({}, C, { state: { count: 5 } }));
  ok(/i-cube-area grass/.test(cs.body) && (cs.body.match(/class="cube"/g) || []).length === 5 && /class="cb-hero"><svg class="chr c-squirrel/.test(cs.body) && /data-act="cb-plus"/.test(cs.body), '큐브 쌓기: 풀밭 위 탑(5) 꼭대기에 도토 · 조작 버튼 그대로');
  const st2 = KT2.renderSlide({ id: 'w', block: 'concept', data: { title: 't', linking_cube_staircase: { range: [1, 5] } } }, C);
  ok((st2.body.match(/cb-hero/g) || []).length === 1 && /cubes grass/.test(st2.body), '큐브 계단: 도토는 가장 높은 탑에만');
}
// 데이터에 있는데 무대가 안 그리는 필드 0 (메타·장식 필드만 예외) — 1·2세대 모두 목표 bullets 211 · symbol_meanings 232 를 버리고 있었다
{ const src = fs.readFileSync(path.join(__dirname, 'stage2.js'), 'utf8') + fs.readFileSync(path.join(__dirname, 'stage2-activity.js'), 'utf8');
  const ALLOW = new Set(['review.from', 'cover.subtitle', 'motivate.visual']); const miss = {};
  files.forEach(f => { const L = loadLessons(path.join(DATA, f)); Object.keys(L).forEach(k => (L[k].slides || []).forEach(s => Object.keys(s.data || {}).forEach(key => { const t = s.block + '.' + key; if (ALLOW.has(t)) return; if (!new RegExp('d\\.' + key + '\\b|[\'"]' + key + '[\'"]').test(src)) miss[t] = (miss[t] || 0) + 1; }))); });
  ok(Object.keys(miss).length === 0, '안 그리는 데이터 필드 0: ' + JSON.stringify(miss)); }
{ const C0 = { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] };
  const bt = KT2.renderSlide({ id: 'bt', block: 'concept', data: { title: 't', items: [{ emoji: '🟦', count: 58, label: '58' }, { emoji: '🍎', count: 7, label: '7' }] } }, C0);
  ok(/class="base-ten"/.test(bt.body) && (bt.body.match(/class="bt-t"/g) || []).length === 5 && (bt.body.match(/class="bt-o"/g) || []).length === 8 && (bt.body.match(/<span>🍎<\/span>/g) || []).length === 7, '수 모형: 20 넘는 개수는 십 막대 5·낱개 8, 작은 개수는 이모지 그대로');
  const b2 = KT2.renderSlide({ id: 'b2', block: 'concept', data: { title: 't', items: [{ emoji: '🟥', count: 104 }] } }, C0);
  ok((b2.body.match(/class="bt-h"/g) || []).length === 1 && (b2.body.match(/class="bt-t"/g) || []).length === 0 && (b2.body.match(/class="bt-o"/g) || []).length === 4, '수 모형: 104 = 백 1·십 0·일 4');
  const cl = { id: 'cl', block: 'card_arrange', data: { title: 't', cards: ['책', '공', '휴지'], target: ['상자', '공', '기둥'] } };
  const c1 = KT2.renderSlide(cl, C0); ok((c1.body.match(/class="ca-bin"/g) || []).length === 3 && (c1.body.match(/class="ca-chip/g) || []).length === 3 && !/i-card/.test(c1.body), '분류형 카드: 통 3 · 카드 3 (순서 맞추기 아님)');
  const c2 = KT2.renderSlide(cl, { revealed: false, state: { assign: { 0: '상자', 1: '공', 2: '상자' } }, meta: {}, unitTitle: 'U', classNames: [] });
  ok((c2.body.match(/ca-chip in wrong/g) || []).length === 1 && !/잘했어요/.test(c2.body), '분류형 카드: 틀린 통에 담은 카드 표시');
  const c3 = KT2.renderSlide(cl, Object.assign({}, C0, { revealed: true })); ok((c3.body.match(/ca-chip in"/g) || []).length === 3, '분류형 카드: 정답 공개 = 모두 제 통에');
  { const pq = { id: 'pq', block: 'basic_problem', data: { title: 't', question: '42 - 19 는?', answer: 23, note: '풀이: 12-9=3 → 23.' } };
    ok(!/풀이/.test(KT2.renderSlide(pq, C0).body) && /풀이/.test(KT2.renderSlide(pq, Object.assign({}, C0, { revealed: true })).body), '풀이 쪽지: 정답 열 때만'); }
  const c4 = KT2.renderSlide({ id: 'so', block: 'card_arrange', data: { cards: [3, 1, 2] } }, C0); ok(/class="i-cards"/.test(c4.body) && !/ca-bin/.test(c4.body), '순서 카드: 수 정렬은 종전 그대로'); }
// ── 21차 개념 그림 층(stage2-fig.js) — 데이터 fig 전수 · 수평대 기울기 방향 · 화살표 s<m<l · 범례 · 개념 장에만 ──
{ const FG = g0.KT2_FIG; const C0 = { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] };
  const byFile = {}; let figBad = [];
  const walk = (f, cb) => { if (!f || typeof f !== 'object') return; cb(f); (f.items || []).forEach(p => walk(p && p.fig ? p.fig : null, cb)); };
  files.forEach(fn => { const L = loadLessons(path.join(DATA, fn)); Object.keys(L).forEach(k => (L[k].slides || []).forEach(s => { if (!s.data || !s.data.fig) return;
    byFile[fn] = (byFile[fn] || 0) + 1; const f = s.data.fig; const tag = fn + ' ' + k + ' ' + s.id;
    if (s.block !== 'concept') figBad.push(tag + ' 개념 장 아님(' + s.block + ')');
    const h = FG.render(f); if (!h) figBad.push(tag + ' 그림 빈 글자');
    walk(f, x => { if (FG.parts.indexOf(x.k) < 0) figBad.push(tag + ' 모르는 부품 ' + x.k); if (x.k === 'tools' || x.k === 'chain') (x.items || []).forEach(c => { if (FG.icons.indexOf(c.name) < 0 && !c.emoji) figBad.push(tag + ' 아이콘 없음 ' + c.name); }); });
    const r = KT2.renderSlide(s, C0); if (!/class="fig" data-fig=/.test(r.body)) figBad.push(tag + ' 무대에 그림 안 섬');
    if (/<text[^>]*>[^<]*(undefined|NaN)/.test(h) || /NaN/.test(h)) figBad.push(tag + ' NaN/undefined');
    walk(f, x => { if (x.k === 'balance') { const m = (FG.render(x).match(/data-ang="(-?[\d.]+)"/) || [])[1]; const a = +m; const want = x.l === x.r ? 0 : x.l > x.r ? -1 : 1; if (Math.sign(a) !== want) figBad.push(tag + ' 수평대 방향 ' + x.l + '·' + x.r + ' → ' + a); } });
  })); });
  ok(figBad.length === 0, '개념 그림 층: 데이터 fig 전수(부품·아이콘·수평대 방향·개념 장·무대) ' + figBad.slice(0, 6).join(' | '));
  ok(byFile['g3_science_u1.js'] === 29, '개념 그림 층: 3학년 과학 1단원 개념 장 29장에 그림 (' + byFile['g3_science_u1.js'] + ')');
  console.log('   개념 그림 층 데이터', JSON.stringify(byFile));
  const S = FG.sizes; ok(S.s < S.m && S.m < S.l, '개념 그림 층: 화살표 길이 s<m<l');
  const lens = (h) => (h.match(/data-len="(\d+)"/g) || []).map(x => +x.replace(/\D/g, ''));
  const hs = FG.render({ k: 'force', act: 'push', obj: 'ball', size: 's' }), hl = FG.render({ k: 'force', act: 'push', obj: 'ball', size: 'l' });
  ok(lens(hs)[0] < lens(hl)[0] && /class="f-arrow a-s"/.test(hs) && /class="f-arrow a-l"/.test(hl), '개념 그림 층: 약하게(s) 화살표가 세게(l)보다 짧고 가늘다');
  ok(/fig-key/.test(hs) && !/fig-key/.test(FG.render({ k: 'balance', l: 2, r: 2 })) && !/fig-key/.test(FG.render({ k: 'force', act: 'none' })), '개념 그림 층: 화살표 있는 그림에만 범례 칩');
  ok(/수평/.test(FG.render({ k: 'balance', l: 3, r: 3 })) && /왼쪽으로 기욺/.test(FG.render({ k: 'balance', l: 5, r: 2 })) && /오른쪽으로 기욺/.test(FG.render({ k: 'balance', l: 1, r: 4 })), '개념 그림 층: 수평대 캡션 자동(수평·왼쪽·오른쪽)');
  ok((FG.render({ k: 'panels', items: [{ label: 'a', fig: { k: 'force' } }, { label: 'b', fig: { k: 'lever' } }, { label: 'c', fig: { k: 'slope' } }] }).match(/class="fig-panel"/g) || []).length === 3 && FG.render({ k: 'nope' }) === '' && FG.render(null) === '', '개념 그림 층: 나란히 3칸 · 모르는 부품/없음은 빈 글자');
  const plain = { id: 'p', block: 'concept', data: { title: 't', content: '힘' } }; ok(!/class="fig"/.test(KT2.renderSlide(plain, C0).body), '개념 그림 층: fig 없는 장은 종전 그대로(diff-0)'); }
let chrAll = 0;
let brLeak = 0; files.forEach(f => { const L = loadLessons(path.join(DATA, f)); Object.keys(L).forEach(k => (L[k].slides || []).forEach(s => { const r = KT2.renderSlide(s, { revealed: false, state: {}, meta: L[k].meta || {}, unitTitle: 'U', classNames: [] }); if (/&lt;br|&lt;b&gt;/.test(r.body + r.title)) brLeak++; })); }); ok(brLeak === 0, '글자로 새는 <br>/<b> 슬라이드 ' + brLeak);
console.log('① 렌더 전수 — 파일', files.length, '· 차시', nLessons, '· 슬라이드', nSlides, '× 2(정답 닫힘·열림)');
console.log('   블록 종류', Object.keys(blockSeen).length, '· 조각 공개 블록', Object.keys(fragBlocks).length, '· 본문 빈 슬라이드', emptyBodies.length);

// ── ② 무대 실주행 ──
const manifest = (() => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(__dirname, 'manifest.js'), 'utf8'), c); return c.window.KT2_MANIFEST; })();
ok(manifest && manifest.lessons === nLessons, 'manifest 차시 수 = 데이터 차시 수 (' + (manifest && manifest.lessons) + ' vs ' + nLessons + ')');
const html = fs.readFileSync(path.join(__dirname, 'stage.html'), 'utf8');
function runStage(sj, un, l) {
  const url = 'https://keduclass.com/kedu/teacher/stage2/stage.html?g=' + sj.grade + '&s=' + sj.subject + '&u=' + un.unit + '&l=' + l.key;
  const dom = new JSDOM(html.replace(/<script src="[^"]+"><\/script>/g, ''), { url, pretendToBeVisual: true, runScripts: 'outside-only' });
  const w = dom.window; const d = w.document; w.KT2_NO_BOOT = true; w.setInterval = () => 0;
  w.HTMLCanvasElement.prototype.getContext = () => null; w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  const ctx = dom.getInternalVMContext();
  const run = (p) => vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: path.basename(p) });
  w.LESSONS = {}; run(path.join(__dirname, 'manifest.js')); run(path.join(DATA, path.basename(un.file))); if (un.resources) run(path.join(ROOT, un.resources));
  run(path.join(ROOT, 'engine/klab.js')); run(path.join(ROOT, 'engine/tools/shape3d.js')); run(path.join(ROOT, 'engine/tools/place_value.js'));
  run(path.join(__dirname, 'stage2-art.js')); run(path.join(__dirname, 'stage2-fig.js')); run(path.join(__dirname, 'stage2.js'));
  const tag = sj.slug + '/' + l.key;
  let st;
  try { st = new w.KT2.Stage({ params: { g: String(sj.grade), s: sj.subject, u: String(un.unit), l: l.key }, lessons: w.LESSONS, unitTitle: un.title }); } catch (e) { fail++; fails.push(tag + ' 부팅 예외: ' + e.message); return; }
  ok(st.slides.length === l.slides, tag + ' 슬라이드 수 ' + st.slides.length + ' = ' + l.slides);
  ok(d.querySelector('#kt2-paper').innerHTML.length > 100, tag + ' 첫 슬라이드 그림');
  ok(d.querySelector('#hud button[data-h="next"]'), tag + ' HUD 생성');
  ok(d.querySelector('#kt2-paper.anim, #kt2-paper .anim'), tag + ' 연출(anim) 걸림');
  ok(d.querySelector('#fx'), tag + ' 축하 캔버스');
  // 케이에듀 학급 명단(가짜 DB) → 뽑기·발표 뽑기
  try {
    w.supabase = {}; w.getKeduDb = () => ({ auth: { getUser: () => Promise.resolve({ data: { user: { id: 't1' } } }) }, from: (tbl) => { const q = { select: () => q, eq: () => q, order: () => q, limit: () => q, then: (fn) => Promise.resolve(tbl === 'class_codes' ? { data: [{ id: 'c1', label: '1학년 3반' }] } : { data: [{ nickname: '김하나', seat_no: 2 }, { nickname: '이둘', seat_no: 1 }] }).then(fn) }; return q; } });
    rosterChecks.push(st.loadRoster().then(() => { ok(st.rosterSrc === 'kedu' && st.classNames[0] === '1번 이둘' && st.classNames[1] === '2번 김하나', tag + ' 케이에듀 학급 명단 → 뽑기(번호순)'); st.openPick(); ok((d.querySelector('#ov-pick .pick-src').textContent || '').indexOf('1학년 3반') >= 0, tag + ' 뽑기 출처 표시'); st.closeOv(); }));
  } catch (e) { fail++; fails.push(tag + ' 명단 예외: ' + e.message); }
  if (!global.__cloudTested && st.slides.length > 2) { global.__cloudTested = true;
    const calls = []; const sid = st.slides[1].id;
    const mk = (row, err) => () => ({ auth: { getUser: () => Promise.resolve({ data: { user: { id: 't1' } } }) }, from: (tbl) => { const q = { select: () => q, eq: () => q, maybeSingle: () => Promise.resolve(err ? { error: { code: '42P01' } } : { data: row }), upsert: (v, o) => { calls.push(['up', v, o]); return Promise.resolve({}); }, delete: () => { const dq = { eq: () => dq, then: (f, r) => { calls.push(['del']); return Promise.resolve({}).then(f, r); } }; return dq; } }; return q; } });
    w.getKeduDb = mk(null, true); const origPlan = JSON.stringify(st.plan);
    rosterChecks.push(st.cloudInit().then(() => { ok(st.cloud === 'off' && !st._db, '판 서버: 표 없음(42P01) → 조용히 이 기기에만');
      w.getKeduDb = mk({ plan: { skip: [sid], updated: '2999-01-01T00:00:00' } }); return st.cloudInit(); }).then(() => {
      ok(st.cloud === 'on' && st.plan.skip.indexOf(sid) >= 0 && !st.slides.find(x => x.id === sid).included, '판 서버: 서버 판이 더 새것 → 불러와 적용(건너뛰기)');
      ok(/☁/.test(d.querySelector('#hud button[data-h="toc"]').innerHTML), '판 서버: 목차 배지 ☁');
      st.pushPlan(); ok(calls.length && calls[0][0] === 'up' && calls[0][1].slug === st.slug && calls[0][1].lesson_key === st.key && calls[0][1].plan.skip[0] === sid && calls[0][2].onConflict === 'teacher_id,slug,lesson_key', '판 서버: 올리기 = 교사×차시 한 줄 upsert');
      st.resetPlan(); return Promise.resolve(); }).then(() => new Promise(r => setTimeout(r, 0))).then(() => { ok(calls.some(c => c[0] === 'del'), '판 서버: 원래대로 되돌리기 → 서버 줄도 지움'); clearTimeout(st._pt); }));
  }
  let zoomN = 0, misOk = true, bubN = 0, picN = 0, chipN = 0, illusN = 0, guideN = 0;
  let guard = 0, acts = 0, frags = 0;
  while (st.idx < st.slides.length - 1 && guard++ < 2000) {
    const before = st.idx;
    // 슬라이드 안 버튼 전부 눌러 보기(정답·조작)
    const paper = d.querySelector('#kt2-paper');
    Array.from(paper.querySelectorAll('[data-act]')).slice(0, 40).forEach(b => { try { st.act(b); acts++; } catch (e) { fail++; fails.push(tag + ' #' + (st.idx + 1) + ' act ' + b.getAttribute('data-act') + ' 예외: ' + e.message); } });
    if (st.idx % 2 === 0) try { st.revealAll(); st.revealAll(); } catch (e) { fail++; fails.push(tag + ' #' + (st.idx + 1) + ' revealAll 예외: ' + e.message); }
    try { st.next(); } catch (e) { fail++; fails.push(tag + ' #' + (st.idx + 1) + ' next 예외: ' + e.message); break; }
    if (st.idx === before) frags++;
    { const p2 = d.querySelector('#kt2-paper'); zoomN += p2.querySelectorAll('.zoomable').length; bubN += p2.querySelectorAll('.kid.talk .bub').length; guideN += p2.querySelectorAll('.guide-say .g-chr svg.chr').length; chrAll += p2.querySelectorAll('.kid .face.chr svg.chr').length; picN += p2.querySelectorAll('.picture .bd').length; chipN += p2.querySelectorAll('svg.tenframe.chips .chip').length; p2.querySelectorAll('.img-frame img').forEach(im => { w.KT2.imgFallback(im); }); illusN += p2.querySelectorAll('.img-frame.illus .bd').length; if (st.cur().block === 'misconception' && p2.querySelectorAll('.mis-card').length !== 2) misOk = false; if (p2.querySelector('.zoomable')) { const z = p2.querySelector('.zoomable'); st.toggleZoom(z); if (!z.classList.contains('zoomed')) misOk = misOk && false; st.toggleZoom(z); } }
  }
  ok(st.idx === st.slides.length - 1, tag + ' 끝까지 넘김 (' + (st.idx + 1) + '/' + st.slides.length + ')');
  // 도구
  ['openToc', 'openRes', 'openTimer', 'openPick', 'openScore'].forEach(fn => { try { st[fn](); st.closeOv(); } catch (e) { fail++; fails.push(tag + ' ' + fn + ' 예외: ' + e.message); } });
  try { st.setPen(true); st.setPen(false); st.setSpot(true); st.setSpot(false); st.setBlack(true); st.setBlack(false); st.setTnote(true); st.setTnote(false); st.timerStart(60); st.timerTick(); st.timerPause(); st.prev(); st.go(0, -1); } catch (e) { fail++; fails.push(tag + ' 도구 예외: ' + e.message); }
  // 자료 열기(영상 → iframe)
  const vid = st.extras.find(e => e.type === 'video' && (e.video_id || /v=/.test(e.url || '')));
  if (vid) { try { st.openExtra(vid.id); ok(!!d.querySelector('#ov-media iframe'), tag + ' 영상 오버레이 iframe'); st.closeOv(); } catch (e) { fail++; fails.push(tag + ' openExtra 예외: ' + e.message); } }
  // 편집 층(우리 반 판)
  try {
    const n0 = st.slides.length; st.go(1, 1);
    st.setEdit(true); ok(d.body.classList.contains('editing') && d.querySelector('#kt2-paper .editable'), tag + ' 편집 모드 · 글자 편집 가능');
    const ed = d.querySelector('#kt2-paper .editable'); if (ed) { ed.innerHTML = '고친 글자 ' + tag; ed.dispatchEvent(new w.Event('blur')); }
    st.plan.imgs[st.cur().id] = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; st.savePlan();
    st.setEdit(false); st.paint(0, true);
    ok(d.querySelector('#kt2-paper').innerHTML.indexOf('고친 글자 ' + tag) >= 0, tag + ' 글자 덮어쓰기 유지');
    ok(!!d.querySelector('#kt2-paper .img-frame.user img'), tag + ' 사진 자리 채움');
    st.addSlide('ask'); ok(st.slides.length === n0 + 1 && st.cur()._added && st.cur().block === 'question', tag + ' 발문 슬라이드 추가');
    st.setEdit(false); const addedId = st.cur().id; const i0 = st.idx; st.moveSlide(i0, -1); ok(st.slides[i0 - 1].id === addedId, tag + ' 슬라이드 이동');
    st.setTnote(true); st.setEdit(true); st.paintTnote(); const ta = d.querySelector('#tn-edit'); ok(!!ta, tag + ' 발문 편집 칸'); if (ta) { ta.value = '왜 그럴까요?\n👀 거꾸로 세기'; d.querySelector('#tn-save').click(); } st.setEdit(false); st.paintTnote(); ok((d.querySelector('#tnote').textContent || '').indexOf('왜 그럴까요') >= 0, tag + ' 발문 저장·표시'); st.setTnote(false);
    const exp = st.exportPlan(); ok(JSON.parse(exp).added.length === 1, tag + ' 내보내기');
    st.removeAdded(addedId); ok(st.slides.length === n0, tag + ' 추가 슬라이드 지우기');
    ok(st.importPlan(exp) && st.slides.length === n0 + 1, tag + ' 가져오기');
    // 자료 연결 v2
    ok(st.attachRes('https://www.youtube.com/watch?v=Qxi-dPmsl-Q', '테스트 영상') && st.fitFor(st.cur()).some(e => e.mine && e.video_id === 'Qxi-dPmsl-Q'), tag + ' 영상 붙이기 → 이 슬라이드에 맞는 자료');
    ok(!st.attachRes('abc', ''), tag + ' 잘못된 주소 거절');
    st.paint(0, true); ok(!!d.querySelector('#kt2-paper .kt2-res-badge'), tag + ' 📎 배지');
    st.openRes(); ok(d.querySelector('#ov-res #res-url') && d.querySelector('#ov-res .res.fit') && /youtube\.com\/results/.test(d.querySelector('#ov-res a[href*="results"]').getAttribute('href')), tag + ' 서랍: 붙이기 칸·우리 반 자료·유튜브 찾기'); 
    const myId = st.fitFor(st.cur()).find(e => e.mine).id; st.markBroken(myId); ok(!st.fitFor(st.cur()).some(e => e.id === myId), tag + ' 안 열려요 → 제외'); st.markBroken(myId); st.closeOv();
    const s7 = st.sevenOf(); ok(s7.length === 7, tag + ' 7요소 판정 ' + s7.filter(Boolean).length + '/7');
    st.resetPlan(); ok(st.slides.length === n0 && !st.planDirty(), tag + ' 원래 차시로');
    st.openToc(); ok(d.querySelectorAll('#ov-toc .seven span').length === 8 && d.querySelector('#ov-toc .toc-tools [data-a="ask"]'), tag + ' 목차 7요소·도구'); st.closeOv();
  } catch (e) { fail++; fails.push(tag + ' 편집 층 예외: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  // 건너뛰기
  if (st.slides.length > 3) { st.slides[1].included = false; st.go(0, -1); st.fragMax = 0; st.next(); ok(st.idx === 2, tag + ' 건너뛰기(2번 제외 → 3번으로)'); st.slides[1].included = true; }
  ok(misOk, tag + ' 오개념 두 칸·확대 토글');
  try { st.celebrate(); st.pop(); st.hudAct('still', d.querySelector('#hud button[data-h="still"]')); st.hudAct('still', d.querySelector('#hud button[data-h="still"]')); st.hudAct('sound', d.querySelector('#hud button[data-h="sound"]')); } catch (e) { fail++; fails.push(tag + ' 연출 도구 예외: ' + e.message); }
  ok(true, tag + ' 실주행 ' + acts + ' 조작 · ' + frags + ' 조각 · 확대 가능 ' + zoomN + ' · 말풍선 ' + bubN);
  bubAll += bubN; picAll += picN; illusAll += illusN; guideAll += guideN;
  return { acts, frags };
}
const rosterChecks = [];
let ran = 0, actsAll = 0, fragsAll = 0, bubAll = 0, picAll = 0, illusAll = 0, guideAll = 0;
manifest.subjects.forEach(sj => {
  // 과목마다: 각 단원의 첫 차시 + 조작 많은 차시 하나
  sj.units.forEach(un => {
    const picks = [un.lessons[0]];
    const inter = un.lessons.slice().sort((a, b) => b.interactive - a.interactive)[0]; if (inter && inter !== picks[0]) picks.push(inter);
    picks.forEach(l => { const r = runStage(sj, un, l); if (r) { ran++; actsAll += r.acts; fragsAll += r.frags; } });
  });
});
Promise.all(rosterChecks).then(() => {
console.log('② 무대 실주행 —', ran, '차시 부팅 · 슬라이드 안 조작', actsAll, '회 · 조각 공개', fragsAll, '회 · 말풍선', bubAll, '· 장면 무대', picAll, '· 사진 폴백 무대', illusAll, '· 그림 인물', chrAll);
ok(chrAll > 0, '인물 층: 무대 실주행에서 그림 인물이 선다 (' + chrAll + ')');
ok(guideAll > 0, '안내 인물: 무대 실주행에서 개념·문제 말풍선 인물이 선다 (' + guideAll + ')'); console.log('   안내 인물(개념·문제 말풍선)', guideAll);
console.log('결과: PASS', pass, '· FAIL', fail);
if (fail) { console.log(fails.slice(0, 40).join('\n')); process.exit(1); }
});
