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
const files = fs.readdirSync(DATA).filter(f => /^g\d(?:s\d)?_[a-z]+_u\d+\.js$/.test(f)).sort();
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
  const byFile = {}; let figBad = []; let textCards = 0, mathParts = 0;
  const walk = (f, cb) => { if (!f || typeof f !== 'object') return; cb(f); (f.items || []).forEach(p => walk(p && p.fig ? p.fig : null, cb)); };
  files.forEach(fn => { const L = loadLessons(path.join(DATA, fn)); Object.keys(L).forEach(k => (L[k].slides || []).forEach(s => { if (!s.data || !s.data.fig) return;
    byFile[fn] = (byFile[fn] || 0) + 1; const f = s.data.fig; const tag = fn + ' ' + k + ' ' + s.id;
    if (s.block !== 'concept' && s.block !== 'basic_problem') // 59차: 기본 문제 장에도 그림(물음표 칸)
    figBad.push(tag + ' 개념 장 아님(' + s.block + ')');
    const h = FG.render(f); if (!h) figBad.push(tag + ' 그림 빈 글자');
    walk(f, x => { if (FG.parts.indexOf(x.k) < 0) figBad.push(tag + ' 모르는 부품 ' + x.k); if (x.k === 'tools' || x.k === 'chain') (x.items || []).forEach(c => { if (FG.icons.indexOf(c.name) < 0 && !c.emoji) { textCards++; if (!/fig-card[^"]* text[^"]*"/.test(FG.render({ k: 'tools', items: [c] }))) figBad.push(tag + ' 글자 카드 아님 ' + c.name); } }); });
    // 22차 수학 부품 검산 — 칸 수·색칠 수·세로셈 답·직각 표시·수 모형 개수·나눔 개수·배열 점 수
    walk(f, x => { const H = FG.render(x); const cnt = (re) => (H.match(re) || []).length;
      if (x.k === 'frac') { const n = Math.max(1, x.n | 0), m = Math.max(0, Math.min(n, x.m | 0)); if (cnt(/class="o-slice/g) !== n || cnt(/class="o-slice on"/g) !== m) figBad.push(tag + ' 분수 칸 ' + n + '/' + m); mathParts++; }
      if (x.k === 'fracs') { (x.items || []).forEach(i => { const n = Math.max(1, i.n | 0), m = Math.max(0, Math.min(n, i.m | 0)); const one = FG.render({ k: 'fracs', items: [i] }); if ((one.match(/class="o-slice/g) || []).length !== n || (one.match(/class="o-slice on"/g) || []).length !== m) figBad.push(tag + ' 띠 칸 ' + n + '/' + m); }); if (x.cmp) { const a = x.items[0], b = x.items[1]; const va = a.m / a.n, vb = b.m / b.n; const want = va > vb ? '>' : va < vb ? '<' : '='; if (x.cmp !== want) figBad.push(tag + ' 견줌 기호 ' + x.cmp + '≠' + want); } mathParts++; }
      if (x.k === 'numline') { if (cnt(/class="o-mark"/g) !== (x.marks || []).length) figBad.push(tag + ' 수직선 점 수'); (x.marks || []).forEach(mk => { const at = typeof mk.at === 'string' && /\//.test(mk.at) ? (+mk.at.split('/')[0]) / (+mk.at.split('/')[1]) : +mk.at; if (!(at >= 0 && at <= 1)) figBad.push(tag + ' 수직선 점 범위 ' + mk.at); }); mathParts++; }
      if (x.k === 'tenbox') { const m = Math.max(0, Math.min(10, x.m | 0)); if (cnt(/class="o-slice on"/g) !== m || cnt(/class="o-slice/g) !== 10) figBad.push(tag + ' 10칸 판 ' + m); mathParts++; }
      if (x.k === 'vert') { const want = x.op === '−' ? x.a - x.b : x.a + x.b; const got = (H.match(/class="vt-row vt-r">([\s\S]*?)<\/div>/) || ['', ''])[1].replace(/<[^>]+>/g, '').replace(/\s/g, ''); if (+got !== want) figBad.push(tag + ' 세로셈 답 ' + got + '≠' + want); if (x.op === '+' && ((x.a % 10) + (x.b % 10) >= 10) && !/vt-carry"><span>[^<]*<\/span><span>1<\/span>/.test(H)) figBad.push(tag + ' 받아올림 표시 없음'); mathParts++; }
      if (x.k === 'geo') { if (x.type === 'angle' && x.right && !/o-right/.test(H)) figBad.push(tag + ' 직각 표시 없음'); if (x.type === 'list') { const nt = (x.items || []).filter(i => (i.t || 'tri') === 'tri' && i.right !== false).length; if (cnt(/o-right/g) < nt) figBad.push(tag + ' 직각삼각형 표시 부족'); if (cnt(/<polygon/g) + cnt(/<line x1="-50"/g) !== (x.items || []).length) figBad.push(tag + ' 도형 수'); } mathParts++; }
      if (x.k === 'bt') { const n = x.n | 0; if (cnt(/class="o-hund"/g) !== Math.floor(n / 100) || cnt(/class="o-ten"/g) !== Math.floor(n / 10) % 10 || cnt(/class="o-one"/g) !== n % 10) figBad.push(tag + ' 수 모형 개수 ' + n); mathParts++; }
      if (x.k === 'regroup') { if (cnt(/class="o-one"/g) !== 10 || cnt(/class="o-ten"/g) !== 1) figBad.push(tag + ' 묶기/풀기 개수'); mathParts++; }
      if (x.k === 'share') { const g = Math.max(1, x.groups | 0); if (cnt(/<ellipse/g) !== g || cnt(/<circle cx=/g) !== Math.floor((x.total | 0) / g) * g) figBad.push(tag + ' 접시 나누기 ' + x.total + '/' + g); mathParts++; }
      if (x.k === 'bundle') { const per = Math.max(1, x.per | 0), g = Math.floor((x.total | 0) / per); if (cnt(/stroke-dasharray="10 6"/g) !== g || cnt(/<circle cx=/g) !== g * per) figBad.push(tag + ' 묶기 ' + x.total + '/' + per); mathParts++; }
      if (x.k === 'arr') { if (cnt(/<circle cx=/g) !== (x.r | 0) * (x.c | 0)) figBad.push(tag + ' 배열 점 수'); mathParts++; }
      // 23차 길이·시간 부품 검산 — 자 눈금·mm 띠·이어 붙인 조각 수·km 표지 수·시계 바늘·시간 세로셈 답(60진법)
      if (x.k === 'ruler') { if (x.zoom) { if (cnt(/class="o-tick/g) !== 11 || cnt(/class="o-mm on"/g) !== 1) figBad.push(tag + ' 자 확대 눈금 11·주황 한 칸'); } else { const ob = x.obj || {}; if (ob.name && !/class="o-obj"/.test(H)) figBad.push(tag + ' 잰 것 막대 없음'); if ((ob.mm | 0) > 0 && !/o-mmspan/.test(H)) figBad.push(tag + ' mm 띠 없음'); if ((ob.mm | 0) === 0 && /o-mmspan/.test(H)) figBad.push(tag + ' mm 0 인데 mm 띠'); if (cnt(/class="o-tick big"/g) < 4) figBad.push(tag + ' 자 cm 눈금 부족'); } mathParts++; }
      if (x.k === 'joins') { const want = x.rep ? (x.rep.n | 0) : (x.items || []).length; if (cnt(/class="o-join"/g) !== want) figBad.push(tag + ' 이어 붙인 조각 ' + want); if (!/약 /.test(H)) figBad.push(tag + ' 어림엔 「약」'); mathParts++; }
      if (x.k === 'road') { const unit = x.unit | 0 || 100, n = x.n | 0 || Math.ceil(((x.km | 0) * 1000 + (x.m | 0)) / unit); if (cnt(/class="o-rtick km"/g) !== Math.floor(unit * n / 1000)) figBad.push(tag + ' km 표지 수'); if (cnt(/class="o-rtick/g) !== n + 1) figBad.push(tag + ' 거리 띠 눈금 ' + (n + 1)); if ((x.km != null || x.m != null) && !/class="o-dist"/.test(H)) figBad.push(tag + ' 거리 막대 없음'); if (x.est && !/약 /.test(H)) figBad.push(tag + ' 어림엔 「약」'); mathParts++; }
      if (x.k === 'clock') { if (cnt(/class="o-ctick/g) !== 60 || cnt(/class="o-ctick big"/g) !== 12) figBad.push(tag + ' 시계 눈금 60·큰 눈금 12'); if ((x.sec === false) === /class="o-hand s"/.test(H)) figBad.push(tag + ' 초바늘 ' + (x.sec === false ? '없어야' : '있어야')); if (x.hi && !/class="o-(arc|hand o-hi)"/.test(H)) figBad.push(tag + ' 강조 없음'); if (x.show === true && !new RegExp((+x.h || 0) + '시 ' + (+x.m || 0) + '분').test(H)) figBad.push(tag + ' 시각 글자'); mathParts++; }
      if (x.k === 'tvert') { const N = (x.units || ['시', '분', '초']).length, nz = (v) => v == null ? 0 : +v || 0, A = (x.a || []).map(nz), B = (x.b || []).map(nz); while (A.length < N) A.unshift(0); while (B.length < N) B.unshift(0);
        const BS = +x.base || 60; const toS = (arr) => arr.reduce((acc, v) => acc * BS + v, 0); const tot = x.op === '−' ? toS(A) - toS(B) : toS(A) + toS(B); const R = []; let t = tot; for (let i = N - 1; i > 0; i--) { R.unshift(t % BS); t = Math.floor(t / BS); } R.unshift(t);
        const got = (H.match(/data-r="([^"]*)"/) || ['', ''])[1]; if (got !== R.join(',')) figBad.push(tag + ' 시간 세로셈 답 ' + got + '≠' + R.join(',')); if (tot < 0) figBad.push(tag + ' 시간 뺄셈 음수');
        const carryNeeded = x.op !== '−' && A.some((v, i) => i > 0 && v + B[i] >= BS); if (carryNeeded && !/tv-carry"><span>[^<]*<\/span>[\s\S]*?<span>1<\/span>/.test(H) && !/tv-carry"><span>1<\/span>/.test(H)) figBad.push(tag + ' 받아올림 표시 없음');
        const borrowNeeded = x.op === '−' && A.some((v, i) => i > 0 && v < B[i]); if (borrowNeeded && !/<b>\+60<\/b>/.test(H)) figBad.push(tag + ' 받아내림 +60 표시 없음');
        (x.b || []).forEach((v, i) => { if (v === null && cnt(/class="mute"/g) === 0) figBad.push(tag + ' 빈 단위 칸이 안 비어 있음'); }); mathParts++; }
      if (x.k === 'mulrows') { const a = x.a | 0, b = x.b | 0; if (cnt(/class="o-ten"/g) !== Math.floor(a / 10) * b || cnt(/class="o-one"/g) !== (a % 10) * b || !new RegExp('(= |>)' + (a * b) + '<').test(H)) figBad.push(tag + ' 부분 곱 줄 ' + a + '×' + b); mathParts++; }
    });
    const r = KT2.renderSlide(s, C0); if (!/class="fig" data-fig=/.test(r.body)) figBad.push(tag + ' 무대에 그림 안 섬');
    if (/<text[^>]*>[^<]*(undefined|NaN)/.test(h) || /NaN/.test(h)) figBad.push(tag + ' NaN/undefined');
    walk(f, x => { if (x.k === 'balance') { const m = (FG.render(x).match(/data-ang="(-?[\d.]+)"/) || [])[1]; const a = +m; const want = x.l === x.r ? 0 : x.l > x.r ? -1 : 1; if (Math.sign(a) !== want) figBad.push(tag + ' 수평대 방향 ' + x.l + '·' + x.r + ' → ' + a); } });
  })); });
  ok(figBad.length === 0, '개념 그림 층: 데이터 fig 전수(부품·아이콘·수평대 방향·개념 장·무대) ' + figBad.slice(0, 6).join(' | '));
  ok(mathParts > 100, '개념 그림 층(22차): 수학 부품 검산 ' + mathParts + '자리 · 글자 카드 ' + textCards);
  { const V = FG.render({ k: 'vert', a: 453, b: 138, op: '−' }); ok(/vt-r">[\s\S]*?3[\s\S]*?1[\s\S]*?5/.test(V) && /<i>4<\/i>/.test(V), '개념 그림 층(22차): 세로셈 받아내림 — 십의 자리 5→4 표시 · 답 315');
    const V2 = FG.render({ k: 'vert', a: 34, b: 52, op: '+' }); ok(/vt-r">[\s\S]*?<span>8<\/span><span>6<\/span>/.test(V2) && !/<span>0<\/span><span>8<\/span>/.test(V2), '개념 그림 층(22차): 두 자리 덧셈 답 86 · 앞자리 0 없음');
    const B = FG.render({ k: 'balance', l: 2, r: 2 }); ok(/fig-svg/.test(B), '개념 그림 층(22차): 21차 부품 그대로');
    const c4 = FG.render({ k: 'frac', n: 4, m: 3, shape: 'circle' }); ok((c4.match(/<path class="o-slice/g) || []).length === 4, '개념 그림 층(22차): 원 분수 4조각');
    const NL = FG.render({ k: 'numline', n: 10, dec: true, marks: [{ at: 0.7, label: '0.7' }], hop: true }); ok((NL.match(/0\.[1-9]/g) || []).length >= 9 && (NL.match(/ Q/g) || []).length === 7, '개념 그림 층(22차): 소수 수직선 눈금 0.1~0.9 · 0.7까지 뜀 7번');
    ok(/fig-card text/.test(FG.render({ k: 'chain', items: [{ name: '10분의 1' }, { name: '1' }] })) && !/fig-emo/.test(FG.render({ k: 'chain', items: [{ name: '1' }] })), '개념 그림 층(22차): 글자 카드는 빈 이모지 칸 없음');
    { const TV = (o) => (FG.render(Object.assign({ k: 'tvert' }, o)).match(/data-r="([^"]*)"/) || ['', ''])[1];
      ok(TV({ a: [10, 20, 25], b: [null, 11, 25] }) === '10,31,50' && TV({ a: [null, 50], b: [null, 30], units: ['분', '초'] }) === '1,20' && TV({ a: [1, 10], b: [null, 40], op: '−', units: ['분', '초'] }) === '0,30' && TV({ a: [3, 20, 15], b: [2, 30, null], op: '−' }) === '0,50,15' && TV({ a: [4], b: [1], op: '−', units: ['시'] }) === '3', '개념 그림 층(23차): 시간 세로셈 — 10시 20분 25초 + 11분 25초 · 50초 + 30초 = 1분 20초 · 1분 10초 − 40초 · 3시 20분 15초 − 2시 30분 · 4시 − 1시');
      const tvm = FG.render({ k: 'tvert', a: [3, 20, 15], b: [2, 30, null], op: '−', runits: ['시간', '분', '초'] }); ok(/<b>\+60<\/b>/.test(tvm) && /<i>2<\/i>/.test(tvm) && /class="mute"><\/span>/.test(tvm) && /<u>시간<\/u>/.test(tvm) === false && /50<u>분<\/u>/.test(tvm), '개념 그림 층(23차): 받아내림 = 분에 +60 · 시 3→2 · 없는 단위 빈칸 · 답 0시간은 빈칸');
      const CK = FG.render({ k: 'clock', h: 4, m: 10, s: 30, show: true, hi: 'big', names: true }); ok((CK.match(/class="o-ctick/g) || []).length === 60 && /class="o-hand s"/.test(CK) && /4시 10분 30초/.test(CK) && /o-legend/.test(CK) && /class="o-arc"/.test(CK) && !/class="o-hand s"/.test(FG.render({ k: 'clock', h: 6, m: 42, sec: false })), '개념 그림 층(23차): 시계 — 눈금 60 · 초바늘 · 시각 글자 · 바늘 이름 범례 · 5초 강조 · sec:false 면 초바늘 없음');
      const RZ = FG.render({ k: 'ruler', zoom: true }), RO = FG.render({ k: 'ruler', obj: { cm: 8, mm: 3, name: '잎' } }), RF = FG.render({ k: 'ruler', obj: { cm: 22, mm: 0, name: '발' } }); ok((RZ.match(/class="o-tick/g) || []).length === 11 && /1 cm = 10 mm/.test(RZ) && /o-mmspan/.test(RO) && />3 mm</.test(RO) && />8 cm</.test(RO) && !/o-mmspan/.test(RF) && />22 cm</.test(RF) && (RF.match(/>(0|5|10|15|20)</g) || []).length === 5, '개념 그림 층(23차): 자 — 확대 11눈금 · 8 cm 3 mm 주황 띠 · 22 cm 는 0 부터 5 cm 마다 숫자');
      const RD = FG.render({ k: 'road', km: 1, m: 300, unit: 100, sign: '1 km 300 m' }); ok((RD.match(/class="o-rtick km"/g) || []).length === 1 && (RD.match(/class="o-rtick/g) || []).length === 14 && /1 km 300 m/.test(RD) && (FG.render({ k: 'road', km: 3, m: 750, unit: 250 }).match(/class="o-rtick km"/g) || []).length === 3 && (FG.render({ k: 'road', unit: 500, n: 3, est: true }).match(/약 500 m/g) || []).length >= 3, '개념 그림 층(23차): 거리 띠 — 1300 m 에 km 표지 1·눈금 14 · 3750 m 에 km 3 · 어림은 「약」');
      ok((FG.render({ k: 'joins', rep: { name: '엄지', cm: 1, n: 15 } }).match(/class="o-join"/g) || []).length === 15 && /약 15 cm/.test(FG.render({ k: 'joins', rep: { name: '엄지', cm: 1, n: 15 } })) && /약 10 cm/.test(FG.render({ k: 'joins', items: [{ name: '색연필', cm: 7 }, { name: '클립', cm: 3 }] })), '개념 그림 층(23차): 이어 붙여 어림 — 엄지 15번 = 약 15 cm · 7 + 3 = 약 10 cm');
      ok(/fig-card[^"]* on"/.test(FG.render({ k: 'tools', items: [{ name: '태민', kind: '220 mm', on: true }] })) && !/ on"/.test(FG.render({ k: 'tools', items: [{ name: '지아', kind: '210 mm' }] })), '개념 그림 층(23차): 카드 on = 주황 강조'); }
    ok(FG.render({ k: 'bundle', total: 12, per: 3 }).indexOf('4묶음') > 0 && (FG.render({ k: 'share', total: 12, groups: 3 }).match(/4개/g) || []).length === 3, '개념 그림 층(22차): 12를 3개씩 = 4묶음 · 12를 3접시 = 4개씩'); }
  // ── 24차 국어 부품 — 문장 짜임·∨·글 판·문단·두 갈래 통·인물 마음·소리·편지·메모 ──
  { const ST = FG.render({ k: 'sents', items: [{ a: '콩이가', b: '뛰어갑니다.', t: 'act' }, { a: '콩이가', b: '파랗습니다.', t: 'state', bad: true }] });
    ok((ST.match(/class="ko-a"/g) || []).length === 2 && /ko-b t-act/.test(ST) && /ko-sent bad/.test(ST) && /✗ 어색해요/.test(ST) && /어찌하다/.test(ST) && /움직임/.test(ST), '국어 부품(24차): 문장 짜임 = 누가/무엇이(파랑)·어찌하다(주황)·어색한 짝 ✗');
    const TR = FG.render({ k: 'sents', tree: true, a: '콩이가', items: [{ t: 'what', b: '강아지입니다' }] }); ok(/ko-tree/.test(TR) && (TR.match(/class="ko-b t-/g) || []).length === 3 && /강아지입니다/.test(TR), '국어 부품(24차): 세 갈래 나무 = 가지 셋');
    const PZ = FG.render({ k: 'pause', lines: ['사람들은 ∨ 그네를 탑니다. ∨∨'] }); ok((PZ.match(/class="ko-p1">∨<\/i>/g) || []).length === 2 && (PZ.match(/class="ko-p2">∨∨<\/i>/g) || []).length === 2 && !/ko-p2"><i/.test(PZ) && /ko-key/.test(PZ) && !/ko-key/.test(FG.render({ k: 'pause', lines: ['a ∨ b'], key: false })), '국어 부품(24차): ∨ 한 칸·∨∨ 겹쐐기 따로(겹치기 0) · 범례는 key:false 면 없음');
    const TX = FG.render({ k: 'text', title: 't', lines: [{ t: '꿀벌은 꿀을 모아요.', tag: '사실' }, { t: '정말 놀라워요.', tag: '의견' }, '3 셋째 줄'] }); ok((TX.match(/<li/g) || []).length === 3 && /<li class="fact"/.test(TX) && /<li class="opin"/.test(TX) && /ko-tag fact/.test(TX) && /ko-tag opin/.test(TX) && /<span>셋째 줄<\/span>/.test(TX) && (TX.match(/<em><\/em>/g) || []).length === 3, '국어 부품(24차): 글 판 = 줄마다 번호·사실(파랑)/의견(주황) 꼬리표 · 앞 숫자 떼기');
    const PA = FG.render({ k: 'para', main: 'M', subs: ['a', 'b', { t: 'c', odd: true }], indent: true }); ok(/ko-main/.test(PA) && (PA.match(/class="ko-sub( odd)?"/g) || []).length === 3 && (PA.match(/ko-sub odd/g) || []).length === 1 && /ko-indent/.test(PA) && /ko-subs n3/.test(PA) && (FG.render({ k: 'para', pairs: [['m', 's'], ['m2', 's2']] }).match(/class="ko-pair"/g) || []).length === 2, '국어 부품(24차): 문단 = 중심 하나 아래 뒷받침 셋(어색 ✗ 하나) · 들여쓰기 · 짝 두 줄');
    const SO = FG.render({ k: 'sort2', a: { name: '사실', items: ['x', 'y'] }, b: { name: '의견', items: ['z'] } }); ok((SO.match(/class="ko-bin /g) || []).length === 2 && (SO.match(/class="ko-item"/g) || []).length === 3 && /ko-sort2 n1/.test(FG.render({ k: 'sort2', b: { name: '의견', items: ['z'] } })) && FG.render({ k: 'sort2', a: {}, b: {} }) === '', '국어 부품(24차): 두 갈래 통 = 통 둘·글줄 셋 · 빈 통은 안 그림(한 통만도 됨)');
    const MO = FG.render({ k: 'mood', items: [{ who: '😟', name: '하준', say: '못 하겠어', feel: '걱정', how: '작은 목소리' }, { who: '👧', name: '서아', say: '괜찮아' }] }); ok((MO.match(/class="ko-mood( mirror)?"/g) || []).length === 2 && /ko-mood mirror/.test(MO) && (MO.match(/svg class="chr c-friend-worry/g) || []).length === 1 && /c-girl/.test(MO) && /ko-feel/.test(MO) && /ko-how/.test(MO) && (MO.match(/ko-bub/g) || []).length === 2, '국어 부품(24차): 인물 마음 = 기분 얼굴😟·하나👧 그림 인물 · 둘째는 마주 보기 · 말풍선·마음·목소리');
    const FL = FG.render({ k: 'mood', flow: [{ who: '🙂', name: '설렘' }, { who: '😟', name: '속상함' }, { who: '😀', name: '기쁨' }] }); ok((FL.match(/class="ko-step"/g) || []).length === 3 && (FL.match(/fig-chain-ar/g) || []).length === 2 && /ko-chr emo/.test(FG.render({ k: 'mood', items: [{ who: '🧺' }] })), '국어 부품(24차): 마음 변화 줄 = 인물 셋·화살표 둘 · 모르는 얼굴은 이모지 그대로');
    const SD = FG.render({ k: 'sound', rule: 'r', items: [{ w: '꽃이', s: '[꼬치]' }], pairs: [['아이가 오리를', '아이 가오리를']] }), OX = FG.render({ k: 'sound', pairs: [['갈게', '갈께']], ox: true }); ok(/ko-rule/.test(SD) && /class="s">\[꼬치\]/.test(SD) && (SD.match(/<i>/g) || []).length === 4 && (SD.match(/<s><\/s>/g) || []).length === 2 && /ko-prs ox/.test(OX) && /ko-o">○/.test(OX) && /ko-x">✗/.test(OX) && !/ko-o/.test(SD), '국어 부품(24차): 소리 카드 [꼬치] · 띄어쓰기 짝은 낱말 칸(띄어 쓴 자리 표시) · ox 는 ○/✗');
    const LT = FG.render({ k: 'letter', to: '할머니께', lines: ['죄송해요.', { t: '고맙습니다.', tag: '마음' }], from: '민서 올림' }); ok(/ko-to/.test(LT) && /받는 사람/.test(LT) && /쓴 사람/.test(LT) && (LT.match(/class="ko-ln/g) || []).length === 2 && /ko-tag opin/.test(LT) && (FG.render({ k: 'letter', parts: ['받는 사람', '상황', '마음', '쓴 사람'] }).match(/ko-blank/g) || []).length === 4, '국어 부품(24차): 편지지 = 받는 사람·본문(마음 꼬리표)·쓴 사람 · 짜임만 넷');
    const NT = FG.render({ k: 'note', title: '무당벌레', items: [{ t: 'a', star: true }, 'b'] }); ok(/ko-note/.test(NT) && (NT.match(/<li>/g) || []).length === 2 && (NT.match(/ko-star/g) || []).length === 1, '국어 부품(24차): 메모지 = 제목·번호 둘·⭐ 하나');
    ok(FG.render({ k: 'panels', items: [{ label: 'a', fig: { k: 'text', lines: ['x'] } }, { label: 'b', fig: { k: 'note', items: ['y'] } }] }).match(/class="fig-panel"/g).length === 2 && /fig-ko/.test(FG.render({ k: 'text', lines: ['x'] })) && !/fig-panels/.test(FG.render({ k: 'text', lines: ['x'] })), '국어 부품(24차): 나란히 칸에도 들어가고 · 혼자일 땐 흰 칸 없이(fig-ko)'); }
  ok(byFile['g3_korean_u2.js'] === 37 && byFile['g3_korean_u3.js'] === 34 && byFile['g3_korean_u6.js'] === 34, '개념 그림 층(24차): 3학년 국어 u2 37·u3 34·u6 34 장에 그림 (' + [byFile['g3_korean_u2.js'], byFile['g3_korean_u3.js'], byFile['g3_korean_u6.js']].join('·') + ')');
  ok(byFile['g3_korean_u1.js'] === 35 && byFile['g3_korean_u4.js'] === 34 && byFile['g3_korean_u5.js'] === 37, '개념 그림 층(25차): 3학년 국어 u1 35·u4 34·u5 37 장에 그림 — 국어 개념 장 211장 전부 (' + [byFile['g3_korean_u1.js'], byFile['g3_korean_u4.js'], byFile['g3_korean_u5.js']].join('·') + ')');
  // ── 26차 사회 부품 — 시간 띠·마을 지도·짝 잇기·옛날↔오늘·여러 갈래 통·장소 카드·마을 신문·공유 앱·전시관 ──
  { const TZ = FG.render({ k: 'tline', zones: [{ era: 'past', words: ['어제', '작년'] }, { era: 'now', words: ['오늘'], on: true }, { era: 'future', words: ['내일'] }] }); ok((TZ.match(/class="so-zone /g) || []).length === 3 && /so-zone past/.test(TZ) && /so-zone now on/.test(TZ) && /so-zone future/.test(TZ) && (TZ.match(/class="so-chip/g) || []).length === 4 && />과거</.test(TZ) && />미래</.test(TZ) && /so-arrow/.test(TZ), '사회 부품(26차): 시간 띠 세 구역 = 과거(갈색)·현재(파랑, 강조)·미래(초록) · 낱말 넷 · 흐름 화살표');
    const TE = FG.render({ k: 'tline', items: [{ what: '태어남', when: '0살' }, { what: '입학', when: '8살', on: true }, { what: '3학년' }] }); ok((TE.match(/class="so-ev /g) || []).length === 3 && TE.indexOf('태어남') < TE.indexOf('입학') && TE.indexOf('입학') < TE.indexOf('3학년') && /so-ev  on/.test(TE) && /so-when n">3</.test(TE) && FG.render({ k: 'tline', items: [] }) === '', '사회 부품(26차): 연표 띠 = 왼쪽부터 먼저 일 · 때 없으면 차례 번호 · 빈 띠는 안 그림');
    const MP = FG.render({ k: 'map', pins: ['학교', '병원', '소방서'], route: ['학교', '병원'], search: '병원', hi: '병원' }); ok((MP.match(/class="o-place/g) || []).length === 3 && (MP.match(/class="o-place on"/g) || []).length === 1 && /data-p="병원"/.test(MP) && /class="o-route"/.test(MP) && /출발/.test(MP) && /도착/.test(MP) && /class="o-search"/.test(MP) && !/class="o-route"/.test(FG.render({ k: 'map', pins: ['학교'], route: ['학교', '없는 곳'] })), '사회 부품(26차): 마을 지도 = 핀 셋·찾은 곳 하나(주황) · 길찾기 출발/도착 · 검색창 · 없는 곳 길은 안 그림');
    const MZ = (z) => (FG.render({ k: 'map', pins: ['학교', '도서관'], hi: '도서관', zoom: z }).match(/scale\(([\d.]+)\)/) || [])[1]; ok(+MZ('in') > 1 && +MZ('out') < 1 && MZ(undefined) === undefined && /so-maptag sat/.test(FG.render({ k: 'map', sat: true })) && (FG.render({ k: 'map', pins: ['학교', '도서관', '병원', '보건소', '시장', '소방서', '우체국', '경찰서', '공원'] }).match(/class="o-place/g) || []).length === 8, '사회 부품(26차): 확대 = 크게(scale>1)·축소 = 작게(<1) · 디지털 영상 지도 이름표 · 칸은 여덟까지');
    const MPos = FG.render({ k: 'map', pins: ['집', '학교'] }); const slots = [...MPos.matchAll(/<rect x="([\d.-]+)" y="([\d.-]+)" width="100" height="76"/g)].map(m => m[1] + ',' + m[2]); ok(new Set(slots).size === slots.length && slots.length === 2, '사회 부품(26차): 지도 장소끼리 같은 자리 겹침 0');
    const LK = FG.render({ k: 'link', ha: '장소', hb: '도움', rows: [['병원', '건강'], ['소방서', '안전'], ['경찰서', '안전']] }); const gs = [...LK.matchAll(/class="so-lrow (g\d)"/g)].map(m => m[1]); ok(gs.length === 3 && gs[1] === gs[2] && gs[0] !== gs[1] && (LK.match(/<em>→<\/em>/g) || []).length === 3 && /so-lrow head/.test(LK), '사회 부품(26차): 짝 잇기 = 줄 셋·화살표 셋 · 같은 오른쪽 칸(안전)끼리 같은 색');
    const TH = FG.render({ k: 'then', rows: [{ old: { name: '맷돌' }, now: { name: '믹서기' } }] }), TS = FG.render({ k: 'then', scene: true }); ok(/so-th past">옛날/.test(TH) && /so-th now">오늘/.test(TH) && TH.indexOf('맷돌') < TH.indexOf('믹서기') && (TS.match(/so-street/g) || []).length === 2 && /so-tcol past/.test(TS) && /so-tcol now/.test(TS), '사회 부품(26차): 옛날(갈색) ↔ 오늘(파랑) 짝 · 두 거리 그림');
    const GR = FG.render({ k: 'groups', bins: [{ name: '자연', tone: 'nat', items: ['산', '강'] }, { name: '사람', tone: 'man', items: ['학교'] }, { name: '', items: [] }] }); ok((GR.match(/class="so-bin /g) || []).length === 2 && /so-groups n2/.test(GR) && /so-bin nat/.test(GR) && /so-bin man/.test(GR) && (GR.match(/class="so-chip/g) || []).length === 3 && FG.render({ k: 'groups', bins: [] }) === '', '사회 부품(26차): 여러 갈래 통 = 자연(초록)·사람(파랑) · 빈 통 생략');
    const PC = FG.render({ k: 'pcard', place: '놀이터', did: '술래잡기', feel: '즐거움', face: '🐻' }), PD = FG.render({ k: 'pcard', diary: true, place: '놀이터', did: 'a', feel: 'b' }); ok((PC.match(/class="so-prow /g) || []).length === 3 && /장소 카드/.test(PC) && /so-pcard hasface/.test(PC) && /so-ppic/.test(PD) && /그림일기/.test(PD) && !/so-ppic/.test(PC), '사회 부품(26차): 장소 카드 = ① 곳 ② 겪은 일 ③ 마음 · 그림일기는 그림 칸');
    const NW = FG.render({ k: 'news', tags: true, title: 't', body: 'b', items: ['x', 'y'] }); ok(/① 사진/.test(NW) && /② 소개 글/.test(NW) && /③ 소식/.test(NW) && (NW.match(/📢/g) || []).length === 2, '사회 부품(26차): 마을 신문 = 사진·소개 글·소식 세 칸');
    const PO = FG.render({ k: 'post', title: 't', comments: [{ t: 'a', ok: true }, { t: 'b', bad: true }], rules: [{ name: 'r1' }, { name: 'r2', x: true }] }); ok((PO.match(/class="so-cm/g) || []).length === 2 && /so-cm bad/.test(PO) && /ko-x/.test(PO) && (PO.match(/class="so-rule[ "]/g) || []).length === 2 && /so-rule x/.test(PO), '사회 부품(26차): 공유 앱 = 댓글 둘(고운 말 ○·흉보기 ✗) · 지킬 점 둘');
    const EX = FG.render({ k: 'exhibit', title: '옛날 부엌', label: true, items: [{ name: '맷돌', use: '곡식을 갈아요' }, { name: '가마솥' }] }); ok((EX.match(/class="so-plate"/g) || []).length === 2 && (EX.match(/<i>명패<\/i>/g) || []).length === 2 && /전시 주제/.test(EX), '사회 부품(26차): 전시관 = 물건마다 명패 · 전시 주제');
    ok(/fig-so/.test(FG.render({ k: 'map' })) && /fig-panel/.test(FG.render({ k: 'panels', items: [{ label: 'a', fig: { k: 'map', zoom: 'in' } }, { label: 'b', fig: { k: 'map', zoom: 'out' } }] })), '사회 부품(26차): 혼자일 땐 흰 칸 없이(fig-so) · 나란히 칸에도 들어감');
    let dash = 0; files.filter(fn => /g3_social_u[12]\.js$/.test(fn)).forEach(fn => { const L = loadLessons(path.join(DATA, fn)); Object.keys(L).forEach(k => L[k].slides.forEach(s => { if (s.data && s.data.fig && / — /.test(JSON.stringify(s.data.fig))) dash++; })); }); ok(dash === 0, '사회 부품(26차): 그림 글자에 「 — 」 0 (게이트 선언 검산기와 섞이지 않게) ' + dash); }
  ok(byFile['g3_social_u1.js'] === 40 && byFile['g3_social_u2.js'] === 54, '개념 그림 층(26차): 3학년 사회 u1 40·u2 54 장에 그림 — 사회 개념 장 94장 전부 (' + [byFile['g3_social_u1.js'], byFile['g3_social_u2.js']].join('·') + ')');
  // ── 27차 과학 생물 부품 — 기준 질문·사는 곳·생김새→쓸모·이름표 그림·한살이·조건 실험·필요한 조건·갈래 통·본뜨기 ──
  { const AK = FG.render({ k: 'ask', q: '날개가 있는가?', yes: ['물까치', '나비'], no: ['고라니', '뱀'], yt: 'a' }); ok(/sc-q/.test(AK) && /sc-br y/.test(AK) && /sc-br n/.test(AK) && AK.indexOf('물까치') < AK.indexOf('sc-br n') && AK.indexOf('고라니') > AK.indexOf('sc-br n') && />○<\/b>그렇다/.test(AK) && />✗<\/b>아니다/.test(AK) && (AK.match(/sc-brt/g) || []).length === 1 && FG.render({ k: 'ask' }) === '', '과학 부품(27차): 기준 질문 = 주황 질문 → 그렇다 ○(파랑)·아니다 ✗(회색) 두 갈래에 제자리 · 빈 질문은 안 그림');
    const HB = FG.render({ k: 'habitat', zones: [{ at: 'land', items: ['다람쥐'] }, { at: 'under', items: ['두더지'] }, { at: 'nowhere', items: ['x'] }], stack: true }); ok((HB.match(/class="sc-zone /g) || []).length === 2 && /sc-hab n2 stack/.test(HB) && />땅 위</.test(HB) && />땅속</.test(HB) && /sc-ic/.test(HB) && /🐿️/.test(HB), '과학 부품(27차): 사는 곳 = 땅 위/땅속 위아래 · 모르는 곳 생략 · 이모지 없는 두더지는 그림(sc-ic)');
    const noEmoji = ['두더지', '은행나무', '부레옥잠', '검정말', '용설란', '알로에', '도꼬마리', '파리지옥', '끈끈이주걱', '벌레잡이통풀', '통발', '올챙이', '잠자리', '매미', '나팔꽃', '감나무', '봉숭아', '강아지풀', '고라니', '물까치'].filter(n => !/sc-ic/.test(FG.render({ k: 'bins', bins: [{ name: 'b', items: [n] }] }))); ok(noEmoji.length === 0, '과학 부품(27차): 이모지가 없거나 틀리는 생물 스물은 그림으로 ' + noEmoji.join(','));
    const IN = FG.render({ k: 'cycle', stages: [{ name: '알', ic: 'none' }] }), IE = FG.render({ k: 'cycle', stages: [{ name: '알', emoji: '🥚', ic: 'none' }] }); ok(!/sc-ic/.test(IN) && /<i>1<\/i>/.test(IN) && /🥚/.test(IE) && !/sc-ic/.test(IE), '과학 부품(27차): ic:none = 같은 이름 다른 생물(닭의 알)은 나비 알 그림을 쓰지 않음');
    const TR = FG.render({ k: 'trait', name: '낙타', emoji: '🐫', env: '사막', envAt: 'desert', rows: [{ part: '혹', use: '양분 저장' }, { part: '넓은 발바닥', use: '빠지지 않아요' }] }); ok((TR.match(/class="sc-row"/g) || []).length === 2 && TR.indexOf('sc-part') < TR.indexOf('sc-use') && /sc-env desert/.test(TR) && FG.render({ k: 'trait', name: 'x', rows: [] }) === '', '과학 부품(27차): 생김새(주황) → 쓸모(초록) 줄 둘 · 사는 곳 꼬리표 · 줄 없으면 안 그림');
    const AN = (o) => FG.render(Object.assign({ k: 'anat' }, o)); const labs = (h) => (h.match(/class="o-lab/g) || []).length, onl = (h) => (h.match(/class="o-lab on"/g) || []).length;
    ok(labs(AN({ of: 'leaf' })) === 3 && labs(AN({ of: 'fish' })) === 3 && labs(AN({ of: 'insect' })) === 5 && labs(AN({ of: 'insect', wing: false })) === 4 && labs(AN({ of: 'cactus' })) === 3 && labs(AN({ of: 'hyacinth' })) === 3 && onl(AN({ of: 'fish', hi: ['fin', 'gill'] })) === 2 && /아가미/.test(AN({ of: 'fish' })) && /다리 세 쌍/.test(AN({ of: 'insect' })) && AN({ of: 'dragon' }) === '', '과학 부품(27차): 이름표 그림 = 잎 3·물고기 3·곤충 5(날개 빼면 4)·선인장 3·부레옥잠 3 · 강조 이름표 주황 · 모르는 그림 빈 글자');
    const legs = (AN({ of: 'insect' }).match(/<path d="M\d+ (176|144) L/g) || []).length; ok(legs === 6, '과학 부품(27차): 곤충 그림 다리 = 여섯(세 쌍) ' + legs);
    const CY = FG.render({ k: 'cycle', who: '배추흰나비', stages: ['알', '애벌레', '번데기', '어른벌레'], hi: 1, next: true, fade: true, loop: true }); ok((CY.match(/class="sc-st[ "]/g) || []).length === 4 && (CY.match(/sc-ar/g) || []).length === 3 && /sc-st on/.test(CY) && (CY.match(/sc-st on/g) || []).length === 1 && CY.indexOf('sc-st on') < CY.indexOf('sc-st nx') && /다음은/.test(CY) && (CY.match(/ fade/g) || []).length === 1 && /sc-loop/.test(CY) && CY.indexOf('>알<') < CY.indexOf('>애벌레<') && CY.indexOf('>번데기<') < CY.indexOf('>어른벌레<'), '과학 부품(27차): 한살이 = 넷·화살표 셋 · 지금 단계 하나(주황) · 바로 다음 「다음은」 · 그 뒤 흐리게 · ↺ 다시 이어져요 · 차례 그대로');
    ok(/sc-st skip/.test(FG.render({ k: 'cycle', stages: ['알', { name: '번데기', skip: true }, '어른벌레'] })) && FG.render({ k: 'cycle', stages: [] }) === '', '과학 부품(27차): 빠진 단계(번데기 없음)는 점선·취소 · 빈 한살이 안 그림');
    const CD = FG.render({ k: 'cond', cols: ['가 컵', '나 컵'], rows: [{ name: '물', v: ['줘요', '안 줘요'], diff: true }, { name: '온도', v: ['알맞게', '알맞게'] }, { name: '컵', v: ['같게', '같게'] }], result: { v: ['싹', '그대로'], win: 0 } }); ok((CD.match(/sc-crow diff/g) || []).length === 1 && (CD.match(/sc-crow same/g) || []).length === 2 && />다르게</.test(CD) && (CD.match(/>같게<\/span><\/div>/g) || []).length === 2 && /sc-cv win/.test(CD) && (CD.match(/sc-cv win/g) || []).length === 1, '과학 부품(27차): 조건 실험 = 다르게 할 조건 하나(주황)·같게 할 조건 둘(파랑) · 결과 하나 초록');
    let diffBad = []; files.filter(fn => /g3_science_u4\.js$/.test(fn)).forEach(fn => { const L = loadLessons(path.join(DATA, fn)); Object.keys(L).forEach(k => L[k].slides.forEach(s => { const f = s.data && s.data.fig; if (f && f.k === 'cond') { const d = f.rows.filter(r => r.diff); if (d.length !== 1 || d[0].v[0] === d[0].v[1] || f.rows.some(r => !r.diff && r.v[0] !== r.v[1])) diffBad.push(k + '/' + s.id); } })); }); ok(diffBad.length === 0, '과학 부품(27차): 데이터의 조건 실험마다 다르게 할 조건 딱 하나(두 칸 값이 다름) · 같게 할 조건은 두 칸 값이 같음 ' + diffBad.join(','));
    const ND = FG.render({ k: 'need', cols: [{ title: '싹 틀 때', items: [{ name: '물' }, { name: '햇빛', ok: false }] }, { title: '자랄 때', items: [{ name: '햇빛' }] }] }); ok((ND.match(/sc-ni ok/g) || []).length === 2 && (ND.match(/sc-ni no/g) || []).length === 1 && /✗ 없어도 돼요/.test(ND) && /sc-needs n2/.test(ND), '과학 부품(27차): 필요한 조건 = ○ 필요해요(파랑)·✗ 없어도 돼요(회색) · 두 줄 나란히');
    const MM = FG.render({ k: 'mimic', rows: [[{ name: '연잎' }, { name: '방수 옷' }, '물이 또르르'], [{ name: '도꼬마리 갈고리', ic: '도꼬마리' }, { name: '찍찍이' }]] }); ok((MM.match(/class="sc-mrow"/g) || []).length === 2 && (MM.match(/본떠요/g) || []).length === 2 && /sc-ic/.test(MM) && (MM.match(/<u>/g) || []).length === 1 && />자라서</.test(FG.render({ k: 'mimic', verb: '자라서', rows: [['a', 'b']] })), '과학 부품(27차): 본뜨기 = 자연(초록) → 본떠요 → 물건(파랑) · 좋은 점 꼬리표 · 화살표 낱말 바꾸기');
    ok(/fig-sc/.test(FG.render({ k: 'ask', q: 'q', yes: ['a'] })) && /fig-panel/.test(FG.render({ k: 'panels', items: [{ label: 'a', fig: { k: 'anat', of: 'leaf' } }, { label: 'b', fig: { k: 'anat', of: 'fish' } }] })), '과학 부품(27차): 혼자일 땐 흰 칸 없이(fig-sc) · 나란히 칸에도 들어감');
    let dash = 0, pre = []; files.filter(fn => /g3_science_u[234]\.js$/.test(fn)).forEach(fn => { const L = loadLessons(path.join(DATA, fn)); Object.keys(L).forEach(k => L[k].slides.forEach(s => { if (s.data && s.data.fig) { const j = JSON.stringify(s.data.fig); if (/ — /.test(j)) dash++; if (/^u2_l0[1-4]$/.test(k) && /아가미|gill/.test(j)) pre.push(k + '/' + s.id); } })); }); ok(dash === 0 && pre.length === 0, '과학 부품(27차): 그림 글자에 「 — 」 0 · 「아가미」는 u2 l05 부터(선행 0) ' + dash + ' ' + pre.join(',')); }
  ok(byFile['g3_science_u2.js'] === 32 && byFile['g3_science_u3.js'] === 29 && byFile['g3_science_u4.js'] === 31, '개념 그림 층(27차): 3학년 과학 u2 32·u3 29·u4 31 장에 그림 — 3학년 과학 개념 장 121장 전부 (' + [byFile['g3_science_u2.js'], byFile['g3_science_u3.js'], byFile['g3_science_u4.js']].join('·') + ')');
  // ── 28차 3학년 2학기 곱셈 부품 — vmul·grid·range + 학기(t) slug ──
  { const VM = FG.render({ k: 'vmul', a: 39, b: 26, hi: 1 }), V1 = FG.render({ k: 'vmul', a: 426, b: 3 }), G = FG.render({ k: 'grid', w: 24, h: 13, sw: [20, 4], sh: [10, 3] }), RG = FG.render({ k: 'range', lo: 800, hi: 1200, at: 1014 }), RO = FG.render({ k: 'range', lo: 800, hi: 1200, at: 1300 });
    ok(/data-r="1014"/.test(VM) && /data-p="234,780"/.test(VM) && /vm-p2 vm-hi/.test(VM) && /data-r="1278"/.test(V1) && /vm-carry/.test(V1) && !/vm-carry/.test(FG.render({ k: 'vmul', a: 213, b: 3 })), '곱셈 부품(28차): 세로셈 39×26 = 234·780·1014(십의 자리 줄 강조) · 426×3 올림 표시 · 올림 없으면 표시 없음');
    ok((G.match(/class="o-blk"/g) || []).length === 4 && /200 \+ 40 \+ 60 \+ 12 = 312/.test(G) && (G.match(/class="o-cut"/g) || []).length === 2 && (FG.render({ k: 'grid', w: 16, h: 7, sh: [10, 6] }).match(/class="o-blk"/g) || []).length === 2, '곱셈 부품(28차): 모눈 24×13 네 덩이 · 부분 곱 합 312 · 가르는 선 둘 · 두 덩이 가르기');
    ok(/data-in="1"/.test(RG) && /data-in="0"/.test(RO) && /o-band/.test(RG), '곱셈 부품(28차): 어림 사이 띠 — 1014 는 안(파랑)·1300 은 밖(빨강)');
    ok(KT2.slugOf({ g: 3, s: 'math' }) === 'g3_math' && KT2.slugOf({ g: 3, s: 'math', t: '2' }) === 'g3s2_math' && KT2.slugOf({ g: 3, s: 'math', t: '1' }) === 'g3_math', '학기(28차): 1학기 slug 그대로 · 2학기 = g3s2_math'); }
  // ── 31차 3학년 2학기 원 부품 — circ·compass·cgrid·crow ──
  { const C1 = FG.render({ k: 'circ', radii: [0, 90, 180], rcm: 3, all: true, names: true }), C2 = FG.render({ k: 'circ', diam: [0], rcm: 4, dcm: 8, split: true }), C3 = FG.render({ k: 'circ', oval: true }), C4 = FG.render({ k: 'circ', center: false, chords: [{ a: 180, b: 240 }], pts: [{ a: 30, d: 1, lab: 'ㄱ' }, { a: 200, d: 0.4, lab: 'ㄴ' }] }), C5 = FG.render({ k: 'circ', strip: { holes: [1, 2, 3, 4], at: 3 }, rcm: 3 });
    ok(/data-nr="3" data-nd="0"/.test(C1) && (C1.match(/class="o-rad/g) || []).length === 3 && (C1.match(/>3 cm</g) || []).length === 3 && /원의 중심/.test(C1) && /data-rcm="4" data-dcm="8"/.test(C2) && /지름 8 cm/.test(C2) && (C2.match(/>4 cm</g) || []).length === 2 && /o-oval/.test(C3) && !/o-center/.test(C3) && /o-chord/.test(C4) && !/o-center/.test(C4) && /o-pt on/.test(C4) && (C4.match(/class="o-pt"/g) || []).length === 1 && /o-pin/.test(C5) && /o-pencil/.test(C5), '원 부품(31차): 반지름 셋 모두 3 cm · 지름 = 반지름 두 개(4 cm 둘 · 지름 8 cm) · 길쭉한 모양은 중심 없음 · 원 위의 점만 주황 · 누름 못과 띠종이');
    const K1 = FG.render({ k: 'compass', cm: 3 }), K2 = FG.render({ k: 'compass', cm: 3, steps: true }), G1 = FG.render({ k: 'cgrid', items: [{ x: 1, y: 2, r: 1 }, { x: 4, y: 2, r: 2 }], show: 'r', q: 1 }), W1 = FG.render({ k: 'crow', items: [{ d: 6 }, { r: 4 }, { r: 6 }, { d: 4 }] });
    ok(/data-open="3" data-d="6"/.test(K1) && /지름 6 cm/.test(K1) && /② 3 cm 벌리기/.test(K2) && /data-rs="1,2"/.test(G1) && /o-circ q/.test(G1) && />1칸</.test(G1) && />\?</.test(G1) && /data-ds="6,8,12,4"/.test(W1) && (W1.match(/stroke="#FF7A2F"/g) || []).length === 1, '원 부품(31차): 컴퍼스 3 cm 벌림 = 지름 6 cm · 세 걸음 · 모눈 원 무늬(반지름 칸·? 원) · 크기 견주기 지름으로 바꾸어 가장 큰 원만 주황'); }
  // ── 32차 3학년 2학기 분수와 소수 부품 — fgroup·fmix·nline ──
  { const P1 = FG.render({ k: 'fgroup', total: 12, per: 3, m: 2, of: true }), M1 = FG.render({ k: 'fmix', n: 4, m: 7, units: 2, show: 'both' }), M2 = FG.render({ k: 'fmix', n: 10, m: 13, units: 2, dec: true, show: 'dec' }), N1 = FG.render({ k: 'nline', lo: 0, hi: 2, n: 10, dec: true, marks: [{ at: 13, label: '1.3' }, { at: 7, q: true }] });
    ok(/data-g="4" data-m="2" data-v="6"/.test(P1) && (P1.match(/o-grp on/g) || []).length === 2 && (P1.match(/class="o-grp"/g) || []).length === 2 && (P1.match(/class="o-it"/g) || []).length === 12 && />12의</.test(P1) && />6</.test(P1), '분수 부품(32차): 12를 3씩 4묶음 · 2묶음만 칠함 · 12의 2/4 = 6');
    ok(/data-n="4" data-m="7" data-w="1" data-p="3"/.test(M1) && (M1.match(/o-slice on/g) || []).length === 7 && (M1.match(/class="o-slice"/g) || []).length === 1 && /data-n="10" data-m="13" data-w="1" data-p="3"/.test(M2) && (M2.match(/o-slice on/g) || []).length === 13 && />1\.3</.test(M2), '분수 부품(32차): 7/4 = 1과 3/4 (7칸 칠함·1칸 빈칸) · 13/10 = 1.3');
    ok(/data-at="13,7"/.test(N1) && /data-lo="0"/.test(N1) && /data-hi="2"/.test(N1) && (N1.match(/class="o-mark"/g) || []).length === 2 && />\?</.test(N1) && />0\.1</.test(N1) && />1\.9</.test(N1), '분수 부품(32차): 수직선 0~2 · 0.1 눈금 · 1.3 표시와 ? 자리'); }
  // ── 33차 3학년 2학기 들이와 무게 부품 — beaker·dial·tilt·cups·tubs · tvert base 1000 ──
  { const K1 = FG.render({ k: 'beaker', max: 1000, step: 100, v: 300 }), K2 = FG.render({ k: 'beaker', max: 1000, step: 200, v: 600, q: true }), D1 = FG.render({ k: 'dial', max: 4000, step: 200, v: 3400, kg: true }), D2 = FG.render({ k: 'dial', max: 10, step: 1, v: 5, unit: 'kg' });
    ok(/data-max="1000" data-step="100" data-v="300"/.test(K1) && />300 mL</.test(K1) && /o-water/.test(K1) && /data-step="200" data-v="600"/.test(K2) && />\?</.test(K2) && !/>600 mL</.test(K2) && !/o-water/.test(FG.render({ k: 'beaker', max: 1000, step: 100, v: 0 })), '들이·무게 부품(33차): 비커 한 칸 100 mL 에 300 mL 읽기 · ? 자리면 값 숨김 · 빈 비커는 물 없음');
    ok(/data-max="4000" data-step="200" data-v="3400"/.test(D1) && />3400 g</.test(D1) && />4</.test(D1) && /o-needle/.test(D1) && />5 kg</.test(D2) && />10</.test(D2), '들이·무게 부품(33차): 바늘 저울 한 칸 200 g 에 3400 g(글자는 kg 눈금) · 10 kg 저울 5 kg');
    const T1 = FG.render({ k: 'tilt', l: { name: '사과' }, r: { name: '배' }, down: 'r' }), T0 = FG.render({ k: 'tilt', l: 'a', r: 'b', down: 'eq' }), C1 = FG.render({ k: 'cups', items: [{ name: '가', lv: 0.8 }, { name: '나', lv: 0.4 }], pour: [0, 1] });
    ok(/data-down="r"/.test(T1) && /data-ang="9"/.test(T1) && /배 쪽으로 기울었어요/.test(T1) && /data-down="eq"/.test(T0) && /data-ang="0"/.test(T0) && /수평/.test(T0) && /data-lv="0.8,0.4"/.test(C1) && (C1.match(/o-water/g) || []).length === 2, '들이·무게 부품(33차): 양팔저울 무거운 쪽이 내려감(캡션 자동) · 수평 · 컵 물 높이 둘');
    const U1 = FG.render({ k: 'tubs', rows: [{ size: 10, n: 7 }, { size: 6, n: 0 }, { size: 5, n: 4 }], total: 90 }), U2 = FG.render({ k: 'tubs', rows: [{ size: 10, n: 7 }], total: 90 });
    ok(/data-sum="90" data-total="90"/.test(U1) && (U1.match(/o-tub/g) || []).length === 11 && /안 써요/.test(U1) && /70 L \+ 20 L = 90 L/.test(U1) && /data-sum="70"/.test(U2) && /#F2545B/.test(U2), '들이·무게 부품(33차): 통 담기 10 L 7개 + 5 L 4개 = 90 L · 모자라면 합 글자 빨강');
    const V1 = FG.render({ k: 'tvert', a: [1, 300], b: [2, 500], units: ['L', 'mL'], base: 1000 }), V2 = FG.render({ k: 'tvert', a: [2, 350], b: [1, 400], op: '−', units: ['L', 'mL'], base: 1000 }), V0 = FG.render({ k: 'tvert', a: [1, 40], b: [0, 30], units: ['분', '초'] });
    ok(/data-r="3,800"/.test(V1) && /tv n2 wide/.test(V1) && /data-r="0,950"/.test(V2) && /\+1000/.test(V2) && /data-r="2,10"/.test(V0) && !/wide/.test(V0), '들이·무게 부품(33차): 세로셈 base 1000 — 1 L 300 mL + 2 L 500 mL = 3 L 800 mL · 받아내림 +1000 · 시간 세로셈(60)은 종전 그대로'); }
  // ── 34차 3학년 2학기 그림그래프 부품 — ptable·ograph·pgraph·area2 ──
  { const P1 = FG.render({ k: 'ptable', head: '나라', items: [{ name: '미국', v: 20 }, { name: '일본', v: 17 }, { name: '영국', v: 13, q: true }], total: 50 }), P2 = FG.render({ k: 'ptable', head: '계절', items: [{ name: '봄', v: 7 }, { name: '여름', v: 8 }], q: 'total' });
    ok(/data-sum="50" data-total="50" data-vals="20,17,13"/.test(P1) && />\?</.test(P1) && !/>13</.test(P1) && />합계</.test(P1) && /data-sum="15"/.test(P2) && /n sum q/.test(P2) && !/>15</.test(P2), '그림그래프 부품(34차): 표 합계 50 · 영국 ? 자리는 수 숨김 · 합계 ? 자리');
    const O1 = FG.render({ k: 'ograph', items: [{ name: '강아지', v: 6 }, { name: '고양이', v: 4 }, { name: '햄스터', v: 2 }], unit: '명' });
    ok(/data-vals="6,4,2"/.test(O1) && (O1.match(/og-c on/g) || []).length === 12 && (O1.match(/class="og-y"/g) || []).length === 6, '그림그래프 부품(34차): ◯ 그래프 6·4·2 → ◯ 12개 · 6줄');
    const G1 = FG.render({ k: 'pgraph', rows: [{ name: '가', v: 34 }, { name: '나', v: 41 }], show: true }), G2 = FG.render({ k: 'pgraph', units: [100, 10, 1], rows: [{ name: '떡국', v: 130 }] }), G3 = FG.render({ k: 'pgraph', units: [5, 1], rows: [{ name: '지유', v: 9, c: [1, 2], bad: true }, { name: '은비', v: 13, blank: true }] });
    ok(/data-vals="34,41" data-units="10,1"/.test(G1) && (G1.match(/pg-ic l/g) || []).length === 7 + 1 && (G1.match(/pg-ic s/g) || []).length === 5 + 1 && /class="pg-n">34</.test(G1), '그림그래프 부품(34차): 34·41 → 큰 그림 7 · 작은 그림 5(+범례 각 1) · 수 칸');
    ok(/data-vals="130" data-units="100,10,1"/.test(G2) && (G2.match(/pg-ic m/g) || []).length === 3 + 1 && (G2.match(/pg-ic s/g) || []).length === 0 + 1 && /data-vals="7,"/.test(G3) && /class="bad "/.test(G3) && /pg-blank/.test(G3), '그림그래프 부품(34차): 단위 셋 130 = 100 1 · 10 3 · 잘못 그린 줄(c 직접)·빈 줄');
    const A1 = FG.render({ k: 'area2', icon: '🍩' }); ok(/data-k="2" data-area="4"/.test(A1) && /넓이 4배/.test(A1), '그림그래프 부품(34차): 가로·세로 2배 → 넓이 4배'); }
  // ── 30차 3학년 2학기 나눗셈 부품 — vdiv·brem ──
  { const D1 = FG.render({ k: 'vdiv', a: 307, d: 3, hi: 'q' }), D2 = FG.render({ k: 'vdiv', a: 258, d: 4, check: true }), D3 = FG.render({ k: 'vdiv', a: 45, d: 3, answer: false }), B1 = FG.render({ k: 'brem', total: 25, per: 4 }), B0 = FG.render({ k: 'brem', total: 24, per: 4 });
    ok(/data-q="102" data-rem="1"/.test(D1) && /vd-q vd-hi/.test(D1) && /data-q="64" data-rem="2"/.test(D2) && /4 × 64 \+ 2 = 258/.test(D2) && (D2.match(/class="vd-row vd-p/g) || []).length === 2 && /vd-blank/.test(D3) && !/vd-p/.test(D3), '나눗셈 부품(30차): 세로셈 307÷3 = 102…1(몫 가운데 0) · 258÷4 = 64…2(단계 둘·확인 식) · 답 비움이면 단계 없음');
    ok(/data-g="6" data-r="1"/.test(B1) && /o-rest/.test(B1) && /나머지 1/.test(B1) && /data-g="6" data-r="0"/.test(B0) && !/o-rest/.test(B0), '나눗셈 부품(30차): 묶고 남기 25÷4 = 6묶음·나머지 1(빨강 칸) · 24÷4 는 남는 칸 없음'); }
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
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g3s2_korean'); const u1 = sj && sj.units.find(x => x.unit === 1); ok(sj && sj.term === 2 && sj.title === '3학년 2학기 국어' && u1 && u1.title === '경험과 관련지으며 이해해요' && u1.lessons.length === 8 && u1.lessons.map(l => l.key).join() === 'u1_l01,u1_l02,u1_l04,u1_l06,u1_l07,u1_l09,u1_l11,u1_l13' && u1.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '35차: 2학기 국어 u1 8차시 키(묶음 차시 = 첫 번호) × 19장 · 7요소 전부 (manifest)');
  const u2 = sj && sj.units.find(x => x.unit === 2); ok(u2 && u2.title === '유창하게 읽고 발표해요' && u2.lessons.length === 8 && u2.lessons.map(l => l.key).join() === 'u2_l01,u2_l02,u2_l03,u2_l05,u2_l07,u2_l08,u2_l11,u2_l13' && u2.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '36차: 2학기 국어 u2 8차시 키(묶음 = 첫 번호, 8~10 한 벌) × 19장 · 7요소 전부 (manifest)');
  const u3 = sj && sj.units.find(x => x.unit === 3); ok(u3 && u3.title === '정확하게 글을 써요' && u3.lessons.length === 9 && u3.lessons.map(l => l.key).join() === 'u3_l01,u3_l02,u3_l03,u3_l05,u3_l07,u3_l09,u3_l10,u3_l12,u3_l14' && u3.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '37차: 2학기 국어 u3 9차시 키(묶음 = 첫 번호, 14차시분) × 19장 · 7요소 전부 (manifest)');
  const u4 = sj && sj.units.find(x => x.unit === 4); ok(u4 && u4.title === '서로 존중하며 대화해요' && u4.lessons.length === 9 && u4.lessons.map(l => l.key).join() === 'u4_l01,u4_l02,u4_l03,u4_l05,u4_l07,u4_l08,u4_l10,u4_l12,u4_l14' && u4.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '38차: 2학기 국어 u4 9차시 키(묶음 = 첫 번호, 14차시분) × 19장 · 7요소 전부 (manifest)');
  const u5 = sj && sj.units.find(x => x.unit === 5); ok(u5 && u5.title === '사전으로 여는 세상' && u5.lessons.length === 8 && u5.lessons.map(l => l.key).join() === 'u5_l01,u5_l02,u5_l04,u5_l06,u5_l08,u5_l10,u5_l12,u5_l14' && u5.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '39차: 2학기 국어 u5 8차시 키(묶음 = 첫 번호, 14차시분) × 19장 · 7요소 전부 (manifest)');
  const u6 = sj && sj.units.find(x => x.unit === 6); ok(u6 && u6.title === '감상과 표현의 즐거움' && u6.lessons.length === 9 && u6.lessons.map(l => l.key).join() === 'u6_l01,u6_l02,u6_l03,u6_l05,u6_l07,u6_l09,u6_l10,u6_l12,u6_l14' && u6.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)) && sj.units.length === 6, '40차: 2학기 국어 u6 9차시 키 × 19장 · 7요소 전부 = 3학년 2학기 국어 u1~u6 완주 (manifest)');
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g3s2_science'); const u1 = sj && sj.units.find(x => x.unit === 1); ok(sj && sj.term === 2 && sj.title === '3학년 2학기 과학' && u1 && u1.title === '물체와 물질' && u1.lessons.length === 10 && u1.lessons.map(l => l.key).join() === 'u1_l01,u1_l02,u1_l03,u1_l04,u1_l05,u1_l06,u1_l07,u1_l08,u1_l10,u1_l11' && u1.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '41차: 2학기 과학 u1 물체와 물질 10차시 키(묶음 8·9 = 첫 번호) × 19장 · 7요소 전부 (manifest)');
  const u2 = sj && sj.units.find(x => x.unit === 2); ok(u2 && u2.title === '지구와 바다' && u2.lessons.length === 10 && u2.lessons.map(l => l.key).join() === 'u2_l01,u2_l02,u2_l03,u2_l04,u2_l05,u2_l06,u2_l07,u2_l08,u2_l10,u2_l11' && u2.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '42차: 2학기 과학 u2 지구와 바다 10차시 키(묶음 8·9 = 첫 번호) × 19장 · 7요소 전부 (manifest)');
  const u3 = sj && sj.units.find(x => x.unit === 3); ok(u3 && u3.title === '소리의 성질' && u3.lessons.length === 9 && u3.lessons.map(l => l.key).join() === 'u3_l01,u3_l02,u3_l03,u3_l04,u3_l05,u3_l06,u3_l07,u3_l09,u3_l10' && u3.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '43차: 2학기 과학 u3 소리의 성질 9차시 키(묶음 7·8 = 첫 번호, 10차시분) × 19장 · 7요소 전부 (manifest)');
  const u4 = sj && sj.units.find(x => x.unit === 4); ok(u4 && u4.title === '감염병과 건강한 생활' && u4.lessons.length === 9 && u4.lessons.map(l => l.key).join() === 'u4_l01,u4_l02,u4_l03,u4_l04,u4_l05,u4_l07,u4_l08,u4_l10,u4_l11' && u4.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)) && sj.units.length === 4, '44차: 2학기 과학 u4 감염병과 건강한 생활 9차시 키(묶음 5·6 · 8·9 = 첫 번호, 11차시분) × 19장 · 7요소 전부 = 3학년 2학기 과학 u1~u4 완주 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_science'); const u1 = sj && sj.units.find(x => x.unit === 1); ok(sj && sj.grade === 4 && sj.term === 1 && u1 && u1.title === '자석의 이용' && u1.lessons.length === 9 && u1.lessons.map(l => l.key).join() === 'u1_l01,u1_l02,u1_l03,u1_l04,u1_l06,u1_l07,u1_l08,u1_l10,u1_l11' && u1.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '66차: 4-1 과학 u1 자석의 이용 9차시 키(묶음 4·5 · 8·9 = 첫 번호) × 19장 · 7요소 전부 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_science'); const u2 = sj && sj.units.find(x => x.unit === 2); ok(sj && u2 && u2.title === '물의 상태 변화' && u2.lessons.length === 9 && u2.lessons.map(l => l.key).join() === 'u2_l01,u2_l02,u2_l03,u2_l04,u2_l06,u2_l07,u2_l08,u2_l10,u2_l11' && u2.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '67차: 4-1 과학 u2 물의 상태 변화 9차시 키(묶음 4·5 · 8·9 = 첫 번호) × 19장 · 7요소 전부 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_science'); const u3 = sj && sj.units.find(x => x.unit === 3); ok(sj && u3 && u3.title === '땅의 변화' && u3.lessons.length === 9 && u3.lessons.map(l => l.key).join() === 'u3_l01,u3_l02,u3_l03,u3_l04,u3_l06,u3_l07,u3_l08,u3_l10,u3_l13' && u3.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '68차: 4-1 과학 u3 땅의 변화 9차시 키(묶음 4·5 · 8·9 · 10~12 = 첫 번호) × 19장 · 7요소 전부 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_science'); const u4 = sj && sj.units.find(x => x.unit === 4); ok(sj && u4 && u4.title === '다양한 생물과 우리 생활' && sj.units.length === 4 && u4.lessons.length === 9 && u4.lessons.map(l => l.key).join() === 'u4_l01,u4_l02,u4_l04,u4_l06,u4_l07,u4_l08,u4_l09,u4_l11,u4_l12' && u4.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '69차: 4-1 과학 u4 다양한 생물과 우리 생활 9차시 키(묶음 2·3 · 4·5 · 9·10 = 첫 번호) × 19장 · 7요소 전부 · 4-1 과학 u1~u4 완주 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_korean'); const u1 = sj && sj.units.find(x => x.unit === 1); ok(sj && sj.grade === 4 && sj.term === 1 && u1 && u1.title === '깊이 있게 읽어요' && u1.lessons.length === 8 && u1.lessons.map(l => l.key).join() === 'u1_l01,u1_l02,u1_l03,u1_l05,u1_l07,u1_l09,u1_l11,u1_l13' && u1.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '70차: 4-1 국어 u1 깊이 있게 읽어요 8차시 키(묶음 3·4 · 5·6 · 7·8 · 9·10 · 11·12 = 첫 번호) × 19장 · 7요소 전부 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_korean'); const u2 = sj && sj.units.find(x => x.unit === 2); ok(sj && u2 && u2.title === '서로 다른 의견' && u2.lessons.length === 8 && u2.lessons.map(l => l.key).join() === 'u2_l01,u2_l02,u2_l04,u2_l06,u2_l07,u2_l09,u2_l11,u2_l13' && u2.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)) && sj.units.length >= 2, '71차: 4-1 국어 u2 서로 다른 의견 8차시 키(묶음 2·3 · 4·5 · 7·8 · 9·10 · 11·12 = 첫 번호) × 19장 · 7요소 전부 · g4_korean units ≥2 (manifest · 72차 u3 추가로 ≥2)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_korean'); const u3 = sj && sj.units.find(x => x.unit === 3); ok(sj && u3 && u3.title === '자세하게 살펴요' && u3.lessons.length === 8 && u3.lessons.map(l => l.key).join() === 'u3_l01,u3_l02,u3_l04,u3_l06,u3_l08,u3_l10,u3_l12,u3_l14' && u3.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)) && sj.units.length >= 3, '72차: 4-1 국어 u3 자세하게 살펴요 8차시 키(묶음 2·3 · 4·5 · 6·7 · 8·9 · 10·11 · 12·13 = 첫 번호) × 19장 · 7요소 전부 · g4_korean units ≥3 (manifest · 73차 u4 추가로 ≥3)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_korean'); const u4 = sj && sj.units.find(x => x.unit === 4); ok(sj && u4 && u4.title === '뜻을 파악하며 읽어요' && u4.lessons.length === 8 && u4.lessons.map(l => l.key).join() === 'u4_l01,u4_l02,u4_l04,u4_l07,u4_l08,u4_l10,u4_l12,u4_l14' && u4.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)) && sj.units.length >= 4, '73차: 4-1 국어 u4 뜻을 파악하며 읽어요 8차시 키(묶음 2·3 · 4~6(120분) · 8·9 · 10·11 · 12·13 = 첫 번호) × 19장 · 7요소 전부 · g4_korean units 4 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_korean'); const u5 = sj && sj.units.find(x => x.unit === 5); ok(sj && u5 && u5.title === '말과 글로 전하는 생각' && u5.lessons.length === 7 && u5.lessons.map(l => l.key).join() === 'u5_l01,u5_l02,u5_l04,u5_l07,u5_l09,u5_l11,u5_l13' && u5.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)) && sj.units.length >= 5, '74차: 4-1 국어 u5 말과 글로 전하는 생각 7차시 키(묶음 2·3 · 4~6(120분) · 7·8 · 9·10 · 11·12 = 첫 번호) × 19장 · 7요소 전부 · g4_korean units 5 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_korean'); const u6 = sj && sj.units.find(x => x.unit === 6); ok(sj && u6 && u6.title === '경험을 표현해요' && u6.lessons.length === 8 && u6.lessons.map(l => l.key).join() === 'u6_l01,u6_l02,u6_l04,u6_l06,u6_l07,u6_l09,u6_l11,u6_l13' && u6.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)) && sj.units.length === 6, '75차: 4-1 국어 u6 경험을 표현해요 8차시 키(묶음 2·3 · 4·5 · 7·8 · 9·10 · 11·12 = 첫 번호) × 19장 · 7요소 전부 · g4_korean units 6 → 4-1 국어 완주 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g3s2_social'); const u1 = sj && sj.units.find(x => x.unit === 1); ok(sj && sj.term === 2 && sj.title === '3학년 2학기 사회' && u1 && u1.title === '사회 변화와 다양한 문화' && u1.lessons.length === 12 && u1.lessons.map(l => l.key).join() === Array.from({ length: 12 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0')).join() && u1.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '45차: 2학기 사회 u1 사회 변화와 다양한 문화 12차시 키(자기주도 파일 번호 · 두 시간 한 파일 다섯) × 19장 · 7요소 전부 = 3학년 2학기 전 과목 완주 (manifest)');
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g3s2_social'); const u2 = sj && sj.units.find(x => x.unit === 2); ok(u2 && u2.title === '옛날과 오늘날의 생활 모습' && u2.lessons.length === 8 && u2.lessons.map(l => l.key).join() === Array.from({ length: 8 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0')).join() && u2.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '53·54차: 2학기 사회 u2 옛날과 오늘날의 생활 모습 — 자기주도 채워진 8차시 키(두 시간 한 파일 셋 · l07 정리 · l08 교통) × 19장 · 7요소 전부 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_social'); const u1 = sj && sj.units.find(x => x.unit === 1); ok(sj && sj.grade === 4 && sj.term === 1 && u1 && u1.title === '지도로 만나는 우리 지역' && u1.lessons.length === 13 && u1.lessons.map(l => l.key).join() === Array.from({ length: 13 }, (_, i) => 'u1_l' + String(i + 1).padStart(2, '0')).join() && u1.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '76차: 4-1 사회 u1 지도로 만나는 우리 지역 13차시 키(원문 파일 번호) × 19장 · 7요소 전부 (manifest)'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g4_social'); const u2 = sj && sj.units.find(x => x.unit === 2); ok(sj && sj.units.length >= 2 && u2 && u2.title === '우리 지역의 국가유산' && u2.lessons.length === 12 && u2.lessons.map(l => l.key).join() === Array.from({ length: 12 }, (_, i) => 'u2_l' + String(i + 1).padStart(2, '0')).join() && u2.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '78차: 4-1 사회 u2 우리 지역의 국가유산 12차시 키(원문 파일 번호) × 19장 · 7요소 전부 (manifest)'); }
  const FIG = g0.KT2_FIG; const sb = FIG.render({ k: 'sbars', x: ['1990년', '2000년'], v: [65, 64], unit: '만 명', hi: [0, 1], cmp: true }); const dt = FIG.render({ k: 'dots', groups: [{ name: '2020년', on: 16 }] }); ok(/data-v="65,64"/.test(sb) && /1만 명 줄었어요/.test(sb) && /data-on="16"/.test(dt) && (dt.match(/<circle/g) || []).length === 100, '45차: 사회 부품 sbars(막대·두 해 견주기 캡션) · dots(백 명 마을)'); }
  { const ld = g0.KT2_FIG.render({ k: 'led', cols: 3, kinds: ['음식', '하던 일'], cells: [{ name: '떡국', k: 0 }, { name: '축구', k: 2 }, { name: '세배', k: 1 }, { name: '라면', k: 2 }, { name: '송편', k: 0 }, { name: '빵', k: 5 }], caption: '켠 칸 **3**' }); ok(/data-lit="3"/.test(ld) && /data-shape="#\.#\|\.#\."/.test(ld) && (ld.match(/so-lc on k0/g) || []).length === 2 && (ld.match(/so-lc off/g) || []).length === 3 && /꺼진 칸/.test(ld) && g0.KT2_FIG.render({ k: 'led', cells: [] }) === '', '54차: 전광판 led — 켠 칸 수·줄 모양·갈래 색·꺼진 칸(갈래 밖 k 도 끔)·빈 판 빈 글자'); }
  { const FIG = g0.KT2_FIG; const ph = FIG.render({ k: 'pause', sym2: '≡', lines: ['우리는∨비 오는 날에∨우산을 씁니다.≡'] }); const p0 = FIG.render({ k: 'pause', lines: ['우리는∨비 오는 날에∨∨'] }); ok((ph.match(/class="ko-p1"/g) || []).length === 3 && (ph.match(/class="ko-p2">≡/g) || []).length === 2 && !/∨∨/.test(ph) && /class="ko-p2">∨∨/.test(p0) && !/≡/.test(p0), '36차: 띄어 읽기 sym2(≡) — 글줄·범례 모두 ≡ · 없으면 종전 ∨∨ 그대로'); }
  const mh = KT2.renderSlide({ id: 'm', block: 'basic_problem', data: { question: 'q', multi: true, options: [{ text: 'a', correct: true }, { text: 'b', correct: true }, { text: 'c' }] } }, { revealed: true, state: {}, meta: {}, unitTitle: 'U', classNames: [] }).body; ok(/multi-hint/.test(mh) && (mh.match(/opt ok/g) || []).length === 2 && (mh.match(/class="mk">☑/g) || []).length === 2, '35차: 기본 문제 「모두 고르기」(multi) — 체크 칸 · 안내 · 열림 정답 둘'); }
{ const sj = manifest && manifest.subjects.find(x => x.slug === 'g3s2_math'); const u1 = sj && sj.units.find(x => x.unit === 1); ok(sj && sj.term === 2 && sj.title === '3학년 2학기 수학' && u1 && u1.title === '곱셈' && u1.lessons.length === 10 && u1.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '29차: 2학기 수학 u1 곱셈 10차시 × 19장 · 7요소 전부 (manifest)');
  const u2 = sj && sj.units.find(x => x.unit === 2); ok(u2 && u2.title === '나눗셈' && u2.lessons.length === 11 && u2.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '30차: 2학기 수학 u2 나눗셈 11차시 × 19장 · 7요소 전부 (manifest)');
  const u3 = sj && sj.units.find(x => x.unit === 3); ok(u3 && u3.title === '원' && u3.lessons.length === 7 && u3.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '31차: 2학기 수학 u3 원 7차시 × 19장 · 7요소 전부 (manifest)');
  const u4 = sj && sj.units.find(x => x.unit === 4); ok(u4 && u4.title === '분수와 소수' && u4.lessons.length === 11 && u4.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '32차: 2학기 수학 u4 분수와 소수 11차시 × 19장 · 7요소 전부 (manifest)');
  const u5 = sj && sj.units.find(x => x.unit === 5); ok(u5 && u5.title === '들이와 무게' && u5.lessons.length === 10 && u5.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '33차: 2학기 수학 u5 들이와 무게 10차시 × 19장 · 7요소 전부 (manifest)');
  const u6 = sj && sj.units.find(x => x.unit === 6); ok(u6 && u6.title === '그림그래프' && u6.lessons.length === 7 && u6.lessons.every(l => l.slides === 19 && l.seven.every(Boolean)), '34차: 2학기 수학 u6 그림그래프 7차시 × 19장 · 7요소 전부 (manifest)');
  const r = KT2.renderSlide({ id: 'o', block: 'offline_activity', data: { title: 'x', type: 'pair', steps: ['가', '나'], solo: ['혼자 가', '혼자 나', '혼자 다'] } }, { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] });
  const r0 = KT2.renderSlide({ id: 'o', block: 'offline_activity', data: { title: 'x', type: 'pair', steps: ['가'] } }, { revealed: false, state: {}, meta: {}, unitTitle: 'U', classNames: [] });
  ok(/class="solo"><span class="lb">🙋 혼자라면<\/span>/.test(r.body) && (r.body.match(/<i>→<\/i>/g) || []).length === 2 && !/class="solo"/.test(r0.body), '29차: 교실 활동 1인 흐름 줄(solo) — 있으면 → 로 잇고, 없으면 종전 그대로'); }
const html = fs.readFileSync(path.join(__dirname, 'stage.html'), 'utf8');
function runStage(sj, un, l) {
  const url = 'https://keduclass.com/kedu/teacher/stage2/stage.html?g=' + sj.grade + '&s=' + sj.subject + ((sj.term || 1) > 1 ? '&t=' + sj.term : '') + '&u=' + un.unit + '&l=' + l.key;
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
  try { st = new w.KT2.Stage({ params: { g: String(sj.grade), s: sj.subject, t: String(sj.term || 1), u: String(un.unit), l: l.key }, lessons: w.LESSONS, unitTitle: un.title }); } catch (e) { fail++; fails.push(tag + ' 부팅 예외: ' + e.message); return; }
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
