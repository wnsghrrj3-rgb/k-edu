/* audit_all_homes.js — 케이티처 전 홈 실렌더 전수 점검(게이트 밖의 전체 그물).
   각 교사 홈(g{N}_{과목}.html)을 jsdom 실엔진으로 부팅해
     ① CURRICULUM 차시 ↔ LESSONS 키 정합(둘 중 한쪽에만 있는 차시 = 라이브에서 카드가 안 뜨거나 빈 카드)
     ② 허브 index.html READY 카운트 ↔ 홈 실측(단원 수·ready 차시 수) 정합 + 미등재 홈 검출
     ③ ready 차시 전부 openShow → 전 슬라이드 순회 실렌더(예외 0 · 폴백 「내용을 추가하세요」 0 ·
        엔진이 모르는 블록 0)
     ④ 홈 배선 <script src="data/…"> 전부 실존 + 닫는 태그
   를 한 번에 잰다. 단원 게이트는 단원 하나를 깊게, 이 점검은 전 홈을 넓게 본다.
   실행: NODE_PATH=/home/claude/.jsdom/node_modules node audit_all_homes.js  (k-edu 클론에서) */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const TDIR = path.resolve(__dirname, '..');
const ENGINE = fs.readFileSync(path.join(TDIR, 'engine/teacher-engine.js'), 'utf8');
const HUB = fs.readFileSync(path.join(TDIR, 'index.html'), 'utf8');
const KNOWN_BLOCKS = new Set([...ENGINE.matchAll(/case '([a-z_]+)':/g)].map(m => m[1]));

