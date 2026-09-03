#!/usr/bin/env node
/**
 * 우리 반 이름 출력 게이트 — teacher/print.html
 *  ① 규격표 — 모든 칸이 A4(또는 A4 가로) 안에 들어가는가 · 여백이 음수가 되지 않는가
 *  ② 서버 — 새 표·RPC·쓰기 0 (읽기만) · 보정값은 localStorage
 *  ③ 화면 — 세 갈래(스티커·명패·뽑기) · 테두리 5 · 그림 8 · 폴백(로그인 없어도 붙여넣기)
 *  ④ jsdom — 명단 → 칸 배치가 실제로 맞물리는가(1명당 여러 장·여러 장 넘김·시험 인쇄)
 *
 * ⚠️ 규칙 3: 일부러 깨서 빨간불을 본 것만 초록으로 친다.
 * 실행: node tests/test_print_names.js   (k-edu 루트)
 */
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const R = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗', m); } };
const html = rd('teacher/print.html');

// ── ① 규격표 ────────────────────────────────────────────────
const specsSrc = (html.split('const SPECS = [')[1] || '').split('];')[0];
ok(specsSrc.length > 0, '규격표를 찾았다');
const SPECS = eval('[' + specsSrc.replace(/A4L/g, '[297,210]').replace(/A4/g, '[210,297]') + ']');
ok(SPECS.length >= 12, '규격 12종 이상 (' + SPECS.length + ')');
['sticker', 'plate', 'draw'].forEach(k =>
  ok(SPECS.some(s => s.kind === k), '갈래 있음: ' + k));
ok(SPECS.filter(s => s.kind === 'sticker').length >= 6, '스티커 규격 6종 이상(폼텍 여러 규격 — 준호 결정)');

/* ★ 종이 밖으로 나가는 규격이 하나도 없어야 한다 — 이게 이 도구의 첫 번째 사실성 */
let over = 0, neg = 0, small = 0;
SPECS.forEach(s => {
  const totalW = s.cols * s.cell[0] + (s.cols - 1) * s.gap[0];
  const totalH = s.rows * s.cell[1] + (s.rows - 1) * s.gap[1];
  if (totalW > s.page[0] || totalH > s.page[1]) { over++; console.log('    · 넘침:', s.id, totalW, totalH); }
  if ((s.page[0] - totalW) / 2 < 0 || (s.page[1] - totalH) / 2 < 0) neg++;
  if (s.cell[0] < 20 || s.cell[1] < 15) small++;
});
ok(over === 0, '★★ 모든 규격이 종이 안에 들어간다');
ok(neg === 0, '★ 가운데 정렬 여백이 음수가 되는 규격 0');
ok(small === 0, '너무 작아 이름이 안 들어가는 칸 0');
/* 폼텍 공개 규격과 칸 크기가 맞는가 (검색으로 확인한 값) */
const byId = id => SPECS.find(s => s.id === id);
ok(byId('f3107') && byId('f3107').cell[0] === 99.1 && byId('f3107').cell[1] === 33.9 && byId('f3107').cols * byId('f3107').rows === 16,
   '★ 폼텍 3107 = 16칸 99.1×33.9');
ok(byId('f3108') && byId('f3108').cell[0] === 99.1 && byId('f3108').cell[1] === 38.1 && byId('f3108').cols * byId('f3108').rows === 14,
   '★ 폼텍 3108 = 14칸 99.1×38.1');
ok(byId('f3106') && byId('f3106').cell[0] === 64 && byId('f3106').cell[1] === 34 && byId('f3106').cols * byId('f3106').rows === 24,
   '★ 폼텍 3106 = 24칸 64×34');
