/* ============================================================
   test_masterpiece_boot.js — 케이아트 명화 화면 실부팅 스모크
   jsdom으로 index.html을 띄워 갤러리 카드·단계 칩·썸네일이
   실제로 구성되는지, 작품 데이터 규격이 지켜지는지 확인.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const FILE = path.join(__dirname, '..', 'masterpiece', 'index.html');
const html = fs.readFileSync(FILE, 'utf8');

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? ' — ' + extra : '')); }
}

/* ── 정적 점검 ── */
console.log('[1] 정적 규격');
const BLOCKED = ['박음', '결로', '빵꾸', '갈아엎'];
t('차단 어휘 없음', BLOCKED.every(w => !html.includes(w)), BLOCKED.filter(w => html.includes(w)).join(','));
t('외부 스크립트 반입 없음', !/<script[^>]+src="https?:/.test(html));

/* ── 작품 데이터 ── */
const mA = html.match(/const AH=\{[\s\S]*?\n\};\n\nconst ARTWORKS=\[[\s\S]*?\n\];/);
t('AH·ARTWORKS 블록 존재', !!mA);
const mK = html.match(/window\.KMP = \(function\(\)\{[\s\S]*?\n\}\)\(\);/);
const w = {}; new Function('window', mK[0])(w);
const ARTWORKS = new Function('KMP', mA[0] + '\nreturn ARTWORKS;')(w.KMP);

console.log('[2] 작품 데이터 규격 (' + ARTWORKS.length + '점)');
t('작품 10점 이상', ARTWORKS.length >= 10, ARTWORKS.length + '점');
t('id 중복 없음', new Set(ARTWORKS.map(a => a.id)).size === ARTWORKS.length);
t('id는 photo와 겹치지 않음', ARTWORKS.every(a => a.id !== 'photo'));
t('필수 항목 완비', ARTWORKS.every(a => a.title && a.artist && a.year && a.emoji && a.desc && a.palette && a.levels && a.vw && a.vh && a.gw && a.gh));
t('해설 40자 이상', ARTWORKS.every(a => a.desc.length >= 40));
t('팔레트 4~14색·hex', ARTWORKS.every(a => a.palette.length >= 4 && a.palette.length <= 14 && a.palette.every(h => /^#[0-9A-Fa-f]{6}$/.test(h))));
t('단계 detail 1~4 오름차순', ARTWORKS.every(a => a.levels.every((l, i) => l.detail >= 1 && l.detail <= 4 && (i === 0 || l.detail > a.levels[i - 1].detail))));
t('단계 이름이 안내표에 있음', (() => {
  const names = (html.match(/const LV_DESC=\{([\s\S]*?)\};/) || [, ''])[1];
  return ARTWORKS.every(a => a.levels.every(l => names.includes("'" + l.name + "'")));
})());
t('격자 비율 = 화폭 비율', ARTWORKS.every(a => Math.abs(a.gw / a.gh - a.vw / a.vh) < 0.02));
t('격자 한 변 600 이하(성능)', ARTWORKS.every(a => a.gw <= 600 && a.gh <= 600));
t('paint 함수 존재', ARTWORKS.every(a => typeof a.paint === 'function'));
t('난이도 diff 1~3 전 작품', ARTWORKS.every(a => [1, 2, 3].includes(a.diff)));
t('저작권 — 퍼블릭도메인 화가만', (() => {
  const OK = ['가쓰시카 호쿠사이', '빈센트 반 고흐', '에드바르 뭉크', '클로드 모네', '피트 몬드리안',
    '김홍도', '앙리 마티스', '구스타프 클림트', '앙리 루소',
    '레오나르도 다빈치', '요하네스 베르메르', '에드가 드가', '조르주 쇠라', '프란츠 마르크', '알브레히트 뒤러',
    '바실리 칸딘스키', '파울 클레', '폴 세잔'];
  return ARTWORKS.every(a => OK.includes(a.artist));
})(), ARTWORKS.map(a => a.artist).join('/'));

/* ── 실부팅 ── */
console.log('[3] 화면 실부팅');
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://keduclass.com/draw/masterpiece/' });
const doc = dom.window.document;
const errs = [];
dom.window.addEventListener('error', e => errs.push(e.message));

t('오류 없이 부팅', errs.length === 0, errs.join(' | '));
const cards = doc.querySelectorAll('.art-card');
t('갤러리 카드 = 작품 수', cards.length === ARTWORKS.length, cards.length + '/' + ARTWORKS.length);
const chips = doc.querySelectorAll('.lv-chip');
const expChips = ARTWORKS.reduce((n, a) => n + a.levels.length, 0);
t('단계 칩 = 단계 합', chips.length === expChips, chips.length + '/' + expChips);
t('모든 칩에 작품·단계 표시', [...chips].every(c => c.dataset.art && c.dataset.lv !== undefined));
t('칩 작품 id가 실제 작품', [...chips].every(c => ARTWORKS.some(a => a.id === c.dataset.art)));
t('내 사진 칸 존재', !!doc.getElementById('photo-card'));
t('첫 화면 = 갤러리', !doc.getElementById('scr-gallery').classList.contains('hidden') && doc.getElementById('scr-paint').classList.contains('hidden'));
t('썸네일 그려짐', [...doc.querySelectorAll('img.art-thumb')].length >= 1);

console.log('');
console.log(fail === 0 ? `전체 통과 ${pass}/${pass + fail}` : `실패 ${fail}건 — ${pass}/${pass + fail}`);
process.exit(fail === 0 ? 0 : 1);
