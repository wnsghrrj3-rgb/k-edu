/* stage2/build_manifest.js — 2세대 무대 차시 목록 생성기.
   data/g{g}_{과목}_u{N}.js 를 전부 실행해 LESSONS 키·제목·슬라이드 수를 뽑고,
   홈(g{g}_{과목}.html)의 CURRICULUM 에서 단원 이름을 읽어 manifest.js 로 찍는다.
   실행: node kedu/teacher/stage2/build_manifest.js   (레포 루트 기준 어디서든)   */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const TEACHER = path.resolve(__dirname, '..');
const DATA = path.join(TEACHER, 'data');
const SUBJ_KO = { math: '수학', korean: '국어', science: '과학', social: '사회', english: '영어' };
const STAGES = ['도입', '전개', '기본문제', '응용문제', '정리'];

function loadLessons(file) {
  const L = {};
  const ctx = { window: { LESSONS: L }, LESSONS: L, document: { getElementById: () => null } };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return ctx.window.LESSONS || {};
}

function unitTitles(home) {
  const map = {};
  if (!fs.existsSync(home)) return map;
  const src = fs.readFileSync(home, 'utf8');
  const re = /unit:\s*(\d+),\s*title:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) map[+m[1]] = m[2];
  return map;
}

function lessonNo(key) {
  // u1_l02_03 → "2~3", u1_l07 → "7"
  const m = key.match(/_l(\d+)(?:_(\d+))?$/);
  if (!m) return key;
  const a = String(+m[1]);
  return m[2] ? a + '~' + String(+m[2]) : a;
}

const files = fs.readdirSync(DATA).filter(f => /^g\d_[a-z]+_u\d+\.js$/.test(f)).sort();
const subjects = {};
let totalLessons = 0, totalSlides = 0;
files.forEach(f => {
  const m = f.match(/^g(\d)_([a-z]+)_u(\d+)\.js$/);
  const g = +m[1], s = m[2], u = +m[3];
  const slug = 'g' + g + '_' + s;
  const L = loadLessons(path.join(DATA, f));
  if (!subjects[slug]) {
    subjects[slug] = { slug, grade: g, subject: s, subject_ko: SUBJ_KO[s] || s, title: g + '학년 ' + (SUBJ_KO[s] || s), units: [] };
  }
  const titles = unitTitles(path.join(TEACHER, slug + '.html'));
  const lessons = Object.keys(L).filter(k => k.startsWith('u' + u + '_')).sort((a, b) => {
    const na = +(a.match(/_l(\d+)/) || [0, 0])[1], nb = +(b.match(/_l(\d+)/) || [0, 0])[1];
    return na - nb;
  }).map(k => {
    const d = L[k] || {};
    const meta = d.meta || {};
    const slides = Array.isArray(d.slides) ? d.slides : [];
    const stageCount = {};
    slides.forEach(sl => { stageCount[sl.stage] = (stageCount[sl.stage] || 0) + 1; });
    const blocks = [...new Set(slides.map(sl => sl.block))];
    const inter = slides.filter(sl => /card_quiz|chosung|present|interactive|klab|math_tool|leveled|exit_ticket|card_arrange|read_aloud/.test(sl.block)).length;
    // 40분 7요소(차시_밀도_표준_v2 §2): ①복습 문항형 ②실사 ③서사 ④교실 활동 ⑤수준별 ⑥출구 ⑦발문 6슬↑
    const has = (f) => slides.some(f);
    const seven = [
      has(sl => sl.block === 'review' && sl.data && Array.isArray(sl.data.items) && sl.data.items.length >= 2),
      has(sl => sl.data && sl.data.img),
      has(sl => sl.block === 'motivate' && sl.data && (sl.data.kids || sl.data.theme)),
      has(sl => sl.block === 'offline_activity'),
      has(sl => sl.block === 'leveled_problem'),
      has(sl => sl.block === 'exit_ticket'),
      slides.filter(sl => (sl.data && sl.data.tnote) || sl.tnote).length >= 6
    ];
    totalLessons++; totalSlides += slides.length;
    return { key: k, no: lessonNo(k), title: meta.subtitle || meta.title || k, meta_title: meta.title || '', std: meta.std || '', slides: slides.length,
      stages: STAGES.map(st => stageCount[st] || 0), interactive: inter, blocks: blocks.length, seven: seven.map(x => x ? 1 : 0) };
  });
  subjects[slug].units.push({ unit: u, title: titles[u] || (u + '단원'), file: 'data/' + f, resources: fs.existsSync(path.join(TEACHER, 'resources', slug + '_u' + u + '.js')) ? 'resources/' + slug + '_u' + u + '.js' : null, lessons });
});
Object.values(subjects).forEach(s => s.units.sort((a, b) => a.unit - b.unit));

const order = ['math', 'korean', 'science', 'social', 'english'];
const list = Object.values(subjects).sort((a, b) => a.grade - b.grade || order.indexOf(a.subject) - order.indexOf(b.subject));
const out = '/* stage2/manifest.js — 생성물. 손으로 고치지 말고 build_manifest.js 를 다시 돌릴 것.\n   생성: ' + new Date().toISOString().slice(0, 10) + ' · 과목 ' + list.length + ' · 차시 ' + totalLessons + ' · 슬라이드 ' + totalSlides + ' */\n'
  + 'window.KT2_MANIFEST = ' + JSON.stringify({ built: new Date().toISOString().slice(0, 10), lessons: totalLessons, slides: totalSlides, subjects: list }, null, 1) + ';\n';
fs.writeFileSync(path.join(__dirname, 'manifest.js'), out);
console.log('manifest: subjects', list.length, '· lessons', totalLessons, '· slides', totalSlides);
