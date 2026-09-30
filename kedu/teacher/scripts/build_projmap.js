/* build_projmap.js — 자기주도 투영 지도 (47차, 2026-09-30)
   케이티처 키(g3s2_<과목>:uN_lMM) → 그 키를 만든 자기주도 원문 파일의 회수 키들.
   투영 무대(stage2/learn.html)는 이 지도로 원문과 **같은 기록 자리**에 쓴다 — 학습 리포트·교사 대시보드가 끊기지 않게.
     id  = scores.lesson_id (원문 <meta name="kedu-lesson-id">, 없으면 파일 이름)
     ls  = 기기 진도 키 (원문 LS_KEY / kedu_progress_…)
     url = 원문 주소 (바꿔치기 전까지 학생이 실제로 여는 곳)
   실행: node kedu/teacher/scripts/build_projmap.js  → kedu/teacher/stage2/projmap.js */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..'), SCR = __dirname;
const SUBJ_DIR = { korean: 'korean', math: 'math', science: 'science', social: 'social' };
function walk(d, out) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, out); else if (/\.html$/.test(f)) out.push(p); } return out; }
const map = {}, miss = [];
for (const f of fs.readdirSync(SCR).filter(x => /^src_g(\d)s(\d)_(\w+)_u\d+\.json$/.test(x)).sort()) {
  const [, g, t, s] = f.match(/^src_g(\d)s(\d)_(\w+)_u\d+\.json$/);
  const base = path.join(ROOT, 'grade' + g, 'semester' + t, SUBJ_DIR[s]); if (!fs.existsSync(base)) { miss.push(f + ' (폴더 없음)'); continue; }
  const files = walk(base, []);
  const src = JSON.parse(fs.readFileSync(path.join(SCR, f), 'utf8'));
  for (const [key, L] of Object.entries(src)) {
    const hit = files.find(p => path.basename(p) === L.file); if (!hit) { miss.push(key + ' ' + L.file); continue; }
    const h = fs.readFileSync(hit, 'utf8');
    const meta = (h.match(/<meta name="kedu-lesson-id" content="([^"]+)"/) || [])[1];
    // 진도 키 — 사회: LS_KEY 글자 그대로 · 수학·과학: 'kedu_progress_' + LESSON_ID · 국어: 기기 진도 없음(null — recordLessonEnd 만)
    const lid = (h.match(/LESSON_ID\s*=\s*['"`]([^'"`]+)['"`]/) || [])[1];
    const ls = (h.match(/LS_KEY\s*=\s*["'`]([^"'`]+)["'`]/) || h.match(/["'`](kedu_progress_[A-Za-z0-9_]+)["'`]/) || [])[1]
      || (lid && /['"`]kedu_progress_['"`]\s*\+\s*LESSON_ID/.test(h) ? 'kedu_progress_' + lid : null);
    map['g' + g + 's' + t + '_' + s + ':' + key] = { id: meta || L.file.replace(/\.html$/, ''), ls, url: '/' + path.relative(ROOT, hit).split(path.sep).join('/'), file: L.file };
  }
}
const out = path.join(ROOT, 'kedu/teacher/stage2/projmap.js');
fs.writeFileSync(out, '/* 생성물 — scripts/build_projmap.js 가 만든다. 손으로 고치지 말 것. 케이티처 키 → 자기주도 원문 회수 키(id·ls·url) */\nwindow.KT2_PROJMAP = ' + JSON.stringify(map, null, 0).replace(/\},"/g, '},\n"') + ';\n');
console.log('→ projmap.js ' + Object.keys(map).length + ' 키 · ls 없음 ' + Object.values(map).filter(x => !x.ls).length + ' · 못 찾음 ' + miss.length); if (miss.length) console.log(miss.join('\n'));