let pass = 0, fail = 0;
const T = (n, f) => { try { f(); pass++; console.log('  ✅ ' + n); } catch (e) { fail++; console.log('  ❌ ' + n + ' — ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m || 'falsy'); };

// 허브 READY 파싱
const READY = {};
for (const m of HUB.matchAll(/"(\d)_([a-z]+)":\s*\{\s*file:\s*"([^"]+)",\s*units:\s*(\d+),\s*lessons:\s*(\d+)\s*\}/g)) {
  READY[m[1] + '_' + m[2]] = { file: m[3], units: +m[4], lessons: +m[5] };
}

const HOMES = fs.readdirSync(TDIR).filter(f => /^g\d_[a-z]+\.html$/.test(f)).sort();
const HOME_FOR_KEY = {};
HOMES.forEach(h => { const m = h.match(/^g(\d)_([a-z]+)\.html$/); HOME_FOR_KEY[m[1] + '_' + m[2]] = h; });

function extractBody(html) {
  let b = html.replace(/[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*/, '');
  return b.replace(/<script[\s\S]*?<\/script>/g, '');
}
function curricSrc(html) {
  const m = html.match(/(?:const|var|let)\s+CURRICULUM\s*=\s*\[[\s\S]*?\n\];/) || html.match(/window\.CURRICULUM_[A-Z0-9_]+\s*=\s*\[[\s\S]*?\n\];/);
  if (!m) throw new Error('CURRICULUM 블록을 못 찾음');
  return m[0].replace(/^(?:const|var|let)\s+CURRICULUM/, 'window.CURRICULUM').replace(/^window\.CURRICULUM_[A-Z0-9_]+/, 'window.CURRICULUM');
}
function lessonKey(unit, lesson) {
  const s = String(lesson);
  if (s.indexOf('~') >= 0) return `u${unit}_l${s.split('~').map(x => x.trim().padStart(2, '0')).join('_')}`;
  return `u${unit}_l${s.padStart(2, '0')}`;
}

for (const home of HOMES) {
  const key = home.match(/^g(\d)_([a-z]+)\.html$/).slice(1).join('_');
  console.log(`\n═══ ${home} ═══`);
  const html = fs.readFileSync(path.join(TDIR, home), 'utf8');
  const bodyClass = (html.match(/<body[^>]*class="([^"]*)"/) || [, ''])[1];

  // ④ 배선
  const srcs = [...html.matchAll(/<script src="(data\/[^"]+)"><\/script>/g)].map(m => m[1]);
  T(`data 배선 ${srcs.length}건 실존 + 닫는 태그`, () => {
    ok(srcs.length > 0, 'data 배선 0건');
    srcs.forEach(s => ok(fs.existsSync(path.join(TDIR, s)), '없는 파일 배선: ' + s));
    const opens = (html.match(/<script src="data\//g) || []).length;
    ok(opens === srcs.length, `열림 ${opens} vs 닫힘 ${srcs.length}`);
  });

  // 부팅
  let w, CUR, vc; const jsErrors = [];
  T('jsdom 실엔진 부팅', () => {
    // 이벤트 리스너 안에서 터진 예외는 jsdom이 삼키고 콘솔에만 적는다 → virtualConsole로 붙잡아 실패로 센다.
    vc = new VirtualConsole();
    vc.on('jsdomError', e => { jsErrors.push(String(e && e.detail && e.detail.message || e.message || e)); });
    const dom = new JSDOM(`<!DOCTYPE html><html><body class="${bodyClass}">${extractBody(html)}</body></html>`, { runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
    w = dom.window;
    w.console.error = () => {}; w.console.warn = () => {};
    w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    w.scrollTo = () => {};
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.eval('var LESSONS = {}; window.LESSONS = LESSONS;');
    srcs.forEach(s => w.eval(fs.readFileSync(path.join(TDIR, s), 'utf8')));
    w.eval(curricSrc(html));
    w.eval(ENGINE);
    CUR = w.CURRICULUM;
    const slug = (html.match(/slug:\s*["']([^"']+)["']/) || [, key])[1];
    w.eval(`Teacher.init({ subject:{ slug:'${slug}', label:'${home}' }, curriculum:window.CURRICULUM, lessons:window.LESSONS });`);
    ok(w.document.querySelector('#home-view') || w.document.querySelector('.home-view') || w.document.body.innerHTML.length > 0, '홈 렌더 0');
  });
  if (!w) continue;

  // ① CURRICULUM ↔ LESSONS
  const curKeys = [];
  CUR.forEach(u => (u.lessons || []).forEach(l => curKeys.push({ key: lessonKey(u.unit, l.n), ready: l.ready, unit: u.unit, n: l.n })));
  const dataKeys = Object.keys(w.LESSONS).filter(k => w.LESSONS[k] && Array.isArray(w.LESSONS[k].slides));
  T(`CURRICULUM ${curKeys.length}차시 ↔ LESSONS ${dataKeys.length}키 정합`, () => {
    const curSet = new Set(curKeys.map(c => c.key));
    const orphan = dataKeys.filter(k => !curSet.has(k));
    ok(orphan.length === 0, 'LESSONS에만 있고 CURRICULUM에 없는 키(카드가 안 뜸): ' + orphan.join(','));
    const readyNoData = curKeys.filter(c => c.ready && !dataKeys.includes(c.key)).map(c => c.key);
    ok(readyNoData.length === 0, 'ready:true인데 데이터 없음(빈 카드): ' + readyNoData.join(','));
  });
  const readyCards = w.document.querySelectorAll('.lesson-card.ready').length;
  const notReadyWithData = curKeys.filter(c => !c.ready && dataKeys.includes(c.key)).map(c => c.key);
  T(`홈 ready 카드 ${readyCards} = 데이터 보유 차시 ${dataKeys.length}`, () => {
    ok(readyCards === dataKeys.length, `ready 카드 ${readyCards} ≠ 데이터 ${dataKeys.length}` + (notReadyWithData.length ? ` (ready 플래그 없이 데이터만: ${notReadyWithData.length}건 — 엔진 자동 ready)` : ''));
  });

  // ② 허브
  T(`허브 READY["${key}"] 등재 + 카운트(units ${CUR.length} · lessons ${dataKeys.length})`, () => {
    const info = READY[key];
    ok(info, `허브 index.html READY에 "${key}" 미등재 — 라이브 허브에서 「준비 중」으로 보임`);
    ok(info.file === home, `허브 file ${info.file} ≠ ${home}`);
    ok(info.units === CUR.length, `허브 units ${info.units} ≠ 홈 실측 ${CUR.length}`);
    ok(info.lessons === dataKeys.length, `허브 lessons ${info.lessons} ≠ 홈 ready 실측 ${dataKeys.length}`);
  });

  // ③ 전 차시 전 슬라이드 실렌더
  T(`ready ${dataKeys.length}차시 전 슬라이드 실렌더(예외 0·폴백 0·오류 카드 0·미지 블록 0)`, () => {
    const bad = [];
    curKeys.filter(c => dataKeys.includes(c.key)).forEach(c => {
      const les = w.LESSONS[c.key];
      const unknown = les.slides.map(s => s.block).filter(b => !KNOWN_BLOCKS.has(b));
      if (unknown.length) bad.push(`${c.key}: 엔진이 모르는 블록 ${[...new Set(unknown)].join('/')}`);
      try {
        const before = jsErrors.length;
        w.eval(`Teacher.openShow(${JSON.stringify(String(c.unit))}, ${JSON.stringify(String(c.n))})`);
        const n = les.slides.length;
        const stage = w.document.querySelector('#slide-stage') || w.document.body;
        for (let i = 0; i < n; i++) {
          if (i > 0) w.eval('Teacher._debug && Teacher._debug(); document.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowRight"}))');
          const t = stage.textContent || '';
          if (t.indexOf('내용을 추가하세요') >= 0) { bad.push(`${c.key} s${i + 1}: 폴백 「내용을 추가하세요」`); break; }
          // 점검 2/2: 엔진이 renderSlide 예외를 오류 카드로 감싸므로 예외가 콘솔로 새지 않는다 — 카드 문구로 잡는다.
          if (t.indexOf('이 슬라이드를 그리지 못했어요') >= 0) { bad.push(`${c.key} s${i + 1}: 오류 카드(renderSlide 예외)`); break; }
        }
        w.eval('Teacher.backToHome()');
        if (jsErrors.length > before) bad.push(`${c.key}: 렌더 중 예외 ${jsErrors.length - before}건 — ${jsErrors[before].split('\n')[0]}`);
      } catch (e) { bad.push(`${c.key}: ${e.message}`); }
    });
    ok(bad.length === 0, bad.slice(0, 8).join(' | ') + (bad.length > 8 ? ` …외 ${bad.length - 8}` : ''));
  });
}

// 허브에 등재됐는데 홈 파일이 없는 키 / 홈은 있는데 허브에 없는 키
console.log('\n═══ 허브 index.html 전체 ═══');
T(`허브 READY ${Object.keys(READY).length}건 전부 홈 파일 실존`, () => {
  const miss = Object.entries(READY).filter(([k, v]) => !fs.existsSync(path.join(TDIR, v.file))).map(([k]) => k);
  ok(miss.length === 0, '파일 없는 등재: ' + miss.join(','));
});
T(`홈 ${HOMES.length}개 전부 허브 등재`, () => {
  const miss = Object.keys(HOME_FOR_KEY).filter(k => !READY[k]);
  ok(miss.length === 0, '허브 미등재 홈: ' + miss.map(k => HOME_FOR_KEY[k]).join(','));
});

console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
process.exit(fail ? 1 : 0);