ok(byId('f3105') && byId('f3105').cols * byId('f3105').rows === 21, '폼텍 3105 = 21칸');
ok(byId('f3102') && byId('f3102').cols * byId('f3102').rows === 40, '폼텍 3102 = 40칸');
ok(byId('f3116') && byId('f3116').cols * byId('f3116').rows === 6, '폼텍 3116 = 6칸');
ok(byId('desk') && byId('desk').page[0] === 297 && byId('desk').fold === true, '★ 책상 명패는 A4 가로 + 접는 선');
ok(SPECS.filter(s => s.fold).length >= 2, '접는 명패 2종 이상');
ok(SPECS.filter(s => s.kind === 'sticker' && s.cut).length >= 2, '라벨지 없이 잘라 쓰는 규격도 있다');

// ── ② 서버 — 읽기만 한다 ────────────────────────────────────
ok(!/\.insert\(|\.upsert\(|\.update\(|\.delete\(/.test(html), '★★ 서버에 쓰는 자리 0 — 읽기만 한다');
ok(!/db\.rpc\(/.test(html), '★ 새 RPC 를 부르지 않는다(있는 표만 읽는다)');
ok(/from\('student_seats'\)/.test(html) && /select\('nickname, seat_no'\)/.test(html),
   '명단은 student_seats 에서 번호·이름만 읽는다');
ok(!/claim_code|claimed_by|user_id\s*:/.test(html.split('student_seats')[1] || ''),
   '★ 필요 없는 학생 정보를 읽지 않는다(단축코드·점유자 0)');
ok(/localStorage\.setItem\(LS_KEY/.test(html) && /kedu_print_names_v1/.test(html),
   '★ 보정값·고른 값은 이 기기(localStorage)에만 — 서버에 올리지 않는다');
ok(/kedu_teacher_gate\.js/.test(html), '교사 전용 게이트 탑재');
ok(!/kedu_tracker\.js/.test(html), '교사 도구라 학습 추적은 싣지 않는다');
ok(/href="\/teacher\/print\.html"/.test(rd('teacher/index.html')), '★ 교사 대시보드에 입구가 있다');

// ── ③ 화면 ─────────────────────────────────────────────────
const borders = (html.split('const BORDERS = [')[1] || '').split('];')[0];
ok((borders.match(/id:'/g) || []).length === 5, '테두리 5종(준호 결정: 테두리·그림까지)');
const pics = (html.split('const PICS = {')[1] || '').split('};')[0];
ok((pics.match(/^\s{2}\w+:/gm) || []).length >= 8, '그림 8종 이상');
ok(!/https?:\/\/(?!fonts|cdn\.jsdelivr)/.test(pics), '★ 그림은 인라인 SVG — 바깥에서 받아 오지 않는다');
ok(/id="paste"/.test(html) && /function applyPaste\(\)/.test(html),
   '★ 폴백 — 로그인·명단이 없어도 붙여넣기로 쓸 수 있다(규칙 5)');
const loadFn = (html.split('async function loadSeats()')[1] || '').split('function togglePaste()')[0];
ok((loadFn.match(/붙여넣기로 쓸 수 있어요/g) || []).length >= 4,
   '★ 명단을 못 읽는 모든 갈래(비로그인·비교사·학급 없음·오류)에서 길을 알려 준다');
ok(/catch\(e\)\{/.test(loadFn), '명단 로드 실패가 화면을 멈추지 않는다');
ok(/시험 인쇄/.test(html) && /function testPrint\(\)/.test(html), '★ 테두리만 시험 인쇄');
ok(/여백은 프린터마다 1~2mm 밀립니다/.test(html), '★★ 여백이 밀린다는 사실을 화면이 먼저 말한다(정직)');
ok(/여백 「없음」/.test(html) && /배율 100%/.test(html), '인쇄 창 설정 안내');
ok(/@page\{ size:\$\{pw\}mm \$\{ph\}mm; margin:0 \}/.test(html), '★ 용지 크기를 규격대로 내보낸다(가로 명패 포함)');
ok(/page-break-after:always/.test(html), '여러 장이 장마다 끊긴다');
ok(/esc\(item\.name\)/.test(html) && /esc\(item\.no\)/.test(html), '★ 이름·번호 이스케이프');
ok(/1명당/.test(html) && /id="percount"/.test(html), '★ 1명당 여러 장(사물함·책상·학용품)');

// ── ④ jsdom ────────────────────────────────────────────────
const dom = new JSDOM(html, { runScripts: 'outside-only' });
const w = dom.window, d = w.document;
// 서버·게이트 없이 화면 함수만 살린다
w.eval('function getKeduDb(){ return { auth:{ getSession: async()=>({data:{session:null}}) } }; }');
/* ⚠️ 하니스 함정(승계 주의) — eval 안의 `let`/`const` 는 **그 eval 만의 자리**에 묶여
   바깥에서 못 본다(함수 선언만 전역으로 올라간다). 상태 둘만 `var` 로 바꿔 잡는다.
   제품 코드를 고치는 게 아니라 하니스가 들여다볼 창을 내는 것이다. */
const js = html.split('<script>')[1].split('</script>')[0]
  .replace(/^let students/m, 'var students').replace(/^let ui/m, 'var ui');
w.eval(js.replace(/loadSeats\(\);\s*$/, ''));
ok(/^var students/m.test(js) && /^var ui/m.test(js), '하니스 — 상태 둘을 들여다볼 수 있다');
w.eval("students = [{no:1,name:'김하늘'},{no:2,name:'이바다'},{no:3,name:'박구름'}];");

function cells(){ return [...d.querySelectorAll('[data-cell]')]; }
function filled(){ return cells().filter(e => e.dataset.filled === '1'); }

w.render();
ok(d.querySelectorAll('.sheet').length === 1, 'jsdom — 3명이면 종이 1장');
ok(filled().length === 3, 'jsdom — 채워진 칸 3');
ok(cells().length === 16, 'jsdom — 3107 은 한 장에 16칸');
ok(d.querySelector('[data-cell="0"]').innerHTML.indexOf('김하늘') >= 0, 'jsdom — 첫 칸에 첫 학생');
ok(d.querySelector('[data-cell="0"]').innerHTML.indexOf('>1<') >= 0, 'jsdom — 번호도 함께');

/* ★ 1명당 여러 장 — 사물함·책상·학용품에 붙일 때 */
d.getElementById('percount').value = '6'; w.render();
ok(filled().length === 18, '★ jsdom — 1명당 6장 = 18칸');
ok(d.querySelectorAll('.sheet').length === 2, '★ jsdom — 16칸을 넘으면 종이 2장');
const firstNames = [0,1,2,3,4,5].map(i => d.querySelector('[data-cell="'+i+'"]').innerHTML.indexOf('김하늘') >= 0);
ok(firstNames.every(Boolean), 'jsdom — 같은 이름이 이어서 여섯 칸');
d.getElementById('percount').value = '1';

/* 내용 갈래 */
d.getElementById('content').value = 'name'; w.render();
ok(d.querySelector('[data-cell="0"]').innerHTML.indexOf('class="no"') < 0, 'jsdom — 「이름만」은 번호를 빼고 찍는다');
d.getElementById('content').value = 'no_name_class';
d.getElementById('classlabel').value = '3학년 2반'; w.render();
ok(d.querySelector('[data-cell="0"]').innerHTML.indexOf('3학년 2반') >= 0, 'jsdom — 학급 이름까지');
d.getElementById('content').value = 'no_name'; w.render();

/* 꾸미기 */
w.pickBorder('round');
ok(d.querySelector('[data-cell="0"]').className.indexOf('b-round') >= 0, 'jsdom — 둥근 테두리');
w.pickPic('star');
ok(d.querySelector('[data-cell="0"]').innerHTML.indexOf('<svg') >= 0, 'jsdom — 그림이 칸에 들어간다');
w.pickPic('none');
ok(d.querySelector('[data-cell="0"]').innerHTML.indexOf('<svg') < 0, 'jsdom — 「없음」이면 그림 0');
w.pickBorder('none');
ok(d.querySelector('[data-cell="0"]').className.indexOf('b-solid') < 0, 'jsdom — 테두리 없음');

/* ★ 잘라 쓰는 규격은 테두리 「없음」이어도 자를 선을 남긴다 */
w.pickKind('draw');
ok(d.getElementById('preset').value.indexOf('draw') === 0, 'jsdom — 뽑기 갈래로 바뀐다');
ok(d.querySelector('[data-cell="0"]').className.indexOf('b-cut') >= 0, '★ jsdom — 잘라 쓰는 규격은 자를 선이 남는다');

/* ★ 책상 명패 — 반 접어 세우면 양쪽에서 읽히게 이름이 두 번, 위쪽은 뒤집혀 찍힌다 */
w.pickKind('plate');
d.getElementById('preset').value = 'desk'; w.render();
const plate = d.querySelector('[data-cell="0"]');
ok((plate.innerHTML.match(/김하늘/g) || []).length === 2, '★★ jsdom — 명패에 이름이 두 번(양쪽에서 읽히게)');
ok(plate.innerHTML.indexOf('flip') >= 0, '★ jsdom — 한쪽은 뒤집어 찍는다');
ok(plate.innerHTML.indexOf('여기를 접어요') >= 0, 'jsdom — 접는 선 안내');
ok(d.getElementById('pagesize').textContent.indexOf('297mm 210mm') >= 0, '★ jsdom — 책상 명패는 A4 가로로 나간다');

/* 인쇄 위치 맞추기 */
w.pickKind('sticker');
d.getElementById('preset').value = 'f3107';
d.getElementById('offx').value = '0'; d.getElementById('offy').value = '0'; w.render();
const base = d.querySelector('[data-cell="0"]').style.top;
d.getElementById('offy').value = '2'; w.render();
const moved = d.querySelector('[data-cell="0"]').style.top;
ok(base !== moved, '★ jsdom — 보정값이 실제로 칸을 움직인다');
ok(parseFloat(moved) - parseFloat(base) === 2, '★★ jsdom — 2mm 넣으면 정확히 2mm 내려간다');
d.getElementById('offy').value = '0'; w.render();

/* 시험 인쇄 — 이름 0, 한 장 */
w.eval('ui.test = true; render();');
ok(filled().length === 0, '★ jsdom — 시험 인쇄에는 이름이 찍히지 않는다');
ok(d.querySelectorAll('.sheet').length === 1, 'jsdom — 시험 인쇄는 한 장');
ok(cells().length === 16, 'jsdom — 시험 인쇄도 칸은 규격대로');
w.eval('ui.test = false; render();');

/* 붙여넣기 폴백 — 번호가 있어도 없어도 */
d.getElementById('paste').value = '1 김하늘\n2. 이바다\n박구름';
w.applyPaste();
ok(w.eval('students.length') === 3, 'jsdom — 붙여넣기 3명');
ok(w.eval('students[1].no') === 2 && w.eval('students[1].name') === '이바다', 'jsdom — 「2. 이름」 형태를 가른다');
ok(w.eval('students[2].no') === 3 && w.eval('students[2].name') === '박구름', '★ jsdom — 번호 없이 이름만 적어도 위에서부터 번호가 붙는다');
d.getElementById('paste').value = '홍길동';
w.applyPaste();
ok(w.eval('students.length') === 1 && w.eval('students[0].no') === 1, 'jsdom — 한 명만도 된다');

/* 명단이 비어도 화면이 서 있다 */
w.eval('students = []; render();');
ok(d.querySelectorAll('.sheet').length === 1 && filled().length === 0, '★ jsdom — 명단이 비어도 빈 판이 그려진다(멈추지 않는다)');

console.log((fail === 0 ? '\u2705' : '\u274c') + ' 우리 반 이름 출력 — ' + pass + ' / ' + (pass + fail) + ' 통과');
process.exit(fail ? 1 : 0);
